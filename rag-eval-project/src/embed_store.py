import os
import chromadb
from sentence_transformers import SentenceTransformer
from ingest import load_documents
from chunking import chunk_documents

model = SentenceTransformer("all-MiniLM-L6-v2")
CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_db")
client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection("syllabus_docs")

def build_index():
    docs = load_documents()
    chunks = chunk_documents(docs)

    texts = [c["text"] for c in chunks]
    ids = [c["id"] for c in chunks]
    metadatas = [{"source": c["source"]} for c in chunks]

    embeddings = model.encode(texts).tolist()

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas
    )
    print(f"Indexed {len(chunks)} chunks from {len(docs)} documents.")

if __name__ == "__main__":
    build_index()