async function callBackendTrain({ graph, dataset, config }) {
  const url = process.env.BACKEND_URL || 'http://localhost:8000'
  const res = await fetch(`${url}/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ graph, dataset, config }),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Training failed to start')
  }
  return res.json()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { graph, dataset, config } = req.body || {}
    if (!graph || !dataset) return res.status(400).json({ error: 'Graph and dataset required' })
    
    const { task_id } = await callBackendTrain({ graph, dataset, config: config || {} })
    
    return res.status(202).json({ taskId: task_id })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}



