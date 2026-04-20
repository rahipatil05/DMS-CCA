import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Search, RefreshCw, AlertCircle,
  ChevronDown, ChevronUp, Bot, User, ChevronLeft, ChevronRight
} from "lucide-react";

const THEME = {
  card: "#0d1525", cardBorder: "rgba(255,255,255,0.08)",
  primary: "#38bdf8", secondary: "#818cf8", accent: "#34d399",
  danger: "#f87171", warning: "#fbbf24",
  muted: "rgba(255,255,255,0.45)", mutedBg: "rgba(255,255,255,0.04)",
};

const EMOTION_COLORS = {
  happy: "#34d399", neutral: "#38bdf8", sad: "#818cf8",
  anxious: "#fbbf24", angry: "#f87171", lonely: "#c084fc", confused: "#67e8f9"
};
const EMOTION_ICONS = {
  happy: "😄", neutral: "😐", sad: "😔", anxious: "😰", angry: "😠", lonely: "😞", confused: "😕"
};

export default function AdminConversations() {
  const [convos, setConvos]       = useState([]);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState(null);

  const fetchConvos = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/conversations?page=${p}&limit=15`, { credentials: "include" });
      const data = await res.json();
      setConvos(data.conversations || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConvos(1); }, [fetchConvos]);

  const filtered = convos.filter(c =>
    c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.agent?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Conversation Explorer</h2>
          <p style={{ fontSize: "13px", color: THEME.muted, marginTop: "2px" }}>{total} total conversations across all users</p>
        </div>
        <button onClick={() => fetchConvos(page)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`, color: THEME.primary, cursor: "pointer", fontSize: "12px" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={15} color={THEME.muted} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by user, agent, or message…"
          style={{ width: "100%", background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "10px", padding: "10px 12px 10px 36px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: THEME.muted }}>Loading conversations…</div>
      ) : (
        <div style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "16px", overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px", gap: "8px", color: THEME.muted }}>
              <AlertCircle size={28} opacity={0.4} /><p>No conversations found</p>
            </div>
          ) : (
            filtered.map((c, idx) => {
              const ec = EMOTION_COLORS[c.lastEmotion] || THEME.muted;
              const isOpen = expanded === c._id;
              return (
                <div key={c._id} style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${THEME.cardBorder}` : "none" }}>
                  {/* Row */}
                  <div
                    onClick={() => toggle(c._id)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 80px 90px 110px 40px",
                      alignItems: "center",
                      padding: "12px 16px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      gap: "10px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = THEME.mutedBg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* User + Agent */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0, background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>💬</div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.user?.fullName || "Unknown"}
                        </p>
                        <p style={{ color: THEME.muted, fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          🤖 {c.agent?.name || "Unknown agent"}
                        </p>
                        <p style={{ color: THEME.muted, fontSize: "10px", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.lastMessage || "No messages"}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <span style={{ color: THEME.muted, fontSize: "11px" }}>
                      {new Date(c.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </span>

                    {/* Messages */}
                    <span style={{ color: THEME.primary, fontSize: "13px", fontWeight: 700 }}>{c.messageCount}</span>

                    {/* Emotion */}
                    <span style={{ fontSize: "11px", background: `${ec}18`, border: `1px solid ${ec}40`, color: ec, borderRadius: "6px", padding: "2px 8px", fontWeight: 600 }}>
                      {EMOTION_ICONS[c.lastEmotion]} {c.lastEmotion}
                    </span>

                    {/* User email */}
                    <span style={{ color: THEME.muted, fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.user?.email || "—"}</span>

                    {/* Expand toggle */}
                    <div style={{ color: THEME.muted, display: "flex", justifyContent: "center" }}>
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </div>

                  {/* Expanded messages */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px 60px", maxHeight: "360px", overflowY: "auto" }}>
                      {(c.messages || []).length === 0 ? (
                        <p style={{ color: THEME.muted, fontSize: "12px", textAlign: "center", padding: "20px" }}>No messages</p>
                      ) : (
                        c.messages.map((m, i) => {
                          const isUser = m.role === "user";
                          const mc = EMOTION_COLORS[m.emotion] || THEME.muted;
                          return (
                            <div key={i} style={{
                              display: "flex",
                              flexDirection: isUser ? "row-reverse" : "row",
                              alignItems: "flex-start",
                              gap: "8px",
                              marginBottom: "10px"
                            }}>
                              <div style={{ width: "26px", height: "26px", borderRadius: "7px", flexShrink: 0, background: isUser ? `${THEME.secondary}20` : `${THEME.primary}20`, border: `1px solid ${isUser ? THEME.secondary : THEME.primary}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {isUser ? <User size={12} color={THEME.secondary} /> : <Bot size={12} color={THEME.primary} />}
                              </div>
                              <div style={{ maxWidth: "80%" }}>
                                <div style={{
                                  background: isUser ? `${THEME.secondary}12` : `${THEME.primary}10`,
                                  border: `1px solid ${isUser ? THEME.secondary : THEME.primary}20`,
                                  borderRadius: isUser ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                                  padding: "8px 12px"
                                }}>
                                  <p style={{ color: "#e2e8f0", fontSize: "12px", lineHeight: 1.5 }}>{m.content}</p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                                  {m.emotion && m.emotion !== "neutral" && (
                                    <span style={{ fontSize: "9px", color: mc }}>{EMOTION_ICONS[m.emotion]} {m.emotion}</span>
                                  )}
                                  <span style={{ fontSize: "9px", color: THEME.muted }}>
                                    {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={() => fetchConvos(page - 1)} disabled={page <= 1}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 14px", borderRadius: "8px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: page <= 1 ? THEME.muted : "#e2e8f0", cursor: page <= 1 ? "default" : "pointer", fontSize: "12px" }}
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ color: THEME.muted, fontSize: "12px" }}>Page {page} of {pages}</span>
          <button
            onClick={() => fetchConvos(page + 1)} disabled={page >= pages}
            style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 14px", borderRadius: "8px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: page >= pages ? THEME.muted : "#e2e8f0", cursor: page >= pages ? "default" : "pointer", fontSize: "12px" }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
