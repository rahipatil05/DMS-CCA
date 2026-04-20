import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Bot, MessageSquare, Database,
  Settings, LogOut, Brain, ChevronRight, Shield, Menu, X,
  Bell, Search
} from "lucide-react";
import AdminOverview      from "./tabs/AdminOverview";
import AdminUsers         from "./tabs/AdminUsers";
import AdminAgents        from "./tabs/AdminAgents";
import AdminConversations from "./tabs/AdminConversations";
import AdminDBChat        from "./tabs/AdminDBChat";
import AdminSettings      from "./tabs/AdminSettings";

const THEME = {
  bg:           "#060b13",
  sidebar:      "#0a1020",
  card:         "#0d1525",
  cardBorder:   "rgba(255,255,255,0.08)",
  primary:      "#38bdf8",
  primaryGlow:  "rgba(56,189,248,0.15)",
  secondary:    "#818cf8",
  accent:       "#34d399",
  danger:       "#f87171",
  warning:      "#fbbf24",
  muted:        "rgba(255,255,255,0.45)",
  mutedBg:      "rgba(255,255,255,0.04)",
};

const NAV_ITEMS = [
  { id: "overview",       label: "Overview",       icon: LayoutDashboard, color: THEME.primary },
  { id: "users",          label: "Users",           icon: Users,          color: THEME.secondary },
  { id: "agents",         label: "Agents",          icon: Bot,            color: THEME.accent },
  { id: "conversations",  label: "Conversations",   icon: MessageSquare,  color: THEME.warning },
  { id: "dbchat",         label: "DB Chatbot",      icon: Database,       color: "#f472b6" },
  { id: "settings",       label: "Settings",        icon: Settings,       color: THEME.muted },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { authUser, logout: contextLogout } = useAuth();
  const [activeTab, setActiveTab]   = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats]           = useState(null);

  // Quick badge counts shown in sidebar
  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats", { credentials: "include" })
      .then(r => r.json())
      .then(d => setStats(d?.summary || null))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      contextLogout();
      navigate("/");
    }
  };

  const badgeFor = (id) => {
    if (!stats) return null;
    if (id === "users")         return stats.totalUsers;
    if (id === "conversations") return stats.totalConversations;
    if (id === "agents")        return stats.totalAgents;
    return null;
  };

  const ActiveComponent = {
    overview:      AdminOverview,
    users:         AdminUsers,
    agents:        AdminAgents,
    conversations: AdminConversations,
    dbchat:        AdminDBChat,
    settings:      AdminSettings,
  }[activeTab] || AdminOverview;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: THEME.bg, fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @keyframes fadeSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-nav-item:hover { background: rgba(255,255,255,0.06) !important; }
        .admin-nav-item.active { background: rgba(56,189,248,0.1) !important; }
        .tab-fade { animation: fadeSlide 0.35s ease forwards; }
      `}</style>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? "240px" : "64px",
        minHeight: "100vh",
        background: THEME.sidebar,
        borderRight: `1px solid ${THEME.cardBorder}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 40
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 16px",
          borderBottom: `1px solid ${THEME.cardBorder}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          minHeight: "70px"
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 20px ${THEME.primary}40`
          }}>
            <Shield size={18} color="#fff" />
          </div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap" }}>Admin Panel</p>
              <p style={{ fontSize: "10px", color: THEME.primary, whiteSpace: "nowrap" }}>Multi Personalized AI Agent Platform</p>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            margin: "8px auto",
            width: "32px", height: "32px",
            background: THEME.mutedBg,
            border: `1px solid ${THEME.cardBorder}`,
            borderRadius: "8px",
            color: THEME.muted,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s"
          }}
        >
          {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "8px" }}>
          {NAV_ITEMS.map(item => {
            const Icon  = item.icon;
            const active = activeTab === item.id;
            const badge  = badgeFor(item.id);
            return (
              <button
                key={item.id}
                className={`admin-nav-item${active ? " active" : ""}`}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 10px",
                  borderRadius: "10px",
                  border: active ? `1px solid ${item.color}30` : "1px solid transparent",
                  background: active ? `${item.color}10` : "transparent",
                  color: active ? item.color : THEME.muted,
                  cursor: "pointer",
                  marginBottom: "2px",
                  transition: "all 0.2s",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  position: "relative"
                }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                {sidebarOpen && (
                  <>
                    <span style={{ fontSize: "13px", fontWeight: active ? 600 : 400, flex: 1, textAlign: "left" }}>{item.label}</span>
                    {badge != null && (
                      <span style={{
                        fontSize: "10px", fontWeight: 700,
                        background: active ? `${item.color}20` : THEME.mutedBg,
                        color: active ? item.color : THEME.muted,
                        border: `1px solid ${active ? item.color + "40" : THEME.cardBorder}`,
                        borderRadius: "20px",
                        padding: "1px 7px",
                        minWidth: "22px",
                        textAlign: "center"
                      }}>{badge}</span>
                    )}
                    {active && <ChevronRight size={13} style={{ opacity: 0.6 }} />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile */}
        <div style={{
          padding: "12px",
          borderTop: `1px solid ${THEME.cardBorder}`
        }}>
          {sidebarOpen ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "10px", background: THEME.mutedBg }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: `linear-gradient(135deg, ${THEME.primary}30, ${THEME.secondary}30)`,
                border: `1px solid ${THEME.primary}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", flexShrink: 0
              }}>👤</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {authUser?.fullName?.split(" ")[0] || "Admin"}
                </p>
                <p style={{ fontSize: "10px", color: THEME.primary }}>Administrator</p>
              </div>
              <button onClick={handleLogout} title="Logout" style={{
                background: "transparent", border: "none", color: THEME.muted,
                cursor: "pointer", padding: "4px", borderRadius: "6px", flexShrink: 0
              }}>
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} title="Logout" style={{
              width: "100%", background: "transparent", border: "none",
              color: THEME.muted, cursor: "pointer", padding: "8px", borderRadius: "8px",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <LogOut size={16} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        {/* Top-bar */}
        <header style={{
          height: "62px",
          borderBottom: `1px solid ${THEME.cardBorder}`,
          background: "rgba(6,11,19,0.9)",
          backdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 30
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </p>
            <p style={{ fontSize: "10px", color: THEME.muted }}>Admin Control Center</p>
          </div>

          {/* Search hint */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`,
            borderRadius: "8px", padding: "6px 12px"
          }}>
            <Search size={13} color={THEME.muted} />
            <span style={{ fontSize: "12px", color: THEME.muted }}>Search within tab…</span>
          </div>

          {/* Admin badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: `${THEME.primary}12`,
            border: `1px solid ${THEME.primary}30`,
            borderRadius: "8px", padding: "6px 12px"
          }}>
            <Shield size={13} color={THEME.primary} />
            <span style={{ fontSize: "12px", color: THEME.primary, fontWeight: 600 }}>Admin</span>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: "24px" }} key={activeTab} className="tab-fade">
          <ActiveComponent />
        </main>
      </div>

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-80px", left: "200px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)",
          animation: "pulse 6s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", bottom: "-100px", right: "100px",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129,140,248,0.04) 0%, transparent 70%)",
          animation: "pulse 8s ease-in-out infinite 2s"
        }} />
      </div>
    </div>
  );
}
