from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from .schemas import GenerateRequest, TrainRequest
from .generator import generate_pytorch_code
from .train import CsvDataset, train_loop
from .model_factory import create_model
import uuid

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks = {}

def run_training(task_id: str, req: TrainRequest):
    tasks[task_id] = {"status": "running", "history": []}

    def progress_callback(epoch_history):
        tasks[task_id]["history"].append(epoch_history)

    try:
        model = create_model(req.graph)
        ds = CsvDataset(req.dataset.path)
        history = train_loop(
            model,
            ds,
            epochs=req.config.epochs,
            batch_size=req.config.batch_size,
            lr=req.config.learning_rate,
            optimizer_name=req.config.optimizer,
            loss_name=req.config.loss,
            device='cpu',
            progress_callback=progress_callback
        )
        tasks[task_id]["status"] = "completed"
    except Exception as e:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

@app.post('/generate')
def generate(req: GenerateRequest):
    try:
        code = generate_pytorch_code(req.graph)
        return { 'code': code }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post('/train')
async def train(req: TrainRequest, background_tasks: BackgroundTasks):
    if req.dataset.type != 'csv':
        raise HTTPException(status_code=400, detail='Only CSV dataset supported in MVP')
    
    task_id = str(uuid.uuid4())
    background_tasks.add_task(run_training, task_id, req)
    
    return {"task_id": task_id}

@app.get("/train/{task_id}")
async def get_status(task_id: str):
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


