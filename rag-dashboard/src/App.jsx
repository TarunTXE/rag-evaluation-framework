import { useState } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = 'https://rag-eval-api-ids2.onrender.com'

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

  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [uploadOk, setUploadOk] = useState(true)

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])
    try {
      const res = await axios.post(`${API_URL}/query`, { question })
      setAnswer(res.data.answer)
      setSources(res.data.sources)
    } catch (err) {
      setError('Could not reach the API. If it has been idle, the first request can take 30–50s to wake it.')
    }
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setUploadStatus('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadOk(true)
      setUploadStatus(`Indexed ${res.data.chunks_added} chunks from ${res.data.filename}. Ready to query.`)
      setFile(null)
    } catch (err) {
      setUploadOk(false)
      setUploadStatus('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  return (
    <div className="report">
      <header>
        <h1>RAG Evaluation Framework</h1>
        <p className="subtitle">
          A retrieval-augmented question answering system with an evaluation
          layer that benchmarks retrieval and generation quality across
          pipeline configurations.
        </p>
      </header>

      <section>
        <h2>Upload a document</h2>
        <div className="field-row">
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn" onClick={handleUpload} disabled={uploading || !file}>
            {uploading ? 'Indexing…' : 'Upload'}
          </button>
        </div>
        {uploadStatus && (
          <p className={`status-line ${uploadOk ? 'ok' : 'err'}`}>{uploadStatus}</p>
        )}
      </section>

      <section>
        <h2>Ask a question</h2>
        <div className="field-row">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="What is normalization in DBMS?"
          />
          <button className="btn" onClick={handleAsk} disabled={loading}>
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </div>

        {error && <p className="status-line err">{error}</p>}

        {answer && (
          <div className="answer-block">
            <span className="kicker">Answer</span>
            <p>{answer}</p>
            <span className="kicker">Sources</span>
            <ul className="sources">
              {sources.map((s, i) => (
                <li key={i}>
                  <span className="fname">{s.source}</span> — {s.text}…
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2>Configuration benchmark</h2>
        <table>
          <thead>
            <tr>
              <th>Variant</th>
              <th>Chunk</th>
              <th>k</th>
              <th>Embedding</th>
              <th>Recall</th>
              <th>Faithful.</th>
            </tr>
          </thead>
          <tbody>
            {VARIANT_RESULTS.map((v) => (
              <tr key={v.name}>
                <td><span className="chip">{v.name}</span></td>
                <td>{v.chunkSize}</td>
                <td>{v.k}</td>
                <td>{v.embedding}</td>
                <td className={v.recall === 100 ? 'good' : 'warn'}>{v.recall}%</td>
                <td className={v.faithfulness === 100 ? 'good' : 'warn'}>{v.faithfulness}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer>
        Built by Tarun Harish E · TarunTXE
      </footer>
    </div>
  )
}

export default App