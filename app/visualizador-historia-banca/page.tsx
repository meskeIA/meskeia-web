'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaBanca.module.css';
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
  | 'medici'
  | 'imperial'
  | 'publica'
  | 'nacional'
  | 'industrial'
  | 'expansion'
  | 'crisis'
  | 'bretton'
  | 'desregulacion'
  | 'globalizacion'
  | 'subprime'
  | 'postcrisis'
  | 'fintech';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoBanca {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  linea: string;     // campo: "Institución / Innovación"
  velocidad: string; // campo: "Tipo de banca"
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

const PERIODOS: PeriodoBanca[] = [
  {
    id: 1, periodo: '1397–1500', anio: 1397, anioFin: 1500,
    titulo: 'Los Medici y la Banca Renacentista',
    descripcion: 'El Banco de los Medici fundado en Florencia (1397) revoluciona las finanzas europeas: red de corresponsales en Brujas, Londres, Ginebra y Roma, letras de cambio como instrumento de crédito internacional, doble contabilidad y banca de depósito. Lorenzo de Medici usa la riqueza bancaria para financiar el arte del Renacimiento (Botticelli, Miguel Ángel). La familia controla las finanzas del papado y varios Estados italianos.',
    innovacion: 'Letras de cambio, banca de depósito, red de corresponsales europeos, doble contabilidad',
    linea: 'Banco de los Medici, Florencia (1397)',
    velocidad: 'Banca de depósito renacentista',
    impacto: 'Los Medici demuestran que la banca puede financiar el poder político, la Iglesia y el arte. Inventan la banca moderna como institución de crédito internacional.',
    datos: 'El Banco de los Medici llegó a tener 8 sucursales en toda Europa. La quiebra en 1494 (tras las invasiones francesas y la mala gestión de Lorenzo el Magnífico) fue el mayor colapso financiero de su época.',
    categoria: 'medici',
  },
  {
    id: 2, periodo: '1500–1600', anio: 1500, anioFin: 1600,
    titulo: 'La Banca Española del Imperio',
    descripcion: 'La Casa de Contratación de Sevilla (1503) centraliza el comercio americano. Carlos V depende de los banqueros alemanes Fugger y Welser para financiar sus guerras y su elección imperial. La plata y el oro americanos fluyen por Sevilla hacia los acreedores europeos. Felipe II declara la primera bancarrota de la historia española (1557), seguida de otras en 1575 y 1596. Los asientos con banqueros genoveses se convierten en el instrumento financiero clave del Imperio.',
    innovacion: 'Asientos bancarios, financiación imperial, transferencias internacionales de metales preciosos',
    linea: 'Casa de Contratación de Sevilla (1503) / Fugger & Welser',
    velocidad: 'Banca imperial y de guerra',
    impacto: 'España crea el primer sistema financiero imperial del mundo, pero las bancarrotas repetidas demuestran que el poder político sin disciplina fiscal es insostenible.',
    datos: 'Felipe II declaró bancarrota cuatro veces (1557, 1560, 1575, 1596). Los Fugger acumularon una fortuna equivalente a 400.000 millones de euros actuales financiando a la Corona española.',
    categoria: 'imperial',
  },
  {
    id: 3, periodo: '1600–1700', anio: 1600, anioFin: 1700,
    titulo: 'La Banca Pública y el Crédito Moderno',
    descripcion: 'El Banco de Ámsterdam (1609) es el primer banco central del mundo: depósitos en metálico, transferencias entre cuentas, estabilidad monetaria. El Banco de Estocolmo (1668, precursor del Riksbank) emite el primer papel moneda moderno europeo. Las Provincias Unidas crean la primera bolsa de valores organizada (Ámsterdam, 1602, para acciones de la Compañía de las Indias Orientales). Los banqueros italianos y genoveses dominan las redes de crédito europeas.',
    innovacion: 'Primer banco central, papel moneda europeo, bolsa de valores, acciones de empresas',
    linea: 'Banco de Ámsterdam (1609) / Banco de Estocolmo (1668)',
    velocidad: 'Banca pública y comercial',
    impacto: 'Ámsterdam demuestra que un banco público con reservas en metálico puede estabilizar el dinero y facilitar el comercio internacional sin depender de banqueros privados.',
    datos: 'La Compañía Holandesa de las Indias Orientales (VOC, 1602) fue la primera empresa en emitir acciones al público. Sus acciones se compraban y vendían en la bolsa de Ámsterdam con una sofisticación que no se recuperaría hasta el siglo XIX.',
    categoria: 'publica',
  },
  {
    id: 4, periodo: '1700–1776', anio: 1700, anioFin: 1776,
    titulo: 'El Banco de Inglaterra y los Bancos Nacionales',
    descripcion: 'El Banco de Inglaterra fundado en 1694 fija el modelo de banco central moderno: monopolio de emisión, prestamista de última instancia, financiación del Estado. En España, el Banco de San Carlos (1782, antecedente del Banco de España) se crea para gestionar la deuda pública. La burbuja de la Compañía de los Mares del Sur (1720, Londres) y la Compañía Mississippi (1720, París) muestran los peligros de la especulación bancaria. Surge la teoría económica con Adam Smith (La Riqueza de las Naciones, 1776).',
    innovacion: 'Banco central moderno, deuda pública organizada, teoría económica',
    linea: 'Banco de Inglaterra (1694) / Banco de San Carlos, España (1782)',
    velocidad: 'Banca central y nacional',
    impacto: 'El Banco de Inglaterra establece el modelo que seguirán todos los bancos centrales modernos: independencia relativa, monopolio de emisión y estabilidad financiera como objetivo principal.',
    datos: 'La burbuja de los Mares del Sur (1720) arruinó a miles de inversores británicos, incluyendo a Isaac Newton, quien perdió 20.000 libras y afirmó: "Puedo calcular el movimiento de las estrellas, pero no la locura de los hombres."',
    categoria: 'nacional',
  },
  {
    id: 5, periodo: '1776–1850', anio: 1776, anioFin: 1850,
    titulo: 'La Revolución Industrial y la Banca de Inversión',
    descripcion: 'La Revolución Industrial requiere capital para fábricas, minas y ferrocarriles: nace la banca de inversión. Los Rothschild construyen una red bancaria pan-europea (Frankfurt, Londres, París, Viena, Nápoles), convirtiéndose en prestamistas de los Gobiernos europeos tras las guerras napoleónicas. Baring Brothers financia la Compañía de las Indias Orientales. El patrón oro emerge como sistema de referencia. Las primeras crisis bancarias modernas (1825, 1837) muestran el riesgo sistémico.',
    innovacion: 'Banca de inversión, bonos gubernamentales, financiación ferroviaria, patrón oro emergente',
    linea: 'Casa Rothschild (1800s) / Baring Brothers',
    velocidad: 'Banca de inversión industrial',
    impacto: 'Los Rothschild demuestran que una red bancaria privada transnacional puede controlar el crédito de los Estados nacionales y financiar guerras o la paz.',
    datos: 'Los Rothschild financiaron el bono para pagar la indemnización a los propietarios de esclavos tras la abolición británica (1835): 20 millones de libras, equivalentes a 300.000 millones de euros actuales. El Reino Unido terminó de pagarlo en 2015.',
    categoria: 'industrial',
  },
  {
    id: 6, periodo: '1850–1913', anio: 1850, anioFin: 1913,
    titulo: 'La Gran Expansión Bancaria',
    descripcion: 'Banco de Santander fundado en 1857, Banco de Bilbao (1857) y Banco de Vizcaya (1901, antecedentes del BBVA). La Reserva Federal de EE. UU. fundada en 1913 tras el pánico bancario de 1907. El patrón oro internacional (Gold Standard) coordina los tipos de cambio europeos. La banca universal alemana (Deutsche Bank, 1870) financia la industrialización pesada. Morgan y Rockefeller crean los primeros trusts financieros americanos. Primer cable telegráfico atlántico (1866): las finanzas se globalizan.',
    innovacion: 'Banca universal, Reserva Federal USA, patrón oro, cable telegráfico financiero',
    linea: 'Banco de Santander (1857) / Reserva Federal USA (1913)',
    velocidad: 'Banca comercial y universal',
    impacto: 'La era dorada de la banca (1850-1913) crea el sistema financiero internacional moderno: bancos universales, bancos centrales y patrón oro. Un sistema que colapsará en 1929.',
    datos: 'El pánico bancario de 1907 (USA) fue tan grave que JP Morgan, con 70 años, coordinó personalmente el rescate del sistema financiero americano, prestando su propio dinero. Ese episodio convenció al Congreso de crear la Reserva Federal en 1913.',
    categoria: 'expansion',
  },
  {
    id: 7, periodo: '1913–1945', anio: 1913, anioFin: 1945,
    titulo: 'Crisis, Guerras y el Crash del 29',
    descripcion: 'El Jueves Negro (24 de octubre de 1929): el mercado de valores de Nueva York colapsa. 9.000 bancos americanos quiebran entre 1930-1933. La Gran Depresión se extiende a Europa. El Glass-Steagall Act (1933, EE. UU.) separa la banca comercial (depósitos) de la banca de inversión durante 66 años. El BIS (Banco de Pagos Internacionales) fundado en 1930 para gestionar las reparaciones de guerra alemanas. Las hiperinflaciones (Alemania 1923, Austria) destruyen la confianza en la banca.',
    innovacion: 'Separación banca comercial/inversión, seguro de depósitos (FDIC), BIS, regulación bancaria',
    linea: 'Crash del 29 / Glass-Steagall Act (1933)',
    velocidad: 'Banca regulada y segmentada',
    impacto: 'El Crash del 29 y la Gran Depresión enseñan que sin regulación, la banca puede destruir la economía real. La respuesta regulatoria (Glass-Steagall) definirá la banca durante 60 años.',
    datos: 'El Banco de España tuvo que ser rescatado por el Estado en la posguerra civil española. En EE. UU., Franklin Roosevelt declaró un "bank holiday" de 4 días (6-10 marzo 1933) cerrando todos los bancos para detener el pánico.',
    categoria: 'crisis',
  },
  {
    id: 8, periodo: '1945–1971', anio: 1945, anioFin: 1971,
    titulo: 'Bretton Woods y el Sistema Monetario Internacional',
    descripcion: 'Conferencia de Bretton Woods (julio 1944): se crea el FMI, el Banco Mundial y se fija el dólar como moneda de reserva internacional vinculada al oro (35 dólares por onza). El Plan Marshall (1948) inyecta 13.000 millones de dólares en Europa financiados por la banca americana. Los Treinta Gloriosos (1945-1975): expansión bancaria del Estado del Bienestar. La banca española se internacionaliza tímidamente con el aperturismo franquista y el Plan de Estabilización (1959).',
    innovacion: 'FMI, Banco Mundial, dólar como moneda de reserva, préstamo internacional público',
    linea: 'FMI / Banco Mundial (1944) / Plan Marshall (1948)',
    velocidad: 'Banca internacional institucional',
    impacto: 'Bretton Woods crea el primer sistema monetario internacional verdaderamente coordinado, con el dólar como ancla. Funciona mientras EE. UU. tiene suficiente oro para respaldarlo.',
    datos: 'El Plan Marshall transformó Europa en 4 años: Alemania Occidental pasó de la ruina total (1945) a ser la tercera economía mundial (1955). Sin financiación americana, la reconstrucción habría tardado décadas.',
    categoria: 'bretton',
  },
  {
    id: 9, periodo: '1971–1987', anio: 1971, anioFin: 1987,
    titulo: 'El Fin del Patrón Oro y la Desregulación',
    descripcion: 'Nixon shock (15 agosto 1971): EE. UU. suspende la convertibilidad dólar-oro unilateralmente. Los tipos de cambio flotantes sustituyen al sistema fijo de Bretton Woods. El Big Bang londinense (1986) desregula el mercado financiero británico. Reagan y Thatcher impulsan la desregulación financiera global. Se crean los primeros derivados modernos (opciones en el CBOE, 1973; futuros financieros). El crash de 1987 (Lunes Negro, -22,6% en un día) muestra la fragilidad del nuevo sistema.',
    innovacion: 'Tipos de cambio flotantes, derivados financieros, desregulación, eurodólares',
    linea: 'Nixon shock (1971) / Big Bang londinense (1986)',
    velocidad: 'Banca desregulada y global',
    impacto: 'La desregulación de los 80 siembra las semillas de la globalización financiera y de las crisis futuras: los mercados son más eficientes pero también más volátiles y sistémicamente más frágiles.',
    datos: 'El 19 de octubre de 1987 (Lunes Negro), el Dow Jones cayó un 22,6% en un solo día. Nunca antes ni después se ha producido una caída tan grande en un solo día. Los programas de trading automático amplificaron el pánico.',
    categoria: 'desregulacion',
  },
  {
    id: 10, periodo: '1987–2000', anio: 1987, anioFin: 2000,
    titulo: 'La Globalización Financiera y el Megabanco',
    descripcion: 'La fusión del Santander con el BCH (1999) crea el BSCH, mayor banco de España. Las fusiones bancarias se aceleran en todo el mundo. La crisis mexicana (1994), la crisis asiática (1997) y el colapso de LTCM (1998, hedge fund con 125.000 millones en activos) muestran el riesgo sistémico de la globalización financiera. El Gramm-Leach-Bliley Act (1999, EE. UU.) deroga el Glass-Steagall: la banca comercial e inversión vuelven a unirse. Internet comienza a transformar la banca (banca online, primeros transfers electrónicos).',
    innovacion: 'Megafusiones bancarias, banca online, derogación Glass-Steagall, hedge funds sistémicos',
    linea: 'Santander + BCH = BSCH (1999) / LTCM (colapso 1998)',
    velocidad: 'Banca universal globalizada',
    impacto: 'La globalización financiera de los 90 concentra el poder bancario en un puñado de megabancos "demasiado grandes para caer" (too big to fail), cuyo colapso podría hundir la economía mundial.',
    datos: 'LTCM tenía 125.000 millones de dólares en activos y posiciones en derivados por más de 1 billón. Su colapso en 1998 obligó a la Reserva Federal a coordinar un rescate privado de 3.625 millones. Nobel de Economía ganadores (Scholes, Merton) entre sus fundadores.',
    categoria: 'globalizacion',
  },
  {
    id: 11, periodo: '2000–2008', anio: 2000, anioFin: 2008,
    titulo: 'Las Hipotecas Subprime y el Riesgo Sistémico',
    descripcion: 'La titulización hipotecaria convierte millones de hipotecas en CDOs (Collateralized Debt Obligations) vendidos en todo el mundo. Las agencias de rating (Moody\'s, S&P, Fitch) otorgan AAA a productos de alto riesgo. Las cajas de ahorro españolas se embarcan en una expansión inmobiliaria temeraria. Las CDS (Credit Default Swaps) permiten apostar contra los propios activos que los bancos venden. El 15 de septiembre de 2008: Lehman Brothers (158 años de historia, 639.000 millones en activos) quiebra. El sistema financiero global congela.',
    innovacion: 'Titulización hipotecaria, CDOs, CDS, modelos de riesgo erróneos',
    linea: 'Lehman Brothers (quiebra 15 sept. 2008) / Cajas españolas',
    velocidad: 'Banca de inversión hipotecaria',
    impacto: 'La crisis subprime revela que el riesgo no desaparece cuando se tituliza: solo se distribuye hasta que explota en toda la cadena. La mayor crisis financiera desde 1929 borra 50 billones de dólares de riqueza global.',
    datos: 'El día que quebró Lehman Brothers, el dinero salió de los fondos monetarios a tal velocidad que la Reserva Federal tuvo que garantizar todos los fondos monetarios americanos (3,8 billones) para evitar un colapso total. Aquella noche, el sistema financiero estuvo a horas de pararse por completo.',
    categoria: 'subprime',
  },
  {
    id: 12, periodo: '2008–2020', anio: 2008, anioFin: 2020,
    titulo: 'Post-Crisis, Regulación y el Rescate Bancario',
    descripcion: 'TARP (EE. UU., 700.000 millones) y el FROB (España, fondo de rescate bancario) rescatan el sistema financiero. En España, las cajas de ahorro colapsan: Bankia (2012) requiere 22.424 millones de dinero público. Basilea III (2010) eleva los requisitos de capital bancario. La Unión Bancaria Europea crea supervisión centralizada y fondo de resolución. El BCE implementa tipos de interés negativos (2014) y compras masivas de deuda. Nacen los challenger banks digitales: N26, Revolut, Monzo.',
    innovacion: 'Basilea III, Unión Bancaria Europea, tipos negativos, challenger banks digitales',
    linea: 'FROB España / Bankia (rescate 2012) / BCE tipos negativos',
    velocidad: 'Banca regulada post-crisis',
    impacto: 'El rescate bancario español costó al contribuyente más de 60.000 millones de euros. La Unión Bancaria Europea crea la supervisión más integrada de la historia, pero el sistema bancario español tarda una década en recuperar la normalidad.',
    datos: 'El BCE compró más de 3 billones de euros en deuda pública y corporativa entre 2015 y 2022 (programa QE) para evitar la deflación y mantener el crédito. En 2014, por primera vez en la historia, los tipos de interés europeos fueron negativos: los bancos pagaban por depositar dinero en el BCE.',
    categoria: 'postcrisis',
  },
  {
    id: 13, periodo: '2020–2026', anio: 2020, anioFin: 2026,
    titulo: 'Fintech, CBDC y Criptomonedas',
    descripcion: 'Bitcoin alcanza reconocimiento institucional (Tesla, MicroStrategy, ETFs). El BCE lanza el proyecto euro digital (CBDC, 2025-2028). El Open Banking (PSD2, 2018) obliga a los bancos a abrir sus datos a fintechs con consentimiento del cliente. Bizum supera los 25 millones de usuarios en España (2024), consolidándose como caso de éxito de pagos instantáneos. La IA transforma la evaluación de riesgos, el fraude y la atención al cliente bancaria. La regulación MiCA (2024) establece el marco europeo para criptoactivos. Consolidación bancaria: CaixaBank absorbe Bankia (2021).',
    innovacion: 'CBDC, Open Banking PSD2, Bizum, IA en banca, regulación MiCA criptoactivos',
    linea: 'Euro digital BCE (2025) / Bizum España / MiCA regulación',
    velocidad: 'Banca digital y fintech',
    impacto: 'La banca del futuro será digital, abierta y regulada. Los bancos tradicionales compiten con fintechs, big techs (Apple Pay, Google Pay) y criptomonedas mientras el BCE diseña el primer dinero digital de banco central europeo.',
    datos: 'Bizum procesa más de 1.000 millones de transferencias al año en España. El euro digital no sustituirá al efectivo sino que lo complementará: el BCE garantiza que siempre habrá dinero físico disponible.',
    categoria: 'fintech',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1397, evento: 'Banco de los Medici fundado en Florencia — nace la banca moderna de depósito' },
  { anio: 1503, evento: 'Casa de Contratación de Sevilla: España centraliza las finanzas del Imperio americano' },
  { anio: 1609, evento: 'Banco de Ámsterdam: primer banco central del mundo con reservas en metálico' },
  { anio: 1694, evento: 'Banco de Inglaterra: modelo de banco central moderno, prestamista de última instancia' },
  { anio: 1782, evento: 'Banco de San Carlos (antecedente del Banco de España): primera banca pública española' },
  { anio: 1857, evento: 'Banco de Santander y Banco de Bilbao fundados: inicio de la gran banca española moderna' },
  { anio: 1929, evento: 'Crash del 29 (Jueves Negro): colapso bursátil y bancario, 9.000 bancos americanos quiebran' },
  { anio: 1944, evento: 'Bretton Woods: FMI, Banco Mundial y dólar como moneda de reserva internacional' },
  { anio: 1971, evento: 'Nixon shock: fin de la convertibilidad dólar-oro, nace el sistema de tipos flotantes' },
  { anio: 2008, evento: 'Lehman Brothers quiebra: mayor crisis financiera desde 1929, rescate bancario global' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  medici: 'Medici',
  imperial: 'Imperial',
  publica: 'Banca Pública',
  nacional: 'Nacional',
  industrial: 'Industrial',
  expansion: 'Gran Expansión',
  crisis: 'Crisis 29',
  bretton: 'Bretton Woods',
  desregulacion: 'Desregulación',
  globalizacion: 'Globalización',
  subprime: 'Subprime',
  postcrisis: 'Post-Crisis',
  fintech: 'Fintech',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  medici: '#8B4513',
  imperial: '#DAA520',
  publica: '#4169E1',
  nacional: '#1E90FF',
  industrial: '#D2691E',
  expansion: '#228B22',
  crisis: '#DC143C',
  bretton: '#9370DB',
  desregulacion: '#FF8C00',
  globalizacion: '#2E86AB',
  subprime: '#A0522D',
  postcrisis: '#696969',
  fintech: '#48A9A6',
};

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const AÑO_MIN = 1397;
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

function PanelDetalle({ periodo }: { periodo: PeriodoBanca }) {
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
            <li><strong>Institución:</strong> {periodo.linea}</li>
            <li><strong>Tipo de banca:</strong> {periodo.velocidad}</li>
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
  const [seleccionado, setSeleccionado] = useState<PeriodoBanca | null>(null);

  const filas: PeriodoBanca[][] = [[], [], [], []];
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

  const marcadores: number[] = [1500, 1600, 1700, 1800, 1850, 1900, 1929, 1945, 1971, 2000];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca de 1397 a 2025.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la banca"
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
              <span className={styles.statLabel}>Tipo de banca</span>
              <span className={styles.statValue}>{periodo.velocidad}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Institución emblemática</span>
              <span className={styles.statValue}>{periodo.linea.split(' /')[0]}</span>
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
        per.linea.toLowerCase().includes(termino) ||
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
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat], color: '#fff' } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período, institución o innovación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período bancario"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Tipo de banca</th>
              <th>Institución emblemática</th>
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
                <td className={styles.velocidadCell}>{per.velocidad}</td>
                <td>{per.linea.split(' /')[0]}</td>
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
  { nombre: 'Banca Medieval y Renacentista', desde: 1397, hasta: 1600, icono: '💰' },
  { nombre: 'Banca del Estado-Nación', desde: 1600, hasta: 1850, icono: '🏛️' },
  { nombre: 'Gran Expansión y Crisis', desde: 1850, hasta: 1945, icono: '📈' },
  { nombre: 'Orden de Posguerra', desde: 1945, hasta: 1971, icono: '🌐' },
  { nombre: 'Globalización Financiera', desde: 1971, hasta: 2008, icono: '💸' },
  { nombre: 'Transformación Digital y Cripto', desde: 2008, hasta: 9999, icono: '💻' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos bancarios y eventos históricos organizados en 6 grandes eras.
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

export default function VisualizadorHistoriaBanca() {
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
        <h1 className={styles.heroTitle}>Historia de la Banca</h1>
        <p className={styles.heroSubtitle}>
          De los Medici (1397) a las Fintech y las Criptomonedas — 13 períodos interactivos de historia financiera
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
        title="Historia de la banca: evolución e impacto"
        subtitle="Cómo la banca transformó la economía, el poder y la sociedad durante 600 años"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la historia bancaria</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Innovación financiera clave</th>
                <th>País/región líder</th>
                <th>Institución emblemática</th>
                <th>Crisis asociada</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Renacentista (1397–1600)</strong></td>
                <td>Letras de cambio, banca de depósito</td>
                <td>Italia (Florencia)</td>
                <td>Banco de los Medici</td>
                <td>Quiebra Medici (1494)</td>
              </tr>
              <tr>
                <td><strong>Nacional (1600–1850)</strong></td>
                <td>Banco central, papel moneda, bolsa</td>
                <td>Países Bajos / Reino Unido</td>
                <td>Banco de Inglaterra (1694)</td>
                <td>Burbuja Mares del Sur (1720)</td>
              </tr>
              <tr>
                <td><strong>Industrial (1850–1913)</strong></td>
                <td>Banca de inversión, patrón oro</td>
                <td>UK / Alemania / USA</td>
                <td>Rothschild / Deutsche Bank</td>
                <td>Pánico bancario 1907</td>
              </tr>
              <tr>
                <td><strong>Regulada (1933–1971)</strong></td>
                <td>Glass-Steagall, FMI, Bretton Woods</td>
                <td>USA / Europa</td>
                <td>Reserva Federal / FMI</td>
                <td>Gran Depresión (1929)</td>
              </tr>
              <tr>
                <td><strong>Global (1971–2008)</strong></td>
                <td>Derivados, tipos flotantes, desregulación</td>
                <td>USA / UK</td>
                <td>Goldman Sachs / Lehman Brothers</td>
                <td>LTCM (1998) / Subprime (2008)</td>
              </tr>
              <tr>
                <td><strong>Digital (2008–hoy)</strong></td>
                <td>Fintech, CBDC, Open Banking, cripto</td>
                <td>Global (UE lidera regulación)</td>
                <td>BCE / Bizum / Revolut</td>
                <td>Rescate bancario europeo (2012)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto bancario</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏛️</span>
            <div>
              <strong>Banca y poder político</strong>
              <p>Los Medici financiaban al papado y a los Gobiernos renacentistas. Los Fugger financiaron la elección imperial de Carlos V. Los Rothschild prestaron a las monarquías europeas tras Napoleón. Hoy, los bancos centrales son el instrumento de política económica más poderoso del Estado. La banca siempre ha estado en el centro del poder.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💥</span>
            <div>
              <strong>Crisis bancarias y sus lecciones</strong>
              <p>Cada gran crisis bancaria (1720, 1825, 1929, 2008) genera una respuesta regulatoria. El patrón se repite: innovación financiera → euforia → riesgo sistémico ignorado → colapso → regulación. El Glass-Steagall (1933) tardó 20 años en gestarse. Basilea III (2010) exige capital que habría evitado 2008. La próxima crisis siempre viene de donde no se mira.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🇪🇸</span>
            <div>
              <strong>La banca española: de las cajas al rescate</strong>
              <p>España tiene una historia bancaria rica: del Banco de San Carlos (1782) al Santander y BBVA globales. Pero la crisis de las cajas de ahorro (2008-2012) fue la mayor catástrofe bancaria española en décadas. Bankia costó más de 22.000 millones al contribuyente. La fusión CaixaBank-Bankia (2021) creó el mayor banco de España. Lección: la expansión inmobiliaria sin control destruye instituciones centenarias.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
            <div>
              <strong>La revolución fintech y el euro digital</strong>
              <p>Bizum, con 25 millones de usuarios en España, es uno de los mayores casos de éxito de pago instantáneo en Europa. El Open Banking (PSD2) obliga a los bancos a abrir sus APIs. El euro digital del BCE (previsto 2025-2028) será la primera moneda digital de banco central europea. La IA transforma la evaluación del riesgo crediticio. Los bancos tradicionales compiten ahora con Apple, Google y Revolut.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre la historia de la banca</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué fueron las bancarrotas de Felipe II y por qué son importantes?</strong>
            <p>Felipe II declaró la suspensión de pagos (bancarrota) en 1557, 1560, 1575 y 1596, siendo el monarca más poderoso del mundo. Las causas: gastos militares desmedidos (Italia, Países Bajos, Armada Invencible), costes de la burocracia imperial y dependencia de banqueros extranjeros (Fugger alemanes, genoveses). Las bancarrotas no implicaban el fin del Estado: era una renegociación forzosa de la deuda. Son históricamente importantes porque demuestran que ningún poder, por grande que sea, puede ignorar indefinidamente sus finanzas.</p>
            <span className={styles.faqTip}>A pesar de cuatro bancarrotas, Felipe II siguió financiando guerras. Los banqueros sabían que el Imperio español, con la plata americana, siempre acabaría pagando algo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue exactamente el Crash del 29 y cómo afectó a España?</strong>
            <p>El Jueves Negro (24 octubre 1929) fue el colapso de la bolsa de Nueva York: millones de pequeños inversores habían comprado acciones a crédito durante los "felices años 20". Cuando los precios cayeron, los márgenes de garantía se activaron masivamente, vendiendo todo a la vez. La cadena de quiebras bancarias (9.000 bancos americanos, 1930-1933) contrajo el crédito mundial. En España, el impacto fue menor porque la economía era menos integrada en los mercados financieros internacionales, pero la República (1931) tuvo que gestionar una economía mundial en depresión.</p>
            <span className={styles.faqTip}>El economista John Kenneth Galbraith escribió "El crash del 29" (1955), el mejor relato de cómo la euforia especulativa de los años 20 hizo inevitable el colapso. Sigue siendo lectura obligada para entender las crisis financieras.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es Bretton Woods y por qué colapsó en 1971?</strong>
            <p>Bretton Woods (1944) fue un acuerdo internacional que fijaba el valor de todas las monedas en relación al dólar (a su vez convertible en oro a 35 dólares por onza). El sistema funcionó mientras EE. UU. tenía suficiente oro. Pero los gastos de la Guerra de Vietnam y el Gran Sociedad de Johnson crearon déficits masivos: los dólares en circulación superaron al oro disponible. Cuando Francia y otros países exigieron el cambio por oro, Nixon suspendió la convertibilidad (15 agosto 1971). Desde entonces, el dinero es "fiduciario": vale porque confiamos en él, no porque esté respaldado por oro.</p>
            <span className={styles.faqTip}>El fin de Bretton Woods liberó a los Gobiernos de la disciplina del oro, permitiendo mayor política monetaria expansiva. También abrió la puerta a la especulación de divisas moderna y a los ciclos financieros más volátiles.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo se produjo la crisis bancaria española de 2008-2012?</strong>
            <p>Las cajas de ahorro españolas (entidades sin ánimo de lucro controladas por políticos autonómicos) se lanzaron a financiar el boom inmobiliario (1997-2007) sin suficiente control de riesgos. Cuando los precios del ladrillo colapsaron (2008), sus balances quedaron llenos de activos tóxicos (hipotecas fallidas, suelo sin valor). El FROB (Fondo de Reestructuración Ordenada Bancaria) inyectó más de 60.000 millones de euros. Bankia (fusión de Caja Madrid, Bancaja y otras 5 cajas) requirió un rescate urgente de 22.424 millones en 2012. De 45 cajas en 2007, hoy quedan prácticamente ninguna: se convirtieron en bancos o fueron absorbidas.</p>
            <span className={styles.faqTip}>El supervisor bancario español (Banco de España) falló en detectar la acumulación de riesgo inmobiliario. La lección: los supervisores deben ser independientes del poder político y tener recursos para actuar anticipadamente.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el euro digital y cuándo llegará?</strong>
            <p>El euro digital es una forma de dinero del banco central europeo en formato electrónico: igual que el efectivo en billetes, pero digital. El BCE lleva desde 2021 investigando su diseño. A diferencia de las criptomonedas (descentralizadas, volátiles), el euro digital es emitido y garantizado por el BCE: tiene el mismo valor y la misma seguridad que un billete de euro. Se prevé que coexista con el efectivo (el BCE garantiza que no lo sustituirá). La fase de preparación formal comenzó en noviembre de 2023; el lanzamiento podría producirse entre 2027 y 2030.</p>
            <span className={styles.faqTip}>Bizum ya funciona como cuasi-dinero digital en España (1.000 millones de transferencias/año). El euro digital sería más ambicioso: funcionaría sin necesidad de banco intermediario, directamente del BCE al ciudadano.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo proteger tus ahorros bancarios en España</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Conoce el Fondo de Garantía de Depósitos (FGD)</strong>
              <p>En España, el FGD garantiza hasta 100.000 euros por titular y por entidad bancaria. Si tu banco quiebra, recibirás hasta esa cantidad en un plazo máximo de 7 días hábiles. Si tienes más de 100.000 euros, distribúyelos entre diferentes entidades bancarias para maximizar la cobertura.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Diversifica entre bancos si tienes grandes sumas</strong>
              <p>El límite de 100.000 euros del FGD es por titular y por banco. Una pareja puede tener hasta 200.000 euros garantizados en una cuenta conjunta (100.000 por persona). Si tienes más, abre cuentas en diferentes bancos. El FGD cubre bancos, cajas de ahorro y cooperativas de crédito registradas en España.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Entiende los riesgos de productos no garantizados</strong>
              <p>Las acciones, bonos, fondos de inversión y participaciones preferentes NO están cubiertos por el FGD. Las preferentes de las cajas (2008-2012) arruinaron a miles de ahorradores porque no entendían que era deuda subordinada, no depósito. Antes de contratar cualquier producto financiero, pregunta explícitamente: ¿está cubierto por el FGD?</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Compara comisiones con herramientas online</strong>
              <p>Los challenger banks (N26, Revolut, Bizum como servicio bancario) suelen tener menores comisiones que la banca tradicional. El Banco de España publica el comparador oficial de cuentas bancarias (gestor de entidades financieras). La Ley de Movilidad Bancaria garantiza que cambiar de banco tarda menos de 13 días hábiles, incluyendo la transferencia de domiciliaciones.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Vigila la salud de tu banco con indicadores públicos</strong>
              <p>El Banco de España publica trimestralmente los ratios de capital (CET1) de los principales bancos. Un ratio CET1 superior al 12% indica solvencia holgada. También publica la tasa de morosidad: por encima del 5% es señal de alerta. La Autoridad Bancaria Europea (EBA) publica los resultados de los tests de estrés anuales, que simulan crisis graves para ver cuáles bancos resistirían.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la historia bancaria</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <p>Las crisis bancarias siguen siempre el mismo patrón: innovación financiera que parece eliminar el riesgo (letras de cambio, acciones, CDOs, criptomonedas) → euforia especulativa → riesgo sistémico ignorado → colapso → regulación. Conocer el patrón no evita la próxima crisis, pero ayuda a reconocerla antes.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏦</span>
            <p>Los bancos centrales (Banco de España, BCE, Reserva Federal) no son bancos normales: no tienen clientes particulares ni buscan beneficios. Su misión es la estabilidad de precios y del sistema financiero. Los tipos de interés que fijan afectan a las hipotecas de millones de personas, a la deuda pública y a la economía global.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>La historia de la banca es también la historia del poder mundial: quien controla el crédito, controla el poder. Los Medici dominaban el papado; los Rothschild, las monarquías europeas; los megabancos americanos, la economía global. Hoy, el BCE y la Fed mueven más dinero en un día que muchos países en un año.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📱</span>
            <p>La banca digital no es solo tecnología: es un cambio de modelo. Antes, el banco era un edificio donde ibas con tu dinero. Ahora, el banco es una app que vive en tu bolsillo. Los bancos que no entiendan esto perderán clientes ante fintechs que ofrecen el mismo servicio con menos fricción y comisiones más bajas.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox OBLIGATORIO */}
        <div className={styles.warningBox}>
          <strong>Aviso sobre datos históricos bancarios y financieros</strong>
          <ul>
            <li>Los <strong>datos históricos</strong> (coste rescates bancarios, cantidades de capital, fechas de fundación) provienen de fuentes académicas y periodísticas; pueden existir variaciones entre fuentes según la metodología empleada.</li>
            <li>Los <strong>proyectos futuros</strong> (euro digital BCE, plazos de lanzamiento, expansión del fintech) tienen fechas tentativas sujetas a cambios regulatorios y técnicos; verificar siempre con fuentes oficiales (BCE, Banco de España, EBA) antes de tomar decisiones.</li>
            <li>Esta app tiene finalidad <strong>exclusivamente educativa</strong>: no constituye asesoramiento financiero ni bancario. Para decisiones sobre productos bancarios o inversiones, consulta con un profesional regulado por la CNMV o el Banco de España.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-banca')} />
      <ShareCard appName="visualizador-historia-banca" />
      <Footer appName="visualizador-historia-banca" />
    </div>
  );
}
