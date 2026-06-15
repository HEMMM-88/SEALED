import React from 'react'
import './Navbar.css'

const NAV_LINKS = [
  { label: 'How It Works', href: '#' },
  { label: 'Templates', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'About', href: '#' },
]

export default function Navbar({ page, onLogoClick }) {
  return (
    <nav className="navbar">
      <button className="nav-logo" onClick={onLogoClick}>
        <span className="nav-logo-main">SEALED</span>
        <span className="nav-logo-dot"> · </span>
      </button>
      <div className="nav-links">
        {NAV_LINKS.map(link => (
          <a key={link.label} href={link.href} className="nav-link">
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
