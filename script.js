document.addEventListener("DOMContentLoaded", () => {
  // 1) Reusable nav HTML
  const navHTML = `
    <nav class="navbar">
      <a href="index.html" class="logo">My Journal</a>
      <ul class="nav-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="journal.html">Journal</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
      <button id="theme-toggle" aria-label="Toggle theme">🌓</button>
    </nav>
  `;
  const navContainer = document.getElementById("nav-container");
  if (navContainer) navContainer.innerHTML = navHTML;

  // 2) Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // 3) Live date/time (index.html)
  const dateEl = document.getElementById("date-display");
  const timeEl = document.getElementById("time-display");
  function updateDateTime() {
    const now = new Date();
    if (dateEl) dateEl.textContent = now.toLocaleDateString();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
  }
  if (dateEl || timeEl) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }

  // 4) Collapsible project details
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const details = btn.nextElementSibling;
      if (!details) return;
      const isHidden = getComputedStyle(details).display === "none";
      details.style.display = isHidden ? "block" : "none";
      btn.textContent = isHidden ? "Hide Details" : "View Details";
    });
  });

  // 5) Journal form validation: min 10 words
  const journalForm = document.getElementById("journal-form");
  if (journalForm) {
    journalForm.addEventListener("submit", (e) => {
      const input = document.getElementById("journal-input");
      const words = input.value.trim().split(/\s+/).filter(Boolean);
      if (words.length < 10) {
        alert("Please write at least 10 words in your journal entry.");
        e.preventDefault();
      } else {
        // Add new entry to output
        const output = document.getElementById("journal-output");
        const entry = document.createElement("p");
        entry.textContent = input.value;
        output.appendChild(entry);
        input.value = "";
      }
    });
  }
});
