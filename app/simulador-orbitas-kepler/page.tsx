'use client';
// @disclaimer: exempt

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import styles from './SimuladorOrbitasKepler.module.css';

// ============================================================
// Constantes físicas
// ============================================================
const G = 6.674e-11; // m³/(kg·s²) — constante de gravitación universal (CODATA 2018)
const UA = 1.495978707e11; // m — unidad astronómica (definición IAU 2012)
const DIA = 86400; // s
const ANIO = 365.25 * DIA; // s — año juliano

// ============================================================
// Tipos
// ============================================================
interface CuerpoCentral {
  id: string;
  nombre: string;
  icono: string;
  masa: number; // kg
  radio: number; // m
  /** Nombre del punto más cercano al cuerpo central */
  peri: string;
  /** Nombre del punto más lejano */
  apo: string;
  /** Semieje por defecto al cambiar de cuerpo, en km */
  semiejeDefecto: number;
}

interface OrbitaPreset {
  id: string;
  nombre: string;
  /** Semieje mayor en km */
  semiejeKm: number;
  excentricidad: number;
  nota: string;
}

interface Orbita {
  /** Semieje mayor en metros */
  a: number;
  /** Semieje menor en metros */
  b: number;
  periodo: number; // s
  rPeri: number; // m
  rApo: number; // m
  vPeri: number; // m/s
  vApo: number; // m/s
  vCircular: number; // m/s — velocidad de una órbita circular de radio a
  vEscapePeri: number; // m/s — velocidad de escape desde el periastro
  vMedia: number; // m/s
  energiaEspecifica: number; // J/kg
  energiaTotal: number; // J
  constanteKepler: number; // s²/m³ — T²/a³
  chocaSuperficie: boolean;
}

// ============================================================
// Cuerpos centrales
// Masas y radios medios: NASA Planetary Fact Sheet
// ============================================================
const CUERPOS: CuerpoCentral[] = [
  {
    id: 'sol',
    nombre: 'Sol',
    icono: '☀️',
    masa: 1.989e30,
    radio: 6.957e8,
    peri: 'Perihelio',
    apo: 'Afelio',
    semiejeDefecto: 149_598_000,
  },
  {
    id: 'tierra',
    nombre: 'Tierra',
    icono: '🌍',
    masa: 5.972e24,
    radio: 6.371e6,
    peri: 'Perigeo',
    apo: 'Apogeo',
    semiejeDefecto: 42_164,
  },
  {
    id: 'marte',
    nombre: 'Marte',
    icono: '🔴',
    masa: 6.417e23,
    radio: 3.3895e6,
    peri: 'Periastro',
    apo: 'Apoastro',
    semiejeDefecto: 9_376,
  },
  {
    id: 'jupiter',
    nombre: 'Júpiter',
    icono: '🪐',
    masa: 1.898e27,
    radio: 6.9911e7,
    peri: 'Periastro',
    apo: 'Apoastro',
    semiejeDefecto: 421_800,
  },
];

// ============================================================
// Órbitas reales predefinidas (elementos orbitales medios)
// ============================================================
const PRESETS: Record<string, OrbitaPreset[]> = {
  sol: [
    { id: 'mercurio', nombre: 'Mercurio', semiejeKm: 57_909_000, excentricidad: 0.2056, nota: 'La órbita planetaria más excéntrica del sistema solar' },
    { id: 'venus', nombre: 'Venus', semiejeKm: 108_208_000, excentricidad: 0.0068, nota: 'La órbita más circular de los ocho planetas' },
    { id: 'tierra', nombre: 'Tierra', semiejeKm: 149_598_000, excentricidad: 0.0167, nota: 'Por definición, 1 UA y un año de periodo' },
    { id: 'marte', nombre: 'Marte', semiejeKm: 227_956_000, excentricidad: 0.0935, nota: 'Su excentricidad permitió a Kepler descubrir la elipse' },
    { id: 'jupiter', nombre: 'Júpiter', semiejeKm: 778_479_000, excentricidad: 0.0489, nota: 'Casi 12 años terrestres por vuelta' },
    { id: 'neptuno', nombre: 'Neptuno', semiejeKm: 4_495_060_000, excentricidad: 0.0086, nota: 'Descubierto en 1846; aún no ha dado dos vueltas desde entonces' },
    { id: 'halley', nombre: 'Cometa Halley', semiejeKm: 2_667_950_000, excentricidad: 0.967, nota: 'Excentricidad extrema: cruza desde dentro de Venus hasta más allá de Neptuno' },
  ],
  tierra: [
    { id: 'iss', nombre: 'ISS', semiejeKm: 6_798, excentricidad: 0.0003, nota: 'Órbita baja a unos 420 km de altitud' },
    { id: 'gps', nombre: 'GPS', semiejeKm: 26_560, excentricidad: 0, nota: 'Órbita media: media vuelta al día sidéreo' },
    { id: 'geo', nombre: 'Geoestacionaria', semiejeKm: 42_164, excentricidad: 0, nota: 'El periodo coincide con el día sidéreo y el satélite parece quieto' },
    { id: 'molniya', nombre: 'Molniya', semiejeKm: 26_600, excentricidad: 0.74, nota: 'Muy excéntrica: pasa la mayor parte del tiempo sobre latitudes altas' },
    { id: 'luna', nombre: 'Luna', semiejeKm: 384_400, excentricidad: 0.0549, nota: 'El satélite natural: 27,3 días de periodo sidéreo' },
  ],
  marte: [
    { id: 'phobos', nombre: 'Fobos', semiejeKm: 9_376, excentricidad: 0.0151, nota: 'Da tres vueltas al día marciano; se acerca lentamente al planeta' },
    { id: 'deimos', nombre: 'Deimos', semiejeKm: 23_463, excentricidad: 0.0002, nota: 'El satélite más pequeño y exterior de Marte' },
  ],
  jupiter: [
    { id: 'io', nombre: 'Ío', semiejeKm: 421_800, excentricidad: 0.0041, nota: 'El cuerpo con más actividad volcánica del sistema solar' },
    { id: 'europa', nombre: 'Europa', semiejeKm: 671_100, excentricidad: 0.009, nota: 'Océano de agua líquida bajo la corteza de hielo' },
    { id: 'ganimedes', nombre: 'Ganimedes', semiejeKm: 1_070_400, excentricidad: 0.0013, nota: 'El satélite más grande del sistema solar' },
    { id: 'calisto', nombre: 'Calisto', semiejeKm: 1_882_700, excentricidad: 0.0074, nota: 'Completa la resonancia 1:2:4 con Ío y Europa' },
  ],
};

// ============================================================
// Geometría del lienzo
// ============================================================
const SVG_W = 800;
const SVG_H = 460;
const CX = 400;
const CY = 230;
const A_PX_MAX = 300; // ancho máximo del semieje mayor en píxeles
const B_PX_MAX = 190; // alto máximo del semieje menor: CY menos el margen de las etiquetas

/**
 * Escala la elipse para que quepa SIEMPRE en el lienzo.
 * Una órbita circular (e = 0) tiene el semieje menor igual al mayor, así que
 * fijar el mayor a 300 px la sacaba por arriba y por abajo: manda la altura.
 */
function semiejeEnPixeles(e: number): number {
  const achatamiento = Math.sqrt(1 - e * e);
  if (achatamiento <= 0) return A_PX_MAX;
  return Math.min(A_PX_MAX, B_PX_MAX / achatamiento);
}

/** Mantiene una etiqueta centrada dentro del lienzo aunque su marca esté en el borde. */
function etiquetaX(x: number): number {
  return Math.min(Math.max(x, 80), SVG_W - 80);
}

// ============================================================
// Formateadores de magnitudes muy dispares
// ============================================================
function formatDistancia(metros: number): string {
  const km = metros / 1000;
  if (km < 1000) return `${formatNumber(km, 1)} km`;
  if (km < 1e6) return `${formatNumber(km, 0)} km`;
  if (km < 1e9) return `${formatNumber(km / 1e6, 3)} millones de km`;
  return `${formatNumber(km / 1e6, 0)} millones de km`;
}

function formatUA(metros: number): string {
  return `${formatNumber(metros / UA, 3)} UA`;
}

function formatTiempo(segundos: number): string {
  if (segundos < 120) return `${formatNumber(segundos, 1)} s`;
  if (segundos < 7200) return `${formatNumber(segundos / 60, 1)} minutos`;
  if (segundos < 2 * DIA) return `${formatNumber(segundos / 3600, 2)} horas`;
  if (segundos < 2 * ANIO) return `${formatNumber(segundos / DIA, 2)} días`;
  return `${formatNumber(segundos / ANIO, 2)} años`;
}

function formatVelocidad(ms: number): string {
  if (ms >= 1000) return `${formatNumber(ms / 1000, 3)} km/s`;
  return `${formatNumber(ms, 1)} m/s`;
}

function formatEnergia(julios: number): string {
  const abs = Math.abs(julios);
  const signo = julios < 0 ? '−' : '';
  if (abs >= 1e9) return `${signo}${formatNumber(abs / 1e9, 3)} GJ`;
  if (abs >= 1e6) return `${signo}${formatNumber(abs / 1e6, 3)} MJ`;
  if (abs >= 1e3) return `${signo}${formatNumber(abs / 1e3, 3)} kJ`;
  return `${signo}${formatNumber(abs, 1)} J`;
}

// ============================================================
// Ecuación de Kepler: M = E − e·sen E, resuelta por Newton-Raphson
// Da la posición real en el tiempo, no un giro a velocidad constante:
// de ahí sale la segunda ley (áreas iguales en tiempos iguales).
// ============================================================
function resolverKepler(anomaliaMedia: number, e: number): number {
  let E = e < 0.8 ? anomaliaMedia : Math.PI;
  for (let i = 0; i < 80; i++) {
    const f = E - e * Math.sin(E) - anomaliaMedia;
    const derivada = 1 - e * Math.cos(E);
    const paso = f / derivada;
    E -= paso;
    if (Math.abs(paso) < 1e-12) break;
  }
  return E;
}

export default function SimuladorOrbitasKepler() {
  const [cuerpoId, setCuerpoId] = useState('tierra');
  const [semiejeKm, setSemiejeKm] = useState(42_164);
  const [excentricidad, setExcentricidad] = useState(0);
  const [masaSatelite, setMasaSatelite] = useState(1000);
  const [presetActivo, setPresetActivo] = useState('geo');
  const [animando, setAnimando] = useState(true);
  const [anomaliaMedia, setAnomaliaMedia] = useState(0);
  const [segundosPorVuelta, setSegundosPorVuelta] = useState(12);

  const rafRef = useRef<number | null>(null);
  const ultimoTsRef = useRef<number | null>(null);
  const anomaliaRef = useRef(0);

  const cuerpo = useMemo(
    () => CUERPOS.find((c) => c.id === cuerpoId) ?? CUERPOS[1],
    [cuerpoId],
  );

  // ── Mecánica orbital ────────────────────────────────────
  const orbita: Orbita = useMemo(() => {
    const a = Math.max(semiejeKm, 1) * 1000; // m
    const e = Math.min(Math.max(excentricidad, 0), 0.99);
    const mu = G * cuerpo.masa; // parámetro gravitacional estándar

    const b = a * Math.sqrt(1 - e * e);
    const periodo = 2 * Math.PI * Math.sqrt((a * a * a) / mu);
    const rPeri = a * (1 - e);
    const rApo = a * (1 + e);

    // Ecuación vis-viva: v = √(μ·(2/r − 1/a))
    const vPeri = Math.sqrt(mu * (2 / rPeri - 1 / a));
    const vApo = Math.sqrt(mu * (2 / rApo - 1 / a));
    const vCircular = Math.sqrt(mu / a);
    const vEscapePeri = Math.sqrt((2 * mu) / rPeri);

    return {
      a,
      b,
      periodo,
      rPeri,
      rApo,
      vPeri,
      vApo,
      vCircular,
      vEscapePeri,
      vMedia: (2 * Math.PI * a) / periodo,
      energiaEspecifica: -mu / (2 * a),
      energiaTotal: (-mu * Math.max(masaSatelite, 0)) / (2 * a),
      constanteKepler: (periodo * periodo) / (a * a * a),
      chocaSuperficie: rPeri < cuerpo.radio,
    };
  }, [semiejeKm, excentricidad, cuerpo, masaSatelite]);

  // ── Posición instantánea del satélite ───────────────────
  const posicion = useMemo(() => {
    const e = Math.min(Math.max(excentricidad, 0), 0.99);
    const E = resolverKepler(anomaliaMedia, e);
    const r = orbita.a * (1 - e * Math.cos(E));
    const v = Math.sqrt(G * cuerpo.masa * (2 / r - 1 / orbita.a));
    return {
      // Coordenadas respecto al CENTRO de la elipse (el foco está desplazado a·e)
      xCentro: Math.cos(E),
      yCentro: Math.sqrt(1 - e * e) * Math.sin(E),
      radio: r,
      velocidad: v,
    };
  }, [anomaliaMedia, excentricidad, orbita.a, cuerpo.masa]);

  // ── Animación por la segunda ley de Kepler ──────────────
  useEffect(() => {
    if (!animando) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ultimoTsRef.current = null;
      return;
    }

    const paso = (ts: number) => {
      if (ultimoTsRef.current === null) ultimoTsRef.current = ts;
      const delta = (ts - ultimoTsRef.current) / 1000;
      ultimoTsRef.current = ts;

      anomaliaRef.current =
        (anomaliaRef.current + (2 * Math.PI * delta) / segundosPorVuelta) % (2 * Math.PI);
      setAnomaliaMedia(anomaliaRef.current);
      rafRef.current = requestAnimationFrame(paso);
    };

    rafRef.current = requestAnimationFrame(paso);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ultimoTsRef.current = null;
    };
  }, [animando, segundosPorVuelta]);

  // Respetar la preferencia de movimiento reducido del sistema
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimando(false);
    }
  }, []);

  // ── Manejadores ─────────────────────────────────────────
  const handleCuerpo = useCallback((nuevo: CuerpoCentral) => {
    setCuerpoId(nuevo.id);
    setSemiejeKm(nuevo.semiejeDefecto);
    const primero = PRESETS[nuevo.id]?.find((p) => p.semiejeKm === nuevo.semiejeDefecto);
    setExcentricidad(primero ? primero.excentricidad : 0);
    setPresetActivo(primero ? primero.id : '');
  }, []);

  const handlePreset = useCallback((preset: OrbitaPreset) => {
    setSemiejeKm(preset.semiejeKm);
    setExcentricidad(preset.excentricidad);
    setPresetActivo(preset.id);
  }, []);

  const handleSemieje = (valor: number) => {
    setSemiejeKm(valor);
    setPresetActivo('');
  };

  const handleExcentricidad = (valor: number) => {
    setExcentricidad(valor);
    setPresetActivo('');
  };

  // ── Geometría del dibujo ────────────────────────────────
  const e = Math.min(Math.max(excentricidad, 0), 0.99);
  const aPx = semiejeEnPixeles(e);
  const bPx = aPx * Math.sqrt(1 - e * e);
  const focoX = CX + aPx * e; // el cuerpo central ocupa un foco, no el centro
  const radioCuerpoPx = Math.min(Math.max((aPx * cuerpo.radio) / orbita.a, 3), 60);
  const satX = CX + aPx * posicion.xCentro;
  const satY = CY - bPx * posicion.yCentro;

  const presets = PRESETS[cuerpoId] ?? [];
  const presetDescrito = presets.find((p) => p.id === presetActivo);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Órbitas y Leyes de Kepler</h1>
        <p>Periodo, velocidades y energía de una órbita a partir del semieje mayor y la excentricidad</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Veredicto */}
        <section
          className={`${styles.veredicto} ${orbita.chocaSuperficie ? styles.veredictoError : styles.veredictoOk}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {orbita.chocaSuperficie
              ? 'La órbita corta la superficie'
              : `Una vuelta cada ${formatTiempo(orbita.periodo)}`}
          </strong>
          <span>
            {orbita.chocaSuperficie
              ? `El ${cuerpo.peri.toLowerCase()} queda a ${formatDistancia(orbita.rPeri)} del centro, por debajo del radio del cuerpo (${formatDistancia(cuerpo.radio)}). Aumenta el semieje mayor o reduce la excentricidad.`
              : `Órbita ${e < 0.01 ? 'prácticamente circular' : e < 0.2 ? 'poco excéntrica' : e < 0.6 ? 'claramente elíptica' : 'muy excéntrica'} alrededor de ${cuerpo.nombre === 'Sol' ? 'el Sol' : cuerpo.nombre}`}
          </span>
        </section>

        {/* Cuerpo central */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Cuerpo central</h2>
          <div className={styles.cuerposGrid}>
            {CUERPOS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.cuerpoBtn} ${c.id === cuerpoId ? styles.cuerpoBtnActivo : ''}`}
                aria-pressed={c.id === cuerpoId}
                onClick={() => handleCuerpo(c)}
              >
                <span className={styles.cuerpoIcono} aria-hidden="true">{c.icono}</span>
                <span className={styles.cuerpoNombre}>{c.nombre}</span>
                <span className={styles.cuerpoMasa}>
                  {formatNumber(c.masa / 1e24, 2)}·10²⁴ kg
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Parámetros orbitales */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Parámetros de la órbita</h2>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="semieje">
                Semieje mayor (a)
                <span className={styles.valueBadge}>{formatNumber(semiejeKm, 0)} km</span>
              </label>
              <input
                id="semieje"
                type="number"
                inputMode="decimal"
                min={1}
                step={1}
                value={semiejeKm}
                onChange={(ev) => handleSemieje(Number(ev.target.value) || 1)}
                className={styles.numberInput}
              />
              <span className={styles.inputHint}>
                Distancia media al cuerpo central. Es lo único que determina el periodo.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="excentricidad">
                Excentricidad (e)
                <span className={styles.valueBadge}>{formatNumber(excentricidad, 3)}</span>
              </label>
              <input
                id="excentricidad"
                type="range"
                min={0}
                max={0.95}
                step={0.001}
                value={excentricidad}
                onChange={(ev) => handleExcentricidad(Number(ev.target.value))}
                className={styles.slider}
              />
              <span className={styles.inputHint}>
                0 es una circunferencia; cuanto más se acerca a 1, más alargada es la elipse.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="masa">
                Masa del satélite
                <span className={styles.valueBadge}>{formatNumber(masaSatelite, 0)} kg</span>
              </label>
              <input
                id="masa"
                type="number"
                inputMode="decimal"
                min={0}
                step={100}
                value={masaSatelite}
                onChange={(ev) => setMasaSatelite(Math.max(Number(ev.target.value) || 0, 0))}
                className={styles.numberInput}
              />
              <span className={styles.inputHint}>
                Solo interviene en la energía total: no afecta ni al periodo ni a las velocidades.
              </span>
            </div>
          </div>

          <h3 className={styles.subPanelTitle}>Órbitas reales</h3>
          <div className={styles.presetsGrid}>
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`${styles.presetBtn} ${p.id === presetActivo ? styles.presetBtnActivo : ''}`}
                aria-pressed={p.id === presetActivo}
                onClick={() => handlePreset(p)}
              >
                {p.nombre}
              </button>
            ))}
          </div>
          {presetDescrito && <p className={styles.presetNota}>{presetDescrito.nota}</p>}
        </section>

        {/* Lienzo */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>La órbita</h2>

          <div className={styles.canvasWrapper}>
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className={styles.canvasSvg}
              role="img"
              aria-label={`Órbita elíptica de excentricidad ${formatNumber(excentricidad, 3)} alrededor de ${cuerpo.nombre}, con el satélite a ${formatDistancia(posicion.radio)} del centro`}
            >
              {/* Elipse de la trayectoria */}
              <ellipse cx={CX} cy={CY} rx={aPx} ry={bPx} className={styles.trayectoria} />

              {/* Eje mayor y centro geométrico */}
              <line x1={CX - aPx} y1={CY} x2={CX + aPx} y2={CY} className={styles.ejeMayor} />
              <circle cx={CX} cy={CY} r={3} className={styles.centroElipse} />

              {/* Radio vector: la línea que barre áreas iguales */}
              <line x1={focoX} y1={CY} x2={satX} y2={satY} className={styles.radioVector} />

              {/* Cuerpo central en el foco */}
              <circle cx={focoX} cy={CY} r={radioCuerpoPx} className={styles.cuerpoCentral} />

              {/* Foco vacío */}
              <circle cx={CX - aPx * e} cy={CY} r={3} className={styles.focoVacio} />

              {/* Periastro y apoastro. Las etiquetas van centradas sobre su marca
                  y sujetas al lienzo: «4.531 millones de km» colgando del extremo
                  se salía del viewBox en las órbitas más excéntricas. */}
              <circle cx={CX + aPx} cy={CY} r={5} className={styles.marcaPeri} />
              <text x={etiquetaX(CX + aPx)} y={CY - 24} className={styles.etiquetaPeri} textAnchor="middle">
                {cuerpo.peri}
              </text>
              <text x={etiquetaX(CX + aPx)} y={CY + 30} className={styles.etiquetaValor} textAnchor="middle">
                {formatDistancia(orbita.rPeri)}
              </text>

              <circle cx={CX - aPx} cy={CY} r={5} className={styles.marcaApo} />
              <text x={etiquetaX(CX - aPx)} y={CY - 24} className={styles.etiquetaApo} textAnchor="middle">
                {cuerpo.apo}
              </text>
              <text x={etiquetaX(CX - aPx)} y={CY + 30} className={styles.etiquetaValor} textAnchor="middle">
                {formatDistancia(orbita.rApo)}
              </text>

              {/* Satélite */}
              <circle cx={satX} cy={satY} r={7} className={styles.satelite} />
            </svg>
          </div>

          <div className={styles.controlesAnimacion}>
            <button
              type="button"
              className={styles.animBtn}
              aria-pressed={animando}
              onClick={() => setAnimando((v) => !v)}
            >
              <span aria-hidden="true">{animando ? '⏸' : '▶'}</span>{' '}
              {animando ? 'Pausar' : 'Animar'}
            </button>

            <div className={styles.velocidadGrupo}>
              <label htmlFor="ritmo">Una vuelta cada</label>
              <select
                id="ritmo"
                value={segundosPorVuelta}
                onChange={(ev) => setSegundosPorVuelta(Number(ev.target.value))}
                className={styles.select}
              >
                <option value={6}>6 segundos</option>
                <option value={12}>12 segundos</option>
                <option value={24}>24 segundos</option>
              </select>
            </div>
          </div>

          <p className={styles.canvasNota}>
            El cuerpo central ocupa <strong>un foco</strong> de la elipse, no su centro: esa es la
            primera ley de Kepler. El satélite no gira a ritmo constante — la línea que lo une al
            foco barre áreas iguales en tiempos iguales, así que se acelera al acercarse.
          </p>
        </section>

        {/* Resultados */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Resultados</h2>

          <div className={styles.resultGrid}>
            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Geometría y periodo</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Periodo orbital (T)</span>
                <span className={styles.resultValueAccent}>{formatTiempo(orbita.periodo)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>{cuerpo.peri}</span>
                <span className={styles.resultValue}>{formatDistancia(orbita.rPeri)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>{cuerpo.apo}</span>
                <span className={styles.resultValue}>{formatDistancia(orbita.rApo)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Semieje menor (b)</span>
                <span className={styles.resultValue}>{formatDistancia(orbita.b)}</span>
              </div>
              {cuerpoId === 'sol' && (
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Semieje mayor en UA</span>
                  <span className={styles.resultValue}>{formatUA(orbita.a)}</span>
                </div>
              )}
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Velocidades</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>En el {cuerpo.peri.toLowerCase()}</span>
                <span className={styles.resultValueAccent}>{formatVelocidad(orbita.vPeri)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>En el {cuerpo.apo.toLowerCase()}</span>
                <span className={styles.resultValue}>{formatVelocidad(orbita.vApo)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Media orbital</span>
                <span className={styles.resultValue}>{formatVelocidad(orbita.vMedia)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Circular a r = a</span>
                <span className={styles.resultValue}>{formatVelocidad(orbita.vCircular)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>De escape en el {cuerpo.peri.toLowerCase()}</span>
                <span className={styles.resultValue}>{formatVelocidad(orbita.vEscapePeri)}</span>
              </div>
              <p className={styles.resultNota}>
                Relación entre extremos: v{cuerpo.peri.charAt(0).toLowerCase()}/v
                {cuerpo.apo.charAt(0).toLowerCase()} = (1+e)/(1−e) ={' '}
                {formatNumber((1 + e) / (1 - e), 3)}
              </p>
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Energía</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Específica (por kg)</span>
                <span className={styles.resultValue}>
                  −{formatNumber(Math.abs(orbita.energiaEspecifica) / 1e6, 3)} MJ/kg
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Total del satélite</span>
                <span className={styles.resultValue}>{formatEnergia(orbita.energiaTotal)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>T²/a³ (tercera ley)</span>
                <span className={styles.resultValue}>
                  {orbita.constanteKepler.toExponential(4).replace('.', ',')} s²/m³
                </span>
              </div>
              <p className={styles.resultNota}>
                Esa constante es la misma para cualquier órbita alrededor de {cuerpo.nombre}: cambia
                el semieje y compruébalo.
              </p>
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Instante actual</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Distancia al centro</span>
                <span className={styles.resultValue}>{formatDistancia(posicion.radio)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Velocidad instantánea</span>
                <span className={styles.resultValueAccent}>
                  {formatVelocidad(posicion.velocidad)}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Fracción del periodo</span>
                <span className={styles.resultValue}>
                  {formatNumber((anomaliaMedia / (2 * Math.PI)) * 100, 1)} %
                </span>
              </div>
              <p className={styles.resultNota}>
                Calculada con la ecuación vis-viva, v = √(μ·(2/r − 1/a)).
              </p>
            </div>
          </div>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía de mecánica orbital"
          subtitle="Las tres leyes de Kepler, la vis-viva y la energía de una órbita"
        >
          <p>
            Kepler dedujo sus tres leyes entre 1609 y 1619 a partir de las observaciones de Marte
            hechas por Tycho Brahe, sin saber por qué funcionaban. Setenta años después Newton
            demostró que las tres son consecuencia de una sola cosa: una fuerza atractiva que
            decrece con el cuadrado de la distancia. Por eso las mismas fórmulas describen a un
            planeta alrededor del Sol, a la ISS alrededor de la Tierra y a Ganimedes alrededor de
            Júpiter — solo cambia la masa del cuerpo central.
          </p>

          <h3 className={styles.eduSubtitle}>Fórmulas clave</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>Fórmula</th>
                  <th>Unidad SI</th>
                  <th>Qué conviene recordar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Periodo orbital</td>
                  <td>T = 2π·√(a³/GM)</td>
                  <td>s</td>
                  <td>No depende ni de la excentricidad ni de la masa del satélite</td>
                </tr>
                <tr>
                  <td>Velocidad en un punto</td>
                  <td>v = √(GM·(2/r − 1/a))</td>
                  <td>m/s</td>
                  <td>Ecuación vis-viva: sirve en cualquier punto de la órbita</td>
                </tr>
                <tr>
                  <td>Velocidad circular</td>
                  <td>v = √(GM/r)</td>
                  <td>m/s</td>
                  <td>Caso particular de la vis-viva cuando r = a</td>
                </tr>
                <tr>
                  <td>Velocidad de escape</td>
                  <td>v = √(2GM/r)</td>
                  <td>m/s</td>
                  <td>Es √2 veces la circular a esa misma distancia</td>
                </tr>
                <tr>
                  <td>Distancias extremas</td>
                  <td>r = a(1∓e)</td>
                  <td>m</td>
                  <td>Menos para el punto más cercano, más para el más lejano</td>
                </tr>
                <tr>
                  <td>Energía específica</td>
                  <td>ε = −GM/2a</td>
                  <td>J/kg</td>
                  <td>Negativa en toda órbita cerrada; solo depende de a</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Las tres leyes, una a una</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Primera: la elipse</h4>
              <p>
                La órbita es una elipse con el cuerpo central en uno de los focos. El otro foco está
                vacío. Cuando la excentricidad es casi cero los dos focos se juntan en el centro y la
                elipse es indistinguible de una circunferencia: es lo que ocurre con Venus (e =
                0,0068).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Segunda: las áreas</h4>
              <p>
                El radio vector barre áreas iguales en tiempos iguales. Como cerca del cuerpo central
                el radio es corto, el satélite tiene que recorrer más ángulo para barrer la misma
                área: por eso acelera. Es la conservación del momento angular escrita en lenguaje
                geométrico.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Tercera: T² ∝ a³</h4>
              <p>
                El cuadrado del periodo es proporcional al cubo del semieje mayor. La constante de
                proporcionalidad depende solo de la masa del cuerpo central, así que medir T y a de
                un satélite es la forma habitual de <em>pesar</em> un planeta.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Lo que Kepler no vio</h4>
              <p>
                Las tres leyes son aproximaciones excelentes pero no exactas: suponen dos cuerpos
                aislados y masa despreciable del satélite. Con más cuerpos aparecen perturbaciones,
                como el avance del perihelio de Mercurio que solo la relatividad general explicó
                del todo.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué el periodo no depende de la excentricidad?</strong>
              <p>
                Porque en una órbita muy alargada el satélite recorre más camino, pero también pasa
                mucho tiempo muy lejos moviéndose despacio. Ambos efectos se compensan exactamente y
                el resultado depende solo del semieje mayor.
              </p>
              <p className={styles.faqTip}>
                Compruébalo: fija el semieje y mueve la excentricidad de 0 a 0,9. El periodo no se
                mueve.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Y por qué tampoco depende de la masa del satélite?</strong>
              <p>
                Porque la masa aparece a los dos lados de la segunda ley de Newton y se cancela: la
                fuerza gravitatoria es proporcional a la masa, y la aceleración que produce esa
                fuerza es inversamente proporcional a ella. Es la misma razón por la que dos objetos
                distintos caen a la vez en el vacío.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre velocidad orbital y velocidad de escape?</strong>
              <p>
                La orbital mantiene al cuerpo dando vueltas; la de escape es la mínima necesaria para
                no volver nunca. A una distancia dada, la de escape es exactamente √2 ≈ 1,414 veces
                la circular. Desde la superficie terrestre son 7,9 km/s y 11,2 km/s.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Se puede orbitar a cualquier altura?</strong>
              <p>
                Matemáticamente sí, pero por debajo de unos 160 km la atmósfera frena tanto al
                satélite que la órbita se degrada en días. Y si el periastro cae por debajo del radio
                del cuerpo, la órbita simplemente choca: el simulador lo avisa arriba.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la Estación Espacial da casi 16 vueltas al día?</strong>
              <p>
                Porque su semieje mayor es de unos 6.798 km, apenas 420 km por encima de la
                superficie. A esa distancia el periodo sale de unos 93 minutos, lo que da 15,5
                órbitas diarias y un amanecer cada 45 minutos para su tripulación.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo resolver un problema de órbitas</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Identifica el cuerpo central y su masa</strong>
                <p>Todo el problema cuelga del producto GM, llamado parámetro gravitacional estándar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Pasa las distancias al centro, no a la superficie</strong>
                <p>
                  Si el enunciado da una altitud, súmale el radio del cuerpo. Es el error más común
                  de todos.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Obtén el semieje mayor</strong>
                <p>
                  Si te dan las dos distancias extremas, a = (r_peri + r_apo)/2. Si te dan el
                  periodo, despéjalo de la tercera ley.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula la excentricidad</strong>
                <p>e = (r_apo − r_peri)/(r_apo + r_peri), un número siempre entre 0 y 1.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Aplica la vis-viva para cualquier velocidad</strong>
                <p>
                  Con a y r ya tienes todo. No hace falta memorizar fórmulas distintas para el
                  periastro y el apoastro: son casos particulares de la misma.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <div>
                <strong>Trabaja en el SI</strong>
                <p>Metros, kilogramos y segundos. Mezclar kilómetros con G en unidades SI es la fuente número uno de resultados absurdos.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Comprueba el orden de magnitud</strong>
                <p>Una órbita baja terrestre ronda los 90 minutos y los 7,7 km/s. Si te sale un periodo de días, revisa las unidades.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>Usa la tercera ley como proporción</strong>
                <p>Comparando dos órbitas del mismo cuerpo, (T₁/T₂)² = (a₁/a₂)³ y te ahorras el valor de GM.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔭</span>
              <div>
                <strong>Recuerda qué mide cada foco</strong>
                <p>El cuerpo central está en un foco; el otro está vacío. El centro geométrico no es ningún cuerpo.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Usar la altitud sobre la superficie en lugar de la distancia al centro del cuerpo.
                Un satélite a 400 km de altura orbita a 6.771 km del centro de la Tierra.
              </li>
              <li>
                Colocar el cuerpo central en el centro de la elipse. Está en un foco, y esa es
                precisamente la primera ley.
              </li>
              <li>
                Creer que un satélite más pesado necesita ir más rápido. La masa del satélite se
                cancela en todas las fórmulas menos en la energía total.
              </li>
              <li>
                Aplicar v = √(GM/r) en una órbita elíptica. Esa fórmula solo vale para órbitas
                circulares; en general hay que usar la vis-viva.
              </li>
              <li>
                Confundir semieje mayor con distancia máxima. El semieje mayor es la media de las dos
                distancias extremas, no la mayor de ellas.
              </li>
              <li>
                Olvidar que la energía orbital es negativa y buscar el error cuando sale con signo
                menos. Una energía positiva significaría que el cuerpo escapa.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-orbitas-kepler')} />
        <ShareCard appName="simulador-orbitas-kepler" />
      </main>

      <Footer appName="simulador-orbitas-kepler" />
    </div>
  );
}
