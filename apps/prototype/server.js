// Minimal zero-dependency HTTP server (Node's built-in http module) exposing
// the API the frontend pages use, plus static file serving for public/.
// No framework, no build step: `node server.js` is the entire deployment.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { explainBeliefOrBehavior } from "./pipeline.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

function serveStatic(req, res, pathname) {
  const rel = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(PUBLIC_DIR, rel);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

// --- API handlers ---------------------------------------------------------

function apiSelf(req, res) {
  const beliefs = db.prepare(`SELECT key, statement, strength, updated_at FROM beliefs`).all();
  const tendencies = db
    .prepare(`SELECT key, value, updated_at FROM behavioral_tendencies`)
    .all();
  const version = db
    .prepare(`SELECT MAX(version_number) AS v FROM self_model_versions`)
    .get();
  sendJson(res, 200, { version: version?.v ?? 0, beliefs, tendencies });
}

function apiHistory(req, res) {
  const episodes = db.prepare(`SELECT * FROM episodes ORDER BY ts ASC`).all();
  const events = db.prepare(`SELECT * FROM events ORDER BY ts ASC`).all();
  const changeEvents = db.prepare(`SELECT * FROM change_events ORDER BY ts ASC`).all();
  const byEpisode = {};
  for (const ep of episodes) byEpisode[ep.id] = { ...ep, events: [] };
  for (const ev of events) {
    if (ev.episode_id && byEpisode[ev.episode_id]) byEpisode[ev.episode_id].events.push(ev);
  }
  sendJson(res, 200, {
    episodes: Object.values(byEpisode),
    changeEvents: changeEvents.map((ce) => ({
      ...ce,
      before: JSON.parse(ce.before_json),
      after: JSON.parse(ce.after_json),
      provenance: JSON.parse(ce.provenance_json),
    })),
  });
}

function apiExplain(req, res, query) {
  const key = query.get("key");
  if (!key) return sendJson(res, 400, { error: "missing ?key=" });
  const result = explainBeliefOrBehavior(key);
  if (!result.found) return sendJson(res, 404, { error: `no change history for "${key}"` });
  sendJson(res, 200, result);
}

function apiDebugTrace(req, res) {
  sendJson(res, 200, {
    events: db.prepare(`SELECT * FROM events ORDER BY ts ASC`).all(),
    episodes: db.prepare(`SELECT * FROM episodes ORDER BY ts ASC`).all(),
    memories: db.prepare(`SELECT * FROM memories ORDER BY ts ASC`).all(),
    interpretations: db.prepare(`SELECT * FROM interpretations ORDER BY ts ASC`).all(),
    beliefs: db.prepare(`SELECT * FROM beliefs`).all(),
    behavioral_tendencies: db.prepare(`SELECT * FROM behavioral_tendencies`).all(),
    change_events: db.prepare(`SELECT * FROM change_events ORDER BY ts ASC`).all(),
    self_model_versions: db.prepare(`SELECT * FROM self_model_versions ORDER BY ts ASC`).all(),
  });
}

// Deliberately simple, keyword-matched "chat" -- this is a prototype
// demonstrating the causal-chain milestone, not a real conversational
// agent. A real system would use an LLM here; this stays dependency-free.
function apiAsk(req, res, body) {
  const question = (body.question || "").toLowerCase();
  const asksWhyDifferent =
    question.includes("为什么") &&
    (question.includes("提醒") || question.includes("不一样") || question.includes("不同"));

  if (asksWhyDifferent) {
    const result = explainBeliefOrBehavior("reminder_frequency");
    if (result.found) {
      return sendJson(res, 200, { answer: result.lines.join("\n") });
    }
  }
  sendJson(res, 200, {
    answer: "（这是一个演示原型，只能回答和 reminder_frequency 这条行为变化相关的“为什么”问题。）",
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/self") return apiSelf(req, res);
  if (url.pathname === "/api/history") return apiHistory(req, res);
  if (url.pathname === "/api/explain") return apiExplain(req, res, url.searchParams);
  if (url.pathname === "/api/debug/trace") return apiDebugTrace(req, res);

  if (url.pathname === "/api/ask" && req.method === "POST") {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      let body = {};
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        // ignore malformed body, fall through with empty object
      }
      apiAsk(req, res, body);
    });
    return;
  }

  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`Persistent Self prototype running at http://localhost:${PORT}`);
});
