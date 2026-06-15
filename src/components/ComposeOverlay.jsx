import React, { useState } from 'react';
import styles from './ComposeOverlay.module.css';

const TEMPLATES = {
  love:         { anim:'scroll',   header:'💌  Love Letter',      placeholder:'My dearest,\n\nI find myself reaching for words that have long eluded me…' },
  professional: { anim:'envelope', header:'📋  Professional Letter', placeholder:'Dear Sir/Madam,\n\nI write to you with the utmost respect and sincerity…' },
  leave:        { anim:'notepad',  header:'🗒️  Leave Application', placeholder:"Dear [Manager's Name],\n\nI respectfully request leave of absence for the period of…" },
  gratitude:    { anim:'scroll',   header:'🌸  Thank You Letter',  placeholder:'Dear [Name],\n\nWords seem insufficient to express the gratitude I feel…' },
  apology:      { anim:'envelope', header:'🕊️  Letter of Apology', placeholder:'Dear [Name],\n\nI write this letter with a heavy heart and a sincere desire to make amends…' },
  invitation:   { anim:'scroll',   header:'🎩  Formal Invitation', placeholder:'Dear [Name],\n\nIt is with great pleasure that I cordially invite you to…' },
};

function ScrollCompose({ cfg, recipient, onRecipient, body, onBody, onDiscard, onSend }) {
  return (
    <div className={styles.scrollContainer}>
      <div className={styles.scrollRoll}>
        <span className={styles.rollLabel}>{cfg.header}</span>
      </div>
      <div className={styles.scrollBody}>
        <div className={styles.toLine}>
          <span className={styles.toLabel}>To:</span>
          <input className={styles.toInput} value={recipient}
            onChange={e => onRecipient(e.target.value)} placeholder="Recipient's name…" />
        </div>
        <textarea className={styles.scrollTextarea} value={body}
          onChange={e => onBody(e.target.value)} placeholder={cfg.placeholder} />
        <div className={styles.actions}>
          <button className={styles.btnDiscard} onClick={onDiscard}>Discard</button>
          <button className={styles.btnSend} onClick={onSend}>Seal &amp; Send ✦</button>
        </div>
      </div>
      <div className={`${styles.scrollRoll} ${styles.scrollRollBottom}`} />
    </div>
  );
}

function EnvelopeCompose({ cfg, recipient, onRecipient, body, onBody, onDiscard, onSend }) {
  return (
    <div className={styles.envelopeContainer}>
      <div className={styles.envelopeOuter}>
        <div className={styles.envelopeBody}>
          <div className={styles.letterPaper}>
            <div className={styles.composeHeader}>{cfg.header}</div>
            <div className={styles.toLine}>
              <span className={styles.toLabel}>To:</span>
              <input className={styles.toInput} value={recipient}
                onChange={e => onRecipient(e.target.value)} placeholder="Recipient's name…" />
            </div>
            <textarea className={styles.envelopeTextarea} value={body}
              onChange={e => onBody(e.target.value)} placeholder={cfg.placeholder} />
            <div className={styles.actions}>
              <button className={styles.btnDiscard} onClick={onDiscard}>Discard</button>
              <button className={styles.btnSend} onClick={onSend}>Seal &amp; Send ✦</button>
            </div>
          </div>
        </div>
        <div className={styles.envelopeFlap} />
      </div>
    </div>
  );
}

function NotepadCompose({ cfg, recipient, onRecipient, body, onBody, onDiscard, onSend }) {
  return (
    <div className={styles.notepadContainer}>
      <div className={styles.notepadRings}>
        {Array.from({ length: 8 }, (_, i) => <div key={i} className={styles.ring} />)}
      </div>
      <div className={styles.notepadBody}>
        <div className={styles.composeHeader}>{cfg.header}</div>
        <div className={styles.toLine}>
          <span className={styles.toLabel}>To:</span>
          <input className={styles.toInput} value={recipient}
            onChange={e => onRecipient(e.target.value)} placeholder="Manager's name…" />
        </div>
        <textarea className={styles.notepadTextarea} value={body}
          onChange={e => onBody(e.target.value)} placeholder={cfg.placeholder} />
        <div className={styles.actions}>
          <button className={styles.btnDiscard} onClick={onDiscard}>Discard</button>
          <button className={styles.btnSend} onClick={onSend}>Submit &amp; Send ✦</button>
        </div>
      </div>
    </div>
  );
}

export default function ComposeOverlay({ letterType, onBack, onSend }) {
  const type = letterType;
  const [recipient, setRecipient] = useState('');
  const [body, setBody]           = useState('');

  if (!type) return null;
  const cfg = TEMPLATES[type];

  const handleSend = () => { setRecipient(''); setBody(''); onSend(); };
  const handleClose = () => { setRecipient(''); setBody(''); onBack(); };

  const props = { cfg, recipient, onRecipient: setRecipient, body, onBody: setBody, onDiscard: handleClose, onSend: handleSend };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      {cfg.anim === 'scroll'   && <ScrollCompose   {...props} />}
      {cfg.anim === 'envelope' && <EnvelopeCompose {...props} />}
      {cfg.anim === 'notepad'  && <NotepadCompose  {...props} />}
    </div>
  );
}
