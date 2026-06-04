# EcoQuest — Spring Boot + MySQL Backend

## 🚀 Quick Start

### Prerequisites
| Tool | Version |
|------|---------|
| Java JDK | 17+ |
| Maven | 3.8+ (or use `mvnw`) |
| MySQL | 8.0+ |

---

## ⚙️ Setup & Run

### 1. Start MySQL
Make sure MySQL is running on port 3306.

### 2. Configure Database
The database `ecoquest` is **auto-created** on first run.

Credentials are pre-configured in `ecoquest-backend/src/main/resources/application.properties`:
```
spring.datasource.username=root
spring.datasource.password=#Chandan@7143
```

### 3. Run the Spring Boot Backend
```powershell
cd "d:\Spring boot ECOQUEST\ECOQUEST 2\ecoquest-backend"
mvn spring-boot:run
```
The API starts on **http://localhost:5000**

### 4. Run the Frontend (unchanged)
```powershell
cd "d:\Spring boot ECOQUEST\ECOQUEST 2\frontend"
npm run dev
```
Frontend starts on **http://localhost:5173**

---

## 📁 Project Structure

```
ECOQUEST 2/
├── ecoquest-backend/           ← NEW Spring Boot backend
│   ├── pom.xml
│   └── src/main/java/com/ecoquest/
│       ├── EcoQuestApplication.java
│       ├── entity/             ← JPA entities (MySQL tables)
│       │   ├── User.java
│       │   ├── Subject.java
│       │   ├── Chapter.java
│       │   ├── Quiz.java
│       │   ├── QuizQuestion.java
│       │   ├── QuizAttempt.java
│       │   ├── Task.java
│       │   ├── Submission.java
│       │   ├── Note.java
│       │   └── Notification.java
│       ├── repository/         ← Spring Data JPA repositories
│       ├── service/            ← Business logic
│       ├── controller/         ← REST API controllers
│       ├── dto/                ← Data Transfer Objects
│       ├── security/           ← JWT + Spring Security
│       ├── config/             ← CORS, Security, Jackson config
│       └── exception/          ← Global exception handling
├── frontend/                   ← UNCHANGED React/Vite frontend
└── backend/                    ← OLD Node.js backend (can be deleted)
```

---

## 🗄️ MySQL Database Schema

The schema is **auto-created** by Hibernate (`ddl-auto=update`).

| Table | Description |
|-------|-------------|
| `users` | User accounts (students + teachers) |
| `user_badges` | Earned badges (many-to-one) |
| `user_interests` | User interests (many-to-one) |
| `subjects` | Academic subjects |
| `chapters` | Subject chapters (normalized from embedded) |
| `quizzes` | Quizzes per subject/chapter/class |
| `quiz_questions` | Quiz questions (normalized from embedded) |
| `quiz_question_options` | Answer options per question |
| `quiz_attempts` | Student quiz submissions + scores |
| `tasks` | Eco tasks (waste, water, energy, etc.) |
| `submissions` | Student task submissions + teacher reviews |
| `notes` | Teacher-uploaded notes/PDFs |
| `notifications` | Teacher-student notifications |

---

## 🔌 API Endpoints (Identical to Old Node.js API)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET  | `/api/auth/verify-email?token=` | Public | Verify email |
| POST | `/api/auth/resend-verification` | Public | Resend link |
| GET  | `/api/users/me` | JWT | Get profile |
| PUT  | `/api/users/me` | JWT | Update profile |
| GET  | `/api/users/students` | Teacher | List students |
| GET  | `/api/tasks` | JWT | List tasks |
| POST | `/api/tasks` | Teacher | Create task |
| DELETE | `/api/tasks/:id` | Teacher | Delete task |
| GET  | `/api/quizzes` | JWT | List quizzes |
| GET  | `/api/quizzes/:id` | JWT | Get quiz |
| POST | `/api/quizzes` | Teacher | Create quiz |
| PUT  | `/api/quizzes/:id` | Teacher | Update quiz |
| DELETE | `/api/quizzes/:id` | Teacher | Delete quiz |
| POST | `/api/quizzes/:id/submit` | Student | Submit answers |
| GET  | `/api/submissions` | JWT | List submissions |
| POST | `/api/submissions` | Student | Submit task |
| PUT  | `/api/submissions/:id/review` | Teacher | Review submission |
| GET  | `/api/notes` | JWT | List notes |
| POST | `/api/notes` | Teacher | Upload note |
| DELETE | `/api/notes/:id` | Teacher | Delete note |
| GET  | `/api/subjects` | JWT | List subjects |
| POST | `/api/subjects` | Teacher | Create subject |
| PUT  | `/api/subjects/:id` | Teacher | Update subject |
| DELETE | `/api/subjects/:id` | Teacher | Delete subject + cascade |
| POST | `/api/subjects/:id/chapters` | Teacher | Add chapter |
| PUT  | `/api/subjects/:id/chapters/:chid` | Teacher | Update chapter |
| DELETE | `/api/subjects/:id/chapters/:chid` | Teacher | Delete chapter + cascade |
| GET  | `/api/leaderboard` | JWT | Leaderboard |
| GET  | `/api/analytics/student` | Student | Student analytics |
| GET  | `/api/analytics/teacher` | Teacher | Teacher analytics |
| GET  | `/api/notifications` | JWT | Notifications |
| PUT  | `/api/notifications/read-all` | JWT | Mark all read |
| PUT  | `/api/notifications/:id/read` | JWT | Mark one read |
| GET  | `/api/health` | Public | Health check |

---

## 🔧 Email Configuration (Optional)

By default, email verification is **disabled** and users are **auto-verified** (dev mode).

To enable real email verification, add to `application.properties`:
```properties
app.email.user=your_gmail@gmail.com
app.email.pass=your_16_char_app_password
```

---

## 🗑️ Removing the Old Node.js Backend

The old `backend/` folder is no longer needed. You can safely delete it:
```powershell
Remove-Item -Recurse -Force "d:\Spring boot ECOQUEST\ECOQUEST 2\backend"
```

---

## 🔐 JWT Token

Tokens are valid for **7 days**. The secret key is configured in `application.properties`:
```properties
app.jwt.secret=EcoQuestSuperSecretKey2024...
app.jwt.expiration-ms=604800000
```

For production, **always change the JWT secret** to a long, random value.
