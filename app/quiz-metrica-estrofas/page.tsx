'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './QuizMetricaEstrofas.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Nivel = 'basico' | 'intermedio' | 'avanzado';
type Pantalla = 'config' | 'quiz' | 'resultado';

interface PreguntaMetrica {
  enunciado: string;
  contexto?: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
  nivel: Nivel;
  categoria: 'verso' | 'estrofa' | 'rima' | 'regla';
}

// ── Pool completo de preguntas ──────────────────────────────────────────────

const PREGUNTAS: PreguntaMetrica[] = [
  // ── BÁSICO ──
  {
    nivel: 'basico', categoria: 'verso',
    enunciado: '¿Cómo se llama el verso de 8 sílabas?',
    opciones: ['Octosílabo', 'Endecasílabo', 'Hexasílabo', 'Decasílabo'],
    correcta: 'Octosílabo',
    explicacion: 'El octosílabo (8 sílabas) es el verso de arte menor más importante del castellano. Es la base del romance, la redondilla y la décima. Lorca lo usa en el Romance sonámbulo: «Verde que te quiero verde».',
  },
  {
    nivel: 'basico', categoria: 'verso',
    enunciado: '¿Cómo se llama el verso de 11 sílabas?',
    opciones: ['Endecasílabo', 'Alejandrino', 'Decasílabo', 'Dodecasílabo'],
    correcta: 'Endecasílabo',
    explicacion: 'El endecasílabo (11 sílabas) es el verso culto por excelencia del castellano. Introducido por Garcilaso en el siglo XVI desde Italia, es la base del soneto, la lira y la octava real.',
  },
  {
    nivel: 'basico', categoria: 'verso',
    enunciado: '¿Cuántas sílabas tiene el alejandrino?',
    opciones: ['14', '12', '11', '16'],
    correcta: '14',
    explicacion: 'El alejandrino tiene 14 sílabas divididas en dos hemistiquios de 7+7. Rubén Darío lo popularizó en castellano con versos como «La princesa está triste… ¿qué tendrá la princesa?».',
  },
  {
    nivel: 'basico', categoria: 'verso',
    enunciado: '¿A qué arte pertenece el octosílabo?',
    opciones: ['Arte menor', 'Arte mayor', 'Arte mixto', 'Arte popular'],
    correcta: 'Arte menor',
    explicacion: 'Se considera arte menor todo verso de hasta 8 sílabas; arte mayor, el de 9 o más. El octosílabo es precisamente el límite superior del arte menor.',
  },
  {
    nivel: 'basico', categoria: 'verso',
    enunciado: '¿A qué arte pertenece el endecasílabo?',
    opciones: ['Arte mayor', 'Arte menor', 'Arte mixto', 'Arte culto'],
    correcta: 'Arte mayor',
    explicacion: 'El endecasílabo tiene 11 sílabas, por encima del límite de 8 que separa el arte menor del mayor. Junto al alejandrino, es el verso de arte mayor más usado en la poesía española.',
  },
  {
    nivel: 'basico', categoria: 'regla',
    enunciado: '¿Cómo se llama la unión de la vocal final de una palabra con la vocal inicial de la siguiente dentro del verso?',
    opciones: ['Sinalefa', 'Hiato', 'Diéresis', 'Sinéresis'],
    correcta: 'Sinalefa',
    explicacion: 'La sinalefa es la norma general en métrica española: cuando una palabra termina en vocal y la siguiente empieza por vocal (o h muda + vocal), ambas vocales se cuentan como una sola sílaba métrica.',
  },
  {
    nivel: 'basico', categoria: 'rima',
    enunciado: '¿Qué tipo de rima coincide solo en las vocales desde la última vocal tónica?',
    opciones: ['Asonante', 'Consonante', 'Blanca', 'Libre'],
    correcta: 'Asonante',
    explicacion: 'La rima asonante coincide únicamente en las vocales desde la última vocal tónica; las consonantes pueden ser distintas. Es la rima del romance: «verde» / «ramas» riman en asonante (e-a / a-a).',
  },
  {
    nivel: 'basico', categoria: 'estrofa',
    enunciado: '¿Cuántos versos tiene el soneto?',
    opciones: ['14', '10', '12', '8'],
    correcta: '14',
    explicacion: 'El soneto consta de 14 endecasílabos distribuidos en dos cuartetos (4+4) y dos tercetos (3+3). El esquema clásico es ABBA ABBA / CDC DCD. Es la forma poética más estudiada de la tradición occidental.',
  },
  {
    nivel: 'basico', categoria: 'estrofa',
    enunciado: '¿Qué estrofa de 4 octosílabos tiene esquema de rima abba?',
    opciones: ['Redondilla', 'Cuarteto', 'Serventesio', 'Cuarteta'],
    correcta: 'Redondilla',
    explicacion: 'La redondilla son 4 octosílabos con rima abrazada (abba). Sor Juana la usó en sus célebres redondillas: «Hombres necios que acusáis / a la mujer sin razón…».',
  },
  {
    nivel: 'basico', categoria: 'estrofa',
    enunciado: '¿Qué tipo de verso usa el romance?',
    opciones: ['Octosílabo', 'Endecasílabo', 'Heptasílabo', 'Alejandrino'],
    correcta: 'Octosílabo',
    explicacion: 'El romance es una serie indefinida de octosílabos donde riman en asonancia los versos pares y los impares quedan libres. Es la forma narrativa popular por excelencia del castellano.',
  },

  // ── INTERMEDIO ──
  {
    nivel: 'intermedio', categoria: 'estrofa',
    enunciado: '¿Qué esquema de rima tiene el cuarteto?',
    opciones: ['ABBA', 'ABAB', 'AABB', 'ABCD'],
    correcta: 'ABBA',
    explicacion: 'El cuarteto son 4 endecasílabos con rima abrazada ABBA. Es la base de los dos primeros cuartetos del soneto. Quevedo lo usa en «Amor constante más allá de la muerte».',
  },
  {
    nivel: 'intermedio', categoria: 'estrofa',
    enunciado: '¿Cuántos versos tiene la décima o espinela?',
    opciones: ['10', '8', '12', '9'],
    correcta: '10',
    explicacion: 'La décima o espinela consta de 10 octosílabos con el esquema abbaaccddc y una pausa obligatoria tras el cuarto verso. Vive con enorme vitalidad en la poesía oral latinoamericana.',
  },
  {
    nivel: 'intermedio', categoria: 'rima',
    enunciado: '¿Qué tipo de rima usa el romance?',
    opciones: ['Asonante', 'Consonante', 'Alterna', 'Sin rima'],
    correcta: 'Asonante',
    explicacion: 'El romance utiliza rima asonante en los versos pares (2, 4, 6…), mientras los impares quedan sin rima. Lorca lo aprovecha con maestría en el Romancero gitano.',
  },
  {
    nivel: 'intermedio', categoria: 'regla',
    enunciado: 'Si el último verso termina en palabra aguda, ¿qué se hace al cómputo silábico?',
    opciones: ['Se suma 1', 'Se resta 1', 'No se modifica', 'Se suma 2'],
    correcta: 'Se suma 1',
    explicacion: 'La corrección por acento final es una de las reglas más importantes: verso agudo (acento en última sílaba) = cómputo + 1; llano = sin ajuste; esdrújulo = cómputo − 1.',
  },
  {
    nivel: 'intermedio', categoria: 'regla',
    enunciado: 'Si el último verso termina en palabra esdrújula, ¿qué se hace al cómputo silábico?',
    opciones: ['Se resta 1', 'Se suma 1', 'No se modifica', 'Se suma 2'],
    correcta: 'Se resta 1',
    explicacion: 'El verso esdrújulo (acento en la antepenúltima sílaba) descuenta una sílaba al cómputo. Ejemplo: «sílaba» es esdrújula; si el verso termina en ella, se resta 1 al total contado.',
  },
  {
    nivel: 'intermedio', categoria: 'estrofa',
    enunciado: '¿Qué esquema de rima tiene el serventesio?',
    opciones: ['ABAB', 'ABBA', 'AABB', 'ABCD'],
    correcta: 'ABAB',
    explicacion: 'El serventesio son 4 endecasílabos con rima alterna ABAB. Más dinámico que el cuarteto, es frecuente en el Romanticismo y el Modernismo. Rubén Darío lo usa en «Canción de otoño en primavera».',
  },
  {
    nivel: 'intermedio', categoria: 'verso',
    enunciado: '¿Cómo se llama el verso de 7 sílabas?',
    opciones: ['Heptasílabo', 'Hexasílabo', 'Octosílabo', 'Eneasílabo'],
    correcta: 'Heptasílabo',
    explicacion: 'El heptasílabo (7 sílabas) es el verso de arte menor más largo. Es pieza clave de la lira (combinado con endecasílabos) y de la silva. Muy musical: «Si de mi baja lira» (Garcilaso).',
  },
  {
    nivel: 'intermedio', categoria: 'estrofa',
    enunciado: '¿Qué tipo de rima tiene el soneto clásico?',
    opciones: ['Consonante', 'Asonante', 'Blanca', 'Libre'],
    correcta: 'Consonante',
    explicacion: 'El soneto clásico usa rima consonante (coinciden vocal y consonantes desde la última vocal tónica). El soneto de rima asonante o libre es una variante moderna que se aparta de la forma clásica.',
  },
  {
    nivel: 'intermedio', categoria: 'regla',
    enunciado: '¿Qué licencia poética convierte en diptongo lo que normalmente no lo sería?',
    opciones: ['Sinéresis', 'Diéresis', 'Sinalefa', 'Hiato'],
    correcta: 'Sinéresis',
    explicacion: 'La sinéresis une en una sola sílaba dos vocales que normalmente se pronunciarían separadas (ej: «poeta» como dos sílabas en lugar de tres). La diéresis hace lo contrario: separa un diptongo en dos sílabas.',
  },
  {
    nivel: 'intermedio', categoria: 'verso',
    enunciado: '¿Cuántas sílabas tiene el eneasílabo?',
    opciones: ['9', '8', '10', '11'],
    correcta: '9',
    explicacion: 'El eneasílabo (9 sílabas) es un verso de arte mayor relativamente infrecuente en la tradición clásica, pero más habitual en el Romanticismo y el Modernismo. «Del salón en el ángulo oscuro» (Bécquer).',
  },

  // ── AVANZADO ──
  {
    nivel: 'avanzado', categoria: 'estrofa',
    enunciado: '¿Cuál es el esquema exacto de la décima o espinela?',
    opciones: ['abbaaccddc', 'ababcdcdee', 'abcabcdeef', 'aabbccddee'],
    correcta: 'abbaaccddc',
    explicacion: 'El esquema abbaaccddc es la marca definitoria de la espinela, inventada o codificada por Vicente Espinel en el siglo XVI. La pausa obligatoria tras el cuarto verso (el «puente») es lo que distingue esta estrofa de cualquier otro poema de 10 versos.',
  },
  {
    nivel: 'avanzado', categoria: 'estrofa',
    enunciado: '¿Qué dos metros combina la lira?',
    opciones: ['Heptasílabos y endecasílabos', 'Octosílabos y endecasílabos', 'Heptasílabos y alejandrinos', 'Pentasílabos y endecasílabos'],
    correcta: 'Heptasílabos y endecasílabos',
    explicacion: 'La lira combina heptasílabos (7) y endecasílabos (11) con el esquema 7a 11B 7a 7b 11B. Su nombre viene del primer poema de Garcilaso que la usó: «Si de mi baja lira / tanto pudiese el son…».',
  },
  {
    nivel: 'avanzado', categoria: 'estrofa',
    enunciado: '¿Cuál es el esquema de rima de la octava real?',
    opciones: ['ABABABABCC', 'ABBAABBACC', 'ABABABCDCD', 'AABBCCDDEE'],
    correcta: 'ABABABABCC',
    explicacion: 'La octava real son 8 endecasílabos con esquema ABABABABCC: seis versos en rima alterna y un pareado final de cierre. El pareado le da un remate sentencioso que la distingue de la ottava italiana.',
  },
  {
    nivel: 'avanzado', categoria: 'estrofa',
    enunciado: '¿Qué metros combina libremente la silva?',
    opciones: ['Endecasílabos y heptasílabos', 'Octosílabos y heptasílabos', 'Alejandrinos y endecasílabos', 'Decasílabos y octosílabos'],
    correcta: 'Endecasílabos y heptasílabos',
    explicacion: 'La silva combina endecasílabos y heptasílabos sin esquema de rima fijo. Cada poeta decide la distribución. Góngora la llevó a extremos barrocos en las Soledades; en el XVIII se convirtió en el vehículo de la poesía filosófica.',
  },
  {
    nivel: 'avanzado', categoria: 'verso',
    enunciado: '¿Cuántas sílabas tiene el haiku en su adaptación al español?',
    opciones: ['5-7-5 (17 en total)', '5-5-7 (17 en total)', '7-5-7 (19 en total)', '4-6-4 (14 en total)'],
    correcta: '5-7-5 (17 en total)',
    explicacion: 'El haiku en español se adapta contando sílabas fonéticas: primer verso 5, segundo 7, tercero 5. No es la misma medida que el haiku japonés, que cuenta «morae», unidades de tiempo distintas a las sílabas del español.',
  },
  {
    nivel: 'avanzado', categoria: 'regla',
    enunciado: '¿Qué es la diéresis en métrica española?',
    opciones: [
      'Separar un diptongo en dos sílabas distintas',
      'Unir dos vocales en una sola sílaba',
      'Suprimir la sinalefa entre dos palabras',
      'Añadir una sílaba al cómputo por acento agudo',
    ],
    correcta: 'Separar un diptongo en dos sílabas distintas',
    explicacion: 'La diéresis es la licencia poética que separa un diptongo normal en dos sílabas (ej: «süave» = su-a-ve, 3 sílabas en lugar de 2). Se marca con dos puntos sobre la vocal débil. Es la operación contraria a la sinéresis.',
  },
  {
    nivel: 'avanzado', categoria: 'estrofa',
    enunciado: '¿Cuál es el esquema clásico del soneto petrarquista?',
    opciones: ['ABBA ABBA / CDC DCD', 'ABAB ABAB / CDC DCD', 'ABBA CDCD / EEF GGF', 'ABBA ABBA / CCD EED'],
    correcta: 'ABBA ABBA / CDC DCD',
    explicacion: 'El soneto petrarquista clásico usa dos cuartetos con rima abrazada ABBA + dos tercetos CDC DCD. Los tercetos pueden variar (CDE CDE, CDC DCE…) pero los cuartetos con ABBA son la forma canónica, introducida en castellano por Boscán y Garcilaso.',
  },
  {
    nivel: 'avanzado', categoria: 'rima',
    enunciado: '¿En qué se diferencia el verso blanco del verso libre?',
    opciones: [
      'El blanco tiene metro regular pero sin rima; el libre no tiene ni metro ni rima fijos',
      'El blanco no tiene metro ni rima; el libre tiene rima sin metro',
      'El blanco usa solo endecasílabos; el libre mezcla metros',
      'Son términos equivalentes para la poesía sin rima',
    ],
    correcta: 'El blanco tiene metro regular pero sin rima; el libre no tiene ni metro ni rima fijos',
    explicacion: 'Distinción fundamental: el verso blanco (o suelto) mantiene un metro regular (por ejemplo, endecasílabos) pero renuncia a la rima. El verso libre abandona tanto el metro regular como la rima. Confundir los dos términos es un error frecuente en exámenes.',
  },
];

const NIVEL_CONFIG: Record<Nivel, { label: string; desc: string; color: string }> = {
  basico:      { label: '🟢 Básico',      desc: '10 preguntas esenciales — ESO',           color: '#22c55e' },
  intermedio:  { label: '🟡 Intermedio',  desc: '10 preguntas habituales — Bachillerato',  color: '#eab308' },
  avanzado:    { label: '🔴 Avanzado',    desc: '8 preguntas complejas — Selectividad',    color: '#ef4444' },
};

const CATEGORIA_LABEL: Record<PreguntaMetrica['categoria'], string> = {
  verso:   '📏 Tipo de verso',
  estrofa: '🏛️ Estrofa',
  rima:    '🎵 Rima',
  regla:   '✍️ Regla métrica',
};

const OPCIONES_PREGUNTAS = [8, 10, 15];
const LETRAS = ['A', 'B', 'C', 'D'];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generarPreguntas(nivel: Nivel, num: number): PreguntaMetrica[] {
  const pool = PREGUNTAS.filter(p => p.nivel === nivel);
  return mezclar(pool).slice(0, Math.min(num, pool.length)).map(p => ({
    ...p,
    opciones: mezclar(p.opciones),
  }));
}

function calcularPuntuacion(correctas: number, total: number): number {
  const pct = correctas / total;
  if (pct >= 0.9) return 100;
  if (pct >= 0.7) return Math.round(60 + (pct - 0.7) / 0.2 * 40);
  if (pct >= 0.5) return Math.round(40 + (pct - 0.5) / 0.2 * 20);
  return Math.round(pct * 80);
}

function getResultadoTexto(pct: number): { emoji: string; titulo: string } {
  if (pct >= 0.9) return { emoji: '🏆', titulo: '¡Dominas la métrica!' };
  if (pct >= 0.7) return { emoji: '⭐', titulo: '¡Muy buena puntuación!' };
  if (pct >= 0.5) return { emoji: '👍', titulo: 'Buen intento' };
  return { emoji: '📚', titulo: 'Sigue repasando' };
}

export default function QuizMetricaEstrofasPage() {
  const [pantalla, setPantalla] = useState<Pantalla>('config');
  const [nivel, setNivel] = useState<Nivel>('basico');
  const [numPreguntas, setNumPreguntas] = useState(10);
  const [preguntas, setPreguntas] = useState<PreguntaMetrica[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [tiempoInicio, setTiempoInicio] = useState(0);
  const [tiempoTotal, setTiempoTotal] = useState(0);

  const pregunta = preguntas[preguntaActual];
  const totalPreguntas = preguntas.length;
  const esUltima = preguntaActual === totalPreguntas - 1;

  const iniciarQuiz = useCallback(() => {
    setPreguntas(generarPreguntas(nivel, numPreguntas));
    setPreguntaActual(0);
    setSeleccionada(null);
    setCorrectas(0);
    setTiempoInicio(Date.now());
    setPantalla('quiz');
  }, [nivel, numPreguntas]);

  const responder = useCallback((opcion: string) => {
    if (seleccionada !== null) return;
    setSeleccionada(opcion);
    if (opcion === pregunta.correcta) setCorrectas(prev => prev + 1);
  }, [seleccionada, pregunta]);

  const siguiente = useCallback(() => {
    if (esUltima) {
      setTiempoTotal(Math.round((Date.now() - tiempoInicio) / 1000));
      setPantalla('resultado');
    } else {
      setPreguntaActual(prev => prev + 1);
      setSeleccionada(null);
    }
  }, [esUltima, tiempoInicio]);

  const reiniciar = useCallback(() => iniciarQuiz(), [iniciarQuiz]);
  const volverConfig = useCallback(() => setPantalla('config'), []);

  const puntuacion = useMemo(
    () => calcularPuntuacion(correctas, totalPreguntas),
    [correctas, totalPreguntas]
  );
  const resultadoTexto = useMemo(
    () => getResultadoTexto(totalPreguntas > 0 ? correctas / totalPreguntas : 0),
    [correctas, totalPreguntas]
  );

  const formatTiempo = (seg: number): string => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Quiz de Métrica 🎵</h1>
        <p className={styles.subtitle}>
          Tipos de verso, estrofas, rima y sinalefa · ESO, Bachillerato y Selectividad
        </p>
      </header>

      <LegalNotice />

      {/* ── PANTALLA CONFIGURACIÓN ── */}
      {pantalla === 'config' && (
        <div className={styles.configPanel}>
          <h2 className={styles.configTitle}>Elige tu nivel</h2>
          <div className={styles.nivelGrid}>
            {(Object.entries(NIVEL_CONFIG) as [Nivel, typeof NIVEL_CONFIG[Nivel]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`${styles.nivelBtn} ${nivel === key ? styles.active : ''}`}
                onClick={() => setNivel(key)}
                aria-pressed={nivel === key}
                style={nivel === key ? { borderColor: cfg.color } : undefined}
              >
                <span className={styles.nivelLabel}>{cfg.label}</span>
                <span className={styles.nivelDesc}>{cfg.desc}</span>
              </button>
            ))}
          </div>

          <h3 className={styles.configSubtitle}>Número de preguntas</h3>
          <div className={styles.preguntasRow} role="group" aria-label="Número de preguntas">
            {OPCIONES_PREGUNTAS.map(n => (
              <button
                key={n}
                className={`${styles.pregBtn} ${numPreguntas === n ? styles.active : ''}`}
                onClick={() => setNumPreguntas(n)}
                aria-pressed={numPreguntas === n}
              >
                {n} preguntas
              </button>
            ))}
          </div>

          <button className={styles.btnIniciar} onClick={iniciarQuiz}>
            Empezar Quiz — {numPreguntas} preguntas · {NIVEL_CONFIG[nivel].label}
          </button>

          <div className={styles.temasCubiertos}>
            <span className={styles.temasTitulo}>Temas que se evalúan</span>
            <div className={styles.temasGrid}>
              <span className={styles.temaTag}>📏 Tipos de verso</span>
              <span className={styles.temaTag}>🏛️ Estrofas clásicas</span>
              <span className={styles.temaTag}>🎵 Esquemas de rima</span>
              <span className={styles.temaTag}>✍️ Sinalefa y licencias</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PANTALLA QUIZ ── */}
      {pantalla === 'quiz' && pregunta && (
        <>
          <div className={styles.hudBar}>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{preguntaActual + 1}/{totalPreguntas}</span>
              <span className={styles.hudLabel}>Pregunta</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>{correctas}</span>
              <span className={styles.hudLabel}>Correctas</span>
            </div>
            <div className={styles.hudItem}>
              <span className={styles.hudValor}>
                {preguntaActual > 0 ? Math.round((correctas / preguntaActual) * 100) : 0}%
              </span>
              <span className={styles.hudLabel}>Acierto</span>
            </div>
          </div>

          <div className={styles.progresoBar}>
            <div
              className={styles.progresoFill}
              style={{ width: `${(preguntaActual / totalPreguntas) * 100}%` }}
              role="progressbar"
              aria-valuenow={preguntaActual}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
            />
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaCategoria}>{CATEGORIA_LABEL[pregunta.categoria]}</span>
            <p className={styles.preguntaEnunciado}>{pregunta.enunciado}</p>
            {pregunta.contexto && (
              <blockquote className={styles.preguntaContexto}>"{pregunta.contexto}"</blockquote>
            )}
          </div>

          <div className={styles.opcionesGrid}>
            {pregunta.opciones.map((opcion, i) => {
              let claseExtra = '';
              if (seleccionada !== null) {
                if (opcion === pregunta.correcta) claseExtra = styles.opcionCorrecta;
                else if (opcion === seleccionada) claseExtra = styles.opcionIncorrecta;
                else claseExtra = styles.opcionNeutral;
              }
              return (
                <button
                  key={opcion}
                  className={`${styles.opcion} ${claseExtra}`}
                  onClick={() => responder(opcion)}
                  disabled={seleccionada !== null}
                  aria-label={`Opción ${LETRAS[i]}: ${opcion}`}
                >
                  <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                  {opcion}
                </button>
              );
            })}
          </div>

          {seleccionada !== null && (
            <>
              <div
                className={`${styles.feedbackPanel} ${seleccionada === pregunta.correcta ? styles.feedbackCorrecto : styles.feedbackIncorrecto}`}
                role="alert"
                aria-live="polite"
              >
                <div className={styles.feedbackCabecera}>
                  <span className={styles.feedbackIcono}>
                    {seleccionada === pregunta.correcta ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className={styles.feedbackResultado}>
                      {seleccionada === pregunta.correcta ? '¡Correcto!' : 'Incorrecto'}
                    </p>
                    <p className={styles.feedbackRespuesta}>
                      {seleccionada !== pregunta.correcta && (
                        <>Respuesta correcta: <strong>{pregunta.correcta}</strong></>
                      )}
                    </p>
                  </div>
                </div>
                <div className={styles.feedbackBloque}>
                  <span className={styles.feedbackBloqueIcono} aria-hidden="true">📖</span>
                  <p>{pregunta.explicacion}</p>
                </div>
              </div>

              <button className={styles.btnSiguiente} onClick={siguiente}>
                {esUltima ? 'Ver resultados' : 'Siguiente pregunta →'}
              </button>
            </>
          )}
        </>
      )}

      {/* ── PANTALLA RESULTADO ── */}
      {pantalla === 'resultado' && (
        <div className={styles.resultadoPanel}>
          <span className={styles.resultadoEmoji} aria-hidden="true">{resultadoTexto.emoji}</span>
          <h2 className={styles.resultadoTitulo}>{resultadoTexto.titulo}</h2>
          <p className={styles.resultadoPuntos}>{puntuacion} pts</p>
          <p className={styles.resultadoSubtitulo}>
            {correctas} de {totalPreguntas} respuestas correctas
          </p>

          <div className={styles.statsResultado}>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{correctas}/{totalPreguntas}</span>
              <p className={styles.statRLabel}>Correctas</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{Math.round((correctas / totalPreguntas) * 100)}%</span>
              <p className={styles.statRLabel}>Acierto</p>
            </div>
            <div className={styles.statR}>
              <span className={styles.statRValor}>{formatTiempo(tiempoTotal)}</span>
              <p className={styles.statRLabel}>Tiempo</p>
            </div>
          </div>

          <div className={styles.botonesResultado}>
            <button className={styles.btnRejugar} onClick={reiniciar}>
              🔄 Jugar de nuevo
            </button>
            <button className={styles.btnConfig} onClick={volverConfig}>
              ⚙️ Cambiar nivel
            </button>
          </div>
        </div>
      )}

      <EducationalSection
        title="Métrica española para exámenes"
        subtitle="Tabla de referencia rápida, preguntas frecuentes y método para el comentario de texto"
      >
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Verso</th>
                <th>Sílabas</th>
                <th>Arte</th>
                <th>Uso principal</th>
                <th>Ejemplo canónico</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>Pentasílabo</strong></td><td>5</td><td>Menor</td><td>Lira (combinado)</td><td><em>«Noche oscura»</em> — San Juan</td></tr>
              <tr><td><strong>Hexasílabo</strong></td><td>6</td><td>Menor</td><td>Lírica popular</td><td><em>«Olas gigantes»</em> — Bécquer</td></tr>
              <tr><td><strong>Heptasílabo</strong></td><td>7</td><td>Menor</td><td>Lira, silva</td><td><em>«Si de mi baja lira»</em> — Garcilaso</td></tr>
              <tr><td><strong>Octosílabo</strong></td><td>8</td><td>Menor</td><td>Romance, redondilla</td><td><em>«Verde que te quiero verde»</em> — Lorca</td></tr>
              <tr><td><strong>Eneasílabo</strong></td><td>9</td><td>Mayor</td><td>Romanticismo</td><td><em>«Del salón en el ángulo oscuro»</em> — Bécquer</td></tr>
              <tr><td><strong>Decasílabo</strong></td><td>10</td><td>Mayor</td><td>Épica, Modernismo</td><td><em>«Hemos perdido aun este crepúsculo»</em> — Neruda</td></tr>
              <tr><td><strong>Endecasílabo</strong></td><td>11</td><td>Mayor</td><td>Soneto, lira, octava real</td><td><em>«Yo no nací sino para quereros»</em> — Garcilaso</td></tr>
              <tr><td><strong>Alejandrino</strong></td><td>14</td><td>Mayor</td><td>Modernismo</td><td><em>«La princesa está triste…»</em> — Darío</td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🎓 Estudiante de ESO</strong>
            <p>Céntrate en el nivel básico: tipos de verso más frecuentes (octosílabo y endecasílabo), sinalefa y la diferencia entre rima consonante y asonante. Son los contenidos mínimos evaluables en 3.º y 4.º de ESO.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📘 Estudiante de Bachillerato</strong>
            <p>El nivel intermedio cubre los contenidos del currículo de Lengua de 1.º y 2.º de Bachillerato: estrofas clásicas (soneto, décima, romance), corrección por acento final y esquemas de rima habituales.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🏛️ Preparación Selectividad</strong>
            <p>El nivel avanzado incluye formas complejas (lira, octava real, silva), esquemas exactos (espinela) y distinciones finas (verso blanco vs. verso libre, sinéresis vs. diéresis). Habituales en comentarios de texto EBAU/PAES.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>✍️ Escritor de poesía</strong>
            <p>Conocer los esquemas clásicos es necesario para subvertirlos con intención. Un poeta que usa endecasílabos rotos sabe que los está rompiendo; uno que no conoce la norma simplemente escribe al azar.</p>
          </div>
        </div>

        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuál es la diferencia entre verso blanco y verso libre?</strong>
            <p>El verso blanco mantiene un metro regular (por ejemplo, todos endecasílabos) pero sin rima. El verso libre abandona tanto el metro como la rima fijos. Confundirlos es uno de los errores más frecuentes en exámenes de selectividad.</p>
            <div className={styles.faqTip}>En el teatro del Siglo de Oro se usaban endecasílabos blancos para los parlamentos filosóficos; los octosílabos rimados para la acción.</div>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué se suma 1 al verso agudo?</strong>
            <p>Por convenio métrico: el cómputo siempre llega hasta la última sílaba tónica más una. En un verso llano (acento en penúltima), la última sílaba átona completa el cómputo natural. En un agudo, esa sílaba átona «falta», así que se añade 1 para compensar.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El haiku en español tiene las mismas reglas que el japonés?</strong>
            <p>No. El haiku japonés mide «morae» (unidades de tiempo), no sílabas en el sentido occidental. La adaptación al español usa sílabas fonéticas (5-7-5), lo que produce un poema más largo que el original japonés. Lo esencial es la imagen concreta y la brevedad.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo se identifica la estrofa en un poema desconocido?</strong>
            <p>Sigue este orden: (1) cuenta los versos de cada estrofa, (2) mide el metro del primer verso, (3) marca las rimas con letras (A/B/C para arte mayor, a/b/c para menor). Con metro + esquema de rima puedes identificar casi todas las estrofas clásicas.</p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué estrofas son más habituales en la selectividad?</strong>
            <p>En los comentarios de texto de la EBAU/PAES las más frecuentes son: soneto, romance, redondilla, serventesio y décima. La lira y la octava real aparecen en textos del Renacimiento y el Barroco. La silva es frecuente en el Neoclasicismo.</p>
          </li>
        </ul>

        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Cuenta los versos y la extensión</strong>
              <p>¿Cuántos versos tiene el poema? ¿Se agrupan en estrofas regulares? Un poema de 14 versos endecasílabos es casi siempre un soneto; una serie larga de octosílabos con rima asonante en los pares es un romance.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Divide el primer verso en sílabas métricas</strong>
              <p>Marca las sinalefas (uniones entre palabras) y los diptongos. Aplica la corrección por acento en la última palabra. El resultado es el metro del poema.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Verifica el metro con 2-3 versos más</strong>
              <p>Un metro se confirma con varias muestras. Si hay variación, puede ser una silva (mezcla de 7 y 11) o una licencia puntual del autor.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Marca el esquema de rima</strong>
              <p>Asigna letras a las terminaciones de cada verso (A, B, C… para arte mayor; a, b, c… para menor). Identifica si la rima es consonante (vocal + consonantes) o asonante (solo vocales).</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Nombra la estrofa y comenta su efecto</strong>
              <p>En un examen no basta con nombrar la estrofa. Explica qué efecto rítmico, musical o de sentido produce esa elección formal. El soneto, por ejemplo, crea una estructura de tesis (cuartetos) y antítesis o resolución (tercetos).</p>
            </div>
          </li>
        </ol>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <strong>Memoriza los metros clave</strong>
            <p>Aprende de memoria un verso representativo de cada metro. Cuando cuentes sílabas en un examen, compara mentalmente con ese verso ancla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎵</span>
            <strong>Lee en voz alta</strong>
            <p>La métrica es música. El oído detecta anomalías (un verso «cojo») antes que el recuento matemático. Lee siempre en voz alta antes de contar.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📝</span>
            <strong>Practica con sonetos</strong>
            <p>El soneto concentra endecasílabos, cuartetos y tercetos en 14 versos. Analizar 5 sonetos distintos cubre la mayor parte de los contenidos del examen.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">⚡</span>
            <strong>No olvides la corrección de acento</strong>
            <p>El error más frecuente en los recuentos. Identifica el acento de la última palabra (aguda, llana, esdrújula) ANTES de empezar a contar sílabas.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes en el análisis métrico
          </div>
          <ul className={styles.warningList}>
            <li><span aria-hidden="true">❌</span> Confundir verso blanco con verso libre: el verso blanco tiene metro regular; el verso libre no tiene ni metro ni rima fijos.</li>
            <li><span aria-hidden="true">❌</span> Olvidar la corrección por acento final: identificar si la última palabra es aguda, llana o esdrújula es el paso previo al recuento, no el posterior.</li>
            <li><span aria-hidden="true">❌</span> No aplicar la sinalefa cuando hay «h»: la h muda no impide la sinalefa. «La hora» = la-ho-ra (3 sílabas, 1 sinalefa), no 4.</li>
            <li><span aria-hidden="true">❌</span> Llamar décima a cualquier poema de 10 versos: la espinela tiene un esquema fijo (abbaaccddc) y una pausa obligatoria tras el cuarto verso.</li>
            <li><span aria-hidden="true">❌</span> Confundir sinéresis con sinalefa: la sinalefa une vocales entre palabras distintas; la sinéresis une vocales dentro de una misma palabra.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-metrica-estrofas')} />
      <ShareCard appName="quiz-metrica-estrofas" />
      <Footer appName="quiz-metrica-estrofas" />
    </div>
  );
}
