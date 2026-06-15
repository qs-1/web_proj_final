import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import ThemePicker from "../components/ThemePicker.jsx";
import ThemeRenderer from "../themes/ThemeRenderer.jsx";
import "./NoteEditor.css";

export default function NoteEditor() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);

  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [theme, setTheme] = useState("minimal");
  const [rawInput, setRawInput] = useState("");

  const [generated, setGenerated] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/subjects/")
      .then(setSubjects)
      .catch(() => {});
  }, []);

  async function ensureSubject() {
    // If user typed a new subject name, create it first.
    if (subjectId === "__new__" && newSubject.trim()) {
      const created = await api.post("/api/subjects/", {
        name: newSubject.trim(),
      });
      setSubjects((s) => [...s, created]);
      return created.id;
    }
    return subjectId && subjectId !== "__new__" ? Number(subjectId) : null;
  }

  async function handleGenerate() {
    setError("");
    if (!rawInput.trim()) {
      setError("Paste some content first so the AI has something to work with.");
      return;
    }
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await api.post("/api/notes/generate/", {
        raw_input: rawInput,
        theme,
        title,
      });
      setGenerated(res.generated_content);
      if (!title && res.generated_content?.title) {
        setTitle(res.generated_content.title);
      }
    } catch (err) {
      setError(err.message || "Generation failed. Check your API key / quota.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setError("");
    if (!generated) return;
    setSaving(true);
    try {
      const subject = await ensureSubject();
      const note = await api.post("/api/notes/", {
        title: title.trim() || generated.title || "Untitled Notes",
        subject,
        raw_input: rawInput,
        generated_content: generated,
        theme,
      });
      navigate(`/notes/${note.id}`);
    } catch (err) {
      setError(err.message || "Could not save the note.");
      setSaving(false);
    }
  }

  return (
    <div className="editor fade-in">
      <header className="editor-head">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>Create a Note</h1>
      </header>

      <div className="editor-grid">
        {/* ---------- Input side ---------- */}
        <div className="editor-form card">
          <div className="field">
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="What's this note about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label">Subject</label>
            <select
              className="select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">No subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value="__new__">+ Create new subject…</option>
            </select>
            {subjectId === "__new__" && (
              <input
                className="input"
                placeholder="New subject name"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                style={{ marginTop: "8px" }}
              />
            )}
          </div>

          <div className="field">
            <label className="label">Theme</label>
            <ThemePicker value={theme} onChange={setTheme} />
          </div>

          <div className="field">
            <label className="label">Your messy content</label>
            <textarea
              className="textarea"
              rows={12}
              placeholder="Paste lecture notes, textbook paragraphs, bullet dumps — anything. The AI will clean it up and structure it."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
            />
            <span className="dim char-count">{rawInput.length} characters</span>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button
            className="btn btn-primary build-btn"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <span className="spinner" /> Building your notes…
              </>
            ) : (
              "Build My Notes"
            )}
          </button>
        </div>

        {/* ---------- Preview side ---------- */}
        <div className="editor-preview">
          {generating ? (
            <div className="preview-loading">
              <div className="skeleton" style={{ height: 32, width: "60%" }} />
              <div className="skeleton" style={{ height: 16, width: "90%" }} />
              <div className="skeleton" style={{ height: 16, width: "80%" }} />
              <div className="skeleton" style={{ height: 120, width: "100%" }} />
              <div className="skeleton" style={{ height: 16, width: "70%" }} />
              <p className="muted preview-hint">Gemini is structuring your notes…</p>
            </div>
          ) : generated ? (
            <div className="preview-ready">
              <div className="preview-bar">
                <span className="badge">Preview · {theme}</span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <span className="spinner" /> : "Save note"}
                </button>
              </div>
              <div className="preview-frame">
                <ThemeRenderer theme={theme} content={generated} />
              </div>
            </div>
          ) : (
            <div className="preview-placeholder">
              <p className="muted">
                Your themed notes will appear here once you click{" "}
                <strong>Build My Notes</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
