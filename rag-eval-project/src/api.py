from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from generate import answer_question
from embed_store import build_index

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # we'll tighten this after frontend is deployed
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    build_index()

class Query(BaseModel):
    question: str

@app.post("/query")
def query_endpoint(q: Query):
    answer, sources = answer_question(q.question)
    return {
        "answer": answer,
        "sources": [{"text": t[:200], "source": s} for t, s in sources]
    }