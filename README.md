# 🧠 DMSM CCA: Multi-Personalized AI Agent Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20MongoDB-brightgreen)
![AI](https://img.shields.io/badge/AI-Groq%20%7C%20Llama%203.1-orange)
![License](https://img.shields.io/badge/license-MIT-purple)

**DMSM CCA** is a full-stack, emotion-aware AI companion platform. It gives users access to multiple specialized AI personas — each with distinct personalities — backed by real-time emotional intelligence, persistent memory, a self-discovery engine, and a mental wellness analytics dashboard.

---

## ✨ Key Features

### 🤖 Multi-Agent System
Interact with distinct, individually prompted AI companions:
- **Empathy AI** — Unconditional emotional support and validation
- **Code Mentor** — High-performance engineering assistant
- **Creative Muse** — Brainstorming and artistic breakthroughs
- **Study Buddy** — Patient, educational explanations
- **Custom Agents** — Build your own persona with custom prompts, icons, and color themes

### ⚡ Groq-Powered Fast Inference
All AI responses are powered by **Groq SDK** using `llama-3.1-8b-instant`, delivering near-instant reply speeds via Groq's ultra-low latency inference API.

### ❤️ Real-Time Emotional Intelligence
Every message is analyzed to detect emotional states — `happy`, `sad`, `anxious`, `angry`, `lonely`, `confused`, `neutral` — stored per-message and visualized on the analytics dashboard.

### 🧠 Autonomous Self-Discovery Engine
The AI listens organically. If you mention a new hobby or trait in conversation, the platform triggers a glowing popup asking to save it permanently to your profile.

### 📊 Mental Wellness Dashboard
A rich analytics dashboard powered by **Recharts**:
- Dominant mood & emotion distribution (pie charts)
- Activity heatmap — GitHub-style daily/hourly activity
- 6-month message & conversation trends
- Agent usage vs. emotion correlation charts

### 📝 AI-Generated Weekly Wellness Journal
A 1-click feature that fetches your last 7 days of conversations and generates a beautifully formatted GitHub-Flavored Markdown journal summarizing your emotional landscape, breakthroughs, and personalized guidance.

### 🛡️ Admin Control Panel
A dedicated admin dashboard with:
- User management (view, edit, promote/demote, delete)
- Agent management with AI Prompt Enhancer
- Conversation explorer with full message history
- DB Chatbot — natural language database queries
- Platform statistics overview

### 📧 Welcome Email System
Automatic styled welcome email sent to new users via Gmail SMTP with a premium dark-theme HTML design.

### 📱 Fully Mobile Responsive
All pages — Landing, Auth, Dashboard, Chat, Analytics, Admin — are fully responsive across all screen sizes using Tailwind CSS v4.

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite | UI Framework |
| Tailwind CSS v4 | Styling & Responsive Layout |
| Recharts | Analytics Data Visualization |
| Lucide React | Icon Library |
| React-Markdown | Journal & Chat Rendering |
| React Router v7 | Client-Side Routing |
| Sonner | Toast Notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express.js | API Server |
| MongoDB + Mongoose | Database & ODM |
| Groq SDK | AI Inference (Llama 3.1 8B) |
| bcryptjs + JWT | Authentication |
| Cloudinary | Profile Picture Storage |
| Nodemailer | Welcome Email via Gmail SMTP |
| dotenv | Environment Configuration |

---

## ⚙️ Environment Variables

Create a `.env` file in `Backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key


# Email (Gmail SMTP — optional, signup still works without it)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your@gmail.com
```

> **Groq API Key**: Get a free key at [console.groq.com](https://console.groq.com)

---

## 🚀 Installation & Setup

### 1. Backend
```bash
cd Backend
npm install
# Create .env file with the variables above
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Open the App
Visit `http://localhost:5173` in your browser. Create an account, pick an AI agent, and start chatting!

---

## 📁 Project Structure

```
DMSM CCA/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # auth, chat, agent, admin, analytics
│   │   ├── services/        # groq, emotion, journal, prompt_enhancer
│   │   ├── models/          # User, Agent, Conversation
│   │   ├── routes/          # Express route definitions
│   │   ├── emails/          # emailHandlers + emailTemplates
│   │   ├── lib/             # env, cloudinary, db, utils
│   │   └── middleware/      # auth, adminAuth
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Landing, Auth, Dashboard, Chat, Analytics, admin/
│   │   ├── components/      # Shared UI components
│   │   ├── context/         # AuthContext
│   │   └── store/           # Zustand stores
│   └── package.json
└── assets/
    ├── API_ROUTES.md
    ├── features.md
    └── ss/                  # App screenshots
```

---

## 🚧 Future Roadmap

- 🎙️ **Voice Interaction** — Web Speech API for dictation + local TTS
- 📚 **RAG Vector Memory** — Long-term memory via ChromaDB/pgvector
- 👥 **Agent Group Chat** — Multiple agents debating in the same room
- 🔔 **Proactive Check-ins** — Email/push notifications based on emotional state
- 🌊 **Emotion-Driven UI** — Dynamic background themes based on detected mood

---

## 📄 License

MIT © 2026 DMSM CCA
