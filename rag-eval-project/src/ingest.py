from pypdf import PdfReader
import os

def load_documents(folder="data/raw"):
    docs = []
    for filename in os.listdir(folder):
        if filename.endswith(".pdf"):
            path = os.path.join(folder, filename)
            reader = PdfReader(path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            docs.append({"filename": filename, "text": text})
    return docs

if __name__ == "__main__":
    docs = load_documents()
    for d in docs:
        print(d["filename"], "-", len(d["text"]), "characters")