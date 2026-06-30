'use client';
// @disclaimer: exempt

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './SimuladorElasticidadPrecio.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface Bien {
  id: string;
  nombre: string;
  emoji: string;
  elasticidad: number;
  precioBase: number;
  cantidadBase: number;
  descripcion: string;
  ejemplo: string;
}

type TipoElasticidad = 'demanda' | 'oferta';

interface ResultadoCalculo {
  deltaQ: number;
  P_nuevo: number;
  Q_nuevo: number;
  IT_base: number;
  IT_nuevo: number;
  deltaIT: number;
  deltaIT_pct: number;
}

// ---------------------------------------------------------------------------
// Datos
// ---------------------------------------------------------------------------

const BIENES: Bien[] = [
  {
    id: 'insulina',
    nombre: 'Insulina',
    emoji: '💉',
    elasticidad: 0.1,
    precioBase: 50,
    cantidadBase: 100,
    descripcion:
      'Medicamento de primera necesidad sin sustitutivos. La demanda es casi perfectamente inelástica.',
    ejemplo: 'Si el precio sube un 50%, la cantidad demandada solo cae un 5%.',
  },
  {
    id: 'sal',
    nombre: 'Sal de mesa',
    emoji: '🧂',
    elasticidad: 0.1,
    precioBase: 0.8,
    cantidadBase: 100,
    descripcion:
      'Bien de primera necesidad sin sustitutivos, gasto mínimo en el presupuesto familiar.',
    ejemplo: 'Duplicar el precio de la sal no cambia casi nada el consumo.',
  },
  {
    id: 'gasolina',
    nombre: 'Gasolina',
    emoji: '⛽',
    elasticidad: 0.35,
    precioBase: 1.65,
    cantidadBase: 100,
    descripcion:
      'Inelástica a corto plazo (pocas alternativas inmediatas), más elástica a largo plazo.',
    ejemplo: 'Subida del 20% → caída del 7% en consumo a corto plazo.',
  },
  {
    id: 'cafe',
    nombre: 'Café de marca',
    emoji: '☕',
    elasticidad: 0.8,
    precioBase: 4.5,
    cantidadBase: 100,
    descripcion: 'Tiene sustitutivos (otras marcas, té). Elástica pero no unitaria.',
    ejemplo: 'Subida del 25% → caída del 20% en ventas.',
  },
  {
    id: 'smartphone',
    nombre: 'Smartphone gama alta',
    emoji: '📱',
    elasticidad: 1.5,
    precioBase: 1000,
    cantidadBase: 100,
    descripcion: 'Bien de lujo con muchos sustitutivos. La demanda es elástica.',
    ejemplo: 'Subida del 20% → caída del 30% en ventas.',
  },
  {
    id: 'vuelo',
    nombre: 'Vuelo turístico',
    emoji: '✈️',
    elasticidad: 2.4,
    precioBase: 200,
    cantidadBase: 100,
    descripcion:
      'Bien de lujo, muy elástico. Con sustitutivos (tren, coche) y muchas alternativas de destino.',
    ejemplo: 'Subida del 10% → caída del 24% en reservas.',
  },
];

// ---------------------------------------------------------------------------
// Funciones puras
// ---------------------------------------------------------------------------

function calcular(bien: Bien, deltaP: number, tipo: TipoElasticidad): ResultadoCalculo {
  // Demanda: relación inversa (Ed negativo). Oferta: relación directa (Eo positivo).
  const signo = tipo === 'demanda' ? -1 : 1;
  const deltaQ = signo * bien.elasticidad * deltaP;

  const P_nuevo = bien.precioBase * (1 + deltaP / 100);
  const Q_nuevo = Math.max(0, bien.cantidadBase * (1 + deltaQ / 100));

  const IT_base = bien.precioBase * bien.cantidadBase;
  const IT_nuevo = P_nuevo * Q_nuevo;
  const deltaIT = IT_nuevo - IT_base;
  const deltaIT_pct = (deltaIT / IT_base) * 100;

  return { deltaQ, P_nuevo, Q_nuevo, IT_base, IT_nuevo, deltaIT, deltaIT_pct };
}

function clasificarElasticidad(e: number): string {
  if (e < 0.05) return 'Perfectamente inelástica';
  if (e < 1) return 'Inelástica (|Ed| < 1)';
  if (Math.abs(e - 1) < 0.05) return 'Unitaria (|Ed| ≈ 1)';
  if (e < 50) return 'Elástica (|Ed| > 1)';
  return 'Perfectamente elástica';
}

function interpretacionIT(deltaP: number, deltaIT: number, clasificacion: string): string {
  if (deltaP === 0) return 'Introduce una variación de precio para ver el efecto sobre el ingreso total.';
  const accion = deltaP > 0 ? 'subir' : 'bajar';
  const efecto = Math.abs(deltaIT) < 0.01 ? 'no varía' : deltaIT > 0 ? 'aumenta' : 'disminuye';
  const causa =
    clasificacion.startsWith('Inelástica')
      ? 'la demanda es inelástica: los compradores apenas reducen la cantidad'
      : clasificacion.startsWith('Elástica')
      ? 'la demanda es elástica: los compradores reducen mucho la cantidad'
      : 'la demanda es unitaria: los efectos precio y cantidad se compensan';
  return `Al ${accion} el precio un ${formatNumber(Math.abs(deltaP), 0)}%, el ingreso total ${efecto} porque ${causa}.`;
}

// ---------------------------------------------------------------------------
// Dibujo en canvas
// ---------------------------------------------------------------------------

function dibujarGrafico(
  canvas: HTMLCanvasElement,
  bien: Bien,
  resultado: ResultadoCalculo,
  isDark: boolean
): void {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  // Colores adaptados al tema
  const colorFondo = isDark ? '#2A2A2A' : '#FFFFFF';
  const colorEje = isDark ? '#888888' : '#999999';
  const colorTexto = isDark ? '#B0B0B0' : '#666666';
  const colorBase = 'rgba(46, 134, 171, 0.35)';
  const colorNuevo = 'rgba(224, 122, 31, 0.35)';
  const colorBaseStroke = '#2E86AB';
  const colorNuevoStroke = '#E07A1F';
  const colorCurva = isDark ? '#48A9A6' : '#2E86AB';

  // Márgenes
  const pad = { top: 30, right: 30, bottom: 50, left: 65 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // Fondo
  ctx.fillStyle = colorFondo;
  ctx.fillRect(0, 0, W, H);

  // Rango de ejes
  const Q_base = bien.cantidadBase;
  const Q_max = Math.max(Q_base * 1.6, resultado.Q_nuevo * 1.3, 10);
  const P_max_val = Math.max(bien.precioBase * 1.8, resultado.P_nuevo * 1.4, 1);
  const P_min_val = 0;

  const toX = (q: number): number => pad.left + (q / Q_max) * plotW;
  const toY = (p: number): number => pad.top + ((P_max_val - p) / (P_max_val - P_min_val)) * plotH;

  // Curva de demanda (lineal con pendiente derivada de la elasticidad)
  // Pendiente: ΔP/ΔQ = -(P_base/Q_base)/Ed
  const Ed = bien.elasticidad;
  const slope = -(bien.precioBase / (Q_base * Ed)); // dP/dQ — negativo para demanda
  // Intersecciones: la curva pasa por (Q_base, P_base)
  // P = P_base + slope * (Q - Q_base)
  const curvaQ = (q: number): number => bien.precioBase + slope * (q - Q_base);

  // Puntos donde la curva sale del área visible
  const Q_at_Pmax = Q_base + (P_max_val - bien.precioBase) / slope;
  const Q_at_zero = Q_base + (0 - bien.precioBase) / slope;
  const Q_start = Math.max(0, Math.min(Q_at_Pmax, Q_at_zero));
  const Q_end = Math.min(Q_max, Math.max(Q_at_Pmax, Q_at_zero));

  // Rectángulo ingreso total BASE (Q_base × P_base)
  const rx_base = toX(0);
  const ry_base = toY(bien.precioBase);
  const rw_base = toX(Q_base) - toX(0);
  const rh_base = toY(0) - toY(bien.precioBase);

  ctx.fillStyle = colorBase;
  ctx.fillRect(rx_base, ry_base, rw_base, rh_base);
  ctx.strokeStyle = colorBaseStroke;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(rx_base, ry_base, rw_base, rh_base);
  ctx.setLineDash([]);

  // Rectángulo ingreso total NUEVO (Q_nuevo × P_nuevo)
  const rx_new = toX(0);
  const ry_new = toY(resultado.P_nuevo);
  const rw_new = toX(resultado.Q_nuevo) - toX(0);
  const rh_new = toY(0) - toY(resultado.P_nuevo);

  ctx.fillStyle = colorNuevo;
  ctx.fillRect(rx_new, ry_new, rw_new, rh_new);
  ctx.strokeStyle = colorNuevoStroke;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(rx_new, ry_new, rw_new, rh_new);
  ctx.setLineDash([]);

  // Curva de demanda
  ctx.beginPath();
  ctx.strokeStyle = colorCurva;
  ctx.lineWidth = 2.5;
  let firstPoint = true;
  const steps = 80;
  for (let i = 0; i <= steps; i++) {
    const q = Q_start + (i / steps) * (Q_end - Q_start);
    const p = curvaQ(q);
    if (p < 0 || p > P_max_val || q < 0 || q > Q_max) continue;
    const x = toX(q);
    const y = toY(p);
    if (firstPoint) {
      ctx.moveTo(x, y);
      firstPoint = false;
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Punto base
  ctx.beginPath();
  ctx.arc(toX(Q_base), toY(bien.precioBase), 6, 0, Math.PI * 2);
  ctx.fillStyle = colorBaseStroke;
  ctx.fill();

  // Punto nuevo
  if (resultado.Q_nuevo > 0) {
    ctx.beginPath();
    ctx.arc(toX(resultado.Q_nuevo), toY(resultado.P_nuevo), 6, 0, Math.PI * 2);
    ctx.fillStyle = colorNuevoStroke;
    ctx.fill();
  }

  // Etiqueta variación IT
  const deltaIT = resultado.deltaIT;
  const etiquetaIT = deltaIT >= 0 ? `+${formatNumber(deltaIT, 0)} €` : `${formatNumber(deltaIT, 0)} €`;
  const colorLabel = Math.abs(deltaIT) < 1 ? colorTexto : deltaIT > 0 ? '#28a745' : '#dc3545';
  ctx.fillStyle = colorLabel;
  ctx.font = 'bold 13px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(etiquetaIT, W / 2, pad.top + 16);

  // Ejes
  ctx.strokeStyle = colorEje;
  ctx.lineWidth = 1.5;
  // Eje X
  ctx.beginPath();
  ctx.moveTo(pad.left, H - pad.bottom);
  ctx.lineTo(W - pad.right, H - pad.bottom);
  ctx.stroke();
  // Eje Y
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, H - pad.bottom);
  ctx.stroke();

  // Marcas eje X
  ctx.fillStyle = colorTexto;
  ctx.font = '10px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  const marcasQ = [0, Q_base * 0.5, Q_base, resultado.Q_nuevo, Q_max * 0.8].filter(
    (q) => q >= 0 && q <= Q_max
  );
  const marcasQUniq = [...new Set(marcasQ.map((q) => Math.round(q)))];
  for (const q of marcasQUniq) {
    const x = toX(q);
    ctx.beginPath();
    ctx.moveTo(x, H - pad.bottom);
    ctx.lineTo(x, H - pad.bottom + 4);
    ctx.strokeStyle = colorEje;
    ctx.stroke();
    ctx.fillText(String(Math.round(q)), x, H - pad.bottom + 15);
  }

  // Marcas eje Y
  ctx.textAlign = 'right';
  const marcasP = [0, bien.precioBase * 0.5, bien.precioBase, resultado.P_nuevo].filter(
    (p) => p >= 0 && p <= P_max_val
  );
  const marcasPUniq = [...new Set(marcasP.map((p) => Math.round(p * 100) / 100))];
  for (const p of marcasPUniq) {
    const y = toY(p);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left - 4, y);
    ctx.strokeStyle = colorEje;
    ctx.stroke();
    ctx.fillStyle = colorTexto;
    ctx.fillText(formatNumber(p, 2), pad.left - 6, y + 4);
  }

  // Etiquetas de ejes
  ctx.fillStyle = colorTexto;
  ctx.font = '11px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Cantidad (Q)', pad.left + plotW / 2, H - 8);

  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Precio (P)', 0, 0);
  ctx.restore();

  // Leyenda
  const legX = pad.left + 8;
  const legY = pad.top + 8;
  const legSize = 10;
  ctx.fillStyle = colorBase;
  ctx.fillRect(legX, legY, legSize, legSize);
  ctx.strokeStyle = colorBaseStroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(legX, legY, legSize, legSize);
  ctx.fillStyle = colorTexto;
  ctx.textAlign = 'left';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillText('IT base', legX + legSize + 4, legY + legSize - 1);

  ctx.fillStyle = colorNuevo;
  ctx.fillRect(legX, legY + 16, legSize, legSize);
  ctx.strokeStyle = colorNuevoStroke;
  ctx.strokeRect(legX, legY + 16, legSize, legSize);
  ctx.fillStyle = colorTexto;
  ctx.fillText('IT nuevo', legX + legSize + 4, legY + 26);
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function SimuladorElasticidadPrecio() {
  const [bienId, setBienId] = useState<string>('gasolina');
  const [deltaP, setDeltaP] = useState<number>(10);
  const [tipoElasticidad, setTipoElasticidad] = useState<TipoElasticidad>('demanda');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const bien = BIENES.find((b) => b.id === bienId) ?? BIENES[2]!;
  const resultado = calcular(bien, deltaP, tipoElasticidad);
  const clasificacion = clasificarElasticidad(bien.elasticidad);
  const interpretacion = interpretacionIT(deltaP, resultado.deltaIT, clasificacion);

  const badgeClass =
    bien.elasticidad < 1
      ? styles.badgeInelastica
      : Math.abs(bien.elasticidad - 1) < 0.05
      ? styles.badgeUnitaria
      : styles.badgeElastica;

  const redibujar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    dibujarGrafico(canvas, bien, resultado, isDark);
  }, [bien, resultado]);

  useEffect(() => {
    redibujar();
  }, [redibujar]);

  useEffect(() => {
    const observer = new MutationObserver(redibujar);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [redibujar]);

  useEffect(() => {
    const handleResize = () => redibujar();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redibujar]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">📊</span> Simulador de Elasticidad-Precio</h1>
          <p className={styles.subtitle}>
            Cambia el precio de 6 bienes reales y observa cómo varía la cantidad demandada y el
            ingreso total según su elasticidad
          </p>
        </header>

        <LegalNotice />

        {/* Selector de bien */}
        <section className={styles.bienesSelector} aria-label="Selección de bien">
          {BIENES.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`${styles.bienBtn} ${b.id === bienId ? styles.bienBtnActivo : ''}`}
              onClick={() => setBienId(b.id)}
              aria-pressed={b.id === bienId}
            >
              <span aria-hidden="true">{b.emoji}</span>
              <span>{b.nombre}</span>
            </button>
          ))}
        </section>

        {/* Descripción del bien */}
        <div className={styles.bienDescripcion}>
          <p>
            <strong><span aria-hidden="true">{bien.emoji}</span> {bien.nombre}</strong> — {bien.descripcion}
          </p>
          <p className={styles.bienEjemplo}>{bien.ejemplo}</p>
        </div>

        {/* Toggle demanda / oferta */}
        <div className={styles.tipoToggle} role="group" aria-label="Tipo de elasticidad">
          <button
            type="button"
            className={`${styles.toggleBtn} ${tipoElasticidad === 'demanda' ? styles.toggleBtnActivo : ''}`}
            onClick={() => setTipoElasticidad('demanda')}
            aria-pressed={tipoElasticidad === 'demanda'}
          >
            <span aria-hidden="true">📉</span> Elasticidad de demanda (Ed)
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${tipoElasticidad === 'oferta' ? styles.toggleBtnActivo : ''}`}
            onClick={() => setTipoElasticidad('oferta')}
            aria-pressed={tipoElasticidad === 'oferta'}
          >
            <span aria-hidden="true">📈</span> Elasticidad de oferta (Eo)
          </button>
        </div>

        {/* Slider ΔP% */}
        <div className={styles.deltaSliderRow}>
          <label htmlFor="deltaP" className={styles.sliderLabel}>
            Variación de precio (ΔP%)
          </label>
          <input
            id="deltaP"
            type="range"
            min={-50}
            max={50}
            step={1}
            value={deltaP}
            onChange={(e) => setDeltaP(Number(e.target.value))}
            className={styles.slider}
            aria-valuenow={deltaP}
            aria-valuemin={-50}
            aria-valuemax={50}
          />
          <span className={styles.sliderValue}>
            {deltaP > 0 ? '+' : ''}{deltaP}%
          </span>
        </div>

        {/* Canvas */}
        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label={`Gráfico de elasticidad-precio para ${bien.nombre}. Rectángulo azul: ingreso total base. Rectángulo naranja: ingreso total con el nuevo precio.`}
          />
        </div>

        {/* Panel de resultados */}
        <section className={styles.resultadosPanel} aria-label="Resultados">
          <div className={styles.elasticidadBadge}>
            <span className={`${styles.badgeBase} ${badgeClass}`}>
              {clasificacion}
            </span>
            <span className={styles.badgeEd}>
              |Ed| = {formatNumber(bien.elasticidad, 2)}
            </span>
          </div>

          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Precio base</span>
            <span className={styles.resultValue}>{formatNumber(bien.precioBase, 2)} €</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Precio nuevo</span>
            <span className={styles.resultValue}>{formatNumber(resultado.P_nuevo, 2)} €</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>
              ΔP = {deltaP > 0 ? '+' : ''}{deltaP}% → ΔQ
            </span>
            <span className={`${styles.resultValue} ${resultado.deltaQ < 0 ? styles.valorNegativo : styles.valorPositivo}`}>
              {resultado.deltaQ > 0 ? '+' : ''}{formatNumber(resultado.deltaQ, 1)}%
            </span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Ingreso total base</span>
            <span className={styles.resultValue}>{formatNumber(resultado.IT_base, 0)} €</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Ingreso total nuevo</span>
            <span className={styles.resultValue}>{formatNumber(resultado.IT_nuevo, 0)} €</span>
          </div>
          <div className={styles.resultRow}>
            <span className={styles.resultLabel}>Variación del ingreso total</span>
            <span
              className={`${styles.resultValue} ${
                resultado.deltaIT > 0.5
                  ? styles.valorPositivo
                  : resultado.deltaIT < -0.5
                  ? styles.valorNegativo
                  : ''
              }`}
            >
              {resultado.deltaIT >= 0 ? '+' : ''}{formatNumber(resultado.deltaIT, 0)} €
              {' '}({resultado.deltaIT_pct >= 0 ? '+' : ''}{formatNumber(resultado.deltaIT_pct, 1)}%)
            </span>
          </div>

          <p className={styles.interpretacionText}>{interpretacion}</p>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía de Elasticidad-Precio"
          subtitle="Conceptos, fórmulas, escenarios reales y errores frecuentes"
        >
          {/* Intro */}
          <div className={styles.introSection}>
            <h3>¿Qué es la elasticidad-precio de la demanda?</h3>
            <p>
              La <strong>elasticidad-precio de la demanda</strong> (Ed) mide la sensibilidad de los
              consumidores ante cambios en el precio de un bien. Se calcula como el cociente entre la
              variación porcentual en la cantidad demandada y la variación porcentual en el precio:
            </p>
            <p className={styles.formula}>
              |Ed| = |%ΔQ / %ΔP|
            </p>
            <p>
              Si |Ed| &gt; 1, la demanda es <strong>elástica</strong>: los consumidores reaccionan
              mucho. Si |Ed| &lt; 1, es <strong>inelástica</strong>: reaccionan poco. La elasticidad
              importa porque determina si subir el precio incrementa o reduce el ingreso total de la
              empresa, y para diseñar políticas fiscales eficaces.
            </p>
            <p>
              Es un concepto clave en los programas de economía de Bachillerato y EBAU (España), así
              como de preparatoria, secundaria y educación media (Latinoamérica), y suele aparecer en
              el examen de admisión universitaria.
            </p>
          </div>

          {/* Tabla comparativa */}
          <h3>Comparativa de bienes</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Bien</th>
                  <th>|Ed|</th>
                  <th>Clasificación</th>
                  <th>Efecto en IT al subir precio</th>
                  <th>Ejemplo de política fiscal</th>
                  <th>Por qué</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span aria-hidden="true">💉</span> Insulina</td>
                  <td>0,10</td>
                  <td>Perfectamente inelástica</td>
                  <td className={styles.tdPositivo}>IT sube mucho</td>
                  <td>Impuesto recauda sin apenas reducir uso</td>
                  <td>Sin sustitutivos, vital</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🧂</span> Sal</td>
                  <td>0,10</td>
                  <td>Perfectamente inelástica</td>
                  <td className={styles.tdPositivo}>IT sube mucho</td>
                  <td>Gabela histórica (impuesto sobre la sal)</td>
                  <td>Gasto ínfimo en el presupuesto</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">⛽</span> Gasolina</td>
                  <td>0,35</td>
                  <td>Inelástica</td>
                  <td className={styles.tdPositivo}>IT sube</td>
                  <td>Impuesto verde: recauda y desalienta algo el uso</td>
                  <td>Pocas alternativas inmediatas</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">☕</span> Café de marca</td>
                  <td>0,80</td>
                  <td>Inelástica (cerca de unitaria)</td>
                  <td className={styles.tdNeutro}>IT sube levemente</td>
                  <td>Reducción de IVA: beneficio parcial al consumidor</td>
                  <td>Sustitutivos cercanos (otras marcas, té)</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">📱</span> Smartphone gama alta</td>
                  <td>1,50</td>
                  <td>Elástica</td>
                  <td className={styles.tdNegativo}>IT baja</td>
                  <td>Aranceles encarecen sin recaudar mucho; consumo cae</td>
                  <td>Bien de lujo con muchos sustitutivos</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">✈️</span> Vuelo turístico</td>
                  <td>2,40</td>
                  <td>Muy elástica</td>
                  <td className={styles.tdNegativo}>IT cae mucho</td>
                  <td>Tasa aeroportuaria alta destruye demanda</td>
                  <td>Bien de lujo, muchos destinos alternativos</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Escenarios */}
          <h3>Escenarios reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🚬</span> Impuesto al tabaco</h4>
              <p>
                El tabaco tiene |Ed| ≈ 0,4. Una subida del 10% en el precio reduce el consumo solo
                un 4%, pero el ingreso fiscal sube. Políticamente útil para recaudar{' '}
                <em>y</em> desalentar el hábito sin eliminar la demanda de golpe.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🚗</span> Precio dinámico en plataformas de movilidad</h4>
              <p>
                Uber y similares usan el <em>surge pricing</em>: en hora punta, el precio sube y
                filtra a usuarios con baja disposición a pagar (demanda elástica). Maximiza el
                ingreso captando a quienes más valoran el servicio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">✈️</span> Diferenciación de precios en aerolíneas</h4>
              <p>
                Los viajeros de negocios son inelásticos (necesidad urgente) y los turistas son
                elásticos (pueden esperar o cambiar de fecha). Las aerolíneas discriminan por precio
                según la anticipación de la compra para extraer el máximo ingreso de cada segmento.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🛒</span> IVA reducido en alimentos básicos</h4>
              <p>
                Los alimentos básicos son inelásticos: reducir el IVA solo traslada una parte del
                ahorro al consumidor (los márgenes del comercio absorben el resto). El efecto en
                consumo es pequeño. La medida tiene más impacto redistributivo que de volumen.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <h3>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué factores determinan la elasticidad?</strong>
              <p>
                Los principales son: disponibilidad de sustitutivos (más sustitutivos = más
                elástico), necesidad vs lujo (los básicos son inelásticos), porcentaje del
                presupuesto (mayor porcentaje = más elástico) y el horizonte temporal (a largo
                plazo siempre es más elástico porque los consumidores tienen más opciones de
                adaptación).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el tabaco es inelástico pero el lujo es elástico?</strong>
              <p>
                El tabaco crea dependencia fisiológica y no tiene sustitutivos directos: el
                adicto paga lo que sea. El smartphone gama alta tiene multitud de sustitutivos
                (otras marcas, gamas, segunda mano, posponer la compra), por lo que el consumidor
                responde con fuerza ante una subida.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué relación hay entre elasticidad e ingreso total?</strong>
              <p>
                Si la demanda es inelástica (|Ed| &lt; 1), subir el precio aumenta el ingreso total
                porque la caída en cantidad es proporcionalmente menor. Si es elástica
                (|Ed| &gt; 1), subir el precio lo reduce porque la caída en cantidad supera el
                aumento en precio. Con elasticidad unitaria (|Ed| = 1), el ingreso total no varía.
              </p>
              <p className={styles.faqTip}>
                Regla nemotécnica: inelástica → precio y IT se mueven en el mismo sentido.
                Elástica → se mueven en sentido contrario.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo varía la elasticidad a lo largo de una curva lineal?</strong>
              <p>
                En una curva de demanda lineal (pendiente constante), la elasticidad no es
                constante: es mayor en los precios altos (parte superior) y menor en los precios
                bajos (parte inferior). Solo una curva con forma hiperbólica tiene elasticidad
                unitaria en todos sus puntos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la elasticidad cruzada?</strong>
              <p>
                Mide cómo cambia la demanda de un bien cuando sube el precio de otro. Si es
                positiva (bienes sustitutivos: café y té), subir el precio del café aumenta la
                demanda de té. Si es negativa (bienes complementarios: coches y gasolina), subir
                el precio de los coches reduce la demanda de gasolina.
              </p>
            </div>
          </div>

          {/* Pasos */}
          <h3>Cómo calcular la elasticidad — paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica los datos</strong>
                <p>
                  Necesitas dos puntos de la curva: (P₁, Q₁) y (P₂, Q₂). P es el precio y Q la
                  cantidad demandada en cada situación.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Calcula las variaciones porcentuales (método punto)</strong>
                <p>
                  %ΔQ = (Q₂ − Q₁) / Q₁ × 100 y %ΔP = (P₂ − P₁) / P₁ × 100. Luego
                  |Ed| = |%ΔQ / %ΔP|. Usa el punto de partida como base de cada variación.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Usa el método del arco para mayor precisión</strong>
                <p>
                  En lugar de usar Q₁ o Q₂ de base, usa el promedio: %ΔQ = (Q₂ − Q₁) /
                  [(Q₁ + Q₂)/2] × 100. Ídem para el precio. El resultado es el mismo en ambas
                  direcciones del cambio.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Clasifica el resultado</strong>
                <p>
                  |Ed| &lt; 1 → inelástica; |Ed| = 1 → unitaria; |Ed| &gt; 1 → elástica. Valores
                  extremos (0 o infinito) son teóricos y rara vez se observan en la realidad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Interpreta el efecto sobre el ingreso total</strong>
                <p>
                  IT = P × Q. Compara IT antes y después del cambio. Si |Ed| &lt; 1 y el precio
                  sube, el IT aumenta. Verifica con la regla: el efecto precio domina sobre el
                  efecto cantidad cuando la demanda es inelástica.
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <h3>Consejos para el examen</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧠</span>
              <div>
                <strong>Nemotecnia IT e inelasticidad</strong>
                <p>
                  &quot;IN-elastic → IN-come rises when price rises.&quot; Si la demanda es
                  inelástica, el ingreso sube al subir el precio. Lo contrario para elástica.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Pendiente ≠ elasticidad</strong>
                <p>
                  Una curva con pendiente empinada no es necesariamente inelástica. La
                  elasticidad depende también de los valores de P y Q en ese punto.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏱️</span>
              <div>
                <strong>El tiempo siempre aumenta la elasticidad</strong>
                <p>
                  A corto plazo los consumidores tienen pocas alternativas. A largo plazo
                  adaptan su comportamiento: compran coches más eficientes, buscan sustitutivos,
                  cambian hábitos.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Identifica el bien por sus características</strong>
                <p>
                  En el examen: ¿es básico sin sustitutivos? → inelástico. ¿Es lujo con muchas
                  opciones? → elástico. ¿Representa mucho del presupuesto? → más elástico.
                </p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <span>5 errores frecuentes en elasticidad</span>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Olvidar el signo negativo de Ed.</strong> La elasticidad-precio de la
                demanda es negativa por definición (cuando sube el precio, baja la cantidad). Se
                trabaja con el valor absoluto |Ed| para comparar. Escribir Ed = 0,5 y Ed = −0,5
                como si fueran lo mismo.
              </li>
              <li>
                <strong>Confundir &quot;elástico&quot; con &quot;pendiente pronunciada&quot;.</strong>{' '}
                Una curva casi vertical tiene pendiente grande en valor absoluto, pero puede ser
                elástica si los valores de P y Q son muy pequeños. La elasticidad y la pendiente
                no son lo mismo.
              </li>
              <li>
                <strong>Creer que elasticidad = pendiente de la curva.</strong> |Ed| = (ΔQ/ΔP) ×
                (P/Q). La pendiente es ΔP/ΔQ (la inversa de ΔQ/ΔP) y no incluye el factor
                P/Q. En una curva lineal la pendiente es constante pero la elasticidad varía en
                cada punto.
              </li>
              <li>
                <strong>Ignorar el horizonte temporal.</strong> La gasolina puede ser inelástica a
                corto plazo (|Ed| ≈ 0,3) pero mucho más elástica a largo (|Ed| ≈ 0,7−1,0) cuando
                los consumidores cambian de coche o de hábitos. Siempre especificar el plazo.
              </li>
              <li>
                <strong>Confundir elasticidad de demanda con elasticidad de oferta.</strong> Eo
                mide la respuesta de los productores (positiva: más precio → más cantidad
                ofertada). Ed mide la respuesta de los consumidores (negativa). Sus implicaciones
                sobre el IT son opuestas.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-elasticidad-precio')} />
        <ShareCard appName="simulador-elasticidad-precio" />
        <Footer appName="simulador-elasticidad-precio" />
    </div>
  );
}
