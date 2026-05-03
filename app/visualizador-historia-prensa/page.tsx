'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaPrensas.module.css';
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
  | 'imprenta'
  | 'difusion'
  | 'pionero'
  | 'ilustracion'
  | 'masas'
  | 'telegrafo'
  | 'amarillo'
  | 'radio'
  | 'investigacion'
  | 'digital_inicio'
  | 'internet'
  | 'social'
  | 'crisis'
  | 'ia_periodismo';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoPrensas {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  hito: string;
  soporte: string;
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

const PERIODOS: PeriodoPrensas[] = [
  {
    id: 1, periodo: '1450–1500', anio: 1450, anioFin: 1500,
    titulo: 'Gutenberg y la Imprenta de Tipos Móviles',
    descripcion: 'Johannes Gutenberg inventa la imprenta de tipos móviles metálicos en Maguncia (hacia 1450). La Biblia de Gutenberg (1455) es el primer libro impreso con esta técnica en Europa. El scriptorium monástico —donde los monjes copiaban libros a mano— queda obsoleto. En 50 años, se imprimen más de 15 millones de libros en Europa: más que todos los manuscritos copiados en los mil años anteriores.',
    innovacion: 'Tipos móviles metálicos, prensa de husillo, tinta de impresión',
    hito: 'Biblia de Gutenberg (1455)',
    soporte: 'Libro impreso, incunable',
    impacto: 'La difusión del conocimiento se acelera exponencialmente: el coste de un libro cae un 80% en 50 años, democratizando el acceso a la información escrita.',
    datos: 'Antes de Gutenberg, un libro podía costar lo equivalente al salario anual de un artesano. Hacia 1500, un libro impreso costaba lo que ganaba un obrero en una semana.',
    categoria: 'imprenta',
  },
  {
    id: 2, periodo: '1500–1600', anio: 1500, anioFin: 1600,
    titulo: 'La Difusión del Conocimiento: Reforma y Censura',
    descripcion: 'La imprenta permite a Martín Lutero difundir sus 95 Tesis (1517) por toda Europa en semanas, acelerando la Reforma Protestante. Surgen las primeras gazetas (hojas informativas periódicas) y los panfletos políticos. La Iglesia Católica responde con el Index Librorum Prohibitorum (1559): lista de libros prohibidos. La censura eclesiástica y real convive con una explosión de textos impresos nunca vista.',
    innovacion: 'Gazetas, panfletos, censura sistemática, Index',
    hito: 'Tesis de Lutero difundidas (1517), Index Librorum Prohibitorum (1559)',
    soporte: 'Panfleto, hoja suelta, gaceta',
    impacto: 'La imprenta convierte la Reforma Protestante en un movimiento continental. Sin ella, Lutero habría sido un teólogo local, no el reformador de Europa.',
    datos: 'Se estima que entre 1517 y 1520 se imprimieron 300.000 copias de textos de Lutero. Erasmo de Rotterdam fue el primer bestseller de la historia con sus "Adagia".',
    categoria: 'difusion',
  },
  {
    id: 3, periodo: '1600–1700', anio: 1600, anioFin: 1700,
    titulo: 'Los Primeros Periódicos: Nace la Prensa Regular',
    descripcion: 'La Relation aller Fürnemmen und gedenckwürdigen Historien (1605, Estrasburgo) es el primer periódico reconocido con publicación periódica regular. Le Gazette de France (1631, fundada por Théophraste Renaudot con apoyo del cardenal Richelieu) inaugura el periodismo como instrumento de Estado. En España, la Gaceta de Madrid comienza en 1661, convirtiéndose en el antecedente directo del actual BOE. Los periódicos semanales proliferan en ciudades europeas.',
    innovacion: 'Periodicidad regular, papel impreso informativo, cabeceras',
    hito: 'Relation (1605), Gazette de France (1631), Gaceta de Madrid (1661)',
    soporte: 'Periódico semanal impreso',
    impacto: 'La información deja de ser un privilegio de los poderosos: los comerciantes, artesanos y clérigos pueden leer noticias regulares sobre mercados, guerras y política.',
    datos: 'La Gaceta de Madrid (1661) es el periódico español más antiguo. Cambió de nombre varias veces hasta convertirse en el Boletín Oficial del Estado (BOE) en 1936.',
    categoria: 'pionero',
  },
  {
    id: 4, periodo: '1700–1800', anio: 1700, anioFin: 1800,
    titulo: 'La Prensa y la Ilustración: Opinión y Libertad',
    descripcion: 'El Daily Courant (1702, Londres) inaugura el periodismo diario. Los filósofos ilustrados usan la prensa como tribuna: Voltaire, Diderot, Rousseau publican en periódicos y revistas. La Encyclopédie de Diderot (1751-1772) sistematiza el conocimiento de la época. La Revolución Francesa (1789) genera una explosión de libertad de prensa —más de 300 periódicos en Paris en 1789— seguida de represión napoleónica.',
    innovacion: 'Periódico diario, prensa de opinión, libertad de imprenta',
    hito: 'Daily Courant (1702), Encyclopédie (1751-1772), libertad de prensa en Francia (1789)',
    soporte: 'Periódico diario, revista ilustrada',
    impacto: 'La prensa ilustrada forma la opinión pública moderna. El concepto de "cuarto poder" —la prensa como contrapeso al ejecutivo, legislativo y judicial— nace en este siglo.',
    datos: 'El término "cuarto poder" lo atribuye la tradición a Edmund Burke (hacia 1787), quien señaló a la tribuna de la prensa en el Parlamento como "el cuarto poder del Estado".',
    categoria: 'ilustracion',
  },
  {
    id: 5, periodo: '1800–1840', anio: 1800, anioFin: 1840,
    titulo: 'La Prensa Penny: Democratización de la Información',
    descripcion: 'La rotativa de vapor de Friedrich Koenig (1814, usada por The Times de Londres) revoluciona la producción impresa: de 250 ejemplares/hora a 1.100. El New York Sun (1833) inventa la "penny press": periódicos que cuestan un centavo (penny), accesibles para cualquier trabajador. El modelo de negocio cambia: ingresos por publicidad, no por suscripción. La circulación de masas transforma el periodismo en industria.',
    innovacion: 'Rotativa de vapor, prensa penny, publicidad como modelo de negocio',
    hito: 'The Times usa rotativa Koenig (1814), New York Sun penny press (1833)',
    soporte: 'Periódico diario de masas',
    impacto: 'La prensa penny hace la información cotidiana accesible para la clase trabajadora. La publicidad financia la información: un modelo que domina hasta el siglo XXI.',
    datos: 'El New York Sun pasó de 0 a 20.000 lectores en un año (1833-1834). En 1835 publicó la famosa "Gran Mentira de la Luna": una hoax sobre vida en la Luna que fue el primer viral de la historia.',
    categoria: 'masas',
  },
  {
    id: 6, periodo: '1840–1880', anio: 1840, anioFin: 1880,
    titulo: 'El Telégrafo y las Agencias: Periodismo en Tiempo Real',
    descripcion: 'El telégrafo eléctrico (1837-1844) conecta redacciones con fuentes de noticias en minutos, no días. La Associated Press (AP) se funda en 1846 como cooperativa de periódicos para compartir noticias telegráficas. Reuters comienza en 1851. La fotografía llega a la prensa (daguerrotipo en 1839; primeras fotos en periódicos hacia 1880). Los primeros corresponsales de guerra: William Howard Russell cubre la Guerra de Crimea (1854) para The Times.',
    innovacion: 'Telégrafo, agencias de prensa, fotografía, corresponsales de guerra',
    hito: 'AP fundada (1846), Reuters (1851), primeras fotos en prensa (1880)',
    soporte: 'Periódico con fotografía, agencias de noticias',
    impacto: 'El periodismo se vuelve global: una noticia ocurrida en Londres podía publicarse en Nueva York el mismo día. Las agencias estabilizan el relato informativo internacional.',
    datos: 'Paul Julius Reuter inició su agencia usando palomas mensajeras para superar un tramo del telégrafo que faltaba entre Aquisgrán y Bruselas, ganando horas a sus competidores.',
    categoria: 'telegrafo',
  },
  {
    id: 7, periodo: '1880–1920', anio: 1880, anioFin: 1920,
    titulo: 'El Periodismo Amarillo y las Guerras de Tirada',
    descripcion: 'Joseph Pulitzer (New York World) y William Randolph Hearst (New York Journal) libran la primera guerra de medios: sensacionalismo, titulares exagerados, ilustraciones dramáticas. El término "periodismo amarillo" nace de una tira cómica ("Yellow Kid"). Hearst contribuyó a instigar la Guerra Hispano-Estadounidense (1898) con sus titulares. Durante la Primera Guerra Mundial (1914-1918), los periódicos se convierten en instrumentos de propaganda estatal a escala masiva.',
    innovacion: 'Sensacionalismo, comics, fotografía masiva, propaganda bélica',
    hito: 'Guerra Hearst vs Pulitzer (1890s), Guerra Hispano-EEUU (1898), WWI propaganda',
    soporte: 'Periódico diario ilustrado, suplemento dominical',
    impacto: 'El periodismo amarillo establece que las noticias deben ser entretenidas, no solo informativas. La tensión entre información y espectáculo define el periodismo hasta hoy.',
    datos: 'Hearst supuestamente telegrafió a su corresponsal en Cuba: "Tú pon las fotos, que yo pondré la guerra." El Maine explotó en La Habana (1898) y los periódicos Hearst lo usaron para pedir la guerra a España.',
    categoria: 'amarillo',
  },
  {
    id: 8, periodo: '1920–1945', anio: 1920, anioFin: 1945,
    titulo: 'La Radio y el Periodismo de Masas Sonoro',
    descripcion: 'La BBC comienza sus emisiones regulares en 1922 (radio) y 1936 (televisión experimental). Franklin D. Roosevelt usa las "charlas junto a la chimenea" radiofónicas (1933) para comunicarse directamente con los ciudadanos, sin la mediación de la prensa escrita. Los regímenes totalitarios —Nazi, Soviético, Fascista— comprenden que la radio permite llegar a analfabetos y controlar el relato. Joseph Goebbels convierte la radio en arma de propaganda. La WWII es la primera guerra periodística global en radio.',
    innovacion: 'Radio como medio masivo, periodismo radiofónico, propaganda totalitaria',
    hito: 'BBC Radio (1922), charlas Roosevelt (1933), propaganda nazi en radio',
    soporte: 'Radio, periódico ilustrado, noticiario cinematográfico',
    impacto: 'La radio rompe el monopolio de la prensa escrita en la formación de la opinión pública. Por primera vez, los políticos hablan directamente a los ciudadanos sin intermediarios.',
    datos: 'El discurso de Edward Murrow desde Londres bajo los bombardeos nazis (1940) fue escuchado por 30 millones de estadounidenses. Fue determinante para que EEUU apoyara a Gran Bretaña.',
    categoria: 'radio',
  },
  {
    id: 9, periodo: '1945–1970', anio: 1945, anioFin: 1970,
    titulo: 'El Periodismo de Investigación y la Televisión',
    descripcion: 'La televisión se convierte en el medio dominante: el debate Kennedy-Nixon (1960) es el primer debate televisado donde la imagen importa más que las palabras. Los Papeles del Pentágono (New York Times, 1971): Daniel Ellsberg filtra documentos secretos sobre la guerra de Vietnam. La Corte Suprema falla a favor de la prensa contra Nixon. El caso Watergate (1972-1974): Woodward y Bernstein en el Washington Post derrocaron a un presidente. El periodismo de investigación alcanza su cénit.',
    innovacion: 'Televisión como medio dominante, periodismo de investigación, fuentes confidenciales',
    hito: 'Debate Kennedy-Nixon TV (1960), Papeles del Pentágono (1971), Watergate (1972-1974)',
    soporte: 'Televisión, periódico nacional',
    impacto: 'El caso Watergate demuestra que la prensa puede responsabilizar al poder más alto. Es el momento de mayor prestigio y autoridad del periodismo en el siglo XX.',
    datos: 'La fuente anónima de Watergate, "Garganta Profunda" (Mark Felt, subdirector del FBI), no fue revelada hasta 2005, 33 años después de los hechos. Los periodistas Woodward y Bernstein nunca revelaron su identidad mientras vivió.',
    categoria: 'investigacion',
  },
  {
    id: 10, periodo: '1970–1990', anio: 1970, anioFin: 1990,
    titulo: 'Informatización de las Redacciones y CNN',
    descripcion: 'Los procesadores de texto y la fotocomposición electrónica reemplazan las linotipos de plomo (1970s). El fax acelera la transmisión de documentos entre redacciones. CNN (1980) inaugura la información continua 24 horas: la guerra del Golfo Pérsico (1991) es el primer conflicto retransmitido en directo global. USA Today (1982) introduce el diseño gráfico y los datos visuales en la prensa escrita. En España, la Transición genera una explosión de nuevas cabeceras: El País (1976), El Mundo (1989).',
    innovacion: 'Procesadores de texto, fotocomposición, CNN 24h, infografía',
    hito: 'CNN (1980), USA Today (1982), El País (1976), guerra del Golfo en directo (1991)',
    soporte: 'Televisión 24h, periódico nacional moderno',
    impacto: 'La CNN crea el concepto de "noticias continuas": los espectadores esperan información actualizada constantemente, no solo en el telediario de las 9. La inmediatez se vuelve un valor en sí mismo.',
    datos: 'El País se fundó el 4 de mayo de 1976, apenas nueve meses después de la muerte de Franco. Llegó a vender 600.000 ejemplares diarios en los años 90, un récord en la historia de la prensa española.',
    categoria: 'digital_inicio',
  },
  {
    id: 11, periodo: '1990–2005', anio: 1990, anioFin: 2005,
    titulo: 'Internet y los Primeros Medios Digitales',
    descripcion: 'Tim Berners-Lee inventa la World Wide Web (1991). The San Jose Mercury News lanza el primer periódico online (1994). Los grandes medios crean sus versiones web (1995-1998). Los blogs (1999-2005) permiten que cualquier persona publique. El ataque del 11-S (2001) es cubierto en tiempo real por millones de ciudadanos con cámaras digitales y blogs. La crisis del papel comienza: la publicidad migra a internet. Napster demuestra que los contenidos digitales tienden al coste cero.',
    innovacion: 'Web, periódico online, blogs, ciudadano periodista, crisis del papel',
    hito: 'Web (1991), primer periódico online (1994), blogs (1999), 11-S ciudadano periodista (2001)',
    soporte: 'Web, correo electrónico, blog',
    impacto: 'Internet rompe el monopolio de los medios establecidos sobre la distribución de noticias. Por primera vez, cualquier persona puede publicar para una audiencia global sin pasar por una redacción.',
    datos: 'En 2000, el New York Times ganaba 800 millones de dólares al año en publicidad impresa. En 2020, apenas 175 millones. La pérdida de ingresos publicitarios destruyó el modelo de negocio de la prensa en 20 años.',
    categoria: 'internet',
  },
  {
    id: 12, periodo: '2005–2015', anio: 2005, anioFin: 2015,
    titulo: 'Redes Sociales y el Ciudadano Periodista',
    descripcion: 'YouTube (2005), Twitter (2006), iPhone (2007), Facebook masificado (2008). Los smartphones convierten a cada ciudadano en fotógrafo, videógrafo y periodista. La Primavera Árabe (2010-2012): las redes sociales coordinan protestas en Túnez, Egipto y Siria cuando la prensa oficial es censurada. WikiLeaks (2010) filtra 250.000 cables diplomáticos. El periodismo ciudadano y el profesional conviven —y compiten. Las redacciones recortan personal: primera oleada de EREs en prensa española (2008-2012).',
    innovacion: 'Redes sociales, smartphone-periodismo, filtración masiva, periodismo ciudadano',
    hito: 'Twitter (2006), iPhone (2007), WikiLeaks (2010), Primavera Árabe (2011)',
    soporte: 'Redes sociales, aplicaciones móviles, streaming',
    impacto: 'Las redes sociales eliminan los intermediarios entre los eventos y el público. Un vídeo grabado con un móvil puede llegar a millones de personas antes de que lleguen los periodistas profesionales.',
    datos: 'El terremoto de Haití (2010) fue cubierto primero por ciudadanos con móviles. El primer tuit oficial de noticias verificado en tiempo real fue el aterrizaje de emergencia del vuelo US Airways en el Hudson (2009), tuiteado por un pasajero.',
    categoria: 'social',
  },
  {
    id: 13, periodo: '2015–2023', anio: 2015, anioFin: 2023,
    titulo: 'Crisis del Modelo y Desinformación: la Era del Paywall',
    descripcion: 'El New York Times populariza el paywall poroso (2011): artículos gratuitos limitados, luego suscripción. En 2023, supera los 9 millones de suscriptores digitales. Google y Facebook absorben el 70% de la publicidad digital mundial, dejando migajas a los editores. Las "fake news" (término popularizado en 2016) y los deepfakes plantean crisis de confianza. Los podcasts (Serial, 2014) reinventan el periodismo largo. El periodismo local desaparece en miles de ciudades: "news deserts".',
    innovacion: 'Paywall digital, suscripciones, fake news, podcasts, news deserts',
    hito: 'NYT paywall (2011), Brexit y Trump en 2016 (crisis desinformación), Serial podcast (2014)',
    soporte: 'Paywall, podcast, newsletter, vídeo streaming',
    impacto: 'La destrucción del modelo publicitario obliga a la prensa a reinventarse. Las suscripciones digitales salvan a los grandes medios, pero el periodismo local colapsa en gran parte del mundo.',
    datos: 'En EEUU han cerrado más de 2.500 periódicos locales entre 2005 y 2023. En España, la tirada de la prensa en papel cayó de 4,2 millones de ejemplares diarios (2004) a menos de 1,2 millones (2022).',
    categoria: 'crisis',
  },
  {
    id: 14, periodo: '2023–2026', anio: 2023, anioFin: 2026,
    titulo: 'IA en el Periodismo: Síntesis, Verificación y Deepfakes',
    descripcion: 'ChatGPT (noviembre 2022) irrumpe en las redacciones: Associated Press usa IA para generar noticias financieras desde 2014, pero ahora los LLMs pueden escribir artículos completos en segundos. Los deepfakes de audio y vídeo generan desinformación sin precedentes (elecciones en múltiples países 2024). Google y OpenAI crean herramientas de verificación automática. Medios como Axios y The Atlantic experimentan con resúmenes IA. El debate: ¿reemplaza la IA al periodista, o es una herramienta más como la rotativa de vapor?',
    innovacion: 'LLMs en redacciones, síntesis automática, deepfakes, verificación con IA',
    hito: 'ChatGPT masificado (2023), deepfakes electorales (2024), acuerdos IA-medios (2024)',
    soporte: 'Web, app, newsletter, audio IA, podcast',
    impacto: 'La IA puede generar noticias rutinarias a coste cero, liberando a periodistas para investigación y análisis. O puede destruir empleos y multiplicar la desinformación. El resultado depende de las decisiones éticas y regulatorias que se tomen ahora.',
    datos: 'El New York Times demandó a OpenAI en diciembre de 2023 por usar sus artículos para entrenar modelos IA sin permiso ni compensación. El juicio podría redefinir los derechos de autor en la era de la inteligencia artificial.',
    categoria: 'ia_periodismo',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1455, evento: 'Biblia de Gutenberg: el primer libro impreso con tipos móviles en Europa — nace la prensa moderna' },
  { anio: 1605, evento: 'Relation aller Fürnemmen (Estrasburgo): primer periódico con publicación periódica regular del mundo' },
  { anio: 1661, evento: 'Gaceta de Madrid: primer periódico español, antecedente directo del BOE' },
  { anio: 1702, evento: 'Daily Courant (Londres): primer periódico diario del mundo' },
  { anio: 1814, evento: 'The Times usa rotativa de vapor: la producción de prensa se multiplica por 4' },
  { anio: 1851, evento: 'Reuters fundada: las agencias de noticias globalizan la información' },
  { anio: 1922, evento: 'BBC Radio inicia emisiones: la radio rompe el monopolio de la prensa escrita' },
  { anio: 1972, evento: 'Watergate (Washington Post): el periodismo de investigación derroca a un presidente' },
  { anio: 1980, evento: 'CNN: primera cadena de noticias 24 horas — nace el ciclo informativo continuo' },
  { anio: 2023, evento: 'ChatGPT en las redacciones: la IA plantea el mayor desafío y oportunidad en 575 años de prensa' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  imprenta: 'Imprenta',
  difusion: 'Difusión',
  pionero: 'Primeros Periódicos',
  ilustracion: 'Ilustración',
  masas: 'Prensa de Masas',
  telegrafo: 'Telégrafo/Agencias',
  amarillo: 'Pren. Amarilla',
  radio: 'Radio',
  investigacion: 'Investigación',
  digital_inicio: 'Digital Inicial',
  internet: 'Internet',
  social: 'Redes Sociales',
  crisis: 'Crisis/Paywall',
  ia_periodismo: 'IA en Prensa',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  imprenta: '#8B4513',
  difusion: '#D2691E',
  pionero: '#DAA520',
  ilustracion: '#4169E1',
  masas: '#FF8C00',
  telegrafo: '#9370DB',
  amarillo: '#DC143C',
  radio: '#228B22',
  investigacion: '#1E90FF',
  digital_inicio: '#2E86AB',
  internet: '#48A9A6',
  social: '#FF6347',
  crisis: '#696969',
  ia_periodismo: '#FF8C00',
};

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const AÑO_MIN = 1450;
const AÑO_MAX = 2026;
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

function PanelDetalle({ periodo }: { periodo: PeriodoPrensas }) {
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
          <h4 className={styles.detalleSubtitulo}>Datos técnicos</h4>
          <ul className={styles.infoList}>
            <li><strong>Hito:</strong> {periodo.hito}</li>
            <li><strong>Soporte:</strong> {periodo.soporte}</li>
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
  const [seleccionado, setSeleccionado] = useState<PeriodoPrensas | null>(null);

  const filas: PeriodoPrensas[][] = [[], [], [], []];
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

  const marcadores: number[] = [1500, 1600, 1700, 1800, 1850, 1900, 1945, 1970, 1990, 2010];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca de 1450 a 2026.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la prensa"
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
              <span className={styles.statLabel}>Soporte</span>
              <span className={styles.statValue}>{periodo.soporte.split(',')[0]}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Hito emblemático</span>
              <span className={styles.statValue}>{periodo.hito.split(',')[0]}</span>
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
        per.hito.toLowerCase().includes(termino) ||
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
        placeholder="Buscar por período, hito o innovación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de historia de la prensa"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Soporte</th>
              <th>Hito emblemático</th>
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
                <td className={styles.velocidadCell}>{per.soporte.split(',')[0]}</td>
                <td>{per.hito.split(',')[0]}</td>
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
  { nombre: 'La Imprenta Cambia el Mundo', desde: 1450, hasta: 1700, icono: '📖' },
  { nombre: 'Prensa y Revolución', desde: 1700, hasta: 1850, icono: '✊' },
  { nombre: 'Periodismo Industrial', desde: 1850, hasta: 1945, icono: '🏭' },
  { nombre: 'Era Audiovisual y Derechos', desde: 1945, hasta: 1990, icono: '📺' },
  { nombre: 'La Revolución Digital', desde: 1990, hasta: 2010, icono: '💻' },
  { nombre: 'Crisis, IA y el Futuro del Periodismo', desde: 2010, hasta: 9999, icono: '🤖' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de la historia de la prensa y eventos clave organizados en 6 grandes eras.
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

export default function VisualizadorHistoriaPrensas() {
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
        <h1 className={styles.heroTitle}>Historia de la Prensa</h1>
        <p className={styles.heroSubtitle}>
          De Gutenberg (1450) al Periodismo Digital e IA — 575 años de comunicación escrita en 14 períodos interactivos
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
        title="Historia de la prensa: evolución e impacto"
        subtitle="Cómo la imprenta y el periodismo transformaron la sociedad, la política y la cultura en 575 años"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la historia de la prensa</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Tecnología dominante</th>
                <th>Soporte</th>
                <th>País/Región líder</th>
                <th>Hito emblemático</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Imprenta (1450–1600)</strong></td>
                <td>Tipos móviles metálicos</td>
                <td>Libro, incunable</td>
                <td>Alemania / Europa</td>
                <td>Biblia de Gutenberg (1455)</td>
              </tr>
              <tr>
                <td><strong>Primeros Periódicos (1600–1800)</strong></td>
                <td>Prensa de husillo mejorada</td>
                <td>Periódico semanal/diario</td>
                <td>Reino Unido / Francia</td>
                <td>Daily Courant (1702)</td>
              </tr>
              <tr>
                <td><strong>Prensa Industrial (1800–1920)</strong></td>
                <td>Rotativa de vapor, linotipia</td>
                <td>Periódico diario masivo</td>
                <td>EEUU / UK</td>
                <td>New York Sun penny press (1833)</td>
              </tr>
              <tr>
                <td><strong>Era Audiovisual (1920–1990)</strong></td>
                <td>Radio, televisión, fax</td>
                <td>Radio, TV, periódico</td>
                <td>EEUU / UK / España (1976)</td>
                <td>CNN 24h (1980)</td>
              </tr>
              <tr>
                <td><strong>Internet (1990–2015)</strong></td>
                <td>Web, móvil, redes sociales</td>
                <td>Web, blog, podcast</td>
                <td>EEUU / Global</td>
                <td>Primer periódico online (1994)</td>
              </tr>
              <tr>
                <td><strong>IA y Crisis (2015–hoy)</strong></td>
                <td>LLMs, paywall, deepfakes</td>
                <td>App, newsletter, podcast, IA</td>
                <td>Global</td>
                <td>ChatGPT en redacciones (2023)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto de la prensa</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Impacto político</strong>
              <p>La prensa es la condición de posibilidad de la democracia moderna: sin información libre, no hay ciudadanía informada. La Revolución Francesa no habría tenido la velocidad que tuvo sin los panfletos y periódicos. El caso Watergate (1972) demostró que la prensa puede responsabilizar al poder más alto. La crisis del periodismo local amenaza hoy el funcionamiento democrático de centenares de municipios.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💰</span>
            <div>
              <strong>Impacto económico</strong>
              <p>La prensa creó el modelo de negocio basado en publicidad que domina internet hasta hoy. Google y Meta capturan el 70% de la publicidad digital mundial, dejando migajas a los editores. Las suscripciones digitales intentan sustituir ese modelo: el New York Times tiene 9 millones de suscriptores digitales. El periodismo local, sin masa crítica para el paywall, colapsa en todo el mundo.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Impacto cultural</strong>
              <p>La imprenta de Gutenberg hizo posible el Renacimiento, la Reforma y la Ilustración: sin reproducción masiva de textos, estas ideas no habrían viajado. La prensa de masas creó culturas nacionales compartidas (los mismos sucesos, los mismos debates). Las redes sociales han fragmentado esa cultura compartida en burbujas de información, con efectos aún no bien comprendidos en la cohesión social.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
            <div>
              <strong>Impacto de la IA (2023–hoy)</strong>
              <p>Los LLMs pueden generar artículos rutinarios en segundos, reduciendo costes de producción. La amenaza: deepfakes de políticos, síntesis falsas con apariencia periodística, desinformación industrial. La oportunidad: periodistas liberados del trabajo rutinario para dedicarse a investigación y análisis. El resultado depende de la regulación y la ética profesional que la industria periodística logre establecer.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre la historia de la prensa</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué la Biblia de Gutenberg fue tan importante si ya existían libros?</strong>
            <p>Antes de Gutenberg (hacia 1450), los libros se copiaban a mano en scriptoria monásticos: un monje tardaba meses en copiar un único ejemplar. La imprenta de tipos móviles permitió producir cientos de copias idénticas en días, al mismo coste unitario que uno solo. En 50 años se imprimieron más libros que en los mil años anteriores. La diferencia no era solo de cantidad: era el coste, la velocidad y la fidelidad de reproducción del conocimiento.</p>
            <span className={styles.faqTip}>Gutenberg no inventó la imprenta (ya existía en China y Corea), pero combinó varias innovaciones —aleación metálica, prensa de vino, tinta oleosa— en un sistema reproducible y escalable para el alfabeto latino.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el "periodismo amarillo" y por qué se llama así?</strong>
            <p>El término nació de la guerra de tiradas entre Joseph Pulitzer (New York World) y William Randolph Hearst (New York Journal) en los años 1890. Ambos publicaban una tira cómica protagonizada por un personaje en ropa amarilla ("Yellow Kid"). El sensacionalismo, los titulares exagerados y las noticias dramatizadas que usaban para competir se llamaron "periodismo amarillo". Hearst contribuyó activamente a instigar la Guerra Hispano-Estadounidense de 1898 con titulares fabricados sobre Cuba.</p>
            <span className={styles.faqTip}>La historia de "Tú pon las fotos, que yo pondré la guerra" (supuestamente de Hearst) es probablemente apócrifa, pero refleja perfectamente el espíritu del periodismo amarillo: los hechos al servicio del relato, no al revés.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la prensa en papel está desapareciendo?</strong>
            <p>La prensa en papel perdió dos cosas simultáneamente con la llegada de internet: la distribución (ya no es el único canal para leer noticias) y la publicidad (los anunciantes prefieren Google y Meta, que tienen datos más precisos sobre los lectores). En España, la tirada de prensa cayó de 4,2 millones de ejemplares/día (2004) a menos de 1,2 millones (2022). Los periódicos que sobreviven lo hacen combinando papel (para lectores mayores), digital (paywall) y eventos.</p>
            <span className={styles.faqTip}>El papel no desaparecerá completamente: hay un nicho de lectores que lo prefieren y pagan por él. Pero dejará de ser el soporte principal de la información de actualidad, rol que ya ocupa definitivamente el móvil y el ordenador.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué son los "news deserts" y por qué son peligrosos para la democracia?</strong>
            <p>Los "news deserts" (desiertos de noticias) son territorios —municipios, comarcas, regiones— que han perdido su cobertura periodística local porque los periódicos han cerrado o reducido drásticamente su plantilla. En EEUU han cerrado más de 2.500 periódicos locales entre 2005 y 2023. En España, muchos municipios rurales y ciudades medianas no tienen ya ni un solo periodista cubriendo el ayuntamiento, los juzgados o los hospitales. La consecuencia: más corrupción local, más desinformación, menor participación electoral.</p>
            <span className={styles.faqTip}>Estudios académicos muestran que en los municipios que pierden su periódico local, el coste de la deuda municipal sube (los mercados de bonos tienen menos información), la participación electoral baja y la corrupción aumenta al no haber vigilancia periodística.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Puede la IA reemplazar a los periodistas?</strong>
            <p>La IA ya reemplaza a los periodistas en tareas rutinarias: resúmenes de resultados deportivos, informes financieros trimestrales, boletines meteorológicos. AP usa IA para generar miles de noticias financieras desde 2014. Pero el periodismo de investigación —buscar fuentes, proteger a denunciantes, interpretar documentos complejos, contextualizar históricamente— sigue requiriendo habilidades humanas. El riesgo real no es el reemplazo masivo, sino la desinformación a escala industrial mediante deepfakes y contenido sintético.</p>
            <span className={styles.faqTip}>El New York Times demandó a OpenAI en 2023 por usar sus artículos para entrenar LLMs sin compensación. Si los tribunales fallan a favor de los medios, podría obligar a las empresas IA a pagar licencias, cambiando el equilibrio económico del sector.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo entender el ecosistema mediático actual</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Diversifica tus fuentes de información</strong>
              <p>Ningún medio es objetivo: todos tienen línea editorial, propiedad y anunciantes. Lee al menos dos medios con perspectivas diferentes sobre el mismo tema. Comprueba las fuentes primarias cuando sea posible: los documentos originales, los estudios científicos, los datos oficiales. El periodismo de calidad siempre cita sus fuentes verificables.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Aprende a distinguir información de opinión</strong>
              <p>La noticia responde a qué, quién, cuándo, dónde, cómo y por qué, con datos verificables. La opinión interpreta y valora esos hechos. El periodismo moderno mezcla ambas con frecuencia. Busca el formato: los artículos de opinión lo suelen indicar explícitamente. Los titulares sensacionalistas suelen ser de opinión disfrazada de noticia.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Usa verificadores de hechos (fact-checkers)</strong>
              <p>En España: Maldita.es, Newtral, AFP Factual. En Europa: IFCN (International Fact-Checking Network). Los deepfakes de audio y vídeo son cada vez más sofisticados: si una declaración parece increíble, búscala en verificadores antes de compartirla. Herramientas como Google Fact Check Explorer permiten buscar verificaciones sobre cualquier afirmación.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Considera suscribirte a medios que aprecias</strong>
              <p>Si consumes habitualmente un medio digital y lo valoras, considera suscribirte. El modelo publicitario financiaba el periodismo masivo; el modelo de suscripción financia el periodismo que el lector considera valioso. Medios como El País, El Mundo, La Vanguardia o medios digitales nativos como elDiario.es o El Confidencial dependen crecientemente de las suscripciones para mantener redacciones.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Valora el periodismo local</strong>
              <p>El periodismo local es el más amenazado y el más necesario para la democracia local. Cubre ayuntamientos, juzgados, hospitales y escuelas: los servicios que afectan directamente a tu vida. Si existe en tu zona un medio local o regional que haga periodismo de calidad, suscríbete o compártelo: es la mejor forma de asegurar que siga existiendo.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la historia de la prensa</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📜</span>
            <p>Cada nueva tecnología de comunicación se convierte primero en amenaza para la existente y luego en complemento: la radio no mató a la prensa escrita, sino que la forzó a evolucionar. La televisión no mató a la radio. Internet no ha matado a la televisión. La IA tampoco matará al periodismo: lo transformará.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
            <p>La libertad de prensa y la democracia van juntas: históricamente, los países con mayor libertad de prensa son los que tienen democracias más sólidas y menor corrupción. Los regímenes autoritarios siempre empiezan por controlar los medios de comunicación.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💡</span>
            <p>El modelo de negocio determina la información: un medio que vive de la publicidad tenderá a no molestar a sus anunciantes. Un medio de suscripción tiene incentivos para ser honesto con sus lectores. Saber quién paga un medio es la primera clave para entender por qué publica lo que publica.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <p>La desinformación no es nueva: el "periodismo amarillo" del siglo XIX fabricaba noticias. Lo que ha cambiado es la velocidad y escala de difusión. En 1898, una mentira de Hearst tardaba días en cruzar el Atlántico. Hoy, un deepfake puede llegar a 100 millones de personas en horas.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox OBLIGATORIO */}
        <div className={styles.warningBox}>
          <strong>Aviso sobre fechas y datos históricos de la prensa</strong>
          <ul>
            <li>Las <strong>fechas de fundación de medios y primeras publicaciones</strong> pueden variar según la fuente consultada; existen debates académicos sobre cuál fue el "primer periódico" según criterios de regularidad, distribución o contenido noticioso.</li>
            <li>Los <strong>datos de tirada y circulación</strong> son estimaciones históricas y pueden diferir entre fuentes; las cifras de suscriptores digitales actuales corresponden a los últimos datos públicos disponibles y varían con el tiempo.</li>
            <li>Los <strong>proyectos de regulación de IA</strong> en el ámbito periodístico (Ley de IA de la UE, litigios sobre derechos de autor) están en desarrollo y pueden haber evolucionado desde la fecha de actualización de este contenido.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-prensa')} />
      <ShareCard appName="visualizador-historia-prensa" />
      <Footer appName="visualizador-historia-prensa" />
    </div>
  );
}
