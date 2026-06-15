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
import styles from './SimuladorProyectiles.module.css';

// ============================================================================
// Tipos
// ============================================================================

interface Punto {
  x: number;
  y: number;
  t: number;
  vx: number;
  vy: number;
}

interface Lanzamiento {
  id: string;
  v0: number;
  angulo: number;
  altura: number;
  gravedad: number;
  resistencia: number;
  conResistencia: boolean;
  trayectoria: Punto[];
  alcance: number;
  alturaMax: number;
  tiempoVuelo: number;
  vImpacto: number;
  color: string;
}

interface ParametrosSimulacion {
  v0: number;
  angulo: number;
  altura: number;
  gravedad: number;
  resistencia: number;
  conResistencia: boolean;
}

// ============================================================================
// Constantes
// ============================================================================

const GRAVEDADES_PRESET: Record<string, number> = {
  Tierra: 9.81,
  Luna: 1.62,
  Marte: 3.71,
  Júpiter: 24.79,
};

const COLORES_LANZAMIENTOS: string[] = ['#2E86AB', '#48A9A6', '#F39C12'];

const DT = 0.01; // paso temporal para integración numérica (s)
const T_MAX = 200; // tope de seguridad para integración

// ============================================================================
// Cálculo de trayectoria
// ============================================================================

function calcularTrayectoria(p: ParametrosSimulacion): Lanzamiento {
  const anguloRad = (p.angulo * Math.PI) / 180;
  const v0x = p.v0 * Math.cos(anguloRad);
  const v0y = p.v0 * Math.sin(anguloRad);
  const trayectoria: Punto[] = [];

  let x = 0;
  let y = p.altura;
  let vx = v0x;
  let vy = v0y;
  let t = 0;
  let alturaMax = p.altura;

  if (!p.conResistencia) {
    // Solución analítica: muestreamos puntos
    // Tiempo de vuelo: y(t) = h + v0y*t - 0.5*g*t² = 0
    const discriminante = v0y * v0y + 2 * p.gravedad * p.altura;
    const tVuelo = (v0y + Math.sqrt(discriminante)) / p.gravedad;
    const pasos = Math.max(80, Math.ceil(tVuelo / DT));
    const dtMuestreo = tVuelo / pasos;

    for (let i = 0; i <= pasos; i++) {
      const ti = i * dtMuestreo;
      const xi = v0x * ti;
      const yi = p.altura + v0y * ti - 0.5 * p.gravedad * ti * ti;
      const vxi = v0x;
      const vyi = v0y - p.gravedad * ti;
      trayectoria.push({ x: xi, y: Math.max(0, yi), t: ti, vx: vxi, vy: vyi });
      if (yi > alturaMax) alturaMax = yi;
    }

    const ultimo = trayectoria[trayectoria.length - 1];
    const vImpacto = Math.sqrt(ultimo.vx * ultimo.vx + ultimo.vy * ultimo.vy);
    return {
      id: `${Date.now()}-${Math.random()}`,
      v0: p.v0,
      angulo: p.angulo,
      altura: p.altura,
      gravedad: p.gravedad,
      resistencia: p.resistencia,
      conResistencia: false,
      trayectoria,
      alcance: ultimo.x,
      alturaMax,
      tiempoVuelo: tVuelo,
      vImpacto,
      color: '#2E86AB',
    };
  }

  // Integración numérica (Euler) con resistencia del aire
  // Modelo simplificado: F_resistencia = -k * v (proporcional a velocidad)
  const k = p.resistencia;
  trayectoria.push({ x, y, t, vx, vy });

  while (y >= 0 && t < T_MAX) {
    const v = Math.sqrt(vx * vx + vy * vy);
    const ax = -k * v * vx;
    const ay = -p.gravedad - k * v * vy;
    vx += ax * DT;
    vy += ay * DT;
    x += vx * DT;
    y += vy * DT;
    t += DT;
    if (y > alturaMax) alturaMax = y;
    trayectoria.push({ x, y: Math.max(0, y), t, vx, vy });
    if (y < 0) break;
  }

  const ultimo = trayectoria[trayectoria.length - 1];
  const vImpacto = Math.sqrt(ultimo.vx * ultimo.vx + ultimo.vy * ultimo.vy);

  return {
    id: `${Date.now()}-${Math.random()}`,
    v0: p.v0,
    angulo: p.angulo,
    altura: p.altura,
    gravedad: p.gravedad,
    resistencia: p.resistencia,
    conResistencia: true,
    trayectoria,
    alcance: ultimo.x,
    alturaMax,
    tiempoVuelo: t,
    vImpacto,
    color: '#2E86AB',
  };
}

// ============================================================================
// Componente principal
// ============================================================================

export default function SimuladorProyectiles() {
  // Parámetros activos
  const [v0, setV0] = useState<number>(50);
  const [angulo, setAngulo] = useState<number>(45);
  const [altura, setAltura] = useState<number>(0);
  const [gravedad, setGravedad] = useState<number>(9.81);
  const [gravedadPreset, setGravedadPreset] = useState<string>('Tierra');
  const [resistencia, setResistencia] = useState<number>(0);
  const [conResistencia, setConResistencia] = useState<boolean>(false);

  // Lanzamiento actual + comparativos
  const [lanzamientoActual, setLanzamientoActual] = useState<Lanzamiento | null>(null);
  const [lanzamientosComparados, setLanzamientosComparados] = useState<Lanzamiento[]>([]);

  // Animación
  const [animProgress, setAnimProgress] = useState<number>(1); // 0 a 1
  const [animando, setAnimando] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);
  const animStartRef = useRef<number>(0);

  // Calcular lanzamiento al cambiar parámetros
  useEffect(() => {
    const nuevo = calcularTrayectoria({
      v0,
      angulo,
      altura,
      gravedad,
      resistencia,
      conResistencia,
    });
    setLanzamientoActual(nuevo);
  }, [v0, angulo, altura, gravedad, resistencia, conResistencia]);

  // Cambiar preset de gravedad
  const seleccionarPreset = useCallback((preset: string) => {
    setGravedadPreset(preset);
    if (preset !== 'Custom') {
      setGravedad(GRAVEDADES_PRESET[preset]);
    }
  }, []);

  // Cambio manual de gravedad → modo custom
  const cambiarGravedadCustom = useCallback((valor: number) => {
    setGravedad(valor);
    setGravedadPreset('Custom');
  }, []);

  // Animar lanzamiento
  const lanzar = useCallback(() => {
    if (!lanzamientoActual) return;
    setAnimando(true);
    setAnimProgress(0);
    animStartRef.current = performance.now();
    const duracion = Math.min(4000, lanzamientoActual.tiempoVuelo * 600);

    const tick = (ahora: number) => {
      const transcurrido = ahora - animStartRef.current;
      const p = Math.min(1, transcurrido / duracion);
      setAnimProgress(p);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setAnimando(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [lanzamientoActual]);

  useEffect(() => {
    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  // Añadir a comparativa
  const anadirComparativa = useCallback(() => {
    if (!lanzamientoActual || lanzamientosComparados.length >= 3) return;
    const color = COLORES_LANZAMIENTOS[lanzamientosComparados.length];
    setLanzamientosComparados([
      ...lanzamientosComparados,
      { ...lanzamientoActual, color },
    ]);
  }, [lanzamientoActual, lanzamientosComparados]);

  const eliminarComparativa = useCallback(
    (id: string) => {
      const nuevos = lanzamientosComparados
        .filter((l) => l.id !== id)
        .map((l, idx) => ({ ...l, color: COLORES_LANZAMIENTOS[idx] }));
      setLanzamientosComparados(nuevos);
    },
    [lanzamientosComparados]
  );

  const limpiarComparativa = useCallback(() => {
    setLanzamientosComparados([]);
  }, []);

  // Cálculo de límites para el SVG
  const limites = useMemo(() => {
    const todos: Lanzamiento[] = [];
    if (lanzamientoActual) todos.push(lanzamientoActual);
    todos.push(...lanzamientosComparados);
    let xMax = 10;
    let yMax = 10;
    todos.forEach((l) => {
      if (l.alcance > xMax) xMax = l.alcance;
      if (l.alturaMax > yMax) yMax = l.alturaMax;
    });
    return { xMax: xMax * 1.05, yMax: Math.max(yMax * 1.15, altura * 1.15, 5) };
  }, [lanzamientoActual, lanzamientosComparados, altura]);

  // Convertir coordenadas físicas a SVG (viewBox 0 0 800 400)
  const SVG_W = 800;
  const SVG_H = 400;
  const PADDING = 30;

  const toSvgX = useCallback(
    (x: number) => PADDING + (x / limites.xMax) * (SVG_W - 2 * PADDING),
    [limites.xMax]
  );
  const toSvgY = useCallback(
    (y: number) => SVG_H - PADDING - (y / limites.yMax) * (SVG_H - 2 * PADDING),
    [limites.yMax]
  );

  // Path de la trayectoria activa (con animación)
  const trayectoriaActivaParcial = useMemo(() => {
    if (!lanzamientoActual) return [];
    const total = lanzamientoActual.trayectoria.length;
    const corte = Math.max(1, Math.floor(total * animProgress));
    return lanzamientoActual.trayectoria.slice(0, corte);
  }, [lanzamientoActual, animProgress]);

  const polylinePoints = useCallback(
    (puntos: Punto[]) =>
      puntos.map((p) => `${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`).join(' '),
    [toSvgX, toSvgY]
  );

  const proyectil = trayectoriaActivaParcial[trayectoriaActivaParcial.length - 1];

  // Energía cinética actual del proyectil (masa unitaria, J/kg)
  const energiaCinetica = useMemo(() => {
    if (!proyectil) return 0;
    const v2 = proyectil.vx * proyectil.vx + proyectil.vy * proyectil.vy;
    return 0.5 * v2;
  }, [proyectil]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Proyectiles 2D</h1>
        <p>
          Ajusta velocidad, ángulo, gravedad y resistencia del aire — observa la
          trayectoria, el alcance y la altura máxima
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Panel de controles */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Parámetros del lanzamiento</h2>
          <p className={styles.panelDescription}>
            Modifica los valores y la trayectoria se recalcula automáticamente. Pulsa{' '}
            <strong>Lanzar</strong> para animar el proyectil.
          </p>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="v0">
                <span>Velocidad inicial v₀</span>
                <span className={styles.sliderValue}>
                  {formatNumber(v0, 1)} m/s
                </span>
              </label>
              <input
                id="v0"
                type="range"
                min={1}
                max={100}
                step={1}
                value={v0}
                onChange={(e) => setV0(Number(e.target.value))}
              />
              <span className={styles.unitLabel}>1 a 100 m/s</span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="angulo">
                <span>Ángulo de lanzamiento</span>
                <span className={styles.sliderValue}>{angulo}°</span>
              </label>
              <input
                id="angulo"
                type="range"
                min={0}
                max={90}
                step={1}
                value={angulo}
                onChange={(e) => setAngulo(Number(e.target.value))}
              />
              <span className={styles.unitLabel}>0° a 90°</span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="altura">
                <span>Altura inicial h₀</span>
                <span className={styles.sliderValue}>
                  {formatNumber(altura, 1)} m
                </span>
              </label>
              <input
                id="altura"
                type="range"
                min={0}
                max={100}
                step={1}
                value={altura}
                onChange={(e) => setAltura(Number(e.target.value))}
              />
              <span className={styles.unitLabel}>0 a 100 m</span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="gravedad">
                <span>Gravedad g</span>
                <span className={styles.sliderValue}>
                  {formatNumber(gravedad, 2)} m/s²
                </span>
              </label>
              <input
                id="gravedad"
                type="number"
                min={0.1}
                max={50}
                step={0.01}
                value={gravedad}
                onChange={(e) => cambiarGravedadCustom(Number(e.target.value))}
              />
              <div className={styles.gravityPresets}>
                {Object.keys(GRAVEDADES_PRESET).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`${styles.gravityBtn} ${
                      gravedadPreset === preset ? styles.gravityActive : ''
                    }`}
                    onClick={() => seleccionarPreset(preset)}
                    aria-pressed={gravedadPreset === preset}
                  >
                    {preset}
                  </button>
                ))}
                <button
                  type="button"
                  className={`${styles.gravityBtn} ${
                    gravedadPreset === 'Custom' ? styles.gravityActive : ''
                  }`}
                  onClick={() => seleccionarPreset('Custom')}
                  aria-pressed={gravedadPreset === 'Custom'}
                >
                  Personalizado
                </button>
              </div>
            </div>
          </div>

          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.modeBtn} ${
                !conResistencia ? styles.modeActive : ''
              }`}
              onClick={() => setConResistencia(false)}
              aria-pressed={!conResistencia}
            >
              Sin resistencia del aire
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${
                conResistencia ? styles.modeActive : ''
              }`}
              onClick={() => setConResistencia(true)}
              aria-pressed={conResistencia}
            >
              Con resistencia del aire
            </button>
          </div>

          {conResistencia && (
            <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
              <label htmlFor="resistencia">
                <span>Coeficiente de resistencia k</span>
                <span className={styles.sliderValue}>
                  {formatNumber(resistencia, 4)}
                </span>
              </label>
              <input
                id="resistencia"
                type="range"
                min={0}
                max={0.05}
                step={0.001}
                value={resistencia}
                onChange={(e) => setResistencia(Number(e.target.value))}
              />
              <span className={styles.unitLabel}>
                0 (sin resistencia) a 0,05 (muy alta). Modelo F = −k·v·v⃗
              </span>
            </div>
          )}

          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.calcBtn}
              onClick={lanzar}
              disabled={animando}
            >
              {animando ? 'Lanzando…' : 'Lanzar proyectil'}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={anadirComparativa}
              disabled={lanzamientosComparados.length >= 3}
            >
              Añadir a comparativa ({lanzamientosComparados.length}/3)
            </button>
            {lanzamientosComparados.length > 0 && (
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={limpiarComparativa}
              >
                Limpiar comparativa
              </button>
            )}
          </div>
        </section>

        {/* Canvas SVG */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Trayectoria</h2>
          <div className={styles.canvasContainer}>
            <svg
              className={styles.canvasSvg}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              role="img"
              aria-label="Trayectoria del proyectil"
            >
              {/* Suelo */}
              <line
                x1={PADDING}
                y1={SVG_H - PADDING}
                x2={SVG_W - PADDING}
                y2={SVG_H - PADDING}
                stroke="#374151"
                strokeWidth={2}
              />
              {/* Eje vertical */}
              <line
                x1={PADDING}
                y1={PADDING}
                x2={PADDING}
                y2={SVG_H - PADDING}
                stroke="#374151"
                strokeWidth={2}
              />

              {/* Etiquetas ejes */}
              <text
                x={SVG_W - PADDING}
                y={SVG_H - PADDING + 20}
                fontSize={11}
                fill="#374151"
                textAnchor="end"
              >
                {formatNumber(limites.xMax, 0)} m
              </text>
              <text
                x={PADDING - 8}
                y={PADDING + 5}
                fontSize={11}
                fill="#374151"
                textAnchor="end"
              >
                {formatNumber(limites.yMax, 0)} m
              </text>
              <text
                x={SVG_W / 2}
                y={SVG_H - 5}
                fontSize={11}
                fill="#374151"
                textAnchor="middle"
              >
                Distancia horizontal (m)
              </text>

              {/* Trayectorias comparadas */}
              {lanzamientosComparados.map((l) => (
                <polyline
                  key={l.id}
                  points={polylinePoints(l.trayectoria)}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              ))}

              {/* Trayectoria activa */}
              {trayectoriaActivaParcial.length > 1 && (
                <polyline
                  points={polylinePoints(trayectoriaActivaParcial)}
                  fill="none"
                  stroke="#2E86AB"
                  strokeWidth={3}
                />
              )}

              {/* Proyectil */}
              {proyectil && (
                <circle
                  cx={toSvgX(proyectil.x)}
                  cy={toSvgY(proyectil.y)}
                  r={6}
                  fill="#dc2626"
                  stroke="white"
                  strokeWidth={2}
                />
              )}
            </svg>
            <div className={styles.canvasLegend}>
              <span>Eje horizontal: distancia (m)</span>
              <span>Eje vertical: altura (m)</span>
            </div>
          </div>
        </section>

        {/* Resultados */}
        {lanzamientoActual && (
          <section className={styles.panel} role="status" aria-live="polite" aria-atomic="true">
            <h2 className={styles.panelTitle}>Resultados</h2>
            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Lanzamiento actual</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Alcance horizontal</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(lanzamientoActual.alcance, 2)} m
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Altura máxima</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(lanzamientoActual.alturaMax, 2)} m
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Tiempo de vuelo</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(lanzamientoActual.tiempoVuelo, 2)} s
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Velocidad de impacto</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(lanzamientoActual.vImpacto, 2)} m/s
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>
                  Energía cinética (masa unitaria, en proyectil actual)
                </span>
                <span className={styles.resultValue}>
                  {formatNumber(energiaCinetica, 2)} J/kg
                </span>
              </div>
            </div>

            {/* Lanzamientos comparados */}
            {lanzamientosComparados.length > 0 && (
              <div className={styles.lanzamientosList}>
                <h3 className={styles.resultTitle}>Comparativa</h3>
                {lanzamientosComparados.map((l) => (
                  <div key={l.id} className={styles.lanzamientoCard}>
                    <span
                      className={styles.lanzamientoColor}
                      style={{ background: l.color }}
                      aria-hidden="true"
                    />
                    <div className={styles.lanzamientoInfo}>
                      <strong>
                        v₀ = {formatNumber(l.v0, 1)} m/s, θ = {l.angulo}°, h₀ ={' '}
                        {formatNumber(l.altura, 1)} m
                      </strong>
                      <div className={styles.lanzamientoStats}>
                        Alcance {formatNumber(l.alcance, 1)} m · Altura máx{' '}
                        {formatNumber(l.alturaMax, 1)} m · Tiempo{' '}
                        {formatNumber(l.tiempoVuelo, 2)} s
                        {l.conResistencia ? ' · Con resistencia' : ' · Sin resistencia'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => eliminarComparativa(l.id)}
                      aria-label="Eliminar lanzamiento"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Fórmulas */}
            <div className={styles.formulaBox}>
              <div># Sin resistencia del aire</div>
              <div>x(t) = v₀ · cos(θ) · t</div>
              <div>y(t) = h₀ + v₀ · sen(θ) · t − ½ · g · t²</div>
              <div>vx(t) = v₀ · cos(θ)</div>
              <div>vy(t) = v₀ · sen(θ) − g · t</div>
              <div>Alcance (h₀=0): R = v₀² · sen(2θ) / g</div>
              <div>Altura máx (h₀=0): h = v₀² · sen²(θ) / (2g)</div>
              <div>{'# Con resistencia del aire (modelo lineal): F = −k · v · v⃗'}</div>
            </div>
          </section>
        )}

        {/* Educational Section v2.0 */}
        <EducationalSection
          title="Guía de Tiro Parabólico"
          subtitle="Cinemática del movimiento de proyectiles"
        >
          <h3>Fórmulas Clave</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Fórmula</th>
                  <th>Cuándo usar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Alcance horizontal R</td>
                  <td>R = v₀² · sen(2θ) / g</td>
                  <td>Lanzamiento desde el suelo (h₀ = 0), sin resistencia</td>
                </tr>
                <tr>
                  <td>Altura máxima H</td>
                  <td>H = v₀² · sen²(θ) / (2g)</td>
                  <td>Cualquier lanzamiento desde h₀ = 0, sin resistencia</td>
                </tr>
                <tr>
                  <td>Tiempo de vuelo T</td>
                  <td>T = 2 · v₀ · sen(θ) / g</td>
                  <td>Lanzamiento y aterrizaje en el mismo nivel (h₀ = 0)</td>
                </tr>
                <tr>
                  <td>Ángulo óptimo (alcance máx)</td>
                  <td>θ = 45° (h₀ = 0)</td>
                  <td>Solo cuando salida y llegada están a la misma altura</td>
                </tr>
                <tr>
                  <td>Tiempo de vuelo (h₀ {'>'} 0)</td>
                  <td>T = (v₀sen(θ) + √(v₀²sen²(θ) + 2gh₀)) / g</td>
                  <td>Lanzamiento desde altura, sin resistencia</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de Física de Bachillerato</h4>
              <p>
                Verifica problemas de cinemática (alcance, altura máxima, tiempo de
                vuelo) variando ángulos y velocidades. Útil para preparar exámenes y
                comprender por qué 45° maximiza el alcance.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Universitario de Ingeniería</h4>
              <p>
                Compara la trayectoria ideal (sin resistencia) con la real (con
                resistencia del aire) y observa cómo se reduce el alcance y se
                desplaza el ángulo óptimo por debajo de 45°.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesor de Secundaria</h4>
              <p>
                Demuestra en clase la independencia de los movimientos vertical y
                horizontal: misma componente vertical, distintas trayectorias en X
                según el ángulo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Aficionado a la Balística Deportiva</h4>
              <p>
                Estima trayectorias en deportes como tiro con arco, lanzamiento de
                jabalina o golf. Cambia la gravedad para ver cómo cambiaría todo en
                la Luna o en Marte.
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué 45° es el ángulo óptimo de alcance?</strong>
              <p>
                Porque R = v₀² · sen(2θ) / g, y sen(2θ) es máximo cuando 2θ = 90°,
                es decir θ = 45°. Sin embargo, esto solo se cumple si la salida y la
                llegada están a la misma altura.
              </p>
              <p className={styles.faqTip}>
                Tip: si lanzas desde una altura h₀, el ángulo óptimo es menor que
                45° (típicamente 35-42°).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa si añadimos resistencia del aire?</strong>
              <p>
                La trayectoria deja de ser una parábola perfecta y se vuelve
                asimétrica: cae más rápido de lo que sube. El alcance disminuye y el
                ángulo óptimo cae por debajo de 45° (35-40° para velocidades altas).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué en la Luna llega mucho más lejos?</strong>
              <p>
                Porque la gravedad lunar es 1,62 m/s² (~6 veces menor que en la
                Tierra). Como R depende de 1/g, el alcance se multiplica
                aproximadamente por 6 con los mismos parámetros iniciales.
              </p>
              <p className={styles.faqTip}>
                Prueba: 50 m/s a 45° → 255 m en la Tierra, 1543 m en la Luna.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo afecta la altura inicial al alcance?</strong>
              <p>
                Aumentar h₀ siempre incrementa el alcance (más tiempo de vuelo) y
                rompe la simetría: el ángulo óptimo se reduce. Para una altura muy
                grande, el ángulo óptimo se aproxima a 0° (lanzar casi horizontal).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué ocurre si v₀ se duplica?</strong>
              <p>
                El alcance se cuadruplica (R ∝ v₀²) y la altura máxima también. El
                tiempo de vuelo solo se duplica (T ∝ v₀). Es uno de los resultados
                más contraintuitivos del tiro parabólico.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué se conserva durante el vuelo?</strong>
              <p>
                Sin resistencia: la componente horizontal de la velocidad (vx = v₀ ·
                cos θ) y la energía mecánica total. Con resistencia: nada se
                conserva, la energía se disipa por rozamiento con el aire.
              </p>
            </div>
          </div>

          <h3>Cómo Resolver un Problema de Tiro Parabólico — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Descomponer en X e Y</strong>
                <p>
                  Calcula v₀ₓ = v₀ · cos(θ) y v₀ᵧ = v₀ · sen(θ). El movimiento en X
                  es uniforme; en Y es uniformemente acelerado por la gravedad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Identificar la incógnita</strong>
                <p>
                  ¿Buscas alcance, altura máxima, tiempo de vuelo, velocidad de
                  impacto o ángulo? Cada incógnita tiene su fórmula directa.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplicar las ecuaciones de cinemática</strong>
                <p>
                  Usa x(t) = v₀ₓ · t y y(t) = h₀ + v₀ᵧ · t − ½ · g · t². Del análisis
                  vertical sale el tiempo de vuelo cuando y(t) = 0.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Despejar el tiempo</strong>
                <p>
                  Resuelve la ecuación cuadrática del eje Y para encontrar el tiempo
                  total de vuelo. Si h₀ = 0, queda T = 2v₀ᵧ / g.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Calcular y verificar unidades</strong>
                <p>
                  Sustituye en la ecuación horizontal: alcance = v₀ₓ · T. Verifica
                  que las unidades sean coherentes (m, s, m/s) y el orden de
                  magnitud sea razonable.
                </p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Trabaja siempre con ángulos en radianes</strong>
                <p>
                  Las funciones de calculadora pueden estar en grados; verifica antes
                  de operar con sen y cos.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Compara dos lanzamientos complementarios</strong>
                <p>
                  Ángulos como 30° y 60° dan el mismo alcance (sen(60°) = sen(120°)).
                  Útil para verificar resultados.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>Comprueba la simetría temporal</strong>
                <p>
                  Sin resistencia, el tiempo de subida es igual al de bajada (si
                  h₀=0). Si no se cumple, hay un error.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Dibuja siempre la trayectoria</strong>
                <p>
                  Visualizar ayuda a detectar errores de signos. Eje Y positivo
                  hacia arriba, gravedad negativa.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌍</span>
              <div>
                <strong>No confundas peso y masa</strong>
                <p>
                  En estos cálculos el peso (m·g) cae al simplificar: la trayectoria
                  no depende de la masa (sin resistencia).
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <div>
                <strong>Verifica con el simulador</strong>
                <p>
                  Tras resolver a mano, introduce los datos aquí y compara: si los
                  números no coinciden, revisa los signos y unidades.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <span>Errores Frecuentes</span>
            </div>
            <ul className={styles.warningList}>
              <li>
                Usar ángulos en grados con funciones que esperan radianes (sen, cos
                en JavaScript usan radianes).
              </li>
              <li>
                Asumir que el ángulo óptimo siempre es 45° — solo lo es cuando salida
                y llegada están al mismo nivel.
              </li>
              <li>
                Olvidar la altura inicial h₀ en la ecuación vertical: y(t) = h₀ +
                v₀ᵧ · t − ½gt², no y(t) = v₀ᵧ · t − ½gt².
              </li>
              <li>
                Confundir velocidad inicial con la componente vertical: v₀ᵧ = v₀ ·
                sen(θ), no v₀ᵧ = v₀.
              </li>
              <li>
                Ignorar la resistencia del aire en problemas reales (paracaídas,
                pelotas ligeras, distancias largas) cuando es significativa.
              </li>
              <li>
                Aplicar la fórmula del alcance R = v₀²sen(2θ)/g cuando h₀ {'>'} 0:
                en ese caso hay que resolver la cuadrática completa.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-proyectiles')} />
        <ShareCard appName="simulador-proyectiles" />
      </main>

      <Footer appName="simulador-proyectiles" />
    </div>
  );
}
