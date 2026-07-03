import { useState } from 'react'
import FlagCard from './FlagCard'
import './RightPanel.css'

const RISK_META = {
  HIGH:   { emoji: '🚨', label: 'High Risk — Immediate Review Needed',   color: 'red' },
  MEDIUM: { emoji: '⚠️',  label: 'Medium Risk — Clauses Need Attention',  color: 'orange' },
  LOW:    { emoji: '📋', label: 'Low Risk — Minor Issues Found',          color: 'yellow' },
  SAFE:   { emoji: '✅', label: 'No Major Issues Detected',               color: 'green' },
}

function exportReport(results) {
  const flags = results.flags || []
  let r = `FLAGAI — CONTRACT RISK REPORT\n${'='.repeat(50)}\n\n`
  r += `CONTRACT TYPE: ${results.contract_type || 'Unknown'}\n`
  r += `OVERALL RISK:  ${results.overall_risk}\n\n`
  r += `SUMMARY:\n${results.overall_summary}\n\n`
  r += `${'='.repeat(50)}\nFLAGGED CLAUSES (${flags.length})\n\n`
  flags.forEach((f, i) => {
    r += `[${f.risk_level}] ${i + 1}. ${f.title}\n`
    if (f.clause_excerpt) r += `   Clause: "${f.clause_excerpt}"\n`
    r += `   Issue: ${f.explanation}\n`
    if (f.recommendation) r += `   Recommendation: ${f.recommendation}\n`
    r += '\n'
  })
  const blob = new Blob([r], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'flagAI-risk-report.txt'
  a.click()
}

export default function RightPanel({ status, results, error }) {
  const [filter, setFilter] = useState('ALL')

  if (status === 'idle') {
    return (
      <main className="right-panel">
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
          </div>
          <h2>No Contract Analyzed Yet</h2>
          <p>Upload a PDF or paste your contract text on the left, then click <strong>Analyze Contract</strong> to detect risky clauses instantly.</p>
        </div>
      </main>
    )
  }

  if (status === 'loading') {
    return (
      <main className="right-panel">
        <div className="scanning-state">
          <div className="scan-visual">
            <div className="scan-beam" />
            {[100, 70, 90, 60, 85, 75].map((w, i) => (
              <div key={i} className="scan-line" style={{ width: `${w}%`, animationDelay: `${i * 0.18}s` }} />
            ))}
          </div>
          <h3>Analyzing Contract...</h3>
          <p>AI is reading every clause and identifying red flags</p>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="right-panel">
        <div className="error-box">
          <strong>Analysis failed:</strong> {error}
        </div>
      </main>
    )
  }

  // Results
  const flags = results?.flags || []
  const high = flags.filter(f => f.risk_level === 'HIGH').length
  const medium = flags.filter(f => f.risk_level === 'MEDIUM').length
  const low = flags.filter(f => f.risk_level === 'LOW').length
  const meta = RISK_META[results.overall_risk] || RISK_META.LOW

  const filtered = filter === 'ALL' ? flags : flags.filter(f => f.risk_level === filter)

  return (
    <main className="right-panel results">
      {/* Header */}
      <div className="results-header">
        <div>
          <h2>Risk Analysis</h2>
          <p>{flags.length} clause{flags.length !== 1 ? 's' : ''} flagged · {results.contract_type || 'Contract'}</p>
        </div>
        <button className="export-btn" onClick={() => exportReport(results)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
          </svg>
          Export Report
        </button>
      </div>

      {/* Scores */}
      <div className="score-grid">
        {[
          { num: high,   label: 'High Risk',   cls: 'red' },
          { num: medium, label: 'Medium Risk',  cls: 'orange' },
          { num: low,    label: 'Low Risk',     cls: 'yellow' },
          { num: results.overall_risk, label: 'Overall', cls: 'text' },
        ].map((s, i) => (
          <div key={i} className={`score-card ${s.cls}`}>
            <div className="score-num">{s.num}</div>
            <div className="score-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Banner */}
      <div className={`risk-banner ${meta.color}`}>
        <span className="banner-emoji">{meta.emoji}</span>
        <div>
          <strong>{meta.label}</strong>
          <p>{results.overall_summary}</p>
        </div>
      </div>

      {/* Filters */}
      {flags.length > 0 && (
        <div className="filter-bar">
          {[
            { key: 'ALL',    label: `All (${flags.length})`,  cls: '' },
            high   > 0 && { key: 'HIGH',   label: `🔴 High (${high})`,   cls: 'high' },
            medium > 0 && { key: 'MEDIUM', label: `🟠 Med (${medium})`, cls: 'medium' },
            low    > 0 && { key: 'LOW',    label: `🟡 Low (${low})`,   cls: 'low' },
          ].filter(Boolean).map(chip => (
            <button
              key={chip.key}
              className={`filter-chip ${chip.cls} ${filter === chip.key ? 'active' : ''}`}
              onClick={() => setFilter(chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Flags */}
      <div className="flags-section">
        <div className="flags-title">🚩 Flagged Clauses</div>
        {filtered.length === 0
          ? <p className="no-flags">No {filter.toLowerCase()} risk flags found.</p>
          : filtered.map((flag, i) => <FlagCard key={flag.id || i} flag={flag} defaultOpen={i === 0 && flag.risk_level === 'HIGH'} />)
        }
      </div>

      {/* Summary */}
      <div className="summary-card">
        <h3>📋 Full Summary</h3>
        <p>{results.overall_summary}</p>
      </div>
    </main>
  )
}
