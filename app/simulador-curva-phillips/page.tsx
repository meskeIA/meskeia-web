'use client';
// @disclaimer: exempt

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorCurvaPhillips.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// CONSTANTES
// ============================================
const ALPHA = 0.5;
const U_NATURAL = 5; // NAIRU (%)

// ============================================
// TIPOS
// ============================================
type Clasificacion = 'Recesión' | 'Economía sobrecalentada' | 'Estanflación' | 'Equilibrio ideal' | 'Normal';

interface EpisodioHistorico {
  nombre: string;
  u: number;
  pi: number;
  nota: string;
}

const EPISODIOS: EpisodioHistorico[] = [
  { nombre: 'Crisis 1973 (estanflación)', u: 8, pi: 11, nota: 'Shock petróleo OPEP' },
  { nombre: 'España 2013 (recesión)', u: 26, pi: 1.4, nota: 'Peor desempleo zona euro' },
  { nombre: 'EEUU 2022 (sobrecalentamiento)', u: 3.5, pi: 8, nota: 'Post-COVID' },
  { nombre: 'Eurozona 2019 (equilibrio)', u: 7.5, pi: 1.2, nota: 'Antes de pandemia' },
];

// ============================================
// UTILIDADES
// ============================================
function calcularInflacion(u: number, piE: number, shock: number): number {
  return piE - ALPHA * (u - U_NATURAL) + shock;
}

function clasificar(u: number, pi: number): Clasificacion {
  if (u > U_NATURAL + 2 && pi < 2) return 'Recesión';
  if (u < U_NATURAL - 1 && pi > 5) return 'Economía sobrecalentada';
  if (pi > 5 && u > U_NATURAL) return 'Estanflación';
  if (Math.abs(u - U_NATURAL) < 1 && Math.abs(pi - 2) < 1) return 'Equilibrio ideal';
  return 'Normal';
}

function fmt(n: number, decimales = 1): string {
  return n.toFixed(decimales).replace('.', ',');
}

function descripcionCuadrante(clasificacion: Clasificacion): string {
  switch (clasificacion) {
    case 'Recesión':
      return 'Alto desempleo y baja inflación. La economía tiene capacidad ociosa. Los bancos centrales suelen bajar tipos para estimular la demanda.';
    case 'Economía sobrecalentada':
      return 'Bajo desempleo y alta inflación. La demanda supera la oferta potencial. Los bancos centrales suelen subir tipos para enfriar la economía.';
    case 'Estanflación':
      return 'Alto desempleo y alta inflación simultáneos. El peor escenario: los shocks de oferta negativos empujan hacia este cuadrante. Muy difícil de resolver con política monetaria sola.';
    case 'Equilibrio ideal':
      return 'Desempleo próximo a la NAIRU e inflación cercana al objetivo del 2%. Punto de equilibrio de largo plazo que persiguen los bancos centrales.';
    default:
      return 'Zona intermedia. La economía no se encuentra en un cuadrante extremo, lo que permite cierta flexibilidad en la política monetaria.';
  }
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorCurvaPhillipsPage() {
  const [u, setU] = useState<number>(8);
  const [piE, setPiE] = useState<number>(3);
  const [shock, setShock] = useState<number>(0);
  const [verLP, setVerLP] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const piActual = calcularInflacion(u, piE, shock);
  const clasificacionActual = clasificar(u, piActual);

  // ============================================
  // FUNCIÓN DE DIBUJO
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

    // Colores según tema
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorAxis = isDark ? '#555' : '#999';
    const colorGrid = isDark ? '#333' : '#EEE';
    const colorBg = isDark ? '#1A1A1A' : '#FAFAFA';
    const colorCardBg = isDark ? '#2A2A2A' : '#FFFFFF';

    // Definición de ejes: X = desempleo 0-20%, Y = inflación -5 a +20%
    const xMin = 0;
    const xMax = 20;
    const yMin = -5;
    const yMax = 20;

    const pad = { top: 40, right: 30, bottom: 60, left: 60 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Conversión coordenadas → píxeles
    const toX = (val: number) => pad.left + ((val - xMin) / (xMax - xMin)) * plotW;
    const toY = (val: number) => pad.top + ((yMax - val) / (yMax - yMin)) * plotH;

    // Fondo
    ctx.fillStyle = colorBg;
    ctx.fillRect(0, 0, W, H);

    // Zona sombreada estanflación (u > NAIRU y pi > 5)
    const xNairu = toX(U_NATURAL);
    const xRight = toX(xMax);
    const y5 = toY(5);
    const yTop = toY(yMax);
    ctx.fillStyle = isDark ? 'rgba(200, 60, 60, 0.10)' : 'rgba(220, 80, 80, 0.07)';
    ctx.fillRect(xNairu, yTop, xRight - xNairu, y5 - yTop);

    // Zona sombreada equilibrio ideal (u ≈ NAIRU y pi ≈ 2%)
    const xEqLeft = toX(U_NATURAL - 1);
    const xEqRight = toX(U_NATURAL + 1);
    const yEqTop = toY(3);
    const yEqBottom = toY(1);
    ctx.fillStyle = isDark ? 'rgba(72, 169, 166, 0.15)' : 'rgba(72, 169, 166, 0.10)';
    ctx.fillRect(xEqLeft, yEqTop, xEqRight - xEqLeft, yEqBottom - yEqTop);

    // Grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;

    // Líneas verticales de la cuadrícula
    for (let xi = 0; xi <= xMax; xi += 5) {
      const px = toX(xi);
      ctx.beginPath();
      ctx.moveTo(px, pad.top);
      ctx.lineTo(px, pad.top + plotH);
      ctx.stroke();
    }

    // Líneas horizontales de la cuadrícula
    for (let yi = yMin; yi <= yMax; yi += 5) {
      const py = toY(yi);
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(pad.left + plotW, py);
      ctx.stroke();
    }

    // Plano de fondo visible (recuadro)
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad.left, pad.top, plotW, plotH);

    // Ejes principales (x=0, y=0)
    ctx.strokeStyle = isDark ? '#777' : '#666';
    ctx.lineWidth = 1.5;
    // Eje Y (x=0)
    const xZero = toX(0);
    ctx.beginPath();
    ctx.moveTo(xZero, pad.top);
    ctx.lineTo(xZero, pad.top + plotH);
    ctx.stroke();
    // Eje X (y=0)
    const yZero = toY(0);
    ctx.beginPath();
    ctx.moveTo(pad.left, yZero);
    ctx.lineTo(pad.left + plotW, yZero);
    ctx.stroke();

    // Línea objetivo 2% BCE (horizontal)
    ctx.strokeStyle = isDark ? '#888' : '#AAA';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    const yObj2 = toY(2);
    ctx.beginPath();
    ctx.moveTo(pad.left, yObj2);
    ctx.lineTo(pad.left + plotW, yObj2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isDark ? '#AAA' : '#777';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('Objetivo 2%', pad.left + 4, yObj2 - 4);

    // Línea NAIRU (vertical)
    ctx.strokeStyle = '#48A9A6';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(xNairu, pad.top);
    ctx.lineTo(xNairu, pad.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#48A9A6';
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('NAIRU = 5%', xNairu, pad.top - 6);

    // Curva de Phillips CP₀ (corto plazo, pi_e actual, shock=0)
    ctx.strokeStyle = '#2E86AB';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let primero = true;
    for (let ui = xMin; ui <= xMax; ui += 0.1) {
      const piVal = calcularInflacion(ui, piE, 0);
      if (piVal < yMin || piVal > yMax) { primero = true; continue; }
      const px = toX(ui);
      const py = toY(piVal);
      if (primero) { ctx.moveTo(px, py); primero = false; }
      else { ctx.lineTo(px, py); }
    }
    ctx.stroke();

    // Etiqueta CP₀
    const piMidCP0 = calcularInflacion(10, piE, 0);
    if (piMidCP0 >= yMin && piMidCP0 <= yMax) {
      ctx.fillStyle = '#2E86AB';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('CP₀', toX(10) + 4, toY(piMidCP0) - 4);
    }

    // Curva desplazada CP₁ si shock ≠ 0
    if (Math.abs(shock) > 0.05) {
      ctx.strokeStyle = '#2E86AB';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      let primero2 = true;
      for (let ui = xMin; ui <= xMax; ui += 0.1) {
        const piVal = calcularInflacion(ui, piE, shock);
        if (piVal < yMin || piVal > yMax) { primero2 = true; continue; }
        const px = toX(ui);
        const py = toY(piVal);
        if (primero2) { ctx.moveTo(px, py); primero2 = false; }
        else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const piMidCP1 = calcularInflacion(10, piE, shock);
      if (piMidCP1 >= yMin && piMidCP1 <= yMax) {
        ctx.fillStyle = '#2E86AB';
        ctx.font = 'bold 11px system-ui';
        ctx.textAlign = 'left';
        ctx.fillText('CP₁', toX(10) + 4, toY(piMidCP1) - 4);
      }
    }

    // Curva de largo plazo (línea vertical en NAIRU)
    if (verLP) {
      ctx.strokeStyle = '#48A9A6';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(xNairu, toY(yMax - 0.5));
      ctx.lineTo(xNairu, toY(yMin + 0.5));
      ctx.stroke();

      ctx.fillStyle = '#48A9A6';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Curva Phillips LP', xNairu + 4, toY(15));
    }

    // Punto actual
    const pxActual = toX(u);
    const pyActual = toY(piActual);
    const enRango = piActual >= yMin && piActual <= yMax;

    if (enRango) {
      ctx.fillStyle = '#E83E3E';
      ctx.beginPath();
      ctx.arc(pxActual, pyActual, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = colorCardBg;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Etiqueta del punto
      ctx.fillStyle = colorText;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = pxActual > W - 100 ? 'right' : 'left';
      const labelX = pxActual > W - 100 ? pxActual - 10 : pxActual + 10;
      const labelY = pyActual < pad.top + 20 ? pyActual + 16 : pyActual - 10;
      ctx.fillText(`(${fmt(u, 1)}%, ${fmt(piActual, 1)}%)`, labelX, labelY);
    }

    // Etiquetas de ejes
    ctx.fillStyle = colorText;
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';

    // Eje X: valores
    for (let xi = 0; xi <= xMax; xi += 5) {
      ctx.fillText(`${xi}%`, toX(xi), pad.top + plotH + 16);
    }

    // Eje Y: valores
    ctx.textAlign = 'right';
    for (let yi = yMin; yi <= yMax; yi += 5) {
      ctx.fillText(`${yi}%`, pad.left - 6, toY(yi) + 4);
    }

    // Título de ejes
    ctx.fillStyle = colorAxis;
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Tasa de desempleo u (%)', pad.left + plotW / 2, H - 10);

    ctx.save();
    ctx.translate(14, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Inflación π (%)', 0, 0);
    ctx.restore();

    // Etiquetas de zonas
    ctx.font = '9px system-ui';
    ctx.fillStyle = isDark ? 'rgba(220, 80, 80, 0.7)' : 'rgba(160, 40, 40, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('ESTANFLACIÓN', toX(13), toY(12));

    ctx.fillStyle = isDark ? 'rgba(72, 169, 166, 0.8)' : 'rgba(40, 120, 116, 0.7)';
    ctx.fillText('EQUILIBRIO', toX(U_NATURAL), toY(2));
  }, [u, piE, shock, verLP, piActual]);

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

  // Clase del badge
  function badgeClass(clasificacion: Clasificacion): string {
    switch (clasificacion) {
      case 'Recesión': return styles.badgeRecesion;
      case 'Estanflación': return styles.badgeEstanflacion;
      case 'Equilibrio ideal': return styles.badgeEquilibrio;
      case 'Economía sobrecalentada': return styles.badgeSobrecalentada;
      default: return styles.badgeNormal;
    }
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📉</span> Simulador de la Curva de Phillips</h1>
        <p className={styles.subtitle}>
          Visualiza el <strong>trade-off inflación-desempleo</strong> en tiempo real. Ajusta el desempleo,
          las expectativas y los shocks de oferta para ver cómo se mueve la economía entre recesión, estanflación y equilibrio.
        </p>
      </header>

      <LegalNotice />

      {/* CONTROLES */}
      <div className={styles.slidersGrid}>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Tasa de desempleo u
            <span className={styles.sliderValue}>{fmt(u, 1)} %</span>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            step={0.1}
            value={u}
            onChange={e => setU(parseFloat(e.target.value))}
            className={styles.slider}
            aria-label="Tasa de desempleo"
          />
          <div className={styles.sliderRange}><span>0 %</span><span>20 %</span></div>
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Inflación esperada π<sub>e</sub>
            <span className={styles.sliderValue}>{fmt(piE, 1)} %</span>
          </label>
          <input
            type="range"
            min={0}
            max={15}
            step={0.1}
            value={piE}
            onChange={e => setPiE(parseFloat(e.target.value))}
            className={styles.slider}
            aria-label="Inflación esperada"
          />
          <div className={styles.sliderRange}><span>0 %</span><span>15 %</span></div>
        </div>

        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel}>
            Shock de oferta ε
            <span className={styles.sliderValue} style={{ color: shock > 0 ? '#C0392B' : shock < 0 ? '#27AE60' : undefined }}>
              {shock >= 0 ? '+' : ''}{fmt(shock, 1)} pp
            </span>
          </label>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={shock}
            onChange={e => setShock(parseFloat(e.target.value))}
            className={styles.slider}
            aria-label="Shock de oferta"
          />
          <div className={styles.sliderRange}><span>−5 pp (favorable)</span><span>+5 pp (inflacionario)</span></div>
        </div>
      </div>

      {/* TOGGLE LARGO PLAZO */}
      <div className={styles.toggleLP}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={verLP}
            onChange={e => setVerLP(e.target.checked)}
            className={styles.toggleInput}
            aria-label="Ver curva de largo plazo"
          />
          <span className={styles.toggleSwitch} aria-hidden="true" />
          Ver curva de Phillips a largo plazo (LP)
        </label>
        <span className={styles.toggleHint}>
          La curva LP es vertical en u = NAIRU = 5 %. A largo plazo no existe trade-off inflación-desempleo.
        </span>
      </div>

      {/* CANVAS */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="Gráfico de la curva de Phillips con desempleo en eje X e inflación en eje Y"
        />
        <div className={styles.legendaRow}>
          <span className={styles.legendaItem}><span className={styles.legendaDot} style={{ background: '#2E86AB' }} />CP₀ — curva corto plazo</span>
          <span className={styles.legendaItem}><span className={styles.legendaDot} style={{ background: '#2E86AB', opacity: 0.5 }} />CP₁ — curva con shock</span>
          <span className={styles.legendaItem}><span className={styles.legendaDot} style={{ background: '#48A9A6' }} />NAIRU = 5 %</span>
          <span className={styles.legendaItem}><span className={styles.legendaDot} style={{ background: '#E83E3E' }} />Punto actual</span>
        </div>
      </div>

      {/* PANEL RESULTADOS */}
      <div className={styles.resultadosPanel}>
        <div className={styles.resultadoMain}>
          <span className={styles.resultadoLabel}>Inflación resultante π</span>
          <span className={styles.resultadoValor} role="status" aria-live="polite">
            {fmt(piActual, 1)} %
          </span>
          <span className={styles.resultadoFormula}>
            π = {fmt(piE, 1)} − 0,5 × ({fmt(u, 1)} − 5) {shock !== 0 ? `+ (${shock >= 0 ? '+' : ''}${fmt(shock, 1)})` : ''}
          </span>
        </div>

        <div className={styles.clasificacionWrapper}>
          <span className={styles.clasificacionLabel}>Clasificación económica</span>
          <span className={`${styles.clasificacionBadge} ${badgeClass(clasificacionActual)}`} role="status">
            {clasificacionActual}
          </span>
        </div>

        <div className={styles.interpretacionText}>
          <strong>Interpretación:</strong> Con u = {fmt(u, 1)} % y π = {fmt(piActual, 1)} %, la economía está en <strong>{clasificacionActual}</strong>.{' '}
          {descripcionCuadrante(clasificacionActual)}
        </div>
      </div>

      {/* TABLA HISTÓRICA */}
      <div className={styles.historicaWrapper}>
        <h2 className={styles.historicaTitulo}>Episodios históricos de referencia</h2>
        <div className={styles.tablaWrapper}>
          <table className={styles.historicaTabla}>
            <thead>
              <tr>
                <th>Episodio</th>
                <th>u (%)</th>
                <th>π (%)</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {EPISODIOS.map(ep => (
                <tr key={ep.nombre}>
                  <td>{ep.nombre}</td>
                  <td>{fmt(ep.u, 1)}</td>
                  <td>{fmt(ep.pi, 1)}</td>
                  <td>{ep.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BLOQUE EDUCATIVO v2.0 */}
      <EducationalSection
        title="Aprende la curva de Phillips"
        subtitle="El modelo que explica el dilema permanente entre inflación y desempleo"
      >
        <section>
          <h3>¿Qué es la curva de Phillips?</h3>
          <p>
            La <strong>curva de Phillips</strong> describe la relación inversa entre la tasa de inflación y
            la tasa de desempleo. Fue propuesta por el economista neozelandés A.W. Phillips en 1958 tras
            analizar datos del Reino Unido entre 1861 y 1957: cuando el desempleo bajaba, los salarios (y
            los precios) subían; cuando el desempleo era alto, la inflación era baja o negativa.
          </p>
          <p>
            Esta relación se convirtió en la base de la política macroeconómica de los años 60: los
            gobiernos creían que podían elegir un punto de la curva, aceptando más inflación a cambio de
            menos paro. El modelo fue revolucionado en los años 70 por Milton Friedman y Edmund Phelps,
            que introdujeron el papel de las <strong>expectativas</strong>:
          </p>
          <div className={styles.formulaBox}>
            π = π<sub>e</sub> − α · (u − u<sub>n</sub>) + ε
          </div>
          <p>
            Donde π es la inflación real, π<sub>e</sub> la inflación esperada, α la sensibilidad (0,5 en
            este simulador), u la tasa de desempleo, u<sub>n</sub> la NAIRU (5 %) y ε el shock de oferta.
            A largo plazo, las expectativas se ajustan y la curva es vertical: no existe trade-off permanente.
          </p>
        </section>

        <section>
          <h3>Los 6 cuadrantes del plano de Phillips</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Situación</th>
                  <th>Desempleo</th>
                  <th>Inflación</th>
                  <th>Causa habitual</th>
                  <th>Política recomendada</th>
                  <th>Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Recesión</strong></td>
                  <td>Alto (&gt; NAIRU)</td>
                  <td>Baja (&lt; 2 %)</td>
                  <td>Caída de demanda agregada</td>
                  <td>Política expansiva (bajar tipos, estímulo fiscal)</td>
                  <td>España 2012-2014</td>
                </tr>
                <tr>
                  <td><strong>Estanflación</strong></td>
                  <td>Alto (&gt; NAIRU)</td>
                  <td>Alta (&gt; 5 %)</td>
                  <td>Shock negativo de oferta</td>
                  <td>Sin solución fácil: subir tipos agrava el paro</td>
                  <td>Crisis OPEP 1973-1974</td>
                </tr>
                <tr>
                  <td><strong>Sobrecalentamiento</strong></td>
                  <td>Bajo (&lt; NAIRU)</td>
                  <td>Alta (&gt; 5 %)</td>
                  <td>Exceso de demanda</td>
                  <td>Política contractiva (subir tipos)</td>
                  <td>EEUU 2021-2022</td>
                </tr>
                <tr>
                  <td><strong>Equilibrio ideal</strong></td>
                  <td>≈ NAIRU</td>
                  <td>≈ 2 %</td>
                  <td>Política monetaria bien calibrada</td>
                  <td>Mantener tipos neutros</td>
                  <td>Eurozona 2015-2019</td>
                </tr>
                <tr>
                  <td><strong>LP — NAIRU</strong></td>
                  <td>= NAIRU</td>
                  <td>Cualquier π</td>
                  <td>Equilibrio a largo plazo</td>
                  <td>Las expectativas se ajustan; curva vertical</td>
                  <td>Friedman-Phelps (teoría)</td>
                </tr>
                <tr>
                  <td><strong>Curva desplazada</strong></td>
                  <td>Variable</td>
                  <td>Más alta o baja</td>
                  <td>Shock de oferta o cambio de expectativas</td>
                  <td>Combatir el shock de raíz (energía, confianza)</td>
                  <td>COVID 2020-2021</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>4 episodios históricos que definen la curva de Phillips moderna</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🛢️</span>
              <strong>Estanflación de los 70 (crisis OPEP)</strong>
              <p>El embargo de la OPEP en 1973 disparó el precio del petróleo cuatro veces. La inflación se disparó al mismo tiempo que el desempleo aumentaba: la curva de Phillips &quot;no funcionaba&quot;. Era el primer gran shock de oferta negativo en la historia moderna, que desplazó la curva hacia arriba-derecha. Invalidó el modelo keynesiano simple.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📊</span>
              <strong>Gran Moderación 1990-2007</strong>
              <p>Período de baja volatilidad económica, inflación controlada en torno al 2 % y desempleo moderado en las economías avanzadas. Los bancos centrales habían aprendido a anclar las expectativas de inflación: la curva de Phillips estaba bien posicionada y el punto de equilibrio se mantuvo cerca del ideal durante casi dos décadas.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🦠</span>
              <strong>Inflación post-COVID 2021-2023</strong>
              <p>La reapertura económica tras el COVID-19 combinó un shock positivo de demanda (estímulos fiscales masivos) con un shock negativo de oferta (disrupciones en cadenas de suministro). La inflación alcanzó máximos de 40 años. Los bancos centrales respondieron con la subida de tipos más rápida desde los años 80, aplicando el manual de Friedman-Volcker.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📈</span>
              <strong>Experimento Volcker (1981)</strong>
              <p>Para romper la espiral inflacionista de los 70, Paul Volcker (FED) subió los tipos al 20 %. La recesión fue severa (desempleo al 10,8 %), pero la inflación cayó del 13 % al 3 % en 3 años. Demostró que la credibilidad de los bancos centrales puede anclar las expectativas y restablecer la curva de Phillips en una posición más favorable.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Preguntas frecuentes sobre la curva de Phillips</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué la curva de Phillips de largo plazo es vertical?</h4>
              <p>A largo plazo, los agentes económicos ajustan sus <strong>expectativas de inflación</strong>. Si el gobierno intenta reducir el desempleo por debajo de la NAIRU estimulando la demanda, la inflación sube. Los trabajadores y empresas lo anticipan y exigen salarios más altos, lo que elimina la ganancia de empleo. El desempleo vuelve a la NAIRU con más inflación. A largo plazo no hay trade-off: la curva es vertical.</p>
              <p className={styles.faqTip}>💡 En el simulador, sube la inflación esperada π<sub>e</sub> y observa cómo toda la curva CP₀ se desplaza hacia arriba — la NAIRU no se mueve.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es la NAIRU?</h4>
              <p>La <strong>NAIRU</strong> (Non-Accelerating Inflation Rate of Unemployment) es la tasa de desempleo compatible con una inflación estable. No significa desempleo cero: incluye el paro friccional (gente buscando trabajo mejor) y el paro estructural (desajuste entre habilidades y vacantes). En España ha oscilado entre el 8 % y el 15 % históricamente. En Alemania o el norte de Europa, entre el 3 % y el 6 %.</p>
              <p className={styles.faqTip}>💡 La NAIRU no es directamente observable y se estima con modelos. En este simulador está fijada en 5 % para simplificar.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo la estanflación de los 70 acabó con la curva de Phillips original?</h4>
              <p>El modelo Phillips original predecía que alta inflación y alto desempleo no podían coexistir. En 1973, la crisis del petróleo demostró que sí podían. Friedman y Phelps ya habían advertido en 1968 que la curva no podía ser estable sin incorporar las expectativas. La estanflación validó empíricamente la hipótesis de la tasa natural y desacreditó el uso pasivo de la curva de Phillips para hacer política económica.</p>
              <p className={styles.faqTip}>💡 Pruébalo: en el simulador, sube ε a +5 pp y u al 8 % — obtendrás estanflación exactamente como en 1973.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué dijo Friedman sobre las expectativas adaptativas?</h4>
              <p>Milton Friedman (Nobel 1976) argumentó que los trabajadores forman sus <strong>expectativas de inflación</strong> basándose en la inflación pasada (expectativas adaptativas). Si el banco central sorprende con inflación inesperada, puede crear empleo temporalmente, pero los agentes aprenden y ajustan sus expectativas. El engaño solo funciona en el corto plazo. Esta idea evolucionó hacia las &quot;expectativas racionales&quot; (Lucas) en los años 80: los agentes anticipan la política y la neutralizan instantáneamente.</p>
              <p className={styles.faqTip}>💡 Incrementa piE (expectativas): verás cómo la curva sube pero el punto de equilibrio en la NAIRU queda igual.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede haber deflación y desempleo a la vez?</h4>
              <p>Sí, y es una de las combinaciones más peligrosas: <strong>deflación con recesión</strong>. Ocurre cuando la demanda colapsa tan violentamente que los precios caen y el desempleo sube al mismo tiempo. Japón vivió este escenario durante la &quot;década perdida&quot; (1990s). La trampa de deflación es difícil de salir: los consumidores posponen compras esperando precios menores, lo que perpetúa la caída de demanda y del empleo.</p>
              <p className={styles.faqTip}>💡 Fija piE en 0 %, shock en −2 pp y u en 14 %: obtendrás π ≈ −6 %, el cuadrante de deflación-recesión.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>Cómo usar la curva de Phillips para analizar política monetaria</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Localiza el punto actual en el plano (u, π)</strong>
                <p>Obtén los datos reales de desempleo e inflación de tu país. Sitúalos en el gráfico. El cuadrante donde caen indica el diagnóstico macroeconómico básico.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Identifica el tipo de shock dominante</strong>
                <p>¿El desplazamiento viene de la demanda (movimiento a lo largo de la curva) o de la oferta (desplazamiento de la curva)? Un shock de oferta requiere una respuesta diferente: subir tipos para combatir inflación agrava el desempleo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Analiza las expectativas de inflación del mercado</strong>
                <p>Si los mercados financieros (bonos a 5-10 años) anticipan inflación alta, la curva de Phillips está desplazada hacia arriba. Si las expectativas están ancladas al 2 %, el banco central tiene más margen de maniobra.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Selecciona el instrumento de política</strong>
                <p>Política monetaria: tipos de interés del banco central (mueve demanda, afecta al desempleo con retardo 6-18 meses). Política fiscal: gasto público / impuestos (también mueve demanda). Política de oferta: reformas estructurales (mueven la NAIRU a largo plazo).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Evalúa el trade-off en el tiempo</strong>
                <p>Subir tipos reduce la inflación pero aumenta el desempleo a corto plazo. Bajar tipos reduce el desempleo pero puede elevar la inflación. La clave es saber si el desempleo actual está por encima o por debajo de la NAIRU de la economía.</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3>4 claves para interpretar el plano Phillips</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Movimiento vs. desplazamiento de la curva</strong>
              <p>Un cambio de u con las mismas expectativas y sin shock es un movimiento <em>a lo largo</em> de la curva. Un cambio de π<sub>e</sub> o ε es un <em>desplazamiento</em> de la curva completa. Son fenómenos distintos con causas y políticas distintas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <strong>El tiempo cambia la curva</strong>
              <p>La curva de Phillips de corto plazo (con expectativas fijas) tiene pendiente negativa. A largo plazo, las expectativas se ajustan y la curva se vuelve vertical. Cada episodio tiene una escala temporal diferente: la política monetaria actúa en 6-18 meses.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <strong>La NAIRU no es universal ni fija</strong>
              <p>Cada país tiene su NAIRU, que varía con las instituciones laborales (negociación colectiva, protección al empleo, formación), las políticas de activas de empleo y los cambios tecnológicos. La NAIRU de España no es la de Alemania.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📡</span>
              <strong>Credibilidad del banco central</strong>
              <p>Si el banco central es creíble en su objetivo del 2 %, las expectativas de inflación quedan ancladas (π<sub>e</sub> ≈ 2 %) y la curva de CP permanece estable. Si pierde credibilidad, π<sub>e</sub> sube, la curva se desplaza y el coste de devolver la inflación al 2 % es mayor.</p>
            </div>
          </div>
        </section>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes sobre la curva de Phillips</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Creer que la curva de Phillips es estable a largo plazo</strong> — Es el error más peligroso de la macroeconomía del siglo XX. A largo plazo no existe trade-off: las expectativas se ajustan y la curva es vertical. Solo el desempleo por encima de la NAIRU puede reducir la inflación de forma sostenida.</li>
            <li><strong>Confundir inflación con inflación esperada (π vs π<sub>e</sub>)</strong> — La inflación actual y la esperada son dos variables distintas. La π<sub>e</sub> es la ancla de la curva: si sube, toda la curva CP se desplaza hacia arriba aunque no cambie el desempleo real. Los bancos centrales dedican enormes esfuerzos a gestionar las expectativas.</li>
            <li><strong>Ignorar los shocks de oferta como tercer factor</strong> — La curva de Phillips estándar solo tiene dos variables. En la práctica, los shocks de oferta (petróleo, materias primas, pandemias, guerras) pueden desplazar la curva violentamente. La estanflación de los 70 y la inflación post-COVID son shocks de oferta, no solo de demanda.</li>
            <li><strong>Olvidar que la NAIRU no es 0 %</strong> — No todo el desempleo es eliminable con política macroeconómica. El paro friccional (entre trabajos) y el estructural (desajuste de habilidades) son componentes permanentes. Intentar llevar el desempleo a 0 % con política monetaria genera inflación acelerada sin beneficio real.</li>
            <li><strong>Confundir política monetaria con política fiscal</strong> — Ambas afectan a la demanda y al plano (u, π), pero con mecanismos distintos y retardos distintos. La política monetaria (tipos de interés) actúa con 6-18 meses de retardo y tiene efecto sobre la inflación. La política fiscal (gasto/impuestos) tiene efecto más inmediato sobre el empleo pero puede chocar con la sostenibilidad de la deuda.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-curva-phillips')} />
      <ShareCard appName="simulador-curva-phillips" />
      <Footer appName="simulador-curva-phillips" />
    </div>
  );
}
