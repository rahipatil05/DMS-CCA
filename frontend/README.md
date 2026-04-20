# DMSM CCA — Frontend

> React 19 + Vite + Tailwind CSS v4 frontend for the Multi-Personalized AI Agent Platform.

## 🚀 Getting Started

```bash
npm install
npm run dev       # Development server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build
```

## 📁 Structure

```
src/
├── pages/
│   ├── Landing.jsx          # Public landing page
│   ├── Dashboard.jsx        # User home with agent cards
│   ├── Chat.jsx             # AI chat interface
│   ├── Analytics.jsx        # Mental wellness dashboard
│   ├── auth/Auth.jsx        # Login / Signup
│   └── admin/               # Admin panel + tabs
│       ├── AdminPanel.jsx
│       └── tabs/
│           ├── AdminOverview.jsx
│           ├── AdminUsers.jsx
│           ├── AdminAgents.jsx
│           ├── AdminConversations.jsx
│           ├── AdminDBChat.jsx
│           └── AdminSettings.jsx
├── components/              # Shared UI components
├── context/AuthContext.jsx  # Auth state provider
└── store/                   # Zustand state stores
```

## 🎨 Design System

- **Background**: `#060b13` (deep dark navy)
- **Primary Accent**: `#38bdf8` (sky blue)
- **Secondary Accent**: `#818cf8` (indigo)
- **Success**: `#34d399` (emerald)
- **Warning**: `#fbbf24` (amber)
- **Danger**: `#f87171` (red)
- **Typography**: Inter (Google Fonts)
- **Style**: Glassmorphism — `backdrop-blur` frosted glass cards

## 📱 Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| `xs` (default) | < 640px | Mobile: single column, slide-in sidebars |
| `sm` | ≥ 640px | Tablet: expanded nav, 2-col layouts |
| `md` | ≥ 768px | Desktop: full sidebars, multi-column grids |

## 🔗 Backend Connection

All API calls target `http://localhost:5000` in development.
Authentication uses **HTTP-only JWT cookies** (`credentials: "include"` on all fetches).
