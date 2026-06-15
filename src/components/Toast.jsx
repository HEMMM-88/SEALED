import React from 'react';
import styles from './Toast.module.css';

export default function Toast({ message }) {
  return (
    <div className={styles.toast}>
      <span className={styles.icon}>✦</span>
      {message}
    </div>
  );
}
