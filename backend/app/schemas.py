from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class Position(BaseModel):
    x: float
    y: float


class NodeData(BaseModel):
    label: str
    conf: Dict[str, Any] = Field(default_factory=dict)


class Node(BaseModel):
    id: str
    type: str
    data: NodeData
    position: Position


class Edge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str


class Graph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]


class GenerateRequest(BaseModel):
    graph: Graph


class TrainConfig(BaseModel):
    epochs: int = 2
    batch_size: int = 32
    learning_rate: float = 1e-3
    optimizer: str = "adam"
    loss: str = "cross_entropy"
    validation_split: float = 0.2


class DatasetSpec(BaseModel):
    type: str  # csv | images_zip | npz
    path: str


class TrainRequest(BaseModel):
    graph: Graph
    dataset: DatasetSpec
    config: TrainConfig = TrainConfig()


