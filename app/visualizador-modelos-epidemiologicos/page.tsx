'use client';

import { useState, useMemo, useCallback, useId } from 'react';
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
import { formatNumber, formatPercentage } from '@/lib';

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
// Lógica de simulación numérica (Runge-Kutta de orden 4)
// ─────────────────────────────────────────────

/**
 * Subpasos por día de la integración. Hasta el 04/11/2026 era Euler explícito con paso de 1 día,
 * que sobrestimaba el pico del SIR continuo de la página entre un 4 % y un 11 % (314 frente a
 * 302,1 con los valores iniciales; hallazgo 4032). RK4 a 0,1 día coincide con la fórmula cerrada
 * a la décima. Se guarda un punto por día para las curvas.
 *
 * Sin recortes: el «E < 0,5 → 0» del SEIR borraba cada día los expuestos que entraban (0,4975
 * con β 0,10) y la epidemia no arrancaba nunca con R₀ = 2; además restaba población y rompía
 * S + E + I + R = N (hallazgo 4030). RK4 conserva la suma porque las derivadas suman cero.
 */
const PASOS_POR_DIA = 10;

const integrarRK4 = (
  derivada: (y: number[]) => number[],
  y0: number[],
  dias: number
): number[][] => {
  const h = 1 / PASOS_POR_DIA;
  const muestras: number[][] = [y0];
  let y = y0;
  const sumar = (a: number[], b: number[], f: number) => a.map((v, k) => v + f * b[k]);
  for (let dia = 1; dia <= dias; dia++) {
    for (let p = 0; p < PASOS_POR_DIA; p++) {
      const k1 = derivada(y);
      const k2 = derivada(sumar(y, k1, h / 2));
      const k3 = derivada(sumar(y, k2, h / 2));
      const k4 = derivada(sumar(y, k3, h));
      y = y.map((v, k) => v + (h / 6) * (k1[k] + 2 * k2[k] + 2 * k3[k] + k4[k]));
    }
    muestras.push(y);
  }
  return muestras;
};

const simularSIR = (
  beta: number,
  gamma: number,
  i0: number,
  dias: number
): PuntoSIR[] =>
  integrarRK4(
    ([S, I]) => {
      const contagios = (beta * S * I) / N_POBLACION;
      return [-contagios, contagios - gamma * I, gamma * I];
    },
    [N_POBLACION - i0, i0, 0],
    dias
  ).map(([s, i, r]) => ({ s, i, r }));

const simularSEIR = (
  beta: number,
  gamma: number,
  sigma: number,
  i0: number,
  dias: number
): PuntoSEIR[] =>
  integrarRK4(
    ([S, E, I]) => {
      const contagios = (beta * S * I) / N_POBLACION;
      return [-contagios, contagios - sigma * E, sigma * E - gamma * I, gamma * I];
    },
    [N_POBLACION - i0, 0, i0, 0],
    dias
  ).map(([s, e, i, r]) => ({ s, e, i, r }));

/** Rango de los deslizadores del SIR y del SEIR (un preset que se sale se recorta a ellos). */
const RANGO = {
  beta: { min: 0.1, max: 0.8 },
  gamma: { min: 0.05, max: 0.5 },
  sigma: { min: 0.05, max: 0.5 },
} as const;

const acotar = (v: number, r: { min: number; max: number }) => Math.min(r.max, Math.max(r.min, v));

interface ParametrosSIR {
  beta: number;
  gamma: number;
  i0: number;
}

interface ParametrosSEIR {
  beta: number;
  gamma: number;
  sigma: number;
}

interface PresetCargado {
  enfermedad: EnfermedadPreset;
  betaRecortada: boolean;
}

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

/** Personas: con un decimal por debajo de 10 («1,0»), enteras por encima, en formato español. */
const formatNum = (n: number): string => formatNumber(n, n < 10 ? 1 : 0);

/** Una cifra de la tabla o de un preset sin ceros de relleno: 1,3 · 15 · 0,26. */
const cifra = (n: number): string => n.toLocaleString('es-ES', { maximumFractionDigits: 3 });

/** Fracción 0..1 → «67 %» con espacio duro. */
const pctEntero = (fraccion: number): string => formatPercentage(fraccion, 0);

/** Retraso con su signo: «+28 d», «−3 d», «0 d». */
const conSigno = (dias: number): string =>
  `${dias > 0 ? '+' : dias < 0 ? '−' : ''}${Math.abs(dias)} d`;

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

/**
 * Deslizador con su etiqueta visible como nombre accesible. Hasta el 04/11/2026 llevaba un
 * aria-label con el valor en formato inglés («Tasa de transmisión: 0.3») que tapaba la etiqueta,
 * y el valor visible salía de toFixed(2) («0.30», «5.00»; cabos C0485 y C0511, hallazgos 4033 y
 * 4034). Ahora la etiqueta rotula el control y el valor va en formato español, también en
 * aria-valuetext.
 */
const Deslizador = ({
  id,
  etiqueta,
  simbolo,
  desc,
  valor,
  min,
  max,
  paso,
  onChange,
}: {
  id: string;
  etiqueta: string;
  simbolo: string;
  desc: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  onChange: (v: number) => void;
}) => {
  const pct = ((valor - min) / (max - min)) * 100;
  const texto = formatNumber(valor, paso >= 1 ? 0 : 2);
  return (
    <div className={styles.sliderGroup}>
      <label htmlFor={id} className={styles.sliderLabel}>
        <span>{simbolo} {etiqueta}</span>
        <span className={styles.sliderValor}>{texto}</span>
      </label>
      <input
        id={id}
        type="range"
        className={styles.sliderInput}
        style={{ ['--pct' as string]: `${pct}%` }}
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={texto}
      />
      <span className={styles.sliderDesc}>{desc}</span>
    </div>
  );
};

const SeccionSIR = ({
  parametros,
  onCambiar,
  preset,
}: {
  parametros: ParametrosSIR;
  onCambiar: (p: ParametrosSIR) => void;
  preset: PresetCargado | null;
}) => {
  const { beta, gamma, i0 } = parametros;

  const puntos = useMemo(() => simularSIR(beta, gamma, i0, DIAS_SIMULACION), [beta, gamma, i0]);

  const r0 = beta / gamma;
  const picoI = Math.max(...puntos.map(p => p.i));
  const diaPico = puntos.findIndex(p => p.i === picoI);
  const totalAfectados = puntos[DIAS_SIMULACION].r + puntos[DIAS_SIMULACION].i;
  const fraccionAfectados = totalAfectados / N_POBLACION;

  const maxVal = N_POBLACION;
  const sPolyline = puntosAPolyline(puntos.map(p => p.s), DIAS_SIMULACION, maxVal);
  const iPolyline = puntosAPolyline(puntos.map(p => p.i), DIAS_SIMULACION, maxVal);
  const rPolyline = puntosAPolyline(puntos.map(p => p.r), DIAS_SIMULACION, maxVal);

  const epidemia = r0 > 1;

  const idBase = useId();

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Simulador SIR en tiempo real</h2>
      <p className={styles.seccionDesc}>
        El modelo SIR divide la población en tres compartimentos: <strong>S</strong>usceptibles
        (pueden infectarse), <strong>I</strong>nfectados (infecciosos) y <strong>R</strong>ecuperados
        (inmunes). Ajusta los parámetros con los sliders y observa cómo cambian las curvas.
      </p>

      {preset && (
        <div className={styles.infoIncubacion} role="status">
          <p className={styles.infoIncubacionTitle}>
            <span aria-hidden="true">{preset.enfermedad.emoji}</span> {preset.enfermedad.nombre} — cargada en el Simulador SIR
          </p>
          <p>
            β = {cifra(beta)}, γ = {cifra(gamma)}, I₀ = {i0}: R₀ = {formatNumber(r0, 2)}.
            <span>
              {preset.betaRecortada
                ? ` Su β de ${cifra(preset.enfermedad.beta)} (R₀ ${cifra(preset.enfermedad.r0)}) supera el máximo del deslizador y se ha recortado a ${cifra(RANGO.beta.max)}.`
                : ''}
            </span>
          </p>
        </div>
      )}

      <div className={styles.slidersGrid}>
        <Deslizador id={`${idBase}-beta`} etiqueta="Tasa de transmisión" simbolo="β" desc="Probabilidad diaria de contagio × contactos. A mayor β, más rápido se extiende la infección." valor={beta} min={RANGO.beta.min} max={RANGO.beta.max} paso={0.01} onChange={(v) => onCambiar({ ...parametros, beta: v })} />
        <Deslizador id={`${idBase}-gamma`} etiqueta="Tasa de recuperación" simbolo="γ" desc="Fracción de infectados que se recuperan por día. 1/γ = duración media de la infección." valor={gamma} min={RANGO.gamma.min} max={RANGO.gamma.max} paso={0.01} onChange={(v) => onCambiar({ ...parametros, gamma: v })} />
        <Deslizador id={`${idBase}-i0`} etiqueta="Infectados iniciales" simbolo="I₀" desc="Número de casos al inicio de la simulación." valor={i0} min={1} max={20} paso={1} onChange={(v) => onCambiar({ ...parametros, i0: v })} />
        <div className={styles.sliderGroup} style={{ justifyContent: 'center', paddingTop: '0.5rem' }}>
          <span className={styles.sliderDesc} style={{ fontStyle: 'italic' }}>
            Población fija: <strong>N = 1.000 personas</strong>
          </span>
        </div>
      </div>

      {/* R0 destacado */}
      <div className={`${styles.r0Box} ${epidemia ? styles.r0BoxAlerta : styles.r0BoxOk}`}>
        <div className={`${styles.r0Valor} ${epidemia ? styles.r0ValorAlerta : styles.r0ValorOk}`} aria-live="polite">
          R₀ = {formatNumber(r0, 2)}
        </div>
        <p className={styles.r0Texto}>
          {epidemia
            ? <span key="rama-1"><strong>Epidemia</strong>: R₀ &gt; 1 significa que cada infectado contagia a más de una persona — la infección se expande. El umbral de inmunidad colectiva es {pctEntero(1 - 1 / r0)}.</span>
            : <span key="rama-2"><strong>Extinción</strong>: R₀ ≤ 1 significa que cada infectado contagia de media a una persona o menos — y como no toda la población sigue siendo susceptible, a menos de una: la infección desaparece sola. No hay epidemia sostenida.</span>
          }
        </p>
      </div>

      {/* Métricas */}
      <div className={styles.metricasGrid}>
        <div className={`${styles.metricaCard} ${epidemia ? styles.metricaAlerta : styles.metricaOk}`}>
          <div className={styles.metricaValor}>{formatNumber(r0, 2)}</div>
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
        <div className={`${styles.metricaCard} ${fraccionAfectados > 0.5 ? styles.metricaAlerta : ''}`}>
          <div className={styles.metricaValor}>{pctEntero(fraccionAfectados)}</div>
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
          aria-label={`Curvas SIR: pico de infectados ${formatNum(picoI)} personas el día ${diaPico}, R₀ = ${formatNumber(r0, 2)}`}
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

const SeccionSEIR = ({
  parametros,
  onCambiar,
}: {
  parametros: ParametrosSEIR;
  onCambiar: (p: ParametrosSEIR) => void;
}) => {
  const { beta, gamma, sigma } = parametros;
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

  const idBase = useId();

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
          COVID-19: σ ≈ 0,2 (≈ 5 días de incubación). Gripe: σ ≈ 0,33 (≈ 3 días).
        </p>
      </div>

      <div className={styles.slidersGrid}>
        <Deslizador id={`${idBase}-beta`} etiqueta="Tasa de transmisión" simbolo="β" desc="Prob. diaria de contagio × contactos." valor={beta} min={RANGO.beta.min} max={RANGO.beta.max} paso={0.01} onChange={(v) => onCambiar({ ...parametros, beta: v })} />
        <Deslizador id={`${idBase}-gamma`} etiqueta="Tasa de recuperación" simbolo="γ" desc="1/γ = duración media infección en días." valor={gamma} min={RANGO.gamma.min} max={RANGO.gamma.max} paso={0.01} onChange={(v) => onCambiar({ ...parametros, gamma: v })} />
        <Deslizador id={`${idBase}-sigma`} etiqueta="Progresión E→I (σ)" simbolo="σ" desc="1/σ = duración del periodo de incubación." valor={sigma} min={RANGO.sigma.min} max={RANGO.sigma.max} paso={0.01} onChange={(v) => onCambiar({ ...parametros, sigma: v })} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'flex-end' }}>
          <span className={styles.sliderDesc} style={{ fontStyle: 'italic' }}>
            COVID-19: β = 0,3, γ = 0,1, σ = 0,2 → R₀ ≈ 3<br />
            Gripe: β = 0,26, γ = 0,2, σ = 0,33 → R₀ ≈ 1,3
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
          <div className={styles.metricaValor}>{formatNumber(beta / gamma, 2)}</div>
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
          <div className={styles.metricaValor}>{conSigno(diaSEIR - diaSIR)}</div>
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

  // Con R₀ efectivo ≤ 1 no hace falta inmunidad alguna: 0 %. Hasta el 04/11/2026 la rama sin
  // control no acotaba y con R₀ 0,2 pintaba «-400%» (hallazgo 4031).
  const umbralInmunidad = Math.max(0, 1 - 1 / r0efectivo);

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
          <label htmlFor="rt-beta" className={styles.sliderLabel}>
            <span>β Tasa de transmisión</span>
            <span className={styles.sliderValor}>{formatNumber(beta, 2)}</span>
          </label>
          <input id="rt-beta" type="range" className={styles.sliderInput}
            style={{ ['--pct' as string]: `${((beta - 0.1) / 0.7) * 100}%` }}
            min={0.1} max={0.8} step={0.01} value={beta}
            onChange={(e) => setBeta(Number(e.target.value))}
            aria-valuetext={formatNumber(beta, 2)}
          />
          <span className={styles.sliderDesc}>R₀ = β/γ = <strong>{formatNumber(r0, 2)}</strong></span>
        </div>
        <div className={styles.sliderGroup}>
          <label htmlFor="rt-gamma" className={styles.sliderLabel}>
            <span>γ Tasa de recuperación</span>
            <span className={styles.sliderValor}>{formatNumber(gamma, 2)}</span>
          </label>
          <input id="rt-gamma" type="range" className={styles.sliderInput}
            style={{ ['--pct' as string]: `${((gamma - 0.05) / 0.45) * 100}%` }}
            min={0.05} max={0.5} step={0.01} value={gamma}
            onChange={(e) => setGamma(Number(e.target.value))}
            aria-valuetext={formatNumber(gamma, 2)}
          />
          <span className={styles.sliderDesc}>1/γ ≈ {formatNumber(1 / gamma, 1)} días de infección</span>
        </div>
        <div className={styles.sliderGroup}>
          <label htmlFor="rt-control" className={styles.sliderLabel}>
            <span><span aria-hidden="true">🎛️</span> Medidas de control</span>
            <span className={styles.sliderValor}>{pctEntero(control / 100)}</span>
          </label>
          <input id="rt-control" type="range" className={styles.sliderInput}
            style={{ ['--pct' as string]: `${pct}%` }}
            min={0} max={90} step={5} value={control}
            onChange={(e) => setControl(Number(e.target.value))}
            aria-valuetext={`${pctEntero(control / 100)} menos de transmisión`}
          />
          <span className={styles.sliderDesc}>
            Reduce β en {pctEntero(control / 100)} → β efectiva = {formatNumber(betaEfectiva, 3)} → R₀ efectivo = {formatNumber(r0efectivo, 2)}
          </span>
        </div>
        <div className={styles.metricaCard} style={{ alignSelf: 'center' }}>
          <div className={styles.metricaValor}>{pctEntero(umbralInmunidad)}</div>
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
          aria-label={`Curva de número reproductivo efectivo Rₜ. R₀ = ${formatNumber(r0, 2)}, control ${pctEntero(control / 100)}, R₀ efectivo ${formatNumber(r0efectivo, 2)}`}
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
  const handleSeleccionar = (idx: number) => {
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
        cargar automáticamente sus parámetros en el Simulador SIR (y su σ en el Modelo SEIR). Si
        una β pasa del máximo del deslizador, se recorta a {cifra(RANGO.beta.max)} y se avisa.
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
              <tr key={e.nombre}>
                <td><strong><span aria-hidden="true">{e.emoji}</span> {e.nombre}</strong></td>
                <td>
                  <span className={`${styles.r0Badge} ${badgeClass(e.r0)}`}>{cifra(e.r0)}</span>
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
                    aria-label={`Simular ${e.nombre} con R₀ ${cifra(e.r0)}`}
                  >
                    Simular
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorModelosEpidemiologicos() {
  const [seccion, setSeccion] = useState<SeccionActiva>('sir');
  // Los parámetros viven aquí y no en cada pestaña: así «Simular» de la tabla los carga. Hasta el
  // 04/11/2026 cada pestaña tenía su useState y el botón solo cambiaba de pestaña, que se volvía
  // a montar con 0,3 / 0,1 / 5 para cualquier enfermedad (hallazgo 4029).
  const [parametrosSIR, setParametrosSIR] = useState<ParametrosSIR>({ beta: 0.3, gamma: 0.1, i0: 5 });
  const [parametrosSEIR, setParametrosSEIR] = useState<ParametrosSEIR>({ beta: 0.3, gamma: 0.1, sigma: 0.2 });
  const [preset, setPreset] = useState<PresetCargado | null>(null);

  const handleSeleccionarEnfermedad = useCallback((e: EnfermedadPreset) => {
    const beta = acotar(e.beta, RANGO.beta);
    const gamma = acotar(e.gamma, RANGO.gamma);
    setParametrosSIR({ beta, gamma, i0: 5 });
    setParametrosSEIR({ beta, gamma, sigma: acotar(e.sigma, RANGO.sigma) });
    setPreset({ enfermedad: e, betaRecortada: beta !== e.beta });
    setSeccion('sir');
  }, []);

  const cambiarSIR = useCallback((p: ParametrosSIR) => {
    setParametrosSIR(p);
    setPreset(null); // ya no son los de la enfermedad cargada
  }, []);

  const SECCIONES: { id: SeccionActiva; icon: string; label: string }[] = [
    { id: 'sir', icon: '📈', label: 'Simulador SIR' },
    { id: 'seir', icon: '🔬', label: 'Modelo SEIR' },
    { id: 'rt', icon: '📊', label: 'Rₜ y Control' },
    { id: 'comparativa', icon: '🗂️', label: 'Enfermedades' },
  ];

  return (
    <>
      {/* El JSON-LD (WebApplication y FAQPage) lo inyecta layout.tsx: repetirlo aquí servía dos
          WebApplication (hallazgo 4037). */}
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
          {seccion === 'sir' && <SeccionSIR parametros={parametrosSIR} onCambiar={cambiarSIR} preset={preset} />}
          {seccion === 'seir' && <SeccionSEIR parametros={parametrosSEIR} onCambiar={setParametrosSEIR} />}
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
              (1 − 1/R₀) × 100 % de la población es inmune. Para sarampión (R₀ ≈ 15) se necesita el
              93 %; para gripe estacional (R₀ ≈ 1,3) basta el 23 %. Este umbral puede alcanzarse por infección
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

        <RelatedApps />
        <ShareCard appName="visualizador-modelos-epidemiologicos" />
        <Footer appName="visualizador-modelos-epidemiologicos" />
      </div>
    </>
  );
}
