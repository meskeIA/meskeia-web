'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './EstructuraAtomo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'particulas' | 'modelos' | 'isotopos' | 'escala';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'particulas', titulo: 'Las 3 partículas', icono: '⚛️', subtitulo: 'Protones, neutrones y electrones' },
  { id: 'modelos', titulo: 'Bohr vs Orbitales', icono: '🔬', subtitulo: 'De órbitas a nubes de probabilidad' },
  { id: 'isotopos', titulo: 'Isótopos e iones', icono: '🔄', subtitulo: 'Variantes del mismo elemento' },
  { id: 'escala', titulo: 'Escala y datos', icono: '🤯', subtitulo: '99,9999% espacio vacío' },
];

// ─────────────────────────────────────────────
// Datos de partículas
// ─────────────────────────────────────────────

interface Particula {
  nombre: string;
  simbolo: string;
  masa: string;
  carga: string;
  quarks: string;
  color: string;
  descripcion: string;
}

const PARTICULAS: Particula[] = [
  {
    nombre: 'Protón',
    simbolo: 'p⁺',
    masa: '1,007 u',
    carga: '+1',
    quarks: 'uud (2 up + 1 down)',
    color: '#E53935',
    descripcion: 'Define el elemento químico. El número de protones (Z) determina de qué elemento se trata.',
  },
  {
    nombre: 'Neutrón',
    simbolo: 'n⁰',
    masa: '1,009 u',
    carga: '0',
    quarks: 'udd (1 up + 2 down)',
    color: '#78909C',
    descripcion: 'Estabiliza el núcleo. Sin neutrones, la repulsión entre protones destruiría el átomo.',
  },
  {
    nombre: 'Electrón',
    simbolo: 'e⁻',
    masa: '1/1.836 u',
    carga: '−1',
    quarks: 'Ninguno (leptón)',
    color: '#2E86AB',
    descripcion: 'Determina los enlaces químicos. Su comportamiento explica toda la química.',
  },
];

// ─────────────────────────────────────────────
// Elementos para el selector
// ─────────────────────────────────────────────

interface Elemento {
  nombre: string;
  simbolo: string;
  z: number;
  neutrones: number;
  capas: number[];
  configElectronica: string;
}

const ELEMENTOS: Elemento[] = [
  { nombre: 'Hidrógeno', simbolo: 'H', z: 1, neutrones: 0, capas: [1], configElectronica: '1s¹' },
  { nombre: 'Helio', simbolo: 'He', z: 2, neutrones: 2, capas: [2], configElectronica: '1s²' },
  { nombre: 'Carbono', simbolo: 'C', z: 6, neutrones: 6, capas: [2, 4], configElectronica: '1s² 2s² 2p²' },
  { nombre: 'Oxígeno', simbolo: 'O', z: 8, neutrones: 8, capas: [2, 6], configElectronica: '1s² 2s² 2p⁴' },
  { nombre: 'Hierro', simbolo: 'Fe', z: 26, neutrones: 30, capas: [2, 8, 14, 2], configElectronica: '1s² 2s² 2p⁶ 3s² 3p⁶ 3d⁶ 4s²' },
];

// ─────────────────────────────────────────────
// Isótopos
// ─────────────────────────────────────────────

interface Isotopo {
  elemento: string;
  simbolo: string;
  masico: number;
  neutrones: number;
  estable: boolean;
  nota: string;
}

interface ElementoIsotopo {
  nombre: string;
  z: number;
  isotopos: Isotopo[];
}

const ELEMENTOS_ISOTOPOS: ElementoIsotopo[] = [
  {
    nombre: 'Hidrógeno',
    z: 1,
    isotopos: [
      { elemento: 'H', simbolo: '¹H', masico: 1, neutrones: 0, estable: true, nota: 'Protio — 99,98% del H natural' },
      { elemento: 'H', simbolo: '²H', masico: 2, neutrones: 1, estable: true, nota: 'Deuterio — agua pesada en reactores nucleares' },
      { elemento: 'H', simbolo: '³H', masico: 3, neutrones: 2, estable: false, nota: 'Tritio — radiactivo, vida media 12,3 años' },
    ],
  },
  {
    nombre: 'Carbono',
    z: 6,
    isotopos: [
      { elemento: 'C', simbolo: '¹²C', masico: 12, neutrones: 6, estable: true, nota: 'El más abundante (98,9%) — base de la vida' },
      { elemento: 'C', simbolo: '¹³C', masico: 13, neutrones: 7, estable: true, nota: 'Usado en resonancia magnética nuclear' },
      { elemento: 'C', simbolo: '¹⁴C', masico: 14, neutrones: 8, estable: false, nota: 'Datación por radiocarbono — vida media 5.730 años' },
    ],
  },
  {
    nombre: 'Uranio',
    z: 92,
    isotopos: [
      { elemento: 'U', simbolo: '²³⁵U', masico: 235, neutrones: 143, estable: false, nota: 'Fisible — combustible nuclear (0,7% del U natural)' },
      { elemento: 'U', simbolo: '²³⁸U', masico: 238, neutrones: 146, estable: false, nota: 'Vida media 4.500 millones de años — 99,3% del U natural' },
    ],
  },
];

// ─────────────────────────────────────────────
// Iones
// ─────────────────────────────────────────────

interface Ion {
  elemento: string;
  simbolo: string;
  electronesPerdidos: number;
  tipo: 'catión' | 'anión';
  resultado: string;
  ejemplo: string;
}

const IONES: Ion[] = [
  { elemento: 'Sodio', simbolo: 'Na', electronesPerdidos: -1, tipo: 'catión', resultado: 'Na⁺', ejemplo: 'Pierde 1e⁻ → se combina con Cl⁻ para formar sal (NaCl)' },
  { elemento: 'Cloro', simbolo: 'Cl', electronesPerdidos: 1, tipo: 'anión', resultado: 'Cl⁻', ejemplo: 'Gana 1e⁻ → se combina con Na⁺ para formar sal (NaCl)' },
  { elemento: 'Calcio', simbolo: 'Ca', electronesPerdidos: -2, tipo: 'catión', resultado: 'Ca²⁺', ejemplo: 'Pierde 2e⁻ → esencial para huesos y dientes' },
  { elemento: 'Oxígeno', simbolo: 'O', electronesPerdidos: 2, tipo: 'anión', resultado: 'O²⁻', ejemplo: 'Gana 2e⁻ → forma óxidos metálicos (herrumbre)' },
];

// ─────────────────────────────────────────────
// Historia y modelo estándar
// ─────────────────────────────────────────────

interface HitoHistorico {
  anio: string;
  cientifico: string;
  descubrimiento: string;
  modelo: string;
}

const HISTORIA: HitoHistorico[] = [
  { anio: '~400 a.C.', cientifico: 'Demócrito', descubrimiento: 'Propone que la materia se compone de partículas indivisibles', modelo: 'Átomos (filosofía)' },
  { anio: '1803', cientifico: 'Dalton', descubrimiento: 'Teoría atómica moderna — cada elemento tiene un tipo de átomo', modelo: 'Esferas sólidas' },
  { anio: '1897', cientifico: 'Thomson', descubrimiento: 'Descubre el electrón con rayos catódicos', modelo: 'Pastel de pasas' },
  { anio: '1911', cientifico: 'Rutherford', descubrimiento: 'Experimento de la lámina de oro — el átomo tiene núcleo', modelo: 'Planetario' },
  { anio: '1913', cientifico: 'Bohr', descubrimiento: 'Electrones en órbitas cuantizadas de energía fija', modelo: 'Bohr' },
  { anio: '1926', cientifico: 'Schrödinger', descubrimiento: 'Ecuación de onda — electrones como nubes de probabilidad', modelo: 'Mecánica cuántica' },
];

// ─────────────────────────────────────────────
// SVG del átomo (modelo de Bohr)
// ─────────────────────────────────────────────

function AtomoSVG({ elemento }: { elemento: Elemento }) {
  const cx = 150;
  const cy = 150;
  const nucleoR = elemento.z <= 2 ? 18 : elemento.z <= 10 ? 22 : 28;
  const radiosCapas = [55, 85, 115, 140];

  // Distribuir protones y neutrones en el núcleo
  const totalNucleones = elemento.z + elemento.neutrones;
  const nucleonAngulo = (2 * Math.PI) / Math.max(totalNucleones, 1);
  const nucleonR = totalNucleones <= 2 ? 6 : totalNucleones <= 16 ? 5 : 4;

  // Generar posiciones de nucleones en espiral
  const nucleones: Array<{ x: number; y: number; tipo: 'proton' | 'neutron' }> = [];
  let protonesPuestos = 0;
  let neutronesPuestos = 0;

  for (let i = 0; i < totalNucleones; i++) {
    const anillo = Math.floor(i / 6);
    const posEnAnillo = i % 6;
    const totalEnAnillo = Math.min(6, totalNucleones - anillo * 6);
    const angulo = (2 * Math.PI * posEnAnillo) / totalEnAnillo + anillo * 0.5;
    const r = anillo === 0 && totalNucleones <= 1 ? 0 : (anillo + 1) * (nucleonR * 1.6);
    const x = cx + r * Math.cos(angulo);
    const y = cy + r * Math.sin(angulo);

    // Alternar protones y neutrones
    const esProton = i % 2 === 0 ? protonesPuestos < elemento.z : neutronesPuestos >= elemento.neutrones;
    if (esProton && protonesPuestos < elemento.z) {
      nucleones.push({ x, y, tipo: 'proton' });
      protonesPuestos++;
    } else if (neutronesPuestos < elemento.neutrones) {
      nucleones.push({ x, y, tipo: 'neutron' });
      neutronesPuestos++;
    } else {
      nucleones.push({ x, y, tipo: 'proton' });
      protonesPuestos++;
    }
  }

  return (
    <svg viewBox="0 0 300 300" className={styles.atomoSvg} aria-label={`Modelo de Bohr del ${elemento.nombre} con ${elemento.z} protones, ${elemento.neutrones} neutrones y ${elemento.z} electrones`}>
      {/* Órbitas */}
      {elemento.capas.map((_, i) => (
        <circle
          key={`orbita-${i}`}
          cx={cx}
          cy={cy}
          r={radiosCapas[i]}
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.5"
        />
      ))}

      {/* Núcleo fondo */}
      <circle cx={cx} cy={cy} r={nucleoR} fill="var(--bg-card)" stroke="var(--text-muted)" strokeWidth="1" opacity="0.3" />

      {/* Nucleones */}
      {nucleones.map((n, i) => (
        <circle
          key={`nucleon-${i}`}
          cx={n.x}
          cy={n.y}
          r={nucleonR}
          fill={n.tipo === 'proton' ? '#E53935' : '#78909C'}
          stroke={n.tipo === 'proton' ? '#B71C1C' : '#546E7A'}
          strokeWidth="1"
        />
      ))}

      {/* Electrones en órbitas */}
      {elemento.capas.map((electronsCapa, capaIdx) => {
        const r = radiosCapas[capaIdx];
        return Array.from({ length: electronsCapa }).map((_, eIdx) => {
          const angulo = (2 * Math.PI * eIdx) / electronsCapa - Math.PI / 2;
          const ex = cx + r * Math.cos(angulo);
          const ey = cy + r * Math.sin(angulo);
          return (
            <g key={`e-${capaIdx}-${eIdx}`} className={styles.electronOrbit} style={{ transformOrigin: `${cx}px ${cy}px`, animationDelay: `${(eIdx * 3) / electronsCapa}s` }}>
              <circle cx={ex} cy={ey} r="4" fill="#2E86AB" stroke="#1A6A8A" strokeWidth="1" />
            </g>
          );
        });
      })}

      {/* Etiqueta del elemento */}
      <text x={cx} y={cy + 2} textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="11" fontWeight="bold">
        {elemento.simbolo}
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG de orbitales
// ─────────────────────────────────────────────

function OrbitalSVG({ tipo }: { tipo: 's' | 'p' | 'd' }) {
  const cx = 60;
  const cy = 60;

  if (tipo === 's') {
    return (
      <svg viewBox="0 0 120 120" className={styles.orbitalSvg} aria-label="Orbital s: forma esférica">
        <circle cx={cx} cy={cy} r="40" fill="rgba(46, 134, 171, 0.2)" stroke="#2E86AB" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="25" fill="rgba(46, 134, 171, 0.3)" stroke="none" />
        <circle cx={cx} cy={cy} r="3" fill="#2E86AB" />
        <text x={cx} y="112" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontWeight="bold">s (esfera)</text>
      </svg>
    );
  }

  if (tipo === 'p') {
    return (
      <svg viewBox="0 0 120 120" className={styles.orbitalSvg} aria-label="Orbital p: forma de dos lóbulos">
        {/* Lóbulo superior */}
        <ellipse cx={cx} cy={cy - 22} rx="16" ry="28" fill="rgba(46, 134, 171, 0.25)" stroke="#2E86AB" strokeWidth="1.5" />
        {/* Lóbulo inferior */}
        <ellipse cx={cx} cy={cy + 22} rx="16" ry="28" fill="rgba(72, 169, 166, 0.25)" stroke="#48A9A6" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r="3" fill="#2E86AB" />
        <text x={cx} y="112" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontWeight="bold">p (lóbulos)</text>
      </svg>
    );
  }

  // tipo === 'd'
  return (
    <svg viewBox="0 0 120 120" className={styles.orbitalSvg} aria-label="Orbital d: forma de trébol de cuatro lóbulos">
      {/* 4 lóbulos en forma de trébol */}
      <ellipse cx={cx - 18} cy={cy - 18} rx="14" ry="22" transform={`rotate(-45 ${cx - 18} ${cy - 18})`} fill="rgba(46, 134, 171, 0.2)" stroke="#2E86AB" strokeWidth="1.5" />
      <ellipse cx={cx + 18} cy={cy - 18} rx="14" ry="22" transform={`rotate(45 ${cx + 18} ${cy - 18})`} fill="rgba(72, 169, 166, 0.2)" stroke="#48A9A6" strokeWidth="1.5" />
      <ellipse cx={cx + 18} cy={cy + 18} rx="14" ry="22" transform={`rotate(-45 ${cx + 18} ${cy + 18})`} fill="rgba(46, 134, 171, 0.2)" stroke="#2E86AB" strokeWidth="1.5" />
      <ellipse cx={cx - 18} cy={cy + 18} rx="14" ry="22" transform={`rotate(45 ${cx - 18} ${cy + 18})`} fill="rgba(72, 169, 166, 0.2)" stroke="#48A9A6" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="3" fill="#2E86AB" />
      <text x={cx} y="112" textAnchor="middle" fill="var(--text-secondary)" fontSize="12" fontWeight="bold">d (trébol)</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function EstructuraAtomoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('particulas');
  const [elementoIdx, setElementoIdx] = useState(0);
  const [particulaActiva, setParticulaActiva] = useState<number | null>(null);
  const [isotopoElementoIdx, setIsotopoElementoIdx] = useState(0);

  const elementoActual = ELEMENTOS[elementoIdx];
  const isotopoActual = ELEMENTOS_ISOTOPOS[isotopoElementoIdx];

  // Precalcular datos del átomo vacío
  const escalaVacio = useMemo(() => {
    const radioNucleoFm = 1.2 * Math.pow(elementoActual.z + elementoActual.neutrones, 1 / 3);
    const radioAtomoPm = elementoActual.z === 1 ? 53 : elementoActual.z <= 2 ? 31 : elementoActual.z <= 10 ? 60 : 126;
    const radioAtomoFm = radioAtomoPm * 1000;
    const razon = radioAtomoFm / radioNucleoFm;
    return { radioNucleoFm, radioAtomoPm, razon };
  }, [elementoActual]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">⚛️</span> Estructura del Átomo</h1>
          <p className={styles.subtitle}>Protones, neutrones, electrones: los ladrillos de toda la materia</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.tabNav} aria-label="Secciones del visualizador">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.tab} ${seccionActiva === s.id ? styles.tabActive : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span aria-hidden="true">{s.icono}</span>
              <span className={styles.tabLabel}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        <div className={styles.mainContent}>
          <p className={styles.seccionSubtitulo}>
            {SECCIONES.find((s) => s.id === seccionActiva)?.subtitulo}
          </p>

          {/* ─── SECCIÓN 1: Las 3 partículas ─── */}
          {seccionActiva === 'particulas' && (
            <div className={styles.seccionContenido}>
              {/* Selector de elemento */}
              <div className={styles.selectorElemento}>
                <label htmlFor="select-elemento" className={styles.selectorLabel}>Elemento:</label>
                <select
                  id="select-elemento"
                  className={styles.selectInput}
                  value={elementoIdx}
                  onChange={(e) => setElementoIdx(Number(e.target.value))}
                >
                  {ELEMENTOS.map((el, i) => (
                    <option key={el.simbolo} value={i}>
                      {el.nombre} ({el.simbolo}) — Z={el.z}
                    </option>
                  ))}
                </select>
              </div>

              {/* SVG del átomo */}
              <div className={styles.atomoContainer}>
                <AtomoSVG elemento={elementoActual} />
                <div className={styles.atomoLeyenda}>
                  <span className={styles.leyendaItem}>
                    <span className={styles.circuloProton} aria-hidden="true" /> {elementoActual.z} protones
                  </span>
                  <span className={styles.leyendaItem}>
                    <span className={styles.circuloNeutron} aria-hidden="true" /> {elementoActual.neutrones} neutrones
                  </span>
                  <span className={styles.leyendaItem}>
                    <span className={styles.circuloElectron} aria-hidden="true" /> {elementoActual.z} electrones
                  </span>
                </div>
                <p className={styles.configElectronica}>
                  Config. electrónica: <strong>{elementoActual.configElectronica}</strong>
                </p>
              </div>

              {/* Cards de partículas */}
              <div className={styles.particulasGrid}>
                {PARTICULAS.map((p, i) => (
                  <button
                    key={p.nombre}
                    type="button"
                    className={`${styles.particulaCard} ${particulaActiva === i ? styles.particulaCardActive : ''}`}
                    style={{ borderColor: particulaActiva === i ? p.color : undefined }}
                    onClick={() => setParticulaActiva(particulaActiva === i ? null : i)}
                    aria-expanded={particulaActiva === i}
                  >
                    <div className={styles.particulaHeader}>
                      <span className={styles.particulaCirculo} style={{ backgroundColor: p.color }} aria-hidden="true" />
                      <span className={styles.particulaNombre}>{p.nombre}</span>
                      <span className={styles.particulaSimbolo}>{p.simbolo}</span>
                    </div>
                    <div className={styles.particulaDatos}>
                      <span>Masa: {p.masa}</span>
                      <span>Carga: {p.carga}</span>
                    </div>
                    {particulaActiva === i && (
                      <div className={styles.particulaDetalle}>
                        <p><strong>Quarks:</strong> {p.quarks}</p>
                        <p>{p.descripcion}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── SECCIÓN 2: Modelos atómicos ─── */}
          {seccionActiva === 'modelos' && (
            <div className={styles.seccionContenido}>
              <div className={styles.comparacionModelos}>
                {/* Bohr */}
                <div className={styles.modeloCard}>
                  <h3 className={styles.modeloTitulo}>Modelo de Bohr (1913)</h3>
                  <div className={styles.atomoMini}>
                    <AtomoSVG elemento={ELEMENTOS[3]} />
                  </div>
                  <ul className={styles.modeloLista}>
                    <li>Electrones en <strong>órbitas circulares fijas</strong></li>
                    <li>Niveles de energía: n = 1, 2, 3...</li>
                    <li>Funciona bien para el hidrógeno</li>
                    <li>Falla para átomos con muchos electrones</li>
                    <li>No explica formas de moléculas</li>
                  </ul>
                  <div className={styles.warningBox}>
                    <span aria-hidden="true">⚠️</span> El modelo de Bohr es una simplificación útil, pero <strong>no es lo que realmente ocurre</strong>. Los electrones no siguen trayectorias definidas.
                  </div>
                </div>

                {/* Mecánica cuántica */}
                <div className={styles.modeloCard}>
                  <h3 className={styles.modeloTitulo}>Mecánica Cuántica (1926+)</h3>
                  <div className={styles.orbitalesGrid}>
                    <OrbitalSVG tipo="s" />
                    <OrbitalSVG tipo="p" />
                    <OrbitalSVG tipo="d" />
                  </div>
                  <ul className={styles.modeloLista}>
                    <li>NO órbitas sino <strong>orbitales</strong> (nubes de probabilidad)</li>
                    <li>El electrón está &quot;en todas partes a la vez&quot; hasta que se mide</li>
                    <li>Formas: <strong>s</strong> (esfera), <strong>p</strong> (lóbulos), <strong>d</strong> (trébol)</li>
                    <li>Explica todos los elementos y moléculas</li>
                    <li>Base de toda la química moderna</li>
                  </ul>
                </div>
              </div>

              {/* Configuración electrónica */}
              <div className={styles.configSection}>
                <h3>Configuración electrónica: cómo se llenan los orbitales</h3>
                <p className={styles.textoSecundario}>
                  Los electrones llenan orbitales de menor a mayor energía: <strong>1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p...</strong>
                </p>
                <div className={styles.configEjemplos}>
                  {ELEMENTOS.map((el) => (
                    <div key={el.simbolo} className={styles.configEjemplo}>
                      <span className={styles.configSimbolo}>{el.simbolo}</span>
                      <span className={styles.configTexto}>{el.configElectronica}</span>
                      <span className={styles.configElectrones}>{el.z} e⁻</span>
                    </div>
                  ))}
                </div>
                <p className={styles.textoSecundario}>
                  El hidrógeno (1 electrón) encaja perfectamente en el modelo de Bohr. Pero a partir del litio (3 e⁻), las interacciones entre electrones hacen que solo los orbitales cuánticos den resultados correctos.
                </p>
              </div>
            </div>
          )}

          {/* ─── SECCIÓN 3: Isótopos e iones ─── */}
          {seccionActiva === 'isotopos' && (
            <div className={styles.seccionContenido}>
              {/* Isótopos */}
              <div className={styles.bloqueIsotopos}>
                <h3>Isótopos: mismo elemento, distinto peso</h3>
                <p className={styles.textoSecundario}>
                  Mismos protones (Z), distinto número de neutrones (N). Cambia la masa pero no las propiedades químicas.
                </p>

                <div className={styles.selectorElemento}>
                  <label htmlFor="select-isotopo" className={styles.selectorLabel}>Explorar:</label>
                  <select
                    id="select-isotopo"
                    className={styles.selectInput}
                    value={isotopoElementoIdx}
                    onChange={(e) => setIsotopoElementoIdx(Number(e.target.value))}
                  >
                    {ELEMENTOS_ISOTOPOS.map((el, i) => (
                      <option key={el.nombre} value={i}>
                        {el.nombre} (Z = {el.z})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.isotoposGrid}>
                  {isotopoActual.isotopos.map((iso) => (
                    <div
                      key={iso.simbolo}
                      className={`${styles.isotopoCard} ${iso.estable ? styles.isotopoEstable : styles.isotopoRadiactivo}`}
                    >
                      <div className={styles.isotopoHeader}>
                        <span className={styles.isotopoSimbolo}>{iso.simbolo}</span>
                        <span className={`${styles.isotopoEstado} ${iso.estable ? '' : styles.radiactivo}`}>
                          {iso.estable ? '✅ Estable' : '☢️ Radiactivo'}
                        </span>
                      </div>
                      <div className={styles.isotopoComposicion}>
                        <span>{isotopoActual.z}p⁺</span>
                        <span>{iso.neutrones}n⁰</span>
                        <span>{isotopoActual.z}e⁻</span>
                      </div>
                      <p className={styles.isotopoNota}>{iso.nota}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Iones */}
              <div className={styles.bloqueIones}>
                <h3>Iones: ganar o perder electrones</h3>
                <p className={styles.textoSecundario}>
                  Cuando un átomo gana electrones se convierte en <strong>anión</strong> (carga −). Cuando pierde, en <strong>catión</strong> (carga +).
                </p>

                <div className={styles.ionesGrid}>
                  {IONES.map((ion) => (
                    <div key={ion.resultado} className={`${styles.ionCard} ${ion.tipo === 'catión' ? styles.ionCation : styles.ionAnion}`}>
                      <div className={styles.ionTransformacion}>
                        <span className={styles.ionOriginal}>{ion.simbolo}</span>
                        <span className={styles.ionFlecha} aria-hidden="true">→</span>
                        <span className={styles.ionResultado}>{ion.resultado}</span>
                      </div>
                      <span className={styles.ionTipo}>
                        {ion.tipo === 'catión'
                          ? <><span aria-hidden="true">🔴</span> Catión (+)</>
                          : <><span aria-hidden="true">🔵</span> Anión (−)</>}
                      </span>
                      <p className={styles.ionEjemplo}>{ion.ejemplo}</p>
                    </div>
                  ))}
                </div>

                <div className={styles.ionEjemploFinal}>
                  <span aria-hidden="true">🧂</span>
                  <p><strong>NaCl (sal de mesa):</strong> Na pierde 1e⁻ → Na⁺ | Cl gana 1e⁻ → Cl⁻ | Se atraen por carga opuesta → enlace iónico</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── SECCIÓN 4: Escala y datos ─── */}
          {seccionActiva === 'escala' && (
            <div className={styles.seccionContenido}>
              {/* El vacío atómico */}
              <div className={styles.bloqueEscala}>
                <h3><span aria-hidden="true">🏟️</span> El átomo es 99,9999% vacío</h3>

                <div className={styles.analogiaEstadio}>
                  <div className={styles.estadioSvg}>
                    <svg viewBox="0 0 300 180" aria-label="Analogía: si el núcleo fuera una pelota de tenis, el electrón estaría a 6 km">
                      {/* Estadio */}
                      <ellipse cx="150" cy="90" rx="140" ry="70" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeDasharray="6 4" />
                      <text x="150" y="160" textAnchor="middle" fill="var(--text-muted)" fontSize="10">Estadio de fútbol (~100 m)</text>
                      {/* Pelota */}
                      <circle cx="150" cy="90" r="5" fill="#E53935" />
                      <text x="150" y="78" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="bold">Núcleo</text>
                      {/* Electrón en las gradas */}
                      <circle cx="280" cy="50" r="3" fill="#2E86AB" />
                      <text x="270" y="40" textAnchor="middle" fill="#2E86AB" fontSize="8">e⁻</text>
                    </svg>
                  </div>
                  <p className={styles.analogiaTexto}>
                    Si el núcleo de un átomo fuera una <strong>pelota de tenis</strong> en el centro de un estadio de fútbol, el electrón más cercano estaría <strong>en las gradas</strong>. Todo lo demás es vacío.
                  </p>
                </div>

                <div className={styles.datosImpactantes}>
                  <div className={styles.datoCard}>
                    <span className={styles.datoNumero}>99,9999%</span>
                    <span className={styles.datoTexto}>del átomo es espacio vacío</span>
                  </div>
                  <div className={styles.datoCard}>
                    <span className={styles.datoNumero}>{formatNumber(escalaVacio.razon, 0)}x</span>
                    <span className={styles.datoTexto}>El átomo de {elementoActual.nombre} es ~{formatNumber(escalaVacio.razon, 0)} veces más grande que su núcleo</span>
                  </div>
                  <div className={styles.datoCard}>
                    <span className={styles.datoNumero}>1 terrón</span>
                    <span className={styles.datoTexto}>Si elimináramos el vacío de todos los átomos de la humanidad (8.000 millones de personas), cabrían en un terrón de azúcar</span>
                  </div>
                </div>
              </div>

              {/* Modelo estándar simplificado */}
              <div className={styles.bloqueModeloEstandar}>
                <h3><span aria-hidden="true">🧬</span> Quarks y el Modelo Estándar (simplificado)</h3>
                <p className={styles.textoSecundario}>
                  Protones y neutrones no son fundamentales: están hechos de <strong>quarks</strong>. El Modelo Estándar describe las partículas más básicas de la naturaleza.
                </p>

                <div className={styles.modeloEstandarGrid}>
                  <div className={styles.meCard}>
                    <h4>6 Quarks</h4>
                    <div className={styles.meItems}>
                      <span>Up (u)</span><span>Down (d)</span><span>Charm (c)</span>
                      <span>Strange (s)</span><span>Top (t)</span><span>Bottom (b)</span>
                    </div>
                    <p className={styles.meNota}>Forman protones (uud) y neutrones (udd)</p>
                  </div>
                  <div className={styles.meCard}>
                    <h4>6 Leptones</h4>
                    <div className={styles.meItems}>
                      <span>Electrón (e⁻)</span><span>Muón (μ⁻)</span><span>Tau (τ⁻)</span>
                      <span>ν<sub>e</sub></span><span>ν<sub>μ</sub></span><span>ν<sub>τ</sub></span>
                    </div>
                    <p className={styles.meNota}>El electrón es el leptón más conocido</p>
                  </div>
                  <div className={styles.meCard}>
                    <h4>4 Fuerzas</h4>
                    <div className={styles.meItems}>
                      <span>Nuclear fuerte</span><span>Nuclear débil</span>
                      <span>Electromagnética</span><span>Gravedad *</span>
                    </div>
                    <p className={styles.meNota}>* La gravedad aún no tiene descripción cuántica completa</p>
                  </div>
                </div>
              </div>

              {/* Historia */}
              <div className={styles.bloqueHistoria}>
                <h3><span aria-hidden="true">📜</span> 2.400 años descubriendo el átomo</h3>
                <div className={styles.lineaTiempo}>
                  {HISTORIA.map((h) => (
                    <div key={h.anio} className={styles.hitoCard}>
                      <span className={styles.hitoAnio}>{h.anio}</span>
                      <div className={styles.hitoContenido}>
                        <strong>{h.cientifico}</strong>
                        <p>{h.descubrimiento}</p>
                        <span className={styles.hitoModelo}>{h.modelo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 Más sobre la estructura atómica"
          subtitle="Curiosidades y conceptos avanzados"
        >
          <section className={styles.guideSection}>
            <h2>¿Por qué el átomo no colapsa?</h2>
            <p>
              Si el electrón tiene carga negativa y el protón positiva, ¿por qué no se atraen hasta juntarse?
              La respuesta está en el <strong>principio de incertidumbre de Heisenberg</strong>: cuanto más
              confinamos un electrón (lo acercamos al núcleo), más aumenta su energía cinética. Existe un
              equilibrio que define el tamaño del átomo.
            </p>

            <h2>¿Qué mantiene el núcleo unido?</h2>
            <p>
              Los protones se repelen por tener la misma carga positiva. La <strong>fuerza nuclear fuerte</strong>,
              mediada por gluones entre quarks, es 100 veces más intensa que la fuerza electromagnética pero
              actúa solo a distancias subatómicas. Los neutrones ayudan a &quot;diluir&quot; la repulsión electrostática.
            </p>

            <h2>Antimateria</h2>
            <p>
              Cada partícula tiene su antipartícula: el positrón (e⁺) es el antielectrón, el antiprotón tiene
              carga −1. Cuando materia y antimateria se encuentran, se <strong>aniquilan</strong> convirtiendo toda
              su masa en energía (E = mc²). El PET médico usa esta aniquilación de positrones para crear imágenes.
            </p>

            <h2>Números cuánticos</h2>
            <p>
              Cada electrón se describe con 4 números: <strong>n</strong> (nivel de energía), <strong>l</strong> (forma del orbital: 0=s, 1=p, 2=d),
              <strong> m<sub>l</sub></strong> (orientación espacial) y <strong>m<sub>s</sub></strong> (espín: +½ o −½).
              El principio de exclusión de Pauli dice que no pueden existir dos electrones con los mismos 4 números en un átomo.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-estructura-atomo')} />
        <ShareCard appName="visualizador-estructura-atomo" />
        <Footer appName="visualizador-estructura-atomo" />
    </div>
  );
}
