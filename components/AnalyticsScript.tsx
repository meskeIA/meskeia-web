/**
 * Componente AnalyticsScript meskeIA
 *
 * Google Analytics v2.0 con tracking avanzado:
 * - Registro de uso (navegador, SO, resolución, dispositivo, recurrente)
 * - Registro de duración de sesión
 * - Detección automática móvil/escritorio
 */

'use client';

import { useEffect } from 'react';

interface AnalyticsScriptProps {
  appName: string; // Slug de la aplicación (ej: "calculadora-porcentajes")
}

/**
 * Componente Analytics v2.0 para meskeIA
 *
 * IMPORTANTE: Desactivado en subdominios de desarrollo (next.meskeia.com)
 * Solo registra analytics en producción (meskeia.com)
 */
export default function AnalyticsScript({ appName }: AnalyticsScriptProps) {
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
    // Detección de visita recurrente usando localStorage
    const claveStorage = `meskeia_${appName}`;
    const esRecurrente = localStorage.getItem(claveStorage) !== null;

    // Marcar primera visita
    if (!esRecurrente) {
      localStorage.setItem(claveStorage, new Date().toISOString());
    }

    // Detección de tipo de dispositivo
    const esMovil = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const tipoDispositivo = esMovil ? 'movil' : 'escritorio';

    // Iniciar contador de duración
    const tiempoInicio = Date.now();

    // Datos de entrada (registro inicial)
    const datosEntrada = {
      aplicacion: appName,
      navegador: navigator.userAgent,
      sistema_operativo: navigator.platform,
      resolucion: `${window.screen.width}x${window.screen.height}`,
      tipo_dispositivo: tipoDispositivo,
      es_recurrente: esRecurrente,
    };

    // Registrar entrada
    fetch('https://meskeia.com/api/v1/guardar-uso.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosEntrada),
      keepalive: true,
    })
      .then(() => {
        console.log('✅ Uso registrado en meskeIA Analytics v2.0');
      })
      .catch((error) => {
        console.error('Error al registrar uso:', error);
      });

    // Registrar duración al salir
    const registrarDuracion = () => {
      const duracionSegundos = Math.floor((Date.now() - tiempoInicio) / 1000);

      // Solo registrar si la duración es mayor a 2 segundos (evita clics accidentales)
      if (duracionSegundos > 2) {
        fetch('https://meskeia.com/api/v1/guardar-duracion.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            aplicacion: appName,
            duracion_segundos: duracionSegundos,
            tipo_dispositivo: tipoDispositivo,
          }),
          keepalive: true,
        }).catch((error) => {
          console.error('Error al registrar duración:', error);
        });
      }
    };

    // Registrar al cerrar/salir
    window.addEventListener('beforeunload', registrarDuracion);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', registrarDuracion);
    };
  }, [appName]);

  return null; // Este componente no renderiza nada
}
