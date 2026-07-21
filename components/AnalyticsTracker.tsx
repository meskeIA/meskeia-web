'use client';

import { useEffect } from 'react';

interface AnalyticsTrackerProps {
  applicationName?: string;
  appName?: string;
}

/**
 * Componente Analytics v3.0 para meskeIA (Turso)
 *
 * IMPORTANTE: Desactivado en subdominios de desarrollo (next.meskeia.com)
 * Solo registra analytics en producción (meskeia.com)
 *
 * Ahora usa API Routes de Next.js + Turso (SQLite en la nube)
 */
export default function AnalyticsTracker({ applicationName, appName }: AnalyticsTrackerProps) {
  const finalAppName = applicationName || appName || 'unknown';
  useEffect(() => {
    // NO ejecutar analytics en subdominios de desarrollo (next.meskeia.com,
    // previews de Vercel, localhost). Sí registramos los tres dominios de
    // producción: meskeia.com y los verticales delegum.com / cronicum.com
    // (servidos por host-rewrite sobre el mismo proyecto). El servidor deriva
    // el dominio del header host para el cuadro "Tráfico por dominio".
    const HOSTS_PRODUCCION = [
      'meskeia.com', 'www.meskeia.com',
      'delegum.com', 'www.delegum.com',
      'cronicum.com', 'www.cronicum.com',
      'stemum.com', 'www.stemum.com',
      'coquinum.com', 'www.coquinum.com',
    ];
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (!HOSTS_PRODUCCION.includes(hostname)) {
        console.log('[Analytics] Desactivado en entorno de desarrollo:', hostname);
        return;
      }
    }

    // Filtrar bots en el cliente (Googlebot usa Chrome headless: navigator.webdriver=true)
    if (navigator.webdriver) {
      console.log('[Analytics] Bot detectado (webdriver), ignorando.');
      return;
    }
    const uaBot = /bot|crawler|spider|Googlebot|bingbot|Headless/i.test(navigator.userAgent);
    if (uaBot) {
      console.log('[Analytics] Bot detectado (userAgent), ignorando.');
      return;
    }

    // URL base para API (relativa, funciona en cualquier dominio)
    const API_BASE = '/api/analytics';

    // Obtener o crear sesion_id persistente entre páginas de la misma pestaña.
    // sessionStorage vive durante toda la pestaña del navegador y se borra al cerrarla.
    // Esto permite enlazar visitas a múltiples páginas como una única sesión real
    // (antes se generaba uno nuevo por cada page load → cada visita parecía una sesión distinta).
    const SESSION_KEY = 'meskeia_session_id';
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }

    // Detectar si está instalada como PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;

    // Detectar si la visita viene referida desde una plataforma de IA
    const referrer = document.referrer;
    const esReferralIA = /chatgpt\.com|perplexity\.ai|claude\.ai|gemini\.google|copilot\.microsoft\.com|you\.com|phind\.com|poe\.com/i.test(referrer);
    const esReferralSocial = /t\.co|x\.com|twitter\.com|instagram\.com|facebook\.com|linkedin\.com/i.test(referrer);

    // Extraer solo el hostname del referrer (RGPD: solo dominio, nunca la URL completa)
    let referrerHostname: string | null = null;
    if ((esReferralIA || esReferralSocial) && referrer) {
      try {
        referrerHostname = new URL(referrer).hostname;
      } catch {
        // Si el referrer no es una URL válida, ignorar
      }
    }

    // Atribución cross-dominio entre los verticales propios (fallback estructural
    // al parámetro ?from=, que depende de cablearlo a mano en cada CTA). Guardamos
    // SOLO el hostname —sin ruta ni query, y es un dominio propio → RGPD nulo—
    // cuando el referrer es uno de nuestros dominios de producción Y difiere del
    // host actual. La condición "distinto del host" descarta el ruido de navegación
    // interna dentro del mismo dominio (meskeia→meskeia, stemum→stemum…), que ya
    // cubren sesion_id y la columna host; nos quedamos con el salto que de verdad
    // importa: delegum.com → app en meskeia.com, meskeia.com → stemum.com, etc.
    // De momento solo se captura (queda consultable en el dump de Turso); NO se
    // cablea en getNavegacion para no tocar el motor de Analytics. Ver memoria
    // project_delegum_atribucion_from.
    const DOMINIOS_PROPIOS = /^(meskeia|delegum|cronicum|stemum|coquinum)\.com$/i;
    let refDominio: string | null = null;
    if (referrer) {
      try {
        const refHost = new URL(referrer).hostname.replace(/^www\./, '');
        const hostActual = window.location.hostname.replace(/^www\./, '');
        if (DOMINIOS_PROPIOS.test(refHost) && refHost !== hostActual) {
          refDominio = refHost;
        }
      } catch {
        // Si el referrer no es una URL válida, ignorar
      }
    }

    // Detectar visita recurrente usando localStorage
    const storageKey = `meskeia_${finalAppName}`;
    const isRecurrent = localStorage.getItem(storageKey) !== null;

    // Marcar primera visita
    if (!isRecurrent) {
      localStorage.setItem(storageKey, new Date().toISOString());
    }

    // Detección de tipo de dispositivo
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const deviceType = isMobile ? 'movil' : 'escritorio';

    // Iniciar contador de duración
    let sessionStartTime = Date.now();
    let isActive = true;

    // Detectar si llegó por un enlace compartido (?ref=share)
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');

    // Detectar origen de navegación interna (?from=related-{slug}, ?from=continua-{slug}, etc.)
    // Permite medir el embudo de descubrimiento entre apps
    const fromParam = urlParams.get('from');

    // Datos de entrada (registro inicial)
    const entryData = {
      aplicacion: finalAppName,
      modo: isPWA ? 'pwa' : esReferralIA ? 'referral-ia' : esReferralSocial ? 'referral-social' : 'web',
      navegador: navigator.userAgent,
      sistema_operativo: navigator.platform,
      resolucion: `${window.screen.width}x${window.screen.height}`,
      tipo_dispositivo: deviceType,
      es_recurrente: isRecurrent,
      sesion_id: sessionId,
      datos_adicionales: (() => {
        const extra: Record<string, string> = {};
        if (refParam) extra.ref = refParam;
        if (referrerHostname) extra.referrer_ia = referrerHostname;
        if (refDominio) extra.ref_dominio = refDominio;
        if (fromParam) extra.from = fromParam.slice(0, 80);
        return Object.keys(extra).length > 0 ? extra : undefined;
      })(),
    };

    // Registrar entrada (nueva API Turso)
    const registerEntry = async () => {
      try {
        await fetch(`${API_BASE}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData),
          keepalive: true,
        });
        console.log('✅ Uso registrado en meskeIA Analytics v3.0 (Turso)');
      } catch (error) {
        console.error('❌ Error al registrar uso:', error);
      }
    };

    // Registrar duración usando sendBeacon (más fiable para móviles)
    const registerDuration = () => {
      const durationSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);

      // Solo registrar si la duración es mayor a 2 segundos
      if (durationSeconds > 2 && isActive) {
        const data = JSON.stringify({
          aplicacion: finalAppName,
          duracion_segundos: durationSeconds,
          tipo_dispositivo: deviceType,
          modo: isPWA ? 'pwa' : esReferralIA ? 'referral-ia' : esReferralSocial ? 'referral-social' : 'web',
          sesion_id: sessionId,
        });

        // sendBeacon con text/plain evita preflight en iOS Safari (application/json lo bloquea)
        const beaconFallback = () => {
          fetch(`${API_BASE}/duration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true,
          }).catch(() => {});
          console.log(`✅ Duración registrada (fetch fallback): ${durationSeconds}s`);
        };

        if (navigator.sendBeacon) {
          const blob = new Blob([data], { type: 'text/plain' });
          const sent = navigator.sendBeacon(`${API_BASE}/duration`, blob);
          if (sent) {
            console.log(`✅ Duración registrada (sendBeacon): ${durationSeconds}s`);
          } else {
            // sendBeacon rechazado por el browser → fallback a fetch
            beaconFallback();
          }
        } else {
          beaconFallback();
        }
      }
    };

    // 🆕 Page Visibility API - Detecta cuando el usuario minimiza la app
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Usuario salió de la app (minimizó, cambió de pestaña, etc.)
        console.log('[Analytics] Usuario salió de la app');
        registerDuration(); // Registrar ANTES de marcar inactivo (isActive debe ser true)
        isActive = false;
      } else {
        // Usuario volvió a la app
        console.log('[Analytics] Usuario volvió a la app');
        sessionStartTime = Date.now(); // Reiniciar contador
        isActive = true;
      }
    };

    // Registrar entrada inicial
    registerEntry();

    // Añadir listener de visibilidad (CRÍTICO para móviles)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listener de beforeunload (fallback para escritorio)
    window.addEventListener('beforeunload', () => {
      if (isActive) {
        registerDuration();
      }
    });

    // Listener de pagehide (alternativa para iOS)
    window.addEventListener('pagehide', () => {
      if (isActive) {
        registerDuration();
      }
    });

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // No es necesario remover beforeunload/pagehide ya que el componente se desmonta al salir
    };
  }, [finalAppName]);

  return null; // No renderiza nada
}
