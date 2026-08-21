# BioLock — Setup Guide

HR / attendance / payroll system. **Django 5.1 + DRF** backend and a **React 18 + Vite + TypeScript** frontend, with Firebase Cloud Messaging (web push), Gmail-based email, and PDF payslip generation.

This guide takes a fresh clone to a running dev environment on a new machine.

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.10+ | Backend venv (developed on 3.10.12) |
| Node.js | **≥ 20 recommended** | Vite runs on 18.x but emits warnings; the Firebase CLI **requires ≥ 20**. Use `nvm`. |
| npm | 8+ | `bun` also works (a `bun.lock` is checked in) |
| git | any | |

---

## 2. Files the clone does NOT include ⚠️

These are **gitignored** (secrets / local DB) and will be missing after cloning. Nothing runs until they exist. Easiest path: **copy them from your current machine**; otherwise recreate from the templates below.

| File | Purpose | How to obtain |
|------|---------|---------------|
| `backend/.env` | DB URL, email creds | Copy from old machine, or use the template in §4 |
| `backend/user/biolock.json` | Firebase **Admin SDK** service-account key (server sends push) | Firebase Console → Project Settings → **Service accounts** → *Generate new private key* |
| `frontend/.env` | API URL + Firebase **web** config + VAPID key | Copy from old machine, or use the template in §5 |
| `backend/db.sqlite` | Local database | **Optional** — copy it to keep existing data, or skip and reseed (§4) |
| `backend/google_credentials/token.json` | Gmail API OAuth token | **Optional** — only if using the Gmail API email backend (§6) |

> Migrations and the SQLite DB are gitignored on purpose — each machine regenerates them (§4).

---

## 3. Clone

```bash
git clone git@github.com:armadillio17/biolock.git
cd biolock
```

---

## 4. Backend

```bash
# From the repo root — create the venv OUTSIDE the backend dir (named `env`)
python3 -m venv env
source env/bin/activate            # Windows: env\Scripts\activate
pip install -r backend/requirements.txt
```

Create **`backend/.env`**:

```dotenv
# Optional Django settings (sensible defaults exist in settings.py)
# DEBUG=True
# ALLOWED_HOSTS=localhost,127.0.0.1
# SECRET_KEY=change-me-in-production

APP_URL=http://localhost:5173

# Database: the active config uses local SQLite regardless of this value.
# SUPABASE_DB_URL is only used if you re-enable the Postgres block in settings.py.
SUPABASE_DB_URL=

# Email (SMTP via Gmail app password) — optional for local dev
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=you@example.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=you@example.com
```

Initialize the database and run:

```bash
cd backend
python manage.py makemigrations        # regenerate migrations (they are gitignored)
python manage.py migrate
python manage.py seed_users            # creates roles + an admin: admin / adminpassword123
python manage.py runserver 8000
```

Backend is now at **http://localhost:8000** (API under `/api/`).

> **`biolock.json` note:** the app initializes Firebase Admin on startup (`user/apps.py`). If `backend/user/biolock.json` is missing, `runserver` will fail. Provide it (§2), or comment out the Firebase init in `user/apps.py` if you don't need push locally.

Other management commands: `sync_holidays` (Google Calendar PH holidays), `reset_users`, `gmail_auth` (§6).

---

## 5. Frontend

```bash
cd frontend
npm install            # or: bun install
```

Create **`frontend/.env`** (the `VITE_FIREBASE_*` values are the **web app** config — public, safe in the client bundle; distinct from `biolock.json`):

```dotenv
VITE_API_URL=http://localhost:8000/api

# Firebase web config — Console → Project Settings → General → Your apps (Web)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Web Push VAPID key — Console → Project Settings → Cloud Messaging → Web Push certificates
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

Run:

```bash
npm run dev            # http://localhost:5173
```

Log in with the seeded admin: **`admin` / `adminpassword123`**.

> The origins `http://localhost:5173` / `127.0.0.1:5173` are already allow-listed in the backend CORS config. If you change the frontend port, add it to `CORS_ALLOWED_ORIGINS` in `backend/backend/settings.py`.

---

## 6. Firebase push notifications (optional)

Push works only when **all** of these are in place:

1. **Backend** — `backend/user/biolock.json` (Admin SDK key). Lets the server send.
2. **Frontend** — the `VITE_FIREBASE_*` values + `VITE_FIREBASE_VAPID_KEY` in `frontend/.env`. Lets the browser register a token and receive.
3. **Secure origin** — web push requires `localhost` (already secure) or HTTPS. It will not work over a LAN IP without TLS.

No action is needed for the service worker: `frontend/public/firebase-messaging-sw.js` receives its config via the registration URL, sourced from your `frontend/.env` at build/run time.

**Email via Gmail API** (alternative to SMTP): set `EMAIL_BACKEND=user.gmail_backend.GmailAPIBackend` in `backend/.env`, place the OAuth client at `backend/google_credentials/credentials.json`, then run `python manage.py gmail_auth` to produce `token.json`.

---

## 7. Ports & summary

| Service | URL | Start |
|---------|-----|-------|
| Backend (Django) | http://localhost:8000 | `cd backend && python manage.py runserver 8000` |
| Frontend (Vite) | http://localhost:5173 | `cd frontend && npm run dev` |

Production: `gunicorn` config in `backend/gunicorn_config.py`; static served via WhiteNoise; frontend built with `npm run build` (see `frontend/deploy.sh`).

---

## 8. Common gotchas

- **Migrations are gitignored.** Always run `makemigrations` on a fresh clone before `migrate`; don't expect migration files in the repo.
- **`biolock.json` missing → backend won't boot** (Firebase init in `apps.py`). Provide it or disable the init.
- **Node < 20** works for Vite but breaks the Firebase CLI; prefer `nvm use 20`.
- **Push notifications need a secure origin** — use `localhost`, not a bare IP.
- **`DEBUG` defaults to `False`** — set `DEBUG=True` in `backend/.env` for local development (nicer errors, static serving).
- **DB is SQLite** by default (`backend/db.sqlite`); the Supabase/Postgres block in `settings.py` is commented out.
