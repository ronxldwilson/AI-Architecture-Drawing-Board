from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import GenerateRequest, TrainRequest
from .generator import generate_pytorch_code
from .train import CsvDataset, train_loop

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post('/generate')
def generate(req: GenerateRequest):
    try:
        code = generate_pytorch_code(req.graph)
        return { 'code': code }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post('/train')
def train(req: TrainRequest):
    # MVP supports only CSV datasets for quick demo
    if req.dataset.type != 'csv':
        raise HTTPException(status_code=400, detail='Only CSV dataset supported in MVP')
    try:
        # Dynamically exec the generated code to build a model
        code = generate_pytorch_code(req.graph)
        scope = {}
        exec(code, scope)
        Model = scope['GeneratedNet']
        model = Model()
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
        )
        return { 'history': history }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


