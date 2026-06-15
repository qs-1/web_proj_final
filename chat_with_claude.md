# Development Log — Building Folio with Claude

This file documents how Folio was built with AI assistance (Claude Code).

## Goal

Build a full-stack web app where students paste messy course content, an AI
(Google Gemini) rewrites it into clean structured notes, and those notes render
in one of two visual themes (Minimal / Modern Textbook).

## Build Order

1. **Backend (Django + DRF)**
   - Project + two apps: `accounts` (JWT auth) and `notes` (CRUD + AI).
   - Models: `Subject` and `Note` (with a JSON `generated_content` field and a
     UUID `share_id` for public sharing).
   - Endpoints for auth, subject/note CRUD, AI generation, and public shared notes.
   - `notes/ai_service.py` — the Gemini integration. It sends a structured prompt
     and uses Gemini's JSON schema mode so the response always matches the shape
     the frontend expects (title, summary, sections[], key_terms[], key_takeaways[]).

2. **Frontend (React + Vite)**
   - A dark, glassmorphism design system in `src/index.css` (CSS custom properties).
   - JWT-aware fetch client with automatic token refresh (`src/api/client.js`).
   - `AuthContext` for login/register/logout state.
   - Pages: Login, Register, Dashboard, NoteEditor, NoteViewer, SharedNote.
   - Two theme renderers (`MinimalTheme`, `TextbookTheme`) that take the same JSON
     and render it very differently. The textbook theme adds a margin "Key Terms"
     sidebar, numbered chapters, and drop caps.
   - A small dependency-free Markdown renderer (`src/utils/markdown.jsx`) so section
     content can use **bold**, *italics*, `code`, and lists without an XSS risk.

## Key Technical Decisions

- **Structured JSON from the AI (not raw markdown):** lets each theme render the
  same content independently. Enforced with Gemini's `response_schema`.
- **Theme switching is client-side:** the saved `generated_content` is theme-agnostic,
  so switching themes is instant and needs no re-generation.
- **Model:** `gemini-2.5-flash` (the originally planned `gemini-2.0-flash` had no
  free-tier quota on the provided key, so we switched to 2.5-flash which works).

## Verification

- Backend: 6 automated tests (auth, ownership isolation, CRUD, sharing, AI endpoint
  with a mocked Gemini call) — all passing.
- A real end-to-end run against live Gemini: register → login → create subject →
  generate notes → save → share → fetch the public link without auth.
- Frontend: production build is clean; the full UI flow was driven in a browser
  (login, dashboard, both themes, theme switching, public share page).
