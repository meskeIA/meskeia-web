'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaTeatro.module.css';
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

type Categoria = 'clasico' | 'medieval' | 'renacentista' | 'moderno' | 'contemporaneo' | 'digital';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoTeatro {
  id: number;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  color: string;
  forma: string;
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

const PERIODOS: PeriodoTeatro[] = [
  { id: 1, nombre: "Teatro Griego Clásico", anioInicio: -534, anioFin: -300, color: "#3F51B5", forma: "Tragedia y comedia con coro", descripcion: "Tespis introduce el primer actor (534 a.C.). Esquilo, Sófocles y Eurípides definen la tragedia. Aristófanes la comedia. Los festivales de Dioniso reúnen a toda la polis ateniense.", personas: ["Esquilo", "Sófocles", "Aristófanes"], categoria: "clasico" },
  { id: 2, nombre: "Teatro Romano", anioInicio: -240, anioFin: 400, color: "#5C6BC0", forma: "Comedia de costumbres y pantomima", descripcion: "Plauto y Terencio adaptan la comedia griega al público romano. Los anfiteatros al aire libre dan paso a teatros cubiertos. La pantomima y los espectáculos de gladiadores compiten con el drama.", personas: ["Plauto", "Terencio", "Séneca"], categoria: "clasico" },
  { id: 3, nombre: "Teatro Medieval", anioInicio: 900, anioFin: 1400, color: "#7E57C2", forma: "Misterios y moralidades", descripcion: "La Iglesia usa el drama litúrgico para enseñar la Biblia. Emergen los misterios (ciclos de Navidad y Pascua), las moralidades (Everyman) y las farsas populares en las ferias.", personas: ["Hrotsvitha de Gandersheim"], categoria: "medieval" },
  { id: 4, nombre: "Commedia dell'Arte", anioInicio: 1545, anioFin: 1650, color: "#9C27B0", forma: "Improvisación con máscaras fijas", descripcion: "Compañías italianas itinerantes crean personajes fijos: Arlecchino, Pantalone, Colombina. La improvisación, las máscaras y el juego físico influyen en toda la comedia europea posterior.", personas: ["Isabella Andreini", "Flaminio Scala"], categoria: "renacentista" },
  { id: 5, nombre: "Teatro Isabelino y Barroco Español", anioInicio: 1576, anioFin: 1680, color: "#E91E63", forma: "Verso dramático y tragicomedia", descripcion: "Shakespeare escribe Hamlet, Macbeth y El rey Lear en el Globe Theatre. En España, Lope de Vega y Calderón crean el corral de comedias y el teatro de los siglos de oro.", personas: ["William Shakespeare", "Lope de Vega", "Calderón de la Barca"], categoria: "renacentista" },
  { id: 6, nombre: "Teatro Neoclásico", anioInicio: 1660, anioFin: 1789, color: "#F44336", forma: "Unidades aristotélicas y decoro", descripcion: "Molière define la gran comedia francesa. Racine perfecciona la tragedia. Las academias imponen las tres unidades aristotélicas: acción, tiempo y lugar. El teatro se vuelve cortesano y regulado.", personas: ["Molière", "Jean Racine", "Pierre Corneille"], categoria: "moderno" },
  { id: 7, nombre: "Romanticismo y Melodrama", anioInicio: 1789, anioFin: 1850, color: "#FF5722", forma: "Emoción y espectáculo popular", descripcion: "Victor Hugo rompe las unidades en Hernani (1830). El melodrama apela a las emociones del público popular. Los teatros multiplican efectos especiales: trampillas, telas de seda, luz de gas.", personas: ["Victor Hugo", "Friedrich Schiller", "Alexandre Dumas"], categoria: "moderno" },
  { id: 8, nombre: "Realismo y Naturalismo", anioInicio: 1850, anioFin: 1910, color: "#FF9800", forma: "Cuarta pared y habla cotidiana", descripcion: "Ibsen plantea problemas sociales reales (Casa de muñecas). Chéjov introduce el subtexto y los silencios significativos. Stanislavski desarrolla el 'método' para la actuación realista.", personas: ["Henrik Ibsen", "Antón Chéjov", "Konstantín Stanislavski"], categoria: "moderno" },
  { id: 9, nombre: "Vanguardias Teatrales", anioInicio: 1900, anioFin: 1940, color: "#FFCA28", forma: "Ruptura del realismo y distanciamiento", descripcion: "Brecht introduce el efecto de distanciamiento (Verfremdungseffekt) para que el público piense críticamente. Artaud propone el 'teatro de la crueldad' que ataque los sentidos.", personas: ["Bertolt Brecht", "Antonin Artaud", "Vsevolod Meyerhold"], categoria: "contemporaneo" },
  { id: 10, nombre: "Teatro del Absurdo", anioInicio: 1950, anioFin: 1970, color: "#8BC34A", forma: "Sin lógica causal ni resolución", descripcion: "Beckett escribe Esperando a Godot donde nada pasa dos veces. Ionesco lleva el lenguaje al absurdo en La cantante calva. El teatro existencialista refleja la angustia de posguerra.", personas: ["Samuel Beckett", "Eugène Ionesco", "Harold Pinter"], categoria: "contemporaneo" },
  { id: 11, nombre: "Teatro Físico y Performance", anioInicio: 1960, anioFin: 1985, color: "#26A69A", forma: "Cuerpo como lenguaje primario", descripcion: "Grotowski crea el 'teatro pobre' eliminando la escenografía. El Living Theatre disuelve la separación actor-público. Bob Wilson usa duraciones extremas y imágenes visuales sobre texto.", personas: ["Jerzy Grotowski", "Peter Brook", "Robert Wilson"], categoria: "contemporaneo" },
  { id: 12, nombre: "Teatro Posmoderno y Posdramático", anioInicio: 1980, anioFin: 2000, color: "#29B6F6", forma: "Deconstrucción y metateatralidad", descripcion: "Lehmann teoriza el 'teatro posdramático' donde el texto pierde su supremacía. Pina Bausch crea el Tanztheater mezclando danza y teatro. La metateatralidad y la intertextualidad dominan.", personas: ["Pina Bausch", "Hans-Thies Lehmann", "Heiner Müller"], categoria: "contemporaneo" },
  { id: 13, nombre: "Teatro Social y Comunitario", anioInicio: 1985, anioFin: 2010, color: "#EC407A", forma: "Teatro del oprimido y participativo", descripcion: "Augusto Boal desarrolla el Teatro del Oprimido y el teatro-foro donde el público interviene. El teatro comunitario usa el drama para el cambio social en barrios marginados y zonas de conflicto.", personas: ["Augusto Boal", "Anne Bogart", "Luk Perceval"], categoria: "contemporaneo" },
  { id: 14, nombre: "Teatro Digital e Inmersivo", anioInicio: 2000, anioFin: 9999, color: "#78909C", forma: "Experiencia inmersiva y tecnología", descripcion: "Punchdrunk inventa el teatro inmersivo (Sleep No More). El streaming durante el COVID-19 lleva el teatro a hogares globalmente. La realidad virtual y la IA crean nuevas formas de experiencia escénica.", personas: ["Felix Barrett", "Katie Mitchell", "Simon McBurney"], categoria: "digital" },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -534, descripcion: "Tespis gana el primer concurso de teatro en Atenas: nace el teatro occidental" },
  { anio: -458, descripcion: "Esquilo presenta la Orestíada, primera trilogía trágica completa conservada" },
  { anio: 1576, descripcion: "James Burbage construye 'The Theatre', primer edificio teatral permanente en Londres" },
  { anio: 1599, descripcion: "Abre el Globe Theatre: Shakespeare escribe Hamlet, Otelo y Lear para este escenario" },
  { anio: 1830, descripcion: "Estreno de Hernani de Victor Hugo: batalla romántica contra el neoclasicismo" },
  { anio: 1879, descripcion: "Ibsen estrena Casa de muñecas: el teatro realista sacude la moral burguesa europea" },
  { anio: 1928, descripcion: "Brecht estrena La ópera de tres centavos: el teatro épico revoluciona la escena" },
  { anio: 1953, descripcion: "Beckett estrena Esperando a Godot: nace el teatro del absurdo" },
  { anio: 2003, descripcion: "Punchdrunk crea Sleep No More en Londres: el teatro inmersivo conquista el mundo" },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  clasico: 'Clásico',
  medieval: 'Medieval',
  renacentista: 'Renacentista',
  moderno: 'Moderno',
  contemporaneo: 'Contemporáneo',
  digital: 'Digital',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  clasico: '#3F51B5',
  medieval: '#7E57C2',
  renacentista: '#E91E63',
  moderno: '#FF5722',
  contemporaneo: '#26A69A',
  digital: '#78909C',
};

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: "Antigüedad Clásica", desde: -534, hasta: 400, icono: "🏛️" },
  { nombre: "Edad Media", desde: 400, hasta: 1500, icono: "⛪" },
  { nombre: "Renacimiento y Barroco", desde: 1500, hasta: 1700, icono: "🎭" },
  { nombre: "Ilustración y Romanticismo", desde: 1700, hasta: 1850, icono: "🕯️" },
  { nombre: "Teatro Moderno", desde: 1850, hasta: 1960, icono: "🎪" },
  { nombre: "Teatro Contemporáneo y Digital", desde: 1960, hasta: 9999, icono: "💻" },
];

// ─────────────────────────────────────────────
// Constantes SVG
// ─────────────────────────────────────────────

const AÑO_MIN = -500;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoTeatro }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Forma teatral</h4>
          <ul className={styles.caracteristicasList}>
            <li>{periodo.forma}</li>
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

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoTeatro | null>(null);

  const filas: PeriodoTeatro[][] = [[], [], [], []];
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

  const siglos: number[] = [-500, -300, -100, 200, 500, 800, 1100, 1400, 1700, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el 500 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de períodos del teatro"
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
            <span className={styles.preguntaIcono} aria-hidden="true">🎭</span>
            <p><strong>Forma teatral:</strong> {periodo.forma}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Figuras clave</h4>
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
        per.forma.toLowerCase().includes(termino);
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
        placeholder="Buscar por período, figura o forma teatral..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período teatral"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Fechas</th>
              <th>Categoría</th>
              <th>Figura clave</th>
              <th>Forma Teatral</th>
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
                  <td className={styles.preguntaCell}>{per.forma}</td>
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
        Períodos teatrales y eventos históricos organizados por eras.
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

export default function VisualizadorHistoriaTeatro() {
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
        <h1 className={styles.heroTitle}>Historia del Teatro</h1>
        <p className={styles.heroSubtitle}>
          Del teatro griego al teatro inmersivo — 14 períodos con formas teatrales, figuras clave y contexto histórico
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
        title="Historia del teatro: 2.500 años de escena"
        subtitle="Cómo el teatro ha evolucionado desde los festivales griegos hasta las experiencias inmersivas digitales"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos teatrales fundamentales</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Fechas</th>
                <th>Forma Teatral</th>
                <th>Figura clave</th>
                <th>Obra emblemática</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Teatro Griego</strong></td>
                <td>534–300 a.C.</td>
                <td>Tragedia con coro</td>
                <td>Sófocles</td>
                <td>Edipo Rey</td>
              </tr>
              <tr>
                <td><strong>Teatro Isabelino</strong></td>
                <td>1576–1680</td>
                <td>Verso dramático</td>
                <td>Shakespeare</td>
                <td>Hamlet</td>
              </tr>
              <tr>
                <td><strong>Neoclásico</strong></td>
                <td>1660–1789</td>
                <td>Unidades aristotélicas</td>
                <td>Molière</td>
                <td>El misántropo</td>
              </tr>
              <tr>
                <td><strong>Realismo</strong></td>
                <td>1850–1910</td>
                <td>Cuarta pared</td>
                <td>Ibsen</td>
                <td>Casa de muñecas</td>
              </tr>
              <tr>
                <td><strong>Teatro del Absurdo</strong></td>
                <td>1950–1970</td>
                <td>Sin lógica causal</td>
                <td>Beckett</td>
                <td>Esperando a Godot</td>
              </tr>
              <tr>
                <td><strong>Teatro Inmersivo</strong></td>
                <td>2000–presente</td>
                <td>Experiencia participativa</td>
                <td>Felix Barrett</td>
                <td>Sleep No More</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Casos de Uso */}
        <h3>Teatro griego vs. romano, Shakespeare vs. Calderón, Brecht vs. Stanislavski, presencial vs. streaming</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Teatro griego vs. romano</strong>
              <p>El teatro griego era cívico y religioso: un deber ciudadano en los festivales de Dioniso. El romano buscaba el entretenimiento masivo, compitiendo con los gladiadores. Los griegos crearon la tragedia; los romanos perfeccionaron la comedia de costumbres y la pantomima.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎭</span>
            <div>
              <strong>Shakespeare vs. Calderón de la Barca</strong>
              <p>Ambos escriben en el mismo siglo (finales del XVI) sin conocerse, y comparten el verso dramático, la mezcla de géneros y la exploración del poder. Shakespeare aborda más la psicología individual; Calderón profundiza en el honor, la fe y la filosofía en obras como La vida es sueño.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎬</span>
            <div>
              <strong>Brecht vs. Stanislavski</strong>
              <p>Stanislavski quiere que el actor viva la emoción del personaje para que el espectador empatice. Brecht quiere lo contrario: que el actor recuerde que es un actor, y que el espectador piense en lugar de sentir. Son los dos polos metodológicos del teatro del siglo XX.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📱</span>
            <div>
              <strong>Teatro presencial vs. streaming</strong>
              <p>El COVID-19 forzó al teatro a migrar a plataformas digitales. El debate sobre si un espectáculo grabado es teatro sigue abierto: el teatro vive del riesgo del directo y la presencia física compartida. El streaming amplía el acceso pero cambia radicalmente la experiencia.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué es el teatro del absurdo?</strong>
            <p>El teatro del absurdo surge en la posguerra como respuesta a la angustia existencial tras las guerras mundiales. Beckett, Ionesco y Pinter crean obras donde los personajes esperan sin propósito, los diálogos se repiten sin lógica y el lenguaje falla como instrumento de comunicación. No es un teatro de ideas vacías: es la forma que toma la idea de que la existencia humana carece de sentido inherente.</p>
            <span className={styles.faqTip}>Empieza con Esperando a Godot de Beckett: dos actos en los que literalmente no pasa nada, y sin embargo es imposible no sentirse identificado.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Sigue siendo relevante el teatro en la era digital?</strong>
            <p>Más que nunca, precisamente porque es lo opuesto a lo digital: el teatro ocurre una vez, en un tiempo y lugar únicos, con cuerpos presentes que se afectan mutuamente. La pantalla separa; el teatro une. El crecimiento del teatro inmersivo, el teatro site-specific y las experiencias participativas muestra que el público sigue buscando lo que las pantallas no pueden dar: la presencia física compartida.</p>
            <span className={styles.faqTip}>El teatro comunitario en zonas de conflicto (Palestina, Bosnia, Colombia) demuestra que el teatro sigue siendo una herramienta de transformación social insustituible.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia al método Stanislavski del distanciamiento de Brecht?</strong>
            <p>Stanislavski desarrolla técnicas para que el actor acceda a sus emociones reales y construya una vida interior para el personaje. El espectador debe olvidar que está viendo una obra y vivir la ficción. Brecht quiere que el actor muestre el personaje sin fundirse con él, usando carteles, canciones y rupturas de la ilusión para recordar al público que está viendo teatro, no realidad. El objetivo de Brecht es el pensamiento crítico; el de Stanislavski, la empatía emocional.</p>
            <span className={styles.faqTip}>La mayoría de los actores contemporáneos mezclan ambas metodologías según el proyecto.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el teatro posdramático?</strong>
            <p>El término fue acuñado por Hans-Thies Lehmann en 1999. El teatro posdramático abandona la supremacía del texto dramático: el director, el cuerpo de los actores, el espacio y la música se vuelven autónomos. Pina Bausch mezcla danza y teatro sin texto; Robert Wilson usa imágenes visuales durante horas. No hay "argumento" en el sentido tradicional: la experiencia es el contenido.</p>
            <span className={styles.faqTip}>El teatro posdramático no es difícil de ver si vas sin expectativas narrativas. Deja que las imágenes y el tiempo actúen sobre ti.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puede la IA escribir obras de teatro?</strong>
            <p>La IA puede generar textos dramáticos técnicamente correctos, pero el teatro surge de la experiencia corporal, el conflicto emocional y la presencia física compartida. Lo que la IA no puede replicar es el riesgo: un actor en escena puede fallar, puede ser afectado por el público, puede improvisar. Esa vulnerabilidad es la esencia del teatro. Las herramientas de IA más interesantes en teatro se usan para generar entornos inmersivos o interacciones en tiempo real, no para reemplazar la escritura dramática humana.</p>
            <span className={styles.faqTip}>Varios experimentos de teatro generativo con IA ya están en marcha: el debate no es si puede hacerlo, sino si el resultado sigue siendo teatro.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo empezar a ver teatro si eres nuevo espectador</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por el teatro que ya conoces</strong>
              <p>Si has visto adaptaciones cinematográficas de Shakespeare, musicales o series de época, ya tienes referencias. Busca una producción local de una obra que conozcas: la familiaridad con la historia te permite concentrarte en la puesta en escena y la actuación.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Lee el texto antes de ver la obra</strong>
              <p>Para el teatro clásico (Shakespeare, Molière, Lorca), leer el texto antes te permite seguir los matices del lenguaje en escena. Para el teatro contemporáneo, es preferible ir sin expectativas: deja que la puesta en escena te sorprenda.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Presta atención al espacio y los cuerpos</strong>
              <p>El teatro no es solo diálogo: observa cómo se mueven los actores, cómo usan el espacio, qué dice la iluminación, cómo los silencios generan tensión. Estas herramientas son tan importantes como las palabras.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Explora géneros diferentes</strong>
              <p>Si empezaste con comedia, prueba la tragedia. Si conoces el teatro realista, ve a ver algo experimental o inmersivo. Cada género activa emociones y formas de atención distintas. La diversidad de experiencias amplía tu capacidad como espectador.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Habla de la obra después de verla</strong>
              <p>El teatro es fundamentalmente colectivo: su significado se completa en la conversación. Compartir lo que te afectó, lo que no entendiste o lo que te pareció brillante es parte de la experiencia. Los coloquios post-función con el equipo creativo son una forma excepcional de profundizar.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para explorar la historia del teatro</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <p>El teatro existe en el tiempo: leer los textos es valioso, pero no es lo mismo que verlos representados. Un montaje puede transformar radicalmente el sentido de una obra clásica.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>El teatro occidental que conocemos es solo una parte de la historia teatral global. El teatro Nō japonés, el Kathakali indio y el teatro de sombras chino son tradiciones igualmente ricas y antiguas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>Las influencias viajan en todas las direcciones: la Commedia dell'Arte italiana influye en Molière, que influye en el vodevil americano, que influye en los sitcoms de televisión. El teatro popular y el culto siempre se han nutrido mutuamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎪</span>
            <p>El teatro siempre ha sido políticamente comprometido: desde las tragedias griegas que debatían la justicia hasta el Teatro del Oprimido de Boal que da voz a los marginados. El teatro neutral no existe.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>⚠️ Las fechas de muchas obras del teatro antiguo son aproximadas. Los textos griegos que conservamos representan solo una fracción de las obras escritas.</strong>
          <ul>
            <li>De los más de mil títulos que se atribuyen a los dramaturgos griegos, solo sobreviven 33 tragedias completas y 11 comedias. El resto se perdió en los incendios de las bibliotecas y el paso del tiempo.</li>
            <li>Las fechas de nacimiento de la mayoría de dramaturgos anteriores al siglo XVII son aproximaciones basadas en referencias indirectas en otras obras o documentos.</li>
            <li>Muchos períodos teatrales se solapan cronológicamente: el naturalismo y las vanguardias convivieron durante décadas, y el realismo sigue siendo la forma dominante en el teatro comercial contemporáneo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-teatro')} />
      <ShareCard appName="visualizador-historia-teatro" />
      <Footer appName="visualizador-historia-teatro" />
    </div>
  );
}
