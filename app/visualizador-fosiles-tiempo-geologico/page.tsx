'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './FosilesGeologico.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TabId = 'timeline' | 'reloj' | 'extinciones' | 'datacion';

interface EraInfo {
  id: string;
  nombre: string;
  rango: string;
  duracion: string;
  clima: string;
  vidaDominante: string;
  fosilRepresentativo: string;
  color: string;
  porcentaje: number; // porcentaje visual de la barra
  detalle: string;
}

interface PeriodoInfo {
  id: string;
  nombre: string;
  rango: string;
  hitos: string;
  eraId: string;
}

interface EventoReloj {
  hora: string;
  angulo: number; // grados en el reloj (0=12:00, 90=3:00, etc.)
  evento: string;
  detalle: string;
  ma: number;
}

interface ExtincionInfo {
  id: string;
  nombre: string;
  cuando: string;
  ma: number;
  porcentaje: number;
  causa: string;
  queSobrevivio: string;
  queVinoDespues: string;
  color: string;
}

interface MetodoDatacion {
  id: string;
  nombre: string;
  icono: string;
  rango: string;
  descripcion: string;
  detalle: string;
}

interface DatoCurioso {
  icono: string;
  texto: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const TABS: { id: TabId; label: string; icono: string }[] = [
  { id: 'timeline', label: 'Línea del Tiempo', icono: '🌍' },
  { id: 'reloj', label: 'Tierra en 24h', icono: '🕐' },
  { id: 'extinciones', label: '5 Extinciones', icono: '☄️' },
  { id: 'datacion', label: 'Datación', icono: '🔬' },
];

const ERAS: EraInfo[] = [
  {
    id: 'hadico',
    nombre: 'Hádico',
    rango: '4.500–4.000 Ma',
    duracion: '500 Ma',
    clima: 'Superficie fundida, bombardeo de asteroides, sin atmósfera estable',
    vidaDominante: 'Sin vida conocida',
    fosilRepresentativo: 'Ninguno — la Tierra era un océano de magma',
    color: '#8B0000',
    porcentaje: 11.1,
    detalle: 'El eón Hádico comienza con la formación de la Tierra por acreción de planetesimales. La superficie estaba fundida, con temperaturas superiores a 1.000 °C. El impacto de Theia formó la Luna. Al enfriarse, aparecieron los primeros océanos de agua líquida hace ~4.400 Ma.',
  },
  {
    id: 'arcaico',
    nombre: 'Arcaico',
    rango: '4.000–2.500 Ma',
    duracion: '1.500 Ma',
    clima: 'Atmósfera sin oxígeno (CO₂, metano, nitrógeno), océanos calientes',
    vidaDominante: 'Procariotas: bacterias y arqueas',
    fosilRepresentativo: 'Estromatolitos (3.500 Ma) — colonias de cianobacterias',
    color: '#4A0080',
    porcentaje: 33.3,
    detalle: 'En el Arcaico aparece la vida. Los fósiles más antiguos son estromatolitos de hace 3.500 Ma encontrados en Australia. Las cianobacterias empiezan a producir oxígeno mediante fotosíntesis, pero el oxígeno reacciona con el hierro disuelto en los océanos y no se acumula en la atmósfera.',
  },
  {
    id: 'proterozoico',
    nombre: 'Proterozoico',
    rango: '2.500–541 Ma',
    duracion: '1.959 Ma',
    clima: 'Gran Oxidación (~2.400 Ma), glaciaciones globales (Tierra Bola de Nieve)',
    vidaDominante: 'Primeros eucariotas, primeros organismos multicelulares',
    fosilRepresentativo: 'Fauna de Ediacara (~575 Ma) — primeros animales blandos',
    color: '#006400',
    porcentaje: 43.5,
    detalle: 'El Proterozoico es testigo de cambios radicales. La Gran Oxidación (~2.400 Ma) envenena a los anaerobios pero permite la evolución de eucariotas. Varias glaciaciones globales (Tierra Bola de Nieve, ~700 Ma) casi extinguen la vida. La fauna de Ediacara (~575 Ma) marca la aparición de los primeros animales multicelulares complejos.',
  },
  {
    id: 'paleozoico',
    nombre: 'Paleozoico',
    rango: '541–252 Ma',
    duracion: '289 Ma',
    clima: 'Variable: cálido al inicio, glaciación al final (Pangea)',
    vidaDominante: 'Trilobites, peces, anfibios, reptiles primitivos, bosques',
    fosilRepresentativo: 'Trilobites — artrópodos marinos ubicuos durante 300 Ma',
    color: '#2E86AB',
    porcentaje: 6.4,
    detalle: 'El Paleozoico comienza con la Explosión Cámbrica (541 Ma): en ~20 Ma aparecen casi todos los planes corporales animales. Los peces dominan los océanos, los anfibios conquistan la tierra, los bosques de helechos gigantes forman los depósitos de carbón. Termina con la extinción del Pérmico (96% de especies).',
  },
  {
    id: 'mesozoico',
    nombre: 'Mesozoico',
    rango: '252–66 Ma',
    duracion: '186 Ma',
    clima: 'Cálido y húmedo, sin casquetes polares, nivel del mar alto',
    vidaDominante: 'Dinosaurios, pterosaurios, reptiles marinos, primeros mamíferos',
    fosilRepresentativo: 'Tyrannosaurus rex — depredador del Cretácico tardío',
    color: '#D4A017',
    porcentaje: 4.1,
    detalle: 'La era de los dinosaurios. Tras la extinción del Pérmico, los arcosaurios diversifican y dominan tierra, mar y aire durante 186 Ma. Aparecen las primeras angiospermas (plantas con flor), las primeras aves (Archaeopteryx, 150 Ma) y los mamíferos permanecen pequeños y nocturnos. Termina con el asteroide Chicxulub.',
  },
  {
    id: 'cenozoico',
    nombre: 'Cenozoico',
    rango: '66 Ma–hoy',
    duracion: '66 Ma',
    clima: 'Enfriamiento progresivo, glaciaciones cuaternarias, clima actual',
    vidaDominante: 'Mamíferos, aves, angiospermas, primates, humanos',
    fosilRepresentativo: 'Homo sapiens — aparece hace ~300.000 años',
    color: '#E8842A',
    porcentaje: 1.5,
    detalle: 'Con los dinosaurios extintos, los mamíferos radian explosivamente. Los primates aparecen hace ~55 Ma, los homínidos hace ~7 Ma y Homo sapiens hace ~300.000 años. Las glaciaciones cuaternarias modelan el paisaje actual. Toda la historia de la civilización humana ocupa los últimos 10.000 años.',
  },
];

const PERIODOS: PeriodoInfo[] = [
  { id: 'cambrico', nombre: 'Cámbrico', rango: '541–485 Ma', hitos: 'Explosión Cámbrica, trilobites, primeros cordados', eraId: 'paleozoico' },
  { id: 'ordovicico', nombre: 'Ordovícico', rango: '485–444 Ma', hitos: 'Biodiversificación marina, primeras plantas terrestres', eraId: 'paleozoico' },
  { id: 'silurico', nombre: 'Silúrico', rango: '444–419 Ma', hitos: 'Primeros peces con mandíbula, plantas vasculares', eraId: 'paleozoico' },
  { id: 'devonico', nombre: 'Devónico', rango: '419–359 Ma', hitos: 'Era de los peces, primeros anfibios (Tiktaalik)', eraId: 'paleozoico' },
  { id: 'carbonifero', nombre: 'Carbonífero', rango: '359–299 Ma', hitos: 'Bosques de helechos gigantes, insectos enormes, primeros reptiles', eraId: 'paleozoico' },
  { id: 'permico', nombre: 'Pérmico', rango: '299–252 Ma', hitos: 'Pangea, reptiles mamiferoides, la Gran Mortandad', eraId: 'paleozoico' },
  { id: 'triasico', nombre: 'Triásico', rango: '252–201 Ma', hitos: 'Primeros dinosaurios, primeros mamíferos', eraId: 'mesozoico' },
  { id: 'jurasico', nombre: 'Jurásico', rango: '201–145 Ma', hitos: 'Dinosaurios dominan, Archaeopteryx, Pangea se fragmenta', eraId: 'mesozoico' },
  { id: 'cretacico', nombre: 'Cretácico', rango: '145–66 Ma', hitos: 'T. rex, angiospermas, asteroide Chicxulub', eraId: 'mesozoico' },
];

const EVENTOS_RELOJ: EventoReloj[] = [
  { hora: '00:00', angulo: 0, evento: 'Formación de la Tierra', detalle: 'La Tierra se forma por acreción de polvo y gas en el disco protoplanetario solar.', ma: 4500 },
  { hora: '04:00', angulo: 60, evento: 'Primeras bacterias', detalle: 'Aparecen los primeros organismos vivos: procariotas unicelulares en los océanos.', ma: 3800 },
  { hora: '06:00', angulo: 90, evento: 'Cianobacterias (O₂)', detalle: 'Las cianobacterias empiezan a producir oxígeno mediante fotosíntesis. Comienza la oxigenación del planeta.', ma: 3500 },
  { hora: '14:00', angulo: 210, evento: 'Primeros eucariotas', detalle: 'Células con núcleo definido. Endosimbiosis: una bacteria engulló a otra que se convirtió en mitocondria.', ma: 2100 },
  { hora: '21:00', angulo: 315, evento: 'Animales multicelulares', detalle: 'Fauna de Ediacara: los primeros organismos multicelulares complejos aparecen en los océanos.', ma: 575 },
  { hora: '22:00', angulo: 330, evento: 'Explosión Cámbrica', detalle: 'En ~20 millones de años aparecen casi todos los planes corporales animales conocidos.', ma: 541 },
  { hora: '22:48', angulo: 342, evento: 'Primeros dinosaurios', detalle: 'Los arcosaurios diversifican tras la extinción del Triásico. Comienzan 165 Ma de dominio.', ma: 230 },
  { hora: '23:39', angulo: 354.75, evento: 'Extinción dinosaurios', detalle: 'El asteroide Chicxulub impacta en Yucatán. Fin de los dinosaurios no aviares.', ma: 66 },
  { hora: '23:59:56', angulo: 359.985, evento: 'Homo sapiens', detalle: 'Nuestra especie aparece en África. En los últimos 4 segundos de las 24 horas de la Tierra.', ma: 0.3 },
  { hora: '23:59:59.99', angulo: 359.9999, evento: 'Historia escrita', detalle: 'Toda la civilización humana: Mesopotamia, Roma, la Edad Media, la era digital... en la última centésima de segundo.', ma: 0.005 },
];

const EXTINCIONES: ExtincionInfo[] = [
  {
    id: 'ordovicico',
    nombre: 'Ordovícico-Silúrico',
    cuando: '~445 Ma',
    ma: 445,
    porcentaje: 85,
    causa: 'Glaciación masiva. Gondwana se desplazó al polo sur, provocando una era glacial que bajó el nivel del mar y enfrió los océanos.',
    queSobrevivio: 'Algunos braquiópodos, moluscos y los primeros peces con mandíbula.',
    queVinoDespues: 'Diversificación de peces, primeras plantas terrestres, colonización de la tierra firme.',
    color: '#6366F1',
  },
  {
    id: 'devonico',
    nombre: 'Devónico tardío',
    cuando: '~375 Ma',
    ma: 375,
    porcentaje: 75,
    causa: 'Anoxia oceánica (falta de oxígeno en los mares). Posiblemente provocada por la proliferación de plantas terrestres que alteraron los nutrientes de los ríos.',
    queSobrevivio: 'Anfibios primitivos, algunos peces, plantas terrestres.',
    queVinoDespues: 'Radiación de anfibios, bosques de helechos gigantes, aparición de reptiles.',
    color: '#8B5CF6',
  },
  {
    id: 'permico',
    nombre: 'Pérmico-Triásico',
    cuando: '~252 Ma',
    ma: 252,
    porcentaje: 96,
    causa: 'La Gran Mortandad. Erupción masiva de los Traps de Siberia durante ~1 Ma: CO₂ y SO₂ masivos, acidificación oceánica, efecto invernadero extremo (+10 °C).',
    queSobrevivio: 'Algunos reptiles pequeños (Lystrosaurus dominó brevemente), insectos, hongos.',
    queVinoDespues: 'Radiación de arcosaurios → dinosaurios. Los mamíferos quedan relegados a nichos nocturnos.',
    color: '#EF4444',
  },
  {
    id: 'triasico',
    nombre: 'Triásico-Jurásico',
    cuando: '~201 Ma',
    ma: 201,
    porcentaje: 80,
    causa: 'Vulcanismo masivo asociado a la ruptura de Pangea (Provincia Magmática del Atlántico Central). Emisiones de CO₂ y calentamiento global.',
    queSobrevivio: 'Dinosaurios, pterosaurios, primeros mamíferos, cocodrilomorfos.',
    queVinoDespues: 'Los dinosaurios, sin competencia, se diversifican y dominan tierra, mar y aire durante 135 Ma.',
    color: '#F59E0B',
  },
  {
    id: 'cretacico',
    nombre: 'Cretácico-Paleógeno',
    cuando: '~66 Ma',
    ma: 66,
    porcentaje: 76,
    causa: 'Impacto del asteroide Chicxulub (Yucatán, México): ~10 km de diámetro. Invierno por impacto, incendios globales, lluvia ácida, oscuridad durante meses.',
    queSobrevivio: 'Mamíferos pequeños, aves, reptiles (cocodrilos, tortugas), insectos, plantas semilleras.',
    queVinoDespues: 'Radiación de mamíferos: ocupan todos los nichos ecológicos. Primates → homínidos → humanos.',
    color: '#10B981',
  },
];

const METODOS_DATACION: MetodoDatacion[] = [
  {
    id: 'c14',
    nombre: 'Carbono-14 (¹⁴C)',
    icono: '⚛️',
    rango: 'Hasta ~50.000 años',
    descripcion: 'Para restos orgánicos recientes. Mide la desintegración del isótopo ¹⁴C.',
    detalle: 'Todos los seres vivos absorben ¹⁴C del ambiente. Al morir, dejan de absorberlo y el ¹⁴C se desintegra con una vida media de 5.730 años. Midiendo cuánto ¹⁴C queda, se calcula cuándo murió el organismo. Después de ~50.000 años queda tan poco que no es medible.',
  },
  {
    id: 'k-ar',
    nombre: 'Potasio-Argón (K-Ar)',
    icono: '🌋',
    rango: 'Miles a miles de millones de años',
    descripcion: 'Para rocas volcánicas. Mide la desintegración de ⁴⁰K en ⁴⁰Ar.',
    detalle: 'El potasio-40 se desintegra en argón-40 con una vida media de 1.250 millones de años. Cuando la roca volcánica se solidifica, el argón queda atrapado. Midiendo la proporción K/Ar, se calcula la edad de la roca. Ideal para datar capas volcánicas que rodean fósiles.',
  },
  {
    id: 'estratigrafia',
    nombre: 'Estratigrafía',
    icono: '📚',
    rango: 'Datación relativa (cualquier edad)',
    descripcion: 'Las capas más profundas son más antiguas (Principio de Superposición).',
    detalle: 'Nicholas Steno (1669) estableció que los sedimentos se depositan en capas horizontales, siendo las más profundas las más antiguas. No da fechas absolutas, pero permite ordenar eventos en el tiempo. Combinada con datación radiométrica de capas volcánicas intercaladas, se construye la escala geológica.',
  },
  {
    id: 'fosiles-guia',
    nombre: 'Fósiles guía',
    icono: '🐚',
    rango: 'Datación relativa (correlación entre lugares)',
    descripcion: 'Especies que existieron poco tiempo pero se distribuyeron ampliamente.',
    detalle: 'Ciertos organismos son perfectos para datar porque vivieron poco tiempo geológico pero se extendieron por todo el mundo: trilobites (Cámbrico-Pérmico), ammonites (Devónico-Cretácico), graptolitos (Ordovícico-Silúrico). Si encuentras el mismo fósil guía en dos continentes, esas rocas tienen la misma edad.',
  },
];

const DATOS_CURIOSOS: DatoCurioso[] = [
  { icono: '🦕', texto: 'El fósil más antiguo conocido tiene 3.500 Ma: estromatolitos en Pilbara, Australia.' },
  { icono: '💎', texto: 'El ámbar preserva insectos de hace 100 Ma con detalle perfecto, incluyendo ADN degradado.' },
  { icono: '🦴', texto: 'Solo ~1 de cada 10.000 organismos se fosiliza. La mayoría se descompone sin dejar rastro.' },
  { icono: '🏔️', texto: 'Se han encontrado fósiles marinos en la cima del Everest: estuvo bajo el mar hace 450 Ma.' },
];

// ─────────────────────────────────────────────
// Componente SVG Reloj 24h
// ─────────────────────────────────────────────

function SvgReloj24h({
  eventoActivo,
  onEventoClick,
}: {
  eventoActivo: string | null;
  onEventoClick: (hora: string) => void;
}) {
  const cx = 200;
  const cy = 200;
  const radio = 170;

  return (
    <svg viewBox="0 0 400 400" className={styles.svgReloj} role="img" aria-label="Reloj de 24 horas representando 4.500 millones de años de historia de la Tierra">
      {/* Fondo del reloj */}
      <circle cx={cx} cy={cy} r={radio + 10} fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />

      {/* Arco de colores por era */}
      {/* Hádico: 0-4h (0-60°) */}
      <path d={describeArc(cx, cy, radio, -90, -90 + 60)} fill="none" stroke="#8B0000" strokeWidth="12" opacity="0.4" />
      {/* Arcaico: 4-10.67h (60-160°) */}
      <path d={describeArc(cx, cy, radio, -90 + 60, -90 + 160)} fill="none" stroke="#4A0080" strokeWidth="12" opacity="0.4" />
      {/* Proterozoico: 10.67-21h (160-315°) */}
      <path d={describeArc(cx, cy, radio, -90 + 160, -90 + 315)} fill="none" stroke="#006400" strokeWidth="12" opacity="0.4" />
      {/* Fanerozoico: 21-24h (315-360°) */}
      <path d={describeArc(cx, cy, radio, -90 + 315, -90 + 360)} fill="none" stroke="#2E86AB" strokeWidth="12" opacity="0.6" />

      {/* Marcas de hora */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = ((i / 24) * 360 - 90) * (Math.PI / 180);
        const x1 = cx + (radio - 15) * Math.cos(angle);
        const y1 = cy + (radio - 15) * Math.sin(angle);
        const x2 = cx + (radio - 5) * Math.cos(angle);
        const y2 = cy + (radio - 5) * Math.sin(angle);
        const xt = cx + (radio - 28) * Math.cos(angle);
        const yt = cy + (radio - 28) * Math.sin(angle);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-muted)" strokeWidth={i % 6 === 0 ? 2 : 1} />
            {i % 3 === 0 && (
              <text x={xt} y={yt + 4} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight={i % 6 === 0 ? '700' : '400'}>
                {String(i).padStart(2, '0')}
              </text>
            )}
          </g>
        );
      })}

      {/* Eventos como puntos clickables */}
      {EVENTOS_RELOJ.map(ev => {
        const angle = ((ev.angulo / 360) * 2 * Math.PI) - (Math.PI / 2);
        const r = radio - 45;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        const activo = eventoActivo === ev.hora;
        return (
          <g key={ev.hora}>
            <circle
              cx={x}
              cy={y}
              r={activo ? 7 : 5}
              fill={activo ? '#2E86AB' : '#48A9A6'}
              stroke="white"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => onEventoClick(ev.hora)}
              role="button"
              tabIndex={0}
              aria-label={`${ev.hora} — ${ev.evento}`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEventoClick(ev.hora); } }}
            />
            {/* Etiqueta para eventos de las primeras horas (espacio suficiente) */}
            {ev.angulo < 120 && (
              <text
                x={x + 12}
                y={y + 4}
                fill="var(--text-secondary)"
                fontSize="7"
                fontWeight="600"
              >
                {ev.hora.substring(0, 5)}
              </text>
            )}
          </g>
        );
      })}

      {/* Centro */}
      <circle cx={cx} cy={cy} r="30" fill="var(--primary)" opacity="0.1" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--primary)" fontSize="9" fontWeight="700">4.500 Ma</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="var(--primary)" fontSize="7">= 24 horas</text>
    </svg>
  );
}

/** Genera un arco SVG entre dos ángulos (en grados) */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorFosilesGeologicoPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('timeline');
  const [eraActiva, setEraActiva] = useState<string | null>(null);
  const [eventoActivo, setEventoActivo] = useState<string | null>(null);
  const [extincionActiva, setExtincionActiva] = useState<string | null>(null);
  const [metodoActivo, setMetodoActivo] = useState<string | null>(null);

  const toggleEra = (id: string) => setEraActiva(prev => (prev === id ? null : id));
  const toggleEvento = (hora: string) => setEventoActivo(prev => (prev === hora ? null : hora));
  const toggleExtincion = (id: string) => setExtincionActiva(prev => (prev === id ? null : id));
  const toggleMetodo = (id: string) => setMetodoActivo(prev => (prev === id ? null : id));

  const eraSeleccionada = ERAS.find(e => e.id === eraActiva);
  const eventoSeleccionado = EVENTOS_RELOJ.find(e => e.hora === eventoActivo);
  const extincionSeleccionada = EXTINCIONES.find(e => e.id === extincionActiva);
  const metodoSeleccionado = METODOS_DATACION.find(m => m.id === metodoActivo);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <div className={styles.heroIcono} aria-hidden="true">🦕</div>
          <h1 className={styles.title}>Fósiles y Tiempo Geológico</h1>
          <p className={styles.subtitle}>
            4.500 millones de años de historia de la Tierra — eras, extinciones y cómo leemos las rocas
          </p>
        </header>

        <LegalNotice />

        {/* Navegación tipo tabs */}
        <nav className={styles.tabNav} aria-label="Secciones del explicador">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActiva : ''}`}
              onClick={() => setTabActiva(tab.id)}
              aria-selected={tabActiva === tab.id}
              role="tab"
            >
              <span aria-hidden="true">{tab.icono}</span> {tab.label}
            </button>
          ))}
        </nav>

        {/* ═══════════════ TAB 1: Línea del Tiempo ═══════════════ */}
        {tabActiva === 'timeline' && (
          <section className={styles.tabContent} aria-label="Línea del tiempo geológico">
            <p className={styles.introText}>
              Toca cada segmento o bloque para explorar las eras de la Tierra.
            </p>

            {/* Barra horizontal de tiempo */}
            <div className={styles.timelineWrapper}>
              <div className={styles.timelineBar} role="group" aria-label="Eras geológicas">
                {ERAS.map(era => (
                  <button
                    key={era.id}
                    type="button"
                    className={`${styles.timelineSegmento} ${eraActiva === era.id ? styles.timelineSegmentoActivo : ''}`}
                    style={{
                      width: `${Math.max(era.porcentaje, 3)}%`,
                      backgroundColor: era.color,
                    }}
                    onClick={() => toggleEra(era.id)}
                    aria-expanded={eraActiva === era.id}
                    aria-label={`${era.nombre} (${era.rango})`}
                    title={`${era.nombre} — ${era.rango}`}
                  />
                ))}
              </div>
              <div className={styles.timelineLabels}>
                <span>4.500 Ma</span>
                <span>Hoy</span>
              </div>
            </div>

            {/* Panel de era seleccionada */}
            {eraSeleccionada && (
              <div
                className={styles.eraPanel}
                style={{ borderLeftColor: eraSeleccionada.color }}
                role="region"
                aria-label={`Información de ${eraSeleccionada.nombre}`}
              >
                <h3 className={styles.eraPanelTitulo} style={{ color: eraSeleccionada.color }}>
                  {eraSeleccionada.nombre}
                </h3>
                <div className={styles.eraDatos}>
                  <div className={styles.eraDato}><strong>Rango:</strong> {eraSeleccionada.rango}</div>
                  <div className={styles.eraDato}><strong>Duración:</strong> {eraSeleccionada.duracion}</div>
                  <div className={styles.eraDato}><strong>Clima:</strong> {eraSeleccionada.clima}</div>
                  <div className={styles.eraDato}><strong>Vida dominante:</strong> {eraSeleccionada.vidaDominante}</div>
                  <div className={styles.eraDato}><strong>Fósil representativo:</strong> {eraSeleccionada.fosilRepresentativo}</div>
                </div>
                <p className={styles.eraDetalle}>{eraSeleccionada.detalle}</p>

                {/* Períodos del Fanerozoico */}
                {(eraSeleccionada.id === 'paleozoico' || eraSeleccionada.id === 'mesozoico') && (
                  <div className={styles.periodosSection}>
                    <h4 className={styles.periodosLabel}>Períodos del {eraSeleccionada.nombre}:</h4>
                    <div className={styles.periodosGrid}>
                      {PERIODOS.filter(p => p.eraId === eraSeleccionada.id).map(p => (
                        <div key={p.id} className={styles.periodoCard}>
                          <span className={styles.periodoNombre}>{p.nombre}</span>
                          <span className={styles.periodoRango}>{p.rango}</span>
                          <span className={styles.periodoHitos}>{p.hitos}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bloques clickables */}
            <div className={styles.erasGrid}>
              {ERAS.map(era => (
                <button
                  key={era.id}
                  type="button"
                  className={`${styles.eraCard} ${eraActiva === era.id ? styles.eraCardActiva : ''}`}
                  onClick={() => toggleEra(era.id)}
                  style={{ borderLeftColor: era.color }}
                  aria-expanded={eraActiva === era.id}
                >
                  <span className={styles.eraIndicador} style={{ background: era.color }} aria-hidden="true" />
                  <span className={styles.eraNombre}>{era.nombre}</span>
                  <span className={styles.eraRango}>{era.rango}</span>
                </button>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Perspectiva:</strong> el Fanerozoico (toda la vida visible: trilobites, dinosaurios, humanos)
                ocupa solo el 12% final de la historia de la Tierra. El 88% restante fue un planeta dominado
                por microbios invisibles.
              </p>
            </div>
          </section>
        )}

        {/* ═══════════════ TAB 2: Tierra en 24h ═══════════════ */}
        {tabActiva === 'reloj' && (
          <section className={styles.tabContent} aria-label="Si la Tierra fuera un día">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🕐</span> Si la Tierra Fuera un Día de 24 Horas
            </h2>
            <p className={styles.seccionSubtitulo}>
              4.500 Ma comprimidos en 24 horas. Toca los puntos del reloj para explorar.
            </p>

            <div className={styles.relojWrapper}>
              <SvgReloj24h eventoActivo={eventoActivo} onEventoClick={toggleEvento} />
            </div>

            {/* Panel de evento seleccionado */}
            {eventoSeleccionado && (
              <div className={styles.eventoPanel} role="region" aria-label={`Evento: ${eventoSeleccionado.evento}`}>
                <div className={styles.eventoPanelHeader}>
                  <span className={styles.eventoHora}>{eventoSeleccionado.hora}</span>
                  <span className={styles.eventoNombre}>{eventoSeleccionado.evento}</span>
                </div>
                <p className={styles.eventoDetalle}>{eventoSeleccionado.detalle}</p>
                {eventoSeleccionado.ma >= 1 && (
                  <span className={styles.eventoMa}>Hace ~{eventoSeleccionado.ma.toLocaleString('es-ES')} Ma</span>
                )}
                {eventoSeleccionado.ma > 0 && eventoSeleccionado.ma < 1 && (
                  <span className={styles.eventoMa}>Hace ~{(eventoSeleccionado.ma * 1000000).toLocaleString('es-ES')} años</span>
                )}
              </div>
            )}

            {/* Lista de eventos */}
            <div className={styles.eventosLista}>
              {EVENTOS_RELOJ.map(ev => (
                <button
                  key={ev.hora}
                  type="button"
                  className={`${styles.eventoItem} ${eventoActivo === ev.hora ? styles.eventoItemActivo : ''}`}
                  onClick={() => toggleEvento(ev.hora)}
                  aria-expanded={eventoActivo === ev.hora}
                >
                  <span className={styles.eventoItemHora}>{ev.hora}</span>
                  <span className={styles.eventoItemTexto}>{ev.evento}</span>
                </button>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Perspectiva:</strong> si la Tierra tuviera 24 horas, los humanos aparecemos
                en los últimos 4 segundos. Toda la historia escrita (Mesopotamia, Roma, la era digital)
                ocupa la última centésima de segundo.
              </p>
            </div>
          </section>
        )}

        {/* ═══════════════ TAB 3: Las 5 Grandes Extinciones ═══════════════ */}
        {tabActiva === 'extinciones' && (
          <section className={styles.tabContent} aria-label="Las 5 grandes extinciones masivas">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">☄️</span> Las 5 Grandes Extinciones Masivas
            </h2>
            <p className={styles.seccionSubtitulo}>
              Cada una eliminó entre el 75% y el 96% de las especies. Toca para explorar.
            </p>

            {/* Barras de impacto */}
            <div className={styles.extincionesGrid}>
              {EXTINCIONES.map(ext => (
                <button
                  key={ext.id}
                  type="button"
                  className={`${styles.extincionCard} ${extincionActiva === ext.id ? styles.extincionCardActiva : ''}`}
                  onClick={() => toggleExtincion(ext.id)}
                  aria-expanded={extincionActiva === ext.id}
                >
                  <div className={styles.extincionHeader}>
                    <span className={styles.extincionNombre}>{ext.nombre}</span>
                    <span className={styles.extincionCuando}>{ext.cuando}</span>
                  </div>
                  <div className={styles.extincionBarWrapper}>
                    <div
                      className={styles.extincionBar}
                      style={{ width: `${ext.porcentaje}%`, backgroundColor: ext.color }}
                      role="meter"
                      aria-label={`${ext.porcentaje}% de especies extintas`}
                      aria-valuenow={ext.porcentaje}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                    <span className={styles.extincionPorcentaje}>{ext.porcentaje}%</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Panel de extinción seleccionada */}
            {extincionSeleccionada && (
              <div
                className={styles.extincionPanel}
                style={{ borderLeftColor: extincionSeleccionada.color }}
                role="region"
                aria-label={`Detalles de la extinción ${extincionSeleccionada.nombre}`}
              >
                <h3 className={styles.extincionPanelTitulo} style={{ color: extincionSeleccionada.color }}>
                  {extincionSeleccionada.nombre} — {extincionSeleccionada.porcentaje}% de especies
                </h3>
                <div className={styles.extincionDatos}>
                  <div className={styles.extincionDato}>
                    <strong>Causa:</strong> {extincionSeleccionada.causa}
                  </div>
                  <div className={styles.extincionDato}>
                    <strong>Qué sobrevivió:</strong> {extincionSeleccionada.queSobrevivio}
                  </div>
                  <div className={styles.extincionDato}>
                    <strong>Qué vino después:</strong> {extincionSeleccionada.queVinoDespues}
                  </div>
                </div>
              </div>
            )}

            {/* Sexta extinción */}
            <div className={styles.sextaExtincion}>
              <h3 className={styles.subTitulo}>
                <span aria-hidden="true">⚠️</span> ¿Estamos en la 6.ª extinción?
              </h3>
              <p>
                Muchos científicos consideran que estamos en el inicio de la sexta extinción masiva
                (Antropoceno). La tasa actual de extinción es entre 100 y 1.000 veces mayor que
                la tasa natural de fondo. Las causas principales son la destrucción de hábitats,
                el cambio climático, la contaminación, las especies invasoras y la sobreexplotación.
              </p>
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Perspectiva:</strong> después de cada extinción masiva, la vida se diversificó
                más que antes. La extinción del Pérmico abrió paso a los dinosaurios; la del Cretácico,
                a los mamíferos y, finalmente, a nosotros.
              </p>
            </div>
          </section>
        )}

        {/* ═══════════════ TAB 4: Cómo se Datan los Fósiles ═══════════════ */}
        {tabActiva === 'datacion' && (
          <section className={styles.tabContent} aria-label="Métodos de datación de fósiles">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🔬</span> Cómo se Datan los Fósiles
            </h2>
            <p className={styles.seccionSubtitulo}>
              Los paleontólogos usan varios métodos combinados para fechar los fósiles.
            </p>

            {/* Métodos clickables */}
            <div className={styles.metodosGrid}>
              {METODOS_DATACION.map(metodo => (
                <button
                  key={metodo.id}
                  type="button"
                  className={`${styles.metodoCard} ${metodoActivo === metodo.id ? styles.metodoCardActivo : ''}`}
                  onClick={() => toggleMetodo(metodo.id)}
                  aria-expanded={metodoActivo === metodo.id}
                >
                  <span className={styles.metodoIcono} aria-hidden="true">{metodo.icono}</span>
                  <div className={styles.metodoTexto}>
                    <span className={styles.metodoNombre}>{metodo.nombre}</span>
                    <span className={styles.metodoRango}>{metodo.rango}</span>
                    <span className={styles.metodoDesc}>{metodo.descripcion}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Panel de método seleccionado */}
            {metodoSeleccionado && (
              <div className={styles.metodoPanel} role="region" aria-label={`Detalles de ${metodoSeleccionado.nombre}`}>
                <h3 className={styles.metodoPanelTitulo}>
                  <span aria-hidden="true">{metodoSeleccionado.icono}</span> {metodoSeleccionado.nombre}
                </h3>
                <p className={styles.metodoPanelDetalle}>{metodoSeleccionado.detalle}</p>

                {/* Diagrama de decaimiento para C-14 */}
                {metodoSeleccionado.id === 'c14' && (
                  <div className={styles.decaimientoSection}>
                    <h4 className={styles.decaimientoLabel}>Curva de decaimiento del ¹⁴C:</h4>
                    <svg viewBox="0 0 360 180" className={styles.svgDecaimiento} role="img" aria-label="Gráfico de decaimiento exponencial del carbono-14">
                      {/* Ejes */}
                      <line x1="40" y1="150" x2="340" y2="150" stroke="var(--text-muted)" strokeWidth="1" />
                      <line x1="40" y1="20" x2="40" y2="150" stroke="var(--text-muted)" strokeWidth="1" />
                      {/* Etiquetas eje X */}
                      <text x="40" y="168" textAnchor="middle" fill="var(--text-muted)" fontSize="8">0</text>
                      <text x="100" y="168" textAnchor="middle" fill="var(--text-muted)" fontSize="8">5.730</text>
                      <text x="160" y="168" textAnchor="middle" fill="var(--text-muted)" fontSize="8">11.460</text>
                      <text x="220" y="168" textAnchor="middle" fill="var(--text-muted)" fontSize="8">17.190</text>
                      <text x="280" y="168" textAnchor="middle" fill="var(--text-muted)" fontSize="8">22.920</text>
                      <text x="340" y="168" textAnchor="middle" fill="var(--text-muted)" fontSize="8">28.650</text>
                      <text x="190" y="178" textAnchor="middle" fill="var(--text-secondary)" fontSize="8">Años</text>
                      {/* Etiquetas eje Y */}
                      <text x="35" y="35" textAnchor="end" fill="var(--text-muted)" fontSize="8">100%</text>
                      <text x="35" y="68" textAnchor="end" fill="var(--text-muted)" fontSize="8">75%</text>
                      <text x="35" y="100" textAnchor="end" fill="var(--text-muted)" fontSize="8">50%</text>
                      <text x="35" y="133" textAnchor="end" fill="var(--text-muted)" fontSize="8">25%</text>
                      {/* Curva exponencial */}
                      <path
                        d="M 40 30 Q 70 30 100 90 Q 130 120 160 125 Q 190 132 220 138 Q 260 143 340 147"
                        fill="none"
                        stroke="#2E86AB"
                        strokeWidth="2.5"
                      />
                      {/* Marcas de vida media */}
                      <line x1="100" y1="90" x2="100" y2="150" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="100" y="85" textAnchor="middle" fill="var(--primary)" fontSize="7" fontWeight="600">50%</text>
                      <line x1="160" y1="125" x2="160" y2="150" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="160" y="120" textAnchor="middle" fill="var(--primary)" fontSize="7" fontWeight="600">25%</text>
                    </svg>
                  </div>
                )}

                {/* Diagrama de capas para estratigrafía */}
                {metodoSeleccionado.id === 'estratigrafia' && (
                  <div className={styles.estratosSection}>
                    <h4 className={styles.decaimientoLabel}>Principio de superposición:</h4>
                    <div className={styles.estratosStack}>
                      {[
                        { color: '#E8842A', label: 'Reciente', edad: '~10.000 años' },
                        { color: '#D4A017', label: 'Cretácico', edad: '~100 Ma' },
                        { color: '#2E86AB', label: 'Jurásico', edad: '~180 Ma' },
                        { color: '#006400', label: 'Triásico', edad: '~240 Ma' },
                        { color: '#4A0080', label: 'Pérmico', edad: '~280 Ma' },
                        { color: '#8B0000', label: 'Carbonífero', edad: '~320 Ma' },
                      ].map((capa, i) => (
                        <div key={i} className={styles.estratoCapa} style={{ backgroundColor: capa.color }}>
                          <span className={styles.estratoLabel}>{capa.label}</span>
                          <span className={styles.estratoEdad}>{capa.edad}</span>
                        </div>
                      ))}
                      <div className={styles.estratoFlecha}>
                        <span>Más profundo = Más antiguo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Datos curiosos */}
            <div className={styles.curiososSection}>
              <h3 className={styles.subTitulo}>
                <span aria-hidden="true">💡</span> Datos Curiosos
              </h3>
              <div className={styles.curiososGrid}>
                {DATOS_CURIOSOS.map((dato, i) => (
                  <div key={i} className={styles.curiosoCard}>
                    <span className={styles.curiosoIcono} aria-hidden="true">{dato.icono}</span>
                    <p className={styles.curiosoTexto}>{dato.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Perspectiva:</strong> cada fósil es un superviviente estadístico. Solo 1 de cada
                10.000 organismos se fosiliza, y solo una fracción de esos fósiles es descubierta.
                Cada hallazgo es una ventana improbable al pasado.
              </p>
            </div>
          </section>
        )}

        <EducationalSection
          title="Conceptos clave del tiempo geológico"
          subtitle="Lo esencial para entender la historia de la Tierra"
          defaultOpen={false}
        >
          <h3>¿Qué es un fósil?</h3>
          <p>
            Un fósil es cualquier evidencia de vida pasada preservada en las rocas. Puede ser un hueso
            mineralizado, una impresión en la roca, una huella, excrementos petrificados (coprolitos),
            o incluso organismos completos conservados en ámbar, hielo o alquitrán. La mayoría de fósiles
            se forman cuando un organismo queda enterrado rápidamente en sedimentos que se litifican.
          </p>

          <h3>Escala geológica: eones, eras, períodos y épocas</h3>
          <p>
            El tiempo geológico se divide jerárquicamente. Los <em>eones</em> son las divisiones más
            grandes (Hádico, Arcaico, Proterozoico, Fanerozoico). Los eones se dividen en <em>eras</em>
            (Paleozoico, Mesozoico, Cenozoico), las eras en <em>períodos</em> (Cámbrico, Jurásico...)
            y los períodos en <em>épocas</em> (Pleistoceno, Holoceno). Esta estructura permite ubicar
            cualquier evento con precisión.
          </p>

          <h3>La Explosión Cámbrica: el misterio</h3>
          <p>
            Hace 541 Ma, en apenas 20 millones de años, aparecen casi todos los planes corporales
            animales conocidos. Es uno de los mayores misterios de la biología evolutiva. Las hipótesis
            incluyen: aumento de oxígeno, evolución de los ojos (carrera armamentística depredador-presa),
            y la aparición de colágeno y otras moléculas estructurales complejas.
          </p>

          <h3>Datación absoluta vs relativa</h3>
          <p>
            La datación <em>relativa</em> ordena los eventos (qué pasó antes y después) usando
            estratigrafía y fósiles guía. La datación <em>absoluta</em> da una edad numérica usando
            isótopos radiactivos (carbono-14, potasio-argón, uranio-plomo). En la práctica, los
            paleontólogos combinan ambas: usan la posición estratigráfica del fósil y datan las
            rocas volcánicas más cercanas con métodos radiométricos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota pedagógica:</strong> las fechas geológicas son aproximaciones basadas en
            datación radiométrica y correlación estratigráfica. Los rangos exactos varían ligeramente
            según la fuente. Los datos presentados siguen la Escala Cronoestratigráfica Internacional
            (ICS, 2023) y publicaciones de referencia.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-fosiles-tiempo-geologico')} />
        <ShareCard appName="visualizador-fosiles-tiempo-geologico" />
        <Footer appName="visualizador-fosiles-tiempo-geologico" />
      </div>
    </>
  );
}
