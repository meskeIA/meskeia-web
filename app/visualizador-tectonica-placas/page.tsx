'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './TectonicaPlacas.module.css';
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
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'placas' | 'bordes' | 'terremotos' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'placas', titulo: 'Las Placas', icono: '🌍', subtitulo: 'Las piezas del rompecabezas terrestre' },
  { id: 'bordes', titulo: 'Tipos de Bordes', icono: '🔀', subtitulo: 'Dónde chocan, se separan o deslizan' },
  { id: 'terremotos', titulo: 'Terremotos y Volcanes', icono: '🌋', subtitulo: 'La energía del interior de la Tierra' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '💎', subtitulo: 'Curiosidades del planeta dinámico' },
];

// ─────────────────────────────────────────────
// Datos: Placas
// ─────────────────────────────────────────────

interface PlacaInfo {
  nombre: string;
  superficie: number; // millones km²
  velocidad: string; // cm/año
  direccion: string;
  color: string;
  tipo: 'principal' | 'secundaria';
}

const PLACAS: PlacaInfo[] = [
  { nombre: 'Pacífica', superficie: 103.3, velocidad: '6-10', direccion: 'Noroeste', color: '#2563EB', tipo: 'principal' },
  { nombre: 'Norteamericana', superficie: 75.9, velocidad: '2-3', direccion: 'Suroeste', color: '#DC2626', tipo: 'principal' },
  { nombre: 'Euroasiática', superficie: 67.8, velocidad: '1-2', direccion: 'Este', color: '#16A34A', tipo: 'principal' },
  { nombre: 'Africana', superficie: 61.3, velocidad: '2-3', direccion: 'Noreste', color: '#D97706', tipo: 'principal' },
  { nombre: 'Antártica', superficie: 60.9, velocidad: '1-2', direccion: 'Rotación variable', color: '#7C3AED', tipo: 'principal' },
  { nombre: 'Indoaustraliana', superficie: 58.9, velocidad: '5-7', direccion: 'Norte-Noreste', color: '#E11D48', tipo: 'principal' },
  { nombre: 'Sudamericana', superficie: 43.6, velocidad: '2-3', direccion: 'Oeste-Noroeste', color: '#0D9488', tipo: 'principal' },
  { nombre: 'Nazca', superficie: 15.6, velocidad: '7-8', direccion: 'Este', color: '#6366F1', tipo: 'secundaria' },
  { nombre: 'Filipinas', superficie: 5.5, velocidad: '6-8', direccion: 'Noroeste', color: '#F97316', tipo: 'secundaria' },
  { nombre: 'Cocos', superficie: 2.9, velocidad: '7-9', direccion: 'Noreste', color: '#84CC16', tipo: 'secundaria' },
  { nombre: 'Caribe', superficie: 3.3, velocidad: '1-2', direccion: 'Este', color: '#14B8A6', tipo: 'secundaria' },
  { nombre: 'Scotia', superficie: 1.6, velocidad: '1-2', direccion: 'Oeste', color: '#A855F7', tipo: 'secundaria' },
  { nombre: 'Arábiga', superficie: 5.0, velocidad: '3-4', direccion: 'Noreste', color: '#EAB308', tipo: 'secundaria' },
  { nombre: 'Juan de Fuca', superficie: 0.25, velocidad: '4-5', direccion: 'Este', color: '#EC4899', tipo: 'secundaria' },
  { nombre: 'India', superficie: 11.9, velocidad: '4-5', direccion: 'Norte', color: '#F43F5E', tipo: 'secundaria' },
];

// ─────────────────────────────────────────────
// Datos: Bordes
// ─────────────────────────────────────────────

interface BordeInfo {
  id: string;
  nombre: string;
  descripcion: string;
  proceso: string;
  ejemplos: string[];
  icono: string;
  color: string;
}

const BORDES: BordeInfo[] = [
  {
    id: 'divergente',
    nombre: 'Divergente',
    descripcion: 'Las placas se separan, el magma sube y forma nueva corteza.',
    proceso: 'El magma asciende por la fisura entre las placas, se enfría y forma nueva corteza oceánica. Este proceso crea dorsales oceánicas submarinas.',
    ejemplos: ['Dorsal Mesoatlántica', 'Rift del Este de África', 'Dorsal del Pacífico Oriental'],
    icono: '↔️',
    color: '#22C55E',
  },
  {
    id: 'convergente',
    nombre: 'Convergente',
    descripcion: 'Las placas chocan: una se hunde bajo la otra (subducción) o se pliegan formando montañas.',
    proceso: 'Cuando una placa oceánica choca con una continental, la oceánica (más densa) se hunde bajo la continental. Cuando chocan dos continentales, se pliegan formando cordilleras.',
    ejemplos: ['Himalaya (India vs Euroasia)', 'Fosa de las Marianas (Pacífica vs Filipinas)', 'Andes (Nazca vs Sudamericana)'],
    icono: '💥',
    color: '#EF4444',
  },
  {
    id: 'transformante',
    nombre: 'Transformante',
    descripcion: 'Las placas se deslizan lateralmente una junto a otra, generando tensión y terremotos.',
    proceso: 'No se crea ni se destruye corteza. La fricción acumula tensión que se libera de forma brusca como terremotos. Son los bordes más peligrosos para las ciudades cercanas.',
    ejemplos: ['Falla de San Andrés (California)', 'Falla Alpina (Nueva Zelanda)', 'Falla del Norte de Anatolia (Turquía)'],
    icono: '⚡',
    color: '#F59E0B',
  },
];

// ─────────────────────────────────────────────
// Datos: Escala Richter
// ─────────────────────────────────────────────

interface MagnitudInfo {
  magnitud: string;
  descripcion: string;
  efectos: string;
  energiaTNT: string;
  frecuencia: string;
  color: string;
}

const MAGNITUDES: MagnitudInfo[] = [
  { magnitud: '1-2', descripcion: 'Micro', efectos: 'Solo detectado por sismógrafos', energiaTNT: '~30 g de TNT', frecuencia: '~1.300.000/año', color: '#22C55E' },
  { magnitud: '3-4', descripcion: 'Menor', efectos: 'Se siente, objetos vibran', energiaTNT: '~480 kg de TNT', frecuencia: '~13.000/año', color: '#84CC16' },
  { magnitud: '5-6', descripcion: 'Moderado a fuerte', efectos: 'Daños moderados a graves en edificios', energiaTNT: '~15.000 t de TNT', frecuencia: '~1.300/año', color: '#F59E0B' },
  { magnitud: '7-7.9', descripcion: 'Mayor', efectos: 'Destructivo en amplias zonas', energiaTNT: '~480.000 t de TNT', frecuencia: '~15/año', color: '#F97316' },
  { magnitud: '8-8.9', descripcion: 'Gran terremoto', efectos: 'Destrucción total en zonas extensas', energiaTNT: '~15 millones t de TNT', frecuencia: '~1/año', color: '#EF4444' },
  { magnitud: '9+', descripcion: 'Catastrófico', efectos: 'Devastación a escala continental', energiaTNT: '~480 millones t de TNT', frecuencia: '~1 cada 20 años', color: '#991B1B' },
];

interface TerremotoFamoso {
  lugar: string;
  anio: number;
  magnitud: number;
  detalle: string;
}

const TERREMOTOS_FAMOSOS: TerremotoFamoso[] = [
  { lugar: 'Valdivia, Chile', anio: 1960, magnitud: 9.5, detalle: 'El más potente registrado. Tsunami cruzó el Pacífico hasta Japón.' },
  { lugar: 'Alaska, EE.UU.', anio: 1964, magnitud: 9.2, detalle: 'Provocó tsunamis de hasta 67 metros en algunas bahías.' },
  { lugar: 'Sumatra, Indonesia', anio: 2004, magnitud: 9.1, detalle: 'El tsunami causó ~230.000 víctimas en 14 países.' },
  { lugar: 'Tōhoku, Japón', anio: 2011, magnitud: 9.1, detalle: 'Tsunami de 40 m. Accidente nuclear de Fukushima.' },
  { lugar: 'Haití', anio: 2010, magnitud: 7.0, detalle: '~300.000 víctimas. Magnitud menor pero devastador por infraestructura precaria.' },
];

// ─────────────────────────────────────────────
// Datos: Curiosidades
// ─────────────────────────────────────────────

interface DatoCurioso {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_CURIOSOS: DatoCurioso[] = [
  { icono: '🌍', titulo: 'Pangea se fragmentó hace ~200 millones de años', descripcion: 'Todos los continentes estaban unidos en un supercontinente. La separación sigue en marcha.' },
  { icono: '🏔️', titulo: 'El Everest crece ~4 mm/año', descripcion: 'La colisión entre la placa India y la Euroasiática sigue elevando el Himalaya.' },
  { icono: '🌊', titulo: 'Fosa de las Marianas: 10.994 m', descripcion: 'El punto más profundo del océano, creado por subducción de la placa Pacífica.' },
  { icono: '🌋', titulo: '~1.500 volcanes activos', descripcion: 'Entre 50 y 70 erupcionan cada año. La mayoría están en el Cinturón de Fuego del Pacífico.' },
  { icono: '📏', titulo: 'Corteza: 5-70 km de espesor', descripcion: 'Como la piel de una manzana comparada con el resto del planeta.' },
  { icono: '🔥', titulo: 'Manto a 1.000-3.700 °C', descripcion: 'La roca del manto fluye lentamente como un líquido muy viscoso, moviendo las placas.' },
  { icono: '⏳', titulo: 'Pangea Última en ~250 Ma', descripcion: 'En 250 millones de años, los continentes volverán a unirse formando un nuevo supercontinente.' },
  { icono: '🧭', titulo: 'Islandia crece 2,5 cm/año', descripcion: 'Está justo sobre la Dorsal Mesoatlántica: se expande mientras América y Europa se alejan.' },
];

interface TimelineEvento {
  anio: string;
  autor: string;
  aporte: string;
}

const TIMELINE: TimelineEvento[] = [
  { anio: '1912', autor: 'Alfred Wegener', aporte: 'Propone la teoría de la deriva continental. Ridiculizado por sus colegas.' },
  { anio: '1960s', autor: 'Harry Hess', aporte: 'Descubre la expansión del fondo oceánico en las dorsales.' },
  { anio: '1965', autor: 'Tuzo Wilson', aporte: 'Introduce el concepto de fallas transformantes y placas tectónicas.' },
  { anio: '1968', autor: 'Comunidad científica', aporte: 'La tectónica de placas se acepta como paradigma unificador de la geología.' },
];

// ─────────────────────────────────────────────
// Sección 1: Las Placas
// ─────────────────────────────────────────────

function SeccionPlacas() {
  const [placaActiva, setPlacaActiva] = useState<number | null>(null);
  const principales = PLACAS.filter(p => p.tipo === 'principal');
  const secundarias = PLACAS.filter(p => p.tipo === 'secundaria');
  const maxSuperficie = Math.max(...PLACAS.map(p => p.superficie));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La superficie de la Tierra no es una capa sólida continua: está rota en <strong>15 grandes fragmentos</strong> (placas tectónicas) que flotan sobre el manto y se mueven lentamente.</p>
      </div>

      {/* Mapa simplificado SVG */}
      <div className={styles.mapaContainer}>
        <svg viewBox="0 0 800 400" className={styles.mapaSvg} aria-label="Mapa simplificado de placas tectónicas">
          {/* Fondo océano */}
          <rect x="0" y="0" width="800" height="400" fill="#1E3A5F" rx="8" />

          {/* Norteamericana */}
          <path
            d="M120,40 L280,30 L320,80 L300,160 L240,190 L180,180 L130,140 L100,100 Z"
            fill={principales[1].color}
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="1.5"
            className={styles.placaSvg}
            onClick={() => setPlacaActiva(placaActiva === 1 ? null : 1)}
            role="button"
            aria-label="Placa Norteamericana"
            tabIndex={0}
          />
          <text x="200" y="110" fill="white" fontSize="11" textAnchor="middle" className={styles.placaLabel} aria-hidden="true">N.América</text>
          {/* Flecha dirección */}
          <line x1="210" y1="130" x2="185" y2="145" stroke="white" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

          {/* Sudamericana */}
          <path
            d="M210,210 L270,195 L290,230 L280,310 L250,350 L220,340 L200,290 L195,250 Z"
            fill={principales[6].color}
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="1.5"
            className={styles.placaSvg}
            onClick={() => setPlacaActiva(placaActiva === 6 ? null : 6)}
            role="button"
            aria-label="Placa Sudamericana"
            tabIndex={0}
          />
          <text x="245" y="275" fill="white" fontSize="11" textAnchor="middle" className={styles.placaLabel} aria-hidden="true">S.América</text>
          <line x1="250" y1="290" x2="230" y2="280" stroke="white" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

          {/* Euroasiática */}
          <path
            d="M340,40 L560,30 L620,50 L650,100 L620,140 L500,150 L400,140 L340,110 Z"
            fill={principales[2].color}
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="1.5"
            className={styles.placaSvg}
            onClick={() => setPlacaActiva(placaActiva === 2 ? null : 2)}
            role="button"
            aria-label="Placa Euroasiática"
            tabIndex={0}
          />
          <text x="490" y="90" fill="white" fontSize="11" textAnchor="middle" className={styles.placaLabel} aria-hidden="true">Euroasiática</text>
          <line x1="500" y1="105" x2="520" y2="105" stroke="white" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

          {/* Africana */}
          <path
            d="M350,160 L430,150 L470,180 L460,290 L420,330 L370,310 L350,250 L340,200 Z"
            fill={principales[3].color}
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="1.5"
            className={styles.placaSvg}
            onClick={() => setPlacaActiva(placaActiva === 3 ? null : 3)}
            role="button"
            aria-label="Placa Africana"
            tabIndex={0}
          />
          <text x="405" y="240" fill="white" fontSize="11" textAnchor="middle" className={styles.placaLabel} aria-hidden="true">Africana</text>
          <line x1="410" y1="255" x2="425" y2="240" stroke="white" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

          {/* Indoaustraliana */}
          <path
            d="M520,170 L620,155 L690,180 L710,230 L680,270 L600,260 L540,240 L510,210 Z"
            fill={principales[5].color}
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="1.5"
            className={styles.placaSvg}
            onClick={() => setPlacaActiva(placaActiva === 5 ? null : 5)}
            role="button"
            aria-label="Placa Indoaustraliana"
            tabIndex={0}
          />
          <text x="610" y="215" fill="white" fontSize="11" textAnchor="middle" className={styles.placaLabel} aria-hidden="true">Indoaustr.</text>
          <line x1="615" y1="230" x2="625" y2="215" stroke="white" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

          {/* Pacífica */}
          <path
            d="M660,60 L780,50 L790,190 L770,300 L700,310 L660,270 L640,180 L650,100 Z"
            fill={principales[0].color}
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="1.5"
            className={styles.placaSvg}
            onClick={() => setPlacaActiva(placaActiva === 0 ? null : 0)}
            role="button"
            aria-label="Placa Pacífica"
            tabIndex={0}
          />
          <text x="720" y="175" fill="white" fontSize="11" textAnchor="middle" className={styles.placaLabel} aria-hidden="true">Pacífica</text>
          <line x1="730" y1="190" x2="710" y2="180" stroke="white" strokeWidth="1.5" markerEnd="url(#arrowhead)" />

          {/* Antártica */}
          <path
            d="M100,360 L350,355 L550,360 L700,365 L750,380 L400,390 L100,385 Z"
            fill={principales[4].color}
            fillOpacity="0.7"
            stroke="white"
            strokeWidth="1.5"
            className={styles.placaSvg}
            onClick={() => setPlacaActiva(placaActiva === 4 ? null : 4)}
            role="button"
            aria-label="Placa Antártica"
            tabIndex={0}
          />
          <text x="400" y="378" fill="white" fontSize="11" textAnchor="middle" className={styles.placaLabel} aria-hidden="true">Antártica</text>

          {/* Definición de flecha */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="white" />
            </marker>
          </defs>
        </svg>
        <p className={styles.mapaLeyenda}>Toca una placa en el mapa o en la tabla para ver sus datos</p>
      </div>

      {/* Detalle de placa seleccionada */}
      {placaActiva !== null && (
        <div className={styles.placaDetalle} role="region" aria-label={`Detalle de la placa ${PLACAS[placaActiva].nombre}`}>
          <div className={styles.placaDetalleHeader}>
            <span className={styles.placaColor} style={{ background: PLACAS[placaActiva].color }} />
            <h3 className={styles.placaDetalleNombre}>Placa {PLACAS[placaActiva].nombre}</h3>
            <span className={styles.placaTipo}>{PLACAS[placaActiva].tipo === 'principal' ? 'Principal' : 'Secundaria'}</span>
          </div>
          <div className={styles.placaStats}>
            <div className={styles.placaStat}>
              <span className={styles.placaStatLabel}>Superficie</span>
              <span className={styles.placaStatValor}>{formatNumber(PLACAS[placaActiva].superficie, 1)} M km²</span>
            </div>
            <div className={styles.placaStat}>
              <span className={styles.placaStatLabel}>Velocidad</span>
              <span className={styles.placaStatValor}>{PLACAS[placaActiva].velocidad} cm/año</span>
            </div>
            <div className={styles.placaStat}>
              <span className={styles.placaStatLabel}>Dirección</span>
              <span className={styles.placaStatValor}>{PLACAS[placaActiva].direccion}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla resumen */}
      <div className={styles.tablaContainer}>
        <h3 className={styles.tablaTitulo}>Las 7 placas principales</h3>
        <div className={styles.tablaLista}>
          {principales.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.tablaItem} ${placaActiva === PLACAS.indexOf(p) ? styles.tablaItemActivo : ''}`}
              onClick={() => setPlacaActiva(placaActiva === PLACAS.indexOf(p) ? null : PLACAS.indexOf(p))}
              aria-pressed={placaActiva === PLACAS.indexOf(p)}
            >
              <span className={styles.placaColor} style={{ background: p.color }} />
              <span className={styles.tablaNombre}>{p.nombre}</span>
              <div className={styles.tablaBarraContainer}>
                <div className={styles.tablaBarra} style={{ width: `${(p.superficie / maxSuperficie) * 100}%`, background: p.color }} />
              </div>
              <span className={styles.tablaSuperficie}>{formatNumber(p.superficie, 1)} M km²</span>
            </button>
          ))}
        </div>

        <h3 className={styles.tablaTitulo} style={{ marginTop: '1.5rem' }}>8 placas secundarias</h3>
        <div className={styles.tablaLista}>
          {secundarias.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.tablaItem} ${placaActiva === PLACAS.indexOf(p) ? styles.tablaItemActivo : ''}`}
              onClick={() => setPlacaActiva(placaActiva === PLACAS.indexOf(p) ? null : PLACAS.indexOf(p))}
              aria-pressed={placaActiva === PLACAS.indexOf(p)}
            >
              <span className={styles.placaColor} style={{ background: p.color }} />
              <span className={styles.tablaNombre}>{p.nombre}</span>
              <div className={styles.tablaBarraContainer}>
                <div className={styles.tablaBarra} style={{ width: `${(p.superficie / maxSuperficie) * 100}%`, background: p.color }} />
              </div>
              <span className={styles.tablaSuperficie}>{formatNumber(p.superficie, 1)} M km²</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Los continentes se mueven <strong>~2,5 cm/año</strong> — la velocidad a la que crecen tus uñas.
          Parece poco, pero en millones de años es suficiente para abrir océanos y levantar cordilleras.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Tipos de Bordes
// ─────────────────────────────────────────────

function DiagramaDivergente() {
  return (
    <svg viewBox="0 0 400 200" className={styles.diagramaSvg} aria-label="Diagrama de borde divergente: dos placas se separan">
      {/* Manto */}
      <rect x="0" y="100" width="400" height="100" fill="#C53030" opacity="0.3" />
      <text x="200" y="170" fill="#C53030" fontSize="12" textAnchor="middle" fontWeight="600">Manto (astenosfera)</text>

      {/* Placa izquierda */}
      <rect x="10" y="60" width="170" height="40" fill="#6B7280" rx="4" className={styles.placaAnimIzq} />
      <text x="95" y="85" fill="white" fontSize="11" textAnchor="middle">Placa A</text>

      {/* Placa derecha */}
      <rect x="220" y="60" width="170" height="40" fill="#6B7280" rx="4" className={styles.placaAnimDer} />
      <text x="305" y="85" fill="white" fontSize="11" textAnchor="middle">Placa B</text>

      {/* Magma ascendiendo */}
      <path d="M200,160 L185,100 L200,60 L215,100 Z" fill="#EF4444" opacity="0.7" />
      <text x="200" y="50" fill="#EF4444" fontSize="10" textAnchor="middle" fontWeight="600">Magma ↑</text>

      {/* Flechas dirección */}
      <line x1="140" y1="45" x2="60" y2="45" stroke="#22C55E" strokeWidth="2.5" markerEnd="url(#arrowGreen)" />
      <line x1="260" y1="45" x2="340" y2="45" stroke="#22C55E" strokeWidth="2.5" markerEnd="url(#arrowGreen)" />

      {/* Dorsal */}
      <text x="200" y="18" fill="#22C55E" fontSize="11" textAnchor="middle" fontWeight="700">DORSAL OCEÁNICA</text>

      <defs>
        <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#22C55E" />
        </marker>
      </defs>
    </svg>
  );
}

function DiagramaConvergente() {
  return (
    <svg viewBox="0 0 400 200" className={styles.diagramaSvg} aria-label="Diagrama de borde convergente: subducción">
      {/* Manto */}
      <rect x="0" y="110" width="400" height="90" fill="#C53030" opacity="0.3" />
      <text x="320" y="170" fill="#C53030" fontSize="12" textAnchor="middle" fontWeight="600">Manto</text>

      {/* Placa continental (arriba) */}
      <rect x="200" y="55" width="190" height="45" fill="#92400E" rx="4" />
      <text x="295" y="83" fill="white" fontSize="10" textAnchor="middle">Placa Continental</text>

      {/* Placa oceánica (se hunde) */}
      <path d="M10,65 L200,65 L200,100 L180,130 L150,170 L130,190 L10,100 Z" fill="#475569" />
      <text x="90" y="90" fill="white" fontSize="10" textAnchor="middle">Placa Oceánica</text>

      {/* Montañas / volcán */}
      <polygon points="240,55 260,20 280,55" fill="#78350F" />
      <polygon points="255,20 260,5 265,20" fill="#EF4444" opacity="0.6" />

      {/* Fosa */}
      <path d="M195,55 L200,75 L205,55" fill="#1E3A5F" />
      <text x="200" y="48" fill="#EF4444" fontSize="9" textAnchor="middle" fontWeight="600">Fosa</text>

      {/* Flechas */}
      <line x1="60" y1="50" x2="140" y2="50" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />
      <line x1="340" y1="42" x2="260" y2="42" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrowRed)" />

      <text x="200" y="18" fill="#EF4444" fontSize="11" textAnchor="middle" fontWeight="700">SUBDUCCIÓN</text>

      <defs>
        <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
        </marker>
      </defs>
    </svg>
  );
}

function DiagramaTransformante() {
  return (
    <svg viewBox="0 0 400 200" className={styles.diagramaSvg} aria-label="Diagrama de borde transformante: placas deslizan lateralmente">
      {/* Manto */}
      <rect x="0" y="120" width="400" height="80" fill="#C53030" opacity="0.3" />
      <text x="200" y="170" fill="#C53030" fontSize="12" textAnchor="middle" fontWeight="600">Manto</text>

      {/* Placa superior izquierda */}
      <rect x="10" y="40" width="185" height="70" fill="#6B7280" rx="4" className={styles.placaAnimArriba} />
      <text x="100" y="80" fill="white" fontSize="11" textAnchor="middle">Placa A</text>

      {/* Placa superior derecha */}
      <rect x="205" y="40" width="185" height="70" fill="#52525B" rx="4" className={styles.placaAnimAbajo} />
      <text x="300" y="80" fill="white" fontSize="11" textAnchor="middle">Placa B</text>

      {/* Línea de falla */}
      <line x1="198" y1="30" x2="198" y2="120" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6,3" />
      <text x="200" y="18" fill="#F59E0B" fontSize="11" textAnchor="middle" fontWeight="700">FALLA TRANSFORMANTE</text>

      {/* Flechas opuestas */}
      <line x1="140" y1="32" x2="60" y2="32" stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrowYellow)" />
      <line x1="260" y1="32" x2="340" y2="32" stroke="#F59E0B" strokeWidth="2.5" markerEnd="url(#arrowYellow)" />

      {/* Símbolo sismo */}
      <text x="198" y="135" fontSize="18" textAnchor="middle">⚡</text>

      <defs>
        <marker id="arrowYellow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
        </marker>
      </defs>
    </svg>
  );
}

function SeccionBordes() {
  const [bordeActivo, setBordeActivo] = useState(0);
  const borde = BORDES[bordeActivo];

  const renderDiagrama = () => {
    switch (bordeActivo) {
      case 0: return <DiagramaDivergente />;
      case 1: return <DiagramaConvergente />;
      case 2: return <DiagramaTransformante />;
      default: return null;
    }
  };

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los bordes entre placas son donde ocurre la acción geológica: <strong>terremotos, volcanes y montañas</strong> se concentran en estas zonas de contacto.</p>
      </div>

      {/* Selector de tipo */}
      <div className={styles.bordeSelector}>
        {BORDES.map((b, i) => (
          <button
            key={b.id}
            type="button"
            className={`${styles.bordeSelectorBtn} ${bordeActivo === i ? styles.bordeSelectorActivo : ''}`}
            style={bordeActivo === i ? { borderColor: b.color, color: b.color } : undefined}
            onClick={() => setBordeActivo(i)}
            aria-pressed={bordeActivo === i}
          >
            <span aria-hidden="true">{b.icono}</span>
            <span>{b.nombre}</span>
          </button>
        ))}
      </div>

      {/* Diagrama SVG */}
      <div className={styles.diagramaContainer}>
        {renderDiagrama()}
      </div>

      {/* Información del borde */}
      <div className={styles.bordeInfo} style={{ borderLeftColor: borde.color }}>
        <h3 className={styles.bordeInfoTitulo} style={{ color: borde.color }}>
          {borde.icono} Borde {borde.nombre}
        </h3>
        <p className={styles.bordeInfoDesc}>{borde.descripcion}</p>
        <p className={styles.bordeInfoProceso}>{borde.proceso}</p>
        <div className={styles.bordeEjemplos}>
          <span className={styles.bordeEjemplosLabel}>Ejemplos:</span>
          {borde.ejemplos.map((e, i) => (
            <span key={i} className={styles.bordeEjemploBadge} style={{ borderColor: borde.color }}>{e}</span>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El Himalaya crece <strong>~5 mm al año</strong> porque la placa India sigue empujando contra Euroasia.
          En 50 millones de años más, podría ser aún más alto — si la erosión no lo compensa.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Terremotos y Volcanes
// ─────────────────────────────────────────────

function SeccionTerremotos() {
  const [terremotoActivo, setTerremotoActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La energía del interior de la Tierra se libera como <strong>terremotos y erupciones volcánicas</strong>. La escala Richter es logarítmica: cada punto multiplica la energía por ~31,6.</p>
      </div>

      {/* Escala Richter visual */}
      <div className={styles.richterContainer}>
        <h3 className={styles.richterTitulo}>Escala Richter — Energía exponencial</h3>
        <div className={styles.richterGrid}>
          {MAGNITUDES.map((m, i) => {
            // Altura exponencial: base 3 para visualización
            const alturaBase = 20;
            const altura = alturaBase + Math.pow(3, i) * 2;
            return (
              <div key={i} className={styles.richterItem}>
                <div
                  className={styles.richterBarra}
                  style={{
                    height: `${Math.min(altura, 200)}px`,
                    background: m.color,
                  }}
                >
                  <span className={styles.richterMagnitud}>{m.magnitud}</span>
                </div>
                <span className={styles.richterDesc}>{m.descripcion}</span>
                <span className={styles.richterEnergia}>{m.energiaTNT}</span>
                <span className={styles.richterFreq}>{m.frecuencia}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cinturón de Fuego */}
      <div className={styles.cinturonCard}>
        <h3 className={styles.cinturonTitulo}>
          <span aria-hidden="true">🔥</span> Cinturón de Fuego del Pacífico
        </h3>
        <div className={styles.cinturonStats}>
          <div className={styles.cinturonStat}>
            <span className={styles.cinturonValor}>~40.000 km</span>
            <span className={styles.cinturonLabel}>de longitud</span>
          </div>
          <div className={styles.cinturonStat}>
            <span className={styles.cinturonValor}>~75%</span>
            <span className={styles.cinturonLabel}>volcanes activos del mundo</span>
          </div>
          <div className={styles.cinturonStat}>
            <span className={styles.cinturonValor}>~90%</span>
            <span className={styles.cinturonLabel}>terremotos del mundo</span>
          </div>
          <div className={styles.cinturonStat}>
            <span className={styles.cinturonValor}>452</span>
            <span className={styles.cinturonLabel}>volcanes en el anillo</span>
          </div>
        </div>
      </div>

      {/* Terremotos famosos */}
      <div className={styles.famososContainer}>
        <h3 className={styles.famososTitulo}>Terremotos históricos más potentes</h3>
        <div className={styles.famososLista}>
          {TERREMOTOS_FAMOSOS.map((t, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.famosoItem} ${terremotoActivo === i ? styles.famosoItemActivo : ''}`}
              onClick={() => setTerremotoActivo(terremotoActivo === i ? null : i)}
              aria-expanded={terremotoActivo === i}
            >
              <div className={styles.famosoHeader}>
                <span className={styles.famosoMag} style={{ color: t.magnitud >= 9 ? '#991B1B' : t.magnitud >= 8 ? '#EF4444' : '#F97316' }}>
                  {formatNumber(t.magnitud, 1)}
                </span>
                <div className={styles.famosoInfo}>
                  <span className={styles.famosoLugar}>{t.lugar}</span>
                  <span className={styles.famosoAnio}>{t.anio}</span>
                </div>
              </div>
              {terremotoActivo === i && (
                <p className={styles.famosoDetalle}>{t.detalle}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Un terremoto de magnitud 8 libera <strong>31,6 veces más energía</strong> que uno de magnitud 7.
          Y uno de magnitud 9 libera <strong>1.000 veces más</strong> que uno de 7. Por eso los "grandes" son tan devastadores.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La tectónica de placas explica desde la forma de los continentes hasta por qué hay volcanes en Islandia. Estos datos muestran la <strong>escala asombrosa</strong> de los procesos geológicos.</p>
      </div>

      {/* Grid de datos curiosos */}
      <div className={styles.curiososGrid}>
        {DATOS_CURIOSOS.map((d, i) => (
          <div key={i} className={styles.curiosoCard}>
            <span className={styles.curiosoIcono} aria-hidden="true">{d.icono}</span>
            <h4 className={styles.curiosoTitulo}>{d.titulo}</h4>
            <p className={styles.curiosoDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className={styles.timelineContainer}>
        <h3 className={styles.timelineTitulo}>De la herejía a la ciencia: historia de la tectónica</h3>
        <div className={styles.timelineLista}>
          {TIMELINE.map((t, i) => (
            <div key={i} className={styles.timelineItem}>
              <div className={styles.timelineDot} />
              <div className={styles.timelineContent}>
                <span className={styles.timelineAnio}>{t.anio}</span>
                <span className={styles.timelineAutor}>{t.autor}</span>
                <p className={styles.timelineAporte}>{t.aporte}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Wegener fue ridiculizado durante décadas por proponer que los continentes se mueven.
          No vivió para ver su reivindicación: murió en 1930, y la tectónica de placas no se aceptó hasta los años 60.
          <strong> A veces la ciencia tarda, pero llega.</strong>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorTectonicaPlacasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('placas');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'placas': return <SeccionPlacas />;
      case 'bordes': return <SeccionBordes />;
      case 'terremotos': return <SeccionTerremotos />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Tierra que se Mueve Bajo tus Pies</h1>
          <p className={styles.subtitle}>15 placas, 3 tipos de bordes, y la fuerza que levanta montañas</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre tectónica de placas"
          subtitle="Conceptos clave y preguntas frecuentes"
          defaultOpen={false}
        >
          <h3>¿Por qué se mueven las placas?</h3>
          <p>
            Las corrientes de convección en el manto son el motor principal. La roca caliente del interior
            asciende, se enfría en la superficie y vuelve a hundirse. Este ciclo arrastra las placas como
            una cinta transportadora. También influyen la gravedad (las placas oceánicas densas se hunden)
            y el empuje del magma en las dorsales.
          </p>

          <h3>¿Se puede predecir un terremoto?</h3>
          <p>
            No con precisión útil. Sabemos <strong>dónde</strong> ocurrirán (bordes de placa) pero no
            <strong> cuándo</strong> exactamente. Los sismólogos trabajan en probabilidades estadísticas:
            por ejemplo, hay un ~60% de probabilidad de un gran terremoto en San Francisco antes de 2043.
            Pero la fecha exacta es impredecible.
          </p>

          <h3>¿Qué es la escala de Mercalli?</h3>
          <p>
            Mientras que la escala Richter mide la <strong>energía liberada</strong> (magnitud), la escala
            de Mercalli mide la <strong>intensidad percibida</strong> (daños y sensación). Un terremoto
            tiene una sola magnitud pero diferentes intensidades según la distancia al epicentro.
          </p>

          <h3>¿Puede haber un terremoto en España?</h3>
          <p>
            Sí. España está en el borde entre la placa Euroasiática y la Africana. La zona de mayor
            riesgo sísmico es el sureste (Granada, Almería, Murcia). El terremoto de Lorca (2011, magnitud 5.1)
            causó 9 víctimas. El más devastador fue el de Lisboa en 1755 (magnitud ~8.5), que también
            afectó gravemente a Huelva y Cádiz.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador usa datos de fuentes como USGS, Smithsonian Global Volcanism
            Program e IGME con fines divulgativos. Los valores de velocidad de placas, frecuencia de terremotos
            y otros datos geológicos son aproximaciones que pueden variar según la fuente y el período analizado.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-tectonica-placas')} />
        <ShareCard appName="visualizador-tectonica-placas" />
        <Footer appName="visualizador-tectonica-placas" />
      </div>
    </>
  );
}
