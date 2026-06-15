import React from 'react';
import styles from './HeroOverlay.module.css';

export default function HeroOverlay({ visible }) {
  return (
    <div className={`${styles.layout} ${visible ? '' : styles.hidden}`}>
      <div className={styles.copy}>

        <div className={styles.eyebrow}>
          <span className={styles.rule} />
          Est. 2024 · The Art of the Written Word
          <span className={styles.rule} />
        </div>

        <h1 className={styles.title}>
          Your Letters,
          <em className={styles.titleEm}>Sealed in Time</em>
        </h1>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerDiamond}>◆</span>
          <span className={styles.dividerLine} />
        </div>

        <p className={styles.sub}>
          Write letters that endure. Every word you seal<br />
          is protected, preserved, and delivered with care.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✦</span>
            <span>Time-locked delivery</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✦</span>
            <span>Beautifully crafted templates</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✦</span>
            <span>End-to-end encrypted</span>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.hint}>
            <span className={styles.hintDot} />
            Click the vault to begin
          </div>
          <button className={styles.ctaButton} aria-label="Open the vault">
            Open the Vault
            <span className={styles.ctaArrow}>→</span>
          </button>
        </div>

        <div className={styles.trust}>
          <span className={styles.trustItem}>256-bit encrypted</span>
          <span className={styles.trustSep}>·</span>
          <span className={styles.trustItem}>No account required</span>
          <span className={styles.trustSep}>·</span>
          <span className={styles.trustItem}>Forever free</span>
        </div>

      </div>
    </div>
  );
}
