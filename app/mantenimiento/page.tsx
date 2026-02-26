import { LegalNotice } from '@/components';
import styles from './Mantenimiento.module.css';

export default function MantenimientoPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Icono de mantenimiento */}
        <div className={styles.iconContainer}>
          <span className={styles.icon}>🔧</span>
        </div>

        {/* Mensaje principal */}
        <h1 className={styles.title}>meskeIA está en mantenimiento</h1>
        <p className={styles.subtitle}>Estamos mejorando para ti</p>
        <p className={styles.message}>Volvemos pronto</p>

        {/* Separador */}
        <div className={styles.divider}></div>

      </div>

      {/* Footer mínimo */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} meskeIA</p>
      </footer>
    </div>
  );
}
