'use client';

import { useState, useEffect } from 'react';
import { URL_PRIVACIDAD } from '@/lib/urls-legales';
import Link from 'next/link';
import styles from './TransparencyBanner.module.css';

const BANNER_DISMISSED_KEY = 'meskeia_transparency_banner_dismissed';

export default function TransparencyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Verificar si el banner ya fue cerrado anteriormente
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (!dismissed) {
      // Pequeño delay para que la animación de entrada sea visible
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    // Esperar a que termine la animación antes de ocultar
    setTimeout(() => {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.banner} ${isClosing ? styles.closing : ''}`}
      role="complementary"
      aria-label="Aviso de transparencia sobre datos locales"
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <span aria-hidden="true">🔒</span>
        </div>
        <div className={styles.textContent}>
          <p className={styles.title}>Tu privacidad es importante</p>
          <p className={styles.description}>
            meskeIA guarda tus preferencias y progreso <strong>solo en tu dispositivo</strong> (localStorage).
            No usamos cookies de seguimiento ni enviamos tus datos a terceros.
          </p>
          <a href={URL_PRIVACIDAD} className={styles.link}>
            Más información →
          </a>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className={styles.closeButton}
          aria-label="Cerrar aviso de transparencia"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
