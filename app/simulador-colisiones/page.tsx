'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { formatNumber } from '@/lib';
import styles from './SimuladorColisiones.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

interface Resultado {
  v1f: number;
  v2f: number;
  p_antes: number;
  p_despues: number;
  ek_antes: number;
  ek_despues: number;
  delta_ek: number;
  delta_ek_pct: number;
  tipo: 'elastica' | 'inelastica' | 'perfectamente-inelastica';
}

type FaseAnim = 'idle' | 'pre' | 'impact' | 'post' | 'done';

// ─────────────────────────────────────────────────────────────────────────────
// Física
// ─────────────────────────────────────────────────────────────────────────────

function calcularColision(m1: number, m2: number, v1: number, v2: number, e: number): Resultado {
  const v1f = ((m1 - e * m2) * v1 + m2 * (1 + e) * v2) / (m1 + m2);
  const v2f = (m1 * (1 + e) * v1 + (m2 - e * m1) * v2) / (m1 + m2);

  const p_antes = m1 * v1 + m2 * v2;
  const p_despues = m1 * v1f + m2 * v2f;
  const ek_antes = 0.5 * m1 * v1 ** 2 + 0.5 * m2 * v2 ** 2;
  const ek_despues = 0.5 * m1 * v1f ** 2 + 0.5 * m2 * v2f ** 2;
  const delta_ek = ek_despues - ek_antes;
  const delta_ek_pct = ek_antes !== 0 ? (delta_ek / ek_antes) * 100 : 0;

  const tipo: Resultado['tipo'] =
    e === 1 ? 'elastica'
    : e === 0 ? 'perfectamente-inelastica'
    : 'inelastica';

  return { v1f, v2f, p_antes, p_despues, ek_antes, ek_despues, delta_ek, delta_ek_pct, tipo };
}

function clasificarTipo(e: number): string {
  if (e === 1) return 'Colisión perfectamente elástica';
  if (e === 0) return 'Colisión perfectamente inelástica';
  if (e >= 0.9) return 'Colisión casi elástica';
  if (e <= 0.1) return 'Colisión casi inelástica';
  return 'Colisión inelástica parcial';
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometría de la animación (posiciones SVG en % del ancho)
// ─────────────────────────────────────────────────────────────────────────────
// Hasta el 09/11/2026 el choque era siempre en un punto fijo (A en el 43 %, B en el 57 %) y A
// salía con el signo cambiado (impacto − sentido·rapidez): con e = 0 los dos cuerpos «pegados»
// se separaban y un A que rebota se metía en B (hallazgo 4389). Ahora cada bloque se mueve con
// su velocidad real, a la misma escala antes y después del choque: x(t) = x_choque + v·s·t, con
// t de −1 a 0 en la aproximación y de 0 a 1 tras el choque. El punto de contacto se elige para
// que todo el recorrido quepa centrado en la pista, así que A nunca se solapa con B.
const POS_A_REPOSO = 18;  // sin choque posible: A a la izquierda…
const POS_B_REPOSO = 72;  // …y B a la derecha
const RECORRIDO_MAX = 18; // % que recorre el bloque más rápido en cada fase
const DUR_APROXIMACION = 900; // ms
const DUR_IMPACTO = 250;      // ms
const DUR_SALIDA = 900;       // ms

const tamBloque = (masa: number): number => Math.max(10, Math.min(22, masa * 1.5));

interface Geometria {
  /** Posición izquierda de A y B al empezar, en el choque y al terminar. */
  a: { inicio: number; choque: number; fin: number };
  b: { inicio: number; choque: number; fin: number };
  /** Punto de contacto: borde derecho de A = borde izquierdo de B. */
  contacto: number;
}

function calcularGeometria(m1: number, m2: number, v1: number, v2: number, res: Resultado): Geometria {
  const wA = tamBloque(m1);
  const wB = tamBloque(m2);
  const vMax = Math.max(Math.abs(v1), Math.abs(v2), Math.abs(res.v1f), Math.abs(res.v2f));
  const s = vMax > 0 ? RECORRIDO_MAX / vMax : 0;
  // Relativo al contacto (c = 0)
  const aInicio = -wA - v1 * s;
  const aFin = -wA + res.v1f * s;
  const bInicio = -v2 * s;
  const bFin = res.v2f * s;
  const izquierda = Math.min(aInicio, aFin, -wA);
  const derecha = Math.max(bInicio + wB, bFin + wB, wB);
  const contacto = (100 - (derecha - izquierda)) / 2 - izquierda;
  return {
    a: { inicio: contacto + aInicio, choque: contacto - wA, fin: contacto + aFin },
    b: { inicio: contacto + bInicio, choque: contacto, fin: contacto + bFin },
    contacto,
  };
}

/** Número de los deslizadores (paso 0,5): «4» o «4,5». */
const numCorto = (x: number): string => formatNumber(x, Number.isInteger(x) ? 0 : 1);

/** Velocidad con signo explícito: «+2,5». */
const conSigno = (x: number): string => (x > 0 ? '+' : '') + numCorto(x);

/** Un factor de la fórmula sustituida: los negativos, entre paréntesis y con signo menos. */
const factor = (texto: string): string => (texto.startsWith('-') ? `(−${texto.slice(1)})` : texto);

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function SimuladorColisionesPage() {
  const [m1, setM1] = useState(4);
  const [m2, setM2] = useState(2);
  const [v1, setV1] = useState(5);
  const [v2, setV2] = useState(-2);
  const [e, setE] = useState(1);

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [fase, setFase] = useState<FaseAnim>('idle');
  // Progreso de la animación: −1 → 0 en la aproximación, 0 en el impacto y 0 → 1 en la salida.
  const [progreso, setProgreso] = useState(-1);

  const animRef = useRef<number | null>(null);

  // Solo hay choque si A (detrás, a la izquierda) va más deprisa que B (hallazgo 4390).
  const hayChoque = v1 > v2;

  // Limpiar animación al desmontar
  useEffect(() => {
    return () => { if (animRef.current !== null) cancelAnimationFrame(animRef.current); };
  }, []);

  const lanzarSimulacion = useCallback(() => {
    if (!hayChoque) return;
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    const res = calcularColision(m1, m2, v1, v2, e);
    setResultado(res);

    const sinMovimiento = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (sinMovimiento) {
      setProgreso(1);
      setFase('done');
      return;
    }

    setFase('pre');
    setProgreso(-1);
    const t0 = performance.now();
    const paso = (ahora: number): void => {
      const t = ahora - t0;
      if (t < DUR_APROXIMACION) {
        setFase('pre');
        setProgreso(t / DUR_APROXIMACION - 1);
      } else if (t < DUR_APROXIMACION + DUR_IMPACTO) {
        setFase('impact');
        setProgreso(0);
      } else if (t < DUR_APROXIMACION + DUR_IMPACTO + DUR_SALIDA) {
        setFase('post');
        setProgreso((t - DUR_APROXIMACION - DUR_IMPACTO) / DUR_SALIDA);
      } else {
        setProgreso(1);
        setFase('done');
        animRef.current = null;
        return;
      }
      animRef.current = requestAnimationFrame(paso);
    };
    animRef.current = requestAnimationFrame(paso);
  }, [m1, m2, v1, v2, e, hayChoque]);

  const resetear = () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setFase('idle');
    setProgreso(-1);
    setResultado(null);
  };

  // Geometría del recorrido: con el resultado simulado o, en reposo, con el que daría la
  // configuración actual (para dibujar los bloques donde empezarán).
  const resGeometria = resultado ?? calcularColision(m1, m2, v1, v2, e);
  const geo = hayChoque || resultado ? calcularGeometria(m1, m2, v1, v2, resGeometria) : null;
  const interpolar = (p: { inicio: number; choque: number; fin: number }): number =>
    progreso <= 0 ? p.choque + (p.choque - p.inicio) * progreso : p.choque + (p.fin - p.choque) * progreso;
  const pos1 = geo ? interpolar(geo.a) : POS_A_REPOSO;
  const pos2 = geo ? interpolar(geo.b) : POS_B_REPOSO;

  // Bordes y relleno de los bloques (no son texto). El texto de cada objeto va con las clases
  // textoA / textoB del módulo, que cumplen el contraste en los dos temas (hallazgo 4392).
  const colores = {
    b1: '#2E86AB',
    b2: '#E07B39',
    impacto: '#E74C3C',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">💥</span> Simulador de Colisiones</h1>
        <p className={styles.subtitle}>
          Colisiones elásticas e inelásticas en 1D — momento lineal, energía cinética y coeficiente de restitución
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Controles ── */}
        <div className={styles.panelGrid}>

          {/* Objeto 1 */}
          <div className={styles.panelObj} style={{ borderTopColor: colores.b1 }}>
            <h2 className={`${styles.panelTitulo} ${styles.textoA}`}>
              Objeto A (azul)
            </h2>
            <div className={styles.sliderRow}>
              <label htmlFor="masa-a">Masa: <strong>{numCorto(m1)} kg</strong></label>
              <input id="masa-a" type="range" min={1} max={20} step={0.5} value={m1}
                onChange={e => { setM1(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Masa objeto A" />
              <span className={styles.sliderLimits}><span>1 kg</span><span>20 kg</span></span>
            </div>
            <div className={styles.sliderRow}>
              <label htmlFor="velocidad-a">Velocidad: <strong>{conSigno(v1)} m/s</strong></label>
              <input id="velocidad-a" type="range" min={-10} max={10} step={0.5} value={v1}
                onChange={e => { setV1(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Velocidad inicial objeto A" />
              <span className={styles.sliderLimits}><span>−10 m/s</span><span>+10 m/s</span></span>
            </div>
          </div>

          {/* Objeto 2 */}
          <div className={styles.panelObj} style={{ borderTopColor: colores.b2 }}>
            <h2 className={`${styles.panelTitulo} ${styles.textoB}`}>
              Objeto B (naranja)
            </h2>
            <div className={styles.sliderRow}>
              <label htmlFor="masa-b">Masa: <strong>{numCorto(m2)} kg</strong></label>
              <input id="masa-b" type="range" min={1} max={20} step={0.5} value={m2}
                onChange={e => { setM2(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Masa objeto B" />
              <span className={styles.sliderLimits}><span>1 kg</span><span>20 kg</span></span>
            </div>
            <div className={styles.sliderRow}>
              <label htmlFor="velocidad-b">Velocidad: <strong>{conSigno(v2)} m/s</strong></label>
              <input id="velocidad-b" type="range" min={-10} max={10} step={0.5} value={v2}
                onChange={e => { setV2(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Velocidad inicial objeto B" />
              <span className={styles.sliderLimits}><span>−10 m/s</span><span>+10 m/s</span></span>
            </div>
          </div>

          {/* Coeficiente de restitución */}
          <div className={styles.panelCoef}>
            <h2 className={styles.panelTitulo}>Tipo de Colisión</h2>
            <div className={styles.sliderRow}>
              <label htmlFor="coeficiente-restitucion">
                Coeficiente de restitución (e): <strong>{formatNumber(e, 2)}</strong>
              </label>
              <input id="coeficiente-restitucion" type="range" min={0} max={1} step={0.05} value={e}
                onChange={ev => { setE(Number(ev.target.value)); resetear(); }}
                className={styles.sliderCoef} aria-label="Coeficiente de restitución" />
              <span className={styles.sliderLimits}><span>0 — inelástica perfecta</span><span>1 — elástica perfecta</span></span>
            </div>
            <div className={styles.tipoBadge}>
              {clasificarTipo(e)}
            </div>
          </div>
        </div>

        {/* ── Advertencia si no habrá colisión ── */}
        {v1 <= v2 && (
          <div className={styles.noColision} role="alert">
            <span aria-hidden="true">⚠️</span> Con estas velocidades los objetos no colisionarán (A no alcanza a B). Aumenta v<sub>A</sub> o reduce v<sub>B</sub>.
          </div>
        )}

        {/* ── Botón simular ── */}
        <div className={styles.btnWrapper}>
          <button
            type="button"
            onClick={lanzarSimulacion}
            disabled={!hayChoque || fase === 'pre' || fase === 'impact' || fase === 'post'}
            className={styles.btnSimular}
          >
            {fase === 'idle' ? <><span aria-hidden="true">▶</span> Simular colisión</> : fase === 'done' ? <><span aria-hidden="true">↺</span> Volver a simular</> : <><span aria-hidden="true">⏳</span> Simulando...</>}
          </button>
        </div>

        {/* ── Animación SVG ── */}
        <div className={styles.pista} aria-label="Animación de la colisión">
          <svg viewBox="0 0 500 96" className={styles.pistaSvg}>
            {/* Suelo */}
            <line x1="0" y1="72" x2="500" y2="72" stroke="#888" strokeWidth="2" />
            {/* Marcas de escala */}
            {[0,1,2,3,4].map(i => (
              <line key={i} x1={50 + i*100} y1="72" x2={50 + i*100} y2="78"
                stroke="#aaa" strokeWidth="1" />
            ))}

            {/* Flecha velocidad A (inicial) */}
            {fase === 'idle' && v1 !== 0 && (
              <g>
                <line
                  x1={`${pos1 + tamBloque(m1) / 2}%`} y1="38"
                  x2={`${pos1 + tamBloque(m1) / 2 + (v1 > 0 ? 8 : -8)}%`} y2="38"
                  stroke={colores.b1} strokeWidth="2" markerEnd={v1 > 0 ? 'url(#arrow-b1-r)' : 'url(#arrow-b1-l)'} />
                <text x={`${pos1 + tamBloque(m1) / 2 + (v1 > 0 ? 9 : -9)}%`} y="31"
                  textAnchor="middle" fontSize="9" className={`${styles.rotulo} ${styles.svgTextoA}`}>
                  {conSigno(v1)} m/s
                </text>
              </g>
            )}
            {/* Flecha velocidad B (inicial) */}
            {fase === 'idle' && v2 !== 0 && (
              <g>
                <line
                  x1={`${pos2 + tamBloque(m2) / 2}%`} y1="38"
                  x2={`${pos2 + tamBloque(m2) / 2 + (v2 > 0 ? 8 : -8)}%`} y2="38"
                  stroke={colores.b2} strokeWidth="2" markerEnd={v2 > 0 ? 'url(#arrow-b2-r)' : 'url(#arrow-b2-l)'} />
                <text x={`${pos2 + tamBloque(m2) / 2 + (v2 > 0 ? 9 : -9)}%`} y="31"
                  textAnchor="middle" fontSize="9" className={`${styles.rotulo} ${styles.svgTextoB}`}>
                  {conSigno(v2)} m/s
                </text>
              </g>
            )}

            {/* Flash de impacto */}
            {fase === 'impact' && geo && (
              <circle cx={`${geo.contacto}%`} cy="55" r="18"
                fill={colores.impacto} opacity="0.25" />
            )}

            {/* Flechas post-colisión */}
            {fase === 'done' && resultado && resultado.v1f !== 0 && (
              <g>
                <line
                  x1={`${pos1 + tamBloque(m1) / 2}%`} y1="38"
                  x2={`${pos1 + tamBloque(m1) / 2 + (resultado.v1f > 0 ? 8 : -8)}%`} y2="38"
                  stroke={colores.b1} strokeWidth="2" strokeDasharray="4 2"
                  markerEnd={resultado.v1f > 0 ? 'url(#arrow-b1-r)' : 'url(#arrow-b1-l)'} />
                <text x={`${pos1 + tamBloque(m1) / 2 + (resultado.v1f > 0 ? 9 : -9)}%`} y="31"
                  textAnchor="middle" fontSize="9" className={`${styles.rotulo} ${styles.svgTextoA}`}>
                  {formatNumber(resultado.v1f, 1)} m/s
                </text>
              </g>
            )}
            {fase === 'done' && resultado && resultado.v2f !== 0 && (
              <g>
                <line
                  x1={`${pos2 + tamBloque(m2) / 2}%`} y1="38"
                  x2={`${pos2 + tamBloque(m2) / 2 + (resultado.v2f > 0 ? 8 : -8)}%`} y2="38"
                  stroke={colores.b2} strokeWidth="2" strokeDasharray="4 2"
                  markerEnd={resultado.v2f > 0 ? 'url(#arrow-b2-r)' : 'url(#arrow-b2-l)'} />
                <text x={`${pos2 + tamBloque(m2) / 2 + (resultado.v2f > 0 ? 9 : -9)}%`} y="31"
                  textAnchor="middle" fontSize="9" className={`${styles.rotulo} ${styles.svgTextoB}`}>
                  {formatNumber(resultado.v2f, 1)} m/s
                </text>
              </g>
            )}

            {/* Bloques (los mueve la animación por requestAnimationFrame, sin transición CSS) */}
            <rect
              x={`${pos1}%`} y={72 - tamBloque(m1)}
              width={`${tamBloque(m1)}%`} height={tamBloque(m1)}
              className={styles.bloqueA} rx="3"
            />
            <text x={`${pos1 + tamBloque(m1) / 2}%`} y={72 - tamBloque(m1) / 2 + 4}
              textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">A</text>

            <rect
              x={`${pos2}%`} y={72 - tamBloque(m2)}
              width={`${tamBloque(m2)}%`} height={tamBloque(m2)}
              fill={colores.b2} rx="3"
            />
            <text x={`${pos2 + tamBloque(m2) / 2}%`} y={72 - tamBloque(m2) / 2 + 4}
              textAnchor="middle" fontSize="9" fill="#1a1a1a" fontWeight="700">B</text>

            {/* Etiquetas de masa */}
            <text x={`${pos1 + tamBloque(m1) / 2}%`} y="86"
              textAnchor="middle" fontSize="8" className={`${styles.rotulo} ${styles.svgMasa}`}>{numCorto(m1)} kg</text>
            <text x={`${pos2 + tamBloque(m2) / 2}%`} y="86"
              textAnchor="middle" fontSize="8" className={`${styles.rotulo} ${styles.svgMasa}`}>{numCorto(m2)} kg</text>

            {/* Definiciones de flechas */}
            <defs>
              {[['b1-r', colores.b1, true], ['b1-l', colores.b1, false],
                ['b2-r', colores.b2, true], ['b2-l', colores.b2, false]].map(([id, color, right]) => (
                <marker key={id as string} id={`arrow-${id}`} markerWidth="6" markerHeight="6"
                  refX={right ? '5' : '1'} refY="3" orient="auto">
                  <path d={right ? 'M0,0 L0,6 L6,3 z' : 'M6,0 L6,6 L0,3 z'}
                    fill={color as string} />
                </marker>
              ))}
            </defs>
          </svg>
        </div>

        {/* ── Resultados ── */}
        {resultado && fase === 'done' && (
          <div className={styles.resultados} role="status" aria-live="polite" aria-atomic="true">
            <h2 className={styles.resultadosTitulo}>Resultados de la Colisión</h2>

            <div className={styles.resGrid}>
              {/* Velocidades finales */}
              <div className={styles.resCard} style={{ borderTopColor: colores.b1 }}>
                <p className={styles.resLabel}>Velocidad final A</p>
                <p className={`${styles.resValor} ${styles.textoA}`}>
                  {formatNumber(resultado.v1f, 2)} <span className={styles.resUnidad}>m/s</span>
                </p>
                <p className={styles.resSub}>
                  {resultado.v1f > 0 ? '→ dirección positiva' : resultado.v1f < 0 ? '← dirección negativa' : 'en reposo'}
                </p>
              </div>
              <div className={styles.resCard} style={{ borderTopColor: colores.b2 }}>
                <p className={styles.resLabel}>Velocidad final B</p>
                <p className={`${styles.resValor} ${styles.textoB}`}>
                  {formatNumber(resultado.v2f, 2)} <span className={styles.resUnidad}>m/s</span>
                </p>
                <p className={styles.resSub}>
                  {resultado.v2f > 0 ? '→ dirección positiva' : resultado.v2f < 0 ? '← dirección negativa' : 'en reposo'}
                </p>
              </div>

              {/* Momento lineal */}
              <div className={styles.resCard} style={{ borderTopColor: '#27AE60' }}>
                <p className={styles.resLabel}>Momento lineal total</p>
                <div className={styles.resFila}>
                  <span>Antes:</span>
                  <strong>{formatNumber(resultado.p_antes, 2)} kg·m/s</strong>
                </div>
                <div className={styles.resFila}>
                  <span>Después:</span>
                  <strong>{formatNumber(resultado.p_despues, 2)} kg·m/s</strong>
                </div>
                <p className={styles.resConservado}>
                  {Math.abs(resultado.p_antes - resultado.p_despues) < 0.001
                    ? <><span aria-hidden="true">✅</span> Conservado</>
                    : <><span aria-hidden="true">⚠️</span> Diferencia numérica</>}
                </p>
              </div>

              {/* Energía cinética */}
              <div className={styles.resCard} style={{ borderTopColor: '#8E44AD' }}>
                <p className={styles.resLabel}>Energía cinética</p>
                <div className={styles.resFila}>
                  <span>Antes:</span>
                  <strong>{formatNumber(resultado.ek_antes, 2)} J</strong>
                </div>
                <div className={styles.resFila}>
                  <span>Después:</span>
                  <strong>{formatNumber(resultado.ek_despues, 2)} J</strong>
                </div>
                <p className={`${styles.resDelta} ${resultado.delta_ek < -0.01 ? styles.textoB : styles.textoVerde}`}>
                  {`ΔEk = ${formatNumber(resultado.delta_ek, 2)} J (${resultado.delta_ek_pct >= 0 ? '+' : ''}${formatNumber(resultado.delta_ek_pct, 1)} %)`}
                </p>
              </div>
            </div>

            {/* Fórmulas aplicadas */}
            <div className={styles.formulas}>
              <h3>Fórmulas aplicadas</h3>
              <div className={styles.formulasGrid}>
                <div className={styles.formula}>
                  <p className={styles.formulaEq}>v'<sub>A</sub> = [(m<sub>A</sub>−e·m<sub>B</sub>)v<sub>A</sub> + m<sub>B</sub>(1+e)v<sub>B</sub>] / (m<sub>A</sub>+m<sub>B</sub>)</p>
                  <p className={styles.formulaResult}>
                    {`= [(${numCorto(m1)}−${formatNumber(e, 2)}·${numCorto(m2)})·${factor(numCorto(v1))} + ${numCorto(m2)}·${formatNumber(1 + e, 2)}·${factor(numCorto(v2))}] / ${numCorto(m1 + m2)} = `}
                    <strong>{formatNumber(resultado.v1f, 3)} m/s</strong>
                  </p>
                </div>
                <div className={styles.formula}>
                  <p className={styles.formulaEq}>v'<sub>B</sub> = [m<sub>A</sub>(1+e)v<sub>A</sub> + (m<sub>B</sub>−e·m<sub>A</sub>)v<sub>B</sub>] / (m<sub>A</sub>+m<sub>B</sub>)</p>
                  <p className={styles.formulaResult}>
                    {`= [${numCorto(m1)}·${formatNumber(1 + e, 2)}·${factor(numCorto(v1))} + (${numCorto(m2)}−${formatNumber(e, 2)}·${numCorto(m1)})·${factor(numCorto(v2))}] / ${numCorto(m1 + m2)} = `}
                    <strong>{formatNumber(resultado.v2f, 3)} m/s</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Sección educativa v2.0 ── */}
        <EducationalSection
          title="Guía de Colisiones en Física"
          subtitle="Tipos, fórmulas, aplicaciones y errores frecuentes"
          icon="💥"
        >
          {/* 1. Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>Tipos de Colisión — Comparativa</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr><th>Tipo</th><th>e</th><th>Momento</th><th>Energía Cinética</th><th>Ejemplo real</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Elástica perfecta</strong></td>
                    <td>e = 1</td>
                    <td><span aria-hidden="true">✅</span> Conservado</td>
                    <td><span aria-hidden="true">✅</span> Conservada</td>
                    <td>Bolas de billar, colisiones atómicas</td>
                  </tr>
                  <tr>
                    <td><strong>Inelástica parcial</strong></td>
                    <td>0 &lt; e &lt; 1</td>
                    <td><span aria-hidden="true">✅</span> Conservado</td>
                    <td><span aria-hidden="true">⚠️</span> Parte se disipa (calor, deformación)</td>
                    <td>Coche chocando, pelota contra suelo</td>
                  </tr>
                  <tr>
                    <td><strong>Inelástica perfecta</strong></td>
                    <td>e = 0</td>
                    <td><span aria-hidden="true">✅</span> Conservado</td>
                    <td><span aria-hidden="true">❌</span> Máxima pérdida compatible con la ley</td>
                    <td>Arcilla contra pared, vagones que se enganchan</td>
                  </tr>
                  <tr>
                    <td><strong>Superelástica</strong></td>
                    <td>e &gt; 1</td>
                    <td><span aria-hidden="true">✅</span> Conservado</td>
                    <td><span aria-hidden="true">✅</span> Aumenta (energía interna liberada)</td>
                    <td>Explosión, muelle comprimido entre dos objetos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Casos de uso */}
          <section className={styles.guideSection}>
            <h2>Colisiones en la Vida Real</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎱</span>
                  <h3>Bolas de billar</h3>
                </div>
                <p className={styles.escenarioTip}>
                  La colisión frontal entre bolas de billar es casi perfectamente elástica (e ≈ 0,95). Si la bola blanca choca frontalmente con una bola en reposo de igual masa, prácticamente se detiene y la otra sale a la misma velocidad — demostración directa de la conservación de momento y energía.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🚗</span>
                  <h3>Choques de vehículos</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Un choque de coches tiene e muy bajo (0,1–0,3). La zona deformable absorbe energía intencionadamente (crumple zone): cuanto más inelástica la colisión, más energía se disipa en deformación y menos en acelerar a los ocupantes. Paradójicamente, una colisión más inelástica puede ser más segura.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">⚛️</span>
                  <h3>Física de partículas</h3>
                </div>
                <p className={styles.escenarioTip}>
                  En el LHC del CERN, las colisiones de protones a velocidades relativistas son el caso extremo de choque inelástico: parte de la energía cinética se convierte en la masa de partículas nuevas (E = mc²). Se conservan el momento y la energía total relativista, pero no la energía cinética.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🏏</span>
                  <h3>Bate de béisbol y pelota</h3>
                </div>
                <p className={styles.escenarioTip}>
                  El bate (masa grande, velocidad moderada) choca con la pelota (masa pequeña, velocidad grande negativa). El alto e (~0,4–0,5) maximiza la velocidad de salida de la pelota. Los ingenieros de materiales deportivos optimizan e para maximizar distancia sin rebasar los límites del reglamento.
                </p>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Por qué el momento lineal siempre se conserva pero la energía cinética no?</h4>
                <p>
                  El momento lineal se conserva en sistemas aislados como consecuencia directa de la tercera ley de Newton: la fuerza que A ejerce sobre B es igual y opuesta a la que B ejerce sobre A. Al integrar en el tiempo, los impulsos se cancelan → el momento total no cambia. La energía cinética, en cambio, puede transformarse en calor, sonido o deformación durante el impacto (siempre se pierde o mantiene, nunca se gana en colisiones ordinarias).
                </p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> En los exámenes de bachillerato, preparatoria o secundaria: "conservación del momento lineal" = siempre. "conservación de energía cinética" = solo en colisiones elásticas.</p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Puede la energía cinética total aumentar en una colisión?</h4>
                <p>
                  Sí, en las llamadas colisiones superelásticas (e &gt; 1), donde hay una fuente de energía interna: un muelle (o resorte) comprimido entre los objetos, una explosión, o una reacción química. En estas colisiones, la energía química/elástica almacenada se convierte en energía cinética adicional. El momento sigue conservándose.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> Si m₁ = m₂ y la colisión es elástica, ¿qué ocurre exactamente?</h4>
                <p>
                  Los dos objetos intercambian velocidades. Si A va a +5 m/s y B está en reposo, tras la colisión A queda en reposo y B sale a +5 m/s. Este caso especial —que puede demostrarse con las fórmulas generales poniendo m₁=m₂ y v₂=0— es muy frecuente en problemas de examen y se observa fácilmente con bolas de billar o en el péndulo de Newton.
                </p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> El "péndulo de Newton" (las bolas metálicas colgantes) demuestra exactamente este principio: cuando cae 1 bola, sale 1 bola; cuando caen 2, salen 2.</p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Cómo se mide el coeficiente de restitución experimentalmente?</h4>
                <p>
                  La forma más sencilla: dejar caer una pelota desde altura h₀ y medir la altura de rebote h₁. El coeficiente de restitución es e = √(h₁/h₀). Ejemplo: si una pelota de tenis cae desde 1 m y rebota hasta 0,64 m, e = √0,64 = 0,8. Los materiales duros (acero, vidrio) tienen e próximo a 1; los blandos (arcilla, esponja) tienen e cercano a 0.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4><span aria-hidden="true">❓</span> ¿Qué pasa si los objetos se mueven en la misma dirección y el de atrás es más lento?</h4>
                <p>
                  No habrá colisión: el objeto trasero no alcanza al delantero. Para que haya colisión en 1D con movimiento en el mismo sentido, la velocidad del objeto trasero debe ser mayor que la del delantero (v₁ &gt; v₂ si A está detrás de B). El simulador muestra un aviso cuando esta condición no se cumple.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Paso a paso */}
          <section className={styles.guideSection}>
            <h2>Cómo Resolver un Problema de Colisiones</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Identifica el tipo de colisión</h4>
                  <p>¿Te dan e? ¿Dicen "elástica" (e=1) o "perfectamente inelástica" (e=0, se pegan)? Sin esta información no puedes resolver el sistema con dos incógnitas.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Aplica la conservación del momento</h4>
                  <p>m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'. Esta ecuación siempre es válida (sistema aislado).</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Usa la condición adicional según el tipo</h4>
                  <p>Elástica → ½m₁v₁² + ½m₂v₂² = ½m₁v₁'² + ½m₂v₂'² (o directamente las fórmulas). Inelástica → e = (v₂'−v₁')/(v₁−v₂). Perfectamente inelástica → v₁' = v₂' = v' (se pegan).</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Resuelve el sistema de ecuaciones</h4>
                  <p>Dos ecuaciones, dos incógnitas (v₁' y v₂'). Usa las fórmulas generales si conoces e para evitar errores algebraicos.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Verifica la coherencia del resultado</h4>
                  <p>Comprueba que el momento total se conserva. Para colisiones elásticas, verifica que la energía cinética también se conserva. Si ΔEk &gt; 0 en una colisión "normal", hay un error de signo.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Tips */}
          <section className={styles.guideSection}>
            <h2>Claves para No Cometer Errores</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📐</span>
                <h4>Ojo con los signos de velocidad</h4>
                <p>Define un sentido positivo al inicio y mantenlo. Una velocidad negativa es perfectamente válida: significa que el objeto va en sentido contrario.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <h4>Momento ≠ Energía</h4>
                <p>El momento es una magnitud vectorial (puede cancelarse). La energía cinética es escalar y siempre positiva. No confundas sus conservaciones.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔢</span>
                <h4>Fórmulas generales con e</h4>
                <p>Para cualquier colisión (elástica o inelástica), si conoces e usa directamente las fórmulas generales. Evitas resolver el sistema cada vez.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎯</span>
                <h4>Perfectamente inelástica = más simple</h4>
                <p>Cuando los objetos se pegan (e=0), el sistema tiene una sola incógnita: v' = (m₁v₁ + m₂v₂)/(m₁+m₂). Aprovéchalo en el examen.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Frecuentes en Problemas de Colisiones</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong><span aria-hidden="true">❌</span> Aplicar conservación de energía cinética en colisiones inelásticas:</strong> Solo se conserva en colisiones elásticas (e=1). En las demás, parte de la Ek se convierte en calor, sonido o deformación.</li>
              <li><strong><span aria-hidden="true">❌</span> Olvidar el signo de las velocidades:</strong> Si un objeto se mueve hacia la izquierda, su velocidad es negativa. Ignorar los signos produce resultados físicamente imposibles.</li>
              <li><strong><span aria-hidden="true">❌</span> Confundir "perfectamente inelástica" con "todo el momento se pierde":</strong> En una colisión perfectamente inelástica los objetos se pegan, pero el momento total sigue siendo el mismo. Lo que se maximiza es la pérdida de Ek, no de momento.</li>
              <li><strong><span aria-hidden="true">❌</span> Asumir que el objeto más pesado siempre "gana":</strong> Depende de las velocidades iniciales. Un objeto ligero y rápido puede transferir más momento que uno pesado y lento.</li>
            </ul>
          </div>
        </EducationalSection>

      </main>

      <RelatedApps />
      <ShareCard appName="simulador-colisiones" />
      <Footer appName="simulador-colisiones" />
    </div>
  );
}
