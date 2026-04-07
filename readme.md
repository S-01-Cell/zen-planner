# 🌿 ZenPlanner: Personal Productivity & Lifestyle

**ZenPlanner** is a minimalist, high-performance productivity ecosystem designed for holistic life management. Built with a Flask backend and MongoDB, it allows users to categorize and optimize their daily routines across four essential pillars: **Work, Personal, Health, and Finance.**

---

## 🚀 Quick Start (Dockerized Deployment)

The fastest way to get ZenPlanner running is using **Docker Desktop**. This ensures the database and web server are configured automatically.

### 1. Clone the repository
Open your terminal and run:
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/ZenPlanner.git](https://github.com/YOUR_GITHUB_USERNAME/ZenPlanner.git)
cd "Planner App"
```

### 2. Launch the Application
This command builds the Python environment and pulls the MongoDB image:

```bash
docker-compose up --build -d
```

### 3. Access the App
Once the containers are running, visit:
[http://localhost:5000](http://localhost:5000)


## ✨ Key Features
Holistic Lifestyle Categories: Dedicated tracking for Work, Personal, Health, and Finance to maintain life balance.

Secure Identity Management: User registration and login powered by Flask-Login and bcrypt for industry-standard password hashing.

Unified Account Recovery: A streamlined "Forgot Password" page for direct, secure credential updates.

Containerized Architecture: Fully Dockerized (App + MongoDB) for consistent performance across Windows, macOS, and Linux.

Data Persistence: Uses Docker Volumes (mongo-data) to ensure your planning data is never lost, even if the system restarts.

## 🛠️ Tech Stack
Backend: Python / Flask

Database: MongoDB (NoSQL)

Security: Flask-Bcrypt (Password Hashing)

DevOps: Docker & Docker Compose

Frontend: HTML5, CSS3 (Zen Gold-and-Slate Theme), JavaScript

## 📂 Project Structure

```plaintext
├── app.py              # Flask server logic and Lifestyle API routes
├── Dockerfile          # Configuration for the Python container
├── docker-compose.yml  # Orchestration for the App and MongoDB services
├── requirements.txt    # Python dependencies (Flask, PyMongo, Bcrypt)
├── templates/          # Jinja2 HTML templates (Auth, Dashboard, Reset)
├── static/             # Custom CSS and UI assets
└── .gitignore          # Prevents pushing sensitive data (mongo-data/ and .venv/)
```

## 🛠️ Management Commands

| Action | Command |
| :--- | :--- |
| **Stop the App** | `docker-compose down` |
| **View Logs** | `docker logs -f plannerapp-web-1` |
| **Access Database** | `docker exec -it plannerapp-mongodb-1 mongosh` |
| **Restart Services** | `docker-compose restart` |


## 🔒 Data Persistence & Inspection

### Option 1: Using MongoDB Compass (GUI)
To inspect the lifestyle data visually, follow these steps:

1. **Stop Local Services:** Ensure your local Windows MongoDB service is **Stopped** to release Port `27017`.
2. **Connect:** Create a new connection in Compass using the following URI:
   ```text
   mongodb://localhost:27017
   ```

### Option 2: Using Docker Terminal (No Compass required)

If you do not have MongoDB Compass installed, your data is still securely stored and accessible. You can inspect your lifestyle categories and user data directly via the command line:

1. **Access the Database Shell:**
   Run this command to enter the MongoDB container:
   ```bash
   docker exec -it plannerapp-mongodb-1 mongosh
   ```

2. **Select the Project Database:**
   Once inside the shell, switch to the ZenPlanner database:
   ```javascript
   use planner_db
   ```

3. **View and Verify Data:**
   To see all stored tasks and their assigned categories (Work, Personal, Health, Finance), run:
   ```javascript
   db.tasks.find().pretty()
   ```

