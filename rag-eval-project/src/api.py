from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
import io

from generate import answer_question
from embed_store import build_index, collection, embed_texts
from chunking import chunk_documents

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Read the uploaded PDF directly from memory
    contents = await file.read()
    reader = PdfReader(io.BytesIO(contents))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    # Reuse existing chunking logic
    docs = [{"filename": file.filename, "text": text}]
    chunks = chunk_documents(docs)

    texts = [c["text"] for c in chunks]
    ids = [f"upload_{c['id']}" for c in chunks]  # prefix to avoid ID collisions
    metadatas = [{"source": c["source"]} for c in chunks]

    embeddings = embed_texts(texts)

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas
    )

    return {
        "filename": file.filename,
        "chunks_added": len(chunks)
    }