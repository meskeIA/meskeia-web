'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaArquitecturaEspanola.module.css';
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
  | 'romanico'
  | 'gotico'
  | 'isabelino'
  | 'herrerismo'
  | 'barroco'
  | 'neoclasico'
  | 'historicismo'
  | 'modernismo'
  | 'franquismo'
  | 'desarrollismo'
  | 'democratico'
  | 'iconico'
  | 'sostenible';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoArquitectura {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  obra: string;
  estilo: string;
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

const PERIODOS: PeriodoArquitectura[] = [
  {
    id: 1, periodo: 's.XI–s.XII (1000–1150)', anio: 1000, anioFin: 1150,
    titulo: 'Románico: Las Piedras del Camino',
    descripcion: 'El arte románico llega a la Península Ibérica a través del Camino de Santiago y la influencia francesa. La Catedral de Santiago de Compostela (iniciada en 1075 por el obispo Diego Peláez) se convierte en el gran santuario de peregrinación cristiano. Las iglesias se caracterizan por muros gruesos, arcos de medio punto, torres cuadradas y una escultura narrativa en portadas y capiteles. Los monasterios benedictinos y cluniacenses difunden el estilo a lo largo del Camino.',
    innovacion: 'Arco de medio punto, bóveda de cañón, escultura en portadas y capiteles',
    obra: 'Catedral de Santiago de Compostela (iniciada 1075)',
    estilo: 'Románico',
    impacto: 'El Camino de Santiago vertebró la identidad cristiana peninsular y fue el primer eje de intercambio cultural entre España y Europa.',
    datos: 'La Catedral de Santiago de Compostela tardó más de 100 años en construirse. Su Pórtico de la Gloria (1188, Maestro Mateo) es considerado la obra cumbre de la escultura románica española.',
    categoria: 'romanico',
  },
  {
    id: 2, periodo: 's.XII–s.XV (1150–1450)', anio: 1150, anioFin: 1450,
    titulo: 'Gótico y Mudéjar: Fusión de Culturas',
    descripcion: 'El gótico llega de Francia con el arco ojival, la bóveda de crucería y el arbotante, que permiten muros más delgados y vitrales espectaculares. La Catedral de Burgos (iniciada 1221) y la de León (s.XIII) son cumbres del gótico español. Pero la gran originalidad peninsular es el Arte Mudéjar: artesanos musulmanes que trabajan para reyes cristianos, fusionando geometría islámica, ladrillo y yeserías con estructuras góticas. El resultado es único en el mundo.',
    innovacion: 'Arco ojival, bóveda de crucería, Arte Mudéjar, vitrales góticos',
    obra: 'Catedral de Burgos (1221) / Giralda de Sevilla / Reales Alcázares',
    estilo: 'Gótico y Mudéjar',
    impacto: 'El Mudéjar es el único estilo arquitectónico genuinamente español, nacido de la convivencia (y también tensión) entre las tres culturas medievales.',
    datos: 'La Catedral de León tiene más de 1.800 m² de vidrieras, el mayor conjunto de vitrales medievales de España. La Giralda de Sevilla es un alminar almohade del s.XII reconvertido en campanario cristiano.',
    categoria: 'gotico',
  },
  {
    id: 3, periodo: 's.XV–s.XVI (1450–1560)', anio: 1450, anioFin: 1560,
    titulo: 'Gótico Tardío e Isabelino: La Exuberancia Regia',
    descripcion: 'Los Reyes Católicos (Isabel I de Castilla y Fernando II de Aragón) impulsan un estilo propio: el Gótico Isabelino o Plateresco temprano. Se caracteriza por una decoración superficial minuciosa —como si fuera trabajo de platero— sobre estructuras góticas. La fachada de la Universidad de Salamanca (h.1529) es el paradigma del Plateresco. La Catedral Nueva de Salamanca (iniciada 1513) y la Catedral de Segovia sintetizan el gótico tardío español con solemnidad monumental.',
    innovacion: 'Estilo Plateresco, fachadas decoradas como orfebrería, mecenazgo regio',
    obra: 'Catedral Nueva de Salamanca (1513) / Fachada Universidad de Salamanca',
    estilo: 'Gótico Isabelino / Plateresco',
    impacto: 'Isabel I financió obras como la Capilla Real de Granada (su mausoleo) que definieron la imagen de poder de la monarquía española durante siglos.',
    datos: 'El término "plateresco" viene de "platero": la decoración era tan fina y densa que parecía obra de un orfebre. En la fachada de la Universidad de Salamanca se esconde una rana en un cráneo — tradición de buena suerte para los exámenes.',
    categoria: 'isabelino',
  },
  {
    id: 4, periodo: 's.XVI (1560–1600)', anio: 1560, anioFin: 1600,
    titulo: 'El Escorial y el Herrerismo: La Austeridad Imperial',
    descripcion: 'Felipe II encarga a Juan de Herrera el Monasterio de El Escorial (1563–1584), símbolo de la Contrarreforma y del poder imperial español. En radical contraste con el Plateresco, el Herrerismo es austero, geométrico y monumental: sin ornamentación, con piedra gris, torres cuadradas y horizontales prolongadas. Es el clasicismo español hecho poder. El estilo se extiende a catedrales, palacios y edificios civiles en toda España y sus colonias.',
    innovacion: 'Clasicismo herreriano, austeridad decorativa, proporciones monumentales',
    obra: 'Monasterio de El Escorial (1563–1584, Juan de Herrera)',
    estilo: 'Herrerismo',
    impacto: 'El Escorial fue el mayor edificio del mundo en su época. Definió durante dos siglos la imagen de la arquitectura oficial española y de las instituciones del Estado.',
    datos: 'El Escorial tiene 16 patios, 88 fuentes, 300 celdas y más de 1.200 puertas y ventanas. Tardó 21 años en construirse con más de 1.500 trabajadores simultáneos.',
    categoria: 'herrerismo',
  },
  {
    id: 5, periodo: 's.XVII (1600–1700)', anio: 1600, anioFin: 1700,
    titulo: 'Churrigueresco y Barroco: La Ornamentación Desbordante',
    descripcion: 'La reacción al frío herrerismo trae el Barroco español, que en su versión más extrema se llama Churrigueresco (por la familia Churriguera). José de Churriguera diseña el retablo mayor de San Esteban de Salamanca (1692) y planifica la Plaza Mayor de Salamanca (completada 1755 por Andrés García de Quiñones). Las fachadas se convierten en tapices de piedra labrada. El Barroco español, también llamado Plateresco tardío o Ultrarrenacimiento, contrasta con el sobrio Herrerismo.',
    innovacion: 'Retablos monumentales, fachadas como escenografía, estípite como elemento ornamental',
    obra: 'Plaza Mayor de Salamanca (1729) / Retablo de San Esteban, Salamanca',
    estilo: 'Barroco / Churrigueresco',
    impacto: 'Las plazas mayores castellanas —Salamanca, Madrid— definen un modelo de espacio cívico y comercial que se replica en toda Hispanoamérica.',
    datos: 'La Plaza Mayor de Salamanca tiene 88 arcos. Alberto Churriguera la diseñó en 1729 inspirándose en la de Madrid. La fachada del Obradoiro de la Catedral de Santiago (1738, Fernando de Casas) es el culmen del Barroco español.',
    categoria: 'barroco',
  },
  {
    id: 6, periodo: 's.XVIII (1700–1800)', anio: 1700, anioFin: 1800,
    titulo: 'Ilustración y Neoclásico: La Razón Borbónica',
    descripcion: 'Los Borbones llegan al trono español (Felipe V, 1700) trayendo el gusto francés e italiano. El Palacio Real de Madrid (1738–1764, Giovanni Battista Sacchetti, terminado por Francisco Sabatini) es el gran edificio neoclásico de España: planta cuadrada, fachada de piedra blanca, proporciones racionales. Ventura Rodríguez y Juan de Villanueva son los arquitectos de la Ilustración española. La Puerta de Alcalá (1778, Sabatini) y el Museo del Prado (1785, Villanueva, aunque inaugurado en 1819) definen el Paseo del Prado como eje cultural de Madrid.',
    innovacion: 'Neoclásico, urbanismo ilustrado, el Paseo del Prado como modelo de boulevard cultural',
    obra: 'Palacio Real de Madrid (1738–1764) / Museo del Prado (1785, Villanueva)',
    estilo: 'Neoclásico',
    impacto: 'El Neoclásico borbónico transformó Madrid en una capital europea moderna, con avenidas, fuentes (Cibeles, Neptuno) y el primer gran eje cultural urbano de España.',
    datos: 'El Palacio Real de Madrid tiene 3.418 habitaciones, es el mayor palacio europeo por superficie. El Museo del Prado fue diseñado por Villanueva como museo de ciencias naturales; se reconvirtió en pinacoteca en 1819.',
    categoria: 'neoclasico',
  },
  {
    id: 7, periodo: 's.XIX (1800–1874)', anio: 1800, anioFin: 1874,
    titulo: 'Historicismo y Eclecticismo: El Hierro y la Nostalgia',
    descripcion: 'El siglo XIX trae el Romanticismo y el gusto por recuperar estilos del pasado (neo-gótico, neo-mudéjar, neo-renacimiento). El Congreso de los Diputados (1843, Narciso Pascual y Colomer) es un ejemplo de neoclasicismo austero. Pero la gran novedad es la arquitectura del hierro: las nuevas estaciones de tren (Atocha, 1851), los mercados cubiertos (Mercado de San Miguel, Madrid, 1916) y el Palacio de Cristal del Retiro (1887, Ricardo Velázquez Bosco) demuestran las posibilidades de los nuevos materiales industriales.',
    innovacion: 'Arquitectura de hierro, estaciones ferroviarias, eclecticismo historicista',
    obra: 'Palacio de Cristal del Retiro (1887) / Estación de Atocha (1851)',
    estilo: 'Eclecticismo / Neo-estilos / Arquitectura del hierro',
    impacto: 'El ferrocarril redefinió la ciudad: las estaciones se convirtieron en las nuevas "catedrales" del progreso industrial, grandes espacios cubiertos de hierro y cristal.',
    datos: 'El Palacio de Cristal del Retiro (Madrid, 1887) fue construido para albergar una exposición de plantas de Filipinas. Su estructura de hierro y cristal lo convierte en precursor de la arquitectura moderna. Actualmente es sala de exposiciones del Museo Reina Sofía.',
    categoria: 'historicismo',
  },
  {
    id: 8, periodo: 's.XIX–s.XX (1874–1936)', anio: 1874, anioFin: 1936,
    titulo: 'Modernismo Catalán: Gaudí y la Arquitectura Orgánica',
    descripcion: 'El Modernisme catalán es la respuesta española al Art Nouveau europeo, pero mucho más radical y personal. Antoni Gaudí es el gran genio: la Sagrada Família (iniciada 1882, aún en construcción), el Palau Güell (1888), la Casa Batlló (1904–1906), la Casa Milà "La Pedrera" (1906–1910) y el Park Güell (1900–1914) forman un corpus sin parangón. Lluís Domènech i Montaner crea el Palau de la Música Catalana (1908), UNESCO Patrimonio de la Humanidad. Josep Puig i Cadafalch aporta el neo-gótico modernista.',
    innovacion: 'Formas orgánicas, trencadís (mosaico de cerámica rota), estructura catenaria, integración naturaleza-arquitectura',
    obra: 'Sagrada Família (1882, Gaudí) / Palau de la Música Catalana (1908, Domènech)',
    estilo: 'Modernisme catalán',
    impacto: 'El Modernismo catalán transformó Barcelona en uno de los patrimonios arquitectónicos más visitados del mundo. Las obras de Gaudí reciben más de 10 millones de visitantes al año.',
    datos: 'Gaudí calculó las formas de la Sagrada Família colgando cadenas al revés: la forma que toma una cadena invertida es el arco perfecto estructuralmente. Nunca usó maquetas convencionales.',
    categoria: 'modernismo',
  },
  {
    id: 9, periodo: '1936–1959', anio: 1936, anioFin: 1959,
    titulo: 'Franquismo y el Estilo Nacional: La Arquitectura del Régimen',
    descripcion: 'El régimen franquista impone un "Estilo Nacional": síntesis de herrerismo austero, neoclásico imperial y referencias al Imperio español. El Valle de los Caídos (1940–1958, Diego Méndez) es la obra más emblemática y controvertida: una basílica excavada en roca con una cruz de 150 metros. Las ciudades sufren la reconstrucción de posguerra con arquitectura funcionalista austera. La vivienda social franquista —los "poblados dirigidos" de Madrid— aplica el racionalismo mínimo a la necesidad.',
    innovacion: 'Arquitectura monumental estatal, reconstrucción de posguerra, vivienda social racionalista',
    obra: 'Valle de los Caídos (1940–1958) / Ministerio del Aire, Madrid (1951)',
    estilo: 'Estilo Nacional Franquista / Monumentalismo estatal',
    impacto: 'La arquitectura franquista tardó décadas en ser revisada críticamente. El Valle de los Caídos sigue siendo un símbolo de controversia histórica. Los "Poblados Dirigidos" demostraron que la arquitectura racional podía aplicarse a la vivienda social masiva.',
    datos: 'La Cruz del Valle de los Caídos tiene 150 metros de altura y 46 metros de envergadura, es la mayor del mundo. La basílica está excavada 300 metros dentro de la montaña. Hay un ascensor que sube hasta el pie de la cruz.',
    categoria: 'franquismo',
  },
  {
    id: 10, periodo: '1959–1975', anio: 1959, anioFin: 1975,
    titulo: 'Desarrollismo: La Arquitectura del Boom Turístico',
    descripcion: 'El Plan de Estabilización (1959) abre España al turismo y a la inversión extranjera. La costa mediterránea se llena de hoteles racionalistas sin cualidades especiales. En Madrid, rascacielos de posguerra como la Torre de Madrid (1957, hermanos Otamendi, 142 metros) o el Edificio España (1953) definen el skyline. Los Colegios Nacionales y los bloques de vivienda del desarrollismo llevan la arquitectura funcional masiva a toda España. En contraste, el Grupo R catalán y los primeros contactos con el movimiento moderno internacional.',
    innovacion: 'Rascacielos, urbanismo desarrollista, hoteles de costa, Grupo R y arquitectura moderna en Cataluña',
    obra: 'Torre de Madrid (1957) / Edificio España (1953, Madrid)',
    estilo: 'Racionalismo desarrollista / Internacionalismo tardío',
    impacto: 'El desarrollismo transformó el litoral mediterráneo de forma irreversible. El "pelotazo" urbanístico de los 60-70 sentó las bases de la posterior burbuja inmobiliaria de los 90-2000.',
    datos: 'La Torre de Madrid (1957) fue durante años el edificio de hormigón más alto del mundo. El turismo pasó de 4 millones de visitantes en 1959 a 34 millones en 1975, financiando el desarrollismo con divisas extranjeras.',
    categoria: 'desarrollismo',
  },
  {
    id: 11, periodo: '1975–1992', anio: 1975, anioFin: 1992,
    titulo: 'La Democracia y el Renacimiento Arquitectónico',
    descripcion: 'La Transición democrática libera la creatividad arquitectónica reprimida. Rafael Moneo construye el Museo Nacional de Arte Romano de Mérida (1986), síntesis magistral de ladrillo romano y modernidad. Barcelona inicia la transformación urbana para los Juegos Olímpicos (1992): el Anillo Olímpico de Montjuïc, la Villa Olímpica (nueva fachada marítima), el Port Olímpic. Oriol Bohigas lidera el urbanismo que transforma Barcelona en modelo mundial. La Exposición Universal de Sevilla (1992) aporta el Pabellón de España de Julio Cano Lasso.',
    innovacion: 'Recuperación del espacio público, rehabilitación urbana, arquitectura de autor, modelo Barcelona',
    obra: 'Museo Nacional de Arte Romano, Mérida (1986, Moneo) / Villa Olímpica Barcelona (1992)',
    estilo: 'Postmodernismo / Regionalismo crítico / Racionalismo de autor',
    impacto: 'El "modelo Barcelona" —recuperación de espacio público, escultura urbana, rehabilitación de barrios— se convirtió en referencia mundial de transformación urbana para grandes eventos.',
    datos: 'Rafael Moneo es el único arquitecto español ganador del Premio Pritzker (1996), el Nobel de la arquitectura. El Museo Romano de Mérida usa ladrillo romano directamente sobre ruinas antiguas, creando un diálogo entre el pasado y el presente que parece natural.',
    categoria: 'democratico',
  },
  {
    id: 12, periodo: '1992–2010', anio: 1992, anioFin: 2010,
    titulo: 'El Guggenheim y los Grandes Iconos: Arquitectura Espectáculo',
    descripcion: 'El Guggenheim de Bilbao (1997, Frank Gehry) cambia el paradigma de cómo un edificio puede transformar una ciudad. El "Efecto Guggenheim" convierte a Bilbao en destino turístico global. Santiago Calatrava construye la Ciudad de las Artes y las Ciencias de Valencia (iniciada 1998): complejo de edificios futuristas que se convierte en seña de identidad regional. Richard Rogers diseña la Terminal 4 del aeropuerto Adolfo Suárez Madrid-Barajas (2006). El boom inmobiliario (1997–2007) genera miles de edificios mediocres junto a íconos de autor.',
    innovacion: 'Arquitectura paramétrica, titanio como revestimiento, "starchitecture", efecto Guggenheim',
    obra: 'Guggenheim Bilbao (1997, Frank Gehry) / Ciudad de las Artes y las Ciencias, Valencia (1998, Calatrava)',
    estilo: 'Deconstructivismo / Arquitectura paramétrica / Starchitecture',
    impacto: 'El Guggenheim multiplicó por 5 el turismo a Bilbao en su primer año. El "Efecto Guggenheim" se convirtió en estrategia de marketing urbano replicada en todo el mundo, no siempre con éxito.',
    datos: 'El Guggenheim Bilbao costó 89 millones de dólares y generó 500 millones en ingresos turísticos solo en su primer año. Las placas de titanio que recubren la fachada miden 0,38 mm de espesor y cambian de color según la luz.',
    categoria: 'iconico',
  },
  {
    id: 13, periodo: '2010–2026', anio: 2010, anioFin: 2026,
    titulo: 'Post-Crisis y Arquitectura Sostenible: La Vuelta a lo Esencial',
    descripcion: 'El colapso del boom inmobiliario (2008-2013) paraliza la construcción en España. Miles de edificios sin terminar, "ciudades fantasma" (Seseña, Valdeluz). La arquitectura se reorienta: rehabilitación urbana frente a obra nueva, eficiencia energética (certificación BREEAM, LEED), BIM (modelado de información del edificio), arquitectura paramétrica accesible. La regeneración de barrios degradados (Lavapiés en Madrid, el Poblenou en Barcelona) se convierte en nueva prioridad. Arquitectos españoles como Selgas Cano o MX_SI ganan reconocimiento internacional con proyectos de bajo impacto.',
    innovacion: 'BIM, certificación energética, rehabilitación urbana, arquitectura paramétrica accesible, Passive House',
    obra: 'Complejo Holcim Madrid (2011, Selgas Cano) / Regeneración Poblenou, Barcelona',
    estilo: 'Arquitectura sostenible / Post-crisis / Rehabilitación',
    impacto: 'España tiene más de 15 millones de viviendas construidas antes de 1980 que necesitan rehabilitación energética. Los fondos europeos Next Generation UE (2021-2026) destinan 6.800 millones a la rehabilitación del parque residencial español.',
    datos: 'España construyó más viviendas entre 1997 y 2007 que Alemania, Francia, Italia y Reino Unido juntos. El "stock" de viviendas sin vender llegó a 800.000 unidades en 2010. La rehabilitación, antes marginal, supera ya el 40% del PIB de la construcción.',
    categoria: 'sostenible',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1075, evento: 'Catedral de Santiago de Compostela: comienzo de la gran obra del Románico español' },
  { anio: 1221, evento: 'Catedral de Burgos iniciada — cumbre del gótico clásico español' },
  { anio: 1563, evento: 'El Escorial comienza: Felipe II y Juan de Herrera definen el clasicismo imperial' },
  { anio: 1882, evento: 'Gaudí se hace cargo de la Sagrada Família — nace el Modernismo catalán radical' },
  { anio: 1908, evento: 'Palau de la Música Catalana (Domènech i Montaner): cumbre del Modernisme' },
  { anio: 1940, evento: 'Valle de los Caídos comienza: la arquitectura monumental del franquismo' },
  { anio: 1986, evento: 'Museo Romano de Mérida (Moneo): la arquitectura española de la democracia alcanza madurez' },
  { anio: 1992, evento: 'Barcelona Olímpica y Expo Sevilla: España se proyecta al mundo a través de la arquitectura' },
  { anio: 1997, evento: 'Guggenheim Bilbao (Frank Gehry): el "Efecto Guggenheim" cambia el paradigma arquitectónico' },
  { anio: 2010, evento: 'Crisis inmobiliaria: el modelo del boom se agota, comienza la era de la rehabilitación' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  romanico: 'Románico',
  gotico: 'Gótico/Mudéjar',
  isabelino: 'Isabelino/Plateresco',
  herrerismo: 'Herrerismo',
  barroco: 'Barroco/Churrigueresco',
  neoclasico: 'Neoclásico',
  historicismo: 'Historicismo',
  modernismo: 'Modernismo Catalán',
  franquismo: 'Arquitectura Franquista',
  desarrollismo: 'Desarrollismo',
  democratico: 'Democracia',
  iconico: 'Iconos Globales',
  sostenible: 'Sostenible',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  romanico: '#8B4513',
  gotico: '#4B0082',
  isabelino: '#DAA520',
  herrerismo: '#696969',
  barroco: '#DC143C',
  neoclasico: '#4169E1',
  historicismo: '#D2691E',
  modernismo: '#228B22',
  franquismo: '#A0522D',
  desarrollismo: '#FF8C00',
  democratico: '#1E90FF',
  iconico: '#2E86AB',
  sostenible: '#48A9A6',
};

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const AÑO_MIN = 1000;
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

function PanelDetalle({ periodo }: { periodo: PeriodoArquitectura }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: COLORES_CATEGORIA[periodo.categoria] }}>
      <h3 className={styles.detalleTitulo} style={{ color: COLORES_CATEGORIA[periodo.categoria] }}>
        {periodo.titulo}
      </h3>
      <p className={styles.detallePeriodo}>{periodo.periodo}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Aportación clave</h4>
          <ul className={styles.datosList}>
            {periodo.innovacion.split(', ').map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Datos técnicos</h4>
          <ul className={styles.infoList}>
            <li><strong>Obra emblemática:</strong> {periodo.obra}</li>
            <li><strong>Estilo arquitectónico:</strong> {periodo.estilo}</li>
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
  const [seleccionado, setSeleccionado] = useState<PeriodoArquitectura | null>(null);

  const filas: PeriodoArquitectura[][] = [[], [], [], []];
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

  const marcadores: number[] = [1100, 1250, 1400, 1550, 1650, 1750, 1850, 1900, 1940, 1980, 2010];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca del año 1000 al 2025.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la arquitectura española"
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
              <span className={styles.statLabel}>Estilo arquitectónico</span>
              <span className={styles.statValue}>{periodo.estilo}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Obra emblemática</span>
              <span className={styles.statValue}>{periodo.obra.split(' /')[0]}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Aportación clave</span>
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
        per.obra.toLowerCase().includes(termino) ||
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
        placeholder="Buscar por período, obra o aportación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período arquitectónico"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Estilo</th>
              <th>Obra emblemática</th>
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
                <td className={styles.estiloCell}>{per.estilo}</td>
                <td>{per.obra.split(' /')[0]}</td>
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
  { nombre: 'Arquitectura Medieval', desde: 1000, hasta: 1450, icono: '⛪' },
  { nombre: 'Los Siglos de Oro', desde: 1450, hasta: 1700, icono: '👑' },
  { nombre: 'Ilustración y Romanticismo', desde: 1700, hasta: 1874, icono: '🏛️' },
  { nombre: 'Modernismo y Vanguardias', desde: 1874, hasta: 1936, icono: '🎨' },
  { nombre: 'Franquismo y Desarrollismo', desde: 1936, hasta: 1975, icono: '🔨' },
  { nombre: 'Democracia e Iconos Globales', desde: 1975, hasta: 9999, icono: '🌍' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos arquitectónicos y eventos históricos organizados en 6 grandes eras.
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

export default function VisualizadorHistoriaArquitecturaEspanola() {
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
        <h1 className={styles.heroTitle}>Historia de la Arquitectura Española</h1>
        <p className={styles.heroSubtitle}>
          Del Románico al Guggenheim — 1.000 años de arquitectura en 13 períodos interactivos
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
        title="Historia de la arquitectura española: estilos e impacto"
        subtitle="Cómo la arquitectura ha definido la identidad, el poder y la cultura de España durante 1.000 años"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la arquitectura española</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Estilo dominante</th>
                <th>Característica esencial</th>
                <th>Referente político</th>
                <th>Obra icónica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Medieval (s.XI–s.XV)</strong></td>
                <td>Románico / Gótico / Mudéjar</td>
                <td>Piedra, arcos, escultura religiosa</td>
                <td>Reinos cristianos y Al-Ándalus</td>
                <td>Catedral de Santiago / Reales Alcázares</td>
              </tr>
              <tr>
                <td><strong>Siglos de Oro (s.XVI–s.XVII)</strong></td>
                <td>Herrerismo / Barroco</td>
                <td>De la austeridad imperial a la ornamentación extrema</td>
                <td>Felipe II / Carlos II</td>
                <td>El Escorial / Plaza Mayor de Salamanca</td>
              </tr>
              <tr>
                <td><strong>Ilustración (s.XVIII–s.XIX)</strong></td>
                <td>Neoclásico / Eclecticismo</td>
                <td>Razón, proporción, nuevos materiales (hierro)</td>
                <td>Carlos III / Isabel II</td>
                <td>Palacio Real / Palacio de Cristal</td>
              </tr>
              <tr>
                <td><strong>Vanguardia (1874–1936)</strong></td>
                <td>Modernismo catalán</td>
                <td>Formas orgánicas, integración naturaleza-arquitectura</td>
                <td>Autonomismo catalán / Burguesía industrial</td>
                <td>Sagrada Família / Palau de la Música</td>
              </tr>
              <tr>
                <td><strong>Franquismo (1936–1975)</strong></td>
                <td>Estilo Nacional / Desarrollismo</td>
                <td>Monumentalismo estatal, después funcionalismo masivo</td>
                <td>Franco / Tecnocracia del Opus Dei</td>
                <td>Valle de los Caídos / Torre de Madrid</td>
              </tr>
              <tr>
                <td><strong>Democracia e Íconos (1975–hoy)</strong></td>
                <td>Postmodernismo / Sostenibilidad</td>
                <td>De la starchitecture al efecto Guggenheim y la rehabilitación</td>
                <td>Transición / Gobierno socialdemócrata</td>
                <td>Guggenheim Bilbao / Museo Romano de Mérida</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto arquitectónico</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏙️</span>
            <div>
              <strong>Impacto urbano</strong>
              <p>La arquitectura ha definido qué ciudades crecen y cuáles se estancan. El Camino de Santiago vertebró el norte peninsular. Los Borbones crearon el Paseo del Prado como eje cultural. El "modelo Barcelona" de las olimpiadas del 92 —recuperación del espacio público, escultura urbana— se estudia en universidades de todo el mundo. El Guggenheim transformó Bilbao de ciudad industrial en destino cultural global.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👑</span>
            <div>
              <strong>Impacto político y simbólico</strong>
              <p>La arquitectura siempre ha sido propaganda del poder: El Escorial para Felipe II, el Palacio Real para los Borbones, el Valle de los Caídos para Franco, el Guggenheim para el nacionalismo vasco. Cada régimen ha construido sus monumentos. La diferencia es la calidad y la permanencia: los edificios buenos sobreviven a sus encargantes, los mediocres desaparecen o se olvidan.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Impacto cultural y turístico</strong>
              <p>La arquitectura española genera entre 15 y 20 millones de visitas turísticas específicas al año. La Sagrada Família recibe 4,5 millones de visitantes —más que el Louvre—. El Prado, el Guggenheim, la Alhambra, El Escorial y Santiago de Compostela son destinos por sí mismos. España tiene 50 bienes declarados Patrimonio de la Humanidad por la UNESCO, entre ellos 8 monumentos arquitectónicos de primer orden.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌿</span>
            <div>
              <strong>Impacto medioambiental</strong>
              <p>La arquitectura es responsable del 40% del consumo energético en España. El boom inmobiliario (1997-2007) produjo edificios con una eficiencia energética deficiente que hoy son una carga: calefacción cara, malas instalaciones. La rehabilitación energética del parque edificado español —financiada por los fondos Next Generation UE— es la mayor oportunidad de reducción de emisiones del país en la próxima década.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre la historia de la arquitectura española</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué el Arte Mudéjar es único en el mundo?</strong>
            <p>El Mudéjar nació de una circunstancia histórica irrepetible: la convivencia (no siempre pacífica) durante siglos de tres culturas —cristiana, islámica y judía— en la Península Ibérica. Los artesanos musulmanes que se quedaron bajo dominio cristiano (llamados mudéjares) siguieron construyendo con sus técnicas: ladrillo, cerámica vidriada, yeserías, artesonados de madera geométrica. El resultado fue una arquitectura sin paralelos en Europa: torres como la Giralda o el campanario de Santa María de Calatayud, palacios como los Reales Alcázares de Sevilla.</p>
            <span className={styles.faqTip}>El Mudéjar fue declarado Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO en 2001. Aragón concentra el mayor número de edificios mudéjares del mundo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la Sagrada Família lleva más de 140 años en construcción?</strong>
            <p>Gaudí murió en 1926 sin haber terminado el templo, dejando solo un 25% construido. La guerra civil española (1936-1939) destruyó los planos originales —recuperados parcialmente de fragmentos—. La construcción se financió exclusivamente con donaciones y entradas de turistas, sin dinero público. Las técnicas de Gaudí —estructuras que se calculan colgando cadenas al revés— eran tan avanzadas que tardaron décadas en poder reproducirse. La digitalización 3D (desde los 90) permitió retomar el diseño con fidelidad. Se estima que se terminará hacia 2026.</p>
            <span className={styles.faqTip}>Si hubieran construido la Sagrada Família al mismo ritmo desde 1882 hasta hoy, habría tardado solo unos 30 años. La ralentización se debe a la financiación por donaciones y las interrupciones históricas.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue el "Efecto Guggenheim" y por qué no siempre funciona?</strong>
            <p>El Guggenheim de Bilbao (1997, Frank Gehry) demostró que un edificio espectacular puede transformar una ciudad industrial declinante en destino cultural global: Bilbao multiplicó por 5 su turismo en el primer año. El "efecto" se intentó replicar en Valencia (Ciudad de las Artes y las Ciencias, Calatrava), Zaragoza (Expo 2008), etc. No siempre funciona: requiere un contexto urbano regenerado, conectividad, hoteles y una programación cultural sostenida. El edificio solo es el catalizador, no la solución.</p>
            <span className={styles.faqTip}>El Guggenheim Bilbao recuperó su coste de construcción (89 millones de dólares) en menos de 3 años solo en ingresos fiscales adicionales. Hoy genera 400-500 millones de euros al año para la economía vasca.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué el boom inmobiliario español fue tan destructivo arquitectónicamente?</strong>
            <p>Entre 1997 y 2007 España construyó más viviendas que Alemania, Francia, Italia y Reino Unido juntos. La presión especulativa significaba construir rápido y barato: fachadas de colores chillones, materiales de baja calidad, ausencia de espacio público, urbanizaciones sin servicios. El resultado fue un "horror arquitectónico" masivo —que ahora envejece muy mal— junto a deuda pública y privada insostenible. La burbuja generó 800.000 viviendas vacías que siguen sin venderse 15 años después.</p>
            <span className={styles.faqTip}>El arquitecto Rafael Moneo definió el boom como "la mayor destrucción del paisaje español desde la desamortización del siglo XIX". Municipios como Seseña (Toledo) planificaron para 40.000 habitantes y nunca superaron los 8.000.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuáles son los principales retos de la arquitectura española actual?</strong>
            <p>El sector enfrenta tres grandes desafíos simultáneos: la rehabilitación energética del parque edificado (15 millones de viviendas ineficientes que consumen el 30% de la energía española), la crisis de accesibilidad a la vivienda en las grandes ciudades (el precio del alquiler ha subido un 70% en 10 años en Madrid y Barcelona) y la regulación del turismo masivo que está degradando los centros históricos. A esto se suma la necesidad de adaptar el patrimonio histórico a los estándares de accesibilidad y eficiencia sin perder sus valores originales.</p>
            <span className={styles.faqTip}>Los fondos europeos Next Generation UE destinan 6.800 millones de euros a la rehabilitación energética de viviendas en España hasta 2026. Es la mayor inversión en rehabilitación de la historia española.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo recorrer el patrimonio arquitectónico español</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Planifica por rutas temáticas, no solo por ciudades</strong>
              <p>El Camino de Santiago estructura el románico del norte. La "ruta del Renacimiento" une Salamanca, Ávila y Segovia. El triángulo modernista catalán (Gaudí, Domènech, Puig i Cadafalch) se puede hacer en 3-4 días en Barcelona. La "ruta de los grandes museos" (Prado, Reina Sofía, Guggenheim, Thyssen) añade tres ciudades. Visitar por estilos arquitectónicos es más enriquecedor que la ruta tradicional capital por capital.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Reserva con antelación los monumentos más demandados</strong>
              <p>La Sagrada Família vende 4,5 millones de entradas al año: sin reserva previa, en temporada alta, puede no haber entradas en el día. El Prado tiene colas en fin de semana. El Museo Reina Sofía tiene entrada gratuita los lunes y domingos de 19:00 a 21:00. El Palacio Real de Madrid es gratuito para ciudadanos de la UE los lunes (horario de invierno). Comprar online con 2-3 semanas de antelación para los grandes monumentos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Visita los monumentos en las horas menos concurridas</strong>
              <p>Para el Guggenheim Bilbao, el primer turno de la mañana (apertura) o a partir de las 17:00 es notablemente menos concurrido. En la Alhambra de Granada, los accesos están limitados: 8.400 personas al día máximo. Las catedrales góticas tienen mejor luz natural por la mañana (los vitrales se iluminan con el sol del este). El interior de la Sagrada Família es más impresionante con luz solar: los colores de los vitrales proyectan luz sobre la nave.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Aprende a leer un edificio histórico antes de visitarlo</strong>
              <p>Cada estilo arquitectónico tiene un "vocabulario" visual: el arco de medio punto es románico, el ojival es gótico, el arco mixtilíneo es Mudéjar, la columna salomónica es barroca. Reconocer estos elementos hace la visita mucho más rica. Apps como "Google Arts & Culture" tienen tours virtuales de la Alhambra, El Escorial y el Guggenheim que puedes ver antes del viaje para llegar con contexto.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Combina patrimonio histórico y arquitectura contemporánea</strong>
              <p>Las ciudades españolas ofrecen contrastes fascinantes: la Catedral Vieja y Nueva de Salamanca, el Casco Antiguo de Bilbao y el Guggenheim, el centro histórico de Madrid y la Torre BBVA (Herzog y de Meuron). El Museo del Prado tiene una ampliación de Rafael Moneo (2007) integrada magistralmente en el edificio neoclásico de Villanueva. Madrid Río (2011, Burgos y Garrido) es uno de los mejores ejemplos de espacio público recuperado en Europa.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la arquitectura española</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>La arquitectura española es profundamente regional: Cataluña tiene el Modernisme, Andalucía el Mudéjar, Castilla el Plateresco y el Herrerismo, el País Vasco el Guggenheim. Cada región protegió su identidad arquitectónica frente a la uniformización. Esto es una fortaleza única: no existe otro país de Europa con tanta diversidad de estilos regionales en un territorio relativamente compacto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p>El Mudéjar es posiblemente la mayor aportación original de España a la historia de la arquitectura mundial. No existe en ningún otro lugar porque requirió una combinación irrepetible: siglos de convivencia entre tres culturas bajo cambio de poder político. Cuando hoy ves una celosía geométrica en cualquier edificio del mundo, estás viendo la influencia —directa o indirecta— del arte islámico que los mudéjares integraron en la arquitectura cristiana.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔬</span>
            <p>Gaudí anticipó en 100 años técnicas que solo se implementaron con ordenadores: la optimización estructural por forma, la integración de la geometría natural en la arquitectura, el uso del trencadís como revestimiento flexible. Los ingenieros del MIT estudiaron sus cálculos estructurales y los encontraron más precisos que los de muchos edificios modernos. La Sagrada Família, sin pilares interiores convencionales, resiste cargas que ningún arquitecto de su época podía calcular analíticamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Los estilos arquitectónicos siempre se solapan: cuando Gaudí construía la Casa Batlló en Barcelona (1904), en Madrid se seguían haciendo edificios eclécticos decimonónicos. Cuando se inauguró el Guggenheim (1997), la mayoría de la arquitectura española seguía siendo convencional. Los hitos revolucionarios conviven con la mediocridad cotidiana. La historia que recordamos son los picos de genialidad; la mayoría del tejido urbano es mucho más humilde.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox OBLIGATORIO */}
        <div className={styles.warningBox}>
          <strong>Aviso sobre dataciones y proyectos en curso</strong>
          <ul>
            <li>Las fechas de construcción de los grandes monumentos históricos (<strong>Catedral de Santiago, Burgos, Salamanca, Sagrada Família</strong>) son aproximadas y a veces objeto de debate histórico entre especialistas; pueden variar según la fuente consultada.</li>
            <li>Los <strong>proyectos en construcción</strong> mencionados (Sagrada Família, rehabilitaciones urbanas, proyectos con fondos Next Generation) tienen fechas estimadas sujetas a cambios por financiación, aprobaciones y condiciones de obra; consultar siempre fuentes oficiales para información actualizada.</li>
            <li>Las cifras de <strong>visitantes y cifras económicas</strong> corresponden a años previos a 2025 y pueden diferir de los datos actuales; se incluyen con finalidad educativa e ilustrativa.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-arquitectura-espanola')} />
      <ShareCard appName="visualizador-historia-arquitectura-espanola" />
      <Footer appName="visualizador-historia-arquitectura-espanola" />
    </div>
  );
}
