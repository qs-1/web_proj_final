import { Markdown } from "../utils/markdown.jsx";
import "./MinimalTheme.css";

export default function MinimalTheme({ content }) {
  if (!content) return null;
  const { title, summary, sections = [], key_takeaways = [] } = content;

  return (
    <article className="minimal-theme">
      <header className="mt-header">
        <h1 className="mt-title">{title}</h1>
        {summary && <p className="mt-summary">{summary}</p>}
      </header>

      {sections.map((section, i) => (
        <section className="mt-section" key={i}>
          <h2 className="mt-heading">{section.heading}</h2>
          <div className="mt-content">
            <Markdown text={section.content} />
          </div>

          {section.key_terms?.length > 0 && (
            <dl className="mt-terms">
              {section.key_terms.map((kt, j) => (
                <div className="mt-term" key={j}>
                  <dt>{kt.term}</dt>
                  <dd>{kt.definition}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}

      {key_takeaways.length > 0 && (
        <section className="mt-takeaways">
          <h2 className="mt-heading">Key Takeaways</h2>
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
