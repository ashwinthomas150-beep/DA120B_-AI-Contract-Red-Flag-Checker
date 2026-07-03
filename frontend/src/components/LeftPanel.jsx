import { useRef, useState } from 'react'
import './LeftPanel.css'

export default function LeftPanel({ contractText, setContractText, onAnalyzeText, onAnalyzePdf, loading }) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    if (file.name.endsWith('.pdf')) {
      setFileName(file.name)
      setContractText('')
      onAnalyzePdf(file)
    } else if (file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setContractText(e.target.result)
        setFileName(file.name)
      }
      reader.readAsText(file)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const canAnalyze = (contractText.trim().length >= 100 || fileName) && !loading

  return (
    <aside className="left-panel">
      <div className="lp-section">
        <div className="lp-label">Upload Contract</div>
        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''} ${fileName ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {fileName ? (
            <>
              <div className="uz-icon loaded">✅</div>
              <div className="uz-filename">{fileName}</div>
              <p className="uz-sub">Click to change file</p>
            </>
          ) : (
            <>
              <div className="uz-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                </svg>
              </div>
              <div className="uz-title">Drop PDF or TXT here</div>
              <p className="uz-sub">or click to browse</p>
            </>
          )}
        </div>
      </div>

      <div className="lp-divider">
        <span>or paste text</span>
      </div>

      <div className="lp-section" style={{ flex: 1 }}>
        <div className="lp-label">
          Contract Text
          <span className="char-count">{contractText.length.toLocaleString()} chars</span>
        </div>
        <textarea
          className="contract-textarea"
          value={contractText}
          onChange={(e) => { setContractText(e.target.value); setFileName('') }}
          placeholder={"Paste your contract text here...\n\nEmployment agreements, NDAs, rental contracts, freelance agreements — anything works."}
        />
      </div>

      <button
        className={`analyze-btn ${loading ? 'loading' : ''}`}
        onClick={onAnalyzeText}
        disabled={!canAnalyze}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Analyzing...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/>
            </svg>
            Analyze Contract
          </>
        )}
      </button>
    </aside>
  )
}
