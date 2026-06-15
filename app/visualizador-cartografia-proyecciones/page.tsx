'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CartografiaProyecciones.module.css';
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

type Seccion = 'problema' | 'proyecciones' | 'coordenadas' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'problema', titulo: 'El problema', icono: '🍊', subtitulo: 'No se puede aplanar una esfera' },
  { id: 'proyecciones', titulo: '5 proyecciones', icono: '🗺️', subtitulo: 'Mercator, Peters, Robinson...' },
  { id: 'coordenadas', titulo: 'Coordenadas', icono: '📍', subtitulo: 'Latitud, longitud y husos' },
  { id: 'datos', titulo: 'Datos', icono: '🤯', subtitulo: 'Curiosidades cartográficas' },
];

// ─────────────────────────────────────────────
// Propiedades de proyecciones
// ─────────────────────────────────────────────

interface Propiedad {
  nombre: string;
  icono: string;
  desc: string;
  ejemplo: string;
}

const PROPIEDADES: Propiedad[] = [
  { nombre: 'Área', icono: '📐', desc: 'Que las superficies mantengan su proporción real.', ejemplo: 'Peters conserva el área: África se ve 14 veces más grande que Groenlandia (correcto).' },
  { nombre: 'Forma', icono: '🔵', desc: 'Que los contornos locales se parezcan a la realidad.', ejemplo: 'Mercator conserva formas locales: los ángulos de la costa son correctos.' },
  { nombre: 'Distancia', icono: '📏', desc: 'Que las distancias entre puntos sean proporcionales.', ejemplo: 'Azimutal equidistante: distancias correctas desde el centro del mapa.' },
  { nombre: 'Dirección', icono: '🧭', desc: 'Que los rumbos (ángulos) sean constantes.', ejemplo: 'Mercator: una línea recta en el mapa es una línea de rumbo constante (loxodrómica).' },
];

// ─────────────────────────────────────────────
// Proyecciones
// ─────────────────────────────────────────────

interface Proyeccion {
  id: string;
  nombre: string;
  anio: number;
  autor: string;
  conserva: string;
  distorsiona: string;
  uso: string;
  desc: string;
  groenlandiaFactor: number; // factor visual relativo a África (1 = real)
}

const PROYECCIONES: Proyeccion[] = [
  {
    id: 'mercator', nombre: 'Mercator', anio: 1569, autor: 'Gerardus Mercator',
    conserva: 'Forma (conforme)', distorsiona: 'Área — enormemente en los polos',
    uso: 'Navegación marítima, Google Maps',
    desc: 'Groenlandia parece del tamaño de África (real: 14 veces más pequeña). Los ángulos se conservan, lo que permite trazar rumbos como líneas rectas.',
    groenlandiaFactor: 0.95,
  },
  {
    id: 'peters', nombre: 'Gall-Peters', anio: 1973, autor: 'Arno Peters (James Gall, 1855)',
    conserva: 'Área (equivalente)', distorsiona: 'Forma — continentes alargados verticalmente',
    uso: 'Mapas políticos, ONG, educación',
    desc: 'Políticamente controvertida: muestra el tamaño real de África y Sudamérica. Los continentes ecuatoriales se ven estirados verticalmente.',
    groenlandiaFactor: 0.07,
  },
  {
    id: 'robinson', nombre: 'Robinson', anio: 1963, autor: 'Arthur H. Robinson',
    conserva: 'Compromiso — nada perfectamente', distorsiona: 'Todo un poco, pero todo aceptable',
    uso: 'National Geographic (1988-1998), atlas escolares',
    desc: 'Creada por encargo de Rand McNally. No es ni conforme ni equivalente, pero logra un equilibrio visual agradable. La proyección más "bonita".',
    groenlandiaFactor: 0.25,
  },
  {
    id: 'mollweide', nombre: 'Mollweide', anio: 1805, autor: 'Karl Mollweide',
    conserva: 'Área (equivalente)', distorsiona: 'Forma en los bordes',
    uso: 'Mapas temáticos globales, distribución de datos',
    desc: 'Proyección de bordes curvos (elíptica). Excelente para mostrar distribuciones globales porque conserva proporciones de área.',
    groenlandiaFactor: 0.07,
  },
  {
    id: 'azimutal', nombre: 'Azimutal equidistante', anio: 1581, autor: 'Guillaume Postel',
    conserva: 'Distancia desde el centro', distorsiona: 'Forma y área en los bordes',
    uso: 'Logo de la ONU, rutas aéreas, radioaficionados',
    desc: 'Las distancias desde el punto central son exactas. Es la proyección del logo de la ONU (centrada en el Polo Norte). Útil para calcular rutas aéreas.',
    groenlandiaFactor: 0.15,
  },
];

// ─────────────────────────────────────────────
// Curiosidades
// ─────────────────────────────────────────────

interface Curiosidad {
  icono: string;
  titulo: string;
  desc: string;
  extra: string;
}

const CURIOSIDADES: Curiosidad[] = [
  { icono: '🇬🇱', titulo: 'Groenlandia vs África', desc: 'Groenlandia: 2,17 millones de km². África: 30,37 millones de km². África es 14 veces más grande.', extra: 'En Mercator parecen casi iguales. En Peters, África domina como debe.' },
  { icono: '🌙', titulo: 'Australia vs la Luna', desc: 'Australia mide unos 4.000 km de ancho. La Luna tiene 3.474 km de diámetro.', extra: 'Australia es más ancha que la Luna. Pero en Mercator parece diminuta comparada con Groenlandia.' },
  { icono: '🇷🇺', titulo: 'Rusia en Mercator', desc: 'Rusia parece más grande que África en Mercator. En realidad, África (30,37M km²) es casi el doble que Rusia (17,1M km²).', extra: 'La distorsión de Mercator agranda todo lo que está lejos del ecuador.' },
  { icono: '🏺', titulo: 'El mapa más antiguo', desc: 'El Imago Mundi babilónico (~600 a.C.) muestra Babilonia en el centro con el Éufrates y las regiones circundantes.', extra: 'Es una tablilla de arcilla. Muestra la Tierra como un disco rodeado de agua.' },
  { icono: '📱', titulo: 'Google Maps usa Mercator', desc: 'Google Maps usa Web Mercator (EPSG:3857), una variante simplificada de Mercator.', extra: 'La razón: los ángulos son correctos, los cuadrados siguen siendo cuadrados, y la navegación por zoom funciona bien.' },
  { icono: '✈️', titulo: 'Pilotos y la gnomónica', desc: 'Los pilotos usan la proyección gnomónica porque la ruta más corta (ortodrómica) aparece como línea recta.', extra: 'En Mercator, la ruta más corta entre Madrid y Tokio parece curva. En la gnomónica, es una línea recta.' },
];

// ─────────────────────────────────────────────
// Componentes SVG
// ─────────────────────────────────────────────

function GridMercator() {
  const paralelos = [20, 55, 85, 115, 150, 185, 215, 250, 280];
  return (
    <svg viewBox="0 0 400 300" className={styles.mapSvg} role="img" aria-label="Proyección Mercator: meridianos rectos, paralelos más separados cerca de los polos">
      {/* Grid - meridianos verticales equidistantes */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`m${i}`} x1={44 * (i + 1)} y1={0} x2={44 * (i + 1)} y2={300} stroke="var(--grid-color, #ccc)" strokeWidth="0.5" />
      ))}
      {/* Paralelos - separación creciente hacia polos */}
      {paralelos.map((y, i) => (
        <line key={`p${i}`} x1={0} y1={y} x2={400} y2={y} stroke="var(--grid-color, #ccc)" strokeWidth="0.5" />
      ))}
      {/* Continentes esquemáticos */}
      {/* América del Norte */}
      <ellipse cx={100} cy={85} rx={45} ry={35} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* América del Sur */}
      <ellipse cx={120} cy={185} rx={25} ry={45} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Europa */}
      <ellipse cx={210} cy={70} rx={25} ry={20} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* África */}
      <ellipse cx={220} cy={160} rx={30} ry={50} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Asia */}
      <ellipse cx={300} cy={80} rx={55} ry={40} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Australia */}
      <ellipse cx={330} cy={200} rx={20} ry={15} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Groenlandia - ENORME en Mercator */}
      <ellipse cx={160} cy={30} rx={30} ry={22} fill="#F44336" opacity={0.6} />
      <text x={160} y={35} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">Groenlandia</text>
      {/* Indicadores de Tissot */}
      <circle cx={200} cy={150} r={10} fill="none" stroke="var(--primary, #2E86AB)" strokeWidth="1.5" opacity={0.8} />
      <ellipse cx={200} cy={40} rx={10} ry={25} fill="none" stroke="#F44336" strokeWidth="1.5" opacity={0.8} />
      <ellipse cx={200} cy={260} rx={10} ry={25} fill="none" stroke="#F44336" strokeWidth="1.5" opacity={0.8} />
      {/* Etiqueta ecuador */}
      <text x={398} y={153} textAnchor="end" fontSize="7" fill="var(--text-muted, #999)">Ecuador</text>
    </svg>
  );
}

function GridPeters() {
  return (
    <svg viewBox="0 0 400 300" className={styles.mapSvg} role="img" aria-label="Proyección Peters: áreas correctas, formas distorsionadas">
      {/* Grid uniforme */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`m${i}`} x1={44 * (i + 1)} y1={0} x2={44 * (i + 1)} y2={300} stroke="var(--grid-color, #ccc)" strokeWidth="0.5" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`p${i}`} x1={0} y1={33 * (i + 1)} x2={400} y2={33 * (i + 1)} stroke="var(--grid-color, #ccc)" strokeWidth="0.5" />
      ))}
      {/* Continentes alargados verticalmente */}
      <ellipse cx={100} cy={90} rx={35} ry={25} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={115} cy={180} rx={18} ry={50} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={205} cy={75} rx={20} ry={15} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* África GRANDE y estirada */}
      <ellipse cx={215} cy={165} rx={25} ry={55} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={300} cy={85} rx={45} ry={30} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={325} cy={195} rx={18} ry={12} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Groenlandia - PEQUEÑA (correcta) */}
      <ellipse cx={155} cy={35} rx={10} ry={8} fill="#4CAF50" opacity={0.6} />
      <text x={155} y={38} textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">Gr.</text>
      {/* Tissot: elipses horizontales (achatadas) */}
      <ellipse cx={200} cy={150} rx={12} ry={8} fill="none" stroke="var(--primary, #2E86AB)" strokeWidth="1.5" opacity={0.8} />
      <circle cx={200} cy={40} r={8} fill="none" stroke="#4CAF50" strokeWidth="1.5" opacity={0.8} />
      <text x={398} y={153} textAnchor="end" fontSize="7" fill="var(--text-muted, #999)">Ecuador</text>
    </svg>
  );
}

function GridRobinson() {
  return (
    <svg viewBox="0 0 400 300" className={styles.mapSvg} role="img" aria-label="Proyección Robinson: compromiso visual entre área y forma">
      {/* Meridianos curvados */}
      {[-3, -2, -1, 0, 1, 2, 3].map((offset, i) => {
        const cx = 200 + offset * 50;
        const curva = Math.abs(offset) * 8;
        return (
          <path
            key={`m${i}`}
            d={`M ${cx + curva} 15 Q ${cx} 150 ${cx + curva} 285`}
            fill="none" stroke="var(--grid-color, #ccc)" strokeWidth="0.5"
          />
        );
      })}
      {/* Paralelos - longitud decreciente hacia polos */}
      {[50, 100, 150, 200, 250].map((y, i) => {
        const factor = 1 - Math.abs(y - 150) / 250;
        const halfW = 180 * factor;
        return (
          <line key={`p${i}`} x1={200 - halfW} y1={y} x2={200 + halfW} y2={y} stroke="var(--grid-color, #ccc)" strokeWidth="0.5" />
        );
      })}
      {/* Contorno elíptico */}
      <ellipse cx={200} cy={150} rx={190} ry={135} fill="none" stroke="var(--grid-color, #ccc)" strokeWidth="1" />
      {/* Continentes */}
      <ellipse cx={110} cy={100} rx={32} ry={28} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={120} cy={175} rx={18} ry={38} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={210} cy={85} rx={20} ry={16} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={215} cy={155} rx={25} ry={42} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={295} cy={90} rx={42} ry={30} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={310} cy={190} rx={16} ry={12} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Groenlandia - tamaño intermedio */}
      <ellipse cx={150} cy={45} rx={15} ry={12} fill="#FF9800" opacity={0.6} />
      <text x={150} y={48} textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">Gr.</text>
      {/* Tissot: ligeramente deformados */}
      <ellipse cx={200} cy={150} rx={10} ry={9} fill="none" stroke="var(--primary, #2E86AB)" strokeWidth="1.5" opacity={0.8} />
      <ellipse cx={200} cy={50} rx={8} ry={12} fill="none" stroke="#FF9800" strokeWidth="1.5" opacity={0.8} />
    </svg>
  );
}

function GridMollweide() {
  return (
    <svg viewBox="0 0 400 300" className={styles.mapSvg} role="img" aria-label="Proyección Mollweide: elíptica, conserva áreas">
      {/* Borde elíptico */}
      <ellipse cx={200} cy={150} rx={195} ry={140} fill="none" stroke="var(--grid-color, #ccc)" strokeWidth="1" />
      {/* Meridianos curvados (sinusoidales) */}
      {[-3, -2, -1, 0, 1, 2, 3].map((offset, i) => {
        const cx = 200 + offset * 45;
        const curva = offset * 15;
        return (
          <path
            key={`m${i}`}
            d={`M ${cx} 15 Q ${cx + curva} 150 ${cx} 285`}
            fill="none" stroke="var(--grid-color, #ccc)" strokeWidth="0.5"
          />
        );
      })}
      {/* Paralelos rectos */}
      {[50, 100, 150, 200, 250].map((y, i) => {
        const factor = Math.sqrt(1 - Math.pow((y - 150) / 140, 2));
        const halfW = 195 * factor;
        return (
          <line key={`p${i}`} x1={200 - halfW} y1={y} x2={200 + halfW} y2={y} stroke="var(--grid-color, #ccc)" strokeWidth="0.5" />
        );
      })}
      {/* Continentes */}
      <ellipse cx={115} cy={100} rx={30} ry={25} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={122} cy={178} rx={16} ry={36} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={210} cy={88} rx={18} ry={14} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={215} cy={155} rx={24} ry={40} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={290} cy={92} rx={40} ry={28} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      <ellipse cx={308} cy={190} rx={15} ry={11} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Groenlandia pequeña */}
      <ellipse cx={150} cy={42} rx={10} ry={8} fill="#4CAF50" opacity={0.6} />
      {/* Tissot */}
      <ellipse cx={200} cy={150} rx={10} ry={10} fill="none" stroke="var(--primary, #2E86AB)" strokeWidth="1.5" opacity={0.8} />
      <ellipse cx={100} cy={150} rx={6} ry={10} fill="none" stroke="#FF9800" strokeWidth="1.5" opacity={0.8} />
    </svg>
  );
}

function GridAzimutal() {
  return (
    <svg viewBox="0 0 400 400" className={styles.mapSvgCircular} role="img" aria-label="Proyección azimutal equidistante: centrada en el polo norte, distancias correctas desde el centro">
      {/* Círculos concéntricos (paralelos) */}
      {[40, 80, 120, 160, 190].map((r, i) => (
        <circle key={`p${i}`} cx={200} cy={200} r={r} fill="none" stroke="var(--grid-color, #ccc)" strokeWidth="0.5" />
      ))}
      {/* Meridianos radiales */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        return (
          <line
            key={`m${i}`}
            x1={200} y1={200}
            x2={200 + 190 * Math.sin(angle)}
            y2={200 - 190 * Math.cos(angle)}
            stroke="var(--grid-color, #ccc)" strokeWidth="0.5"
          />
        );
      })}
      {/* Borde exterior */}
      <circle cx={200} cy={200} r={190} fill="none" stroke="var(--grid-color, #ccc)" strokeWidth="1" />
      {/* Continentes como arcos/manchas */}
      {/* América del Norte */}
      <ellipse cx={130} cy={130} rx={35} ry={25} fill="var(--land-color, #8BC34A)" opacity={0.7} transform="rotate(-20, 130, 130)" />
      {/* Europa */}
      <ellipse cx={215} cy={115} rx={18} ry={14} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Asia */}
      <ellipse cx={280} cy={130} rx={35} ry={22} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* África */}
      <ellipse cx={220} cy={215} rx={20} ry={35} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Sudamérica */}
      <ellipse cx={150} cy={250} rx={15} ry={30} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Australia */}
      <ellipse cx={310} cy={290} rx={18} ry={12} fill="var(--land-color, #8BC34A)" opacity={0.7} />
      {/* Polo Norte central */}
      <circle cx={200} cy={200} r={5} fill="var(--primary, #2E86AB)" opacity={0.8} />
      <text x={200} y={215} textAnchor="middle" fontSize="8" fill="var(--text-muted, #999)">Polo Norte</text>
      {/* Tissot: círculos que se deforman en los bordes */}
      <circle cx={200} cy={140} r={8} fill="none" stroke="var(--primary, #2E86AB)" strokeWidth="1.5" opacity={0.8} />
      <ellipse cx={200} cy={340} rx={12} ry={6} fill="none" stroke="#F44336" strokeWidth="1.5" opacity={0.8} />
    </svg>
  );
}

function AreaComparison({ label, areaReal, areaAparente, color }: { label: string; areaReal: number; areaAparente: number; color: string }) {
  const maxArea = Math.max(areaReal, areaAparente);
  const realPct = (areaReal / maxArea) * 100;
  const aparentePct = (areaAparente / maxArea) * 100;
  return (
    <div className={styles.areaCard}>
      <h4 className={styles.areaTitulo}>{label}</h4>
      <div className={styles.areaBarGroup}>
        <div className={styles.areaBarRow}>
          <span className={styles.areaBarLabel}>Real</span>
          <div className={styles.areaBarTrack}>
            <div className={styles.areaBarFill} style={{ width: `${realPct}%`, background: color }} />
          </div>
          <span className={styles.areaBarValue}>{formatNumber(areaReal, 2)} M km²</span>
        </div>
        <div className={styles.areaBarRow}>
          <span className={styles.areaBarLabel}>Aparente</span>
          <div className={styles.areaBarTrack}>
            <div className={styles.areaBarFill} style={{ width: `${aparentePct}%`, background: '#F44336' }} />
          </div>
          <span className={styles.areaBarValue}>{formatNumber(areaAparente, 2)} M km²</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente de proyección con SVG
// ─────────────────────────────────────────────

function MapaProyeccion({ proyeccionId }: { proyeccionId: string }) {
  switch (proyeccionId) {
    case 'mercator': return <GridMercator />;
    case 'peters': return <GridPeters />;
    case 'robinson': return <GridRobinson />;
    case 'mollweide': return <GridMollweide />;
    case 'azimutal': return <GridAzimutal />;
    default: return null;
  }
}

// ─────────────────────────────────────────────
// Componente Principal
// ─────────────────────────────────────────────

export default function CartografiaProyeccionesPage() {
  const [seccion, setSeccion] = useState<Seccion>('problema');
  const [propiedadActiva, setPropiedadActiva] = useState<number | null>(null);
  const [proyeccionActiva, setProyeccionActiva] = useState(0);
  const [curiosidadActiva, setCuriosidadActiva] = useState<number | null>(null);

  const seccionActual = SECCIONES.find(s => s.id === seccion);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🗺️</span> Cartografía y Proyecciones</h1>
          <p className={styles.subtitle}>Por qué todos los mapas mienten — y por qué no queda otra opción</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-current={seccion === s.id ? 'true' : undefined}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera de sección */}
        {seccionActual && (
          <div className={styles.seccionHeader}>
            <h2 className={styles.seccionTitulo}>{seccionActual.icono} {seccionActual.titulo}</h2>
            <p className={styles.seccionSubtitulo}>{seccionActual.subtitulo}</p>
          </div>
        )}

        {/* ─── SECCIÓN 1: EL PROBLEMA ─── */}
        {seccion === 'problema' && (
          <div className={styles.seccionContent}>
            <div className={styles.contexto}>
              <strong>La Tierra es (casi) una esfera.</strong> Un mapa es plano. Intentar representar una esfera en un plano es como intentar aplanar una cáscara de naranja sin romperla: <em>siempre habrá distorsión</em>.
            </div>

            {/* Analogía de la naranja */}
            <div className={styles.naranjaCard}>
              <h3 className={styles.naranjaTitulo}><span aria-hidden="true">🍊</span> La analogía de la naranja</h3>
              <svg viewBox="0 0 400 160" className={styles.naranjaSvg} role="img" aria-label="Una esfera se pela y aplana, dejando huecos entre los gajos">
                {/* Esfera */}
                <circle cx={80} cy={80} r={55} fill="#FF9800" opacity={0.8} />
                <ellipse cx={80} cy={80} rx={55} ry={15} fill="none" stroke="#E65100" strokeWidth="1" strokeDasharray="4,3" />
                <ellipse cx={80} cy={80} rx={15} ry={55} fill="none" stroke="#E65100" strokeWidth="1" strokeDasharray="4,3" />
                <text x={80} y={150} textAnchor="middle" fontSize="10" fill="var(--text-muted, #999)">Esfera</text>
                {/* Flecha */}
                <path d={`M 145 80 L 175 80`} stroke="var(--text-muted, #999)" strokeWidth="2" markerEnd="url(#arrowHead)" />
                <defs>
                  <marker id="arrowHead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <path d="M 0 0 L 8 3 L 0 6 Z" fill="var(--text-muted, #999)" />
                  </marker>
                </defs>
                {/* Gajos aplanados con huecos */}
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const cx = 210 + i * 30;
                  return (
                    <path
                      key={i}
                      d={`M ${cx} 20 Q ${cx + 12} 80 ${cx} 140 Q ${cx - 12} 80 ${cx} 20`}
                      fill="#FF9800" opacity={0.7} stroke="#E65100" strokeWidth="0.5"
                    />
                  );
                })}
                <text x={300} y={155} textAnchor="middle" fontSize="10" fill="var(--text-muted, #999)">Pelada y aplanada (huecos)</text>
              </svg>
              <p className={styles.naranjaDesc}>
                Si pelas una naranja e intentas aplanar la cáscara, quedan huecos entre los gajos. Las proyecciones cartográficas &quot;rellenan&quot; esos huecos estirando o comprimiendo — y ahí nace la distorsión.
              </p>
            </div>

            {/* 4 propiedades */}
            <h3 className={styles.propiedadesTitulo}>Las 4 propiedades que toda proyección sacrifica</h3>
            <p className={styles.propiedadesSubtitulo}>Solo puedes conservar 1 o 2 — nunca las 4 a la vez.</p>

            <div className={styles.propiedadesGrid}>
              {PROPIEDADES.map((p, i) => (
                <button
                  key={i}
                  className={`${styles.propiedadCard} ${propiedadActiva === i ? styles.propiedadActiva : ''}`}
                  onClick={() => setPropiedadActiva(propiedadActiva === i ? null : i)}
                  aria-expanded={propiedadActiva === i}
                >
                  <div className={styles.propiedadHeader}>
                    <span className={styles.propiedadIcono} aria-hidden="true">{p.icono}</span>
                    <span className={styles.propiedadNombre}>{p.nombre}</span>
                  </div>
                  <p className={styles.propiedadDesc}>{p.desc}</p>
                  {propiedadActiva === i && (
                    <p className={styles.propiedadEjemplo}>{p.ejemplo}</p>
                  )}
                </button>
              ))}
            </div>

            <div className={styles.insight}>
              <p><strong>Regla de oro:</strong> No existe el mapa &quot;perfecto&quot;. Cada proyección elige qué sacrificar según para qué se use. Navegación marítima necesita ángulos correctos (Mercator). Un atlas escolar necesita un buen compromiso visual (Robinson).</p>
            </div>
          </div>
        )}

        {/* ─── SECCIÓN 2: 5 PROYECCIONES ─── */}
        {seccion === 'proyecciones' && (
          <div className={styles.seccionContent}>
            {/* Selector de proyección */}
            <div className={styles.proyeccionSelector}>
              {PROYECCIONES.map((p, i) => (
                <button
                  key={p.id}
                  className={`${styles.proyeccionPill} ${proyeccionActiva === i ? styles.proyeccionPillActiva : ''}`}
                  onClick={() => setProyeccionActiva(i)}
                  aria-current={proyeccionActiva === i ? 'true' : undefined}
                >
                  {p.nombre} ({p.anio})
                </button>
              ))}
            </div>

            {/* Mapa SVG de la proyección activa */}
            <div className={styles.mapaContainer}>
              <MapaProyeccion proyeccionId={PROYECCIONES[proyeccionActiva].id} />
              <div className={styles.mapaLeyenda}>
                <span className={styles.leyendaItem}><span className={styles.leyendaDot} style={{ background: 'var(--land-color, #8BC34A)' }} /> Continentes</span>
                <span className={styles.leyendaItem}><span className={styles.leyendaDotOutline} style={{ borderColor: 'var(--primary, #2E86AB)' }} /> Tissot (sin distorsión)</span>
                <span className={styles.leyendaItem}><span className={styles.leyendaDotOutline} style={{ borderColor: '#F44336' }} /> Tissot (distorsionado)</span>
              </div>
            </div>

            {/* Ficha técnica */}
            <div className={styles.fichaCard}>
              <h3 className={styles.fichaTitulo}>{PROYECCIONES[proyeccionActiva].nombre}</h3>
              <div className={styles.fichaGrid}>
                <div className={styles.fichaCampo}>
                  <span className={styles.fichaLabel}>Año</span>
                  <span className={styles.fichaValor}>{PROYECCIONES[proyeccionActiva].anio}</span>
                </div>
                <div className={styles.fichaCampo}>
                  <span className={styles.fichaLabel}>Autor</span>
                  <span className={styles.fichaValor}>{PROYECCIONES[proyeccionActiva].autor}</span>
                </div>
                <div className={styles.fichaCampo}>
                  <span className={styles.fichaLabel}>Conserva</span>
                  <span className={styles.fichaValorBueno}>{PROYECCIONES[proyeccionActiva].conserva}</span>
                </div>
                <div className={styles.fichaCampo}>
                  <span className={styles.fichaLabel}>Distorsiona</span>
                  <span className={styles.fichaValorMalo}>{PROYECCIONES[proyeccionActiva].distorsiona}</span>
                </div>
                <div className={`${styles.fichaCampo} ${styles.fichaCampoFull}`}>
                  <span className={styles.fichaLabel}>Uso principal</span>
                  <span className={styles.fichaValor}>{PROYECCIONES[proyeccionActiva].uso}</span>
                </div>
              </div>
              <p className={styles.fichaDesc}>{PROYECCIONES[proyeccionActiva].desc}</p>
            </div>

            {/* Comparación Groenlandia vs África */}
            <h3 className={styles.comparacionTitulo}><span aria-hidden="true">📐</span> Groenlandia vs África en esta proyección</h3>
            <AreaComparison
              label="Groenlandia"
              areaReal={2.17}
              areaAparente={2.17 + PROYECCIONES[proyeccionActiva].groenlandiaFactor * 28.2}
              color="#2E86AB"
            />
            <AreaComparison
              label="África"
              areaReal={30.37}
              areaAparente={30.37}
              color="#48A9A6"
            />

            <div className={styles.insight}>
              <p><strong>Los círculos de Tissot</strong> son una herramienta inventada por Nicolas Tissot (1859). Se coloca un círculo pequeño en cada punto del mapa: si la proyección distorsiona, el círculo se convierte en elipse. Donde ves un círculo perfecto, no hay distorsión local.</p>
            </div>
          </div>
        )}

        {/* ─── SECCIÓN 3: COORDENADAS Y HUSOS ─── */}
        {seccion === 'coordenadas' && (
          <div className={styles.seccionContent}>
            <div className={styles.contexto}>
              Cualquier punto de la Tierra se puede localizar con solo dos números: <strong>latitud</strong> y <strong>longitud</strong>.
            </div>

            {/* Latitud y Longitud */}
            <div className={styles.coordGrid}>
              <div className={styles.coordCard}>
                <h3 className={styles.coordTitulo}><span aria-hidden="true">↕️</span> Latitud</h3>
                <p className={styles.coordDesc}>Distancia angular norte-sur desde el ecuador.</p>
                <div className={styles.coordRango}>
                  <span>0° (Ecuador)</span>
                  <span>→</span>
                  <span>±90° (Polos)</span>
                </div>
                <div className={styles.coordEjemplos}>
                  <div className={styles.coordEjemplo}>
                    <span className={styles.coordLugar}>Madrid</span>
                    <span className={styles.coordValor}>40,42° N</span>
                  </div>
                  <div className={styles.coordEjemplo}>
                    <span className={styles.coordLugar}>Ecuador</span>
                    <span className={styles.coordValor}>0°</span>
                  </div>
                  <div className={styles.coordEjemplo}>
                    <span className={styles.coordLugar}>Polo Norte</span>
                    <span className={styles.coordValor}>90° N</span>
                  </div>
                </div>
              </div>

              <div className={styles.coordCard}>
                <h3 className={styles.coordTitulo}><span aria-hidden="true">↔️</span> Longitud</h3>
                <p className={styles.coordDesc}>Distancia angular este-oeste desde el meridiano de Greenwich.</p>
                <div className={styles.coordRango}>
                  <span>0° (Greenwich)</span>
                  <span>→</span>
                  <span>±180°</span>
                </div>
                <div className={styles.coordEjemplos}>
                  <div className={styles.coordEjemplo}>
                    <span className={styles.coordLugar}>Madrid</span>
                    <span className={styles.coordValor}>3,70° O</span>
                  </div>
                  <div className={styles.coordEjemplo}>
                    <span className={styles.coordLugar}>Tokio</span>
                    <span className={styles.coordValor}>139,69° E</span>
                  </div>
                  <div className={styles.coordEjemplo}>
                    <span className={styles.coordLugar}>Nueva York</span>
                    <span className={styles.coordValor}>74,01° O</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Greenwich */}
            <div className={styles.greenwichCard}>
              <h3 className={styles.greenwichTitulo}><span aria-hidden="true">🏛️</span> ¿Por qué Greenwich es el meridiano 0?</h3>
              <p className={styles.greenwichDesc}>
                En 1884, la <strong>Conferencia Internacional del Meridiano</strong> (Washington) eligió Greenwich por votación. No hay razón geográfica: fue una decisión política. El Reino Unido tenía la mayor flota naval y sus cartas náuticas ya usaban Greenwich. Francia se abstuvo (usaban París como referencia) y no adoptó Greenwich oficialmente hasta 1911.
              </p>
            </div>

            {/* Husos horarios */}
            <div className={styles.husosCard}>
              <h3 className={styles.husosTitulo}><span aria-hidden="true">🕐</span> 24 husos horarios</h3>
              <p className={styles.husosDesc}>
                La Tierra gira 360° en 24 horas → cada 15° de longitud hay 1 hora de diferencia. En teoría, 24 franjas iguales. En la práctica, los límites zigzaguean para no partir países.
              </p>
              <svg viewBox="0 0 400 100" className={styles.husosSvg} role="img" aria-label="Representación simplificada de husos horarios: 24 franjas de 15 grados cada una">
                {Array.from({ length: 25 }, (_, i) => (
                  <line key={i} x1={i * (400 / 24)} y1={0} x2={i * (400 / 24)} y2={80} stroke="var(--grid-color, #ccc)" strokeWidth={i === 12 ? 2 : 0.5} />
                ))}
                {Array.from({ length: 24 }, (_, i) => {
                  const hora = i - 12;
                  return (
                    <text key={i} x={i * (400 / 24) + (400 / 48)} y={95} textAnchor="middle" fontSize="7" fill="var(--text-muted, #999)">
                      {hora >= 0 ? `+${hora}` : `${hora}`}
                    </text>
                  );
                })}
                {/* Greenwich destacado */}
                <rect x={12 * (400 / 24)} y={0} width={400 / 24} height={80} fill="var(--primary, #2E86AB)" opacity={0.15} />
                <text x={12 * (400 / 24) + (400 / 48)} y={45} textAnchor="middle" fontSize="8" fill="var(--primary, #2E86AB)" fontWeight="bold">UTC</text>
                {/* España */}
                <rect x={13 * (400 / 24)} y={0} width={400 / 24} height={80} fill="#FF9800" opacity={0.15} />
                <text x={13 * (400 / 24) + (400 / 48)} y={45} textAnchor="middle" fontSize="7" fill="#E65100" fontWeight="bold">ESP</text>
              </svg>
              <p className={styles.husosNota}>España usa UTC+1 (o UTC+2 en verano) a pesar de estar geográficamente en UTC+0. Esto se debe a una decisión de Franco en 1940 para sincronizarse con Alemania.</p>
            </div>

            {/* Línea de cambio de fecha */}
            <div className={styles.fechaCard}>
              <h3 className={styles.fechaTitulo}><span aria-hidden="true">📅</span> La línea internacional de cambio de fecha</h3>
              <p className={styles.fechaDesc}>
                Pasa aproximadamente por el meridiano 180° (Pacífico), pero zigzaguea para evitar partir Rusia, Kiribati y otros países. Al cruzarla hacia el oeste, avanzas un día. Al cruzarla hacia el este, retrocedes un día.
              </p>
              <p className={styles.fechaExtra}>
                <strong>Dato curioso:</strong> Kiribati tiene islas a ambos lados, así que en 1995 desplazó la línea para que todo el país estuviera en el mismo día. Esto creó UTC+14, la zona horaria más adelantada del mundo.
              </p>
            </div>

            {/* GPS */}
            <div className={styles.gpsCard}>
              <h3 className={styles.gpsTitulo}><span aria-hidden="true">📡</span> GPS: latitud + longitud + altitud</h3>
              <p className={styles.gpsDesc}>
                Con solo 3 números (latitud, longitud, altitud) se define cualquier punto sobre la Tierra con precisión de metros. El GPS necesita mínimo 4 satélites visibles para calcular tu posición (3 para triangulación + 1 para corregir el reloj).
              </p>
              <div className={styles.gpsEjemplo}>
                <span className={styles.gpsLabel}>Puerta del Sol, Madrid:</span>
                <span className={styles.gpsCoords}>40,4169° N, 3,7035° O, 650 m</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── SECCIÓN 4: DATOS Y CURIOSIDADES ─── */}
        {seccion === 'datos' && (
          <div className={styles.seccionContent}>
            <div className={styles.curiosidadesGrid}>
              {CURIOSIDADES.map((c, i) => (
                <button
                  key={i}
                  className={`${styles.curiosidadCard} ${curiosidadActiva === i ? styles.curiosidadActiva : ''}`}
                  onClick={() => setCuriosidadActiva(curiosidadActiva === i ? null : i)}
                  aria-expanded={curiosidadActiva === i}
                >
                  <div className={styles.curiosidadHeader}>
                    <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
                    <h3 className={styles.curiosidadTitulo}>{c.titulo}</h3>
                  </div>
                  <p className={styles.curiosidadDesc}>{c.desc}</p>
                  {curiosidadActiva === i && (
                    <p className={styles.curiosidadExtra}>{c.extra}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Comparación visual Groenlandia vs África */}
            <div className={styles.comparacionFinalCard}>
              <h3 className={styles.comparacionFinalTitulo}><span aria-hidden="true">🌍</span> La distorsión en perspectiva</h3>
              <svg viewBox="0 0 400 120" className={styles.comparacionSvg} role="img" aria-label="Comparación visual: Groenlandia es 14 veces más pequeña que África">
                {/* África */}
                <rect x={20} y={10} width={280} height={40} rx={4} fill="#48A9A6" opacity={0.8} />
                <text x={160} y={35} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">África — {formatNumber(30.37, 2)} M km²</text>
                {/* Groenlandia real */}
                <rect x={20} y={60} width={20} height={40} rx={4} fill="#2E86AB" opacity={0.8} />
                <text x={50} y={85} textAnchor="start" fontSize="10" fill="var(--text-primary, #1A1A1A)" fontWeight="600">Groenlandia real — {formatNumber(2.17, 2)} M km²</text>
                {/* Etiqueta */}
                <text x={200} y={115} textAnchor="middle" fontSize="9" fill="var(--text-muted, #999)">África es {formatNumber(30.37 / 2.17, 0)}x más grande que Groenlandia</text>
              </svg>
            </div>

            <div className={styles.warningBox}>
              <strong>Recuerda:</strong> ningún mapa plano es &quot;correcto&quot;. Cada proyección es una herramienta diseñada para un propósito. Mercator es excelente para navegación, Peters para justicia visual de áreas, Robinson para atlas generales. El &quot;mejor&quot; mapa depende de lo que necesites.
            </div>
          </div>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 ¿Quieres aprender más sobre cartografía?"
          subtitle="Historia, matemáticas y curiosidades de los mapas"
        >
          <section className={styles.guideSection}>
            <h2>La imposibilidad matemática</h2>
            <p>
              El <em>theorema egregium</em> de Gauss (1827) demuestra que es matemáticamente imposible representar una superficie curva en un plano sin distorsionar algo. No es una limitación tecnológica: es un teorema. Por eso siempre habrá proyecciones nuevas intentando minimizar las distorsiones para usos específicos.
            </p>

            <h2>Historia de la cartografía</h2>
            <p>
              Eratóstenes calculó la circunferencia de la Tierra en el siglo III a.C. con un error de solo el 2%. Ptolomeo (siglo II d.C.) creó un atlas con coordenadas. Mercator revolucionó la navegación en 1569. Peters desató la &quot;guerra de los mapas&quot; en 1973 acusando a Mercator de eurocentrismo. Robinson fue encargado por Rand McNally para crear el mapa &quot;más bonito posible&quot;.
            </p>

            <h2>Web Mercator y la era digital</h2>
            <p>
              Google Maps, OpenStreetMap y la mayoría de servicios web usan Web Mercator (EPSG:3857), una simplificación de Mercator que sacrifica precisión geodésica por eficiencia computacional. Los tiles cuadrados encajan perfectamente en un sistema de zoom piramidal. El precio: Groenlandia sigue pareciendo gigantesca.
            </p>

            <h2>Más allá de las 5 proyecciones</h2>
            <p>
              Existen cientos de proyecciones cartográficas. La de Winkel Tripel (1921) reemplazó a Robinson como la oficial de National Geographic en 1998. La de Dymaxion (Buckminster Fuller, 1943) muestra los continentes como una isla casi continua. La de AuthaGraph (2016) ganó un premio de diseño japonés por ser la más equilibrada.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cartografia-proyecciones')} />
        <ShareCard appName="visualizador-cartografia-proyecciones" />
        <Footer appName="visualizador-cartografia-proyecciones" />
    </div>
  );
}
