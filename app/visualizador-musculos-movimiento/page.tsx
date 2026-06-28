'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './MusculosMovimiento.module.css';
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

type Seccion = 'tipos' | 'contraccion' | 'articulaciones' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'tipos', titulo: 'Tipos de músculo', icono: '💪', subtitulo: 'Esquelético, liso y cardíaco' },
  { id: 'contraccion', titulo: 'Contracción', icono: '⚡', subtitulo: 'Sarcómero y filamentos deslizantes' },
  { id: 'articulaciones', titulo: 'Articulaciones', icono: '🦴', subtitulo: 'Tipos y sistema de palancas' },
  { id: 'datos', titulo: 'Datos y curiosidades', icono: '🔬', subtitulo: 'Récords y mitos musculares' },
];

// ─────────────────────────────────────────────
// Datos: tipos de músculo
// ─────────────────────────────────────────────

interface TipoMusculo {
  id: string;
  nombre: string;
  icono: string;
  tag: string;
  tagColor: string;
  color: string;
  descripcion: string;
  ejemplos: string;
  dato: string;
  caracteristicas: string[];
}

const TIPOS_MUSCULO: TipoMusculo[] = [
  {
    id: 'esqueletico',
    nombre: 'Músculo esquelético',
    icono: '💪',
    tag: 'Voluntario · Estriado',
    tagColor: '#2E86AB',
    color: '#2E86AB',
    descripcion: 'Unido a los huesos por tendones. Tú decides cuándo contraerlo conscientemente. Sus fibras tienen un patrón estriado (bandas claras y oscuras) visible al microscopio.',
    ejemplos: 'Bíceps, cuádriceps, deltoides, abdominales, diafragma',
    dato: 'Representa el 40% del peso corporal. El cuerpo tiene más de 600 músculos esqueléticos. Se fatiga con el uso prolongado.',
    caracteristicas: ['Contracción rápida y potente', 'Control nervioso motor (voluntario)', 'Fibras multinucleadas muy largas', 'Se fatiga con el esfuerzo'],
  },
  {
    id: 'liso',
    nombre: 'Músculo liso',
    icono: '🫁',
    tag: 'Involuntario · No estriado',
    tagColor: '#48A9A6',
    color: '#48A9A6',
    descripcion: 'Forma las paredes de los órganos huecos. Se contrae sin que lo pienses, de forma lenta y sostenida. No tiene el patrón de bandas del esquelético.',
    ejemplos: 'Paredes del estómago, intestinos, vasos sanguíneos, útero, vejiga',
    dato: 'Sus contracciones peristálticas mueven el alimento a lo largo del tubo digestivo. No se fatiga.',
    caracteristicas: ['Contracción lenta y sostenida', 'Control del sistema nervioso autónomo', 'Células fusiformes con un solo núcleo', 'No se fatiga'],
  },
  {
    id: 'cardiaco',
    nombre: 'Músculo cardíaco',
    icono: '❤️',
    tag: 'Involuntario · Estriado',
    tagColor: '#e74c3c',
    color: '#e74c3c',
    descripcion: 'Solo existe en el corazón. Tiene patrón estriado como el esquelético, pero se contrae involuntariamente. Sus células están conectadas por discos intercalares que sincronizan el latido.',
    ejemplos: 'Miocardio (pared del corazón)',
    dato: 'Se contrae unas ' + formatNumber(100000, 0) + ' veces al día sin parar. Tiene su propio marcapasos: el nodo sinoauricular genera impulsos eléctricos sin necesitar al cerebro. Nunca se fatiga.',
    caracteristicas: ['Autoexcitable (marcapasos propio)', 'Discos intercalares sincronizan células', 'Estriado pero involuntario', 'Nunca se fatiga en toda la vida'],
  },
];

// ─────────────────────────────────────────────
// Datos: pasos de contracción muscular
// ─────────────────────────────────────────────

interface PasoContraccion {
  num: number;
  icono: string;
  titulo: string;
  descripcion: string;
  detalle: string;
}

const PASOS_CONTRACCION: PasoContraccion[] = [
  {
    num: 1,
    icono: '🧠',
    titulo: 'Señal nerviosa',
    descripcion: 'El cerebro envía un impulso eléctrico por el nervio motor hasta la unión neuromuscular.',
    detalle: 'La acetilcolina se libera en la placa motora y despolariza la membrana de la fibra muscular.',
  },
  {
    num: 2,
    icono: '🟡',
    titulo: 'Liberación de Ca²⁺',
    descripcion: 'El impulso viaja por los túbulos T y provoca que el retículo sarcoplásmico libere calcio.',
    detalle: 'Los iones Ca²⁺ inundan el sarcoplasma y se unen a la troponina en los filamentos finos.',
  },
  {
    num: 3,
    icono: '🔓',
    titulo: 'Troponina descubre sitio activo',
    descripcion: 'El Ca²⁺ cambia la forma de la troponina, que mueve la tropomiosina y expone los sitios de unión en la actina.',
    detalle: 'Sin Ca²⁺, la tropomiosina bloquea los sitios activos y la contracción es imposible.',
  },
  {
    num: 4,
    icono: '🤝',
    titulo: 'Miosina se une a actina',
    descripcion: 'La cabeza de miosina (ya cargada con ATP → ADP + Pi) se engancha al sitio activo de la actina formando un puente cruzado.',
    detalle: 'Este es el enlace que permitirá generar fuerza mecánica.',
  },
  {
    num: 5,
    icono: '⚡',
    titulo: 'Golpe de potencia',
    descripcion: 'La miosina libera ADP y Pi, y su cabeza pivota tirando de la actina hacia el centro del sarcómero.',
    detalle: 'El sarcómero se acorta → las miofibrillas se acortan → el músculo se contrae.',
  },
  {
    num: 6,
    icono: '🔋',
    titulo: 'ATP suelta miosina',
    descripcion: 'Una nueva molécula de ATP se une a la miosina, que se despega de la actina. El ATP se hidroliza y la cabeza vuelve a posición "cargada".',
    detalle: 'El ciclo se repite mientras haya Ca²⁺ y ATP disponibles. Sin ATP → la miosina no puede soltar la actina → rigor mortis.',
  },
];

// ─────────────────────────────────────────────
// Datos: articulaciones
// ─────────────────────────────────────────────

interface Articulacion {
  id: string;
  nombre: string;
  icono: string;
  ejemplo: string;
  descripcion: string;
  movimiento: string;
  dato: string;
}

const ARTICULACIONES: Articulacion[] = [
  {
    id: 'bisagra',
    nombre: 'Bisagra',
    icono: '📐',
    ejemplo: 'Codo, rodilla',
    descripcion: 'Solo permite flexión y extensión en un plano, como una puerta. Un hueso envuelve al otro en forma cilíndrica.',
    movimiento: 'Flexión / Extensión (1 eje)',
    dato: 'La rodilla es la articulación más grande del cuerpo y soporta hasta 6 veces tu peso corporal al saltar.',
  },
  {
    id: 'esferica',
    nombre: 'Esférica',
    icono: '🔵',
    ejemplo: 'Hombro, cadera',
    descripcion: 'Una cabeza esférica encaja en una cavidad cóncava. Permite movimiento en todos los ejes: la más móvil del cuerpo.',
    movimiento: 'Todos los ejes (3D)',
    dato: 'El hombro sacrifica estabilidad por movilidad: es la articulación que más se luxa.',
  },
  {
    id: 'pivote',
    nombre: 'Pivote',
    icono: '🔄',
    ejemplo: 'Cuello (atlas-axis)',
    descripcion: 'Un hueso gira alrededor de otro como un eje. Permite rotación sin desplazamiento lateral.',
    movimiento: 'Rotación (1 eje)',
    dato: 'La articulación atlas-axis permite girar la cabeza unos 180° en total (90° a cada lado).',
  },
  {
    id: 'silla',
    nombre: 'Silla de montar',
    icono: '🤏',
    ejemplo: 'Base del pulgar',
    descripcion: 'Dos superficies cóncavas-convexas encajan como un jinete en su silla. Permite movimiento en dos ejes pero no rotación pura.',
    movimiento: 'Flexión/extensión + abducción/aducción',
    dato: 'Es exclusiva de primates y permite la oposición del pulgar: agarrar herramientas con precisión.',
  },
  {
    id: 'deslizante',
    nombre: 'Deslizante',
    icono: '🖐️',
    ejemplo: 'Muñeca, tobillo',
    descripcion: 'Superficies planas que se deslizan una sobre otra. Rango de movimiento limitado pero permite ajustes finos.',
    movimiento: 'Deslizamiento multidireccional',
    dato: 'Los huesos carpianos de la muñeca forman 8 articulaciones deslizantes que trabajan en equipo.',
  },
];

// ─────────────────────────────────────────────
// Datos: curiosidades
// ─────────────────────────────────────────────

interface DatoCurioso {
  icono: string;
  titulo: string;
  valor: string;
  descripcion: string;
}

const DATOS_CURIOSOS: DatoCurioso[] = [
  {
    icono: '🦷',
    titulo: 'Más fuerte',
    valor: 'Masetero',
    descripcion: 'Fuerza de mordida de ~70 kg. Responsable de masticar, está a ambos lados de la mandíbula.',
  },
  {
    icono: '📏',
    titulo: 'Más largo',
    valor: 'Sartorio (~60 cm)',
    descripcion: 'Cruza el muslo en diagonal desde la cadera hasta la rodilla. Permite cruzar las piernas.',
  },
  {
    icono: '🔍',
    titulo: 'Más pequeño',
    valor: 'Estapedio (~1 mm)',
    descripcion: 'Dentro del oído medio, controla el estribo. Protege el oído de sonidos muy fuertes.',
  },
  {
    icono: '🍑',
    titulo: 'Más grande',
    valor: 'Glúteo mayor',
    descripcion: 'El más voluminoso del cuerpo. Fundamental para caminar erguido, subir escaleras y correr.',
  },
  {
    icono: '❤️',
    titulo: 'Bombeo diario',
    valor: formatNumber(7000, 0) + ' litros/día',
    descripcion: 'El corazón bombea toda la sangre del cuerpo (~5 litros) unas ' + formatNumber(1400, 0) + ' veces al día.',
  },
  {
    icono: '🥶',
    titulo: '¿Por qué temblar calienta?',
    valor: 'Termogénesis',
    descripcion: 'Temblar son contracciones involuntarias rápidas que generan calor. Cada contracción produce energía térmica como subproducto.',
  },
];

// ─────────────────────────────────────────────
// SVGs
// ─────────────────────────────────────────────

function SvgFibrasEsqueletico() {
  return (
    <svg viewBox="0 0 200 80" className={styles.musculoSvg} role="img" aria-label="Patrón de fibras del músculo esquelético: estriadas, paralelas, multinucleadas">
      {/* Fibras estriadas paralelas */}
      {[0, 20, 40, 60].map((y) => (
        <g key={y}>
          <rect x="10" y={y + 2} width="180" height="14" rx="3" fill="#2E86AB" opacity="0.15" />
          {/* Estriaciones */}
          {Array.from({ length: 18 }, (_, i) => (
            <line key={i} x1={20 + i * 10} y1={y + 2} x2={20 + i * 10} y2={y + 16} stroke="#2E86AB" strokeWidth="1" opacity="0.4" />
          ))}
          {/* Nucleos (multinucleados, perifericos) */}
          <ellipse cx="50" cy={y + 9} rx="6" ry="3" fill="#1a5276" opacity="0.7" />
          <ellipse cx="130" cy={y + 9} rx="6" ry="3" fill="#1a5276" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

function SvgFibrasLiso() {
  return (
    <svg viewBox="0 0 200 80" className={styles.musculoSvg} role="img" aria-label="Patrón de fibras del músculo liso: fusiformes, sin estriaciones, un solo núcleo">
      {/* Celulas fusiformes sin estriaciones */}
      {[0, 16, 32, 48, 64].map((y) => (
        <g key={y}>
          <ellipse cx="100" cy={y + 6} rx="85" ry="5" fill="#48A9A6" opacity="0.2" />
          {/* Nucleo central unico */}
          <ellipse cx={100 + (y % 32 === 0 ? 0 : 15)} cy={y + 6} rx="5" ry="3" fill="#2a7a78" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

function SvgFibrasCardiaco() {
  return (
    <svg viewBox="0 0 200 80" className={styles.musculoSvg} role="img" aria-label="Patrón de fibras del músculo cardíaco: estriadas ramificadas con discos intercalares">
      {/* Fibras ramificadas con discos intercalares */}
      {[0, 25, 50].map((y) => (
        <g key={y}>
          <rect x="10" y={y + 2} width="80" height="14" rx="3" fill="#e74c3c" opacity="0.15" />
          <rect x="95" y={y + 2} width="95" height="14" rx="3" fill="#e74c3c" opacity="0.15" />
          {/* Estriaciones */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`a${i}`} x1={20 + i * 10} y1={y + 2} x2={20 + i * 10} y2={y + 16} stroke="#e74c3c" strokeWidth="0.8" opacity="0.35" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`b${i}`} x1={100 + i * 10} y1={y + 2} x2={100 + i * 10} y2={y + 16} stroke="#e74c3c" strokeWidth="0.8" opacity="0.35" />
          ))}
          {/* Disco intercalar */}
          <line x1="92" y1={y} x2="92" y2={y + 18} stroke="#c0392b" strokeWidth="2.5" strokeDasharray="3,2" />
          {/* Nucleo central */}
          <ellipse cx="50" cy={y + 9} rx="5" ry="3" fill="#922b21" opacity="0.7" />
          <ellipse cx="140" cy={y + 9} rx="5" ry="3" fill="#922b21" opacity="0.7" />
          {/* Ramificacion */}
          {y < 50 && <line x1="170" y1={y + 16} x2="180" y2={y + 27} stroke="#e74c3c" strokeWidth="3" opacity="0.2" />}
        </g>
      ))}
    </svg>
  );
}

function SvgSarcomero() {
  return (
    <svg viewBox="0 0 500 200" className={styles.sarcomeroSvg} role="img" aria-label="Esquema del sarcómero: bandas A, I, H, líneas Z, filamentos de actina y miosina">
      {/* Fondo */}
      <rect x="0" y="30" width="500" height="120" fill="currentColor" opacity="0.03" rx="4" />

      {/* Lineas Z */}
      <line x1="50" y1="30" x2="50" y2="150" stroke="#2E86AB" strokeWidth="3" />
      <line x1="450" y1="30" x2="450" y2="150" stroke="#2E86AB" strokeWidth="3" />
      <text x="50" y="25" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="700">Línea Z</text>
      <text x="450" y="25" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="700">Línea Z</text>

      {/* Banda I (solo actina) */}
      <rect x="50" y="55" width="60" height="60" fill="#48A9A6" opacity="0.1" />
      <rect x="390" y="55" width="60" height="60" fill="#48A9A6" opacity="0.1" />
      <text x="80" y="170" textAnchor="middle" fill="#48A9A6" fontSize="10" fontWeight="600">Banda I</text>
      <text x="420" y="170" textAnchor="middle" fill="#48A9A6" fontSize="10" fontWeight="600">Banda I</text>

      {/* Banda A (miosina + overlap) */}
      <rect x="130" y="55" width="240" height="60" fill="#8e44ad" opacity="0.08" />
      <text x="250" y="170" textAnchor="middle" fill="#8e44ad" fontSize="10" fontWeight="600">Banda A</text>

      {/* Banda H (solo miosina) */}
      <rect x="200" y="55" width="100" height="60" fill="#e74c3c" opacity="0.08" />
      <text x="250" y="185" textAnchor="middle" fill="#e74c3c" fontSize="10" fontWeight="600">Banda H</text>

      {/* Linea M */}
      <line x1="250" y1="45" x2="250" y2="125" stroke="#e74c3c" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x="250" y="195" textAnchor="middle" fill="#e74c3c" fontSize="9">Línea M</text>

      {/* Filamentos de actina (finos) - desde Z */}
      {[65, 80, 95, 105].map((y) => (
        <g key={`actina-${y}`}>
          <line x1="50" y1={y} x2="220" y2={y} stroke="#48A9A6" strokeWidth="2.5" />
          <line x1="280" y1={y} x2="450" y2={y} stroke="#48A9A6" strokeWidth="2.5" />
        </g>
      ))}

      {/* Filamentos de miosina (gruesos) - centro */}
      {[72, 90, 100].map((y) => (
        <line key={`miosina-${y}`} x1="130" y1={y} x2="370" y2={y} stroke="#8e44ad" strokeWidth="5" opacity="0.6" />
      ))}

      {/* Cabezas de miosina (puentes cruzados) */}
      {[160, 185, 210, 290, 315, 340].map((x) => (
        <g key={`cabeza-${x}`}>
          <line x1={x} y1="72" x2={x + (x < 250 ? -8 : 8)} y2="65" stroke="#8e44ad" strokeWidth="1.5" />
          <circle cx={x + (x < 250 ? -8 : 8)} cy="64" r="3" fill="#8e44ad" />
          <line x1={x} y1="100" x2={x + (x < 250 ? -8 : 8)} y2="107" stroke="#8e44ad" strokeWidth="1.5" />
          <circle cx={x + (x < 250 ? -8 : 8)} cy="108" r="3" fill="#8e44ad" />
        </g>
      ))}

      {/* Leyenda */}
      <rect x="50" y="140" width="12" height="4" fill="#48A9A6" rx="1" />
      <text x="67" y="144" fill="currentColor" fontSize="9">Actina (fino)</text>
      <rect x="160" y="140" width="12" height="4" fill="#8e44ad" rx="1" />
      <text x="177" y="144" fill="currentColor" fontSize="9">Miosina (grueso)</text>
    </svg>
  );
}

function SvgArticulacionBisagra() {
  return (
    <svg viewBox="0 0 80 80" width="60" height="60" role="img" aria-label="Articulación de bisagra">
      <rect x="30" y="5" width="20" height="30" rx="4" fill="#2E86AB" opacity="0.3" />
      <rect x="30" y="45" width="20" height="30" rx="4" fill="#48A9A6" opacity="0.3" />
      <circle cx="40" cy="40" r="8" fill="none" stroke="#2E86AB" strokeWidth="2" />
      <circle cx="40" cy="40" r="3" fill="#2E86AB" />
    </svg>
  );
}

function SvgArticulacionEsferica() {
  return (
    <svg viewBox="0 0 80 80" width="60" height="60" role="img" aria-label="Articulación esférica">
      <path d="M25 40 Q25 20 40 20 Q55 20 55 40" fill="#2E86AB" opacity="0.2" stroke="#2E86AB" strokeWidth="1.5" />
      <circle cx="40" cy="42" r="12" fill="#48A9A6" opacity="0.3" stroke="#48A9A6" strokeWidth="1.5" />
      <circle cx="40" cy="42" r="4" fill="#2E86AB" />
      <rect x="32" y="55" width="16" height="20" rx="3" fill="#48A9A6" opacity="0.2" />
    </svg>
  );
}

function SvgPalancaBrazo() {
  return (
    <svg viewBox="0 0 400 200" className={styles.palancaSvg} role="img" aria-label="Brazo como palanca de tercer género: fulcro en codo, fuerza del bíceps, carga en la mano">
      {/* Antebrazo (barra) */}
      <line x1="80" y1="100" x2="350" y2="100" stroke="currentColor" strokeWidth="4" opacity="0.3" />

      {/* Fulcro (codo) */}
      <polygon points="80,100 70,120 90,120" fill="#e74c3c" />
      <text x="80" y="140" textAnchor="middle" fill="#e74c3c" fontSize="11" fontWeight="700">Fulcro</text>
      <text x="80" y="152" textAnchor="middle" fill="currentColor" fontSize="9">(codo)</text>

      {/* Fuerza (biceps) */}
      <line x1="150" y1="100" x2="150" y2="50" stroke="#2E86AB" strokeWidth="3" markerEnd="url(#arrowUp)" />
      <text x="150" y="42" textAnchor="middle" fill="#2E86AB" fontSize="11" fontWeight="700">Fuerza</text>
      <text x="150" y="54" textAnchor="middle" fill="currentColor" fontSize="9">(bíceps)</text>

      {/* Carga (mano) */}
      <line x1="340" y1="100" x2="340" y2="150" stroke="#8e44ad" strokeWidth="3" markerEnd="url(#arrowDown)" />
      <rect x="320" y="155" width="40" height="25" rx="4" fill="#8e44ad" opacity="0.2" />
      <text x="340" y="172" textAnchor="middle" fill="#8e44ad" fontSize="10" fontWeight="600">Carga</text>
      <text x="340" y="195" textAnchor="middle" fill="currentColor" fontSize="9">(mano)</text>

      {/* Etiqueta palanca */}
      <text x="215" y="85" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.6">Palanca de 3.er género</text>

      <defs>
        <marker id="arrowUp" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto">
          <path d="M0,8 L4,0 L8,8" fill="#2E86AB" />
        </marker>
        <marker id="arrowDown" markerWidth="8" markerHeight="8" refX="4" refY="0" orient="auto">
          <path d="M0,0 L4,8 L8,0" fill="#8e44ad" />
        </marker>
      </defs>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function MusculosMovimientoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('tipos');
  const [tipoActivo, setTipoActivo] = useState<string | null>(null);
  const [pasoActivo, setPasoActivo] = useState<number | null>(null);
  const [artActiva, setArtActiva] = useState<string | null>(null);

  const seccionInfo = SECCIONES.find((s) => s.id === seccionActiva)!;

  // ─── Sección: Tipos de músculo ───
  function renderTipos() {
    return (
      <div className={styles.seccionContent}>
        <p className={styles.contexto}>
          <span aria-hidden="true">🏋️</span> El cuerpo humano tiene tres tipos de tejido muscular, cada uno con estructura y función únicas. Toca cada tarjeta para explorar.
        </p>

        <div className={styles.tiposGrid}>
          {TIPOS_MUSCULO.map((tipo) => {
            const activo = tipoActivo === tipo.id;
            return (
              <button
                key={tipo.id}
                type="button"
                className={`${styles.tipoCard} ${activo ? styles.tipoCardActivo : ''}`}
                style={{ borderLeftColor: tipo.color }}
                onClick={() => setTipoActivo(activo ? null : tipo.id)}
                aria-expanded={activo}
              >
                <div className={styles.tipoHeader}>
                  <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
                  <h3 className={styles.tipoNombre}>{tipo.nombre}</h3>
                  <span className={styles.tipoTag} style={{ background: tipo.tagColor }}>{tipo.tag}</span>
                </div>
                <p className={styles.tipoDesc}>{tipo.descripcion}</p>

                {activo && (
                  <div className={styles.tipoDetalle}>
                    {/* SVG fibras */}
                    <div className={styles.svgZona}>
                      {tipo.id === 'esqueletico' && <SvgFibrasEsqueletico />}
                      {tipo.id === 'liso' && <SvgFibrasLiso />}
                      {tipo.id === 'cardiaco' && <SvgFibrasCardiaco />}
                    </div>
                    <p className={styles.svgHint}>Patrón de fibras al microscopio</p>
                    <p className={styles.tipoEjemplos}><strong>Ejemplos:</strong> {tipo.ejemplos}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.5rem 0' }}>
                      {tipo.caracteristicas.map((c, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                          <span style={{ color: tipo.color, fontWeight: 700, marginRight: '0.4rem' }}>&bull;</span>{c}
                        </li>
                      ))}
                    </ul>
                    <p className={styles.tipoDato}><span aria-hidden="true">💡</span> {tipo.dato}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className={styles.insight}>
          <p><strong>Conexión con el sistema nervioso:</strong> El músculo esquelético lo controlan las neuronas motoras del sistema nervioso somático (voluntario). El liso y el cardíaco dependen del sistema nervioso autónomo (involuntario).</p>
        </div>
      </div>
    );
  }

  // ─── Sección: Contracción muscular ───
  function renderContraccion() {
    return (
      <div className={styles.seccionContent}>
        <p className={styles.contexto}>
          <span aria-hidden="true">🔬</span> El sarcómero es la unidad funcional del músculo esquelético. Aquí ocurre la contracción real: la miosina tira de la actina y el sarcómero se acorta.
        </p>

        <h3 className={styles.subSeccionTitulo}>El sarcómero</h3>
        <div className={styles.sarcomeroContainer}>
          <div className={styles.svgZona}>
            <SvgSarcomero />
          </div>
          <p className={styles.svgHint}>El sarcómero: de línea Z a línea Z. La actina (fino) se desliza sobre la miosina (grueso).</p>
        </div>

        <h3 className={styles.subSeccionTitulo}>Ciclo de contracción paso a paso</h3>
        <div className={styles.pasosContraccion}>
          {PASOS_CONTRACCION.map((paso) => {
            const activo = pasoActivo === paso.num;
            return (
              <button
                key={paso.num}
                type="button"
                className={`${styles.pasoItem} ${activo ? styles.pasoActivo : ''}`}
                onClick={() => setPasoActivo(activo ? null : paso.num)}
                aria-expanded={activo}
              >
                <span className={styles.pasoNum}>{paso.num}</span>
                <span className={styles.pasoIcono} aria-hidden="true">{paso.icono}</span>
                <div>
                  <div className={styles.pasoTexto}><strong>{paso.titulo}:</strong> {paso.descripcion}</div>
                  {activo && <div className={styles.pasoDetalleTexto}>{paso.detalle}</div>}
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.rigorBox}>
          <p className={styles.rigorTitulo}><span aria-hidden="true">💀</span> Rigor mortis</p>
          <p className={styles.rigorDesc}>
            Tras la muerte, el ATP se agota. Sin ATP, la miosina no puede soltar la actina y los músculos quedan rígidamente contraídos. Se resuelve cuando las enzimas comienzan a degradar las proteínas musculares (12-72 horas).
          </p>
        </div>

        <div className={styles.insight}>
          <p><strong>Conexión con enzimas:</strong> La ATPasa de la cabeza de miosina es la enzima clave: hidroliza ATP → ADP + Pi para generar la energía mecánica del golpe de potencia. Sin esta enzima, no hay contracción.</p>
        </div>
      </div>
    );
  }

  // ─── Sección: Articulaciones y palancas ───
  function renderArticulaciones() {
    const artSeleccionada = ARTICULACIONES.find((a) => a.id === artActiva);

    return (
      <div className={styles.seccionContent}>
        <p className={styles.contexto}>
          <span aria-hidden="true">🦴</span> Las articulaciones son los puntos de unión entre huesos que permiten el movimiento. El músculo actúa como motor y el hueso como palanca.
        </p>

        <h3 className={styles.subSeccionTitulo}>Tipos de articulaciones</h3>
        <div className={styles.articulacionesGrid}>
          {ARTICULACIONES.map((art) => (
            <button
              key={art.id}
              type="button"
              className={`${styles.artCard} ${artActiva === art.id ? styles.artCardActiva : ''}`}
              onClick={() => setArtActiva(artActiva === art.id ? null : art.id)}
              aria-expanded={artActiva === art.id}
            >
              <span className={styles.artIcono} aria-hidden="true">{art.icono}</span>
              <p className={styles.artNombre}>{art.nombre}</p>
              <p className={styles.artEjemplo}>{art.ejemplo}</p>
            </button>
          ))}
        </div>

        {artSeleccionada && (
          <div className={styles.artDetalle}>
            <h4 className={styles.artDetalleTitulo}><span aria-hidden="true">{artSeleccionada.icono}</span> {artSeleccionada.nombre} ({artSeleccionada.ejemplo})</h4>
            <p className={styles.artDetalleDesc}>{artSeleccionada.descripcion}</p>
            <p className={styles.artDetalleDesc}><strong>Movimiento:</strong> {artSeleccionada.movimiento}</p>
            <p className={styles.artDetalleDato}><span aria-hidden="true">💡</span> {artSeleccionada.dato}</p>
          </div>
        )}

        <h3 className={styles.subSeccionTitulo}>El músculo como palanca</h3>
        <div className={styles.palancaBox}>
          <SvgPalancaBrazo />
          <p className={styles.palancaDesc}>
            El bíceps es un ejemplo clásico de <strong>palanca de tercer género</strong>: el fulcro está en el codo, la fuerza se aplica cerca del fulcro (inserción del bíceps en el radio) y la carga está lejos (la mano). Esto significa que el bíceps debe hacer mucha más fuerza que el peso de la carga, pero gana en velocidad y rango de movimiento.
          </p>
        </div>

        <h3 className={styles.subSeccionTitulo}>Músculos antagonistas</h3>
        <div className={styles.antagonistasGrid}>
          <div className={styles.antagonistaCard} style={{ borderTopColor: '#2E86AB' }}>
            <p className={styles.antagonistaTitulo}><span aria-hidden="true">💪</span> Bíceps</p>
            <p className={styles.antagonistaAccion}>Flexor (agonista)</p>
            <p className={styles.antagonistaDesc}>Se contrae para doblar el codo. Cuando el bíceps se acorta, el tríceps se relaja y se estira.</p>
          </div>
          <div className={styles.antagonistaCard} style={{ borderTopColor: '#48A9A6' }}>
            <p className={styles.antagonistaTitulo}><span aria-hidden="true">🦾</span> Tríceps</p>
            <p className={styles.antagonistaAccion}>Extensor (antagonista)</p>
            <p className={styles.antagonistaDesc}>Se contrae para estirar el codo. Cuando el tríceps trabaja, el bíceps se relaja. Siempre trabajan en pareja.</p>
          </div>
        </div>

        <div className={styles.insight}>
          <p><strong>Dato clave:</strong> Los músculos solo pueden tirar (contraerse), nunca empujar. Por eso necesitan trabajar en parejas antagonistas para mover una articulación en ambas direcciones.</p>
        </div>
      </div>
    );
  }

  // ─── Sección: Datos y curiosidades ───
  function renderDatos() {
    return (
      <div className={styles.seccionContent}>
        <p className={styles.contexto}>
          <span aria-hidden="true">🏆</span> Récords, mitos desmentidos y datos sorprendentes del sistema muscular humano.
        </p>

        <h3 className={styles.subSeccionTitulo}>Récords musculares</h3>
        <div className={styles.datosGrid}>
          {DATOS_CURIOSOS.map((dato, i) => (
            <div key={i} className={styles.datoCard}>
              <span className={styles.datoIcono} aria-hidden="true">{dato.icono}</span>
              <p className={styles.datoTitulo}>{dato.titulo}</p>
              <p className={styles.datoValor}>{dato.valor}</p>
              <p className={styles.datoDesc}>{dato.descripcion}</p>
            </div>
          ))}
        </div>

        <h3 className={styles.subSeccionTitulo}>Mito vs realidad: las agujetas</h3>
        <div className={styles.errorComun}>
          <div className={styles.errorIncorrecto}>
            <span className={styles.errorLabel}><span aria-hidden="true">❌</span> Mito clásico</span>
            <p>&quot;Las agujetas son cristales de ácido láctico que se forman en los músculos.&quot;</p>
          </div>
          <div className={styles.errorCorrecto}>
            <span className={styles.errorLabel}><span aria-hidden="true">✅</span> Realidad científica</span>
            <p>Las agujetas (DOMS) son <strong>microroturas en las fibras musculares</strong> causadas por el esfuerzo, especialmente en movimientos excéntricos (cuando el músculo se estira bajo carga). El ácido láctico se elimina en 1-2 horas; las agujetas aparecen 24-72h después.</p>
          </div>
        </div>

        <h3 className={styles.subSeccionTitulo}>Fibras tipo I vs tipo II</h3>
        <div className={styles.fibrasGrid}>
          <div className={styles.fibraCard} style={{ borderTopColor: '#e74c3c' }}>
            <p className={styles.fibraTitulo}><span aria-hidden="true">🔴</span> Tipo I (lentas)</p>
            <p className={styles.fibraSubtitulo}>Resistencia y duración</p>
            <ul className={styles.fibraLista}>
              <li>Contracción lenta pero sostenida</li>
              <li>Ricas en mitocondrias y mioglobina</li>
              <li>Color rojizo (mucha mioglobina)</li>
              <li>Resistentes a la fatiga</li>
              <li>Ejemplo: maratón, ciclismo, postura</li>
            </ul>
          </div>
          <div className={styles.fibraCard} style={{ borderTopColor: '#2E86AB' }}>
            <p className={styles.fibraTitulo}><span aria-hidden="true">⚪</span> Tipo II (rápidas)</p>
            <p className={styles.fibraSubtitulo}>Potencia y velocidad</p>
            <ul className={styles.fibraLista}>
              <li>Contracción rápida y explosiva</li>
              <li>Menos mitocondrias, más glucógeno</li>
              <li>Color blanco/pálido</li>
              <li>Se fatigan rápidamente</li>
              <li>Ejemplo: sprint, salto, levantamiento</li>
            </ul>
          </div>
        </div>

        <div className={styles.insight}>
          <p><strong>¿Se puede cambiar el tipo de fibra?</strong> La genética determina la proporción base (~50/50 en promedio). El entrenamiento de resistencia favorece la expresión de tipo I, y el de fuerza/velocidad favorece el tipo II, pero la conversión total es limitada.</p>
        </div>
      </div>
    );
  }

  // ─── Render principal ───
  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">💪</span> Músculos y Movimiento</h1>
          <p className={styles.subtitle}>Contracción muscular, articulaciones y ATP como combustible</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map((s) => (
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

        {/* Header sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}><span aria-hidden="true">{seccionInfo.icono}</span> {seccionInfo.titulo}</h2>
          <p className={styles.seccionSubtitulo}>{seccionInfo.subtitulo}</p>
        </div>

        {/* Contenido de sección */}
        {seccionActiva === 'tipos' && renderTipos()}
        {seccionActiva === 'contraccion' && renderContraccion()}
        {seccionActiva === 'articulaciones' && renderArticulaciones()}
        {seccionActiva === 'datos' && renderDatos()}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="¿Quieres profundizar más?"
          subtitle="Conceptos avanzados y conexiones"
        >
          <section className={styles.seccionContent}>
            <h2 className={styles.subSeccionTitulo}>ATP: el combustible universal</h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              El <strong>ATP (adenosín trifosfato)</strong> es la moneda energética de todas las células. En el músculo, se consume en tres momentos clave: (1) el golpe de potencia de la miosina, (2) el despegue de la miosina de la actina, y (3) la recaptura de Ca²⁺ por el retículo sarcoplásmico. El cuerpo contiene solo ~85 gramos de ATP en cada momento, pero recicla su propio peso en ATP cada día gracias a las mitocondrias.
            </p>
            <h2 className={styles.subSeccionTitulo}>Conexiones con otros sistemas</h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              <strong>Sistema nervioso:</strong> Sin las neuronas motoras no hay contracción voluntaria. La acetilcolina es el neurotransmisor de la unión neuromuscular. Las enfermedades como la miastenia gravis atacan estos receptores.
            </p>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              <strong>Enzimas:</strong> La ATPasa de miosina, la acetilcolinesterasa (que degrada acetilcolina tras la señal) y las enzimas del ciclo de Krebs en las mitocondrias son fundamentales para el funcionamiento muscular.
            </p>
            <div className={styles.warningBox}>
              <strong>Nota educativa:</strong> Este visualizador es una simplificación didáctica. La fisiología muscular real implica decenas de proteínas reguladoras, vías metabólicas complejas y variaciones entre tipos de fibras que no se cubren aquí.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-musculos-movimiento')} />
        <ShareCard appName="visualizador-musculos-movimiento" />
        <Footer appName="visualizador-musculos-movimiento" />
    </div>
  );
}
