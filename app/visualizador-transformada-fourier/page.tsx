'use client';
// @disclaimer: exempt

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './TransformadaFourier.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Componente {
  id: number;
  frecuencia: number;
  amplitud: number;
  color: string;
}

interface SenalPreset {
  id: string;
  nombre: string;
  descripcion: string;
  calcularAmplitud: (n: number) => number;
  frecuenciaBase: number;
}

// ─────────────────────────────────────────────
// Señales preconfiguradas (Series de Fourier)
// ─────────────────────────────────────────────

const PRESETS: SenalPreset[] = [
  {
    id: 'cuadrada',
    nombre: 'Onda cuadrada',
    descripcion: 'Solo armónicos impares: 4/π · (sen(x) + sen(3x)/3 + sen(5x)/5 + ...)',
    calcularAmplitud: (n) => (n % 2 === 1 ? (4 / (Math.PI * n)) : 0),
    frecuenciaBase: 1,
  },
  {
    id: 'sierra',
    nombre: 'Diente de sierra',
    descripcion: 'Todos los armónicos: 2/π · (sen(x) − sen(2x)/2 + sen(3x)/3 − ...)',
    calcularAmplitud: (n) => (2 / (Math.PI * n)) * (n % 2 === 0 ? -1 : 1),
    frecuenciaBase: 1,
  },
  {
    id: 'triangular',
    nombre: 'Onda triangular',
    descripcion: 'Armónicos impares con caída rápida: 8/π² · (sen(x) − sen(3x)/9 + sen(5x)/25 − ...)',
    calcularAmplitud: (n) => {
      if (n % 2 === 0) return 0;
      const signo = Math.floor((n - 1) / 2) % 2 === 0 ? 1 : -1;
      return signo * (8 / (Math.PI * Math.PI * n * n));
    },
    frecuenciaBase: 1,
  },
];

const COLORES_COMPONENTES = ['#2E86AB', '#48A9A6', '#E8A838', '#E84A5F', '#7FB3D3'];

// ─────────────────────────────────────────────
// Hook: canvas de síntesis de señal
// ─────────────────────────────────────────────

function useSintesisCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  componentes: Componente[]
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const midY = H / 2;
    const pasos = W;

    ctx.clearRect(0, 0, W, H);

    // Fondo
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, W, H);

    // Línea central
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(W, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dibujar cada componente individual
    componentes.forEach((comp) => {
      ctx.strokeStyle = comp.color;
      ctx.lineWidth = 1.2;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      for (let x = 0; x <= pasos; x++) {
        const t = (x / pasos) * 2 * Math.PI;
        const y = midY - comp.amplitud * (H * 0.38) * Math.sin(comp.frecuencia * t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Señal compuesta
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= pasos; x++) {
      const t = (x / pasos) * 2 * Math.PI;
      const y =
        midY -
        componentes.reduce((sum, comp) => {
          return sum + comp.amplitud * (H * 0.38) * Math.sin(comp.frecuencia * t);
        }, 0);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [componentes, canvasRef]);
}

// ─────────────────────────────────────────────
// Hook: canvas de epiciclos animados
// ─────────────────────────────────────────────

function useEpicyclosCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  activo: boolean
) {
  const rafRef = useRef<number>(0);
  const tRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activo) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    // Epiciclos para onda cuadrada: armónicos impares
    const armonicos = [1, 3, 5, 7, 9];
    const radiosBase = 70;
    const historial: { x: number; y: number }[] = [];
    const maxHistorial = W;

    const dibujarFrame = () => {
      ctx.clearRect(0, 0, W, H);

      // Fondo oscuro suave
      ctx.fillStyle = '#0F1923';
      ctx.fillRect(0, 0, W, H);

      const cx = H / 2;
      const cy = H / 2;
      let x = cx;
      let y = cy;

      // Dibujar cada epiciclo
      armonicos.forEach((n, i) => {
        const radio = (radiosBase / n) * (i === 0 ? 1 : 1);
        const velocidad = n * tRef.current;

        // Círculo del epiciclo
        ctx.strokeStyle = `rgba(127, 179, 211, 0.35)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radio, 0, 2 * Math.PI);
        ctx.stroke();

        const nx = x + radio * Math.cos(velocidad - Math.PI / 2);
        const ny = y + radio * Math.sin(velocidad - Math.PI / 2);

        // Radio del epiciclo (brazo)
        ctx.strokeStyle = '#48A9A6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        // Punto del brazo
        ctx.fillStyle = '#2E86AB';
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, 2 * Math.PI);
        ctx.fill();

        x = nx;
        y = ny;
      });

      // Punto final (punta del último epiciclo)
      ctx.fillStyle = '#E8A838';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Línea horizontal al historial
      ctx.strokeStyle = 'rgba(127, 179, 211, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(H + (historial.length > 0 ? W - historial.length : 0), y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Añadir punto al historial (señal resultante)
      historial.unshift({ x: H, y });
      if (historial.length > maxHistorial - H) historial.pop();

      // Dibujar señal resultante
      ctx.strokeStyle = '#E8A838';
      ctx.lineWidth = 2;
      ctx.beginPath();
      historial.forEach((pt, i) => {
        const px = H + i;
        const py = pt.y;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      tRef.current += 0.025;
      rafRef.current = requestAnimationFrame(dibujarFrame);
    }

    rafRef.current = requestAnimationFrame(dibujarFrame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activo, canvasRef]);
}

// ─────────────────────────────────────────────
// Subcomponente: Espectro de frecuencias SVG
// ─────────────────────────────────────────────

function EspectroSVG({ componentes }: { componentes: Componente[] }) {
  const maxAmp = Math.max(...componentes.map((c) => Math.abs(c.amplitud)), 0.1);
  const maxFreq = Math.max(...componentes.map((c) => c.frecuencia), 1) + 1;
  const W = 500;
  const H = 160;
  const padLeft = 44;
  const padBottom = 32;
  const padTop = 12;
  const graphW = W - padLeft - 16;
  const graphH = H - padBottom - padTop;

  const barWidth = Math.max(12, graphW / (maxFreq * 2));

  return (
    <div className={styles.espectroWrapper}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.espectroSvg}
        role="img"
        aria-label="Espectro de frecuencias: barras que muestran la amplitud de cada componente sinusoidal"
      >
        {/* Eje Y */}
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={H - padBottom} stroke="#CCCCCC" strokeWidth="1" />
        {/* Eje X */}
        <line x1={padLeft} y1={H - padBottom} x2={W - 8} y2={H - padBottom} stroke="#CCCCCC" strokeWidth="1" />

        {/* Etiqueta eje Y */}
        <text x={8} y={H / 2} textAnchor="middle" fill="#999" fontSize="9" transform={`rotate(-90, 12, ${H / 2})`}>
          Amplitud
        </text>
        {/* Etiqueta eje X */}
        <text x={W / 2 + padLeft / 2} y={H - 4} textAnchor="middle" fill="#999" fontSize="9">
          Frecuencia (Hz)
        </text>

        {/* Etiquetas eje Y (0 y máx) */}
        <text x={padLeft - 4} y={H - padBottom} textAnchor="end" fill="#999" fontSize="8">
          0
        </text>
        <text x={padLeft - 4} y={padTop + 6} textAnchor="end" fill="#999" fontSize="8">
          {maxAmp.toFixed(1)}
        </text>

        {/* Barras del espectro */}
        {componentes.map((comp) => {
          const barH = (Math.abs(comp.amplitud) / maxAmp) * graphH;
          const bx = padLeft + (comp.frecuencia / maxFreq) * graphW - barWidth / 2;
          const by = H - padBottom - barH;
          return (
            <g key={comp.id}>
              <rect
                x={bx}
                y={by}
                width={barWidth}
                height={barH}
                fill={comp.color}
                opacity={0.85}
                rx={3}
              />
              <text
                x={bx + barWidth / 2}
                y={H - padBottom + 11}
                textAnchor="middle"
                fill="#666"
                fontSize="9"
              >
                {comp.frecuencia}Hz
              </text>
              <text
                x={bx + barWidth / 2}
                y={by - 3}
                textAnchor="middle"
                fill={comp.color}
                fontSize="8"
                fontWeight="600"
              >
                {comp.amplitud.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponente: Slider de componente
// ─────────────────────────────────────────────

function ComponenteSlider({
  comp,
  onChange,
  onRemove,
  puedeBorrar,
}: {
  comp: Componente;
  onChange: (id: number, campo: 'frecuencia' | 'amplitud', valor: number) => void;
  onRemove: (id: number) => void;
  puedeBorrar: boolean;
}) {
  return (
    <div className={styles.componenteCard} style={{ borderLeftColor: comp.color }}>
      <div className={styles.componenteHeader}>
        <span className={styles.componenteLabel} style={{ color: comp.color }}>
          Componente {comp.id}
        </span>
        {puedeBorrar && (
          <button
            type="button"
            className={styles.btnBorrar}
            onClick={() => onRemove(comp.id)}
            aria-label={`Eliminar componente ${comp.id}`}
          >
            ✕
          </button>
        )}
      </div>
      <div className={styles.sliderFila}>
        <label className={styles.sliderLabel}>
          Frecuencia: <strong>{comp.frecuencia} Hz</strong>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={comp.frecuencia}
          onChange={(e) => onChange(comp.id, 'frecuencia', Number(e.target.value))}
          className={styles.slider}
          style={{ accentColor: comp.color }}
          aria-label={`Frecuencia de componente ${comp.id}`}
        />
      </div>
      <div className={styles.sliderFila}>
        <label className={styles.sliderLabel}>
          Amplitud: <strong>{comp.amplitud.toFixed(1)}</strong>
        </label>
        <input
          type="range"
          min={0.1}
          max={1}
          step={0.1}
          value={comp.amplitud}
          onChange={(e) => onChange(comp.id, 'amplitud', Number(e.target.value))}
          className={styles.slider}
          style={{ accentColor: comp.color }}
          aria-label={`Amplitud de componente ${comp.id}`}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────

export default function TransformadaFourierPage() {
  // Estado: componentes de síntesis
  const [componentes, setComponentes] = useState<Componente[]>([
    { id: 1, frecuencia: 1, amplitud: 0.8, color: COLORES_COMPONENTES[0] },
    { id: 2, frecuencia: 3, amplitud: 0.3, color: COLORES_COMPONENTES[1] },
    { id: 3, frecuencia: 5, amplitud: 0.15, color: COLORES_COMPONENTES[2] },
  ]);
  const [nextId, setNextId] = useState(4);
  const [presetActivo, setPresetActivo] = useState<string | null>(null);
  const [numArmonicos, setNumArmonicos] = useState(5);
  const [epiciclosActivos, setEpiciclosActivos] = useState(false);
  const [tabAplicacion, setTabAplicacion] = useState<'mp3' | 'jpeg' | 'ecg' | 'sismologia'>('mp3');

  const canvasSintesisRef = useRef<HTMLCanvasElement>(null);
  const canvasEpiciclosRef = useRef<HTMLCanvasElement>(null);

  // Síntesis de señal en canvas
  useSintesisCanvas(canvasSintesisRef, componentes);

  // Epiciclos animados
  useEpicyclosCanvas(canvasEpiciclosRef, epiciclosActivos);

  // Cambiar componente
  const handleCambioComponente = useCallback(
    (id: number, campo: 'frecuencia' | 'amplitud', valor: number) => {
      setComponentes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [campo]: valor } : c))
      );
      setPresetActivo(null);
    },
    []
  );

  // Añadir componente
  const handleAnadirComponente = useCallback(() => {
    if (componentes.length >= 5) return;
    setComponentes((prev) => [
      ...prev,
      {
        id: nextId,
        frecuencia: nextId,
        amplitud: 0.2,
        color: COLORES_COMPONENTES[prev.length % COLORES_COMPONENTES.length],
      },
    ]);
    setNextId((n) => n + 1);
    setPresetActivo(null);
  }, [componentes.length, nextId]);

  // Eliminar componente
  const handleEliminarComponente = useCallback((id: number) => {
    setComponentes((prev) => prev.filter((c) => c.id !== id));
    setPresetActivo(null);
  }, []);

  // Cargar preset
  const handleCargarPreset = useCallback(
    (preset: SenalPreset) => {
      const nuevos: Componente[] = [];
      for (let n = 1; n <= numArmonicos; n++) {
        const amp = Math.abs(preset.calcularAmplitud(n));
        if (amp > 0.001) {
          nuevos.push({
            id: n,
            frecuencia: n * preset.frecuenciaBase,
            amplitud: Math.min(1, amp),
            color: COLORES_COMPONENTES[(nuevos.length) % COLORES_COMPONENTES.length],
          });
        }
        if (nuevos.length >= 5) break;
      }
      setComponentes(nuevos);
      setNextId(Math.max(...nuevos.map((c) => c.id)) + 1);
      setPresetActivo(preset.id);
    },
    [numArmonicos]
  );

  // Aplicaciones reales
  const APLICACIONES = {
    mp3: {
      titulo: 'Compresión de audio MP3',
      icono: '🎵',
      descripcion:
        'El formato MP3 aplica la transformada de Fourier (y su variante MDCT) a bloques de audio de 26 ms. Identifica las frecuencias presentes y elimina las que el oído humano no puede percibir (enmascaramiento psicoacústico). Resultado: archivos 10× más pequeños sin pérdida perceptible.',
      dato: 'El oído humano no puede distinguir un sonido suave si otro más fuerte está en la misma frecuencia. El MP3 explota esto.',
      color: '#E8A838',
    },
    jpeg: {
      titulo: 'Compresión de imágenes JPEG',
      icono: '🖼️',
      descripcion:
        'JPEG divide la imagen en bloques de 8×8 píxeles y aplica la Transformada Coseno Discreta (DCT, prima hermana de Fourier). Convierte variaciones de color en coeficientes de frecuencia: guarda las frecuencias bajas (contornos) con precisión y descarta las altas (detalles finos). Cada nivel de calidad decide cuánto descartar.',
      dato: 'Una imagen a "calidad 50" en JPEG puede ser 20× más pequeña que la original sin perder los contornos principales.',
      color: '#48A9A6',
    },
    ecg: {
      titulo: 'Electrocardiograma (ECG)',
      icono: '❤️',
      descripcion:
        'El ritmo cardíaco normal tiene frecuencias características: el intervalo QRS (contracción ventricular) ocurre a ~1 Hz con picos de ~20 Hz. Un cardiólogo aplica análisis de Fourier para separar el ritmo cardíaco del ruido eléctrico muscular y detectar arritmias como la fibrilación auricular (señal irregular, espectro caótico).',
      dato: 'La fibrilación auricular produce un espectro de Fourier sin picos definidos. El ritmo sinusal normal tiene un pico dominante limpio.',
      color: '#E84A5F',
    },
    sismologia: {
      titulo: 'Sismología y detección de terremotos',
      icono: '🌍',
      descripcion:
        'Un sismógrafo registra ondas sísmicas que mezclan ondas P (primarias, ~1-10 Hz) y ondas S (secundarias, ~0.1-2 Hz). La transformada de Fourier separa estas componentes, permitiendo determinar la distancia al epicentro y la magnitud del terremoto. También detecta explosiones nucleares subterráneas.',
      dato: 'Las ondas P viajan más rápido que las S. La diferencia de llegada, visible en el espectro, permite localizar el epicentro con precisión kilométrica.',
      color: '#7FB3D3',
    },
  };

  const aplicacionActual = APLICACIONES[tabAplicacion];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Transformada de Fourier</h1>
        <p className={styles.subtitle}>
          Cómo cualquier señal se descompone en sumas de senos · Síntesis interactiva · Espectro · Epiciclos
        </p>
      </header>

      <LegalNotice />

      {/* ─── SECCIÓN 1: SÍNTESIS DE SEÑAL ─── */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Síntesis de señal</h2>
        <p className={styles.seccionTexto}>
          Cada slider controla una onda sinusoidal (frecuencia + amplitud). La curva negra es la <strong>suma de todas</strong> — esto es exactamente lo que hace Fourier, pero al revés: él analiza la suma para encontrar los componentes.
        </p>

        {/* Señales preconfiguradas */}
        <div className={styles.presetArea}>
          <div className={styles.presetHeader}>
            <span className={styles.presetLabel}>Señales predefinidas:</span>
            <div className={styles.presetControls}>
              <label className={styles.armonicosLabel}>
                Armónicos:
                <input
                  type="range"
                  min={2}
                  max={5}
                  step={1}
                  value={numArmonicos}
                  onChange={(e) => setNumArmonicos(Number(e.target.value))}
                  className={styles.sliderSmall}
                  aria-label="Número de armónicos para señales predefinidas"
                />
                <strong>{numArmonicos}</strong>
              </label>
            </div>
          </div>
          <div className={styles.presetBtns}>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`${styles.presetBtn} ${presetActivo === preset.id ? styles.presetBtnActivo : ''}`}
                onClick={() => handleCargarPreset(preset)}
                aria-pressed={presetActivo === preset.id}
              >
                <span className={styles.presetNombre}>{preset.nombre}</span>
                <span className={styles.presetDesc}>{preset.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas de síntesis */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasSintesisRef}
            width={700}
            height={200}
            className={styles.canvas}
            role="img"
            aria-label="Visualización de la síntesis de señal: ondas componentes individuales en color y señal compuesta en negro"
          />
          <div className={styles.canvasLeyenda}>
            {componentes.map((c) => (
              <span key={c.id} className={styles.leyendaItem} style={{ color: c.color }}>
                ● {c.frecuencia}Hz
              </span>
            ))}
            <span className={styles.leyendaItem} style={{ color: '#1A1A1A' }}>
              ● Suma
            </span>
          </div>
        </div>

        {/* Sliders de componentes */}
        <div className={styles.componentesGrid}>
          {componentes.map((comp) => (
            <ComponenteSlider
              key={comp.id}
              comp={comp}
              onChange={handleCambioComponente}
              onRemove={handleEliminarComponente}
              puedeBorrar={componentes.length > 1}
            />
          ))}
        </div>

        {componentes.length < 5 && (
          <button
            type="button"
            className={styles.btnAnadir}
            onClick={handleAnadirComponente}
            aria-label="Añadir componente sinusoidal"
          >
            + Añadir componente
          </button>
        )}
      </section>

      {/* ─── SECCIÓN 2: ESPECTRO DE FRECUENCIAS ─── */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Espectro de frecuencias</h2>
        <p className={styles.seccionTexto}>
          El <strong>espectro</strong> muestra qué frecuencias están presentes y con qué intensidad. Esto es lo que la Transformada de Fourier «ve» cuando analiza una señal: no el tiempo, sino las frecuencias.
        </p>
        <EspectroSVG componentes={componentes} />
        <div className={styles.infoBox}>
          <span className={styles.infoBoxIcon} aria-hidden="true">💡</span>
          <p>
            Prueba a cargar la <strong>onda cuadrada</strong> con 5 armónicos y observa el espectro: solo hay barras en frecuencias impares (1, 3, 5 Hz) con alturas decrecientes — la firma matemática de una onda cuadrada.
          </p>
        </div>
      </section>

      {/* ─── SECCIÓN 3: EPICICLOS ANIMADOS ─── */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Epiciclos: ruedas dentro de ruedas</h2>
        <p className={styles.seccionTexto}>
          Fourier demostró que cualquier señal periódica puede representarse como <strong>círculos que giran dentro de círculos</strong> (epiciclos). El punto en el extremo del último círculo traza la señal. Esta visualización muestra la aproximación de la onda cuadrada con 5 armónicos.
        </p>

        <div className={styles.epiciclosControl}>
          <button
            type="button"
            className={`${styles.btnToggle} ${epiciclosActivos ? styles.btnToggleActivo : ''}`}
            onClick={() => setEpiciclosActivos((v) => !v)}
            aria-pressed={epiciclosActivos}
          >
            {epiciclosActivos ? '⏸ Pausar animación' : '▶ Iniciar epiciclos'}
          </button>
          {!epiciclosActivos && (
            <p className={styles.epiciclosHint}>
              Pulsa para ver los círculos que dibujan la onda cuadrada de Fourier en tiempo real.
            </p>
          )}
        </div>

        <div className={styles.canvasEpiciclosWrapper}>
          <canvas
            ref={canvasEpiciclosRef}
            width={700}
            height={240}
            className={`${styles.canvasEpiciclos} ${epiciclosActivos ? styles.canvasEpiciclosActivo : ''}`}
            role="img"
            aria-label="Animación de epiciclos de Fourier: círculos concéntricos giratorios que generan la onda cuadrada"
          />
          {!epiciclosActivos && (
            <div className={styles.canvasOverlay} aria-hidden="true">
              <span>▶</span>
            </div>
          )}
        </div>

        <div className={styles.epiciclosInfo}>
          <div className={styles.epicicloFila}>
            <span className={styles.epicicloColor} style={{ background: '#7FB3D3' }} aria-hidden="true" />
            <span>Círculo exterior — 1er armónico (frecuencia fundamental)</span>
          </div>
          <div className={styles.epicicloFila}>
            <span className={styles.epicicloColor} style={{ background: '#48A9A6' }} aria-hidden="true" />
            <span>Brazos internos — armónicos 3, 5, 7, 9 (cada vez más pequeños)</span>
          </div>
          <div className={styles.epicicloFila}>
            <span className={styles.epicicloColor} style={{ background: '#E8A838' }} aria-hidden="true" />
            <span>Punto final y señal trazada — la onda cuadrada resultante</span>
          </div>
        </div>
      </section>

      {/* ─── SECCIÓN 4: APLICACIONES REALES ─── */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Aplicaciones reales</h2>
        <p className={styles.seccionTexto}>
          La Transformada de Fourier está en el núcleo de tecnologías que usas cada día — aunque nunca lo veas.
        </p>

        <div className={styles.tabsAplicaciones}>
          {(['mp3', 'jpeg', 'ecg', 'sismologia'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tabAplicacion} ${tabAplicacion === tab ? styles.tabAplicacionActivo : ''}`}
              onClick={() => setTabAplicacion(tab)}
              aria-pressed={tabAplicacion === tab}
            >
              <span aria-hidden="true">{APLICACIONES[tab].icono}</span>
              <span className={styles.tabAplicacionNombre}>{APLICACIONES[tab].titulo}</span>
            </button>
          ))}
        </div>

        <div
          className={styles.aplicacionCard}
          style={{ borderLeftColor: aplicacionActual.color }}
        >
          <div className={styles.aplicacionIcono} aria-hidden="true">
            {aplicacionActual.icono}
          </div>
          <h3 className={styles.aplicacionTitulo}>{aplicacionActual.titulo}</h3>
          <p className={styles.aplicacionTexto}>{aplicacionActual.descripcion}</p>
          <div className={styles.aplicacionDato} style={{ borderColor: aplicacionActual.color }}>
            <span className={styles.aplicacionDatoIcon} aria-hidden="true">💡</span>
            {aplicacionActual.dato}
          </div>
        </div>
      </section>

      {/* ─── SECCIÓN EDUCATIVA v2.0 ─── */}
      <EducationalSection
        title="¿Qué es la Transformada de Fourier?"
        subtitle="De señales a frecuencias: la idea que está en el MP3, JPEG y la RMN"
      >
        <div className={styles.eduContent}>
          <h3 className={styles.eduH3}>La idea central</h3>
          <p>
            En 1807, Jean-Baptiste Joseph Fourier demostró algo sorprendente: <strong>cualquier función periódica puede expresarse como suma de senos y cosenos</strong>. Lo que parecía un truco matemático resultó ser una de las ideas más poderosas de toda la ciencia.
          </p>
          <p>
            La <strong>Transformada de Fourier</strong> es la generalización para señales no periódicas: toma una señal en el dominio del tiempo y la convierte al <em>dominio de las frecuencias</em>. En lugar de preguntarse «¿cuál es el valor en este momento?», pregunta «¿qué frecuencias están presentes y con qué intensidad?».
          </p>

          <h3 className={styles.eduH3}>Serie de Fourier vs Transformada de Fourier</h3>
          <div className={styles.comparativaGrid}>
            <div className={styles.comparativaItem}>
              <strong>Serie de Fourier</strong>
              <p>Para señales <em>periódicas</em> (que se repiten). Produce un número discreto de frecuencias (armónicos). Ejemplo: onda cuadrada, triangular.</p>
            </div>
            <div className={styles.comparativaItem}>
              <strong>Transformada de Fourier</strong>
              <p>Para señales <em>arbitrarias</em> (incluso no periódicas). Produce un espectro continuo. Ejemplo: una grabación de voz.</p>
            </div>
          </div>
          <p>
            En la práctica digital se usa la <strong>Transformada de Fourier Discreta (DFT)</strong> y su versión rápida, la <strong>FFT (Fast Fourier Transform)</strong>, que redujo el tiempo de cálculo de O(n²) a O(n·log n) — un salto histórico en 1965.
          </p>

          <h3 className={styles.eduH3}>¿Por qué Fourier es «la idea más importante de la ciencia moderna»?</h3>
          <p>
            Porque convierte problemas difíciles en el dominio del tiempo en problemas simples en el dominio de las frecuencias. La convolución (operación compleja) se convierte en multiplicación simple. El filtrado de señales se vuelve trivial. La compresión de datos se hace posible.
          </p>
          <ul className={styles.eduLista}>
            <li><strong>Audio:</strong> síntesis, compresión (MP3, AAC), ecualización, reconocimiento de voz</li>
            <li><strong>Imagen:</strong> compresión (JPEG), filtros de imagen, visión por computador</li>
            <li><strong>Telecomunicaciones:</strong> multiplexación (enviar varias señales por el mismo canal), 4G/5G</li>
            <li><strong>Medicina:</strong> RMN (resonancia magnética usa la TF directamente), ECG, EEG</li>
            <li><strong>Astrofísica:</strong> análisis de espectros de luz estelar, detección de pulsares</li>
            <li><strong>Ingeniería estructural:</strong> análisis de vibraciones en puentes y edificios</li>
          </ul>

          <h3 className={styles.eduH3}>Fourier, el matemático</h3>
          <p>
            Joseph Fourier (1768–1830) fue un matemático francés que acompañó a Napoleón a Egipto y luego estudió la conducción del calor. Su trabajo sobre la ecuación de calor le llevó a desarrollar las series que llevan su nombre. La Academia de Ciencias rechazó inicialmente su trabajo por falta de rigor — no tenía la demostración de convergencia. Lagrange, Laplace y Legendre tardaron en aceptarlo. Hoy es uno de los pilares del análisis matemático.
          </p>

          <h3 className={styles.eduH3}>La fórmula</h3>
          <div className={styles.formulaBox}>
            <p className={styles.formulaTitulo}>Transformada de Fourier</p>
            <p className={styles.formula}>F(ω) = ∫₋∞^∞ f(t) · e^(−iωt) dt</p>
            <p className={styles.formulaDesc}>
              Donde <em>f(t)</em> es la señal en el tiempo, <em>F(ω)</em> es el espectro de frecuencias y <em>e^(−iωt) = cos(ωt) − i·sin(ωt)</em> (fórmula de Euler). La integral «mide» cuánto de cada frecuencia ω está presente en la señal.
            </p>
          </div>

          <div className={styles.warningBox}>
            <span className={styles.warningIcon} aria-hidden="true">🎵</span>
            <div>
              <strong>Curiosidad: Fourier hecho utilidad</strong>
              <p>
                El MP3 elimina frecuencias que el oído humano no puede distinguir — Fourier hecho utilidad. El truco psicoacústico: si hay un sonido fuerte a 1000 Hz, el oído no puede percibir sonidos suaves cercanos (enmascaramiento). El MP3 aplica Fourier, identifica estas frecuencias «tapadas» y las borra. El resultado suena igual al original pero ocupa 10 veces menos espacio.
              </p>
            </div>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-transformada-fourier')} />
      <ShareCard appName="visualizador-transformada-fourier" />
      <Footer appName="visualizador-transformada-fourier" />
    </div>
  );
}
