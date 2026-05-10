'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorConservacionEnergia.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type TrackId = 'rampa' | 'valle' | 'montana_rusa' | 'looping_suave';

interface TrackDef {
  id: TrackId;
  nombre: string;
  icono: string;
  // Pista parametrizada por x: y(x)
  y: (x: number) => number;
  yPrime: (x: number) => number;
  xMin: number;
  xMax: number;
  xInicial: number;
  altInicialDefault: number; // referencia para slider
}

// ============================================
// CATÁLOGO DE PISTAS (perfiles y(x))
// Coordenadas en metros aproximados
// ============================================
const TRACKS: Record<TrackId, TrackDef> = {
  rampa: {
    id: 'rampa',
    nombre: 'Rampa',
    icono: '⛷️',
    y: (x) => {
      // Rampa lineal en [0, 10], luego suelo plano [10, 20]
      if (x < 10) return 10 - x;
      return 0;
    },
    yPrime: (x) => {
      if (x < 10) return -1;
      return 0;
    },
    xMin: 0,
    xMax: 20,
    xInicial: 0,
    altInicialDefault: 10,
  },
  valle: {
    id: 'valle',
    nombre: 'Valle parabólico',
    icono: '🥣',
    y: (x) => 0.1 * (x - 10) * (x - 10),
    yPrime: (x) => 0.2 * (x - 10),
    xMin: 0,
    xMax: 20,
    xInicial: 0,
    altInicialDefault: 10,
  },
  montana_rusa: {
    id: 'montana_rusa',
    nombre: 'Montaña rusa',
    icono: '🎢',
    // Suma de cosenos: una pendiente decreciente con jorobas
    y: (x) => {
      // Empieza a 10 m, baja oscilando hasta ~0
      const decay = Math.max(0, 10 - x * 0.3);
      const oscil = 2.5 * Math.cos(x * 0.7) * Math.exp(-0.05 * x);
      return decay + oscil;
    },
    yPrime: (x) => {
      // Derivada
      const decayPrime = -0.3;
      // d/dx [cos(0.7x) * e^(-0.05x)] = -0.7 sin(0.7x) e^(-0.05x) - 0.05 cos(0.7x) e^(-0.05x)
      const oscilPrime = 2.5 * (-0.7 * Math.sin(x * 0.7) * Math.exp(-0.05 * x) - 0.05 * Math.cos(x * 0.7) * Math.exp(-0.05 * x));
      return decayPrime + oscilPrime;
    },
    xMin: 0,
    xMax: 24,
    xInicial: 0,
    altInicialDefault: 12.5,
  },
  looping_suave: {
    id: 'looping_suave',
    nombre: 'Doble joroba',
    icono: '🌊',
    // Dos jorobas y un valle
    y: (x) => {
      const y0 = 8;
      return y0 - x * 0.2 + 3 * Math.sin(x * 0.5) * Math.exp(-0.04 * x);
    },
    yPrime: (x) => {
      const decayPrime = -0.2;
      const oscilPrime = 3 * (0.5 * Math.cos(x * 0.5) * Math.exp(-0.04 * x) - 0.04 * Math.sin(x * 0.5) * Math.exp(-0.04 * x));
      return decayPrime + oscilPrime;
    },
    xMin: 0,
    xMax: 24,
    xInicial: 0,
    altInicialDefault: 8,
  },
};

const TRACK_IDS: TrackId[] = ['rampa', 'valle', 'montana_rusa', 'looping_suave'];

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorConservacionEnergiaPage() {
  const [trackId, setTrackId] = useState<TrackId>('valle');
  const [masa, setMasa] = useState(1);
  const [g, setG] = useState(9.8);
  const [mu, setMu] = useState(0); // coeficiente fricción cinética
  const [altInicial, setAltInicial] = useState(10);
  const [running, setRunning] = useState(false);

  // Estado físico (no en React state para evitar re-renders 60 fps)
  const stateRef = useRef({
    x: 0, // posición en x (metros)
    v: 0, // velocidad a lo largo de la curva (m/s, con signo)
    energiaInicial: 0,
  });

  // Datos para mostrar (se actualizan a 30 fps con setForceRender)
  const [, setTick] = useState(0);
  const dataRef = useRef({
    x: 0,
    y: 0,
    v: 0,
    eC: 0,
    eP: 0,
    eTotal: 0,
    eInicial: 0,
    tiempo: 0,
    eDisipada: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const track = TRACKS[trackId];

  // ============================================
  // INICIALIZAR / RESET
  // ============================================
  const reset = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setRunning(false);

    // Buscar x tal que y(x) = altInicial (cerca del inicio)
    // Para simplificar: para 'rampa' y 'valle' se puede invertir; para los demás buscar numéricamente
    let xInit = track.xInicial;

    if (trackId === 'rampa') {
      // y = 10 - x para x < 10
      xInit = 10 - altInicial;
      if (xInit < 0) xInit = 0;
      if (xInit > 10) xInit = 10;
    } else if (trackId === 'valle') {
      // y = 0.1*(x-10)^2 → x = 10 - sqrt(y/0.1)
      xInit = 10 - Math.sqrt(altInicial / 0.1);
      if (xInit < track.xMin) xInit = track.xMin;
    } else {
      // Buscar por barrido el primer x donde y(x) ≈ altInicial
      let mejorDif = Infinity;
      for (let x = track.xMin; x <= track.xMin + 6; x += 0.05) {
        const dif = Math.abs(track.y(x) - altInicial);
        if (dif < mejorDif) {
          mejorDif = dif;
          xInit = x;
        }
      }
    }

    const yInit = track.y(xInit);
    const eP = masa * g * yInit;
    const eC = 0;
    const eTotal = eP + eC;

    stateRef.current = {
      x: xInit,
      v: 0,
      energiaInicial: eTotal,
    };
    dataRef.current = {
      x: xInit,
      y: yInit,
      v: 0,
      eC,
      eP,
      eTotal,
      eInicial: eTotal,
      tiempo: 0,
      eDisipada: 0,
    };
    lastTimeRef.current = 0;
    setTick(t => t + 1);
  }, [trackId, masa, g, altInicial, track]);

  // Reset al cambiar parámetros (no al cambiar mu en mitad de simulación)
  useEffect(() => {
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, masa, g, altInicial]);

  // ============================================
  // STEP DE INTEGRACIÓN (Euler semi-implícito)
  // ============================================
  const step = useCallback((dt: number) => {
    const s = stateRef.current;
    const yp = track.yPrime(s.x);
    const sec = Math.sqrt(1 + yp * yp); // sec(theta) = ds/dx

    // Aceleración a lo largo de la curva (positiva si v crece)
    // Componente gravedad a lo largo de la curva: -g * sin(theta) = -g * yp / sec
    const aGrav = -g * yp / sec;

    // Aceleración por fricción: -mu * g * cos(theta) * sign(v) = -mu * g / sec * sign(v)
    let aFric = 0;
    if (mu > 0 && Math.abs(s.v) > 1e-4) {
      aFric = -mu * g / sec * Math.sign(s.v);
    }

    const a = aGrav + aFric;
    s.v += a * dt;

    // Si fricción muy fuerte y v bajo, parar (evita oscilación numérica)
    if (mu > 0 && Math.abs(s.v) < 1e-3 && Math.abs(yp) < 1e-3) {
      s.v = 0;
    }

    // Avanzar x: dx/dt = v_x = v / sec
    s.x += (s.v / sec) * dt;

    // Limitar a la pista
    if (s.x < track.xMin) {
      s.x = track.xMin;
      if (s.v < 0) s.v = 0;
    }
    if (s.x > track.xMax) {
      s.x = track.xMax;
      if (s.v > 0) s.v = 0;
    }

    // Datos para mostrar
    const yNow = track.y(s.x);
    const eP = masa * g * yNow;
    const eC = 0.5 * masa * s.v * s.v;
    const eMec = eP + eC;
    dataRef.current.x = s.x;
    dataRef.current.y = yNow;
    dataRef.current.v = s.v;
    dataRef.current.eC = eC;
    dataRef.current.eP = eP;
    dataRef.current.eTotal = eMec;
    dataRef.current.eInicial = s.energiaInicial;
    dataRef.current.tiempo += dt;
    dataRef.current.eDisipada = Math.max(0, s.energiaInicial - eMec);
  }, [track, g, masa, mu]);

  // ============================================
  // ANIMACIÓN
  // ============================================
  const tick = useCallback((tNow: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = tNow;
    }
    let dtTotal = (tNow - lastTimeRef.current) / 1000;
    lastTimeRef.current = tNow;

    // Limitar dt para evitar saltos
    if (dtTotal > 0.05) dtTotal = 0.05;

    // Subdividir para estabilidad
    const subSteps = 6;
    const dtSub = dtTotal / subSteps;
    for (let i = 0; i < subSteps; i++) {
      step(dtSub);
    }

    setTick(t => t + 1);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [step]);

  const play = useCallback(() => {
    if (running) return;
    setRunning(true);
    lastTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame(tick);
  }, [running, tick]);

  const pause = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setRunning(false);
  }, []);

  // Limpieza
  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // ============================================
  // DIBUJO
  // ============================================
  const dibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 24, right: 16, bottom: 24, left: 32 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#666' : '#999';
    const colorGrid = isDark ? '#333' : '#EEE';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorTrack = '#2E86AB';
    const colorBall = '#E07A1F';
    const colorVel = '#A82E68';
    const colorMaxAlt = isDark ? '#FFB347' : '#E07A1F';

    ctx.clearRect(0, 0, W, H);

    // Calcular yMaxView (todo el rango necesario para que se vea)
    let yMin = Infinity, yMax = -Infinity;
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = track.xMin + (track.xMax - track.xMin) * (i / N);
      const y = track.y(x);
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
    yMin = Math.min(yMin, 0) - 0.5;
    yMax = Math.max(yMax, dataRef.current.eInicial / (masa * g) + 0.5);

    const xToPx = (x: number) => pad.left + ((x - track.xMin) / (track.xMax - track.xMin)) * plotW;
    const yToPx = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    for (let yv = Math.floor(yMin); yv <= yMax; yv += 2) {
      ctx.beginPath();
      ctx.moveTo(pad.left, yToPx(yv));
      ctx.lineTo(pad.left + plotW, yToPx(yv));
      ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, yToPx(0));
    ctx.lineTo(pad.left + plotW, yToPx(0));
    ctx.stroke();

    // Etiquetas Y
    ctx.fillStyle = colorText;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    for (let yv = Math.floor(yMin / 2) * 2; yv <= yMax; yv += 2) {
      ctx.fillText(`${yv}`, pad.left - 4, yToPx(yv) + 4);
    }

    // Línea de altura inicial (referencia)
    const yInicial = dataRef.current.eInicial / (masa * g);
    ctx.strokeStyle = colorMaxAlt;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(pad.left, yToPx(yInicial));
    ctx.lineTo(pad.left + plotW, yToPx(yInicial));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colorMaxAlt;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`h_max = ${fmt(yInicial, 1)} m`, pad.left + 8, yToPx(yInicial) - 4);

    // Pista
    ctx.strokeStyle = colorTrack;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const xv = track.xMin + (track.xMax - track.xMin) * (i / N);
      const yv = track.y(xv);
      const px = xToPx(xv);
      const py = yToPx(yv);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Pelota
    const ballX = dataRef.current.x;
    const ballY = dataRef.current.y;
    const ballPx = xToPx(ballX);
    const ballPy = yToPx(ballY);

    // Vector velocidad: dirección tangente a la pista, longitud proporcional a |v|
    const yp = track.yPrime(ballX);
    const sec = Math.sqrt(1 + yp * yp);
    const tx = 1 / sec;
    const ty = yp / sec;
    const vDir = Math.sign(dataRef.current.v) || 0;
    const escala = 6; // px por (m/s)
    const vLen = Math.min(80, Math.abs(dataRef.current.v) * escala);

    if (vLen > 2) {
      ctx.strokeStyle = colorVel;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ballPx, ballPy - 14);
      // Vector dirigido tangente a la pista (en pixeles, y va invertida)
      const dxPx = vDir * tx * vLen;
      const dyPx = -vDir * ty * vLen; // y va al revés
      ctx.lineTo(ballPx + dxPx, ballPy - 14 + dyPx);
      ctx.stroke();

      // Punta de flecha
      ctx.fillStyle = colorVel;
      const ang = Math.atan2(dyPx, dxPx);
      const fx = ballPx + dxPx;
      const fy = ballPy - 14 + dyPx;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx - 8 * Math.cos(ang - 0.4), fy - 8 * Math.sin(ang - 0.4));
      ctx.lineTo(fx - 8 * Math.cos(ang + 0.4), fy - 8 * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fill();
    }

    // Pelota
    ctx.fillStyle = colorBall;
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballPx, ballPy - 8, 12, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Etiquetas eje X
    ctx.fillStyle = colorText;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    for (let xv = track.xMin; xv <= track.xMax; xv += 5) {
      ctx.fillText(`${xv}`, xToPx(xv), pad.top + plotH + 14);
    }
  }, [track, masa, g]);

  useEffect(() => { dibujar(); });
  useEffect(() => {
    const handleResize = () => dibujar();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujar]);
  useEffect(() => {
    const observer = new MutationObserver(dibujar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujar]);

  const data = dataRef.current;
  const eMax = Math.max(data.eInicial, 0.001);
  const pctC = Math.min(100, (data.eC / eMax) * 100);
  const pctP = Math.min(100, (data.eP / eMax) * 100);
  const pctTotal = Math.min(100, (data.eTotal / eMax) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎢 Simulador de Conservación de la Energía</h1>
        <p className={styles.subtitle}>
          Suelta una pelota por una pista y observa cómo la <strong>energía cinética y potencial se
          intercambian</strong> en tiempo real. Activa la fricción y mira la energía mecánica disiparse.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR DE PISTA */}
      <div className={styles.trackSelector}>
        {TRACK_IDS.map(id => (
          <button
            key={id}
            className={`${styles.trackBtn} ${trackId === id ? styles.trackBtnActive : ''}`}
            onClick={() => setTrackId(id)}
            aria-pressed={trackId === id}
          >
            <span className={styles.trackIcon}>{TRACKS[id].icono}</span>
            <span className={styles.trackName}>{TRACKS[id].nombre}</span>
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>
          La pelota parte del reposo desde la altura indicada (E_p máxima, E_c = 0) y se desliza por la
          pista. Sin fricción, E_c + E_p permanece constante en todo momento. Con fricción, parte de la
          energía mecánica se convierte en calor y la pelota acaba parándose.
        </p>

        {/* CONTROLES */}
        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Altura inicial (h₀ = <strong>{fmt(altInicial, 1)} m</strong>)
              </label>
              <input
                type="range"
                min={1}
                max={trackId === 'looping_suave' ? 10 : 12}
                step={0.5}
                value={altInicial}
                onChange={e => setAltInicial(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Altura inicial"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Masa (m = <strong>{fmt(masa, 1)} kg</strong>)
              </label>
              <input
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                value={masa}
                onChange={e => setMasa(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Masa"
              />
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Gravedad (g = <strong>{fmt(g, 1)} m/s²</strong>)
              </label>
              <input
                type="range"
                min={1}
                max={25}
                step={0.1}
                value={g}
                onChange={e => setG(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Gravedad"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Coef. fricción (μ = <strong>{fmt(mu, 3)}</strong>)
              </label>
              <input
                type="range"
                min={0}
                max={0.3}
                step={0.005}
                value={mu}
                onChange={e => setMu(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Coeficiente de fricción"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              onClick={running ? pause : play}
            >
              {running ? '⏸ Pausa' : '▶ Iniciar'}
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnSecondary}`}
              onClick={reset}
            >
              🔄 Reiniciar
            </button>
          </div>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Animación de la pelota deslizándose por la pista" />
        </div>

        {/* BARRAS DE ENERGÍA */}
        <div className={styles.energyBarsWrapper}>
          <div className={styles.energyBar}>
            <div className={styles.energyBarLabel}>
              <span>⚡ Cinética (E_c)</span>
              <span className={styles.energyBarValue} style={{ color: '#2E86AB' }}>{fmt(data.eC, 2)} J</span>
            </div>
            <div className={styles.energyBarTrack}>
              <div
                className={`${styles.energyBarFill} ${styles.energyBarFillCinetica}`}
                style={{ width: `${pctC}%` }}
              />
            </div>
          </div>
          <div className={styles.energyBar}>
            <div className={styles.energyBarLabel}>
              <span>🪜 Potencial (E_p)</span>
              <span className={styles.energyBarValue} style={{ color: '#48A9A6' }}>{fmt(data.eP, 2)} J</span>
            </div>
            <div className={styles.energyBarTrack}>
              <div
                className={`${styles.energyBarFill} ${styles.energyBarFillPotencial}`}
                style={{ width: `${pctP}%` }}
              />
            </div>
          </div>
          <div className={styles.energyBar}>
            <div className={styles.energyBarLabel}>
              <span>∑ Mecánica (E_c + E_p)</span>
              <span className={styles.energyBarValue} style={{ color: '#E07A1F' }}>{fmt(data.eTotal, 2)} J</span>
            </div>
            <div className={styles.energyBarTrack}>
              <div
                className={`${styles.energyBarFill} ${styles.energyBarFillTotal}`}
                style={{ width: `${pctTotal}%` }}
              />
            </div>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel}>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Posición x</span>
            <span className={styles.resultValue}>{fmt(data.x, 2)} m</span>
            <span className={styles.resultRange}>de {track.xMax} m</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Altura h</span>
            <span className={styles.resultValue}>{fmt(data.y, 2)} m</span>
            <span className={styles.resultRange}>desde el suelo</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Velocidad |v|</span>
            <span className={styles.resultValue}>{fmt(Math.abs(data.v), 2)} m/s</span>
            <span className={styles.resultRange}>{data.v > 0 ? '→ derecha' : data.v < 0 ? '← izquierda' : '— en reposo'}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Tiempo</span>
            <span className={styles.resultValue}>{fmt(data.tiempo, 2)} s</span>
            <span className={styles.resultRange}>desde inicio</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Energía inicial</span>
            <span className={styles.resultValue}>{fmt(data.eInicial, 2)} J</span>
            <span className={styles.resultRange}>m·g·h₀</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Energía disipada</span>
            <span className={styles.resultValue}>{fmt(data.eDisipada, 2)} J</span>
            <span className={styles.resultRange}>{mu === 0 ? 'sin fricción' : 'calor por fricción'}</span>
          </div>
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende sobre la conservación de la energía"
        subtitle="El principio que gobierna desde montañas rusas hasta centrales eléctricas"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es el principio de conservación de la energía mecánica?</h3>
          <p>
            La <strong>energía mecánica</strong> de un sistema es la suma de la energía cinética
            (½·m·v²) y la energía potencial gravitatoria (m·g·h). Cuando solo actúan <em>fuerzas
            conservativas</em> (gravedad, elásticas), esa suma <strong>permanece constante</strong>:
            la energía no se crea ni se destruye, solo se transforma de una forma en otra.
          </p>
          <div className={styles.formulaBox}>
            E_c + E_p = ½·m·v² + m·g·h = constante
          </div>
          <p>
            Cuando hay fricción u otras fuerzas no conservativas, la energía mecánica disminuye, pero la
            <strong> energía total</strong> (incluyendo la disipada en calor) sigue conservándose. Es el
            principio más general de la física: aplica desde una pelota rodando hasta el universo entero.
          </p>
          <ul className={styles.bulletList}>
            <li>Sin fricción: la pelota llega siempre a la misma altura desde la que partió.</li>
            <li>Con fricción: cada vuelta llega menos arriba; al final se para con E_c = E_p = 0.</li>
            <li>La masa NO afecta la altura final si no hay fricción (todas caen igual).</li>
            <li>Aumentar g aumenta la velocidad alcanzada, pero no la altura máxima posible.</li>
          </ul>
        </section>

        {/* TABLA */}
        <section>
          <h3>Velocidad alcanzada al caer desde distintas alturas (g = 9,8 m/s²)</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Altura inicial h</th>
                  <th>Velocidad final v = √(2gh)</th>
                  <th>Tiempo en caída libre</th>
                  <th>Ejemplo cotidiano</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 m</td>
                  <td>4,4 m/s ≈ 16 km/h</td>
                  <td>0,45 s</td>
                  <td>Salto desde una silla</td>
                </tr>
                <tr>
                  <td>5 m</td>
                  <td>9,9 m/s ≈ 36 km/h</td>
                  <td>1,01 s</td>
                  <td>Trampolín de piscina</td>
                </tr>
                <tr>
                  <td>10 m</td>
                  <td>14,0 m/s ≈ 50 km/h</td>
                  <td>1,43 s</td>
                  <td>3.ª planta de un edificio</td>
                </tr>
                <tr>
                  <td>20 m</td>
                  <td>19,8 m/s ≈ 71 km/h</td>
                  <td>2,02 s</td>
                  <td>Caída de un edificio bajo</td>
                </tr>
                <tr>
                  <td>50 m</td>
                  <td>31,3 m/s ≈ 113 km/h</td>
                  <td>3,19 s</td>
                  <td>Salto base desde acantilado</td>
                </tr>
                <tr>
                  <td>100 m</td>
                  <td>44,3 m/s ≈ 159 km/h</td>
                  <td>4,52 s</td>
                  <td>Velocidad terminal sin paracaídas (limitada por aire)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios donde la conservación de la energía manda</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🎢</span>
              <strong>Montañas rusas</strong>
              <p>Las jorobas posteriores siempre son más bajas que la primera: la fricción en raíles y aire impide alcanzar la misma altura. Por eso necesitan motor o cadena para subir la primera cuesta.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>⚡</span>
              <strong>Centrales hidroeléctricas</strong>
              <p>El agua almacenada en una presa tiene E_p = m·g·h. Al bajar por las turbinas, esa E_p se convierte en E_c y luego en energía eléctrica. Eficiencia ~90 %.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🪂</span>
              <strong>Caída libre y paracaídas</strong>
              <p>Sin aire, un cuerpo cayendo desde 100 m alcanza 44 m/s. Con aire, la fricción frena hasta una velocidad terminal. Un paracaídas la reduce de 200 km/h a 20 km/h disipando energía.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🎯</span>
              <strong>Péndulos</strong>
              <p>Un péndulo ideal alterna E_c (en el punto bajo) con E_p (en los extremos) infinitamente. En la práctica, la fricción del aire y el pivote lo paran. La amplitud decae exponencialmente.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre conservación de la energía</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿La masa influye en la velocidad final al caer?</h4>
              <p><strong>Sin fricción no.</strong> v = √(2gh) no depende de m. Galileo lo demostró dejando caer dos pesos distintos desde la torre de Pisa: tocan el suelo a la vez. Con resistencia del aire, sí: una pluma cae más despacio que una bala.</p>
              <p className={styles.faqTip}>💡 En el simulador, sin fricción, cambia m y verás que la velocidad en cada punto es la misma. Solo cambia la energía total (escala con m).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿La energía se &quot;pierde&quot; cuando hay fricción?</h4>
              <p><strong>No, se transforma.</strong> La energía mecánica disminuye, pero esa diferencia aparece como <em>calor</em> en la pista, en el aire y en el cuerpo deslizante. La energía total del universo se conserva siempre. La 1ª ley de la termodinámica.</p>
              <p className={styles.faqTip}>💡 Si pudieras medir la temperatura de la pelota tras pararse por fricción, estaría algunas milésimas de grado más caliente. Esa es la energía mecánica convertida.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puede la pelota llegar más alto que el punto inicial?</h4>
              <p><strong>NUNCA</strong> sin un aporte externo de energía. Por eso una montaña rusa nunca tiene una joroba más alta que la primera (a menos que un motor empuje). Aplicar &quot;movimiento perpetuo&quot; viola este principio: por eso ninguna patente de máquina perpetua ha funcionado nunca.</p>
              <p className={styles.faqTip}>💡 Si en el simulador toqueteas para que h_max sea mayor que la altura inicial, hay un error en la integración numérica (errores acumulados). El principio físico real lo prohíbe estrictamente.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué se elige h = 0 como referencia?</h4>
              <p>Es <em>arbitrario</em>: solo importan las <strong>diferencias</strong> de E_p. Puedes elegir como cero el suelo, la mesa o el techo. El movimiento de la pelota es el mismo. La conservación es relativa a la elección, pero todas las elecciones dan el mismo resultado físico.</p>
              <p className={styles.faqTip}>💡 En el simulador tomamos como cero el suelo. Si lo eligieras como el punto más alto, las E_p serían negativas, pero el principio sigue funcionando.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿La conservación se cumple también para la energía interna y química?</h4>
              <p>Sí. La <strong>1.ª ley de la termodinámica</strong> generaliza el principio: ΔU = Q − W. La energía interna de un sistema cambia por calor recibido o trabajo realizado, pero la energía total del universo es constante. Aplica a reacciones químicas, nucleares, biológicas, todo.</p>
              <p className={styles.faqTip}>💡 Solo Einstein extendió la idea con E = mc²: masa y energía son intercambiables, pero su suma sigue siendo constante.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo resolver un problema de conservación de la energía</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica las situaciones inicial y final</strong>
                <p>Marca dos &quot;fotogramas&quot;: estado inicial (con su h y v) y estado final (con sus desconocidas). Lo que conecta ambos es la conservación de energía.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Elige el nivel de referencia para E_p</strong>
                <p>Lo más cómodo: el punto más bajo. h = 0 ahí, h positivas hacia arriba. Las E_p son entonces siempre ≥ 0 y las cuentas son más limpias.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Plantea la ecuación de conservación</strong>
                <p>Si NO hay fricción: ½·m·v_i² + m·g·h_i = ½·m·v_f² + m·g·h_f. Si hay trabajo de fricción W_f: la diferencia E_inicial − E_final = W_f (energía perdida en calor).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Despeja la incógnita</strong>
                <p>La m suele cancelarse. Por ejemplo, para hallar v cayendo desde h: v = √(2g·Δh). Si quieres altura máxima desde v inicial: h = v²/(2g).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica el resultado</strong>
                <p>¿Las unidades son correctas? ¿La velocidad es positiva? ¿La energía final es ≤ la inicial (con fricción) o igual (sin)? Esos son los controles que detectan errores típicos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas con problemas de energía</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <strong>Usa energía en vez de cinemática siempre que puedas</strong>
              <p>Para problemas con curvas o trayectorias complicadas, conservación de energía es MUCHO más simple que las ecuaciones de movimiento. Ahorra páginas de cálculo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Identifica las fuerzas conservativas y no conservativas</strong>
              <p>Conservativas: gravedad, elástica, electrostática (energía potencial bien definida). No conservativas: fricción, fuerzas de arrastre, normales (no almacenables como E_p).</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🪜</span>
              <strong>Trabaja en E_c y E_p, no en velocidades y posiciones</strong>
              <p>Pasa los datos a julios desde el principio. Comparas dos números (energías inicial y final) y todo es más limpio. Las cuentas con v² son más propensas a errores de signo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Verifica con un caso extremo</strong>
              <p>Si tu fórmula final da algo absurdo cuando h = 0 o v = 0, está mal. Probar casos límite es la forma más rápida de pillar errores algebraicos.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con conservación de la energía</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Olvidar la energía cinética inicial</strong> — Si la pelota parte con v_i ≠ 0, tienes que sumarla. La fórmula completa es ½·m·v_i² + m·g·h_i = ½·m·v_f² + m·g·h_f. Saltarse el primer término es un error muy común.</li>
            <li><strong>Confundir energía con trabajo</strong> — Energía: estado del sistema (J). Trabajo: cambio de energía debido a una fuerza (J). El trabajo neto realizado por todas las fuerzas igual al cambio de E_c (teorema de las fuerzas vivas).</li>
            <li><strong>Aplicar la conservación con fricción sin tenerla en cuenta</strong> — Si hay fricción, E_c + E_p NO se conserva. La diferencia es el calor disipado. Hay que añadir un término W_f = μ·m·g·d (longitud recorrida).</li>
            <li><strong>Despreciar masa cuando importa</strong> — La m se cancela en problemas puros de altura, pero NO cuando interviene fricción (fuerza de fricción es proporcional a m). Tampoco cuando hay choques inelásticos.</li>
            <li><strong>Usar h = altura desde el punto donde está la pelota, no desde la referencia</strong> — La h de m·g·h es la diferencia de altura RESPECTO AL NIVEL DE REFERENCIA. Si lo cambias en mitad del problema, descuadra todo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-conservacion-energia')} />
      <ShareCard appName="simulador-conservacion-energia" />
      <Footer appName="simulador-conservacion-energia" />
    </div>
  );
}
