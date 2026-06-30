'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorLentesOpticas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
type TipoLente = 'convergente' | 'divergente';

// ============================================
// UTILIDADES
// ============================================
function fmt(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  return n.toFixed(decimales).replace('.', ',');
}

function fmtSigned(n: number, decimales = 2): string {
  if (!isFinite(n)) return '∞';
  if (Math.abs(n) < 1e-12) return '0';
  const s = Math.abs(n).toFixed(decimales).replace('.', ',');
  return n < 0 ? `−${s}` : s;
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorLentesOpticasPage() {
  const [tipo, setTipo] = useState<TipoLente>('convergente');
  const [fAbs, setFAbs] = useState(8); // distancia focal en valor absoluto (cm)
  const [sObj, setSObj] = useState(15); // distancia del objeto a la lente (cm), siempre positiva
  const [hObj, setHObj] = useState(2); // altura del objeto (cm)

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Distancia focal con signo (+ convergente, - divergente)
  const f = useMemo(() => tipo === 'convergente' ? fAbs : -fAbs, [tipo, fAbs]);

  // Cálculos: 1/s + 1/s' = 1/f → s' = 1 / (1/f − 1/s)
  // Convención: s_obj > 0 (objeto a la izquierda), s_img > 0 (imagen a la derecha = real),
  //             s_img < 0 (imagen a la izquierda = virtual)
  const calculoOptico = useMemo(() => {
    const denom = 1 / f - 1 / sObj;
    if (Math.abs(denom) < 1e-9) {
      // Imagen al infinito
      return { sImg: Infinity, hImg: Infinity, M: Infinity, valido: false };
    }
    const sImg = 1 / denom;
    const M = -sImg / sObj; // negativo = invertida
    const hImg = M * hObj;
    return { sImg, hImg, M, valido: true };
  }, [f, sObj, hObj]);

  const { sImg, hImg, M, valido } = calculoOptico;

  // Clasificación
  const clasificacion = useMemo(() => {
    if (!valido) return { tipo: 'infinito' as const, etiqueta: 'Imagen al infinito', chips: ['Foco objeto'] };

    const real = sImg > 0;
    const invertida = M < 0;
    const aumento = Math.abs(M);
    const mayor = aumento > 1;

    const chips: string[] = [];
    chips.push(real ? 'Real' : 'Virtual');
    chips.push(invertida ? 'Invertida' : 'Derecha');
    chips.push(mayor ? `Aumentada (×${fmt(aumento, 2)})` : aumento < 1 ? `Reducida (×${fmt(aumento, 2)})` : 'Mismo tamaño');

    return {
      tipo: real ? 'real' as const : 'virtual' as const,
      etiqueta: real ? 'Imagen real' : 'Imagen virtual',
      chips,
    };
  }, [valido, sImg, M]);

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
    const pad = { top: 30, right: 30, bottom: 36, left: 30 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorAxis = isDark ? '#999' : '#666';
    const colorGrid = isDark ? '#333' : '#EEE';
    const colorText = isDark ? '#E5E5E5' : '#333';
    const colorLens = '#2E86AB';
    const colorObj = '#48A9A6';
    const colorImgReal = '#48A9A6';
    const colorImgVirtual = '#A82E68';
    const colorRayo1 = '#E07A1F'; // paralelo
    const colorRayo2 = '#7C3AED'; // centro
    const colorRayo3 = '#0EA5E9'; // por foco
    const colorFoco = '#A82E68';

    ctx.clearRect(0, 0, W, H);

    // Determinar rango horizontal (eje óptico)
    // Todos los elementos: -sObj (objeto), 0 (lente), sImg (imagen), -fAbs y +fAbs (focos)
    const sImgFinito = isFinite(sImg) ? sImg : 50;
    const xRangeMax = Math.max(sObj, fAbs * 2, Math.abs(sImgFinito), 25) + 5;
    const xMin = -xRangeMax;
    const xMax = xRangeMax;

    // Determinar rango vertical (alturas)
    const hImgFinito = isFinite(hImg) ? hImg : 0;
    const yRange = Math.max(Math.abs(hObj), Math.abs(hImgFinito), 4) * 1.4;
    const yMin = -yRange;
    const yMax = yRange;

    const xToPx = (x: number) => pad.left + ((x - xMin) / (xMax - xMin)) * plotW;
    const yToPx = (y: number) => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Grid
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    const gridStep = 5; // cada 5 cm
    for (let xv = Math.ceil(xMin / gridStep) * gridStep; xv <= xMax; xv += gridStep) {
      ctx.beginPath();
      ctx.moveTo(xToPx(xv), pad.top);
      ctx.lineTo(xToPx(xv), pad.top + plotH);
      ctx.stroke();
    }
    for (let yv = Math.ceil(yMin / 2) * 2; yv <= yMax; yv += 2) {
      ctx.beginPath();
      ctx.moveTo(pad.left, yToPx(yv));
      ctx.lineTo(pad.left + plotW, yToPx(yv));
      ctx.stroke();
    }

    // Eje óptico (horizontal)
    ctx.strokeStyle = colorAxis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, yToPx(0));
    ctx.lineTo(pad.left + plotW, yToPx(0));
    ctx.stroke();

    // Etiquetas eje X
    ctx.fillStyle = colorText;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    for (let xv = Math.ceil(xMin / 10) * 10; xv <= xMax; xv += 10) {
      ctx.fillText(`${xv}`, xToPx(xv), pad.top + plotH + 14);
    }

    // Lente vertical en x = 0
    const lensTopY = yToPx(yMax * 0.85);
    const lensBotY = yToPx(yMin * 0.85);
    ctx.strokeStyle = colorLens;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xToPx(0), lensTopY);
    ctx.lineTo(xToPx(0), lensBotY);
    ctx.stroke();

    // Flechas en los extremos para indicar tipo de lente
    const flechaTam = 10;
    if (tipo === 'convergente') {
      // Flechas hacia fuera (apuntando arriba arriba y abajo abajo)
      ctx.beginPath();
      ctx.moveTo(xToPx(0) - flechaTam / 2, lensTopY + flechaTam);
      ctx.lineTo(xToPx(0), lensTopY);
      ctx.lineTo(xToPx(0) + flechaTam / 2, lensTopY + flechaTam);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xToPx(0) - flechaTam / 2, lensBotY - flechaTam);
      ctx.lineTo(xToPx(0), lensBotY);
      ctx.lineTo(xToPx(0) + flechaTam / 2, lensBotY - flechaTam);
      ctx.stroke();
    } else {
      // Flechas hacia dentro
      ctx.beginPath();
      ctx.moveTo(xToPx(0) - flechaTam / 2, lensTopY - flechaTam);
      ctx.lineTo(xToPx(0), lensTopY);
      ctx.lineTo(xToPx(0) + flechaTam / 2, lensTopY - flechaTam);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xToPx(0) - flechaTam / 2, lensBotY + flechaTam);
      ctx.lineTo(xToPx(0), lensBotY);
      ctx.lineTo(xToPx(0) + flechaTam / 2, lensBotY + flechaTam);
      ctx.stroke();
    }

    // Etiqueta L
    ctx.fillStyle = colorLens;
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Lente (f = ${fmtSigned(f, 1)} cm)`, xToPx(0), pad.top - 8);

    // Focos: marcadores en ±fAbs
    const dibujarFoco = (xv: number, etiqueta: string) => {
      ctx.fillStyle = colorFoco;
      ctx.beginPath();
      ctx.arc(xToPx(xv), yToPx(0), 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = colorFoco;
      ctx.font = '11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(etiqueta, xToPx(xv), yToPx(0) + 16);
    };
    dibujarFoco(-fAbs, 'F');
    dibujarFoco(fAbs, "F'");
    dibujarFoco(-2 * fAbs, '2F');
    dibujarFoco(2 * fAbs, "2F'");

    // OBJETO (flecha vertical en x = -sObj, altura hObj)
    const objX = xToPx(-sObj);
    ctx.strokeStyle = colorObj;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, yToPx(0));
    ctx.lineTo(objX, yToPx(hObj));
    ctx.stroke();
    // Punta de flecha
    ctx.fillStyle = colorObj;
    ctx.beginPath();
    ctx.moveTo(objX, yToPx(hObj) - 2);
    ctx.lineTo(objX - 6, yToPx(hObj) + 8);
    ctx.lineTo(objX + 6, yToPx(hObj) + 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = colorObj;
    ctx.font = 'bold 11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Objeto', objX, yToPx(hObj) - 8);

    // ============================================
    // TRAZADO DE LOS 3 RAYOS PRINCIPALES
    // ============================================
    // Origen de cada rayo: punta del objeto (x = -sObj, y = hObj)

    const dibujarRayo = (
      x1: number, y1: number, x2: number, y2: number,
      color: string, dash = false, alpha = 1
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = alpha;
      if (dash) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(xToPx(x1), yToPx(y1));
      ctx.lineTo(xToPx(x2), yToPx(y2));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    };

    // RAYO 1: paralelo al eje desde el objeto hasta la lente,
    //         luego pasa por F' (convergente) o sale como si viniera de F (divergente)
    // Rayo incidente: y = hObj para x ∈ [-sObj, 0]
    dibujarRayo(-sObj, hObj, 0, hObj, colorRayo1);
    // Rayo refractado: pasa por (0, hObj) y converge hacia F' = (fAbs, 0) o (-fAbs, 0)
    if (tipo === 'convergente') {
      // Pasa por (0, hObj) y (fAbs, 0)
      // Pendiente: m = (0 - hObj) / (fAbs - 0) = -hObj / fAbs
      const m = -hObj / fAbs;
      // Continúa hasta xMax
      const yEnd = m * (xMax - 0) + hObj;
      dibujarRayo(0, hObj, xMax, yEnd, colorRayo1);
      // Extensión virtual hacia atrás (línea discontinua leve)
      const yBack = m * (xMin - 0) + hObj;
      dibujarRayo(0, hObj, xMin, yBack, colorRayo1, true, 0.25);
    } else {
      // Divergente: el rayo refractado parece venir de F = (-fAbs, 0)
      // Pasa por (0, hObj). Pendiente: m = (hObj - 0) / (0 - (-fAbs)) = hObj / fAbs
      const m = hObj / fAbs;
      const yEnd = m * (xMax - 0) + hObj;
      dibujarRayo(0, hObj, xMax, yEnd, colorRayo1);
      // Extensión hacia atrás (la dirección virtual hasta F)
      // En divergente, el "origen virtual" del rayo refractado está en F = (-fAbs, 0)
      dibujarRayo(0, hObj, -fAbs, 0, colorRayo1, true, 0.5);
    }

    // RAYO 2: pasa por el centro óptico de la lente sin desviarse
    // De (-sObj, hObj) a (xMax, ...) en línea recta a través de (0, 0)
    {
      // Pendiente: m = (0 - hObj) / (0 - (-sObj)) = -hObj / sObj
      const m = -hObj / sObj;
      const yEnd = m * (xMax - 0) + 0; // pasa por (0, 0)
      dibujarRayo(-sObj, hObj, xMax, yEnd, colorRayo2);
    }

    // RAYO 3: pasa por F (convergente, izquierda) o se dirige hacia F' (divergente, derecha)
    //         y sale paralelo al eje
    if (tipo === 'convergente') {
      // Rayo incidente: del objeto pasa por F = (-fAbs, 0). Si sObj > fAbs, el rayo va hacia adelante
      // Pasa por (-sObj, hObj) y (-fAbs, 0). Pendiente: (0 - hObj)/(-fAbs - (-sObj)) = -hObj/(sObj - fAbs)
      const denom3 = sObj - fAbs;
      if (Math.abs(denom3) > 1e-6) {
        const m = -hObj / denom3;
        // Si sObj > fAbs (objeto fuera del foco), el rayo tras F sigue subiendo o bajando
        // y llega a la lente en y_lente = m * (0 - (-sObj)) + hObj = m * sObj + hObj
        const yLente = m * sObj + hObj;
        dibujarRayo(-sObj, hObj, 0, yLente, colorRayo3);
        // Tras la lente, sale paralelo al eje a la altura yLente hasta xMax
        dibujarRayo(0, yLente, xMax, yLente, colorRayo3);
      }
    } else {
      // Divergente: rayo dirigido hacia F' = (+fAbs, 0). Tras la lente, sale paralelo al eje.
      // Incidente: de (-sObj, hObj) hacia (+fAbs, 0). Pendiente: (0 - hObj)/(fAbs - (-sObj)) = -hObj/(sObj + fAbs)
      const m = -hObj / (sObj + fAbs);
      const yLente = m * sObj + hObj;
      dibujarRayo(-sObj, hObj, 0, yLente, colorRayo3);
      // Tras la lente, sale paralelo al eje
      dibujarRayo(0, yLente, xMax, yLente, colorRayo3);
      // Extensión virtual hacia atrás de la lente (línea discontinua atenuada)
      dibujarRayo(0, yLente, xMin, yLente, colorRayo3, true, 0.25);
    }

    // ============================================
    // IMAGEN
    // ============================================
    if (valido && isFinite(sImg) && isFinite(hImg) && Math.abs(sImg) > 0.01) {
      const imgX = xToPx(sImg);
      const real = sImg > 0;
      const colorImg = real ? colorImgReal : colorImgVirtual;

      ctx.strokeStyle = colorImg;
      ctx.lineWidth = 3;
      if (!real) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(imgX, yToPx(0));
      ctx.lineTo(imgX, yToPx(hImg));
      ctx.stroke();
      ctx.setLineDash([]);

      // Punta de flecha (apunta hacia hImg)
      ctx.fillStyle = colorImg;
      const tipPx = yToPx(hImg);
      const baseDir = hImg > 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(imgX, tipPx + 2 * baseDir);
      ctx.lineTo(imgX - 6, tipPx + 10 * baseDir);
      ctx.lineTo(imgX + 6, tipPx + 10 * baseDir);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = colorImg;
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(real ? 'Imagen real' : 'Imagen virtual', imgX, tipPx - 8 * baseDir);
    } else if (!valido) {
      // Imagen al infinito
      ctx.fillStyle = colorImgReal;
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Imagen al infinito (objeto en F)', xToPx(0), yToPx(yMax * 0.5));
    }
  }, [tipo, fAbs, sObj, hObj, f, sImg, hImg, valido]);

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

  // Clase CSS de la clasificación
  const clasifClass = useMemo(() => {
    if (clasificacion.tipo === 'real') return styles.imageClassReal;
    if (clasificacion.tipo === 'virtual') return styles.imageClassVirtual;
    return '';
  }, [clasificacion.tipo]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔍 Simulador de Lentes Ópticas</h1>
        <p className={styles.subtitle}>
          Mueve el objeto y mira en directo cómo los <strong>3 rayos principales</strong> atraviesan
          la lente y forman la imagen. Convergente o divergente, real o virtual.
        </p>
      </header>

      <LegalNotice />

      {/* TIPO DE LENTE */}
      <div className={styles.lensTypeSelector}>
        <button
          className={`${styles.lensBtn} ${tipo === 'convergente' ? styles.lensBtnActive : ''}`}
          onClick={() => setTipo('convergente')}
          aria-pressed={tipo === 'convergente'}
        >
          <span className={styles.lensIcon}>🔍</span>
          <span className={styles.lensName}>Convergente (biconvexa)</span>
          <span className={styles.lensDesc}>f &gt; 0 — concentra los rayos paralelos en F&apos;</span>
        </button>
        <button
          className={`${styles.lensBtn} ${tipo === 'divergente' ? styles.lensBtnActive : ''}`}
          onClick={() => setTipo('divergente')}
          aria-pressed={tipo === 'divergente'}
        >
          <span className={styles.lensIcon}>🪞</span>
          <span className={styles.lensName}>Divergente (bicóncava)</span>
          <span className={styles.lensDesc}>f &lt; 0 — los rayos divergen como si vinieran de F</span>
        </button>
      </div>

      {/* MAIN */}
      <div className={styles.mainContent}>
        <p className={styles.descriptionCard}>
          La lente tiene distancia focal {fmtSigned(f, 1)} cm. El objeto está a {fmt(sObj, 1)} cm a la
          izquierda. Aplicando 1/s + 1/s&apos; = 1/f obtenemos la posición de la imagen y su tamaño. Los
          tres rayos principales (paralelo, central, por foco) se cruzan exactamente en la imagen — eso
          es lo que verás en el lienzo.
        </p>

        <div className={styles.controls}>
          <div className={styles.controlsGrid}>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Distancia focal (|f| = <strong>{fmt(fAbs, 1)} cm</strong>)
              </label>
              <input
                type="range"
                min={2}
                max={20}
                step={0.5}
                value={fAbs}
                onChange={e => setFAbs(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Distancia focal"
              />
            </div>
            <div className={styles.controlGroup}>
              <label className={styles.controlLabel}>
                Distancia del objeto (s = <strong>{fmt(sObj, 1)} cm</strong>)
              </label>
              <input
                type="range"
                min={2}
                max={40}
                step={0.5}
                value={sObj}
                onChange={e => setSObj(parseFloat(e.target.value))}
                className={styles.slider}
                aria-label="Distancia objeto"
              />
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              Altura del objeto (h = <strong>{fmt(hObj, 1)} cm</strong>)
            </label>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.1}
              value={hObj}
              onChange={e => setHObj(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Altura del objeto"
            />
          </div>
        </div>

        {/* CANVAS */}
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label="Trazado de rayos a través de la lente" />
          <div className={styles.legendRow}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#48A9A6' }} />
              Objeto
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#E07A1F' }} />
              Rayo 1: paralelo → F&apos;
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#7C3AED' }} />
              Rayo 2: por el centro
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#0EA5E9' }} />
              Rayo 3: por F → paralelo
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#A82E68' }} />
              Imagen virtual
            </span>
          </div>
        </div>

        {/* CLASIFICACIÓN */}
        <div className={`${styles.imageClassification} ${clasifClass}`} role="status" aria-live="polite">
          <span className={styles.imageClassTitle}>{clasificacion.etiqueta}</span>
          <div className={styles.imageClassChips}>
            {clasificacion.chips.map((c, i) => (
              <span key={i} className={styles.classChip}>{c}</span>
            ))}
          </div>
        </div>

        {/* RESULTADOS */}
        <div className={styles.resultsPanel} aria-live="polite">
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Distancia objeto (s)</span>
            <span className={styles.resultValue}>{fmt(sObj, 2)} cm</span>
            <span className={styles.resultRange}>medida desde la lente</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Distancia imagen (s&apos;)</span>
            <span className={styles.resultValue}>{fmtSigned(sImg, 2)} cm</span>
            <span className={styles.resultRange}>{sImg > 0 ? '→ derecha (real)' : sImg < 0 ? '← izquierda (virtual)' : '∞'}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Aumento (M = −s&apos;/s)</span>
            <span className={styles.resultValue}>{fmtSigned(M, 3)}</span>
            <span className={styles.resultRange}>{M < 0 ? 'invertida' : M > 0 ? 'derecha' : '—'}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Altura imagen (h&apos;)</span>
            <span className={styles.resultValue}>{fmtSigned(hImg, 2)} cm</span>
            <span className={styles.resultRange}>= M · h</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Distancia focal f</span>
            <span className={styles.resultValue}>{fmtSigned(f, 2)} cm</span>
            <span className={styles.resultRange}>{f > 0 ? 'convergente' : 'divergente'}</span>
          </div>
          <div className={styles.resultCard}>
            <span className={styles.resultLabel}>Potencia P = 1/f</span>
            <span className={styles.resultValue}>{fmtSigned(100 / f, 2)} D</span>
            <span className={styles.resultRange}>dioptrías (f en m)</span>
          </div>
        </div>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
          ============================================ */}
      <EducationalSection
        title="Aprende óptica geométrica con lentes"
        subtitle="De la ecuación de Gauss a las gafas, cámaras y microscopios"
      >
        {/* INTRO */}
        <section>
          <h3>¿Cómo se forma la imagen en una lente?</h3>
          <p>
            Una <strong>lente delgada</strong> es un trozo de vidrio (u otro medio transparente) con dos
            caras curvas que desvía los rayos de luz por refracción. Para construir la imagen de un
            objeto basta con trazar dos o tres <strong>rayos principales</strong> y ver dónde se cortan:
          </p>
          <ul className={styles.bulletList}>
            <li><strong>Rayo paralelo al eje</strong> → tras la lente pasa por el foco imagen F&apos; (convergente) o sale como si viniera de F (divergente).</li>
            <li><strong>Rayo por el centro óptico</strong> → no se desvía (la lente es delgada).</li>
            <li><strong>Rayo por el foco objeto F</strong> (convergente) o dirigido hacia F&apos; (divergente) → tras la lente sale paralelo al eje.</li>
          </ul>
          <p>
            Donde se corten los rayos refractados está la imagen. Si los <em>rayos reales</em> se cortan
            (a la derecha de la lente), es <strong>real</strong>; si tienen que prolongarse hacia atrás
            para cortarse, es <strong>virtual</strong>.
          </p>
          <div className={styles.formulaBox}>
            1/s + 1/s&apos; = 1/f &nbsp;·&nbsp; M = −s&apos;/s &nbsp;·&nbsp; h&apos; = M · h
          </div>
          <p>
            Convención: s &gt; 0 si el objeto está a la izquierda de la lente; s&apos; &gt; 0 si la imagen
            está a la derecha (real); f &gt; 0 si la lente es convergente, f &lt; 0 si es divergente.
          </p>
        </section>

        {/* TABLA */}
        <section>
          <h3>Tipos de imagen según la posición del objeto en una lente convergente</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Posición del objeto</th>
                  <th>Tipo de imagen</th>
                  <th>Tamaño</th>
                  <th>Sentido</th>
                  <th>Aplicación práctica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>s &gt; 2f (más lejos del doble del foco)</td>
                  <td>Real</td>
                  <td>Reducida</td>
                  <td>Invertida</td>
                  <td>Cámara fotográfica, ojo humano</td>
                </tr>
                <tr>
                  <td>s = 2f</td>
                  <td>Real</td>
                  <td>Igual (M = −1)</td>
                  <td>Invertida</td>
                  <td>Fotocopiadoras 1:1</td>
                </tr>
                <tr>
                  <td>f &lt; s &lt; 2f</td>
                  <td>Real</td>
                  <td>Aumentada</td>
                  <td>Invertida</td>
                  <td>Proyectores de cine, retroproyectores</td>
                </tr>
                <tr>
                  <td>s = f</td>
                  <td>En el infinito</td>
                  <td>—</td>
                  <td>—</td>
                  <td>Telescopios (haz colimado)</td>
                </tr>
                <tr>
                  <td>s &lt; f (objeto cerca de la lente)</td>
                  <td>Virtual</td>
                  <td>Aumentada</td>
                  <td>Derecha</td>
                  <td>Lupas, oculares de microscopio</td>
                </tr>
                <tr>
                  <td><strong>Lente divergente</strong> (cualquier s)</td>
                  <td>Virtual</td>
                  <td>Reducida</td>
                  <td>Derecha</td>
                  <td>Gafas para miopía, mirillas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios donde las lentes son la pieza clave</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>👁️</span>
              <strong>El ojo humano</strong>
              <p>El cristalino es una lente convergente. Forma sobre la retina una imagen real, invertida y reducida del mundo. El cerebro la procesa y la &quot;da la vuelta&quot;. Si el cristalino enfoca mal, surgen miopía, hipermetropía y presbicia.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>📷</span>
              <strong>Cámara fotográfica</strong>
              <p>Una lente convergente (o sistema de lentes) forma sobre el sensor una imagen real e invertida del objeto. La distancia s entre lente y objeto y la s&apos; entre lente y sensor están relacionadas por 1/s + 1/s&apos; = 1/f.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🔬</span>
              <strong>Microscopio óptico</strong>
              <p>Combina dos lentes: el objetivo (corta f, forma imagen real aumentada) y el ocular (lupa, forma imagen virtual aumentada). Aumento total ≈ M_obj × M_oc; los microscopios ópticos de laboratorio suelen alcanzar hasta ×1000-1500 con objetivos de inmersión.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🔭</span>
              <strong>Telescopio refractor</strong>
              <p>Una lente objetivo grande captura luz de un objeto lejano (s ≈ ∞). El ocular amplifica esa imagen. Aumento angular = f_obj / f_oc. Por eso los telescopios tienen objetivos enormes.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes sobre lentes ópticas</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Diferencia entre imagen real e imagen virtual?</h4>
              <p><strong>Real</strong>: los rayos refractados se cruzan físicamente (puede recogerse en una pantalla o sensor). Aparece al otro lado de la lente. <strong>Virtual</strong>: los rayos refractados divergen, pero sus prolongaciones hacia atrás se cruzan. NO puede proyectarse, solo verse a través de la lente. Las lupas y los espejos planos forman imágenes virtuales.</p>
              <p className={styles.faqTip}>💡 Si pones un papel donde &quot;está&quot; la imagen virtual, no aparecerá nada en el papel: la luz no llega ahí.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué al mirar por una lupa la imagen está derecha y aumentada?</h4>
              <p>Porque al colocar el objeto <em>dentro de la distancia focal</em> (s &lt; f) de una lente convergente, la imagen es <strong>virtual, derecha y mayor</strong>. Si la alejas más de f, la imagen se vuelve real e invertida (lo verías al revés).</p>
              <p className={styles.faqTip}>💡 En el simulador, con una convergente, baja s por debajo de f y verás cómo la imagen pasa a ser virtual y derecha (color rosa, línea discontinua).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué las gafas para miopía son divergentes?</h4>
              <p>Un miope tiene el ojo &quot;demasiado largo&quot;: el cristalino enfoca <em>antes</em> de la retina. Una lente divergente añade un &quot;empuje&quot; que aleja la imagen virtual del cristalino, restaurando el enfoque correcto. Por eso las gafas de miope tienen potencia negativa (dioptrías negativas).</p>
              <p className={styles.faqTip}>💡 Para hipermetropía (ojo demasiado corto) se usan lentes convergentes (dioptrías positivas).</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué son las dioptrías?</h4>
              <p>Una <strong>dioptría (D)</strong> es la potencia de una lente con f = 1 m: P = 1/f (con f en metros). Una lente de +2 D tiene f = 0,5 m = 50 cm. Las gafas suelen ir entre −10 D (miopía severa) y +10 D (hipermetropía severa).</p>
              <p className={styles.faqTip}>💡 La potencia es <em>aditiva</em> en lentes delgadas en contacto: dos lentes de +1 D y +2 D juntas equivalen a +3 D.</p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué la imagen del proyector se ve invertida?</h4>
              <p>Porque el objeto (la pantalla LCD del proyector) está más cerca que 2f de la lente, así que la imagen sobre la pared es real, invertida y aumentada. Por eso los proyectores tienen un &quot;modo invertir&quot; o se montan colgando del techo: para que la imagen llegue derecha al espectador.</p>
              <p className={styles.faqTip}>💡 Lo mismo ocurre en el ojo: la retina recibe la imagen invertida, y el cerebro la &quot;corrige&quot; en el procesamiento visual.</p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo construir una imagen óptica paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica los datos: tipo de lente, f, s y h</strong>
                <p>Distancia focal con su signo (+ convergente, − divergente). Distancia objeto siempre positiva si está a la izquierda. Altura del objeto positiva.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Aplica 1/s + 1/s&apos; = 1/f</strong>
                <p>Despeja s&apos;: s&apos; = 1 / (1/f − 1/s). El signo de s&apos; te dice si la imagen es real (+) o virtual (−). Si 1/f = 1/s, la imagen está en el infinito (objeto en el foco).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula el aumento M = −s&apos;/s</strong>
                <p>El signo te dice si la imagen está derecha (M &gt; 0) o invertida (M &lt; 0). El módulo te dice si está aumentada (|M| &gt; 1) o reducida (|M| &lt; 1).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula la altura de la imagen h&apos; = M · h</strong>
                <p>El signo de h&apos; coincide con el de M (positivo arriba si M &gt; 0). Si M es negativo y h positiva, h&apos; sale negativa: la imagen está &quot;cabeza abajo&quot;.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Traza los 3 rayos principales para verificar</strong>
                <p>Si tu cálculo y tu trazado de rayos coinciden, todo bien. Si no, hay un error de signo o de fórmula. El método gráfico es el mejor control de calidad.</p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 buenas prácticas con problemas de lentes</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <strong>Dibuja siempre el esquema</strong>
              <p>Antes de calcular, esboza la lente, el eje óptico, los dos focos, el objeto y el rayo central. Te ahorra errores de signo y te da una expectativa visual del resultado.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <strong>Memoriza los 3 rayos canónicos</strong>
              <p>Paralelo→F&apos;, central sin desviar, F→paralelo. Con esos tres dibujas la imagen sin necesidad de fórmula. Y si la fórmula no coincide con el dibujo, el dibujo suele tener razón.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Recuerda la convención de signos</strong>
              <p>Hay varias convenciones; en este simulador y en exámenes como la EBAU (Bachillerato en España) o las pruebas de Física de preparatoria y secundaria en Latinoamérica se suele usar: s &gt; 0 a la izquierda, s&apos; &gt; 0 a la derecha (real), f &gt; 0 convergente. Lo importante es ser <em>consistente</em>.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <strong>Verifica con dos métodos</strong>
              <p>Calcula con la fórmula 1/s + 1/s&apos; = 1/f, dibuja el trazado de rayos, y comprueba que ambas dan la misma posición e h&apos;. Si difieren, hay un error y vale la pena buscarlo.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>5 errores frecuentes con lentes ópticas</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Olvidar el signo de f en lentes divergentes</strong> — Si usas la fórmula 1/s + 1/s&apos; = 1/f y olvidas que f &lt; 0 para divergente, sale s&apos; positivo (imagen real) cuando debería ser negativo (virtual). El signo de f es CRUCIAL.</li>
            <li><strong>Confundir aumento M con &quot;cuántas veces más grande&quot;</strong> — M = −2 significa: imagen 2 veces más grande Y invertida. M = 0,5 significa: imagen mitad de tamaño y derecha. El signo es información, no un descuido tipográfico.</li>
            <li><strong>Pensar que &quot;virtual&quot; significa &quot;no existe&quot;</strong> — La imagen virtual existe físicamente como percepción: tus ojos la ven al mirar la lupa. Lo que NO puede hacer es proyectarse en una pantalla, porque los rayos no convergen ahí.</li>
            <li><strong>Aplicar fórmulas con s y s&apos; en distintas unidades</strong> — Si f está en cm, s y s&apos; tienen que estar en cm. Mezclar metros y centímetros genera resultados incorrectos por factores de 100.</li>
            <li><strong>Suponer que las lentes son ideales en todo el rango</strong> — La fórmula 1/s + 1/s&apos; = 1/f asume <em>lente delgada</em> y <em>rayos paraxiales</em> (cerca del eje). Para lentes gruesas o rayos angulosos hay aberraciones (esférica, cromática) que la fórmula no captura.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-lentes-opticas')} />
      <ShareCard appName="simulador-lentes-opticas" />
      <Footer appName="simulador-lentes-opticas" />
    </div>
  );
}
