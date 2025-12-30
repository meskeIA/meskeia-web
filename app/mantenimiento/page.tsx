import styles from './Mantenimiento.module.css';

export default function MantenimientoPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo meskeIA */}
        <div className={styles.logoContainer}>
          <svg
            className={styles.logo}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2E86AB" />
                <stop offset="100%" stopColor="#48A9A6" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#maintenanceGradient)" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="white"
              fontSize="24"
              fontWeight="bold"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            >
              mIA
            </text>
          </svg>
        </div>

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

        {/* Contacto */}
        <div className={styles.contact}>
          <p className={styles.contactText}>¿Necesitas algo urgente?</p>
          <a href="mailto:contacto@meskeia.com" className={styles.email}>
            contacto@meskeia.com
          </a>
        </div>
      </div>

      {/* Footer mínimo */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} meskeIA</p>
      </footer>
    </div>
  );
}
