export const templateSimpleCNN = () => ({
  nodes: [
    { id: '1', type: 'input', data: { label: 'Input', conf: { shape: '3,64,64' } }, position: { x: 80, y: 120 } },
    { id: '2', type: 'conv', data: { label: 'Conv2D', conf: { filters: 16, kernel: '3,3', stride: '1,1' } }, position: { x: 280, y: 120 } },
    { id: '3', type: 'pool', data: { label: 'MaxPool', conf: { mode: 'max', kernel: '2,2', stride: '2,2' } }, position: { x: 480, y: 120 } },
    { id: '4', type: 'dense', data: { label: 'Dense', conf: { units: 64, activation: 'relu' } }, position: { x: 680, y: 120 } },
    { id: '5', type: 'output', data: { label: 'Output', conf: { classes: 10, activation: 'softmax' } }, position: { x: 880, y: 120 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
  ],
})

export const templateMLP = () => ({
  nodes: [
    { id: '1', type: 'input', data: { label: 'Input', conf: { shape: '1,1,32' } }, position: { x: 80, y: 120 } },
    { id: '2', type: 'dense', data: { label: 'Dense', conf: { units: 64, activation: 'relu' } }, position: { x: 320, y: 120 } },
    { id: '3', type: 'dropout', data: { label: 'Dropout', conf: { rate: 0.2 } }, position: { x: 520, y: 120 } },
    { id: '4', type: 'dense', data: { label: 'Dense', conf: { units: 32, activation: 'relu' } }, position: { x: 720, y: 120 } },
    { id: '5', type: 'output', data: { label: 'Output', conf: { classes: 3, activation: 'softmax' } }, position: { x: 920, y: 120 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
  ],
})

export const templateCNNDropout = () => ({
  nodes: [
    { id: '1', type: 'input', data: { label: 'Input', conf: { shape: '3,64,64' } }, position: { x: 80, y: 80 } },
    { id: '2', type: 'conv', data: { label: 'Conv2D', conf: { filters: 32, kernel: '3,3', stride: '1,1' } }, position: { x: 280, y: 80 } },
    { id: '3', type: 'pool', data: { label: 'MaxPool', conf: { mode: 'max', kernel: '2,2', stride: '2,2' } }, position: { x: 480, y: 80 } },
    { id: '4', type: 'dropout', data: { label: 'Dropout', conf: { rate: 0.3 } }, position: { x: 680, y: 80 } },
    { id: '5', type: 'dense', data: { label: 'Dense', conf: { units: 128, activation: 'relu' } }, position: { x: 880, y: 80 } },
    { id: '6', type: 'output', data: { label: 'Output', conf: { classes: 10, activation: 'softmax' } }, position: { x: 1080, y: 80 } },
  ],
  edges: [
    { id: 'e1-2', source: '1', target: '2' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' },
    { id: 'e4-5', source: '4', target: '5' },
    { id: 'e5-6', source: '5', target: '6' },
  ],
})

export const MODEL_TEMPLATES = [
  { key: 'simple_cnn', name: 'Simple CNN', getGraph: templateSimpleCNN },
  { key: 'mlp', name: 'MLP (tabular)', getGraph: templateMLP },
  { key: 'cnn_dropout', name: 'CNN + Dropout', getGraph: templateCNNDropout },
]


