# ============================================================
#  Smart Study Planner - app.py
#  Class 12 Computer Science Project
#  Main application file - all routes and logic live here
# ============================================================
from flask_cors import CORS
import os
import io
import base64
import sqlite3
from datetime import datetime, date
import matplotlib
matplotlib.use('Agg')          # Non-interactive backend (no display needed)
import matplotlib.pyplot as plt
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask import send_from_directory
# ── Flask app setup ──────────────────────────────────────────
app = Flask(__name__)
app.secret_key = 'study_planner_secret_2024'   # Used to sign session cookies

CORS(app)
DATABASE = 'database.db'   # SQLite file will be created here


# ============================================================
# DATABASE HELPER FUNCTIONS
# ============================================================

def get_db_connection():
    """Open a new SQLite connection and return it."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row   # Rows behave like dicts
    return conn


@app.route("/api/sessions", methods=["GET"])
def get_sessions():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subjectId INTEGER,
            hours REAL,
            date TEXT,
            notes TEXT
        )
    """)

    cursor.execute("SELECT id, subjectId, hours, date, notes FROM sessions")
    rows = cursor.fetchall()
    conn.close()

    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "subjectId": row[1],
            "hours": row[2],
            "date": row[3],
            "notes": row[4]
        })

    return jsonify(data)

@app.route("/")
def home():
    return send_from_directory("static", "index.html")

@app.route("/api/sessions", methods=["POST"])
def add_session():
    data = request.get_json(force=True)

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subjectId INTEGER,
            hours REAL,
            date TEXT,
            notes TEXT
        )
    """)

    cursor.execute(
        "INSERT INTO sessions (subjectId, hours, date, notes) VALUES (?, ?, ?, ?)",
        (data["subjectId"], data["hours"], data["date"], data["notes"])
    )

    conn.commit()
    conn.close()

    return {"success": True}

@app.route("/api/subjects", methods=["POST"])
def add_subject():
    data = request.get_json(force=True)
    print("RECEIVED:", data)

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            goal REAL,
            color TEXT
        )
    """)

    cursor.execute(
        "INSERT INTO subjects (name, goal, color) VALUES (?, ?, ?)",
        (data["name"], float(data["goal"]), data["color"])
    )

    conn.commit()

    cursor.execute("SELECT * FROM subjects")
    print("ALL SUBJECTS:", cursor.fetchall())

    conn.close()

    return {"success": True}

@app.route("/api/subjects")
def get_subjects():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            goal REAL,
            color TEXT
        )
    """)

    cursor.execute("SELECT id, name, goal, color FROM subjects")
    rows = cursor.fetchall()

    conn.close()

    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "name": row[1],
            "goal": row[2],
            "color": row[3]
        })

    return jsonify(data)


# @app.route("/api/subjects")
# def get_subjects():
#     data = [
#         {"id": 1, "name": "Maths", "goal": 3, "color": "#6C63FF"},
#         {"id": 2, "name": "Physics", "goal": 2, "color": "#22C984"}
#     ]
#     return data

def init_db():
    """Create all tables if they don't exist yet."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # ── Users table ──────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT    UNIQUE NOT NULL,
            password TEXT    NOT NULL,
            email    TEXT    NOT NULL
        )
    ''')

    # ── Subjects table ───────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subjects (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL,
            name        TEXT    NOT NULL,
            daily_goal  REAL    DEFAULT 2.0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')

    # ── Study sessions table ─────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS study_sessions (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            subject_id INTEGER NOT NULL,
            hours      REAL    NOT NULL,
            study_date TEXT    NOT NULL,
            notes      TEXT,
            FOREIGN KEY (user_id)    REFERENCES users(id),
            FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )
    ''')

    conn.commit()
    conn.close()


# ============================================================
# CLASSES  (Python OOP concept)
# ============================================================

class User:
    """Represents a registered user."""

    def __init__(self, username, password, email):
        self.username = username
        self.password = password
        self.email    = email

    def save(self):
        """Insert this user into the database."""
        conn = get_db_connection()
        try:
            conn.execute(
                'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                (self.username, self.password, self.email)
            )
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            # username already exists
            return False
        finally:
            conn.close()

    @staticmethod
    def find_by_username(username):
        """Return a user row or None."""
        conn = get_db_connection()
        user = conn.execute(
            'SELECT * FROM users WHERE username = ?', (username,)
        ).fetchone()
        conn.close()
        return user


class Subject:
    """Represents a subject added by a user."""

    def __init__(self, user_id, name, daily_goal):
        self.user_id    = user_id
        self.name       = name
        self.daily_goal = daily_goal

    def save(self):
        """Insert this subject into the database."""
        conn = get_db_connection()
        conn.execute(
            'INSERT INTO subjects (user_id, name, daily_goal) VALUES (?, ?, ?)',
            (self.user_id, self.name, self.daily_goal)
        )
        conn.commit()
        conn.close()

    @staticmethod
    def get_all(user_id):
        """Return all subjects for a given user."""
        conn = get_db_connection()
        subjects = conn.execute(
            'SELECT * FROM subjects WHERE user_id = ?', (user_id,)
        ).fetchall()
        conn.close()
        return subjects


class StudySession:
    """Represents a single study session log entry."""

    def __init__(self, user_id, subject_id, hours, study_date, notes=''):
        self.user_id    = user_id
        self.subject_id = subject_id
        self.hours      = hours
        self.study_date = study_date
        self.notes      = notes

    def save(self):
        """Insert this session into the database."""
        conn = get_db_connection()
        conn.execute(
            '''INSERT INTO study_sessions
               (user_id, subject_id, hours, study_date, notes)
               VALUES (?, ?, ?, ?, ?)''',
            (self.user_id, self.subject_id,
             self.hours, self.study_date, self.notes)
        )
        conn.commit()
        conn.close()


# ============================================================
# GRAPH GENERATION  (Matplotlib)
# ============================================================

def generate_bar_chart(subjects, hours_list):
    """
    Create a bar chart and return it as a base64 PNG string
    so it can be embedded directly in HTML.
    """
    fig, ax = plt.subplots(figsize=(8, 4))

    colors = ['#4f46e5', '#7c3aed', '#2563eb',
              '#0891b2', '#059669', '#d97706', '#dc2626']

    bars = ax.bar(subjects, hours_list,
                  color=colors[:len(subjects)],
                  width=0.5, zorder=3)

    # Add value labels on top of each bar
    for bar, val in zip(bars, hours_list):
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + 0.05,
                f'{val:.1f}h',
                ha='center', va='bottom', fontsize=10, fontweight='bold')

    ax.set_xlabel('Subjects', fontsize=11)
    ax.set_ylabel('Total Hours Studied', fontsize=11)
    ax.set_title('Study Hours per Subject', fontsize=13, fontweight='bold', pad=15)
    ax.grid(axis='y', linestyle='--', alpha=0.6, zorder=0)
    ax.set_facecolor('#f8fafc')
    fig.patch.set_facecolor('#f8fafc')
    plt.xticks(rotation=20, ha='right')
    plt.tight_layout()

    # Save to in-memory bytes buffer → base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=110)
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)   # Free memory
    return img_b64


# ============================================================
# ROUTES  (Flask URL handlers)
# ============================================================

# ── Home ─────────────────────────────────────────────────────
@app.route('/')
def index():
    """Landing page – redirect to dashboard if logged in."""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')


# ── Signup ───────────────────────────────────────────────────
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        try:
            username = request.form['username'].strip()
            password = request.form['password'].strip()
            email    = request.form['email'].strip()

            # Basic validation
            if not username or not password or not email:
                flash('All fields are required!', 'error')
                return render_template('signup.html')

            if len(password) < 4:
                flash('Password must be at least 4 characters.', 'error')
                return render_template('signup.html')

            new_user = User(username, password, email)
            if new_user.save():
                flash('Account created! Please log in.', 'success')
                return redirect(url_for('login'))
            else:
                flash('Username already taken. Try another.', 'error')

        except Exception as e:
            flash(f'Signup error: {str(e)}', 'error')

    return render_template('signup.html')


# ── Login ────────────────────────────────────────────────────
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            username = request.form['username'].strip()
            password = request.form['password'].strip()

            if not username or not password:
                flash('Please enter username and password.', 'error')
                return render_template('login.html')

            user = User.find_by_username(username)

            if user and user['password'] == password:
                # Store user info in session
                session['user_id']   = user['id']
                session['username']  = user['username']
                flash(f'Welcome back, {username}!', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Invalid username or password.', 'error')

        except Exception as e:
            flash(f'Login error: {str(e)}', 'error')

    return render_template('login.html')


# ── Logout ───────────────────────────────────────────────────
@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))


# ── Dashboard ────────────────────────────────────────────────
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please log in first.', 'error')
        return redirect(url_for('login'))

    user_id  = session['user_id']
    conn     = get_db_connection()

    # Fetch subjects
    subjects = conn.execute(
        'SELECT * FROM subjects WHERE user_id = ?', (user_id,)
    ).fetchall()

    # Fetch total hours per subject (for graph + table)
    summary = conn.execute(
        '''SELECT s.name, COALESCE(SUM(ss.hours), 0) AS total_hours,
                  sub.daily_goal
           FROM subjects sub
           LEFT JOIN study_sessions ss
                  ON ss.subject_id = sub.id AND ss.user_id = ?
           JOIN subjects s ON s.id = sub.id
           WHERE sub.user_id = ?
           GROUP BY sub.id''',
        (user_id, user_id)
    ).fetchall()

    # Fetch recent 10 sessions
    recent_sessions = conn.execute(
        '''SELECT ss.study_date, s.name AS subject_name,
                  ss.hours, ss.notes
           FROM study_sessions ss
           JOIN subjects s ON s.id = ss.subject_id
           WHERE ss.user_id = ?
           ORDER BY ss.study_date DESC
           LIMIT 10''',
        (user_id,)
    ).fetchall()

    # Today's total hours
    today        = date.today().isoformat()
    today_hours  = conn.execute(
        '''SELECT COALESCE(SUM(hours), 0) AS total
           FROM study_sessions
           WHERE user_id = ? AND study_date = ?''',
        (user_id, today)
    ).fetchone()['total']

    conn.close()

    # Build graph only when there is data
    graph_b64 = None
    if summary:
        names  = [row['name']        for row in summary]
        hours  = [row['total_hours'] for row in summary]
        if any(h > 0 for h in hours):
            graph_b64 = generate_bar_chart(names, hours)

    return render_template(
        'dashboard.html',
        subjects        = subjects,
        summary         = summary,
        recent_sessions = recent_sessions,
        today_hours     = today_hours,
        graph_b64       = graph_b64,
        today           = today
    )


# ── Add Subject ──────────────────────────────────────────────
# @app.route('/add_subject', methods=['POST'])
# def add_subject():
#     if 'user_id' not in session:
#         return redirect(url_for('login'))

#     try:
#         name       = request.form['subject_name'].strip()
#         daily_goal = float(request.form['daily_goal'])

#         if not name:
#             flash('Subject name cannot be empty.', 'error')
#             return redirect(url_for('dashboard'))

#         if daily_goal <= 0 or daily_goal > 24:
#             flash('Daily goal must be between 0 and 24 hours.', 'error')
#             return redirect(url_for('dashboard'))

#         subj = Subject(session['user_id'], name, daily_goal)
#         subj.save()
#         flash(f'Subject "{name}" added successfully!', 'success')

#     except ValueError:
#         flash('Invalid daily goal. Please enter a number.', 'error')
#     except Exception as e:
#         flash(f'Error adding subject: {str(e)}', 'error')

#     return redirect(url_for('dashboard'))


# ── Delete Subject ───────────────────────────────────────────
@app.route('/delete_subject/<int:subject_id>')
def delete_subject(subject_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))

    try:
        conn = get_db_connection()
        # Delete related sessions first
        conn.execute(
            'DELETE FROM study_sessions WHERE subject_id = ? AND user_id = ?',
            (subject_id, session['user_id'])
        )
        conn.execute(
            'DELETE FROM subjects WHERE id = ? AND user_id = ?',
            (subject_id, session['user_id'])
        )
        conn.commit()
        conn.close()
        flash('Subject deleted.', 'info')
    except Exception as e:
        flash(f'Error: {str(e)}', 'error')

    return redirect(url_for('dashboard'))


# ── Log Study Session ────────────────────────────────────────
@app.route('/log_session', methods=['POST'])
def log_session():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    try:
        subject_id = int(request.form['subject_id'])
        hours      = float(request.form['hours'])
        study_date = request.form['study_date']
        notes      = request.form.get('notes', '').strip()

        if hours <= 0 or hours > 24:
            flash('Hours must be between 0 and 24.', 'error')
            return redirect(url_for('dashboard'))

        study_session = StudySession(
            session['user_id'], subject_id, hours, study_date, notes
        )
        study_session.save()
        flash(f'{hours} hour(s) logged successfully!', 'success')

    except ValueError:
        flash('Invalid input. Please check hours and date.', 'error')
    except Exception as e:
        flash(f'Error logging session: {str(e)}', 'error')

    return redirect(url_for('dashboard'))

@app.route("/api/test")
def test():
    return {"message": "Backend connected successfully 🚀"}
# ============================================================
# ENTRY POINT
# ============================================================
if __name__ == '__main__':
    init_db()          # Create tables on first run
    print("✅  Database initialised.")
    print("🚀  Starting Smart Study Planner at http://127.0.0.1:5000")
    app.run(debug=True)



@app.route("/")
def home():
    return send_from_directory("static", "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    file_path = os.path.join("static", path)
    if os.path.exists(file_path):
        return send_from_directory("static", path)
    return send_from_directory("static", "index.html")