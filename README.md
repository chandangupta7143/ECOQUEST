# EcoQuest 2.0 🌱

EcoQuest is a gamified environmental education platform built for students and teachers. It empowers students to take real-world civic actions (planting trees, recycling, saving water) and rewards them with XP, leveling up their "Eco-Warrior" status.

## 🚀 Tech Stack (Full Stack Java)

### **Frontend**
- **React 18** (Vite)
- **Tailwind CSS** (for styling and modern UI)
- **React Router DOM** (Navigation)
- **Lucide React** (Icons)
- **Axios** (API Requests)

### **Backend**
- **Java 17+**
- **Spring Boot 3.2.x** (REST APIs)
- **Spring Data JPA & Hibernate** (ORM)
- **Spring Security & JWT** (Stateless Authentication)
- **MySQL 8.0** (Database, deployed on Aiven Cloud)
- **Maven** (Build Tool)

---

## 🛠️ Getting Started Locally

### **1. Clone the repository**
```bash
git clone https://github.com/chandangupta7143/ECOQUEST.git
cd ECOQUEST
```

### **2. Backend Setup (Spring Boot)**
```bash
cd backend
```
1. Create a `.env` file in the `backend` directory based on `.env.example`.
2. Provide your local or cloud MySQL credentials.
3. Start the Spring Boot server:
```bash
./mvnw spring-boot:run
# (Or open the project in IntelliJ IDEA/Eclipse and run EcoQuestApplication.java)
```
The backend will run on `http://localhost:5000`.

### **3. Frontend Setup (React/Vite)**
```bash
cd frontend
```
1. Create a `.env` file in the `frontend` directory based on `.env.example`.
2. Install dependencies and start the Vite dev server:
```bash
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

---

## 🏗️ Project Architecture

- **`users`**: Manages authentication, roles (student/teacher), XP, levels, and badges.
- **`tasks`**: Civic actions created by teachers for students to perform.
- **`submissions`**: Photographic proof submitted by students for teacher review and XP rewards.
- **`notes`**: Educational materials (PDFs, Videos, URLs) uploaded by teachers.
- **`quizzes`**: Gamified testing platform.

---

## 🔒 Security Notes
- Passwords are encrypted before being saved to the database.
- Authentication uses stateless **JSON Web Tokens (JWT)**.
- Sensitive environment configurations (like `application.properties` secrets) are **ignored** via `.gitignore` to prevent exposure.

## 🌍 Deployment
- **Frontend** is optimized for Vercel / Netlify.
- **Backend** is packaged as a `.jar` file and is optimized for cloud platforms like Railway, Render, or AWS Elastic Beanstalk.
- **Database** is hosted securely on Aiven MySQL.
