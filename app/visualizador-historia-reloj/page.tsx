'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './VisualizadorHistoriaReloj.module.css';
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
// Tipos e interfaces
// ─────────────────────────────────────────────

interface HitoHistorico {
  id: string;
  titulo: string;
  icono: string;
  anioReal: string;
  horaReloj: string;
  minutosDesde0: number; // minutos transcurridos desde medianoche en el reloj de 24h
  color: string;
  descripcion: string;
  datoSorprendente: string;
  categoria: 'origenes' | 'neolitico' | 'civilizacion' | 'clasica' | 'medieval' | 'moderna' | 'contemporanea';
}

// ─────────────────────────────────────────────
// Cálculo de posición en el reloj
// El reloj de 24h = 300.000 años
// 1 hora = 12.500 años
// 1 minuto = ~208,3 años
// 1 segundo = ~3,47 años
// ─────────────────────────────────────────────

const ANOS_TOTALES = 300000;
const MINUTOS_TOTALES = 24 * 60; // 1440

function anosAMinutos(anosAtras: number): number {
  return ((ANOS_TOTALES - anosAtras) / ANOS_TOTALES) * MINUTOS_TOTALES;
}

function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = Math.floor(minutos % 60);
  const s = Math.floor((minutos % 1) * 60);
  if (s > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Hitos históricos (15)
// ─────────────────────────────────────────────

const HITOS: HitoHistorico[] = [
  {
    id: 'homo-sapiens',
    titulo: 'Aparece el Homo sapiens',
    icono: '🦴',
    anioReal: 'Hace ~300.000 años',
    horaReloj: '00:00',
    minutosDesde0: 0,
    color: '#8B5E3C',
    descripcion: 'En el norte de África (Marruecos, yacimiento de Jebel Irhoud) aparecen los primeros fósiles reconocibles como Homo sapiens. Son anatómicamente modernos pero aún viven exactamente igual que todos sus ancestros: caza, recolección, pequeños grupos nómadas.',
    datoSorprendente: 'Todos los seres humanos vivos hoy compartimos un ancestro común que vivió hace ~200.000 años, llamado informalmente "Eva mitocondrial". Y toda la Historia que conocemos (escritura, guerras, civilizaciones) cabe en el último 0,08% de nuestra existencia como especie.',
    categoria: 'origenes',
  },
  {
    id: 'fuego-control',
    titulo: 'Control del fuego como herramienta cotidiana',
    icono: '🔥',
    anioReal: 'Hace ~250.000 años',
    horaReloj: minutosAHora(anosAMinutos(250000)),
    minutosDesde0: anosAMinutos(250000),
    color: '#E05A00',
    descripcion: 'Aunque el uso del fuego es aún más antiguo, hacia este período su uso habitual ya está documentado en múltiples lugares del mundo. El fuego permite cocinar alimentos (lo que libera más calorías y puede haber aumentado el tamaño del cerebro), proporciona calor y protección, y permite vivir en noches más largas alrededor del fuego — posiblemente el origen del lenguaje complejo y las historias.',
    datoSorprendente: 'Cocinar puede haber sido clave en la evolución humana: al ablandar los alimentos, nuestros dientes y mandíbulas se volvieron más pequeños (menos músculo masticador = más espacio craneal para el cerebro). Somos la única especie que cocina sistemáticamente.',
    categoria: 'origenes',
  },
  {
    id: 'arte-rupestre',
    titulo: 'Arte rupestre: primeras pinturas conocidas',
    icono: '🎨',
    anioReal: 'Hace ~45.000 años',
    horaReloj: minutosAHora(anosAMinutos(45000)),
    minutosDesde0: anosAMinutos(45000),
    color: '#C0392B',
    descripcion: 'Las cuevas de Sulawesi (Indonesia) contienen pinturas de cerdos que datan de hace ~45.500 años — las más antiguas conocidas. En Europa, Chauvet (Francia) tiene pinturas de ~36.000 años. El arte rupestre implica pensamiento simbólico abstracto: la capacidad de representar la realidad, planificar el futuro y compartir ideas a través de imágenes.',
    datoSorprendente: 'La cueva de Altamira (España) fue descubierta en 1879, pero los arqueólogos no creían que los humanos prehistóricos pudieran haber hecho algo tan sofisticado. Tardaron 20 años en aceptar su autenticidad. Las pinturas son tan perfectas que parecen modernas.',
    categoria: 'origenes',
  },
  {
    id: 'migracion-america',
    titulo: 'Llegada del ser humano a América',
    icono: '🌎',
    anioReal: 'Hace ~20.000 años',
    horaReloj: minutosAHora(anosAMinutos(20000)),
    minutosDesde0: anosAMinutos(20000),
    color: '#27AE60',
    descripcion: 'Los primeros humanos cruzan el puente terrestre de Bering (hoy Estrecho de Bering) desde Siberia hacia Alaska durante la última glaciación, cuando el nivel del mar era ~120 metros más bajo. En pocos miles de años colonizan todo el continente americano, desde Alaska hasta la Patagonia.',
    datoSorprendente: 'En ~5.000 años los humanos poblaron toda América: desde el Ártico hasta la Tierra del Fuego. Es la migración terrestre más rápida documentada en la historia humana, recorriendo ~20.000 km de extremo a extremo del continente.',
    categoria: 'origenes',
  },
  {
    id: 'agricultura',
    titulo: 'Revolución Agrícola: domesticación de plantas y animales',
    icono: '🌾',
    anioReal: 'Hace ~12.000 años (10.000 a.C.)',
    horaReloj: minutosAHora(anosAMinutos(12000)),
    minutosDesde0: anosAMinutos(12000),
    color: '#F39C12',
    descripcion: 'En el Creciente Fértil (actual Oriente Próximo) los humanos comienzan a cultivar trigo, cebada y a domesticar cabras, ovejas y vacas. Este cambio es absolutamente revolucionario: por primera vez en 300.000 años, los humanos controlan su fuente de alimento en lugar de depender de la naturaleza. Surgen los primeros asentamientos permanentes.',
    datoSorprendente: 'La agricultura fue un mal negocio para el individuo: los agricultores del Neolítico eran más bajos, más enfermizos y vivían menos que los cazadores-recolectores. Pero permitió poblaciones mucho mayores. Pasamos de ~5 millones de personas en el mundo a ~500 millones en pocos miles de años.',
    categoria: 'neolitico',
  },
  {
    id: 'primeras-ciudades',
    titulo: 'Primeras ciudades: Uruk y Mesopotamia',
    icono: '🏛️',
    anioReal: 'Hace ~6.000 años (4.000 a.C.)',
    horaReloj: minutosAHora(anosAMinutos(6000)),
    minutosDesde0: anosAMinutos(6000),
    color: '#D4A017',
    descripcion: 'Uruk (actual Irak) se convierte en la primera ciudad propiamente dicha, con decenas de miles de habitantes, templos monumentales, mercados organizados y una clase gobernante. La concentración de personas genera nuevos problemas: ¿cómo repartir el grano? ¿cómo registrar las deudas? La respuesta a estas preguntas lleva a la invención de la escritura.',
    datoSorprendente: 'Uruk llegó a tener ~80.000 habitantes hacia el año 3.000 a.C. — más que muchas ciudades europeas medievales mil años después. Era la ciudad más grande del mundo durante siglos y tenía un sistema de alcantarillado más sofisticado que algunas ciudades del siglo XIX.',
    categoria: 'civilizacion',
  },
  {
    id: 'escritura',
    titulo: 'Invención de la escritura',
    icono: '✍️',
    anioReal: 'Hace ~5.200 años (3.200 a.C.)',
    horaReloj: minutosAHora(anosAMinutos(5200)),
    minutosDesde0: anosAMinutos(5200),
    color: '#8E44AD',
    descripcion: 'Los sumerios inventan la escritura cuneiforme en Mesopotamia, inicialmente para registros contables: cuántas jarras de aceite, cuántas cabezas de ganado. Casi simultáneamente, los egipcios inventan los jeroglíficos. La escritura permite transmitir información a través del tiempo y el espacio sin que esté presente quien la creó — es la primera tecnología de almacenamiento de información.',
    datoSorprendente: 'El texto escrito más antiguo del mundo no es un poema épico ni una ley sagrada. Es una lista de raciones de cebada: "37 meses de cebada para trabajadores del templo". La primera escritura fue, literalmente, una hoja de cálculo.',
    categoria: 'civilizacion',
  },
  {
    id: 'piramides',
    titulo: 'Construcción de las Pirámides de Giza',
    icono: '🔺',
    anioReal: 'Hace ~4.500 años (2.560 a.C.)',
    horaReloj: minutosAHora(anosAMinutos(4500)),
    minutosDesde0: anosAMinutos(4500),
    color: '#E8A020',
    descripcion: 'La Gran Pirámide de Keops se construye con ~2,3 millones de bloques de piedra de entre 2 y 80 toneladas. Durante 3.800 años fue la estructura más alta del mundo. Su construcción implica una organización logística extraordinaria: decenas de miles de trabajadores, ingeniería de precisión, gestión de recursos a escala industrial.',
    datoSorprendente: 'Las pirámides son tan antiguas que Cleopatra (69-30 a.C.) estaba temporalmente más cerca de nosotros que de los constructores de las pirámides. Para Cleopatra, las pirámides ya eran monumentos arqueológicos de hacía 2.500 años, igual que para nosotros el Imperio Romano.',
    categoria: 'civilizacion',
  },
  {
    id: 'imperio-romano',
    titulo: 'Apogeo del Imperio Romano',
    icono: '🦅',
    anioReal: 'Hace ~2.000 años (Siglo I d.C.)',
    horaReloj: minutosAHora(anosAMinutos(2000)),
    minutosDesde0: anosAMinutos(2000),
    color: '#C0392B',
    descripcion: 'En el siglo I d.C., el Imperio Romano controla desde Escocia hasta Mesopotamia, con ~70 millones de habitantes (25% de la población mundial). Construyen 80.000 km de carreteras, sistemas de agua potable en ciudades, leyes codificadas y un sistema postal que tardará 1.800 años en ser superado. Roma es una ciudad de más de un millón de habitantes.',
    datoSorprendente: 'El hormigón romano es más resistente que el moderno: algunos puertos construidos hace 2.000 años aún están intactos bajo el agua del Mediterráneo. Tardamos 1.700 años en redescubrir la técnica. El secreto: agua de mar volcánica que reacciona con las cenizas para crear cristales que se fortalecen con el tiempo.',
    categoria: 'clasica',
  },
  {
    id: 'imprenta',
    titulo: 'Invención de la imprenta de tipos móviles',
    icono: '📚',
    anioReal: 'Año 1440 d.C.',
    horaReloj: minutosAHora(anosAMinutos(585)),
    minutosDesde0: anosAMinutos(585),
    color: '#2980B9',
    descripcion: 'Johannes Gutenberg perfecciona la imprenta de tipos móviles en Maguncia (Alemania). En 50 años, el número de libros en Europa pasa de unos pocos miles a más de 10 millones. Es la primera revolución de la información de la Historia: por primera vez, el conocimiento puede copiarse rápidamente y llegar a toda la sociedad, no solo a élites y clérigos.',
    datoSorprendente: 'Antes de Gutenberg, copiar la Biblia a mano tardaba entre 1 y 3 años. Después, una imprenta podía producir 200 páginas por hora. En 50 años se imprimieron más libros que en los mil años anteriores. La imprenta hizo posible la Reforma Protestante, la Revolución Científica y la Ilustración.',
    categoria: 'medieval',
  },
  {
    id: 'revolucion-cientifica',
    titulo: 'Revolución Científica: Newton y el método científico',
    icono: '🍎',
    anioReal: 'Año 1687 d.C.',
    horaReloj: minutosAHora(anosAMinutos(338)),
    minutosDesde0: anosAMinutos(338),
    color: '#1ABC9C',
    descripcion: 'Isaac Newton publica los Principia Mathematica, estableciendo las leyes del movimiento y la gravitación universal. Por primera vez en la historia, las mismas leyes matemáticas explican tanto la caída de una manzana como el movimiento de los planetas. Comienza la era de la ciencia como método sistemático para entender el universo.',
    datoSorprendente: 'Newton inventó el cálculo (simultaneamente con Leibniz), la óptica moderna y la mecánica clásica. Pero también escribió más sobre alquimia y teología que sobre física. La versión "racional" de Newton es en parte un mito posterior: era un hombre de su tiempo, convencido de que descifrar la naturaleza era descifrar el plan de Dios.',
    categoria: 'moderna',
  },
  {
    id: 'revolucion-industrial',
    titulo: 'Revolución Industrial: máquina de vapor',
    icono: '⚙️',
    anioReal: 'Hacia 1760-1840 d.C.',
    horaReloj: minutosAHora(anosAMinutos(200)),
    minutosDesde0: anosAMinutos(200),
    color: '#7F8C8D',
    descripcion: 'James Watt mejora la máquina de vapor (1769) y desencadena la industrialización en Gran Bretaña. Por primera vez en la historia, la humanidad tiene acceso a energía que no depende del músculo animal o humano, del viento o del agua. La producción industrial, los ferrocarriles y las fábricas transforman radicalmente la sociedad, la economía y la demografía mundiales.',
    datoSorprendente: 'En el año 1800, el 90% de la humanidad vivía en pobreza extrema. En el año 2023, menos del 10%. Esta reducción sin precedentes ocurrió en su mayor parte después de la Revolución Industrial. En 200 años (el último minuto del reloj) la humanidad transformó más sus condiciones de vida que en los 300 siglos anteriores.',
    categoria: 'moderna',
  },
  {
    id: 'electricidad-masiva',
    titulo: 'Electricidad y luz eléctrica masiva',
    icono: '💡',
    anioReal: 'Hacia 1880-1900 d.C.',
    horaReloj: minutosAHora(anosAMinutos(130)),
    minutosDesde0: anosAMinutos(130),
    color: '#F1C40F',
    descripcion: 'Thomas Edison y Nikola Tesla democratizan la electricidad. Las ciudades dejan de necesitar luz de gas o velas: por primera vez en 300.000 años de historia humana, la oscuridad nocturna deja de ser una limitación real. La electricidad transforma la industria, las comunicaciones (telégrafo, teléfono) y la vida cotidiana de forma irreversible.',
    datoSorprendente: 'En 1900, menos del 2% de los hogares estadounidenses tenían electricidad. En 1950, el 94%. El cambio más rápido en la historia de la humanidad hasta ese momento. Hoy, los ~700 millones de personas sin acceso a electricidad (2023) son el número más bajo en términos proporcionales de toda la historia.',
    categoria: 'moderna',
  },
  {
    id: 'segunda-guerra',
    titulo: 'Segunda Guerra Mundial y bomba atómica',
    icono: '☢️',
    anioReal: '1939-1945 d.C.',
    horaReloj: minutosAHora(anosAMinutos(80)),
    minutosDesde0: anosAMinutos(80),
    color: '#E74C3C',
    descripcion: 'La guerra más destructiva de la historia: ~70-85 millones de muertos (3-4% de la población mundial). En agosto de 1945, EE.UU. lanza bombas atómicas sobre Hiroshima y Nagasaki. Por primera vez, una sola especie tiene capacidad de destruir toda la vida compleja en la Tierra. El período posterior crea la ONU, la Declaración Universal de Derechos Humanos y la Unión Europea.',
    datoSorprendente: 'Desde 1945 no ha habido guerras entre potencias nucleares. Los historiadores llaman a este período "La Gran Paz" o "Pax Atomica". La amenaza de destrucción mutua asegurada (MAD) puede haber sido el mayor inhibidor de conflictos entre grandes potencias de toda la historia humana.',
    categoria: 'contemporanea',
  },
  {
    id: 'internet',
    titulo: 'Internet y la Web para todos',
    icono: '🌐',
    anioReal: 'Hacia 1991-1995 d.C.',
    horaReloj: minutosAHora(anosAMinutos(30)),
    minutosDesde0: anosAMinutos(30),
    color: '#2E86AB',
    descripcion: 'Tim Berners-Lee inventa la World Wide Web en 1991 y la hace pública. En pocos años, internet pasa de ser una red académica y militar a una infraestructura global de comunicación. En 2023 hay 5.400 millones de usuarios de internet — el 67% de la humanidad. Por primera vez en la historia, prácticamente todo el conocimiento humano acumulado es accesible a cualquier persona en segundos.',
    datoSorprendente: 'Internet tiene 30 años (en el reloj: el último décimo de segundo). La imprenta tiene 580 años. La escritura tiene 5.200 años. Y llevamos 300.000 años siendo Homo sapiens. Todo lo que consideramos "normal" — ciudades, países, ciencia, tecnología — es un destello en la historia de nuestra especie.',
    categoria: 'contemporanea',
  },
];

// ─────────────────────────────────────────────
// Colores por categoría
// ─────────────────────────────────────────────

const COLORES_CATEGORIA: Record<HitoHistorico['categoria'], string> = {
  origenes: '#8B5E3C',
  neolitico: '#F39C12',
  civilizacion: '#D4A017',
  clasica: '#C0392B',
  medieval: '#2980B9',
  moderna: '#7F8C8D',
  contemporanea: '#2E86AB',
};

const ETIQUETAS_CATEGORIA: Record<HitoHistorico['categoria'], string> = {
  origenes: 'Orígenes',
  neolitico: 'Neolítico',
  civilizacion: 'Primeras civilizaciones',
  clasica: 'Antigüedad clásica',
  medieval: 'Edad Media',
  moderna: 'Edad Moderna',
  contemporanea: 'Era contemporánea',
};

// ─────────────────────────────────────────────
// Componente del reloj SVG
// ─────────────────────────────────────────────

interface RelojProps {
  hitoActivo: string;
  onHitoClick: (id: string) => void;
}

function RelojHistoria({ hitoActivo, onHitoClick }: RelojProps) {
  const cx = 200;
  const cy = 200;
  const radio = 165;
  const radioMarcas = 178;
  const radioIconos = 148;

  return (
    <svg
      viewBox="0 0 400 400"
      className={styles.relojSvg}
      role="img"
      aria-label="Reloj de 24 horas con la historia de la humanidad"
    >
      {/* Fondo del reloj */}
      <circle cx={cx} cy={cy} r={radio + 18} fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r={radio + 12} fill="none" stroke="var(--primary)" strokeWidth="1" opacity="0.25" />
      <circle cx={cx} cy={cy} r={radio} fill="none" stroke="var(--border)" strokeWidth="1" />

      {/* Marcas de horas (24h) */}
      {Array.from({ length: 24 }).map((_, h) => {
        const angulo = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const r1 = radio;
        const r2 = radio + 10;
        const x1 = cx + r1 * Math.cos(angulo);
        const y1 = cy + r1 * Math.sin(angulo);
        const x2 = cx + r2 * Math.cos(angulo);
        const y2 = cy + r2 * Math.sin(angulo);
        const xtxt = cx + (radioMarcas + 6) * Math.cos(angulo);
        const ytxt = cy + (radioMarcas + 6) * Math.sin(angulo);
        return (
          <g key={h}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={h % 6 === 0 ? 'var(--primary)' : 'var(--border)'} strokeWidth={h % 6 === 0 ? 2 : 1} />
            {h % 6 === 0 && (
              <text x={xtxt} y={ytxt} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="var(--text-muted)" fontWeight="600">
                {String(h).padStart(2, '0')}:00
              </text>
            )}
          </g>
        );
      })}

      {/* Arco de "toda la historia" (de 00:00 a 23:59:59) — casi completo */}
      <circle
        cx={cx}
        cy={cy}
        r={radio - 15}
        fill="none"
        stroke="var(--secondary)"
        strokeWidth="3"
        strokeOpacity="0.12"
        strokeDasharray={`${2 * Math.PI * (radio - 15)}`}
      />

      {/* Hitos en el reloj */}
      {HITOS.map((hito) => {
        const angulo = (hito.minutosDesde0 / MINUTOS_TOTALES) * 2 * Math.PI - Math.PI / 2;
        const radioPos = radio - 8;
        const xPos = cx + radioPos * Math.cos(angulo);
        const yPos = cy + radioPos * Math.sin(angulo);
        const esActivo = hitoActivo === hito.id;
        const radioCirculo = esActivo ? 9 : 6;

        return (
          <g key={hito.id} onClick={() => onHitoClick(hito.id)} style={{ cursor: 'pointer' }}>
            <circle
              cx={xPos}
              cy={yPos}
              r={radioCirculo + 4}
              fill="transparent"
            />
            <circle
              cx={xPos}
              cy={yPos}
              r={radioCirculo}
              fill={esActivo ? hito.color : 'var(--bg-card)'}
              stroke={hito.color}
              strokeWidth={esActivo ? 0 : 2}
              style={{ filter: esActivo ? `drop-shadow(0 0 4px ${hito.color})` : undefined }}
            />
            {esActivo && (
              <text x={xPos} y={yPos} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="white" fontWeight="700">
                {hito.icono}
              </text>
            )}
          </g>
        );
      })}

      {/* Manecilla marcando el hito activo */}
      {(() => {
        const hitoData = HITOS.find(h => h.id === hitoActivo);
        if (!hitoData) return null;
        const angulo = (hitoData.minutosDesde0 / MINUTOS_TOTALES) * 2 * Math.PI - Math.PI / 2;
        const xFin = cx + (radio - 35) * Math.cos(angulo);
        const yFin = cy + (radio - 35) * Math.sin(angulo);
        return (
          <line
            x1={cx}
            y1={cy}
            x2={xFin}
            y2={yFin}
            stroke={hitoData.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
        );
      })()}

      {/* Centro del reloj */}
      <circle cx={cx} cy={cy} r={7} fill="var(--primary)" />
      <circle cx={cx} cy={cy} r={3} fill="white" />

      {/* Texto central */}
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="8" fill="var(--text-muted)">
        300.000 años
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" fontSize="7" fill="var(--text-muted)">
        = 24 horas
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHistoriaRelojPage() {
  const [hitoActivo, setHitoActivo] = useState<string>(HITOS[0].id);
  const detalleRef = useRef<HTMLDivElement>(null);

  const hito = HITOS.find(h => h.id === hitoActivo)!;

  function seleccionarHito(id: string) {
    setHitoActivo(id);
  }

  useEffect(() => {
    // Scroll suave al detalle en móvil al cambiar hito desde la lista
    if (detalleRef.current && window.innerWidth < 768) {
      detalleRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [hitoActivo]);

  const idxActual = HITOS.findIndex(h => h.id === hitoActivo);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Historia de la Humanidad en un Reloj</h1>
          <p className={styles.subtitle}>
            Si los 300.000 años del Homo sapiens fueran un día de 24 horas, toda la civilización cabría en los últimos 8 minutos
          </p>
        </header>

        <LegalNotice />

        {/* Introducción */}
        <div className={styles.intro}>
          <p>
            Somos una especie de <strong>300.000 años</strong>. Pero la agricultura tiene solo 12.000,
            la escritura 5.200, la imprenta 580, y <strong>tú llevas leyendo esto menos de lo que dura un latido
            en este reloj</strong>. Haz clic en cualquier hito para explorar cada momento.
          </p>
        </div>

        {/* Layout principal: reloj + lista */}
        <div className={styles.layoutPrincipal}>

          {/* Reloj */}
          <div className={styles.relojWrapper}>
            <RelojHistoria hitoActivo={hitoActivo} onHitoClick={seleccionarHito} />
            <p className={styles.relojLeyenda}>
              Haz clic en los puntos del reloj para explorar cada hito
            </p>
          </div>

          {/* Lista de hitos */}
          <div className={styles.listaHitos}>
            {HITOS.map((h) => (
              <button
                key={h.id}
                type="button"
                className={`${styles.hitoBtn} ${hitoActivo === h.id ? styles.hitoBtnActivo : ''}`}
                onClick={() => seleccionarHito(h.id)}
                aria-pressed={hitoActivo === h.id}
                style={hitoActivo === h.id ? { borderLeftColor: h.color } : undefined}
              >
                <span className={styles.hitoBtnIcono} aria-hidden="true">{h.icono}</span>
                <span className={styles.hitoBtnInfo}>
                  <span className={styles.hitoBtnHora} style={{ color: h.color }}>{h.horaReloj}</span>
                  <span className={styles.hitoBtnTitulo}>{h.titulo}</span>
                  <span className={styles.hitoBtnAnio}>{h.anioReal}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalle del hito activo */}
        <div
          ref={detalleRef}
          className={styles.hitoDetalle}
          style={{ borderLeftColor: hito.color }}
        >
          <div className={styles.hitoDetalleHeader}>
            <span className={styles.hitoDetalleIcono} aria-hidden="true">{hito.icono}</span>
            <div>
              <span
                className={styles.hitoDetalleCategoria}
                style={{ backgroundColor: `${COLORES_CATEGORIA[hito.categoria]}20`, color: COLORES_CATEGORIA[hito.categoria] }}
              >
                {ETIQUETAS_CATEGORIA[hito.categoria]}
              </span>
              <div className={styles.hitoDetalleHora} style={{ color: hito.color }}>
                En el reloj: {hito.horaReloj} · {hito.anioReal}
              </div>
              <h2 className={styles.hitoDetalleTitulo}>{hito.titulo}</h2>
            </div>
          </div>

          <p className={styles.hitoDetalleTexto}>{hito.descripcion}</p>

          <div className={styles.hitoDatoBrillante}>
            <span className={styles.hitoDatoLabel}>Dato que cambia la perspectiva</span>
            <p>{hito.datoSorprendente}</p>
          </div>

          {/* Navegación */}
          <div className={styles.hitoNav}>
            <button
              type="button"
              className={styles.hitoNavBtn}
              onClick={() => { if (idxActual > 0) seleccionarHito(HITOS[idxActual - 1].id); }}
              disabled={idxActual === 0}
            >
              ← Anterior
            </button>
            <span className={styles.hitoNavInfo}>{idxActual + 1} / {HITOS.length}</span>
            <button
              type="button"
              className={styles.hitoNavBtn}
              onClick={() => { if (idxActual < HITOS.length - 1) seleccionarHito(HITOS[idxActual + 1].id); }}
              disabled={idxActual === HITOS.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>

        {/* Escala de perspectiva */}
        <div className={styles.escalaSection}>
          <h3 className={styles.escalaTitulo}>La brevedad de la civilización</h3>
          <div className={styles.escalaBarra}>
            {[
              { label: 'Homo sapiens', anios: 300000, color: '#8B5E3C', pct: 100 },
              { label: 'Agricultura', anios: 12000, color: '#F39C12', pct: 4 },
              { label: 'Escritura', anios: 5200, color: '#8E44AD', pct: 1.73 },
              { label: 'Imp. Romano', anios: 2000, color: '#C0392B', pct: 0.67 },
              { label: 'Imprenta', anios: 585, color: '#2980B9', pct: 0.195 },
              { label: 'Rev. Industrial', anios: 200, color: '#7F8C8D', pct: 0.067 },
              { label: 'Internet', anios: 30, color: '#2E86AB', pct: 0.01 },
            ].map((item) => (
              <div key={item.label} className={styles.escalaFila}>
                <span className={styles.escalaEtiqueta}>{item.label}</span>
                <div className={styles.escalaBarraWrapper}>
                  <div
                    className={styles.escalaBarraFill}
                    style={{ width: `${Math.max(item.pct, 0.3)}%`, backgroundColor: item.color }}
                    title={`${item.anios.toLocaleString('es-ES')} años`}
                  />
                </div>
                <span className={styles.escalaAnios}>{item.anios >= 1000 ? `${(item.anios / 1000).toLocaleString('es-ES')}k` : item.anios} años</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cifra clave */}
        <div className={styles.insight}>
          <p>
            El 99,92% de nuestra existencia como especie fue cazando y recolectando en pequeños grupos nómadas.
            Toda la historia que estudiamos en el colegio — imperios, guerras, inventos, revoluciones — cabe
            en el <strong>0,08% final</strong>. Y tú estás en el último instante de ese 0,08%.
          </p>
        </div>

        <EducationalSection
          title="¿Qué nos enseña la perspectiva histórica?"
          subtitle="Por qué comprimir el tiempo cambia cómo pensamos en el presente"
          defaultOpen={false}
        >
          <h3>El sesgo del presente: por qué nos parece que vivimos en una época "especial"</h3>
          <p>
            Cada generación cree que vive en el momento más importante, más cambiante o más peligroso de la historia.
            Esta ilusión tiene un nombre: <strong>sesgo de recencia</strong>. Comprimir 300.000 años en un reloj
            ayuda a calibrar este sesgo: hay épocas en que la humanidad tardó 100.000 años en cambiar el diseño
            de una herramienta de piedra. La "aceleración" que sentimos es real, pero forma parte de una tendencia
            que empezó hace 12.000 años con la agricultura.
          </p>

          <h3>La "Gran Aceleración" de los últimos 200 años</h3>
          <p>
            El último minuto del reloj (desde la Revolución Industrial) concentra más cambio material que los 23
            horas y 59 minutos anteriores. La esperanza de vida pasó de ~30 años a ~73 globalmente.
            La mortalidad infantil de ~40% a ~4%. La alfabetización de ~10% a ~87%. La pobreza extrema
            de ~90% a ~9%. Ninguna generación anterior en 300.000 años vivió una transformación equivalente.
          </p>

          <h3>El tiempo libre: el regalo más reciente</h3>
          <p>
            Un cazador-recolector del Paleolítico trabajaba unas 20-25 horas semanales para cubrir sus necesidades.
            Un campesino medieval, unas 60-70 horas. Un obrero de la Revolución Industrial podía llegar a 80.
            Solo con la electrificación, las lavadoras, la agricultura industrial y las 40 horas semanales (siglo XX)
            el tiempo libre volvió a ser accesible para la mayoría. El ocio masivo es una invención del siglo XX.
          </p>

          <h3>¿Cuánto dura realmente una civilización?</h3>
          <p>
            Mesopotamia duró ~3.000 años. Egipto antiguo ~3.000 años. Roma ~1.000 años como potencia dominante.
            El Imperio Otomano ~600 años. Estados Unidos lleva ~250 años. La Unión Europea ~70 años.
            En el reloj de 24 horas, ninguna civilización conocida dura más de unos pocos minutos.
            Y la nuestra (tecnológica, globalizada, democrática) lleva en el reloj menos de 30 segundos.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota educativa:</strong> las fechas de hitos prehistóricos (arte rupestre, agricultura, Homo sapiens)
            son aproximadas y sujetas a revisión con nuevos descubrimientos arqueológicos. Las dataciones mencionadas
            corresponden a consensos científicos actuales (2024). Para el reloj de 24 horas se toma como referencia
            ~300.000 años de antigüedad del Homo sapiens anatómicamente moderno.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-historia-reloj')} />
        <ShareCard appName="visualizador-historia-reloj" />
        <Footer appName="visualizador-historia-reloj" />
      </div>
    </>
  );
}
