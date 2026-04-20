import { useState, useEffect, useCallback } from "react";
import {
  Search, Trash2, Edit2, Check, X, ShieldCheck, ShieldOff,
  Users, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Mail
} from "lucide-react";
import { toast } from "sonner";

const THEME = {
  card: "#0d1525", cardBorder: "rgba(255,255,255,0.08)",
  primary: "#38bdf8", secondary: "#818cf8", accent: "#34d399",
  danger: "#f87171", warning: "#fbbf24",
  muted: "rgba(255,255,255,0.45)", mutedBg: "rgba(255,255,255,0.04)",
};

const ROLE_STYLE = {
  admin: { bg: `${THEME.primary}18`, border: `1px solid ${THEME.primary}40`, color: THEME.primary, icon: "🛡️" },
  user:  { bg: `${THEME.secondary}15`, border: `1px solid ${THEME.secondary}30`, color: THEME.secondary, icon: "👤" },
};

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving]     = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", { credentials: "include" });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditForm({ fullName: u.fullName, email: u.email, role: u.role });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const updated = await res.json();
      setUsers(prev => prev.map(u => u._id === id ? updated : u));
      setEditingId(null);
      toast.success("User updated");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = (id) => setDeleting(id);
  const cancelDelete  = ()  => setDeleting(null);

  const doDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      setUsers(prev => prev.filter(u => u._id !== id));
      setDeleting(null);
      toast.success("User deleted");
    } catch (e) { toast.error(e.message); }
  };

  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${u._id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      const updated = await res.json();
      setUsers(prev => prev.map(x => x._id === u._id ? updated : x));
      toast.success(`${u.fullName} is now ${newRole}`);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>User Management</h2>
          <p style={{ fontSize: "13px", color: THEME.muted, marginTop: "2px" }}>
            {users.length} total user{users.length !== 1 ? "s" : ""} · {users.filter(u => u.role === "admin").length} admins
          </p>
        </div>
        <button onClick={fetchUsers} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`, color: THEME.primary, cursor: "pointer", fontSize: "12px" }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={15} color={THEME.muted} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or role…"
          style={{
            width: "100%", background: THEME.card, border: `1px solid ${THEME.cardBorder}`,
            borderRadius: "10px", padding: "10px 12px 10px 36px", color: "#e2e8f0",
            fontSize: "13px", outline: "none", boxSizing: "border-box"
          }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px", color: THEME.muted }}>Loading users…</div>
      ) : (
        <div style={{ background: THEME.card, border: `1px solid ${THEME.cardBorder}`, borderRadius: "16px", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1.5fr 100px 120px 120px",
            padding: "12px 16px", borderBottom: `1px solid ${THEME.cardBorder}`,
            background: "rgba(255,255,255,0.02)"
          }}>
            {["Name", "Email", "Role", "Actions", ""].map((h, i) => (
              <span key={i} style={{ color: THEME.muted, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px", gap: "8px", color: THEME.muted }}>
              <AlertCircle size={28} opacity={0.4} /><p style={{ fontSize: "13px" }}>No users found</p>
            </div>
          ) : (
            filtered.map((u, idx) => {
              const isEditing = editingId === u._id;
              const rs = ROLE_STYLE[u.role] || ROLE_STYLE.user;
              return (
                <div
                  key={u._id}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1.5fr 100px 120px 120px",
                    padding: "12px 16px", alignItems: "center",
                    borderBottom: idx < filtered.length - 1 ? `1px solid ${THEME.cardBorder}` : "none",
                    transition: "background 0.2s",
                    background: isEditing ? "rgba(56,189,248,0.04)" : "transparent"
                  }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = THEME.mutedBg; }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Name */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
                      background: `${THEME.primary}15`, border: `1px solid ${THEME.primary}25`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px"
                    }}>👤</div>
                    {isEditing ? (
                      <input
                        value={editForm.fullName}
                        onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                        style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${THEME.primary}50`, borderRadius: "6px", padding: "4px 8px", color: "#e2e8f0", fontSize: "13px", outline: "none", width: "140px" }}
                      />
                    ) : (
                      <div>
                        <p style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 600 }}>{u.fullName}</p>
                        <p style={{ color: THEME.muted, fontSize: "10px" }}>ID: {u._id?.slice(-6)}</p>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  {isEditing ? (
                    <input
                      value={editForm.email}
                      onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                      style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${THEME.primary}50`, borderRadius: "6px", padding: "4px 8px", color: "#e2e8f0", fontSize: "12px", outline: "none", width: "180px" }}
                    />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                      <Mail size={12} color={THEME.muted} style={{ flexShrink: 0 }} />
                      <span style={{ color: THEME.muted, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
                    </div>
                  )}

                  {/* Role badge */}
                  <div>
                    <span style={{ fontSize: "11px", background: rs.bg, border: rs.border, color: rs.color, borderRadius: "6px", padding: "3px 8px", fontWeight: 600 }}>
                      {rs.icon} {u.role}
                    </span>
                  </div>

                  {/* Edit/Save/Cancel */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(u._id)} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", background: `${THEME.accent}18`, border: `1px solid ${THEME.accent}40`, color: THEME.accent, cursor: "pointer", fontSize: "11px" }}>
                          <Check size={12} /> Save
                        </button>
                        <button onClick={cancelEdit} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, cursor: "pointer", fontSize: "11px" }}>
                          <X size={12} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} title="Edit user" style={{ padding: "5px 8px", borderRadius: "6px", background: `${THEME.primary}12`, border: `1px solid ${THEME.primary}30`, color: THEME.primary, cursor: "pointer" }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => toggleRole(u)} title={u.role === "admin" ? "Demote to user" : "Promote to admin"} style={{ padding: "5px 8px", borderRadius: "6px", background: `${THEME.warning}12`, border: `1px solid ${THEME.warning}30`, color: THEME.warning, cursor: "pointer" }}>
                          {u.role === "admin" ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                        </button>
                        <button onClick={() => confirmDelete(u._id)} title="Delete user" style={{ padding: "5px 8px", borderRadius: "6px", background: `${THEME.danger}12`, border: `1px solid ${THEME.danger}30`, color: THEME.danger, cursor: "pointer" }}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Interests preview */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                    {(u.interests || []).slice(0, 2).map((t, i) => (
                      <span key={i} style={{ fontSize: "9px", background: `${THEME.secondary}15`, border: `1px solid ${THEME.secondary}25`, color: THEME.secondary, borderRadius: "4px", padding: "1px 5px" }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleting && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#0d1525", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "16px", padding: "28px", maxWidth: "380px", width: "90%", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${THEME.danger}18`, border: `1px solid ${THEME.danger}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color={THEME.danger} />
            </div>
            <h3 style={{ color: "#f1f5f9", fontSize: "17px", fontWeight: 700, marginBottom: "8px" }}>Delete User?</h3>
            <p style={{ color: THEME.muted, fontSize: "13px", marginBottom: "20px" }}>This will permanently delete the user and all their conversations. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={cancelDelete} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: THEME.mutedBg, border: `1px solid ${THEME.cardBorder}`, color: THEME.muted, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={() => doDelete(deleting)} style={{ flex: 1, padding: "10px", borderRadius: "8px", background: `${THEME.danger}20`, border: `1px solid ${THEME.danger}50`, color: THEME.danger, cursor: "pointer", fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
