import React, { useRef } from 'react'
import useEditorStore from '../store/useEditorStore'
import useDatasetStore from '../store/useDatasetStore'
import useResultsStore from '../store/useResultsStore'
import { useToast } from '../store/useToastStore'

export default function Toolbar() {
  const { nodes, edges, setNodes, setEdges, setActiveArchitecture } = useEditorStore()
  const { selectedDataset } = useDatasetStore()
  const { setResults, setError } = useResultsStore()
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

  const train = async () => {
    if (!selectedDataset) {
      toast.error('Please select a dataset first.')
      return
    }

    toast.info('Starting training...')
    setResults(null) // Clear previous results
    try {
      const res = await fetch('/api/experiments/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph: { nodes, edges },
          dataset: { type: selectedDataset.type, path: selectedDataset.path },
          config: { epochs: 10, batch_size: 32, learning_rate: 0.001, optimizer: 'adam', loss: 'cross_entropy' }
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      const { taskId } = await res.json()
      toast.success(`Training started with task ID: ${taskId.slice(0, 8)}...`)

      // Poll for results
      const poll = async () => {
        const statusRes = await fetch(`/api/experiments/${taskId}`)
        const statusData = await statusRes.json()

        if (statusData.status === 'completed') {
          toast.success('Training completed!')
          setResults(statusData.history)
        } else if (statusData.status === 'failed') {
          toast.error('Training failed!')
          setError(statusData.error)
        } else if (statusData.status === 'running') {
          setResults(statusData.history)
          setTimeout(poll, 2000) // Poll more frequently while running
        } else { // Queued
          setTimeout(poll, 5000)
        }
      }
      setTimeout(poll, 1000)

    } catch (e) {
      toast.error(`Failed to start training: ${e.message}`)
    }
  }

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <h5>File</h5>
        <button onClick={saveAs}>Save As</button>
        <button onClick={load}>Load</button>
        <button onClick={(e) => { e.stopPropagation(); window.__exportGraph && window.__exportGraph() }}>Export JSON</button>
        <button onClick={(e) => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click() }}>Import JSON</button>
        <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => e.target.files && e.target.files[0] && importJson(e.target.files[0])} />
      </div>
      <div className="toolbar-group">
        <h5>Actions</h5>
        <button onClick={(e) => { e.stopPropagation(); alert('Generate PyTorch code — backend to be implemented') }}>Generate Code</button>
        <button onClick={train}>Train</button>
        <button onClick={(e) => { e.stopPropagation(); alert('Compare results — dashboard to be implemented') }}>Compare</button>
      </div>
    </div>
  )
}


