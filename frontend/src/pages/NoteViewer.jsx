import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import ThemeRenderer from "../themes/ThemeRenderer.jsx";
import "./NoteViewer.css";

export default function NoteViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [note, setNote] = useState(null);
  const [theme, setTheme] = useState("minimal");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/api/notes/${id}/`)
      .then((n) => {
        if (!active) return;
        setNote(n);
        setTheme(n.theme);
        if (n.share_id) {
          setShareUrl(`${window.location.origin}/shared/${n.share_id}`);
        }
      })
      .catch((err) => active && setError(err.message || "Note not found."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function switchTheme(next) {
    setTheme(next); // instant client-side re-render
    try {
      await api.patch(`/api/notes/${id}/`, { theme: next });
      setNote((n) => ({ ...n, theme: next }));
    } catch {
      /* non-critical: the visual switch already happened */
    }
  }

  async function handleShare() {
    setBusy(true);
    try {
      const res = await api.post(`/api/notes/${id}/share/`);
      const url = `${window.location.origin}/shared/${res.share_id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(err.message || "Could not create share link.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExport() {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = printRef.current;
    if (!el) return;
    html2pdf()
      .set({
        margin: 0,
        filename: `${(note?.title || "folio-note").replace(/\s+/g, "-")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: null },
        jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      })
      .from(el)
      .save();
  }

  async function handleDelete() {
    if (!confirm("Delete this note permanently?")) return;
    try {
      await api.del(`/api/notes/${id}/`);
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not delete note.");
    }
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" style={{ borderTopColor: "var(--primary)" }} />
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="viewer">
        <div className="error-banner">{error}</div>
        <button className="btn btn-ghost" onClick={() => navigate("/")}>
          ← Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="viewer fade-in">
      <div className="viewer-bar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="theme-toggle">
          <button
            className={`toggle-opt ${theme === "minimal" ? "on" : ""}`}
            onClick={() => switchTheme("minimal")}
          >
            Minimal
          </button>
          <button
            className={`toggle-opt ${theme === "textbook" ? "on" : ""}`}
            onClick={() => switchTheme("textbook")}
          >
            Textbook
          </button>
        </div>

        <div className="viewer-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleShare}
            disabled={busy}
          >
            {copied ? "✓ Link copied" : shareUrl ? "🔗 Copy link" : "🔗 Share"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>
            ⬇ Export PDF
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {shareUrl && (
        <div className="share-bar">
          <span className="dim">Public link:</span>
          <code>{shareUrl}</code>
        </div>
      )}

      <div className="viewer-stage">
        <div ref={printRef}>
          <ThemeRenderer theme={theme} content={note.generated_content} />
        </div>
      </div>
    </div>
  );
}
