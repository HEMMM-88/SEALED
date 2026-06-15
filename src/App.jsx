import React, { useState, useCallback } from 'react'

import HomePage from './pages/HomePage.jsx'
import Navbar from './components/Navbar.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  const [vaultOpen, setVaultOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3200)
  }, [])

  const handleVaultClick = useCallback(() => {
    if (!vaultOpen) setVaultOpen(true)
  }, [vaultOpen])

  const handleVaultOpened = useCallback(() => {
    setPanelOpen(true)
  }, [])

  const handleBackToVault = useCallback(() => {
    setPanelOpen(false)
    setVaultOpen(false)
  }, [])

  return (
    <>
      <div className="grain-overlay" />
      <div className="paper-vignette" />

      <Navbar page={vaultOpen ? 'inbox' : 'home'} onLogoClick={handleBackToVault} />

      <HomePage
        vaultOpen={vaultOpen}
        panelOpen={panelOpen}
        onVaultClick={handleVaultClick}
        onVaultOpened={handleVaultOpened}
        onBack={handleBackToVault}
        showToast={showToast}
      />

      {toast && <Toast message={toast} />}
    </>
  )
}
