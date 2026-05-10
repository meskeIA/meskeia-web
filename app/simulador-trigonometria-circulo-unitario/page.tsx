'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './SimuladorTrigonometriaCirculoUnitario.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// CONSTANTES
// ============================================

const ANGULOS_NOTABLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
const BOTONES_NOTABLES = [0, 30, 45, 60, 90, 180, 270, 360];

// ============================================
// UTILIDADES
// ============================================

function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

function formatearNumero(n: number, decimales = 4): string {
  return n.toFixed(decimales).replace('.', ',');
}

function obtenerCuadrante(angulo: number): string {
  const a = ((angulo % 360) + 360) % 360;
  if (a === 0 || a === 90 || a === 180 || a === 270 || a === 360) return '—';
  if (a < 90) return 'I';
  if (a < 180) return 'II';
  if (a < 270) return 'III';
  return 'IV';
}

function calcularTangente(angulo: number): string {
  const rad = gradosARadianes(angulo);
  const cosVal = Math.cos(rad);
  if (Math.abs(cosVal) < 1e-10) return '∞';
  const tanVal = Math.tan(rad);
  return formatearNumero(tanVal);
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SimuladorTrigonometriaCirculoUnitario() {
  const [angulo, setAngulo] = useState(45);
  const [unidad, setUnidad] = useState<'grados' | 'radianes'>('grados');
  const [animando, setAnimando] = useState(false);
  const [velocidad, setVelocidad] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const anguloRef = useRef<number>(45);

  // Mantener el ref sincronizado con el estado
  useEffect(() => {
    anguloRef.current = angulo;
  }, [angulo]);

  // ============================================
  // DIBUJO DEL CANVAS
  // ============================================

  const dibujar = useCallback((anguloGrados: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resolución Retina/HiDPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H / 2;
    const margen = 40;
    const radio = Math.min(W, H) / 2 - margen;

    // Detectar dark mode
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorFondo = isDark ? '#1A1A1A' : '#FAFAFA';
    const colorEje = isDark ? '#555' : '#CCC';
    const colorTexto = isDark ? '#E5E5E5' : '#333';
    const colorTextoSecundario = isDark ? '#888' : '#999';
    const colorCirculo = isDark ? '#3a3a3a' : '#E8F4F8';
    const colorCirculoBorde = isDark ? '#444' : '#C5DDE8';
    const colorRadio = '#2E86AB';
    const colorCos = '#48A9A6';
    const colorSin = '#E07A1F';
    const colorPunto = '#2E86AB';
    const colorNotable = isDark ? 'rgba(46,134,171,0.4)' : 'rgba(46,134,171,0.3)';

    ctx.clearRect(0, 0, W, H);

    // Fondo
    ctx.fillStyle = colorFondo;
    ctx.fillRect(0, 0, W, H);

    // === CÍRCULO RELLENO ===
    ctx.fillStyle = colorCirculo;
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, 2 * Math.PI);
    ctx.fill();

    // === BORDE DEL CÍRCULO ===
    ctx.strokeStyle = colorCirculoBorde;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radio, 0, 2 * Math.PI);
    ctx.stroke();

    // === EJES ===
    ctx.strokeStyle = colorEje;
    ctx.lineWidth = 1;
    // Eje X
    ctx.beginPath();
    ctx.moveTo(cx - radio - 20, cy);
    ctx.lineTo(cx + radio + 20, cy);
    ctx.stroke();
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(cx, cy - radio - 20);
    ctx.lineTo(cx, cy + radio + 20);
    ctx.stroke();

    // === MARCAS EN -1, 0, 1 ===
    ctx.fillStyle = colorTextoSecundario;
    ctx.font = `${Math.round(radio * 0.1)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('1', cx + radio + 14, cy + 4);
    ctx.fillText('-1', cx - radio - 16, cy + 4);
    ctx.textAlign = 'right';
    ctx.fillText('1', cx - 6, cy - radio - 6);
    ctx.fillText('-1', cx - 6, cy + radio + 10);

    // === ETIQUETAS DE CUADRANTES ===
    const qFont = Math.round(radio * 0.12);
    ctx.font = `bold ${qFont}px system-ui`;
    ctx.fillStyle = isDark ? 'rgba(200,200,200,0.15)' : 'rgba(0,0,0,0.08)';
    ctx.textAlign = 'center';
    const qOffset = radio * 0.55;
    ctx.fillText('I', cx + qOffset, cy - qOffset);
    ctx.fillText('II', cx - qOffset, cy - qOffset);
    ctx.fillText('III', cx - qOffset, cy + qOffset);
    ctx.fillText('IV', cx + qOffset, cy + qOffset);

    // === ÁNGULOS NOTABLES: puntos pequeños ===
    ANGULOS_NOTABLES.forEach(ang => {
      const rad = gradosARadianes(ang);
      const nx = cx + radio * Math.cos(-rad);
      const ny = cy + radio * Math.sin(-rad);
      ctx.fillStyle = colorNotable;
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // === CALCULAR POSICIÓN DEL PUNTO ===
    const rad = gradosARadianes(anguloGrados);
    const px = cx + radio * Math.cos(-rad);
    const py = cy + radio * Math.sin(-rad);
    const sinVal = Math.sin(rad);
    const cosVal = Math.cos(rad);

    // Coordenadas de proyección
    const pxProj = cx + radio * cosVal; // Proyección cos sobre eje X
    const pyProj = cy - radio * sinVal; // Proyección sin sobre eje Y

    // === PROYECCIÓN COS (línea horizontal discontinua, color teal) ===
    ctx.strokeStyle = colorCos;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, cy); // Vertical desde punto al eje X (proyección sin)
    ctx.stroke();

    // === PROYECCIÓN SIN (línea vertical discontinua, color naranja) ===
    ctx.strokeStyle = colorSin;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(cx, py); // Horizontal desde punto al eje Y (proyección cos)
    ctx.stroke();

    ctx.setLineDash([]);

    // === ARCO DE ÁNGULO ===
    const arcRadio = radio * 0.22;
    ctx.strokeStyle = isDark ? 'rgba(46,134,171,0.7)' : 'rgba(46,134,171,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, arcRadio, 0, -rad, rad >= 0);
    ctx.stroke();

    // === RADIO (línea azul principal) ===
    ctx.strokeStyle = colorRadio;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // === PUNTO EN LA CIRCUNFERENCIA ===
    ctx.fillStyle = colorPunto;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = isDark ? '#1A1A1A' : '#FAFAFA';
    ctx.lineWidth = 2;
    ctx.stroke();

    // === ETIQUETA θ EN EL ARCO ===
    const thetaAngle = -rad / 2;
    const thetaR = arcRadio + 12;
    const thetaX = cx + thetaR * Math.cos(thetaAngle);
    const thetaY = cy + thetaR * Math.sin(thetaAngle);
    ctx.fillStyle = colorRadio;
    ctx.font = `bold ${Math.round(radio * 0.1)}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('θ', thetaX, thetaY);

    // === ETIQUETAS COS Y SIN EN PROYECCIONES ===
    const labelFont = Math.round(radio * 0.09);
    ctx.font = `bold ${labelFont}px system-ui`;

    // Etiqueta cos (en el punto de proyección sobre el eje X)
    ctx.fillStyle = colorCos;
    ctx.textAlign = 'center';
    const cosLabelX = px;
    const cosLabelY = cy + (sinVal >= 0 ? 16 : -8);
    ctx.fillText('cos', cosLabelX, cosLabelY);

    // Etiqueta sin (en el punto de proyección sobre el eje Y)
    ctx.fillStyle = colorSin;
    ctx.textAlign = cosVal >= 0 ? 'right' : 'left';
    const sinLabelX = cx + (cosVal >= 0 ? -8 : 8);
    const sinLabelY = py;
    ctx.fillText('sin', sinLabelX, sinLabelY);

    // Segmentos de proyección sobre los ejes
    ctx.strokeStyle = colorCos;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pxProj, cy);
    ctx.stroke();

    ctx.strokeStyle = colorSin;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, pyProj);
    ctx.stroke();

  }, []);

  // Dibujar cuando cambia el ángulo
  useEffect(() => {
    dibujar(angulo);
  }, [angulo, dibujar]);

  // Re-dibujar en resize
  useEffect(() => {
    const handleResize = () => dibujar(anguloRef.current);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujar]);

  // Re-dibujar al cambiar tema
  useEffect(() => {
    const observer = new MutationObserver(() => dibujar(anguloRef.current));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujar]);

  // ============================================
  // ANIMACIÓN
  // ============================================

  const detenerAnimacion = useCallback(() => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!animando) {
      detenerAnimacion();
      return;
    }

    // Velocidades: lenta = 0.3°/frame, media = 0.8°/frame, rápida = 1.8°/frame
    const incrementos = [0.3, 0.8, 1.8];
    const incremento = incrementos[velocidad - 1] ?? 0.8;

    const loop = () => {
      anguloRef.current = (anguloRef.current + incremento) % 361;
      if (anguloRef.current > 360) anguloRef.current = 0;
      setAngulo(Math.round(anguloRef.current * 10) / 10);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => detenerAnimacion();
  }, [animando, velocidad, detenerAnimacion]);

  // ============================================
  // VALORES DERIVADOS
  // ============================================

  const rad = gradosARadianes(angulo);
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const cuadrante = obtenerCuadrante(angulo);

  const anguloEnRadianes = (angulo * Math.PI / 180).toFixed(4).replace('.', ',');
  const fracciones: Record<number, string> = {
    0: '0', 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2',
    120: '2π/3', 135: '3π/4', 150: '5π/6', 180: 'π',
    210: '7π/6', 225: '5π/4', 240: '4π/3', 270: '3π/2',
    300: '5π/3', 315: '7π/4', 330: '11π/6', 360: '2π',
  };
  const fraccionRad = fracciones[Math.round(angulo)] ?? `${anguloEnRadianes} rad`;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📐 Simulador del Círculo Trigonométrico</h1>
        <p className={styles.subtitle}>
          Mueve el ángulo θ y observa seno, coseno y tangente sobre el círculo unitario en tiempo real.
          Activa la animación para ver cómo evolucionan las razones trigonométricas.
        </p>
      </header>

      <LegalNotice />

      {/* ============================================
          CONTROLES SUPERIORES
          ============================================ */}
      <div className={styles.controlsTop}>
        {/* Toggle de unidad */}
        <div className={styles.unitToggle}>
          <button
            className={`${styles.unitBtn} ${unidad === 'grados' ? styles.unitBtnActive : ''}`}
            onClick={() => setUnidad('grados')}
            aria-pressed={unidad === 'grados'}
          >
            Grados (°)
          </button>
          <button
            className={`${styles.unitBtn} ${unidad === 'radianes' ? styles.unitBtnActive : ''}`}
            onClick={() => setUnidad('radianes')}
            aria-pressed={unidad === 'radianes'}
          >
            Radianes (rad)
          </button>
        </div>

        {/* Slider de ángulo */}
        <div className={styles.sliderRow}>
          <label className={styles.sliderLabel} htmlFor="slider-angulo">
            θ =&nbsp;
            <strong>{unidad === 'grados' ? `${angulo}°` : fraccionRad}</strong>
          </label>
          <div className={styles.sliderInputRow}>
            <input
              id="slider-angulo"
              type="range"
              min={0}
              max={360}
              step={1}
              value={angulo}
              onChange={e => setAngulo(Number(e.target.value))}
              className={styles.slider}
              aria-label="Ángulo θ en grados"
              disabled={animando}
            />
            <input
              type="number"
              min={0}
              max={360}
              step={1}
              value={angulo}
              onChange={e => {
                const v = Number(e.target.value);
                if (!isNaN(v) && v >= 0 && v <= 360) setAngulo(v);
              }}
              className={styles.angleInput}
              aria-label="Ángulo θ numérico"
              disabled={animando}
            />
            <span className={styles.angleUnit}>°</span>
          </div>
        </div>

        {/* Ángulos notables */}
        <div className={styles.notableRow}>
          <span className={styles.notableLabel}>Ángulos notables:</span>
          <div className={styles.notableButtons}>
            {BOTONES_NOTABLES.map(ang => (
              <button
                key={ang}
                className={`${styles.notableBtn} ${angulo === ang ? styles.notableBtnActive : ''}`}
                onClick={() => { setAnimando(false); setAngulo(ang); }}
                aria-label={`Ir a ${ang}°`}
              >
                {ang}°
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          CANVAS + PANEL DE VALORES
          ============================================ */}
      <div className={styles.mainLayout}>
        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            aria-label={`Círculo trigonométrico con ángulo ${angulo}°`}
          />
        </div>

        {/* Panel de valores */}
        <aside className={styles.valuesPanel}>
          <h2 className={styles.valuesPanelTitle}>Valores actuales</h2>

          <div className={styles.valueRow}>
            <span className={styles.valueName}>θ (grados)</span>
            <span className={styles.valueNum}>{angulo}°</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.valueName}>θ (radianes)</span>
            <span className={styles.valueNum}>{fraccionRad}</span>
          </div>

          <div className={styles.valueDivider} />

          <div className={`${styles.valueRow} ${styles.valueRowSin}`}>
            <span className={styles.valueName}>sin(θ)</span>
            <span className={styles.valueNum}>{formatearNumero(sinVal)}</span>
          </div>
          <div className={`${styles.valueRow} ${styles.valueRowCos}`}>
            <span className={styles.valueName}>cos(θ)</span>
            <span className={styles.valueNum}>{formatearNumero(cosVal)}</span>
          </div>
          <div className={styles.valueRow}>
            <span className={styles.valueName}>tan(θ)</span>
            <span className={styles.valueNum}>{calcularTangente(angulo)}</span>
          </div>

          <div className={styles.valueDivider} />

          <div className={styles.valueRow}>
            <span className={styles.valueName}>sin²+cos²</span>
            <span className={`${styles.valueNum} ${styles.valueIdentidad}`}>1,0000 ✓</span>
          </div>

          <div className={styles.valueDivider} />

          <div className={styles.valueRow}>
            <span className={styles.valueName}>Cuadrante</span>
            <span className={`${styles.valueNum} ${styles.valueCuadrante}`}>{cuadrante}</span>
          </div>

          {/* Signos en cuadrante */}
          <div className={styles.signosGrid}>
            <div className={styles.signoItem}>
              <span className={styles.signoNombre}>sin</span>
              <span className={sinVal >= 0 ? styles.signoPos : styles.signoNeg}>
                {sinVal >= 0 ? '+ (positivo)' : '− (negativo)'}
              </span>
            </div>
            <div className={styles.signoItem}>
              <span className={styles.signoNombre}>cos</span>
              <span className={cosVal >= 0 ? styles.signoPos : styles.signoNeg}>
                {cosVal >= 0 ? '+ (positivo)' : '− (negativo)'}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* ============================================
          CONTROLES DE ANIMACIÓN
          ============================================ */}
      <div className={styles.animControls}>
        <label className={styles.animLabel}>
          <input
            type="checkbox"
            checked={animando}
            onChange={e => setAnimando(e.target.checked)}
            aria-label="Activar animación automática"
          />
          <span>Animación automática</span>
        </label>

        {animando && (
          <div className={styles.velocidadRow}>
            <span className={styles.velocidadLabel}>Velocidad:</span>
            <button
              className={`${styles.velBtn} ${velocidad === 1 ? styles.velBtnActive : ''}`}
              onClick={() => setVelocidad(1)}
              aria-pressed={velocidad === 1}
            >
              Lenta
            </button>
            <button
              className={`${styles.velBtn} ${velocidad === 2 ? styles.velBtnActive : ''}`}
              onClick={() => setVelocidad(2)}
              aria-pressed={velocidad === 2}
            >
              Media
            </button>
            <button
              className={`${styles.velBtn} ${velocidad === 3 ? styles.velBtnActive : ''}`}
              onClick={() => setVelocidad(3)}
              aria-pressed={velocidad === 3}
            >
              Rápida
            </button>
          </div>
        )}
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende sobre el Círculo Trigonométrico"
        subtitle="Geometría y razones trigonométricas desde cero"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es el círculo trigonométrico?</h3>
          <p>
            El <strong>círculo trigonométrico</strong> o <strong>círculo unitario</strong> es una circunferencia
            de radio 1 centrada en el origen de un sistema de coordenadas cartesianas. Su nombre &quot;unitario&quot;
            viene precisamente de que su radio mide exactamente <strong>1 unidad</strong>.
          </p>
          <p>
            Dado un ángulo θ (medido desde el semieje positivo de las X en sentido antihorario), el punto que
            el radio forma sobre la circunferencia tiene coordenadas <code>(cos θ, sin θ)</code>. Esta es la
            <strong> definición moderna de seno y coseno</strong>: la proyección vertical y horizontal del punto
            sobre los ejes, respectivamente.
          </p>
          <p>
            El círculo unitario amplía las razones trigonométricas más allá del triángulo rectángulo, permitiendo
            definirlas para <strong>cualquier ángulo real</strong>, incluso para ángulos mayores de 90° o ángulos
            negativos. Es la herramienta fundamental de la trigonometría en Bachillerato, cálculo y física.
          </p>
        </section>

        {/* TABLA COMPARATIVA — ÁNGULOS NOTABLES */}
        <section>
          <h3>Tabla de ángulos notables</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Ángulo (°)</th>
                  <th>Radián</th>
                  <th>sin θ</th>
                  <th>cos θ</th>
                  <th>tan θ</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0°</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>
                <tr><td>30°</td><td>π/6</td><td>1/2</td><td>√3/2</td><td>√3/3</td></tr>
                <tr><td>45°</td><td>π/4</td><td>√2/2</td><td>√2/2</td><td>1</td></tr>
                <tr><td>60°</td><td>π/3</td><td>√3/2</td><td>1/2</td><td>√3</td></tr>
                <tr><td>90°</td><td>π/2</td><td>1</td><td>0</td><td>∞</td></tr>
                <tr><td>120°</td><td>2π/3</td><td>√3/2</td><td>−1/2</td><td>−√3</td></tr>
                <tr><td>135°</td><td>3π/4</td><td>√2/2</td><td>−√2/2</td><td>−1</td></tr>
                <tr><td>150°</td><td>5π/6</td><td>1/2</td><td>−√3/2</td><td>−√3/3</td></tr>
                <tr><td>180°</td><td>π</td><td>0</td><td>−1</td><td>0</td></tr>
                <tr><td>270°</td><td>3π/2</td><td>−1</td><td>0</td><td>∞</td></tr>
                <tr><td>360°</td><td>2π</td><td>0</td><td>1</td><td>0</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 aplicaciones reales de la trigonometría</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🌊</span>
              <strong>Ondas y oscilaciones en física</strong>
              <p>El movimiento armónico simple (péndulo, resorte) se describe con seno y coseno: <code>x(t) = A·cos(ωt + φ)</code>. La posición del péndulo en cada instante es exactamente el coseno del ángulo en el círculo unitario.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>⚡</span>
              <strong>Corriente alterna en ingeniería eléctrica</strong>
              <p>La tensión doméstica es una función sinusoidal: <code>V(t) = 230·sin(2πft)</code> donde f = 50 Hz. Las rotaciones del alternador generan exactamente las coordenadas del círculo unitario a lo largo del tiempo.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🎮</span>
              <strong>Rotaciones en videojuegos y gráficos 3D</strong>
              <p>Rotar un punto (x, y) un ángulo θ en un videojuego o simulación 3D usa la fórmula: <code>x&apos; = x·cos θ − y·sin θ</code>, <code>y&apos; = x·sin θ + y·cos θ</code>. Millones de estas operaciones ocurren por segundo en cualquier motor gráfico.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🛰️</span>
              <strong>GPS y posicionamiento por satélite</strong>
              <p>Los satélites orbitan en trayectorias circulares o elípticas. Para calcular su posición desde la Tierra se usan ángulos en el círculo trigonométrico. Sin trigonometría no habría GPS, navegación aérea ni telefonía móvil.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre el círculo trigonométrico</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué el círculo tiene radio 1?</h4>
              <p>
                El radio unitario es una elección de <strong>normalización</strong> que simplifica al máximo.
                Al medir el radio = 1, el seno y el coseno valen directamente las coordenadas del punto
                (y no habría que dividir por el radio). Si el radio fuera <em>r</em>, tendríamos
                <code>sin θ = y/r</code> y <code>cos θ = x/r</code>. Con r = 1, la división desaparece:
                <code>sin θ = y</code> y <code>cos θ = x</code>.
              </p>
              <p className={styles.faqTip}>💡 Esta misma idea se usa en todas las matemáticas: normalizar para que las fórmulas sean más limpias.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo se define seno para ángulos mayores de 90°?</h4>
              <p>
                En el triángulo rectángulo, los ángulos son siempre menores de 90°. El círculo unitario extiende
                la definición: dado cualquier ángulo θ (incluso mayor de 360° o negativo), se calcula la posición
                del punto sobre la circunferencia y se lee su coordenada Y (sin θ) y su coordenada X (cos θ).
                Los signos cambian según el cuadrante: en el II cuadrante, sin &gt; 0 pero cos &lt; 0.
              </p>
              <p className={styles.faqTip}>💡 Prueba en el simulador: ve a 150°. Sin(150°) = 0,5 = sin(30°), pero cos(150°) = −cos(30°). ¡El triángulo rectángulo ya no es suficiente!</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es exactamente un radián?</h4>
              <p>
                Un radián es el ángulo que forma un arco de longitud igual al radio de la circunferencia.
                En el círculo unitario (radio = 1), un arco de longitud 1 corresponde exactamente a 1 rad ≈ 57,3°.
                La circunferencia completa (longitud = 2π·r = 2π) corresponde a 2π rad = 360°. Por eso
                <strong> π rad = 180°</strong>.
              </p>
              <p className={styles.faqTip}>💡 Los radianes son la unidad &quot;natural&quot; de los ángulos en matemáticas: simplifican derivadas (d/dθ sin θ = cos θ) y series de Taylor sin factores de conversión.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué tan(90°) no existe?</h4>
              <p>
                La tangente se define como <code>tan θ = sin θ / cos θ</code>. En 90°, <code>cos(90°) = 0</code>,
                por lo que estamos dividiendo entre cero, lo que no está definido. Geométricamente significa
                que la recta tangente al círculo en ese punto es vertical y nunca corta al eje X:
                &quot;se va al infinito&quot;. Lo mismo ocurre en 270°.
              </p>
              <p className={styles.faqTip}>💡 En la calculadora, si escribes tan(90°) verás &quot;Error&quot; o un número enorme (por error de redondeo). En este simulador mostramos ∞.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué relación hay entre el círculo unitario y los vectores?</h4>
              <p>
                Todo vector unitario (módulo = 1) puede escribirse como <code>(cos θ, sin θ)</code>, donde θ
                es el ángulo que forma con el eje X. El círculo unitario es el conjunto de todos los vectores
                unitarios posibles. Esta representación es fundamental en física (dirección de fuerzas), programación
                gráfica (normales de superficies) y probabilidad (distribución circular).
              </p>
              <p className={styles.faqTip}>💡 El producto escalar de dos vectores unitarios es exactamente cos θ, donde θ es el ángulo entre ellos. ¡El círculo unitario une trigonometría y álgebra vectorial!</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo usar el círculo unitario para calcular razones trigonométricas</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Localiza el ángulo en el círculo</strong>
                <p>Parte del semieje positivo de las X y gira en sentido antihorario el número de grados indicado. Si el ángulo es negativo, gira en sentido horario. Si supera 360°, da vueltas completas y continúa.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Marca el punto de intersección con el círculo</strong>
                <p>El radio en ese ángulo toca la circunferencia en un punto P = (x, y). Recuerda: el radio siempre mide 1, así que la distancia del centro al punto P es siempre 1.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Lee las coordenadas del punto</strong>
                <p>La coordenada X del punto es <strong>cos θ</strong> y la coordenada Y es <strong>sin θ</strong>. El signo depende del cuadrante: en el II cuadrante X es negativa (cos &lt; 0) y Y es positiva (sin &gt; 0).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula la tangente dividiendo</strong>
                <p><code>tan θ = sin θ / cos θ = y / x</code>. Si cos θ = 0 (ángulos 90° y 270°), la tangente no existe. En los cuadrantes I y III tan &gt; 0; en II y IV, tan &lt; 0.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con la identidad pitagórica</strong>
                <p>Siempre debe cumplirse <code>sin²θ + cos²θ = 1</code>. Esto es consecuencia directa del teorema de Pitágoras aplicado al triángulo que forma el radio con los ejes. Si tu resultado no satisface esta identidad, hay un error.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 trucos para memorizar los ángulos notables</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🖐️</span>
              <strong>El truco del dedo</strong>
              <p>Para sin: extiende la mano izquierda. El pulgar = 0°, índice = 30°, medio = 45°, anular = 60°, meñique = 90°. Dobla el dedo del ángulo; el número de dedos a la izquierda da el numerador de <code>√n/2</code> (n = 0,1,2,3,4). Para cos, inviértelo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>El triángulo 30-60-90</strong>
              <p>Un triángulo equilátero de lado 2 dividido por la altura da lados 1, √3, 2. Los ángulos 30° y 60° tienen sin/cos de 1/2 y √3/2 respectivamente. Dibújalo en el examen si tienes dudas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔲</span>
              <strong>El triángulo 45-45-90</strong>
              <p>Un cuadrado de lado 1 tiene diagonal √2. Dividiendo entre √2, el triángulo isósceles rectángulo tiene catetos 1 y √2 de hipotenusa, dando sin(45°) = cos(45°) = √2/2 ≈ 0,707. Es el único ángulo con sin = cos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Las simetrías de cuadrante</strong>
              <p>Si sabes los valores del primer cuadrante (0°, 30°, 45°, 60°, 90°), los demás cuadrantes son copias con signos cambiados. Ejemplo: sin(150°) = sin(30°) = 1/2, pero cos(150°) = −cos(30°) = −√3/2. El simulador te muestra estos signos en tiempo real.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes en trigonometría con el círculo unitario</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir seno con coseno</strong> — Seno = coordenada Y (vertical), coseno = coordenada X (horizontal). Una regla nemotécnica: &quot;SEN va arriba (Y) y COS va al lado (X)&quot;. Compruébalo en el simulador activando las proyecciones.</li>
            <li><strong>Olvidar el signo negativo en cuadrantes II, III y IV</strong> — cos es negativo en II y III; sin es negativo en III y IV; tan es negativa en II y IV. No asumas que las razones siempre son positivas fuera del primer cuadrante.</li>
            <li><strong>Mezclar grados y radianes en la calculadora</strong> — Si el problema pide sin(π/3) y la calculadora está en modo grados, obtendrás sin(1,047°) ≈ 0,0183 en vez de sin(60°) = 0,866. Siempre verifica el modo de la calculadora antes de calcular.</li>
            <li><strong>Creer que tan(90°) existe</strong> — La tangente en 90° y 270° no está definida (denominador cero). Si tu calculadora devuelve un número, es un error numérico por aproximación de punto flotante. El resultado matemático correcto es &quot;no existe&quot; (∞).</li>
            <li><strong>No reducir ángulos mayores de 360°</strong> — sin(390°) = sin(30°) porque 390° = 360° + 30°. La función trigonométrica tiene periodo 360° (o 2π rad): sin(θ + 360°) = sin(θ). Reducir el ángulo al rango [0°, 360°] antes de calcular evita confusiones.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-trigonometria-circulo-unitario')} />
      <ShareCard appName="simulador-trigonometria-circulo-unitario" />
      <Footer appName="simulador-trigonometria-circulo-unitario" />
    </div>
  );
}
