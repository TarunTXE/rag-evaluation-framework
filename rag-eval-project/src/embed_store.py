import os
import chromadb
from fastembed import TextEmbedding
from ingest import load_documents
from chunking import chunk_documents

embed_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")

CHROMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "chroma_db")
client = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection("syllabus_docs")

def embed_texts(texts):
    return [vec.tolist() for vec in embed_model.embed(texts)]

def build_index():
    docs = load_documents()
    chunks = chunk_documents(docs)

    texts = [c["text"] for c in chunks]
    ids = [c["id"] for c in chunks]
    metadatas = [{"source": c["source"]} for c in chunks]

    embeddings = embed_texts(texts)

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas
    )
    print(f"Indexed {len(chunks)} chunks from {len(docs)} documents.")

if __name__ == "__main__":
    build_index()