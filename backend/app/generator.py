from typing import List, Dict
from .schemas import Graph


def _indent(lines: List[str], n: int = 1) -> List[str]:
    return [("    " * n) + line for line in lines]


def generate_pytorch_code(graph: Graph) -> str:
    # Basic sequential mapping; assumes linear path.
    imports = [
        "import torch",
        "import torch.nn as nn",
        "import torch.nn.functional as F",
    ]

    # Build layers list from nodes following edge order
    id_to_node: Dict[str, any] = {n.id: n for n in graph.nodes}
    outgoing = {e.source: e.target for e in graph.edges}

    # Find start node
    targets = {e.target for e in graph.edges}
    starts = [n for n in graph.nodes if n.id not in targets]
    if not starts:
        raise ValueError("No input node found")
    current = starts[0]

    layers_def = []
    forward_lines = ["x = x"]
    idx = 0
    while current and current.id in id_to_node:
        t = current.type
        cfg = current.data.conf or {}
        name = f"layer{idx}"
        if t == "conv":
            filters = int(cfg.get("filters", 32))
            kernel = cfg.get("kernel", "3,3")
            k1, k2 = [int(x) for x in kernel.split(",")]
            stride = cfg.get("stride", "1,1")
            s1, s2 = [int(x) for x in stride.split(",")]
            # in_channels unknown until runtime; use Conv2d with lazy init
            layers_def.append(f"self.{name} = nn.LazyConv2d({filters}, kernel_size=({k1},{k2}), stride=({s1},{s2}))")
            forward_lines.append(f"x = self.{name}(x)")
            forward_lines.append("x = F.relu(x)")
        elif t == "pool":
            mode = cfg.get("mode", "max")
            kernel = cfg.get("kernel", "2,2")
            k1, k2 = [int(x) for x in kernel.split(",")]
            stride = cfg.get("stride", "2,2")
            s1, s2 = [int(x) for x in stride.split(",")]
            if mode == "avg":
                layers_def.append(f"self.{name} = nn.AvgPool2d(kernel_size=({k1},{k2}), stride=({s1},{s2}))")
            else:
                layers_def.append(f"self.{name} = nn.MaxPool2d(kernel_size=({k1},{k2}), stride=({s1},{s2}))")
            forward_lines.append(f"x = self.{name}(x)")
        elif t == "dense":
            units = int(cfg.get("units", 64))
            layers_def.append(f"self.{name} = nn.LazyLinear({units})")
            forward_lines.append("x = torch.flatten(x, 1) if x.dim() > 2 else x")
            forward_lines.append(f"x = self.{name}(x)")
            act = cfg.get("activation", "relu")
            if act == "relu":
                forward_lines.append("x = F.relu(x)")
        elif t == "dropout":
            rate = float(cfg.get("rate", 0.5))
            layers_def.append(f"self.{name} = nn.Dropout(p={rate})")
            forward_lines.append(f"x = self.{name}(x)")
        elif t == "output":
            classes = int(cfg.get("classes", 10))
            layers_def.append(f"self.{name} = nn.LazyLinear({classes})")
            forward_lines.append("x = torch.flatten(x, 1) if x.dim() > 2 else x")
            forward_lines.append(f"x = self.{name}(x)")
            act = (current.data.conf or {}).get("activation", "softmax")
            if act == "softmax":
                forward_lines.append("x = F.log_softmax(x, dim=1)")
        # input/custom -> no-op here

        idx += 1
        nxt_id = outgoing.get(current.id)
        current = id_to_node.get(nxt_id)

    model_lines = [
        "class GeneratedNet(nn.Module):",
        *_indent(["def __init__(self):", "super().__init__()"] + layers_def),
        *_indent(["def forward(self, x):"] + _indent(forward_lines, 1), 1),
    ]

    full = "\n".join(imports + [""] + model_lines)
    return full


