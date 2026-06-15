'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorTermodinamicaCarnot.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// CONSTANTES
// ============================================
const R_GAS = 8.314; // J/(mol·K)
const GAMMA = 5 / 3; // gas monoatómico ideal (cp/cv = 5/3)
const N_MOLES = 1; // 1 mol de gas

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

function fmtSci(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  if (Math.abs(n) >= 0.1 && Math.abs(n) < 100000) {
    return fmt(n, decimales);
  }
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const mantisa = n / Math.pow(10, exp);
  return `${fmt(mantisa, decimales)} × 10^${exp}`;
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorTermodinamicaCarnotPage() {
  const [Tc, setTc] = useState(600); // K (foco caliente)
  const [Tf, setTf] = useState(300); // K (foco frío)
  const [V1, setV1] = useState(1); // L (volumen estado 1)
  const [ratioComp, setRatioComp] = useState(2); // V2/V1 (expansión isoterma)
  const [running, setRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const tCicloRef = useRef<number>(0); // posición en el ciclo: 0..1

  const [, setTick] = useState(0);

  // Garantizar Tc > Tf
  const TcEff = Math.max(Tc, Tf + 1);

  // ============================================
  // CÁLCULO DE LOS 4 ESTADOS DEL CICLO
  // ============================================
  const estados = useMemo(() => {
    // V1, V2 (expansión isoterma a Tc): V2 = V1 * ratioComp
    // V3 (expansión adiabática Tc → Tf): T·V^(γ-1) = cte → V3 = V2 * (Tc/Tf)^(1/(γ-1))
    // V4 (compresión isoterma a Tf): V4 = V3 / ratioComp (mismo ratio para cerrar ciclo)
    // luego adiabática Tf → Tc cierra a V1

    const V1m = V1 / 1000; // m³
    const V2m = V1m * ratioComp;
    const expFactor = Math.pow(TcEff / Tf, 1 / (GAMMA - 1));
    const V3m = V2m * expFactor;
    const V4m = V1m * expFactor;

    // Presiones (gas ideal: PV = nRT)
    const P1 = (N_MOLES * R_GAS * TcEff) / V1m;
    const P2 = (N_MOLES * R_GAS * TcEff) / V2m;
    const P3 = (N_MOLES * R_GAS * Tf) / V3m;
    const P4 = (N_MOLES * R_GAS * Tf) / V4m;

    return {
      e1: { V: V1m, P: P1, T: TcEff },
      e2: { V: V2m, P: P2, T: TcEff },
      e3: { V: V3m, P: P3, T: Tf },
      e4: { V: V4m, P: P4, T: Tf },
    };
  }, [V1, ratioComp, TcEff, Tf]);

  // Calores y trabajos
  const ciclo = useMemo(() => {
    const Q12 = N_MOLES * R_GAS * TcEff * Math.log(estados.e2.V / estados.e1.V); // calor absorbido (>0)
    const Q34 = N_MOLES * R_GAS * Tf * Math.log(estados.e4.V / estados.e3.V); // calor cedido (<0)
    const Wnet = Q12 + Q34; // trabajo neto = calor neto (1.ª ley en ciclo)
    const eta = 1 - Tf / TcEff; // eficiencia ideal de Carnot
    const etaReal = Wnet / Q12; // verificación
    return { Q12, Q34, Wnet, eta, etaReal };
  }, [estados, TcEff, Tf]);

  // ============================================
  // ANIMACIÓN
  // ============================================
  const lastTimeRef = useRef<number>(0);
  const tick = useCallback((tNow: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = tNow;
    const dt = (tNow - lastTimeRef.current) / 1000;
    lastTimeRef.current = tNow;

    // Avanzar el ciclo: una vuelta completa cada 6 segundos
    tCicloRef.current = (tCicloRef.current + dt / 6) % 1;
    setTick(t => t + 1);
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const togglePlay = useCallback(() => {
    if (running) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setRunning(false);
    } else {
      lastTimeRef.current = 0;
      setRunning(true);
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }, [running, tick]);

  const reset = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setRunning(false);
    tCicloRef.current = 0;
    setTick(t => t + 1);
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // ============================================
  // POSICIÓN ACTUAL DEL PUNTO EN EL CICLO
  // ============================================
  const puntoActual = useMemo(() => {
    const t = tCicloRef.current;
    // Cada etapa ocupa 0.25
    if (t < 0.25) {
      // Isoterma Tc: e1 → e2
      const u = t / 0.25;
      const V = estados.e1.V + (estados.e2.V - estados.e1.V) * u;
      const P = (N_MOLES * R_GAS * TcEff) / V;
      return { V, P, etapa: 1 };
    }
    if (t < 0.5) {
      // Adiabática: e2 → e3
      const u = (t - 0.25) / 0.25;
      const V = estados.e2.V + (estados.e3.V - estados.e2.V) * u;
      // P·V^γ = cte → P = P2 · (V2/V)^γ
      const P = estados.e2.P * Math.pow(estados.e2.V / V, GAMMA);
      return { V, P, etapa: 2 };
    }
    if (t < 0.75) {
      // Isoterma Tf: e3 → e4
      const u = (t - 0.5) / 0.25;
      const V = estados.e3.V + (estados.e4.V - estados.e3.V) * u;
      const P = (N_MOLES * R_GAS * Tf) / V;
      return { V, P, etapa: 3 };
    }
    // Adiabática: e4 → e1
    const u = (t - 0.75) / 0.25;
    const V = estados.e4.V + (estados.e1.V - estados.e4.V) * u;
    const P = estados.e4.P * Math.pow(estados.e4.V / V, GAMMA);
    return { V, P, etapa: 4 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estados, TcEff, Tf, tCicloRef.current]);

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
    const colorIso1 = '#A82E68'; // isoterma Tc (calor absorbido) - rojo
    const colorIso2 = '#7FB3D3'; // isoterma Tf (calor cedido) - azul claro
    const colorAdi = '#E07A1F'; // adiabáticas - naranja
    const colorPunto = '#48A9A6';
    const colorArea = 'rgba(46, 134, 171, 0.15)';

    ctx.clearRect(0, 0, W, H);

    // Determinar rango
    const Vmin = estados.e1.V * 0.85;
    const Vmax = estados.e3.V * 1.05;
    const Pmin = estados.e3.P * 0.85;
    const Pmax = estados.e1.P * 1.05;

    const xToPx = (V: number) => pad.left + ((V - Vmin) / (Vmax - Vmin)) * plotW;
    const yToPx = (P: number) => pad.top + plotH - ((P - Pmin) / (Pmax - Pmin)) * plotH;

    // Grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const v = Vmin + (Vmax - Vmin) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(xToPx(v), pad.top);
      ctx.lineTo(xToPx(v), pad.top + plotH);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const p = Pmin + (Pmax - Pmin) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(pad.left, yToPx(p));
      ctx.lineTo(pad.left + plotW, yToPx(p));
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

    // Etiquetas ejes
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const v = Vmin + (Vmax - Vmin) * (i / 5);
      ctx.fillText(`${fmt(v * 1000, 1)}`, xToPx(v), pad.top + plotH + 14);
    }
    ctx.fillText('Volumen V (L)', pad.left + plotW / 2, pad.top + plotH + 30);

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const p = Pmin + (Pmax - Pmin) * (i / 5);
      ctx.fillText(`${fmt(p / 1000, 1)}`, pad.left - 4, yToPx(p) + 4);
    }
    ctx.save();
    ctx.translate(pad.left - 45, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Presión P (kPa)', 0, 0);
    ctx.restore();

    // ÁREA DEL CICLO (= trabajo neto)
    ctx.fillStyle = colorArea;
    ctx.beginPath();
    // Isoterma e1 → e2 (parte superior del lazo)
    let primero = true;
    const N = 100;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const V = estados.e1.V + (estados.e2.V - estados.e1.V) * u;
      const P = (N_MOLES * R_GAS * TcEff) / V;
      const px = xToPx(V);
      const py = yToPx(P);
      if (primero) { ctx.moveTo(px, py); primero = false; }
      else ctx.lineTo(px, py);
    }
    // Adiabática e2 → e3
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const V = estados.e2.V + (estados.e3.V - estados.e2.V) * u;
      const P = estados.e2.P * Math.pow(estados.e2.V / V, GAMMA);
      ctx.lineTo(xToPx(V), yToPx(P));
    }
    // Isoterma e3 → e4
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const V = estados.e3.V + (estados.e4.V - estados.e3.V) * u;
      const P = (N_MOLES * R_GAS * Tf) / V;
      ctx.lineTo(xToPx(V), yToPx(P));
    }
    // Adiabática e4 → e1
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const V = estados.e4.V + (estados.e1.V - estados.e4.V) * u;
      const P = estados.e4.P * Math.pow(estados.e4.V / V, GAMMA);
      ctx.lineTo(xToPx(V), yToPx(P));
    }
    ctx.closePath();
    ctx.fill();

    // Curvas individuales con color
    const dibujarCurva = (
      Vinit: number, Vfin: number,
      curva: (V: number) => number,
      color: string,
      grosor = 2.5
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = grosor;
      ctx.beginPath();
      const N = 100;
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const V = Vinit + (Vfin - Vinit) * u;
        const P = curva(V);
        if (i === 0) ctx.moveTo(xToPx(V), yToPx(P));
        else ctx.lineTo(xToPx(V), yToPx(P));
      }
      ctx.stroke();
    };

    // Isoterma Tc (e1 → e2)
    dibujarCurva(estados.e1.V, estados.e2.V, V => (N_MOLES * R_GAS * TcEff) / V, colorIso1);
    // Adiabática (e2 → e3)
    dibujarCurva(estados.e2.V, estados.e3.V, V => estados.e2.P * Math.pow(estados.e2.V / V, GAMMA), colorAdi);
    // Isoterma Tf (e3 → e4)
    dibujarCurva(estados.e3.V, estados.e4.V, V => (N_MOLES * R_GAS * Tf) / V, colorIso2);
    // Adiabática (e4 → e1)
    dibujarCurva(estados.e4.V, estados.e1.V, V => estados.e4.P * Math.pow(estados.e4.V / V, GAMMA), colorAdi);

    // Puntos numerados
    const dibujarPunto = (V: number, P: number, n: string) => {
      ctx.fillStyle = '#2E86AB';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xToPx(V), yToPx(P), 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(n, xToPx(V), yToPx(P) + 4);
    };
    dibujarPunto(estados.e1.V, estados.e1.P, '1');
    dibujarPunto(estados.e2.V, estados.e2.P, '2');
    dibujarPunto(estados.e3.V, estados.e3.P, '3');
    dibujarPunto(estados.e4.V, estados.e4.P, '4');

    // Punto animado
    if (puntoActual) {
      ctx.fillStyle = colorPunto;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xToPx(puntoActual.V), yToPx(puntoActual.P), 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      // Etiqueta etapa
      ctx.fillStyle = colorPunto;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'left';
      const etapaTexto = puntoActual.etapa === 1 ? '1→2 Isoterma Tc (absorbe Q)' :
                        puntoActual.etapa === 2 ? '2→3 Adiabática (expande)' :
                        puntoActual.etapa === 3 ? '3→4 Isoterma Tf (cede Q)' :
                        '4→1 Adiabática (comprime)';
      ctx.fillText(etapaTexto, xToPx(puntoActual.V) + 14, yToPx(puntoActual.P) + 4);
    }

    // Etiquetas Tc, Tf
    ctx.fillStyle = colorIso1;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Tc = ${TcEff} K`, pad.left + 8, pad.top + 14);
    ctx.fillStyle = colorIso2;
    ctx.fillText(`Tf = ${Tf} K`, pad.left + 8, pad.top + 28);
  }, [estados, TcEff, Tf, puntoActual]);

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
        <h1 className={styles.title}><span aria-hidden="true">🔥</span> Simulador del Ciclo de Carnot</h1>
        <p className={styles.subtitle}>
          El motor térmico ideal: <strong>2 isotermas + 2 adiabáticas</strong>. Visualiza el ciclo en
          un diagrama PV con eficiencia η = 1 − Tf/Tc. La 2.ª ley de la termodinámica al alcance.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>
          El ciclo de Carnot es el motor térmico de máxima eficiencia teórica entre dos focos a
          temperaturas Tc (caliente) y Tf (frío). Ningún motor real puede superarlo. Su eficiencia solo
          depende de la diferencia relativa entre temperaturas, NUNCA del fluido de trabajo.
        </p>

        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Temperatura foco caliente (Tc = <strong>{TcEff} K</strong>) — {fmt(TcEff - 273.15, 0)} °C
              </label>
              <input
                type="range"
                min={400}
                max={1200}
                step={5}
                value={TcEff}
                onChange={e => setTc(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Temperatura foco caliente Tc"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Temperatura foco frío (Tf = <strong>{Tf} K</strong>) — {fmt(Tf - 273.15, 0)} °C
              </label>
              <input
                type="range"
                min={250}
                max={500}
                step={5}
                value={Tf}
                onChange={e => setTf(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Temperatura foco frío Tf"
              />
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Volumen inicial (V₁ = <strong>{fmt(V1, 2)} L</strong>)
              </label>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.1}
                value={V1}
                onChange={e => setV1(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Volumen inicial"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Ratio expansión isoterma (V₂/V₁ = <strong>{fmt(ratioComp, 1)}</strong>)
              </label>
              <input
                type="range"
                min={1.5}
                max={4}
                step={0.1}
                value={ratioComp}
                onChange={e => setRatioComp(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Ratio de expansión"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.actionBtn} onClick={togglePlay} aria-pressed={running}>
              {running ? '⏸ Pausa' : '▶ Animar ciclo'}
            </button>
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={reset}>
              <span aria-hidden="true">🔄</span> Reiniciar
            </button>
          </div>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Diagrama PV del ciclo de Carnot" />
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#A82E68' }} />
              1→2 Isoterma Tc (absorbe Q de la fuente caliente)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#E07A1F' }} />
              2→3 y 4→1 Adiabáticas (sin intercambio de calor)
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#7FB3D3' }} />
              3→4 Isoterma Tf (cede Q al foco frío)
            </span>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
          <div className={styles.resultCardMain}>
            <span className={styles.resultLabel}>Eficiencia η = 1 − Tf/Tc</span>
            <span className={styles.resultValueLarge}>{fmt(ciclo.eta * 100, 2)} %</span>
            <span className={styles.resultRange}>
              Trabajo extraído por unidad de calor absorbido — máximo teórico posible entre Tc y Tf
            </span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Calor absorbido (Tc)</span>
            <span className={styles.resultValue} style={{ color: '#A82E68' }}>+{fmtSci(ciclo.Q12, 1)} J</span>
            <span className={styles.resultRange}>= n·R·Tc·ln(V₂/V₁)</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Calor cedido (Tf)</span>
            <span className={styles.resultValue} style={{ color: '#7FB3D3' }}>{fmtSci(ciclo.Q34, 1)} J</span>
            <span className={styles.resultRange}>= n·R·Tf·ln(V₄/V₃)</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Trabajo neto (Wnet)</span>
            <span className={styles.resultValue} style={{ color: '#48A9A6' }}>{fmtSci(ciclo.Wnet, 1)} J</span>
            <span className={styles.resultRange}>Q absorbido + Q cedido</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>η real (verificación)</span>
            <span className={styles.resultValue}>{fmt(ciclo.etaReal * 100, 2)} %</span>
            <span className={styles.resultRange}>= W/Qc — debe coincidir con η</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>P₁ (estado inicial)</span>
            <span className={styles.resultValue}>{fmt(estados.e1.P / 1000, 1)} kPa</span>
            <span className={styles.resultRange}>{fmt(estados.e1.P / 101325, 2)} atm</span>
          </div>
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende termodinámica con Carnot"
        subtitle="Por qué ningún motor convierte el 100% del calor en trabajo"
      >
        <section>
          <h3>¿Qué es el ciclo de Carnot?</h3>
          <p>
            El <strong>ciclo de Carnot</strong> (Sadi Carnot, 1824) es un ciclo termodinámico ideal y
            reversible compuesto por <strong>cuatro etapas</strong> en serie:
          </p>
          <ol className={styles.bulletList}>
            <li><strong>1 → 2: Expansión isoterma a Tc</strong>. El gas absorbe calor Q₁ del foco caliente y se expande sin cambiar T.</li>
            <li><strong>2 → 3: Expansión adiabática</strong>. Sin intercambio de calor; el gas se expande y enfría hasta Tf.</li>
            <li><strong>3 → 4: Compresión isoterma a Tf</strong>. El gas cede calor Q₂ al foco frío mientras se comprime, sin cambiar T.</li>
            <li><strong>4 → 1: Compresión adiabática</strong>. Sin intercambio de calor; el gas se comprime y calienta hasta Tc, cerrando el ciclo.</li>
          </ol>
          <p>
            La <strong>eficiencia</strong> de un motor térmico es el cociente entre trabajo neto producido
            y calor absorbido del foco caliente. En un ciclo de Carnot ideal, vale <strong>solo</strong>:
          </p>
          <div className={styles.formulaBox}>
            η_Carnot = 1 − T<sub>f</sub> / T<sub>c</sub>
          </div>
          <p>
            Es la <em>cota superior absoluta</em> de cualquier motor térmico real entre esos dos focos.
            Ningún motor, por sofisticado que sea, puede superarla. Solo se acerca a ella.
          </p>
        </section>

        <section>
          <h3>Eficiencia máxima de Carnot frente a motores reales</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Motor</th>
                  <th>Tc típica</th>
                  <th>Tf típica</th>
                  <th>η Carnot máx</th>
                  <th>η real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Motor de gasolina (Otto)</td>
                  <td>~1500 K</td>
                  <td>~500 K</td>
                  <td>67 %</td>
                  <td>25-30 %</td>
                </tr>
                <tr>
                  <td>Motor diésel</td>
                  <td>~2000 K</td>
                  <td>~500 K</td>
                  <td>75 %</td>
                  <td>35-45 %</td>
                </tr>
                <tr>
                  <td>Central térmica de carbón</td>
                  <td>~810 K</td>
                  <td>~310 K</td>
                  <td>62 %</td>
                  <td>33-40 %</td>
                </tr>
                <tr>
                  <td>Central de ciclo combinado (gas)</td>
                  <td>~1700 K</td>
                  <td>~310 K</td>
                  <td>82 %</td>
                  <td>55-60 %</td>
                </tr>
                <tr>
                  <td>Reactor nuclear (PWR)</td>
                  <td>~600 K</td>
                  <td>~310 K</td>
                  <td>48 %</td>
                  <td>32-37 %</td>
                </tr>
                <tr>
                  <td>Cuerpo humano (metabolismo)</td>
                  <td>~310 K</td>
                  <td>~293 K</td>
                  <td>5 %</td>
                  <td>~25 %</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            El cuerpo humano tiene η &gt; η Carnot porque NO funciona como un motor térmico clásico:
            usa energía química (ATP) directamente, no la diferencia de temperaturas.
          </p>
        </section>

        <section>
          <h3>4 escenarios donde Carnot manda</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🏭</span>
              <strong>Centrales eléctricas térmicas</strong>
              <p>Carbón, gas, nuclear: todas convierten calor en trabajo. Su eficiencia está limitada por Carnot. Por eso buscan Tc altísimas y Tf bajas (refrigeración con agua de río o mar).</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🚗</span>
              <strong>Motores de combustión</strong>
              <p>Otto, diésel, Wankel: todos son motores térmicos. Su η está limitada por la T máxima (limitada por materiales del cilindro) y la T del aire ambiente. Por eso los motores en climas fríos son más eficientes.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>❄️</span>
              <strong>Frigoríficos y aires acondicionados</strong>
              <p>Son ciclos de Carnot invertidos: el trabajo se introduce para sacar calor de Tf y cederlo a Tc. Su COP máximo también está limitado: COP = Tf / (Tc − Tf). Por eso los AC son menos eficientes en días muy calurosos.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🌍</span>
              <strong>Cambio climático</strong>
              <p>La Tierra es una máquina térmica gigante: absorbe calor del Sol (Tc ≈ 5800 K en superficie del Sol), cede al espacio frío (Tf ≈ 3 K). η Carnot teórica casi 100 %. Las corrientes atmosféricas y oceánicas son la &quot;turbina&quot; planetaria.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre Carnot y la 2.ª ley</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué η nunca puede ser 100 %?</h4>
              <p>Por la <strong>2.ª ley de la termodinámica</strong>. Para que un motor funcione cíclicamente, el calor absorbido del foco caliente debe llegar de algún sitio. Si convirtieras 100 % en trabajo, no quedaría calor para el foco frío y el ciclo no se cerraría. Cualquier motor cíclico debe ceder algo a Tf.</p>
              <p className={styles.faqTip}>💡 La única forma de η = 100 % sería Tf = 0 K (cero absoluto), físicamente imposible (3.ª ley termodinámica).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué Carnot es el ciclo más eficiente posible?</h4>
              <p>Porque es <strong>reversible</strong>: en cada paso, se intercambia calor con el foco solo cuando ambos están a la misma T (sin diferencia de T finita = sin pérdidas por irreversibilidad). Cualquier ciclo con etapas irreversibles (combustión, fricción, transferencia con ΔT) genera entropía y reduce η.</p>
              <p className={styles.faqTip}>💡 Es físicamente irrealizable: tardaría tiempo infinito por etapa para ser exactamente reversible. Sirve como cota superior teórica.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué relación hay entre η y la entropía?</h4>
              <p>En un ciclo de Carnot, el cambio de entropía es CERO (es reversible y cíclico). El calor absorbido a Tc transfiere entropía Qc/Tc al sistema; el cedido a Tf devuelve Qf/Tf. Como ambos deben sumar 0: Qf/Tf = Qc/Tc, de donde sale η = 1 − Tf/Tc directamente.</p>
              <p className={styles.faqTip}>💡 Si el ciclo NO es reversible, ΔS &gt; 0 y la eficiencia siempre baja. La entropía generada cuesta trabajo perdido.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Para qué sirve si no es realizable?</h4>
              <p>Como <strong>referencia teórica</strong> y benchmark. Si un fabricante anuncia un motor con η = 70 % entre Tc = 800 K y Tf = 400 K, sabes que está mintiendo: el límite Carnot ahí es 50 %. Sirve para evaluar progreso técnico: una central con η = 60 % entre Tc = 1000 K y Tf = 300 K (η Carnot = 70 %) está aprovechando el 86 % del máximo teórico, una muy buena cifra.</p>
              <p className={styles.faqTip}>💡 La &quot;eficiencia exergética&quot; mide exactamente esto: η real / η Carnot. Un valor cercano a 1 indica un sistema muy bien diseñado.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿La 2.ª ley dice que el universo &quot;morirá&quot;?</h4>
              <p>Sí, según la interpretación tradicional. La entropía total del universo solo crece (o se mantiene); cuando alcance su máximo, no habrá más diferencias de T y ningún motor podrá funcionar. Es la &quot;muerte térmica&quot; del universo. Pero ocurriría en escalas de tiempo &gt;&gt; 10⁴⁰ años, así que no es preocupación inmediata.</p>
              <p className={styles.faqTip}>💡 Con cosmología moderna (universo en expansión acelerada) hay debate filosófico abierto sobre esto, pero la 2.ª ley termodinámica clásica predice exactamente eso.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo resolver un problema de Carnot paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica las temperaturas Tc y Tf en kelvin</strong>
                <p>SIEMPRE en kelvin (K = °C + 273,15). Si te dan en °C, convierte primero. Confundir Celsius con kelvin es el error #1 en termodinámica.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula η = 1 − Tf/Tc</strong>
                <p>Resultado entre 0 y 1 (multiplica por 100 para %). Si te sale negativo, has invertido Tc y Tf. Si te sale &gt; 1, has confundido las temperaturas con Celsius.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Si te dan Qc, calcula W = η · Qc</strong>
                <p>El trabajo neto producido es la fracción η del calor absorbido. El resto, Qc − W, es el calor cedido al foco frío.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Si te piden Qf, usa Qf = Qc − W = Qc · (1 − η) = Qc · Tf/Tc</strong>
                <p>El calor cedido es siempre menor que el absorbido. Si te sale Qf &gt; Qc, hay un error: el motor estaría &quot;creando&quot; energía.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Verifica con conservación de energía</strong>
                <p>Qc = W + Qf. Si la suma del trabajo extraído más el calor cedido al frío no iguala al calor absorbido, hay error. La 1.ª ley termodinámica nunca falla.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>4 buenas prácticas con problemas de Carnot</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Distingue motor térmico de bomba/frigorífico</strong>
              <p>Motor: Tc → Tf, extrae trabajo, η = W/Qc. Frigorífico: Tf → Tc, consume trabajo, COP = Qf/W. Las fórmulas son distintas: confundirlos da resultados absurdos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>Recuerda: η solo depende de Tc y Tf</strong>
              <p>NO depende del fluido (gas, vapor, hidrógeno), de la presión ni del volumen. Cambiar fluido NO mejora η Carnot. Solo subir Tc o bajar Tf lo mejora.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚖️</span>
              <strong>Calcula la entropía como check</strong>
              <p>En Carnot reversible: Qc/Tc + Qf/Tf = 0 (cero generación de entropía). Si esa suma no da 0, hay un error en algún Q. Es la mejor verificación rápida.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Para ciclos reales (Otto, diésel) hay otras fórmulas</strong>
              <p>Otto: η = 1 − 1/r^(γ−1), donde r es la relación de compresión. Diésel: η = 1 − [r^(γ−1) (β−1)] / [γ(β−1)·r^(γ−1)·(rb−1)]. NO confundas con Carnot, son distintos.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con Carnot</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Trabajar con T en Celsius</strong> — η = 1 − Tf/Tc requiere kelvin. Si pones 27 (°C) en vez de 300 (K), la fórmula explota. Convierte SIEMPRE antes.</li>
            <li><strong>Pensar que η solo depende de la diferencia Tc − Tf</strong> — Es el cociente Tf/Tc lo que importa. (1000 K, 600 K) da η = 40 %; (700 K, 300 K) da η = 57 %. Misma diferencia (400 K), η muy distintas.</li>
            <li><strong>Olvidar que el calor cedido tiene signo negativo</strong> — Por convención IUPAC: Q absorbido por el sistema es +, Q cedido es −. Si trabajas con valores absolutos, mantente consistente: |Q_cedido| = |Q_abs| − |W|.</li>
            <li><strong>Aplicar Carnot a un proceso no cíclico</strong> — Carnot se refiere a un MOTOR funcionando cíclicamente. Una expansión isoterma sola no es Carnot, es solo un proceso. La eficiencia η solo tiene sentido para ciclos completos.</li>
            <li><strong>Confundir &quot;eficiencia&quot; con &quot;rendimiento&quot;</strong> — En español ambos términos se usan con distintos sentidos según el autor. En termodinámica, &quot;eficiencia&quot; = W/Qc (siempre 0 a 1). &quot;Rendimiento&quot; a veces se usa igual, a veces como W/Q_total. Aclara el contexto.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-termodinamica-carnot')} />
      <ShareCard appName="simulador-termodinamica-carnot" />
      <Footer appName="simulador-termodinamica-carnot" />
    </div>
  );
}
