import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Bot, MessageSquare, Database,
  Settings, LogOut, Shield, Menu, X, Search, ChevronRight
} from "lucide-react";
import AdminOverview      from "./tabs/AdminOverview";
import AdminUsers         from "./tabs/AdminUsers";
import AdminAgents        from "./tabs/AdminAgents";
import AdminConversations from "./tabs/AdminConversations";
import AdminDBChat        from "./tabs/AdminDBChat";
import AdminSettings      from "./tabs/AdminSettings";

const NAV_ITEMS = [
  { id: "overview",      label: "Overview",      icon: LayoutDashboard, color: "#38bdf8" },
  { id: "users",         label: "Users",          icon: Users,           color: "#818cf8" },
  { id: "agents",        label: "Agents",         icon: Bot,             color: "#34d399" },
  { id: "conversations", label: "Conversations",  icon: MessageSquare,   color: "#fbbf24" },
  { id: "dbchat",        label: "DB Chatbot",     icon: Database,        color: "#f472b6" },
  { id: "settings",      label: "Settings",       icon: Settings,        color: "rgba(255,255,255,0.45)" },
];

const TAB_MAP = {
  overview:      AdminOverview,
  users:         AdminUsers,
  agents:        AdminAgents,
  conversations: AdminConversations,
  dbchat:        AdminDBChat,
  settings:      AdminSettings,
};

export default function AdminPanel() {
  const navigate  = useNavigate();
  const { authUser, logout: contextLogout } = useAuth();
  const [activeTab, setActiveTab]           = useState("overview");
  const [sidebarOpen, setSidebarOpen]       = useState(true);   // desktop collapse
  const [mobileOpen, setMobileOpen]         = useState(false);  // mobile drawer
  const [stats, setStats]                   = useState(null);

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

  const ActiveComponent = TAB_MAP[activeTab] || AdminOverview;

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileOpen(false); // close drawer on mobile after tap
  };

  // Sidebar content — shared between desktop & mobile drawer
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo + close (mobile) / collapse (desktop) */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/8 min-h-[64px]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#38bdf8,#818cf8)", boxShadow: "0 0 20px #38bdf840" }}>
            <Shield size={17} color="#fff" />
          </div>
          {(sidebarOpen || mobileOpen) && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-100 whitespace-nowrap">Admin Panel</p>
              <p className="text-[10px] text-sky-400 whitespace-nowrap">Multi AI Platform</p>
            </div>
          )}
        </div>
        {/* Mobile: X button | Desktop: collapse arrow */}
        <button
          onClick={() => mobileOpen ? setMobileOpen(false) : setSidebarOpen(o => !o)}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all shrink-0"
        >
          {mobileOpen ? <X size={16} /> : sidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon   = item.icon;
          const active = activeTab === item.id;
          const badge  = badgeFor(item.id);
          const show   = sidebarOpen || mobileOpen;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={!show ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
                active
                  ? "border-white/10 bg-white/6"
                  : "border-transparent hover:bg-white/5"
              } ${show ? "justify-start" : "justify-center"}`}
              style={{ color: active ? item.color : "rgba(255,255,255,0.45)" }}
            >
              <Icon size={17} className="shrink-0" />
              {show && (
                <>
                  <span className="text-sm flex-1 text-left" style={{ fontWeight: active ? 600 : 400 }}>
                    {item.label}
                  </span>
                  {badge != null && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border"
                      style={{
                        background: active ? `${item.color}20` : "rgba(255,255,255,0.05)",
                        color:      active ? item.color : "rgba(255,255,255,0.4)",
                        borderColor: active ? `${item.color}40` : "rgba(255,255,255,0.08)"
                      }}>
                      {badge}
                    </span>
                  )}
                  {active && <ChevronRight size={13} className="opacity-50 shrink-0" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div className="p-3 border-t border-white/8">
        {(sidebarOpen || mobileOpen) ? (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/4">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm border"
              style={{ background: "rgba(56,189,248,0.1)", borderColor: "rgba(56,189,248,0.2)" }}>
              👤
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {authUser?.fullName?.split(" ")[0] || "Admin"}
              </p>
              <p className="text-[10px] text-sky-400">Administrator</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="p-1 rounded-md text-white/40 hover:text-white transition-all shrink-0">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} title="Logout"
            className="w-full flex items-center justify-center p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden font-['Inter',system-ui,sans-serif]"
      style={{ background: "#060b13", color: "#e2e8f0" }}>

      {/* ── Keyframe styles ─────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .tab-fade { animation: fadeSlide 0.3s ease forwards; }
      `}</style>

      {/* ── Mobile backdrop ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Desktop Sidebar (sticky, collapsible) ────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0 border-r border-white/8 transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? "240px" : "64px",
          background: "#0a1020",
          borderColor: "rgba(255,255,255,0.08)"
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar (fixed drawer) ───────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-64
          md:hidden
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          border-r border-white/8
        `}
        style={{ background: "#0a1020" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="shrink-0 h-14 sm:h-16 flex items-center gap-3 px-4 sm:px-5 sticky top-0 z-30 border-b border-white/8"
          style={{ background: "rgba(6,11,19,0.9)", backdropFilter: "blur(20px)" }}>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <Menu size={17} />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </p>
            <p className="text-[10px] hidden sm:block" style={{ color: "rgba(255,255,255,0.4)" }}>
              Admin Control Center
            </p>
          </div>

          {/* Search chip — hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/8 bg-white/4">
            <Search size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Search…</span>
          </div>

          {/* Admin badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border"
            style={{ background: "rgba(56,189,248,0.08)", borderColor: "rgba(56,189,248,0.2)" }}>
            <Shield size={12} color="#38bdf8" />
            <span className="text-xs font-semibold text-sky-400 hidden sm:inline">Admin</span>
          </div>
        </header>

        {/* Tab content */}
        <main
          key={activeTab}
          className="tab-fade flex-1 overflow-auto p-4 sm:p-6"
        >
          <ActiveComponent />
        </main>
      </div>

      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-20 left-48 w-96 h-96 rounded-full opacity-50"
          style={{ background: "radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 70%)", animation: "pulse 6s ease-in-out infinite" }} />
        <div className="absolute -bottom-24 right-24 w-[500px] h-[500px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle,rgba(129,140,248,0.05) 0%,transparent 70%)", animation: "pulse 8s ease-in-out infinite 2s" }} />
      </div>
    </div>
  );
}
