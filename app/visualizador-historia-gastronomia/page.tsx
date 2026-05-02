'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaGastronomia.module.css';
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

type Categoria =
  | 'primitiva'
  | 'antigua'
  | 'medieval'
  | 'descubrimiento'
  | 'alta'
  | 'industrial'
  | 'vanguardia'
  | 'sostenible'
  | 'digital'
  | 'futuro';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoGastronomico {
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

const PERIODOS: PeriodoGastronomico[] = [
  {
    id: 1,
    nombre: 'Cocina del Fuego y la Agricultura',
    anioInicio: -10000,
    anioFin: -3000,
    color: '#8D6E63',
    tecnica: 'Fuego, cocción y primeros cereales',
    descripcion:
      'El dominio del fuego transforma la dieta humana. La revolución neolítica introduce cereales, legumbres y ganadería. Nace el pan, la cerveza y el queso en las primeras aldeas.',
    personas: ['Comunidades neolíticas anónimas'],
    categoria: 'primitiva',
  },
  {
    id: 2,
    nombre: 'Gastronomía de las Civilizaciones Antiguas',
    anioInicio: -3000,
    anioFin: -500,
    color: '#795548',
    tecnica: 'Especias, fermentación y banquetes rituales',
    descripcion:
      'Egipto produce cerveza y vino en masa. Mesopotamia cuenta con los primeros recetarios escritos. Los banquetes son rituales de poder en todas las culturas del Mediterráneo antiguo.',
    personas: ['Escribas babilónicos', 'Faraones egipcios'],
    categoria: 'antigua',
  },
  {
    id: 3,
    nombre: 'Cocina Griega y Romana',
    anioInicio: -600,
    anioFin: 400,
    color: '#FF8F00',
    tecnica: 'Garum, especias y el arte del simposio',
    descripcion:
      'Grecia eleva la cocina a arte filosófico. Roma crea el primer recetario (Apicio), el garum de pescado fermentado y los banquetes como espectáculo político. Las especias orientales llegan via rutas comerciales.',
    personas: ['Apicio', 'Ateneo de Náucratis', 'Catón el Viejo'],
    categoria: 'antigua',
  },
  {
    id: 4,
    nombre: 'Gastronomía Medieval e Islámica',
    anioInicio: 400,
    anioFin: 1300,
    color: '#FFCA28',
    tecnica: 'Especias, conservación y cocina monástica',
    descripcion:
      'Al-Ándalus transmite a Europa el azúcar, el arroz, los cítricos y técnicas de destilación. Los monasterios conservan recetas y producen vinos. Las especias orientales valen su peso en oro.',
    personas: ['Ibn Razin al-Tujibi', 'Hildegarda de Bingen'],
    categoria: 'medieval',
  },
  {
    id: 5,
    nombre: 'El Encuentro con América',
    anioInicio: 1492,
    anioFin: 1600,
    color: '#FFA726',
    tecnica: 'Intercambio colombino de alimentos',
    descripcion:
      'El descubrimiento de América introduce en Europa la patata, el tomate, el maíz, el chocolate, el pimiento y el pavo. Europa aporta el trigo, la vid y el ganado a América. La dieta global cambia para siempre.',
    personas: ['Cristóbal Colón', 'Bernal Díaz del Castillo', 'Francisco Hernández'],
    categoria: 'descubrimiento',
  },
  {
    id: 6,
    nombre: 'Alta Cocina Francesa y la Corte',
    anioInicio: 1600,
    anioFin: 1800,
    color: '#66BB6A',
    tecnica: 'Salsas madre y servicio à la française',
    descripcion:
      'La cocina de Versalles establece el lujo como norma. Carême codifica las salsas madre. El servicio à la française (todos los platos a la vez) domina los banquetes aristocráticos europeos.',
    personas: ['Marie-Antoine Carême', 'Vatel', 'François Menon'],
    categoria: 'alta',
  },
  {
    id: 7,
    nombre: 'Revolución Industrial y la Conserva',
    anioInicio: 1800,
    anioFin: 1890,
    color: '#AB47BC',
    tecnica: 'Conservación, pasteurización y enlatado',
    descripcion:
      'Appert inventa el enlatado para Napoleón. Pasteur descubre la pasteurización. El ferrocarril distribuye alimentos frescos. La margarina y la sacarina son los primeros alimentos industriales.',
    personas: ['Nicolas Appert', 'Louis Pasteur', 'Justus von Liebig'],
    categoria: 'industrial',
  },
  {
    id: 8,
    nombre: 'Belle Époque y el Restaurante Moderno',
    anioInicio: 1890,
    anioFin: 1930,
    color: '#5C6BC0',
    tecnica: 'Servicio à la russe y guías gastronómicas',
    descripcion:
      'Escoffier moderniza la cocina francesa y organiza la brigada de cocina. Nace la guía Michelin (1900). El restaurante sustituye al banquete privado. Los grandes hoteles tienen cocina de referencia.',
    personas: ['Auguste Escoffier', 'César Ritz', 'André Michelin'],
    categoria: 'alta',
  },
  {
    id: 9,
    nombre: 'Cocina del Siglo XX y el Fast Food',
    anioInicio: 1930,
    anioFin: 1970,
    color: '#29B6F6',
    tecnica: 'Procesados, congelados y cadenas industriales',
    descripcion:
      'McDonald\'s inventa el sistema de cocina industrial (1948). Los congelados de Clarence Birdseye llegan a todos los hogares. Julia Child populariza la cocina francesa en TV. El microondas entra en los hogares.',
    personas: ['Ray Kroc', 'Clarence Birdseye', 'Julia Child'],
    categoria: 'industrial',
  },
  {
    id: 10,
    nombre: 'Nouvelle Cuisine',
    anioInicio: 1970,
    anioFin: 1990,
    color: '#26A69A',
    tecnica: 'Ligereza, producto fresco y presentación',
    descripcion:
      'Paul Bocuse y los críticos Gault-Millau proclaman la nouvelle cuisine: salsas ligeras, productos frescos, presentaciones artísticas. La cocina deja de ser copiosa para ser elegante.',
    personas: ['Paul Bocuse', 'Joël Robuchon', 'Henri Gault'],
    categoria: 'vanguardia',
  },
  {
    id: 11,
    nombre: 'Vanguardia y Cocina Molecular',
    anioInicio: 1990,
    anioFin: 2010,
    color: '#EF5350',
    tecnica: 'Esferificación, geles y deconstrucción',
    descripcion:
      'Ferran Adrià en El Bulli revoluciona la gastronomía mundial con la esferificación, las espumas y la deconstrucción. Heston Blumenthal aplica la ciencia al sabor. El chef se convierte en artista conceptual.',
    personas: ['Ferran Adrià', 'Heston Blumenthal', 'Hervé This'],
    categoria: 'vanguardia',
  },
  {
    id: 12,
    nombre: 'Gastronomía Sostenible y Local',
    anioInicio: 2000,
    anioFin: 2015,
    color: '#7CB342',
    tecnica: 'Kilómetro 0, slow food y fermentación',
    descripcion:
      'Carlo Petrini funda Slow Food contra el fast food. René Redzepi en Noma reinventa la cocina nórdica con ingredientes locales. El kilómetro 0 y la agricultura ecológica se instalan en los restaurantes de referencia.',
    personas: ['Carlo Petrini', 'René Redzepi', 'Alice Waters'],
    categoria: 'sostenible',
  },
  {
    id: 13,
    nombre: 'Foodie y Era de las Redes Sociales',
    anioInicio: 2010,
    anioFin: 2022,
    color: '#FF7043',
    tecnica: 'Instagram food, delivery y dark kitchens',
    descripcion:
      'Instagram convierte la comida en contenido visual. Los food bloggers y youtubers influyen más que los críticos gastronómicos. El delivery y las dark kitchens transforman el modelo de restauración.',
    personas: ['David Chang', 'Gordon Ramsay', 'Jamie Oliver'],
    categoria: 'digital',
  },
  {
    id: 14,
    nombre: 'Gastronomía del Futuro',
    anioInicio: 2018,
    anioFin: 9999,
    color: '#78909C',
    tecnica: 'Proteínas alternativas, impresión 3D e IA culinaria',
    descripcion:
      'La carne cultivada en laboratorio y las proteínas de insectos buscan sustituir la ganadería. La impresión 3D de alimentos permite formas imposibles. La IA diseña recetas y optimiza cadenas alimentarias.',
    personas: ['Pat Brown', 'Alexis Gauthier', 'Blumenthal'],
    categoria: 'futuro',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -10000, descripcion: 'Revolución neolítica: la agricultura transforma la dieta humana para siempre' },
  { anio: -1700, descripcion: 'Tablillas cuneiformes de Yale: el recetario más antiguo del mundo (Mesopotamia)' },
  { anio: 1492, descripcion: 'Colón llega a América: comienza el intercambio colombino que cambia la dieta global' },
  { anio: 1825, descripcion: 'Brillat-Savarin publica \'Fisiología del gusto\': la gastronomía como disciplina intelectual' },
  { anio: 1900, descripcion: 'Primer anuario Michelin: nace la guía gastronómica de referencia mundial' },
  { anio: 1948, descripcion: 'McDonald\'s abre su segundo local con el sistema Speedee: nace el fast food moderno' },
  { anio: 1994, descripcion: 'Ferran Adrià sirve la primera esferificación en El Bulli: revolución de la cocina molecular' },
  { anio: 2004, descripcion: 'Slow Food presenta el Arca del Gusto: 10.000 productos en peligro de extinción' },
  { anio: 2013, descripcion: 'Primera hamburguesa de carne cultivada en laboratorio degustada públicamente en Londres' },
];

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: 'Cocina Primitiva y Antigua', desde: -10000, hasta: 400, icono: '🔥' },
  { nombre: 'Cocina Medieval y Renacentista', desde: 400, hasta: 1600, icono: '🏰' },
  { nombre: 'Alta Cocina y Revolución', desde: 1600, hasta: 1900, icono: '👨‍🍳' },
  { nombre: 'Industrialización Gastronómica', desde: 1900, hasta: 1970, icono: '🏭' },
  { nombre: 'Vanguardia y Nueva Cocina', desde: 1970, hasta: 2010, icono: '⚗️' },
  { nombre: 'Gastronomía Sostenible y Digital', desde: 2010, hasta: 9999, icono: '🌱' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  primitiva: 'Primitiva',
  antigua: 'Antigua',
  medieval: 'Medieval',
  descubrimiento: 'Descubrimiento',
  alta: 'Alta Cocina',
  industrial: 'Industrial',
  vanguardia: 'Vanguardia',
  sostenible: 'Sostenible',
  digital: 'Digital',
  futuro: 'Futuro',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  primitiva: '#8D6E63',
  antigua: '#FF8F00',
  medieval: '#FFCA28',
  descubrimiento: '#FFA726',
  alta: '#66BB6A',
  industrial: '#AB47BC',
  vanguardia: '#EF5350',
  sostenible: '#7CB342',
  digital: '#FF7043',
  futuro: '#78909C',
};

// ─────────────────────────────────────────────
// Constantes SVG
// ─────────────────────────────────────────────

const AÑO_MIN = -10000;
const AÑO_MAX = 2024;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 60;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoGastronomico }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Técnica Gastronómica</h4>
          <div className={styles.obraIconica}>
            <p>{periodo.tecnica}</p>
          </div>
          <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Descripción</h4>
          <div className={styles.contextoBox}>
            <p>{periodo.descripcion}</p>
          </div>
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
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoGastronomico | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoGastronomico[][] = [[], [], [], []];
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

  // Marcadores de períodos clave
  const marcadores: number[] = [-8000, -5000, -2000, 0, 500, 1000, 1500, 1800, 1950, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca desde el 10.000 a.C. hasta la actualidad.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la gastronomía"
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

          {/* Marcadores de períodos */}
          {marcadores.map((s) => (
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
            <span className={styles.preguntaIcono} aria-hidden="true">🍽</span>
            <p>{periodo.tecnica}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Descripción</h4>
              <div className={styles.contextoBox}>
                <p>{periodo.descripcion}</p>
              </div>
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
      const coincideCategoria =
        categoriaFiltro === 'todos' || per.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        !termino ||
        per.nombre.toLowerCase().includes(termino) ||
        per.tecnica.toLowerCase().includes(termino) ||
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
        placeholder="Buscar por período, técnica o figura..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período gastronómico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Fechas</th>
              <th>Categoría</th>
              <th>Técnica Gastronómica</th>
              <th>Figura clave</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto =
                per.anioFin === 9999 ? 'actualidad' : formatAnio(per.anioFin);
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
                  <td className={styles.preguntaCell}>{per.tecnica}</td>
                  <td>{per.personas[0]}</td>
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

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos gastronómicos y eventos históricos organizados por eras culinarias.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) =>
              p.anioInicio < era.hasta &&
              (p.anioFin === 9999 || p.anioFin > era.desde)
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) =>
              ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio < era.hasta)
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
                    {formatAnio(era.desde)} –{' '}
                    {era.hasta === 9999 ? 'hoy' : formatAnio(era.hasta)}
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

export default function VisualizadorHistoriaGastronomia() {
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
        <h1 className={styles.heroTitle}>Historia de la Gastronomía</h1>
        <p className={styles.heroSubtitle}>
          Del fuego neolítico a la IA culinaria — 14 períodos gastronómicos con técnicas, figuras
          clave y contexto histórico
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
        title="Historia de la gastronomía: doce mil años de cocina"
        subtitle="Cómo los alimentos, las técnicas culinarias y los grandes cocineros han transformado la historia de la humanidad"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos gastronómicos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Fechas</th>
                <th>Técnica</th>
                <th>Figura clave</th>
                <th>Aportación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cocina del Fuego</strong></td>
                <td>10000–3000 a.C.</td>
                <td>Cocción y fermentación</td>
                <td>Comunidades neolíticas</td>
                <td>Pan, cerveza, queso</td>
              </tr>
              <tr>
                <td><strong>Roma y Grecia</strong></td>
                <td>600 a.C.–400 d.C.</td>
                <td>Garum y especias</td>
                <td>Apicio</td>
                <td>Primer recetario occidental</td>
              </tr>
              <tr>
                <td><strong>Alta Cocina Francesa</strong></td>
                <td>1600–1800</td>
                <td>Salsas madre</td>
                <td>Marie-Antoine Carême</td>
                <td>Codificación de la haute cuisine</td>
              </tr>
              <tr>
                <td><strong>Belle Époque</strong></td>
                <td>1890–1930</td>
                <td>Brigada de cocina</td>
                <td>Auguste Escoffier</td>
                <td>Guía Michelin y restaurante moderno</td>
              </tr>
              <tr>
                <td><strong>Cocina Molecular</strong></td>
                <td>1990–2010</td>
                <td>Esferificación</td>
                <td>Ferran Adrià</td>
                <td>El Bulli y la deconstrucción culinaria</td>
              </tr>
              <tr>
                <td><strong>Gastronomía Sostenible</strong></td>
                <td>2000–2015</td>
                <td>Kilómetro 0</td>
                <td>René Redzepi</td>
                <td>Noma y la nueva cocina nórdica</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios comparativos */}
        <h3>Grandes debates gastronómicos</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Cocina antigua vs. moderna</strong>
              <p>Los romanos ya usaban potenciadores del sabor (garum), fermentación avanzada y especias de Asia. La cocina moderna redescubre estas técnicas con nombres nuevos: umami, fermentación artesanal, especias de fusión.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🍔</span>
            <div>
              <strong>Fast food vs. slow food</strong>
              <p>McDonald's estandarizó la experiencia culinaria a escala industrial. Carlo Petrini fundó Slow Food como respuesta: recuperar el producto local, la biodiversidad alimentaria y el placer sin prisa. Ambos modelos coexisten y se definen mutuamente.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👨‍🍳</span>
            <div>
              <strong>Haute cuisine vs. cocina popular</strong>
              <p>La gastronomía siempre ha tenido dos caras: la cocina de élite que establece tendencias y la cocina popular que conserva la tradición. Los grandes chefs del siglo XXI vuelven a mirar a las abuelas en busca de inspiración.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌱</span>
            <div>
              <strong>Gastronomía sostenible vs. proteínas del futuro</strong>
              <p>El movimiento kilómetro 0 recupera lo local y tradicional. Mientras tanto, la carne cultivada en laboratorio y las proteínas de insectos proponen una ruptura radical con la ganadería convencional. ¿Son complementarios o contradictorios?</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuál es el recetario más antiguo del mundo?</strong>
            <p>Las tablillas cuneiformes de Yale (aproximadamente 1700 a.C.) son los recetarios escritos más antiguos conocidos. Pertenecen a la civilización babilónica y describen 25 recetas de guisos y estofados con instrucciones detalladas sobre ingredientes y técnicas. Son anteriores en más de 1.500 años al recetario romano de Apicio, que a menudo se cita erróneamente como el primero.</p>
            <span className={styles.faqTip}>Dato curioso: las tablillas de Yale están en la Universidad de Yale y han sido traducidas recientemente revelando platos de alta complejidad culinaria.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué alimentos llegaron de América a Europa tras 1492?</strong>
            <p>El intercambio colombino fue la mayor revolución alimentaria de la historia. De América llegaron a Europa: patata (transformó la nutrición del norte de Europa), tomate (hoy símbolo de la cocina mediterránea), maíz, chocolate (cacao), pimiento, pavo, vainilla, cacahuete, calabaza y judías. Sin estos ingredientes, no existiría la pizza italiana, el gazpacho español ni las patatas fritas belgas.</p>
            <span className={styles.faqTip}>De Europa llegaron a América: trigo, cebada, arroz, caña de azúcar, olivo, vid, vaca, cerdo, pollo y caballo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la gastronomía molecular y quién la inventó?</strong>
            <p>La gastronomía molecular es la aplicación de principios científicos a la cocina: comprender por qué los alimentos cambian al cocinarse y usar ese conocimiento para crear texturas y sabores nuevos. El físico Nicholas Kurti y el químico Hervé This acuñaron el término en 1988. Ferran Adrià la llevó al restaurante con técnicas como la esferificación (crear esferas con líquidos encapsulados), las espumas y la gelificación con agar-agar. El Bulli fue elegido mejor restaurante del mundo cinco veces.</p>
            <span className={styles.faqTip}>La esferificación básica usa alginato de sodio y cloruro de calcio — los mismos principios que la química de polímeros.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es la carne cultivada en laboratorio viable a gran escala?</strong>
            <p>La primera hamburguesa de carne cultivada (células animales multiplicadas en biorreactores sin sacrificar animales) costó 250.000€ en 2013. En 2023, el coste había bajado a menos de 10€ por hamburguesa. Singapore fue el primer país en aprobar su venta comercial (2020). Los desafíos siguen siendo el coste de producción, la textura de cortes complejos y la aceptación del consumidor. La viabilidad técnica es real; la viabilidad económica y social, aún incierta.</p>
            <span className={styles.faqTip}>La carne cultivada reduce hasta un 92% las emisiones de CO₂ respecto a la ganadería convencional de vacuno.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue El Bulli y por qué era tan importante?</strong>
            <p>El Bulli fue un restaurante en Roses (Costa Brava) dirigido por Ferran Adrià desde 1984 hasta su cierre en 2011. Fue elegido cinco veces mejor restaurante del mundo por la lista 50 Best. Su importancia radica en que transformó la cocina en un laboratorio de ideas: cada temporada Adrià cerraba el restaurante para experimentar durante seis meses y crear un menú completamente nuevo. Inventó o perfeccionó más de 50 técnicas culinarias. Su influencia en la gastronomía del siglo XXI es comparable a la de Picasso en la pintura del XX.</p>
            <span className={styles.faqTip}>El Bulli recibía 2 millones de solicitudes de reserva al año para 8.000 plazas. Adrià cerrarlo en su mejor momento fue una decisión deliberada.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo explorar la historia de la gastronomía</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por el ingrediente, no por la técnica</strong>
              <p>Cada alimento tiene su propia historia migratoria. Traza el recorrido del tomate desde los Andes hasta la pizza napolitana, o del chocolate desde los mayas hasta los bombones belgas. Los ingredientes son el hilo conductor más fácil de la historia gastronómica.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Conecta la gastronomía con la historia política</strong>
              <p>Los grandes banquetes son actos de poder. Luis XIV usó la mesa de Versalles como teatro político; Napoleón financió el desarrollo del enlatado para alimentar a sus ejércitos; McDonald's se expandió globalmente como emblema del american way of life. La cocina nunca es solo comida.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Aprende a leer un menú histórico</strong>
              <p>Un menú del siglo XIX revela mucho sobre la sociedad que lo comía: los productos de temporada disponibles, las rutas comerciales de especias, la jerarquía social (quién come qué), y las técnicas culinarias dominantes. Cada plato es un documento histórico.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Visita mercados y restaurantes históricos</strong>
              <p>La mejor forma de entender la gastronomía de un período es comer sus platos. Muchos restaurantes centenarios (La Tour d'Argent en París, Sobrino de Botín en Madrid) son museos gastronómicos vivos donde puedes degustar recetas de siglos anteriores.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Sigue los debates contemporáneos</strong>
              <p>La gastronomía del futuro se está escribiendo ahora: sostenibilidad, proteínas alternativas, microbioma intestinal, gastronomía de precisión con IA. Estos debates conectan directamente con las grandes transformaciones históricas que has estudiado.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips Grid */}
        <h3>Claves para entender la evolución culinaria</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>La globalización gastronómica comenzó con las rutas de las especias: la pimienta, la canela y la nuez moscada fueron tan valiosas en la Edad Media como el petróleo hoy. Las guerras por el control del comercio de especias cambiaron el mapa del mundo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔬</span>
            <p>La ciencia y la cocina siempre han estado unidas: Pasteur descubrió la pasteurización estudiando el vino y la cerveza, no los microbios en abstracto. La comprensión de la fermentación fue inseparable del interés gastronómico.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📺</span>
            <p>La televisión democratizó la alta cocina: Julia Child acercó la cocina francesa a los hogares americanos en los años 60, igual que hoy los chefs de YouTube hacen accesibles técnicas profesionales a cualquiera con conexión a internet.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">♻️</span>
            <p>Las tendencias gastronómicas son cíclicas: la fermentación artesanal que hoy se presenta como novedad es la técnica más antigua de la humanidad. La cocina de kilómetro 0 recupera lo que era la norma antes de la industrialización alimentaria.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>⚠️ Las fechas de la prehistoria gastronómica son aproximadas</strong>
          <ul>
            <li>Los hallazgos arqueológicos alimenticios son escasos: los alimentos se descomponen con el tiempo y la evidencia de técnicas culinarias antiguas se basa en inferencias a partir de herramientas, semillas carbonizadas y análisis de grasas en cerámicas.</li>
            <li>Las fechas de períodos como la Revolución Neolítica varían significativamente según la región geográfica: la agricultura surgió antes en el Creciente Fértil (c. 10000 a.C.) que en China (c. 7000 a.C.) o América (c. 5000 a.C.).</li>
            <li>Las atribuciones de inventos culinarios (quién creó el pan, la cerveza o el queso primero) son objeto de debate académico permanente a medida que nuevos hallazgos modifican la cronología establecida.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-gastronomia')} />
      <ShareCard appName="visualizador-historia-gastronomia" />
      <Footer appName="visualizador-historia-gastronomia" />
    </div>
  );
}
