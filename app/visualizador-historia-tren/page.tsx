'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaTren.module.css';
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
  | 'vapor_pionero'
  | 'fiebre_ferroviaria'
  | 'red_continental'
  | 'belle_epoque'
  | 'guerras'
  | 'diesel_electrico'
  | 'shinkansen'
  | 'tgv_ice'
  | 'ave'
  | 'sostenible';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoTren {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  linea: string;
  velocidad: string;
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

const PERIODOS: PeriodoTren[] = [
  {
    id: 1, periodo: '1804–1830', anio: 1804, anioFin: 1830,
    titulo: 'Los Pioneros del Vapor',
    descripcion: 'Richard Trevithick construye la primera locomotora de vapor (Merthyr Tydfil, Gales, 1804). George Stephenson diseña el Blücher (1814) y funda Robert Stephenson & Company. La locomotora Locomotion No.1 inaugura el ferrocarril Stockton & Darlington (1825): primer ferrocarril público del mundo.',
    innovacion: 'Locomotora de vapor, primer ferrocarril público',
    linea: 'Stockton & Darlington (1825)',
    velocidad: '~25 km/h',
    impacto: 'Demostración de que el vapor podía mover carga y pasajeros de forma rentable y regular',
    datos: 'La locomotora Rocket de Stephenson ganó las Rainhill Trials (1829) a 47 km/h, convenciendo a los inversores del futuro del ferrocarril.',
    categoria: 'vapor_pionero',
  },
  {
    id: 2, periodo: '1830–1850', anio: 1830, anioFin: 1850,
    titulo: 'La Fiebre del Ferrocarril',
    descripcion: 'Liverpool-Manchester (1830): primera línea interurbana con tracción de vapor exclusivamente. La Rocket alcanza 48 km/h. Railway Mania en Gran Bretaña (1840s): especulación y construcción masiva. En España: Barcelona-Mataró (1848), primer ferrocarril peninsular. USA: Baltimore & Ohio inaugura la era ferroviaria americana.',
    innovacion: 'Línea interurbana regular, red nacional, especulación inversora',
    linea: 'Liverpool-Manchester (1830) / Barcelona-Mataró (1848)',
    velocidad: '~50-70 km/h',
    impacto: 'El tren democratizó el viaje: el precio bajó un 80% respecto a la diligencia. Surgió la clase media viajera.',
    datos: 'En 1850 Gran Bretaña tenía 10.000 km de vía. El 75% del parlamento británico tenía acciones ferroviarias en 1845.',
    categoria: 'fiebre_ferroviaria',
  },
  {
    id: 3, periodo: '1850–1885', anio: 1850, anioFin: 1885,
    titulo: 'La Red Continental: Expansión Global',
    descripcion: 'Ferrocarril transcontinental USA (Union Pacific + Central Pacific, 1869): costa a costa en 6 días. Orient Express inaugural (1883, París-Constantinopla, 3.100 km). Expansión ferroviaria india bajo el Imperio Británico. En España: red radial desde Madrid completada. Gran Tunnel du Mont Cenis (1871, primer gran túnel alpino).',
    innovacion: 'Transcontinental, túneles alpinos, tren de lujo internacional',
    linea: 'Transcontinental USA (1869) / Orient Express (1883)',
    velocidad: '~80-100 km/h',
    impacto: 'El tren unificó mercados nacionales y redujo el tiempo Madrid-Barcelona de 8 días en diligencia a 12 horas.',
    datos: 'El ferrocarril transcontinental redujo el viaje Nueva York-San Francisco de 6 meses (por barco rodeando Sudamérica) a 6 días.',
    categoria: 'red_continental',
  },
  {
    id: 4, periodo: '1885–1914', anio: 1885, anioFin: 1914,
    titulo: 'La Belle Époque: Tren como Símbolo de Progreso',
    descripcion: 'Orient Express en su apogeo: coche-cama Pullman, restaurante, piano. Grandes estaciones como obras de arte (St Pancras 1868, Grand Central NY 1913, Atocha 1892). Primeras líneas eléctricas metropolitanas (metro de Londres electrificado 1890, metro de Madrid 1919). Ferrocarriles de montaña suizos.',
    innovacion: 'Tren de lujo, grandes terminales, electrificación metro',
    linea: 'Orient Express (apogeo) / Grand Central Terminal',
    velocidad: '~120 km/h (vapor)',
    impacto: 'El viaje en tren se convirtió en experiencia cultural. Las grandes estaciones eran los templos del progreso industrial.',
    datos: 'El Orient Express tardaba 81 horas en París-Constantinopla. Agatha Christie lo inmortalizó en "Asesinato en el Orient Express" (1934).',
    categoria: 'belle_epoque',
  },
  {
    id: 5, periodo: '1914–1950', anio: 1914, anioFin: 1950,
    titulo: 'Guerras, RENFE y la Transición al Diésel',
    descripcion: 'Los ferrocarriles son arteria logística esencial en WWI y WWII (transporte de tropas, suministros, evacuaciones). La RENFE fundada (1941) unifica las compañías privadas españolas. El motor diésel empieza a reemplazar el vapor en líneas secundarias. El automóvil y el avión comienzan a competir con el tren.',
    innovacion: 'Logística militar, RENFE, diésel, competencia intermodal',
    linea: 'RENFE (fundada 1941) / redes militares europeas',
    velocidad: '~120-140 km/h (vapor expreso)',
    impacto: 'España unifica su red con ancho ibérico (1.668 mm) diferente al europeo estándar (1.435 mm), aislamiento que persiste hoy.',
    datos: 'En la WWII, Alemania transportó 1,5 millones de soldados por tren en la invasión de la URSS. Los ferrocarriles fueron objetivo prioritario de los bombardeos aliados.',
    categoria: 'guerras',
  },
  {
    id: 6, periodo: '1950–1964', anio: 1950, anioFin: 1964,
    titulo: 'La Era Diésel y Eléctrica: El Tren se Moderniza',
    descripcion: 'Electrificación masiva de líneas principales en Europa occidental. El vapor desaparece progresivamente (último vapor en servicio regular UK: 1968, España: 1975). Los diésel rápidos (TEE Trans-Europ-Express, 1957) conectan ciudades sin cambio de máquina. El automóvil crece como competidor. Primeras autopistas.',
    innovacion: 'TEE Trans-Europ-Express, electrificación masiva, fin del vapor',
    linea: 'TEE Trans-Europ-Express (1957, 12 países)',
    velocidad: '~160 km/h (TEE diésel)',
    impacto: 'El TEE fue el primer tren internacional de alta calidad sin frontera. Precursor directo del Eurostar.',
    datos: 'El último vapor en servicio regular en UK fue el 11 de agosto de 1968 (el "Evening Star"). Millones de personas presenciaron su retirada.',
    categoria: 'diesel_electrico',
  },
  {
    id: 7, periodo: '1964–1981', anio: 1964, anioFin: 1981,
    titulo: 'El Shinkansen Japonés: La Revolución de la Alta Velocidad',
    descripcion: 'El Shinkansen "bala" inaugurado para los Juegos Olímpicos de Tokio (1 de octubre de 1964): 210 km/h entre Tokio y Osaka (515 km). Revolutiona el concepto de transporte ferroviario. El TGV francés en desarrollo. En España, TALGO mejorado. RENFE lenta pero con servicio nocturno. La crisis del petróleo (1973) revive el interés por el tren.',
    innovacion: 'Alta velocidad (>200 km/h), Shinkansen, tren puntual',
    linea: 'Shinkansen Tokaido (Tokio-Osaka, 1964)',
    velocidad: '210 km/h (1964) → 320 km/h (hoy)',
    impacto: 'El Shinkansen ha transportado más de 10.000 millones de pasajeros sin un solo muerto en accidente (hasta 2024).',
    datos: 'El Shinkansen tiene una puntualidad media de 0,9 minutos de retraso. En Japón, 15 segundos de retraso genera una disculpa oficial.',
    categoria: 'shinkansen',
  },
  {
    id: 8, periodo: '1981–1992', anio: 1981, anioFin: 1992,
    titulo: 'El TGV Francés y la Alta Velocidad Europea',
    descripcion: 'TGV Paris-Lyon inaugurado (1981): 260 km/h en servicio comercial. Record mundial de velocidad: 515,3 km/h (1990). ICE alemán inaugura (1991). Eurostar en construcción (Túnel del Canal, 1994). España decide construir el AVE (1986) con ancho estándar europeo: primera ruptura con el ancho ibérico. La alta velocidad como política de Estado.',
    innovacion: 'TGV, record velocidad, Eurostar, decisión AVE España',
    linea: 'TGV Paris-Lyon (1981) / ICE Frankfurt-Hannover (1991)',
    velocidad: '260-300 km/h comercial',
    impacto: 'El TGV redujo Paris-Lyon de 4 horas a 2. El tren recuperó cuota frente al avión en distancias 200-800 km.',
    datos: 'El TGV batió 8 records mundiales de velocidad. El record actual ferroviario es 575 km/h (MLX01 Maglev japonés, 2003).',
    categoria: 'tgv_ice',
  },
  {
    id: 9, periodo: '1992–2010', anio: 1992, anioFin: 2010,
    titulo: 'El AVE y Europa de Alta Velocidad',
    descripcion: 'AVE Madrid-Sevilla inaugura el 14 de abril de 1992 (Expo Sevilla 92): primer AVE español, 471 km a 270 km/h, 2h45 (antes 6h en tren convencional). Eurostar Paris-Londres por el Eurotúnel (1994): 35 km bajo el Canal de la Mancha. AVE Madrid-Barcelona (2008). Thalys, Lyria, conectan Europa.',
    innovacion: 'AVE español, Eurotúnel, red europea interconectada',
    linea: 'AVE Madrid-Sevilla (1992) / Eurostar (1994) / AVE Madrid-Barcelona (2008)',
    velocidad: '300-320 km/h',
    impacto: 'España pasó de 0 a tener la red de alta velocidad más extensa de Europa (3.800 km) en 30 años.',
    datos: 'El AVE tiene una puntualidad del 98,7%. Si llega con más de 5 minutos de retraso, devuelven el billete.',
    categoria: 'ave',
  },
  {
    id: 10, periodo: '2010–2018', anio: 2010, anioFin: 2018,
    titulo: 'China Supera a Europa: El Mayor Sistema de Alta Velocidad del Mundo',
    descripcion: 'China construye 40.000 km de alta velocidad en 15 años (2008-2023), más que el resto del mundo junto. CRH (China Railway High-speed) con velocidades de 350 km/h. Maglev Shanghai: único tren comercial de levitación magnética (430 km/h). RENFE abre a competencia: Ouigo llega a España (2021). Tren de hidrógeno en pruebas (Alstom Coradia iLint, 2018).',
    innovacion: 'Hidrógeno, Maglev comercial, competencia ferroviaria liberalizada',
    linea: 'CRH Beijing-Shanghai (1.318 km, 4h30) / Maglev Shanghai',
    velocidad: '350 km/h (CRH) / 430 km/h (Maglev)',
    impacto: 'China mueve 3.800 millones de pasajeros en alta velocidad al año (más que todos los vuelos mundiales juntos).',
    datos: 'El CRH Beijing-Shanghai recorrió 1.318 km en 4h18 en 2017. El equivalente en avión (con aeropuertos) tarda más de 5 horas.',
    categoria: 'ave',
  },
  {
    id: 11, periodo: '2018–2022', anio: 2018, anioFin: 2022,
    titulo: 'Sostenibilidad y el Renacimiento del Tren Nocturno',
    descripcion: 'Flygskam ("vergüenza de volar") en Suecia impulsa el "railcation". Night Jet austriaco resucita el tren nocturno europeo (Viena-Amsterdam, Viena-Roma). Alstom lanza el primer tren comercial de hidrógeno (Coradia iLint, Alemania). Ouigo llega a España (2021) con billetes desde 9€. Pandemia COVID-19 acelera reflexión sobre movilidad sostenible.',
    innovacion: 'Tren nocturno premium, hidrógeno comercial, low-cost ferroviario',
    linea: 'Night Jet Vienna-Amsterdam / Coradia iLint (hidrógeno)',
    velocidad: '160-200 km/h (nocturnos)',
    impacto: 'Las reservas de trenes nocturnos crecieron un 30% en Europa (2021-2023). El tren emite 6 veces menos CO2 que el avión.',
    datos: 'Un tren eléctrico emite 14g CO2/km por pasajero. Un avión emite 255g CO2/km. Un coche: 104g CO2/km.',
    categoria: 'sostenible',
  },
  {
    id: 12, periodo: '2022–2024', anio: 2022, anioFin: 2024,
    titulo: 'AVE a Lisboa, AVLO y la Nueva Competencia',
    descripcion: 'AVLO (Renfe low-cost) compite con Ouigo e Iryo en España. Iryo (Trenitalia + Air Nostrum) entra al mercado español (2022): 3 operadores en Madrid-Barcelona. Hyperloop One cierra (2023) sin haber alcanzado escala comercial. China planea tren a 600 km/h (Maglev). AVE Madrid-Lisboa: primer tramo completado. Trenes autónomos en pruebas (GoA4 en Hamburgo).',
    innovacion: 'Competencia ferroviaria, trenes autónomos, Hyperloop fracasa',
    linea: 'Iryo (2022) / AVLO / avance AVE Lisboa',
    velocidad: '320 km/h (AVE España)',
    impacto: 'La competencia redujo el precio AVE Madrid-Barcelona un 40% en 2 años (2022-2024). El tren recuperó cuota de mercado frente al avión.',
    datos: 'En la ruta Madrid-Barcelona, el tren tiene el 75% de la cuota modal combinada tren+avión, récord europeo.',
    categoria: 'sostenible',
  },
  {
    id: 13, periodo: '2024–2026', anio: 2024, anioFin: 2026,
    titulo: 'El Tren del Futuro: Hidrógeno, Baterías e IA',
    descripcion: 'España: más de 4.000 km de alta velocidad, red más extensa de Europa. Tren de hidrógeno Alstom Coradia iLint en expansión (Alemania, UK). Baterías de litio para líneas no electrificadas. IA para gestión de tráfico y mantenimiento predictivo. Maglev superconductor japonés (Chuo Shinkansen): 603 km/h en pruebas, previsto para 2027 Tokio-Nagoya.',
    innovacion: 'Hidrógeno, baterías, IA, Maglev superconductor',
    linea: 'Chuo Shinkansen (Tokio-Nagoya, 2027 previsto)',
    velocidad: '603 km/h (Maglev pruebas) / 320 km/h (alta velocidad comercial)',
    impacto: 'El Maglev japonés reduciría Tokio-Osaka (515 km) a 67 minutos. El tren de hidrógeno elimina emisiones en líneas no electrificadas.',
    datos: 'España tiene 4.053 km de alta velocidad (2024), superando a China (40.000 km) en proporción al PIB invertido.',
    categoria: 'sostenible',
  },
  {
    id: 14, periodo: '2025–2030', anio: 2025, anioFin: 2030,
    titulo: 'AVE a Europa y la Interoperabilidad',
    descripcion: 'AVE Madrid-Lisboa: conexión ibérica en construcción. Proyecto tren de alta velocidad transeuropeo (TEN-T: 30.000 km para 2030). Night Jet conecta 25 ciudades europeas. Ouigo, Iryo y Renfe ofrecen billetes interoperables. Debate sobre "avión cero" para vuelos de menos de 2h con alternativa ferroviaria. España como hub ferroviario del sur de Europa.',
    innovacion: 'Interoperabilidad europea, alta velocidad Lisboa-París, integración modal',
    linea: 'TEN-T Red Transeuropea / AVE Madrid-Lisboa (construcción)',
    velocidad: 'Objetivo 350 km/h estándar TEN-T',
    impacto: 'El objetivo UE 2030: duplicar el uso del tren de alta velocidad. Para 2050: triplicarlo, con tren nocturno en toda Europa.',
    datos: 'El plan TEN-T europeo requiere 500.000 millones de euros de inversión hasta 2030. España recibe 18.000 millones de los fondos de cohesión.',
    categoria: 'sostenible',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1804, evento: 'Trevithick construye la primera locomotora de vapor — nace el ferrocarril moderno' },
  { anio: 1825, evento: 'Ferrocarril Stockton & Darlington: primer ferrocarril público del mundo con tracción vapor' },
  { anio: 1848, evento: 'Barcelona-Mataró: primer ferrocarril de la península ibérica' },
  { anio: 1869, evento: 'Ferrocarril transcontinental USA: costa a costa en 6 días — unificación continental' },
  { anio: 1883, evento: 'Orient Express inaugura París-Constantinopla — el tren de lujo como símbolo de civilización' },
  { anio: 1941, evento: 'RENFE fundada: España unifica su red ferroviaria bajo gestión estatal' },
  { anio: 1964, evento: 'Shinkansen inaugura en Japón — nace la alta velocidad ferroviaria a 210 km/h' },
  { anio: 1981, evento: 'TGV Paris-Lyon — Europa entra en la era de la alta velocidad a 260 km/h' },
  { anio: 1992, evento: 'AVE Madrid-Sevilla inaugura — España decide construir su red de alta velocidad con ancho europeo' },
  { anio: 2021, evento: 'Ouigo llega a España — comienza la competencia ferroviaria en alta velocidad' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  vapor_pionero: 'Vapor Pionero',
  fiebre_ferroviaria: 'Fiebre Ferroviaria',
  red_continental: 'Red Continental',
  belle_epoque: 'Belle Époque',
  guerras: 'Guerras y RENFE',
  diesel_electrico: 'Diésel/Eléctrico',
  shinkansen: 'Shinkansen',
  tgv_ice: 'TGV / ICE',
  ave: 'AVE / Alta Vel.',
  sostenible: 'Sostenible',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  vapor_pionero: '#8B4513',
  fiebre_ferroviaria: '#D2691E',
  red_continental: '#A0522D',
  belle_epoque: '#DAA520',
  guerras: '#696969',
  diesel_electrico: '#4169E1',
  shinkansen: '#FF4500',
  tgv_ice: '#1E90FF',
  ave: '#CC9900',
  sostenible: '#228B22',
};

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const AÑO_MIN = 1804;
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

function PanelDetalle({ periodo }: { periodo: PeriodoTren }) {
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
            <li><strong>Línea:</strong> {periodo.linea}</li>
            <li><strong>Velocidad:</strong> {periodo.velocidad}</li>
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
  const [seleccionado, setSeleccionado] = useState<PeriodoTren | null>(null);

  const filas: PeriodoTren[][] = [[], [], [], []];
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

  const marcadores: number[] = [1830, 1860, 1890, 1920, 1945, 1965, 1981, 1992, 2010, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca de 1804 a 2025.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia del ferrocarril"
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
              <span className={styles.statLabel}>Velocidad</span>
              <span className={styles.statValue}>{periodo.velocidad}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Línea emblemática</span>
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
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período, línea o innovación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período ferroviario"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Velocidad</th>
              <th>Línea emblemática</th>
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
  { nombre: 'Era del Vapor', desde: 1804, hasta: 1880, icono: '🚂' },
  { nombre: 'La Belle Époque Ferroviaria', desde: 1881, hasta: 1913, icono: '🎩' },
  { nombre: 'Guerras y Modernización', desde: 1914, hasta: 1963, icono: '⚙️' },
  { nombre: 'La Revolución de la Alta Velocidad', desde: 1964, hasta: 1991, icono: '🚄' },
  { nombre: 'La Era del AVE y Europa', desde: 1992, hasta: 2019, icono: '🌍' },
  { nombre: 'Sostenibilidad y Futuro', desde: 2020, hasta: 9999, icono: '🌱' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos ferroviarios y eventos históricos organizados en 6 grandes eras.
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

export default function VisualizadorHistoriaTren() {
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
        <h1 className={styles.heroTitle}>Historia del Tren</h1>
        <p className={styles.heroSubtitle}>
          De la Locomotora de Vapor al AVE y el Tren de Hidrógeno — 220 años de ferrocarril en 14 períodos interactivos
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
        title="Historia del ferrocarril: evolución e impacto"
        subtitle="Cómo el tren transformó la economía, el territorio y la sociedad durante 220 años"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la historia del ferrocarril</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Tecnología de propulsión</th>
                <th>Velocidad máxima</th>
                <th>País líder</th>
                <th>Línea emblemática</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Vapor Pionero (1804–1850)</strong></td>
                <td>Locomotora de vapor (carbón)</td>
                <td>25–70 km/h</td>
                <td>Reino Unido</td>
                <td>Stockton & Darlington</td>
              </tr>
              <tr>
                <td><strong>Red Continental (1850–1914)</strong></td>
                <td>Vapor mejorado + acero</td>
                <td>80–120 km/h</td>
                <td>UK / Francia / USA</td>
                <td>Orient Express / Transcontinental USA</td>
              </tr>
              <tr>
                <td><strong>Diésel/Eléctrico (1950–1964)</strong></td>
                <td>Diésel + electrificación catenaria</td>
                <td>~160 km/h</td>
                <td>Europa Occidental</td>
                <td>TEE Trans-Europ-Express</td>
              </tr>
              <tr>
                <td><strong>Shinkansen (1964–1981)</strong></td>
                <td>Eléctrico AC de alta tensión</td>
                <td>210–320 km/h</td>
                <td>Japón</td>
                <td>Shinkansen Tokaido (Tokio-Osaka)</td>
              </tr>
              <tr>
                <td><strong>TGV / AVE (1981–2010)</strong></td>
                <td>Eléctrico AC, tracción distribuida</td>
                <td>260–320 km/h</td>
                <td>Francia / España</td>
                <td>TGV Paris-Lyon / AVE Madrid-Sevilla</td>
              </tr>
              <tr>
                <td><strong>Sostenible (2018–hoy)</strong></td>
                <td>Hidrógeno / Batería / Maglev</td>
                <td>320 km/h (comercial) / 603 km/h (Maglev)</td>
                <td>China / Japón / Alemania</td>
                <td>Coradia iLint / Chuo Shinkansen</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto ferroviario</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💰</span>
            <div>
              <strong>Impacto económico</strong>
              <p>El ferrocarril redujo los costes de transporte un 90% respecto a la diligencia. Unificó mercados nacionales y creó economías de escala. La Railway Mania (1840s) fue la primera burbuja especulativa moderna. El AVE activa el turismo y atrae inversiones en las ciudades conectadas.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏙️</span>
            <div>
              <strong>Impacto territorial</strong>
              <p>El tren definió qué ciudades crecerían y cuáles quedarían aisladas. En España, el diseño radial desde Madrid creó desequilibrios territoriales que persisten. El AVE ha relanzado Sevilla, Málaga y Zaragoza. La alta velocidad comprime el espacio: Madrid-Barcelona pasa a ser una ciudad-región única.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌿</span>
            <div>
              <strong>Impacto ambiental</strong>
              <p>El tren eléctrico emite 14g de CO2 por pasajero-km frente a los 255g del avión o los 104g del coche. En la ruta Madrid-Barcelona, cada pasajero que elige el AVE sobre el avión ahorra 50 kg de CO2 por trayecto. El tren de hidrógeno extiende estas ventajas a líneas no electrificadas.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👥</span>
            <div>
              <strong>Impacto social</strong>
              <p>El ferrocarril democratizó el viaje: antes de 1830, el 95% de la población nunca salía de su pueblo natal. El tren hizo posible las vacaciones, el trabajo en ciudades lejanas y el comercio cotidiano. La competencia (Ouigo, Iryo) está democratizando ahora el AVE con billetes desde 9€.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre la historia del ferrocarril</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué España tiene la red de AVE más extensa de Europa?</strong>
            <p>En 1986, el gobierno español decidió construir la nueva red en ancho estándar europeo (1.435 mm), rompiendo con el ancho ibérico heredado del siglo XIX. Esta decisión estratégica, tomada al ingresar en la CEE, permitió financiar la red con fondos europeos de cohesión. En 30 años, España pasó de 0 a más de 4.000 km de alta velocidad.</p>
            <span className={styles.faqTip}>Paradoja: España tiene la mayor red de AVE de Europa en proporción al PIB, pero RENFE tiene un presupuesto de mantenimiento convencional inferior a Alemania o Francia.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el ancho ibérico y por qué aísla a España de Europa?</strong>
            <p>El ancho de vía es la distancia entre los dos raíles. España y Portugal adoptaron el ancho ibérico (1.668 mm) en el siglo XIX, frente al estándar europeo de 1.435 mm (llamado ancho UIC). Esto significa que un tren convencional español no puede circular por Francia sin cambiar los bogies (las ruedas). El AVE sí usa el ancho europeo, por lo que puede conectar con la red europea cuando la infraestructura fronteriza esté lista.</p>
            <span className={styles.faqTip}>El TALGO tiene un sistema de rodadura variable que le permite cambiar el ancho de vía en marcha, resolviendo parcialmente el problema fronterizo sin detenerse.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el Maglev y por qué no está en todas partes?</strong>
            <p>El Maglev (levitación magnética) usa campos electromagnéticos para levantar el tren sobre la vía, eliminando la fricción mecánica. El Maglev Shanghai opera a 430 km/h comercialmente desde 2004. El Chuo Shinkansen japonés ha alcanzado 603 km/h en pruebas. El problema es el coste: construir vía Maglev cuesta 10 veces más que vía convencional de alta velocidad. Solo China y Japón tienen la capacidad de inversión para expandirlo.</p>
            <span className={styles.faqTip}>El Maglev Shanghai recorre los 30 km del aeropuerto al centro en 7 minutos. Pero la línea solo tiene 30 km porque construir más resultaba prohibitivo.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué fracasó Hyperloop?</strong>
            <p>Hyperloop One prometía trenes en tubos a vacío a 1.000 km/h. Cerró en 2023 tras gastar cientos de millones. Los problemas fueron estructurales: mantener el vacío en tubos de miles de km es técnicamente brutal (cualquier pequeña fuga rompe el sistema), el coste de infraestructura era astronómico, la seguridad en caso de accidente era incierta y el regulatorio de transporte público no estaba preparado. El tren de alta velocidad convencional (350 km/h) resuelve bien el 95% de los viajes objetivo.</p>
            <span className={styles.faqTip}>La velocidad no es el cuello de botella del transporte ferroviario: los 350 km/h del AVE ya superan al avión en viajes puerta a puerta hasta 800 km. El problema real es la frecuencia y el precio.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el tren de hidrógeno y cuándo llegará a España?</strong>
            <p>El tren de hidrógeno (como el Alstom Coradia iLint) usa celdas de combustible de hidrógeno para generar electricidad, emitiendo solo vapor de agua. Es ideal para líneas no electrificadas donde el coste de instalar catenaria no se justifica. En España, RENFE ha iniciado pruebas y podría tener trenes de hidrógeno en servicio en líneas rurales hacia 2027-2030. El principal reto es el suministro de hidrógeno verde a los depósitos.</p>
            <span className={styles.faqTip}>El Coradia iLint alemán llevó pasajeros de pago por primera vez en agosto de 2022 en Baja Sajonia, demostrando viabilidad comercial. Tiene una autonomía de 1.000 km con depósito lleno.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo viajar en tren por Europa desde España</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Planifica con antelación y compara operadores</strong>
              <p>En España, compara RENFE (avlo.com para low-cost), Ouigo e Iryo para la misma ruta. Los precios del AVE pueden bajar un 70% con 30-60 días de antelación. Para viajes internacionales, usa Trainline o Rail Europe para encontrar combinaciones con TGV, Eurostar o ICE.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Considera el pase Interrail para múltiples países</strong>
              <p>El Interrail Global Pass permite viajar por 33 países europeos durante un período fijo (7, 15 días o 1-3 meses). Es más económico que comprar billete a billete si haces más de 3-4 trayectos largos. Para menores de 28 años, existe el Interrail Youth con descuento del 35%.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Reserva el Night Jet para distancias largas nocturnas</strong>
              <p>Los trenes nocturnos de ÖBB (Night Jet) conectan Viena con Ámsterdam, Roma, Múnich, Hamburgo y Bruselas. Un billete en litera (couchette) puede costar menos que un hotel + tren diurno. Reserva con 60+ días de antelación para mejores precios. En 2025 se añaden nuevas rutas hacia París y Barcelona.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Llega pronto a la estación — pero no tanto como al aeropuerto</strong>
              <p>El control de seguridad en el AVE es similar al aeropuerto (escáner de equipaje), pero más ágil. RENFE recomienda llegar 20 minutos antes en alta velocidad. En el Eurostar (Londres) necesitas 30-45 minutos por el control aduanero británico. En trenes Schengen (entre países EU), no hay frontera.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Aprovecha la garantía de puntualidad del AVE</strong>
              <p>Si tu AVE llega con más de 5 minutos de retraso sobre el horario oficial, tienes derecho a la devolución del 50% del billete. Si llega con más de 15 minutos, el 100%. En el Shinkansen japonés, el retraso medio anual es de 54 segundos. En RENFE, la puntualidad AVE supera el 98%.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Consejos para entender la historia ferroviaria</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗺️</span>
            <p>El tren no solo conecta ciudades: define cuáles existen. Las ciudades sin estación ferroviaria en el siglo XIX perdieron población y relevancia económica durante décadas. La historia del tren es también la historia de qué lugares prosperaron y cuáles no.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <p>La alta velocidad no trata de ir más rápido: trata de competir con el avión. El TGV no superó al avión en velocidad punta, pero sí en el tiempo total puerta a puerta para distancias de 200-800 km, donde la ciudad y el aeropuerto añaden 2-3 horas.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>Los países que más han invertido en ferrocarril son los que tienen menor huella de CO2 en transporte. Japón, Suiza y Francia tienen emisiones por pasajero-km muy inferiores a países dependientes del coche como USA o Australia.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Los períodos ferroviarios se solapan: el Orient Express de vapor coexistió con los primeros metros eléctricos. Hoy, trenes diésel de los años 70 circulan por líneas rurales mientras el Maglev prueba a 600 km/h. La historia del tren es un continuo, no épocas separadas.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox OBLIGATORIO */}
        <div className={styles.warningBox}>
          <strong>Aviso sobre fechas y proyectos ferroviarios futuros</strong>
          <ul>
            <li>Los proyectos ferroviarios futuros (<strong>Maglev comercial Tokio-Nagoya, AVE Madrid-Lisboa, expansión TEN-T</strong>) tienen fechas tentativas que históricamente se retrasan; verificar el estado actual antes de planificar viajes o decisiones basadas en ellos.</li>
            <li>Los datos de <strong>emisiones de CO2</strong> varían según la fuente de electricidad del país: un tren eléctrico en Polonia (carbón) emite más que en Francia (nuclear) o Noruega (hidroeléctrica).</li>
            <li>Los <strong>precios de billete</strong> mencionados son orientativos y pueden variar con la temporada, antelación y disponibilidad; consultar siempre los operadores oficiales para precios actualizados.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-tren')} />
      <ShareCard appName="visualizador-historia-tren" />
      <Footer appName="visualizador-historia-tren" />
    </div>
  );
}
