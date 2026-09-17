document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;
  document.querySelectorAll("nav a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
});
