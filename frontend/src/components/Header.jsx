import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-mark">🚩</div>
        <span className="logo-name">FlagAI</span>
        <span className="logo-tag">Contract Risk Checker</span>
      </div>
      <a href="/" className="header-home">← Back to home</a>
    </header>
  )
}
