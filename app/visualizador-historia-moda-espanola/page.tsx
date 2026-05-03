'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaModaEspanola.module.css';
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
  | 'medieval'
  | 'siglo_oro'
  | 'barroco'
  | 'borbones'
  | 'romantico'
  | 'modistos'
  | 'autarquia'
  | 'desarrollismo'
  | 'movida'
  | 'galicia'
  | 'fast_fashion'
  | 'lujo'
  | 'sostenible';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoModa {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  disenador: string;
  tendencia: string;
  impacto: string;
  datos: string;
  categoria: Categoria;
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
    id: 1, periodo: '1400–1516', anio: 1400, anioFin: 1516,
    titulo: 'Indumentaria Medieval y Castellana',
    descripcion: 'La Corte de los Reyes Católicos establece los cánones de la moda peninsular. El brial y la saya son las prendas femeninas principales, mientras que los hombres visten jubón y capa. La influencia mora y judía enriquece los bordados y los tejidos. Toledo produce los mejores paños de lana, Valencia exporta sedas a toda Europa y Burgos es el centro de los bordados castellanos.',
    innovacion: 'Tejidos de Toledo, sedas valencianas, bordados de Burgos, influencia multicultural',
    disenador: 'Talleres reales de Isabel I de Castilla',
    tendencia: 'Brial y saya medieval, jubón y capa',
    impacto: 'La Corte de los Reyes Católicos establece el primer canon de elegancia propiamente español, diferenciado de la moda borgoñona que dominaba Europa.',
    datos: 'Isabel I de Castilla tenía un inventario de más de 200 vestidos. Algunos de sus trajes pesaban más de 10 kilos por los bordados y adornos en oro.',
    categoria: 'medieval',
  },
  {
    id: 2, periodo: '1516–1600', anio: 1516, anioFin: 1600,
    titulo: 'El Siglo de Oro: España Dicta la Moda Europea',
    descripcion: 'Felipe II impone el negro a toda Europa como color de la elegancia máxima, influenciado por el severo calvinismo y la austeridad borgoñona. La gorguera, ese cuello rígido de encaje que enmarca el rostro, se convierte en el símbolo del poder español. La ropilla (jubón corto), la capa y las calzas completan el traje masculino. La Corte española es el árbitro de elegancia de todo el continente.',
    innovacion: 'Gorguera de encaje, color negro como símbolo de poder, ropilla y capa española',
    disenador: 'Sastres de la Corte de Felipe II en Madrid y El Escorial',
    tendencia: 'Negro absoluto, gorguera rígida, austeridad elegante',
    impacto: 'España impone el negro y la gorguera a todas las cortes europeas durante casi un siglo. El estilo español es el estilo europeo en el Renacimiento tardío.',
    datos: 'La gorguera (cuello de encaje almidonado) requería hasta 15 metros de encaje por pieza. Su mantenimiento diario costaba el equivalente al salario semanal de un artesano.',
    categoria: 'siglo_oro',
  },
  {
    id: 3, periodo: '1600–1700', anio: 1600, anioFin: 1700,
    titulo: 'El Barroco y los Excesos Cortesanos',
    descripcion: 'Velázquez inmortaliza la moda de su época: en Las Meninas (1656), la infanta Margarita viste el guardainfante, esa enorme estructura que extiende la falda lateralmente hasta extremos grotescos. Los encajes flamencos sustituyen a la gorguera rígida. Francia comienza a disputar a España el liderazgo de la moda europea bajo Luis XIV. El declive del Imperio español se refleja en el paulatino abandono de sus cánones de moda.',
    innovacion: 'Guardainfante, encajes flamencos, explosión decorativa barroca',
    disenador: 'Talleres de la Corte de Carlos II / pinturas de Velázquez como registro',
    tendencia: 'Guardainfante, encajes flamencos, exceso decorativo',
    impacto: 'Las Meninas de Velázquez (1656) son el mejor documento visual de la moda barroca española. El guardainfante influye en el diseño de la crinolina victoriana dos siglos después.',
    datos: 'El guardainfante podía alcanzar más de 1,5 metros de anchura total. Las puertas de los salones de El Escorial se diseñaron con doble hoja para que las damas pudiesen entrar lateralmente.',
    categoria: 'barroco',
  },
  {
    id: 4, periodo: '1700–1800', anio: 1700, anioFin: 1800,
    titulo: 'Los Borbones y la Influencia Francesa',
    descripcion: 'Felipe V llega de Versalles y trae consigo la moda francesa: casacas, pelucas empolvadas y tacones rojos. Sin embargo, el pueblo español resiste con sus propias modas: las majas y los majos lucen trajes propios (chaquetilla corta, basquiña, mantilla) como afirmación de identidad popular frente a la moda afrancesada de la aristocracia. Goya retrata magníficamente esta dualidad en sus pinturas.',
    innovacion: 'Moda borbónica francesa vs. maja popular española, mantilla y peineta',
    disenador: 'Francisco de Goya (cronista visual) / modistas de la calle de la Montera, Madrid',
    tendencia: 'Dualidad maja-aristocracia, traje popular español como resistencia',
    impacto: 'La imagen de la maja (inmortalizada por Goya) se convierte en símbolo de identidad nacional española frente a la homogeneización europea. La mantilla y la peineta sobreviven hasta hoy como iconos culturales.',
    datos: 'La Duquesa de Alba posó para Goya vestida como maja (no como aristócrata). Este gesto fue un acto político: reivindicar la moda popular frente a la francesa que imponía la Corte.',
    categoria: 'borbones',
  },
  {
    id: 5, periodo: '1800–1874', anio: 1800, anioFin: 1874,
    titulo: 'El Romanticismo y la Maja Romántica',
    descripcion: 'Prosper Mérimée publica Carmen (1845) y la imagen romántica de la España exótica se exporta a toda Europa: la mujer española como símbolo de pasión, con mantilla, peineta y traje de volantes flamencos. El Romanticismo europeo exotiza la moda española y el traje regional se convierte en identidad nacional. En Madrid se consolida la industria de la modistería, con las primeras casas de moda de la calle del Carmen y Preciados.',
    innovacion: 'Traje de volantes flamenco, mantilla romántica, primera modistería madrileña',
    disenador: 'Primeras modistas de Madrid: calle del Carmen y Preciados',
    tendencia: 'Romanticismo exótico, traje regional como identidad, volantes flamencos',
    impacto: 'La imagen de España que Europa consume en el Romanticismo está construida sobre la moda: mantilla, peineta, traje de volantes. Esta imagen persiste en el imaginario colectivo europeo hasta hoy.',
    datos: 'El traje de gitana/flamenca que hoy se asocia con España no es un traje regional histórico: es una construcción romántica del siglo XIX popularizada por los viajeros europeos, especialmente los franceses.',
    categoria: 'romantico',
  },
  {
    id: 6, periodo: '1874–1936', anio: 1874, anioFin: 1936,
    titulo: 'Los Grandes Modistos Españoles en París',
    descripcion: 'Mariano Fortuny (1871-1949) revoluciona la moda con el Delphos dress (1909), un vestido plisado inspirado en la Grecia clásica que libera el cuerpo femenino de corsés y estructuras. Es el primer diseñador español con reconocimiento internacional en París. En España, Pedro Rodríguez y Manuel Pertegaz fundan las bases de la Alta Costura española. La influencia del flamenco en los años 20 lleva los volantes y el ritmo visual a las colecciones de Balenciaga (aún en España).',
    innovacion: 'Delphos dress de Fortuny, liberación del corsé, alta costura española naciente',
    disenador: 'Mariano Fortuny (Venecia/París) / primeros atisbos de Cristóbal Balenciaga',
    tendencia: 'Modernismo, liberación femenina, inspiración greco-clásica',
    impacto: 'El Delphos dress de Fortuny es considerado una revolución equiparable a la de Chanel: libera el cuerpo femenino del corsé. Sus vestidos de terciopelo y seda son hoy piezas de museo.',
    datos: 'El Delphos dress patentado en 1909 no revelaba jamás su secreto de plisado. Fortuny se lo llevó a la tumba. Hoy, los investigadores textiles siguen intentando reproducirlo fielmente.',
    categoria: 'modistos',
  },
  {
    id: 7, periodo: '1936–1959', anio: 1936, anioFin: 1959,
    titulo: 'Autarquía, Posguerra y Balenciaga en París',
    descripcion: 'La Guerra Civil y la posguerra imponen escasez de tejidos y racionamiento de ropa. ASMODE (Asociación de Modistas de España) trata de mantener viva la industria. Mientras tanto, Cristóbal Balenciaga abre su casa en París en 1937 y se convierte en el "Rey de la Moda" entre 1947 y 1968: Dior lo considera "el único maestro de todos nosotros". En España, uniformes y austeridad; en París, la revolución estética de un español de Getaria.',
    innovacion: 'Alta Costura Balenciaga en París, escasez en España, escuela de corte y confección',
    disenador: 'Cristóbal Balenciaga (París) / ASMODE (España)',
    tendencia: 'Contraste total: austeridad forzosa en España, genio creativo en el exilio',
    impacto: 'Balenciaga crea en París la silueta semiesférica, el traje de saco y el vestido globo que definirán la moda de los años 50 y 60. Es el diseñador más influyente del siglo XX según muchos críticos.',
    datos: 'Christian Dior dijo de Balenciaga: "Es el único de nosotros que es un couturier en el verdadero sentido de la palabra. Los demás somos sólo diseñadores." Balenciaga corta, construye y cose él mismo.',
    categoria: 'autarquia',
  },
  {
    id: 8, periodo: '1959–1975', anio: 1959, anioFin: 1975,
    titulo: 'El Desarrollismo y el Prêt-à-Porter',
    descripcion: 'El Plan de Estabilización (1959) abre España al exterior: turismo, televisión y revistas internacionales traen nuevas modas. Pedro Rodríguez (Madrid) y Elio Berhanyer establecen la Alta Costura española. Loewe consolida su posición como casa de lujo española con sus bolsos de piel. La primera Pasarela Cibeles tiene sus antecedentes en estos años. Llegada del prêt-à-porter: la moda deja de ser solo para la élite.',
    innovacion: 'Prêt-à-porter, apertura exterior, alta costura española consolidada, Loewe',
    disenador: 'Pedro Rodríguez / Elio Berhanyer / Loewe (casa fundada 1846, consolidación en los 60)',
    tendencia: 'Modernidad aperturista, prêt-à-porter, moda accesible',
    impacto: 'El desarrollismo transforma el consumo de moda en España: de la ropa hecha en casa o por modistas locales a las primeras tiendas de ropa fabricada industrialmente. La clase media española comienza a vestir moda.',
    datos: 'Loewe fue fundada en 1846 por un artesano alemán en Madrid. En los años 60 se convirtió en la primera marca española de moda de lujo reconocida internacionalmente. En 1996, LVMH la adquiere.',
    categoria: 'desarrollismo',
  },
  {
    id: 9, periodo: '1975–1992', anio: 1975, anioFin: 1992,
    titulo: 'La Movida y la Explosión Creativa',
    descripcion: 'Con la muerte de Franco y la Transición, la moda española explota en creatividad: Agatha Ruiz de la Prada (1981) presenta colecciones de colores desbordantes y formas geométricas que convierten la moda en arte. Francis Montesinos en Valencia redefine el diseño conceptual español. La Movida Madrileña (1977-1985) es tanto fenómeno musical y cinematográfico como estético. La Pasarela Cibeles se inaugura en 1985 como plataforma del diseño español.',
    innovacion: 'Pasarela Cibeles (1985), Movida Madrileña como estética, diseño conceptual español',
    disenador: 'Agatha Ruiz de la Prada / Francis Montesinos / Paco Rabanne (español en París)',
    tendencia: 'Color desbordante, geometría, transgresión, arte wearable',
    impacto: 'La Movida Madrileña sitúa a Madrid en el mapa cultural mundial. Agatha Ruiz de la Prada convierte la moda en activismo de color. España se proyecta como país creativo y moderno.',
    datos: 'Agatha Ruiz de la Prada presentó su primera colección en 1981 sin financiación: los 23 vestidos estaban hechos con telas compradas en el rastro. Hoy tiene más de 40 licencias internacionales.',
    categoria: 'movida',
  },
  {
    id: 10, periodo: '1992–2000', anio: 1992, anioFin: 2000,
    titulo: 'Adolfo Domínguez y la Moda Gallega',
    descripcion: 'Adolfo Domínguez lanza en 1984 el eslogan "La arruga es bella" que revoluciona la moda masculina: el lino sin planchar como elegancia, el minimalismo frente al exceso. Junto a Purificación García y Roberto Verino, consolida la llamada "moda gallega" como corriente de diseño exportable. España comienza a exportar diseñadores a Europa. Inditex (fundada 1985) ya tiene 900 tiendas Zara en todo el mundo.',
    innovacion: '"La arruga es bella", minimalismo gallego, exportación de moda española',
    disenador: 'Adolfo Domínguez / Purificación García / Roberto Verino',
    tendencia: 'Minimalismo, lino natural, elegancia casual, ropa para vivir',
    impacto: 'El minimalismo gallego anticipa en 10 años la tendencia global del "quiet luxury". Adolfo Domínguez es el primer diseñador español en abrir tiendas en Tokio, Londres y Nueva York en los años 90.',
    datos: 'El eslogan "La arruga es bella" fue un escándalo en 1984: la industria textil española presionó a Adolfo Domínguez para que lo retirase. Hoy es uno de los claim publicitarios más recordados de España.',
    categoria: 'galicia',
  },
  {
    id: 11, periodo: '2000–2010', anio: 2000, anioFin: 2010,
    titulo: 'Zara y la Revolución del Fast Fashion',
    descripcion: 'Inditex se convierte en la primera empresa de moda del mundo por capitalización en 2001. El modelo Zara —pasar del diseño a la tienda en dos semanas— revoluciona la industria global. Amancio Ortega, nacido en León, funda el mayor imperio de moda de la historia desde A Coruña. El fast fashion democratiza la moda: cualquier persona puede comprar ropa de tendencia a precios accesibles. El lado oscuro emerge: sobreproducción y condiciones laborales.',
    innovacion: 'Fast fashion, integración vertical total, diseño-producción-venta en 2 semanas',
    disenador: 'Amancio Ortega (Inditex/Zara) / diseñadores anónimos del equipo creativo de Zara',
    tendencia: 'Democratización de la moda, rotación ultrarápida, copia de pasarela en semanas',
    impacto: 'Zara cambia las reglas del juego global: de 2 colecciones al año a 20 microcolecciones. La industria de la moda nunca vuelve a ser la misma. Inditex emplea a más de 165.000 personas en 96 países.',
    datos: 'En 2001, Inditex supera a H&M y Gap como empresa de moda más valiosa del mundo. Amancio Ortega es durante varios años la persona más rica del mundo, con 71.000 millones de euros de patrimonio.',
    categoria: 'fast_fashion',
  },
  {
    id: 12, periodo: '2010–2020', anio: 2010, anioFin: 2020,
    titulo: 'Loewe, Balenciaga y el Lujo Global Español',
    descripcion: 'Jonathan Anderson (irlandés) asume la dirección creativa de Loewe (2013) y la transforma en una de las casas de moda más influyentes del mundo. Demna Gvasalia (georgiano) hace lo mismo en Balenciaga (2015). Paradoja: las dos marcas de lujo más españolas son dirigidas por talentos extranjeros que reinterpretan lo español. Palomo Spain (Sevilla, 2015) redefine la masculinidad con volantes, bordados y referencias flamencas.',
    innovacion: 'Jonathan Anderson en Loewe, Demna en Balenciaga, moda sin género española',
    disenador: 'Jonathan Anderson (Loewe) / Demna Gvasalia (Balenciaga) / Palomo Spain',
    tendencia: 'Lujo conceptual, moda sin género, referencias españolas reimaginadas',
    impacto: 'Loewe se convierte en la marca de lujo de más rápido crecimiento del mundo (2017-2022). El bolso Puzzle y el Amazona son objetos de culto global. Balenciaga regresa a ser una de las 5 marcas más influyentes del mundo.',
    datos: 'El bolso Puzzle de Loewe diseñado por Jonathan Anderson en 2015 vale hoy entre 2.000 y 5.000€. En el mercado de segunda mano, se revende hasta por 8.000€. Es el bolso español más deseado de la historia.',
    categoria: 'lujo',
  },
  {
    id: 13, periodo: '2020–2026', anio: 2020, anioFin: 2026,
    titulo: 'Sostenibilidad, Moda Digital y Crisis del Fast Fashion',
    descripcion: 'La pandemia acelera la reflexión sobre el consumo de moda. Zara lanza Join Life (colección sostenible con algodón orgánico y poliéster reciclado). El Museo Cristóbal Balenciaga en Getaria (Guipúzcoa) se convierte en referente mundial del turismo de moda. La impresión 3D y el diseño paramétrico abren nuevas posibilidades. Los NFT de moda y el metaverso generan expectativas. La moda circular gana terreno.',
    innovacion: 'Moda circular, impresión 3D, NFT de moda, museo Balenciaga, sostenibilidad',
    disenador: 'Equipo sostenibilidad Inditex / nuevos diseñadores emergentes en Madrid y Barcelona',
    tendencia: 'Sostenibilidad, segunda mano, moda circular, digital-físico',
    impacto: 'España lidera la transición hacia la moda circular en Europa: Inditex tiene el mayor programa de recogida y reciclaje textil del mundo. El Museo Balenciaga recibe más de 100.000 visitantes al año.',
    datos: 'Inditex recoge más de 30.000 toneladas de ropa usada al año en sus tiendas. Solo el 1% de la ropa producida globalmente se recicla en nuevas fibras. El reto de la circularidad real está pendiente.',
    categoria: 'sostenible',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1516, evento: 'Carlos I hereda la Corona española — la Corte española se convierte en árbitro de la moda europea' },
  { anio: 1556, evento: 'Felipe II impone el negro y la gorguera como canon de elegancia en toda Europa' },
  { anio: 1656, evento: 'Las Meninas de Velázquez: el mejor documento visual de la moda barroca española' },
  { anio: 1909, evento: 'Mariano Fortuny patenta el Delphos dress — primer diseñador español de alcance global' },
  { anio: 1937, evento: 'Cristóbal Balenciaga abre su casa en París — "el Rey de la Moda" (1947-1968)' },
  { anio: 1975, evento: 'Muerte de Franco — la Transición libera la creatividad: nace la moda española moderna' },
  { anio: 1984, evento: '"La arruga es bella" de Adolfo Domínguez — el minimalismo gallego conquista Europa' },
  { anio: 1985, evento: 'Inauguración de la Pasarela Cibeles — escaparate del diseño español al mundo' },
  { anio: 2001, evento: 'Inditex se convierte en la mayor empresa de moda del mundo por capitalización' },
  { anio: 2013, evento: 'Jonathan Anderson asume la dirección creativa de Loewe — inicio de la nueva era dorada' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  medieval: 'Medieval',
  siglo_oro: 'Siglo de Oro',
  barroco: 'Barroco',
  borbones: 'Borbones',
  romantico: 'Romántico',
  modistos: 'Modistos París',
  autarquia: 'Autarquía',
  desarrollismo: 'Desarrollismo',
  movida: 'La Movida',
  galicia: 'Moda Gallega',
  fast_fashion: 'Fast Fashion',
  lujo: 'Lujo Global',
  sostenible: 'Sostenible',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  medieval: '#8B4513',
  siglo_oro: '#4B0082',
  barroco: '#D2691E',
  borbones: '#DAA520',
  romantico: '#DC143C',
  modistos: '#228B22',
  autarquia: '#696969',
  desarrollismo: '#FF8C00',
  movida: '#FF1493',
  galicia: '#1E90FF',
  fast_fashion: '#2E86AB',
  lujo: '#9370DB',
  sostenible: '#48A9A6',
};

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const AÑO_MIN = 1400;
const AÑO_MAX = 2025;
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

function PanelDetalle({ periodo }: { periodo: PeriodoModa }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: COLORES_CATEGORIA[periodo.categoria] }}>
      <h3 className={styles.detalleTitulo} style={{ color: COLORES_CATEGORIA[periodo.categoria] }}>
        {periodo.titulo}
      </h3>
      <p className={styles.detallePeriodo}>{periodo.periodo}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Innovación clave</h4>
          <ul className={styles.datosList}>
            {periodo.innovacion.split(', ').map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Datos del período</h4>
          <ul className={styles.infoList}>
            <li><strong>Diseñador:</strong> {periodo.disenador}</li>
            <li><strong>Tendencia:</strong> {periodo.tendencia}</li>
          </ul>
        </div>
      </div>

      <div className={styles.lineaIconica}>
        <span className={styles.lineaIconicaLabel}>Impacto histórico</span>
        <p>{periodo.impacto}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Descripción completa</span>
        <p>{periodo.descripcion}</p>
      </div>

      <div className={styles.curiosidadBox}>
        <span className={styles.curiosidadLabel}>Dato curioso</span>
        <p>{periodo.datos}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoModa | null>(null);

  const filas: PeriodoModa[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anio - b.anio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin) + 4 <= anioAX(per.anio)) {
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

  const marcadores: number[] = [1500, 1600, 1700, 1800, 1875, 1936, 1960, 1980, 2000, 2015];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca de 1400 a 2025.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la moda española"
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

          {/* Marcadores de años */}
          {marcadores.map((m) => (
            <g key={m}>
              <line
                x1={anioAX(m)}
                y1={FILA_OFFSET_Y}
                x2={anioAX(m)}
                y2={svgAlto - 16}
                stroke="var(--text-muted)"
                strokeWidth={0.5}
                strokeDasharray="3,4"
              />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">
                {m}
              </text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((per) => {
              const x = anioAX(per.anio);
              const w = Math.max(anioAX(per.anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;
              const color = COLORES_CATEGORIA[per.categoria];

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
                    fill={color}
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
                      {per.titulo.length > 20 ? per.titulo.substring(0, 18) + '…' : per.titulo}
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
  const color = COLORES_CATEGORIA[periodo.categoria];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.periodoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.periodoBtn} ${i === indice ? styles.periodoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: COLORES_CATEGORIA[per.categoria], borderColor: COLORES_CATEGORIA[per.categoria] } : {}}
          >
            {per.periodo}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: color }}>
          <h3>{periodo.titulo}</h3>
          <p>{periodo.periodo}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Tendencia</span>
              <span className={styles.statValue}>{periodo.tendencia.split(',')[0]}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Diseñador emblemático</span>
              <span className={styles.statValue}>{periodo.disenador.split(' /')[0]}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Innovación</span>
              <span className={styles.statValue}>{periodo.innovacion.split(',')[0]}</span>
            </div>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Descripción del período</span>
            <p style={{ fontStyle: 'normal' }}>{periodo.descripcion}</p>
          </div>

          <div className={styles.lineaIconica}>
            <span className={styles.lineaIconicaLabel}>Impacto histórico</span>
            <p>{periodo.impacto}</p>
          </div>

          <div className={styles.curiosidadBox}>
            <span className={styles.curiosidadLabel}>Dato curioso</span>
            <p>{periodo.datos}</p>
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
      const coincideBusqueda =
        !termino ||
        per.titulo.toLowerCase().includes(termino) ||
        per.disenador.toLowerCase().includes(termino) ||
        per.tendencia.toLowerCase().includes(termino) ||
        per.innovacion.toLowerCase().includes(termino);
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
        placeholder="Buscar por período, diseñador o tendencia..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de moda española"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Tendencia</th>
              <th>Diseñador emblemático</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr key={per.id} style={i % 2 === 0 ? { background: `${COLORES_CATEGORIA[per.categoria]}18` } : {}}>
                <td>
                  <strong style={{ color: COLORES_CATEGORIA[per.categoria] }}>{per.titulo}</strong>
                </td>
                <td>{per.periodo}</td>
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
                <td className={styles.tendenciaCell}>{per.tendencia.split(',')[0]}</td>
                <td>{per.disenador.split(' /')[0]}</td>
              </tr>
            ))}
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
  { nombre: 'Moda Imperial', desde: 1400, hasta: 1700, icono: '👑' },
  { nombre: 'Del Barroco al Romanticismo', desde: 1700, hasta: 1874, icono: '🌹' },
  { nombre: 'La Alta Costura Española', desde: 1874, hasta: 1959, icono: '✂️' },
  { nombre: 'Desarrollismo y Movida', desde: 1959, hasta: 1992, icono: '🎨' },
  { nombre: 'Revolución Inditex', desde: 1992, hasta: 2010, icono: '🏪' },
  { nombre: 'Lujo Global y Sostenibilidad', desde: 2010, hasta: 9999, icono: '🌱' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos y eventos de la moda española organizados en 6 grandes eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anio < era.hasta && p.anioFin > era.desde
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
                      style={{
                        background: `${COLORES_CATEGORIA[p.categoria]}1A`,
                        color: COLORES_CATEGORIA[p.categoria],
                        borderColor: `${COLORES_CATEGORIA[p.categoria]}55`,
                      }}
                    >
                      {p.titulo}
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

export default function VisualizadorHistoriaModaEspanola() {
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
        <h1 className={styles.heroTitle}>Historia de la Moda Española</h1>
        <p className={styles.heroSubtitle}>
          De la Corte de los Reyes Católicos a Balenciaga, Loewe e Inditex — 600 años de moda en 13 períodos interactivos
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
        title="Historia de la moda española: 600 años de influencia y creatividad"
        subtitle="Cómo España pasó de dictar la moda europea a crear el modelo de negocio de moda más influyente del siglo XXI"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la historia de la moda española</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Estilo dominante</th>
                <th>Influencia exterior</th>
                <th>País al que influye</th>
                <th>Símbolo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Siglo de Oro (1516–1600)</strong></td>
                <td>Negro, gorguera, austeridad</td>
                <td>Ninguna — España lidera</td>
                <td>Toda Europa</td>
                <td>Gorguera de encaje</td>
              </tr>
              <tr>
                <td><strong>Barroco (1600–1700)</strong></td>
                <td>Guardainfante, encajes</td>
                <td>Encajes flamencos</td>
                <td>Europa occidental</td>
                <td>Guardainfante (Las Meninas)</td>
              </tr>
              <tr>
                <td><strong>Modistos en París (1874–1959)</strong></td>
                <td>Alta Costura, liberación</td>
                <td>Modernismo, Grecia clásica</td>
                <td>Global (Fortuny, Balenciaga)</td>
                <td>Delphos dress / silueta Balenciaga</td>
              </tr>
              <tr>
                <td><strong>La Movida (1975–1992)</strong></td>
                <td>Color, transgresión, arte</td>
                <td>Punk británico, pop americano</td>
                <td>Europa (Agatha, Montesinos)</td>
                <td>Colección Agatha 1981</td>
              </tr>
              <tr>
                <td><strong>Fast Fashion (2000–2010)</strong></td>
                <td>Moda de tendencia accesible</td>
                <td>Pasarelas de París/Milán</td>
                <td>Global (96 países Inditex)</td>
                <td>Zara / modelo fast fashion</td>
              </tr>
              <tr>
                <td><strong>Lujo Global (2010–hoy)</strong></td>
                <td>Lujo conceptual, sin género</td>
                <td>Arte contemporáneo, artesanía</td>
                <td>Global (Loewe, Balenciaga)</td>
                <td>Bolso Puzzle de Loewe</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto de la moda española</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👑</span>
            <div>
              <strong>Poder político y moda</strong>
              <p>Felipe II usó el color negro como arma política: vestir de negro era señal de poder, seriedad y Control. Esto no fue accidental. La moda siempre ha sido lenguaje de poder en España, desde la gorguera que diferenciaba la nobleza del pueblo hasta el traje de Adolfo Domínguez como reivindicación democrática.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
            <div>
              <strong>El modelo Inditex: innovación económica</strong>
              <p>Zara no inventó la ropa barata: inventó la velocidad. Al integrar verticalmente diseño, producción y venta, Inditex redujo el tiempo de respuesta de meses a semanas. Este modelo, replicado por H&M, Primark y Shein, transformó para siempre la economía global de la moda. Con sus pros (democratización) y sus contras (sobreproducción).</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎨</span>
            <div>
              <strong>La Movida: moda como liberación</strong>
              <p>La Movida Madrileña fue primero una revolución estética antes de ser musical. Vestir de forma transgresora en la España de la Transición era un acto político: decir "existimos" y "somos libres". Agatha Ruiz de la Prada, con sus corazones y sus colores imposibles, fue la vanguardia visual de esa generación que salía de 40 años de gris.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>El lujo español reinterpretado</strong>
              <p>La paradoja del lujo español contemporáneo: Loewe (española desde 1846) es dirigida por Jonathan Anderson (irlandés) y Balenciaga (española en el nombre) por Demna Gvasalia (georgiano). Pero ambos reinterpretan referencias españolas: artesanía, flamenco, el Prado, la cerámica. Lo español es la materia prima que talentos internacionales convierten en producto global.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre la historia de la moda española</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué Balenciaga es español si está en París?</strong>
            <p>Cristóbal Balenciaga nació en Getaria (Guipúzcoa) en 1895 y abrió sus primeras casas de moda en San Sebastián, Madrid y Barcelona en los años 20 y 30. La Guerra Civil le obligó a cerrar sus casas españolas y trasladarse a París en 1937, donde abrió su maison. Aunque trabajó toda su vida en París, nunca dejó de ser español: sus colecciones estaban impregnadas de referencias a España (flamencas, religiosas, populares). Cerró su casa en 1968 y murió en Jávea (Alicante) en 1972.</p>
            <span className={styles.faqTip}>El Museo Cristóbal Balenciaga en Getaria (inaugurado en 2011) es uno de los museos de moda más importantes de Europa y recibe más de 100.000 visitantes al año.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el fast fashion y por qué es problemático?</strong>
            <p>El fast fashion es el modelo de producción de ropa de tendencia a bajo coste con rotación ultrarrápida (20+ colecciones al año vs. 2 tradicionales). Lo que democratizó el acceso a la moda también generó externalidades: la industria textil es responsable del 10% de las emisiones globales de CO2, consume el 93.000 millones de litros de agua al año y genera 92 millones de toneladas de residuos textiles. Inditex fue pionero; Shein ha llevado el modelo al extremo.</p>
            <span className={styles.faqTip}>Una camiseta de algodón requiere 2.700 litros de agua para producirse (el equivalente al agua que bebe una persona en 2,5 años). Un jean, entre 7.000 y 10.000 litros.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia a la Alta Costura del prêt-à-porter?</strong>
            <p>La Alta Costura (Haute Couture) es moda hecha enteramente a medida para un cliente específico, con tejidos de la más alta calidad y técnicas artesanales. Una pieza puede requerir cientos de horas de trabajo. El prêt-à-porter ("listo para llevar") es moda de calidad pero producida en serie, con tallas estándar. Solo las casas acreditadas por la Fédération de la Haute Couture et de la Mode de París pueden llamarse oficialmente "Alta Costura".</p>
            <span className={styles.faqTip}>Un traje de Alta Costura de Balenciaga podía costar en los años 50 el equivalente a 50.000€ actuales. Hoy, una pieza de Alta Costura oscila entre 20.000 y 500.000€.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la moda gallega es un fenómeno propio?</strong>
            <p>La concentración de grandes diseñadores en Galicia (Adolfo Domínguez, Purificación García, Roberto Verino, y la propia sede de Inditex en A Coruña) no es accidental. La industria textil gallega tiene raíces históricas en la producción de lino y lana. La cercanía a Portugal y la cultura de la confección familiar crearon un ecosistema favorable. El minimalismo "gallego" es también una respuesta cultural: austeridad y calidad frente al exceso mediterráneo.</p>
            <span className={styles.faqTip}>Adolfo Domínguez abrió su primera tienda en Orense en 1976. Tardó 8 años en llegar a Madrid (1984). Hoy tiene más de 300 puntos de venta en 30 países.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la moda circular y está España preparada para ella?</strong>
            <p>La moda circular busca que las prendas se diseñen para durar, repararse, reutilizarse y reciclarse al final de su vida, en lugar de acabar en vertederos. Inditex tiene el mayor programa de recogida textil del mundo (30.000 toneladas/año) pero solo el 1% de la ropa mundial se recicla en nuevas fibras (la tecnología de reciclaje mecánico pierde calidad; el químico escala lentamente). España tiene potencial: artesanía, segunda mano, diseñadores comprometidos.</p>
            <span className={styles.faqTip}>La plataforma Vinted (usada por millones de españoles) es hoy el mayor escaparate de segunda mano de Europa. En 2023 superó en usuarios a muchas plataformas de moda nueva.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo explorar la historia de la moda española</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Visita el Museo Cristóbal Balenciaga en Getaria</strong>
              <p>El museo, inaugurado en 2011 en el pueblo natal del diseñador, conserva más de 1.200 piezas originales de Balenciaga: vestidos, trajes de noche, bocetos y materiales. Integrado en el palacio de los Aldamar, es imprescindible para entender por qué Dior llamaba a Balenciaga "el único maestro". Reserva entrada online con antelación, especialmente en temporada alta.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Sigue la Semana de la Moda de Madrid (MBFWMadrid)</strong>
              <p>La Semana de la Moda de Madrid (heredera de la Pasarela Cibeles, inaugurada en 1985) se celebra dos veces al año en IFEMA. Es el principal escaparate del diseño español emergente y consolidado. Las colecciones de Agatha Ruiz de la Prada son un espectáculo en sí mismas. La entrada a algunos desfiles es pública o se puede seguir en streaming.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Explora las colecciones históricas en museos</strong>
              <p>El Museo del Traje en Madrid (CIPE) conserva prendas desde el siglo XV hasta hoy. El Museo de Historia de Catalunya tiene colecciones textiles medievales. El Museu Tèxtil i d'Indumentària de Barcelona documenta la industria textil catalana. Todos tienen fondos digitalizados accesibles online.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Visita las tiendas históricas de moda española</strong>
              <p>En Madrid: Loewe en Gran Vía (fundada 1846, reformada por el equipo de Jonathan Anderson). El Corte Inglés de Preciados (historia del comercio textil español del siglo XX). En Barcelona: el barrio del Eixample concentra las boutiques de diseñadores españoles emergentes. En Getaria: además del museo, el taller artesanal de encajes del País Vasco.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Descubre la segunda mano y la moda circular española</strong>
              <p>El Rastro de Madrid (domingo, La Latina) tiene vendedores especializados en moda vintage española de los años 70-90. En Barcelona, el mercado de Sant Antoni tiene sección de ropa vintage. Las plataformas Vinted y Wallapop tienen miles de piezas de diseñadores españoles a precios muy accesibles. La segunda mano es también una forma de aprender historia de la moda.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la moda española</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👗</span>
            <p>La moda española no ha sido lineal: ha alternado períodos de máxima influencia global (Siglo de Oro, Balenciaga, Inditex) con períodos de repliegue y absorción de tendencias externas. Cada vez que España ha tenido poder político o económico, su moda ha trascendido sus fronteras.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✂️</span>
            <p>El flamenco no es solo música y baile: el traje flamenco (bata de cola, volantes, lunares) es uno de los pocos trajes populares que ha influido directamente en la Alta Costura internacional. Balenciaga, Dior y John Galliano han citado explícitamente el flamenco como inspiración.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏭</span>
            <p>España tiene dos modelos de moda completamente opuestos y ambos exitosos: el artesanal de alta calidad (Loewe, Balenciaga) y el industrial de alta velocidad (Inditex, Mango). Pocos países del mundo han logrado ser líderes globales en los dos extremos simultáneamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌐</span>
            <p>Las marcas de moda española más icónicas son dirigidas o cofundadas por extranjeros: Jonathan Anderson (Loewe), Demna Gvasalia (Balenciaga), Isidore Loewe (Loewe, alemán). España ha sido siempre buena absorbiendo talento exterior y convirtiéndolo en algo propio.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox OBLIGATORIO */}
        <div className={styles.warningBox}>
          <strong>Aviso sobre datos históricos y atribuciones de la moda española</strong>
          <ul>
            <li>Las fechas de <strong>apertura de casas de moda, colecciones y eventos</strong> pueden variar según la fuente; este visualizador usa las fechas más ampliamente aceptadas en la historiografía de la moda.</li>
            <li>La <strong>influencia de cada período</strong> es una síntesis interpretativa; la historia de la moda es un campo de investigación en constante revisión académica.</li>
            <li>Los <strong>datos sobre Inditex, fast fashion y sostenibilidad</strong> (emisiones, consumo de agua, residuos) provienen de informes del sector y pueden variar según metodología; consultar los informes de sostenibilidad de las empresas para datos actualizados.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-moda-espanola')} />
      <ShareCard appName="visualizador-historia-moda-espanola" />
      <Footer appName="visualizador-historia-moda-espanola" />
    </div>
  );
}
