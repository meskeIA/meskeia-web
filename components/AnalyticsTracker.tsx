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
    // NO ejecutar analytics en subdominios de desarrollo
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Solo ejecutar en producción (meskeia.com sin subdominios)
      if (hostname !== 'meskeia.com' && hostname !== 'www.meskeia.com') {
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

    // Generar ID único de sesión
    const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Detectar si está instalada como PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true;

    // Detectar si la visita viene referida desde una plataforma de IA
    const referrer = document.referrer;
    const esReferralIA = /chatgpt\.com|perplexity\.ai|claude\.ai|gemini\.google|copilot\.microsoft\.com|you\.com|phind\.com|poe\.com/i.test(referrer);

    // Extraer solo el hostname del referrer (RGPD: solo dominio, nunca la URL completa)
    let referrerHostname: string | null = null;
    if (esReferralIA && referrer) {
      try {
        referrerHostname = new URL(referrer).hostname;
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

    // Datos de entrada (registro inicial)
    const entryData = {
      aplicacion: finalAppName,
      modo: isPWA ? 'pwa' : esReferralIA ? 'referral-ia' : 'web',
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
          modo: isPWA ? 'pwa' : esReferralIA ? 'referral-ia' : 'web',
          sesion_id: sessionId,
        });

        // sendBeacon es más fiable que fetch para eventos de salida
        // Se envía aunque el navegador esté cerrando la página
        if (navigator.sendBeacon) {
          const blob = new Blob([data], { type: 'application/json' });
          const sent = navigator.sendBeacon(`${API_BASE}/duration`, blob);
          if (sent) {
            console.log(`✅ Duración registrada (sendBeacon): ${durationSeconds}s`);
          }
        } else {
          // Fallback para navegadores sin sendBeacon
          fetch(`${API_BASE}/duration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
            keepalive: true,
          }).catch(() => {});
          console.log(`✅ Duración registrada (fetch): ${durationSeconds}s`);
        }
      }
    };

    // 🆕 Page Visibility API - Detecta cuando el usuario minimiza la app
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Usuario salió de la app (minimizó, cambió de pestaña, etc.)
        console.log('[Analytics] Usuario salió de la app');
        isActive = false;
        registerDuration();
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
