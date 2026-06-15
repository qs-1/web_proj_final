/**
 * Minimal, dependency-free Markdown renderer that returns React elements
 * (no dangerouslySetInnerHTML, so no XSS surface).
 *
 * Supports: paragraphs, bullet & numbered lists, **bold**, *italic*,
 * `inline code`. Good enough for AI-generated study-note content.
 */
import { Fragment } from "react";

let keySeq = 0;
const nextKey = () => `md-${keySeq++}`;

// Inline formatting: **bold**, *italic*, `code`
function renderInline(text) {
  const tokens = [];
  const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      tokens.push(<strong key={nextKey()}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      tokens.push(<em key={nextKey()}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      tokens.push(<code key={nextKey()}>{m[4]}</code>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) tokens.push(text.slice(last));
  return tokens;
}

export function Markdown({ text }) {
  if (!text) return null;
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");

  const blocks = [];
  let list = null; // { ordered: bool, items: [] }

  const flushList = () => {
    if (list) {
      const Tag = list.ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={nextKey()} className="md-list">
          {list.items.map((it) => (
            <li key={nextKey()}>{renderInline(it)}</li>
          ))}
        </Tag>
      );
      list = null;
    }
  };

  let paragraph = [];
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(
        <p key={nextKey()} className="md-p">
          {renderInline(paragraph.join(" "))}
        </p>
      );
      paragraph = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);

    if (bullet) {
      flushParagraph();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      flushParagraph();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
    } else if (line.trim() === "") {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();

  return <Fragment>{blocks}</Fragment>;
}
