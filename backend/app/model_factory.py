import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Dict
from .schemas import Graph

class Flatten(nn.Module):
    def forward(self, x):
        return torch.flatten(x, 1) if x.dim() > 2 else x

def create_model(graph: Graph) -> nn.Module:
    id_to_node: Dict[str, any] = {n.id: n for n in graph.nodes}
    outgoing = {e.source: e.target for e in graph.edges}
    targets = {e.target for e in graph.edges}
    starts = [n for n in graph.nodes if n.id not in targets]
    if not starts:
        raise ValueError("No input node found")
    
    current = starts[0]
    layers = []
    
    while current and current.id in id_to_node:
        t = current.type
        cfg = current.data.conf or {}
        
        if t == "conv":
            filters = int(cfg.get("filters", 32))
            kernel_str = cfg.get("kernel", "3,3")
            k1, k2 = [int(x) for x in kernel_str.split(",")]
            stride_str = cfg.get("stride", "1,1")
            s1, s2 = [int(x) for x in stride_str.split(",")]
            layers.append(nn.LazyConv2d(filters, kernel_size=(k1, k2), stride=(s1, s2)))
            layers.append(nn.ReLU())
        elif t == "pool":
            mode = cfg.get("mode", "max")
            kernel_str = cfg.get("kernel", "2,2")
            k1, k2 = [int(x) for x in kernel_str.split(",")]
            stride_str = cfg.get("stride", "2,2")
            s1, s2 = [int(x) for x in stride_str.split(",")]
            if mode == "avg":
                layers.append(nn.AvgPool2d(kernel_size=(k1, k2), stride=(s1, s2)))
            else:
                layers.append(nn.MaxPool2d(kernel_size=(k1, k2), stride=(s1, s2)))
        elif t == "dense":
            units = int(cfg.get("units", 64))
            layers.append(Flatten())
            layers.append(nn.LazyLinear(units))
            act = cfg.get("activation", "relu")
            if act == "relu":
                layers.append(nn.ReLU())
        elif t == "dropout":
            rate = float(cfg.get("rate", 0.5))
            layers.append(nn.Dropout(p=rate))
        elif t == "output":
            classes = int(cfg.get("classes", 10))
            layers.append(Flatten())
            layers.append(nn.LazyLinear(classes))
            act = cfg.get("activation", "softmax")
            if act == "softmax":
                layers.append(nn.LogSoftmax(dim=1))

        next_id = outgoing.get(current.id)
        current = id_to_node.get(next_id)
        
    return nn.Sequential(*layers)
