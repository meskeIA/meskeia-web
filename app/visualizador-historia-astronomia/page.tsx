'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaAstronomia.module.css';
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

interface PeriodoAstronomia {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  astronomos: string[];
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

const PERIODOS: PeriodoAstronomia[] = [
  {
    id: 'prehistorica', nombre: 'Astronomía Prehistórica', anioInicio: -3000, anioFin: -800,
    categoria: 'antigua',
    astronomos: ['Constructores de Stonehenge', 'Astrónomos mayas proto-clásicos', 'Sacerdotes caldeos'],
    conceptos: ['Observación de solsticios y equinoccios', 'Calendarios lunares', 'Orientación astronómica de monumentos', 'Predicción de eclipses', 'Constelaciones como mapas del cielo'],
    descubrimiento: 'Stonehenge (c. 2500 a.C.) — alineado al solsticio de verano con precisión de minutos',
    preguntaCentral: '¿Cómo usan el cielo las primeras civilizaciones para organizar el tiempo y la vida?',
    contexto: 'Antes de la escritura, los humanos cartografiaron el cielo. Stonehenge está alineado al amanecer del solsticio de verano. Los caldeos babilónicos predecían eclipses con series numéricas. Los mayas calcularon el año venusiano con error de 14 segundos. La astronomía nació como necesidad agrícola y religiosa.',
    color: '#8B4513',
  },
  {
    id: 'mesopotamia', nombre: 'Astronomía Mesopotámica', anioInicio: -800, anioFin: -200,
    categoria: 'antigua',
    astronomos: ['Astrónomos de Babilonia', 'Kidinnu', 'Nabu-rimanni'],
    conceptos: ['Tablas de predicción planetaria (efeméridas)', 'Ciclo de Saros (predicción de eclipses)', 'Zodíaco de 12 signos', 'Mes sinódico de la Luna', 'Sistema numérico sexagesimal aplicado al cosmos'],
    descubrimiento: 'Babilonios calculan el ciclo de Saros (18,6 años) para predecir eclipses con gran precisión',
    preguntaCentral: '¿Pueden los movimientos planetarios calcularse matemáticamente y predecirse?',
    contexto: 'Los astrónomos babilónicos crearon las primeras efeméridas (tablas predictivas) de la historia. El ciclo de Saros permitía predecir eclipses. El zodíaco de 12 signos que hoy usamos en astrología nació aquí, como división matemática de la eclíptica.',
    color: '#CD853F',
  },
  {
    id: 'griega', nombre: 'Astronomía Griega', anioInicio: -600, anioFin: 100,
    categoria: 'clasica',
    astronomos: ['Tales de Mileto', 'Aristarco de Samos', 'Eratóstenes', 'Hiparco', 'Claudio Ptolomeo'],
    conceptos: ['Heliocentrismo (Aristarco)', 'Geocentrismo ptolemaico (epiciclos)', 'Medición de distancia Tierra-Luna (Hiparco)', 'Catálogo de 850 estrellas (Hiparco)', 'Almagesto — la biblia astronómica'],
    descubrimiento: 'Aristarco propone el heliocentrismo (c. 270 a.C.) — 1800 años antes de Copérnico',
    preguntaCentral: '¿La Tierra o el Sol está en el centro del universo?',
    contexto: 'Aristarco de Samos propuso el heliocentrismo 18 siglos antes que Copérnico — fue ignorado. Ptolomeo sistematizó el geocentrismo en el Almagesto con epiciclos que predecían los planetas con precisión aceptable. Eratóstenes midió la circunferencia terrestre con sombras y una estaca.',
    color: '#DAA520',
  },
  {
    id: 'islamica', nombre: 'Astronomía Islámica', anioInicio: 750, anioFin: 1400,
    categoria: 'medieval',
    astronomos: ['Al-Battani', 'Al-Biruni', 'Ibn Yunus', 'Nasir al-Din al-Tusi', 'Al-Zarqali'],
    conceptos: ['Corrección de Ptolomeo', 'Precisión en la oblicuidad de la eclíptica', 'Tablas astronómicas de Toledo', 'Astrolabio mejorado', 'Modelos planetarios no ptolemaicos'],
    descubrimiento: 'Al-Battani corrige el Almagesto de Ptolomeo con siglos de nuevas observaciones — astronomía como ciencia acumulativa',
    preguntaCentral: '¿Son suficientemente exactas las predicciones ptolemaicas o necesitan corrección?',
    contexto: 'Los astrónomos islámicos preservaron y mejoraron la astronomía griega. Al-Battani (Albategnius) calculó la longitud del año solar con error de 2 minutos. Las Tablas de Toledo de Al-Zarqali fueron el estándar europeo durante siglos. Al-Tusi propuso modelos planetarios que influyeron en Copérnico.',
    color: '#2E8B57',
  },
  {
    id: 'medieval_europea', nombre: 'Astronomía Medieval Europea', anioInicio: 1200, anioFin: 1543,
    categoria: 'medieval',
    astronomos: ['Alfonso X el Sabio', 'Johannes Müller (Regiomontano)', 'Nicolas de Oresme', 'Georg von Peuerbach'],
    conceptos: ['Tablas alfonsíes', 'Trigonometría esférica aplicada', 'Crítica al geocentrismo', 'Primer libro de astronomía impreso', 'Universidad como centro de saber astronómico'],
    descubrimiento: 'Alfonso X financia las Tablas Alfonsíes (1252–1270) — el estándar europeo de efeméridas durante 200 años',
    preguntaCentral: '¿Puede la astronomía árabe integrarse con la tradición latina universitaria?',
    contexto: 'Alfonso X el Sabio organizó la traducción y actualización de tablas astronómicas en Toledo. Regiomontano publicó el primer libro de astronomía en Europa (1471). La imprenta fue tan revolucionaria para la astronomía como el telescopio: los catálogos estelares pudieron difundirse.',
    color: '#8B008B',
  },
  {
    id: 'revolucion', nombre: 'Revolución Copernicana', anioInicio: 1543, anioFin: 1610,
    categoria: 'moderna',
    astronomos: ['Nicolás Copérnico', 'Tycho Brahe', 'Michael Maestlin'],
    conceptos: ['Heliocentrismo moderno', 'La Tierra gira alrededor del Sol', 'Observaciones de Tycho sin telescopio', 'Sistema mixto de Tycho (geo-heliocéntrico)', 'De revolutionibus orbium coelestium'],
    descubrimiento: 'Copérnico publica De revolutionibus (1543, en su lecho de muerte) — la Tierra orbita el Sol',
    preguntaCentral: '¿Es el Sol el centro y la Tierra un planeta más?',
    contexto: 'Copérnico dedicó 30 años a desarrollar el heliocentrismo y lo publicó en su lecho de muerte. Tycho Brahe realizó las observaciones más precisas del cielo pretelescópico durante 20 años en su isla-observatorio Uraniborg. Murió sin aceptar el heliocentrismo, pero sus datos permitieron a Kepler descubrir las órbitas elípticas.',
    color: '#4169E1',
  },
  {
    id: 'kepler_galileo', nombre: 'Kepler y Galileo', anioInicio: 1609, anioFin: 1650,
    categoria: 'moderna',
    astronomos: ['Johannes Kepler', 'Galileo Galilei'],
    conceptos: ['Tres leyes de Kepler (órbitas elípticas)', 'Telescopio astronómico', 'Lunas de Júpiter', 'Montañas en la Luna', 'Fases de Venus (prueba del heliocentrismo)'],
    descubrimiento: 'Galileo apunta el telescopio al cielo (1609) — descubre lunas de Júpiter, fases de Venus, manchas solares',
    preguntaCentral: '¿Qué forma tienen las órbitas planetarias y qué revela el telescopio?',
    contexto: 'Kepler usó los datos de Tycho para descubrir que las órbitas son elipses, no círculos — derrumbando 2000 años de geometría circular perfecta. Galileo usó el telescopio y vio que la Luna tiene montañas, Júpiter tiene lunas, Venus tiene fases. Su apoyo al heliocentrismo le costó el arresto domiciliario.',
    color: '#FF6347',
  },
  {
    id: 'newton_telescopio', nombre: 'Astronomía Newtoniana', anioInicio: 1668, anioFin: 1800,
    categoria: 'moderna',
    astronomos: ['Isaac Newton', 'Edmond Halley', 'James Bradley', 'William Herschel'],
    conceptos: ['Telescopio reflector (Newton)', 'Cometa de Halley — predicción orbital', 'Aberración de la luz (prueba del movimiento terrestre)', 'Urano — primer planeta descubierto con telescopio', 'Catálogo de nebulosas (Herschel)'],
    descubrimiento: 'Halley predice el regreso del cometa de 1682 para 1758 — se cumple 16 años después de su muerte',
    preguntaCentral: '¿La gravitación de Newton puede predecir el movimiento de cometas y planetas desconocidos?',
    contexto: 'Newton diseñó el telescopio reflector (1668) para evitar la aberración cromática. Halley usó la gravitación newtoniana para calcular que el cometa de 1682 había aparecido en 1531 y 1607 — y volvería en 1758. Herschel descubrió Urano en 1781 y catalogó 2500 nebulosas con su hermana Caroline.',
    color: '#1E90FF',
  },
  {
    id: 'espectroscopia', nombre: 'Espectroscopía y Astrofísica', anioInicio: 1814, anioFin: 1920,
    categoria: 'moderna',
    astronomos: ['Joseph von Fraunhofer', 'Angelo Secchi', 'Annie Jump Cannon', 'Williamina Fleming', 'Henrietta Swan Leavitt'],
    conceptos: ['Líneas espectrales de Fraunhofer', 'Clasificación espectral de estrellas (OBAFGKM)', 'Cefeidas como velas estándar de distancia', 'Composición química del Sol', 'Velocidad radial por efecto Doppler'],
    descubrimiento: 'Leavitt descubre la relación período-luminosidad de las cefeidas (1912) — la regla de medir el universo',
    preguntaCentral: '¿De qué están hechas las estrellas y cómo medimos la distancia a objetos lejanos?',
    contexto: 'Fraunhofer descubrió las líneas oscuras del espectro solar — huellas de elementos químicos. Las "computers" de Harvard (mujeres astrónomas sin crédito) clasificaron 400.000 estrellas. Leavitt descubrió que las cefeidas tienen periodicidad predecible: se convirtieron en la regla con que medir el universo.',
    color: '#9932CC',
  },
  {
    id: 'relatividad_cosmica', nombre: 'Relatividad y Estructura del Universo', anioInicio: 1915, anioFin: 1930,
    categoria: 'contemporanea',
    astronomos: ['Albert Einstein', 'Karl Schwarzschild', 'Edwin Hubble', 'Georges Lemaître', 'Vesto Slipher'],
    conceptos: ['Relatividad General aplicada al cosmos', 'Agujeros negros (Schwarzschild)', 'Galaxias externas a la Vía Láctea', 'Ley de Hubble (universo en expansión)', 'Big Bang (átomo primitivo de Lemaître)'],
    descubrimiento: 'Hubble demuestra (1924) que las nebulosas espirales son galaxias fuera de la Vía Láctea — el universo es inconmensurablemente grande',
    preguntaCentral: '¿El universo es estático o se expande? ¿Tuvo un origen?',
    contexto: 'Einstein propuso en 1917 un universo estático, añadiendo la constante cosmológica. Hubble demostró en 1924 que Andrómeda estaba fuera de nuestra galaxia — el universo era 100.000 veces mayor. Lemaître (1927) propuso el "átomo primitivo" — el Big Bang. Einstein lo llamó "el más bello y satisfactorio de los descubrimientos".',
    color: '#191970',
  },
  {
    id: 'era_espacial', nombre: 'Era Espacial', anioInicio: 1957, anioFin: 1990,
    categoria: 'contemporanea',
    astronomos: ['Vera Rubin', 'Yuri Gagarin', 'Neil Armstrong', 'Carl Sagan', 'Jocelyn Bell'],
    conceptos: ['Sputnik — primera nave orbital', 'Apollo 11 — Luna', 'Pulsares (Bell, 1967)', 'Materia oscura (Rubin)', 'Voyager — exploración del sistema solar'],
    descubrimiento: 'Vera Rubin demuestra (1970) que las galaxias rotan demasiado rápido — debe existir materia oscura',
    preguntaCentral: '¿Podemos explorar el sistema solar directamente y qué hay de invisible en el universo?',
    contexto: 'El Sputnik (1957) inició la era espacial; el Apollo 11 llevó humanos a la Luna (1969). Jocelyn Bell descubrió los pulsares (1967) y no recibió el Nobel. Rubin demostró que las galaxias contienen más masa invisible (oscura) que visible — el 27% del universo. Voyager llegó al espacio interestelar en 2012.',
    color: '#006400',
  },
  {
    id: 'cosmologia', nombre: 'Cosmología Moderna', anioInicio: 1965, anioFin: 9999,
    categoria: 'contemporanea',
    astronomos: ['Arno Penzias', 'Robert Wilson', 'Alan Guth', 'Saul Perlmutter', 'Brian Schmidt'],
    conceptos: ['Fondo cósmico de microondas (prueba del Big Bang)', 'Inflación cósmica (Guth)', 'Expansión acelerada del universo', 'Energía oscura (68% del universo)', 'Modelo Lambda-CDM'],
    descubrimiento: 'Penzias y Wilson descubren el fondo de microondas (1965) — el eco del Big Bang, Premio Nobel 1978',
    preguntaCentral: '¿Cómo comenzó el universo, cuál es su geometría y cuál será su destino?',
    contexto: 'El fondo cósmico de microondas (CMB), descubierto accidentalmente por Penzias y Wilson en 1965, confirmó el Big Bang. Guth propuso la inflación (1981) para explicar la uniformidad del CMB. En 1998, dos equipos independientes descubrieron que la expansión del universo se acelera — energía oscura, Premio Nobel 2011.',
    color: '#4B0082',
  },
  {
    id: 'grandes_telescopios', nombre: 'Astronomía de Altas Energías y Grandes Telescopios', anioInicio: 1990, anioFin: 9999,
    categoria: 'contemporanea',
    astronomos: ['Riccardo Giacconi', 'Andrea Ghez', 'Reinhard Genzel', 'Event Horizon Telescope Collaboration'],
    conceptos: ['Telescopio Hubble (HST)', 'Rayos X astronómicos (Chandra)', 'Agujero negro supermasivo Sgr A*', 'Primera imagen de un agujero negro (M87*)', 'Interferometría de muy larga base (VLBI)'],
    descubrimiento: 'Event Horizon Telescope captura la primera imagen de un agujero negro (M87*, 2019) — confirmando la Relatividad General',
    preguntaCentral: '¿Cómo observar objetos invisibles, extremos y a distancias cosmológicas?',
    contexto: 'El Hubble Space Telescope (1990) revolucionó la astronomía con imágenes desde fuera de la atmósfera. Ghez y Genzel (Nobel 2020) demostraron que el centro de la Vía Láctea tiene un agujero negro supermasivo de 4 millones de soles. El EHT fotografió por primera vez la sombra de un agujero negro en 2019.',
    color: '#C71585',
  },
  {
    id: 'james_webb', nombre: 'James Webb y Astronomía del Siglo XXI', anioInicio: 2021, anioFin: 9999,
    categoria: 'contemporanea',
    astronomos: ['Equipo JWST', 'Equipo LIGO', 'Equipo CHEOPS', 'Franck Marchis'],
    conceptos: ['JWST — infrarrojos del universo primitivo', 'Ondas gravitacionales (LIGO, 2015)', 'Astronomía multimensajero', 'Exoplanetas habitables (TRAPPIST-1)', 'Búsqueda de biofirmas extraterrestres'],
    descubrimiento: 'LIGO detecta ondas gravitacionales (2015) — abre una nueva ventana al universo; JWST ve galaxias a 13.000 millones de años luz (2022)',
    preguntaCentral: '¿Hay vida en otros planetas y cómo fue el universo en sus primeros momentos?',
    contexto: 'LIGO detectó en 2015 las ondas gravitacionales predichas por Einstein un siglo antes — una nueva forma de "escuchar" el universo. El JWST (2022) ve galaxias formadas 300 millones de años tras el Big Bang. La astronomía del siglo XXI busca biofirmas en exoplanetas: el mayor proyecto de exploración de la historia.',
    color: '#2E86AB',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -3000, evento: 'Stonehenge — primera estructura conocida orientada astronómicamente' },
  { anio: -240, evento: 'Eratóstenes mide la circunferencia de la Tierra usando sombras y geometría' },
  { anio: 1543, evento: 'Copérnico publica el heliocentrismo — la Tierra deja de ser el centro del cosmos' },
  { anio: 1609, evento: 'Galileo apunta el telescopio al cielo — descubre lunas de Júpiter y montañas en la Luna' },
  { anio: 1687, evento: 'Newton explica la gravitación — los planetas obedecen las mismas leyes que la manzana' },
  { anio: 1925, evento: 'Hubble demuestra que Andrómeda es una galaxia externa — el universo es inmenso' },
  { anio: 1965, evento: 'Penzias y Wilson descubren el fondo de microondas — el eco del Big Bang' },
  { anio: 2019, evento: 'Primera imagen de un agujero negro (M87*) — confirmación visual de la Relatividad General' },
  { anio: 2022, evento: 'JWST envía primeras imágenes — galaxias de hace 13.000 millones de años' },
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
  medieval: '#8B008B',
  moderna: '#1E90FF',
  contemporanea: '#4B0082',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoAstronomia }) {
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
          <h4 className={styles.detalleSubtitulo}>Astrónomos clave</h4>
          <ul className={styles.artistasList}>
            {periodo.astronomos.map((a) => (
              <li key={a}>{a}</li>
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
  const [seleccionado, setSeleccionado] = useState<PeriodoAstronomia | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoAstronomia[][] = [[], [], [], []];
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
  const siglos: number[] = [-2500, -2000, -1000, -500, 0, 500, 1000, 1400, 1600, 1800, 1900, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el 3000 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la astronomía"
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
              <h4 className={styles.detalleSubtitulo}>Astrónomos clave</h4>
              <ul className={styles.artistasList}>
                {periodo.astronomos.map((a) => <li key={a}>{a}</li>)}
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
        per.astronomos.some((a) => a.toLowerCase().includes(termino));
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
        placeholder="Buscar por período o astrónomo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período astronómico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Astrónomo clave</th>
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
                  <td>{per.astronomos[0]}</td>
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
  { nombre: 'Astronomía Antigua', desde: -3000, hasta: -400, icono: '🌙' },
  { nombre: 'Modelos Geocéntricos', desde: -400, hasta: 1543, icono: '🌍' },
  { nombre: 'Revolución Copernicana', desde: 1543, hasta: 1700, icono: '🌞' },
  { nombre: 'Astronomía Telescópica', desde: 1700, hasta: 1900, icono: '🔭' },
  { nombre: 'Astrofísica Moderna', desde: 1900, hasta: 1960, icono: '⭐' },
  { nombre: 'Cosmología y Era Espacial', desde: 1960, hasta: 9999, icono: '🚀' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos astronómicos y eventos históricos organizados por eras.
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

export default function VisualizadorHistoriaAstronomia() {
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
        <h1 className={styles.heroTitle}>Historia de la Astronomía 🔭</h1>
        <p className={styles.heroSubtitle}>
          De Stonehenge al Telescopio James Webb — 14 períodos con los descubrimientos que revelaron el cosmos
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
        title="Historia de la astronomía: períodos y descubrimientos"
        subtitle="Cómo los grandes hitos astronómicos transformaron nuestra comprensión del cosmos"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos clave de la astronomía</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Fechas</th>
                <th>Categoría</th>
                <th>Astrónomo clave</th>
                <th>Concepto central</th>
                <th>Descubrimiento</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Astronomía Griega</strong></td>
                <td>600 a.C.–100 d.C.</td>
                <td>Clásica</td>
                <td>Aristarco de Samos</td>
                <td>Heliocentrismo (ignorado 18 siglos)</td>
                <td>Almagesto de Ptolomeo</td>
              </tr>
              <tr>
                <td><strong>Revolución Copernicana</strong></td>
                <td>1543–1610</td>
                <td>Moderna</td>
                <td>Nicolás Copérnico</td>
                <td>La Tierra orbita el Sol</td>
                <td>De revolutionibus</td>
              </tr>
              <tr>
                <td><strong>Kepler y Galileo</strong></td>
                <td>1609–1650</td>
                <td>Moderna</td>
                <td>Galileo Galilei</td>
                <td>Órbitas elípticas + telescopio</td>
                <td>Lunas de Júpiter</td>
              </tr>
              <tr>
                <td><strong>Espectroscopía</strong></td>
                <td>1814–1920</td>
                <td>Moderna</td>
                <td>Henrietta Leavitt</td>
                <td>Cefeidas como regla del universo</td>
                <td>Clasificación espectral OBAFGKM</td>
              </tr>
              <tr>
                <td><strong>Cosmología Moderna</strong></td>
                <td>1965–presente</td>
                <td>Contemporánea</td>
                <td>Penzias y Wilson</td>
                <td>Fondo de microondas = eco del Big Bang</td>
                <td>Energía oscura (expansión acelerada)</td>
              </tr>
              <tr>
                <td><strong>James Webb y siglo XXI</strong></td>
                <td>2021–presente</td>
                <td>Contemporánea</td>
                <td>Equipo JWST</td>
                <td>Infrarrojos del universo primitivo</td>
                <td>Ondas gravitacionales (LIGO, 2015)</td>
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
              <p>Obtén contexto completo para el tema de astronomía y universo en Física de 2.º de Bachillerato, con la cronología de descubrimientos que explica cómo llegamos al modelo cosmológico actual.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔭</span>
            <div>
              <strong>Aficionado a la astronomía</strong>
              <p>Descubre la historia de lo que observas con tu telescopio: quién descubrió Urano, cómo Halley predijo el regreso del cometa, y por qué el telescopio reflector de Newton fue un avance decisivo.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📺</span>
            <div>
              <strong>Fan de la divulgación científica</strong>
              <p>Si disfrutas con Cosmos de Carl Sagan, las charlas de Neil deGrasse Tyson o los documentales de Brian Cox, este visualizador te da el mapa histórico que conecta todos esos descubrimientos.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Curioso sobre la carrera espacial</strong>
              <p>Explora cómo el Sputnik, el Apollo 11 y el James Webb son parte de un continuo que va desde Stonehenge hasta la búsqueda de biofirmas en exoplanetas del siglo XXI.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué tardó tanto la humanidad en aceptar el heliocentrismo?</strong>
            <p>Aristarco propuso el heliocentrismo en el 270 a.C., pero fue rechazado por razones filosóficas, religiosas y prácticas: el modelo geocéntrico de Ptolomeo funcionaba suficientemente bien para navegar y fijar calendarios. Copérnico tardó 30 años en publicarlo. Galileo fue condenado por defenderlo. El heliocentrismo no se impuso por ser más "obvio", sino porque finalmente predecía los fenómenos con más precisión y con menos correcciones ad hoc (epiciclos).</p>
            <span className={styles.faqTip}>Dato curioso: el propio Copérnico usó epiciclos en su modelo heliocéntrico — fue Kepler quien los eliminó con las órbitas elípticas.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es exactamente la materia oscura y por qué no podemos verla?</strong>
            <p>La materia oscura es masa que no emite, absorbe ni refleja luz electromagnetic — por eso no podemos verla directamente. Vera Rubin la detectó indirectamente en los años 70 al medir que las galaxias rotan demasiado rápido para la masa visible que contienen. Sin materia oscura extra, las galaxias se desintegrarían. Hoy sabemos que compone el 27% del universo, pero desconocemos su naturaleza exacta: podría ser WIMPs, axiones, o algo completamente desconocido.</p>
            <span className={styles.faqTip}>La energía oscura (68% del universo) es diferente: es lo que causa la expansión acelerada del universo — aún más misteriosa que la materia oscura.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo sabemos la edad del universo?</strong>
            <p>La edad del universo (13.800 millones de años) se calcula a partir de tres métodos independientes: la ley de Hubble (velocidad de expansión del universo), la temperatura del fondo cósmico de microondas (el eco del Big Bang medido con precisión milimétrica por los satélites COBE, WMAP y Planck), y las estrellas más antiguas conocidas (que deben ser más jóvenes que el universo). Los tres métodos convergen en torno a 13,8 Ga, con incertidumbre menor al 1%.</p>
            <span className={styles.faqTip}>La tensión de Hubble: los dos métodos principales dan valores ligeramente distintos para la constante de Hubble — uno de los misterios abiertos más activos de la cosmología actual.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué ve el Telescopio James Webb que no podía ver el Hubble?</strong>
            <p>El JWST observa en infrarrojo, lo que le permite ver galaxias formadas 300-500 millones de años después del Big Bang — luz tan desplazada hacia el rojo (corrimiento cosmológico) que el Hubble, que observa principalmente en visible y UV, no puede detectar. Además, el espejo del JWST es 6,25 veces mayor en superficie, lo que le da 6 veces más sensibilidad. Puede analizar la atmósfera de exoplanetas buscando biofirmas: agua, metano, CO2.</p>
            <span className={styles.faqTip}>El JWST orbita el punto L2 Sol-Tierra, a 1,5 millones de km de la Tierra — demasiado lejos para reparaciones como las que se hicieron al Hubble.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Existe vida extraterrestre y qué dice la ciencia al respecto?</strong>
            <p>La ciencia no ha encontrado evidencia de vida extraterrestre, pero los datos recientes son provocadores: el JWST ya detectó moléculas orgánicas complejas en discos protoplanetarios, y TRAPPIST-1 tiene 3 planetas en zona habitable a 40 años luz. La paradoja de Fermi sigue sin resolverse: si el universo tiene 400.000 millones de galaxias, cada una con cientos de miles de millones de estrellas, ¿dónde están todos? Las hipótesis van desde la rareza de la vida inteligente hasta civilizaciones que deliberadamente no se manifiestan.</p>
            <span className={styles.faqTip}>El proyecto SETI lleva 60 años escuchando señales de radio del espacio sin detectar nada concluyente — aunque el espacio explorado es una fracción infinitesimal de la galaxia.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo estudiar un período de la historia de la astronomía</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el instrumento o tecnología que lo hizo posible</strong>
              <p>Cada período astronómico está ligado a una herramienta: el ojo desnudo (Stonehenge, babilonios), el cálculo matemático (Aristarco, Ptolomeo), el telescopio (Galileo, Newton), la espectroscopía (Fraunhofer, Cannon), los satélites (Hubble, JWST). La astronomía avanza en saltos tecnológicos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprende el modelo del universo vigente antes del descubrimiento</strong>
              <p>Los descubrimientos astronómicos son revoluciones de paradigma. Para entender por qué importó que Hubble demostrara que Andrómeda es una galaxia, necesitas saber que antes se creía que la Vía Láctea era todo el universo. El contraste entre el antes y el después es lo que da dimensión al hallazgo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Aprende quién hizo el descubrimiento y en qué contexto social</strong>
              <p>La astronomía tiene una historia de invisibilización: Jocelyn Bell descubrió los pulsares y no recibió el Nobel; las "computers" de Harvard clasificaron 400.000 estrellas sin crédito; Vera Rubin esperó décadas para que su trabajo sobre materia oscura fuera reconocido. La historia de la ciencia incluye también sus sesgos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta el descubrimiento con sus consecuencias filosóficas</strong>
              <p>La astronomía es la ciencia que más ha sacudido el ego humano: la Tierra no es el centro, el Sol es una estrella mediocre, la Vía Láctea es una de 400.000 millones de galaxias, y el universo tiene 13.800 millones de años. Cada período astronómico reubica nuestra posición en el cosmos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Busca el misterio abierto que deja el período</strong>
              <p>Ningún período astronómico cierra todas las preguntas — siempre abre nuevas. Newton explicó la gravedad pero no su causa. Einstein explicó la gravedad como geometría pero no la reconcilió con la mecánica cuántica. El JWST resuelve preguntas sobre el universo primitivo y abre la pregunta de las biofirmas. Estudiar el misterio pendiente te da la dirección de la ciencia siguiente.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para entender la astronomía histórica</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>La astronomía es la más antigua de las ciencias y la que más ha cambiado nuestra visión de nosotros mismos. Estudiarla cronológicamente revela cómo las ideas cambian cuando cambian los instrumentos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>Los períodos se solapan: Newton publicó sus Principia en 1687 mientras Herschel aún no había nacido. La astronomía no es una cadena de relevos, sino una conversación continua donde varios proyectos coexisten.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Aprende primero los grandes saltos: heliocentrismo (Copérnico), telescopio (Galileo), gravitación (Newton), expansión del universo (Hubble), Big Bang (Lemaître/Penzias). El resto son elaboraciones de esos pilares.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Usa la cronología para entender qué datos tenía disponibles cada astrónomo. Copérnico no sabía que las órbitas eran elípticas; Einstein no sabía que la expansión era acelerada. El contexto histórico explica las limitaciones de cada modelo.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar historia de la astronomía</strong>
          <ul>
            <li>Confundir <strong>astrología</strong> con <strong>astronomía</strong>: la astrología es una práctica cultural sin base científica; la astronomía es la ciencia que estudia los cuerpos celestes. El zodíaco babilónico es un artefacto matemático de división de la eclíptica, no una descripción de influencias sobre la personalidad.</li>
            <li>Creer que <strong>Galileo inventó el telescopio</strong>: Galileo lo mejoró y fue el primero en apuntarlo sistemáticamente al cielo, pero el instrumento fue inventado por Hans Lippershey en los Países Bajos en 1608. Galileo construyó su propio telescopio con 20x de aumento al año siguiente.</li>
            <li>Pensar que el <strong>Big Bang fue una explosión en el espacio vacío</strong>: el Big Bang fue la expansión del espacio mismo desde un estado de densidad y temperatura extremas. No ocurrió en un punto del espacio preexistente — el espacio se creó con el Big Bang. No tiene sentido preguntar "¿dónde ocurrió?" o "¿qué había antes?".</li>
            <li>Asumir que <strong>Copérnico resolvió el problema del movimiento planetario</strong>: el modelo heliocéntrico de Copérnico seguía usando círculos perfectos y epiciclos. Fue Kepler quien, 60 años después, descubrió que las órbitas son elipses y eliminó los epiciclos — haciendo el modelo heliocéntrico más simple y preciso que el ptolemaico.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-astronomia')} />
      <ShareCard appName="visualizador-historia-astronomia" />
      <Footer appName="visualizador-historia-astronomia" />
    </div>
  );
}
