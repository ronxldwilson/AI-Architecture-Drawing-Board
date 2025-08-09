import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  MiniMap,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow'
import useEditorStore from '../store/useEditorStore'

export default function Editor() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    setSelectedNodeId,
  } = useEditorStore()

  const [rfInstance, setRfInstance] = useState(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    window.__saveGraph = async () => {
      const payload = { nodes, edges }
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) alert('Saved graph.')
    }
    window.__loadGraph = async () => {
      const res = await fetch('/api/load')
      if (res.ok) {
        const data = await res.json()
        setNodes(data.nodes || [])
        setEdges(data.edges || [])
        alert('Loaded graph.')
      } else {
        alert('No saved graph.')
      }
    }
    window.__exportGraph = () => {
      const payload = { nodes, edges }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'architecture.json'
      a.click()
      URL.revokeObjectURL(url)
    }
    return () => {
      delete window.__saveGraph
      delete window.__loadGraph
      delete window.__exportGraph
    }
  }, [nodes, edges, setNodes, setEdges])

  const onNodesChange = useCallback(
    (changes) => setNodes((existingNodes) => applyNodeChanges(changes, existingNodes)),
    [setNodes]
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((existingEdges) => applyEdgeChanges(changes, existingEdges)),
    [setEdges]
  )
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return
      const bounds = wrapperRef.current.getBoundingClientRect()
      const position = rfInstance ? rfInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }) : { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
      addNode(type, position)
    },
    [addNode, rfInstance]
  )

  const onSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    const first = selectedNodes && selectedNodes.length > 0 ? selectedNodes[0] : null
    setSelectedNodeId(first ? first.id : null)
  }, [setSelectedNodeId])

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={setRfInstance}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={onSelectionChange}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
