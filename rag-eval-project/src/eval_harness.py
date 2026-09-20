import json
import os
from retrieve import retrieve
from generate import answer_question

def load_eval_set():
    eval_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "eval", "eval_set.json")
    with open(eval_path) as f:
        return json.load(f)

def evaluate_retrieval(eval_set, k=3):
    correct = 0
    for item in eval_set:
        results = retrieve(item["question"], k)
        sources = [s for _, s in results]
        if item["expected_source"] in sources:
            correct += 1
    recall_at_k = correct / len(eval_set)
    return recall_at_k

def evaluate_faithfulness(eval_set):
    scores = []
    for item in eval_set:
        answer, _ = answer_question(item["question"])
        hits = sum(1 for kw in item["expected_keywords"] if kw.lower() in answer.lower())
        score = hits / len(item["expected_keywords"])
        scores.append(score)
    return sum(scores) / len(scores)

if __name__ == "__main__":
    eval_set = load_eval_set()
    recall = evaluate_retrieval(eval_set)
    faithfulness = evaluate_faithfulness(eval_set)
    print(f"Retrieval Recall@3: {recall:.2%}")
    print(f"Faithfulness (keyword overlap): {faithfulness:.2%}")