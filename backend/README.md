# FastAPI Backend (AI Architect)

Local run (Windows):

- Create venv: `python -m venv .venv`
- Activate: `. .venv/Scripts/activate`
- Install deps: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --reload --port 8001`

Endpoints:
- POST /generate: returns PyTorch code for a given graph
- POST /train: runs a simple training loop (CSV datasets only in MVP)

