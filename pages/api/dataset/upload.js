export const config = {
  api: {
    bodyParser: false,
  },
}

import fs from 'fs'
import path from 'path'
import { IncomingForm } from 'formidable'
import prisma from '../../../lib/prisma'

const DATASET_DIR = path.join(process.cwd(), 'uploads')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    if (!fs.existsSync(DATASET_DIR)) fs.mkdirSync(DATASET_DIR)
    const form = new IncomingForm({ multiples: false, keepExtensions: true, uploadDir: DATASET_DIR, maxFileSize: 200 * 1024 * 1024 })
    form.parse(req, (err, fields, files) => {
      if (err) return res.status(500).json({ error: err.message })
      const file = files.file
      if (!file) return res.status(400).json({ error: 'No file' })
      // formidable v3 file can be array or single
      const f = Array.isArray(file) ? file[0] : file
      const allowedExt = ['.csv', '.json', '.zip']
      const ext = (f.originalFilename || '').toLowerCase().slice(((f.originalFilename || '').lastIndexOf('.')))
      if (!allowedExt.includes(ext)) return res.status(400).json({ error: 'Unsupported file type' })
      if (f.size && f.size > 200 * 1024 * 1024) return res.status(400).json({ error: 'File too large (200MB cap)' })
      const id = path.basename(f.newFilename || f.originalFilename || f.filepath)
      const storedPath = f.filepath || path.join(DATASET_DIR, id)
      // Try DB insert; fallback to simple response if DB not configured
      const filename = f.originalFilename || id
      const metadata = { size: f.size, mimetype: f.mimetype }
      const createDataset = async () => {
        try {
          const ds = await prisma.dataset.create({ data: { filename, path: storedPath, metadata } })
          return { id: ds.id, path: ds.path }
        } catch (_) {
          return { id, path: storedPath }
        }
      }
      createDataset().then((out) => res.status(200).json(out))
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}


