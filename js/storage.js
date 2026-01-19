document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("journal-form");
  const input = document.getElementById("journal-input");
  const entriesContainer = document.getElementById("saved-entries");
  const clearBtn = document.getElementById("clear-entries");
  const copyBtn = document.getElementById("copy-entry");
  const searchInput = document.getElementById("search-input");
  const entryCountEl = document.getElementById("entry-count");
  const wordCountEl = document.getElementById("word-count");

  // Use objects so we can store time + text (looks more professional)
  let saved = JSON.parse(localStorage.getItem("journalEntries")) || [];

  // If old format is string[], convert to object[]
  if (saved.length && typeof saved[0] === "string") {
    saved = saved.map(text => ({ text, createdAt: new Date().toISOString() }));
    localStorage.setItem("journalEntries", JSON.stringify(saved));
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(); // local time
    } catch {
      return "";
    }
  }

  function updateStats() {
    entryCountEl.textContent = `Entries: ${saved.length}`;

    const words = input.value.trim().split(/\s+/).filter(Boolean).length;
    wordCountEl.textContent = `Words: ${words}`;
  }

  function renderEntries(filterText = "") {
    entriesContainer.innerHTML = "";

    const filtered = saved.filter(e =>
      e.text.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      entriesContainer.innerHTML = `
        <div class="empty-state">
          <h3>No entries found</h3>
          <p>Write a reflection and click <strong>Save Entry</strong>.</p>
        </div>
      `;
      return;
    }

    filtered
      .slice()
      .reverse()
      .forEach((entryObj, reverseIndex) => {
        // Because we reversed it for display, we need the real index for delete
        const realIndex = saved.length - 1 - reverseIndex;

        const card = document.createElement("div");
        card.className = "entry-card";

        card.innerHTML = `
          <div class="entry-meta">
            <span class="entry-date">${formatDate(entryObj.createdAt)}</span>
          </div>
          <p class="entry-text"></p>
          <div class="entry-actions">
            <button class="btn small" data-action="copy">📋 Copy</button>
            <button class="btn small danger" data-action="delete">❌ Delete</button>
          </div>
        `;

        card.querySelector(".entry-text").textContent = entryObj.text;

        card.addEventListener("click", async (e) => {
          const action = e.target?.dataset?.action;
          if (!action) return;

          if (action === "delete") {
            if (confirm("Delete this entry?")) {
              saved.splice(realIndex, 1);
              localStorage.setItem("journalEntries", JSON.stringify(saved));
              renderEntries(searchInput?.value || "");
              updateStats();
            }
          }

          if (action === "copy") {
            try {
              await navigator.clipboard.writeText(entryObj.text);
              alert("Entry copied!");
            } catch {
              alert("Copy failed. Please copy manually.");
            }
          }
        });

        entriesContainer.appendChild(card);
      });
  }

  // Save entry
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = input.value.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount < 10) {
      alert("Please write at least 10 words before saving your entry.");
      return;
    }

    saved.push({ text, createdAt: new Date().toISOString() });
    localStorage.setItem("journalEntries", JSON.stringify(saved));

    input.value = "";
    updateStats();
    renderEntries(searchInput?.value || "");
  });

  // Clear all
  clearBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all saved entries?")) {
      localStorage.removeItem("journalEntries");
      saved = [];
      renderEntries(searchInput?.value || "");
      updateStats();
    }
  });

  // Copy current textarea entry
  copyBtn?.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) {
      alert("Write something first, then copy.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("Text copied!");
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  });

  // Search
  searchInput?.addEventListener("input", () => {
    renderEntries(searchInput.value);
  });

  // Live word count
  input?.addEventListener("input", updateStats);

  // Theme
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") document.body.classList.add("dark-mode");

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", mode);
  });

  // Initial
  updateStats();
  renderEntries();
});
