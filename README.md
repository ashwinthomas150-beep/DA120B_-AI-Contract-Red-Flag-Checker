# 🚩 FlagAI — AI Contract Red Flag Checker

Upload any contract and get a plain-English breakdown of every risky clause in seconds.

## Project Structure

```
contract-checker/
├── landing/          # Marketing landing page (static HTML)
├── frontend/         # React web app (Vite)
└── backend/          # Python Flask API (OpenAI GPT-4o)
```

---

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Add your OPENAI_API_KEY to .env

python app.py
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Landing Page

Open `landing/index.html` directly in a browser, or serve it with any static host.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/analyze/text` | Analyze contract text (JSON body: `{ "text": "..." }`) |
| POST | `/api/analyze/pdf` | Analyze uploaded PDF (multipart form: `file`) |

---

## Deployment

### Backend → Render / Railway
- Set `OPENAI_API_KEY` env var
- Start command: `gunicorn app:app`

### Frontend → Vercel / Netlify
- Build command: `npm run build`
- Output dir: `dist`
- Set `VITE_API_URL` to your backend URL

### Landing Page → Netlify / GitHub Pages
- Deploy `landing/` folder as a static site

---

## Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Python Flask, OpenAI GPT-4o
- **PDF parsing:** PyPDF2
- **Hosting:** Vercel (frontend) + Render (backend)
