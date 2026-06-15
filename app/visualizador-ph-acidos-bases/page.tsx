'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './PhAcidosBases.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'escala' | 'acidos-bases' | 'neutralizacion' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'escala', titulo: 'Escala de pH', icono: '🌈', subtitulo: 'Colores 0-14' },
  { id: 'acidos-bases', titulo: 'Ácidos y Bases', icono: '⚗️', subtitulo: 'H⁺ y OH⁻' },
  { id: 'neutralizacion', titulo: 'Neutralización', icono: '🧪', subtitulo: 'Ácido + Base' },
  { id: 'datos', titulo: 'Datos y Curiosidades', icono: '🔬', subtitulo: 'Lo que no sabías' },
];

// ─────────────────────────────────────────────
// Sustancias con pH
// ─────────────────────────────────────────────

interface Sustancia {
  nombre: string;
  ph: number;
  icono: string;
  descripcion: string;
  color: string;
}

const SUSTANCIAS: Sustancia[] = [
  { nombre: 'Ácido de batería', ph: 0.5, icono: '🔋', descripcion: 'Ácido sulfúrico concentrado. Extremadamente corrosivo.', color: '#FF0000' },
  { nombre: 'Ácido gástrico', ph: 1.5, icono: '🫁', descripcion: 'El estómago produce HCl para digerir alimentos.', color: '#FF2200' },
  { nombre: 'Zumo de limón', ph: 2.0, icono: '🍋', descripcion: 'Ácido cítrico natural. Le da el sabor agrio.', color: '#FF4400' },
  { nombre: 'Vinagre', ph: 2.5, icono: '🫙', descripcion: 'Ácido acético al 5%. Usado en cocina y limpieza.', color: '#FF5500' },
  { nombre: 'Zumo de naranja', ph: 3.5, icono: '🍊', descripcion: 'Ácido cítrico y ascórbico (vitamina C).', color: '#FF8800' },
  { nombre: 'Tomate', ph: 4.2, icono: '🍅', descripcion: 'Ligeramente ácido. Base de muchas salsas.', color: '#FFAA00' },
  { nombre: 'Café solo', ph: 5.0, icono: '☕', descripcion: 'Contiene ácidos orgánicos que le dan su sabor.', color: '#CCBB00' },
  { nombre: 'Lluvia normal', ph: 5.6, icono: '🌧️', descripcion: 'CO₂ atmosférico disuelto la hace ligeramente ácida.', color: '#AACC00' },
  { nombre: 'Leche', ph: 6.5, icono: '🥛', descripcion: 'Ligeramente ácida por el ácido láctico.', color: '#66CC44' },
  { nombre: 'Agua pura', ph: 7.0, icono: '💧', descripcion: 'Neutra: misma concentración de H⁺ y OH⁻.', color: '#33BB66' },
  { nombre: 'Sangre humana', ph: 7.4, icono: '🩸', descripcion: 'Rango vital: 7,35-7,45. Fuera de ahí es peligroso.', color: '#22AA88' },
  { nombre: 'Agua de mar', ph: 8.1, icono: '🌊', descripcion: 'Ligeramente básica por sales minerales disueltas.', color: '#2299AA' },
  { nombre: 'Bicarbonato', ph: 8.3, icono: '🧂', descripcion: 'NaHCO₃. Antiácido natural y agente de limpieza.', color: '#2288BB' },
  { nombre: 'Jabón de manos', ph: 10.0, icono: '🧴', descripcion: 'Básico para disolver grasa. Tacto resbaladizo.', color: '#4466CC' },
  { nombre: 'Amoniaco casero', ph: 11.5, icono: '🧹', descripcion: 'Limpiador potente. Nunca mezclar con lejía.', color: '#5544DD' },
  { nombre: 'Lejía (hipoclorito)', ph: 12.5, icono: '🫧', descripcion: 'NaClO. Desinfectante y blanqueador. Corrosivo.', color: '#7733DD' },
  { nombre: 'Sosa cáustica', ph: 14.0, icono: '⚠️', descripcion: 'NaOH puro. Extremadamente corrosiva. Uso industrial.', color: '#9922CC' },
];

function obtenerColorPh(ph: number): string {
  if (ph <= 1) return '#FF0000';
  if (ph <= 2) return '#FF3300';
  if (ph <= 3) return '#FF6600';
  if (ph <= 4) return '#FF9900';
  if (ph <= 5) return '#CCBB00';
  if (ph <= 6) return '#88CC22';
  if (ph <= 7) return '#33BB66';
  if (ph <= 8) return '#22AA88';
  if (ph <= 9) return '#2299AA';
  if (ph <= 10) return '#3377CC';
  if (ph <= 11) return '#5555DD';
  if (ph <= 12) return '#7733DD';
  if (ph <= 13) return '#9922CC';
  return '#AA11BB';
}

function obtenerTipoPh(ph: number): string {
  if (ph < 3) return 'Ácido fuerte';
  if (ph < 6) return 'Ácido débil';
  if (ph < 6.5) return 'Ligeramente ácido';
  if (ph <= 7.5) return 'Neutro';
  if (ph <= 8.5) return 'Ligeramente básico';
  if (ph < 11) return 'Base débil';
  return 'Base fuerte';
}

// ─────────────────────────────────────────────
// Ácidos y bases: datos
// ─────────────────────────────────────────────

interface AcidoBase {
  nombre: string;
  formula: string;
  tipo: 'acido-fuerte' | 'acido-debil' | 'base-fuerte' | 'base-debil';
  icono: string;
  uso: string;
}

const ACIDOS_BASES: AcidoBase[] = [
  { nombre: 'Ácido clorhídrico', formula: 'HCl', tipo: 'acido-fuerte', icono: '🧪', uso: 'Estómago, limpieza industrial' },
  { nombre: 'Ácido sulfúrico', formula: 'H₂SO₄', tipo: 'acido-fuerte', icono: '🔋', uso: 'Baterías, industria' },
  { nombre: 'Ácido nítrico', formula: 'HNO₃', tipo: 'acido-fuerte', icono: '💥', uso: 'Fertilizantes, explosivos' },
  { nombre: 'Ácido acético', formula: 'CH₃COOH', tipo: 'acido-debil', icono: '🫙', uso: 'Vinagre (5% en agua)' },
  { nombre: 'Ácido cítrico', formula: 'C₆H₈O₇', tipo: 'acido-debil', icono: '🍋', uso: 'Cítricos, conservante E330' },
  { nombre: 'Ácido carbónico', formula: 'H₂CO₃', tipo: 'acido-debil', icono: '🥤', uso: 'Bebidas con gas' },
  { nombre: 'Hidróxido de sodio', formula: 'NaOH', tipo: 'base-fuerte', icono: '⚠️', uso: 'Jabón, desatascadores' },
  { nombre: 'Hidróxido de potasio', formula: 'KOH', tipo: 'base-fuerte', icono: '🧴', uso: 'Jabón líquido, pilas' },
  { nombre: 'Hidróxido de calcio', formula: 'Ca(OH)₂', tipo: 'base-fuerte', icono: '🏗️', uso: 'Cal apagada, construcción' },
  { nombre: 'Amoníaco', formula: 'NH₃', tipo: 'base-debil', icono: '🧹', uso: 'Limpieza, fertilizantes' },
  { nombre: 'Bicarbonato de sodio', formula: 'NaHCO₃', tipo: 'base-debil', icono: '🧂', uso: 'Cocina, antiácido, limpieza' },
  { nombre: 'Carbonato de calcio', formula: 'CaCO₃', tipo: 'base-debil', icono: '🐚', uso: 'Tiza, conchas, antiácido' },
];

interface PropiedadComparativa {
  propiedad: string;
  acidos: string;
  bases: string;
}

const PROPIEDADES: PropiedadComparativa[] = [
  { propiedad: 'Sabor', acidos: 'Agrio (limón, vinagre)', bases: 'Amargo (jabón)' },
  { propiedad: 'Tacto', acidos: 'Puede escocer o quemar', bases: 'Resbaladizo, jabonoso' },
  { propiedad: 'Protones H⁺', acidos: 'Los donan (liberan)', bases: 'Los aceptan (capturan)' },
  { propiedad: 'Con metales', acidos: 'Reaccionan (producen H₂)', bases: 'Generalmente no reaccionan' },
  { propiedad: 'Fenolftaleína', acidos: 'Incolora', bases: 'Rosa/fucsia' },
  { propiedad: 'Papel tornasol', acidos: 'Azul → Rojo', bases: 'Rojo → Azul' },
  { propiedad: 'pH', acidos: '< 7', bases: '> 7' },
];

// ─────────────────────────────────────────────
// Neutralización: datos
// ─────────────────────────────────────────────

interface EjemploNeutralizacion {
  titulo: string;
  icono: string;
  acido: string;
  base: string;
  resultado: string;
  descripcion: string;
}

const EJEMPLOS_NEUTRALIZACION: EjemploNeutralizacion[] = [
  {
    titulo: 'Vinagre + Bicarbonato',
    icono: '🫧',
    acido: 'CH₃COOH (ácido acético)',
    base: 'NaHCO₃ (bicarbonato)',
    resultado: 'Acetato de sodio + CO₂ + H₂O',
    descripcion: 'La efervescencia que ves es CO₂ escapando. Experimento clásico del volcán casero.',
  },
  {
    titulo: 'Antiácido estomacal',
    icono: '💊',
    acido: 'HCl (ácido gástrico)',
    base: 'Mg(OH)₂ o Al(OH)₃',
    resultado: 'Sales + H₂O',
    descripcion: 'Los antiácidos neutralizan el exceso de ácido del estómago, aliviando la acidez.',
  },
  {
    titulo: 'Cal para suelos ácidos',
    icono: '🌱',
    acido: 'Suelo ácido (pH < 6)',
    base: 'CaCO₃ (cal agrícola)',
    resultado: 'Suelo con pH neutro',
    descripcion: 'Agricultores añaden cal para subir el pH del suelo y mejorar la absorción de nutrientes.',
  },
  {
    titulo: 'Tratamiento de aguas',
    icono: '🚰',
    acido: 'Agua ácida industrial',
    base: 'NaOH o Ca(OH)₂',
    resultado: 'Agua con pH seguro',
    descripcion: 'Las depuradoras ajustan el pH del agua antes de verterla al medio ambiente.',
  },
];

interface IndicadorNatural {
  nombre: string;
  icono: string;
  enAcido: string;
  neutro: string;
  enBase: string;
  colorAcido: string;
  colorNeutro: string;
  colorBase: string;
}

const INDICADORES: IndicadorNatural[] = [
  { nombre: 'Col lombarda', icono: '🥬', enAcido: 'Rosa/Rojo', neutro: 'Violeta', enBase: 'Verde/Amarillo', colorAcido: '#CC3366', colorNeutro: '#8844AA', colorBase: '#66AA33' },
  { nombre: 'Cúrcuma', icono: '🟡', enAcido: 'Amarillo', neutro: 'Amarillo', enBase: 'Rojo/Marrón', colorAcido: '#DDAA00', colorNeutro: '#DDAA00', colorBase: '#AA3322' },
  { nombre: 'Pétalos de rosa', icono: '🌹', enAcido: 'Rojo intenso', neutro: 'Rosa', enBase: 'Verde', colorAcido: '#CC2244', colorNeutro: '#DD7799', colorBase: '#558833' },
  { nombre: 'Té negro', icono: '🍵', enAcido: 'Marrón claro', neutro: 'Marrón', enBase: 'Oscuro/Negro', colorAcido: '#BB8844', colorNeutro: '#885533', colorBase: '#332211' },
];

// ─────────────────────────────────────────────
// Curiosidades
// ─────────────────────────────────────────────

interface Curiosidad {
  icono: string;
  titulo: string;
  texto: string;
  destacado?: string;
}

const CURIOSIDADES: Curiosidad[] = [
  { icono: '🌧️', titulo: 'Lluvia ácida', texto: 'La lluvia normal ya es ligeramente ácida (pH 5,6) por el CO₂ atmosférico. Se habla de lluvia ácida cuando el pH baja de 5,6, por contaminantes como SO₂ y NOₓ de fábricas y coches.', destacado: 'pH < 5,6' },
  { icono: '🫁', titulo: 'pH del estómago', texto: 'Tu estómago produce ácido clorhídrico con pH entre 1,5 y 3,5. Es tan corrosivo que disolvería un clavo de hierro, pero el moco gástrico protege las paredes del estómago.', destacado: 'pH 1,5 - 3,5' },
  { icono: '🩸', titulo: 'Sangre: rango vital', texto: 'El pH de tu sangre se mantiene entre 7,35 y 7,45. Si baja de 7,0 (acidosis) o sube de 7,8 (alcalosis) puede ser mortal. Tu cuerpo tiene sistemas tampón que lo regulan constantemente.', destacado: '7,35 - 7,45' },
  { icono: '🌊', titulo: 'Océanos acidificándose', texto: 'Desde la Revolución Industrial, los océanos han absorbido un 30% del CO₂ emitido por humanos. El pH ha bajado de 8,2 a 8,1. Parece poco, pero al ser logarítmica, es un 26% más de acidez, amenazando corales y moluscos.', destacado: '8,2 → 8,1 = +26% acidez' },
  { icono: '📐', titulo: 'Escala logarítmica', texto: 'La escala de pH es logarítmica en base 10: un pH de 3 es 10 veces más ácido que un pH de 4, y 100 veces más ácido que un pH de 5. El zumo de limón (pH 2) es 100.000 veces más ácido que el agua pura (pH 7).', destacado: '10x por cada unidad' },
  { icono: '🏊', titulo: 'pH de piscinas', texto: 'El pH ideal de una piscina es 7,2-7,6. Demasiado bajo irrita los ojos y la piel. Demasiado alto reduce la efectividad del cloro. Se ajusta con ácido muriático (baja pH) o carbonato de sodio (sube pH).', destacado: 'pH 7,2 - 7,6' },
  { icono: '🧴', titulo: '¿Por qué el jabón es básico?', texto: 'El jabón se fabrica mezclando grasa con una base fuerte (NaOH). El resultado es una sal de ácido graso con pH 9-10. Las partes hidrofóbicas capturan la grasa y las hidrofílicas se disuelven en agua.', destacado: 'pH 9 - 10' },
  { icono: '🦷', titulo: 'Tus dientes y el pH', texto: 'El esmalte dental empieza a disolverse por debajo de pH 5,5. Las bebidas carbonatadas (pH 2,5-3,5) y los zumos de fruta atacan el esmalte. Esperar 30 minutos antes de cepillarse permite que la saliva neutralice el ácido.', destacado: 'pH < 5,5 = peligro' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorPhAcidosBases() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('escala');
  const [phSlider, setPhSlider] = useState(7);
  const [acidoBaseTab, setAcidoBaseTab] = useState<'acidos' | 'bases'>('acidos');
  const [neutralizacionActiva, setNeutralizacionActiva] = useState(0);

  // Sustancias cercanas al pH del slider
  const sustanciasCercanas = SUSTANCIAS.filter(
    s => Math.abs(s.ph - phSlider) <= 1.5
  ).sort((a, b) => Math.abs(a.ph - phSlider) - Math.abs(b.ph - phSlider));

  const colorActual = obtenerColorPh(phSlider);
  const tipoPh = obtenerTipoPh(phSlider);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🧪 pH: Ácidos y Bases</h1>
          <p className={styles.subtitle}>La escala que mide la química de todo lo que te rodea</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* ═══════════════════════════════════════ */}
        {/* SECCIÓN 1: ESCALA DE PH */}
        {/* ═══════════════════════════════════════ */}
        {seccionActiva === 'escala' && (
          <section className={styles.seccionContent}>
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Escala de pH: del 0 al 14</h2>
              <p className={styles.seccionSubtitulo}>Mueve el slider para explorar sustancias cotidianas</p>
            </div>

            {/* Barra de pH con gradient */}
            <div className={styles.phBarContainer}>
              <div className={styles.phBar}>
                <div className={styles.phBarLabels}>
                  <span>0</span>
                  <span>7</span>
                  <span>14</span>
                </div>
                <div className={styles.phBarGradient}>
                  <div
                    className={styles.phBarMarker}
                    style={{ left: `${(phSlider / 14) * 100}%` }}
                  >
                    <span className={styles.phBarMarkerValue}>{phSlider.toFixed(1)}</span>
                  </div>
                </div>
                <div className={styles.phBarZones}>
                  <span className={styles.phZoneAcido}>Ácido</span>
                  <span className={styles.phZoneNeutro}>Neutro</span>
                  <span className={styles.phZoneBase}>Base</span>
                </div>
              </div>

              <div className={styles.sliderContainer}>
                <input
                  type="range"
                  min="0"
                  max="14"
                  step="0.1"
                  value={phSlider}
                  onChange={e => setPhSlider(parseFloat(e.target.value))}
                  className={styles.phSlider}
                  aria-label="Valor de pH"
                  style={{ '--thumb-color': colorActual } as React.CSSProperties}
                />
              </div>

              {/* Info del pH actual */}
              <div className={styles.phInfoBox} style={{ borderColor: colorActual }}>
                <div className={styles.phInfoHeader}>
                  <span className={styles.phInfoValue} style={{ color: colorActual }}>
                    pH {phSlider.toFixed(1)}
                  </span>
                  <span className={styles.phInfoTipo}>{tipoPh}</span>
                </div>
                <p className={styles.phInfoConcentracion}>
                  Concentración H⁺: 10⁻{phSlider.toFixed(1)} mol/L
                </p>
              </div>
            </div>

            {/* Sustancias cercanas */}
            <h3 className={styles.subtituloSeccion}>
              Sustancias cercanas a pH {phSlider.toFixed(1)}
            </h3>
            {sustanciasCercanas.length > 0 ? (
              <div className={styles.sustanciasGrid}>
                {sustanciasCercanas.map(s => (
                  <div
                    key={s.nombre}
                    className={styles.sustanciaCard}
                    style={{ borderLeftColor: s.color }}
                  >
                    <div className={styles.sustanciaHeader}>
                      <span className={styles.sustanciaIcono} aria-hidden="true">{s.icono}</span>
                      <div>
                        <span className={styles.sustanciaNombre}>{s.nombre}</span>
                        <span className={styles.sustanciaPh} style={{ color: s.color }}>
                          pH {s.ph.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className={styles.sustanciaDesc}>{s.descripcion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noResultados}>
                No hay sustancias comunes registradas cerca de pH {phSlider.toFixed(1)}
              </p>
            )}

            {/* Todas las sustancias en miniatura */}
            <h3 className={styles.subtituloSeccion}>Mapa completo de sustancias</h3>
            <div className={styles.mapaCompleto}>
              {SUSTANCIAS.map(s => (
                <button
                  key={s.nombre}
                  className={styles.mapaPunto}
                  style={{
                    left: `${(s.ph / 14) * 100}%`,
                    backgroundColor: s.color,
                  }}
                  onClick={() => setPhSlider(s.ph)}
                  title={`${s.nombre} (pH ${s.ph})`}
                  aria-label={`${s.nombre}, pH ${s.ph}`}
                >
                  <span className={styles.mapaPuntoLabel}>{s.icono}</span>
                </button>
              ))}
              <div className={styles.mapaGradient} />
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* SECCIÓN 2: ÁCIDOS Y BASES */}
        {/* ═══════════════════════════════════════ */}
        {seccionActiva === 'acidos-bases' && (
          <section className={styles.seccionContent}>
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Ácidos y Bases</h2>
              <p className={styles.seccionSubtitulo}>Donantes y aceptores de protones (H⁺)</p>
            </div>

            {/* Explicación principal */}
            <div className={styles.conceptoGrid}>
              <div className={styles.conceptoCard} style={{ borderTopColor: '#FF4444' }}>
                <h3 className={styles.conceptoTitulo}>
                  <span aria-hidden="true">🔴</span> Ácidos
                </h3>
                <p className={styles.conceptoTexto}>
                  <strong>Donan protones (H⁺)</strong> al disolverse en agua. Cuantos más H⁺ liberan,
                  más fuerte es el ácido y menor es su pH.
                </p>
                <div className={styles.conceptoFormula}>
                  HCl → H⁺ + Cl⁻
                </div>
              </div>
              <div className={styles.conceptoCard} style={{ borderTopColor: '#4444FF' }}>
                <h3 className={styles.conceptoTitulo}>
                  <span aria-hidden="true">🔵</span> Bases
                </h3>
                <p className={styles.conceptoTexto}>
                  <strong>Aceptan protones (H⁺)</strong> o liberan iones hidróxido (OH⁻).
                  Cuantos más OH⁻ producen, más fuerte es la base y mayor su pH.
                </p>
                <div className={styles.conceptoFormula}>
                  NaOH → Na⁺ + OH⁻
                </div>
              </div>
            </div>

            {/* Tabs ácidos / bases */}
            <div className={styles.tabSelector}>
              <button
                className={`${styles.tabBtn} ${acidoBaseTab === 'acidos' ? styles.tabActivo : ''}`}
                onClick={() => setAcidoBaseTab('acidos')}
                style={acidoBaseTab === 'acidos' ? { borderColor: '#FF4444', color: '#FF4444' } : {}}
              >
                Ácidos (fuertes y débiles)
              </button>
              <button
                className={`${styles.tabBtn} ${acidoBaseTab === 'bases' ? styles.tabActivo : ''}`}
                onClick={() => setAcidoBaseTab('bases')}
                style={acidoBaseTab === 'bases' ? { borderColor: '#4444FF', color: '#4444FF' } : {}}
              >
                Bases (fuertes y débiles)
              </button>
            </div>

            <div className={styles.acidoBaseLista}>
              {ACIDOS_BASES
                .filter(ab => acidoBaseTab === 'acidos'
                  ? ab.tipo.startsWith('acido')
                  : ab.tipo.startsWith('base'))
                .map(ab => (
                  <div
                    key={ab.nombre}
                    className={styles.acidoBaseCard}
                    style={{
                      borderLeftColor: ab.tipo.includes('fuerte')
                        ? (ab.tipo.startsWith('acido') ? '#FF2222' : '#2222FF')
                        : (ab.tipo.startsWith('acido') ? '#FF8888' : '#8888FF'),
                    }}
                  >
                    <div className={styles.acidoBaseHeader}>
                      <span aria-hidden="true">{ab.icono}</span>
                      <div>
                        <span className={styles.acidoBaseNombre}>{ab.nombre}</span>
                        <span className={styles.acidoBaseFormula}>{ab.formula}</span>
                      </div>
                      <span className={`${styles.acidoBaseBadge} ${ab.tipo.includes('fuerte') ? styles.badgeFuerte : styles.badgeDebil}`}>
                        {ab.tipo.includes('fuerte') ? 'Fuerte' : 'Débil'}
                      </span>
                    </div>
                    <p className={styles.acidoBaseUso}>{ab.uso}</p>
                  </div>
                ))}
            </div>

            {/* Diferencia fuerte/débil */}
            <div className={styles.insightBox}>
              <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>💡</span>
              <div>
                <p>
                  <strong>Fuerte vs. Débil:</strong> Un ácido/base <em>fuerte</em> se disocia completamente
                  en agua (100% de moléculas liberan H⁺ u OH⁻). Uno <em>débil</em> solo se disocia parcialmente.
                  El vinagre (ácido débil) tiene muchas moléculas de ácido acético sin disociar.
                </p>
              </div>
            </div>

            {/* Tabla comparativa */}
            <h3 className={styles.subtituloSeccion}>Tabla comparativa</h3>
            <div className={styles.tablaContainer}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Propiedad</th>
                    <th style={{ color: '#CC3333' }}>Ácidos</th>
                    <th style={{ color: '#3333CC' }}>Bases</th>
                  </tr>
                </thead>
                <tbody>
                  {PROPIEDADES.map(p => (
                    <tr key={p.propiedad}>
                      <td><strong>{p.propiedad}</strong></td>
                      <td>{p.acidos}</td>
                      <td>{p.bases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* SECCIÓN 3: NEUTRALIZACIÓN */}
        {/* ═══════════════════════════════════════ */}
        {seccionActiva === 'neutralizacion' && (
          <section className={styles.seccionContent}>
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Neutralización</h2>
              <p className={styles.seccionSubtitulo}>Ácido + Base = Sal + Agua</p>
            </div>

            {/* Reacción general */}
            <div className={styles.reaccionGeneral}>
              <div className={styles.reaccionParte} style={{ background: 'rgba(255,68,68,0.1)', borderColor: 'rgba(255,68,68,0.3)' }}>
                <span className={styles.reaccionLabel}>Ácido</span>
                <span className={styles.reaccionFormula}>H⁺</span>
              </div>
              <span className={styles.reaccionOperador}>+</span>
              <div className={styles.reaccionParte} style={{ background: 'rgba(68,68,255,0.1)', borderColor: 'rgba(68,68,255,0.3)' }}>
                <span className={styles.reaccionLabel}>Base</span>
                <span className={styles.reaccionFormula}>OH⁻</span>
              </div>
              <span className={styles.reaccionOperador}>→</span>
              <div className={styles.reaccionParte} style={{ background: 'rgba(46,134,171,0.1)', borderColor: 'rgba(46,134,171,0.3)' }}>
                <span className={styles.reaccionLabel}>Productos</span>
                <span className={styles.reaccionFormula}>Sal + H₂O</span>
              </div>
            </div>

            {/* Ejemplos */}
            <h3 className={styles.subtituloSeccion}>Ejemplos cotidianos</h3>
            <div className={styles.neutralizacionGrid}>
              {EJEMPLOS_NEUTRALIZACION.map((ej, i) => (
                <button
                  key={ej.titulo}
                  className={`${styles.neutralizacionCard} ${neutralizacionActiva === i ? styles.neutralizacionActiva : ''}`}
                  onClick={() => setNeutralizacionActiva(i)}
                >
                  <span className={styles.neutralizacionIcono} aria-hidden="true">{ej.icono}</span>
                  <span className={styles.neutralizacionTitulo}>{ej.titulo}</span>
                </button>
              ))}
            </div>

            {/* Detalle del ejemplo seleccionado */}
            <div className={styles.neutralizacionDetalle}>
              <h4>{EJEMPLOS_NEUTRALIZACION[neutralizacionActiva].titulo}</h4>
              <div className={styles.neutralizacionReaccion}>
                <span className={styles.neutralizacionAcido}>
                  {EJEMPLOS_NEUTRALIZACION[neutralizacionActiva].acido}
                </span>
                <span className={styles.reaccionOperador}>+</span>
                <span className={styles.neutralizacionBase}>
                  {EJEMPLOS_NEUTRALIZACION[neutralizacionActiva].base}
                </span>
                <span className={styles.reaccionOperador}>→</span>
                <span className={styles.neutralizacionResultado}>
                  {EJEMPLOS_NEUTRALIZACION[neutralizacionActiva].resultado}
                </span>
              </div>
              <p className={styles.neutralizacionDescripcion}>
                {EJEMPLOS_NEUTRALIZACION[neutralizacionActiva].descripcion}
              </p>
            </div>

            {/* Indicadores naturales */}
            <h3 className={styles.subtituloSeccion}>Indicadores naturales de pH</h3>
            <p className={styles.seccionSubtitulo} style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Sustancias que cambian de color según el pH de la disolución
            </p>
            <div className={styles.indicadoresGrid}>
              {INDICADORES.map(ind => (
                <div key={ind.nombre} className={styles.indicadorCard}>
                  <div className={styles.indicadorHeader}>
                    <span aria-hidden="true">{ind.icono}</span>
                    <strong>{ind.nombre}</strong>
                  </div>
                  <div className={styles.indicadorColores}>
                    <div className={styles.indicadorColor}>
                      <div className={styles.indicadorMuestra} style={{ background: ind.colorAcido }} />
                      <span>Ácido</span>
                      <small>{ind.enAcido}</small>
                    </div>
                    <div className={styles.indicadorColor}>
                      <div className={styles.indicadorMuestra} style={{ background: ind.colorNeutro }} />
                      <span>Neutro</span>
                      <small>{ind.neutro}</small>
                    </div>
                    <div className={styles.indicadorColor}>
                      <div className={styles.indicadorMuestra} style={{ background: ind.colorBase }} />
                      <span>Base</span>
                      <small>{ind.enBase}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* SECCIÓN 4: DATOS Y CURIOSIDADES */}
        {/* ═══════════════════════════════════════ */}
        {seccionActiva === 'datos' && (
          <section className={styles.seccionContent}>
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Datos y Curiosidades</h2>
              <p className={styles.seccionSubtitulo}>Lo que quizá no sabías sobre el pH</p>
            </div>

            <div className={styles.curiosidadesGrid}>
              {CURIOSIDADES.map(c => (
                <div key={c.titulo} className={styles.curiosidadCard}>
                  <div className={styles.curiosidadHeader}>
                    <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
                    <h3 className={styles.curiosidadTitulo}>{c.titulo}</h3>
                  </div>
                  {c.destacado && (
                    <span className={styles.curiosidadDestacado}>{c.destacado}</span>
                  )}
                  <p className={styles.curiosidadTexto}>{c.texto}</p>
                </div>
              ))}
            </div>

            {/* Escala logarítmica visual */}
            <h3 className={styles.subtituloSeccion}>La escala logarítmica en acción</h3>
            <div className={styles.logGrid}>
              {[
                { ph: 1, factor: '1.000.000x', label: 'vs pH 7' },
                { ph: 2, factor: '100.000x', label: 'vs pH 7' },
                { ph: 3, factor: '10.000x', label: 'vs pH 7' },
                { ph: 4, factor: '1.000x', label: 'vs pH 7' },
                { ph: 5, factor: '100x', label: 'vs pH 7' },
                { ph: 6, factor: '10x', label: 'vs pH 7' },
                { ph: 7, factor: '1x', label: 'Referencia' },
              ].map(item => (
                <div key={item.ph} className={styles.logItem}>
                  <span className={styles.logPh} style={{ color: obtenerColorPh(item.ph) }}>
                    pH {item.ph}
                  </span>
                  <span className={styles.logFactor}>{item.factor}</span>
                  <span className={styles.logLabel}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className={styles.insightBox}>
              <span aria-hidden="true" style={{ fontSize: '1.5rem' }}>📐</span>
              <div>
                <p>
                  Cada unidad de pH representa una diferencia de <strong>10 veces</strong> en
                  concentración de iones H⁺. Por eso un zumo de limón (pH 2) es
                  <strong> 100.000 veces</strong> más ácido que el agua pura (pH 7).
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 ¿Quieres aprender más?"
          subtitle="Profundiza en la química del pH"
        >
          <section className={styles.guideSection}>
            <h2>La historia del pH</h2>
            <p>
              El concepto de pH fue introducido en 1909 por el bioquímico danés
              Søren Peter Lauritz Sørensen mientras trabajaba en el laboratorio Carlsberg
              (sí, la cervecería). Necesitaba una forma sencilla de expresar la acidez
              de las soluciones para controlar la calidad de la cerveza.
            </p>
            <p>
              Las letras &quot;pH&quot; significan &quot;potencial de hidrógeno&quot; (<em>potentia hydrogenii</em> en latín).
              Matemáticamente, pH = -log₁₀[H⁺], donde [H⁺] es la concentración molar de iones hidrógeno.
            </p>

            <h2>Ácidos y bases en tu cuerpo</h2>
            <p>
              Tu cuerpo mantiene diferentes pH en diferentes zonas: el estómago (pH 1,5-3,5)
              para digerir alimentos, la piel (pH 4,5-5,5) como barrera antimicrobiana,
              la sangre (pH 7,35-7,45) para el transporte de oxígeno, y el intestino
              delgado (pH 7,5-8) para absorber nutrientes.
            </p>
            <p>
              El sistema tampón bicarbonato/ácido carbónico (HCO₃⁻/H₂CO₃) es el principal
              regulador del pH sanguíneo. Los riñones y los pulmones colaboran ajustando
              la eliminación de CO₂ y bicarbonato.
            </p>

            <div className={styles.warningBox}>
              <span aria-hidden="true">⚠️</span>
              <div>
                <strong>Peligro real: nunca mezcles productos de limpieza</strong>
                <p>
                  Mezclar lejía (hipoclorito de sodio) con amoniaco produce cloraminas gaseosas,
                  tóxicas e incluso letales en espacios cerrados. Lejía con ácidos (vinagre,
                  salfumán) libera cloro gas. Cada año se producen intoxicaciones graves por
                  estas mezclas accidentales en el hogar.
                </p>
              </div>
            </div>

            <h2>pH y medio ambiente</h2>
            <p>
              La lluvia ácida (pH &lt; 5,6) se forma cuando el SO₂ y NOₓ de la combustión
              de combustibles fósiles reaccionan con el agua atmosférica produciendo ácido
              sulfúrico y ácido nítrico. Daña bosques, acidifica lagos y corroe edificios
              de piedra caliza y monumentos históricos.
            </p>
            <p>
              La acidificación oceánica es una amenaza silenciosa: el CO₂ absorbido por el
              mar forma ácido carbónico, dificultando que corales, moluscos y plancton
              calcificador formen sus conchas y esqueletos de carbonato de calcio.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-ph-acidos-bases')} />
        <ShareCard appName="visualizador-ph-acidos-bases" />
        <Footer appName="visualizador-ph-acidos-bases" />
    </div>
  );
}
