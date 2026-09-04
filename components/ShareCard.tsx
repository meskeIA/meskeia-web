/**
 * Componente ShareCard meskeIA
 *
 * Tarjeta de compartir slide-up — aparece al llegar al final de la página.
 * - 4 mensajes rotativos según número de visitas del usuario
 * - Cooldown por app: no se muestra más de una vez cada 24h en la misma app
 * - Cada app es independiente — no bloquea otras apps
 * - URL con ?ref=share para medir impacto en analytics
 * - Registra la EMISIÓN del compartido (clic en WhatsApp/Copiar/Email) como
 *   evento modo='share-emit', para medir el origen del embudo, no solo los
 *   aterrizajes (?ref=share). No guarda datos personales: solo app + método.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './ShareCard.module.css';
import { urlParaCompartir } from '@/lib/trackingFrom';

interface ShareCardProps {
  appName: string; // slug de la app, ej: "calculadora-tension-arterial"
}

// ─── Mensajes rotativos ───────────────────────────────────────────────────────

const MENSAJES = {
  1: {
    titulo: '¿Conoces a alguien que pueda necesitar esto?',
    subtitulo: 'Mándale el enlace — gratis, sin registro y sin publicidad.',
  },
  2: {
    titulo: 'Esta herramienta es gratuita para todos.',
    subtitulo: 'Si te ha resultado útil, compártela con quien creas que la necesita.',
  },
  3: {
    titulo: '¿Esta app ya es de las tuyas?',
    subtitulo: 'Preséntasela a alguien que aún no la conoce.',
  },
  4: {
    titulo: 'Sin anuncios. Sin registro. Sin trampa.',
    subtitulo: 'Si te resulta útil, la mejor forma de apoyarnos es compartirla.',
  },
} as const;

// ─── Constantes localStorage ──────────────────────────────────────────────────

// Cooldown por app: 24h desde la última vez que se mostró en ESA app concreta.
// Cada app es independiente — visitar app-B no bloquea app-A.
const PER_APP_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 horas
const MIN_TIME_ON_PAGE_MS = 10_000; // 10 segundos mínimo en la página

function getVisitKey(appName: string): string {
  return `meskeia_share_visits_${appName}`;
}

function getShownKey(appName: string): string {
  return `meskeia_share_shown_${appName}`;
}

function getMensajeTipo(visits: number): 1 | 2 | 3 | 4 {
  if (visits <= 1) return 1;
  if (visits <= 3) return 2;
  if (visits <= 9) return 3;
  return 4;
}

function registrarVisita(appName: string): number {
  try {
    const key = getVisitKey(appName);
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    const next = current + 1;
    localStorage.setItem(key, String(next));
    return next;
  } catch {
    return 1;
  }
}

function debesMostrar(visits: number, appName: string): boolean {
  try {
    // Cooldown por app: no mostrar si ya apareció en esta app en las últimas 24h
    const lastShownForApp = localStorage.getItem(getShownKey(appName));
    if (lastShownForApp) {
      const elapsed = Date.now() - parseInt(lastShownForApp, 10);
      if (elapsed < PER_APP_COOLDOWN_MS) return false;
    }

    // Para visitas 10+: solo mostrar cada 10 visitas
    if (visits >= 10 && visits % 10 !== 0) return false;

    return true;
  } catch {
    return false; // localStorage no disponible (modo privado, etc.)
  }
}

function registrarMostrado(appName: string): void {
  try {
    localStorage.setItem(getShownKey(appName), String(Date.now()));
  } catch {
    // ignorar errores de localStorage
  }
}

// ─── Tracking de emisión ──────────────────────────────────────────────────────

// Solo registramos en los dominios de producción (mismos que AnalyticsTracker).
// En localhost / previews de Vercel no contaminamos las métricas.
const HOSTS_PRODUCCION = new Set([
  'meskeia.com', 'www.meskeia.com',
  'delegum.com', 'www.delegum.com',
  'cronicum.com', 'www.cronicum.com',
  'stemum.com', 'www.stemum.com',
  'coquinum.com', 'www.coquinum.com',
]);

/**
 * Registra el clic en un botón de compartir (la EMISIÓN del compartido).
 * Evento independiente del aterrizaje: modo='share-emit' para que las stats
 * lo excluyan del tráfico real y la pestaña "Últimos Registros" lo aísle.
 */
function registrarEmision(appName: string, metodo: 'whatsapp' | 'copy' | 'email'): void {
  try {
    if (typeof window === 'undefined') return;
    if (!HOSTS_PRODUCCION.has(window.location.hostname)) return;
    if (navigator.webdriver) return; // bots

    let sesionId: string | null = null;
    try {
      sesionId = sessionStorage.getItem('meskeia_session_id');
    } catch {
      // sessionStorage no disponible
    }

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aplicacion: appName,
        modo: 'share-emit',
        sesion_id: sesionId,
        datos_adicionales: { share_emit: metodo },
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // nunca bloquear la acción de compartir por un fallo de tracking
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ShareCard({ appName }: ShareCardProps) {
  const [visible, setVisible] = useState(false);
  const [cerrado, setCerrado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [tipo, setTipo] = useState<1 | 2 | 3 | 4>(1);

  useEffect(() => {
    const visits = registrarVisita(appName);

    if (!debesMostrar(visits, appName)) return;

    const t = getMensajeTipo(visits);
    setTipo(t);

    const entradaMs = Date.now();

    const mostrarTarjeta = () => {
      setVisible(true);
      registrarMostrado(appName);
    };

    const handleScroll = () => {
      // Respetar tiempo mínimo en página
      if (Date.now() - entradaMs < MIN_TIME_ON_PAGE_MS) return;

      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;

      if (scrolled >= total - 150) {
        mostrarTarjeta();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [appName]);

  const cerrar = useCallback(() => {
    setVisible(false);
    setCerrado(true);
  }, []);

  const getShareUrl = useCallback((): string => {
    if (typeof window === 'undefined') return '';
    // Colocaba bien el ?ref=share pero arrastraba el #from= de quien comparte,
    // que atribuye su navegación y no la del destinatario. Ver lib/trackingFrom.ts.
    return urlParaCompartir();
  }, []);

  const compartirWhatsApp = useCallback(() => {
    registrarEmision(appName, 'whatsapp');
    const url = getShareUrl();
    const mensaje = encodeURIComponent(
      `Te paso esta herramienta gratuita, sin registro: ${url}`
    );
    window.open(`https://wa.me/?text=${mensaje}`, '_blank', 'noopener,noreferrer');
  }, [getShareUrl, appName]);

  const copiarEnlace = useCallback(async () => {
    registrarEmision(appName, 'copy');
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      prompt('Copia este enlace para compartir:', url);
    }
  }, [getShareUrl, appName]);

  const compartirEmail = useCallback(() => {
    registrarEmision(appName, 'email');
    const url = getShareUrl();
    const asunto = encodeURIComponent('Te paso una herramienta gratuita de meskeIA');
    const cuerpo = encodeURIComponent(
      `Hola,\n\nTe paso este enlace que puede interesarte. Es gratis, sin registro y sin publicidad:\n\n${url}`
    );
    window.open(`mailto:?subject=${asunto}&body=${cuerpo}`);
  }, [getShareUrl, appName]);

  if (cerrado || !visible) return null;

  const msg = MENSAJES[tipo];

  return (
    <div
      className={`${styles.slideCard} ${visible ? styles.visible : ''}`}
      role="complementary"
      aria-label="Compartir aplicación"
    >
      <button
        className={styles.cerrar}
        onClick={cerrar}
        type="button"
        aria-label="Cerrar"
      >
        ✕
      </button>

      <div className={styles.contenido}>
        <span className={styles.icono} aria-hidden="true">🔗</span>
        <div className={styles.textos}>
          <p className={styles.titulo}>{msg.titulo}</p>
          <p className={styles.subtitulo}>{msg.subtitulo}</p>
        </div>
      </div>

      <div className={styles.botones}>
        <button
          className={`${styles.btn} ${styles.btnWhatsapp}`}
          onClick={compartirWhatsApp}
          type="button"
          aria-label="Compartir por WhatsApp"
        >
          <span aria-hidden="true">🟢</span> WhatsApp
        </button>

        <button
          className={`${styles.btn} ${styles.btnCopiar}`}
          onClick={copiarEnlace}
          type="button"
          aria-label="Copiar enlace al portapapeles"
        >
          {copiado ? '✓ ¡Copiado!' : '🔗 Copiar enlace'}
        </button>

        <button
          className={`${styles.btn} ${styles.btnEmail}`}
          onClick={compartirEmail}
          type="button"
          aria-label="Compartir por email"
        >
          <span aria-hidden="true">✉</span> Email
        </button>
      </div>
    </div>
  );
}
