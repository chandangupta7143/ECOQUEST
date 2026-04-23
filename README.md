<div align="center">

# 🌿 EcoQuest

### *Gamifying Sustainability for the Next Generation*

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)

<br/>

> **EcoQuest** is a full-stack gamified learning platform that turns environmental education into an engaging, competitive, and rewarding experience. Students complete eco-challenges, earn XP points, climb leaderboards, and track their real-world environmental impact — all managed by teachers through a powerful dashboard.

<br/>

---

</div>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔌 API Endpoints](#-api-endpoints)
- [👥 User Roles](#-user-roles)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔐 Environment Variables](#-environment-variables)
- [📸 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### 🎮 For Students
| Feature | Description |
|---|---|
| 🏆 **XP & Leaderboard** | Earn experience points by completing eco-tasks and competing globally |
| 📝 **Eco Challenges** | Complete real-world environmental tasks assigned by teachers |
| 🧠 **Quiz System** | Test your environmental knowledge with interactive quizzes |
| 📤 **Evidence Upload** | Submit photos/files as proof of completed eco-actions (10MB image / 50MB video) |
| 📚 **Learn Page** | Browse educational content organized by subject |
| 📓 **Smart Notes** | Take and manage personal study notes |
| 🔔 **Notifications** | Real-time alerts for new tasks, grades, and announcements |
| 👤 **Profile Management** | Customize profile with avatar, bio, and track personal stats |
| 🏙️ **CivicHub** | Engage with broader civic and environmental community discussions |

### 👨‍🏫 For Teachers
| Feature | Description |
|---|---|
| 📊 **Analytics Dashboard** | Track class-wide progress, submission rates, and student performance |
| ✏️ **Task Management** | Create, edit, and assign eco-challenges with deadlines and XP rewards |
| 📋 **Submission Review** | Grade student submissions with custom XP allocation |
| 🎯 **Quiz Builder** | Create multi-question quizzes with automated scoring |
| 👨‍🎓 **Student Management** | Monitor individual student progress and engagement |
| 📣 **Notifications** | Send announcements and feedback to students |

---

## 🛠️ Tech Stack

<table>
<tr>
<td align="center" width="50%">

### 🖥️ Frontend
- **React 18** — UI library with hooks
- **Vite 5** — Lightning-fast build tool
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Data visualization & analytics charts
- **Lucide React** — Beautiful icon library
- **Axios** — HTTP client with interceptors

</td>
<td align="center" width="50%">

### ⚙️ Backend
- **Node.js + Express** — REST API server
- **MongoDB Atlas** — Cloud NoSQL database
- **Mongoose** — ODM for MongoDB
- **JWT** — Stateless authentication
- **Bcrypt.js** — Password hashing
- **Multer** — File uploads handler
- **Nodemailer** — Email verification
- **Express Rate Limit** — API protection

</td>
</tr>
</table>

### 🏗️ Infrastructure
- **Docker + Docker Compose** — Containerized deployment
- **Nginx** — Reverse proxy & static file serving
- **MongoDB Atlas** — Managed cloud database

---

## 📁 Project Structure

```
ECOQUEST/
├── 📂 backend/
│   ├── 📂 middleware/          # Auth middleware, error handlers
│   ├── 📂 models/              # Mongoose schemas (User, Task, Quiz, etc.)
│   ├── 📂 routes/              # API route handlers
│   │   ├── auth.js             # Register, Login, Email Verification
│   │   ├── users.js            # User profile & management
│   │   ├── tasks.js            # Eco-challenge CRUD
│   │   ├── quizzes.js          # Quiz creation & submission
│   │   ├── submissions.js      # Evidence upload & grading
│   │   ├── leaderboard.js      # XP rankings
│   │   ├── analytics.js        # Teacher analytics
│   │   ├── notifications.js    # Alerts system
│   │   ├── notes.js            # Student notes
│   │   └── subjects.js         # Subject management
│   ├── 📂 uploads/             # User-uploaded files (gitignored)
│   ├── 📂 utils/               # Helper functions
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Environment template
│   └── package.json
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 api/             # Axios API service layer
│   │   ├── 📂 components/      # Reusable UI components
│   │   ├── 📂 context/         # React Context (Auth, etc.)
│   │   ├── 📂 pages/           # Full page components
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Login.jsx           # Authentication
│   │   │   ├── Register.jsx        # Sign up with email verification
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── LearnPage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │   ├── CivicHub.jsx
│   │   │   └── Profile.jsx
│   │   ├── 📂 utils/           # Frontend helpers
│   │   ├── App.jsx             # Root component with routing
│   │   └── main.jsx            # React entry point
│   └── package.json
│
├── docker-compose.yml          # Multi-container Docker setup
├── .env.example                # Root env template
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- **Node.js** v18+ → [Download](https://nodejs.org/)
- **npm** v9+
- **MongoDB Atlas** account → [Sign Up Free](https://cloud.mongodb.com/)
- **Git** → [Download](https://git-scm.com/)

---

### 🔧 Local Setup (Development)

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/chandangupta7143/ECOQUEST.git
cd ECOQUEST
```

#### 2️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# ✏️ Edit .env and fill in your MONGO_URI and JWT_SECRET

# Start development server
npm run dev
```

> ✅ Backend runs on: `http://localhost:5000`

#### 3️⃣ Setup Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

> ✅ Frontend runs on: `http://localhost:5173`

---

## 🔌 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user (sends verification email) |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/verify/:token` | Verify email address |

### 👤 Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users/profile` | Get current user profile |
| `PUT` | `/api/users/profile` | Update profile info |
| `POST` | `/api/users/avatar` | Upload profile picture |

### 📋 Tasks (Eco Challenges)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List all tasks |
| `POST` | `/api/tasks` | Create new task (Teacher only) |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

### 📤 Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submissions` | Submit evidence for a task |
| `GET` | `/api/submissions` | List submissions |
| `PUT` | `/api/submissions/:id/grade` | Grade submission & award XP (Teacher) |

### 🏆 Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/leaderboard` | Get top students by XP |

### 📊 Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics` | Class performance overview (Teacher) |

### ❤️ Health Check
```
GET /api/health
→ { status: "ok", db: "connected", env: "development" }
```

---

## 👥 User Roles

```
┌─────────────────────────────────────────────────────┐
│                    EcoQuest Roles                     │
├──────────────────┬──────────────────────────────────┤
│   👨‍🎓 STUDENT     │         👨‍🏫 TEACHER               │
├──────────────────┼──────────────────────────────────┤
│ View tasks       │ Create & manage tasks            │
│ Submit evidence  │ Review & grade submissions       │
│ Take quizzes     │ Create quizzes                   │
│ View leaderboard │ Full analytics dashboard         │
│ Earn XP          │ Manage students                  │
│ Personal notes   │ Send notifications               │
└──────────────────┴──────────────────────────────────┘
```

---

## 🐳 Docker Deployment

Run the entire stack with a single command:

```bash
# Make sure Docker Desktop is running

# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d --build

# Stop all containers
docker-compose down
```

**Services started:**
- 🟢 `backend` — Node.js API on port `5000`
- 🔵 `frontend` — Nginx serving React build on port `80`

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<DB_USER>:<URL_ENCODED_PASSWORD>@<CLUSTER>.mongodb.net/ecoquest

# JWT Secret — use a long, random string (min 32 characters)
JWT_SECRET=your_random_jwt_secret_here_min_32_chars

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# Email Configuration (for verification emails)
# Enable 2FA in Gmail → Security → App Passwords → Generate 16-char password
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password

# Frontend URL (used in email verification links)
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **NEVER commit your `.env` file!** It is already in `.gitignore`.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

<div align="center">

### 🌍 Built with ❤️ for a Greener Future

**EcoQuest** — *Turning Environmental Awareness into Action*

<br/>

[![GitHub](https://img.shields.io/badge/GitHub-chandangupta7143-181717?style=for-the-badge&logo=github)](https://github.com/chandangupta7143/ECOQUEST)

</div>
