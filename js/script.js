document.addEventListener("DOMContentLoaded", () => {
  
  const nav = `
    <nav class="navbar">
      <a href="index.html" class="logo">My Journal</a>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="journal.html">Journal</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
      <button id="theme-toggle">🌓 Toggle Theme</button>
    </nav>
  `;
  const navContainer = document.getElementById("nav-container");
  if (navContainer) navContainer.innerHTML = nav;

  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  const dateEl = document.getElementById("date-display");
  const timeEl = document.getElementById("time-display");

  function updateDateTime() {
    const now = new Date();
    if (dateEl) dateEl.textContent = now.toDateString();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);

  document.querySelectorAll(".toggle-btn").forEach(button => {
    button.addEventListener("click", () => {
      const details = button.nextElementSibling;
      if (details) {
        details.style.display = details.style.display === "none" ? "block" : "none";
      }
    });
  });

  const journalForm = document.getElementById("journal-form");
  if (journalForm) {
    journalForm.addEventListener("submit", (e) => {
      const input = document.getElementById("journal-input");
      const words = input.value.trim().split(/\s+/).filter(Boolean);
      if (words.length < 10) {
        alert("Please write at least 10 words in your journal entry.");
        e.preventDefault();
      }
    });
  }
});
