'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorOndasInterferencia.module.css';

type Tab = 'viajera' | 'interferencia' | 'estacionaria';
type CondicionFrontera = 'fija-fija' | 'fija-libre' | 'tubo-abierto' | 'tubo-cerrado';
type PresetInterferencia = 'fase' | 'opuestas' | 'mismo-punto' | null;

// =============================
// Helpers compartidos
// =============================

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Mapea valor en [-1, 1] a color rojo-blanco-azul
function valueToColor(v: number): string {
  const t = clamp(v, -1, 1);
  if (t >= 0) {
    // 0 -> blanco, 1 -> rojo
    const r = 255;
    const g = Math.round(255 * (1 - t));
    const b = Math.round(255 * (1 - t));
    return `rgb(${r},${g},${b})`;
  }
  // 0 -> blanco, -1 -> azul
  const r = Math.round(255 * (1 + t));
  const g = Math.round(255 * (1 + t));
  const b = 255;
  return `rgb(${r},${g},${b})`;
}

// =============================
// TAB 1: Onda viajera
// =============================

interface OndaViajera {
  A: number;
  f: number;
  v: number;
  phi: number;
}

interface DerivadosOnda {
  lambda: number;
  T: number;
  k: number;
  omega: number;
}

function calcularDerivadosOnda(p: OndaViajera): DerivadosOnda {
  const lambda = p.v / Math.max(p.f, 0.0001);
  const T = 1 / Math.max(p.f, 0.0001);
  const k = (2 * Math.PI) / Math.max(lambda, 0.0001);
  const omega = 2 * Math.PI * p.f;
  return { lambda, T, k, omega };
}

interface OndaViajeraSvgProps {
  params: OndaViajera;
  derivados: DerivadosOnda;
  t: number;
}

function OndaViajeraSvg({ params, derivados, t }: OndaViajeraSvgProps) {
  const W = 800;
  const H = 220;
  const yMid = H / 2;
  const yScale = 70; // pixeles por unidad de A
  const xRangeMeters = 10; // metros visibles en el ancho
  const points: string[] = [];
  const N = 240;
  for (let i = 0; i <= N; i++) {
    const xPx = (i / N) * W;
    const xM = (i / N) * xRangeMeters;
    const y = params.A * Math.sin(derivados.k * xM - derivados.omega * t + params.phi);
    const yPx = yMid - y * yScale;
    points.push(`${xPx.toFixed(2)},${yPx.toFixed(2)}`);
  }

  // Marcador de longitud de onda: una franja entre dos crestas
  const lambdaPx = clamp((derivados.lambda / xRangeMeters) * W, 20, W - 20);
  const lambdaStartPx = 60;
  const lambdaEndPx = lambdaStartPx + lambdaPx;

  return (
    <svg
      className={styles.canvasSvg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Onda viajera en el espacio"
    >
      {/* Eje */}
      <line x1={0} y1={yMid} x2={W} y2={yMid} stroke="#cbd5e1" strokeDasharray="4 4" />
      {/* Onda */}
      <polyline points={points.join(' ')} fill="none" stroke="#2E86AB" strokeWidth={2.5} />
      {/* Marcador λ */}
      {lambdaEndPx <= W - 10 && (
        <g>
          <line
            x1={lambdaStartPx}
            y1={H - 30}
            x2={lambdaEndPx}
            y2={H - 30}
            stroke="#dc2626"
            strokeWidth={2}
          />
          <line
            x1={lambdaStartPx}
            y1={H - 35}
            x2={lambdaStartPx}
            y2={H - 25}
            stroke="#dc2626"
            strokeWidth={2}
          />
          <line
            x1={lambdaEndPx}
            y1={H - 35}
            x2={lambdaEndPx}
            y2={H - 25}
            stroke="#dc2626"
            strokeWidth={2}
          />
          <text
            x={(lambdaStartPx + lambdaEndPx) / 2}
            y={H - 12}
            textAnchor="middle"
            fontSize={12}
            fill="#dc2626"
            fontWeight={700}
          >
            λ = {formatNumber(derivados.lambda, 2)} m
          </text>
        </g>
      )}
      {/* Etiqueta amplitud */}
      <line
        x1={20}
        y1={yMid - params.A * yScale}
        x2={20}
        y2={yMid + params.A * yScale}
        stroke="#48A9A6"
        strokeWidth={2}
      />
      <text x={26} y={yMid - params.A * yScale + 12} fontSize={11} fill="#48A9A6" fontWeight={700}>
        2A
      </text>
    </svg>
  );
}

// =============================
// TAB 2: Interferencia 2D
// =============================

interface InterferenciaParams {
  d: number; // separación entre fuentes (m)
  f: number; // frecuencia (Hz)
  A: number; // amplitud (m)
  v: number; // velocidad (m/s)
  deltaPhi: number; // diferencia de fase (rad)
}

interface InterferenciaCanvasProps {
  params: InterferenciaParams;
  t: number;
  showFuentes: boolean;
}

function InterferenciaCanvas({ params, t, showFuentes }: InterferenciaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Dominio físico mostrado: x en [-6, 6] m, y en [0, 8] m (fuentes en la parte de abajo)
    const xMin = -6;
    const xMax = 6;
    const yMin = 0;
    const yMax = 8;

    const lambda = params.v / Math.max(params.f, 0.0001);
    const k = (2 * Math.PI) / Math.max(lambda, 0.0001);
    const omega = 2 * Math.PI * params.f;

    const s1x = -params.d / 2;
    const s1y = 0.5;
    const s2x = params.d / 2;
    const s2y = 0.5;

    const imgData = ctx.createImageData(W, H);
    const buf = imgData.data;

    for (let py = 0; py < H; py++) {
      const yPhys = yMin + ((H - 1 - py) / (H - 1)) * (yMax - yMin);
      for (let px = 0; px < W; px++) {
        const xPhys = xMin + (px / (W - 1)) * (xMax - xMin);
        const r1 = Math.sqrt((xPhys - s1x) ** 2 + (yPhys - s1y) ** 2);
        const r2 = Math.sqrt((xPhys - s2x) ** 2 + (yPhys - s2y) ** 2);
        // Atenuación suave para evitar valores enormes cerca de la fuente
        const att1 = 1 / Math.sqrt(Math.max(r1, 0.3));
        const att2 = 1 / Math.sqrt(Math.max(r2, 0.3));
        const y1 = params.A * att1 * Math.sin(k * r1 - omega * t);
        const y2 = params.A * att2 * Math.sin(k * r2 - omega * t + params.deltaPhi);
        const ySum = y1 + y2;
        // Normalizar a [-1, 1] aprox; A típico 1 → tras suma ~ 2; dividimos por 2A
        const norm = clamp(ySum / (2 * params.A), -1, 1);
        const idx = (py * W + px) * 4;
        if (norm >= 0) {
          buf[idx] = 255;
          buf[idx + 1] = Math.round(255 * (1 - norm));
          buf[idx + 2] = Math.round(255 * (1 - norm));
        } else {
          buf[idx] = Math.round(255 * (1 + norm));
          buf[idx + 1] = Math.round(255 * (1 + norm));
          buf[idx + 2] = 255;
        }
        buf[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Dibuja fuentes
    if (showFuentes) {
      const xToPx = (xv: number): number => ((xv - xMin) / (xMax - xMin)) * W;
      const yToPx = (yv: number): number => H - 1 - ((yv - yMin) / (yMax - yMin)) * H;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(xToPx(s1x), yToPx(s1y), 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(xToPx(s2x), yToPx(s2y), 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText('S₁', xToPx(s1x) - 18, yToPx(s1y) + 4);
      ctx.fillText('S₂', xToPx(s2x) + 10, yToPx(s2y) + 4);
    }
  }, [params, t, showFuentes]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvasInterference}
      width={400}
      height={240}
      aria-label="Mapa 2D de interferencia"
    />
  );
}

// =============================
// TAB 3: Ondas estacionarias
// =============================

interface EstacionariaParams {
  frontera: CondicionFrontera;
  n: number;
  L: number;
  v: number;
  A: number;
}

interface DerivadosEstacionaria {
  fundamental: number;
  fn: number;
  lambdaN: number;
  k: number;
  omega: number;
  armonicos: Array<{ n: number; f: number; lambda: number }>;
  soloImpares: boolean;
}

function calcularDerivadosEstacionaria(p: EstacionariaParams): DerivadosEstacionaria {
  const L = Math.max(p.L, 0.01);
  // Fundamental y frecuencias por modo
  const soloImpares = p.frontera === 'fija-libre' || p.frontera === 'tubo-cerrado';
  let fundamental: number;
  let fn: number;
  let lambdaN: number;
  if (soloImpares) {
    // f_m = (2m-1) * v / (4L). Aquí p.n es el ordinal del modo (1,2,3...)
    fundamental = p.v / (4 * L);
    fn = (2 * p.n - 1) * fundamental;
    lambdaN = (4 * L) / (2 * p.n - 1);
  } else {
    // f_n = n * v / (2L)
    fundamental = p.v / (2 * L);
    fn = p.n * fundamental;
    lambdaN = (2 * L) / p.n;
  }
  const k = (2 * Math.PI) / lambdaN;
  const omega = 2 * Math.PI * fn;

  const armonicos: Array<{ n: number; f: number; lambda: number }> = [];
  for (let i = 1; i <= 5; i++) {
    if (soloImpares) {
      armonicos.push({
        n: 2 * i - 1,
        f: (2 * i - 1) * fundamental,
        lambda: (4 * L) / (2 * i - 1),
      });
    } else {
      armonicos.push({ n: i, f: i * fundamental, lambda: (2 * L) / i });
    }
  }

  return { fundamental, fn, lambdaN, k, omega, armonicos, soloImpares };
}

interface EstacionariaSvgProps {
  params: EstacionariaParams;
  derivados: DerivadosEstacionaria;
  t: number;
}

function EstacionariaSvg({ params, derivados, t }: EstacionariaSvgProps) {
  const W = 800;
  const H = 220;
  const yMid = H / 2;
  const yScale = 70;
  const padX = 30;
  const innerW = W - 2 * padX;
  const L = Math.max(params.L, 0.01);

  // Forma espacial según frontera
  const espacial = (xRel: number): number => {
    // xRel en [0, 1]
    if (params.frontera === 'fija-fija' || params.frontera === 'tubo-abierto') {
      const m = params.n;
      // fija-fija: nodos en extremos, sin(n π x/L)
      // tubo-abierto: antinodos en extremos, cos(n π x/L) (también modos n=1,2,3...)
      if (params.frontera === 'tubo-abierto') {
        return Math.cos(m * Math.PI * xRel);
      }
      return Math.sin(m * Math.PI * xRel);
    }
    // fija-libre / tubo-cerrado: usan (2n-1)
    const m = 2 * params.n - 1;
    if (params.frontera === 'tubo-cerrado') {
      // Antinodo en abierto (x=0) y nodo en cerrado (x=L) → cos((2n-1) π x / 2L)
      return Math.cos((m * Math.PI * xRel) / 2);
    }
    // fija-libre: nodo en x=0, antinodo en x=L → sin((2n-1) π x / 2L)
    return Math.sin((m * Math.PI * xRel) / 2);
  };

  const N = 200;
  const points: string[] = [];
  const tCos = Math.cos(derivados.omega * t);
  for (let i = 0; i <= N; i++) {
    const xRel = i / N;
    const xPx = padX + xRel * innerW;
    const ySpace = espacial(xRel);
    const y = params.A * ySpace * tCos;
    const yPx = yMid - y * yScale;
    points.push(`${xPx.toFixed(2)},${yPx.toFixed(2)}`);
  }

  // Calcular envolventes (positiva y negativa)
  const envelopeUp: string[] = [];
  const envelopeDown: string[] = [];
  for (let i = 0; i <= N; i++) {
    const xRel = i / N;
    const xPx = padX + xRel * innerW;
    const ySpace = espacial(xRel);
    const yMag = Math.abs(params.A * ySpace);
    envelopeUp.push(`${xPx.toFixed(2)},${(yMid - yMag * yScale).toFixed(2)}`);
    envelopeDown.push(`${xPx.toFixed(2)},${(yMid + yMag * yScale).toFixed(2)}`);
  }

  // Detectar nodos y antinodos por muestreo
  const sampleSpace: number[] = [];
  const Nsample = 400;
  for (let i = 0; i <= Nsample; i++) {
    sampleSpace.push(espacial(i / Nsample));
  }

  const nodos: number[] = [];
  const antinodos: number[] = [];
  for (let i = 1; i < sampleSpace.length - 1; i++) {
    const a = sampleSpace[i - 1] ?? 0;
    const b = sampleSpace[i] ?? 0;
    const c = sampleSpace[i + 1] ?? 0;
    if ((a > 0 && c < 0) || (a < 0 && c > 0)) {
      nodos.push(i / Nsample);
    }
    const absA = Math.abs(a);
    const absB = Math.abs(b);
    const absC = Math.abs(c);
    if (absB >= absA && absB >= absC && absB > 0.95) {
      antinodos.push(i / Nsample);
    }
  }
  // Añadir extremos como nodo o antinodo según frontera
  if (params.frontera === 'fija-fija') {
    nodos.unshift(0);
    nodos.push(1);
  } else if (params.frontera === 'tubo-abierto') {
    antinodos.unshift(0);
    antinodos.push(1);
  } else if (params.frontera === 'fija-libre') {
    nodos.unshift(0);
    antinodos.push(1);
  } else if (params.frontera === 'tubo-cerrado') {
    antinodos.unshift(0);
    nodos.push(1);
  }

  return (
    <svg
      className={styles.canvasSvg}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Onda estacionaria"
    >
      {/* Eje */}
      <line
        x1={padX}
        y1={yMid}
        x2={W - padX}
        y2={yMid}
        stroke="#cbd5e1"
        strokeDasharray="4 4"
      />
      {/* Envolventes */}
      <polyline
        points={envelopeUp.join(' ')}
        fill="none"
        stroke="#48A9A6"
        strokeWidth={1.2}
        strokeDasharray="3 3"
        opacity={0.6}
      />
      <polyline
        points={envelopeDown.join(' ')}
        fill="none"
        stroke="#48A9A6"
        strokeWidth={1.2}
        strokeDasharray="3 3"
        opacity={0.6}
      />
      {/* Onda animada */}
      <polyline points={points.join(' ')} fill="none" stroke="#2E86AB" strokeWidth={2.5} />
      {/* Nodos */}
      {nodos.map((xRel, idx) => {
        const xPx = padX + xRel * innerW;
        return (
          <g key={`nodo-${idx}`}>
            <circle cx={xPx} cy={yMid} r={5} fill="#111827" />
            <text
              x={xPx}
              y={yMid + 22}
              textAnchor="middle"
              fontSize={10}
              fill="#111827"
              fontWeight={700}
            >
              N{idx + 1}
            </text>
          </g>
        );
      })}
      {/* Antinodos */}
      {antinodos.map((xRel, idx) => {
        const xPx = padX + xRel * innerW;
        return (
          <g key={`anti-${idx}`}>
            <line
              x1={xPx - 6}
              y1={yMid - 6}
              x2={xPx + 6}
              y2={yMid + 6}
              stroke="#2563eb"
              strokeWidth={2}
            />
            <line
              x1={xPx - 6}
              y1={yMid + 6}
              x2={xPx + 6}
              y2={yMid - 6}
              stroke="#2563eb"
              strokeWidth={2}
            />
            <text
              x={xPx}
              y={yMid - 14}
              textAnchor="middle"
              fontSize={10}
              fill="#2563eb"
              fontWeight={700}
            >
              A{idx + 1}
            </text>
          </g>
        );
      })}
      {/* Soportes según frontera */}
      {/* Tapón izquierdo */}
      {(params.frontera === 'fija-fija' || params.frontera === 'fija-libre') && (
        <line
          x1={padX}
          y1={yMid - 30}
          x2={padX}
          y2={yMid + 30}
          stroke="#374151"
          strokeWidth={4}
        />
      )}
      {(params.frontera === 'fija-fija' || params.frontera === 'tubo-cerrado') && (
        <line
          x1={W - padX}
          y1={yMid - 30}
          x2={W - padX}
          y2={yMid + 30}
          stroke="#374151"
          strokeWidth={4}
        />
      )}
      {/* Borde tubo abierto / extremo libre: marcador discreto */}
      {(params.frontera === 'tubo-abierto' || params.frontera === 'tubo-cerrado') && (
        <text x={padX} y={20} fontSize={10} fill="#6b7280">
          {params.frontera === 'tubo-cerrado' ? 'cerrado' : 'abierto'}
        </text>
      )}
    </svg>
  );
}

// =============================
// Componente principal
// =============================

export default function Page() {
  const [tab, setTab] = useState<Tab>('viajera');

  // ---- TAB 1
  const [ondaParams, setOndaParams] = useState<OndaViajera>({ A: 1, f: 1, v: 4, phi: 0 });
  const ondaDerivados = useMemo(() => calcularDerivadosOnda(ondaParams), [ondaParams]);
  const [tOnda, setTOnda] = useState(0);
  const [pausarOnda, setPausarOnda] = useState(false);

  // ---- TAB 2
  const [interfParams, setInterfParams] = useState<InterferenciaParams>({
    d: 3,
    f: 1.5,
    A: 1,
    v: 4,
    deltaPhi: 0,
  });
  const [presetActivo, setPresetActivo] = useState<PresetInterferencia>(null);
  const [tInterf, setTInterf] = useState(0);
  const [pausarInterf, setPausarInterf] = useState(false);

  // ---- TAB 3
  const [estParams, setEstParams] = useState<EstacionariaParams>({
    frontera: 'fija-fija',
    n: 1,
    L: 1,
    v: 200,
    A: 1,
  });
  const estDerivados = useMemo(() => calcularDerivadosEstacionaria(estParams), [estParams]);
  const [tEst, setTEst] = useState(0);
  const [pausarEst, setPausarEst] = useState(false);

  // Animación global
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (time: number) => {
      const last = lastTimeRef.current ?? time;
      const dt = Math.min(0.05, (time - last) / 1000);
      lastTimeRef.current = time;
      if (!pausarOnda) setTOnda((prev) => prev + dt);
      if (!pausarInterf) setTInterf((prev) => prev + dt);
      if (!pausarEst) {
        // Para estacionarias usamos dt escalado para que se vea bien (omega real puede ser muy alto)
        const factor = Math.min(1, 4 / Math.max(estDerivados.omega, 0.001));
        setTEst((prev) => prev + dt * factor);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [pausarOnda, pausarInterf, pausarEst, estDerivados.omega]);

  // Aplicar presets de interferencia
  const aplicarPreset = useCallback(
    (p: PresetInterferencia) => {
      setPresetActivo(p);
      if (p === 'fase') {
        // Fuentes en fase, d = λ ⇒ d = v/f
        setInterfParams((prev) => ({ ...prev, deltaPhi: 0, d: prev.v / Math.max(prev.f, 0.0001) }));
      } else if (p === 'opuestas') {
        setInterfParams((prev) => ({ ...prev, deltaPhi: Math.PI }));
      } else if (p === 'mismo-punto') {
        setInterfParams((prev) => ({ ...prev, d: 0 }));
      }
    },
    [],
  );

  const updateOnda = (patch: Partial<OndaViajera>) => {
    setOndaParams((prev) => ({ ...prev, ...patch }));
  };

  const updateInterf = (patch: Partial<InterferenciaParams>) => {
    setPresetActivo(null);
    setInterfParams((prev) => ({ ...prev, ...patch }));
  };

  const updateEst = (patch: Partial<EstacionariaParams>) => {
    setEstParams((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Ondas e Interferencia</h1>
        <p>
          Onda viajera, superposición de 2 fuentes y ondas estacionarias en cuerdas y tubos.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <div className={styles.panel}>
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === 'viajera' ? styles.tabActive : ''}`}
              onClick={() => setTab('viajera')}
            >
              Onda viajera
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === 'interferencia' ? styles.tabActive : ''}`}
              onClick={() => setTab('interferencia')}
            >
              Interferencia 2 fuentes
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${tab === 'estacionaria' ? styles.tabActive : ''}`}
              onClick={() => setTab('estacionaria')}
            >
              Ondas estacionarias
            </button>
          </div>

          {/* TAB 1 */}
          {tab === 'viajera' && (
            <div>
              <p className={styles.panelSubtitle}>
                Onda armónica y(x, t) = A · sin(k·x − ω·t + φ). Ajusta los parámetros y observa cómo
                cambian λ, T, k y ω.
              </p>

              <div className={styles.controlsPanel}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="ov-a">
                      Amplitud A <span className={styles.valueBadge}>{formatNumber(ondaParams.A, 2)}</span>
                    </label>
                    <input
                      id="ov-a"
                      type="range"
                      min={0.1}
                      max={2}
                      step={0.05}
                      value={ondaParams.A}
                      onChange={(e) => updateOnda({ A: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="ov-f">
                      Frecuencia f{' '}
                      <span className={styles.valueBadge}>{formatNumber(ondaParams.f, 2)} Hz</span>
                    </label>
                    <input
                      id="ov-f"
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={ondaParams.f}
                      onChange={(e) => updateOnda({ f: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="ov-v">
                      Velocidad v{' '}
                      <span className={styles.valueBadge}>{formatNumber(ondaParams.v, 2)} m/s</span>
                    </label>
                    <input
                      id="ov-v"
                      type="range"
                      min={1}
                      max={10}
                      step={0.1}
                      value={ondaParams.v}
                      onChange={(e) => updateOnda({ v: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="ov-phi">
                      Fase φ{' '}
                      <span className={styles.valueBadge}>
                        {formatNumber(ondaParams.phi, 2)} rad
                      </span>
                    </label>
                    <input
                      id="ov-phi"
                      type="range"
                      min={0}
                      max={2 * Math.PI}
                      step={0.05}
                      value={ondaParams.phi}
                      onChange={(e) => updateOnda({ phi: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.actionBar}>
                <button
                  type="button"
                  className={pausarOnda ? styles.calcBtn : styles.calcBtnSecondary}
                  onClick={() => setPausarOnda((p) => !p)}
                >
                  {pausarOnda ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  type="button"
                  className={styles.calcBtnGhost}
                  onClick={() => setTOnda(0)}
                >
                  Reiniciar tiempo
                </button>
              </div>

              <div className={styles.canvasContainer}>
                <OndaViajeraSvg params={ondaParams} derivados={ondaDerivados} t={tOnda} />
                <div className={styles.legendRow}>
                  <span>Eje horizontal: posición x (10 m visibles)</span>
                  <span>· Eje vertical: desplazamiento y</span>
                </div>
              </div>

              <div className={styles.resultBlock}>
                <h3 className={styles.resultTitle}>Magnitudes derivadas</h3>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Longitud de onda λ = v/f</span>
                  <span className={styles.resultValueAccent}>
                    {formatNumber(ondaDerivados.lambda, 3)} m
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Periodo T = 1/f</span>
                  <span className={styles.resultValue}>
                    {formatNumber(ondaDerivados.T, 3)} s
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Número de onda k = 2π/λ</span>
                  <span className={styles.resultValue}>
                    {formatNumber(ondaDerivados.k, 3)} rad/m
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Frecuencia angular ω = 2π·f</span>
                  <span className={styles.resultValue}>
                    {formatNumber(ondaDerivados.omega, 3)} rad/s
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Tiempo simulado</span>
                  <span className={styles.resultValue}>{formatNumber(tOnda, 2)} s</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 */}
          {tab === 'interferencia' && (
            <div>
              <p className={styles.panelSubtitle}>
                Dos fuentes coherentes S₁ y S₂ emiten ondas con la misma frecuencia. La superposición
                crea zonas de interferencia constructiva (rojo) y destructiva (azul).
              </p>

              <div className={styles.presetsRow}>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${presetActivo === 'fase' ? styles.presetActive : ''}`}
                  onClick={() => aplicarPreset('fase')}
                >
                  Fuentes en fase, d = λ
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${presetActivo === 'opuestas' ? styles.presetActive : ''}`}
                  onClick={() => aplicarPreset('opuestas')}
                >
                  Fuentes opuestas (Δφ = π)
                </button>
                <button
                  type="button"
                  className={`${styles.presetBtn} ${presetActivo === 'mismo-punto' ? styles.presetActive : ''}`}
                  onClick={() => aplicarPreset('mismo-punto')}
                >
                  Mismo punto (d = 0)
                </button>
              </div>

              <div className={styles.controlsPanel}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="if-d">
                      Separación d{' '}
                      <span className={styles.valueBadge}>{formatNumber(interfParams.d, 2)} m</span>
                    </label>
                    <input
                      id="if-d"
                      type="range"
                      min={0}
                      max={10}
                      step={0.1}
                      value={interfParams.d}
                      onChange={(e) => updateInterf({ d: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="if-f">
                      Frecuencia f{' '}
                      <span className={styles.valueBadge}>
                        {formatNumber(interfParams.f, 2)} Hz
                      </span>
                    </label>
                    <input
                      id="if-f"
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={interfParams.f}
                      onChange={(e) => updateInterf({ f: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="if-a">
                      Amplitud A{' '}
                      <span className={styles.valueBadge}>{formatNumber(interfParams.A, 2)}</span>
                    </label>
                    <input
                      id="if-a"
                      type="range"
                      min={0.2}
                      max={2}
                      step={0.05}
                      value={interfParams.A}
                      onChange={(e) => updateInterf({ A: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="if-dphi">
                      Diferencia de fase Δφ{' '}
                      <span className={styles.valueBadge}>
                        {formatNumber(interfParams.deltaPhi, 2)} rad
                      </span>
                    </label>
                    <input
                      id="if-dphi"
                      type="range"
                      min={0}
                      max={2 * Math.PI}
                      step={0.05}
                      value={interfParams.deltaPhi}
                      onChange={(e) => updateInterf({ deltaPhi: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.actionBar}>
                <button
                  type="button"
                  className={pausarInterf ? styles.calcBtn : styles.calcBtnSecondary}
                  onClick={() => setPausarInterf((p) => !p)}
                >
                  {pausarInterf ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  type="button"
                  className={styles.calcBtnGhost}
                  onClick={() => setTInterf(0)}
                >
                  Reiniciar tiempo
                </button>
              </div>

              <div className={styles.canvasContainer}>
                <InterferenciaCanvas params={interfParams} t={tInterf} showFuentes={true} />
                <div className={styles.colorScale}>
                  <span>Valle</span>
                  <div className={styles.colorScaleBar} />
                  <span>Cresta</span>
                </div>
                <div className={styles.legendRow}>
                  <span>
                    <span className={`${styles.legendDot} ${styles.legendDotS1}`} />S₁ (izquierda)
                  </span>
                  <span>
                    <span className={`${styles.legendDot} ${styles.legendDotS2}`} />S₂ (derecha)
                  </span>
                </div>
              </div>

              <div className={styles.resultBlock}>
                <h3 className={styles.resultTitle}>Magnitudes derivadas</h3>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Longitud de onda λ</span>
                  <span className={styles.resultValueAccent}>
                    {formatNumber(interfParams.v / Math.max(interfParams.f, 0.0001), 3)} m
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>d / λ (separación en λ)</span>
                  <span className={styles.resultValue}>
                    {formatNumber(
                      interfParams.d / (interfParams.v / Math.max(interfParams.f, 0.0001)),
                      2,
                    )}
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Tiempo simulado</span>
                  <span className={styles.resultValue}>{formatNumber(tInterf, 2)} s</span>
                </div>
                <div className={styles.warningInline}>
                  Interferencia constructiva: Δr = m·λ + (Δφ/2π)·λ. Destructiva: Δr = (m+½)·λ + (Δφ/2π)·λ.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 */}
          {tab === 'estacionaria' && (
            <div>
              <p className={styles.panelSubtitle}>
                Una onda confinada en un medio finito genera modos normales con frecuencias bien
                definidas. Cambia la condición de frontera y observa los nodos y antinodos.
              </p>

              <div className={styles.fronteraSelector}>
                {(
                  [
                    { id: 'fija-fija', etiqueta: 'Cuerda fija-fija' },
                    { id: 'fija-libre', etiqueta: 'Cuerda fija-libre' },
                    { id: 'tubo-abierto', etiqueta: 'Tubo abierto-abierto' },
                    { id: 'tubo-cerrado', etiqueta: 'Tubo abierto-cerrado' },
                  ] as Array<{ id: CondicionFrontera; etiqueta: string }>
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.fronteraBtn} ${
                      estParams.frontera === item.id ? styles.fronteraActive : ''
                    }`}
                    onClick={() => updateEst({ frontera: item.id })}
                  >
                    {item.etiqueta}
                  </button>
                ))}
              </div>

              <div className={styles.modoControl}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, alignSelf: 'center' }}>
                  Modo n:
                </span>
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.modoBtn} ${estParams.n === m ? styles.modoActive : ''}`}
                    onClick={() => updateEst({ n: m })}
                  >
                    {m}
                  </button>
                ))}
                <span className={styles.armonicoBadge}>
                  {estDerivados.soloImpares
                    ? `Armónico ${2 * estParams.n - 1}`
                    : `Armónico ${estParams.n}`}
                </span>
              </div>

              <div className={styles.controlsPanel}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="es-l">
                      Longitud L{' '}
                      <span className={styles.valueBadge}>{formatNumber(estParams.L, 2)} m</span>
                    </label>
                    <input
                      id="es-l"
                      type="range"
                      min={0.2}
                      max={3}
                      step={0.05}
                      value={estParams.L}
                      onChange={(e) => updateEst({ L: Number(e.target.value) })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="es-v">
                      Velocidad v{' '}
                      <span className={styles.valueBadge}>{formatNumber(estParams.v, 0)} m/s</span>
                    </label>
                    <input
                      id="es-v"
                      type="range"
                      min={20}
                      max={500}
                      step={5}
                      value={estParams.v}
                      onChange={(e) => updateEst({ v: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="es-a">
                      Amplitud A{' '}
                      <span className={styles.valueBadge}>{formatNumber(estParams.A, 2)}</span>
                    </label>
                    <input
                      id="es-a"
                      type="range"
                      min={0.1}
                      max={2}
                      step={0.05}
                      value={estParams.A}
                      onChange={(e) => updateEst({ A: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.actionBar}>
                <button
                  type="button"
                  className={pausarEst ? styles.calcBtn : styles.calcBtnSecondary}
                  onClick={() => setPausarEst((p) => !p)}
                >
                  {pausarEst ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  type="button"
                  className={styles.calcBtnGhost}
                  onClick={() => setTEst(0)}
                >
                  Reiniciar tiempo
                </button>
              </div>

              <div className={styles.canvasContainer}>
                <EstacionariaSvg params={estParams} derivados={estDerivados} t={tEst} />
                <div className={styles.legendRow}>
                  <span>
                    <span className={`${styles.legendDot} ${styles.legendDotNodo}`} />Nodo (N)
                  </span>
                  <span>
                    <span className={`${styles.legendDot} ${styles.legendDotAntinodo}`} />Antinodo
                    (A)
                  </span>
                </div>
              </div>

              <div className={styles.resultBlock}>
                <h3 className={styles.resultTitle}>Modo seleccionado</h3>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Frecuencia fundamental f₁</span>
                  <span className={styles.resultValue}>
                    {formatNumber(estDerivados.fundamental, 2)} Hz
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Frecuencia de este modo</span>
                  <span className={styles.resultValueAccent}>
                    {formatNumber(estDerivados.fn, 2)} Hz
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Longitud de onda λ</span>
                  <span className={styles.resultValue}>
                    {formatNumber(estDerivados.lambdaN, 3)} m
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Tipo de armónicos</span>
                  <span className={styles.resultValue}>
                    {estDerivados.soloImpares ? 'Solo impares (1, 3, 5…)' : 'Todos (1, 2, 3…)'}
                  </span>
                </div>

                <h3 className={styles.resultTitle} style={{ marginTop: '1rem' }}>
                  Primeros 5 armónicos
                </h3>
                <div className={styles.armonicosList}>
                  {estDerivados.armonicos.map((arm) => (
                    <div key={arm.n} className={styles.armonicoItem}>
                      <strong>n = {arm.n}</strong>
                      f = {formatNumber(arm.f, 1)} Hz
                      <br />λ = {formatNumber(arm.lambda, 2)} m
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <EducationalSection
          title="Guía de Ondas e Interferencia"
          subtitle="Onda viajera, superposición y modos normales"
        >
          <h3 className={styles.eduSubtitle}>Magnitudes de una Onda</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>Símbolo</th>
                  <th>Fórmula</th>
                  <th>Unidad</th>
                  <th>Significado físico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Amplitud</td>
                  <td>A</td>
                  <td>—</td>
                  <td>m</td>
                  <td>Máximo desplazamiento desde el equilibrio.</td>
                </tr>
                <tr>
                  <td>Frecuencia</td>
                  <td>f</td>
                  <td>1/T</td>
                  <td>Hz</td>
                  <td>Oscilaciones por segundo en un punto fijo.</td>
                </tr>
                <tr>
                  <td>Periodo</td>
                  <td>T</td>
                  <td>1/f</td>
                  <td>s</td>
                  <td>Tiempo de una oscilación completa.</td>
                </tr>
                <tr>
                  <td>Longitud de onda</td>
                  <td>λ</td>
                  <td>v/f</td>
                  <td>m</td>
                  <td>Distancia entre dos puntos en el mismo estado de oscilación.</td>
                </tr>
                <tr>
                  <td>Velocidad</td>
                  <td>v</td>
                  <td>λ·f</td>
                  <td>m/s</td>
                  <td>Velocidad de propagación de la perturbación.</td>
                </tr>
                <tr>
                  <td>Número de onda</td>
                  <td>k</td>
                  <td>2π/λ</td>
                  <td>rad/m</td>
                  <td>Cuántos radianes de fase hay por metro.</td>
                </tr>
                <tr>
                  <td>Frecuencia angular</td>
                  <td>ω</td>
                  <td>2π·f</td>
                  <td>rad/s</td>
                  <td>Cuántos radianes de fase pasan por segundo.</td>
                </tr>
                <tr>
                  <td>Fase</td>
                  <td>φ</td>
                  <td>k·x − ω·t + φ₀</td>
                  <td>rad</td>
                  <td>Estado del oscilador en un punto y un instante.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de secundaria/bachillerato</h4>
              <p>
                Comprende qué es λ y cómo cambia con la velocidad y la frecuencia. Visualiza la
                diferencia entre onda viajera (se desplaza) y estacionaria (se mantiene en su sitio).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Estudiante universitario de ingeniería acústica</h4>
              <p>
                Diseña salas y cajas acústicas: el modo fundamental y los armónicos en tubos abiertos
                o cerrados explican por qué un instrumento suena como suena.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Músico curioso</h4>
              <p>
                Entiende por qué la guitarra produce armónicos (modos n=1,2,3…) y por qué un clarinete
                (tubo cerrado) suena más grave que una flauta (abierto) de la misma longitud.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesor de física</h4>
              <p>
                Lleva al aula la doble rendija de Young, el patrón de interferencia y la formación
                de modos normales sin necesidad de laboratorio físico.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué dos ondas pueden anularse en algunos puntos?</strong>
              <p>
                Si una onda llega con una cresta y la otra con un valle de la misma amplitud, se
                cancelan instantáneamente: es interferencia destructiva. Esto requiere fuentes
                coherentes (misma frecuencia y diferencia de fase estable).
              </p>
              <p className={styles.faqTip}>
                Tip: en la pestaña interferencia, prueba el preset “Fuentes opuestas”: las líneas
                blancas son nodos donde nunca hay desplazamiento.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué condiciones generan interferencia constructiva?</strong>
              <p>
                Constructiva: la diferencia de camino Δr es múltiplo entero de λ (con fuentes en
                fase). Destructiva: Δr es múltiplo impar de λ/2. Si hay diferencia de fase Δφ, se
                añade el término (Δφ/2π)·λ.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre una onda viajera y una estacionaria?</strong>
              <p>
                La viajera transporta energía y su patrón espacial se desplaza. La estacionaria es la
                superposición de dos ondas viajando en sentidos opuestos: el patrón espacial queda
                fijo y solo varía su amplitud en el tiempo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué un tubo cerrado por un extremo solo tiene armónicos impares?</strong>
              <p>
                En el extremo cerrado el aire no puede moverse (nodo de desplazamiento), y en el
                abierto sí (antinodo). Solo encajan ondas con un cuarto de longitud de onda impar
                dentro del tubo: f_n = (2n-1)·v/(4L).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la doble rendija de Young?</strong>
              <p>
                Es el experimento que demuestra la naturaleza ondulatoria de la luz. Dos rendijas
                separadas se comportan como dos fuentes coherentes, generando un patrón de franjas
                claras y oscuras equivalente al que ves en la pestaña Interferencia.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿La velocidad de una onda depende de su frecuencia?</strong>
              <p>
                En un medio no dispersivo (cuerda ideal, aire en condiciones normales) v solo depende
                del medio: v = √(T/μ) en cuerdas, v ≈ 343 m/s en aire a 20 °C. La frecuencia y la
                longitud de onda se ajustan entre sí para mantener v = λ·f.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo Resolver un Problema de Ondas — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica el tipo de onda</strong>
                <p>
                  ¿Viajera, estacionaria, superposición de dos? ¿En cuerda, aire, agua, electromagnética?
                  Cada caso tiene fórmulas específicas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Apunta los datos conocidos y conviértelos al SI</strong>
                <p>
                  Frecuencia en Hz, longitud en metros, ángulos en radianes. Cuidado con cm vs m y kHz vs Hz.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica la relación fundamental v = λ·f</strong>
                <p>
                  Es la primera ecuación que deberías escribir en cualquier problema de ondas. Te da
                  λ si conoces v y f, o viceversa.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Plantea la condición de frontera o de interferencia</strong>
                <p>
                  En estacionarias: ¿qué hay en cada extremo? En interferencia: ¿cuál es la diferencia
                  de camino Δr y la diferencia de fase Δφ?
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con un caso límite</strong>
                <p>
                  Si haces L muy grande, la fundamental debe bajar. Si la frecuencia se duplica, λ debe
                  reducirse a la mitad. Si Δr = 0, debe haber máximo (siempre que Δφ = 0).
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <div>
                <strong>Trabaja en radianes</strong>
                <p>
                  Las funciones sin/cos del simulador y de física esperan radianes. Si llega un dato en
                  grados, convierte con π/180.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <div>
                <strong>Distingue v, λ y f</strong>
                <p>
                  v depende del medio, f depende de la fuente, λ se calcula con λ = v/f. Cambiar uno
                  cambia los otros.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔁</span>
              <div>
                <strong>Verifica simetrías</strong>
                <p>
                  Si las fuentes están en posiciones simétricas y en fase, el eje central siempre tendrá
                  máximo (Δr = 0).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🪕</span>
              <div>
                <strong>Visualiza nodos y antinodos</strong>
                <p>
                  Los nodos no se mueven; los antinodos oscilan al máximo. Cada modo n tiene n+1 nodos
                  y n antinodos en una cuerda fija-fija.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <div>
                <strong>Cuida las unidades</strong>
                <p>
                  Si v = 343 m/s y f = 440 Hz, entonces λ ≈ 0,78 m, no 78 cm escritos como “78”. Mantén
                  todo en SI.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧪</span>
              <div>
                <strong>Experimenta con presets primero</strong>
                <p>
                  Antes de mover sliders al azar, prueba los presets para ver qué patrón corresponde a
                  cada situación canónica.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              Errores Frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>Confundir longitud de onda λ (espacio) con periodo T (tiempo). λ se mide en m, T en s.</li>
              <li>Calcular sin/cos en grados cuando el simulador y las fórmulas usan radianes.</li>
              <li>
                Sumar dos ondas con frecuencias distintas y esperar un patrón estable: la
                superposición clásica solo da patrones fijos si las fuentes son coherentes.
              </li>
              <li>
                Ignorar la diferencia de fase Δφ: dos ondas en oposición de fase generan nodos donde
                las en fase darían máximos.
              </li>
              <li>
                Confundir nodo (desplazamiento siempre cero) con antinodo (oscilación máxima).
                Aparecen en posiciones distintas.
              </li>
              <li>
                Asumir que la velocidad de la onda depende de la frecuencia. En medios no
                dispersivos, v depende solo del medio.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-ondas-interferencia')} />
        <ShareCard appName="simulador-ondas-interferencia" />
      </main>

      <Footer appName="simulador-ondas-interferencia" />
    </div>
  );
}
