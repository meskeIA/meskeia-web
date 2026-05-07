'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
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
import styles from './SimuladorDerivaGenetica.module.css';

interface Params {
  p0: number;
  N: number;
  wAA: number;
  wAa: number;
  waa: number;
  mu: number;
  nu: number;
  m: number;
  pm: number;
  G: number;
  K: number;
}

interface Simulacion {
  trayectoria: number[];
  fijado: boolean;
  perdido: boolean;
  tiempo: number;
}

interface Resultado {
  simulaciones: Simulacion[];
  media: number[];
  pFijacion: number;
  pPerdida: number;
  tiempoMedio: number;
  heteroInicial: number;
  heteroFinal: number;
  hwAA: number;
  hwAa: number;
  hwaa: number;
  pFinalMedio: number;
}

type Modo = 'deriva' | 'direccional' | 'equilibradora' | 'hardy-weinberg';

const PARAMS_INICIAL: Params = {
  p0: 0.5,
  N: 50,
  wAA: 1,
  wAa: 1,
  waa: 1,
  mu: 0,
  nu: 0,
  m: 0,
  pm: 0.5,
  G: 100,
  K: 20,
};

function sampleBinomial(n: number, p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return n;
  if (n < 30) {
    let count = 0;
    for (let i = 0; i < n; i++) if (Math.random() < p) count++;
    return count;
  }
  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.min(n, Math.round(mu + sigma * z)));
}

function siguienteGen(p: number, params: Params): number {
  const q = 1 - p;
  const wAvg = p * p * params.wAA + 2 * p * q * params.wAa + q * q * params.waa;
  let p1 = p;
  if (wAvg > 0) {
    p1 = (p * p * params.wAA + p * q * params.wAa) / wAvg;
  }
  // Mutación
  p1 = p1 * (1 - params.mu) + (1 - p1) * params.nu;
  // Migración
  p1 = (1 - params.m) * p1 + params.m * params.pm;
  // Acotar
  p1 = Math.max(0, Math.min(1, p1));
  // Deriva (Wright-Fisher)
  const alelos = sampleBinomial(2 * params.N, p1);
  return alelos / (2 * params.N);
}

function ejecutarSimulacion(params: Params): Simulacion {
  const trayectoria: number[] = [params.p0];
  let p = params.p0;
  let fijado = false;
  let perdido = false;
  let tiempo = params.G;

  for (let g = 1; g <= params.G; g++) {
    p = siguienteGen(p, params);
    trayectoria.push(p);
    if (!fijado && !perdido) {
      if (p >= 0.999 && params.mu === 0 && params.nu === 0 && params.m === 0) {
        fijado = true;
        tiempo = g;
      } else if (p <= 0.001 && params.mu === 0 && params.nu === 0 && params.m === 0) {
        perdido = true;
        tiempo = g;
      }
    }
  }
  // Estado final si no fue fijado/perdido durante el recorrido
  if (!fijado && !perdido) {
    const pFinal = trayectoria[trayectoria.length - 1] ?? p;
    if (pFinal >= 0.999) fijado = true;
    else if (pFinal <= 0.001) perdido = true;
  }
  return { trayectoria, fijado, perdido, tiempo };
}

function ejecutarTodas(params: Params): Resultado {
  const simulaciones: Simulacion[] = [];
  for (let k = 0; k < params.K; k++) {
    simulaciones.push(ejecutarSimulacion(params));
  }
  // Media por generación
  const media: number[] = [];
  for (let g = 0; g <= params.G; g++) {
    let sum = 0;
    for (const sim of simulaciones) {
      sum += sim.trayectoria[g] ?? 0;
    }
    media.push(sum / simulaciones.length);
  }
  // Métricas
  const fijaciones = simulaciones.filter((s) => s.fijado);
  const perdidas = simulaciones.filter((s) => s.perdido);
  const pFijacion = fijaciones.length / simulaciones.length;
  const pPerdida = perdidas.length / simulaciones.length;
  const eventos = [...fijaciones, ...perdidas];
  const tiempoMedio =
    eventos.length > 0 ? eventos.reduce((s, e) => s + e.tiempo, 0) / eventos.length : params.G;

  const q0 = 1 - params.p0;
  const heteroInicial = 2 * params.p0 * q0;
  const pFinalMedio = media[media.length - 1] ?? params.p0;
  const qFinal = 1 - pFinalMedio;
  const heteroFinal = 2 * pFinalMedio * qFinal;

  return {
    simulaciones,
    media,
    pFijacion,
    pPerdida,
    tiempoMedio,
    heteroInicial,
    heteroFinal,
    hwAA: params.p0 * params.p0,
    hwAa: 2 * params.p0 * (1 - params.p0),
    hwaa: (1 - params.p0) * (1 - params.p0),
    pFinalMedio,
  };
}

export default function SimuladorDerivaGenetica() {
  const [params, setParams] = useState<Params>(PARAMS_INICIAL);
  const [modo, setModo] = useState<Modo>('deriva');
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const aplicarModo = useCallback((nuevoModo: Modo) => {
    setModo(nuevoModo);
    setResultado(null);
    if (nuevoModo === 'deriva') {
      setParams({
        p0: 0.5,
        N: 50,
        wAA: 1,
        wAa: 1,
        waa: 1,
        mu: 0,
        nu: 0,
        m: 0,
        pm: 0.5,
        G: 100,
        K: 20,
      });
    } else if (nuevoModo === 'direccional') {
      setParams({
        p0: 0.5,
        N: 200,
        wAA: 1,
        wAa: 0.95,
        waa: 0.8,
        mu: 0,
        nu: 0,
        m: 0,
        pm: 0.5,
        G: 100,
        K: 20,
      });
    } else if (nuevoModo === 'equilibradora') {
      setParams({
        p0: 0.5,
        N: 200,
        wAA: 0.8,
        wAa: 1,
        waa: 0.8,
        mu: 0,
        nu: 0,
        m: 0,
        pm: 0.5,
        G: 200,
        K: 20,
      });
    } else if (nuevoModo === 'hardy-weinberg') {
      setParams({
        p0: 0.5,
        N: 1000,
        wAA: 1,
        wAa: 1,
        waa: 1,
        mu: 0,
        nu: 0,
        m: 0,
        pm: 0.5,
        G: 100,
        K: 20,
      });
    }
  }, []);

  const handleSimular = useCallback(() => {
    const res = ejecutarTodas(params);
    setResultado(res);
  }, [params]);

  const handleReiniciar = useCallback(() => {
    setParams(PARAMS_INICIAL);
    setModo('deriva');
    setResultado(null);
  }, []);

  const updateParam = useCallback(<K extends keyof Params>(key: K, value: Params[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Histograma de p finales
  const histograma = useMemo(() => {
    if (!resultado) return [] as number[];
    const bins = 20;
    const counts = new Array(bins).fill(0) as number[];
    for (const sim of resultado.simulaciones) {
      const pFinal = sim.trayectoria[sim.trayectoria.length - 1] ?? 0;
      let idx = Math.floor(pFinal * bins);
      if (idx >= bins) idx = bins - 1;
      counts[idx] = (counts[idx] ?? 0) + 1;
    }
    return counts;
  }, [resultado]);

  const maxCount = useMemo(
    () => (histograma.length > 0 ? Math.max(...histograma, 1) : 1),
    [histograma]
  );

  // SVG dimensions
  const W = 700;
  const H = 350;
  const PAD = 40;

  const xScale = useCallback(
    (g: number) => PAD + (g / Math.max(1, params.G)) * (W - 2 * PAD),
    [params.G]
  );
  const yScale = useCallback((p: number) => PAD + (1 - p) * (H - 2 * PAD), []);

  const trayectoriaPath = useCallback(
    (trayectoria: number[]): string => {
      return trayectoria
        .map((p, g) => `${g === 0 ? 'M' : 'L'} ${xScale(g).toFixed(1)} ${yScale(p).toFixed(1)}`)
        .join(' ');
    },
    [xScale, yScale]
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Deriva Genética y Selección</h1>
        <p>
          Manipula tamaño poblacional, fitness, mutación y migración. Observa cómo evolucionan las
          frecuencias alélicas comparadas con el equilibrio de Hardy-Weinberg.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de modo */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Modo preestablecido</h2>
          <div className={styles.modoSelector}>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'deriva' ? styles.modoActive : ''}`}
              onClick={() => aplicarModo('deriva')}
            >
              Deriva pura (N=50)
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'direccional' ? styles.modoActive : ''}`}
              onClick={() => aplicarModo('direccional')}
            >
              Selección direccional
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${modo === 'equilibradora' ? styles.modoActive : ''}`}
              onClick={() => aplicarModo('equilibradora')}
            >
              Selección equilibradora
            </button>
            <button
              type="button"
              className={`${styles.modoBtn} ${
                modo === 'hardy-weinberg' ? styles.modoActive : ''
              }`}
              onClick={() => aplicarModo('hardy-weinberg')}
            >
              Hardy-Weinberg (N=1000)
            </button>
          </div>
          <p className={styles.modoDescripcion}>
            {modo === 'deriva' &&
              'Solo deriva: con N pequeña, las frecuencias derivan al azar hasta fijar o perder el alelo.'}
            {modo === 'direccional' &&
              'Selección direccional: el alelo "a" es desfavorable (w_aa = 0,8). El alelo A se acerca a la fijación.'}
            {modo === 'equilibradora' &&
              'Heterocigoto ventaja (anemia falciforme): los heterocigotos sobreviven mejor; el polimorfismo se mantiene.'}
            {modo === 'hardy-weinberg' &&
              'Población grande sin selección, mutación ni migración: las frecuencias se mantienen estables.'}
          </p>
        </section>

        {/* Parámetros */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Parámetros del modelo</h2>

          <h3 className={styles.subtitleGroup}>Población</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="p0">
                Frecuencia inicial p₀ (alelo A): <strong>{formatNumber(params.p0, 2)}</strong>
              </label>
              <input
                id="p0"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.p0}
                onChange={(e) => updateParam('p0', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="N">
                Tamaño poblacional N: <strong>{params.N}</strong>
              </label>
              <input
                id="N"
                type="range"
                min={10}
                max={1000}
                step={10}
                value={params.N}
                onChange={(e) => updateParam('N', parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <h3 className={styles.subtitleGroup}>Fitness por genotipo (selección)</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="wAA">
                w<sub>AA</sub>: <strong>{formatNumber(params.wAA, 2)}</strong>
              </label>
              <input
                id="wAA"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.wAA}
                onChange={(e) => updateParam('wAA', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="wAa">
                w<sub>Aa</sub>: <strong>{formatNumber(params.wAa, 2)}</strong>
              </label>
              <input
                id="wAa"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.wAa}
                onChange={(e) => updateParam('wAa', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="waa">
                w<sub>aa</sub>: <strong>{formatNumber(params.waa, 2)}</strong>
              </label>
              <input
                id="waa"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.waa}
                onChange={(e) => updateParam('waa', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <h3 className={styles.subtitleGroup}>Mutación y migración</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="mu">
                μ (mutación A→a): <strong>{params.mu.toExponential(1)}</strong>
              </label>
              <input
                id="mu"
                type="range"
                min={0}
                max={0.01}
                step={0.0001}
                value={params.mu}
                onChange={(e) => updateParam('mu', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="nu">
                ν (mutación a→A): <strong>{params.nu.toExponential(1)}</strong>
              </label>
              <input
                id="nu"
                type="range"
                min={0}
                max={0.01}
                step={0.0001}
                value={params.nu}
                onChange={(e) => updateParam('nu', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="m">
                m (tasa migración): <strong>{formatNumber(params.m, 2)}</strong>
              </label>
              <input
                id="m"
                type="range"
                min={0}
                max={0.5}
                step={0.01}
                value={params.m}
                onChange={(e) => updateParam('m', parseFloat(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="pm">
                p<sub>m</sub> (frecuencia inmigrantes): <strong>{formatNumber(params.pm, 2)}</strong>
              </label>
              <input
                id="pm"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={params.pm}
                onChange={(e) => updateParam('pm', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <h3 className={styles.subtitleGroup}>Simulación</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="G">
                Generaciones G: <strong>{params.G}</strong>
              </label>
              <input
                id="G"
                type="range"
                min={10}
                max={500}
                step={10}
                value={params.G}
                onChange={(e) => updateParam('G', parseInt(e.target.value, 10))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="K">
                Trayectorias K: <strong>{params.K}</strong>
              </label>
              <input
                id="K"
                type="range"
                min={1}
                max={50}
                step={1}
                value={params.K}
                onChange={(e) => updateParam('K', parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className={styles.controlBar}>
            <button type="button" className={styles.calcBtn} onClick={handleSimular}>
              Simular
            </button>
            <button type="button" className={styles.controlBtn} onClick={handleReiniciar}>
              Reiniciar
            </button>
          </div>
        </section>

        {/* Hardy-Weinberg actual */}
        <section className={styles.hwBox}>
          <h3 className={styles.hwTitle}>Equilibrio de Hardy-Weinberg (frecuencias iniciales)</h3>
          <p className={styles.modoDescripcion}>
            p² + 2pq + q² = 1 con p = {formatNumber(params.p0, 2)}, q ={' '}
            {formatNumber(1 - params.p0, 2)}
          </p>
          <div className={styles.hwGrid}>
            <div className={styles.hwCell}>
              <strong>AA (p²)</strong>
              <span>{formatNumber(params.p0 * params.p0 * 100, 1)}%</span>
            </div>
            <div className={styles.hwCell}>
              <strong>Aa (2pq)</strong>
              <span>{formatNumber(2 * params.p0 * (1 - params.p0) * 100, 1)}%</span>
            </div>
            <div className={styles.hwCell}>
              <strong>aa (q²)</strong>
              <span>{formatNumber((1 - params.p0) * (1 - params.p0) * 100, 1)}%</span>
            </div>
          </div>
        </section>

        {/* Resultados */}
        {resultado && (
          <>
            <section className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Resultados de la simulación</h3>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>P(fijación A)</p>
                  <p className={styles.metricValue}>
                    {formatNumber(resultado.pFijacion * 100, 1)}%
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>P(pérdida A)</p>
                  <p className={styles.metricValue}>
                    {formatNumber(resultado.pPerdida * 100, 1)}%
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Tiempo medio (gen.)</p>
                  <p className={styles.metricValue}>
                    {formatNumber(resultado.tiempoMedio, 0)}
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>p̄ final</p>
                  <p className={styles.metricValue}>
                    {formatNumber(resultado.pFinalMedio, 3)}
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>H inicial (2pq)</p>
                  <p className={styles.metricValue}>
                    {formatNumber(resultado.heteroInicial, 3)}
                  </p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>H final</p>
                  <p className={styles.metricValue}>
                    {formatNumber(resultado.heteroFinal, 3)}
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Trayectorias de frecuencia p(A)</h2>
              <div className={styles.legend}>
                <span className={styles.legendItem}>
                  <span className={styles.colorDotMedia} /> Media de las {params.K} simulaciones
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.colorDotTrayectoria} /> Trayectoria individual
                </span>
              </div>
              <div className={styles.chartContainer}>
                <svg
                  className={styles.chartSvg}
                  viewBox={`0 0 ${W} ${H}`}
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="Gráfico de trayectorias de la frecuencia alélica p(A)"
                >
                  {/* Ejes */}
                  <line
                    x1={PAD}
                    y1={H - PAD}
                    x2={W - PAD}
                    y2={H - PAD}
                    stroke="#9ca3af"
                    strokeWidth={1}
                  />
                  <line
                    x1={PAD}
                    y1={PAD}
                    x2={PAD}
                    y2={H - PAD}
                    stroke="#9ca3af"
                    strokeWidth={1}
                  />
                  {/* Líneas de referencia 0.5 */}
                  <line
                    x1={PAD}
                    y1={yScale(0.5)}
                    x2={W - PAD}
                    y2={yScale(0.5)}
                    stroke="#e5e7eb"
                    strokeDasharray="3,3"
                  />
                  {/* Etiquetas Y */}
                  {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                    <g key={`y-${v}`}>
                      <text
                        x={PAD - 8}
                        y={yScale(v) + 4}
                        textAnchor="end"
                        fontSize={10}
                        fill="#6b7280"
                      >
                        {formatNumber(v, 2)}
                      </text>
                      <line
                        x1={PAD - 3}
                        y1={yScale(v)}
                        x2={PAD}
                        y2={yScale(v)}
                        stroke="#9ca3af"
                      />
                    </g>
                  ))}
                  {/* Etiquetas X */}
                  {[0, 0.25, 0.5, 0.75, 1].map((f) => {
                    const g = Math.round(params.G * f);
                    return (
                      <g key={`x-${f}`}>
                        <text
                          x={xScale(g)}
                          y={H - PAD + 16}
                          textAnchor="middle"
                          fontSize={10}
                          fill="#6b7280"
                        >
                          {g}
                        </text>
                        <line
                          x1={xScale(g)}
                          y1={H - PAD}
                          x2={xScale(g)}
                          y2={H - PAD + 3}
                          stroke="#9ca3af"
                        />
                      </g>
                    );
                  })}
                  {/* Trayectorias individuales */}
                  {resultado.simulaciones.map((sim, i) => {
                    const hue = (i * 360) / Math.max(1, resultado.simulaciones.length);
                    return (
                      <path
                        key={`traj-${i}`}
                        d={trayectoriaPath(sim.trayectoria)}
                        fill="none"
                        stroke={`hsl(${hue}, 60%, 55%)`}
                        strokeWidth={1.2}
                        opacity={0.4}
                      />
                    );
                  })}
                  {/* Media */}
                  <path
                    d={trayectoriaPath(resultado.media)}
                    fill="none"
                    stroke="#2E86AB"
                    strokeWidth={3}
                    opacity={1}
                  />
                  {/* Etiquetas ejes */}
                  <text
                    x={W / 2}
                    y={H - 6}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#6b7280"
                    fontWeight={600}
                  >
                    Generación
                  </text>
                  <text
                    x={12}
                    y={H / 2}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#6b7280"
                    fontWeight={600}
                    transform={`rotate(-90, 12, ${H / 2})`}
                  >
                    Frecuencia p(A)
                  </text>
                </svg>
                <p className={styles.chartCaption}>
                  Cada línea fina es una población independiente; la línea azul gruesa es la media.
                </p>
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>
                Distribución de frecuencias finales p(A)
              </h2>
              <div className={styles.legend}>
                <span className={styles.legendItem}>
                  <span className={styles.colorDotPerdido} /> Pérdida (p≈0)
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.colorDotFijado} /> Fijación (p≈1)
                </span>
              </div>
              <div className={styles.histograma}>
                {histograma.map((c, i) => {
                  const altura = (c / maxCount) * 100;
                  let claseExtra = '';
                  if (i === 0) claseExtra = styles.histBarPerdido;
                  else if (i === histograma.length - 1) claseExtra = styles.histBarFijado;
                  return (
                    <div
                      key={`bin-${i}`}
                      className={`${styles.histBar} ${claseExtra}`}
                      style={{ height: `${altura}%` }}
                      title={`p ∈ [${formatNumber(i / 20, 2)}, ${formatNumber(
                        (i + 1) / 20,
                        2
                      )}): ${c} simulaciones`}
                    />
                  );
                })}
              </div>
              <div className={styles.histLabels}>
                <span>0</span>
                <span>0,25</span>
                <span>0,5</span>
                <span>0,75</span>
                <span>1</span>
              </div>
              <p className={styles.chartCaption}>
                Histograma de la frecuencia final p(A) en las {params.K} simulaciones (20 bins).
              </p>
            </section>
          </>
        )}

        <EducationalSection
          title="Guía de Genética de Poblaciones"
          subtitle="Deriva, selección y Hardy-Weinberg"
        >
          <h3>Fuerzas Evolutivas</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Fuerza</th>
                  <th>Efecto</th>
                  <th>Depende de</th>
                  <th>Fórmula clave</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Deriva genética</td>
                  <td>Cambios aleatorios en p</td>
                  <td>Tamaño poblacional N (más fuerte si N pequeño)</td>
                  <td>Var(p) ≈ pq/(2N) por generación</td>
                  <td>Cuello de botella, efecto fundador</td>
                </tr>
                <tr>
                  <td>Selección direccional</td>
                  <td>Un alelo aumenta o disminuye</td>
                  <td>Coeficientes selectivos w</td>
                  <td>p&apos; = (p²w<sub>AA</sub> + pq·w<sub>Aa</sub>) / w̄</td>
                  <td>Resistencia a antibióticos</td>
                </tr>
                <tr>
                  <td>Selección equilibradora</td>
                  <td>Mantiene polimorfismo</td>
                  <td>Heterocigoto con ventaja</td>
                  <td>p* = (w<sub>Aa</sub>−w<sub>aa</sub>)/(2w<sub>Aa</sub>−w<sub>AA</sub>−w<sub>aa</sub>)</td>
                  <td>Anemia falciforme y malaria</td>
                </tr>
                <tr>
                  <td>Mutación</td>
                  <td>Crea variación nueva</td>
                  <td>Tasas μ, ν (típicamente 10⁻⁶ a 10⁻⁴)</td>
                  <td>p&apos; = p(1−μ) + (1−p)ν</td>
                  <td>Mutaciones espontáneas en ADN</td>
                </tr>
                <tr>
                  <td>Migración (flujo génico)</td>
                  <td>Homogeniza poblaciones</td>
                  <td>Tasa m y frecuencia origen p<sub>m</sub></td>
                  <td>p&apos; = (1−m)p + m·p<sub>m</sub></td>
                  <td>Aves migratorias, polen</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Anemia falciforme</h4>
              <p>
                En zonas con malaria, el heterocigoto HbA/HbS resiste mejor el parásito. Selección
                equilibradora mantiene el alelo S pese a ser letal en homocigosis.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Resistencia a antibióticos</h4>
              <p>
                Una mutación que confiere resistencia tiene fitness alto en presencia del fármaco.
                Selección direccional fija el alelo en pocas generaciones.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Efecto fundador</h4>
              <p>
                Un grupo pequeño coloniza una nueva isla. La deriva genética rápidamente fija o
                pierde alelos. Frecuencias muy distintas a la población origen.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Cuello de botella</h4>
              <p>
                Reducción drástica del tamaño poblacional (caza, epidemia). La deriva amplificada
                reduce la diversidad genética y puede fijar alelos deletéreos.
              </p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué dice el principio de Hardy-Weinberg?</strong>
              <p>
                En una población infinita, con apareamiento aleatorio, sin selección, mutación ni
                migración, las frecuencias alélicas y genotípicas se mantienen constantes
                generación tras generación: p² + 2pq + q² = 1.
              </p>
              <p className={styles.faqTip}>
                Es el modelo nulo: si una población se desvía, alguna fuerza evolutiva está
                actuando.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la deriva es más fuerte en poblaciones pequeñas?</strong>
              <p>
                La varianza del cambio en p por generación es pq/(2N). Con N pequeño la varianza es
                grande: en cada generación se sortean pocos alelos, así que el azar domina sobre la
                selección débil.
              </p>
              <p className={styles.faqTip}>
                Regla 4Ns: si |s|·N ≪ 1, la selección es dominada por la deriva.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre selección direccional y equilibradora?</strong>
              <p>
                <strong>Direccional</strong>: un homocigoto es el más apto, el alelo correspondiente
                tiende a fijarse (p→0 o p→1).{' '}
                <strong>Equilibradora</strong>: el heterocigoto tiene ventaja, ambos alelos se
                mantienen en una frecuencia intermedia estable p*.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuándo se rompe Hardy-Weinberg?</strong>
              <p>
                Cuando hay selección (fitness desiguales), mutación significativa, flujo génico,
                tamaño poblacional pequeño (deriva) o apareamiento no aleatorio (endogamia,
                asortativo). En la práctica casi ninguna población real cumple HW estricto.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la heterocigosis y por qué importa?</strong>
              <p>
                H = 2pq es la proporción de individuos heterocigotos esperada. Es una medida de
                diversidad genética: H=0 significa población fijada (sin variación), H máximo (0,5)
                cuando p=q=0,5. La deriva reduce H en el tiempo: H<sub>t</sub> ≈ H₀(1−1/(2N))<sup>t</sup>.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿En qué se diferencian mutación y migración?</strong>
              <p>
                <strong>Mutación</strong> es interna: cambia un alelo a otro al copiar el ADN, tasa
                muy baja (10⁻⁶ a 10⁻⁴ por gen y generación). <strong>Migración</strong> es externa:
                llegan individuos de otra población con una frecuencia distinta. Ambas introducen
                variación, pero la migración es típicamente mucho más rápida.
              </p>
            </div>
          </div>

          <h3>Cómo Interpretar las Trayectorias — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Lee la dispersión de las trayectorias</strong>
                <p>
                  Líneas muy separadas entre sí indican deriva fuerte (poblaciones evolucionan
                  diferente al azar). Líneas pegadas indican que la selección domina sobre el azar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Observa la línea media</strong>
                <p>
                  La media azul gruesa muestra la tendencia esperada. Si sube hacia 1, A se está
                  fijando; si baja hacia 0, se está perdiendo; si se queda en p* intermedio, hay
                  equilibrio.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Mira el histograma final</strong>
                <p>
                  Si las barras se acumulan en los extremos (0 y 1), las poblaciones se fijaron. Si
                  hay distribución continua intermedia, todavía no terminó la evolución o hay
                  equilibrio estable.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Compara P(fijación) con p₀</strong>
                <p>
                  Sin selección, la probabilidad de fijación de un alelo equivale a su frecuencia
                  inicial. Si P(fijación) &gt; p₀, hay selección a favor de A; si es menor,
                  selección en contra.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Verifica heterocigosis</strong>
                <p>
                  H final menor que H inicial confirma que la deriva o la selección direccional
                  redujeron la diversidad. Mantenerse cerca del valor inicial sugiere selección
                  equilibradora o N grande.
                </p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <div>
                <strong>Usa K alto (20-50)</strong>
                <p>
                  Una sola simulación es engañosa por el azar. Repite muchas veces para ver la
                  distribución estadística.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔬</span>
              <div>
                <strong>Compara modos extremos</strong>
                <p>
                  Cambia entre &quot;Deriva pura&quot; y &quot;Hardy-Weinberg&quot; para entender el
                  papel del tamaño poblacional.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⏳</span>
              <div>
                <strong>Aumenta G si no terminó</strong>
                <p>
                  Si todas las trayectorias siguen oscilando, no diste tiempo suficiente. Sube G a
                  300-500.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <div>
                <strong>Equilibradora: prueba w distintos</strong>
                <p>
                  El equilibrio estable es p* = (w<sub>Aa</sub>−w<sub>aa</sub>)/(2w<sub>Aa</sub>
                  −w<sub>AA</sub>−w<sub>aa</sub>). Verifica que la media converja ahí.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧮</span>
              <div>
                <strong>Tasas de mutación realistas</strong>
                <p>
                  En la naturaleza μ ≈ 10⁻⁶ a 10⁻⁴ por gen. Valores mayores son útiles para ver el
                  efecto en pocas generaciones.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🌍</span>
              <div>
                <strong>Migración m alta</strong>
                <p>
                  Con m &gt; 0,1, el flujo génico arrastra rápidamente la frecuencia local hacia la
                  del foco emisor p<sub>m</sub>.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <span>Limitaciones del Modelo</span>
            </div>
            <ul className={styles.warningList}>
              <li>Solo se simulan 2 alelos en un único locus (sin loci ligados ni epistasia).</li>
              <li>
                Las generaciones son discretas y no se solapan (modelo Wright-Fisher); muchas
                especies tienen generaciones solapadas.
              </li>
              <li>
                Apareamiento aleatorio: no hay endogamia, apareamiento asortativo ni estructura
                familiar.
              </li>
              <li>
                Sin estructura de edad ni espacio: todos los individuos son intercambiables y
                contribuyen igual al pool gamético.
              </li>
              <li>
                Fitness y ambiente constantes: los coeficientes selectivos no varían con la
                densidad ni con el tiempo.
              </li>
              <li>
                Modelo educativo: para investigación real se usan SLiM, msprime u otras
                herramientas con migración multi-poblacional, recombinación y selección
                dependiente de frecuencia.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-deriva-genetica')} />
        <ShareCard appName="simulador-deriva-genetica" />
      </main>

      <Footer appName="simulador-deriva-genetica" />
    </div>
  );
}
