import { create } from 'zustand'

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input', conf: { shape: '3,64,64' } },
    position: { x: 80, y: 120 },
  },
  {
    id: '2',
    type: 'conv',
    data: { label: 'Conv2D', conf: { filters: 16, kernel: '3,3', stride: '1,1' } },
    position: { x: 280, y: 120 },
  },
  {
    id: '3',
    type: 'pool',
    data: { label: 'MaxPool', conf: { mode: 'max', kernel: '2,2', stride: '2,2' } },
    position: { x: 480, y: 120 },
  },
  {
    id: '4',
    type: 'dense',
    data: { label: 'Dense', conf: { units: 64, activation: 'relu' } },
    position: { x: 680, y: 120 },
  },
  {
    id: '5',
    type: 'output',
    data: { label: 'Output', conf: { classes: 10, activation: 'softmax' } },
    position: { x: 880, y: 120 },
  },
]

const generateDefaultDataForType = (type) => {
  switch (type) {
    case 'input':
      return { label: 'Input', conf: { shape: '3,224,224' } }
    case 'dense':
      return { label: 'Dense', conf: { units: 128, activation: 'relu' } }
    case 'conv':
      return { label: 'Conv2D', conf: { filters: 32, kernel: '3,3', stride: '1,1' } }
    case 'pool':
      return { label: 'Pooling', conf: { mode: 'max', kernel: '2,2', stride: '2,2' } }
    case 'dropout':
      return { label: 'Dropout', conf: { rate: 0.5 } }
    case 'output':
      return { label: 'Output', conf: { classes: 10, activation: 'softmax' } }
    case 'custom':
      return { label: 'Custom', conf: {} }
    default:
      return { label: 'Block', conf: {} }
  }
}

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
]

const useEditorStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  nextId: 6,
  activeArchitectureId: null,
  activeArchitectureName: null,

  setNodes: (updater) =>
    set((state) => ({ nodes: typeof updater === 'function' ? updater(state.nodes) : updater })),
  setEdges: (updater) =>
    set((state) => ({ edges: typeof updater === 'function' ? updater(state.edges) : updater })),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setActiveArchitecture: ({ id, name }) => set({ activeArchitectureId: id, activeArchitectureName: name }),
  setGraph: (graph) => set({ nodes: graph.nodes || [], edges: graph.edges || [] }),

  addNode: (type, position) =>
    set((state) => {
      const id = String(state.nextId)
      const data = generateDefaultDataForType(type)
      return {
        nodes: state.nodes.concat({ id, type, data, position }),
        nextId: state.nextId + 1,
      }
    }),

  updateNodeData: (id, partialData) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...partialData } } : n)),
    })),
}))

export default useEditorStore


