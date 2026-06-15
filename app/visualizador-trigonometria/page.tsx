'use client';
// @disclaimer: exempt

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './Trigonometria.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ======== TIPOS ========
type FuncionTrig = 'sin' | 'cos' | 'tan';
type TabActiva = 'circulo' | 'grafica' | 'tabla' | 'identidades';

interface EstadoCirculo {
  angulo: number; // grados
}

interface EstadoGrafica {
  amplitud: number;
  frecuencia: number;
  fase: number; // radianes (0-2π)
  funcion: FuncionTrig;
}

// ======== CONSTANTES ========
const ANGULOS_NOTABLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];

const VALORES_EXACTOS: Record<number, { sin: string; cos: string; tan: string }> = {
  0:   { sin: '0',       cos: '1',       tan: '0' },
  30:  { sin: '1/2',     cos: '√3/2',    tan: '√3/3' },
  45:  { sin: '√2/2',    cos: '√2/2',    tan: '1' },
  60:  { sin: '√3/2',    cos: '1/2',     tan: '√3' },
  90:  { sin: '1',       cos: '0',       tan: '∞' },
  120: { sin: '√3/2',    cos: '−1/2',    tan: '−√3' },
  135: { sin: '√2/2',    cos: '−√2/2',   tan: '−1' },
  150: { sin: '1/2',     cos: '−√3/2',   tan: '−√3/3' },
  180: { sin: '0',       cos: '−1',      tan: '0' },
  210: { sin: '−1/2',    cos: '−√3/2',   tan: '√3/3' },
  225: { sin: '−√2/2',   cos: '−√2/2',   tan: '1' },
  240: { sin: '−√3/2',   cos: '−1/2',    tan: '√3' },
  270: { sin: '−1',      cos: '0',       tan: '∞' },
  300: { sin: '−√3/2',   cos: '1/2',     tan: '−√3' },
  315: { sin: '−√2/2',   cos: '√2/2',    tan: '−1' },
  330: { sin: '−1/2',    cos: '√3/2',    tan: '−√3/3' },
  360: { sin: '0',       cos: '1',       tan: '0' },
};

// ======== HELPERS ========
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function formatNum(n: number): string {
  if (!isFinite(n)) return '∞';
  const abs = Math.abs(n);
  if (abs < 1e-10) return '0,000';
  return n.toFixed(3).replace('.', ',');
}

// ======== COMPONENTE: CÍRCULO UNITARIO ========
function CirculoUnitario({ angulo, mostrarIdentidades }: { angulo: number; mostrarIdentidades: boolean }) {
  const rad = degToRad(angulo);
  const cx = 150;
  const cy = 150;
  const r = 100;

  const px = cx + r * Math.cos(rad);
  const py = cy - r * Math.sin(rad); // SVG invierte Y

  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const tanVal = Math.tan(rad);
  const tanFinito = isFinite(tanVal) && Math.abs(tanVal) < 5;

  // Punto de proyección en X (para cos)
  const projX = { x: px, y: cy };
  // Punto de proyección en Y (para sin)
  const projY = { x: cx, y: py };

  // Tangente: punto en la recta x=r (para el segmento tangente)
  const tanY = cy - r * tanVal;
  const tanPx = cx + r;

  return (
    <svg viewBox="0 0 300 300" className={styles.svgCirculo} aria-label="Círculo unitario interactivo">
      {/* Cuadrado de la identidad (modo identidades) */}
      {mostrarIdentidades && (
        <g opacity="0.25">
          <rect
            x={cx}
            y={py}
            width={px - cx}
            height={cy - py}
            fill="#2E86AB"
            className={styles.identityRect}
          />
          <rect
            x={px}
            y={cy}
            width={cx + r - px}
            height={r}
            fill="#48A9A6"
            className={styles.identityRect}
          />
        </g>
      )}

      {/* Ejes */}
      <line x1={cx - r - 20} y1={cy} x2={cx + r + 20} y2={cy} stroke="var(--text-secondary)" strokeWidth="1" opacity="0.5" />
      <line x1={cx} y1={cy - r - 20} x2={cx} y2={cy + r + 20} stroke="var(--text-secondary)" strokeWidth="1" opacity="0.5" />

      {/* Etiquetas de ejes */}
      <text x={cx + r + 22} y={cy + 4} fontSize="10" fill="var(--text-secondary)" fontFamily="sans-serif">1</text>
      <text x={cx - r - 22} y={cy + 4} fontSize="10" fill="var(--text-secondary)" fontFamily="sans-serif" textAnchor="end">−1</text>
      <text x={cx + 2} y={cy - r - 12} fontSize="10" fill="var(--text-secondary)" fontFamily="sans-serif">1</text>
      <text x={cx + 2} y={cy + r + 16} fontSize="10" fill="var(--text-secondary)" fontFamily="sans-serif">−1</text>

      {/* Círculo unitario */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.4" />

      {/* Proyección coseno (horizontal) */}
      <line x1={cx} y1={cy} x2={projX.x} y2={cy} stroke="#48A9A6" strokeWidth="2.5" strokeDasharray="4 2" />
      <text
        x={(cx + projX.x) / 2}
        y={cy + 14}
        fontSize="11"
        fill="#48A9A6"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        cos={formatNum(cosVal)}
      </text>

      {/* Proyección seno (vertical) */}
      <line x1={px} y1={py} x2={px} y2={cy} stroke="#2E86AB" strokeWidth="2.5" strokeDasharray="4 2" />
      <text
        x={px + (cosVal >= 0 ? 8 : -8)}
        y={(py + cy) / 2}
        fontSize="11"
        fill="#2E86AB"
        fontWeight="bold"
        textAnchor={cosVal >= 0 ? 'start' : 'end'}
        fontFamily="sans-serif"
      >
        sin={formatNum(sinVal)}
      </text>

      {/* Línea radio */}
      <line x1={cx} y1={cy} x2={px} y2={py} stroke="#7FB3D3" strokeWidth="2" />

      {/* Tangente */}
      {tanFinito && Math.abs(cosVal) > 0.01 && (
        <line
          x1={tanPx}
          y1={cy}
          x2={tanPx}
          y2={tanY}
          stroke="#E8A838"
          strokeWidth="2"
          aria-label="Tangente"
        />
      )}
      {tanFinito && Math.abs(cosVal) > 0.01 && (
        <text
          x={tanPx + 6}
          y={(cy + tanY) / 2}
          fontSize="10"
          fill="#E8A838"
          fontWeight="bold"
          textAnchor="start"
          fontFamily="sans-serif"
        >
          tan={formatNum(tanVal)}
        </text>
      )}

      {/* Arco de ángulo */}
      {angulo > 0 && angulo < 360 && (
        <path
          d={describeArc(cx, cy, 28, 0, Math.min(angulo, 359.9))}
          fill="none"
          stroke="#7FB3D3"
          strokeWidth="1.5"
          opacity="0.7"
        />
      )}

      {/* Etiqueta ángulo */}
      <text
        x={cx + 36}
        y={cy - 6}
        fontSize="12"
        fill="#7FB3D3"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        {angulo}°
      </text>

      {/* Punto en el círculo */}
      <circle cx={px} cy={py} r={6} fill="#2E86AB" stroke="white" strokeWidth="2" />
    </svg>
  );
}

// Helper para arco SVG
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = { x: cx + r * Math.cos(degToRad(startDeg)), y: cy - r * Math.sin(degToRad(startDeg)) };
  const end = { x: cx + r * Math.cos(degToRad(endDeg)), y: cy - r * Math.sin(degToRad(endDeg)) };
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

// ======== COMPONENTE: GRÁFICA DE FUNCIONES ========
function GraficaFunciones({ angulo, config }: { angulo: number; config: EstadoGrafica }) {
  const W = 560;
  const H = 200;
  const padX = 36;
  const padY = 20;
  const plotW = W - padX * 2;
  const plotH = H - padY * 2;

  const { amplitud, frecuencia, fase, funcion } = config;

  // Construir path de la función
  const numPuntos = 400;
  const xRange = 2 * Math.PI; // de 0 a 2π
  const yMax = funcion === 'tan' ? 3 : amplitud;
  const yMin = -yMax;
  const yRange = yMax - yMin;

  const puntos: { x: number; y: number; valid: boolean }[] = [];
  for (let i = 0; i <= numPuntos; i++) {
    const t = (i / numPuntos) * xRange;
    const xPx = padX + (t / xRange) * plotW;

    let val: number;
    if (funcion === 'sin') {
      val = amplitud * Math.sin(frecuencia * t + fase);
    } else if (funcion === 'cos') {
      val = amplitud * Math.cos(frecuencia * t + fase);
    } else {
      val = amplitud * Math.tan(frecuencia * t + fase);
    }

    const valid = isFinite(val) && Math.abs(val) <= yMax * 1.1;
    const yPx = padY + plotH - ((val - yMin) / yRange) * plotH;
    puntos.push({ x: xPx, y: yPx, valid });
  }

  // Construir segmentos (cortar en discontinuidades)
  const segmentos: string[] = [];
  let segActual = '';
  for (let i = 0; i < puntos.length; i++) {
    const p = puntos[i];
    if (!p.valid) {
      if (segActual) segmentos.push(segActual);
      segActual = '';
      continue;
    }
    if (segActual === '') {
      segActual = `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    } else {
      segActual += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }
  }
  if (segActual) segmentos.push(segActual);

  // Marcador del ángulo actual en la gráfica
  const t0 = degToRad(angulo);
  const xMark = padX + ((t0 % (2 * Math.PI)) / xRange) * plotW;
  let yMarkVal: number;
  if (funcion === 'sin') yMarkVal = amplitud * Math.sin(frecuencia * t0 + fase);
  else if (funcion === 'cos') yMarkVal = amplitud * Math.cos(frecuencia * t0 + fase);
  else yMarkVal = amplitud * Math.tan(frecuencia * t0 + fase);

  const yMarkPx = isFinite(yMarkVal) && Math.abs(yMarkVal) <= yMax
    ? padY + plotH - ((yMarkVal - yMin) / yRange) * plotH
    : null;

  // Eje Y=0
  const y0Px = padY + plotH - ((0 - yMin) / yRange) * plotH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.svgGrafica} aria-label={`Gráfica de ${funcion}(x)`}>
      {/* Fondo */}
      <rect x={padX} y={padY} width={plotW} height={plotH} fill="var(--bg-primary)" opacity="0.5" rx="4" />

      {/* Eje X=0 */}
      <line x1={padX} y1={y0Px} x2={padX + plotW} y2={y0Px} stroke="var(--text-secondary)" strokeWidth="1" opacity="0.5" />

      {/* Eje vertical izquierdo */}
      <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="var(--text-secondary)" strokeWidth="1" opacity="0.3" />

      {/* Etiquetas X */}
      {['0', 'π/2', 'π', '3π/2', '2π'].map((label, i) => {
        const xPx = padX + (i / 4) * plotW;
        return (
          <text key={label} x={xPx} y={padY + plotH + 14} fontSize="9" fill="var(--text-secondary)" textAnchor="middle" fontFamily="sans-serif">
            {label}
          </text>
        );
      })}

      {/* Etiquetas Y */}
      {[yMax, 0, -yMax].map((val) => {
        const yPx = padY + plotH - ((val - yMin) / yRange) * plotH;
        return (
          <text key={val} x={padX - 4} y={yPx + 4} fontSize="9" fill="var(--text-secondary)" textAnchor="end" fontFamily="sans-serif">
            {val === 0 ? '0' : val.toFixed(1)}
          </text>
        );
      })}

      {/* Curva */}
      {segmentos.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2E86AB" strokeWidth="2" />
      ))}

      {/* Marcador ángulo actual */}
      {yMarkPx !== null && (
        <>
          <line x1={xMark} y1={padY} x2={xMark} y2={padY + plotH} stroke="#48A9A6" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />
          <circle cx={xMark} cy={yMarkPx} r={5} fill="#48A9A6" stroke="white" strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
}

// ======== COMPONENTE: TABLA DE VALORES ========
function TablaValores() {
  const angulos = [0, 30, 45, 60, 90, 120, 135, 150, 180];
  return (
    <div className={styles.tablaWrapper}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>θ (grados)</th>
            <th>θ (rad)</th>
            <th>sen(θ)</th>
            <th>cos(θ)</th>
            <th>tan(θ)</th>
          </tr>
        </thead>
        <tbody>
          {angulos.map((ang) => {
            const rad = degToRad(ang);
            const radStr = [
              '0', 'π/6', 'π/4', 'π/3', 'π/2',
              '2π/3', '3π/4', '5π/6', 'π',
            ][angulos.indexOf(ang)];
            const v = VALORES_EXACTOS[ang];
            return (
              <tr key={ang}>
                <td className={styles.tdDestacado}>{ang}°</td>
                <td>{radStr}</td>
                <td className={styles.tdSin}>{v.sin}</td>
                <td className={styles.tdCos}>{v.cos}</td>
                <td className={styles.tdTan}>{v.tan}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ======== COMPONENTE: PANEL IDENTIDADES ========
function PanelIdentidades({ angulo }: { angulo: number }) {
  const rad = degToRad(angulo);
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);
  const sin2 = sinVal * sinVal;
  const cos2 = cosVal * cosVal;
  const suma = sin2 + cos2;

  return (
    <div className={styles.identidadesGrid}>
      <div className={styles.identidadCard}>
        <div className={styles.identidadTitulo}>Identidad Pitagórica Principal</div>
        <div className={styles.identidadFormula}>sen²(θ) + cos²(θ) = 1</div>
        <div className={styles.identidadCalculo}>
          <span className={styles.valSin}>({formatNum(sinVal)})² </span>
          <span>+ </span>
          <span className={styles.valCos}>({formatNum(cosVal)})² </span>
          <span>= </span>
          <strong>{formatNum(suma)}</strong>
        </div>
        <div className={styles.identidadBarra}>
          <div className={styles.barraSin} style={{ width: `${sin2 * 100}%` }} title={`sen²(θ) = ${sin2.toFixed(4)}`} />
          <div className={styles.barraCos} style={{ width: `${cos2 * 100}%` }} title={`cos²(θ) = ${cos2.toFixed(4)}`} />
        </div>
        <div className={styles.identidadLeyenda}>
          <span className={styles.dotSin} /> sen²(θ) = {formatNum(sin2)}
          <span className={styles.dotCos} /> cos²(θ) = {formatNum(cos2)}
        </div>
      </div>

      <div className={styles.identidadCard}>
        <div className={styles.identidadTitulo}>Otras identidades fundamentales</div>
        <div className={styles.identidadLista}>
          <div className={styles.identidadItem}>
            <span className={styles.identidadLabel}>tan(θ) = sen(θ)/cos(θ)</span>
            <span className={styles.identidadValor}>
              {Math.abs(cosVal) > 0.001 ? formatNum(sinVal / cosVal) : '∞'}
            </span>
          </div>
          <div className={styles.identidadItem}>
            <span className={styles.identidadLabel}>sen(−θ) = −sen(θ)</span>
            <span className={styles.identidadValor}>{formatNum(-sinVal)}</span>
          </div>
          <div className={styles.identidadItem}>
            <span className={styles.identidadLabel}>cos(−θ) = cos(θ)</span>
            <span className={styles.identidadValor}>{formatNum(cosVal)}</span>
          </div>
          <div className={styles.identidadItem}>
            <span className={styles.identidadLabel}>sen(θ + π) = −sen(θ)</span>
            <span className={styles.identidadValor}>{formatNum(-sinVal)}</span>
          </div>
          <div className={styles.identidadItem}>
            <span className={styles.identidadLabel}>1 + tan²(θ) = sec²(θ)</span>
            <span className={styles.identidadValor}>
              {Math.abs(cosVal) > 0.001 ? formatNum(1 + Math.tan(rad) ** 2) : '∞'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== PÁGINA PRINCIPAL ========
export default function VisualizadorTrigonometria() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('circulo');
  const [estadoCirculo, setEstadoCirculo] = useState<EstadoCirculo>({ angulo: 45 });
  const [estadoGrafica, setEstadoGrafica] = useState<EstadoGrafica>({
    amplitud: 1,
    frecuencia: 1,
    fase: 0,
    funcion: 'sin',
  });
  const [animando, setAnimando] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggleAnimacion = useCallback(() => {
    if (animando) {
      if (animRef.current) clearInterval(animRef.current);
      animRef.current = null;
      setAnimando(false);
    } else {
      setAnimando(true);
      animRef.current = setInterval(() => {
        setEstadoCirculo((prev) => ({
          angulo: (prev.angulo + 1) % 361,
        }));
      }, 30);
    }
  }, [animando]);

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  const rad = degToRad(estadoCirculo.angulo);
  const sinActual = Math.sin(rad);
  const cosActual = Math.cos(rad);
  const tanActual = Math.tan(rad);

  const TABS: { id: TabActiva; label: string }[] = [
    { id: 'circulo', label: '📐 Círculo Unitario' },
    { id: 'grafica', label: '📈 Gráficas' },
    { id: 'tabla', label: '📋 Tabla de Valores' },
    { id: 'identidades', label: '🔗 Identidades' },
  ];

  return (
    <div className={styles.container}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Trigonometría Interactiva</h1>
        <p className={styles.heroSubtitle}>
          Círculo unitario, gráficas de sen/cos/tan e identidades pitagóricas — visualizadas en tiempo real
        </p>
      </header>

      <LegalNotice />

      {/* Navegación por tabs */}
      <nav className={styles.tabs} aria-label="Secciones del visualizador">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-pressed={tabActiva === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ===== TAB: CÍRCULO UNITARIO ===== */}
      {tabActiva === 'circulo' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Círculo Unitario</h2>
          <div className={styles.circuloLayout}>
            <div className={styles.circuloPanel}>
              <CirculoUnitario
                angulo={estadoCirculo.angulo}
                mostrarIdentidades={false}
              />

              {/* Slider ángulo */}
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-angulo">
                  Ángulo θ: <strong>{estadoCirculo.angulo}°</strong>
                  <span className={styles.radLabel}> ({(degToRad(estadoCirculo.angulo)).toFixed(3)} rad)</span>
                </label>
                <input
                  id="slider-angulo"
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={estadoCirculo.angulo}
                  onChange={(e) => setEstadoCirculo({ angulo: Number(e.target.value) })}
                  className={styles.slider}
                  aria-label="Ángulo en grados"
                />
                <div className={styles.sliderMarks}>
                  {[0, 90, 180, 270, 360].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={styles.markBtn}
                      onClick={() => setEstadoCirculo({ angulo: m })}
                    >
                      {m}°
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={styles.btnAnimacion}
                onClick={toggleAnimacion}
                aria-pressed={animando}
              >
                {animando ? '⏸ Pausar' : '▶ Animar'}
              </button>
            </div>

            {/* Panel de valores */}
            <div className={styles.valoresPanel} role="status" aria-live="polite" aria-atomic="true">
              <h3 className={styles.valoresTitulo}>Valores en θ = {estadoCirculo.angulo}°</h3>
              <div className={styles.valoresGrid}>
                <div className={styles.valorCard} style={{ borderColor: '#2E86AB' }}>
                  <div className={styles.valorNombre}>sen(θ)</div>
                  <div className={styles.valorNumero} style={{ color: '#2E86AB' }}>{formatNum(sinActual)}</div>
                </div>
                <div className={styles.valorCard} style={{ borderColor: '#48A9A6' }}>
                  <div className={styles.valorNombre}>cos(θ)</div>
                  <div className={styles.valorNumero} style={{ color: '#48A9A6' }}>{formatNum(cosActual)}</div>
                </div>
                <div className={styles.valorCard} style={{ borderColor: '#E8A838' }}>
                  <div className={styles.valorNombre}>tan(θ)</div>
                  <div className={styles.valorNumero} style={{ color: '#E8A838' }}>
                    {isFinite(tanActual) ? formatNum(tanActual) : '∞'}
                  </div>
                </div>
                <div className={styles.valorCard} style={{ borderColor: '#7FB3D3' }}>
                  <div className={styles.valorNombre}>sen²+cos²</div>
                  <div className={styles.valorNumero} style={{ color: '#7FB3D3' }}>
                    {formatNum(sinActual ** 2 + cosActual ** 2)}
                  </div>
                </div>
              </div>

              {/* Cuadrante */}
              <div className={styles.cuadranteInfo}>
                <span className={styles.cuadranteLabel}>Cuadrante: </span>
                <strong>
                  {estadoCirculo.angulo === 0 || estadoCirculo.angulo === 360 ? 'Eje X+'
                    : estadoCirculo.angulo === 90 ? 'Eje Y+'
                    : estadoCirculo.angulo === 180 ? 'Eje X−'
                    : estadoCirculo.angulo === 270 ? 'Eje Y−'
                    : estadoCirculo.angulo < 90 ? 'I (sen+, cos+)'
                    : estadoCirculo.angulo < 180 ? 'II (sen+, cos−)'
                    : estadoCirculo.angulo < 270 ? 'III (sen−, cos−)'
                    : 'IV (sen−, cos+)'}
                </strong>
              </div>

              {/* Ángulos notables cercanos */}
              <div className={styles.notablesInfo}>
                <span className={styles.notablesLabel}>Ángulos notables:</span>
                <div className={styles.notablesBtns}>
                  {[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360].map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`${styles.notableBtn} ${estadoCirculo.angulo === a ? styles.notableBtnActivo : ''}`}
                      onClick={() => setEstadoCirculo({ angulo: a })}
                      aria-pressed={estadoCirculo.angulo === a}
                    >
                      {a}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== TAB: GRÁFICA ===== */}
      {tabActiva === 'grafica' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Gráficas Trigonométricas</h2>
          <div className={styles.graficaLayout}>
            <div className={styles.graficaPanel}>
              <GraficaFunciones angulo={estadoCirculo.angulo} config={estadoGrafica} />

              {/* Controles de función */}
              <div className={styles.funcionSelector}>
                {(['sin', 'cos', 'tan'] as FuncionTrig[]).map((f) => (
                  <label key={f} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="funcion"
                      value={f}
                      checked={estadoGrafica.funcion === f}
                      onChange={() => setEstadoGrafica((prev) => ({ ...prev, funcion: f }))}
                    />
                    <span className={styles.radioText}>{f === 'sin' ? 'sen(x)' : f === 'cos' ? 'cos(x)' : 'tan(x)'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sliders de control */}
            <div className={styles.slidersPanel}>
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-amplitud">
                  Amplitud (A): <strong>{estadoGrafica.amplitud.toFixed(1)}</strong>
                </label>
                <input
                  id="slider-amplitud"
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={estadoGrafica.amplitud}
                  onChange={(e) => setEstadoGrafica((prev) => ({ ...prev, amplitud: Number(e.target.value) }))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-frecuencia">
                  Frecuencia (ω): <strong>{estadoGrafica.frecuencia.toFixed(1)}</strong>
                </label>
                <input
                  id="slider-frecuencia"
                  type="range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={estadoGrafica.frecuencia}
                  onChange={(e) => setEstadoGrafica((prev) => ({ ...prev, frecuencia: Number(e.target.value) }))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-fase">
                  Fase (φ): <strong>{estadoGrafica.fase.toFixed(2)} rad</strong>
                </label>
                <input
                  id="slider-fase"
                  type="range"
                  min="0"
                  max={2 * Math.PI}
                  step="0.1"
                  value={estadoGrafica.fase}
                  onChange={(e) => setEstadoGrafica((prev) => ({ ...prev, fase: Number(e.target.value) }))}
                  className={styles.slider}
                />
              </div>

              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-angulo-g">
                  Ángulo θ: <strong>{estadoCirculo.angulo}°</strong>
                </label>
                <input
                  id="slider-angulo-g"
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={estadoCirculo.angulo}
                  onChange={(e) => setEstadoCirculo({ angulo: Number(e.target.value) })}
                  className={styles.slider}
                />
              </div>

              <div className={styles.formulaBox} role="status" aria-live="polite" aria-atomic="true">
                <span className={styles.formulaText}>
                  f(x) = {estadoGrafica.amplitud.toFixed(1)} · {estadoGrafica.funcion === 'sin' ? 'sen' : estadoGrafica.funcion}({estadoGrafica.frecuencia.toFixed(1)}x + {estadoGrafica.fase.toFixed(2)})
                </span>
              </div>

              <button
                type="button"
                className={styles.btnAnimacion}
                onClick={toggleAnimacion}
                aria-pressed={animando}
              >
                {animando ? '⏸ Pausar θ' : '▶ Animar θ'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ===== TAB: TABLA ===== */}
      {tabActiva === 'tabla' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Tabla de Valores Exactos</h2>
          <p className={styles.tablaDesc}>
            Valores exactos en ángulos notables — expresados con radicales.
          </p>
          <TablaValores />
          <div className={styles.tablaLeyenda}>
            <div className={styles.leyendaItem}><span className={styles.dotSin} /> Seno</div>
            <div className={styles.leyendaItem}><span className={styles.dotCos} /> Coseno</div>
            <div className={styles.leyendaItem}><span className={styles.dotTan} /> Tangente</div>
          </div>
        </section>
      )}

      {/* ===== TAB: IDENTIDADES ===== */}
      {tabActiva === 'identidades' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Identidades Trigonométricas</h2>
          <p className={styles.tablaDesc}>
            Observa cómo sen²(θ) + cos²(θ) = 1 siempre se cumple — mueve el ángulo para verlo.
          </p>

          <div className={styles.identidadesLayout}>
            <div className={styles.identidadesCirculo}>
              <CirculoUnitario
                angulo={estadoCirculo.angulo}
                mostrarIdentidades={true}
              />
              <div className={styles.sliderGroup}>
                <label className={styles.sliderLabel} htmlFor="slider-angulo-i">
                  θ = <strong>{estadoCirculo.angulo}°</strong>
                </label>
                <input
                  id="slider-angulo-i"
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={estadoCirculo.angulo}
                  onChange={(e) => setEstadoCirculo({ angulo: Number(e.target.value) })}
                  className={styles.slider}
                />
              </div>
              <button type="button" className={styles.btnAnimacion} onClick={toggleAnimacion} aria-pressed={animando}>
                {animando ? '⏸ Pausar' : '▶ Animar'}
              </button>
            </div>

            <div className={styles.identidadesPanel}>
              <PanelIdentidades angulo={estadoCirculo.angulo} />
            </div>
          </div>
        </section>
      )}

      {/* ===== SECCIÓN EDUCATIVA ===== */}
      <EducationalSection title="¿Qué es la trigonometría y por qué importa?" subtitle="Del círculo unitario a las ondas, la arquitectura y la navegación">
        <h3>El círculo unitario: la clave de todo</h3>
        <p>
          El <strong>círculo unitario</strong> es un círculo de radio 1 centrado en el origen. Para cualquier ángulo θ,
          el punto donde la recta corta al círculo tiene coordenadas (cos θ, sen θ). Esta definición geométrica
          extiende las funciones trigonométricas más allá de los triángulos.
        </p>

        <h3>Las 6 funciones trigonométricas</h3>
        <p>
          A partir del círculo unitario se definen las seis funciones fundamentales: <strong>seno</strong> (proyección vertical),
          <strong> coseno</strong> (proyección horizontal), <strong>tangente</strong> (sen/cos), y sus recíprocas: cosecante, secante y cotangente.
        </p>

        <h3>Identidades pitagóricas</h3>
        <p>
          La identidad fundamental <strong>sen²(θ) + cos²(θ) = 1</strong> se demuestra visualmente:
          es el teorema de Pitágoras aplicado al triángulo formado por el punto (cos θ, sen θ), el origen y el eje X.
          De ella se derivan: 1 + tan²(θ) = sec²(θ) y 1 + cot²(θ) = csc²(θ).
        </p>

        <h3>Tabla de ángulos notables</h3>
        <p>
          Los ángulos 0°, 30°, 45°, 60° y 90° (y sus simétricos) tienen valores exactos expresables con radicales simples:
          √2/2 ≈ 0,707 y √3/2 ≈ 0,866. Memorizar estos valores facilita el cálculo mental en bachillerato y universidad.
        </p>

        <h3>Aplicaciones reales</h3>
        <p>
          La trigonometría aparece en <strong>física</strong> (ondas sonoras, electromagnéticas, movimiento oscilatorio),
          <strong> arquitectura</strong> (cálculo de cargas y ángulos estructurales), <strong>GPS y navegación</strong>
          (trilateración mediante distancias) y <strong>música</strong> (síntesis de sonido por series de Fourier).
        </p>

        {/* ── Sección 1: Tabla Comparativa ── */}
        <h3>Comparativa de las 6 funciones trigonométricas</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Función</th>
                <th>Definición geométrica</th>
                <th>Rango</th>
                <th>Período</th>
                <th>Asíntotas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>sen(θ)</strong></td>
                <td>Proyección vertical en el círculo unitario</td>
                <td>[-1, 1]</td>
                <td>2π</td>
                <td>Ninguna</td>
              </tr>
              <tr>
                <td><strong>cos(θ)</strong></td>
                <td>Proyección horizontal en el círculo unitario</td>
                <td>[-1, 1]</td>
                <td>2π</td>
                <td>Ninguna</td>
              </tr>
              <tr>
                <td><strong>tan(θ)</strong></td>
                <td>sen(θ)/cos(θ) — pendiente de la línea</td>
                <td>(-∞, +∞)</td>
                <td>π</td>
                <td>θ = π/2 + nπ</td>
              </tr>
              <tr>
                <td><strong>csc(θ)</strong></td>
                <td>1/sen(θ)</td>
                <td>(-∞,-1]∪[1,+∞)</td>
                <td>2π</td>
                <td>θ = nπ</td>
              </tr>
              <tr>
                <td><strong>sec(θ)</strong></td>
                <td>1/cos(θ)</td>
                <td>(-∞,-1]∪[1,+∞)</td>
                <td>2π</td>
                <td>θ = π/2 + nπ</td>
              </tr>
              <tr>
                <td><strong>cot(θ)</strong></td>
                <td>cos(θ)/sen(θ)</td>
                <td>(-∞, +∞)</td>
                <td>π</td>
                <td>θ = nπ</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Sección 2: Casos de Uso ── */}
        <h3>¿Quién usa la trigonometría y para qué?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
              <h3>Estudiante de Bachillerato</h3>
            </div>
            <p>Comprende seno y coseno geométricamente para el examen de acceso a la universidad. El círculo unitario es la herramienta clave para memorizar ángulos notables.</p>
            <p className={styles.escenarioTip}>Tip: los ángulos notables se derivan de dos triángulos simples.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🎵</span>
              <h3>Productor Musical</h3>
            </div>
            <p>Las ondas sinusoidales son la base de la síntesis de sonido. La frecuencia determina la altura (nota) y la amplitud determina el volumen.</p>
            <p className={styles.escenarioTip}>Tip: la síntesis aditiva combina senos para crear cualquier timbre.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏗️</span>
              <h3>Arquitecto e Ingeniero</h3>
            </div>
            <p>Cálculo de ángulos en estructuras, triángulos y escalas usando la ley de senos y cosenos. Imprescindible para fuerzas y cargas en planos inclinados.</p>
            <p className={styles.escenarioTip}>Tip: la ley de cosenos generaliza el teorema de Pitágoras.</p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
              <h3>Navegante y Piloto</h3>
            </div>
            <p>La trigonometría esférica es la base del GPS y la navegación aérea. Las distancias entre puntos en la Tierra se calculan con la fórmula haversine.</p>
            <p className={styles.escenarioTip}>Tip: el GPS usa trilateración mediante distancias y ángulos.</p>
          </div>
        </div>

        {/* ── Sección 3: FAQ ── */}
        <h3>Preguntas frecuentes sobre trigonometría</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Por qué sen²(θ) + cos²(θ) = 1 siempre?</h4>
            <p>Es el teorema de Pitágoras aplicado al círculo unitario. El punto (cos θ, sen θ) siempre está sobre un círculo de radio 1, por lo que la suma de los cuadrados de sus coordenadas es siempre 1.</p>
            <p className={styles.faqTip}>Compruébalo en el visualizador: sin importar el ángulo, la tarjeta "sen²+cos²" siempre muestra 1,000.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuál es la diferencia entre radianes y grados?</h4>
            <p>Los grados (°) dividen la circunferencia en 360 partes. Los radianes miden el arco en función del radio: 2π radianes = 360°. Los radianes son más naturales en cálculo diferencial e integral.</p>
            <p className={styles.faqTip}>Regla de conversión: multiplicar grados por π/180 da radianes.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué significa la amplitud y la frecuencia de una onda sinusoidal?</h4>
            <p>La amplitud es la altura máxima de la onda (cuánto oscila). La frecuencia es cuántas veces se repite la onda por unidad. En A·sen(ωx + φ): A es amplitud, ω es frecuencia angular y φ es fase.</p>
            <p className={styles.faqTip}>Pruébalo en la pestaña Gráficas: cambia A y ω para ver el efecto visual.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuándo uso la ley de senos y cuándo la ley de cosenos?</h4>
            <p>Ley de senos: cuando conoces dos ángulos y un lado, o dos lados y el ángulo opuesto a uno. Ley de cosenos: cuando conoces dos lados y el ángulo entre ellos, o los tres lados.</p>
            <p className={styles.faqTip}>La ley de cosenos es la generalización del teorema de Pitágoras para triángulos no rectángulos.</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Por qué la tangente no está definida en 90° y 270°?</h4>
            <p>La tangente es sen(θ)/cos(θ). En 90° y 270°, el coseno es exactamente 0, lo que haría una división por cero. Por eso la tangente tiene asíntotas verticales en esos puntos.</p>
            <p className={styles.faqTip}>En la pestaña Círculo Unitario, arrastra el ángulo a 90°: verás que la tangente muestra "∞".</p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Para qué sirve el ángulo de fase en una onda?</h4>
            <p>La fase (φ) desplaza la onda horizontalmente. Si φ = π/2, la onda del coseno y la del seno coinciden: cos(x) = sen(x + π/2). La fase es clave en electrónica para sincronizar señales.</p>
            <p className={styles.faqTip}>En la pestaña Gráficas, mueve el slider de fase para ver el desplazamiento horizontal.</p>
          </div>
        </div>

        {/* ── Sección 4: Guía Paso a Paso ── */}
        <h3>Cómo dominar la trigonometría en 5 pasos</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Empieza con el círculo unitario</h4>
              <p>Memoriza los ángulos notables (0°, 30°, 45°, 60°, 90°) y sus coordenadas. Usa la pestaña "Círculo Unitario" de este visualizador para verlos en acción.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Entiende las funciones como proyecciones geométricas</h4>
              <p>No memorices fórmulas abstractas: seno es la altura del punto en el círculo, coseno es la anchura. El visualizador muestra estas proyecciones con líneas de colores.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Practica las identidades derivando de sen²+cos²=1</h4>
              <p>Divide la identidad pitagórica por cos²(θ) y obtienes 1+tan²=sec². Divídela por sen²(θ) y obtienes 1+cot²=csc². No hace falta memorizarlas: se derivan.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Trabaja con ley de senos y cosenos en triángulos reales</h4>
              <p>Resuelve problemas con triángulos de la vida real: cálculo de alturas, distancias inaccesibles, ángulos en estructuras. La práctica consolida la teoría.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h4>Conecta con las ondas: amplitud, frecuencia y fase</h4>
              <p>La pestaña Gráficas muestra cómo A·sen(ωx+φ) cambia con cada parámetro. Este es el puente entre trigonometría y física de ondas, electrónica y música.</p>
            </div>
          </div>
        </div>

        {/* ── Sección 5: Mejores Prácticas ── */}
        <h3>Consejos para no cometer errores</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <h4>Usa el círculo unitario</h4>
            <p>Tenlo siempre como referencia. Todos los valores trigonométricos se leen directamente de él.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <h4>Aprende en radianes</h4>
            <p>Aprende los ángulos en radianes (π/6, π/4, π/3, π/2) para el cálculo diferencial. Son imprescindibles en análisis.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <h4>Deriva tan, no la memorices</h4>
            <p>Recuerda que tan(θ) = sen(θ)/cos(θ). No necesitas memorizarla por separado: se obtiene en un paso.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <h4>Período vs. frecuencia</h4>
            <p>Distingue entre período (cuánto tarda en repetirse) y frecuencia (cuántas veces por unidad). Son recíprocos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <h4>Verifica el cuadrante</h4>
            <p>Comprueba siempre el signo: en el tercer cuadrante, seno y coseno son negativos, pero la tangente es positiva.</p>
          </div>
        </div>

        {/* ── Sección 6: Warning Box ── */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes en Trigonometría</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>❌ Confundir grados con radianes:</strong> sin(90) ≠ sin(π/2) en la mayoría de calculadoras. Verifica siempre el modo antes de calcular.</li>
            <li><strong>❌ Pensar que tan(90°) = infinito exacto:</strong> La tangente no está definida en 90°, no es un número real. Es una asíntota vertical.</li>
            <li><strong>❌ Memorizar sin entender:</strong> Los ángulos notables se derivan del triángulo equilátero (60°) y el isósceles rectángulo (45°). No hace falta memorización bruta.</li>
            <li><strong>❌ Olvidar el signo según el cuadrante:</strong> En el tercer cuadrante, seno y coseno son negativos, pero tangente es positiva. Usa la regla CAST (o ASCT).</li>
            <li><strong>❌ Confundir amplitud con frecuencia:</strong> La amplitud cambia la altura de la onda; la frecuencia cambia cuántas "crestas" hay por unidad. Son independientes.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-trigonometria')} />
      <ShareCard appName="visualizador-trigonometria" />
      <Footer appName="visualizador-trigonometria" />
    </div>
  );
}
