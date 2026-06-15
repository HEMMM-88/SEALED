import React, { useState } from 'react';
import styles from './InboxPanel.module.css';

const LETTERS = {
  received: [
    { id:1, icon:'💌', from:'Eleanor Whitmore',    preview:'My dearest, I write to you under the candlelight of a November eve…', time:'Nov 12', unread:true  },
    { id:2, icon:'📋', from:'Harrington & Co. Ltd.',preview:'We are pleased to confirm your appointment to the position of…',     time:'Nov 10', unread:true  },
    { id:3, icon:'📜', from:'Dr. James Pemberton', preview:'Your leave of absence has been duly noted and approved for the…',      time:'Nov 08', unread:true  },
    { id:4, icon:'✉️', from:'Mother',              preview:'The garden is blooming wonderfully this season. Your father and I…',   time:'Oct 29', unread:false },
  ],
  sent: [
    { id:5, icon:'📤', from:'To: Prof. Wellington',     preview:'Dear Professor, I write with humble sincerity regarding my…', time:'Nov 11', unread:false },
    { id:6, icon:'📤', from:'To: City Council Office',  preview:'On behalf of the residents of Elm Street, we formally petition…', time:'Nov 05', unread:false },
  ],
  drafts: [
    { id:7, icon:'📝', from:'Draft — Love Letter', preview:'I have begun this letter seventeen times and still cannot find the words…', time:'Draft', unread:false },
  ],
};

const TABS = ['received', 'sent', 'drafts'];
const BADGE = { received: 3, drafts: 1 };

export default function InboxPanel({ open, onCompose, onBack, showToast }) {
  const [activeTab, setActiveTab] = useState('received');

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className={`${styles.wrap} ${open ? styles.visible : ''}`}>
      <div className={styles.card}>
        <div className={styles.topLine} />
        <div className={styles.waxSeal}>✦</div>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.brand}>Sealed Correspondence</span>
          <span className={styles.date}>{today}</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {BADGE[tab] && <span className={styles.badge}>{BADGE[tab]}</span>}
            </button>
          ))}
        </div>

        {/* Letter list */}
        <div className={styles.list}>
          {LETTERS[activeTab].map(letter => (
            <div
              key={letter.id}
              className={`${styles.item} ${letter.unread ? styles.unread : ''}`}
              onClick={() => showToast(`Opening letter from ${letter.from}…`)}
            >
              <div className={styles.icon}>{letter.icon}</div>
              <div className={styles.meta}>
                <div className={styles.from}>{letter.from}</div>
                <div className={styles.preview}>{letter.preview}</div>
              </div>
              <div className={styles.time}>{letter.time}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={onBack}>← Return to Vault</button>
          <button className={styles.composeBtn} onClick={onCompose}>✦ &nbsp;Compose New Letter</button>
        </div>
      </div>
    </div>
  );
}
