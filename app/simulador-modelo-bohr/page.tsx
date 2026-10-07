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
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorModeloBohr.module.css';
import {
  ENERGIA_IONIZACION_EV,
  R_HIDROGENO,
  NIVEL_MAXIMO,
  energiaNivel,
  radioOrbitaNm,
  energiaIonizacionDesde,
  serieDeNivel,
  calcularTransicion,
  lineasDeSerie,
  type ResultadoTransicion,
} from './motor';
import { VISIBLE_MIN_NM, VISIBLE_MAX_NM, type RegionEspectro } from '../simulador-efecto-fotoelectrico/motor';
import { colorDeLambda, nombreDeLambda } from '../simulador-efecto-fotoelectrico/color';
import CasosAula from './CasosAula';

// ─── Formato ─────────────────────────────────────────────────────────────────

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
 * Notación científica en formato español («4,567 × 10¹⁴»), con el exponente fijado DESPUÉS de
 * redondear la mantisa (mismo criterio que simulador-efecto-fotoelectrico).
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

function formatoSignificativo(valor: number, cifras = 4): string {
  return new Intl.NumberFormat('es-ES', { maximumSignificantDigits: cifras }).format(valor);
}

/** «3», «7» o «∞». */
function textoNivel(n: number): string {
  return n === Infinity ? '∞' : String(n);
}

function textoEnergia(ev: number): string {
  // −0 no existe en el motor (E∞ = 0 explícito); el signo menos es el tipográfico
  return `${ev < 0 ? '−' : ''}${formatNumber(Math.abs(ev), ev === 0 ? 0 : 3)} eV`;
}

const NOMBRE_REGION: Record<RegionEspectro, string> = {
  ultravioleta: 'Ultravioleta',
  visible: 'Visible',
  infrarrojo: 'Infrarrojo',
};

// ─── Niveles y atajos ────────────────────────────────────────────────────────

const NIVELES: number[] = [...Array.from({ length: NIVEL_MAXIMO }, (_, i) => i + 1), Infinity];

interface Atajo {
  id: string;
  nombre: string;
  nInicial: number;
  nFinal: number;
}

const ATAJOS: Atajo[] = [
  { id: 'h-alfa', nombre: 'Hα, roja (3 → 2)', nInicial: 3, nFinal: 2 },
  { id: 'h-beta', nombre: 'Hβ (4 → 2)', nInicial: 4, nFinal: 2 },
  { id: 'lyman-alfa', nombre: 'Lyman α (2 → 1)', nInicial: 2, nFinal: 1 },
  { id: 'paschen-alfa', nombre: 'Paschen α (4 → 3)', nInicial: 4, nFinal: 3 },
  { id: 'ionizar', nombre: 'Ionizar desde n = 1 (1 → ∞)', nInicial: 1, nFinal: Infinity },
];

/** Valores del libro de texto, para comparar con los del motor. */
const R_LIBRO = 1.097e7;

// ─── Diagrama de niveles ─────────────────────────────────────────────────────

const N_Y_CERO = 50;
const N_Y_FUNDAMENTAL = 430;
const N_X_IZQ = 110;
const N_X_DER = 320;
const N_X_FLECHA = 200;

/** y del SVG para una energía (eV): lineal, con E = 0 arriba y E₁ abajo. */
function yDeEnergia(ev: number): number {
  return N_Y_CERO + (ev / -ENERGIA_IONIZACION_EV) * (N_Y_FUNDAMENTAL - N_Y_CERO);
}

/** Onda del fotón: senoide horizontal de `x0` a `x1` a la altura `y`. */
function caminoOnda(x0: number, x1: number, y: number): string {
  const pasos = 48;
  const amplitud = 6;
  const ciclos = 4;
  let d = `M ${x0} ${y}`;
  for (let k = 1; k <= pasos; k++) {
    const t = k / pasos;
    const x = x0 + (x1 - x0) * t;
    d += ` L ${x.toFixed(1)} ${(y + amplitud * Math.sin(2 * Math.PI * ciclos * t)).toFixed(1)}`;
  }
  return d;
}

// ─── Tira del espectro visible ───────────────────────────────────────────────

const E_X0 = 30;
const E_X1 = 890;

function xDeLambda(nm: number): number {
  return E_X0 + ((nm - VISIBLE_MIN_NM) / (VISIBLE_MAX_NM - VISIBLE_MIN_NM)) * (E_X1 - E_X0);
}

/**
 * Las líneas de Balmer que caen en el visible (las únicas del hidrógeno que se ven). Se piden
 * de sobra y se filtran: con el límite de 380 nm entran de la 3 → 2 a la 9 → 2 (383,5 nm), más
 * allá de los niveles que la app deja elegir.
 */
const LINEAS_VISIBLES = lineasDeSerie(2, 12).filter(
  (l) => l.nSuperior !== Infinity && l.region === 'visible',
);

// ─── Componente principal ────────────────────────────────────────────────────

export default function SimuladorModeloBohrPage() {
  const [nInicial, setNInicial] = useState(3);
  const [nFinal, setNFinal] = useState(2);

  const t: ResultadoTransicion | null = useMemo(() => calcularTransicion(nInicial, nFinal), [nInicial, nFinal]);
  const eInicial = energiaNivel(nInicial);
  const eFinal = energiaNivel(nFinal);
  const lineasSerie = t ? lineasDeSerie(t.nInferior, 5) : [];
  const colorLinea = t ? colorDeLambda(t.lambdaNm) : 'currentColor';
  // Lo que daría la cuenta con el R redondo del libro
  const lambdaLibro = t ? 1e9 / (R_LIBRO * (t.numeroOnda / R_HIDROGENO)) : null;

  const descripcionDiagrama = t
    ? `Diagrama de niveles de energía del hidrógeno. El electrón ${t.sentido === 'emision' ? 'baja' : 'sube'} del nivel ${textoNivel(nInicial)} (${textoEnergia(eInicial ?? 0)}) al ${textoNivel(nFinal)} (${textoEnergia(eFinal ?? 0)}) y ${t.sentido === 'emision' ? 'emite' : 'absorbe'} un fotón de ${formatNumber(t.energiaFotonEV, 3)} eV y ${formatoSignificativo(t.lambdaNm, 5)} nm${t.region === 'visible' ? `, de color ${nombreDeLambda(t.lambdaNm)}` : `, ${NOMBRE_REGION[t.region].toLowerCase()}`}.`
    : `Diagrama de niveles de energía del hidrógeno, sin salto: el nivel de partida y el de llegada son el mismo (${textoNivel(nInicial)}).`;

  const actualVisible = t !== null && t.region === 'visible';
  const descripcionEspectro = `Espectro visible de ${t?.sentido === 'absorcion' ? 'absorción' : 'emisión'} del hidrógeno, de 380 a 750 nm, con las ${LINEAS_VISIBLES.length} líneas de Balmer que caen en él.${
    t ? (actualVisible ? ` La línea del salto elegido, ${formatoSignificativo(t.lambdaNm, 5)} nm, está marcada.` : ` La línea del salto elegido no está aquí: es ${NOMBRE_REGION[t.region].toLowerCase()}.`) : ''
  }`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">⚛️</span> Simulador del Modelo Atómico de Bohr</h1>
        <p className={styles.subtitle}>
          Elige el salto del electrón entre dos niveles del átomo de hidrógeno y calcula la
          energía, la longitud de onda y el color del fotón: series de Lyman, Balmer y Paschen
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ── Controles ───────────────────────────────────────────────────── */}
        <section className={styles.panel} aria-labelledby="titulo-salto">
          <h2 id="titulo-salto" className={styles.panelTitulo}>El salto del electrón</h2>

          <div className={styles.grupo} role="group" aria-labelledby="titulo-atajos">
            <h3 id="titulo-atajos" className={styles.grupoTitulo}>Líneas conocidas</h3>
            <div className={styles.presets}>
              {ATAJOS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={styles.preset}
                  aria-pressed={nInicial === a.nInicial && nFinal === a.nFinal}
                  onClick={() => {
                    setNInicial(a.nInicial);
                    setNFinal(a.nFinal);
                  }}
                >
                  {a.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.dosGrupos}>
            <div className={styles.grupo} role="group" aria-labelledby="titulo-inicial">
              <h3 id="titulo-inicial" className={styles.grupoTitulo}>Nivel de partida (n<sub>i</sub>)</h3>
              <div className={styles.niveles}>
                {NIVELES.map((n) => (
                  <button
                    key={`i-${n}`}
                    type="button"
                    className={styles.nivelBoton}
                    aria-pressed={nInicial === n}
                    aria-label={n === Infinity ? 'Nivel infinito: electrón libre' : `Nivel ${n}`}
                    onClick={() => setNInicial(n)}
                  >
                    {textoNivel(n)}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.grupo} role="group" aria-labelledby="titulo-final">
              <h3 id="titulo-final" className={styles.grupoTitulo}>Nivel de llegada (n<sub>f</sub>)</h3>
              <div className={styles.niveles}>
                {NIVELES.map((n) => (
                  <button
                    key={`f-${n}`}
                    type="button"
                    className={styles.nivelBoton}
                    aria-pressed={nFinal === n}
                    aria-label={n === Infinity ? 'Nivel infinito: electrón libre' : `Nivel ${n}`}
                    onClick={() => setNFinal(n)}
                  >
                    {textoNivel(n)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className={styles.nota}>
            Si el electrón baja de nivel emite un fotón (línea de emisión); si sube, tiene que
            absorberlo (línea de absorción). El nivel ∞ es el electrón libre: subir hasta él es
            ionizar el átomo.
          </p>
        </section>

        {/* ── Diagrama + resultados ───────────────────────────────────────── */}
        <div className={styles.simLayout}>
          <div className={styles.dibujoCaja}>
            <svg viewBox="0 0 460 470" className={styles.dibujo} role="img" aria-label={descripcionDiagrama}>
              {/* Eje de energía */}
              <line x1={N_X_IZQ - 20} y1={N_Y_CERO - 20} x2={N_X_IZQ - 20} y2={N_Y_FUNDAMENTAL + 10} className={styles.svgEje} strokeWidth={1.5} />
              <text x={N_X_IZQ - 26} y={N_Y_CERO - 26} className={styles.svgRotuloSecundario}>E (eV)</text>

              {NIVELES.map((n) => {
                const e = energiaNivel(n) ?? 0;
                const y = yDeEnergia(e);
                const marcado = n === nInicial || n === nFinal;
                // Del 5 en adelante los niveles se apiñan bajo el 0: a la derecha se rotulan juntos con
                // el ∞ (que se distingue por ir discontinuo); a la izquierda, el ∞ conserva su 0 eV
                const rotularNivel = n <= 4;
                const rotularEnergia = n <= 4 || n === Infinity;
                return (
                  <g key={`nivel-${n}`}>
                    <line
                      x1={N_X_IZQ}
                      y1={y}
                      x2={N_X_DER}
                      y2={y}
                      className={marcado ? styles.svgNivelMarcado : styles.svgNivel}
                      strokeWidth={marcado ? 3 : 1.5}
                      strokeDasharray={n === Infinity ? '6 4' : undefined}
                    />
                    {rotularNivel && (
                      <text x={N_X_DER + 8} y={y + 4} className={marcado ? styles.svgEtiqueta : styles.svgRotulo}>
                        n = {textoNivel(n)}
                      </text>
                    )}
                    {rotularEnergia && (
                      <text x={N_X_IZQ - 26} y={y + 4} textAnchor="end" className={styles.svgRotuloSecundario}>
                        {textoEnergia(e)}
                      </text>
                    )}
                  </g>
                );
              })}
              <text x={N_X_DER + 8} y={yDeEnergia(energiaNivel(6) ?? 0) + 4} className={nInicial >= 5 || nFinal >= 5 ? styles.svgEtiqueta : styles.svgRotuloSecundario}>
                n = 5, 6, 7… ∞
              </text>

              {t && eInicial !== null && eFinal !== null && (
                <g>
                  <FlechaVertical
                    x={N_X_FLECHA}
                    desde={yDeEnergia(eInicial)}
                    hasta={yDeEnergia(eFinal)}
                    color={colorLinea}
                    claseHalo={styles.svgHalo}
                  />
                  {/* Fotón: sale hacia la derecha si se emite, llega desde la derecha si se absorbe */}
                  <path
                    d={caminoOnda(N_X_FLECHA + 10, N_X_FLECHA + 110, (yDeEnergia(eInicial) + yDeEnergia(eFinal)) / 2)}
                    stroke={colorLinea}
                    strokeWidth={3}
                    fill="none"
                    className={styles.svgFoton}
                  />
                  <text
                    x={N_X_FLECHA + 60}
                    y={(yDeEnergia(eInicial) + yDeEnergia(eFinal)) / 2 - 14}
                    textAnchor="middle"
                    className={styles.svgEtiqueta}
                  >
                    {t.sentido === 'emision' ? 'fotón emitido →' : '← fotón absorbido'}
                  </text>
                </g>
              )}
            </svg>
            <p className={styles.leyenda}>
              Energías a escala. Los niveles altos se apiñan bajo el 0: su energía ya es casi la
              del electrón libre.
            </p>
          </div>

          <div className={styles.resultadosCaja}>
            <div role="status" aria-live="polite" className={styles.resultados}>
              {t ? (
                <>
                  <div className={styles.destacado}>
                    <span className={styles.destacadoNombre}>
                      {t.sentido === 'emision' ? 'Fotón emitido' : 'Fotón absorbido'} · {t.serie ? `serie de ${t.serie}` : 'serie sin nombre propio'}
                      {t.esLimite ? ' (límite de la serie)' : ''}
                    </span>
                    <span className={styles.destacadoValor}>
                      <span className={styles.muestraLinea} style={{ background: colorLinea }} aria-hidden="true" />
                      λ = {formatoSignificativo(t.lambdaNm, 5)} nm
                    </span>
                    <span className={styles.destacadoSub}>
                      {t.region === 'visible' ? `Visible, ${nombreDeLambda(t.lambdaNm)}` : `${NOMBRE_REGION[t.region]}: no lo ve el ojo`}
                    </span>
                  </div>

                  <div className={styles.tarjetas}>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Energía del fotón ΔE</span>
                      <span className={styles.tarjetaValor}>{formatNumber(t.energiaFotonEV, 3)} eV</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>En julios</span>
                      <span className={styles.tarjetaValor}>{formatCientifico(t.energiaFotonJ)} J</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Frecuencia f = c/λ</span>
                      <span className={styles.tarjetaValor}>{formatCientifico(t.frecuencia)} Hz</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Número de onda 1/λ</span>
                      <span className={styles.tarjetaValor}>{formatCientifico(t.numeroOnda)} m⁻¹</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Energía del nivel {textoNivel(nInicial)}</span>
                      <span className={styles.tarjetaValor}>{textoEnergia(eInicial ?? 0)}</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaNombre}>Energía del nivel {textoNivel(nFinal)}</span>
                      <span className={styles.tarjetaValor}>{textoEnergia(eFinal ?? 0)}</span>
                    </div>
                    {[nInicial, nFinal].filter((n) => n !== Infinity).map((n) => (
                      <div className={styles.tarjeta} key={`r-${n}`}>
                        <span className={styles.tarjetaNombre}>Radio de la órbita {n} (n²·a₀)</span>
                        <span className={styles.tarjetaValor}>{formatNumber(radioOrbitaNm(n) ?? 0, 4)} nm</span>
                      </div>
                    ))}
                  </div>
                  {t.esLimite && t.sentido === 'absorcion' && (
                    <p className={styles.aclaracion}>
                      Subir hasta ∞ es arrancar el electrón: {formatNumber(energiaIonizacionDesde(t.nInferior) ?? 0, 3)} eV
                      es la energía de ionización desde el nivel {t.nInferior}. Cualquier fotón con
                      más energía también lo ioniza; el sobrante se lo lleva el electrón como energía
                      cinética.
                    </p>
                  )}
                </>
              ) : (
                <div className={styles.faltan}>
                  <strong>No hay salto.</strong>
                  <p>El nivel de partida y el de llegada son el mismo: elige dos niveles distintos.</p>
                </div>
              )}
            </div>

            <div className={styles.formulaBox}>
              {t && eInicial !== null && eFinal !== null ? (
                <>
                  <p className={styles.formulaLinea}>
                    <code>Eₙ = −{formatNumber(ENERGIA_IONIZACION_EV, 3)}/n² eV</code>
                  </p>
                  <p className={styles.formulaLinea}>
                    <code>
                      ΔE = |E_{textoNivel(nFinal)} − E_{textoNivel(nInicial)}| = |{textoEnergia(eFinal)} − ({textoEnergia(eInicial)})| = {formatNumber(t.energiaFotonEV, 3)} eV
                    </code>
                  </p>
                  <p className={styles.formulaLinea}>
                    <code>
                      1/λ = R_H·(1/{textoNivel(t.nInferior)}² − 1/{textoNivel(t.nSuperior)}²) = {formatCientifico(t.numeroOnda)} m⁻¹
                    </code>
                  </p>
                  <p className={styles.formulaLinea}>
                    <code>λ = {formatoSignificativo(t.lambdaNm, 5)} nm</code>
                    {lambdaLibro !== null && (
                      <> · con R = 1,097·10⁷ m⁻¹ del libro sale {formatoSignificativo(lambdaLibro, 4)} nm</>
                    )}
                  </p>
                </>
              ) : (
                <>Con dos niveles distintos aparecen aquí las fórmulas con sus números.</>
              )}
            </div>
          </div>
        </div>

        {/* ── Espectro visible ────────────────────────────────────────────── */}
        <section className={styles.panel} aria-labelledby="titulo-espectro">
          <h2 id="titulo-espectro" className={styles.panelTitulo}>
            Espectro visible del hidrógeno ({t?.sentido === 'absorcion' ? 'absorción' : 'emisión'})
          </h2>
          <svg viewBox="0 0 920 120" className={styles.dibujo} role="img" aria-label={descripcionEspectro}>
            <defs>
              <linearGradient id="grad-visible" x1="0" y1="0" x2="1" y2="0">
                {Array.from({ length: 38 }, (_, k) => VISIBLE_MIN_NM + k * 10).map((l) => (
                  <stop key={l} offset={`${((l - VISIBLE_MIN_NM) / (VISIBLE_MAX_NM - VISIBLE_MIN_NM)) * 100}%`} stopColor={colorDeLambda(Math.min(l, VISIBLE_MAX_NM))} />
                ))}
              </linearGradient>
            </defs>
            {/* Emisión: fondo negro con líneas de color. Absorción: arcoíris con líneas negras */}
            <rect x={E_X0} y={30} width={E_X1 - E_X0} height={50} fill={t?.sentido === 'absorcion' ? 'url(#grad-visible)' : '#000'} />
            {LINEAS_VISIBLES.map((l) => (
              <line
                key={l.nSuperior}
                x1={xDeLambda(l.lambdaNm)}
                y1={30}
                x2={xDeLambda(l.lambdaNm)}
                y2={80}
                stroke={t?.sentido === 'absorcion' ? '#000' : colorDeLambda(l.lambdaNm)}
                strokeWidth={3}
              />
            ))}
            {actualVisible && t && (
              <g>
                <polygon
                  points={`${xDeLambda(t.lambdaNm)},28 ${xDeLambda(t.lambdaNm) - 7},14 ${xDeLambda(t.lambdaNm) + 7},14`}
                  className={styles.svgMarcador}
                />
                <text x={xDeLambda(t.lambdaNm)} y={10} textAnchor="middle" className={styles.svgEtiqueta}>
                  {formatoSignificativo(t.lambdaNm, 4)} nm
                </text>
              </g>
            )}
            {t && !actualVisible && (
              <text
                x={t.region === 'ultravioleta' ? E_X0 : E_X1}
                y={20}
                textAnchor={t.region === 'ultravioleta' ? 'start' : 'end'}
                className={styles.svgEtiqueta}
              >
                {t.region === 'ultravioleta' ? `← ${formatoSignificativo(t.lambdaNm, 4)} nm, ultravioleta` : `${formatoSignificativo(t.lambdaNm, 4)} nm, infrarrojo →`}
              </text>
            )}
            {[400, 500, 600, 700].map((nm) => (
              <g key={nm}>
                <line x1={xDeLambda(nm)} y1={80} x2={xDeLambda(nm)} y2={86} className={styles.svgEje} strokeWidth={1} />
                <text x={xDeLambda(nm)} y={100} textAnchor="middle" className={styles.svgRotuloSecundario}>{nm} nm</text>
              </g>
            ))}
          </svg>
          <p className={styles.nota}>
            Todas las líneas visibles del hidrógeno son de la serie de Balmer, las que bajan al nivel
            2. Las cuatro primeras (Hα, Hβ, Hγ y Hδ) se distinguen bien; las siguientes se apiñan
            junto al violeta, en el borde de lo que ve el ojo. La serie de Lyman cae entera en el
            ultravioleta y las de Paschen en adelante, en el infrarrojo.
          </p>
        </section>

        {/* ── Líneas de la serie del salto ────────────────────────────────── */}
        {t && (
          <section className={styles.panel} aria-labelledby="titulo-serie">
            <h2 id="titulo-serie" className={styles.panelTitulo}>
              {t.serie ? `Líneas de la serie de ${t.serie}` : `Líneas que llegan al nivel ${t.nInferior}`} (nivel inferior {t.nInferior})
            </h2>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Salto</th>
                    <th scope="col">λ (nm)</th>
                    <th scope="col">ΔE (eV)</th>
                    <th scope="col">Región</th>
                  </tr>
                </thead>
                <tbody>
                  {lineasSerie.map((l) => {
                    const actual = l.nSuperior === t.nSuperior;
                    return (
                      <tr key={l.nSuperior} className={actual ? styles.filaActual : undefined}>
                        <td>
                          {textoNivel(l.nSuperior)} ↔ {t.nInferior}
                          {l.nSuperior === Infinity ? ' (límite)' : ''}
                          {actual ? ' · el elegido' : ''}
                        </td>
                        <td>{formatoSignificativo(l.lambdaNm, 5)}</td>
                        <td>{formatNumber(l.energiaFotonEV, 3)}</td>
                        <td>
                          {l.region === 'visible' ? (
                            <span className={styles.celdaColor}>
                              <span className={styles.muestraLinea} style={{ background: colorDeLambda(l.lambdaNm) }} aria-hidden="true" />
                              {nombreDeLambda(l.lambdaNm)}
                            </span>
                          ) : (
                            NOMBRE_REGION[l.region]
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Tarea de aula (skill /casos-aula-meskeia): tras los controles y FUERA de
            EducationalSection, que nace colapsada. */}
        <CasosAula />

        {/* ── Sección educativa v2.0 ──────────────────────────────────────── */}
        <EducationalSection
          title="Aprende sobre el modelo atómico de Bohr"
          subtitle="Niveles de energía, saltos del electrón y el espectro del hidrógeno"
          icon="⚛️"
        >
          <p className={styles.eduIntro}>
            En 1913 Niels Bohr propuso que el electrón del hidrógeno solo puede ocupar ciertas
            órbitas, cada una con una energía fija, <em>Eₙ = −13,6/n² eV</em>. Mientras está en una
            de ellas no radia; al saltar de una a otra emite o absorbe un fotón con exactamente la
            diferencia de energía, <em>ΔE = h·f</em>. Con esa idea explicó por qué el hidrógeno solo
            emite unas longitudes de onda concretas, que Balmer (1885) y Rydberg (1888) ya habían
            ajustado con una fórmula empírica sin saber de dónde salía.
          </p>

          {/* 1 · Tabla comparativa */}
          <h3 className={styles.eduSubtitle}>Las series del espectro del hidrógeno</h3>
          <div className={styles.tablaWrapper}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Serie</th>
                  <th scope="col">Nivel inferior</th>
                  <th scope="col">Primera línea (nm)</th>
                  <th scope="col">Límite (nm)</th>
                  <th scope="col">Región</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((n) => {
                  const lineas = lineasDeSerie(n, 1);
                  const primera = lineas[0];
                  const limite = lineas[lineas.length - 1];
                  const regiones = Array.from(new Set([primera.region, limite.region])).map((r) => NOMBRE_REGION[r].toLowerCase());
                  const textoRegiones = regiones.join(' y ');
                  return (
                    <tr key={n}>
                      <td>{serieDeNivel(n)}</td>
                      <td>n = {n}</td>
                      <td>{formatoSignificativo(primera.lambdaNm, 5)}</td>
                      <td>{formatoSignificativo(limite.lambdaNm, 5)}</td>
                      <td>{textoRegiones.charAt(0).toUpperCase() + textoRegiones.slice(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={styles.fuente}>
            Calculado con la constante de Rydberg del hidrógeno, R_H = R∞/(1 + mₑ/mₚ), y las
            constantes CODATA 2018. Las longitudes de onda son en el vacío y coinciden con las medidas
            (NIST Atomic Spectra Database) en unas centésimas de nanómetro. En el aire salen un
            0,03&nbsp;% más cortas: muchas tablas dan para Hα 656,28 nm, la medida en aire.
          </p>

          {/* 2 · Casos de uso */}
          <h3 className={styles.eduSubtitle}>Dónde aparece el espectro del hidrógeno</h3>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🎒</span>
              <h4>Química y física de bachillerato o preparatoria</h4>
              <p>
                Los ejercicios piden la energía de un nivel, la del fotón de un salto o su longitud
                de onda. Resuélvelos con 13,6 eV y comprueba aquí: la diferencia está en la cuarta
                cifra.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🔭</span>
              <h4>Astronomía</h4>
              <p>
                Las nebulosas de emisión brillan en rojo por la línea Hα (656 nm). Los telescopios
                usan filtros de Hα, y el desplazamiento de las líneas del hidrógeno mide la velocidad
                de las galaxias.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">💡</span>
              <h4>Lámparas de descarga</h4>
              <p>
                Un tubo de hidrógeno con corriente brilla de color rosado: es la suma de la línea
                roja Hα y de las azules y violetas. Un espectroscopio de red las separa.
              </p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">☀️</span>
              <h4>Líneas de absorción del Sol</h4>
              <p>
                En el espectro del Sol faltan las mismas longitudes de onda: el hidrógeno de su
                atmósfera las absorbe. Son algunas de las líneas que Fraunhofer catalogó en 1814.
              </p>
            </div>
          </div>

          {/* 3 · FAQ */}
          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué las energías de los niveles son negativas?</strong>
              <p>
                Porque se toma como cero la energía del electrón libre, muy lejos del núcleo. Un
                electrón ligado tiene menos energía que libre, así que su energía es negativa:
                cuanto más negativa, más ligado está.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Emisión o absorción?</strong>
              <p>
                Si el electrón baja de nivel, sobra energía y sale un fotón: emisión. Si sube, la
                energía tiene que entrar con un fotón de exactamente ΔE: absorción. La longitud de
                onda es la misma en los dos sentidos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el resultado no coincide exactamente con mi cuenta?</strong>
              <p>
                El simulador usa 13,598 eV y R_H = 1,09678·10⁷ m⁻¹, que corrigen el movimiento del
                núcleo. Con los valores del libro, 13,6 eV y 1,097·10⁷ m⁻¹, la diferencia aparece en
                la cuarta cifra: Hα sale 656,5 nm aquí y 656,3 nm con el valor del libro.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> El cuadro de fórmulas da también el resultado con
                el R del libro, para comparar tu cuenta.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Sirve el modelo de Bohr para otros átomos?</strong>
              <p>
                Solo para el hidrógeno y los iones con un único electrón (He⁺, Li²⁺), multiplicando
                las energías por Z². Con más electrones falla, y el modelo cuántico actual sustituye
                las órbitas por orbitales. Sigue en los temarios porque explica el espectro con una
                idea sencilla.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la energía de ionización?</strong>
              <p>
                La necesaria para arrancar el electrón: llevarlo de su nivel a n = ∞. Desde el
                fundamental son 13,6 eV; desde el nivel 2, la cuarta parte, 3,4 eV.
              </p>
            </div>
          </div>

          {/* 4 · Guía paso a paso */}
          <h3 className={styles.eduSubtitle}>Cómo resolver un ejercicio de saltos, paso a paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica los dos niveles</strong>
                <p>De dónde sale el electrón (n<sub>i</sub>) y adónde llega (n<sub>f</sub>). Si baja, emite; si sube, absorbe.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula la energía de cada nivel</strong>
                <p>Eₙ = −13,6/n² eV. Para el 2: −3,4 eV; para el 3: −1,51 eV.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Resta para el fotón</strong>
                <p>ΔE = |E_f − E_i|. Pásalo a julios multiplicando por 1,602·10⁻¹⁹ si lo piden en J.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>De la energía a la longitud de onda</strong>
                <p>λ = h·c/ΔE, o directamente con Rydberg: 1/λ = R·(1/n_inf² − 1/n_sup²).</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Sitúala en el espectro</strong>
                <p>Por debajo de 380 nm, ultravioleta; entre 380 y 750 nm, visible; por encima, infrarrojo.</p>
              </div>
            </div>
          </div>

          {/* 5 · Consejos */}
          <h3 className={styles.eduSubtitle}>Consejos</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <div>
                <strong>Un atajo con h·c</strong>
                <p>λ (nm) = 1240/ΔE (eV). Evita trabajar con potencias de 10 en el paso de energía a longitud de onda.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>En Rydberg, el pequeño primero</strong>
                <p>1/n_inf² − 1/n_sup² sale positivo si pones primero el nivel de abajo. Así no te pelearás con signos.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌈</span>
              <div>
                <strong>La serie la da el nivel de abajo</strong>
                <p>Todo salto que acaba (o empieza) en el 2 es de Balmer, venga de donde venga.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <strong>Comprueba con Hα</strong>
                <p>Si tu método da unos 656 nm para el salto de 3 a 2, está bien planteado.</p>
              </div>
            </div>
          </div>

          {/* 6 · Errores típicos */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores típicos con el modelo de Bohr
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Olvidar el cuadrado de n:</strong> la energía va con 1/n², no con 1/n. El
                nivel 2 tiene un cuarto de la energía del 1, no la mitad.
              </li>
              <li>
                <strong>Dar una longitud de onda negativa:</strong> el signo de ΔE dice si se emite o
                se absorbe; la longitud de onda siempre es positiva.
              </li>
              <li>
                <strong>Mezclar eV y J:</strong> con h en J·s, la energía tiene que ir en julios. 1 eV =
                1,602·10⁻¹⁹ J.
              </li>
              <li>
                <strong>Confundir la serie:</strong> la nombra el nivel inferior. 4 → 2 es Balmer, no
                Brackett.
              </li>
              <li>
                <strong>Creer que todas las líneas se ven:</strong> solo las de Balmer caen en el
                visible, y no todas: su límite (364,7 nm) ya es ultravioleta.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-modelo-bohr')} />
        <ShareCard appName="simulador-modelo-bohr" />
      </main>

      <Footer appName="simulador-modelo-bohr" />
    </div>
  );
}

// ─── Piezas del dibujo ───────────────────────────────────────────────────────

interface FlechaVerticalProps {
  x: number;
  desde: number;
  hasta: number;
  color: string;
  claseHalo: string;
}

/** Flecha vertical del salto, del color del fotón y con un halo que la separa del fondo. */
function FlechaVertical({ x, desde, hasta, color, claseHalo }: FlechaVerticalProps) {
  const longitud = hasta - desde;
  if (Math.abs(longitud) < 1) return null;
  const sentido = longitud > 0 ? 1 : -1;
  const punta = Math.min(12, Math.abs(longitud));
  const baseCuerpo = hasta - sentido * punta;
  const puntos = `${x},${hasta} ${x - 8},${baseCuerpo} ${x + 8},${baseCuerpo}`;
  return (
    <g>
      <line x1={x} y1={desde} x2={x} y2={baseCuerpo} className={claseHalo} strokeWidth={8} />
      <polygon points={puntos} className={claseHalo} strokeWidth={4} />
      <line x1={x} y1={desde} x2={x} y2={baseCuerpo} stroke={color} strokeWidth={4} />
      <polygon points={puntos} fill={color} />
    </g>
  );
}
