'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
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
import styles from './SimuladorCondensadores.module.css';
import {
  DIELECTRICOS,
  calcularCondensador,
  validarCondensador,
  introducirDielectrico,
  estadoRC,
  elegirPrefijo,
  type CampoCondensador,
  type EstadoCondensador,
  type ModoBateria,
  type ModoRC,
} from './motor';
import CasosAula from './CasosAula';

// ─── Presentación de cifras ──────────────────────────────────────────────────

/** Una magnitud con el prefijo del SI que la deja entre 1 y 999: «88,54 pF», «1,063 nC». */
function conPrefijo(valor: number, unidad: string, expMax: number = 6): string {
  const { factor, simbolo } = elegirPrefijo(valor, expMax);
  const escalado = valor / factor;
  const abs = Math.abs(escalado);
  const decimales = abs === 0 ? 0 : abs < 10 ? 3 : abs < 100 ? 2 : 1;
  return `${formatNumber(escalado, decimales)} ${simbolo}${unidad}`;
}

/** El campo en V/m, sin prefijo: es como lo pide el enunciado típico («12.000 V/m»). */
function textoCampo(campo: number): string {
  return `${formatNumber(campo, campo >= 100 || campo === 0 ? 0 : 2)} V/m`;
}

/** Un εr con los decimales que de verdad tiene (1,00059 del aire, 3,7 del papel, 80 del agua). */
function textoEr(er: number): string {
  const decimales = (String(er).split('.')[1] ?? '').length;
  return formatNumber(er, Math.min(decimales, 5));
}

/** Porcentaje con espacio duro antes del signo. */
function textoPorcentaje(fraccion: number, decimales: number = 1): string {
  return `${formatNumber(fraccion * 100, decimales)} %`;
}

const NOMBRE_CAMPO: Record<CampoCondensador, string> = {
  area: 'el área de las placas (mayor que 0)',
  separacion: 'la separación entre placas (mayor que 0)',
  tension: 'la tensión de la batería (0 o más)',
  er: 'la constante dieléctrica εr (mayor que 0)',
};

/** Cómo cambió una magnitud al introducir el dieléctrico, leído de las cifras del motor. */
function textoFactor(antes: number, despues: number): string {
  if (antes === 0 || !Number.isFinite(antes)) return '—';
  const r = despues / antes;
  if (Math.abs(r - 1) < 1e-9) return 'igual';
  return r > 1 ? `× ${formatNumber(r, 2)}` : `÷ ${formatNumber(1 / r, 2)}`;
}

// ─── Dibujo de las placas (SVG) ──────────────────────────────────────────────

const SVG_W = 360;
const SVG_H = 240;

interface PropsPlacas {
  areaCm2: number;
  separacionMm: number;
  er: number;
  tension: number;
  nombreDielectrico: string;
}

function DibujoPlacas({ areaCm2, separacionMm, er, tension, nombreDielectrico }: PropsPlacas) {
  // Placas vistas de canto. La anchura sigue al lado √A y la separación es PROPORCIONAL a d
  // (15 px por mm), con un mínimo de 6 px para que 0,1 mm siga viéndose como un hueco.
  const ancho = Math.min(Math.max(260 * Math.sqrt(areaCm2 / 1000), 40), 260);
  const hueco = Math.min(Math.max(separacionMm * 15, 6), 150);
  const grosor = 8;
  const cx = SVG_W / 2 - 20;
  const cy = SVG_H / 2;
  const izq = cx - ancho / 2;
  const ySup = cy - hueco / 2 - grosor; // borde superior de la placa +
  const yInfInterior = cy + hueco / 2; // cara interior de la placa −
  const cargado = tension > 0;

  const nLineas = Math.max(3, Math.round(ancho / 24));
  const xs = Array.from({ length: nLineas }, (_, i) => izq + ((i + 0.5) * ancho) / nLineas);
  const opacidadDielectrico = er > 1 ? 0.15 + 0.35 * Math.min(1, Math.log(er) / Math.log(80)) : 0;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className={styles.svgPlacas}
      role="img"
      aria-label={`Condensador de placas paralelas visto de canto: separación ${formatNumber(separacionMm, 2)} mm, ${nombreDielectrico} entre las placas, ${formatNumber(tension, 1)} V entre ellas.`}
    >
      <defs>
        <marker id="flecha-campo-condensador" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className={styles.svgFlecha} />
        </marker>
      </defs>

      {/* Dieléctrico entre las placas */}
      {opacidadDielectrico > 0 && (
        <rect
          x={izq}
          y={cy - hueco / 2}
          width={ancho}
          height={hueco}
          className={styles.svgDielectrico}
          style={{ fillOpacity: opacidadDielectrico }}
        />
      )}

      {/* Líneas de campo, de la placa + a la − */}
      {cargado &&
        xs.map((x) => (
          <line
            key={`campo-${x}`}
            x1={x}
            y1={cy - hueco / 2 + 1}
            x2={x}
            y2={yInfInterior - 2}
            className={styles.svgCampo}
            markerEnd={hueco >= 14 ? 'url(#flecha-campo-condensador)' : undefined}
          />
        ))}

      {/* Placas */}
      <rect x={izq} y={ySup} width={ancho} height={grosor} rx={2} className={styles.svgPlacaPositiva} />
      <rect x={izq} y={yInfInterior} width={ancho} height={grosor} rx={2} className={styles.svgPlacaNegativa} />

      {/* Signos de la carga */}
      {cargado &&
        xs.map((x) => (
          <g key={`signos-${x}`}>
            <text x={x} y={ySup - 5} className={styles.svgSignoPositivo} textAnchor="middle">+</text>
            <text x={x} y={yInfInterior + grosor + 16} className={styles.svgSignoNegativo} textAnchor="middle">−</text>
          </g>
        ))}

      {/* Cota de la separación */}
      <line x1={izq + ancho + 14} y1={cy - hueco / 2} x2={izq + ancho + 14} y2={cy + hueco / 2} className={styles.svgCota} />
      <text x={izq + ancho + 20} y={cy + 4} className={styles.svgTexto}>
        d = {formatNumber(separacionMm, separacionMm < 1 ? 2 : 1)} mm
      </text>

      <text x={SVG_W / 2} y={SVG_H - 6} className={styles.svgTexto} textAnchor="middle">
        {cargado ? `${nombreDielectrico} · εr = ${textoEr(er)}` : `${nombreDielectrico} · sin carga (V = 0)`}
      </text>
    </svg>
  );
}

// ─── Gráfica de carga y descarga (canvas) ────────────────────────────────────

/** Colores fijos: el lienzo se pinta claro en los dos temas, así que leen igual en ambos. */
const LIENZO = {
  fondo: '#f8fafc',
  rejilla: '#e2e8f0',
  eje: '#64748b',
  texto: '#334155', // 10,4:1 sobre el fondo
  curva: '#26718F', // --primary-boton: 5,2:1
  punto: '#c2410c', // 4,9:1
  referencia: '#94a3b8',
};

const TAUS = 5;

function dibujarCurvaRC(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  modo: ModoRC,
  tension: number | null,
  tTau: number,
) {
  ctx.fillStyle = LIENZO.fondo;
  ctx.fillRect(0, 0, W, H);
  ctx.font = '12px system-ui, sans-serif';

  if (tension === null) {
    ctx.fillStyle = LIENZO.texto;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Faltan datos para dibujar la curva', W / 2, H / 2);
    return;
  }

  const m = { izq: 58, der: 18, sup: 26, inf: 42 };
  const pw = W - m.izq - m.der;
  const ph = H - m.sup - m.inf;
  const yMax = tension > 0 ? tension : 1;
  const px = (tt: number) => m.izq + (tt / TAUS) * pw;
  const py = (v: number) => m.sup + (1 - v / yMax) * ph;
  const fraccion = (tt: number) => (modo === 'carga' ? 1 - Math.exp(-tt) : Math.exp(-tt));

  // Rejilla vertical y eje de tiempo en múltiplos de τ
  ctx.lineWidth = 1;
  ctx.textBaseline = 'top';
  for (let k = 0; k <= TAUS; k++) {
    const x = px(k);
    ctx.strokeStyle = LIENZO.rejilla;
    ctx.beginPath();
    ctx.moveTo(x, m.sup);
    ctx.lineTo(x, m.sup + ph);
    ctx.stroke();
    ctx.fillStyle = LIENZO.texto;
    ctx.textAlign = 'center';
    ctx.fillText(k === 0 ? '0' : k === 1 ? 'τ' : `${k}τ`, x, m.sup + ph + 6);
  }
  ctx.textAlign = 'center';
  ctx.fillText('tiempo t (en múltiplos de τ)', m.izq + pw / 2, m.sup + ph + 22);

  // Ejes
  ctx.strokeStyle = LIENZO.eje;
  ctx.beginPath();
  ctx.moveTo(m.izq, m.sup);
  ctx.lineTo(m.izq, m.sup + ph);
  ctx.lineTo(m.izq + pw, m.sup + ph);
  ctx.stroke();

  // Rótulos del eje de tensión
  ctx.fillStyle = LIENZO.texto;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${formatNumber(tension, tension >= 100 ? 0 : 1)} V`, m.izq - 6, py(yMax));
  ctx.fillText('0 V', m.izq - 6, py(0));
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('V_C', 6, 4);

  // Referencia del primer τ: 63,2 % al cargar, 36,8 % al descargar
  if (tension > 0) {
    const fRef = fraccion(1);
    ctx.strokeStyle = LIENZO.referencia;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(m.izq, py(fRef * tension));
    ctx.lineTo(m.izq + pw, py(fRef * tension));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = LIENZO.texto;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(textoPorcentaje(fRef), m.izq + pw - 2, py(fRef * tension) - 2);
  }

  // Curva V_C(t)
  ctx.strokeStyle = LIENZO.curva;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const muestras = 240;
  for (let i = 0; i <= muestras; i++) {
    const tt = (i / muestras) * TAUS;
    const x = px(tt);
    const y = py(tension * fraccion(tt));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Punto del instante elegido
  const vc = tension * fraccion(tTau);
  const xP = px(tTau);
  const yP = py(vc);
  ctx.strokeStyle = LIENZO.punto;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(xP, m.sup + ph);
  ctx.lineTo(xP, yP);
  ctx.lineTo(m.izq, yP);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = LIENZO.punto;
  ctx.beginPath();
  ctx.arc(xP, yP, 5, 0, Math.PI * 2);
  ctx.fill();

  const rotulo = `${formatNumber(vc, 2)} V`;
  ctx.textAlign = xP > m.izq + pw * 0.6 ? 'right' : 'left';
  ctx.textBaseline = yP < m.sup + 18 ? 'top' : 'bottom';
  ctx.fillText(rotulo, xP + (ctx.textAlign === 'right' ? -8 : 8), yP + (ctx.textBaseline === 'top' ? 6 : -6));
}

// ─── Componente principal ────────────────────────────────────────────────────

type FuenteCapacidad = 'parte1' | 'tecleada';

export default function SimuladorCondensadoresPage() {
  // Parte 1 — el condensador (entradas en las unidades del aula: cm², mm, V)
  const [areaTxt, setAreaTxt] = useState('100');
  const [separacionTxt, setSeparacionTxt] = useState('1');
  const [tensionTxt, setTensionTxt] = useState('12');
  const [dielectricoId, setDielectricoId] = useState('papel');
  const [otroErTxt, setOtroErTxt] = useState('4,5');
  const [modoBateria, setModoBateria] = useState<ModoBateria>('conectada');

  // Parte 2 — circuito RC
  const [fuenteC, setFuenteC] = useState<FuenteCapacidad>('parte1');
  const [capacidadTxt, setCapacidadTxt] = useState('1');
  const [resistenciaTxt, setResistenciaTxt] = useState('1000');
  const [modoRC, setModoRC] = useState<ModoRC>('carga');
  const [tTau, setTTau] = useState(1);

  // ── Parte 1 ──
  const areaCm2 = parseSpanishNumber(areaTxt);
  const separacionMm = parseSpanishNumber(separacionTxt);
  const tension = parseSpanishNumber(tensionTxt);
  const preset = DIELECTRICOS.find((d) => d.id === dielectricoId) ?? null;
  const er = preset ? preset.er : parseSpanishNumber(otroErTxt);
  const nombreDielectrico = preset ? preset.nombre : 'Material a medida';

  const datos = { area: areaCm2 / 1e4, separacion: separacionMm / 1e3, tension, er };
  const fallos = validarCondensador(datos);
  const resultado = calcularCondensador(datos);

  // ── Experimento del dieléctrico: el mismo condensador en vacío y a la misma V ──
  const enVacio = calcularCondensador({ ...datos, er: 1 });
  const conDielectrico = enVacio ? introducirDielectrico(enVacio, er, modoBateria) : null;
  const hayEfecto = Number.isFinite(er) && er !== 1;

  // ── Parte 2 ──
  const resistenciaKOhm = parseSpanishNumber(resistenciaTxt);
  const capacidadRC = fuenteC === 'parte1' ? (resultado?.capacidad ?? Number.NaN) : parseSpanishNumber(capacidadTxt) * 1e-6;
  const tensionRC = Number.isFinite(tension) && tension >= 0 ? tension : Number.NaN;
  const tauProvisional = resistenciaKOhm * 1e3 * capacidadRC;
  const rc =
    Number.isFinite(tauProvisional) && tauProvisional > 0
      ? estadoRC(modoRC, tensionRC, resistenciaKOhm * 1e3, capacidadRC, tTau * tauProvisional)
      : null;

  const faltasRC: string[] = [];
  if (!(resistenciaKOhm > 0)) faltasRC.push('la resistencia R (mayor que 0)');
  if (fuenteC === 'parte1' && resultado === null) faltasRC.push('los datos de la parte 1, de donde sale C');
  if (fuenteC === 'tecleada' && !(parseSpanishNumber(capacidadTxt) > 0)) faltasRC.push('la capacidad C (mayor que 0)');
  if (!(tension >= 0)) faltasRC.push('la tensión de la batería de la parte 1 (0 o más)');

  // ── Lienzo responsive ──
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const [anchoLienzo, setAnchoLienzo] = useState(600);
  const altoLienzo = Math.min(320, Math.max(220, Math.round(anchoLienzo * 0.5)));

  useEffect(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver((entradas) => {
      const ancho = Math.round(entradas[0].contentRect.width);
      if (ancho > 0) setAnchoLienzo(ancho);
    });
    observador.observe(lienzo);
    return () => observador.disconnect();
  }, []);

  const tensionDibujo = rc ? tensionRC : null;
  useEffect(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo) return;
    const ctx = lienzo.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    lienzo.width = Math.round(anchoLienzo * dpr);
    lienzo.height = Math.round(altoLienzo * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujarCurvaRC(ctx, anchoLienzo, altoLienzo, modoRC, tensionDibujo, tTau);
  }, [anchoLienzo, altoLienzo, modoRC, tensionDibujo, tTau]);

  const filasExperimento: { nombre: string; clave: keyof EstadoCondensador; texto: (v: number) => string }[] = [
    { nombre: 'Capacidad C', clave: 'capacidad', texto: (v) => conPrefijo(v, 'F') },
    { nombre: 'Tensión V', clave: 'tension', texto: (v) => conPrefijo(v, 'V', 0) },
    { nombre: 'Carga Q', clave: 'carga', texto: (v) => conPrefijo(v, 'C') },
    { nombre: 'Campo E', clave: 'campo', texto: textoCampo },
    { nombre: 'Energía U', clave: 'energia', texto: (v) => conPrefijo(v, 'J') },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">⚡</span> Simulador de Condensadores
        </h1>
        <p className={styles.subtitle}>
          Capacidad, carga, campo y energía de un condensador (capacitor) de placas paralelas, el efecto del
          dieléctrico y la carga y descarga de un circuito RC
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ══ PARTE 1 ══════════════════════════════════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-parte1">
          <h2 id="titulo-parte1" className={styles.panelTitulo}>1. El condensador de placas paralelas</h2>

          <div className={styles.parte1Grid}>
            <div className={styles.entradas}>
              <NumberInput
                label="Área de cada placa (cm²)"
                value={areaTxt}
                onChange={setAreaTxt}
                placeholder="100"
                helperText="De 1 a 1.000 cm². Se pasa a m² dividiendo entre 10.000."
              />
              <NumberInput
                label="Separación entre placas d (mm)"
                value={separacionTxt}
                onChange={setSeparacionTxt}
                placeholder="1"
                helperText="De 0,1 a 10 mm."
              />
              <NumberInput
                label="Tensión de la batería V (V)"
                value={tensionTxt}
                onChange={setTensionTxt}
                placeholder="12"
                helperText="De 0 a 1.000 V."
              />
            </div>

            <div className={styles.dibujoWrapper}>
              {resultado ? (
                <DibujoPlacas
                  areaCm2={areaCm2}
                  separacionMm={separacionMm}
                  er={er}
                  tension={tension}
                  nombreDielectrico={nombreDielectrico}
                />
              ) : (
                <p className={styles.dibujoVacio}>El dibujo aparece cuando los datos son válidos.</p>
              )}
            </div>
          </div>

          <fieldset className={styles.dielectricos}>
            <legend className={styles.legend}>Dieléctrico entre las placas</legend>
            <div className={styles.botonesFila}>
              {DIELECTRICOS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={styles.botonOpcion}
                  aria-pressed={dielectricoId === d.id}
                  onClick={() => setDielectricoId(d.id)}
                >
                  {d.nombre} <span className={styles.botonDato}>εr = {textoEr(d.er)}</span>
                </button>
              ))}
              <button
                type="button"
                className={styles.botonOpcion}
                aria-pressed={dielectricoId === 'otro'}
                onClick={() => setDielectricoId('otro')}
              >
                Otro εr
              </button>
            </div>
            {dielectricoId === 'otro' && (
              <div className={styles.otroEr}>
                <NumberInput
                  label="Constante dieléctrica εr"
                  value={otroErTxt}
                  onChange={setOtroErTxt}
                  placeholder="4,5"
                  helperText="Adimensional. Ningún aislante ordinario baja de 1, que es el vacío."
                />
              </div>
            )}
            <p className={styles.fuente}>
              Valores típicos a temperatura ambiente según Serway y Jewett, <cite>Física para ciencias e
              ingeniería</cite>, tabla 26.1. Son valores de muestra: cambian con la pureza, la humedad, la
              temperatura y la frecuencia.
            </p>
          </fieldset>

          <div className={styles.formulaBox}>
            <code>C = ε₀·εr·A/d</code> &nbsp;·&nbsp; <code>Q = C·V</code> &nbsp;·&nbsp; <code>E = V/d</code>{' '}
            &nbsp;·&nbsp; <code>U = ½·C·V²</code> &nbsp;·&nbsp; ε₀ = 8,8541878128·10⁻¹² F/m (CODATA 2018)
          </div>

          <div role="status" aria-live="polite">
            {resultado ? (
              <>
                <div className={styles.valuesGrid}>
                  <div className={styles.valueCard}>
                    <span className={styles.valueName}>Capacidad C</span>
                    <span className={styles.valueNum}>{conPrefijo(resultado.capacidad, 'F')}</span>
                  </div>
                  <div className={styles.valueCard}>
                    <span className={styles.valueName}>Carga Q = C·V</span>
                    <span className={styles.valueNum}>{conPrefijo(resultado.carga, 'C')}</span>
                  </div>
                  <div className={styles.valueCard}>
                    <span className={styles.valueName}>Campo E = V/d</span>
                    <span className={styles.valueNum}>{textoCampo(resultado.campo)}</span>
                  </div>
                  <div className={styles.valueCard}>
                    <span className={styles.valueName}>Energía U = ½·C·V²</span>
                    <span className={styles.valueNum}>{conPrefijo(resultado.energia, 'J')}</span>
                  </div>
                </div>
                {dielectricoId === 'otro' && er > 0 && er < 1 && (
                  <p className={styles.nota}>
                    <span aria-hidden="true">⚠️</span> Un εr menor que 1 no corresponde a ningún aislante ordinario:
                    el cálculo sale, pero el material no existe en un laboratorio escolar.
                  </p>
                )}
              </>
            ) : (
              <p className={styles.mensajeFalta}>
                Para calcular falta {fallos.map((f) => NOMBRE_CAMPO[f]).join(', ')}.
              </p>
            )}
          </div>
        </section>

        {/* ══ EXPERIMENTO: INTRODUCIR EL DIELÉCTRICO ═══════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-experimento">
          <h2 id="titulo-experimento" className={styles.panelTitulo}>
            Experimento: meter el dieléctrico en el condensador cargado
          </h2>
          <p className={styles.intro}>
            Se parte del mismo condensador en <strong>vacío</strong>, cargado a la tensión de la batería, y se llena
            el hueco con el dieléctrico elegido arriba. Lo que se conserva depende de una sola cosa: si la batería
            sigue conectada o se desconectó antes.
          </p>

          <div className={styles.botonesFila}>
            <button
              type="button"
              className={styles.botonOpcion}
              aria-pressed={modoBateria === 'conectada'}
              onClick={() => setModoBateria('conectada')}
            >
              Batería conectada (V fija)
            </button>
            <button
              type="button"
              className={styles.botonOpcion}
              aria-pressed={modoBateria === 'desconectada'}
              onClick={() => setModoBateria('desconectada')}
            >
              Batería desconectada (Q fija)
            </button>
          </div>

          {enVacio && conDielectrico && hayEfecto ? (
            <>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <caption className={styles.caption}>
                    Del vacío al dieléctrico elegido ({nombreDielectrico}, εr = {textoEr(er)}), batería {modoBateria}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Magnitud</th>
                      <th scope="col">En vacío</th>
                      <th scope="col">Con dieléctrico</th>
                      <th scope="col">Cambio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasExperimento.map((f) => (
                      <tr key={f.clave}>
                        <th scope="row">{f.nombre}</th>
                        <td>{f.texto(enVacio[f.clave])}</td>
                        <td>{f.texto(conDielectrico[f.clave])}</td>
                        <td className={styles.celdaFactor}>{textoFactor(enVacio[f.clave], conDielectrico[f.clave])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.explicacion} role="status" aria-live="polite">
                {modoBateria === 'conectada' ? (
                  <>
                    La batería mantiene V, así que entra carga desde ella hasta Q′ = εr·Q: la carga y la energía se
                    multiplican por εr y el campo no cambia, porque V y d son los mismos.
                  </>
                ) : (
                  <>
                    Sin batería la carga no tiene a dónde ir y Q se conserva. El dieléctrico se polariza y debilita el
                    campo: E y V se dividen por εr, y la energía también. La que falta es el trabajo con el que el
                    campo tira del dieléctrico hacia dentro.
                  </>
                )}
              </p>
            </>
          ) : (
            <p className={styles.mensajeFalta} role="status" aria-live="polite">
              {enVacio === null
                ? 'Completa los datos de la parte 1 para ver el experimento.'
                : !Number.isFinite(er) || er <= 0
                  ? 'Falta una constante dieléctrica εr mayor que 0.'
                  : 'Con vacío no cambia nada: elige arriba un dieléctrico distinto para ver el efecto.'}
            </p>
          )}
        </section>

        {/* ══ PARTE 2 ══════════════════════════════════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-parte2">
          <h2 id="titulo-parte2" className={styles.panelTitulo}>2. Carga y descarga en un circuito RC</h2>
          <p className={styles.intro}>
            La fuente es la batería de la parte 1 ({Number.isFinite(tension) ? `${formatNumber(tension, tension >= 100 ? 0 : 1)} V` : 'sin tensión válida'}).
            La capacidad puede ser la del condensador de arriba o una que teclees: las de placas de aula son de
            picofaradios y dan τ de microsegundos; para ver tiempos de segundos, teclea una C en µF.
          </p>

          <div className={styles.botonesFila}>
            <button
              type="button"
              className={styles.botonOpcion}
              aria-pressed={fuenteC === 'parte1'}
              onClick={() => setFuenteC('parte1')}
            >
              C de la parte 1{resultado ? ` (${conPrefijo(resultado.capacidad, 'F')})` : ''}
            </button>
            <button
              type="button"
              className={styles.botonOpcion}
              aria-pressed={fuenteC === 'tecleada'}
              onClick={() => setFuenteC('tecleada')}
            >
              Teclear C en µF
            </button>
          </div>

          <div className={styles.entradasRC}>
            <NumberInput
              label="Resistencia R (kΩ)"
              value={resistenciaTxt}
              onChange={setResistenciaTxt}
              placeholder="1000"
              helperText="De 1 kΩ a 10.000 kΩ (10 MΩ)."
            />
            {fuenteC === 'tecleada' && (
              <NumberInput
                label="Capacidad C (µF)"
                value={capacidadTxt}
                onChange={setCapacidadTxt}
                placeholder="1"
                helperText="Con R = 1.000 kΩ y C = 1 µF, τ = 1 s."
              />
            )}
          </div>

          <div className={styles.botonesFila}>
            <button
              type="button"
              className={styles.botonOpcion}
              aria-pressed={modoRC === 'carga'}
              onClick={() => setModoRC('carga')}
            >
              Carga
            </button>
            <button
              type="button"
              className={styles.botonOpcion}
              aria-pressed={modoRC === 'descarga'}
              onClick={() => setModoRC('descarga')}
            >
              Descarga
            </button>
          </div>

          <div className={styles.formulaBox}>
            <code>τ = R·C</code> &nbsp;·&nbsp;{' '}
            {modoRC === 'carga' ? <code>V_C = V·(1 − e^(−t/τ))</code> : <code>V_C = V·e^(−t/τ)</code>}{' '}
            &nbsp;·&nbsp; <code>I = (V/R)·e^(−t/τ)</code>
            {modoRC === 'carga'
              ? ' · parte descargado y se conecta a la batería'
              : ' · parte cargado a V y se cierra sobre R'}
          </div>

          <div className={styles.graficaWrapper}>
            <canvas
              ref={lienzoRef}
              className={styles.grafica}
              style={{ height: altoLienzo }}
              role="img"
              aria-label={
                rc
                  ? `Curva de ${modoRC} de la tensión del condensador entre 0 y 5τ; en t = ${formatNumber(tTau, 2)}τ vale ${formatNumber(rc.tensionCondensador, 2)} V.`
                  : 'Curva de carga o descarga RC: faltan datos para dibujarla.'
              }
            />
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="tiempo-rc">
              Instante t
              <span className={styles.sliderValue}>
                {formatNumber(tTau, 2)}τ{rc ? ` = ${conPrefijo(tTau * rc.tau, 's', 0)}` : ''}
              </span>
            </label>
            <input
              id="tiempo-rc"
              type="range"
              min={0}
              max={TAUS}
              step={0.05}
              value={tTau}
              className={styles.slider}
              onChange={(e) => setTTau(Number(e.target.value))}
              aria-valuetext={`${formatNumber(tTau, 2)} veces tau`}
            />
            <span className={styles.sliderHint}>De 0 a 5τ</span>
          </div>

          <div role="status" aria-live="polite">
            {rc ? (
              <div className={styles.valuesGrid}>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Constante de tiempo τ = R·C</span>
                  <span className={styles.valueNum}>{conPrefijo(rc.tau, 's', 0)}</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Tensión V_C(t)</span>
                  <span className={styles.valueNum}>{formatNumber(rc.tensionCondensador, 3)} V</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>
                    Corriente I(t){modoRC === 'descarga' ? ', en sentido contrario a la carga' : ''}
                  </span>
                  <span className={styles.valueNum}>{conPrefijo(rc.corriente, 'A')}</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>
                    {modoRC === 'carga' ? 'Carga acumulada' : 'Carga que queda'} (de la máxima)
                  </span>
                  <span className={styles.valueNum}>{textoPorcentaje(rc.fraccionCarga)}</span>
                </div>
                <div className={styles.valueCard}>
                  <span className={styles.valueName}>Corriente inicial V/R</span>
                  <span className={styles.valueNum}>{conPrefijo(rc.corrienteInicial, 'A')}</span>
                </div>
              </div>
            ) : (
              <p className={styles.mensajeFalta}>Para la parte 2 falta {faltasRC.join(', ')}.</p>
            )}
          </div>
        </section>

        {/* Tarea de aula (skill /casos-aula-meskeia): tras los controles y FUERA de
            EducationalSection, que nace colapsada. */}
        <CasosAula />

        {/* ══ SECCIÓN EDUCATIVA v2.0 ═══════════════════════════════════════ */}
        <EducationalSection
          title="Aprende sobre condensadores"
          subtitle="Capacidad, dieléctricos, energía y circuitos RC, con los errores típicos de examen"
          icon="⚡"
        >
          <p className={styles.eduTexto}>
            Un <strong>condensador</strong> (o <strong>capacitor</strong>, como se dice en buena parte de
            Latinoamérica) son dos conductores separados por un aislante. Al conectarlo a una batería, una placa se
            queda con carga +Q y la otra con −Q, y entre ellas aparece un campo eléctrico que guarda energía. Su
            capacidad (o capacitancia) dice cuánta carga admite por cada voltio: C = Q/V, en faradios (F).
          </p>

          {/* 1 · Tabla comparativa */}
          <h3 className={styles.eduSubtitle}>Dieléctricos comunes</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Material</th>
                  <th scope="col">Constante εr</th>
                  <th scope="col">Qué hace con C</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">Vacío</th><td>1 (por definición)</td><td>Es la referencia</td></tr>
                <tr><th scope="row">Aire seco</th><td>1,00059</td><td>Prácticamente igual que el vacío</td></tr>
                <tr><th scope="row">Teflón</th><td>2,1</td><td>× 2,1</td></tr>
                <tr><th scope="row">Papel</th><td>3,7</td><td>× 3,7</td></tr>
                <tr><th scope="row">Vidrio Pyrex</th><td>5,6</td><td>× 5,6</td></tr>
                <tr><th scope="row">Agua</th><td>80</td><td>× 80 en teoría; el agua real conduce y no sirve de aislante</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.fuente}>
            Fuente: Serway y Jewett, <cite>Física para ciencias e ingeniería</cite>, tabla 26.1 (valores aproximados
            a temperatura ambiente; varían con la pureza, la humedad y la temperatura).
          </p>

          <h3 className={styles.eduSubtitle}>Condensador frente a pila o batería</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Rasgo</th>
                  <th scope="col">Condensador</th>
                  <th scope="col">Pila o batería</th>
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">Dónde guarda la energía</th><td>En el campo eléctrico entre las placas</td><td>En reacciones químicas</td></tr>
                <tr><th scope="row">Tensión al gastarse</th><td>Cae en proporción a la carga (V = Q/C)</td><td>Casi constante hasta agotarse</td></tr>
                <tr><th scope="row">Velocidad de entrega</th><td>Muy rápida: se vacía de golpe</td><td>Lenta y sostenida</td></tr>
                <tr><th scope="row">Energía por kilo</th><td>Poca</td><td>Mucha</td></tr>
                <tr><th scope="row">Uso típico</th><td>Pulsos, filtros, temporizadores</td><td>Alimentar un aparato durante horas</td></tr>
              </tbody>
            </table>
          </div>

          {/* 2 · Casos de uso */}
          <h3 className={styles.eduSubtitle}>Dónde aparecen los condensadores</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📘</span>
              <h4>Estudiante de física</h4>
              <p>
                Los problemas de secundaria, preparatoria y del examen de admisión universitaria piden C, Q, E y U
                de un condensador plano y qué cambia al meter un dieléctrico. Aquí puedes comprobar cada cifra y ver
                por qué cambia.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📸</span>
              <h4>El flash de una cámara</h4>
              <p>
                La pila carga despacio un condensador a cientos de voltios y este lo suelta en milisegundos sobre la
                lámpara. Por ejemplo, 200 µF a 300 V guardan U = ½·C·V² = 9 J. Por eso se oye un pitido mientras
                «carga» el flash.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🫀</span>
              <h4>El desfibrilador, como física</h4>
              <p>
                Acumula en un condensador la energía de la descarga, del orden de cientos de julios. Para guardar
                200 J en 100 µF hacen falta V = √(2U/C) = 2.000 V. Es solo un ejemplo de cálculo: el uso de un
                desfibrilador lo indican los servicios de emergencia y el propio aparato.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">⏱️</span>
              <h4>Filtros y temporizadores RC</h4>
              <p>
                El retardo de una luz de escalera o el parpadeo de un LED salen de τ = R·C. Un filtro RC deja pasar
                las frecuencias por debajo de f = 1/(2π·R·C): con 1 kΩ y 100 nF, unos 1.592 Hz.
              </p>
            </div>
          </div>

          {/* 3 · FAQ */}
          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Condensador y capacitor son lo mismo?</strong>
              <p>
                Sí. «Condensador» es lo habitual en España y «capacitor» en muchos países de Latinoamérica y en
                inglés. Igual pasa con la magnitud: capacidad o capacitancia, siempre en faradios.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué un dieléctrico aumenta la capacidad?</strong>
              <p>
                Sus moléculas se orientan con el campo (se polarizan) y crean un campo propio en sentido contrario.
                El campo neto baja a E/εr, así que para la misma carga hace falta menos tensión, y C = Q/V sube en un
                factor εr.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Dónde está guardada la energía?</strong>
              <p>
                En el campo eléctrico entre las placas. Su densidad es u = ½·ε₀·εr·E² (J/m³); multiplicada por el
                volumen A·d da exactamente U = ½·C·V².
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cuánto tarda en cargarse del todo?</strong>
              <p>
                En teoría, nunca: V_C = V·(1 − e^(−t/τ)) solo se acerca a V. En un τ va por el 63,2&nbsp;%, en 3τ por
                el 95,0&nbsp;% y en 5τ por el 99,3&nbsp;%, que es cuando en la práctica se da por cargado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la corriente es máxima al principio?</strong>
              <p>
                Con el condensador vacío no hay tensión que se oponga a la batería: toda cae en R e I = V/R. A medida
                que se carga, V_C sube y la corriente decrece con el mismo e^(−t/τ).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>Con la batería conectada, ¿de dónde sale la energía extra?</strong>
              <p>
                De la batería, que empuja la carga adicional (εr − 1)·Q a la tensión V. Entrega el doble de lo que
                gana el condensador: la otra mitad es el trabajo con el que el campo mete el dieléctrico entre las
                placas.
              </p>
            </div>
          </div>

          {/* 4 · Guía paso a paso */}
          <h3 className={styles.eduSubtitle}>Cómo resolver un problema de condensadores, paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Pasa todo al SI</strong>
                <p>cm² a m² dividiendo entre 10.000; mm a m entre 1.000; µF a F por 10⁻⁶. Ejemplo: 100 cm² = 0,01 m² y 1 mm = 0,001 m.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula la capacidad</strong>
                <p>C = ε₀·εr·A/d. En vacío: 8,854·10⁻¹² · 0,01 / 0,001 = 8,854·10⁻¹¹ F = 88,54 pF.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Carga y campo</strong>
                <p>Q = C·V y E = V/d. A 12 V: Q = 1,063 nC y E = 12.000 V/m.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Energía</strong>
                <p>U = ½·C·V² = ½·Q·V = Q²/(2C). Las tres valen lo mismo: aquí, 6,375 nJ.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Si entra un dieléctrico, decide qué se conserva</strong>
                <p>¿Sigue la batería? Entonces V fija y Q, U × εr. ¿Se desconectó? Entonces Q fija y V, E, U ÷ εr.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <strong>En un RC, calcula τ y usa la exponencial</strong>
                <p>τ = R·C. Carga: V·(1 − e^(−t/τ)); descarga: V·e^(−t/τ). Con 1 MΩ y 1 µF, τ = 1 s y a t = 1 s la carga va por 7,59 V de 12.</p>
              </div>
            </div>
          </div>

          {/* 5 · Consejos */}
          <h3 className={styles.eduSubtitle}>Consejos para los ejercicios</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Comprueba el orden de magnitud</strong>
                <p>Un condensador de placas de aula da picofaradios. Si te sale 1 F, casi seguro olvidaste pasar cm² o mm a metros.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔌</span>
              <div>
                <strong>Subraya «conectado» o «aislado»</strong>
                <p>Es la palabra que decide todo el problema del dieléctrico. «Se desconecta y luego…» significa Q constante.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <div>
                <strong>Elige la fórmula de U según lo fijo</strong>
                <p>Con V fija conviene ½·C·V²; con Q fija, Q²/(2C). Así se ve de un vistazo si la energía sube o baja.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📈</span>
              <div>
                <strong>Lee τ en la gráfica</strong>
                <p>Busca dónde la curva de carga cruza el 63,2&nbsp;% (o la de descarga el 36,8&nbsp;%): ese instante es τ.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <div>
                <strong>Usa prefijos</strong>
                <p>1 pF = 10⁻¹² F, 1 nF = 10⁻⁹ F, 1 µF = 10⁻⁶ F. Escribir 88,54 pF evita errores con los exponentes.</p>
              </div>
            </div>
          </div>

          {/* 6 · Errores típicos */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores típicos con condensadores
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Olvidar pasar cm² a m²:</strong> 100 cm² son 0,01 m², no 100 ni 1. Dejarlo en cm² multiplica
                C por 10.000.
              </li>
              <li>
                <strong>Dejar la separación en mm:</strong> 1 mm son 0,001 m. Con d en mm, C sale 1.000 veces más
                pequeña y E 1.000 veces más pequeño.
              </li>
              <li>
                <strong>Confundir conectado con desconectado:</strong> con la batería conectada Q sube por εr; aislado,
                Q no cambia y lo que baja es V. Aplicar la regla contraria invierte el resultado.
              </li>
              <li>
                <strong>Creer que en τ ya está cargado:</strong> en un τ solo va por el 63,2&nbsp;%. Hacen falta unos 5τ
                para superar el 99&nbsp;%.
              </li>
              <li>
                <strong>Olvidar el ½ de la energía:</strong> U = ½·C·V², no C·V². Sin el ½ la energía sale el doble.
              </li>
              <li>
                <strong>Pensar que el dieléctrico siempre aumenta la energía:</strong> solo con la batería conectada.
                Aislado, la energía se divide por εr.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="simulador-condensadores" />
      </main>

      <Footer appName="simulador-condensadores" />
    </div>
  );
}
