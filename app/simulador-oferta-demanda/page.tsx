'use client';
// @disclaimer: exempt

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import styles from './SimuladorOfertaDemanda.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================

interface Sliders {
  renta: number;
  sustitutivos: number;
  preferencias: number;
  costes: number;
  tecnologia: number;
  productores: number;
}

interface Curvas {
  a: number; // intercepto demanda (base 100, ajustado por desplazadores)
  b: number; // pendiente demanda (fija = 2)
  c: number; // intercepto oferta (base -20, ajustado por desplazadores)
  d: number; // pendiente oferta (fija = 1.5)
}

interface Equilibrio {
  P: number;
  Q: number;
}

interface Excedente {
  EC: number; // excedente consumidor
  EP: number; // excedente productor
}

type Modo = 'libre' | 'maximo' | 'minimo';

// ============================================
// CONSTANTES BASE
// ============================================
const A_BASE = 100;
const C_BASE = -20;
const B_FIJA = 2;
const D_FIJA = 1.5;
const DESPLAZADOR_PASO = 4; // unidades por unidad de slider para demanda
const DESPLAZADOR_PASO_O = 3; // unidades por unidad de slider para oferta

// ============================================
// FUNCIONES MATEMÁTICAS
// ============================================

function calcularCurvas(sliders: Sliders): Curvas {
  // Desplazadores de demanda: renta (positivo), sustitutivos (positivo), preferencias (positivo)
  const deltaD =
    (sliders.renta + sliders.sustitutivos + sliders.preferencias) * DESPLAZADOR_PASO;
  // Desplazadores de oferta: costes (negativo), tecnologia (positivo), productores (positivo)
  const deltaO =
    (-sliders.costes + sliders.tecnologia + sliders.productores) * DESPLAZADOR_PASO_O;

  return {
    a: A_BASE + deltaD,
    b: B_FIJA,
    c: C_BASE + deltaO,
    d: D_FIJA,
  };
}

function calcularEquilibrio(curvas: Curvas): Equilibrio {
  const P = (curvas.a - curvas.c) / (curvas.b + curvas.d);
  const Q = curvas.a - curvas.b * P;
  return { P: Math.max(0, P), Q: Math.max(0, Q) };
}

function calcularExcedente(curvas: Curvas, P: number, Q: number): Excedente {
  // Intercepto demanda en eje P: a/b
  const Pmax = curvas.a / curvas.b;
  // Intercepto oferta en eje P: -c/d (clamp a 0 para consistencia con el canvas)
  const Pmin = Math.max(0, -curvas.c / curvas.d);
  const EC = 0.5 * (Pmax - P) * Q;
  const EP = 0.5 * (P - Pmin) * Q;
  return { EC: Math.max(0, EC), EP: Math.max(0, EP) };
}

function fmt(n: number, dec = 1): string {
  return n.toFixed(dec).replace('.', ',');
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SimuladorOfertaDemandaPage() {
  const [sliders, setSliders] = useState<Sliders>({
    renta: 0,
    sustitutivos: 0,
    preferencias: 0,
    costes: 0,
    tecnologia: 0,
    productores: 0,
  });
  const [modo, setModo] = useState<Modo>('libre');
  const [precioFijado, setPrecioFijado] = useState<number>(25);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ============================================
  // CURVAS Y EQUILIBRIO (memo)
  // ============================================
  const curvas = useMemo(() => calcularCurvas(sliders), [sliders]);

  const equilibrio = useMemo(() => calcularEquilibrio(curvas), [curvas]);

  const excedente = useMemo(
    () => calcularExcedente(curvas, equilibrio.P, equilibrio.Q),
    [curvas, equilibrio]
  );

  // Rangos del gráfico
  const Q_MAX = 80;
  const P_MAX = 60;

  // Puntos de la curva de demanda: Q_d = a - b*P → P = (a - Q)/b
  // En el gráfico X=Q, Y=P
  // Curva demanda: P = (a - Q) / b
  // Curva oferta: P = (Q - c) / d
  const pDemanda = useCallback(
    (Q: number) => (curvas.a - Q) / curvas.b,
    [curvas]
  );
  const pOferta = useCallback(
    (Q: number) => (Q - curvas.c) / curvas.d,
    [curvas]
  );

  // Cantidades en control de precios
  const qDemandaControlada = useMemo(
    () => Math.max(0, curvas.a - curvas.b * precioFijado),
    [curvas, precioFijado]
  );
  const qOfertaControlada = useMemo(
    () => Math.max(0, curvas.c + curvas.d * precioFijado),
    [curvas, precioFijado]
  );
  const desequilibrio = useMemo(
    () => Math.abs(qDemandaControlada - qOfertaControlada),
    [qDemandaControlada, qOfertaControlada]
  );

  // ============================================
  // DIBUJO DEL CANVAS
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
    const pad = { top: 30, right: 30, bottom: 50, left: 55 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Detectar dark mode
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colorFondo = isDark ? '#2A2A2A' : '#FAFAFA';
    const colorEjes = isDark ? '#666666' : '#999999';
    const colorTexto = isDark ? '#E5E5E5' : '#333333';
    const colorGrid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const colorD = '#2E86AB';
    const colorO = '#E07A1F';
    const colorEq = '#48A9A6';
    const colorShadeD = isDark ? 'rgba(46,134,171,0.2)' : 'rgba(46,134,171,0.15)';
    const colorShadeO = isDark ? 'rgba(224,122,31,0.2)' : 'rgba(224,122,31,0.15)';
    const colorControl = '#D94F4F';

    ctx.clearRect(0, 0, W, H);

    // Fondo del área de plot
    ctx.fillStyle = colorFondo;
    ctx.fillRect(pad.left, pad.top, plotW, plotH);

    // Funciones de mapeo
    const toX = (q: number) => pad.left + (q / Q_MAX) * plotW;
    const toY = (p: number) => pad.top + plotH - (p / P_MAX) * plotH;

    // ——— GRID ———
    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    for (let q = 0; q <= Q_MAX; q += 10) {
      ctx.beginPath();
      ctx.moveTo(toX(q), pad.top);
      ctx.lineTo(toX(q), pad.top + plotH);
      ctx.stroke();
    }
    for (let p = 0; p <= P_MAX; p += 10) {
      ctx.beginPath();
      ctx.moveTo(pad.left, toY(p));
      ctx.lineTo(pad.left + plotW, toY(p));
      ctx.stroke();
    }

    // ——— EXCEDENTE CONSUMIDOR (triángulo azul claro) ———
    const Peq = equilibrio.P;
    const Qeq = equilibrio.Q;
    const PmaxD = curvas.a / curvas.b; // intercepto demanda en eje P

    if (modo === 'libre' && Qeq > 0 && PmaxD > 0) {
      ctx.fillStyle = colorShadeD;
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(PmaxD));
      // Seguir la curva de demanda desde Q=0 hasta Q=Qeq
      const nSteps = 80;
      for (let i = 0; i <= nSteps; i++) {
        const q = (i / nSteps) * Qeq;
        const p = pDemanda(q);
        if (p >= 0 && p <= P_MAX) {
          ctx.lineTo(toX(q), toY(p));
        }
      }
      ctx.lineTo(toX(Qeq), toY(Peq));
      ctx.lineTo(toX(0), toY(Peq));
      ctx.closePath();
      ctx.fill();
    }

    // ——— EXCEDENTE PRODUCTOR (triángulo naranja claro) ———
    const PminO = -curvas.c / curvas.d; // intercepto oferta en eje P

    if (modo === 'libre' && Qeq > 0 && PminO >= 0) {
      ctx.fillStyle = colorShadeO;
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(Math.max(0, PminO)));
      // Seguir la curva de oferta desde Q=0 (o donde corta eje) hasta Q=Qeq
      const nSteps = 80;
      let started = false;
      for (let i = 0; i <= nSteps; i++) {
        const q = (i / nSteps) * Qeq;
        const p = pOferta(q);
        if (p >= 0 && p <= P_MAX) {
          if (!started) {
            ctx.moveTo(toX(q), toY(p));
            started = true;
          } else {
            ctx.lineTo(toX(q), toY(p));
          }
        }
      }
      ctx.lineTo(toX(Qeq), toY(Peq));
      ctx.lineTo(toX(0), toY(Peq));
      ctx.closePath();
      ctx.fill();
    }

    // ——— CURVA DE DEMANDA ———
    ctx.strokeStyle = colorD;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let firstD = true;
    for (let q = 0; q <= Q_MAX; q += 0.5) {
      const p = pDemanda(q);
      if (p < 0 || p > P_MAX) continue;
      if (firstD) {
        ctx.moveTo(toX(q), toY(p));
        firstD = false;
      } else {
        ctx.lineTo(toX(q), toY(p));
      }
    }
    ctx.stroke();

    // Etiqueta "D"
    const qLabelD = Q_MAX * 0.85;
    const pLabelD = pDemanda(qLabelD);
    if (pLabelD >= 0 && pLabelD <= P_MAX) {
      ctx.fillStyle = colorD;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('D', toX(qLabelD) + 4, toY(pLabelD) - 4);
    }

    // ——— CURVA DE OFERTA ———
    ctx.strokeStyle = colorO;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let firstO = true;
    for (let q = 0; q <= Q_MAX; q += 0.5) {
      const p = pOferta(q);
      if (p < 0 || p > P_MAX) continue;
      if (firstO) {
        ctx.moveTo(toX(q), toY(p));
        firstO = false;
      } else {
        ctx.lineTo(toX(q), toY(p));
      }
    }
    ctx.stroke();

    // Etiqueta "O"
    const qLabelO = Q_MAX * 0.85;
    const pLabelO = pOferta(qLabelO);
    if (pLabelO >= 0 && pLabelO <= P_MAX) {
      ctx.fillStyle = colorO;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('O', toX(qLabelO) + 4, toY(pLabelO) + 14);
    }

    // ——— LÍNEA DE PRECIO CONTROLADO ———
    if (modo !== 'libre') {
      const pCtrl = Math.min(precioFijado, P_MAX);
      ctx.strokeStyle = colorControl;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, toY(pCtrl));
      ctx.lineTo(pad.left + plotW, toY(pCtrl));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colorControl;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.textAlign = 'right';
      const labelCtrl = modo === 'maximo' ? `P_max = ${fmt(precioFijado)}` : `P_min = ${fmt(precioFijado)}`;
      ctx.fillText(labelCtrl, pad.left + plotW - 4, toY(pCtrl) - 4);

      // Indicar Q_d y Q_o
      if (qDemandaControlada >= 0 && qDemandaControlada <= Q_MAX) {
        ctx.strokeStyle = colorD;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(toX(qDemandaControlada), toY(pCtrl));
        ctx.lineTo(toX(qDemandaControlada), pad.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colorD;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Qd`, toX(qDemandaControlada), pad.top + plotH + 14);
      }
      if (qOfertaControlada >= 0 && qOfertaControlada <= Q_MAX) {
        ctx.strokeStyle = colorO;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(toX(qOfertaControlada), toY(pCtrl));
        ctx.lineTo(toX(qOfertaControlada), pad.top + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colorO;
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Qo`, toX(qOfertaControlada), pad.top + plotH + 26);
      }
    }

    // ——— PUNTO DE EQUILIBRIO E* ———
    if (Qeq >= 0 && Qeq <= Q_MAX && Peq >= 0 && Peq <= P_MAX) {
      // Líneas punteadas hacia los ejes
      ctx.strokeStyle = colorEq;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(pad.left, toY(Peq));
      ctx.lineTo(toX(Qeq), toY(Peq));
      ctx.lineTo(toX(Qeq), pad.top + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Círculo
      ctx.fillStyle = colorEq;
      ctx.strokeStyle = isDark ? '#2A2A2A' : 'white';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(toX(Qeq), toY(Peq), 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Etiqueta E*
      ctx.fillStyle = colorTexto;
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`E*(${fmt(Qeq)}, ${fmt(Peq)})`, toX(Qeq) + 10, toY(Peq) - 6);
    }

    // ——— EJES ———
    ctx.strokeStyle = colorEjes;
    ctx.lineWidth = 1.5;
    // Eje X
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.stroke();

    // Marcas eje X (Cantidad)
    ctx.fillStyle = colorTexto;
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let q = 0; q <= Q_MAX; q += 10) {
      const x = toX(q);
      ctx.beginPath();
      ctx.moveTo(x, pad.top + plotH);
      ctx.lineTo(x, pad.top + plotH + 4);
      ctx.stroke();
      ctx.fillText(String(q), x, pad.top + plotH + 16);
    }

    // Marcas eje Y (Precio)
    ctx.textAlign = 'right';
    for (let p = 0; p <= P_MAX; p += 10) {
      const y = toY(p);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left - 4, y);
      ctx.stroke();
      ctx.fillText(String(p), pad.left - 8, y + 4);
    }

    // Etiquetas de ejes
    ctx.fillStyle = colorTexto;
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cantidad (Q)', pad.left + plotW / 2, pad.top + plotH + 38);

    ctx.save();
    ctx.translate(15, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Precio (P)', 0, 0);
    ctx.restore();
  }, [curvas, equilibrio, modo, precioFijado, pDemanda, pOferta, qDemandaControlada, qOfertaControlada, Q_MAX, P_MAX]);

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
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [dibujar]);

  // ============================================
  // HANDLERS
  // ============================================
  const updateSlider = (key: keyof Sliders, value: number) => {
    setSliders(prev => ({ ...prev, [key]: value }));
  };

  const restablecerTodo = () => {
    setSliders({ renta: 0, sustitutivos: 0, preferencias: 0, costes: 0, tecnologia: 0, productores: 0 });
    setModo('libre');
    setPrecioFijado(25);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📈 Simulador de Oferta y Demanda</h1>
        <p className={styles.subtitle}>
          Mueve los desplazadores de demanda (renta, sustitutivos, preferencias) y de oferta
          (costes, tecnología, productores) para ver cómo cambia el equilibrio en tiempo real.
          Experimenta con precios máximos y mínimos para entender sus efectos en el mercado.
        </p>
      </header>

      <LegalNotice />

      {/* ============================================
          SELECTOR DE MODO
      ============================================ */}
      <div className={styles.modoSelector}>
        <button
          className={`${styles.modeBtn} ${modo === 'libre' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('libre')}
          aria-pressed={modo === 'libre'}
        >
          <span aria-hidden="true">⚖️</span>
          <span className={styles.modeName}>Libre mercado</span>
          <span className={styles.modeDesc}>Precio determinado por oferta y demanda</span>
        </button>
        <button
          className={`${styles.modeBtn} ${modo === 'maximo' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('maximo')}
          aria-pressed={modo === 'maximo'}
        >
          <span aria-hidden="true">🔴</span>
          <span className={styles.modeName}>Precio máximo (techo)</span>
          <span className={styles.modeDesc}>P_max por debajo del equilibrio → escasez</span>
        </button>
        <button
          className={`${styles.modeBtn} ${modo === 'minimo' ? styles.modeBtnActive : ''}`}
          onClick={() => setModo('minimo')}
          aria-pressed={modo === 'minimo'}
        >
          <span aria-hidden="true">🔵</span>
          <span className={styles.modeName}>Precio mínimo (suelo)</span>
          <span className={styles.modeDesc}>P_min por encima del equilibrio → excedente</span>
        </button>
      </div>

      {/* Input de precio controlado */}
      {modo !== 'libre' && (
        <div className={styles.precioFijadoRow}>
          <label htmlFor="precioFijado" className={styles.precioFijadoLabel}>
            {modo === 'maximo' ? 'Precio máximo (P_max):' : 'Precio mínimo (P_min):'}
          </label>
          <input
            id="precioFijado"
            type="number"
            min={0}
            max={P_MAX}
            step={1}
            value={precioFijado}
            onChange={e => setPrecioFijado(Number(e.target.value))}
            className={styles.precioInput}
            aria-label={modo === 'maximo' ? 'Precio máximo' : 'Precio mínimo'}
          />
          <span className={styles.precioUnidad}>€ / u.</span>
          {modo === 'maximo' && precioFijado >= equilibrio.P && (
            <span role="alert" className={styles.precioAdvertencia}>
              ⚠️ P_max debe ser menor que P* ({fmt(equilibrio.P)}) para causar escasez
            </span>
          )}
          {modo === 'minimo' && precioFijado <= equilibrio.P && (
            <span role="alert" className={styles.precioAdvertencia}>
              ⚠️ P_min debe ser mayor que P* ({fmt(equilibrio.P)}) para causar excedente
            </span>
          )}
        </div>
      )}

      {/* ============================================
          CANVAS
      ============================================ */}
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          role="img"
          className={styles.canvas}
          aria-label="Gráfica de oferta y demanda con punto de equilibrio"
        />
      </div>

      {/* ============================================
          PANEL DE RESULTADOS
      ============================================ */}
      <div className={styles.resultadosGrid} role="status" aria-live="polite">
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Precio de equilibrio P*</span>
          <span className={styles.resultValue}>{fmt(equilibrio.P)} €</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Cantidad de equilibrio Q*</span>
          <span className={styles.resultValue}>{fmt(equilibrio.Q)} u.</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Excedente consumidor</span>
          <span className={styles.resultValue}>{fmt(excedente.EC)} €</span>
        </div>
        <div className={styles.resultCard}>
          <span className={styles.resultLabel}>Excedente productor</span>
          <span className={styles.resultValue}>{fmt(excedente.EP)} €</span>
        </div>
        <div className={`${styles.resultCard} ${styles.resultCardDestacado}`}>
          <span className={styles.resultLabel}>Bienestar total</span>
          <span className={styles.resultValue}>{fmt(excedente.EC + excedente.EP)} €</span>
        </div>
        {modo !== 'libre' && (
          <div className={`${styles.resultCard} ${styles.resultCardControl}`}>
            <span className={styles.resultLabel}>
              {modo === 'maximo' ? 'Escasez (Qd − Qo)' : 'Excedente (Qo − Qd)'}
            </span>
            <span className={styles.resultValue}>{fmt(desequilibrio)} u.</span>
          </div>
        )}
      </div>

      {/* ============================================
          SLIDERS: DEMANDA + OFERTA
      ============================================ */}
      <div className={styles.slidersLayout}>
        {/* DEMANDA */}
        <div className={styles.slidersGroup}>
          <h2 className={styles.slidersGroupTitle}>
            <span aria-hidden="true" style={{ color: '#2E86AB' }}>↑↓</span> Desplazadores de Demanda
          </h2>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Renta disponible</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={sliders.renta}
              onChange={e => updateSlider('renta', Number(e.target.value))}
              className={styles.slider}
              aria-label="Renta disponible"
            />
            <span className={styles.sliderValue}>
              {sliders.renta > 0 ? `+${sliders.renta}` : sliders.renta}
            </span>
          </div>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Precio bienes sustitutivos</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={sliders.sustitutivos}
              onChange={e => updateSlider('sustitutivos', Number(e.target.value))}
              className={styles.slider}
              aria-label="Precio bienes sustitutivos"
            />
            <span className={styles.sliderValue}>
              {sliders.sustitutivos > 0 ? `+${sliders.sustitutivos}` : sliders.sustitutivos}
            </span>
          </div>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Preferencias / moda</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={sliders.preferencias}
              onChange={e => updateSlider('preferencias', Number(e.target.value))}
              className={styles.slider}
              aria-label="Preferencias y moda"
            />
            <span className={styles.sliderValue}>
              {sliders.preferencias > 0 ? `+${sliders.preferencias}` : sliders.preferencias}
            </span>
          </div>
        </div>

        {/* OFERTA */}
        <div className={styles.slidersGroup}>
          <h2 className={styles.slidersGroupTitle}>
            <span aria-hidden="true" style={{ color: '#E07A1F' }}>↑↓</span> Desplazadores de Oferta
          </h2>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Coste de producción</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={sliders.costes}
              onChange={e => updateSlider('costes', Number(e.target.value))}
              className={styles.slider}
              aria-label="Coste de producción"
            />
            <span className={styles.sliderValue}>
              {sliders.costes > 0 ? `+${sliders.costes}` : sliders.costes}
            </span>
          </div>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Tecnología</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={sliders.tecnologia}
              onChange={e => updateSlider('tecnologia', Number(e.target.value))}
              className={styles.slider}
              aria-label="Tecnología disponible"
            />
            <span className={styles.sliderValue}>
              {sliders.tecnologia > 0 ? `+${sliders.tecnologia}` : sliders.tecnologia}
            </span>
          </div>

          <div className={styles.sliderRow}>
            <span className={styles.sliderLabel}>Número de productores</span>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={sliders.productores}
              onChange={e => updateSlider('productores', Number(e.target.value))}
              className={styles.slider}
              aria-label="Número de productores"
            />
            <span className={styles.sliderValue}>
              {sliders.productores > 0 ? `+${sliders.productores}` : sliders.productores}
            </span>
          </div>
        </div>
      </div>

      {/* Botón restablecer */}
      <div className={styles.resetRow}>
        <button
          type="button"
          className={styles.btnReset}
          onClick={restablecerTodo}
          aria-label="Restablecer todos los parámetros a sus valores iniciales"
        >
          🔄 Restablecer todo
        </button>
      </div>

      {/* ============================================
          BLOQUE EDUCATIVO v2.0
      ============================================ */}
      <EducationalSection
        title="Aprende sobre Oferta y Demanda"
        subtitle="El mecanismo de precios y cómo coordina la economía sin planificador central"
      >
        {/* INTRO */}
        <section>
          <h3>¿Qué es el mecanismo de precios?</h3>
          <p>
            El <strong>mecanismo de precios</strong> es el sistema por el cual millones de decisiones
            individuales de compradores y vendedores se coordinan sin necesidad de una autoridad central.
            Cuando el precio de un bien sube, los compradores reducen su cantidad demandada y los
            productores aumentan su oferta: el mercado se autoregula.
          </p>
          <p>
            El economista Friedrich Hayek propuso que el precio condensa toda la información
            dispersa en la economía (escasez de recursos, preferencias, costes de producción) en
            un único número accesible a todos los agentes. Según este argumento, el mecanismo de
            precios tiende a coordinar la información descentralizada sin que nadie necesite conocer
            todos los datos; basta con observar el precio. Este planteamiento no descarta la
            existencia de fallos de mercado (externalidades, bienes públicos, información asimétrica).
          </p>
          <div className={styles.formulaBox}>
            <strong>Equilibrio:</strong> P* = (a − c) / (b + d) &nbsp;·&nbsp; Q* = a − b · P*
          </div>
          <p>
            En el modelo lineal de este simulador, la curva de demanda es{' '}
            <code>Q_d = a − b·P</code> (más precio, menos cantidad) y la curva de oferta es{' '}
            <code>Q_o = c + d·P</code> (más precio, más producción). El equilibrio se alcanza
            igualando ambas expresiones.
          </p>
        </section>

        {/* TABLA COMPARATIVA */}
        <section>
          <h3>Desplazadores de la demanda — 6 factores clave</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Desplazador</th>
                  <th>Efecto sobre la curva D</th>
                  <th>Ejemplo real</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Renta disponible</strong></td>
                  <td>↑ Renta → D se desplaza a la derecha (bienes normales)</td>
                  <td>Aumento del salario mínimo → más demanda de ocio</td>
                </tr>
                <tr>
                  <td><strong>Precio de sustitutivos</strong></td>
                  <td>↑ P_sustituto → D aumenta para el bien en cuestión</td>
                  <td>Café más caro → más demanda de té</td>
                </tr>
                <tr>
                  <td><strong>Precio de complementarios</strong></td>
                  <td>↑ P_complementario → D disminuye (bienes usados juntos)</td>
                  <td>Gasolina más cara → menos demanda de coches de combustión</td>
                </tr>
                <tr>
                  <td><strong>Preferencias / moda</strong></td>
                  <td>↑ Preferencia → D se desplaza a la derecha</td>
                  <td>Tendencia fitness → más demanda de ropa deportiva</td>
                </tr>
                <tr>
                  <td><strong>Expectativas</strong></td>
                  <td>Precio futuro esperado más alto → compran hoy → D↑ ahora</td>
                  <td>Inflación esperada → adelantan compras de electrodomésticos</td>
                </tr>
                <tr>
                  <td><strong>Número de compradores</strong></td>
                  <td>Más compradores → D se desplaza a la derecha</td>
                  <td>Envejecimiento población → más demanda de servicios sanitarios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ESCENARIOS */}
        <section>
          <h3>4 escenarios históricos reales</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>😷</span>
              <strong>COVID-19 y mascarillas (2020)</strong>
              <p>
                La pandemia disparó la demanda de mascarillas (D se desplazó a la derecha) mientras
                la oferta no pudo adaptarse a corto plazo. El precio de equilibrio se multiplicó
                por 10-20 veces. Muchos gobiernos impusieron precios máximos, creando escasez en
                farmacias: ejemplo perfecto de techo de precio mal calibrado.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🛢️</span>
              <strong>Petróleo y coches eléctricos</strong>
              <p>
                La mejora tecnológica en baterías (desplazador de oferta positivo) y las
                preferencias por vehículos eléctricos (desplazador de demanda positivo) actúan
                simultáneamente. La cantidad de equilibrio de coches eléctricos sube con seguridad;
                el efecto sobre el precio depende de cuál de los dos desplazamientos es mayor.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>🏠</span>
              <strong>Precio máximo del alquiler urbano</strong>
              <p>
                Varias ciudades han fijado techos de alquiler para proteger a los inquilinos. Si
                el precio máximo queda por debajo del equilibrio, la cantidad ofertada cae (menos
                propietarios alquilan) y la demandada sube (más gente quiere alquilar a ese precio):
                escasez estructural y mercado negro.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon}>💵</span>
              <strong>Precio mínimo: el salario</strong>
              <p>
                El salario mínimo es el precio mínimo del trabajo. Si se fija por encima del
                equilibrio, la cantidad ofrecida de trabajo (trabajadores dispuestos) supera la
                cantidad demandada (empleos disponibles): desempleo estructural según el modelo
                básico, aunque efectos reales son más complejos (monopsonio, productividad, etc.).
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué la curva de demanda tiene pendiente negativa?</h4>
              <p>
                Por la <strong>ley de la demanda</strong>: a mayor precio, menor cantidad demandada,
                por dos razones. El <em>efecto sustitución</em>: si el bien se encarece, los
                consumidores sustituyen por alternativas más baratas. El <em>efecto renta</em>: un
                precio más alto reduce el poder adquisitivo real, y con él la cantidad que pueden
                permitirse comprar.
              </p>
              <p className={styles.faqTip}>
                💡 Excepción: los bienes Giffen (muy raros, como la patata en Irlanda siglo XIX)
                tienen pendiente positiva porque son inferiores con un peso muy alto en el
                presupuesto familiar.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre cambio en la cantidad demandada y cambio en la demanda?</h4>
              <p>
                <strong>Movimiento a lo largo de la curva</strong>: el precio cambia, la cantidad
                demandada cambia. La curva de demanda no se mueve. <strong>Desplazamiento de la
                curva</strong>: cambia cualquier factor distinto al precio (renta, sustitutivos,
                preferencias...) y toda la curva se traslada a izquierda o derecha.
              </p>
              <p className={styles.faqTip}>
                💡 En el simulador, los sliders <em>desplazan</em> las curvas. Si solo cambia el
                precio en el gráfico (eje Y), te mueves <em>a lo largo</em> de la misma curva.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el precio de equilibrio?</h4>
              <p>
                El precio al que la cantidad demandada iguala exactamente la cantidad ofertada:
                no sobra ni falta producto. Es el precio que &quot;vacía el mercado&quot;. Si el precio
                está por encima, hay exceso de oferta (los vendedores bajan precios para dar
                salida al stock); si está por debajo, hay exceso de demanda (los compradores
                compiten y el precio sube).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Por qué los controles de precio crean ineficiencias?</h4>
              <p>
                Porque eliminan la información que transmite el precio. Un techo (precio máximo)
                impide que el precio suba para atraer más oferta y racionar la demanda: aparece
                escasez y, a veces, mercados negros donde el producto se vende a precios más altos
                que el equilibrio original. Un suelo (precio mínimo) impide que el precio baje
                para ajustar la sobreproducción: quedan excedentes sin vender.
              </p>
              <p className={styles.faqTip}>
                💡 El bienestar total (EC + EP) siempre es menor con control de precios que en
                libre mercado: la diferencia es la <em>pérdida irrecuperable de eficiencia</em>
                (triángulo de Harberger).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es el excedente del consumidor?</h4>
              <p>
                La diferencia entre lo que el consumidor estaba dispuesto a pagar (su precio de
                reserva) y lo que realmente paga (P*). Es el &quot;ahorro&quot; que obtiene por poder
                comprar a un precio menor del máximo que hubiera aceptado. Gráficamente, es el
                área del triángulo entre la curva de demanda, el precio de equilibrio y el eje
                de precios.
              </p>
              <p className={styles.faqTip}>
                💡 Ejemplo: si valoras una camiseta en 30 € y la compras a 18 €, tu excedente
                del consumidor es 12 €.
              </p>
            </div>
          </div>
        </section>

        {/* PASOS */}
        <section>
          <h3>Cómo analizar el efecto de un desplazador sobre el equilibrio</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica el mercado y el bien</strong>
                <p>
                  Define con claridad qué bien o servicio estás analizando, quiénes son compradores
                  y vendedores, y cuál es la unidad de tiempo (mes, año). La misma variable puede
                  ser sustitutiva en un mercado y complementaria en otro.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Determina si el desplazador afecta a D u O</strong>
                <p>
                  ¿El factor cambia las <em>ganas o posibilidad</em> de comprar? → Demanda.
                  ¿Cambia el <em>coste o capacidad</em> de producir? → Oferta. Algunos factores
                  (como el precio del bien mismo) no desplazan ninguna curva: solo mueven a lo
                  largo de ella.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Determina la dirección del desplazamiento</strong>
                <p>
                  ¿Sube la demanda o baja? ¿Sube la oferta o baja? Para la demanda: más renta →
                  derecha (bienes normales). Para la oferta: mejora tecnológica → derecha (más
                  producción al mismo precio). Usa el simulador para visualizarlo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Predice el efecto sobre P* y Q*</strong>
                <p>
                  Si D sube (derecha): P* ↑ y Q* ↑. Si D baja (izquierda): P* ↓ y Q* ↓. Si O
                  sube (derecha): P* ↓ y Q* ↑. Si O baja (izquierda): P* ↑ y Q* ↓. Cuando ambas
                  se desplazan, el efecto sobre P* o Q* es ambiguo: depende de la magnitud relativa.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Compara con el nuevo equilibrio del simulador</strong>
                <p>
                  Verifica tu predicción moviendo el slider correspondiente. Si no coincide, revisa
                  si clasificaste correctamente el desplazador o si olvidaste efectos secundarios
                  (por ejemplo, que el mismo evento afecta tanto a D como a O simultáneamente).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TIPS */}
        <section>
          <h3>4 claves para dominar el análisis de mercado</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🎯</span>
              <strong>Piensa en desplazamientos, no en movimientos</strong>
              <p>
                El error más frecuente en exámenes (selectividad o EBAU en España, examen de
                admisión universitaria tras la preparatoria o la secundaria en Latinoamérica) es
                confundir &quot;el precio sube&quot; (movimiento a lo largo de la curva) con &quot;la demanda
                sube&quot; (desplazamiento de la curva). La curva de demanda solo se desplaza cuando
                cambia algo distinto al precio del propio bien.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <strong>Usa el excedente para evaluar políticas</strong>
              <p>
                El bienestar total (EC + EP) mide la eficiencia del mercado. Una política que
                reduce el bienestar total tiene un coste real para la sociedad, aunque beneficie
                a un grupo concreto. El triángulo de pérdida irrecuperable cuantifica ese coste.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Desplazamientos simultáneos: razona por separado</strong>
              <p>
                Cuando D y O se desplazan a la vez, analiza cada uno por separado y luego combina.
                Si D sube y O sube: Q* sube con seguridad, pero P* es ambiguo (depende de cuánto
                se desplaza cada curva). El simulador lo resuelve numéricamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚠️</span>
              <strong>El largo plazo cambia las conclusiones</strong>
              <p>
                A corto plazo la oferta es rígida (no se puede construir más capacidad productiva
                de golpe) y el precio absorbe más el shock. A largo plazo la oferta es elástica
                y el ajuste recae más en la cantidad. Una misma política tiene efectos distintos
                según el horizonte temporal.
              </p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>5 errores frecuentes en el análisis de oferta y demanda</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir movimiento a lo largo de la curva con desplazamiento</strong> —
              Si el precio sube, la cantidad demandada baja: nos movemos sobre la misma curva D.
              La curva solo se desplaza si cambia renta, sustitutivos, preferencias u otros factores
              distintos al precio del bien.
            </li>
            <li>
              <strong>Creer que el precio máximo siempre ayuda a los consumidores</strong> —
              Si el techo está por debajo del equilibrio, se reduce la oferta disponible. Los
              consumidores con menos recursos pueden no acceder al bien por falta de stock, aunque
              el precio nominal sea bajo. Las colas y el racionamiento son el resultado.
            </li>
            <li>
              <strong>Ignorar el largo plazo</strong> — A largo plazo los productores pueden entrar
              o salir del mercado, adaptar la capacidad productiva y la tecnología. Las conclusiones
              del modelo estático de este simulador son válidas a corto plazo; a largo plazo las
              pendientes cambian y los efectos sobre precios se amortiguan.
            </li>
            <li>
              <strong>Confundir oferta con cantidad ofrecida</strong> — &quot;La oferta sube&quot; significa
              que la curva se desplaza a la derecha (más producción a cada precio). &quot;La cantidad
              ofrecida sube&quot; significa que el precio subió y nos movemos sobre la misma curva O.
              Son conceptos distintos y confundirlos genera errores de razonamiento.
            </li>
            <li>
              <strong>Olvidar los bienes complementarios como desplazadores</strong> — No solo los
              sustitutivos desplazan la demanda. Si el precio de un complementario sube (p.ej., la
              gasolina), la demanda del bien principal baja (p.ej., coches de combustión). Los bienes
              complementarios se usan juntos, por lo que sus mercados están estrechamente ligados.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-oferta-demanda')} />
      <ShareCard appName="simulador-oferta-demanda" />
      <Footer appName="simulador-oferta-demanda" />
    </div>
  );
}
