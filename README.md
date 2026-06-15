# Folio: AI-Powered Themed Notes Builder

A web application that takes raw course material or document uploads (PDF, DOCX, PPTX, images), processes them using Gemini AI, and formats the output into clean, structured study notes. Notes can be rendered dynamically in two distinct visual styles: Minimal or Modern Textbook.

## Tech Stack

- **Backend:** Django 6 + Django REST Framework + JWT Authentication + SQLite
- **Frontend:** React 19 (Vite) + React Router + Vanilla CSS Design System
- **AI Integration:** Google Gemini (`gemini-flash-latest`) via `google-genai` SDK

---

## Features

- JWT Authentication (registration, login, automatic token refresh)
- Course subjects with color-coding for note categorization
- AI processing: extracts and formats raw content or documents into structured JSON (summaries, sections, terms, and takeaways)
- Visual themes (Minimal or Modern Textbook) switchable dynamically on the frontend
- Public share links for read-only note access
- PDF export and standard browser print support
- Responsive interface with a collapsible navigation sidebar

---

## Prerequisites

- **Python 3.10+** (Python 3.13 recommended, Django 6 requires 3.12+)
- **Node.js 18+**
- A Google **Gemini API key** from [aistudio.google.com](https://aistudio.google.com)

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

> The default model is `gemini-flash-latest`. You can specify a different model by updating `GEMINI_MODEL` in `.env`.

### 2. Frontend (React)

In a second terminal:

```bash
cd frontend
npm install
npm run dev                       # serves http://localhost:5173
```

Open **http://localhost:5173**, create an account, and begin creating notes.

---

## API Overview

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register/` | No | Create account |
| POST | `/api/auth/login/` | No | Obtain JWT access and refresh tokens |
| POST | `/api/auth/refresh/` | No | Refresh access token |
| GET  | `/api/auth/me/` | Yes | Retrieve current user profile |
| GET/POST | `/api/subjects/` | Yes | List or create subjects |
| PUT/DELETE | `/api/subjects/<id>/` | Yes | Update or delete a subject (cascades to notes) |
| GET/POST | `/api/notes/` | Yes | List (filter with `?subject=<id>`) or create notes |
| GET/PUT/PATCH/DELETE | `/api/notes/<id>/` | Yes | CRUD operations on a single note |
| POST | `/api/notes/generate/` | Yes | AI Endpoint: Processes `raw_input` or file upload + `theme` |
| POST | `/api/notes/<id>/share/` | Yes | Enable a public share link |
| POST | `/api/notes/<id>/unshare/` | Yes | Disable sharing |
| GET  | `/api/shared/<uuid>/` | No | View a public read-only shared note |

---

## Testing & Build

```bash
# Run backend tests
cd backend && source venv/bin/activate && python manage.py test

# Verify production build for frontend
cd frontend && npm run build
```

---

## Project Structure

```text
backend/        Django project (folio), apps: accounts (auth), notes (CRUD + AI)
frontend/       Vite React app (pages, components, themes, API client, auth context)
```

The AI prompt and Gemini processing logic are located in `backend/notes/ai_service.py`. The frontend theme renderers are located in `frontend/src/themes/`.

---

## Technical Notes

- The SQLite database (`backend/db.sqlite3`) and local environment configuration (`backend/.env`) are excluded from git.
- PDF generation is handled in the client browser using `html2pdf.js`.
- Shared note links are public and can be accessed by anyone who has the URL.
