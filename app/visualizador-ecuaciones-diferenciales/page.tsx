'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef } from 'react';
import styles from './EcuacionesDiferenciales.module.css';
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

interface Punto {
  x: number;
  y: number;
}

interface EstadoLV {
  t: number;
  r: number; // conejos
  l: number; // lobos
}

type TabPrincipal = 'campo' | 'lotka' | 'aplicaciones';
type SubtabAplicaciones = 'enfriamiento' | 'rc';

interface OdeDefinicion {
  id: string;
  etiqueta: string;
  fn: (x: number, y: number) => number;
  descripcion: string;
}

interface PropsFlechaSvg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  markerEnd: string;
}

// ─────────────────────────────────────────────
// Constantes y datos
// ─────────────────────────────────────────────

const ODES: OdeDefinicion[] = [
  { id: 'expo_crecimiento', etiqueta: "dy/dx = y", fn: (_x, y) => y, descripcion: "Crecimiento exponencial" },
  { id: 'expo_decaimiento', etiqueta: "dy/dx = −y", fn: (_x, y) => -y, descripcion: "Decaimiento exponencial" },
  { id: 'lineal', etiqueta: "dy/dx = x + y", fn: (x, y) => x + y, descripcion: "ODE lineal no homogénea" },
  { id: 'seno', etiqueta: "dy/dx = sin(x)", fn: (x, _y) => Math.sin(x), descripcion: "Ecuación separable (sin x)" },
  { id: 'cuadratica', etiqueta: "dy/dx = x² − y", fn: (x, y) => x * x - y, descripcion: "Ecuación lineal de primer orden" },
];

const SVG_W = 380;
const SVG_H = 380;
const XMIN = -4;
const XMAX = 4;
const YMIN = -4;
const YMAX = 4;
const GRID_N = 17; // número de flechas por eje

// Mapeo coords matemáticas ↔ SVG
function toSvgX(x: number): number {
  return ((x - XMIN) / (XMAX - XMIN)) * SVG_W;
}
function toSvgY(y: number): number {
  return SVG_H - ((y - YMIN) / (YMAX - YMIN)) * SVG_H;
}

// ─────────────────────────────────────────────
// Cálculo del campo de direcciones
// ─────────────────────────────────────────────

function calcularFlechas(odeFn: (x: number, y: number) => number): PropsFlechaSvg[] {
  const flechas: PropsFlechaSvg[] = [];
  const long = 10; // semilongitud de la flecha en px

  for (let i = 0; i < GRID_N; i++) {
    for (let j = 0; j < GRID_N; j++) {
      const x = XMIN + (i / (GRID_N - 1)) * (XMAX - XMIN);
      const y = YMIN + (j / (GRID_N - 1)) * (YMAX - YMIN);
      let dy = odeFn(x, y);
      if (!isFinite(dy)) dy = 5;
      dy = Math.max(-8, Math.min(8, dy));
      const ang = Math.atan2(-dy, 1); // negativo porque SVG Y va hacia abajo
      const cx = toSvgX(x);
      const cy = toSvgY(y);
      const dx2 = Math.cos(ang) * long;
      const dy2 = Math.sin(ang) * long;
      flechas.push({
        x1: cx - dx2,
        y1: cy - dy2,
        x2: cx + dx2,
        y2: cy + dy2,
        stroke: '#999999',
        strokeWidth: 1,
        markerEnd: 'url(#flecha)',
      });
    }
  }
  return flechas;
}

// ─────────────────────────────────────────────
// Método de Euler para trazar la curva solución
// ─────────────────────────────────────────────

function eulerSolucion(odeFn: (x: number, y: number) => number, y0: number): Punto[] {
  const puntos: Punto[] = [];
  const h = 0.1;
  const pasos = 60;
  let x = 0;
  let y = y0;
  for (let i = 0; i <= pasos; i++) {
    if (y > YMAX + 2 || y < YMIN - 2) break;
    puntos.push({ x, y });
    y = y + h * odeFn(x, y);
    x = x + h;
  }
  return puntos;
}

function puntosAPolyline(puntos: Punto[]): string {
  return puntos
    .map(p => {
      const sx = toSvgX(p.x);
      const sy = toSvgY(p.y);
      return `${sx},${sy}`;
    })
    .join(' ');
}

// ─────────────────────────────────────────────
// Runge-Kutta 4 para Lotka-Volterra
// ─────────────────────────────────────────────

function rk4LV(
  r: number, l: number,
  alpha: number, beta: number, delta: number, gamma: number,
  h: number
): { r: number; l: number } {
  const drdt = (rr: number, ll: number) => alpha * rr - beta * rr * ll;
  const dldt = (rr: number, ll: number) => delta * rr * ll - gamma * ll;

  const k1r = drdt(r, l);
  const k1l = dldt(r, l);
  const k2r = drdt(r + h / 2 * k1r, l + h / 2 * k1l);
  const k2l = dldt(r + h / 2 * k1r, l + h / 2 * k1l);
  const k3r = drdt(r + h / 2 * k2r, l + h / 2 * k2l);
  const k3l = dldt(r + h / 2 * k2r, l + h / 2 * k2l);
  const k4r = drdt(r + h * k3r, l + h * k3l);
  const k4l = dldt(r + h * k3r, l + h * k3l);

  return {
    r: r + (h / 6) * (k1r + 2 * k2r + 2 * k3r + k4r),
    l: l + (h / 6) * (k1l + 2 * k2l + 2 * k3l + k4l),
  };
}

function simularLV(
  r0: number, l0: number,
  alpha: number, beta: number, delta: number, gamma: number,
  pasos: number = 300
): EstadoLV[] {
  const h = 0.1;
  const estados: EstadoLV[] = [{ t: 0, r: r0, l: l0 }];
  let r = r0;
  let l = l0;
  for (let i = 1; i <= pasos; i++) {
    const sig = rk4LV(r, l, alpha, beta, delta, gamma, h);
    r = Math.max(0, sig.r);
    l = Math.max(0, sig.l);
    estados.push({ t: i * h, r, l });
  }
  return estados;
}

// ─────────────────────────────────────────────
// Helpers para SVG de Lotka-Volterra
// ─────────────────────────────────────────────

const LV_W = 380;
const LV_H = 200;
const LV_PAD = 30;

function serieAPolyline(
  valores: number[],
  maxVal: number,
  pasos: number,
  color: string,
  visibles: number
): { puntos: string; color: string } {
  const n = Math.min(visibles, valores.length);
  const puntos = valores
    .slice(0, n)
    .map((v, i) => {
      const px = LV_PAD + ((i / (pasos)) * (LV_W - 2 * LV_PAD));
      const py = LV_H - LV_PAD - ((v / (maxVal || 1)) * (LV_H - 2 * LV_PAD));
      return `${px},${py}`;
    })
    .join(' ');
  return { puntos, color };
}

const FASE_W = 280;
const FASE_H = 280;
const FASE_PAD = 30;

function faseAPolyline(estados: EstadoLV[], maxR: number, maxL: number, visibles: number): string {
  const n = Math.min(visibles, estados.length);
  return estados
    .slice(0, n)
    .map(e => {
      const px = FASE_PAD + ((e.r / (maxR || 1)) * (FASE_W - 2 * FASE_PAD));
      const py = FASE_H - FASE_PAD - ((e.l / (maxL || 1)) * (FASE_H - 2 * FASE_PAD));
      return `${px},${py}`;
    })
    .join(' ');
}

// ─────────────────────────────────────────────
// Componente Tab 1: Campo de Direcciones
// ─────────────────────────────────────────────

function TabCampo() {
  const [odeIdx, setOdeIdx] = useState(0);
  const [y0, setY0] = useState(1);
  const [animando, setAnimando] = useState(false);
  const [puntosVisibles, setPuntosVisibles] = useState(61);
  const animRefCampo = useRef<ReturnType<typeof setInterval> | null>(null);

  const ode = ODES[odeIdx];
  const flechas = calcularFlechas(ode.fn);
  const solucion = eulerSolucion(ode.fn, y0);

  const animar = useCallback(() => {
    if (animando) return;
    setAnimando(true);
    setPuntosVisibles(1);
    let idx = 1;
    animRefCampo.current = setInterval(() => {
      idx++;
      setPuntosVisibles(idx);
      if (idx >= solucion.length) {
        clearInterval(animRefCampo.current!);
        setAnimando(false);
      }
    }, 40);
  }, [animando, solucion.length]);

  const polyline = puntosAPolyline(solucion.slice(0, puntosVisibles));
  const pInicial = solucion[0];

  return (
    <div className={styles.tabContenido}>
      <div className={styles.controlsRow}>
        <div className={styles.controlGrupo}>
          <label className={styles.controlLabel}>Ecuación diferencial</label>
          <select
            className={styles.select}
            value={odeIdx}
            onChange={e => { setOdeIdx(Number(e.target.value)); setPuntosVisibles(61); }}
          >
            {ODES.map((o, i) => (
              <option key={o.id} value={i}>{o.etiqueta}</option>
            ))}
          </select>
          <span className={styles.hint}>{ode.descripcion}</span>
        </div>
        <div className={styles.controlGrupo}>
          <label className={styles.controlLabel}>
            Condición inicial y₀ = <strong>{y0}</strong>
          </label>
          <input
            type="range"
            min="-3" max="3" step="0.5"
            value={y0}
            onChange={e => { setY0(Number(e.target.value)); setPuntosVisibles(61); }}
            className={styles.slider}
          />
        </div>
      </div>

      <div className={styles.svgWrapper}>
        <svg width={SVG_W} height={SVG_H} className={styles.svgField} aria-label="Campo de direcciones">
          <defs>
            <marker id="flecha" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
              <path d="M0,0 L4,2 L0,4 Z" fill="#999999" />
            </marker>
          </defs>
          {/* Cuadrícula de referencia */}
          <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={SVG_H} stroke="#ddd" strokeWidth={1} />
          <line x1={0} y1={toSvgY(0)} x2={SVG_W} y2={toSvgY(0)} stroke="#ddd" strokeWidth={1} />
          {/* Flechas del campo */}
          {flechas.map((f, i) => (
            <line key={i} {...f} />
          ))}
          {/* Curva solución */}
          {solucion.length > 1 && (
            <polyline
              points={polyline}
              fill="none"
              stroke="#2E86AB"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* Punto inicial */}
          {pInicial && (
            <circle
              cx={toSvgX(pInicial.x)}
              cy={toSvgY(pInicial.y)}
              r={5}
              fill="#48A9A6"
              stroke="white"
              strokeWidth={2}
            />
          )}
          {/* Etiquetas de ejes */}
          <text x={toSvgX(XMAX) - 15} y={toSvgY(0) + 15} fontSize={11} fill="#888">x</text>
          <text x={toSvgX(0) + 5} y={toSvgY(YMAX) + 5} fontSize={11} fill="#888">y</text>
        </svg>
      </div>

      <div className={styles.botonRow}>
        <button
          type="button"
          className={styles.btnPrimario}
          onClick={animar}
          disabled={animando}
          aria-label="Animar solución desde la condición inicial"
        >
          {animando ? 'Animando…' : <><span aria-hidden="true">▶</span> Animar solución</>}
        </button>
        <button
          type="button"
          className={styles.btnSecundario}
          onClick={() => setPuntosVisibles(61)}
          aria-label="Mostrar solución completa"
        >
          Mostrar completa
        </button>
      </div>

      <div className={styles.leyenda}>
        <span className={styles.leyendaItem}>
          <span className={styles.dot} style={{ background: '#999' }} /> Campo de pendientes
        </span>
        <span className={styles.leyendaItem}>
          <span className={styles.dot} style={{ background: '#2E86AB' }} /> Solución (Euler, h=0,1)
        </span>
        <span className={styles.leyendaItem}>
          <span className={styles.dot} style={{ background: '#48A9A6' }} /> Condición inicial (0, y₀)
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente Tab 2: Lotka-Volterra
// ─────────────────────────────────────────────

function TabLotkaVolterra() {
  const [alpha, setAlpha] = useState(1.0);
  const [beta, setBeta] = useState(0.1);
  const [delta, setDelta] = useState(0.1);
  const [gamma, setGamma] = useState(1.0);
  const [r0, setR0] = useState(20);
  const [l0, setL0] = useState(5);
  const [visibles, setVisibles] = useState(300);
  const [animando, setAnimando] = useState(false);
  const animRefLV = useRef<ReturnType<typeof setInterval> | null>(null);

  const estados = simularLV(r0, l0, alpha, beta, delta, gamma, 300);
  const maxR = Math.max(...estados.map(e => e.r), 1);
  const maxL = Math.max(...estados.map(e => e.l), 1);
  const pasos = estados.length - 1;

  const serieR = serieAPolyline(estados.map(e => e.r), maxR, pasos, '#2E86AB', visibles);
  const serieL = serieAPolyline(estados.map(e => e.l), maxL, pasos, '#E84A5F', visibles);
  const fase = faseAPolyline(estados, maxR, maxL, visibles);

  // Estimación período: tiempo entre picos de R
  let periodo = '—';
  let lastPico = -1;
  const rVals = estados.map(e => e.r);
  const picos: number[] = [];
  for (let i = 1; i < rVals.length - 1; i++) {
    if (rVals[i] > rVals[i - 1] && rVals[i] > rVals[i + 1]) {
      picos.push(i * 0.1);
      if (lastPico >= 0 && picos.length === 2) {
        periodo = (picos[1] - picos[0]).toFixed(1) + ' unidades de tiempo';
        lastPico = i;
        break;
      }
      lastPico = i;
    }
  }

  const animar = useCallback(() => {
    if (animando) return;
    setAnimando(true);
    setVisibles(1);
    let idx = 1;
    animRefLV.current = setInterval(() => {
      idx += 3;
      setVisibles(idx);
      if (idx >= 300) {
        clearInterval(animRefLV.current!);
        setVisibles(300);
        setAnimando(false);
      }
    }, 30);
  }, [animando]);

  return (
    <div className={styles.tabContenido}>
      <div className={styles.lvGrid}>
        <div className={styles.lvControls}>
          <p className={styles.formulaBox}>
            dR/dt = αR − βRL<br />
            dL/dt = δRL − γL
          </p>

          <div className={styles.sliderGrupo}>
            <label className={styles.controlLabel}>α (crecimiento conejos) = <strong>{alpha.toFixed(2)}</strong></label>
            <input type="range" min="0.5" max="2" step="0.05" value={alpha}
              onChange={e => { setAlpha(Number(e.target.value)); setVisibles(300); }}
              className={styles.slider} />
          </div>
          <div className={styles.sliderGrupo}>
            <label className={styles.controlLabel}>β (eficiencia depredación) = <strong>{beta.toFixed(2)}</strong></label>
            <input type="range" min="0.05" max="0.3" step="0.01" value={beta}
              onChange={e => { setBeta(Number(e.target.value)); setVisibles(300); }}
              className={styles.slider} />
          </div>
          <div className={styles.sliderGrupo}>
            <label className={styles.controlLabel}>δ (conversión de comida) = <strong>{delta.toFixed(2)}</strong></label>
            <input type="range" min="0.05" max="0.3" step="0.01" value={delta}
              onChange={e => { setDelta(Number(e.target.value)); setVisibles(300); }}
              className={styles.slider} />
          </div>
          <div className={styles.sliderGrupo}>
            <label className={styles.controlLabel}>γ (mortalidad lobos) = <strong>{gamma.toFixed(2)}</strong></label>
            <input type="range" min="0.5" max="2" step="0.05" value={gamma}
              onChange={e => { setGamma(Number(e.target.value)); setVisibles(300); }}
              className={styles.slider} />
          </div>
          <div className={styles.sliderGrupo}>
            <label className={styles.controlLabel}>R₀ (conejos iniciales) = <strong>{r0}</strong></label>
            <input type="range" min="5" max="50" step="1" value={r0}
              onChange={e => { setR0(Number(e.target.value)); setVisibles(300); }}
              className={styles.slider} />
          </div>
          <div className={styles.sliderGrupo}>
            <label className={styles.controlLabel}>L₀ (lobos iniciales) = <strong>{l0}</strong></label>
            <input type="range" min="1" max="20" step="1" value={l0}
              onChange={e => { setL0(Number(e.target.value)); setVisibles(300); }}
              className={styles.slider} />
          </div>

          <div className={styles.estadoBox}>
            <span>Período estimado: <strong>{periodo}</strong></span>
          </div>

          <div className={styles.botonRow}>
            <button type="button" className={styles.btnPrimario} onClick={animar} disabled={animando}
              aria-label="Animar simulación Lotka-Volterra">
              {animando ? 'Simulando…' : <><span aria-hidden="true">▶</span> Animar</>}
            </button>
            <button type="button" className={styles.btnSecundario} onClick={() => setVisibles(300)}
              aria-label="Ver resultado completo">
              Ver completo
            </button>
          </div>
        </div>

        <div className={styles.lvGraficas}>
          {/* Series temporales */}
          <p className={styles.graficaTitulo}>Series temporales</p>
          <svg width={LV_W} height={LV_H} className={styles.svgSerie} aria-label="Series temporales de conejos y lobos">
            {/* Ejes */}
            <line x1={LV_PAD} y1={LV_PAD} x2={LV_PAD} y2={LV_H - LV_PAD} stroke="#ccc" strokeWidth={1} />
            <line x1={LV_PAD} y1={LV_H - LV_PAD} x2={LV_W - LV_PAD} y2={LV_H - LV_PAD} stroke="#ccc" strokeWidth={1} />
            <text x={LV_PAD + 4} y={LV_PAD + 10} fontSize={10} fill="#888">Población</text>
            <text x={LV_W - LV_PAD - 10} y={LV_H - LV_PAD + 14} fontSize={10} fill="#888">t</text>
            {/* Líneas */}
            {serieR.puntos && <polyline points={serieR.puntos} fill="none" stroke="#2E86AB" strokeWidth={2} />}
            {serieL.puntos && <polyline points={serieL.puntos} fill="none" stroke="#E84A5F" strokeWidth={2} />}
          </svg>
          <div className={styles.leyenda}>
            <span className={styles.leyendaItem}><span className={styles.dot} style={{ background: '#2E86AB' }} /> Conejos R(t)</span>
            <span className={styles.leyendaItem}><span className={styles.dot} style={{ background: '#E84A5F' }} /> Lobos L(t)</span>
          </div>

          {/* Diagrama de fase */}
          <p className={styles.graficaTitulo} style={{ marginTop: '1rem' }}>Diagrama de fase (R vs L)</p>
          <svg width={FASE_W} height={FASE_H} className={styles.svgFase} aria-label="Diagrama de fase conejos vs lobos">
            <line x1={FASE_PAD} y1={FASE_PAD} x2={FASE_PAD} y2={FASE_H - FASE_PAD} stroke="#ccc" strokeWidth={1} />
            <line x1={FASE_PAD} y1={FASE_H - FASE_PAD} x2={FASE_W - FASE_PAD} y2={FASE_H - FASE_PAD} stroke="#ccc" strokeWidth={1} />
            <text x={FASE_PAD + 4} y={FASE_PAD + 10} fontSize={10} fill="#888">L (lobos)</text>
            <text x={FASE_W - FASE_PAD - 20} y={FASE_H - FASE_PAD + 14} fontSize={10} fill="#888">R (conejos)</text>
            <polyline points={fase} fill="none" stroke="#48A9A6" strokeWidth={2} />
            {/* Punto de equilibrio */}
            {delta > 0 && beta > 0 && (
              <circle
                cx={FASE_PAD + ((gamma / delta) / (maxR || 1)) * (FASE_W - 2 * FASE_PAD)}
                cy={FASE_H - FASE_PAD - ((alpha / beta) / (maxL || 1)) * (FASE_H - 2 * FASE_PAD)}
                r={4} fill="#E84A5F" stroke="white" strokeWidth={1.5}
              />
            )}
          </svg>
          <div className={styles.hint}>
            Trayectoria orbital cerrada — el sistema oscila perpetuamente
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente Tab 3: Aplicaciones
// ─────────────────────────────────────────────

const APL_W = 380;
const APL_H = 200;
const APL_PAD = 35;

function TabAplicaciones() {
  const [subtab, setSubtab] = useState<SubtabAplicaciones>('enfriamiento');

  // Enfriamiento Newton
  const [t0Temp, setT0Temp] = useState(90);
  const [tAmb, setTAmb] = useState(22);
  const [k, setK] = useState(0.05);

  // RC
  const [rKOhm, setRKOhm] = useState(10);
  const [cUF, setCUF] = useState(10);
  const [vFuente, setVFuente] = useState(5);
  const [cargando, setCargando] = useState(true); // carga vs descarga

  // Solución enfriamiento: T(t) = T_amb + (T0-T_amb)*e^(-k*t)
  const T_MAX_S = 60; // segundos máximos
  const puntosEnfriamiento: Punto[] = [];
  for (let ti = 0; ti <= 200; ti++) {
    const t = (ti / 200) * T_MAX_S;
    const temp = tAmb + (t0Temp - tAmb) * Math.exp(-k * t);
    puntosEnfriamiento.push({ x: t, y: temp });
  }
  const maxTEmp = t0Temp;
  const minTEmp = tAmb;
  function toSvgEnfX(t: number) { return APL_PAD + (t / T_MAX_S) * (APL_W - 2 * APL_PAD); }
  function toSvgEnfY(temp: number) {
    const rango = maxTEmp - minTEmp || 1;
    return APL_H - APL_PAD - ((temp - minTEmp) / rango) * (APL_H - 2 * APL_PAD);
  }
  const polyEnf = puntosEnfriamiento.map(p => `${toSvgEnfX(p.x)},${toSvgEnfY(p.y)}`).join(' ');
  // Tiempos 50% y 10%
  const dif = t0Temp - tAmb;
  const t50 = dif > 0 ? Math.log(2) / k : 0;
  const t90 = dif > 0 ? Math.log(10) / k : 0;

  // RC: V_C(t) = V_fuente*(1 - e^(-t/tau)) en carga; V_fuente*e^(-t/tau) en descarga
  const tau = (rKOhm * 1000) * (cUF * 1e-6); // en segundos
  const RC_MAX_S = Math.min(tau * 6, 30);
  const puntosRC: Punto[] = [];
  for (let ti = 0; ti <= 200; ti++) {
    const t = (ti / 200) * RC_MAX_S;
    const v = cargando
      ? vFuente * (1 - Math.exp(-t / tau))
      : vFuente * Math.exp(-t / tau);
    puntosRC.push({ x: t, y: v });
  }
  function toSvgRCx(t: number) { return APL_PAD + (t / (RC_MAX_S || 1)) * (APL_W - 2 * APL_PAD); }
  function toSvgRCy(v: number) { return APL_H - APL_PAD - (v / (vFuente || 1)) * (APL_H - 2 * APL_PAD); }
  const polyRC = puntosRC.map(p => `${toSvgRCx(p.x)},${toSvgRCy(p.y)}`).join(' ');
  const t63 = tau;

  return (
    <div className={styles.tabContenido}>
      {/* Subtabs */}
      <div className={styles.subtabs} role="tablist" aria-label="Aplicaciones">
        <button
          type="button"
          role="tab"
          aria-selected={subtab === 'enfriamiento'}
          className={subtab === 'enfriamiento' ? styles.subtabActivo : styles.subtab}
          onClick={() => setSubtab('enfriamiento')}
        >
          <span aria-hidden="true">☕</span> Enfriamiento Newton
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={subtab === 'rc'}
          className={subtab === 'rc' ? styles.subtabActivo : styles.subtab}
          onClick={() => setSubtab('rc')}
        >
          <span aria-hidden="true">⚡</span> Circuito RC
        </button>
      </div>

      {subtab === 'enfriamiento' && (
        <div className={styles.aplBloque}>
          <p className={styles.formulaBox}>
            dT/dt = −k(T − T<sub>amb</sub>) → T(t) = T<sub>amb</sub> + (T₀ − T<sub>amb</sub>) · e<sup>−kt</sup>
          </p>
          <div className={styles.controlsRow}>
            <div className={styles.sliderGrupo}>
              <label className={styles.controlLabel}>T₀ temperatura inicial = <strong>{t0Temp}°C</strong></label>
              <input type="range" min="30" max="100" step="1" value={t0Temp}
                onChange={e => setT0Temp(Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGrupo}>
              <label className={styles.controlLabel}>T<sub>amb</sub> ambiente = <strong>{tAmb}°C</strong></label>
              <input type="range" min="0" max="40" step="1" value={tAmb}
                onChange={e => setTAmb(Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGrupo}>
              <label className={styles.controlLabel}>k constante de enfriamiento = <strong>{k.toFixed(2)}</strong></label>
              <input type="range" min="0.01" max="0.2" step="0.01" value={k}
                onChange={e => setK(Number(e.target.value))} className={styles.slider} />
            </div>
          </div>
          <svg width={APL_W} height={APL_H} className={styles.svgApl} aria-label="Curva de enfriamiento de Newton">
            <line x1={APL_PAD} y1={APL_PAD} x2={APL_PAD} y2={APL_H - APL_PAD} stroke="#ccc" strokeWidth={1} />
            <line x1={APL_PAD} y1={APL_H - APL_PAD} x2={APL_W - APL_PAD} y2={APL_H - APL_PAD} stroke="#ccc" strokeWidth={1} />
            {/* Línea T_amb */}
            <line x1={APL_PAD} y1={toSvgEnfY(tAmb)} x2={APL_W - APL_PAD} y2={toSvgEnfY(tAmb)}
              stroke="#48A9A6" strokeWidth={1} strokeDasharray="4,3" />
            <text x={APL_W - APL_PAD + 4} y={toSvgEnfY(tAmb) + 4} fontSize={10} fill="#48A9A6">T<tspan dy={3}>amb</tspan></text>
            <polyline points={polyEnf} fill="none" stroke="#2E86AB" strokeWidth={2.5} />
            <text x={APL_PAD + 4} y={APL_PAD + 12} fontSize={10} fill="#888">T (°C)</text>
            <text x={APL_W - APL_PAD - 8} y={APL_H - APL_PAD + 14} fontSize={10} fill="#888">t (s)</text>
          </svg>
          <div className={styles.resultadosGrid}>
            <div className={styles.resultBox}>
              <span className={styles.resultLabel}>Tiempo al 50% de enfriamiento</span>
              <span className={styles.resultValor}>{t50.toFixed(1)} s</span>
            </div>
            <div className={styles.resultBox}>
              <span className={styles.resultLabel}>Tiempo al 90% de enfriamiento</span>
              <span className={styles.resultValor}>{t90.toFixed(1)} s</span>
            </div>
          </div>
          <div className={styles.ejemploBox}>
            <span aria-hidden="true">☕</span> El café empieza a {t0Temp}°C en sala de {tAmb}°C.
            Con k={k.toFixed(2)}, tarda <strong>{t50.toFixed(0)} s</strong> en recorrer
            la mitad de la diferencia de temperatura.
          </div>
        </div>
      )}

      {subtab === 'rc' && (
        <div className={styles.aplBloque}>
          <p className={styles.formulaBox}>
            dV<sub>C</sub>/dt = (V<sub>fuente</sub> − V<sub>C</sub>) / (RC)
            → V<sub>C</sub>(t) = V<sub>f</sub> · (1 − e<sup>−t/τ</sup>)
          </p>
          <div className={styles.controlsRow}>
            <div className={styles.sliderGrupo}>
              <label className={styles.controlLabel}>R resistencia = <strong>{rKOhm} kΩ</strong></label>
              <input type="range" min="1" max="100" step="1" value={rKOhm}
                onChange={e => setRKOhm(Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGrupo}>
              <label className={styles.controlLabel}>C capacidad = <strong>{cUF} μF</strong></label>
              <input type="range" min="1" max="100" step="1" value={cUF}
                onChange={e => setCUF(Number(e.target.value))} className={styles.slider} />
            </div>
            <div className={styles.sliderGrupo}>
              <label className={styles.controlLabel}>V<sub>fuente</sub> = <strong>{vFuente} V</strong></label>
              <input type="range" min="1" max="12" step="0.5" value={vFuente}
                onChange={e => setVFuente(Number(e.target.value))} className={styles.slider} />
            </div>
          </div>
          <div className={styles.modoToggle}>
            <button
              type="button"
              className={cargando ? styles.btnPrimario : styles.btnSecundario}
              onClick={() => setCargando(true)}
              aria-pressed={cargando}
            >Carga</button>
            <button
              type="button"
              className={!cargando ? styles.btnPrimario : styles.btnSecundario}
              onClick={() => setCargando(false)}
              aria-pressed={!cargando}
            >Descarga</button>
          </div>
          <svg width={APL_W} height={APL_H} className={styles.svgApl} aria-label="Gráfica de carga y descarga del circuito RC">
            <line x1={APL_PAD} y1={APL_PAD} x2={APL_PAD} y2={APL_H - APL_PAD} stroke="#ccc" strokeWidth={1} />
            <line x1={APL_PAD} y1={APL_H - APL_PAD} x2={APL_W - APL_PAD} y2={APL_H - APL_PAD} stroke="#ccc" strokeWidth={1} />
            {/* Línea τ */}
            <line x1={toSvgRCx(t63)} y1={APL_PAD} x2={toSvgRCx(t63)} y2={APL_H - APL_PAD}
              stroke="#48A9A6" strokeWidth={1} strokeDasharray="4,3" />
            <text x={toSvgRCx(t63) + 3} y={APL_PAD + 12} fontSize={10} fill="#48A9A6">τ</text>
            <polyline points={polyRC} fill="none" stroke="#2E86AB" strokeWidth={2.5} />
            <text x={APL_PAD + 4} y={APL_PAD + 12} fontSize={10} fill="#888">V (V)</text>
            <text x={APL_W - APL_PAD - 8} y={APL_H - APL_PAD + 14} fontSize={10} fill="#888">t (s)</text>
          </svg>
          <div className={styles.resultadosGrid}>
            <div className={styles.resultBox}>
              <span className={styles.resultLabel}>Constante de tiempo τ = RC</span>
              <span className={styles.resultValor}>{tau.toFixed(3)} s</span>
            </div>
            <div className={styles.resultBox}>
              <span className={styles.resultLabel}>Tiempo al 63% (t = τ)</span>
              <span className={styles.resultValor}>{t63.toFixed(3)} s</span>
            </div>
            <div className={styles.resultBox}>
              <span className={styles.resultLabel}>Carga al 99% (t ≈ 5τ)</span>
              <span className={styles.resultValor}>{(tau * 5).toFixed(3)} s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────

export default function VisualizadorEcuacionesDiferenciales() {
  const [tab, setTab] = useState<TabPrincipal>('campo');

  const TABS: { id: TabPrincipal; label: string; icon: string }[] = [
    { id: 'campo', label: 'Campo de Direcciones', icon: '🗺️' },
    { id: 'lotka', label: 'Lotka-Volterra', icon: '🐰' },
    { id: 'aplicaciones', label: 'Aplicaciones', icon: '⚗️' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">📈</div>
        <h1 className={styles.titulo}>Ecuaciones Diferenciales</h1>
        <p className={styles.subtitulo}>
          Explora ODEs de forma visual e interactiva: campo de direcciones, sistema predador-presa
          animado y aplicaciones reales en ingeniería, biología y física.
        </p>
        <p className={styles.heroNota}>100% visual · Sin instalación · Método de Euler y Runge-Kutta 4</p>
      </header>

      <LegalNotice />

      {/* Tabs de navegación */}
      <div className={styles.tabsNav} role="tablist" aria-label="Secciones del visualizador">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? styles.tabActivo : styles.tabBtn}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <main className={styles.tarjeta} role="tabpanel">
        {tab === 'campo' && <TabCampo />}
        {tab === 'lotka' && <TabLotkaVolterra />}
        {tab === 'aplicaciones' && <TabAplicaciones />}
      </main>

      <EducationalSection
        title="Sobre las Ecuaciones Diferenciales"
        subtitle="De las poblaciones al circuito eléctrico: matemáticas que modelan el cambio"
      >
        <div>
          <h3>¿Qué es una ecuación diferencial ordinaria?</h3>
          <p>
            Una ecuación diferencial ordinaria (ODE) relaciona una función desconocida <em>y(x)</em> con
            sus derivadas. En lugar de decir "y vale esto", dice "la tasa de cambio de y depende de y y x
            de esta forma". Son la herramienta fundamental para modelar cualquier sistema que cambia
            en el tiempo: poblaciones, temperatura, corriente eléctrica, posición de un planeta.
          </p>

          <h3>El campo de direcciones: la solución emerge</h3>
          <p>
            En cada punto del plano (x, y) la ODE <em>dy/dx = f(x, y)</em> nos da una pendiente.
            Al dibujar todas las pendientes simultáneamente obtenemos el <strong>campo de
            direcciones</strong>: una "textura" del plano que muestra hacia dónde fluiría cualquier
            solución. La curva solución es la que en todo punto es tangente a las flechas del campo.
          </p>

          <h3>El sistema Lotka-Volterra: historia y relevancia</h3>
          <p>
            En los años 1920, Vito Volterra modeló las oscilaciones de peces en el Adriático y Alfred
            Lotka lo hizo independientemente para reacciones químicas. El sistema dR/dt = αR − βRL /
            dL/dt = δRL − γL captura la <strong>coexistencia oscilatoria</strong> entre presa y
            depredador: cuando los conejos abundan, los lobos prosperan; cuando los lobos son muchos,
            los conejos escasean; entonces los lobos también disminuyen, y el ciclo comienza de nuevo.
          </p>

          <h3>Clasificación de ODEs</h3>
          <ul>
            <li><strong>Separables</strong>: dy/dx = g(x)·h(y) — se integra cada lado por separado.</li>
            <li><strong>Lineales de 1.er orden</strong>: dy/dx + P(x)y = Q(x) — solución con factor integrante.</li>
            <li><strong>Sistemas de ODEs</strong>: varias ecuaciones acopladas (Lotka-Volterra).</li>
            <li><strong>No lineales</strong>: las más ricas y complejas; raramente tienen solución exacta.</li>
          </ul>

          <h3>Métodos numéricos: Euler y Runge-Kutta</h3>
          <p>
            Cuando no existe solución analítica (la mayoría de casos reales), usamos métodos numéricos.
            El <strong>método de Euler</strong> avanza paso a paso: y(t+h) ≈ y(t) + h·f(t, y(t)).
            Simple pero poco preciso. El <strong>Runge-Kutta 4</strong> evalúa la pendiente en cuatro
            puntos del intervalo y promedia ponderadamente — el error es O(h⁴) vs O(h) de Euler.
          </p>

          <h3>Aplicaciones en ingeniería y ciencias</h3>
          <ul>
            <li><strong>Biología</strong>: dinámica de poblaciones, propagación de epidemias (SIR).</li>
            <li><strong>Ingeniería eléctrica</strong>: circuitos RC, RLC, respuesta en frecuencia.</li>
            <li><strong>Termodinámica</strong>: enfriamiento/calentamiento, conducción de calor.</li>
            <li><strong>Economía</strong>: modelos de crecimiento de Solow, ciclos económicos.</li>
            <li><strong>Mecánica</strong>: oscilador armónico, péndulo, movimiento orbital.</li>
          </ul>

          {/* Sección 1 — Tabla Comparativa */}
          <h3>Comparativa de tipos de EDO</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Forma</th>
                  <th>Método de resolución</th>
                  <th>Ejemplo</th>
                  <th>Aplicación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Separable</strong></td>
                  <td>dy/dx = f(x)g(y)</td>
                  <td>Separar variables e integrar</td>
                  <td>dy/dx = ky</td>
                  <td>Crecimiento/decaimiento exponencial</td>
                </tr>
                <tr>
                  <td><strong>Lineal 1er orden</strong></td>
                  <td>dy/dx + p(x)y = q(x)</td>
                  <td>Factor integrante μ = e^∫p(x)dx</td>
                  <td>dy/dt + y/RC = V/RC</td>
                  <td>Circuito RC</td>
                </tr>
                <tr>
                  <td><strong>Autónoma</strong></td>
                  <td>dy/dx = f(y)</td>
                  <td>Análisis de puntos de equilibrio</td>
                  <td>dy/dt = ky(1−y/K)</td>
                  <td>Logística (poblaciones)</td>
                </tr>
                <tr>
                  <td><strong>Sistema 2D</strong></td>
                  <td>dx/dt=f(x,y), dy/dt=g(x,y)</td>
                  <td>Eigenvalores de la matriz Jacobiana</td>
                  <td>Lotka-Volterra</td>
                  <td>Predador-presa, circuitos LC</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sección 2 — Casos de Uso */}
          <h3>¿Quién usa las ecuaciones diferenciales y para qué?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧬</span>
                <h3>Biólogo / Ecólogo</h3>
              </div>
              <p>El modelo Lotka-Volterra predice oscilaciones de poblaciones de presa y depredador en ecosistemas reales.</p>
              <p className={styles.escenarioTip}>Ejemplo: fluctuaciones históricas de liebres y linces en Canadá siguen el patrón Lotka-Volterra.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚡</span>
                <h3>Ingeniero Eléctrico</h3>
              </div>
              <p>Circuitos RC, RL y RLC son EDO de primer y segundo orden; el comportamiento transitorio se calcula con ellas.</p>
              <p className={styles.escenarioTip}>Ejemplo: el tiempo de carga de un condensador es τ = RC — una EDO de primer orden.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌡️</span>
                <h3>Físico Experimental</h3>
              </div>
              <p>La ley de enfriamiento de Newton predice cuándo un cuerpo alcanza el equilibrio térmico con su entorno.</p>
              <p className={styles.escenarioTip}>Ejemplo: calcular cuánto tarda un café en enfriarse a temperatura óptima de consumo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💊</span>
                <h3>Farmacólogo</h3>
              </div>
              <p>La cinética de eliminación de fármacos (vida media) sigue una EDO exponencial: dC/dt = −kC.</p>
              <p className={styles.escenarioTip}>Ejemplo: la vida media de un antibiótico determina la frecuencia de dosificación correcta.</p>
            </div>
          </div>

          {/* Sección 3 — FAQ */}
          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre EDO y EDP?</h4>
              <p>Las ecuaciones diferenciales ordinarias (EDO) tienen una sola variable independiente, normalmente el tiempo t o una dimensión espacial. Las ecuaciones en derivadas parciales (EDP) tienen varias variables independientes simultáneas (ej: temperatura en función de x, y y t).</p>
              <div className={styles.faqTip}>Calor en una barra: EDO si solo depende del tiempo. EDP si depende de posición y tiempo a la vez.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el campo de direcciones y cómo se lee?</h4>
              <p>En cada punto (x, y) del plano, la EDO dy/dx = f(x, y) indica una pendiente. El campo de direcciones dibuja esa pendiente como una flecha pequeña en cada punto. La solución particular es la curva que sigue las flechas partiendo de una condición inicial.</p>
              <div className={styles.faqTip}>Las flechas muestran dirección, no velocidad. Una flecha larga no significa que el sistema cambie más rápido.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el método de Euler y cuándo es exacto?</h4>
              <p>El método de Euler aproxima la solución avanzando paso a paso: y(t+h) ≈ y(t) + h·f(t, y(t)). Nunca es exacto (salvo que la función sea constante), pero el error se reduce al reducir h. Para h suficientemente pequeño, la aproximación es útil en la práctica.</p>
              <div className={styles.faqTip}>El error global de Euler es O(h) — proporcional al paso. Runge-Kutta 4 tiene error O(h⁴), mucho más preciso.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuándo oscila el sistema Lotka-Volterra y cuándo diverge?</h4>
              <p>Con parámetros positivos (α, β, δ, γ &gt; 0) y condiciones iniciales positivas, el sistema siempre oscila de forma periódica — nunca diverge ni converge a un punto fijo. Las oscilaciones son conservativas: el sistema conserva una cantidad llamada "integral primera" de Lotka-Volterra.</p>
              <div className={styles.faqTip}>Si α o γ son muy distintos, las oscilaciones son muy asimétricas pero siguen siendo cerradas en el diagrama de fase.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué significa que una EDO sea "estable" o "inestable"?</h4>
              <p>Un punto de equilibrio es estable si pequeñas perturbaciones hacen que el sistema vuelva a él (atractor). Es inestable si las perturbaciones se amplifican (repulsor). Para EDO autónomas dy/dt = f(y), un equilibrio y* es estable si f'(y*) &lt; 0 e inestable si f'(y*) &gt; 0.</p>
              <div className={styles.faqTip}>En la logística dy/dt = ky(1−y/K): y=0 es inestable (poblaciones pequeñas crecen) y y=K es estable (la capacidad de carga es un atractor).</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué Runge-Kutta es mejor que Euler?</h4>
              <p>Euler usa solo la pendiente al inicio del intervalo. Runge-Kutta 4 evalúa la pendiente en cuatro puntos del intervalo [t, t+h] y calcula un promedio ponderado. Esto elimina los errores de curvatura que acumula Euler, logrando un error proporcional a h⁴ en lugar de h.</p>
              <div className={styles.faqTip}>Para el mismo paso h = 0,1, RK4 puede ser hasta 10.000 veces más preciso que Euler en una solución de 10 pasos.</div>
            </div>
          </div>

          {/* Sección 4 — Guía Paso a Paso */}
          <h3>Cómo resolver una EDO paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Clasifica la EDO</h4>
                <p>¿Es separable? ¿Lineal de primer orden? ¿Autónoma? La clasificación determina el método de resolución correcto. Busca si puedes escribirla como dy/dx = g(x)·h(y) (separable) o dy/dx + p(x)y = q(x) (lineal).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Separa variables (si es separable)</h4>
                <p>Pasa dy y todo lo que dependa de y a un lado, y dx con todo lo que dependa de x al otro. Luego integra ambos lados por separado: ∫(1/h(y)) dy = ∫g(x) dx.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Aplica el factor integrante (si es lineal)</h4>
                <p>Calcula μ(x) = e^∫p(x)dx. Multiplica toda la ecuación por μ(x). El lado izquierdo se convierte en d/dx[μ(x)·y], que se integra directamente: μ(x)·y = ∫μ(x)·q(x) dx.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Aplica la condición inicial</h4>
                <p>La solución general contiene una constante C. Sustituye la condición inicial y(x₀) = y₀ para determinar C. Así obtienes la solución particular que describe el fenómeno concreto.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Verifica la solución</h4>
                <p>Diferencia la solución obtenida y sustitúyela en la EDO original. Si ambos lados son iguales, la solución es correcta. Si la EDO describe un fenómeno físico, comprueba también que las unidades son coherentes.</p>
              </div>
            </div>
          </div>

          {/* Sección 5 — Mejores Prácticas */}
          <h3>Consejos para trabajar con ecuaciones diferenciales</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Dibuja el campo primero</h4>
              <p>Antes de resolver analíticamente, dibuja el campo de direcciones. La solución debe seguir las flechas — si no lo hace, hay un error.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Identifica los equilibrios</h4>
              <p>Los puntos donde dy/dt = 0 son "atractores" o "repulsores". Identifícalos antes de simular para entender el comportamiento a largo plazo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h4>Elige el paso correcto</h4>
              <p>El método de Euler tiene error O(h); Runge-Kutta 4 tiene error O(h⁴). Para la misma precisión, puedes usar un paso h mayor con RK4.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Lotka-Volterra: diagrama de fase</h4>
              <p>Las oscilaciones de Lotka-Volterra son siempre cerradas (conservan energía): el diagrama de fase es una curva cerrada alrededor del punto de equilibrio.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Comprueba las unidades</h4>
              <p>Si la EDO modela un fenómeno físico, las unidades de ambos lados deben coincidir. Un error de unidades delata un modelo incorrecto.</p>
            </div>
          </div>

          {/* Sección 6 — Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Comunes con Ecuaciones Diferenciales</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Olvidar la constante de integración:</strong> La solución general de una EDO incluye una constante C. Sin la condición inicial, hay infinitas soluciones.</li>
              <li><strong>❌ Confundir EDO con EDP:</strong> Las EDO tienen una sola variable independiente (tiempo o espacio 1D). Las EDP tienen varias (ej: temperatura en función de x, y, t).</li>
              <li><strong>❌ Usar Euler con paso h muy grande:</strong> Si h es demasiado grande, la solución numérica diverge incluso cuando la solución real es estable.</li>
              <li><strong>❌ Interpretar mal el diagrama de fase:</strong> Las flechas muestran la dirección del cambio, no la velocidad. La densidad de flechas no indica velocidad.</li>
              <li><strong>❌ Ignorar los puntos de equilibrio:</strong> Antes de resolver numéricamente, identifica dónde dy/dt = 0 — esos son los puntos clave del comportamiento a largo plazo.</li>
            </ul>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-ecuaciones-diferenciales')} />
      <ShareCard appName="visualizador-ecuaciones-diferenciales" />
      <Footer appName="visualizador-ecuaciones-diferenciales" />
    </div>
  );
}
