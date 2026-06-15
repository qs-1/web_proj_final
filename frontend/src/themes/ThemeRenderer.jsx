import MinimalTheme from "./MinimalTheme.jsx";
import TextbookTheme from "./TextbookTheme.jsx";

export default function ThemeRenderer({ theme, content }) {
  if (theme === "textbook") return <TextbookTheme content={content} />;
  return <MinimalTheme content={content} />;
}
