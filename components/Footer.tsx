/**
 * Componente Footer meskeIA
 *
 * Footer unificado con glassmorphism (formato oficial nov 2025)
 * Incluye botón de compartir integrado
 * Incluye AnalyticsScript para registro de uso
 */

'use client';

import React, { useState } from 'react';
import styles from './Footer.module.css';
import AnalyticsScript from './AnalyticsScript';

interface FooterProps {
  appName?: string; // Nombre de la app para compartir (opcional)
}

export default function Footer({ appName }: FooterProps) {
  const [showMessage, setShowMessage] = useState(false);

  const compartirApp = async () => {
    const titulo = appName || document.title;
    const url = window.location.href;
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
      {appName && <AnalyticsScript appName={appName} />}

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
        <div className={styles.copyright}>
          © 2025 meskeIA
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
