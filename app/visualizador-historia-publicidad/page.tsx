'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaPublicidad.module.css';
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

type CategoriaPublicidad =
  | 'imprenta'
  | 'prensa'
  | 'carteles'
  | 'radio'
  | 'television'
  | 'creativa'
  | 'digital'
  | 'social'
  | 'programatica'
  | 'ia';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoPublicidad {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  ejemplo: string;
  impacto: string;
  datos: string;
  categoria: CategoriaPublicidad;
}

interface EraPublicidad {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const AÑO_MIN = 1450;
const AÑO_MAX = 2025;

const PERIODOS: PeriodoPublicidad[] = [
  {
    id: 1,
    periodo: '1450–1700',
    anio: 1450,
    anioFin: 1700,
    titulo: 'La Imprenta y los Primeros Anuncios',
    descripcion: 'Gutenberg revoluciona la comunicación con la imprenta de tipos móviles. Surgen hojas volantes tipografiadas, pregoneros con textos impresos y los primeros anuncios parroquiales pegados en las puertas de las iglesias.',
    innovacion: 'Imprenta de tipos móviles (Gutenberg, 1450)',
    ejemplo: 'Hojas volantes anunciando libros religiosos y mercancías en ferias europeas',
    impacto: 'Por primera vez la comunicación persuasiva puede reproducirse a escala. La publicidad como fenómeno de masas se vuelve tecnológicamente posible.',
    datos: 'En 1477 William Caxton imprime el primer anuncio en inglés para vender libros de plegarias.',
    categoria: 'imprenta',
  },
  {
    id: 2,
    periodo: '1700–1840',
    anio: 1700,
    anioFin: 1840,
    titulo: 'Prensa y Anuncios Clasificados',
    descripcion: 'Benjamin Franklin incluye anuncios comerciales en la Pennsylvania Gazette (1729). En Londres surge la primera agencia de anuncios conocida (1786). Los periódicos se convierten en el primer medio publicitario de masas.',
    innovacion: 'Primera agencia de publicidad (Londres, 1786)',
    ejemplo: 'Pennsylvania Gazette de Benjamin Franklin con anuncios de tabaco, tierras y esclavos',
    impacto: 'Los anuncios financian la prensa, creando el modelo publicitario que sostendrá medios durante 250 años. Nacen los clasificados como formato.',
    datos: 'En 1800 los periódicos ingleses ingresaban ya más por publicidad que por ventas de ejemplares.',
    categoria: 'prensa',
  },
  {
    id: 3,
    periodo: '1840–1890',
    anio: 1840,
    anioFin: 1890,
    titulo: 'Carteles y Litografía',
    descripcion: 'La cromolitografía permite imprimir carteles en color a gran escala. Jules Chéret y Toulouse-Lautrec elevan el cartel publicitario a obra de arte. Los espacios urbanos se llenan de imágenes llamativas para el Moulin Rouge, jabones y licores.',
    innovacion: 'Cromolitografía en color para carteles de gran formato',
    ejemplo: "Carteles de Toulouse-Lautrec para el Moulin Rouge (1891) y los jabones Savon Bébé",
    impacto: 'La imagen supera al texto como vehículo publicitario. Nace la identidad visual de marca y el diseño gráfico publicitario como disciplina.',
    datos: 'Jules Chéret diseñó más de 1.000 carteles entre 1866 y 1900, siendo considerado el padre del cartel moderno.',
    categoria: 'carteles',
  },
  {
    id: 4,
    periodo: '1890–1920',
    anio: 1890,
    anioFin: 1920,
    titulo: 'Era de las Marcas Nacionales',
    descripcion: 'Coca-Cola, Kodak, Lever y otras marcas invierten en publicidad nacional coordinada. J. Walter Thompson (fundada en 1878) se convierte en la primera gran agencia moderna. Nacen el eslogan, el jingle y los personajes de marca.',
    innovacion: 'Publicidad nacional coordinada y las primeras grandes agencias modernas',
    ejemplo: 'Campaña "You press the button, we do the rest" de Kodak (1888). Slogan Coca-Cola desde 1886.',
    impacto: 'Las marcas superan al producto como valor. Los consumidores compran una identidad, no solo una mercancía. Nace el branding moderno.',
    datos: 'En 1914 la inversión en publicidad en EE.UU. superó los 600 millones de dólares, equivalente a más de 16.000 millones actuales.',
    categoria: 'prensa',
  },
  {
    id: 5,
    periodo: '1920–1940',
    anio: 1920,
    anioFin: 1940,
    titulo: 'La Radio Transforma la Publicidad',
    descripcion: 'La radio comercial irrumpe en los hogares. Los jabones financian seriales dramáticos (soap operas). Edward Bernays, sobrino de Freud, aplica la psicología de masas a la propaganda y la publicidad, creando las relaciones públicas modernas.',
    innovacion: 'Radio comercial y las primeras soap operas patrocinadas',
    ejemplo: 'Colgate-Palmolive patrocina "Ma Perkins" (1933), el soap opera más longevo de la historia de la radio',
    impacto: 'La publicidad llega al hogar por primera vez sin filtros. Bernays demuestra que se puede moldear la opinión pública a escala nacional. Nacen las relaciones públicas.',
    datos: 'En 1940 el 83% de los hogares estadounidenses tenía radio. Los ingresos publicitarios superaron los 200 millones de dólares anuales.',
    categoria: 'radio',
  },
  {
    id: 6,
    periodo: '1940–1960',
    anio: 1940,
    anioFin: 1960,
    titulo: 'La Televisión y el USP',
    descripcion: 'La televisión comercial llega a los hogares tras la Segunda Guerra Mundial. Rosser Reeves acuña la Unique Selling Proposition (USP): cada anuncio debe hacer una promesa única y sostenida. La publicidad en blanco y negro domina los primeros años.',
    innovacion: 'Televisión comercial y el concepto USP (Unique Selling Proposition)',
    ejemplo: 'Anuncio "M&M\'s se derriten en tu boca, no en tu mano" — USP puro formulado por Reeves',
    impacto: 'La imagen en movimiento con audio crea el formato publicitario más poderoso del siglo XX. El spot de 30 segundos se convierte en la unidad básica de comunicación de marca.',
    datos: 'En 1960, el 88% de los hogares norteamericanos tenía televisión. Los spots del Super Bowl comenzaron a costar 40.000 dólares por 30 segundos.',
    categoria: 'television',
  },
  {
    id: 7,
    periodo: '1960–1975',
    anio: 1960,
    anioFin: 1975,
    titulo: 'La Revolución Creativa (Mad Men)',
    descripcion: 'Bill Bernbach y la agencia DDB lanzan "Think Small" para el VW Escarabajo (1959), rompiendo todas las convenciones. David Ogilvy sistematiza las grandes ideas. La creatividad supera a la repetición como palanca publicitaria. Madison Avenue vive su edad de oro.',
    innovacion: 'Creatividad sobre repetición: el concepto como motor publicitario',
    ejemplo: '"Think Small" de VW (1959) y "We\'re number two, we try harder" de Avis (DDB, 1963)',
    impacto: 'La publicidad se convierte en cultura popular. Los anuncios se discuten, se citan, se recuerdan. Nace el concepto de idea creativa como diferenciador de agencia.',
    datos: 'El anuncio "Think Small" de VW es considerado el mejor anuncio del siglo XX por Advertising Age. La agencia DDB pasó de 0 a 270 M$ en facturación en una década.',
    categoria: 'creativa',
  },
  {
    id: 8,
    periodo: '1975–1990',
    anio: 1975,
    anioFin: 1990,
    titulo: 'Publicidad Posmoderna',
    descripcion: 'El anuncio "1984" de Apple dirigido por Ridley Scott (Super Bowl 1984) redefine el concepto de evento publicitario. MTV lanza la era del videoclip. Nike crea "Just Do It" (1988). La globalización de marcas como Coca-Cola y McDonald\'s establece la publicidad transnacional.',
    innovacion: 'El anuncio como evento cultural y la publicidad globalizada',
    ejemplo: '"1984" de Apple (Ridley Scott, Super Bowl 1984) y "Just Do It" de Nike (1988)',
    impacto: 'La publicidad adopta el lenguaje del cine y del arte. Los grandes anuncios se convierten en hitos culturales que trascienden al producto. La inversión publicitaria se globaliza.',
    datos: 'El anuncio "1984" de Apple costó 900.000 dólares de producción y generó 150 millones en ventas del Mac en 100 días. Solo se emitió una vez en televisión.',
    categoria: 'creativa',
  },
  {
    id: 9,
    periodo: '1990–2000',
    anio: 1990,
    anioFin: 2000,
    titulo: 'Publicidad Digital Temprana',
    descripcion: 'El primer banner publicitario aparece en HotWired en 1994 con un CTR del 44% (hoy es del 0,1%). Llega el spam de email masivo. Las empresas crean sus primeras webs corporativas. Yahoo y AOL desarrollan los primeros modelos de publicidad online.',
    innovacion: 'Primer banner publicitario (HotWired, 1994) y publicidad online',
    ejemplo: 'Banner de AT&T en HotWired.com: "Have you ever clicked your mouse right here? You will." (1994)',
    impacto: 'Nace un nuevo modelo donde el usuario puede interactuar con el anuncio y la marca puede medir resultados en tiempo real. La publicidad se hace rastreable por primera vez.',
    datos: 'El primer banner tuvo un CTR del 44%. Hoy el CTR promedio de display es del 0,05%. La inversión en publicidad online en EE.UU. fue de 907 M$ en 1996 y creció a 4.600 M$ en 2000.',
    categoria: 'digital',
  },
  {
    id: 10,
    periodo: '2000–2008',
    anio: 2000,
    anioFin: 2008,
    titulo: 'Buscadores y SEM',
    descripcion: 'Google lanza AdWords en 2000, revolucionando la publicidad con el modelo de coste por clic y la relevancia contextual. El SEO se convierte en disciplina profesional. El behavioral targeting permite mostrar anuncios según el historial de navegación.',
    innovacion: 'Google AdWords (2000) y el modelo de coste por clic contextual',
    ejemplo: 'Google AdWords permite a cualquier PYME competir con grandes marcas por búsquedas relevantes desde 0,01€ por clic',
    impacto: 'La publicidad se democratiza y se mide con precisión quirúrgica. Las PYMES pueden competir globalmente. Google genera el modelo de negocio más rentable de la historia: publicidad basada en intención de compra.',
    datos: 'En 2007 Google ingresó 16.600 M$ solo en publicidad. El 99% de sus ingresos provenían de AdWords. La búsqueda se convierte en el momento publicitario de mayor valor.',
    categoria: 'digital',
  },
  {
    id: 11,
    periodo: '2008–2015',
    anio: 2008,
    anioFin: 2015,
    titulo: 'Redes Sociales e Influencers',
    descripcion: 'Facebook Ads llega en 2007 con segmentación por intereses y datos sociales. Twitter, Instagram y YouTube crean nuevos formatos. Los primeros influencers de YouTube generan millones de visualizaciones. El viral marketing se convierte en el santo grial.',
    innovacion: 'Facebook Ads y la segmentación sociodemográfica precisa',
    ejemplo: 'Old Spice "The Man Your Man Could Smell Like" (2010): viral orgánico que triplicó ventas en 3 meses',
    impacto: 'El usuario pasa de receptor pasivo a potencial amplificador. Las marcas buscan conversación, no solo alcance. El marketing de contenidos y la autenticidad se vuelven imperatives estratégicos.',
    datos: 'Facebook alcanzó 1.000 millones de usuarios en 2012 e ingresos publicitarios de 4.280 M$ ese año. Instagram fue comprada por 1.000 M$ en 2012 y hoy genera más de 30.000 M$ anuales.',
    categoria: 'social',
  },
  {
    id: 12,
    periodo: '2015–2019',
    anio: 2015,
    anioFin: 2019,
    titulo: 'Programática y Big Data',
    descripcion: 'La compra programática automatiza la adquisición de espacios publicitarios en tiempo real mediante subasta (RTB). El retargeting persigue al usuario por toda la web. El GDPR (2018) limita el uso de datos. Los adblockers superan los 600 millones de instalaciones.',
    innovacion: 'Compra programática (Real Time Bidding) y retargeting automatizado',
    ejemplo: 'Un usuario busca vuelos a París y durante dos semanas ve anuncios de ese vuelo en todos los sitios que visita',
    impacto: 'La publicidad se vuelve invisible, omnipresente y perturbadora. El 47% de los usuarios instala bloqueadores. El GDPR redibuja las reglas del uso de datos personales en Europa.',
    datos: 'En 2019 el 65% de toda la publicidad display en EE.UU. se compraba de forma programática. Los adblockers costaron a la industria 42.000 M$ ese año.',
    categoria: 'programatica',
  },
  {
    id: 13,
    periodo: '2019–2023',
    anio: 2019,
    anioFin: 2023,
    titulo: 'Microsegmentación e IA',
    descripcion: 'TikTok irrumpe con un algoritmo que aprende los gustos del usuario en minutos. La búsqueda por voz (Alexa, Siri) abre nuevos formatos. El native advertising imita contenido editorial. Los primeros deepfakes publicitarios generan controversia.',
    innovacion: 'Algoritmo TikTok y la microsegmentación por comportamiento en tiempo real',
    ejemplo: 'TikTok For Business permite segmentar por "hashtag challenge" y comportamientos de los últimos 7 días',
    impacto: 'El algoritmo supera al creativo humano en la optimización del mensaje. La publicidad se vuelve radicalmente personalizada e invisible como publicidad. La línea entre contenido y anuncio desaparece.',
    datos: 'TikTok alcanzó 1.000 millones de usuarios en 2021 e ingresos publicitarios de 11.640 M$ en 2023. El 40% de la Gen Z usa TikTok como buscador.',
    categoria: 'ia',
  },
  {
    id: 14,
    periodo: '2023–hoy',
    anio: 2023,
    anioFin: 2025,
    titulo: 'IA Generativa y Publicidad Sintética',
    descripcion: 'DALL-E, Midjourney y Sora generan imágenes y vídeos publicitarios en segundos. Coca-Cola lanza la primera campaña global generada con IA (2023). Los influencers sintéticos acumulan millones de seguidores. La personalización llega al nivel de anuncio individual por usuario.',
    innovacion: 'IA generativa para contenido publicitario (DALL-E, Midjourney, Sora)',
    ejemplo: '"Masterpiece" de Coca-Cola (2023): anuncio generado completamente con IA que reimagina obras del arte clásico',
    impacto: 'El coste de producción publicitaria cae un 90%. Las agencias creativas se reinventan. El influencer sintético elimina los riesgos del influencer humano. La personalización extrema plantea dudas éticas sobre la manipulación.',
    datos: 'El 65% de los ejecutivos de marketing declaró usar IA generativa en 2024. El mercado de IA en publicidad alcanzará los 107.000 M$ en 2028 según Statista.',
    categoria: 'ia',
  },
];

const COLORES_CATEGORIA: Record<CategoriaPublicidad, string> = {
  imprenta: '#8B4513',
  prensa: '#D2691E',
  carteles: '#FF6347',
  radio: '#4169E1',
  television: '#9400D3',
  creativa: '#FF8C00',
  digital: '#2E86AB',
  social: '#48A9A6',
  programatica: '#FF1493',
  ia: '#7B68EE',
};

const ETIQUETAS_CATEGORIA: Record<CategoriaPublicidad, string> = {
  imprenta: 'Imprenta',
  prensa: 'Prensa',
  carteles: 'Carteles',
  radio: 'Radio',
  television: 'Televisión',
  creativa: 'Era Creativa',
  digital: 'Digital',
  social: 'Redes Sociales',
  programatica: 'Programática',
  ia: 'IA',
};

const ERAS: EraPublicidad[] = [
  {
    nombre: 'Era Impresa',
    desde: 1450,
    hasta: 1899,
    icono: '📜',
    descripcion: 'Imprenta, carteles, prensa escrita',
  },
  {
    nombre: 'Era Broadcast',
    desde: 1900,
    hasta: 1959,
    icono: '📻',
    descripcion: 'Radio y televisión temprana',
  },
  {
    nombre: 'Era Creativa',
    desde: 1960,
    hasta: 1989,
    icono: '🎨',
    descripcion: 'Revolución creativa, cultura popular',
  },
  {
    nombre: 'Era Digital',
    desde: 1990,
    hasta: 2007,
    icono: '💻',
    descripcion: 'Internet y primeros formatos digitales',
  },
  {
    nombre: 'Era Social',
    desde: 2008,
    hasta: 2018,
    icono: '📱',
    descripcion: 'Redes sociales, datos y microsegmentación',
  },
  {
    nombre: 'Era IA',
    desde: 2019,
    hasta: 2025,
    icono: '🤖',
    descripcion: 'Automatización, generación y personalización con IA',
  },
];

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const SVG_ANCHO = PERIODOS.length * 120 + 100;
const MARGEN_IZQ = 50;
const MARGEN_DER = 30;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo SVG
// ─────────────────────────────────────────────

function TabTimeline({ onSeleccionarPeriodo }: { onSeleccionarPeriodo: (id: number) => void }) {
  const [seleccionadoId, setSeleccionadoId] = useState<number | null>(null);

  // Distribuir períodos en filas para evitar solapamiento
  const filas: PeriodoPublicidad[][] = [[], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anio - b.anio);

  for (const p of ordenados) {
    let asignado = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimo = filas[f][filas[f].length - 1];
      if (!ultimo || anioAX(ultimo.anioFin) + 6 <= anioAX(p.anio)) {
        filas[f].push(p);
        asignado = true;
        break;
      }
    }
    if (!asignado) filas[0].push(p);
  }

  const FILA_ALTO = 34;
  const FILA_OFFSET_Y = 20;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  // Marcadores de siglos
  const siglos: number[] = [];
  for (let s = 1500; s <= 2000; s += 100) siglos.push(s);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles en la pestaña &quot;Período en Detalle&quot;.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la publicidad"
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

          {/* Marcadores de siglos */}
          {siglos.map((s) => (
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
              <text x={anioAX(s)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">
                {s}
              </text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((p) => {
              const x = anioAX(p.anio);
              const w = Math.max(anioAX(p.anioFin) - x, 12);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSel = seleccionadoId === p.id;
              const color = COLORES_CATEGORIA[p.categoria];

              return (
                <g
                  key={p.id}
                  onClick={() => {
                    setSeleccionadoId(esSel ? null : p.id);
                    onSeleccionarPeriodo(p.id);
                  }}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label={`Período: ${p.titulo}`}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={color}
                    opacity={esSel ? 1 : 0.8}
                    stroke={esSel ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 55 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {p.periodo}
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
        {(Object.keys(ETIQUETAS_CATEGORIA) as CategoriaPublicidad[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle({ periodoSeleccionadoId }: { periodoSeleccionadoId: number }) {
  const [indice, setIndice] = useState(() => {
    const idx = PERIODOS.findIndex((p) => p.id === periodoSeleccionadoId);
    return idx >= 0 ? idx : 0;
  });

  // Sincronizar con selección externa
  const periodoActual = PERIODOS[indice];
  const color = COLORES_CATEGORIA[periodoActual.categoria];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.periodoSelector}>
        {PERIODOS.map((p, i) => (
          <button
            key={p.id}
            className={`${styles.periodoBtn} ${i === indice ? styles.periodoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: COLORES_CATEGORIA[p.categoria], borderColor: COLORES_CATEGORIA[p.categoria] } : {}}
          >
            {p.periodo}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: color }}>
          <span className={styles.detallePeriodoBadge}>{periodoActual.periodo}</span>
          <h3>{periodoActual.titulo}</h3>
          <span className={styles.detalleCategoriaBadge}>{ETIQUETAS_CATEGORIA[periodoActual.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <p className={styles.detalleDescripcion}>{periodoActual.descripcion}</p>

          <div className={styles.detalleGrid}>
            <div className={styles.detalleBloque}>
              <span className={styles.detalleLabel}>Innovación clave</span>
              <p>{periodoActual.innovacion}</p>
            </div>
            <div className={styles.detalleBloque}>
              <span className={styles.detalleLabel}>Ejemplo histórico</span>
              <p>{periodoActual.ejemplo}</p>
            </div>
          </div>

          <div className={styles.detalleBloque}>
            <span className={styles.detalleLabel}>Impacto</span>
            <p>{periodoActual.impacto}</p>
          </div>

          <div className={styles.datosDestacados}>
            <span className={styles.detalleLabel}>Dato destacado</span>
            <p>{periodoActual.datos}</p>
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
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaPublicidad | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((p) => {
      const coincideCategoria = filtroCategoria === 'todos' || p.categoria === filtroCategoria;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        !termino ||
        p.titulo.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.innovacion.toLowerCase().includes(termino);
      return coincideCategoria && coincideBusqueda;
    });
  }, [filtroCategoria, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${filtroCategoria === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setFiltroCategoria('todos')}
        >
          Todos
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as CategoriaPublicidad[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${filtroCategoria === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setFiltroCategoria(cat)}
            style={filtroCategoria === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat], color: '#fff' } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período, innovación o descripción..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período publicitario"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Era</th>
              <th>Categoría</th>
              <th>Innovación clave</th>
              <th>Impacto</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((p, i) => (
              <tr key={p.id} style={i % 2 === 0 ? { background: `${COLORES_CATEGORIA[p.categoria]}12` } : {}}>
                <td>
                  <strong style={{ color: COLORES_CATEGORIA[p.categoria] }}>{p.titulo}</strong>
                </td>
                <td>{p.periodo}</td>
                <td>
                  <span
                    className={styles.badgeCategoria}
                    style={{
                      background: `${COLORES_CATEGORIA[p.categoria]}22`,
                      color: COLORES_CATEGORIA[p.categoria],
                    }}
                  >
                    {ETIQUETAS_CATEGORIA[p.categoria]}
                  </span>
                </td>
                <td>{p.innovacion}</td>
                <td style={{ fontSize: '0.82rem' }}>{p.impacto.substring(0, 100)}…</td>
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
// Tab 4: Contexto Histórico — eras
// ─────────────────────────────────────────────

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos publicitarios organizados por eras históricas con sus medios, innovaciones y contexto cultural.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anio < era.hasta && p.anioFin > era.desde
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraAnios}>
                    {era.desde}–{era.hasta === 2025 ? 'hoy' : era.hasta}
                  </span>
                </div>
              </div>

              <p className={styles.eraDescripcion}>{era.descripcion}</p>

              {periodosEra.length > 0 && (
                <div className={styles.eraPeriodos}>
                  {periodosEra.map((p) => (
                    <span
                      key={p.id}
                      className={styles.eraPeriodoBadge}
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

export default function VisualizadorHistoriaPublicidad() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');
  const [periodoSeleccionadoId, setPeriodoSeleccionadoId] = useState<number>(1);

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Período en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  function handleSeleccionarPeriodo(id: number) {
    setPeriodoSeleccionadoId(id);
    setTabActiva('detalle');
  }

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia de la Publicidad</h1>
        <p className={styles.heroSubtitle}>
          14 períodos desde Gutenberg a la IA generativa — evolución de los medios, las marcas y el arte de persuadir
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
          {tabActiva === 'timeline' && <TabTimeline onSeleccionarPeriodo={handleSeleccionarPeriodo} />}
          {tabActiva === 'detalle' && <TabDetalle periodoSeleccionadoId={periodoSeleccionadoId} />}
          {tabActiva === 'comparativa' && <TabComparativa />}
          {tabActiva === 'contexto' && <TabContexto />}
        </div>
      </main>

      <EducationalSection
        title="Historia de la publicidad: claves y análisis"
        subtitle="Cómo la publicidad ha moldeado la economía, la cultura y la psicología del consumidor a lo largo de los siglos"
      >
        {/* Sección 1 — Tabla comparativa */}
        <h3>Comparativa de eras publicitarias</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Medio principal</th>
                <th>Alcance</th>
                <th>Coste relativo</th>
                <th>Métricas disponibles</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Impresa (1450–1899)</strong></td>
                <td>Prensa, carteles</td>
                <td>Local / Regional</td>
                <td>Bajo</td>
                <td>Tirada estimada, ninguna online</td>
              </tr>
              <tr>
                <td><strong>Broadcast (1900–1959)</strong></td>
                <td>Radio y televisión</td>
                <td>Nacional</td>
                <td>Alto</td>
                <td>Audiencia estimada (rating Nielsen)</td>
              </tr>
              <tr>
                <td><strong>Creativa (1960–1989)</strong></td>
                <td>TV, revistas, exterior</td>
                <td>Nacional / Global</td>
                <td>Muy alto</td>
                <td>Recuerdo de marca, encuestas</td>
              </tr>
              <tr>
                <td><strong>Digital (1990–2007)</strong></td>
                <td>Web, email, buscadores</td>
                <td>Global</td>
                <td>Variable</td>
                <td>CTR, impresiones, coste por clic</td>
              </tr>
              <tr>
                <td><strong>Social/IA (2008–hoy)</strong></td>
                <td>Redes sociales, algoritmos</td>
                <td>Global + microsegmentado</td>
                <td>Muy variable</td>
                <td>ROAS, CPA, engagement, conversión</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto publicitario</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💰</span>
            <div>
              <strong>Impacto económico</strong>
              <p>La publicidad genera entre el 1% y el 2% del PIB en economías avanzadas. En EE.UU. el sector publicitario supera los 300.000 millones de dólares anuales y sostiene industrias enteras como medios, entretenimiento y deporte.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🎭</span>
            <div>
              <strong>Impacto cultural</strong>
              <p>Eslóganes como &quot;Just Do It&quot;, &quot;Think Different&quot; o &quot;I&apos;m Loving It&quot; forman parte del lenguaje cotidiano. La publicidad ha definido estilos de vida, impulsado movimientos sociales y moldeado ideales de belleza y éxito durante generaciones.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🧠</span>
            <div>
              <strong>Impacto psicológico</strong>
              <p>Edward Bernays aplicó el psicoanálisis freudiano a la publicidad masiva en los años 20. Hoy los algoritmos de IA detectan microexpresiones, miden el tiempo de atención y optimizan mensajes para explotar sesgos cognitivos como el de escasez o el de prueba social.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">⚙️</span>
            <div>
              <strong>Impacto tecnológico</strong>
              <p>La publicidad ha financiado el desarrollo de internet, las redes sociales y la IA. Google y Facebook, dos de las mayores empresas tecnológicas del mundo, existen gracias a ingresos publicitarios. Sin publicidad digital, la web gratuita como la conocemos no existiría.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Qué es la publicidad nativa y cómo difiere del contenido editorial?</strong>
            <p>La publicidad nativa adopta el formato y el estilo del medio donde aparece (artículos patrocinados en periódicos, posts de marca en redes sociales). A diferencia del banner o el spot, busca integrarse en el flujo natural de contenido. Legalmente debe identificarse como publicidad, aunque muchos formatos lo hacen de forma poco visible.</p>
            <span className={styles.faqTip}>El REGLAMENTO (UE) 2022/2065 (Digital Services Act) obliga a identificar claramente la publicidad en plataformas digitales de la UE.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuánto gasta una marca grande en publicidad anualmente?</strong>
            <p>Las mayores marcas mundiales invierten cifras astronómicas: Procter &amp; Gamble supera los 8.000 millones de dólares anuales, Amazon los 10.000 millones y Alphabet (Google) más de 6.000 millones solo en marketing corporativo. La regla histórica en bienes de consumo es destinar entre el 5% y el 15% de la facturación a publicidad.</p>
            <span className={styles.faqTip}>En España, la inversión publicitaria total superó los 13.000 millones de euros en 2023, según Infoadex.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre advertising y marketing?</strong>
            <p>El marketing es el proceso completo: investigación de mercado, desarrollo de producto, pricing, distribución y comunicación. La publicidad (advertising) es solo una de las herramientas de comunicación del marketing, junto con las relaciones públicas, el marketing de contenidos, la promoción en punto de venta y las ventas directas.</p>
            <span className={styles.faqTip}>Resumen: toda publicidad es marketing, pero no todo el marketing es publicidad.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué son las cookies publicitarias y por qué el GDPR las limita?</strong>
            <p>Las cookies de terceros permiten rastrear al usuario entre diferentes sitios web para construir un perfil de sus intereses y mostrarle publicidad personalizada (retargeting). El GDPR europeo (2018) exige consentimiento explícito para usarlas. Google anunció su eliminación en Chrome, aunque ha retrasado la fecha varias veces ante la presión del sector.</p>
            <span className={styles.faqTip}>Con la desaparición de las cookies de terceros, la publicidad contextual (basada en el contenido de la página, no en el usuario) experimenta un renacimiento.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es el futuro de la publicidad con la IA generativa?</strong>
            <p>La IA generativa permite crear anuncios personalizados para cada usuario a coste marginal cero, generar miles de variantes creativas para testear y producir vídeos publicitarios sin actores ni rodajes. El reto es la autenticidad: los consumidores valoran cada vez más la conexión humana real frente a la perfección sintética.</p>
            <span className={styles.faqTip}>El mercado de IA en publicidad alcanzará los 107.000 M$ en 2028 según Statista, pero el 61% de los consumidores ya desconfía de los anuncios generados por IA.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía en 5 pasos */}
        <h3>Cómo evaluar si un anuncio es eficaz: 5 criterios profesionales</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Objetivo claro y medible</strong>
              <p>¿El anuncio busca notoriedad (brand awareness), consideración, conversión directa o fidelización? Un buen anuncio tiene un objetivo único y los indicadores de éxito definidos antes del lanzamiento. Sin objetivo claro, no hay forma de medir el éxito.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Audiencia correctamente definida</strong>
              <p>¿El mensaje llega a quien tiene la necesidad, el poder de compra y la disposición a comprar? La segmentación excesiva (microsegmentación extrema) puede aumentar la relevancia pero limitar el alcance. La segmentación escasa desperdicia presupuesto en personas irrelevantes.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Mensaje relevante y diferenciador</strong>
              <p>¿El anuncio comunica un beneficio real para el receptor? ¿Lo diferencia de la competencia? Los mejores anuncios de la historia (Think Small, 1984 de Apple) tienen un insight preciso del consumidor y una idea que nadie más se atrevió a decir antes.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Canal adecuado al momento de compra</strong>
              <p>Un anuncio de búsqueda en Google es ideal cuando el usuario ya tiene intención de compra. Un anuncio de display en redes sociales es mejor para crear notoriedad entre audiencias frías. El canal determina el estado mental del receptor y debe elegirse en consecuencia.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Métricas que conectan inversión con resultado de negocio</strong>
              <p>Las métricas de vanidad (likes, impresiones) no pagan nóminas. Un anuncio eficaz conecta la inversión publicitaria con resultados reales: ventas incrementales, clientes nuevos, reducción del coste de adquisición o aumento del valor del cliente a largo plazo (LTV).</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips de experto + warningBox */}
        <h3>Consejos de experto en historia de la publicidad</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📚</span>
            <p>Lee &quot;Confessions of an Advertising Man&quot; de David Ogilvy. Escrito en 1963, sigue siendo la mejor introducción práctica al oficio publicitario. Sus reglas sobre titulares, imágenes y propuesta de valor siguen vigentes en la era digital.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <p>Los ciclos publicitarios se repiten: cada nuevo medio (radio, TV, internet, redes sociales, IA) primero imita al anterior y luego desarrolla su propio lenguaje. Identifica en qué fase está el medio que estás usando para no quedar obsoleto.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <p>El mejor anuncio es el que el receptor no reconoce como anuncio. El branded content, el marketing de influencers y la publicidad nativa buscan exactamente eso: integrar el mensaje en el entretenimiento o la información que el usuario ya consume voluntariamente.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <p>Los datos no sustituyen a la creatividad: los mejores anuncios de la historia (Think Small, 1984 de Apple, Just Do It) surgieron de insights humanos profundos, no de algoritmos. La IA puede optimizar, pero la idea transformadora sigue siendo humana.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <strong>Advertencia: manipulación y sesgos en la publicidad</strong>
          <ul>
            <li>La publicidad está diseñada para <strong>influir en el comportamiento</strong>, no solo para informar. Reconocer las técnicas de persuasión (escasez artificial, prueba social, reciprocidad, autoridad) te hace un consumidor más crítico y consciente.</li>
            <li>La <strong>publicidad dirigida a menores</strong> tiene regulación específica en España (CNMC) y la UE. Los niños son especialmente vulnerables a los mecanismos de persuasión publicitaria, especialmente en entornos de juegos y redes sociales.</li>
            <li>Los <strong>influencers sintéticos</strong> generados por IA no siempre se identifican como tales. La normativa española obliga a identificar la publicidad explícitamente, pero el cumplimiento en entornos digitales sigue siendo irregular.</li>
            <li>La <strong>microsegmentación política</strong> (microtargeting) usa los mismos mecanismos que la publicidad comercial para influir en el voto. El caso Cambridge Analytica (2016) mostró los riesgos para la democracia de estas técnicas sin regulación.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-publicidad')} />
      <ShareCard appName="visualizador-historia-publicidad" />
      <Footer appName="visualizador-historia-publicidad" />
    </div>
  );
}
