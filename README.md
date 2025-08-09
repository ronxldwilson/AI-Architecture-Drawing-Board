AI Architect Editor
===================

Next.js + React Flow application for visually designing deep learning architectures, uploading datasets, and running experiments.

What's included
- Next.js frontend with React Flow canvas (`pages/index.js`, `components/Editor.js`)
- Palette, property panel, dataset uploader, and toolbar components
- API routes for save/load and dataset upload (DB via Prisma with file fallback)
- Styles and basic layout

Getting Started
1. Install dependencies:
   npm install

2. (Optional) Configure PostgreSQL with Prisma for persistence:
   cp .env.example .env
   npm install -D prisma
   npm install @prisma/client
   npx prisma migrate dev --name init

   If you skip DB setup, saving/loading will fall back to a local file `saved_graph.json`.

3. Run dev server:
   npm run dev

4. Open: http://localhost:3000

Notes
- This is a WIP towards a collaborative AI model editor. Upcoming work: FastAPI training service, experiment tracking, auth, and real-time collaboration.
