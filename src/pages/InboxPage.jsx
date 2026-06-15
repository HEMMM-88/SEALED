import React, { useState } from 'react'
import InboxPanel from '../components/InboxPanel'
import TypeModal from '../components/TypeModal'

export default function InboxPage({ onCompose, onBack, showToast }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <InboxPanel
        onCompose={() => setModalOpen(true)}
        onBack={onBack}
        showToast={showToast}
      />
      <TypeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(type) => { setModalOpen(false); onCompose(type) }}
      />
    </>
  )
}
