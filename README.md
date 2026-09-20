# RAG Evaluation Framework

A Retrieval-Augmented Generation (RAG) system for answering questions grounded in course syllabus and question-paper content, paired with an automated evaluation framework that benchmarks retrieval and generation quality across different pipeline configurations.

**Live demo:** https://rag-evaluation-framework.vercel.app
**Live API:** https://rag-eval-api-ids2.onrender.com/docs

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after a period of no traffic may take 30-50 seconds to respond while the service wakes up.

---

## What it does

The system ingests PDF documents (syllabi, question papers), chunks and embeds them, and answers natural-language questions using only the retrieved context — with source attribution shown alongside every answer. Rather than shipping a single, unmeasured RAG pipeline, the project systematically varies key configuration choices (chunk size, retrieval depth, embedding model) and measures the impact of each on:

- **Retrieval Recall@k** — does the system retrieve the correct source document for a given question?
- **Faithfulness** — does the generated answer actually reflect the retrieved content, rather than hallucinating?

## Key result

Switching from a general-purpose embedding model (`all-MiniLM-L6-v2`) to a smaller, weaker one (`paraphrase-albert-small-v2`) caused retrieval recall to drop from **100% to 83.33%**, while faithfulness remained unchanged — demonstrating the framework's ability to detect retrieval quality regressions that would otherwise go unnoticed.

| Variant | Chunk Size | k | Embedding Model | Recall@k | Faithfulness |
|---|---|---|---|---|---|
| Baseline | 500 | 3 | MiniLM (384d) | 100% | 100% |
| A — Smaller chunks | 100 | 3 | MiniLM (384d) | 100% | 100% |
| B — Larger k | 500 | 5 | MiniLM (384d) | 100% | 100% |
| C — Weaker embeddings | 500 | 3 | Albert-small (768d) | 83.33% | 100% |

## Architecture

```
rag-eval-project/          Backend (FastAPI + Python)
├── src/
│   ├── ingest.py           PDF text extraction
│   ├── chunking.py         Document chunking with configurable size/overlap
│   ├── embed_store.py      Embedding (fastembed) + vector storage (ChromaDB)
│   ├── retrieve.py         Semantic retrieval
│   ├── generate.py         LLM answer generation (Groq API), grounded in retrieved context
│   ├── eval_harness.py     Evaluation: retrieval recall@k, faithfulness scoring
│   └── api.py               FastAPI endpoint wrapping the pipeline
├── data/raw/                Source PDF documents
└── eval/eval_set.json       Hand-written test questions with expected sources/keywords

rag-dashboard/              Frontend (React + Vite)
└── src/App.jsx              Query interface + variant comparison dashboard
```

**Stack:** Python, FastAPI, ChromaDB, fastembed, Groq API (LLM inference), React, Vite, deployed on Render (backend) and Vercel (frontend).

## How the evaluation works

1. A hand-written test set (`eval/eval_set.json`) pairs questions with their expected source document and expected answer keywords.
2. For each configuration variant, the full pipeline is rebuilt (re-chunked, re-embedded, re-indexed) and run against every test question.
3. **Recall@k** checks whether the correct source document appears among the top-k retrieved chunks.
4. **Faithfulness** checks whether the generated answer contains the expected keywords, as a proxy for groundedness.
5. Results are compared across variants to identify which configuration choices actually matter.

## Running locally

**Backend:**
```bash
cd rag-eval-project
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
# Add your Groq API key to a .env file: GROQ_API_KEY=your_key_here
python src/embed_store.py    # builds the vector index
uvicorn src.api:app --reload --app-dir src
```

**Frontend:**
```bash
cd rag-dashboard
npm install
npm run dev
```

**Run the evaluation suite:**
```bash
cd rag-eval-project
python src/eval_harness.py
```

## Notes

- Sample corpus included (`data/raw/`) covers DBMS, Operating Systems, Data Structures, and Computer Networks syllabi/question papers, generated for demonstration purposes.
- The backend rebuilds its vector index on startup to avoid persisting a stale/incompatible index across deploys.
- Deployed using a lightweight ONNX-based embedding backend (`fastembed`) instead of PyTorch/sentence-transformers, to fit within free-tier memory limits.
