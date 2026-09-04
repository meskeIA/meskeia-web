'use client'

import Link from 'next/link'
import { URL_PRIVACIDAD, URL_TERMINOS } from '@/lib/urls-legales'
import { urlParaCompartir } from '@/lib/trackingFrom'
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
          <a href={URL_PRIVACIDAD} className={styles.link}>
            Privacidad
          </a>
          <span className={styles.dot}>•</span>
          <a href={URL_TERMINOS} className={styles.link}>
            Términos
          </a>
          <span className={styles.dot}>•</span>
          <Link href="/contacto" className={styles.link}>
            Contacto
          </Link>
          <span className={styles.dot}>•</span>
          <button
            type="button"
            onClick={() => {
              // El ?ref=share tiene que ir en el query y el #from= de quien comparte
              // no viaja con el enlace. Ver lib/trackingFrom.ts.
              const url = urlParaCompartir()
              if (navigator.share) {
                navigator.share({
                  title: 'meskeIA — Plataforma educativa gratuita',
                  text: 'Estudio, finanzas personales y herramientas prácticas. Aplicaciones gratuitas en español, sin registro.',
                  url
                })
              } else {
                navigator.clipboard.writeText(url)
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
