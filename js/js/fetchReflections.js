
document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("json-entries");
  const count = document.getElementById("entry-count");
  const status = document.getElementById("reflections-status"); 

  async function loadReflections() {
    if (status) status.textContent = "Loading reflections...";
    try {
      const res = await fetch("backend/reflections.json", {cache: "no-store"});
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const data = await res.json();
      list.innerHTML = "";
      data.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${item.date}</strong> — ${escapeHtml(item.text)}`;
        list.appendChild(li);
      });
      count.textContent = data.length;
      if (status) status.textContent = "";
    } catch (err) {
      console.error("Failed to load reflections:", err);
      list.innerHTML = "<li>⚠ Failed to load reflections (check server / path).</li>";
      count.textContent = 0;
      if (status) status.textContent = "Failed to load reflections";
    }
  }

  
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  loadReflections();

  
  window.reloadReflections = loadReflections;
});
