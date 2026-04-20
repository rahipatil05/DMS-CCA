import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Settings, LogOut, Bell, Database, Users, Bot, MessageSquare, Info } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/lib/api";

const THEME = {
  card: "#0d1525", cardBorder: "rgba(255,255,255,0.08)",
  primary: "#38bdf8", secondary: "#818cf8", accent: "#34d399",
  danger: "#f87171", warning: "#fbbf24",
  muted: "rgba(255,255,255,0.45)", mutedBg: "rgba(255,255,255,0.04)",
};

const InfoRow = ({ label, value, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${THEME.cardBorder}` }}>
    <span style={{ color: THEME.muted, fontSize: "13px" }}>{label}</span>
    <span style={{ color: color || "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{value}</span>
  </div>
);

export default function AdminSettings() {
  const { authUser, logout: contextLogout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      contextLogout();
      toast.success("Logged out");
      navigate("/");
    }
  };

  return (
    <div style={{ maxWidth: "680px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Settings</h2>
        <p style={{ fontSize: "13px", color: THEME.muted, marginTop: "2px" }}>Admin account and platform configuration</p>
      </div>

      {/* Admin Profile Card */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `linear-gradient(135deg, ${THEME.primary}40, ${THEME.secondary}40)`, border: `1px solid ${THEME.primary}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>👤</div>
          <div>
            <p style={{ color: "#f1f5f9", fontSize: "16px", fontWeight: 700 }}>{authUser?.fullName || "Admin"}</p>
            <p style={{ color: THEME.muted, fontSize: "12px" }}>{authUser?.email}</p>
            <span style={{ fontSize: "10px", background: `${THEME.primary}18`, border: `1px solid ${THEME.primary}40`, color: THEME.primary, borderRadius: "5px", padding: "2px 8px", fontWeight: 700, marginTop: "4px", display: "inline-block" }}>🛡️ Administrator</span>
          </div>
        </div>
        <InfoRow label="Full Name"  value={authUser?.fullName || "—"} />
        <InfoRow label="Email"      value={authUser?.email    || "—"} />
        <InfoRow label="Role"       value="admin"  color={THEME.primary} />
        <InfoRow label="User ID"    value={authUser?._id?.slice(-8) || "—"} color={THEME.muted} />
      </div>

      {/* Platform Info */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Info size={16} color={THEME.secondary} />
          <h3 style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 700 }}>Platform Info</h3>
        </div>
        <InfoRow label="Platform"     value="Multi Personalized AI Agent Platform" />
        <InfoRow label="Stack"        value="React · Node · MongoDB" />
        <InfoRow label="AI Engine"    value="Ollama (Local)"     color={THEME.accent} />
        <InfoRow label="Backend API"  value="http://localhost:5000" color={THEME.muted} />
        <InfoRow label="Frontend"     value="http://localhost:5173" color={THEME.muted} />
      </div>

      {/* DB Chatbot Info */}
      <div style={{ background: THEME.card, border: `1px solid rgba(244,114,182,0.2)`, borderRadius: "16px", padding: "24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Database size={16} color="#f472b6" />
          <h3 style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 700 }}>DB Chatbot Configuration</h3>
        </div>
        <p style={{ color: THEME.muted, fontSize: "12px", lineHeight: 1.7, marginBottom: "12px" }}>
          The DB Chatbot uses your local Ollama instance to convert natural-language questions into Mongoose queries. 
          All <strong style={{ color: THEME.danger }}>destructive operations</strong> (deleteMany, updateMany, drop, etc.) are blocked server-side for safety.
        </p>
        <InfoRow label="Ollama Endpoint"   value="http://localhost:11434" color={THEME.muted} />
        <InfoRow label="Default Model"     value="llama3.1"               color={THEME.accent} />
        <InfoRow label="Mode"             value="Read-only (safe)"       color={THEME.accent} />
        <InfoRow label="Query Timeout"    value="30s"                    color={THEME.muted} />
      </div>

      {/* Danger Zone */}
      <div style={{ background: THEME.card, border: `1px solid ${THEME.danger}25`, borderRadius: "16px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <Shield size={16} color={THEME.danger} />
          <h3 style={{ color: THEME.danger, fontSize: "14px", fontWeight: 700 }}>Danger Zone</h3>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "10px", background: `${THEME.danger}08`, border: `1px solid ${THEME.danger}20` }}>
          <div>
            <p style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>Sign Out</p>
            <p style={{ color: THEME.muted, fontSize: "12px" }}>You will be redirected to the login page</p>
          </div>
          {confirmLogout ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setConfirmLogout(false)} style={{ padding: "7px 14px", borderRadius: "8px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, cursor: "pointer", fontSize: "12px" }}>Cancel</button>
              <button onClick={handleLogout} style={{ padding: "7px 14px", borderRadius: "8px", background: `${THEME.danger}20`, border: `1px solid ${THEME.danger}50`, color: THEME.danger, cursor: "pointer", fontSize: "12px", fontWeight: 700 }}>Confirm</button>
            </div>
          ) : (
            <button onClick={() => setConfirmLogout(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: `${THEME.danger}12`, border: `1px solid ${THEME.danger}30`, color: THEME.danger, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
              <LogOut size={13} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
