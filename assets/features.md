# 🌟 DMSM CCA Platform — Feature Reference

A comprehensive outline of all features powering the Multi-Personalized AI Agent Platform.

---

## 1. ⚡ Groq-Powered AI Inference

All AI responses are generated via the **Groq SDK** using the `llama-3.1-8b-instant` model. Groq's hardware acceleration delivers near-instant response times, making conversations feel natural and fluid.

- Model: `llama-3.1-8b-instant` via Groq API
- Supports streaming-compatible response formats
- Used for: Chat, Weekly Journal generation, DB Chatbot, Prompt Enhancer

---

## 2. ❤️ Real-Time Emotional Intelligence Engine

Every user message is analyzed by the `emotion.service` before generating a reply.

- Automatically categorizes the user's emotional state: `happy`, `sad`, `anxious`, `angry`, `lonely`, `confused`, `neutral`
- Detected emotion stored per message in MongoDB
- Powers the Analytics Engine for mood trend visualization

---

## 3. 🤖 Multi-Personalized Agent Roster

Users interact with distinct AI personas, each with targeted system prompts, color palettes, and icons:

| Agent | Specialty |
|---|---|
| **Empathy AI** | Emotional support & validation |
| **Code Mentor** | Engineering & debugging assistance |
| **Creative Muse** | Brainstorming & artistic direction |
| **Study Buddy** | Patient educational explanations |

---

## 4. 🔧 Custom Agent Builder

Users can design their own AI persona:
- Set a custom name, system prompt, icon, and color theme
- Manage (view, edit, delete) custom agents from the dashboard
- Admins can build platform-wide agents using the **AI Prompt Enhancer** (generates detailed prompts from a brief description)

---

## 5. 🧠 Autonomous Self-Discovery Engine

The AI listens organically during conversations. When a new hobby, interest, or trait is detected:

1. The LLM embeds a hidden `:::DISCOVERY:::` block in its response
2. The backend intercepts this via regex and strips it from the visible reply
3. A glowing UI popup asks: *"I noticed you might be into [Astrophotography]. Should I add this to your profile?"*
4. Upon acceptance, the trait is saved permanently to the user's MongoDB profile
5. From that point, every agent addresses the user with this updated context

---

## 6. 📖 Persistent Memory Context

Every conversation starts with the user's full profile injected into the system prompt:
- Name, discovered interests, personality traits
- Agents address users by name and naturally reference their established profile
- Profile evolves through the Self-Discovery Engine over time

---

## 7. 📊 Mental Wellness Dashboard

A data-rich analytics dashboard built with **Recharts**:

| Chart | Description |
|---|---|
| **Hero Stats** | Total messages, dominant mood, avg message length |
| **Emotion Distribution** | Pie chart of emotional states over time |
| **Activity Heatmap** | GitHub-style hourly/daily chat activity |
| **6-Month Trends** | Message & conversation volume over time |
| **Agent Usage** | Which agents you chat with most |
| **Emotion vs. Agent** | Correlation between agent used and emotional state |

---

## 8. 📝 On-Demand Weekly Wellness Journal

A 1-click journal generation feature on the Analytics Dashboard:

1. Fetches the last 7 days of conversation history
2. Sends context to Groq LLM with a "Wellness Guide" system prompt
3. Generates a GitHub-Flavored Markdown journal covering:
   - The Emotional Landscape (dominant themes, mood shifts)
   - Biggest Breakthroughs & Reflections
   - Personalized Guidance for the coming week
4. Renders in a glassmorphism modal with rich text styling

---

## 9. 🛡️ Admin Control Panel

A full admin dashboard at `/admin` (admin role required):

| Tab | Functionality |
|---|---|
| **Overview** | Platform-wide stats (users, agents, conversations) |
| **Users** | View, edit, promote/demote roles, delete users |
| **Agents** | Manage all agents + AI Prompt Enhancer |
| **Conversations** | Browse all chats with full message history viewer |
| **DB Chatbot** | Natural language → Mongoose query execution |
| **Settings** | Platform configuration |

---

## 10. 📧 Welcome Email System

New users receive a styled welcome email via Gmail SMTP:
- Premium dark-theme HTML email matching the platform design
- Stats strip, feature grid, CTA button
- Non-blocking — sends asynchronously after signup
- Gracefully skips if `EMAIL_*` env vars not configured

---

## 11. 🎨 Premium Glassmorphism UI

The React frontend uses Tailwind CSS v4 with a strict premium design system:
- Dark Navy (`#060b13`) base with neon accents (`#38bdf8`, `#818cf8`, `#34d399`)
- `backdrop-blur` frosted glass components throughout
- Smooth micro-animations (pulse, fadeSlide, bounce)
- Fully responsive across mobile, tablet, and desktop

---

## 🚀 Roadmap

| Feature | Description |
|---|---|
| 🎙️ Voice Interaction | Web Speech API dictation + local TTS |
| 📚 RAG Vector Memory | ChromaDB/pgvector for long-term memory recall |
| 👥 Agent Group Chat | Multiple agents collaborating in one chat room |
| 🔔 Proactive Check-ins | Emotional state-triggered email/push notifications |
| 🌊 Emotion-Driven UI | Dynamic background themes based on detected mood |
