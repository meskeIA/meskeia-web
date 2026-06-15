'use client';
// @disclaimer: exempt
import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './CicloNitrogeno.module.css';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface ProcesoDetalle {
  id: string;
  nombre: string;
  agente: string;
  compuestos: string;
  importancia: string;
  color: string;
}

interface Microorganismo {
  id: string;
  nombre: string;
  proceso: string;
  condicion: string;
  importanciaAgricola: string;
  curiosidad: string;
  emoji: string;
}

interface CicloBiogeoquimico {
  id: string;
  nombre: string;
  reservorio: string;
  formaAsimilable: string;
  organismos: string;
  escalaTemporal: string;
  alteracionHumana: string;
  nivelAlteracion: 'alta' | 'muy-alta' | 'media';
  descripcion: string;
}

// ─── Datos ───────────────────────────────────────────────────────────────────

const PROCESOS: ProcesoDetalle[] = [
  {
    id: 'fijacion-biologica',
    nombre: 'Fijación biológica',
    agente: 'Rhizobium (simbiótico en leguminosas), Azotobacter (libre)',
    compuestos: 'N₂ → NH₃ (amoniaco)',
    importancia: 'Convierte el N₂ atmosférico inerte en formas asimilables por las plantas. Sin este proceso, la vida terrestre sería imposible. Las leguminosas son cruciales en la agricultura ecológica.',
    color: '#2E86AB',
  },
  {
    id: 'fijacion-industrial',
    nombre: 'Fijación industrial (Haber-Bosch)',
    agente: 'Proceso industrial a alta presión y temperatura (Fe como catalizador)',
    compuestos: 'N₂ + H₂ → NH₃ (a 400°C, 200 atm)',
    importancia: 'Inventado en 1909, permite producir fertilizantes a escala global. Alimenta a ~4.000 millones de personas. Consume el 1-2% de la energía mundial.',
    color: '#E07B39',
  },
  {
    id: 'fijacion-rayos',
    nombre: 'Fijación por rayos',
    agente: 'Energía eléctrica de relámpagos',
    compuestos: 'N₂ + O₂ → NO → HNO₃ (ácido nítrico)',
    importancia: 'Aporta ~10 Tg N/año, una fracción pequeña pero significativa. Los rayos rompen el triple enlace del N₂ y permiten que el nitrógeno se combine con el oxígeno.',
    color: '#888888',
  },
  {
    id: 'asimilacion',
    nombre: 'Asimilación por plantas',
    agente: 'Plantas con raíces y transportadores de membrana',
    compuestos: 'NO₃⁻ + NH₄⁺ → aminoácidos, proteínas, ADN',
    importancia: 'Las plantas absorben nitrato y amonio del suelo para sintetizar aminoácidos y ácidos nucleicos. Base de toda la cadena alimentaria terrestre.',
    color: '#48A9A6',
  },
  {
    id: 'consumo-animal',
    nombre: 'Consumo animal',
    agente: 'Animales herbívoros y omnívoros',
    compuestos: 'Proteínas vegetales → proteínas animales → excrementos (urea, NH₃)',
    importancia: 'Los animales obtienen nitrógeno de las plantas y lo devuelven al suelo como urea y amoniaco mediante la excreción, cerrando parte del ciclo.',
    color: '#2E7D32',
  },
  {
    id: 'nitrificacion',
    nombre: 'Nitrificación',
    agente: 'Nitrosomonas (NH₃→NO₂⁻), Nitrobacter (NO₂⁻→NO₃⁻)',
    compuestos: 'NH₃ → NO₂⁻ → NO₃⁻',
    importancia: 'Proceso aeróbico en dos etapas que convierte el amoniaco tóxico en nitrato asimilable por las plantas. Esencial para la fertilidad del suelo.',
    color: '#F9A825',
  },
  {
    id: 'desnitrificacion',
    nombre: 'Desnitrificación',
    agente: 'Pseudomonas, Paracoccus y otras bacterias anaeróbicas',
    compuestos: 'NO₃⁻ → NO₂⁻ → NO → N₂O → N₂',
    importancia: 'Devuelve el nitrógeno a la atmósfera cerrando el ciclo. Ocurre en suelos encharcados y sin oxígeno. Clave para evitar la acumulación de nitratos.',
    color: '#C62828',
  },
  {
    id: 'descomposicion',
    nombre: 'Descomposición / Amonificación',
    agente: 'Hongos y bacterias descomponedoras (Bacillus, Proteus)',
    compuestos: 'Proteínas, urea → NH₃ + NH₄⁺ (amonio)',
    importancia: 'Los descomponedores degradan materia orgánica muerta y excrementos liberando amoniaco al suelo, que puede ser nitrificado o absorbido directamente por las plantas.',
    color: '#795548',
  },
];

const MICROORGANISMOS: Microorganismo[] = [
  {
    id: 'rhizobium',
    nombre: 'Rhizobium',
    proceso: 'Fijación biológica simbiótica',
    condicion: 'Aeróbico, dentro de nódulos radiculares',
    importanciaAgricola: 'Imprescindible para los cultivos de leguminosas (soja, garbanzo, lenteja). Ahorra fertilizantes nitrogenados y mejora la estructura del suelo.',
    curiosidad: 'Forma nódulos rosas en las raíces de las leguminosas gracias a la leghemoglobina, una proteína similar a la hemoglobina que protege la nitrogenasa del oxígeno.',
    emoji: '🌱',
  },
  {
    id: 'azotobacter',
    nombre: 'Azotobacter',
    proceso: 'Fijación biológica libre (no simbiótica)',
    condicion: 'Aeróbico, suelos con pH neutro',
    importanciaAgricola: 'No necesita plantas hospedadoras. Produce sustancias promotoras del crecimiento vegetal y polisacáridos que mejoran la textura del suelo.',
    curiosidad: 'Tiene la tasa respiratoria más alta conocida entre los organismos vivos, para proteger la nitrogenasa del O₂ consumiéndolo rápidamente.',
    emoji: '🦠',
  },
  {
    id: 'nitrosomonas',
    nombre: 'Nitrosomonas',
    proceso: 'Nitrificación: NH₃ → NO₂⁻ (primera etapa)',
    condicion: 'Estrictamente aeróbico, suelos y aguas oxigenadas',
    importanciaAgricola: 'Inicia la conversión del amoniaco en formas asimilables. Su actividad es clave para la eficiencia de los fertilizantes amoniacales.',
    curiosidad: 'Obtiene energía exclusivamente de la oxidación del amoniaco, siendo uno de los pocos organismos que "come" nitrógeno inorgánico como fuente de energía.',
    emoji: '⚗️',
  },
  {
    id: 'nitrobacter',
    nombre: 'Nitrobacter',
    proceso: 'Nitrificación: NO₂⁻ → NO₃⁻ (segunda etapa)',
    condicion: 'Estrictamente aeróbico, complementa a Nitrosomonas',
    importanciaAgricola: 'Completa la nitrificación produciendo nitrato (NO₃⁻), la forma preferida de nitrógeno para la mayoría de las plantas de cultivo.',
    curiosidad: 'Crece muy lentamente (duplica su población cada ~13 horas vs. 20 minutos de E. coli), lo que puede ser una limitación en suelos agrícolas intensivos.',
    emoji: '🔬',
  },
  {
    id: 'pseudomonas',
    nombre: 'Pseudomonas denitrificans',
    proceso: 'Desnitrificación: NO₃⁻ → N₂',
    condicion: 'Anaeróbico facultativo, suelos encharcados o compactados',
    importanciaAgricola: 'Puede causar pérdidas de nitrógeno en suelos de regadío mal drenados, reduciendo la eficiencia de los fertilizantes hasta un 30%.',
    curiosidad: 'Usa el nitrato como aceptor de electrones en lugar del O₂ para respirar. Es el único proceso que "cierra" el ciclo devolviendo N₂ a la atmósfera.',
    emoji: '🔄',
  },
];

const CICLOS: CicloBiogeoquimico[] = [
  {
    id: 'nitrogeno',
    nombre: 'Nitrógeno',
    reservorio: 'Atmósfera (78% N₂)',
    formaAsimilable: 'NO₃⁻, NH₄⁺',
    organismos: 'Rhizobium, Nitrosomonas, Nitrobacter, Pseudomonas',
    escalaTemporal: 'Días – años',
    alteracionHumana: 'Alta (Haber-Bosch)',
    nivelAlteracion: 'alta',
    descripcion: 'El nitrógeno es el 78% de la atmósfera pero inaccesible directamente para la mayoría de organismos. Requiere bacterias fijadoras o síntesis industrial para convertirse en formas asimilables.',
  },
  {
    id: 'carbono',
    nombre: 'Carbono',
    reservorio: 'Rocas/sedimentos y océanos',
    formaAsimilable: 'CO₂, glucosa',
    organismos: 'Plantas, algas, bacterias fotosintéticas',
    escalaTemporal: 'Días – millones de años',
    alteracionHumana: 'Muy alta (combustibles fósiles)',
    nivelAlteracion: 'muy-alta',
    descripcion: 'El carbono circula entre atmósfera, océanos y seres vivos principalmente como CO₂. La quema de combustibles fósiles ha aumentado el CO₂ atmosférico un 50% desde la industrialización.',
  },
  {
    id: 'fosforo',
    nombre: 'Fósforo',
    reservorio: 'Rocas sedimentarias',
    formaAsimilable: 'PO₄³⁻ (fosfato)',
    organismos: 'Descomponedores, micorrizas, plantas',
    escalaTemporal: 'Miles de años',
    alteracionHumana: 'Alta (fertilizantes, minería)',
    nivelAlteracion: 'alta',
    descripcion: 'El fósforo no tiene fase gaseosa significativa. Su ciclo es lento y depende de la erosión de rocas. La minería de fosfatos para fertilizantes está agotando reservas en pocas décadas.',
  },
  {
    id: 'azufre',
    nombre: 'Azufre',
    reservorio: 'Rocas y océanos (sulfatos)',
    formaAsimilable: 'SO₄²⁻, H₂S',
    organismos: 'Bacterias sulfurosas, descomponedores',
    escalaTemporal: 'Años – siglos',
    alteracionHumana: 'Media (combustión de carbón)',
    nivelAlteracion: 'media',
    descripcion: 'El azufre circula entre suelos, océanos y atmósfera. La quema de carbón libera SO₂ que forma lluvia ácida. Las bacterias sulfurosas son clave en ambientes anóxicos como fondos marinos.',
  },
];

// ─── Componente SVG: Ciclo principal ─────────────────────────────────────────

function CicloSVG({ procesoSeleccionado, onSelectProceso }: {
  procesoSeleccionado: string | null;
  onSelectProceso: (id: string) => void;
}) {
  const reservorios = [
    { id: 'atmosfera', label: 'Atmósfera', sublabel: 'N₂ = 78%', x: 200, y: 30, w: 140, h: 44, color: '#2E86AB' },
    { id: 'suelo', label: 'Suelo', sublabel: 'NH₄⁺, NO₃⁻', x: 20, y: 200, w: 110, h: 44, color: '#795548' },
    { id: 'plantas', label: 'Plantas', sublabel: 'Proteínas, ADN', x: 170, y: 200, w: 110, h: 44, color: '#48A9A6' },
    { id: 'animales', label: 'Animales', sublabel: 'Proteínas', x: 330, y: 200, w: 110, h: 44, color: '#F9A825' },
    { id: 'agua', label: 'Agua', sublabel: 'NO₃⁻ lixiviado', x: 360, y: 310, w: 100, h: 44, color: '#5C9BD6' },
  ];

  // Flechas: [id, x1, y1, x2, y2, label, color, curva]
  type FletchaData = [string, number, number, number, number, string, string, boolean];
  const flechas: FletchaData[] = [
    ['fijacion-biologica', 75, 200, 200, 74, 'Fijación biol.', '#2E86AB', false],
    ['fijacion-industrial', 270, 30, 270, 200, 'Haber-Bosch', '#E07B39', false],
    ['fijacion-rayos', 200, 52, 130, 200, 'Rayos', '#888888', false],
    ['asimilacion', 225, 244, 225, 244, 'Asimilación', '#48A9A6', false],
    ['consumo-animal', 280, 222, 330, 222, 'Consumo', '#2E7D32', false],
    ['nitrificacion', 75, 244, 170, 244, 'Nitrificación', '#F9A825', false],
    ['desnitrificacion', 75, 200, 200, 74, 'Denitrif.', '#C62828', true],
    ['descomposicion', 330, 244, 130, 244, 'Descompos.', '#795548', false],
  ];

  return (
    <svg viewBox="0 0 480 360" className={styles.cicloSvg} role="img" aria-label="Diagrama del ciclo del nitrógeno">
      <defs>
        <marker id="arrow-azul" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#2E86AB" />
        </marker>
        <marker id="arrow-naranja" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#E07B39" />
        </marker>
        <marker id="arrow-gris" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#888888" />
        </marker>
        <marker id="arrow-teal" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#48A9A6" />
        </marker>
        <marker id="arrow-verde" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#2E7D32" />
        </marker>
        <marker id="arrow-amarillo" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#F9A825" />
        </marker>
        <marker id="arrow-rojo" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#C62828" />
        </marker>
        <marker id="arrow-marron" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#795548" />
        </marker>
      </defs>

      {/* Fondo de atmósfera */}
      <rect x="0" y="0" width="480" height="90" rx="8" fill="#E3F2FD" opacity="0.4" />
      <text x="8" y="14" fontSize="10" fill="#1565C0" opacity="0.6">ATMÓSFERA</text>

      {/* Fondo de suelo */}
      <rect x="0" y="180" width="480" height="100" rx="8" fill="#EFEBE9" opacity="0.35" />
      <text x="8" y="194" fontSize="10" fill="#4E342E" opacity="0.6">SUELO / BIOSFERA</text>

      {/* Fondo de agua */}
      <rect x="0" y="290" width="480" height="65" rx="8" fill="#E1F5FE" opacity="0.4" />
      <text x="8" y="304" fontSize="10" fill="#01579B" opacity="0.6">HIDRÓSFERA</text>

      {/* Reservorios */}
      {reservorios.map(r => (
        <g key={r.id}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6"
            fill={r.color} opacity="0.18" stroke={r.color} strokeWidth="1.5" />
          <text x={r.x + r.w / 2} y={r.y + 16} textAnchor="middle"
            fontSize="11" fontWeight="bold" fill={r.color}>{r.label}</text>
          <text x={r.x + r.w / 2} y={r.y + 30} textAnchor="middle"
            fontSize="9" fill={r.color} opacity="0.9">{r.sublabel}</text>
        </g>
      ))}

      {/* Fijación biológica: suelo → atmósfera (invertida: atm → suelo) */}
      <line x1="130" y1="74" x2="95" y2="200"
        stroke="#2E86AB" strokeWidth="2" markerEnd="url(#arrow-azul)" />
      <rect x="45" y="130" width="70" height="16" rx="3" fill="white" opacity="0.85" />
      <text x="80" y="142" textAnchor="middle" fontSize="8.5" fill="#2E86AB"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('fijacion-biologica')}>Fijación biol.</text>

      {/* Fijación industrial: hacia plantas (atmósfera ↓ plantas) */}
      <line x1="280" y1="74" x2="250" y2="200"
        stroke="#E07B39" strokeWidth="2.5" strokeDasharray="5,3" markerEnd="url(#arrow-naranja)" />
      <rect x="290" y="130" width="70" height="16" rx="3" fill="white" opacity="0.85" />
      <text x="325" y="142" textAnchor="middle" fontSize="8.5" fill="#E07B39"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('fijacion-industrial')}>Haber-Bosch</text>

      {/* Rayos */}
      <line x1="200" y1="74" x2="155" y2="170"
        stroke="#888888" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow-gris)" />
      <rect x="137" y="120" width="42" height="14" rx="3" fill="white" opacity="0.85" />
      <text x="158" y="130" textAnchor="middle" fontSize="8" fill="#888888"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('fijacion-rayos')}>Rayos</text>

      {/* Asimilación: suelo → plantas */}
      <line x1="130" y1="222" x2="170" y2="222"
        stroke="#48A9A6" strokeWidth="2" markerEnd="url(#arrow-teal)" />
      <rect x="128" y="208" width="52" height="13" rx="3" fill="white" opacity="0.85" />
      <text x="154" y="218" textAnchor="middle" fontSize="8" fill="#48A9A6"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('asimilacion')}>Asimilación</text>

      {/* Consumo: plantas → animales */}
      <line x1="280" y1="222" x2="330" y2="222"
        stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrow-verde)" />
      <rect x="278" y="208" width="48" height="13" rx="3" fill="white" opacity="0.85" />
      <text x="302" y="218" textAnchor="middle" fontSize="8" fill="#2E7D32"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('consumo-animal')}>Consumo</text>

      {/* Nitrificación: amonio → nitrato (izquierda del suelo) */}
      <path d="M 75 230 Q 55 260 75 244" stroke="#F9A825" strokeWidth="0" fill="none" />
      <text x="75" y="268" textAnchor="middle" fontSize="8" fill="#F9A825"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('nitrificacion')}>NH₃→NO₃⁻</text>
      <rect x="32" y="256" width="72" height="14" rx="3" fill="white" opacity="0.85" />
      <text x="68" y="267" textAnchor="middle" fontSize="8" fill="#F9A825"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('nitrificacion')}>Nitrificación</text>

      {/* Desnitrificación: suelo → atmósfera (arco) */}
      <path d="M 75 200 Q 30 120 200 52"
        stroke="#C62828" strokeWidth="2" fill="none" markerEnd="url(#arrow-rojo)" />
      <rect x="16" y="155" width="58" height="14" rx="3" fill="white" opacity="0.85" />
      <text x="45" y="165" textAnchor="middle" fontSize="8" fill="#C62828"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('desnitrificacion')}>Denitrific.</text>

      {/* Descomposición: animales → suelo */}
      <line x1="380" y1="244" x2="130" y2="244"
        stroke="#795548" strokeWidth="1.5" strokeDasharray="4,2" markerEnd="url(#arrow-marron)" />
      <rect x="212" y="248" width="64" height="14" rx="3" fill="white" opacity="0.85" />
      <text x="244" y="258" textAnchor="middle" fontSize="8" fill="#795548"
        className={styles.svgLabel} style={{ cursor: 'pointer' }}
        onClick={() => onSelectProceso('descomposicion')}>Descompos.</text>

      {/* Lixiviación: suelo → agua */}
      <line x1="130" y1="244" x2="360" y2="320"
        stroke="#5C9BD6" strokeWidth="1.5" strokeDasharray="3,3" />
      <rect x="195" y="286" width="60" height="14" rx="3" fill="white" opacity="0.85" />
      <text x="225" y="296" textAnchor="middle" fontSize="8" fill="#5C9BD6">Lixiviación</text>

      {/* Agua reservorio */}
      <rect x="360" y="310" width="100" height="44" rx="6"
        fill="#5C9BD6" opacity="0.18" stroke="#5C9BD6" strokeWidth="1.5" />
      <text x="410" y="326" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5C9BD6">Agua</text>
      <text x="410" y="340" textAnchor="middle" fontSize="9" fill="#5C9BD6" opacity="0.9">NO₃⁻ lixiv.</text>

      {/* Leyenda de selección */}
      {procesoSeleccionado && (
        <rect x="150" y="90" width="180" height="18" rx="4" fill="#2E86AB" opacity="0.12" />
      )}
      {!procesoSeleccionado && (
        <text x="240" y="105" textAnchor="middle" fontSize="9" fill="#666" opacity="0.8">
          Haz clic en un proceso para ver detalles
        </text>
      )}

      {/* Indicador de proceso seleccionado */}
      {flechas.map(([id, , , , , , color]) => {
        const proceso = PROCESOS.find(p => p.id === id);
        if (!proceso || procesoSeleccionado !== id) return null;
        return (
          <circle key={id} cx="240" cy="100" r="5" fill={color as string} opacity="0.9" />
        );
      })}
    </svg>
  );
}

// ─── Tab 1: Ciclo completo ────────────────────────────────────────────────────

function TabCicloCompleto() {
  const [procesoSeleccionado, setProcesoSeleccionado] = useState<string | null>(null);

  const detalle = PROCESOS.find(p => p.id === procesoSeleccionado);

  return (
    <div className={styles.tabContent}>
      <div className={styles.cicloSvgWrapper}>
        <CicloSVG
          procesoSeleccionado={procesoSeleccionado}
          onSelectProceso={id => setProcesoSeleccionado(procesoSeleccionado === id ? null : id)}
        />
      </div>

      {/* Leyenda de procesos clicables */}
      <div className={styles.leyendaProcesos}>
        {PROCESOS.map(p => (
          <button
            key={p.id}
            className={`${styles.procesoBadge} ${procesoSeleccionado === p.id ? styles.procesoBadgeActivo : ''}`}
            style={{ borderColor: p.color, color: procesoSeleccionado === p.id ? '#fff' : p.color,
              backgroundColor: procesoSeleccionado === p.id ? p.color : 'transparent' }}
            onClick={() => setProcesoSeleccionado(procesoSeleccionado === p.id ? null : p.id)}
            aria-pressed={procesoSeleccionado === p.id}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      {/* Panel de detalle */}
      {detalle && (
        <div className={styles.procesoDetalle} style={{ borderLeftColor: detalle.color }}>
          <div className={styles.procesoDetalleHeader}>
            <span className={styles.procesoDetalleTitulo} style={{ color: detalle.color }}>
              {detalle.nombre}
            </span>
            <button
              className={styles.procesoDetalleCerrar}
              onClick={() => setProcesoSeleccionado(null)}
              aria-label="Cerrar detalle"
            >
              ✕
            </button>
          </div>
          <dl className={styles.procesoDetalleGrid}>
            <dt>Agente responsable</dt>
            <dd>{detalle.agente}</dd>
            <dt>Compuestos</dt>
            <dd>{detalle.compuestos}</dd>
            <dt>Importancia para la vida</dt>
            <dd>{detalle.importancia}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}

// ─── Tab 2: Microorganismos ───────────────────────────────────────────────────

function TabMicroorganismos() {
  const [expandido, setExpandido] = useState<string | null>(null);

  return (
    <div className={styles.tabContent}>
      <p className={styles.introTexto}>
        Cinco microorganismos que hacen posible el ciclo del nitrógeno. Sin ellos, el N₂ atmosférico
        sería inaccesible para casi toda la vida en la Tierra.
      </p>
      <div className={styles.microorganismosGrid}>
        {MICROORGANISMOS.map(m => (
          <div
            key={m.id}
            className={`${styles.microCard} ${expandido === m.id ? styles.microCardExpanded : ''}`}
          >
            <button
              className={styles.microCardBtn}
              onClick={() => setExpandido(expandido === m.id ? null : m.id)}
              aria-expanded={expandido === m.id}
            >
              <span className={styles.microEmoji} aria-hidden="true">{m.emoji}</span>
              <div className={styles.microCardInfo}>
                <span className={styles.microNombre}>{m.nombre}</span>
                <span className={styles.microProceso}>{m.proceso}</span>
              </div>
              <span className={styles.microToggle} aria-hidden="true">
                {expandido === m.id ? '▲' : '▼'}
              </span>
            </button>

            {expandido === m.id && (
              <div className={styles.microDetalle}>
                <div className={styles.microCondicion}>
                  <span className={styles.microCondicionLabel}>Condición</span>
                  <span>{m.condicion}</span>
                </div>
                <div className={styles.microItem}>
                  <span className={styles.microItemLabel}>Importancia agrícola</span>
                  <p>{m.importanciaAgricola}</p>
                </div>
                <div className={`${styles.microItem} ${styles.microCuriosidad}`}>
                  <span className={styles.microItemLabel}>Curiosidad</span>
                  <p>{m.curiosidad}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 3: Impacto Humano ───────────────────────────────────────────────────

function TabImpactoHumano() {
  const [anio, setAnio] = useState(2025);

  // Calcular valores en función del año (interpolación lineal 1900-2025)
  const t = (anio - 1900) / 125;
  const haberBosch = Math.round(t * t * 150); // crecimiento exponencial simplificado
  const combustion = Math.round(15 + t * 25);
  const biologica = 120; // constante

  const total = biologica + haberBosch + combustion;
  const pctArtificial = Math.round(((haberBosch + combustion) / total) * 100);

  return (
    <div className={styles.tabContent}>
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Fijación de nitrógeno a lo largo del tiempo</h3>
        <div className={styles.sliderGroup}>
          <label className={styles.sliderLabel} htmlFor="slider-anio">
            Año: <span className={styles.sliderValue}>{anio}</span>
          </label>
          <input
            id="slider-anio"
            type="range"
            min={1900}
            max={2025}
            step={5}
            value={anio}
            onChange={e => setAnio(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderMarks}>
            <span>1900</span><span>1950</span><span>2000</span><span>2025</span>
          </div>
        </div>

        {/* Barras de flujo */}
        <div className={styles.flujosBarra}>
          <div className={styles.flujoBarra}>
            <div className={styles.flujoBarraLabel}>Fijación biológica</div>
            <div className={styles.flujoBarraTrack}>
              <div
                className={styles.flujoBarraFill}
                style={{ width: `${Math.min(100, (biologica / 300) * 100)}%`, backgroundColor: '#2E86AB' }}
              />
            </div>
            <div className={styles.flujoBarraValor}>{biologica} Tg N/año</div>
          </div>
          <div className={styles.flujoBarra}>
            <div className={styles.flujoBarraLabel}>Haber-Bosch (industrial)</div>
            <div className={styles.flujoBarraTrack}>
              <div
                className={styles.flujoBarraFill}
                style={{ width: `${Math.min(100, (haberBosch / 300) * 100)}%`, backgroundColor: '#E07B39' }}
              />
            </div>
            <div className={styles.flujoBarraValor}>{haberBosch} Tg N/año</div>
          </div>
          <div className={styles.flujoBarra}>
            <div className={styles.flujoBarraLabel}>Combustión y depósito</div>
            <div className={styles.flujoBarraTrack}>
              <div
                className={styles.flujoBarraFill}
                style={{ width: `${Math.min(100, (combustion / 300) * 100)}%`, backgroundColor: '#888' }}
              />
            </div>
            <div className={styles.flujoBarraValor}>{combustion} Tg N/año</div>
          </div>
        </div>

        {anio >= 1950 && (
          <p className={styles.resumenFlujo}>
            En {anio}, el <strong>{pctArtificial}%</strong> de la fijación de nitrógeno es de origen humano
            (industrial + combustión). Total: <strong>{total} Tg N/año</strong>.
          </p>
        )}
      </div>

      <h3 className={styles.sectionTitle} style={{ marginTop: '1.5rem' }}>Consecuencias del exceso de nitrógeno</h3>
      <div className={styles.impactoGrid}>
        <div className={styles.consecuenciaItem + ' ' + styles.consecuenciaNegativa}>
          <h4>🐟 Eutrofización</h4>
          <p>El exceso de nitratos en ríos y lagos provoca proliferación masiva de algas que agotan el oxígeno disuelto. Crea «zonas muertas» en costas (Golfo de México, Mar Báltico).</p>
        </div>
        <div className={styles.consecuenciaItem + ' ' + styles.consecuenciaNegativa}>
          <h4>🌧️ Lluvia ácida</h4>
          <p>Los óxidos de nitrógeno (NOₓ) de vehículos y centrales eléctricas se combinan con agua atmosférica formando HNO₃, que acidifica suelos y aguas.</p>
        </div>
        <div className={styles.consecuenciaItem + ' ' + styles.consecuenciaNegativa}>
          <h4>☁️ Destrucción del ozono</h4>
          <p>El óxido nitroso (N₂O), producido en suelos agrícolas con exceso de fertilizantes, es el tercer gas de efecto invernadero y destruye la capa de ozono estratosférico.</p>
        </div>
        <div className={styles.consecuenciaItem + ' ' + styles.consecuenciaPositiva}>
          <h4>🌾 Revolución Verde</h4>
          <p>Sin la síntesis de Haber-Bosch, la Tierra no podría alimentar a más de ~4.000 millones de personas. Los fertilizantes nitrogenados triplicaron los rendimientos agrícolas en el siglo XX.</p>
        </div>
        <div className={styles.consecuenciaItem + ' ' + styles.consecuenciaNegativa}>
          <h4>🏥 Salud humana</h4>
          <p>El nitrato (NO₃⁻) en agua potable puede causar metahemoglobinemia en lactantes («enfermedad del bebé azul»). La OMS fija el límite en 50 mg/L.</p>
        </div>
        <div className={styles.consecuenciaItem + ' ' + styles.consecuenciaPositiva}>
          <h4>♻️ Agricultura ecológica</h4>
          <p>La rotación de cultivos con leguminosas aprovecha la fijación biológica, reduciendo la dependencia de fertilizantes sintéticos y sus impactos ambientales.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 4: Comparativa de ciclos ────────────────────────────────────────────

function TabComparativa() {
  const [cicloActivo, setCicloActivo] = useState<string>('nitrogeno');

  const ciclo = CICLOS.find(c => c.id === cicloActivo) ?? CICLOS[0];

  const badgeColor = (nivel: string) => {
    if (nivel === 'muy-alta') return '#C62828';
    if (nivel === 'alta') return '#E07B39';
    return '#F9A825';
  };

  return (
    <div className={styles.tabContent}>
      {/* Selector de ciclo */}
      <div className={styles.cicloSelector}>
        {CICLOS.map(c => (
          <button
            key={c.id}
            className={`${styles.cicloBtn} ${cicloActivo === c.id ? styles.cicloBtnActivo : ''}`}
            onClick={() => setCicloActivo(c.id)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Descripción del ciclo seleccionado */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Ciclo del {ciclo.nombre}</h3>
        <p className={styles.cicloDescripcion}>{ciclo.descripcion}</p>
      </div>

      {/* Tabla comparativa */}
      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Ciclo</th>
              <th>Reservorio principal</th>
              <th>Forma asimilable</th>
              <th>Organismos clave</th>
              <th>Escala temporal</th>
              <th>Alteración humana</th>
            </tr>
          </thead>
          <tbody>
            {CICLOS.map(c => (
              <tr
                key={c.id}
                className={`${styles.tablaFila} ${c.id === cicloActivo ? styles.tablaFilaActiva : ''}`}
                onClick={() => setCicloActivo(c.id)}
                style={{ cursor: 'pointer' }}
              >
                <td><strong>{c.nombre}</strong></td>
                <td>{c.reservorio}</td>
                <td className={styles.tdMono}>{c.formaAsimilable}</td>
                <td>{c.organismos}</td>
                <td>{c.escalaTemporal}</td>
                <td>
                  <span
                    className={styles.alteracionBadge}
                    style={{ backgroundColor: badgeColor(c.nivelAlteracion) }}
                  >
                    {c.alteracionHumana}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

const TABS = [
  { id: 'ciclo', label: 'El Ciclo Completo' },
  { id: 'microorganismos', label: 'Microorganismos Clave' },
  { id: 'impacto', label: 'Impacto Humano' },
  { id: 'comparativa', label: 'Comparativa de Ciclos' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function VisualizadorCicloNitrogenoPage() {
  const [tabActiva, setTabActiva] = useState<TabId>('ciclo');

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Ciclo del Nitrógeno</h1>
        <p className={styles.heroSubtitle}>
          Fijación biológica e industrial, nitrificación, desnitrificación y el impacto humano
          en los ciclos biogeoquímicos
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Tabs */}
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Contenido de tabs */}
        <div role="tabpanel">
          {tabActiva === 'ciclo' && <TabCicloCompleto />}
          {tabActiva === 'microorganismos' && <TabMicroorganismos />}
          {tabActiva === 'impacto' && <TabImpactoHumano />}
          {tabActiva === 'comparativa' && <TabComparativa />}
        </div>

        {/* Sección educativa */}
        <EducationalSection
          title="El ciclo del nitrógeno y los ciclos biogeoquímicos"
          subtitle="Cómo el nitrógeno circula por la atmósfera, el suelo y los seres vivos"
        >
          {/* ── Sección 1: Tabla comparativa de procesos ── */}
          <h3>Comparativa de los procesos del ciclo del nitrógeno</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Proceso</th>
                  <th>Microorganismos</th>
                  <th>Compuestos</th>
                  <th>Condición</th>
                  <th>Importancia agrícola</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Fijación biológica</strong></td>
                  <td>Rhizobium, Azotobacter</td>
                  <td className={styles.tdMono}>N₂ → NH₃</td>
                  <td>Aeróbica</td>
                  <td>Alta</td>
                </tr>
                <tr>
                  <td><strong>Fijación industrial (Haber-Bosch)</strong></td>
                  <td>— (proceso industrial)</td>
                  <td className={styles.tdMono}>N₂ + H₂ → NH₃</td>
                  <td>Alta T y P</td>
                  <td>Muy alta</td>
                </tr>
                <tr>
                  <td><strong>Nitrificación</strong></td>
                  <td>Nitrosomonas + Nitrobacter</td>
                  <td className={styles.tdMono}>NH₃ → NO₃⁻</td>
                  <td>Aeróbica</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td><strong>Desnitrificación</strong></td>
                  <td>Pseudomonas</td>
                  <td className={styles.tdMono}>NO₃⁻ → N₂</td>
                  <td>Anaeróbica</td>
                  <td>Variable</td>
                </tr>
                <tr>
                  <td><strong>Amonificación</strong></td>
                  <td>Bacterias + hongos</td>
                  <td className={styles.tdMono}>proteínas → NH₄⁺</td>
                  <td>Anaeróbica</td>
                  <td>Media</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Sección 2: Casos de uso ── */}
          <h3>Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌾</span>
              <div>
                <strong>Agricultor ecológico</strong>
                <p>Usa leguminosas (con Rhizobium) como cultivo de rotación para evitar fertilizantes nitrogenados sintéticos. La fijación biológica aporta hasta 200 kg N/ha/año de forma gratuita y sostenible.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🧪</span>
              <div>
                <strong>Estudiante de biología</strong>
                <p>Explica en selectividad los pasos del ciclo del nitrógeno y los microorganismos implicados. Comprende por qué el N₂ inerte del aire necesita bacterias especializadas para volverse asimilable.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌊</span>
              <div>
                <strong>Ecólogo fluvial</strong>
                <p>Analiza la eutrofización de un lago por exceso de nitratos agrícolas que asfixian el ecosistema. El exceso de N activa una proliferación algal que agota el oxígeno disuelto y crea zonas muertas.</p>
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🏭</span>
              <div>
                <strong>Ingeniero químico</strong>
                <p>Optimiza las condiciones del proceso Haber-Bosch (temperatura, presión, catalizador de hierro) para maximizar el rendimiento en la producción de amoniaco a escala industrial.</p>
              </div>
            </div>
          </div>

          {/* ── Sección 3: FAQ ── */}
          <h3>Preguntas frecuentes</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Por qué el nitrógeno atmosférico (N₂) no puede ser absorbido directamente por las plantas?</strong>
              <p>El N₂ tiene un triple enlace covalente (N≡N) con una energía de disociación de 945 kJ/mol, uno de los enlaces más fuertes de la química. Las plantas no tienen la maquinaria enzimática (nitrogenasa) para romperlo. Solo ciertas bacterias poseen esta enzima, que requiere además un ambiente libre de oxígeno y un gran aporte energético.</p>
              <span className={styles.faqTip}>Concepto clave: disponibilidad ≠ accesibilidad</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué sería del mundo sin el proceso Haber-Bosch?</strong>
              <p>La Tierra solo podría alimentar a unos 3.500-4.000 millones de personas mediante la fijación biológica natural. La mitad de los 8.000 millones actuales depende directamente del nitrógeno industrial. Fritz Haber ganó el Nobel de Química en 1918 por este proceso; sin él, la Revolución Verde del siglo XX hubiera sido imposible.</p>
              <span className={styles.faqTip}>Dato: el 50% del nitrógeno en tu cuerpo pasó por Haber-Bosch</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Por qué el exceso de nitrógeno es un problema ecológico si es un nutriente?</strong>
              <p>El nitrógeno reactivo (NH₄⁺, NO₃⁻) en exceso activa la eutrofización: las algas proliferan masivamente, consumen el oxígeno disuelto al morir y descomponerse, y crean zonas anóxicas donde muere la vida acuática. En tierra, acidifica el suelo y reduce la biodiversidad vegetal al favorecer especies nitrófilas agresivas.</p>
              <span className={styles.faqTip}>El Mar Báltico tiene una de las mayores zonas muertas de eutrofización del mundo</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre la fijación biológica simbiótica y la libre?</strong>
              <p>La simbiótica (Rhizobium en nódulos de leguminosas) es más eficiente porque la planta suministra fotosintatos directamente a la bacteria y recibe nitrógeno fijo a cambio. La libre (Azotobacter, Clostridium) es menos eficiente porque la bacteria debe obtener carbono del suelo, pero no requiere planta hospedadora y puede ocurrir en cualquier suelo.</p>
              <span className={styles.faqTip}>La simbiótica puede fijar 100-300 kg N/ha/año; la libre, solo 5-20 kg N/ha/año</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué produce el N₂O y por qué es tan preocupante para el clima?</strong>
              <p>El óxido nitroso (N₂O) se produce durante la desnitrificación incompleta (NO₃⁻ → N₂O en lugar de llegar hasta N₂) y también en suelos agrícolas con exceso de fertilizantes nitrogenados. Su potencial de calentamiento global es 265 veces mayor que el CO₂ a 100 años, y destruye la capa de ozono estratosférico al reaccionar con el O₃.</p>
              <span className={styles.faqTip}>La agricultura es responsable del 75% de las emisiones globales de N₂O</span>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuánto tarda el nitrógeno en completar un ciclo completo?</strong>
              <p>Depende del camino que tome. El nitrógeno en un nódulo de leguminosa puede incorporarse a la planta en semanas. El nitrógeno fijado en el suelo puede tardar meses en nitrificarse y años en desnitrificarse de vuelta a N₂. En ecosistemas naturales sin perturbación humana, el ciclo completo puede tomar de decenas a cientos de años.</p>
              <span className={styles.faqTip}>La intervención humana ha acelerado el ciclo del nitrógeno entre 2 y 3 veces</span>
            </li>
          </ul>

          {/* ── Sección 4: Guía paso a paso ── */}
          <h3>Del aire a tu cuerpo: el viaje del nitrógeno paso a paso</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Fijación biológica en las raíces</strong>
                <p>El N₂ del aire es fijado por <em>Rhizobium</em> en nódulos de leguminosas — se forma NH₄⁺ (amonio). La nitrogenasa cataliza la reacción: N₂ + 8H⁺ + 8e⁻ + 16 ATP → 2NH₃ + H₂ + 16 ADP.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Primera nitrificación</strong>
                <p><em>Nitrosomonas</em> convierte NH₄⁺ → NO₂⁻ (nitrito) en el suelo aeróbico. Este paso intermedio es necesario pero el nitrito por sí solo no es asimilable por las plantas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Segunda nitrificación y absorción radicular</strong>
                <p><em>Nitrobacter</em> convierte NO₂⁻ → NO₃⁻ (nitrato), que las plantas absorben por transportadores específicos en las raíces (NRT1, NRT2). El nitrato es la forma preferida por la mayoría de los cultivos agrícolas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Síntesis de biomoléculas nitrogenadas</strong>
                <p>Las plantas usan el NO₃⁻ para sintetizar aminoácidos (reduciendo nitrato a amonio en los cloroplastos), proteínas y ácidos nucleicos (ADN, ARN). Sin nitrógeno, no hay clorofila ni proteínas enzimáticas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Incorporación a la cadena trófica</strong>
                <p>Tú comes las plantas (o animales que las comieron): el nitrógeno ya está en tus proteínas y ADN. Tu cuerpo excreta el exceso como urea, que los descomponedores reciclan de vuelta al suelo cerrando el ciclo.</p>
              </div>
            </li>
          </ol>

          {/* ── Sección 5: Mejores prácticas ── */}
          <h3>Claves para entender el ciclo del nitrógeno</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Rotación de cultivos: el fertilizante más antiguo</strong>
                <p>La rotación con leguminosas es el sistema de fertilización natural más eficiente — y el más antiguo. Lo usaban los romanos y los agricultores chinos hace más de 2.000 años antes de conocer la microbiología.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <div>
                <strong>Haber-Bosch: el proceso más influyente del siglo XX</strong>
                <p>El proceso Haber-Bosch usa el 1-2% de la energía mundial. Mejorar su eficiencia o sustituirlo por fijación biológica a gran escala tendría un impacto climático y energético colosal.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
              <div>
                <strong>Agricultura ecológica y escala</strong>
                <p>La agricultura ecológica no puede alimentar a 8.000 millones de personas sin la fijación biológica a gran escala — requiere más superficie cultivada y rendimientos menores. Es un reto de sostenibilidad activo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <div>
                <strong>El N₂O: el gas climático más subestimado</strong>
                <p>El óxido nitroso (N₂O) tiene un potencial de calentamiento global 265 veces mayor que el CO₂ a 100 años. Reducir su emisión desde suelos agrícolas es tan urgente como reducir el CO₂ de los combustibles fósiles.</p>
              </div>
            </div>
          </div>

          {/* ── Sección 6: Warning box — errores frecuentes ── */}
          <div className={styles.warningBox} role="note">
            <strong>Errores frecuentes sobre el ciclo del nitrógeno</strong>
            <ul>
              <li><strong>Confundir nitrógeno (N) con dinitrógeno (N₂):</strong> el gas atmosférico es N₂ (molécula dinitrógeno), no átomos de nitrógeno sueltos. Esta diferencia explica por qué el N₂ es tan estable e inerte.</li>
              <li><strong>Creer que todos los fertilizantes nitrogenados son iguales:</strong> la urea, el nitrato amónico y el sulfato amónico tienen comportamientos distintos según el pH del suelo, temperatura y condiciones de riego.</li>
              <li><strong>Ignorar la desnitrificación como "sumidero":</strong> sin ella, el nitrato se acumularía indefinidamente en el suelo y el agua subterránea. Es el único proceso que cierra el ciclo devolviendo N₂ a la atmósfera.</li>
              <li><strong>Subestimar la volatilización del amoniaco:</strong> en suelos alcalinos o con calor, el NH₄⁺ se convierte en NH₃ gas y se pierde a la atmósfera, reduciendo la eficiencia de los fertilizantes hasta un 30-40%.</li>
              <li><strong>Olvidar el vínculo con el ciclo del carbono:</strong> sin fotosíntesis (carbono) no hay proteínas vegetales, y sin proteínas no hay animales que cierren el ciclo nitrogenado. Los ciclos biogeoquímicos están profundamente interconectados.</li>
            </ul>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('visualizador-ciclo-nitrogeno')} />
      <ShareCard appName="visualizador-ciclo-nitrogeno" />
      <Footer appName="visualizador-ciclo-nitrogeno" />
    </div>
  );
}
