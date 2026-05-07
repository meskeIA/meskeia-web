'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import styles from './SimuladorLotkaVolterra.module.css';

// ============================================================================
// TIPOS
// ============================================================================

interface Punto {
  t: number;
  x: number; // presa
  y: number; // depredador
}

interface Parametros {
  alfa: number;
  beta: number;
  delta: number;
  gamma: number;
  K: number; // capacidad de carga (solo modo logístico)
}

interface Evento {
  tipo: 'pico-presa' | 'pico-depredador' | 'colapso-presa' | 'colapso-depredador' | 'extincion-presa' | 'extincion-depredador';
  t: number;
  valor: number;
  descripcion: string;
}

type Modo = 'clasico' | 'logistico';
type PresetId = 'linces-liebres' | 'sobrepesca' | 'equilibrio' | 'caos';

interface Preset {
  id: PresetId;
  nombre: string;
  icono: string;
  descripcion: string;
  modo: Modo;
  x0: number;
  y0: number;
  alfa: number;
  beta: number;
  delta: number;
  gamma: number;
  K: number;
  tTotal: number;
}

const PRESETS: Preset[] = [
  {
    id: 'linces-liebres',
    nombre: 'Linces y liebres',
    icono: '🐰',
    descripcion: 'Caso clásico de oscilaciones cíclicas observadas en Canadá',
    modo: 'clasico',
    x0: 80, y0: 20, alfa: 1.0, beta: 0.1, delta: 0.075, gamma: 1.5, K: 200, tTotal: 60,
  },
  {
    id: 'sobrepesca',
    nombre: 'Sobrepesca',
    icono: '🎣',
    descripcion: 'Tasa de depredación alta — colapso del ecosistema',
    modo: 'clasico',
    x0: 40, y0: 30, alfa: 0.8, beta: 0.4, delta: 0.05, gamma: 0.3, K: 200, tTotal: 80,
  },
  {
    id: 'equilibrio',
    nombre: 'Equilibrio estable',
    icono: '⚖️',
    descripcion: 'Capacidad de carga limitada — convergencia a punto fijo',
    modo: 'logistico',
    x0: 50, y0: 15, alfa: 1.0, beta: 0.1, delta: 0.08, gamma: 0.8, K: 100, tTotal: 80,
  },
  {
    id: 'caos',
    nombre: 'Caos demográfico',
    icono: '🌪️',
    descripcion: 'Parámetros extremos, oscilaciones violentas',
    modo: 'clasico',
    x0: 10, y0: 5, alfa: 1.8, beta: 0.05, delta: 0.05, gamma: 1.8, K: 200, tTotal: 100,
  },
];

// ============================================================================
// MOTOR DE SIMULACIÓN (Runge-Kutta 4)
// ============================================================================

function paso(
  x: number,
  y: number,
  dt: number,
  modo: Modo,
  params: Parametros
): { x: number; y: number } {
  const f = (xv: number, yv: number): number =>
    modo === 'logistico'
      ? params.alfa * xv * (1 - xv / params.K) - params.beta * xv * yv
      : params.alfa * xv - params.beta * xv * yv;
  const g = (xv: number, yv: number): number => params.delta * xv * yv - params.gamma * yv;

  const k1x = f(x, y);
  const k1y = g(x, y);
  const k2x = f(x + (dt / 2) * k1x, y + (dt / 2) * k1y);
  const k2y = g(x + (dt / 2) * k1x, y + (dt / 2) * k1y);
  const k3x = f(x + (dt / 2) * k2x, y + (dt / 2) * k2y);
  const k3y = g(x + (dt / 2) * k2x, y + (dt / 2) * k2y);
  const k4x = f(x + dt * k3x, y + dt * k3y);
  const k4y = g(x + dt * k3x, y + dt * k3y);

  return {
    x: Math.max(0, x + (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x)),
    y: Math.max(0, y + (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y)),
  };
}

function simular(
  x0: number,
  y0: number,
  tTotal: number,
  modo: Modo,
  params: Parametros
): Punto[] {
  const dt = 0.02;
  const numPasos = Math.ceil(tTotal / dt);
  const puntos: Punto[] = [{ t: 0, x: x0, y: y0 }];
  let xActual = x0;
  let yActual = y0;
  const muestreo = Math.max(1, Math.floor(numPasos / 1500));

  for (let i = 1; i <= numPasos; i++) {
    const r = paso(xActual, yActual, dt, modo, params);
    xActual = r.x;
    yActual = r.y;
    if (i % muestreo === 0) {
      puntos.push({ t: i * dt, x: xActual, y: yActual });
    }
    // Cortar si extinción mutua
    if (xActual < 0.001 && yActual < 0.001) {
      puntos.push({ t: i * dt, x: 0, y: 0 });
      break;
    }
  }
  return puntos;
}

function detectarEventos(puntos: Punto[]): Evento[] {
  const eventos: Evento[] = [];
  if (puntos.length < 5) return eventos;

  // Picos: máximos locales (ventana 10)
  const ventana = 10;
  let extincionPresaMarcada = false;
  let extincionDepredadorMarcada = false;

  for (let i = ventana; i < puntos.length - ventana; i++) {
    const p = puntos[i];
    let esMaxX = true, esMaxY = true, esMinX = true, esMinY = true;
    for (let j = i - ventana; j <= i + ventana; j++) {
      if (j === i) continue;
      if (puntos[j].x >= p.x) esMaxX = false;
      if (puntos[j].y >= p.y) esMaxY = false;
      if (puntos[j].x <= p.x) esMinX = false;
      if (puntos[j].y <= p.y) esMinY = false;
    }
    if (esMaxX && p.x > 1) {
      eventos.push({
        tipo: 'pico-presa',
        t: p.t,
        valor: p.x,
        descripcion: `Pico de presas: ${formatNumber(p.x, 0)} ind. en t=${formatNumber(p.t, 1)}`,
      });
    }
    if (esMaxY && p.y > 1) {
      eventos.push({
        tipo: 'pico-depredador',
        t: p.t,
        valor: p.y,
        descripcion: `Pico de depredadores: ${formatNumber(p.y, 0)} ind. en t=${formatNumber(p.t, 1)}`,
      });
    }
    if (esMinX && p.x < 1 && !extincionPresaMarcada) {
      eventos.push({
        tipo: 'extincion-presa',
        t: p.t,
        valor: p.x,
        descripcion: `Casi-extinción de presas (x<1) en t=${formatNumber(p.t, 1)}`,
      });
      extincionPresaMarcada = true;
    }
    if (esMinY && p.y < 1 && !extincionDepredadorMarcada) {
      eventos.push({
        tipo: 'extincion-depredador',
        t: p.t,
        valor: p.y,
        descripcion: `Casi-extinción de depredadores (y<1) en t=${formatNumber(p.t, 1)}`,
      });
      extincionDepredadorMarcada = true;
    }
  }

  // Limitar y ordenar
  return eventos.slice(0, 12).sort((a, b) => a.t - b.t);
}

// ============================================================================
// COMPONENTE
// ============================================================================

export default function Page() {
  const [modo, setModo] = useState<Modo>('clasico');
  const [x0, setX0] = useState<number>(40);
  const [y0, setY0] = useState<number>(9);
  const [alfa, setAlfa] = useState<number>(1.0);
  const [beta, setBeta] = useState<number>(0.1);
  const [delta, setDelta] = useState<number>(0.075);
  const [gamma, setGamma] = useState<number>(1.5);
  const [K, setK] = useState<number>(200);
  const [tTotal, setTTotal] = useState<number>(100);

  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [puntosVisibles, setPuntosVisibles] = useState<number>(0);
  const [animando, setAnimando] = useState<boolean>(false);
  const [pausado, setPausado] = useState<boolean>(false);
  const [velocidad, setVelocidad] = useState<number>(1);

  const animFrameRef = useRef<number | null>(null);
  const ultimoTiempoRef = useRef<number>(0);

  // Aplicar preset
  const aplicarPreset = useCallback((preset: Preset): void => {
    setModo(preset.modo);
    setX0(preset.x0);
    setY0(preset.y0);
    setAlfa(preset.alfa);
    setBeta(preset.beta);
    setDelta(preset.delta);
    setGamma(preset.gamma);
    setK(preset.K);
    setTTotal(preset.tTotal);
    setPuntos([]);
    setEventos([]);
    setPuntosVisibles(0);
    setAnimando(false);
    setPausado(false);
  }, []);

  // Iniciar simulación
  const iniciarSimulacion = useCallback((): void => {
    const params: Parametros = { alfa, beta, delta, gamma, K };
    const resultado = simular(x0, y0, tTotal, modo, params);
    const eventosDetectados = detectarEventos(resultado);
    setPuntos(resultado);
    setEventos(eventosDetectados);
    setPuntosVisibles(0);
    setAnimando(true);
    setPausado(false);
  }, [x0, y0, tTotal, modo, alfa, beta, delta, gamma, K]);

  const reiniciar = useCallback((): void => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setPuntos([]);
    setEventos([]);
    setPuntosVisibles(0);
    setAnimando(false);
    setPausado(false);
    setVelocidad(1);
  }, []);

  const pausar = useCallback((): void => {
    setPausado((p) => !p);
  }, []);

  const acelerar = useCallback((): void => {
    setVelocidad((v) => (v >= 4 ? 1 : v * 2));
  }, []);

  // Animación
  useEffect(() => {
    if (!animando || pausado || puntos.length === 0) return;
    if (puntosVisibles >= puntos.length) {
      setAnimando(false);
      return;
    }

    const animar = (tiempo: number): void => {
      if (ultimoTiempoRef.current === 0) ultimoTiempoRef.current = tiempo;
      const dtMs = tiempo - ultimoTiempoRef.current;
      const incremento = Math.max(1, Math.floor((dtMs / 1000) * 60 * velocidad));
      ultimoTiempoRef.current = tiempo;

      setPuntosVisibles((v) => {
        const nuevoValor = v + incremento;
        if (nuevoValor >= puntos.length) {
          return puntos.length;
        }
        return nuevoValor;
      });

      animFrameRef.current = requestAnimationFrame(animar);
    };

    ultimoTiempoRef.current = 0;
    animFrameRef.current = requestAnimationFrame(animar);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [animando, pausado, puntos.length, velocidad, puntosVisibles]);

  // Datos derivados
  const puntosMostrar = useMemo(() => puntos.slice(0, puntosVisibles), [puntos, puntosVisibles]);
  const ultimoPunto = puntosMostrar.length > 0 ? puntosMostrar[puntosMostrar.length - 1] : null;

  const escalas = useMemo(() => {
    if (puntos.length === 0) return { tMax: 1, popMax: 1 };
    let tMax = 0;
    let popMax = 0;
    for (const p of puntos) {
      if (p.t > tMax) tMax = p.t;
      if (p.x > popMax) popMax = p.x;
      if (p.y > popMax) popMax = p.y;
    }
    return { tMax: tMax || 1, popMax: popMax || 1 };
  }, [puntos]);

  // Generar paths SVG
  const pathPresa = useMemo(() => {
    if (puntosMostrar.length < 2) return '';
    const w = 600, h = 280, pad = 40;
    const sx = (t: number): number => pad + (t / escalas.tMax) * (w - 2 * pad);
    const sy = (v: number): number => h - pad - (v / escalas.popMax) * (h - 2 * pad);
    return puntosMostrar
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.x).toFixed(1)}`)
      .join(' ');
  }, [puntosMostrar, escalas]);

  const pathDepredador = useMemo(() => {
    if (puntosMostrar.length < 2) return '';
    const w = 600, h = 280, pad = 40;
    const sx = (t: number): number => pad + (t / escalas.tMax) * (w - 2 * pad);
    const sy = (v: number): number => h - pad - (v / escalas.popMax) * (h - 2 * pad);
    return puntosMostrar
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.y).toFixed(1)}`)
      .join(' ');
  }, [puntosMostrar, escalas]);

  const pathFases = useMemo(() => {
    if (puntosMostrar.length < 2) return '';
    const w = 380, h = 320, pad = 40;
    const sx = (v: number): number => pad + (v / escalas.popMax) * (w - 2 * pad);
    const sy = (v: number): number => h - pad - (v / escalas.popMax) * (h - 2 * pad);
    return puntosMostrar
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
      .join(' ');
  }, [puntosMostrar, escalas]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador Depredador-Presa</h1>
        <p>Modelo Lotka-Volterra y dinámica de poblaciones</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Selector de modo */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Modo de simulación</h2>
          <div className={styles.modoSelector}>
            <button
              className={`${styles.modoBtn} ${modo === 'clasico' ? styles.modoActive : ''}`}
              onClick={() => setModo('clasico')}
              type="button"
            >
              Lotka-Volterra clásico
            </button>
            <button
              className={`${styles.modoBtn} ${modo === 'logistico' ? styles.modoActive : ''}`}
              onClick={() => setModo('logistico')}
              type="button"
            >
              Con capacidad de carga
            </button>
          </div>
          <p className={styles.modoDescripcion}>
            {modo === 'clasico'
              ? 'Las presas crecen exponencialmente sin depredadores. Solución: oscilaciones cíclicas perpetuas.'
              : 'Las presas tienen un límite de población K (recursos finitos). Solución: convergencia a equilibrio.'}
          </p>
        </div>

        {/* Presets */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Escenarios predefinidos</h2>
          <div className={styles.presetGrid}>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={styles.presetCard}
                onClick={() => aplicarPreset(preset)}
                type="button"
              >
                <span className={styles.presetIcono}>{preset.icono}</span>
                <strong>{preset.nombre}</strong>
                <p>{preset.descripcion}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Parámetros */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Parámetros</h2>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="x0">
                Presas iniciales x₀: <strong>{formatNumber(x0, 0)}</strong>
              </label>
              <input
                id="x0"
                type="range"
                min="1"
                max="200"
                step="1"
                value={x0}
                onChange={(e) => setX0(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="y0">
                Depredadores iniciales y₀: <strong>{formatNumber(y0, 0)}</strong>
              </label>
              <input
                id="y0"
                type="range"
                min="1"
                max="100"
                step="1"
                value={y0}
                onChange={(e) => setY0(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="alfa">
                α (reproducción presa): <strong>{formatNumber(alfa, 2)}</strong>
              </label>
              <input
                id="alfa"
                type="range"
                min="0.1"
                max="2"
                step="0.05"
                value={alfa}
                onChange={(e) => setAlfa(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="beta">
                β (depredación): <strong>{formatNumber(beta, 3)}</strong>
              </label>
              <input
                id="beta"
                type="range"
                min="0.001"
                max="0.5"
                step="0.001"
                value={beta}
                onChange={(e) => setBeta(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="delta">
                δ (eficiencia conversión): <strong>{formatNumber(delta, 3)}</strong>
              </label>
              <input
                id="delta"
                type="range"
                min="0.001"
                max="0.5"
                step="0.001"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="gamma">
                γ (mortalidad depredador): <strong>{formatNumber(gamma, 2)}</strong>
              </label>
              <input
                id="gamma"
                type="range"
                min="0.1"
                max="2"
                step="0.05"
                value={gamma}
                onChange={(e) => setGamma(Number(e.target.value))}
              />
            </div>
            {modo === 'logistico' && (
              <div className={styles.inputGroup}>
                <label htmlFor="K">
                  K (capacidad de carga): <strong>{formatNumber(K, 0)}</strong>
                </label>
                <input
                  id="K"
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={K}
                  onChange={(e) => setK(Number(e.target.value))}
                />
              </div>
            )}
            <div className={styles.inputGroup}>
              <label htmlFor="tTotal">
                Tiempo total: <strong>{formatNumber(tTotal, 0)} u.t.</strong>
              </label>
              <input
                id="tTotal"
                type="range"
                min="10"
                max="200"
                step="5"
                value={tTotal}
                onChange={(e) => setTTotal(Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.controlBar}>
            <button className={styles.calcBtn} onClick={iniciarSimulacion} type="button">
              ▶ Simular
            </button>
            {animando && (
              <>
                <button className={styles.controlBtn} onClick={pausar} type="button">
                  {pausado ? '▶ Reanudar' : '⏸ Pausar'}
                </button>
                <button className={styles.controlBtn} onClick={acelerar} type="button">
                  ⏩ Velocidad {velocidad}x
                </button>
              </>
            )}
            <button className={styles.controlBtn} onClick={reiniciar} type="button">
              ⟲ Reiniciar
            </button>
          </div>
        </div>

        {/* Estado actual */}
        {ultimoPunto && (
          <div className={styles.resultBlock}>
            <h3 className={styles.resultTitle}>Estado actual del ecosistema</h3>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Tiempo simulado:</span>
              <span className={styles.resultValueAccent}>
                {formatNumber(ultimoPunto.t, 1)} u.t.
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Presas (x):</span>
              <span className={styles.resultValue}>
                {formatNumber(ultimoPunto.x, 0)} individuos
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Depredadores (y):</span>
              <span className={styles.resultValue}>
                {formatNumber(ultimoPunto.y, 0)} individuos
              </span>
            </div>
            <div className={styles.resultRow}>
              <span className={styles.resultLabel}>Modo:</span>
              <span className={styles.resultValue}>
                {modo === 'clasico' ? 'Lotka-Volterra clásico' : 'Con capacidad de carga'}
              </span>
            </div>
          </div>
        )}

        {/* Gráfico temporal */}
        {puntos.length > 0 && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Evolución temporal x(t), y(t)</h2>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.colorDotPrey}></span> Presas (x)
              </span>
              <span className={styles.legendItem}>
                <span className={styles.colorDotPredator}></span> Depredadores (y)
              </span>
            </div>
            <svg
              className={styles.chartSvg}
              viewBox="0 0 600 280"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Gráfico temporal de poblaciones"
            >
              {/* Ejes */}
              <line x1="40" y1="240" x2="560" y2="240" stroke="#9ca3af" strokeWidth="1" />
              <line x1="40" y1="40" x2="40" y2="240" stroke="#9ca3af" strokeWidth="1" />
              {/* Etiquetas ejes */}
              <text x="300" y="270" textAnchor="middle" fontSize="11" fill="#6b7280">
                Tiempo (u.t.) — máx: {formatNumber(escalas.tMax, 0)}
              </text>
              <text x="15" y="140" textAnchor="middle" fontSize="11" fill="#6b7280" transform="rotate(-90 15 140)">
                Población — máx: {formatNumber(escalas.popMax, 0)}
              </text>
              {/* Líneas de cuadrícula */}
              {[0.25, 0.5, 0.75].map((frac) => (
                <line
                  key={frac}
                  x1="40"
                  y1={240 - frac * 200}
                  x2="560"
                  y2={240 - frac * 200}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                  strokeDasharray="2,3"
                />
              ))}
              {/* Curva presa */}
              <path d={pathPresa} stroke="#2E86AB" strokeWidth="2.2" fill="none" />
              {/* Curva depredador */}
              <path d={pathDepredador} stroke="#dc2626" strokeWidth="2.2" fill="none" />
            </svg>
          </div>
        )}

        {/* Diagrama de fases */}
        {puntos.length > 0 && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Diagrama de fases (x, y)</h2>
            <p className={styles.fasesAyuda}>
              Trayectoria del sistema en el plano presa-depredador. En modo clásico, ciclos cerrados; en logístico, espiral hacia equilibrio.
            </p>
            <svg
              className={styles.phaseChartSvg}
              viewBox="0 0 380 320"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Diagrama de fases"
            >
              {/* Ejes */}
              <line x1="40" y1="280" x2="340" y2="280" stroke="#9ca3af" strokeWidth="1" />
              <line x1="40" y1="40" x2="40" y2="280" stroke="#9ca3af" strokeWidth="1" />
              <text x="190" y="305" textAnchor="middle" fontSize="11" fill="#6b7280">
                Presas (x)
              </text>
              <text x="15" y="160" textAnchor="middle" fontSize="11" fill="#6b7280" transform="rotate(-90 15 160)">
                Depredadores (y)
              </text>
              {/* Cuadrícula */}
              {[0.25, 0.5, 0.75].map((frac) => (
                <g key={frac}>
                  <line
                    x1="40"
                    y1={280 - frac * 240}
                    x2="340"
                    y2={280 - frac * 240}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray="2,3"
                  />
                  <line
                    x1={40 + frac * 300}
                    y1="40"
                    x2={40 + frac * 300}
                    y2="280"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray="2,3"
                  />
                </g>
              ))}
              {/* Trayectoria */}
              <path d={pathFases} stroke="#48A9A6" strokeWidth="1.8" fill="none" />
              {/* Punto inicial */}
              {puntosMostrar.length > 0 && (
                <circle
                  cx={40 + (puntosMostrar[0].x / escalas.popMax) * 300}
                  cy={280 - (puntosMostrar[0].y / escalas.popMax) * 240}
                  r="5"
                  fill="#10b981"
                />
              )}
              {/* Punto actual */}
              {ultimoPunto && (
                <circle
                  cx={40 + (ultimoPunto.x / escalas.popMax) * 300}
                  cy={280 - (ultimoPunto.y / escalas.popMax) * 240}
                  r="5"
                  fill="#dc2626"
                />
              )}
            </svg>
          </div>
        )}

        {/* Eventos */}
        {eventos.length > 0 && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Eventos detectados</h2>
            <ul className={styles.eventList}>
              {eventos.map((ev, idx) => (
                <li key={idx} className={styles.eventItem}>
                  <span className={styles.eventIcon}>
                    {ev.tipo.startsWith('pico') ? '📈' : ev.tipo.startsWith('extincion') ? '⚠️' : '📉'}
                  </span>
                  <span>{ev.descripcion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <EducationalSection
          title="Guía del Modelo Depredador-Presa"
          subtitle="Lotka-Volterra y dinámica de ecosistemas"
        >
          <h3>Las Ecuaciones del Modelo</h3>
          <p>
            El modelo Lotka-Volterra describe la dinámica de dos especies que interactúan:
            una presa (x) y un depredador (y). Las dos ecuaciones diferenciales acopladas son:
          </p>
          <p style={{ fontFamily: 'Courier New, monospace', textAlign: 'center', fontSize: '1.05rem' }}>
            dx/dt = α·x − β·x·y<br />
            dy/dt = δ·x·y − γ·y
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Símbolo</th>
                  <th>Significado biológico</th>
                  <th>Ejemplo numérico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Reproducción presa</td>
                  <td>α (alfa)</td>
                  <td>Tasa de crecimiento de presas en ausencia de depredadores</td>
                  <td>α = 1,0 → población se duplica cada ~0,69 u.t.</td>
                </tr>
                <tr>
                  <td>Depredación</td>
                  <td>β (beta)</td>
                  <td>Probabilidad de que un encuentro presa-depredador mate a la presa</td>
                  <td>β = 0,1 → 10% de encuentros letales</td>
                </tr>
                <tr>
                  <td>Eficiencia conversión</td>
                  <td>δ (delta)</td>
                  <td>Cuántos depredadores nuevos genera cada presa consumida</td>
                  <td>δ = 0,075 → ~13 presas por depredador nacido</td>
                </tr>
                <tr>
                  <td>Mortalidad depredador</td>
                  <td>γ (gamma)</td>
                  <td>Tasa de muerte de depredadores sin presas disponibles</td>
                  <td>γ = 1,5 → vida media ~0,46 u.t.</td>
                </tr>
                <tr>
                  <td>Capacidad de carga</td>
                  <td>K</td>
                  <td>Población máxima de presas que el ecosistema puede sostener</td>
                  <td>K = 200 → recursos limitados a 200 individuos</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso Reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>🎓 Estudiante de biología/ecología</h4>
              <p>Visualiza por qué las poblaciones de linces y liebres oscilan en ciclos de ~10 años. Manipula β y γ para ver cómo cambia la frecuencia de los ciclos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🧮 Universitario de matemáticas aplicadas</h4>
              <p>Estudia ecuaciones diferenciales no lineales acopladas, puntos de equilibrio y estabilidad. Compara comportamiento clásico vs logístico.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🧑‍🏫 Profesor de ciencias</h4>
              <p>Demuestra en clase cómo emergen oscilaciones de reglas locales simples. Usa los presets para casos didácticos clásicos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🔬 Investigador de ecosistemas</h4>
              <p>Explora escenarios de sobrepesca, introducción de especies invasoras o impacto de cambios en la tasa de mortalidad por enfermedad.</p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué oscilan las poblaciones?</strong>
              <p>
                Cuando hay muchas presas, los depredadores prosperan y se multiplican. Al haber muchos depredadores, comen tantas presas que su número cae. Sin presas, los depredadores mueren de hambre. Sin depredadores, las presas se recuperan. El ciclo se repite.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué predice el modelo en el caso de linces y liebres?</strong>
              <p>
                Los registros de pieles de la Hudson Bay Company (1845-1935) muestran ciclos de ~10 años en linces canadienses y liebres americanas. El modelo Lotka-Volterra reproduce cualitativamente estas oscilaciones, aunque la realidad es más compleja (clima, enfermedades, otras presas).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la capacidad de carga K?</strong>
              <p>
                K es la población máxima de presas que el ecosistema puede mantener (alimento, espacio). En el modelo logístico, las presas crecen siguiendo dx/dt = α·x·(1-x/K), no exponencialmente. Esto provoca que el sistema converja a un equilibrio en lugar de oscilar perpetuamente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿El modelo predice extinciones reales?</strong>
              <p>
                El Lotka-Volterra clásico nunca predice extinción matemática (las poblaciones se acercan a cero pero no llegan). En la práctica, cuando una población baja a 1-2 individuos, factores estocásticos (azar, demografía) provocan extinción real, algo que el modelo determinista no captura.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Diferencia entre Lotka-Volterra y modelo logístico?</strong>
              <p>
                El logístico (Verhulst) describe una sola especie con crecimiento limitado: dx/dt = α·x·(1-x/K). El Lotka-Volterra acopla dos especies. Combinarlos (presa logística + depredador) da un modelo realista con equilibrio estable, sin oscilaciones perpetuas artificiales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué simplificaciones hace el modelo?</strong>
              <p>
                Asume: una sola presa y un solo depredador, sin estructura de edad, sin estructura espacial, encuentros aleatorios proporcionales a x·y, ambiente estable sin clima, sin migración, parámetros constantes en el tiempo. Modelos más realistas incluyen Holling (saturación de depredación) o Rosenzweig-MacArthur.
              </p>
            </div>
          </div>

          <h3>Cómo Interpretar una Simulación — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica los parámetros</strong>
                <p>Antes de simular, observa los valores de α, β, δ, γ. Calcula los puntos de equilibrio teóricos: x* = γ/δ, y* = α/β.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Lanza la simulación</strong>
                <p>Pulsa &quot;Simular&quot; y observa cómo evolucionan las dos curvas en el gráfico temporal. Usa &quot;Acelerar&quot; si quieres saltar al final rápidamente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Observa la oscilación</strong>
                <p>En modo clásico verás picos alternados: primero presas, luego depredadores con desfase. La curva del depredador va siempre por detrás de la presa.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Detecta picos y colapsos</strong>
                <p>El panel de eventos te muestra automáticamente los picos máximos y mínimos. Compara con tus predicciones teóricas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Valida con el diagrama de fases</strong>
                <p>Mira el diagrama (x, y). Si es un círculo cerrado, el sistema oscila perpetuamente (clásico). Si es una espiral hacia el centro, hay un equilibrio estable (logístico).</p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <div>
                <strong>Empieza con el preset de linces y liebres</strong>
                <p>Es el caso clásico de los libros de texto. Familiarízate antes de cambiar parámetros.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <div>
                <strong>Calcula equilibrios teóricos</strong>
                <p>El punto fijo no trivial está en x* = γ/δ, y* = α/β. Verifícalo con la simulación.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <div>
                <strong>Compara modos clásico vs logístico</strong>
                <p>Mismos α, β, δ, γ pero distinto modo da resultados radicalmente distintos.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <div>
                <strong>Sube el tiempo total para ver tendencias</strong>
                <p>Con t=100 puedes ver 4-5 ciclos completos. Con t=200, ves la convergencia (logístico) o la persistencia (clásico).</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧪</span>
              <div>
                <strong>Experimenta con condiciones extremas</strong>
                <p>Sube β o γ al máximo para provocar colapsos. Usa el preset &quot;Sobrepesca&quot; como punto de partida.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <div>
                <strong>Lee siempre el diagrama de fases</strong>
                <p>Da más información que el gráfico temporal. Permite distinguir oscilación, espiral, ciclo límite o extinción.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              Limitaciones del Modelo
            </div>
            <ul className={styles.warningList}>
              <li>Solo modela dos especies — los ecosistemas reales tienen redes tróficas con decenas o cientos de especies interactuando.</li>
              <li>No incluye estructura de edad: cría, juvenil y adulto se tratan igual, aunque biológicamente sean muy distintos.</li>
              <li>No considera estructura espacial — supone que todos los individuos pueden encontrarse aleatoriamente con cualquier otro.</li>
              <li>Asume parámetros constantes — en la realidad α, β, δ y γ varían con estación, edad, salud, recursos.</li>
              <li>No incluye migración ni dispersión — las poblaciones reales tienen flujos de entrada y salida.</li>
              <li>Modelo determinista — no captura efectos estocásticos (azar) que dominan en poblaciones pequeñas y pueden causar extinciones reales.</li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('simulador-lotka-volterra')} />
      <ShareCard appName="simulador-lotka-volterra" />
      <Footer appName="simulador-lotka-volterra" />
    </div>
  );
}
