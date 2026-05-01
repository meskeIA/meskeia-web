'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaQuimica.module.css';
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

type Categoria = 'prequimica' | 'transicion' | 'clasica' | 'moderna' | 'contemporanea';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoQuimica {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  quimicos: string[];
  conceptos: string[];
  descubrimiento: string;
  preguntaCentral: string;
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Helper para años negativos (a.C.)
// ─────────────────────────────────────────────

function formatAnio(anio: number): string {
  return anio < 0 ? `${Math.abs(anio)} a.C.` : String(anio);
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoQuimica[] = [
  {
    id: 'alquimia_antigua', nombre: 'Alquimia y Proto-química', anioInicio: -400, anioFin: 1600,
    categoria: 'prequimica',
    quimicos: ['Jabir ibn Hayyan (Geber)', 'Paracelso', 'Ramon Llull', 'Zósimo de Panópolis'],
    conceptos: ['Cuatro elementos aristotélicos', 'Piedra filosofal y oro', 'Azufre-mercurio-sal (Paracelso)', 'Destilación y sublimación', 'Teoría del Flogisto (embrión)'],
    descubrimiento: 'Jabir ibn Hayyan sistematiza los procedimientos alquímicos (c. 800) — primer corpus experimental',
    preguntaCentral: '¿Se puede transformar la materia en otra y fabricar el oro?',
    contexto: 'La alquimia no era magia pura: desarrolló los aparatos de laboratorio (alambique, atanor), la destilación, la cristalización y la sublimación. Jabir, el "padre de la química árabe", escribió cientos de textos experimentales que Europa tradujo en el siglo XII.',
    color: '#8B4513',
  },
  {
    id: 'boyle', nombre: 'Química Neumática', anioInicio: 1600, anioFin: 1780,
    categoria: 'transicion',
    quimicos: ['Robert Boyle', 'Stephen Hales', 'Joseph Black', 'Henry Cavendish'],
    conceptos: ['Elemento químico (Boyle)', 'Ley de Boyle (PV = constante)', 'Gases fijos (CO₂)', 'Gas inflamable (H₂)', 'Método científico en química'],
    descubrimiento: 'Boyle publica "El Químico Escéptico" (1661) — primera definición moderna de elemento químico',
    preguntaCentral: '¿Qué son los gases y cómo podemos estudiar el aire?',
    contexto: 'Boyle separó la química de la alquimia exigiendo definiciones operacionales y experimentación. La bomba de vacío permitió estudiar los gases; Cavendish aisló el hidrógeno (1766); Black descubrió el CO₂. La neumática preparó el terreno para Lavoisier.',
    color: '#6B8E23',
  },
  {
    id: 'lavoisier', nombre: 'Revolución Química', anioInicio: 1772, anioFin: 1810,
    categoria: 'clasica',
    quimicos: ['Antoine-Laurent de Lavoisier', 'Joseph Priestley', 'Carl Wilhelm Scheele', 'Claude Berthollet'],
    conceptos: ['Conservación de la masa', 'Rol del oxígeno en la combustión', 'Nomenclatura química sistemática', 'Agua = H₂O', 'Demolición del flogisto'],
    descubrimiento: 'Lavoisier publica el Traité Élémentaire de Chimie (1789) — primera tabla de elementos modernos',
    preguntaCentral: '¿Qué es la combustión y cómo funciona la conservación de la masa?',
    contexto: 'Lavoisier identificó el oxígeno como responsable de la combustión, derrumbando el flogisto. Su "Traité" unificó la nomenclatura química en toda Europa. Murió guillotinado en la Revolución Francesa: "La República no necesita sabios."',
    color: '#B8860B',
  },
  {
    id: 'atomismo', nombre: 'Teoría Atómica Clásica', anioInicio: 1803, anioFin: 1870,
    categoria: 'clasica',
    quimicos: ['John Dalton', 'Jöns Jacob Berzelius', 'Amedeo Avogadro', 'Gay-Lussac'],
    conceptos: ['Átomos con pesos relativos', 'Fórmulas químicas simbólicas', 'Número de Avogadro (6,02×10²³)', 'Ley de combinación gaseosa', 'Notación moderna (H, O, C...)'],
    descubrimiento: 'Dalton publica su teoría atómica (1803) — los elementos se combinan en proporciones de pesos fijos',
    preguntaCentral: '¿Los átomos existen realmente y cómo se combinan para formar compuestos?',
    contexto: 'Dalton propuso que los elementos eran átomos con masas características. Berzelius introdujo la notación simbólica que usamos hoy. Avogadro distinguió átomos de moléculas, resolviendo décadas de confusión sobre las fórmulas de los gases.',
    color: '#2E8B57',
  },
  {
    id: 'periodica', nombre: 'Tabla Periódica', anioInicio: 1860, anioFin: 1900,
    categoria: 'clasica',
    quimicos: ['Dmitri Mendeléiev', 'Lothar Meyer', 'William Ramsay', 'Julius Lothar Meyer'],
    conceptos: ['Periodicidad de las propiedades', 'Predicción de elementos desconocidos', 'Gases nobles (grupo 0)', 'Pesos atómicos precisos', 'Isótopos (embrión)'],
    descubrimiento: 'Mendeléiev publica la Tabla Periódica (1869) y predice galio, escandio y germanio — descubiertos después',
    preguntaCentral: '¿Existe un orden subyacente entre todos los elementos químicos?',
    contexto: 'Mendeléiev ordenó los 63 elementos conocidos por masa atómica y propiedades, dejando huecos para los desconocidos. Cuando el galio (predicho como "eka-aluminio") fue descubierto en 1875 con exactamente las propiedades predichas, la comunidad científica aceptó la tabla.',
    color: '#4682B4',
  },
  {
    id: 'organica', nombre: 'Química Orgánica y Síntesis', anioInicio: 1828, anioFin: 1940,
    categoria: 'moderna',
    quimicos: ['Friedrich Wöhler', 'August Kekulé', 'Emil Fischer', 'Alfred Werner'],
    conceptos: ['Síntesis de urea (fin del vitalismo)', 'Estructura del benceno (hexágono)', 'Estereofonía molecular', 'Carbono tetravalente', 'Síntesis de azúcares'],
    descubrimiento: 'Wöhler sintetiza urea en laboratorio (1828) — demuestra que los compuestos orgánicos no requieren fuerza vital',
    preguntaCentral: '¿Cómo se organizan los átomos de carbono para crear la infinita diversidad de compuestos orgánicos?',
    contexto: 'Wöhler rompió el vitalismo demostrando que la urea —compuesto "vivo"— podía sintetizarse desde sales inorgánicas. Kekulé soñó con la serpiente mordiéndose la cola y propuso la estructura hexagonal del benceno. Fischer sintetizó azúcares, abriendo la bioquímica.',
    color: '#228B22',
  },
  {
    id: 'electroquimica', nombre: 'Electroquímica y Termodinámica Química', anioInicio: 1800, anioFin: 1910,
    categoria: 'moderna',
    quimicos: ['Humphry Davy', 'Michael Faraday', 'Svante Arrhenius', "Jacobus van't Hoff", 'Josiah Gibbs'],
    conceptos: ['Electrólisis — leyes de Faraday', 'Iones en solución', 'Teoría de la disociación iónica', 'Energía libre de Gibbs (ΔG)', 'pH y equilibrio ácido-base'],
    descubrimiento: 'Faraday establece las leyes de la electrólisis (1833) — relación cuantitativa entre electricidad y reacción química',
    preguntaCentral: '¿Cómo se relacionan la electricidad, la energía y las reacciones químicas?',
    contexto: 'Davy usó la electrólisis para aislar sodio y potasio (1807). Faraday las cuantificó. Arrhenius propuso que las sales se disocian en iones, explicando la conductividad. Gibbs creó la termodinámica química: la energía libre predice qué reacciones son posibles.',
    color: '#9932CC',
  },
  {
    id: 'radiactividad', nombre: 'Radiactividad y Química Nuclear', anioInicio: 1895, anioFin: 1940,
    categoria: 'moderna',
    quimicos: ['Marie Curie', 'Pierre Curie', 'Ernest Rutherford', 'Frédéric Joliot-Curie'],
    conceptos: ['Rayos X', 'Radiactividad espontánea', 'Radio y polonio', 'Transmutación de elementos', 'Química isotópica'],
    descubrimiento: 'Marie Curie descubre polonio y radio (1898) y primeros indicios de transmutación nuclear — elementos que se transforman',
    preguntaCentral: '¿Pueden los elementos transformarse espontáneamente en otros?',
    contexto: 'Becquerel descubrió la radiactividad en 1896; los Curie la cuantificaron y aislaron nuevos elementos. Marie Curie fue la primera mujer en recibir el Nobel (Física, 1903) y la primera persona en recibir dos Nobeles (Química, 1911). Su trabajo abrió la física nuclear.',
    color: '#FF4500',
  },
  {
    id: 'quantum_quimica', nombre: 'Química Cuántica', anioInicio: 1926, anioFin: 1960,
    categoria: 'moderna',
    quimicos: ['Linus Pauling', 'Walter Heitler', 'Fritz London', 'Robert Mulliken', 'Erich Hückel'],
    conceptos: ['Enlace covalente cuántico', 'Hibridación sp³/sp²/sp', 'Resonancia molecular', 'Orbital molecular (LCAO)', 'Aromaticidad (regla de Hückel)'],
    descubrimiento: 'Pauling publica "La Naturaleza del Enlace Químico" (1939) — la biblia de la química cuántica',
    preguntaCentral: '¿Por qué los átomos forman enlaces y qué geometría tienen las moléculas?',
    contexto: 'La mecánica cuántica explicó el enlace covalente: dos electrones compartidos estabilizan la molécula. Pauling introdujo la electronegatividad, la hibridación y la resonancia. Su libro redefinió cómo los químicos piensan sobre las moléculas.',
    color: '#1E90FF',
  },
  {
    id: 'industrial', nombre: 'Química Industrial y de Síntesis', anioInicio: 1900, anioFin: 1970,
    categoria: 'contemporanea',
    quimicos: ['Fritz Haber', 'Carl Bosch', 'Wallace Carothers', 'Hermann Staudinger', 'Karl Ziegler'],
    conceptos: ['Proceso Haber-Bosch (NH₃)', 'Polímeros y plásticos', 'Nylon — primera fibra sintética', 'Caucho sintético', 'Catálisis industrial'],
    descubrimiento: 'Proceso Haber-Bosch (1909) — síntesis industrial de amoníaco que alimenta al mundo',
    preguntaCentral: '¿Cómo escalar la síntesis química para producir materiales que cambien la civilización?',
    contexto: 'Haber y Bosch fijaron el nitrógeno atmosférico para fabricar fertilizantes: sin el proceso Haber-Bosch, la Tierra no podría alimentar a más de 4.000 millones de personas. Staudinger demostró que los polímeros eran macromoléculas: nacieron el plástico, el nylon y el poliéster.',
    color: '#FF6347',
  },
  {
    id: 'bioquimica', nombre: 'Bioquímica y Biología Molecular', anioInicio: 1950, anioFin: 9999,
    categoria: 'contemporanea',
    quimicos: ['Linus Pauling', 'Francis Crick', 'Rosalind Franklin', 'Frederick Sanger', 'Max Perutz'],
    conceptos: ['Doble hélice del ADN', 'Secuenciación de proteínas', 'Cristalografía de rayos X', 'Código genético', 'Enzimas como catalizadores biológicos'],
    descubrimiento: 'Watson, Crick y Franklin resuelven la estructura del ADN (1953) — el manual de instrucciones de la vida',
    preguntaCentral: '¿Cuál es la química de la vida y cómo se almacena y expresa la información genética?',
    contexto: 'La doble hélice del ADN (1953) fue el descubrimiento químico del siglo XX. Rosalind Franklin obtuvo la fotografía de rayos X crucial; Crick y Watson construyeron el modelo. Sanger secuenció la insulina (primer proteína secuenciada, 1951) y luego el genoma humano.',
    color: '#20B2AA',
  },
  {
    id: 'supramolecular', nombre: 'Química Supramolecular y Verde', anioInicio: 1967, anioFin: 9999,
    categoria: 'contemporanea',
    quimicos: ['Jean-Marie Lehn', 'Donald Cram', 'Charles Pedersen', 'Paul Anastas'],
    conceptos: ['Éteres corona — reconocimiento molecular', 'Química huésped-anfitrión', '12 Principios de la Química Verde', 'Catálisis asimétrica', 'Materiales supramoleculares'],
    descubrimiento: 'Lehn, Cram y Pedersen desarrollan la química supramolecular (1967–1987) — Premio Nobel 1987',
    preguntaCentral: '¿Cómo podemos diseñar moléculas que se reconozcan y ensamblen por sí mismas?',
    contexto: 'La química supramolecular estudia ensamblajes moleculares sin enlace covalente — como la llave en la cerradura. La química verde (Anastas, 1998) propuso rediseñar los procesos químicos para eliminar residuos tóxicos en origen.',
    color: '#48A9A6',
  },
  {
    id: 'computacional', nombre: 'Química Computacional', anioInicio: 1970, anioFin: 9999,
    categoria: 'contemporanea',
    quimicos: ['John Pople', 'Walter Kohn', 'Arieh Warshel', 'Martin Karplus', 'Michael Levitt'],
    conceptos: ['DFT (teoría del funcional de la densidad)', 'Simulación de proteínas (dinámica molecular)', 'Diseño de fármacos in silico', 'QSAR (relación estructura-actividad)', 'AlphaFold — plegamiento de proteínas'],
    descubrimiento: 'AlphaFold de DeepMind (2021) predice la estructura 3D de todas las proteínas conocidas — revolución en bioquímica',
    preguntaCentral: '¿Podemos calcular y diseñar propiedades moleculares sin necesidad de sintetizar en laboratorio?',
    contexto: 'Pople y Kohn compartieron el Nobel de Química 1998 por métodos de cálculo cuántico. La dinámica molecular simula cómo se mueven las proteínas átomo a átomo. AlphaFold resolvió el problema del plegamiento de proteínas —abierto 50 años— en 2020, acelerando el diseño de fármacos.',
    color: '#6A0DAD',
  },
  {
    id: 'sintesis_total', nombre: 'Síntesis Total y Química Moderna', anioInicio: 1940, anioFin: 9999,
    categoria: 'contemporanea',
    quimicos: ['Robert B. Woodward', 'E.J. Corey', 'K.B. Sharpless', 'Benjamin List', 'David MacMillan'],
    conceptos: ['Síntesis total de moléculas complejas', 'Retrosíntesis (Corey)', 'Catálisis asimétrica (Sharpless)', 'Organocatálisis (List/MacMillan)', 'Química Click'],
    descubrimiento: 'Woodward sintetiza la vitamina B12 (1973) — la más compleja síntesis total del siglo XX',
    preguntaCentral: '¿Cómo construir cualquier molécula natural compleja en el laboratorio?',
    contexto: 'Woodward fue el mayor artista de la síntesis orgánica total — sintetizó quinina, colesterol, cortisona y vitamina B12. Corey inventó la retrosíntesis (razonar hacia atrás desde la molécula objetivo). Sharpless y los organocatalizadores List/MacMillan abrieron la catálisis asimétrica que hoy produce el 30% de los fármacos.',
    color: '#C71585',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1661, evento: 'Boyle publica El Químico Escéptico — fin de la alquimia, inicio de la química experimental' },
  { anio: 1789, evento: 'Lavoisier publica su Traité con la primera tabla moderna de elementos' },
  { anio: 1869, evento: 'Mendeléiev presenta la Tabla Periódica — predice elementos desconocidos' },
  { anio: 1897, evento: 'Thomson descubre el electrón — la química empieza a entender el átomo' },
  { anio: 1911, evento: 'Rutherford propone el núcleo atómico — nueva imagen del átomo para la química' },
  { anio: 1932, evento: 'Pauling establece la escala de electronegatividades — la química cuántica madura' },
  { anio: 1953, evento: 'Watson y Crick publican la estructura del ADN — química y biología se fusionan' },
  { anio: 2012, evento: 'CRISPR-Cas9 aplicado a edición genómica — la química reescribe el ADN con precisión' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  prequimica: 'Pre-química',
  transicion: 'Transición',
  clasica: 'Clásica',
  moderna: 'Moderna',
  contemporanea: 'Contemporánea',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  prequimica: '#8B4513',
  transicion: '#6B8E23',
  clasica: '#B8860B',
  moderna: '#1E90FF',
  contemporanea: '#C71585',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoQuimica }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Conceptos clave</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.conceptos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Químicos clave</h4>
          <ul className={styles.artistasList}>
            {periodo.quimicos.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Descubrimiento clave</span>
        <p>{periodo.descubrimiento}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{periodo.preguntaCentral}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{periodo.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = -400;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoQuimica | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoQuimica[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_MAX : ultimoEnFila.anioFin) + 4 <= anioAX(per.anioInicio)) {
        filas[f].push(per);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(per);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de siglos con años negativos
  const siglos: number[] = [-300, 0, 400, 800, 1200, 1500, 1700, 1850, 1950, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el 400 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la química"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">año 0</text>

          {/* Marcadores de siglos */}
          {siglos.map((s) => (
            <g key={s}>
              <line x1={anioAX(s)} y1={FILA_OFFSET_Y} x2={anioAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(s)}</text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((per) => {
              const anioFin = per.anioFin === 9999 ? AÑO_MAX : per.anioFin;
              const x = anioAX(per.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;

              return (
                <g key={per.id} onClick={() => setSeleccionado(esSeleccionado ? null : per)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={per.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 60 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {per.nombre.length > 18 ? per.nombre.substring(0, 16) + '…' : per.nombre}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {/* Panel de detalle al hacer clic */}
      {seleccionado && (
        <PanelDetalle periodo={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const periodo = PERIODOS[indice];
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: per.color, borderColor: per.color } : {}}
          >
            {per.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: periodo.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: periodo.color }}>
          <h3>{periodo.nombre}</h3>
          <p>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.preguntaCentral}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Conceptos clave</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.conceptos.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Químicos clave</h4>
              <ul className={styles.artistasList}>
                {periodo.quimicos.map((q) => <li key={q}>{q}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Descubrimiento clave</span>
            <p>{periodo.descubrimiento}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{periodo.contexto}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Período anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {PERIODOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(PERIODOS.length - 1, i + 1))}
          disabled={indice === PERIODOS.length - 1}
          aria-label="Período siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Comparativa
// ─────────────────────────────────────────────

function TabComparativa() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((per) => {
      const coincideCategoria = categoriaFiltro === 'todos' || per.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        per.nombre.toLowerCase().includes(termino) ||
        per.quimicos.some((q) => q.toLowerCase().includes(termino));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todas
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${categoriaFiltro === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período o químico..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de historia de la química"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Químico clave</th>
              <th>Descubrimiento clave</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin === 9999 ? 'actualidad' : formatAnio(per.anioFin);
              return (
                <tr
                  key={per.id}
                  style={i % 2 === 0 ? { background: `${per.color}18` } : {}}
                >
                  <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                  <td>{formatAnio(per.anioInicio)}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                      {ETIQUETAS_CATEGORIA[per.categoria]}
                    </span>
                  </td>
                  <td>{per.quimicos[0]}</td>
                  <td className={styles.preguntaCell}>{per.descubrimiento}</td>
                </tr>
              );
            })}
            {periodosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>Sin resultados para la búsqueda actual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: 'Alquimia y Proto-química', desde: -400, hasta: 1600, icono: '⚗️' },
  { nombre: 'Química Neumática', desde: 1600, hasta: 1780, icono: '💨' },
  { nombre: 'Química Moderna', desde: 1780, hasta: 1870, icono: '🔬' },
  { nombre: 'Química Orgánica', desde: 1870, hasta: 1940, icono: '🧬' },
  { nombre: 'Química Industrial', desde: 1900, hasta: 1960, icono: '🏭' },
  { nombre: 'Química Molecular y Computacional', desde: 1960, hasta: 9999, icono: '💻' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de la química y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && (p.anioFin === 9999 || p.anioFin > era.desde)
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio < era.hasta)
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {formatAnio(era.desde)} – {era.hasta === 9999 ? 'hoy' : formatAnio(era.hasta)}
                  </span>
                </div>
              </div>

              {periodosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {periodosEra.map((p) => (
                    <span
                      key={p.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${p.color}1A`, color: p.color, borderColor: `${p.color}55` }}
                    >
                      {p.nombre}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{formatAnio(ev.anio)}</span>
                      <span className={styles.eraEventoTexto}>{ev.evento}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHistoriaQuimica() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Período en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de la Química</h1>
        <p className={styles.heroSubtitle}>
          De la alquimia a la química computacional — 14 períodos con los descubrimientos que revelaron la naturaleza de la materia
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
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

        <div className={styles.tabContent} role="tabpanel">
          {tabActiva === 'timeline' && <TabTimeline />}
          {tabActiva === 'detalle' && <TabDetalle />}
          {tabActiva === 'comparativa' && <TabComparativa />}
          {tabActiva === 'contexto' && <TabContexto />}
        </div>
      </main>

      <EducationalSection
        title="Historia de la química: períodos y descubrimientos"
        subtitle="Cómo los grandes descubrimientos químicos transformaron nuestra comprensión de la materia y la vida"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos clave de la química</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Categoría</th>
                <th>Químico clave</th>
                <th>Concepto central</th>
                <th>Descubrimiento clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Alquimia y Proto-química</strong></td>
                <td>400 a.C.–1600</td>
                <td>Pre-química</td>
                <td>Jabir ibn Hayyan</td>
                <td>Transformación de la materia</td>
                <td>Aparatos de laboratorio (alambique, destilación)</td>
              </tr>
              <tr>
                <td><strong>Revolución Química</strong></td>
                <td>1772–1810</td>
                <td>Clásica</td>
                <td>Lavoisier</td>
                <td>Conservación de la masa</td>
                <td>Primera tabla de elementos modernos (1789)</td>
              </tr>
              <tr>
                <td><strong>Tabla Periódica</strong></td>
                <td>1860–1900</td>
                <td>Clásica</td>
                <td>Mendeléiev</td>
                <td>Periodicidad de las propiedades</td>
                <td>Predicción de elementos desconocidos (galio, germanio)</td>
              </tr>
              <tr>
                <td><strong>Química Orgánica</strong></td>
                <td>1828–1940</td>
                <td>Moderna</td>
                <td>Wöhler / Kekulé</td>
                <td>Carbono tetravalente</td>
                <td>Síntesis de urea (fin del vitalismo)</td>
              </tr>
              <tr>
                <td><strong>Química Cuántica</strong></td>
                <td>1926–1960</td>
                <td>Moderna</td>
                <td>Linus Pauling</td>
                <td>Enlace covalente cuántico</td>
                <td>La Naturaleza del Enlace Químico (1939)</td>
              </tr>
              <tr>
                <td><strong>Bioquímica Molecular</strong></td>
                <td>1950–presente</td>
                <td>Contemporánea</td>
                <td>Watson, Crick, Franklin</td>
                <td>Doble hélice del ADN</td>
                <td>Estructura del ADN (1953)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
            <div>
              <strong>Estudiante de bachillerato</strong>
              <p>Prepara el examen de química o historia de la ciencia identificando los períodos, sus representantes y sus descubrimientos con la cronología visual interactiva.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
            <div>
              <strong>Divulgador de ciencia</strong>
              <p>Encuentra el contexto histórico de cualquier descubrimiento químico para explicar a su audiencia por qué fue revolucionario en su época y qué problema venía a resolver.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💊</span>
            <div>
              <strong>Interesado en farmacología</strong>
              <p>Comprende cómo la química orgánica, la bioquímica y la química computacional forman la base histórica de la síntesis y el diseño de fármacos modernos.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
            <div>
              <strong>Curioso sobre la historia de los descubrimientos</strong>
              <p>Explora cómo cada gran descubrimiento químico fue el resultado de una crisis previa: el flogisto, el vitalismo, la confusión sobre los gases. La ciencia avanza por refutación.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué la alquimia no era simplemente charlatanería?</strong>
            <p>La alquimia desarrolló técnicas experimentales reales: la destilación, la sublimación, la cristalización, la filtración y aparatos de laboratorio como el alambique o el atanor. Jabir ibn Hayyan escribió procedimientos experimentales detallados siglos antes de que el método científico existiera como concepto. La diferencia con la química moderna no es la ausencia de experimentos, sino la falta de un marco teórico para interpretar correctamente los resultados. Muchos químicos del siglo XVII, incluyendo Newton, practicaron la alquimia.</p>
            <span className={styles.faqTip}>Dato: Newton escribió más sobre alquimia que sobre física. Sus manuscritos alquímicos ocupan más de un millón de palabras.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué hizo Lavoisier que fuera tan revolucionario?</strong>
            <p>Lavoisier hizo tres cosas que cambiaron la química para siempre. Primero, refutó el flogisto demostrando con balanzas de precisión que la masa se conserva en toda reacción. Segundo, identificó el oxígeno como el responsable de la combustión, no algún "principio ígneo" misterioso. Tercero, reformó la nomenclatura química: en lugar de "vitriolo azul" o "manteca de antimonio", propuso nombres que describen la composición (ácido sulfúrico, cloruro de cobre). Sin esa nomenclatura sistemática, la química internacional sería imposible.</p>
            <span className={styles.faqTip}>Su frase más famosa: "Nada se crea, nada se destruye, todo se transforma" (Ley de Conservación de la Masa, 1789).</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo predijo Mendeléiev elementos que aún no existían?</strong>
            <p>Mendeléiev ordenó los 63 elementos conocidos en 1869 por masa atómica creciente y observó que las propiedades se repetían periódicamente. Cuando el patrón requería que hubiera un elemento entre dos conocidos, simplemente dejaba un hueco y predijo sus propiedades con extraordinaria precisión. Predijo el "eka-aluminio" (descubierto en 1875 como galio), el "eka-boro" (escandio, 1879) y el "eka-silicio" (germanio, 1886). Cada descubrimiento confirmó su tabla, convenciendo a los escépticos.</p>
            <span className={styles.faqTip}>Curiosidad: Mendeléiev no incluyó los gases nobles porque no se conocían. Cuando Ramsay los descubrió entre 1894 y 1900, encajaron perfectamente como una nueva columna.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre química orgánica e inorgánica?</strong>
            <p>Históricamente, la química orgánica estudiaba compuestos procedentes de seres vivos (carbono) y la inorgánica, los minerales. Se creía que los compuestos orgánicos necesitaban una "fuerza vital" para ser producidos. Wöhler destruyó esa frontera en 1828 sintetizando urea desde cianato amónico puramente inorgánico. Hoy la distinción es técnica: la química orgánica estudia compuestos con carbono (excepto CO, CO₂ y carbonatos), porque el carbono forma cadenas de complejidad casi infinita. La inorgánica estudia el resto de los elementos.</p>
            <span className={styles.faqTip}>El carbono puede formar más compuestos distintos que todos los demás elementos juntos: hay más de 10 millones de compuestos orgánicos conocidos.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es AlphaFold y por qué es tan importante?</strong>
            <p>AlphaFold es un sistema de inteligencia artificial desarrollado por DeepMind (Google) que en 2020 resolvió el "problema del plegamiento de proteínas": dado el código genético de una proteína (su secuencia de aminoácidos), predecir su estructura tridimensional con precisión atómica. Este problema había estado abierto durante 50 años. Las proteínas hacen casi todo en biología (catálisis, estructura, transporte de señales), pero su función depende de su forma 3D. Conocer esa forma permite diseñar fármacos que se ajusten exactamente a la proteína objetivo, acelerando el descubrimiento de medicamentos de forma radical.</p>
            <span className={styles.faqTip}>En 2022, AlphaFold publicó las estructuras predichas de casi todas las proteínas humanas conocidas (~20.000) y de más de 200 millones de proteínas de otros organismos. Acceso libre y gratuito.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo estudiar historia de la química eficazmente</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Entiende el problema que cada período venía a resolver</strong>
              <p>La química avanza por crisis. La alquimia no explicaba por qué las masas cambiaban en la combustión → Lavoisier resolvió el problema con la balanza. Los elementos no tenían orden → Mendeléiev los organizó por periodicidad. Cada período de la historia de la química nace de un problema sin resolver del anterior.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Aprende tres descubrimientos clave por período</strong>
              <p>No intentes memorizar todo. Con tres descubrimientos bien entendidos puedes explicar cada período: uno teórico (un concepto nuevo), uno experimental (una técnica o medición) y uno aplicado (una consecuencia práctica o industrial). El trío define el período mejor que una lista larga.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Conecta química con la historia general</strong>
              <p>La química no ocurre en el vacío. Lavoisier murió en la Revolución Francesa. El proceso Haber-Bosch permitió fabricar explosivos en la Primera Guerra Mundial antes de alimentar al mundo. La carrera nuclear surgió de la química isotópica. Los períodos históricos y los períodos químicos se solapan y se condicionan mutuamente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Visualiza las moléculas y los procesos, no solo las palabras</strong>
              <p>La química es visual por naturaleza. Al estudiar el benceno de Kekulé, dibuja el hexágono. Al estudiar la doble hélice, imagina las dos cadenas enrolladas. Al estudiar la Tabla Periódica, observa cómo los metales alcalinos (columna 1) comparten todas sus propiedades. La memoria química es espacial y molecular, no solo textual.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Sigue la cadena Nobel → rastrea el estado del arte</strong>
              <p>Los Premios Nobel de Química desde 1901 son una guía cronológica casi perfecta del avance químico. Cada Nobel indica qué problema fue considerado más importante resolver en su época. Estudiar los Nobeles de química como secuencia temporal da una visión panorámica de hacia dónde fue la disciplina y por qué.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para estudiar historia de la química</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧪</span>
            <p>La nomenclatura química no es arbitraria: los nombres modernos describen la composición o la estructura. Entender la nomenclatura de Lavoisier es entender la lógica de toda la química posterior.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <p>La balanza fue el instrumento más transformador de la historia de la química. Lavoisier la usó para refutar el flogisto. La masa es la variable que la alquimia nunca midió con rigor.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>Los períodos de la química se solapan: la química orgánica y la electroquímica se desarrollaron simultáneamente en el siglo XIX. La cronología no es lineal sino paralela y a veces contradictoria.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>La química árabe medieval (Jabir, Al-Razi) fue transmisora y creadora, no solo traductora. Muchos términos químicos son de origen árabe: alambique, alcohol, álcali, alquimia. Europa los recibió en el siglo XII.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar historia de la química</strong>
          <ul>
            <li>Confundir <strong>alquimia con pseudociencia sin valor</strong>: la alquimia desarrolló técnicas experimentales reales que son la base del laboratorio moderno. La diferencia con la química moderna es teórica, no experimental. Muchos grandes científicos del siglo XVII practicaron la alquimia.</li>
            <li>Creer que <strong>Mendeléiev inventó los elementos</strong>: los elementos existían y eran conocidos antes que él. Mendeléiev descubrió que tenían un orden periódico subyacente y lo utilizó para predecir elementos aún no descubiertos. Su genio fue organizativo y predictivo, no descubridor.</li>
            <li>Pensar que <strong>la teoría del flogisto era irracional</strong>: el flogisto explicaba consistentemente muchas observaciones de su época (la combustión consume algo, los metales se "calcinan" ganando o perdiendo algo). Era una teoría errónea pero coherente. Lavoisier la refutó con mejores mediciones, no con argumentos abstractos.</li>
            <li>Atribuir <strong>la estructura del ADN solo a Watson y Crick</strong>: Rosalind Franklin obtuvo la fotografía de rayos X (Foto 51) que fue decisiva para el modelo. Su trabajo fue utilizado sin su conocimiento. La historia oficial ha ido reconociendo progresivamente su papel central en uno de los mayores descubrimientos del siglo XX.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-quimica')} />
      <ShareCard appName="visualizador-historia-quimica" />
      <Footer appName="visualizador-historia-quimica" />
    </div>
  );
}
