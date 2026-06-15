import "./ThemePicker.css";

const THEMES = [
  {
    id: "minimal",
    name: "Minimal / Clean",
    desc: "Notion-style. Crisp, airy, content-first.",
  },
  {
    id: "textbook",
    name: "Modern Textbook",
    desc: "Warm serif pages with a key-terms sidebar.",
  },
];

export default function ThemePicker({ value, onChange }) {
  return (
    <div className="theme-picker">
      {THEMES.map((t) => (
        <button
          type="button"
          key={t.id}
          className={`theme-option ${value === t.id ? "selected" : ""}`}
          onClick={() => onChange(t.id)}
          aria-pressed={value === t.id}
        >
          <div className={`theme-preview preview-${t.id}`}>
            <div className="pv-title" />
            <div className="pv-line" />
            <div className="pv-line short" />
            {t.id === "textbook" && <div className="pv-side" />}
          </div>
          <div className="theme-option-meta">
            <div className="theme-option-name">{t.name}</div>
            <div className="theme-option-desc">{t.desc}</div>
          </div>
          <span className="theme-check">✓</span>
        </button>
      ))}
    </div>
  );
}
