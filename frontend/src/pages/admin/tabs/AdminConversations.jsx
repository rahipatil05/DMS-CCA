import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Search, RefreshCw, AlertCircle,
  ChevronDown, ChevronUp, Bot, User, ChevronLeft, ChevronRight
} from "lucide-react";

const T = {
  card: "#0d1525", border: "rgba(255,255,255,0.08)",
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
  const [convos, setConvos]     = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState(null);

  const fetchConvos = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/admin/conversations?page=${p}&limit=15`, { credentials: "include" });
      const data = await res.json();
      setConvos(data.conversations || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch {} finally { setLoading(false); }
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
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Conversation Explorer</h2>
          <p className="text-xs mt-0.5" style={{ color: T.muted }}>{total} total conversations</p>
        </div>
        <button onClick={() => fetchConvos(page)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs cursor-pointer hover:opacity-80 transition-all"
          style={{ background: `${T.primary}12`, border: `1px solid ${T.primary}30`, color: T.primary }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filter by user, agent, or message…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none text-slate-100"
          style={{ background: T.card, border: `1px solid ${T.border}` }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-sm" style={{ color: T.muted }}>Loading conversations…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16" style={{ color: T.muted }}>
          <AlertCircle size={28} opacity={0.4} />
          <p className="text-sm">No conversations found</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}`, background: T.card }}>
          {filtered.map((c, idx) => {
            const ec     = EMOTION_COLORS[c.lastEmotion] || T.muted;
            const isOpen = expanded === c._id;
            return (
              <div key={c._id} style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>

                {/* ── Row ── */}
                <div onClick={() => toggle(c._id)}
                  className="cursor-pointer transition-colors hover:bg-white/4 p-3 sm:p-4">

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-base"
                      style={{ background: `${T.primary}15`, border: `1px solid ${T.primary}25` }}>💬</div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-0.5">
                        <span className="text-sm font-bold text-slate-100 truncate">{c.user?.fullName || "Unknown"}</span>
                        <span className="text-[11px] font-medium shrink-0" style={{ color: T.muted }}>→ 🤖 {c.agent?.name || "?"}</span>
                      </div>
                      <p className="text-xs truncate mb-1.5" style={{ color: T.muted }}>{c.lastMessage || "No messages"}</p>

                      {/* Meta chips row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Emotion */}
                        {c.lastEmotion && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ background: `${ec}18`, border: `1px solid ${ec}40`, color: ec }}>
                            {EMOTION_ICONS[c.lastEmotion]} {c.lastEmotion}
                          </span>
                        )}
                        {/* Message count */}
                        <span className="text-[10px] font-bold" style={{ color: T.primary }}>
                          {c.messageCount} msg{c.messageCount !== 1 ? "s" : ""}
                        </span>
                        {/* Date */}
                        <span className="text-[10px]" style={{ color: T.muted }}>
                          {new Date(c.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                        </span>
                        {/* Email — hidden on xs */}
                        <span className="hidden sm:inline text-[10px] truncate max-w-[140px]" style={{ color: T.muted }}>
                          {c.user?.email || ""}
                        </span>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <div className="shrink-0 mt-1" style={{ color: T.muted }}>
                      {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </div>
                  </div>
                </div>

                {/* ── Expanded messages ── */}
                {isOpen && (
                  <div className="px-4 pb-4 max-h-80 overflow-y-auto border-t border-white/5"
                    style={{ paddingLeft: "clamp(16px, 4vw, 60px)" }}>
                    {(c.messages || []).length === 0 ? (
                      <p className="text-xs text-center py-5" style={{ color: T.muted }}>No messages</p>
                    ) : (
                      <div className="pt-3 space-y-2.5">
                        {c.messages.map((m, i) => {
                          const isUser = m.role === "user";
                          const mc = EMOTION_COLORS[m.emotion] || T.muted;
                          return (
                            <div key={i} className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                              <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center"
                                style={{
                                  background: isUser ? `${T.secondary}20` : `${T.primary}20`,
                                  border: `1px solid ${isUser ? T.secondary : T.primary}30`
                                }}>
                                {isUser ? <User size={11} color={T.secondary} /> : <Bot size={11} color={T.primary} />}
                              </div>
                              <div className="max-w-[80%]">
                                <div className="px-3 py-2 rounded-xl text-xs leading-relaxed"
                                  style={{
                                    background: isUser ? `${T.secondary}12` : `${T.primary}10`,
                                    border: `1px solid ${isUser ? T.secondary : T.primary}20`,
                                    borderRadius: isUser ? "12px 2px 12px 12px" : "2px 12px 12px 12px",
                                    color: "#e2e8f0"
                                  }}>
                                  {m.content}
                                </div>
                                <div className={`flex items-center gap-1.5 mt-1 ${isUser ? "justify-end" : ""}`}>
                                  {m.emotion && m.emotion !== "neutral" && (
                                    <span className="text-[9px]" style={{ color: mc }}>{EMOTION_ICONS[m.emotion]} {m.emotion}</span>
                                  )}
                                  <span className="text-[9px]" style={{ color: T.muted }}>
                                    {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => fetchConvos(page - 1)} disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-40"
            style={{ background: T.mutedBg, border: `1px solid ${T.border}`, color: "#e2e8f0" }}>
            <ChevronLeft size={13} /> Prev
          </button>
          <span className="text-xs" style={{ color: T.muted }}>Page {page} of {pages}</span>
          <button onClick={() => fetchConvos(page + 1)} disabled={page >= pages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs cursor-pointer disabled:opacity-40"
            style={{ background: T.mutedBg, border: `1px solid ${T.border}`, color: "#e2e8f0" }}>
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
