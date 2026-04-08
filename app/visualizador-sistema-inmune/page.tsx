'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './SistemaInmune.module.css';
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

type Seccion = 'defensas' | 'anticuerpos' | 'vacunas' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'defensas', titulo: 'Líneas de defensa', icono: '🛡️', subtitulo: 'Las 3 capas que te protegen' },
  { id: 'anticuerpos', titulo: 'Anticuerpos', icono: '🔬', subtitulo: 'Llaves que encajan en cerraduras' },
  { id: 'vacunas', titulo: 'Vacunas', icono: '💉', subtitulo: 'El entrenamiento del ejército' },
  { id: 'datos', titulo: 'Datos fascinantes', icono: '🧠', subtitulo: 'Lo que no sabías de tu cuerpo' },
];

// ─────────────────────────────────────────────
// Datos: líneas de defensa
// ─────────────────────────────────────────────

interface ComponenteDefensa {
  nombre: string;
  icono: string;
  descripcion: string;
}

interface LineaDefensa {
  numero: number;
  titulo: string;
  tipo: string;
  color: string;
  descripcion: string;
  componentes: ComponenteDefensa[];
}

const LINEAS_DEFENSA: LineaDefensa[] = [
  {
    numero: 1,
    titulo: 'Barreras físicas y químicas',
    tipo: 'Siempre activas — no necesitan activación',
    color: '#27ae60',
    descripcion: 'La primera muralla: impiden que los patógenos entren en el cuerpo. Son barreras pasivas que funcionan 24/7.',
    componentes: [
      { nombre: 'Piel', icono: '🧱', descripcion: 'Barrera impermeable de queratina. Cubre ~2 m² y se renueva cada 2-3 semanas.' },
      { nombre: 'Mucosas', icono: '💧', descripcion: 'Recubren nariz, boca, pulmones e intestinos. El moco atrapa partículas y patógenos.' },
      { nombre: 'Saliva y lisozima', icono: '👅', descripcion: 'La lisozima rompe las paredes de las bacterias. También en lágrimas y secreción nasal.' },
      { nombre: 'Ácido estomacal', icono: '🧪', descripcion: 'pH 1,5-3,5. Destruye la mayoría de microorganismos que entran con la comida.' },
      { nombre: 'Lágrimas', icono: '👁️', descripcion: 'Lavan la superficie del ojo y contienen lisozima y anticuerpos IgA.' },
      { nombre: 'Flora bacteriana', icono: '🦠', descripcion: 'Bacterias "buenas" que compiten con las patógenas por espacio y nutrientes.' },
    ],
  },
  {
    numero: 2,
    titulo: 'Inmunidad innata',
    tipo: 'Rápida (minutos-horas) pero inespecífica',
    color: '#e67e22',
    descripcion: 'Si un patógeno supera las barreras, se activa la respuesta innata: rápida, genérica y sin memoria. Ataca a todo lo "extraño".',
    componentes: [
      { nombre: 'Inflamación', icono: '🔥', descripcion: 'Enrojecimiento, calor, hinchazón y dolor. Aumenta el flujo sanguíneo para traer más defensas.' },
      { nombre: 'Fiebre', icono: '🌡️', descripcion: 'Eleva la temperatura para dificultar la reproducción de los patógenos (óptima a 37°C, menos eficientes a 39°C).' },
      { nombre: 'Neutrófilos', icono: '⚪', descripcion: 'Los más numerosos (60-70% de leucocitos). Fagocitan (engullen) bacterias. Viven solo horas.' },
      { nombre: 'Macrófagos', icono: '🟤', descripcion: 'Engullen hasta 100 bacterias. Además, presentan antígenos para activar la 3ª línea.' },
      { nombre: 'Células NK', icono: '⚔️', descripcion: 'Natural Killers: destruyen células propias infectadas por virus o células tumorales.' },
      { nombre: 'Sistema del complemento', icono: '💥', descripcion: '30+ proteínas que perforan membranas de patógenos, los marcan o causan inflamación.' },
    ],
  },
  {
    numero: 3,
    titulo: 'Inmunidad adaptativa',
    tipo: 'Lenta la primera vez (7-14 días) pero específica y con MEMORIA',
    color: '#e74c3c',
    descripcion: 'La artillería pesada: reconoce patógenos específicos, los destruye y RECUERDA. La segunda vez, responde en horas.',
    componentes: [
      { nombre: 'Linfocitos T helper (CD4+)', icono: '🟢', descripcion: 'Coordinadores: activan a otras células inmunes. Son el "general" del ejército.' },
      { nombre: 'Linfocitos T citotóxicos (CD8+)', icono: '🔵', descripcion: 'Asesinos: destruyen células propias que ya están infectadas por virus.' },
      { nombre: 'Linfocitos B', icono: '🟡', descripcion: 'Fábricas de anticuerpos: producen hasta 2.000 anticuerpos por segundo.' },
      { nombre: 'Anticuerpos (Ig)', icono: '🔑', descripcion: 'Proteínas en forma de Y que se unen al antígeno. Neutralizan, aglutinan o marcan para destrucción.' },
      { nombre: 'Células de memoria B', icono: '🧠', descripcion: 'Recuerdan patógenos pasados durante años o décadas. Son la base de las vacunas.' },
      { nombre: 'Células de memoria T', icono: '📝', descripcion: 'Coordinan respuestas más rápidas ante reinfecciones. Patrullan el cuerpo constantemente.' },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: tipos de vacunas
// ─────────────────────────────────────────────

interface TipoVacuna {
  nombre: string;
  icono: string;
  mecanismo: string;
  ejemplos: string;
  color: string;
}

const TIPOS_VACUNAS: TipoVacuna[] = [
  {
    nombre: 'Virus atenuado',
    icono: '🟢',
    mecanismo: 'Usa el patógeno real pero debilitado. Se replica un poco sin causar enfermedad grave. Genera respuesta inmune muy completa y duradera.',
    ejemplos: 'Sarampión, varicela, fiebre amarilla, rotavirus',
    color: '#27ae60',
  },
  {
    nombre: 'Virus inactivado',
    icono: '⚪',
    mecanismo: 'El patógeno se mata con calor o químicos. No puede replicarse pero sus antígenos quedan intactos para activar la respuesta inmune.',
    ejemplos: 'Gripe (inyectable), hepatitis A, rabia, polio (Salk)',
    color: '#95a5a6',
  },
  {
    nombre: 'Subunidad / proteína',
    icono: '🔵',
    mecanismo: 'Solo usa una proteína o fragmento del patógeno (normalmente de superficie). El cuerpo aprende a reconocer esa pieza específica.',
    ejemplos: 'Hepatitis B, tosferina, VPH, meningococo',
    color: '#2E86AB',
  },
  {
    nombre: 'ARNm (mensajero)',
    icono: '🟡',
    mecanismo: 'Inyecta instrucciones genéticas (ARNm) para que tus propias células fabriquen una proteína del virus (ej: spike). El sistema inmune responde a esa proteína.',
    ejemplos: 'COVID-19 (Pfizer-BioNTech, Moderna)',
    color: '#f1c40f',
  },
];

// ─────────────────────────────────────────────
// Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  {
    icono: '🦠',
    titulo: 'Más células que habitantes',
    descripcion: 'Tu cuerpo contiene ~37.000 millones de glóbulos blancos — más que los habitantes de la Tierra.',
  },
  {
    icono: '🤒',
    titulo: 'La fiebre NO es mala',
    descripcion: 'Es una estrategia: los patógenos se reproducen peor a 39°C. Tu cuerpo sube la temperatura a propósito.',
  },
  {
    icono: '🧬',
    titulo: '10.000 millones de anticuerpos distintos',
    descripcion: 'Gracias a la recombinación VDJ, puedes producir anticuerpos contra antígenos que aún no existen.',
  },
  {
    icono: '💉',
    titulo: 'La primera vacuna (1796)',
    descripcion: 'Edward Jenner usó pústulas de viruela bovina (cowpox) para proteger contra la viruela humana. "Vacuna" viene de vacca (vaca).',
  },
  {
    icono: '🤧',
    titulo: 'La inflamación es tu aliada',
    descripcion: 'Hinchazón, enrojecimiento y calor significan que tu sistema inmune está TRABAJANDO — no es el enemigo.',
  },
  {
    icono: '🧫',
    titulo: 'Macrófagos hambrientos',
    descripcion: 'Un macrófago puede fagocitar (engullir) hasta 100 bacterias antes de morir agotado.',
  },
  {
    icono: '⚔️',
    titulo: 'Las alergias son un exceso de celo',
    descripcion: 'Son tu sistema inmune reaccionando EXAGERADAMENTE a algo inofensivo como el polen, polvo o cacahuetes.',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Las 3 Líneas de Defensa
// ─────────────────────────────────────────────

function SeccionDefensas() {
  const [lineaActiva, setLineaActiva] = useState<number>(0);
  const linea = LINEAS_DEFENSA[lineaActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Un patógeno que quiere infectarte debe superar <strong>3 capas defensivas</strong>. La mayoría no pasan de la primera.</p>
      </div>

      {/* Flujo visual */}
      <div className={styles.flujoDefensa}>
        <div className={styles.flujoPatogeno}>
          <span aria-hidden="true">🦠</span>
          <span className={styles.flujoLabel}>Patógeno</span>
        </div>
        <div className={styles.flujoFlecha} aria-hidden="true">→</div>
        {LINEAS_DEFENSA.map((l, i) => (
          <div key={i} className={styles.flujoGrupo}>
            <button
              type="button"
              className={`${styles.flujoCapa} ${lineaActiva === i ? styles.flujoCapaActiva : ''}`}
              style={{ borderColor: l.color, color: lineaActiva === i ? '#fff' : l.color, background: lineaActiva === i ? l.color : 'transparent' }}
              onClick={() => setLineaActiva(i)}
              aria-pressed={lineaActiva === i}
              aria-label={`Ver línea de defensa ${l.numero}: ${l.titulo}`}
            >
              <span className={styles.flujoNumero}>{l.numero}ª</span>
            </button>
            {i < 2 && <div className={styles.flujoFlecha} aria-hidden="true">→</div>}
          </div>
        ))}
      </div>

      {/* Detalle de la línea seleccionada */}
      <div className={styles.lineaDetalle} style={{ borderLeftColor: linea.color }}>
        <div className={styles.lineaHeader}>
          <h3 className={styles.lineaTitulo} style={{ color: linea.color }}>
            {linea.numero}ª Línea — {linea.titulo}
          </h3>
          <span className={styles.lineaTipo}>{linea.tipo}</span>
        </div>
        <p className={styles.lineaDesc}>{linea.descripcion}</p>

        <div className={styles.componentesGrid}>
          {linea.componentes.map((c, i) => (
            <div key={i} className={styles.componenteCard}>
              <div className={styles.componenteHeader}>
                <span aria-hidden="true">{c.icono}</span>
                <strong>{c.nombre}</strong>
              </div>
              <p className={styles.componenteDesc}>{c.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Tu cuerpo tiene un ejército de <strong>3 niveles</strong>: la mayoría de ataques ni pasan del primero.
          Solo cuando un patógeno supera las barreras físicas Y la inmunidad innata, se activa la artillería pesada de la inmunidad adaptativa.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Anticuerpos en Acción
// ─────────────────────────────────────────────

interface PasoAnimacion {
  icono: string;
  titulo: string;
  descripcion: string;
}

const PASOS_ANTICUERPO: PasoAnimacion[] = [
  { icono: '🦠', titulo: 'Patógeno con antígeno', descripcion: 'Un invasor entra con proteínas únicas (antígenos) en su superficie — como una huella dactilar.' },
  { icono: '🔍', titulo: 'Linfocito B lo reconoce', descripcion: 'Entre millones de linfocitos B, uno tiene el receptor que encaja con ESE antígeno específico.' },
  { icono: '🏭', titulo: 'Produce anticuerpos', descripcion: 'El linfocito B se multiplica y produce miles de anticuerpos idénticos (hasta 2.000/segundo).' },
  { icono: '🔗', titulo: 'Anticuerpos se unen', descripcion: 'Los anticuerpos se adhieren al antígeno como llaves en cerraduras. Neutralizan, aglutinan o marcan al patógeno.' },
  { icono: '🟤', titulo: 'Macrófago fagocita', descripcion: 'Los patógenos marcados con anticuerpos son engullidos y digeridos por macrófagos.' },
  { icono: '🧠', titulo: 'Se genera memoria', descripcion: 'Células de memoria B y T quedan patrullando. Si el mismo patógeno vuelve, la respuesta será en horas, no días.' },
];

function SeccionAnticuerpos() {
  const [pasoActivo, setPasoActivo] = useState<number>(0);

  // Datos para gráfico de barras de respuesta primaria vs secundaria
  const respuestas = [
    { label: 'Respuesta primaria', dias: '7-14 días', nivel: 25, color: '#e67e22', desc: 'Primera exposición: lenta, nivel bajo de anticuerpos' },
    { label: 'Respuesta secundaria', dias: 'Horas', nivel: 95, color: '#27ae60', desc: 'Segunda exposición: rápida, nivel muy alto (células de memoria)' },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los anticuerpos son proteínas en forma de <strong>Y</strong> fabricadas por los linfocitos B. Cada uno es <strong>específico</strong> para un antígeno concreto — como una llave que solo abre una cerradura.</p>
      </div>

      {/* Diagrama anticuerpo en forma de Y */}
      <h3 className={styles.subSeccionTitulo}>Estructura de un anticuerpo</h3>
      <div className={styles.anticuerpoZona}>
        <svg viewBox="0 0 300 260" className={styles.anticuerpoSvg} role="img" aria-label="Diagrama de un anticuerpo en forma de Y: dos brazos superiores con regiones variables y un tallo inferior con región constante">
          {/* Brazo izquierdo */}
          <rect x="40" y="20" width="60" height="30" rx="8" fill="#e74c3c" opacity="0.85" />
          <text x="70" y="40" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Variable</text>
          <rect x="40" y="55" width="60" height="40" rx="8" fill="#2E86AB" opacity="0.85" />
          <text x="70" y="80" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Constante</text>

          {/* Brazo derecho */}
          <rect x="200" y="20" width="60" height="30" rx="8" fill="#e74c3c" opacity="0.85" />
          <text x="230" y="40" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Variable</text>
          <rect x="200" y="55" width="60" height="40" rx="8" fill="#2E86AB" opacity="0.85" />
          <text x="230" y="80" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">Constante</text>

          {/* Bisagra */}
          <line x1="100" y1="95" x2="150" y2="120" stroke="#2E86AB" strokeWidth="6" strokeLinecap="round" />
          <line x1="200" y1="95" x2="150" y2="120" stroke="#2E86AB" strokeWidth="6" strokeLinecap="round" />

          {/* Tallo */}
          <rect x="125" y="120" width="50" height="70" rx="10" fill="#2E86AB" opacity="0.85" />
          <text x="150" y="150" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600">Región</text>
          <text x="150" y="162" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="600">constante</text>

          {/* Cadenas */}
          <line x1="70" y1="55" x2="70" y2="95" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
          <line x1="230" y1="55" x2="230" y2="95" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />

          {/* Etiquetas */}
          <text x="70" y="12" textAnchor="middle" fill="currentColor" fontSize="8" opacity="0.7">Sitio de unión</text>
          <text x="230" y="12" textAnchor="middle" fill="currentColor" fontSize="8" opacity="0.7">Sitio de unión</text>

          {/* Antígenos */}
          <circle cx="55" cy="8" r="6" fill="#e67e22" opacity="0.6" />
          <circle cx="85" cy="8" r="6" fill="#e67e22" opacity="0.6" />
          <circle cx="215" cy="8" r="6" fill="#e67e22" opacity="0.6" />
          <circle cx="245" cy="8" r="6" fill="#e67e22" opacity="0.6" />

          {/* Leyenda */}
          <rect x="20" y="210" width="12" height="12" rx="3" fill="#e74c3c" opacity="0.85" />
          <text x="38" y="220" fill="currentColor" fontSize="9">Región variable (reconoce antígeno)</text>
          <rect x="20" y="230" width="12" height="12" rx="3" fill="#2E86AB" opacity="0.85" />
          <text x="38" y="240" fill="currentColor" fontSize="9">Región constante (activa defensas)</text>
          <circle cx="206" cy="216" r="6" fill="#e67e22" opacity="0.6" />
          <text x="218" y="220" fill="currentColor" fontSize="9">Antígeno</text>
        </svg>
        <div className={styles.anticuerpoLeyenda}>
          <p><strong>2 cadenas pesadas + 2 cadenas ligeras</strong> forman la estructura en Y.</p>
          <p>La <strong>región variable</strong> (arriba) cambia para cada antígeno — es la &ldquo;cerradura&rdquo;.</p>
          <p>La <strong>región constante</strong> (abajo) activa las defensas: marca al patógeno para destrucción.</p>
        </div>
      </div>

      {/* Proceso paso a paso */}
      <h3 className={styles.subSeccionTitulo}>Cómo actúan los anticuerpos</h3>
      <div className={styles.pasosNav}>
        {PASOS_ANTICUERPO.map((p, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.pasoBtn} ${pasoActivo === i ? styles.pasoBtnActivo : ''}`}
            onClick={() => setPasoActivo(i)}
            aria-pressed={pasoActivo === i}
            aria-label={`Paso ${i + 1}: ${p.titulo}`}
          >
            <span aria-hidden="true">{p.icono}</span>
            <span className={styles.pasoNumero}>{i + 1}</span>
          </button>
        ))}
      </div>
      <div className={styles.pasoDetalle}>
        <h4 className={styles.pasoTitulo}>
          Paso {pasoActivo + 1}: {PASOS_ANTICUERPO[pasoActivo].titulo}
        </h4>
        <p className={styles.pasoDesc}>{PASOS_ANTICUERPO[pasoActivo].descripcion}</p>
      </div>

      {/* Gráfico respuesta primaria vs secundaria */}
      <h3 className={styles.subSeccionTitulo}>Memoria inmunológica: 1ª vs 2ª exposición</h3>
      <div className={styles.graficoBarra}>
        {respuestas.map((r, i) => (
          <div key={i} className={styles.barraGrupo}>
            <div className={styles.barraLabelZona}>
              <span className={styles.barraLabel}>{r.label}</span>
              <span className={styles.barraTiempo}>{r.dias}</span>
            </div>
            <div className={styles.barraTrack}>
              <div
                className={styles.barraFill}
                style={{ width: `${r.nivel}%`, background: r.color }}
              />
            </div>
            <p className={styles.barraDesc}>{r.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Tu cuerpo puede producir anticuerpos contra <strong>millones de antígenos distintos</strong> — incluso los que aún no existen.
          La recombinación VDJ genera ~{formatNumber(10000000000, 0)} combinaciones posibles. Por eso cada anticuerpo es específico: es como tener un cerrajero que fabrica llaves a medida.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Vacunas — El Entrenamiento
// ─────────────────────────────────────────────

function SeccionVacunas() {
  const [vacunaActiva, setVacunaActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las vacunas aprovechan la <strong>memoria inmunológica</strong>: introducen un antígeno inofensivo para que tu sistema inmune &ldquo;practique&rdquo; antes de que llegue el patógeno real.</p>
      </div>

      {/* Proceso vacunación */}
      <h3 className={styles.subSeccionTitulo}>Cómo funciona una vacuna</h3>
      <div className={styles.procesoVacuna}>
        {[
          { icono: '💉', titulo: 'Inyección', desc: 'Se introduce un antígeno inactivado, atenuado o un fragmento del patógeno.' },
          { icono: '🛡️', titulo: 'Respuesta', desc: 'El sistema inmune responde como si fuera una infección real (sin la enfermedad).' },
          { icono: '🧠', titulo: 'Memoria', desc: 'Se generan células de memoria B y T que recuerdan ese antígeno.' },
          { icono: '⚡', titulo: 'Protección', desc: 'Cuando llega el patógeno real, la respuesta es inmediata y potente.' },
        ].map((p, i) => (
          <div key={i} className={styles.procesoStep}>
            <div className={styles.procesoIcono}>
              <span aria-hidden="true">{p.icono}</span>
            </div>
            <strong className={styles.procesoTitulo}>{p.titulo}</strong>
            <p className={styles.procesoDesc}>{p.desc}</p>
            {i < 3 && <div className={styles.procesoFlecha} aria-hidden="true">→</div>}
          </div>
        ))}
      </div>

      {/* 4 tipos de vacunas */}
      <h3 className={styles.subSeccionTitulo}>4 tipos de vacunas</h3>
      <div className={styles.vacunasGrid}>
        {TIPOS_VACUNAS.map((v, i) => (
          <div
            key={i}
            className={`${styles.vacunaCard} ${vacunaActiva === i ? styles.vacunaActiva : ''}`}
            style={{ borderLeftColor: v.color }}
            onClick={() => setVacunaActiva(vacunaActiva === i ? null : i)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVacunaActiva(vacunaActiva === i ? null : i); } }}
            tabIndex={0}
            role="button"
            aria-expanded={vacunaActiva === i}
            aria-label={`Ver detalles de vacuna ${v.nombre}`}
          >
            <div className={styles.vacunaHeaderRow}>
              <span className={styles.vacunaIcono} aria-hidden="true">{v.icono}</span>
              <h4 className={styles.vacunaNombre}>{v.nombre}</h4>
            </div>
            {vacunaActiva === i && (
              <div className={styles.vacunaDetalle}>
                <p className={styles.vacunaMecanismo}>{v.mecanismo}</p>
                <p className={styles.vacunaEjemplos}><strong>Ejemplos:</strong> {v.ejemplos}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Inmunidad de grupo */}
      <h3 className={styles.subSeccionTitulo}>Inmunidad de grupo</h3>
      <div className={styles.rebanoExplicacion}>
        <p>
          Cuando un <strong>80-95%</strong> de la población está vacunada, el patógeno no encuentra suficientes
          huéspedes susceptibles y deja de propagarse. Esto protege a quienes <strong>no pueden vacunarse</strong> (bebés,
          inmunodeprimidos, alérgicos a componentes).
        </p>
        <div className={styles.rebanoVisual} role="img" aria-label="Visualización de inmunidad de grupo: la mayoría vacunados protegen a los vulnerables">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className={`${styles.persona} ${i < 17 ? styles.personaVacunada : i === 17 ? styles.personaProtegida : styles.personaSusceptible}`}
              title={i < 17 ? 'Vacunado' : i === 17 ? 'No vacunado (protegido por grupo)' : 'Vulnerable'}
            />
          ))}
        </div>
        <div className={styles.rebanoLeyenda}>
          <span><span className={`${styles.leyendaDot} ${styles.dotVacunado}`} /> Vacunado</span>
          <span><span className={`${styles.leyendaDot} ${styles.dotProtegido}`} /> Protegido por el grupo</span>
          <span><span className={`${styles.leyendaDot} ${styles.dotVulnerable}`} /> Vulnerable</span>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Una vacuna es un <strong>simulacro de incendio</strong> para tu sistema inmune: practica la
          respuesta sin peligro real, para que cuando llegue el fuego de verdad, tu cuerpo sepa exactamente
          qué hacer.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu sistema inmune es una de las <strong>máquinas más sofisticadas</strong> de la naturaleza. Estos datos te ayudarán a apreciarlo.</p>
      </div>

      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <h4 className={styles.datoTitulo}>{d.titulo}</h4>
            <p className={styles.datoDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Error común */}
      <h3 className={styles.subSeccionTitulo}>Error común</h3>
      <div className={styles.errorComun}>
        <div className={styles.errorIncorrecto}>
          <span className={styles.errorLabel}><span aria-hidden="true">❌</span> Mito</span>
          <p>&ldquo;Los antibióticos matan virus&rdquo;</p>
        </div>
        <div className={styles.errorCorrecto}>
          <span className={styles.errorLabel}><span aria-hidden="true">✅</span> Realidad</span>
          <p>Los antibióticos SOLO funcionan contra <strong>bacterias</strong>. Contra los virus, tu sistema inmune es la única defensa (apoyado por vacunas y, en algunos casos, antivirales específicos).</p>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Cada segundo de tu vida, tu sistema inmune está trabajando sin que lo notes.
          Solo cuando algo <strong>falla</strong> — una infección, alergia o enfermedad autoinmune —
          te das cuenta de que existe. Es el mejor empleado que nunca verás.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaInmunePage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('defensas');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'defensas': return <SeccionDefensas />;
      case 'anticuerpos': return <SeccionAnticuerpos />;
      case 'vacunas': return <SeccionVacunas />;
      case 'datos': return <SeccionDatos />;
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
          <h1 className={styles.title}>El Sistema Inmune</h1>
          <p className={styles.subtitle}>Tu ejército invisible — barreras, anticuerpos y memoria inmunológica</p>
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
          title="Más sobre el sistema inmune"
          subtitle="Preguntas frecuentes y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿Qué diferencia hay entre inmunidad innata y adaptativa?</h3>
          <p>
            La inmunidad innata es tu primera respuesta: rápida (minutos), genérica y sin memoria.
            La adaptativa es más lenta la primera vez (7-14 días), pero es específica para cada patógeno
            y <strong>recuerda</strong> — la segunda vez responde en horas. Las vacunas explotan esta memoria.
          </p>

          <h3>¿Por qué no me vacuno una vez y estoy protegido para siempre?</h3>
          <p>
            Algunos patógenos mutan rápidamente (como la gripe) y los anticuerpos anteriores ya no encajan.
            Otros generan una memoria que se debilita con el tiempo (tétanos), por lo que necesitas refuerzos.
            Y algunos, como el sarampión, dan protección prácticamente de por vida con 2 dosis.
          </p>

          <h3>¿Qué son las enfermedades autoinmunes?</h3>
          <p>
            Ocurren cuando el sistema inmune <strong>ataca tejidos propios</strong> por error: artritis reumatoide
            (articulaciones), diabetes tipo 1 (páncreas), esclerosis múltiple (sistema nervioso). Es como
            si tu ejército empezara a disparar a sus propios soldados.
          </p>

          <h3>¿Las alergias son un fallo del sistema inmune?</h3>
          <p>
            En cierto modo, sí. Una alergia es una <strong>respuesta exagerada</strong> a sustancias inofensivas
            (polen, ácaros, alimentos). Los mastocitos liberan histamina masivamente, causando estornudos,
            picor, hinchazón y, en casos graves, anafilaxia.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de inmunología con fines
            educativos. El sistema inmune real es enormemente más complejo. Para decisiones sobre
            vacunación o salud, consulta siempre con profesionales sanitarios y fuentes oficiales
            (OMS, Ministerio de Sanidad).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistema-inmune')} />
        <ShareCard appName="visualizador-sistema-inmune" />
        <Footer appName="visualizador-sistema-inmune" />
      </div>
    </>
  );
}
