'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaOrdenadores.module.css';
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

type Categoria = 'mecanico' | 'teorico' | 'valvulas' | 'transistor' | 'microprocesador' | 'pc' | 'internet' | 'mobile' | 'cloud' | 'ia';
type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoOrdenadores {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  inventor: string;
  maquina: string;
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

const PERIODOS: PeriodoOrdenadores[] = [
  {
    id: 1, periodo: '1820–1936', anio: 1820, anioFin: 1936,
    titulo: 'Los Precursores Mecánicos',
    descripcion: 'Charles Babbage diseña la Difference Engine (1822) y la Analytical Engine (1837). Ada Lovelace escribe el primer algoritmo computacional (1843). George Boole crea el álgebra booleana (1854). Hollerith inventa la tarjeta perforada para el censo USA (1890).',
    innovacion: 'Difference Engine, álgebra booleana, tarjeta perforada',
    inventor: 'Babbage, Ada Lovelace, Boole, Hollerith',
    maquina: 'Analytical Engine (conceptual)',
    impacto: 'Sentaron las bases matemáticas y conceptuales del ordenador moderno',
    datos: 'La Analytical Engine tenía memoria de 1.000 números de 50 dígitos. Nunca fue construida en vida de Babbage.',
    categoria: 'mecanico',
  },
  {
    id: 2, periodo: '1936–1945', anio: 1936, anioFin: 1945,
    titulo: 'Los Fundamentos Teóricos',
    descripcion: "Alan Turing publica 'On Computable Numbers' (1936) definiendo la máquina de Turing. Claude Shannon establece la teoría de la información (1938). John von Neumann propone la arquitectura stored-program (1945). El Colossus descifra Enigma en Bletchley Park.",
    innovacion: 'Máquina de Turing, teoría información, arquitectura Von Neumann',
    inventor: 'Turing, Shannon, Von Neumann',
    maquina: 'Colossus (1943)',
    impacto: 'El 95% de los ordenadores actuales siguen la arquitectura Von Neumann',
    datos: 'El ENIAC (1945) pesaba 30 toneladas, ocupaba 167 m² y realizaba 5.000 sumas por segundo.',
    categoria: 'teorico',
  },
  {
    id: 3, periodo: '1945–1956', anio: 1945, anioFin: 1956,
    titulo: 'Primera Generación: Válvulas de Vacío',
    descripcion: 'ENIAC (1945): primer ordenador electrónico de propósito general. UNIVAC I (1951): primer ordenador comercial, predice la victoria de Eisenhower. IBM 701 (1952): primer ordenador científico IBM. El Manchester Baby ejecuta el primer programa almacenado (1948).',
    innovacion: 'Ordenador de propósito general, ordenador comercial',
    inventor: 'Eckert, Mauchly, Wilkes',
    maquina: 'ENIAC / UNIVAC I',
    impacto: 'Primer procesamiento masivo de datos: declaraciones fiscales, censos, cálculos militares',
    datos: 'UNIVAC I costó 1 millón de dólares. CBS lo usó para predecir las elecciones USA 1952 con solo el 5% escrutado.',
    categoria: 'valvulas',
  },
  {
    id: 4, periodo: '1956–1964', anio: 1956, anioFin: 1964,
    titulo: 'Segunda Generación: Transistores',
    descripcion: 'El transistor (inventado en Bell Labs, 1947) reemplaza las válvulas. IBM 7090 (1959): primer ordenador transistorizado para ciencia. PDP-1 de DEC (1959): primer ordenador interactivo con monitor. Nacen FORTRAN (1957), COBOL (1959) y LISP (1958).',
    innovacion: 'Transistor, lenguajes de alto nivel, time-sharing',
    inventor: 'Shockley, Bardeen, Brattain (transistor)',
    maquina: 'IBM 7090 / TX-0',
    impacto: 'Reducción del tamaño y coste en 10x. FORTRAN aún existe en supercomputación científica',
    datos: 'El transistor es el dispositivo más fabricado de la historia: más de 10²² unidades producidas.',
    categoria: 'transistor',
  },
  {
    id: 5, periodo: '1964–1975', anio: 1964, anioFin: 1975,
    titulo: 'Tercera Generación: Circuitos Integrados',
    descripcion: "Jack Kilby (Texas Instruments) y Robert Noyce (Fairchild) inventan el circuito integrado (1958). IBM System/360 (1964): primera familia de ordenadores compatibles. DEC PDP-8 (1965): primer miniordenador exitoso. Apollo Guidance Computer (1969) lleva al hombre a la Luna. Moore's Law (1965).",
    innovacion: 'Circuito integrado, compatibilidad, minicomputadora',
    inventor: 'Kilby (Nobel 2000), Noyce',
    maquina: 'IBM System/360 / Apollo Guidance Computer',
    impacto: "La Ley de Moore predijo correctamente el crecimiento exponencial durante 50 años",
    datos: 'El Apollo Guidance Computer tenía 4 KB de RAM y 72 KB de ROM. Menos potencia que una calculadora actual.',
    categoria: 'transistor',
  },
  {
    id: 6, periodo: '1975–1982', anio: 1975, anioFin: 1982,
    titulo: 'Cuarta Generación: El Microprocesador',
    descripcion: 'Intel 4004 (1971): primer microprocesador comercial, 2.300 transistores. Altair 8800 (1975): primer ordenador personal kit. Apple I (1976) y Apple II (1977) de Wozniak y Jobs. Bill Gates y Paul Allen fundan Microsoft (1975) con BASIC para el Altair. CP/M como primer OS de éxito.',
    innovacion: 'Microprocesador, ordenador personal, sistemas operativos',
    inventor: 'Ted Hoff (Intel 4004), Steve Wozniak, Bill Gates',
    maquina: 'Intel 4004 / Apple II / Altair 8800',
    impacto: 'El microprocesador hizo posible el ordenador en el hogar. Apple II vendió 6 millones de unidades.',
    datos: 'El Intel 4004 funcionaba a 740 KHz. Un iPhone moderno es 1 millón de veces más rápido.',
    categoria: 'microprocesador',
  },
  {
    id: 7, periodo: '1982–1993', anio: 1982, anioFin: 1993,
    titulo: 'La Era del PC: IBM y Macintosh',
    descripcion: 'IBM PC (1981): estándar abierto que define el PC moderno. MS-DOS (1981) de Microsoft. Macintosh (1984): primer éxito comercial con GUI e interfaz gráfica. Windows 1.0 (1985). Lotus 1-2-3 define la hoja de cálculo. Commodore 64: el ordenador más vendido de la historia (17 millones).',
    innovacion: 'GUI, hoja de cálculo, PC estándar abierto',
    inventor: 'IBM/Gates, Steve Jobs, Dan Bricklin (VisiCalc)',
    maquina: 'IBM PC 5150 / Apple Macintosh',
    impacto: 'El PC pasó de herramienta científica a electrodoméstico de oficina. WordPerfect, Lotus, dBase II definen la productividad.',
    datos: 'El IBM PC original (1981) costaba 1.565 dólares (4.700 dólares actuales) y tenía 64 KB de RAM.',
    categoria: 'pc',
  },
  {
    id: 8, periodo: '1993–2001', anio: 1993, anioFin: 2001,
    titulo: 'La Revolución Internet',
    descripcion: 'World Wide Web pública (1991, Tim Berners-Lee). Navegador Mosaic (1993). Netscape IPO (1995) dispara el boom dot-com. Windows 95: 7 millones de copias en 5 semanas. Google fundada (1998, Page y Brin). Amazon y eBay nacen (1994-1995). USB estándar (1996). Crisis dot-com (2000).',
    innovacion: 'WWW, buscadores, comercio electrónico, e-mail masivo',
    inventor: 'Tim Berners-Lee, Page y Brin, Bezos',
    maquina: 'Sun SPARCstation / Pentium III',
    impacto: 'Internet transformó la distribución de información. El acceso a dial-up llegó al 50% de hogares USA en 2000.',
    datos: 'Google indexaba 25 millones de páginas en 1998. Hoy indexa más de 100 petabytes.',
    categoria: 'internet',
  },
  {
    id: 9, periodo: '2001–2008', anio: 2001, anioFin: 2008,
    titulo: 'Convergencia Digital y Multimedia',
    descripcion: 'iPod (2001) y iTunes: primer ecosistema digital de música legal. USB drives y WiFi masivos. PowerPoint y Office en cada empresa. MacBook Pro con Intel (2006). YouTube fundado (2005): 65.000 vídeos subidos al día. Facebook (2004) y Twitter (2006). SSD primeros modelos comerciales.',
    innovacion: 'Ecosistema digital, WiFi, redes sociales, multimedia',
    inventor: 'Steve Jobs (iPod), Chad Hurley (YouTube), Zuckerberg',
    maquina: 'PowerMac G5 / ThinkPad T60',
    impacto: 'El contenido multimedia se democratizó. 1 billón de canciones vendidas en iTunes en 2006.',
    datos: 'El primer iPod tenía 5 GB (1.000 canciones). Un smartphone actual almacena millones de canciones en streaming.',
    categoria: 'internet',
  },
  {
    id: 10, periodo: '2008–2014', anio: 2008, anioFin: 2014,
    titulo: 'La Era Mobile: Smartphone y Tablet',
    descripcion: 'iPhone (2007): redefinición del teléfono como ordenador de bolsillo. App Store (2008): economía de apps. Android (2008) de Google. iPad (2010): categoría nueva. ARM supera a x86 en unidades vendidas. Retina Display (2010). Siri (2011): primer asistente de voz exitoso.',
    innovacion: 'Touchscreen, tienda de apps, asistente de voz, ARM',
    inventor: 'Steve Jobs (iPhone), Andy Rubin (Android)',
    maquina: 'iPhone 4 / iPad / Samsung Galaxy',
    impacto: 'En 2013 se vendieron más smartphones que PCs. El 95% del tiempo móvil se pasa en apps.',
    datos: 'La App Store superó 1 millón de apps en 2013. Se han descargado más de 175.000 millones de apps de iOS.',
    categoria: 'mobile',
  },
  {
    id: 11, periodo: '2014–2020', anio: 2014, anioFin: 2020,
    titulo: 'Cloud Computing y Big Data',
    descripcion: 'AWS, Azure y Google Cloud definen el cloud computing. Netflix migra completamente a AWS (2016). Chromebook: el ordenador cloud-first. IoT conecta 10.000 millones de dispositivos (2020). SSD se convierte en estándar. Raspberry Pi democratiza el hardware. Docker y containers revolucionan el desarrollo.',
    innovacion: 'Cloud, containers, IoT, SSD mainstream',
    inventor: 'Jeff Bezos (AWS), Linus Torvalds (Linux/containers)',
    maquina: 'AWS EC2 / Google TPU / Raspberry Pi',
    impacto: 'El 94% de las empresas usan cloud en 2020. AWS genera el 74% del beneficio operativo de Amazon.',
    datos: 'Google procesa más de 8.500 millones de búsquedas al día en servidores cloud.',
    categoria: 'cloud',
  },
  {
    id: 12, periodo: '2020–2022', anio: 2020, anioFin: 2022,
    titulo: 'IA y Deep Learning: La GPU como CPU',
    descripcion: 'NVIDIA GPU computing (CUDA): las GPUs diseñadas para gráficos aceleran el deep learning. AlphaGo vence al campeón mundial (2016). GPT-2 (2019) y GPT-3 (2020): lenguaje natural a escala. Apple M1 (2020): primer chip ARM para Mac, 3,5x más rápido que Intel. GitHub Copilot (2021).',
    innovacion: 'GPU computing, transformers, Apple Silicon',
    inventor: 'Jensen Huang (NVIDIA), Demis Hassabis (DeepMind)',
    maquina: 'NVIDIA A100 / Apple M1',
    impacto: 'El entrenamiento de GPT-3 costó ~4,6 millones de dólares. Los chips de IA consumen el 15% de la electricidad del sector tech.',
    datos: 'Apple M1 integra 16.000 millones de transistores en 5nm. GPT-3 tiene 175.000 millones de parámetros.',
    categoria: 'ia',
  },
  {
    id: 13, periodo: '2022–2024', anio: 2022, anioFin: 2024,
    titulo: 'IA Generativa: ChatGPT Cambia Todo',
    descripcion: 'ChatGPT (noviembre 2022): 100 millones de usuarios en 2 meses, récord histórico. DALL-E 2, Stable Diffusion, Midjourney: imágenes desde texto. Claude, Gemini, Llama: competencia IA masiva. Apple M2/M3 con Neural Engine. NVIDIA H100: chip de IA más demandado de la historia. Chips a 3nm.',
    innovacion: 'LLM conversacional, generación imágenes, NPU dedicada',
    inventor: 'Sam Altman (OpenAI), Dario Amodei (Anthropic)',
    maquina: 'NVIDIA H100 / Apple M3 Pro',
    impacto: 'ChatGPT alcanzó 100 millones de usuarios en 2 meses. La capitalización de NVIDIA superó 3 billones de dólares en 2024.',
    datos: 'El NVIDIA H100 tiene 80.000 millones de transistores. Cuesta 30.000 dólares por unidad.',
    categoria: 'ia',
  },
  {
    id: 14, periodo: '2024–2026', anio: 2024, anioFin: 2026,
    titulo: 'Ordenadores Cuánticos e IA Multimodal',
    descripcion: 'Google Willow (2024): 105 cúbits, resuelve en 5 minutos lo que un supercomputador tardaría 10 septillones de años. IBM Condor: 1.121 cúbits. Microsoft Azure Quantum. IA multimodal (GPT-4o, Gemini Ultra). Chips neuromórficos (Intel Loihi 2). Debate sobre AGI. Apple Vision Pro (2024).',
    innovacion: 'Computación cuántica, IA multimodal, chips neuromórficos',
    inventor: 'John Martinis (Google Quantum), Jensen Huang (NVIDIA)',
    maquina: 'Google Willow / IBM Condor / Apple Vision Pro',
    impacto: 'La computación cuántica amenaza el cifrado RSA actual. El mercado cuántico alcanzará 450.000 millones en 2030.',
    datos: 'Google Willow opera a -273°C (más frío que el espacio exterior) para mantener la coherencia cuántica.',
    categoria: 'ia',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1822, evento: 'Charles Babbage comienza la construcción de la Difference Engine' },
  { anio: 1936, evento: 'Alan Turing publica el concepto de máquina de Turing — base teórica de toda la informática' },
  { anio: 1945, evento: 'ENIAC: primer ordenador electrónico de propósito general — 30 toneladas, 18.000 válvulas' },
  { anio: 1971, evento: 'Intel lanza el 4004: primer microprocesador comercial, 2.300 transistores en un chip' },
  { anio: 1981, evento: 'IBM PC lanza el estándar del PC moderno; MS-DOS de Microsoft lo acompaña' },
  { anio: 1991, evento: 'Tim Berners-Lee hace pública la World Wide Web — nace Internet tal como lo conocemos' },
  { anio: 2007, evento: 'Steve Jobs presenta el iPhone — el ordenador de bolsillo redefine la informática personal' },
  { anio: 2020, evento: 'Apple M1: primer chip ARM para Mac, inicia la era del silicon propio en PCs de consumo' },
  { anio: 2022, evento: 'ChatGPT: 100 millones de usuarios en 2 meses — la IA generativa llega al gran público' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  mecanico: 'Mecánico',
  teorico: 'Teórico',
  valvulas: 'Válvulas',
  transistor: 'Transistor/CI',
  microprocesador: 'Microprocesador',
  pc: 'Era PC',
  internet: 'Internet',
  mobile: 'Mobile',
  cloud: 'Cloud',
  ia: 'IA',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  mecanico: '#8B4513',
  teorico: '#4B0082',
  valvulas: '#DC143C',
  transistor: '#FF8C00',
  microprocesador: '#228B22',
  pc: '#4169E1',
  internet: '#2E86AB',
  mobile: '#48A9A6',
  cloud: '#9370DB',
  ia: '#FF1493',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoOrdenadores }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: COLORES_CATEGORIA[periodo.categoria] }}>
      <h3 className={styles.detalleTitulo} style={{ color: COLORES_CATEGORIA[periodo.categoria] }}>{periodo.titulo}</h3>
      <p className={styles.detallePeriodo}>{periodo.periodo}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <p className={styles.detalleDescripcion}>{periodo.descripcion}</p>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Innovación clave</h4>
          <p className={styles.detalleValor}>{periodo.innovacion}</p>
          <h4 className={styles.detalleSubtitulo}>Inventor / Protagonista</h4>
          <p className={styles.detalleValor}>{periodo.inventor}</p>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Máquina icónica</h4>
          <p className={styles.detalleValor}>{periodo.maquina}</p>
          <h4 className={styles.detalleSubtitulo}>Impacto</h4>
          <p className={styles.detalleValor}>{periodo.impacto}</p>
        </div>
      </div>

      <div className={styles.datoCurioso}>
        <span className={styles.datoCuriosoLabel}>Dato curioso</span>
        <p>{periodo.datos}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = 1820;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoOrdenadores | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoOrdenadores[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anio - b.anio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      const xFinUltimo = ultimoEnFila ? anioAX(Math.min(ultimoEnFila.anioFin, AÑO_MAX)) : -Infinity;
      if (!ultimoEnFila || xFinUltimo + 4 <= anioAX(per.anio)) {
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

  const marcadores: number[] = [1850, 1900, 1945, 1965, 1980, 1995, 2010, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1820 hasta 2025.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de los ordenadores"
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
              const anioFin = Math.min(per.anioFin, AÑO_MAX);
              const x = anioAX(per.anio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;
              const color = COLORES_CATEGORIA[per.categoria];

              return (
                <g key={per.id} onClick={() => setSeleccionado(esSeleccionado ? null : per)} style={{ cursor: 'pointer' }}>
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
                      {per.titulo.length > 18 ? per.titulo.substring(0, 16) + '…' : per.titulo}
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
            {per.anio}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: COLORES_CATEGORIA[periodo.categoria] }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: COLORES_CATEGORIA[periodo.categoria] }}>
          <h3>{periodo.titulo}</h3>
          <p>{periodo.periodo}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <p className={styles.descripcionCompleta}>{periodo.descripcion}</p>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Innovación clave</h4>
              <p className={styles.detalleValor}>{periodo.innovacion}</p>
              <h4 className={styles.detalleSubtitulo}>Inventor / Protagonista</h4>
              <p className={styles.detalleValor}>{periodo.inventor}</p>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Máquina icónica</h4>
              <p className={styles.detalleValor}>{periodo.maquina}</p>
              <h4 className={styles.detalleSubtitulo}>Impacto</h4>
              <p className={styles.detalleValor}>{periodo.impacto}</p>
            </div>
          </div>

          <div className={styles.datoCurioso}>
            <span className={styles.datoCuriosoLabel}>Dato curioso</span>
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
      const coincideBusqueda = !termino ||
        per.titulo.toLowerCase().includes(termino) ||
        per.inventor.toLowerCase().includes(termino) ||
        per.maquina.toLowerCase().includes(termino);
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
        placeholder="Buscar por período, inventor o máquina..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de la historia de los ordenadores"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Inventor / Protagonista</th>
              <th>Máquina icónica</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr
                key={per.id}
                style={i % 2 === 0 ? { background: `${COLORES_CATEGORIA[per.categoria]}18` } : {}}
              >
                <td><strong style={{ color: COLORES_CATEGORIA[per.categoria] }}>{per.titulo}</strong></td>
                <td>{per.periodo}</td>
                <td>
                  <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                    {ETIQUETAS_CATEGORIA[per.categoria]}
                  </span>
                </td>
                <td>{per.inventor}</td>
                <td className={styles.maquinaCell}>{per.maquina}</td>
              </tr>
            ))}
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
  { nombre: 'Era Mecánica y Teórica', desde: 1820, hasta: 1944, icono: '⚙️' },
  { nombre: 'Era de las Válvulas', desde: 1945, hasta: 1955, icono: '💡' },
  { nombre: 'Era del Transistor y Circuito Integrado', desde: 1956, hasta: 1974, icono: '🔬' },
  { nombre: 'Era del PC y el Microprocesador', desde: 1975, hasta: 1994, icono: '🖥️' },
  { nombre: 'Era de Internet y Mobile', desde: 1995, hasta: 2015, icono: '🌐' },
  { nombre: 'Era de la IA y Cuántica', desde: 2016, hasta: 9999, icono: '🤖' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        200 años de informática organizados en 6 grandes eras tecnológicas.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anio < era.hasta && p.anioFin > era.desde
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio <= era.hasta)
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
                      style={{ background: `${COLORES_CATEGORIA[p.categoria]}1A`, color: COLORES_CATEGORIA[p.categoria], borderColor: `${COLORES_CATEGORIA[p.categoria]}55` }}
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

export default function VisualizadorHistoriaOrdenadores() {
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
        <h1 className={styles.heroTitle}>Historia de los Ordenadores</h1>
        <p className={styles.heroSubtitle}>
          De la Máquina de Turing al Ordenador Cuántico — 14 períodos con inventores, máquinas icónicas y los hitos que transformaron la informática
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
        title="Historia de los ordenadores: tecnología y contexto"
        subtitle="Cómo la informática transformó la ciencia, la economía y la sociedad en 200 años"
      >
        {/* Sección 1 — Tabla comparativa */}
        <h3>Comparativa rápida: las 6 generaciones de ordenadores</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Tecnología clave</th>
                <th>Velocidad típica</th>
                <th>Coste aprox.</th>
                <th>Ejemplo icónico</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Válvulas (1945-1956)</strong></td>
                <td>Tubo de vacío</td>
                <td>5.000 ops/seg</td>
                <td>1.000.000 $</td>
                <td>ENIAC / UNIVAC I</td>
              </tr>
              <tr>
                <td><strong>Transistores (1956-1964)</strong></td>
                <td>Transistor semiconductor</td>
                <td>200.000 ops/seg</td>
                <td>100.000 $</td>
                <td>IBM 7090</td>
              </tr>
              <tr>
                <td><strong>Circuito Integrado (1964-1975)</strong></td>
                <td>CI monolítico</td>
                <td>5 millones ops/seg</td>
                <td>10.000 $</td>
                <td>IBM System/360</td>
              </tr>
              <tr>
                <td><strong>Microprocesador (1975-1993)</strong></td>
                <td>CPU en un chip</td>
                <td>1 MIPS</td>
                <td>1.500 $</td>
                <td>IBM PC / Apple Mac</td>
              </tr>
              <tr>
                <td><strong>Internet y Mobile (1993-2014)</strong></td>
                <td>Red + ARM</td>
                <td>1 GFLOPS</td>
                <td>800 $</td>
                <td>iPhone 4 / Pentium III</td>
              </tr>
              <tr>
                <td><strong>IA y Cuántica (2020-hoy)</strong></td>
                <td>GPU + cúbits</td>
                <td>312 TFLOPS (H100)</td>
                <td>30.000 $ (GPU IA)</td>
                <td>NVIDIA H100 / Apple M3</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>El impacto de los ordenadores en cuatro dimensiones</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔭</span>
            <div>
              <strong>Impacto científico</strong>
              <p>Los ordenadores hicieron posibles simulaciones climáticas, el secuenciamiento del genoma humano, la detección de ondas gravitacionales (LIGO) y los modelos de proteínas (AlphaFold). Sin computación, la ciencia moderna no existiría tal como la conocemos.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📈</span>
            <div>
              <strong>Impacto económico</strong>
              <p>La automatización informática incrementó la productividad un 30-50% en sectores industriales. El e-commerce representa el 20% del comercio minorista mundial. Las empresas tecnológicas suponen el 30% del valor del S&amp;P 500 en 2024.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Impacto social</strong>
              <p>Internet conecta a 5.400 millones de personas (2024). Las redes sociales cambiaron la comunicación política y cultural. El teletrabajo masivo fue posible en 2020 gracias a décadas de infraestructura digital. La brecha digital separa quienes tienen acceso de quienes no.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
            <div>
              <strong>Impacto filosófico</strong>
              <p>La IA generativa plantea preguntas sin respuesta: ¿qué es la inteligencia? ¿puede una máquina crear? ¿qué es la conciencia? La Máquina de Turing (1936) propuso el «Test de Turing» como criterio de inteligencia — hoy los LLMs lo superan en muchos aspectos sin que nadie se ponga de acuerdo en qué significa eso.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre una CPU y una GPU?</strong>
            <p>La CPU (Unidad Central de Proceso) tiene pocos núcleos muy potentes, optimizada para tareas secuenciales y complejas. La GPU (Unidad de Proceso Gráfico) tiene miles de núcleos simples, optimizada para operaciones paralelas masivas. El deep learning explota la GPU: entrenar una red neuronal es esencialmente millones de multiplicaciones de matrices simultáneas — exactamente lo que la GPU hace mejor.</p>
            <span className={styles.faqTip}>La GPU se convirtió en el corazón de la IA por accidente: fue diseñada para videojuegos en los años 90. NVIDIA no anticipó que CUDA (2006) convertiría las GPUs en el hardware crítico de la IA.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la computación cuántica y por qué es importante?</strong>
            <p>Un ordenador clásico usa bits (0 o 1). Un ordenador cuántico usa cúbits que pueden ser 0, 1 o superposición de ambos simultáneamente (superposición cuántica). Además, los cúbits pueden estar «entrelazados» — el estado de uno afecta instantáneamente al otro. Esto permite resolver ciertos problemas (factorización, simulación molecular, optimización) exponencialmente más rápido que cualquier ordenador clásico.</p>
            <span className={styles.faqTip}>El problema: los cúbits son extremadamente frágiles. Google Willow opera a -273°C para mantener la coherencia cuántica. A temperatura ambiente, los cúbits pierden su estado cuántico en microsegundos.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué la Ley de Moore está llegando a su límite?</strong>
            <p>Gordon Moore predijo en 1965 que el número de transistores en un chip se duplicaría cada dos años. Eso se cumplió durante 50 años gracias a la miniaturización. El problema: los transistores actuales miden 2-3 nanómetros — el tamaño de unos pocos átomos. A esa escala, los efectos cuánticos hacen que los electrones «tuneleen» a través de barreras que deberían ser impermeables, causando errores y calor.</p>
            <span className={styles.faqTip}>La industria responde con chips 3D (apilando capas), arquitecturas ARM más eficientes, chips especializados (NPU, TPU) y, a largo plazo, la computación cuántica.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué fue la crisis dot-com y por qué ocurrió?</strong>
            <p>Entre 1995 y 2000, el entusiasmo por Internet creó una burbuja especulativa: empresas sin ingresos reales alcanzaban valoraciones de miles de millones. El índice NASDAQ subió un 400% entre 1995 y 2000. En marzo de 2000, la burbuja estalló: el NASDAQ cayó un 78% en 2 años. Muchas empresas desaparecieron, pero las que sobrevivieron (Amazon, Google, eBay) dominarían la economía digital del siglo XXI.</p>
            <span className={styles.faqTip}>Amazon perdió el 90% de su valor entre 2000 y 2001. Bezos no vendió sus acciones. En 2023, Amazon superó 1 billón de dólares en capitalización.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo llegará la Inteligencia General Artificial (AGI)?</strong>
            <p>La AGI es una IA capaz de realizar cualquier tarea cognitiva que pueda hacer un humano, con la misma flexibilidad y generalización. Las predicciones oscilan entre 5 y 50 años, dependiendo del experto. Sam Altman (OpenAI) habla de «años, no décadas». Geoffrey Hinton advierte sobre riesgos existenciales. Yann LeCun (Meta) argumenta que los LLMs actuales no son el camino correcto hacia la AGI.</p>
            <span className={styles.faqTip}>Lo que sí es claro: la IA actual (estrecha) ya supera a los humanos en tareas específicas: ajedrez, go, diagnóstico médico por imagen, síntesis de proteínas. La AGI es cualitativamente diferente.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía 5 pasos */}
        <h3>Cómo elegir un ordenador hoy: guía en 5 pasos</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Define tu uso principal</strong>
              <p>Ofimática y navegación web: cualquier portátil moderno es suficiente. Edición de vídeo o fotografía: necesitas CPU potente y RAM suficiente (16 GB mínimo). Gaming: la GPU importa más que la CPU. IA y Machine Learning: GPU NVIDIA con soporte CUDA. No pagues por lo que no vas a usar.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Prioriza la RAM sobre la velocidad de CPU</strong>
              <p>Con 8 GB de RAM, el sistema se queda sin memoria con el navegador + una aplicación pesada. Con 16 GB, tienes margen para multitarea cómoda. Con 32 GB, para tareas creativas y desarrollo de software. La RAM es el cuello de botella más frecuente en ordenadores de gama media-baja — es difícil de ampliar en portátiles modernos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>SSD obligatorio, HDD solo para almacenamiento secundario</strong>
              <p>Un SSD NVMe arranca Windows en 10-15 segundos. Un HDD puede tardar 60-90 segundos. La diferencia en uso diario es enorme. Si tienes un ordenador antiguo con HDD, sustituirlo por un SSD es la actualización de mayor impacto por el precio (60-100€ para 500 GB). Los HDD tienen sentido solo como almacenamiento externo de gran capacidad.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>ARM vs x86: considera Apple Silicon o chips Snapdragon</strong>
              <p>Los procesadores ARM (Apple M-series, Qualcomm Snapdragon X) ofrecen una eficiencia energética 2-3x superior a los Intel/AMD equivalentes. Un MacBook Air con M3 tiene batería para 18 horas de uso real. El inconveniente: software específico puede no ser compatible (aunque la emulación es cada vez mejor). Para uso general, ARM ya es una opción sólida.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Ajusta el presupuesto a la vida útil esperada</strong>
              <p>Un ordenador de 400€ durará 3-4 años cómodamente. Uno de 800€, 5-6 años. Uno de 1.500€, 7-8 años. Calculando el coste anual, la diferencia se reduce. La obsolescencia no es solo técnica: también es de software (Windows 11 requiere TPM 2.0, cortando el soporte a muchos PCs de 2017-2018). Comprar con margen de RAM y almacenamiento extiende la vida del equipo.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips + warningBox */}
        <h3>Consejos de experto para entender la informática</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⏳</span>
            <p>La velocidad de mejora de la informática es difícil de intuir: si los coches hubieran mejorado al mismo ritmo que los microprocesadores desde 1971, hoy un coche recorrería 480.000 km con un litro de gasolina y costaría menos que un céntimo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>El software define la experiencia, no el hardware. Un ordenador de 2020 con Windows sin actualizar y sin SSD puede sentirse más lento que uno de 2018 bien optimizado. El mantenimiento del software importa tanto como el hardware.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧩</span>
            <p>Los grandes saltos de la informática no fueron solo técnicos, sino de ecosistema: el IBM PC triunfó porque era un estándar abierto; el iPhone por la App Store; AWS porque eliminó la necesidad de servidores físicos. La plataforma importa tanto como el hardware.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <p>Muchas de las ideas fundamentales de la informática tienen décadas: los transformers (base de GPT) tienen elementos de los años 80; el backpropagation que entrena redes neuronales fue formalizado en 1986. El progreso reciente en IA es en gran parte una cuestión de escala, no de ideas radicalmente nuevas.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <strong>Nota sobre predicciones tecnológicas</strong>
          <ul>
            <li>Las predicciones sobre <strong>IA y computación cuántica</strong> son especulativas; los plazos reales suelen diferir significativamente de las estimaciones más optimistas. ChatGPT fue una sorpresa para casi todos los expertos, incluyendo sus creadores.</li>
            <li>La <strong>Ley de Moore</strong> no es una ley física — es una predicción empírica que ya ha flaqueado varias veces. La industria ha encontrado maneras de prolongarla (chips 3D, arquitecturas híbridas), pero el límite atómico es real.</li>
            <li>Las comparaciones de velocidad entre <strong>ordenadores cuánticos y clásicos</strong> son válidas solo para problemas específicos. Un ordenador cuántico no es «más rápido» en general — es exponencialmente mejor para ciertos tipos de problemas y completamente inadecuado para otros.</li>
            <li>Los <strong>plazos para la AGI</strong> varían de 5 a 50 años según el experto. Esta incertidumbre es real y honesta, no marketing. Nadie sabe con certeza cuándo o si llegará la AGI tal como se define actualmente.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-ordenadores')} />
      <ShareCard appName="visualizador-historia-ordenadores" />
      <Footer appName="visualizador-historia-ordenadores" />
    </div>
  );
}
