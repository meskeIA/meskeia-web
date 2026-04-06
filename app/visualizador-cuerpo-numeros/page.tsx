'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCuerpoNumeros.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'estructura' | 'sistemas' | 'micro' | 'records';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'estructura', titulo: 'Estructura', icono: '🦴', subtitulo: 'Huesos, músculos, órganos y células' },
  { id: 'sistemas', titulo: 'Sistemas en acción', icono: '❤️', subtitulo: 'Lo que tu cuerpo hace cada día' },
  { id: 'micro', titulo: 'A nivel micro', icono: '🔬', subtitulo: 'Células, neuronas y ADN' },
  { id: 'records', titulo: 'Récords', icono: '🏆', subtitulo: 'Curiosidades que no creerás' },
];

// ─────────────────────────────────────────────
// Datos: Estructura
// ─────────────────────────────────────────────

interface BloqueEstructura {
  icono: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  porcentaje: number;
  color: string;
  curiosidad: string;
}

const ESTRUCTURA_DATOS: BloqueEstructura[] = [
  {
    icono: '🦴', nombre: 'Huesos', cantidad: 206, unidad: 'huesos',
    porcentaje: 15, color: '#E8D8C4',
    curiosidad: 'El más pequeño: el estribo del oído (3 mm). El más grande: el fémur (48 cm). Un bebé nace con unos 270 huesos que se fusionan con el tiempo.',
  },
  {
    icono: '💪', nombre: 'Músculos', cantidad: 640, unidad: 'músculos',
    porcentaje: 40, color: '#E74C3C',
    curiosidad: 'El más fuerte: el masetero (mandíbula), capaz de ejercer 70 kg de fuerza. El más pequeño: el estapedio (1 mm), protege el oído de sonidos fuertes.',
  },
  {
    icono: '🫁', nombre: 'Órganos', cantidad: 78, unidad: 'órganos',
    porcentaje: 7, color: '#48A9A6',
    curiosidad: 'El más grande: la piel (2 m², 3-4 kg). El más pesado interno: el hígado (1,5 kg). El intestino delgado mide 6-7 metros.',
  },
  {
    icono: '🧬', nombre: 'Células', cantidad: 37_200_000_000_000, unidad: 'células',
    porcentaje: 100, color: '#2E86AB',
    curiosidad: '37,2 billones de células trabajando en equipo. Se renuevan constantemente: produces 3,8 millones de células nuevas cada segundo.',
  },
];

// ─────────────────────────────────────────────
// Datos: Sistemas en acción (diario)
// ─────────────────────────────────────────────

interface StatDiario {
  icono: string;
  nombre: string;
  valor: number;
  unidad: string;
  equivalencia: string;
  porcentajeBarra: number;
  color: string;
}

const STATS_DIARIOS: StatDiario[] = [
  {
    icono: '❤️', nombre: 'Latidos del corazón', valor: 100000, unidad: 'latidos/día',
    equivalencia: 'En una vida: 2.500 millones de latidos sin descanso',
    porcentajeBarra: 100, color: '#E74C3C',
  },
  {
    icono: '🫁', nombre: 'Respiraciones', valor: 25000, unidad: 'respiraciones/día',
    equivalencia: 'Mueves unos 11.000 litros de aire cada día',
    porcentajeBarra: 75, color: '#3498DB',
  },
  {
    icono: '🩸', nombre: 'Distancia de la sangre', valor: 19000, unidad: 'km/día',
    equivalencia: 'Casi la mitad de la circunferencia de la Tierra (40.075 km)',
    porcentajeBarra: 95, color: '#C0392B',
  },
  {
    icono: '💧', nombre: 'Saliva producida', valor: 1.5, unidad: 'litros/día',
    equivalencia: 'En toda tu vida: suficiente para llenar 2 piscinas',
    porcentajeBarra: 30, color: '#2ECC71',
  },
  {
    icono: '👁️', nombre: 'Parpadeos', valor: 10000, unidad: 'parpadeos/día',
    equivalencia: 'Pasas un 10% del día con los ojos cerrados sin darte cuenta',
    porcentajeBarra: 60, color: '#9B59B6',
  },
  {
    icono: '🧠', nombre: 'Pensamientos', valor: 60000, unidad: 'pensamientos/día',
    equivalencia: 'Unos 2.500 por hora. El 95% son repetitivos',
    porcentajeBarra: 85, color: '#F39C12',
  },
];

// ─────────────────────────────────────────────
// Datos: A nivel micro
// ─────────────────────────────────────────────

interface DatoMicro {
  icono: string;
  titulo: string;
  cifra: string;
  descripcion: string;
  comparacion: string;
}

const DATOS_MICRO: DatoMicro[] = [
  {
    icono: '🧬', titulo: 'Células totales',
    cifra: '37,2 billones',
    descripcion: 'Cada una con su propia maquinaria molecular completa.',
    comparacion: 'Si contaras 1 célula por segundo, tardarías 1,2 millones de años.',
  },
  {
    icono: '🧠', titulo: 'Neuronas',
    cifra: '86.000 millones',
    descripcion: 'Tantas como estrellas en la Vía Láctea.',
    comparacion: 'Conectadas por 150 billones de sinapsis: más conexiones que estrellas en 1.500 galaxias.',
  },
  {
    icono: '🔗', titulo: 'Sinapsis',
    cifra: '150 billones',
    descripcion: 'Cada neurona puede conectar con hasta 10.000 vecinas.',
    comparacion: 'La red más compleja conocida en el universo.',
  },
  {
    icono: '🧵', titulo: 'ADN por célula',
    cifra: '2 metros',
    descripcion: 'Si desenrollas el ADN de UNA célula, mide 2 metros.',
    comparacion: 'ADN total de tu cuerpo: 2 × 37,2 billones = ida y vuelta al Sol... 600 veces.',
  },
  {
    icono: '🌌', titulo: 'ADN total',
    cifra: 'Sol a Plutón ×4',
    descripcion: 'Todo el ADN de tu cuerpo puesto en línea llegaría más allá del sistema solar.',
    comparacion: 'Unos 74.000 millones de km. Plutón está a 5.900 millones de km del Sol.',
  },
  {
    icono: '🔴', titulo: 'Glóbulos rojos',
    cifra: '25 billones',
    descripcion: 'Cada segundo produces 2,4 millones de nuevos glóbulos rojos.',
    comparacion: 'Apilados uno sobre otro formarían una torre de 50.000 km de alto.',
  },
];

// ─────────────────────────────────────────────
// Datos: Récords y curiosidades
// ─────────────────────────────────────────────

interface RecordCuriosidad {
  icono: string;
  titulo: string;
  dato: string;
  explicacion: string;
}

const RECORDS: RecordCuriosidad[] = [
  {
    icono: '⚡', titulo: 'Velocidad nerviosa',
    dato: '120 m/s',
    explicacion: 'Las señales nerviosas más rápidas viajan a 432 km/h. Más rápido que un tren de alta velocidad.',
  },
  {
    icono: '🧪', titulo: 'Ácido estomacal',
    dato: 'pH 1,5',
    explicacion: 'Tan fuerte que puede disolver metal. El estómago se protege renovando su mucosa cada 3-4 días.',
  },
  {
    icono: '👃', titulo: 'Olfato',
    dato: '1 billón de olores',
    explicacion: 'Tu nariz puede distinguir un billón de olores diferentes. Mucho más potente de lo que se creía.',
  },
  {
    icono: '🦴', titulo: 'Huesos vs acero',
    dato: '5× más resistentes',
    explicacion: 'Peso por peso, el hueso es 5 veces más resistente que el acero. Un cm³ soporta 10.000 kg.',
  },
  {
    icono: '🫀', titulo: 'Regeneración del hígado',
    dato: '6 semanas',
    explicacion: 'El hígado puede regenerarse a su tamaño completo en solo 6 semanas tras perder hasta el 75% de su masa.',
  },
  {
    icono: '👁️', titulo: 'Resolución del ojo',
    dato: '576 megapíxeles',
    explicacion: 'El ojo humano equivale a una cámara de 576 megapíxeles. Distingue unos 10 millones de colores.',
  },
  {
    icono: '🫁', titulo: 'Superficie pulmonar',
    dato: '70 m²',
    explicacion: 'Si extendieras todos los alvéolos de tus pulmones, cubrirían una pista de tenis completa.',
  },
  {
    icono: '🩸', titulo: 'Vasos sanguíneos',
    dato: '100.000 km',
    explicacion: 'Si pusieras todos tus vasos sanguíneos en línea, darían 2,5 vueltas a la Tierra.',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Estructura
// ─────────────────────────────────────────────

function SeccionEstructura() {
  const [expandido, setExpandido] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cuerpo es una obra de ingeniería con <strong>206 huesos, 640 músculos, 78 órganos</strong> y <strong>37,2 billones de células</strong> trabajando en perfecta coordinación.</p>
      </div>

      {/* Bloques proporcionales */}
      <div className={styles.bloquesProporcionales}>
        {ESTRUCTURA_DATOS.map((dato, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.bloqueItem} ${expandido === i ? styles.bloqueExpandido : ''}`}
            style={{
              flex: dato.porcentaje <= 15 ? 1.5 : dato.porcentaje <= 40 ? 3 : dato.porcentaje <= 50 ? 1 : 4,
              borderLeftColor: dato.color,
            }}
            onClick={() => setExpandido(expandido === i ? null : i)}
            aria-expanded={expandido === i}
            aria-label={`${dato.nombre}: ${dato.cantidad > 1000000 ? '37,2 billones' : formatNumber(dato.cantidad, 0)} ${dato.unidad}`}
          >
            <span className={styles.bloqueIcono} aria-hidden="true">{dato.icono}</span>
            <span className={styles.bloqueNumero} style={{ color: dato.color }}>
              {dato.cantidad > 1000000000 ? '37,2 B' : formatNumber(dato.cantidad, 0)}
            </span>
            <span className={styles.bloqueNombre}>{dato.nombre}</span>
            {expandido === i && (
              <div className={styles.bloqueCuriosidad}>
                <p>{dato.curiosidad}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Composición visual */}
      <div className={styles.composicionCard}>
        <h3 className={styles.composicionTitulo}>Composición por peso</h3>
        <div className={styles.composicionBarra}>
          <div className={styles.composicionSegmento} style={{ flex: 40, background: '#E74C3C' }} title="Músculos: 40%">
            <span className={styles.composicionLabel}>Músculos 40%</span>
          </div>
          <div className={styles.composicionSegmento} style={{ flex: 15, background: '#E8D8C4' }} title="Huesos: 15%">
            <span className={styles.composicionLabel}>Huesos 15%</span>
          </div>
          <div className={styles.composicionSegmento} style={{ flex: 25, background: '#F39C12' }} title="Grasa: 25%">
            <span className={styles.composicionLabel}>Grasa 25%</span>
          </div>
          <div className={styles.composicionSegmento} style={{ flex: 11, background: '#3498DB' }} title="Órganos: 11%">
            <span className={styles.composicionLabel}>Órg. 11%</span>
          </div>
          <div className={styles.composicionSegmento} style={{ flex: 9, background: '#48A9A6' }} title="Otros: 9%">
            <span className={styles.composicionLabel}>Otros 9%</span>
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Nacemos con unos <strong>270 huesos</strong> que se van fusionando hasta quedarse en 206 en la edad adulta.
          Más de la mitad de tus huesos (106) están en las manos y los pies.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Sistemas en acción
// ─────────────────────────────────────────────

function SeccionSistemas() {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Sin que te des cuenta, tu cuerpo realiza millones de operaciones cada día. Estas son las cifras de un <strong>día cualquiera</strong>.</p>
      </div>

      <div className={styles.barrasContainer}>
        {STATS_DIARIOS.map((stat, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.barraItem} ${seleccionado === i ? styles.barraSeleccionada : ''}`}
            onClick={() => setSeleccionado(seleccionado === i ? null : i)}
            aria-expanded={seleccionado === i}
          >
            <div className={styles.barraHeader}>
              <span className={styles.barraIcono} aria-hidden="true">{stat.icono}</span>
              <span className={styles.barraNombre}>{stat.nombre}</span>
              <span className={styles.barraValor} style={{ color: stat.color }}>
                {formatNumber(stat.valor, stat.valor < 10 ? 1 : 0)} {stat.unidad}
              </span>
            </div>
            <div className={styles.barraTrack}>
              <div
                className={styles.barraFill}
                style={{ width: `${stat.porcentajeBarra}%`, background: stat.color }}
              />
            </div>
            {seleccionado === i && (
              <div className={styles.barraEquivalencia}>
                <p>{stat.equivalencia}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Tu sangre recorre <strong>{formatNumber(19000, 0)} km cada día</strong>: casi la mitad de la circunferencia
          de la Tierra. En una vida, tu corazón bombea suficiente sangre para llenar 200 vagones cisterna.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: A nivel micro
// ─────────────────────────────────────────────

function SeccionMicro() {
  const [expandido, setExpandido] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>A escala microscópica, tu cuerpo es un universo en sí mismo. Las cifras son tan grandes que resultan <strong>difíciles de imaginar</strong>.</p>
      </div>

      <div className={styles.microGrid}>
        {DATOS_MICRO.map((dato, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.microCard} ${expandido === i ? styles.microExpandido : ''}`}
            onClick={() => setExpandido(expandido === i ? null : i)}
            aria-expanded={expandido === i}
          >
            <span className={styles.microIcono} aria-hidden="true">{dato.icono}</span>
            <span className={styles.microCifra}>{dato.cifra}</span>
            <span className={styles.microTitulo}>{dato.titulo}</span>
            <p className={styles.microDesc}>{dato.descripcion}</p>
            {expandido === i && (
              <div className={styles.microComparacion}>
                <p>{dato.comparacion}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Si pudieras contar <strong>1 célula por segundo</strong>, necesitarías <strong>1,2 millones de años</strong> para
          contarlas todas. Y mientras cuentas, tu cuerpo habrá producido billones de células nuevas.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Récords y curiosidades
// ─────────────────────────────────────────────

function SeccionRecords() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cuerpo esconde <strong>superpoderes</strong> que ni la tecnología actual puede igualar. Estas son algunas de sus hazañas más asombrosas.</p>
      </div>

      <div className={styles.recordsGrid}>
        {RECORDS.map((record, i) => (
          <div key={i} className={styles.recordCard}>
            <div className={styles.recordCabecera}>
              <span className={styles.recordIcono} aria-hidden="true">{record.icono}</span>
              <span className={styles.recordDato}>{record.dato}</span>
            </div>
            <h3 className={styles.recordTitulo}>{record.titulo}</h3>
            <p className={styles.recordExplicacion}>{record.explicacion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El cuerpo humano es la máquina más sofisticada del universo conocido. <strong>Se autorrepara, se adapta
          y funciona 24/7</strong> durante décadas sin necesidad de reinicio.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCuerpoNumerosPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('estructura');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'estructura': return <SeccionEstructura />;
      case 'sistemas': return <SeccionSistemas />;
      case 'micro': return <SeccionMicro />;
      case 'records': return <SeccionRecords />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Tu Cuerpo en Números</h1>
          <p className={styles.subtitle}>Las cifras más asombrosas de la máquina más perfecta del universo</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el cuerpo humano en números"
          subtitle="Preguntas frecuentes y contexto científico"
          defaultOpen={false}
        >
          <h3>¿De dónde salen estos números?</h3>
          <p>
            Las cifras presentadas provienen de estudios científicos de referencia. El conteo celular de 37,2 billones
            se basa en el estudio de Bianconi et al. (2013) publicado en <em>Annals of Human Biology</em>.
            Los datos de neuronas y sinapsis proceden de investigaciones en neurociencia cognitiva.
          </p>

          <h3>¿Todos los cuerpos tienen los mismos números?</h3>
          <p>
            No. Los valores mostrados son <strong>promedios para un adulto sano</strong>. Varían según la edad,
            el sexo, la altura, el peso y la genética. Por ejemplo, los bebés nacen con más huesos (270) que los
            adultos (206), y el número de latidos diarios varía con la forma física.
          </p>

          <h3>¿El ADN realmente llega hasta Plutón?</h3>
          <p>
            Sí, si desenrollas el ADN de cada célula (aprox. 2 metros) y lo multiplicas por 37,2 billones de células,
            obtienes unos 74.400 millones de km. La distancia media de la Tierra a Plutón es de unos 5.900 millones de km,
            así que el ADN total de tu cuerpo llegaría y volvería varias veces.
          </p>

          <h3>¿Cuántas células se renuevan cada día?</h3>
          <p>
            Se estima que tu cuerpo produce unos <strong>330.000 millones de células nuevas cada día</strong>,
            principalmente en el intestino, la sangre y la piel. Algunas células nunca se renuevan,
            como la mayoría de las neuronas y las células del cristalino del ojo.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador presenta datos aproximados con fines educativos y divulgativos.
            Las cifras exactas varían según la fuente científica y el individuo. No constituye información
            médica ni debe usarse con fines diagnósticos.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cuerpo-numeros')} />
        <ShareCard appName="visualizador-cuerpo-numeros" />
        <Footer appName="visualizador-cuerpo-numeros" />
      </div>
    </>
  );
}
