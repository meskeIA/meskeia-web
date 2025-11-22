import MeskeiaLogo from '@/components/MeskeiaLogo';
import styles from './loading.module.css';

export default function GlobalLoading() {
  return (
    <>
      <MeskeiaLogo />

      <div className={styles.loadingContainer}>
        {/* Spinner animado */}
        <div className={styles.spinner} aria-label="Cargando aplicación">
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerCore}></div>
        </div>

        {/* Texto de carga */}
        <p className={styles.loadingText}>
          Cargando aplicación...
        </p>

        {/* Mensaje secundario */}
        <p className={styles.loadingSubtext}>
          Preparando tu experiencia meskeIA
        </p>
      </div>
    </>
  );
}
