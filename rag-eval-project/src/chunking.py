def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

def chunk_documents(docs, chunk_size=500, overlap=50):
    all_chunks = []
    for doc in docs:
        pieces = chunk_text(doc["text"], chunk_size, overlap)
        for i, piece in enumerate(pieces):
            all_chunks.append({
                "id": f"{doc['filename']}_{i}",
                "text": piece,
                "source": doc["filename"]
            })
    return all_chunks