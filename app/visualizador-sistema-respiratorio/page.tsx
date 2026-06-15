'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './SistemaRespiratorio.module.css';
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

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'anatomia' | 'intercambio' | 'volumenes' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'anatomia', titulo: 'Anatomía', icono: '🫁', subtitulo: 'El viaje del aire por tu cuerpo' },
  { id: 'intercambio', titulo: 'Intercambio', icono: '🔄', subtitulo: 'O₂ y CO₂ en los alvéolos' },
  { id: 'volumenes', titulo: 'Volúmenes', icono: '📊', subtitulo: 'Espirometría y capacidades' },
  { id: 'datos', titulo: 'Datos', icono: '🧠', subtitulo: 'Enfermedades y curiosidades' },
];

// ─────────────────────────────────────────────
// Datos — Sección 1: Anatomía
// ─────────────────────────────────────────────

interface ParteAnatomica {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  dato: string;
  colorClass: string;
}

const PARTES_VIA_SUPERIOR: ParteAnatomica[] = [
  {
    id: 'nariz',
    icono: '👃',
    nombre: 'Nariz y boca',
    descripcion: 'Entrada del aire. La nariz filtra partículas con los pelos nasales, calienta el aire a ~37 °C y lo humidifica al 100% de humedad relativa antes de que llegue a los pulmones.',
    dato: 'La nariz puede filtrar partículas de hasta 10 μm (micras). Las más pequeñas llegan hasta los alvéolos.',
    colorClass: 'parteViaAlta',
  },
  {
    id: 'faringe',
    icono: '🔽',
    nombre: 'Faringe',
    descripcion: 'Conducto compartido con el sistema digestivo. La epiglotis actúa como una compuerta: se cierra al tragar para que la comida no entre en las vías respiratorias.',
    dato: 'Cuando "te va por el otro lado" es porque la epiglotis no cerró a tiempo.',
    colorClass: 'parteViaAlta',
  },
  {
    id: 'laringe',
    icono: '🗣️',
    nombre: 'Laringe',
    descripcion: 'Contiene las cuerdas vocales: dos pliegues de tejido que vibran con el aire espirado para producir sonido. También protege la vía aérea durante la deglución.',
    dato: 'Las cuerdas vocales vibran entre 100 Hz (voz grave) y 1.000 Hz (voz aguda). Un tenor puede alcanzar el do agudo a ~520 Hz.',
    colorClass: 'parteViaAlta',
  },
];

const PARTES_VIA_INFERIOR: ParteAnatomica[] = [
  {
    id: 'traquea',
    icono: '⭕',
    nombre: 'Tráquea',
    descripcion: 'Tubo de ~12 cm reforzado con 16-20 anillos de cartílago en forma de C. Los anillos mantienen la tráquea abierta. El interior está recubierto de células ciliadas que barren el moco hacia arriba.',
    dato: 'Los cilios se mueven ~15 veces por segundo, como una escalera mecánica que sube moco y partículas atrapadas.',
    colorClass: 'parteViaBaja',
  },
  {
    id: 'bronquios',
    icono: '🌳',
    nombre: 'Bronquios',
    descripcion: 'La tráquea se bifurca en 2 bronquios principales (uno por pulmón), que se ramifican progresivamente como un árbol invertido: bronquios lobares → segmentarios → subsegmentarios.',
    dato: 'El bronquio derecho es más ancho y vertical que el izquierdo. Por eso los cuerpos extraños aspirados suelen ir al pulmón derecho.',
    colorClass: 'parteViaBaja',
  },
  {
    id: 'bronquiolos',
    icono: '🔬',
    nombre: 'Bronquiolos',
    descripcion: 'Ramas cada vez más finas (< 1 mm de diámetro) sin cartílago, con músculo liso que puede contraerse (broncoespasmo en el asma). Los terminales llevan a los sacos alveolares.',
    dato: 'Hay unas 65.000 ramificaciones bronquiales en cada pulmón.',
    colorClass: 'parteViaBaja',
  },
  {
    id: 'alveolos',
    icono: '🫧',
    nombre: 'Alvéolos',
    descripcion: 'Pequeños sacos de aire de ~0,2 mm rodeados de capilares sanguíneos. Aquí ocurre el intercambio de gases. Su pared tiene solo 1 célula de grosor (~0,5 μm) para facilitar la difusión.',
    dato: `Tienes unos ${formatNumber(300000000, 0)} alvéolos con una superficie total de ~70 m² — equivalente a una pista de tenis.`,
    colorClass: 'parteAlveolo',
  },
];

interface MecanicaInfo {
  id: string;
  titulo: string;
  icono: string;
  descripcion: string;
  diafragma: string;
  costillas: string;
  volumen: string;
  presion: string;
}

const MECANICA: MecanicaInfo[] = [
  {
    id: 'inspiracion',
    titulo: 'Inspiración',
    icono: '⬇️',
    descripcion: 'El diafragma se contrae y baja, los intercostales elevan las costillas → el volumen torácico aumenta → la presión intrapulmonar disminuye → el aire entra.',
    diafragma: 'Se contrae y desciende (se aplana)',
    costillas: 'Se elevan y se abren hacia fuera',
    volumen: 'Aumenta → baja presión interna',
    presion: 'Menor que la atmosférica → aire entra',
  },
  {
    id: 'espiracion',
    titulo: 'Espiración',
    icono: '⬆️',
    descripcion: 'El diafragma se relaja y sube (forma de cúpula), las costillas bajan → el volumen torácico disminuye → la presión intrapulmonar aumenta → el aire sale.',
    diafragma: 'Se relaja y asciende (forma de cúpula)',
    costillas: 'Descienden y se cierran',
    volumen: 'Disminuye → sube presión interna',
    presion: 'Mayor que la atmosférica → aire sale',
  },
];

// ─────────────────────────────────────────────
// Datos — Sección 2: Intercambio gaseoso
// ─────────────────────────────────────────────

interface ComposicionAire {
  gas: string;
  inspirado: number;
  espirado: number;
  unidad: string;
  color: string;
}

const COMPOSICION_AIRE: ComposicionAire[] = [
  { gas: 'Oxígeno (O₂)', inspirado: 21, espirado: 16, unidad: '%', color: '#3B82F6' },
  { gas: 'Dióxido de carbono (CO₂)', inspirado: 0.04, espirado: 4, unidad: '%', color: '#EF4444' },
  { gas: 'Nitrógeno (N₂)', inspirado: 78, espirado: 78, unidad: '%', color: '#9CA3AF' },
  { gas: 'Vapor de agua', inspirado: 0.5, espirado: 6.2, unidad: '%', color: '#06B6D4' },
];

interface ProcesoIntercambio {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  detalle: string;
}

const PROCESOS_INTERCAMBIO: ProcesoIntercambio[] = [
  {
    id: 'difusion',
    icono: '➡️',
    titulo: 'Difusión por gradiente',
    descripcion: 'Los gases se mueven de donde hay más concentración (presión parcial alta) a donde hay menos, sin gastar energía.',
    detalle: 'Presión parcial de O₂ en alvéolo: ~104 mmHg. En sangre venosa: ~40 mmHg. El O₂ pasa al capilar por diferencia de 64 mmHg.',
  },
  {
    id: 'hemoglobina',
    icono: '🔴',
    titulo: 'Hemoglobina: el taxi del O₂',
    descripcion: 'Cada molécula de hemoglobina tiene 4 grupos hemo, cada uno con un átomo de hierro (Fe²⁺) que se une reversiblemente a 1 molécula de O₂.',
    detalle: 'Un glóbulo rojo lleva ~270 millones de moléculas de hemoglobina. Es decir, un solo glóbulo rojo puede transportar ~1.000 millones de moléculas de O₂.',
  },
  {
    id: 'saturacion',
    icono: '💓',
    titulo: 'Saturación de O₂ (SpO₂)',
    descripcion: 'El pulsioxímetro mide qué porcentaje de la hemoglobina lleva O₂. Normal: 95-100%. Por debajo de 90% es hipoxemia.',
    detalle: 'El aparato usa dos luces (roja e infrarroja): la hemoglobina oxigenada absorbe más infrarroja, la desoxigenada absorbe más roja.',
  },
  {
    id: 'co2',
    icono: '💨',
    titulo: 'Transporte de CO₂',
    descripcion: 'El CO₂ viaja disuelto en plasma (7%), unido a hemoglobina (23%) o como bicarbonato HCO₃⁻ (70%). En los alvéolos se libera y se exhala.',
    detalle: 'La enzima anhidrasa carbónica convierte CO₂ + H₂O ↔ H₂CO₃ ↔ HCO₃⁻ + H⁺. Esto también regula el pH de la sangre (7,35-7,45).',
  },
  {
    id: 'altura',
    icono: '⛰️',
    titulo: '¿Por qué en la altura hay menos O₂?',
    descripcion: 'La proporción de O₂ es siempre 21%, pero la presión atmosférica baja con la altitud → hay menos moléculas de O₂ por litro de aire → menos presión parcial.',
    detalle: 'A nivel del mar: presión ~760 mmHg → pO₂ = 160 mmHg. En el Everest (8.848 m): ~253 mmHg → pO₂ = ~53 mmHg. Un tercio del O₂ disponible.',
  },
];

// ─────────────────────────────────────────────
// Datos — Sección 3: Volúmenes pulmonares
// ─────────────────────────────────────────────

interface VolumenPulmonar {
  id: string;
  nombre: string;
  abreviatura: string;
  valor: number;
  unidad: string;
  descripcion: string;
  color: string;
  tipo: 'volumen' | 'capacidad';
}

const VOLUMENES: VolumenPulmonar[] = [
  { id: 'vc', nombre: 'Volumen corriente', abreviatura: 'VT', valor: 500, unidad: 'mL', descripcion: 'Aire que entra y sale en cada respiración normal, en reposo.', color: '#3B82F6', tipo: 'volumen' },
  { id: 'vri', nombre: 'Vol. reserva inspiratoria', abreviatura: 'VRI', valor: 3000, unidad: 'mL', descripcion: 'Aire extra que puedes inspirar tras una inspiración normal (respiración profunda).', color: '#10B981', tipo: 'volumen' },
  { id: 'vre', nombre: 'Vol. reserva espiratoria', abreviatura: 'VRE', valor: 1100, unidad: 'mL', descripcion: 'Aire extra que puedes espirar tras una espiración normal (espiración forzada).', color: '#F59E0B', tipo: 'volumen' },
  { id: 'vr', nombre: 'Volumen residual', abreviatura: 'VR', valor: 1200, unidad: 'mL', descripcion: 'Aire que siempre queda en los pulmones, incluso tras espirar al máximo. Evita que los alvéolos colapsen.', color: '#EF4444', tipo: 'volumen' },
];

const CAPACIDADES: VolumenPulmonar[] = [
  { id: 'cv', nombre: 'Capacidad vital', abreviatura: 'CV', valor: 4600, unidad: 'mL', descripcion: 'Máximo aire que puedes mover: VRI + VT + VRE. Es lo que mide una espirometría.', color: '#8B5CF6', tipo: 'capacidad' },
  { id: 'cpt', nombre: 'Capacidad pulmonar total', abreviatura: 'CPT', valor: 5800, unidad: 'mL', descripcion: 'Todo el aire que cabe en los pulmones: CV + VR. No se puede medir directamente con espirometría.', color: '#EC4899', tipo: 'capacidad' },
];

interface FrecuenciaResp {
  situacion: string;
  icono: string;
  min: number;
  max: number;
}

const FRECUENCIAS: FrecuenciaResp[] = [
  { situacion: 'Reposo', icono: '🧘', min: 12, max: 20 },
  { situacion: 'Ejercicio moderado', icono: '🚶', min: 20, max: 30 },
  { situacion: 'Ejercicio intenso', icono: '🏃', min: 40, max: 60 },
  { situacion: 'Recién nacido', icono: '👶', min: 30, max: 50 },
];

// ─────────────────────────────────────────────
// Datos — Sección 4: Datos y enfermedades
// ─────────────────────────────────────────────

interface DatoFascinante {
  id: string;
  icono: string;
  titulo: string;
  cifra: string;
  descripcion: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { id: 'resp-dia', icono: '🔢', titulo: 'Respiraciones diarias', cifra: '~20.000', descripcion: 'Respiras unas 20.000 veces al día sin pensarlo. Es el sistema nervioso autónomo (bulbo raquídeo) quien controla el ritmo, aunque puedes modularlo voluntariamente.' },
  { id: 'litros', icono: '💨', titulo: 'Litros por minuto', cifra: '7-8 L/min', descripcion: 'En reposo mueves 7-8 litros de aire por minuto. En ejercicio máximo puede llegar a 100-150 litros/min en deportistas de élite.' },
  { id: 'superficie', icono: '🎾', titulo: 'Superficie alveolar', cifra: '~70 m²', descripcion: 'Si pudieras extender todos los alvéolos, cubrirían una pista de tenis. Todo ese área cabe dentro de tu tórax gracias al plegado.' },
  { id: 'pulmon-der', icono: '⚖️', titulo: 'Pulmón derecho vs izquierdo', cifra: '3 vs 2 lóbulos', descripcion: 'El pulmón derecho tiene 3 lóbulos y es más grande. El izquierdo tiene 2 lóbulos y una escotadura (incisura cardíaca) para dejar espacio al corazón.' },
];

interface Enfermedad {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
  mecanismo: string;
  dato: string;
}

const ENFERMEDADES: Enfermedad[] = [
  {
    id: 'asma',
    icono: '😤',
    nombre: 'Asma',
    descripcion: 'Los bronquiolos se inflaman y se estrechan (broncoespasmo). El músculo liso se contrae y se produce exceso de moco.',
    mecanismo: 'Luz bronquial reducida → mayor resistencia al flujo de aire → sibilancias (silbido al espirar) → disnea.',
    dato: 'Afecta a ~300 millones de personas en el mundo. Es reversible con broncodilatadores (inhalador azul).',
  },
  {
    id: 'epoc',
    icono: '🚬',
    nombre: 'EPOC',
    descripcion: 'Enfermedad pulmonar obstructiva crónica. Incluye enfisema (destrucción de alvéolos) y bronquitis crónica (inflamación persistente).',
    mecanismo: 'Daño irreversible por tabaco o contaminantes → pérdida de elasticidad pulmonar → atrapamiento de aire → dificultad para exhalar.',
    dato: 'El tabaco causa ~80-90% de los casos de EPOC. Es la 3ª causa de muerte en el mundo (OMS).',
  },
  {
    id: 'neumotorax',
    icono: '💥',
    nombre: 'Neumotórax',
    descripcion: 'Entra aire en el espacio pleural (entre el pulmón y la pared torácica). El pulmón pierde la presión negativa que lo mantiene expandido.',
    mecanismo: 'Aire en espacio pleural → presión positiva → colapso del pulmón (total o parcial) → dolor torácico súbito + disnea.',
    dato: 'Puede ocurrir espontáneamente en personas altas y delgadas, o por traumatismo. Se trata drenando el aire con un tubo.',
  },
  {
    id: 'apnea',
    icono: '😴',
    nombre: 'Apnea del sueño',
    descripcion: 'La vía aérea se obstruye repetidamente durante el sueño (apnea obstructiva), interrumpiendo la respiración durante 10+ segundos, decenas de veces por hora.',
    mecanismo: 'Relajación de los músculos faríngeos → colapso de la vía aérea → microdespertares → sueño fragmentado → somnolencia diurna.',
    dato: 'Afecta al ~4% de hombres y ~2% de mujeres adultos. Se trata con CPAP (presión positiva continua).',
  },
  {
    id: 'covid',
    icono: '🦠',
    nombre: 'COVID-19 y los pulmones',
    descripcion: 'El SARS-CoV-2 entra por el receptor ACE2 (abundante en los neumocitos tipo II alveolares) y daña la membrana alvéolo-capilar.',
    mecanismo: 'Inflamación masiva → líquido en alvéolos → síndrome de distrés respiratorio agudo (SDRA) → fallo en el intercambio de gases.',
    dato: 'Los casos graves necesitaron ventilación mecánica. Las secuelas pulmonares ("COVID persistente") incluyen fibrosis y disnea residual.',
  },
];

interface Curiosidad {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
}

const CURIOSIDADES: Curiosidad[] = [
  {
    id: 'bostezo',
    icono: '🥱',
    titulo: 'El bostezo',
    descripcion: 'No es por falta de O₂. La teoría actual más aceptada es que el bostezo enfría el cerebro: la mandíbula abierta cambia el flujo sanguíneo craneal y el aire fresco inspirado baja la temperatura cerebral.',
  },
  {
    id: 'buceo',
    icono: '🤿',
    titulo: 'Peligros del buceo',
    descripcion: 'Si subes demasiado rápido, los gases disueltos en sangre (N₂ sobre todo) forman burbujas al bajar la presión: enfermedad descompresiva. A mucha profundidad, el N₂ produce narcosis (euforia peligrosa).',
  },
  {
    id: 'hipo',
    icono: '🫢',
    titulo: 'El hipo',
    descripcion: 'Es una contracción involuntaria del diafragma seguida de cierre brusco de la glotis (produce el sonido). Puede causarlo comer rápido, bebidas gaseosas o irritación del nervio frénico.',
  },
];

// ─────────────────────────────────────────────
// Sub-componentes de sección
// ─────────────────────────────────────────────

function SeccionAnatomia() {
  const [parteActiva, setParteActiva] = useState<string | null>(null);
  const [mecanicaActiva, setMecanicaActiva] = useState<string>('inspiracion');

  const parteSeleccionada = [...PARTES_VIA_SUPERIOR, ...PARTES_VIA_INFERIOR].find(p => p.id === parteActiva);
  const mecanicaSeleccionada = MECANICA.find(m => m.id === mecanicaActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El aire recorre un camino de ~25 cm desde la nariz hasta los alvéolos. Cada estructura tiene una función específica: <strong>filtrar, calentar, conducir e intercambiar gases</strong>.</p>
      </div>

      <p className={styles.instruccion}>Pulsa cada parte para ver los detalles</p>

      {/* SVG Esquema del aparato respiratorio */}
      <div className={styles.anatomiaContainer}>
        <svg viewBox="0 0 400 520" className={styles.anatomiasSvg} role="img" aria-label="Esquema del aparato respiratorio humano">
          {/* Nariz */}
          <g
            className={`${styles.svgParte} ${parteActiva === 'nariz' ? styles.svgParteActiva : ''}`}
            onClick={() => setParteActiva(parteActiva === 'nariz' ? null : 'nariz')}
            role="button"
            tabIndex={0}
            aria-label="Nariz y boca"
            onKeyDown={e => e.key === 'Enter' && setParteActiva(parteActiva === 'nariz' ? null : 'nariz')}
          >
            <ellipse cx="200" cy="50" rx="30" ry="20" className={styles.svgNariz} />
            <text x="245" y="55" className={styles.svgLabel}>👃 Nariz</text>
          </g>

          {/* Faringe */}
          <g
            className={`${styles.svgParte} ${parteActiva === 'faringe' ? styles.svgParteActiva : ''}`}
            onClick={() => setParteActiva(parteActiva === 'faringe' ? null : 'faringe')}
            role="button"
            tabIndex={0}
            aria-label="Faringe"
            onKeyDown={e => e.key === 'Enter' && setParteActiva(parteActiva === 'faringe' ? null : 'faringe')}
          >
            <rect x="185" y="80" width="30" height="30" rx="5" className={styles.svgFaringe} />
            <text x="230" y="100" className={styles.svgLabel}>🔽 Faringe</text>
          </g>

          {/* Laringe */}
          <g
            className={`${styles.svgParte} ${parteActiva === 'laringe' ? styles.svgParteActiva : ''}`}
            onClick={() => setParteActiva(parteActiva === 'laringe' ? null : 'laringe')}
            role="button"
            tabIndex={0}
            aria-label="Laringe"
            onKeyDown={e => e.key === 'Enter' && setParteActiva(parteActiva === 'laringe' ? null : 'laringe')}
          >
            <polygon points="185,120 215,120 220,150 180,150" className={styles.svgLaringe} />
            <text x="230" y="140" className={styles.svgLabel}>🗣️ Laringe</text>
          </g>

          {/* Tráquea */}
          <g
            className={`${styles.svgParte} ${parteActiva === 'traquea' ? styles.svgParteActiva : ''}`}
            onClick={() => setParteActiva(parteActiva === 'traquea' ? null : 'traquea')}
            role="button"
            tabIndex={0}
            aria-label="Tráquea"
            onKeyDown={e => e.key === 'Enter' && setParteActiva(parteActiva === 'traquea' ? null : 'traquea')}
          >
            <rect x="188" y="155" width="24" height="80" rx="8" className={styles.svgTraquea} />
            {/* Anillos cartilaginosos */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line key={i} x1="188" y1={165 + i * 12} x2="212" y2={165 + i * 12} className={styles.svgAnillo} />
            ))}
            <text x="225" y="195" className={styles.svgLabel}>⭕ Tráquea</text>
          </g>

          {/* Bronquios */}
          <g
            className={`${styles.svgParte} ${parteActiva === 'bronquios' ? styles.svgParteActiva : ''}`}
            onClick={() => setParteActiva(parteActiva === 'bronquios' ? null : 'bronquios')}
            role="button"
            tabIndex={0}
            aria-label="Bronquios"
            onKeyDown={e => e.key === 'Enter' && setParteActiva(parteActiva === 'bronquios' ? null : 'bronquios')}
          >
            <path d="M200,235 Q170,260 140,280" className={styles.svgBronquio} fill="none" strokeWidth="8" />
            <path d="M200,235 Q230,260 260,280" className={styles.svgBronquio} fill="none" strokeWidth="8" />
            <text x="60" y="265" className={styles.svgLabel}>🌳 Bronquios</text>
          </g>

          {/* Bronquiolos */}
          <g
            className={`${styles.svgParte} ${parteActiva === 'bronquiolos' ? styles.svgParteActiva : ''}`}
            onClick={() => setParteActiva(parteActiva === 'bronquiolos' ? null : 'bronquiolos')}
            role="button"
            tabIndex={0}
            aria-label="Bronquiolos"
            onKeyDown={e => e.key === 'Enter' && setParteActiva(parteActiva === 'bronquiolos' ? null : 'bronquiolos')}
          >
            <path d="M140,280 Q120,300 110,320" className={styles.svgBronquiolo} fill="none" strokeWidth="4" />
            <path d="M140,280 Q150,310 145,330" className={styles.svgBronquiolo} fill="none" strokeWidth="4" />
            <path d="M260,280 Q280,300 290,320" className={styles.svgBronquiolo} fill="none" strokeWidth="4" />
            <path d="M260,280 Q250,310 255,330" className={styles.svgBronquiolo} fill="none" strokeWidth="4" />
            <text x="295" y="310" className={styles.svgLabel}>🔬 Bronquiolos</text>
          </g>

          {/* Alvéolos (racimos) */}
          <g
            className={`${styles.svgParte} ${parteActiva === 'alveolos' ? styles.svgParteActiva : ''}`}
            onClick={() => setParteActiva(parteActiva === 'alveolos' ? null : 'alveolos')}
            role="button"
            tabIndex={0}
            aria-label="Alvéolos"
            onKeyDown={e => e.key === 'Enter' && setParteActiva(parteActiva === 'alveolos' ? null : 'alveolos')}
          >
            {/* Racimo izquierdo */}
            <circle cx="100" cy="340" r="12" className={styles.svgAlveolo} />
            <circle cx="118" cy="348" r="12" className={styles.svgAlveolo} />
            <circle cx="105" cy="360" r="12" className={styles.svgAlveolo} />
            <circle cx="135" cy="340" r="12" className={styles.svgAlveolo} />
            <circle cx="150" cy="350" r="12" className={styles.svgAlveolo} />
            <circle cx="138" cy="362" r="12" className={styles.svgAlveolo} />
            {/* Racimo derecho */}
            <circle cx="280" cy="340" r="12" className={styles.svgAlveolo} />
            <circle cx="298" cy="348" r="12" className={styles.svgAlveolo} />
            <circle cx="285" cy="360" r="12" className={styles.svgAlveolo} />
            <circle cx="255" cy="340" r="12" className={styles.svgAlveolo} />
            <circle cx="250" cy="355" r="12" className={styles.svgAlveolo} />
            <circle cx="268" cy="365" r="12" className={styles.svgAlveolo} />
            <text x="155" y="390" className={styles.svgLabel}>🫧 Alvéolos</text>
          </g>

          {/* Diafragma */}
          <path d="M60,440 Q200,400 340,440" className={styles.svgDiafragma} fill="none" strokeWidth="5" />
          <text x="155" y="470" className={styles.svgLabelDiafragma}>Diafragma</text>

          {/* Contorno pulmones */}
          <ellipse cx="140" cy="320" rx="80" ry="100" className={styles.svgPulmon} />
          <ellipse cx="260" cy="320" rx="80" ry="100" className={styles.svgPulmon} />
        </svg>
      </div>

      {/* Detalle de parte seleccionada */}
      {parteSeleccionada && (
        <div className={`${styles.parteDetalle} ${styles[parteSeleccionada.colorClass]}`}>
          <div className={styles.parteDetalleHeader}>
            <span aria-hidden="true" className={styles.parteDetalleIcono}>{parteSeleccionada.icono}</span>
            <h3 className={styles.parteDetalleTitulo}>{parteSeleccionada.nombre}</h3>
          </div>
          <p className={styles.parteDetalleDesc}>{parteSeleccionada.descripcion}</p>
          <div className={styles.parteDetalleDato}>
            <strong>Dato:</strong> {parteSeleccionada.dato}
          </div>
        </div>
      )}

      {/* Mecánica respiratoria */}
      <h3 className={styles.subSeccionTitulo}>Mecánica respiratoria: inspiración vs espiración</h3>

      <nav className={styles.mecanicaNav} aria-label="Mecánica respiratoria">
        {MECANICA.map(m => (
          <button
            key={m.id}
            type="button"
            className={`${styles.mecanicaBtn} ${mecanicaActiva === m.id ? styles.mecanicaBtnActivo : ''}`}
            onClick={() => setMecanicaActiva(m.id)}
            aria-pressed={mecanicaActiva === m.id}
          >
            <span aria-hidden="true">{m.icono}</span> {m.titulo}
          </button>
        ))}
      </nav>

      {mecanicaSeleccionada && (
        <div className={styles.mecanicaDetalle}>
          <p className={styles.mecanicaDesc}>{mecanicaSeleccionada.descripcion}</p>
          <div className={styles.mecanicaGrid}>
            <div className={styles.mecanicaItem}>
              <span className={styles.mecanicaItemLabel}>Diafragma</span>
              <span className={styles.mecanicaItemValor}>{mecanicaSeleccionada.diafragma}</span>
            </div>
            <div className={styles.mecanicaItem}>
              <span className={styles.mecanicaItemLabel}>Costillas</span>
              <span className={styles.mecanicaItemValor}>{mecanicaSeleccionada.costillas}</span>
            </div>
            <div className={styles.mecanicaItem}>
              <span className={styles.mecanicaItemLabel}>Volumen torácico</span>
              <span className={styles.mecanicaItemValor}>{mecanicaSeleccionada.volumen}</span>
            </div>
            <div className={styles.mecanicaItem}>
              <span className={styles.mecanicaItemLabel}>Presión</span>
              <span className={styles.mecanicaItemValor}>{mecanicaSeleccionada.presion}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Intercambio gaseoso
// ─────────────────────────────────────────────

function SeccionIntercambio() {
  const [procesoActivo, setProcesoActivo] = useState<string | null>(null);
  const procesoSeleccionado = PROCESOS_INTERCAMBIO.find(p => p.id === procesoActivo);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>En los alvéolos ocurre el momento clave de la respiración: el <strong>intercambio de gases</strong>. El O₂ pasa del aire a la sangre y el CO₂ de la sangre al aire, por simple difusión.</p>
      </div>

      {/* SVG del alvéolo con capilar */}
      <div className={styles.alveoloContainer}>
        <svg viewBox="0 0 400 300" className={styles.alveoloSvg} role="img" aria-label="Intercambio gaseoso en un alvéolo">
          {/* Alvéolo */}
          <circle cx="200" cy="130" r="90" className={styles.svgAlveoloGrande} />
          <text x="170" y="90" className={styles.svgAlveoloLabel}>Alvéolo</text>
          <text x="160" y="110" className={styles.svgAlveoloAire}>Aire: 21% O₂</text>

          {/* Capilar sanguíneo */}
          <path d="M80,230 Q200,190 320,230" className={styles.svgCapilar} fill="none" strokeWidth="20" />
          <text x="155" y="250" className={styles.svgCapilarLabel}>Capilar sanguíneo</text>

          {/* Flechas O₂ (azules, de alvéolo a capilar) */}
          <g className={styles.svgFlechaO2}>
            <line x1="160" y1="160" x2="160" y2="200" strokeWidth="3" markerEnd="url(#arrowO2)" />
            <text x="135" y="185" className={styles.svgGasLabel}>O₂</text>
          </g>
          <g className={styles.svgFlechaO2}>
            <line x1="200" y1="170" x2="200" y2="205" strokeWidth="3" markerEnd="url(#arrowO2)" />
          </g>

          {/* Flechas CO₂ (rojas, de capilar a alvéolo) */}
          <g className={styles.svgFlechaCO2}>
            <line x1="240" y1="200" x2="240" y2="165" strokeWidth="3" markerEnd="url(#arrowCO2)" />
            <text x="250" y="185" className={styles.svgGasLabel}>CO₂</text>
          </g>

          {/* Glóbulos rojos simplificados */}
          <circle cx="130" cy="225" r="8" className={styles.svgGlobuloRojo} />
          <circle cx="180" cy="218" r="8" className={styles.svgGlobuloRojo} />
          <circle cx="230" cy="220" r="8" className={styles.svgGlobuloRojo} />
          <circle cx="280" cy="226" r="8" className={styles.svgGlobuloRojo} />

          {/* Membrana alvéolo-capilar */}
          <path d="M110,210 Q200,185 290,210" className={styles.svgMembrana} fill="none" strokeWidth="2" strokeDasharray="5,3" />
          <text x="120" y="210" className={styles.svgMembranaLabel} fontSize="8">membrana ~0,5 μm</text>

          {/* Marcadores de flechas */}
          <defs>
            <marker id="arrowO2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#3B82F6" />
            </marker>
            <marker id="arrowCO2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#EF4444" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Tabla aire inspirado vs espirado */}
      <div className={styles.tablaComparativa}>
        <h4 className={styles.tablaTitulo}>Aire inspirado vs espirado</h4>
        <div className={styles.composicionGrid}>
          {COMPOSICION_AIRE.map(c => (
            <div key={c.gas} className={styles.composicionRow}>
              <span className={styles.composicionGas}>{c.gas}</span>
              <div className={styles.composicionBarras}>
                <div className={styles.composicionBarra}>
                  <div
                    className={styles.composicionBarraFill}
                    style={{ width: `${Math.min(c.inspirado * 1.2, 100)}%`, background: c.color, opacity: 0.7 }}
                  />
                  <span className={styles.composicionValor}>{formatNumber(c.inspirado, 2)}{c.unidad} insp.</span>
                </div>
                <div className={styles.composicionBarra}>
                  <div
                    className={styles.composicionBarraFill}
                    style={{ width: `${Math.min(c.espirado * 1.2, 100)}%`, background: c.color }}
                  />
                  <span className={styles.composicionValor}>{formatNumber(c.espirado, 2)}{c.unidad} esp.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Procesos clave */}
      <h3 className={styles.subSeccionTitulo}>Procesos clave del intercambio</h3>
      <p className={styles.instruccion}>Pulsa cada proceso para ver el detalle</p>

      <div className={styles.procesosGrid}>
        {PROCESOS_INTERCAMBIO.map(p => (
          <button
            key={p.id}
            type="button"
            className={`${styles.procesoCard} ${procesoActivo === p.id ? styles.procesoCardActivo : ''}`}
            onClick={() => setProcesoActivo(procesoActivo === p.id ? null : p.id)}
            aria-expanded={procesoActivo === p.id}
          >
            <span className={styles.procesoIcono} aria-hidden="true">{p.icono}</span>
            <span className={styles.procesoTitulo}>{p.titulo}</span>
            <span className={styles.procesoDesc}>{p.descripcion}</span>
          </button>
        ))}
      </div>

      {procesoSeleccionado && (
        <div className={styles.procesoDetalle}>
          <span className={styles.procesoDetalleIcono} aria-hidden="true">{procesoSeleccionado.icono}</span>
          <div>
            <strong>{procesoSeleccionado.titulo}</strong>
            <p>{procesoSeleccionado.detalle}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Volúmenes pulmonares
// ─────────────────────────────────────────────

function SeccionVolumenes() {
  const [volumenActivo, setVolumenActivo] = useState<string | null>(null);
  const CPT = 5800;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La <strong>espirometría</strong> mide cuánto aire puedes mover. Cada volumen tiene un nombre y un significado clínico. Pulsa cada barra para ver la descripción.</p>
      </div>

      {/* Barra de volúmenes apilados */}
      <div className={styles.espirometriaContainer}>
        <h4 className={styles.espirometriaTitulo}>Volúmenes pulmonares (valores medios adulto)</h4>

        <div className={styles.espirometriaBarraTotal}>
          {VOLUMENES.map(v => {
            const porcentaje = (v.valor / CPT) * 100;
            return (
              <button
                key={v.id}
                type="button"
                className={`${styles.espirometriaSegmento} ${volumenActivo === v.id ? styles.espirometriaSegmentoActivo : ''}`}
                style={{ width: `${porcentaje}%`, background: v.color }}
                onClick={() => setVolumenActivo(volumenActivo === v.id ? null : v.id)}
                aria-label={`${v.nombre}: ${formatNumber(v.valor, 0)} ${v.unidad}`}
                aria-pressed={volumenActivo === v.id}
              >
                <span className={styles.espirometriaSegLabel}>{v.abreviatura}</span>
                <span className={styles.espirometriaSegValor}>{formatNumber(v.valor, 0)}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.espirometriaLeyenda}>
          {VOLUMENES.map(v => (
            <span key={v.id} className={styles.leyendaItem}>
              <span className={styles.leyendaColor} style={{ background: v.color }} />
              {v.abreviatura}: {formatNumber(v.valor, 0)} mL
            </span>
          ))}
        </div>
      </div>

      {/* Detalle del volumen seleccionado */}
      {volumenActivo && (() => {
        const vol = VOLUMENES.find(v => v.id === volumenActivo);
        if (!vol) return null;
        return (
          <div className={styles.volumenDetalle} style={{ borderLeftColor: vol.color }}>
            <h4 className={styles.volumenDetalleTitulo}>{vol.nombre} ({vol.abreviatura})</h4>
            <span className={styles.volumenDetalleValor} style={{ color: vol.color }}>{formatNumber(vol.valor, 0)} {vol.unidad}</span>
            <p>{vol.descripcion}</p>
          </div>
        );
      })()}

      {/* Capacidades */}
      <h3 className={styles.subSeccionTitulo}>Capacidades (combinaciones de volúmenes)</h3>
      <div className={styles.capacidadesGrid}>
        {CAPACIDADES.map(c => (
          <div key={c.id} className={styles.capacidadCard}>
            <span className={styles.capacidadNombre}>{c.nombre}</span>
            <span className={styles.capacidadAbr}>{c.abreviatura}</span>
            <span className={styles.capacidadValor} style={{ color: c.color }}>{formatNumber(c.valor, 0)} {c.unidad}</span>
            <span className={styles.capacidadDesc}>{c.descripcion}</span>
          </div>
        ))}
      </div>

      {/* Frecuencia respiratoria */}
      <h3 className={styles.subSeccionTitulo}>Frecuencia respiratoria (resp/min)</h3>
      <div className={styles.frecuenciaGrid}>
        {FRECUENCIAS.map(f => (
          <div key={f.situacion} className={styles.frecuenciaCard}>
            <span className={styles.frecuenciaIcono} aria-hidden="true">{f.icono}</span>
            <span className={styles.frecuenciaNombre}>{f.situacion}</span>
            <span className={styles.frecuenciaValor}>{f.min}-{f.max}</span>
            <div className={styles.frecuenciaBarra}>
              <div
                className={styles.frecuenciaBarraFill}
                style={{ width: `${(f.max / 60) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos y enfermedades
// ─────────────────────────────────────────────

function SeccionDatos() {
  const [enfermedadActiva, setEnfermedadActiva] = useState<string | null>(null);
  const enfermedadSeleccionada = ENFERMEDADES.find(e => e.id === enfermedadActiva);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu aparato respiratorio trabaja sin parar. Aquí tienes <strong>datos sorprendentes</strong>, enfermedades comunes y curiosidades que quizá no conocías.</p>
      </div>

      {/* Datos fascinantes */}
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map(d => (
          <div key={d.id} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.datoCifra}>{d.cifra}</span>
            <span className={styles.datoEtiqueta}>{d.titulo}</span>
            <span className={styles.datoDetalle}>{d.descripcion}</span>
          </div>
        ))}
      </div>

      {/* Enfermedades */}
      <h3 className={styles.subSeccionTitulo}>Enfermedades respiratorias</h3>
      <p className={styles.instruccion}>Pulsa cada enfermedad para ver el mecanismo</p>

      <div className={styles.enfermedadesGrid}>
        {ENFERMEDADES.map(e => (
          <button
            key={e.id}
            type="button"
            className={`${styles.enfermedadCard} ${enfermedadActiva === e.id ? styles.enfermedadCardActiva : ''}`}
            onClick={() => setEnfermedadActiva(enfermedadActiva === e.id ? null : e.id)}
            aria-expanded={enfermedadActiva === e.id}
          >
            <span className={styles.enfermedadIcono} aria-hidden="true">{e.icono}</span>
            <span className={styles.enfermedadNombre}>{e.nombre}</span>
            <span className={styles.enfermedadDesc}>{e.descripcion}</span>
          </button>
        ))}
      </div>

      {enfermedadSeleccionada && (
        <div className={styles.enfermedadDetalle}>
          <h4>
            <span aria-hidden="true">{enfermedadSeleccionada.icono}</span> {enfermedadSeleccionada.nombre}
          </h4>
          <p><strong>Mecanismo:</strong> {enfermedadSeleccionada.mecanismo}</p>
          <p className={styles.enfermedadDato}>{enfermedadSeleccionada.dato}</p>
        </div>
      )}

      {/* Curiosidades */}
      <h3 className={styles.subSeccionTitulo}>Curiosidades</h3>
      <div className={styles.curiosidadesGrid}>
        {CURIOSIDADES.map(c => (
          <div key={c.id} className={styles.curiosidadCard}>
            <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
            <span className={styles.curiosidadTitulo}>{c.titulo}</span>
            <p className={styles.curiosidadDesc}>{c.descripcion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaRespiratorio() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('anatomia');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'anatomia': return <SeccionAnatomia />;
      case 'intercambio': return <SeccionIntercambio />;
      case 'volumenes': return <SeccionVolumenes />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Sistema Respiratorio</h1>
          <p className={styles.subtitle}>Del aire que inspiras al oxígeno que alimenta tus células</p>
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
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el sistema respiratorio"
          subtitle="Anatomía, fisiología y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿Por qué respiramos?</h3>
          <p>
            La respiración tiene un único objetivo esencial: llevar oxígeno (O₂) a las células para que
            puedan producir energía (ATP) mediante la respiración celular, y eliminar el dióxido de carbono
            (CO₂) resultante. Sin O₂, las células cerebrales mueren en 4-6 minutos.
          </p>

          <h3>El diafragma: el motor silencioso</h3>
          <p>
            El diafragma es un músculo en forma de cúpula que separa la cavidad torácica de la abdominal.
            Es el principal músculo respiratorio: su contracción genera el ~75% del volumen inspiratorio.
            Está controlado por el nervio frénico (C3-C5). Un hipo es un espasmo involuntario del diafragma.
          </p>

          <h3>La relación entre pulmones y corazón</h3>
          <p>
            El corazón bombea toda la sangre venosa (desoxigenada) al pulmón a través de la arteria pulmonar.
            Allí se oxigena en los capilares alveolares y regresa al corazón por las venas pulmonares, lista
            para distribuirse por todo el cuerpo. Es la circulación menor o pulmonar.
          </p>

          <h3>¿Qué mide una espirometría?</h3>
          <p>
            La espirometría es la prueba básica de función pulmonar. El paciente sopla en un tubo con fuerza
            máxima. Se miden el FEV1 (aire espirado en el primer segundo) y la FVC (capacidad vital forzada).
            La relación FEV1/FVC indica si hay obstrucción (asma, EPOC) o restricción (fibrosis).
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador presenta una visión simplificada del sistema respiratorio
            con fines educativos. Los valores de volúmenes pulmonares son promedios para un adulto sano y
            varían según edad, sexo, talla y condición física. Para diagnósticos médicos consulta siempre
            a un profesional sanitario.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistema-respiratorio')} />
        <ShareCard appName="visualizador-sistema-respiratorio" />
        <Footer appName="visualizador-sistema-respiratorio" />
    </div>
  );
}
