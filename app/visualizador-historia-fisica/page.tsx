'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaFisica.module.css';
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

type Categoria = 'antigua' | 'medieval' | 'clasica' | 'moderna' | 'contemporanea';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoFisica {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  cientificos: string[];
  conceptos: string[];
  experimento: string;
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

const PERIODOS: PeriodoFisica[] = [
  {
    id: 'griega', nombre: 'Física Griega Antigua', anioInicio: -600, anioFin: -100,
    categoria: 'antigua',
    cientificos: ['Tales de Mileto', 'Arquímedes', 'Aristóteles', 'Pitágoras'],
    conceptos: ['Cuatro elementos (tierra, agua, fuego, aire)', 'Palanca y punto de apoyo', 'Movimiento natural vs. violento', 'Cosmovisión geocéntrica'],
    experimento: 'Arquímedes y el principio de la palanca (c. 250 a.C.)',
    preguntaCentral: '¿De qué está hecho el cosmos y qué leyes gobiernan el movimiento?',
    contexto: 'Los griegos fundaron la física como búsqueda racional de principios naturales. Arquímedes desarrolló la hidrostática y la mecánica de la palanca; Aristóteles sistematizó una física del movimiento que dominaría 1800 años.',
    color: '#8B4513',
  },
  {
    id: 'islamica', nombre: 'Física Islámica Medieval', anioInicio: 800, anioFin: 1400,
    categoria: 'medieval',
    cientificos: ['Ibn al-Haytham', 'Al-Biruni', 'Avicena', 'Al-Khazini'],
    conceptos: ['Óptica geométrica', 'Gravedad como fuerza de atracción', 'Método experimental', 'Velocidad de la luz finita'],
    experimento: 'Libro de Óptica de Ibn al-Haytham — primera teoría experimental de la visión (1015)',
    preguntaCentral: '¿Cómo funciona la luz y qué podemos medir del mundo físico?',
    contexto: 'La ciencia islámica medieval preservó y amplió el legado griego. Ibn al-Haytham inventó el método experimental moderno; Al-Biruni midió la densidad de materiales con precisión extraordinaria.',
    color: '#2E8B57',
  },
  {
    id: 'revolucion', nombre: 'Revolución Científica', anioInicio: 1543, anioFin: 1687,
    categoria: 'clasica',
    cientificos: ['Galileo Galilei', 'Nicolás Copérnico', 'Johannes Kepler', 'William Gilbert'],
    conceptos: ['Heliocentrismo', 'Ley de caída libre', 'Leyes de Kepler', 'Magnetismo terrestre', 'Telescopio astronómico'],
    experimento: 'Galileo lanza objetos desde la Torre de Pisa (c. 1589) — demuestra que todos caen igual',
    preguntaCentral: '¿Cómo se mueven realmente los planetas y los cuerpos en caída libre?',
    contexto: 'Copérnico trasladó el Sol al centro del sistema solar; Galileo usó el telescopio y el experimento como herramientas; Kepler formuló las leyes orbitales. La física dejó de ser filosofía para convertirse en ciencia experimental.',
    color: '#DAA520',
  },
  {
    id: 'newton', nombre: 'Mecánica Newtoniana', anioInicio: 1687, anioFin: 1800,
    categoria: 'clasica',
    cientificos: ['Isaac Newton', 'Gottfried Leibniz', 'Christiaan Huygens', 'Robert Hooke'],
    conceptos: ['Tres leyes del movimiento', 'Gravitación universal', 'Cálculo infinitesimal', 'Óptica corpuscular', 'Principio de inercia'],
    experimento: 'Newton y el prisma de luz blanca (1666) — descomposición espectral',
    preguntaCentral: '¿Qué ley única explica tanto la caída de una manzana como la órbita de la Luna?',
    contexto: 'Los Principia Mathematica de Newton unificaron la mecánica terrestre y la astronomía bajo una sola ley. La gravitación universal demostró que el cosmos obedece leyes matemáticas idénticas en todo lugar.',
    color: '#1E90FF',
  },
  {
    id: 'termodinamica', nombre: 'Termodinámica', anioInicio: 1800, anioFin: 1870,
    categoria: 'moderna',
    cientificos: ['Sadi Carnot', 'James Joule', 'Rudolf Clausius', 'William Thomson (Kelvin)'],
    conceptos: ['Conservación de la energía', 'Entropía', 'Eficiencia del ciclo de Carnot', 'Temperatura absoluta (Kelvin)', 'Dos leyes de la termodinámica'],
    experimento: 'Joule mide el equivalente mecánico del calor (1843) — establece la conservación de la energía',
    preguntaCentral: '¿Qué es el calor y cómo limita la conversión de energía?',
    contexto: 'La revolución industrial planteó preguntas prácticas sobre eficiencia de máquinas de vapor. Carnot estableció los límites teóricos; Clausius formuló la entropía como flecha del tiempo; Kelvin estableció el cero absoluto.',
    color: '#FF4500',
  },
  {
    id: 'electromagnetismo', nombre: 'Electromagnetismo', anioInicio: 1820, anioFin: 1900,
    categoria: 'moderna',
    cientificos: ['Michael Faraday', 'James Clerk Maxwell', 'Heinrich Hertz', 'Hans Christian Ørsted'],
    conceptos: ['Inducción electromagnética', 'Ecuaciones de Maxwell', 'Campo electromagnético', 'Ondas de radio', 'Velocidad de la luz = constante'],
    experimento: 'Hertz genera y detecta ondas de radio (1887) — confirma las ecuaciones de Maxwell',
    preguntaCentral: '¿Qué relación hay entre electricidad, magnetismo y luz?',
    contexto: 'Faraday sin formación matemática descubrió la inducción; Maxwell la formalizó en 4 ecuaciones que describían toda la electrodinámica — y revelaron que la luz era onda electromagnética. Este resultado llevaría directamente a Einstein.',
    color: '#9932CC',
  },
  {
    id: 'estadistica', nombre: 'Física Estadística', anioInicio: 1860, anioFin: 1905,
    categoria: 'moderna',
    cientificos: ['Ludwig Boltzmann', 'James Clerk Maxwell', 'Josiah Willard Gibbs', 'Albert Einstein'],
    conceptos: ['Distribución de Maxwell-Boltzmann', 'Entropía estadística (S = k·ln W)', 'Movimiento browniano', 'Mecánica estadística clásica'],
    experimento: 'Einstein explica el movimiento browniano (1905) — prueba de la existencia del átomo',
    preguntaCentral: '¿Cómo el comportamiento colectivo de millones de átomos produce la termodinámica macroscópica?',
    contexto: 'Boltzmann demostró que la termodinámica emergía del movimiento aleatorio de átomos. Su H-teorema y su constante k vincularon el micro con el macro. Murió sin ver aceptada su teoría atómica; un año después, Einstein y Perrin la confirmaron definitivamente.',
    color: '#20B2AA',
  },
  {
    id: 'relatividad', nombre: 'Relatividad', anioInicio: 1905, anioFin: 1920,
    categoria: 'contemporanea',
    cientificos: ['Albert Einstein', 'Hermann Minkowski', 'David Hilbert', 'Karl Schwarzschild'],
    conceptos: ['Equivalencia masa-energía (E=mc²)', 'Espacio-tiempo curvado', 'Dilatación del tiempo', 'Agujeros negros (solución de Schwarzschild)', 'Principio de covariancia general'],
    experimento: 'Eclipse de 1919 — Eddington mide la curvatura de la luz por el Sol, confirma la Relatividad General',
    preguntaCentral: '¿Son el espacio y el tiempo absolutos o dependen del observador?',
    contexto: 'La relatividad especial (1905) unificó mecánica y electromagnetismo; la general (1915) sustituyó la gravedad newtoniana por la curvatura del espacio-tiempo. El eclipse de 1919 convirtió a Einstein en figura mundial.',
    color: '#FF6347',
  },
  {
    id: 'cuantica', nombre: 'Mecánica Cuántica', anioInicio: 1900, anioFin: 1935,
    categoria: 'contemporanea',
    cientificos: ['Max Planck', 'Niels Bohr', 'Werner Heisenberg', 'Erwin Schrödinger', 'Paul Dirac'],
    conceptos: ['Cuanto de energía (hν)', 'Dualidad onda-partícula', 'Principio de incertidumbre (ΔxΔp ≥ ℏ/2)', 'Ecuación de Schrödinger', 'Espín y antimateria'],
    experimento: 'Experimento de la doble rendija — la partícula pasa por las dos rendijas a la vez',
    preguntaCentral: '¿La naturaleza es fundamentalmente discreta y probabilística?',
    contexto: 'Planck (1900) propuso que la energía se emitía en "cuantos" para resolver la catástrofe ultravioleta. Bohr modeló el átomo; Heisenberg y Born desarrollaron la mecánica matricial; Schrödinger la ecuación de onda. La controversia Einstein-Bohr sobre la completitud de la cuántica continúa.',
    color: '#4169E1',
  },
  {
    id: 'nuclear', nombre: 'Física Nuclear', anioInicio: 1932, anioFin: 1945,
    categoria: 'contemporanea',
    cientificos: ['Ernest Rutherford', 'James Chadwick', 'Enrico Fermi', 'Otto Hahn', 'Lise Meitner'],
    conceptos: ['Modelo del núcleo atómico', 'Neutrón', 'Fisión nuclear', 'Reacción en cadena', 'Proyecto Manhattan'],
    experimento: 'Primera reacción en cadena sostenida — pila de Chicago (1942)',
    preguntaCentral: '¿Qué energía libera el núcleo y cómo se puede controlar?',
    contexto: 'Rutherford descubrió el núcleo; Chadwick el neutrón; Fermi demostró la fisión en cadena. El Proyecto Manhattan aplicó toda esta ciencia para construir la bomba atómica — el mayor y más oscuro logro de la física del siglo XX.',
    color: '#8B0000',
  },
  {
    id: 'particulas', nombre: 'Física de Partículas', anioInicio: 1950, anioFin: 1975,
    categoria: 'contemporanea',
    cientificos: ['Murray Gell-Mann', 'Richard Feynman', 'Steven Weinberg', 'Sheldon Glashow', 'Abdus Salam'],
    conceptos: ['Modelo Estándar de partículas', 'QED (electrodinámica cuántica)', 'Quarks y gluones', 'Unificación electrodébil', 'Diagramas de Feynman'],
    experimento: 'Descubrimiento del quark "charm" (1974) — confirma el Modelo Estándar',
    preguntaCentral: '¿Cuáles son las partículas fundamentales y las fuerzas que las gobiernan?',
    contexto: 'La física de partículas construyó el Modelo Estándar: 12 partículas de materia + 4 fuerzas (gravitación excluida). Los aceleradores del CERN y Fermilab fueron sus laboratorios. Feynman inventó los diagramas que hacen calculable la interacción cuántica.',
    color: '#006400',
  },
  {
    id: 'condensada', nombre: 'Física de la Materia Condensada', anioInicio: 1960, anioFin: 9999,
    categoria: 'contemporanea',
    cientificos: ['John Bardeen', 'Philip Anderson', 'Klaus von Klitzing', 'Andre Geim'],
    conceptos: ['Superconductividad (BCS)', 'Semiconductores y transistor', 'Efecto Hall cuántico', 'Grafeno', 'Materiales topológicos'],
    experimento: 'Descubrimiento del grafeno con cinta adhesiva — Geim & Novoselov (2004)',
    preguntaCentral: '¿Qué propiedades colectivas emergen cuando se ordenan millones de átomos?',
    contexto: 'La física de la materia condensada produjo el transistor (base de toda la electrónica), el láser, los superconductores y el grafeno. Es la física más aplicada industrialmente: el teléfono móvil es su obra cumulativa.',
    color: '#2E86AB',
  },
  {
    id: 'cosmologia', nombre: 'Cosmología Física', anioInicio: 1927, anioFin: 9999,
    categoria: 'contemporanea',
    cientificos: ['Georges Lemaître', 'Edwin Hubble', 'George Gamow', 'Vera Rubin', 'Saul Perlmutter'],
    conceptos: ['Big Bang', 'Expansión acelerada del universo', 'Materia oscura', 'Energía oscura', 'Fondo cósmico de microondas'],
    experimento: 'Descubrimiento de la expansión acelerada del universo (1998) — Premio Nobel 2011',
    preguntaCentral: '¿Cuál es el origen, la estructura y el destino del universo?',
    contexto: 'Lemaître propuso el "átomo primitivo" (1927); Hubble confirmó que las galaxias se alejan; el fondo de microondas (1965) selló el Big Bang. El descubrimiento de que la expansión se acelera (1998) reveló la energía oscura: el 68% del universo es desconocido.',
    color: '#191970',
  },
  {
    id: 'cuerdas', nombre: 'Física Teórica Contemporánea', anioInicio: 1984, anioFin: 9999,
    categoria: 'contemporanea',
    cientificos: ['Stephen Hawking', 'Edward Witten', 'Juan Maldacena', 'Lisa Randall'],
    conceptos: ['Teoría de cuerdas (10-11 dimensiones)', 'Radiación de Hawking', 'Dualidad AdS/CFT', 'Dimensiones extra', 'Gravedad cuántica de lazos'],
    experimento: 'Detección de ondas gravitacionales (LIGO, 2015) — confirma la predicción de Einstein de 1916',
    preguntaCentral: '¿Existe una teoría que unifique la mecánica cuántica y la relatividad general?',
    contexto: 'La gran pregunta abierta de la física: unificar la cuántica (lo muy pequeño) con la relatividad (lo muy grande). La teoría de cuerdas propone que las partículas son vibraciones de cuerdas en dimensiones extra. Las ondas gravitacionales abrieron una nueva ventana al universo.',
    color: '#483D8B',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -580, evento: 'Tales de Mileto predice un eclipse — primer uso científico de la astronomía griega' },
  { anio: 1543, evento: 'Copérnico publica el heliocentrismo — la física y la astronomía nunca serán lo mismo' },
  { anio: 1687, evento: 'Newton publica los Principia Mathematica — unifica física terrestre y celeste' },
  { anio: 1820, evento: 'Ørsted descubre que la corriente eléctrica genera campo magnético' },
  { anio: 1905, evento: 'Año milagroso de Einstein: relatividad especial, efecto fotoeléctrico, movimiento browniano' },
  { anio: 1927, evento: 'Congreso de Solvay — debate Einstein vs. Bohr sobre la naturaleza de la cuántica' },
  { anio: 1964, evento: 'Gell-Mann propone los quarks — las partículas tienen subestructura' },
  { anio: 2012, evento: 'CERN descubre el bosón de Higgs — completa el Modelo Estándar' },
  { anio: 2015, evento: 'LIGO detecta ondas gravitacionales — Einstein tenía razón 100 años después' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  antigua: 'Antigua',
  medieval: 'Medieval',
  clasica: 'Clásica',
  moderna: 'Moderna',
  contemporanea: 'Contemporánea',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  antigua: '#8B4513',
  medieval: '#2E8B57',
  clasica: '#DAA520',
  moderna: '#9932CC',
  contemporanea: '#DC143C',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoFisica }) {
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
          <h4 className={styles.detalleSubtitulo}>Científicos clave</h4>
          <ul className={styles.artistasList}>
            {periodo.cientificos.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Experimento clave</span>
        <p>{periodo.experimento}</p>
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

const AÑO_MIN = -600;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoFisica | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoFisica[][] = [[], [], [], []];
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
  const siglos: number[] = [-400, 0, 400, 800, 1200, 1500, 1700, 1850, 1950, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el 600 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la física"
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
              <h4 className={styles.detalleSubtitulo}>Científicos clave</h4>
              <ul className={styles.artistasList}>
                {periodo.cientificos.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Experimento clave</span>
            <p>{periodo.experimento}</p>
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
        per.cientificos.some((f) => f.toLowerCase().includes(termino));
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
        placeholder="Buscar por período o científico..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de física"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Científico clave</th>
              <th>Experimento clave</th>
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
                  <td>{per.cientificos[0]}</td>
                  <td className={styles.preguntaCell}>{per.experimento}</td>
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
  { nombre: 'Física Antigua', desde: -600, hasta: 0, icono: '🏛️' },
  { nombre: 'Física Medieval y Renacentista', desde: 0, hasta: 1650, icono: '📜' },
  { nombre: 'Mecánica Clásica', desde: 1650, hasta: 1800, icono: '🍎' },
  { nombre: 'Termodinámica y Electromagnetismo', desde: 1800, hasta: 1900, icono: '⚡' },
  { nombre: 'Relatividad y Cuántica', desde: 1900, hasta: 1960, icono: '🌀' },
  { nombre: 'Física de Partículas y Cuerdas', desde: 1960, hasta: 9999, icono: '🔬' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de la física e hitos históricos organizados por eras.
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

export default function VisualizadorHistoriaFisica() {
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
        <h1 className={styles.heroTitle}>Historia de la Física ⚛️</h1>
        <p className={styles.heroSubtitle}>
          De los griegos a la física de cuerdas — 14 períodos con los descubrimientos que cambiaron nuestra comprensión del universo
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
        title="Historia de la física: períodos y descubrimientos"
        subtitle="Cómo los grandes experimentos y teorías de la física han transformado nuestra comprensión del universo"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos de física clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Categoría</th>
                <th>Científico clave</th>
                <th>Concepto central</th>
                <th>Experimento/Hito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Física Griega</strong></td>
                <td>600–100 a.C.</td>
                <td>Antigua</td>
                <td>Arquímedes</td>
                <td>Principio de la palanca</td>
                <td>Palanca y punto de apoyo</td>
              </tr>
              <tr>
                <td><strong>Mecánica Newtoniana</strong></td>
                <td>1687–1800</td>
                <td>Clásica</td>
                <td>Isaac Newton</td>
                <td>Gravitación universal</td>
                <td>Prisma y descomposición de la luz</td>
              </tr>
              <tr>
                <td><strong>Electromagnetismo</strong></td>
                <td>1820–1900</td>
                <td>Moderna</td>
                <td>James Clerk Maxwell</td>
                <td>Campo electromagnético</td>
                <td>Hertz genera ondas de radio (1887)</td>
              </tr>
              <tr>
                <td><strong>Relatividad</strong></td>
                <td>1905–1920</td>
                <td>Contemporánea</td>
                <td>Albert Einstein</td>
                <td>E=mc²</td>
                <td>Eclipse de 1919 — curvatura de la luz</td>
              </tr>
              <tr>
                <td><strong>Mecánica Cuántica</strong></td>
                <td>1900–1935</td>
                <td>Contemporánea</td>
                <td>Werner Heisenberg</td>
                <td>Principio de incertidumbre</td>
                <td>Experimento de la doble rendija</td>
              </tr>
              <tr>
                <td><strong>Física de Partículas</strong></td>
                <td>1950–1975</td>
                <td>Contemporánea</td>
                <td>Richard Feynman</td>
                <td>Modelo Estándar</td>
                <td>Descubrimiento del quark charm (1974)</td>
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
              <p>Prepara el tema de Historia de la Ciencia para selectividad identificando los períodos, sus científicos clave y los experimentos que marcaron cada época con la cronología visual.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
            <div>
              <strong>Divulgador científico</strong>
              <p>Necesita contextualizar los grandes hitos de la física para su canal o blog: la línea del tiempo muestra qué descubrimiento siguió a cuál y por qué el orden importa.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
            <div>
              <strong>Curioso sin formación técnica</strong>
              <p>Quiere entender qué es la mecánica cuántica en su contexto histórico: por qué surgió, qué problema resolvía y cómo se relaciona con Einstein o Newton.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">✏️</span>
            <div>
              <strong>Opositor de Física</strong>
              <p>Repasa la evolución de las ideas físicas para los temarios de Secundaria y Bachillerato, organizando los períodos por categoría y viendo sus conexiones históricas.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué la física clásica de Newton sigue siendo útil si fue "superada" por la relatividad?</strong>
            <p>Cada teoría física tiene un dominio de validez. La mecánica newtoniana es perfectamente precisa para velocidades mucho menores que la luz y masas ordinarias — es decir, para casi toda la ingeniería cotidiana: puentes, cohetes al espacio, máquinas. La relatividad solo supera a Newton en los extremos: velocidades cercanas a la luz o campos gravitacionales muy intensos. Einstein no anuló a Newton: lo englobó como caso límite.</p>
            <span className={styles.faqTip}>Consejo: la NASA usó mecánica newtoniana para las misiones Apolo. Solo los GPS necesitan relatividad para mantener la precisión.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es exactamente la mecánica cuántica y por qué es tan contraintuitiva?</strong>
            <p>La mecánica cuántica describe el comportamiento de la materia a escala atómica y subatómica. A esa escala, las partículas no tienen posición y velocidad definidas simultáneamente (principio de incertidumbre de Heisenberg), pueden existir en superposición de estados y se comportan como ondas hasta que se miden. Es contraintuitiva porque nuestro cerebro evolucionó para percibir objetos macroscópicos donde estos efectos son invisibles.</p>
            <span className={styles.faqTip}>Famosa cita de Feynman: "Si crees que entiendes la mecánica cuántica, es que no la entiendes."</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿La teoría de cuerdas es ciencia o especulación?</strong>
            <p>La teoría de cuerdas es matemáticamente coherente y hace predicciones, pero ninguna ha sido confirmada experimentalmente todavía. Es ciencia teórica en el sentido de que usa el método matemático riguroso, pero no es ciencia experimental confirmada. Sus defensores argumentan que los aceleradores actuales no tienen suficiente energía para testearla; sus críticos, que sin predicciones verificables no es falsable en el sentido de Popper. El debate es genuinamente abierto.</p>
            <span className={styles.faqTip}>La dualidad AdS/CFT de Maldacena (1997) ha tenido aplicaciones inesperadas en física de materiales y quark-gluon plasma.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la materia oscura y por qué no la podemos ver?</strong>
            <p>La materia oscura es materia que no emite, absorbe ni refleja luz electromagnética — de ahí que sea "oscura". La inferimos porque las galaxias rotan más rápido de lo que la materia visible podría explicar (Vera Rubin, años 70), y porque la luz se curva alrededor de regiones del espacio donde no vemos materia. Constituye el 27% del universo. No sabemos qué es: los candidatos van desde partículas subatómicas masivas hasta agujeros negros primordiales.</p>
            <span className={styles.faqTip}>La energía oscura (68% del universo) es todavía más misteriosa: es lo que causa la expansión acelerada del cosmos.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el bosón de Higgs es tan importante?</strong>
            <p>El bosón de Higgs es la partícula asociada al campo de Higgs, que permea todo el espacio y da masa a las partículas fundamentales al interactuar con ellas. Sin el mecanismo de Higgs, las partículas serían todas sin masa y viajarían a la velocidad de la luz — no existirían átomos, ni materia ordinaria. Su predicción teórica (1964) y su descubrimiento experimental en el CERN (2012) completaron el Modelo Estándar: la teoría más precisa y completa de la física de partículas.</p>
            <span className={styles.faqTip}>El bosón de Higgs se llama popularmente "partícula de Dios", nombre que el propio Higgs detestaba por considerarlo inapropiado.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo estudiar un período de la historia de la física eficazmente</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el problema que resolvía</strong>
              <p>Toda teoría física nace para resolver un problema concreto que la física anterior no podía explicar. La mecánica cuántica surgió de la catástrofe ultravioleta del cuerpo negro; la relatividad, de la incompatibilidad entre mecánica y electromagnetismo. Pregúntate: ¿qué anomalía o contradicción motivó esta teoría?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Aprende el experimento clave</strong>
              <p>La física se basa en experimentos, no en filosofía. Cada período tiene uno o varios experimentos emblemáticos que lo definen: la doble rendija para la cuántica, el eclipse de 1919 para la relatividad general, la pila de Chicago para la nuclear. Entender el experimento es entender la teoría.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Domina dos o tres conceptos fundamentales</strong>
              <p>No memorices todo de golpe. Con dos o tres conceptos bien entendidos puedes explicar cualquier período: uno sobre qué describe la teoría, uno sobre cómo lo mide y uno sobre sus límites. Para la relatividad: espacio-tiempo, dilatación del tiempo y dominio de validez (velocidades relativistas).</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta con el período anterior y el siguiente</strong>
              <p>La física es acumulativa: cada teoría asume las anteriores y abre las siguientes. Newton asume la óptica de Huygens y abre el camino a la termodinámica; Maxwell abre el camino a Einstein; Planck abre el camino a Heisenberg. Estudiar las conexiones es más eficaz que estudiar los períodos como compartimentos estancos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Ubica el contexto histórico y tecnológico</strong>
              <p>La termodinámica surge de la revolución industrial; la física nuclear, de la Segunda Guerra Mundial; la física de partículas, de la guerra fría y sus grandes presupuestos de investigación. La ciencia no ocurre en el vacío: el contexto explica qué preguntas se hacían y qué recursos había para responderlas.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para entender la física histórica</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>Las teorías físicas no se "invalidan" — se convierten en casos límite de teorías más generales. Newton sigue funcionando perfectamente en su dominio, igual que la termodinámica macroscópica sigue siendo válida aunque la mecánica estadística la explique desde el nivel atómico.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>Los períodos se solapan en el tiempo: la mecánica cuántica y la relatividad se desarrollaron en paralelo, y sus fundadores debatieron entre sí (Einstein-Bohr). No estudies la física histórica como una secuencia lineal rígida — es una conversación simultánea entre científicos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Empieza por la mecánica clásica (Newton) antes de abordar la cuántica y la relatividad: sin entender qué asumía la física clásica, no podrás apreciar por qué Einstein y Planck fueron tan revolucionarios al romper con ella.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Usa la cronología para visualizar qué científicos coincidieron en el tiempo: Einstein, Bohr, Heisenberg y Schrödinger fueron contemporáneos y se conocieron. El Congreso de Solvay de 1927 fue literalmente una foto de grupo de la física del siglo XX.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar la historia de la física</strong>
          <ul>
            <li>Creer que <strong>Einstein "refutó" a Newton</strong>: Einstein generalizó la mecánica de Newton, no la invalidó. En velocidades bajas, las ecuaciones de Einstein se reducen exactamente a las de Newton. La física newtoniana sigue siendo la base de toda la ingeniería clásica.</li>
            <li>Confundir <strong>física cuántica con cuántica popular</strong>: términos como "energía cuántica", "salto cuántico" o "conciencia cuántica" en libros de autoayuda no tienen relación con la mecánica cuántica científica. La cuántica real es matemáticamente rigurosa y describe partículas subatómicas, no estados mentales.</li>
            <li>Asumir que <strong>la teoría de cuerdas es ciencia confirmada</strong>: es una teoría matemáticamente coherente pero sin verificación experimental. El Modelo Estándar de partículas, en cambio, es la teoría física más precisamente confirmada de la historia (predicciones correctas a 12 decimales).</li>
            <li>Pensar que <strong>la física clásica es "fácil" y la cuántica "difícil"</strong>: la mecánica de fluidos clásica tiene problemas abiertos (turbulencia) que no sabemos resolver; la mecánica cuántica tiene algoritmos muy bien establecidos. La dificultad no es cronológica — es conceptual y matemática en cada área por separado.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-fisica')} />
      <ShareCard appName="visualizador-historia-fisica" />
      <Footer appName="visualizador-historia-fisica" />
    </div>
  );
}
