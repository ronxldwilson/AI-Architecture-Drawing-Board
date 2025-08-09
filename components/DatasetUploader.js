import React, { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import JSZip from 'jszip'
import { DATASET_CATALOG } from '../data/datasetCatalog'

export default function DatasetUploader() {
  const [fileInfo, setFileInfo] = useState(null)
  const [csvPreview, setCsvPreview] = useState(null)
  const [zipPreview, setZipPreview] = useState([])
  const [thumbs, setThumbs] = useState([])

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return
    const file = acceptedFiles[0]
    setFileInfo({ name: file.name, size: file.size })
    setCsvPreview(null)
    setZipPreview([])
    setThumbs([])

    if (file.name.toLowerCase().endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        preview: 10,
        complete: (results) => {
          setCsvPreview({ fields: results.meta.fields || [], rows: results.data || [] })
        },
      })
    } else if (file.name.toLowerCase().endsWith('.json')) {
      const text = await file.text()
      try {
        const obj = JSON.parse(text)
        setCsvPreview({ fields: Object.keys(obj[0] || obj || {}), rows: Array.isArray(obj) ? obj.slice(0, 10) : [obj] })
      } catch (e) {
        setCsvPreview({ fields: ['content'], rows: [{ content: text.slice(0, 500) + '...' }] })
      }
    } else if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const zip = await JSZip.loadAsync(file)
        const entries = []
        const imageEntries = []
        zip.forEach((relativePath, entry) => {
          if (!entry.dir) {
            entries.push(relativePath)
            const lower = relativePath.toLowerCase()
            if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif')) {
              imageEntries.push(entry)
            }
          }
        })
        setZipPreview(entries.slice(0, 25))
        const firstImages = imageEntries.slice(0, 12)
        const generated = []
        for (const imgEntry of firstImages) {
          try {
            const blob = await imgEntry.async('blob')
            const url = URL.createObjectURL(blob)
            generated.push({ name: imgEntry.name, url })
          } catch (_) {}
        }
        setThumbs(generated)
      } catch (_) {}
    }

    // Upload to backend placeholder
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/dataset/upload', { method: 'POST', body })
      if (res.ok) {
        const data = await res.json()
        console.log('Uploaded dataset id:', data.id)
      }
    } catch (e) {
      console.warn('Upload failed (API not implemented yet).')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false, accept: { 'text/csv': ['.csv'], 'application/zip': ['.zip'], 'application/json': ['.json'] } })

  const table = useMemo(() => {
    if (!csvPreview) return null
    const { fields, rows } = csvPreview
    return (
      <table className="preview-table">
        <thead>
          <tr>{fields.map((f) => (<th key={f}>{f}</th>))}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {fields.map((f) => (
                <td key={f}>{String(r[f] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }, [csvPreview])

  return (
    <div className="panel-section">
      <h4>Dataset Uploader</h4>
      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 12, color: '#475569' }}>Quick import from internet:</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginTop: 6 }}>
          {DATASET_CATALOG.map((d) => (
            <button key={d.key} onClick={async () => {
              const res = await fetch('/api/datasets/prefetch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: d.key }) })
              if (res.ok) {
                const out = await res.json()
                setFileInfo({ name: d.filename, size: 0 })
              } else {
                alert('Failed to fetch dataset')
              }
            }}>{d.name}</button>
          ))}
        </div>
      </div>
      <div {...getRootProps({ className: 'uploader' })}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the file here...</p> : <p>Drag and drop CSV, JSON, or ZIP of images here, or click to select</p>}
      </div>
      {fileInfo && (
        <div style={{ fontSize: 12, marginTop: 6, color: '#64748b' }}>
          Selected: {fileInfo.name} ({Math.round(fileInfo.size / 1024)} KB)
        </div>
      )}
      {table}
      {zipPreview.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Archive entries (first {zipPreview.length}):</div>
          <ul style={{ maxHeight: 160, overflow: 'auto', fontSize: 12 }}>
            {zipPreview.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      {thumbs.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, color: '#64748b' }}>Image thumbnails:</div>
          <div className="thumb-grid">
            {thumbs.map((t) => (
              <div key={t.name} className="thumb">
                <img src={t.url} alt={t.name} />
                <div className="thumb-label" title={t.name}>{t.name.split('/').pop()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


