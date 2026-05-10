'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorPotencialAccion.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type ModoEstimulo = 'unico' | 'sostenido';

// ============================================
// CONSTANTES
// ============================================
const V_REPOSO = -70; // mV
const V_PEAK = 35; // mV (pico aproximado)
const V_HYPER = -85; // mV (hiperpolarización)
const T_TOTAL = 50; // ms — ventana visible
const DT = 0.1; // ms — paso de simulación

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 1): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

interface SamplePoint {
  t: number;
  v: number;
  estimulo: number;
}

interface PASpike {
  inicio: number; // tiempo de inicio del PA
  pico: number;   // tiempo del pico
}

// ============================================
// SIMULACIÓN SIMPLIFICADA DEL PA
// ============================================
// Modelo conceptual basado en Hodgkin-Huxley pero simplificado:
// - Reposo a -70 mV (canales K abiertos por filtración)
// - Si V > umbral: dispara potencial de acción con forma fija
// - Periodo refractario absoluto durante pico (no se puede disparar)
// - Periodo refractario relativo durante hiperpolarización (umbral más alto)
// ============================================

function formaPA(tDesdePico: number): number {
  // Forma estándar del PA en mV (perfil canónico ~3 ms desde umbral hasta pico)
  // tDesdePico: tiempo desde inicio del PA en ms
  if (tDesdePico < 0) return V_REPOSO;
  if (tDesdePico < 1.0) {
    // Despolarización rápida (1 ms): de -55 a +35
    const u = tDesdePico / 1.0;
    return -55 + (V_PEAK - (-55)) * u;
  }
  if (tDesdePico < 3.0) {
    // Repolarización (2 ms): de +35 a -75
    const u = (tDesdePico - 1.0) / 2.0;
    return V_PEAK + (V_HYPER - V_PEAK) * u;
  }
  if (tDesdePico < 8.0) {
    // Hiperpolarización + recuperación (5 ms): de -85 a -70
    const u = (tDesdePico - 3.0) / 5.0;
    return V_HYPER + (V_REPOSO - V_HYPER) * u;
  }
  return V_REPOSO;
}

interface SimulacionResultado {
  trayectoria: SamplePoint[];
  spikes: PASpike[];
  estimuloMaxAplicado: number;
  alturaMaxAlcanzada: number;
}

function simular(
  intensidad: number,
  duracionEstimulo: number,
  inicioEstimulo: number,
  umbral: number,
  modo: ModoEstimulo,
  intervaloSostenido: number
): SimulacionResultado {
  const trayectoria: SamplePoint[] = [];
  const spikes: PASpike[] = [];
  const N = Math.floor(T_TOTAL / DT);

  let v = V_REPOSO;
  let inPA: { inicio: number; pico: number } | null = null;
  let estimuloMaxAplicado = 0;

  for (let i = 0; i <= N; i++) {
    const t = i * DT;

    // Determinar si hay estímulo en este instante
    let estimuloActual = 0;
    if (modo === 'unico') {
      if (t >= inicioEstimulo && t < inicioEstimulo + duracionEstimulo) {
        estimuloActual = intensidad;
      }
    } else {
      // sostenido: pulsos cada intervaloSostenido ms
      const dt_estim = (t - inicioEstimulo) % intervaloSostenido;
      if (t >= inicioEstimulo && dt_estim < duracionEstimulo) {
        estimuloActual = intensidad;
      }
    }

    estimuloMaxAplicado = Math.max(estimuloMaxAplicado, estimuloActual);

    // Si está en medio de un PA, seguir la forma canónica
    if (inPA) {
      const tDesde = t - inPA.inicio;
      v = formaPA(tDesde);
      if (tDesde > 8.0) {
        inPA = null;
      }
    } else {
      // Comportamiento subumbral: el potencial sube por estímulo, decae al reposo
      // V_target = V_REPOSO + intensidad·factor (relación lineal en subumbral)
      const tau = 5.0; // ms — constante de tiempo de la membrana
      const v_target = V_REPOSO + estimuloActual * 1.0; // 1 mV por unidad de intensidad
      v = v + (v_target - v) * (DT / tau);

      // ¿Cruza el umbral?
      if (v > umbral) {
        // Disparar PA
        inPA = { inicio: t, pico: t + 1.0 };
        spikes.push({ inicio: t, pico: t + 1.0 });
        v = -55; // V_threshold
      }
    }

    trayectoria.push({ t, v, estimulo: estimuloActual });
  }

  const alturaMaxAlcanzada = Math.max(...trayectoria.map(p => p.v));

  return { trayectoria, spikes, estimuloMaxAplicado, alturaMaxAlcanzada };
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorPotencialAccionPage() {
  const [modo, setModo] = useState<ModoEstimulo>('unico');
  const [intensidad, setIntensidad] = useState(20); // unidades arbitrarias 0-30
  const [duracion, setDuracion] = useState(2); // ms
  const [umbral, setUmbral] = useState(-55); // mV
  const [intervaloSostenido, setIntervaloSostenido] = useState(10); // ms (frecuencia ≈ 100 Hz)
  const inicioEstimulo = 5; // ms (fijo)

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sim = useMemo(
    () => simular(intensidad, duracion, inicioEstimulo, umbral, modo, intervaloSostenido),
    [intensidad, duracion, umbral, modo, intervaloSostenido]
  );

  const disparo = sim.spikes.length > 0;
  const numSpikes = sim.spikes.length;
  const latencia = disparo ? sim.spikes[0].inicio - inicioEstimulo : null;
  const frecuencia = numSpikes > 1 ? 1000 / (sim.spikes[1].inicio - sim.spikes[0].inicio) : null;

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
    const pad = { top: 30, right: 30, bottom: 50, left: 60 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#999' : '#666';
    const colorGrid = isDark ? '#333' : '#EEE';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorVm = '#2E86AB';
    const colorVmFill = 'rgba(46, 134, 171, 0.10)';
    const colorReposo = isDark ? '#888' : '#555';
    const colorUmbral = '#A82E68';
    const colorEstimulo = '#E07A1F';

    ctx.clearRect(0, 0, W, H);

    // Rango Y: -100 a +50 mV
    const yMin = -100;
    const yMax = 50;

    const xToPx = (t: number) => pad.left + (t / T_TOTAL) * plotW;
    const yToPx = (v: number) => pad.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    // Grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    for (let v = yMin; v <= yMax; v += 25) {
      ctx.beginPath();
      ctx.moveTo(pad.left, yToPx(v));
      ctx.lineTo(pad.left + plotW, yToPx(v));
      ctx.stroke();
    }
    for (let t = 0; t <= T_TOTAL; t += 5) {
      ctx.beginPath();
      ctx.moveTo(xToPx(t), pad.top);
      ctx.lineTo(xToPx(t), pad.top + plotH);
      ctx.stroke();
    }

    // Ejes
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Etiquetas Y
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    for (let v = yMin; v <= yMax; v += 25) {
      ctx.fillText(`${v}`, pad.left - 4, yToPx(v) + 4);
    }
    ctx.save();
    ctx.translate(pad.left - 45, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('V_m (mV)', 0, 0);
    ctx.restore();

    // Etiquetas X
    ctx.textAlign = 'center';
    for (let t = 0; t <= T_TOTAL; t += 10) {
      ctx.fillText(`${t}`, xToPx(t), pad.top + plotH + 14);
    }
    ctx.fillText('Tiempo (ms)', pad.left + plotW / 2, pad.top + plotH + 32);

    // Línea reposo
    ctx.strokeStyle = colorReposo;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(pad.left, yToPx(V_REPOSO));
    ctx.lineTo(pad.left + plotW, yToPx(V_REPOSO));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colorReposo;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Reposo (${V_REPOSO} mV)`, pad.left + 8, yToPx(V_REPOSO) - 4);

    // Línea umbral
    ctx.strokeStyle = colorUmbral;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, yToPx(umbral));
    ctx.lineTo(pad.left + plotW, yToPx(umbral));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = colorUmbral;
    ctx.fillText(`Umbral (${umbral} mV)`, pad.left + 8, yToPx(umbral) - 4);

    // Marcadores de estímulo (rectángulos en la parte superior)
    const estiHeight = 12;
    let estIniciado = -1;
    for (let i = 0; i < sim.trayectoria.length; i++) {
      const p = sim.trayectoria[i];
      if (p.estimulo > 0 && estIniciado < 0) {
        estIniciado = p.t;
      } else if (p.estimulo === 0 && estIniciado >= 0) {
        // Cierre rectángulo
        ctx.fillStyle = colorEstimulo;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(xToPx(estIniciado), pad.top - estiHeight - 2, xToPx(p.t) - xToPx(estIniciado), estiHeight);
        ctx.globalAlpha = 1;
        estIniciado = -1;
      }
    }
    if (estIniciado >= 0) {
      // estímulo continúa hasta fin
      ctx.fillStyle = colorEstimulo;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(xToPx(estIniciado), pad.top - estiHeight - 2, xToPx(T_TOTAL) - xToPx(estIniciado), estiHeight);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = colorEstimulo;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('Estímulo', pad.left + plotW - 4, pad.top - 4);

    // Curva V_m(t)
    ctx.fillStyle = colorVmFill;
    ctx.beginPath();
    ctx.moveTo(xToPx(0), yToPx(yMin));
    for (const p of sim.trayectoria) {
      ctx.lineTo(xToPx(p.t), yToPx(p.v));
    }
    ctx.lineTo(xToPx(T_TOTAL), yToPx(yMin));
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colorVm;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < sim.trayectoria.length; i++) {
      const p = sim.trayectoria[i];
      if (i === 0) ctx.moveTo(xToPx(p.t), yToPx(p.v));
      else ctx.lineTo(xToPx(p.t), yToPx(p.v));
    }
    ctx.stroke();

    // Marcas de spikes
    for (const spike of sim.spikes) {
      ctx.fillStyle = '#48A9A6';
      ctx.beginPath();
      ctx.arc(xToPx(spike.pico), yToPx(V_PEAK), 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [sim, umbral]);

  useEffect(() => { dibujar(); }, [dibujar]);
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

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>⚡ Simulador del Potencial de Acción</h1>
        <p className={styles.subtitle}>
          Lanza estímulos a una neurona y observa el disparo (o no) en directo. La <strong>ley del &quot;todo
          o nada&quot;</strong>: subumbral nada pasa, supraumbral PA completo de mismo tamaño.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>
          Modelo simplificado de Hodgkin-Huxley: el potencial de membrana parte del reposo (−70 mV).
          Un estímulo despolariza la neurona; si supera el umbral (típicamente −55 mV), se dispara un
          <strong> potencial de acción</strong> con la forma canónica (despolarización rápida →
          repolarización → hiperpolarización). Si NO supera el umbral, solo hay respuesta pasiva (vuelve al reposo).
        </p>

        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${modo === 'unico' ? styles.modeBtnActive : ''}`}
            onClick={() => setModo('unico')}
            aria-pressed={modo === 'unico'}
          >
            <span className={styles.modeIcon}>⚡</span>
            <span className={styles.modeName}>Estímulo único</span>
            <span className={styles.modeDesc}>Un pulso. Verás 0 o 1 PA según intensidad.</span>
          </button>
          <button
            className={`${styles.modeBtn} ${modo === 'sostenido' ? styles.modeBtnActive : ''}`}
            onClick={() => setModo('sostenido')}
            aria-pressed={modo === 'sostenido'}
          >
            <span className={styles.modeIcon}>🔁</span>
            <span className={styles.modeName}>Estímulo sostenido</span>
            <span className={styles.modeDesc}>Pulsos repetidos: trenes de PA, frecuencia variable.</span>
          </button>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Intensidad del estímulo (<strong>{fmt(intensidad, 0)} u.a.</strong>)
              </label>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={intensidad}
                onChange={e => setIntensidad(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Intensidad del estímulo"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Umbral de disparo (<strong>{umbral} mV</strong>)
              </label>
              <input
                type="range"
                min={-65}
                max={-40}
                step={1}
                value={umbral}
                onChange={e => setUmbral(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Umbral"
              />
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Duración del pulso (<strong>{fmt(duracion, 1)} ms</strong>)
              </label>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={duracion}
                onChange={e => setDuracion(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Duración del estímulo"
              />
            </div>
            {modo === 'sostenido' && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>
                  Intervalo entre pulsos (<strong>{fmt(intervaloSostenido, 1)} ms</strong>)
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={intervaloSostenido}
                  onChange={e => setIntervaloSostenido(parseFloat(e.target.value))}
                  className={styles.slider}
                  aria-label="Intervalo entre pulsos"
                />
              </div>
            )}
          </div>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Potencial de membrana V_m(t) frente al tiempo" />
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#2E86AB' }} />
              V_m(t) potencial de membrana
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#A82E68' }} />
              Umbral de disparo
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#E07A1F' }} />
              Estímulo aplicado
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#48A9A6' }} />
              Pico de PA disparado
            </span>
          </div>
        </div>

        {/* STATUS */}
        <div className={`${styles.statusBar} ${disparo ? styles.statusFire : styles.statusNoFire}`}>
          {disparo
            ? `✅ La neurona DISPARA. ${numSpikes} potencial${numSpikes > 1 ? 'es' : ''} de acción registrado${numSpikes > 1 ? 's' : ''}.`
            : '❌ Estímulo SUBUMBRAL: la neurona no dispara, vuelve al reposo.'}
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel}>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>¿Disparó?</span>
            <span className={styles.resultValue} style={{ color: disparo ? '#48A9A6' : '#A82E68' }}>
              {disparo ? 'Sí' : 'No'}
            </span>
            <span className={styles.resultRange}>{disparo ? 'Supraumbral' : 'Subumbral'}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Nº potenciales de acción</span>
            <span className={styles.resultValue}>{numSpikes}</span>
            <span className={styles.resultRange}>en {T_TOTAL} ms</span>
          </div>
          {latencia !== null && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Latencia (1.er PA)</span>
              <span className={styles.resultValue}>{fmt(latencia, 2)} ms</span>
              <span className={styles.resultRange}>desde inicio del estímulo</span>
            </div>
          )}
          {frecuencia !== null && (
            <div className={styles.resultCard}>
              <span className={styles.resultLabel}>Frecuencia de disparo</span>
              <span className={styles.resultValue}>{fmt(frecuencia, 0)} Hz</span>
              <span className={styles.resultRange}>{fmt(1000 / frecuencia, 1)} ms entre PAs</span>
            </div>
          )}
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>V_m máximo alcanzado</span>
            <span className={styles.resultValue}>{fmt(sim.alturaMaxAlcanzada, 1)} mV</span>
            <span className={styles.resultRange}>{disparo ? 'pico del PA' : 'subumbral'}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Despolarización por estímulo</span>
            <span className={styles.resultValue}>+{fmt(intensidad, 0)} mV</span>
            <span className={styles.resultRange}>≈ {V_REPOSO + intensidad} mV (V_target)</span>
          </div>
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende cómo dispara una neurona"
        subtitle="Canales iónicos, el potencial de membrana y la ley del &quot;todo o nada&quot;"
      >
        <section>
          <h3>¿Qué es el potencial de acción?</h3>
          <p>
            El <strong>potencial de acción</strong> (PA) es un cambio rápido y transitorio en el voltaje
            de la membrana de una neurona, de unos 100 mV de amplitud y 2-3 ms de duración. Es el
            mecanismo eléctrico fundamental de transmisión de información en el sistema nervioso.
          </p>
          <p>
            En reposo, la membrana mantiene un voltaje de unos <strong>−70 mV</strong> (interior negativo
            respecto al exterior) gracias a la bomba Na⁺/K⁺ y a canales de fuga de K⁺. Cuando un
            estímulo despolariza la membrana hasta superar un <strong>umbral</strong> (típicamente −55 mV),
            se desencadena el PA en cascada:
          </p>
          <ol className={styles.bulletList}>
            <li><strong>Despolarización rápida</strong>: canales de Na⁺ dependientes de voltaje se abren masivamente; entran iones Na⁺; V_m sube hasta +30 a +40 mV en menos de 1 ms.</li>
            <li><strong>Repolarización</strong>: canales de Na⁺ se inactivan; canales de K⁺ se abren; salen iones K⁺; V_m baja rápido hacia −70 mV.</li>
            <li><strong>Hiperpolarización (afterhyperpolarization)</strong>: los canales de K⁺ tardan en cerrarse; V_m queda momentáneamente más negativo que el reposo (~−85 mV).</li>
            <li><strong>Recuperación</strong>: los canales de K⁺ se cierran; bomba Na⁺/K⁺ restaura el equilibrio; V_m regresa al reposo.</li>
          </ol>
          <div className={styles.formulaBox}>
            Ley del todo-o-nada: si V_m &gt; umbral → PA completo · si V_m &lt; umbral → 0 (respuesta pasiva)
          </div>
        </section>

        <section>
          <h3>Diferencias clave entre tipos de neuronas</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>V reposo</th>
                  <th>Umbral</th>
                  <th>Velocidad conducción</th>
                  <th>Función típica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Motoneurona α (mielinizada)</td>
                  <td>−70 mV</td>
                  <td>−55 mV</td>
                  <td>~120 m/s</td>
                  <td>Movimiento muscular voluntario</td>
                </tr>
                <tr>
                  <td>Fibra C dolor (no mielinizada)</td>
                  <td>−70 mV</td>
                  <td>−50 mV</td>
                  <td>~1 m/s</td>
                  <td>Dolor crónico, sordo</td>
                </tr>
                <tr>
                  <td>Fibra Aδ dolor (mielinizada)</td>
                  <td>−70 mV</td>
                  <td>−55 mV</td>
                  <td>~15 m/s</td>
                  <td>Dolor agudo, punzante</td>
                </tr>
                <tr>
                  <td>Cardíaca SA (marcapasos)</td>
                  <td>−60 mV</td>
                  <td>−40 mV</td>
                  <td>—</td>
                  <td>Genera ritmo del corazón (~70 bpm)</td>
                </tr>
                <tr>
                  <td>Bastones de retina</td>
                  <td>−40 mV</td>
                  <td>NO disparan PA</td>
                  <td>—</td>
                  <td>Visión nocturna (potenciales graduados)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Las neuronas <strong>mielinizadas</strong> conducen más rápido por <em>conducción saltatoria</em>
            entre nódulos de Ranvier. Una pérdida de mielina (esclerosis múltiple) ralentiza drásticamente
            la conducción y produce los síntomas de la enfermedad.
          </p>
        </section>

        <section>
          <h3>4 escenarios donde el PA es la pieza clave</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🧠</span>
              <strong>Aprendizaje y memoria</strong>
              <p>La sincronización de PAs entre neuronas (potenciación a largo plazo, LTP) es la base celular del aprendizaje. Patrones repetidos refuerzan sinapsis y consolidan recuerdos.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>💊</span>
              <strong>Anestésicos locales</strong>
              <p>La lidocaína y otros bloquean canales de Na⁺ dependientes de voltaje. Sin esos canales no hay PA, no hay señal de dolor. Las dentistas y cirujanos usan este principio a diario.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>❤️</span>
              <strong>Ritmo cardíaco</strong>
              <p>Las células del nodo SA disparan PAs espontáneos a ~70 Hz. Marcapasos artificiales reproducen estos pulsos cuando el SA falla. El ECG es el promedio de millones de PAs cardíacos.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🦂</span>
              <strong>Toxinas y venenos</strong>
              <p>Tetrodotoxina (pez globo), veneno de medusa, escorpión: todos atacan canales iónicos. Bloquear Na⁺ paraliza nervios; bloquear K⁺ produce PAs continuos. Letales en dosis pequeñas.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre el PA</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué significa la ley del &quot;todo o nada&quot;?</h4>
              <p>Si el estímulo NO alcanza el umbral, no hay PA: solo respuesta pasiva que decae rápido. Si SÍ lo alcanza (o lo supera), el PA es <strong>siempre del mismo tamaño</strong> e idéntica forma. Aumentar la intensidad NO produce un PA &quot;más grande&quot;; produce más PAs por segundo (codificación por frecuencia).</p>
              <p className={styles.faqTip}>💡 En el simulador, prueba intensidad = 14 (subumbral) y luego 16: verás un cambio brusco de NADA a PA completo.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo codifica una neurona la intensidad de un estímulo?</h4>
              <p>Por <strong>frecuencia de disparo</strong>: estímulos más fuertes producen PAs más rápidos (hasta ~500 Hz, limitado por el periodo refractario). El cerebro decodifica esa frecuencia: muchos PAs/s = sensación intensa, pocos = sensación leve. Es codificación digital por modulación de frecuencia.</p>
              <p className={styles.faqTip}>💡 En el simulador, modo sostenido, sube la intensidad y mira cómo aumenta la frecuencia de spikes.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el periodo refractario?</h4>
              <p>Tras un PA, hay un breve tiempo en que la neurona no puede disparar otro:
              <strong> absoluto</strong> (1-2 ms): canales de Na⁺ inactivados, IMPOSIBLE disparar.
              <strong> relativo</strong> (3-5 ms): hiperpolarización, NECESITA estímulo más fuerte.
              Esto limita la frecuencia máxima a ~500 Hz e impide que el PA &quot;se devuelva&quot; por donde llegó.</p>
              <p className={styles.faqTip}>💡 Es lo que asegura la propagación unidireccional del PA por el axón.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué el PA solo va en un sentido por el axón?</h4>
              <p>Por el <strong>periodo refractario</strong>. Cuando el PA viaja por el axón, la zona inmediatamente posterior está refractaria (canales inactivados). El PA solo puede &quot;saltar&quot; hacia adelante, donde la membrana sí está disponible. Sin refractario, el PA rebotaría infinitamente.</p>
              <p className={styles.faqTip}>💡 La conducción saltatoria entre nódulos de Ranvier (axones mielinizados) acelera ×10-100 la velocidad.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Hay neuronas que NO disparan PA?</h4>
              <p>Sí. Los <strong>bastones y conos</strong> de la retina, las células bipolares y horizontales usan <em>potenciales graduados</em>: el voltaje cambia en cantidad proporcional al estímulo, sin disparo todo-o-nada. Las primeras células ganglionares de la retina sí disparan PAs, propagándolos por el nervio óptico.</p>
              <p className={styles.faqTip}>💡 Los potenciales graduados conservan más información (analógicos), pero solo funcionan en distancias cortas. PAs son digitales y propagan a metros sin pérdida.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo analizar un trazado de potencial de acción</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica el potencial de reposo</strong>
                <p>La línea base, típicamente −70 mV. Si la base está por encima (−60 mV) o por debajo (−85 mV), la neurona no está en reposo normal: hay alguna alteración (despolarización por daño, hiperpolarización post-PA).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Localiza el umbral</strong>
                <p>El nivel a partir del cual cualquier despolarización extra dispara un PA. Típicamente −55 mV. En neurodegeneración (ELA, Parkinson), el umbral cambia: aumenta o disminuye la excitabilidad.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Mide la amplitud del PA</strong>
                <p>De reposo al pico (~100 mV en una neurona sana: −70 a +30). Una amplitud reducida indica daño en canales de Na⁺ o despolarización del reposo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Mide la duración del PA y la latencia</strong>
                <p>Duración típica: 2-3 ms (corteza), hasta 200-500 ms (cardíaca). Latencia desde estímulo hasta inicio del PA: depende de la intensidad, velocidad de membrana y capacitancia.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Identifica la fase de hiperpolarización</strong>
                <p>El undershoot tras el pico (V_m por debajo del reposo). Su profundidad y duración indican el estado de los canales de K⁺ y la velocidad a la que la neurona vuelve a estar lista para disparar.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>4 buenas prácticas con neurofisiología</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Distingue PA de potencial graduado</strong>
              <p>PA: todo-o-nada, amplitud fija, propaga sin pérdida. Graduado: variable, amplitud proporcional al estímulo, decae con la distancia. Cada uno tiene su contexto: dendritas usan graduados, axones usan PAs.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <strong>Memoriza los iones clave</strong>
              <p>Na⁺ entra → despolariza. K⁺ sale → repolariza. Cl⁻ entra → hiperpolariza (inhibitoria). Ca²⁺ entra → libera neurotransmisor en sinapsis. Los 4 cubren 90 % de la fisiología neuronal básica.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Codifica la intensidad por frecuencia</strong>
              <p>Una sola neurona dispara PAs a frecuencias entre 1 y 500 Hz según el estímulo. NO codifica intensidad por amplitud (todo-o-nada). El cerebro lee la frecuencia de muchas neuronas en paralelo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Valora la mielinización</strong>
              <p>Axones mielinizados conducen mucho más rápido. La conducción saltatoria entre nódulos puede multiplicar ×100 la velocidad. Defectos de mielina (esclerosis múltiple) producen síntomas neurológicos variados según el sistema afectado.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con potenciales de acción</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Pensar que un PA &quot;más fuerte&quot; tiene mayor amplitud</strong> — TODOS los PAs de la misma neurona son IDÉNTICOS en forma y amplitud (ley todo-o-nada). Un estímulo más fuerte aumenta la frecuencia, no la amplitud.</li>
            <li><strong>Confundir despolarización con disparar PA</strong> — Una despolarización subumbral (de −70 a −60 mV, por ejemplo) NO produce PA. Solo si supera el umbral (~−55 mV) hay disparo. Confundirlos es muy común.</li>
            <li><strong>Olvidar el periodo refractario</strong> — La frecuencia máxima de disparo está limitada por el refractario, no por el estímulo. Estimular más fuerte por encima de ~500 Hz no produce más PAs: la neurona no puede.</li>
            <li><strong>Asumir que TODAS las neuronas disparan PAs</strong> — Algunas (bastones, conos, células bipolares de retina) usan solo potenciales graduados. La codificación digital con PA es predominante pero no universal.</li>
            <li><strong>Confundir PA con sinapsis</strong> — PA: señal eléctrica DENTRO de UNA neurona, propagándose por el axón. Sinapsis: transmisión química o eléctrica ENTRE dos neuronas. Son conceptos distintos aunque ambos esenciales para la neurotransmisión.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-potencial-accion')} />
      <ShareCard appName="simulador-potencial-accion" />
      <Footer appName="simulador-potencial-accion" />
    </div>
  );
}
