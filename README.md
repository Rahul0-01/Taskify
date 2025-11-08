# 🚀 Taskify – Smart Task Management System

**Taskify** is a full-featured task management platform built with **Spring Boot** (Backend) and **React** (Frontend), designed for seamless team collaboration, task automation, and intelligent assistance.

> 🎯 Live Backend: [http://16.16.208.245:8080/](http://16.16.208.245:8080/)

---

## ✨ Features

✅ **User Authentication** – Secure signup & login with JWT-based authentication  
✅ **Task Management** – Create, assign, and track tasks with due dates & priorities  
✅ **Email Notifications** – Automated task alerts using Spring Mail  
✅ **Redis Caching** – Boosts performance by reducing database load  
✅ **RabbitMQ Messaging** – Handles asynchronous communication for scalable task queues  
✅ **Chat Assistant Integration** – Built-in AI-powered assistant using ElevenLabs API  
✅ **RESTful APIs** – Well-structured endpoints for smooth frontend integration  
✅ **Docker & AWS Deployment** – Deployed on AWS ECS (Fargate) with MySQL RDS

---

## 🧠 Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.x
- Spring Security (JWT Authentication)
- Spring Data JPA (MySQL)
- Redis
- RabbitMQ
- Lombok
- Maven

**Frontend:**
- React (Vite)
- Axios, Redux Toolkit
- TailwindCSS / CSS Modules

**DevOps & Deployment:**
- AWS ECS (Fargate)
- AWS RDS (MySQL)
- CloudWatch Logs
- Docker
- GitHub Actions (CI/CD coming soon)

---

## ⚙️ Environment Setup

### 🧩 1. Clone the Repository
```bash
git clone https://github.com/Rahul0-01/Taskify.git
cd Taskify
```

### 🧩 2. Configure Environment Variables
Create a `.env` file in your backend folder using the example below:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://your-database-url:3306/taskify_db
SPRING_DATASOURCE_USERNAME=your-username
SPRING_DATASOURCE_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
SPRING_MAIL_USERNAME=your-email
SPRING_MAIL_PASSWORD=your-app-password
SPRING_REDIS_HOST=your-redis-host
SPRING_RABBITMQ_HOST=your-rabbitmq-host
ELEVEN_API_KEY=your-elevenlabs-api-key
ELEVEN_VOICE_ID=your-voice-id
```

💡 A safe `.env.example` is already included to guide you.

---

## 🧪 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/users/register` | Register a new user |
| `POST` | `/users/login` | Authenticate and get JWT |
| `GET` | `/tasks` | Fetch all tasks |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/{id}` | Update existing task |
| `DELETE` | `/tasks/{id}` | Delete task by ID |

---

## 🌐 Deployment Architecture

```
User (Frontend)
     ↓
React (Vite App)
     ↓
AWS ECS (Fargate) -> Spring Boot (Backend)
     ↓
AWS RDS (MySQL) + Redis + RabbitMQ
```

---

## 🛠️ Future Enhancements

- 🌟 Deploy Frontend (React) via AWS S3 + CloudFront / Vercel
- 🌟 Add CI/CD pipelines using GitHub Actions
- 🌟 Integrate WebSocket for real-time task updates
- 🌟 Expand chat assistant capabilities

---

## 🧑‍💻 Developed By

**Rahul**  
_Aspiring Full-Stack Developer passionate about scalable backend systems and AWS deployment._

📧 **Email:** [rahulchauhan95186@gmail.com](mailto:rahulchauhan95186@gmail.com)  
🔗 **GitHub:** [@Rahul0-01](https://github.com/Rahul0-01)

---

⭐ **If you liked this project, give it a star on GitHub!**
