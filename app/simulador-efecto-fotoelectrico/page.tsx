'use client';
// @disclaimer: exempt

import { useState, type CSSProperties } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  NumberInput,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import styles from './SimuladorEfectoFotoelectrico.module.css';
import {
  METALES,
  HC_EV_NM,
  VELOCIDAD_LUZ,
  VISIBLE_MIN_NM,
  VISIBLE_MAX_NM,
  calcularFotoelectrico,
  corrienteRelativa,
  frecuenciaUmbral,
  longitudUmbralNm,
  rectaEinstein,
  regionEspectro,
  type RegionEspectro,
} from './motor';
import { COLOR_UV, COLOR_IR, colorDeLambda, nombreDeLambda } from './color';
import CasosAula from './CasosAula';

// ─── Formato ─────────────────────────────────────────────────────────────────

/** Espacio duro antes del %: que el símbolo no salte solo de línea (RAE, 2010). */
const NBSP = ' ';

const SUPERINDICES: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

function aSuperindice(exponente: number): string {
  return String(exponente)
    .split('')
    .map((c) => SUPERINDICES[c] ?? c)
    .join('');
}

/**
 * Notación científica en formato español («7,495 × 10¹⁴»). `@/lib` no tiene un formateador
 * científico (solo `formatNumber`, que devuelve «≈0» por debajo de 10⁻⁴), así que se sigue el
 * mismo criterio que `simulador-campo-magnetico`: el exponente se fija DESPUÉS de redondear la
 * mantisa, para no escribir «10,00 × 10¹³» en lugar de «1,00 × 10¹⁴».
 */
function formatCientifico(valor: number, decimales = 3): string {
  if (!Number.isFinite(valor)) return '—';
  if (valor === 0) return '0';
  let exponente = Math.floor(Math.log10(Math.abs(valor)));
  const escala = Math.pow(10, decimales);
  if (Math.round((Math.abs(valor) / Math.pow(10, exponente)) * escala) / escala >= 10) {
    exponente += 1;
  }
  const mantisa = valor / Math.pow(10, exponente);
  return `${formatNumber(mantisa, decimales)} × 10${aSuperindice(exponente)}`;
}

const NOMBRE_REGION: Record<RegionEspectro, string> = {
  ultravioleta: 'Ultravioleta',
  visible: 'Visible',
  infrarrojo: 'Infrarrojo',
};

// ─── Rangos de los controles ─────────────────────────────────────────────────

const LAMBDA_MIN = 100;
const LAMBDA_MAX = 800;

/** Barra de color bajo el deslizador de λ: UV apagado, arcoíris en el visible, IR apagado. */
const GRADIENTE_ESPECTRO = (() => {
  const pos = (l: number) => `${(((l - LAMBDA_MIN) / (LAMBDA_MAX - LAMBDA_MIN)) * 100).toFixed(2)}%`;
  const paradas: string[] = [`${COLOR_UV} 0%`, `${COLOR_UV} ${pos(VISIBLE_MIN_NM)}`];
  for (let l = VISIBLE_MIN_NM; l <= VISIBLE_MAX_NM; l += 10) {
    paradas.push(`${colorDeLambda(l)} ${pos(l)}`);
  }
  paradas.push(`${COLOR_IR} ${pos(VISIBLE_MAX_NM)}`, `${COLOR_IR} 100%`);
  return `linear-gradient(to right, ${paradas.join(', ')})`;
})();

// ─── Dibujo de la placa ──────────────────────────────────────────────────────

const PLACA_W = 480;
const PLACA_H = 300;
/** Cara iluminada de la placa emisora y colector, en unidades del viewBox. */
const X_EMISOR = 84;
const X_COLECTOR = 410;
const MAX_ELECTRONES = 10;
/** Velocidad de un electrón con E_c = 1 eV: √(2·e/mₑ) = 5,931·10⁵ m/s. Escala de la animación. */
const V_REFERENCIA = 5.931e5;
/** Velocidad con E_c ≈ 10 eV (sodio a 100 nm): tope de la flecha v_máx. */
const V_ESCALA_FLECHA = 1.87e6;

// ─── Gráfica E_c–f ───────────────────────────────────────────────────────────

const GRAF_W = 520;
const GRAF_H = 300;
const MARGEN = { izq: 48, der: 16, sup: 16, inf: 52 };
/** Eje f hasta 3·10¹⁵ Hz: cubre λ = 100 nm (2,998·10¹⁵ Hz). */
const F_MAX = 3e15;

export default function SimuladorEfectoFotoelectricoPage() {
  const [lambda, setLambda] = useState(400);
  const [intensidad, setIntensidad] = useState(60);
  const [metalId, setMetalId] = useState<string>('sodio');
  const [phiOtro, setPhiOtro] = useState('3');

  const metal = METALES.find((m) => m.id === metalId);
  const phi = metal ? metal.phi : parseSpanishNumber(phiOtro);
  const nombreMetal = metal ? metal.nombre : 'Metal con φ a medida';

  const r = calcularFotoelectrico(lambda, phi);
  const corriente = corrienteRelativa(lambda, phi, intensidad);
  const colorLuz = colorDeLambda(lambda);
  const region = regionEspectro(lambda);

  // Justo en el umbral (E = φ con la precisión que se publica): el electrón se arranca sin
  // energía cinética, y el motor ya lo trata como sin emisión neta.
  const enUmbral = r !== null && !r.hayEmision && Math.abs(r.margenEV) < 0.0005;

  // ── Mensaje principal ──
  let mensaje: string;
  let mensajeTipo: 'ok' | 'aviso' | 'neutro';
  if (r === null) {
    mensaje = 'Escribe una función de trabajo mayor que 0 eV para calcular.';
    mensajeTipo = 'aviso';
  } else if (enUmbral) {
    mensaje =
      'Justo en el umbral: el fotón tiene exactamente la energía de la función de trabajo. El electrón se arranca sin energía cinética y no hay emisión neta.';
    mensajeTipo = 'aviso';
  } else if (!r.hayEmision) {
    mensaje = `La luz no supera la frecuencia umbral: no se emiten electrones aunque aumentes la intensidad. A cada fotón le faltan ${formatNumber(-r.margenEV, 3)} eV.`;
    mensajeTipo = 'aviso';
  } else if (intensidad === 0) {
    mensaje = 'Con intensidad 0 no llega ningún fotón: no sale ningún electrón. Sube la intensidad.';
    mensajeTipo = 'neutro';
  } else {
    mensaje = `Se emiten electrones: a cada fotón le sobran ${formatNumber(r.energiaCineticaEV, 3)} eV después de pagar la función de trabajo, y esa es la energía cinética máxima.`;
    mensajeTipo = 'ok';
  }

  // ── Electrones de la animación ──
  const hayElectrones = r !== null && r.hayEmision && intensidad > 0;
  const numElectrones = hayElectrones ? Math.max(1, Math.round((intensidad / 100) * MAX_ELECTRONES)) : 0;
  const duracion = hayElectrones && r ? Math.min(6, Math.max(0.5, 1.8 * (V_REFERENCIA / r.velocidadMax))) : 0;
  const electrones = Array.from({ length: numElectrones }, (_, i) => {
    const y = 90 + ((i * 7) % MAX_ELECTRONES) * 13;
    const dy = (((i * 5) % 7) - 3) * 9;
    // Posición fija en el dibujo estático (prefers-reduced-motion): repartidos por el camino.
    const p = (i + 0.5) / numElectrones;
    return { y, dy, p, retraso: -duracion * p };
  });
  const largoFlecha = hayElectrones && r ? Math.max(8, Math.min(140, (140 * r.velocidadMax) / V_ESCALA_FLECHA)) : 0;
  const opacidadHaz = intensidad > 0 ? 0.12 + (0.5 * intensidad) / 100 : 0;
  const numRayos = intensidad > 0 ? Math.max(1, Math.round((intensidad / 100) * 4)) : 0;

  // ── Gráfica ──
  const graf = (() => {
    if (r === null) return null;
    const anchoUtil = GRAF_W - MARGEN.izq - MARGEN.der;
    const altoUtil = GRAF_H - MARGEN.sup - MARGEN.inf;
    const yMin = -Math.ceil(phi);
    const yMax = Math.max(1, Math.ceil(rectaEinstein(F_MAX, phi)));
    const rango = yMax - yMin;
    const pasoY = rango > 16 ? 4 : rango > 8 ? 2 : 1;
    const sx = (f: number) => MARGEN.izq + (f / F_MAX) * anchoUtil;
    const sy = (e: number) => MARGEN.sup + ((yMax - e) / rango) * altoUtil;
    const marcasY: number[] = [];
    for (let v = Math.ceil(yMin / pasoY) * pasoY; v <= yMax; v += pasoY) marcasY.push(v);
    const marcasX = [0, 5, 10, 15, 20, 25, 30];
    const f0 = r.frecuenciaUmbral;
    const f0Visible = f0 <= F_MAX;
    const punto = {
      x: sx(r.frecuencia),
      y: sy(r.hayEmision ? r.energiaCineticaEV : 0),
    };
    // Franja del visible en el eje f: rojo (750 nm) a la izquierda, violeta (380 nm) a la derecha.
    const fRojo = VELOCIDAD_LUZ / (VISIBLE_MAX_NM * 1e-9);
    const fVioleta = VELOCIDAD_LUZ / (VISIBLE_MIN_NM * 1e-9);
    const paradasVisible: { offset: string; color: string }[] = [];
    for (let k = 0; k <= 10; k++) {
      const f = fRojo + ((fVioleta - fRojo) * k) / 10;
      const l = (VELOCIDAD_LUZ / f) * 1e9;
      paradasVisible.push({ offset: `${k * 10}%`, color: colorDeLambda(Math.min(VISIBLE_MAX_NM, Math.max(VISIBLE_MIN_NM, l))) });
    }
    return {
      anchoUtil, altoUtil, yMin, yMax, sx, sy, marcasY, marcasX, f0, f0Visible, punto,
      fRojo, fVioleta, paradasVisible,
    };
  })();

  const descripcionGrafica = r
    ? `Gráfica de la energía cinética máxima frente a la frecuencia para ${nombreMetal.toLowerCase()}: recta de pendiente h que corta el eje de frecuencias en f₀ = ${formatCientifico(r.frecuenciaUmbral, 3)} Hz. Punto actual: f = ${formatCientifico(r.frecuencia, 3)} Hz, ${r.hayEmision ? `E_c,máx = ${formatNumber(r.energiaCineticaEV, 3)} eV` : 'sin emisión'}.`
    : 'Gráfica sin datos: falta una función de trabajo válida.';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">💡</span> Simulador del Efecto Fotoeléctrico</h1>
        <p className={styles.subtitle}>
          Cambia el color de la luz, su intensidad y el metal: mira cuándo salen electrones y con qué energía, según la ecuación de Einstein E<sub>c,máx</sub> = h·f − φ
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ── Controles ──────────────────────────────────────────────── */}
        <section className={styles.panel} aria-labelledby="titulo-controles">
          <h2 id="titulo-controles" className={styles.panelTitulo}>La luz y el metal</h2>

          <div className={styles.slidersGrid}>
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="slider-lambda">
                Longitud de onda λ
                <span className={styles.sliderValue}>{formatNumber(lambda, 0)} nm</span>
              </label>
              <input
                id="slider-lambda"
                type="range"
                min={LAMBDA_MIN}
                max={LAMBDA_MAX}
                step={1}
                value={lambda}
                className={styles.slider}
                onChange={(e) => setLambda(Number(e.target.value))}
                aria-valuetext={`${formatNumber(lambda, 0)} nanómetros, ${nombreDeLambda(lambda)}`}
              />
              <div className={styles.barraEspectro} style={{ background: GRADIENTE_ESPECTRO }} aria-hidden="true">
                <span className={styles.marcaLambda} style={{ left: `${((lambda - LAMBDA_MIN) / (LAMBDA_MAX - LAMBDA_MIN)) * 100}%` }} />
              </div>
              <div className={styles.barraRotulos} aria-hidden="true">
                <span>100 nm · UV</span>
                <span>visible 380–750 nm</span>
                <span>IR · 800 nm</span>
              </div>
              <div className={styles.colorLuz}>
                <span
                  className={`${styles.muestraColor} ${region !== 'visible' ? styles.muestraInvisible : ''}`}
                  style={{ background: colorLuz }}
                  aria-hidden="true"
                />
                <span>
                  <strong>{NOMBRE_REGION[region]}</strong>
                  {region === 'visible' ? ` · ${nombreDeLambda(lambda)}` : ' · no la ve el ojo: el color es solo un rótulo'}
                </span>
              </div>
              <span className={styles.sliderHint}>
                f = c/λ = {r ? formatCientifico(r.frecuencia, 3) : formatCientifico(VELOCIDAD_LUZ / (lambda * 1e-9), 3)} Hz
              </span>
            </div>

            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel} htmlFor="slider-intensidad">
                Intensidad de la luz
                <span className={styles.sliderValue}>{formatNumber(intensidad, 0)}{NBSP}%</span>
              </label>
              <input
                id="slider-intensidad"
                type="range"
                min={0}
                max={100}
                step={5}
                value={intensidad}
                className={styles.slider}
                onChange={(e) => setIntensidad(Number(e.target.value))}
                aria-valuetext={`${formatNumber(intensidad, 0)} por ciento`}
              />
              <span className={styles.sliderHint}>
                Relativa (0–100{NBSP}%). Cambia cuántos fotones llegan por segundo, no la energía de cada uno.
              </span>
            </div>
          </div>

          <fieldset className={styles.metales}>
            <legend className={styles.metalesLeyenda}>Metal iluminado (función de trabajo φ)</legend>
            <div className={styles.metalesGrid}>
              {METALES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.metalBtn} ${metalId === m.id ? styles.metalBtnActivo : ''}`}
                  aria-pressed={metalId === m.id}
                  onClick={() => setMetalId(m.id)}
                >
                  <span className={styles.metalNombre}>{m.nombre} ({m.simbolo})</span>
                  <span className={styles.metalPhi}>φ = {formatNumber(m.phi, 2)} eV</span>
                </button>
              ))}
              <button
                type="button"
                className={`${styles.metalBtn} ${metalId === 'otro' ? styles.metalBtnActivo : ''}`}
                aria-pressed={metalId === 'otro'}
                onClick={() => setMetalId('otro')}
              >
                <span className={styles.metalNombre}>Otro φ</span>
                <span className={styles.metalPhi}>a medida</span>
              </button>
            </div>
            {metalId === 'otro' && (
              <div className={styles.phiOtro}>
                <NumberInput
                  label="Función de trabajo φ (eV)"
                  value={phiOtro}
                  onChange={setPhiOtro}
                  min={0.5}
                  max={12}
                  step={0.01}
                  placeholder="3"
                  helperText="Entre 0,5 y 12 eV. Los metales puros suelen estar entre 2 y 6,5 eV."
                />
              </div>
            )}
            <p className={styles.fuente}>
              Funciones de trabajo: R. A. Serway y J. W. Jewett, <em>Física para ciencias e ingeniería</em>, tabla 40.1
              («funciones de trabajo de metales seleccionados»). Son valores típicos: la función de trabajo real
              depende del estado de la superficie (limpieza, oxidación, cara del cristal), y otras tablas dan cifras
              que difieren unas décimas de eV.
            </p>
          </fieldset>
        </section>

        {/* ── Fórmulas ───────────────────────────────────────────────── */}
        <div className={styles.formulaBox}>
          <code>E = h·f = h·c/λ</code> &nbsp;·&nbsp;
          <code>E<sub>c,máx</sub> = h·f − φ</code> &nbsp;·&nbsp;
          <code>f₀ = φ/h</code> &nbsp;·&nbsp;
          <code>λ₀ = h·c/φ</code> &nbsp;·&nbsp;
          <code>V₀ = E<sub>c,máx</sub>/e</code> &nbsp;·&nbsp;
          <code>h·c = {formatNumber(HC_EV_NM, 2)} eV·nm</code>
        </div>

        {/* ── Dibujo + gráfica ───────────────────────────────────────── */}
        <div className={styles.simLayout}>
          <figure className={styles.figura}>
            <figcaption className={styles.figuraTitulo}>La placa iluminada</figcaption>
            <svg
              viewBox={`0 0 ${PLACA_W} ${PLACA_H}`}
              className={styles.svgPlaca}
              role="img"
              aria-label={
                hayElectrones && r
                  ? `Luz ${nombreDeLambda(lambda)} de ${formatNumber(lambda, 0)} nm sobre ${nombreMetal.toLowerCase()}: salen ${numElectrones} electrones en el dibujo, con velocidad máxima ${formatCientifico(r.velocidadMax, 3)} m/s.`
                  : `Luz de ${formatNumber(lambda, 0)} nm sobre ${nombreMetal.toLowerCase()}: no sale ningún electrón.`
              }
            >
              {/* Tubo de vacío */}
              <rect x={20} y={30} width={440} height={230} rx={40} className={styles.tubo} />
              {/* Haz de luz desde la lámpara hasta la cara del emisor */}
              <polygon
                points={`300,0 360,0 ${X_EMISOR},230 ${X_EMISOR},70`}
                fill={colorLuz}
                opacity={opacidadHaz}
              />
              {Array.from({ length: numRayos }, (_, i) => {
                const t = (i + 1) / (numRayos + 1);
                const xIni = 300 + 60 * t;
                const yFin = 70 + 160 * t;
                return (
                  <line
                    key={`rayo-${i}`}
                    x1={xIni}
                    y1={0}
                    x2={X_EMISOR + 2}
                    y2={yFin}
                    stroke={colorLuz}
                    strokeWidth={3}
                    className={styles.rayo}
                  />
                );
              })}
              {/* Lámpara */}
              <rect x={292} y={0} width={76} height={12} rx={4} className={styles.lampara} />
              {/* Emisor (el metal) y colector */}
              <rect x={X_EMISOR - 20} y={60} width={20} height={180} rx={3} className={styles.emisor} />
              <rect x={X_COLECTOR} y={60} width={14} height={180} rx={3} className={styles.colector} />
              <text x={X_EMISOR - 10} y={256} textAnchor="middle" className={styles.svgTexto}>
                {metal ? metal.simbolo : 'φ'}
              </text>
              <text x={X_COLECTOR + 7} y={256} textAnchor="middle" className={styles.svgTexto}>colector</text>

              {/* Electrones */}
              {electrones.map((el, i) => (
                <circle
                  key={`e-${i}`}
                  cx={X_EMISOR + 6}
                  cy={el.y}
                  r={5}
                  className={styles.electron}
                  style={
                    {
                      '--dx': `${X_COLECTOR - X_EMISOR - 14}px`,
                      '--dy': `${el.dy}px`,
                      '--p': el.p,
                      animationDuration: `${duracion}s`,
                      animationDelay: `${el.retraso}s`,
                    } as CSSProperties
                  }
                />
              ))}

              {/* Flecha de la velocidad máxima */}
              {hayElectrones && (
                <g className={styles.flecha}>
                  <line x1={X_EMISOR + 10} y1={48} x2={X_EMISOR + 10 + largoFlecha} y2={48} strokeWidth={2.5} />
                  <polygon
                    points={`${X_EMISOR + 10 + largoFlecha + 8},48 ${X_EMISOR + 10 + largoFlecha},43 ${X_EMISOR + 10 + largoFlecha},53`}
                  />
                  <text x={X_EMISOR + 10} y={42} className={styles.svgTexto}>v máx</text>
                </g>
              )}
              {!hayElectrones && r !== null && (
                <text x={250} y={150} textAnchor="middle" className={styles.svgAviso}>
                  {!r.hayEmision ? (enUmbral ? 'En el umbral: sin emisión neta' : 'Sin emisión: E fotón < φ') : 'Sin luz: no hay fotones'}
                </text>
              )}

              {/* Amperímetro */}
              <text x={240} y={290} textAnchor="middle" className={styles.svgTexto}>
                Corriente relativa: {corriente !== null ? `${formatNumber(corriente, 0)}${NBSP}%` : '—'}
              </text>
            </svg>
            <p className={styles.figuraNota}>
              Cada bolita es un electrón. Su número sigue a la intensidad; su rapidez, a la energía de cada fotón.
            </p>
          </figure>

          <figure className={styles.figura}>
            <figcaption className={styles.figuraTitulo}>
              Energía cinética máxima frente a frecuencia{metal ? ` · ${metal.nombre}` : ''}
            </figcaption>
            <svg
              viewBox={`0 0 ${GRAF_W} ${GRAF_H}`}
              className={styles.svgGrafica}
              role="img"
              aria-label={descripcionGrafica}
            >
              {graf && r && (
                <>
                  <defs>
                    <linearGradient id="franja-visible" x1="0" x2="1" y1="0" y2="0">
                      {graf.paradasVisible.map((p) => (
                        <stop key={p.offset} offset={p.offset} stopColor={p.color} />
                      ))}
                    </linearGradient>
                  </defs>
                  {/* Rejilla y marcas */}
                  {graf.marcasY.map((v) => (
                    <g key={`y-${v}`}>
                      <line
                        x1={MARGEN.izq}
                        x2={GRAF_W - MARGEN.der}
                        y1={graf.sy(v)}
                        y2={graf.sy(v)}
                        className={v === 0 ? styles.ejeCero : styles.rejilla}
                      />
                      <text x={MARGEN.izq - 6} y={graf.sy(v) + 4} textAnchor="end" className={styles.svgTextoPeq}>
                        {formatNumber(v, 0)}
                      </text>
                    </g>
                  ))}
                  {graf.marcasX.map((v) => (
                    <g key={`x-${v}`}>
                      <line
                        x1={graf.sx(v * 1e14)}
                        x2={graf.sx(v * 1e14)}
                        y1={MARGEN.sup}
                        y2={GRAF_H - MARGEN.inf}
                        className={styles.rejilla}
                      />
                      <text x={graf.sx(v * 1e14)} y={GRAF_H - MARGEN.inf + 16} textAnchor="middle" className={styles.svgTextoPeq}>
                        {formatNumber(v, 0)}
                      </text>
                    </g>
                  ))}
                  {/* Franja del visible sobre el eje f */}
                  <rect
                    x={graf.sx(graf.fRojo)}
                    y={GRAF_H - MARGEN.inf + 1}
                    width={graf.sx(graf.fVioleta) - graf.sx(graf.fRojo)}
                    height={4}
                    fill="url(#franja-visible)"
                  />
                  <rect
                    x={MARGEN.izq}
                    y={MARGEN.sup}
                    width={graf.anchoUtil}
                    height={graf.altoUtil}
                    className={styles.marcoGrafica}
                  />
                  <text x={MARGEN.izq + graf.anchoUtil / 2} y={GRAF_H - 12} textAnchor="middle" className={styles.svgTexto}>
                    f (× 10¹⁴ Hz)
                  </text>
                  <text
                    x={14}
                    y={MARGEN.sup + graf.altoUtil / 2}
                    textAnchor="middle"
                    transform={`rotate(-90 14 ${MARGEN.sup + graf.altoUtil / 2})`}
                    className={styles.svgTexto}
                  >
                    E_c,máx (eV)
                  </text>

                  {/* Recta de Einstein: discontinua por debajo de f₀ (prolongación hasta −φ),
                      continua por encima (electrones emitidos). */}
                  <line
                    x1={graf.sx(0)}
                    y1={graf.sy(-phi)}
                    x2={graf.sx(Math.min(graf.f0, F_MAX))}
                    y2={graf.sy(rectaEinstein(Math.min(graf.f0, F_MAX), phi))}
                    className={styles.rectaDiscontinua}
                  />
                  {graf.f0Visible && (
                    <line
                      x1={graf.sx(graf.f0)}
                      y1={graf.sy(0)}
                      x2={graf.sx(F_MAX)}
                      y2={graf.sy(rectaEinstein(F_MAX, phi))}
                      className={styles.recta}
                    />
                  )}
                  {/* Corte con los ejes */}
                  <text x={MARGEN.izq + 6} y={graf.sy(-phi) - 6} className={styles.svgTextoPeq}>
                    −φ = −{formatNumber(phi, 2)} eV
                  </text>
                  {graf.f0Visible && (
                    <>
                      <circle cx={graf.sx(graf.f0)} cy={graf.sy(0)} r={4} className={styles.puntoUmbral} />
                      <text x={graf.sx(graf.f0) + 6} y={graf.sy(0) + 16} className={styles.svgTextoPeq}>
                        f₀
                      </text>
                    </>
                  )}
                  {/* Punto actual */}
                  <circle
                    cx={graf.punto.x}
                    cy={graf.punto.y}
                    r={7}
                    className={r.hayEmision ? styles.puntoActual : styles.puntoSinEmision}
                  />
                  <text
                    x={graf.punto.x > GRAF_W - 160 ? graf.punto.x - 10 : graf.punto.x + 10}
                    y={graf.punto.y - 10}
                    textAnchor={graf.punto.x > GRAF_W - 160 ? 'end' : 'start'}
                    className={styles.svgTextoPunto}
                  >
                    {r.hayEmision ? `${formatNumber(r.energiaCineticaEV, 2)} eV` : 'sin emisión'}
                  </text>
                </>
              )}
            </svg>
            <p className={styles.figuraNota}>
              Pendiente: h = 4,136 × 10⁻¹⁵ eV·s, la misma para todos los metales. Cambiar de metal solo desplaza la recta.
              La franja de color del eje marca el visible.
            </p>
          </figure>
        </div>

        {/* ── Resultados ─────────────────────────────────────────────── */}
        <section className={styles.resultados} aria-labelledby="titulo-resultados">
          <h2 id="titulo-resultados" className={styles.panelTitulo}>Resultados</h2>
          <div role="status" aria-live="polite">
            <p
              className={`${styles.mensaje} ${
                mensajeTipo === 'ok' ? styles.mensajeOk : mensajeTipo === 'aviso' ? styles.mensajeAviso : styles.mensajeNeutro
              }`}
            >
              {mensaje}
            </p>
            {r && (
              <div className={styles.valuesGrid}>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Energía del fotón E = h·c/λ</span>
                  <span className={styles.valueNum}>{formatNumber(r.energiaFotonEV, 3)} eV</span>
                  <span className={styles.valueSub}>{formatCientifico(r.energiaFotonJ, 3)} J</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Frecuencia f = c/λ</span>
                  <span className={styles.valueNum}>{formatCientifico(r.frecuencia, 3)} Hz</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Función de trabajo φ</span>
                  <span className={styles.valueNum}>{formatNumber(r.phiEV, 2)} eV</span>
                  <span className={styles.valueSub}>{nombreMetal}</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Frecuencia umbral f₀ = φ/h</span>
                  <span className={styles.valueNum}>{formatCientifico(r.frecuenciaUmbral, 3)} Hz</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Longitud de onda umbral λ₀ = h·c/φ</span>
                  <span className={styles.valueNum}>{formatNumber(r.longitudUmbralNm, 1)} nm</span>
                  <span className={styles.valueSub}>{NOMBRE_REGION[regionEspectro(r.longitudUmbralNm)]}</span>
                </div>
                <div className={`${styles.valueCard} ${r.hayEmision ? styles.valueCardDestacada : ''}`}>
                  <span className={styles.valueName}>Energía cinética máxima E<sub>c,máx</sub></span>
                  <span className={styles.valueNum}>
                    {r.hayEmision ? `${formatNumber(r.energiaCineticaEV, 3)} eV` : 'sin emisión'}
                  </span>
                  {r.hayEmision && <span className={styles.valueSub}>{formatCientifico(r.energiaCineticaJ, 3)} J</span>}
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Velocidad máxima v = √(2·E<sub>c</sub>/mₑ)</span>
                  <span className={styles.valueNum}>
                    {r.hayEmision ? `${formatCientifico(r.velocidadMax, 3)} m/s` : 'sin emisión'}
                  </span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Potencial de frenado V₀</span>
                  <span className={styles.valueNum}>
                    {r.hayEmision ? `${formatNumber(r.potencialFrenado, 3)} V` : '0 V (no hay electrones que frenar)'}
                  </span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Corriente relativa</span>
                  <span className={styles.valueNum}>
                    {corriente !== null ? `${formatNumber(corriente, 0)}${NBSP}%` : '—'}
                  </span>
                  <span className={styles.valueSub}>Proporcional a la intensidad, solo si hay emisión</span>
                </div>
              </div>
            )}
          </div>
          <p className={styles.fuente}>
            Constantes CODATA 2018: h = 6,62607015 × 10⁻³⁴ J·s, e = 1,602176634 × 10⁻¹⁹ C y
            c = 299.792.458 m/s (exactas) · mₑ = 9,1093837015 × 10⁻³¹ kg. Velocidad calculada sin
            relatividad: con energías de unos pocos eV frente a los 511 keV del electrón en reposo, la
            corrección no se ve en ninguna cifra.
          </p>
        </section>

        {/* Tarea de aula (skill /casos-aula-meskeia): tras los controles y FUERA de
            EducationalSection, que nace colapsada. */}
        <CasosAula />

        {/* ── Sección educativa v2.0 ─────────────────────────────────── */}
        <EducationalSection
          title="Aprende sobre el efecto fotoeléctrico"
          subtitle="La luz que arranca electrones y el experimento que abrió la física cuántica"
          icon="💡"
        >
          <p className={styles.eduIntro}>
            Cuando la luz ilumina un metal puede arrancarle electrones. La física clásica predecía que una
            luz más intensa daría electrones más energéticos y que cualquier color, con paciencia, acabaría
            arrancándolos. Los experimentos decían otra cosa: hay una <strong>frecuencia umbral</strong> por
            debajo de la cual no sale nada, y la energía de los electrones depende del color, no de la
            intensidad. En 1905 Einstein lo explicó proponiendo que la luz llega en paquetes —fotones— de
            energía <em>E = h·f</em>, y que cada fotón entrega toda su energía a un solo electrón.
          </p>

          {/* Tabla comparativa */}
          <h3 className={styles.eduSubtitle}>Metales de referencia: φ, umbral y región del espectro</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Metal</th>
                  <th scope="col">φ (eV)</th>
                  <th scope="col">λ₀ (nm)</th>
                  <th scope="col">f₀ (× 10¹⁴ Hz)</th>
                  <th scope="col">Región de λ₀</th>
                  <th scope="col">¿Emite con luz visible?</th>
                </tr>
              </thead>
              <tbody>
                {METALES.map((m) => {
                  const l0 = longitudUmbralNm(m.phi) ?? 0;
                  const f0 = frecuenciaUmbral(m.phi) ?? 0;
                  return (
                    <tr key={m.id}>
                      <td>{m.nombre} ({m.simbolo})</td>
                      <td>{formatNumber(m.phi, 2)}</td>
                      <td>{formatNumber(l0, 1)}</td>
                      <td>{formatNumber(f0 / 1e14, 2)}</td>
                      <td>{NOMBRE_REGION[regionEspectro(l0)]}</td>
                      <td>
                        {l0 >= VISIBLE_MIN_NM
                          ? `Sí, por debajo de ${formatNumber(l0, 0)} nm`
                          : 'No: necesita ultravioleta'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={styles.eduNota}>
            Fuente de φ: Serway y Jewett, <em>Física para ciencias e ingeniería</em>, tabla 40.1. λ₀ y f₀
            calculados con las constantes CODATA 2018. Los valores de φ dependen del estado de la superficie
            y varían unas décimas de eV entre tablas.
          </p>

          {/* Casos de uso */}
          <h3 className={styles.eduSubtitle}>Dónde aparece</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎓</span>
              <h4>Último curso de secundaria o preparatoria</h4>
              <p>
                Es un tema fijo de física moderna. El problema típico da λ y φ y pide E del fotón, E<sub>c,máx</sub>,
                v y V₀. Con el simulador puedes comprobar cada paso y, sobre todo, ver por qué la intensidad no
                aparece en ninguna de esas fórmulas.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🔦</span>
              <h4>Fototubos, fotomultiplicadores y sensores</h4>
              <p>
                Un fototubo es lo que dibuja la app: un cátodo iluminado y un colector en vacío. Los
                fotomultiplicadores amplifican cada fotoelectrón hasta millones de veces y detectan luz muy débil
                en astronomía, física de partículas o medicina nuclear. Muchos sensores de luz modernos usan, en
                cambio, fotodiodos de semiconductor.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">☀️</span>
              <h4>Paneles solares: un fenómeno relacionado, pero distinto</h4>
              <p>
                Una célula solar funciona por <strong>efecto fotovoltaico</strong>: el fotón no arranca el electrón
                del material, sino que lo sube de la banda de valencia a la de conducción de un semiconductor, y la
                unión p-n lo separa y crea una tensión. Comparte la idea de umbral: el silicio necesita fotones de
                más de ~1,1 eV (λ por debajo de ~1.100 nm).
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏅</span>
              <h4>El Nobel de Einstein</h4>
              <p>
                Einstein no recibió el Nobel por la relatividad, sino «por sus servicios a la física teórica, y
                especialmente por su descubrimiento de la ley del efecto fotoeléctrico». Es el premio de 1921,
                entregado en 1922. Las medidas de Millikan (1914-1916) confirmaron la recta E<sub>c</sub>–f y dieron
                un valor de h coherente con el de Planck.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué más intensidad no da electrones más rápidos?</strong>
              <p>
                Porque la intensidad es el número de fotones por segundo, y cada electrón recibe la energía de un solo
                fotón, h·f. Doblar la intensidad dobla los electrones (la corriente), pero cada uno sale con la misma
                E<sub>c,máx</sub>. Pruébalo: con el sodio a 400 nm, mueve la intensidad y mira que la tarjeta de energía
                no cambia.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre función de trabajo y trabajo de extracción?</strong>
              <p>
                Ninguna: son dos nombres de lo mismo, la energía mínima para sacar un electrón de la superficie del
                metal. Se escribe φ, W₀ o W<sub>ext</sub> según el libro, y suele darse en eV.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué se habla de energía cinética «máxima»?</strong>
              <p>
                Porque h·f − φ es lo que le queda al electrón más fácil de arrancar, el de la superficie. Los que
                estaban más adentro pierden energía por el camino y salen más lentos. El potencial de frenado detiene
                justo a los más rápidos, por eso mide la máxima.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el potencial de frenado coincide con E<sub>c,máx</sub> en eV?</strong>
              <p>
                Por la definición del electronvoltio: 1 eV es la energía que gana una carga e al atravesar 1 V. Si
                e·V₀ = E<sub>c,máx</sub>, una energía de 0,64 eV se frena con 0,64 V. En julios habría que dividir
                entre e = 1,602 × 10⁻¹⁹ C para llegar al mismo número.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Hay emisión justo en la frecuencia umbral?</strong>
              <p>
                En f = f₀ el fotón tiene exactamente la energía φ: el electrón llega a la superficie con energía
                cinética cero y no se aleja. En la práctica no hay corriente, y la app lo trata como sin emisión neta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Sirve para cualquier luz, también rayos X?</strong>
              <p>
                La ecuación sí, pero con fotones muy energéticos aparecen otros procesos (arrancar electrones de capas
                internas, efecto Compton) y, por encima de unos keV, hay que usar la mecánica relativista para la
                velocidad. Este simulador llega hasta 100 nm (12,4 eV), donde el cálculo clásico basta.
              </p>
            </div>
          </div>

          {/* Paso a paso */}
          <h3 className={styles.eduSubtitle}>Cómo resolver un problema típico, paso a paso</h3>
          <p className={styles.eduIntro}>
            Enunciado: se ilumina zinc (φ = 4,31 eV) con luz ultravioleta de 250 nm. Calcula la energía de los
            fotones, la energía cinética máxima, la velocidad máxima de los electrones, el potencial de frenado y
            la longitud de onda umbral.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Pasa λ a metros y calcula la energía del fotón</strong>
                <p>
                  λ = 250 nm = 2,50 × 10⁻⁷ m. E = h·c/λ = 6,626 × 10⁻³⁴ · 2,998 × 10⁸ / 2,50 × 10⁻⁷
                  = 7,95 × 10⁻¹⁹ J. En eV: 7,95 × 10⁻¹⁹ / 1,602 × 10⁻¹⁹ = 4,96 eV (o, directo, 1.239,84 / 250).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Compara con la función de trabajo</strong>
                <p>
                  4,96 eV &gt; 4,31 eV: hay emisión. Si saliera menor, la respuesta sería «no se emiten electrones» y
                  el problema terminaría aquí, dijera lo que dijera de la intensidad.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Energía cinética máxima y potencial de frenado</strong>
                <p>
                  E<sub>c,máx</sub> = 4,96 − 4,31 = 0,65 eV = 1,04 × 10⁻¹⁹ J. V₀ = E<sub>c,máx</sub>/e = 0,65 V.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Velocidad máxima, en julios y kilogramos</strong>
                <p>
                  v = √(2 · 1,04 × 10⁻¹⁹ / 9,109 × 10⁻³¹) ≈ 4,78 × 10⁵ m/s. La energía tiene que ir en J, no en eV.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Umbral</strong>
                <p>
                  λ₀ = h·c/φ = 1.239,84 / 4,31 ≈ 287,7 nm y f₀ = φ/h ≈ 1,04 × 10¹⁵ Hz. Cualquier luz de λ mayor
                  (incluida toda la visible) no arranca electrones del zinc. Compruébalo eligiendo zinc y 250 nm.
                </p>
              </div>
            </div>
          </div>

          {/* Consejos */}
          <h3 className={styles.eduSubtitle}>Consejos para el examen</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <div>
                <strong>Memoriza h·c ≈ 1.240 eV·nm</strong>
                <p>Con λ en nm da E en eV en una sola división, sin potencias de diez. Úsalo para comprobar el resultado en julios.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚦</span>
              <div>
                <strong>Compara antes de restar</strong>
                <p>Si E del fotón es menor que φ, no hay emisión: una E<sub>c</sub> negativa es la señal de que te saltaste este paso.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📈</span>
              <div>
                <strong>Lee la gráfica E<sub>c</sub>–f</strong>
                <p>La pendiente es h, el corte con el eje f es f₀ y la prolongación corta el eje E<sub>c</sub> en −φ. Dos puntos bastan para sacar h y φ.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <div>
                <strong>V₀ en voltios = E<sub>c,máx</sub> en eV</strong>
                <p>Si te dan el potencial de frenado, ya tienes la energía cinética máxima en eV sin hacer cuentas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <div>
                <strong>Mayor λ, menor energía</strong>
                <p>E y λ son inversamente proporcionales: el rojo es el que menos energía lleva del visible, y el ultravioleta más que todo el visible.</p>
              </div>
            </div>
          </div>

          {/* Errores típicos */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores típicos con el efecto fotoeléctrico
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Creer que más intensidad da más energía:</strong> la intensidad solo cambia el número de
                electrones. Con luz por debajo del umbral, ni la luz más intensa arranca uno solo.
              </li>
              <li>
                <strong>Mezclar eV y J:</strong> restar φ en eV de una E del fotón en J da un disparate. Pasa todo a la
                misma unidad: 1 eV = 1,602 × 10⁻¹⁹ J.
              </li>
              <li>
                <strong>Olvidar pasar los nm a m:</strong> con λ = 400 en lugar de 4 × 10⁻⁷ m, la energía sale 10⁹
                veces más pequeña. Usa 1 nm = 10⁻⁹ m o la fórmula directa con 1.240 eV·nm.
              </li>
              <li>
                <strong>Usar la energía en eV para la velocidad:</strong> en v = √(2·E<sub>c</sub>/mₑ) la energía tiene
                que ir en julios y la masa en kilogramos para que v salga en m/s.
              </li>
              <li>
                <strong>Dar una E<sub>c</sub> negativa:</strong> si h·f &lt; φ la respuesta no es una energía negativa,
                sino que no hay emisión. La parte negativa de la recta de la gráfica es solo su prolongación.
              </li>
              <li>
                <strong>Confundir frecuencia umbral y longitud de onda umbral:</strong> hay emisión si f &gt; f₀, que es
                lo mismo que λ &lt; λ₀. Las desigualdades van al revés.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="simulador-efecto-fotoelectrico" />
      </main>

      <Footer appName="simulador-efecto-fotoelectrico" />
    </div>
  );
}
