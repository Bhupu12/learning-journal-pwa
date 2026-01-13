
import json
from datetime import datetime
import os

FILE = os.path.join(os.path.dirname(__file__), "reflections.json")

def load_data():
    try:
        with open(FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data, list):
                return []
            return data
    except FileNotFoundError:
        return []
    except json.JSONDecodeError:
        return []

def save_data(data):
    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("Enter your reflection (single line). Press Enter to submit:")
    text = input().strip()
    if not text:
        print("No text entered. Exiting.")
        return

    entry = {
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "text": text
    }

    data = load_data()
    data.append(entry)
    save_data(data)
    print("Reflection saved to", FILE)

if __name__ == "__main__":
    main()
