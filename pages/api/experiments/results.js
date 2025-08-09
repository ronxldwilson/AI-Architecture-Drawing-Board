import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id required' })
    const exp = await prisma.experiment.findUnique({ where: { id }, include: { metrics: true } })
    if (!exp) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json({ id: exp.id, status: exp.status, metrics: exp.metrics })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}


