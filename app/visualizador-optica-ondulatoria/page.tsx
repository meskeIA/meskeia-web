'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './OpticaOndulatoria.module.css';
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

type TabActiva = 'interferencia' | 'difraccion' | 'polarizacion' | 'coherencia';

interface FranjaYoung {
  orden: number;
  posicion: number; // mm
  tipo: 'brillante' | 'oscura';
}

// ─────────────────────────────────────────────
// Utilidades: color del espectro visible
// ─────────────────────────────────────────────

function lambdaAColor(lambda: number): string {
  // 380-780 nm → color HSL
  if (lambda < 380 || lambda > 780) return 'hsl(0,0%,50%)';
  let h: number;
  if (lambda < 440) {
    h = 270 + (440 - lambda) / (440 - 380) * 30; // violeta
  } else if (lambda < 490) {
    h = 240 + (490 - lambda) / (490 - 440) * 30; // azul
  } else if (lambda < 510) {
    h = 180 + (510 - lambda) / (510 - 490) * 60; // cian
  } else if (lambda < 580) {
    h = 120 - (lambda - 510) / (580 - 510) * 60; // verde-amarillo
  } else if (lambda < 645) {
    h = 60 - (lambda - 580) / (645 - 580) * 60; // amarillo-naranja
  } else {
    h = 0; // rojo
  }
  const s = lambda < 420 ? 60 + (lambda - 380) / (420 - 380) * 40 : 100;
  const l = lambda < 420 ? 40 + (lambda - 380) / (420 - 380) * 20 : 50;
  return `hsl(${Math.round(h)},${Math.round(s)}%,${Math.round(l)}%)`;
}

function lambdaNombre(lambda: number): string {
  if (lambda < 420) return 'Violeta';
  if (lambda < 450) return 'Añil';
  if (lambda < 495) return 'Azul';
  if (lambda < 530) return 'Verde';
  if (lambda < 580) return 'Amarillo';
  if (lambda < 620) return 'Naranja';
  return 'Rojo';
}

// ─────────────────────────────────────────────
// Tab 1: Interferencia (Doble Rendija de Young)
// ─────────────────────────────────────────────

function TabInterferencia() {
  const [d, setD] = useState(1.0); // separación mm
  const [lambda, setLambda] = useState(550); // longitud de onda nm
  const [D, setD2] = useState(1.0); // distancia pantalla m
  const [animando, setAnimando] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  // Calcular franjas: y_n = n * lambda_m * D / d_m
  const franjas: FranjaYoung[] = useMemo(() => {
    const lambdaM = lambda * 1e-9;
    const dM = d * 1e-3;
    const result: FranjaYoung[] = [];
    for (let n = -4; n <= 4; n++) {
      const pos = (n * lambdaM * D) / dM * 1000; // en mm
      result.push({ orden: n, posicion: pos, tipo: 'brillante' });
    }
    for (let n = -4; n <= 3; n++) {
      const pos = ((n + 0.5) * lambdaM * D) / dM * 1000;
      result.push({ orden: n, posicion: pos, tipo: 'oscura' });
    }
    return result.sort((a, b) => a.posicion - b.posicion);
  }, [d, lambda, D]);

  const color = lambdaAColor(lambda);
  const nombreColor = lambdaNombre(lambda);
  const anchoFranja = useMemo(() => {
    const lambdaM = lambda * 1e-9;
    const dM = d * 1e-3;
    return (lambdaM * D / dM * 1000).toFixed(2);
  }, [d, lambda, D]);

  // Animación canvas ondas circulares
  const dibujarOndas = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const y1 = H / 2 - 30;
    const y2 = H / 2 + 30;
    const x0 = 60;
    const maxR = W;
    const vel = 80;
    const nOndas = 6;

    ctx.lineWidth = 1.2;
    for (let src = 0; src < 2; src++) {
      const ySrc = src === 0 ? y1 : y2;
      for (let k = 0; k < nOndas; k++) {
        const r = ((t * vel + k * (W / nOndas)) % maxR);
        const alpha = Math.max(0, 1 - r / maxR);
        ctx.strokeStyle = color.replace('hsl', 'hsla').replace(')', `,${alpha})`);
        ctx.beginPath();
        ctx.arc(x0, ySrc, r, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
    }

    // Rendijas
    ctx.fillStyle = '#555';
    ctx.fillRect(x0 - 4, 0, 8, H / 2 - 35);
    ctx.fillRect(x0 - 4, H / 2 - 25, 8, 50);
    ctx.fillRect(x0 - 4, H / 2 + 35, 8, H);
  }, [color]);

  useEffect(() => {
    if (!animando) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      cancelAnimationFrame(rafRef.current);
      return;
    }
    let start: number | null = null;
    const loop = (ts: number) => {
      if (!start) start = ts;
      tRef.current = (ts - start) / 1000;
      dibujarOndas(tRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animando, dibujarOndas]);

  // SVG del patrón de franjas
  const SVG_W = 340;
  const SVG_H = 280;
  const pantallasX = SVG_W - 10;

  const franjasBrillantes = franjas.filter(f => f.tipo === 'brillante');
  const maxPos = Math.max(...franjasBrillantes.map(f => Math.abs(f.posicion)), 1);
  const escala = (SVG_H / 2 - 20) / maxPos;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>🌈 Doble rendija de Young</h2>
      <p className={styles.seccionDesc}>
        El experimento fundamental que demostró la naturaleza ondulatoria de la luz (1801). Dos rendijas paralelas crean franjas alternantes de luz y oscuridad.
      </p>

      <div className={styles.slidersGrid}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Separación rendijas <em>d</em>
            <span className={styles.sliderValor}>{d.toFixed(1)} mm</span>
          </label>
          <input
            type="range" min={0.1} max={2} step={0.1} value={d}
            onChange={e => setD(Number(e.target.value))}
            className={styles.sliderInput}
            aria-label="Separación entre rendijas en milímetros"
            style={{ '--pct': `${((d - 0.1) / 1.9) * 100}%` } as React.CSSProperties}
          />
          <span className={styles.sliderDesc}>Mayor d → franjas más juntas</span>
        </div>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Longitud de onda <em>λ</em>
            <span className={styles.sliderValor} style={{ color }}>{lambda} nm ({nombreColor})</span>
          </label>
          <input
            type="range" min={380} max={780} step={10} value={lambda}
            onChange={e => setLambda(Number(e.target.value))}
            className={styles.sliderInputEspectro}
            aria-label="Longitud de onda en nanómetros"
          />
          <span className={styles.sliderDesc}>380 nm = violeta · 780 nm = rojo</span>
        </div>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Distancia pantalla <em>D</em>
            <span className={styles.sliderValor}>{D.toFixed(1)} m</span>
          </label>
          <input
            type="range" min={0.5} max={2} step={0.1} value={D}
            onChange={e => setD2(Number(e.target.value))}
            className={styles.sliderInput}
            aria-label="Distancia a la pantalla en metros"
            style={{ '--pct': `${((D - 0.5) / 1.5) * 100}%` } as React.CSSProperties}
          />
          <span className={styles.sliderDesc}>Mayor D → franjas más separadas</span>
        </div>
        <div className={styles.infoBox}>
          <div className={styles.infoFila}>
            <span>Ancho de franja (Δy):</span>
            <strong>{anchoFranja} mm</strong>
          </div>
          <div className={styles.infoFila}>
            <span>Fórmula:</span>
            <code>Δy = λD/d</code>
          </div>
          <div className={styles.infoFila}>
            <span>Franja central:</span>
            <strong style={{ color: '#27ae60' }}>Siempre brillante</strong>
          </div>
        </div>
      </div>

      <div className={styles.svgFlex}>
        {/* Patrón de franjas SVG */}
        <div className={styles.svgZona}>
          <p className={styles.svgLabel}>Patrón de interferencia en pantalla</p>
          <svg width={SVG_W} height={SVG_H} aria-label="Patrón de franjas de interferencia">
            <rect width={SVG_W} height={SVG_H} fill="#111" rx="6" />
            {franjasBrillantes.map((f) => {
              const yCenter = SVG_H / 2 - f.posicion * escala;
              const halfW = Math.max(2, 12 - Math.abs(f.orden) * 1.5);
              const opacidad = Math.max(0.15, 1 - Math.abs(f.orden) * 0.18);
              return (
                <rect
                  key={`b-${f.orden}`}
                  x={0} y={yCenter - halfW}
                  width={pantallasX} height={halfW * 2}
                  fill={color}
                  opacity={opacidad}
                />
              );
            })}
            {/* Etiqueta franja central */}
            <text x={pantallasX - 5} y={SVG_H / 2 + 4} fill="white" fontSize="10" textAnchor="end">n=0</text>
          </svg>
        </div>

        {/* Animación canvas */}
        <div className={styles.svgZona}>
          <p className={styles.svgLabel}>Ondas circulares desde las rendijas</p>
          <canvas
            ref={canvasRef}
            width={340} height={SVG_H}
            className={styles.canvas}
            aria-label="Animación de ondas circulares expandiéndose desde las rendijas"
          />
          <button
            className={animando ? styles.btnSecundario : styles.btnPrimario}
            onClick={() => setAnimando(v => !v)}
            aria-label={animando ? 'Pausar animación de ondas' : 'Iniciar animación de ondas'}
          >
            {animando ? '⏸ Pausar animación' : '▶ Animar ondas'}
          </button>
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>¿Por qué la franja central es siempre brillante?</strong>
        <p>Un punto en el centro de la pantalla está exactamente a la misma distancia de ambas rendijas. Las dos ondas recorren el mismo camino → llegan en fase → se suman (interferencia constructiva). La diferencia de camino ΔL = 0 siempre.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Difracción
// ─────────────────────────────────────────────

function TabDifraccion() {
  const [a, setA] = useState(0.5); // apertura mm
  const [lambda, setLambda] = useState(550); // nm

  const color = lambdaAColor(lambda);
  const nombreColor = lambdaNombre(lambda);

  // Patrón sinc²: I(θ) = sinc²(π·a·sinθ/λ)
  const puntos = useMemo(() => {
    const lambdaM = lambda * 1e-9;
    const aM = a * 1e-3;
    const result: { theta: number; I: number }[] = [];
    const nPuntos = 300;
    const thetaMax = 0.015; // radianes
    for (let i = 0; i <= nPuntos; i++) {
      const theta = -thetaMax + (2 * thetaMax * i) / nPuntos;
      const arg = (Math.PI * aM * Math.sin(theta)) / lambdaM;
      const I = arg === 0 ? 1 : Math.pow(Math.sin(arg) / arg, 2);
      result.push({ theta, I });
    }
    return result;
  }, [a, lambda]);

  const SVG_W = 500;
  const SVG_H = 220;
  const padX = 40;
  const padY = 20;
  const plotW = SVG_W - padX * 2;
  const plotH = SVG_H - padY * 2;

  const pathD = puntos.map((p, i) => {
    const x = padX + (i / (puntos.length - 1)) * plotW;
    const y = padY + plotH - p.I * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const ratio = a * 1e-3 / (lambda * 1e-9);
  let regimen: string;
  if (ratio > 500) regimen = 'óptica geométrica (sin difracción visible)';
  else if (ratio > 50) regimen = 'difracción débil';
  else if (ratio > 5) regimen = 'difracción moderada';
  else regimen = 'difracción intensa (máxima expansión)';

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>〰 Difracción en rendija simple</h2>
      <p className={styles.seccionDesc}>
        Cuando la luz pasa por una rendija estrecha, se dobla y crea un patrón de intensidad. La clave: si la apertura <em>a</em> es comparable a <em>λ</em>, la difracción es máxima.
      </p>

      <div className={styles.slidersGrid}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Apertura <em>a</em>
            <span className={styles.sliderValor}>{a.toFixed(1)} mm</span>
          </label>
          <input
            type="range" min={0.1} max={2} step={0.1} value={a}
            onChange={e => setA(Number(e.target.value))}
            className={styles.sliderInput}
            aria-label="Anchura de la rendija en milímetros"
            style={{ '--pct': `${((a - 0.1) / 1.9) * 100}%` } as React.CSSProperties}
          />
          <span className={styles.sliderDesc}>Menor apertura → mayor difracción</span>
        </div>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Longitud de onda <em>λ</em>
            <span className={styles.sliderValor} style={{ color }}>{lambda} nm ({nombreColor})</span>
          </label>
          <input
            type="range" min={380} max={780} step={10} value={lambda}
            onChange={e => setLambda(Number(e.target.value))}
            className={styles.sliderInputEspectro}
            aria-label="Longitud de onda en nanómetros"
          />
        </div>
      </div>

      <div className={styles.infoBox} style={{ marginBottom: '1rem' }}>
        <div className={styles.infoFila}>
          <span>Relación a/λ:</span>
          <strong>{ratio.toFixed(0)}</strong>
        </div>
        <div className={styles.infoFila}>
          <span>Régimen:</span>
          <strong>{regimen}</strong>
        </div>
        <div className={styles.infoFila}>
          <span>1.er mínimo a:</span>
          <strong>θ = ±{(Math.asin(lambda * 1e-9 / (a * 1e-3)) * 180 / Math.PI).toFixed(2)}°</strong>
        </div>
      </div>

      <div className={styles.svgZona}>
        <p className={styles.svgLabel}>Patrón de intensidad I(θ) ∝ sinc²(πa·sinθ/λ)</p>
        <svg width={SVG_W} height={SVG_H} style={{ width: '100%', maxWidth: SVG_W }} aria-label="Patrón de intensidad de difracción">
          <rect width={SVG_W} height={SVG_H} fill="var(--bg-card, #fff)" />
          {/* Ejes */}
          <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="var(--border, #ddd)" strokeWidth="1" />
          <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="var(--border, #ddd)" strokeWidth="1" />
          {/* Etiquetas eje */}
          <text x={padX - 5} y={padY + 4} fill="var(--text-muted,#999)" fontSize="10" textAnchor="end">1.0</text>
          <text x={padX - 5} y={padY + plotH / 2 + 4} fill="var(--text-muted,#999)" fontSize="10" textAnchor="end">0.5</text>
          <text x={padX + plotW / 2} y={SVG_H - 4} fill="var(--text-muted,#999)" fontSize="10" textAnchor="middle">ángulo θ (centro)</text>
          <text x={padX} y={SVG_H - 4} fill="var(--text-muted,#999)" fontSize="10" textAnchor="middle">−</text>
          <text x={padX + plotW} y={SVG_H - 4} fill="var(--text-muted,#999)" fontSize="10" textAnchor="middle">+</text>
          {/* Curva */}
          <path d={pathD} stroke={color} strokeWidth="2.5" fill="none" />
          {/* Relleno bajo la curva */}
          <path d={`${pathD} L ${padX + plotW} ${padY + plotH} L ${padX} ${padY + plotH} Z`}
            fill={color} opacity="0.15" />
        </svg>
      </div>

      <div className={styles.ejemploBox}>
        <strong>Ejemplo: CD como red de difracción</strong>
        <p>Un CD tiene surcos separados 1.6 μm. Con luz blanca, cada color difracta a un ángulo distinto: rojo (700 nm) a ~26°, verde (550 nm) a ~20°, violeta (400 nm) a ~14.5°. Por eso ves el arcoíris al reflejar luz en un CD.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Polarización
// ─────────────────────────────────────────────

function TabPolarizacion() {
  const [angulo, setAngulo] = useState(45); // grados analizador
  const [filtroLambda4, setFiltroLambda4] = useState(false);

  const cos2 = Math.pow(Math.cos((angulo * Math.PI) / 180), 2);
  const intensidad = filtroLambda4 ? 0.5 : cos2; // λ/4 lineariza a 50%
  const pct = Math.round(intensidad * 100);

  // Curva cos²
  const SVG_W = 360;
  const SVG_H = 160;
  const padX = 30;
  const padY = 15;
  const plotW = SVG_W - padX * 2;
  const plotH = SVG_H - padY * 2;

  const curvaCos2 = Array.from({ length: 361 }, (_, i) => {
    const th = (i * Math.PI) / 180;
    const I = Math.pow(Math.cos(th), 2);
    const x = padX + (i / 360) * plotW;
    const y = padY + plotH - I * plotH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const puntoCurvaX = padX + (angulo / 360) * plotW;
  const puntoCurvaY = padY + plotH - cos2 * plotH;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>🕶 Polarización de la luz</h2>
      <p className={styles.seccionDesc}>
        La luz natural vibra en todas las direcciones. Un polarizador selecciona una sola dirección de vibración. La intensidad transmitida sigue la <strong>Ley de Malus</strong>: I = I₀·cos²(θ).
      </p>

      <div className={styles.polarizacionLayout}>
        {/* Diagrama visual polarización */}
        <div className={styles.svgZona}>
          <p className={styles.svgLabel}>Onda polarizada y analizador</p>
          <svg width={340} height={200} aria-label="Diagrama de polarización de la luz">
            <rect width={340} height={200} fill="var(--bg-card,#fff)" rx="8" />

            {/* Fuente de luz */}
            <circle cx={30} cy={100} r={16} fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
            <text x={30} y={105} textAnchor="middle" fontSize="12" fill="#333">☀</text>
            <text x={30} y={125} textAnchor="middle" fontSize="8" fill="var(--text-muted,#999)">Luz</text>

            {/* Ondas no polarizadas */}
            {[-20, -10, 0, 10, 20].map((dy, i) => (
              <line key={i} x1={50} y1={100 + dy} x2={90} y2={100 - dy} stroke="#aaa" strokeWidth="1" opacity="0.6" />
            ))}

            {/* Polarizador */}
            <rect x={95} y={65} width={12} height={70} fill="#2E86AB" rx="2" />
            {[0, 10, 20, 30, 40, 50, 60].map((dy, i) => (
              <line key={i} x1={96} y1={70 + dy} x2={106} y2={70 + dy} stroke="white" strokeWidth="1.5" />
            ))}
            <text x={101} y={145} textAnchor="middle" fontSize="8" fill="var(--text-muted,#999)">Polarizador</text>
            <text x={101} y={155} textAnchor="middle" fontSize="7" fill="var(--text-muted,#999)">0°</text>

            {/* Onda polarizada vertical */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = 115 + i * 15;
              const dy = Math.sin((i / 7) * Math.PI * 2) * 18;
              return (
                <line key={i} x1={x} y1={100} x2={x} y2={100 + dy} stroke="#2E86AB" strokeWidth="2" />
              );
            })}

            {/* Analizador girado θ */}
            <g transform={`rotate(${angulo}, 230, 100)`}>
              <rect x={224} y={65} width={12} height={70} fill="#48A9A6" rx="2" />
              {[0, 10, 20, 30, 40, 50, 60].map((dy, i) => (
                <line key={i} x1={225} y1={70 + dy} x2={235} y2={70 + dy} stroke="white" strokeWidth="1.5" />
              ))}
            </g>
            <text x={230} y={145} textAnchor="middle" fontSize="8" fill="var(--text-muted,#999)">Analizador</text>
            <text x={230} y={155} textAnchor="middle" fontSize="7" fill="var(--text-muted,#999)">{angulo}°</text>

            {/* Luz transmitida */}
            {intensidad > 0.05 && Array.from({ length: 5 }, (_, i) => {
              const x = 250 + i * 14;
              const dy = Math.sin((i / 4) * Math.PI * 2) * 18 * Math.sqrt(intensidad);
              return (
                <line key={i} x1={x} y1={100} x2={x} y2={100 + dy}
                  stroke="#48A9A6" strokeWidth={1 + intensidad * 2} opacity={intensidad} />
              );
            })}

            {/* Pantalla */}
            <rect x={320} y={65} width={8} height={70}
              fill={`rgba(72,169,166,${intensidad.toFixed(2)})`} rx="2" />
            <text x={324} y={145} textAnchor="middle" fontSize="8" fill="var(--text-muted,#999)">Pantalla</text>
          </svg>
        </div>

        <div className={styles.polarizacionControles}>
          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel}>
              Ángulo analizador <em>θ</em>
              <span className={styles.sliderValor}>{angulo}°</span>
            </label>
            <input
              type="range" min={0} max={360} step={5} value={angulo}
              onChange={e => setAngulo(Number(e.target.value))}
              className={styles.sliderInput}
              aria-label="Ángulo del analizador en grados"
              style={{ '--pct': `${(angulo / 360) * 100}%` } as React.CSSProperties}
            />
          </div>

          <div className={styles.infoBox}>
            <div className={styles.infoFila}>
              <span>I = I₀·cos²({angulo}°) =</span>
              <strong style={{ color: intensidad > 0.5 ? '#27ae60' : intensidad > 0.2 ? '#f39c12' : '#e74c3c' }}>
                {pct}% I₀
              </strong>
            </div>
            {angulo === 0 && <p className={styles.sliderDesc}>Polarizadores paralelos → máxima transmisión</p>}
            {angulo === 90 && <p className={styles.sliderDesc}>Polarizadores cruzados → extinción total</p>}
            {angulo === 45 && <p className={styles.sliderDesc}>45° → se transmite el 50% de la intensidad</p>}
          </div>

          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={filtroLambda4}
              onChange={e => setFiltroLambda4(e.target.checked)}
              aria-label="Activar filtro de cuarto de onda"
            />
            <span>Filtro λ/4 (retardador)</span>
          </label>
          {filtroLambda4 && (
            <p className={styles.sliderDesc}>El filtro λ/4 convierte luz lineal en circular → transmite el 50% independientemente del ángulo del analizador.</p>
          )}

          <div className={styles.aplicacionesBox}>
            <strong>Aplicaciones</strong>
            <ul>
              <li>Gafas de sol polarizadas → reducen reflejos de superficies horizontales</li>
              <li>Pantallas LCD → polarizadores cruzados controlan cada píxel</li>
              <li>Fotografía → filtro polarizador elimina reflejos</li>
              <li>Microscopía → luz polarizada revela estructura cristalina</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Gráfica cos² */}
      <div className={styles.svgZona} style={{ marginTop: '1rem' }}>
        <p className={styles.svgLabel}>Intensidad transmitida vs ángulo — Ley de Malus: I = I₀·cos²(θ)</p>
        <svg width={SVG_W} height={SVG_H} style={{ width: '100%', maxWidth: SVG_W }} aria-label="Gráfica de ley de Malus">
          <rect width={SVG_W} height={SVG_H} fill="var(--bg-card,#fff)" />
          <path d={curvaCos2} stroke="#2E86AB" strokeWidth="2" fill="none" />
          <path d={`${curvaCos2} L ${padX + plotW} ${padY + plotH} L ${padX} ${padY + plotH} Z`}
            fill="#2E86AB" opacity="0.1" />
          {/* Punto actual */}
          <circle cx={puntoCurvaX} cy={puntoCurvaY} r={6} fill="#48A9A6" stroke="white" strokeWidth="2" />
          {/* Eje x etiquetas */}
          {[0, 90, 180, 270, 360].map(deg => (
            <text key={deg} x={padX + (deg / 360) * plotW} y={SVG_H - 3}
              textAnchor="middle" fontSize="9" fill="var(--text-muted,#999)">{deg}°</text>
          ))}
          <text x={padX - 5} y={padY + 4} textAnchor="end" fontSize="9" fill="var(--text-muted,#999)">1.0</text>
          <text x={padX - 5} y={padY + plotH + 4} textAnchor="end" fontSize="9" fill="var(--text-muted,#999)">0</text>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Coherencia y Luz Láser
// ─────────────────────────────────────────────

function TabCoherencia() {
  const [longitudCoh, setLongitudCoh] = useState(500); // mm

  interface FuenteLuz {
    nombre: string;
    emoji: string;
    longCoh: number;
    unidad: string;
    monocromatica: boolean;
    colimada: boolean;
    coherente: boolean;
    descripcion: string;
    aplicaciones: string;
  }

  const fuentes: FuenteLuz[] = [
    { nombre: 'Bombilla incandescente', emoji: '💡', longCoh: 0.001, unidad: 'μm', monocromatica: false, colimada: false, coherente: false, descripcion: 'Emisión térmica caótica, todas las fases y longitudes de onda', aplicaciones: 'Iluminación general' },
    { nombre: 'LED blanco', emoji: '🔆', longCoh: 0.01, unidad: 'μm', monocromatica: false, colimada: false, coherente: false, descripcion: 'Electroluminiscencia, espectro ancho, semicoherente', aplicaciones: 'Iluminación eficiente, pantallas' },
    { nombre: 'Lámpara espectral (Na)', emoji: '🟡', longCoh: 0.6, unidad: 'mm', monocromatica: true, colimada: false, coherente: false, descripcion: 'Espectro discreto de sodio, buena monocromaticidad', aplicaciones: 'Espectroscopía, alumbrado' },
    { nombre: 'Diodo láser', emoji: '🔴', longCoh: 100, unidad: 'mm', monocromatica: true, colimada: true, coherente: true, descripcion: 'Alta coherencia temporal, haz colimado, modo único', aplicaciones: 'Lectores CD/DVD/Blu-ray, punteros' },
    { nombre: 'Láser He-Ne estabilizado', emoji: '🟢', longCoh: 300000, unidad: 'm', monocromatica: true, colimada: true, coherente: true, descripcion: 'Coherencia extrema, modo longitudinal único, referencia metrológica', aplicaciones: 'Interferometría, holografía, LIGO' },
  ];

  const fuenteActiva = useMemo(() => {
    if (longitudCoh < 0.1) return fuentes[0];
    if (longitudCoh < 1) return fuentes[1];
    if (longitudCoh < 10) return fuentes[2];
    if (longitudCoh < 1000) return fuentes[3];
    return fuentes[4];
  }, [longitudCoh]);

  // SVG comparativa incoherente vs coherente
  const SVG_W = 320;
  const SVG_H = 120;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>💡 Coherencia y luz láser</h2>
      <p className={styles.seccionDesc}>
        La <strong>coherencia</strong> mide hasta qué distancia las ondas mantienen una relación de fase definida. El láser es la fuente de luz más coherente que existe.
      </p>

      <div className={styles.slidersGrid}>
        <div className={styles.sliderGroup} style={{ gridColumn: '1 / -1' }}>
          <label className={styles.sliderLabel}>
            Longitud de coherencia
            <span className={styles.sliderValor}>{longitudCoh < 1 ? `${(longitudCoh * 1000).toFixed(0)} μm` : longitudCoh < 1000 ? `${longitudCoh.toFixed(0)} mm` : `${(longitudCoh / 1000).toFixed(0)} m`}</span>
          </label>
          <input
            type="range" min={0.001} max={300000} step={1} value={longitudCoh}
            onChange={e => setLongitudCoh(Number(e.target.value))}
            className={styles.sliderInput}
            aria-label="Longitud de coherencia de la fuente de luz"
            style={{ '--pct': `${(Math.log10(longitudCoh + 0.001) / Math.log10(300001)) * 100}%` } as React.CSSProperties}
          />
          <span className={styles.sliderDesc}>Desliza para explorar distintas fuentes de luz</span>
        </div>
      </div>

      <div className={styles.fuenteCard}>
        <div className={styles.fuenteHeader}>
          <span className={styles.fuenteEmoji} aria-hidden="true">{fuenteActiva.emoji}</span>
          <div>
            <strong className={styles.fuenteNombre}>{fuenteActiva.nombre}</strong>
            <p className={styles.fuenteDesc}>{fuenteActiva.descripcion}</p>
          </div>
        </div>
        <div className={styles.propiedadesGrid}>
          <div className={`${styles.propTag} ${fuenteActiva.monocromatica ? styles.propSi : styles.propNo}`}>
            {fuenteActiva.monocromatica ? '✔' : '✘'} Monocromática
          </div>
          <div className={`${styles.propTag} ${fuenteActiva.colimada ? styles.propSi : styles.propNo}`}>
            {fuenteActiva.colimada ? '✔' : '✘'} Colimada
          </div>
          <div className={`${styles.propTag} ${fuenteActiva.coherente ? styles.propSi : styles.propNo}`}>
            {fuenteActiva.coherente ? '✔' : '✘'} Coherente
          </div>
        </div>
        <p className={styles.fuenteAplicaciones}><strong>Aplicaciones:</strong> {fuenteActiva.aplicaciones}</p>
      </div>

      {/* SVG comparativa visual */}
      <div className={styles.svgFlex} style={{ marginTop: '1rem' }}>
        <div className={styles.svgZona}>
          <p className={styles.svgLabel}>Luz incoherente (bombilla)</p>
          <svg width={SVG_W} height={SVG_H} aria-label="Ondas de luz incoherente">
            <rect width={SVG_W} height={SVG_H} fill="#1a1a2e" rx="6" />
            {[0, 1, 2, 3, 4].map(i => {
              const y = 20 + i * 20;
              const amp = 8 + (i % 3) * 4;
              const freq = 0.03 + (i % 4) * 0.01;
              const phase = i * 1.3;
              const pts = Array.from({ length: SVG_W }, (_, x) =>
                `${x},${y + amp * Math.sin(freq * x + phase)}`
              ).join(' ');
              const colors = ['#e74c3c', '#f39c12', '#27ae60', '#2E86AB', '#9b59b6'];
              return <polyline key={i} points={pts} fill="none" stroke={colors[i]} strokeWidth="1.5" opacity="0.8" />;
            })}
          </svg>
        </div>
        <div className={styles.svgZona}>
          <p className={styles.svgLabel}>Luz coherente (láser)</p>
          <svg width={SVG_W} height={SVG_H} aria-label="Ondas de luz coherente láser">
            <rect width={SVG_W} height={SVG_H} fill="#1a1a2e" rx="6" />
            {[0, 1, 2, 3, 4].map(i => {
              const y = 20 + i * 20;
              const amp = 8;
              const freq = 0.04;
              const pts = Array.from({ length: SVG_W }, (_, x) =>
                `${x},${y + amp * Math.sin(freq * x)}`
              ).join(' ');
              return <polyline key={i} points={pts} fill="none" stroke="#48A9A6" strokeWidth="1.5" opacity="0.9" />;
            })}
            {/* Haz colimado */}
            <line x1={0} y1={50} x2={SVG_W} y2={50} stroke="rgba(72,169,166,0.3)" strokeWidth="18" />
          </svg>
        </div>
      </div>

      <div className={styles.aplicacionesBox}>
        <strong>Aplicaciones de la coherencia</strong>
        <ul>
          <li><strong>Holografía:</strong> requiere coherencia para crear el patrón de interferencia 3D</li>
          <li><strong>Interferometría:</strong> LIGO detecta ondas gravitacionales con láseres de km de coherencia</li>
          <li><strong>Comunicaciones ópticas:</strong> fibra óptica usa láseres IR coherentes</li>
          <li><strong>Cirugía LASIK:</strong> láser excimer remodela la córnea con precisión nanométrica</li>
          <li><strong>Espectroscopía LIDAR:</strong> medición de distancias atmosféricas por tiempo de vuelo</li>
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function OpticaOndulatoria() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('interferencia');

  const tabs: { id: TabActiva; emoji: string; label: string }[] = [
    { id: 'interferencia', emoji: '〰', label: 'Interferencia (Young)' },
    { id: 'difraccion', emoji: '📡', label: 'Difracción' },
    { id: 'polarizacion', emoji: '🕶', label: 'Polarización' },
    { id: 'coherencia', emoji: '💡', label: 'Coherencia Láser' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🌊 Óptica Ondulatoria</h1>
        <p className={styles.heroSubtitle}>
          La naturaleza ondulatoria de la luz: interferencia, difracción, polarización y coherencia. Simulaciones interactivas con física real.
        </p>
      </header>

      <LegalNotice />

      <nav className={styles.tabNav} aria-label="Secciones de óptica ondulatoria">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-current={tabActiva === tab.id ? 'page' : undefined}
          >
            <span className={styles.tabIcon} aria-hidden="true">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <main>
        {tabActiva === 'interferencia' && <TabInterferencia />}
        {tabActiva === 'difraccion' && <TabDifraccion />}
        {tabActiva === 'polarizacion' && <TabPolarizacion />}
        {tabActiva === 'coherencia' && <TabCoherencia />}
      </main>

      <EducationalSection title="La naturaleza ondulatoria de la luz" subtitle="Interferencia, difracción y polarización: la luz es una onda electromagnética">
        <h3>Comparativa de Fenómenos Ondulatorios</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Fenómeno</th>
                <th>Condición necesaria</th>
                <th>Efecto observable</th>
                <th>Aplicación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Interferencia (Young)</td>
                <td>Fuentes coherentes, misma λ</td>
                <td>Franjas brillantes y oscuras alternas</td>
                <td>Interferómetros, holografía</td>
              </tr>
              <tr>
                <td>Difracción</td>
                <td>Abertura comparable a λ</td>
                <td>Ensanchamiento y anillos de Airy</td>
                <td>Límite de resolución óptica</td>
              </tr>
              <tr>
                <td>Polarización</td>
                <td>Onda transversal (EM)</td>
                <td>Extinción al 90° (ley de Malus)</td>
                <td>Gafas polarizadas, LCD, 3D</td>
              </tr>
              <tr>
                <td>Coherencia</td>
                <td>Fuente monocromática estable</td>
                <td>Visibilidad de franjas</td>
                <td>Láseres, OCT médico</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>🔬 Investigador de Óptica</h4>
            <p>Mide la longitud de onda de una fuente desconocida con el experimento de doble rendija: conociendo la separación y la distancia a la pantalla, d·sin θ = mλ da λ con precisión nanométrica.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>📷 Fotógrafo y Videógrafo</h4>
            <p>Usa filtros polarizadores para eliminar reflejos en agua y cristal. La ley de Malus explica que girando el filtro 90° respecto a la reflexión se logra extinción total del reflejo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🔭 Diseñador de Instrumentos Ópticos</h4>
            <p>El criterio de Rayleigh (basado en difracción) fija el límite de resolución de telescopios y microscopios. Reducir λ (UV, rayos X) o aumentar la apertura mejora la resolución.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>🏥 Médico con Tomografía OCT</h4>
            <p>La tomografía de coherencia óptica usa la longitud de coherencia del láser para obtener imágenes de retina con resolución de micras, sin contacto. La coherencia temporal define la profundidad de imagen.</p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué demostró Young en 1801?</strong>
            <p>Que la luz tiene naturaleza ondulatoria: al pasar por dos rendijas crea franjas de interferencia, imposibles si la luz fuera solo corpuscular. Fue el experimento que confirmó la teoría ondulatoria de Huygens-Fresnel.</p>
            <div className={styles.faqTip}>💡 La posición de la franja brillante n es: y_n = nλD/d, donde D es la distancia a la pantalla y d la separación entre rendijas.</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué la difracción ocurre en bordes y aberturas?</strong>
            <p>Según el principio de Huygens, cada punto del frente de onda genera ondas secundarias esféricas. En el borde de una abertura, estas ondas no se cancelan completamente: parte de la luz se dobla hacia la zona de «sombra geométrica».</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo funcionan exactamente las gafas de sol polarizadas?</strong>
            <p>La luz reflejada por superficies horizontales (agua, asfalto, capós) queda parcialmente polarizada horizontalmente. Un filtro polarizador con eje vertical bloquea esta componente, reduciendo el deslumbramiento sin oscurecer toda la escena.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre coherencia temporal y espacial?</strong>
            <p>La coherencia temporal describe cuánto tiempo mantiene una fuente una fase predecible (relacionada con el ancho espectral). La coherencia espacial describe si puntos separados del frente de onda tienen una relación de fase fija. Los láseres tienen ambas; las bombillas casi ninguna.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿El color de la luz cambia cuando se difracta?</strong>
            <p>No: la difracción no cambia la longitud de onda. Sí cambia la dirección del frente de onda. Lo que llamamos «colores de difracción» (CDs, mariposas) es que cada longitud de onda se difracta en ángulo diferente, separando el espectro espacialmente.</p>
          </div>
        </div>

        <h3>Guía de Uso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Elige el fenómeno</h4>
              <p>Selecciona entre las 4 pestañas: Young (interferencia), Difracción, Polarización o Coherencia. Cada una ilustra un aspecto diferente de la naturaleza ondulatoria de la luz.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Selecciona la longitud de onda</h4>
              <p>En Young y Difracción, cambia λ para ver cómo afecta al patrón: mayor λ (rojo) produce franjas más separadas; menor λ (violeta) produce franjas más juntas y mayor resolución.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Ajusta la geometría</h4>
              <p>Modifica la separación entre rendijas o el tamaño de la abertura. Observa cómo el patrón cambia: rendijas más juntas producen franjas más separadas.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>En polarización: gira el analizador</h4>
              <p>Arrastra el slider del ángulo del analizador de 0° a 180°. A 90° obtienes extinción total: la intensidad sigue I = I₀·cos²θ (ley de Malus).</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Conecta con la coherencia</h4>
              <p>En la pestaña de coherencia, observa cómo la visibilidad de franjas depende de la longitud de coherencia de la fuente. Un láser monocromático produce franjas perfectas; luz blanca casi no produce patrón.</p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🌈</span>
            <div>
              <strong>λ determina el color</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Visible: 380 nm (violeta) a 700 nm (rojo). UV (&lt;380 nm) mejora resolución. IR (&gt;700 nm) aumenta difracción. La longitud de onda es la huella dactilar de la luz.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📏</span>
            <div>
              <strong>Distancia amplifica el patrón</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>En Young, las franjas son más visibles cuanto mayor es la distancia D a la pantalla. En laboratorio, D = 1-2 m es suficiente para medir λ con regla.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔲</span>
            <div>
              <strong>Filtros polarizadores en serie</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Dos filtros a 90° extinguen la luz totalmente. Pero insertar un tercero entre ellos a 45° «reabre» el paso: la luz rota su polarización en cada filtro (paradoja de la polarización).</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <div>
              <strong>Coherencia = calidad del interferómetro</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>Un láser HeNe (λ = 632,8 nm, Δλ muy pequeño) tiene longitud de coherencia de kilómetros. Una bombilla de tungsteno tiene longitud de coherencia de micras.</p>
            </div>
          </div>
        </div>

        <div className={styles.eduWarningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores Conceptuales Frecuentes
          </div>
          <ul className={styles.warningList}>
            <li><strong>Difracción ≠ refracción</strong> — La refracción cambia la velocidad y dirección de la luz al cambiar de medio. La difracción curva la luz en bordes sin cambiar de medio. Son fenómenos distintos.</li>
            <li><strong>Las franjas de Young no son sombras geométricas</strong> — Las zonas oscuras ocurren donde las ondas se cancelan por interferencia destructiva (diferencia de fase π). No son zonas sin luz por oclusión.</li>
            <li><strong>La ley de Malus asume polarización perfecta</strong> — I = I₀·cos²θ aplica a luz 100% polarizada linealmente. La luz solar refleja parcialmente polarizada; el factor real es menor.</li>
            <li><strong>Mayor apertura no siempre da mejor imagen</strong> — En óptica, aberraciones como la esférica y la cromática aumentan con la apertura. El límite de difracción es teórico; las aberraciones pueden dominar.</li>
            <li><strong>La coherencia no es lo mismo que la monocromaticidad</strong> — Pueden coexistir fuentes monocromáticas poco coherentes (si tienen ruido de fase). Un láser bien estabilizado tiene ambas propiedades.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-optica-ondulatoria')} />
      <ShareCard appName="visualizador-optica-ondulatoria" />
      <Footer appName="visualizador-optica-ondulatoria" />
    </div>
  );
}
