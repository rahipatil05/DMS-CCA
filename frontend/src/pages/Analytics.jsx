import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiFetch from "@/lib/api";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from "recharts";
import {
    MessageSquare, Bot, TrendingUp, Activity, BarChart3,
    Clock, Calendar, Flame, Smile, Frown, Heart, Zap, Target,
    ArrowLeft, RefreshCw, AlertCircle, Users, Star, Award,
    ChevronUp, ChevronDown, Minus, Info, BookOpen, X, Sparkles, Loader2
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Color palette matching app theme ──────────────────────────────────────────
const THEME = {
    bg: "#060b13",
    card: "#0d1525",
    cardBorder: "rgba(255,255,255,0.08)",
    primary: "#38bdf8",      // sky blue - matches oklch(0.72 0.18 220)
    primaryGlow: "rgba(56,189,248,0.15)",
    secondary: "#818cf8",    // indigo - matches purple theme
    accent: "#34d399",       // emerald
    danger: "#f87171",
    warning: "#fbbf24",
    muted: "rgba(255,255,255,0.45)",
    mutedBg: "rgba(255,255,255,0.04)",
};

// Dark cursor for recharts hover — prevents white flash
const DARK_CURSOR = { fill: 'rgba(56,189,248,0.06)', stroke: 'rgba(56,189,248,0.15)', strokeWidth: 1, radius: 4 };
const RADAR_CURSOR = { stroke: 'rgba(56,189,248,0.2)', strokeWidth: 1 };

const EMOTION_COLORS = {
    happy:    "#34d399",  // emerald
    neutral:  "#38bdf8",  // sky
    sad:      "#818cf8",  // indigo
    anxious:  "#fbbf24",  // amber
    angry:    "#f87171",  // red
    lonely:   "#c084fc",  // purple
    confused: "#67e8f9",  // cyan
};

const EMOTION_ICONS = {
    happy:    "😄",
    neutral:  "😐",
    sad:      "😔",
    anxious:  "😰",
    angry:    "😠",
    lonely:   "😞",
    confused: "😕",
};

const EMOTION_LABELS = {
    happy: "Happy", neutral: "Neutral", sad: "Sad",
    anxious: "Anxious", angry: "Angry", lonely: "Lonely", confused: "Confused"
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "rgba(13,21,37,0.95)",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: "10px",
            padding: "10px 14px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
        }}>
            <p style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}>{label}</p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color || THEME.primary, fontSize: "13px", fontWeight: 600 }}>
                    {entry.name}: <span style={{ color: "#e2e8f0" }}>{entry.value}</span>
                </p>
            ))}
        </div>
    );
};

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, glow, trend }) => (
    <div style={{
        background: THEME.card,
        border: `1px solid ${THEME.cardBorder}`,
        borderRadius: "16px",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        cursor: "default"
    }}
        onMouseEnter={e => {
            e.currentTarget.style.borderColor = color + "44";
            e.currentTarget.style.boxShadow = `0 0 30px ${color}22`;
            e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = THEME.cardBorder;
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
        }}
    >
        {/* Glow orb */}
        <div style={{
            position: "absolute", top: "-20px", right: "-20px",
            width: "80px", height: "80px",
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            borderRadius: "50%"
        }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: `${color}18`, border: `1px solid ${color}33`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
                <Icon size={20} color={color} />
            </div>
            {trend !== undefined && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "3px", fontSize: "12px",
                    color: trend > 0 ? THEME.accent : trend < 0 ? THEME.danger : THEME.muted
                }}>
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

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, color = THEME.primary }) => (
    <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
                width: "32px", height: "32px", borderRadius: "9px",
                background: `${color}18`, border: `1px solid ${color}33`,
                display: "flex", alignItems: "center", justifyContent: "center"
            }}>
                <Icon size={16} color={color} />
            </div>
            <h3 style={{ color: "#e2e8f0", fontSize: "15px", fontWeight: 650 }}>{title}</h3>
        </div>
        {subtitle && <p style={{ color: THEME.muted, fontSize: "12px", marginTop: "4px", paddingLeft: "42px" }}>{subtitle}</p>}
    </div>
);

// ── Chart Card ─────────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, icon: Icon, color = THEME.primary, children, span = 1 }) => (
    <div style={{
        background: THEME.card,
        border: `1px solid ${THEME.cardBorder}`,
        borderRadius: "16px",
        padding: "20px",
        gridColumn: span > 1 ? `span ${span}` : undefined
    }}>
        <SectionHeader icon={Icon} title={title} subtitle={subtitle} color={color} />
        {children}
    </div>
);

// ── Empty State ────────────────────────────────────────────────────────────────
const EmptyState = ({ message = "No data yet. Start chatting to see analytics!" }) => (
    <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        height: "150px", color: THEME.muted, gap: "8px"
    }}>
        <AlertCircle size={28} opacity={0.4} />
        <p style={{ fontSize: "13px" }}>{message}</p>
    </div>
);

// ── Heatmap ────────────────────────────────────────────────────────────────────
const ActivityHeatmap = ({ data }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const maxCount = data.reduce((m, d) => d.count > m ? d.count : m, 0) || 1;
    const getCell = (day, hour) => data.find(d => d.day === day && d.hour === hour)?.count || 0;

    return (
        <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `40px repeat(24, 1fr)`, gap: "3px", minWidth: "500px" }}>
                {/* Header row */}
                <div />
                {hours.map(h => (
                    <div key={h} style={{ color: THEME.muted, fontSize: "9px", textAlign: "center", paddingBottom: "4px" }}>
                        {h % 4 === 0 ? `${h}h` : ""}
                    </div>
                ))}
                {/* Data rows */}
                {days.map(day => (
                    <div key={day} style={{ display: "contents" }}>
                        <div style={{ color: THEME.muted, fontSize: "10px", display: "flex", alignItems: "center" }}>{day}</div>
                        {hours.map(h => {
                            const c = getCell(day, h);
                            const intensity = c / maxCount;
                            return (
                                <div key={`${day}-${h}`} title={`${day} ${h}:00 — ${c} messages`} style={{
                                    height: "16px", borderRadius: "3px",
                                    background: c === 0
                                        ? "rgba(255,255,255,0.04)"
                                        : `rgba(56,189,248,${0.15 + intensity * 0.85})`,
                                    cursor: "default", transition: "transform 0.15s",
                                }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Agent Usage Bar ────────────────────────────────────────────────────────────
const AgentBar = ({ agent, max }) => {
    const pct = max > 0 ? (agent.messages / max) * 100 : 0;
    return (
        <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>🤖</span>
                    <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{agent.name}</span>
                    {agent.isDefault && (
                        <span style={{
                            fontSize: "9px", color: THEME.primary, background: `${THEME.primary}18`,
                            border: `1px solid ${THEME.primary}30`, borderRadius: "4px", padding: "1px 5px"
                        }}>DEFAULT</span>
                    )}
                </div>
                <span style={{ color: THEME.muted, fontSize: "12px" }}>{agent.messages} msgs · {agent.conversations} chats</span>
            </div>
            <div style={{ height: "6px", borderRadius: "10px", background: "rgba(255,255,255,0.06)" }}>
                <div style={{
                    height: "100%", borderRadius: "10px", width: `${pct}%`,
                    background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.secondary})`,
                    transition: "width 1s ease"
                }} />
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Analytics() {
    const navigate = useNavigate();
    const { authUser } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [refreshKey, setRefreshKey] = useState(0);

    // Journal State
    const [isGeneratingJournal, setIsGeneratingJournal] = useState(false);
    const [journalData, setJournalData] = useState(null);
    const [showJournalModal, setShowJournalModal] = useState(false);

    const userName = authUser?.fullName?.split(" ")[0] || "User";

    const generateJournal = async () => {
        try {
            setIsGeneratingJournal(true);
            setShowJournalModal(true);
            setJournalData(null);
            
            const res = await apiFetch("/api/analytics/journal");
            
            const json = await res.json();
            if (!res.ok) throw new Error(json.message || "Failed to generate journal");
            
            setJournalData(json.journal);
        } catch (err) {
            setJournalData(`**Error:** ${err.message}`);
        } finally {
            setIsGeneratingJournal(false);
        }
    };

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await apiFetch("/api/analytics");
            if (!res.ok) throw new Error("Failed to fetch analytics");
            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics, refreshKey]);

    const tabs = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "emotions", label: "Emotions", icon: Heart },
        { id: "activity", label: "Activity", icon: Activity },
        { id: "agents", label: "Agents", icon: Bot },
    ];

    if (loading) return (
        <div style={{
            minHeight: "100vh", background: THEME.bg,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px"
        }}>
            <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                border: `3px solid ${THEME.primaryGlow}`,
                borderTopColor: THEME.primary,
                animation: "spin 0.8s linear infinite"
            }} />
            <p style={{ color: THEME.muted, fontSize: "14px" }}>Crunching your data…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{
            minHeight: "100vh", background: THEME.bg,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px"
        }}>
            <AlertCircle size={40} color={THEME.danger} />
            <p style={{ color: THEME.danger, fontSize: "15px" }}>{error}</p>
            <button onClick={() => navigate("/dashboard")} style={{
                marginTop: "8px", padding: "8px 20px", borderRadius: "8px",
                background: THEME.primaryGlow, border: `1px solid ${THEME.primary}50`,
                color: THEME.primary, cursor: "pointer", fontSize: "13px"
            }}>← Back to Dashboard</button>
        </div>
    );

    const s = data?.summary || {};
    const hasData = s.totalMessages > 0;

    // Emotion pie
    const emotionPieData = (data?.emotionDistribution || []).map(e => ({
        name: EMOTION_LABELS[e.emotion] || e.emotion,
        value: e.count,
        color: EMOTION_COLORS[e.emotion] || "#94a3b8",
        icon: EMOTION_ICONS[e.emotion] || "😐"
    }));

    const maxAgentMessages = (data?.agentUsage || []).reduce((m, a) => a.messages > m ? a.messages : m, 0);

    const emotionList = ["happy", "sad", "lonely", "angry", "anxious", "confused", "neutral"];

    return (
        <div style={{
            minHeight: "100vh",
            background: `radial-gradient(ellipse at top right, #0a192f 0%, ${THEME.bg} 60%)`,
            color: "#e2e8f0",
            fontFamily: "'Inter', system-ui, sans-serif"
        }}>
            {/* ── Gradient orbs ───────────────────────────────────────────── */}
            <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
                <div style={{
                    position: "absolute", top: "-60px", left: "-60px",
                    width: "320px", height: "320px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
                    animation: "pulse 4s ease-in-out infinite"
                }} />
                <div style={{
                    position: "absolute", bottom: "-80px", right: "-40px",
                    width: "400px", height: "400px", borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)",
                    animation: "pulse 5s ease-in-out infinite 1s"
                }} />
            </div>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
                @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                .anim { animation: fadeIn 0.5s ease forwards; }
                .tab-btn:hover { background: rgba(56,189,248,0.1) !important; }
                .back-btn:hover { background: rgba(56,189,248,0.12) !important; }
                .analytics-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
                .analytics-wellbeing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .analytics-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 24px; }
                @media (max-width: 768px) {
                    .analytics-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
                    .analytics-grid-2 { grid-template-columns: minmax(0, 1fr) !important; }
                    .analytics-wellbeing-grid { grid-template-columns: minmax(0, 1fr) !important; }
                    .analytics-journal-label { display: none; }
                    .analytics-refresh-label { display: none; }
                }
            `}</style>

            {/* ── Navigation ──────────────────────────────────────────────────── */}
            <nav style={{
                position: "sticky", top: 0, zIndex: 50,
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px)",
                background: "rgba(6,11,19,0.85)",
                padding: "0 12px"
            }}>
                <div style={{
                    maxWidth: "1280px", margin: "0 auto", height: "62px",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <button className="back-btn" onClick={() => navigate("/dashboard")} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            color: THEME.muted, fontSize: "13px", background: THEME.mutedBg,
                            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
                            padding: "6px 12px", cursor: "pointer", transition: "all 0.2s"
                        }}>
                            <ArrowLeft size={14} /> Dashboard
                        </button>
                        <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.1)" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                                width: "34px", height: "34px", borderRadius: "10px",
                                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: `0 0 16px ${THEME.primary}40`
                            }}>
                                <BarChart3 size={17} color="#fff" />
                            </div>
                            <div>
                                <p style={{ fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }} className="hidden sm:block">Analytics</p>
                                <p style={{ fontSize: "10px", color: THEME.muted }} className="hidden sm:block">{s.totalMessages} data points · {userName}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button onClick={generateJournal} disabled={isGeneratingJournal} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            color: THEME.bg, fontSize: "12px", background: THEME.accent, fontWeight: 600,
                            border: `1px solid ${THEME.accent}80`, borderRadius: "8px",
                            padding: "6px 10px", cursor: isGeneratingJournal ? "not-allowed" : "pointer", transition: "all 0.2s",
                            opacity: isGeneratingJournal ? 0.7 : 1, boxShadow: `0 0 15px ${THEME.accent}40`
                        }}>
                            {isGeneratingJournal ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
                            <span className="analytics-journal-label">{isGeneratingJournal ? "Writing..." : "Weekly Journal"}</span>
                        </button>
                        <button onClick={() => setRefreshKey(k => k + 1)} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            color: THEME.primary, fontSize: "12px", background: `${THEME.primary}12`,
                            border: `1px solid ${THEME.primary}30`, borderRadius: "8px",
                            padding: "6px 10px", cursor: "pointer", transition: "all 0.2s"
                        }}>
                            <RefreshCw size={13} /><span className="analytics-refresh-label"> Refresh</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
            <div style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(6,11,19,0.6)", backdropFilter: "blur(12px)"
            }}>
                <div style={{
                    maxWidth: "1280px", margin: "0 auto", padding: "0 24px",
                    display: "flex", gap: "4px", overflowX: "auto", scrollbarWidth: "none"
                }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} className="tab-btn" onClick={() => setActiveTab(tab.id)} style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "12px 16px", fontSize: "13px", fontWeight: active ? 600 : 400,
                                color: active ? THEME.primary : THEME.muted,
                                background: active ? `${THEME.primary}10` : "transparent",
                                border: "none", borderBottom: active ? `2px solid ${THEME.primary}` : "2px solid transparent",
                                cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap"
                            }}>
                                <Icon size={14} /> {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 12px", position: "relative", zIndex: 1 }}>

                {/* ══ OVERVIEW TAB ═══════════════════════════════════════════════ */}
                {activeTab === "overview" && (
                    <div className="anim">
                        {/* Hero stats */}
                        <div className="analytics-stats-grid">
                            <StatCard icon={MessageSquare} label="Total Messages" value={s.totalMessages || 0} sub="All conversations" color={THEME.primary} />
                            <StatCard icon={Activity} label="Conversations" value={s.totalConversations || 0} sub="With all agents" color={THEME.secondary} />
                            <StatCard icon={Bot} label="Agents Used" value={s.totalAgentsUsed || 0} sub="Unique agents" color={THEME.accent} />
                            <StatCard icon={TrendingUp} label="Avg / Chat" value={s.avgMsgPerConversation || 0} sub="Messages per convo" color={THEME.warning} />
                            <StatCard icon={Zap} label="Longest Chat" value={s.longestConversation || 0} sub="Messages in one chat" color="#f472b6" />
                            <StatCard icon={Star} label="Dominant Mood" value={EMOTION_ICONS[s.dominantEmotion] + " " + (EMOTION_LABELS[s.dominantEmotion] || "—")} sub="Most frequent emotion" color={EMOTION_COLORS[s.dominantEmotion] || THEME.muted} />
                            <StatCard icon={Users} label="Your Messages" value={s.totalUserMessages || 0} sub="Messages you sent" color="#67e8f9" />
                            <StatCard icon={Award} label="Avg Msg Length" value={`${s.avgUserMsgLength || 0} ch`} sub="Characters per message" color="#a78bfa" />
                        </div>

                        {/* Monthly Overview + Emotion Pie */}
                        <div className="analytics-grid-2">
                            <ChartCard title="6-Month Overview" subtitle="Messages & conversations per month" icon={Calendar} color={THEME.primary}>
                                {!hasData ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={data.monthlyOverview} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="month" tick={{ fill: THEME.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: THEME.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                            <Legend wrapperStyle={{ fontSize: "11px" }} />
                                            <Bar dataKey="messages" name="Messages" fill={THEME.primary} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                                            <Bar dataKey="conversations" name="Conversations" fill={THEME.secondary} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>

                            <ChartCard title="Emotion Distribution" subtitle="How you feel during conversations" icon={Heart} color="#f472b6">
                                {!hasData || emotionPieData.length === 0 ? <EmptyState /> : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                        <ResponsiveContainer width="55%" height={200}>
                                            <PieChart>
                                                <Pie data={emotionPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                                    paddingAngle={3} dataKey="value"
                                                >
                                                    {emotionPieData.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ flex: 1 }}>
                                            {emotionPieData.map((e, i) => (
                                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: e.color, flexShrink: 0 }} />
                                                        <span style={{ color: THEME.muted, fontSize: "11px" }}>{e.icon} {e.name}</span>
                                                    </div>
                                                    <span style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: 600 }}>{e.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </ChartCard>
                        </div>

                        {/* 30-day area chart */}
                        <ChartCard title="Last 30 Days" subtitle="Daily message volume" icon={TrendingUp} color={THEME.accent}>
                            {!hasData ? <EmptyState /> : (
                                <ResponsiveContainer width="100%" height={180}>
                                    <AreaChart data={data.last30Days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="label" tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                                        <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="messages" name="Messages" stroke={THEME.accent} fill="url(#msgGrad)" strokeWidth={2} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* Recent conversations */}
                        <ChartCard title="Recent Conversations" subtitle="Your latest chats" icon={Clock} color={THEME.secondary} style={{ marginTop: "14px" }}>
                            {!hasData || !data.recentConversations?.length ? <EmptyState /> : (
                                <div>
                                    {data.recentConversations.map((c, i) => (
                                        <div key={i} style={{
                                            display: "flex", alignItems: "flex-start", gap: "12px",
                                            padding: "10px 0",
                                            borderBottom: i < data.recentConversations.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                                        }}>
                                            <div style={{
                                                width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                                                background: `${THEME.primary}18`, border: `1px solid ${THEME.primary}30`,
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Bot size={16} color={THEME.primary} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                                                    <p style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{c.agentName}</p>
                                                    <p style={{ color: THEME.muted, fontSize: "11px", flexShrink: 0 }}>
                                                        {new Date(c.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p style={{ color: THEME.muted, fontSize: "12px", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {c.lastMessage || "No messages"}…
                                                </p>
                                                <p style={{ color: THEME.primary, fontSize: "11px", marginTop: "3px" }}>{c.messageCount} messages</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ChartCard>
                    </div>
                )}

                {/* ══ EMOTIONS TAB ═══════════════════════════════════════════════ */}
                {activeTab === "emotions" && (
                    <div className="anim">
                        {/* Emotion cards */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: "12px", marginBottom: "20px"
                        }}>
                            {emotionList.map(emo => {
                                const found = data?.emotionDistribution?.find(e => e.emotion === emo);
                                return (
                                    <div key={emo} style={{
                                        background: THEME.card, border: `1px solid ${EMOTION_COLORS[emo]}22`,
                                        borderRadius: "14px", padding: "16px", textAlign: "center"
                                    }}>
                                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>{EMOTION_ICONS[emo]}</div>
                                        <p style={{ color: EMOTION_COLORS[emo], fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                                            {EMOTION_LABELS[emo]}
                                        </p>
                                        <p style={{ color: "#e2e8f0", fontSize: "22px", fontWeight: 700 }}>{found?.count || 0}</p>
                                        <p style={{ color: THEME.muted, fontSize: "11px" }}>{found?.percentage || 0}%</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Emotion Trend Line */}
                        <ChartCard title="Emotion Trend (14 Days)" subtitle="Emotional patterns over time" icon={TrendingUp} color={THEME.primary}>
                            {!hasData ? <EmptyState /> : (
                                <ResponsiveContainer width="100%" height={220}>
                                    <LineChart data={data.emotionTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                        <XAxis dataKey="label" tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                                        {emotionList.map(emo => (
                                            <Line key={emo} type="monotone" dataKey={emo} name={EMOTION_LABELS[emo]}
                                                stroke={EMOTION_COLORS[emo]} strokeWidth={2} dot={false} connectNulls />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </ChartCard>

                        {/* Emotion by agent stacked bar */}
                        <div style={{ marginTop: "14px" }}>
                            <ChartCard title="Emotion by Agent" subtitle="How you feel with each agent" icon={Bot} color={THEME.secondary}>
                                {!hasData || !data.emotionByAgent?.length ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={data.emotionByAgent} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="name" tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                            <Legend wrapperStyle={{ fontSize: "10px" }} />
                                            {emotionList.map(emo => (
                                                <Bar key={emo} dataKey={emo} name={EMOTION_LABELS[emo]}
                                                    stackId="a" fill={EMOTION_COLORS[emo]} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>
                        </div>

                        {/* Wellbeing insight */}
                        <div style={{
                            marginTop: "14px", background: THEME.card,
                            border: `1px solid ${THEME.cardBorder}`, borderRadius: "16px", padding: "20px"
                        }}>
                            <SectionHeader icon={Info} title="Wellbeing Insights" subtitle="Based on your conversation patterns" color="#f472b6" />
                            <div className="analytics-wellbeing-grid">
                                {[
                                    {
                                        label: "Positive Ratio",
                                        value: s.totalUserMessages > 0
                                            ? `${Math.round(((data?.emotionDistribution?.find(e => e.emotion === "happy")?.count || 0) / s.totalUserMessages) * 100)}%`
                                            : "N/A",
                                        desc: "Happy messages out of total",
                                        color: THEME.accent, icon: Smile
                                    },
                                    {
                                        label: "Stress Indicators",
                                        value: s.totalUserMessages > 0
                                            ? `${Math.round((((data?.emotionDistribution?.find(e => e.emotion === "anxious")?.count || 0) + (data?.emotionDistribution?.find(e => e.emotion === "angry")?.count || 0)) / s.totalUserMessages) * 100)}%`
                                            : "N/A",
                                        desc: "Anxious + Angry messages",
                                        color: THEME.danger, icon: Frown
                                    },
                                    {
                                        label: "Most Expressive Day",
                                        value: data?.weeklyActivity?.reduce((max, d) => d.messages > max.messages ? d : max, { day: "N/A", messages: 0 })?.day || "N/A",
                                        desc: "Day with most emotional expression",
                                        color: THEME.warning, icon: Flame
                                    },
                                    {
                                        label: "Peak Chat Hour",
                                        value: (() => {
                                            const peak = data?.hourlyActivity?.reduce((max, d) => d.messages > max.messages ? d : max, { label: "N/A", messages: 0 });
                                            return peak?.messages > 0 ? peak.label : "N/A";
                                        })(),
                                        desc: "Hour with most activity",
                                        color: THEME.secondary, icon: Clock
                                    }
                                ].map((item, i) => {
                                    const Ic = item.icon;
                                    return (
                                        <div key={i} style={{
                                            display: "flex", gap: "12px", alignItems: "flex-start",
                                            padding: "14px", borderRadius: "12px",
                                            background: `${item.color}08`, border: `1px solid ${item.color}18`
                                        }}>
                                            <div style={{
                                                width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                                                background: `${item.color}18`, border: `1px solid ${item.color}30`,
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}>
                                                <Ic size={16} color={item.color} />
                                            </div>
                                            <div>
                                                <p style={{ color: THEME.muted, fontSize: "11px" }}>{item.label}</p>
                                                <p style={{ color: item.color, fontSize: "18px", fontWeight: 700 }}>{item.value}</p>
                                                <p style={{ color: THEME.muted, fontSize: "11px" }}>{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ ACTIVITY TAB ═══════════════════════════════════════════════ */}
                {activeTab === "activity" && (
                    <div className="anim">
                        {/* Hourly + Weekly */}
                        <div className="analytics-grid-2">
                            <ChartCard title="Messages by Hour" subtitle="When you're most active" icon={Clock} color={THEME.primary}>
                                {!hasData ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={data.hourlyActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="label" tick={{ fill: THEME.muted, fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                                            <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                            <Bar dataKey="messages" name="Messages" radius={[3, 3, 0, 0]}>
                                                {(data.hourlyActivity || []).map((entry, i) => (
                                                    <Cell key={i} fill={entry.messages > 0 ? THEME.primary : "rgba(255,255,255,0.05)"} fillOpacity={0.7 + (entry.messages / (Math.max(...(data.hourlyActivity || []).map(d => d.messages)) || 1)) * 0.3} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>

                            <ChartCard title="Messages by Day" subtitle="Your weekly rhythm" icon={Calendar} color={THEME.secondary}>
                                {!hasData ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadarChart data={data.weeklyActivity} cx="50%" cy="50%" outerRadius="70%">
                                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                            <PolarAngleAxis dataKey="day" tick={{ fill: THEME.muted, fontSize: 11 }} />
                                            <PolarRadiusAxis tick={false} axisLine={false} />
                                            <Radar name="Messages" dataKey="messages" stroke={THEME.secondary} fill={THEME.secondary} fillOpacity={0.25} />
                                            <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>
                        </div>

                        {/* Activity Heatmap */}
                        <ChartCard title="Activity Heatmap" subtitle="Messages by day & hour (hover for count)" icon={Target} color={THEME.accent}>
                            {!hasData ? <EmptyState /> : <ActivityHeatmap data={data.emotionHeatmap || []} />}
                        </ChartCard>

                        {/* 30-day area trend */}
                        <div style={{ marginTop: "14px" }}>
                            <ChartCard title="Daily Volume — Last 30 Days" subtitle="Complete message history" icon={TrendingUp} color={THEME.primary}>
                                {!hasData ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <AreaChart data={data.last30Days} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="label" tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
                                            <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                            <Area type="monotone" dataKey="messages" name="Messages" stroke={THEME.primary} fill="url(#volGrad)" strokeWidth={2} dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>
                        </div>

                        {/* Summary stats */}
                        <div style={{
                            marginTop: "14px", display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px"
                        }}>
                            {[
                                { label: "Avg Msg Length (You)", value: `${s.avgUserMsgLength} chars`, color: THEME.primary, icon: MessageSquare },
                                { label: "Avg Reply Length (AI)", value: `${s.avgAssistantMsgLength} chars`, color: THEME.secondary, icon: Bot },
                                { label: "Most Active Day", value: data?.weeklyActivity?.reduce((max, d) => d.messages > max.messages ? d : max, { day: "—", messages: 0 })?.day || "—", color: THEME.accent, icon: Flame },
                            ].map((item, i) => {
                                const Ic = item.icon;
                                return (
                                    <StatCard key={i} icon={Ic} label={item.label} value={item.value} color={item.color} />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ══ AGENTS TAB ════════════════════════════════════════════════ */}
                {activeTab === "agents" && (
                    <div className="anim">
                        {/* Agent usage bars */}
                        <ChartCard title="Agent Usage" subtitle="Messages and conversations per agent" icon={Bot} color={THEME.primary}>
                            {!hasData || !data.agentUsage?.length ? <EmptyState /> : (
                                <div style={{ marginTop: "8px" }}>
                                    {data.agentUsage.map((agent, i) => (
                                        <AgentBar key={i} agent={agent} max={maxAgentMessages} />
                                    ))}
                                </div>
                            )}
                        </ChartCard>

                        {/* Agent comparison bar chart */}
                        <div style={{ marginTop: "14px" }}>
                            <ChartCard title="Agent Comparison" subtitle="Side-by-side usage stats" icon={BarChart3} color={THEME.secondary}>
                                {!hasData || !data.agentUsage?.length ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={data.agentUsage} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="name" tick={{ fill: THEME.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                            <Legend wrapperStyle={{ fontSize: "11px" }} />
                                            <Bar dataKey="messages" name="Messages" fill={THEME.primary} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                                            <Bar dataKey="conversations" name="Conversations" fill={THEME.secondary} radius={[4, 4, 0, 0]} fillOpacity={0.85} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>
                        </div>

                        {/* Emotion by agent */}
                        <div style={{ marginTop: "14px" }}>
                            <ChartCard title="Emotions Per Agent" subtitle="Stacked emotional breakdown by agent" icon={Heart} color="#f472b6">
                                {!hasData || !data.emotionByAgent?.length ? <EmptyState /> : (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={data.emotionByAgent} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                            <XAxis dataKey="name" tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: THEME.muted, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={DARK_CURSOR} />
                                            <Legend wrapperStyle={{ fontSize: "10px" }} />
                                            {emotionList.map(emo => (
                                                <Bar key={emo} dataKey={emo} name={EMOTION_LABELS[emo]}
                                                    stackId="a" fill={EMOTION_COLORS[emo]} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </ChartCard>
                        </div>

                        {/* Agent details cards */}
                        <div style={{
                            marginTop: "14px",
                            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px"
                        }}>
                            {(data?.agentUsage || []).map((agent, i) => (
                                <div key={i} style={{
                                    background: THEME.card, border: `1px solid ${THEME.cardBorder}`,
                                    borderRadius: "14px", padding: "16px"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                                        <div style={{
                                            width: "38px", height: "38px", borderRadius: "10px",
                                            background: `${THEME.primary}18`, border: `1px solid ${THEME.primary}30`,
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            <Bot size={18} color={THEME.primary} />
                                        </div>
                                        <div>
                                            <p style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 700 }}>{agent.name}</p>
                                            <p style={{ color: THEME.muted, fontSize: "10px" }}>
                                                {agent.isDefault ? "🔵 Default" : "✨ Custom"}
                                            </p>
                                        </div>
                                    </div>
                                    {[
                                        ["💬 Messages", agent.messages],
                                        ["🗂️ Conversations", agent.conversations],
                                        ["📅 Last Used", agent.lastUsed ? new Date(agent.lastUsed).toLocaleDateString() : "Never"],
                                    ].map(([k, v], j) => (
                                        <div key={j} style={{
                                            display: "flex", justifyContent: "space-between",
                                            padding: "5px 0",
                                            borderBottom: j < 2 ? "1px solid rgba(255,255,255,0.05)" : "none"
                                        }}>
                                            <span style={{ color: THEME.muted, fontSize: "12px" }}>{k}</span>
                                            <span style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: 600 }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* ── Journal Modal Overlay ────────────────────────────────────────── */}
            {showJournalModal && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 100,
                    background: "rgba(6, 11, 19, 0.85)", backdropFilter: "blur(12px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "20px"
                }}>
                    <div className="anim" style={{
                        width: "100%", maxWidth: "650px", maxHeight: "85vh",
                        background: THEME.card, border: `1px solid ${THEME.cardBorder}`,
                        borderRadius: "20px", display: "flex", flexDirection: "column",
                        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 100px rgba(52,211,153,0.1)`,
                        overflow: "hidden"
                    }}>
                        <div style={{
                            padding: "16px 24px", borderBottom: `1px solid ${THEME.cardBorder}`,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            background: "rgba(255,255,255,0.02)"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "32px", height: "32px", borderRadius: "10px",
                                    background: `${THEME.accent}18`, border: `1px solid ${THEME.accent}30`,
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {isGeneratingJournal ? <Loader2 size={16} className="animate-spin text-emerald-400" /> : <Sparkles size={16} color={THEME.accent} />}
                                </div>
                                <div>
                                    <h3 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: 700 }}>Your Weekly Reflection</h3>
                                    <p style={{ color: THEME.muted, fontSize: "11px" }}>AI-generated from your past 7 days of conversations</p>
                                </div>
                            </div>
                            <button onClick={() => setShowJournalModal(false)} style={{
                                background: "none", border: "none", color: THEME.muted, cursor: "pointer",
                                padding: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                                borderRadius: "6px"
                            }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                               onMouseLeave={e => e.currentTarget.style.background = "none"}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="scrollbar-thin" style={{
                            padding: "24px", overflowY: "auto", flex: 1,
                        }}>
                            {isGeneratingJournal ? (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "16px" }}>
                                    <Loader2 size={40} color={THEME.accent} className="animate-spin" />
                                    <p style={{ color: THEME.muted, fontSize: "14px" }}>Analyzing your emotional journey...</p>
                                    <p style={{ color: THEME.muted, fontSize: "11px", maxWidth: "300px", textAlign: "center", fontStyle: "italic" }}>
                                        Reading through the past 7 days to find insights, breakthroughs, and personalized guidance just for you.
                                    </p>
                                </div>
                            ) : journalData ? (
                                <div>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ children }) => <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", color: "white", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>{children}</h1>,
                                            h2: ({ children }) => <h2 style={{ fontSize: "16px", fontWeight: "bold", marginTop: "24px", marginBottom: "12px", color: THEME.accent }}>{children}</h2>,
                                            h3: ({ children }) => <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: "12px 0", color: THEME.primary }}>{children}</h3>,
                                            p: ({ children }) => <p style={{ marginBottom: "16px", color: "#cbd5e1", lineHeight: "1.7", fontSize: "14px" }}>{children}</p>,
                                            ul: ({ children }) => <ul style={{ listStyleType: "disc", marginLeft: "24px", marginBottom: "16px", color: "#cbd5e1" }}>{children}</ul>,
                                            li: ({ children }) => <li style={{ marginBottom: "8px", fontSize: "14px", lineHeight: "1.6" }}>{children}</li>,
                                            strong: ({ children }) => <strong style={{ color: "white", fontWeight: "600" }}>{children}</strong>,
                                            em: ({ children }) => <em style={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>{children}</em>
                                        }}
                                    >
                                        {journalData}
                                    </ReactMarkdown>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
