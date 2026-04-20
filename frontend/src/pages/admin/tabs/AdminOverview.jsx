import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";
import {
  Users, Bot, MessageSquare, Activity, TrendingUp,
  RefreshCw, AlertCircle, Zap, Heart, Crown, Calendar,
  ChevronUp, ChevronDown, Minus
} from "lucide-react";

const THEME = {
  bg: "#060b13",
  card: "#0d1525",
  cardBorder: "rgba(255,255,255,0.08)",
  primary: "#38bdf8",
  primaryGlow: "rgba(56,189,248,0.15)",
  secondary: "#818cf8",
  accent: "#34d399",
  danger: "#f87171",
  warning: "#fbbf24",
  muted: "rgba(255,255,255,0.45)",
  mutedBg: "rgba(255,255,255,0.04)",
};

const EMOTION_COLORS = {
  happy: "#34d399", neutral: "#38bdf8", sad: "#818cf8",
  anxious: "#fbbf24", angry: "#f87171", lonely: "#c084fc", confused: "#67e8f9"
};
const EMOTION_ICONS = {
  happy: "😄", neutral: "😐", sad: "😔", anxious: "😰", angry: "😠", lonely: "😞", confused: "😕"
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(13,21,37,0.97)", border: "1px solid rgba(56,189,248,0.25)",
      borderRadius: "10px", padding: "10px 14px", backdropFilter: "blur(12px)"
    }}>
      <p style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}>{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color: e.color || THEME.primary, fontSize: "13px", fontWeight: 600 }}>
          {e.name}: <span style={{ color: "#e2e8f0" }}>{e.value}</span>
        </p>
      ))}
    </div>
  );
};

const DARK_CURSOR = { fill: "rgba(56,189,248,0.06)", stroke: "rgba(56,189,248,0.15)", strokeWidth: 1, radius: 4 };

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div
    style={{
      background: THEME.card, border: `1px solid ${THEME.cardBorder}`,
      borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden",
      transition: "all 0.3s ease", cursor: "default"
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = color + "44";
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = `0 0 30px ${color}22`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = THEME.cardBorder;
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, borderRadius: "50%" }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={20} color={color} />
      </div>
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: trend > 0 ? THEME.accent : trend < 0 ? THEME.danger : THEME.muted }}>
          {trend > 0 ? <ChevronUp size={14} /> : trend < 0 ? <ChevronDown size={14} /> : <Minus size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p style={{ color: THEME.muted, fontSize: "12px", marginTop: "14px", marginBottom: "4px" }}>{label}</p>
    <p style={{ color: "#e2e8f0", fontSize: "26px", fontWeight: 700, lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ color: THEME.muted, fontSize: "11px", marginTop: "6px" }}>{sub}</p>}
  </div>
);

const ChartCard = ({ title, subtitle, icon: Icon, color = THEME.primary, children }) => (
  <div style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "16px", padding: "20px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <h3 style={{ color: "#e2e8f0", fontSize: "14px", fontWeight: 650 }}>{title}</h3>
        {subtitle && <p style={{ color: THEME.muted, fontSize: "11px" }}>{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const EmptyMsg = ({ msg = "No data available yet." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "150px", gap: "8px", color: THEME.muted }}>
    <AlertCircle size={28} opacity={0.4} />
    <p style={{ fontSize: "13px" }}>{msg}</p>
  </div>
);

export default function AdminOverview() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch platform stats");
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally    { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats, refreshKey]);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "16px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "50%", border: `3px solid ${THEME.primaryGlow}`, borderTopColor: THEME.primary, animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: THEME.muted, fontSize: "14px" }}>Loading platform stats…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px", gap: "12px" }}>
      <AlertCircle size={40} color={THEME.danger} />
      <p style={{ color: THEME.danger }}>{error}</p>
      <button onClick={() => setRefreshKey(k => k + 1)} style={{ padding: "8px 20px", borderRadius: "8px", background: THEME.primaryGlow, border: `1px solid ${THEME.primary}50`, color: THEME.primary, cursor: "pointer" }}>Retry</button>
    </div>
  );

  const s = data?.summary || {};
  const emotionPie = (data?.emotionDistribution || []).map(e => ({
    name: e.emotion, value: e.count, color: EMOTION_COLORS[e.emotion] || "#94a3b8"
  }));
  const maxAgent = (data?.agentUsage || []).reduce((m, a) => a.messages > m ? a.messages : m, 0) || 1;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Platform Overview</h2>
          <p style={{ fontSize: "13px", color: THEME.muted, marginTop: "2px" }}>Real-time statistics from your MongoDB database</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`, color: THEME.primary, cursor: "pointer", fontSize: "12px" }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        <StatCard icon={Users}         label="Total Users"       value={s.totalUsers        || 0} sub="Registered accounts"  color={THEME.primary}    />
        <StatCard icon={Bot}           label="Total Agents"      value={s.totalAgents       || 0} sub="Default + custom"     color={THEME.secondary}  />
        <StatCard icon={MessageSquare} label="Conversations"     value={s.totalConversations|| 0} sub="Across all users"     color={THEME.accent}     />
        <StatCard icon={Activity}      label="Total Messages"    value={s.totalMessages     || 0} sub="All messages sent"    color={THEME.warning}    />
        <StatCard icon={Zap}           label="Avg Msgs / Convo"  value={s.avgMsgPerConvo    || 0} sub="Messages per chat"   color="#f472b6"          />
        <StatCard icon={Heart}         label="Dominant Emotion"  value={(EMOTION_ICONS[s.dominantEmotion] || "😐") + " " + (s.dominantEmotion || "—")} sub="Most common emotion" color={EMOTION_COLORS[s.dominantEmotion] || THEME.muted} />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
        <ChartCard title="Monthly Activity" subtitle="User registrations & conversations" icon={Calendar} color={THEME.primary}>
          {!data?.monthlyActivity?.length ? <EmptyMsg /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="users"         name="New Users"     fill={THEME.primary}   radius={[4,4,0,0]} fillOpacity={0.85} />
                <Bar dataKey="conversations" name="Conversations" fill={THEME.secondary} radius={[4,4,0,0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Emotion Distribution" subtitle="Platform-wide emotion breakdown" icon={Heart} color="#f472b6">
          {!emotionPie.length ? <EmptyMsg /> : (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={emotionPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {emotionPie.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {emotionPie.map((e, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                      <span style={{ color: THEME.muted, fontSize: "11px" }}>{EMOTION_ICONS[e.name]} {e.name}</span>
                    </div>
                    <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: 600 }}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Last 30 Days Area Chart */}
      <div style={{ marginBottom: "14px" }}>
        <ChartCard title="Message Volume — Last 30 Days" subtitle="Daily message count across all users" icon={TrendingUp} color={THEME.accent}>
          {!data?.last30Days?.length ? <EmptyMsg /> : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={data.last30Days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={THEME.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="messages" name="Messages" stroke={THEME.accent} fill="url(#areaGradAdmin)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Bottom Row: Agent Usage + Top Users */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <ChartCard title="Agent Usage" subtitle="Messages handled per agent" icon={Bot} color={THEME.secondary}>
          {!data?.agentUsage?.length ? <EmptyMsg /> : (
            <div>
              {data.agentUsage.map((a, i) => {
                const pct = (a.messages / maxAgent) * 100;
                return (
                  <div key={i} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: 600 }}>🤖 {a.name}</span>
                      <span style={{ color: THEME.muted, fontSize: "11px" }}>{a.messages} msgs</span>
                    </div>
                    <div style={{ height: "5px", borderRadius: "10px", background: "rgba(255,255,255,0.06)" }}>
                      <div style={{ height: "100%", borderRadius: "10px", width: `${pct}%`, background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary})`, transition: "width 1s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Most Active Users" subtitle="Ranked by total messages sent" icon={Crown} color={THEME.warning}>
          {!data?.topUsers?.length ? <EmptyMsg /> : (
            <div>
              {data.topUsers.map((u, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "8px 0",
                  borderBottom: i < data.topUsers.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                }}>
                  <span style={{ fontSize: "12px", color: i < 3 ? THEME.warning : THEME.muted, fontWeight: 700, width: "18px", textAlign: "center" }}>{i + 1}</span>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0, background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>👤</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.fullName}</p>
                    <p style={{ color: THEME.muted, fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ color: THEME.warning, fontSize: "13px", fontWeight: 700 }}>{u.messages}</p>
                    <p style={{ color: THEME.muted, fontSize: "10px" }}>msgs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
