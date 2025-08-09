// Public small datasets for quick tests. These are proxies/pointers; server fetch will mirror locally.
export const DATASET_CATALOG = [
  {
    key: 'iris_csv',
    name: 'Iris (CSV)',
    type: 'csv',
    url: 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/iris.csv',
    filename: 'iris.csv',
  },
  {
    key: 'mnist_json_sample',
    name: 'MNIST sample (JSON)',
    type: 'json',
    url: 'https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz',
    filename: 'mnist.npz',
    note: 'Binary npz; stored as file without preview',
  },
]


