'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './SimuladorFuncionesTransformaciones.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type FuncionBase = 'sin' | 'cos' | 'cuadratica' | 'absoluto' | 'raiz';

interface ConfigFuncion {
  id: FuncionBase;
  etiqueta: string;
  simbolo: string;
  icono: string;
}

// ============================================
// CONSTANTES
// ============================================
const FUNCIONES_BASE: ConfigFuncion[] = [
  { id: 'sin', etiqueta: 'sin(x)', simbolo: 'sin', icono: '〜' },
  { id: 'cos', etiqueta: 'cos(x)', simbolo: 'cos', icono: '〰' },
  { id: 'cuadratica', etiqueta: 'x²', simbolo: 'x²', icono: '⌒' },
  { id: 'absoluto', etiqueta: '|x|', simbolo: '|x|', icono: '∧' },
  { id: 'raiz', etiqueta: '√x', simbolo: '√x', icono: '√' },
];

// ============================================
// FUNCIONES MATEMÁTICAS
// ============================================

function evaluarBase(tipo: FuncionBase, x: number): number {
  switch (tipo) {
    case 'sin': return Math.sin(x);
    case 'cos': return Math.cos(x);
    case 'cuadratica': return x * x;
    case 'absoluto': return Math.abs(x);
    case 'raiz': return x >= 0 ? Math.sqrt(x) : NaN;
  }
}

function evaluarTransformada(tipo: FuncionBase, a: number, b: number, c: number, d: number, x: number): number {
  const bSafe = b === 0 ? 0.001 : b;
  const inner = bSafe * (x - c);
  const base = evaluarBase(tipo, inner);
  if (isNaN(base)) return NaN;
  return a * base + d;
}

function fmtParam(valor: number): string {
  if (valor === Math.floor(valor)) return String(valor);
  return valor.toFixed(1).replace('.', ',');
}

function construirEcuacion(funcBase: FuncionBase, a: number, b: number, c: number, d: number): string {
  const config = FUNCIONES_BASE.find(f => f.id === funcBase);
  const simbolo = config?.simbolo ?? funcBase;

  const aStr = a === 1 ? '' : a === -1 ? '-' : `${fmtParam(a)}·`;
  const bSafe = b === 0 ? 0.001 : b;
  const bStr = bSafe === 1 ? '' : bSafe === -1 ? '-' : `${fmtParam(bSafe)}·`;
  const cStr = c === 0 ? 'x' : c > 0 ? `(x − ${fmtParam(c)})` : `(x + ${fmtParam(Math.abs(c))})`;
  const dStr = d === 0 ? '' : d > 0 ? ` + ${fmtParam(d)}` : ` − ${fmtParam(Math.abs(d))}`;

  let argumento: string;
  if (funcBase === 'cuadratica') {
    argumento = c === 0 ? `${bStr}x` : `(${bStr}${cStr})`;
    if (bSafe === 1 && c !== 0) argumento = cStr;
    if (bSafe === 1 && c === 0) argumento = 'x';
    return `f(x) = ${aStr}${argumento}²${dStr}`;
  }
  if (funcBase === 'absoluto') {
    argumento = c === 0 ? `${bStr}x` : `${bStr}${cStr}`;
    if (bSafe === 1 && c !== 0) argumento = cStr;
    if (bSafe === 1 && c === 0) argumento = 'x';
    return `f(x) = ${aStr}|${argumento}|${dStr}`;
  }
  if (funcBase === 'raiz') {
    argumento = c === 0 ? `${bStr}x` : `${bStr}${cStr}`;
    if (bSafe === 1 && c !== 0) argumento = cStr;
    if (bSafe === 1 && c === 0) argumento = 'x';
    return `f(x) = ${aStr}√(${argumento})${dStr}`;
  }

  // sin/cos
  argumento = c === 0 ? `${bStr}x` : `${bStr}${cStr}`;
  if (bSafe === 1 && c !== 0) argumento = cStr;
  if (bSafe === 1 && c === 0) argumento = 'x';
  return `f(x) = ${aStr}${simbolo}(${argumento})${dStr}`;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SimuladorFuncionesTransformacionesPage() {
  const [funcBase, setFuncBase] = useState<FuncionBase>('sin');
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);
  const [d, setD] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================
  // FUNCIÓN DE DIBUJO
  // ============================================
  const dibujar = useCallback(() => {
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
    const pad = { top: 30, right: 30, bottom: 40, left: 50 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Detectar dark mode
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorBg = isDark ? '#2A2A2A' : '#FAFAFA';
    const colorGrid = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const colorAxis = isDark ? '#888' : '#555';
    const colorText = isDark ? '#CCCCCC' : '#444';
    const colorBase = isDark ? 'rgba(200,200,200,0.35)' : 'rgba(120,120,120,0.4)';
    const colorTransf = '#2E86AB';

    const X_MIN = -10;
    const X_MAX = 10;
    const Y_MIN = -8;
    const Y_MAX = 8;

    const xToPx = (x: number) => pad.left + ((x - X_MIN) / (X_MAX - X_MIN)) * plotW;
    const yToPx = (y: number) => pad.top + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * plotH;

    // Fondo
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, W, H);

    // === CUADRÍCULA ===
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    for (let xi = X_MIN; xi <= X_MAX; xi++) {
      const px = xToPx(xi);
      ctx.beginPath();
      ctx.moveTo(px, pad.top);
      ctx.lineTo(px, pad.top + plotH);
      ctx.stroke();
    }
    for (let yi = Y_MIN; yi <= Y_MAX; yi++) {
      const py = yToPx(yi);
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(pad.left + plotW, py);
      ctx.stroke();
    }

    // === EJE Y ===
    const ejeYpx = xToPx(0);
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ejeYpx, pad.top);
    ctx.lineTo(ejeYpx, pad.top + plotH);
    ctx.stroke();

    // === EJE X ===
    const ejeXpx = yToPx(0);
    ctx.beginPath();
    ctx.moveTo(pad.left, ejeXpx);
    ctx.lineTo(pad.left + plotW, ejeXpx);
    ctx.stroke();

    // === ETIQUETAS EJES ===
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let xi = X_MIN; xi <= X_MAX; xi += 2) {
      if (xi === 0) continue;
      const px = xToPx(xi);
      ctx.fillText(String(xi), px, ejeXpx + 16);
    }
    ctx.textAlign = 'right';
    for (let yi = Y_MIN; yi <= Y_MAX; yi += 2) {
      if (yi === 0) continue;
      const py = yToPx(yi);
      ctx.fillText(String(yi), ejeYpx - 6, py + 4);
    }

    // Origen
    ctx.textAlign = 'right';
    ctx.fillText('0', ejeYpx - 6, ejeXpx + 14);

    // === FUNCIÓN BASE (gris semitransparente) ===
    ctx.strokeStyle = colorBase;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    const N = 600;
    let primeroBase = true;
    for (let i = 0; i <= N; i++) {
      const xv = X_MIN + (X_MAX - X_MIN) * (i / N);
      const yv = evaluarBase(funcBase, xv);
      if (isNaN(yv) || !isFinite(yv)) { primeroBase = true; continue; }
      const px = xToPx(xv);
      const py = yToPx(Math.max(Y_MIN - 1, Math.min(Y_MAX + 1, yv)));
      if (primeroBase) { ctx.moveTo(px, py); primeroBase = false; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // === FUNCIÓN TRANSFORMADA (azul meskeIA) ===
    ctx.strokeStyle = colorTransf;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let primeroTransf = true;
    for (let i = 0; i <= N; i++) {
      const xv = X_MIN + (X_MAX - X_MIN) * (i / N);
      const yv = evaluarTransformada(funcBase, a, b, c, d, xv);
      if (isNaN(yv) || !isFinite(yv)) { primeroTransf = true; continue; }
      const px = xToPx(xv);
      const py = yToPx(Math.max(Y_MIN - 1, Math.min(Y_MAX + 1, yv)));
      if (primeroTransf) { ctx.moveTo(px, py); primeroTransf = false; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // === PUNTO ORIGEN DE TRANSFORMACIÓN (c, d) ===
    if (c !== 0 || d !== 0) {
      const pxO = xToPx(c);
      const pyO = yToPx(d);
      if (pxO >= pad.left && pxO <= pad.left + plotW && pyO >= pad.top && pyO <= pad.top + plotH) {
        ctx.fillStyle = '#48A9A6';
        ctx.beginPath();
        ctx.arc(pxO, pyO, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = isDark ? '#1A1A1A' : '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // === ETIQUETA ECUACIÓN (top-right) ===
    const ecuacion = construirEcuacion(funcBase, a, b, c, d);
    const paddingLabel = 10;
    const labelX = pad.left + plotW - paddingLabel;
    const labelY = pad.top + paddingLabel;
    ctx.font = 'bold 13px system-ui, monospace';
    const textWidth = ctx.measureText(ecuacion).width;

    ctx.fillStyle = isDark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.90)';
    ctx.beginPath();
    ctx.roundRect(labelX - textWidth - 10, labelY - 2, textWidth + 20, 24, 4);
    ctx.fill();

    ctx.fillStyle = colorTransf;
    ctx.textAlign = 'right';
    ctx.fillText(ecuacion, labelX, labelY + 15);

  }, [funcBase, a, b, c, d]);

  useEffect(() => {
    dibujar();
  }, [dibujar]);

  useEffect(() => {
    const handleResize = () => dibujar();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujar]);

  // Re-dibujar cuando cambia el tema
  useEffect(() => {
    const observer = new MutationObserver(dibujar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujar]);

  // ============================================
  // HELPERS DE UI
  // ============================================
  const restablecer = () => {
    setA(1);
    setB(1);
    setC(0);
    setD(0);
  };

  const descripcionA = (): string => {
    if (a === 1) return 'Sin cambio (amplitud normal)';
    if (a > 0) return `Amplitud ×${fmtParam(a)} — la gráfica se estira verticalmente`;
    if (a < 0 && a > -1) return `Amplitud ×${fmtParam(Math.abs(a))} con reflexión — la gráfica se comprime y voltea`;
    return `Amplitud ×${fmtParam(Math.abs(a))} con reflexión — la gráfica se estira y voltea verticalmente`;
  };

  const descripcionB = (): string => {
    const bSafe = b === 0 ? 0.001 : b;
    if (bSafe === 1) return 'Sin cambio (frecuencia normal)';
    const abs = Math.abs(bSafe);
    const reflexion = bSafe < 0 ? ' con reflexión horizontal' : '';
    if (abs > 1) return `Frecuencia ×${fmtParam(abs)} — la gráfica se comprime horizontalmente${reflexion}`;
    return `Período ×${fmtParam(Number((1 / abs).toFixed(1)))} — la gráfica se estira horizontalmente${reflexion}`;
  };

  const descripcionC = (): string => {
    if (c === 0) return 'Sin desfase horizontal';
    if (c > 0) return `Desfase +${fmtParam(c)} — la gráfica se desplaza ${fmtParam(c)} unidades a la derecha`;
    return `Desfase ${fmtParam(c)} — la gráfica se desplaza ${fmtParam(Math.abs(c))} unidades a la izquierda`;
  };

  const descripcionD = (): string => {
    if (d === 0) return 'Sin desfase vertical';
    if (d > 0) return `Desfase +${fmtParam(d)} — la gráfica se desplaza ${fmtParam(d)} unidades hacia arriba`;
    return `Desfase ${fmtParam(d)} — la gráfica se desplaza ${fmtParam(Math.abs(d))} unidades hacia abajo`;
  };

  const ecuacionActual = construirEcuacion(funcBase, a, b, c, d);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📐</span> Simulador de Transformaciones de Funciones</h1>
        <p className={styles.subtitle}>
          Observa en tiempo real cómo los parámetros <strong>a</strong>, <strong>b</strong>, <strong>c</strong> y <strong>d</strong> transforman
          cualquier función base mediante <code>f(x) = a · g(b·(x − c)) + d</code>.
        </p>
      </header>

      <LegalNotice />

      {/* === SELECTOR DE FUNCIÓN BASE === */}
      <div className={styles.funcSelector}>
        {FUNCIONES_BASE.map(f => (
          <button
            key={f.id}
            type="button"
            className={`${styles.funcBtn} ${funcBase === f.id ? styles.funcBtnActive : ''}`}
            onClick={() => setFuncBase(f.id)}
            aria-pressed={funcBase === f.id}
          >
            <span className={styles.funcIcon} aria-hidden="true">{f.icono}</span>
            <span className={styles.funcLabel}>{f.etiqueta}</span>
          </button>
        ))}
      </div>

      {/* === CANVAS === */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label={`Gráfica de transformación de función: ${ecuacionActual}`}
        />
      </div>

      {/* === SLIDERS === */}
      <div className={styles.slidersGrid}>
        {/* Slider a */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-a">
            <span className={styles.paramName} style={{ color: '#2E86AB' }}>a</span> — Escala vertical / amplitud
          </label>
          <div className={styles.sliderRow}>
            <input
              id="slider-a"
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={a}
              onChange={e => setA(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Parámetro a: escala vertical"
            />
            <span className={styles.sliderValue}>{fmtParam(a)}</span>
          </div>
        </div>

        {/* Slider b */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-b">
            <span className={styles.paramName} style={{ color: '#48A9A6' }}>b</span> — Escala horizontal / frecuencia
          </label>
          <div className={styles.sliderRow}>
            <input
              id="slider-b"
              type="range"
              min={-3}
              max={3}
              step={0.1}
              value={b}
              onChange={e => {
                const val = parseFloat(e.target.value);
                // Evitar exactamente 0
                setB(val === 0 ? 0.1 : val);
              }}
              className={styles.slider}
              aria-label="Parámetro b: escala horizontal"
            />
            <span className={styles.sliderValue}>{fmtParam(b)}</span>
          </div>
        </div>

        {/* Slider c */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-c">
            <span className={styles.paramName} style={{ color: '#7FB3D3' }}>c</span> — Desfase horizontal / traslación
          </label>
          <div className={styles.sliderRow}>
            <input
              id="slider-c"
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={c}
              onChange={e => setC(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Parámetro c: desfase horizontal"
            />
            <span className={styles.sliderValue}>{fmtParam(c)}</span>
          </div>
        </div>

        {/* Slider d */}
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-d">
            <span className={styles.paramName} style={{ color: '#1a5278' }}>d</span> — Desfase vertical
          </label>
          <div className={styles.sliderRow}>
            <input
              id="slider-d"
              type="range"
              min={-5}
              max={5}
              step={0.1}
              value={d}
              onChange={e => setD(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Parámetro d: desfase vertical"
            />
            <span className={styles.sliderValue}>{fmtParam(d)}</span>
          </div>
        </div>
      </div>

      {/* === PANEL DE RESULTADOS === */}
      <div className={styles.ecuacionPanel}>
        <div className={styles.ecuacionFormula} aria-live="polite">{ecuacionActual}</div>

        <ul className={styles.parametrosList}>
          <li className={styles.parametroItem}>
            <span className={styles.paramTag} style={{ background: '#2E86AB' }}>a = {fmtParam(a)}</span>
            <span>{descripcionA()}</span>
          </li>
          <li className={styles.parametroItem}>
            <span className={styles.paramTag} style={{ background: '#48A9A6' }}>b = {fmtParam(b)}</span>
            <span>{descripcionB()}</span>
          </li>
          <li className={styles.parametroItem}>
            <span className={styles.paramTag} style={{ background: '#7FB3D3' }}>c = {fmtParam(c)}</span>
            <span>{descripcionC()}</span>
          </li>
          <li className={styles.parametroItem}>
            <span className={styles.paramTag} style={{ background: '#1a5278' }}>d = {fmtParam(d)}</span>
            <span>{descripcionD()}</span>
          </li>
        </ul>

        <div className={styles.leyendaRow}>
          <span className={styles.leyendaBase}>— Función base g(x)</span>
          <span className={styles.leyendaTransf}>— Función transformada f(x)</span>
        </div>

        <button type="button" className={styles.btnReset} onClick={restablecer} aria-label="Restablecer todos los parámetros">
          Restablecer todo
        </button>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="Aprende sobre las Transformaciones de Funciones"
        subtitle="Cómo a, b, c y d modifican cualquier gráfica"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué son las transformaciones de funciones?</h3>
          <p>
            Cuando tenemos una función base <strong>g(x)</strong> — como el seno, la parábola o el valor absoluto —
            podemos construir infinitas variantes aplicando cuatro tipos de transformaciones. La fórmula general es:
          </p>
          <div className={styles.formulaBox}>
            f(x) = a · g(b · (x − c)) + d
          </div>
          <p>
            Cada parámetro actúa de forma independiente sobre la gráfica: <strong>a</strong> escala verticalmente,
            <strong> b</strong> escala horizontalmente, <strong>c</strong> desplaza de izquierda a derecha
            y <strong>d</strong> desplaza hacia arriba o abajo. Entender esto de forma visual es la clave para
            dominar el análisis de funciones en secundaria, preparatoria y más allá.
          </p>
          <p>
            El punto especial <strong>(c, d)</strong> marca el nuevo "origen" de la función transformada:
            el lugar al que se desplaza el centro o el vértice de la función base.
          </p>
        </section>

        {/* TABLA COMPARATIVA */}
        <section>
          <h3>Los 4 parámetros de transformación</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Nombre</th>
                  <th>Efecto sobre la gráfica</th>
                  <th>Ejemplo concreto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#2E86AB' }}>a</strong></td>
                  <td>Escala vertical / amplitud</td>
                  <td>Estira (|a|&gt;1) o comprime (0&lt;|a|&lt;1) verticalmente. Si a&lt;0, también refleja respecto al eje X.</td>
                  <td>a=2 → duplica la altura; a=−1 → invierte la gráfica</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#48A9A6' }}>b</strong></td>
                  <td>Escala horizontal / frecuencia</td>
                  <td>Comprime (|b|&gt;1) o estira (0&lt;|b|&lt;1) horizontalmente. Si b&lt;0, refleja respecto al eje Y.</td>
                  <td>b=2 → período a la mitad; b=0,5 → período doble</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#7FB3D3' }}>c</strong></td>
                  <td>Desfase horizontal</td>
                  <td>Desplaza la gráfica a la derecha (c&gt;0) o a la izquierda (c&lt;0).</td>
                  <td>c=3 → desplaza 3 unidades a la derecha</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#1a5278' }}>d</strong></td>
                  <td>Desfase vertical</td>
                  <td>Sube (d&gt;0) o baja (d&lt;0) toda la gráfica.</td>
                  <td>d=−2 → baja la gráfica 2 unidades</td>
                </tr>
                <tr>
                  <td><strong>(c, d)</strong></td>
                  <td>Punto de referencia</td>
                  <td>El nuevo "centro" u origen de la gráfica transformada.</td>
                  <td>Para x², el vértice se mueve a (c, d)</td>
                </tr>
                <tr>
                  <td>a=b=1, c=d=0</td>
                  <td>Identidad</td>
                  <td>La función transformada coincide con la función base.</td>
                  <td>f(x) = g(x) — sin cambios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios reales donde aparecen estas transformaciones</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎵</span>
              <strong>Señales de audio</strong>
              <p>
                En ingeniería de sonido, <strong>a</strong> controla el volumen (amplitud de onda),
                <strong> b</strong> determina la frecuencia (tono agudo/grave) y <strong>c</strong> ajusta
                la fase. Sumar señales transformadas produce acordes y efectos de eco.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🌊</span>
              <strong>Física de ondas</strong>
              <p>
                Las ondas mecánicas y electromagnéticas se describen como
                <code> A·sin(ω(t − φ)) + offset</code>, exactamente nuestro patrón.
                <strong> a</strong> es la amplitud, <strong>b</strong> la frecuencia angular (ω),
                <strong> c</strong> el desfase (φ) y <strong>d</strong> el nivel de reposo.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📈</span>
              <strong>Modelado de poblaciones</strong>
              <p>
                El crecimiento y las oscilaciones estacionales de poblaciones (depredador-presa)
                se aproximan con funciones sinusoidales transformadas. <strong>d</strong> fija
                la población media y <strong>a</strong> la magnitud de las fluctuaciones.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🔬</span>
              <strong>Calibración de instrumentos</strong>
              <p>
                Sensores y termómetros aplican transformaciones lineales (parámetros equivalentes
                a <strong>a</strong> y <strong>d</strong>) para convertir la señal bruta en la
                magnitud física real. La escala Fahrenheit es una transformación afín de Celsius.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre transformaciones</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué b comprime horizontalmente si es mayor que 1?</h4>
              <p>
                Porque la función evalúa <code>g(b·x)</code>: para obtener el mismo valor de g que
                antes necesitabas en x=T, ahora basta con x=T/b. Si b=2, cada ciclo ocurre en la
                mitad del espacio → gráfica comprimida. Parece contraintuitivo porque actúa
                "dentro" del argumento.
              </p>
              <p className={styles.faqTip}>
                💡 Truco: b actúa sobre el eje X como el denominador de una fracción.
                b=2 → período/2. b=1/3 → período×3.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué c positivo desplaza a la derecha, no a la izquierda?</h4>
              <p>
                La función evalúa <code>g(x − c)</code>. Para que el argumento sea 0 (donde está
                el "centro" de la función base), necesitamos x=c. Por tanto, el punto central se
                ha movido a x=c, que está a la derecha del origen si c&gt;0.
              </p>
              <p className={styles.faqTip}>
                💡 Regla: el signo externo del c en la fórmula indica la dirección del desplazamiento.
                (x−3) → desplaza +3 a la derecha. (x+3) → desplaza 3 a la izquierda.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si a es negativo?</h4>
              <p>
                El factor <code>a&lt;0</code> provoca una <strong>reflexión respecto al eje X</strong>:
                los máximos pasan a ser mínimos y viceversa. Además, si |a|≠1, también hay escalado.
                Por ejemplo, a=−2 duplica la amplitud Y refleja la gráfica.
              </p>
              <p className={styles.faqTip}>
                💡 Para sin(x): a=−1 convierte máximos en mínimos. El seno "se voltea".
                Equivale a multiplicar todos los valores Y por −1.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Y si b es negativo?</h4>
              <p>
                <code>b&lt;0</code> produce una <strong>reflexión respecto al eje Y</strong> además
                del escalado horizontal. Para funciones simétricas como sin y cos, la reflexión no
                cambia la forma visual (sin es impar: sin(−x)=−sin(x); cos es par: cos(−x)=cos(x)).
                Para la raíz o la parábola asimétrica sí se aprecia el cambio.
              </p>
              <p className={styles.faqTip}>
                💡 Para x²: b=−1 no cambia la gráfica porque (−x)²=x². Pero para √x sí: la raíz
                se refleja y solo existe para x≤0.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo afectan las transformaciones a los ceros de la función?</h4>
              <p>
                Los ceros de f(x) = a·g(b·(x−c))+d ya no coinciden con los de g(x).
                El nuevo cero requiere resolver <code>a·g(b·(x−c))+d = 0</code>, es decir,
                <code> g(b·(x−c)) = −d/a</code>. Si |d/a| excede el rango de g, la función
                transformada no tiene ceros reales.
              </p>
              <p className={styles.faqTip}>
                💡 Ejemplo: sin(x) tiene infinitos ceros. Pero 2·sin(x)+3 no tiene ninguno,
                porque 2·sin(x) oscila entre −2 y +2 y nunca alcanza −3.
              </p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo identificar la función transformada a partir de su gráfica</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica la función base</strong>
                <p>
                  Observa la forma general: ¿es acampanada/sinusoidal? → sin o cos.
                  ¿En forma de U? → cuadrática. ¿Forma de V? → valor absoluto.
                  ¿Solo para x≥0 y creciente? → raíz cuadrada.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Localiza el punto de referencia (c, d)</strong>
                <p>
                  Busca el vértice (parábola, valor absoluto), el punto de inicio (raíz),
                  o el punto de cruce central (sin/cos). Ese punto es (c, d): el desplazamiento
                  del origen de la función base.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Mide la amplitud (a)</strong>
                <p>
                  Para sin/cos: a = (valor máximo − valor mínimo) / 2. Para parábola o raíz,
                  compara el ritmo de crecimiento con la función base. Si la gráfica está invertida, a es negativo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula el factor horizontal (b)</strong>
                <p>
                  Para funciones periódicas: b = período_base / período_observado. Para sin/cos,
                  el período base es 2π ≈ 6,28. Si el período observado es 3, entonces b ≈ 6,28/3 ≈ 2,1.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con un punto concreto</strong>
                <p>
                  Toma un punto visible de la gráfica (x₀, y₀) y comprueba que
                  a·g(b·(x₀−c))+d ≈ y₀. Si no cuadra, revisa el signo de b o c.
                  Un punto bien elegido suele ser el máximo o el paso por cero.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 trucos para recordar el efecto de cada parámetro</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <strong>a actúa sobre Y, b sobre X</strong>
              <p>
                Fácil de recordar: a está "fuera" de g (afecta al resultado → Y),
                b está "dentro" de g (afecta al argumento → X). Los parámetros exteriores
                actúan en el eje de salida, los interiores en el de entrada.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <strong>b invierte el efecto esperado</strong>
              <p>
                Doblar b comprime (no estira) horizontalmente. Reducir b a la mitad estira.
                Es lo opuesto de la intuición. Memorízalo con la frase: "b grande = función
                apretada; b pequeño = función extendida".
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">➡️</span>
              <strong>El signo de c indica la dirección exacta del desplazamiento</strong>
              <p>
                El subtractor (x − c) hace que c&gt;0 desplace a la derecha.
                Piénsalo así: "el signo que ves en la fórmula es la dirección".
                (x − 3) → +3 unidades a la derecha.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⬆️</span>
              <strong>d es la más intuitiva de todas</strong>
              <p>
                d sube o baja la gráfica entera sin deformarla. Es la única transformación
                que no cambia ni la forma ni la anchura. Si d=5, suma 5 a cada valor Y.
                Útil para ajustar el nivel base de una señal.
              </p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes al trabajar con transformaciones</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir compresión vertical con horizontal</strong> — a&gt;1 estira
              verticalmente (más alto), pero b&gt;1 comprime horizontalmente (más estrecho). Son
              efectos opuestos aunque ambos "amplían" en cierto sentido.
            </li>
            <li>
              <strong>El signo de c al desplazar</strong> — c=+3 desplaza a la DERECHA, no a la izquierda.
              El error más común en exámenes es invertir el desplazamiento horizontal.
            </li>
            <li>
              <strong>No aplicar el factor b antes que c</strong> — La fórmula es b·(x−c),
              no (b·x)−c. Si distribuyes mal el paréntesis, obtendrás una función diferente con
              un desfase incorrecto.
            </li>
            <li>
              <strong>Olvidar que √x no está definida para x negativo</strong> — Al transformar √x
              con c≠0, el dominio también se desplaza: la función transformada empieza en x=c,
              no en x=0. Esto afecta al dominio de la función resultante.
            </li>
            <li>
              <strong>Asumir que b negativo siempre cambia la forma</strong> — Para funciones pares
              (cos, x²) con b=−1 la gráfica parece idéntica porque f(−x)=f(x). Solo en funciones
              impares (sin, x³) o no simétricas (raíz) se aprecia la reflexión horizontal.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-funciones-transformaciones')} />
      <ShareCard appName="simulador-funciones-transformaciones" />
      <Footer appName="simulador-funciones-transformaciones" />
    </div>
  );
}
