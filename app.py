from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = "zen_planner_key_2026"
bcrypt = Bcrypt(app)

# --- DATABASE CONNECTION ---
# Using planner_db as the primary database
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/planner_db")
client = MongoClient(MONGO_URI)
db = client.planner_db

# --- DATABASE CONSTRAINTS ---
# This goes here! It ensures no two users can have the same email.
db.users.create_index("email", unique=True)

# --- LOGIN CONFIGURATION ---
login_manager = LoginManager(app)
login_manager.login_view = 'login'


class User(UserMixin):
    def __init__(self, user_data):
        self.id = str(user_data['_id'])
        self.email = user_data['email']


@login_manager.user_loader
def load_user(user_id):
    try:
        user_data = db.users.find_one({"_id": ObjectId(user_id)})
        return User(user_data) if user_data else None
    except:
        return None

# --- NAVIGATION ROUTES ---


@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email').lower().strip()
        password = request.form.get('password')
        user_data = db.users.find_one({"email": email})

        # Logic: If email doesn't exist OR password doesn't match
        if not user_data or not bcrypt.check_password_hash(user_data['password'], password):
            flash("Incorrect email or password. Please check again.")
            return redirect(url_for('login'))

        login_user(User(user_data))
        return redirect(url_for('dashboard'))
    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email').lower().strip()
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        if password != confirm_password:
            flash("Passwords do not match!")
            return redirect(url_for('register'))

        if db.users.find_one({"email": email}):
            flash("Account already exists!")
            return redirect(url_for('register'))

        # If all checks pass, create the user
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        db.users.insert_one({"email": email, "password": hashed_pw})
        flash("Account created successfully!")
        return redirect(url_for('login'))
    return render_template('register.html')


@app.route('/forgot-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email').lower().strip()
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # 1. Check if passwords match
        if password != confirm_password:
            flash("Passwords do not match!", "error")
            return redirect(url_for('forgot_password'))

        # 2. Check if user exists in MongoDB
        user = db.users.find_one({"email": email})
        if not user:
            flash("That email address is not registered.", "error")
            return redirect(url_for('forgot_password'))

        # 3. Hash the new password and update the database
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        db.users.update_one(
            {"email": email},
            {"$set": {"password": hashed_pw}}
        )

        flash("Password reset successfully! Please login.", "success")
        return redirect(url_for('login'))

    return render_template('forgot_password.html')


@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=current_user)


@app.route('/calendar')
@login_required
def calendar():
    return render_template('calendar.html', user=current_user)


@app.route('/analytics')
@login_required
def analytics():
    return render_template('analytics.html', user=current_user)


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

# --- TASK API ---


@app.route('/api/tasks', methods=['GET'])
@login_required
def get_tasks():
    # Only fetch tasks belonging to the logged-in user
    tasks = list(db.tasks.find({"user_id": current_user.id}))
    for task in tasks:
        task['_id'] = str(task['_id'])
    return jsonify(tasks)


@app.route('/api/tasks', methods=['POST'])
@login_required
def add_task():
    data = request.json
    new_task = {
        "user_id": current_user.id,
        "title": data.get('title'),
        "description": data.get('description', ''),
        "category": data.get('category', 'Work'),
        "priority": data.get('priority', 'Medium'),
        "status": "pending",
        "due_date": data.get('due_date', 'Today'),
        "created_at": datetime.utcnow()
    }
    result = db.tasks.insert_one(new_task)
    return jsonify({"_id": str(result.inserted_id)}), 201


@app.route('/api/tasks/<task_id>', methods=['PUT'])
@login_required
def edit_task(task_id):
    data = request.json
    db.tasks.update_one(
        {"_id": ObjectId(task_id), "user_id": current_user.id},
        {"$set": {
            "title": data.get('title'),
            "description": data.get('description'),
            "category": data.get('category'),
            "priority": data.get('priority'),
            "due_date": data.get('due_date'),
            "status": "pending"  # Reset status to pending when edited
        }}
    )
    return jsonify({"success": True})


@app.route('/api/tasks/<task_id>', methods=['PATCH'])
@login_required
def complete_task(task_id):
    db.tasks.update_one(
        {"_id": ObjectId(task_id), "user_id": current_user.id},
        {"$set": {
            "status": "completed",
            "completed_at": datetime.utcnow()  # Track completion time for Analytics
        }}
    )
    return jsonify({"success": True})


@app.route('/api/tasks/<task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    db.tasks.delete_one({"_id": ObjectId(task_id), "user_id": current_user.id})
    return jsonify({"success": True})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
