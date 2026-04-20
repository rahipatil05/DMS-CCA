import { useState, useEffect, useCallback } from "react";
import {
  Search, Trash2, Edit2, Check, X, ShieldCheck, ShieldOff,
  RefreshCw, AlertCircle, Mail
} from "lucide-react";
import { toast } from "sonner";

const T = {
  card: "#0d1525", border: "rgba(255,255,255,0.08)",
  primary: "#38bdf8", secondary: "#818cf8", accent: "#34d399",
  danger: "#f87171", warning: "#fbbf24",
  muted: "rgba(255,255,255,0.45)", mutedBg: "rgba(255,255,255,0.04)",
};

export default function AdminUsers() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});
  const [deleting, setDeleting]   = useState(null);
  const [saving, setSaving]       = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/admin/users", { credentials: "include" });
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

  const startEdit  = (u) => { setEditingId(u._id); setEditForm({ fullName: u.fullName, email: u.email, role: u.role }); };
  const cancelEdit = ()  => { setEditingId(null); setEditForm({}); };

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

  const roleStyle = (role) => role === "admin"
    ? { bg: `${T.primary}18`, border: `1px solid ${T.primary}40`, color: T.primary, icon: "🛡️" }
    : { bg: `${T.secondary}15`, border: `1px solid ${T.secondary}30`, color: T.secondary, icon: "👤" };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">User Management</h2>
          <p className="text-xs mt-0.5" style={{ color: T.muted }}>
            {users.length} total · {users.filter(u => u.role === "admin").length} admins
          </p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all hover:opacity-80"
          style={{ background: `${T.primary}12`, border: `1px solid ${T.primary}30`, color: T.primary }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or role…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none text-slate-100"
          style={{ background: T.card, border: `1px solid ${T.border}` }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-sm" style={{ color: T.muted }}>Loading users…</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16" style={{ color: T.muted }}>
          <AlertCircle size={28} opacity={0.4} />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table header (hidden on mobile) ── */}
          <div className="hidden md:grid rounded-t-2xl px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest"
            style={{
              gridTemplateColumns: "1fr 1.4fr 90px 1fr 130px",
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${T.border}`,
              borderBottom: "none",
              color: T.muted
            }}>
            {["Name", "Email", "Role", "Interests", "Actions"].map(h => <span key={h}>{h}</span>)}
          </div>

          {/* ── User rows ── */}
          <div className="rounded-2xl md:rounded-t-none overflow-hidden"
            style={{ border: `1px solid ${T.border}`, background: T.card }}>
            {filtered.map((u, idx) => {
              const isEditing = editingId === u._id;
              const rs = roleStyle(u.role);
              return (
                <div key={u._id}
                  style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}>

                  {/* ── Desktop row ── */}
                  <div className="hidden md:grid items-center px-4 py-3 gap-3 transition-colors hover:bg-white/4"
                    style={{
                      gridTemplateColumns: "1fr 1.4fr 90px 1fr 130px",
                      background: isEditing ? "rgba(56,189,248,0.04)" : undefined
                    }}>
                    {/* Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm"
                        style={{ background: `${T.primary}15`, border: `1px solid ${T.primary}25` }}>👤</div>
                      {isEditing ? (
                        <input value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                          className="rounded-md px-2 py-1 text-sm text-slate-100 outline-none w-32"
                          style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${T.primary}50` }} />
                      ) : (
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-100 truncate">{u.fullName}</p>
                          <p className="text-[10px] truncate" style={{ color: T.muted }}>ID: {u._id?.slice(-6)}</p>
                        </div>
                      )}
                    </div>
                    {/* Email */}
                    {isEditing ? (
                      <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                        className="rounded-md px-2 py-1 text-xs text-slate-100 outline-none w-full"
                        style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${T.primary}50` }} />
                    ) : (
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail size={11} style={{ color: T.muted, flexShrink: 0 }} />
                        <span className="text-xs truncate" style={{ color: T.muted }}>{u.email}</span>
                      </div>
                    )}
                    {/* Role */}
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-md w-fit"
                      style={{ background: rs.bg, border: rs.border, color: rs.color }}>
                      {rs.icon} {u.role}
                    </span>
                    {/* Interests */}
                    <div className="flex flex-wrap gap-1">
                      {(u.interests || []).slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: `${T.secondary}15`, border: `1px solid ${T.secondary}25`, color: T.secondary }}>{t}</span>
                      ))}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(u._id)} disabled={saving}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer"
                            style={{ background: `${T.accent}18`, border: `1px solid ${T.accent}40`, color: T.accent }}>
                            <Check size={11} /> Save
                          </button>
                          <button onClick={cancelEdit}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] cursor-pointer"
                            style={{ background: T.mutedBg, border: `1px solid ${T.border}`, color: T.muted }}>
                            <X size={11} /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(u)} title="Edit"
                            className="p-1.5 rounded-lg cursor-pointer"
                            style={{ background: `${T.primary}12`, border: `1px solid ${T.primary}30`, color: T.primary }}>
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => toggleRole(u)} title={u.role === "admin" ? "Demote" : "Promote"}
                            className="p-1.5 rounded-lg cursor-pointer"
                            style={{ background: `${T.warning}12`, border: `1px solid ${T.warning}30`, color: T.warning }}>
                            {u.role === "admin" ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                          </button>
                          <button onClick={() => setDeleting(u._id)} title="Delete"
                            className="p-1.5 rounded-lg cursor-pointer"
                            style={{ background: `${T.danger}12`, border: `1px solid ${T.danger}30`, color: T.danger }}>
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ── Mobile card ── */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-base"
                          style={{ background: `${T.primary}15`, border: `1px solid ${T.primary}25` }}>👤</div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-100 truncate">{u.fullName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Mail size={10} style={{ color: T.muted }} />
                            <span className="text-[11px] truncate" style={{ color: T.muted }}>{u.email}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md shrink-0"
                        style={{ background: rs.bg, border: rs.border, color: rs.color }}>
                        {rs.icon} {u.role}
                      </span>
                    </div>
                    {(u.interests || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(u.interests || []).slice(0, 3).map((t, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded"
                            style={{ background: `${T.secondary}15`, border: `1px solid ${T.secondary}25`, color: T.secondary }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(u)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs cursor-pointer"
                        style={{ background: `${T.primary}12`, border: `1px solid ${T.primary}30`, color: T.primary }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => toggleRole(u)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs cursor-pointer"
                        style={{ background: `${T.warning}12`, border: `1px solid ${T.warning}30`, color: T.warning }}>
                        {u.role === "admin" ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
                        {u.role === "admin" ? "Demote" : "Promote"}
                      </button>
                      <button onClick={() => setDeleting(u._id)}
                        className="flex items-center justify-center px-3 py-2 rounded-lg cursor-pointer"
                        style={{ background: `${T.danger}12`, border: `1px solid ${T.danger}30`, color: T.danger }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-7 text-center"
            style={{ background: "#0d1525", border: `1px solid ${T.danger}30` }}>
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${T.danger}18`, border: `1px solid ${T.danger}40` }}>
              <Trash2 size={22} color={T.danger} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Delete User?</h3>
            <p className="text-sm mb-5" style={{ color: T.muted }}>
              This will permanently delete the user and all their conversations.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                style={{ background: T.mutedBg, border: `1px solid ${T.border}`, color: T.muted }}>
                Cancel
              </button>
              <button onClick={() => doDelete(deleting)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                style={{ background: `${T.danger}20`, border: `1px solid ${T.danger}50`, color: T.danger }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
