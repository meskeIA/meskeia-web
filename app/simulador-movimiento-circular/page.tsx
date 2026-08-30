'use client';
// @disclaimer: exempt

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorMovimientoCircular.module.css';

type Modo = 'mcu' | 'mcnu';

const ALPHA_MCNU = 0.5; // rad/s² constante en modo MCNU
/** Techo de ω en MCNU: al alcanzarlo el simulador vuelve a empezar, y lo dice en pantalla */
const OMEGA_MAX_MCNU = 20;

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  lineWidth: number,
): void {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Punta de flecha
  const ang = Math.atan2(dy, dx);
  const headLen = Math.min(12, len * 0.4);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(ang - 0.4), y2 - headLen * Math.sin(ang - 0.4));
  ctx.lineTo(x2 - headLen * Math.cos(ang + 0.4), y2 - headLen * Math.sin(ang + 0.4));
  ctx.closePath();
  ctx.fill();
}

export default function SimuladorMovimientoCircularPage() {
  // Parámetros controlables
  const [radio, setRadio] = useState(2.0);
  const [omega, setOmega] = useState(2.0);
  const [masa, setMasa] = useState(1.0);
  const [modo, setModo] = useState<Modo>('mcu');

  // Refs de animación
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const thetaRef = useRef<number>(0);
  const omegaRef = useRef<number>(omega);

  /**
   * ω que se ENSEÑA en el panel.
   *
   * En MCU es la del slider; en MCNU la que de verdad gira, que vive en `omegaRef` y el
   * bucle de animación va acelerando. Las seis tarjetas (ω, v, a_c, F_c, T, f) se derivaban
   * de `omega` a secas, así que en MCNU salían congeladas en ω₀ mientras la bola aceleraba
   * en pantalla: la app se contradecía a sí misma —su propia tabla dice «la aceleración
   * centrípeta varía porque ω varía»— y quien leía las cifras se llevaba números que no
   * correspondían a lo que estaba viendo (hallazgo 167 del Inspector).
   *
   * Se refresca a ~10 Hz y no en cada fotograma: a 60 fps un re-render por cuadro no aporta
   * nada legible y sí bastante trabajo.
   */
  const [omegaAnimada, setOmegaAnimada] = useState(omega);
  const ultimoRefrescoRef = useRef<number>(0);

  const prevTimestampRef = useRef<number | null>(null);

  /**
   * Reinicia la animación (ω vuelve a ω₀, θ a 0) solo cuando el usuario pide explícitamente
   * empezar de nuevo: cambia ω₀ en el slider, o cambia de modo (MCU ↔ MCNU).
   *
   * `radio` NO va en las dependencias: es una magnitud geométrica del dibujo (v, a_c, F_c ya
   * la leen directamente en el render), no del estado dinámico de giro. Con `radio` aquí, en
   * MCNU mover solo ese slider rearmaba ω a ω₀ y ponía θ a 0 sin avisar — justo cuando el
   * bloque educativo propone comparar la MISMA ω al variar el radio (hallazgo 542).
   */
  useEffect(() => {
    omegaRef.current = omega;
    thetaRef.current = 0;
    prevTimestampRef.current = null;
    setOmegaAnimada(omega);
  }, [omega, modo]);

  // Magnitudes derivadas (mostradas en panel)
  const omegaVal = modo === 'mcnu' ? omegaAnimada : omega;
  const v = omegaVal * radio;
  const ac = omegaVal * omegaVal * radio;
  const fc = masa * ac;
  const T = omegaVal > 0 ? (2 * Math.PI) / omegaVal : Infinity;
  const freq = omegaVal > 0 ? omegaVal / (2 * Math.PI) : 0;

  // Función de dibujo
  const dibujar = useCallback(
    (theta: number, omegaActual: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.scale(dpr, dpr);
      }

      // Colores dark-mode aware
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const bgColor = isDark ? '#1A1A1A' : '#F8FAFC';
      const axisColor = isDark ? '#3A3A3A' : '#E5E7EB';
      const circleColor = isDark ? '#4A5568' : '#CBD5E0';
      const textColor = isDark ? '#B0B0B0' : '#666666';
      const particleColor = '#2E86AB';
      const radiusColor = isDark ? '#555' : '#CCC';
      const velColor = '#48A9A6';
      const acColor = '#E07A1F';
      const atColor = '#DC2626';

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Radio en píxeles (máximo 42% del tamaño menor del canvas para dejar margen)
      const maxPx = Math.min(w, h) * 0.42;
      // radio está en [0.5, 5]; mapeamos de forma proporcional
      const radioPx = (radio / 5) * maxPx;

      // Ejes cartesianos suaves
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - maxPx * 1.05, cy);
      ctx.lineTo(cx + maxPx * 1.05, cy);
      ctx.moveTo(cx, cy - maxPx * 1.05);
      ctx.lineTo(cx, cy + maxPx * 1.05);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiquetas de ejes
      ctx.fillStyle = textColor;
      ctx.font = `${Math.round(w * 0.03)}px system-ui`;
      ctx.textAlign = 'right';
      ctx.fillText('x', cx + maxPx * 1.0, cy - 4);
      ctx.textAlign = 'left';
      ctx.fillText('y', cx + 4, cy - maxPx * 0.96);

      // Circunferencia
      ctx.strokeStyle = circleColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radioPx, 0, 2 * Math.PI);
      ctx.stroke();

      // Posición de la partícula
      const px = cx + radioPx * Math.cos(theta);
      const py = cy - radioPx * Math.sin(theta); // y invertida en canvas

      // Radio (línea punteada)
      ctx.strokeStyle = radiusColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiqueta "r"
      const midRx = (cx + px) / 2;
      const midRy = (cy + py) / 2;
      ctx.fillStyle = textColor;
      ctx.font = `bold ${Math.round(w * 0.028)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('r', midRx + 8, midRy - 6);

      // Vector velocidad tangencial (perpendicular al radio, sentido antihorario = convención positiva)
      if (omegaActual > 0.01) {
        const velScale = 18; // px por unidad de v
        const vMag = omegaActual * radio;
        const vLen = Math.min(vMag * velScale, maxPx * 0.5);
        // Dirección tangencial: perpendicular al radio hacia la izq del movimiento antihorario
        const tx = -Math.sin(theta);
        const ty = Math.cos(theta); // en coords canvas (y arriba)
        const vx2 = px + vLen * tx;
        const vy2 = py + vLen * (-ty); // invertir y para canvas
        drawArrow(ctx, px, py, vx2, vy2, velColor, 2);

        ctx.fillStyle = velColor;
        ctx.font = `bold ${Math.round(w * 0.028)}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText('v', vx2 + 4, vy2 - 4);
      }

      // Vector aceleración centrípeta (apuntando hacia el centro)
      if (omegaActual > 0.01) {
        const acScale = 18;
        const acMag = omegaActual * omegaActual * radio;
        const acLen = Math.min(acMag * acScale, maxPx * 0.45);
        // Dirección: del punto al centro
        const dx = cx - px;
        const dy = cy - py;
        const dNorm = Math.sqrt(dx * dx + dy * dy);
        const acx2 = px + (dx / dNorm) * acLen;
        const acy2 = py + (dy / dNorm) * acLen;
        drawArrow(ctx, px, py, acx2, acy2, acColor, 2);

        ctx.fillStyle = acColor;
        ctx.font = `bold ${Math.round(w * 0.028)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText('a_c', acx2, acy2 - 8);
      }

      // Vector aceleración tangencial (misma dirección que v, magnitud α·r constante).
      // Solo en MCNU: la tabla comparativa afirma a_t ≠ 0 ahí y el canvas no lo dibujaba
      // (hallazgo 543).
      if (modo === 'mcnu' && omegaActual > 0.01) {
        const atScale = 18;
        const atMag = ALPHA_MCNU * radio;
        const atLen = Math.min(atMag * atScale, maxPx * 0.4);
        const tx = -Math.sin(theta);
        const ty = Math.cos(theta);
        const atx2 = px + atLen * tx;
        const aty2 = py + atLen * (-ty);
        drawArrow(ctx, px, py, atx2, aty2, atColor, 2);

        ctx.fillStyle = atColor;
        ctx.font = `bold ${Math.round(w * 0.028)}px system-ui`;
        ctx.textAlign = 'left';
        ctx.fillText('a_t', atx2 + 4, aty2 + 14);
      }

      // Punto/partícula
      ctx.fillStyle = particleColor;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Centro
      ctx.fillStyle = textColor;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
      ctx.fill();
    },
    [radio, modo],
  );

  // Bucle de animación
  useEffect(() => {
    const step = (timestamp: number) => {
      if (prevTimestampRef.current === null) {
        prevTimestampRef.current = timestamp;
      }
      const dtMs = timestamp - prevTimestampRef.current;
      prevTimestampRef.current = timestamp;
      const dt = Math.min(dtMs / 1000, 0.05); // máx 50 ms para evitar saltos

      if (modo === 'mcnu') {
        omegaRef.current = Math.max(0, omegaRef.current + ALPHA_MCNU * dt);
        // Al llegar al techo del simulador se vuelve a empezar. El ciclo se anuncia en
        // pantalla: antes la bola se paraba de golpe sin que nada lo explicara.
        if (omegaRef.current > OMEGA_MAX_MCNU) omegaRef.current = 0;
        if (timestamp - ultimoRefrescoRef.current > 100) {
          ultimoRefrescoRef.current = timestamp;
          setOmegaAnimada(omegaRef.current);
        }
      } else {
        omegaRef.current = omega;
      }

      thetaRef.current = thetaRef.current + omegaRef.current * dt;

      dibujar(thetaRef.current, omegaRef.current);

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      prevTimestampRef.current = null;
    };
  }, [omega, modo, dibujar]);

  // Redibujar al cambiar tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      dibujar(thetaRef.current, omegaRef.current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [dibujar]);

  // Redibujar al redimensionar
  useEffect(() => {
    const handleResize = () => dibujar(thetaRef.current, omegaRef.current);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujar]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Movimiento Circular</h1>
        <p className={styles.subtitle}>
          Observa en tiempo real cómo se mueve una partícula en trayectoria circular. Ajusta radio,{' '}
          velocidad angular y masa para ver los vectores de <strong>velocidad tangencial</strong> y{' '}
          <strong>aceleración centrípeta</strong>.
        </p>
      </header>

      <LegalNotice />

      {/* SELECTOR MCU / MCNU */}
      <div className={styles.modeSelector}>
        <button
          type="button"
          className={`${styles.modeBtn} ${modo === 'mcu' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('mcu')}
          aria-pressed={modo === 'mcu'}
        >
          MCU — Movimiento Circular Uniforme
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${modo === 'mcnu' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('mcnu')}
          aria-pressed={modo === 'mcnu'}
        >
          MCNU — No Uniforme (α = 0,5 rad/s²)
        </button>
      </div>

      {/* SLIDERS */}
      <div className={styles.slidersGrid}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-radio">
            Radio (r){' '}
            <span className={styles.sliderValue}>{formatNumber(radio, 1)} m</span>
          </label>
          <input
            id="slider-radio"
            type="range"
            min={0.5}
            max={5}
            step={0.1}
            value={radio}
            onChange={(e) => setRadio(parseFloat(e.target.value))}
            className={styles.slider}
            aria-label="Radio de la circunferencia"
            aria-valuetext={`${formatNumber(radio, 1)} metros`}
          />
          <div className={styles.sliderTicks}><span>0,5</span><span>5</span></div>
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-omega">
            Velocidad angular (ω){' '}
            <span className={styles.sliderValue}>{formatNumber(omega, 1)} rad/s</span>
          </label>
          <input
            id="slider-omega"
            type="range"
            min={0}
            max={10}
            step={0.1}
            value={omega}
            onChange={(e) => setOmega(parseFloat(e.target.value))}
            className={styles.slider}
            aria-label="Velocidad angular"
            aria-valuetext={`${formatNumber(omega, 1)} radianes por segundo`}
          />
          <div className={styles.sliderTicks}><span>0</span><span>10</span></div>
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-masa">
            Masa (m){' '}
            <span className={styles.sliderValue}>{formatNumber(masa, 1)} kg</span>
          </label>
          <input
            id="slider-masa"
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={masa}
            onChange={(e) => setMasa(parseFloat(e.target.value))}
            className={styles.slider}
            aria-label="Masa de la partícula"
            aria-valuetext={`${formatNumber(masa, 1)} kilogramos`}
          />
          <div className={styles.sliderTicks}><span>0,1</span><span>5</span></div>
        </div>
      </div>

      {/* CANVAS */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Animación del movimiento circular con vectores de velocidad y aceleración"
        />
      </div>

      {modo === 'mcnu' && (
        <p className={styles.avisoCiclo} role="note">
          <span aria-hidden="true">🔁</span> En MCNU las cifras del panel siguen a la animación:
          ω crece a {formatNumber(ALPHA_MCNU, 1)} rad/s² y, al llegar a{' '}
          {formatNumber(OMEGA_MAX_MCNU, 0)} rad/s, el simulador vuelve a empezar para que el
          ciclo pueda verse entero.
        </p>
      )}

      {/* PANEL DE VALORES */}
      <div className={styles.valuesPanel}>
        <div className={styles.valueCard}>
          <span className={styles.valueName}>ω</span>
          <span className={styles.valueNum}>{formatNumber(omegaVal, 2)}</span>
          <span className={styles.valueUnit}>rad/s</span>
        </div>
        <div className={styles.valueCard}>
          <span className={styles.valueName}>v tangencial</span>
          <span className={styles.valueNum}>{formatNumber(v, 2)}</span>
          <span className={styles.valueUnit}>m/s</span>
        </div>
        <div className={styles.valueCard}>
          <span className={styles.valueName}>Aceleración centrípeta</span>
          <span className={styles.valueNum}>{formatNumber(ac, 2)}</span>
          <span className={styles.valueUnit}>m/s²</span>
        </div>
        <div className={styles.valueCard}>
          <span className={styles.valueName}>Fuerza centrípeta</span>
          <span className={styles.valueNum}>{formatNumber(fc, 2)}</span>
          <span className={styles.valueUnit}>N</span>
        </div>
        <div className={styles.valueCard}>
          <span className={styles.valueName}>Período (T)</span>
          <span className={styles.valueNum}>{omegaVal > 0 ? formatNumber(T, 2) : '∞'}</span>
          <span className={styles.valueUnit}>s</span>
        </div>
        <div className={styles.valueCard}>
          <span className={styles.valueName}>Frecuencia (f)</span>
          <span className={styles.valueNum}>{formatNumber(freq, 3)}</span>
          <span className={styles.valueUnit}>Hz</span>
        </div>
      </div>

      {/* LEYENDA */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#48A9A6' }} aria-hidden="true" />
          Vector velocidad tangencial (v)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#E07A1F' }} aria-hidden="true" />
          Vector aceleración centrípeta (a_c)
        </span>
        {modo === 'mcnu' && (
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: '#DC2626' }} aria-hidden="true" />
            Vector aceleración tangencial (a_t)
          </span>
        )}
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#2E86AB' }} aria-hidden="true" />
          Partícula
        </span>
      </div>

      {/* BLOQUE EDUCATIVO v2.0 */}
      <EducationalSection
        title="Aprende sobre el Movimiento Circular"
        subtitle="El movimiento que describe desde los planetas hasta las lavadoras"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es el Movimiento Circular?</h3>
          <p>
            El <strong>movimiento circular</strong> ocurre cuando un objeto sigue una trayectoria
            cerrada en forma de circunferencia. Incluso si la rapidez (módulo de la velocidad) no cambia,
            la dirección del vector velocidad cambia constantemente, lo que implica que siempre existe
            una <strong>aceleración</strong>.
          </p>
          <p>
            Es un tema clásico de física en Bachillerato y EBAU (España) y en preparatoria,
            secundaria y educación media (Latinoamérica), y suele aparecer en los exámenes de
            admisión universitaria.
          </p>
          <p>
            Esta aceleración, llamada <strong>aceleración centrípeta</strong>, siempre apunta hacia el
            <em> centro</em> de la circunferencia y es perpendicular a la velocidad. Por eso no modifica
            la rapidez (no hace trabajo), solo cambia la dirección del movimiento.
          </p>
          <div className={styles.formulaBox}>
            <strong>MCU:</strong> v = ω · r &nbsp;|&nbsp; a_c = ω² · r = v²/r &nbsp;|&nbsp; T = 2π/ω
          </div>
          <ul className={styles.bulletList}>
            <li>La velocidad tangencial v siempre es perpendicular al radio.</li>
            <li>La aceleración centrípeta a_c nunca modifica la rapidez, solo la dirección.</li>
            <li>Aumentar el radio a igual ω aumenta tanto v como a_c.</li>
            <li>En el MCNU, ω varía: hay además aceleración tangencial a_t = α · r.</li>
          </ul>
        </section>

        {/* TABLA COMPARATIVA MCU vs MCNU */}
        <section>
          <h3>MCU vs MCNU: diferencias clave</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>MCU</th>
                  <th>MCNU</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Velocidad lineal (v)</td>
                  <td>Constante</td>
                  <td>Varía con el tiempo</td>
                </tr>
                <tr>
                  <td>Velocidad angular (ω)</td>
                  <td>Constante</td>
                  <td>Varía (ω = ω₀ + α·t)</td>
                </tr>
                <tr>
                  <td>Aceleración centrípeta (a_c)</td>
                  <td>Constante (ω y r fijos)</td>
                  <td>Varía porque ω varía</td>
                </tr>
                <tr>
                  <td>Aceleración tangencial (a_t)</td>
                  <td>Nula (a_t = 0)</td>
                  <td>a_t = α · r ≠ 0</td>
                </tr>
                <tr>
                  <td>Energía cinética</td>
                  <td>Constante</td>
                  <td>Aumenta o disminuye</td>
                </tr>
                <tr>
                  <td>Ejemplo real</td>
                  <td>Satélite en órbita circular estable</td>
                  <td>Ventilador acelerando al encenderse</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>Escenarios reales</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🛰️</span>
              <h4>Satélite en órbita</h4>
              <p>
                Un satélite en órbita circular experimenta MCU: la gravedad actúa como fuerza
                centrípeta. A mayor altitud, menor velocidad orbital necesaria. La ISS orbita a
                ~7,7 km/s.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🔬</span>
              <h4>Centrífuga de laboratorio</h4>
              <p>
                Una microcentrífuga puede girar a 15.000 rpm (≈ 1.571 rad/s). La aceleración
                centrípeta alcanza miles de veces la g, separando componentes de diferente densidad.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚗</span>
              <h4>Curva de carretera</h4>
              <p>
                Al tomar una curva, la fricción lateral actúa como fuerza centrípeta. Si v es
                demasiado alta para el radio de la curva, la fricción no es suficiente y el vehículo
                sale de la calzada.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🌀</span>
              <h4>Lavadora en centrifugado</h4>
              <p>
                El tambor gira en MCNU al inicio (α &gt; 0) hasta alcanzar la velocidad nominal
                (MCU). La aceleración centrípeta lanza el agua fuera de la ropa hacia los orificios
                del tambor.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes</h3>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Por qué la aceleración centrípeta no cambia la rapidez?</dt>
              <dd>
                Porque a_c siempre es <em>perpendicular</em> a v. La aceleración solo modifica la
                rapidez cuando tiene componente en la dirección del movimiento. Como a_c apunta al
                centro y v es tangente al círculo, son perpendiculares: el trabajo de a_c es nulo.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es realmente la fuerza centrípeta?</dt>
              <dd>
                No es un tipo especial de fuerza, es el nombre que damos a cualquier fuerza (o
                componente de fuerza) que produce la aceleración centrípeta: puede ser la gravedad
                (satélite), la fricción (coche en curva), la tensión de un hilo o la normal de un
                carril.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Existe la fuerza centrífuga?</dt>
              <dd>
                La fuerza centrífuga es una <strong>fuerza ficticia</strong> que aparece solo en
                marcos de referencia no inerciales (giratorios). En un sistema inercial, no existe:
                lo que sentimos al girar es la inercia de nuestro cuerpo que tiende a seguir recto,
                no una fuerza que nos empuje hacia fuera.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo orbita un satélite sin motor?</dt>
              <dd>
                La gravedad lo curva constantemente sin frenarlo. A la velocidad orbital correcta,
                la Tierra &quot;se curva hacia abajo&quot; al mismo ritmo que el satélite cae: el
                satélite cae sin llegar a tocar el suelo. Newton lo explicó imaginando un proyectil
                lanzado lo suficientemente rápido.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué pasa si se rompe el hilo de un objeto en MCU?</dt>
              <dd>
                Desaparece la fuerza centrípeta. El objeto sale disparado en línea recta tangente al
                círculo (primera ley de Newton), en la dirección que tenía v en ese instante.
                Ejemplo: la honda de David lanzando una piedra.
              </dd>
            </div>
          </dl>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo resolver un problema de MCU paso a paso</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica los datos:</strong> radio (r), velocidad angular (ω) o lineal (v),
                masa (m) y si el movimiento es uniforme o no.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Convierte unidades:</strong> rpm → rad/s dividiendo entre 60 y multiplicando
                por 2π. Verificar que r esté en metros y m en kg.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Calcula la aceleración centrípeta:</strong> a_c = ω² · r o a_c = v²/r.
                Expresar en m/s².
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Aplica la 2.ª ley de Newton:</strong> la suma de fuerzas hacia el centro
                debe ser igual a m · a_c. Identifica qué fuerza física actúa como centrípeta.
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Comprueba el período y la frecuencia:</strong> T = 2π/ω y f = 1/T. Verifica
                que sean coherentes con el enunciado (¿cuántas vueltas por segundo?).
              </div>
            </li>
          </ol>
        </section>

        {/* TIPS */}
        <section>
          <h3>Trucos para no equivocarse</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <p>
                <strong>ω vs v:</strong> ω (rad/s) describe cuánto ángulo barre por segundo;
                v (m/s) es la rapidez con que se desplaza el punto. Relación: v = ω · r.
                A igual ω, los puntos más alejados del centro tienen mayor v.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <p>
                <strong>Conversión rpm → rad/s:</strong> multiplica las rpm por 2π/60 (≈ 0,1047).
                Ejemplo: 1.500 rpm = 1.500 × 2π/60 ≈ 157 rad/s.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <p>
                <strong>a_c crece con ω²:</strong> si duplicas ω, la aceleración centrípeta se
                cuadruplica. Por eso los motores rápidos necesitan piezas mucho más robustas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <p>
                <strong>T y f son inversos:</strong> si el período es 0,5 s, la frecuencia es 2 Hz
                (2 vueltas por segundo). No confundir f (Hz) con ω (rad/s): ω = 2π·f.
              </p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes en examen
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir v lineal con ω:</strong> son magnitudes distintas. v cambia con r;
                ω es la misma para todos los puntos del sólido rígido.
              </li>
              <li>
                <strong>Creer que la fuerza centrífuga es real:</strong> en un sistema inercial no
                existe. Solo aparece como fuerza ficticia en sistemas giratorios no inerciales.
              </li>
              <li>
                <strong>Olvidar convertir rpm a rad/s:</strong> la fórmula a_c = ω² · r requiere ω en
                rad/s. Si introduces rpm directamente el resultado es incorrecto.
              </li>
              <li>
                <strong>Confundir T (período) con τ (torque):</strong> en muchos problemas aparecen
                ambos. T en segundos es el tiempo por vuelta; τ en N·m es el momento de una fuerza.
              </li>
              <li>
                <strong>Pensar que mayor masa → mayor velocidad en órbita:</strong> en MCU
                gravitatorio, la velocidad orbital no depende de la masa del satélite, sino del radio
                orbital y la masa del cuerpo central.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-movimiento-circular')} />
      <ShareCard appName="simulador-movimiento-circular" />
      <Footer appName="simulador-movimiento-circular" />
    </div>
  );
}
