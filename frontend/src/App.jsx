import { useState } from 'react'
import Header from './components/Header'
import LeftPanel from './components/LeftPanel'
import RightPanel from './components/RightPanel'
import './App.css'

export default function App() {
  const [contractText, setContractText] = useState('')
  const [results, setResults] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [error, setError] = useState('')

  const analyze = async (text) => {
    if (!text || text.trim().length < 100) {
      setError('Please provide more contract text (at least 100 characters).')
      return
    }
    setStatus('loading')
    setError('')
    setResults(null)

    try {
      const res = await fetch('/api/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResults(data)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const analyzePdf = async (file) => {
    setStatus('loading')
    setError('')
    setResults(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/analyze/pdf', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResults(data)
      setStatus('done')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="app-layout">
        <LeftPanel
          contractText={contractText}
          setContractText={setContractText}
          onAnalyzeText={() => analyze(contractText)}
          onAnalyzePdf={analyzePdf}
          loading={status === 'loading'}
        />
        <RightPanel
          status={status}
          results={results}
          error={error}
        />
      </div>
    </div>
  )
}
