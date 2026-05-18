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
import { getRelatedApps } from '@/data/app-relations';
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
// Constantes de animación (posiciones SVG en %)
// ─────────────────────────────────────────────────────────────────────────────
const POS_B1_INIT = 18;   // bloque 1 inicio (izq)
const POS_B2_INIT = 72;   // bloque 2 inicio (der)
const POS_IMPACT  = 43;   // posición de impacto (centro-izq)

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
  const [pos1, setPos1] = useState(POS_B1_INIT);
  const [pos2, setPos2] = useState(POS_B2_INIT);

  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpiar animación al desmontar
  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  const lanzarSimulacion = useCallback(() => {
    if (animRef.current) clearTimeout(animRef.current);
    const res = calcularColision(m1, m2, v1, v2, e);
    setResultado(res);
    setFase('pre');
    setPos1(POS_B1_INIT);
    setPos2(POS_B2_INIT);

    animRef.current = setTimeout(() => {
      setFase('impact');
      setPos1(POS_IMPACT);
      setPos2(POS_IMPACT + 14);

      animRef.current = setTimeout(() => {
        setFase('post');
        const dir1 = res.v1f >= 0 ? 1 : -1;
        const dir2 = res.v2f >= 0 ? 1 : -1;
        const speed1 = Math.min(Math.abs(res.v1f) * 3, 30);
        const speed2 = Math.min(Math.abs(res.v2f) * 3, 30);
        setPos1(POS_IMPACT - dir1 * speed1);
        setPos2(POS_IMPACT + 14 + dir2 * speed2);

        animRef.current = setTimeout(() => setFase('done'), 900);
      }, 700);
    }, 600);
  }, [m1, m2, v1, v2, e]);

  const resetear = () => {
    if (animRef.current) clearTimeout(animRef.current);
    setFase('idle');
    setPos1(POS_B1_INIT);
    setPos2(POS_B2_INIT);
    setResultado(null);
  };

  const colores = {
    b1: '#2E86AB',
    b2: '#E07B39',
    impacto: '#E74C3C',
  };

  const tamBloque = (masa: number) => Math.max(10, Math.min(22, masa * 1.5));

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>💥 Simulador de Colisiones</h1>
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
            <h2 className={styles.panelTitulo} style={{ color: colores.b1 }}>
              Objeto A (azul)
            </h2>
            <div className={styles.sliderRow}>
              <label>Masa: <strong>{m1} kg</strong></label>
              <input type="range" min={1} max={20} step={0.5} value={m1}
                onChange={e => { setM1(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Masa objeto A" />
              <span className={styles.sliderLimits}><span>1 kg</span><span>20 kg</span></span>
            </div>
            <div className={styles.sliderRow}>
              <label>Velocidad: <strong>{v1 > 0 ? '+' : ''}{v1} m/s</strong></label>
              <input type="range" min={-10} max={10} step={0.5} value={v1}
                onChange={e => { setV1(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Velocidad inicial objeto A" />
              <span className={styles.sliderLimits}><span>−10 m/s</span><span>+10 m/s</span></span>
            </div>
          </div>

          {/* Objeto 2 */}
          <div className={styles.panelObj} style={{ borderTopColor: colores.b2 }}>
            <h2 className={styles.panelTitulo} style={{ color: colores.b2 }}>
              Objeto B (naranja)
            </h2>
            <div className={styles.sliderRow}>
              <label>Masa: <strong>{m2} kg</strong></label>
              <input type="range" min={1} max={20} step={0.5} value={m2}
                onChange={e => { setM2(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Masa objeto B" />
              <span className={styles.sliderLimits}><span>1 kg</span><span>20 kg</span></span>
            </div>
            <div className={styles.sliderRow}>
              <label>Velocidad: <strong>{v2 > 0 ? '+' : ''}{v2} m/s</strong></label>
              <input type="range" min={-10} max={10} step={0.5} value={v2}
                onChange={e => { setV2(Number(e.target.value)); resetear(); }}
                className={styles.slider} aria-label="Velocidad inicial objeto B" />
              <span className={styles.sliderLimits}><span>−10 m/s</span><span>+10 m/s</span></span>
            </div>
          </div>

          {/* Coeficiente de restitución */}
          <div className={styles.panelCoef}>
            <h2 className={styles.panelTitulo}>Tipo de Colisión</h2>
            <div className={styles.sliderRow}>
              <label>
                Coeficiente de restitución (e): <strong>{formatNumber(e, 2)}</strong>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={e}
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
            ⚠️ Con estas velocidades los objetos no colisionarán (A no alcanza a B). Aumenta v<sub>A</sub> o reduce v<sub>B</sub>.
          </div>
        )}

        {/* ── Botón simular ── */}
        <div className={styles.btnWrapper}>
          <button
            onClick={lanzarSimulacion}
            disabled={fase === 'pre' || fase === 'impact'}
            className={styles.btnSimular}
            aria-label="Lanzar simulación"
          >
            {fase === 'idle' ? '▶ Simular colisión' : fase === 'done' ? '↺ Volver a simular' : '⏳ Simulando...'}
          </button>
        </div>

        {/* ── Animación SVG ── */}
        <div className={styles.pista} aria-label="Animación de la colisión">
          <svg viewBox="0 0 500 90" className={styles.pistaSvg}>
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
                  x2={`${pos1 + tamBloque(m1) / 2 + (v1 > 0 ? 12 : -12)}%`} y2="38"
                  stroke={colores.b1} strokeWidth="2" markerEnd={v1 > 0 ? 'url(#arrow-b1-r)' : 'url(#arrow-b1-l)'} />
                <text x={`${pos1 + tamBloque(m1) / 2 + (v1 > 0 ? 14 : -14)}%`} y="35"
                  textAnchor="middle" fontSize="9" fill={colores.b1}>
                  {v1 > 0 ? '+' : ''}{v1} m/s
                </text>
              </g>
            )}
            {/* Flecha velocidad B (inicial) */}
            {fase === 'idle' && v2 !== 0 && (
              <g>
                <line
                  x1={`${pos2 + tamBloque(m2) / 2}%`} y1="38"
                  x2={`${pos2 + tamBloque(m2) / 2 + (v2 > 0 ? 12 : -12)}%`} y2="38"
                  stroke={colores.b2} strokeWidth="2" markerEnd={v2 > 0 ? 'url(#arrow-b2-r)' : 'url(#arrow-b2-l)'} />
                <text x={`${pos2 + tamBloque(m2) / 2 + (v2 > 0 ? 14 : -14)}%`} y="35"
                  textAnchor="middle" fontSize="9" fill={colores.b2}>
                  {v2 > 0 ? '+' : ''}{v2} m/s
                </text>
              </g>
            )}

            {/* Flash de impacto */}
            {fase === 'impact' && (
              <circle cx={`${POS_IMPACT + 7}%`} cy="55" r="18"
                fill={colores.impacto} opacity="0.25" />
            )}

            {/* Flechas post-colisión */}
            {fase === 'done' && resultado && resultado.v1f !== 0 && (
              <g>
                <line
                  x1={`${pos1 + tamBloque(m1) / 2}%`} y1="38"
                  x2={`${pos1 + tamBloque(m1) / 2 + (resultado.v1f > 0 ? 12 : -12)}%`} y2="38"
                  stroke={colores.b1} strokeWidth="2" strokeDasharray="4 2"
                  markerEnd={resultado.v1f > 0 ? 'url(#arrow-b1-r)' : 'url(#arrow-b1-l)'} />
                <text x={`${pos1 + tamBloque(m1) / 2 + (resultado.v1f > 0 ? 15 : -15)}%`} y="32"
                  textAnchor="middle" fontSize="8" fill={colores.b1}>
                  {formatNumber(resultado.v1f, 1)} m/s
                </text>
              </g>
            )}
            {fase === 'done' && resultado && resultado.v2f !== 0 && (
              <g>
                <line
                  x1={`${pos2 + tamBloque(m2) / 2}%`} y1="38"
                  x2={`${pos2 + tamBloque(m2) / 2 + (resultado.v2f > 0 ? 12 : -12)}%`} y2="38"
                  stroke={colores.b2} strokeWidth="2" strokeDasharray="4 2"
                  markerEnd={resultado.v2f > 0 ? 'url(#arrow-b2-r)' : 'url(#arrow-b2-l)'} />
                <text x={`${pos2 + tamBloque(m2) / 2 + (resultado.v2f > 0 ? 15 : -15)}%`} y="32"
                  textAnchor="middle" fontSize="8" fill={colores.b2}>
                  {formatNumber(resultado.v2f, 1)} m/s
                </text>
              </g>
            )}

            {/* Bloques */}
            <rect
              x={`${pos1}%`} y={72 - tamBloque(m1)}
              width={`${tamBloque(m1)}%`} height={tamBloque(m1)}
              fill={colores.b1} rx="3"
              style={{ transition: fase === 'pre' ? 'x 0.6s ease-in' : fase === 'post' ? 'x 0.8s ease-out' : 'none' }}
            />
            <text x={`${pos1 + tamBloque(m1) / 2}%`} y={72 - tamBloque(m1) / 2 + 4}
              textAnchor="middle" fontSize="9" fill="white" fontWeight="700">A</text>

            <rect
              x={`${pos2}%`} y={72 - tamBloque(m2)}
              width={`${tamBloque(m2)}%`} height={tamBloque(m2)}
              fill={colores.b2} rx="3"
              style={{ transition: fase === 'pre' ? 'x 0.6s ease-in' : fase === 'post' ? 'x 0.8s ease-out' : 'none' }}
            />
            <text x={`${pos2 + tamBloque(m2) / 2}%`} y={72 - tamBloque(m2) / 2 + 4}
              textAnchor="middle" fontSize="9" fill="white" fontWeight="700">B</text>

            {/* Etiquetas de masa */}
            <text x={`${pos1 + tamBloque(m1) / 2}%`} y="84"
              textAnchor="middle" fontSize="8" fill="#888">{m1} kg</text>
            <text x={`${pos2 + tamBloque(m2) / 2}%`} y="84"
              textAnchor="middle" fontSize="8" fill="#888">{m2} kg</text>

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
          <div className={styles.resultados}>
            <h2 className={styles.resultadosTitulo}>Resultados de la Colisión</h2>

            <div className={styles.resGrid}>
              {/* Velocidades finales */}
              <div className={styles.resCard} style={{ borderTopColor: colores.b1 }}>
                <p className={styles.resLabel}>Velocidad final A</p>
                <p className={styles.resValor} style={{ color: colores.b1 }}>
                  {formatNumber(resultado.v1f, 2)} <span className={styles.resUnidad}>m/s</span>
                </p>
                <p className={styles.resSub}>
                  {resultado.v1f > 0 ? '→ dirección positiva' : resultado.v1f < 0 ? '← dirección negativa' : 'en reposo'}
                </p>
              </div>
              <div className={styles.resCard} style={{ borderTopColor: colores.b2 }}>
                <p className={styles.resLabel}>Velocidad final B</p>
                <p className={styles.resValor} style={{ color: colores.b2 }}>
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
                    ? '✅ Conservado'
                    : '⚠️ Diferencia numérica'}
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
                <p className={styles.resDelta} style={{
                  color: resultado.delta_ek < -0.01 ? '#E07B39' : '#27AE60',
                }}>
                  ΔEk = {formatNumber(resultado.delta_ek, 2)} J
                  ({resultado.delta_ek_pct >= 0 ? '+' : ''}{formatNumber(resultado.delta_ek_pct, 1)}%)
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
                    = [{m1}−{formatNumber(e,2)}·{m2})·{v1} + {m2}·{formatNumber(1+e,2)}·{v2}] / {m1+m2}
                    = <strong>{formatNumber(resultado.v1f, 3)} m/s</strong>
                  </p>
                </div>
                <div className={styles.formula}>
                  <p className={styles.formulaEq}>v'<sub>B</sub> = [m<sub>A</sub>(1+e)v<sub>A</sub> + (m<sub>B</sub>−e·m<sub>A</sub>)v<sub>B</sub>] / (m<sub>A</sub>+m<sub>B</sub>)</p>
                  <p className={styles.formulaResult}>
                    = [{m1}·{formatNumber(1+e,2)}·{v1} + ({m2}−{formatNumber(e,2)}·{m1})·{v2}] / {m1+m2}
                    = <strong>{formatNumber(resultado.v2f, 3)} m/s</strong>
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
                    <td>✅ Conservado</td>
                    <td>✅ Conservada</td>
                    <td>Bolas de billar, colisiones atómicas</td>
                  </tr>
                  <tr>
                    <td><strong>Inelástica parcial</strong></td>
                    <td>0 &lt; e &lt; 1</td>
                    <td>✅ Conservado</td>
                    <td>⚠️ Parte se disipa (calor, deformación)</td>
                    <td>Coche chocando, pelota contra suelo</td>
                  </tr>
                  <tr>
                    <td><strong>Inelástica perfecta</strong></td>
                    <td>e = 0</td>
                    <td>✅ Conservado</td>
                    <td>❌ Máxima pérdida compatible con la ley</td>
                    <td>Arcilla contra pared, vagones que se enganchan</td>
                  </tr>
                  <tr>
                    <td><strong>Superelástica</strong></td>
                    <td>e &gt; 1</td>
                    <td>✅ Conservado</td>
                    <td>✅ Aumenta (energía interna liberada)</td>
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
                  <span className={styles.escenarioIcon}>🎱</span>
                  <h3>Bolas de billar</h3>
                </div>
                <p className={styles.escenarioTip}>
                  La colisión frontal entre bolas de billar es casi perfectamente elástica (e ≈ 0,95). Si la bola blanca choca frontalmente con una bola en reposo de igual masa, prácticamente se detiene y la otra sale a la misma velocidad — demostración directa de la conservación de momento y energía.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🚗</span>
                  <h3>Choques de vehículos</h3>
                </div>
                <p className={styles.escenarioTip}>
                  Un choque de coches tiene e muy bajo (0,1–0,3). La zona deformable absorbe energía intencionadamente (crumple zone): cuanto más inelástica la colisión, más energía se disipa en deformación y menos en acelerar a los ocupantes. Paradójicamente, una colisión más inelástica puede ser más segura.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>⚛️</span>
                  <h3>Física de partículas</h3>
                </div>
                <p className={styles.escenarioTip}>
                  En el LHC del CERN, las colisiones de protones a velocidades relativistas son prácticamente elásticas en términos de bariones. Sin embargo, la energía cinética crea nuevas partículas (E=mc²): en física de altas energías, el concepto de "energía cinética conservada" se amplía a energía total relativista.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏏</span>
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
                <h4>❓ ¿Por qué el momento lineal siempre se conserva pero la energía cinética no?</h4>
                <p>
                  El momento lineal se conserva en sistemas aislados como consecuencia directa de la tercera ley de Newton: la fuerza que A ejerce sobre B es igual y opuesta a la que B ejerce sobre A. Al integrar en el tiempo, los impulsos se cancelan → el momento total no cambia. La energía cinética, en cambio, puede transformarse en calor, sonido o deformación durante el impacto (siempre se pierde o mantiene, nunca se gana en colisiones ordinarias).
                </p>
                <p className={styles.faqTip}>💡 En selectividad: "conservación del momento lineal" = siempre. "conservación de energía cinética" = solo en colisiones elásticas.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Puede la energía cinética total aumentar en una colisión?</h4>
                <p>
                  Sí, en las llamadas colisiones superelásticas (e &gt; 1), donde hay una fuente de energía interna: una mola comprimida entre los objetos, una explosión, o una reacción química. En estas colisiones, la energía química/elástica almacenada se convierte en energía cinética adicional. El momento sigue conservándose.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ Si m₁ = m₂ y la colisión es elástica, ¿qué ocurre exactamente?</h4>
                <p>
                  Los dos objetos intercambian velocidades. Si A va a +5 m/s y B está en reposo, tras la colisión A queda en reposo y B sale a +5 m/s. Este caso especial —que puede demostrarse con las fórmulas generales poniendo m₁=m₂ y v₂=0— es muy frecuente en problemas de examen y se observa fácilmente con bolas de billar o en el péndulo de Newton.
                </p>
                <p className={styles.faqTip}>💡 El "péndulo de Newton" (las bolas metálicas colgantes) demuestra exactamente este principio: cuando cae 1 bola, sale 1 bola; cuando caen 2, salen 2.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Cómo se mide el coeficiente de restitución experimentalmente?</h4>
                <p>
                  La forma más sencilla: dejar caer una pelota desde altura h₀ y medir la altura de rebote h₁. El coeficiente de restitución es e = √(h₁/h₀). Ejemplo: si una pelota de tenis cae desde 1 m y rebota hasta 0,64 m, e = √0,64 = 0,8. Los materiales duros (acero, vidrio) tienen e próximo a 1; los blandos (arcilla, esponja) tienen e cercano a 0.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>❓ ¿Qué pasa si los objetos se mueven en la misma dirección y el de atrás es más lento?</h4>
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
                <span className={styles.tipIcon}>📐</span>
                <h4>Ojo con los signos de velocidad</h4>
                <p>Define un sentido positivo al inicio y mantenlo. Una velocidad negativa es perfectamente válida: significa que el objeto va en sentido contrario.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>⚖️</span>
                <h4>Momento ≠ Energía</h4>
                <p>El momento es una magnitud vectorial (puede cancelarse). La energía cinética es escalar y siempre positiva. No confundas sus conservaciones.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🔢</span>
                <h4>Fórmulas generales con e</h4>
                <p>Para cualquier colisión (elástica o inelástica), si conoces e usa directamente las fórmulas generales. Evitas resolver el sistema cada vez.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon}>🎯</span>
                <h4>Perfectamente inelástica = más simple</h4>
                <p>Cuando los objetos se pegan (e=0), el sistema tiene una sola incógnita: v' = (m₁v₁ + m₂v₂)/(m₁+m₂). Aprovéchalo en el examen.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Frecuentes en Problemas de Colisiones</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ Aplicar conservación de energía cinética en colisiones inelásticas:</strong> Solo se conserva en colisiones elásticas (e=1). En las demás, parte de la Ek se convierte en calor, sonido o deformación.</li>
              <li><strong>❌ Olvidar el signo de las velocidades:</strong> Si un objeto se mueve hacia la izquierda, su velocidad es negativa. Ignorar los signos produce resultados físicamente imposibles.</li>
              <li><strong>❌ Confundir "perfectamente inelástica" con "todo el momento se pierde":</strong> En una colisión perfectamente inelástica los objetos se pegan, pero el momento total sigue siendo el mismo. Lo que se maximiza es la pérdida de Ek, no de momento.</li>
              <li><strong>❌ Asumir que el objeto más pesado siempre "gana":</strong> Depende de las velocidades iniciales. Un objeto ligero y rápido puede transferir más momento que uno pesado y lento.</li>
            </ul>
          </div>
        </EducationalSection>

      </main>

      <RelatedApps apps={getRelatedApps('simulador-colisiones')} />
      <ShareCard appName="simulador-colisiones" />
      <Footer appName="simulador-colisiones" />
    </div>
  );
}
