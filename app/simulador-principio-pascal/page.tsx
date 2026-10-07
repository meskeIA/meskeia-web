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
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';
import styles from './SimuladorPrincipioPascal.module.css';
import {
  calcularPresion,
  profundidadUnaAtmosfera,
  areaCirculo,
  calcularPrensa,
  casoTuboU,
  calcularTuboU,
  esPositivo,
  esNoNegativo,
  G,
  P_ATM,
  CM2_POR_M2,
  type ResultadoPresion,
  type ResultadoPrensa,
  type ResultadoTuboU,
} from './motor';
// Las mismas densidades que el simulador de flotabilidad: un solo sitio para las cifras
import { LIQUIDOS, type Sustancia } from '../simulador-flotabilidad/materiales';
import CasosAula from './CasosAula';

// ─── Constantes de la vista ──────────────────────────────────────────────────

const ID_OTRA = 'otra';
const COLOR_OTRA = '#7FB3D3';

const PROFUNDIDAD_MAX = 11000;
const DESLIZADOR_PROF_MAX = 100;

type ModoArea = 'diametro' | 'area';

// ─── Formato ─────────────────────────────────────────────────────────────────

/** Cifras significativas en formato español, para magnitudes que cambian de orden. */
function formatoSignificativo(valor: number, cifras = 4): string {
  return new Intl.NumberFormat('es-ES', { maximumSignificantDigits: cifras }).format(valor);
}

/** Presión en Pa con la unidad que se lee mejor: Pa por debajo de 10⁴, si no kPa o MPa. */
function textoPresion(pa: number): string {
  if (pa < 10_000) return `${formatoSignificativo(pa, 5)} Pa`;
  if (pa < 10_000_000) return `${formatoSignificativo(pa / 1000, 5)} kPa`;
  return `${formatoSignificativo(pa / 1_000_000, 5)} MPa`;
}

function textoPa(pa: number): string {
  return `${formatNumber(pa, pa < 100 ? 2 : 0)} Pa`;
}

/** Longitud en m, con cm o mm cuando es pequeña. */
function textoLongitud(m: number): string {
  if (m === 0) return '0 m';
  if (m < 0.01) return `${formatoSignificativo(m * 1000)} mm`;
  if (m < 1) return `${formatoSignificativo(m * 100)} cm`;
  return `${formatoSignificativo(m)} m`;
}

function textoFuerza(n: number): string {
  return `${formatoSignificativo(n)} N`;
}

// ─── Selector de líquido ─────────────────────────────────────────────────────

interface SelectorLiquidoProps {
  idGrupo: string;
  titulo: string;
  seleccion: string;
  onSeleccion: (id: string) => void;
  densidadOtra: string;
  onDensidadOtra: (v: string) => void;
  /** Ids que no se ofrecen en este selector. */
  excluir?: string[];
}

function SelectorLiquido({
  idGrupo,
  titulo,
  seleccion,
  onSeleccion,
  densidadOtra,
  onDensidadOtra,
  excluir = [],
}: SelectorLiquidoProps) {
  return (
    <div className={styles.grupo} role="group" aria-labelledby={idGrupo}>
      <h3 id={idGrupo} className={styles.grupoTitulo}>{titulo}</h3>
      <div className={styles.presets}>
        {LIQUIDOS.filter((l) => !excluir.includes(l.id)).map((l) => (
          <button
            key={l.id}
            type="button"
            className={styles.preset}
            aria-pressed={seleccion === l.id}
            onClick={() => onSeleccion(l.id)}
          >
            <span className={styles.muestra} style={{ background: l.color }} aria-hidden="true" />
            {l.nombre}
            <span className={styles.presetDensidad}>{formatNumber(l.densidad, 0)} kg/m³</span>
          </button>
        ))}
        <button
          type="button"
          className={styles.preset}
          aria-pressed={seleccion === ID_OTRA}
          onClick={() => onSeleccion(ID_OTRA)}
        >
          <span className={styles.muestra} style={{ background: COLOR_OTRA }} aria-hidden="true" />
          Otra densidad
        </button>
      </div>
      {seleccion === ID_OTRA && (
        <div className={styles.entradaOtra}>
          <NumberInput
            label="Densidad del líquido"
            value={densidadOtra}
            onChange={onDensidadOtra}
            min={0}
            suffix="kg/m³"
            placeholder="1030"
            helperText="Por ejemplo, la leche de vaca ronda 1030 kg/m³"
          />
        </div>
      )}
    </div>
  );
}

/** Densidad, nombre y color del líquido elegido (o de la densidad escrita a mano). */
function liquidoElegido(id: string, densidadOtra: string): { densidad: number; nombre: string; color: string; sustancia: Sustancia | null } {
  const sustancia = LIQUIDOS.find((l) => l.id === id) ?? null;
  if (sustancia) return { densidad: sustancia.densidad, nombre: sustancia.nombre, color: sustancia.color, sustancia };
  return { densidad: parseSpanishNumber(densidadOtra), nombre: 'Líquido de densidad personalizada', color: COLOR_OTRA, sustancia: null };
}

// ─── Dibujo 1 · depósito ─────────────────────────────────────────────────────

const ESCALAS_PROFUNDIDAD = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 11000];

/** Fondo del dibujo: la escala redonda más pequeña que deja el punto en el 85 % de la altura. */
function escalaProfundidad(h: number): number {
  return ESCALAS_PROFUNDIDAD.find((e) => h <= e * 0.85) ?? PROFUNDIDAD_MAX;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SimuladorPrincipioPascalPage() {
  // 1 · Presión a una profundidad
  const [liquidoId, setLiquidoId] = useState('agua');
  const [densidadOtra, setDensidadOtra] = useState('');
  const [profundidadTexto, setProfundidadTexto] = useState('10');

  // 2 · Prensa
  const [fuerzaTexto, setFuerzaTexto] = useState('100');
  const [modoArea, setModoArea] = useState<ModoArea>('diametro');
  const [medida1Texto, setMedida1Texto] = useState('2');
  const [medida2Texto, setMedida2Texto] = useState('20');
  const [recorridoTexto, setRecorridoTexto] = useState('10');

  // 3 · Tubo en U
  const [fondoId, setFondoId] = useState('agua');
  const [fondoOtra, setFondoOtra] = useState('');
  const [anadidoId, setAnadidoId] = useState('aceite');
  const [anadidoOtra, setAnadidoOtra] = useState('');
  const [alturaAnadidoTexto, setAlturaAnadidoTexto] = useState('10');

  // ── 1 · Cálculo ─────────────────────────────────────────────────────────────
  const liquido = liquidoElegido(liquidoId, densidadOtra);
  const profundidad = parseSpanishNumber(profundidadTexto);
  const presion: ResultadoPresion | null = useMemo(
    () => (profundidad <= PROFUNDIDAD_MAX ? calcularPresion(liquido.densidad, profundidad) : null),
    [liquido.densidad, profundidad],
  );
  const metrosPorAtm = profundidadUnaAtmosfera(liquido.densidad);
  const faltas1: string[] = [];
  if (!esPositivo(liquido.densidad)) faltas1.push('la densidad del líquido (en kg/m³, mayor que 0)');
  if (!esNoNegativo(profundidad) || profundidad > PROFUNDIDAD_MAX) {
    faltas1.push(`la profundidad (en m, de 0 a ${formatNumber(PROFUNDIDAD_MAX, 0)})`);
  }

  // ── 2 · Cálculo ─────────────────────────────────────────────────────────────
  const fuerza = parseSpanishNumber(fuerzaTexto);
  const medida1 = parseSpanishNumber(medida1Texto);
  const medida2 = parseSpanishNumber(medida2Texto);
  const recorrido = parseSpanishNumber(recorridoTexto);
  // Áreas en cm²: del diámetro (π·d²/4) o tal cual
  const area1Cm2 = modoArea === 'diametro' ? areaCirculo(medida1) : esPositivo(medida1) ? medida1 : null;
  const area2Cm2 = modoArea === 'diametro' ? areaCirculo(medida2) : esPositivo(medida2) ? medida2 : null;
  const prensa: ResultadoPrensa | null = useMemo(
    () =>
      area1Cm2 !== null && area2Cm2 !== null
        ? calcularPrensa(fuerza, area1Cm2 / CM2_POR_M2, area2Cm2 / CM2_POR_M2, recorrido / 100)
        : null,
    [fuerza, area1Cm2, area2Cm2, recorrido],
  );
  const nombreMedida = modoArea === 'diametro' ? 'diámetro' : 'área';
  const unidadMedida = modoArea === 'diametro' ? 'cm' : 'cm²';
  const faltas2: string[] = [];
  if (!esPositivo(fuerza)) faltas2.push('la fuerza sobre el émbolo 1 (en N, mayor que 0)');
  if (area1Cm2 === null) faltas2.push(`el ${nombreMedida} del émbolo 1 (en ${unidadMedida}, mayor que 0)`);
  if (area2Cm2 === null) faltas2.push(`el ${nombreMedida} del émbolo 2 (en ${unidadMedida}, mayor que 0)`);
  if (!esNoNegativo(recorrido)) faltas2.push('lo que baja el émbolo 1 (en cm, 0 o más)');

  // ── 3 · Cálculo ─────────────────────────────────────────────────────────────
  const fondo = liquidoElegido(fondoId, fondoOtra);
  const anadido = liquidoElegido(anadidoId, anadidoOtra);
  const alturaAnadidoCm = parseSpanishNumber(alturaAnadidoTexto);
  const tubo: ResultadoTuboU | null = useMemo(
    () => calcularTuboU(fondo.densidad, anadido.densidad, alturaAnadidoCm / 100),
    [fondo.densidad, anadido.densidad, alturaAnadidoCm],
  );
  const densidadesValidas = esPositivo(fondo.densidad) && esPositivo(anadido.densidad);
  const caso = densidadesValidas ? casoTuboU(fondo.densidad, anadido.densidad) : null;
  const faltas3: string[] = [];
  if (!esPositivo(fondo.densidad)) faltas3.push('la densidad del líquido del fondo (en kg/m³, mayor que 0)');
  if (!esPositivo(anadido.densidad)) faltas3.push('la densidad del líquido añadido (en kg/m³, mayor que 0)');
  if (!esPositivo(alturaAnadidoCm)) faltas3.push('la altura del líquido añadido (en cm, mayor que 0)');

  // ── 1 · Geometría del depósito ──────────────────────────────────────────────
  const D_SUP = 70;
  const D_FONDO = 400;
  const D_IZQ = 70;
  const D_DER = 260;
  const escala = escalaProfundidad(esNoNegativo(profundidad) ? profundidad : 10);
  const yPunto = presion ? D_SUP + (profundidad / escala) * (D_FONDO - D_SUP) : D_SUP;
  const marcas = [0, 0.25, 0.5, 0.75, 1].map((f) => f * escala);
  // Barra de la presión absoluta: P₀ en gris y ρgh del color del líquido, a escala entre sí
  const anchoBarra = 340;
  const fraccionP0 = presion ? P_ATM / presion.presionAbsoluta : 1;

  const descripcionDeposito = presion
    ? `Depósito de ${liquido.nombre.toLowerCase()} con un punto a ${formatoSignificativo(profundidad)} m de profundidad. El líquido añade ${textoPresion(presion.presionHidrostatica)} a la atmósfera de la superficie: presión absoluta ${textoPresion(presion.presionAbsoluta)}, ${formatNumber(presion.presionAbsolutaAtm, 3)} atm.`
    : `Depósito sin punto marcado: faltan datos (${faltas1.join('; ')}).`;

  // ── 2 · Geometría de la prensa ──────────────────────────────────────────────
  const P_LIQ_SUP = 130;
  const P_LIQ_INF = 250;
  const P_CANAL = 280;
  const X1 = 120;
  const X2 = 340;
  const ANCHO_MAX = 150;
  const areaMayor = area1Cm2 !== null && area2Cm2 !== null ? Math.max(area1Cm2, area2Cm2) : 1;
  // El ancho dibujado es proporcional al DIÁMETRO (raíz del área), con un mínimo para que se vea
  const anchoEmbolo = (a: number | null) => (a === null ? 40 : Math.max(24, ANCHO_MAX * Math.sqrt(a / areaMayor)));
  const w1 = anchoEmbolo(area1Cm2);
  const w2 = anchoEmbolo(area2Cm2);
  // Flechas en escala logarítmica: una ventaja de ×100 a escala lineal no cabría
  const largoFlecha = (f: number, fMax: number) => 22 + 48 * (Math.log10(1 + (9 * f) / fMax));
  const fMaxPrensa = prensa ? Math.max(fuerza, prensa.fuerzaSalida) : 1;

  const descripcionPrensa = prensa
    ? `Prensa hidráulica: ${textoFuerza(fuerza)} sobre el émbolo 1 se convierten en ${textoFuerza(prensa.fuerzaSalida)} en el émbolo 2, ${formatoSignificativo(prensa.ventaja)} veces más, porque su área es ${formatoSignificativo(prensa.ventaja)} veces mayor. Si el émbolo 1 baja ${textoLongitud(recorrido / 100)}, el 2 sube ${textoLongitud(prensa.desplazamientoSalida)}.`
    : `Prensa hidráulica sin fuerzas: faltan datos (${faltas2.join('; ')}).`;

  // ── 3 · Geometría del tubo en U ─────────────────────────────────────────────
  const U_IZQ = 110;
  const U_DER = 240;
  const U_ANCHO = 50;
  const U_CODO = 330;
  const U_SEP = 250;
  const U_COLUMNA_MAX = 190;
  const pxPorM = tubo ? U_COLUMNA_MAX / (alturaAnadidoCm / 100) : 0;
  const ySupFondo = tubo ? U_SEP - tubo.alturaFondo * pxPorM : U_SEP - 60;
  const ySupAnadido = tubo ? U_SEP - (alturaAnadidoCm / 100) * pxPorM : U_SEP - 60;

  const descripcionTubo = tubo
    ? `Tubo en U con ${fondo.nombre.toLowerCase()} en el fondo y ${anadido.nombre.toLowerCase()} en la rama derecha. La columna de ${formatoSignificativo(alturaAnadidoCm)} cm de ${anadido.nombre.toLowerCase()} se equilibra con ${formatoSignificativo(tubo.alturaFondo * 100)} cm de ${fondo.nombre.toLowerCase()} en la rama izquierda; las superficies quedan a ${formatoSignificativo(tubo.desnivel * 100)} cm de desnivel.`
    : 'Tubo en U con las dos superficies a la misma altura.';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🛢️</span> Simulador del Principio de Pascal y la Presión Hidrostática</h1>
        <p className={styles.subtitle}>
          Presión a una profundidad en distintos líquidos, prensa hidráulica y tubo en U con dos
          líquidos: los tres problemas de fluidos en reposo, con tus números
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ══ 1 · Presión a una profundidad ═══════════════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-parte1">
          <h2 id="titulo-parte1" className={styles.panelTitulo}>1. Presión a una profundidad</h2>
          <p className={styles.panelIntro}>
            Ecuación fundamental de la hidrostática: <strong>P = P₀ + ρ·g·h</strong>. Elige el
            líquido y la profundidad del punto.
          </p>

          <SelectorLiquido
            idGrupo="titulo-liquido"
            titulo="Líquido (ρ)"
            seleccion={liquidoId}
            onSeleccion={setLiquidoId}
            densidadOtra={densidadOtra}
            onDensidadOtra={setDensidadOtra}
          />

          <div className={styles.grupo} role="group" aria-labelledby="titulo-profundidad">
            <h3 id="titulo-profundidad" className={styles.grupoTitulo}>Profundidad (h)</h3>
            <div className={styles.fila}>
              <div className={styles.filaCaja}>
                <NumberInput
                  label="Profundidad bajo la superficie"
                  value={profundidadTexto}
                  onChange={setProfundidadTexto}
                  min={0}
                  max={PROFUNDIDAD_MAX}
                  suffix="m"
                  placeholder="10"
                  helperText="De 0 a 11.000 m (la fosa de las Marianas ronda los 11.000 m)"
                />
              </div>
              <div className={styles.deslizadorCaja}>
                <label className={styles.deslizadorEtiqueta} htmlFor="deslizador-profundidad">
                  Ajuste rápido (0 a 100 m)
                </label>
                <input
                  id="deslizador-profundidad"
                  type="range"
                  min={0}
                  max={DESLIZADOR_PROF_MAX}
                  step={0.5}
                  value={esNoNegativo(profundidad) ? Math.min(profundidad, DESLIZADOR_PROF_MAX) : 0}
                  className={styles.deslizador}
                  onChange={(e) => setProfundidadTexto(formatNumber(Number(e.target.value), Number(e.target.value) % 1 === 0 ? 0 : 1))}
                  aria-valuetext={esNoNegativo(profundidad) ? `${formatoSignificativo(profundidad)} metros` : 'sin profundidad'}
                />
                <div className={styles.deslizadorMarcas} aria-hidden="true">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>
            </div>
          </div>

          <p className={styles.nota}>
            En la superficie se toma la atmósfera estándar, P₀ = 1 atm = 101.325 Pa, y g ={' '}
            {formatNumber(G, 2)} m/s².
          </p>

          <div className={styles.simLayout}>
            <div className={styles.dibujoCaja}>
              <svg viewBox="0 0 420 460" className={styles.dibujo} role="img" aria-label={descripcionDeposito}>
                <defs>
                  <linearGradient id="grad-deposito" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={liquido.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={liquido.color} stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <rect x={D_IZQ} y={D_SUP} width={D_DER - D_IZQ} height={D_FONDO - D_SUP} fill="url(#grad-deposito)" />
                <line x1={D_IZQ} y1={D_SUP} x2={D_DER} y2={D_SUP} stroke={liquido.color} strokeWidth={2} />
                <path
                  d={`M ${D_IZQ} ${D_SUP - 30} L ${D_IZQ} ${D_FONDO} L ${D_DER} ${D_FONDO} L ${D_DER} ${D_SUP - 30}`}
                  className={styles.svgRecipiente}
                  fill="none"
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
                {/* Regla de profundidad */}
                {marcas.map((m) => {
                  const y = D_SUP + (m / escala) * (D_FONDO - D_SUP);
                  return (
                    <g key={m}>
                      <line x1={D_IZQ - 10} y1={y} x2={D_IZQ} y2={y} className={styles.svgRegla} strokeWidth={1.5} />
                      <text x={D_IZQ - 14} y={y + 4} textAnchor="end" className={styles.svgRotuloSecundario}>
                        {formatoSignificativo(m)} m
                      </text>
                    </g>
                  );
                })}
                <text x={D_IZQ + 6} y={D_SUP - 10} className={styles.svgRotuloSecundario}>P₀ = 1 atm</text>
                {presion && (
                  <g>
                    <line x1={D_IZQ} y1={yPunto} x2={D_DER + 14} y2={yPunto} className={styles.svgCota} strokeWidth={1.5} strokeDasharray="5 4" />
                    <circle cx={(D_IZQ + D_DER) / 2} cy={yPunto} r={8} className={styles.svgPunto} />
                    <text x={D_DER + 18} y={yPunto - 4} className={styles.svgEtiqueta}>
                      {formatNumber(presion.presionAbsolutaAtm, 3)} atm
                    </text>
                    <text x={D_DER + 18} y={yPunto + 14} className={styles.svgRotuloSecundario}>
                      h = {formatoSignificativo(profundidad)} m
                    </text>
                  </g>
                )}
                <text x={D_IZQ + 8} y={D_FONDO - 12} className={styles.svgRotulo}>
                  {liquido.nombre}
                  {esPositivo(liquido.densidad) ? ` · ${formatNumber(liquido.densidad, 0)} kg/m³` : ''}
                </text>
                {/* Composición de la presión absoluta */}
                {presion && (
                  <g>
                    <rect x={40} y={420} width={anchoBarra * fraccionP0} height={20} className={styles.svgBarraP0} />
                    <rect x={40 + anchoBarra * fraccionP0} y={420} width={anchoBarra * (1 - fraccionP0)} height={20} fill={liquido.color} />
                    <rect x={40} y={420} width={anchoBarra} height={20} fill="none" className={styles.svgRecipiente} strokeWidth={1} />
                  </g>
                )}
              </svg>
              <p className={styles.leyenda}>
                <span><span className={`${styles.muestra} ${styles.muestraP0}`} aria-hidden="true" /> P₀ (atmósfera)</span>
                <span><span className={styles.muestra} style={{ background: liquido.color }} aria-hidden="true" /> ρ·g·h (líquido)</span>
                <span>Barra: la presión absoluta, a escala</span>
              </p>
            </div>

            <div className={styles.resultadosCaja}>
              <div role="status" aria-live="polite" className={styles.resultados}>
                {presion ? (
                  <>
                    <div className={styles.destacado}>
                      <span className={styles.destacadoNombre}>Presión absoluta P = P₀ + ρ·g·h</span>
                      <span className={styles.destacadoValor}>{textoPa(presion.presionAbsoluta)}</span>
                      <span className={styles.destacadoSub}>{formatNumber(presion.presionAbsolutaAtm, 3)} atm</span>
                    </div>
                    <div className={styles.tarjetas}>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Del líquido ρ·g·h (manométrica)</span>
                        <span className={styles.tarjetaValor}>{textoPa(presion.presionHidrostatica)}</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Atmósferas que añade el líquido</span>
                        <span className={styles.tarjetaValor}>{formatNumber(presion.presionHidrostaticaAtm, 3)} atm</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>De la atmósfera P₀</span>
                        <span className={styles.tarjetaValor}>{textoPa(P_ATM)}</span>
                      </div>
                      {metrosPorAtm !== null && (
                        <div className={styles.tarjeta}>
                          <span className={styles.tarjetaNombre}>Profundidad que añade 1 atm</span>
                          <span className={styles.tarjetaValor}>{formatNumber(metrosPorAtm, 2)} m</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={styles.faltan}>
                    <strong>Faltan datos para calcular.</strong>
                    <p>Escribe {faltas1.join('; ')}.</p>
                  </div>
                )}
              </div>
              <div className={styles.formulaBox}>
                {presion ? (
                  <>
                    <p className={styles.formulaLinea}>
                      <code>ρ·g·h = {formatNumber(liquido.densidad, 0)} · {formatNumber(G, 2)} · {formatoSignificativo(profundidad)} = {textoPa(presion.presionHidrostatica)}</code>
                    </p>
                    <p className={styles.formulaLinea}>
                      <code>P = {formatNumber(P_ATM, 0)} + {formatNumber(presion.presionHidrostatica, 0)} = {textoPa(presion.presionAbsoluta)}</code>
                    </p>
                    <p className={styles.formulaLinea}>
                      <code>P / 101.325 = {formatNumber(presion.presionAbsolutaAtm, 4)} atm</code>
                    </p>
                  </>
                ) : (
                  <>Con los dos datos aparecen aquí las fórmulas con tus números.</>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══ 2 · Prensa hidráulica ═══════════════════════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-parte2">
          <h2 id="titulo-parte2" className={styles.panelTitulo}>2. Prensa hidráulica (principio de Pascal)</h2>
          <p className={styles.panelIntro}>
            La presión que se aplica en un émbolo se transmite íntegra al otro:{' '}
            <strong>F₁/A₁ = F₂/A₂</strong>. Con un émbolo pequeño y otro grande, una fuerza pequeña
            sostiene una grande.
          </p>

          <div className={styles.grupo} role="group" aria-labelledby="titulo-modo-area">
            <h3 id="titulo-modo-area" className={styles.grupoTitulo}>¿Qué da el enunciado de cada émbolo?</h3>
            <div className={styles.presets}>
              <button
                type="button"
                className={styles.preset}
                aria-pressed={modoArea === 'diametro'}
                onClick={() => setModoArea('diametro')}
              >
                Diámetro (cm)
              </button>
              <button
                type="button"
                className={styles.preset}
                aria-pressed={modoArea === 'area'}
                onClick={() => setModoArea('area')}
              >
                Área (cm²)
              </button>
            </div>
          </div>

          <div className={styles.camposPrensa}>
            <NumberInput
              label="Fuerza sobre el émbolo 1 (F₁)"
              value={fuerzaTexto}
              onChange={setFuerzaTexto}
              min={0}
              suffix="N"
              placeholder="100"
              helperText="Un peso de 10 kg son unos 98 N"
            />
            <NumberInput
              label={`${modoArea === 'diametro' ? 'Diámetro' : 'Área'} del émbolo 1`}
              value={medida1Texto}
              onChange={setMedida1Texto}
              min={0}
              suffix={unidadMedida}
              placeholder={modoArea === 'diametro' ? '2' : '10'}
            />
            <NumberInput
              label={`${modoArea === 'diametro' ? 'Diámetro' : 'Área'} del émbolo 2`}
              value={medida2Texto}
              onChange={setMedida2Texto}
              min={0}
              suffix={unidadMedida}
              placeholder={modoArea === 'diametro' ? '20' : '500'}
            />
            <NumberInput
              label="Cuánto baja el émbolo 1 (x₁)"
              value={recorridoTexto}
              onChange={setRecorridoTexto}
              min={0}
              suffix="cm"
              placeholder="10"
            />
          </div>
          <p className={styles.nota}>
            Si el enunciado da el radio, escribe el doble como diámetro. Si da las áreas en m²,
            multiplícalas por 10.000 para pasarlas a cm².
          </p>

          <div className={styles.simLayout}>
            <div className={styles.dibujoCaja}>
              <svg viewBox="0 0 460 320" className={styles.dibujo} role="img" aria-label={descripcionPrensa}>
                {/* Líquido: dos cilindros unidos por el canal del fondo */}
                <rect x={X1 - w1 / 2} y={P_LIQ_SUP} width={w1} height={P_CANAL - P_LIQ_SUP} className={styles.svgAceite} />
                <rect x={X2 - w2 / 2} y={P_LIQ_SUP} width={w2} height={P_CANAL - P_LIQ_SUP} className={styles.svgAceite} />
                <rect x={X1 - w1 / 2} y={P_LIQ_INF} width={X2 + w2 / 2 - (X1 - w1 / 2)} height={P_CANAL - P_LIQ_INF} className={styles.svgAceite} />
                <path
                  d={`M ${X1 - w1 / 2} 60 L ${X1 - w1 / 2} ${P_CANAL} L ${X2 + w2 / 2} ${P_CANAL} L ${X2 + w2 / 2} 60
                      M ${X1 + w1 / 2} 60 L ${X1 + w1 / 2} ${P_LIQ_INF} L ${X2 - w2 / 2} ${P_LIQ_INF} L ${X2 - w2 / 2} 60`}
                  className={styles.svgRecipiente}
                  fill="none"
                  strokeWidth={3}
                  strokeLinejoin="round"
                />
                {/* Émbolos */}
                <rect x={X1 - w1 / 2 + 2} y={P_LIQ_SUP - 14} width={w1 - 4} height={14} rx={2} className={styles.svgEmbolo} />
                <rect x={X2 - w2 / 2 + 2} y={P_LIQ_SUP - 14} width={w2 - 4} height={14} rx={2} className={styles.svgEmbolo} />
                {prensa && (
                  <>
                    <FlechaVertical x={X1} desde={P_LIQ_SUP - 14 - largoFlecha(fuerza, fMaxPrensa)} hasta={P_LIQ_SUP - 16} clase={styles.svgFlechaEntrada} />
                    <FlechaVertical x={X2} desde={P_LIQ_SUP - 16} hasta={P_LIQ_SUP - 14 - largoFlecha(prensa.fuerzaSalida, fMaxPrensa)} clase={styles.svgFlechaSalida} />
                    <text x={X1} y={P_LIQ_SUP - 22 - largoFlecha(fuerza, fMaxPrensa)} textAnchor="middle" className={`${styles.svgEtiqueta} ${styles.svgEtiquetaEntrada}`}>
                      F₁ = {textoFuerza(fuerza)}
                    </text>
                    <text x={X2} y={P_LIQ_SUP - 22 - largoFlecha(prensa.fuerzaSalida, fMaxPrensa)} textAnchor="middle" className={`${styles.svgEtiqueta} ${styles.svgEtiquetaSalida}`}>
                      F₂ = {textoFuerza(prensa.fuerzaSalida)}
                    </text>
                    <text x={(X1 + X2) / 2} y={P_CANAL + 26} textAnchor="middle" className={styles.svgRotulo}>
                      P = {textoPresion(prensa.presion)} en todo el líquido
                    </text>
                    <text x={w1 < 70 ? X1 - w1 / 2 - 8 : X1} y={P_LIQ_SUP + 24} textAnchor={w1 < 70 ? 'end' : 'middle'} className={styles.svgRotuloSecundario}>
                      baja {textoLongitud(recorrido / 100)}
                    </text>
                    <text x={X2} y={P_LIQ_SUP + 24} textAnchor="middle" className={styles.svgRotuloSecundario}>
                      sube {textoLongitud(prensa.desplazamientoSalida)}
                    </text>
                  </>
                )}
                {!prensa && (
                  <text x={(X1 + X2) / 2} y={40} textAnchor="middle" className={styles.svgRotulo}>Faltan datos</text>
                )}
              </svg>
              <p className={styles.leyenda}>
                <span className={styles.leyendaEntrada}><span aria-hidden="true">↓</span> Fuerza aplicada F₁</span>
                <span className={styles.leyendaSalida}><span aria-hidden="true">↑</span> Fuerza obtenida F₂</span>
                <span>Flechas en escala logarítmica</span>
              </p>
            </div>

            <div className={styles.resultadosCaja}>
              <div role="status" aria-live="polite" className={styles.resultados}>
                {prensa ? (
                  <>
                    <div className={styles.destacado}>
                      <span className={styles.destacadoNombre}>Fuerza en el émbolo 2, F₂ = F₁·A₂/A₁</span>
                      <span className={styles.destacadoValor}>{textoFuerza(prensa.fuerzaSalida)}</span>
                      <span className={styles.destacadoSub}>
                        sostiene {formatoSignificativo(prensa.masaSostenida)} kg
                      </span>
                    </div>
                    <div className={styles.tarjetas}>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Multiplica la fuerza (A₂/A₁)</span>
                        <span className={styles.tarjetaValor}>×{formatoSignificativo(prensa.ventaja)}</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Presión transmitida P = F₁/A₁</span>
                        <span className={styles.tarjetaValor}>{textoPa(prensa.presion)}</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Área del émbolo 1</span>
                        <span className={styles.tarjetaValor}>{formatoSignificativo(area1Cm2 ?? 0)} cm²</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Área del émbolo 2</span>
                        <span className={styles.tarjetaValor}>{formatoSignificativo(area2Cm2 ?? 0)} cm²</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Sube el émbolo 2, x₂ = x₁·A₁/A₂</span>
                        <span className={styles.tarjetaValor}>{textoLongitud(prensa.desplazamientoSalida)}</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Trabajo F₁·x₁ = F₂·x₂</span>
                        <span className={styles.tarjetaValor}>{formatoSignificativo(prensa.trabajoEntrada)} J</span>
                      </div>
                    </div>
                    {prensa.ventaja < 1 && (
                      <p className={styles.aclaracion}>
                        El émbolo 2 es el pequeño: la prensa reduce la fuerza y alarga el recorrido.
                        Es el uso inverso, el de un elevador que necesita más carrera que fuerza.
                      </p>
                    )}
                  </>
                ) : (
                  <div className={styles.faltan}>
                    <strong>Faltan datos para calcular.</strong>
                    <p>Escribe {faltas2.join('; ')}.</p>
                  </div>
                )}
              </div>
              <div className={styles.formulaBox}>
                {prensa && area1Cm2 !== null && area2Cm2 !== null ? (
                  <>
                    {modoArea === 'diametro' && (
                      <p className={styles.formulaLinea}>
                        <code>A = π·d²/4 → A₁ = {formatoSignificativo(area1Cm2)} cm², A₂ = {formatoSignificativo(area2Cm2)} cm²</code>
                      </p>
                    )}
                    <p className={styles.formulaLinea}>
                      <code>F₂ = F₁·A₂/A₁ = {formatoSignificativo(fuerza)} · {formatoSignificativo(area2Cm2)}/{formatoSignificativo(area1Cm2)} = {textoFuerza(prensa.fuerzaSalida)}</code>
                    </p>
                    <p className={styles.formulaLinea}>
                      <code>x₂ = x₁·A₁/A₂ = {formatoSignificativo(recorrido)} cm/{formatoSignificativo(prensa.ventaja)} = {textoLongitud(prensa.desplazamientoSalida)}</code>
                    </p>
                    <p className={styles.formulaLinea}>
                      <code>m = F₂/g = {formatoSignificativo(prensa.fuerzaSalida)}/{formatNumber(G, 2)} = {formatoSignificativo(prensa.masaSostenida)} kg</code>
                    </p>
                  </>
                ) : (
                  <>Con los datos de los dos émbolos aparecen aquí las fórmulas con tus números.</>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══ 3 · Tubo en U ═══════════════════════════════════════════════════ */}
        <section className={styles.panel} aria-labelledby="titulo-parte3">
          <h2 id="titulo-parte3" className={styles.panelTitulo}>3. Tubo en U con dos líquidos (vasos comunicantes)</h2>
          <p className={styles.panelIntro}>
            Un tubo en U con un líquido en el fondo y otro, que no se mezcla, vertido en una rama.
            A la altura de la separación las presiones de las dos ramas son iguales:{' '}
            <strong>ρ_A·h_A = ρ_B·h_B</strong>.
          </p>

          <SelectorLiquido
            idGrupo="titulo-fondo"
            titulo="Líquido del fondo del tubo (A)"
            seleccion={fondoId}
            onSeleccion={setFondoId}
            densidadOtra={fondoOtra}
            onDensidadOtra={setFondoOtra}
          />
          <SelectorLiquido
            idGrupo="titulo-anadido"
            titulo="Líquido añadido en la rama derecha (B)"
            seleccion={anadidoId}
            onSeleccion={setAnadidoId}
            densidadOtra={anadidoOtra}
            onDensidadOtra={setAnadidoOtra}
          />
          <div className={styles.entradaOtra}>
            <NumberInput
              label="Altura de la columna de B (h_B)"
              value={alturaAnadidoTexto}
              onChange={setAlturaAnadidoTexto}
              min={0}
              suffix="cm"
              placeholder="10"
              helperText="Medida desde la superficie de separación hasta la superficie de B"
            />
          </div>

          <div className={styles.simLayout}>
            <div className={styles.dibujoCaja}>
              <svg viewBox="0 0 420 400" className={styles.dibujo} role="img" aria-label={descripcionTubo}>
                {/* Líquido A: rama izquierda, codo y rama derecha hasta la separación */}
                <rect x={U_IZQ} y={ySupFondo} width={U_ANCHO} height={U_CODO - ySupFondo} fill={fondo.color} fillOpacity={0.75} />
                <rect x={U_IZQ} y={U_CODO} width={U_DER + U_ANCHO - U_IZQ} height={40} fill={fondo.color} fillOpacity={0.75} />
                <rect x={U_DER} y={tubo ? U_SEP : ySupFondo} width={U_ANCHO} height={U_CODO - (tubo ? U_SEP : ySupFondo)} fill={fondo.color} fillOpacity={0.75} />
                {/* Líquido B encima de la separación */}
                {tubo && (
                  <rect x={U_DER} y={ySupAnadido} width={U_ANCHO} height={U_SEP - ySupAnadido} fill={anadido.color} fillOpacity={0.75} />
                )}
                {/* Tubo */}
                <path
                  d={`M ${U_IZQ} 40 L ${U_IZQ} ${U_CODO + 40} L ${U_DER + U_ANCHO} ${U_CODO + 40} L ${U_DER + U_ANCHO} 40
                      M ${U_IZQ + U_ANCHO} 40 L ${U_IZQ + U_ANCHO} ${U_CODO} L ${U_DER} ${U_CODO} L ${U_DER} 40`}
                  className={styles.svgRecipiente}
                  fill="none"
                  strokeWidth={3}
                  strokeLinejoin="round"
                />
                {tubo && (
                  <>
                    {/* Separación y misma presión a ese nivel en las dos ramas */}
                    <line x1={U_IZQ - 8} y1={U_SEP} x2={U_DER + U_ANCHO + 8} y2={U_SEP} className={styles.svgCota} strokeWidth={1.5} strokeDasharray="5 4" />
                    <text x={(U_IZQ + U_ANCHO + U_DER) / 2} y={U_SEP - 6} textAnchor="middle" className={styles.svgRotuloSecundario}>misma presión</text>
                    {/* Cotas */}
                    <Cota x={U_IZQ - 18} y1={ySupFondo} y2={U_SEP} texto={`h_A = ${formatoSignificativo(tubo.alturaFondo * 100)} cm`} lado="izq" claseLinea={styles.svgRegla} claseTexto={styles.svgEtiqueta} />
                    <Cota x={U_DER + U_ANCHO + 18} y1={ySupAnadido} y2={U_SEP} texto={`h_B = ${formatoSignificativo(alturaAnadidoCm)} cm`} lado="der" claseLinea={styles.svgRegla} claseTexto={styles.svgEtiqueta} />
                    {/* Desnivel */}
                    <line x1={U_IZQ} y1={ySupFondo} x2={U_DER + U_ANCHO} y2={ySupFondo} className={styles.svgCota} strokeWidth={1} strokeDasharray="2 3" />
                  </>
                )}
                <text x={U_IZQ} y={390} className={styles.svgRotuloSecundario}>A: {fondo.nombre}</text>
                {tubo && <text x={U_DER + U_ANCHO} y={30} textAnchor="end" className={styles.svgRotuloSecundario}>B: {anadido.nombre}</text>}
              </svg>
            </div>

            <div className={styles.resultadosCaja}>
              <div role="status" aria-live="polite" className={styles.resultados}>
                {tubo ? (
                  <>
                    <div className={styles.destacado}>
                      <span className={styles.destacadoNombre}>Altura de A en la otra rama, h_A = ρ_B·h_B/ρ_A</span>
                      <span className={styles.destacadoValor}>{formatoSignificativo(tubo.alturaFondo * 100)} cm</span>
                    </div>
                    <div className={styles.tarjetas}>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Desnivel entre superficies h_B − h_A</span>
                        <span className={styles.tarjetaValor}>{formatoSignificativo(tubo.desnivel * 100)} cm</span>
                      </div>
                      <div className={styles.tarjeta}>
                        <span className={styles.tarjetaNombre}>Presión de cada columna en la separación</span>
                        <span className={styles.tarjetaValor}>{textoPa(tubo.presionSeparacion)}</span>
                      </div>
                    </div>
                    <p className={styles.aclaracion}>
                      La superficie de B queda más alta porque B es menos denso: hace falta más
                      columna de B para pesar lo mismo que la de A.
                    </p>
                  </>
                ) : caso === 'mismo-liquido' ? (
                  <div className={styles.faltan}>
                    <strong>Es el mismo líquido en las dos ramas.</strong>
                    <p>
                      No hay superficie de separación: es un vaso comunicante simple y las dos
                      superficies quedan a la misma altura. Elige dos líquidos distintos.
                    </p>
                  </div>
                ) : caso === 'anadido-mas-denso' && esPositivo(alturaAnadidoCm) ? (
                  <div className={styles.faltan}>
                    <strong>El líquido añadido es más denso que el del fondo.</strong>
                    <p>
                      No se quedaría encima: bajaría al codo del tubo y empujaría al otro hacia
                      arriba. Intercambia los dos líquidos para plantear el problema.
                    </p>
                  </div>
                ) : (
                  <div className={styles.faltan}>
                    <strong>Faltan datos para calcular.</strong>
                    <p>Escribe {faltas3.join('; ')}.</p>
                  </div>
                )}
              </div>
              <div className={styles.formulaBox}>
                {tubo ? (
                  <>
                    <p className={styles.formulaLinea}>
                      <code>ρ_A·g·h_A = ρ_B·g·h_B</code> (g se simplifica)
                    </p>
                    <p className={styles.formulaLinea}>
                      <code>h_A = {formatNumber(anadido.densidad, 0)} · {formatoSignificativo(alturaAnadidoCm)}/{formatNumber(fondo.densidad, 0)} = {formatoSignificativo(tubo.alturaFondo * 100)} cm</code>
                    </p>
                  </>
                ) : (
                  <>Con dos líquidos y la altura de B aparecen aquí las fórmulas con tus números.</>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tarea de aula (skill /casos-aula-meskeia): tras los controles y FUERA de
            EducationalSection, que nace colapsada. */}
        <CasosAula />

        {/* ── Sección educativa v2.0 ──────────────────────────────────────── */}
        <EducationalSection
          title="Aprende sobre la presión en los líquidos"
          subtitle="Hidrostática, principio de Pascal y vasos comunicantes"
          icon="🛢️"
        >
          <p className={styles.eduIntro}>
            Un líquido en reposo empuja en todas direcciones sobre cualquier superficie que toque.
            Esa <strong>presión</strong> (fuerza por unidad de área, en pascales: 1 Pa = 1 N/m²)
            crece con la profundidad según <em>P = P₀ + ρ·g·h</em>. Blaise Pascal describió en el
            siglo XVII que un aumento de presión aplicado a un líquido encerrado se transmite
            íntegro a todos sus puntos, y de ahí salen la prensa hidráulica, los frenos de un coche
            y el gato del taller.
          </p>

          {/* 1 · Tabla comparativa */}
          <h3 className={styles.eduSubtitle}>Los tres problemas, comparados</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Problema</th>
                  <th scope="col">Ecuación</th>
                  <th scope="col">Qué se conserva o se iguala</th>
                  <th scope="col">Ejemplo</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Presión a una profundidad</td><td>P = P₀ + ρ·g·h</td><td>Nada: crece con h</td><td>Agua dulce a 10 m: 1,97 atm</td></tr>
                <tr><td>Prensa hidráulica</td><td>F₁/A₁ = F₂/A₂</td><td>La presión y el trabajo</td><td>100 N con émbolos de 2 y 20 cm de diámetro: 10.000 N</td></tr>
                <tr><td>Tubo en U</td><td>ρ_A·h_A = ρ_B·h_B</td><td>La presión a la altura de la separación</td><td>10 cm de aceite equilibran 9,2 cm de agua</td></tr>
                <tr><td>Barómetro de mercurio</td><td>P₀ = ρ_Hg·g·h</td><td>La atmósfera sostiene la columna</td><td>1 atm sostiene unos 76 cm de mercurio</td></tr>
              </tbody>
            </table>
          </div>
          <p className={styles.fuente}>
            Las densidades de los botones son valores típicos a temperatura ambiente, los mismos
            del simulador de flotabilidad (referencia: <em>CRC Handbook of Chemistry and Physics</em>,
            redondeados). La atmósfera estándar, 101.325 Pa, es un valor exacto por definición.
          </p>

          {/* 2 · Casos de uso */}
          <h3 className={styles.eduSubtitle}>Dónde aparece la presión hidrostática</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎒</span>
              <h4>Estudiante de secundaria o preparatoria</h4>
              <p>
                Resuelve el problema en papel y comprueba cada cifra aquí. Usa «Otra densidad» si
                el enunciado da un líquido que no está en los botones.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🤿</span>
              <h4>Buceo</h4>
              <p>
                Cada 10,3 m de agua dulce (unos 10 m de mar) se suma una atmósfera. A 30 m un
                buceador soporta unas 4 atm, y por eso el aire del regulador se le entrega a esa
                presión.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🚗</span>
              <h4>Frenos y gato hidráulico</h4>
              <p>
                El pedal empuja un émbolo pequeño y el líquido de frenos transmite la presión a
                émbolos mayores junto a las ruedas. El gato del taller levanta un coche con la
                fuerza de un brazo.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🏗️</span>
              <h4>Presas y depósitos</h4>
              <p>
                El muro de una presa es más grueso en la base porque la presión del agua crece con
                la profundidad. Un depósito en lo alto de un edificio da presión a los grifos de
                abajo.
              </p>
            </div>
          </div>

          {/* 3 · FAQ */}
          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿La presión depende de la forma del recipiente?</strong>
              <p>
                No. A la misma profundidad la presión es la misma en un vaso estrecho que en un
                lago: solo cuentan la densidad del líquido y la profundidad. Se conoce como
                paradoja hidrostática, porque el peso total del líquido sí es muy distinto.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre presión absoluta y manométrica?</strong>
              <p>
                La manométrica es la que añade el líquido, ρ·g·h, la que marca un manómetro
                calibrado a cero en el aire. La absoluta le suma la atmósfera: P₀ + ρ·g·h. Un
                problema que pide «la presión que soporta un buzo» suele querer la absoluta.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si el enunciado dice «presión debida al agua» o
                «presión hidrostática», es solo ρ·g·h.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿La prensa hidráulica crea energía?</strong>
              <p>
                No. Multiplica la fuerza, pero el émbolo grande se desplaza mucho menos: el volumen
                que baja en un lado es el que sube en el otro. El trabajo F·x es el mismo en los
                dos émbolos, como en una palanca.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el barómetro de Torricelli usa mercurio?</strong>
              <p>
                Porque es muy denso (13.534 kg/m³) y la atmósfera sostiene una columna de solo unos
                76 cm. Con agua harían falta más de 10 m de tubo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿En el tubo en U por qué no quedan las dos superficies a la misma altura?</strong>
              <p>
                Porque las columnas de encima de la separación son de líquidos distintos. Para
                ejercer la misma presión, el menos denso necesita más altura. Con un solo líquido sí
                quedan igualadas: son vasos comunicantes.
              </p>
            </div>
          </div>

          {/* 4 · Guía paso a paso */}
          <h3 className={styles.eduSubtitle}>Cómo resolver un problema de presión, paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Pasa todo al SI</strong>
                <p>Densidad en kg/m³ (1 g/cm³ = 1000 kg/m³), profundidad en m, áreas en m² (1 cm² = 10⁻⁴ m²).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Decide qué presión piden</strong>
                <p>Solo la del líquido (ρ·g·h) o la absoluta (sumando P₀). Lee el enunciado dos veces.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>En una prensa, iguala presiones</strong>
                <p>F₁/A₁ = F₂/A₂. Si te dan diámetros, el cociente de áreas es el cuadrado del cociente de diámetros.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>En un tubo en U, iguala en la separación</strong>
                <p>Toma como referencia la superficie entre los dos líquidos y mide las dos alturas desde ahí.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Comprueba el orden de magnitud</strong>
                <p>Unos 10 m de agua equivalen a una atmósfera. Si te sale mucho más o mucho menos, revisa las unidades.</p>
              </div>
            </div>
          </div>

          {/* 5 · Consejos */}
          <h3 className={styles.eduSubtitle}>Consejos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Diámetro al cuadrado</strong>
                <p>Si un émbolo tiene el doble de diámetro, su área es cuatro veces mayor. Es el error más común en la prensa.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔟</span>
              <div>
                <strong>La regla de los 10 metros</strong>
                <p>Una atmósfera por cada 10,3 m de agua dulce. Sirve para comprobar cualquier resultado de cabeza.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <div>
                <strong>En el tubo en U, g se va</strong>
                <p>ρ_A·g·h_A = ρ_B·g·h_B: la gravedad aparece a los dos lados y se simplifica. Las alturas pueden quedar en cm.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✏️</span>
              <div>
                <strong>Dibuja la línea de igual presión</strong>
                <p>En un mismo líquido continuo, dos puntos a la misma altura tienen la misma presión. Ahí se plantea la ecuación.</p>
              </div>
            </div>
          </div>

          {/* 6 · Errores típicos */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores típicos con la presión en los líquidos
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Olvidar la atmósfera o sumarla de más:</strong> la absoluta incluye P₀; la
                hidrostática, no.
              </li>
              <li>
                <strong>Usar el diámetro como si fuera el área:</strong> A = π·d²/4. Con los diámetros
                directamente, la ventaja de una prensa sale la raíz de la real.
              </li>
              <li>
                <strong>Medir la profundidad desde el fondo:</strong> h se cuenta desde la superficie
                libre del líquido hacia abajo.
              </li>
              <li>
                <strong>Pensar que la prensa da energía gratis:</strong> la fuerza se multiplica, pero
                el recorrido se divide en la misma proporción.
              </li>
              <li>
                <strong>En el tubo en U, medir las alturas desde el codo:</strong> se miden desde la
                superficie de separación de los dos líquidos.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-principio-pascal')} />
        <ShareCard appName="simulador-principio-pascal" />
      </main>

      <Footer appName="simulador-principio-pascal" />
    </div>
  );
}

// ─── Piezas del dibujo ───────────────────────────────────────────────────────

interface FlechaVerticalProps {
  x: number;
  desde: number;
  hasta: number;
  clase: string;
}

/** Flecha vertical de `desde` a `hasta` (y del SVG). Sin longitud, no se dibuja. */
function FlechaVertical({ x, desde, hasta, clase }: FlechaVerticalProps) {
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

interface CotaProps {
  x: number;
  y1: number;
  y2: number;
  texto: string;
  lado: 'izq' | 'der';
  claseLinea: string;
  claseTexto: string;
}

/** Cota vertical con topes y su rótulo al lado. */
function Cota({ x, y1, y2, texto, lado, claseLinea, claseTexto }: CotaProps) {
  const medio = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x} y1={y1} x2={x} y2={y2} className={claseLinea} strokeWidth={1.5} />
      <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} className={claseLinea} strokeWidth={1.5} />
      <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} className={claseLinea} strokeWidth={1.5} />
      <text
        x={lado === 'izq' ? x - 8 : x + 8}
        y={medio + 4}
        textAnchor={lado === 'izq' ? 'end' : 'start'}
        className={claseTexto}
      >
        {texto}
      </text>
    </g>
  );
}
