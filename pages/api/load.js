import fs from 'fs'
import path from 'path'
import prisma from '../../lib/prisma'

const DATA_FILE = path.join(process.cwd(), 'saved_graph.json')

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const arch = await prisma.architecture.findUnique({ where: { id: 'default-architecture-id' } })
    if (!arch) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(arch.graph)
  } catch (e) {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        return res.status(404).json({ error: 'Not found' })
      }
      const raw = fs.readFileSync(DATA_FILE)
      const payload = JSON.parse(raw)
      return res.status(200).json(payload)
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
