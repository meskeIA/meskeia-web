'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ProteinasPlegamiento.module.css';
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

type NivelEstructura = '1' | '2' | '3' | '4';

interface TipoFuncional {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  ejemplos: string;
}

interface Enfermedad {
  id: string;
  nombre: string;
  icono: string;
  proteina: string;
  mecanismo: string;
  detalle: string;
}

// ─────────────────────────────────────────────
// Datos: Niveles de estructura
// ─────────────────────────────────────────────

const NIVELES_INFO: Record<NivelEstructura, { titulo: string; subtitulo: string; descripcion: string }> = {
  '1': {
    titulo: '1° Estructura Primaria',
    subtitulo: 'Cadena lineal de aminoácidos',
    descripcion: 'Secuencia de aminoácidos determinada por el ADN. La secuencia lo es todo: determina completamente la estructura final. Un solo cambio de aminoácido puede eliminar la función o causar enfermedad (ej: anemia de células falciformes por cambio Glu→Val en hemoglobina).',
  },
  '2': {
    titulo: '2° Estructura Secundaria',
    subtitulo: 'Hélice alfa y lámina beta',
    descripcion: 'Estructuras locales estabilizadas por puentes de hidrógeno entre el esqueleto peptídico. La hélice alfa gira cada 3,6 residuos. Las láminas beta forman estructuras rígidas en zigzag. Ambas son los "ladrillos" de las proteínas.',
  },
  '3': {
    titulo: '3° Estructura Terciaria',
    subtitulo: 'Plegamiento 3D global',
    descripcion: 'La cadena se pliega sobre sí misma. Las interacciones hidrofóbicas entierran los residuos apolares en el interior. Puentes disulfuro, interacciones iónicas y van der Waals estabilizan la forma. El sitio activo emerge de la estructura 3D.',
  },
  '4': {
    titulo: '4° Estructura Cuaternaria',
    subtitulo: 'Múltiples subunidades',
    descripcion: 'Varias cadenas polipeptídicas se ensamblan. La hemoglobina (4 cadenas: 2α + 2β) es el ejemplo clásico: cada cambio de oxígeno altera la afinidad del resto (efecto alostérico). No todas las proteínas tienen estructura cuaternaria.',
  },
};

// ─────────────────────────────────────────────
// Datos: Tipos funcionales
// ─────────────────────────────────────────────

const TIPOS_FUNCIONALES: TipoFuncional[] = [
  {
    id: 'enzimas',
    nombre: 'Enzimas',
    icono: '🧪',
    descripcion: 'Catalizadores biológicos. Aceleran reacciones hasta 10¹⁷ veces sin consumirse. Su sitio activo es específico para un sustrato (modelo llave-cerradura o inducción por ajuste).',
    ejemplos: 'ADN polimerasa (replica el ADN), amilasa salival (digiere almidón), lipasa (digiere grasas), lactasa (digiere lactosa).',
  },
  {
    id: 'estructurales',
    nombre: 'Estructurales',
    icono: '🏗️',
    descripcion: 'Dan forma y resistencia a tejidos y células. Suelen ser fibrosas (no globulares) con alta proporción de hélices alfa o estructuras en triple hélice.',
    ejemplos: 'Colágeno (tendones, hueso, piel), queratina (pelo, uñas, cuernos), actina (citoesqueleto), fibrina (coágulos de sangre).',
  },
  {
    id: 'transporte',
    nombre: 'Transporte',
    icono: '🚚',
    descripcion: 'Llevan moléculas por el organismo o a través de membranas. Tienen bolsillos de unión específicos que cambian de afinidad según el entorno (pH, O₂...).',
    ejemplos: 'Hemoglobina (O₂ y CO₂), albúmina (ácidos grasos en sangre), transferrina (hierro), lipoproteínas LDL/HDL (lípidos).',
  },
  {
    id: 'hormonas',
    nombre: 'Hormonas',
    icono: '📡',
    descripcion: 'Señalización química entre órganos. Las hormonas proteínicas actúan sobre receptores de membrana (no atraviesan la célula, a diferencia de las esteroideas).',
    ejemplos: 'Insulina (glucosa), hormona del crecimiento GH (desarrollo), FSH y LH (ciclo menstrual), glucagón (glucemia), eritropoyetina EPO (glóbulos rojos).',
  },
  {
    id: 'inmunes',
    nombre: 'Inmunes',
    icono: '🛡️',
    descripcion: 'Defienden el organismo frente a patógenos. Los anticuerpos reconocen con precisión molecular a patógenos específicos. El complemento destruye directamente membranas bacterianas.',
    ejemplos: 'Anticuerpos IgG, IgM, IgA, IgE. Complemento (C3, C5). Interferones (señal antiviral). Interleuquinas (coordinación inmune). Proteína C reactiva (inflamación).',
  },
  {
    id: 'motoras',
    nombre: 'Motoras',
    icono: '⚙️',
    descripcion: 'Convierten energía química (ATP) en movimiento mecánico. Caminan literalmente sobre filamentos de actina o tubulina con pasos nanométricos.',
    ejemplos: 'Miosina II (contracción muscular), dineína (transporte retrógrado axonal, movimiento ciliar), kinesina (transporte anterógrado axonal), flagelina (motores bacterianos).',
  },
];

// ─────────────────────────────────────────────
// Datos: Enfermedades de mal plegamiento
// ─────────────────────────────────────────────

const ENFERMEDADES: Enfermedad[] = [
  {
    id: 'alzheimer',
    nombre: 'Alzheimer',
    icono: '🧠',
    proteina: 'Péptido Aβ y proteína Tau',
    mecanismo: 'Depósito extracelular de placas de beta-amiloide + ovillos intracelulares de Tau hiperfosforilada.',
    detalle: 'El péptido beta-amiloide (Aβ) se produce por corte anómalo de la proteína APP. Normalmente se elimina; en Alzheimer se acumula en oligómeros solubles tóxicos y luego en placas. La proteína Tau, que estabiliza los microtúbulos del axón, se hiperfosforila, se desprende y forma los ovillos neurofibrilares. Juntos destruyen las sinapsis y luego las neuronas, empezando por el hipocampo (memoria).',
  },
  {
    id: 'parkinson',
    nombre: 'Parkinson',
    icono: '🫨',
    proteina: 'α-Sinucleína',
    mecanismo: 'La alfa-sinucleína forma agregados insolubles llamados Cuerpos de Lewy en neuronas dopaminérgicas de la sustancia negra.',
    detalle: 'La alfa-sinucleína (α-syn) es una proteína soluble normalmente asociada a vesículas sinápticas. En Parkinson, se mal pliega y agrega formando los cuerpos de Lewy, inclusiones intraneuronales características. La pérdida de neuronas dopaminérgicas en la sustancia negra compacta provoca el déficit dopaminérgico en el estriado: temblor en reposo, rigidez, bradicinesia. La levodopa (precursor de dopamina) es el tratamiento clásico, aunque no frena la neurodegeneración.',
  },
  {
    id: 'priones',
    nombre: 'Enfermedades por Priones',
    icono: '☠️',
    proteina: 'PrPᶜ → PrPˢᶜ',
    mecanismo: 'La proteína priónica normal (PrPᶜ, α-hélices) se convierte en la isoforma mal plegada (PrPˢᶜ, láminas β) que actúa como molde contagioso.',
    detalle: 'El dogma "solo proteína" de Prusiner: la PrPˢᶜ recluta y convierte a la PrPᶜ normal, propagándose exponencialmente sin necesitar ácido nucleico. Las enfermedades resultantes son raras pero 100% letales: Creutzfeldt-Jakob esporádico (CJD, 1-2/millón), variante CJD por encefalopatía espongiforme bovina (vaca loca/BSE), Kuru (transmisión por canibalismo ritual), Gerstmann-Sträussler-Scheinker (familiar). El cerebro desarrolla aspecto espongiforme (lleno de vacuolas). Sin tratamiento.',
  },
  {
    id: 'fibrosis',
    nombre: 'Fibrosis Quística',
    icono: '🫁',
    proteina: 'CFTR (ΔF508)',
    mecanismo: 'La mutación ΔF508 hace que CFTR se plegue mal y sea degradada por el proteosoma antes de llegar a la membrana apical.',
    detalle: 'CFTR es un canal de cloro de membrana. La deleción de fenilalanina 508 (ΔF508, mutación en 90% de pacientes) produce una proteína que no se pliega correctamente en el retículo endoplasmático y es degradada por el control de calidad celular (ERAD). Sin CFTR en la membrana, el moco se acumula espeso en pulmón y páncreas. Los nuevos fármacos "correctores y potenciadores" (ivacaftor, lumacaftor, elexacaftor/tezacaftor/ivacaftor — Trikafta) actúan como chaperonas farmacológicas que ayudan a CFTR a plegarse y mantenerse en membrana: eficacia >90% en portadores ΔF508.',
  },
];

// ─────────────────────────────────────────────
// SVG: Estructura Primaria
// ─────────────────────────────────────────────

function SvgEstructuraPrimaria() {
  const aminoacidos = ['G', 'A', 'V', 'L', 'I', 'P', 'F', 'W', 'M', 'S'];
  const colores = ['#2E86AB', '#48A9A6', '#27AE60', '#E67E22', '#9B59B6', '#E74C3C', '#F1C40F', '#2E86AB', '#48A9A6', '#27AE60'];
  return (
    <svg viewBox="0 0 440 80" className={styles.svgFull} aria-label="Cadena de aminoácidos — estructura primaria">
      {aminoacidos.map((aa, i) => {
        const cx = 30 + i * 42;
        return (
          <g key={aa + i}>
            {i > 0 && <line x1={cx - 16} y1={40} x2={cx - 6} y2={40} stroke="#ccc" strokeWidth="2" />}
            <circle cx={cx} cy={40} r={18} fill={colores[i]} fillOpacity="0.15" stroke={colores[i]} strokeWidth="2" />
            <text x={cx} y={45} textAnchor="middle" fontSize="13" fontWeight="700" fill={colores[i]}>{aa}</text>
          </g>
        );
      })}
      <text x={220} y={72} textAnchor="middle" fontSize="10" fill="#999">N-terminal → ... → C-terminal</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Estructura Secundaria
// ─────────────────────────────────────────────

function SvgEstructuraSecundaria() {
  // Hélice alfa: sinusoide
  const helicePuntos = Array.from({ length: 60 }, (_, i) => {
    const x = 20 + i * 2.5;
    const y = 50 + Math.sin(i * 0.45) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 440 140" className={styles.svgFull} aria-label="Estructura secundaria: hélice alfa y lámina beta">
      {/* Etiqueta hélice alfa */}
      <text x={95} y={14} textAnchor="middle" fontSize="11" fontWeight="700" fill="#2E86AB">Hélice Alfa (α)</text>
      {/* Hélice alfa */}
      <polyline points={helicePuntos} fill="none" stroke="#2E86AB" strokeWidth="3" strokeLinecap="round" />
      {/* Puentes H en hélice */}
      {[0, 1, 2, 3].map(j => (
        <line key={j} x1={20 + j * 37} y1={70} x2={20 + j * 37 + 14} y2={30} stroke="#2E86AB" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
      ))}

      {/* Separador */}
      <line x1={220} y1={10} x2={220} y2={130} stroke="#E5E5E5" strokeWidth="1" />

      {/* Etiqueta lámina beta */}
      <text x={330} y={14} textAnchor="middle" fontSize="11" fontWeight="700" fill="#48A9A6">Lámina Beta (β)</text>

      {/* Láminas beta: 3 cadenas paralelas con flechas */}
      {[0, 1, 2].map(row => {
        const y = 30 + row * 30;
        return (
          <g key={row}>
            {/* Cadena principal */}
            <line x1={240} y1={y + 8} x2={400} y2={y + 8} stroke="#48A9A6" strokeWidth="3" />
            {/* Punta de flecha */}
            <polygon points={`400,${y+2} 414,${y+8} 400,${y+14}`} fill="#48A9A6" />
            {/* Puentes H entre cadenas */}
            {row < 2 && [260, 300, 340, 380].map(x => (
              <line key={x} x1={x} y1={y + 8} x2={x} y2={y + 30} stroke="#48A9A6" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            ))}
          </g>
        );
      })}
      <text x={330} y={128} textAnchor="middle" fontSize="9" fill="#999">--- puentes de hidrógeno</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Estructura Terciaria
// ─────────────────────────────────────────────

function SvgEstructuraTerciaria() {
  return (
    <svg viewBox="0 0 300 200" className={styles.svgMed} aria-label="Estructura terciaria: plegamiento 3D global">
      {/* Blob principal — zona exterior */}
      <ellipse cx={150} cy={100} rx={110} ry={80} fill="#2E86AB" fillOpacity="0.08" stroke="#2E86AB" strokeWidth="2" />
      {/* Hélices (rojo) */}
      <ellipse cx={110} cy={75} rx={35} ry={18} fill="#E74C3C" fillOpacity="0.25" stroke="#E74C3C" strokeWidth="1.5" />
      <text x={110} y={79} textAnchor="middle" fontSize="9" fill="#E74C3C" fontWeight="600">hélices α</text>
      {/* Láminas (amarillo) */}
      <rect x={155} y={58} width={60} height={22} rx={4} fill="#F1C40F" fillOpacity="0.3" stroke="#F1C40F" strokeWidth="1.5" />
      <text x={185} y={73} textAnchor="middle" fontSize="9" fill="#B7950B" fontWeight="600">láminas β</text>
      {/* Loops (gris) */}
      <path d="M 90 115 Q 150 145 210 115" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" />
      <text x={150} y={148} textAnchor="middle" fontSize="9" fill="#888">loops</text>
      {/* Interior hidrofóbico */}
      <ellipse cx={150} cy={95} rx={28} ry={20} fill="#48A9A6" fillOpacity="0.15" stroke="#48A9A6" strokeWidth="1" strokeDasharray="4,2" />
      <text x={150} y={99} textAnchor="middle" fontSize="8" fill="#48A9A6">interior</text>
      <text x={150} y={110} textAnchor="middle" fontSize="7" fill="#48A9A6">hidrofóbico</text>
      {/* Sitio activo */}
      <circle cx={195} cy={130} r={12} fill="#E74C3C" fillOpacity="0.2" stroke="#E74C3C" strokeWidth="2" />
      <text x={195} y={134} textAnchor="middle" fontSize="8" fill="#E74C3C" fontWeight="700">SA</text>
      <text x={195} y={158} textAnchor="middle" fontSize="9" fill="#E74C3C">sitio activo</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Estructura Cuaternaria
// ─────────────────────────────────────────────

function SvgEstructuraCuaternaria() {
  const subunidades = [
    { cx: 100, cy: 85, color: '#2E86AB', label: 'α₁' },
    { cx: 175, cy: 70, color: '#E74C3C', label: 'β₁' },
    { cx: 195, cy: 130, color: '#E74C3C', label: 'β₂' },
    { cx: 110, cy: 140, color: '#2E86AB', label: 'α₂' },
  ];
  return (
    <svg viewBox="0 0 300 200" className={styles.svgMed} aria-label="Estructura cuaternaria: hemoglobina con 4 subunidades">
      {/* Líneas de contacto entre subunidades */}
      <line x1={100} y1={85} x2={175} y2={70} stroke="#ccc" strokeWidth="2" strokeDasharray="4,3" />
      <line x1={175} y1={70} x2={195} y2={130} stroke="#ccc" strokeWidth="2" strokeDasharray="4,3" />
      <line x1={195} y1={130} x2={110} y2={140} stroke="#ccc" strokeWidth="2" strokeDasharray="4,3" />
      <line x1={110} y1={140} x2={100} y2={85} stroke="#ccc" strokeWidth="2" strokeDasharray="4,3" />
      <line x1={100} y1={85} x2={195} y2={130} stroke="#ccc" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />
      <line x1={175} y1={70} x2={110} y2={140} stroke="#ccc" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.5" />

      {subunidades.map(s => (
        <g key={s.label}>
          <ellipse cx={s.cx} cy={s.cy} rx={38} ry={28} fill={s.color} fillOpacity="0.15" stroke={s.color} strokeWidth="2" />
          <text x={s.cx} y={s.cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={s.color}>{s.label}</text>
        </g>
      ))}

      <text x={150} y={185} textAnchor="middle" fontSize="10" fill="#666">Hemoglobina (2α + 2β) — efecto alostérico</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// SVG: Funnel energético
// ─────────────────────────────────────────────

function SvgFunnelEnergetico() {
  return (
    <svg viewBox="0 0 340 280" className={styles.svgMed} aria-label="Funnel energético del plegamiento proteínico">
      {/* Gradiente de color */}
      <defs>
        <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E74C3C" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#F39C12" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#2E86AB" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* Embudo */}
      <path
        d="M 20 20 L 320 20 L 200 240 L 140 240 Z"
        fill="url(#funnelGrad)"
        stroke="#2E86AB"
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Borde izquierdo del funnel */}
      <line x1={20} y1={20} x2={140} y2={240} stroke="#E74C3C" strokeWidth="2" opacity="0.7" />
      {/* Borde derecho del funnel */}
      <line x1={320} y1={20} x2={200} y2={240} stroke="#E74C3C" strokeWidth="2" opacity="0.7" />

      {/* Eje Y */}
      <line x1={8} y1={15} x2={8} y2={250} stroke="#999" strokeWidth="1.5" />
      <text x={6} y={13} textAnchor="middle" fontSize="9" fill="#999">↑</text>
      <text x={6} y={25} fontSize="8" fill="#999" transform="rotate(-90,6,50)" textAnchor="middle">Energía libre</text>

      {/* Etiquetas */}
      <text x={170} y={15} textAnchor="middle" fontSize="9" fill="#E74C3C" fontWeight="600">muchas conformaciones — alta energía</text>
      <text x={170} y={258} textAnchor="middle" fontSize="9" fill="#2E86AB" fontWeight="600">estructura nativa — mínimo energético</text>

      {/* Puntos en el funnel */}
      <circle cx={80} cy={50} r={5} fill="#E74C3C" />
      <text x={88} y={54} fontSize="9" fill="#E74C3C">cadena desplegada</text>

      <circle cx={200} cy={50} r={5} fill="#E74C3C" />

      <circle cx={130} cy={135} r={5} fill="#F39C12" />
      <text x={138} y={139} fontSize="9" fill="#E67E22">intermedios</text>

      <circle cx={200} cy={135} r={5} fill="#F39C12" />

      <circle cx={170} cy={230} r={6} fill="#2E86AB" />
      <text x={178} y={234} fontSize="9" fill="#2E86AB" fontWeight="600">nativa</text>

      {/* Partículas en la superficie */}
      {[50, 100, 150, 240, 290].map((x, i) => (
        <circle key={i} cx={x} cy={35 + (i % 2) * 12} r={3} fill="#E74C3C" fillOpacity="0.5" />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorProteinasPlegamiento() {
  const [nivelActivo, setNivelActivo] = useState<NivelEstructura>('1');
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);
  const [enfermedadSeleccionada, setEnfermedadSeleccionada] = useState<string | null>(null);

  const nivelInfo = NIVELES_INFO[nivelActivo];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Plegamiento de Proteínas</h1>
          <p className={styles.subtitle}>De la cadena de aminoácidos a la estructura funcional 3D</p>
        </header>

        <LegalNotice />

        {/* ── Sección 1: Los 4 niveles de estructura ── */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Los 4 Niveles de Estructura Proteínica</h2>
          <p className={styles.seccionDesc}>El plegamiento es jerárquico: cada nivel emerge del anterior.</p>

          {/* Tabs de nivel */}
          <div className={styles.nivelTabs} role="tablist" aria-label="Niveles de estructura proteínica">
            {(['1', '2', '3', '4'] as NivelEstructura[]).map(n => (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={nivelActivo === n}
                className={`${styles.nivelTab} ${nivelActivo === n ? styles.nivelTabActivo : ''}`}
                onClick={() => setNivelActivo(n)}
              >
                <span className={styles.nivelNum}>{n}°</span>
                <span className={styles.nivelLabel}>
                  {n === '1' && 'Primaria'}
                  {n === '2' && 'Secundaria'}
                  {n === '3' && 'Terciaria'}
                  {n === '4' && 'Cuaternaria'}
                </span>
              </button>
            ))}
          </div>

          {/* Panel del nivel activo */}
          <div className={styles.nivelPanel} role="tabpanel">
            <div className={styles.nivelHeader}>
              <h3 className={styles.nivelTitulo}>{nivelInfo.titulo}</h3>
              <p className={styles.nivelSubtitulo}>{nivelInfo.subtitulo}</p>
            </div>
            <div className={styles.nivelSvgWrap}>
              {nivelActivo === '1' && <SvgEstructuraPrimaria />}
              {nivelActivo === '2' && <SvgEstructuraSecundaria />}
              {nivelActivo === '3' && <SvgEstructuraTerciaria />}
              {nivelActivo === '4' && <SvgEstructuraCuaternaria />}
            </div>
            <p className={styles.nivelDesc}>{nivelInfo.descripcion}</p>
          </div>
        </section>

        {/* ── Sección 2: Funnel energético ── */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>El Funnel Energético del Plegamiento</h2>
          <p className={styles.seccionDesc}>¿Por qué el plegamiento ocurre en milisegundos y no en miles de millones de años?</p>

          <div className={styles.funnelContainer}>
            <SvgFunnelEnergetico />
            <div className={styles.funnelTexto}>
              <h3 className={styles.funnelSubtitulo}>La paradoja de Levinthal (1969)</h3>
              <p>Si una proteína de 100 aminoácidos explorara todas las conformaciones posibles al azar (incluso solo 3 por enlace), tardaría más que la edad del universo. Pero en la célula se pliega en milisegundos.</p>
              <p>El <strong>funnel energético</strong> explica el misterio: no hay exploración aleatoria. El paisaje energético tiene una forma de embudo que guía la cadena hacia el estado de mínima energía libre: la estructura nativa.</p>
              <p>En la parte ancha del funnel (alta energía) hay innumerables conformaciones no plegadas. A medida que la proteína se pliega, va bajando por el paisaje energético hasta llegar al estrecho inferior: la estructura nativa única y funcional.</p>
            </div>
          </div>
        </section>

        {/* ── Sección 3: Tipos funcionales ── */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>6 Tipos Funcionales de Proteínas</h2>
          <p className={styles.seccionDesc}>La estructura determina la función. Haz clic para ampliar cada tipo.</p>

          <div className={styles.tiposGrid}>
            {TIPOS_FUNCIONALES.map(tipo => (
              <button
                key={tipo.id}
                type="button"
                className={`${styles.tipoCard} ${tipoSeleccionado === tipo.id ? styles.tipoCardActivo : ''}`}
                onClick={() => setTipoSeleccionado(tipoSeleccionado === tipo.id ? null : tipo.id)}
                aria-expanded={tipoSeleccionado === tipo.id}
              >
                <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
                <span className={styles.tipoNombre}>{tipo.nombre}</span>
                {tipoSeleccionado === tipo.id && (
                  <div className={styles.tipoDetalle}>
                    <p className={styles.tipoDesc}>{tipo.descripcion}</p>
                    <p className={styles.tipoEjemplos}><strong>Ejemplos:</strong> {tipo.ejemplos}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Sección 4: Enfermedades de mal plegamiento ── */}
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Enfermedades de Mal Plegamiento</h2>
          <p className={styles.seccionDesc}>Cuando una proteína no se pliega correctamente, las consecuencias pueden ser devastadoras. Haz clic para ver el mecanismo molecular.</p>

          <div className={styles.enfermedadesGrid}>
            {ENFERMEDADES.map(enf => (
              <div key={enf.id} className={styles.enfermedadCard}>
                <button
                  type="button"
                  className={styles.enfermedadBtn}
                  onClick={() => setEnfermedadSeleccionada(enfermedadSeleccionada === enf.id ? null : enf.id)}
                  aria-expanded={enfermedadSeleccionada === enf.id}
                >
                  <span className={styles.enfermedadIcono} aria-hidden="true">{enf.icono}</span>
                  <div className={styles.enfermedadInfo}>
                    <h3 className={styles.enfermedadNombre}>{enf.nombre}</h3>
                    <p className={styles.enfermedadProteina}>{enf.proteina}</p>
                  </div>
                  <span className={styles.enfermedadToggle} aria-hidden="true">
                    {enfermedadSeleccionada === enf.id ? '▲' : '▼'}
                  </span>
                </button>

                {enfermedadSeleccionada === enf.id && (
                  <div className={styles.enfermedadDetalle}>
                    <p className={styles.enfermedadMecanismo}><strong>Mecanismo:</strong> {enf.mecanismo}</p>
                    <p className={styles.enfermedadTexto}>{enf.detalle}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chaperonas moleculares */}
          <div className={styles.chaperonasBox}>
            <div className={styles.chaperonasHeader}>
              <span className={styles.chaperonasIcono} aria-hidden="true">🤲</span>
              <h3 className={styles.chaperonasTitulo}>Chaperonas Moleculares: los guardianes del plegamiento</h3>
            </div>
            <p className={styles.chaperonasTexto}>
              Las <strong>chaperonas</strong> (HSP70, HSP90, GroEL/GroES) son proteínas especializadas en asistir el plegamiento de otras proteínas, prevenir la agregación y reparar proteínas dañadas. Se sobreexpresan durante fiebres y estrés celular — de ahí su nombre de <em>heat shock proteins</em> (proteínas de shock térmico).
            </p>
            <p className={styles.chaperonasTexto}>
              El sistema GroEL/GroES es especialmente fascinante: GroEL forma una cámara cilíndrica donde la proteína se pliega en un entorno aislado, protegida de otras moléculas que podrían causar agregación. GroES actúa como tapa. El ATP impulsa los cambios conformacionales que liberan la proteína correctamente plegada.
            </p>
          </div>
        </section>

        <EducationalSection title="Ciencia del plegamiento proteínico" subtitle="Del código genético a la estructura funcional">
          <p>
            <strong>La paradoja de Levinthal</strong> planteó en 1969 el problema fundamental: una proteína de solo 100 aminoácidos tiene un número astronómico de conformaciones posibles. Si explorara cada una durante el tiempo de un enlace rotacional (~10⁻¹³ s), tardaría 10⁷⁷ años — más que la edad del universo. Sin embargo, las proteínas se pliegan en microsegundos a milisegundos. La solución es el funnel energético: el paisaje de energía libre no es plano sino que tiene forma de embudo, guiando el plegamiento hacia la estructura nativa de forma determinista.
          </p>
          <p>
            <strong>¿Por qué el plegamiento es tan importante?</strong> Una proteína no plegada (o mal plegada) es una proteína disfuncional. El plegamiento incorrecto puede tener tres consecuencias: pérdida de función (la proteína no hace lo que debe, como en fibrosis quística), ganancia de función tóxica (la proteína mal plegada daña la célula, como en Alzheimer y Parkinson), o capacidad de "contagiar" el mal plegamiento a otras proteínas (priones). Las tres son devastadoras.
          </p>
          <div className={styles.warningBox} role="note">
            El estudio de las enfermedades de mal plegamiento es uno de los campos más activos de la biología molecular. Los tratamientos actuales apenas rozan la superficie del problema: en Alzheimer, todos los ensayos clínicos dirigidos a eliminar las placas de beta-amiloide han fracasado o tienen eficacia muy limitada. En priones, no existe ningún tratamiento eficaz. Solo en fibrosis quística los nuevos fármacos "moduladores de CFTR" han supuesto un avance transformador — demostrando que rescatar el plegamiento es terapéuticamente posible.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-proteinas-plegamiento')} />
        <ShareCard appName="visualizador-proteinas-plegamiento" />
        <Footer appName="visualizador-proteinas-plegamiento" />
      </div>
    </>
  );
}
