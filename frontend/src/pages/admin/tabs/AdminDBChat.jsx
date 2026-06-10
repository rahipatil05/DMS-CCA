import { useState, useRef, useEffect } from "react";
import apiFetch from "@/lib/api";
import {
  Send, Database, Loader2, AlertCircle, Copy, Check,
  ChevronRight, Sparkles, Bot, X, Code2, Terminal,
  ChevronDown, BarChart3, Users, MessageSquare, Search, Zap
} from "lucide-react";

const THEME = {
  bg: "#060b13", card: "#0d1525", cardBorder: "rgba(255,255,255,0.08)",
  primary: "#38bdf8", primaryGlow: "rgba(56,189,248,0.15)",
  secondary: "#818cf8", accent: "#34d399",
  danger: "#f87171", warning: "#fbbf24",
  pink: "#f472b6", pinkGlow: "rgba(244,114,182,0.15)",
  muted: "rgba(255,255,255,0.45)", mutedBg: "rgba(255,255,255,0.04)",
};

const EXAMPLE_CATEGORIES = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
    color: THEME.primary,
    prompts: [
      "How many users are registered?",
      "How many agents exist on the platform?",
      "How many total conversations have happened?",
      "What is the total message count across all conversations?",
      "Average messages per conversation",
    ]
  },
  {
    id: "users",
    label: "User Analytics",
    icon: Users,
    color: THEME.secondary,
    prompts: [
      "Show me all admin users",
      "Top 5 most active users by message count",
      "Which users have never chatted?",
      "List users who have the interest 'hiking'",
      "Show users with personality trait 'introvert'",
      "How many users signed up this month?",
    ]
  },
  {
    id: "agents",
    label: "Agent Analytics",
    icon: Bot,
    color: THEME.accent,
    prompts: [
      "Which agent is the most popular?",
      "Show all custom agents created by users",
      "Default agents vs custom agents count",
      "List agents by preferred response length",
      "Which agents have zero conversations?",
    ]
  },
  {
    id: "conversations",
    label: "Conversations",
    icon: MessageSquare,
    color: THEME.warning,
    prompts: [
      "How many conversations happened today?",
      "Messages sent in the last 7 days",
      "What is the most common emotion across all messages?",
      "Emotion distribution across all messages",
      "Daily message count for the last 30 days",
    ]
  },
  {
    id: "deep",
    label: "Deep Queries",
    icon: Search,
    color: THEME.pink,
    prompts: [
      "Compare message counts between each agent",
      "Show me users who chatted with more than 3 different agents",
      "Which hour of the day has the most messages?",
      "What is this project about?",
    ]
  }
];

function ResultTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const keys = Object.keys(data[0] || {}).filter(k => k !== "__v");
  return (
    <div className="dbchat-table-wrap" style={{ overflowX: "auto", marginTop: "8px", WebkitOverflowScrolling: "touch" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", minWidth: "320px" }}>
        <thead>
          <tr>
            {keys.map(k => (
              <th key={k} style={{ padding: "6px 10px", textAlign: "left", color: THEME.primary, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${THEME.cardBorder}`, whiteSpace: "nowrap" }}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 20).map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
              {keys.map(k => (
                <td key={k} style={{ padding: "6px 10px", color: "#e2e8f0", fontSize: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row[k] === null ? <span style={{ color: THEME.muted }}>null</span>
                    : typeof row[k] === "boolean" ? <span style={{ color: row[k] ? THEME.accent : THEME.danger }}>{String(row[k])}</span>
                      : typeof row[k] === "object" ? <span style={{ color: THEME.muted }}>… object …</span>
                        : String(row[k])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 20 && <p style={{ color: THEME.muted, fontSize: "10px", marginTop: "6px", textAlign: "center" }}>Showing first 20 of {data.length} results</p>}
    </div>
  );
}

function SummaryBlock({ summary }) {
  if (!summary) return null;
  return (
    <div style={{
      padding: "10px 14px",
      marginBottom: "8px",
      background: "linear-gradient(135deg, rgba(56,189,248,0.06), rgba(129,140,248,0.06))",
      borderRadius: "8px",
      border: `1px solid rgba(56,189,248,0.12)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <Sparkles size={12} color={THEME.primary} />
        <span style={{ fontSize: "10px", fontWeight: 700, color: THEME.primary, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Summary</span>
      </div>
      <p style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>{summary}</p>
    </div>
  );
}

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const copyQuery = () => {
    navigator.clipboard.writeText(msg.generatedQuery || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dbchat-bubble-row" style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
      {/* Avatar */}
      <div className="dbchat-avatar" style={{
        width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
        background: isUser ? `${THEME.secondary}20` : `linear-gradient(135deg, ${THEME.primary}80, ${THEME.secondary}80)`,
        border: `1px solid ${isUser ? THEME.secondary + "30" : THEME.primary + "30"}`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {isUser ? <span style={{ fontSize: "15px" }}>👤</span> : <Database size={16} color={THEME.primary} />}
      </div>

      {/* Bubble */}
      <div className="dbchat-bubble" style={{ maxWidth: "80%", minWidth: "120px" }}>
        {isUser ? (
          <div style={{
            background: `${THEME.secondary}15`,
            border: `1px solid ${THEME.secondary}25`,
            borderRadius: "12px 2px 12px 12px",
            padding: "12px 14px"
          }}>
            <p style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: 1.6 }}>{msg.content}</p>
          </div>
        ) : (
          <div style={{
            background: THEME.card,
            border: `1px solid ${msg.error ? THEME.danger + "40" : THEME.primary + "20"}`,
            borderRadius: "2px 12px 12px 12px",
            overflow: "hidden"
          }}>
            {/* Error */}
            {msg.error ? (
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <AlertCircle size={15} color={THEME.danger} />
                  <span style={{ color: THEME.danger, fontSize: "12px", fontWeight: 700 }}>Error</span>
                </div>
                <p style={{ color: "#fca5a5", fontSize: "13px", lineHeight: 1.5 }}>{msg.content}</p>
              </div>
            ) : (
              <>
                {/* AI Summary (new — rendered above everything else) */}
                {msg.summary && (
                  <div style={{ padding: "12px 14px 0" }}>
                    <SummaryBlock summary={msg.summary} />
                  </div>
                )}

                {/* Generated Query */}
                {msg.generatedQuery && (
                  <div style={{ borderBottom: `1px solid ${THEME.cardBorder}`, background: "rgba(0,0,0,0.3)" }}>
                    <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Terminal size={11} color={THEME.primary} />
                        <span style={{ color: THEME.muted, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Generated Query</span>
                      </div>
                      <button onClick={copyQuery} style={{ background: "transparent", border: "none", color: THEME.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", fontSize: "10px" }}>
                        {copied ? <Check size={10} color={THEME.accent} /> : <Copy size={10} />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <div className="dbchat-query-code" style={{ padding: "8px 12px 10px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                      <code style={{ color: THEME.accent, fontSize: "11px", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{msg.generatedQuery}</code>
                    </div>
                  </div>
                )}

                {/* Result */}
                <div style={{ padding: "12px 14px" }}>
                  {(() => {
                    const r = msg.result;
                    // Pure number (countDocuments)
                    if (typeof r === "number") {
                      return (
                        <div className="dbchat-result-number" style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                          <span className="dbchat-big-num" style={{ color: THEME.primary, fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>{r}</span>
                          <span style={{ color: THEME.muted, fontSize: "13px" }}>{msg.content}</span>
                        </div>
                      );
                    }
                    // Single-row aggregate that only has _id:null + one scalar field (e.g. {total:492,_id:null})
                    if (Array.isArray(r) && r.length === 1) {
                      const row = r[0];
                      const valKey = Object.keys(row).find(k => k !== "_id" && typeof row[k] === "number");
                      if (valKey) {
                        return (
                          <div className="dbchat-result-number" style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                            <span className="dbchat-big-num" style={{ color: THEME.primary, fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>{typeof row[valKey] === "number" && row[valKey] % 1 !== 0 ? row[valKey].toFixed(1) : row[valKey]}</span>
                            <span style={{ color: THEME.muted, fontSize: "13px" }}>{valKey} · {msg.content}</span>
                          </div>
                        );
                      }
                    }
                    // Single primitive (string, boolean)
                    if (typeof r === "string" || typeof r === "boolean") {
                      if (!msg.generatedQuery && typeof r === "string") {
                        return (
                          <p style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {r}
                          </p>
                        );
                      }
                      return (
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <span style={{ color: THEME.primary, fontSize: "18px", fontWeight: 600 }}>{String(r)}</span>
                        </div>
                      );
                    }
                    // Array of results
                    if (Array.isArray(r) && r.length > 0) {
                      // Array of primitives
                      if (typeof r[0] !== "object") {
                        return (
                          <>
                            <p style={{ color: THEME.muted, fontSize: "12px", marginBottom: "8px" }}>
                              {msg.content} · <span style={{ color: THEME.primary }}>{r.length} record{r.length !== 1 ? "s" : ""}</span>
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                              {r.map((item, idx) => (
                                <span key={idx} style={{ padding: "4px 8px", background: THEME.mutedBg, borderRadius: "4px", color: "#e2e8f0", fontSize: "12px", border: `1px solid ${THEME.cardBorder}` }}>
                                  {String(item)}
                                </span>
                              ))}
                            </div>
                          </>
                        );
                      }

                      // Array of objects
                      return (
                        <>
                          <p style={{ color: THEME.muted, fontSize: "12px", marginBottom: "8px" }}>
                            {msg.content} · <span style={{ color: THEME.primary }}>{r.length} record{r.length !== 1 ? "s" : ""}</span>
                          </p>
                          <ResultTable data={r} />
                        </>
                      );
                    }
                    // Empty
                    return (
                      <p style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: 1.6 }}>
                        {Array.isArray(r) ? "0 results found." : msg.content}
                      </p>
                    );
                  })()}
                </div>

                {/* Footer */}
                {msg.timestamp && (
                  <div style={{ padding: "6px 12px 8px", borderTop: `1px solid rgba(255,255,255,0.04)` }}>
                    <span style={{ color: THEME.muted, fontSize: "10px" }}>
                      {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChips({ onSend, loading }) {
  const [openCat, setOpenCat] = useState(null);

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Category buttons row */}
      <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px" }}>
        {EXAMPLE_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isOpen = openCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setOpenCat(isOpen ? null : cat.id)}
              style={{
                flexShrink: 0,
                padding: "6px 12px",
                borderRadius: "10px",
                background: isOpen ? `${cat.color}18` : THEME.mutedBg,
                border: `1px solid ${isOpen ? cat.color + "40" : THEME.cardBorder}`,
                color: isOpen ? cat.color : THEME.muted,
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: isOpen ? 600 : 400,
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.2s ease"
              }}
            >
              <Icon size={12} />
              {cat.label}
              <ChevronDown
                size={10}
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  opacity: 0.6
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Expanded prompt chips */}
      {openCat && (() => {
        const cat = EXAMPLE_CATEGORIES.find(c => c.id === openCat);
        if (!cat) return null;
        return (
          <div style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginTop: "6px",
            padding: "10px 12px",
            background: `${cat.color}08`,
            borderRadius: "10px",
            border: `1px solid ${cat.color}15`,
            animation: "fadeSlide 0.2s ease forwards"
          }}>
            {cat.prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSend(prompt)}
                disabled={loading}
                style={{
                  padding: "5px 10px",
                  borderRadius: "16px",
                  background: `${cat.color}10`,
                  border: `1px solid ${cat.color}20`,
                  color: cat.color,
                  cursor: loading ? "default" : "pointer",
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = `${cat.color}20`; e.currentTarget.style.borderColor = `${cat.color}40`; } }}
                onMouseLeave={e => { e.currentTarget.style.background = `${cat.color}10`; e.currentTarget.style.borderColor = `${cat.color}20`; }}
              >
                <Sparkles size={9} style={{ display: "inline", marginRight: "4px" }} />
                {prompt}
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

export default function AdminDBChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello Admin! I can query your MongoDB database in plain English. Ask me anything about users, agents, or conversations — I'll generate the query, execute it, and summarize the results for you.",
      generatedQuery: null,
      result: null,
      summary: null,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("query"); // "query" or "summarizing"
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build conversation history for the backend
  const buildHistory = () => {
    return messages
      .filter(m => m.role === "user" || (m.role === "assistant" && m.generatedQuery))
      .slice(-10)
      .map(m => ({
        role: m.role,
        content: m.content,
        generatedQuery: m.generatedQuery || null
      }));
  };

  const sendQuery = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);
    setLoadingPhase("query");

    try {
      const history = buildHistory();

      const res = await apiFetch("/api/admin/chat-query", {
        method: "POST",
        body: JSON.stringify({ question: q, history })
      });

      setLoadingPhase("summarizing");
      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.message || "An error occurred.",
          generatedQuery: data.generatedQuery || null,
          error: true,
          summary: null,
          timestamp: new Date()
        }]);
      } else {
        const displayContent = data.explanation || (typeof data.result === "number"
          ? `The answer is:`
          : Array.isArray(data.result)
            ? `Found ${data.result.length} result${data.result.length !== 1 ? "s" : ""}:`
            : "Here is the result:");

        setMessages(prev => [...prev, {
          role: "assistant",
          content: displayContent,
          generatedQuery: data.generatedQuery,
          result: data.result,
          summary: data.summary || null,
          timestamp: data.timestamp
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Network error: ${e.message}. Make sure the backend is running.`,
        error: true,
        summary: null,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      setLoadingPhase("query");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery();
    }
  };

  const clearChat = () => setMessages([{
    role: "assistant",
    content: "Chat cleared. Ready for new queries!",
    generatedQuery: null,
    result: null,
    summary: null,
    timestamp: new Date()
  }]);

  return (
    <div className="dbchat-container" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: "12px" }}>
      {/* Header */}
      <div className="dbchat-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: "8px" }}>
        <div style={{ minWidth: 0 }}>
          <h2 className="dbchat-title" style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "10px" }}>
            <Database size={22} color="#f472b6" style={{ flexShrink: 0 }} />
            AI Database Chatbot
          </h2>
          <p className="dbchat-subtitle" style={{ fontSize: "13px", color: THEME.muted, marginTop: "2px" }}>
            Ask questions in plain English · Powered by Groq LLM · Read-only queries · Multi-turn context
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
          <div className="dbchat-badge-heal" style={{
            display: "flex", alignItems: "center", gap: "4px",
            padding: "5px 10px", borderRadius: "8px",
            background: `${THEME.accent}15`, border: `1px solid ${THEME.accent}30`,
            fontSize: "10px", color: THEME.accent, fontWeight: 600
          }}>
            <Zap size={10} />
            Self-Healing
          </div>
          <button onClick={clearChat} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, cursor: "pointer", fontSize: "11px" }}>
            <X size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Categorized example prompts */}
      <CategoryChips onSend={sendQuery} loading={loading} />

      {/* Chat area */}
      <div className="dbchat-messages" style={{
        flex: 1, overflowY: "auto",
        background: THEME.card,
        border: `1px solid ${THEME.cardBorder}`,
        borderRadius: "16px",
        padding: "20px",
        WebkitOverflowScrolling: "touch"
      }}>
        {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}

        {loading && (
          <div className="dbchat-bubble-row" style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}>
            <div className="dbchat-avatar" style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0, background: `linear-gradient(135deg, ${THEME.primary}80, ${THEME.secondary}80)`, border: `1px solid ${THEME.primary}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={16} color={THEME.primary} />
            </div>
            <div style={{ background: THEME.card, border: `1px solid ${THEME.primary}20`, borderRadius: "2px 12px 12px 12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Loader2 size={16} color={THEME.primary} style={{ animation: "spin 0.8s linear infinite" }} />
              <div>
                <p style={{ color: loadingPhase === "summarizing" ? THEME.accent : THEME.muted, fontSize: "12px", fontWeight: loadingPhase === "summarizing" ? 600 : 400 }}>
                  {loadingPhase === "summarizing" ? "✓ Query executed — Summarizing results…" : "Generating Mongoose query via Groq…"}
                </p>
                <p style={{ color: THEME.muted, fontSize: "10px", marginTop: "2px" }}>
                  {loadingPhase === "summarizing" ? "AI is analyzing the data for you" : "Executing against MongoDB…"}
                </p>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="dbchat-input-bar" style={{
        flexShrink: 0,
        background: THEME.card,
        border: `1px solid ${THEME.cardBorder}`,
        borderRadius: "14px",
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-end",
        gap: "10px"
      }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
          <ChevronRight size={15} color="#f472b6" style={{ flexShrink: 0 }} />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your database… e.g. How many users signed up this week?"
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#e2e8f0",
              fontSize: "14px",
              outline: "none",
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              maxHeight: "100px",
              overflowY: "auto"
            }}
          />
        </div>
        <button
          onClick={() => sendQuery()}
          disabled={loading || !input.trim()}
          style={{
            width: "40px", height: "40px", flexShrink: 0,
            borderRadius: "10px",
            background: loading || !input.trim()
              ? THEME.mutedBg
              : "linear-gradient(135deg, #f472b6, #818cf8)",
            border: loading || !input.trim()
              ? `1px solid ${THEME.cardBorder}`
              : "none",
            color: "#fff",
            cursor: loading || !input.trim() ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s"
          }}
        >
          {loading ? <Loader2 size={17} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={17} />}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Mobile Responsive Overrides ───────────────── */
        @media (max-width: 768px) {
          .dbchat-container {
            height: calc(100vh - 110px) !important;
            height: calc(100dvh - 110px) !important;
            gap: 8px !important;
          }
          .dbchat-header {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .dbchat-title {
            font-size: 18px !important;
            gap: 8px !important;
          }
          .dbchat-subtitle {
            font-size: 11px !important;
            display: none !important;
          }
          .dbchat-badge-heal {
            display: none !important;
          }
          .dbchat-messages {
            padding: 12px !important;
            border-radius: 12px !important;
          }
          .dbchat-bubble-row {
            gap: 8px !important;
          }
          .dbchat-avatar {
            width: 28px !important;
            height: 28px !important;
            border-radius: 8px !important;
          }
          .dbchat-bubble {
            max-width: 92% !important;
            min-width: 0 !important;
          }
          .dbchat-big-num {
            font-size: 28px !important;
          }
          .dbchat-query-code code {
            font-size: 10px !important;
            word-break: break-all !important;
            white-space: pre-wrap !important;
          }
          .dbchat-input-bar {
            padding: 8px 10px !important;
            border-radius: 12px !important;
            gap: 8px !important;
          }
          .dbchat-input-bar textarea {
            font-size: 13px !important;
          }
          .dbchat-table-wrap {
            margin-left: -4px;
            margin-right: -4px;
          }
        }

        @media (max-width: 480px) {
          .dbchat-container {
            gap: 6px !important;
          }
          .dbchat-title {
            font-size: 16px !important;
          }
          .dbchat-messages {
            padding: 10px !important;
          }
          .dbchat-avatar {
            width: 24px !important;
            height: 24px !important;
          }
          .dbchat-bubble {
            max-width: 96% !important;
          }
          .dbchat-big-num {
            font-size: 24px !important;
          }
        }

        /* Touch-friendly scrollbar for tables on mobile */
        .dbchat-table-wrap::-webkit-scrollbar {
          height: 4px;
        }
        .dbchat-table-wrap::-webkit-scrollbar-track {
          background: transparent;
        }
        .dbchat-table-wrap::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
