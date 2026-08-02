'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GeneradorRuidoBlanco.module.css';
import {
  MeskeiaLogo,
  Footer,
  RelatedApps,
  LegalNotice,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

type TipoRuido = 'blanco' | 'rosa' | 'marron' | 'azul' | 'violeta';
type Ambiente = 'ninguno' | 'lluvia' | 'oleaje' | 'ventilador' | 'cascada';

interface DefinicionRuido {
  id: TipoRuido;
  nombre: string;
  pendiente: string;
  icono: string;
  descripcion: string;
}

const RUIDOS: DefinicionRuido[] = [
  { id: 'blanco', nombre: 'Blanco', pendiente: '0 dB/octava', icono: '⬜', descripcion: 'Espectro plano. Siseante y brillante, como una radio sin sintonizar.' },
  { id: 'rosa', nombre: 'Rosa', pendiente: '−3 dB/octava', icono: '🌸', descripcion: 'Energía igual por octava. Equilibrado, parecido a la lluvia constante.' },
  { id: 'marron', nombre: 'Marrón', pendiente: '−6 dB/octava', icono: '🟤', descripcion: 'Dominan los graves. Profundo y envolvente, como un oleaje lejano.' },
  { id: 'azul', nombre: 'Azul', pendiente: '+3 dB/octava', icono: '🔵', descripcion: 'Inverso del rosa. Sibilante; se usa en audio técnico y dithering.' },
  { id: 'violeta', nombre: 'Violeta', pendiente: '+6 dB/octava', icono: '🟣', descripcion: 'Inverso del marrón. El más agudo; útil para pruebas de agudos.' },
];

interface DefinicionAmbiente {
  id: Ambiente;
  nombre: string;
  icono: string;
  /** Tipo de ruido base sobre el que se construye el ambiente */
  base: TipoRuido;
  /** Posición del control de tono (0-100) que fija el preset */
  tono: number;
  /** Frecuencia del oscilador de baja frecuencia que da el vaivén (Hz). 0 = sin modulación */
  lfoHz: number;
  /** Profundidad de la modulación sobre el volumen (0-1) */
  lfoProfundidad: number;
  descripcion: string;
}

const AMBIENTES: DefinicionAmbiente[] = [
  { id: 'ninguno', nombre: 'Sin ambiente', icono: '🎛️', base: 'rosa', tono: 70, lfoHz: 0, lfoProfundidad: 0, descripcion: 'Ruido continuo, sin modulación.' },
  { id: 'lluvia', nombre: 'Lluvia', icono: '🌧️', base: 'rosa', tono: 82, lfoHz: 0.25, lfoProfundidad: 0.12, descripcion: 'Rosa con brillo alto y una ondulación suave.' },
  { id: 'oleaje', nombre: 'Oleaje', icono: '🌊', base: 'marron', tono: 45, lfoHz: 0.09, lfoProfundidad: 0.45, descripcion: 'Marrón con vaivén lento de subida y bajada.' },
  { id: 'ventilador', nombre: 'Ventilador', icono: '🌀', base: 'marron', tono: 32, lfoHz: 0, lfoProfundidad: 0, descripcion: 'Marrón apagado y constante, sin variación.' },
  { id: 'cascada', nombre: 'Cascada', icono: '💧', base: 'blanco', tono: 60, lfoHz: 0.5, lfoProfundidad: 0.08, descripcion: 'Blanco filtrado con una agitación rápida y leve.' },
];

const MINUTOS_PRESET = [15, 30, 45, 60, 90];
const FUNDIDOS = [0, 10, 30, 60];

/** Duración del bucle de ruido pregenerado, en segundos. */
const DURACION_BUFFER = 8;
/** Muestras del fundido cruzado que evita el chasquido en el punto de empalme del bucle. */
const MUESTRAS_CROSSFADE = 4096;

/**
 * Rellena un canal con ruido de la pendiente espectral pedida.
 * Blanco = muestras aleatorias; rosa = filtro de Paul Kellett; marrón = integrador con fuga;
 * azul y violeta = derivada del rosa y del blanco respectivamente (+3 y +6 dB/octava).
 */
function rellenarRuido(datos: Float32Array, tipo: TipoRuido): void {
  const n = datos.length;

  if (tipo === 'blanco') {
    for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1;
  } else if (tipo === 'rosa' || tipo === 'azul') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let anterior = 0;
    for (let i = 0; i < n; i++) {
      const blanco = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + blanco * 0.0555179;
      b1 = 0.99332 * b1 + blanco * 0.0750759;
      b2 = 0.969 * b2 + blanco * 0.153852;
      b3 = 0.8665 * b3 + blanco * 0.3104856;
      b4 = 0.55 * b4 + blanco * 0.5329522;
      b5 = -0.7616 * b5 - blanco * 0.016898;
      const rosa = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + blanco * 0.5362) * 0.11;
      b6 = blanco * 0.115926;
      // Derivar el rosa (−3) da +3 dB/octava, que es exactamente el ruido azul
      datos[i] = tipo === 'rosa' ? rosa : rosa - anterior;
      anterior = rosa;
    }
  } else if (tipo === 'marron') {
    let ultimo = 0;
    for (let i = 0; i < n; i++) {
      const blanco = Math.random() * 2 - 1;
      ultimo = (ultimo + 0.02 * blanco) / 1.02;
      datos[i] = ultimo * 3.5;
    }
  } else {
    // Violeta: derivada del blanco (+6 dB/octava)
    let anterior = 0;
    for (let i = 0; i < n; i++) {
      const blanco = Math.random() * 2 - 1;
      datos[i] = blanco - anterior;
      anterior = blanco;
    }
  }

  // Normalizar por pico para que los cinco tipos salgan a un nivel comparable
  let pico = 0;
  for (let i = 0; i < n; i++) {
    const abs = Math.abs(datos[i]);
    if (abs > pico) pico = abs;
  }
  if (pico > 0) {
    const factor = 0.85 / pico;
    for (let i = 0; i < n; i++) datos[i] *= factor;
  }
}

/** Aplica un fundido cruzado circular para que el bucle no chasquee al empalmar. */
function suavizarBucle(datos: Float32Array): void {
  const f = Math.min(MUESTRAS_CROSSFADE, Math.floor(datos.length / 8));
  for (let i = 0; i < f; i++) {
    const t = i / f;
    datos[i] = datos[i] * t + datos[datos.length - f + i] * (1 - t);
  }
}

/** Convierte la posición del control de tono (0-100) en frecuencia de corte, en escala logarítmica. */
function tonoAFrecuencia(tono: number): number {
  const min = Math.log(240);
  const max = Math.log(20000);
  return Math.exp(min + (max - min) * (tono / 100));
}

function formatearTiempo(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = Math.floor(segundos % 60);
  return `${min}:${String(seg).padStart(2, '0')}`;
}

export default function GeneradorRuidoBlancoPage() {
  const [tipo, setTipo] = useState<TipoRuido>('rosa');
  const [ambiente, setAmbiente] = useState<Ambiente>('ninguno');
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(0.25);
  const [tono, setTono] = useState(70);
  const [minutos, setMinutos] = useState(0);
  const [fundido, setFundido] = useState(30);
  const [restante, setRestante] = useState<number | null>(null);
  const [soportado, setSoportado] = useState(true);

  const ctxRef = useRef<AudioContext | null>(null);
  const fuenteRef = useRef<AudioBufferSourceNode | null>(null);
  const filtroRef = useRef<BiquadFilterNode | null>(null);
  const gananciaRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGananciaRef = useRef<GainNode | null>(null);
  const buffersRef = useRef<Map<TipoRuido, AudioBuffer>>(new Map());
  const cuentaAtrasRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('AudioContext' in window)) setSoportado(false);
  }, []);

  const obtenerContexto = useCallback((): AudioContext => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }, []);

  /** Genera (y cachea) el bucle de ruido de un tipo concreto. */
  const obtenerBuffer = useCallback((ctx: AudioContext, cual: TipoRuido): AudioBuffer => {
    const cacheado = buffersRef.current.get(cual);
    if (cacheado) return cacheado;

    const muestras = Math.floor(ctx.sampleRate * DURACION_BUFFER);
    const buffer = ctx.createBuffer(2, muestras, ctx.sampleRate);
    // Dos canales generados por separado: decorrelacionados, el resultado suena más envolvente
    for (let canal = 0; canal < 2; canal++) {
      const datos = buffer.getChannelData(canal);
      rellenarRuido(datos, cual);
      suavizarBucle(datos);
    }
    buffersRef.current.set(cual, buffer);
    return buffer;
  }, []);

  const pararCuentaAtras = useCallback(() => {
    if (cuentaAtrasRef.current) {
      clearInterval(cuentaAtrasRef.current);
      cuentaAtrasRef.current = null;
    }
    setRestante(null);
  }, []);

  const detenerNodos = useCallback(() => {
    const fuente = fuenteRef.current;
    if (fuente) {
      try {
        fuente.stop();
      } catch {
        // La fuente ya estaba detenida
      }
      fuente.disconnect();
      fuenteRef.current = null;
    }
    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
      } catch {
        // El oscilador ya estaba detenido
      }
      lfoRef.current.disconnect();
      lfoRef.current = null;
    }
    lfoGananciaRef.current?.disconnect();
    lfoGananciaRef.current = null;
    filtroRef.current?.disconnect();
    filtroRef.current = null;
    gananciaRef.current?.disconnect();
    gananciaRef.current = null;
  }, []);

  const detener = useCallback(
    (segundosFundido = 0.08) => {
      const ctx = ctxRef.current;
      const ganancia = gananciaRef.current;
      pararCuentaAtras();

      if (!ctx || !ganancia) {
        detenerNodos();
        setReproduciendo(false);
        return;
      }

      const ahora = ctx.currentTime;
      ganancia.gain.cancelScheduledValues(ahora);
      ganancia.gain.setValueAtTime(Math.max(ganancia.gain.value, 0.0001), ahora);
      ganancia.gain.linearRampToValueAtTime(0.0001, ahora + segundosFundido);

      window.setTimeout(() => {
        detenerNodos();
        setReproduciendo(false);
      }, segundosFundido * 1000 + 60);
    },
    [detenerNodos, pararCuentaAtras],
  );

  /** Monta la cadena fuente → filtro de tono → ganancia → salida, con el LFO del ambiente si lo hay. */
  const reproducir = useCallback(() => {
    const ctx = obtenerContexto();
    if (ctx.state === 'suspended') void ctx.resume();

    detenerNodos();
    // Sin esto, cambiar de tipo con el temporizador en marcha dejaría vivo el intervalo anterior
    pararCuentaAtras();

    const preset = AMBIENTES.find((a) => a.id === ambiente)!;
    const tipoEfectivo = ambiente === 'ninguno' ? tipo : preset.base;
    const tonoEfectivo = ambiente === 'ninguno' ? tono : preset.tono;

    const fuente = ctx.createBufferSource();
    fuente.buffer = obtenerBuffer(ctx, tipoEfectivo);
    fuente.loop = true;

    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(tonoAFrecuencia(tonoEfectivo), ctx.currentTime);
    filtro.Q.setValueAtTime(0.7, ctx.currentTime);

    const ganancia = ctx.createGain();
    ganancia.gain.setValueAtTime(0.0001, ctx.currentTime);
    ganancia.gain.linearRampToValueAtTime(volumen, ctx.currentTime + 0.6);

    fuente.connect(filtro);
    filtro.connect(ganancia);
    ganancia.connect(ctx.destination);
    fuente.start();

    // El ambiente añade un oscilador de baja frecuencia que respira sobre el volumen
    if (preset.lfoHz > 0) {
      const lfo = ctx.createOscillator();
      const lfoGanancia = ctx.createGain();
      lfo.frequency.setValueAtTime(preset.lfoHz, ctx.currentTime);
      lfoGanancia.gain.setValueAtTime(volumen * preset.lfoProfundidad, ctx.currentTime);
      lfo.connect(lfoGanancia);
      lfoGanancia.connect(ganancia.gain);
      lfo.start();
      lfoRef.current = lfo;
      lfoGananciaRef.current = lfoGanancia;
    }

    fuenteRef.current = fuente;
    filtroRef.current = filtro;
    gananciaRef.current = ganancia;
    setReproduciendo(true);

    // Temporizador de apagado: cuenta atrás visible y fundido final
    if (minutos > 0) {
      const totalSeg = minutos * 60;
      setRestante(totalSeg);
      const inicio = Date.now();
      cuentaAtrasRef.current = setInterval(() => {
        const transcurrido = Math.floor((Date.now() - inicio) / 1000);
        const quedan = totalSeg - transcurrido;
        if (quedan <= 0) {
          detener(Math.max(fundido, 0.5));
        } else {
          setRestante(quedan);
          // El fundido arranca antes del final para llegar a cero justo al cumplirse el tiempo
          if (fundido > 0 && quedan === fundido && gananciaRef.current && ctxRef.current) {
            const t = ctxRef.current.currentTime;
            gananciaRef.current.gain.cancelScheduledValues(t);
            gananciaRef.current.gain.setValueAtTime(gananciaRef.current.gain.value, t);
            gananciaRef.current.gain.linearRampToValueAtTime(0.0001, t + fundido);
          }
        }
      }, 250);
    }
  }, [ambiente, detener, detenerNodos, fundido, minutos, obtenerBuffer, obtenerContexto, pararCuentaAtras, tipo, tono, volumen]);

  const alternar = () => {
    if (reproduciendo) detener();
    else reproducir();
  };

  // Volumen en caliente. Durante el fundido final no se toca: pisaría la rampa de salida
  useEffect(() => {
    const ctx = ctxRef.current;
    const enFundido = restante !== null && fundido > 0 && restante <= fundido;
    if (reproduciendo && gananciaRef.current && ctx && !enFundido) {
      gananciaRef.current.gain.setTargetAtTime(volumen, ctx.currentTime, 0.05);
    }
    if (lfoGananciaRef.current && ctx) {
      const preset = AMBIENTES.find((a) => a.id === ambiente)!;
      lfoGananciaRef.current.gain.setTargetAtTime(volumen * preset.lfoProfundidad, ctx.currentTime, 0.05);
    }
  }, [volumen, reproduciendo, restante, fundido, ambiente]);

  // Tono en caliente (solo cuando no manda un preset de ambiente)
  useEffect(() => {
    const ctx = ctxRef.current;
    if (filtroRef.current && ctx && ambiente === 'ninguno') {
      filtroRef.current.frequency.setTargetAtTime(tonoAFrecuencia(tono), ctx.currentTime, 0.05);
    }
  }, [tono, ambiente]);

  // Cambiar de tipo o de ambiente mientras suena rehace la cadena
  const cambiarTipo = (nuevo: TipoRuido) => {
    setTipo(nuevo);
    setAmbiente('ninguno');
  };

  const cambiarAmbiente = (nuevo: Ambiente) => {
    setAmbiente(nuevo);
  };

  useEffect(() => {
    if (reproduciendo) reproducir();
    // Solo debe reaccionar al cambio de fuente sonora, no a cada recreación de reproducir()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, ambiente]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (cuentaAtrasRef.current) clearInterval(cuentaAtrasRef.current);
      if (fuenteRef.current) {
        try {
          fuenteRef.current.stop();
        } catch {
          // Ya estaba detenida
        }
      }
      if (lfoRef.current) {
        try {
          lfoRef.current.stop();
        } catch {
          // Ya estaba detenido
        }
      }
      ctxRef.current?.close().catch(() => {
        // El contexto ya estaba cerrado
      });
    };
  }, []);

  const ruidoActual = RUIDOS.find((r) => r.id === (ambiente === 'ninguno' ? tipo : AMBIENTES.find((a) => a.id === ambiente)!.base))!;
  const ambienteActual = AMBIENTES.find((a) => a.id === ambiente)!;
  const frecuenciaCorte = tonoAFrecuencia(ambiente === 'ninguno' ? tono : ambienteActual.tono);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Generador de Ruido Blanco, Rosa y Marrón</h1>
        <p className={styles.subtitle}>
          Cinco tipos de ruido sintetizados en tu navegador, con temporizador de apagado y fundido de salida
        </p>
      </header>

      <LegalNotice />

      {!soportado && (
        <div className={styles.avisoSoporte} role="alert">
          Tu navegador no admite la API Web Audio, así que esta herramienta no puede generar sonido. Prueba con una versión
          reciente de Chrome, Edge, Firefox o Safari.
        </div>
      )}

      {/* Panel principal */}
      <div className={styles.mainPanel}>
        <div className={styles.estadoActual}>
          <span className={styles.estadoIcono} aria-hidden="true">
            {ambiente === 'ninguno' ? ruidoActual.icono : ambienteActual.icono}
          </span>
          <div>
            <p className={styles.estadoNombre}>
              {ambiente === 'ninguno' ? `Ruido ${ruidoActual.nombre.toLowerCase()}` : ambienteActual.nombre}
            </p>
            <p className={styles.estadoDetalle}>
              {ruidoActual.pendiente} · corte a {formatNumber(Math.round(frecuenciaCorte))} Hz
            </p>
          </div>
        </div>

        <div className={styles.controles}>
          <button
            type="button"
            className={`${styles.btnPlay} ${reproduciendo ? styles.activo : ''}`}
            onClick={alternar}
            aria-pressed={reproduciendo}
            disabled={!soportado}
          >
            {reproduciendo ? '⏹️ Detener' : '▶️ Reproducir'}
          </button>
        </div>

        {restante !== null && (
          <p className={styles.cuentaAtras} role="status" aria-live="polite">
            <span aria-hidden="true">⏱️</span> Se apagará en {formatearTiempo(restante)}
            {fundido > 0 && ` · fundido de ${formatNumber(fundido)} s`}
          </p>
        )}

        <div className={styles.volumenControl}>
          <span className={styles.volumenIcon} aria-hidden="true">🔉</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volumen}
            onChange={(e) => setVolumen(parseFloat(e.target.value))}
            className={styles.volumenSlider}
            aria-label="Volumen"
          />
          <span className={styles.volumenValor}>{formatNumber(Math.round(volumen * 100))} %</span>
        </div>
      </div>

      {/* Tipos de ruido */}
      <section className={styles.section} aria-labelledby="tipos-ruido">
        <h2 className={styles.sectionTitle} id="tipos-ruido">
          <span aria-hidden="true">🎚️</span> Tipo de ruido
        </h2>
        <div className={styles.ruidoGrid}>
          {RUIDOS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`${styles.ruidoBtn} ${ambiente === 'ninguno' && tipo === r.id ? styles.ruidoActivo : ''}`}
              onClick={() => cambiarTipo(r.id)}
              aria-pressed={ambiente === 'ninguno' && tipo === r.id}
            >
              <span className={styles.ruidoIcono} aria-hidden="true">{r.icono}</span>
              <span className={styles.ruidoNombre}>{r.nombre}</span>
              <span className={styles.ruidoPendiente}>{r.pendiente}</span>
            </button>
          ))}
        </div>
        <p className={styles.ruidoDescripcion}>{ruidoActual.descripcion}</p>
      </section>

      {/* Control de tono */}
      <section className={styles.section} aria-labelledby="tono-titulo">
        <h2 className={styles.sectionTitle} id="tono-titulo">
          <span aria-hidden="true">🎛️</span> Tono
        </h2>
        <div className={styles.sliderContainer}>
          <span className={styles.sliderLabel}>Apagado</span>
          <input
            type="range"
            min="0"
            max="100"
            value={ambiente === 'ninguno' ? tono : ambienteActual.tono}
            onChange={(e) => setTono(parseInt(e.target.value, 10))}
            className={styles.tonoSlider}
            aria-label="Tono: frecuencia de corte del filtro"
            disabled={ambiente !== 'ninguno'}
          />
          <span className={styles.sliderLabel}>Brillante</span>
        </div>
        <p className={styles.ayuda}>
          {ambiente === 'ninguno'
            ? `Filtro paso bajo a ${formatNumber(Math.round(frecuenciaCorte))} Hz: cuanto más a la izquierda, menos agudos y menos fatiga en sesiones largas.`
            : 'El tono lo fija el ambiente seleccionado. Elige «Sin ambiente» para ajustarlo a mano.'}
        </p>
      </section>

      {/* Ambientes */}
      <section className={styles.section} aria-labelledby="ambientes-titulo">
        <h2 className={styles.sectionTitle} id="ambientes-titulo">
          <span aria-hidden="true">🌦️</span> Ambientes
        </h2>
        <div className={styles.ambienteGrid}>
          {AMBIENTES.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`${styles.ambienteBtn} ${ambiente === a.id ? styles.ambienteActivo : ''}`}
              onClick={() => cambiarAmbiente(a.id)}
              aria-pressed={ambiente === a.id}
            >
              <span className={styles.ambienteIcono} aria-hidden="true">{a.icono}</span>
              <span className={styles.ambienteNombre}>{a.nombre}</span>
            </button>
          ))}
        </div>
        <p className={styles.ayuda}>{ambienteActual.descripcion} No se descarga ningún audio: todo se filtra a partir del ruido.</p>
      </section>

      {/* Temporizador */}
      <section className={styles.section} aria-labelledby="temporizador-titulo">
        <h2 className={styles.sectionTitle} id="temporizador-titulo">
          <span aria-hidden="true">⏱️</span> Temporizador de apagado
        </h2>
        <div className={styles.temporizadorGrid}>
          <button
            type="button"
            className={`${styles.tempBtn} ${minutos === 0 ? styles.tempActivo : ''}`}
            onClick={() => setMinutos(0)}
            aria-pressed={minutos === 0}
          >
            Sin límite
          </button>
          {MINUTOS_PRESET.map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.tempBtn} ${minutos === m ? styles.tempActivo : ''}`}
              onClick={() => setMinutos(m)}
              aria-pressed={minutos === m}
            >
              {formatNumber(m)} min
            </button>
          ))}
        </div>

        <div className={styles.fundidoFila}>
          <span className={styles.fundidoLabel}>Fundido de salida</span>
          <div className={styles.fundidoBotones}>
            {FUNDIDOS.map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.tempBtn} ${fundido === f ? styles.tempActivo : ''}`}
                onClick={() => setFundido(f)}
                aria-pressed={fundido === f}
              >
                {f === 0 ? 'Sin fundido' : `${formatNumber(f)} s`}
              </button>
            ))}
          </div>
        </div>
        <p className={styles.ayuda}>
          El temporizador se aplica al pulsar «Reproducir». Un fundido largo evita el silencio brusco que puede despertar
          justo cuando el sonido desaparece.
        </p>
      </section>

      <DisclaimerCard variant="medical" severity="high" collapsible={false} title="Antes de usarlo durante horas">
        <p>
          Esta herramienta genera sonido de fondo; no es un tratamiento del insomnio, del tinnitus ni de ningún trastorno del
          sueño, y no sustituye la valoración de un profesional sanitario. La exposición prolongada a volumen alto puede dañar
          la audición de forma permanente, y el riesgo es mayor en bebés y niños pequeños. Si tienes acúfenos, hipoacusia,
          problemas de sueño persistentes o usas audífonos o implantes, consulta con tu médico o con un audiólogo antes de
          incorporar el ruido de fondo a tu rutina.
        </p>
      </DisclaimerCard>

      <EducationalSection
        title="Guía del ruido de banda ancha: tipos, usos y precauciones"
        subtitle="Qué distingue al blanco del rosa y del marrón, cuál conviene según lo que quieras tapar y a qué nivel es razonable usarlo"
      >
        <section>
          <h3>
            <span aria-hidden="true">📖</span> Qué es exactamente el «ruido de colores»
          </h3>
          <p>
            El ruido de banda ancha contiene todas las frecuencias audibles a la vez. Lo que distingue a un tipo de otro no es
            qué frecuencias hay, sino <strong>cómo se reparte la energía entre ellas</strong>. Ese reparto se describe con la
            pendiente espectral, medida en decibelios por octava. Un espectro plano —la misma energía en cada hercio— es el
            ruido blanco, y la analogía con la luz blanca (que contiene todo el espectro visible) es la que dio nombre a toda
            la familia.
          </p>
          <p>
            El oído humano no percibe las frecuencias de forma lineal: distingue por octavas, y cada octava sucesiva abarca el
            doble de hercios que la anterior. Por eso el ruido blanco, pese a ser plano en el papel, se oye brillante y
            siseante: la mitad de su energía cae en la última octava. El ruido rosa corrige justo eso al perder 3 dB por
            octava, con lo que reparte la misma energía en cada banda de octava y se percibe equilibrado. El marrón, que
            desciende 6 dB por octava, lleva ese ajuste más lejos y suena grave y envolvente.
          </p>
          <p>
            Esta herramienta <strong>sintetiza el ruido en tu dispositivo</strong> en lugar de reproducir una grabación: genera
            muestras aleatorias y les aplica el filtrado propio de cada pendiente. Por eso no hay descarga previa ni un bucle
            reconocible que delate su repetición, y por eso los ambientes de lluvia u oleaje no son sonidos grabados, sino el
            mismo ruido pasado por un filtro y una modulación lenta.
          </p>

          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Pendiente</th>
                  <th>Cómo se percibe</th>
                  <th>Se parece a</th>
                  <th>Uso habitual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Blanco</strong></td>
                  <td>0 dB/octava</td>
                  <td>Brillante, siseante</td>
                  <td>Radio sin sintonizar</td>
                  <td>Enmascarar voces y agudos; pruebas de audio</td>
                </tr>
                <tr>
                  <td><strong>Rosa</strong></td>
                  <td>−3 dB/octava</td>
                  <td>Equilibrado, natural</td>
                  <td>Lluvia constante</td>
                  <td>Fondo prolongado; calibración de sistemas de sonido</td>
                </tr>
                <tr>
                  <td><strong>Marrón</strong></td>
                  <td>−6 dB/octava</td>
                  <td>Grave, profundo</td>
                  <td>Oleaje o cascada lejana</td>
                  <td>Tapar ruido de baja frecuencia (tráfico, obras)</td>
                </tr>
                <tr>
                  <td><strong>Azul</strong></td>
                  <td>+3 dB/octava</td>
                  <td>Sibilante</td>
                  <td>Escape de aire</td>
                  <td>Dithering en audio digital; medición</td>
                </tr>
                <tr>
                  <td><strong>Violeta</strong></td>
                  <td>+6 dB/octava</td>
                  <td>Muy agudo, penetrante</td>
                  <td>Siseo metálico</td>
                  <td>Pruebas de agudos; algunos protocolos de tinnitus</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">🎯</span> Cuatro formas distintas de usarlo
          </h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon} aria-hidden="true">🏢</span>
              <h4>Oficina abierta o espacio compartido</h4>
              <p>
                Lo que rompe la concentración en un espacio compartido no es el volumen medio, sino la inteligibilidad de las
                conversaciones ajenas. El ruido rosa con el tono en la zona media reduce esa inteligibilidad sin tapar del todo
                el entorno. Empieza bajo: si tienes que subir la voz para hablar, está demasiado alto.
              </p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon} aria-hidden="true">🚗</span>
              <h4>Dormitorio con ruido de calle</h4>
              <p>
                El tráfico, las obras y los golpes en el edificio son ruidos graves. Un fondo agudo no los tapa: lo que compite
                con ellos es el ruido marrón con el tono bajo. Combínalo con el temporizador para no mantener el sonido toda la
                noche cuando la calle ya está tranquila.
              </p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon} aria-hidden="true">📚</span>
              <h4>Estudio y trabajo de fondo</h4>
              <p>
                Para tareas que exigen lenguaje —leer, redactar, programar— un fondo sin palabras interfiere menos que la
                música con letra. Conviene mantenerlo constante: los ambientes con vaivén marcado, como el oleaje, atraen la
                atención cada vez que suben, que es justo lo contrario de lo que buscas aquí.
              </p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon} aria-hidden="true">🔊</span>
              <h4>Ajuste de equipos de sonido</h4>
              <p>
                El ruido rosa es la señal de referencia habitual para nivelar altavoces, porque su energía por banda de octava
                es constante y facilita comparar canales. Es un uso técnico y breve, con el volumen controlado y midiendo, no
                una escucha prolongada.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">❓</span> Preguntas frecuentes
          </h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿El ruido blanco ayuda de verdad a dormir?</summary>
              <p className={styles.eduFaqRespuesta}>
                Su efecto conocido es el <strong>enmascaramiento</strong>: al subir el suelo de ruido de forma constante, los
                sonidos bruscos destacan menos sobre el fondo y por tanto interrumpen menos. Eso no equivale a inducir el
                sueño. Las revisiones sistemáticas publicadas sobre ruido continuo y sueño coinciden en que los estudios son
                pequeños, heterogéneos y de baja calidad metodológica, así que conviene tratarlo como una ayuda ambiental y no
                como un remedio. Si el problema de sueño es persistente, lo que corresponde es una consulta médica.
              </p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuál elijo: blanco, rosa o marrón?</summary>
              <p className={styles.eduFaqRespuesta}>
                Depende de qué quieras tapar, porque el enmascaramiento funciona mejor cuando el fondo y el ruido molesto
                comparten rango. Para voces y sonidos agudos, blanco o rosa. Para tráfico, obras o pisadas del piso de arriba,
                marrón. Como fondo prolongado, el rosa suele resultar el menos fatigoso porque no acumula energía en los
                agudos. La prueba definitiva es tu propio oído: alterna entre los tres con el ruido real de tu entorno de
                fondo.
              </p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Es seguro dejarlo toda la noche?</summary>
              <p className={styles.eduFaqRespuesta}>
                El factor determinante es el nivel, no la duración en sí. Las guías de ruido nocturno de la OMS para Europa
                (2009) sitúan en torno a 30 dB(A) el nivel recomendable dentro del dormitorio, y ese es el orden de magnitud al
                que apuntar: lo justo para enmascarar, no para llenar la habitación. El temporizador con fundido de esta
                herramienta permite además que el sonido acompañe solo la fase de conciliación y luego desaparezca sin un corte
                brusco.
              </p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Puedo usarlo con un bebé?</summary>
              <p className={styles.eduFaqRespuesta}>
                Es un uso extendido, pero exige más cuidado que en un adulto. Un estudio de Hugh y colaboradores publicado en
                Pediatrics (2014) midió catorce máquinas comerciales de ruido para bebés y encontró que todas superaban los
                niveles recomendados para guarderías si se colocaban cerca de la cuna, y que varias pasaban de 85 dB(A) a 30 cm
                en su volumen máximo. Las recomendaciones que se derivan de ese trabajo son colocar la fuente lo más lejos
                posible de la cuna, mantener el volumen bajo y limitar el tiempo. Ante cualquier duda, consúltalo con el
                pediatra.
              </p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Sirve para el tinnitus o acúfenos?</summary>
              <p className={styles.eduFaqRespuesta}>
                El sonido de fondo se emplea dentro de algunos abordajes clínicos del tinnitus, pero siempre como parte de un
                programa dirigido por un profesional, con el tipo, el nivel y la duración ajustados a cada persona. Usar un
                generador por cuenta propia no reproduce ese marco y, mal ajustado, puede resultar contraproducente. Si tienes
                acúfenos, lo indicado es una valoración por un otorrinolaringólogo o un audiólogo.
              </p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Consume datos o hace falta conexión?</summary>
              <p className={styles.eduFaqRespuesta}>
                No. El ruido se sintetiza en el propio dispositivo con la API Web Audio, así que no se descarga ningún archivo
                de sonido ni se transmite nada mientras suena. Una vez cargada la página funciona sin conexión, y tampoco se
                envía información a ningún servidor sobre lo que estás reproduciendo.
              </p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Por qué se apaga cuando bloqueo el móvil?</summary>
              <p className={styles.eduFaqRespuesta}>
                Los navegadores móviles suspenden el audio de una pestaña en segundo plano para ahorrar batería, y algunos
                sistemas la descartan del todo si pasa suficiente tiempo. Para una sesión larga en el móvil, mantén la pantalla
                activa con la página en primer plano, o usa el temporizador para cubrir solo el rato que necesitas.
              </p>
            </details>
          </div>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">📋</span> Cómo ajustarlo en cinco pasos
          </h3>
          <ol className={styles.eduPasosList}>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum} aria-hidden="true">1</span>
              <div>
                <strong>Identifica qué ruido te molesta</strong>
                <p>
                  Antes de tocar nada, escucha el entorno un minuto. ¿Son voces y sonidos agudos, o es tráfico y vibración
                  grave? Esa respuesta decide el tipo de ruido: el enmascaramiento funciona cuando el fondo cubre el mismo
                  rango de frecuencias que la molestia.
                </p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum} aria-hidden="true">2</span>
              <div>
                <strong>Empieza por el rosa y con el volumen bajo</strong>
                <p>
                  El rosa es el punto de partida más neutro. Arranca en torno al 20-25 % de volumen y sube solo si el ruido
                  molesto sigue destacando. La referencia práctica es sencilla: debe seguir siendo cómodo mantener una
                  conversación en tono normal sobre ese fondo.
                </p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum} aria-hidden="true">3</span>
              <div>
                <strong>Ajusta el tono antes que el volumen</strong>
                <p>
                  Si el sonido resulta agresivo, no bajes el volumen: mueve primero el control de tono hacia la izquierda. Al
                  recortar agudos con el filtro paso bajo se reduce la fatiga sin perder capacidad de enmascaramiento en las
                  frecuencias que sí importan.
                </p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum} aria-hidden="true">4</span>
              <div>
                <strong>Elige ambiente solo si el vaivén te ayuda</strong>
                <p>
                  Lluvia, oleaje y cascada añaden una modulación lenta que a unas personas les resulta agradable y a otras las
                  mantiene alerta. Para concentrarte en una tarea de lenguaje, el fondo constante suele rendir mejor; para
                  conciliar el sueño, la ondulación puede resultar más natural.
                </p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum} aria-hidden="true">5</span>
              <div>
                <strong>Programa el apagado con fundido</strong>
                <p>
                  Fija los minutos y un fundido de 30 o 60 segundos antes de pulsar «Reproducir». El sonido bajará
                  progresivamente hasta desaparecer, en lugar de cortarse de golpe. Un corte seco al final es una de las causas
                  más frecuentes de despertar justo cuando el temporizador cumple.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>
            <span aria-hidden="true">💡</span> Buenas prácticas
          </h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono} aria-hidden="true">📏</span>
              <h4>La distancia importa más que el mando</h4>
              <p>
                Alejar la fuente un metro reduce el nivel que te llega mucho más de lo que sugiere el control de volumen.
                Colocar el dispositivo lejos y subir un poco el volumen suele ser preferible a tenerlo junto a la almohada.
              </p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono} aria-hidden="true">🎧</span>
              <h4>Altavoz mejor que auriculares para dormir</h4>
              <p>
                Los auriculares llevan el sonido directamente al conducto auditivo y complican calcular el nivel real, además
                de resultar incómodos durante horas. Para uso nocturno prolongado, un altavoz a distancia es la opción más
                razonable.
              </p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono} aria-hidden="true">🔇</span>
              <h4>Menos volumen del que crees necesitar</h4>
              <p>
                El oído se adapta en pocos minutos, así que la tentación es subir. Ajusta el nivel al empezar y no vuelvas a
                tocarlo: si al cabo de un rato «ya no se oye», normalmente es adaptación, no falta de volumen.
              </p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono} aria-hidden="true">🌡️</span>
              <h4>Antes de nada, revisa lo evidente</h4>
              <p>
                El ruido de fondo tapa sonidos, pero no arregla una habitación demasiado calurosa, con luz o con una ventana
                que filtra. Vale la pena descartar esas causas antes de dar por hecho que el problema es acústico.
              </p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono} aria-hidden="true">🔁</span>
              <h4>Prueba una semana y compara</h4>
              <p>
                La respuesta al sonido de fondo es muy personal: a bastante gente le estorba. Dale unos días y compara con
                noches sin él en lugar de decidir por una sola prueba.
              </p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono} aria-hidden="true">🐾</span>
              <h4>Ten en cuenta a quien convive contigo</h4>
              <p>
                Perros y gatos oyen bastante más arriba que las personas, así que un fondo con muchos agudos puede molestarles
                aunque a ti te resulte suave. Con animales en casa, el rosa o el marrón con el tono bajo son opciones más
                consideradas.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <div>
              <strong>Errores frecuentes al usar ruido de fondo</strong>
              <ul>
                <li>
                  <strong>Subir el volumen hasta no oír nada del exterior.</strong> El enmascaramiento no consiste en tapar el
                  entorno por completo, sino en reducir el contraste entre el fondo y los sonidos bruscos. Llevar el nivel al
                  máximo mantiene una exposición sostenida durante horas sin ganar nada a cambio.
                </li>
                <li>
                  <strong>Colocar el altavoz junto a la cabeza o a la cuna.</strong> A pocos centímetros, el nivel que llega al
                  oído es muy superior al que se percibe desde el otro extremo de la habitación. Es el error que documentó el
                  trabajo de Hugh y colaboradores (Pediatrics, 2014) en máquinas de ruido para bebés.
                </li>
                <li>
                  <strong>Elegir el tipo por su nombre y no por el ruido a tapar.</strong> «Ruido blanco» se ha convertido en
                  el nombre genérico de todos, pero es el más agudo de los tres habituales y el peor para enmascarar tráfico.
                  Si lo que molesta es grave, el marrón rinde mucho más.
                </li>
                <li>
                  <strong>Usarlo como sustituto de una consulta.</strong> Un insomnio que se mantiene semanas, unos acúfenos
                  nuevos o una sensación de oír peor son motivos para acudir a un profesional. El sonido de fondo puede
                  enmascarar el síntoma y retrasar el diagnóstico.
                </li>
                <li>
                  <strong>Dejar el fundido en cero.</strong> Un corte seco de sonido en mitad de la noche es un cambio brusco
                  en el entorno acústico, exactamente lo que se pretendía evitar. Treinta segundos de fundido cuestan poco y
                  ahorran ese sobresalto.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-ruido-blanco')} />
      <ShareCard appName="generador-ruido-blanco" />
      <Footer appName="generador-ruido-blanco" />
    </div>
  );
}
