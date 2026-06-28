'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorFluidosBernoulli.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type GeomId = 'venturi' | 'desnivel' | 'estenosis';
type FluidoId = 'agua' | 'aceite' | 'sangre' | 'aire';

interface Fluido {
  id: FluidoId;
  nombre: string;
  rho: number; // kg/m³
}

const FLUIDOS: Fluido[] = [
  { id: 'agua', nombre: 'Agua', rho: 1000 },
  { id: 'aceite', nombre: 'Aceite', rho: 920 },
  { id: 'sangre', nombre: 'Sangre', rho: 1060 },
  { id: 'aire', nombre: 'Aire', rho: 1.225 },
];

interface SeccionData {
  id: string;
  nombre: string;
  x: number; // px en la tubería
  ancho: number; // ancho de la tubería en este punto (m)
  altura: number; // altura del tubo en m respecto a referencia
}

// ============================================
// UTILIDADES
// ============================================
const G = 9.81;

function fmt(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

function fmtPresion(P: number): string {
  if (!isFinite(P)) return '∞';
  // Si > 10000 Pa, mostrar en kPa
  if (Math.abs(P) >= 10000) {
    return `${fmt(P / 1000, 2)} kPa`;
  }
  return `${fmt(P, 0)} Pa`;
}

// ============================================
// CONFIGURACIÓN GEOMETRÍAS
// ============================================
function getSecciones(geom: GeomId, ratioEstrechamiento: number, alturaDesnivel: number): SeccionData[] {
  // ratioEstrechamiento: factor por el que se reduce el ancho en la zona estrecha (0.3-1)
  const D0 = 0.10; // diámetro nominal en m (10 cm)
  const D_estrecho = D0 * ratioEstrechamiento;

  if (geom === 'venturi') {
    return [
      { id: '1', nombre: 'Entrada', x: 0.05, ancho: D0, altura: 0 },
      { id: '2', nombre: 'Garganta', x: 0.50, ancho: D_estrecho, altura: 0 },
      { id: '3', nombre: 'Salida', x: 0.95, ancho: D0, altura: 0 },
    ];
  }
  if (geom === 'desnivel') {
    return [
      { id: '1', nombre: 'Inferior', x: 0.10, ancho: D0, altura: 0 },
      { id: '2', nombre: 'Subida', x: 0.50, ancho: D0, altura: alturaDesnivel * 0.5 },
      { id: '3', nombre: 'Superior', x: 0.90, ancho: D0, altura: alturaDesnivel },
    ];
  }
  // estenosis (vena con estrechamiento brusco)
  return [
    { id: '1', nombre: 'Pre-estenosis', x: 0.15, ancho: D0, altura: 0 },
    { id: '2', nombre: 'Estenosis', x: 0.50, ancho: D_estrecho, altura: 0 },
    { id: '3', nombre: 'Post-estenosis', x: 0.85, ancho: D0, altura: 0 },
  ];
}

// Devuelve el ancho de la tubería en un x normalizado (0-1) para una geometría
function anchoEnX(x: number, geom: GeomId, ratio: number): number {
  const D0 = 0.10;
  const D_estrecho = D0 * ratio;

  if (geom === 'desnivel') return D0; // ancho constante

  // venturi: transición suave entre D0 y D_estrecho
  // x: 0 a 0.3 → D0 constante
  // x: 0.3 a 0.45 → transición lineal a D_estrecho
  // x: 0.45 a 0.55 → D_estrecho
  // x: 0.55 a 0.70 → transición lineal a D0
  // x: 0.70 a 1 → D0
  if (geom === 'venturi') {
    if (x < 0.3) return D0;
    if (x < 0.45) {
      const t = (x - 0.3) / 0.15;
      return D0 + (D_estrecho - D0) * t;
    }
    if (x < 0.55) return D_estrecho;
    if (x < 0.70) {
      const t = (x - 0.55) / 0.15;
      return D_estrecho + (D0 - D_estrecho) * t;
    }
    return D0;
  }

  // estenosis: transición más abrupta
  if (x < 0.4) return D0;
  if (x < 0.45) {
    const t = (x - 0.4) / 0.05;
    return D0 + (D_estrecho - D0) * t;
  }
  if (x < 0.55) return D_estrecho;
  if (x < 0.60) {
    const t = (x - 0.55) / 0.05;
    return D_estrecho + (D0 - D_estrecho) * t;
  }
  return D0;
}

// Devuelve la altura del centro del tubo en x (en m)
function alturaEnX(x: number, geom: GeomId, alturaDesnivel: number): number {
  if (geom !== 'desnivel') return 0;
  // Suave: subida en S
  if (x < 0.25) return 0;
  if (x > 0.75) return alturaDesnivel;
  const t = (x - 0.25) / 0.5;
  // Función S (smoothstep)
  return alturaDesnivel * (3 * t * t - 2 * t * t * t);
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorFluidosBernoulliPage() {
  const [geom, setGeom] = useState<GeomId>('venturi');
  const [fluidoId, setFluidoId] = useState<FluidoId>('agua');
  const [Q, setQ] = useState(2); // L/s
  const [ratioEstrechamiento, setRatio] = useState(0.5);
  const [alturaDesnivel, setAlturaDesnivel] = useState(2); // m
  const [animando, setAnimando] = useState(true);
  const [P0, setP0] = useState(101325); // Pa (1 atm) en sección 1

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const particulasRef = useRef<{ x: number; yOffset: number }[]>([]);

  const fluido = FLUIDOS.find(f => f.id === fluidoId)!;
  const rho = fluido.rho;
  const Q_m3s = Q / 1000; // Convertir L/s a m³/s

  // ============================================
  // SECCIONES Y CÁLCULOS
  // ============================================
  const secciones = useMemo(
    () => getSecciones(geom, ratioEstrechamiento, alturaDesnivel),
    [geom, ratioEstrechamiento, alturaDesnivel]
  );

  // Para cada sección: A, v, P
  const datos = useMemo(() => {
    return secciones.map((s, idx) => {
      const A = Math.PI * (s.ancho / 2) * (s.ancho / 2); // m²
      const v = Q_m3s / A; // m/s
      // Bernoulli desde sección 0:
      // P1 + ½ρv1² + ρgh1 = P_i + ½ρv_i² + ρgh_i
      let P: number;
      if (idx === 0) {
        P = P0;
      } else {
        const A0 = Math.PI * (secciones[0].ancho / 2) * (secciones[0].ancho / 2);
        const v0 = Q_m3s / A0;
        const h0 = secciones[0].altura;
        P = P0 + 0.5 * rho * (v0 * v0 - v * v) + rho * G * (h0 - s.altura);
      }
      return { ...s, A, v, P };
    });
  }, [secciones, Q_m3s, rho, P0]);

  // Caudal másico
  const caudalMasico = useMemo(() => Q_m3s * rho, [Q_m3s, rho]);

  // ============================================
  // ANIMACIÓN PARTÍCULAS
  // ============================================
  useEffect(() => {
    // Inicializar partículas
    if (particulasRef.current.length === 0) {
      for (let i = 0; i < 80; i++) {
        particulasRef.current.push({
          x: Math.random(),
          yOffset: (Math.random() - 0.5) * 0.7,
        });
      }
    }
  }, []);

  const updateParticulas = useCallback((dt: number) => {
    // Velocidad relativa: depende de v en cada x (más velocidad en zona estrecha)
    const A0 = Math.PI * (0.10 / 2) * (0.10 / 2);
    const v_ref = Q_m3s / A0; // velocidad de referencia

    for (const p of particulasRef.current) {
      const ancho = anchoEnX(p.x, geom, ratioEstrechamiento);
      const A_local = Math.PI * (ancho / 2) * (ancho / 2);
      const v_local = Q_m3s / A_local;

      // Velocidad normalizada (0..1 representa la fracción de pantalla por segundo)
      const vNorm = (v_local / v_ref) * 0.15;
      p.x += vNorm * dt;
      if (p.x > 1) {
        p.x -= 1;
        p.yOffset = (Math.random() - 0.5) * 0.7;
      }
    }
  }, [Q_m3s, geom, ratioEstrechamiento]);

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
    const pad = { top: 40, right: 24, bottom: 40, left: 24 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorTubeBorder = isDark ? '#888' : '#555';
    const colorTubeFill = isDark ? '#1F2937' : '#E5F1F8';
    const colorParticula = '#2E86AB';
    const colorMan = '#A82E68';
    const colorVeloc = '#E07A1F';

    ctx.clearRect(0, 0, W, H);

    // Coordenadas: x normalizado (0-1) → px
    const xToPx = (xn: number) => pad.left + xn * plotW;

    // y central del tubo: depende de alturaEnX si geom=desnivel
    // Mapear altura física (m) a píxeles: hMax = alturaDesnivel; centrar tubo
    const hMaxFis = geom === 'desnivel' ? alturaDesnivel : 0;
    // Para que el centro del tubo quede aproximadamente a media altura del canvas
    // y la subida llene plotH * 0.4, mapeamos altura física → desplazamiento vertical
    const escalaY = (plotH * 0.5) / Math.max(1, hMaxFis);
    const yCentral = (xn: number) => {
      const h = alturaEnX(xn, geom, alturaDesnivel);
      // Para desnivel: alto h → arriba (menor py)
      const yBase = pad.top + plotH * 0.55;
      return yBase - h * escalaY;
    };

    const anchoToPx = (ancho: number) => {
      // Convertir ancho en m a píxeles. Ancho nominal 0.10 m corresponde a ~80 px
      return ancho * 800;
    };

    // === DIBUJAR TUBERÍA ===
    ctx.fillStyle = colorTubeFill;
    ctx.strokeStyle = colorTubeBorder;
    ctx.lineWidth = 2;

    ctx.beginPath();
    const N = 200;
    // Borde superior
    for (let i = 0; i <= N; i++) {
      const xn = i / N;
      const yc = yCentral(xn);
      const a = anchoEnX(xn, geom, ratioEstrechamiento);
      const aPx = anchoToPx(a);
      const y = yc - aPx / 2;
      const px = xToPx(xn);
      if (i === 0) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    // Borde inferior (de derecha a izquierda)
    for (let i = N; i >= 0; i--) {
      const xn = i / N;
      const yc = yCentral(xn);
      const a = anchoEnX(xn, geom, ratioEstrechamiento);
      const aPx = anchoToPx(a);
      const y = yc + aPx / 2;
      const px = xToPx(xn);
      ctx.lineTo(px, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === PARTÍCULAS DE FLUIDO ===
    if (animando) {
      ctx.fillStyle = colorParticula;
      for (const p of particulasRef.current) {
        const yc = yCentral(p.x);
        const a = anchoEnX(p.x, geom, ratioEstrechamiento);
        const aPx = anchoToPx(a);
        const py = yc + p.yOffset * (aPx * 0.4);
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(xToPx(p.x), py, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // === SECCIONES MARCADAS + MANÓMETROS ===
    for (const d of datos) {
      const px = xToPx(d.x);
      const yc = yCentral(d.x);
      const aPx = anchoToPx(d.ancho);

      // Línea vertical de la sección
      ctx.strokeStyle = isDark ? '#7FB3D3' : '#5a9bc4';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(px, yc - aPx / 2);
      ctx.lineTo(px, yc + aPx / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Manómetro: una "columna" arriba del tubo cuya altura es proporcional a la presión
      // Normalizar presión: la columna más alta tiene unos 80 px
      const Pmax = Math.max(...datos.map(dd => Math.abs(dd.P)), 100);
      const colHeight = (Math.abs(d.P) / Pmax) * 70 + 8;
      const manTop = pad.top - 4;
      const manBottom = manTop + colHeight;

      ctx.strokeStyle = colorMan;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, manBottom);
      ctx.lineTo(px, manTop + 8);
      ctx.stroke();
      ctx.lineCap = 'butt';

      // Etiqueta presión arriba
      ctx.fillStyle = colorMan;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(fmtPresion(d.P), px, manTop);

      // Vector velocidad
      const vMax = Math.max(...datos.map(dd => dd.v), 0.1);
      const escala = 50;
      const vLen = (d.v / vMax) * escala;
      ctx.strokeStyle = colorVeloc;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px - vLen / 2, yc);
      ctx.lineTo(px + vLen / 2, yc);
      ctx.stroke();
      // Punta
      ctx.fillStyle = colorVeloc;
      ctx.beginPath();
      ctx.moveTo(px + vLen / 2, yc);
      ctx.lineTo(px + vLen / 2 - 6, yc - 4);
      ctx.lineTo(px + vLen / 2 - 6, yc + 4);
      ctx.closePath();
      ctx.fill();

      // Etiqueta velocidad
      ctx.fillStyle = colorVeloc;
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`v=${fmt(d.v, 2)} m/s`, px, yc + aPx / 2 + 14);

      // Etiqueta nombre sección abajo
      ctx.fillStyle = colorText;
      ctx.font = '10px system-ui';
      ctx.fillText(d.nombre, px, pad.top + plotH + 14);
    }
  }, [datos, geom, ratioEstrechamiento, alturaDesnivel, animando]);

  // ============================================
  // ANIMACIÓN LOOP
  // ============================================
  useEffect(() => {
    let lastTime = 0;
    const tick = (tNow: number) => {
      if (lastTime === 0) lastTime = tNow;
      const dt = Math.min(0.05, (tNow - lastTime) / 1000);
      lastTime = tNow;

      if (animando) {
        updateParticulas(dt);
      }
      dibujar();
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [animando, updateParticulas, dibujar]);

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

  const dP = useMemo(() => {
    if (datos.length < 2) return 0;
    return datos[1].P - datos[0].P;
  }, [datos]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🌊</span> Simulador de Fluidos: Ecuación de Bernoulli</h1>
        <p className={styles.subtitle}>
          Visualiza por qué <strong>más velocidad implica menos presión</strong>. Tubería con manómetros y
          partículas animadas: la paradoja que sostiene los aviones, los venturímetros y la circulación.
        </p>
      </header>

      <LegalNotice />

      {/* GEOMETRÍA */}
      <div className={styles.geomSelector}>
        <button
          type="button"
          className={`${styles.geomBtn} ${geom === 'venturi' ? styles.geomBtnActive : ''}`}
          onClick={() => setGeom('venturi')}
          aria-pressed={geom === 'venturi'}
        >
          <span className={styles.geomIcon} aria-hidden="true">⌛</span>
          <span className={styles.geomName}>Venturi horizontal</span>
          <span className={styles.geomDesc}>Tubo recto con estrechamiento suave</span>
        </button>
        <button
          type="button"
          className={`${styles.geomBtn} ${geom === 'desnivel' ? styles.geomBtnActive : ''}`}
          onClick={() => setGeom('desnivel')}
          aria-pressed={geom === 'desnivel'}
        >
          <span className={styles.geomIcon} aria-hidden="true">📈</span>
          <span className={styles.geomName}>Tubería con desnivel</span>
          <span className={styles.geomDesc}>Mismo diámetro, distinta altura</span>
        </button>
        <button
          type="button"
          className={`${styles.geomBtn} ${geom === 'estenosis' ? styles.geomBtnActive : ''}`}
          onClick={() => setGeom('estenosis')}
          aria-pressed={geom === 'estenosis'}
        >
          <span className={styles.geomIcon} aria-hidden="true">🩺</span>
          <span className={styles.geomName}>Vena con estenosis</span>
          <span className={styles.geomDesc}>Estrechamiento brusco (bio-fluido)</span>
        </button>
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>
          Aplicamos la ecuación de continuidad <strong>A·v = Q (constante)</strong> y la ecuación de
          Bernoulli <strong>P + ½ρv² + ρgh = constante</strong> en un fluido ideal estacionario.
          {geom === 'venturi' && ' En la garganta del Venturi, la velocidad sube y la presión cae — efecto que se mide con un manómetro diferencial.'}
          {geom === 'desnivel' && ' Subir altura cuesta presión: parte del trabajo se transforma en energía potencial gravitatoria.'}
          {geom === 'estenosis' && ' Una estenosis arterial reduce la luz, acelera la sangre y la presión local cae bruscamente. Útil para entender Doppler vascular.'}
        </p>

        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Caudal (Q = <strong>{fmt(Q, 1)} L/s</strong>)
              </label>
              <input
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                value={Q}
                onChange={e => setQ(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Caudal"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Fluido (ρ = <strong>{rho} kg/m³</strong>)
              </label>
              <div className={styles.fluidSelector} role="group" aria-label="Tipo de fluido">
                {FLUIDOS.map(f => (
                  <button
                    type="button"
                    key={f.id}
                    className={`${styles.fluidBtn} ${fluidoId === f.id ? styles.fluidBtnActive : ''}`}
                    onClick={() => setFluidoId(f.id)}
                    aria-pressed={fluidoId === f.id}
                  >
                    {f.nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.controlsGrid}>
            {geom !== 'desnivel' && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  Ratio de estrechamiento (D₂/D₁ = <strong>{fmt(ratioEstrechamiento, 2)}</strong>)
                </label>
                <input
                  type="range"
                  min={0.25}
                  max={1}
                  step={0.05}
                  value={ratioEstrechamiento}
                  onChange={e => setRatio(parseFloat(e.target.value))}
                  className={styles.slider}
                  aria-label="Ratio de estrechamiento"
                />
              </div>
            )}
            {geom === 'desnivel' && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  Desnivel (Δh = <strong>{fmt(alturaDesnivel, 1)} m</strong>)
                </label>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={0.5}
                  value={alturaDesnivel}
                  onChange={e => setAlturaDesnivel(parseFloat(e.target.value))}
                  className={styles.slider}
                  aria-label="Desnivel"
                />
              </div>
            )}
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Presión entrada (P₁ = <strong>{fmt(P0 / 1000, 1)} kPa</strong>)
              </label>
              <input
                type="range"
                min={50000}
                max={300000}
                step={1000}
                value={P0}
                onChange={e => setP0(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Presión de entrada"
              />
            </div>
          </div>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={animando}
              onChange={e => setAnimando(e.target.checked)}
            />
            <span>Animación de partículas (más rápidas en zonas estrechas)</span>
          </label>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Tubería con flujo y manómetros" />
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} aria-hidden="true" style={{ background: '#2E86AB' }} />
              Partículas de fluido
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} aria-hidden="true" style={{ background: '#E07A1F' }} />
              Vector velocidad
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} aria-hidden="true" style={{ background: '#A82E68' }} />
              Manómetro (presión local)
            </span>
          </div>
        </div>

        {/* TABLA SECCIONES */}
        <table className={styles.seccionesTable}>
          <thead>
            <tr>
              <th>Sección</th>
              <th>Diámetro (cm)</th>
              <th>Área (cm²)</th>
              <th>v (m/s)</th>
              <th>Presión</th>
              <th>Altura (m)</th>
            </tr>
          </thead>
          <tbody>
            {datos.map(d => (
              <tr key={d.id}>
                <td>{d.nombre}</td>
                <td>{fmt(d.ancho * 100, 1)}</td>
                <td>{fmt(d.A * 10000, 2)}</td>
                <td>{fmt(d.v, 2)}</td>
                <td>{fmtPresion(d.P)}</td>
                <td>{fmt(d.altura, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
          <div className={styles.resultCardOk}>
            <span className={styles.resultLabel}>Diferencia de presión P₂ − P₁ {datos.length > 1 && `(de ${datos[0].nombre} a ${datos[1].nombre})`}</span>
            <span className={styles.resultValueLarge} style={{ color: dP < 0 ? '#A82E68' : '#48A9A6' }}>
              {dP < 0 ? '−' : '+'}{fmtPresion(Math.abs(dP))}
            </span>
            <span className={styles.resultRange}>
              {dP < 0
                ? '⚠️ La presión CAE en el estrechamiento (paradoja Bernoulli)'
                : 'La presión sube'}
            </span>
          </div>

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Caudal másico</span>
            <span className={styles.resultValue}>{fmt(caudalMasico, 3)} kg/s</span>
            <span className={styles.resultRange}>= ρ · Q</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Caudal volumétrico</span>
            <span className={styles.resultValue}>{fmt(Q, 2)} L/s</span>
            <span className={styles.resultRange}>{fmt(Q_m3s, 5)} m³/s</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>v máxima (zona estrecha)</span>
            <span className={styles.resultValue}>{fmt(Math.max(...datos.map(d => d.v)), 2)} m/s</span>
            <span className={styles.resultRange}>= Q / A_mín</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Densidad del fluido</span>
            <span className={styles.resultValue}>{rho} kg/m³</span>
            <span className={styles.resultRange}>{fluido.nombre}</span>
          </div>
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="Aprende mecánica de fluidos con Bernoulli"
        subtitle="La ecuación que explica desde aviones hasta la circulación sanguínea"
      >
        <section>
          <h3>¿Qué es la ecuación de Bernoulli?</h3>
          <p>
            La <strong>ecuación de Bernoulli</strong> (Daniel Bernoulli, 1738) es la conservación de la
            energía aplicada a un fluido <em>ideal</em> (incompresible, sin viscosidad) en
            <em> régimen estacionario</em>. Establece que, a lo largo de una línea de corriente:
          </p>
          <div className={styles.formulaBox}>
            P + ½ρv² + ρgh = constante
          </div>
          <ul className={styles.bulletList}>
            <li><strong>P</strong>: presión hidrostática (Pa).</li>
            <li><strong>½ρv²</strong>: presión dinámica (energía cinética por unidad de volumen).</li>
            <li><strong>ρgh</strong>: presión hidrostática debida a la altura (energía potencial por unidad de volumen).</li>
          </ul>
          <p>
            La ecuación se complementa con la <strong>ecuación de continuidad</strong> (conservación de la
            masa): el caudal volumétrico Q = A·v es constante en todo el tubo, así que un estrechamiento
            obliga al fluido a acelerar.
          </p>
          <div className={styles.formulaBox}>
            A₁ · v₁ = A₂ · v₂ = Q (constante)
          </div>
          <p>
            Combinando ambas: en un Venturi horizontal, donde h no cambia, si el fluido se acelera (v₂ &gt; v₁),
            la presión <strong>cae</strong> (P₂ &lt; P₁). Esa es la paradoja contraintuitiva que sostiene
            aviones, surtidores Venturi y muchos efectos cotidianos.
          </p>
        </section>

        <section>
          <h3>Densidades típicas de fluidos comunes</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fluido</th>
                  <th>Densidad ρ (kg/m³)</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Aire (a 20 °C)</td>
                  <td>1,225</td>
                  <td>Casi 1000 veces menos denso que el agua</td>
                </tr>
                <tr>
                  <td>Aceite vegetal</td>
                  <td>910-930</td>
                  <td>Flota sobre el agua (menor ρ)</td>
                </tr>
                <tr>
                  <td>Agua pura (a 4 °C)</td>
                  <td>1000</td>
                  <td>Referencia universal</td>
                </tr>
                <tr>
                  <td>Agua del mar</td>
                  <td>1025</td>
                  <td>Sales aumentan ligeramente ρ</td>
                </tr>
                <tr>
                  <td>Sangre humana</td>
                  <td>1060</td>
                  <td>Plasma + glóbulos suspendidos</td>
                </tr>
                <tr>
                  <td>Mercurio</td>
                  <td>13534</td>
                  <td>Líquido más denso a T ambiente</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>4 escenarios donde Bernoulli es la pieza clave</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">✈️</span>
              <strong>Sustentación aerodinámica</strong>
              <p>El aire fluye más rápido por la curva superior del ala que por la inferior. Por Bernoulli, la presión arriba es menor: la diferencia neta empuja el ala hacia arriba. (Aunque el efecto es más complejo: también hay desviación del flujo, ley de Newton.)</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🩺</span>
              <strong>Circulación sanguínea y estenosis</strong>
              <p>Una arteria parcialmente bloqueada (estenosis) acelera la sangre en la zona estrecha. La presión local cae, lo que el ecocardiograma Doppler detecta y cuantifica. Diferencias de presión &gt; 50 mmHg indican estenosis severa.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📏</span>
              <strong>Tubo de Venturi (medidor de caudal)</strong>
              <p>Un Venturi industrial mide el caudal Q a partir de la diferencia de presión P₁ − P₂. Es un dispositivo sin partes móviles, fiable y barato, presente en plantas químicas, motores y conductos de aire acondicionado.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚿</span>
              <strong>Tubo de Pitot y velocímetros</strong>
              <p>Un Pitot mide la velocidad de un avión calculando la diferencia entre presión total (P + ½ρv²) y estática (P). Bernoulli convierte ΔP en velocidad: el indicador de velocidad de cualquier avión funciona así.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre Bernoulli y fluidos</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué la presión CAE cuando el fluido se acelera?</h4>
              <p>Por <strong>conservación de la energía</strong>. La presión es energía potencial almacenada en el fluido; la velocidad es energía cinética. Si el fluido acelera, parte de la presión se ha &quot;convertido&quot; en velocidad. La suma P + ½ρv² + ρgh permanece constante a lo largo de la corriente.</p>
              <p className={styles.faqTip}>💡 No es magia: es la misma idea que una pelota cayendo intercambia energía potencial por cinética. Aquí, presión por velocidad.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo NO se cumple Bernoulli?</h4>
              <p>La ecuación clásica asume <strong>fluido ideal</strong> (sin viscosidad, incompresible) en régimen estacionario y a lo largo de una <em>línea de corriente</em>. NO se aplica directamente a: fluidos viscosos (miel, aceite muy frío), turbulencia, tubos con codos bruscos, gases a velocidades supersónicas, fluidos que se calientan o enfrían.</p>
              <p className={styles.faqTip}>💡 En la práctica industrial se añaden términos de pérdidas por fricción (ecuación de Bernoulli generalizada o ecuación de energía).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿De verdad los aviones vuelan por Bernoulli?</h4>
              <p>Es una <strong>parte</strong> de la explicación, pero no toda. La sustentación se debe sobre todo a la <em>desviación del aire hacia abajo</em> (3.ª ley de Newton: el ala empuja el aire abajo, el aire empuja al ala arriba). Bernoulli explica por qué la presión arriba del ala es menor, lo que contribuye a la fuerza neta. Ambos enfoques son correctos y complementarios.</p>
              <p className={styles.faqTip}>💡 Una explicación &quot;sólo Bernoulli&quot; tiene problemas: no explica por qué un avión puede volar invertido. La realidad combina forma, ángulo de ataque y dinámica del aire.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo afecta la viscosidad?</h4>
              <p>La viscosidad <strong>disipa energía</strong>. En tuberías largas o con fluidos viscosos, parte de P + ½ρv² + ρgh se transforma en calor por fricción interna. La presión cae a lo largo del flujo aunque no haya estrechamiento. Eso lleva a las ecuaciones de Hagen-Poiseuille (régimen laminar) o Darcy-Weisbach (turbulento).</p>
              <p className={styles.faqTip}>💡 Por eso el grifo de tu casa tiene menos presión que el de la red municipal: parte se ha disipado en las tuberías.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el número de Reynolds y por qué importa?</h4>
              <p>Re = ρvL/μ, donde L es una longitud característica y μ la viscosidad. Mide la importancia relativa de fuerzas inerciales frente a viscosas. Re &lt; 2300 → flujo laminar (suave, Bernoulli funciona razonablemente). Re &gt; 4000 → flujo turbulento (caótico, hay que añadir correcciones empíricas). Entre medias: transición.</p>
              <p className={styles.faqTip}>💡 Un grifo abierto un poco da chorro laminar; abierto del todo, turbulento. Tú mismo cambias Re con la mano.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo resolver un problema de Bernoulli paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica las dos secciones que vas a comparar</strong>
                <p>Marca dos puntos &quot;antes&quot; y &quot;después&quot; en la línea de corriente. En cada uno tendrás P, v, h. Pasa todas las unidades al SI: Pa, m/s, m.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Aplica continuidad: A₁·v₁ = A₂·v₂</strong>
                <p>Con A = π·(D/2)², calcula la velocidad desconocida en una sección a partir de la otra y los diámetros. Q es constante en todo el tubo (siempre que no haya bifurcaciones).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Aplica Bernoulli: P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂</strong>
                <p>Despeja la incógnita: P₂ = P₁ + ½ρ(v₁² − v₂²) + ρg(h₁ − h₂). Si v₂ &gt; v₁ (estrechamiento), el primer término del paréntesis es negativo: P₂ &lt; P₁.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Convierte unidades de presión si te lo piden</strong>
                <p>1 atm = 101325 Pa. 1 bar = 100000 Pa. 1 mmHg = 133,3 Pa. La presión arterial sistólica de 120 mmHg = 16000 Pa = 16 kPa. Usar SI durante el cálculo, convertir solo al final.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica consistencia física</strong>
                <p>¿La presión donde el fluido es más rápido es menor? ¿La presión donde está más alto es menor? Si tu resultado contradice eso, hay un error de signo. El sentido común físico es la mejor verificación.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>4 buenas prácticas con problemas de Bernoulli</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <strong>Dibuja siempre la tubería antes</strong>
              <p>Marca las dos secciones, anota lo conocido, ponle nombre a las incógnitas. Te ahorra confusiones de subíndices y te clarifica qué falta calcular.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <strong>Comprueba unidades antes de calcular</strong>
              <p>Caudal puede venir en L/min, L/h, m³/s. Diámetros en mm o cm. Conviértelo todo a SI antes de meter números en la fórmula. Errores de unidades son los más frecuentes y los más caros en exámenes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <strong>Identifica si Bernoulli ideal es razonable</strong>
              <p>¿Fluido casi sin viscosidad (agua, aire)? ¿Tubo corto? ¿Velocidad moderada? Si sí, Bernoulli ideal vale. Si tienes miel, aceite frío o tubería kilométrica, hay que añadir pérdidas por fricción.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Usa Bernoulli + continuidad como pareja</strong>
              <p>Casi nunca hay un problema con sólo una de las dos. Continuidad te da las velocidades, Bernoulli te da las presiones. Si te falta un dato, lo más probable es que necesites la otra ecuación.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes con Bernoulli</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Aplicar Bernoulli a fluidos viscosos sin más</strong> — Bernoulli ideal NO incluye pérdidas por fricción. Para aceite, miel, sangre por capilares o tuberías largas, hay que añadir el término de pérdidas (ecuación de Darcy-Weisbach o similar).</li>
            <li><strong>Olvidar el término ρgh cuando hay desnivel</strong> — Si las dos secciones están a distinta altura, hay que sumar ρg·Δh. Olvidar este término en una tubería en pendiente da resultados absurdos por factores enormes.</li>
            <li><strong>Confundir presión absoluta con manométrica</strong> — La presión &quot;120 mmHg&quot; arterial es manométrica (sobre la atmosférica). En cálculos absolutos hay que sumar 101325 Pa. Las tuberías industriales suelen reportar presión manométrica (gauge).</li>
            <li><strong>Usar Bernoulli a través de una bomba o turbina</strong> — Esos elementos AÑADEN o EXTRAEN energía al fluido. Bernoulli puro no vale; hay que añadir el trabajo de la bomba (W_bomba/ρg) al lado correspondiente.</li>
            <li><strong>Olvidar la conservación del caudal</strong> — Q = A·v se conserva SIEMPRE en un tubo sin fugas, da igual la geometría. Si te sale que cambia, has cometido un error: vuelve y revisa los diámetros.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-fluidos-bernoulli')} />
      <ShareCard appName="simulador-fluidos-bernoulli" />
      <Footer appName="simulador-fluidos-bernoulli" />
    </div>
  );
}
