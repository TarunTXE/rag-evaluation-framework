import os
from dotenv import load_dotenv
from groq import Groq
from retrieve import retrieve

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def answer_question(query, k=3):
    results = retrieve(query, k)
    context = "\n\n".join([f"[Source: {src}]\n{text}" for text, src in results])

    prompt = f"""Answer the question using ONLY the context below.
If the answer isn't in the context, say "I don't have that information in the syllabus."

Context:
{context}

Question: {query}

Answer:"""

    response = client.chat.completions.create(
          model="openai/gpt-oss-20b",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content, results

if __name__ == "__main__":
    answer, sources = answer_question("What is normalization in DBMS?")
    print("ANSWER:", answer)