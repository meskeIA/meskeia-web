'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaDanza.module.css';
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

type Categoria = 'ritual' | 'clasica' | 'folclore' | 'ballet' | 'moderna' | 'social' | 'contemporanea' | 'urbana' | 'digital';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoDanza {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  estilo: string;
  descripcion: string;
  personas: string[];
  categoria: Categoria;
}

interface EventoHistorico {
  anio: number;
  descripcion: string;
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

const PERIODOS: PeriodoDanza[] = [
  { id: 1, nombre: "Danza Ritual Antigua", anioInicio: -3000, anioFin: -500, color: "#8D6E63", estilo: "Ritual y ceremonial", descripcion: "Las pinturas rupestres y los relieves egipcios muestran danzas rituales ligadas a la cosecha, la guerra y la religión. En Mesopotamia, sacerdotisas danzan en los templos de Inanna.", personas: ["Sacerdotisas de Inanna"], categoria: "ritual" },
  { id: 2, nombre: "Danza Griega y Romana", anioInicio: -700, anioFin: 400, color: "#795548", estilo: "Coros dramáticos y pantomima", descripcion: "Los coros de tragedia y comedia integran danza, música y texto en los festivales de Dioniso. Los romanos adoptan la pantomima: un bailarín solo narra toda una historia con gestos.", personas: ["Pylades", "Bathyllus"], categoria: "clasica" },
  { id: 3, nombre: "Danzas Medievales y Folklóricas", anioInicio: 400, anioFin: 1400, color: "#FF8F00", estilo: "Danza popular y carole", descripcion: "La Iglesia condena la danza pagana pero no puede erradicarla. Emergen las caroles en cadena, las danzas de mayo y la macabra danza de la muerte como respuesta a las epidemias de peste.", personas: ["Hildegarda de Bingen"], categoria: "folclore" },
  { id: 4, nombre: "Ballet de Corte", anioInicio: 1489, anioFin: 1650, color: "#FFCA28", estilo: "Espectáculo cortesano con música y verso", descripcion: "Los intermedios florentinos mezclan danza, música y poesía. El Ballet Comique de la Reine (1581) es considerado el primer ballet. Las cortes europeas adoptan la danza como política.", personas: ["Balthasar de Beaujoyeulx", "Catalina de Médici"], categoria: "ballet" },
  { id: 5, nombre: "Ballet Clásico Académico", anioInicio: 1661, anioFin: 1820, color: "#FFA726", estilo: "Técnica codificada en cinco posiciones", descripcion: "Luis XIV funda la Académie Royale de Danse (1661) y codifica el ballet. Noverre publica las Cartas sobre la danza (1760). La técnica de puntas, el tutú y la narrativa conforman el ballet académico.", personas: ["Jean-Baptiste Lully", "Jean-Georges Noverre", "Marie Camargo"], categoria: "ballet" },
  { id: 6, nombre: "Ballet Romántico", anioInicio: 1820, anioFin: 1870, color: "#66BB6A", estilo: "Sílfides, puntas y mundos feéricos", descripcion: "La Sylphide (1832) y Giselle (1841) definen el ballet romántico: bailarinas en puntas, tutús blancos y mundos sobrenaturales. Marie Taglioni se convierte en la primera estrella internacional del ballet.", personas: ["Marie Taglioni", "Carlo Blasis", "Carlotta Grisi"], categoria: "ballet" },
  { id: 7, nombre: "Ballet Imperial Ruso", anioInicio: 1870, anioFin: 1910, color: "#26A69A", estilo: "Gran espectáculo con sinfonía", descripcion: "Marius Petipa coreografía El lago de los cisnes, La bella durmiente y Cascanueces con música de Tchaikovsky. San Petersburgo se convierte en la capital mundial del ballet clásico.", personas: ["Marius Petipa", "Piotr Ilich Tchaikovsky", "Anna Pávlova"], categoria: "ballet" },
  { id: 8, nombre: "Vanguardia y Ballets Russos", anioInicio: 1909, anioFin: 1930, color: "#AB47BC", estilo: "Ruptura con la tradición clásica", descripcion: "Diaghilev reúne a Nijinsky, Stravinski y Picasso en los Ballets Russos. La consagración de la primavera (1913) provoca un escándalo histórico. La danza se fusiona con el arte moderno.", personas: ["Sergei Diaghilev", "Vaslav Nijinsky", "Igor Stravinski"], categoria: "moderna" },
  { id: 9, nombre: "Danza Moderna Americana", anioInicio: 1910, anioFin: 1960, color: "#EF5350", estilo: "Expresión libre del cuerpo", descripcion: "Isadora Duncan baila descalza y con velos griegos, liberando el cuerpo del corsé ballético. Martha Graham crea un nuevo vocabulario basado en la contracción y la espiral. La danza moderna nace.", personas: ["Isadora Duncan", "Martha Graham", "Doris Humphrey"], categoria: "moderna" },
  { id: 10, nombre: "Jazz y Danzas Sociales", anioInicio: 1920, anioFin: 1970, color: "#FF7043", estilo: "Ritmo sincopado y baile en pareja", descripcion: "El charleston, el swing, el lindy hop y el rock and roll transforman los salones de baile. El tango argentino conquista Europa. Fred Astaire y Ginger Rogers llevan el jazz al cine.", personas: ["Fred Astaire", "Josephine Baker", "Arthur Murray"], categoria: "social" },
  { id: 11, nombre: "Neoclásico y Expresionismo Alemán", anioInicio: 1950, anioFin: 1975, color: "#5C6BC0", estilo: "Fusión de técnica clásica y expresión", descripcion: "Balanchine crea el neoclásico americano: técnica pura sin narrativa. Pina Bausch desarrolla el Tanztheater en Alemania, mezclando teatro, habla y danza para explorar las relaciones humanas.", personas: ["George Balanchine", "Merce Cunningham", "Pina Bausch"], categoria: "contemporanea" },
  { id: 12, nombre: "Danza Contemporánea y Postmoderna", anioInicio: 1960, anioFin: 1995, color: "#29B6F6", estilo: "Deconstrucción y contact improvisation", descripcion: "El Judson Dance Theater en Nueva York elimina la virtuosidad técnica. El contact improvisation de Steve Paxton explora el peso y el tacto. Cualquier movimiento es danza.", personas: ["Trisha Brown", "Steve Paxton", "Yvonne Rainer"], categoria: "contemporanea" },
  { id: 13, nombre: "Danza Urbana y Hip-hop", anioInicio: 1970, anioFin: 9999, color: "#CDDC39", estilo: "Breaking, popping, locking y krump", descripcion: "El breakdance nace en el South Bronx de Nueva York. DJ Kool Herc y Afrika Bambaataa crean el contexto cultural. El hip-hop dance se globaliza y en 2024 el breaking debuta en los Juegos Olímpicos.", personas: ["DJ Kool Herc", "Mr. Wiggles", "Richard Colón 'Crazy Legs'"], categoria: "urbana" },
  { id: 14, nombre: "Danza Digital e Inmersiva", anioInicio: 2000, anioFin: 9999, color: "#78909C", estilo: "Motion capture, videodanza y VR", descripcion: "El motion capture lleva el movimiento de bailarines a los videojuegos. La videodanza es reconocida como género artístico. La realidad virtual permite experiencias de danza inmersiva en 360 grados.", personas: ["Wayne McGregor", "Akram Khan", "Bill T. Jones"], categoria: "digital" },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -3000, descripcion: "Pinturas rupestres en Egipto muestran las primeras representaciones de danza ritual" },
  { anio: -534, descripcion: "Tespis introduce el coro de danza en las tragedias del festival dionisíaco de Atenas" },
  { anio: 1581, descripcion: "Ballet Comique de la Reine en París: el primer ballet de la historia como espectáculo completo" },
  { anio: 1661, descripcion: "Luis XIV funda la Académie Royale de Danse: la técnica clásica queda codificada" },
  { anio: 1832, descripcion: "Marie Taglioni baila La Sylphide en puntas: nace el ballet romántico" },
  { anio: 1913, descripcion: "Estreno de La consagración de la primavera de Stravinski: el público abuchea e inicia peleas" },
  { anio: 1927, descripcion: "Isadora Duncan muere estrangulada por su propia bufanda: símbolo de la danza libre" },
  { anio: 1977, descripcion: "Saturday Night Fever lleva la fiebre del disco al cine: la cultura del baile social se globaliza" },
  { anio: 2024, descripcion: "El breaking debuta en los Juegos Olímpicos de París: la danza urbana llega al olimpismo" },
];

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: "Danza Ritual y Antigua", desde: -3000, hasta: 400, icono: "🌿" },
  { nombre: "Danza Medieval y Renacentista", desde: 400, hasta: 1650, icono: "🕯️" },
  { nombre: "Ballet Clásico", desde: 1650, hasta: 1870, icono: "🩰" },
  { nombre: "Revolución Modernista", desde: 1870, hasta: 1950, icono: "💫" },
  { nombre: "Danza Contemporánea", desde: 1950, hasta: 1990, icono: "🎭" },
  { nombre: "Danza Digital y Urbana", desde: 1990, hasta: 9999, icono: "🎧" },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  ritual: 'Ritual',
  clasica: 'Clásica Antigua',
  folclore: 'Folclore',
  ballet: 'Ballet',
  moderna: 'Moderna',
  social: 'Social',
  contemporanea: 'Contemporánea',
  urbana: 'Urbana',
  digital: 'Digital',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  ritual: '#8D6E63',
  clasica: '#795548',
  folclore: '#FF8F00',
  ballet: '#66BB6A',
  moderna: '#EF5350',
  social: '#FF7043',
  contemporanea: '#5C6BC0',
  urbana: '#CDDC39',
  digital: '#78909C',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoDanza }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Estilo de Danza</h4>
          <ul className={styles.caracteristicasList}>
            <li>{periodo.estilo}</li>
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Figuras clave</h4>
          <ul className={styles.artistasList}>
            {periodo.personas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Descripción</span>
        <p>{periodo.descripcion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = -3000;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 60;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoDanza | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoDanza[][] = [[], [], [], []];
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

  // Marcadores con años negativos
  const marcadores: number[] = [-2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000];

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
          aria-label="Línea del tiempo de la historia de la danza"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">año 0</text>

          {/* Marcadores temporales */}
          {marcadores.filter(m => m !== 0).map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(m)}</text>
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
            <span className={styles.preguntaIcono} aria-hidden="true">💃</span>
            <p>{periodo.estilo}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Estilo de Danza</h4>
              <ul className={styles.caracteristicasList}>
                <li>{periodo.estilo}</li>
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Figuras clave</h4>
              <ul className={styles.artistasList}>
                {periodo.personas.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Descripción histórica</span>
            <p>{periodo.descripcion}</p>
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
        per.personas.some((p) => p.toLowerCase().includes(termino)) ||
        per.estilo.toLowerCase().includes(termino);
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
          style={categoriaFiltro === 'todos' ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
        >
          Todos
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
        placeholder="Buscar por período, figura o estilo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de danza"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Fechas</th>
              <th>Categoría</th>
              <th>Estilo de Danza</th>
              <th>Figura clave</th>
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
                  <td className={styles.preguntaCell}>{per.estilo}</td>
                  <td>{per.personas[0]}</td>
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

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de danza y eventos históricos organizados por eras.
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
                      <span className={styles.eraEventoTexto}>{ev.descripcion}</span>
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

export default function VisualizadorHistoriaDanza() {
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
        <h1 className={styles.heroTitle}>Historia de la Danza</h1>
        <p className={styles.heroSubtitle}>
          De los rituales egipcios al breaking olímpico — 14 períodos con figuras clave, estilos y contexto histórico
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
        title="Historia de la danza: del ritual al breaking"
        subtitle="Cómo el movimiento humano ha evolucionado de los rituales sagrados a la expresión artística y la cultura urbana"
      >
        {/* Sección 1 — Texto introductorio */}
        <p>
          La danza es una de las formas de expresión humana más antiguas que conocemos. Antes de la escritura, antes de la pintura en cueva, los seres humanos ya bailaban: las pinturas rupestres egipcias de 5.000 años de antigüedad muestran figuras en movimiento rítmico ligadas a ceremonias religiosas. Desde entonces, la danza ha acompañado a la humanidad en cada época, reflejando sus valores, sus tensiones sociales y sus búsquedas artísticas.
        </p>
        <p>
          El ballet clásico, tal como lo conocemos hoy, es relativamente reciente: nació en las cortes italianas del siglo XV, se codificó en la Francia de Luis XIV y alcanzó su cumbre técnica en la Rusia imperial del siglo XIX con Petipa y Tchaikovsky. Pero en paralelo, otras tradiciones —el flamenco, el tango, las danzas africanas, las danzas de salón— seguían su propio camino, conectando el cuerpo con la cultura popular.
        </p>
        <p>
          La gran ruptura del siglo XX llegó de la mano de Isadora Duncan, que rechazó el tutú y las puntas para bailar descalza y con túnicas griegas, liberando el cuerpo de siglos de rigidez académica. Martha Graham llevó esa revolución más lejos aún, creando un vocabulario técnico propio basado en la contracción abdominal y la espiral. En los años 60, el Judson Dance Theater fue aún más lejos: cualquier movimiento podía ser danza.
        </p>
        <p>
          Mientras tanto, en las calles del South Bronx nacía el breakdance: una forma de expresión ligada al hip-hop que en 2024 llegó a los Juegos Olímpicos de París. Hoy, la danza sigue evolucionando con el motion capture, la videodanza y las experiencias de realidad virtual, demostrando que el movimiento humano nunca agota sus posibilidades expresivas.
        </p>

        {/* Sección 2 — Escenarios comparativos */}
        <h3>Grandes debates en la historia de la danza</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🩰</span>
            <div>
              <strong>Ballet clásico vs Danza moderna</strong>
              <p>El ballet impone una técnica codificada de siglos: cinco posiciones, puntas, vocabulario en francés. La danza moderna, desde Duncan y Graham, reivindica la expresión personal, el cuerpo sin corsé y el movimiento como lenguaje individual.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🕺</span>
            <div>
              <strong>Jazz social vs Hip-hop</strong>
              <p>El jazz nació en los salones de baile como danza de pareja en los años 20. El hip-hop, en los 70, volvió a la individualidad y la competición: el cypher, el battle, el uno contra uno. Ambos son formas de resistencia cultural afroamericana con décadas de diferencia.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌿</span>
            <div>
              <strong>Danza ritual vs Danza artística</strong>
              <p>Durante milenios, la danza fue inseparable de lo sagrado: ceremonia, rito de paso, ofrenda a los dioses. El Renacimiento y la modernidad la convirtieron en espectáculo y arte autónomo. ¿Se perdió algo en esa separación? Muchas tradiciones contemporáneas buscan reconectar ambas dimensiones.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
            <div>
              <strong>Danza física vs Danza digital</strong>
              <p>La danza del siglo XXI enfrenta el reto de la digitalización: el motion capture convierte el movimiento en datos, la videodanza explora ángulos imposibles en escena, la realidad virtual permite experiencias inmersivas. ¿Es danza sin cuerpo presente? El debate apenas comienza.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuándo nació el ballet clásico?</strong>
            <p>El ballet tiene su origen en los intermedios cortesanos italianos del siglo XV, pero su codificación académica comienza con la fundación de la Académie Royale de Danse por Luis XIV en 1661. El propio rey era bailarín. Jean-Georges Noverre, con sus Cartas sobre la danza (1760), sentó las bases del ballet como arte narrativo. El tutú largo, las puntas y los mundos feéricos son invenciones del ballet romántico de los años 1830.</p>
            <span className={styles.faqTip}>Curiosidad: "ballet" viene del italiano "balletto" (pequeño baile). El vocabulario técnico es todo en francés porque París fue la capital mundial del ballet en el siglo XVII.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el Tanztheater de Pina Bausch?</strong>
            <p>El Tanztheater (teatro-danza) es un género creado por Pina Bausch en Wuppertal (Alemania) a partir de los años 70. Mezcla danza, texto hablado, teatro, humor, repetición y autobiografía para explorar las relaciones humanas, especialmente entre hombres y mujeres. Sus piezas más conocidas, como Café Müller o Kontakthof, desafían la frontera entre danza y teatro. Bausch trabajaba preguntando a sus bailarines: "¿Qué os mueve?" y construía a partir de sus respuestas.</p>
            <span className={styles.faqTip}>La película de Pedro Almodóvar Hable con ella (2002) incluye fragmentos de Café Müller, lo que popularizó a Bausch internacionalmente.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué causó escándalo La consagración de la primavera?</strong>
            <p>El estreno de La consagración de la primavera (1913), con música de Stravinski y coreografía de Nijinsky para los Ballets Russos, provocó uno de los mayores escándalos en la historia de las artes escénicas. El público abucheó, insultó e incluso se pegó en el teatro Champs-Élysées de París. Las razones: la música disonante y rítmicamente irregular de Stravinski, la coreografía antiacadémica de Nijinsky (pies girados hacia dentro, movimientos angulares, sin arabesque ni puntas), y la temática pagana del sacrificio virginal.</p>
            <span className={styles.faqTip}>Hoy La consagración es considerada una de las obras maestras del siglo XX y se representa regularmente con distintas coreografías.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es el breakdance un deporte olímpico?</strong>
            <p>El breaking (su nombre oficial) debutó en los Juegos Olímpicos de París 2024, aunque no aparecerá en Los Ángeles 2028 (el Comité Olímpico no lo incluyó). En París, la competición enfrentó a b-boys y b-girls en battles individuales juzgados por criterios como técnica, musicalidad, creatividad y originalidad. La inclusión fue polémica en la comunidad del hip-hop: algunos celebraron el reconocimiento, otros temen la deportivización de una cultura de calle.</p>
            <span className={styles.faqTip}>El breaking nació en el South Bronx de Nueva York entre 1970 y 1975, vinculado a las block parties de DJ Kool Herc.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la videodanza?</strong>
            <p>La videodanza (también llamada danza para cámara o screen dance) es un género artístico que utiliza la edición de vídeo, el encuadre y los efectos cinematográficos como parte integral de la coreografía. No es simplemente grabar una danza: el lenguaje cinematográfico —planos imposibles, ralentización, montaje— crea movimientos que no existirían en un escenario. Pioneros como Maya Deren en los años 40 ya exploraron esta fusión. Hoy es un género reconocido con festivales propios en todo el mundo.</p>
            <span className={styles.faqTip}>El clip de Beyoncé "Countdown" (2011) es un ejemplo de videodanza mainstream que cita al coreógrafo Anne Teresa De Keersmaeker.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo explorar la historia de la danza</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por el ballet clásico del siglo XIX</strong>
              <p>El lago de los cisnes, La bella durmiente y Cascanueces son el punto de entrada más accesible. Son narrativos, con música conocida de Tchaikovsky y técnica clásica bien documentada. Entender el ballet académico te da el contexto para comprender todas las rupturas posteriores.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Descubre la danza moderna americana</strong>
              <p>Busca en vídeo a Martha Graham bailando en los años 40-50: la contracción, la caída al suelo, la relación con la mitología griega. Compara con Isadora Duncan (existen imágenes de archivo). La diferencia con el ballet es inmediata e impactante.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Explora el impacto de los Ballets Russos</strong>
              <p>Diaghilev reunió a los mayores artistas de su época: Picasso diseñó los decorados, Stravinski compuso la música, Nijinsky coreografió. Es el momento en que la danza entra plenamente en el arte moderno. La consagración de la primavera es el punto de inflexión.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta la cultura urbana con la historia</strong>
              <p>El hip-hop y el breakdance no surgieron de la nada: conectan con la danza social afroamericana (jazz, swing, funk), con la tradición de los street dancers y con la resistencia cultural de comunidades marginadas. Ver el documental Rize (2005) sobre el krump en Los Ángeles es iluminador.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Investiga las danzas de tu propia cultura</strong>
              <p>La historia occidental de la danza es solo una parte del panorama global. El butoh japonés, la bharatanatyam india, la danza kecak balinesa, el flamenco andaluz tienen sus propias cronologías milenarias. Conectar lo local con lo global enriquece enormemente la comprensión.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Recursos para explorar la danza</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎬</span>
            <p>Las plataformas de streaming tienen archivos de danza excepcionales: grabaciones de Margot Fonteyn y Rudolf Nureyev, de Mikhail Baryshnikov o de Sylvie Guillem están disponibles en vídeo. Ver a los grandes bailarines del siglo XX en movimiento vale más que cualquier texto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📖</span>
            <p>El libro "Danza" de Curt Sachs (1933) sigue siendo una referencia clásica sobre historia de la danza a escala mundial. Para ballet, "Apollo's Angels" de Jennifer Homans (2010) es una historia social y artística del ballet europeo desde el Renacimiento hasta hoy.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎭</span>
            <p>Si puedes asistir a espectáculos en vivo, prioriza diversidad de géneros: un espectáculo de ballet clásico, uno de danza contemporánea y uno de danzas de raíz o urbanas. La diferencia corporal y energética entre géneros se entiende mejor en el cuerpo que en el texto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💻</span>
            <p>El canal de YouTube del Teatro Bolshói, el Metropolitan Opera, el Ballet Nacional de España y compañías como el NDT tienen grabaciones gratuitas de alta calidad. La pandemia de 2020-2021 obligó a muchas compañías a digitalizar su archivo: aprovéchalo.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          ⚠️ Las fechas de la danza antigua son aproximadas, basadas en hallazgos arqueológicos. La danza pre-escrita se transmitía oralmente y muchas tradiciones se han perdido.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-danza')} />
      <ShareCard appName="visualizador-historia-danza" />
      <Footer appName="visualizador-historia-danza" />
    </div>
  );
}
