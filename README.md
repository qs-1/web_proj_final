# Folio — AI-Powered Themed Notes Builder

Paste messy course content → Gemini AI rewrites it into clear, structured study
notes → rendered in your choice of two visual themes (**Minimal / Clean** or
**Modern Textbook**).

- **Backend:** Django 6 + Django REST Framework + JWT auth + SQLite
- **Frontend:** React 19 (Vite) + React Router + vanilla CSS design system
- **AI:** Google Gemini (`gemini-2.5-flash`) via the `google-genai` SDK

---

## Features

- 🔐 JWT auth (register, login, auto token refresh)
- 📚 Subjects with color coding + notes organized under them
- ✨ AI generation: messy text → structured JSON (summary, sections, key terms, takeaways)
- 🎨 Two polished themes, switchable instantly client-side on any saved note
- 🔗 Public share links (no account needed to view)
- ⬇️ Export to PDF (`html2pdf.js`) + browser print fallback
- 📱 Responsive layout with a collapsible sidebar

---

## Prerequisites

- **Python 3.10+** (3.13 recommended — Django 6 requires 3.12+)
- **Node.js 18+**
- A free **Gemini API key** from [aistudio.google.com](https://aistudio.google.com)

---

## Setup & Run

### 1. Backend (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure your API key
cp .env.example .env              # then edit .env and paste your GEMINI_API_KEY

python manage.py migrate
python manage.py runserver        # serves http://localhost:8000
```

> The default model is `gemini-2.5-flash`. Change `GEMINI_MODEL` in `.env`
> if you want a different one (e.g. `gemini-2.5-pro`).

### 2. Frontend (React)

In a second terminal:

```bash
cd frontend
npm install
npm run dev                       # serves http://localhost:5173
```

Open **http://localhost:5173**, register an account, and start building notes.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | — | Create account |
| POST | `/api/auth/login/` | — | Get JWT access + refresh tokens |
| POST | `/api/auth/refresh/` | — | Refresh access token |
| GET  | `/api/auth/me/` | ✓ | Current user |
| GET/POST | `/api/subjects/` | ✓ | List / create subjects |
| PUT/DELETE | `/api/subjects/<id>/` | ✓ | Update / delete subject (cascades) |
| GET/POST | `/api/notes/` | ✓ | List (`?subject=<id>`) / create notes |
| GET/PUT/PATCH/DELETE | `/api/notes/<id>/` | ✓ | Single note ops |
| POST | `/api/notes/generate/` | ✓ | **AI**: `raw_input` + `theme` → structured content |
| POST | `/api/notes/<id>/share/` | ✓ | Enable a public share link |
| POST | `/api/notes/<id>/unshare/` | ✓ | Disable sharing |
| GET  | `/api/shared/<uuid>/` | — | **Public** read-only shared note |

---

## Testing

```bash
# Backend
cd backend && source venv/bin/activate && python manage.py test

# Frontend (verify production build)
cd frontend && npm run build
```

---

## Project Structure

```
backend/        Django project (folio), apps: accounts (auth), notes (CRUD + AI)
frontend/       Vite React app — pages, components, themes, api client, auth context
```

The AI prompt and Gemini call live in `backend/notes/ai_service.py`. The two
theme renderers live in `frontend/src/themes/`.

---

## Notes

- The SQLite DB (`backend/db.sqlite3`) and `backend/.env` are gitignored.
- PDF export is image-based (rasterized), which is expected for `html2pdf.js`.
- Share links are fully public — anyone with the URL can view that note.
