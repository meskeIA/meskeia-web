'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaExploracion.module.css';
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

type Categoria = 'antigua' | 'medieval' | 'descubrimientos' | 'cientifica' | 'extrema' | 'espacial';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoExploracion {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  tecnica: string;
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

const PERIODOS: PeriodoExploracion[] = [
  {
    id: 1,
    nombre: 'Fenicios y Polinesios Navegantes',
    anioInicio: -600,
    anioFin: -100,
    color: '#4CAF50',
    tecnica: 'Navegación por estrellas y corrientes',
    descripcion:
      'Los fenicios dominaron el Mediterráneo mientras los polinesios colonizaban el Pacífico mediante lectura de estrellas, corrientes y vuelo de aves.',
    personas: ['Hannón de Cartago', 'Himilcón'],
    categoria: 'antigua',
  },
  {
    id: 2,
    nombre: 'Exploración Griega y Helenística',
    anioInicio: -550,
    anioFin: 50,
    color: '#8BC34A',
    tecnica: 'Cartografía y geografía racional',
    descripcion:
      'Los griegos introdujeron la cartografía científica y la circunnavegación sistemática, estableciendo el pensamiento geográfico racional.',
    personas: ['Piteas de Masalia', 'Eratóstenes', 'Estrabón'],
    categoria: 'antigua',
  },
  {
    id: 3,
    nombre: 'Roma y las Rutas Comerciales',
    anioInicio: -200,
    anioFin: 400,
    color: '#CDDC39',
    tecnica: 'Rutas terrestres y marítimas imperiales',
    descripcion:
      'El Imperio Romano conectó Europa, África y Asia mediante la red vial y la Ruta de la Seda, facilitando intercambios sin precedentes.',
    personas: ['Plinio el Viejo', 'Ptolomeo'],
    categoria: 'antigua',
  },
  {
    id: 4,
    nombre: 'Vikingos',
    anioInicio: 793,
    anioFin: 1100,
    color: '#FF9800',
    tecnica: 'Longships y navegación astronómica',
    descripcion:
      'Los vikingos llegaron a América del Norte 500 años antes que Colón, estableciendo asentamientos en Vinland y explorando el Atlántico Norte.',
    personas: ['Leif Erikson', 'Erik el Rojo'],
    categoria: 'medieval',
  },
  {
    id: 5,
    nombre: 'Exploradores Árabes e Islámicos',
    anioInicio: 700,
    anioFin: 1400,
    color: '#FF5722',
    tecnica: 'Astronomía árabe y astrolabio',
    descripcion:
      'Los geógrafos árabes cartografiaron el mundo conocido con precisión inigualable, mientras comerciantes y viajeros cruzaban África, Asia y el Índico.',
    personas: ['Ibn Battuta', 'Al-Idrisi', 'Ahmad ibn Fadlan'],
    categoria: 'medieval',
  },
  {
    id: 6,
    nombre: 'Marco Polo y la Ruta de la Seda',
    anioInicio: 1271,
    anioFin: 1368,
    color: '#E91E63',
    tecnica: 'Caravanas transcontinentales',
    descripcion:
      'Marco Polo y otros viajeros medievales cruzaron Asia Central hasta China, abriendo el imaginario europeo a Oriente y generando demanda de rutas marítimas.',
    personas: ['Marco Polo', 'Ibn Battuta', 'Guillermo de Rubruck'],
    categoria: 'medieval',
  },
  {
    id: 7,
    nombre: 'Portugal y el Atlántico',
    anioInicio: 1415,
    anioFin: 1500,
    color: '#9C27B0',
    tecnica: 'Carabela y navegación astronómica',
    descripcion:
      'Portugal lideró la exploración sistemática de la costa africana, desarrollando la carabela y técnicas astronómicas que permitieron circunnavegar África.',
    personas: ['Enrique el Navegante', 'Bartolomeu Dias', 'Vasco da Gama'],
    categoria: 'descubrimientos',
  },
  {
    id: 8,
    nombre: 'Gran Era de los Descubrimientos',
    anioInicio: 1492,
    anioFin: 1600,
    color: '#2196F3',
    tecnica: 'Cartografía oceánica y brújula',
    descripcion:
      'Colón, Magallanes y Elcano completaron la imagen del globo terráqueo, uniendo por primera vez todos los continentes en una red de intercambio global.',
    personas: ['Cristóbal Colón', 'Magallanes', 'Elcano', 'Amerigo Vespucci'],
    categoria: 'descubrimientos',
  },
  {
    id: 9,
    nombre: 'Exploración del Interior de los Continentes',
    anioInicio: 1600,
    anioFin: 1800,
    color: '#00BCD4',
    tecnica: 'Expediciones científicas y cartografía',
    descripcion:
      'Tras costear los continentes, exploradores penetraron en África, América y Asia, mapeando ríos, montañas y culturas desconocidas.',
    personas: ['Alexander von Humboldt', 'James Cook', 'Joseph Banks'],
    categoria: 'cientifica',
  },
  {
    id: 10,
    nombre: 'Exploración Polar',
    anioInicio: 1818,
    anioFin: 1914,
    color: '#3F51B5',
    tecnica: 'Expediciones árticas y antárticas',
    descripcion:
      'La conquista del Ártico y la Antártida representó el límite extremo de la exploración terrestre, con condiciones de supervivencia sin precedentes.',
    personas: ['Ernest Shackleton', 'Roald Amundsen', 'Robert Falcon Scott'],
    categoria: 'extrema',
  },
  {
    id: 11,
    nombre: 'Exploración Submarina',
    anioInicio: 1930,
    anioFin: 1970,
    color: '#009688',
    tecnica: 'Batiscafo y escafandra autónoma',
    descripcion:
      'El descubrimiento del fondo oceánico reveló el mayor ecosistema de la Tierra, con formas de vida desconocidas en las trincheras más profundas.',
    personas: ['Jacques Cousteau', 'Auguste Piccard', 'Don Walsh'],
    categoria: 'extrema',
  },
  {
    id: 12,
    nombre: 'Era Espacial',
    anioInicio: 1957,
    anioFin: 1972,
    color: '#795548',
    tecnica: 'Cohetes y módulos espaciales',
    descripcion:
      'La carrera espacial llevó al ser humano a la Luna y lanzó sondas que alcanzaron los confines del sistema solar, ampliando la exploración más allá de la Tierra.',
    personas: ['Yuri Gagarin', 'Neil Armstrong', 'Buzz Aldrin'],
    categoria: 'espacial',
  },
  {
    id: 13,
    nombre: 'Exploración Robótica del Sistema Solar',
    anioInicio: 1977,
    anioFin: 2020,
    color: '#607D8B',
    tecnica: 'Sondas autónomas y rovers',
    descripcion:
      'Voyager, Curiosity y New Horizons han explorado Júpiter, Saturno, Plutón y el espacio interestelar, multiplicando por mil nuestro conocimiento del sistema solar.',
    personas: ['Carl Sagan', 'Katherine Johnson', 'Frank Drake'],
    categoria: 'espacial',
  },
  {
    id: 14,
    nombre: 'Nueva Era Espacial Comercial',
    anioInicio: 2000,
    anioFin: 9999,
    color: '#F44336',
    tecnica: 'Cohetes reutilizables e IA',
    descripcion:
      'SpaceX, Blue Origin y agencias espaciales internacionales trabajan para hacer la exploración espacial accesible, con misiones a Marte en el horizonte.',
    personas: ['Elon Musk', 'Jeff Bezos', 'Peggy Whitson'],
    categoria: 'espacial',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -600, descripcion: 'Fenicios circunnavegan África por encargo del faraón Necao II' },
  { anio: 1000, descripcion: 'Leif Erikson llega a América del Norte (Vinland)' },
  { anio: 1271, descripcion: 'Marco Polo inicia su viaje a China por la Ruta de la Seda' },
  { anio: 1492, descripcion: 'Colón llega a América, iniciando la era de los descubrimientos modernos' },
  { anio: 1522, descripcion: 'Elcano completa la primera circunnavegación del globo' },
  { anio: 1911, descripcion: 'Amundsen alcanza el Polo Sur por primera vez' },
  { anio: 1961, descripcion: 'Gagarin es el primer ser humano en el espacio' },
  { anio: 1969, descripcion: "Armstrong pisa la Luna: 'Un pequeño paso para el hombre'" },
  { anio: 2012, descripcion: 'Voyager 1 cruza la heliopausa: primer objeto humano en el espacio interestelar' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  antigua: 'Antigua',
  medieval: 'Medieval',
  descubrimientos: 'Descubrimientos',
  cientifica: 'Científica',
  extrema: 'Exploración Extrema',
  espacial: 'Espacial',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  antigua: '#4CAF50',
  medieval: '#FF9800',
  descubrimientos: '#2196F3',
  cientifica: '#00BCD4',
  extrema: '#3F51B5',
  espacial: '#F44336',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoExploracion }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Exploradores clave</h4>
          <ul className={styles.artistasList}>
            {periodo.personas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Técnica principal</h4>
          <ul className={styles.caracteristicasList}>
            <li>{periodo.tecnica}</li>
          </ul>
        </div>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{periodo.descripcion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = -600;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 60;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoExploracion | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoExploracion[][] = [[], [], [], []];
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

  // Marcadores de referencia temporal
  const marcadores: number[] = [-500, -200, 0, 300, 700, 1000, 1300, 1500, 1700, 1900, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca desde el 600 a.C. hasta la actualidad.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la exploración"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">año 0</text>

          {/* Marcadores temporales */}
          {marcadores.map((m) => (
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
            <span className={styles.preguntaIcono} aria-hidden="true">🧭</span>
            <p>{periodo.tecnica}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Exploradores clave</h4>
              <ul className={styles.artistasList}>
                {periodo.personas.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Categoría</h4>
              <ul className={styles.caracteristicasList}>
                <li>{ETIQUETAS_CATEGORIA[periodo.categoria]}</li>
              </ul>
            </div>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
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
        per.personas.some((p) => p.toLowerCase().includes(termino));
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
        placeholder="Buscar por período o explorador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de exploración"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Años</th>
              <th>Categoría</th>
              <th>Explorador clave</th>
              <th>Técnica Principal</th>
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
                  <td>{per.personas[0]}</td>
                  <td className={styles.preguntaCell}>{per.tecnica}</td>
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
  { nombre: 'Navegantes Antiguos', desde: -600, hasta: 800, icono: '⛵' },
  { nombre: 'Vikingos y Mundo Árabe', desde: 800, hasta: 1200, icono: '🐉' },
  { nombre: 'Exploradores Medievales', desde: 1200, hasta: 1420, icono: '🗺️' },
  { nombre: 'Gran Era de los Descubrimientos', desde: 1420, hasta: 1600, icono: '🧭' },
  { nombre: 'Exploración Científica', desde: 1600, hasta: 1900, icono: '🔬' },
  { nombre: 'Exploración Extrema y Espacial', desde: 1900, hasta: 9999, icono: '🚀' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de exploración y eventos históricos organizados por eras.
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

export default function VisualizadorHistoriaExploracion() {
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
        <h1 className={styles.heroTitle}>Historia de la Exploración</h1>
        <p className={styles.heroSubtitle}>
          De los navegantes fenicios a las misiones a Marte — 14 períodos de exploración geográfica y espacial con exploradores clave y contexto histórico
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
        title="Historia de la exploración: técnicas y exploradores"
        subtitle="Cómo el ser humano ha expandido su conocimiento del mundo a lo largo de 2.600 años de aventura geográfica y espacial"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 4 períodos representativos</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Épocas</th>
                <th>Técnica</th>
                <th>Alcance geográfico</th>
                <th>Explorador icónico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fenicios y Polinesios</strong></td>
                <td>600–100 a.C.</td>
                <td>Lectura de estrellas y corrientes</td>
                <td>Mediterráneo y Pacífico</td>
                <td>Hannón de Cartago</td>
              </tr>
              <tr>
                <td><strong>Gran Era de los Descubrimientos</strong></td>
                <td>1492–1600</td>
                <td>Carabela, brújula, cartografía oceánica</td>
                <td>Global (todos los continentes)</td>
                <td>Cristóbal Colón</td>
              </tr>
              <tr>
                <td><strong>Exploración Científica</strong></td>
                <td>1600–1800</td>
                <td>Expediciones sistemáticas y cartografía</td>
                <td>Interior de los continentes</td>
                <td>Alexander von Humboldt</td>
              </tr>
              <tr>
                <td><strong>Era Espacial</strong></td>
                <td>1957–hoy</td>
                <td>Cohetes, rovers y sondas autónomas</td>
                <td>Sistema solar e interestelar</td>
                <td>Yuri Gagarin / Neil Armstrong</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>¿Para quién es útil este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🧭</span>
            <div>
              <strong>Comparar técnicas de navegación</strong>
              <p>Observa cómo cada era desarrolló sus propias técnicas: de la lectura de estrellas fenicia al GPS moderno, cada innovación tecnológica amplió el alcance de la exploración humana.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Estudiar el impacto del encuentro de culturas</strong>
              <p>Analiza cómo los grandes viajes de exploración conectaron civilizaciones, generando intercambios culturales, comerciales y, también, procesos de conquista y colonización.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
            <div>
              <strong>Entender la evolución tecnológica</strong>
              <p>Sigue el hilo tecnológico desde la carabela hasta los cohetes reutilizables: cada período explorador impulsó innovaciones que transformaron el transporte, la cartografía y las comunicaciones.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
            <div>
              <strong>Analizar la exploración espacial moderna</strong>
              <p>Contextualiza la carrera espacial del siglo XX y la nueva era comercial dentro del patrón histórico: la exploración siempre ha sido impulsada por curiosidad, competencia y beneficio estratégico.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Quiénes llegaron primero a América?</strong>
            <p>Los primeros humanos llegaron a América hace unos 15.000–20.000 años cruzando el estrecho de Bering. En la era histórica, los vikingos fueron los primeros europeos en llegar (ca. año 1000, Leif Erikson en Vinland, actual Terranova). Colón llegó en 1492, casi 500 años después, pero fue su viaje el que inició el contacto sostenido entre Europa y América.</p>
            <span className={styles.faqTip}>Dato: el asentamiento vikingo de L'Anse aux Meadows (Canadá) es el único sitio europeo precolombino confirmado arqueológicamente en América.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué impulsó la Gran Era de los Descubrimientos?</strong>
            <p>Una combinación de factores: la caída de Constantinopla (1453) bloqueó las rutas terrestres a Asia; los reinos ibéricos competían por rutas marítimas a las especias (valiosísimas en Europa); mejoras técnicas (carabela, brújula, astrolabio) hicieron posible navegar el océano abierto; y una mentalidad humanista renacentista impulsaba la exploración como valor en sí mismo.</p>
            <span className={styles.faqTip}>Las especias como la pimienta valían literalmente su peso en oro en la Europa medieval.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el espacio interestelar y por qué Voyager 1 es histórico?</strong>
            <p>El espacio interestelar es la región que existe entre los sistemas estelares, más allá de la heliopausa (el límite donde el viento solar deja de dominar). En 2012, la Voyager 1, lanzada en 1977, cruzó ese límite convirtiéndose en el primer objeto humano en salir del sistema solar. Viajando a 17 km/s, tardó 35 años en recorrer esa distancia.</p>
            <span className={styles.faqTip}>Voyager 1 lleva un disco de oro con sonidos e imágenes de la Tierra, por si alguna civilización extraterrestre lo encontrase.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Fue la exploración siempre pacífica?</strong>
            <p>No. La Gran Era de los Descubrimientos conllevó conquista, esclavitud y el colapso demográfico de civilizaciones enteras. Se estima que la población indígena de América cayó un 90% en el siglo posterior al contacto europeo, principalmente por enfermedades pero también por violencia. La exploración científica del siglo XIX también estuvo frecuentemente al servicio del colonialismo europeo.</p>
            <span className={styles.faqTip}>La historia de la exploración tiene dos caras: el asombro geográfico y el impacto brutal sobre las poblaciones encontradas.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué sigue después de la Luna?</strong>
            <p>Marte es el objetivo declarado de las próximas décadas. La NASA planea misiones tripuladas en los años 2030; SpaceX trabaja en el Starship para hacer el viaje; la ESA y China tienen sus propios programas. Más allá, las lunas de Júpiter (Europa) y Saturno (Encélado) son candidatas para buscar vida por su agua líquida subterránea. El espacio interestelar queda, por ahora, para las sondas robóticas.</p>
            <span className={styles.faqTip}>Un viaje a Marte dura entre 6 y 9 meses en las ventanas de lanzamiento óptimas (cada 26 meses).</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo explorar la cronología eficazmente</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por la Línea del Tiempo</strong>
              <p>Observa la distribución visual de los 14 períodos. Identifica cuáles se solapan (muchos coinciden en el tiempo) y cuáles son exclusivos de su era. El solapamiento revela que la exploración humana es multifrontal, no lineal.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Haz clic en el período que más te llame la atención</strong>
              <p>El panel de detalle te mostrará a los exploradores clave y el contexto histórico. Lee la descripción completa: cada período tiene motivaciones únicas (comercio, poder, curiosidad científica, competencia geopolítica).</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Compara las técnicas de navegación</strong>
              <p>En la pestaña Comparativa, filtra por categoría y observa cómo la columna "Técnica Principal" evoluciona. De las estrellas y corrientes a los cohetes reutilizables: la historia de la exploración es también la historia de la ingeniería.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Interpreta las eras en el Contexto Histórico</strong>
              <p>Cada era agrupa períodos que comparten un contexto geopolítico. La era "Exploración Extrema y Espacial" (1900–hoy) incluye la exploración polar, submarina y espacial: todas son respuestas al mismo impulso de conquistar los últimos territorios inexplorados.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Relaciona con los eventos históricos clave</strong>
              <p>Los 9 hitos que aparecen en el Contexto Histórico son los puntos de inflexión de la historia exploradora. Cada uno marca un antes y un después: la circunnavegación de Elcano en 1522, Armstrong en la Luna en 1969, Voyager cruzando la heliopausa en 2012.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Consejos para entender la historia de la exploración</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌐</span>
            <p>La exploración nunca ocurrió en un solo frente: mientras Colón cruzaba el Atlántico, los portugueses abrían la ruta del Cabo de Buena Esperanza, Ibn Battuta ya había recorrido 120.000 km, y los polinesios llevaban siglos en el Pacífico.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚙️</span>
            <p>Cada salto tecnológico habilitó un nuevo tipo de exploración: la carabela abrió los océanos, el batiscafo abrió las trincheras, el cohete abrió el espacio. Pregúntate siempre: ¿qué tecnología estaba disponible y cuál faltaba?</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💰</span>
            <p>Detrás de casi toda gran expedición hay un patrocinador con intereses económicos o geopolíticos: reyes, imperios, corporaciones o agencias gubernamentales. La exploración pura raramente se financia a sí misma.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔭</span>
            <p>La exploración robótica del siglo XX y XXI no es menos "humana" que la presencial: las sondas Voyager, los rovers Curiosity y Perseverance son extensiones de nuestra curiosidad, diseñadas por miles de personas para llegar donde nosotros no podemos aún.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Nota histórica importante</strong>
          <ul>
            <li>Muchas exploraciones conllevaron <strong>conquista, esclavitud y destrucción de culturas</strong>. Esta cronología refleja avances tecnológicos y geográficos pero no justifica ni minimiza los impactos coloniales.</li>
            <li>La <strong>historia de los explorados</strong> es tan importante como la de los exploradores: las civilizaciones azteca, inca, maya y cientos de culturas indígenas tenían sus propias tradiciones cartográficas y geográficas antes del contacto europeo.</li>
            <li>La <strong>exploración espacial</strong> plantea nuevos dilemas éticos: ¿a quién pertenecen los recursos de otros planetas? ¿Quién tiene acceso? Los debates del siglo XXI sobre el espacio replican, en muchos aspectos, los debates del siglo XV sobre los territorios "descubiertos".</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-exploracion')} />
      <ShareCard appName="visualizador-historia-exploracion" />
      <Footer appName="visualizador-historia-exploracion" />
    </div>
  );
}
