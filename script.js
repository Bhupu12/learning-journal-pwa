document.addEventListener("DOMContentLoaded", () => {

  // Theme toggle button (works on pages that have it)
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // Live date/time (index.html only)
  const dateEl = document.getElementById("date-display");
  const timeEl = document.getElementById("time-display");

  function updateDateTime() {
    const now = new Date();
    if (dateEl) dateEl.textContent = now.toDateString();
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
  }

  if (dateEl || timeEl) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }

  // Collapsible project details
  document.querySelectorAll(".toggle-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const details = button.nextElementSibling;
      if (!details) return;

      const isHidden = window.getComputedStyle(details).display === "none";
      details.style.display = isHidden ? "block" : "none";
      button.textContent = isHidden ? "Hide Details" : "View Details";
    });
  });

});
