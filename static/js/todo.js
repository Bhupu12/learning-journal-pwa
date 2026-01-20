function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateOfflineBanner() {
  const banner = document.getElementById("offline-banner");
  if (!banner) return;
  banner.style.display = navigator.onLine ? "none" : "block";
}

window.addEventListener("offline", updateOfflineBanner);
window.addEventListener("online", updateOfflineBanner);

async function loadTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "<i>Loading...</i>";

  try {
    const res = await fetch("/api/tasks");
    if (!res.ok) throw new Error("Failed");

    const tasks = await res.json();

    if (!Array.isArray(tasks) || tasks.length === 0) {
      taskList.innerHTML = "<i>No tasks yet. Add one above.</i>";
      return;
    }

    let output = "";
    for (const t of tasks) {
      output += `
        <div class="reflection-box">
          <b style="text-decoration:${t.completed ? "line-through" : "none"}">
            ${escapeHtml(t.title)}
          </b><br>
          <i>Due: ${escapeHtml(t.due || "No date")} | Priority: ${escapeHtml(t.priority || "Medium")}</i><br><br>

          <button onclick="toggleTask(${t.id}, ${!t.completed})">
            ${t.completed ? "Mark Incomplete" : "Mark Completed"}
          </button>

          <button onclick="removeTask(${t.id})">Delete</button>
        </div>
        <hr>
      `;
    }

    taskList.innerHTML = output;
  } catch (e) {
    taskList.innerHTML = "<i>Offline: tasks can only be shown if cached earlier.</i>";
    updateOfflineBanner();
  }
}

async function addTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const due = document.getElementById("taskDue").value;
  const priority = document.getElementById("taskPriority").value;

  if (!title) {
    alert("Please enter a task title.");
    return false;
  }

  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, due, priority })
    });

    if (!res.ok) {
      alert("Could not save task.");
      return false;
    }

    document.taskForm.reset();
    loadTasks();
  } catch (e) {
    alert("You appear to be offline. Task could not be saved.");
    updateOfflineBanner();
  }

  return false;
}

async function toggleTask(id, completed) {
  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });

    if (res.ok) loadTasks();
  } catch (e) {
    alert("Offline: update failed.");
    updateOfflineBanner();
  }
}

async function removeTask(id) {
  try {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) loadTasks();
  } catch (e) {
    alert("Offline: delete failed.");
    updateOfflineBanner();
  }
}

function initTodo() {
  updateOfflineBanner();
  loadTasks();
}
