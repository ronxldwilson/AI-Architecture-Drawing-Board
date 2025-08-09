import React from 'react'
import { MODEL_TEMPLATES } from '../data/modelTemplates'
import useEditorStore from '../store/useEditorStore'

const BLOCKS = [
  { type: 'input', label: 'Input Layer' },
  { type: 'dense', label: 'Dense Layer' },
  { type: 'conv', label: 'Convolution Layer' },
  { type: 'pool', label: 'Pooling Layer' },
  { type: 'dropout', label: 'Dropout Layer' },
  { type: 'output', label: 'Output Layer' },
  { type: 'custom', label: 'Custom Block' },
]

export default function Palette() {
  const { setGraph } = useEditorStore()
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
  return (
    <div className="panel-section">
      <h4>Palette</h4>
      <div className="palette">
        {BLOCKS.map((b) => (
          <div
            key={b.type}
            className="palette-item"
            draggable
            onDragStart={(e) => onDragStart(e, b.type)}
            title="Drag onto canvas"
          >
            {b.label}
          </div>
        ))}
      </div>
      <div className="panel-section" style={{ marginTop: 12 }}>
        <h4>Templates</h4>
        <div className="palette">
          {MODEL_TEMPLATES.map((t) => (
            <div key={t.key} className="palette-item" onClick={() => setGraph(t.getGraph())} title="Load template">
              {t.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


