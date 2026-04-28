'use client';
// @disclaimer: exempt

import { useState, useRef } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './Exoplanetas.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface ExoPunto {
  nombre: string;
  periodo: number;
  radio: number;
  metodo: 'transito' | 'radial' | 'imagen';
  distancia: string;
  anio: number;
  notable?: boolean;
}

interface TipoEstrella {
  id: 'M' | 'G' | 'F';
  label: string;
  color: string;
  radioHabMin: number;
  radioHabMax: number;
  radioEstrella: number;
  descripcion: string;
}

interface TipoPlaneta {
  id: string;
  nombre: string;
  descripcion: string;
  caracteristicas: string;
  ejemplos: string;
  colorRelleno: string;
  radio: number;
}

// ─────────────────────────────────────────────
// Datos: tipos estelares para zona habitable
// ─────────────────────────────────────────────

const TIPOS_ESTELARES: TipoEstrella[] = [
  {
    id: 'M',
    label: 'Enana roja (M)',
    color: '#FF6B35',
    radioHabMin: 40,
    radioHabMax: 75,
    radioEstrella: 18,
    descripcion: 'La más común (70% de estrellas). Zona habitable muy cercana. Ejemplo: Proxima Centauri, TRAPPIST-1.',
  },
  {
    id: 'G',
    label: 'Tipo Solar (G)',
    color: '#FFD700',
    radioHabMin: 80,
    radioHabMax: 130,
    radioEstrella: 28,
    descripcion: 'Como nuestro Sol. Zona habitable a distancia moderada. Ejemplo: Kepler-452, Tau Ceti.',
  },
  {
    id: 'F',
    label: 'Gigante (F)',
    color: '#FFF8DC',
    radioHabMin: 140,
    radioHabMax: 200,
    radioEstrella: 38,
    descripcion: 'Más caliente y luminosa. Zona habitable más alejada. Ejemplo: Upsilon Andromedae.',
  },
];

// Planetas conocidos para la zona habitable
const PLANETAS_ZONA = [
  { nombre: 'Venus', radioOrb: 55,  color: '#E8C97A', enZona: false, desc: 'Demasiado caliente' },
  { nombre: 'Tierra', radioOrb: 100, color: '#4A90D9', enZona: true,  desc: 'En zona habitable' },
  { nombre: 'Marte',  radioOrb: 140, color: '#C1440E', enZona: false, desc: 'Demasiado frío' },
  { nombre: 'Proxima b',   radioOrb: 50,  color: '#7FB3D3', enZona: true,  desc: 'Proxima Cen b' },
  { nombre: 'TRAPPIST-1e', radioOrb: 62,  color: '#48A9A6', enZona: true,  desc: 'TRAPPIST-1 sistema' },
  { nombre: 'Kepler-452b', radioOrb: 105, color: '#2E86AB', enZona: true,  desc: 'Prima de la Tierra' },
];

// ─────────────────────────────────────────────
// Datos: clasificación de exoplanetas
// ─────────────────────────────────────────────

const TIPOS_PLANETAS: TipoPlaneta[] = [
  {
    id: 'jupiter-caliente',
    nombre: 'Júpiter Caliente',
    descripcion: 'Gigante gaseoso en órbita muy cercana a su estrella, con períodos de menos de 10 días.',
    caracteristicas: 'Radio > 8 R⊕ · P < 10 días · T > 1.000 K',
    ejemplos: '51 Pegasi b, WASP-12b, HD 189733b',
    colorRelleno: '#E8A87C',
    radio: 28,
  },
  {
    id: 'mini-neptuno',
    nombre: 'Mini-Neptuno',
    descripcion: 'El tipo más común detectado. Atmósfera espesa de hidrógeno/helio o agua.',
    caracteristicas: 'Radio 1,5-4 R⊕ · Masa 5-20 M⊕',
    ejemplos: 'Kepler-11b, GJ 1214b, K2-18b',
    colorRelleno: '#7BAFD4',
    radio: 14,
  },
  {
    id: 'super-tierra',
    nombre: 'Super-Tierra',
    descripcion: 'Planeta rocoso más masivo que la Tierra pero sin atmósfera gaseosa dominante.',
    caracteristicas: 'Radio 1-1,5 R⊕ · Masa 1-10 M⊕',
    ejemplos: 'Proxima b, LHS 1140b, Kepler-62f',
    colorRelleno: '#7EC8A0',
    radio: 10,
  },
  {
    id: 'analogo-terrestre',
    nombre: 'Análogo Terrestre',
    descripcion: 'Planeta de tamaño y masa similares a la Tierra en zona habitable. El grial de la búsqueda.',
    caracteristicas: 'Radio ~1 R⊕ · Masa ~1 M⊕ · En zona habitable',
    ejemplos: 'Kepler-452b, Earth (referencia)',
    colorRelleno: '#4A90D9',
    radio: 8,
  },
];

// ─────────────────────────────────────────────
// Datos: puntos scatter (50 representativos)
// ─────────────────────────────────────────────

const EXOPLANETAS_SCATTER: ExoPunto[] = [
  // Notables
  { nombre: '51 Pegasi b',    periodo: 4.2,   radio: 12.0, metodo: 'radial',  distancia: '50 a.l.',   anio: 1995, notable: true },
  { nombre: 'HD 209458 b',    periodo: 3.5,   radio: 14.0, metodo: 'transito',distancia: '150 a.l.',  anio: 1999, notable: true },
  { nombre: 'Kepler-452b',    periodo: 385.0, radio: 1.6,  metodo: 'transito',distancia: '1402 a.l.', anio: 2015, notable: true },
  { nombre: 'Proxima b',      periodo: 11.2,  radio: 1.1,  metodo: 'radial',  distancia: '4.2 a.l.',  anio: 2016, notable: true },
  { nombre: 'TRAPPIST-1e',    periodo: 6.1,   radio: 0.91, metodo: 'transito',distancia: '39 a.l.',   anio: 2017, notable: true },
  { nombre: 'WASP-12b',       periodo: 1.1,   radio: 18.0, metodo: 'transito',distancia: '870 a.l.',  anio: 2008, notable: true },
  { nombre: 'GJ 1214b',       periodo: 1.6,   radio: 2.7,  metodo: 'transito',distancia: '42 a.l.',   anio: 2009, notable: true },
  { nombre: 'K2-18b',         periodo: 33.0,  radio: 2.4,  metodo: 'transito',distancia: '124 a.l.',  anio: 2015, notable: true },
  { nombre: 'HR 8799b',       periodo: 46000, radio: 12.0, metodo: 'imagen',  distancia: '129 a.l.',  anio: 2008, notable: true },
  { nombre: 'Beta Pic b',     periodo: 8500,  radio: 11.0, metodo: 'imagen',  distancia: '63 a.l.',   anio: 2009, notable: true },
  // Tránsito variados
  { nombre: 'Kepler-7b',      periodo: 4.9,   radio: 16.0, metodo: 'transito',distancia: '1000 a.l.', anio: 2010 },
  { nombre: 'Kepler-10b',     periodo: 0.84,  radio: 1.4,  metodo: 'transito',distancia: '564 a.l.',  anio: 2011 },
  { nombre: 'Kepler-22b',     periodo: 289.0, radio: 2.4,  metodo: 'transito',distancia: '587 a.l.',  anio: 2011 },
  { nombre: 'Kepler-62f',     periodo: 267.0, radio: 1.4,  metodo: 'transito',distancia: '1200 a.l.', anio: 2013 },
  { nombre: 'Kepler-186f',    periodo: 130.0, radio: 1.1,  metodo: 'transito',distancia: '492 a.l.',  anio: 2014 },
  { nombre: 'TOI-700d',       periodo: 37.0,  radio: 1.1,  metodo: 'transito',distancia: '102 a.l.',  anio: 2020 },
  { nombre: 'TRAPPIST-1b',    periodo: 1.5,   radio: 1.1,  metodo: 'transito',distancia: '39 a.l.',   anio: 2016 },
  { nombre: 'TRAPPIST-1f',    periodo: 9.2,   radio: 1.0,  metodo: 'transito',distancia: '39 a.l.',   anio: 2017 },
  { nombre: 'HD 189733b',     periodo: 2.2,   radio: 12.5, metodo: 'transito',distancia: '63 a.l.',   anio: 2005 },
  { nombre: 'CoRoT-7b',       periodo: 0.85,  radio: 1.6,  metodo: 'transito',distancia: '489 a.l.',  anio: 2009 },
  { nombre: 'Kepler-11c',     periodo: 13.0,  radio: 2.9,  metodo: 'transito',distancia: '2000 a.l.', anio: 2011 },
  { nombre: 'Kepler-11d',     periodo: 22.7,  radio: 3.1,  metodo: 'transito',distancia: '2000 a.l.', anio: 2011 },
  { nombre: 'Kepler-90b',     periodo: 7.0,   radio: 1.3,  metodo: 'transito',distancia: '2840 a.l.', anio: 2013 },
  { nombre: 'Kepler-90g',     periodo: 211.0, radio: 8.1,  metodo: 'transito',distancia: '2840 a.l.', anio: 2013 },
  { nombre: 'LHS 1140b',      periodo: 24.7,  radio: 1.4,  metodo: 'transito',distancia: '49 a.l.',   anio: 2017 },
  // Velocidad radial variados
  { nombre: 'Tau Ceti e',     periodo: 162.0, radio: 4.3,  metodo: 'radial',  distancia: '12 a.l.',   anio: 2012 },
  { nombre: 'GJ 667Cc',       periodo: 28.0,  radio: 1.5,  metodo: 'radial',  distancia: '23 a.l.',   anio: 2011 },
  { nombre: 'Gliese 876b',    periodo: 61.0,  radio: 13.0, metodo: 'radial',  distancia: '15 a.l.',   anio: 1998 },
  { nombre: 'Upsilon And b',  periodo: 4.6,   radio: 14.0, metodo: 'radial',  distancia: '44 a.l.',   anio: 1996 },
  { nombre: 'HD 40307g',      periodo: 197.0, radio: 3.0,  metodo: 'radial',  distancia: '42 a.l.',   anio: 2012 },
  { nombre: 'GJ 876c',        periodo: 30.0,  radio: 8.0,  metodo: 'radial',  distancia: '15 a.l.',   anio: 2001 },
  { nombre: 'Barnard b',      periodo: 233.0, radio: 3.2,  metodo: 'radial',  distancia: '6 a.l.',    anio: 2018 },
  { nombre: '55 Cnc e',       periodo: 0.74,  radio: 1.9,  metodo: 'radial',  distancia: '41 a.l.',   anio: 2004 },
  { nombre: 'HD 3651b',       periodo: 62.0,  radio: 9.0,  metodo: 'radial',  distancia: '36 a.l.',   anio: 2003 },
  { nombre: 'Epsilon Eri b',  periodo: 2502,  radio: 10.0, metodo: 'radial',  distancia: '10 a.l.',   anio: 2000 },
  // Imagen directa
  { nombre: 'Fomalhaut b',    periodo: 1700,  radio: 1.5,  metodo: 'imagen',  distancia: '25 a.l.',   anio: 2008 },
  { nombre: 'HR 8799c',       periodo: 19000, radio: 11.0, metodo: 'imagen',  distancia: '129 a.l.',  anio: 2010 },
  { nombre: 'HR 8799d',       periodo: 10000, radio: 10.5, metodo: 'imagen',  distancia: '129 a.l.',  anio: 2010 },
  { nombre: 'AF Lep b',       periodo: 8200,  radio: 12.0, metodo: 'imagen',  distancia: '87 a.l.',   anio: 2023 },
  // Más tránsito
  { nombre: 'Kepler-16b',     periodo: 229.0, radio: 8.5,  metodo: 'transito',distancia: '200 a.l.',  anio: 2011 },
  { nombre: 'HAT-P-7b',       periodo: 2.2,   radio: 14.0, metodo: 'transito',distancia: '1043 a.l.', anio: 2008 },
  { nombre: 'WASP-17b',       periodo: 3.7,   radio: 18.5, metodo: 'transito',distancia: '1000 a.l.', anio: 2009 },
  { nombre: 'Kepler-69c',     periodo: 242.0, radio: 1.7,  metodo: 'transito',distancia: '2700 a.l.', anio: 2013 },
  { nombre: 'Kepler-442b',    periodo: 112.0, radio: 1.3,  metodo: 'transito',distancia: '1200 a.l.', anio: 2015 },
  { nombre: 'Kepler-1649c',   periodo: 19.5,  radio: 1.06, metodo: 'transito',distancia: '301 a.l.',  anio: 2020 },
  { nombre: 'TOI-1452b',      periodo: 11.1,  radio: 1.7,  metodo: 'transito',distancia: '100 a.l.',  anio: 2022 },
  { nombre: 'Wolf 1069b',     periodo: 15.6,  radio: 1.3,  metodo: 'radial',  distancia: '31 a.l.',   anio: 2023 },
  { nombre: 'Gliese 436b',    periodo: 2.6,   radio: 3.9,  metodo: 'transito',distancia: '33 a.l.',   anio: 2004 },
  { nombre: 'HD 97658b',      periodo: 9.5,   radio: 2.2,  metodo: 'transito',distancia: '69 a.l.',   anio: 2011 },
  { nombre: '55 Cnc f',       periodo: 260.0, radio: 5.0,  metodo: 'radial',  distancia: '41 a.l.',   anio: 2007 },
];

const COLORES_METODO: Record<string, string> = {
  transito: '#2E86AB',
  radial: '#E8A02A',
  imagen: '#48A9A6',
};

// ─────────────────────────────────────────────
// Helpers scatter (escala logarítmica)
// ─────────────────────────────────────────────

const LOG_MIN_P = Math.log10(0.5);
const LOG_MAX_P = Math.log10(60000);
const LOG_MIN_R = Math.log10(0.7);
const LOG_MAX_R = Math.log10(22);

const toSvgX = (periodo: number, svgW: number, pad: number): number => {
  const lp = Math.log10(Math.max(periodo, 0.5));
  return pad + ((lp - LOG_MIN_P) / (LOG_MAX_P - LOG_MIN_P)) * (svgW - 2 * pad);
};

const toSvgY = (radio: number, svgH: number, pad: number): number => {
  const lr = Math.log10(Math.max(radio, 0.7));
  return svgH - pad - ((lr - LOG_MIN_R) / (LOG_MAX_R - LOG_MIN_R)) * (svgH - 2 * pad);
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorExoplanetas() {
  // Tránsito
  const [tamanioPlaneta, setTamanioPlaneta] = useState(18);

  // Velocidad radial
  const [masaPlaneta, setMasaPlaneta] = useState(50);

  // Zona habitable
  const [tipoEstrella, setTipoEstrella] = useState<'M' | 'G' | 'F'>('G');

  // Scatter tooltip
  const [puntoPulsado, setPuntoPulsado] = useState<ExoPunto | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const estrella = TIPOS_ESTELARES.find(t => t.id === tipoEstrella) ?? TIPOS_ESTELARES[1];

  // Calcular datos del tránsito
  const bloqueoBrillo = ((tamanioPlaneta / 120) ** 2 * 100).toFixed(2);
  const periodoEstimado = (tamanioPlaneta * 0.8).toFixed(1);
  const radioEstimado = (tamanioPlaneta * 0.06).toFixed(2);

  // Wobble amplitude según masa
  const wobbleAmp = Math.round((masaPlaneta / 100) * 14);

  // Curva de luz — puntos SVG
  const buildCurvaLuz = (): string => {
    const w = 380;
    const h = 80;
    const caida = parseFloat(bloqueoBrillo) * 0.6;
    const midX = w / 2;
    const baseY = h * 0.2;
    const dipY = baseY + Math.min(caida * 3, h * 0.6);
    const dipWidth = tamanioPlaneta * 1.2;

    const pts: string[] = [];
    for (let x = 0; x <= w; x += 4) {
      let y = baseY;
      const dx = Math.abs(x - midX);
      if (dx < dipWidth) {
        const factor = 1 - (dx / dipWidth) ** 2;
        y = baseY + (dipY - baseY) * factor;
      }
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  // Curva sinusoidal velocidad radial
  const buildCurvaRadial = (): string => {
    const w = 380;
    const h = 80;
    const amp = wobbleAmp * 0.8;
    const midY = h / 2;
    const pts: string[] = [];
    for (let x = 0; x <= w; x += 3) {
      const y = midY + amp * Math.sin((x / w) * Math.PI * 2);
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  const handlePuntoClick = (p: ExoPunto) => {
    setPuntoPulsado(prev => (prev?.nombre === p.nombre ? null : p));
  };

  // Scatter SVG dimensions
  const SW = 560;
  const SH = 340;
  const SPAD = 48;

  // Ejes scatter labels
  const etiquetasX = [
    { v: 1,    l: '1d' },
    { v: 10,   l: '10d' },
    { v: 100,  l: '100d' },
    { v: 1000, l: '1a' },
    { v: 10000,l: '27a' },
  ];
  const etiquetasY = [
    { v: 1,  l: '1 R⊕' },
    { v: 2,  l: '2' },
    { v: 4,  l: '4' },
    { v: 8,  l: '8' },
    { v: 16, l: '16' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcono} aria-hidden="true">🪐</span>
        <h1>Visualizador de Exoplanetas</h1>
        <p>
          Cómo detectamos mundos lejanos, la zona donde podría existir vida
          y la asombrosa diversidad de los 5.500+ exoplanetas confirmados.
        </p>
      </header>

      <LegalNotice />

      {/* ═══ SECCIÓN 1: MÉTODO DE TRÁNSITO ═══ */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Método de Tránsito</h2>
        <p className={styles.subtituloSeccion}>
          Cuando un planeta pasa por delante de su estrella, bloquea una pequeña fracción de luz.
          Ajusta el tamaño del planeta para ver cómo cambia la curva de luz.
        </p>

        <div className={styles.transitoWrapper}>
          {/* Animación SVG tránsito */}
          <div className={styles.transitoSvgBox}>
            <svg width="300" height="200" viewBox="0 0 300 200" aria-label="Animación método de tránsito">
              {/* Fondo espacio */}
              <rect width="300" height="200" fill="#0a0a1a" rx="8" />
              {/* Estrellas de fondo */}
              {[
                [20,15],[50,30],[80,12],[110,45],[140,20],[170,35],[200,10],[230,40],[260,18],[285,28],
                [30,80],[70,95],[150,70],[210,85],[270,75],[10,160],[60,145],[120,170],[190,155],[250,165],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="1" fill="white" opacity="0.4" />
              ))}
              {/* Órbita */}
              <ellipse cx="150" cy="120" rx="90" ry="12" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              {/* Estrella */}
              <defs>
                <radialGradient id="gradEstrella" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF5AA" />
                  <stop offset="60%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.8" />
                </radialGradient>
              </defs>
              <circle cx="150" cy="120" r="42" fill="url(#gradEstrella)" />
              {/* Planeta en órbita */}
              <g
                style={{
                  transformOrigin: '150px 120px',
                  animation: 'orbitarPlaneta 6s linear infinite',
                  // Las variables CSS las gestionamos inline para compatibilidad
                }}
              >
                <circle
                  cx={150 + 90}
                  cy={120}
                  r={tamanioPlaneta / 4}
                  fill="#2E86AB"
                  opacity="0.95"
                />
              </g>
              {/* Etiqueta */}
              <text x="150" y="188" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">
                Vista desde el plano orbital
              </text>
            </svg>
          </div>

          {/* Controles y curva de luz */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.controlSlider}>
              <label className={styles.sliderLabel} htmlFor="slider-planeta">
                Tamaño del planeta: <span>{tamanioPlaneta} px</span>
              </label>
              <input
                id="slider-planeta"
                type="range"
                min={6}
                max={36}
                value={tamanioPlaneta}
                onChange={e => setTamanioPlaneta(Number(e.target.value))}
                className={styles.sliderInput}
                aria-label="Tamaño del planeta"
              />
            </div>

            <div className={styles.curvaLuzBox}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', textAlign: 'center' }}>
                Curva de luz (brillo vs tiempo)
              </p>
              <svg width="100%" viewBox="0 0 380 90" aria-label="Curva de luz del tránsito">
                <rect width="380" height="90" fill="var(--bg-card)" />
                {/* Línea base */}
                <line x1="0" y1="16" x2="380" y2="16" stroke="rgba(100,100,100,0.2)" strokeWidth="1" />
                {/* Curva */}
                <polyline
                  points={buildCurvaLuz()}
                  fill="none"
                  stroke="#2E86AB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <text x="10" y="85" fontSize="9" fill="var(--text-muted)">Tiempo →</text>
                <text x="350" y="24" fontSize="9" fill="var(--text-muted)" textAnchor="end">Brillo</text>
              </svg>
            </div>

            <div className={styles.datosTransito} role="status" aria-live="polite">
              <span className={styles.datoChip}>Brillo bloqueado: {bloqueoBrillo}%</span>
              <span className={styles.datoChip}>Período estimado: {periodoEstimado} días</span>
              <span className={styles.datoChip}>Radio: ~{radioEstimado} R⊕</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 2: VELOCIDAD RADIAL ═══ */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Método de Velocidad Radial</h2>
        <p className={styles.subtituloSeccion}>
          Un planeta hace oscilar ligeramente su estrella. Midiendo el efecto Doppler de esa
          oscilación detectamos el planeta. Mayor masa → mayor wobble detectable.
        </p>

        <div className={styles.radialWrapper}>
          {/* Controles */}
          <div className={styles.controlSlider}>
            <label className={styles.sliderLabel} htmlFor="slider-masa">
              Masa del planeta: <span>{masaPlaneta} M⊕</span>
            </label>
            <input
              id="slider-masa"
              type="range"
              min={1}
              max={300}
              value={masaPlaneta}
              onChange={e => setMasaPlaneta(Number(e.target.value))}
              className={styles.sliderInput}
              aria-label="Masa del planeta"
            />
          </div>

          {/* SVG wobble */}
          <div className={styles.radialSvgBox}>
            <svg width="300" height="160" viewBox="0 0 300 160" aria-label="Visualización velocidad radial">
              <rect width="300" height="160" fill="#0a0a1a" rx="8" />
              {/* Estrellas fondo */}
              {[[10,10],[40,25],[90,8],[160,20],[220,15],[270,30],[30,130],[100,140],[200,125],[260,140]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="0.8" fill="white" opacity="0.4" />
              ))}
              {/* Observador */}
              <text x="150" y="148" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">
                👁 Observador (nosotros)
              </text>
              {/* Flechas blueshift/redshift */}
              <text x="30" y="90" fontSize="8" fill="#4A9EFF">← Blueshift</text>
              <text x="220" y="90" fontSize="8" fill="#FF6B6B">Redshift →</text>
              {/* Estrella con wobble */}
              <g
                style={{
                  transformOrigin: '150px 75px',
                  animation: `wobbleEstrella ${4}s ease-in-out infinite`,
                }}
                className={styles.wobbleGroup}
              >
                <defs>
                  <radialGradient id="gradWobble" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF5AA" />
                    <stop offset="60%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.8" />
                  </radialGradient>
                </defs>
                <circle cx="150" cy="75" r="28" fill="url(#gradWobble)" />
              </g>
            </svg>
          </div>

          {/* Curva sinusoidal velocidad radial */}
          <div className={styles.curvaLuzBox}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem', textAlign: 'center' }}>
              Velocidad radial (m/s) vs tiempo
            </p>
            <svg width="100%" viewBox="0 0 380 90" aria-label="Curva de velocidad radial">
              <rect width="380" height="90" fill="var(--bg-card)" />
              <line x1="0" y1="45" x2="380" y2="45" stroke="rgba(100,100,100,0.3)" strokeWidth="1" strokeDasharray="4,4" />
              <polyline
                points={buildCurvaRadial()}
                fill="none"
                stroke="#E8A02A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Zonas blueshift / redshift */}
              <text x="10" y="38" fontSize="9" fill="#4A9EFF">← hacia nosotros</text>
              <text x="10" y="75" fontSize="9" fill="#FF6B6B">← alejándose</text>
            </svg>
          </div>

          <div className={styles.leyendaRadial}>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaDot} style={{ background: '#4A9EFF' }} />
              <span>Blueshift (acercándose)</span>
            </span>
            <span className={styles.leyendaItem}>
              <span className={styles.leyendaDot} style={{ background: '#FF6B6B' }} />
              <span>Redshift (alejándose)</span>
            </span>
          </div>

          <div className={styles.datosTransito} role="status" aria-live="polite">
            <span className={styles.datoChip}>Amplitud wobble: {wobbleAmp} m/s</span>
            <span className={styles.datoChip}>
              {masaPlaneta < 10 ? 'Supertierra / mini-Neptuno' : masaPlaneta < 100 ? 'Planeta tipo Neptuno' : 'Gigante gaseoso'}
            </span>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 3: ZONA HABITABLE ═══ */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Zona de Goldilocks — La Zona Habitable</h2>
        <p className={styles.subtituloSeccion}>
          La región alrededor de una estrella donde el agua puede existir en estado líquido.
          Su posición depende de la temperatura y luminosidad de la estrella.
        </p>

        <div className={styles.zonaWrapper}>
          {/* Toggle tipo estelar */}
          <div className={styles.tiposBotones} role="group" aria-label="Seleccionar tipo de estrella">
            {TIPOS_ESTELARES.map(t => (
              <button
                key={t.id}
                className={`${styles.btnTipo} ${tipoEstrella === t.id ? styles.btnTipoActivo : ''}`}
                onClick={() => setTipoEstrella(t.id)}
                aria-pressed={tipoEstrella === t.id}
              >
                {t.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            {estrella.descripcion}
          </p>

          {/* SVG zona habitable */}
          <div className={styles.zonaSvgBox}>
            <svg width="100%" viewBox="0 0 500 260" aria-label={`Zona habitable para estrella tipo ${tipoEstrella}`}>
              <rect width="500" height="260" fill="#0a0a1a" rx="10" />
              {/* Estrellas decorativas */}
              {[[20,20],[60,40],[120,15],[200,30],[300,18],[400,35],[470,20],[30,200],[90,220],[180,205],[280,215],[390,200],[460,210]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="0.8" fill="white" opacity="0.3" />
              ))}

              {/* Banda zona habitable */}
              <defs>
                <radialGradient id="zonaHab" cx="0%" cy="50%" r="100%" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset={`${estrella.radioHabMin * 0.55}%`} stopColor="transparent" />
                  <stop offset={`${estrella.radioHabMin * 0.6}%`} stopColor="#2d7a2d" stopOpacity="0.3" />
                  <stop offset={`${estrella.radioHabMax * 0.6}%`} stopColor="#2d7a2d" stopOpacity="0.3" />
                  <stop offset={`${estrella.radioHabMax * 0.65}%`} stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* Anillos de órbita */}
              {[50, 80, 110, 150, 190, 230].map((r, i) => (
                <circle
                  key={i}
                  cx="60"
                  cy="130"
                  r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
              ))}

              {/* Zona habitable verde */}
              <path
                d={`M 60 130
                    m ${estrella.radioHabMin} 0
                    a ${estrella.radioHabMin} ${estrella.radioHabMin * 0.35} 0 0 1 0 0
                    `}
                fill="none"
              />
              {/* Arco zona habitable */}
              <defs>
                <clipPath id="clipRight">
                  <rect x="60" y="0" width="450" height="260" />
                </clipPath>
              </defs>
              <g clipPath="url(#clipRight)">
                <circle
                  cx="60" cy="130"
                  r={estrella.radioHabMax}
                  fill="rgba(0,180,0,0.12)"
                  stroke="rgba(0,200,0,0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
                <circle
                  cx="60" cy="130"
                  r={estrella.radioHabMin}
                  fill="#0a0a1a"
                  stroke="rgba(0,200,0,0.3)"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                />
              </g>

              {/* Estrella central */}
              <defs>
                <radialGradient id="gradZonaEstrella" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF5AA" />
                  <stop offset="60%" stopColor={estrella.color} />
                  <stop offset="100%" stopColor="#FF6600" stopOpacity="0.7" />
                </radialGradient>
              </defs>
              <circle cx="60" cy="130" r={estrella.radioEstrella} fill={`url(#gradZonaEstrella)`} />

              {/* Planetas */}
              {PLANETAS_ZONA.filter(p => {
                // Mostrar según tipo estelar
                if (tipoEstrella === 'M') return p.radioOrb < 80;
                if (tipoEstrella === 'G') return p.radioOrb >= 40 && p.radioOrb <= 180;
                return p.radioOrb >= 80;
              }).map((pl, i) => {
                const r = tipoEstrella === 'M' ? pl.radioOrb * 0.65
                        : tipoEstrella === 'F' ? pl.radioOrb * 1.15
                        : pl.radioOrb;
                const orb = Math.min(r, 420);
                const px = 60 + orb;
                const inZona = px >= (60 + estrella.radioHabMin) && px <= (60 + estrella.radioHabMax);
                return (
                  <g key={i}>
                    <circle cx={px} cy="130" r="5" fill={pl.color} opacity="0.9" />
                    <text
                      x={px}
                      y="115"
                      textAnchor="middle"
                      fontSize="8"
                      fill={inZona ? '#7FE090' : 'rgba(255,255,255,0.55)'}
                    >
                      {pl.nombre}
                    </text>
                  </g>
                );
              })}

              {/* Etiqueta zona */}
              <text
                x={60 + (estrella.radioHabMin + estrella.radioHabMax) / 2}
                y="160"
                textAnchor="middle"
                fontSize="9"
                fill="rgba(100,220,100,0.7)"
              >
                Zona habitable
              </text>
            </svg>
          </div>

          <div className={styles.leyendaZona}>
            <span className={styles.leyendaZonaItem}>
              <span className={styles.leyendaCircle} style={{ background: 'rgba(0,200,0,0.4)', border: '1px dashed rgba(0,200,0,0.6)' }} />
              <span>Zona habitable</span>
            </span>
            <span className={styles.leyendaZonaItem}>
              <span className={styles.leyendaCircle} style={{ background: '#4A90D9' }} />
              <span>Tierra / análogos</span>
            </span>
            <span className={styles.leyendaZonaItem}>
              <span className={styles.leyendaCircle} style={{ background: '#48A9A6' }} />
              <span>TRAPPIST-1e</span>
            </span>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN 4: CLASIFICACIÓN ═══ */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Clasificación de Exoplanetas</h2>
        <p className={styles.subtituloSeccion}>
          Los más de 5.500 mundos conocidos se agrupan en categorías según tamaño y composición.
        </p>

        <div className={styles.clasificacionGrid}>
          {TIPOS_PLANETAS.map(tp => (
            <div key={tp.id} className={styles.clasificacionCard}>
              <div className={styles.cardSvgWrapper}>
                <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="8" fill="#0a0a1a" />
                  <defs>
                    <radialGradient id={`grad-${tp.id}`} cx="40%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                      <stop offset="100%" stopColor={tp.colorRelleno} />
                    </radialGradient>
                  </defs>
                  {/* Anillo de fondo */}
                  <circle cx="40" cy="40" r={tp.radio + 4} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <circle cx="40" cy="40" r={tp.radio} fill={`url(#grad-${tp.id})`} />
                  {tp.id === 'jupiter-caliente' && (
                    <ellipse cx="40" cy="40" rx={tp.radio + 8} ry="5" fill="none" stroke={tp.colorRelleno} strokeWidth="1.5" opacity="0.5" />
                  )}
                </svg>
              </div>
              <h3 className={styles.cardTitulo}>{tp.nombre}</h3>
              <p className={styles.cardDesc}>{tp.descripcion}</p>
              <p className={styles.cardDesc} style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{tp.caracteristicas}</p>
              <p className={styles.cardEjemplos}>Ej: {tp.ejemplos}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECCIÓN 5: DISTRIBUCIÓN SCATTER ═══ */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Distribución de los 5.500+ Exoplanetas</h2>
        <p className={styles.subtituloSeccion}>
          Período orbital vs. radio en radios terrestres para una muestra de mundos confirmados.
          Haz clic en un punto para ver detalles. Escalas logarítmicas.
        </p>

        <div className={styles.scatterWrapper}>
          <svg
            ref={svgRef}
            className={styles.scatterSvg}
            viewBox={`0 0 ${SW} ${SH}`}
            aria-label="Gráfico de dispersión de exoplanetas"
          >
            {/* Fondo */}
            <rect width={SW} height={SH} fill="var(--bg-card)" rx="8" />

            {/* Grid */}
            {etiquetasX.map(({ v }) => {
              const x = toSvgX(v, SW, SPAD);
              return (
                <line key={v} x1={x} y1={SPAD} x2={x} y2={SH - SPAD}
                  stroke="rgba(150,150,150,0.15)" strokeWidth="1" />
              );
            })}
            {etiquetasY.map(({ v }) => {
              const y = toSvgY(v, SH, SPAD);
              return (
                <line key={v} x1={SPAD} y1={y} x2={SW - SPAD / 2} y2={y}
                  stroke="rgba(150,150,150,0.15)" strokeWidth="1" />
              );
            })}

            {/* Etiquetas X */}
            {etiquetasX.map(({ v, l }) => (
              <text key={v} x={toSvgX(v, SW, SPAD)} y={SH - SPAD / 2 + 6}
                textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                {l}
              </text>
            ))}

            {/* Etiquetas Y */}
            {etiquetasY.map(({ v, l }) => (
              <text key={v} x={SPAD - 6} y={toSvgY(v, SH, SPAD) + 3}
                textAnchor="end" fontSize="9" fill="var(--text-muted)">
                {l}
              </text>
            ))}

            {/* Títulos ejes */}
            <text x={SW / 2} y={SH - 4} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">
              Período orbital (días) →
            </text>
            <text
              x={12}
              y={SH / 2}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-secondary)"
              transform={`rotate(-90, 12, ${SH / 2})`}
            >
              Radio (R⊕) →
            </text>

            {/* Puntos */}
            {EXOPLANETAS_SCATTER.map((p, i) => {
              const x = toSvgX(p.periodo, SW, SPAD);
              const y = toSvgY(p.radio, SH, SPAD);
              const color = COLORES_METODO[p.metodo];
              const isPulsado = puntoPulsado?.nombre === p.nombre;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={p.notable ? 6 : 4}
                  fill={color}
                  opacity={isPulsado ? 1 : 0.75}
                  stroke={isPulsado ? 'white' : (p.notable ? 'rgba(255,255,255,0.4)' : 'none')}
                  strokeWidth={isPulsado ? 2 : 1}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handlePuntoClick(p)}
                  role="button"
                  aria-label={`${p.nombre}, período ${p.periodo} días, radio ${p.radio} R⊕`}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePuntoClick(p); }}
                />
              );
            })}

            {/* Tooltip inline para punto seleccionado */}
            {puntoPulsado && (() => {
              const tx = toSvgX(puntoPulsado.periodo, SW, SPAD);
              const ty = toSvgY(puntoPulsado.radio, SH, SPAD);
              const bx = Math.min(tx + 8, SW - 180);
              const by = Math.max(ty - 80, SPAD);
              return (
                <g>
                  <rect x={bx} y={by} width="175" height="75" rx="6"
                    fill="var(--bg-card)" stroke="rgba(46,134,171,0.5)" strokeWidth="1" />
                  <text x={bx + 8} y={by + 16} fontSize="10" fontWeight="700" fill="var(--primary)">
                    {puntoPulsado.nombre}
                  </text>
                  <text x={bx + 8} y={by + 30} fontSize="9" fill="var(--text-secondary)">
                    Período: {puntoPulsado.periodo} días
                  </text>
                  <text x={bx + 8} y={by + 43} fontSize="9" fill="var(--text-secondary)">
                    Radio: {puntoPulsado.radio} R⊕ · {puntoPulsado.distancia}
                  </text>
                  <text x={bx + 8} y={by + 56} fontSize="9" fill="var(--text-secondary)">
                    Descubierto: {puntoPulsado.anio} · {puntoPulsado.metodo}
                  </text>
                  <text x={bx + 8} y={by + 69} fontSize="9" fill="var(--text-muted)" style={{ cursor: 'pointer' }}
                    onClick={() => setPuntoPulsado(null)}>
                    [cerrar]
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Leyenda */}
          <div className={styles.scatterLeyenda}>
            {Object.entries(COLORES_METODO).map(([metodo, color]) => (
              <span key={metodo} className={styles.scatterLeyendaItem}>
                <span className={styles.leyendaCircle} style={{ background: color, width: 10, height: 10, borderRadius: '50%' }} />
                <span>{metodo === 'transito' ? 'Tránsito' : metodo === 'radial' ? 'Vel. radial' : 'Imagen directa'}</span>
              </span>
            ))}
            <span className={styles.scatterLeyendaItem}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'rgba(150,150,150,0.3)', border: '1px solid rgba(255,255,255,0.3)', display: 'inline-block' }} />
              <span>Notable (anillo blanco)</span>
            </span>
          </div>
        </div>
      </section>

      {/* ═══ SECCIÓN EDUCATIVA v2.0 ═══ */}
      <EducationalSection
        title="¿Cómo encontramos otros mundos?"
        subtitle="Historia, métodos de detección, sistemas prometedores y la gran pregunta sobre la vida en el universo"
        icon="🔭"
        defaultOpen={false}
      >
        <div>
          <h3>De Copérnico a 51 Pegasi b</h3>
          <p>
            Durante siglos, los planetas extrasolares fueron solo especulación filosófica. En 1992, Aleksander
            Wolszczan detectó los primeros planetas confirmados orbitando un púlsar (PSR B1257+12). Sin embargo,
            el hito que cambió todo llegó en 1995: Michel Mayor y Didier Queloz anunciaron la detección de
            51 Pegasi b mediante velocidad radial, el primer exoplaneta alrededor de una estrella similar al Sol.
            En 2019, ambos recibieron el Premio Nobel de Física por este descubrimiento. Hoy, más de 5.500
            exoplanetas están confirmados y miles más aguardan verificación.
          </p>

          <h3>Los 5 métodos de detección</h3>
          <p>
            <strong>Tránsito (75% de descubrimientos):</strong> El planeta pasa por delante de la estrella y reduce
            su brillo. El telescopio Kepler (2009-2018) confirmó más de 2.600 exoplanetas con este método,
            mirando ~150.000 estrellas en una pequeña porción del cielo.
          </p>
          <p>
            <strong>Velocidad radial:</strong> El planeta hace oscilar la estrella. Se mide el desplazamiento
            Doppler del espectro estelar. Detecta mejor planetas masivos en órbitas cercanas.
          </p>
          <p>
            <strong>Microlente gravitacional:</strong> La gravedad de una estrella intermedia actúa como lente,
            amplificando la luz de una estrella de fondo. Evento único, irrepetible. Permite detectar planetas
            muy lejanos o incluso planetas huérfanos sin estrella.
          </p>
          <p>
            <strong>Imagen directa:</strong> Fotografiar directamente el planeta. Extremadamente difícil: es como
            ver una luciérnaga junto a un foco. Solo posible para gigantes gaseosos jóvenes muy alejados de
            su estrella. Ejemplos: HR 8799 bcde, Beta Pictoris b.
          </p>
          <p>
            <strong>Astrometría:</strong> Medir el movimiento de la estrella en el cielo causado por el planeta.
            La misión Gaia (ESA) promete revelar miles de planetas con este método en sus próximos catálogos.
          </p>

          <h3>La zona habitable: condiciones para la vida</h3>
          <p>
            La zona habitable (o zona de Goldilocks) es la región donde la temperatura permite agua líquida
            en la superficie. Pero "habitable" no significa "habitado": necesitamos también una atmósfera
            estable, campo magnético protector, ausencia de radiación letal y estabilidad orbital a largo plazo.
            Las estrellas enanas rojas tipo M, aunque las más comunes, emiten fuertes llamaradas que podrían
            erosionar atmósferas de planetas en su zona habitable.
          </p>

          <h3>TRAPPIST-1: el sistema más prometedor</h3>
          <p>
            A solo 39 años luz de distancia, TRAPPIST-1 es una enana roja ultrafría con 7 planetas rocosos,
            3 de ellos (d, e, f) en la zona habitable. Son los planetas más parecidos a la Tierra fuera del
            sistema solar conocidos hasta 2026. El telescopio James Webb ya ha analizado sus atmósferas:
            TRAPPIST-1b parece no tener atmósfera significativa, pero los planetas de la zona habitable
            siguen siendo objetivos prioritarios de observación.
          </p>

          <h3>James Webb Space Telescope: el detective de atmósferas</h3>
          <p>
            Lanzado en diciembre de 2021, el JWST es la herramienta más poderosa para estudiar exoplanetas.
            Mediante espectroscopía de transmisión, analiza qué moléculas hay en las atmósferas cuando el
            planeta transita su estrella. Ya ha detectado CO₂, agua, SO₂ en exoplanetas. En K2-18b detectó
            posiblemente dimetil sulfuro (DMS), una molécula de origen biológico en la Tierra, aunque los
            científicos son muy cautelosos con esta interpretación.
          </p>

          <h3>La ecuación de Drake y la paradoja de Fermi</h3>
          <p>
            En 1961, Frank Drake formuló su famosa ecuación para estimar el número de civilizaciones
            tecnológicas en la Vía Láctea: N = R★ × fp × ne × fl × fi × fc × L. Los factores astronómicos
            (tasa de formación estelar, fracción con planetas, planetas habitables) están ahora bastante bien
            acotados. Los factores biológicos e inteligentes siguen siendo profundamente inciertos.
          </p>
          <p>
            La paradoja de Fermi plantea la pregunta contraria: si el universo tiene tantos planetas potencialmente
            habitables, ¿dónde está todo el mundo? Las respuestas van desde "estamos solos" hasta "no nos han
            encontrado todavía" pasando por el "filtro de la Gran Muralla". La búsqueda de vida más allá de la
            Tierra, ya sea microbiana o inteligente, es una de las empresas científicas más importantes del
            siglo XXI.
          </p>

          <div className={styles.warningBox}>
            <strong>¿Cuántos mundos hay realmente?</strong>
            De los 5.500+ exoplanetas confirmados, la mayoría fueron descubiertos por el telescopio Kepler
            mirando solo una pequeña fracción del cielo —aproximadamente el 0,25% de la esfera celeste.
            Si extrapolamos esos resultados al conjunto de la Vía Láctea, los modelos estadísticos sugieren
            que podría haber más de 100.000 millones de exoplanetas solo en nuestra galaxia, con al menos
            uno por cada estrella en promedio. Y la Vía Láctea es solo una de los ~2 billones de galaxias
            observables.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-exoplanetas')} />
      <ShareCard appName="visualizador-exoplanetas" />
      <Footer appName="visualizador-exoplanetas" />
    </div>
  );
}
