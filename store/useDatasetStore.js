import { create } from 'zustand'

const useDatasetStore = create((set) => ({
  datasets: [],
  selectedDataset: null,
  addDataset: (dataset) => set((state) => ({ datasets: [...state.datasets, dataset] })),
  setSelectedDataset: (dataset) => set({ selectedDataset: dataset }),
}))

export default useDatasetStore
