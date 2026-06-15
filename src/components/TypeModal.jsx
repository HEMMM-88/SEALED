import React from 'react';
import styles from './TypeModal.module.css';

const TYPES = [
  { id:'love',         icon:'💌', name:'Love Letter',   desc:'Pour your heart onto parchment',      anim:'Scroll Unfurling' },
  { id:'professional', icon:'📋', name:'Professional',  desc:'Crisp, formal correspondence',         anim:'Envelope Rise'    },
  { id:'leave',        icon:'🗒️', name:'Leave Letter',  desc:'Request time away with grace',         anim:'Notepad Flip'     },
  { id:'gratitude',    icon:'🌸', name:'Thank You',     desc:'Express heartfelt gratitude',          anim:'Scroll Unfurling' },
  { id:'apology',      icon:'🕊️', name:'Apology',       desc:'Mend what words have broken',         anim:'Envelope Rise'    },
  { id:'invitation',   icon:'🎩', name:'Invitation',    desc:'Summon guests with elegance',          anim:'Scroll Unfurling' },
];

export default function TypeModal({ open, onClose, onSelect }) {
  return (
    <div className={`${styles.overlay} ${open ? styles.visible : ''}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.inner}>
        <div className={styles.topLine} />
        <h2 className={styles.title}>Choose Your Letter</h2>
        <p className={styles.sub}>Each letter has its own ceremony of opening</p>

        <div className={styles.grid}>
          {TYPES.map(t => (
            <div key={t.id} className={styles.card} onClick={() => onSelect(t.id)}>
              <div className={styles.cardIcon}>{t.icon}</div>
              <div className={styles.cardName}>{t.name}</div>
              <div className={styles.cardDesc}>{t.desc}</div>
              <div className={styles.cardAnim}>{t.anim}</div>
            </div>
          ))}
        </div>

        <button className={styles.closeBtn} onClick={onClose}>— Cancel —</button>
      </div>
    </div>
  );
}
