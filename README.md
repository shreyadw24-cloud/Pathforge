# Pathforge — AI-Powered Career Path Advisor

Pathforge is an AI-powered career guidance web application that helps users explore suitable career paths based on their skills, interests, and background.

The application combines a React-based frontend, an Express.js backend, MongoDB for data persistence, and Google's Gemini AI service for generating personalized career suggestions.

---

## ✨ Features

- 🔐 JWT-based authentication with protected routes
- 👤 Personalized career profile (skills, interests, background)
- 🤖 AI-generated career path recommendations with reasoning
- 📋 Persistent recommendation history

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │    React Client     │
                    │   UI, State, API    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Express API     │
                    │ Auth, Routes,       │
                    │ Controllers         │
                    └───────┬─────┬───────┘
                            │     │
                  Persistence│     │AI Request
                            ▼     ▼
                 ┌─────────────┐  ┌──────────────────┐
                 │   MongoDB   │  │  Gemini AI       │
                 │ User & Data │  │ Career Guidance  │
                 └─────────────┘  └──────────────────┘
```

---

## 🧰 Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Material UI, Radix UI, React Hook Form, Recharts, Motion

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, dotenv, Helmet, CORS, express-rate-limit

**AI:** Google Gemini API (`@google/genai`)

---

## 📁 Project Structure

```text
Pathforge/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── styles/
│   │   ├── api.ts
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   ├── index.js
│   └── package.json
│
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Node.js, npm, MongoDB, and a Google Gemini API key.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd pathforge
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The frontend will connect to the backend once both are running.

---

## 🔌 API Reference

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Authenticate a user |
| POST | `/api/career/profile` | Yes | Save/update career profile |
| GET | `/api/suggestions/generate` | Yes | Generate and save career recommendations |
| GET | `/api/suggestions/history` | Yes | Retrieve past recommendation sessions |

---

## 🔐 Security

JWT authentication, bcryptjs password hashing, Helmet security headers, CORS restrictions, and rate limiting on auth routes. Secrets are kept in environment variables and never committed.

---

## 👥 Team

- Priyanshi Jain
- Sakshi Sanghavi
- Shreya Dwivedi

---

## 🔗 Project Links

**Repository:** https://github.com/shreyadw24-cloud/Pathforge.git

**Live Application:** https://career-advisor-sandy.vercel.app
