'use client';

import { useState, useMemo, useCallback } from 'react';
import styles from './ModelosEpidemiologicos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type SeccionActiva = 'sir' | 'seir' | 'rt' | 'comparativa';

interface PuntoSIR {
  s: number;
  i: number;
  r: number;
}

interface PuntoSEIR {
  s: number;
  e: number;
  i: number;
  r: number;
}

interface EnfermedadPreset {
  nombre: string;
  emoji: string;
  beta: number;
  gamma: number;
  sigma: number;
  r0: number;
  mortalidad: string;
  periodoInfeccioso: string;
  umbralVacunacion: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Constantes de simulación
// ─────────────────────────────────────────────

const N_POBLACION = 1000;
const DIAS_SIMULACION = 200;

const ENFERMEDADES: EnfermedadPreset[] = [
  {
    nombre: 'Gripe estacional',
    emoji: '🤧',
    beta: 0.26,
    gamma: 0.2,
    sigma: 0.33,
    r0: 1.3,
    mortalidad: '0,1 %',
    periodoInfeccioso: '4-5 días',
    umbralVacunacion: '23 %',
    descripcion: 'R₀ bajo: epidemias moderadas anuales',
  },
  {
    nombre: 'COVID-19 (variante original)',
    emoji: '🦠',
    beta: 0.3,
    gamma: 0.1,
    sigma: 0.2,
    r0: 3.0,
    mortalidad: '1-3 %',
    periodoInfeccioso: '8-14 días',
    umbralVacunacion: '67 %',
    descripcion: 'R₀ moderado-alto, periodo de incubación 5 días',
  },
  {
    nombre: 'Sarampión',
    emoji: '🔴',
    beta: 1.5,
    gamma: 0.1,
    sigma: 0.25,
    r0: 15,
    mortalidad: '0,2 %',
    periodoInfeccioso: '8-10 días',
    umbralVacunacion: '93-95 %',
    descripcion: 'El R₀ más alto conocido — erradicable con vacunación masiva',
  },
  {
    nombre: 'Ébola (brote 2014)',
    emoji: '🔴',
    beta: 0.3,
    gamma: 0.15,
    sigma: 0.17,
    r0: 2.0,
    mortalidad: '50-90 %',
    periodoInfeccioso: '6-12 días',
    umbralVacunacion: '50 %',
    descripcion: 'R₀ moderado pero mortalidad altísima',
  },
  {
    nombre: 'Viruela (erradicada)',
    emoji: '✅',
    beta: 0.6,
    gamma: 0.1,
    sigma: 0.2,
    r0: 6.0,
    mortalidad: '30 %',
    periodoInfeccioso: '7-10 días',
    umbralVacunacion: '83 %',
    descripcion: 'Primera enfermedad erradicada mediante vacunación (1980)',
  },
];

// ─────────────────────────────────────────────
// Lógica de simulación numérica (método de Euler)
// ─────────────────────────────────────────────

const simularSIR = (
  beta: number,
  gamma: number,
  i0: number,
  dias: number
): PuntoSIR[] => {
  const puntos: PuntoSIR[] = [];
  let S = N_POBLACION - i0;
  let I = i0;
  let R = 0;
  for (let t = 0; t <= dias; t++) {
    puntos.push({ s: S, i: I, r: R });
    const dS = -(beta * S * I) / N_POBLACION;
    const dI = (beta * S * I) / N_POBLACION - gamma * I;
    const dR = gamma * I;
    S += dS;
    I += dI;
    R += dR;
    if (I < 0.5) { I = 0; }
    if (S < 0) { S = 0; }
    if (R > N_POBLACION) { R = N_POBLACION; }
  }
  return puntos;
};

const simularSEIR = (
  beta: number,
  gamma: number,
  sigma: number,
  i0: number,
  dias: number
): PuntoSEIR[] => {
  const puntos: PuntoSEIR[] = [];
  let S = N_POBLACION - i0;
  let E = 0;
  let I = i0;
  let R = 0;
  for (let t = 0; t <= dias; t++) {
    puntos.push({ s: S, e: E, i: I, r: R });
    const dS = -(beta * S * I) / N_POBLACION;
    const dE = (beta * S * I) / N_POBLACION - sigma * E;
    const dI = sigma * E - gamma * I;
    const dR = gamma * I;
    S += dS;
    E += dE;
    I += dI;
    R += dR;
    if (I < 0.5) { I = 0; }
    if (E < 0.5) { E = 0; }
    if (S < 0) { S = 0; }
  }
  return puntos;
};

// ─────────────────────────────────────────────
// Utilidades SVG
// ─────────────────────────────────────────────

const VB_W = 680;
const VB_H = 260;
const PADDING = { top: 20, bottom: 40, left: 50, right: 20 };

const escalarX = (t: number, totalDias: number): number =>
  PADDING.left + (t / totalDias) * (VB_W - PADDING.left - PADDING.right);

const escalarY = (v: number, maxVal: number): number =>
  PADDING.top + (1 - v / maxVal) * (VB_H - PADDING.top - PADDING.bottom);

const puntosAPolyline = (
  puntos: number[],
  totalDias: number,
  maxVal: number
): string => {
  return puntos
    .map((v, t) => `${escalarX(t, totalDias)},${escalarY(v, maxVal)}`)
    .join(' ');
};

const formatNum = (n: number): string => {
  if (n >= 1000) return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return n.toFixed(n < 10 ? 1 : 0);
};

// ─────────────────────────────────────────────
// Ejes SVG reutilizables
// ─────────────────────────────────────────────

const EjesSvg = ({ maxVal, totalDias }: { maxVal: number; totalDias: number }) => {
  const marcasY = [0, 0.25, 0.5, 0.75, 1.0];
  const marcasX = [0, 50, 100, 150, 200];
  return (
    <>
      {/* Eje Y */}
      <line
        x1={PADDING.left} y1={PADDING.top}
        x2={PADDING.left} y2={VB_H - PADDING.bottom}
        stroke="#ccc" strokeWidth="1"
      />
      {/* Eje X */}
      <line
        x1={PADDING.left} y1={VB_H - PADDING.bottom}
        x2={VB_W - PADDING.right} y2={VB_H - PADDING.bottom}
        stroke="#ccc" strokeWidth="1"
      />
      {/* Etiquetas Y */}
      {marcasY.map((frac) => {
        const v = Math.round(frac * maxVal);
        const y = escalarY(v, maxVal);
        return (
          <g key={frac}>
            <line x1={PADDING.left - 4} y1={y} x2={PADDING.left} y2={y} stroke="#ccc" strokeWidth="1" />
            <text x={PADDING.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#999">
              {v >= 1000 ? `${Math.round(v / 100) / 10}k` : v}
            </text>
          </g>
        );
      })}
      {/* Etiquetas X */}
      {marcasX.filter(d => d <= totalDias).map((d) => {
        const x = escalarX(d, totalDias);
        return (
          <g key={d}>
            <line x1={x} y1={VB_H - PADDING.bottom} x2={x} y2={VB_H - PADDING.bottom + 4} stroke="#ccc" strokeWidth="1" />
            <text x={x} y={VB_H - PADDING.bottom + 14} textAnchor="middle" fontSize="9" fill="#999">
              {d}d
            </text>
          </g>
        );
      })}
    </>
  );
};

// ─────────────────────────────────────────────
// Sección 1: Simulador SIR
// ─────────────────────────────────────────────

const SeccionSIR = () => {
  const [beta, setBeta] = useState(0.3);
  const [gamma, setGamma] = useState(0.1);
  const [i0, setI0] = useState(5);

  const puntos = useMemo(() => simularSIR(beta, gamma, i0, DIAS_SIMULACION), [beta, gamma, i0]);

  const r0 = beta / gamma;
  const picoI = Math.max(...puntos.map(p => p.i));
  const diaPico = puntos.findIndex(p => p.i === picoI);
  const totalAfectados = puntos[DIAS_SIMULACION].r + puntos[DIAS_SIMULACION].i;
  const pctAfectados = (totalAfectados / N_POBLACION) * 100;

  const maxVal = N_POBLACION;
  const sPolyline = puntosAPolyline(puntos.map(p => p.s), DIAS_SIMULACION, maxVal);
  const iPolyline = puntosAPolyline(puntos.map(p => p.i), DIAS_SIMULACION, maxVal);
  const rPolyline = puntosAPolyline(puntos.map(p => p.r), DIAS_SIMULACION, maxVal);

  const epidemia = r0 > 1;

  const crearSlider = useCallback(
    (
      etiqueta: string,
      simbolo: string,
      desc: string,
      valor: number,
      min: number,
      max: number,
      paso: number,
      setter: (v: number) => void
    ) => {
      const pct = ((valor - min) / (max - min)) * 100;
      return (
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            <span>{simbolo} {etiqueta}</span>
            <span className={styles.sliderValor}>{valor.toFixed(2)}</span>
          </label>
          <input
            type="range"
            className={styles.sliderInput}
            style={{ ['--pct' as string]: `${pct}%` }}
            min={min}
            max={max}
            step={paso}
            value={valor}
            onChange={(e) => setter(parseFloat(e.target.value))}
            aria-label={`${etiqueta}: ${valor}`}
          />
          <span className={styles.sliderDesc}>{desc}</span>
        </div>
      );
    },
    []
  );

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Simulador SIR en tiempo real</h2>
      <p className={styles.seccionDesc}>
        El modelo SIR divide la población en tres compartimentos: <strong>S</strong>usceptibles
        (pueden infectarse), <strong>I</strong>nfectados (infecciosos) y <strong>R</strong>ecuperados
        (inmunes). Ajusta los parámetros con los sliders y observa cómo cambian las curvas.
      </p>

      <div className={styles.slidersGrid}>
        {crearSlider('Tasa de transmisión', 'β', 'Probabilidad diaria de contagio × contactos. A mayor β, más rápido se extiende la infección.', beta, 0.1, 0.8, 0.01, setBeta)}
        {crearSlider('Tasa de recuperación', 'γ', 'Fracción de infectados que se recuperan por día. 1/γ = duración media de la infección.', gamma, 0.05, 0.5, 0.01, setGamma)}
        {crearSlider('Infectados iniciales', 'I₀', 'Número de casos al inicio de la simulación.', i0, 1, 20, 1, setI0)}
        <div className={styles.sliderGroup} style={{ justifyContent: 'center', paddingTop: '0.5rem' }}>
          <span className={styles.sliderDesc} style={{ fontStyle: 'italic' }}>
            Población fija: <strong>N = 1.000 personas</strong>
          </span>
        </div>
      </div>

      {/* R0 destacado */}
      <div className={`${styles.r0Box} ${epidemia ? styles.r0BoxAlerta : styles.r0BoxOk}`}>
        <div className={`${styles.r0Valor} ${epidemia ? styles.r0ValorAlerta : styles.r0ValorOk}`} aria-live="polite">
          R₀ = {r0.toFixed(2)}
        </div>
        <p className={styles.r0Texto}>
          {epidemia
            ? <><strong>Epidemia</strong>: R₀ &gt; 1 significa que cada infectado contagia a más de una persona — la infección se expande. El umbral de inmunidad colectiva es {(100 * (1 - 1 / r0)).toFixed(0)}%.</>
            : <><strong>Extinción</strong>: R₀ &lt; 1 significa que cada infectado contagia a menos de una persona — la infección desaparece sola. No hay epidemia sostenida.</>
          }
        </p>
      </div>

      {/* Métricas */}
      <div className={styles.metricasGrid}>
        <div className={`${styles.metricaCard} ${epidemia ? styles.metricaAlerta : styles.metricaOk}`}>
          <div className={styles.metricaValor}>{r0.toFixed(2)}</div>
          <div className={styles.metricaLabel}>Número reproductivo básico R₀</div>
        </div>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor}>{formatNum(picoI)}</div>
          <div className={styles.metricaLabel}>Pico de infectados simultáneos</div>
        </div>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor}>{diaPico}</div>
          <div className={styles.metricaLabel}>Día del pico de infección</div>
        </div>
        <div className={`${styles.metricaCard} ${pctAfectados > 50 ? styles.metricaAlerta : ''}`}>
          <div className={styles.metricaValor}>{pctAfectados.toFixed(0)}%</div>
          <div className={styles.metricaLabel}>% población afectada al final</div>
        </div>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCurvas}>
        <div className={styles.leyendaItem}>
          <div className={styles.leyendaLinea} style={{ background: '#2E86AB' }} />
          S(t) — Susceptibles
        </div>
        <div className={styles.leyendaItem}>
          <div className={styles.leyendaLinea} style={{ background: '#e74c3c' }} />
          I(t) — Infectados
        </div>
        <div className={styles.leyendaItem}>
          <div className={styles.leyendaLinea} style={{ background: '#27ae60' }} />
          R(t) — Recuperados
        </div>
      </div>

      {/* Gráfica SIR */}
      <div className={styles.svgZona}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className={styles.graficaSvg}
          role="img"
          aria-label={`Curvas SIR: pico de infectados ${formatNum(picoI)} personas el día ${diaPico}, R₀ = ${r0.toFixed(2)}`}
        >
          {/* Zona sombreada R₀ > 1 vs R₀ ≤ 1 */}
          {epidemia && (
            <rect
              x={PADDING.left} y={PADDING.top}
              width={VB_W - PADDING.left - PADDING.right}
              height={VB_H - PADDING.top - PADDING.bottom}
              fill="rgba(231,76,60,0.04)"
            />
          )}

          <EjesSvg maxVal={maxVal} totalDias={DIAS_SIMULACION} />

          {/* Curvas */}
          <polyline points={sPolyline} fill="none" stroke="#2E86AB" strokeWidth="2" strokeLinejoin="round" />
          <polyline points={iPolyline} fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinejoin="round" />
          <polyline points={rPolyline} fill="none" stroke="#27ae60" strokeWidth="2" strokeLinejoin="round" />

          {/* Línea vertical en el pico */}
          {diaPico > 0 && (
            <line
              x1={escalarX(diaPico, DIAS_SIMULACION)}
              y1={PADDING.top}
              x2={escalarX(diaPico, DIAS_SIMULACION)}
              y2={VB_H - PADDING.bottom}
              stroke="#e74c3c"
              strokeWidth="1"
              strokeDasharray="4 3"
              opacity="0.6"
            />
          )}

          {/* Etiquetas de ejes */}
          <text x={PADDING.left - 14} y={PADDING.top - 6} fontSize="9" fill="#999" textAnchor="middle">N</text>
          <text x={VB_W - PADDING.right} y={VB_H - PADDING.bottom + 24} fontSize="9" fill="#999" textAnchor="end">días</text>
        </svg>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 2: Modelo SEIR vs SIR
// ─────────────────────────────────────────────

const SeccionSEIR = () => {
  const [beta, setBeta] = useState(0.3);
  const [gamma, setGamma] = useState(0.1);
  const [sigma, setSigma] = useState(0.2);
  const [mostrar, setMostrar] = useState<'ambos' | 'sir' | 'seir'>('ambos');

  const ptosSIR = useMemo(() => simularSIR(beta, gamma, 5, DIAS_SIMULACION), [beta, gamma]);
  const ptosSEIR = useMemo(() => simularSEIR(beta, gamma, sigma, 5, DIAS_SIMULACION), [beta, gamma, sigma]);

  const maxVal = N_POBLACION;

  const iSIRPolyline = puntosAPolyline(ptosSIR.map(p => p.i), DIAS_SIMULACION, maxVal);
  const iSEIRPolyline = puntosAPolyline(ptosSEIR.map(p => p.i), DIAS_SIMULACION, maxVal);
  const eSEIRPolyline = puntosAPolyline(ptosSEIR.map(p => p.e), DIAS_SIMULACION, maxVal);

  const picoSIR = Math.max(...ptosSIR.map(p => p.i));
  const diaSIR = ptosSIR.findIndex(p => p.i === picoSIR);
  const picoSEIR = Math.max(...ptosSEIR.map(p => p.i));
  const diaSEIR = ptosSEIR.findIndex(p => p.i === picoSEIR);

  const crearSlider = useCallback(
    (
      etiqueta: string,
      simbolo: string,
      desc: string,
      valor: number,
      min: number,
      max: number,
      paso: number,
      setter: (v: number) => void
    ) => {
      const pct = ((valor - min) / (max - min)) * 100;
      return (
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            <span>{simbolo} {etiqueta}</span>
            <span className={styles.sliderValor}>{valor.toFixed(2)}</span>
          </label>
          <input
            type="range"
            className={styles.sliderInput}
            style={{ ['--pct' as string]: `${pct}%` }}
            min={min} max={max} step={paso} value={valor}
            onChange={(e) => setter(parseFloat(e.target.value))}
            aria-label={`${etiqueta}: ${valor}`}
          />
          <span className={styles.sliderDesc}>{desc}</span>
        </div>
      );
    },
    []
  );

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Modelo SEIR: con periodo de incubación</h2>
      <p className={styles.seccionDesc}>
        El modelo SEIR añade el compartimento <strong>E</strong>xpuesto: personas que ya están infectadas
        pero todavía no son contagiosas (periodo de incubación). Compara visualmente cómo el parámetro σ
        aplana y retrasa el pico de infectados respecto al SIR clásico.
      </p>

      <div className={styles.infoIncubacion}>
        <p className={styles.infoIncubacionTitle}>Compartimento E (Expuesto)</p>
        <p>
          Las personas pasan de S → E al exponerse al virus, y de E → I tras el periodo de incubación
          (1/σ días). A mayor σ, más corto el periodo de incubación y más se parece al SIR.
          COVID-19: σ ≈ 0.2 (≈ 5 días de incubación). Gripe: σ ≈ 0.5 (≈ 2 días).
        </p>
      </div>

      <div className={styles.slidersGrid}>
        {crearSlider('Tasa de transmisión', 'β', 'Prob. diaria de contagio × contactos.', beta, 0.1, 0.8, 0.01, setBeta)}
        {crearSlider('Tasa de recuperación', 'γ', '1/γ = duración media infección en días.', gamma, 0.05, 0.5, 0.01, setGamma)}
        {crearSlider('Progresión E→I (σ)', 'σ', '1/σ = duración del periodo de incubación.', sigma, 0.05, 0.5, 0.01, setSigma)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <span className={styles.sliderDesc} style={{ fontStyle: 'italic' }}>
            COVID-19: β=0.3, γ=0.1, σ=0.2 → R₀≈3<br />
            Gripe: β=0.26, γ=0.2, σ=0.33 → R₀≈1.3
          </span>
        </div>
      </div>

      {/* Toggle de curvas */}
      <div className={styles.modoSwitch} role="group" aria-label="Seleccionar curvas a mostrar">
        {(['ambos', 'sir', 'seir'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.modoBtnBase} ${mostrar === m ? styles.modoBtnActivo : ''}`}
            onClick={() => setMostrar(m)}
            aria-pressed={mostrar === m}
          >
            {m === 'ambos' ? 'Comparar SIR vs SEIR' : m === 'sir' ? 'Solo SIR' : 'Solo SEIR'}
          </button>
        ))}
      </div>

      {/* Métricas comparativas */}
      <div className={styles.metricasGrid}>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor}>{(beta / gamma).toFixed(2)}</div>
          <div className={styles.metricaLabel}>R₀ (ambos modelos)</div>
        </div>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor}>{formatNum(picoSIR)}</div>
          <div className={styles.metricaLabel}>Pico SIR (día {diaSIR})</div>
        </div>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor}>{formatNum(picoSEIR)}</div>
          <div className={styles.metricaLabel}>Pico SEIR (día {diaSEIR})</div>
        </div>
        <div className={styles.metricaCard}>
          <div className={styles.metricaValor}>+{diaSEIR - diaSIR}d</div>
          <div className={styles.metricaLabel}>Retraso del pico por incubación</div>
        </div>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCurvas}>
        {(mostrar === 'sir' || mostrar === 'ambos') && (
          <div className={styles.leyendaItem}>
            <div className={styles.leyendaLinea} style={{ background: '#e74c3c' }} />
            I(t) — SIR
          </div>
        )}
        {(mostrar === 'seir' || mostrar === 'ambos') && (
          <>
            <div className={styles.leyendaItem}>
              <div className={styles.leyendaLinea} style={{ background: '#f39c12' }} />
              E(t) — Expuestos (SEIR)
            </div>
            <div className={styles.leyendaItem}>
              <div className={styles.leyendaLinea} style={{ background: '#8e44ad', height: 3 }} />
              I(t) — SEIR
            </div>
          </>
        )}
      </div>

      <div className={styles.svgZona}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className={styles.graficaSvg}
          role="img"
          aria-label={`Comparativa SIR vs SEIR: pico SIR día ${diaSIR} (${formatNum(picoSIR)}), pico SEIR día ${diaSEIR} (${formatNum(picoSEIR)})`}
        >
          <EjesSvg maxVal={maxVal} totalDias={DIAS_SIMULACION} />

          {(mostrar === 'sir' || mostrar === 'ambos') && (
            <polyline points={iSIRPolyline} fill="none" stroke="#e74c3c" strokeWidth="2.5" strokeLinejoin="round" />
          )}
          {(mostrar === 'seir' || mostrar === 'ambos') && (
            <>
              <polyline points={eSEIRPolyline} fill="none" stroke="#f39c12" strokeWidth="1.8" strokeDasharray="6 3" strokeLinejoin="round" />
              <polyline points={iSEIRPolyline} fill="none" stroke="#8e44ad" strokeWidth="2.5" strokeLinejoin="round" />
            </>
          )}

          <text x={VB_W - PADDING.right} y={VB_H - PADDING.bottom + 24} fontSize="9" fill="#999" textAnchor="end">días</text>
        </svg>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 3: Rₜ y medidas de control
// ─────────────────────────────────────────────

const SeccionRt = () => {
  const [beta, setBeta] = useState(0.3);
  const [gamma, setGamma] = useState(0.1);
  const [control, setControl] = useState(0);

  const betaEfectiva = beta * (1 - control / 100);
  const puntos = useMemo(() => simularSIR(betaEfectiva, gamma, 5, DIAS_SIMULACION), [betaEfectiva, gamma]);

  const r0 = beta / gamma;
  const r0efectivo = betaEfectiva / gamma;

  const rt = puntos.map(p => (betaEfectiva / gamma) * (p.s / N_POBLACION));
  const iPolyline = puntosAPolyline(puntos.map(p => p.i), DIAS_SIMULACION, N_POBLACION);

  // Curva Rₜ en SVG propio (rango 0 a r0*1.1)
  const maxRt = Math.max(r0 * 1.1, 1.5);
  const rtPolyline = rt.map((v, t) => `${escalarX(t, DIAS_SIMULACION)},${escalarY(v, maxRt)}`).join(' ');

  const marcaRt1Y = escalarY(1, maxRt);

  const umbralInmunidad = control > 0
    ? Math.max(0, (1 - 1 / r0efectivo) * 100)
    : (1 - 1 / r0) * 100;

  const pct = ((control - 0) / 90) * 100;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Número reproductivo efectivo Rₜ</h2>
      <p className={styles.seccionDesc}>
        Rₜ = R₀ × S(t)/N — el número de reproducción <em>efectivo</em> cae conforme crece la inmunidad
        natural. Cuando Rₜ cruza por debajo de 1, la epidemia empieza a decaer aunque no haya desaparecido.
        Usa el slider de control para simular el efecto de medidas (mascarillas, distanciamiento, vacunación).
      </p>

      <div className={styles.slidersGrid}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            <span>β Tasa de transmisión</span>
            <span className={styles.sliderValor}>{beta.toFixed(2)}</span>
          </label>
          <input type="range" className={styles.sliderInput}
            style={{ ['--pct' as string]: `${((beta - 0.1) / 0.7) * 100}%` }}
            min={0.1} max={0.8} step={0.01} value={beta}
            onChange={(e) => setBeta(parseFloat(e.target.value))}
            aria-label={`Beta tasa transmisión: ${beta}`}
          />
          <span className={styles.sliderDesc}>R₀ = β/γ = <strong>{r0.toFixed(2)}</strong></span>
        </div>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            <span>γ Tasa de recuperación</span>
            <span className={styles.sliderValor}>{gamma.toFixed(2)}</span>
          </label>
          <input type="range" className={styles.sliderInput}
            style={{ ['--pct' as string]: `${((gamma - 0.05) / 0.45) * 100}%` }}
            min={0.05} max={0.5} step={0.01} value={gamma}
            onChange={(e) => setGamma(parseFloat(e.target.value))}
            aria-label={`Gamma tasa recuperación: ${gamma}`}
          />
          <span className={styles.sliderDesc}>1/γ ≈ {(1 / gamma).toFixed(1)} días de infección</span>
        </div>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            <span>🎛️ Medidas de control</span>
            <span className={styles.sliderValor}>{control}%</span>
          </label>
          <input type="range" className={styles.sliderInput}
            style={{ ['--pct' as string]: `${pct}%` }}
            min={0} max={90} step={5} value={control}
            onChange={(e) => setControl(parseInt(e.target.value))}
            aria-label={`Reducción transmisión por medidas de control: ${control}%`}
          />
          <span className={styles.sliderDesc}>
            Reduce β en {control}% → β efectiva = {betaEfectiva.toFixed(3)} → R₀ efectivo = {r0efectivo.toFixed(2)}
          </span>
        </div>
        <div className={styles.metricaCard} style={{ alignSelf: 'center' }}>
          <div className={styles.metricaValor}>{umbralInmunidad.toFixed(0)}%</div>
          <div className={styles.metricaLabel}>Umbral inmunidad colectiva necesario</div>
        </div>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCurvas} style={{ marginTop: '0.5rem' }}>
        <div className={styles.leyendaItem}>
          <div className={styles.leyendaLinea} style={{ background: '#2E86AB' }} />
          Rₜ a lo largo del tiempo
        </div>
        <div className={styles.leyendaItem}>
          <div className={styles.leyendaLinea} style={{ background: '#e74c3c', height: 2 }} />
          — — Umbral Rₜ = 1
        </div>
        <div className={styles.leyendaItem}>
          <div className={styles.leyendaLinea} style={{ background: '#e74c3c' }} />
          I(t) Infectados
        </div>
      </div>

      {/* Gráfica Rₜ */}
      <div className={styles.svgZona}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className={styles.graficaSvg}
          role="img"
          aria-label={`Curva de número reproductivo efectivo Rₜ. R₀ = ${r0.toFixed(2)}, control ${control}%, R₀ efectivo ${r0efectivo.toFixed(2)}`}
        >
          <EjesSvg maxVal={maxRt} totalDias={DIAS_SIMULACION} />

          {/* Zona debajo de Rₜ=1 (segura) */}
          <rect
            x={PADDING.left} y={marcaRt1Y}
            width={VB_W - PADDING.left - PADDING.right}
            height={VB_H - PADDING.bottom - marcaRt1Y}
            fill="rgba(39,174,96,0.05)"
          />

          {/* Línea Rₜ = 1 */}
          <line
            x1={PADDING.left} y1={marcaRt1Y}
            x2={VB_W - PADDING.right} y2={marcaRt1Y}
            stroke="#e74c3c" strokeWidth="1.5" strokeDasharray="6 3"
          />
          <text x={VB_W - PADDING.right - 2} y={marcaRt1Y - 4} fontSize="9" fill="#e74c3c" textAnchor="end">Rₜ = 1</text>

          {/* Curva Rₜ */}
          <polyline points={rtPolyline} fill="none" stroke="#2E86AB" strokeWidth="2.5" strokeLinejoin="round" />

          {/* Curva infectados superpuesta (escala visual) */}
          <polyline points={iPolyline.split(' ').map((pt, idx) => {
            const [, rawY] = pt.split(',');
            const iVal = puntos[idx]?.i ?? 0;
            const yScaled = escalarY(iVal / N_POBLACION * maxRt * 0.6, maxRt);
            const x = escalarX(idx, DIAS_SIMULACION);
            return `${x},${yScaled}`;
          }).join(' ')} fill="none" stroke="#e74c3c" strokeWidth="1.8" strokeLinejoin="round" opacity="0.6" />

          <text x={VB_W - PADDING.right} y={VB_H - PADDING.bottom + 24} fontSize="9" fill="#999" textAnchor="end">días</text>
        </svg>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sección 4: Comparativa de enfermedades
// ─────────────────────────────────────────────

const SeccionComparativa = ({ onSeleccionar }: { onSeleccionar: (e: EnfermedadPreset) => void }) => {
  const [seleccionada, setSeleccionada] = useState<number | null>(null);

  const handleSeleccionar = (idx: number) => {
    setSeleccionada(idx);
    onSeleccionar(ENFERMEDADES[idx]);
  };

  const badgeClass = (r0: number) => {
    if (r0 >= 10) return styles.r0BadgeAlto;
    if (r0 >= 3) return styles.r0BadgeMedio;
    return '';
  };

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Comparativa de enfermedades reales</h2>
      <p className={styles.seccionDesc}>
        Parámetros reales de enfermedades conocidas. Pulsa &quot;Simular&quot; en cualquier fila para
        cargar automáticamente sus parámetros en el Simulador SIR.
      </p>

      <div className={styles.tablaScroll}>
        <table className={styles.tablaEnfermedades}>
          <thead>
            <tr>
              <th>Enfermedad</th>
              <th>R₀</th>
              <th>Mortalidad</th>
              <th>Período infeccioso</th>
              <th>Vacunación para erradicación</th>
              <th>Descripción</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ENFERMEDADES.map((e, idx) => (
              <tr key={e.nombre} className={seleccionada === idx ? styles.filaSeleccionada : ''}>
                <td><strong>{e.emoji} {e.nombre}</strong></td>
                <td>
                  <span className={`${styles.r0Badge} ${badgeClass(e.r0)}`}>{e.r0}</span>
                </td>
                <td>{e.mortalidad}</td>
                <td>{e.periodoInfeccioso}</td>
                <td>{e.umbralVacunacion}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.descripcion}</td>
                <td>
                  <button
                    type="button"
                    className={styles.btnSeleccionar}
                    onClick={() => handleSeleccionar(idx)}
                    aria-label={`Simular ${e.nombre} con R₀ ${e.r0}`}
                  >
                    Simular
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {seleccionada !== null && (
        <div className={`${styles.infoIncubacion} ${styles.fadeIn}`}>
          <p className={styles.infoIncubacionTitle}>
            {ENFERMEDADES[seleccionada].emoji} {ENFERMEDADES[seleccionada].nombre} — cargada en el Simulador SIR
          </p>
          <p>
            β = {ENFERMEDADES[seleccionada].beta}, γ = {ENFERMEDADES[seleccionada].gamma},
            R₀ = {ENFERMEDADES[seleccionada].r0}.
            Ve a la pestaña <strong>Simulador SIR</strong> o <strong>SEIR</strong> para ver las curvas con estos parámetros.
            (Nota: en el simulador SIR los sliders se fijan a los límites del rango disponible.)
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorModelosEpidemiologicos() {
  const [seccion, setSeccion] = useState<SeccionActiva>('sir');

  const handleSeleccionarEnfermedad = useCallback((_e: EnfermedadPreset) => {
    // Simplemente redirige al usuario a la pestaña SIR para que vea el contexto
    setSeccion('sir');
  }, []);

  const SECCIONES: { id: SeccionActiva; icon: string; label: string }[] = [
    { id: 'sir', icon: '📈', label: 'Simulador SIR' },
    { id: 'seir', icon: '🔬', label: 'Modelo SEIR' },
    { id: 'rt', icon: '📊', label: 'Rₜ y Control' },
    { id: 'comparativa', icon: '🗂️', label: 'Enfermedades' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>Modelos Epidemiológicos</h1>
          <p className={styles.heroSubtitle}>
            Las matemáticas que predicen cómo se propagan las enfermedades — simulador interactivo de modelos SIR y SEIR
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard variant="medical" severity="high" collapsible={false} />

        {/* Navegación por secciones */}
        <nav className={styles.tabNav} aria-label="Secciones del visualizador">
          {SECCIONES.map(({ id, icon, label }) => (
            <button
              key={id}
              type="button"
              className={`${styles.tabBtn} ${seccion === id ? styles.tabBtnActivo : ''}`}
              onClick={() => setSeccion(id)}
              aria-pressed={seccion === id}
              aria-current={seccion === id ? 'true' : undefined}
            >
              <span className={styles.tabIcon} aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Contenido por sección */}
        <main>
          {seccion === 'sir' && <SeccionSIR />}
          {seccion === 'seir' && <SeccionSEIR />}
          {seccion === 'rt' && <SeccionRt />}
          {seccion === 'comparativa' && <SeccionComparativa onSeleccionar={handleSeleccionarEnfermedad} />}
        </main>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="La ciencia de los modelos epidemiológicos"
          subtitle="De las ecuaciones diferenciales al informe del Imperial College"
        >
          <section>
            <h3>Historia: del mosquito a la pandemia</h3>
            <p>
              El primero en aplicar matemáticas a la propagación de enfermedades fue Ronald Ross en 1911,
              modelizando la malaria y el ciclo mosquito-humano. Su trabajo demostró que no hacía falta
              eliminar todos los mosquitos — bastaba reducirlos por debajo de un umbral crítico.
            </p>
            <p>
              En 1927, Kermack y McKendrick publicaron el modelo SIR en sus &quot;Contribuciones a la
              teoría matemática de las epidemias&quot;, derivando la condición R₀ &gt; 1 como umbral de
              epidemia. Este marco sigue siendo la base de toda la epidemiología matemática moderna.
            </p>
          </section>

          <section>
            <h3>Las ecuaciones del modelo SIR</h3>
            <p>El modelo SIR se describe mediante tres ecuaciones diferenciales ordinarias:</p>
            <ul>
              <li><strong>dS/dt = −βSI/N</strong>: los susceptibles se infectan al contactar con infectados</li>
              <li><strong>dI/dt = βSI/N − γI</strong>: los infectados aumentan por contagio y disminuyen al recuperarse</li>
              <li><strong>dR/dt = γI</strong>: los recuperados acumulan inmunidad</li>
            </ul>
            <p>
              La suma S + I + R = N se conserva siempre. La condición de epidemia surge de analizar
              cuándo dI/dt &gt; 0 al inicio: esto requiere que β/γ &gt; N/S₀ ≈ 1, es decir, R₀ &gt; 1.
            </p>
          </section>

          <section>
            <h3>R₀ vs Rₜ: la distinción crucial</h3>
            <p>
              <strong>R₀ (número reproductivo básico)</strong> es el número medio de contagios secundarios
              por un infectado en una población <em>completamente susceptible</em>. Es una propiedad
              intrínseca de la enfermedad y el contexto social, no cambia durante la epidemia.
            </p>
            <p>
              <strong>Rₜ (número reproductivo efectivo)</strong> mide lo mismo pero en el contexto real:
              Rₜ = R₀ × S(t)/N. Cae conforme crece la inmunidad. Cuando Rₜ &lt; 1 el brote decrece,
              aunque R₀ siga siendo mayor que 1. El cruce de Rₜ = 1 coincide exactamente con el pico
              de infectados.
            </p>
          </section>

          <section>
            <h3>El umbral de inmunidad colectiva</h3>
            <p>
              La epidemia se extingue cuando S(t)/N cae por debajo de 1/R₀ — es decir, cuando al menos
              (1 − 1/R₀) × 100% de la población es inmune. Para sarampión (R₀≈15) se necesita el 93%;
              para gripe estacional (R₀≈1.3) basta el 23%. Este umbral puede alcanzarse por infección
              natural o por vacunación — pero la infección natural conlleva el coste de la mortalidad.
            </p>
          </section>

          <section>
            <h3>Limitaciones del modelo SIR</h3>
            <p>El modelo SIR asume mezcla homogénea perfecta (todos tienen igual probabilidad de contacto),
              ausencia de estructura de edad, geografía o redes sociales, parámetros β y γ constantes en el
              tiempo, y una sola cepa sin mutaciones. En la práctica, ninguna epidemia real cumple estas
              condiciones. Las extensiones modernas incluyen:</p>
            <ul>
              <li><strong>SIRS</strong>: la inmunidad es temporal (posibilidad de reinfección)</li>
              <li><strong>Modelos en red</strong>: cada persona tiene sus propios contactos (grafos)</li>
              <li><strong>Modelos por edad</strong>: β varía entre grupos de edad</li>
              <li><strong>Modelos estocásticos</strong>: incorporan aleatoriedad (importantes cuando I es pequeño)</li>
              <li><strong>Modelos geoespaciales</strong>: propagación entre poblaciones conectadas</li>
            </ul>
          </section>

          <section>
            <h3>COVID-19 y el Informe del Imperial College</h3>
            <p>
              En marzo de 2020, el equipo de Neil Ferguson en el Imperial College London publicó un
              modelo SEIR extendido que proyectaba hasta 510.000 muertes en el Reino Unido sin
              intervención. Este informe influyó directamente en las decisiones de confinamiento
              de varios gobiernos. La controversia posterior — sobre si el modelo sobreestimó la
              mortalidad — ilustra perfectamente las limitaciones de estos modelos cuando se
              extrapolan a contextos reales con intervenciones cambiantes.
            </p>
          </section>

          <div className={styles.warningBox}>
            <strong>Sobre la interpretación de estos modelos:</strong> Los modelos SIR/SEIR son
            simplificaciones matemáticas que ayudan a entender la dinámica de las epidemias, no a
            predecirlas con exactitud. Los parámetros β y γ cambian con el tiempo, las variantes
            virales, las intervenciones sociales y el comportamiento humano. R₀ no es una constante
            biológica — varía según el contexto cultural, la densidad de población y las medidas
            de prevención. Ningún modelo epidemiológico predice el futuro; todos sirven para
            comprender el presente y explorar escenarios hipotéticos.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-modelos-epidemiologicos')} />
        <ShareCard appName="visualizador-modelos-epidemiologicos" />
        <Footer appName="visualizador-modelos-epidemiologicos" />
      </div>
    </>
  );
}
