'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Entrada de audio elegible para las apps que escuchan por el micrófono: el micrófono del
 * equipo o un dispositivo externo —una interfaz de audio con el instrumento conectado por
 * cable, un micrófono de medición USB—.
 *
 * Nace con S0245 (02/11/2026) en afinador-instrumentos, la primera app de meskeIA que deja
 * conectar un instrumento externo, y se saca aquí al extenderla a sonometro y
 * analizador-espectro para no copiarla tres veces. El desplegable que la pinta es
 * `components/SelectorEntradaAudio`.
 *
 * Tres cosas que no se ven a simple vista:
 *   · los nombres de los dispositivos solo llegan con el permiso del micrófono concedido: antes
 *     el navegador devuelve entradas sin id ni nombre, la lista sale vacía y el selector no se
 *     pinta. Por eso la app llama a `actualizarEntradas` justo después de abrir el micrófono;
 *   · Chrome añade en Windows dos alias, «default» y «communications», que repiten un
 *     dispositivo real. Se quitan: la primera opción del selector ya es la predeterminada;
 *   · enchufar o quitar un dispositivo con la página abierta dispara `devicechange`, y la lista
 *     se rehace sola. Si la entrada elegida desaparece, se vuelve a la predeterminada.
 */
export interface EntradaAudio {
  id: string;
  nombre: string;
}

/**
 * Restricciones de la captura, siempre SIN el procesado de voz del navegador: la supresión de
 * ruido toma una nota o un ruido sostenido por fondo y lo apaga (cabo C0581, medido el
 * 02/11/2026 con el micrófono simulado de Chromium: un La3 constante caía de 0,12 a 0,025 de
 * amplitud en dos segundos). '' = la entrada predeterminada del sistema.
 */
export function restriccionesAudio(entradaId: string): MediaTrackConstraints {
  return {
    ...(entradaId ? { deviceId: { exact: entradaId } } : {}),
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
}

/**
 * Abre la entrada elegida. Si ya no está (se desenchufó entre la elección y la apertura), abre
 * la predeterminada en su lugar; un permiso denegado, en cambio, se propaga tal cual, porque
 * con otra entrada el resultado sería el mismo. Devuelve con qué entrada se abrió de verdad.
 */
export async function abrirEntradaAudio(entradaId: string): Promise<{ stream: MediaStream; entradaId: string }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: restriccionesAudio(entradaId) });
    return { stream, entradaId };
  } catch (error) {
    const nombre = error instanceof Error ? error.name : '';
    if (!entradaId || nombre === 'NotAllowedError' || nombre === 'SecurityError') throw error;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: restriccionesAudio('') });
    return { stream, entradaId: '' };
  }
}

/**
 * Mantiene en marcha el AudioContext que recibe el micrófono, y dice si lo está.
 *
 * Un contexto creado después del `await` de getUserMedia puede nacer en 'suspended' (la política
 * de Safari en iOS: fuera del gesto del usuario) o quedarse 'interrupted' tras una llamada. Sin
 * reanudarlo, el analizador lee ceros y la pantalla es la de una sala en silencio, sin aviso.
 * Receta de analizador-espectro (hallazgo 4071, f0d02be3), traída aquí al ver que sonometro,
 * afinador-instrumentos, prueba-microfono y ejercicios-vocalizacion tampoco llamaban a resume()
 * (cabo C0629, 05/11/2026): se reanuda al crearlo y cada vez que deja de correr, y la app avisa
 * mientras no corra. Testigo: tests/familias/entrada-microfono.spec.ts.
 *
 * `alCambiar(true)` cuando corre y `alCambiar(false)` cuando no ha podido arrancarlo; nada se
 * llama si `sigueVigente()` devuelve false (la app ya lo cerró o abrió otro).
 */
export async function mantenerAudioEnMarcha(
  contexto: AudioContext,
  alCambiar: (enMarcha: boolean) => void,
  sigueVigente: () => boolean = () => true,
): Promise<void> {
  const reanudar = async () => {
    if (contexto.state !== 'running') {
      try {
        await contexto.resume();
      } catch {
        // se avisa abajo
      }
    }
    if (!sigueVigente()) return;
    alCambiar(contexto.state === 'running');
  };
  contexto.onstatechange = () => {
    if (!sigueVigente()) return;
    if (contexto.state === 'running') alCambiar(true);
    else if (contexto.state !== 'closed') void reanudar();
  };
  await reanudar();
}

export function useEntradaAudio(): {
  entradas: EntradaAudio[];
  entradaId: string;
  setEntradaId: (id: string) => void;
  actualizarEntradas: () => Promise<void>;
} {
  const [entradas, setEntradas] = useState<EntradaAudio[]>([]);
  const [entradaId, setEntradaId] = useState('');

  const actualizarEntradas = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const dispositivos = await navigator.mediaDevices.enumerateDevices();
    const lista = dispositivos
      .filter((d) => d.kind === 'audioinput' && d.deviceId && d.deviceId !== 'default' && d.deviceId !== 'communications')
      .map((d, i) => ({ id: d.deviceId, nombre: d.label || `Entrada ${i + 1}` }));
    setEntradas(lista);
    setEntradaId((actual) => (actual && !lista.some((e) => e.id === actual) ? '' : actual));
  }, []);

  useEffect(() => {
    const dispositivos = navigator.mediaDevices;
    if (!dispositivos?.addEventListener) return;
    const alCambiar = () => {
      void actualizarEntradas();
    };
    dispositivos.addEventListener('devicechange', alCambiar);
    return () => dispositivos.removeEventListener('devicechange', alCambiar);
  }, [actualizarEntradas]);

  return { entradas, entradaId, setEntradaId, actualizarEntradas };
}
