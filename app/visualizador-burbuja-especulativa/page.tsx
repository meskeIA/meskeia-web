'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './BurbujaEspeculativa.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// Fases de Minsky
interface FaseMinsky {
  numero: number;
  icono: string;
  nombre: string;
  resumen: string;
  descripcion: string;
  senales: string[];
  ejemplos: string[];
}

const FASES_MINSKY: FaseMinsky[] = [
  {
    numero: 1,
    icono: '🌱',
    nombre: 'Desplazamiento',
    resumen: 'Un evento genuinamente nuevo crea una oportunidad real',
    descripcion:
      'Un shock externo cambia las expectativas de beneficio en un sector. La tecnología es real, los primeros en entrar tienen razón: hay valor genuino. El dinero fluye hacia la novedad y los precios empiezan a subir de forma justificada.',
    senales: [
      'Narrativa nueva y convincente con base real',
      'Crecimiento real de beneficios en sectores líderes',
      'Interés institucional moderado y selectivo',
      'Cobertura mediática técnica y especializada',
    ],
    ejemplos: [
      'Primera web comercial (1993)',
      'Titulización hipotecaria (1980s)',
      'Bitcoin white paper (2008)',
      'Primer bulbo de tulipán negro en subasta (1630s)',
    ],
  },
  {
    numero: 2,
    icono: '📈',
    nombre: 'Boom',
    resumen: 'El crédito se vuelve fácil, los precios suben sostenidamente',
    descripcion:
      'El bucle de retroalimentación del crédito se activa: el activo sube → vale más como garantía → los bancos prestan más → más compradores → el activo sube más. Los inversores institucionales entran, los analistas suben objetivos de precio y el FOMO empieza a afectar a los profesionales.',
    senales: [
      'Expansión del crédito vinculado al activo',
      'IPOs frecuentes y fusiones y adquisiciones',
      'Fondos de inversión especializados se multiplican',
      'Primeros artículos en prensa generalista',
    ],
    ejemplos: [
      'Nasdaq doblando cada año (1997-1999)',
      'MBS y CDOs como productos mainstream (2004-2006)',
      'Exchanges de cripto proliferando (2016-2017)',
      'Especulación en futuros de tulipanes sin entrega física',
    ],
  },
  {
    numero: 3,
    icono: '🎉',
    nombre: 'Euforia',
    resumen: '"Esta vez es diferente". Inversores inexpertos entran en masa',
    descripcion:
      'Las valoraciones se desconectan de cualquier métrica racional. El taxista, el peluquero y la abuela dan consejos de inversión. Los medios cubren el activo constantemente. Los que advierten de burbuja son tachados de "no entender el cambio". El apalancamiento alcanza niveles extremos.',
    senales: [
      'Cobertura mediática masiva en prensa no especializada',
      'Celebrities y figuras públicas promocionan el activo',
      'Empresas sin beneficios valoradas en miles de millones',
      'Apalancamiento extremo, crédito sin restricciones',
      'Los críticos son ridiculizados o ignorados',
    ],
    ejemplos: [
      'Pets.com, Webvan: empresas sin modelo de negocio en Nasdaq',
      'P/E de 100x normalizado en tech (1999-2000)',
      'NFTs de jpegs simples a millones de dólares (2021)',
      'Bitcoin llegando a $69.000 con cobertura en todos los medios',
    ],
  },
  {
    numero: 4,
    icono: '😰',
    nombre: 'Angustia',
    resumen: 'Los insiders empiezan a vender discretamente',
    descripcion:
      'Los primeros en entrar empiezan a salir. Pequeños shocks que se absorben, pero la confianza vacila. El crédito se endurece ligeramente. Surgen fraudes (siempre hay fraudes en el pico: Bernie Madoff, Enron). Las primeras correcciones del 20%+ se producen y se recuperan, generando falsa confianza.',
    senales: [
      'Volatilidad creciente y volumen errático',
      'Primeras correcciones del 20%+ seguidas de recuperación',
      'Aparición de fraudes y escándalos contables',
      'Reguladores empiezan a pedir más supervisión',
      'Insiders vendiendo discretamente sus posiciones',
    ],
    ejemplos: [
      'Escándalo Enron (2001) como señal del fin dot-com',
      'Bear Stearns cerrando fondos hipotecarios (junio 2007)',
      'FTX, Terra/Luna colapsos antes del crash cripto (2022)',
      'Primeras quiebras de casas de tulipanes (1636)',
    ],
  },
  {
    numero: 5,
    icono: '💥',
    nombre: 'Pánico',
    resumen: 'Venta masiva en cascada, el crédito colapsa',
    descripcion:
      'El detonante llega. Las margin calls fuerzan ventas → más bajada → más margin calls → más ventas. El activo cae un 50-90% en semanas o meses. El crédito se contrae bruscamente (credit crunch). El contagio se extiende a otros activos y a la economía real. Los "genios" del boom desaparecen; quienes advirtieron son alabados.',
    senales: [
      'Volumen de ventas récord, liquidaciones masivas',
      'Quiebras en cascada de instituciones expuestas',
      'Regulación de emergencia, rescates gubernamentales',
      'Caídas del 50-90% desde máximos',
      'Credit crunch: el crédito colapsa para todos',
    ],
    ejemplos: [
      'Nasdaq cae 78% en 2 años (2000-2002)',
      'Lehman Brothers quiebra, crisis bancaria global (sep 2008)',
      'Bitcoin: $69k → $16k en 14 meses (2021-2022)',
      'Contratos de tulipanes sin valor en días (feb 1637)',
    ],
  },
];

// Casos históricos
interface CasoHistorico {
  activo: string;
  periodo: string;
  icono: string;
  descripcion: string;
  detonante: string;
  picoValoracion: string;
  caida: string;
  recuperacion: string;
  color: string;
}

const CASOS_HISTORICOS: CasoHistorico[] = [
  {
    activo: 'Tulipanes Holandeses',
    periodo: '1634–1637',
    icono: '🌷',
    descripcion: 'Primera burbuja especulativa documentada en la historia. Un bulbo de tulipán llegó a costar 10 veces el salario anual de un artesano cualificado. Se creó un mercado de futuros de bulbos sin entrega física, pura especulación en papel.',
    detonante: 'Popularización del tulipán negro como símbolo de estatus entre la burguesía holandesa',
    picoValoracion: '~10 salarios anuales por un bulbo Semper Augustus',
    caida: '~99% en semanas (febrero 1637)',
    recuperacion: 'Nunca recuperó. Mercado de futuros colapsó; bulbos físicos retuvieron valor de jardinería',
    color: '#C084FC',
  },
  {
    activo: 'Ferrocarriles Británicos',
    periodo: '1840–1846',
    icono: '🚂',
    descripcion: 'La tecnología era real y los trenes funcionaban. Sin embargo, el Parlamento aprobó miles de proyectos de vías (muchos fraudulentos), construyendo el triple de infraestructura necesaria. La deuda fue enorme.',
    detonante: 'Éxito real del Liverpool-Manchester Railway (1830) y expectativas de expansión masiva',
    picoValoracion: 'Empresas ferroviarias representaban el 70% del capital de la bolsa de Londres',
    caida: '~85% en acciones entre 1845 y 1850',
    recuperacion: 'El sistema ferroviario real sobrevivió y fue rentable; las acciones tardaron décadas',
    color: '#6B7280',
  },
  {
    activo: 'Dot-com / Nasdaq',
    periodo: '1995–2000',
    icono: '💻',
    descripcion: 'Internet era y es real. Las valoraciones eran ficticias. Empresas sin beneficios ni plan de negocio (Pets.com, Webvan) se valoraban en miles de millones. La "quema de caja" se vendía como métrica de crecimiento.',
    detonante: 'Salida a bolsa de Netscape (1995) y masificación de internet doméstico',
    picoValoracion: 'P/E promedio Nasdaq: 200x. Nasdaq total: x10 en 5 años',
    caida: '78% en 2 años (2000-2002). Muchas empresas: -100%',
    recuperacion: 'Nasdaq tardó ~15 años en superar máximos del 2000 (recuperado en 2015)',
    color: '#2E86AB',
  },
  {
    activo: 'Hipotecas Subprime / Credit',
    periodo: '2003–2008',
    icono: '🏠',
    descripcion: 'Hipotecas NINJA (No Income, No Job, No Assets) empaquetadas en CDOs con rating AAA por las agencias de calificación. El "activo" era deuda con garantía ficticia, securitizada en capas opacas.',
    detonante: 'Tipos de interés en mínimos post-dot-com + desregulación financiera',
    picoValoracion: 'Precio vivienda EEUU +124% entre 1997-2006; mercado hipotecario: $14 billones',
    caida: 'S&P 500: -57%. Precio vivienda EEUU: -33%. Banco tras banco quebrado',
    recuperacion: 'S&P 500: ~5 años. Vivienda EEUU: ~7 años. Europa: mucho más lenta',
    color: '#EF4444',
  },
  {
    activo: 'Cripto / Bitcoin (ciclos)',
    periodo: '2017 y 2020-2021',
    icono: '₿',
    descripcion: 'Múltiples mini-ciclos de Minsky. Cada ciclo sigue el patrón exacto: tecnología real (blockchain) → narrativa convincente → euforia especulativa → colpaso. ICOs (2017), DeFi/NFTs (2021), cada vez con instrumentos más complejos.',
    detonante: '2017: masificación exchanges. 2020: DeFi, institucionales, estímulos pandemia',
    picoValoracion: '2017: $1k→$20k. 2021: $5k→$69k. NFTs individuales: millones por jpeg',
    caida: '2018: -85%. 2022: -77%. NFTs: >90%. Terra/Luna: -100% en días',
    recuperacion: 'Bitcoin se ha recuperado cada ciclo. Muchos altcoins y NFTs: permanentemente en cero',
    color: '#F59E0B',
  },
];

// Sesgos cognitivos
interface SesgoData {
  nombre: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
}

const SESGOS: SesgoData[] = [
  {
    nombre: 'FOMO',
    icono: '😱',
    descripcion: 'Fear of Missing Out. Ver a conocidos ganar dinero crea ansiedad de no estar dentro. Las redes sociales amplifican el efecto: solo se comparten las ganancias, nunca las pérdidas.',
    ejemplo: 'Tu cuñado gana 3x en cripto y tú ves las noticias constantemente. Entras en el peor momento.',
  },
  {
    nombre: 'Efecto manada',
    icono: '🐑',
    descripcion: '"Si tanta gente compra, algo saben." La validación social sustituye al análisis propio. Lo que hace la mayoría se percibe como más seguro y más correcto.',
    ejemplo: 'El fondo de pensiones compra → los gestores privados compran → los minoristas compran.',
  },
  {
    nombre: 'Sesgo de confirmación',
    icono: '🔍',
    descripcion: 'Una vez invertidos, solo buscamos noticias positivas. Las señales de alarma se descartan como "FUD" (Fear, Uncertainty, Doubt), término que los entusiastas usan para desacreditar críticas válidas.',
    ejemplo: 'Ignoras los análisis negativos sobre tu acción favorita y solo sigues a los bulls en Twitter.',
  },
  {
    nombre: 'Anclaje',
    icono: '⚓',
    descripcion: 'El precio de compra ancla la percepción de valor. "Antes costaba €100, ahora €2.000; si cae a €100 tendré que vender." Pero el precio de compra propio no tiene relación con el valor real del activo.',
    ejemplo: 'Compraste a €500; el activo baja a €300. "Ya que estoy hundido, no vendo." Cae a €50.',
  },
  {
    nombre: '"Esta vez es diferente"',
    icono: '🦄',
    descripcion: 'Siempre hay una razón convincente para creer que las leyes económicas no aplican esta vez. Cada burbuja tiene su narrativa única: "internet lo cambia todo", "blockchain es el futuro", "el inmobiliario nunca baja".',
    ejemplo: 'En 2006: "Los precios de la vivienda nunca han bajado de forma sostenida en EEUU". Correcto hasta 2007.',
  },
  {
    nombre: 'Greater Fool Theory',
    icono: '🃏',
    descripcion: 'No importa si el precio es irracional: solo necesito venderlo a alguien más optimista que yo. La estrategia consciente de comprar sobrevalorado esperando encontrar un comprador más "tonto".',
    ejemplo: 'Compro un NFT por €50.000 sabiendo que no vale eso, pero espero venderlo por €200.000.',
  },
];

// Checklist de alerta
interface CheckItem {
  texto: string;
  peso: number;
}

const CHECKLIST_ITEMS: CheckItem[] = [
  { texto: '¿Todo el mundo habla del activo en cenas, taxis y redes sociales?', peso: 2 },
  { texto: '¿Las valoraciones son imposibles de justificar con beneficios futuros razonables?', peso: 2 },
  { texto: '¿Hay IPOs masivas de empresas sin negocio real ni beneficios?', peso: 1 },
  { texto: '¿El crédito para comprar el activo se ha vuelto muy fácil (margen, préstamos colateral)?', peso: 2 },
  { texto: '¿Quienes advierten del riesgo son ridiculizados o etiquetados de "no entenderlo"?', peso: 1 },
];

const TABLA_COMPARATIVA = [
  { activo: 'Tulipanes', periodo: '1634–1637', caida: '~99%', recuperacion: 'Nunca (como activo especulativo)' },
  { activo: 'Ferrocarriles', periodo: '1840–1846', caida: '~85%', recuperacion: '>10 años' },
  { activo: 'Dot-com', periodo: '1995–2000', caida: '78%', recuperacion: '~15 años (Nasdaq)' },
  { activo: 'Subprime', periodo: '2003–2008', caida: '57% (S&P)', recuperacion: '5–7 años' },
  { activo: 'Cripto 2017', periodo: '2017–2018', caida: '85%', recuperacion: '~3 años (BTC)' },
  { activo: 'Cripto 2021', periodo: '2021–2022', caida: '77%', recuperacion: 'En curso' },
];

type TabId = 'fases' | 'casos' | 'psicologia' | 'limites';

interface Tab {
  id: TabId;
  label: string;
  icono: string;
}

const TABS: Tab[] = [
  { id: 'fases', label: 'Las 5 fases de Minsky', icono: '📊' },
  { id: 'casos', label: 'Casos históricos', icono: '📜' },
  { id: 'psicologia', label: 'Psicología de la burbuja', icono: '🧠' },
  { id: 'limites', label: 'Lo que NO puedes hacer', icono: '🚫' },
];

export default function VisualizadorBurbujaEspeculativa() {
  const [tabActiva, setTabActiva] = useState<TabId>('fases');
  const [faseSeleccionada, setFaseSeleccionada] = useState<number | null>(null);
  const [casoSeleccionado, setCasoSeleccionado] = useState<number | null>(null);
  const [checkItems, setCheckItems] = useState<boolean[]>(Array(CHECKLIST_ITEMS.length).fill(false));

  const relatedApps = getRelatedApps('visualizador-burbuja-especulativa');

  const puntuacionChecklist = checkItems.reduce(
    (acc, checked, i) => acc + (checked ? CHECKLIST_ITEMS[i].peso : 0),
    0
  );
  const maxPuntuacion = CHECKLIST_ITEMS.reduce((acc, item) => acc + item.peso, 0);

  function toggleCheck(i: number) {
    setCheckItems((prev) => {
      const nuevo = [...prev];
      nuevo[i] = !nuevo[i];
      return nuevo;
    });
  }

  function getNivelAlerta(): { texto: string; clase: string } {
    if (puntuacionChecklist === 0) return { texto: 'Sin señales detectadas', clase: styles.alertaNinguna };
    if (puntuacionChecklist <= 2) return { texto: 'Señales tempranas (boom)', clase: styles.alertaBaja };
    if (puntuacionChecklist <= 5) return { texto: 'Señales de euforia avanzada', clase: styles.alertaMedia };
    return { texto: '⚠️ Señales claras de euforia Minsky', clase: styles.alertaAlta };
  }

  const nivelAlerta = getNivelAlerta();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">📈</div>
        <h1>Burbuja Especulativa: Las 5 Fases de Minsky</h1>
        <p>
          De los tulipanes holandeses al cripto: por qué las burbujas siempre siguen el mismo patrón,
          qué sesgos las alimentan y cómo reconocerlas antes del colapso
        </p>
      </header>

      <LegalNotice />

      {/* Navegación de tabs */}
      <nav className={styles.tabs} aria-label="Secciones del visualizador">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActive : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-selected={tabActiva === tab.id}
            role="tab"
          >
            <span aria-hidden="true">{tab.icono}</span> {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.content}>

        {/* ── TAB 1: Las 5 fases de Minsky ── */}
        {tabActiva === 'fases' && (
          <section>
            <div className={styles.introTexto}>
              <p>
                Hyman Minsky (1919-1996) fue un economista estadounidense que describió el ciclo
                de las burbujas financieras. Su modelo de 5 fases se ha aplicado con precisión
                a todas las burbujas documentadas, desde el siglo XVII hasta hoy.
              </p>
            </div>

            {/* Curva SVG de precio con fases */}
            <div className={styles.curvaSvgWrapper} aria-label="Curva de precio de una burbuja especulativa con las 5 fases de Minsky marcadas">
              <svg
                className={styles.curvaSvg}
                viewBox="0 0 800 300"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {/* Fondo */}
                <rect width="800" height="300" fill="none" />

                {/* Zonas de fase (coloreadas) */}
                <rect x="0" y="0" width="120" height="300" fill="#48A9A6" fillOpacity="0.07" />
                <rect x="120" y="0" width="160" height="300" fill="#3B82F6" fillOpacity="0.07" />
                <rect x="280" y="0" width="160" height="300" fill="#F59E0B" fillOpacity="0.07" />
                <rect x="440" y="0" width="120" height="300" fill="#EF4444" fillOpacity="0.07" />
                <rect x="560" y="0" width="240" height="300" fill="#7C3AED" fillOpacity="0.07" />

                {/* Líneas verticales separando fases */}
                {[120, 280, 440, 560].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="260" stroke="#ccc" strokeDasharray="4 4" strokeWidth="1" />
                ))}

                {/* Curva de precio: desplazamiento → boom → euforia (pico) → angustia → pánico → recuperación lenta */}
                <path
                  d="M 10 240 C 40 238, 80 235, 120 230
                     C 160 225, 200 215, 240 200
                     C 260 193, 270 182, 280 165
                     C 310 130, 340 90, 380 50
                     C 400 30, 420 20, 440 30
                     C 460 42, 480 80, 500 110
                     C 520 135, 540 155, 560 170
                     C 600 195, 640 230, 680 248
                     C 720 255, 760 252, 790 250"
                  fill="none"
                  stroke="#2E86AB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Etiquetas de fase */}
                {[
                  { x: 60, label: '🌱', sublabel: 'Desplaz.' },
                  { x: 200, label: '📈', sublabel: 'Boom' },
                  { x: 360, label: '🎉', sublabel: 'Euforia' },
                  { x: 500, label: '😰', sublabel: 'Angustia' },
                  { x: 650, label: '💥', sublabel: 'Pánico' },
                ].map((f) => (
                  <g key={f.x}>
                    <text x={f.x} y="280" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">
                      {f.sublabel}
                    </text>
                    <text x={f.x} y="265" textAnchor="middle" fontSize="14">
                      {f.label}
                    </text>
                  </g>
                ))}

                {/* Punto de pico */}
                <circle cx="440" cy="30" r="5" fill="#EF4444" />
                <text x="440" y="20" textAnchor="middle" fontSize="10" fill="#EF4444" fontWeight="bold">
                  PICO
                </text>

                {/* Eje Y label */}
                <text x="8" y="20" fontSize="10" fill="currentColor" opacity="0.5" writingMode="tb">
                  PRECIO
                </text>
              </svg>
              <p className={styles.curvaNota}>Curva esquemática ilustrativa — no representa datos reales de ningún activo concreto</p>
            </div>

            {/* Tarjetas de fases */}
            <div className={styles.fasesGrid}>
              {FASES_MINSKY.map((fase) => (
                <button
                  key={fase.numero}
                  className={`${styles.faseCard} ${faseSeleccionada === fase.numero ? styles.faseCardActive : ''}`}
                  onClick={() => setFaseSeleccionada(faseSeleccionada === fase.numero ? null : fase.numero)}
                  aria-expanded={faseSeleccionada === fase.numero}
                >
                  <div className={styles.faseHeader}>
                    <span className={styles.faseNumero} aria-hidden="true">{fase.numero}</span>
                    <span className={styles.faseIcono} aria-hidden="true">{fase.icono}</span>
                    <div className={styles.faseTitulos}>
                      <strong className={styles.faseNombre}>{fase.nombre}</strong>
                      <span className={styles.faseResumen}>{fase.resumen}</span>
                    </div>
                    <span className={styles.faseChevron} aria-hidden="true">
                      {faseSeleccionada === fase.numero ? '▲' : '▼'}
                    </span>
                  </div>

                  {faseSeleccionada === fase.numero && (
                    <div className={styles.faseDetalle} onClick={(e) => e.stopPropagation()}>
                      <p className={styles.faseDescripcion}>{fase.descripcion}</p>

                      <div className={styles.faseColumnas}>
                        <div className={styles.faseColumna}>
                          <h4 className={styles.faseSubtitulo}>Señales identificativas</h4>
                          <ul className={styles.faselista}>
                            {fase.senales.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className={styles.faseColumna}>
                          <h4 className={styles.faseSubtitulo}>Ejemplos históricos</h4>
                          <ul className={styles.faselistaEjemplos}>
                            {fase.ejemplos.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── TAB 2: Casos históricos ── */}
        {tabActiva === 'casos' && (
          <section>
            <div className={styles.introTexto}>
              <p>
                Cada burbuja tiene su propia narrativa única, pero todas siguen el mismo ciclo de Minsky.
                Cinco siglos de especulación humana, cinco patrones idénticos.
              </p>
            </div>

            <div className={styles.casosGrid}>
              {CASOS_HISTORICOS.map((caso, i) => (
                <div
                  key={i}
                  className={`${styles.casoCard} ${casoSeleccionado === i ? styles.casoCardActive : ''}`}
                  style={{ borderTopColor: caso.color }}
                >
                  <button
                    className={styles.casoHeader}
                    onClick={() => setCasoSeleccionado(casoSeleccionado === i ? null : i)}
                    aria-expanded={casoSeleccionado === i}
                  >
                    <span className={styles.casoIcono} aria-hidden="true">{caso.icono}</span>
                    <div className={styles.casoTitulos}>
                      <strong className={styles.casoActivo}>{caso.activo}</strong>
                      <span className={styles.casoPeriodo}>{caso.periodo}</span>
                    </div>
                    <span className={styles.casoChevron} aria-hidden="true">
                      {casoSeleccionado === i ? '▲' : '▼'}
                    </span>
                  </button>

                  {casoSeleccionado === i && (
                    <div className={styles.casoDetalle}>
                      <p className={styles.casoDescripcion}>{caso.descripcion}</p>
                      <dl className={styles.casoDatos}>
                        <dt>Detonante</dt>
                        <dd>{caso.detonante}</dd>
                        <dt>Pico de valoración</dt>
                        <dd>{caso.picoValoracion}</dd>
                        <dt>Caída desde pico</dt>
                        <dd className={styles.casosDatoCaida}>{caso.caida}</dd>
                        <dt>Tiempo en recuperarse</dt>
                        <dd>{caso.recuperacion}</dd>
                      </dl>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tabla comparativa */}
            <div className={styles.tablaWrapper}>
              <h3 className={styles.tablaTitle}>Comparativa de Burbujas</h3>
              <div className={styles.tablaScroll}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Activo</th>
                      <th>Período expansión</th>
                      <th>Caída desde pico</th>
                      <th>Recuperación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TABLA_COMPARATIVA.map((fila, i) => (
                      <tr key={i}>
                        <td>{fila.activo}</td>
                        <td>{fila.periodo}</td>
                        <td className={styles.tablaCaida}>{fila.caida}</td>
                        <td>{fila.recuperacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 3: Psicología de la burbuja ── */}
        {tabActiva === 'psicologia' && (
          <section>
            <div className={styles.introTexto}>
              <p>
                Las burbujas no son irracionales: son el resultado predecible de sesgos cognitivos humanos
                actuando en conjunto. Saber que existen no es suficiente para evitarlos.
              </p>
            </div>

            <div className={styles.sesgosGrid}>
              {SESGOS.map((sesgo, i) => (
                <div key={i} className={styles.sesgoCard}>
                  <div className={styles.sesgoIcono} aria-hidden="true">{sesgo.icono}</div>
                  <h3 className={styles.sesgoNombre}>{sesgo.nombre}</h3>
                  <p className={styles.sesgoDescripcion}>{sesgo.descripcion}</p>
                  <div className={styles.sesgoEjemplo}>
                    <strong>Ejemplo:</strong> {sesgo.ejemplo}
                  </div>
                </div>
              ))}
            </div>

            {/* El papel del crédito */}
            <div className={styles.creditoBox}>
              <h3 className={styles.creditoTitulo}>
                <span aria-hidden="true">💳</span> El crédito como amplificador
              </h3>
              <p>
                Las burbujas grandes <strong>siempre tienen deuda detrás</strong>. Sin crédito fácil,
                los precios no pueden subir tanto ni caer tan rápido. El bucle es:
              </p>
              <div className={styles.creditoBucle}>
                <span className={styles.creditoBucleItem}>Precio sube</span>
                <span className={styles.creditoFlecha} aria-hidden="true">→</span>
                <span className={styles.creditoBucleItem}>Garantía vale más</span>
                <span className={styles.creditoFlecha} aria-hidden="true">→</span>
                <span className={styles.creditoBucleItem}>Banco presta más</span>
                <span className={styles.creditoFlecha} aria-hidden="true">→</span>
                <span className={styles.creditoBucleItem}>Más compradores</span>
                <span className={styles.creditoFlecha} aria-hidden="true">→</span>
                <span className={styles.creditoBucleItem}>Precio sube</span>
              </div>
              <p className={styles.creditoInverso}>
                Al revertirse: precio baja → margin call → venta forzada → precio baja más →
                más margin calls → cascada de liquidaciones.
              </p>
            </div>

            {/* Checklist de alerta */}
            <div className={styles.checklistWrapper}>
              <h3 className={styles.checklistTitulo}>
                <span aria-hidden="true">✅</span> Indicadores de alerta: ¿Estamos en euforia?
              </h3>
              <p className={styles.checklistSubtitulo}>
                Marca los que observas en algún activo actual para ver en qué fase podría estar:
              </p>

              <div className={styles.checklist}>
                {CHECKLIST_ITEMS.map((item, i) => (
                  <label key={i} className={styles.checkItem}>
                    <input
                      type="checkbox"
                      checked={checkItems[i]}
                      onChange={() => toggleCheck(i)}
                      className={styles.checkInput}
                    />
                    <span className={styles.checkTexto}>{item.texto}</span>
                  </label>
                ))}
              </div>

              <div className={`${styles.alertaResultado} ${nivelAlerta.clase}`}>
                <strong>Diagnóstico:</strong> {nivelAlerta.texto}
                <div className={styles.alertaBar}>
                  <div
                    className={styles.alertaBarFill}
                    style={{ width: `${(puntuacionChecklist / maxPuntuacion) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={puntuacionChecklist}
                    aria-valuemin={0}
                    aria-valuemax={maxPuntuacion}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 4: Lo que NO puedes hacer ── */}
        {tabActiva === 'limites' && (
          <section>
            <div className={styles.introTexto}>
              <p>
                Conocer el modelo de Minsky es valioso. Creer que te permite predecir el mercado
                es una forma más de "esta vez es diferente".
              </p>
            </div>

            <div className={styles.limitesGrid}>
              <div className={styles.limiteCard}>
                <div className={styles.limiteIcono} aria-hidden="true">🎯</div>
                <h3>No puedes predecir el momento del pico</h3>
                <p>
                  Ni Greenspan, ni Shiller, ni los mejores economistas del mundo saben cuándo exactamente
                  explota una burbuja. <strong>Robert Shiller avisó de la burbuja dot-com en 1996</strong> con
                  su famoso discurso de "exuberancia irracional — la burbuja tardó 4 años en pinchar.
                  Quien salió en 1996 perdió las ganancias de cuatro años. Quien salió en 2000 perdió todo.
                </p>
              </div>

              <div className={styles.limiteCard}>
                <div className={styles.limiteIcono} aria-hidden="true">⚠️</div>
                <h3>Vender en corto una burbuja es extremadamente peligroso</h3>
                <p>
                  The Big Short (2015) popularizó la idea de apostar contra burbujas. Lo que no muestra bien
                  es cuánto tiempo sufrieron quienes apostaron contra las hipotecas en 2005: casi quebraron
                  esperando el crash que llegó en 2007-08. Una burbuja puede durar más que tu capital.
                </p>
              </div>

              <div className={styles.alertBox}>
                <span className={styles.alertBoxIcono} aria-hidden="true">💬</span>
                <blockquote className={styles.alertBoxCita}>
                  "Los mercados pueden permanecer irracionales más tiempo del que tú puedes permanecer solvente."
                </blockquote>
                <cite className={styles.alertBoxAutor}>— John Maynard Keynes</cite>
              </div>
            </div>

            <div className={styles.siPuedesWrapper}>
              <h3 className={styles.siPuedesTitulo}>
                <span aria-hidden="true">✅</span> Lo que SÍ puedes hacer
              </h3>
              <div className={styles.siPuedesGrid}>
                {[
                  { icono: '🗺️', texto: 'Reconocer en qué fase del ciclo parece estar un activo según las señales de Minsky' },
                  { icono: '📉', texto: 'Limitar tu exposición en fase de euforia: no invertir más de lo que puedes perder al 90%' },
                  { icono: '🌐', texto: 'Diversificar genuinamente — no toda la cartera en el activo de moda de este ciclo' },
                  { icono: '📚', texto: 'Estudiar los ciclos históricos para entrenar tu detector de narrativas convincentes pero falsas' },
                  { icono: '⏳', texto: 'Recordar: el retroceso a la media es inevitable; solo el timing es incierto' },
                  { icono: '🧘', texto: 'Gestionar el FOMO: si solo entras porque "todos ganan", probablemente sea tarde' },
                ].map((item, i) => (
                  <div key={i} className={styles.siPuedesItem}>
                    <span className={styles.siPuedesIcono} aria-hidden="true">{item.icono}</span>
                    <p>{item.texto}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.warningBox}>
              <strong>Nota educativa:</strong> Este visualizador tiene fines exclusivamente educativos.
              No constituye asesoramiento de inversión. Las referencias a activos históricos son
              descriptivas, no prescriptivas. Consulta con un asesor financiero regulado antes
              de tomar decisiones de inversión.
            </div>
          </section>
        )}
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="Profundiza: burbujas especulativas"
        subtitle="El modelo de Minsky, el Momento Minsky y por qué repetimos los mismos errores"
      >
        <div className={styles.educSection}>
          <h3>Burbuja especulativa vs. corrección normal</h3>
          <p>
            Una <strong>corrección</strong> es una caída del 10-20% dentro de una tendencia alcista con fundamentos sólidos.
            Una <strong>burbuja especulativa</strong> implica que las valoraciones se han desconectado de los fundamentales
            (beneficios, flujos de caja, valor intrínseco) y que el precio subió principalmente por expectativas
            de que otros pagarán más, no por valor real generado. La diferencia no siempre es obvia en el momento.
          </p>

          <h3>El Momento Minsky</h3>
          <p>
            El economista Paul McCulley acuñó el término "Momento Minsky" en 1998 durante la crisis rusa.
            Describe el punto de inflexión exacto en que los inversores endeudados deben vender activos
            para cubrir deudas, precipitando el colapso. Es el instante en que el ciclo de crédito se invierte:
            de expansión a contracción forzada. El Momento Minsky de 2008 fue la quiebra de Lehman Brothers
            el 15 de septiembre.
          </p>

          <h3>¿Por qué repetimos los mismos errores si "sabemos" el ciclo?</h3>
          <p>
            Porque cada burbuja tiene una <em>narrativa genuinamente nueva</em> que hace que parezca diferente.
            Internet era real. Blockchain es real. El inmobiliario había sido históricamente seguro.
            La narrativa nueva dota al sesgo de "esta vez es diferente" de credibilidad suficiente
            para superar el conocimiento histórico. Además, durante la fase de euforia, las personas
            que advierten <em>realmente pierden dinero</em> (o ganan menos) mientras los optimistas ganan.
            Eso refuerza conductualmente la narrativa de la burbuja.
          </p>

          <h3>Diferencia entre Minsky y "predecir el mercado"</h3>
          <p>
            El modelo de Minsky describe <em>fases cualitativas</em>, no precios ni fechas.
            Es útil para reconocer señales de exceso, no para hacer market timing.
            Los gestores que intentan usar el ciclo de Minsky para entrar y salir del mercado
            con precisión tienden a hacerlo peor que el mercado a largo plazo: salen demasiado pronto
            o reentran demasiado tarde.
          </p>

          <div className={styles.warningBox}>
            <strong>Recordatorio educativo:</strong> Ningún modelo económico —incluyendo el de Minsky—
            predice cuándo ocurrirá el siguiente crash ni en qué activo. La historia es rica en patrones;
            el futuro es genuinamente incierto.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-burbuja-especulativa" />
      <Footer appName="visualizador-burbuja-especulativa" />
    </div>
  );
}
