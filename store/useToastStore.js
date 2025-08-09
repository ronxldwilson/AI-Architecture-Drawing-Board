import { create } from 'zustand'

const useToastStore = create((set) => ({
  items: [],
  push: (item) => set((s) => ({ items: [...s.items, { id: Date.now() + Math.random(), ...item }] })),
  remove: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}))

export const useToast = () => {
  const { push } = useToastStore()
  return {
    success: (m) => push({ type: 'success', message: m }),
    error: (m) => push({ type: 'error', message: m }),
    info: (m) => push({ type: 'info', message: m }),
  }
}

export default useToastStore


