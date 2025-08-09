import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const list = await prisma.dataset.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, filename: true, path: true, metadata: true, createdAt: true } })
      return res.status(200).json(list)
    } catch (e) { return res.status(500).json({ error: e.message }) }
  }
  return res.status(405).json({ error: 'Method not allowed' })
}


