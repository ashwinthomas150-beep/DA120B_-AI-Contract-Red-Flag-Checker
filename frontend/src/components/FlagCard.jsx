import { useState } from 'react'
import './FlagCard.css'

export default function FlagCard({ flag, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`flag-card ${open ? 'open' : ''} ${flag.risk_level.toLowerCase()}`}>
      <button className="flag-header" onClick={() => setOpen(!open)}>
        <span className={`risk-badge ${flag.risk_level.toLowerCase()}`}>{flag.risk_level}</span>
        {flag.category && <span className="flag-category">{flag.category}</span>}
        <span className="flag-title">{flag.title}</span>
        <svg className="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
      </button>

      {open && (
        <div className="flag-body">
          {flag.clause_excerpt && (
            <blockquote className="flag-clause">"{flag.clause_excerpt}"</blockquote>
          )}
          <p className="flag-explanation">{flag.explanation}</p>
          {flag.recommendation && (
            <div className="flag-rec">
              <span className="rec-icon">💡</span>
              <span>{flag.recommendation}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
