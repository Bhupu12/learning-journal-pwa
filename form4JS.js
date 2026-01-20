function getDate() {
  const d = new Date();
  document.getElementById("todayDate").innerHTML = d.toDateString();
}

/* Escape HTML to prevent breaking layout/injection */
function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatReflectionHTML(text = "") {
  const safe = escapeHTML(text).replaceAll("\r\n", "\n");
  return `<p>${safe.replaceAll("\n", "<br>")}</p>`;
}

function encodeForAttr(str = "") {
  return encodeURIComponent(str);
}
function decodeFromAttr(str = "") {
  return decodeURIComponent(str);
}

async function checkReflection() {
  let name = document.getElementById("fname").value;
  let reflection = document.getElementById("reflection").value;

  let entry = { name, reflection };

  let response = await fetch("/api/reflections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry)
  });

  if (response.ok) {
    document.myForm.reset();
    submitted();
  }
  return false;
}

async function submitted() {
  let response = await fetch("/api/reflections");
  let output = "";

  if (response.ok) {
    let reflections = await response.json();

    for (let r of reflections) {
      const safeName = escapeHTML(r.name ?? "");
      const safeDate = escapeHTML(r.date ?? "");
      const encodedReflection = encodeForAttr(r.reflection ?? "");

      output += `
        <div class="reflection-box">
          <b>${safeName}</b><br>
          <i>${safeDate}</i><br>
          ${formatReflectionHTML(r.reflection ?? "")}

          <button onclick="deleteReflection(${r.id})">Delete</button>
          <button onclick="showEditForm(${r.id}, '${safeName}', '${encodedReflection}')">Edit</button>
        </div>
        <hr>
      `;
    }

    if (reflections.length === 0) {
      output = "<i>No reflections found.</i>";
    }
  } else {
    output = "<i>Error loading reflections.</i>";
  }

  document.getElementById("viewAll").innerHTML = output;
}

async function deleteReflection(id) {
  let response = await fetch(`/api/reflections/${id}`, {
    method: "DELETE"
  });

  if (response.ok) {
    submitted();
  } else {
    alert("Error deleting reflection");
  }
}

function showEditForm(id, name, encodedReflection) {
  const reflection = decodeFromAttr(encodedReflection);

  const newContent = `
    <div class="reflection-box">
      <b>Edit Reflection</b><br>
      <label>Name:</label><br>
      <input id="editName" value="${name}" style="width: 100%"><br><br>

      <label>Reflection:</label><br>
      <textarea id="editText" rows="6" style="width: 100%">${escapeHTML(reflection)}</textarea><br><br>

      <button onclick="submitEdit(${id})">Save</button>
      <button onclick="submitted()">Cancel</button>
    </div>
  `;

  document.getElementById("viewAll").innerHTML = newContent;
}

async function submitEdit(id) {
  let updatedName = document.getElementById("editName").value;
  let updatedReflection = document.getElementById("editText").value;

  let response = await fetch(`/api/reflections/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: updatedName,
      reflection: updatedReflection
    })
  });

  if (response.ok) {
    submitted();
  } else {
    alert("Error updating reflection");
  }
}

async function searchReflections() {
  let query = document.getElementById("searchBar").value.toLowerCase();

  let response = await fetch("/api/reflections");
  if (!response.ok) return;

  let reflections = await response.json();
  let filtered = reflections.filter(r =>
    (r.name ?? "").toLowerCase().includes(query) ||
    (r.reflection ?? "").toLowerCase().includes(query) ||
    (r.date ?? "").toLowerCase().includes(query)
  );

  let output = "";
  for (let r of filtered) {
    const safeName = escapeHTML(r.name ?? "");
    const safeDate = escapeHTML(r.date ?? "");
    const encodedReflection = encodeForAttr(r.reflection ?? "");

    output += `
      <div class="reflection-box">
        <b>${safeName}</b><br>
        <i>${safeDate}</i><br>
        ${formatReflectionHTML(r.reflection ?? "")}

        <button onclick="deleteReflection(${r.id})">Delete</button>
        <button onclick="showEditForm(${r.id}, '${safeName}', '${encodedReflection}')">Edit</button>
      </div>
      <hr>
    `;
  }

  if (filtered.length === 0) {
    output = "<i>No matching reflections.</i>";
  }

  document.getElementById("viewAll").innerHTML = output;
}

window.addEventListener("offline", () => {
  document.getElementById("offline-banner").style.display = "block";
});

window.addEventListener("online", () => {
  document.getElementById("offline-banner").style.display = "none";
});

function init() {
  getDate();
  submitted();
}
