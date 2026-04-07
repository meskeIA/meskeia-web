'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CapasTierra.module.css';
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

type TabId = 'capas' | 'sismicas' | 'magnetico' | 'datos';

interface CapaInfo {
  id: string;
  nombre: string;
  espesor: string;
  temperatura: string;
  composicion: string;
  estado: string;
  presion: string;
  color: string;
  colorOscuro: string;
  detalle: string;
}

interface Discontinuidad {
  nombre: string;
  profundidad: string;
  entre: string;
  descripcion: string;
}

interface DatoFascinante {
  icono: string;
  cifra: string;
  titulo: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const TABS: { id: TabId; label: string; icono: string }[] = [
  { id: 'capas', label: 'Las Capas', icono: '🌍' },
  { id: 'sismicas', label: 'Cómo lo Sabemos', icono: '🔬' },
  { id: 'magnetico', label: 'Campo Magnético', icono: '🧲' },
  { id: 'datos', label: 'Datos Fascinantes', icono: '💎' },
];

const CAPAS: CapaInfo[] = [
  {
    id: 'corteza',
    nombre: 'Corteza',
    espesor: '5–70 km',
    temperatura: '15 °C (superficie) – 500 °C',
    composicion: 'Oceánica: basalto (5–10 km). Continental: granito (30–70 km)',
    estado: 'Sólido rígido',
    presion: '0–1 GPa',
    color: '#8B6914',
    colorOscuro: '#A07D1A',
    detalle: 'La corteza es la capa más fina y la única que hemos podido explorar directamente. Se divide en corteza oceánica (más densa y delgada, formada por basalto) y corteza continental (menos densa y más gruesa, formada por granito). Juntas forman las placas tectónicas.',
  },
  {
    id: 'manto',
    nombre: 'Manto',
    espesor: '2.900 km',
    temperatura: '500 °C – 3.700 °C',
    composicion: 'Silicatos de hierro y magnesio (peridotita)',
    estado: 'Manto superior rígido + manto inferior viscoso (plástico)',
    presion: '1–140 GPa',
    color: '#D2691E',
    colorOscuro: '#E8842A',
    detalle: 'El manto representa el 84% del volumen terrestre. El manto superior es rígido y junto con la corteza forma la litosfera. Debajo, la astenosfera es parcialmente fundida y permite el movimiento de las placas tectónicas. El manto inferior es más viscoso por la enorme presión, y convecciona lentamente a ~2 cm/año.',
  },
  {
    id: 'nucleo-externo',
    nombre: 'Núcleo externo',
    espesor: '2.200 km',
    temperatura: '3.700 °C – 5.000 °C',
    composicion: 'Hierro-níquel líquido con azufre y oxígeno',
    estado: 'Líquido',
    presion: '140–330 GPa',
    color: '#CC0000',
    colorOscuro: '#E03030',
    detalle: 'El núcleo externo es la única capa completamente líquida. Su hierro-níquel fundido, al circular por convección, genera corrientes eléctricas que producen el campo magnético terrestre (efecto dinamo). Sin esta capa líquida, la Tierra no tendría campo magnético y sería vulnerable al viento solar.',
  },
  {
    id: 'nucleo-interno',
    nombre: 'Núcleo interno',
    espesor: '1.220 km (radio)',
    temperatura: '~5.400 °C',
    composicion: 'Hierro-níquel sólido cristalino',
    estado: 'Sólido (por la enorme presión)',
    presion: '330–360 GPa',
    color: '#FFB800',
    colorOscuro: '#FFCC33',
    detalle: 'El núcleo interno está tan caliente como la superficie del Sol (~5.400 °C), pero la presión es tan inmensa (3,6 millones de atmósferas) que el hierro se mantiene sólido. Se descubrió en 1936 por la sismóloga danesa Inge Lehmann al analizar ondas sísmicas que no deberían haber llegado a ciertas estaciones.',
  },
];

const DISCONTINUIDADES: Discontinuidad[] = [
  {
    nombre: 'Mohorovičić (Moho)',
    profundidad: '5–70 km',
    entre: 'Corteza / Manto',
    descripcion: 'Descubierta en 1909 por Andrija Mohorovičić. Las ondas sísmicas aceleran bruscamente al cruzarla, indicando un cambio de densidad.',
  },
  {
    nombre: 'Gutenberg',
    profundidad: '2.900 km',
    entre: 'Manto / Núcleo externo',
    descripcion: 'Las ondas S desaparecen (no viajan por líquidos) y las P se desvían bruscamente. Descubierta por Beno Gutenberg en 1914.',
  },
  {
    nombre: 'Lehmann',
    profundidad: '5.150 km',
    entre: 'Núcleo externo / Núcleo interno',
    descripcion: 'Inge Lehmann detectó ondas P inesperadas en la zona de sombra, demostrando que existe un núcleo interno sólido dentro del líquido.',
  },
];

const DATOS_FASCINANTES: DatoFascinante[] = [
  {
    icono: '🌍',
    cifra: '6.371 km',
    titulo: 'Radio terrestre',
    descripcion: 'Pero solo hemos perforado 12,2 km (Pozo de Kola, Rusia) — apenas el 0,2% del camino al centro.',
  },
  {
    icono: '🌡️',
    cifra: '5.400 °C',
    titulo: 'Temperatura del centro',
    descripcion: 'Más caliente que la superficie del Sol (5.500 °C). Conocemos la temperatura por modelos de alta presión y ondas sísmicas.',
  },
  {
    icono: '🧲',
    cifra: '~65.000 km',
    titulo: 'Extensión del campo magnético',
    descripcion: 'La magnetosfera se extiende unas 10 veces el radio terrestre hacia el espacio, desviando el viento solar.',
  },
  {
    icono: '⚖️',
    cifra: '70% de la Luna',
    titulo: 'Tamaño del núcleo interno',
    descripcion: 'El núcleo interno tiene un radio de 1.220 km, comparable al 70% del radio lunar (1.737 km).',
  },
  {
    icono: '🔄',
    cifra: '~2 cm/año',
    titulo: 'Velocidad de convección del manto',
    descripcion: 'El manto convecciona a la velocidad a la que crecen tus uñas. Eso es lo que mueve las placas tectónicas.',
  },
  {
    icono: '💎',
    cifra: 'Lluvia de diamantes',
    titulo: 'Posible en el manto inferior',
    descripcion: 'A presiones extremas, el carbono se cristaliza como diamante. Experimentos recientes lo confirman para planetas gigantes y posiblemente para el manto profundo.',
  },
  {
    icono: '📏',
    cifra: 'Más fina que la piel',
    titulo: 'La corteza terrestre',
    descripcion: 'Si la Tierra fuera una manzana, la corteza sería más fina que la piel. Todo lo que conocemos está en esa finísima capa.',
  },
];

const COMPARATIVA_PLANETAS = [
  { nombre: 'Tierra', icono: '🌍', nucleo: 'Fe-Ni sólido + líquido', campoMag: 'Sí (fuerte)', atmosfera: 'Densa, protegida' },
  { nombre: 'Marte', icono: '🔴', nucleo: 'Fe-S parcialmente líquido', campoMag: 'No (perdido)', atmosfera: 'Muy fina, erosionada' },
  { nombre: 'Venus', icono: '🟡', nucleo: 'Fe-Ni (probablemente líquido)', campoMag: 'No (sin rotación rápida)', atmosfera: 'Extremadamente densa' },
];

// ─────────────────────────────────────────────
// Componentes SVG
// ─────────────────────────────────────────────

function SvgCapasTierra({ capaActiva, onCapaClick }: { capaActiva: string | null; onCapaClick: (id: string) => void }) {
  // Semicírculo — radios proporcionales a escala relativa
  // Radio total = 200 (6.371 km)
  // Núcleo interno: 1.220/6.371 = 38.3 → r=38
  // Núcleo externo: (1.220+2.200)/6.371 = 53.7% → r=107
  // Manto: (1.220+2.200+2.900)/6.371 = 99.2% → r=198
  // Corteza: ~200

  const cx = 200;
  const cy = 200;

  const capas = [
    { id: 'corteza', r: 200, color: '#8B6914', hoverColor: '#A5801F' },
    { id: 'manto', r: 198, color: '#D2691E', hoverColor: '#E88035' },
    { id: 'nucleo-externo', r: 107, color: '#CC0000', hoverColor: '#EE2222' },
    { id: 'nucleo-interno', r: 38, color: '#FFB800', hoverColor: '#FFD040' },
  ];

  return (
    <svg viewBox="0 0 400 220" className={styles.svgCapas} role="img" aria-label="Sección transversal de las capas de la Tierra">
      {/* Arcos semicirculares de fuera a dentro */}
      {capas.map(capa => {
        const activa = capaActiva === capa.id;
        return (
          <path
            key={capa.id}
            d={`M ${cx - capa.r} ${cy} A ${capa.r} ${capa.r} 0 0 1 ${cx + capa.r} ${cy} L ${cx - capa.r} ${cy} Z`}
            fill={activa ? capa.hoverColor : capa.color}
            stroke={activa ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
            strokeWidth={activa ? 3 : 1}
            style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
            onClick={() => onCapaClick(capa.id)}
            role="button"
            tabIndex={0}
            aria-label={`Capa: ${CAPAS.find(c => c.id === capa.id)?.nombre}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCapaClick(capa.id); } }}
          />
        );
      })}
      {/* Etiquetas */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="9" fontWeight="700">Núcleo</text>
      <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize="8">interno</text>
      <text x={cx} y={cy - 50} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">Núcleo ext.</text>
      <text x={cx} y={cy - 120} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">Manto</text>
      <text x={cx} y={cy - 185} textAnchor="middle" fill="white" fontSize="9" fontWeight="600">Corteza</text>
    </svg>
  );
}

function SvgOndasSismicas() {
  return (
    <svg viewBox="0 0 400 250" className={styles.svgOndas} role="img" aria-label="Diagrama de ondas sísmicas viajando por el interior de la Tierra">
      {/* Tierra simplificada */}
      <circle cx="200" cy="250" r="200" fill="#D2691E" opacity="0.3" />
      <circle cx="200" cy="250" r="107" fill="#CC0000" opacity="0.3" />
      <circle cx="200" cy="250" r="38" fill="#FFB800" opacity="0.4" />

      {/* Epicentro */}
      <circle cx="60" cy="52" r="8" fill="#E74C3C" />
      <text x="60" y="40" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">Terremoto</text>

      {/* Onda P (atraviesa todo) */}
      <path d="M 68 55 Q 150 180 200 200 Q 250 180 340 70" fill="none" stroke="#2E86AB" strokeWidth="2.5" strokeDasharray="6,3" />
      <text x="320" y="55" fill="#2E86AB" fontSize="9" fontWeight="700">Onda P</text>
      <text x="320" y="67" fill="#2E86AB" fontSize="7">Atraviesa todo</text>

      {/* Onda S (se detiene en núcleo externo) */}
      <path d="M 68 58 Q 130 150 160 170" fill="none" stroke="#48A9A6" strokeWidth="2.5" />
      <circle cx="160" cy="170" r="5" fill="#E74C3C" />
      <text x="100" y="185" fill="#48A9A6" fontSize="9" fontWeight="700">Onda S</text>
      <text x="85" y="197" fill="#E74C3C" fontSize="7">Se detiene (líquido)</text>

      {/* Zona de sombra */}
      <path d="M 270 55 A 200 200 0 0 0 330 80" fill="none" stroke="#999" strokeWidth="1.5" strokeDasharray="3,3" />
      <text x="310" y="100" fill="var(--text-muted)" fontSize="8">Zona de</text>
      <text x="310" y="112" fill="var(--text-muted)" fontSize="8">sombra</text>

      {/* Estación sísmica */}
      <rect x="335" y="42" width="12" height="16" fill="var(--text-secondary)" rx="2" />
      <line x1="341" y1="42" x2="341" y2="30" stroke="var(--text-secondary)" strokeWidth="1.5" />
      <text x="341" y="25" textAnchor="middle" fill="var(--text-secondary)" fontSize="7">Estación</text>
    </svg>
  );
}

function SvgCampoMagnetico() {
  return (
    <svg viewBox="0 0 400 280" className={styles.svgCampo} role="img" aria-label="Diagrama del campo magnético terrestre protegiendo la Tierra del viento solar">
      {/* Magnetosfera (forma asimétrica) */}
      <ellipse cx="180" cy="140" rx="160" ry="120" fill="rgba(46,134,171,0.08)" stroke="var(--primary)" strokeWidth="1" strokeDasharray="4,4" />

      {/* Tierra */}
      <circle cx="180" cy="140" r="40" fill="#2E86AB" />
      <circle cx="180" cy="140" r="15" fill="#CC0000" opacity="0.6" />
      <circle cx="180" cy="140" r="6" fill="#FFB800" />

      {/* Líneas de campo magnético */}
      <path d="M 180 100 C 130 60, 100 140, 180 180" fill="none" stroke="#48A9A6" strokeWidth="1.5" />
      <path d="M 180 100 C 230 60, 260 140, 180 180" fill="none" stroke="#48A9A6" strokeWidth="1.5" />
      <path d="M 180 90 C 110 30, 70 140, 180 190" fill="none" stroke="#48A9A6" strokeWidth="1" opacity="0.6" />
      <path d="M 180 90 C 250 30, 290 140, 180 190" fill="none" stroke="#48A9A6" strokeWidth="1" opacity="0.6" />

      {/* Polo N y S */}
      <text x="180" y="88" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="700">N</text>
      <text x="180" y="202" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="700">S</text>

      {/* Viento solar */}
      {[40, 65, 90, 115, 140, 165, 190, 215, 240].map(y => (
        <line key={y} x1="395" y1={y} x2="345" y2={y} stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" markerEnd="url(#flecha)" />
      ))}
      <defs>
        <marker id="flecha" markerWidth="6" markerHeight="4" refX="0" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#F59E0B" />
        </marker>
      </defs>
      <text x="380" y="260" textAnchor="middle" fill="#F59E0B" fontSize="9" fontWeight="600">Viento solar</text>

      {/* Aurora */}
      <ellipse cx="155" cy="102" rx="12" ry="4" fill="#48A9A6" opacity="0.5" />
      <ellipse cx="205" cy="102" rx="12" ry="4" fill="#48A9A6" opacity="0.5" />
      <text x="180" y="72" textAnchor="middle" fill="#48A9A6" fontSize="7">Auroras</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Barra de temperatura
// ─────────────────────────────────────────────

const TEMPERATURA_MARCAS = [
  { temp: '15 °C', label: 'Superficie', pos: 0 },
  { temp: '500 °C', label: 'Base corteza', pos: 8 },
  { temp: '3.700 °C', label: 'Base manto', pos: 58 },
  { temp: '5.000 °C', label: 'Núcleo ext.', pos: 80 },
  { temp: '5.400 °C', label: 'Centro', pos: 100 },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCapasTierraPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('capas');
  const [capaActiva, setCapaActiva] = useState<string | null>(null);
  const [discoActiva, setDiscoActiva] = useState<string | null>(null);

  const toggleCapa = (id: string) => {
    setCapaActiva(prev => (prev === id ? null : id));
  };

  const toggleDisco = (nombre: string) => {
    setDiscoActiva(prev => (prev === nombre ? null : nombre));
  };

  const capaSeleccionada = CAPAS.find(c => c.id === capaActiva);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <div className={styles.heroIcono} aria-hidden="true">🌍</div>
          <h1 className={styles.title}>Capas de la Tierra</h1>
          <p className={styles.subtitle}>
            Del suelo que pisas al núcleo de fuego a 5.400 °C — viaje al interior del planeta
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

        {/* ═══════════════ TAB 1: Las Capas ═══════════════ */}
        {tabActiva === 'capas' && (
          <section className={styles.tabContent} aria-label="Las capas de la Tierra">
            <p className={styles.introText}>
              Toca cada capa del diagrama o los bloques de abajo para ver sus datos.
            </p>

            <div className={styles.capasLayout}>
              <div className={styles.svgWrapper}>
                <SvgCapasTierra capaActiva={capaActiva} onCapaClick={toggleCapa} />
              </div>

              {/* Barra de temperatura */}
              <div className={styles.tempBar}>
                <div className={styles.tempLabel}>Temperatura</div>
                <div className={styles.tempGradient}>
                  {TEMPERATURA_MARCAS.map(marca => (
                    <div
                      key={marca.label}
                      className={styles.tempMarca}
                      style={{ bottom: `${marca.pos}%` }}
                    >
                      <span className={styles.tempTemp}>{marca.temp}</span>
                      <span className={styles.tempNombre}>{marca.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de info de capa seleccionada */}
            {capaSeleccionada && (
              <div
                className={styles.capaPanel}
                style={{ borderLeftColor: capaSeleccionada.color }}
                role="region"
                aria-label={`Información de ${capaSeleccionada.nombre}`}
              >
                <h3 className={styles.capaPanelTitulo} style={{ color: capaSeleccionada.color }}>
                  {capaSeleccionada.nombre}
                </h3>
                <div className={styles.capaDatos}>
                  <div className={styles.capaDato}><strong>Espesor:</strong> {capaSeleccionada.espesor}</div>
                  <div className={styles.capaDato}><strong>Temperatura:</strong> {capaSeleccionada.temperatura}</div>
                  <div className={styles.capaDato}><strong>Composición:</strong> {capaSeleccionada.composicion}</div>
                  <div className={styles.capaDato}><strong>Estado:</strong> {capaSeleccionada.estado}</div>
                  <div className={styles.capaDato}><strong>Presión:</strong> {capaSeleccionada.presion}</div>
                </div>
                <p className={styles.capaDetalle}>{capaSeleccionada.detalle}</p>
              </div>
            )}

            {/* Bloques de capas clickables */}
            <div className={styles.capasGrid}>
              {CAPAS.map(capa => (
                <button
                  key={capa.id}
                  type="button"
                  className={`${styles.capaCard} ${capaActiva === capa.id ? styles.capaCardActiva : ''}`}
                  onClick={() => toggleCapa(capa.id)}
                  style={{ borderLeftColor: capa.color }}
                  aria-expanded={capaActiva === capa.id}
                >
                  <span className={styles.capaIndicador} style={{ background: capa.color }} aria-hidden="true" />
                  <span className={styles.capaNombre}>{capa.nombre}</span>
                  <span className={styles.capaEspesor}>{capa.espesor}</span>
                </button>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Perspectiva:</strong> si la Tierra fuera un melocotón, la corteza sería la piel.
                Todo lo que la humanidad ha construido, explorado y conocido está en esa finísima capa.
              </p>
            </div>
          </section>
        )}

        {/* ═══════════════ TAB 2: Cómo lo Sabemos ═══════════════ */}
        {tabActiva === 'sismicas' && (
          <section className={styles.tabContent} aria-label="Cómo sabemos lo que hay dentro">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🔬</span> Ondas Sísmicas: la Radiografía del Planeta
            </h2>
            <p className={styles.seccionSubtitulo}>
              Nadie ha visto el núcleo. Todo lo sabemos por las ondas sísmicas.
            </p>

            <div className={styles.svgWrapper}>
              <SvgOndasSismicas />
            </div>

            <div className={styles.ondasGrid}>
              <div className={styles.ondaCard}>
                <div className={styles.ondaHeader} style={{ borderLeftColor: '#2E86AB' }}>
                  <strong>Ondas P</strong> (Primarias)
                </div>
                <p>Ondas longitudinales de compresión. Viajan por sólidos <strong>y</strong> líquidos. Son las primeras en llegar a las estaciones sísmicas (más rápidas: 5–13 km/s).</p>
              </div>
              <div className={styles.ondaCard}>
                <div className={styles.ondaHeader} style={{ borderLeftColor: '#48A9A6' }}>
                  <strong>Ondas S</strong> (Secundarias)
                </div>
                <p>Ondas transversales de cizalla. <strong>NO atraviesan líquidos.</strong> Así descubrimos que el núcleo externo es líquido: las ondas S desaparecen al llegar a 2.900 km de profundidad.</p>
              </div>
            </div>

            <div className={styles.zonaSection}>
              <h3 className={styles.subTitulo}>Zona de Sombra Sísmica</h3>
              <p className={styles.zonaSombra}>
                Entre 104° y 140° del epicentro, las estaciones no reciben ondas directas. Las ondas P se
                desvían al pasar del manto al núcleo líquido, y las ondas S simplemente desaparecen.
                Esta &quot;zona de sombra&quot; fue la primera prueba de que el núcleo externo es líquido.
              </p>
            </div>

            <h3 className={styles.subTitulo}>
              <span aria-hidden="true">📍</span> Discontinuidades
            </h3>
            <p className={styles.seccionSubtitulo}>
              Fronteras entre capas donde las ondas cambian bruscamente
            </p>

            <div className={styles.discoGrid}>
              {DISCONTINUIDADES.map(disco => (
                <article key={disco.nombre} className={styles.discoCard}>
                  <button
                    type="button"
                    className={`${styles.discoHeader} ${discoActiva === disco.nombre ? styles.discoHeaderActivo : ''}`}
                    onClick={() => toggleDisco(disco.nombre)}
                    aria-expanded={discoActiva === disco.nombre}
                  >
                    <span className={styles.discoNombre}>{disco.nombre}</span>
                    <span className={styles.discoProf}>{disco.profundidad}</span>
                    <span className={`${styles.discoChevron} ${discoActiva === disco.nombre ? styles.discoChevronAbierto : ''}`} aria-hidden="true">▼</span>
                  </button>
                  {discoActiva === disco.nombre && (
                    <div className={styles.discoDetalle}>
                      <p className={styles.discoEntre}><strong>Entre:</strong> {disco.entre}</p>
                      <p>{disco.descripcion}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Clave:</strong> nadie ha visto el núcleo. Todo lo que sabemos del interior
                de la Tierra proviene de las ondas sísmicas, exactamente igual que un médico
                usa ultrasonidos para &quot;ver&quot; el interior de un cuerpo.
              </p>
            </div>
          </section>
        )}

        {/* ═══════════════ TAB 3: Campo Magnético ═══════════════ */}
        {tabActiva === 'magnetico' && (
          <section className={styles.tabContent} aria-label="Campo magnético terrestre">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">🧲</span> El Escudo Invisible de la Tierra
            </h2>
            <p className={styles.seccionSubtitulo}>
              El campo magnético es lo que hace habitable la Tierra.
            </p>

            <div className={styles.svgWrapper}>
              <SvgCampoMagnetico />
            </div>

            <div className={styles.magGrid}>
              <div className={styles.magCard}>
                <h3 className={styles.magCardTitulo}>Efecto Dinamo</h3>
                <p>
                  El núcleo externo líquido (hierro-níquel fundido) circula por convección.
                  Estas corrientes de metal conductor generan corrientes eléctricas que, a su vez,
                  producen el campo magnético terrestre. Es un ciclo autosostenido que lleva
                  funcionando más de 3.500 millones de años.
                </p>
              </div>
              <div className={styles.magCard}>
                <h3 className={styles.magCardTitulo}>Escudo contra el Viento Solar</h3>
                <p>
                  El Sol emite un flujo constante de partículas cargadas (viento solar) a
                  400–800 km/s. La magnetosfera las desvía, protegiendo la atmósfera terrestre.
                  Cuando algunas partículas se cuelan por los polos, producen las auroras boreales y australes.
                </p>
              </div>
            </div>

            <div className={styles.comparativaSection}>
              <h3 className={styles.subTitulo}>
                <span aria-hidden="true">🔴</span> Tierra vs Marte: lo que pasa sin campo magnético
              </h3>
              <p className={styles.comparativaDesc}>
                Marte tuvo campo magnético hace ~4.000 millones de años, pero su núcleo se enfrió
                y perdió la dinamo. Sin protección, el viento solar erosionó su atmósfera durante
                miles de millones de años. Resultado: presión atmosférica 170 veces menor que la
                terrestre y sin agua líquida en superficie.
              </p>
              <div className={styles.planetasGrid}>
                {COMPARATIVA_PLANETAS.map(p => (
                  <div key={p.nombre} className={styles.planetaCard}>
                    <span className={styles.planetaIcono} aria-hidden="true">{p.icono}</span>
                    <span className={styles.planetaNombre}>{p.nombre}</span>
                    <div className={styles.planetaDatos}>
                      <span><strong>Núcleo:</strong> {p.nucleo}</span>
                      <span><strong>Campo mag.:</strong> {p.campoMag}</span>
                      <span><strong>Atmósfera:</strong> {p.atmosfera}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.inversionesSection}>
              <h3 className={styles.subTitulo}>Inversiones Magnéticas</h3>
              <p>
                El norte y sur magnéticos se han invertido unas 170 veces en los últimos
                76 millones de años. La última inversión completa (Brunhes-Matuyama) ocurrió
                hace ~780.000 años. Las inversiones tardan entre 1.000 y 10.000 años en completarse
                y durante el proceso el campo se debilita significativamente.
              </p>
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Reflexión:</strong> si el núcleo externo se solidificara (como ocurrió en Marte),
                perderíamos el campo magnético. Sin él, el viento solar erosionaría nuestra atmósfera
                y la vida en superficie sería prácticamente imposible.
              </p>
            </div>
          </section>
        )}

        {/* ═══════════════ TAB 4: Datos Fascinantes ═══════════════ */}
        {tabActiva === 'datos' && (
          <section className={styles.tabContent} aria-label="Datos fascinantes sobre la Tierra">
            <h2 className={styles.seccionTitulo}>
              <span aria-hidden="true">💎</span> Datos que te Cambiarán la Perspectiva
            </h2>

            <div className={styles.datosGrid}>
              {DATOS_FASCINANTES.map(dato => (
                <div key={dato.titulo} className={styles.datoCard}>
                  <span className={styles.datoIcono} aria-hidden="true">{dato.icono}</span>
                  <div className={styles.datoTexto}>
                    <span className={styles.datoCifra}>{dato.cifra}</span>
                    <span className={styles.datoTitulo}>{dato.titulo}</span>
                    <p className={styles.datoDesc}>{dato.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.comparativaSection}>
              <h3 className={styles.subTitulo}>
                <span aria-hidden="true">🪐</span> Capas de la Tierra vs Otros Planetas
              </h3>
              <div className={styles.planetasGrid}>
                {COMPARATIVA_PLANETAS.map(p => (
                  <div key={`datos-${p.nombre}`} className={styles.planetaCard}>
                    <span className={styles.planetaIcono} aria-hidden="true">{p.icono}</span>
                    <span className={styles.planetaNombre}>{p.nombre}</span>
                    <div className={styles.planetaDatos}>
                      <span><strong>Núcleo:</strong> {p.nucleo}</span>
                      <span><strong>Campo mag.:</strong> {p.campoMag}</span>
                      <span><strong>Atmósfera:</strong> {p.atmosfera}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.insight}>
              <p>
                <strong>Lo más asombroso:</strong> todo lo que sabemos sobre el interior de la Tierra
                lo hemos deducido sin poder verlo jamás. Ningún ser humano ni máquina ha pasado
                de los 12 km de profundidad. Los 6.359 km restantes los conocemos solo por ondas,
                modelos y experimentación a alta presión.
              </p>
            </div>
          </section>
        )}

        <EducationalSection
          title="Conceptos clave de la estructura terrestre"
          subtitle="Lo esencial para entender las capas de la Tierra"
          defaultOpen={false}
        >
          <h3>Litosfera vs Astenosfera</h3>
          <p>
            La división en corteza-manto-núcleo es <em>composicional</em> (por material). Pero
            existe otra clasificación <em>mecánica</em>: la litosfera (corteza + manto superior rígido,
            ~100 km) y la astenosfera (manto parcialmente fundido, ~100-300 km). Las placas tectónicas
            son fragmentos de litosfera que &quot;flotan&quot; sobre la astenosfera.
          </p>

          <h3>¿Por qué el núcleo interno es sólido si está más caliente?</h3>
          <p>
            El estado de un material depende de la temperatura Y la presión. A 360 GPa (3,6 millones
            de atmósferas), el hierro permanece sólido aunque esté a 5.400 °C. Es el mismo principio
            por el que el agua hierve a menos temperatura en la montaña (menos presión) y a más
            temperatura en una olla a presión.
          </p>

          <h3>El Proyecto Mohole y el Pozo de Kola</h3>
          <p>
            En 1961, EE.UU. intentó perforar hasta la discontinuidad de Moho (Proyecto Mohole),
            pero se canceló en 1966 por costes. La URSS perforó el Pozo Superprofundo de Kola
            durante 19 años (1970-1989), alcanzando 12.262 metros — el récord absoluto. A esa
            profundidad la temperatura era de 180 °C y las rocas se comportaban como plástico,
            haciendo imposible seguir perforando.
          </p>

          <h3>Tectónica de placas y convección del manto</h3>
          <p>
            El calor del núcleo calienta el manto inferior, creando corrientes de convección
            que ascienden lentamente (~2 cm/año). Este movimiento arrastra las placas tectónicas,
            causando terremotos, volcanes y la formación de montañas. Es el motor geológico
            que ha remodelado la superficie terrestre durante miles de millones de años.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota pedagógica:</strong> los valores de temperatura y presión son estimaciones
            basadas en modelos sísmicos y experimentos de alta presión en laboratorio. Los rangos
            exactos varían según la fuente. Los datos presentados corresponden al modelo PREM
            (Preliminary Reference Earth Model) y publicaciones recientes de referencia.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-capas-tierra')} />
        <ShareCard appName="visualizador-capas-tierra" />
        <Footer appName="visualizador-capas-tierra" />
      </div>
    </>
  );
}
