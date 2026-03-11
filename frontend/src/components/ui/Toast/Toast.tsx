import React, { useEffect } from 'react';
import styles from './Toast.module.css';
import { cn } from '../../../utils/cn';

interface ToastProps {
  title: string;
  message: string;
  tone?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ title, message, tone = 'success', onClose }) => {
  useEffect(() => {
    const timeoutId = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeoutId);
  }, [onClose]);

  return (
    <div className={cn(styles.toast, tone === 'success' ? styles.success : styles.error)} role="status" aria-live="polite">
      <p className={styles.title}>{title}</p>
      <p className={styles.message}>{message}</p>
    </div>
  );
};
