import React, { useMemo } from 'react'
import useEditorStore from '../store/useEditorStore'

const ACTIVATIONS = ['relu', 'sigmoid', 'tanh', 'softmax', 'linear']

export default function PropertyPanel() {
  const { nodes, selectedNodeId, updateNodeData } = useEditorStore()
  const node = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId])

  if (!node) {
    return (
      <div className="panel-section">
        <h4>Properties</h4>
        <div>Select a node to edit</div>
      </div>
    )
  }

  const { type, data } = node
  const conf = data.conf || {}

  const onChange = (key, value) => {
    updateNodeData(node.id, { conf: { ...conf, [key]: value } })
  }

  return (
    <div>
      <div className="panel-section">
        <h4>Properties</h4>
        <div className="panel-row">
          <label>Label</label>
          <input
            value={data.label || ''}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          />
        </div>
        <div className="panel-row">
          <label>Type</label>
          <input value={type} disabled />
        </div>
      </div>

      {type === 'input' && (
        <div className="panel-section">
          <h4>Input</h4>
          <div className="panel-row">
            <label>Shape (e.g. 3,224,224)</label>
            <input
              value={conf.shape || ''}
              onChange={(e) => onChange('shape', e.target.value)}
              placeholder="channels,height,width"
            />
          </div>
        </div>
      )}

      {type === 'dense' && (
        <div className="panel-section">
          <h4>Dense</h4>
          <div className="panel-row">
            <label>Units</label>
            <input
              type="number"
              value={conf.units || 128}
              onChange={(e) => onChange('units', Number(e.target.value))}
            />
          </div>
          <div className="panel-row">
            <label>Activation</label>
            <select value={conf.activation || 'relu'} onChange={(e) => onChange('activation', e.target.value)}>
              {ACTIVATIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {type === 'conv' && (
        <div className="panel-section">
          <h4>Convolution</h4>
          <div className="panel-row">
            <label>Filters</label>
            <input type="number" value={conf.filters || 32} onChange={(e) => onChange('filters', Number(e.target.value))} />
          </div>
          <div className="panel-row">
            <label>Kernel Size</label>
            <input value={conf.kernel || '3,3'} onChange={(e) => onChange('kernel', e.target.value)} placeholder="h,w" />
          </div>
          <div className="panel-row">
            <label>Stride</label>
            <input value={conf.stride || '1,1'} onChange={(e) => onChange('stride', e.target.value)} placeholder="h,w" />
          </div>
        </div>
      )}

      {type === 'pool' && (
        <div className="panel-section">
          <h4>Pooling</h4>
          <div className="panel-row">
            <label>Mode</label>
            <select value={conf.mode || 'max'} onChange={(e) => onChange('mode', e.target.value)}>
              <option value="max">max</option>
              <option value="avg">avg</option>
            </select>
          </div>
          <div className="panel-row">
            <label>Kernel Size</label>
            <input value={conf.kernel || '2,2'} onChange={(e) => onChange('kernel', e.target.value)} />
          </div>
          <div className="panel-row">
            <label>Stride</label>
            <input value={conf.stride || '2,2'} onChange={(e) => onChange('stride', e.target.value)} />
          </div>
        </div>
      )}

      {type === 'dropout' && (
        <div className="panel-section">
          <h4>Dropout</h4>
          <div className="panel-row">
            <label>Rate</label>
            <input type="number" step="0.05" value={conf.rate || 0.5} onChange={(e) => onChange('rate', Number(e.target.value))} />
          </div>
        </div>
      )}

      {type === 'output' && (
        <div className="panel-section">
          <h4>Output</h4>
          <div className="panel-row">
            <label>Classes</label>
            <input type="number" value={conf.classes || 10} onChange={(e) => onChange('classes', Number(e.target.value))} />
          </div>
          <div className="panel-row">
            <label>Activation</label>
            <select value={conf.activation || 'softmax'} onChange={(e) => onChange('activation', e.target.value)}>
              {ACTIVATIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {type === 'custom' && (
        <div className="panel-section">
          <h4>Custom</h4>
          <div className="panel-row">
            <label>Config (JSON)</label>
            <textarea
              rows={6}
              value={JSON.stringify(conf || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  updateNodeData(node.id, { conf: parsed })
                } catch (_) {}
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}


