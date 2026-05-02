'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaFotografia.module.css';
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

type Categoria = 'pionera' | 'analogica' | 'color' | 'artistica' | 'digital' | 'movil' | 'ia';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoFotografia {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  soporte: string;
  descripcion: string;
  personas: string[];
  categoria: Categoria;
}

interface EventoHistorico {
  anio: number;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoFotografia[] = [
  { id: 1, nombre: "Los Pioneros", anioInicio: 1826, anioFin: 1851, color: "#8D6E63", soporte: "Heliografía y daguerrotipo", descripcion: "Niépce captura la primera fotografía permanente en 1826. Daguerre presenta el daguerrotipo en 1839. Talbot inventa el calotipo negativo-positivo, base de la fotografía moderna.", personas: ["Joseph Niépce", "Louis Daguerre", "William Henry Fox Talbot"], categoria: "pionera" },
  { id: 2, nombre: "Fotografía de Cristal y Retrato", anioInicio: 1851, anioFin: 1880, color: "#795548", soporte: "Colodión húmedo sobre cristal", descripcion: "El colodión húmedo de Archer permite tiempos de exposición de segundos. Proliferan los estudios de retrato. La fotografía documenta la Guerra Civil americana y la vida cotidiana.", personas: ["Frederick Scott Archer", "Mathew Brady", "Julia Margaret Cameron"], categoria: "analogica" },
  { id: 3, nombre: "Cronofotografía y Movimiento", anioInicio: 1872, anioFin: 1900, color: "#FF8F00", soporte: "Placas secas de gelatina", descripcion: "Muybridge demuestra fotográficamente que los caballos levantan las cuatro patas al galopar. Marey inventa la fusil fotográfico. Las placas secas de gelatina facilitan la fotografía amateur.", personas: ["Eadweard Muybridge", "Étienne-Jules Marey", "George Eastman"], categoria: "analogica" },
  { id: 4, nombre: "Fotografía para Todos", anioInicio: 1900, anioFin: 1925, color: "#FDD835", soporte: "Carrete Kodak 120", descripcion: "Kodak lanza la Brownie a un dólar, democratizando la fotografía. Nace el álbum familiar. Steichen y Stieglitz promueven la fotografía como arte en el movimiento pictorialista.", personas: ["George Eastman", "Alfred Stieglitz", "Edward Steichen"], categoria: "analogica" },
  { id: 5, nombre: "Fotografía de Vanguardia", anioInicio: 1920, anioFin: 1940, color: "#66BB6A", soporte: "Nuevas técnicas experimentales", descripcion: "La Bauhaus experimenta con fotogramas, fotomontajes y ángulos radicales. Man Ray crea los rayogramas. La nueva objetividad alemana documenta la vida moderna con precisión fría.", personas: ["Man Ray", "László Moholy-Nagy", "Albert Renger-Patzsch"], categoria: "analogica" },
  { id: 6, nombre: "Documentalismo y Humanismo", anioInicio: 1936, anioFin: 1960, color: "#26A69A", soporte: "Leica 35mm", descripcion: "La Leica 35mm de mano libera al fotógrafo. Capa cubre la Guerra Civil española. Cartier-Bresson define el 'momento decisivo'. La Farm Security Administration documenta la Gran Depresión.", personas: ["Robert Capa", "Henri Cartier-Bresson", "Dorothea Lange"], categoria: "analogica" },
  { id: 7, nombre: "Color y Fotografía Comercial", anioInicio: 1950, anioFin: 1970, color: "#AB47BC", soporte: "Kodachrome 35mm color", descripcion: "Kodachrome domina la fotografía en color. La publicidad y la moda adoptan la fotografía como lenguaje visual. Life y National Geographic llevan el fotoperiodismo a millones de hogares.", personas: ["Ernst Haas", "William Eggleston", "Irving Penn"], categoria: "color" },
  { id: 8, nombre: "Fotoperiodismo y Guerras", anioInicio: 1965, anioFin: 1985, color: "#EF5350", soporte: "SLR analógica 35mm", descripcion: "La fotografía de Vietnam sacude la opinión pública mundial. Eddie Adams captura la ejecución sumaria. La imagen de la 'niña del napalm' de Nick Ut cambia la percepción de la guerra.", personas: ["Nick Ut", "Eddie Adams", "Sebastião Salgado"], categoria: "analogica" },
  { id: 9, nombre: "Fotografía Artística Contemporánea", anioInicio: 1976, anioFin: 1995, color: "#5C6BC0", soporte: "Gran formato y C-prints", descripcion: "Cindy Sherman cuestiona la identidad con autorretratos. Andreas Gursky crea panorámicas monumentales. La fotografía se consolida en galerías y museos como arte legítimo.", personas: ["Cindy Sherman", "Andreas Gursky", "Jeff Wall"], categoria: "artistica" },
  { id: 10, nombre: "Revolución Digital", anioInicio: 1990, anioFin: 2007, color: "#29B6F6", soporte: "Sensor CCD y JPEG", descripcion: "Kodak lanza la primera cámara digital profesional. Photoshop transforma el retoque. El JPEG comprime y distribuye imágenes. Los periódicos adoptan la fotografía digital eliminando el cuarto oscuro.", personas: ["Steve Sasson", "Thomas Knoll", "John Knoll"], categoria: "digital" },
  { id: 11, nombre: "Fotografía Móvil", anioInicio: 2007, anioFin: 2015, color: "#26C6DA", soporte: "Sensor CMOS smartphone", descripcion: "El iPhone integra una cámara decente en el bolsillo de todos. Instagram lanza en 2010 y reinventa la fotografía social. El selfie se convierte en fenómeno cultural global.", personas: ["Steve Jobs", "Kevin Systrom", "Mike Krieger"], categoria: "movil" },
  { id: 12, nombre: "Fotografía Social y Viral", anioInicio: 2012, anioFin: 2020, color: "#EC407A", soporte: "Redes sociales y filtros", descripcion: "El smartphone supera a la cámara compacta. Los filtros de Instagram y Snapchat transforman la edición. El número de fotos tomadas en 2020 supera el billón al día.", personas: ["Adam Mosseri", "Evan Spiegel", "Tim Hetherington"], categoria: "movil" },
  { id: 13, nombre: "Fotografía Computacional", anioInicio: 2016, anioFin: 2022, color: "#7CB342", soporte: "IA en hardware de cámara", descripcion: "Google Pixel introduce el modo Night Sight con IA. Apple aplica apilado de imágenes para HDR. La computación mejora fotos en tiempo real sin acción del usuario.", personas: ["Marc Levoy", "Sergio Orts Escolano", "Bill Dally"], categoria: "ia" },
  { id: 14, nombre: "IA Generativa en Imagen", anioInicio: 2022, anioFin: 9999, color: "#FF5722", soporte: "Modelos de difusión y GANs", descripcion: "Midjourney, DALL-E y Stable Diffusion generan imágenes fotorrealistas desde texto. La distinción entre fotografía real e imagen sintética se difumina. Nace el debate sobre autoría e identidad visual.", personas: ["David Holz", "Sam Altman", "Robin Rombach"], categoria: "ia" },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1826, descripcion: "Niépce captura 'Vista desde la ventana en Le Gras': primera fotografía permanente" },
  { anio: 1839, descripcion: "Daguerre presenta el daguerrotipo a la Academia francesa: nace la fotografía" },
  { anio: 1878, descripcion: "Muybridge fotografía el galope del caballo, demostrando el movimiento" },
  { anio: 1900, descripcion: "Kodak Brownie a 1 dólar democratiza la fotografía para todos" },
  { anio: 1936, descripcion: "Capa captura 'Muerte de un miliciano': el fotoperiodismo llega a su cénit" },
  { anio: 1975, descripcion: "Kodak crea el primer prototipo de cámara digital (Steven Sasson)" },
  { anio: 2010, descripcion: "Instagram lanza la fotografía social con filtros: 1 millón de usuarios en 2 meses" },
  { anio: 2016, descripcion: "Google Pixel introduce la fotografía computacional con IA en smartphones" },
  { anio: 2022, descripcion: "Midjourney y DALL-E generan imágenes fotorrealistas desde texto" },
];

const ERAS = [
  { nombre: "Fotografía Pionera", desde: 1826, hasta: 1880, icono: "📷" },
  { nombre: "Industrialización", desde: 1880, hasta: 1920, icono: "🏭" },
  { nombre: "Vanguardia y Documentalismo", desde: 1920, hasta: 1960, icono: "📰" },
  { nombre: "Color y Comercialización", desde: 1960, hasta: 1990, icono: "🎨" },
  { nombre: "Revolución Digital", desde: 1990, hasta: 2010, icono: "💾" },
  { nombre: "IA y Fotografía Computacional", desde: 2010, hasta: 9999, icono: "🤖" },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  pionera: 'Pionera',
  analogica: 'Analógica',
  color: 'Color',
  artistica: 'Artística',
  digital: 'Digital',
  movil: 'Móvil',
  ia: 'IA',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  pionera: '#8D6E63',
  analogica: '#FF8F00',
  color: '#AB47BC',
  artistica: '#5C6BC0',
  digital: '#29B6F6',
  movil: '#26C6DA',
  ia: '#FF5722',
};

// ─────────────────────────────────────────────
// Constantes SVG
// ─────────────────────────────────────────────

const AÑO_MIN = 1826;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoFotografia }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'Actualidad' : periodo.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Soporte Fotográfico</h4>
          <p className={styles.soporteTexto}>{periodo.soporte}</p>
          <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Descripción</h4>
          <p className={styles.descripcionTexto}>{periodo.descripcion}</p>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Personas clave</h4>
          <ul className={styles.artistasList}>
            {periodo.personas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoFotografia | null>(null);

  const filas: PeriodoFotografia[][] = [[], [], [], []];
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

  const marcadores: number[] = [1850, 1875, 1900, 1925, 1950, 1975, 2000, 2015];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1826 hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la fotografía"
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
          <div className={styles.soporteDestacado}>
            <span className={styles.soporteIcono} aria-hidden="true">📷</span>
            <p><strong>Soporte:</strong> {periodo.soporte}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Descripción</h4>
              <p className={styles.descripcionTexto}>{periodo.descripcion}</p>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Personas clave</h4>
              <ul className={styles.artistasList}>
                {periodo.personas.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
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
        per.soporte.toLowerCase().includes(termino) ||
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
        placeholder="Buscar por período, soporte o persona..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período fotográfico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Soporte Fotográfico</th>
              <th>Persona clave</th>
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
                  <td className={styles.peliculaCell}>{per.soporte}</td>
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
        Períodos fotográficos y eventos históricos organizados por eras.
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

export default function VisualizadorHistoriaFotografia() {
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
        <h1 className={styles.heroTitle}>Historia de la Fotografía</h1>
        <p className={styles.heroSubtitle}>
          Del daguerrotipo a la IA generativa — 14 períodos con soportes, personas clave y hitos que transformaron la imagen fija durante 200 años
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
        title="Historia de la fotografía: técnica, arte y revolución visual"
        subtitle="Cómo la imagen fija evolucionó de experimento químico a fenómeno global e inteligencia artificial"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos clave de la historia de la fotografía</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Soporte</th>
                <th>Persona clave</th>
                <th>Hito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Los Pioneros</strong></td>
                <td>1826–1851</td>
                <td>Daguerrotipo</td>
                <td>Louis Daguerre</td>
                <td>Primera fotografía permanente</td>
              </tr>
              <tr>
                <td><strong>Fotografía para Todos</strong></td>
                <td>1900–1925</td>
                <td>Carrete Kodak 120</td>
                <td>George Eastman</td>
                <td>Kodak Brownie a 1 dólar</td>
              </tr>
              <tr>
                <td><strong>Documentalismo y Humanismo</strong></td>
                <td>1936–1960</td>
                <td>Leica 35mm</td>
                <td>Henri Cartier-Bresson</td>
                <td>El 'momento decisivo'</td>
              </tr>
              <tr>
                <td><strong>Color y Fotografía Comercial</strong></td>
                <td>1950–1970</td>
                <td>Kodachrome 35mm</td>
                <td>William Eggleston</td>
                <td>El color como lenguaje artístico</td>
              </tr>
              <tr>
                <td><strong>Revolución Digital</strong></td>
                <td>1990–2007</td>
                <td>Sensor CCD y JPEG</td>
                <td>Steve Sasson</td>
                <td>Primera cámara digital Kodak</td>
              </tr>
              <tr>
                <td><strong>IA Generativa en Imagen</strong></td>
                <td>2022–actualidad</td>
                <td>Modelos de difusión</td>
                <td>David Holz</td>
                <td>Imágenes fotorrealistas desde texto</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios comparativos */}
        <h3>Grandes debates en la historia de la fotografía</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎞️</span>
            <div>
              <strong>Analógica vs Digital</strong>
              <p>El debate entre quienes defienden la calidez y el proceso químico del analógico frente a la precisión, inmediatez y edición ilimitada del digital lleva más de 30 años sin resolverse. Ambos conviven en el mercado actual.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📰</span>
            <div>
              <strong>Documental vs Artística</strong>
              <p>¿Debe la fotografía reflejar la realidad fielmente o puede manipularla en busca de expresión artística? Esta tensión entre Cartier-Bresson y Man Ray define dos tradiciones que aún coexisten.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
            <div>
              <strong>Fotógrafo vs Smartphone</strong>
              <p>El smartphone con IA ha democratizado la fotografía al punto de que cualquier persona puede capturar imágenes técnicamente perfectas. ¿Qué distingue entonces al fotógrafo profesional del usuario casual?</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
            <div>
              <strong>Fotografía real vs IA generativa</strong>
              <p>Midjourney y DALL-E generan imágenes que parecen fotografías sin que ninguna cámara haya capturado nada. La distinción entre documento visual y creación sintética está en su punto más crítico de la historia.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Quién inventó la fotografía?</strong>
            <p>Depende de cómo se defina "inventar". Joseph Niépce capturó la primera imagen fotográfica permanente en 1826, pero tardaba 8 horas de exposición. Louis Daguerre presentó el daguerrotipo en 1839 con tiempos mucho menores y es quien aparece en la historia oficial. William Henry Fox Talbot inventó el proceso negativo-positivo, base de toda la fotografía posterior con carrete.</p>
            <span className={styles.faqTip}>Curiosidad: el gobierno francés compró la patente del daguerrotipo y la ofreció "libre al mundo" — excepto en Gran Bretaña, donde Daguerre la patentó.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo murió el carrete fotográfico?</strong>
            <p>Kodak anunció el fin de la producción de Kodachrome en 2009, marcando el cierre simbólico de la era analógica. Sin embargo, el carrete no está muerto: empresas como Kodak Alaris y Fujifilm siguen fabricando película analógica, y el mercado de fotografía analógica ha crecido entre jóvenes desde 2015. La muerte del analógico resultó ser una resurrección hipster.</p>
            <span className={styles.faqTip}>Paradoja: hay más variedad de películas analógicas disponibles en 2024 que en el año 2000, cuando el digital empezaba a dominar.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es Instagram fotografía de verdad?</strong>
            <p>Desde la perspectiva técnica, sí: el smartphone captura fotones y los convierte en datos. Desde la perspectiva artística, es más complejo: los filtros de Instagram son una extensión de la tradición del laboratorio oscuro donde los fotógrafos siempre manipularon sus imágenes. Ansel Adams manipulaba enormemente sus negativos. La diferencia es la automatización y la escala masiva.</p>
            <span className={styles.faqTip}>Kevin Systrom, fundador de Instagram, estudió fotografía y diseñó los filtros inspirándose en la estética de la película Kodachrome.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Las fotos de IA son fotografía?</strong>
            <p>No en el sentido etimológico (fotografía = "escritura de luz"): ninguna cámara captura luz. Son síntesis estadísticas de patrones aprendidos de millones de fotografías reales. Algunos argumentan que es una nueva categoría — "imagen sintética" — mientras otros la consideran una extensión del fotomontaje digital. Los concursos fotográficos están actualizando sus bases para aclarar qué aceptan.</p>
            <span className={styles.faqTip}>En 2023, un fotógrafo ganó un concurso con una imagen generada por IA y luego rechazó el premio para señalar el debate sobre autenticidad.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Tiene futuro la fotografía analógica?</strong>
            <p>Sí, como nicho estético y creativo. El proceso analógico —revelar, positivar, la incertidumbre del resultado— ofrece una experiencia que el digital no puede replicar. Polaroid, Lomography y Kodak Film han relanzado productos con éxito. Igual que el vinilo convive con el streaming, el analógico convive con el digital. Lo que cambió es que dejó de ser el medio principal.</p>
            <span className={styles.faqTip}>Fujifilm es una de las pocas empresas que ganó dinero con la fotografía analógica mientras el mercado colapsaba: pivotó hacia cosméticos y películas de instax.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo estudiar un período de la historia de la fotografía</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el soporte técnico del período</strong>
              <p>Cada período fotográfico está definido por su soporte: daguerrotipo, colodión, carrete 35mm, sensor digital. La tecnología no es solo técnica — determina quién puede fotografiar, qué puede capturarse y cómo se distribuyen las imágenes. El JPEG hizo posible Internet visual; el smartphone hizo posible Instagram.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Busca al menos una imagen icónica del período</strong>
              <p>Ningún texto sustituye ver la "Vista desde la ventana en Le Gras" de Niépce, la "Migrant Mother" de Lange o la "Niña del napalm" de Nick Ut. Las imágenes icónicas concentran en un solo fotograma toda la poética y los dilemas éticos de su época. Analízalas con calma: composición, luz, contexto de producción.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Entiende quién tenía acceso a la fotografía</strong>
              <p>En 1850, solo fotógrafos profesionales con equipo pesado podían fotografiar. En 1900, la Brownie lo hizo accesible a la clase media. En 2007, cualquier persona con un iPhone podía fotografiar en todo momento. La democratización del acceso define qué se fotografía, quién aparece y qué queda fuera del archivo visual de la historia.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta la fotografía con los movimientos artísticos de su época</strong>
              <p>El pictorialismo fotográfico de principios del siglo XX dialoga con el impresionismo pictórico. La fotografía de vanguardia de los años 20 es inseparable de la Bauhaus y el surrealismo. La fotografía conceptual de los 70 responde al arte conceptual. La fotografía nunca ha existido en un vacío artístico.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Estudia el impacto social y político de las imágenes del período</strong>
              <p>La "Migrant Mother" de Lange movilizó ayuda federal durante la Gran Depresión. La foto de la niña del napalm aceleró el final de la guerra de Vietnam. Las fotos de Abu Ghraib redefinieron el debate sobre la tortura. Cada período tiene imágenes que cambiaron el curso de los hechos — no solo los documentaron.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Consejos para ver fotografía con perspectiva histórica</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <p>Cuando veas una fotografía histórica, pregúntate qué no está en el encuadre. La fotografía es tanto una decisión de inclusión como de exclusión. Lo que el fotógrafo eligió no mostrar es tan significativo como lo que sí aparece.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Los períodos se solapan deliberadamente: el fotoperiodismo analógico existía durante la revolución digital. Las fechas indican cuándo un enfoque dominó el debate, no cuándo el anterior desapareció por completo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>La historia de la fotografía occidental no es la historia completa. La fotografía japonesa (Daido Moriyama), latinoamericana (Sebastião Salgado) y africana tienen tradiciones y estéticas propias que merecen estudio independiente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p>La "objetividad" de la fotografía es un mito construido. Desde el primer daguerrotipo, el fotógrafo elige ángulo, luz, momento y encuadre. Tratar una fotografía como "prueba objetiva" sin considerar su contexto de producción es un error de comprensión histórica.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>⚠️ La IA generativa puede crear imágenes fotorrealistas falsas. Verifica siempre la fuente de imágenes impactantes antes de compartirlas.</strong>
          <ul>
            <li>Midjourney, DALL-E y Stable Diffusion generan imágenes que parecen fotografías reales sin que ninguna cámara haya capturado nada — comprúeba la fuente en imágenes de noticias o eventos que no hayas visto en medios verificados.</li>
            <li>Los <strong>deepfakes de personas reales</strong> son técnicamente fotografía computacional y pueden crear evidencias visuales falsas de eventos que nunca ocurrieron.</li>
            <li>Herramientas como <strong>Google Lens, TinEye o FotoForensics</strong> pueden ayudar a verificar la autenticidad de una imagen o encontrar su fuente original.</li>
            <li>Los <strong>metadatos EXIF</strong> de una fotografía real registran cámara, fecha, hora y coordenadas GPS — las imágenes generadas por IA no los tienen o los tienen falsificados.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-fotografia')} />
      <ShareCard appName="visualizador-historia-fotografia" />
      <Footer appName="visualizador-historia-fotografia" />
    </div>
  );
}
