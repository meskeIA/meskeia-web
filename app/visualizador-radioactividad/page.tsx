'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './Radioactividad.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Tab = 'tipos' | 'desintegracion' | 'carbono14' | 'dosis';

type TipoRadiacion = 'alfa' | 'betaMenos' | 'betaMas' | 'gamma' | 'neutrones';

interface InfoRadiacion {
  id: TipoRadiacion;
  simbolo: string;
  nombre: string;
  particula: string;
  carga: string;
  masa: string;
  ionizacion: string;
  alcanceAire: string;
  blindaje: string;
  ejemplo: string;
  color: string;
  uso: string;
}

interface IsotopoPreset {
  nombre: string;
  simbolo: string;
  vidaMediaAnios: number;
  unidad: string;
  vidaMediaDisplay: string;
  uso: string;
}

interface EjemploC14 {
  nombre: string;
  actividadPct: number;
  descripcion: string;
}

interface FuenteDosis {
  nombre: string;
  dosis: string;
  dosisNum: number;
  tipo: 'natural' | 'medica' | 'actividad';
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const TIPOS_RADIACION: InfoRadiacion[] = [
  {
    id: 'alfa',
    simbolo: 'α',
    nombre: 'Radiación Alfa',
    particula: 'Núcleo de He-4 (2 protones + 2 neutrones)',
    carga: '+2',
    masa: '4 u (6,64 × 10⁻²⁷ kg)',
    ionizacion: 'Muy alta (~20× respecto a γ)',
    alcanceAire: '~3–8 cm',
    blindaje: 'Papel, piel, 5 cm de aire',
    ejemplo: '²²⁶Ra → ²²²Rn + α',
    color: '#e74c3c',
    uso: 'Detectores de humo (Am-241), radioterapia dirigida (PSMA-617)',
  },
  {
    id: 'betaMenos',
    simbolo: 'β⁻',
    nombre: 'Radiación Beta (β⁻)',
    particula: 'Electrón de alta energía',
    carga: '−1',
    masa: '~0,0005 u (9,11 × 10⁻³¹ kg)',
    ionizacion: 'Moderada',
    alcanceAire: '~1–10 m (varía con energía)',
    blindaje: '~1 cm de aluminio o plástico',
    ejemplo: '¹⁴C → ¹⁴N + e⁻ + ν̄ₑ',
    color: '#f39c12',
    uso: 'Tratamiento cáncer de tiroides con I-131, diagnóstico PET (F-18)',
  },
  {
    id: 'betaMas',
    simbolo: 'β⁺',
    nombre: 'Radiación Beta (β⁺)',
    particula: 'Positrón (antielectrón)',
    carga: '+1',
    masa: '~0,0005 u (igual que electrón)',
    ionizacion: 'Moderada (se aniquila con e⁻)',
    alcanceAire: 'Pocos mm–cm (aniquilación rápida)',
    blindaje: '~1 cm aluminio + 1 cm plomo (fotones aniquilación)',
    ejemplo: '¹⁸F → ¹⁸O + e⁺ + νₑ → 2γ (511 keV)',
    color: '#8e44ad',
    uso: 'PET (Tomografía por Emisión de Positrones): oncología, neurología',
  },
  {
    id: 'gamma',
    simbolo: 'γ',
    nombre: 'Radiación Gamma',
    particula: 'Fotón de alta energía (≥ 0,1 MeV)',
    carga: '0',
    masa: '0',
    ionizacion: 'Baja por interacción (muy penetrante)',
    alcanceAire: 'Cientos de metros',
    blindaje: 'Varios cm de plomo o hormigón denso',
    ejemplo: '⁶⁰Co → ⁶⁰Ni + β⁻ + 2γ (1,17 y 1,33 MeV)',
    color: '#2E86AB',
    uso: 'Radioterapia (Co-60, Ir-192), esterilización de alimentos, gammagrafía industrial',
  },
  {
    id: 'neutrones',
    simbolo: 'n',
    nombre: 'Neutrones',
    particula: 'Neutrón libre',
    carga: '0',
    masa: '1 u (1,675 × 10⁻²⁷ kg)',
    ionizacion: 'Indirecta (activan núcleos; Q = 5–20)',
    alcanceAire: 'Varios metros (según energía)',
    blindaje: 'Parafina, agua, polietileno (moderadores)',
    ejemplo: 'Fisión ²³⁵U + n → ¹⁴¹Ba + ⁹²Kr + 3n',
    color: '#48A9A6',
    uso: 'Reactores nucleares, neutrografía, producción de isótopos médicos en ciclotrón',
  },
];

const ISOTOPOS: IsotopoPreset[] = [
  { nombre: 'C-14 (Carbono-14)', simbolo: '¹⁴C', vidaMediaAnios: 5730, unidad: 'años', vidaMediaDisplay: '5.730 años', uso: 'Datación arqueológica (hasta ~50.000 años)' },
  { nombre: 'I-131 (Yodo-131)', simbolo: '¹³¹I', vidaMediaAnios: 8 / 365, unidad: 'días', vidaMediaDisplay: '8 días', uso: 'Tratamiento cáncer de tiroides' },
  { nombre: 'Tc-99m (Tecnecio)', simbolo: '⁹⁹ᵐTc', vidaMediaAnios: 6 / 8760, unidad: 'horas', vidaMediaDisplay: '6 horas', uso: 'Diagnóstico: gammagrafía ósea, cardíaca' },
  { nombre: 'Ra-226 (Radio-226)', simbolo: '²²⁶Ra', vidaMediaAnios: 1601, unidad: 'años', vidaMediaDisplay: '1.601 años', uso: 'Histórico: primeros estudios de Marie Curie' },
  { nombre: 'U-238 (Uranio-238)', simbolo: '²³⁸U', vidaMediaAnios: 4468000000, unidad: 'Ga', vidaMediaDisplay: '4.468 Ga', uso: 'Datación geológica (edad de la Tierra)' },
];

const EJEMPLOS_C14: EjemploC14[] = [
  { nombre: 'Lienzo moderno (control)', actividadPct: 100, descripcion: 'Actividad actual estándar. Organismo vivo o muerto recientemente.' },
  { nombre: 'Sábana Santa de Turín', actividadPct: 91.7, descripcion: 'Datada por C-14 en 1988 entre 1260 y 1390 d.C. (~700 años).' },
  { nombre: 'Ötzi (Hombre de Hielo)', actividadPct: 52.5, descripcion: 'Momia alpina de los Alpes. Edad: ~5.300 años (3300 a.C.).' },
  { nombre: 'Carbón vegetal neolítico', actividadPct: 29.1, descripcion: 'Restos de fuego neolítico. Edad estimada: ~10.000 años.' },
  { nombre: 'Hueso del Paleolítico', actividadPct: 2.3, descripcion: 'Fósil humano del Paleolítico. Edad: ~30.000 años. Cerca del límite del método.' },
];

const FUENTES_DOSIS: FuenteDosis[] = [
  { nombre: 'Fondo cósmico (nivel del mar)', dosis: '0,39 mSv/año', dosisNum: 0.39, tipo: 'natural' },
  { nombre: 'Radón en interiores', dosis: '1,15 mSv/año', dosisNum: 1.15, tipo: 'natural' },
  { nombre: 'Alimentos (K-40, C-14...)', dosis: '0,29 mSv/año', dosisNum: 0.29, tipo: 'natural' },
  { nombre: 'Suelo y materiales', dosis: '0,48 mSv/año', dosisNum: 0.48, tipo: 'natural' },
  { nombre: 'Radiografía dental', dosis: '0,005 mSv', dosisNum: 0.005, tipo: 'medica' },
  { nombre: 'Radiografía de tórax', dosis: '0,02 mSv', dosisNum: 0.02, tipo: 'medica' },
  { nombre: 'Vuelo trasatlántico (~8 h)', dosis: '0,1 mSv', dosisNum: 0.1, tipo: 'actividad' },
  { nombre: 'TAC torácico', dosis: '7 mSv', dosisNum: 7, tipo: 'medica' },
  { nombre: 'Límite anual trabajadores nucleares', dosis: '20 mSv/año', dosisNum: 20, tipo: 'actividad' },
  { nombre: 'Dosis síndrome agudo (inicial)', dosis: '~1.000 mSv (1 Sv)', dosisNum: 1000, tipo: 'actividad' },
];

// ─────────────────────────────────────────────
// Utilidades de cálculo
// ─────────────────────────────────────────────

function calcularDesintegracion(t: number, t12: number): number {
  // N(t)/N₀ = e^(-λt), λ = ln(2)/t½
  return Math.exp(-(Math.LN2 / t12) * t);
}

function calcularEdadC14(actividadPct: number): number {
  // t = -t½/ln(2) × ln(A/A₀)
  const t12 = 5730;
  const ratio = actividadPct / 100;
  if (ratio <= 0 || ratio > 1) return 0;
  return (-t12 / Math.LN2) * Math.log(ratio);
}

// ─────────────────────────────────────────────
// SVG de penetración de radiación
// ─────────────────────────────────────────────

const PenetracionSvg = ({ tipoActivo }: { tipoActivo: TipoRadiacion | null }) => {
  // Materiales: aire (vacío), papel, aluminio, plomo, hormigón
  const materiales = [
    { nombre: 'Aire', ancho: 60, color: '#EBF5FB', x: 80 },
    { nombre: 'Papel', ancho: 18, color: '#F9E4B7', x: 140 },
    { nombre: 'Aluminio\n1 cm', ancho: 22, color: '#BFC9CA', x: 158 },
    { nombre: 'Plomo\n5 cm', ancho: 30, color: '#808B96', x: 180 },
    { nombre: 'Hormigón\n30 cm', ancho: 50, color: '#AEB6BF', x: 210 },
  ];

  // Cuántos materiales traspasa cada radiación (índice del último que detiene):
  // 0=aire, 1=papel, 2=aluminio, 3=plomo, 4=hormigón
  const penetraHasta: Record<TipoRadiacion, number> = {
    alfa: 0,       // se detiene en aire / piel
    betaMenos: 1,  // atraviesa papel, se detiene en aluminio
    betaMas: 1,    // similar a β⁻ pero con fotones aniquilación
    gamma: 3,      // necesita plomo grueso
    neutrones: 4,  // muy penetrante, necesita moderadores (no plomo)
  };

  const colorRadiacion: Record<TipoRadiacion, string> = {
    alfa: '#e74c3c',
    betaMenos: '#f39c12',
    betaMas: '#8e44ad',
    gamma: '#2E86AB',
    neutrones: '#48A9A6',
  };

  const limite = tipoActivo ? penetraHasta[tipoActivo] : -1;
  const colorRay = tipoActivo ? colorRadiacion[tipoActivo] : '#ccc';

  // Posición X donde se detiene el rayo
  const xDetencion = tipoActivo
    ? (() => {
        if (limite === 0) return 100; // detiene en aire
        if (limite === 1) return 158; // detiene en papel
        if (limite === 2) return 180; // detiene en aluminio
        if (limite === 3) return 260; // atraviesa plomo parcialmente — se detiene dentro
        return 270; // neutrones: pasa todo
      })()
    : 270;

  return (
    <svg viewBox="0 0 360 130" className={styles.penetracionSvg} role="img" aria-label="Esquema de penetración de radiación a través de materiales">
      {/* Fuente radiactiva */}
      <circle cx={40} cy={65} r={16} fill="#2E86AB" />
      <text x={40} y={69} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">☢</text>
      <text x={40} y={90} textAnchor="middle" fontSize="7" fill="#666">Fuente</text>

      {/* Materiales */}
      {/* Aire */}
      <rect x={80} y={30} width={60} height={70} fill="#EBF5FB" stroke="#ccc" strokeWidth="0.5" rx="2" />
      <text x={110} y={108} textAnchor="middle" fontSize="7" fill="#666">Aire</text>

      {/* Papel */}
      <rect x={140} y={30} width={18} height={70} fill="#F9E4B7" stroke="#D4AC0D" strokeWidth="0.8" />
      <text x={149} y={108} textAnchor="middle" fontSize="7" fill="#666">Papel</text>

      {/* Aluminio */}
      <rect x={158} y={30} width={22} height={70} fill="#BFC9CA" stroke="#808B96" strokeWidth="0.8" />
      <text x={169} y={108} textAnchor="middle" fontSize="7" fill="#666">Al</text>

      {/* Plomo */}
      <rect x={180} y={30} width={30} height={70} fill="#808B96" stroke="#566573" strokeWidth="0.8" />
      <text x={195} y={108} textAnchor="middle" fontSize="7" fill="#444">Pb</text>

      {/* Hormigón */}
      <rect x={210} y={30} width={50} height={70} fill="#AEB6BF" stroke="#717D7E" strokeWidth="0.8" />
      <text x={235} y={108} textAnchor="middle" fontSize="7" fill="#444">Hormigón</text>

      {/* Rayo */}
      {tipoActivo && (
        <>
          <line
            x1={56} y1={65}
            x2={xDetencion} y2={65}
            stroke={colorRay}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Flecha al final si atraviesa todo */}
          {limite === 4 && (
            <polygon
              points={`${270},61 ${280},65 ${270},69`}
              fill={colorRay}
            />
          )}
          {/* Cruz de detención si se para */}
          {limite < 4 && (
            <>
              <line x1={xDetencion - 5} y1={60} x2={xDetencion + 5} y2={70} stroke={colorRay} strokeWidth="2" />
              <line x1={xDetencion + 5} y1={60} x2={xDetencion - 5} y2={70} stroke={colorRay} strokeWidth="2" />
            </>
          )}
        </>
      )}

      {/* Etiqueta vacía si no hay selección */}
      {!tipoActivo && (
        <text x={185} y={65} textAnchor="middle" fontSize="8" fill="#999">
          Selecciona un tipo de radiación
        </text>
      )}

      {/* Leyenda de materiales arriba */}
      <text x={149} y={24} textAnchor="middle" fontSize="6.5" fill="#555">1 cm</text>
      <text x={169} y={24} textAnchor="middle" fontSize="6.5" fill="#555">2 cm</text>
      <text x={195} y={24} textAnchor="middle" fontSize="6.5" fill="#555">5 cm</text>
      <text x={235} y={24} textAnchor="middle" fontSize="6.5" fill="#555">30 cm</text>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Gráfica de desintegración SVG
// ─────────────────────────────────────────────

const GraficaDesintegracion = ({ fracciones }: { fracciones: number[] }) => {
  const VB_W = 400;
  const VB_H = 200;
  const PAD = { top: 20, bottom: 35, left: 45, right: 15 };
  const ancho = VB_W - PAD.left - PAD.right;
  const alto = VB_H - PAD.top - PAD.bottom;

  const puntos = fracciones
    .map((v, i) => {
      const x = PAD.left + (i / (fracciones.length - 1)) * ancho;
      const y = PAD.top + (1 - v) * alto;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const marcasY = [1, 0.75, 0.5, 0.25, 0.125];
  const marcasX = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={styles.graficaSvg} role="img" aria-label="Curva de desintegración radiactiva exponencial">
      {/* Ejes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={VB_H - PAD.bottom} stroke="#ccc" strokeWidth="1" />
      <line x1={PAD.left} y1={VB_H - PAD.bottom} x2={VB_W - PAD.right} y2={VB_H - PAD.bottom} stroke="#ccc" strokeWidth="1" />

      {/* Etiquetas Y */}
      {marcasY.map((frac) => {
        const y = PAD.top + (1 - frac) * alto;
        const label = frac === 0.125 ? '12,5%' : `${Math.round(frac * 100)}%`;
        return (
          <g key={frac}>
            <line x1={PAD.left - 4} y1={y} x2={PAD.left} y2={y} stroke="#ccc" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize="8" fill="#999">{label}</text>
            {/* Línea guía discontinua */}
            <line x1={PAD.left} y1={y} x2={VB_W - PAD.right} y2={y} stroke="#eee" strokeWidth="0.8" strokeDasharray="3 3" />
          </g>
        );
      })}

      {/* Etiquetas X (en vidas medias) */}
      {marcasX.map((vm) => {
        const x = PAD.left + (vm / 10) * ancho;
        return (
          <g key={vm}>
            <line x1={x} y1={VB_H - PAD.bottom} x2={x} y2={VB_H - PAD.bottom + 4} stroke="#ccc" strokeWidth="1" />
            <text x={x} y={VB_H - PAD.bottom + 13} textAnchor="middle" fontSize="7.5" fill="#999">
              {vm}t½
            </text>
          </g>
        );
      })}

      {/* Líneas discontinuas en t½, 2t½, 3t½ */}
      {[1, 2, 3].map((n) => {
        const x = PAD.left + (n / 10) * ancho;
        const frac = Math.pow(0.5, n);
        const y = PAD.top + (1 - frac) * alto;
        return (
          <g key={n}>
            {/* Vertical */}
            <line x1={x} y1={y} x2={x} y2={VB_H - PAD.bottom} stroke="#2E86AB" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            {/* Horizontal */}
            <line x1={PAD.left} y1={y} x2={x} y2={y} stroke="#2E86AB" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
            {/* Punto */}
            <circle cx={x} cy={y} r={3} fill="#2E86AB" />
          </g>
        );
      })}

      {/* Curva exponencial */}
      <polyline points={puntos} fill="none" stroke="#2E86AB" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Etiquetas ejes */}
      <text x={PAD.left - 12} y={PAD.top - 6} fontSize="8" fill="#999" textAnchor="middle">N/N₀</text>
      <text x={VB_W - PAD.right} y={VB_H - PAD.bottom + 24} fontSize="8" fill="#999" textAnchor="end">Tiempo</text>
    </svg>
  );
};

// ─────────────────────────────────────────────
// Tab 1: Tipos de Radiación
// ─────────────────────────────────────────────

const TabTipos = () => {
  const [seleccionado, setSeleccionado] = useState<TipoRadiacion | null>(null);

  const info = seleccionado ? TIPOS_RADIACION.find((t) => t.id === seleccionado) : null;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Tipos de Radiación Ionizante</h2>
      <p className={styles.seccionDesc}>
        Pulsa cada tipo para ver sus propiedades, poder de penetración y aplicaciones. El esquema muestra qué materiales atraviesa cada radiación.
      </p>

      {/* Botones de selección */}
      <div className={styles.radiacionGrid}>
        {TIPOS_RADIACION.map((tipo) => (
          <button
            key={tipo.id}
            type="button"
            className={`${styles.radiacionCard} ${seleccionado === tipo.id ? styles.radiacionCardActive : ''}`}
            onClick={() => setSeleccionado(seleccionado === tipo.id ? null : tipo.id)}
            aria-pressed={seleccionado === tipo.id}
            style={{ '--color-radiacion': tipo.color } as React.CSSProperties}
          >
            <span className={styles.radiacionBadge} style={{ background: tipo.color }}>{tipo.simbolo}</span>
            <span className={styles.radiacionNombre}>{tipo.nombre}</span>
          </button>
        ))}
      </div>

      {/* SVG penetración */}
      <div className={styles.graficaBox}>
        <p className={styles.graficaLabel}>Poder de penetración</p>
        <PenetracionSvg tipoActivo={seleccionado} />
      </div>

      {/* Panel de detalles */}
      {info && (
        <div className={`${styles.detallePanel} ${styles.fadeIn}`} style={{ borderLeftColor: info.color }}>
          <h3 className={styles.detalleTitulo} style={{ color: info.color }}>
            <span className={styles.radiacionBadge} style={{ background: info.color }}>{info.simbolo}</span>
            {info.nombre}
          </h3>
          <div className={styles.detalleGrid}>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Partícula emitida</span>
              <span className={styles.detalleValor}>{info.particula}</span>
            </div>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Carga eléctrica</span>
              <span className={styles.detalleValor}>{info.carga}</span>
            </div>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Masa</span>
              <span className={styles.detalleValor}>{info.masa}</span>
            </div>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Poder ionizante</span>
              <span className={styles.detalleValor}>{info.ionizacion}</span>
            </div>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Alcance en aire</span>
              <span className={styles.detalleValor}>{info.alcanceAire}</span>
            </div>
            <div className={styles.detalleItem}>
              <span className={styles.detalleLabel}>Blindaje necesario</span>
              <span className={styles.detalleValor}>{info.blindaje}</span>
            </div>
            <div className={`${styles.detalleItem} ${styles.detalleItemFull}`}>
              <span className={styles.detalleLabel}>Ejemplo de reacción</span>
              <span className={`${styles.detalleValor} ${styles.formulaBox}`}>{info.ejemplo}</span>
            </div>
            <div className={`${styles.detalleItem} ${styles.detalleItemFull}`}>
              <span className={styles.detalleLabel}>Aplicaciones</span>
              <span className={styles.detalleValor}>{info.uso}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Tab 2: Ley de Desintegración
// ─────────────────────────────────────────────

const TabDesintegracion = () => {
  const [isotopoIdx, setIsotopoIdx] = useState(0);
  const [tiempoVidas, setTiempoVidas] = useState(3);

  const isotopo = ISOTOPOS[isotopoIdx];
  const fraccion = useMemo(() => calcularDesintegracion(tiempoVidas, 1), [tiempoVidas]);
  const actividadPct = fraccion * 100;
  const lambda = Math.LN2; // λ en unidades de t½

  // Puntos para la gráfica (0 a 10 vidas medias, 200 puntos)
  const fracciones = useMemo(() => {
    return Array.from({ length: 201 }, (_, i) => calcularDesintegracion((i / 200) * 10, 1));
  }, []);

  const pct = ((tiempoVidas - 0) / 10) * 100;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Ley de Desintegración Exponencial</h2>
      <p className={styles.seccionDesc}>
        Cada isótopo radiactivo se desintegra según N(t) = N₀ · e<sup>−λt</sup>, donde λ = ln(2)/t½.
        La vida media (t½) es el tiempo necesario para que la mitad de los núcleos se desintegren.
      </p>

      {/* Fórmula destacada */}
      <div className={styles.formulaDestacada}>
        <span className={styles.formulaTexto}>N(t) = N₀ · e<sup>−λt</sup></span>
        <span className={styles.formulaSep}>donde</span>
        <span className={styles.formulaTexto}>λ = ln(2) / t½ ≈ 0,693 / t½</span>
      </div>

      {/* Selector de isótopo */}
      <div className={styles.isotoposRow}>
        {ISOTOPOS.map((iso, idx) => (
          <button
            key={iso.nombre}
            type="button"
            className={`${styles.isotopoBtn} ${isotopoIdx === idx ? styles.isotopoBtnActive : ''}`}
            onClick={() => setIsotopoIdx(idx)}
            aria-pressed={isotopoIdx === idx}
          >
            <span className={styles.isotopoSimbolo}>{iso.simbolo}</span>
            <span className={styles.isotopoVida}>{iso.vidaMediaDisplay}</span>
          </button>
        ))}
      </div>

      <p className={styles.isotopoUso}>
        <strong>{isotopo.nombre}</strong> — {isotopo.uso}
      </p>

      {/* Slider de tiempo */}
      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          <span>Tiempo transcurrido (en vidas medias t½)</span>
          <span className={styles.sliderValor}>{tiempoVidas.toFixed(1)} t½</span>
        </label>
        <input
          type="range"
          className={styles.sliderInput}
          style={{ ['--pct' as string]: `${pct}%` }}
          min={0}
          max={10}
          step={0.1}
          value={tiempoVidas}
          onChange={(e) => setTiempoVidas(parseFloat(e.target.value))}
          aria-label={`Tiempo: ${tiempoVidas} vidas medias`}
        />
        <span className={styles.sliderDesc}>
          λ = {lambda.toFixed(4)} (por t½) — Actividad restante: {actividadPct.toFixed(2)}%
        </span>
      </div>

      {/* Display de resultado */}
      <div className={styles.displayGrid}>
        <div className={styles.displayBox}>
          <div className={styles.displayValor}>{actividadPct.toFixed(2)}%</div>
          <div className={styles.displayLabel}>N(t)/N₀ — Núcleos restantes</div>
        </div>
        <div className={styles.displayBox}>
          <div className={styles.displayValor}>{tiempoVidas.toFixed(1)}</div>
          <div className={styles.displayLabel}>Vidas medias transcurridas</div>
        </div>
        <div className={styles.displayBox}>
          <div className={styles.displayValor}>{(100 - actividadPct).toFixed(2)}%</div>
          <div className={styles.displayLabel}>N₀ − N(t) — Núcleos desintegrados</div>
        </div>
      </div>

      {/* Gráfica */}
      <div className={styles.graficaBox}>
        <GraficaDesintegracion fracciones={fracciones} />
        <p className={styles.graficaCaption}>Las líneas discontinuas marcan t½ (50%), 2t½ (25%) y 3t½ (12,5%)</p>
      </div>

      {/* Tabla de referencia */}
      <div className={styles.tablaScroll}>
        <table className={styles.dosisTable}>
          <thead>
            <tr>
              <th>Vidas medias</th>
              <th>Fracción restante</th>
              <th>Porcentaje restante</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 7, 10].map((n) => (
              <tr key={n} className={tiempoVidas >= n && tiempoVidas < n + 1 ? styles.filaDestacada : ''}>
                <td>{n} t½</td>
                <td>1/{Math.pow(2, n) === 1 ? '1' : Math.pow(2, n)}</td>
                <td>{(100 / Math.pow(2, n)).toFixed(3)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Tab 3: Datación por Carbono-14
// ─────────────────────────────────────────────

const TabCarbono14 = () => {
  const [actividadPct, setActividadPct] = useState(52.5);
  const edad = useMemo(() => calcularEdadC14(actividadPct), [actividadPct]);

  const pct = ((actividadPct - 1) / 99) * 100;

  const formatearEdad = (anios: number): string => {
    if (anios < 1000) return `${Math.round(anios)} años`;
    return `${(anios / 1000).toFixed(1).replace('.', ',')} ka (${Math.round(anios).toLocaleString('es-ES')} años)`;
  };

  const limiteMetodo = actividadPct < 3;

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Datación por Carbono-14</h2>
      <p className={styles.seccionDesc}>
        Los organismos vivos absorben ¹⁴C del CO₂ atmosférico en la misma proporción que la atmósfera.
        Al morir, dejan de absorber y el C-14 se desintegra con t½ = 5.730 años.
        Midiendo la actividad residual se puede calcular cuándo murió el organismo.
      </p>

      {/* Fórmula */}
      <div className={styles.formulaDestacada}>
        <span className={styles.formulaTexto}>t = −t½ / ln(2) · ln(A / A₀)</span>
        <span className={styles.formulaSep}>donde t½ = 5.730 años</span>
      </div>

      {/* Ejemplos predefinidos */}
      <div className={styles.ejemplosRow}>
        {EJEMPLOS_C14.map((ej) => (
          <button
            key={ej.nombre}
            type="button"
            className={`${styles.isotopoBtn} ${Math.abs(actividadPct - ej.actividadPct) < 0.1 ? styles.isotopoBtnActive : ''}`}
            onClick={() => setActividadPct(ej.actividadPct)}
            aria-label={`${ej.nombre}: actividad ${ej.actividadPct}%`}
          >
            <span className={styles.isotopoSimbolo}>{ej.actividadPct}%</span>
            <span className={styles.isotopoVida}>{ej.nombre}</span>
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          <span>Actividad medida (% del estándar moderno)</span>
          <span className={styles.sliderValor}>{actividadPct.toFixed(1)}%</span>
        </label>
        <input
          type="range"
          className={styles.sliderInput}
          style={{ ['--pct' as string]: `${pct}%` }}
          min={1}
          max={100}
          step={0.1}
          value={actividadPct}
          onChange={(e) => setActividadPct(parseFloat(e.target.value))}
          aria-label={`Actividad de C-14: ${actividadPct}%`}
        />
        <span className={styles.sliderDesc}>
          100% = actividad actual de organismo vivo. Cuanto menor es la actividad, más antigua es la muestra.
        </span>
      </div>

      {/* Resultado */}
      <div className={styles.displayGrid}>
        <div className={`${styles.displayBox} ${limiteMetodo ? styles.displayBoxAviso : ''}`}>
          <div className={styles.displayValor}>{formatearEdad(edad)}</div>
          <div className={styles.displayLabel}>Edad calculada</div>
        </div>
        <div className={styles.displayBox}>
          <div className={styles.displayValor}>{actividadPct.toFixed(1)}%</div>
          <div className={styles.displayLabel}>¹⁴C residual</div>
        </div>
        <div className={styles.displayBox}>
          <div className={styles.displayValor}>{(Math.log(actividadPct / 100) / -Math.LN2).toFixed(2)} t½</div>
          <div className={styles.displayLabel}>Vidas medias transcurridas</div>
        </div>
      </div>

      {limiteMetodo && (
        <div className={styles.avisoBox} role="alert">
          <strong>Límite del método:</strong> Con actividades por debajo del ~3% (más de ~50.000 años),
          la señal de C-14 es tan débil que cae por debajo del límite de detección instrumental.
          Para dataciones más antiguas se usan otros métodos: K-Ar, U-Pb, Rb-Sr.
        </div>
      )}

      {/* Descripción del ejemplo seleccionado */}
      {EJEMPLOS_C14.find((e) => Math.abs(actividadPct - e.actividadPct) < 0.1) && (
        <div className={`${styles.infoBox} ${styles.fadeIn}`}>
          <p className={styles.infoBoxTitulo}>
            {EJEMPLOS_C14.find((e) => Math.abs(actividadPct - e.actividadPct) < 0.1)?.nombre}
          </p>
          <p>{EJEMPLOS_C14.find((e) => Math.abs(actividadPct - e.actividadPct) < 0.1)?.descripcion}</p>
        </div>
      )}

      {/* Explicación del método */}
      <div className={styles.metodologiaBox}>
        <h3 className={styles.metodologiaTitulo}>Cómo funciona el método</h3>
        <div className={styles.metodologiaSteps}>
          <div className={styles.metodologiaStep}>
            <div className={styles.stepNum}>1</div>
            <div>
              <strong>Ciclo del carbono</strong>: Los rayos cósmicos producen ¹⁴N + n → ¹⁴C + p en la atmósfera.
              El C-14 se mezcla con CO₂ y entra en los organismos vivos en proporción constante.
            </div>
          </div>
          <div className={styles.metodologiaStep}>
            <div className={styles.stepNum}>2</div>
            <div>
              <strong>Muerte del organismo</strong>: Al morir, el organismo deja de incorporar ¹⁴C.
              El C-14 existente se desintegra: ¹⁴C → ¹⁴N + β⁻ + ν̄ₑ, con t½ = 5.730 años.
            </div>
          </div>
          <div className={styles.metodologiaStep}>
            <div className={styles.stepNum}>3</div>
            <div>
              <strong>Medición</strong>: Se mide la actividad residual (desintegraciones/minuto/gramo)
              por espectrometría de masas con acelerador (AMS) o contador Geiger. Permite detectar
              hasta 1 átomo de C-14 por cada 10¹² átomos de C-12.
            </div>
          </div>
          <div className={styles.metodologiaStep}>
            <div className={styles.stepNum}>4</div>
            <div>
              <strong>Calibración</strong>: Los resultados se calibran con la curva IntCal (dendrocronología
              + sedimentos marinos + espeleotemas) porque la concentración de ¹⁴C atmosférico no ha sido
              constante en el pasado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Tab 4: Dosis y Efectos Biológicos
// ─────────────────────────────────────────────

const TabDosis = () => {
  const dosisNatural = FUENTES_DOSIS.filter((f) => f.tipo === 'natural').reduce((s, f) => s + f.dosisNum, 0);

  const maxDosis = Math.max(...FUENTES_DOSIS.map((f) => f.dosisNum));

  const colorBarra = (dosisNum: number): string => {
    if (dosisNum >= 1000) return '#e74c3c';
    if (dosisNum >= 20) return '#f39c12';
    if (dosisNum >= 1) return '#f1c40f';
    return '#2E86AB';
  };

  return (
    <div className={styles.seccion}>
      <h2 className={styles.seccionTitulo}>Dosis de Radiación y Efectos Biológicos</h2>
      <p className={styles.seccionDesc}>
        La dosis de radiación se mide en Sievert (Sv): la energía absorbida en J/kg (Gray) multiplicada
        por el factor de ponderación biológica (Q) de cada tipo de radiación.
      </p>

      {/* Unidades */}
      <div className={styles.unidadesGrid}>
        <div className={styles.unidadCard}>
          <div className={styles.unidadNombre}>Gray (Gy)</div>
          <div className={styles.unidadDesc}>Energía absorbida = 1 J/kg. Magnitud física sin considerar tipo de radiación.</div>
        </div>
        <div className={styles.unidadCard}>
          <div className={styles.unidadNombre}>Sievert (Sv)</div>
          <div className={styles.unidadDesc}>Dosis efectiva biológica = Gy × factor Q. Tiene en cuenta la peligrosidad de cada radiación.</div>
        </div>
        <div className={styles.unidadCard}>
          <div className={styles.unidadNombre}>Factor Q (ponderación)</div>
          <div className={styles.unidadDesc}>γ/β = 1 · α = 20 · Neutrones = 5–20. La radiación α causa 20× más daño biológico por Gy.</div>
        </div>
      </div>

      {/* Fondo natural */}
      <div className={styles.infoBox}>
        <p className={styles.infoBoxTitulo}>Fondo natural de radiación</p>
        <p>
          La dosis media natural mundial es de <strong>~2,4 mSv/año</strong> (varía entre 1 y 13 mSv/año según la ubicación).
          El {((dosisNatural / 2.4) * 100).toFixed(0)}% de esas {dosisNatural.toFixed(2)} mSv/año provienen de fuentes listadas abajo.
          El radón intradomiciliario es la mayor fuente individual (~48% del total en zonas de granito).
        </p>
      </div>

      {/* Tabla comparativa */}
      <div className={styles.tablaScroll}>
        <table className={styles.dosisTable}>
          <thead>
            <tr>
              <th>Fuente</th>
              <th>Dosis estimada</th>
              <th>Nivel relativo</th>
            </tr>
          </thead>
          <tbody>
            {FUENTES_DOSIS.map((f) => (
              <tr key={f.nombre}>
                <td>
                  <span className={`${styles.tipoBadge} ${f.tipo === 'natural' ? styles.tipoBadgeNatural : f.tipo === 'medica' ? styles.tipoBadgeMedica : styles.tipoBadgeActividad}`}>
                    {f.tipo === 'natural' ? 'Natural' : f.tipo === 'medica' ? 'Médica' : 'Actividad'}
                  </span>
                  {f.nombre}
                </td>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{f.dosis}</td>
                <td style={{ minWidth: 120 }}>
                  <div className={styles.dosisBarContainer}>
                    <div
                      className={styles.dosisBar}
                      style={{
                        width: `${Math.max(2, Math.log10(f.dosisNum + 0.001) / Math.log10(maxDosis + 0.001) * 100)}%`,
                        background: colorBarra(f.dosisNum),
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Umbrales de efectos */}
      <h3 className={styles.subTitulo}>Efectos biológicos según dosis recibida en corto plazo</h3>
      <div className={styles.umbralesGrid}>
        <div className={styles.umbralCard} style={{ borderLeftColor: '#27ae60' }}>
          <div className={styles.umbralDosis} style={{ color: '#27ae60' }}>&lt; 100 mSv</div>
          <div className={styles.umbralEfecto}>Sin efectos deterministas observables. Posible ligero aumento estadístico del riesgo de cáncer a largo plazo (hipótesis LNT).</div>
        </div>
        <div className={styles.umbralCard} style={{ borderLeftColor: '#f39c12' }}>
          <div className={styles.umbralDosis} style={{ color: '#f39c12' }}>100 – 1.000 mSv</div>
          <div className={styles.umbralEfecto}>Posibles náuseas, fatiga (síndrome agudo leve). Aumento real del riesgo de cáncer. Umbral para efectos deterministas.</div>
        </div>
        <div className={styles.umbralCard} style={{ borderLeftColor: '#e67e22' }}>
          <div className={styles.umbralDosis} style={{ color: '#e67e22' }}>1 – 4 Sv</div>
          <div className={styles.umbralEfecto}>Síndrome de radiación aguda. Daño en médula ósea, diarrea, caída del cabello. DL50 sin tratamiento: ~3–4 Sv.</div>
        </div>
        <div className={styles.umbralCard} style={{ borderLeftColor: '#e74c3c' }}>
          <div className={styles.umbralDosis} style={{ color: '#e74c3c' }}>&gt; 10 Sv</div>
          <div className={styles.umbralEfecto}>Fallo multiorgánico. Dosis generalmente fatal en días a semanas incluso con tratamiento médico intensivo.</div>
        </div>
      </div>

      <div className={styles.warningBox}>
        <strong>Nota sobre el modelo LNT:</strong> La hipótesis de umbral lineal sin umbral (LNT) asume
        que cualquier dosis de radiación, por pequeña que sea, conlleva un riesgo proporcional de cáncer.
        Es el principio de precaución conservador usado en radioprotección, pero su validez científica
        a dosis muy bajas (~&lt; 10 mSv) sigue siendo debatida. Las dosis de la vida cotidiana están
        muy por debajo de los umbrales de daño determinista.
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorRadioactividad() {
  const [tab, setTab] = useState<Tab>('tipos');

  const TABS: { id: Tab; icon: string; label: string }[] = [
    { id: 'tipos', icon: '☢️', label: 'Tipos de Radiación' },
    { id: 'desintegracion', icon: '📉', label: 'Ley de Desintegración' },
    { id: 'carbono14', icon: '🦴', label: 'Datación C-14' },
    { id: 'dosis', icon: '🛡️', label: 'Dosis y Efectos' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>Radioactividad y Física Nuclear</h1>
          <p className={styles.heroSubtitle}>
            Tipos de radiación, desintegración exponencial, datación por carbono-14 y efectos biológicos — visualizador interactivo
          </p>
        </header>

        <LegalNotice />

        {/* Navegación por pestañas */}
        <nav className={styles.tabBar} aria-label="Secciones del visualizador de radioactividad">
          {TABS.map(({ id, icon, label }) => (
            <button
              key={id}
              type="button"
              className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              onClick={() => setTab(id)}
              aria-pressed={tab === id}
              aria-current={tab === id ? 'true' : undefined}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <main>
          {tab === 'tipos' && <TabTipos />}
          {tab === 'desintegracion' && <TabDesintegracion />}
          {tab === 'carbono14' && <TabCarbono14 />}
          {tab === 'dosis' && <TabDosis />}
        </main>

        <EducationalSection
          title="Radioactividad: núcleos inestables y sus emisiones"
          subtitle="Desintegración espontánea, vida media y aplicaciones médicas e industriales"
        >
          <h3>Comparativa de Tipos de Radiación</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Partícula</th>
                  <th>Ionización</th>
                  <th>Blindaje necesario</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Alfa (α)</td>
                  <td>He-4 (2p + 2n)</td>
                  <td>Muy alta</td>
                  <td>Papel, piel (5 cm aire)</td>
                </tr>
                <tr>
                  <td>Beta (β⁻)</td>
                  <td>Electrón</td>
                  <td>Media</td>
                  <td>1 cm aluminio (10 m aire)</td>
                </tr>
                <tr>
                  <td>Gamma (γ)</td>
                  <td>Fotón de alta energía</td>
                  <td>Baja (muy penetrante)</td>
                  <td>10 cm plomo / 1 m hormigón</td>
                </tr>
                <tr>
                  <td>Neutrones</td>
                  <td>Neutrón libre</td>
                  <td>Indirecta (activación)</td>
                  <td>Parafina / agua (moderación)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Casos de Uso</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>🏥 Medicina Nuclear</h4>
              <p>El Tc-99m (t½ = 6h) se usa en gammagrafías: se inyecta al paciente y los detectores capturan los fotones γ emitidos por los órganos. El I-131 (t½ = 8 días) trata el hipertiroidismo destruyendo tejido tiroideo específicamente.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🏺 Arqueología y Geología</h4>
              <p>El carbono-14 (t½ = 5730 años) data materiales orgánicos hasta 50.000 años. Para rocas más antiguas se usa U-Pb (U-238, t½ = 4468 Ma) que permite datar el Sistema Solar y los meteoritos más primitivos.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>⚡ Energía Nuclear</h4>
              <p>Los reactores nucleares usan la fisión del U-235: un neutrón lento impacta el núcleo, que se parte liberando 2-3 neutrones nuevos y energía en forma de radiación γ y partículas. El control de esta reacción en cadena genera electricidad.</p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🔬 Investigación Científica</h4>
              <p>Los trazadores radiactivos permiten seguir moléculas en reacciones biológicas: se introduce un isótopo radiactivo (ej. C-14 en glucosa) y se rastrea su destino metabólico. Así se descubrió el ciclo de Calvin en la fotosíntesis.</p>
            </div>
          </div>

          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Qué hace que un núcleo sea radiactivo?</strong>
              <p>Un núcleo es inestable cuando la relación n/p está fuera del rango de estabilidad, cuando hay exceso de energía, o cuando el núcleo es muy grande. La fuerza nuclear fuerte mantiene el núcleo unido, pero si protones o neutrones sobran, el sistema busca minimizar su energía emitiendo radiación.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la vida media no cambia con la temperatura o presión?</strong>
              <p>La desintegración radiactiva depende de la estructura nuclear, no de factores externos como temperatura, presión o estado químico. Los electrones de los orbitales exteriores no afectan al núcleo. Solo la captura electrónica (un caso especial) tiene ligera dependencia del entorno.</p>
              <div className={styles.faqTip}>💡 La vida media del C-14 en un diamante y en un ser vivo es idéntica: 5730 años.</div>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo funciona exactamente la datación por C-14?</strong>
              <p>El C-14 se produce en la atmósfera (N-14 + neutrón cósmico → C-14). Los organismos vivos incorporan C-14 al respirar CO₂. Al morir, dejan de incorporarlo y el C-14 existente se desintegra. Medir la actividad actual respecto al estándar moderno da la edad: t = (t½/ln2) · ln(A₀/A).</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre Gray y Sievert?</strong>
              <p>El Gray (Gy) mide la energía absorbida por la materia (J/kg). El Sievert (Sv) mide el efecto biológico real, multiplicando por el factor de ponderación de la radiación: γ y β tienen factor 1, pero la radiación α tiene factor 20 porque ioniza mucho más en tejido.</p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Es peligrosa la radioactividad natural que nos rodea?</strong>
              <p>Todos recibimos ~2,4 mSv/año de fuentes naturales (radón, cósmicos, suelo, alimentos). Los límites para el público general son 1 mSv/año adicional. Los trabajadores de medicina nuclear o central nuclear reciben dosis controladas muy por debajo de los 20 mSv/año permitidos.</p>
            </div>
          </div>

          <h3>Guía de Uso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Compara los tipos de radiación</h4>
                <p>En «Tipos de Radiación», haz clic en cada tipo (α, β⁻, β⁺, γ, neutrones). Observa el SVG de penetración para entender por qué la radiación α, siendo la más ionizante, es también la más fácil de blindar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Explora la curva de desintegración</h4>
                <p>Selecciona un isótopo (C-14, I-131, etc.) y mueve el slider de tiempo. Observa cómo la curva exponencial cae a la mitad en cada vida media. Compara isótopos con vidas medias muy diferentes.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Calcula la datación por C-14</h4>
                <p>En la pestaña de carbono-14, ajusta el slider de actividad residual o prueba los ejemplos predefinidos (Ötzi, Sábana Turin). La calculadora muestra directamente la edad estimada en años.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Interpreta las dosis biológicas</h4>
                <p>En «Dosis», compara las fuentes naturales de radiación con las médicas y los umbrales de efectos deterministas. Observa que vivir a gran altitud o tomar un vuelo aumenta la dosis recibida.</p>
              </div>
            </div>
          </div>

          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛡️</span>
              <div>
                <strong>Tiempo, distancia, blindaje</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Los tres principios de protección radiológica: minimizar el tiempo de exposición, maximizar la distancia (ley inversa del cuadrado) y usar el blindaje adecuado a cada tipo de radiación.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📊</span>
              <div>
                <strong>Escala logarítmica para vidas medias</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Las vidas medias van de microsegundos (Po-212: 299 ns) a miles de millones de años (U-238: 4.468 Ga). Compararlas requiere escala logarítmica — diferencias de 20 órdenes de magnitud.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚕️</span>
              <div>
                <strong>Factor de ponderación: α es 20× más dañino</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>La radiación α es muy ionizante en tejido vivo aunque no penetre piel. Si se inhala (radón) o ingiere (polonio), el daño celular es 20 veces mayor que con la misma dosis de rayos γ.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🕐</span>
              <div>
                <strong>t½ médica vs t½ geológica</strong>
                <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>En medicina nuclear, se usan isótopos con t½ de horas/días (Tc-99m: 6h) para minimizar la exposición post-diagnóstico. En geología, se necesitan t½ de millones de años para datar rocas antiguas.</p>
              </div>
            </div>
          </div>

          <div className={styles.warningBoxEdu}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              Errores Conceptuales Frecuentes
            </div>
            <ul className={styles.warningList}>
              <li><strong>Radiactivo ≠ peligroso siempre</strong> — El K-40 en el plátano es radiactivo (t½ = 1,25 Ga), pero la dosis que aporta es insignificante. El peligro depende de la actividad (Bq), el tipo de radiación, el tiempo de exposición y si es interna o externa.</li>
              <li><strong>La radiación α no es inofensiva</strong> — Aunque no penetra piel, inhalada (radón, Ra-226) o ingerida (Po-210) causa daño celular severo: el factor Q = 20 la hace 20 veces más dañina por Gy que los rayos γ en tejido.</li>
              <li><strong>Los residuos nucleares no «se eliminan» fácilmente</strong> — El U-238 tiene t½ = 4468 Ma. Ningún proceso químico ni físico cambia eso. La única estrategia es el almacenamiento geológico profundo durante miles de años.</li>
              <li><strong>La datación por C-14 no sirve para dinosaurios</strong> — La técnica es fiable hasta ~50.000 años. Los dinosaurios se extinguieron hace 66 Ma — para eso se usa U-Pb o Ar-Ar, con vidas medias de millones de años.</li>
              <li><strong>Actividad (Bq) ≠ dosis (Sv)</strong> — Un becquerel mide desintegraciones por segundo, no daño biológico. 1 Bq de Po-210 (α) causa mucho más daño que 1 Bq de K-40 (β⁻) porque el factor Q del α es 20 veces mayor.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-radioactividad')} />
        <ShareCard appName="visualizador-radioactividad" />
        <Footer appName="visualizador-radioactividad" />
      </div>
    </>
  );
}
