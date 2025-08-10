import { create } from 'zustand'

const useResultsStore = create((set) => ({
  results: null,
  error: null,
  setResults: (results) => set({ results: results, error: null }),
  setError: (error) => set({ error: error, results: null }),
}))

export default useResultsStore
