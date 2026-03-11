import React from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => (
  <>
    <div className={styles.backdrop} onClick={onCancel} />
    <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <h2 id="confirm-dialog-title" className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>{cancelLabel}</button>
        <button type="button" className={styles.dangerButton} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </>
);
