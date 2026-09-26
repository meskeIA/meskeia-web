'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorTermodinamicaCarnot.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatPercentage } from '@/lib';

// ============================================
// CONSTANTES
// ============================================
const R_GAS = 8.314; // J/(mol·K)
const GAMMA = 5 / 3; // gas monoatómico ideal (cp/cv = 5/3)
const N_MOLES = 1; // 1 mol de gas

// Rangos de los deslizadores de temperatura (K) y su paso
const PASO_T = 5;
const TC_MIN = 400;
const TC_MAX = 1200;
const TF_MIN = 250;
const TF_MAX = 500;

/** Espacio duro (U+00A0) para unir una cifra con su unidad o con el signo %. */
const NBSP = '\u00A0';

/** Etiquetas de cada etapa en el canvas: completa y corta (para anchos de móvil). */
const ETAPAS: Record<number, { larga: string; corta: string }> = {
  1: { larga: '1→2 Isoterma Tc (absorbe Q)', corta: '1→2 Isoterma Tc' },
  2: { larga: '2→3 Adiabática (expande)', corta: '2→3 Adiabática' },
  3: { larga: '3→4 Isoterma Tf (cede Q)', corta: '3→4 Isoterma Tf' },
  4: { larga: '4→1 Adiabática (comprime)', corta: '4→1 Adiabática' },
};

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

  // Tc siempre por encima de Tf, sin cambiar nunca un valor que el usuario no ha tocado:
  // cada deslizador se acota al otro (Tc ≥ Tf + 5 K y Tf ≤ Tc − 5 K). Con Tc ≤ Tf no hay
  // motor térmico (η ≤ 0), así que el control no deja llegar ahí y el rótulo lo dice.
  // Los dos extremos caen en múltiplos de 5, así que el pulgar siempre marca lo que se calcula.
  const tcMin = Math.max(TC_MIN, Tf + PASO_T);
  const tfMax = Math.min(TF_MAX, Tc - PASO_T);

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
    const expFactor = Math.pow(Tc / Tf, 1 / (GAMMA - 1));
    const V3m = V2m * expFactor;
    const V4m = V1m * expFactor;

    // Presiones (gas ideal: PV = nRT)
    const P1 = (N_MOLES * R_GAS * Tc) / V1m;
    const P2 = (N_MOLES * R_GAS * Tc) / V2m;
    const P3 = (N_MOLES * R_GAS * Tf) / V3m;
    const P4 = (N_MOLES * R_GAS * Tf) / V4m;

    return {
      e1: { V: V1m, P: P1, T: Tc },
      e2: { V: V2m, P: P2, T: Tc },
      e3: { V: V3m, P: P3, T: Tf },
      e4: { V: V4m, P: P4, T: Tf },
    };
  }, [V1, ratioComp, Tc, Tf]);

  // Calores y trabajos
  const ciclo = useMemo(() => {
    const Q12 = N_MOLES * R_GAS * Tc * Math.log(estados.e2.V / estados.e1.V); // calor absorbido (>0)
    const Q34 = N_MOLES * R_GAS * Tf * Math.log(estados.e4.V / estados.e3.V); // calor cedido (<0)
    const Wnet = Q12 + Q34; // trabajo neto = calor neto (1.ª ley en ciclo)
    const eta = 1 - Tf / Tc; // eficiencia ideal de Carnot
    const wSobreQc = Wnet / Q12; // comprobación de la 1.ª ley: en el ciclo ideal coincide con η
    return { Q12, Q34, Wnet, eta, wSobreQc };
  }, [estados, Tc, Tf]);

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
      const P = (N_MOLES * R_GAS * Tc) / V;
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
  }, [estados, Tc, Tf, tCicloRef.current]);

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
    // La banda superior (pad.top) lleva los rótulos Tc/Tf y la etapa, FUERA del área del
    // diagrama: dentro tapaban el punto 1 y se pisaban entre sí (hallazgo 2261).
    const estrecho = W < 420;
    const pad = { top: 46, right: estrecho ? 12 : 30, bottom: 50, left: 64 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Colores desde los tokens del módulo: cada uno tiene su variante oscura en el CSS.
    const estilo = getComputedStyle(canvas);
    const token = (nombre: string, respaldo: string): string =>
      estilo.getPropertyValue(nombre).trim() || respaldo;
    const colorAxis = token('--text-secondary', '#666');
    const colorGrid = token('--border', '#E5E5E5');
    const colorText = token('--text-primary', '#1A1A1A');
    const colorIso1 = token('--carnot-caliente', '#A82E68'); // isoterma Tc (calor absorbido)
    const colorIso2 = token('--carnot-frio', '#2A6A99'); // isoterma Tf (calor cedido)
    const colorAdi = token('--carnot-adiabatica', '#A65600'); // adiabáticas
    const colorPunto = token('--carnot-trabajo', '#2F7470');
    const colorMarcador = token('--primary-boton', '#26718F');
    const colorBorde = token('--bg-primary', '#FAFAFA');
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

    // Etiquetas ejes (en móvil, una marca de cada dos en V para que no se pisen)
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      if (estrecho && i % 2 === 1) continue;
      const v = Vmin + (Vmax - Vmin) * (i / 5);
      ctx.fillText(formatNumber(v * 1000, 1), xToPx(v), pad.top + plotH + 14);
    }
    ctx.fillText('Volumen V (L)', pad.left + plotW / 2, pad.top + plotH + 32);

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const p = Pmin + (Pmax - Pmin) * (i / 5);
      ctx.fillText(formatNumber(p / 1000, 1), pad.left - 4, yToPx(p) + 4);
    }
    ctx.save();
    ctx.translate(10, pad.top + plotH / 2);
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
      const P = (N_MOLES * R_GAS * Tc) / V;
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
    dibujarCurva(estados.e1.V, estados.e2.V, V => (N_MOLES * R_GAS * Tc) / V, colorIso1);
    // Adiabática (e2 → e3)
    dibujarCurva(estados.e2.V, estados.e3.V, V => estados.e2.P * Math.pow(estados.e2.V / V, GAMMA), colorAdi);
    // Isoterma Tf (e3 → e4)
    dibujarCurva(estados.e3.V, estados.e4.V, V => (N_MOLES * R_GAS * Tf) / V, colorIso2);
    // Adiabática (e4 → e1)
    dibujarCurva(estados.e4.V, estados.e1.V, V => estados.e4.P * Math.pow(estados.e4.V / V, GAMMA), colorAdi);

    // Puntos numerados
    const dibujarPunto = (V: number, P: number, n: string) => {
      ctx.fillStyle = colorMarcador;
      ctx.strokeStyle = colorBorde;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xToPx(V), yToPx(P), 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
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
      ctx.strokeStyle = colorBorde;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(xToPx(puntoActual.V), yToPx(puntoActual.P), 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    // Banda superior, fuera del diagrama: línea 1 «Tc = … K   Tf = … K», línea 2 la etapa.
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'left';
    const xBanda = 8;
    const textoTc = `Tc = ${Tc} K`;
    ctx.fillStyle = colorIso1;
    ctx.fillText(textoTc, xBanda, 14);
    ctx.fillStyle = colorIso2;
    ctx.fillText(`Tf = ${Tf} K`, xBanda + ctx.measureText(textoTc).width + 16, 14);

    if (puntoActual) {
      const etiquetas = ETAPAS[puntoActual.etapa];
      const colorEtapa = puntoActual.etapa === 1 ? colorIso1 : puntoActual.etapa === 3 ? colorIso2 : colorAdi;
      const disponible = W - xBanda - 4;
      const etapaTexto = ctx.measureText(etiquetas.larga).width <= disponible ? etiquetas.larga : etiquetas.corta;
      ctx.fillStyle = colorEtapa;
      ctx.fillText(etapaTexto, xBanda, 30);
    }
  }, [estados, Tc, Tf, puntoActual]);

  useEffect(() => { dibujar(); }, [dibujar]);
  useEffect(() => {
    const handleResize = () => dibujar();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dibujar]);
  useEffect(() => {
    const observer = new MutationObserver(dibujar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-brand'] });
    return () => observer.disconnect();
  }, [dibujar]);

  // Alternativa textual del canvas y tabla de estados (V, P, T de los cuatro vértices)
  const tcCelsius = formatNumber(Tc - 273.15, 0);
  const tfCelsius = formatNumber(Tf - 273.15, 0);
  const listaEstados = [
    { n: '1', e: estados.e1 },
    { n: '2', e: estados.e2 },
    { n: '3', e: estados.e3 },
    { n: '4', e: estados.e4 },
  ];
  const descripcionDiagrama =
    `Diagrama PV del ciclo de Carnot entre Tc = ${Tc} K y Tf = ${Tf} K. ` +
    listaEstados
      .map(({ n, e }) => `Estado ${n}: V = ${formatNumber(e.V * 1000, 2)} L, P = ${formatNumber(e.P / 1000, 1)} kPa`)
      .join('; ') +
    '.';

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
              <label className={styles.controlLabel} htmlFor="carnot-tc">
                Temperatura foco caliente (Tc = <strong>{Tc} K</strong>) — {tcCelsius} °C
              </label>
              <input
                id="carnot-tc"
                type="range"
                min={tcMin}
                max={TC_MAX}
                step={PASO_T}
                value={Tc}
                onChange={e => setTc(Math.min(TC_MAX, Math.max(tcMin, Number(e.target.value))))}
                className={styles.slider}
                aria-label="Temperatura foco caliente Tc"
                aria-valuetext={`${Tc} K (${tcCelsius} °C)`}
                aria-describedby="carnot-tc-rango"
              />
              <span id="carnot-tc-rango" className={styles.controlHint}>
                De {tcMin} a {TC_MAX} K: Tc queda siempre al menos {PASO_T} K por encima de Tf, porque
                con Tc ≤ Tf no hay motor térmico (η ≤ 0).
              </span>
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel} htmlFor="carnot-tf">
                Temperatura foco frío (Tf = <strong>{Tf} K</strong>) — {tfCelsius} °C
              </label>
              <input
                id="carnot-tf"
                type="range"
                min={TF_MIN}
                max={tfMax}
                step={PASO_T}
                value={Tf}
                onChange={e => setTf(Math.max(TF_MIN, Math.min(tfMax, Number(e.target.value))))}
                className={styles.slider}
                aria-label="Temperatura foco frío Tf"
                aria-valuetext={`${Tf} K (${tfCelsius} °C)`}
                aria-describedby="carnot-tf-rango"
              />
              <span id="carnot-tf-rango" className={styles.controlHint}>
                De {TF_MIN} a {tfMax} K: siempre por debajo de Tc.
              </span>
            </div>
          </div>

          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel} htmlFor="carnot-v1">
                Volumen inicial (V₁ = <strong>{formatNumber(V1, 2)} L</strong>)
              </label>
              <input
                id="carnot-v1"
                type="range"
                min={0.5}
                max={5}
                step={0.1}
                value={V1}
                onChange={e => setV1(Number(e.target.value))}
                className={styles.slider}
                aria-label="Volumen inicial"
                aria-valuetext={`${formatNumber(V1, 2)} litros`}
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel} htmlFor="carnot-ratio">
                Ratio expansión isoterma (V₂/V₁ = <strong>{formatNumber(ratioComp, 1)}</strong>)
              </label>
              <input
                id="carnot-ratio"
                type="range"
                min={1.5}
                max={4}
                step={0.1}
                value={ratioComp}
                onChange={e => setRatioComp(Number(e.target.value))}
                className={styles.slider}
                aria-label="Ratio de expansión"
                aria-valuetext={`V₂ igual a ${formatNumber(ratioComp, 1)} veces V₁`}
              />
            </div>
          </div>

          <div className={styles.actions}>
            {/* Rótulo que cambia (Animar ciclo ↔ Pausa): por eso sin aria-pressed, que anunciaría «Pausa, pulsado». */}
            <button type="button" className={styles.actionBtn} onClick={togglePlay}>
              <span aria-hidden="true">{running ? '⏸' : '▶'}</span> {running ? 'Pausa' : 'Animar ciclo'}
            </button>
            <button type="button" className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={reset}>
              <span aria-hidden="true">🔄</span> Reiniciar
            </button>
          </div>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label={descripcionDiagrama}
          >
            {descripcionDiagrama}
          </canvas>
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendCaliente}`} />
              1→2 Isoterma Tc (absorbe Q de la fuente caliente)
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendAdiabatica}`} />
              2→3 y 4→1 Adiabáticas (sin intercambio de calor)
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.legendFrio}`} />
              3→4 Isoterma Tf (cede Q al foco frío)
            </span>
          </div>
          <div className={styles.tablaWrapper}>
            <table className={`${styles.tabla} ${styles.tablaEstados}`}>
              <caption className={styles.tablaCaption}>Los 4 estados del ciclo</caption>
              <thead>
                <tr>
                  <th scope="col">Estado</th>
                  <th scope="col">V (L)</th>
                  <th scope="col">P (kPa)</th>
                  <th scope="col">T (K)</th>
                </tr>
              </thead>
              <tbody>
                {listaEstados.map(({ n, e }) => (
                  <tr key={n}>
                    <th scope="row">{n}</th>
                    <td>{formatNumber(e.V * 1000, 2)}</td>
                    <td>{formatNumber(e.P / 1000, 1)}</td>
                    <td>{e.T}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
          <div className={styles.resultCardMain}>
            <span className={styles.resultLabel}>Eficiencia η = 1 − Tf/Tc</span>
            <span className={styles.resultValueLarge}>{formatPercentage(ciclo.eta, 2)}</span>
            <span className={styles.resultRange}>
              Trabajo extraído por unidad de calor absorbido — máximo teórico posible entre Tc y Tf
            </span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Calor absorbido (Tc)</span>
            <span className={`${styles.resultValue} ${styles.valorCaliente}`}>+{formatNumber(ciclo.Q12, 1)} J</span>
            <span className={styles.resultRange}>= n·R·Tc·ln(V₂/V₁)</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Calor cedido (Tf)</span>
            <span className={`${styles.resultValue} ${styles.valorFrio}`}>{formatNumber(ciclo.Q34, 1)} J</span>
            <span className={styles.resultRange}>= n·R·Tf·ln(V₄/V₃)</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Trabajo neto (Wnet)</span>
            <span className={`${styles.resultValue} ${styles.valorTrabajo}`}>{formatNumber(ciclo.Wnet, 1)} J</span>
            <span className={styles.resultRange}>Q absorbido + Q cedido</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>W/Qc (comprobación)</span>
            <span className={styles.resultValue}>{formatPercentage(ciclo.wSobreQc, 2)}</span>
            <span className={styles.resultRange}>1.ª ley: en el ciclo ideal coincide siempre con η</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>P₁ (estado inicial)</span>
            <span className={styles.resultValue}>{formatNumber(estados.e1.P / 1000, 1)} kPa</span>
            <span className={styles.resultRange}>{formatNumber(estados.e1.P / 101325, 2)} atm</span>
          </div>
        </div>

        <p className={styles.supuestos}>
          <strong>Datos del cálculo:</strong> gas ideal monoatómico, n = {N_MOLES} mol,
          R = {formatNumber(R_GAS, 3)} J/(mol·K) y γ = c<sub>p</sub>/c<sub>v</sub> = 5/3, que da la
          forma de las adiabáticas (P·V<sup>γ</sup> = cte). Con ellos, Qc = n·R·Tc·ln(V₂/V₁),
          Qf = n·R·Tf·ln(V₄/V₃) y P₁ = n·R·Tc/V₁ se pueden rehacer a mano.
        </p>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="Aprende termodinámica con Carnot"
        subtitle={`Por qué ningún motor convierte el 100${NBSP}% del calor en trabajo`}
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
                  <td>67 %</td>
                  <td>25-30 %</td>
                </tr>
                <tr>
                  <td>Motor diésel</td>
                  <td>~2000 K</td>
                  <td>~500 K</td>
                  <td>75 %</td>
                  <td>35-45 %</td>
                </tr>
                <tr>
                  <td>Central térmica de carbón</td>
                  <td>~810 K</td>
                  <td>~310 K</td>
                  <td>62 %</td>
                  <td>33-40 %</td>
                </tr>
                <tr>
                  <td>Central de ciclo combinado (gas)</td>
                  <td>~1700 K</td>
                  <td>~310 K</td>
                  <td>82 %</td>
                  <td>55-60 %</td>
                </tr>
                <tr>
                  <td>Reactor nuclear (PWR)</td>
                  <td>~600 K</td>
                  <td>~310 K</td>
                  <td>48 %</td>
                  <td>32-37 %</td>
                </tr>
                <tr>
                  <td>Cuerpo humano (metabolismo)</td>
                  <td>~310 K</td>
                  <td>~293 K</td>
                  <td>5 %</td>
                  <td>~25 %</td>
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
              <span className={styles.scenarioIcon} aria-hidden="true">🏭</span>
              <strong>Centrales eléctricas térmicas</strong>
              <p>Carbón, gas, nuclear: todas convierten calor en trabajo. Su eficiencia está limitada por Carnot. Por eso buscan Tc altísimas y Tf bajas (refrigeración con agua de río o mar).</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚗</span>
              <strong>Motores de combustión</strong>
              <p>Otto, diésel, Wankel: todos son motores térmicos, y Carnot les pone un techo según la T máxima de la combustión (que acotan los materiales del cilindro) y la del escape. Pero su rendimiento ideal sale de su propio ciclo: en el Otto depende de la relación de compresión, no de la temperatura ambiente. En la práctica, con frío el consumo de un coche suele empeorar (motor y aceite fríos tardan más en llegar a su temperatura de trabajo).</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">❄️</span>
              <strong>Frigoríficos y aires acondicionados</strong>
              <p>Casi todos funcionan con un ciclo de compresión de vapor, y su límite ideal es el ciclo de Carnot invertido: se introduce trabajo para sacar calor de Tf y cederlo a Tc. Ese límite fija el COP máximo de refrigeración: COP = Tf / (Tc − Tf). Por eso los aires acondicionados rinden menos en días muy calurosos.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🌍</span>
              <strong>La Tierra como máquina térmica</strong>
              <p>La Tierra recibe la radiación del Sol, que emite como un cuerpo a unos 5800 K, y la devuelve al espacio emitiendo como un cuerpo a unos 255 K (su temperatura efectiva de emisión, no los 3 K del fondo cósmico). Por el camino, las diferencias de temperatura entre trópicos y polos, y entre la superficie y las capas altas, mueven vientos y corrientes oceánicas: la &quot;turbina&quot; planetaria. Como motor rinde muy poco: casi todo el calor absorbido se reemite sin convertirse en movimiento.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre Carnot y la 2.ª ley</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué η nunca puede ser 100 %?</h4>
              <p>Por la <strong>2.ª ley de la termodinámica</strong>. Para que un motor funcione cíclicamente, el calor absorbido del foco caliente debe llegar de algún sitio. Si convirtieras 100 % en trabajo, no quedaría calor para el foco frío y el ciclo no se cerraría. Cualquier motor cíclico debe ceder algo a Tf.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> La única forma de η = 100 % sería Tf = 0 K (cero absoluto), físicamente imposible (3.ª ley termodinámica).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué Carnot es el ciclo más eficiente posible?</h4>
              <p>Porque es <strong>reversible</strong>: en cada paso, se intercambia calor con el foco solo cuando ambos están a la misma T (sin diferencia de T finita = sin pérdidas por irreversibilidad). Cualquier ciclo con etapas irreversibles (combustión, fricción, transferencia con ΔT) genera entropía y reduce η.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Es físicamente irrealizable: tardaría tiempo infinito por etapa para ser exactamente reversible. Sirve como cota superior teórica. No es el único ciclo reversible: los ciclos Stirling y Ericsson con regeneración ideal también lo son y alcanzan el mismo η = 1 − Tf/Tc, porque todos los ciclos reversibles entre los mismos dos focos tienen igual rendimiento (teorema de Carnot).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué relación hay entre η y la entropía?</h4>
              <p>En un ciclo de Carnot, el cambio de entropía es CERO (es reversible y cíclico). El calor absorbido a Tc transfiere entropía Qc/Tc al sistema; el cedido a Tf devuelve Qf/Tf. Como ambos deben sumar 0: Qf/Tf = Qc/Tc, de donde sale η = 1 − Tf/Tc directamente.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Si el ciclo NO es reversible, ΔS &gt; 0 y la eficiencia siempre baja. La entropía generada cuesta trabajo perdido.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Para qué sirve si no es realizable?</h4>
              <p>Como <strong>referencia teórica</strong> y benchmark. Si un fabricante anuncia un motor con η = 70 % entre Tc = 800 K y Tf = 400 K, sabes que está mintiendo: el límite Carnot ahí es 50 %. Sirve para evaluar progreso técnico: una central con η = 60 % entre Tc = 1000 K y Tf = 300 K (η Carnot = 70 %) está aprovechando el 86 % del máximo teórico, una muy buena cifra.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> La &quot;eficiencia exergética&quot; mide exactamente esto: η real / η Carnot. Un valor cercano a 1 indica un sistema muy bien diseñado.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿La 2.ª ley dice que el universo &quot;morirá&quot;?</h4>
              <p>Sí, según la interpretación tradicional. La entropía total del universo solo crece (o se mantiene); cuando alcance su máximo, no habrá más diferencias de T y ningún motor podrá funcionar. Es la &quot;muerte térmica&quot; del universo. Pero ocurriría en escalas de tiempo &gt;&gt; 10⁴⁰ años, así que no es preocupación inmediata.</p>
              <p className={styles.faqTip}><span aria-hidden="true">💡</span> Con cosmología moderna (universo en expansión acelerada) hay debate filosófico abierto sobre esto, pero la 2.ª ley termodinámica clásica predice exactamente eso.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo resolver un problema de Carnot paso a paso</h3>
          <p>
            Este método sirve igual para los ejercicios de Física de Bachillerato y la EBAU en España
            como para la preparatoria, la secundaria y la educación media en Latinoamérica, y también
            como repaso en termodinámica universitaria.
          </p>
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
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Distingue motor térmico de bomba/frigorífico</strong>
              <p>Motor: Tc → Tf, extrae trabajo, η = W/Qc. Frigorífico: Tf → Tc, consume trabajo, COP = Qf/W. Las fórmulas son distintas: confundirlos da resultados absurdos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <strong>Recuerda: η solo depende de Tc y Tf</strong>
              <p>NO depende del fluido (gas, vapor, hidrógeno), de la presión ni del volumen. Cambiar fluido NO mejora η Carnot. Solo subir Tc o bajar Tf lo mejora.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <strong>Calcula la entropía como check</strong>
              <p>En Carnot reversible: Qc/Tc + Qf/Tf = 0 (cero generación de entropía). Si esa suma no da 0, hay un error en algún Q. Es la mejor verificación rápida.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <strong>Para ciclos reales (Otto, diésel) hay otras fórmulas</strong>
              <p>Otto: η = 1 − 1/r^(γ−1), donde r es la relación de compresión. Diésel: η = 1 − (1/r^(γ−1))·(β^γ − 1)/[γ(β − 1)], donde β es la relación de corte (volumen al final de la combustión entre volumen al inicio); con r = 18, β = 2 y γ = 1,4 da η ≈ 63,16 %. NO confundas con Carnot, son distintos.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes con Carnot</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Trabajar con T en Celsius</strong> — η = 1 − Tf/Tc requiere kelvin. Si pones 27 (°C) en vez de 300 (K), la fórmula explota. Convierte SIEMPRE antes.</li>
            <li><strong>Pensar que η solo depende de la diferencia Tc − Tf</strong> — Es el cociente Tf/Tc lo que importa. (1000 K, 600 K) da η = 40 %; (700 K, 300 K) da η = 57 %. Misma diferencia (400 K), η muy distintas.</li>
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
