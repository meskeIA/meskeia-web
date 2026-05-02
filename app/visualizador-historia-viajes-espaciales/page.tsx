'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaViajesEspaciales.module.css';
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

type CategoriaEspacio =
  | 'teoria'
  | 'cohetes_v2'
  | 'sputnik'
  | 'carrera_luna'
  | 'apollo'
  | 'transbordador'
  | 'estaciones'
  | 'rovers'
  | 'privado'
  | 'new_space';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoEspacio {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  mision: string;
  protagonista: string;
  impacto: string;
  datos: string;
  categoria: CategoriaEspacio;
}

interface EventoEspacial {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const AÑO_MIN = 1903;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1200;
const MARGEN_IZQ = 50;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoEspacio[] = [
  {
    id: 1,
    periodo: '1903–1926',
    anio: 1903,
    anioFin: 1926,
    titulo: 'Pioneros de la Teoría',
    descripcion:
      'Konstantin Tsiolkovski sienta las bases matemáticas del vuelo espacial en 1903 con su ecuación del cohete. Hermann Oberth publica "Die Rakete zu den Planetenräumen" en 1923. Robert Goddard lanza el primer cohete de combustible líquido el 16 de marzo de 1926 en Auburn, Massachusetts.',
    mision: 'Primer cohete de combustible líquido — 12,5 metros de altura, 2,5 segundos de vuelo (Goddard, 1926)',
    protagonista: 'Konstantin Tsiolkovski',
    impacto: 'Establecimiento de los fundamentos matemáticos y físicos del vuelo espacial',
    datos: 'Ecuación de Tsiolkovski: Δv = ve·ln(m0/mf). La velocidad de escape de la Tierra es 11,2 km/s.',
    categoria: 'teoria',
  },
  {
    id: 2,
    periodo: '1926–1944',
    anio: 1926,
    anioFin: 1944,
    titulo: 'Cohetes Experimentales y V-2',
    descripcion:
      'Goddard desarrolla cohetes cada vez más avanzados en Roswell (Nuevo México). La VfR (Verein für Raumschiffahrt), sociedad alemana de cohetes, reúne a jóvenes ingenieros como el adolescente Wernher von Braun. En 1942, el cohete A4/V-2 se convierte en el primer objeto fabricado por el hombre en alcanzar el espacio, a 80 km de altitud.',
    mision: 'A4/V-2 — primer objeto artificial en superar la línea de Kármán (80 km), 1942',
    protagonista: 'Wernher von Braun',
    impacto: 'Demostración de que los cohetes de combustible líquido podían alcanzar el espacio exterior',
    datos: 'El V-2 alcanzaba 5.760 km/h, con una carga útil de 975 kg de explosivos. Más de 3.000 impactaron en Europa occidental.',
    categoria: 'cohetes_v2',
  },
  {
    id: 3,
    periodo: '1944–1957',
    anio: 1944,
    anioFin: 1957,
    titulo: 'Carrera Espacial Comienza',
    descripcion:
      'La Operación Paperclip lleva a científicos alemanes (von Braun y su equipo) a Estados Unidos. La NACA, predecesora de la NASA, lidera los primeros programas aeroespaciales militares. El avión cohete X-15 alcanza 107 km de altitud. El lanzamiento del Sputnik se vislumbra en el horizonte.',
    mision: 'X-15 — avión cohete que alcanza 107 km de altitud, superando la línea de Kármán (1963)',
    protagonista: 'Wernher von Braun (NASA/Fort Bliss)',
    impacto: 'Transferencia de tecnología de cohetes alemana a programas militares y espaciales de EE.UU. y URSS',
    datos: 'Operación Paperclip: 1.600 científicos alemanes reclutados. La NACA se fundó en 1915; NASA en 1958.',
    categoria: 'cohetes_v2',
  },
  {
    id: 4,
    periodo: '1957–1961',
    anio: 1957,
    anioFin: 1961,
    titulo: 'La Era Sputnik',
    descripcion:
      'El 4 de octubre de 1957, la URSS lanza el Sputnik 1 — primer satélite artificial de la historia (83 kg, "bip bip" en las radios del mundo). Laika se convierte en el primer ser vivo en órbita. EE.UU. responde con Explorer 1 (1958) y funda la NASA. El 12 de abril de 1961, Yuri Gagarin completa una órbita completa de la Tierra en 108 minutos a bordo del Vostok 1.',
    mision: 'Vostok 1 — primera vez en la historia que un ser humano abandona la Tierra (12 de abril de 1961)',
    protagonista: 'Yuri Gagarin',
    impacto: 'Demostración definitiva de que el ser humano puede sobrevivir en el espacio',
    datos: 'Gagarin dijo "Поехали! (¡Vamos!)" al despegar. Su vuelo duró 108 minutos. Murió en un accidente de avión en 1968.',
    categoria: 'sputnik',
  },
  {
    id: 5,
    periodo: '1961–1966',
    anio: 1961,
    anioFin: 1966,
    titulo: 'Programa Mercury y Gemini',
    descripcion:
      'Alan Shepard se convierte en el primer americano en el espacio (5 de mayo de 1961, vuelo suborbital de 15 min). John Glenn realiza la primera órbita americana (1962). Valentina Tereshkova se convierte en la primera mujer en el espacio (1963). Alexei Leonov realiza la primera caminata espacial EVA (1965). El programa Gemini domina las técnicas de acoplamiento y EVA necesarias para Apollo.',
    mision: 'Primera caminata espacial EVA — Alexei Leonov, 18 de marzo de 1965 (12 minutos fuera de la nave)',
    protagonista: 'John Glenn',
    impacto: 'Dominio de las técnicas de vuelo espacial tripulado y maniobras orbitales esenciales para llegar a la Luna',
    datos: 'Gemini realizó 10 misiones tripuladas. La primera mujer americana en el espacio, Sally Ride, no voló hasta 1983.',
    categoria: 'carrera_luna',
  },
  {
    id: 6,
    periodo: '1966–1969',
    anio: 1966,
    anioFin: 1969,
    titulo: 'Apollo y la Conquista de la Luna',
    descripcion:
      'Apollo 1 termina en tragedia: 3 astronautas mueren en un incendio en tierra (1967). Apollo 8 orbita la Luna en Nochebuena de 1968 — la famosa foto "Earthrise". El 20 de julio de 1969, Neil Armstrong y Buzz Aldrin aterrizan en el Mar de la Tranquilidad. Unos 600 millones de personas en todo el mundo lo ven en directo. "Un pequeño paso para el hombre, un gran salto para la humanidad."',
    mision: 'Apollo 11 — primer alunizaje tripulado de la historia (20 de julio de 1969)',
    protagonista: 'Neil Armstrong',
    impacto: 'El hito tecnológico, científico y humano más grande de la historia de la exploración',
    datos: '600 millones de espectadores. Armstrong estuvo 2h 31m en la superficie. Recogieron 21,5 kg de muestras lunares.',
    categoria: 'apollo',
  },
  {
    id: 7,
    periodo: '1969–1972',
    anio: 1969,
    anioFin: 1972,
    titulo: 'Las Misiones Apollo Restantes',
    descripcion:
      'Apollo 12 al 17 continúan la exploración lunar. Apollo 13 (1970) sufre una explosión en el módulo de servicio — "Houston, tenemos un problema" — y regresa milagrosamente a la Tierra. El Lunokhod soviético (1970) opera en la Luna por teleguiado. Apollo 15-17 llevan el Lunar Roving Vehicle. El programa termina con Apollo 17 (diciembre 1972).',
    mision: 'Apollo 13 — regreso milagroso de la Luna después de la explosión del tanque de oxígeno (abril 1970)',
    protagonista: 'Jim Lovell (Apollo 13)',
    impacto: 'Exploración científica sistemática de la Luna y desarrollo de ingeniería de emergencia espacial',
    datos: '382 kg de muestras lunares recogidas en total. 12 hombres caminaron por la Luna. Ningún ser humano ha vuelto desde 1972.',
    categoria: 'apollo',
  },
  {
    id: 8,
    periodo: '1972–1981',
    anio: 1972,
    anioFin: 1981,
    titulo: 'Estaciones Espaciales y Transbordador',
    descripcion:
      'Las estaciones Salyut soviéticas (1971–1986) demuestran la habitabilidad a largo plazo. Skylab (EE.UU., 1973–1974) hace experimentos en microgravedad. La misión Apollo-Soyuz (1975) simboliza la distensión de la Guerra Fría en el espacio. Voyager 1 y 2 (1977) se dirigen al exterior del sistema solar. El primer transbordador espacial, Columbia, vuela el 12 de abril de 1981.',
    mision: 'Apollo-Soyuz (1975) — primer acoplamiento internacional en el espacio, símbolo de distensión USA-URSS',
    protagonista: 'Equipo URSS-EE.UU. Apollo-Soyuz',
    impacto: 'Transición de misiones individuales a presencia permanente en el espacio y cooperación internacional',
    datos: 'Voyager 1 salió del sistema solar en 2012 (límite heliopausa). Aún transmite datos a 23.000 millones de km de la Tierra.',
    categoria: 'transbordador',
  },
  {
    id: 9,
    periodo: '1981–1993',
    anio: 1981,
    anioFin: 1993,
    titulo: 'Era del Transbordador Espacial',
    descripcion:
      'El programa Shuttle realiza 135 misiones a lo largo de 30 años. El 28 de enero de 1986, el Challenger explota 73 segundos después del lanzamiento — 7 astronautas muertos, incluida la maestra Christa McAuliffe. La estación Mir soviética (1986–2001) permanece 15 años en órbita. El Telescopio Espacial Hubble (1990) tiene un defecto óptico corregido en la histórica misión de reparación de 1993.',
    mision: 'Reparación del Hubble Space Telescope (diciembre 1993) — la más compleja misión EVA de la historia',
    protagonista: 'Christa McAuliffe (víctima del Challenger, símbolo de la tragedia espacial)',
    impacto: 'El Shuttle democratiza el acceso al espacio; la tragedia del Challenger redefine los protocolos de seguridad',
    datos: 'Challenger: junta tórica del SRB fallida por bajas temperaturas. El Hubble ha tomado más de 1,5 millones de observaciones.',
    categoria: 'transbordador',
  },
  {
    id: 10,
    periodo: '1993–2010',
    anio: 1993,
    anioFin: 2010,
    titulo: 'ISS y Exploración de Marte',
    descripcion:
      'La Estación Espacial Internacional (ISS) comienza su ensamblaje en 1998 y tiene presencia humana continua desde noviembre de 2000. Mars Pathfinder y el rover Sojourner llegan a Marte en 1997. Spirit y Opportunity aterrizan en 2004 — planificados para 90 días, Opportunity opera 15 años. SpaceX es fundada por Elon Musk en 2002 y lanza su primer Falcon 1 a órbita en 2008.',
    mision: 'Rover Opportunity en Marte — planificado para 90 días, operó 15 años hasta 2019',
    protagonista: 'Opportunity rover (NASA/JPL)',
    impacto: 'La ISS como laboratorio científico permanente; inicio de la revolución privada espacial con SpaceX',
    datos: 'La ISS orbita a 408 km de altitud a 27.600 km/h. Opportunity recorrió 45,16 km en Marte. SpaceX recaudó su primera financiación con 100 M$ de Musk.',
    categoria: 'estaciones',
  },
  {
    id: 11,
    periodo: '2010–2015',
    anio: 2010,
    anioFin: 2015,
    titulo: 'SpaceX Comienza la Revolución',
    descripcion:
      'La cápsula Dragon de SpaceX atraca en la ISS en 2012 — primera nave privada en hacerlo. El 21 de diciembre de 2015, el Falcon 9 aterriza verticalmente en Cape Canaveral tras entregar satélites a órbita — el primer cohete orbital reutilizable de la historia. El rover Curiosity (900 kg) llega a Marte en 2012 y sigue operativo. Blue Origin lanza New Shepard.',
    mision: 'Aterrizaje vertical del Falcon 9 (21 de diciembre de 2015) — primer cohete orbital reutilizable de la historia',
    protagonista: 'Elon Musk / SpaceX',
    impacto: 'Reducción drástica del coste por kilogramo a órbita; inicio del modelo de lanzadores reutilizables',
    datos: 'El coste por kg a LEO bajó de ~$54.500 (Shuttle) a ~$2.700 (Falcon 9 reutilizable). Curiosity lleva más de 30 km en Marte.',
    categoria: 'privado',
  },
  {
    id: 12,
    periodo: '2015–2020',
    anio: 2015,
    anioFin: 2020,
    titulo: 'New Space y Comercialización',
    descripcion:
      'Falcon Heavy (2018) lanza el Tesla Roadster de Musk al espacio como carga útil de prueba. La India alcanza la órbita de Marte con Mangalyaan en 2014. Crew Dragon vuela su primera misión tripulada a la ISS en 2020 (Demo-2), poniendo fin a la dependencia exclusiva de Soyuz para llevar astronautas. Virgin Galactic realiza vuelos suborbitales comerciales.',
    mision: 'Crew Dragon Demo-2 (mayo 2020) — primer vuelo tripulado a la ISS en nave privada americana',
    protagonista: 'SpaceX (astronautas Bob Behnken y Doug Hurley)',
    impacto: 'Certificación de naves privadas para vuelos tripulados; EE.UU. recupera capacidad de lanzar astronautas propios',
    datos: 'Falcon Heavy tiene la mayor capacidad de carga de un cohete en servicio: 63.800 kg a LEO. India llegó a Marte con solo 74 M$.',
    categoria: 'privado',
  },
  {
    id: 13,
    periodo: '2020–2023',
    anio: 2020,
    anioFin: 2023,
    titulo: 'Artemis, China y Marte Multipotencia',
    descripcion:
      'Perseverance aterriza en Marte en 2021 y despliega el helicóptero Ingenuity — el primer vuelo motorizado en otro planeta de la historia. Artemis I orbita la Luna sin tripulación (2022). China recupera muestras lunares con Chang\'e 5 (2020, primera muestra lunar desde 1976). India logra el primer alunizaje en el polo sur lunar con Chandrayaan-3 (2023).',
    mision: 'Ingenuity — primer vuelo motorizado en otro planeta (19 de abril de 2021, 39 segundos en Marte)',
    protagonista: 'Equipo Perseverance/Ingenuity (NASA/JPL)',
    impacto: 'Exploración de Marte en nueva dimensión; multipolaridad espacial (EE.UU., China, India, ESA)',
    datos: 'Ingenuity realizó más de 70 vuelos antes de averiarse en 2024. Chang\'e 5 recogió 1,73 kg de muestras lunares.',
    categoria: 'new_space',
  },
  {
    id: 14,
    periodo: '2023–presente',
    anio: 2023,
    anioFin: 2025,
    titulo: 'Starship y la Nueva Carrera Lunar',
    descripcion:
      'Starship de SpaceX, el cohete más grande y potente de la historia (120 m de altura, más de 5.000 toneladas en lanzamiento), realiza pruebas exitosas en 2023–2024. Artemis II y III preparan el regreso tripulado a la Luna. China planea misiones lunares tripuladas para 2030. El turismo orbital, las megaconstelaciones de satélites (Starlink) y las misiones privadas a Marte redefinen la economía espacial.',
    mision: 'Starship IFT-4 (junio 2024) — cohete de 120 m aterriza el propulsor Super Heavy y la nave en el océano',
    protagonista: 'Starship de SpaceX',
    impacto: 'Potencial para reducir el coste a órbita en un 90% y hacer viable la colonización de Marte',
    datos: 'Starship produce 7.590 toneladas de empuje — 2x más que el Saturn V de Apollo. Puede llevar 150 toneladas a LEO (reutilizable).',
    categoria: 'new_space',
  },
];

const EVENTOS_ESPACIALES: EventoEspacial[] = [
  { anio: 1926, evento: 'Goddard — primer cohete de combustible líquido, 2,5 segundos de vuelo' },
  { anio: 1957, evento: 'Sputnik 1 — primer satélite artificial de la historia ("bip bip" en las radios del mundo)' },
  { anio: 1961, evento: 'Gagarin — "Поехали!"; primer ser humano en el espacio, 108 minutos de vuelo orbital' },
  { anio: 1969, evento: 'Apollo 11 — Neil Armstrong pisa la Luna; 600 millones de espectadores en directo' },
  { anio: 1986, evento: 'Challenger explota 73 segundos tras el lanzamiento; 7 astronautas muertos' },
  { anio: 1990, evento: 'Hubble Space Telescope en órbita — revoluciona la astronomía desde el espacio' },
  { anio: 2000, evento: 'ISS — presencia humana continua en el espacio desde noviembre de 2000' },
  { anio: 2015, evento: 'Falcon 9 aterriza verticalmente — primera vez en la historia para un cohete orbital' },
  { anio: 2021, evento: 'Ingenuity — primer vuelo motorizado en otro planeta (Marte)' },
];

const ETIQUETAS_CATEGORIA: Record<CategoriaEspacio, string> = {
  teoria: 'Teoría',
  cohetes_v2: 'Cohetes / V-2',
  sputnik: 'Era Sputnik',
  carrera_luna: 'Carrera a la Luna',
  apollo: 'Apollo',
  transbordador: 'Transbordador',
  estaciones: 'Estaciones',
  rovers: 'Rovers',
  privado: 'Era Privada',
  new_space: 'New Space',
};

const COLORES_CATEGORIA: Record<CategoriaEspacio, string> = {
  teoria: '#8B4513',
  cohetes_v2: '#DC143C',
  sputnik: '#CC0000',
  carrera_luna: '#FF8C00',
  apollo: '#DAA520',
  transbordador: '#4169E1',
  estaciones: '#228B22',
  rovers: '#9370DB',
  privado: '#2E86AB',
  new_space: '#48A9A6',
};

// ─────────────────────────────────────────────
// Subcomponente: Panel de detalle (clic en timeline)
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoEspacio }) {
  const color = COLORES_CATEGORIA[periodo.categoria];
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: color }}>
      <h3 className={styles.detalleTitulo} style={{ color }}>{periodo.titulo}</h3>
      <p className={styles.detallePeriodo}>{periodo.periodo}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.protagonistaBox}>
        <span className={styles.protagonistaLabel}>Protagonista</span>
        <span className={styles.protagonistaTexto}>{periodo.protagonista}</span>
      </div>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Descripción</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{periodo.descripcion}</p>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Misión / Hito</h4>
          <ul className={styles.artistasList}>
            <li>{periodo.mision}</li>
          </ul>
          <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Impacto</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{periodo.impacto}</p>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Datos clave</span>
        <p>{periodo.datos}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoEspacio | null>(null);

  const filas: PeriodoEspacio[][] = [[], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anio - b.anio);

  for (const per of ordenados) {
    let asignado = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimo = filas[f][filas[f].length - 1];
      if (!ultimo || anioAX(ultimo.anioFin) + 4 <= anioAX(per.anio)) {
        filas[f].push(per);
        asignado = true;
        break;
      }
    }
    if (!asignado) filas[0].push(per);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  const marcadores = [1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca desde 1903 hasta la actualidad.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de los viajes espaciales"
        >
          <line
            x1={MARGEN_IZQ}
            y1={svgAlto - 16}
            x2={SVG_ANCHO - MARGEN_DER}
            y2={svgAlto - 16}
            stroke="var(--text-muted)"
            strokeWidth={1}
          />

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
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={9} fill="var(--text-muted)" textAnchor="middle">
                {m}
              </text>
            </g>
          ))}

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
                    opacity={esSeleccionado ? 1 : 0.82}
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

      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as CategoriaEspacio[]).map((cat) => (
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

      <div className={styles.movimientoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
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
          <div className={styles.protagonistaBox}>
            <span className={styles.protagonistaLabel}>Protagonista</span>
            <span className={styles.protagonistaTexto}>{periodo.protagonista}</span>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Descripción</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {periodo.descripcion}
              </p>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Misión / Hito principal</h4>
              <ul className={styles.artistasList}>
                <li>{periodo.mision}</li>
              </ul>
              <h4 className={styles.detalleSubtitulo} style={{ marginTop: '0.75rem' }}>Impacto histórico</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>{periodo.impacto}</p>
            </div>
          </div>

          <div className={styles.datosBox}>
            <span className={styles.datosLabel}>Datos clave</span>
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
        <span className={styles.navCounter}>
          {indice + 1} / {PERIODOS.length}
        </span>
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
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaEspacio | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((per) => {
      const coincideCategoria = categoriaFiltro === 'todos' || per.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        !termino ||
        per.titulo.toLowerCase().includes(termino) ||
        per.protagonista.toLowerCase().includes(termino) ||
        per.periodo.toLowerCase().includes(termino);
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
          Todas
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as CategoriaEspacio[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${categoriaFiltro === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
            style={
              categoriaFiltro === cat
                ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] }
                : {}
            }
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período, título o protagonista..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período espacial"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Categoría</th>
              <th>Protagonista</th>
              <th>Misión / Hito</th>
              <th>Impacto</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr key={per.id} style={i % 2 === 0 ? { background: `${COLORES_CATEGORIA[per.categoria]}12` } : {}}>
                <td>
                  <strong style={{ color: COLORES_CATEGORIA[per.categoria] }}>{per.titulo}</strong>
                  <br />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{per.periodo}</span>
                </td>
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
                <td>{per.protagonista}</td>
                <td className={styles.preguntaCell}>{per.mision}</td>
                <td className={styles.preguntaCell}>{per.impacto}</td>
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

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: 'Era de los Pioneros', desde: 1903, hasta: 1956, icono: '🔬' },
  { nombre: 'Era Sputnik', desde: 1957, hasta: 1960, icono: '🛰️' },
  { nombre: 'Carrera a la Luna', desde: 1961, hasta: 1972, icono: '🌕' },
  { nombre: 'Era del Transbordador', desde: 1972, hasta: 2010, icono: '🚀' },
  { nombre: 'Era Privada', desde: 2010, hasta: 2019, icono: '🏭' },
  { nombre: 'New Space', desde: 2020, hasta: 2025, icono: '🌌' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        120 años de exploración espacial organizados en 6 grandes eras, con misiones y protagonistas clave.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anio < era.hasta && p.anioFin > era.desde
          );
          const eventosEra = EVENTOS_ESPACIALES.filter(
            (ev) => ev.anio >= era.desde && ev.anio < era.hasta
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">
                  {era.icono}
                </span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {era.desde} – {era.hasta === 2025 ? 'hoy' : era.hasta}
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

export default function VisualizadorHistoriaViajesEspaciales() {
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
        <h1 className={styles.heroTitle}>Historia de los Viajes Espaciales</h1>
        <p className={styles.heroSubtitle}>
          De los cohetes de Goddard al Starship de SpaceX y la nueva carrera lunar — 14 períodos, 120 años de exploración
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
        title="Historia de los viajes espaciales: períodos y protagonistas"
        subtitle="120 años de exploración espacial: de Tsiolkovski a Starship"
      >
        {/* Sección 1 — Tabla comparativa */}
        <h3>Comparativa de 6 eras clave de la exploración espacial</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Agencia / Actor</th>
                <th>Hito principal</th>
                <th>Coste estimado</th>
                <th>Impacto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pioneros (1903–1956)</strong></td>
                <td>Científicos independientes</td>
                <td>Primer cohete de combustible líquido (Goddard, 1926)</td>
                <td>Miles de dólares (privado)</td>
                <td>Bases matemáticas y físicas del vuelo espacial</td>
              </tr>
              <tr>
                <td><strong>Era Sputnik (1957–1961)</strong></td>
                <td>URSS (OKB-1)</td>
                <td>Sputnik 1 — primer satélite artificial; Gagarin — primer humano en el espacio</td>
                <td>Secreto de estado (URSS)</td>
                <td>Demostración de que el hombre puede sobrevivir en el espacio</td>
              </tr>
              <tr>
                <td><strong>Apollo (1961–1972)</strong></td>
                <td>NASA</td>
                <td>Apollo 11 — primer alunizaje tripulado (julio 1969)</td>
                <td>~25.400 M$ (equivalente a ~280.000 M$ actuales)</td>
                <td>Mayor hito de la exploración humana: la Luna alcanzada</td>
              </tr>
              <tr>
                <td><strong>Transbordador / ISS (1981–2011)</strong></td>
                <td>NASA + ESA + Roscosmos + JAXA + CSA</td>
                <td>135 misiones del Shuttle; ISS habitada continuamente desde 2000</td>
                <td>~200.000 M$ (ISS total, todos los socios)</td>
                <td>Laboratorio permanente en LEO; cooperación internacional</td>
              </tr>
              <tr>
                <td><strong>Era Privada (2010–2019)</strong></td>
                <td>SpaceX, Blue Origin, Virgin Galactic</td>
                <td>Falcon 9 reutilizable (2015); Crew Dragon (2020)</td>
                <td>~$2.700/kg a LEO (Falcon 9 vs. ~$54.500/kg del Shuttle)</td>
                <td>Reducción del coste por kg a órbita en un 95%</td>
              </tr>
              <tr>
                <td><strong>New Space (2020–hoy)</strong></td>
                <td>SpaceX, NASA (Artemis), China (CNSA), India (ISRO)</td>
                <td>Starship, Artemis, rovers en Marte, polo sur lunar</td>
                <td>~$1.000/kg objetivo Starship (reutilizable total)</td>
                <td>Multipolaridad espacial; Marte como destino realista</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>El impacto de la exploración espacial en 4 dimensiones</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
            <div>
              <strong>Impacto tecnológico (spinoffs)</strong>
              <p>La exploración espacial generó tecnologías que usamos a diario: GPS (navegación, Uber, Google Maps), cámaras CMOS (smartphones), espuma de memoria (colchones médicos), filtros de agua (NASA), paneles solares de alta eficiencia, y el velcro (aunque el mito es incorrecto: no fue inventado para la NASA). Los sistemas de seguridad de los coches eléctricos proceden directamente del sistema de gestión de baterías de la ISS.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Impacto geopolítico</strong>
              <p>La carrera espacial fue el campo de batalla simbólico más intenso de la Guerra Fría. El Sputnik aterrizó en Washington como una bomba psicológica: si la URSS podía poner satélites en órbita, podía poner bombas atómicas. La misión Apollo-Soyuz (1975) fue un símbolo de distensión. La ISS es el mayor proyecto de cooperación internacional de la historia — 15 países, incluidos EE.UU. y Rusia, incluso durante tensiones geopolíticas.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🔭</span>
            <div>
              <strong>Impacto científico</strong>
              <p>Los viajes espaciales revolucionaron la astrofísica (Hubble, JWST), la geología planetaria (muestras lunares, Curiosity en Marte), la cosmología (satélites COBE y Planck midiendo el fondo de microondas) y la biología (experimentos de microgravedad en la ISS). El descubrimiento de agua líquida bajo el polo sur de Marte (2018, radar MARSIS en Mars Express) fue posible gracias a misiones espaciales.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💰</span>
            <div>
              <strong>Impacto comercial</strong>
              <p>La economía espacial global vale ~630.000 M$ anuales (2023). Starlink de SpaceX ya da internet de baja latencia a 3 millones de usuarios en 100 países — incluyendo barcos, aviones y zonas rurales sin fibra. El turismo orbital (SpaceX, Blue Origin) cobra entre 450.000 $ (Blue Origin suborbital) y 55 millones $ (SpaceX a la ISS). Los satélites de observación de la Tierra detectan incendios, deforestación y cosechas en tiempo real.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre los viajes espaciales</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué los cohetes modernos son reutilizables y los anteriores no?</strong>
            <p>Los cohetes del Apollo y el Shuttle eran parcialmente o completamente desechables por limitaciones técnicas y económicas de la época: el aluminio ligero era caro de recuperar y los motores no soportaban múltiples encendidos sin revisión completa. SpaceX resolvió el problema con motores Merlin que pueden quemarse 10+ veces sin mantenimiento mayor, navegación GPS de alta precisión para el aterrizaje, y patas desplegables de carbono. El aterrizaje vertical del Falcon 9 fue posible gracias a décadas de mejoras en acelerómetros, giroscopios y software de control.</p>
            <span className={styles.faqTip}>El Falcon 9 puede reutilizar su primera etapa hasta 20 veces. El Starship apunta a la reutilización total en menos de una hora.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuánto cuesta ir al espacio como turista en 2024?</strong>
            <p>Los precios dependen del destino: Blue Origin ofrece vuelos suborbitales (3 minutos de ingravidez, altitud de ~100 km) desde ~450.000 $. Virgin Galactic cobra ~600.000 $ por su SpaceShipTwo (altitud similar). Un vuelo a la ISS con SpaceX (Crew Dragon, 10-14 días) cuesta en torno a 55 millones $ por asiento, con la logística de Axiom Space. SpaceX ha anunciado vuelos polares (órbita alta con vistas al espacio) por precios similares. El objetivo de Starship es llevar el coste a órbita a menos de 1 millón $ por persona.</p>
            <span className={styles.faqTip}>El turismo espacial orbital es hoy accesible solo para multimillonarios. Elon Musk estima que Starship podría bajar el coste a la ISS a 100.000 $ por persona en la próxima década.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo llegará el ser humano a Marte?</strong>
            <p>NASA planea la primera misión tripulada a Marte en la década de 2040 con el programa Gateway (estación orbital lunar) como paso intermedio. SpaceX es más ambiciosa: Elon Musk ha hablado de 2029 para el primer Starship sin tripulación a Marte, y antes de 2035 para los primeros humanos. La principal dificultad es la radiación cósmica durante el trayecto de 6-9 meses (la ISS está protegida por el campo magnético terrestre), la salud ósea y muscular en microgravedad, y la producción de oxígeno y combustible in situ (ISRU — In-Situ Resource Utilization).</p>
            <span className={styles.faqTip}>MOXIE, experimento a bordo de Perseverance, ya produjo oxígeno en Marte en 2021 — demostración a escala de lo que necesitaría una misión tripulada.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el punto de Lagrange y por qué el James Webb está ahí?</strong>
            <p>Los puntos de Lagrange son 5 posiciones en el espacio donde las fuerzas gravitacionales del Sol y la Tierra se equilibran con la fuerza centrífuga, permitiendo a un objeto mantenerse estacionario respecto a ambos. El L2 (Tierra-Sol) está a 1,5 millones de km detrás de la Tierra (mirando desde el Sol). El JWST orbita L2 porque: 1) está siempre en la misma posición relativa a la Tierra (comunicaciones fáciles), 2) el parasol puede bloquear siempre el Sol y la Tierra simultáneamente, enfriando los detectores de infrarrojos a -233 °C, y 3) no consume combustible para mantener su órbita.</p>
            <span className={styles.faqTip}>A diferencia del Hubble (550 km de órbita), el JWST en L2 no puede ser reparado por astronautas. Fue diseñado para durar al menos 10 años con el combustible de maniobra; las estimaciones actuales apuntan a 20+.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre órbita LEO, MEO y GEO?</strong>
            <p>Las órbitas se clasifican por altitud: LEO (Low Earth Orbit, 160–2.000 km) incluye la ISS (408 km), Starlink y satélites de observación; la latencia de señal es baja (~20 ms). MEO (2.000–35.786 km) es donde orbitan los satélites GPS (~20.200 km). GEO (Geostationary Orbit, exactamente 35.786 km) es donde los satélites de TV y telecomunicaciones parecen estacionarios respecto a la Tierra (uno por franja horaria); la latencia es alta (~600 ms). Las misiones lunares y a Marte van mucho más allá: la Luna está a 384.400 km.</p>
            <span className={styles.faqTip}>La ISS está en LEO baja porque la propulsión requerida para altitudes mayores sería prohibitiva con el Shuttle. También disfruta de protección parcial del cinturón de Van Allen contra la radiación cósmica.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo seguir las misiones espaciales en tiempo real</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>NASA App y NASA TV (gratuito)</strong>
              <p>La app oficial de la NASA transmite lanzamientos, EVAs (paseos espaciales), actividades de la ISS y briefings científicos en directo y bajo demanda. NASA+ (streaming) está disponible sin suscripción en EE.UU. Los lanzamientos de Atlas V, Falcon 9 y SLS se retransmiten con comentarios técnicos en directo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>SpaceX Webcast (YouTube)</strong>
              <p>El canal de YouTube de SpaceX retransmite todos sus lanzamientos con cobertura técnica desde T-60 minutos. Las retransmisiones del aterrizaje del Falcon 9 y las pruebas del Starship en Boca Chica (Texas) son especialmente espectaculares. No te pierdas los "padre reusó" (comentaristas internos de SpaceX).</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>ISS Detector y Heavens-Above (rastreo en tiempo real)</strong>
              <p>ISS Detector (app móvil) te avisa cuándo la ISS pasa sobre tu ciudad, visible a simple vista como un punto luminoso muy rápido (demasiado rápido para ser un avión). Heavens-Above (web) calcula el paso de más de 20.000 satélites en órbita, incluyendo el Hubble y los satélites Starlink. La ISS pasa cada ~90 minutos.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>ESA y JAXA (misiones europeas y japonesas)</strong>
              <p>La Agencia Espacial Europea (ESA) y la agencia japonesa JAXA tienen excelentes canales de YouTube y webs de seguimiento de misiones. Las misiones de la ESA incluyen Juice (a las lunas de Júpiter), ExoMars (en pausa) y los satélites Sentinel de observación de la Tierra. JAXA ha recuperado muestras de asteroides con Hayabusa2.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Stellarium y SkySafari (astronomía amateur)</strong>
              <p>Stellarium (web y app gratuita) es un planetario virtual con tiempo real que muestra qué planetas, satélites y estrellas son visibles desde tu ubicación. SkySafari añade datos de misiones históricas y permite apuntar físicamente el dispositivo al cielo para identificar lo que ves. Ambas apps muestran el trayecto de la ISS y los satélites Starlink.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips + warningBox */}
        <h3>Datos que sorprenden sobre el espacio</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📐</span>
            <p>La ISS está a solo 408 km de altitud — menos que la distancia Madrid-Barcelona (620 km). Pero para alcanzar esa órbita se necesita una velocidad de 27.600 km/h. La distancia no es el problema: la velocidad orbital lo es.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌙</span>
            <p>Ningún ser humano ha salido de la órbita terrestre baja desde Apollo 17 (diciembre de 1972). Han pasado más de 50 años sin que nadie regrese a la Luna. Artemis III, planeado para no antes de 2026, sería el primer alunizaje tripulado desde entonces.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <p>El cohete Saturn V del Apollo fue el más potente jamás construido hasta el Starship (2023). Generaba 3.400 toneladas de empuje; Starship genera 7.590 toneladas — más del doble. En peso total, Saturn V pesaba 2.970 toneladas; Starship pesa 5.000 toneladas en lanzamiento.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏃</span>
            <p>Voyager 1, lanzado en 1977, es el objeto hecho por el hombre más lejano del Sol: a más de 23.000 millones de km (155 UA). La señal de radio tarda más de 22 horas en llegar a la Tierra. Cruzó la heliopausa (el límite del sistema solar) en 2012 y sigue transmitiendo datos.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <strong>El espacio es más cercano de lo que parece — pero infinitamente más difícil de alcanzar</strong>
          <ul>
            <li>La <strong>línea de Kármán</strong> (100 km) está a menos altitud que Madrid–Barcelona (620 km), pero alcanzarla requiere velocidades de 5.000 km/h para un vuelo suborbital y 28.000 km/h para una órbita estable. La distancia no es el obstáculo; la energía cinética lo es.</li>
            <li>El espacio no es "vacío": la órbita baja (LEO) está llena de <strong>más de 27.000 objetos catalogados</strong> (satélites activos, etapas de cohete, fragmentos de colisiones). El problema del Kessler (colisiones en cadena) es una amenaza real para la exploración espacial futura.</li>
            <li>Los <strong>tiempos de vuelo a Marte</strong> varían enormemente según la ventana de lanzamiento (cada 26 meses): entre 6 y 9 meses de trayecto. Una vez en Marte, habría que esperar 14–16 meses para la siguiente ventana de regreso — los astronautas estarían fuera de la Tierra un total de 2,5–3 años.</li>
            <li>El <strong>coste real de Apollo 11</strong> (misión individual) fue de ~355 millones $ de 1969, equivalentes a ~3.000 millones de dólares actuales. El programa Apollo completo costó unos 25.400 millones $, equivalentes a unos 280.000 millones de dólares actuales — aproximadamente el 4% del PIB de EE.UU. en 1969.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-viajes-espaciales')} />
      <ShareCard appName="visualizador-historia-viajes-espaciales" />
      <Footer appName="visualizador-historia-viajes-espaciales" />
    </div>
  );
}
