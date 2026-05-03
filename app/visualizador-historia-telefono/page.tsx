'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaTelefono.module.css';
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
  | 'pionero'
  | 'expansion'
  | 'publico'
  | 'hogares'
  | 'rotatorio'
  | 'digital'
  | 'movil_1g'
  | 'gsm'
  | 'multimedia'
  | 'smartphone'
  | 'apps'
  | 'fiveg'
  | 'ia';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoTelefono {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  dispositivo: string;
  alcance: string;
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

const PERIODOS: PeriodoTelefono[] = [
  {
    id: 1, periodo: '1876–1890', anio: 1876, anioFin: 1890,
    titulo: 'Bell y los Pioneros',
    descripcion: 'Alexander Graham Bell obtiene la patente 174.465 el 7 de marzo de 1876 y realiza la primera llamada telefónica: "Mr. Watson, come here, I want to see you." Thomas Watson está en la habitación contigua. En 1877 se instala la primera línea telefónica comercial entre Boston y Cambridge. La Bell Telephone Company se funda en julio de 1877. Las primeras centralitas son manuales: operadoras conectan físicamente los cables.',
    innovacion: 'Patente telefónica, primera llamada, centralita manual',
    dispositivo: 'Teléfono de manivela Bell (1876)',
    alcance: 'Primeras ciudades de EE.UU. y Europa',
    impacto: 'Demostración de que la voz humana podía transmitirse eléctricamente a distancia, cambiando para siempre la comunicación humana',
    datos: 'La patente de Bell fue impugnada más de 600 veces en los tribunales. Elisha Gray presentó su solicitud el mismo día que Bell, con apenas horas de diferencia. Los tribunales fallaron a favor de Bell.',
    categoria: 'pionero',
  },
  {
    id: 2, periodo: '1890–1910', anio: 1890, anioFin: 1910,
    titulo: 'Las Centralitas y la Red Urbana',
    descripcion: 'Las centralitas telefónicas manuales proliferan en las ciudades. Las operadoras telefónicas (mayoritariamente mujeres) se convierten en un pilar esencial de las comunicaciones. AT&T nace en 1885 como filial de Bell para líneas de larga distancia. La competencia entre Bell y las compañías independientes reduce precios. En España, la primera central telefónica se instala en Madrid en 1884.',
    innovacion: 'Red urbana, operadoras, larga distancia, competencia',
    dispositivo: 'Teléfono de pared con auricular separado',
    alcance: 'Ciudades de EE.UU., Europa y América Latina',
    impacto: 'El teléfono deja de ser curiosidad científica y se convierte en herramienta empresarial. Los negocios que lo adoptan obtienen ventaja competitiva inmediata.',
    datos: 'En 1900 había 1,3 millones de teléfonos en EE.UU. Las operadoras de centralita recibían el trato de "señorita" y debían ser amables bajo cualquier circunstancia, aguantando improperios de usuarios frustrados.',
    categoria: 'expansion',
  },
  {
    id: 3, periodo: '1910–1930', anio: 1910, anioFin: 1930,
    titulo: 'La Telefonía Pública y Automática',
    descripcion: 'Almon Strowger inventa el selector automático en 1891 (patentado 1891, comercializado en 1892): las centralitas automáticas eliminan la necesidad de operadora para llamadas locales. Las cabinas telefónicas públicas se popularizan en calles y estaciones. El teléfono se convierte en herramienta imprescindible para empresas. En España, la Compañía Telefónica Nacional de España (CTNE) se funda en 1924, monopolio nacional.',
    innovacion: 'Marcación automática (Strowger), cabinas públicas, CTNE España',
    dispositivo: 'Teléfono de mesa con disco de marcación',
    alcance: 'Empresas, cabinas públicas, hogares de clase alta',
    impacto: 'La automatización reduce drásticamente los costes operativos y permite la expansión masiva de la red sin necesitar operadoras para cada llamada local.',
    datos: 'Almon Strowger era empresario funerario y sospechaba que la operadora (esposa de un competidor) desviaba sus llamadas. Inventó el selector automático para prescindir de las operadoras. Hoy en día su mecanismo da nombre al sistema "Strowger".',
    categoria: 'publico',
  },
  {
    id: 4, periodo: '1930–1950', anio: 1930, anioFin: 1950,
    titulo: 'El Teléfono Entra en los Hogares',
    descripcion: 'Los teléfonos de baquelita (plástico termoestable) sustituyen a los aparatos de madera y metal. El diseño se vuelve más compacto y elegante. Las líneas compartidas (party lines) permiten que varios hogares compartan un mismo número, reduciendo costes. Durante la II Guerra Mundial el teléfono es esencial para la coordinación militar y civil. La red española se moderniza lentamente.',
    innovacion: 'Baquelita, líneas compartidas, expansión a hogares, uso militar',
    dispositivo: 'Teléfono de baquelita negro (modelo 302, 1937)',
    alcance: 'Hogares de clase media en países desarrollados',
    impacto: 'El teléfono se democratiza parcialmente: deja de ser solo para empresas y empieza a entrar en los hogares de clase media, aunque con líneas compartidas para reducir costes.',
    datos: 'El modelo 302 de Western Electric (1937) diseñado por Henry Dreyfuss es uno de los diseños industriales más influyentes de la historia. Su línea curva estableció el canon estético del teléfono durante dos décadas.',
    categoria: 'hogares',
  },
  {
    id: 5, periodo: '1950–1965', anio: 1950, anioFin: 1965,
    titulo: 'El Rotatorio y la Llamada Internacional',
    descripcion: 'El teléfono rotatorio de disco se convierte en el estándar mundial. AT&T Bell System domina el mercado americano. El Discado Internacional Directo (DDD en EE.UU., 1951) permite marcar llamadas de larga distancia sin operadora. Las llamadas internacionales directas comienzan en 1963 entre EE.UU. y Europa. El teléfono rosa, azul y amarillo de Bell (Princess Phone, 1959) lleva el diseño al dormitorio.',
    innovacion: 'Rotatorio estándar, discado directo, llamadas internacionales, colores',
    dispositivo: 'Princess Phone (Bell, 1959) / Modelo 500 (Western Electric)',
    alcance: 'Masificación en hogares occidentales',
    impacto: 'El teléfono se normaliza como objeto doméstico. La llamada internacional directa acorta el mundo y transforma el comercio y las relaciones personales a distancia.',
    datos: 'El Princess Phone de Bell (1959) fue revolucionario por ser el primer teléfono diseñado específicamente para adolescentes y mujeres. Venía en rosa, azul, turquesa y marfil. Bell lo vendía con el slogan "It\'s little, it\'s lovely, it lights!".',
    categoria: 'rotatorio',
  },
  {
    id: 6, periodo: '1965–1980', anio: 1965, anioFin: 1980,
    titulo: 'El Tono de Marcación y la Red Digital',
    descripcion: 'Bell introduce el sistema DTMF (Dual-Tone Multi-Frequency) en 1963, comercializado masivamente desde 1968: los tonos de marcación reemplazan el disco rotatorio. Los módems permiten que los ordenadores se conecten a través de la red telefónica (ARPANET, 1969). Las primeras redes de datos surgen sobre infraestructura telefónica. La digitalización de las centrales comienza en los años 70.',
    innovacion: 'DTMF (tonos), módems, ARPANET, digitalización de centrales',
    dispositivo: 'Teléfono de teclas DTMF (1968)',
    alcance: 'Empresas y primeras redes informáticas',
    impacto: 'Los tonos DTMF abren la puerta a servicios automatizados (contestadores, IVR). La red telefónica se convierte en el canal de transmisión de datos, el precedente directo de internet.',
    datos: 'La primera llamada de ARPANET (octubre 1969, UCLA-SRI Stanford) se realizó sobre líneas telefónicas. El sistema funcionó hasta que el ordenador destino se bloqueó al recibir la letra "G" de "login". Solo se transmitieron "L" y "O" con éxito.',
    categoria: 'digital',
  },
  {
    id: 7, periodo: '1980–1990', anio: 1980, anioFin: 1990,
    titulo: 'El Móvil de Primera Generación (1G)',
    descripcion: 'Motorola lanza el DynaTAC 8000X en 1983: primer teléfono móvil comercial, 790 gramos, 33 cm de altura, batería para 30 minutos de llamada, precio: 3.995 dólares. La primera red celular comercial (AMPS) se lanza en Chicago en 1983. En Europa surgen redes analógicas NMT (Nórdicos) y TACS (UK). Los "teléfonos de coche" se popularizan entre ejecutivos. España lanza su red analógica MoviLine en 1990.',
    innovacion: 'Motorola DynaTAC, redes celulares 1G, teléfono de coche',
    dispositivo: 'Motorola DynaTAC 8000X (1983) — "el ladrillo"',
    alcance: 'Ejecutivos y empresas de alto poder adquisitivo',
    impacto: 'Por primera vez, la comunicación se libera de la infraestructura fija. El teléfono acompaña a las personas, no al lugar. Un cambio conceptual radical aunque el precio lo limita a élites.',
    datos: 'El Motorola DynaTAC 8000X costaba 3.995 dólares en 1983 (equivale a unos 12.000 euros actuales). La batería tardaba 10 horas en cargarse y aguantaba 30 minutos de llamada. Gordon Gekko lo usa en "Wall Street" (1987), convirtiéndolo en símbolo del poder ejecutivo de los 80.',
    categoria: 'movil_1g',
  },
  {
    id: 8, periodo: '1990–2000', anio: 1990, anioFin: 2000,
    titulo: 'El GSM y el SMS: La Era Digital Móvil',
    descripcion: 'GSM (Global System for Mobile Communications) se lanza en 1991 en Finlandia: primer estándar digital móvil europeo. El primer SMS de la historia se envía el 3 de diciembre de 1992 ("Merry Christmas"). Nokia lidera el diseño de móviles compactos: Nokia 3210 (1999), sin antena externa, icónico. El roaming internacional hace posible el móvil en viajes. En España, MoviStar y Airtel compiten. Los móviles se vuelven objetos de consumo masivo.',
    innovacion: 'GSM digital, SMS, Nokia compacto, roaming, 2G',
    dispositivo: 'Nokia 3210 (1999) / Motorola StarTAC (1996)',
    alcance: 'Masificación en países desarrollados, inicio en vías de desarrollo',
    impacto: 'El SMS transforma la comunicación escrita: brevedad, asincronía y bajo coste. La generación millennial crece con el móvil como objeto personal. España alcanza 13 millones de líneas móviles en 2000.',
    datos: 'El primer SMS ("Merry Christmas") lo envió Neil Papworth (22 años, ingeniero de Vodafone) a Richard Jarvis el 3 de diciembre de 1992. En 1999 se enviaban 1.000 millones de SMS al mes mundialmente. El Nokia 3210 vendió 150 millones de unidades, convirtiéndose en uno de los móviles más vendidos de la historia.',
    categoria: 'gsm',
  },
  {
    id: 9, periodo: '2000–2007', anio: 2000, anioFin: 2007,
    titulo: 'El Teléfono Multimedia: Cámara, Internet y Música',
    descripcion: 'J-Phone (Japón) lanza el primer móvil con cámara integrada en 2000. El 3G llega en 2001 (Japón) y en Europa desde 2003, permitiendo internet móvil básico. WAP intenta llevar internet al móvil con éxito limitado. Nokia N95 (2007): GPS, cámara de 5 megapíxeles, WiFi, reproductor mp3. BlackBerry se convierte en el dispositivo empresarial por excelencia con teclado físico QWERTY y correo electrónico seguro. Los ringtones son negocio multimillonario.',
    innovacion: 'Cámara integrada, 3G, GPS, mp3, BlackBerry',
    dispositivo: 'Nokia N95 (2007) / BlackBerry 8100 (2006)',
    alcance: 'Expansión global, 2.700 millones de líneas en 2007',
    impacto: 'El móvil converge funciones: cámara, música, internet, GPS. Empieza a sustituir a dispositivos dedicados. La fotografía cotidiana se democratiza totalmente.',
    datos: 'El Nokia N95 (2007) costaba 550 euros y era considerado el "cuchillo suizo" de los móviles. En el mismo año, Steve Jobs presentó el iPhone. El N95 tenía más especificaciones técnicas, pero el iPhone ganó la guerra de la interfaz.',
    categoria: 'multimedia',
  },
  {
    id: 10, periodo: '2007–2012', anio: 2007, anioFin: 2012,
    titulo: 'La Revolución del Smartphone: iPhone y Android',
    descripcion: 'Steve Jobs presenta el iPhone el 9 de enero de 2007 en el Macworld: "Today, Apple is going to reinvent the phone." Pantalla táctil multitouch, sin teclado físico, diseño minimalista. El App Store abre en julio de 2008 con 500 aplicaciones. Google lanza Android en 2008 (primer dispositivo: HTC Dream). La revolución de las apps: millones de desarrolladores crean ecosistemas. El iPhone 4 introduce la pantalla Retina (2010). Samsung Galaxy empieza a competir seriamente.',
    innovacion: 'iPhone touchscreen, App Store, Android, ecosistema de apps',
    dispositivo: 'iPhone (2007) / HTC Dream Android (2008)',
    alcance: 'Países desarrollados primero, expansión global rápida',
    impacto: 'El smartphone redefine qué es un teléfono: ya no es un dispositivo de llamadas sino un ordenador de bolsillo. La app economy genera billones de dólares y nuevos modelos de negocio.',
    datos: 'En la presentación del iPhone, Jobs dijo que Apple estaba presentando "un iPod, un teléfono y un comunicador de internet" en un solo dispositivo. El público tardó en entender que eran UNO. En 2007, Nokia controlaba el 49,4% del mercado mundial de móviles. En 2012, ese porcentaje había caído al 14,8%.',
    categoria: 'smartphone',
  },
  {
    id: 11, periodo: '2012–2018', anio: 2012, anioFin: 2018,
    titulo: '4G, WhatsApp y la Era de las Apps',
    descripcion: 'El 4G LTE se extiende globalmente, permitiendo streaming de vídeo en HD. WhatsApp (comprado por Facebook en 2014 por 19.000 millones de dólares) se convierte en la app de mensajería dominante mundial. Instagram transforma la fotografía social. Los pagos móviles (Apple Pay, Google Pay) empiezan a sustituir a las tarjetas. La selfie se convierte en fenómeno cultural (cámara frontal estándar). Los teléfonos alcanzan pantallas de 5-6 pulgadas.',
    innovacion: '4G, WhatsApp, Instagram, pagos móviles, selfie culture',
    dispositivo: 'iPhone 6 (2014) / Samsung Galaxy S7 (2016)',
    alcance: 'Más de 5.000 millones de líneas móviles en 2018',
    impacto: 'El smartphone se convierte en el dispositivo más universal de la historia. WhatsApp elimina el coste de los SMS internacionales y transforma la comunicación familiar global.',
    datos: 'WhatsApp fue comprada por Facebook en febrero de 2014 por 19.000 millones de dólares: 42 dólares por cada uno de sus 450 millones de usuarios activos. Tenía solo 55 empleados. En 2023, WhatsApp tiene más de 2.000 millones de usuarios activos mensuales.',
    categoria: 'apps',
  },
  {
    id: 12, periodo: '2018–2023', anio: 2018, anioFin: 2023,
    titulo: '5G y el Ecosistema Conectado',
    descripcion: 'Corea del Sur lanza el primer 5G comercial en abril de 2019. El 5G promete velocidades de hasta 20 Gbps, latencia de 1ms e IoT masivo. Samsung Galaxy Fold (2019): primer teléfono plegable comercial, 1.980 euros. La eSIM elimina la tarjeta física y permite múltiples operadoras simultáneas. El IoT conecta millones de dispositivos a través de los teléfonos. La pandemia COVID-19 (2020) dispara el uso de videollamadas (Zoom, Teams, FaceTime).',
    innovacion: '5G, plegables, eSIM, IoT, videollamada masiva',
    dispositivo: 'Samsung Galaxy Fold (2019) / iPhone 12 5G (2020)',
    alcance: 'Cobertura 5G en ciudades de todo el mundo',
    impacto: 'El 5G habilita la siguiente fase: ciudades inteligentes, coches autónomos y telemedicina en tiempo real. La pandemia convierte el vídeo en la nueva llamada.',
    datos: 'El Galaxy Fold original fue retirado del mercado días antes de su lanzamiento porque las pantallas se rompían fácilmente. Samsung lo rediseñó en 3 meses. En 2023 los plegables representan el 1,5% del mercado total de smartphones, pero crecen un 50% anual.',
    categoria: 'fiveg',
  },
  {
    id: 13, periodo: '2023–2026', anio: 2023, anioFin: 2026,
    titulo: 'IA Conversacional Integrada',
    descripcion: 'ChatGPT llega a los móviles en 2023, transformando la forma de interactuar con el teléfono. Apple anuncia Apple Intelligence (2024): IA nativa en iPhone 16 que reescribe textos, resume notificaciones y controla apps. Google integra Gemini como asistente en Android. El procesado de IA on-device (en el propio chip del teléfono) permite privacidad sin enviar datos a la nube. Los teléfonos incluyen chips de IA dedicados (NPU). La búsqueda por voz evoluciona hacia conversación natural.',
    innovacion: 'ChatGPT móvil, Apple Intelligence, Gemini, IA on-device, NPU',
    dispositivo: 'iPhone 16 Pro (2024) / Samsung Galaxy S24 (IA generativa)',
    alcance: 'Disponible en smartphones de gama media-alta globalmente',
    impacto: 'El teléfono evoluciona de herramienta a agente inteligente personal. La IA integrada promete ser la mayor revolución en la interfaz móvil desde el touchscreen de 2007.',
    datos: 'Apple Intelligence (2024) requiere iPhone 15 Pro o superior con chip A17 Pro. En el lanzamiento, solo funciona en inglés. Las funciones de IA generativa (generación de imágenes, escritura asistida) se activan gradualmente. En 2025, más de 100 millones de iPhones tienen acceso a Apple Intelligence.',
    categoria: 'ia',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1876, evento: 'Alexander Graham Bell patenta el teléfono — primera llamada: "Mr. Watson, come here"' },
  { anio: 1884, evento: 'Primera central telefónica en España (Madrid) — el teléfono llega a la Península' },
  { anio: 1892, evento: 'Centralita automática Strowger — fin de la operadora para llamadas locales' },
  { anio: 1924, evento: 'Fundación de CTNE (Compañía Telefónica Nacional de España) — monopolio del teléfono en España' },
  { anio: 1983, evento: 'Motorola DynaTAC 8000X — primer teléfono móvil comercial ($3.995)' },
  { anio: 1992, evento: 'Primer SMS de la historia: "Merry Christmas" — nace la mensajería de texto' },
  { anio: 1999, evento: 'Nokia 3210 — el móvil se convierte en objeto de consumo masivo sin antena externa' },
  { anio: 2007, evento: 'iPhone de Apple — Steve Jobs reinventa el teléfono con pantalla táctil y apps' },
  { anio: 2014, evento: 'Facebook compra WhatsApp por 19.000 millones — el SMS muere, la mensajería es gratuita' },
  { anio: 2019, evento: 'Primer 5G comercial en Corea del Sur — comienza la era de conectividad ultrarrápida' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  pionero: 'Pionero Bell',
  expansion: 'Expansión Urbana',
  publico: 'Telefonía Pública',
  hogares: 'En los Hogares',
  rotatorio: 'Teléfono Rotatorio',
  digital: 'Red Digital',
  movil_1g: 'Móvil 1G',
  gsm: 'GSM / SMS',
  multimedia: 'Multimedia',
  smartphone: 'Smartphone',
  apps: 'Era de las Apps',
  fiveg: '5G Conectado',
  ia: 'IA Integrada',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  pionero: '#8B4513',
  expansion: '#D2691E',
  publico: '#DAA520',
  hogares: '#696969',
  rotatorio: '#4169E1',
  digital: '#1E90FF',
  movil_1g: '#DC143C',
  gsm: '#228B22',
  multimedia: '#9370DB',
  smartphone: '#FF6347',
  apps: '#2E86AB',
  fiveg: '#48A9A6',
  ia: '#FF8C00',
};

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const AÑO_MIN = 1876;
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

function PanelDetalle({ periodo }: { periodo: PeriodoTelefono }) {
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
            <li><strong>Dispositivo:</strong> {periodo.dispositivo}</li>
            <li><strong>Alcance:</strong> {periodo.alcance}</li>
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
  const [seleccionado, setSeleccionado] = useState<PeriodoTelefono | null>(null);

  const filas: PeriodoTelefono[][] = [[], [], [], []];
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

  const marcadores: number[] = [1900, 1920, 1940, 1960, 1980, 1990, 2000, 2007, 2012, 2018];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca de 1876 a 2026.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia del teléfono"
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
              <span className={styles.statLabel}>Dispositivo</span>
              <span className={styles.statValue}>{periodo.dispositivo.split(' /')[0]}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Alcance</span>
              <span className={styles.statValue}>{periodo.alcance.split(',')[0]}</span>
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
        per.dispositivo.toLowerCase().includes(termino) ||
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
        placeholder="Buscar por período, dispositivo o innovación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de la historia del teléfono"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Dispositivo icónico</th>
              <th>Innovación clave</th>
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
                <td className={styles.velocidadCell}>{per.dispositivo.split(' /')[0]}</td>
                <td>{per.innovacion.split(',')[0]}</td>
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
  { nombre: 'Era del Teléfono Fijo', desde: 1876, hasta: 1945, icono: '📟' },
  { nombre: 'Expansión Universal', desde: 1945, hasta: 1980, icono: '🌐' },
  { nombre: 'La Revolución Móvil', desde: 1980, hasta: 2000, icono: '📱' },
  { nombre: 'El Smartphone como Computador', desde: 2000, hasta: 2012, icono: '💡' },
  { nombre: 'Conectividad Total', desde: 2012, hasta: 2020, icono: '🔗' },
  { nombre: 'IA y Comunicación Aumentada', desde: 2020, hasta: 9999, icono: '🤖' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos y eventos organizados en las 6 grandes eras de la historia del teléfono.
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

export default function VisualizadorHistoriaTelefono() {
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
        <h1 className={styles.heroTitle}>Historia del Teléfono</h1>
        <p className={styles.heroSubtitle}>
          De Bell (1876) al 5G e IA Conversacional — 150 años de comunicación telefónica en 13 períodos interactivos
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
        title="Historia del teléfono: evolución e impacto"
        subtitle="Cómo el teléfono transformó la comunicación, la economía y la sociedad durante 150 años"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la historia del teléfono</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Tecnología</th>
                <th>Dispositivo icónico</th>
                <th>País líder</th>
                <th>Cambio clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Teléfono Fijo (1876–1945)</strong></td>
                <td>Analógico, cableado, centralita manual</td>
                <td>Teléfono de baquelita (1937)</td>
                <td>EE.UU. / Reino Unido</td>
                <td>La comunicación a distancia en tiempo real</td>
              </tr>
              <tr>
                <td><strong>Expansión Universal (1945–1980)</strong></td>
                <td>Rotatorio, discado directo, internacional</td>
                <td>Princess Phone Bell (1959)</td>
                <td>EE.UU. / Europa</td>
                <td>El teléfono entra en cada hogar</td>
              </tr>
              <tr>
                <td><strong>Móvil 1G (1980–1990)</strong></td>
                <td>Analógico celular (AMPS, TACS, NMT)</td>
                <td>Motorola DynaTAC 8000X</td>
                <td>EE.UU. / Países Nórdicos</td>
                <td>El teléfono se independiza del lugar</td>
              </tr>
              <tr>
                <td><strong>GSM / SMS (1990–2007)</strong></td>
                <td>Digital 2G, SMS, roaming europeo</td>
                <td>Nokia 3210 (1999)</td>
                <td>Finlandia / Europa</td>
                <td>Masificación global, SMS como escritura</td>
              </tr>
              <tr>
                <td><strong>Smartphone (2007–2018)</strong></td>
                <td>Touchscreen, apps, 3G/4G</td>
                <td>iPhone (2007) / Samsung Galaxy</td>
                <td>EE.UU. / Corea del Sur</td>
                <td>El teléfono se convierte en ordenador</td>
              </tr>
              <tr>
                <td><strong>5G / IA (2018–hoy)</strong></td>
                <td>5G, eSIM, IA on-device, NPU</td>
                <td>iPhone 16 Pro / Galaxy S24</td>
                <td>Corea del Sur / China / EE.UU.</td>
                <td>El teléfono se convierte en agente inteligente</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto del teléfono</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💰</span>
            <div>
              <strong>Impacto económico</strong>
              <p>El teléfono creó sectores industriales enteros: telecomunicaciones, servicios de atención al cliente, publicidad móvil y la economía de las apps (más de 400.000 millones de euros anuales en 2024). WhatsApp eliminó el mercado de SMS internacionales (antes a 0,15€/mensaje), destruyendo y recreando valor al mismo tiempo. La app economy es el mayor mercado minorista digital de la historia.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Impacto social</strong>
              <p>El teléfono móvil ha llegado a más personas que el agua corriente: 8.500 millones de líneas en 2024, más que la población mundial. En países en vías de desarrollo, el móvil ha saltado la infraestructura fija y habilitado banca móvil (M-Pesa en Kenia), educación y sanidad digital. El teléfono ha redefinido las relaciones familiares, las amistades y la forma de buscar pareja.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">📸</span>
            <div>
              <strong>Impacto cultural</strong>
              <p>El teléfono con cámara democratizó la fotografía: se hacen más de 1,5 billones de fotos al día en el mundo (2024), la mayoría con smartphones. La selfie, el meme, el vídeo vertical y el stories son formatos culturales nacidos del móvil. TikTok, Instagram y YouTube han transformado el entretenimiento, la política y la identidad personal a través del teléfono.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏥</span>
            <div>
              <strong>Impacto en la salud</strong>
              <p>El teléfono ha habilitado la telemedicina, los registros médicos digitales y la monitorización de salud en tiempo real (Apple Watch, glucómetros conectados). Durante el COVID-19, las videollamadas mantuvieron la salud mental de millones de personas aisladas. Sin embargo, el uso compulsivo del smartphone está asociado a ansiedad y depresión en adolescentes, un riesgo que la sociedad está empezando a gestionar.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre la historia del teléfono</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Realmente inventó Bell el teléfono o lo robó?</strong>
            <p>Alexander Graham Bell obtuvo la patente 174.465 el 7 de marzo de 1876, horas antes que Elisha Gray presentara una "caveat" (notificación de invención en desarrollo) para un dispositivo similar. Los tribunales, tras más de 600 disputas legales, ratificaron la patente de Bell. Sin embargo, hay pruebas circunstanciales de que el inspector de la oficina de patentes pudo haber compartido información con Bell. Antonio Meucci (italiano-americano) había demostrado un dispositivo fonador en 1860 pero no pudo pagar los 10 dólares de la renovación de su caveat en 1874. En 2002, el Congreso de EE.UU. aprobó una resolución reconociendo a Meucci como inventor del teléfono.</p>
            <span className={styles.faqTip}>La primera llamada de Bell ("Mr. Watson, come here") no fue programada: llamó a Watson porque acababa de derramar ácido de batería sobre su ropa y necesitaba ayuda urgente.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué Nokia perdió ante el iPhone si tenía mejores especificaciones?</strong>
            <p>El Nokia N95 de 2007 tenía GPS, cámara de 5 megapíxeles, WiFi y reproducción de vídeo. El iPhone original no tenía ninguna de esas características. Sin embargo, el iPhone ganó porque revolucionó la interfaz: pantalla táctil sin teclado físico, sistema operativo intuitivo y el App Store (2008) que convirtió el teléfono en plataforma. Nokia pensaba en teléfonos como hardware; Apple pensaba en el teléfono como software. La lección: el producto no gana quien tiene más especificaciones, sino quien tiene la interfaz que el usuario prefiere.</p>
            <span className={styles.faqTip}>En 2008, el CEO de Nokia calificó el iPhone de "nicho". En 2013, Nokia vendió su división de móviles a Microsoft por 5.400 millones de euros. Microsoft la cerró en 2016.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuántas líneas móviles hay en España y cómo evolucionó?</strong>
            <p>España tiene más de 56 millones de líneas móviles activas (2024) para 47 millones de habitantes: más de una línea por persona. El crecimiento fue explosivo: 1 millón en 1995, 13 millones en 2000, 50 millones en 2010. Los operadores principales son Movistar (Telefónica), Orange, Vodafone y MásMóvil (que absorbió Yoigo). España fue pionera en la liberalización del mercado de telecomunicaciones en los 90, lo que aceleró la competencia y bajó los precios.</p>
            <span className={styles.faqTip}>España tiene una de las redes de fibra óptica más extensas de Europa: más del 90% de los hogares con cobertura de fibra en 2024, lo que facilita la convergencia fijo-móvil.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la eSIM y reemplazará a la tarjeta SIM física?</strong>
            <p>La eSIM (embedded SIM) es un chip soldado directamente en el dispositivo, sin tarjeta física extraíble. Permite cambiar de operadora digitalmente, tener múltiples líneas en el mismo dispositivo y comprar datos locales al viajar sin cambiar tarjeta. Apple introdujo la eSIM en 2018 y en EE.UU. el iPhone 14 eliminó la ranura SIM física completamente. En España y Europa, todos los operadores ofrecen eSIM en 2024. La SIM física tiene los días contados: se espera su desaparición entre 2027 y 2030 en la mayoría de mercados.</p>
            <span className={styles.faqTip}>La eSIM facilita la vida del viajero: en lugar de buscar un local de telefonía en el aeropuerto, puedes activar un plan de datos local en 2 minutos desde la app de configuración del iPhone.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué diferencia hay entre 4G y 5G en la práctica cotidiana?</strong>
            <p>El 5G teórico ofrece hasta 20 Gbps (vs 1 Gbps del 4G) y latencia de 1ms (vs 50ms del 4G). En la práctica cotidiana de 2024, la diferencia para el usuario individual es menor de lo esperado: las apps de consumo (streaming, redes sociales) funcionan perfectamente con 4G. La diferencia real del 5G llega en tres áreas: ciudades muy congestionadas (donde el 5G descarga la red 4G), IoT masivo (miles de sensores simultáneos) y aplicaciones industriales (cirugía remota, fábricas autónomas). Para el usuario medio, el 5G es una mejora marginal; para la industria, es transformador.</p>
            <span className={styles.faqTip}>El mayor beneficio del 5G para el usuario medio no es la velocidad sino la latencia baja: juegos en la nube, videollamadas sin retraso y coches autónomos requieren ese 1ms de latencia que el 4G no puede garantizar.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo elegir el teléfono adecuado en 2025</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Define tu presupuesto y el uso principal</strong>
              <p>El mercado español de smartphones se divide en tres franjas: gama baja (menos de 200€, para llamadas y apps básicas), gama media (200-500€, relación calidad-precio óptima) y gama alta (más de 500€, cámara profesional y rendimiento máximo). El 80% de los usuarios no necesita gama alta. Define si priorizas cámara, batería, pantalla o rendimiento antes de buscar modelos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Elige el ecosistema: iOS (Apple) o Android</strong>
              <p>iOS (iPhone) ofrece integración perfecta con Mac, iPad y Apple Watch, actualizaciones durante 6+ años y privacidad avanzada. Android ofrece mayor variedad de precios, más personalización y mejor integración con Google. El factor más importante: si tienes familia con iPhones, el ecosistema Apple facilita mucho la comunicación (iMessage, AirDrop, Compartir fotos). Si ya tienes Android, cambiar a iOS requiere exportar contactos, fotos y apps.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Verifica la cobertura 5G de tu operadora en tu zona</strong>
              <p>Antes de pagar extra por un teléfono 5G, comprueba en la web de tu operadora si hay cobertura 5G real en tu barrio y en tu lugar de trabajo. En 2024, la cobertura 5G en España llega al 80% de la población, pero en zonas rurales el 4G sigue siendo la norma. Si no hay 5G en tu zona habitual, el extra de coste por un teléfono 5G no se justifica a corto plazo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Comprueba años de actualizaciones de seguridad garantizados</strong>
              <p>Apple garantiza actualizaciones durante al menos 5-6 años (el iPhone 12 de 2020 recibe iOS 18 en 2024). Google garantiza 7 años para los Pixel. Samsung garantiza 4 años de actualizaciones de SO y 5 de seguridad para sus modelos Galaxy S y A. Los fabricantes de gama baja suelen garantizar solo 2 años. Un teléfono sin actualizaciones de seguridad es un riesgo en ciberseguridad: considera este factor como criterio de compra tan importante como la cámara.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Evalúa la duración de batería en pruebas reales, no en especificaciones</strong>
              <p>Las especificaciones de batería (mAh) no reflejan la duración real: un teléfono con pantalla de 120Hz consume mucho más que uno de 60Hz con la misma batería. Consulta reviews especializadas (GSMArena, Xataka) que hacen pruebas estandarizadas de batería. En general, baterías de 4.500-5.000 mAh con gestión eficiente garantizan un día completo de uso intensivo. Verifica también si la batería es reemplazable (cada vez más inusual) o si el fabricante tiene buen servicio técnico.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la historia del teléfono</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📞</span>
            <p>El teléfono es el único invento que lleva 150 años siendo completamente indispensable y al mismo tiempo transformándose radicalmente. De la llamada analógica de Bell al agente de IA de Apple Intelligence: mismo concepto, mundo diferente. Ningún otro dispositivo ha sobrevivido tantas revoluciones tecnológicas manteniendo su esencia.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌐</span>
            <p>El teléfono móvil ha llegado antes que la electricidad o el agua potable a muchas regiones del mundo. En África subsahariana, el móvil ha creado mercados financieros, sanitarios y educativos donde no había infraestructura previa. La tecnología más democrática de la historia no fue internet: fue el teléfono móvil de gama baja a 30€.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <p>Cada revolución telefónica destruyó industrias existentes y creó otras nuevas: el SMS mató al telegrama; el móvil mató a la cabina pública; WhatsApp mató al SMS de pago; las cámaras de móvil hundieron a Kodak y Fujifilm. En cada transición, las empresas que no se adaptaron desaparecieron (Nokia, Kodak, Blockbuster). La próxima en transformarse es la propia llamada de voz: la IA ya puede hacer llamadas telefónicas por nosotros.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔒</span>
            <p>La privacidad es el desafío no resuelto del teléfono. El dispositivo que más sabe de nosotros (ubicación 24/7, contactos, conversaciones, hábitos de salud, finanzas) también es el que más datos comparte con empresas de publicidad. El RGPD europeo y Apple Intelligence (procesado on-device) son respuestas a esta tensión. En 2025, la privacidad se está convirtiendo en diferenciador competitivo entre ecosistemas.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox OBLIGATORIO */}
        <div className={styles.warningBox}>
          <strong>Aviso sobre fechas y proyecciones tecnológicas</strong>
          <ul>
            <li>Los datos sobre <strong>adopción de tecnologías futuras</strong> (IA on-device, 6G, plegables) son proyecciones basadas en tendencias actuales; la velocidad real de adopción puede variar significativamente.</li>
            <li>Las <strong>especificaciones técnicas</strong> de dispositivos mencionados corresponden a sus versiones de lanzamiento; verificar especificaciones actuales en webs oficiales antes de cualquier decisión de compra.</li>
            <li>Los <strong>datos de cobertura 5G</strong> en España evolucionan constantemente; consultar la web del regulador (CNMC) o de los operadores para información actualizada sobre cobertura en tu zona.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-telefono')} />
      <ShareCard appName="visualizador-historia-telefono" />
      <Footer appName="visualizador-historia-telefono" />
    </div>
  );
}
