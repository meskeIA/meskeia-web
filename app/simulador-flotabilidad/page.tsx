'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
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
import styles from './SimuladorFlotabilidad.module.css';
import {
  calcularFlotabilidad,
  esPositivo,
  G,
  CM3_POR_M3,
  type Veredicto,
  type ResultadoFlotabilidad,
} from './motor';
import { MATERIALES, LIQUIDOS } from './materiales';
import CasosAula from './CasosAula';

// ─── Sustancias de referencia ────────────────────────────────────────────────
// Las listas MATERIALES y LIQUIDOS viven en ./materiales.ts: las leen también los «Casos
// para clase», que sacan de ahí la densidad de cada sustancia que nombran.

const ID_OTRA = 'otra';

const COLOR_OTRA = '#7FB3D3';

const VOLUMEN_MIN = 1;
const VOLUMEN_MAX = 10000;
/** El deslizador del volumen es logarítmico: 0 → 1 cm³, 1000 → 10.000 cm³ (250 pasos por década). */
const PASOS_POR_DECADA = 250;

// ─── Formato ─────────────────────────────────────────────────────────────────

/**
 * Cifras significativas en formato español. `formatNumber` trabaja con decimales fijos y
 * devuelve «≈0» por debajo de 0,0001, y aquí hay magnitudes legítimas de ese orden: 1 cm³
 * son 0,000001 m³, y el peso de 1 cm³ de corcho es 0,002354 N.
 */
function formatoSignificativo(valor: number, cifras = 4): string {
  return new Intl.NumberFormat('es-ES', { maximumSignificantDigits: cifras }).format(valor);
}

function textoFuerza(newtons: number): string {
  return `${formatoSignificativo(newtons)} N`;
}

function textoPorcentaje(fraccion: number): string {
  return `${formatNumber(fraccion * 100, 1)} %`;
}

/** El valor que escribe el deslizador en la caja del volumen. */
function volumenDesdeDeslizador(posicion: number): number {
  const v = Math.pow(10, posicion / PASOS_POR_DECADA);
  if (v < 10) return Math.round(v * 10) / 10;
  if (v < 1000) return Math.round(v);
  return Math.round(v / 10) * 10;
}

function posicionDesdeVolumen(volumen: number): number {
  if (!esPositivo(volumen)) return 0;
  return Math.min(1000, Math.max(0, Math.round(PASOS_POR_DECADA * Math.log10(volumen))));
}

const NOMBRE_VEREDICTO: Record<Veredicto, string> = {
  flota: 'Flota',
  'se-hunde': 'Se hunde',
  indiferente: 'Equilibrio indiferente',
};

// ─── Dibujo ──────────────────────────────────────────────────────────────────

const VB_W = 420;
const VB_H = 440;
const RECIPIENTE_IZQ = 90;
const RECIPIENTE_DER = 330;
const RECIPIENTE_ARRIBA = 70;
const FONDO = 350;
const SUPERFICIE = 140;
const CENTRO_X = (RECIPIENTE_IZQ + RECIPIENTE_DER) / 2;
/** Longitud de la flecha de la fuerza mayor; la otra va a escala con ella. */
const FLECHA_MAX = 72;

/** Lado del bloque en px: crece con la raíz cúbica del volumen (es un cubo), de 39 a 100 px. */
function ladoBloque(volumenCm3: number): number {
  const v = Math.min(Math.max(volumenCm3, VOLUMEN_MIN), VOLUMEN_MAX);
  return 36 + 64 * (Math.cbrt(v) / Math.cbrt(VOLUMEN_MAX));
}

interface FlechaProps {
  x: number;
  desde: number;
  hasta: number;
  clase: string;
}

/** Flecha vertical de `desde` a `hasta` (y del SVG). Sin longitud, no se dibuja. */
function Flecha({ x, desde, hasta, clase }: FlechaProps) {
  const longitud = hasta - desde;
  if (Math.abs(longitud) < 1) return null;
  const sentido = longitud > 0 ? 1 : -1;
  const punta = Math.min(9, Math.abs(longitud));
  const baseCuerpo = hasta - sentido * punta;
  return (
    <g className={clase}>
      <line x1={x} y1={desde} x2={x} y2={baseCuerpo} strokeWidth={3} />
      <polygon points={`${x},${hasta} ${x - 6},${baseCuerpo} ${x + 6},${baseCuerpo}`} />
    </g>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SimuladorFlotabilidadPage() {
  const [materialId, setMaterialId] = useState('pino');
  const [densidadOtroCuerpo, setDensidadOtroCuerpo] = useState('');
  const [volumenTexto, setVolumenTexto] = useState('1000');
  const [liquidoId, setLiquidoId] = useState('agua');
  const [densidadOtroLiquido, setDensidadOtroLiquido] = useState('');

  const material = MATERIALES.find((m) => m.id === materialId) ?? null;
  const liquido = LIQUIDOS.find((l) => l.id === liquidoId) ?? null;

  const densidadCuerpo = material ? material.densidad : parseSpanishNumber(densidadOtroCuerpo);
  const densidadLiquido = liquido ? liquido.densidad : parseSpanishNumber(densidadOtroLiquido);
  const volumen = parseSpanishNumber(volumenTexto);

  const nombreCuerpo = material ? material.nombre.toLowerCase() : 'densidad personalizada';
  const nombreLiquido = liquido ? liquido.nombre.toLowerCase() : 'un líquido de densidad personalizada';
  const colorCuerpo = material ? material.color : COLOR_OTRA;
  const colorLiquido = liquido ? liquido.color : COLOR_OTRA;

  const resultado: ResultadoFlotabilidad | null = useMemo(
    () => calcularFlotabilidad(densidadCuerpo, volumen, densidadLiquido),
    [densidadCuerpo, volumen, densidadLiquido],
  );

  // Qué falta, campo a campo, cuando el motor no puede calcular
  const faltas: string[] = [];
  if (!esPositivo(densidadCuerpo)) faltas.push('la densidad del cuerpo (en kg/m³, mayor que 0)');
  if (!esPositivo(volumen)) faltas.push('el volumen del cuerpo (en cm³, mayor que 0)');
  if (!esPositivo(densidadLiquido)) faltas.push('la densidad del líquido (en kg/m³, mayor que 0)');

  // ── Geometría del dibujo ────────────────────────────────────────────────────
  const lado = ladoBloque(esPositivo(volumen) ? volumen : 1000);
  let bloqueArriba = SUPERFICIE;
  if (resultado) {
    if (resultado.veredicto === 'flota') {
      // Sobresale exactamente la fracción 1 − f del lado
      bloqueArriba = SUPERFICIE - resultado.fraccionEmergida * lado;
    } else if (resultado.veredicto === 'se-hunde') {
      bloqueArriba = FONDO - 2 - lado;
    } else {
      bloqueArriba = (SUPERFICIE + FONDO) / 2 - lado / 2;
    }
  }
  const centroBloqueY = bloqueArriba + lado / 2;
  // El empuje se aplica en el centro de la parte sumergida (centro de carena)
  const centroSumergidoY = resultado && resultado.veredicto === 'flota'
    ? SUPERFICIE + (resultado.fraccionSumergida * lado) / 2
    : centroBloqueY;
  const fuerzaMayor = resultado ? Math.max(resultado.peso, resultado.empuje) : 1;
  const largoPeso = resultado ? (FLECHA_MAX * resultado.peso) / fuerzaMayor : 0;
  const largoEmpuje = resultado ? (FLECHA_MAX * resultado.empuje) / fuerzaMayor : 0;

  const descripcionDibujo = resultado
    ? (() => {
      const base = `Recipiente con ${nombreLiquido} y un bloque de ${nombreCuerpo}: ${NOMBRE_VEREDICTO[resultado.veredicto].toLowerCase()}.`;
      if (resultado.veredicto === 'flota') {
        return `${base} Queda sumergido el ${textoPorcentaje(resultado.fraccionSumergida)} de su volumen y sobresale el ${textoPorcentaje(resultado.fraccionEmergida)}. Las flechas de peso y empuje miden lo mismo: ${textoFuerza(resultado.peso)}.`;
      }
      if (resultado.veredicto === 'se-hunde') {
        return `${base} Descansa en el fondo. Flecha de peso de ${textoFuerza(resultado.peso)} y de empuje de ${textoFuerza(resultado.empuje)}, más corta.`;
      }
      return `${base} Se queda a media altura, con peso y empuje iguales: ${textoFuerza(resultado.peso)}.`;
    })()
    : `Recipiente con líquido, sin bloque: faltan datos (${faltas.join('; ')}).`;

  // Lo que el deslizador refleja de la caja de texto
  const posicionDeslizador = posicionDesdeVolumen(volumen);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🚢</span> Simulador de Flotabilidad</h1>
        <p className={styles.subtitle}>
          Principio de Arquímedes y densidad: elige el cuerpo y el líquido y comprueba si flota,
          cuánto se sumerge y cuánto empuje recibe
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ── Controles ───────────────────────────────────────────────────── */}
        <section className={styles.panel} aria-labelledby="titulo-datos">
          <h2 id="titulo-datos" className={styles.panelTitulo}>Datos del problema</h2>

          <div className={styles.grupo} role="group" aria-labelledby="titulo-material">
            <h3 id="titulo-material" className={styles.grupoTitulo}>Material del cuerpo (ρc)</h3>
            <div className={styles.presets}>
              {MATERIALES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.preset}
                  aria-pressed={materialId === m.id}
                  onClick={() => setMaterialId(m.id)}
                >
                  <span className={styles.muestra} style={{ background: m.color }} aria-hidden="true" />
                  {m.nombre}
                  <span className={styles.presetDensidad}>{formatNumber(m.densidad, 0)} kg/m³</span>
                </button>
              ))}
              <button
                type="button"
                className={styles.preset}
                aria-pressed={materialId === ID_OTRA}
                onClick={() => setMaterialId(ID_OTRA)}
              >
                <span className={styles.muestra} style={{ background: COLOR_OTRA }} aria-hidden="true" />
                Otra densidad
              </button>
            </div>
            {materialId === ID_OTRA && (
              <div className={styles.entradaOtra}>
                <NumberInput
                  label="Densidad del cuerpo"
                  value={densidadOtroCuerpo}
                  onChange={setDensidadOtroCuerpo}
                  min={0}
                  suffix="kg/m³"
                  placeholder="800"
                  helperText="Por ejemplo, una vela de parafina ronda 900 kg/m³"
                />
              </div>
            )}
          </div>

          <div className={styles.grupo} role="group" aria-labelledby="titulo-volumen">
            <h3 id="titulo-volumen" className={styles.grupoTitulo}>Volumen del cuerpo (V)</h3>
            <div className={styles.volumenFila}>
              <div className={styles.volumenCaja}>
                <NumberInput
                  label="Volumen"
                  value={volumenTexto}
                  onChange={setVolumenTexto}
                  min={VOLUMEN_MIN}
                  max={VOLUMEN_MAX}
                  suffix="cm³"
                  placeholder="1000"
                  helperText="De 1 a 10.000 cm³ (1 litro = 1000 cm³)"
                />
              </div>
              <div className={styles.deslizadorCaja}>
                <label className={styles.deslizadorEtiqueta} htmlFor="deslizador-volumen">
                  Ajuste rápido (escala logarítmica)
                </label>
                <input
                  id="deslizador-volumen"
                  type="range"
                  min={0}
                  max={1000}
                  step={1}
                  value={posicionDeslizador}
                  className={styles.deslizador}
                  onChange={(e) => {
                    const v = volumenDesdeDeslizador(Number(e.target.value));
                    setVolumenTexto(formatNumber(v, v < 10 ? 1 : 0));
                  }}
                  aria-valuetext={esPositivo(volumen) ? `${formatoSignificativo(volumen)} centímetros cúbicos` : 'sin volumen'}
                />
                <div className={styles.deslizadorMarcas} aria-hidden="true">
                  <span>1</span><span>10</span><span>100</span><span>1000</span><span>10.000</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.grupo} role="group" aria-labelledby="titulo-liquido">
            <h3 id="titulo-liquido" className={styles.grupoTitulo}>Líquido (ρl)</h3>
            <div className={styles.presets}>
              {LIQUIDOS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={styles.preset}
                  aria-pressed={liquidoId === l.id}
                  onClick={() => setLiquidoId(l.id)}
                >
                  <span className={styles.muestra} style={{ background: l.color }} aria-hidden="true" />
                  {l.nombre}
                  <span className={styles.presetDensidad}>{formatNumber(l.densidad, 0)} kg/m³</span>
                </button>
              ))}
              <button
                type="button"
                className={styles.preset}
                aria-pressed={liquidoId === ID_OTRA}
                onClick={() => setLiquidoId(ID_OTRA)}
              >
                <span className={styles.muestra} style={{ background: COLOR_OTRA }} aria-hidden="true" />
                Otra densidad
              </button>
            </div>
            {liquidoId === ID_OTRA && (
              <div className={styles.entradaOtra}>
                <NumberInput
                  label="Densidad del líquido"
                  value={densidadOtroLiquido}
                  onChange={setDensidadOtroLiquido}
                  min={0}
                  suffix="kg/m³"
                  placeholder="1030"
                  helperText="Por ejemplo, la leche de vaca ronda 1030 kg/m³"
                />
              </div>
            )}
          </div>

          <p className={styles.nota}>
            Gravedad g = {formatNumber(G, 2)} m/s². Las densidades de los botones son valores
            típicos a temperatura ambiente: cambian con la temperatura y la composición.
          </p>
        </section>

        {/* ── Dibujo + resultados ─────────────────────────────────────────── */}
        <div className={styles.simLayout}>
          <div className={styles.dibujoCaja}>
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className={styles.dibujo}
              role="img"
              aria-label={descripcionDibujo}
            >
              {/* Líquido */}
              <rect
                x={RECIPIENTE_IZQ + 2}
                y={SUPERFICIE}
                width={RECIPIENTE_DER - RECIPIENTE_IZQ - 4}
                height={FONDO - SUPERFICIE - 2}
                fill={colorLiquido}
                fillOpacity={0.55}
              />
              <line
                x1={RECIPIENTE_IZQ + 2}
                y1={SUPERFICIE}
                x2={RECIPIENTE_DER - 2}
                y2={SUPERFICIE}
                stroke={colorLiquido}
                strokeWidth={2}
              />

              {/* Bloque */}
              {resultado && (
                <g>
                  <rect
                    x={CENTRO_X - lado / 2}
                    y={bloqueArriba}
                    width={lado}
                    height={lado}
                    rx={3}
                    fill={colorCuerpo}
                    className={styles.svgBloque}
                    strokeWidth={1.5}
                  />
                  {resultado.veredicto === 'flota' && (
                    <line
                      x1={CENTRO_X - lado / 2}
                      y1={SUPERFICIE}
                      x2={CENTRO_X + lado / 2}
                      y2={SUPERFICIE}
                      className={styles.svgLineaFlotacion}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />
                  )}
                </g>
              )}

              {/* Recipiente (encima del líquido para tapar sus bordes) */}
              <path
                d={`M ${RECIPIENTE_IZQ} ${RECIPIENTE_ARRIBA} L ${RECIPIENTE_IZQ} ${FONDO} L ${RECIPIENTE_DER} ${FONDO} L ${RECIPIENTE_DER} ${RECIPIENTE_ARRIBA}`}
                className={styles.svgRecipiente}
                fill="none"
                strokeWidth={4}
                strokeLinejoin="round"
              />

              {/* Fuerzas: peso desde el centro del bloque, empuje desde el centro de la parte sumergida */}
              {resultado && (
                <>
                  <Flecha
                    x={CENTRO_X - 12}
                    desde={centroBloqueY}
                    hasta={centroBloqueY + largoPeso}
                    clase={styles.svgFlechaPeso}
                  />
                  <Flecha
                    x={CENTRO_X + 12}
                    desde={centroSumergidoY}
                    hasta={centroSumergidoY - largoEmpuje}
                    clase={styles.svgFlechaEmpuje}
                  />
                  <text
                    x={CENTRO_X - 20}
                    y={centroBloqueY + largoPeso}
                    textAnchor="end"
                    className={`${styles.svgEtiqueta} ${styles.svgEtiquetaPeso}`}
                  >
                    P = {textoFuerza(resultado.peso)}
                  </text>
                  <text
                    x={CENTRO_X + 20}
                    y={centroSumergidoY - largoEmpuje + 10}
                    textAnchor="start"
                    className={`${styles.svgEtiqueta} ${styles.svgEtiquetaEmpuje}`}
                  >
                    E = {textoFuerza(resultado.empuje)}
                  </text>
                </>
              )}

              {/* Rótulos */}
              <text x={RECIPIENTE_IZQ + 8} y={FONDO - 12} className={styles.svgRotulo}>
                {liquido ? liquido.nombre : 'Líquido'}
                {esPositivo(densidadLiquido) ? ` · ${formatNumber(densidadLiquido, 0)} kg/m³` : ''}
              </text>
              <text x={RECIPIENTE_DER + 6} y={SUPERFICIE + 4} className={styles.svgRotuloSecundario}>
                superficie
              </text>
              {!resultado && (
                <text x={CENTRO_X} y={(RECIPIENTE_ARRIBA + SUPERFICIE) / 2 + 5} textAnchor="middle" className={styles.svgRotulo}>
                  Faltan datos
                </text>
              )}
            </svg>
            <p className={styles.leyenda}>
              <span className={styles.leyendaPeso}><span aria-hidden="true">↓</span> Peso P</span>
              <span className={styles.leyendaEmpuje}><span aria-hidden="true">↑</span> Empuje E</span>
              <span>Flechas a escala entre sí</span>
            </p>
          </div>

          <div className={styles.resultadosCaja}>
            <div role="status" aria-live="polite" className={styles.resultados}>
              {resultado ? (
                <>
                  <div
                    className={`${styles.veredicto} ${
                      resultado.veredicto === 'flota'
                        ? styles.veredictoFlota
                        : resultado.veredicto === 'se-hunde'
                          ? styles.veredictoHunde
                          : styles.veredictoIndiferente
                    }`}
                  >
                    <span className={styles.veredictoTexto}>{NOMBRE_VEREDICTO[resultado.veredicto]}</span>
                    <span className={styles.veredictoMotivo}>
                      {resultado.veredicto === 'flota' && `ρc = ${formatNumber(densidadCuerpo, 0)} < ρl = ${formatNumber(densidadLiquido, 0)} kg/m³`}
                      {resultado.veredicto === 'se-hunde' && `ρc = ${formatNumber(densidadCuerpo, 0)} > ρl = ${formatNumber(densidadLiquido, 0)} kg/m³`}
                      {resultado.veredicto === 'indiferente' && `ρc = ρl = ${formatNumber(densidadLiquido, 0)} kg/m³: flota entre dos aguas`}
                    </span>
                  </div>

                  <div className={styles.tarjetas}>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Masa m = ρc·V</span>
                      <span className={styles.tarjetaValor}>{formatoSignificativo(resultado.masa)} kg</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Peso P = ρc·V·g</span>
                      <span className={styles.tarjetaValor}>{textoFuerza(resultado.peso)}</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>
                        {resultado.veredicto === 'flota' ? 'Empuje en equilibrio (E = P)' : 'Empuje E = ρl·V·g'}
                      </span>
                      <span className={styles.tarjetaValor}>{textoFuerza(resultado.empuje)}</span>
                    </div>

                    {resultado.veredicto === 'flota' && (
                      <>
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Sumergido f = ρc/ρl</span>
                          <span className={styles.tarjetaValor}>{textoPorcentaje(resultado.fraccionSumergida)}</span>
                        </div>
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Sobresale 1 − f</span>
                          <span className={styles.tarjetaValor}>{textoPorcentaje(resultado.fraccionEmergida)}</span>
                        </div>
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Fuerza para hundirlo entero (E_max − P)</span>
                          <span className={styles.tarjetaValor}>{textoFuerza(resultado.fuerzaParaHundir ?? 0)}</span>
                        </div>
                      </>
                    )}

                    {resultado.veredicto === 'se-hunde' && (
                      <>
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Peso aparente P − E (dinamómetro)</span>
                          <span className={styles.tarjetaValor}>{textoFuerza(resultado.pesoAparente ?? 0)}</span>
                        </div>
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Pierde de su peso (E/P = ρl/ρc)</span>
                          <span className={styles.tarjetaValor}>{textoPorcentaje(resultado.empuje / resultado.peso)}</span>
                        </div>
                      </>
                    )}

                    {resultado.veredicto === 'indiferente' && (
                      <>
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Sumergido</span>
                          <span className={styles.tarjetaValor}>{textoPorcentaje(1)}</span>
                        </div>
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Peso aparente P − E</span>
                          <span className={styles.tarjetaValor}>{textoFuerza(0)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {resultado.veredicto === 'se-hunde' && (
                    <p className={styles.aclaracion}>
                      En el fondo, el recipiente sostiene la diferencia: empuja hacia arriba con{' '}
                      {textoFuerza(resultado.pesoAparente ?? 0)}, lo mismo que marcaría un
                      dinamómetro si lo colgaras sumergido.
                    </p>
                  )}
                </>
              ) : (
                <div className={styles.faltan}>
                  <strong>Faltan datos para calcular.</strong>
                  <p>Escribe {faltas.join('; ')}.</p>
                </div>
              )}
            </div>

            {/* ── Fórmulas según el veredicto ────────────────────────────── */}
            <div className={styles.formulaBox}>
              {!resultado && <>Con los tres datos aparecen aquí las fórmulas con tus números.</>}
              {resultado && (
                <>
                  <p className={styles.formulaLinea}>
                    <code>V = {formatoSignificativo(volumen)} cm³ = {formatoSignificativo(volumen / CM3_POR_M3)} m³</code>
                  </p>
                  <p className={styles.formulaLinea}>
                    <code>
                      P = ρc·V·g = {formatNumber(densidadCuerpo, 0)} · {formatoSignificativo(resultado.volumen)} · {formatNumber(G, 2)} = {textoFuerza(resultado.peso)}
                    </code>
                  </p>
                  <p className={styles.formulaLinea}>
                    <code>
                      E_max = ρl·V·g = {formatNumber(densidadLiquido, 0)} · {formatoSignificativo(resultado.volumen)} · {formatNumber(G, 2)} = {textoFuerza(resultado.empujeMaximo)}
                    </code>
                  </p>
                  {resultado.veredicto === 'flota' && (
                    <>
                      <p className={styles.formulaLinea}>
                        Como E_max &gt; P, sube hasta que <code>E = ρl·V_sumergido·g = P</code>.
                      </p>
                      <p className={styles.formulaLinea}>
                        <code>
                          f = V_sumergido/V = ρc/ρl = {formatNumber(densidadCuerpo, 0)}/{formatNumber(densidadLiquido, 0)} = {formatoSignificativo(resultado.fraccionSumergida)}
                        </code>
                      </p>
                    </>
                  )}
                  {resultado.veredicto === 'se-hunde' && (
                    <>
                      <p className={styles.formulaLinea}>
                        Como E_max &lt; P, el empuje no alcanza y el cuerpo va al fondo.
                      </p>
                      <p className={styles.formulaLinea}>
                        <code>
                          Peso aparente = P − E = (ρc − ρl)·V·g = {textoFuerza(resultado.pesoAparente ?? 0)}
                        </code>
                      </p>
                    </>
                  )}
                  {resultado.veredicto === 'indiferente' && (
                    <p className={styles.formulaLinea}>
                      <code>ρc = ρl → E = P</code> a cualquier profundidad: se queda donde lo sueltes
                      y el peso aparente es 0.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tarea de aula (skill /casos-aula-meskeia): tras los controles y FUERA de
            EducationalSection, que nace colapsada. */}
        <CasosAula />

        {/* ── Sección educativa v2.0 ──────────────────────────────────────── */}
        <EducationalSection
          title="Aprende sobre el principio de Arquímedes"
          subtitle="Densidad, empuje y por qué unas cosas flotan y otras no"
          icon="🚢"
        >
          <p className={styles.eduIntro}>
            El <strong>principio de Arquímedes</strong> dice que todo cuerpo sumergido, total o
            parcialmente, en un fluido recibe una fuerza vertical hacia arriba —el{' '}
            <strong>empuje</strong>— igual al peso del fluido que desaloja: <em>E = ρl·V_sumergido·g</em>.
            Se atribuye a Arquímedes de Siracusa (siglo III a. C.), que lo expuso en su tratado{' '}
            <em>Sobre los cuerpos flotantes</em>. Comparando ese empuje con el peso del cuerpo se
            decide si flota o se hunde, y la comparación se reduce a una de densidades.
          </p>

          {/* 1 · Tabla comparativa */}
          <h3 className={styles.eduSubtitle}>Densidades de referencia</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Sustancia</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Densidad típica (kg/m³)</th>
                  <th scope="col">¿Flota en agua dulce?</th>
                  <th scope="col">Varía con</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Corcho</td><td>Sólido</td><td>120 – 240</td><td>Sí (sumerge ~12–24&nbsp;%)</td><td>Calidad y compresión</td></tr>
                <tr><td>Madera de pino</td><td>Sólido</td><td>350 – 600</td><td>Sí</td><td>Especie y humedad</td></tr>
                <tr><td>Hielo (a 0 °C)</td><td>Sólido</td><td>917</td><td>Sí (sumerge ~92&nbsp;%)</td><td>Burbujas de aire atrapadas</td></tr>
                <tr><td>Aluminio</td><td>Sólido</td><td>2700</td><td>No</td><td>Aleación</td></tr>
                <tr><td>Hierro</td><td>Sólido</td><td>7870 (acero: ~7850)</td><td>No</td><td>Aleación</td></tr>
                <tr><td>Oro</td><td>Sólido</td><td>19.300</td><td>No</td><td>Pureza (quilates)</td></tr>
                <tr><td>Alcohol etílico</td><td>Líquido</td><td>789</td><td>—</td><td>Temperatura, agua mezclada</td></tr>
                <tr><td>Aceite de oliva</td><td>Líquido</td><td>910 – 920</td><td>Flota sobre el agua</td><td>Temperatura y variedad</td></tr>
                <tr><td>Agua dulce</td><td>Líquido</td><td>998 a 20 °C (1000 a 4 °C)</td><td>—</td><td>Temperatura</td></tr>
                <tr><td>Agua de mar</td><td>Líquido</td><td>1020 – 1030</td><td>—</td><td>Salinidad y temperatura</td></tr>
                <tr><td>Glicerina</td><td>Líquido</td><td>1260</td><td>Se hunde en el agua</td><td>Temperatura, agua absorbida</td></tr>
                <tr><td>Mercurio</td><td>Líquido</td><td>13.534 (a 25 °C)</td><td>—</td><td>Temperatura</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.fuente}>
            Fuente: valores de referencia habituales en las tablas de física y química (por ejemplo,
            el <em>CRC Handbook of Chemistry and Physics</em>), redondeados. Son típicos, no exactos:
            dependen de la temperatura, la presión y la composición de cada muestra. El simulador
            usa 1000 kg/m³ para el agua dulce, el valor redondo de los problemas de clase.
          </p>

          {/* 2 · Casos de uso */}
          <h3 className={styles.eduSubtitle}>Dónde aparece el principio de Arquímedes</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎒</span>
              <h4>Estudiante de secundaria o preparatoria</h4>
              <p>
                Los problemas de fluidos piden casi siempre lo mismo: peso, empuje, si flota y qué
                fracción queda sumergida. Plantea el problema en papel y comprueba aquí cada cifra
                con «Otra densidad» si el enunciado usa valores distintos.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚢</span>
              <h4>Por qué flota un barco de acero</h4>
              <p>
                El acero (~7850 kg/m³) se hunde, pero un casco hueco lleno de aire tiene una
                densidad media menor que la del agua. El barco se hunde hasta desalojar un peso de
                agua igual al suyo; si se inunda, su densidad media sube y se va a pique.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🧊</span>
              <h4>Hielo e icebergs</h4>
              <p>
                El hielo es menos denso que el agua líquida, algo poco común en una sustancia. En
                el mar queda sumergido en torno al 89,5&nbsp;% (917/1025): lo que se ve de un
                iceberg es solo una décima parte. Pruébalo con Hielo y Agua de mar.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🥛</span>
              <h4>Densímetro y lactodensímetro</h4>
              <p>
                Un flotador lastrado con una escala graduada: cuanto menos denso es el líquido, más
                se hunde. Así se mide la densidad de la leche (en torno a 1030 kg/m³), del mosto o
                del electrolito de una batería sin pesar nada.
              </p>
            </div>
          </div>

          {/* 3 · FAQ */}
          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿El empuje depende de la profundidad?</strong>
              <p>
                No, mientras el cuerpo esté entero bajo el líquido y este no se comprima: la
                presión aumenta con la profundidad, pero la diferencia entre la cara de abajo y la
                de arriba es siempre la misma. Por eso un cuerpo con ρc = ρl se queda donde lo
                sueltes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Depende de la forma del cuerpo?</strong>
              <p>
                El empuje depende del volumen sumergido, no de la forma. Pero la forma decide
                cuánto volumen puede desalojar un mismo material: una bola de plastilina se hunde y
                la misma plastilina moldeada como un barquito flota.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el hierro flota en mercurio?</strong>
              <p>
                Porque el mercurio (13.534 kg/m³) es más denso que el hierro (7870 kg/m³). Flota con
                el 58&nbsp;% de su volumen sumergido (7870/13.534 = 0,58).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el peso aparente?</strong>
              <p>
                Lo que marca un dinamómetro con el cuerpo colgado y sumergido: P − E. Es la razón de
                que una piedra parezca más ligera dentro del agua y de que en una piscina se pueda
                levantar a otra persona con menos esfuerzo.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Midiendo el peso en el aire y el aparente en agua
                se obtiene la densidad del cuerpo: ρc = ρagua · P / (P − P_aparente).
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Es cierta la anécdota de la corona y el «¡eureka!»?</strong>
              <p>
                Es la versión que recoge Vitruvio unos dos siglos después: Arquímedes habría
                comprobado si una corona era de oro puro midiendo el agua que desalojaba. Se
                considera una leyenda difícil de verificar; el principio, en cambio, está en su
                tratado y se comprueba en cualquier laboratorio.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Y en el aire también hay empuje?</strong>
              <p>
                Sí: el aire es un fluido de unos 1,2 kg/m³. Es despreciable para un bloque de hierro,
                pero es lo que sostiene un globo de helio o de aire caliente, cuya densidad media es
                menor que la del aire que lo rodea.
              </p>
            </div>
          </div>

          {/* 4 · Guía paso a paso */}
          <h3 className={styles.eduSubtitle}>Cómo resolver un problema de Arquímedes, paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Pasa todo a unidades del SI</strong>
                <p>
                  Densidades en kg/m³ (1 g/cm³ = 1000 kg/m³) y volumen en m³: divide los cm³ entre
                  1.000.000 (1000 cm³ = 0,001 m³ = 1 litro).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Compara densidades</strong>
                <p>ρc &lt; ρl flota · ρc &gt; ρl se hunde · ρc = ρl equilibrio indiferente. Ya sabes qué fórmula toca.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Calcula el peso</strong>
                <p>P = m·g = ρc·V·g. Si el enunciado da la masa, úsala directamente.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Plantea el empuje según el caso</strong>
                <p>
                  Si flota: E = P, de donde V_sumergido = P/(ρl·g) y f = ρc/ρl. Si se hunde: E =
                  ρl·V·g con el volumen entero, y el peso aparente es P − E.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba que el resultado tiene sentido</strong>
                <p>
                  La fracción sumergida está entre 0 y 1; el peso aparente es positivo y menor que
                  el peso; el empuje nunca supera ρl·V·g.
                </p>
              </div>
            </div>
          </div>

          {/* 5 · Consejos */}
          <h3 className={styles.eduSubtitle}>Consejos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>Empieza por las densidades</strong>
                <p>Antes de calcular fuerzas, compáralas: el veredicto sale gratis y te dice qué volumen usar.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Vigila las unidades del volumen</strong>
                <p>1 cm³ = 10⁻⁶ m³ y 1 L = 10⁻³ m³. Un error aquí multiplica el resultado por mil o por un millón.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <div>
                <strong>La fracción sumergida no necesita g ni V</strong>
                <p>f = ρc/ρl: se simplifican. Cambia el volumen en el simulador y verás que el porcentaje no se mueve.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✏️</span>
              <div>
                <strong>Dibuja las fuerzas</strong>
                <p>Peso hacia abajo, empuje hacia arriba y, si toca fondo, la normal del fondo. El equilibrio se lee en el dibujo.</p>
              </div>
            </div>
          </div>

          {/* 6 · Errores típicos */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores típicos con el principio de Arquímedes
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir masa con peso:</strong> la masa va en kg y el peso en newtons
                (P = m·g). El empuje es una fuerza: se compara con el peso, no con la masa.
              </li>
              <li>
                <strong>Usar el volumen total cuando flota:</strong> el empuje solo cuenta el volumen
                sumergido. Con el total sale E_max, mayor que el peso, y el cuerpo no estaría en equilibrio.
              </li>
              <li>
                <strong>Confundir la densidad del cuerpo con la del líquido:</strong> el empuje usa ρl
                (el fluido desalojado) y el peso usa ρc.
              </li>
              <li>
                <strong>Pensar que lo pesado se hunde:</strong> un tronco de 500 kg flota y una moneda
                de 5 g se hunde. Decide la densidad, no el peso.
              </li>
              <li>
                <strong>Olvidar convertir cm³ a m³:</strong> con densidades en kg/m³, el volumen debe ir
                en m³ o el peso sale un millón de veces mayor.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="simulador-flotabilidad" />
      </main>

      <Footer appName="simulador-flotabilidad" />
    </div>
  );
}
