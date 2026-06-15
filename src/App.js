import React, { useState, useCallback } from 'react';
import Navbar        from './components/Navbar';
import VaultScene    from './components/VaultScene';
import HeroOverlay   from './components/HeroOverlay';
import InboxPanel    from './components/InboxPanel';
import TypeModal     from './components/TypeModal';
import ComposeOverlay from './components/ComposeOverlay';
import Navbar from './components/Navbar.js'
import Toast from './components/Toast.js'
import Particles     from './components/Particles';

// App-level state: idle → opening → inbox
export default function App() {
  const [phase, setPhase]             = useState('idle');   // 'idle' | 'opening' | 'inbox'
  const [typeModalOpen, setTypeModal] = useState(false);
  const [composeType, setComposeType] = useState(null);
  const [toast, setToast]             = useState(null);
  const [particles, setParticles]     = useState([]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  const spawnParticles = useCallback(() => {
    const batch = Array.from({ length: 22 }, (_, i) => ({
      id: Date.now() + i,
      left:     30 + Math.random() * 40,
      bottom:   15 + Math.random() * 30,
      size:     2  + Math.random() * 3,
      duration: 1.2 + Math.random() * 1.5,
      delay:    i * 0.055,
      hue:      34 + Math.random() * 18,
      light:    52 + Math.random() * 22,
    }));
    setParticles(batch);
    setTimeout(() => setParticles([]), 3000);
  }, []);

  const handleCanvasClick = useCallback(() => {
    if (phase === 'idle') setPhase('opening');
  }, [phase]);

  const handleVaultOpened = useCallback(() => {
    setPhase('inbox');
  }, []);

  const handleCloseInbox = useCallback(() => {
    setPhase('idle');
  }, []);

  const handleCompose = useCallback((type) => {
    setTypeModal(false);
    setComposeType(type);
  }, []);

  const handleSend = useCallback(() => {
    setComposeType(null);
    showToast('Letter sealed and dispatched with care ✦');
    spawnParticles();
  }, [showToast, spawnParticles]);

  return (
    <div style={{ width:'100%', height:'100%', position:'relative' }}>
      {/* 3-D vault canvas — always mounted */}
      <VaultScene
        phase={phase}
        onCanvasClick={handleCanvasClick}
        onVaultOpened={handleVaultOpened}
      />

      <GrainVignette />

      <Navbar />

      {/* Hero copy — visible only in idle */}
      <HeroOverlay visible={phase === 'idle'} />

      {/* Inbox card */}
      <InboxPanel
        visible={phase === 'inbox'}
        onClose={handleCloseInbox}
        onCompose={() => setTypeModal(true)}
        onOpenLetter={(msg) => showToast(msg)}
      />

      {/* Letter type picker */}
      <TypeModal
        open={typeModalOpen}
        onClose={() => setTypeModal(false)}
        onSelect={handleCompose}
      />

      {/* Compose overlay */}
      <ComposeOverlay
        type={composeType}
        onClose={() => setComposeType(null)}
        onSend={handleSend}
      />

      {/* DOM particles */}
      <Particles items={particles} />

      {/* Toast notification */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
