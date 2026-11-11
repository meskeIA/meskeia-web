'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './PruebaCamara.module.css';
import SelectorEntradaAudio from '@/components/SelectorEntradaAudio';
import { mantenerAudioEnMarcha, useEntradaAudio } from '@/lib/useEntradaAudio';

/**
 * Prueba de micrófono DENTRO de la prueba de cámara (S0260, 08/11/2026).
 *
 * Por qué aquí y no solo en /prueba-microfono/: en 90 días Google mandó a esta página 17
 * consultas de «cámara y micrófono» (100 impresiones, posición 8-10) que solo encontraban un
 * enlace, mientras /prueba-microfono/, indexada desde diciembre de 2025, sumaba 20 impresiones.
 * Quien va a una videollamada quiere comprobar las dos cosas en el mismo sitio.
 *
 * Dos decisiones que no se deducen del código:
 *   · La captura va CON el procesado de voz del navegador (cancelación de eco, supresión de ruido
 *     y control de ganancia), al revés que `restriccionesAudio` de lib/useEntradaAudio, que lo
 *     quita para medir. Aquí no se mide: se comprueba cómo te oirán, y Zoom, Meet o Teams
 *     capturan con ese procesado puesto.
 *   · El nivel es el RMS de la onda en dBFS (0 = el máximo que admite la captura), llevado a una
 *     barra de -60 a 0 dBFS. No son decibelios del ambiente: eso es /sonometro/.
 */

/** Tramos de la barra en dBFS: voz a un palmo de un micrófono de portátil ≈ -35 a -12 */
const DBFS_SIN_SENAL = -50;
const DBFS_BAJO = -35;
const DBFS_ALTO = -8;
const SEGUNDOS_GRABACION = 5;
/** Lo que baja por segundo el pico retenido: de la voz a «sin señal» tarda ~2 s de silencio */
const CAIDA_PICO_DB_POR_S = 15;

interface Estado {
  texto: string;
  tramo: 'nada' | 'bajo' | 'bien' | 'alto';
}

function estadoDelNivel(dbfs: number): Estado {
  if (dbfs < DBFS_SIN_SENAL) return { texto: 'No llega sonido: habla o acerca el micrófono', tramo: 'nada' };
  if (dbfs < DBFS_BAJO) return { texto: 'Muy bajo: te oirán con dificultad', tramo: 'bajo' };
  if (dbfs < DBFS_ALTO) return { texto: 'Correcto para una videollamada', tramo: 'bien' };
  return { texto: 'Muy alto: puede saturar y sonar distorsionado', tramo: 'alto' };
}

/** dBFS de -60 a 0 → porcentaje de la barra */
function porcentajeBarra(dbfs: number): number {
  return Math.max(0, Math.min(100, Math.round(((dbfs + 60) / 60) * 100)));
}

export default function PanelMicrofono() {
  const { entradas, entradaId, setEntradaId, actualizarEntradas } = useEntradaAudio();

  const streamRef = useRef<MediaStream | null>(null);
  const contextoRef = useRef<AudioContext | null>(null);
  const animacionRef = useRef(0);
  const barraRef = useRef<HTMLDivElement>(null);
  const grabadorRef = useRef<MediaRecorder | null>(null);
  const urlGrabacionRef = useRef<string | null>(null);

  const [activo, setActivo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbfs, setDbfs] = useState(-Infinity);
  const [restante, setRestante] = useState<number | null>(null);
  const [urlGrabacion, setUrlGrabacion] = useState<string | null>(null);

  // Cabo C0715 (alcance del hallazgo 4487): el botón sigue diciendo «Probar micrófono» hasta que
  // getUserMedia resuelve, y un doble clic abría el micrófono dos veces; el segundo flujo pisaba
  // al primero en streamRef y este seguía vivo tras «Detener micrófono». `cerrar` sube la
  // generación, así que el flujo que llega de una apertura que ya no es la última se cierra al
  // llegar. Vale también para cambiar de entrada mientras se abre y para salir de la página.
  const generacionRef = useRef(0);

  const cerrar = useCallback(() => {
    generacionRef.current += 1;
    cancelAnimationFrame(animacionRef.current);
    if (grabadorRef.current && grabadorRef.current.state !== 'inactive') grabadorRef.current.stop();
    grabadorRef.current = null;
    streamRef.current?.getTracks().forEach((pista) => pista.stop());
    streamRef.current = null;
    if (contextoRef.current) void contextoRef.current.close();
    contextoRef.current = null;
  }, []);

  const iniciar = useCallback(
    async (idEntrada: string) => {
      setError(null);
      cerrar();
      const generacion = generacionRef.current;
      try {
        const audio: MediaTrackConstraints = {
          ...(idEntrada ? { deviceId: { exact: idEntrada } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        };
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio });
        } catch (fallo) {
          // La entrada elegida se desenchufó: se abre la predeterminada. Un permiso denegado
          // se propaga, porque con otra entrada pasaría lo mismo.
          const nombre = fallo instanceof Error ? fallo.name : '';
          if (!idEntrada || nombre === 'NotAllowedError' || nombre === 'SecurityError') throw fallo;
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
          setEntradaId('');
        }
        if (generacion !== generacionRef.current) {
          stream.getTracks().forEach((pista) => pista.stop());
          return;
        }
        streamRef.current = stream;

        // Creado tras el await de getUserMedia puede nacer suspendido (Safari en iOS) y la
        // barra se quedaría quieta como si no llegara sonido: se reanuda y, si no arranca, se
        // avisa (receta de la familia, tests/familias/entrada-microfono.spec.ts)
        const contexto = new AudioContext();
        contextoRef.current = contexto;
        await mantenerAudioEnMarcha(
          contexto,
          (enMarcha) =>
            setError(
              enMarcha
                ? null
                : 'El navegador no ha arrancado el audio, así que no llega sonido a la prueba. Pulsa «Detener micrófono» y vuelve a probarlo.',
            ),
          () => contextoRef.current === contexto,
        );
        if (contextoRef.current !== contexto) return;

        const analizador = contexto.createAnalyser();
        analizador.fftSize = 2048;
        contexto.createMediaStreamSource(stream).connect(analizador);
        const muestras = new Float32Array(analizador.fftSize);

        let ultimoEstado = 0;
        let ultimoInstante = 0;
        // El veredicto sale del PICO con caída lenta, no del nivel instantáneo: la voz tiene
        // pausas entre palabras, y sin esto el texto saltaba a «No llega sonido» en cada una
        let pico = -Infinity;
        const medir = (instante: number) => {
          animacionRef.current = requestAnimationFrame(medir);
          analizador.getFloatTimeDomainData(muestras);
          let suma = 0;
          for (let i = 0; i < muestras.length; i++) suma += muestras[i] * muestras[i];
          const rms = Math.sqrt(suma / muestras.length);
          const nivel = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
          // La barra se mueve a cada fotograma; el texto y el estado accesible, cada 200 ms,
          // para no rehacer el componente 60 veces por segundo
          const segundos = ultimoInstante ? (instante - ultimoInstante) / 1000 : 0;
          ultimoInstante = instante;
          pico = Math.max(nivel, pico - CAIDA_PICO_DB_POR_S * segundos);
          if (barraRef.current) barraRef.current.style.width = `${porcentajeBarra(nivel)}%`;
          if (instante - ultimoEstado > 200) {
            ultimoEstado = instante;
            setDbfs(pico);
          }
        };
        animacionRef.current = requestAnimationFrame(medir);

        setActivo(true);
        await actualizarEntradas();
      } catch (fallo) {
        // El fallo de una apertura que ya no es la última no pisa a la que sigue en curso
        if (generacion !== generacionRef.current) return;
        const nombre = fallo instanceof Error ? fallo.name : '';
        if (nombre === 'NotAllowedError' || nombre === 'SecurityError') {
          setError('Permiso denegado. Permite el acceso al micrófono en tu navegador (icono del candado en la barra de direcciones).');
        } else if (nombre === 'NotFoundError') {
          setError('No se encontró ningún micrófono. Conecta uno o revisa que no esté desactivado en el sistema.');
        } else if (nombre === 'NotReadableError') {
          setError('El micrófono está ocupado o bloqueado por el sistema. Cierra otras apps de videollamada y vuelve a probar.');
        } else {
          setError(`No se pudo abrir el micrófono: ${fallo instanceof Error ? fallo.message : 'error desconocido'}`);
        }
        cerrar();
        setActivo(false);
      }
    },
    [actualizarEntradas, cerrar, setEntradaId],
  );

  const detener = useCallback(() => {
    cerrar();
    if (barraRef.current) barraRef.current.style.width = '0%';
    setActivo(false);
    setDbfs(-Infinity);
    setRestante(null);
    setError(null);
  }, [cerrar]);

  const cambiarEntrada = useCallback(
    (id: string) => {
      setEntradaId(id);
      if (activo) void iniciar(id);
    },
    [activo, iniciar, setEntradaId],
  );

  const grabar = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || typeof MediaRecorder === 'undefined') {
      setError('Este navegador no permite grabar audio, pero la barra de nivel sí funciona.');
      return;
    }
    const trozos: Blob[] = [];
    const grabador = new MediaRecorder(stream);
    grabadorRef.current = grabador;
    grabador.ondataavailable = (evento) => {
      if (evento.data.size > 0) trozos.push(evento.data);
    };
    grabador.onstop = () => {
      setRestante(null);
      if (trozos.length === 0) return;
      if (urlGrabacionRef.current) URL.revokeObjectURL(urlGrabacionRef.current);
      const url = URL.createObjectURL(new Blob(trozos, { type: grabador.mimeType || 'audio/webm' }));
      urlGrabacionRef.current = url;
      setUrlGrabacion(url);
    };
    grabador.start();
    setRestante(SEGUNDOS_GRABACION);
  }, []);

  // Cuenta atrás de la grabación: al llegar a cero se para sola
  useEffect(() => {
    if (restante === null) return;
    if (restante <= 0) {
      if (grabadorRef.current && grabadorRef.current.state !== 'inactive') grabadorRef.current.stop();
      return;
    }
    const temporizador = setTimeout(() => setRestante((r) => (r === null ? null : r - 1)), 1000);
    return () => clearTimeout(temporizador);
  }, [restante]);

  // Al salir de la página se suelta el micrófono y la grabación
  useEffect(
    () => () => {
      cerrar();
      if (urlGrabacionRef.current) URL.revokeObjectURL(urlGrabacionRef.current);
    },
    [cerrar],
  );

  const estado = estadoDelNivel(dbfs);
  const claseTramo: Record<Estado['tramo'], string> = {
    nada: styles.micBarraNada,
    bajo: styles.micBarraBajo,
    bien: styles.micBarraBien,
    alto: styles.micBarraAlto,
  };
  const grabando = restante !== null;

  return (
    <section className={styles.micPanel} aria-labelledby="titulo-microfono">
      <h2 id="titulo-microfono" className={styles.micTitulo}>
        <span aria-hidden="true">🎙️</span> Prueba también el micrófono
      </h2>
      <p className={styles.micIntro}>
        Habla con tu voz normal, a la distancia a la que te sentarás en la llamada. La barra muestra
        cuánto sonido llega y, si grabas unos segundos, escucharás cómo te oirán.
      </p>

      <div
        className={`${styles.micMedidor} ${activo ? '' : styles.micMedidorApagado}`}
        role="meter"
        aria-label="Nivel del micrófono"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={activo ? porcentajeBarra(dbfs) : 0}
        aria-valuetext={activo ? estado.texto : 'Micrófono apagado'}
      >
        <div ref={barraRef} className={`${styles.micBarra} ${claseTramo[estado.tramo]}`} />
        <span className={styles.micMarcaBajo} aria-hidden="true" />
        <span className={styles.micMarcaAlto} aria-hidden="true" />
      </div>
      <p className={styles.micEstado}>
        <span>{activo ? estado.texto : 'Pulsa «Probar micrófono» para empezar'}</span>
      </p>

      <p role="alert" className={styles.micError}>{error}</p>

      <div className={styles.controls}>
        {!activo ? (
          <button type="button" onClick={() => void iniciar(entradaId)} className={styles.btnPrimary}>
            <span aria-hidden="true">🎙️</span> Probar micrófono
          </button>
        ) : (
          <>
            <button type="button" onClick={detener} className={styles.btnSecondary}>
              <span aria-hidden="true">⏹️</span> Detener micrófono
            </button>
            <button type="button" onClick={grabar} disabled={grabando} className={styles.btnAccent}>
              <span aria-hidden="true">⏺️</span>{' '}
              <span>{grabando ? `Grabando… ${restante} s` : `Grabar ${SEGUNDOS_GRABACION} s y escuchar`}</span>
            </button>
          </>
        )}
      </div>

      {activo && (
        <div className={styles.micSelector}>
          <SelectorEntradaAudio
            entradas={entradas}
            valor={entradaId}
            onCambiar={cambiarEntrada}
            ayuda="Si tienes auriculares con micrófono o un micrófono USB, elige el que usarás en la llamada."
          />
        </div>
      )}

      {urlGrabacion && (
        <div className={styles.micGrabacion}>
          <p className={styles.micEstado}>Tu grabación de prueba (se queda en este navegador):</p>
          <audio controls src={urlGrabacion} className={styles.micAudio} />
        </div>
      )}
    </section>
  );
}
