import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import NoteCard from "../components/NoteCard.jsx";
import "./Dashboard.css";

const IconNotes = () => (
  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default function Dashboard() {
  const { subjects, notes, activeSubject } = useOutletContext();
  const [search, setSearch] = useState("");

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
    <div className="dashboard-content">
      <header className="notes-header">
        <div className="notes-header-left">
          <h1>Your Notes</h1>
          <p className="muted">
            {activeSubject
              ? subjects.find((s) => s.id === activeSubject)?.name
              : "All subjects"}
          </p>
        </div>
      </header>

      <input
        className="input search-box"
        placeholder="Search notes by title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredNotes.length === 0 && !search && !activeSubject ? (
        <div className="empty-state">
          <IconNotes />
          <h3>No notes yet</h3>
          <p className="muted">
            Paste some messy course content and let AI turn it into clean,
            structured notes.
          </p>
          <Link to="/notes/new" className="btn btn-primary">
            Create your first note
          </Link>
        </div>
      ) : (
        <div className="notes-grid">
          {/* New Note card — always first */}
          <Link to="/notes/new" className="new-note-card">
            <div className="new-note-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="new-note-label">New Note</span>
          </Link>
          {filteredNotes.length === 0 ? (
            <div className="no-match-hint muted">No matching notes</div>
          ) : (
            filteredNotes.map((n) => (
              <NoteCard key={n.id} note={n} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
