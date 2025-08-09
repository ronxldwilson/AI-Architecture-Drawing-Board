import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id required' })
  if (req.method === 'GET') {
    try {
      const ds = await prisma.dataset.findUnique({ where: { id } })
      if (!ds) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(ds)
    } catch (e) { return res.status(500).json({ error: e.message }) }
  }
  return res.status(405).json({ error: 'Method not allowed' })
}


