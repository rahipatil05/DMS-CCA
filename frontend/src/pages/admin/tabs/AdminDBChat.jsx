import { useState, useRef, useEffect } from "react";
import {
  Send, Database, Loader2, AlertCircle, Copy, Check,
  ChevronRight, Sparkles, Bot, X, Code2, Terminal
} from "lucide-react";

const THEME = {
  bg: "#060b13", card: "#0d1525", cardBorder: "rgba(255,255,255,0.08)",
  primary: "#38bdf8", primaryGlow: "rgba(56,189,248,0.15)",
  secondary: "#818cf8", accent: "#34d399",
  danger: "#f87171", warning: "#fbbf24",
  muted: "rgba(255,255,255,0.45)", mutedBg: "rgba(255,255,255,0.04)",
};

const EXAMPLES = [
  "How many users are registered?",
  "Show me all admin users",
  "Which agent has the most conversations?",
  "List the top 5 most active users by message count",
  "How many conversations happened today?",
  "What is the most common emotion across all messages?",
  "Show me all custom agents created by users",
  "How many messages were sent in the last 7 days?",
];

function ResultTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const keys = Object.keys(data[0] || {}).filter(k => k !== "__v");
  return (
    <div style={{ overflowX: "auto", marginTop: "8px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr>
            {keys.map(k => (
              <th key={k} style={{ padding: "6px 10px", textAlign: "left", color: THEME.primary, fontWeight: 700, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${THEME.cardBorder}` }}>{k}</th>
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

function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const copyQuery = () => {
    navigator.clipboard.writeText(msg.generatedQuery || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
      {/* Avatar */}
      <div style={{
        width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
        background: isUser ? `${THEME.secondary}20` : `linear-gradient(135deg, ${THEME.primary}80, ${THEME.secondary}80)`,
        border: `1px solid ${isUser ? THEME.secondary + "30" : THEME.primary + "30"}`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        {isUser ? <span style={{ fontSize: "15px" }}>👤</span> : <Database size={16} color={THEME.primary} />}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: "80%", minWidth: "120px" }}>
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
                    <div style={{ padding: "8px 12px 10px", overflowX: "auto" }}>
                      <code style={{ color: THEME.accent, fontSize: "11px", fontFamily: "monospace", whiteSpace: "nowrap" }}>{msg.generatedQuery}</code>
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
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                          <span style={{ color: THEME.primary, fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>{r}</span>
                          <span style={{ color: THEME.muted, fontSize: "13px" }}>{msg.content}</span>
                        </div>
                      );
                    }
                    // Single-row aggregate that only has _id:null + one scalar field (e.g. {total:492,_id:null})
                    if (Array.isArray(r) && r.length === 1) {
                      const row    = r[0];
                      const valKey = Object.keys(row).find(k => k !== "_id" && typeof row[k] === "number");
                      if (valKey) {
                        return (
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                            <span style={{ color: THEME.primary, fontSize: "36px", fontWeight: 800, lineHeight: 1 }}>{row[valKey]}</span>
                            <span style={{ color: THEME.muted, fontSize: "13px" }}>{valKey} · {msg.content}</span>
                          </div>
                        );
                      }
                    }
                    // Array of results → table
                    if (Array.isArray(r) && r.length > 0) {
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

export default function AdminDBChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello Admin! I can query your MongoDB database in plain English. Ask me anything about users, agents, or conversations.",
      generatedQuery: null,
      result: null,
      timestamp: new Date()
    }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel]     = useState("llama3.1");
  const endRef                = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuery = async (question) => {
    const q = (question || input).trim();
    if (!q || loading) return;
    setInput("");

    setMessages(prev => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin/chat-query", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, ollamaModel: model })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.message || "An error occurred.",
          generatedQuery: data.generatedQuery || null,
          error: true,
          timestamp: new Date()
        }]);
      } else {
        const count = data.resultCount;
        const summary = typeof data.result === "number"
          ? `The answer is:`
          : Array.isArray(data.result)
          ? `Found ${data.result.length} result${data.result.length !== 1 ? "s" : ""}:`
          : "Here is the result:";

        setMessages(prev => [...prev, {
          role: "assistant",
          content: summary,
          generatedQuery: data.generatedQuery,
          result: data.result,
          timestamp: data.timestamp
        }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Network error: ${e.message}. Make sure the backend is running.`,
        error: true,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
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
    timestamp: new Date()
  }]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", display: "flex", alignItems: "center", gap: "10px" }}>
            <Database size={22} color="#f472b6" style={{ flexShrink: 0 }} />
            AI Database Chatbot
          </h2>
          <p style={{ fontSize: "13px", color: THEME.muted, marginTop: "2px" }}>
            Ask questions in plain English · Powered by Ollama LLM · Read-only queries
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select value={model} onChange={e => setModel(e.target.value)}
            style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "8px", padding: "6px 10px", color: "#e2e8f0", fontSize: "11px", outline: "none" }}>
            <option value="llama3.1">llama3.1</option>
            <option value="llama3">llama3</option>
            <option value="mistral">mistral</option>
            <option value="codellama">codellama</option>
            <option value="phi3">phi3</option>
          </select>
          <button onClick={clearChat} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "8px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, cursor: "pointer", fontSize: "11px" }}>
            <X size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Example prompts */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", flexShrink: 0 }}>
        {EXAMPLES.map((ex, i) => (
          <button key={i} onClick={() => sendQuery(ex)} disabled={loading}
            style={{
              flexShrink: 0,
              padding: "5px 10px",
              borderRadius: "20px",
              background: `rgba(244,114,182,0.08)`,
              border: "1px solid rgba(244,114,182,0.2)",
              color: "#f9a8d4",
              cursor: "pointer",
              fontSize: "11px",
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,114,182,0.15)"; e.currentTarget.style.borderColor = "rgba(244,114,182,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,114,182,0.08)"; e.currentTarget.style.borderColor = "rgba(244,114,182,0.2)"; }}
          >
            <Sparkles size={9} style={{ display: "inline", marginRight: "4px" }} />
            {ex}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, overflowY: "auto",
        background: THEME.card,
        border: `1px solid ${THEME.cardBorder}`,
        borderRadius: "16px",
        padding: "20px"
      }}>
        {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}

        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0, background: `linear-gradient(135deg, ${THEME.primary}80, ${THEME.secondary}80)`, border: `1px solid ${THEME.primary}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Database size={16} color={THEME.primary} />
            </div>
            <div style={{ background: THEME.card, border: `1px solid ${THEME.primary}20`, borderRadius: "2px 12px 12px 12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Loader2 size={16} color={THEME.primary} style={{ animation: "spin 0.8s linear infinite" }} />
              <div>
                <p style={{ color: THEME.muted, fontSize: "12px" }}>Generating Mongoose query via Ollama…</p>
                <p style={{ color: THEME.muted, fontSize: "10px", marginTop: "2px" }}>Executing against MongoDB…</p>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
