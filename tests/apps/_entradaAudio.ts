import type { Page } from '@playwright/test';

/**
 * Dispositivos de audio falsos para los tests del selector «Entrada de audio»
 * (lib/useEntradaAudio + components/SelectorEntradaAudio, S0245): afinador-instrumentos,
 * sonometro y analizador-espectro.
 *
 * Simula dos entradas reales, los dos alias que Chrome añade en Windows («default» y
 * «communications», que el selector NO debe repetir) y una salida (que tampoco). El micrófono
 * es un oscilador, y cada llamada a getUserMedia deja anotado QUÉ pidió la app: es lo que se
 * comprueba, porque el procesado de voz del navegador (cabo C0581) no se ve en la pantalla.
 *
 * Se instala ANTES del goto: la app captura getUserMedia al pulsar su botón.
 */
export const OPCIONES_ESPERADAS = ['La predeterminada del sistema', 'Micrófono interno', 'Interfaz de audio USB'];

/**
 * @param hz      Frecuencia del oscilador que hace de micrófono.
 * @param ausente Id de una entrada que sigue en la lista pero ya no abre (se desenchufó entre la
 *                elección y la apertura): getUserMedia la rechaza con OverconstrainedError.
 */
export async function simularEntradasAudio(page: Page, hz = 440, ausente = ''): Promise<void> {
  await page.addInitScript(([frecuencia, idAusente]: [number, string]) => {
    const w = window as unknown as { __pedidas: MediaTrackConstraints[]; __enchufar: () => void };
    w.__pedidas = [];
    const dispositivos = [
      { deviceId: 'default', kind: 'audioinput', label: 'Predeterminado - Micrófono interno', groupId: 'g1' },
      { deviceId: 'communications', kind: 'audioinput', label: 'Comunicaciones - Micrófono interno', groupId: 'g1' },
      { deviceId: 'mic-interno', kind: 'audioinput', label: 'Micrófono interno', groupId: 'g1' },
      { deviceId: 'interfaz-usb', kind: 'audioinput', label: 'Interfaz de audio USB', groupId: 'g2' },
      { deviceId: 'altavoz', kind: 'audiooutput', label: 'Altavoces', groupId: 'g3' },
    ];
    navigator.mediaDevices.enumerateDevices = async () =>
      dispositivos.map((d) => ({ ...d, toJSON: () => d }) as MediaDeviceInfo);
    navigator.mediaDevices.getUserMedia = async (restricciones) => {
      const pedida = (restricciones?.audio ?? {}) as MediaTrackConstraints;
      w.__pedidas.push(pedida);
      const exacto = (pedida.deviceId as ConstrainDOMStringParameters | undefined)?.exact;
      if (idAusente && exacto === idAusente) {
        const error = new Error('entrada simulada desenchufada');
        error.name = 'OverconstrainedError';
        throw error;
      }
      const ctx = new AudioContext();
      // Se pide dentro del gesto, pero sin colgar getUserMedia si no completa (ver sonometro.spec)
      await Promise.race([ctx.resume(), new Promise((listo) => setTimeout(listo, 1000))]);
      const oscilador = ctx.createOscillator();
      oscilador.frequency.value = frecuencia;
      const ganancia = ctx.createGain();
      ganancia.gain.value = 0.5;
      const destino = ctx.createMediaStreamDestination();
      oscilador.connect(ganancia).connect(destino);
      oscilador.start();
      return destino.stream;
    };
    w.__enchufar = () => {
      dispositivos.push({ deviceId: 'grabadora-usb', kind: 'audioinput', label: 'Grabadora USB', groupId: 'g4' });
      navigator.mediaDevices.dispatchEvent(new Event('devicechange'));
    };
  }, [hz, ausente] as [number, string]);
}

/** Lo que la app ha pedido en cada getUserMedia, en orden. */
export function pedidas(page: Page): Promise<MediaTrackConstraints[]> {
  return page.evaluate(() => (window as unknown as { __pedidas: MediaTrackConstraints[] }).__pedidas);
}

/** Enchufa una tercera entrada con la página abierta. */
export function enchufar(page: Page): Promise<void> {
  return page.evaluate(() => (window as unknown as { __enchufar: () => void }).__enchufar());
}

/** Las tres restricciones que apagan el procesado de voz del navegador (cabo C0581). */
export const SIN_PROCESADO = { echoCancellation: false, noiseSuppression: false, autoGainControl: false };
