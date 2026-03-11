import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ui from '../../styles/ui.module.css';
import styles from './Unauthorized.module.css';

export const UnauthorizedPage: React.FC = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bu sayfaya erisimin yok</h1>
        <p className={styles.copy}>
          Girmeye calistigin alan sadece admin kullanicilar icin acik. Agency roluyle rota arama ekranini kullanabilirsin.
        </p>
        {from && <p className={styles.path}>Engellenen adres: {from}</p>}
        <div className={styles.actions}>
          <Link to="/routes" className={`${ui.primaryButton} ${styles.linkButton}`}>
            Routes'a don
          </Link>
          <Link to="/login" className={`${styles.linkButton} ${styles.secondary}`}>
            Hesap degistir
          </Link>
        </div>
      </div>
    </div>
  );
};
