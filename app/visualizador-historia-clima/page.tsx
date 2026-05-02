'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaClima.module.css';
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

type Categoria = 'glaciacion' | 'interglacial' | 'calido_humedo' | 'periodo_frio' | 'calentamiento_natural' | 'industrial' | 'emergencia';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoClima {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  fenomeno: string;
  cientificos: string[];
  hitos: string[];
  obra: string;
  pregunta: string;
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
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

const PERIODOS: PeriodoClima[] = [
  {
    id: 'ultima_glaciacion',
    nombre: 'Última Glaciación',
    anioInicio: -15000,
    anioFin: -10000,
    categoria: 'glaciacion',
    fenomeno: 'Máximo Glacial',
    cientificos: ['Primeros homo sapiens en Europa', 'Migraciones Bering'],
    hitos: [
      'Hielo cubría norte de Europa y Norteamérica',
      'Mar 120m más bajo que hoy',
      'Mamuts y fauna pleistocénica',
      'Homo sapiens cruza el estrecho de Bering',
      'Temperaturas globales 6°C menores que hoy',
    ],
    obra: 'Los petroglifos de Font-de-Gaume (15.000 a.C.) — arte rupestre en el frío glacial',
    pregunta: '¿Cómo sobrevivieron los humanos en un planeta cubierto por el hielo?',
    contexto: 'El Último Máximo Glacial ocurrió entre -26.000 y -20.000 años. Casquetes de hielo cubrían Europa hasta los Alpes y el norte de España. El nivel del mar era 120 metros más bajo: Gran Bretaña estaba unida a Europa. Los humanos migraron por el puente terrestre de Bering desde Asia a América. Las pinturas rupestres de Altamira y Lascaux datan de esta era.',
    color: '#B0C4DE',
  },
  {
    id: 'deglaciacion',
    nombre: 'Deglaciación y Dryas Joven',
    anioInicio: -12000,
    anioFin: -9600,
    categoria: 'periodo_frio',
    fenomeno: 'Calentamiento abrupto seguido de enfriamiento súbito',
    cientificos: ['Willi Dansgaard (núcleos de hielo)'],
    hitos: [
      'Temperatura sube 5°C en siglos',
      'Dryas Joven: enfriamiento abrupto de 1.200 años',
      'Extinción de mamuts y mastodontes',
      'Colapso del lago glacial de Agassiz',
      'Fin definitivo de la glaciación',
    ],
    obra: 'El núcleo de hielo de Groenlandia de Dansgaard — registro climático de 100.000 años',
    pregunta: '¿Qué causó el enfriamiento abrupto del Dryas Joven y qué nos dice sobre la estabilidad climática?',
    contexto: 'Hacia -12.000, el clima comenzó a calentarse rápidamente. Pero el Dryas Joven interrumpió el calentamiento: en apenas décadas la temperatura bajó 6°C durante 1.200 años. La causa probable: colapso del lago glacial Agassiz que detuvo la circulación oceánica del Atlántico. Este evento muestra que el clima puede cambiar abruptamente, no solo lentamente.',
    color: '#708090',
  },
  {
    id: 'optimo_holoceno',
    nombre: 'Óptimo Climático del Holoceno',
    anioInicio: -9000,
    anioFin: -5000,
    categoria: 'calido_humedo',
    fenomeno: 'Período Húmedo Africano y calor global',
    cientificos: ['Pioneros de la revolución neolítica'],
    hitos: [
      'Sahara era verde y fértil (-9000 a -3000)',
      'Nacimiento de la agricultura (Mesopotamia)',
      'Nivel del mar sube hasta actual',
      'Temperaturas 2°C superiores al siglo XX',
      'Expansión humana por todos los continentes',
    ],
    obra: "Las pinturas rupestres del Tassili n'Ajjer (Argelia) — hipopótamos en el Sahara verde",
    pregunta: '¿Por qué el Sahara fue fértil y cómo su desertificación moldeó la historia de Egipto?',
    contexto: 'El Período Húmedo Africano (9000-3000 a.C.) transformó el Sahara en sabana con ríos, lagos y grandes fauna. Las poblaciones del Sahara migraron al Nilo cuando el desierto volvió: esto explicaría el auge de Egipto. En Mesopotamia nació la agricultura. El Holoceno temprano fue el período más cálido y húmedo de los últimos 12.000 años.',
    color: '#90EE90',
  },
  {
    id: 'edad_bronce',
    nombre: 'Clima de la Edad del Bronce y Crisis 4.2',
    anioInicio: -5000,
    anioFin: -1200,
    categoria: 'calido_humedo',
    fenomeno: 'Estabilidad climática con evento de colapso 4.2 ka',
    cientificos: ['Arqueólogos de Tell Leilan (Harvey Weiss)'],
    hitos: [
      'Auge de Mesopotamia, Egipto e Indo',
      'Evento 4.2 ka: sequía de 200 años (-2200)',
      'Colapso del Imperio Acadio',
      'Crisis del Imperio Antiguo egipcio',
      'Sequías simultáneas en 3 continentes',
    ],
    obra: "Tell Leilan (Siria): ciudad abandonada por la sequía del 2200 a.C. — primera catástrofe climática registrada",
    pregunta: '¿Fue el colapso del Imperio Acadio la primera crisis climática que destruyó una civilización?',
    contexto: 'Hacia el 2200 a.C., un evento de sequía regional (el "evento 4.2 ka") afectó simultáneamente a Mesopotamia, Egipto, China y la civilización del Indo. El Imperio Acadio de Sargón de Akkad colapsó. El Antiguo Egipto sufrió hambrunas. Harvey Weiss encontró en Tell Leilan (Siria) evidencias arqueológicas directas: la ciudad fue abandonada en décadas.',
    color: '#DAA520',
  },
  {
    id: 'colapso_bronce',
    nombre: 'Colapso de la Edad del Bronce',
    anioInicio: -1200,
    anioFin: -800,
    categoria: 'periodo_frio',
    fenomeno: 'Sequías y enfriamiento regional',
    cientificos: ['Brandon Drake (análisis paleoclimático)'],
    hitos: [
      'Colapso simultáneo de Micenas, Hititas, Ugarit',
      'Sequías en Mediterráneo Oriental',
      'Migraciones de los "Pueblos del Mar"',
      'Oscuridad de la Edad del Hierro temprana',
      'Desaparición de la escritura lineal B',
    ],
    obra: 'Carta de Rib-Hadda al faraón (1350 a.C.): "La ciudad muere de hambre"',
    pregunta: '¿Contribuyó el cambio climático al colapso de las civilizaciones del Mediterráneo en 1200 a.C.?',
    contexto: 'El colapso del Bronce Tardío (1200-1150 a.C.) fue uno de los mayores desastres civilizatorios de la historia. Colapsaron simultáneamente: los hititas, la Grecia micénica, Ugarit y Chipre. La causa es debatida: sequías, terremotos, invasiones de los Pueblos del Mar. Los análisis de sedimentos marinos de 2013 muestran tres años de sequía severa consecutivos.',
    color: '#8B6914',
  },
  {
    id: 'periodo_romano',
    nombre: 'Óptimo Climático Romano',
    anioInicio: -200,
    anioFin: 400,
    categoria: 'calido_humedo',
    fenomeno: 'Período cálido que favoreció el Imperio Romano',
    cientificos: ['Kyle Harper (El fatal destino de Roma)'],
    hitos: [
      'Temperaturas similares al siglo XX',
      'Agricultura próspera en el norte de Europa',
      'Viñedos romanos en Britania',
      'Máxima extensión territorial romana',
      'Inicio de enfriamiento hacia 250 d.C.',
    ],
    obra: '"El fatal destino de Roma" de Kyle Harper — cómo el clima y las epidemias hundieron Roma',
    pregunta: '¿Favoreció el clima cálido el auge del Imperio Romano y su enfriamiento su declive?',
    contexto: 'El Óptimo Climático Romano (200 a.C. - 250 d.C.) fue un período estable y cálido que facilitó la agricultura y los suministros del Imperio. Harper argumenta que el cambio climático (enfriamiento tras 250 d.C.) combinado con epidemias (Plaga de Justiniano) aceleró la caída del Imperio Romano. Los viñedos romanos llegaron hasta el norte de Britania.',
    color: '#CD853F',
  },
  {
    id: 'optimo_medieval',
    nombre: 'Óptimo Climático Medieval',
    anioInicio: 900,
    anioFin: 1300,
    categoria: 'calido_humedo',
    fenomeno: 'Calentamiento medieval',
    cientificos: ['Emmanuel Le Roy Ladurie'],
    hitos: [
      'Viñedos en Inglaterra y Escandinavia',
      'Vikingos colonizan Groenlandia (985)',
      'Leif Eriksson en América (1000)',
      'Construcción de catedrales góticas',
      'Agricultura próspera en Europa septentrional',
    ],
    obra: "El asentamiento vikingo de L'Anse aux Meadows (Terranova, ~1000 d.C.) — posible con el clima cálido",
    pregunta: '¿Cómo el calor medieval permitió a los vikingos colonizar Groenlandia y llegar a América?',
    contexto: 'El Óptimo Climático Medieval (900-1300) fue de 0.5 a 1°C más cálido que la media del siglo XX en el norte de Europa. Los vikingos aprovecharon el deshielo del Atlántico Norte para colonizar Islandia (874) y Groenlandia (985). Leif Eriksson alcanzó Norteamérica hacia el año 1000. Los glaciares alpinos retrocedieron. Las cosechas europeas fueron abundantes.',
    color: '#FFD700',
  },
  {
    id: 'pequena_glaciacion',
    nombre: 'Pequeña Edad de Hielo',
    anioInicio: 1300,
    anioFin: 1850,
    categoria: 'periodo_frio',
    fenomeno: 'Enfriamiento global de varios siglos',
    cientificos: ['Hubert Lamb (climatología histórica)'],
    hitos: [
      'Abandono de Groenlandia por los vikingos',
      'Hambrunas en Europa (1315-1322)',
      'El Támesis congela en invierno',
      'Glaciares alpinos avanzan sobre aldeas',
      'Maunder Mínimum de actividad solar (1645-1715)',
    ],
    obra: '"Las escenas de invierno" de Pieter Brueghel el Viejo (1565) — el frío capturado en pintura',
    pregunta: '¿Por qué el mundo se enfrió durante 500 años y cómo afectó a las grandes civilizaciones?',
    contexto: 'La Pequeña Edad de Hielo comenzó con la Gran Hambruna de 1315-1322, que mató a millones en Europa. Los vikingos abandonaron Groenlandia. Los Alpes sufrieron el avance de glaciares. En Londres se celebraban ferias sobre el Támesis helado. El Mínimo de Maunder (1645-1715), con escasa actividad solar, fue el punto más frío. La Revolución Francesa fue precedida por cosechas catastróficas.',
    color: '#4169E1',
  },
  {
    id: 'revolucion_industrial',
    nombre: 'Inicio del Calentamiento Industrial',
    anioInicio: 1850,
    anioFin: 1950,
    categoria: 'industrial',
    fenomeno: 'Primeras emisiones industriales',
    cientificos: ['Svante Arrhenius', 'John Tyndall', 'Charles David Keeling'],
    hitos: [
      'Tyndall descubre el efecto invernadero (1859)',
      'Arrhenius predice el calentamiento por CO₂ (1896)',
      'Quema masiva de carbón en Europa',
      'Curva de Keeling inicia en Mauna Loa (1958)',
      'CO₂ sube de 280 a 310 ppm en 1950',
    ],
    obra: 'La predicción de Arrhenius (1896): "Duplicar el CO₂ subirá la temperatura 5-6°C" — acertó en el orden de magnitud',
    pregunta: '¿Cuándo se sabía que el CO₂ humano calentaría la Tierra y por qué no se actuó?',
    contexto: 'John Tyndall demostró en 1859 que el CO₂ absorbe radiación infrarroja. Arrhenius calculó en 1896 que duplicar el CO₂ subiría la temperatura global entre 5 y 6°C. En 1958, Keeling comenzó a medir el CO₂ en Mauna Loa, Hawái: la concentración era 315 ppm. El carbón industrial disparó las emisiones desde 1850. La señal del calentamiento aún era difícil de separar de la variabilidad natural.',
    color: '#696969',
  },
  {
    id: 'calentamiento_acelerado',
    nombre: 'Calentamiento Acelerado del Siglo XX',
    anioInicio: 1950,
    anioFin: 2000,
    categoria: 'industrial',
    fenomeno: 'Calentamiento global detectable',
    cientificos: ['James Hansen (NASA)', 'Bert Bolin (IPCC)'],
    hitos: [
      'Creación del IPCC (1988)',
      'Testimonio de Hansen ante el Congreso (1988)',
      'Primer informe IPCC (1990)',
      'Cumbre de la Tierra de Río (1992)',
      'Protocolo de Kioto (1997)',
      'CO₂ supera 360 ppm',
    ],
    obra: 'El testimonio de James Hansen ante el Senado de EE.UU. (1988) — "El calentamiento global ya comenzó"',
    pregunta: '¿Por qué la comunidad científica tardó en convencer a la política de la urgencia climática?',
    contexto: 'En 1988, James Hansen de la NASA testificó ante el Senado americano que el calentamiento global había comenzado con "99% de certeza". El IPCC se creó ese mismo año. El Protocolo de Kioto (1997) fue el primer acuerdo vinculante, pero EE.UU. no lo ratificó. La concentración de CO₂ pasó de 315 ppm en 1958 a 370 ppm en 2000. La evidencia se acumulaba pero la acción política era insuficiente.',
    color: '#FF8C00',
  },
  {
    id: 'extremos_climaticos',
    nombre: 'Era de los Extremos Climáticos',
    anioInicio: 2000,
    anioFin: 2020,
    categoria: 'emergencia',
    fenomeno: 'Récords de temperatura y fenómenos extremos',
    cientificos: ['Michael Mann (palo de hockey)', 'Stefan Rahmstorf'],
    hitos: [
      'Ola de calor Europa 2003 (70.000 muertos)',
      'Huracán Katrina (2005)',
      'Mínimo de hielo ártico (2012)',
      'CO₂ supera 400 ppm (2013)',
      '2016: el año más cálido hasta entonces',
    ],
    obra: 'La gráfica del "palo de hockey" de Michael Mann (1999) — 1.000 años de temperatura global',
    pregunta: '¿Estamos viviendo fenómenos extremos sin precedente histórico o es variabilidad natural amplificada?',
    contexto: 'La primera década del siglo XXI fue la más cálida registrada. La ola de calor de 2003 en Europa mató a 70.000 personas. El Ártico perdió el 40% de su hielo marino. En 2013, el CO₂ superó las 400 ppm por primera vez en 3 millones de años. La gráfica del "palo de hockey" de Mann demostró que el calentamiento actual era extraordinario en escala de milenios.',
    color: '#FF4500',
  },
  {
    id: 'acuerdo_paris',
    nombre: 'Acuerdo de París y Urgencia Climática',
    anioInicio: 2015,
    anioFin: 2025,
    categoria: 'emergencia',
    fenomeno: 'Emergencia climática declarada',
    cientificos: ['Greta Thunberg', 'IPCC AR6 (2021)'],
    hitos: [
      'Acuerdo de París — 196 países (2015)',
      'Informe IPCC 1.5°C (2018)',
      'Declaraciones de emergencia climática',
      'Huelgas climáticas de Fridays for Future (2018)',
      '2023: récord absoluto de temperatura global',
    ],
    obra: 'El informe IPCC SR1.5 (2018) — quedan 12 años para no superar 1.5°C',
    pregunta: '¿Llegará la humanidad a los 1.5°C de calentamiento? ¿Qué significa para el planeta?',
    contexto: 'El Acuerdo de París (2015) comprometió a 196 países a limitar el calentamiento a 1.5-2°C. El IPCC SR1.5 de 2018 advirtió que solo quedaban ~12 años de presupuesto de carbono para el objetivo de 1.5°C. En 2023, el planeta superó por primera vez en un día completo 1.5°C sobre niveles preindustriales. Greta Thunberg y el movimiento Fridays for Future movilizaron a millones de jóvenes.',
    color: '#DC143C',
  },
  {
    id: 'puntos_criticos',
    nombre: 'Puntos de No Retorno',
    anioInicio: 2020,
    anioFin: 2040,
    categoria: 'emergencia',
    fenomeno: 'Tipping points del sistema climático',
    cientificos: ['Johan Rockström (límites planetarios)', 'Tim Lenton'],
    hitos: [
      'Deshielo del permafrost (metano)',
      'Blanqueamiento de corales',
      'Deforestación del Amazonas',
      'Colapso de la Corriente del Atlántico (AMOC)',
      'Deshielo del manto de Groenlandia',
    ],
    obra: '"Tipping elements in the Earth\'s climate system" (Lenton et al., 2008) — el mapa de los puntos de no retorno',
    pregunta: '¿Qué ocurre si cruzamos los puntos de inflexión climáticos y el sistema entra en cascada?',
    contexto: 'Tim Lenton identificó en 2008 los "tipping elements": umbrales climáticos cuyo cruce podría ser irreversible. El permafrost siberiano libera metano al deshelarse, amplificando el calentamiento. La selva amazónica podría colapsar a sabana con la deforestación. AMOC (la corriente oceánica atlántica) muestra señales de debilitamiento. Rockström definió los 9 "límites planetarios" ya en 2009.',
    color: '#8B0000',
  },
  {
    id: 'adaptacion',
    nombre: 'Adaptación y Nuevas Tecnologías Climáticas',
    anioInicio: 2025,
    anioFin: 2050,
    categoria: 'emergencia',
    fenomeno: 'Adaptación climática y geoingeniería',
    cientificos: ['David Keith (Harvard)', 'IPCC AR6 WG3'],
    hitos: [
      'Ciudades resilientes al calor',
      'Agricultura de precisión climática',
      'Captura directa de CO₂ (DAC)',
      'Geoingeniería solar (controversia)',
      'Fondos de adaptación para países vulnerables',
    ],
    obra: 'La planta Mammoth de Climeworks (2024) — captura directa de CO₂ del aire a escala industrial',
    pregunta: '¿Puede la humanidad adaptar sus ciudades y sistemas alimentarios a un mundo 2°C más cálido?',
    contexto: 'La adaptación climática ya no es una opción sino una necesidad. Miami construye infraestructuras elevadas. Bangladesh invierte en diques. La captura directa de CO₂ (DAC) de Climeworks comenzó en Islandia. La geoingeniería solar (inyectar aerosoles en la estratosfera) es el mayor debate científico-ético del momento. Los países en desarrollo reclaman financiación para adaptarse a un problema que no causaron.',
    color: '#9370DB',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: -11700, evento: 'Fin de la última glaciación — el clima se estabiliza en el Holoceno' },
  { anio: -8200, evento: 'Evento 8.2 ka: enfriamiento brusco de 160 años colapsa primeras aldeas neolíticas' },
  { anio: -5000, evento: 'El Sahara comienza su desertificación; poblaciones migran hacia el Nilo' },
  { anio: -2200, evento: 'Colapso del Imperio Acadio por sequía de 200 años (evento 4.2 ka)' },
  { anio: -1200, evento: 'Colapso del Bronce Tardío: sequías afectan simultáneamente Mediterráneo y Oriente Medio' },
  { anio: 536, evento: 'Erupción volcánica provoca "año sin verano" — hambrunas en todo el hemisferio norte' },
  { anio: 985, evento: 'Vikingos colonizan Groenlandia gracias al calor del Óptimo Medieval' },
  { anio: 1315, evento: 'Gran Hambruna Europea — cosechas destruidas por frío y lluvias durante 7 años' },
  { anio: 1816, evento: 'Año sin verano: erupción del Tambora mata cosechas en Europa y América' },
  { anio: 1896, evento: 'Arrhenius predice que duplicar el CO₂ subiría la temperatura 5-6°C' },
  { anio: 1958, evento: 'Keeling inicia la medición continua de CO₂ en Mauna Loa: 315 ppm' },
  { anio: 1988, evento: 'Hansen alerta al Congreso de EE.UU.: el efecto invernadero es una realidad medible' },
  { anio: 2013, evento: 'CO₂ supera 400 ppm por primera vez en 3 millones de años' },
  { anio: 2015, evento: 'Acuerdo de París: 196 países se comprometen a limitar el calentamiento a 1.5°C' },
];

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
  descripcion: string;
}

const ERAS: Era[] = [
  {
    nombre: 'Glaciaciones e Interglaciales',
    desde: -15000,
    hasta: -3000,
    icono: '🧊',
    descripcion: 'Ciclos climáticos naturales moldean la distribución humana y la biodiversidad',
  },
  {
    nombre: 'Clima y Civilizaciones Antiguas',
    desde: -3000,
    hasta: 500,
    icono: '🏛️',
    descripcion: 'Sequías y óptimos climáticos determinan el auge y colapso de imperios',
  },
  {
    nombre: 'Óptimos y Mini-Glaciaciones Medievales',
    desde: 500,
    hasta: 1850,
    icono: '❄️',
    descripcion: 'Vikingos, hambrunas y el Támesis helado: el clima como actor histórico',
  },
  {
    nombre: 'Revolución Industrial y Primeras Señales',
    desde: 1850,
    hasta: 1950,
    icono: '🏭',
    descripcion: 'Arrhenius predice el calentamiento; el CO₂ comienza su ascenso imparable',
  },
  {
    nombre: 'Calentamiento Global Detectado',
    desde: 1950,
    hasta: 2010,
    icono: '📈',
    descripcion: 'Ciencia, política y negacionismo: la batalla por reconocer la crisis climática',
  },
  {
    nombre: 'Emergencia Climática y Adaptación',
    desde: 2010,
    hasta: 2050,
    icono: '🔥',
    descripcion: 'Récords de temperatura, puntos de no retorno y la carrera contra el reloj',
  },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  glaciacion: 'Glaciación',
  interglacial: 'Interglacial',
  calido_humedo: 'Cálido-Húmedo',
  periodo_frio: 'Período Frío',
  calentamiento_natural: 'Calentamiento Natural',
  industrial: 'Industrial',
  emergencia: 'Emergencia',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  glaciacion: '#B0C4DE',
  interglacial: '#90EE90',
  calido_humedo: '#FFD700',
  periodo_frio: '#4169E1',
  calentamiento_natural: '#DAA520',
  industrial: '#696969',
  emergencia: '#DC143C',
};

// ─────────────────────────────────────────────
// Constantes SVG
// ─────────────────────────────────────────────

const AÑO_MIN = -15000;
const AÑO_MAX = 2025;
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

function PanelDetalle({ periodo }: { periodo: PeriodoClima }) {
  const anioFinTexto = periodo.anioFin >= 2040 ? 'futuro próximo' : formatAnio(periodo.anioFin);
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{formatAnio(periodo.anioInicio)} – {anioFinTexto}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
          <ul className={styles.caracteristicasList}>
            {periodo.hitos.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Científicos / Actores</h4>
          <ul className={styles.artistasList}>
            {periodo.cientificos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra / Referencia</span>
        <p>{periodo.obra}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{periodo.pregunta}</p>
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

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoClima | null>(null);

  const filas: PeriodoClima[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin) + 4 <= anioAX(per.anioInicio)) {
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

  const marcadores: number[] = [-12000, -8000, -5000, -2000, 0, 500, 1000, 1500, 1800, 1950, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde el 15.000 a.C. hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia del clima"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcador del año 0 */}
          <line x1={anioAX(0)} y1={FILA_OFFSET_Y} x2={anioAX(0)} y2={svgAlto - 16} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          <text x={anioAX(0)} y={svgAlto - 4} fontSize={9} fill="#888" textAnchor="middle">año 0</text>

          {/* Marcadores de períodos */}
          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">{formatAnio(m)}</text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((per) => {
              const x = anioAX(per.anioInicio);
              const anioFinSvg = Math.min(per.anioFin, AÑO_MAX);
              const w = Math.max(anioAX(anioFinSvg) - x, 10);
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
                    opacity={esSeleccionado ? 1 : 0.82}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#111"
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
  const anioFinTexto = periodo.anioFin >= 2040 ? 'futuro próximo' : formatAnio(periodo.anioFin);

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
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.pregunta}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
              <ul className={styles.caracteristicasList}>
                {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Científicos / Actores</h4>
              <ul className={styles.artistasList}>
                {periodo.cientificos.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra / Referencia</span>
            <p>{periodo.obra}</p>
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
        per.fenomeno.toLowerCase().includes(termino) ||
        per.cientificos.some((c) => c.toLowerCase().includes(termino));
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
        placeholder="Buscar por período, fenómeno o científico..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período climático"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Científico / Actor</th>
              <th>Fenómeno climático</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => {
              const anioFinTexto = per.anioFin >= 2040 ? 'futuro próximo' : formatAnio(per.anioFin);
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
                  <td>{per.cientificos[0]}</td>
                  <td className={styles.preguntaCell}>{per.fenomeno}</td>
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
        Períodos climáticos e hitos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && p.anioFin > era.desde
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && ev.anio < era.hasta
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {formatAnio(era.desde)} – {era.hasta >= 2040 ? 'hoy' : formatAnio(era.hasta)}
                  </span>
                </div>
              </div>

              <p className={styles.eraDescripcion}>{era.descripcion}</p>

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

export default function VisualizadorHistoriaClima() {
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
        <h1 className={styles.heroTitle}>Historia del Clima 🌍</h1>
        <p className={styles.heroSubtitle}>
          De la última glaciación al Acuerdo de París — 17.000 años de historia climática en 14 períodos con los hitos que cambiaron el planeta
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
        title="Guía completa sobre la historia del clima"
        subtitle="Por qué el clima ha cambiado siempre — y qué hace único al cambio climático actual"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 períodos climáticos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Período</th>
                <th>Temperatura vs hoy</th>
                <th>Causa principal</th>
                <th>Impacto civilización</th>
                <th>Lección</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Glaciación</strong></td>
                <td>−6°C global</td>
                <td>Ciclos de Milankovitch</td>
                <td>Homo sapiens migra por puentes de tierra</td>
                <td>El clima puede cambiar radicalmente en milenios</td>
              </tr>
              <tr>
                <td><strong>Óptimo Medieval</strong></td>
                <td>+0,5–1°C norte de Europa</td>
                <td>Actividad solar alta</td>
                <td>Vikingos en Groenlandia y América</td>
                <td>Un grado más cálido transforma civilizaciones</td>
              </tr>
              <tr>
                <td><strong>Pequeña Edad de Hielo</strong></td>
                <td>−0,5–1°C global</td>
                <td>Mínimo solar + erupciones</td>
                <td>Hambrunas, migraciones, colapso feudal</td>
                <td>El frío mata: menos cosecha, más conflicto</td>
              </tr>
              <tr>
                <td><strong>Calentamiento Industrial</strong></td>
                <td>+1,1°C global (2023)</td>
                <td>Combustibles fósiles (antrópico)</td>
                <td>Extremos climáticos, migraciones costeras</td>
                <td>El cambio actual es 10x más rápido que lo natural</td>
              </tr>
              <tr>
                <td><strong>Emergencia Actual</strong></td>
                <td>+1,48°C en 2023</td>
                <td>CO₂ a 425 ppm (récord)</td>
                <td>Puntos de no retorno, refugiados climáticos</td>
                <td>Las decisiones de hoy definen siglos de clima</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios */}
        <h3>Cuatro escenarios climáticos que debes conocer</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌡️</span>
            <div>
              <strong>1.5°C alcanzado (probable antes de 2035)</strong>
              <p>El IPCC considera inevitable superar 1.5°C de forma temporal. Las consecuencias incluyen pérdida del 70% de los arrecifes de coral, deshielo acelerado en el Ártico y mayor frecuencia de olas de calor. Las costas bajas (Bangladesh, islas del Pacífico) comienzan a ser inhabitable en marea alta.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔥</span>
            <div>
              <strong>3°C de calentamiento (sin políticas ambiciosas)</strong>
              <p>El escenario intermedio del IPCC si las políticas actuales no se refuerzan. Implica el colapso de la selva amazónica, pérdida masiva de biodiversidad, sequías permanentes en el Mediterráneo y el Sahel, y subida del mar de hasta 1 metro en 2100. Inviable para la agricultura en regiones tropicales.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">⚠️</span>
            <div>
              <strong>Puntos de no retorno cruzados</strong>
              <p>Si el permafrost libera metano de forma masiva, o la corriente AMOC colapsa, el sistema climático puede entrar en retroalimentación autónoma. Algunos modelos proyectan que cruzar 2°C podría desencadenar 3-5°C adicionales sin más emisiones humanas. Es el peor escenario y el que el IPCC quiere evitar a toda costa.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌱</span>
            <div>
              <strong>Éxito de la descarbonización (SSP1)</strong>
              <p>El escenario optimista del IPCC: emisiones netas cero antes de 2050, energías renovables cubren el 80% de la electricidad en 2030, bosques reforestados absorben CO₂. El calentamiento se estabiliza en 1.5-1.8°C a finales de siglo. Requiere transformación económica global sin precedentes.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Ha cambiado siempre el clima de la Tierra?</strong>
            <p>Sí. Los registros de burbujas de gas en el hielo antártico muestran ciclos regulares de glaciaciones e interglaciaciones cada 100.000 años en los últimos 800.000 años. Lo que hace único al calentamiento actual no es que el clima cambie, sino la velocidad sin precedentes: el cambio actual es 10-100 veces más rápido que cualquier cambio natural documentado en registros paleoclimáticos.</p>
            <span className={styles.faqTip}>Clave: velocidad + causa antrópica = diferencia fundamental con el cambio climático natural.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué son los ciclos de Milankovitch?</strong>
            <p>Son variaciones periódicas en la órbita y la inclinación de la Tierra: excentricidad orbital (100.000 años), oblicuidad axial (41.000 años) y precesión de los equinoccios (26.000 años). Estos ciclos explican las glaciaciones naturales del pasado, pero actualmente su efecto sería de ligero enfriamiento — opuesto al calentamiento observado, lo que confirma que la causa actual es antrópica.</p>
            <span className={styles.faqTip}>Los ciclos de Milankovitch son el «marcapasos» natural del clima; los combustibles fósiles son el «acelerador» artificial.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el efecto invernadero y por qué es problemático ahora?</strong>
            <p>El efecto invernadero natural es esencial: sin él, la Tierra tendría -18°C de media en lugar de +15°C. Los gases (CO₂, metano, vapor de agua) retienen el calor que de otro modo escaparía al espacio. El problema es que las emisiones industriales desde 1850 han intensificado artificialmente este efecto: el CO₂ ha pasado de 280 ppm (estable durante 800.000 años) a 425 ppm en 2024.</p>
            <span className={styles.faqTip}>El CO₂ actual es el más alto en al menos 3 millones de años según los registros geológicos.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es un punto de inflexión climático?</strong>
            <p>Un tipping point es un umbral a partir del cual el sistema climático puede cambiar de forma irreversible y autónoma. El permafrost siberiano libera metano al deshelarse, amplificando el calentamiento. La selva amazónica podría colapsar a sabana. La corriente AMOC muestra señales de debilitamiento. Si estos umbrales se cruzan, el clima podría calentarse más sin necesidad de nuevas emisiones humanas.</p>
            <span className={styles.faqTip}>Nueve puntos de inflexión críticos ya podrían estar activándose según un estudio de 2022 en Science.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre tiempo atmosférico y clima?</strong>
            <p>El tiempo es el estado atmosférico local en un momento dado (hoy llueve en Madrid). El clima es el patrón estadístico a largo plazo (en Madrid llueven 400 mm/año de media). El cambio climático altera los patrones estadísticos: más olas de calor, más lluvias torrenciales, menos precipitación media en el Mediterráneo. Un día frío en invierno no contradice el calentamiento global.</p>
            <span className={styles.faqTip}>«El clima es lo que esperas, el tiempo es lo que obtienes.» La climatología trabaja con medias de 30 años.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>Guía de 5 pasos para entender el cambio climático</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Identifica la causa del cambio climático</strong>
              <p>Cada período climático tiene una causa principal: orbital (ciclos de Milankovitch), volcánica (erupciones que bloquean la luz solar), solar (mínimos y máximos) o antrópica (emisiones de CO₂). El cambio actual tiene causa antrópica confirmada por el 97% de la literatura científica revisada por pares.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprende la escala temporal</strong>
              <p>Los ciclos glaciales naturales duran 100.000 años; el Óptimo Medieval duró 350 años; la Pequeña Edad de Hielo, 550 años. El calentamiento actual ha aumentado 1.5°C en 150 años. La velocidad del cambio es tan importante como su magnitud: los ecosistemas tienen capacidad limitada de adaptación rápida.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Conecta clima e historia humana</strong>
              <p>El colapso del Imperio Romano coincide con el enfriamiento post-romano. Las grandes migraciones bárbaras se aceleran con el frío. El auge de las civilizaciones neolíticas coincide con el Óptimo del Holoceno. El clima no determina la historia, pero la condiciona profundamente: las sociedades vulnerables colapsan antes ante las perturbaciones climáticas.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Aprende a leer los datos climáticos</strong>
              <p>Los datos paleoclimáticos provienen de núcleos de hielo (burbujas de gas que preservan el CO₂ antiguo), sedimentos marinos (organismos que reflejan la temperatura del océano) y anillos de árboles (grosor según calor y lluvia). Las mediciones directas comenzaron en 1850 (temperatura) y 1958 (CO₂ en Mauna Loa). Cada fuente tiene sus limitaciones y su resolución temporal.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Distingue mitigación de adaptación</strong>
              <p>La mitigación reduce las emisiones para frenar el calentamiento futuro (renovables, eficiencia energética, captura de carbono). La adaptación gestiona los impactos ya inevitables (diques, cultivos resistentes al calor, ciudades más frescas). Ambas son necesarias: cuanto menos se mitigue, más habrá que adaptarse. Los modelos del IPCC muestran que la diferencia entre 1.5°C y 3°C se decide en esta década.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>4 claves para interpretar datos climáticos</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <p>El consenso científico es del 97%: los estudios revisados por pares confirman que el calentamiento actual es real, medible y tiene causa antrópica. Las fuentes primarias son los informes del IPCC, NOAA, NASA y el Copernicus Climate Change Service.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌊</span>
            <p>El nivel del mar lleva subiendo desde 1900 (unos 20 cm) y la velocidad se está acelerando. En el Último Máximo Glacial, el nivel del mar era 120 metros más bajo. Las costas actuales de Europa occidental estaban muy lejos del océano.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
            <p>La temperatura global media es una abstracción estadística: las regiones árticas se calientan 4 veces más rápido que el promedio global (amplificación ártica). El calentamiento no es uniforme: algunas zonas tienen más lluvias; otras, más sequías.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p>En 2023 se instaló más capacidad de energía solar que de carbón, gas y nuclear juntos. El ritmo de instalación de renovables se ha triplicado en una década, pero sigue siendo insuficiente para el escenario 1.5°C según el IPCC.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Sobre los datos de esta cronología</strong>
          <ul>
            <li>Los datos paleoclimáticos provienen de registros científicos (núcleos de hielo, sedimentos marinos, anillos de árboles). Son aproximaciones con márgenes de error que aumentan cuanto más atrás en el tiempo.</li>
            <li>Las proyecciones futuras son escenarios IPCC sujetos a incertidumbre científica y política. No son predicciones deterministas: dependen de las decisiones que tome la humanidad en las próximas décadas.</li>
            <li>Los años indicados para períodos prehistóricos (antes de -1000) son aproximaciones con incertidumbre de siglos o milenios según el método de datación utilizado.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-clima')} />
      <ShareCard appName="visualizador-historia-clima" />
      <Footer appName="visualizador-historia-clima" />
    </div>
  );
}
