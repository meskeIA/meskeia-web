/**
 * Componente Footer meskeIA
 *
 * Footer unificado con glassmorphism (formato oficial nov 2025)
 * Incluye botón de compartir integrado
 * Incluye AnalyticsTracker v3.0 para registro de uso (Turso)
 */

'use client';

import React, { useState } from 'react';
import styles from './Footer.module.css';
import AnalyticsTracker from './AnalyticsTracker';
import CoquinumMasDeCategoria from './CoquinumMasDeCategoria';
import { VERTICALES } from '@/data/verticales';
import { TOTAL_IMPLEMENTED_APPS } from '@/data/implemented-apps';

interface FooterProps {
  appName?: string; // Nombre de la app para compartir (opcional)
}

export default function Footer({ appName }: FooterProps) {
  const [showMessage, setShowMessage] = useState(false);

  const compartirApp = async () => {
    const titulo = appName || document.title;
    const baseUrl = window.location.href;
    const url = baseUrl.includes('?') ? `${baseUrl}&ref=share` : `${baseUrl}?ref=share`;
    const texto = '¡Mira lo que he encontrado en meskeIA!';

    // Web Share API (móviles) - incluye texto + URL
    // Fallback clipboard (PC) - solo URL (el texto se pierde en algunos sistemas)
    if (navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url: url });
        console.log('✅ Compartido exitosamente');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error al compartir:', err);
        }
      }
    } else {
      // Fallback: Copiar URL al portapapeles
      try {
        await navigator.clipboard.writeText(url);
        mostrarMensaje('✅ Enlace copiado al portapapeles');
      } catch (err) {
        // Último fallback: prompt
        prompt('Copia este enlace para compartir:', url);
      }
    }
  };

  const mostrarMensaje = (texto: string) => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  return (
    <>
      {/* Analytics: Registra uso de la app en producción */}
      {appName && <AnalyticsTracker appName={appName} />}

      {/* Bajo coquinum.com: navegación interna a la categoría (circuito verde) */}
      <CoquinumMasDeCategoria appName={appName} />

      {/* Constelación meskeIA: invitación a explorar el catálogo + portales
          temáticos (below-fold, informativo). Estático de ancho completo, va
          antes de la píldora de compartir en el DOM para quedar por encima de
          ella en móvil. Da contexto a los enlaces: qué son y qué esperar. */}
      <aside className={styles.constelacion} aria-label="Explora meskeIA y sus portales temáticos">
        <p className={styles.invitacionCatalogo}>
          El{' '}
          <a href="https://meskeia.com/" className={styles.marcaMadre}>catálogo de meskeIA</a>
          {' '}reúne {TOTAL_IMPLEMENTED_APPS} apps gratuitas
        </p>
        <p className={styles.invitacionPortales}>Nuestras webs temáticas:</p>
        <div className={styles.portalesGrid}>
          {VERTICALES.map((v) => (
            <a key={v.id} href={v.url} className={styles.portalCard}>
              <img src={v.favicon} alt="" width={28} height={28} className={styles.portalIcon} loading="lazy" />
              <span className={styles.portalText}>
                <span className={styles.portalMarca}>{v.marca}</span>
                <span className={styles.portalTema}>{v.tema}</span>
              </span>
            </a>
          ))}
        </div>
      </aside>

      <footer className={styles.footer}>
        <div className={styles.shareSection}>
          <span className={styles.shareText}>💡 ¿Te resultó útil?</span>
          <button
            type="button"
            onClick={compartirApp}
            className={styles.shareButton}
            title="Compartir esta App"
          >
            🔗 Compártela
          </button>
        </div>
      </footer>

      {showMessage && (
        <div className={styles.toast}>
          ✅ Enlace copiado al portapapeles
        </div>
      )}
    </>
  );
}
