import { useState } from 'react'
import axios from 'axios'
import './App.css'

const VARIANT_RESULTS = [
  { name: 'Baseline', chunkSize: 500, k: 3, embedding: 'MiniLM (384d)', recall: 100, faithfulness: 100 },
  { name: 'A — Smaller chunks', chunkSize: 100, k: 3, embedding: 'MiniLM (384d)', recall: 100, faithfulness: 100 },
  { name: 'B — Larger k', chunkSize: 500, k: 5, embedding: 'MiniLM (384d)', recall: 100, faithfulness: 100 },
  { name: 'C — Weaker embeddings', chunkSize: 500, k: 3, embedding: 'Albert-small (768d)', recall: 83.33, faithfulness: 100 },
]

function App() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])
    try {
      const res = await axios.post('https://rag-eval-api-ids2.onrender.com/query', { question })
      setAnswer(res.data.answer)
      setSources(res.data.sources)
    } catch (err) {
      setError('Failed to reach the backend. Is the FastAPI server running?')
    }
    setLoading(false)
  }

  return (
    <div className="dashboard">
      <h1>RAG Evaluation Dashboard</h1>
      <p className="subtitle">Syllabus-grounded QA with retrieval configuration benchmarking</p>

      <div className="card">
        <h2>Ask a Question</h2>
        <div className="query-row">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="e.g. What is normalization in DBMS?"
          />
          <button onClick={handleAsk} disabled={loading}>
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {answer && (
          <div className="result-box">
            <span className="label">Answer</span>
            <p>{answer}</p>
            <span className="label">Sources</span>
            <ul className="sources-list">
              {sources.map((s, i) => (
                <li key={i}>
                  <strong>{s.source}</strong> — {s.text}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Variant Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Chunk Size</th>
              <th>k</th>
              <th>Embedding Model</th>
              <th>Recall</th>
              <th>Faithfulness</th>
            </tr>
          </thead>
          <tbody>
            {VARIANT_RESULTS.map((v) => (
              <tr key={v.name}>
                <td>{v.name}</td>
                <td>{v.chunkSize}</td>
                <td>{v.k}</td>
                <td>{v.embedding}</td>
                <td className={v.recall === 100 ? 'recall-good' : 'recall-warn'}>{v.recall}%</td>
                <td className={v.faithfulness === 100 ? 'recall-good' : 'recall-warn'}>{v.faithfulness}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App