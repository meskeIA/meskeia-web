'use client';
// @disclaimer: exempt

import { useState, useCallback, useMemo } from 'react';
import styles from './EstadisticaInferencial.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type SeccionId = 'pvalor' | 'errores' | 'intervalos' | 'potencia';

interface SeccionInfo {
  id: SeccionId;
  titulo: string;
  icono: string;
  subtitulo: string;
}

interface PuntoSVG {
  x: number;
  y: number;
}

interface IntervaloConfianza {
  centro: number;
  radio: number;
  captura: boolean;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const SECCIONES: SeccionInfo[] = [
  { id: 'pvalor', titulo: 'P-valor', icono: '📉', subtitulo: 'El más malinterpretado' },
  { id: 'errores', titulo: 'Errores Tipo I/II', icono: '⚖️', subtitulo: 'Trade-off inevitable' },
  { id: 'intervalos', titulo: 'Intervalos de confianza', icono: '📏', subtitulo: 'La interpretación correcta' },
  { id: 'potencia', titulo: 'Potencia estadística', icono: '🔋', subtitulo: 'Detectar lo que es real' },
];

// ─────────────────────────────────────────────
// Utilidades matemáticas
// ─────────────────────────────────────────────

/** Densidad de la distribución normal estándar */
function dnorm(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** Distribución normal con media mu y desviación sigma */
function dnormMuSigma(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (Math.sqrt(2 * Math.PI) * sigma);
}

/** CDF normal estándar aproximada (Zelen & Severo) */
function pnorm(z: number): number {
  const sign = z >= 0 ? 1 : -1;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530
    + t * (-0.356563782
    + t * (1.781477937
    + t * (-1.821255978
    + t * 1.330274429))));
  const pdf = dnorm(Math.abs(z));
  return 0.5 + sign * (0.5 - pdf * poly);
}

/** P-valor bilateral para estadístico z */
function calcularPValor(z: number): number {
  return 2 * (1 - pnorm(Math.abs(z)));
}

/** Genera puntos SVG de la curva normal estándar */
function curvaGaussiana(xMin: number, xMax: number, pasos: number, mu = 0, sigma = 1): PuntoSVG[] {
  const puntos: PuntoSVG[] = [];
  for (let i = 0; i <= pasos; i++) {
    const xVal = xMin + (i / pasos) * (xMax - xMin);
    puntos.push({ x: xVal, y: dnormMuSigma(xVal, mu, sigma) });
  }
  return puntos;
}

/** Mapea coordenadas de gráfica a coordenadas SVG */
function escalarX(x: number, xMin: number, xMax: number, svgW: number): number {
  return ((x - xMin) / (xMax - xMin)) * svgW;
}

function escalarY(y: number, yMax: number, svgH: number, padT: number, padB: number): number {
  return padT + (1 - y / yMax) * (svgH - padT - padB);
}

function puntosAPolyline(
  puntos: PuntoSVG[],
  xMin: number, xMax: number,
  yMax: number,
  svgW: number, svgH: number,
  padT: number, padB: number,
): string {
  return puntos
    .map(({ x, y }) =>
      `${escalarX(x, xMin, xMax, svgW).toFixed(1)},${escalarY(y, yMax, svgH, padT, padB).toFixed(1)}`
    )
    .join(' ');
}

/** Genera un intervalo de confianza aleatorio para la simulación */
function generarIC(parametroReal: number, n: number): IntervaloConfianza {
  const se = 1 / Math.sqrt(n); // error estándar simplificado (sigma=1)
  const centro = parametroReal + (Math.random() - 0.5) * 2 * se * 3;
  const radio = 1.96 * se;
  const captura = Math.abs(centro - parametroReal) <= radio;
  return { centro, radio, captura };
}

// ─────────────────────────────────────────────
// Componentes SVG internos
// ─────────────────────────────────────────────

interface SvgPValorProps {
  estadistico: number;
  pvalor: number;
  alpha: number;
}

function SvgPValor({ estadistico, pvalor, alpha: _alpha }: SvgPValorProps) {
  const SVG_W = 600;
  const SVG_H = 180;
  const PAD_T = 15;
  const PAD_B = 30;
  const X_MIN = -4;
  const X_MAX = 4;
  const Y_MAX = 0.42;

  const curva = curvaGaussiana(X_MIN, X_MAX, 200);
  const linePts = puntosAPolyline(curva, X_MIN, X_MAX, Y_MAX, SVG_W, SVG_H, PAD_T, PAD_B);

  // Zona sombreada derecha (|z| > |estadistico|)
  const absZ = Math.abs(estadistico);

  const zonaDerechaPts = curva
    .filter((p) => p.x >= absZ)
    .map(({ x, y }) =>
      `${escalarX(x, X_MIN, X_MAX, SVG_W).toFixed(1)},${escalarY(y, Y_MAX, SVG_H, PAD_T, PAD_B).toFixed(1)}`
    )
    .join(' ');

  const zonaIzqPts = curva
    .filter((p) => p.x <= -absZ)
    .map(({ x, y }) =>
      `${escalarX(x, X_MIN, X_MAX, SVG_W).toFixed(1)},${escalarY(y, Y_MAX, SVG_H, PAD_T, PAD_B).toFixed(1)}`
    )
    .join(' ');

  const baseY = escalarY(0, Y_MAX, SVG_H, PAD_T, PAD_B);

  const xZDer = escalarX(absZ, X_MIN, X_MAX, SVG_W);
  const xZIzq = escalarX(-absZ, X_MIN, X_MAX, SVG_W);

  // Ejes X
  const ejeLabels = [-3, -2, -1, 0, 1, 2, 3];

  const rechaza = pvalor < 0.05;

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} aria-label={`Distribución normal con estadístico z=${estadistico.toFixed(2)}`}>
      {/* Zona p-valor derecha */}
      {zonaDerechaPts.length > 0 && (
        <polygon
          points={`${xZDer.toFixed(1)},${baseY} ${zonaDerechaPts} ${SVG_W},${baseY}`}
          fill={rechaza ? 'rgba(229,62,62,0.25)' : 'rgba(46,134,171,0.2)'}
        />
      )}
      {/* Zona p-valor izquierda */}
      {zonaIzqPts.length > 0 && (
        <polygon
          points={`0,${baseY} ${zonaIzqPts} ${xZIzq.toFixed(1)},${baseY}`}
          fill={rechaza ? 'rgba(229,62,62,0.25)' : 'rgba(46,134,171,0.2)'}
        />
      )}
      {/* Curva normal */}
      <polyline points={linePts} fill="none" stroke="#2E86AB" strokeWidth="2.5" />
      {/* Línea estadístico */}
      <line
        x1={xZDer.toFixed(1)} y1={PAD_T}
        x2={xZDer.toFixed(1)} y2={baseY}
        stroke={rechaza ? '#e53e3e' : '#2E86AB'}
        strokeWidth="2"
        strokeDasharray="4,3"
      />
      <line
        x1={xZIzq.toFixed(1)} y1={PAD_T}
        x2={xZIzq.toFixed(1)} y2={baseY}
        stroke={rechaza ? '#e53e3e' : '#2E86AB'}
        strokeWidth="2"
        strokeDasharray="4,3"
      />
      {/* Línea base */}
      <line x1={0} y1={baseY} x2={SVG_W} y2={baseY} stroke="currentColor" strokeWidth="1" opacity="0.25" />
      {/* Etiquetas eje X */}
      {ejeLabels.map((val) => (
        <text
          key={val}
          x={escalarX(val, X_MIN, X_MAX, SVG_W)}
          y={baseY + 16}
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          opacity="0.55"
        >
          {val}
        </text>
      ))}
      {/* Etiqueta estadístico */}
      <text
        x={xZDer.toFixed(1)}
        y={PAD_T - 2}
        textAnchor="middle"
        fontSize="11"
        fill={rechaza ? '#e53e3e' : '#2E86AB'}
        fontWeight="700"
      >
        z={estadistico.toFixed(2)}
      </text>
    </svg>
  );
}

interface SvgErroresProps {
  alpha: number;
  efectoDesv: number;
}

function SvgErrores({ alpha, efectoDesv }: SvgErroresProps) {
  const SVG_W = 600;
  const SVG_H = 180;
  const PAD_T = 15;
  const PAD_B = 30;
  const X_MIN = -4;
  const X_MAX = 4 + efectoDesv;
  const Y_MAX = 0.45;

  // z_alpha para alpha bilateral
  const zAlpha = (() => {
    // Bisección para encontrar z tal que pnorm(z)=1-alpha/2
    let lo = 0;
    let hi = 5;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (pnorm(mid) < 1 - alpha / 2) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  })();

  const curvaH0 = curvaGaussiana(X_MIN, X_MAX, 250, 0, 1);
  const curvaH1 = curvaGaussiana(X_MIN, X_MAX, 250, efectoDesv, 1);

  const lineH0 = puntosAPolyline(curvaH0, X_MIN, X_MAX, Y_MAX, SVG_W, SVG_H, PAD_T, PAD_B);
  const lineH1 = puntosAPolyline(curvaH1, X_MIN, X_MAX, Y_MAX, SVG_W, SVG_H, PAD_T, PAD_B);

  const baseY = escalarY(0, Y_MAX, SVG_H, PAD_T, PAD_B);

  // Error tipo I: zona de rechazo de H0 (> zAlpha) en H0
  const zonaAlphaD = curvaH0
    .filter((p) => p.x >= zAlpha)
    .map(({ x, y }) =>
      `${escalarX(x, X_MIN, X_MAX, SVG_W).toFixed(1)},${escalarY(y, Y_MAX, SVG_H, PAD_T, PAD_B).toFixed(1)}`
    ).join(' ');

  const xCritico = escalarX(zAlpha, X_MIN, X_MAX, SVG_W);

  // Error tipo II: zona donde NO se rechaza H0 pero H1 es cierta (< zAlpha en H1)
  const zonaError2 = curvaH1
    .filter((p) => p.x <= zAlpha)
    .map(({ x, y }) =>
      `${escalarX(x, X_MIN, X_MAX, SVG_W).toFixed(1)},${escalarY(y, Y_MAX, SVG_H, PAD_T, PAD_B).toFixed(1)}`
    ).join(' ');

  const xInicioH1 = escalarX(X_MIN, X_MIN, X_MAX, SVG_W);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} aria-label="Distribuciones H0 y H1 mostrando errores tipo I y II">
      {/* Error tipo I (alpha) - zona roja en H0 a la derecha del punto crítico */}
      {zonaAlphaD.length > 0 && (
        <polygon
          points={`${xCritico.toFixed(1)},${baseY} ${zonaAlphaD} ${SVG_W},${baseY}`}
          fill="rgba(229,62,62,0.3)"
        />
      )}
      {/* Error tipo II (beta) - zona naranja en H1 a la izquierda del punto crítico */}
      {zonaError2.length > 0 && (
        <polygon
          points={`${xInicioH1},${baseY} ${zonaError2} ${xCritico.toFixed(1)},${baseY}`}
          fill="rgba(237,137,54,0.3)"
        />
      )}
      {/* Curva H0 */}
      <polyline points={lineH0} fill="none" stroke="#2E86AB" strokeWidth="2.5" />
      {/* Curva H1 */}
      <polyline points={lineH1} fill="none" stroke="#48A9A6" strokeWidth="2.5" strokeDasharray="6,3" />
      {/* Línea base */}
      <line x1={0} y1={baseY} x2={SVG_W} y2={baseY} stroke="currentColor" strokeWidth="1" opacity="0.25" />
      {/* Punto crítico */}
      <line
        x1={xCritico.toFixed(1)} y1={PAD_T}
        x2={xCritico.toFixed(1)} y2={baseY}
        stroke="#718096" strokeWidth="1.5" strokeDasharray="5,3"
      />
      {/* Etiquetas */}
      <text x="20" y={PAD_T + 12} fontSize="11" fill="#2E86AB" fontWeight="700">H₀</text>
      <text x={escalarX(efectoDesv, X_MIN, X_MAX, SVG_W) + 6} y={PAD_T + 12} fontSize="11" fill="#48A9A6" fontWeight="700">H₁</text>
      <text x={xCritico.toFixed(1)} y={baseY + 15} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">
        z_crit={zAlpha.toFixed(2)}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEstadisticaInferencial() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('pvalor');

  // ── Bloque 1: p-valor ──
  const [estadistico, setEstadistico] = useState(1.5);

  // ── Bloque 2: errores tipo I/II ──
  const [alphaErr, setAlphaErr] = useState(0.05);
  const [efectoErr, setEfectoErr] = useState(1.5);

  // ── Bloque 3: intervalos de confianza ──
  const [nIC, setNIC] = useState(30);
  const [intervalos, setIntervalos] = useState<IntervaloConfianza[]>([]);
  const [simulado, setSimulado] = useState(false);

  // ── Bloque 4: potencia ──
  const [nPotencia, setNPotencia] = useState(30);
  const [efectoPotencia, setEfectoPotencia] = useState(0.5);

  // ── Cálculos p-valor ──
  const pValor = useMemo(() => calcularPValor(estadistico), [estadistico]);
  const rechaza = pValor < 0.05;

  // ── Cálculos errores tipo I/II ──
  const zAlphaErr = useMemo(() => {
    let lo = 0;
    let hi = 5;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (pnorm(mid) < 1 - alphaErr / 2) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }, [alphaErr]);

  const betaErr = useMemo(() => {
    // Beta = P(no rechazar H0 | H1 cierta) = P(Z < z_alpha - delta) donde delta = efecto
    return pnorm(zAlphaErr - efectoErr);
  }, [zAlphaErr, efectoErr]);

  const potenciaErr = 1 - betaErr;

  // ── Simulación IC ──
  const PARAMETRO_REAL = 2;

  const simularIC = useCallback(() => {
    const nuevos: IntervaloConfianza[] = [];
    for (let i = 0; i < 100; i++) {
      nuevos.push(generarIC(PARAMETRO_REAL, nIC));
    }
    setIntervalos(nuevos);
    setSimulado(true);
  }, [nIC]);

  const icCapturan = intervalos.filter((ic) => ic.captura).length;

  // Escala para la barra SVG de IC
  const IC_MIN = PARAMETRO_REAL - 3;
  const IC_MAX = PARAMETRO_REAL + 3;
  const IC_BAR_W = 280; // px lógicos

  // ── Cálculo potencia ──
  const potenciaPct = useMemo(() => {
    const se = 1 / Math.sqrt(nPotencia);
    const zCrit = 1.96; // alpha=0.05 bilateral
    const z = efectoPotencia / se - zCrit;
    return Math.max(0, Math.min(100, Math.round(pnorm(z) * 100)));
  }, [nPotencia, efectoPotencia]);

  const interpretarPotencia = (p: number): string => {
    if (p >= 80) return 'Potencia adecuada (≥80%). El estudio tiene suficiente tamaño para detectar el efecto si existe.';
    if (p >= 50) return 'Potencia moderada. Hay riesgo real de no detectar el efecto (error tipo II elevado).';
    return 'Potencia baja (<50%). El estudio probablemente no detectará el efecto aunque sea real. Aumenta n o el tamaño del efecto.';
  };

  const interpretarPValor = (): string => {
    if (pValor < 0.001) return `p = ${pValor.toFixed(4)} — Probabilidad muy baja de observar estos datos si H₀ fuera cierta. Se rechaza H₀.`;
    if (pValor < 0.05) return `p = ${pValor.toFixed(3)} — Por debajo de α=0.05. Se rechaza H₀. Los datos son estadísticamente significativos.`;
    if (pValor < 0.1) return `p = ${pValor.toFixed(3)} — Entre 0.05 y 0.10. No se rechaza H₀ con α=0.05. Evidencia débil o borderline.`;
    return `p = ${pValor.toFixed(3)} — Por encima de 0.05. No hay evidencia suficiente para rechazar H₀.`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Estadística Inferencial</h1>
        <p>
          El p-valor, errores tipo I y II, intervalos de confianza y potencia estadística —
          los conceptos más malinterpretados en ciencia, explicados de forma visual.
        </p>
      </header>

      <LegalNotice />

      {/* ── Navegación de secciones ── */}
      <nav aria-label="Secciones de estadística inferencial">
        <div className={styles.seccionNav}>
          {SECCIONES.map((sec) => (
            <button
              key={sec.id}
              type="button"
              className={`${styles.seccionBtn} ${seccionActiva === sec.id ? styles.seccionBtnActivo : ''}`}
              onClick={() => setSeccionActiva(sec.id)}
              aria-pressed={seccionActiva === sec.id}
            >
              <span className={styles.seccionIcono} aria-hidden="true">{sec.icono}</span>
              <span className={styles.seccionTitulo}>{sec.titulo}</span>
              <span className={styles.seccionSubtitulo}>{sec.subtitulo}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className={styles.contenido}>

        {/* ════════════════════════════════════════
            SECCIÓN 1: P-VALOR
            ════════════════════════════════════════ */}
        {seccionActiva === 'pvalor' && (
          <div className={styles.bloqueCard}>
            <h2>El p-valor</h2>
            <p className={styles.bloqueDescripcion}>
              Mueve el slider para cambiar el valor del estadístico de contraste z.
              Observa en tiempo real cómo cambia el p-valor y cuándo se rechaza H₀.
            </p>

            <div className={styles.controles}>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>
                  <span>Estadístico z (valor del test)</span>
                  <span className={styles.controlValor}>z = {estadistico.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  className={styles.slider}
                  min={-4}
                  max={4}
                  step={0.05}
                  value={estadistico}
                  onChange={(e) => setEstadistico(parseFloat(e.target.value))}
                  aria-label="Valor del estadístico z"
                />
              </div>
            </div>

            <div className={styles.svgWrapper}>
              <SvgPValor estadistico={estadistico} pvalor={pValor} alpha={0.05} />
            </div>

            <div className={styles.resultado}>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>P-valor</span>
                <span className={`${styles.valor} ${rechaza ? styles.valorRechaza : styles.valorAcepta}`}>
                  {pValor < 0.001 ? '<0.001' : pValor.toFixed(3)}
                </span>
              </div>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Nivel α</span>
                <span className={styles.valor}>0.05</span>
              </div>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Decisión</span>
                <span className={`${styles.valor} ${rechaza ? styles.valorRechaza : styles.valorAcepta}`} style={{ fontSize: '1rem' }}>
                  {rechaza ? 'Rechazar H₀' : 'No rechazar H₀'}
                </span>
              </div>
            </div>

            <div
              className={`${styles.mensajeInterpretacion} ${rechaza ? styles.mensajeRechaza : styles.mensajeAcepta}`}
              role="status"
              aria-live="polite"
            >
              {interpretarPValor()}
            </div>

            <div className={styles.warningBox}>
              <strong>Cuidado con el malentendido más común:</strong> El p-valor{' '}
              <em>no</em> es la probabilidad de que H₀ sea cierta. Es la probabilidad de
              observar estos datos (o más extremos) <em>suponiendo que H₀ fuera cierta</em>.
              Esta confusión ha generado miles de estudios irreproducibles.
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            SECCIÓN 2: ERRORES TIPO I y II
            ════════════════════════════════════════ */}
        {seccionActiva === 'errores' && (
          <div className={styles.bloqueCard}>
            <h2>Errores Tipo I y Tipo II</h2>
            <p className={styles.bloqueDescripcion}>
              Azul sólido: distribución bajo H₀. Verde punteado: distribución bajo H₁.
              Rojo: error tipo I (α). Naranja: error tipo II (β). Al reducir uno, el otro aumenta.
            </p>

            <div className={styles.controles}>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>
                  <span>Nivel de significación α</span>
                  <span className={styles.controlValor}>{alphaErr.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  className={styles.slider}
                  min={0.01}
                  max={0.25}
                  step={0.01}
                  value={alphaErr}
                  onChange={(e) => setAlphaErr(parseFloat(e.target.value))}
                  aria-label="Nivel de significación alpha"
                />
              </div>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>
                  <span>Tamaño del efecto (separación H₀/H₁)</span>
                  <span className={styles.controlValor}>{efectoErr.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  className={styles.slider}
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={efectoErr}
                  onChange={(e) => setEfectoErr(parseFloat(e.target.value))}
                  aria-label="Tamaño del efecto"
                />
              </div>
            </div>

            <div className={styles.svgWrapper}>
              <SvgErrores alpha={alphaErr} efectoDesv={efectoErr} />
            </div>

            <div className={styles.leyendaErrores}>
              <div className={styles.leyendaItem + ' ' + styles.leyendaVP}>
                Verdadero positivo
                <small>Rechazar H₀ cuando es falsa ✓</small>
              </div>
              <div className={styles.leyendaItem + ' ' + styles.leyendaFP}>
                Error Tipo I (α = {alphaErr.toFixed(2)})
                <small>Rechazar H₀ cuando es verdadera ✗</small>
              </div>
              <div className={styles.leyendaItem + ' ' + styles.leyendaFN}>
                Error Tipo II (β ≈ {betaErr.toFixed(2)})
                <small>No rechazar H₀ cuando es falsa ✗</small>
              </div>
              <div className={styles.leyendaItem + ' ' + styles.leyendaVN}>
                Verdadero negativo
                <small>No rechazar H₀ cuando es verdadera ✓</small>
              </div>
            </div>

            <div className={styles.resultado} style={{ marginTop: '0.75rem' }}>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Error Tipo I (α)</span>
                <span className={styles.valor} style={{ color: '#e53e3e' }}>{alphaErr.toFixed(2)}</span>
              </div>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Error Tipo II (β)</span>
                <span className={styles.valor} style={{ color: '#dd6b20' }}>{betaErr.toFixed(2)}</span>
              </div>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Potencia (1-β)</span>
                <span className={styles.valor} style={{ color: '#38a169' }}>{potenciaErr.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            SECCIÓN 3: INTERVALOS DE CONFIANZA
            ════════════════════════════════════════ */}
        {seccionActiva === 'intervalos' && (
          <div className={styles.bloqueCard}>
            <h2>Intervalos de Confianza del 95%</h2>
            <p className={styles.bloqueDescripcion}>
              Simula 100 muestras del mismo experimento. Cada barra es un IC del 95%.
              El 95% de los IC debería capturar el parámetro real (línea negra vertical).
              Así es como se interpreta el intervalo de confianza — no como una probabilidad sobre un IC concreto.
            </p>

            <div className={styles.controles}>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>
                  <span>Tamaño muestral n (por muestra)</span>
                  <span className={styles.controlValor}>{nIC}</span>
                </label>
                <input
                  type="range"
                  className={styles.slider}
                  min={5}
                  max={100}
                  step={5}
                  value={nIC}
                  onChange={(e) => { setNIC(parseInt(e.target.value)); setSimulado(false); setIntervalos([]); }}
                  aria-label="Tamaño muestral"
                />
              </div>
            </div>

            <div className={styles.botonesRow}>
              <button type="button" className={styles.btnPrimario} onClick={simularIC}>
                Simular 100 muestras
              </button>
              {simulado && (
                <button
                  type="button"
                  className={styles.btnSecundario}
                  onClick={() => { setSimulado(false); setIntervalos([]); }}
                >
                  Limpiar
                </button>
              )}
            </div>

            {simulado && (
              <>
                <div className={styles.icContador} role="status" aria-live="polite">
                  <span>IC que capturan μ: <strong>{icCapturan}/100</strong></span>
                  <span style={{ color: '#e53e3e' }}>IC que NO capturan: <strong>{100 - icCapturan}</strong></span>
                </div>

                <div className={styles.icGrid} role="img" aria-label={`${icCapturan} de 100 intervalos de confianza capturan el parámetro real`}>
                  {intervalos.map((ic, idx) => {
                    const xLeft = ((ic.centro - ic.radio - IC_MIN) / (IC_MAX - IC_MIN)) * IC_BAR_W;
                    const xRight = ((ic.centro + ic.radio - IC_MIN) / (IC_MAX - IC_MIN)) * IC_BAR_W;
                    const xParam = ((PARAMETRO_REAL - IC_MIN) / (IC_MAX - IC_MIN)) * IC_BAR_W;
                    const width = Math.max(2, xRight - xLeft);
                    return (
                      <div key={idx} className={styles.icFila} aria-label={`IC ${idx + 1}: ${ic.captura ? 'captura' : 'no captura'} el parámetro`}>
                        <div style={{ width: IC_BAR_W, position: 'relative', height: '10px', flexShrink: 0 }}>
                          {/* Barra IC */}
                          <div
                            className={`${styles.icBarra} ${ic.captura ? styles.icBarraCaptura : styles.icBarraMiss}`}
                            style={{
                              position: 'absolute',
                              left: `${Math.max(0, xLeft)}px`,
                              width: `${width}px`,
                              top: 0,
                            }}
                          />
                          {/* Línea parámetro real */}
                          <div
                            className={styles.icParametro}
                            style={{ position: 'absolute', left: `${xParam}px`, top: 0 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.warningBox}>
                  <strong>La interpretación correcta:</strong> &ldquo;Si repitiéramos el experimento muchas veces,
                  el 95% de los intervalos construidos capturarían el parámetro real.&rdquo;
                  NO significa: &ldquo;hay un 95% de probabilidad de que el parámetro esté en este intervalo concreto.&rdquo;
                  Una vez calculado, el IC o captura el parámetro o no lo captura — no hay probabilidad.
                </div>
              </>
            )}

            {!simulado && (
              <div className={styles.mensajeInterpretacion}>
                Pulsa &ldquo;Simular 100 muestras&rdquo; para ver la distribución de intervalos de confianza.
                Prueba con diferentes valores de n para ver cómo cambia la anchura de los IC.
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            SECCIÓN 4: POTENCIA ESTADÍSTICA
            ════════════════════════════════════════ */}
        {seccionActiva === 'potencia' && (
          <div className={styles.bloqueCard}>
            <h2>Potencia estadística</h2>
            <p className={styles.bloqueDescripcion}>
              La potencia es la probabilidad de detectar un efecto real cuando existe (1-β).
              Un estudio con baja potencia &ldquo;pierde&rdquo; efectos reales. La convención mínima es 80%.
            </p>

            <div className={styles.controles}>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>
                  <span>Tamaño muestral n</span>
                  <span className={styles.controlValor}>{nPotencia}</span>
                </label>
                <input
                  type="range"
                  className={styles.slider}
                  min={5}
                  max={200}
                  step={5}
                  value={nPotencia}
                  onChange={(e) => setNPotencia(parseInt(e.target.value))}
                  aria-label="Tamaño muestral para el cálculo de potencia"
                />
              </div>
              <div className={styles.controlRow}>
                <label className={styles.controlLabel}>
                  <span>Tamaño del efecto (Cohen d)</span>
                  <span className={styles.controlValor}>{efectoPotencia.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  className={styles.slider}
                  min={0.1}
                  max={1.5}
                  step={0.05}
                  value={efectoPotencia}
                  onChange={(e) => setEfectoPotencia(parseFloat(e.target.value))}
                  aria-label="Tamaño del efecto Cohen d"
                />
              </div>
            </div>

            <div className={styles.potenciaWrapper}>
              <div className={styles.potenciaLabel}>
                <span>Potencia estadística</span>
                <span style={{ fontWeight: 700, color: potenciaPct >= 80 ? '#38a169' : potenciaPct >= 50 ? '#dd6b20' : '#e53e3e' }}>
                  {potenciaPct}%
                </span>
              </div>
              <div className={styles.potenciaBarraTrack} role="progressbar" aria-valuenow={potenciaPct} aria-valuemin={0} aria-valuemax={100} aria-label="Potencia estadística">
                <div
                  className={styles.potenciaBarraFill}
                  style={{ width: `${potenciaPct}%` }}
                >
                  {potenciaPct >= 20 ? `${potenciaPct}%` : ''}
                </div>
              </div>
              <p className={styles.potenciaInterpretacion} role="status" aria-live="polite">
                {interpretarPotencia(potenciaPct)}
              </p>
            </div>

            <div className={styles.resultado}>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>n muestral</span>
                <span className={styles.valor}>{nPotencia}</span>
              </div>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Efecto d</span>
                <span className={styles.valor}>{efectoPotencia.toFixed(2)}</span>
              </div>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Potencia</span>
                <span className={styles.valor} style={{ color: potenciaPct >= 80 ? '#38a169' : '#e53e3e' }}>
                  {potenciaPct}%
                </span>
              </div>
              <div className={styles.resultadoItem}>
                <span className={styles.label}>Efecto d referencia</span>
                <span className={styles.valor} style={{ fontSize: '0.8rem', color: '#718096' }}>
                  {efectoPotencia < 0.3 ? 'Pequeño' : efectoPotencia < 0.7 ? 'Mediano' : 'Grande'}
                </span>
              </div>
            </div>

            <div className={styles.warningBox}>
              <strong>El problema de los estudios con baja potencia:</strong> Cuando n es pequeño
              y el efecto es sutil, el test casi nunca lo detecta. Si el resultado sale p&gt;0.05,
              no podemos concluir que el efecto no existe — solo que el estudio no tenía poder
              para detectarlo. Muchos &ldquo;estudios negativos&rdquo; son simplemente estudios mal diseñados.
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            SECCIÓN EDUCATIVA v2.0
            ════════════════════════════════════════ */}
        <EducationalSection title="Guía de Estadística Inferencial" subtitle="Conceptos fundamentales de inferencia estadística: p-valor, errores tipo I/II, intervalos de confianza y potencia">
          <section>
            <h3>Inferencia estadística vs. descriptiva</h3>
            <p>
              La estadística <strong>descriptiva</strong> resume lo que ya tenemos (media, mediana, varianza de
              nuestra muestra). La estadística <strong>inferencial</strong> da el salto: a partir de una muestra,
              intenta sacar conclusiones sobre la población completa. Ese salto siempre conlleva incertidumbre,
              y los tests de hipótesis son la forma de cuantificarla.
            </p>
          </section>

          <section>
            <h3>H₀ y H₁: las dos hipótesis</h3>
            <p>
              La <strong>hipótesis nula H₀</strong> es siempre la del &ldquo;no efecto&rdquo;: &ldquo;no hay diferencia entre
              grupos&rdquo;, &ldquo;el coeficiente es cero&rdquo;, &ldquo;la proporción es 0.5&rdquo;. La{' '}
              <strong>hipótesis alternativa H₁</strong> es lo que el investigador quiere demostrar.
              El test de hipótesis pregunta: ¿son los datos compatibles con H₀, o son tan extremos
              que hacen dudar de ella?
            </p>
          </section>

          <section>
            <h3>El p-valor: qué es y qué NO es</h3>
            <p>
              El p-valor es la probabilidad de obtener un resultado <em>igual o más extremo</em> que
              el observado, <em>asumiendo que H₀ es cierta</em>. Un p-valor pequeño (p.ej., p=0.02)
              significa que si H₀ fuera cierta, veríamos estos datos solo el 2% de las veces.
            </p>
            <p><strong>Tres malentendidos frecuentes:</strong></p>
            <ul>
              <li>
                <strong>Error 1:</strong> &ldquo;p=0.03 significa que hay 3% de probabilidad de que H₀ sea cierta.&rdquo;
                — Falso. El p-valor no dice nada sobre la probabilidad de que H₀ sea verdad.
              </li>
              <li>
                <strong>Error 2:</strong> &ldquo;p&lt;0.05 significa que el efecto es grande o importante.&rdquo;
                — Falso. Con n suficientemente grande, cualquier diferencia mínima produce p&lt;0.05.
              </li>
              <li>
                <strong>Error 3:</strong> &ldquo;p=0.06 significa que casi hay efecto.&rdquo;
                — Falso. 0.06 y 0.05 son prácticamente lo mismo; el umbral 0.05 es una convención arbitraria.
              </li>
            </ul>
          </section>

          <section>
            <h3>Nivel de significación α: ¿por qué 0.05?</h3>
            <p>
              Ronald Fisher propuso α=0.05 en 1925 como umbral de conveniencia, no como ley científica.
              El nivel α es la tasa de error tipo I que estamos dispuestos a tolerar: si usamos α=0.05,
              rechazaremos H₀ incorrectamente el 5% de las veces, incluso cuando H₀ sea verdad.
              Algunos campos (física de partículas) exigen α=0.0000003 (5 sigmas) para declarar un descubrimiento.
            </p>
          </section>

          <section>
            <h3>Errores tipo I y tipo II: el trade-off inevitable</h3>
            <p>
              Si reducimos α para evitar falsos positivos (error tipo I), automáticamente aumentamos
              la tasa de falsos negativos (error tipo II). No podemos eliminar ambos a la vez con el mismo n.
              La única forma de reducir ambos simultáneamente es <strong>aumentar el tamaño muestral n</strong>.
            </p>
            <ul>
              <li><strong>Error tipo I (α):</strong> rechazar H₀ cuando es verdadera (falso positivo)</li>
              <li><strong>Error tipo II (β):</strong> no rechazar H₀ cuando es falsa (falso negativo)</li>
              <li><strong>Potencia (1-β):</strong> detectar el efecto cuando existe</li>
            </ul>
          </section>

          <section>
            <h3>Intervalos de confianza: la interpretación correcta</h3>
            <p>
              Un IC del 95% <strong>no</strong> significa: &ldquo;hay 95% de probabilidad de que el parámetro
              esté en este intervalo&rdquo;. El parámetro es un valor fijo (no aleatorio); el intervalo
              es aleatorio porque depende de la muestra.
            </p>
            <p>
              La interpretación correcta es frecuentista: si repitiéramos el mismo experimento
              infinitas veces y construyéramos un IC del 95% en cada ocasión, el 95% de esos
              intervalos capturarían el parámetro real. Una vez calculado el IC, o lo captura o no lo captura.
            </p>
          </section>

          <section>
            <h3>La crisis de replicación en ciencia</h3>
            <p>
              En 2015, el Reproducibility Project intentó replicar 100 estudios publicados en
              psicología. Solo el 39% obtuvo resultados similares. Las causas principales:
            </p>
            <ul>
              <li><strong>p-hacking:</strong> probar múltiples hipótesis hasta encontrar p&lt;0.05</li>
              <li><strong>HARKing:</strong> formular la hipótesis después de ver los datos</li>
              <li><strong>Baja potencia:</strong> muestras demasiado pequeñas que solo detectan efectos grandes</li>
              <li><strong>Sesgo de publicación:</strong> los resultados positivos se publican más que los negativos</li>
            </ul>
            <p>
              La solución no es abandonar los tests estadísticos, sino complementarlos con
              tamaños del efecto, intervalos de confianza amplios, pre-registro de hipótesis y
              mayor transparencia metodológica.
            </p>
          </section>

          <div className={styles.warningBox}>
            <strong>El error más costoso en ciencia:</strong> &ldquo;El p-valor no dice la probabilidad
            de que H₀ sea cierta. Es la probabilidad de obtener estos datos (o más extremos) SI H₀
            fuera cierta.&rdquo; Esta confusión, extendida entre investigadores, estudiantes y medios de
            comunicación, ha generado miles de estudios irreproducibles y décadas de resultados
            científicos que no sobrevivieron a la replicación.
          </div>
        </EducationalSection>

      </main>

      <RelatedApps apps={getRelatedApps('visualizador-estadistica-inferencial')} />
      <ShareCard appName="visualizador-estadistica-inferencial" />
      <Footer appName="visualizador-estadistica-inferencial" />
    </div>
  );
}
