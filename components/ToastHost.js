import React, { useEffect } from 'react'
import useToastStore from '../store/useToastStore'

export default function ToastHost() {
  const items = useToastStore((s) => s.items)
  const remove = useToastStore((s) => s.remove)

  useEffect(() => {
    const timers = items.map((t) => setTimeout(() => remove(t.id), 3000))
    return () => timers.forEach(clearTimeout)
  }, [items, remove])

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
      {items.map((t) => (
        <div key={t.id} style={{
          minWidth: 220,
          background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#dcfce7' : '#e2e8f0',
          color: '#0f172a',
          border: '1px solid #e2e8f0',
          borderLeft: `4px solid ${t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#22c55e' : '#64748b'}`,
          borderRadius: 6,
          padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          {t.message}
        </div>
      ))}
    </div>
  )
}


