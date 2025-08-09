import fs from 'fs'
import path from 'path'
import prisma from '../../../lib/prisma'
import { DATASET_CATALOG } from '../../../data/datasetCatalog'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { key } = req.body || {}
    const item = DATASET_CATALOG.find((d) => d.key === key)
    if (!item) return res.status(400).json({ error: 'Unknown key' })
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

    const resp = await fetch(item.url)
    if (!resp.ok) return res.status(500).json({ error: 'Failed to download' })
    const arrayBuffer = await resp.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filePath = path.join(uploadsDir, item.filename)
    fs.writeFileSync(filePath, buffer)
    try {
      const ds = await prisma.dataset.create({ data: { filename: item.filename, path: filePath, metadata: { source: 'prefetch', url: item.url } } })
      return res.status(200).json({ id: ds.id, path: ds.path })
    } catch (_) {
      return res.status(200).json({ id: item.filename, path: filePath })
    }
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}


