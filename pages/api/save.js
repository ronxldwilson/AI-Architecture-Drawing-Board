import fs from 'fs'
import path from 'path'
import prisma from '../../lib/prisma'

const DATA_FILE = path.join(process.cwd(), 'saved_graph.json')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const payload = req.body
  // Try to persist to DB as the canonical storage
  try {
    const name = payload.name || 'default'
    await prisma.architecture.upsert({
      where: { id: 'default-architecture-id' },
      update: { name, graph: payload },
      create: { id: 'default-architecture-id', name, graph: payload },
    })
    return res.status(200).json({ ok: true, storage: 'db' })
  } catch (e) {
    // Fallback to file for local demo if DB is not configured
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2))
      return res.status(200).json({ ok: true, storage: 'file' })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
