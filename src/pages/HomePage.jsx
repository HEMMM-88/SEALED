import React, { useState } from 'react'
import VaultScene from '../components/VaultScene'
import HeroOverlay from '../components/HeroOverlay'
import InboxPanel from '../components/InboxPanel'
import ComposeOverlay from '../components/ComposeOverlay'
import TypeModal from '../components/TypeModal'

export default function HomePage({
  vaultOpen, panelOpen,
  onVaultClick, onVaultOpened, onBack, showToast
}) {
  const phase = !vaultOpen ? 'idle' : panelOpen ? 'inbox' : 'opening'

  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [letterType, setLetterType] = useState(null)
  const [composing, setComposing] = useState(false)

  const handleCompose = () => setTypeModalOpen(true)
  const handleSelectType = (type) => {
    setTypeModalOpen(false)
    setLetterType(type)
    setComposing(true)
  }
  const handleSend = () => {
    setComposing(false)
    setLetterType(null)
    showToast('Letter sealed and dispatched with care ✦')
  }
  const handleDiscardCompose = () => {
    setComposing(false)
    setLetterType(null)
  }

  return (
    <>
      <VaultScene
        phase={phase}
        onCanvasClick={onVaultClick}
        onVaultOpened={onVaultOpened}
      />

      <HeroOverlay visible={!vaultOpen} />

      <InboxPanel
        open={panelOpen && !composing}
        onCompose={handleCompose}
        onBack={onBack}
        showToast={showToast}
      />

      <TypeModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
        onSelect={handleSelectType}
      />

      {composing && (
        <ComposeOverlay
          letterType={letterType}
          onBack={handleDiscardCompose}
          onSend={handleSend}
        />
      )}
    </>
  )
}
