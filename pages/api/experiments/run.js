import prisma from '../../../lib/prisma'

async function callBackendTrain({ graph, datasetPath, config }) {
  const url = process.env.BACKEND_URL || 'http://localhost:8001'
  const res = await fetch(`${url}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ graph, dataset: { type: 'csv', path: datasetPath }, config }),
  })
  if (!res.ok) throw new Error('Training failed')
  return res.json()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { architectureId, datasetId, config } = req.body || {}
    if (!architectureId || !datasetId) return res.status(400).json({ error: 'architectureId and datasetId required' })
    const [arch, ds] = await Promise.all([
      prisma.architecture.findUnique({ where: { id: architectureId } }),
      prisma.dataset.findUnique({ where: { id: datasetId } }),
    ])
    if (!arch || !ds) return res.status(404).json({ error: 'Not found' })
    // For MVP, call backend synchronously
    const out = await callBackendTrain({ graph: arch.graph, datasetPath: ds.path, config: config || {} })
    const exp = await prisma.experiment.create({ data: { architectureId, datasetId, config: config || {}, status: 'completed' } })
    // store metrics
    for (const m of out.history || []) {
      await prisma.metric.create({ data: { experimentId: exp.id, step: m.epoch, key: 'train_loss', value: m.train_loss } })
      await prisma.metric.create({ data: { experimentId: exp.id, step: m.epoch, key: 'val_loss', value: m.val_loss } })
      await prisma.metric.create({ data: { experimentId: exp.id, step: m.epoch, key: 'train_acc', value: m.train_acc } })
      await prisma.metric.create({ data: { experimentId: exp.id, step: m.epoch, key: 'val_acc', value: m.val_acc } })
    }
    return res.status(200).json({ id: exp.id, status: 'completed', history: out.history })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}


