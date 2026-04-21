import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, X, Search, RefreshCw,
  Bot, AlertCircle, Globe, Lock, Star,
  Sparkles, Loader2, Check, ChevronRight,
  RotateCcw, Wand2
} from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/lib/api";

const THEME = {
  card: "#0d1525", cardBorder: "rgba(255,255,255,0.08)",
  primary: "#38bdf8", secondary: "#818cf8", accent: "#34d399",
  danger: "#f87171", warning: "#fbbf24", purple: "#f472b6",
  muted: "rgba(255,255,255,0.45)", mutedBg: "rgba(255,255,255,0.04)",
};

const ICON_OPTIONS  = ["Bot", "Heart", "Code", "Brain", "Sparkles", "MessageSquare", "Palette", "Zap", "Star", "Rocket"];
const COLOR_OPTIONS = [
  { label: "Sky→Cyan",     value: "from-sky-500 to-cyan-500" },
  { label: "Blue→Purple",  value: "from-blue-500 to-purple-600" },
  { label: "Green→Teal",   value: "from-green-500 to-teal-500" },
  { label: "Pink→Rose",    value: "from-pink-500 to-rose-500" },
  { label: "Amber→Orange", value: "from-amber-500 to-orange-500" },
  { label: "Indigo→Blue",  value: "from-indigo-500 to-blue-500" },
  { label: "Purple→Pink",  value: "from-purple-500 to-pink-500" },
  { label: "Emerald→Cyan", value: "from-emerald-500 to-cyan-500" },
];
const LENGTH_OPTIONS = ["small", "medium", "long"];
const EMPTY_FORM = {
  name: "", description: "", prompt: "", icon: "Bot",
  color: "from-blue-500 to-purple-600",
  isDefault: false, isPublic: true, preferredLength: "medium"
};

// ── Prompt Enhancer Preview Panel ─────────────────────────────────────────────
function EnhancerPanel({ original, enhanced, onAccept, onDiscard, loading }) {
  return (
    <div style={{
      marginBottom: "14px",
      background: "rgba(244,114,182,0.06)",
      border: "1px solid rgba(244,114,182,0.25)",
      borderRadius: "12px",
      overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px",
        background: "rgba(244,114,182,0.08)",
        borderBottom: "1px solid rgba(244,114,182,0.15)",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Wand2 size={14} color={THEME.purple} />
          <span style={{ color: THEME.purple, fontSize: "12px", fontWeight: 700 }}>
            ✨ AI-Enhanced Prompt
          </span>
        </div>
        {!loading && (
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={onDiscard} title="Discard" style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "4px 10px", borderRadius: "6px",
              background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`,
              color: THEME.muted, cursor: "pointer", fontSize: "11px"
            }}>
              <RotateCcw size={11} /> Discard
            </button>
            <button onClick={onAccept} title="Use enhanced prompt" style={{
              display: "flex", alignItems: "center", gap: "4px",
              padding: "4px 10px", borderRadius: "6px",
              background: `${THEME.accent}18`, border: `1px solid ${THEME.accent}40`,
              color: THEME.accent, cursor: "pointer", fontSize: "11px", fontWeight: 700
            }}>
              <Check size={11} /> Use This
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 0" }}>
            <Loader2 size={15} color={THEME.purple} style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
            <div>
              <p style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: 600 }}>Enhancing with Ollama…</p>
              <p style={{ color: THEME.muted, fontSize: "10px", marginTop: "2px" }}>Rewriting your prompt into a detailed system instruction</p>
            </div>
          </div>
        ) : (
          <p style={{
            color: "#e2e8f0", fontSize: "12px", lineHeight: 1.7,
            whiteSpace: "pre-wrap", wordBreak: "break-word"
          }}>{enhanced}</p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminAgents() {
  const [agents, setAgents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  // Enhancer state
  const [enhancing, setEnhancing]       = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState(null); // null = not shown
  const [ollamaModel, setOllamaModel]   = useState("llama3.1");

  const loadAgents = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await apiFetch("/api/admin/agents");
      const data = await res.json();
      setAgents(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load agents"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const filtered = agents.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setEnhancedPrompt(null);
    setShowForm(true);
  };

  const openEdit = (a) => {
    setForm({
      name: a.name, description: a.description, prompt: a.prompt,
      icon: a.icon, color: a.color, isDefault: a.isDefault,
      isPublic: a.isPublic, preferredLength: a.preferredLength || "medium"
    });
    setEditingId(a._id);
    setEnhancedPrompt(null);
    setShowForm(true);
  };

  // ── Enhance prompt ──────────────────────────────────────────────────────────
  const handleEnhance = async () => {
    const draft = form.prompt.trim();
    if (!draft) { toast.error("Please write a draft prompt first"); return; }
    setEnhancing(true);
    setEnhancedPrompt("__loading__");
    try {
      const res = await apiFetch("/api/admin/enhance-prompt", {
        method: "POST",
        body: JSON.stringify({ draft, agentName: form.name || "AI Agent", ollamaModel })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setEnhancedPrompt(data.enhanced);
    } catch (e) {
      setEnhancedPrompt(null);
      toast.error(e.message || "Failed to enhance prompt");
    } finally {
      setEnhancing(false);
    }
  };

  const acceptEnhanced = () => {
    setForm(f => ({ ...f, prompt: enhancedPrompt }));
    setEnhancedPrompt(null);
    toast.success("Enhanced prompt applied ✨");
  };

  const discardEnhanced = () => {
    setEnhancedPrompt(null);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.prompt.trim()) {
      toast.error("Name and prompt are required"); return;
    }
    setSaving(true);
    try {
      const url    = editingId ? `/api/admin/agents/${editingId}` : "/api/admin/agents";
      const method = editingId ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const agent = await res.json();
      if (editingId) {
        setAgents(prev => prev.map(a => a._id === editingId ? agent : a));
        toast.success("Agent updated");
      } else {
        setAgents(prev => [agent, ...prev]);
        toast.success("Agent created 🎉");
      }
      setShowForm(false);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const doDelete = async (id) => {
    try {
      const res = await apiFetch(`/api/admin/agents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
      setAgents(prev => prev.filter(a => a._id !== id));
      setDeleting(null);
      toast.success("Agent deleted");
    } catch (e) { toast.error(e.message); }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>Agent Management</h2>
          <p style={{ fontSize: "13px", color: THEME.muted, marginTop: "2px" }}>
            {agents.length} agents · {agents.filter(a => a.isDefault).length} default · {agents.filter(a => a.isCustom).length} custom
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={loadAgents} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`, color: THEME.primary, cursor: "pointer", fontSize: "12px" }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, border: "none", color: "#fff", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            <Plus size={13} /> Create Agent
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={15} color={THEME.muted} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents…"
          style={{ width: "100%", background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "10px", padding: "10px 12px 10px 36px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: THEME.muted }}>Loading agents…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          {filtered.map(a => (
            <div key={a._id} style={{
              background: THEME.card, border: `1px solid ${THEME.cardBorder}`,
              borderRadius: "16px", padding: "18px",
              position: "relative", overflow: "hidden", transition: "all 0.3s ease"
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.primary + "33"; e.currentTarget.style.boxShadow = `0 0 24px ${THEME.primary}15`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.cardBorder; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Badges */}
              <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "4px" }}>
                {a.isDefault && <span style={{ fontSize: "9px", background: `${THEME.warning}18`, border: `1px solid ${THEME.warning}40`, color: THEME.warning, borderRadius: "5px", padding: "2px 6px", fontWeight: 700 }}><Star size={8} style={{ display: "inline", marginRight: "2px" }} />DEFAULT</span>}
                <span style={{ fontSize: "9px", background: a.isPublic ? `${THEME.accent}18` : THEME.mutedBg, border: `1px solid ${a.isPublic ? THEME.accent + "40" : THEME.cardBorder}`, color: a.isPublic ? THEME.accent : THEME.muted, borderRadius: "5px", padding: "2px 6px" }}>
                  {a.isPublic ? <><Globe size={8} style={{ display: "inline", marginRight: "2px" }} />Public</> : <><Lock size={8} style={{ display: "inline", marginRight: "2px" }} />Private</>}
                </span>
              </div>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `linear-gradient(135deg, ${THEME.primary}80, ${THEME.secondary}80)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <Bot size={22} color="#fff" />
              </div>
              <h3 style={{ color: "#f1f5f9", fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>{a.name}</h3>
              <p style={{ color: THEME.muted, fontSize: "12px", marginBottom: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.description || "No description"}</p>
              <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "10px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, borderRadius: "5px", padding: "2px 7px" }}>{a.createdByType === "admin" ? "🛡️ admin" : "👤 user"}</span>
                <span style={{ fontSize: "10px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, borderRadius: "5px", padding: "2px 7px" }}>📏 {a.preferredLength}</span>
                {a.createdBy?.fullName && <span style={{ fontSize: "10px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, borderRadius: "5px", padding: "2px 7px" }}>by {a.createdBy.fullName.split(" ")[0]}</span>}
              </div>
              <p style={{ color: THEME.muted, fontSize: "11px", background: "rgba(255,255,255,0.03)", border: `1px solid ${THEME.cardBorder}`, borderRadius: "8px", padding: "8px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: "14px" }}>
                {a.prompt?.slice(0, 120)}…
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => openEdit(a)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", borderRadius: "8px", background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`, color: THEME.primary, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => setDeleting(a._id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", borderRadius: "8px", background: `${THEME.danger}12`, border: `1px solid ${THEME.danger}30`, color: THEME.danger, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      {showForm && (
        <div className="p-3 md:p-5" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div className="p-5 md:p-7" style={{ background: "#0a1020", border: `1px solid ${THEME.primary}30`, borderRadius: "20px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>

            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <div>
                <h3 style={{ color: "#f1f5f9", fontSize: "17px", fontWeight: 700 }}>
                  {editingId ? "Edit Agent" : "Create New Agent"}
                </h3>
                <p style={{ color: THEME.muted, fontSize: "11px", marginTop: "2px" }}>✨ Use the AI Enhancer to improve your system prompt</p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", color: THEME.muted, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {/* Name */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: THEME.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Agent Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Motivation Coach"
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${THEME.cardBorder}`, borderRadius: "8px", padding: "10px 12px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: THEME.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of this agent"
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${THEME.cardBorder}`, borderRadius: "8px", padding: "10px 12px", color: "#e2e8f0", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* ── System Prompt + Enhance section ── */}
            <div style={{ marginBottom: "14px" }}>
              {/* Label row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: "10px" }}>
                <label style={{ color: THEME.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>System Prompt *</label>

                {/* Enhance controls */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                  {/* Model selector */}
                  <select value={ollamaModel} onChange={e => setOllamaModel(e.target.value)}
                    style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.25)", borderRadius: "6px", padding: "3px 7px", color: "#f9a8d4", fontSize: "10px", outline: "none", cursor: "pointer" }}>
                    <option value="llama3.1">llama3.1</option>
                    <option value="llama3">llama3</option>
                    <option value="mistral">mistral</option>
                    <option value="codellama">codellama</option>
                    <option value="phi3">phi3</option>
                  </select>

                  {/* Enhance button */}
                  <button
                    onClick={handleEnhance}
                    disabled={enhancing}
                    title="Use Ollama to enhance your prompt into a detailed system instruction"
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "4px 12px", borderRadius: "6px",
                      background: enhancing ? "rgba(244,114,182,0.06)" : "linear-gradient(135deg, rgba(244,114,182,0.2), rgba(129,140,248,0.2))",
                      border: "1px solid rgba(244,114,182,0.35)",
                      color: "#f9a8d4", fontSize: "11px", fontWeight: 700,
                      cursor: enhancing ? "default" : "pointer",
                      transition: "all 0.2s",
                      boxShadow: enhancing ? "none" : "0 0 12px rgba(244,114,182,0.15)"
                    }}
                  >
                    {enhancing
                      ? <><Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> Enhancing…</>
                      : <><Sparkles size={11} /> Enhance with AI</>
                    }
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={form.prompt}
                onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                placeholder="Write a short draft or full prompt — then click ✨ Enhance with AI to improve it…"
                rows={5}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.06)",
                  border: enhancedPrompt ? `1px solid rgba(244,114,182,0.3)` : `1px solid ${THEME.cardBorder}`,
                  borderRadius: "8px", padding: "10px 12px", color: "#e2e8f0",
                  fontSize: "13px", outline: "none", resize: "vertical",
                  boxSizing: "border-box", fontFamily: "inherit",
                  transition: "border-color 0.3s"
                }}
              />

              {/* Helper text */}
              <p style={{ color: THEME.muted, fontSize: "10px", marginTop: "5px" }}>
                💡 Tip: Write a rough idea like <em style={{ color: "#f9a8d4" }}>"fitness coach that motivates users"</em> then hit <strong style={{ color: "#f9a8d4" }}>Enhance with AI</strong>
              </p>
            </div>

            {/* Enhancer Preview Panel */}
            {enhancedPrompt && (
              <EnhancerPanel
                original={form.prompt}
                enhanced={enhancedPrompt === "__loading__" ? "" : enhancedPrompt}
                loading={enhancedPrompt === "__loading__"}
                onAccept={acceptEnhanced}
                onDiscard={discardEnhanced}
              />
            )}

            {/* Icon & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", color: THEME.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Icon</label>
                <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${THEME.cardBorder}`, borderRadius: "8px", padding: "9px 12px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}>
                  {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: THEME.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Color</label>
                <select value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: `1px solid ${THEME.cardBorder}`, borderRadius: "8px", padding: "9px 12px", color: "#e2e8f0", fontSize: "13px", outline: "none" }}>
                  {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Response Length */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", color: THEME.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Response Length</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {LENGTH_OPTIONS.map(l => (
                  <button key={l} onClick={() => setForm(f => ({ ...f, preferredLength: l }))}
                    style={{ flex: 1, padding: "8px", borderRadius: "8px", background: form.preferredLength === l ? `${THEME.primary}18` : THEME.mutedBg, border: `1px solid ${form.preferredLength === l ? THEME.primary + "50" : THEME.cardBorder}`, color: form.preferredLength === l ? THEME.primary : THEME.muted, cursor: "pointer", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "22px", flexWrap: "wrap" }}>
              {[["isDefault", "⭐ Default Agent"], ["isPublic", "🌐 Public"]].map(([key, label]) => (
                <button key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", background: form[key] ? `${THEME.accent}15` : THEME.mutedBg, border: `1px solid ${form[key] ? THEME.accent + "40" : THEME.cardBorder}`, color: form[key] ? THEME.accent : THEME.muted, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                  {label} {form[key] ? "✓" : ""}
                </button>
              ))}
            </div>

            {/* Footer buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 2, padding: "12px", borderRadius: "10px", background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`, border: "none", color: "#fff", cursor: saving ? "default" : "pointer", fontWeight: 700, fontSize: "14px", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving…" : editingId ? "Save Changes" : "Create Agent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleting && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#0d1525", border: `1px solid ${THEME.danger}30`, borderRadius: "16px", padding: "28px", maxWidth: "360px", width: "90%", textAlign: "center" }}>
            <Trash2 size={32} color={THEME.danger} style={{ margin: "0 auto 12px" }} />
            <h3 style={{ color: "#f1f5f9", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Delete Agent?</h3>
            <p style={{ color: THEME.muted, fontSize: "13px", marginBottom: "20px" }}>This will permanently delete the agent. Conversations using it will lose their reference.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleting(null)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => doDelete(deleting)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: `${THEME.danger}20`, border: `1px solid ${THEME.danger}50`, color: THEME.danger, cursor: "pointer", fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
