document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("journal-form");
  const input = document.getElementById("journal-input");
  const list = document.getElementById("saved-entries");
  const clearBtn = document.getElementById("clear-entries");

  let saved = JSON.parse(localStorage.getItem("journalEntries")) || [];
  renderEntries();

  function renderEntries() {
    list.innerHTML = "";
    saved.forEach((entry, index) => {
      const li = document.createElement("li");
      li.textContent = entry;
      li.style.marginBottom = "8px";

      const delBtn = document.createElement("button");
      delBtn.textContent = "❌ Delete";
      delBtn.style.marginLeft = "10px";
      delBtn.addEventListener("click", () => deleteEntry(index));

      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = input.value.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length; 

  if (wordCount < 10) {
    if (!form.dataset.alertShown) { 
      alert("Please write at least 10 words before saving your entry.");
      form.dataset.alertShown = "true"; 
      setTimeout(() => delete form.dataset.alertShown, 1000); 
    }
    return;
  }

  
  saved.push(text);
  localStorage.setItem("journalEntries", JSON.stringify(saved));

 
  renderEntries();
  input.value = "";
});

  
  function deleteEntry(index) {
    if (confirm("Delete this entry?")) {
      saved.splice(index, 1);
      localStorage.setItem("journalEntries", JSON.stringify(saved));
      renderEntries();
    }
  }

  clearBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all saved entries?")) {
      localStorage.removeItem("journalEntries");
      saved = [];
      renderEntries();
    }
  });

  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") document.body.classList.add("dark-mode");

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", mode);
  });
});
