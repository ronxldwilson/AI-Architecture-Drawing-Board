import os
import io
import csv
import math
import random
from typing import Tuple

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split


class CsvDataset(Dataset):
    def __init__(self, path: str):
        # very simple: last column is label; others are features
        self.features = []
        self.labels = []
        with open(path, 'r', newline='') as f:
            reader = csv.reader(f)
            header = next(reader, None)
            for row in reader:
                try:
                    floats = [float(x) for x in row[:-1]]
                    label = int(float(row[-1])) if row[-1] else 0
                except Exception:
                    # skip malformed rows
                    continue
                self.features.append(floats)
                self.labels.append(label)

        self.num_features = len(self.features[0]) if self.features else 0
        self.num_classes = max(self.labels) + 1 if self.labels else 1

    def __len__(self):
        return len(self.features)

    def __getitem__(self, idx):
        x = torch.tensor(self.features[idx], dtype=torch.float32)
        y = torch.tensor(self.labels[idx], dtype=torch.long)
        return x, y


def create_optimizer(name: str, params, lr: float):
    name = (name or 'adam').lower()
    if name == 'sgd':
        return optim.SGD(params, lr=lr, momentum=0.9)
    return optim.Adam(params, lr=lr)


def create_loss(name: str):
    name = (name or 'cross_entropy').lower()
    if name in ('nll', 'nll_loss'):
        return nn.NLLLoss()
    return nn.CrossEntropyLoss()


def train_loop(model: nn.Module, dataset: Dataset, epochs: int = 2, batch_size: int = 32, lr: float = 1e-3, optimizer_name: str = 'adam', loss_name: str = 'cross_entropy', device: str = 'cpu', progress_callback=None):
    device = torch.device(device)
    model.to(device)
    optimizer = create_optimizer(optimizer_name, model.parameters(), lr)
    criterion = create_loss(loss_name)

    # split
    val_percent = 0.2
    val_size = int(val_percent * len(dataset))
    if len(dataset) > 1 and val_size == 0:
        val_size = 1
    train_size = len(dataset) - val_size
    if train_size > 0 and val_size > 0:
        train_ds, val_ds = random_split(dataset, [train_size, val_size])
    else:
        train_ds = dataset
        val_ds = dataset
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size)

    history = []
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        for inputs, targets in train_loader:
            inputs, targets = inputs.to(device), targets.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * targets.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == targets).sum().item()
            total += targets.size(0)
        train_loss = running_loss / max(1, total)
        train_acc = correct / max(1, total)

        # val
        model.eval()
        v_running_loss = 0.0
        v_correct = 0
        v_total = 0
        with torch.no_grad():
            for inputs, targets in val_loader:
                inputs, targets = inputs.to(device), targets.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)
                v_running_loss += loss.item() * targets.size(0)
                preds = outputs.argmax(dim=1)
                v_correct += (preds == targets).sum().item()
                v_total += targets.size(0)
        val_loss = v_running_loss / max(1, v_total)
        val_acc = v_correct / max(1, v_total)
        
        epoch_history = { 'epoch': epoch + 1, 'train_loss': train_loss, 'train_acc': train_acc, 'val_loss': val_loss, 'val_acc': val_acc }
        history.append(epoch_history)

        if progress_callback:
            progress_callback(epoch_history)

    return history


