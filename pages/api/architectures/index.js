import prisma from '../../../lib/prisma'
import { GraphSchema } from '../../../lib/schema'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const list = await prisma.architecture.findMany({
        where: { archived: false },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, description: true, updatedAt: true, createdAt: true },
      })
      return res.status(200).json(list)
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }
  if (req.method === 'POST') {
    try {
      const { name, description, graph } = req.body || {}
      if (!name || typeof name !== 'string') return res.status(400).json({ error: 'name required' })
      try { GraphSchema.parse(graph) } catch (e) { return res.status(400).json({ error: 'Invalid graph', details: e.errors }) }
      const created = await prisma.architecture.create({ data: { name, description: description || null, graph } })
      return res.status(200).json({ id: created.id })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  }
  return res.status(405).json({ error: 'Method not allowed' })
}


