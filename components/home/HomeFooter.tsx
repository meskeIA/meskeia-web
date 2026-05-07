'use client'

import Link from 'next/link'
import styles from './HomeFooter.module.css'

export default function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Copyright y descripción */}
        <div className={styles.mainInfo}>
          <p className={styles.copyright}>© 2026 meskeIA — Plataforma educativa gratuita en español</p>
          <p className={styles.tagline}>Estudio, finanzas personales y herramientas prácticas. Sin registro y sin publicidad.</p>
        </div>

        {/* Enlaces de navegación */}
        <nav className={styles.links}>
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
          <Link href="/contacto" className={styles.link}>
            Contacto
          </Link>
          <span className={styles.dot}>•</span>
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'meskeIA — Plataforma educativa gratuita',
                  text: 'Estudio, finanzas personales y herramientas prácticas. Aplicaciones gratuitas en español, sin registro.',
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
