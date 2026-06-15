import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, createContext, useContext, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client";
import "./AppSidebar.css";

/* ── Sidebar context ── */
const SidebarCtx = createContext(null);

export function useSidebar() {
  return useContext(SidebarCtx);
}

export function SidebarProvider({ children }) {
  const [open, setOpen] = useState(true);       // desktop expanded
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // keyboard shortcut: Ctrl+B
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isMobile) setMobileOpen((v) => !v);
        else setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile]);

  const toggle = useCallback(() => {
    if (isMobile) setMobileOpen((v) => !v);
    else setOpen((v) => !v);
  }, [isMobile]);

  return (
    <SidebarCtx.Provider value={{ open, setOpen, mobileOpen, setMobileOpen, isMobile, toggle }}>
      {children}
    </SidebarCtx.Provider>
  );
}

/* ── Icons ── */
const IconHome = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
const IconChevron = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className={className}>
    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);
const IconMenu = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
    <path d="M8 2a1 1 0 011 1v4h4a1 1 0 110 2H9v4a1 1 0 11-2 0V9H3a1 1 0 110-2h4V3a1 1 0 011-1z" />
  </svg>
);

const COLORS = [
  "#f59e0b", "#ec4899", "#10b981", "#6366f1",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

/* ── Main Sidebar ── */
export function AppSidebar({ subjects, setSubjects, notes, setNotes, activeSubject, setActiveSubject }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { open, toggle, isMobile, mobileOpen, setMobileOpen } = useSidebar();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const popRef = useRef(null);

  // subject add form
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  useEffect(() => {
    function onDown(e) {
      if (popRef.current && !popRef.current.contains(e.target)) setSettingsOpen(false);
    }
    if (settingsOpen) {
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }
  }, [settingsOpen]);

  async function handleAddSubject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await api.post("/api/subjects/", { name: newName.trim(), color: newColor });
      setSubjects((s) => [...s, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewColor(COLORS[0]);
      setAdding(false);
    } catch {}
  }

  const [subjectToDelete, setSubjectToDelete] = useState(null);

  async function handleDeleteSubject(id) {
    try {
      await api.del(`/api/subjects/${id}/`);
      setSubjects((s) => s.filter((x) => x.id !== id));
      setNotes((n) => n.filter((x) => x.subject !== id));
      if (activeSubject === id) setActiveSubject(null);
      setSubjectToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.message || "Could not delete subject.");
    }
  }

  const collapsed = !isMobile && !open;

  const sidebarContent = (
    <>
      {/* ── Nav ── */}
      <div className="sb-section">
        <NavItem
          to="/"
          icon={<IconHome />}
          label="Dashboard"
          active={location.pathname === "/"}
        />
      </div>

      {/* ── Subjects ── */}
      <div className={`sb-section sb-subjects ${collapsed ? "sb-hide-contents" : ""}`}>
        <div className="sb-section-head">
          <span className="sb-section-label">Subjects</span>
          <button className="sb-icon-btn" onClick={() => setAdding((v) => !v)} aria-label="Add subject">
            <IconPlus />
          </button>
        </div>

          {adding && (
            <form className="sb-add-form" onSubmit={handleAddSubject}>
              <input
                className="sb-add-input"
                placeholder="Subject name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className="sb-color-row">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`sb-color-swatch ${newColor === c ? "on" : ""}`}
                    style={{ background: c }}
                    onClick={() => setNewColor(c)}
                  />
                ))}
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>Add</button>
            </form>
          )}

          <div
            className={`sb-subject-item ${activeSubject === null ? "active" : ""}`}
            onClick={() => setActiveSubject(null)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveSubject(null); }}
          >
            <span className="dot" style={{ background: "var(--text-dim)" }} />
            <span className="grow">All notes</span>
            <span className="sb-count">{notes.length}</span>
          </div>

          {subjects.map((s) => (
            <div
              key={s.id}
              className={`sb-subject-item ${activeSubject === s.id ? "active" : ""}`}
              onClick={() => setActiveSubject(s.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveSubject(s.id); }}
            >
              <span className="dot" style={{ background: s.color }} />
              <span className="grow sb-subject-name">{s.name}</span>
              <button
                type="button"
                className="sb-subject-del"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSubjectToDelete(s); }}
                title="Delete subject"
              >
                ×
              </button>
              <span className="sb-count">{s.note_count}</span>
            </div>
          ))}

          {subjects.length === 0 && !adding && (
            <p className="sb-empty-hint">No subjects yet.</p>
          )}
        </div>

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── Footer ── */}
      <div className="sb-section sb-footer">
        <div className="sb-footer-wrap">
          <button
            className={`sb-nav-item ${settingsOpen ? "active" : ""}`}
            onClick={() => setSettingsOpen(true)}
            title={collapsed ? "Settings" : undefined}
          >
            <span className="sb-nav-icon"><IconSettings /></span>
            <span className="sb-nav-label">Settings</span>
          </button>
        </div>
      </div>
    </>
  );

  /* ── Settings Modal ── */
  const settingsModal = settingsOpen && (
    <div className="sb-modal-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="sb-modal-content" ref={popRef} onClick={(e) => e.stopPropagation()}>
        <div className="sb-modal-header">
          <h2>Settings</h2>
          <button className="sb-modal-close" onClick={() => setSettingsOpen(false)}>×</button>
        </div>
        <div className="sb-user-info">
          <div className="sb-avatar">{user?.email?.charAt(0).toUpperCase()}</div>
          <div className="sb-user-text">
            <div className="sb-user-name">{user?.username}</div>
            <div className="sb-user-email">{user?.email}</div>
          </div>
        </div>
        <div className="sb-pop-divider" />
        <button className="sb-pop-action danger" onClick={() => {
          setSettingsOpen(false);
          logout();
        }}>
          <IconLogout /> Log out
        </button>
      </div>
    </div>
  );

  /* ── Delete Subject Modal ── */
  const deleteSubjectModal = subjectToDelete && (
    <div className="sb-modal-overlay" onClick={() => setSubjectToDelete(null)}>
      <div className="sb-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sb-modal-header">
          <h2>Delete Subject</h2>
        </div>
        <p className="dim" style={{ marginBottom: "20px", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Are you sure you want to permanently delete <strong>{subjectToDelete.name}</strong> and all its notes? This cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button className="btn btn-ghost" onClick={() => setSubjectToDelete(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={() => handleDeleteSubject(subjectToDelete.id)}>Yes, delete subject</button>
        </div>
      </div>
    </div>
  );

  /* ── Mobile: Sheet overlay ── */
  if (isMobile) {
    return (
      <>
        {deleteSubjectModal}
        {settingsModal}
        {mobileOpen && (
          <div className="sb-overlay" onClick={() => setMobileOpen(false)} />
        )}
        <aside className={`sb-sidebar sb-mobile ${mobileOpen ? "sb-mobile-open" : ""}`}>
          <div className="sb-inner">{sidebarContent}</div>
        </aside>
      </>
    );
  }

  /* ── Desktop: collapsible ── */
  return (
    <>
      {deleteSubjectModal}
      {settingsModal}
      <aside className={`sb-sidebar ${collapsed ? "sb-collapsed" : ""}`}>
        <div className="sb-inner">
          {sidebarContent}
        </div>
        <button
          className="sb-collapse-btn"
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <IconChevron className={collapsed ? "sb-chevron-flip" : ""} />
        </button>
      </aside>
    </>
  );
}

/* ── Trigger for mobile header ── */
export function SidebarTrigger({ className }) {
  const { toggle } = useSidebar();
  return (
    <button className={`sb-trigger ${className || ""}`} onClick={toggle} aria-label="Toggle sidebar">
      <IconMenu />
    </button>
  );
}

/* ── NavItem ── */
function NavItem({ to, icon, label, active }) {
  return (
    <Link to={to} className={`sb-nav-item ${active ? "active" : ""}`}>
      <span className="sb-nav-icon">{icon}</span>
      <span className="sb-nav-label">{label}</span>
    </Link>
  );
}
