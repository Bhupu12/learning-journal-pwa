function getDate() {
  const d = new Date();
  document.getElementById("todayDate").innerHTML = d.toDateString();
}

/* ------------------------------
   Offline banner (extra PWA feature)
------------------------------ */
function updateOfflineBanner() {
  const banner = document.getElementById("offline-banner");
  if (!banner) return;
  banner.style.display = navigator.onLine ? "none" : "block";
}

window.addEventListener("online", updateOfflineBanner);
window.addEventListener("offline", updateOfflineBanner);

/* ------------------------------
   Escape user content so it doesn't break HTML
------------------------------ */
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ------------------------------
   POST new reflection
------------------------------ */
async function checkReflection() {
  const name = document.getElementById("fname").value;
  const reflection = document.getElementById("reflection").value;

  const entry = { name, reflection };

  try {
    const response = await fetch("/api/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry)
    });

    if (response.ok) {
      document.myForm.reset();
      await submitted();
    } else {
      alert("Error saving reflection.");
    }
  } catch (err) {
    alert("You appear to be offline. Your reflection could not be saved.");
    updateOfflineBanner();
  }

  return false; // prevent page reload
}

/* ------------------------------
   GET reflections and render
------------------------------ */
async function submitted() {
  const view = document.getElementById("viewAll");
  if (!view) return;

  view.innerHTML = "<i>Loading...</i>";

  try {
    const response = await fetch("/api/reflections");
    if (!response.ok) {
      view.innerHTML = "<i>Error loading reflections.</i>";
      return;
    }

    const reflections = await response.json();

    if (!Array.isArray(reflections) || reflections.length === 0) {
      view.innerHTML = "<i>No reflections found.</i>";
      return;
    }

    view.innerHTML = renderReflections(reflections);
  } catch (err) {
    view.innerHTML =
      "<i>Offline: reflections can't be loaded unless you opened the page once online (so the API can be cached).</i>";
    updateOfflineBanner();
  }
}

/* ------------------------------
   Render helper (also used by search)
------------------------------ */
function renderReflections(reflections) {
  let output = "";

  for (const r of reflections) {
    const safeName = escapeHtml(r.name ?? "Anonymous");
    const safeDate = escapeHtml(r.date ?? "");
    const safeReflection = escapeHtml(r.reflection ?? "");

    // Store values safely for editing (avoid broken quotes)
    output += `
      <div class="reflection-box"
           data-id="${r.id}"
           data-name="${safeName}"
           data-reflection="${safeReflection}">
        <b>${safeName}</b><br>
        <i>${safeDate}</i><br>
        <p>${safeReflection}</p>

        <button onclick="deleteReflection(${r.id})">Delete</button>
        <button onclick="showEditForm(${r.id})">Edit</button>
      </div>
      <hr>
    `;
  }

  return output;
}

/* ------------------------------
   DELETE reflection
------------------------------ */
async function deleteReflection(id) {
  try {
    const response = await fetch(`/api/reflections/${id}`, { method: "DELETE" });

    if (response.ok) {
      await submitted();
    } else {
      alert("Error deleting reflection.");
    }
  } catch (err) {
    alert("You appear to be offline. Delete cannot be done right now.");
    updateOfflineBanner();
  }
}

/* ------------------------------
   Show edit form
------------------------------ */
function showEditForm(id) {
  const box = document.querySelector(`.reflection-box[data-id="${id}"]`);
  if (!box) return;

  const name = box.dataset.name || "";
  const reflection = box.dataset.reflection || "";

  const view = document.getElementById("viewAll");
  view.innerHTML = `
    <div class="reflection-box">
      <b>Edit Reflection</b><br><br>

      <label>Name:</label><br>
      <input id="editName" value="${name}" style="width: 100%"><br><br>

      <label>Reflection:</label><br>
      <textarea id="editText" rows="4" style="width: 100%">${reflection}</textarea><br><br>

      <button onclick="submitEdit(${id})">Save</button>
      <button onclick="submitted()">Cancel</button>
    </div>
  `;
}

/* ------------------------------
   PUT update reflection
------------------------------ */
async function submitEdit(id) {
  const updatedName = document.getElementById("editName").value;
  const updatedReflection = document.getElementById("editText").value;

  try {
    const response = await fetch(`/api/reflections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: updatedName,
        reflection: updatedReflection
      })
    });

    if (response.ok) {
      await submitted();
    } else {
      alert("Error updating reflection.");
    }
  } catch (err) {
    alert("You appear to be offline. Update cannot be done right now.");
    updateOfflineBanner();
  }
}

/* ------------------------------
   SEARCH reflections
------------------------------ */
async function searchReflections() {
  const query = document.getElementById("searchBar").value.toLowerCase();

  try {
    const response = await fetch("/api/reflections");
    if (!response.ok) return;

    const reflections = await response.json();

    const filtered = reflections.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const ref = (r.reflection || "").toLowerCase();
      const date = (r.date || "").toLowerCase();
      return name.includes(query) || ref.includes(query) || date.includes(query);
    });

    const view = document.getElementById("viewAll");
    view.innerHTML =
      filtered.length === 0
        ? "<i>No matching reflections.</i>"
        : renderReflections(filtered);
  } catch (err) {
    alert("Offline: search may not work unless reflections were cached earlier.");
    updateOfflineBanner();
  }
}

/* ------------------------------
   Init
------------------------------ */
function init() {
  updateOfflineBanner();
  getDate();
  submitted();
}
