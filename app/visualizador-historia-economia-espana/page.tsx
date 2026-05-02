'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaEconomiaEspana.module.css';
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

type Categoria = 'medieval' | 'imperial' | 'liberal' | 'industrial' | 'crisis' | 'reformista' | 'transicion' | 'crecimiento';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoEconomia {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  modelo: string;
  descripcion: string;
  personas: string[];
  categoria: Categoria;
}

interface EventoHistorico {
  anio: number;
  descripcion: string;
}

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoEconomia[] = [
  { id: 1, nombre: "Economía Medieval Peninsular", anioInicio: 711, anioFin: 1469, color: "#8D6E63", modelo: "Agricultura, ganadería y rutas comerciales", descripcion: "Convivencia de economías cristiana e islámica. Al-Ándalus destaca por la agricultura irrigada, el artesanado y el comercio mediterráneo. Los reinos cristianos se apoyan en la Mesta y las ferias.", personas: ["Alfonso X el Sabio", "Ibn Jaldún"], categoria: "medieval" },
  { id: 2, nombre: "Imperio y Metales Preciosos", anioInicio: 1469, anioFin: 1600, color: "#795548", modelo: "Monopolio colonial y plata americana", descripcion: "Los Reyes Católicos unifican Castilla y Aragón. El descubrimiento de América abre el flujo de plata de Potosí y México. La Casa de Contratación regula el monopolio comercial con las Indias.", personas: ["Fernando e Isabel", "Juan de la Cosa", "Francisco de los Cobos"], categoria: "imperial" },
  { id: 3, nombre: "Crisis del Imperio Habsburgo", anioInicio: 1600, anioFin: 1700, color: "#FF8F00", modelo: "Inflación y quiebras del Estado", descripcion: "El exceso de plata genera inflación (revolución de los precios). Los Austrias quiebran la Hacienda real varias veces. La guerra de los Treinta Años y la pérdida de Portugal aceleran la decadencia.", personas: ["Conde-Duque de Olivares", "Felipe IV"], categoria: "imperial" },
  { id: 4, nombre: "Reformas Borbónicas", anioInicio: 1700, anioFin: 1808, color: "#FFCA28", modelo: "Mercantilismo ilustrado y libre comercio", descripcion: "Felipe V y Carlos III modernizan la economía: libre comercio con América (1778), reformas fiscales y fomento de manufacturas. Los ilustrados critican el atraso económico y proponen la reforma agraria.", personas: ["Carlos III", "Campomanes", "Jovellanos"], categoria: "reformista" },
  { id: 5, nombre: "Guerra, Liberalismo y Desamortización", anioInicio: 1808, anioFin: 1860, color: "#FFA726", modelo: "Liberalismo económico y venta de tierras", descripcion: "La invasión napoleónica y la pérdida de las colonias americanas colapsan la hacienda. Las desamortizaciones de Mendizábal (1836) y Madoz (1855) transforman la propiedad agraria.", personas: ["Mendizábal", "Pascual Madoz", "Ramón de Santillán"], categoria: "liberal" },
  { id: 6, nombre: "Primera Industrialización", anioInicio: 1850, anioFin: 1900, color: "#66BB6A", modelo: "Ferrocarril, siderurgia y textil", descripcion: "El ferrocarril conecta la Península desde 1848. La industria siderúrgica vasca y el textil catalán lideran la industrialización española. La banca moderna emerge con el Banco de España.", personas: ["Laureano Figuerola", "José de Salamanca", "Marqués de Comillas"], categoria: "industrial" },
  { id: 7, nombre: "Restauración y Crisis del 98", anioInicio: 1875, anioFin: 1923, color: "#26A69A", modelo: "Proteccionismo y regeneracionismo", descripcion: "La pérdida de Cuba, Puerto Rico y Filipinas (1898) hunde los ingresos coloniales. El proteccionismo arancelario protege la industria nacional. El regeneracionismo critica el atraso económico.", personas: ["Joaquín Costa", "Santiago Alba", "Antonio Maura"], categoria: "liberal" },
  { id: 8, nombre: "Dictadura de Primo de Rivera y República", anioInicio: 1923, anioFin: 1939, color: "#AB47BC", modelo: "Obras públicas e intervencionismo", descripcion: "Primo de Rivera impulsa las obras públicas financiadas con deuda. La II República afronta la crisis del 29. La Guerra Civil (1936-1939) destruye la economía española.", personas: ["Miguel Primo de Rivera", "Indalecio Prieto"], categoria: "crisis" },
  { id: 9, nombre: "Autarquía Franquista", anioInicio: 1939, anioFin: 1959, color: "#EF5350", modelo: "Autosuficiencia económica e intervención total", descripcion: "Franco impone la autarquía económica: control de precios, racionamiento y aislamiento internacional. El resultado es el estancamiento y una economía de escasez hasta que el fracaso obliga a reformar.", personas: ["Francisco Franco", "Suanzes", "Alberto Ullastres"], categoria: "crisis" },
  { id: 10, nombre: "Desarrollismo y el Milagro Español", anioInicio: 1959, anioFin: 1975, color: "#5C6BC0", modelo: "Planes de Desarrollo, turismo e inversión extranjera", descripcion: "El Plan de Estabilización (1959) abre la economía. Los Planes de Desarrollo de los tecnócratas del Opus Dei impulsan el crecimiento industrial. El turismo genera divisas. El PIB se multiplica por 5.", personas: ["Laureano López Rodó", "Alberto Ullastres", "Mariano Navarro Rubio"], categoria: "crecimiento" },
  { id: 11, nombre: "Transición y Reconversión Industrial", anioInicio: 1975, anioFin: 1986, color: "#29B6F6", modelo: "Pactos sociales y reconversión", descripcion: "Los Pactos de la Moncloa (1977) frenan la inflación. La crisis del petróleo afecta de lleno. La reconversión industrial cierra astilleros y siderurgias. España negocia su entrada en la CEE.", personas: ["Fuentes Quintana", "Adolfo Suárez", "Miguel Boyer"], categoria: "transicion" },
  { id: 12, nombre: "Integración Europea y Boom", anioInicio: 1986, anioFin: 2007, color: "#26C6DA", modelo: "Fondos estructurales, euro y burbuja inmobiliaria", descripcion: "La entrada en la CEE (1986) y el euro (1999) transforman la economía. Los fondos estructurales modernizan infraestructuras. Una burbuja inmobiliaria eleva el PIB per cápita hasta la media europea.", personas: ["Felipe González", "José María Aznar", "Pedro Solbes"], categoria: "crecimiento" },
  { id: 13, nombre: "Gran Recesión", anioInicio: 2008, anioFin: 2014, color: "#F44336", modelo: "Crisis financiera y rescate bancario", descripcion: "El estallido de la burbuja inmobiliaria dispara el paro al 27%. España recibe un rescate europeo para la banca (2012). La prima de riesgo alcanza 640 puntos. Los recortes generan protestas masivas.", personas: ["Elena Salgado", "Luis de Guindos", "Cristóbal Montoro"], categoria: "crisis" },
  { id: 14, nombre: "Recuperación, COVID y Next Generation", anioInicio: 2014, anioFin: 9999, color: "#7CB342", modelo: "Economía digital y fondos europeos", descripcion: "España recupera el empleo hasta 2019. La pandemia COVID-19 hunde el PIB un 11% en 2020. Los fondos Next Generation EU (140.000M€) financian la transición digital y verde.", personas: ["Nadia Calviño", "Pedro Sánchez", "Pablo Hernández de Cos"], categoria: "crecimiento" },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1492, descripcion: "Colón llega a América: España accede a las fuentes de plata y oro que financiarán el Imperio" },
  { anio: 1778, descripcion: "Decreto de libre comercio con América: fin del monopolio sevillano-gaditano" },
  { anio: 1836, descripcion: "Desamortización de Mendizábal: venta de tierras eclesiásticas que transforma la propiedad agraria" },
  { anio: 1848, descripcion: "Primer ferrocarril Barcelona-Mataró: arranca la industrialización española" },
  { anio: 1898, descripcion: "Pérdida de Cuba, Puerto Rico y Filipinas: fin del Imperio colonial y crisis del 98" },
  { anio: 1959, descripcion: "Plan de Estabilización: fin de la autarquía y apertura al capital extranjero" },
  { anio: 1986, descripcion: "España entra en la CEE: acceso al mercado único y fondos estructurales europeos" },
  { anio: 2008, descripcion: "Quiebra de Lehman Brothers: estalla la burbuja inmobiliaria y empieza la Gran Recesión" },
  { anio: 2021, descripcion: "España recibe los primeros fondos Next Generation EU para la transición digital y verde" },
];

const ERAS: Era[] = [
  { nombre: "España Medieval y los Reinos", desde: 711, hasta: 1469, icono: "⚔️" },
  { nombre: "Imperio y Plata de América", desde: 1469, hasta: 1700, icono: "🚢" },
  { nombre: "Reformas y Guerras", desde: 1700, hasta: 1850, icono: "⚡" },
  { nombre: "Industrialización", desde: 1850, hasta: 1936, icono: "🏭" },
  { nombre: "Autarquía y Desarrollismo", desde: 1936, hasta: 1975, icono: "📊" },
  { nombre: "Democracia y Europa", desde: 1975, hasta: 9999, icono: "🇪🇺" },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  medieval: 'Medieval',
  imperial: 'Imperial',
  liberal: 'Liberal',
  industrial: 'Industrial',
  crisis: 'Crisis',
  reformista: 'Reformista',
  transicion: 'Transición',
  crecimiento: 'Crecimiento',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  medieval: '#8D6E63',
  imperial: '#FF8F00',
  liberal: '#FFCA28',
  industrial: '#66BB6A',
  crisis: '#EF5350',
  reformista: '#AB47BC',
  transicion: '#29B6F6',
  crecimiento: '#7CB342',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoEconomia }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'Actualidad' : periodo.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Modelo Económico</h4>
          <ul className={styles.caracteristicasList}>
            <li>{periodo.modelo}</li>
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
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{periodo.descripcion}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = 711;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoEconomia | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoEconomia[][] = [[], [], [], []];
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

  // Marcadores de años
  const marcadores: number[] = [900, 1200, 1500, 1700, 1800, 1900, 1950, 1975, 2000, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el año 711 hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia económica de España"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de años */}
          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{m}</text>
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
                  {w > 50 && (
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
  const anioFinTexto = periodo.anioFin === 9999 ? 'Actualidad' : periodo.anioFin.toString();

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
          <p>{periodo.anioInicio} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">€</span>
            <p>{periodo.modelo}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Modelo Económico</h4>
              <ul className={styles.caracteristicasList}>
                <li>{periodo.modelo}</li>
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
        per.modelo.toLowerCase().includes(termino) ||
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
          style={categoriaFiltro === 'todos' ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' } : {}}
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
        placeholder="Buscar por período, modelo económico o figura histórica..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período económico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Figura clave</th>
              <th>Modelo Económico</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin === 9999 ? 'Actualidad' : per.anioFin.toString();
              return (
                <tr
                  key={per.id}
                  style={i % 2 === 0 ? { background: `${per.color}18` } : {}}
                >
                  <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                  <td>{per.anioInicio}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                      {ETIQUETAS_CATEGORIA[per.categoria]}
                    </span>
                  </td>
                  <td>{per.personas[0]}</td>
                  <td className={styles.modeloCell}>{per.modelo}</td>
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
        Períodos económicos y eventos históricos organizados por eras de la historia de España.
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
                    {era.desde} – {era.hasta === 9999 ? 'hoy' : era.hasta}
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
                      <span className={styles.eraEventoAnio}>{ev.anio}</span>
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

export default function VisualizadorHistoriaEconomiaEspana() {
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
        <h1 className={styles.heroTitle}>Historia Económica de España</h1>
        <p className={styles.heroSubtitle}>
          De la plata americana al euro — 14 períodos con los modelos económicos, figuras clave y hitos que transformaron la economía española en 13 siglos
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
        title="Historia económica de España: modelos y transformaciones"
        subtitle="Cómo la economía española ha cambiado desde la Edad Media hasta los fondos europeos del siglo XXI"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos clave de la historia económica española</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Modelo dominante</th>
                <th>Figura clave</th>
                <th>Hito definitorio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Imperio y Plata</strong></td>
                <td>1469–1600</td>
                <td>Monopolio colonial</td>
                <td>Carlos I</td>
                <td>Potosí y la plata americana</td>
              </tr>
              <tr>
                <td><strong>Reformas Borbónicas</strong></td>
                <td>1700–1808</td>
                <td>Mercantilismo ilustrado</td>
                <td>Carlos III</td>
                <td>Libre comercio con América (1778)</td>
              </tr>
              <tr>
                <td><strong>Primera Industrialización</strong></td>
                <td>1850–1900</td>
                <td>Ferrocarril y textil</td>
                <td>Laureano Figuerola</td>
                <td>Primer ferrocarril (1848)</td>
              </tr>
              <tr>
                <td><strong>Autarquía Franquista</strong></td>
                <td>1939–1959</td>
                <td>Autosuficiencia total</td>
                <td>Suanzes</td>
                <td>Racionamiento y aislamiento internacional</td>
              </tr>
              <tr>
                <td><strong>Desarrollismo</strong></td>
                <td>1959–1975</td>
                <td>Planes de Desarrollo</td>
                <td>Laureano López Rodó</td>
                <td>PIB se multiplica por 5 en 15 años</td>
              </tr>
              <tr>
                <td><strong>Integración Europea</strong></td>
                <td>1986–2007</td>
                <td>Fondos estructurales y euro</td>
                <td>Felipe González</td>
                <td>Acceso al mercado único europeo</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios / Casos de Uso */}
        <h3>Grandes contrastes de la economía española</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Imperio colonial vs. economía actual</strong>
              <p>España controló el mayor Imperio del siglo XVI con plata de América, pero no desarrolló una economía productiva propia. Hoy es la 4ª economía de la eurozona sin depender de materias primas.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🚪</span>
            <div>
              <strong>Autarquía vs. apertura europea</strong>
              <p>El giro de 1959 (Plan de Estabilización) es uno de los cambios económicos más drásticos de la historia española: de la economía cerrada y racionada a abrirse al capital extranjero en un solo decreto.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
            <div>
              <strong>Desarrollismo franquista vs. democracia económica</strong>
              <p>El "milagro español" (1959-1975) creció bajo una dictadura con mano de obra barata. La democracia añadió derechos laborales y el estado del bienestar, cambiando el modelo de crecimiento.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏗️</span>
            <div>
              <strong>Burbuja inmobiliaria vs. Next Generation EU</strong>
              <p>El crash de 2008 fue consecuencia de un modelo basado en la construcción. Los fondos europeos post-COVID buscan reorientar la economía hacia la digitalización y la transición verde.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué España no se industrializó como Inglaterra?</strong>
            <p>La plata americana desincentivó el desarrollo industrial: era más fácil comprar manufacturas en el exterior que producirlas. El Estado gastó más en guerras que en fomentar la industria, y la Mesta (ganadería trashumante) bloqueó la reforma agraria durante siglos. Inglaterra, sin colonias metalíferas, tuvo que innovar para exportar.</p>
            <span className={styles.faqTip}>Paradoja: la abundancia de plata fue la principal causa del atraso industrial español. La riqueza fácil inhibe la innovación.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue el Plan de Estabilización de 1959?</strong>
            <p>Un conjunto de medidas promovido por los tecnócratas del Opus Dei (Ullastres, Navarro Rubio, López Rodó) que acabaron con la autarquía: liberalización de precios, apertura a la inversión extranjera, devaluación de la peseta y reducción del déficit público. En un año, España pasó de la economía más cerrada de Europa occidental a una economía de mercado.</p>
            <span className={styles.faqTip}>El Plan fue impuesto en parte por el FMI como condición para un préstamo. El régimen franquista lo aceptó porque estaba al borde de la bancarrota.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué España entró en crisis en 2008?</strong>
            <p>El modelo de la etapa 1986-2007 descansó excesivamente en la construcción (llegó a representar el 14% del PIB y el 13% del empleo). Los bancos financiaron promotoras y compradores con crédito barato (tipos al 2% del BCE). Cuando la burbuja estalló, el sector financiero quedó insolvente y el desempleo se disparó al 27%.</p>
            <span className={styles.faqTip}>El rescate bancario de 2012 (41.000M€) fue parcialmente devuelto, pero supuso la mayor pérdida de capital público de la historia española.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuánto dinero recibió España de los fondos europeos?</strong>
            <p>Entre 1986 y 2020, España recibió más de 200.000 millones de euros en fondos estructurales y de cohesión de la UE. Con el programa Next Generation EU (2021-2026), España tiene asignados 140.000 millones adicionales (69.500M€ en subvenciones directas y el resto en préstamos). Es la mayor transferencia de capital exterior de la historia española.</p>
            <span className={styles.faqTip}>Los fondos estructurales financiaron autopistas, AVE, universidades y depuradoras. Sin ellos, la brecha de infraestructuras con Europa central habría tardado décadas más en cerrarse.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo superó España el PIB per cápita de la media europea?</strong>
            <p>España rozó la media de la UE-15 hacia 2007, justo antes del crash. Con el euro y los fondos estructurales, el PIB per cápita pasó del 70% de la media comunitaria en 1986 a casi el 100% en 2007. La crisis de 2008 alejó de nuevo a España de esa media. En 2024, el PIB per cápita español ronda el 85% de la media de la UE-27.</p>
            <span className={styles.faqTip}>El AVE Madrid-Sevilla (1992), símbolo de la modernización, fue financiado en un 60% con fondos europeos y costó más de 3.000 millones de euros de la época.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo analizar un período de la historia económica española</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el modelo económico dominante</strong>
              <p>¿Es una economía abierta o cerrada? ¿Basada en materias primas, manufacturas o servicios? ¿Quién controla los precios — el mercado o el Estado? El modelo determina cómo se distribuye la riqueza y qué sectores crecen.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Analiza el papel del Estado y la Hacienda</strong>
              <p>Los Habsburgo quebraron varias veces por financiar guerras con deuda. Franco cerró la economía por ideología. Los tecnócratas de 1959 abrieron por necesidad. Cada modelo económico refleja una elección política sobre el papel del Estado en la economía.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Conecta con el contexto europeo e internacional</strong>
              <p>La economía española siempre ha estado condicionada por el exterior: la plata americana, las guerras napoleónicas, la crisis del 29, el Plan Marshall (del que España quedó excluida), la CEE y el euro. Ningún período es comprensible sin el contexto internacional.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Mira los indicadores de bienestar, no solo el PIB</strong>
              <p>El "milagro español" de los 60 creció con salarios bajos, sin sindicatos libres y con emigración masiva. El PIB crecía pero la distribución era muy desigual. Los indicadores de esperanza de vida, alfabetización y urbanización completan el cuadro que el PIB solo no muestra.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Identifica las semillas de la siguiente crisis</strong>
              <p>El exceso de plata del XVI generó la inflación del XVII. La burbuja inmobiliaria de los 2000 generó la crisis de 2008. Cada período de auge contiene en sí mismo los mecanismos de su futura crisis. Identificarlos es la clave del análisis económico histórico.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la economía española</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏺</span>
            <p>España tuvo el mayor Imperio del mundo en el siglo XVI pero no desarrolló una burguesía comercial ni una industria manufacturera propias. La riqueza se gastaba en guerras, lujo y deuda, no en inversión productiva.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🚂</span>
            <p>El ancho de vía del ferrocarril español (diferente al europeo) fue una decisión estratégica en 1844 para impedir invasiones militares por ferrocarril. Costó cara: durante 150 años dificultó el transporte de mercancías transfronterizo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">☀️</span>
            <p>El turismo fue la principal fuente de divisas durante el desarrollismo franquista (1960-1975). Cada verano, millones de europeos pagaban en marcos y francos lo que España necesitaba para importar maquinaria y petróleo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🇪🇺</span>
            <p>La entrada en la CEE en 1986 transformó la agricultura española: los precios de garantía europeos beneficiaron al olivar, la vid y los cítricos, pero la PAC también limitó la producción de cereales y leche con cuotas.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>⚠️ Sobre las cifras históricas de esta cronología</strong>
          <ul>
            <li>Los datos macroeconómicos históricos son <strong>estimaciones de historiadores económicos</strong>. Las cifras de PIB antes del siglo XX son aproximaciones basadas en fuentes indirectas (registros fiscales, producción agraria, series de precios).</li>
            <li>Las <strong>fechas de inicio y fin</strong> de cada período son convencionales y pueden variar según el criterio del historiador. Los períodos económicos no tienen fronteras tan nítidas como los eventos políticos.</li>
            <li>La comparación de <strong>PIB per cápita</strong> entre épocas distintas requiere ajustar por inflación y diferencias en la composición de la economía — las comparaciones entre siglos son siempre aproximadas.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-economia-espana')} />
      <ShareCard appName="visualizador-historia-economia-espana" />
      <Footer appName="visualizador-historia-economia-espana" />
    </div>
  );
}
