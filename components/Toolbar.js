import React, { useRef } from 'react'
import useEditorStore from '../store/useEditorStore'
import { useToast } from '../store/useToastStore'

export default function Toolbar() {
  const { nodes, edges, setNodes, setEdges, setActiveArchitecture } = useEditorStore()
  const toast = useToast()
  const fileInputRef = useRef(null)

  const saveAs = async () => {
    try {
      const name = window.prompt('Save as (name/title):')
      if (!name) return
      const res = await fetch('/api/architectures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, graph: { nodes, edges } }) })
      const data = await res.json()
      if (res.ok) {
        setActiveArchitecture({ id: data.id, name })
        toast.success('Saved')
      } else {
        toast.error(data.error || 'Save failed')
      }
    } catch (e) { toast.error('Save failed') }
  }

  const load = async () => {
    try {
      const res = await fetch('/api/architectures')
      const list = await res.json()
      if (!res.ok) return toast.error('Load failed')
      if (!list.length) return toast.error('No saved architectures')
      const choice = window.prompt('Enter index to load:\n' + list.map((a, i) => `${i + 1}. ${a.name} (${a.id.slice(0, 6)})`).join('\n'))
      const idx = Number(choice) - 1
      if (Number.isNaN(idx) || idx < 0 || idx >= list.length) return
      const arch = await fetch(`/api/architectures/${list[idx].id}`).then(r => r.json())
      if (arch && arch.graph) {
        setNodes(arch.graph.nodes || [])
        setEdges(arch.graph.edges || [])
        setActiveArchitecture({ id: arch.id, name: arch.name })
        toast.success('Loaded')
      } else { toast.error('Invalid architecture') }
    } catch (e) { toast.error('Load failed') }
  }

  const importJson = async (file) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!parsed.nodes || !parsed.edges) throw new Error('Invalid JSON')
      setNodes(parsed.nodes)
      setEdges(parsed.edges)
      toast.success('Imported from JSON')
    } catch (e) { toast.error('Import failed') }
  }

  return (
    <div className="toolbar">
      <button onClick={saveAs}>Save As</button>
      <button onClick={load}>Load</button>
      <button onClick={(e) => { e.stopPropagation(); window.__exportGraph && window.__exportGraph() }}>Export JSON</button>
      <button onClick={(e) => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click() }}>Import JSON</button>
      <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => e.target.files && e.target.files[0] && importJson(e.target.files[0])} />
      <button onClick={(e) => { e.stopPropagation(); alert('Generate PyTorch code — backend to be implemented') }}>Generate PyTorch</button>
      <button onClick={(e) => { e.stopPropagation(); alert('Train model — backend to be implemented') }}>Train</button>
      <button onClick={(e) => { e.stopPropagation(); alert('Compare results — dashboard to be implemented') }}>Compare</button>
    </div>
  )
}


