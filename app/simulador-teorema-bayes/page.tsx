'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorTeoremaBayes.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type Modo = 'arbol' | 'rectangulo';

interface Escenario {
  id: string;
  nombre: string;
  icono: string;
  prevalencia: number;  // P(D)
  sensibilidad: number; // P(+|D)
  especificidad: number; // P(-|¬D)
  notas: string;
}

const ESCENARIOS: Escenario[] = [
  {
    id: 'covid_rapido',
    nombre: 'Test rápido COVID',
    icono: '🦠',
    prevalencia: 0.05,
    sensibilidad: 0.85,
    especificidad: 0.97,
    notas: 'Antígenos en pico de incidencia (5%). Sensibilidad limitada vs PCR (~70-90%).',
  },
  {
    id: 'mamografia',
    nombre: 'Mamografía cribado',
    icono: '🎀',
    prevalencia: 0.008,
    sensibilidad: 0.85,
    especificidad: 0.92,
    notas: 'Mujeres asintomáticas 50-69. Prevalencia muy baja (~0,8%) → muchos falsos positivos.',
  },
  {
    id: 'vih',
    nombre: 'Test VIH ELISA',
    icono: '🧬',
    prevalencia: 0.003,
    sensibilidad: 0.999,
    especificidad: 0.998,
    notas: 'Población general España (~0,3%). Excelente sens/esp pero VPP aún limitado.',
  },
  {
    id: 'psa',
    nombre: 'Antígeno PSA (próstata)',
    icono: '🩺',
    prevalencia: 0.07,
    sensibilidad: 0.20,
    especificidad: 0.94,
    notas: 'Hombres &gt;50: ~7% cáncer próstata. Sensibilidad muy baja (≈20%) → muchos falsos negativos.',
  },
  {
    id: 'dopaje',
    nombre: 'Dopaje deportivo',
    icono: '🚴',
    prevalencia: 0.10,
    sensibilidad: 0.95,
    especificidad: 0.99,
    notas: 'Asume 10% deportistas dopados. Resultados acumulados en grandes campañas (Tour, etc.).',
  },
];

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

function fmtPct(p: number, decimales = 2): string {
  return `${fmt(p * 100, decimales)} %`;
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorTeoremaBayesPage() {
  const [modo, setModo] = useState<Modo>('rectangulo');
  const [escenarioId, setEscenarioId] = useState<string>('covid_rapido');
  const [prevalencia, setPrevalencia] = useState(0.05);
  const [sensibilidad, setSensibilidad] = useState(0.85);
  const [especificidad, setEspecificidad] = useState(0.97);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cargarEscenario = useCallback((esc: Escenario) => {
    setEscenarioId(esc.id);
    setPrevalencia(esc.prevalencia);
    setSensibilidad(esc.sensibilidad);
    setEspecificidad(esc.especificidad);
  }, []);

  const escenarioActual = ESCENARIOS.find(e => e.id === escenarioId);

  // ============================================
  // CÁLCULOS BAYESIANOS
  // ============================================
  const calculo = useMemo(() => {
    const N = 1000; // referencia para diagrama de árbol
    const D = N * prevalencia;
    const noD = N - D;

    const truePos = D * sensibilidad;
    const falseNeg = D - truePos;
    const trueNeg = noD * especificidad;
    const falsePos = noD - trueNeg;

    const totalPos = truePos + falsePos;
    const totalNeg = trueNeg + falseNeg;

    // VPP: P(D|+) = TP / (TP + FP)
    const vpp = totalPos > 0 ? truePos / totalPos : 0;
    // VPN: P(¬D|-) = TN / (TN + FN)
    const vpn = totalNeg > 0 ? trueNeg / totalNeg : 0;
    // Tasa falsos positivos relativa = 1 - especificidad
    const tasaFP = 1 - especificidad;
    // Tasa falsos negativos = 1 - sensibilidad
    const tasaFN = 1 - sensibilidad;

    return {
      D, noD, truePos, falseNeg, trueNeg, falsePos,
      totalPos, totalNeg,
      vpp, vpn, tasaFP, tasaFN,
    };
  }, [prevalencia, sensibilidad, especificidad]);

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

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorAxis = isDark ? '#666' : '#999';
    const colorTP = '#48A9A6'; // verde teal: TP
    const colorFN = '#A82E68'; // rosa oscuro: FN
    const colorFP = '#E07A1F'; // naranja: FP
    const colorTN = '#7FB3D3'; // azul claro: TN

    ctx.clearRect(0, 0, W, H);

    if (modo === 'rectangulo') {
      // ===== RECTÁNGULO PROPORCIONAL =====
      const pad = { top: 30, right: 30, bottom: 80, left: 30 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      // El rectángulo total representa 1 (toda la población)
      // Eje vertical: prevalencia (D arriba / ¬D abajo)
      // Eje horizontal en zona D: sensibilidad / 1-sens
      // Eje horizontal en zona ¬D: 1-esp / esp
      const rectX = pad.left;
      const rectY = pad.top;
      const rectW = plotW;
      const rectH = plotH;

      const dH = rectH * prevalencia;       // altura de la franja D
      const noDH = rectH * (1 - prevalencia); // altura de la franja ¬D

      // Franja D (arriba)
      const tpW = rectW * sensibilidad;
      const fnW = rectW - tpW;

      ctx.fillStyle = colorTP;
      ctx.fillRect(rectX, rectY, tpW, dH);
      ctx.fillStyle = colorFN;
      ctx.fillRect(rectX + tpW, rectY, fnW, dH);

      // Franja ¬D (abajo)
      const fpW = rectW * (1 - especificidad);
      const tnW = rectW - fpW;

      ctx.fillStyle = colorFP;
      ctx.fillRect(rectX, rectY + dH, fpW, noDH);
      ctx.fillStyle = colorTN;
      ctx.fillRect(rectX + fpW, rectY + dH, tnW, noDH);

      // Bordes
      ctx.strokeStyle = isDark ? '#999' : '#444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rectX, rectY, rectW, rectH);
      // Línea horizontal D / ¬D
      ctx.beginPath();
      ctx.moveTo(rectX, rectY + dH);
      ctx.lineTo(rectX + rectW, rectY + dH);
      ctx.stroke();
      // Líneas verticales TP/FN y FP/TN
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(rectX + tpW, rectY);
      ctx.lineTo(rectX + tpW, rectY + dH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rectX + fpW, rectY + dH);
      ctx.lineTo(rectX + fpW, rectY + rectH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etiquetas
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';

      // TP
      if (dH > 18 && tpW > 30) {
        ctx.fillText('TP', rectX + tpW / 2, rectY + dH / 2 - 2);
        ctx.font = '10px system-ui';
        ctx.fillText(`${fmt(calculo.truePos, 1)}`, rectX + tpW / 2, rectY + dH / 2 + 14);
        ctx.font = 'bold 12px system-ui';
      }
      // FN
      if (dH > 18 && fnW > 30) {
        ctx.fillText('FN', rectX + tpW + fnW / 2, rectY + dH / 2 - 2);
        ctx.font = '10px system-ui';
        ctx.fillText(`${fmt(calculo.falseNeg, 1)}`, rectX + tpW + fnW / 2, rectY + dH / 2 + 14);
        ctx.font = 'bold 12px system-ui';
      }
      // FP
      if (noDH > 18 && fpW > 30) {
        ctx.fillText('FP', rectX + fpW / 2, rectY + dH + noDH / 2 - 2);
        ctx.font = '10px system-ui';
        ctx.fillText(`${fmt(calculo.falsePos, 1)}`, rectX + fpW / 2, rectY + dH + noDH / 2 + 14);
        ctx.font = 'bold 12px system-ui';
      }
      // TN
      if (noDH > 18 && tnW > 30) {
        ctx.fillText('TN', rectX + fpW + tnW / 2, rectY + dH + noDH / 2 - 2);
        ctx.font = '10px system-ui';
        ctx.fillText(`${fmt(calculo.trueNeg, 1)}`, rectX + fpW + tnW / 2, rectY + dH + noDH / 2 + 14);
        ctx.font = 'bold 12px system-ui';
      }

      // Etiquetas laterales D / ¬D
      ctx.fillStyle = colorText;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`Enfermos (${fmtPct(prevalencia, 1)})`, rectX - 4, rectY + dH / 2 + 4);
      ctx.fillText(`Sanos (${fmtPct(1 - prevalencia, 1)})`, rectX - 4, rectY + dH + noDH / 2 + 4);

      // Etiqueta abajo: leyenda Test+ / Test-
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px system-ui';
      ctx.fillText('← Test + (positivos)', rectX + (Math.max(tpW, fpW)) / 2, rectY + rectH + 16);
      ctx.fillText('Test - (negativos) →', rectX + rectW - (Math.max(fnW, tnW)) / 2, rectY + rectH + 16);

      // Resumen
      ctx.font = '11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(
        `De cada 1000 personas: ${fmt(calculo.D, 0)} enfermas, ${fmt(calculo.noD, 0)} sanas. Total positivos: ${fmt(calculo.totalPos, 0)} (${fmt(calculo.truePos, 0)} TP + ${fmt(calculo.falsePos, 0)} FP)`,
        rectX, rectY + rectH + 36
      );
      ctx.fillText(
        `VPP = TP / (TP + FP) = ${fmt(calculo.truePos, 1)} / ${fmt(calculo.totalPos, 1)} = ${fmtPct(calculo.vpp, 1)}`,
        rectX, rectY + rectH + 52
      );
    } else {
      // ===== DIAGRAMA DE ÁRBOL =====
      const pad = { top: 30, right: 30, bottom: 30, left: 30 };
      const plotW = W - pad.left - pad.right;
      const plotH = H - pad.top - pad.bottom;

      // 3 niveles: raíz (1000) → enfermos/sanos → +/-
      const rootX = pad.left + plotW / 2;
      const rootY = pad.top + 10;

      const lvl1Y = pad.top + plotH * 0.30;
      const lvl1X1 = pad.left + plotW * 0.25;
      const lvl1X2 = pad.left + plotW * 0.75;

      const lvl2Y = pad.top + plotH * 0.70;
      const offsetX = plotW * 0.12;
      const lvl2X11 = lvl1X1 - offsetX;
      const lvl2X12 = lvl1X1 + offsetX;
      const lvl2X21 = lvl1X2 - offsetX;
      const lvl2X22 = lvl1X2 + offsetX;

      // Enlaces
      const drawLink = (x1: number, y1: number, x2: number, y2: number, etiqueta: string, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        // Etiqueta
        ctx.fillStyle = color;
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(etiqueta, (x1 + x2) / 2, (y1 + y2) / 2 - 4);
      };

      drawLink(rootX, rootY + 18, lvl1X1, lvl1Y - 22, fmtPct(prevalencia, 1), colorFN);
      drawLink(rootX, rootY + 18, lvl1X2, lvl1Y - 22, fmtPct(1 - prevalencia, 1), colorTN);
      drawLink(lvl1X1, lvl1Y + 22, lvl2X11, lvl2Y - 22, fmtPct(sensibilidad, 1), colorTP);
      drawLink(lvl1X1, lvl1Y + 22, lvl2X12, lvl2Y - 22, fmtPct(1 - sensibilidad, 1), colorFN);
      drawLink(lvl1X2, lvl1Y + 22, lvl2X21, lvl2Y - 22, fmtPct(1 - especificidad, 1), colorFP);
      drawLink(lvl1X2, lvl1Y + 22, lvl2X22, lvl2Y - 22, fmtPct(especificidad, 1), colorTN);

      // Nodos
      const drawNode = (x: number, y: number, label: string, valor: string, color: string, size = 30) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 2);
        ctx.font = '10px system-ui';
        ctx.fillText(valor, x, y + 12);
      };

      drawNode(rootX, rootY, 'Total', '1000', '#2E86AB', 28);
      drawNode(lvl1X1, lvl1Y, 'D', fmt(calculo.D, 0), '#A82E68', 28);
      drawNode(lvl1X2, lvl1Y, '¬D', fmt(calculo.noD, 0), '#7FB3D3', 28);

      drawNode(lvl2X11, lvl2Y, 'TP', fmt(calculo.truePos, 1), colorTP, 28);
      drawNode(lvl2X12, lvl2Y, 'FN', fmt(calculo.falseNeg, 1), colorFN, 28);
      drawNode(lvl2X21, lvl2Y, 'FP', fmt(calculo.falsePos, 1), colorFP, 28);
      drawNode(lvl2X22, lvl2Y, 'TN', fmt(calculo.trueNeg, 1), colorTN, 28);

      // Etiqueta inferior
      ctx.fillStyle = colorText;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Enfermos (D)', lvl1X1, lvl1Y + 50);
      ctx.fillText('Sanos (¬D)', lvl1X2, lvl1Y + 50);

      ctx.font = '10px system-ui';
      ctx.fillText('Test +', lvl2X11, lvl2Y + 48);
      ctx.fillText('Test −', lvl2X12, lvl2Y + 48);
      ctx.fillText('Test +', lvl2X21, lvl2Y + 48);
      ctx.fillText('Test −', lvl2X22, lvl2Y + 48);

      // Subrayado conceptos
      ctx.fillStyle = colorAxis;
      ctx.textAlign = 'left';
      ctx.font = '10px system-ui';
      ctx.fillText('TP = verdadero positivo · FN = falso negativo', pad.left, pad.top + plotH + 4);
      ctx.fillText('FP = falso positivo · TN = verdadero negativo', pad.left, pad.top + plotH + 18);
    }
  }, [modo, prevalencia, sensibilidad, especificidad, calculo]);

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
        <h1 className={styles.title}>🎲 Simulador del Teorema de Bayes</h1>
        <p className={styles.subtitle}>
          Visualiza por qué un test &quot;99% preciso&quot; puede dar más <strong>falsos positivos</strong> que
          verdaderos. La paradoja bayesiana en directo, con casos médicos reales.
        </p>
      </header>

      <LegalNotice />

      {/* MODO */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeBtn} ${modo === 'rectangulo' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('rectangulo')}
          aria-pressed={modo === 'rectangulo'}
        >
          <span className={styles.modeIcon}>🟦</span>
          <span className={styles.modeName}>Rectángulo proporcional</span>
          <span className={styles.modeDesc}>Áreas = probabilidades, ideal para ver la paradoja</span>
        </button>
        <button
          className={`${styles.modeBtn} ${modo === 'arbol' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('arbol')}
          aria-pressed={modo === 'arbol'}
        >
          <span className={styles.modeIcon}>🌳</span>
          <span className={styles.modeName}>Diagrama de árbol</span>
          <span className={styles.modeDesc}>1000 personas dividiéndose por categorías</span>
        </button>
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        {/* Escenarios */}
        <div className={styles.scenarioSelector}>
          {ESCENARIOS.map(esc => (
            <button
              key={esc.id}
              className={`${styles.scenarioBtn} ${escenarioId === esc.id ? styles.scenarioBtnActive : ''}`}
              onClick={() => cargarEscenario(esc)}
              aria-pressed={escenarioId === esc.id}
            >
              <span>{esc.icono}</span>
              <span>{esc.nombre}</span>
            </button>
          ))}
        </div>

        <p className={styles.descriptionCard}>
          {escenarioActual && <><strong>{escenarioActual.nombre}</strong>: {escenarioActual.notas}</>}
        </p>

        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Prevalencia P(D) = <strong>{fmtPct(prevalencia, 2)}</strong>
              </label>
              <input
                type="range"
                min={0.001}
                max={0.5}
                step={0.001}
                value={prevalencia}
                onChange={e => setPrevalencia(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Prevalencia"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Sensibilidad P(+|D) = <strong>{fmtPct(sensibilidad, 1)}</strong>
              </label>
              <input
                type="range"
                min={0.50}
                max={0.999}
                step={0.001}
                value={sensibilidad}
                onChange={e => setSensibilidad(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Sensibilidad"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Especificidad P(−|¬D) = <strong>{fmtPct(especificidad, 1)}</strong>
              </label>
              <input
                type="range"
                min={0.50}
                max={0.999}
                step={0.001}
                value={especificidad}
                onChange={e => setEspecificidad(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Especificidad"
              />
            </div>
          </div>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="Visualización del teorema de Bayes" />
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#48A9A6' }} />
              TP — verdaderos positivos
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#A82E68' }} />
              FN — falsos negativos
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#E07A1F' }} />
              FP — falsos positivos
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#7FB3D3' }} />
              TN — verdaderos negativos
            </span>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel}>
          <div className={styles.resultCardMain}>
            <span className={styles.resultLabel}>VPP — Si el test sale POSITIVO, P(estar enfermo)</span>
            <span className={styles.resultValueLarge}>{fmtPct(calculo.vpp, 1)}</span>
            <span className={styles.resultRange}>
              Pre-test: {fmtPct(prevalencia, 2)} → Post-test: {fmtPct(calculo.vpp, 1)} (cambio ×{fmt(calculo.vpp / prevalencia, 1)})
            </span>
          </div>

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>VPN — Si el test sale NEGATIVO, P(estar sano)</span>
            <span className={styles.resultValue}>{fmtPct(calculo.vpn, 2)}</span>
            <span className={styles.resultRange}>P(¬D|−) = TN / (TN + FN)</span>
          </div>

          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Falsos positivos por 1000</span>
            <span className={styles.resultValue} style={{ color: '#E07A1F' }}>{fmt(calculo.falsePos, 0)}</span>
            <span className={styles.resultRange}>{fmtPct(calculo.falsePos / calculo.totalPos, 1)} de los positivos</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Verdaderos positivos por 1000</span>
            <span className={styles.resultValue} style={{ color: '#48A9A6' }}>{fmt(calculo.truePos, 1)}</span>
            <span className={styles.resultRange}>{fmtPct(calculo.truePos / calculo.totalPos, 1)} de los positivos</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Falsos negativos por 1000</span>
            <span className={styles.resultValue} style={{ color: '#A82E68' }}>{fmt(calculo.falseNeg, 1)}</span>
            <span className={styles.resultRange}>1 − sensibilidad = {fmtPct(1 - sensibilidad, 1)}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Tasa global de positivos</span>
            <span className={styles.resultValue}>{fmtPct(calculo.totalPos / 1000, 2)}</span>
            <span className={styles.resultRange}>{fmt(calculo.totalPos, 0)} de 1000</span>
          </div>
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="📚 Aprende el teorema de Bayes"
        subtitle="La fórmula que cambia tu intuición sobre tests, evidencia y diagnóstico"
      >
        <section>
          <h3>¿Qué dice el teorema de Bayes?</h3>
          <p>
            El <strong>teorema de Bayes</strong> calcula la probabilidad de una hipótesis (D) dada una
            evidencia observada (+), invirtiendo el condicional. Es una de las herramientas más potentes
            de toda la estadística aplicada:
          </p>
          <div className={styles.formulaBox}>
            P(D | +) = [ P(+ | D) · P(D) ] / P(+)
          </div>
          <p>
            Donde P(+) = P(+|D)·P(D) + P(+|¬D)·P(¬D) (regla de la probabilidad total). En el contexto
            de tests médicos:
          </p>
          <ul className={styles.bulletList}>
            <li><strong>P(D)</strong>: prevalencia de la enfermedad en la población (probabilidad a priori).</li>
            <li><strong>P(+|D)</strong>: sensibilidad del test (verdadero positivo cuando hay enfermedad).</li>
            <li><strong>P(−|¬D)</strong>: especificidad del test (verdadero negativo cuando NO hay enfermedad).</li>
            <li><strong>P(D|+)</strong> = VPP: lo que el paciente realmente quiere saber al recibir un positivo.</li>
          </ul>
          <p>
            La paradoja bayesiana surge porque P(+|D) ≠ P(D|+). Aunque la sensibilidad sea 99 %, si la
            prevalencia es muy baja, los falsos positivos pueden superar a los verdaderos: <strong>el VPP
            puede ser mucho menor de lo que parece</strong>.
          </p>
        </section>

        <section>
          <h3>Cómo cambia el VPP con la prevalencia (test del 95% sens / 95% esp)</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Prevalencia P(D)</th>
                  <th>De 10000 personas: enfermas</th>
                  <th>TP</th>
                  <th>FP</th>
                  <th>VPP = P(D|+)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0,1 % (raro)</td>
                  <td>10</td>
                  <td>9,5</td>
                  <td>500</td>
                  <td><strong>1,87 %</strong></td>
                </tr>
                <tr>
                  <td>1 %</td>
                  <td>100</td>
                  <td>95</td>
                  <td>495</td>
                  <td><strong>16,1 %</strong></td>
                </tr>
                <tr>
                  <td>5 %</td>
                  <td>500</td>
                  <td>475</td>
                  <td>475</td>
                  <td><strong>50,0 %</strong></td>
                </tr>
                <tr>
                  <td>10 %</td>
                  <td>1000</td>
                  <td>950</td>
                  <td>450</td>
                  <td><strong>67,9 %</strong></td>
                </tr>
                <tr>
                  <td>50 %</td>
                  <td>5000</td>
                  <td>4750</td>
                  <td>250</td>
                  <td><strong>95,0 %</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Mismo test, prevalencias distintas, VPP <strong>radicalmente</strong> distintos. Por eso los
            tests indiscriminados en poblaciones de baja prevalencia generan tantos falsos positivos.
          </p>
        </section>

        <section>
          <h3>4 escenarios donde Bayes es la herramienta clave</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🩺</span>
              <strong>Diagnóstico médico</strong>
              <p>Cualquier test (PCR, mamografía, biopsia) tiene VPP que depende de la prevalencia local. Por eso los criterios de cribado masivo evitan poblaciones de muy baja prevalencia (más daño que beneficio por sobrediagnóstico).</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📨</span>
              <strong>Filtros de spam</strong>
              <p>Spam-Bayes y derivados clasifican correos calculando P(spam|palabras). Aprenden de cada email que marcas: actualizan los priors. Es de lejos el filtro más potente con datos limitados.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>⚖️</span>
              <strong>Decisión judicial</strong>
              <p>Pruebas forenses (ADN, huellas) tienen tasas de error que el jurado interpreta mal sin Bayes. La &quot;falacia del fiscal&quot;: confundir P(prueba|inocente) con P(inocente|prueba). Errores graves cuando el sospechoso es uno entre miles.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🤖</span>
              <strong>Machine learning</strong>
              <p>Los clasificadores Naive Bayes, redes bayesianas y métodos bayesianos en general se basan directamente en el teorema. Es la base teórica de gran parte del aprendizaje supervisado moderno.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre el teorema de Bayes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo es posible que un test del 99% acierte poco?</h4>
              <p>Porque cuando la <strong>prevalencia es muy baja</strong>, los falsos positivos arrasan. Si tienes 1 enfermo en 10000 sanos (prev 0,01 %) y un test 99 % preciso, te dará ~100 falsos positivos por cada verdadero positivo: VPP ≈ 1 %. El test &quot;funciona bien&quot;, pero un positivo aislado significa muy poco.</p>
              <p className={styles.faqTip}>💡 En el simulador, fija sensibilidad = 99 % y especificidad = 99 %, baja la prevalencia y mira cómo se desploma el VPP.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Sensibilidad o especificidad: cuál es más importante?</h4>
              <p>Depende del contexto. <strong>Sensibilidad alta</strong> es crucial cuando NO querer perder ningún caso es prioritario (cribado oncológico, COVID en pico). <strong>Especificidad alta</strong> es crucial cuando un falso positivo causa daño (biopsia innecesaria, alarma de drogas en deportistas). El equilibrio depende del coste de cada error.</p>
              <p className={styles.faqTip}>💡 Curva ROC: la herramienta para visualizar el trade-off sensibilidad ↔ especificidad al variar el umbral.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es la falacia del fiscal?</h4>
              <p>Confundir <strong>P(evidencia|inocente)</strong> con <strong>P(inocente|evidencia)</strong>. Si una prueba ADN tiene tasa de coincidencia 1 entre 1 millón en inocentes, y hay 30 millones de inocentes potenciales, podrías esperar ~30 coincidencias inocentes. La probabilidad de que el sospechoso concreto sea inocente NO es 1 entre 1 millón. Bayes lo corrige.</p>
              <p className={styles.faqTip}>💡 Casos famosos como Sally Clark (UK) o el de Lucia de Berk (NL) tuvieron condenas con esta falacia que después fueron anuladas.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué se hacen tests de confirmación tras un positivo?</h4>
              <p>Porque dos tests independientes con el mismo positivo elevan muchísimo el VPP combinado. Si un primer test da 50 % VPP, hacer un segundo test independiente del 95 % de especificidad eleva el VPP combinado por encima del 95 %. Es Bayes aplicado iterativamente: el primer positivo es el nuevo prior del segundo test.</p>
              <p className={styles.faqTip}>💡 Por eso un test rápido COVID positivo se confirmaba con PCR antes de tomar decisiones clínicas.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Estadística clásica (frecuentista) vs bayesiana?</h4>
              <p>Frecuentista: probabilidad como frecuencia a largo plazo, no admite probabilidades sobre hipótesis. Bayesiana: probabilidad como grado de creencia, sí admite P(hipótesis). Bayes permite actualizar creencias con nueva evidencia (prior → posterior). Hoy se complementan; el debate filosófico está prácticamente cerrado.</p>
              <p className={styles.faqTip}>💡 La inferencia bayesiana ha resurgido enormemente con la potencia de cálculo moderna (MCMC, computación). Stan, PyMC, brms son frameworks populares.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo aplicar Bayes paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica los 3 datos: P(D), P(+|D), P(−|¬D)</strong>
                <p>Prevalencia (cuántos enfermos hay), sensibilidad (qué % detecta), especificidad (qué % de sanos descarta). Sin estos 3, no se puede calcular VPP.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Construye una tabla 2×2 con 1000 personas</strong>
                <p>Filas: D / ¬D. Columnas: + / −. Calcula TP, FN, FP, TN. Es la forma más visual y menos propensa a errores que sustituir directamente en la fórmula.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Suma los positivos: TP + FP</strong>
                <p>Es el denominador del VPP. Representa cuántas personas darán positivo en total (verdaderos + falsos).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula VPP = TP / (TP + FP)</strong>
                <p>Esto es P(D|+): la probabilidad de estar enfermo dado que el test ha salido positivo. Es lo que el paciente quiere saber.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Compara post-test con pre-test</strong>
                <p>El VPP debe ser mayor que la prevalencia (un positivo elevó la probabilidad). Si la diferencia es pequeña (factor &lt;5), el test aporta poco. Si es grande (factor &gt;100), aporta mucho.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>4 buenas prácticas con Bayes</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Trabaja siempre con frecuencias naturales</strong>
              <p>&quot;De cada 1000 personas, 50 están enfermas&quot; es más fácil de razonar que &quot;P(D) = 0,05&quot;. Estudios de Gigerenzer y Hoffrage demuestran que las frecuencias mejoran la comprensión hasta un 80 %.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Comprueba sensibilidad y especificidad por separado</strong>
              <p>Un test puede tener sens 99 % y esp 50 %: muchísimos falsos positivos. O viceversa. Mira ambas SIEMPRE, no aceptes &quot;tiene 99 % de precisión&quot;: ese término es ambiguo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Itera con tests sucesivos</strong>
              <p>Un primer positivo vuelve el prior. Un segundo test calcula posterior usando ese prior. Aplicar Bayes iterativamente da VPPs combinados muy altos con dos tests independientes mediocres.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Verifica con la regla de probabilidad total</strong>
              <p>P(+) = P(+|D)·P(D) + P(+|¬D)·P(¬D). Si la suma de tus 4 categorías (TP+FN+FP+TN) no da el total, hay un error. Es la verificación más rápida.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con el teorema de Bayes</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir P(+|D) con P(D|+)</strong> — Es el error más extendido y peligroso. La sensibilidad NO es el VPP. Si la prevalencia es baja, P(+|D) puede ser 99 % y P(D|+) puede ser 5 %. NUNCA los iguales sin pensar.</li>
            <li><strong>Olvidar la prevalencia</strong> — Una persona te dice que dio positivo en un test del 95 % y le respondes &quot;tienes 95 % de probabilidad de estar enfermo&quot;. ERROR: depende totalmente de la prevalencia en su grupo. Pregunta primero por la base.</li>
            <li><strong>Falacia del fiscal</strong> — En contexto judicial: confundir P(prueba|inocente) (lo bajo, ej. 1 millón) con P(inocente|prueba) (puede ser muy distinto). Ha costado condenas injustas, debate hasta hoy.</li>
            <li><strong>Asumir independencia entre tests</strong> — Para iterar Bayes (test 1 → test 2), los tests deben ser INDEPENDIENTES. Si dos tests usan el mismo principio (dos PCRs en mismo laboratorio con mismo cebador) sus errores correlacionan: el VPP combinado NO es producto.</li>
            <li><strong>Ignorar el sesgo de selección</strong> — La &quot;prevalencia en quien se hace el test&quot; es muy distinta a la prevalencia poblacional. Si tu paciente tiene síntomas y va al médico, su pre-prevalencia ya es mucho mayor que el 0,1 % poblacional. Bayes sigue valiendo, pero hay que ajustar P(D).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-teorema-bayes')} />
      <ShareCard appName="simulador-teorema-bayes" />
      <Footer appName="simulador-teorema-bayes" />
    </div>
  );
}
