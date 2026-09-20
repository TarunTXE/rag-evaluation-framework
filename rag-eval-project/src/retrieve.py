from embed_store import embed_model, collection, embed_texts

def retrieve(query, k=3):
    query_embedding = embed_texts([query])
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=k
    )
    chunks = results["documents"][0]
    sources = [m["source"] for m in results["metadatas"][0]]
    return list(zip(chunks, sources))

if __name__ == "__main__":
    results = retrieve("What is normalization in DBMS?")
    for text, source in results:
        print(f"[{source}] {text[:150]}...\n")