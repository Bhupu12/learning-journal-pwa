from flask import Flask, request, jsonify, render_template
import json, os
from datetime import datetime

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "reflections.json")


def load_reflections():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []


def save_reflections(reflections):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(reflections, f, indent=4, ensure_ascii=False)

@app.route("/")
def index():
    return render_template("form4.html")

@app.route("/api/reflections", methods=["GET"])
def get_reflections():
    reflections = load_reflections()
    return jsonify(reflections)

@app.route("/api/reflections", methods=["POST"])
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

@app.route("/api/reflections/<int:ref_id>", methods=["DELETE"])
def delete_reflection(ref_id):
    reflections = load_reflections()

    reflections = [r for r in reflections if r.get("id") != ref_id]

    # reassign IDs to keep order (your original logic, kept)
    for i, r in enumerate(reflections):
        r["id"] = i

    save_reflections(reflections)
    return jsonify({"message": "Deleted successfully"}), 200


@app.route("/api/reflections/<int:ref_id>", methods=["PUT"])
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


@app.route("/sw.js")
def service_worker():
    # your SW file lives in /static/js/sw.js
    return app.send_static_file("js/sw.js")


if __name__ == "__main__":
    app.run(debug=True)
