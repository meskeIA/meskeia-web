'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './AfinadorInstrumentos.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Notas y frecuencias (A4 = 440Hz)
const NOTAS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const NOTAS_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface AfinacionInstrumento {
  nombre: string;
  cuerdas: { nota: string; octava: number; frecuencia: number }[];
}

const INSTRUMENTOS: AfinacionInstrumento[] = [
  {
    nombre: 'Guitarra estándar',
    cuerdas: [
      { nota: 'Mi', octava: 4, frecuencia: 329.63 },
      { nota: 'Si', octava: 3, frecuencia: 246.94 },
      { nota: 'Sol', octava: 3, frecuencia: 196.00 },
      { nota: 'Re', octava: 3, frecuencia: 146.83 },
      { nota: 'La', octava: 2, frecuencia: 110.00 },
      { nota: 'Mi', octava: 2, frecuencia: 82.41 },
    ]
  },
  {
    nombre: 'Bajo 4 cuerdas',
    cuerdas: [
      { nota: 'Sol', octava: 2, frecuencia: 98.00 },
      { nota: 'Re', octava: 2, frecuencia: 73.42 },
      { nota: 'La', octava: 1, frecuencia: 55.00 },
      { nota: 'Mi', octava: 1, frecuencia: 41.20 },
    ]
  },
  {
    nombre: 'Ukelele estándar',
    cuerdas: [
      { nota: 'La', octava: 4, frecuencia: 440.00 },
      { nota: 'Mi', octava: 4, frecuencia: 329.63 },
      { nota: 'Do', octava: 4, frecuencia: 261.63 },
      { nota: 'Sol', octava: 4, frecuencia: 392.00 },
    ]
  },
  {
    nombre: 'Violín',
    cuerdas: [
      { nota: 'Mi', octava: 5, frecuencia: 659.26 },
      { nota: 'La', octava: 4, frecuencia: 440.00 },
      { nota: 'Re', octava: 4, frecuencia: 293.66 },
      { nota: 'Sol', octava: 3, frecuencia: 196.00 },
    ]
  },
];

// Función para obtener la frecuencia de una nota
function getFrecuenciaNota(nota: number, octava: number, a4: number = 440): number {
  return a4 * Math.pow(2, (nota - 9 + (octava - 4) * 12) / 12);
}

// Función para obtener la nota más cercana a una frecuencia
function getNotaMasCercana(frecuencia: number, a4: number = 440): { nota: number; octava: number; cents: number; frecuenciaExacta: number } {
  const semitonosDesdeA4 = 12 * Math.log2(frecuencia / a4);
  const semitonoRedondeado = Math.round(semitonosDesdeA4);
  const nota = ((semitonoRedondeado % 12) + 12 + 9) % 12; // +9 para empezar en Do
  const octava = Math.floor((semitonoRedondeado + 9) / 12) + 4;
  const frecuenciaExacta = getFrecuenciaNota(nota, octava, a4);
  const cents = Math.round(1200 * Math.log2(frecuencia / frecuenciaExacta));

  return { nota, octava, cents, frecuenciaExacta };
}

// Algoritmo de autocorrelación para detectar pitch
function autoCorrelate(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let foundGoodCorrelation = false;
  const correlations = new Array(MAX_SAMPLES);

  // Verificar si hay suficiente señal
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let lastCorrelation = 1;
  for (let offset = 0; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset]);
    }
    correlation = 1 - (correlation / MAX_SAMPLES);
    correlations[offset] = correlation;

    if ((correlation > 0.9) && (correlation > lastCorrelation)) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      const shift = (correlations[bestOffset + 1] - correlations[bestOffset - 1]) / correlations[bestOffset];
      return sampleRate / (bestOffset + (8 * shift));
    }
    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }
  return -1;
}

export default function AfinadorInstrumentosPage() {
  const [escuchando, setEscuchando] = useState(false);
  const [frecuenciaDetectada, setFrecuenciaDetectada] = useState<number | null>(null);
  const [notaActual, setNotaActual] = useState<{ nota: number; octava: number; cents: number } | null>(null);
  const [instrumentoSeleccionado, setInstrumentoSeleccionado] = useState(0);
  const [a4Referencia, setA4Referencia] = useState(440);
  const [permisoMicrofono, setPermisoMicrofono] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const bufferRef = useRef<Float32Array | null>(null);

  const detectarPitch = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current) return;

    analyserRef.current.getFloatTimeDomainData(bufferRef.current);
    const frecuencia = autoCorrelate(bufferRef.current, audioContextRef.current!.sampleRate);

    if (frecuencia > 0 && frecuencia < 2000) {
      setFrecuenciaDetectada(frecuencia);
      const info = getNotaMasCercana(frecuencia, a4Referencia);
      setNotaActual(info);
    } else {
      setFrecuenciaDetectada(null);
      setNotaActual(null);
    }

    animationRef.current = requestAnimationFrame(detectarPitch);
  }, [a4Referencia]);

  const iniciarEscucha = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setPermisoMicrofono('granted');

      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      bufferRef.current = new Float32Array(analyserRef.current.fftSize);

      setEscuchando(true);
      detectarPitch();
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setPermisoMicrofono('denied');
    }
  };

  const detenerEscucha = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setEscuchando(false);
    setFrecuenciaDetectada(null);
    setNotaActual(null);
  };

  useEffect(() => {
    return () => {
      detenerEscucha();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEstadoAfinacion = (): 'bajo' | 'afinado' | 'alto' | null => {
    if (!notaActual) return null;
    if (Math.abs(notaActual.cents) <= 5) return 'afinado';
    return notaActual.cents < 0 ? 'bajo' : 'alto';
  };

  const estado = getEstadoAfinacion();
  const instrumento = INSTRUMENTOS[instrumentoSeleccionado];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Afinador de Instrumentos</h1>
        <p className={styles.subtitle}>
          Afinador cromático con detección automática
        </p>
      </header>

      {/* Panel principal */}
      <div className={styles.afinadorPanel}>
        {/* Display de nota */}
        <div className={`${styles.notaDisplay} ${estado ? styles[estado] : ''}`}>
          {notaActual ? (
            <>
              <span className={styles.notaNombre}>{NOTAS[notaActual.nota]}</span>
              <span className={styles.notaOctava}>{notaActual.octava}</span>
              <span className={styles.notaEn}>({NOTAS_EN[notaActual.nota]})</span>
            </>
          ) : (
            <span className={styles.notaVacia}>--</span>
          )}
        </div>

        {/* Indicador de cents */}
        <div className={styles.centsContainer}>
          <div className={styles.centsBar}>
            <div className={styles.centsMarcas}>
              <span>-50</span>
              <span>-25</span>
              <span>0</span>
              <span>+25</span>
              <span>+50</span>
            </div>
            <div className={styles.centsTrack}>
              <div
                className={`${styles.centsIndicador} ${estado ? styles[estado] : ''}`}
                style={{
                  left: notaActual
                    ? `${50 + Math.max(-50, Math.min(50, notaActual.cents))}%`
                    : '50%'
                }}
              />
              <div className={styles.centsCentro} />
            </div>
          </div>
          <p className={styles.centsValor}>
            {notaActual ? `${notaActual.cents > 0 ? '+' : ''}${notaActual.cents} cents` : '--'}
          </p>
        </div>

        {/* Frecuencia detectada */}
        <div className={styles.frecuenciaInfo}>
          <span className={styles.frecuenciaLabel}>Frecuencia:</span>
          <span className={styles.frecuenciaValor}>
            {frecuenciaDetectada ? `${frecuenciaDetectada.toFixed(1)} Hz` : '-- Hz'}
          </span>
        </div>

        {/* Estado de afinación */}
        {estado && (
          <div className={`${styles.estadoAfinacion} ${styles[estado]}`}>
            {estado === 'afinado' && '✓ Afinado'}
            {estado === 'bajo' && '↓ Subir tensión'}
            {estado === 'alto' && '↑ Bajar tensión'}
          </div>
        )}

        {/* Botón de escucha */}
        {permisoMicrofono === 'denied' ? (
          <div className={styles.errorPermiso}>
            <p>Permiso de micrófono denegado</p>
            <p className={styles.errorSubtexto}>Activa el micrófono en la configuración del navegador</p>
          </div>
        ) : (
          <button
            className={`${styles.btnEscuchar} ${escuchando ? styles.activo : ''}`}
            onClick={escuchando ? detenerEscucha : iniciarEscucha}
          >
            <span className={styles.btnIcono}>{escuchando ? '🎤' : '🎙️'}</span>
            <span>{escuchando ? 'Detener' : 'Iniciar afinador'}</span>
          </button>
        )}
      </div>

      {/* Selección de instrumento */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Instrumento</h3>
        <div className={styles.instrumentosGrid}>
          {INSTRUMENTOS.map((inst, idx) => (
            <button
              key={inst.nombre}
              className={`${styles.instrumentoBtn} ${instrumentoSeleccionado === idx ? styles.instrumentoActivo : ''}`}
              onClick={() => setInstrumentoSeleccionado(idx)}
            >
              {inst.nombre}
            </button>
          ))}
        </div>

        {/* Cuerdas del instrumento */}
        <div className={styles.cuerdasGrid}>
          {instrumento.cuerdas.map((cuerda, idx) => (
            <div key={idx} className={styles.cuerdaItem}>
              <span className={styles.cuerdaNumero}>{idx + 1}</span>
              <span className={styles.cuerdaNota}>{cuerda.nota}{cuerda.octava}</span>
              <span className={styles.cuerdaFrec}>{cuerda.frecuencia.toFixed(1)} Hz</span>
            </div>
          ))}
        </div>
      </div>

      {/* Referencia A4 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Frecuencia de referencia (La4)</h3>
        <div className={styles.referenciaControl}>
          <button
            className={styles.btnReferencia}
            onClick={() => setA4Referencia(Math.max(420, a4Referencia - 1))}
          >
            −
          </button>
          <span className={styles.referenciaValor}>{a4Referencia} Hz</span>
          <button
            className={styles.btnReferencia}
            onClick={() => setA4Referencia(Math.min(460, a4Referencia + 1))}
          >
            +
          </button>
        </div>
        <div className={styles.referenciasPreset}>
          <button onClick={() => setA4Referencia(440)} className={a4Referencia === 440 ? styles.presetActivo : ''}>440 Hz (Estándar)</button>
          <button onClick={() => setA4Referencia(442)} className={a4Referencia === 442 ? styles.presetActivo : ''}>442 Hz (Orquesta)</button>
          <button onClick={() => setA4Referencia(432)} className={a4Referencia === 432 ? styles.presetActivo : ''}>432 Hz</button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className={styles.instrucciones}>
        <h3>Cómo usar el afinador</h3>
        <ol>
          <li>Pulsa "Iniciar afinador" y permite el acceso al micrófono</li>
          <li>Toca una cuerda de tu instrumento cerca del micrófono</li>
          <li>Ajusta la tensión hasta que el indicador esté en el centro (verde)</li>
          <li>Repite con cada cuerda</li>
        </ol>
      </div>

      <RelatedApps apps={getRelatedApps('afinador-instrumentos')} />
      <Footer appName="afinador-instrumentos" />
    </div>
  );
}
