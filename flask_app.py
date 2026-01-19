from flask import Flask, request, jsonify, render_template
import json, os
from datetime import datetime

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "reflections.json")
TASKS_FILE = os.path.join(BASE_DIR, "tasks.json")   # ✅ NEW


# ------------------------------
# Load JSON reflections
# ------------------------------
def load_reflections():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []


# ------------------------------
# Save reflections to JSON
# ------------------------------
def save_reflections(reflections):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(reflections, f, indent=4, ensure_ascii=False)


# ------------------------------
# Load JSON tasks  ✅ NEW
# ------------------------------
def load_tasks():
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []


# ------------------------------
# Save tasks to JSON ✅ NEW
# ------------------------------
def save_tasks(tasks):
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=4, ensure_ascii=False)


# ------------------------------
# Home Page (Reflective Journal)
# ------------------------------
@app.route("/")
def index():
    return render_template("form4.html")


# ------------------------------
# To-Do Page ✅ NEW
# ------------------------------
@app.route("/todo")
def todo_page():
    return render_template("todo.html")


# ------------------------------
# GET reflections
# ------------------------------
@app.route("https://bhupendrathapa.pythonanywhere.com/api/reflections", methods=["GET"])
def get_reflections():
    reflections = load_reflections()
    return jsonify(reflections)


# ------------------------------
# POST new reflection
# ------------------------------
@app.route("https://bhupendrathapa.pythonanywhere.com/api/reflections", methods=["POST"])
def add_reflection():
    data = request.get_json() or {}
    reflections = load_reflections()

    # safer unique incremental ID (avoids collision if deletes happened)
    new_id = max([r.get("id", -1) for r in reflections], default=-1) + 1

    new_reflection = {
        "id": new_id,
        "name": data.get("name", "Anonymous"),
        "date": datetime.now().strftime("%a %b %d %Y"),
        "reflection": data.get("reflection", "")
    }

    reflections.append(new_reflection)
    save_reflections(reflections)

    return jsonify(new_reflection), 201


# ------------------------------
# DELETE reflection
# ------------------------------
@app.route("https://bhupendrathapa.pythonanywhere.com/api/reflections/<int:ref_id>", methods=["DELETE"])
def delete_reflection(ref_id):
    reflections = load_reflections()
    reflections = [r for r in reflections if r.get("id") != ref_id]

    # reassign IDs to keep order
    for i, r in enumerate(reflections):
        r["id"] = i

    save_reflections(reflections)
    return jsonify({"message": "Deleted successfully"}), 200


# ------------------------------
# EDIT (PUT) reflection
# ------------------------------
@app.route("https://bhupendrathapa.pythonanywhere.com/api/reflections/<int:ref_id>", methods=["PUT"])
def edit_reflection(ref_id):
    data = request.get_json() or {}
    reflections = load_reflections()

    for r in reflections:
        if r.get("id") == ref_id:
            r["name"] = data.get("name", r.get("name", "Anonymous"))
            r["reflection"] = data.get("reflection", r.get("reflection", ""))
            break

    save_reflections(reflections)
    return jsonify({"message": "Updated successfully"}), 200


# ==========================================================
# ✅ TASKS API (Mini Project - Study Planner / To-Do)
# ==========================================================

# GET tasks
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    tasks = load_tasks()
    return jsonify(tasks)


# POST new task
@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json() or {}
    tasks = load_tasks()

    new_id = max([t.get("id", -1) for t in tasks], default=-1) + 1

    new_task = {
        "id": new_id,
        "title": (data.get("title") or "").strip(),
        "due": (data.get("due") or "").strip(),             # YYYY-MM-DD
        "priority": data.get("priority", "Medium"),         # Low/Medium/High
        "completed": False,
        "created": datetime.now().strftime("%a %b %d %Y %H:%M")
    }

    # basic validation
    if not new_task["title"]:
        return jsonify({"error": "Task title is required"}), 400

    tasks.append(new_task)
    save_tasks(tasks)
    return jsonify(new_task), 201


# PUT update task (toggle complete or edit)
@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json() or {}
    tasks = load_tasks()

    for t in tasks:
        if t.get("id") == task_id:
            if "completed" in data:
                t["completed"] = bool(data["completed"])
            if "title" in data:
                t["title"] = (data["title"] or "").strip()
            if "due" in data:
                t["due"] = (data["due"] or "").strip()
            if "priority" in data:
                t["priority"] = data["priority"]
            break

    save_tasks(tasks)
    return jsonify({"message": "Task updated"}), 200


# DELETE task
@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks = load_tasks()
    tasks = [t for t in tasks if t.get("id") != task_id]

    # reassign IDs
    for i, t in enumerate(tasks):
        t["id"] = i

    save_tasks(tasks)
    return jsonify({"message": "Task deleted"}), 200


# ------------------------------
# Service Worker at root scope (Lab 7 PWA)
# ------------------------------
@app.route("/sw.js")
def service_worker():
    return app.send_static_file("js/sw.js")


if __name__ == "__main__":
    app.run(debug=True)
