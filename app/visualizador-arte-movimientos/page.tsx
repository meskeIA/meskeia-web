'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './ArteMovimientos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Categoria = 'medieval' | 'renacimiento' | 'barroco' | 'moderno' | 'contemporaneo' | 'vanguardia';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface MovimientoArte {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  caracteristicas: string[];
  artistas: string[];
  obraIconica: string;
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MOVIMIENTOS: MovimientoArte[] = [
  { id: 'romanico', nombre: 'Románico', anioInicio: 1000, anioFin: 1200, categoria: 'medieval', caracteristicas: ['Arcos de medio punto', 'Muros gruesos', 'Arte religioso', 'Escasa luz interior'], artistas: ['Anónimos monjes', 'Maestro Mateo'], obraIconica: 'Pórtico de la Gloria — Maestro Mateo (1188)', contexto: 'Arte de la Europa cristiana medieval, centrado en iglesias y monasterios.', color: '#8B6914' },
  { id: 'gotico', nombre: 'Gótico', anioInicio: 1150, anioFin: 1400, categoria: 'medieval', caracteristicas: ['Arcos ojivales', 'Vitrales de colores', 'Altura y luz', 'Catedrales como cielo en la tierra'], artistas: ['Giotto', 'Jan van Eyck'], obraIconica: 'Catedral de Notre-Dame de París (1163–1345)', contexto: 'Surgió en Francia y se extendió por Europa como expresión de fe y poder de la Iglesia.', color: '#4A5568' },
  { id: 'renacimiento', nombre: 'Renacimiento', anioInicio: 1400, anioFin: 1550, categoria: 'renacimiento', caracteristicas: ['Perspectiva lineal', 'Anatomía realista', 'Humanismo', 'Recuperación de la Antigüedad clásica'], artistas: ['Leonardo da Vinci', 'Miguel Ángel', 'Rafael', 'Botticelli'], obraIconica: 'La Gioconda — Leonardo da Vinci (1503–1519)', contexto: 'Florece en Italia con el mecenazgo de los Médici; el ser humano como medida de todas las cosas.', color: '#D4A017' },
  { id: 'manierismo', nombre: 'Manierismo', anioInicio: 1520, anioFin: 1600, categoria: 'renacimiento', caracteristicas: ['Figuras alargadas y retorcidas', 'Composición compleja', 'Colores ácidos', 'Crisis espiritual'], artistas: ['El Greco', 'Pontormo', 'Parmigianino'], obraIconica: 'El entierro del conde de Orgaz — El Greco (1588)', contexto: 'Reacción al equilibrio clasicista del Alto Renacimiento; surgió en un contexto de crisis religiosa.', color: '#7B68EE' },
  { id: 'barroco', nombre: 'Barroco', anioInicio: 1600, anioFin: 1750, categoria: 'barroco', caracteristicas: ['Dramatismo y claroscuro', 'Movimiento y dinamismo', 'Emoción intensa', 'Arte al servicio de la Iglesia y el Estado'], artistas: ['Caravaggio', 'Velázquez', 'Rembrandt', 'Rubens'], obraIconica: 'Las Meninas — Diego Velázquez (1656)', contexto: 'Respuesta de la Iglesia Católica a la Reforma Protestante; también arte de las monarquías absolutas.', color: '#B8860B' },
  { id: 'neoclasicismo', nombre: 'Neoclasicismo', anioInicio: 1750, anioFin: 1830, categoria: 'moderno', caracteristicas: ['Orden y razón', 'Vuelta a Grecia y Roma', 'Línea clara', 'Arte moral y cívico'], artistas: ['Jacques-Louis David', 'Antonio Canova', 'Ingres'], obraIconica: 'La muerte de Marat — Jacques-Louis David (1793)', contexto: 'Surgió con la Ilustración; reacción contra el exceso barroco. El arte debe educar y elevar moralmente.', color: '#708090' },
  { id: 'romanticismo', nombre: 'Romanticismo', anioInicio: 1800, anioFin: 1850, categoria: 'moderno', caracteristicas: ['Emoción sobre razón', 'Naturaleza como fuerza sublime', 'Individualismo', 'Historia y exotismo'], artistas: ['Goya', 'Delacroix', 'Caspar David Friedrich', 'Turner'], obraIconica: 'La libertad guiando al pueblo — Eugène Delacroix (1830)', contexto: 'Reacción contra el racionalismo ilustrado; la Revolución Francesa y las guerras napoleónicas como telón de fondo.', color: '#8B0000' },
  { id: 'realismo', nombre: 'Realismo', anioInicio: 1840, anioFin: 1880, categoria: 'moderno', caracteristicas: ['Escenas cotidianas y obreras', 'Sin idealización', 'Crítica social', 'Detalle fotográfico'], artistas: ['Gustave Courbet', 'Jean-François Millet', 'Honoré Daumier'], obraIconica: 'El entierro en Ornans — Gustave Courbet (1851)', contexto: 'Surge con la industrialización y la aparición del proletariado; influenciado por el pensamiento socialista.', color: '#556B2F' },
  { id: 'impresionismo', nombre: 'Impresionismo', anioInicio: 1860, anioFin: 1900, categoria: 'moderno', caracteristicas: ['Pinceladas sueltas y visibles', 'Luz natural cambiante', 'Escenas de la vida moderna', 'Al aire libre'], artistas: ['Monet', 'Renoir', 'Degas', 'Pissarro'], obraIconica: 'Impresión, sol naciente — Claude Monet (1872)', contexto: 'Ruptura con la academia. La llegada del ferrocarril y la fotografía transformaron la percepción de la realidad.', color: '#87CEEB' },
  { id: 'postimpresionismo', nombre: 'Postimpresionismo', anioInicio: 1880, anioFin: 1910, categoria: 'moderno', caracteristicas: ['Diversidad de estilos', 'Color expresivo', 'Estructura formal', 'Subjetividad emocional'], artistas: ['Van Gogh', 'Gauguin', 'Cézanne', 'Seurat'], obraIconica: 'La noche estrellada — Vincent van Gogh (1889)', contexto: 'Término paraguas para artistas que superaron el impresionismo cada uno a su manera.', color: '#6A0DAD' },
  { id: 'cubismo', nombre: 'Cubismo', anioInicio: 1907, anioFin: 1930, categoria: 'vanguardia', caracteristicas: ['Múltiples perspectivas simultáneas', 'Fragmentación geométrica', 'Planos superpuestos', 'Monocromatismo inicial'], artistas: ['Picasso', 'Braque', 'Léger', 'Gris'], obraIconica: 'Las señoritas de Avignon — Pablo Picasso (1907)', contexto: 'Revolución total de la representación pictórica; influido por el arte africano y las ideas de Cézanne.', color: '#C0C0C0' },
  { id: 'surrealismo', nombre: 'Surrealismo', anioInicio: 1924, anioFin: 1960, categoria: 'vanguardia', caracteristicas: ['Inconsciente y sueños', 'Automatismo psíquico', 'Imágenes oníricas', 'Influencia del psicoanálisis'], artistas: ['Dalí', 'Magritte', 'Max Ernst', 'Frida Kahlo'], obraIconica: 'La persistencia de la memoria — Salvador Dalí (1931)', contexto: 'Nace tras la Primera Guerra Mundial; influenciado por Freud y el rechazo a la razón burguesa.', color: '#FF6B6B' },
  { id: 'expresionismo-abstracto', nombre: 'Expresionismo Abstracto', anioInicio: 1940, anioFin: 1965, categoria: 'contemporaneo', caracteristicas: ['Gestualidad espontánea', 'Gran formato', 'Abstracción total', 'Arte como acción (Action Painting)'], artistas: ['Pollock', 'De Kooning', 'Rothko', 'Kline'], obraIconica: 'Número 31 — Jackson Pollock (1950)', contexto: 'Primer movimiento artístico centrado en Nueva York; EE.UU. como nuevo epicentro del arte mundial tras la WWII.', color: '#1C1C1C' },
  { id: 'pop-art', nombre: 'Pop Art', anioInicio: 1955, anioFin: 1975, categoria: 'contemporaneo', caracteristicas: ['Iconos de la cultura popular', 'Colores brillantes y planos', 'Crítica al consumismo', 'Reproducción en serie'], artistas: ['Andy Warhol', 'Roy Lichtenstein', 'Richard Hamilton'], obraIconica: 'Marilyn Díptico — Andy Warhol (1962)', contexto: 'Reacción al elitismo del expresionismo abstracto; surge en el contexto de la sociedad de consumo americana.', color: '#FF1493' },
  { id: 'arte-digital', nombre: 'Arte Digital y NFT', anioInicio: 1990, anioFin: 9999, categoria: 'contemporaneo', caracteristicas: ['Medios digitales', 'Interactividad', 'Blockchain y propiedad digital', 'Arte generativo'], artistas: ['Beeple', 'Refik Anadol', 'Casey Reas'], obraIconica: 'Everydays: The First 5000 Days — Beeple (2021)', contexto: 'El arte entra en la era digital; debates sobre autoría, originalidad y el mercado del arte en la blockchain.', color: '#00CED1' },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1453, evento: 'Caída de Constantinopla — fin del Medievo' },
  { anio: 1517, evento: 'Reforma Protestante — Lutero' },
  { anio: 1789, evento: 'Revolución Francesa' },
  { anio: 1820, evento: 'Revolución Industrial plena' },
  { anio: 1914, evento: 'Primera Guerra Mundial' },
  { anio: 1939, evento: 'Segunda Guerra Mundial' },
  { anio: 1969, evento: 'Llegada del hombre a la Luna' },
  { anio: 1989, evento: 'Caída del Muro de Berlín' },
  { anio: 2008, evento: 'Crisis financiera global' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  medieval: 'Medieval',
  renacimiento: 'Renacimiento',
  barroco: 'Barroco',
  moderno: 'Moderno',
  vanguardia: 'Vanguardia',
  contemporaneo: 'Contemporáneo',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  medieval: '#8B6914',
  renacimiento: '#D4A017',
  barroco: '#B8860B',
  moderno: '#556B2F',
  vanguardia: '#6A0DAD',
  contemporaneo: '#2E86AB',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

// Panel de detalle reutilizable
function PanelDetalle({ movimiento }: { movimiento: MovimientoArte }) {
  const anioFinTexto = movimiento.anioFin === 9999 ? 'actualidad' : String(movimiento.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: movimiento.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: movimiento.color }}>{movimiento.nombre}</h3>
      <p className={styles.detallePeriodo}>{movimiento.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[movimiento.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Características</h4>
          <ul className={styles.caracteristicasList}>
            {movimiento.caracteristicas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Artistas clave</h4>
          <ul className={styles.artistasList}>
            {movimiento.artistas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra icónica</span>
        <p>{movimiento.obraIconica}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{movimiento.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_INICIO_GLOBAL = 1000;
const AÑO_FIN_GLOBAL = 2025;
const SVG_ANCHO = 1100;
const SVG_ALTO = 200;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_INICIO_GLOBAL) / (AÑO_FIN_GLOBAL - AÑO_INICIO_GLOBAL)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<MovimientoArte | null>(null);

  // Distribuir movimientos en filas para evitar solapamiento
  const filas: MovimientoArte[][] = [[], [], []];
  const ordenados = [...MOVIMIENTOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const mov of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin === 9999 ? AÑO_FIN_GLOBAL : ultimoEnFila.anioFin) + 4 <= anioAX(mov.anioInicio)) {
        filas[f].push(mov);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(mov);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de siglos
  const siglos: number[] = [];
  for (let s = 1100; s <= 2000; s += 100) siglos.push(s);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un movimiento para ver sus detalles.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de movimientos artísticos"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de siglos */}
          {siglos.map((s) => (
            <g key={s}>
              <line x1={anioAX(s)} y1={FILA_OFFSET_Y} x2={anioAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{s}</text>
            </g>
          ))}

          {/* Rectángulos de movimientos */}
          {filas.map((fila, fi) =>
            fila.map((mov) => {
              const anioFin = mov.anioFin === 9999 ? AÑO_FIN_GLOBAL : mov.anioFin;
              const x = anioAX(mov.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === mov.id;

              return (
                <g key={mov.id} onClick={() => setSeleccionado(esSeleccionado ? null : mov)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={mov.color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={10}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {mov.nombre}
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
        <PanelDetalle movimiento={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Movimiento en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const movimiento = MOVIMIENTOS[indice];
  const anioFinTexto = movimiento.anioFin === 9999 ? 'actualidad' : String(movimiento.anioFin);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Movimiento en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {MOVIMIENTOS.map((mov, i) => (
          <button
            type="button"
            key={mov.id}
            aria-pressed={i === indice}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: mov.color, borderColor: mov.color } : {}}
          >
            {mov.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: movimiento.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: movimiento.color }}>
          <h3>{movimiento.nombre}</h3>
          <p>{movimiento.anioInicio} – {anioFinTexto}</p>
          <span>{ETIQUETAS_CATEGORIA[movimiento.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Características principales</h4>
              <ul className={styles.caracteristicasList}>
                {movimiento.caracteristicas.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Artistas clave</h4>
              <ul className={styles.artistasList}>
                {movimiento.artistas.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra icónica</span>
            <p>{movimiento.obraIconica}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{movimiento.contexto}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          type="button"
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Movimiento anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {MOVIMIENTOS.length}</span>
        <button
          type="button"
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(MOVIMIENTOS.length - 1, i + 1))}
          disabled={indice === MOVIMIENTOS.length - 1}
          aria-label="Movimiento siguiente"
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

  const movimientosFiltrados = useMemo(() => {
    return MOVIMIENTOS.filter((mov) => {
      const coincideCategoria = categoriaFiltro === 'todos' || mov.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        mov.nombre.toLowerCase().includes(termino) ||
        mov.artistas.some((a) => a.toLowerCase().includes(termino));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          type="button"
          aria-pressed={categoriaFiltro === 'todos'}
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
        >
          Todos
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            type="button"
            key={cat}
            aria-pressed={categoriaFiltro === cat}
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
        placeholder="Buscar por movimiento o artista..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar movimiento artístico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Movimiento</th>
              <th>Período</th>
              <th>Categoría</th>
              <th>Artista clave</th>
              <th>Característica principal</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map((mov, i) => {
              const anioFinTexto = mov.anioFin === 9999 ? 'actualidad' : String(mov.anioFin);
              return (
                <tr
                  key={mov.id}
                  style={i % 2 === 0 ? { background: `${mov.color}18` } : {}}
                >
                  <td><strong style={{ color: mov.color }}>{mov.nombre}</strong></td>
                  <td>{mov.anioInicio}–{anioFinTexto}</td>
                  <td>
                    <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[mov.categoria]}22`, color: COLORES_CATEGORIA[mov.categoria] }}>
                      {ETIQUETAS_CATEGORIA[mov.categoria]}
                    </span>
                  </td>
                  <td>{mov.artistas[0]}</td>
                  <td>{mov.caracteristicas[0]}</td>
                </tr>
              );
            })}
            {movimientosFiltrados.length === 0 && (
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
  { nombre: 'Edad Media', desde: 1000, hasta: 1400, icono: '⛪' },
  { nombre: 'Renacimiento', desde: 1400, hasta: 1600, icono: '🎭' },
  { nombre: 'Barroco y Neoclasicismo', desde: 1600, hasta: 1800, icono: '👑' },
  { nombre: 'Romanticismo e Impresionismo', desde: 1800, hasta: 1900, icono: '🌊' },
  { nombre: 'Vanguardias — siglo XX', desde: 1900, hasta: 1960, icono: '💥' },
  { nombre: 'Arte contemporáneo', desde: 1960, hasta: 9999, icono: '🖼️' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Movimientos artísticos y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const movimientosEra = MOVIMIENTOS.filter(
            (m) => m.anioInicio < era.hasta && (m.anioFin === 9999 || m.anioFin > era.desde)
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

              {movimientosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {movimientosEra.map((m) => (
                    <span
                      key={m.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${m.color}1A`, color: m.color, borderColor: `${m.color}55` }}
                    >
                      {m.nombre}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{ev.anio}</span>
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

export default function VisualizadorArteMovimientos() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Movimiento en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Movimientos Artísticos</h1>
        <p className={styles.heroSubtitle}>
          Del Románico al Arte Digital — cronología, artistas y contexto histórico de 15 movimientos que transformaron el arte occidental
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              type="button"
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
        title="Movimientos artísticos: historia y contexto"
        subtitle="Cómo el arte refleja su época y transforma nuestra forma de ver el mundo"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 8 movimientos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Período</th>
                <th>Categoría</th>
                <th>Técnica dominante</th>
                <th>Artista clave</th>
                <th>Obra icónica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Románico</strong></td>
                <td>1000–1200</td>
                <td>Medieval</td>
                <td>Fresco y escultura</td>
                <td>Maestro Mateo</td>
                <td>Pórtico de la Gloria</td>
              </tr>
              <tr>
                <td><strong>Renacimiento</strong></td>
                <td>1400–1550</td>
                <td>Clasicismo</td>
                <td>Perspectiva lineal</td>
                <td>Da Vinci</td>
                <td>La Gioconda</td>
              </tr>
              <tr>
                <td><strong>Barroco</strong></td>
                <td>1600–1750</td>
                <td>Dramatismo</td>
                <td>Claroscuro</td>
                <td>Velázquez</td>
                <td>Las Meninas</td>
              </tr>
              <tr>
                <td><strong>Romanticismo</strong></td>
                <td>1800–1850</td>
                <td>Moderno</td>
                <td>Óleo</td>
                <td>Delacroix</td>
                <td>La libertad guiando al pueblo</td>
              </tr>
              <tr>
                <td><strong>Impresionismo</strong></td>
                <td>1860–1900</td>
                <td>Moderno</td>
                <td>Pincelada suelta</td>
                <td>Monet</td>
                <td>Impresión, sol naciente</td>
              </tr>
              <tr>
                <td><strong>Cubismo</strong></td>
                <td>1907–1930</td>
                <td>Vanguardia</td>
                <td>Geometría y fragmentación</td>
                <td>Picasso</td>
                <td>Las señoritas de Avignon</td>
              </tr>
              <tr>
                <td><strong>Surrealismo</strong></td>
                <td>1924–1960</td>
                <td>Vanguardia</td>
                <td>Automatismo psíquico</td>
                <td>Dalí</td>
                <td>La persistencia de la memoria</td>
              </tr>
              <tr>
                <td><strong>Pop Art</strong></td>
                <td>1955–1975</td>
                <td>Contemporáneo</td>
                <td>Serigrafía</td>
                <td>Warhol</td>
                <td>Marilyn Díptico</td>
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
              <strong>Estudiante de Historia del Arte</strong>
              <p>Prepara el examen de selectividad identificando los rasgos formales de cada movimiento y su contexto histórico.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🖼️</span>
            <div>
              <strong>Visitante de museo</strong>
              <p>Usa el visualizador antes de visitar el Prado o el Reina Sofía para contextualizar las obras que verá.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
            <div>
              <strong>Escritor o guionista</strong>
              <p>Necesita ambientar una novela histórica y quiere saber qué estilo arquitectónico y pictórico dominaba en esa época.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎨</span>
            <div>
              <strong>Artista emergente</strong>
              <p>Estudia los movimientos del siglo XX para comprender las influencias que recibe y desarrollar un lenguaje propio.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Impresionismo fue rechazado en su época y hoy es uno de los más queridos?</strong>
            <p>Rompió con las reglas académicas al usar pinceladas visibles y escenas cotidianas en lugar de temas nobles con acabado perfecto. Los críticos de 1874 lo ridiculizaron, pero el público moderno valora precisamente esa libertad y frescura que captura la vida tal como es.</p>
            <span className={styles.faqTip}>Consejo: visita la sala impresionista del Museo Thyssen para ver en directo cómo la textura cambia la experiencia.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia el Renacimiento Italiano del Renacimiento del Norte?</strong>
            <p>El italiano (Florencia, Roma) se centró en la perspectiva, la anatomía clásica y el humanismo laico. El del norte (Flandes, Alemania) se interesó más por el detalle minucioso, los interiores domésticos y la moralidad religiosa, y desarrolló antes la pintura al óleo.</p>
            <span className={styles.faqTip}>Artistas clave del norte: Jan van Eyck, Alberto Durero, Hans Holbein.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El arte abstracto tiene reglas o cualquier cosa vale?</strong>
            <p>Tiene principios compositivos: equilibrio, ritmo, tensión, color, escala. Lo que no tiene es referencia figurativa. Rothko estudiaba filosofía y música; Kandinsky era músico teórico. La abstracción requiere tanto dominio técnico como el arte figurativo, solo que aplicado de forma diferente.</p>
            <span className={styles.faqTip}>Leer «De lo espiritual en el arte» de Kandinsky aclara mucho la intención detrás de la abstracción.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Cubismo rompió con la perspectiva si esta había sido un logro del Renacimiento?</strong>
            <p>Porque Picasso y Braque consideraban que la perspectiva de un solo punto de vista era una mentira: en la vida real miramos los objetos desde múltiples ángulos simultáneamente. El Cubismo intentó representar esa experiencia real del tiempo y el espacio, influido por Cézanne y el arte africano.</p>
            <span className={styles.faqTip}>La fotografía ya representaba el mundo con fidelidad; el arte necesitaba ir más allá.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El Arte Digital y los NFT son un movimiento artístico legítimo o solo especulación financiera?</strong>
            <p>Las dos cosas coexisten. El arte generativo (Casey Reas, Refik Anadol) explora territorios estéticos genuinamente nuevos. Los NFT como instrumento financiero han generado burbujas especulativas independientemente del valor artístico. Como ocurrió con el Pop Art, el mercado y el arte van juntos sin anularse.</p>
            <span className={styles.faqTip}>Separar la obra de su sistema de distribución ayuda a evaluar el valor artístico con más claridad.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo se sabe cuándo termina un movimiento artístico y empieza otro?</strong>
            <p>Los historiadores del arte lo construyen retrospectivamente. En su momento, los artistas no siempre eran conscientes de pertenecer a un movimiento. Las fechas son convenciones útiles, no fronteras reales: el Romanticismo convivió con el Neoclasicismo durante décadas y ambos influyeron en el Realismo que vino después.</p>
            <span className={styles.faqTip}>Pregunta clave: ¿cuándo cambia el consenso sobre qué es bello, verdadero o importante en arte?</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo analizar una obra de arte desconocida y ubicarla en su movimiento</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Observa la línea y la forma</strong>
              <p>¿Son suaves y curvas (Barroco) o angulares y fragmentadas (Cubismo)? ¿Las figuras son realistas (Renacimiento, Realismo) o distorsionadas (Manierismo, Expresionismo)?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Analiza el color</strong>
              <p>¿Colores naturales y sombreados (Renacimiento), o colores puros y planos (Postimpresionismo)? ¿Paleta oscura y dramática (Barroco) o colores brillantes y saturados (Pop Art)?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Busca el tema representado</strong>
              <p>¿Religioso (medieval), mitológico (Renacimiento), cotidiano (Realismo), onírico (Surrealismo)? El tema da pistas clave sobre el período y el contexto cultural.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Estudia la técnica</strong>
              <p>¿Fresco (medieval, Renacimiento), óleo (Barroco, Romanticismo), acuarela, collage, serigrafía (Pop Art), digital? La técnica a menudo determina el período posible.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Contextualiza históricamente</strong>
              <p>¿Qué estaba pasando en el mundo en esa fecha? La obra siempre responde a su contexto: guerras, revoluciones, avances científicos, cambios religiosos. El arte no nace en el vacío.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para estudiar historia del arte</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>No existe un único «mejor» movimiento artístico: cada uno responde a las necesidades expresivas de su época y debe juzgarse en su contexto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>Los movimientos se solapan: el Romanticismo convivió con el Neoclasicismo durante décadas — las fronteras temporales son orientativas, no absolutas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Aprende primero los movimientos principales (Renacimiento, Barroco, Impresionismo, Vanguardias) antes de estudiar los secundarios para tener un marco de referencia sólido.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Visitar museos en directo cambia la percepción: el tamaño, la textura y el color real de las obras no es reproducible en pantalla ni en fotografía.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>⚠️ Errores frecuentes al estudiar movimientos artísticos</strong>
          <ul>
            <li>Confundir <strong>Expresionismo Abstracto</strong> (Pollock, Rothko, EE.UU. años 40-60) con <strong>Expresionismo Alemán</strong> (Kirchner, Munch, 1905-1925): son movimientos distintos separados por 40 años.</li>
            <li>Llamar «impresionistas» a Gauguin, Van Gogh o Cézanne: son <strong>postimpresionistas</strong> que reaccionaron contra el Impresionismo, no que lo practicaron.</li>
            <li>Asumir que el arte abstracto no requiere técnica: la abstracción requiere dominar primero el dibujo figurativo para después trascenderlo conscientemente.</li>
            <li>Confundir el estilo de un artista con el movimiento al que pertenece: Dalí se llamaba surrealista, pero su técnica pictórica era hiperrealista.</li>
            <li>Ignorar las artes decorativas, arquitectura y música al estudiar un movimiento: el Barroco no fue solo pintura, sino también escultura (Bernini) y música (Bach, Vivaldi).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-arte-movimientos')} />
      <ShareCard appName="visualizador-arte-movimientos" />
      <Footer appName="visualizador-arte-movimientos" />
    </div>
  );
}
