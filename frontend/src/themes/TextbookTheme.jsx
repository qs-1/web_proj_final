import { Markdown } from "../utils/markdown.jsx";
import "./TextbookTheme.css";

export default function TextbookTheme({ content }) {
  if (!content) return null;
  const { title, summary, sections = [], key_takeaways = [] } = content;

  return (
    <article className="textbook-theme">
      <header className="tb-header">
        <h1 className="tb-title">{title}</h1>
        {summary && <p className="tb-summary">{summary}</p>}
      </header>

      {sections.map((section, i) => (
        <section className="tb-section" key={i}>
          <div className="tb-main">
            <h2 className="tb-heading">
              <span className="tb-num">{String(i + 1).padStart(2, "0")}</span>
              {section.heading}
            </h2>
            <div className="tb-content">
              <Markdown text={section.content} />
            </div>
          </div>

          {section.key_terms?.length > 0 && (
            <aside className="tb-sidebar">
              <div className="tb-sidebar-label">Key Terms</div>
              {section.key_terms.map((kt, j) => (
                <div className="tb-side-term" key={j}>
                  <div className="tb-side-name">{kt.term}</div>
                  <div className="tb-side-def">{kt.definition}</div>
                </div>
              ))}
            </aside>
          )}
        </section>
      ))}

      {key_takeaways.length > 0 && (
        <section className="tb-takeaways">
          <div className="tb-takeaways-head">
            <span className="tb-takeaways-icon">📌</span>
            <h2>Chapter Summary</h2>
          </div>
          <ul>
            {key_takeaways.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
