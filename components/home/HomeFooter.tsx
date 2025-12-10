'use client'

import Link from 'next/link'
import styles from './HomeFooter.module.css'

export default function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Copyright y descripción */}
        <div className={styles.mainInfo}>
          <p className={styles.copyright}>© 2025 meskeIA - Biblioteca de Aplicaciones Web Gratuitas</p>
          <p className={styles.tagline}>Aplicaciones desarrolladas para simplificar tu día a día</p>
        </div>

        {/* Ubicación y contacto */}
        <div className={styles.contact}>
          <span>📍 Mataró (Barcelona), España</span>
          <span className={styles.separator}>|</span>
          <a href="mailto:meskeia24@gmail.com" className={styles.email}>
            ✉️ meskeia24@gmail.com
          </a>
        </div>

        {/* Enlaces de navegación */}
        <nav className={styles.links}>
          <Link href="/apps" className={styles.link}>
            Apps
          </Link>
          <span className={styles.dot}>•</span>
          <Link href="/acerca" className={styles.link}>
            Acerca de
          </Link>
          <span className={styles.dot}>•</span>
          <Link href="/privacidad" className={styles.link}>
            Privacidad
          </Link>
          <span className={styles.dot}>•</span>
          <Link href="/terminos" className={styles.link}>
            Términos
          </Link>
          <span className={styles.dot}>•</span>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'meskeIA - Biblioteca de Aplicaciones Web',
                  text: 'Descubre 84 aplicaciones web gratuitas en español',
                  url: window.location.href
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
                alert('✅ Enlace copiado al portapapeles')
              }
            }}
            className={styles.shareButton}
          >
            🔗 Compartir meskeIA
          </button>
        </nav>
      </div>
    </footer>
  )
}
