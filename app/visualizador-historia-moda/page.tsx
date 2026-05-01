'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaModa.module.css';
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

type Categoria = 'premoderna' | 'cortesana' | 'burguesa' | 'moderna' | 'contemporanea' | 'digital';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoModa {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  disenadores: string[];
  caracteristicas: string[];
  hito: string;
  preguntaCentral: string;
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

const PERIODOS: PeriodoModa[] = [
  {
    id: 'medieval_tardia', nombre: 'Moda Medieval Tardía y Gótica', anioInicio: 1300, anioFin: 1500,
    categoria: 'premoderna',
    disenadores: ['Sastres de la corte borgoñona', 'Modistas de la corte de Borgoña'],
    caracteristicas: ['Houppelands (vestido de manga amplia)', 'Puntera de zapato exageradamente larga (poulaine)', 'Colores intensos y brocados', 'Distinción social por la tela y el color', 'Primera legislación suntuaria (leyes que regulaban el lujo)'],
    hito: 'Corte de Borgoña (siglo XV) — el primer "árbitro de la moda" europeo; Felipe III el Bueno establece el negro como color de poder',
    preguntaCentral: '¿Puede la ropa codificar el poder y el rango social con precisión?',
    contexto: 'En la Edad Media tardía, la moda era política. Las leyes suntuarias prohibían a los burgueses usar sedas o pieles reservadas a la nobleza. La corte borgoñona bajo Felipe III fue el primer centro de moda europeo — sus tendencias (el negro como color de lujo, las mangas exageradas) se imitaban en toda Europa.',
    color: '#4B0082',
  },
  {
    id: 'renacimiento', nombre: 'Moda Renacentista', anioInicio: 1450, anioFin: 1600,
    categoria: 'premoderna',
    disenadores: ['Modistas de las cortes florentina y española'],
    caracteristicas: ['Vestidos con estructura (farthingale/verdugado)', 'Gorgueras de encaje (ruff)', 'Terciopelo, brocado y oro en los tejidos', 'Distinción entre norte y sur europeo', 'Influencia española en la moda de corte (negro austero)'],
    hito: 'Verdugado español (farthingale) — la primera prenda estructurada de la historia, base de todas las crinolinas futuras',
    preguntaCentral: '¿Cómo la ropa refleja el ideal humanista del cuerpo y la riqueza del Renacimiento?',
    contexto: 'El Renacimiento italiano trajo colores vivos, tejidos lujosos y cuerpos esculturales. La España de Carlos V impuso el negro austero y las gorgueras. El verdugado (farthingale) estructuró la silueta femenina artificialmente — base de todas las crinolinas hasta el siglo XIX. Los retratos de Holbein o Tiziano son el archivo de moda del Renacimiento.',
    color: '#B8860B',
  },
  {
    id: 'barroco', nombre: 'Barroco y Absolutismo — Luis XIV, el Rey Sol', anioInicio: 1600, anioFin: 1715,
    categoria: 'cortesana',
    disenadores: ['Modistas de Versalles', 'Jean Berain'],
    caracteristicas: ['Peluca empolvada como símbolo de estatus', 'Encajes de Alençon y Flandes', 'Tacón como calzado de poder (Luis XIV medía 162 cm)', 'Vestido de corte francés como norma europea', 'Versalles como primer centro de moda internacional'],
    hito: 'Luis XIV y Versalles (1682) — primera "capital de la moda" del mundo; las muñecas de moda (pandoras) difunden tendencias a toda Europa',
    preguntaCentral: '¿Puede la moda ser instrumento de poder político?',
    contexto: 'Luis XIV convirtió la moda en política de Estado. Versalles se convirtió en el centro de la moda mundial: Paris exportaba tendencias mediante "pandoras" — muñecas vestidas con los últimos modelos. El tacón fue inventado para que el Rey Sol (1,62 m) pareciera más alto. El encaje francés se convirtió en símbolo de riqueza continental.',
    color: '#8B0000',
  },
  {
    id: 'rococo', nombre: 'Rococó y Moda del Antiguo Régimen', anioInicio: 1715, anioFin: 1790,
    categoria: 'cortesana',
    disenadores: ['Rose Bertin (modista de María Antonieta)', 'Charles Frederick Worth (proto)'],
    caracteristicas: ['Panier — armazón lateral que ensanchaba las caderas', 'Marie Antoinette y los peinados con barcos y jardines', 'Tejidos estampados (toile de Jouy)', 'Primera "it girl" de la historia: Marie Antoinette', 'Rose Bertin — primera modista de nombre reconocido'],
    hito: 'Rose Bertin, "ministra de la moda" de María Antonieta (1770-1792) — primera diseñadora de moda de la historia con nombre propio',
    preguntaCentral: '¿Puede una persona convertirse en símbolo de moda y desestabilización política a la vez?',
    contexto: 'María Antonieta gastaba 30 millones de libras anuales en ropa — equivalente a 10 millones de euros modernos. Rose Bertin fue la primera "fashion designer" de la historia con nombre y reconocimiento público. Los peinados de la reina —con barcos, jardines y jaulas de pájaros— llegaron a medir metro y medio. La Revolución guillotinó la moda de corte.',
    color: '#FFB6C1',
  },
  {
    id: 'neoclasico', nombre: 'Neoclásico y Restauración — El Corsé Regresa', anioInicio: 1790, anioFin: 1850,
    categoria: 'burguesa',
    disenadores: ['Léroy (modista de Josephine Bonaparte)', 'Charles Frederick Worth (inicio)'],
    caracteristicas: ['Vestido Empire (talle alto, línea suelta)', 'Influencia de la Antigüedad griega y romana', 'Retorno del corsé tras la Revolución', 'Musselina blanca como tejido dominante', 'Moda masculina simplificada (Beau Brummell y el dandy)'],
    hito: 'Beau Brummell (1778-1840) — primer hombre que convirtió su vestimenta en arte; inventó el traje oscuro moderno masculino',
    preguntaCentral: '¿Puede la Revolución Francesa cambiar definitivamente la forma de vestir?',
    contexto: 'La Revolución eliminó el rococó excesivo y sustituyó el panier por el vestido Imperio de talle alto. Joséphine de Beauharnais usó la moda napoleónica para política diplomática. Beau Brummell en Londres inventó el dandy: perfección de la línea masculina con ropa oscura y planchada — origen del traje moderno.',
    color: '#F5F5DC',
  },
  {
    id: 'victoriana', nombre: 'Moda Victoriana y Alta Costura', anioInicio: 1837, anioFin: 1900,
    categoria: 'burguesa',
    disenadores: ['Charles Frederick Worth', 'Elsa Schiaparelli (proto)', 'Redfern'],
    caracteristicas: ['Crinolina — falda con armazón de acero (1856)', 'Corsé como disciplina del cuerpo femenino', 'Nacimiento de la Alta Costura (Worth, 1858)', 'Bustles (polisón) en los años 1870-1890', 'Primera maison de moda con nombre de diseñador'],
    hito: 'Charles Frederick Worth funda su maison (1858) — inventa la Alta Costura, el sistema de desfiles y la etiqueta con nombre de diseñador',
    preguntaCentral: '¿Puede la moda ser industria artística con un "autor" reconocible como el pintor o el escultor?',
    contexto: 'Worth (1826-1895) inventó la Alta Costura: presentó colecciones dos veces al año, cosió su nombre en las prendas y usó maniquíes vivos. La crinolina de acero (1856) liberó a las mujeres del peso de enaguas — pero las aprisionó de otra manera. El corsé fue símbolo de opresión y empoderamiento a la vez hasta los años 1920.',
    color: '#800080',
  },
  {
    id: 'belle_epoque', nombre: 'Belle Époque y Art Nouveau', anioInicio: 1900, anioFin: 1914,
    categoria: 'moderna',
    disenadores: ['Paul Poiret', 'Mariano Fortuny', 'Jeanne Paquin'],
    caracteristicas: ['Poiret libera a la mujer del corsé (1906)', 'Línea S o de paloma (corset salud)', 'Pantalones para mujer (Poiret)', 'Vestido Delphos de Fortuny — plisado atemporal', 'Inspiración en Oriente y el modernismo'],
    hito: 'Paul Poiret (1906) — elimina el corsé y presenta pantalones para mujer; la primera revolución feminista de la moda',
    preguntaCentral: '¿Puede la moda anticipar la emancipación de la mujer o va siempre detrás?',
    contexto: 'Paul Poiret fue el primer diseñador moderno: eliminó el corsé en 1906, inventó el traje-pantalón para mujer, organizó los primeros desfiles temáticos con música y champán. Fortuny creó el Delphos — un vestido plisado atemporal que todavía se vende hoy. La Primera Guerra Mundial lo cambió todo.',
    color: '#DEB887',
  },
  {
    id: 'entreguerras', nombre: 'Entreguerras — Chanel y la Modernidad', anioInicio: 1920, anioFin: 1940,
    categoria: 'moderna',
    disenadores: ['Coco Chanel', 'Elsa Schiaparelli', 'Madeleine Vionnet', 'Jeanne Lanvin'],
    caracteristicas: ['Chanel N°5 — perfume como extensión de la moda', 'El "little black dress" de Chanel (1926)', 'Jersey y tela de punto para mujer', 'Schiaparelli y el surrealismo (vestido langosta)', 'Silueta andrógina — los años locos (1920s)'],
    hito: 'Chanel N°5 (1921) y el Little Black Dress (1926) — Coco Chanel inventa la moda moderna femenina basada en la comodidad y el lujo sutil',
    preguntaCentral: '¿Puede la comodidad ser lujosa? ¿La moda puede ser feminista?',
    contexto: 'Coco Chanel convirtió el jersey de punto (tejido masculino) en moda femenina, liberó a las mujeres del corsé definitivamente y creó el LBD — el "pequeño vestido negro". Schiaparelli colaboró con Dalí y Cocteau para crear moda surrealista. Los años 20 vieron a la mujer cortar el pelo, acortar las faldas y bailar jazz.',
    color: '#2F4F4F',
  },
  {
    id: 'new_look', nombre: 'New Look y la Posguerra — Dior', anioInicio: 1947, anioFin: 1960,
    categoria: 'moderna',
    disenadores: ['Christian Dior', 'Cristóbal Balenciaga', 'Hubert de Givenchy'],
    caracteristicas: ['New Look (1947) — talle de avispa, falda larga y amplia', 'Vuelta a la feminidad de postal tras la austeridad bélica', 'Balenciaga — el arquitecto de la moda', 'Brigitte Bardot y el sex appeal mediterráneo', 'El sistema H, A, Y de Dior (líneas por letras)'],
    hito: 'Christian Dior New Look (1947) — falda midi y talle de avispa; Carmel Snow (Harper\'s Bazaar): "It\'s quite a new look!" — la frase que nombró una era',
    preguntaCentral: '¿Tiene la moda responsabilidad moral en tiempos de austeridad?',
    contexto: 'El New Look de Dior en 1947 usó 20 metros de tela por vestido — escandaloso en la Europa de posguerra con racionamiento textil. "¡Vergüenza a Dior!" protestaron en las calles de Londres. Pero fue un éxito: las mujeres querían recuperar la feminidad lujosa de antes de la guerra. Balenciaga era el contrapunto: arquitectura sin talle de avispa.',
    color: '#CD5C5C',
  },
  {
    id: 'anos_sesenta', nombre: 'Años 60 y 70 — Contracultura y Liberación', anioInicio: 1960, anioFin: 1980,
    categoria: 'contemporanea',
    disenadores: ['Mary Quant', 'André Courrèges', 'Yves Saint Laurent', 'Hubert de Givenchy'],
    caracteristicas: ['Minifalda (Mary Quant, 1965)', 'Prêt-à-porter como democratización', 'Pantalones para mujer en contextos formales (YSL, 1966)', 'Estética hippie y étnica', 'Moda unisex y andrógina'],
    hito: 'Mary Quant y la minifalda (1965) — símbolo de la liberación sexual y generacional; las rodillas de la mujer como revolución política',
    preguntaCentral: '¿Puede la moda ser instrumento de revolución generacional y feminista?',
    contexto: 'La minifalda de Mary Quant (1965) fue la revolución cultural más visible de los años 60: enseñar las rodillas era un acto político. YSL presentó el primer esmoquin para mujer (1966) — las mujeres en pantalón en contextos formales. La contracultura hippie introdujo la estética étnica y artesanal como alternativa al sistema de moda.',
    color: '#FF6347',
  },
  {
    id: 'pret_a_porter', nombre: 'Prêt-à-Porter y Diseño Italiano', anioInicio: 1975, anioFin: 1995,
    categoria: 'contemporanea',
    disenadores: ['Giorgio Armani', 'Calvin Klein', 'Gianni Versace', 'Vivienne Westwood'],
    caracteristicas: ['Armani — el poder suit femenino', 'Calvin Klein y el minimalismo americano', 'Punk y Vivienne Westwood (1976)', 'Supermodelos como celebridades (años 80-90)', 'MTV y la moda como espectáculo global'],
    hito: 'Giorgio Armani (1975) — deconstruye el traje masculino y lo convierte en moda femenina de poder; la chaqueta Armani como símbolo del éxito ejecutivo',
    preguntaCentral: '¿Puede la moda ser simultáneamente artesanía de lujo y producción masiva?',
    contexto: 'Armani reinventó el traje de chaqueta eliminando el forro y aflojando la estructura — símbolo del poder ejecutivo de los años 80. Calvin Klein llevó el minimalismo americano al denim con Brooke Shields (1980). Westwood canalizó la rabia punk en moda. Las supermodelos — Naomi, Cindy, Linda, Claudia — cobraban más que los directores ejecutivos.',
    color: '#20B2AA',
  },
  {
    id: 'globalizacion', nombre: 'Globalización y Fast Fashion', anioInicio: 1990, anioFin: 2015,
    categoria: 'contemporanea',
    disenadores: ['John Galliano', 'Alexander McQueen', 'Nicolas Ghesquière', 'Karl Lagerfeld'],
    caracteristicas: ['Zara y H&M — moda de usar y tirar', 'Internet y las primeras tiendas online', 'Globalización de la producción textil (Bangladesh, China)', 'El modelo Zara: 2 semanas de diseño a tienda', 'Crisis: 1.134 muertos en el Rana Plaza (2013)'],
    hito: 'Rana Plaza, Bangladesh (2013) — derrumbe que mató a 1.134 trabajadores textiles; el fast fashion como catástrofe humanitaria y ambiental',
    preguntaCentral: '¿A qué precio humano y medioambiental producimos ropa barata?',
    contexto: 'Zara (Inditex) revolucionó la distribución: de diseño a tienda en 2 semanas con 8 colecciones anuales. H&M, Primark y Shein siguieron el modelo. El derrumbe del Rana Plaza (2013) reveló las condiciones de los 80 millones de trabajadores textiles del mundo. El fast fashion produce el 10% de las emisiones de CO₂ globales.',
    color: '#DC143C',
  },
  {
    id: 'sostenible', nombre: 'Moda Sostenible y Consciente', anioInicio: 2010, anioFin: 9999,
    categoria: 'digital',
    disenadores: ['Stella McCartney', 'Patagonia', 'Eileen Fisher', 'Phoebe Philo'],
    caracteristicas: ['Fashion Revolution — "¿quién hizo tu ropa?"', 'Materiales reciclados y orgánicos', 'Segunda mano y vintage como tendencia', 'Certificaciones (GOTS, OEKO-TEX, Fair Trade)', 'Greenwashing vs sostenibilidad real'],
    hito: 'Fashion Revolution Week (2013, aniversario Rana Plaza) — movimiento global que exige transparencia en la cadena de suministro textil',
    preguntaCentral: '¿Puede la industria de la moda ser compatible con la sostenibilidad ambiental y social?',
    contexto: 'Stella McCartney construyó el primer gran grupo de moda de lujo sin pieles ni cuero (2001). Patagonia declara la guerra al fast fashion y garantiza reparación de sus prendas. El mercado de segunda mano (Vinted, Depop, ThredUp) creció un 400% entre 2019 y 2024. Sin embargo, Shein produce 10.000 nuevos diseños diarios — el anti-sostenible.',
    color: '#228B22',
  },
  {
    id: 'digital_moda', nombre: 'Moda Digital e Inteligencia Artificial', anioInicio: 2020, anioFin: 9999,
    categoria: 'digital',
    disenadores: ['The Fabricant', 'Balenciaga (Demna)', 'Valentino', 'Daniel Roseberry (Schiaparelli)'],
    caracteristicas: ['Moda virtual y NFTs de ropa digital', 'Desfiles en metaverso (Roblox, Decentraland)', 'IA generativa en diseño de patrones', 'Influencers virtuales (Lil Miquela)', 'Tejidos inteligentes y wearables tecnológicos'],
    hito: 'The Fabricant vende el primer vestido digital por 9.500$ (2019) — la moda virtual como mercado emergente',
    preguntaCentral: '¿Tiene sentido la ropa si nunca se toca ni se lleva físicamente?',
    contexto: 'The Fabricant vendió el primer vestido 100% digital en 2019. Fortnite vende 100 millones de "skins" anuales. Balenciaga desfiló en Fortnite (2021). Las IA generativas diseñan patrones, predicen tendencias y personalizan colecciones. Lil Miquela, influencer virtual con 3 millones de seguidores, protagoniza campañas de Prada. La moda se digitalizó.',
    color: '#FF1493',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1858, evento: 'Charles Frederick Worth funda la primera maison de Alta Costura — nace la industria de la moda moderna' },
  { anio: 1906, evento: 'Paul Poiret elimina el corsé — primera revolución feminista de la moda' },
  { anio: 1926, evento: 'Coco Chanel presenta el "little black dress" — símbolo atemporal de elegancia femenina' },
  { anio: 1947, evento: 'Christian Dior lanza el New Look — primera polémica global sobre el rol de la moda en posguerra' },
  { anio: 1965, evento: 'Mary Quant populariza la minifalda — símbolo visual de la liberación generacional de los años 60' },
  { anio: 1975, evento: 'Giorgio Armani deconstruye el traje de chaqueta — la moda de poder ejecutivo de los años 80' },
  { anio: 2013, evento: 'Derrumbe del Rana Plaza — 1.134 muertos; el fast fashion como catástrofe humanitaria internacional' },
  { anio: 2019, evento: 'Primer vestido digital NFT vendido por 9.500$ — la moda virtual emerge como mercado' },
  { anio: 2024, evento: 'IA generativa diseña colecciones completas — el rol del diseñador humano se redefine' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  premoderna: 'Premoderna',
  cortesana: 'Cortesana',
  burguesa: 'Burguesa',
  moderna: 'Moderna',
  contemporanea: 'Contemporánea',
  digital: 'Digital',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  premoderna: '#4B0082',
  cortesana: '#8B0000',
  burguesa: '#800080',
  moderna: '#20B2AA',
  contemporanea: '#FF6347',
  digital: '#FF1493',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoModa }) {
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : periodo.anioFin.toString();
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Características clave</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.caracteristicas.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Diseñadores</h4>
          <ul className={styles.artistasList}>
            {periodo.disenadores.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Hito o diseñador icónico</span>
        <p>{periodo.hito}</p>
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

const AÑO_MIN = 1300;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoModa | null>(null);

  const filas: PeriodoModa[][] = [[], [], [], []];
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

  const marcadores: number[] = [1400, 1500, 1600, 1700, 1800, 1850, 1900, 1930, 1960, 1990, 2010];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1300 hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la moda"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de años */}
          {marcadores.map((s) => (
            <g key={s}>
              <line x1={anioAX(s)} y1={FILA_OFFSET_Y} x2={anioAX(s)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{s}</text>
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
  const anioFinTexto = periodo.anioFin === 9999 ? 'actualidad' : periodo.anioFin.toString();

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
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.preguntaCentral}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Características clave</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.caracteristicas.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Diseñadores</h4>
              <ul className={styles.artistasList}>
                {periodo.disenadores.map((d) => <li key={d}>{d}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Hito o diseñador icónico</span>
            <p>{periodo.hito}</p>
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
        per.disenadores.some((d) => d.toLowerCase().includes(termino));
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
        placeholder="Buscar por período o diseñador..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de moda"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Diseñador clave</th>
              <th>Hito icónico</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin === 9999 ? 'actualidad' : per.anioFin.toString();
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
                  <td>{per.disenadores[0]}</td>
                  <td className={styles.preguntaCell}>{per.hito}</td>
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
  { nombre: 'Moda Medieval y Renacentista', desde: 1300, hasta: 1700, icono: '👑' },
  { nombre: 'Alta Costura y Corte', desde: 1700, hasta: 1850, icono: '🎀' },
  { nombre: 'Belle Époque y Primeras Maisons', desde: 1850, hasta: 1914, icono: '🌹' },
  { nombre: 'Modernismo y Liberación', desde: 1914, hasta: 1950, icono: '✂️' },
  { nombre: 'Prêt-à-Porter y Contracultura', desde: 1950, hasta: 1990, icono: '👠' },
  { nombre: 'Fast Fashion y Moda Digital', desde: 1990, hasta: 9999, icono: '📱' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de moda y eventos históricos organizados por eras.
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

export default function VisualizadorHistoriaModa() {
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
        <h1 className={styles.heroTitle}>Historia de la Moda</h1>
        <p className={styles.heroSubtitle}>
          De la corte borgoñona a la moda sostenible — 14 períodos con los diseñadores, tendencias y revoluciones que transformaron el vestir
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
        title="Historia de la moda: períodos y tendencias"
        subtitle="Cómo la moda refleja los cambios políticos, sociales y culturales de cada época"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 períodos clave de la historia de la moda</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Rango</th>
                <th>Categoría</th>
                <th>Diseñador clave</th>
                <th>Hito icónico</th>
                <th>Pregunta central</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Moda Renacentista</strong></td>
                <td>1450–1600</td>
                <td>Premoderna</td>
                <td>Modistas de las cortes florentina y española</td>
                <td>Verdugado español — primera prenda estructurada</td>
                <td>¿Cómo refleja la ropa el ideal humanista?</td>
              </tr>
              <tr>
                <td><strong>Moda Victoriana y Alta Costura</strong></td>
                <td>1837–1900</td>
                <td>Burguesa</td>
                <td>Charles Frederick Worth</td>
                <td>Worth funda la Alta Costura (1858)</td>
                <td>¿Puede la moda ser industria artística con autor?</td>
              </tr>
              <tr>
                <td><strong>Chanel y la Modernidad</strong></td>
                <td>1920–1940</td>
                <td>Moderna</td>
                <td>Coco Chanel</td>
                <td>Little Black Dress (1926)</td>
                <td>¿Puede la comodidad ser lujosa?</td>
              </tr>
              <tr>
                <td><strong>New Look — Dior</strong></td>
                <td>1947–1960</td>
                <td>Moderna</td>
                <td>Christian Dior</td>
                <td>New Look (1947) — talle de avispa</td>
                <td>¿Tiene la moda responsabilidad moral?</td>
              </tr>
              <tr>
                <td><strong>Prêt-à-Porter</strong></td>
                <td>1975–1995</td>
                <td>Contemporánea</td>
                <td>Giorgio Armani</td>
                <td>Chaqueta Armani como símbolo de poder</td>
                <td>¿Puede la moda ser lujo y producción masiva?</td>
              </tr>
              <tr>
                <td><strong>Moda Sostenible</strong></td>
                <td>2010–hoy</td>
                <td>Digital</td>
                <td>Stella McCartney</td>
                <td>Fashion Revolution Week (2013)</td>
                <td>¿Puede la moda ser sostenible?</td>
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
              <strong>Estudiante de diseño de moda o historia</strong>
              <p>Contextualiza los períodos y movimientos que estudia, identifica diseñadores clave y comprende las tendencias que influyeron en cada época de la moda europea y global.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👗</span>
            <div>
              <strong>Profesional de la moda</strong>
              <p>Entiende la evolución de su industria y a sus maestros: de Worth a Chanel, de Dior a McQueen. La historia como fuente de inspiración y referencia profesional.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Consumidor consciente</strong>
              <p>Quiere entender el impacto del fast fashion y las alternativas sostenibles, y tomar decisiones de compra informadas conociendo de dónde viene la ropa que lleva.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Curioso cultural</strong>
              <p>Explora la moda como espejo de la historia política y social: cómo cada época viste refleja sus valores, sus conflictos y sus revoluciones.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuándo nació realmente la "moda" como concepto moderno?</strong>
            <p>La moda como fenómeno social consciente de sí mismo nació en la corte borgoñona del siglo XV — cuando las tendencias se difundían deliberadamente y se imitaban. Pero la moda como industria artística con diseñadores reconocidos nació en 1858 con Charles Frederick Worth, que fundó la primera maison de Alta Costura en París y cosió su nombre en las prendas.</p>
            <span className={styles.faqTip}>Antes de Worth, la ropa era producida por sastres anónimos. Con Worth, nació el concepto de "diseñador de moda" como artista con firma.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es exactamente la Alta Costura y en qué se diferencia del prêt-à-porter?</strong>
            <p>La Alta Costura es ropa hecha a medida por artesanos especializados, con colecciones presentadas en París dos veces al año. Requiere al menos 15 empleados en el taller y 35 horas de trabajo manual por prenda. El prêt-à-porter ("listo para llevar") es ropa producida en serie con tallas estándar, accesible al mercado de masas. La Alta Costura viste a menos de 4.000 personas en todo el mundo.</p>
            <span className={styles.faqTip}>Hoy, la Alta Costura es principalmente un vehículo de marketing para las marcas de lujo — el dinero real está en perfumes y accesorios.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el fast fashion es tan dañino para el medioambiente?</strong>
            <p>La industria textil produce el 10% de las emisiones globales de CO₂ — más que la aviación y la navegación marítimas combinadas. Consume 93.000 millones de metros cúbicos de agua anuales y genera 500.000 toneladas de microfibras plásticas en los océanos. El modelo fast fashion (Shein produce 10.000 diseños diarios) hace que el 73% de la ropa acabe en vertederos o incineradoras.</p>
            <span className={styles.faqTip}>El derrumbe del Rana Plaza (2013) mató a 1.134 trabajadoras textiles en Bangladesh — el símbolo del coste humano de la ropa barata.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Fue Coco Chanel realmente una feminista?</strong>
            <p>Es una pregunta compleja. Chanel liberó a las mujeres del corsé, introdujo pantalones y tejidos cómodos en la moda femenina y creó una estética de independencia. Pero también fue colaboradora durante la ocupación nazi de Francia y utilizó la imagen de la mujer independiente para vender lujo, no para subvertir el sistema. El feminismo de Chanel era real en sus prendas, pero ambivalente en su ideología.</p>
            <span className={styles.faqTip}>Simone de Beauvoir y Chanel fueron contemporáneas en París — representan dos visiones muy distintas de la emancipación femenina.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Tiene futuro la moda sostenible o es solo marketing?</strong>
            <p>Ambas cosas coexisten. El mercado de segunda mano (Vinted, Depop, ThredUp) creció un 400% entre 2019 y 2024 — eso es real. Patagonia y Eileen Fisher han demostrado que la sostenibilidad es un modelo de negocio viable. Pero el "greenwashing" está generalizado: marcas que venden colecciones "eco" mientras su producción total sigue creciendo. La certificación GOTS u OEKO-TEX es un indicador más fiable que las etiquetas de marketing.</p>
            <span className={styles.faqTip}>La pregunta clave no es "¿es esta prenda sostenible?" sino "¿necesito comprar una prenda nueva?"</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Cómo estudiar un período de la historia de la moda</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica el contexto político y social</strong>
              <p>La moda nunca existe en el vacío. El New Look de Dior (1947) solo se entiende en la posguerra; la minifalda (1965) solo se entiende con la liberación sexual de los años 60. Pregúntate: ¿qué estaba pasando en el mundo cuando apareció esta tendencia?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Localiza el diseñador o innovador central</strong>
              <p>Cada período tiene uno o dos nombres que lo simbolizan. No se trata de memorizar biografías, sino de entender qué innovación técnica, estética o comercial introdujeron. Worth inventó los desfiles; Chanel el jersey; Poiret el pantalón femenino.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Identifica la prenda o silueta icónica</strong>
              <p>Cada período tiene una forma característica: el verdugado renacentista, la crinolina victoriana, el talle de avispa del New Look, la minifalda de los 60. La silueta es la síntesis visual de la estética de una época.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Analiza el tejido y la tecnología textil</strong>
              <p>La historia de la moda es inseparable de la historia de los materiales: el brocado medieval, la musselina neoclásica, el jersey de Chanel, el lycra de los 80, los tejidos reciclados actuales. La tecnología textil determina qué formas son posibles en cada época.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Conecta con el período siguiente: reacción o evolución</strong>
              <p>La moda funciona por reacción: el rococó excesivo genera el neoclásico sobrio; la austeridad bélica genera el New Look exuberante; el fast fashion genera la moda sostenible. Entender la tensión entre períodos es clave para entender cada uno de ellos.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Mejores Prácticas */}
        <h3>Consejos para entender la moda como fenómeno histórico y cultural</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>La moda no es superficial: es uno de los sistemas de comunicación no verbal más complejos y políticamente cargados de la historia humana. Lo que llevamos dice quiénes somos, a qué clase pertenecemos y a qué aspiramos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>Los períodos de moda se solapan y reaccionan entre sí. No existen fronteras nítidas: la Belle Époque convive con el inicio del modernismo; el fast fashion convive con la moda sostenible. Evita las categorías rígidas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>Empieza por los retratos pictóricos para entender la moda histórica: Holbein (Renacimiento), Goya (siglo XVIII), Sargent (Belle Époque) son archivos fotográficos de su época antes de que existiera la fotografía.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✅</span>
            <p>Usa la cronología para ver qué diseñador fue pionero y cuáles fueron imitadores. La innovación real en moda es rara: Worth, Chanel, Poiret, Dior, Saint Laurent, McQueen — no más de veinte nombres en 700 años.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Errores frecuentes al estudiar la historia de la moda</strong>
          <ul>
            <li>Creer que Worth o Chanel <strong>"inventaron" la moda</strong>: la moda existía siglos antes. Lo que inventaron fue la industria moderna de la moda — el sistema de colecciones, desfiles y diseñadores con firma.</li>
            <li>Confundir <strong>lujo con calidad o ética</strong>: muchas marcas de lujo producen en los mismos talleres que las de fast fashion. El precio de una prenda no garantiza ni sus condiciones de producción ni su durabilidad.</li>
            <li>Subestimar el <strong>impacto medioambiental del textil</strong>: la industria de la moda es una de las más contaminantes del planeta. Esto no es una exageración activista — es una realidad documentada por la ONU y la UE.</li>
            <li>Pensar que la moda es <strong>"solo superficial"</strong>: la moda ha sido y es un instrumento de poder político (Luis XIV), de emancipación (Chanel, la minifalda), de identidad cultural (punk, hip-hop) y de resistencia social (uniformes de trabajo, ropa de luto, vestimenta política).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-moda')} />
      <ShareCard appName="visualizador-historia-moda" />
      <Footer appName="visualizador-historia-moda" />
    </div>
  );
}
