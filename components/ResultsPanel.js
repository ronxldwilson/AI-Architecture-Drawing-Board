import React from 'react'
import useResultsStore from '../store/useResultsStore'

export default function ResultsPanel() {
  const { results, error } = useResultsStore()

  if (error) {
    return (
      <div className="panel-section">
        <h4>Error</h4>
        <div className="error-box">{error}</div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="panel-section">
        <h4>Results</h4>
        <div>No results yet. Train a model to see results.</div>
      </div>
    )
  }

  return (
    <div className="panel-section">
      <h4>Results</h4>
      <table className="preview-table">
        <thead>
          <tr>
            <th>Epoch</th>
            <th>Train Loss</th>
            <th>Val Loss</th>
            <th>Train Acc</th>
            <th>Val Acc</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, i) => (
            <tr key={i}>
              <td>{row.epoch}</td>
              <td>{row.train_loss.toFixed(4)}</td>
              <td>{row.val_loss.toFixed(4)}</td>
              <td>{row.train_acc.toFixed(4)}</td>
              <td>{row.val_acc.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
