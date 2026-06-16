'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './ParticulasSubatomicas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoParticula = 'quark' | 'leptón' | 'bosón_gauge' | 'higgs';
type TabActivo = 'modelo' | 'fuerzas' | 'higgs' | 'lhc';

interface Particula {
  simbolo: string;
  nombre: string;
  tipo: TipoParticula;
  masa: string;
  carga: string;
  spin: string;
  anioDescubrimiento: number;
  descubridor: string;
  descripcion: string;
  generacion?: number;
  nobel?: boolean;
  nobelAnio?: number;
}

interface AntiParticula extends Particula {
  antisimbolo: string;
  antinombre: string;
}

interface Fuerza {
  nombre: string;
  portador: string;
  simboloPortador: string;
  alcance: string;
  intensidad: string;
  intensidadRelativa: number;
  descripcion: string;
  actua: string;
  color: string;
}

interface EventoTimeline {
  anio: number;
  evento: string;
  descripcion: string;
}

// ─── Datos: Partículas del Modelo Estándar ────────────────────────────────────

const PARTICULAS: Particula[] = [
  // Quarks — Generación 1
  {
    simbolo: 'u', nombre: 'Quark up', tipo: 'quark', generacion: 1,
    masa: '2,2 MeV/c²', carga: '+2/3', spin: '1/2',
    anioDescubrimiento: 1968, descubridor: 'SLAC (Friedman, Kendall, Taylor)',
    descripcion: 'Componente de protones (uud) y neutrones (udd). El quark más ligero con carga positiva.',
    nobel: true, nobelAnio: 1990,
  },
  {
    simbolo: 'd', nombre: 'Quark down', tipo: 'quark', generacion: 1,
    masa: '4,7 MeV/c²', carga: '-1/3', spin: '1/2',
    anioDescubrimiento: 1968, descubridor: 'SLAC (Friedman, Kendall, Taylor)',
    descripcion: 'Componente de protones y neutrones. Un neutrón tiene dos quarks down y uno up.',
    nobel: true, nobelAnio: 1990,
  },
  // Quarks — Generación 2
  {
    simbolo: 'c', nombre: 'Quark charm', tipo: 'quark', generacion: 2,
    masa: '1,27 GeV/c²', carga: '+2/3', spin: '1/2',
    anioDescubrimiento: 1974, descubridor: 'Ting (BNL) & Richter (SLAC)',
    descripcion: 'Descubierto en la "Revolución de noviembre de 1974". Aparece en mesones J/ψ.',
    nobel: true, nobelAnio: 1976,
  },
  {
    simbolo: 's', nombre: 'Quark strange', tipo: 'quark', generacion: 2,
    masa: '93 MeV/c²', carga: '-1/3', spin: '1/2',
    anioDescubrimiento: 1947, descubridor: 'Rochester & Butler (rayos cósmicos)',
    descripcion: 'El primer quark "exótico" conocido, presente en kaones y hiperones.',
  },
  // Quarks — Generación 3
  {
    simbolo: 't', nombre: 'Quark top', tipo: 'quark', generacion: 3,
    masa: '173 GeV/c²', carga: '+2/3', spin: '1/2',
    anioDescubrimiento: 1995, descubridor: 'Fermilab (experimentos CDF y D0)',
    descripcion: 'El más masivo de todos los quarks — más pesado que un átomo de oro. Se desintegra antes de poder hadronizarse.',
  },
  {
    simbolo: 'b', nombre: 'Quark bottom', tipo: 'quark', generacion: 3,
    masa: '4,18 GeV/c²', carga: '-1/3', spin: '1/2',
    anioDescubrimiento: 1977, descubridor: 'Fermilab (Leon Lederman)',
    descripcion: 'Encontrado en el mesón Υ (Upsilon). Su existencia confirmó la necesidad de una tercera generación.',
  },
  // Leptones — Generación 1
  {
    simbolo: 'e', nombre: 'Electrón', tipo: 'leptón', generacion: 1,
    masa: '0,511 MeV/c²', carga: '-1', spin: '1/2',
    anioDescubrimiento: 1897, descubridor: 'J.J. Thomson',
    descripcion: 'La primera partícula subatómica descubierta. Forma los enlaces químicos y es responsable de la electricidad.',
    nobel: true, nobelAnio: 1906,
  },
  {
    simbolo: 'νe', nombre: 'Neutrino electrónico', tipo: 'leptón', generacion: 1,
    masa: '< 1,1 eV/c²', carga: '0', spin: '1/2',
    anioDescubrimiento: 1956, descubridor: 'Cowan & Reines (reactor nuclear)',
    descripcion: 'Propuesto por Pauli en 1930 para conservar la energía. Apenas interacciona con la materia: billones pasan por tu cuerpo cada segundo.',
    nobel: true, nobelAnio: 1995,
  },
  // Leptones — Generación 2
  {
    simbolo: 'μ', nombre: 'Muón', tipo: 'leptón', generacion: 2,
    masa: '105,7 MeV/c²', carga: '-1', spin: '1/2',
    anioDescubrimiento: 1936, descubridor: 'Anderson & Neddermeyer (rayos cósmicos)',
    descripcion: '¿Quién pidió esto? — Dijo I.I. Rabi al descubrirse. Un electrón 207 veces más pesado, se desintegra en ~2,2 μs.',
  },
  {
    simbolo: 'νμ', nombre: 'Neutrino muónico', tipo: 'leptón', generacion: 2,
    masa: '< 0,19 MeV/c²', carga: '0', spin: '1/2',
    anioDescubrimiento: 1962, descubridor: 'Lederman, Schwartz, Steinberger (BNL)',
    descripcion: 'Demostró que existen distintos sabores de neutrino. Nobel 1988 por este descubrimiento.',
    nobel: true, nobelAnio: 1988,
  },
  // Leptones — Generación 3
  {
    simbolo: 'τ', nombre: 'Tau', tipo: 'leptón', generacion: 3,
    masa: '1.777 MeV/c²', carga: '-1', spin: '1/2',
    anioDescubrimiento: 1975, descubridor: 'Martin Perl (SLAC)',
    descripcion: 'El leptón más pesado, ~3.477 veces más masivo que el muón. Se desintegra en ~0,3 ps.',
    nobel: true, nobelAnio: 1995,
  },
  {
    simbolo: 'ντ', nombre: 'Neutrino tauónico', tipo: 'leptón', generacion: 3,
    masa: '< 18,2 MeV/c²', carga: '0', spin: '1/2',
    anioDescubrimiento: 2000, descubridor: 'Colaboración DONUT (Fermilab)',
    descripcion: 'El último leptón confirmado experimentalmente. Predicho desde 1975 pero detectado en el año 2000.',
  },
  // Bosones de gauge
  {
    simbolo: 'γ', nombre: 'Fotón', tipo: 'bosón_gauge',
    masa: '0', carga: '0', spin: '1',
    anioDescubrimiento: 1905, descubridor: 'Albert Einstein (efecto fotoeléctrico)',
    descripcion: 'Portador de la fuerza electromagnética. Viaja a la velocidad de la luz y es sin masa. Nobel 1921.',
    nobel: true, nobelAnio: 1921,
  },
  {
    simbolo: 'g', nombre: 'Gluón', tipo: 'bosón_gauge',
    masa: '0', carga: '0 (pero color)', spin: '1',
    anioDescubrimiento: 1979, descubridor: 'DESY (experimento PETRA)',
    descripcion: 'Portador de la fuerza nuclear fuerte. Existen 8 tipos según combinación de color/anticolor. Los gluones también interaccionan entre sí.',
  },
  {
    simbolo: 'W±', nombre: 'Bosón W', tipo: 'bosón_gauge',
    masa: '80,4 GeV/c²', carga: '±1', spin: '1',
    anioDescubrimiento: 1983, descubridor: 'Carlo Rubbia & Simon van der Meer (CERN)',
    descripcion: 'Portador de la fuerza nuclear débil. El W+ y W- median la desintegración beta y permiten que los quarks cambien de sabor.',
    nobel: true, nobelAnio: 1984,
  },
  {
    simbolo: 'Z⁰', nombre: 'Bosón Z', tipo: 'bosón_gauge',
    masa: '91,2 GeV/c²', carga: '0', spin: '1',
    anioDescubrimiento: 1983, descubridor: 'Carlo Rubbia & Simon van der Meer (CERN)',
    descripcion: 'La corriente neutra débil. Media interacciones débiles sin cambio de carga. Su masa determina la "anchura" de la fuerza débil.',
    nobel: true, nobelAnio: 1984,
  },
  // Higgs
  {
    simbolo: 'H⁰', nombre: 'Bosón de Higgs', tipo: 'higgs',
    masa: '125,25 GeV/c²', carga: '0', spin: '0',
    anioDescubrimiento: 2012, descubridor: 'ATLAS & CMS (CERN/LHC)',
    descripcion: 'La "partícula de Dios". Su campo permea todo el espacio y es responsable de dar masa a las partículas fundamentales. Nobel 2013: Higgs y Englert.',
    nobel: true, nobelAnio: 2013,
  },
];

// ─── Datos: Fuerzas fundamentales ─────────────────────────────────────────────

const FUERZAS: Fuerza[] = [
  {
    nombre: 'Electromagnética',
    portador: 'Fotón',
    simboloPortador: 'γ',
    alcance: 'Infinito',
    intensidad: '10⁻²',
    intensidadRelativa: 72,
    descripcion: 'Une electrones a núcleos atómicos, produce luz, electricidad y magnetismo. Descrita por la electrodinámica cuántica (QED).',
    actua: 'Partículas con carga eléctrica',
    color: '#2E86AB',
  },
  {
    nombre: 'Nuclear fuerte',
    portador: 'Gluón',
    simboloPortador: 'g',
    alcance: '~10⁻¹⁵ m',
    intensidad: '1 (referencia)',
    intensidadRelativa: 100,
    descripcion: 'La más intensa: mantiene a los quarks unidos en protones y neutrones, y a estos en el núcleo. Descrita por la cromodinámica cuántica (QCD).',
    actua: 'Quarks (carga de color)',
    color: '#E8A838',
  },
  {
    nombre: 'Nuclear débil',
    portador: 'W±, Z⁰',
    simboloPortador: 'W/Z',
    alcance: '~10⁻¹⁸ m',
    intensidad: '10⁻¹³',
    intensidadRelativa: 25,
    descripcion: 'Responsable de la desintegración beta: convierte neutrones en protones (o viceversa). Permite que el Sol brille al fusionar hidrógeno.',
    actua: 'Quarks y leptones',
    color: '#48A9A6',
  },
  {
    nombre: 'Gravedad',
    portador: 'Gravitón (hipotético)',
    simboloPortador: '?',
    alcance: 'Infinito',
    intensidad: '6×10⁻³⁹',
    intensidadRelativa: 5,
    descripcion: 'La más débil de todas. Aún no tiene portador confirmado ni integración en el Modelo Estándar. Es la gran incógnita de la física teórica.',
    actua: 'Todo lo que tiene energía/masa',
    color: '#999999',
  },
];

// ─── Datos: Timeline Higgs ────────────────────────────────────────────────────

const TIMELINE_HIGGS: EventoTimeline[] = [
  { anio: 1964, evento: 'Predicción teórica', descripcion: 'Peter Higgs, François Englert y Robert Brout proponen independientemente el mecanismo que da masa a las partículas.' },
  { anio: 1983, evento: 'Bosones W y Z encontrados', descripcion: 'CERN descubre los portadores de la fuerza débil, confirmando la teoría electrodébil de Glashow-Salam-Weinberg.' },
  { anio: 2000, evento: 'LEP descartado', descripcion: 'El LEP (CERN) termina su misión sin encontrar el Higgs, pero establece que su masa debe ser mayor de 114 GeV.' },
  { anio: 2011, evento: 'Tevatron cierra', descripcion: 'El Tevatron de Fermilab limita la masa del Higgs a la franja 115-135 GeV pero no lo descubre.' },
  { anio: 2012, evento: '¡Descubrimiento! 4 julio 2012', descripcion: 'ATLAS y CMS en el LHC (CERN) anuncian el descubrimiento de una nueva partícula con masa ~125 GeV compatible con el Higgs.' },
  { anio: 2013, evento: 'Nobel de Física', descripcion: 'Peter Higgs y François Englert reciben el Premio Nobel de Física por la predicción teórica del mecanismo.' },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function VisualizadorParticulasSubatomicas() {
  const [tabActivo, setTabActivo] = useState<TabActivo>('modelo');
  const [particulaSeleccionada, setParticulaSeleccionada] = useState<Particula | null>(null);
  const [mostrarAntiparticulas, setMostrarAntiparticulas] = useState<boolean>(false);
  const [masaSlider, setMasaSlider] = useState<number>(50);

  const quarks = PARTICULAS.filter(p => p.tipo === 'quark');
  const leptones = PARTICULAS.filter(p => p.tipo === 'leptón');
  const bosonesGauge = PARTICULAS.filter(p => p.tipo === 'bosón_gauge');
  const higgs = PARTICULAS.filter(p => p.tipo === 'higgs');

  const getColorTipo = (tipo: TipoParticula): string => {
    switch (tipo) {
      case 'quark': return styles.colorQuark;
      case 'leptón': return styles.colorLeptón;
      case 'bosón_gauge': return styles.colorBosón;
      case 'higgs': return styles.colorHiggs;
    }
  };

  const getEtiquetaTipo = (tipo: TipoParticula): string => {
    switch (tipo) {
      case 'quark': return 'Quark';
      case 'leptón': return 'Leptón';
      case 'bosón_gauge': return 'Bosón de gauge';
      case 'higgs': return 'Bosón de Higgs';
    }
  };

  // Interpolar descripción del slider de masa
  const getMasaDescripcion = (valor: number): { nombre: string; masa: string; descripcion: string } => {
    if (valor < 20) return {
      nombre: 'Fotón (γ)',
      masa: '0',
      descripcion: 'Sin masa → no interacciona con el campo de Higgs. Atraviesa el campo sin rozamiento, como luz pasando por el vacío perfecto.',
    };
    if (valor < 60) return {
      nombre: 'Neutrino (ν)',
      masa: '< 1 eV/c²',
      descripcion: 'Masa casi cero → interacción mínima con el campo. Tan ligero que durante mucho tiempo se pensó que era sin masa.',
    };
    if (valor < 80) return {
      nombre: 'Electrón (e⁻)',
      masa: '0,511 MeV/c²',
      descripcion: 'Masa pequeña → poca interacción con el campo de Higgs. Como una pluma moviéndose por melaza ligera.',
    };
    return {
      nombre: 'Quark top (t)',
      masa: '~173 GeV/c²',
      descripcion: 'Masa enorme → interacción máxima con el campo de Higgs. Como una bola de plomo en melaza espesa — la más intensa acoplamiento Yukawa conocido.',
    };
  };

  const masaInfo = getMasaDescripcion(masaSlider);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} aria-hidden="true">⚛️</span>
          <h1 className={styles.heroTitle}>Partículas Subatómicas</h1>
          <p className={styles.heroSubtitle}>El Modelo Estándar de la Física de Partículas</p>
          <p className={styles.heroDesc}>
            17 partículas fundamentales que explican todo lo que existe. Quarks, leptones, bosones y el mecanismo de Higgs — la "tabla periódica" del universo más profundo.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ─── Tabs ─────────────────────────────────────────────────────────── */}
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs} role="tablist" aria-label="Secciones del visualizador">
          {(['modelo', 'fuerzas', 'higgs', 'lhc'] as TabActivo[]).map((tab) => {
            const etiquetas: Record<TabActivo, string> = {
              modelo: '🧩 Modelo Estándar',
              fuerzas: '⚡ Las 4 Fuerzas',
              higgs: '🌊 Campo de Higgs',
              lhc: '🔬 LHC y Detección',
            };
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={tabActivo === tab}
                className={`${styles.tabBtn} ${tabActivo === tab ? styles.tabBtnActivo : ''}`}
                onClick={() => setTabActivo(tab)}
              >
                {etiquetas[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 1 — MODELO ESTÁNDAR                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tabActivo === 'modelo' && (
        <section className={styles.section} aria-label="Tabla del Modelo Estándar">
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>La Tabla del Modelo Estándar</h2>
            <p className={styles.sectionSubtitle}>
              17 partículas elementales — haz clic en cualquiera para ver sus propiedades
            </p>

            {/* Toggle antipartículas */}
            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${mostrarAntiparticulas ? styles.toggleBtnActivo : ''}`}
                onClick={() => setMostrarAntiparticulas(!mostrarAntiparticulas)}
                aria-pressed={mostrarAntiparticulas}
              >
                {mostrarAntiparticulas ? '🔵 Ver partículas' : '🔴 Ver antipartículas'}
              </button>
              {mostrarAntiparticulas && (
                <span className={styles.antiNote}>
                  Las antipartículas tienen carga opuesta y se anulan con su pareja en una llamarada de energía.
                </span>
              )}
            </div>

            {/* Leyenda */}
            <div className={styles.leyenda}>
              <span className={`${styles.leyendaDot} ${styles.dotQuark}`} />
              <span className={styles.leyendaLabel}>Quarks</span>
              <span className={`${styles.leyendaDot} ${styles.dotLeptón}`} />
              <span className={styles.leyendaLabel}>Leptones</span>
              <span className={`${styles.leyendaDot} ${styles.dotBosón}`} />
              <span className={styles.leyendaLabel}>Bosones</span>
              <span className={`${styles.leyendaDot} ${styles.dotHiggs}`} />
              <span className={styles.leyendaLabel}>Higgs</span>
              <span className={styles.leyendaLabel}>🏆 Nobel</span>
            </div>

            {/* Tabla */}
            <div className={styles.tablaModelo}>
              {/* Columna Quarks */}
              <div className={styles.columnaParticulas}>
                <h3 className={`${styles.columnaTitle} ${styles.columnaTitleQuark}`}>
                  Quarks <span className={styles.columnaBadge}>6</span>
                </h3>
                <p className={styles.columnaDesc}>Forman protones y neutrones</p>
                {[1, 2, 3].map(gen => (
                  <div key={gen} className={styles.generacionFila}>
                    <span className={styles.genLabel}>G{gen}</span>
                    <div className={styles.parFila}>
                      {quarks.filter(q => q.generacion === gen).map(p => (
                        <button
                          key={p.simbolo}
                          type="button"
                          className={`${styles.particula} ${styles.particulaQuark} ${particulaSeleccionada?.simbolo === p.simbolo ? styles.particulaSeleccionada : ''}`}
                          onClick={() => setParticulaSeleccionada(p)}
                          aria-label={`${mostrarAntiparticulas ? 'Anti-' : ''}${p.nombre}`}
                        >
                          <span className={styles.particulaSimbolo}>
                            {mostrarAntiparticulas ? p.simbolo.toUpperCase() : p.simbolo}
                          </span>
                          <span className={styles.particulaMasa}>{p.masa.split(' ')[0]}</span>
                          {p.nobel && <span className={styles.nobelBadge} aria-label="Nobel de Física">🏆</span>}
                          {mostrarAntiparticulas && <span className={styles.antiBadge}>anti</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Columna Leptones */}
              <div className={styles.columnaParticulas}>
                <h3 className={`${styles.columnaTitle} ${styles.columnaTitleLeptón}`}>
                  Leptones <span className={styles.columnaBadge}>6</span>
                </h3>
                <p className={styles.columnaDesc}>No sienten la fuerza fuerte</p>
                {[1, 2, 3].map(gen => (
                  <div key={gen} className={styles.generacionFila}>
                    <span className={styles.genLabel}>G{gen}</span>
                    <div className={styles.parFila}>
                      {leptones.filter(l => l.generacion === gen).map(p => (
                        <button
                          key={p.simbolo}
                          type="button"
                          className={`${styles.particula} ${styles.particulaLeptón} ${particulaSeleccionada?.simbolo === p.simbolo ? styles.particulaSeleccionada : ''}`}
                          onClick={() => setParticulaSeleccionada(p)}
                          aria-label={`${mostrarAntiparticulas ? 'Anti-' : ''}${p.nombre}`}
                        >
                          <span className={styles.particulaSimbolo}>
                            {mostrarAntiparticulas ? `ā${p.simbolo}` : p.simbolo}
                          </span>
                          <span className={styles.particulaMasa}>{p.masa.split(' ')[0]}</span>
                          {p.nobel && <span className={styles.nobelBadge} aria-label="Nobel de Física">🏆</span>}
                          {mostrarAntiparticulas && <span className={styles.antiBadge}>anti</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Columna Bosones */}
              <div className={styles.columnaParticulas}>
                <h3 className={`${styles.columnaTitle} ${styles.columnaTitleBosón}`}>
                  Bosones <span className={styles.columnaBadge}>4+1</span>
                </h3>
                <p className={styles.columnaDesc}>Portadores de fuerza + Higgs</p>
                <div className={styles.bosonesGrid}>
                  {[...bosonesGauge, ...higgs].map(p => (
                    <button
                      key={p.simbolo}
                      type="button"
                      className={`${styles.particula} ${p.tipo === 'higgs' ? styles.particulaHiggs : styles.particulaBosón} ${particulaSeleccionada?.simbolo === p.simbolo ? styles.particulaSeleccionada : ''}`}
                      onClick={() => setParticulaSeleccionada(p)}
                      aria-label={p.nombre}
                    >
                      <span className={styles.particulaSimbolo}>{p.simbolo}</span>
                      <span className={styles.particulaMasa}>{p.masa.split(' ')[0]}</span>
                      {p.nobel && <span className={styles.nobelBadge} aria-label="Nobel de Física">🏆</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de detalles */}
            {particulaSeleccionada && (
              <div className={`${styles.panelDetalle} ${getColorTipo(particulaSeleccionada.tipo)}`} role="region" aria-label="Detalles de la partícula">
                <div className={styles.panelHeader}>
                  <div>
                    <h3 className={styles.panelTitulo}>{particulaSeleccionada.nombre}</h3>
                    <span className={styles.panelTipo}>{getEtiquetaTipo(particulaSeleccionada.tipo)}</span>
                    {particulaSeleccionada.nobel && (
                      <span className={styles.panelNobel}>🏆 Nobel {particulaSeleccionada.nobelAnio}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.panelCerrar}
                    onClick={() => setParticulaSeleccionada(null)}
                    aria-label="Cerrar panel de detalles"
                  >
                    ✕
                  </button>
                </div>
                <p className={styles.panelDesc}>{particulaSeleccionada.descripcion}</p>
                <div className={styles.panelPropiedades}>
                  <div className={styles.panelProp}>
                    <span className={styles.propLabel}>Masa</span>
                    <span className={styles.propValor}>{particulaSeleccionada.masa}</span>
                  </div>
                  <div className={styles.panelProp}>
                    <span className={styles.propLabel}>Carga</span>
                    <span className={styles.propValor}>{particulaSeleccionada.carga} e</span>
                  </div>
                  <div className={styles.panelProp}>
                    <span className={styles.propLabel}>Espín</span>
                    <span className={styles.propValor}>{particulaSeleccionada.spin}</span>
                  </div>
                  <div className={styles.panelProp}>
                    <span className={styles.propLabel}>Descubierto</span>
                    <span className={styles.propValor}>{particulaSeleccionada.anioDescubrimiento}</span>
                  </div>
                  <div className={`${styles.panelProp} ${styles.panelPropFull}`}>
                    <span className={styles.propLabel}>Por</span>
                    <span className={styles.propValor}>{particulaSeleccionada.descubridor}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 2 — FUERZAS FUNDAMENTALES                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tabActivo === 'fuerzas' && (
        <section className={styles.section} aria-label="Las 4 fuerzas fundamentales">
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>Las 4 Fuerzas Fundamentales</h2>
            <p className={styles.sectionSubtitle}>
              Toda interacción en el universo se explica por estas cuatro fuerzas
            </p>

            <div className={styles.fuerzasGrid}>
              {FUERZAS.map((fuerza) => (
                <div key={fuerza.nombre} className={styles.fuerzaCard}>
                  <div className={styles.fuerzaHeader} style={{ borderColor: fuerza.color }}>
                    <div>
                      <h3 className={styles.fuerzaNombre}>{fuerza.nombre}</h3>
                      <div className={styles.fuerzaPortador}>
                        <span className={styles.fuerzaPortadorLabel}>Portador: </span>
                        <span className={styles.fuerzaPortadorValor} style={{ color: fuerza.color }}>
                          {fuerza.portador} ({fuerza.simboloPortador})
                        </span>
                      </div>
                    </div>
                    {/* Diagrama de Feynman simplificado SVG */}
                    <svg width="80" height="60" viewBox="0 0 80 60" aria-label={`Diagrama de Feynman: ${fuerza.nombre}`}>
                      {/* Partícula 1 */}
                      <line x1="0" y1="15" x2="35" y2="30" stroke={fuerza.color} strokeWidth="2" />
                      {/* Partícula 2 */}
                      <line x1="0" y1="45" x2="35" y2="30" stroke={fuerza.color} strokeWidth="2" />
                      {/* Bosón (ondulado) */}
                      <path
                        d="M35,30 Q40,22 45,30 Q50,38 55,30 Q60,22 65,30 Q70,38 75,30 Q77,26 80,30"
                        stroke={fuerza.color} strokeWidth="2" fill="none"
                      />
                      {/* Partícula 3 */}
                      <line x1="80" y1="30" x2="115" y2="15" stroke={fuerza.color} strokeWidth="2" />
                      {/* Partícula 4 */}
                      <line x1="80" y1="30" x2="115" y2="45" stroke={fuerza.color} strokeWidth="2" />
                      {/* Puntos de vértice */}
                      <circle cx="35" cy="30" r="3" fill={fuerza.color} />
                      <circle cx="80" cy="30" r="3" fill={fuerza.color} />
                      {/* Etiqueta bosón */}
                      <text x="55" y="20" fontSize="9" fill={fuerza.color} textAnchor="middle">{fuerza.simboloPortador}</text>
                    </svg>
                  </div>

                  <p className={styles.fuerzaDesc}>{fuerza.descripcion}</p>

                  <div className={styles.fuerzaPropGrid}>
                    <div className={styles.fuerzaProp}>
                      <span className={styles.fuerzaPropLabel}>Alcance</span>
                      <span className={styles.fuerzaPropValor}>{fuerza.alcance}</span>
                    </div>
                    <div className={styles.fuerzaProp}>
                      <span className={styles.fuerzaPropLabel}>Intensidad</span>
                      <span className={styles.fuerzaPropValor}>{fuerza.intensidad}</span>
                    </div>
                    <div className={styles.fuerzaProp}>
                      <span className={styles.fuerzaPropLabel}>Actúa sobre</span>
                      <span className={styles.fuerzaPropValor}>{fuerza.actua}</span>
                    </div>
                  </div>

                  {/* Barra de intensidad relativa */}
                  <div className={styles.intensidadBarraWrapper}>
                    <span className={styles.intensidadBarraLabel}>Intensidad relativa</span>
                    <div className={styles.intensidadBarra}>
                      <div
                        className={styles.intensidadBarraFill}
                        style={{ width: `${fuerza.intensidadRelativa}%`, backgroundColor: fuerza.color }}
                        aria-valuenow={fuerza.intensidadRelativa}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        role="progressbar"
                        aria-label={`Intensidad relativa de la fuerza ${fuerza.nombre}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabla comparativa */}
            <div className={styles.tablaComparativa}>
              <h3 className={styles.tablaComparativaTitle}>Comparativa de fuerzas</h3>
              <div className={styles.tablaWrapper}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Fuerza</th>
                      <th>Portador</th>
                      <th>Alcance</th>
                      <th>Intensidad</th>
                      <th>Unificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Electromagnética</td>
                      <td>γ (fotón)</td>
                      <td>∞</td>
                      <td>10⁻²</td>
                      <td>Con débil → Electrodébil (1979)</td>
                    </tr>
                    <tr>
                      <td>Nuclear fuerte</td>
                      <td>g (gluón)</td>
                      <td>10⁻¹⁵ m</td>
                      <td>1</td>
                      <td>Gran Unificación (pendiente)</td>
                    </tr>
                    <tr>
                      <td>Nuclear débil</td>
                      <td>W±, Z⁰</td>
                      <td>10⁻¹⁸ m</td>
                      <td>10⁻¹³</td>
                      <td>Con EM → Electrodébil (1979)</td>
                    </tr>
                    <tr>
                      <td>Gravedad</td>
                      <td>Gravitón (?)</td>
                      <td>∞</td>
                      <td>6×10⁻³⁹</td>
                      <td>No unificada (Teoría del Todo)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 3 — MECANISMO DE HIGGS                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tabActivo === 'higgs' && (
        <section className={styles.section} aria-label="Mecanismo de Higgs">
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>El Mecanismo de Higgs</h2>
            <p className={styles.sectionSubtitle}>
              ¿Por qué las partículas tienen masa? La respuesta está en un campo que llena todo el universo.
            </p>

            {/* Animación campo de Higgs */}
            <div className={styles.campoHiggsWrapper}>
              <h3 className={styles.campoTitle}>El campo de Higgs llena todo el espacio</h3>
              <svg
                width="100%"
                viewBox="0 0 400 180"
                className={styles.campoSvg}
                aria-label="Visualización del campo de Higgs como una cuadrícula que llena el espacio"
              >
                {/* Cuadrícula del campo */}
                {Array.from({ length: 8 }, (_, i) =>
                  Array.from({ length: 5 }, (_, j) => (
                    <g key={`${i}-${j}`}>
                      <circle
                        cx={20 + i * 52}
                        cy={20 + j * 35}
                        r="4"
                        fill="#E8A838"
                        opacity="0.7"
                      />
                      {i < 7 && (
                        <line
                          x1={24 + i * 52}
                          y1={20 + j * 35}
                          x2={68 + i * 52}
                          y2={20 + j * 35}
                          stroke="#E8A838"
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      )}
                      {j < 4 && (
                        <line
                          x1={20 + i * 52}
                          y1={24 + j * 35}
                          x2={20 + i * 52}
                          y2={51 + j * 35}
                          stroke="#E8A838"
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      )}
                    </g>
                  ))
                )}
                {/* Fotón (sin masa) */}
                <circle cx="80" cy="90" r="10" fill="transparent" stroke="#2E86AB" strokeWidth="2" />
                <text x="80" y="94" textAnchor="middle" fontSize="10" fill="#2E86AB">γ</text>
                <path d="M90,90 Q100,82 110,90 Q120,98 130,90 Q140,82 150,90 Q160,98 170,90" stroke="#2E86AB" strokeWidth="2" fill="none" />
                <text x="125" y="115" textAnchor="middle" fontSize="9" fill="#2E86AB">Fotón: sin rozamiento</text>
                {/* Quark top (con masa) */}
                <circle cx="290" cy="90" r="12" fill="#E84A5F" opacity="0.9" />
                <text x="290" y="94" textAnchor="middle" fontSize="10" fill="#ffffff">t</text>
                <path d="M302,90 L308,85 L312,95 L318,80 L322,100 L328,85" stroke="#E84A5F" strokeWidth="2" fill="none" />
                <text x="315" y="115" textAnchor="middle" fontSize="9" fill="#E84A5F">Quark top: rozamiento máximo</text>
                {/* Etiquetas */}
                <text x="200" y="160" textAnchor="middle" fontSize="10" fill="#999999">
                  Más interacción con el campo → más masa
                </text>
              </svg>
            </div>

            {/* Slider interactivo */}
            <div className={styles.sliderWrapper}>
              <h3 className={styles.sliderTitle}>Interacción con el campo de Higgs</h3>
              <div className={styles.sliderRow}>
                <span className={styles.sliderEtiqueta}>Sin masa (fotón)</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={masaSlider}
                  onChange={(e) => setMasaSlider(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Ajustar masa de partícula para ver interacción con campo de Higgs"
                />
                <span className={styles.sliderEtiqueta}>Masa enorme (quark top)</span>
              </div>
              <div className={styles.sliderInfo}>
                <div className={styles.sliderParticulaNombre}>{masaInfo.nombre}</div>
                <div className={styles.sliderMasa}>Masa: {masaInfo.masa}</div>
                <p className={styles.sliderDesc}>{masaInfo.descripcion}</p>
              </div>
            </div>

            {/* Timeline del descubrimiento */}
            <div className={styles.timelineWrapper}>
              <h3 className={styles.timelineTitle}>La búsqueda del bosón de Higgs</h3>
              <div className={styles.timeline}>
                {TIMELINE_HIGGS.map((evento, idx) => (
                  <div key={evento.anio} className={styles.timelineItem}>
                    <div className={`${styles.timelinePunto} ${idx === TIMELINE_HIGGS.length - 2 ? styles.timelinePuntoNobel : ''}`}>
                      {idx === TIMELINE_HIGGS.length - 2 ? '⚡' : idx === TIMELINE_HIGGS.length - 1 ? '🏆' : '○'}
                    </div>
                    <div className={styles.timelineContenido}>
                      <span className={styles.timelineAnio}>{evento.anio}</span>
                      <strong className={styles.timelineEvento}>{evento.evento}</strong>
                      <p className={styles.timelineDesc}>{evento.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos clave Higgs */}
            <div className={styles.higgsStats}>
              <div className={styles.higgsStat}>
                <span className={styles.higgsStatValor}>125,25 GeV/c²</span>
                <span className={styles.higgsStatLabel}>Masa del Higgs</span>
              </div>
              <div className={styles.higgsStat}>
                <span className={styles.higgsStatValor}>4 jul. 2012</span>
                <span className={styles.higgsStatLabel}>Fecha descubrimiento</span>
              </div>
              <div className={styles.higgsStat}>
                <span className={styles.higgsStatValor}>Nobel 2013</span>
                <span className={styles.higgsStatLabel}>Higgs + Englert</span>
              </div>
              <div className={styles.higgsStat}>
                <span className={styles.higgsStatValor}>0</span>
                <span className={styles.higgsStatLabel}>Spin (único escalar)</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB 4 — LHC                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tabActivo === 'lhc' && (
        <section className={styles.section} aria-label="LHC y detección de partículas">
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>El LHC: La Máquina Más Compleja del Mundo</h2>
            <p className={styles.sectionSubtitle}>
              27 km de circunferencia, 13,6 TeV de energía, temperatura más fría que el espacio exterior
            </p>

            {/* Diagrama LHC SVG */}
            <div className={styles.lhcWrapper}>
              <svg
                width="100%"
                viewBox="0 0 400 320"
                className={styles.lhcSvg}
                aria-label="Diagrama del LHC con sus 4 detectores principales"
              >
                {/* Anillo del LHC */}
                <circle cx="200" cy="160" r="120" fill="none" stroke="#2E86AB" strokeWidth="8" opacity="0.6" />
                {/* Doble haz */}
                <circle cx="200" cy="160" r="112" fill="none" stroke="#E84A5F" strokeWidth="2" strokeDasharray="8,4" opacity="0.5" />
                <circle cx="200" cy="160" r="128" fill="none" stroke="#48A9A6" strokeWidth="2" strokeDasharray="8,4" opacity="0.5" />

                {/* ATLAS — arriba */}
                <circle cx="200" cy="40" r="14" fill="#E8A838" opacity="0.9" />
                <text x="200" y="44" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">ATLAS</text>
                <text x="200" y="25" textAnchor="middle" fontSize="8" fill="#E8A838">General</text>

                {/* CMS — abajo */}
                <circle cx="200" cy="280" r="14" fill="#E8A838" opacity="0.9" />
                <text x="200" y="284" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold">CMS</text>
                <text x="200" y="300" textAnchor="middle" fontSize="8" fill="#E8A838">General</text>

                {/* ALICE — izquierda */}
                <circle cx="80" cy="160" r="12" fill="#48A9A6" opacity="0.9" />
                <text x="80" y="164" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">ALICE</text>
                <text x="55" y="185" textAnchor="middle" fontSize="7" fill="#48A9A6">Plasma</text>
                <text x="55" y="195" textAnchor="middle" fontSize="7" fill="#48A9A6">quarks</text>

                {/* LHCb — derecha */}
                <circle cx="320" cy="160" r="12" fill="#48A9A6" opacity="0.9" />
                <text x="320" y="164" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">LHCb</text>
                <text x="345" y="185" textAnchor="middle" fontSize="7" fill="#48A9A6">Beauty</text>
                <text x="345" y="195" textAnchor="middle" fontSize="7" fill="#48A9A6">quarks</text>

                {/* Flechas de dirección de los haces */}
                <text x="260" y="52" fontSize="9" fill="#E84A5F">→ protones</text>
                <text x="100" y="52" fontSize="9" fill="#48A9A6">← antiprotones</text>

                {/* Centro */}
                <text x="200" y="155" textAnchor="middle" fontSize="10" fill="#666">LHC</text>
                <text x="200" y="168" textAnchor="middle" fontSize="8" fill="#666">27 km</text>
              </svg>
            </div>

            {/* Datos del LHC */}
            <div className={styles.lhcStats}>
              <div className={styles.lhcStat}>
                <span className={styles.lhcStatValor}>13,6 TeV</span>
                <span className={styles.lhcStatLabel}>Energía de colisión (récord 2022)</span>
              </div>
              <div className={styles.lhcStat}>
                <span className={styles.lhcStatValor}>10⁻²⁷ m</span>
                <span className={styles.lhcStatLabel}>Escala explorada (1000× más pequeño que protón)</span>
              </div>
              <div className={styles.lhcStat}>
                <span className={styles.lhcStatValor}>-271,3 °C</span>
                <span className={styles.lhcStatLabel}>Temperatura imanes superconductores</span>
              </div>
              <div className={styles.lhcStat}>
                <span className={styles.lhcStatValor}>10¹⁶ K</span>
                <span className={styles.lhcStatLabel}>Temperatura equivalente de colisión (millones de veces el Sol)</span>
              </div>
            </div>

            {/* Capas del detector */}
            <div className={styles.detectorWrapper}>
              <h3 className={styles.detectorTitle}>Capas del detector ATLAS (simplificado)</h3>
              <svg
                width="100%"
                viewBox="0 0 400 200"
                className={styles.detectorSvg}
                aria-label="Capas del detector ATLAS de partículas"
              >
                {/* Capas concéntricas */}
                <ellipse cx="200" cy="100" rx="20" ry="15" fill="#E84A5F" opacity="0.8" />
                <text x="200" y="104" textAnchor="middle" fontSize="7" fill="#fff">colisión</text>

                <ellipse cx="200" cy="100" rx="50" ry="40" fill="none" stroke="#2E86AB" strokeWidth="12" opacity="0.5" />
                <text x="265" y="78" fontSize="8" fill="#2E86AB">Tracker</text>
                <text x="265" y="89" fontSize="7" fill="#999">(posición cargadas)</text>

                <ellipse cx="200" cy="100" rx="90" ry="72" fill="none" stroke="#E8A838" strokeWidth="14" opacity="0.5" />
                <text x="302" y="95" fontSize="8" fill="#E8A838">ECAL</text>
                <text x="302" y="106" fontSize="7" fill="#999">(energía e⁻, γ)</text>

                <ellipse cx="200" cy="100" rx="130" ry="98" fill="none" stroke="#48A9A6" strokeWidth="14" opacity="0.5" />
                <text x="342" y="112" fontSize="8" fill="#48A9A6">HCAL</text>
                <text x="342" y="123" fontSize="7" fill="#999">(energía hadrones)</text>

                <ellipse cx="200" cy="100" rx="165" ry="92" fill="none" stroke="#9B59B6" strokeWidth="8" opacity="0.5" />
                <text x="30" y="112" fontSize="8" fill="#9B59B6" textAnchor="middle">Cámara</text>
                <text x="30" y="123" fontSize="8" fill="#9B59B6" textAnchor="middle">muones</text>
              </svg>
            </div>

            {/* Asimetría materia-antimateria */}
            <div className={styles.antimateriaPanel}>
              <h3 className={styles.antimateriaTitle}>¿Por qué hay más materia que antimateria?</h3>
              <div className={styles.antimateriaContenido}>
                <p>En el Big Bang se crearon <strong>cantidades iguales</strong> de materia y antimateria. Si hubieran sido exactamente iguales, se habrían aniquilado mutuamente y el universo sería solo fotones.</p>
                <p>Pero existe una asimetría de <strong>1 parte en 10.000 millones</strong>: por cada 10.000 millones de pares materia-antimateria, había 1 partícula de materia extra. Esa es toda la materia del universo.</p>
                <div className={styles.antimateriaFactores}>
                  <div className={styles.antimateriaFactor}>
                    <strong>Condiciones de Sakharov (1967)</strong>
                    <ol>
                      <li>Violación del número bariónico (B)</li>
                      <li>Violación de las simetrías C y CP</li>
                      <li>Desequilibrio termodinámico</li>
                    </ol>
                  </div>
                  <div className={styles.antimateriaFactor}>
                    <strong>Estado actual</strong>
                    <ul>
                      <li>Se ha observado violación CP en kaones y mesones B</li>
                      <li>No suficiente para explicar toda la asimetría</li>
                      <li>El LHCb estudia quarks beauty buscando más violación CP</li>
                      <li>Sigue siendo uno de los grandes misterios de la física</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBox}>
              <strong>Nota educativa:</strong> Las energías del LHC (13,6 TeV) son enormes a escala de partículas, pero microscópicas en términos humanos — equivalen a la energía cinética de un mosquito en vuelo. No existe riesgo de crear agujeros negros peligrosos.
            </div>
          </div>
        </section>
      )}

      {/* ─── Sección educativa ─────────────────────────────────────────────── */}
      <EducationalSection title="Entender el Modelo Estándar" subtitle="La teoría más exitosa de la física: 17 partículas que lo explican todo (excepto la gravedad)">

        <h3>Comparativa de Partículas Fundamentales</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Familia</th>
                <th>Ejemplos</th>
                <th>Carga eléctrica</th>
                <th>Interacciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Quarks (6 sabores)</td>
                <td>up, down, charm, strange, top, bottom</td>
                <td>+2/3 o −1/3 (e)</td>
                <td>Fuerte, débil, EM, gravedad</td>
              </tr>
              <tr>
                <td>Leptones (6)</td>
                <td>electrón, muón, tau, 3 neutrinos</td>
                <td>−1 (e⁻, μ⁻, τ⁻) o 0 (ν)</td>
                <td>Débil, EM (no fuerte)</td>
              </tr>
              <tr>
                <td>Bosones gauge (5)</td>
                <td>fotón, W⁺, W⁻, Z⁰, gluón</td>
                <td>0 o ±1</td>
                <td>Mediadores de las fuerzas</td>
              </tr>
              <tr>
                <td>Bosón de Higgs (1)</td>
                <td>H⁰</td>
                <td>0</td>
                <td>Da masa a W, Z y fermiones</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Casos de Uso</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">🎓</span> Estudiante de Física</h4>
            <p>El Modelo Estándar es la teoría más precisa de la historia: predice el momento magnético anómalo del electrón con 12 decimales de exactitud. Entenderlo es imprescindible para cualquier física teórica o experimental.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">🏥</span> Médico — PET y Radioterapia</h4>
            <p>El PET usa positrones (antielectrones) que se aniquilan con electrones emitiendo pares de fotones γ detectables. La radioterapia con protones aprovecha el efecto Bragg para depositar energía justo en el tumor, protegiendo tejido sano.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">⚛️</span> Ingeniero Nuclear</h4>
            <p>La fisión del U-235 libera neutrones que inician reacciones en cadena. Entender la sección eficaz de captura neutrónica de cada isótopo es crucial para el diseño del reactor, el enriquecimiento y la gestión del combustible gastado.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h4><span aria-hidden="true">🌌</span> Cosmólogo</h4>
            <p>La asimetría materia-antimateria (violación CP) explica por qué hay más materia que antimateria en el universo. Experimentos como Belle II y LHCb buscan la fuente de esta asimetría que hizo posible nuestra existencia.</p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Qué es el campo de Higgs y por qué es tan importante?</strong>
            <p>El campo de Higgs permea todo el espacio. Las partículas adquieren masa al interactuar con él: cuanto más interactúan, más masivas son. El fotón no interactúa en absoluto → masa cero → viaja a c. El bosón de Higgs es la excitación cuántica de ese campo, descubierta en el LHC en 2012.</p>
            <div className={styles.faqTip}>💡 Sin el campo de Higgs, los bosones W y Z serían sin masa como el fotón y la fuerza débil alcanzaría grandes distancias, haciendo imposibles los núcleos atómicos.</div>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre quarks y leptones?</strong>
            <p>Los quarks sienten la fuerza nuclear fuerte (mediada por gluones) y siempre están confinados en hadrones (protones, neutrones, mesones). Los leptones no sienten la fuerza fuerte y pueden existir libres: el electrón es el leptón más conocido.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué son los bosones gauge?</strong>
            <p>Son las partículas que median las interacciones fundamentales: el fotón media el electromagnetismo, los W±/Z la fuerza débil, y los gluones la fuerza fuerte. Cada fuerza tiene su(s) bosón(es) mediador(es), analogía cuántica de «llevar» la fuerza.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Por qué existe la antimateria si el Big Bang produjo partes iguales?</strong>
            <p>Debería haber producido cantidades iguales y aniquilarse todo. Pero existe una pequeña asimetría (violación CP) que hizo que sobreviviera ligeramente más materia que antimateria: esa fracción sobrante de 1 en 10⁹ es todo el universo observable.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué hay más allá del Modelo Estándar?</strong>
            <p>El Modelo Estándar no incluye gravedad cuántica, no explica la materia oscura, no justifica la asimetría CP completa, y tiene 19 parámetros libres sin explicación. Candidatos: supersimetría (SUSY), teoría de cuerdas, modelos de Kaluza-Klein. Ninguno confirmado aún.</p>
          </div>
        </div>

        <h3>Guía de Uso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h4>Explora el Modelo Estándar</h4>
              <p>Haz clic en cada partícula de la tabla para ver sus propiedades: masa, carga, espín, interacciones. Compara las 3 generaciones de quarks y leptones.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h4>Visualiza las fuerzas de Feynman</h4>
              <p>Los diagramas de Feynman son «recetas» para calcular probabilidades de interacción. Observa qué bosones median cada fuerza y cómo cambia el alcance según la masa del mediador.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h4>Interactúa con el mecanismo de Higgs</h4>
              <p>Observa cómo la «melaza» del campo de Higgs ralentiza a las partículas masivas y deja pasar libremente a los fotones. El potencial mexicano muestra la rotura espontánea de simetría.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h4>Recorre el LHC</h4>
              <p>Sigue las partículas desde el LINAC hasta los detectores ATLAS y CMS. Compara las energías de colisión históricas y los descubrimientos clave: quark top (1995), bosón de Higgs (2012), Tcc+ (2021).</p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚛️</span>
            <div>
              <strong>Masa en eV/c²</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>En física de partículas se usa eV/c² (electronvoltio/c²). El protón pesa 938 MeV/c². El Higgs pesa 125 GeV/c². El neutrino, menos de 0,12 eV/c²: ¡8 órdenes de magnitud de diferencia!</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <div>
              <strong>Confinamiento de color</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>Los quarks nunca se observan aislados: la fuerza entre ellos crece con la distancia (como una goma). Al separarlos, se crea un par quark-antiquark nuevo: «hadronización».</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌊</span>
            <div>
              <strong>Las 4 fuerzas tienen alcances distintos</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>EM y gravedad: infinito. Fuerte: ~1 fm (tamaño del núcleo). Débil: ~0,001 fm. El alcance es inverso a la masa del bosón mediador (W, Z son muy masivos).</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔭</span>
            <div>
              <strong>Colisionadores vs observatorios</strong>
              <p style={{margin:'0.25rem 0 0', fontSize:'0.875rem'}}>El LHC crea partículas. Los observatorios de neutrinos (IceCube, Super-K) detectan partículas de origen cósmico. Ambos enfoques son complementarios para explorar la física más allá del Modelo Estándar.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBoxEdu}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores Conceptuales Frecuentes
          </div>
          <ul className={styles.warningList}>
            <li><strong>El bosón de Higgs no es la «partícula de Dios»</strong> — Leon Lederman usó ese apelativo comercialmente. El nombre correcto es bosón de Higgs. No da masa a todas las partículas (los fotones, gluones y neutrinos son casos especiales).</li>
            <li><strong>Neutrino ≠ fotón</strong> — Ambos son eléctricamente neutros, pero el fotón es un bosón sin masa que viaja a c, mientras el neutrino es un fermión con masa ínfima que viaja casi a c. Interaccionan de formas completamente distintas.</li>
            <li><strong>Los quarks no existen aislados (confinamiento)</strong> — Nunca se ha observado un quark libre. Separar quarks cuesta tanta energía que se crean nuevos pares de quarks. No hay «partícula de quark» suelta en la naturaleza.</li>
            <li><strong>La antimateria no es ciencia ficción</strong> — Producimos antimateria en el LHC y en máquinas PET médicas a diario. El positrón (antielectrón) fue predicho por Dirac en 1928 y descubierto en rayos cósmicos en 1932.</li>
            <li><strong>El Modelo Estándar no incluye la gravedad</strong> — La Relatividad General describe la gravedad pero es incompatible con la mecánica cuántica. El gravitón (bosón de la gravedad) es hipotético y no forma parte del Modelo Estándar actual.</li>
          </ul>
        </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-particulas-subatomicas')} />
      <ShareCard appName="visualizador-particulas-subatomicas" />
      <Footer appName="visualizador-particulas-subatomicas" />
    </div>
  );
}
