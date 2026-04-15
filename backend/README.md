# 📚 Smart Study Planner
### Class 12 Computer Science Project | Python + Flask + SQLite

---

## 🗂️ Project Structure

```
smart_study_planner/
│
├── app.py               ← Main Flask app (all routes, classes, logic)
├── database.db          ← SQLite DB (auto-created on first run)
├── requirements.txt     ← Python packages needed
│
├── templates/
│   ├── index.html       ← Landing page
│   ├── login.html       ← Login page
│   ├── signup.html      ← Signup page
│   └── dashboard.html   ← Main dashboard
│
└── static/
    └── style.css        ← All styles
```

---

## ⚙️ How to Run (Step-by-Step)

### Step 1 — Make sure Python is installed
Open your terminal / command prompt and type:
```bash
python --version
```
You should see Python 3.8 or higher.

---

### Step 2 — Navigate to the project folder
```bash
cd path/to/smart_study_planner
```
Example on Windows:
```bash
cd C:\Users\YourName\Desktop\smart_study_planner
```

---

### Step 3 — Create a virtual environment (recommended)
```bash
python -m venv venv
```
Activate it:
- **Windows:**  `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

---

### Step 4 — Install required packages
```bash
pip install -r requirements.txt
```
This installs:
- `Flask`      — web framework
- `matplotlib` — graph generation

---

### Step 5 — Run the application
```bash
python app.py
```
You should see:
```
✅  Database initialised.
🚀  Starting Smart Study Planner at http://127.0.0.1:5000
```

---

### Step 6 — Open in your browser
Go to: **http://127.0.0.1:5000**

1. Click **Sign Up** and create an account
2. **Login** with your credentials
3. Add subjects on the Dashboard
4. Log your daily study sessions
5. View the chart and progress summary

---

## 🐍 Python Concepts Used

| Concept              | Where                                              |
|----------------------|----------------------------------------------------|
| Classes & OOP        | `User`, `Subject`, `StudySession` classes in app.py|
| Functions            | `get_db_connection()`, `init_db()`, `generate_bar_chart()` |
| Dictionaries / Rows  | SQLite `Row` objects used like dicts               |
| Exception Handling   | `try-except` blocks in all route handlers          |
| File / DB Operations | SQLite CRUD via `sqlite3` module                   |
| Lists                | Subjects list, sessions list for template          |
| Modules              | `flask`, `sqlite3`, `matplotlib`, `io`, `base64`   |

---

## 🔐 Features

- ✅ User Signup / Login / Logout
- ✅ Session management with Flask `session`
- ✅ Add & delete subjects with daily goals
- ✅ Log study sessions (hours, date, notes)
- ✅ Dashboard with stat cards
- ✅ Progress table with status badges
- ✅ Matplotlib bar chart embedded in page
- ✅ Exception handling for all inputs
- ✅ Clean responsive UI

---

## 🛑 Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError: flask` | Run `pip install flask` |
| `ModuleNotFoundError: matplotlib` | Run `pip install matplotlib` |
| Port already in use | Change port: `app.run(port=5001)` in app.py |
| `database.db` not found | It auto-creates when you run `python app.py` |

---

*Built with ❤️ using Python, Flask, SQLite, and Matplotlib*
