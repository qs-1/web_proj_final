import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import NoteCard from "../components/NoteCard.jsx";
import "./Dashboard.css";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
];

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null); // null = all
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add-subject form
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(COLORS[0]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [subj, nts] = await Promise.all([
        api.get("/api/subjects/"),
        api.get("/api/notes/"),
      ]);
      setSubjects(subj);
      setNotes(nts);
    } catch (err) {
      setError(err.message || "Failed to load your data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleAddSubject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const created = await api.post("/api/subjects/", {
        name: newName.trim(),
        color: newColor,
      });
      setSubjects((s) => [...s, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewColor(COLORS[0]);
      setAdding(false);
    } catch (err) {
      setError(err.message || "Could not create subject.");
    }
  }

  async function handleDeleteSubject(id) {
    if (!confirm("Delete this subject and all its notes?")) return;
    try {
      await api.del(`/api/subjects/${id}/`);
      setSubjects((s) => s.filter((x) => x.id !== id));
      setNotes((n) => n.filter((x) => x.subject !== id));
      if (activeSubject === id) setActiveSubject(null);
    } catch (err) {
      setError(err.message || "Could not delete subject.");
    }
  }

  const filteredNotes = useMemo(() => {
    let list = notes;
    if (activeSubject !== null) {
      list = list.filter((n) => n.subject === activeSubject);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => n.title.toLowerCase().includes(q));
    }
    return list;
  }, [notes, activeSubject, search]);

  return (
    <div className="dashboard">
      {/* ---------- Subjects panel ---------- */}
      <aside className="subjects-panel">
        <div className="panel-head">
          <h2>Subjects</h2>
          <button
            className="btn btn-icon btn-ghost btn-sm"
            onClick={() => setAdding((v) => !v)}
            aria-label="Add subject"
          >
            +
          </button>
        </div>

        {adding && (
          <form className="add-subject" onSubmit={handleAddSubject}>
            <input
              className="input"
              placeholder="Subject name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <div className="color-row">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`color-swatch ${newColor === c ? "on" : ""}`}
                  style={{ background: c }}
                  onClick={() => setNewColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <button className="btn btn-primary btn-sm">Add subject</button>
          </form>
        )}

        <button
          className={`subject-item ${activeSubject === null ? "active" : ""}`}
          onClick={() => setActiveSubject(null)}
        >
          <span className="dot" style={{ background: "var(--text-dim)" }} />
          <span className="grow">All notes</span>
          <span className="count">{notes.length}</span>
        </button>

        {subjects.map((s) => (
          <button
            key={s.id}
            className={`subject-item ${activeSubject === s.id ? "active" : ""}`}
            onClick={() => setActiveSubject(s.id)}
          >
            <span className="dot" style={{ background: s.color }} />
            <span className="grow subject-name">{s.name}</span>
            <span className="count">{s.note_count}</span>
            <span
              className="subject-del"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteSubject(s.id);
              }}
              title="Delete subject"
            >
              ×
            </span>
          </button>
        ))}

        {subjects.length === 0 && !adding && (
          <p className="dim panel-empty">No subjects yet. Add one to organize notes.</p>
        )}
      </aside>

      {/* ---------- Notes area ---------- */}
      <section className="notes-area">
        <header className="notes-header">
          <div>
            <h1>Your Notes</h1>
            <p className="muted">
              {activeSubject
                ? subjects.find((s) => s.id === activeSubject)?.name
                : "All subjects"}
            </p>
          </div>
          <Link to="/notes/new" className="btn btn-primary">
            ✨ Create New Note
          </Link>
        </header>

        <input
          className="input search-box"
          placeholder="Search notes by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="notes-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 160 }} />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">📝</div>
            <h3>
              {search || activeSubject ? "No matching notes" : "No notes yet"}
            </h3>
            <p className="muted">
              Paste some messy course content and let AI turn it into clean,
              themed notes.
            </p>
            <Link to="/notes/new" className="btn btn-primary">
              Build your first note
            </Link>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
