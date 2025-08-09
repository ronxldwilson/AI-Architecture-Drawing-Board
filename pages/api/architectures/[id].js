import prisma from '../../../lib/prisma'
import { GraphSchema } from '../../../lib/schema'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id required' })

  if (req.method === 'GET') {
    try {
      const arch = await prisma.architecture.findUnique({ where: { id } })
      if (!arch || arch.archived) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json({ id: arch.id, name: arch.name, description: arch.description, graph: arch.graph })
    } catch (e) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'PUT') {
    try {
      const { name, description, graph } = req.body || {}
      if (graph) { try { GraphSchema.parse(graph) } catch (e) { return res.status(400).json({ error: 'Invalid graph', details: e.errors }) } }
      const updated = await prisma.architecture.update({ where: { id }, data: { name, description, graph } })
      return res.status(200).json({ ok: true, id: updated.id })
    } catch (e) { return res.status(500).json({ error: e.message }) }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.architecture.update({ where: { id }, data: { archived: true } })
      return res.status(200).json({ ok: true })
    } catch (e) { return res.status(500).json({ error: e.message }) }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}


