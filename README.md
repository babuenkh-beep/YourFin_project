# YourFin

This repository contains separate frontend and backend applications.

```text
frontend/  Vite, React, and TypeScript single-page application
backend/   FastAPI service, Supabase PostgreSQL schema, and database utilities
```

## Local development

### Backend

1. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.
2. Install the Python dependencies:

   ```powershell
   python -m pip install -r backend\requirements.txt
   ```

3. Start the API from the backend directory:

   ```powershell
   Set-Location backend
   python -m uvicorn main:app --reload --port 8000
   ```

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env.local` and provide the Supabase browser values.
2. Install dependencies and start Vite:

   ```powershell
   Set-Location frontend
   npm ci
   npm run dev
   ```

The Vite development server proxies `/api` requests to `http://127.0.0.1:8000`.

## Vercel deployment

Deploy `frontend` as the Vercel project's **Root Directory**. Vercel detects Vite and runs the `build` script, producing the `dist` output. `frontend/vercel.json` rewrites browser routes to `index.html` so React Router routes work on direct visits and refreshes.

In the Vercel frontend project, configure:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL` — the public FastAPI endpoint including `/api`, for example `https://yourfin-api.example.com/api`

Deploy `backend` to a Python/FastAPI-compatible host and configure its `DATABASE_URL` and `CORS_ORIGINS`. `CORS_ORIGINS` must include the deployed Vercel frontend origin (for example, `https://your-project.vercel.app`).

The backend intentionally remains a separate service: it initializes the database schema during FastAPI startup and therefore is not configured as a Vercel serverless function.