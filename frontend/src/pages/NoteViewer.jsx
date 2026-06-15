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
  const [exporting, setExporting] = useState(false);

  // Subject management
  const [subjects, setSubjects] = useState([]);
  const [subjectMenuOpen, setSubjectMenuOpen] = useState(false);
  const subjectRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      api.get(`/api/notes/${id}/`),
      api.get("/api/subjects/"),
    ])
      .then(([n, subs]) => {
        if (!active) return;
        setNote(n);
        setTheme(n.theme);
        setSubjects(subs);
        if (n.share_id) {
          setShareUrl(`${window.location.origin}/shared/${n.share_id}`);
        }
      })
      .catch((err) => active && setError(err.message || "Note not found."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  // Close subject menu on outside click
  useEffect(() => {
    function onDown(e) {
      if (subjectRef.current && !subjectRef.current.contains(e.target)) {
        setSubjectMenuOpen(false);
      }
    }
    if (subjectMenuOpen) {
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }
  }, [subjectMenuOpen]);

  async function switchTheme(next) {
    setTheme(next);
    try {
      await api.patch(`/api/notes/${id}/`, { theme: next });
      setNote((n) => ({ ...n, theme: next }));
    } catch { /* non-critical */ }
  }

  async function assignSubject(subjectId) {
    setSubjectMenuOpen(false);
    try {
      const updated = await api.patch(`/api/notes/${id}/`, { subject: subjectId });
      setNote((n) => ({
        ...n,
        subject: updated.subject,
        subject_name: updated.subject_name,
        subject_color: updated.subject_color,
      }));
    } catch (err) {
      setError(err.message || "Could not update subject.");
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

  /**
   * PDF export via html2pdf.js using the Promise-based outputPdf approach.
   * html2pdf v0.14 builder chain: we use .outputPdf('blob') which returns
   * a real Promise, then manually trigger download.
   */
  async function handleExport() {
    if (exporting) return;
    const el = printRef.current;
    if (!el) return;
    setExporting(true);
    setError("");
    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const filename = `${(note?.title || "folio-note").replace(/\s+/g, "-")}.pdf`;

      const blob = await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(el)
        .outputPdf("blob");

      // Manually trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export error:", err);
      setError("PDF export failed — try using browser Print (Ctrl+P) instead.");
    } finally {
      // Clean up any leftover html2canvas DOM clones
      document.querySelectorAll(".html2canvas-container").forEach((n) => n.remove());
      setExporting(false);
    }
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
      {/* ── Row 1: back + subject + theme toggle ── */}
      <div className="viewer-row viewer-row-top">
        <div className="viewer-bar-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
            ← Back
          </button>

          {/* Subject chip */}
          <div className="subject-assign" ref={subjectRef}>
            <button
              className="btn btn-ghost btn-sm subject-chip-btn"
              onClick={() => setSubjectMenuOpen((v) => !v)}
            >
              {note.subject ? (
                <>
                  <span className="dot" style={{ background: note.subject_color }} />
                  {note.subject_name}
                </>
              ) : (
                <span className="dim">+ Subject</span>
              )}
            </button>

            {subjectMenuOpen && (
              <div className="subject-dropdown">
                {note.subject && (
                  <button className="sd-item sd-remove" onClick={() => assignSubject(null)}>
                    Remove from subject
                  </button>
                )}
                {subjects.length > 0 && note.subject && <div className="sd-divider" />}
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    className={`sd-item ${note.subject === s.id ? "sd-active" : ""}`}
                    onClick={() => assignSubject(s.id)}
                  >
                    <span className="dot" style={{ background: s.color }} />
                    {s.name}
                  </button>
                ))}
                {subjects.length === 0 && (
                  <div className="sd-empty dim">No subjects yet</div>
                )}
              </div>
            )}
          </div>
        </div>

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
      </div>

      {/* ── Row 2: actions ── */}
      <div className="viewer-row viewer-row-actions">
        <button
          className="btn btn-ghost btn-sm btn-share"
          onClick={handleShare}
          disabled={busy}
        >
          {copied ? "Link copied" : shareUrl ? "Copy link" : "Share"}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "Exporting…" : "Export PDF"}
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          Delete
        </button>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: "var(--sp-4)" }}>{error}</div>}

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
