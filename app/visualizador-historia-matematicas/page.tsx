'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaMatematicas.module.css';
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

type Categoria = 'antigua' | 'clasica' | 'medieval' | 'moderna' | 'contemporanea';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoMatematicas {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  matematicos: string[];
  conceptos: string[];
  teorema: string;
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

const PERIODOS: PeriodoMatematicas[] = [
  {
    id: 'babilonico',
    nombre: 'Matemáticas Babilónicas y Egipcias',
    anioInicio: -3000,
    anioFin: -500,
    categoria: 'antigua',
    matematicos: ['Escribas de Nippur', 'Sacerdotes de Menfis'],
    conceptos: [
      'Sistema posicional base 60 (sexagesimal)',
      'Tablas de multiplicar y recíprocos',
      'Álgebra proto-cuadrática',
      'Geometría práctica (volúmenes)',
      'Papiro de Rhind (fracciones egipcias)',
    ],
    teorema: 'Tablilla YBC 7289 (c. 1800 a.C.) — √2 calculada con 6 decimales de precisión',
    preguntaCentral: '¿Cómo resolver problemas prácticos de medida, comercio y construcción?',
    contexto:
      'Los babilonios resolvían ecuaciones de segundo grado 1500 años antes de los griegos. Su sistema sexagesimal (base 60) aún usamos en horas, minutos y grados. El papiro de Rhind egipcio muestra operaciones con fracciones unitarias de asombrosa sofisticación.',
    color: '#8B4513',
  },
  {
    id: 'grecia',
    nombre: 'Matemáticas Griegas',
    anioInicio: -600,
    anioFin: -100,
    categoria: 'clasica',
    matematicos: ['Tales de Mileto', 'Pitágoras', 'Euclides', 'Arquímedes', 'Apolonio'],
    conceptos: [
      'Demostración axiomática y deductiva',
      'Teorema de Pitágoras',
      'Irracionalidad de √2',
      'Los Elementos de Euclides',
      'Π y métodos de agotamiento',
    ],
    teorema: 'Euclides publica Los Elementos (c. 300 a.C.) — 465 proposiciones deducidas de 5 axiomas',
    preguntaCentral: '¿Puede la razón pura, sin medida, demostrar verdades eternas sobre el espacio?',
    contexto:
      'Los griegos inventaron la demostración matemática. Euclides sistematizó la geometría en Los Elementos — el libro más leído después de la Biblia. Arquímedes calculó π entre 3⅓ y 3⅐, y anticipó el cálculo integral con su método de agotamiento.',
    color: '#DAA520',
  },
  {
    id: 'helenistico',
    nombre: 'Matemáticas Helenísticas y Alejandrinas',
    anioInicio: -300,
    anioFin: 400,
    categoria: 'clasica',
    matematicos: ['Arquímedes', 'Eratóstenes', 'Diofanto', 'Hipatia', 'Ptolomeo'],
    conceptos: [
      'Álgebra diofántica (ecuaciones enteras)',
      'Circunferencia de la Tierra (Eratóstenes)',
      'Trigonometría y cuerda',
      'Sistema de numeración de Ptolomeo',
      'Sección cónica',
    ],
    teorema: 'Eratóstenes mide la circunferencia terrestre (c. 240 a.C.) con error menor del 2%',
    preguntaCentral: '¿Cuánto podemos medir y calcular del mundo físico con geometría?',
    contexto:
      'La Biblioteca de Alejandría fue el centro mundial de matemáticas. Eratóstenes midió la Tierra con estacas y ángulos de sombra. Diofanto inventó la notación algebraica proto-simbólica. Hipatia, primera matemática documentada de la historia, fue asesinada en 415.',
    color: '#CD853F',
  },
  {
    id: 'islamico',
    nombre: 'Matemáticas Islámicas y Medievales',
    anioInicio: 800,
    anioFin: 1400,
    categoria: 'medieval',
    matematicos: ['Al-Juarismi', 'Omar Jayyam', 'Al-Battani', 'Fibonacci', 'Al-Karaji'],
    conceptos: [
      'Álgebra como disciplina autónoma (Al-Kitab al-mukhtasar)',
      'Números indo-arábigos en Europa',
      'Ecuaciones cúbicas (Omar Jayyam)',
      'Sucesión de Fibonacci',
      'Tablas trigonométricas',
    ],
    teorema:
      'Al-Juarismi publica Kitab al-mukhtasar (c. 830) — funda el álgebra como disciplina. Su nombre dio "algoritmo"',
    preguntaCentral: '¿Cómo resolver sistemáticamente ecuaciones de cualquier grado?',
    contexto:
      'Al-Juarismi (cuyo nombre dio "algoritmo") formalizó el álgebra: resolver ecuaciones lineales y cuadráticas de forma sistemática. Fibonacci introdujo los números indo-arábigos en Europa (1202). Omar Jayyam resolvió ecuaciones cúbicas geométricamente.',
    color: '#2E8B57',
  },
  {
    id: 'renacimiento',
    nombre: 'Revolución Científica Matemática',
    anioInicio: 1545,
    anioFin: 1637,
    categoria: 'moderna',
    matematicos: ['Niccolò Tartaglia', 'Gerolamo Cardano', 'François Viète', 'Simon Stevin', 'René Descartes'],
    conceptos: [
      'Solución de la cúbica y cuártica',
      'Números complejos (raíces imaginarias)',
      'Álgebra simbólica moderna (Viète)',
      'Decimales (Stevin)',
      'Geometría analítica (Descartes)',
    ],
    teorema: 'Descartes publica La Geometría (1637) — unifica álgebra y geometría con coordenadas (x,y)',
    preguntaCentral:
      '¿Pueden el álgebra y la geometría describirse mutuamente con un sistema de coordenadas?',
    contexto:
      'Tartaglia y Cardano resolvieron la ecuación cúbica, encontrando números imaginarios. Descartes (el del "Cogito ergo sum") inventó el plano cartesiano: traducir curvas a ecuaciones y viceversa. Esta geometría analítica hizo posible el cálculo de Newton y Leibniz.',
    color: '#9370DB',
  },
  {
    id: 'calculo',
    nombre: 'Cálculo Infinitesimal',
    anioInicio: 1665,
    anioFin: 1700,
    categoria: 'moderna',
    matematicos: [
      'Isaac Newton',
      'Gottfried Leibniz',
      'Jakob Bernoulli',
      'Johann Bernoulli',
      "Guillaume de l'Hôpital",
    ],
    conceptos: [
      'Derivada e integral',
      'Teorema fundamental del cálculo',
      'Notación de Leibniz (dy/dx, ∫)',
      'Series de potencias',
      "Regla de L'Hôpital",
    ],
    teorema:
      'Newton y Leibniz desarrollan el cálculo (1665–1675) — la herramienta matemática de la revolución científica',
    preguntaCentral:
      '¿Cómo calcular tasas de cambio instantáneas y áreas bajo curvas arbitrarias?',
    contexto:
      'Newton inventó el cálculo (fluxiones) para describir el movimiento; Leibniz lo publicó primero con la notación que usamos hoy. La disputa de prioridad dividió matemáticos británicos y continentales. Los hermanos Bernoulli aplicaron el cálculo a docenas de problemas físicos.',
    color: '#1E90FF',
  },
  {
    id: 'analisis',
    nombre: 'Análisis Matemático',
    anioInicio: 1700,
    anioFin: 1870,
    categoria: 'moderna',
    matematicos: [
      'Leonhard Euler',
      'Joseph-Louis Lagrange',
      'Augustin-Louis Cauchy',
      'Karl Weierstrass',
      'Georg Friedrich Bernhard Riemann',
    ],
    conceptos: [
      'Fórmula de Euler (e^iπ + 1 = 0)',
      'Teoría de funciones complejas',
      'Definición rigurosa de límite (ε-δ)',
      'Serie de Fourier',
      'Integral de Riemann',
    ],
    teorema:
      'Euler demuestra la identidad e^iπ + 1 = 0 (1748) — "la ecuación más bella de las matemáticas"',
    preguntaCentral: '¿Cómo hacer el cálculo riguroso y extenderlo a funciones complejas?',
    contexto:
      'Euler fue el matemático más prolífico de la historia: introdujo e, i, π, f(x), Σ. Cauchy rigorizó el límite, la continuidad y la derivada. Fourier mostró que cualquier función periódica puede descomponerse en senos y cosenos. Riemann reimaginó la geometría y la integral.',
    color: '#4169E1',
  },
  {
    id: 'algebra_moderna',
    nombre: 'Álgebra Abstracta y Teoría de Grupos',
    anioInicio: 1830,
    anioFin: 1920,
    categoria: 'moderna',
    matematicos: ['Évariste Galois', 'Niels Henrik Abel', 'Arthur Cayley', 'Emmy Noether', 'Sophus Lie'],
    conceptos: [
      'Grupos, anillos y cuerpos',
      'Imposibilidad de la quíntica por radicales',
      'Simetría y grupos de Lie',
      'Teorema de Noether (simetría↔conservación)',
      'Transformaciones abstractas',
    ],
    teorema:
      'Galois prueba (a los 20 años, en 1832) que no existe fórmula general para el polinomio de grado 5',
    preguntaCentral: '¿Qué estructuras algebraicas subyacen a las ecuaciones y las simetrías?',
    contexto:
      'Galois murió a los 20 años en un duelo, habiendo fundado la teoría de grupos la noche anterior. Abel demostró la imposibilidad de la quíntica. Emmy Noether (1918) demostró que cada simetría física corresponde a una ley de conservación — base teórica de toda la física moderna.',
    color: '#DC143C',
  },
  {
    id: 'logica',
    nombre: 'Lógica Matemática y Fundamentos',
    anioInicio: 1879,
    anioFin: 1931,
    categoria: 'contemporanea',
    matematicos: ['Gottlob Frege', 'Georg Cantor', 'Bertrand Russell', 'David Hilbert', 'Kurt Gödel'],
    conceptos: [
      'Lógica de predicados',
      'Teoría de conjuntos infinitos',
      'Paradoja de Russell',
      'Programa de Hilbert (formalización)',
      'Teoremas de incompletitud de Gödel',
    ],
    teorema:
      'Gödel demuestra los teoremas de incompletitud (1931) — toda matemática suficientemente rica tiene verdades indemostrables',
    preguntaCentral:
      '¿Pueden las matemáticas fundamentarse completamente en lógica? ¿Son completas?',
    contexto:
      'Cantor inventó el infinito matemático y sus paradojas: hay infinitos más grandes que otros. Russell encontró la paradoja que demolió el logicismo de Frege. Hilbert quiso formalizar toda la matemática. Gödel demostró que ese programa era imposible: hay verdades matemáticas que no se pueden probar desde dentro del sistema.',
    color: '#8B008B',
  },
  {
    id: 'probabilidad',
    nombre: 'Probabilidad y Estadística',
    anioInicio: 1654,
    anioFin: 9999,
    categoria: 'moderna',
    matematicos: [
      'Blaise Pascal',
      'Pierre de Fermat',
      'Jakob Bernoulli',
      'Thomas Bayes',
      'Karl Pearson',
      'Andréi Kolmogórov',
    ],
    conceptos: [
      'Teoría de la probabilidad (Pascal-Fermat)',
      'Ley de los grandes números',
      'Teorema de Bayes',
      'Distribución normal (Gauss)',
      'Axiomatización de Kolmogórov',
    ],
    teorema:
      'Kolmogórov axiomatiza la probabilidad (1933) — fundamento matemático de toda la estadística moderna',
    preguntaCentral: '¿Puede la incertidumbre cuantificarse matemáticamente?',
    contexto:
      'Pascal y Fermat inventaron la probabilidad en 1654 para resolver un problema de juego de dados. Bayes formuló el teorema de actualización de creencias. Gauss y la distribución normal dominaron la estadística del siglo XIX. Kolmogórov formalizó todo en 1933 con tres axiomas.',
    color: '#FF6347',
  },
  {
    id: 'topologia',
    nombre: 'Topología y Geometría Moderna',
    anioInicio: 1736,
    anioFin: 9999,
    categoria: 'contemporanea',
    matematicos: ['Leonhard Euler', 'Henri Poincaré', 'Felix Klein', 'Luitzen Brouwer', 'Grigori Perelman'],
    conceptos: [
      'Problema de los puentes de Königsberg (grafos)',
      'Conjetura de Poincaré (esferas en 3D)',
      'Botella de Klein (sin interior/exterior)',
      'Superficies orientables',
      'Espacios de Banach',
    ],
    teorema:
      'Perelman demuestra la conjetura de Poincaré (2003) — único Problema del Milenio resuelto hasta hoy',
    preguntaCentral:
      '¿Cuáles son las propiedades de los espacios que persisten bajo deformación continua?',
    contexto:
      'Euler inventó la teoría de grafos al resolver los puentes de Königsberg (1736). Poincaré fundó la topología algebraica. La conjetura de Poincaré, sobre esferas en dimensión 3, resistió 100 años hasta que Perelman la demostró en 2003 — y rechazó el premio de 1 millón de dólares.',
    color: '#20B2AA',
  },
  {
    id: 'computacion',
    nombre: 'Matemáticas Discretas y Teoría de la Computación',
    anioInicio: 1936,
    anioFin: 9999,
    categoria: 'contemporanea',
    matematicos: ['Alan Turing', 'John von Neumann', 'Claude Shannon', 'Paul Erdős', 'Stephen Cook'],
    conceptos: [
      'Máquina de Turing',
      'Teoría de la información (bits, entropía)',
      'Criptografía matemática',
      'P vs NP (problema abierto)',
      'Complejidad computacional',
    ],
    teorema:
      'Turing demuestra la indecidibilidad del problema de la parada (1936) — hay preguntas computacionales sin respuesta algorítmica',
    preguntaCentral:
      '¿Qué puede computarse y cuáles son los límites matemáticos del cálculo?',
    contexto:
      'Turing inventó la máquina abstracta que modela todo ordenador (1936) y fue clave en descifrar Enigma. Shannon fundó la teoría de la información con 1 artículo en 1948. P vs NP —¿son los problemas verificables también resolubles eficientemente?— sigue abierto con 1M$ de premio.',
    color: '#2E86AB',
  },
  {
    id: 'matematicas_aplicadas',
    nombre: 'Matemáticas Aplicadas y Modelado',
    anioInicio: 1950,
    anioFin: 9999,
    categoria: 'contemporanea',
    matematicos: [
      'John Nash',
      'Norbert Wiener',
      'Benoit Mandelbrot',
      'Edward Lorenz',
      'Ingrid Daubechies',
    ],
    conceptos: [
      'Teoría de juegos (equilibrio de Nash)',
      'Cibernética',
      'Fractales y dimensión fractal',
      'Teoría del caos (efecto mariposa)',
      'Wavelets y procesamiento de señales',
    ],
    teorema:
      'Nash demuestra el equilibrio de Nash (1950) — base matemática de la economía moderna y la IA',
    preguntaCentral:
      '¿Cómo modelar matemáticamente sistemas complejos como la economía, el clima o la mente?',
    contexto:
      'Nash (John Nash, "Una mente brillante") fundó la teoría de juegos moderna que hoy gobierna la economía, la biología evolutiva y el diseño de IA. Mandelbrot inventó los fractales: la geometría de la costa irregular, las nubes, los mercados financieros. Lorenz descubrió el caos: la imposibilidad de predicción a largo plazo.',
    color: '#FF8C00',
  },
  {
    id: 'ia_matematica',
    nombre: 'Matemáticas e Inteligencia Artificial',
    anioInicio: 2000,
    anioFin: 9999,
    categoria: 'contemporanea',
    matematicos: [
      'Terence Tao',
      'Andrew Wiles',
      'Grigori Perelman',
      'Equipo DeepMind (AlphaProof)',
    ],
    conceptos: [
      'Último teorema de Fermat (Wiles, 1994)',
      'Hipótesis de Riemann (aún abierta)',
      'Problemas del Milenio',
      'Demostración asistida por IA (AlphaProof)',
      'Geometría algebraica moderna',
    ],
    teorema:
      'Wiles demuestra el Último Teorema de Fermat (1994) — abierto 358 años, demostración de 130 páginas',
    preguntaCentral:
      '¿Puede la inteligencia artificial descubrir y demostrar nuevos teoremas matemáticos?',
    contexto:
      'Wiles demostró en 1994 el teorema que Fermat afirmó tener pero no escribió (1637). Los 7 Problemas del Milenio tienen 1M$ cada uno; solo Poincaré ha sido resuelto. AlphaProof de DeepMind (2024) resolvió problemas de competición matemática a nivel de medalla olímpica, abriendo la era de la demostración asistida por IA.',
    color: '#556B2F',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -3000, evento: 'Tablillas babilónicas — primeros registros matemáticos sistemáticos de la historia' },
  { anio: -300, evento: 'Euclides redacta Los Elementos — 2300 años de texto matemático de referencia' },
  { anio: 830, evento: 'Al-Juarismi funda el álgebra — y da nombre al "algoritmo"' },
  { anio: 1637, evento: 'Descartes inventa la geometría analítica — álgebra y geometría se unen' },
  { anio: 1687, evento: 'Newton publica Principia usando el cálculo que había inventado 20 años antes' },
  { anio: 1822, evento: 'Fourier demuestra que cualquier función periódica es suma de senos y cosenos' },
  { anio: 1931, evento: 'Gödel demuestra que las matemáticas son incompletas — el mayor shock lógico del siglo' },
  { anio: 2000, evento: 'Instituto Clay publica los 7 Problemas del Milenio con 1M$ cada uno' },
  { anio: 2023, evento: 'AlphaProof (DeepMind) resuelve problemas olímpicos — IA entra en la investigación matemática' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  antigua: 'Antigua',
  clasica: 'Clásica',
  medieval: 'Medieval',
  moderna: 'Moderna',
  contemporanea: 'Contemporánea',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  antigua: '#8B4513',
  clasica: '#DAA520',
  medieval: '#2E8B57',
  moderna: '#1E90FF',
  contemporanea: '#DC143C',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoMatematicas }) {
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
          <h4 className={styles.detalleSubtitulo}>Matemáticos clave</h4>
          <ul className={styles.artistasList}>
            {periodo.matematicos.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra o teorema clave</span>
        <p>{periodo.teorema}</p>
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

const AÑO_MIN = -3000;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoMatematicas | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoMatematicas[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (
        !ultimoEnFila ||
        anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_MAX : ultimoEnFila.anioFin) + 4 <=
          anioAX(per.anioInicio)
      ) {
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

  const siglos: number[] = [-2500, -2000, -1000, -500, 0, 500, 1000, 1500, 1700, 1900, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca desde el 3000 a.C. hasta la actualidad.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de las matemáticas"
        >
          {/* Eje horizontal */}
          <line
            x1={MARGEN_IZQ}
            y1={svgAlto - 16}
            x2={SVG_ANCHO - MARGEN_DER}
            y2={svgAlto - 16}
            stroke="var(--text-muted)"
            strokeWidth={1}
          />

          {/* Marcador del año 0 */}
          <line
            x1={anioAX(0)}
            y1={FILA_OFFSET_Y}
            x2={anioAX(0)}
            y2={svgAlto - 16}
            stroke="#888"
            strokeWidth={1}
            strokeDasharray="4,3"
          />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">
            año 0
          </text>

          {/* Marcadores de siglos */}
          {siglos.map((s) => (
            <g key={s}>
              <line
                x1={anioAX(s)}
                y1={FILA_OFFSET_Y}
                x2={anioAX(s)}
                y2={svgAlto - 16}
                stroke="var(--text-muted)"
                strokeWidth={0.5}
                strokeDasharray="3,4"
              />
              <text
                x={anioAX(s)}
                y={svgAlto - 4}
                fontSize={9}
                fill="var(--text-muted)"
                textAnchor="middle"
              >
                {formatAnio(s)}
              </text>
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
                <g
                  key={per.id}
                  onClick={() => setSeleccionado(esSeleccionado ? null : per)}
                  style={{ cursor: 'pointer' }}
                >
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
            <span
              className={styles.leyendaColor}
              style={{ background: COLORES_CATEGORIA[cat] }}
              aria-hidden="true"
            />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {/* Panel de detalle al hacer clic */}
      {seleccionado && <PanelDetalle periodo={seleccionado} />}
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
          <p>
            {formatAnio(periodo.anioInicio)} – {anioFinTexto}
          </p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">
              ?
            </span>
            <p>{periodo.preguntaCentral}</p>
          </div>

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
              <h4 className={styles.detalleSubtitulo}>Matemáticos clave</h4>
              <ul className={styles.artistasList}>
                {periodo.matematicos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra o teorema clave</span>
            <p>{periodo.teorema}</p>
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
        <span className={styles.navCounter}>
          {indice + 1} / {PERIODOS.length}
        </span>
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
      const coincideBusqueda =
        !termino ||
        per.nombre.toLowerCase().includes(termino) ||
        per.matematicos.some((m) => m.toLowerCase().includes(termino));
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
            style={
              categoriaFiltro === cat
                ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] }
                : {}
            }
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período o matemático..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período matemático"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Matemático clave</th>
              <th>Obra o teorema</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin === 9999 ? 'actualidad' : formatAnio(per.anioFin);
              return (
                <tr key={per.id} style={i % 2 === 0 ? { background: `${per.color}18` } : {}}>
                  <td>
                    <strong style={{ color: per.color }}>{per.nombre}</strong>
                  </td>
                  <td>
                    {formatAnio(per.anioInicio)}–{anioFinTexto}
                  </td>
                  <td>
                    <span
                      className={styles.badgeCategoria}
                      style={{
                        background: `${COLORES_CATEGORIA[per.categoria]}22`,
                        color: COLORES_CATEGORIA[per.categoria],
                      }}
                    >
                      {ETIQUETAS_CATEGORIA[per.categoria]}
                    </span>
                  </td>
                  <td>{per.matematicos[0]}</td>
                  <td className={styles.preguntaCell}>{per.teorema}</td>
                </tr>
              );
            })}
            {periodosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>
                  Sin resultados para la búsqueda actual.
                </td>
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
  { nombre: 'Matemáticas Antiguas', desde: -3000, hasta: 0, icono: '📜' },
  { nombre: 'Grecia y Helenismo', desde: -600, hasta: 500, icono: '🏛️' },
  { nombre: 'Matemáticas Medievales', desde: 500, hasta: 1400, icono: '✍️' },
  { nombre: 'Revolución Científica', desde: 1400, hasta: 1700, icono: '🔭' },
  { nombre: 'Análisis Moderno', desde: 1700, hasta: 1900, icono: '📊' },
  { nombre: 'Matemáticas Contemporáneas', desde: 1900, hasta: 9999, icono: '🧠' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos matemáticos y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) =>
              p.anioInicio < era.hasta && (p.anioFin === 9999 || p.anioFin > era.desde)
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio < era.hasta)
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">
                  {era.icono}
                </span>
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
                      style={{
                        background: `${p.color}1A`,
                        color: p.color,
                        borderColor: `${p.color}55`,
                      }}
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

export default function VisualizadorHistoriaMatematicas() {
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
        <h1 className={styles.heroTitle}>Historia de las Matemáticas</h1>
        <p className={styles.heroSubtitle}>
          De las tablillas babilónicas a la IA matemática — 14 períodos con los teoremas y
          matemáticos que transformaron el pensamiento humano
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
        title="Historia de las matemáticas: períodos y teoremas"
        subtitle="Cómo el pensamiento matemático ha evolucionado desde Babilonia hasta la inteligencia artificial"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos matemáticos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Categoría</th>
                <th>Matemático clave</th>
                <th>Concepto central</th>
                <th>Obra o teorema</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Matemáticas Griegas</strong></td>
                <td>600–100 a.C.</td>
                <td>Clásica</td>
                <td>Euclides</td>
                <td>Demostración axiomática</td>
                <td>Los Elementos</td>
              </tr>
              <tr>
                <td><strong>Cálculo Infinitesimal</strong></td>
                <td>1665–1700</td>
                <td>Moderna</td>
                <td>Newton / Leibniz</td>
                <td>Derivada e integral</td>
                <td>Cálculo (fluxiones)</td>
              </tr>
              <tr>
                <td><strong>Álgebra Abstracta</strong></td>
                <td>1830–1920</td>
                <td>Moderna</td>
                <td>Galois / Noether</td>
                <td>Grupos y estructuras</td>
                <td>Teoría de grupos (1832)</td>
              </tr>
              <tr>
                <td><strong>Lógica Matemática</strong></td>
                <td>1879–1931</td>
                <td>Contemporánea</td>
                <td>Gödel</td>
                <td>Incompletitud</td>
                <td>Teoremas de incompletitud</td>
              </tr>
              <tr>
                <td><strong>Topología</strong></td>
                <td>1736–presente</td>
                <td>Contemporánea</td>
                <td>Poincaré / Perelman</td>
                <td>Invariantes topológicos</td>
                <td>Conjetura de Poincaré (2003)</td>
              </tr>
              <tr>
                <td><strong>Matemáticas e IA</strong></td>
                <td>2000–presente</td>
                <td>Contemporánea</td>
                <td>Terence Tao / Wiles</td>
                <td>Demostración asistida por IA</td>
                <td>Último Teorema de Fermat (1994)</td>
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
              <p>Entiende por qué estudias lo que estudias: el álgebra que inventó Al-Juarismi, el cálculo que desarrolló Newton, la geometría analítica de Descartes. La historia da sentido a cada tema del temario.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
            <div>
              <strong>Lector de divulgación matemática</strong>
              <p>Has leído a Simon Singh, Marcus du Sautoy o Ian Stewart y quieres situar en la cronología los teoremas, las crisis y los personajes que estos autores narran. El visualizador te da el mapa completo.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
            <div>
              <strong>Programador curioso</strong>
              <p>Turing, Boole, Shannon, Dijkstra: los fundamentos de la computación son matemáticas. Este visualizador conecta el código que escribes con los teoremas de lógica, grafos y teoría de la información que lo hacen posible.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Curioso sobre las matemáticas puras</strong>
              <p>Siempre te preguntaste para qué sirve un teorema sin aplicación. Gödel, Ramanujan, Perelman: este visualizador muestra que las matemáticas puras son la exploración intelectual más ambiciosa de la humanidad.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Para qué sirve una matemática que no tiene aplicación práctica?</strong>
            <p>La historia de las matemáticas demuestra que las matemáticas "inútiles" de hoy son la tecnología de mañana. La teoría de números de Gauss era considerada el colmo de la abstracción inútil; hoy es la base de la criptografía que protege tus contraseñas y transacciones bancarias. La geometría no-euclidiana de Riemann fue una curiosidad abstracta durante 50 años; Einstein la usó para la relatividad general. El tiempo que tarda una matemática pura en volverse aplicada es impredecible, pero históricamente siempre ocurre.</p>
            <span className={styles.faqTip}>Consejo: la próxima vez que uses GPS, recuerda que funciona gracias a la relatividad de Einstein, que a su vez depende de la geometría riemanniana de 1854.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué son los Problemas del Milenio y cuántos quedan por resolver?</strong>
            <p>En el año 2000, el Instituto Clay ofreció 1 millón de dólares por resolver cada uno de 7 problemas matemáticos considerados los más difíciles del mundo: la Hipótesis de Riemann, P vs NP, las ecuaciones de Navier-Stokes, la conjetura de Birch y Swinnerton-Dyer, la conjetura de Hodge, las ecuaciones de Yang-Mills y la conjetura de Poincaré. Solo esta última ha sido resuelta, por Grigori Perelman en 2003 — que rechazó el millón de dólares y la Medalla Fields.</p>
            <span className={styles.faqTip}>P vs NP es el más famoso: si P=NP, casi todos los problemas de seguridad informática colapsarían. La mayoría de matemáticos cree que P≠NP, pero nadie lo ha demostrado.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué demostraron realmente los teoremas de incompletitud de Gödel?</strong>
            <p>En 1931, Gödel demostró dos resultados que sacudieron los cimientos de las matemáticas: primero, que en cualquier sistema formal suficientemente rico (que incluya aritmética), hay proposiciones verdaderas que no pueden demostrarse desde dentro del sistema. Segundo, que el sistema no puede demostrar su propia consistencia. Esto demolió el programa de David Hilbert de formalizar todas las matemáticas de forma completa y consistente. No significa que las matemáticas sean inútiles o arbitrarias: significa que ningún sistema axiomático finito puede capturar toda la verdad matemática.</p>
            <span className={styles.faqTip}>Gödel tenía 25 años cuando publicó estos teoremas. Muchos matemáticos tardaron años en aceptar lo que demostraban.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué los matemáticos dicen que la identidad e^iπ + 1 = 0 es "bella"?</strong>
            <p>La identidad de Euler conecta en una sola ecuación las cinco constantes más importantes de las matemáticas: e (base de los logaritmos naturales), i (unidad imaginaria), π (razón perímetro/diámetro), 1 (unidad multiplicativa) y 0 (unidad aditiva). Cada una viene de un campo completamente diferente: análisis, álgebra, geometría. Que una ecuación tan simple las unifique con total exactitud es lo que los matemáticos llaman "bello": economía máxima, profundidad máxima.</p>
            <span className={styles.faqTip}>En encuestas a matemáticos, esta ecuación ha sido elegrada repetidamente como "la más bella de las matemáticas" — por delante del teorema de Pitágoras o la fórmula cuadrática.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puede la inteligencia artificial hacer matemáticas de verdad?</strong>
            <p>En 2024, AlphaProof de DeepMind resolvió 4 de los 6 problemas de la Olimpiada Internacional de Matemáticas, incluyendo uno que los mejores matemáticos humanos tardaron horas en resolver. Sin embargo, hacer matemáticas "de verdad" —proponer conjeturas nuevas, identificar qué preguntas vale la pena hacer, construir teorías conceptualmente coherentes— sigue siendo terreno exclusivamente humano. Los sistemas de IA actuales son asistentes de demostración extraordinariamente potentes, pero no matemáticos en el sentido creativo del término.</p>
            <span className={styles.faqTip}>Terence Tao, el matemático vivo más influyente, dice que la IA ya le es útil para verificar pasos de demostraciones, pero que la intuición creativa sigue siendo humana.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo acercarse a un período de la historia de las matemáticas</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el problema que motivó el período</strong>
              <p>Las matemáticas no surgen en el vacío: responden a problemas concretos. El cálculo nació para describir el movimiento de los planetas. El álgebra abstracta, para entender por qué la ecuación de quinto grado no tiene solución general. Pregúntate: ¿qué pregunta estaba intentando responder este período?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Localiza el teorema o resultado central</strong>
              <p>Cada período tiene un resultado que lo define: Los Elementos de Euclides, el Teorema Fundamental del Cálculo, los teoremas de incompletitud de Gödel. Entender ese resultado central es entender el período. No hace falta seguir la demostración línea a línea — basta con entender qué afirma y por qué es sorprendente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Conoce al matemático protagonista</strong>
              <p>Detrás de cada período hay personas con historias extraordinarias: Galois muerto a los 20 años, Ramanujan autodidacta sin formación formal, Noether expulsada por ser mujer y judía. La historia humana de las matemáticas hace los conceptos más memorables y significativos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Traza las conexiones con los períodos anteriores y posteriores</strong>
              <p>Las matemáticas son un edificio acumulativo: cada período se apoya en el anterior y abre el camino al siguiente. Descartes necesitó a Euclides; Newton necesitó a Descartes; Cauchy necesitó a Newton. Ver estas conexiones convierte la historia de las matemáticas en una narrativa coherente, no en una colección de datos aislados.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Busca una aplicación actual del concepto</strong>
              <p>Casi todos los conceptos matemáticos históricos tienen aplicaciones tecnológicas actuales: la geometría euclidiana en CAD, el cálculo en simulación física, la teoría de grupos en criptografía, la probabilidad en machine learning. Ver la aplicación concreta ayuda a consolidar la comprensión abstracta.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Consejos para apreciar las matemáticas históricas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>Las matemáticas no se "descubren" ni se "inventan" — los matemáticos debaten esto desde siempre. Pero sí son acumulativas: una vez que Euclides demostró algo, nadie necesita volver a demostrarlo. Esto las hace únicas entre las disciplinas humanas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>La notación importa más de lo que parece. Los números romanos hacían casi imposible la multiplicación larga. Los números indo-arábigos y el cero babilónico desataron siglos de desarrollo algebraico. Una buena notación puede hacer visible lo que antes era invisible.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Los "errores" de la historia matemática son tan informativos como los éxitos. La crisis de los irracionales en la Grecia antigua, la paradoja de Russell, la disputa Newton-Leibniz: estas rupturas revelan los supuestos implícitos que cada época daba por obvios.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Las matemáticas contemporáneas son más activas que nunca: se publican más artículos matemáticos hoy que en toda la historia anterior combinada. La idea de que "todo está descubierto" es completamente errónea — hay más matemáticas abiertas que cerradas.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar historia de las matemáticas</strong>
          <ul>
            <li>
              Creer que las matemáticas <strong>empezaron con los griegos</strong>: los babilonios y egipcios tenían sistemas matemáticos sofisticados 2000 años antes de Pitágoras. Los griegos inventaron la demostración formal, no las matemáticas.
            </li>
            <li>
              Confundir a <strong>Al-Juarismi con el álgebra elemental</strong> de secundaria: Al-Juarismi fundó el álgebra como disciplina que resuelve ecuaciones sistemáticamente, no como la manipulación de letras que aprendiste en la ESO. Su obra era conceptualmente revolucionaria para su época.
            </li>
            <li>
              Asumir que <strong>Newton y Leibniz son lo mismo</strong>: ambos inventaron el cálculo de forma independiente, pero con enfoques filosóficos distintos. Leibniz usó la notación dy/dx que usamos hoy; Newton usó la notación de punto sobre la variable. La disputa de prioridad dañó las matemáticas británicas durante un siglo.
            </li>
            <li>
              Pensar que los <strong>teoremas de Gödel invalidan las matemáticas</strong>: demuestran que ningún sistema formal captura toda la verdad matemática, pero no que las matemáticas sean arbitrarias o inútiles. Las matemáticas que usamos en física, ingeniería y computación no se ven afectadas en la práctica por los teoremas de incompletitud.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-matematicas')} />
      <ShareCard appName="visualizador-historia-matematicas" />
      <Footer appName="visualizador-historia-matematicas" />
    </div>
  );
}
