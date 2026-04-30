'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './ReinoAnimal.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Tab = 'vertebrados' | 'invertebrados' | 'comparativa' | 'filogenia';

interface ClaseVertebrado {
  id: string;
  nombre: string;
  nombreCientifico: string;
  icono: string;
  camarasCorazon: number;
  termia: 'ectotermo' | 'endotermo';
  cubierta: string;
  reproduccion: string;
  respiracion: string;
  excrecion: string;
  especies: string;
  ejemplos: string[];
  habitats: string[];
  color: string;
}

interface PhylumInvertebrado {
  id: string;
  nombre: string;
  ejemplo: string;
  icono: string;
  simetria: string;
  celoma: string;
  especies: string;
  descripcion: string;
  representantes: string[];
  curiosidad: string;
  color: string;
}

interface NodoArbol {
  id: string;
  nombre: string;
  x: number;
  y: number;
  sinapomorfia: string;
  especies: string;
  nivel: number;
}

// ─────────────────────────────────────────────
// Datos: Vertebrados
// ─────────────────────────────────────────────

const CLASES_VERTEBRADOS: ClaseVertebrado[] = [
  {
    id: 'peces',
    nombre: 'Peces',
    nombreCientifico: 'Pisces (parafilético)',
    icono: '🐟',
    camarasCorazon: 2,
    termia: 'ectotermo',
    cubierta: 'Escamas (cicloideas, ctenoideas, ganoideas o placoideas)',
    reproduccion: 'Ovíparo acuático (mayoría); fertilización externa',
    respiracion: 'Branquias (peces cartilaginosos: 5-7 hendiduras)',
    excrecion: 'Amoniaco (amoniotelio) — tóxico, requiere mucha agua',
    especies: '~33.000 sp',
    ejemplos: ['🦈 Tiburón blanco', '🐠 Pez payaso', '🐟 Salmón atlántico'],
    habitats: ['Océanos', 'Ríos', 'Lagos', 'Estuarios', 'Aguas profundas'],
    color: '#2E86AB',
  },
  {
    id: 'anfibios',
    nombre: 'Anfibios',
    nombreCientifico: 'Amphibia',
    icono: '🐸',
    camarasCorazon: 3,
    termia: 'ectotermo',
    cubierta: 'Piel desnuda, húmeda, permeable (con glándulas mucosas)',
    reproduccion: 'Ovíparo acuático con metamorfosis larval',
    respiracion: 'Piel + pulmones (adultos); branquias (larvas)',
    excrecion: 'Urea (adultos) / Amoniaco (larvas acuáticas)',
    especies: '~8.100 sp',
    ejemplos: ['🐸 Rana común', '🦎 Salamandra gigante', '🐊 Cecilia de Atractaspis'],
    habitats: ['Zonas húmedas', 'Riberas fluviales', 'Selvas tropicales', 'Cuevas'],
    color: '#48A9A6',
  },
  {
    id: 'reptiles',
    nombre: 'Reptiles',
    nombreCientifico: 'Reptilia',
    icono: '🦎',
    camarasCorazon: 3,
    termia: 'ectotermo',
    cubierta: 'Escamas queratinizadas impermeables (no mudan continuamente)',
    reproduccion: 'Ovíparo terrestre (huevo amniótico); algunos vivíparos',
    respiracion: 'Pulmones (sin fase acuática)',
    excrecion: 'Ácido úrico (uricotelio) — mínima pérdida de agua',
    especies: '~10.900 sp',
    ejemplos: ['🐊 Cocodrilo del Nilo', '🐍 Pitón reticulada', '🐢 Tortuga laúd'],
    habitats: ['Desiertos', 'Selvas', 'Sabanas', 'Zonas costeras', 'Arrecifes'],
    color: '#7FB3D3',
  },
  {
    id: 'aves',
    nombre: 'Aves',
    nombreCientifico: 'Aves (Dinosauria Theropoda)',
    icono: '🦅',
    camarasCorazon: 4,
    termia: 'endotermo',
    cubierta: 'Plumas (derivadas de escamas; único carácter diagnóstico)',
    reproduccion: 'Ovíparas; incubación y cuidado parental extenso',
    respiracion: 'Pulmones + sacos aéreos (flujo unidireccional — muy eficiente)',
    excrecion: 'Ácido úrico (uricotelio)',
    especies: '~10.500 sp',
    ejemplos: ['🦅 Águila real', '🐧 Pingüino emperador', '🦜 Guacamayo escarlata'],
    habitats: ['Todos los continentes', 'Océanos abiertos', 'Antártida', 'Desiertos', 'Selvas'],
    color: '#F7C59F',
  },
  {
    id: 'mamiferos',
    nombre: 'Mamíferos',
    nombreCientifico: 'Mammalia',
    icono: '🦁',
    camarasCorazon: 4,
    termia: 'endotermo',
    cubierta: 'Pelo o cabello (queratina); algunos con escamas o sin pelo',
    reproduccion: 'Vivíparos (mayoría); placentarios, marsupiales, monotremas',
    respiracion: 'Pulmones con diafragma muscular',
    excrecion: 'Urea (ureotelio) — a través de riñones y orina',
    especies: '~5.500 sp',
    ejemplos: ['🐋 Ballena azul', '🦁 León africano', '🐒 Chimpancé común'],
    habitats: ['Todos los continentes', 'Océanos', 'Desiertos', 'Polos', 'Cuevas'],
    color: '#E8A598',
  },
];

// ─────────────────────────────────────────────
// Datos: Invertebrados
// ─────────────────────────────────────────────

const PHYLA_INVERTEBRADOS: PhylumInvertebrado[] = [
  {
    id: 'poriferos',
    nombre: 'Poríferos',
    ejemplo: 'Esponjas',
    icono: '🧽',
    simetria: 'Asimétrica (o radial)',
    celoma: 'Sin tejidos verdaderos',
    especies: '~9.000 sp',
    descripcion:
      'Los más basales del reino animal. Sin tejidos ni órganos diferenciados. Su cuerpo es una red de canales por los que filtran hasta 10.000 L de agua/kg por día. Las células especializadas (coanocitos) capturan partículas. Pueden regenerar partes enteras del cuerpo. Papel ecológico clave en arrecifes coralinos.',
    representantes: ['Esponja de baño (Spongia)', 'Esponja de vidrio (Euplectella)', 'Esponja de azufre'],
    curiosidad: 'Filtran hasta 10.000 litros de agua por kilogramo de masa corporal al día',
    color: '#E8BE5A',
  },
  {
    id: 'cnidarios',
    nombre: 'Cnidarios',
    ejemplo: 'Medusas, corales, anémonas',
    icono: '🪼',
    simetria: 'Radial',
    celoma: 'Acelomado (cavidad gastrovascular)',
    especies: '~11.000 sp',
    descripcion:
      'Diploblásticos (2 capas germinales). Su rasgo diagnóstico son los cnidocitos: células urticantes con estructuras explosivas (nematocistos) para capturar presas. Existen en dos formas: pólipo (sésil) y medusa (libre). Los corales son colonias de pólipos que secretan esqueleto de carbonato cálcico.',
    representantes: ['Medusa de crin de león (Cyanea capillata)', 'Coral cerebro', 'Anémona de mar', 'Hidra'],
    curiosidad: 'La medusa inmortal (Turritopsis dohrnii) puede revertir su ciclo vital de adulto a larva indefinidamente',
    color: '#FF8FAB',
  },
  {
    id: 'platelmintos',
    nombre: 'Platelmintos',
    ejemplo: 'Gusanos planos, tenias',
    icono: '🪱',
    simetria: 'Bilateral',
    celoma: 'Acelomado',
    especies: '~25.000 sp',
    descripcion:
      'Primer grupo con simetría bilateral y cefalización (concentración de neuronas en la cabeza). Sin cavidad corporal verdadera: los órganos están inmersos en parénquima. Muchos son parásitos obligados: las tenias pueden alcanzar 10 m de longitud en el intestino humano. Los turbelarios (planarias) son de vida libre.',
    representantes: ['Tenia solitaria (Taenia solium)', 'Fasciola hepática', 'Planaria (Dugesia)'],
    curiosidad: 'Las planarias pueden regenerar un individuo completo a partir de 1/279 parte de su cuerpo',
    color: '#C9A96E',
  },
  {
    id: 'anelidos',
    nombre: 'Anélidos',
    ejemplo: 'Lombriz, poliquetos, sanguijuelas',
    icono: '🪱',
    simetria: 'Bilateral',
    celoma: 'Celomado (celoma segmentado)',
    especies: '~22.000 sp',
    descripcion:
      'Cuerpo segmentado (metamerismo): cada segmento repite los mismos órganos. Celoma verdadero (cavidad corporal revestida de mesodermo). Sistema circulatorio cerrado. Los poliquetos marinos son los más diversos; las lombrices de tierra son fundamentales para la aireación del suelo y el ciclo de nutrientes.',
    representantes: ['Lombriz de tierra (Lumbricus terrestris)', 'Sanguijuela medicinal (Hirudo)', 'Poliqueto tubícola'],
    curiosidad: 'Las lombrices de tierra digieren su propio peso en materia orgánica cada día, siendo clave para la fertilidad del suelo',
    color: '#A0785A',
  },
  {
    id: 'moluscos',
    nombre: 'Moluscos',
    ejemplo: 'Pulpo, caracol, mejillón, calamar',
    icono: '🐙',
    simetria: 'Bilateral (secondariamente asimétrica en gasterópodos)',
    celoma: 'Celomado (reducido)',
    especies: '~85.000 sp',
    descripcion:
      'Segundo phylum más diverso. Rasgo diagnóstico: manto (capa epitelial que puede secretar concha) y rádula (órgano raspador en herbívoros). Los cefalópodos (pulpo, calamar) son los invertebrados más inteligentes: sistema nervioso complejo, aprendizaje, camuflaje activo. Los bivalvos filtran agua como las esponjas.',
    representantes: ['Pulpo común (Octopus vulgaris)', 'Calamar gigante (Architeuthis dux)', 'Caracol de jardín', 'Almeja'],
    curiosidad: 'El pulpo tiene 3 corazones, 9 cerebros (1 central + 8 en tentáculos) y sangre azul con hemocianina',
    color: '#8B5CF6',
  },
  {
    id: 'artropodos',
    nombre: 'Artrópodos',
    ejemplo: 'Insectos, arañas, cangrejos',
    icono: '🦟',
    simetria: 'Bilateral',
    celoma: 'Celomado (muy reducido, hemocele)',
    especies: '>1.000.000 sp (>75% de todas las especies animales)',
    descripcion:
      'El phylum más numeroso y exitoso del planeta. Rasgos diagnósticos: exoesqueleto de quitina (muda periódica), apéndices articulados, sistema nervioso ventral. Los insectos (Hexapoda) son el grupo más diverso de todos los animales con más de 1 millón de especies descritas y estimados 5-10 millones totales.',
    representantes: ['Abeja melífera (Apis mellifera)', 'Araña de Darwin (Caerostris darwini)', 'Cangrejo de herradura', 'Escorpión imperial'],
    curiosidad: 'Se estima que en cualquier momento hay 10 quintillones (10¹⁹) de insectos vivos en la Tierra',
    color: '#F59E0B',
  },
  {
    id: 'equinodermos',
    nombre: 'Equinodermos',
    ejemplo: 'Estrellas de mar, erizos, pepinos',
    icono: '⭐',
    simetria: 'Pentarradial (de adulto); bilateral (de larva)',
    celoma: 'Celomado (sistema ambulacral)',
    especies: '~7.000 sp',
    descripcion:
      'Deuterostomados: el blastoporo embrionario origina el ano (no la boca), como en los cordados. Simetría pentarradial secundaria (la larva es bilateral). Sistema ambulacral único: red de canales hidráulicos con pies tubulares para locomoción y alimentación. Sin sistema excretor diferenciado — difusión directa. Parientes evolutivos más cercanos a los vertebrados entre los invertebrados.',
    representantes: ['Estrella de mar (Asterias rubens)', 'Erizo de mar rojo', 'Pepino de mar', 'Crinoide (lirio de mar)'],
    curiosidad: 'Las estrellas de mar pueden evertir su estómago para digerir presas (mejillones) fuera de su cuerpo',
    color: '#EF4444',
  },
];

// ─────────────────────────────────────────────
// Datos: Nodos del árbol filogenético
// ─────────────────────────────────────────────

const NODOS_ARBOL: NodoArbol[] = [
  { id: 'animalia', nombre: 'Animalia', x: 400, y: 40, sinapomorfia: 'Pluricelularidad heterótrofa, movilidad, reproducción sexual', especies: '>1.500.000 sp', nivel: 0 },
  { id: 'parazoa', nombre: 'Parazoa', x: 170, y: 120, sinapomorfia: 'Sin tejidos verdaderos, coanocitos', especies: '~9.000 sp', nivel: 1 },
  { id: 'eumetazoa', nombre: 'Eumetazoa', x: 540, y: 120, sinapomorfia: 'Tejidos diferenciados, capa germinal', especies: '>1.490.000 sp', nivel: 1 },
  { id: 'radiata', nombre: 'Radiata', x: 380, y: 210, sinapomorfia: 'Simetría radial, diploblásticos', especies: '~11.000 sp', nivel: 2 },
  { id: 'bilateria', nombre: 'Bilateria', x: 620, y: 210, sinapomorfia: 'Simetría bilateral, cefalización', especies: '>1.480.000 sp', nivel: 2 },
  { id: 'protostomia', nombre: 'Protostomia', x: 460, y: 300, sinapomorfia: 'Boca desde blastoporo, desarrollo espiral', especies: '>1.000.000 sp', nivel: 3 },
  { id: 'deuterostomia', nombre: 'Deuterostomia', x: 680, y: 300, sinapomorfia: 'Ano desde blastoporo, desarrollo radial', especies: '~60.000 sp', nivel: 3 },
  { id: 'equinodermos2', nombre: 'Equinodermos', x: 580, y: 390, sinapomorfia: 'Sistema ambulacral, simetría pentarradial', especies: '~7.000 sp', nivel: 4 },
  { id: 'cordados', nombre: 'Cordados', x: 730, y: 390, sinapomorfia: 'Notocorda, tubo neural dorsal, faringe', especies: '~55.000 sp', nivel: 4 },
  { id: 'agnatos', nombre: 'Agnatos', x: 640, y: 480, sinapomorfia: 'Sin mandíbulas (lampreas, mixinos)', especies: '~120 sp', nivel: 5 },
  { id: 'gnatostomados', nombre: 'Gnatostomados', x: 780, y: 480, sinapomorfia: 'Mandíbulas óseas o cartilaginosas', especies: '>50.000 sp', nivel: 5 },
  { id: 'peces2', nombre: 'Peces (parafilético)', x: 700, y: 560, sinapomorfia: 'Aletas, branquias, vida acuática', especies: '~33.000 sp', nivel: 6 },
  { id: 'tetrapodos', nombre: 'Tetrápodos', x: 810, y: 560, sinapomorfia: '4 extremidades, respiración pulmonar', especies: '>34.000 sp', nivel: 6 },
  { id: 'anfibios2', nombre: 'Anfibios', x: 730, y: 640, sinapomorfia: 'Metamorfosis, piel húmeda semipermeable', especies: '~8.100 sp', nivel: 7 },
  { id: 'amniota', nombre: 'Amniota', x: 840, y: 640, sinapomorfia: 'Huevo amniótico (amnios, alantoide, saco vitelino)', especies: '>25.000 sp', nivel: 7 },
  { id: 'sauropsida', nombre: 'Sauropsida', x: 780, y: 720, sinapomorfia: 'Escamas epidérmicas, uricotelio', especies: '~21.000 sp', nivel: 8 },
  { id: 'mamiferos2', nombre: 'Mamíferos', x: 880, y: 720, sinapomorfia: 'Glándulas mamarias, pelo, placenta (mayoría)', especies: '~5.500 sp', nivel: 8 },
];

// Conexiones del árbol (pares de IDs)
const CONEXIONES_ARBOL: [string, string][] = [
  ['animalia', 'parazoa'],
  ['animalia', 'eumetazoa'],
  ['eumetazoa', 'radiata'],
  ['eumetazoa', 'bilateria'],
  ['bilateria', 'protostomia'],
  ['bilateria', 'deuterostomia'],
  ['deuterostomia', 'equinodermos2'],
  ['deuterostomia', 'cordados'],
  ['cordados', 'agnatos'],
  ['cordados', 'gnatostomados'],
  ['gnatostomados', 'peces2'],
  ['gnatostomados', 'tetrapodos'],
  ['tetrapodos', 'anfibios2'],
  ['tetrapodos', 'amniota'],
  ['amniota', 'sauropsida'],
  ['amniota', 'mamiferos2'],
];

// ─────────────────────────────────────────────
// Componente: SVG del corazón
// ─────────────────────────────────────────────

function CorazonSvg({ camaras }: { camaras: number }) {
  const colores = ['#EF4444', '#F59E0B', '#3B82F6'];

  if (camaras === 2) {
    return (
      <svg viewBox="0 0 200 120" className={styles.corazonSvg} aria-label="Corazón de 2 cámaras">
        <ellipse cx="70" cy="60" rx="45" ry="45" fill={colores[0]} opacity="0.85" />
        <ellipse cx="130" cy="60" rx="45" ry="45" fill={colores[1]} opacity="0.85" />
        <text x="70" y="65" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">Aurícula</text>
        <text x="130" y="65" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">Ventrículo</text>
        <text x="100" y="112" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">2 cámaras</text>
      </svg>
    );
  }

  if (camaras === 3) {
    return (
      <svg viewBox="0 0 260 130" className={styles.corazonSvg} aria-label="Corazón de 3 cámaras">
        <ellipse cx="60" cy="60" rx="42" ry="42" fill={colores[0]} opacity="0.85" />
        <ellipse cx="150" cy="60" rx="42" ry="42" fill={colores[1]} opacity="0.85" />
        <ellipse cx="210" cy="60" rx="38" ry="38" fill={colores[2]} opacity="0.85" />
        <text x="60" y="57" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Aurícula</text>
        <text x="60" y="69" textAnchor="middle" fill="#fff" fontSize="9">D</text>
        <text x="150" y="57" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Aurícula</text>
        <text x="150" y="69" textAnchor="middle" fill="#fff" fontSize="9">I</text>
        <text x="210" y="57" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Ventrículo</text>
        <text x="210" y="69" textAnchor="middle" fill="#fff" fontSize="9">(único)</text>
        <text x="130" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">3 cámaras — mezcla parcial O₂/CO₂</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 300 130" className={styles.corazonSvg} aria-label="Corazón de 4 cámaras">
      <ellipse cx="60" cy="55" rx="42" ry="42" fill={colores[0]} opacity="0.85" />
      <ellipse cx="145" cy="55" rx="42" ry="42" fill={colores[1]} opacity="0.85" />
      <ellipse cx="215" cy="55" rx="42" ry="42" fill={colores[2]} opacity="0.85" />
      <ellipse cx="260" cy="75" rx="28" ry="30" fill="#22C55E" opacity="0.85" />
      <text x="60" y="52" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">A. Der.</text>
      <text x="60" y="64" textAnchor="middle" fill="#fff" fontSize="8">venosa</text>
      <text x="145" y="52" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">A. Izq.</text>
      <text x="145" y="64" textAnchor="middle" fill="#fff" fontSize="8">arterial</text>
      <text x="215" y="52" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">V. Der.</text>
      <text x="260" y="72" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">V. Izq.</text>
      <text x="160" y="118" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">4 cámaras — separación completa</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Vertebrados
// ─────────────────────────────────────────────

function TabVertebrados() {
  const [claseActiva, setClaseActiva] = useState<string>('mamiferos');
  const clase = CLASES_VERTEBRADOS.find((c) => c.id === claseActiva)!;

  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        Los vertebrados representan menos del 5% de las especies animales, pero han colonizado todos los entornos del planeta. Su rasgo diagnóstico es la columna vertebral (endoesqueleto de cartílago u hueso).
      </p>

      {/* Selector de clases */}
      <div className={styles.clasesGrid}>
        {CLASES_VERTEBRADOS.map((c) => (
          <button
            key={c.id}
            className={`${styles.claseCard} ${claseActiva === c.id ? styles.claseCardActive : ''}`}
            onClick={() => setClaseActiva(c.id)}
            aria-pressed={claseActiva === c.id}
            style={{ borderColor: claseActiva === c.id ? c.color : undefined }}
          >
            <span className={styles.claseIcono}>{c.icono}</span>
            <span className={styles.claseNombre}>{c.nombre}</span>
            <span className={styles.claseEspecies}>{c.especies}</span>
          </button>
        ))}
      </div>

      {/* Panel de detalles */}
      <div className={styles.claseDetalle}>
        <div className={styles.claseDetalleHeader}>
          <span className={styles.claseDetalleIcono}>{clase.icono}</span>
          <div>
            <h2 className={styles.claseDetalleTitulo}>{clase.nombre}</h2>
            <p className={styles.claseDetalleNombreCientifico}>{clase.nombreCientifico}</p>
          </div>
          <span className={styles.claseDetalleEspecies}>{clase.especies}</span>
        </div>

        {/* Badges de características clave */}
        <div className={styles.badgesRow}>
          <span className={clase.termia === 'endotermo' ? styles.badgeEndotermo : styles.badgeEctotermo}>
            {clase.termia === 'endotermo' ? '🔥 Endotermo' : '❄️ Ectotermo'}
          </span>
          <span className={styles.badge}>
            ❤️ {clase.camarasCorazon} cámaras
          </span>
          <span className={styles.badge}>
            🛡️ {clase.cubierta.split('(')[0].trim()}
          </span>
        </div>

        {/* SVG corazón */}
        <div className={styles.corazonContainer}>
          <h3 className={styles.corazonTitulo}>Sistema circulatorio — corazón de {clase.camarasCorazon} cámaras</h3>
          <CorazonSvg camaras={clase.camarasCorazon} />
        </div>

        {/* Tabla de sistemas */}
        <div className={styles.sistemasList}>
          <div className={styles.sistemaItem}>
            <span className={styles.sistemaLabel}>Cubierta corporal</span>
            <span className={styles.sistemaValue}>{clase.cubierta}</span>
          </div>
          <div className={styles.sistemaItem}>
            <span className={styles.sistemaLabel}>Reproducción</span>
            <span className={styles.sistemaValue}>{clase.reproduccion}</span>
          </div>
          <div className={styles.sistemaItem}>
            <span className={styles.sistemaLabel}>Respiración</span>
            <span className={styles.sistemaValue}>{clase.respiracion}</span>
          </div>
          <div className={styles.sistemaItem}>
            <span className={styles.sistemaLabel}>Excreción</span>
            <span className={styles.sistemaValue}>{clase.excrecion}</span>
          </div>
        </div>

        {/* Ejemplos y hábitats */}
        <div className={styles.ejemplosHabitats}>
          <div>
            <h4 className={styles.subTitulo}>Ejemplos</h4>
            <ul className={styles.ejemplosList}>
              {clase.ejemplos.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={styles.subTitulo}>Hábitats</h4>
            <div className={styles.habitatsTags}>
              {clase.habitats.map((h) => (
                <span key={h} className={styles.habitatTag}>{h}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Invertebrados
// ─────────────────────────────────────────────

function TabInvertebrados() {
  const [phylumActivo, setPhylumActivo] = useState<string>('artropodos');
  const phylum = PHYLA_INVERTEBRADOS.find((p) => p.id === phylumActivo)!;

  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        El 95% de las especies animales son invertebrados. Carecen de columna vertebral pero han desarrollado soluciones evolutivas extraordinariamente diversas para los mismos desafíos biológicos.
      </p>

      <div className={styles.phylaGrid}>
        {PHYLA_INVERTEBRADOS.map((p) => (
          <button
            key={p.id}
            className={`${styles.phylaCard} ${phylumActivo === p.id ? styles.phylaCardActive : ''}`}
            onClick={() => setPhylumActivo(p.id)}
            aria-pressed={phylumActivo === p.id}
            style={{ borderColor: phylumActivo === p.id ? p.color : undefined }}
          >
            <span className={styles.phylaIcono}>{p.icono}</span>
            <span className={styles.phylaNombre}>{p.nombre}</span>
            <span className={styles.phylaEjemplo}>{p.ejemplo}</span>
          </button>
        ))}
      </div>

      <div className={styles.phylaDetalle}>
        <div className={styles.phylaDetalleHeader}>
          <span className={styles.phylaDetalleIcono}>{phylum.icono}</span>
          <div>
            <h2 className={styles.phylaDetalleTitulo}>{phylum.nombre}</h2>
            <p className={styles.phylaDetalleEjemplo}>{phylum.ejemplo}</p>
          </div>
          <span className={styles.phylaDetalleEspecies}>{phylum.especies}</span>
        </div>

        <div className={styles.phylaBadgesRow}>
          <span className={styles.badge}>⊕ {phylum.simetria}</span>
          <span className={styles.badge}>🔵 {phylum.celoma}</span>
        </div>

        <p className={styles.phylaDescripcion}>{phylum.descripcion}</p>

        <div className={styles.phylaInfoGrid}>
          <div>
            <h4 className={styles.subTitulo}>Representantes</h4>
            <ul className={styles.representantesList}>
              {phylum.representantes.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
          <div className={styles.curiosidadBox}>
            <span className={styles.curiosidadLabel}>Dato curioso</span>
            <p className={styles.curiosidadTexto}>{phylum.curiosidad}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Comparativa de sistemas
// ─────────────────────────────────────────────

const FILAS_TABLA = [
  { sistema: 'Circulatorio', valores: ['2 cámaras', '3 cámaras', '3–4 cámaras', '4 cámaras', '4 cámaras'] },
  { sistema: 'Respiratorio', valores: ['Branquias', 'Piel + pulmones', 'Pulmones', 'Pulmones + sacos aéreos', 'Pulmones'] },
  { sistema: 'Excretor', valores: ['Amoniaco', 'Urea/amoniaco', 'Ácido úrico', 'Ácido úrico', 'Urea'] },
  { sistema: 'Reproducción', valores: ['Ovíparos acuáticos', 'Metamorfosis', 'Ovíparos terrestres', 'Ovíparas, nido', 'Vivíparos + lactancia'] },
  { sistema: 'Temperatura', valores: ['Ectotermo', 'Ectotermo', 'Ectotermo', 'Endotermo', 'Endotermo'] },
  { sistema: 'Cubierta', valores: ['Escamas/mucosa', 'Piel desnuda', 'Escamas', 'Plumas', 'Pelo'] },
];

function TabComparativa() {
  const [filtraFila, setFiltraFila] = useState<string | null>(null);

  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        Compara los principales sistemas biológicos entre las 5 clases de vertebrados. Haz clic en un sistema para resaltarlo.
      </p>

      <div className={styles.filtrosBotones}>
        {FILAS_TABLA.map((f) => (
          <button
            key={f.sistema}
            className={`${styles.filtroBtn} ${filtraFila === f.sistema ? styles.filtroBtnActivo : ''}`}
            onClick={() => setFiltraFila(filtraFila === f.sistema ? null : f.sistema)}
          >
            {f.sistema}
          </button>
        ))}
      </div>

      <div className={styles.comparativaWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th className={styles.thSistema}>Sistema</th>
              {CLASES_VERTEBRADOS.map((c) => (
                <th key={c.id} className={styles.thClase}>
                  {c.icono} {c.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILAS_TABLA.map((fila) => (
              <tr
                key={fila.sistema}
                className={`${styles.trFila} ${filtraFila === fila.sistema ? styles.trFilaActiva : ''}`}
              >
                <td className={styles.tdSistema}>{fila.sistema}</td>
                {fila.valores.map((v, i) => (
                  <td key={i} className={styles.tdValor}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.notaTabla}>
        <strong>Nota</strong>: Los cocodrilos (reptiles) tienen excepcionalmente 4 cámaras cardíacas, aunque con un orificio de Panizza entre los ventrículos. Las aves son técnicamente dinosaurios terópodos (Sauropsida).
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Árbol filogenético
// ─────────────────────────────────────────────

function TabFilogenia() {
  const [nodoActivo, setNodoActivo] = useState<string | null>(null);
  const nodo = nodoActivo ? NODOS_ARBOL.find((n) => n.id === nodoActivo) : null;

  // Mapa id → posición
  const posMap: Record<string, { x: number; y: number }> = {};
  for (const n of NODOS_ARBOL) posMap[n.id] = { x: n.x, y: n.y };

  return (
    <div className={styles.tabContent}>
      <p className={styles.tabIntro}>
        Árbol filogenético simplificado del reino Animalia basado en filogenia molecular. Haz clic en cualquier nodo para ver su rasgo evolutivo diagnóstico (sinapomorfia).
      </p>

      <div className={styles.arbolContainer}>
        <svg
          viewBox="0 60 1000 720"
          className={styles.arbolSvg}
          role="img"
          aria-label="Árbol filogenético del reino Animalia"
        >
          {/* Líneas de conexión */}
          {CONEXIONES_ARBOL.map(([a, b]) => {
            const pa = posMap[a];
            const pb = posMap[b];
            if (!pa || !pb) return null;
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x} y1={pa.y}
                x2={pb.x} y2={pb.y}
                stroke="var(--accent)"
                strokeWidth="2"
                opacity="0.6"
              />
            );
          })}

          {/* Nodos */}
          {NODOS_ARBOL.map((n) => {
            const isActive = nodoActivo === n.id;
            const radio = n.nivel === 0 ? 38 : n.nivel <= 2 ? 32 : 28;
            return (
              <g
                key={n.id}
                className={styles.nodoArbol}
                onClick={() => setNodoActivo(nodoActivo === n.id ? null : n.id)}
                role="button"
                aria-pressed={isActive}
                aria-label={`${n.nombre}: ${n.sinapomorfia}`}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setNodoActivo(nodoActivo === n.id ? null : n.id); }}
              >
                <circle
                  cx={n.x} cy={n.y}
                  r={radio}
                  fill={isActive ? 'var(--primary)' : 'var(--bg-card)'}
                  stroke={isActive ? 'var(--secondary)' : 'var(--accent)'}
                  strokeWidth={isActive ? 3 : 1.5}
                />
                <text
                  x={n.x} y={n.y - 5}
                  textAnchor="middle"
                  fill={isActive ? '#fff' : 'var(--text-primary)'}
                  fontSize={n.nivel === 0 ? '11' : n.nivel <= 2 ? '9.5' : '8.5'}
                  fontWeight={isActive ? '700' : '500'}
                >
                  {n.nombre.split(' ')[0]}
                </text>
                <text
                  x={n.x} y={n.y + 9}
                  textAnchor="middle"
                  fill={isActive ? '#fff' : 'var(--text-secondary)'}
                  fontSize="7.5"
                >
                  {n.especies.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Panel de información del nodo */}
        {nodo && (
          <div className={styles.nodoInfoPanel}>
            <h3 className={styles.nodoInfoTitulo}>{nodo.nombre}</h3>
            <div className={styles.nodoInfoRow}>
              <span className={styles.nodoInfoLabel}>Sinapomorfia</span>
              <p className={styles.nodoInfoSinap}>{nodo.sinapomorfia}</p>
            </div>
            <div className={styles.nodoInfoRow}>
              <span className={styles.nodoInfoLabel}>Diversidad</span>
              <span className={styles.nodoInfoEspecies}>{nodo.especies}</span>
            </div>
          </div>
        )}

        {!nodo && (
          <div className={styles.nodoInfoPlaceholder}>
            Haz clic en un nodo del árbol para ver su sinapomorfia (rasgo evolutivo diagnóstico)
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

const TABS: { id: Tab; label: string; icono: string }[] = [
  { id: 'vertebrados', label: 'Vertebrados', icono: '🦴' },
  { id: 'invertebrados', label: 'Invertebrados', icono: '🦟' },
  { id: 'comparativa', label: 'Comparativa', icono: '📊' },
  { id: 'filogenia', label: 'Filogenia', icono: '🌳' },
];

export default function VisualizadorReinoAnimalPage() {
  const [tabActiva, setTabActiva] = useState<Tab>('vertebrados');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>Biología · Zoología</div>
          <h1 className={styles.heroTitle}>Reino Animal</h1>
          <p className={styles.heroSubtitle}>
            Vertebrados, invertebrados y árbol filogenético del reino Animalia
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Barra de pestañas */}
        <nav className={styles.tabBar} role="tablist" aria-label="Secciones del visualizador">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tabActiva === t.id}
              className={`${styles.tab} ${tabActiva === t.id ? styles.tabActive : ''}`}
              onClick={() => setTabActiva(t.id)}
            >
              <span aria-hidden="true">{t.icono}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Contenido de la pestaña activa */}
        {tabActiva === 'vertebrados' && <TabVertebrados />}
        {tabActiva === 'invertebrados' && <TabInvertebrados />}
        {tabActiva === 'comparativa' && <TabComparativa />}
        {tabActiva === 'filogenia' && <TabFilogenia />}

        {/* Sección educativa */}
        <EducationalSection
          title="Reino Animal: 1,5 millones de especies descritas"
          subtitle="De la esponja al chimpancé: una genealogía de 600 millones de años"
        >
          <p>
            El reino Animalia agrupa a todos los organismos eucariotas pluricelulares, heterótrofos, con tejidos diferenciados (excepto las esponjas) y que se reproducen sexualmente. Con más de 1,5 millones de especies descritas —y estimaciones de 8-10 millones totales— es el reino más diverso junto con los artrópodos.
          </p>
          <p>
            La clasificación animal moderna se basa en la filogenia molecular: el ADN revela relaciones evolutivas invisibles en la morfología. Los vertebrados, pese a toda su variedad, representan menos del 5% de las especies animales conocidas. El 95% son invertebrados, dominados por los artrópodos (insectos, arañas, crustáceos).
          </p>
          <p>
            Los grandes hitos evolutivos del reino animal —la aparición de tejidos, celoma, simetría bilateral, endoesqueleto, amnios, placenta— definen los grandes grupos taxonómicos y explican por qué cada grupo colonizó entornos tan distintos.
          </p>

          {/* ── 1. Tabla Comparativa ── */}
          <div className={styles.tableWrapper}>
            <h3 className={styles.eduSectionTitle}>Comparativa de las 5 clases de vertebrados</h3>
            <div className={styles.tableScroll}>
              <table className={styles.comparativaTableEdu}>
                <thead>
                  <tr>
                    <th className={styles.thEduClase}>Clase</th>
                    <th className={styles.thEdu}>Cámaras corazón</th>
                    <th className={styles.thEdu}>Temperatura</th>
                    <th className={styles.thEdu}>Reproducción</th>
                    <th className={styles.thEdu}>Respiración</th>
                    <th className={styles.thEdu}>Ejemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.trEdu}>
                    <td className={styles.tdEduLabel}>🐟 Peces</td>
                    <td className={styles.tdEdu}>2</td>
                    <td className={styles.tdEdu}>Ectotermo</td>
                    <td className={styles.tdEdu}>Ovíparo acuático</td>
                    <td className={styles.tdEdu}>Branquias</td>
                    <td className={styles.tdEdu}>Salmón atlántico</td>
                  </tr>
                  <tr className={styles.trEduAlt}>
                    <td className={styles.tdEduLabel}>🐸 Anfibios</td>
                    <td className={styles.tdEdu}>3</td>
                    <td className={styles.tdEdu}>Ectotermo</td>
                    <td className={styles.tdEdu}>Metamorfosis</td>
                    <td className={styles.tdEdu}>Piel + pulmones</td>
                    <td className={styles.tdEdu}>Rana común</td>
                  </tr>
                  <tr className={styles.trEdu}>
                    <td className={styles.tdEduLabel}>🦎 Reptiles</td>
                    <td className={styles.tdEdu}>3–4*</td>
                    <td className={styles.tdEdu}>Ectotermo</td>
                    <td className={styles.tdEdu}>Ovíparo terrestre</td>
                    <td className={styles.tdEdu}>Pulmones</td>
                    <td className={styles.tdEdu}>Tortuga laúd</td>
                  </tr>
                  <tr className={styles.trEduAlt}>
                    <td className={styles.tdEduLabel}>🦅 Aves</td>
                    <td className={styles.tdEdu}>4</td>
                    <td className={styles.tdEdu}>Endotermo</td>
                    <td className={styles.tdEdu}>Ovípara, incubación</td>
                    <td className={styles.tdEdu}>Pulmones + sacos aéreos</td>
                    <td className={styles.tdEdu}>Águila real</td>
                  </tr>
                  <tr className={styles.trEdu}>
                    <td className={styles.tdEduLabel}>🦁 Mamíferos</td>
                    <td className={styles.tdEdu}>4</td>
                    <td className={styles.tdEdu}>Endotermo</td>
                    <td className={styles.tdEdu}>Vivíparo + lactancia</td>
                    <td className={styles.tdEdu}>Pulmones</td>
                    <td className={styles.tdEdu}>León africano</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableNote}>* Los cocodrilos tienen 4 cámaras, con orificio de Panizza entre ventrículos.</p>
          </div>

          {/* ── 2. Casos de Uso ── */}
          <div>
            <h3 className={styles.eduSectionTitle}>¿Para quién es este visualizador?</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">📚</span>
                <h4 className={styles.escenarioTitulo}>Estudiante de bachillerato</h4>
                <p className={styles.escenarioDesc}>Prepara el examen de Biología repasando características de vertebrados e invertebrados, corazones, respiración y reproducción de cada clase.</p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">🌿</span>
                <h4 className={styles.escenarioTitulo}>Amante de la naturaleza</h4>
                <p className={styles.escenarioDesc}>Entiende por qué un pulpo, un insecto y una ballena pertenecen al mismo reino, y qué rasgos evolutivos los diferencia a través del árbol filogenético.</p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">👨‍👧</span>
                <h4 className={styles.escenarioTitulo}>Padre o madre con hijos</h4>
                <p className={styles.escenarioDesc}>Explica de forma visual por qué los tiburones son peces, las ballenas son mamíferos y los murciélagos no son pájaros, con ejemplos reales y curiosidades.</p>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">🏛️</span>
                <h4 className={styles.escenarioTitulo}>Preparador de oposiciones</h4>
                <p className={styles.escenarioDesc}>Consulta sinapomorfias, características diagnósticas y comparativas de sistemas biológicos para temarios de Biología, Ciencias Naturales o Geografía e Historia.</p>
              </div>
            </div>
          </div>

          {/* ── 3. FAQ ── */}
          <div>
            <h3 className={styles.eduSectionTitle}>Preguntas frecuentes</h3>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt className={styles.faqPregunta}>¿Cuántas especies de animales existen?</dt>
                <dd className={styles.faqRespuesta}>
                  Se han descrito aproximadamente 1,5 millones de especies animales. Sin embargo, las estimaciones científicas sitúan el total real entre 8 y 10 millones, con la mayoría de las especies por describir siendo insectos, nematodos y otros invertebrados de suelos tropicales.
                  <span className={styles.faqTip}>💡 Los artrópodos representan más del 75% de todas las especies animales conocidas.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqPregunta}>¿Cuál es la diferencia entre vertebrados e invertebrados?</dt>
                <dd className={styles.faqRespuesta}>
                  Los vertebrados poseen columna vertebral (endoesqueleto de cartílago u hueso) y forman el subfilo Vertebrata dentro del filo Chordata. Los invertebrados son todos los demás animales —sin columna vertebral— e incluyen desde esponjas hasta cefalópodos y artrópodos. El término «invertebrado» es descriptivo, no un grupo filogenético natural.
                  <span className={styles.faqTip}>💡 Los vertebrados son solo el 5% de las especies animales; el 95% restante son invertebrados.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqPregunta}>¿Los insectos son el grupo animal más numeroso?</dt>
                <dd className={styles.faqRespuesta}>
                  Sí. Con más de 1 millón de especies descritas —y estimaciones de 5 a 10 millones totales—, los insectos (clase Hexapoda) son el grupo más diverso del reino animal. Se estima que existen en todo momento unos 10 quintillones (10¹⁹) de insectos vivos en la Tierra.
                  <span className={styles.faqTip}>💡 Por cada persona en la Tierra hay aproximadamente 1,4 mil millones de insectos.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqPregunta}>¿Cuándo aparecieron los primeros animales en la Tierra?</dt>
                <dd className={styles.faqRespuesta}>
                  Los fósiles más antiguos de animales datan de hace unos 600-635 millones de años (Edicárico). La «explosión cámbrica» (hace ~541 Ma) fue el período de mayor diversificación, cuando aparecieron la mayoría de los grandes planes corporales (filos). Los vertebrados aparecieron hace unos 525 Ma.
                  <span className={styles.faqTip}>💡 Los animales terrestres colonizaron la tierra firme hace ~375 Ma, tras las plantas.</span>
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt className={styles.faqPregunta}>¿Son los mamíferos los animales más evolucionados?</dt>
                <dd className={styles.faqRespuesta}>
                  No. La evolución no tiene dirección ni jerarquía: todos los organismos vivos actuales han evolucionado el mismo tiempo desde el origen de la vida. Los mamíferos tienen características adaptativas complejas (placenta, lactancia, neocórtex), pero los insectos, con su exoesqueleto y metamorfosis, son igualmente «evolucionados» para su nicho ecológico.
                  <span className={styles.faqTip}>💡 La filogenia molecular ha revelado que los pulpos (invertebrados) poseen una inteligencia cognitiva comparable a vertebrados avanzados.</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* ── 4. Guía Paso a Paso ── */}
          <div>
            <h3 className={styles.eduSectionTitle}>Cómo estudiar el árbol filogenético animal</h3>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <strong>Empieza por la raíz</strong>: Identifica qué caracteriza al reino Animalia completo — pluricelularidad, heterotrofía, movilidad y reproducción sexual. Eso es la sinapomorfia del nodo Animalia.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <strong>Aprende las grandes divisiones</strong>: Parazoa (esponjas) vs. Eumetazoa (todos los demás); Radiata (simetría radial: cnidarios) vs. Bilateria (simetría bilateral). Estos dos bifurcaciones explican el 90% de la clasificación.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <strong>Distingue Protostomia de Deuterostomia</strong>: el blastoporo — primer orificio embrionario — origina la boca en los protostomados (artrópodos, moluscos, anélidos) y el ano en los deuterostomados (equinodermos, cordados). Esta diferencia es clave para entender por qué estamos más emparentados con una estrella de mar que con un cangrejo.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <strong>Conecta características con hitos evolutivos</strong>: cada nodo del árbol representa una innovación (sinapomorfia). Memoriza 5-6 hitos clave: tejidos → celoma → amnios → mandíbulas → endotermia → placenta. Cada uno define un grupo.
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <strong>Practica con ejemplos</strong>: Dado un animal, ubícalo en el árbol partiendo de la raíz. ¿Tiene tejidos? → Eumetazoa. ¿Simetría bilateral? → Bilateria. ¿Notocorda? → Chordata. ¿Columna vertebral? → Vertebrata. ¿Amnios? → Amniota. Así llegas a cualquier grupo.
                </div>
              </li>
            </ol>
          </div>

          {/* ── 5. Mejores Prácticas ── */}
          <div>
            <h3 className={styles.eduSectionTitle}>Tips para aprender taxonomía y zoología</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌳</span>
                <div>
                  <strong>Piensa en árboles, no en escaleras</strong>
                  <p>La taxonomía no es una escalera de «más a menos evolucionado». Es un árbol de ramificaciones. Un lagarto y un águila comparten el clado Sauropsida; ambos son igualmente «avanzados» respecto a sus antepasados comunes.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔑</span>
                <div>
                  <strong>Aprende las sinapomorfias, no las listas</strong>
                  <p>En vez de memorizar listas de características, aprende el rasgo diagnóstico único de cada grupo (la sinapomorfia). Las plumas son sinapomorfia de las aves; los nematocistos, de los cnidarios. Un rasgo, un grupo.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <div>
                  <strong>Usa tablas comparativas para el corazón</strong>
                  <p>El número de cámaras del corazón es el dato más preguntado en exámenes. Recuerda la progresión 2 (peces) → 3 (anfibios, reptiles) → 4 (aves, mamíferos) como hito de eficiencia circulatoria creciente.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <div>
                  <strong>Conecta excreción con entorno</strong>
                  <p>El producto de excreción nitrogenada está directamente relacionado con el entorno: amoniaco (tóxico, necesita mucha agua → acuáticos), urea (moderado → anfibios/mamíferos), ácido úrico (casi sólido, mínima agua → reptiles/aves).</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎯</span>
                <div>
                  <strong>Los invertebrados son el 95%: no los ignores</strong>
                  <p>Es fácil centrarse en vertebrados porque son más visibles, pero los invertebrados dominan la biodiversidad. Los artrópodos solos tienen más de 1 millón de especies descritas. Aprende al menos los 7 filos principales y sus rasgos diagnósticos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 6. Warning Box ── */}
          <div className={styles.warningBoxEdu} role="note">
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores comunes al clasificar animales</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>«Las aves son reptiles»</strong>: Filogenéticamente es correcto — las aves son dinosaurios terópodos (Sauropsida). Sin embargo, en la clasificación tradicional (Linneana) se tratan como clases separadas. Especifica siempre si usas clasificación filogenética o morfológica.</li>
              <li><strong>«Los peces son un grupo natural»</strong>: Los peces son parafiléticos: los peces óseos (Osteichthyes) incluyen a los tetrápodos. Técnicamente, los humanos son un tipo de «pez óseo». El término «peces» es conveniente pero no describe un clado real.</li>
              <li><strong>«Las ballenas son peces»</strong>: Son mamíferos placentarios (Cetacea), emparentados con los hipopótamos. Tienen pulmones, sangre caliente, pelo (vestigial) y amamantan a sus crías. Su morfología convergió con la de los peces por adaptación al medio acuático.</li>
              <li><strong>«Los murciélagos son pájaros»</strong>: Los murciélagos son mamíferos (orden Chiroptera). Las aves y los murciélagos desarrollaron el vuelo de forma independiente (evolución convergente): las alas de los pájaros son plumas modificadas; las de los murciélagos, membranas cutáneas entre dedos elongados.</li>
              <li><strong>«Los reptiles son ectotermios porque son primitivos»</strong>: La ectotermia no es una limitación «primitiva»; es una estrategia energética eficiente. Un reptil consume hasta 10 veces menos energía que un mamífero de igual tamaño. Es una adaptación, no una deficiencia.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-reino-animal')} />
        <ShareCard appName="visualizador-reino-animal" />
      </main>

      <Footer appName="visualizador-reino-animal" />
    </div>
  );
}
