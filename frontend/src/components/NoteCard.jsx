import { Link } from "react-router-dom";
import "./NoteCard.css";

const THEME_LABEL = { minimal: "Minimal", textbook: "Textbook" };

function snippet(note) {
  if (note.preview) return note.preview;
  const gc = note.generated_content;
  if (gc?.summary) return gc.summary;
  if (gc?.sections?.[0]?.content) {
    return gc.sections[0].content.replace(/[#*`>]/g, "").slice(0, 140);
  }
  return "No preview yet.";
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NoteCard({ note }) {
  return (
    <Link to={`/notes/${note.id}`} className="note-card slide-up">
      <div className="note-card-head">
        <h3 className="note-card-title">{note.title}</h3>
        <span className={`theme-pill theme-${note.theme}`}>
          {THEME_LABEL[note.theme] || note.theme}
        </span>
      </div>
      <p className="note-card-snippet">{snippet(note)}</p>
      <div className="note-card-foot">
        {note.subject_name && (
          <span className="note-card-subject">
            <span
              className="dot"
              style={{ background: note.subject_color || "var(--primary)" }}
            />
            {note.subject_name}
          </span>
        )}
        <span className="dim">{formatDate(note.updated_at)}</span>
      </div>
    </Link>
  );
}
