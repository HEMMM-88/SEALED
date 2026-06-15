import React from 'react'
import ComposeOverlay from '../components/ComposeOverlay'

export default function ComposePage({
  letterType,
  onBack,
  onSend
}) {
  return (
    <ComposeOverlay
      letterType={letterType}
      onBack={onBack}
      onSend={onSend}
    />
  )
}