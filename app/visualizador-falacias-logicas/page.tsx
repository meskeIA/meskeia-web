'use client';
// @disclaimer: exempt
import { useState, useCallback } from 'react';
import styles from './VisualizadorFalaciasLogicas.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Familia {
  id: string;
  icono: string;
  nombre: string;
  count: number;
  definicion: string;
  ejemplos: string[];
  porQueEngana: string;
}

interface Falacia {
  id: string;
  nombre: string;
  icono: string;
  familia: string;
  definicion: string;
  ejemploPolitica: string;
  ejemploPublicidad: string;
  comoResponder: string;
}

interface EjemploDetector {
  id: number;
  cita: string;
  opciones: string[];
  correcta: string;
  explicacion: string;
}

interface TransformacionCard {
  tema: string;
  argumentoFalaz: string;
  falaciaUsada: string;
  argumentoSolido: string;
}

// ── Datos ─────────────────────────────────────────────────────────────────────

const FAMILIAS: Familia[] = [
  {
    id: 'relevancia',
    icono: '🎯',
    nombre: 'Falacias de relevancia',
    count: 3,
    definicion:
      'El argumento no tiene relación lógica con la conclusión que se quiere defender.',
    ejemplos: ['Ad hominem', 'Ad populum', 'Apelación a la emoción'],
    porQueEngana:
      'Distraen la atención hacia aspectos emocionales o personales, evitando el núcleo del debate.',
  },
  {
    id: 'ambiguedad',
    icono: '🔤',
    nombre: 'Falacias de ambigüedad',
    count: 2,
    definicion:
      'Explotan el doble sentido de palabras o estructuras gramaticales para engañar.',
    ejemplos: ['Equívoco', 'Anfibología'],
    porQueEngana:
      'El lenguaje natural es impreciso; estas falacias aprovechan esa imprecisión conscientemente.',
  },
  {
    id: 'presuncion',
    icono: '🔁',
    nombre: 'Falacias de presunción',
    count: 3,
    definicion:
      'Asumen en las premisas lo que se pretende demostrar, o restringen falsamente las opciones.',
    ejemplos: ['Petición de principio', 'Falso dilema', 'Pendiente resbaladiza'],
    porQueEngana:
      'Parecen razonamientos completos pero ocultan premisas no justificadas o conclusiones exageradas.',
  },
  {
    id: 'inductivas',
    icono: '🔬',
    nombre: 'Falacias inductivas',
    count: 3,
    definicion:
      'Generalizan o establecen causas de forma precipitada a partir de evidencia insuficiente.',
    ejemplos: ['Generalización apresurada', 'Falsa analogía', 'Post hoc ergo propter hoc'],
    porQueEngana:
      'El cerebro busca patrones de forma natural; estas falacias explotan esa tendencia.',
  },
  {
    id: 'distraccion',
    icono: '💨',
    nombre: 'Falacias de distracción',
    count: 3,
    definicion:
      'Desvían el debate hacia otros temas para evitar responder al argumento original.',
    ejemplos: ['Hombre de paja', 'Whataboutism', 'Apelación a la autoridad'],
    porQueEngana:
      'Cambian el foco de la discusión sin que la audiencia lo perciba claramente.',
  },
];

const FALACIAS: Falacia[] = [
  {
    id: 'ad-hominem',
    nombre: 'Ad hominem',
    icono: '👤',
    familia: 'relevancia',
    definicion: 'Atacar a la persona que defiende un argumento en lugar de refutar el argumento mismo.',
    ejemploPolitica: '"No puedes hablar de gestión económica, tú que has cobrado subsidios toda tu vida."',
    ejemploPublicidad: 'Campaña que desacredita a un científico que critica un producto señalando que "recibe dinero de la competencia" sin refutar sus datos.',
    comoResponder: 'Separar la persona del argumento: "Lo que dices sobre mí puede ser cierto o no, pero eso no afecta a si el argumento es válido. ¿Tienes algún contraargumento concreto?"',
  },
  {
    id: 'hombre-paja',
    nombre: 'Hombre de paja',
    icono: '🌾',
    familia: 'distraccion',
    definicion: 'Distorsionar o exagerar la posición del oponente para atacar una versión más débil o absurda.',
    ejemploPolitica: '"Los que piden reducir el uso del coche quieren que todos volvamos a las cavernas."',
    ejemploPublicidad: 'Marca que presenta al producto rival como "descuidado con la seguridad" cuando el rival solo tiene características distintas.',
    comoResponder: '"No es exactamente lo que he dicho. Mi posición es [posición real]. ¿Puedes refutarla directamente?"',
  },
  {
    id: 'falso-dilema',
    nombre: 'Falso dilema',
    icono: '⚖️',
    familia: 'presuncion',
    definicion: 'Presentar solo dos opciones como si fueran las únicas posibles, ignorando alternativas intermedias.',
    ejemploPolitica: '"O apruebas este presupuesto sin cambios, o la economía colapsará."',
    ejemploPublicidad: '"O compras nuestra solución premium, o pierdes clientes."',
    comoResponder: '"¿Por qué solo esas dos opciones? Podríamos también considerar [tercera alternativa]."',
  },
  {
    id: 'pendiente-resbaladiza',
    nombre: 'Pendiente resbaladiza',
    icono: '📉',
    familia: 'presuncion',
    definicion: 'Afirmar que si ocurre A, inevitablemente ocurrirá Z sin justificar cada paso de la cadena.',
    ejemploPolitica: '"Si permitimos el matrimonio entre personas del mismo sexo, después querrán casarse con animales."',
    ejemploPublicidad: '"Si no compras el antivirus hoy, mañana te robarán todos tus datos bancarios."',
    comoResponder: '"¿Por qué A lleva necesariamente a Z? ¿Dónde está la evidencia de cada paso de esa cadena?"',
  },
  {
    id: 'ad-populum',
    nombre: 'Ad populum',
    icono: '👥',
    familia: 'relevancia',
    definicion: 'Afirmar que algo es verdadero o correcto porque mucha gente lo cree o lo hace.',
    ejemploPolitica: '"El 70% de los ciudadanos apoya esta medida, así que debe ser la correcta."',
    ejemploPublicidad: '"¡El producto más vendido de España!" — como si las ventas garantizasen la calidad.',
    comoResponder: '"La popularidad no determina la verdad. Históricamente, mayorías han estado equivocadas. ¿Qué evidencia hay más allá de los números?"',
  },
  {
    id: 'apelacion-autoridad',
    nombre: 'Apelación a la autoridad',
    icono: '🏅',
    familia: 'distraccion',
    definicion: 'Invocar a una autoridad o experto en lugar de presentar el argumento, o citar a un experto fuera de su campo.',
    ejemploPolitica: '"Este economista Nobel apoya nuestra reforma" — sin explicar por qué la reforma es buena.',
    ejemploPublicidad: '"Recomendado por dentistas" — sin especificar qué dentistas, cuántos ni con qué metodología.',
    comoResponder: '"¿Cuáles son los argumentos concretos? La autoridad respalda una idea, no la demuestra."',
  },
  {
    id: 'post-hoc',
    nombre: 'Post hoc ergo propter hoc',
    icono: '🔄',
    familia: 'inductivas',
    definicion: 'Asumir que porque B ocurre después de A, A causó B. Confundir secuencia temporal con causalidad.',
    ejemploPolitica: '"Desde que llegó este gobierno, el paro subió. Ellos son los responsables." (ignorando factores globales).',
    ejemploPublicidad: '"Desde que uso este suplemento, duermo mejor." — sin considerar otros cambios de hábitos.',
    comoResponder: '"¿Tienes evidencia de que A causó B y no que ambos ocurrieron por una tercera causa o simplemente coincidencia?"',
  },
  {
    id: 'generalizacion',
    nombre: 'Generalización apresurada',
    icono: '🔍',
    familia: 'inductivas',
    definicion: 'Sacar una conclusión general a partir de una muestra demasiado pequeña o no representativa.',
    ejemploPolitica: '"He hablado con tres inmigrantes que no trabajaban. La inmigración es un problema de vagancia."',
    ejemploPublicidad: '"¡Nuestros 200 clientes están satisfechos!" — con 200 de 50.000 usuarios.',
    comoResponder: '"¿Cuántos casos has observado? ¿Son representativos de la población total? ¿Hay estudios más amplios?"',
  },
  {
    id: 'apelacion-emocion',
    nombre: 'Apelación a la emoción',
    icono: '❤️',
    familia: 'relevancia',
    definicion: 'Usar emociones como miedo, ira, compasión o esperanza en lugar de razones para persuadir.',
    ejemploPolitica: 'Anuncio de campaña con imágenes de familias en apuros para apoyar una política sin datos sobre su efectividad.',
    ejemploPublicidad: '"Piensa en tus hijos: ¿les darás lo mejor o conformarás con lo mediocre?"',
    comoResponder: '"Entiendo la emoción que transmites, pero necesito evidencia. ¿Qué datos concretos respaldan esta propuesta?"',
  },
  {
    id: 'whataboutism',
    nombre: 'Whataboutism',
    icono: '↩️',
    familia: 'distraccion',
    definicion: 'Responder a una crítica señalando un problema diferente del interlocutor, en lugar de contestar a la crítica.',
    ejemploPolitica: '"Nos criticas por los sobrecostes de esta obra, ¿y los escándalos de tu partido?"',
    ejemploPublicidad: 'Marca acusada de publicidad engañosa que responde señalando prácticas de la competencia.',
    comoResponder: '"Puede que tengas razón en ese punto también, pero eso no responde a la crítica original. ¿Podemos hablar de eso primero?"',
  },
  {
    id: 'peticion-principio',
    nombre: 'Petición de principio',
    icono: '🔁',
    familia: 'presuncion',
    definicion: 'Asumir en las premisas lo que se quiere demostrar en la conclusión, creando un argumento circular.',
    ejemploPolitica: '"Esta ley es necesaria porque sin ella no tendríamos lo que nos da esta ley."',
    ejemploPublicidad: '"Nuestro producto es el mejor porque ningún producto lo supera." — sin evidencia externa.',
    comoResponder: '"Tu premisa ya asume la conclusión. ¿Puedes dar una razón independiente que la apoye?"',
  },
  {
    id: 'falsa-analogia',
    nombre: 'Falsa analogía',
    icono: '🔀',
    familia: 'inductivas',
    definicion: 'Comparar dos situaciones superficialmente similares como si fueran equivalentes, ignorando diferencias clave.',
    ejemploPolitica: '"Gestionar un país es como gestionar tu casa: no gastes más de lo que ingresas." (ignora política monetaria, deuda soberana, ciclos económicos).',
    ejemploPublicidad: '"El acero es fuerte, nuestro suplemento también te hará fuerte."',
    comoResponder: '"¿En qué aspectos son realmente comparables? ¿Qué diferencias importantes estás ignorando?"',
  },
];

const EJEMPLOS_DETECTOR: EjemploDetector[] = [
  {
    id: 1,
    cita: '"No puedes criticar el sistema educativo si tú no eres profesor."',
    opciones: ['Ad hominem', 'Falso dilema', 'Ad populum', 'Whataboutism'],
    correcta: 'Ad hominem',
    explicacion:
      'Atacar la credencial de quien critica en lugar de refutar el argumento sobre el sistema educativo. La crítica puede ser válida independientemente de quien la haga.',
  },
  {
    id: 2,
    cita: '"Si legalizamos el cannabis, después querrán legalizar la cocaína, luego la heroína, y al final todo estará permitido."',
    opciones: ['Generalización apresurada', 'Pendiente resbaladiza', 'Falsa analogía', 'Post hoc'],
    correcta: 'Pendiente resbaladiza',
    explicacion:
      'Se asume que A lleva inevitablemente a Z sin justificar cada paso. Muchos países han regulado el cannabis sin que se produzcan las consecuencias descritas.',
  },
  {
    id: 3,
    cita: '"El 80% de los españoles quiere una reducción de impuestos, así que debe ser la política correcta."',
    opciones: ['Ad populum', 'Apelación a la autoridad', 'Hombre de paja', 'Petición de principio'],
    correcta: 'Ad populum',
    explicacion:
      'La popularidad de una opinión no la convierte en correcta. Históricamente, mayorías han apoyado políticas que luego resultaron perjudiciales.',
  },
  {
    id: 4,
    cita: '"Desde que empecé a tomar este suplemento vitamínico dejé de resfiarme en invierno."',
    opciones: ['Falsa analogía', 'Generalización apresurada', 'Post hoc ergo propter hoc', 'Apelación a la emoción'],
    correcta: 'Post hoc ergo propter hoc',
    explicacion:
      'Confunde secuencia temporal con causalidad. Pudo influir el suplemento, pero también la dieta, el descanso, el clima o simplemente la suerte.',
  },
  {
    id: 5,
    cita: '"O estás con nosotros en esta propuesta, o eres un obstáculo para el progreso."',
    opciones: ['Ad hominem', 'Falso dilema', 'Whataboutism', 'Pendiente resbaladiza'],
    correcta: 'Falso dilema',
    explicacion:
      'Existen múltiples posiciones posibles: apoyar parcialmente, proponer enmiendas, abstenerse o pedir más información antes de decidir.',
  },
];

const TRANSFORMACIONES: TransformacionCard[] = [
  {
    tema: 'Política fiscal',
    argumentoFalaz: '"Todo el mundo sabe que bajar impuestos reactiva la economía."',
    falaciaUsada: 'Ad populum',
    argumentoSolido: 'Los estudios del FMI (2020-2024) muestran que en economías con alta desigualdad, las bajadas de impuestos a rentas altas no aumentan el PIB per cápita de forma significativa a corto plazo.',
  },
  {
    tema: 'Alimentación',
    argumentoFalaz: '"Mi abuelo comía bacon cada día y vivió hasta los 95 años, así que las carnes procesadas no son tan malas."',
    falaciaUsada: 'Generalización apresurada',
    argumentoSolido: 'La OMS clasifica las carnes procesadas como carcinógenos del grupo 1 basándose en estudios con más de 800.000 participantes. Un caso anecdótico no refuta esa evidencia epidemiológica.',
  },
  {
    tema: 'Tecnología',
    argumentoFalaz: '"Si permites que los empleados trabajen desde casa, perderás el control total de la empresa."',
    falaciaUsada: 'Pendiente resbaladiza',
    argumentoSolido: 'Estudios de Stanford (2015-2023) muestran que el teletrabajo bien implementado aumenta la productividad un 13% en media, sin necesidad de perder supervisión mediante herramientas adecuadas.',
  },
  {
    tema: 'Debate público',
    argumentoFalaz: '"No puedes hablar de gestión deportiva, nunca has jugado en primera división."',
    falaciaUsada: 'Ad hominem',
    argumentoSolido: 'Los datos de gestión de clubes deportivos muestran que los directivos con formación en economía del deporte tienen mejores resultados financieros que los ex-jugadores sin esa formación, independientemente de su trayectoria atlética.',
  },
];

// ── Componente principal ───────────────────────────────────────────────────────

export default function VisualizadorFalaciasLogicasPage() {
  const [familiaActiva, setFamiliaActiva] = useState<string | null>(null);
  const [falaciaExpandida, setFalaciaExpandida] = useState<string | null>(null);
  const [respuestasDetector, setRespuestasDetector] = useState<Record<number, string>>({});
  const [aciertos, setAciertos] = useState(0);
  const [totalRespondido, setTotalRespondido] = useState(0);

  const toggleFamilia = useCallback((id: string) => {
    setFamiliaActiva(prev => (prev === id ? null : id));
  }, []);

  const toggleFalacia = useCallback((id: string) => {
    setFalaciaExpandida(prev => (prev === id ? null : id));
  }, []);

  const responderEjemplo = useCallback(
    (ejemploId: number, opcion: string, correcta: string) => {
      if (respuestasDetector[ejemploId] !== undefined) return;
      setRespuestasDetector(prev => ({ ...prev, [ejemploId]: opcion }));
      setTotalRespondido(prev => prev + 1);
      if (opcion === correcta) {
        setAciertos(prev => prev + 1);
      }
    },
    [respuestasDetector]
  );

  const familiaSeleccionada = FAMILIAS.find(f => f.id === familiaActiva) ?? null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Pensamiento Crítico</span>
          <h1 className={styles.heroTitle}>Falacias Lógicas</h1>
          <p className={styles.heroSubtitle}>
            Detecta los 12 errores de razonamiento más comunes
          </p>
          <p className={styles.heroDesc}>
            En política, publicidad y debate cotidiano nos intentan convencer con argumentos que parecen
            sólidos pero están rotos por dentro. Aprende a identificarlos y a construir argumentos reales.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ── Sección 1: Las 5 familias ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🗂️</span>
            <h2 className={styles.sectionTitle}>Las 5 familias de falacias</h2>
            <p className={styles.sectionSubtitle}>
              Haz clic en una familia para ver su definición y por qué engañan tan fácilmente.
            </p>
          </div>

          <div className={styles.familiasGrid}>
            {FAMILIAS.map(familia => (
              <button
                key={familia.id}
                type="button"
                className={`${styles.familiaCard} ${familiaActiva === familia.id ? styles.familiaCardActiva : ''}`}
                onClick={() => toggleFamilia(familia.id)}
                aria-expanded={familiaActiva === familia.id}
                aria-controls={`detalle-${familia.id}`}
              >
                <span className={styles.familiaIcono} aria-hidden="true">{familia.icono}</span>
                <p className={styles.familiaNombre}>{familia.nombre}</p>
                <span className={styles.familiaCount}>{familia.count} falacias</span>
              </button>
            ))}
          </div>

          {familiaSeleccionada && (
            <div
              id={`detalle-${familiaSeleccionada.id}`}
              className={styles.familiaDetalle}
              role="region"
              aria-label={`Detalle: ${familiaSeleccionada.nombre}`}
            >
              <p className={styles.familiaDetalleTitle}>
                {familiaSeleccionada.icono} {familiaSeleccionada.nombre}
              </p>
              <p className={styles.familiaDetalleDesc}>{familiaSeleccionada.definicion}</p>
              <p className={styles.familiaDetalleDesc}>
                <strong>Incluye:</strong> {familiaSeleccionada.ejemplos.join(', ')}.
              </p>
              <p className={styles.familiaDetalleEngano}>
                ¿Por qué engañan? {familiaSeleccionada.porQueEngana}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Sección 2: 12 falacias en detalle ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">📖</span>
            <h2 className={styles.sectionTitle}>Las 12 falacias en detalle</h2>
            <p className={styles.sectionSubtitle}>
              Haz clic en cualquier tarjeta para ver ejemplos reales y cómo responder.
            </p>
          </div>

          <div className={styles.falaciaGrid}>
            {FALACIAS.map(falacia => {
              const expandida = falaciaExpandida === falacia.id;
              return (
                <article
                  key={falacia.id}
                  className={`${styles.falaciaCard} ${expandida ? styles.falaciaCardExpandida : ''}`}
                  onClick={() => toggleFalacia(falacia.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFalacia(falacia.id); } }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandida}
                >
                  {!expandida ? (
                    <>
                      <div className={styles.falaciaHeader}>
                        <span className={styles.falaciaIcono} aria-hidden="true">{falacia.icono}</span>
                        <h3 className={styles.falaciaNombre}>{falacia.nombre}</h3>
                      </div>
                      <p className={styles.falaciaDefinicion}>{falacia.definicion}</p>
                      <span className={styles.falaciaExpand}>Ver ejemplos →</span>
                    </>
                  ) : (
                    <>
                      <div className={styles.falaciaExpandCol}>
                        <div className={styles.falaciaHeader}>
                          <span className={styles.falaciaIcono} aria-hidden="true">{falacia.icono}</span>
                          <h3 className={styles.falaciaNombre}>{falacia.nombre}</h3>
                        </div>
                        <p className={styles.falaciaDefinicion}>{falacia.definicion}</p>
                        <div className={styles.falaciaExpandItem}>
                          <p className={styles.falaciaExpandLabel}>Ejemplo en política</p>
                          <p className={styles.falaciaExpandText}>{falacia.ejemploPolitica}</p>
                        </div>
                        <div className={styles.falaciaExpandItem}>
                          <p className={styles.falaciaExpandLabel}>Ejemplo en publicidad</p>
                          <p className={styles.falaciaExpandText}>{falacia.ejemploPublicidad}</p>
                        </div>
                      </div>
                      <div className={styles.falaciaExpandCol}>
                        <div className={styles.falaciaRespuesta}>
                          <p className={styles.falaciaExpandLabel}>Cómo responder</p>
                          <p className={styles.falaciaExpandText}>{falacia.comoResponder}</p>
                        </div>
                        <button
                          type="button"
                          className={styles.btnSecundario}
                          onClick={(e) => { e.stopPropagation(); toggleFalacia(falacia.id); }}
                          aria-label="Cerrar detalle"
                        >
                          Cerrar ✕
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sección 3: Detector de falacias ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🕵️</span>
            <h2 className={styles.sectionTitle}>Detector de falacias</h2>
            <p className={styles.sectionSubtitle}>
              Lee cada cita y selecciona qué falacia contiene antes de ver la respuesta.
            </p>
          </div>

          <div
            className={styles.detectorGrid}
            role="list"
            aria-label="Ejemplos de falacias para detectar"
          >
            {EJEMPLOS_DETECTOR.map(ejemplo => {
              const respuesta = respuestasDetector[ejemplo.id];
              const respondido = respuesta !== undefined;
              const esAcierto = respuesta === ejemplo.correcta;

              return (
                <article
                  key={ejemplo.id}
                  className={styles.ejemploCard}
                  role="listitem"
                >
                  <p className={styles.ejemploNum}>Ejemplo {ejemplo.id}</p>
                  <p className={styles.ejemploCita}>&ldquo;{ejemplo.cita}&rdquo;</p>

                  {!respondido && (
                    <>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                        ¿Qué falacia es?
                      </p>
                      <div className={styles.opcionesGrid} role="group" aria-label="Opciones de respuesta">
                        {ejemplo.opciones.map(opcion => (
                          <button
                            key={opcion}
                            type="button"
                            className={styles.opcionBtn}
                            onClick={() => responderEjemplo(ejemplo.id, opcion, ejemplo.correcta)}
                          >
                            {opcion}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {respondido && (
                    <div className={styles.ejemploRespuesta} role="alert" aria-live="polite">
                      <p className={styles.ejemploFalacia}>
                        {ejemplo.correcta}
                        {esAcierto ? (
                          <span className={styles.aciertoBadge}>✓ Acertaste</span>
                        ) : (
                          <span className={styles.erroBadge}>✗ Respondiste: {respuesta}</span>
                        )}
                      </p>
                      <p className={styles.ejemploExplicacion}>{ejemplo.explicacion}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {totalRespondido > 0 && (
            <div className={styles.contadorAciertos} role="status" aria-live="polite">
              <p className={styles.contadorNum}>{aciertos}/{totalRespondido}</p>
              <p className={styles.contadorLabel}>
                {totalRespondido < EJEMPLOS_DETECTOR.length
                  ? `Responde todos para ver tu puntuación final (${EJEMPLOS_DETECTOR.length - totalRespondido} restantes)`
                  : aciertos === EJEMPLOS_DETECTOR.length
                    ? '¡Perfecto! Eres un experto en detectar falacias.'
                    : aciertos >= 3
                      ? 'Bien hecho. Repasa las que fallaste para afinar el ojo.'
                      : 'Sigue practicando. ¡Con estas herramientas lo tendrás más fácil!'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Sección 4: Constructor de argumentos sólidos ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🏗️</span>
            <h2 className={styles.sectionTitle}>Construye argumentos sólidos</h2>
            <p className={styles.sectionSubtitle}>
              Cuatro pilares de un argumento que no usa falacias, con ejemplos de transformación real.
            </p>
          </div>

          <div className={styles.constructorPilaresGrid}>
            {[
              { icono: '📊', titulo: 'Premisas verificables', desc: 'Datos concretos, cifras con fuente, hechos comprobables por cualquier persona.' },
              { icono: '🔗', titulo: 'Inferencia válida', desc: 'La conclusión se sigue lógicamente de las premisas sin saltos injustificados.' },
              { icono: '🎯', titulo: 'Relevancia', desc: 'Las premisas tienen relación directa con la conclusión, sin desvíos ni distracciones.' },
              { icono: '⚖️', titulo: 'Proporcionalidad', desc: 'No exagerar ni minimizar la evidencia. El argumento se ajusta a lo que los datos muestran.' },
            ].map(pilar => (
              <div key={pilar.titulo} className={styles.pilarCard}>
                <span className={styles.pilarIcono} aria-hidden="true">{pilar.icono}</span>
                <p className={styles.pilarTitulo}>{pilar.titulo}</p>
                <p className={styles.pilarDesc}>{pilar.desc}</p>
              </div>
            ))}
          </div>

          <h3 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Argumentos transformados: de falaz a sólido
          </h3>
          <div className={styles.transformacionesGrid}>
            {TRANSFORMACIONES.map(t => (
              <div key={t.tema} className={styles.transformacionCard}>
                <div className={styles.transformacionTema}>{t.tema}</div>
                <div className={styles.transformacionBody}>
                  <div className={styles.transformacionCol}>
                    <p className={`${styles.transformacionLabel} ${styles.transformacionLabelMalo}`}>
                      ✗ Argumento falaz
                    </p>
                    <p className={styles.transformacionTexto}>{t.argumentoFalaz}</p>
                    <p className={styles.transformacionFalacia}>Falacia: {t.falaciaUsada}</p>
                  </div>
                  <div className={styles.transformacionCol}>
                    <p className={`${styles.transformacionLabel} ${styles.transformacionLabelBueno}`}>
                      ✓ Argumento sólido
                    </p>
                    <p className={styles.transformacionTexto}>{t.argumentoSolido}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.warningBox} role="note">
            <strong>Nota:</strong> Detectar falacias no significa que la conclusión sea falsa.
            Un argumento puede llegar a una conclusión correcta por un camino incorrecto.
            El objetivo es exigir razones bien construidas, no ganar debates a toda costa.
          </div>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection title="¿Por qué importa la lógica informal?" subtitle="Historia, sesgos cognitivos y pensamiento crítico">
        <h3>Historia: Aristóteles, los sofistas y el arte de engañar</h3>
        <p>
          Aristóteles fue el primero en sistematizar los errores de razonamiento en su obra
          <em> Refutaciones sofísticas</em> (siglo IV a.C.). Los sofistas eran maestros griegos
          de la retórica que cobraban por enseñar a ganar debates con independencia de la verdad.
          Aristóteles quiso distinguir entre argumentos válidos y trucos retóricos.
        </p>
        <p>
          La lógica informal moderna (siglo XX) amplió ese catálogo: hoy se identifican más de
          100 tipos de falacias distintas, aunque las 12 más comunes cubren la mayoría de lo que
          encontramos en política, medios y publicidad.
        </p>

        <h3>Por qué las falacias funcionan: sesgos cognitivos</h3>
        <p>
          Las falacias son efectivas porque explotan mecanismos cognitivos que normalmente nos ayudan:
        </p>
        <ul>
          <li>
            <strong>Sesgo de confirmación</strong>: tendemos a aceptar argumentos que confirman lo que ya creemos,
            aunque sean lógicamente débiles.
          </li>
          <li>
            <strong>Heurística de disponibilidad</strong>: sobrestimamos la probabilidad de lo que recordamos
            fácilmente. El post hoc explota esto: si lo viviste, parece causal.
          </li>
          <li>
            <strong>Procesamiento dual</strong>: el sistema 1 (rápido, intuitivo) acepta muchas falacias
            sin que el sistema 2 (lento, analítico) las cuestione — especialmente bajo presión emocional.
          </li>
          <li>
            <strong>Efecto bandwagon</strong>: el ad populum usa nuestra tendencia evolutiva a seguir
            al grupo, que históricamente fue adaptativa.
          </li>
        </ul>

        <h3>Falacias en redes sociales: los formatos que más las favorecen</h3>
        <p>
          Los formatos cortos (tweets, reels, stories) favorecen las falacias porque:
        </p>
        <ul>
          <li>No hay espacio para matices ni fuentes.</li>
          <li>Las emociones intensas generan más interacción (algoritmos).</li>
          <li>El scroll rápido activa el sistema 1 y desactiva el pensamiento crítico.</li>
          <li>La repetición hace que argumentos falaces parezcan verdades consolidadas (<em>ilusión de verdad</em>).</li>
        </ul>

        <h3>Falacia formal vs. falacia informal</h3>
        <p>
          <strong>Falacias formales</strong>: el error está en la estructura del argumento (lógica simbólica).
          Por ejemplo, afirmar que &ldquo;si llueve, el suelo está mojado; el suelo está mojado, luego llueve&rdquo;
          es una falacia formal (afirmar el consecuente).
        </p>
        <p>
          <strong>Falacias informales</strong>: el error está en el contenido, el contexto o la relevancia,
          no en la forma lógica. Son las que vemos en política y publicidad cotidiana.
          Las 12 falacias de este visualizador son todas informales.
        </p>

        <h3>Diferencia entre falacia y mentira</h3>
        <p>
          Una falacia no es necesariamente una mentira: las premisas pueden ser ciertas pero el
          razonamiento ser incorrecto. La mentira es un problema de veracidad; la falacia, de validez.
          En el debate público conviven ambas, lo que hace más difícil el análisis crítico.
        </p>

        <h3>Recursos para seguir aprendiendo</h3>
        <ul>
          <li><em>Pensar bien, sentirse bien</em> — Albert Ellis</li>
          <li><em>El arte de tener razón</em> — Arthur Schopenhauer (38 estratagemas retóricas)</li>
          <li><em>Thinking, Fast and Slow</em> — Daniel Kahneman</li>
          <li>Your Logical Fallacy Is (yourlogicalfallacyis.com) — recurso visual en inglés</li>
          <li>Cursos de pensamiento crítico en Coursera / edX</li>
        </ul>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-falacias-logicas')} />
      <ShareCard appName="visualizador-falacias-logicas" />
      <Footer appName="visualizador-falacias-logicas" />
    </div>
  );
}
