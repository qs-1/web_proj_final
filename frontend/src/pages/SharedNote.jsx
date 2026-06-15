import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import ThemeRenderer from "../themes/ThemeRenderer.jsx";
import "./SharedNote.css";

export default function SharedNote() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get(`/api/shared/${shareId}/`, { auth: false })
      .then((n) => active && setNote(n))
      .catch(
        (err) =>
          active && setError(err.status === 404 ? "notfound" : err.message)
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [shareId]);

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" style={{ borderTopColor: "var(--primary)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-page">
        <div className="shared-error card">
          <div className="empty-emoji">🔍</div>
          <h2>{error === "notfound" ? "Note not found" : "Something went wrong"}</h2>
          <p className="muted">
            {error === "notfound"
              ? "This shared note doesn't exist or sharing was turned off."
              : error}
          </p>
          <Link to="/" className="btn btn-primary">
            Go to Folio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-page">
      <div className="shared-stage fade-in">
        <ThemeRenderer theme={note.theme} content={note.generated_content} />
      </div>
      <footer className="shared-footer">
        {note.author && <span className="dim">Shared by {note.author} · </span>}
        Made with{" "}
        <Link to="/" className="shared-brand">
          <img src="/folio.svg" alt="" width="18" height="18" /> Folio
        </Link>
      </footer>
    </div>
  );
}
