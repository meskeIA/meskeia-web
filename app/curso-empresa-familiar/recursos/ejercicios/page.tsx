'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../../CursoEmpresaFamiliar.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface Exercise {
  id: string;
  title: string;
  category: string;
  description: string;
  questions: string[];
  reflection: string;
}

const EXERCISES: Exercise[] = [
  {
    id: 'tres-circulos',
    title: 'Análisis de los Tres Círculos',
    category: 'Diagnóstico',
    description: 'Identifica a los principales stakeholders de tu empresa familiar y ubícalos en el modelo de los Tres Círculos.',
    questions: [
      '¿Quiénes son miembros de la familia pero NO trabajan en la empresa ni son propietarios?',
      '¿Quiénes son propietarios pero NO trabajan en la empresa ni son familiares?',
      '¿Quiénes trabajan en la empresa pero NO son propietarios ni familiares?',
      '¿Quiénes ocupan la intersección central (familia + propiedad + trabajo)?',
      '¿Qué conflictos potenciales identificas entre los diferentes grupos?'
    ],
    reflection: 'Reflexiona sobre cómo los intereses de cada grupo pueden alinearse o entrar en conflicto. ¿Qué mecanismos de comunicación existen entre los diferentes stakeholders?'
  },
  {
    id: 'protocolo-basico',
    title: 'Elementos del Protocolo Familiar',
    category: 'Gobierno',
    description: 'Evalúa los elementos que debería contener el protocolo de tu empresa familiar.',
    questions: [
      '¿Existen valores familiares documentados y compartidos? ¿Cuáles son?',
      '¿Hay reglas claras sobre quién puede trabajar en la empresa y en qué condiciones?',
      '¿Cómo se toman las decisiones sobre distribución de dividendos?',
      '¿Existen restricciones para la venta de acciones a terceros?',
      '¿Qué mecanismos hay para resolver conflictos familiares?',
      '¿Cada cuánto tiempo se revisa o actualiza el protocolo?'
    ],
    reflection: 'Si no existe un protocolo formal, identifica los 3 temas más urgentes que deberían acordarse. Si existe, evalúa si está actualizado y si todos los familiares lo conocen.'
  },
  {
    id: 'modelo-empresa',
    title: 'Identificación del Modelo de Empresa Familiar',
    category: 'Modelos',
    description: 'Determina qué modelo de empresa familiar describe mejor tu situación actual.',
    questions: [
      '¿Cuántas personas toman las decisiones estratégicas clave? ¿Una, pocas o muchas?',
      '¿Los puestos directivos están ocupados principalmente por familiares o por externos?',
      '¿Existe un Consejo de Administración con consejeros independientes?',
      '¿Cómo se evalúa el desempeño de los familiares que trabajan en la empresa?',
      '¿La familia se ve principalmente como gestora o como propietaria?'
    ],
    reflection: 'Compara tus respuestas con los modelos: Capitán, Emperador, Equipo Familiar, Familia Profesional o Corporación. ¿Cuál se ajusta mejor? ¿Es el modelo adecuado para el tamaño y etapa actual de la empresa?'
  },
  {
    id: 'sucesion-preparacion',
    title: 'Evaluación de la Preparación Sucesoria',
    category: 'Sucesión',
    description: 'Analiza el estado de preparación para la transición generacional en tu empresa.',
    questions: [
      '¿Existe un plan de sucesión documentado? ¿Quién lo conoce?',
      '¿Hay uno o varios posibles sucesores identificados? ¿Cuáles son los criterios de selección?',
      '¿Qué formación y experiencia externa tienen los potenciales sucesores?',
      '¿El líder actual ha definido cuándo y cómo cederá el control?',
      '¿Cómo se gestionará la transición de la propiedad (herencia, donación, venta)?',
      '¿Existe un plan de contingencia si el líder actual no puede continuar?'
    ],
    reflection: 'La sucesión es un proceso, no un evento. Evalúa si tu empresa está en las fases iniciales (concienciación), intermedias (preparación) o avanzadas (transición) de este proceso.'
  },
  {
    id: 'profesionalizacion-audit',
    title: 'Auditoría de Profesionalización',
    category: 'Profesionalización',
    description: 'Evalúa el nivel de profesionalización de la gestión en tu empresa familiar.',
    questions: [
      '¿Existen descripciones de puesto formales para todas las posiciones directivas?',
      '¿Se aplican las mismas políticas de evaluación del desempeño a familiares y no familiares?',
      '¿La remuneración de los familiares está basada en criterios de mercado?',
      '¿Hay sistemas de información gerencial que permitan tomar decisiones basadas en datos?',
      '¿Existe un plan estratégico formal revisado periódicamente?',
      '¿Se realizan auditorías externas de las cuentas?'
    ],
    reflection: 'Puntúa cada pregunta del 1 (no existe) al 5 (totalmente implementado). Una puntuación baja indica áreas de mejora prioritarias para la profesionalización.'
  },
  {
    id: 'conflictos-potenciales',
    title: 'Mapa de Conflictos Potenciales',
    category: 'Conflictos',
    description: 'Identifica las principales fuentes de conflicto en tu empresa familiar.',
    questions: [
      '¿Hay familiares que trabajan en la empresa cuyo desempeño genera tensiones?',
      '¿Existen desacuerdos sobre la política de dividendos vs reinversión?',
      '¿Hay conflictos entre los que trabajan en la empresa y los que solo son propietarios?',
      '¿Qué rol juegan los cónyuges de los familiares en las decisiones?',
      '¿Existe rivalidad entre ramas familiares o entre hermanos?',
      '¿Hay claridad sobre la valoración de la empresa para una posible salida de socios?'
    ],
    reflection: 'Los conflictos no resueltos tienden a escalar. Identifica cuál de estos temas requiere atención más urgente y qué mecanismo (mediación, protocolo, reestructuración) podría ayudar.'
  },
  {
    id: 'caso-practico-inditex',
    title: 'Caso de Estudio: Inditex',
    category: 'Casos Reales',
    description: 'Analiza las decisiones de gobierno y sucesión en Inditex como empresa familiar.',
    questions: [
      '¿Qué modelo de empresa familiar representa Inditex actualmente?',
      '¿Cómo gestionó Amancio Ortega la transición a la segunda generación?',
      '¿Qué papel jugó Pablo Isla como directivo externo no familiar?',
      '¿Cómo equilibra Inditex el control familiar con la profesionalización?',
      '¿Qué lecciones de Inditex serían aplicables a empresas familiares más pequeñas?'
    ],
    reflection: 'Inditex ha logrado mantener el control familiar mientras cotiza en bolsa y opera globalmente. Reflexiona sobre qué estructuras de gobierno lo han hecho posible.'
  },
  {
    id: 'plan-accion-personal',
    title: 'Plan de Acción Personal',
    category: 'Síntesis',
    description: 'Diseña un plan de acción concreto basado en lo aprendido en el curso.',
    questions: [
      '¿Cuál es el desafío más urgente que enfrenta tu empresa familiar actualmente?',
      '¿Qué concepto del curso consideras más relevante para abordar ese desafío?',
      '¿Qué tres acciones concretas podrías implementar en los próximos 90 días?',
      '¿Quiénes deberían participar en la implementación de estas acciones?',
      '¿Cómo medirás el éxito de estas iniciativas?',
      '¿Qué obstáculos anticipas y cómo los abordarás?'
    ],
    reflection: 'El conocimiento sin acción no transforma. Comparte este plan con otros miembros de la familia empresaria y busca su compromiso para avanzar juntos.'
  }
];

export default function EjerciciosPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.chapterHero}>
        <span className={styles.chapterHeroIcon}>✏️</span>
        <h1 className={styles.chapterHeroTitle}>Ejercicios Prácticos</h1>
        <p className={styles.chapterHeroSubtitle}>
          {EXERCISES.length} ejercicios para aplicar los conceptos del curso a tu propia empresa familiar
        </p>
      </header>

      {/* Lista de ejercicios o ejercicio seleccionado */}
      {selectedExercise ? (
        <div className={styles.chapterContainer}>
          {/* Ejercicio seleccionado */}
          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📝</span>
              <h2 className={styles.sectionTitleText}>{selectedExercise.title}</h2>
            </div>
            <p><strong>Categoría:</strong> {selectedExercise.category}</p>
            <p>{selectedExercise.description}</p>
          </section>

          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>❓</span>
              <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
            </div>
            <ol>
              {selectedExercise.questions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ol>
          </section>

          <div className={styles.highlightBox}>
            <p><strong>💡 Reflexión Final:</strong> {selectedExercise.reflection}</p>
          </div>

          <section className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>📝</span>
              <h2 className={styles.sectionTitleText}>Espacio para tus Notas</h2>
            </div>
            <p>Te recomendamos escribir tus respuestas en un documento aparte o en un cuaderno. Esto te ayudará a:</p>
            <ul>
              <li>Organizar tus ideas de forma estructurada</li>
              <li>Compartir las reflexiones con otros miembros de la familia</li>
              <li>Revisar tu progreso a lo largo del tiempo</li>
              <li>Identificar patrones y áreas de mejora</li>
            </ul>
          </section>

          <div className={styles.completeSection}>
            <button
              onClick={() => setSelectedExercise(null)}
              className={styles.completeButton}
            >
              ← Volver a la Lista de Ejercicios
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Categorías de ejercicios */}
          <section className={styles.overviewSection}>
            <div className={styles.overviewGrid}>
              <div className={styles.overviewCard}>
                <span className={styles.overviewIcon}>🔍</span>
                <h3>Diagnóstico</h3>
                <p>Evalúa la situación actual de tu empresa familiar</p>
              </div>
              <div className={styles.overviewCard}>
                <span className={styles.overviewIcon}>⚖️</span>
                <h3>Gobierno</h3>
                <p>Analiza las estructuras de decisión y protocolo</p>
              </div>
              <div className={styles.overviewCard}>
                <span className={styles.overviewIcon}>🔄</span>
                <h3>Sucesión</h3>
                <p>Prepara la transición generacional</p>
              </div>
              <div className={styles.overviewCard}>
                <span className={styles.overviewIcon}>📊</span>
                <h3>Casos Reales</h3>
                <p>Aprende de empresas familiares exitosas</p>
              </div>
            </div>
          </section>

          {/* Grid de ejercicios */}
          <section className={styles.modulesSection}>
            <h2 className={styles.sectionTitle}>📋 Ejercicios Disponibles</h2>

            <div className={styles.chaptersGrid}>
              {EXERCISES.map((exercise, idx) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className={styles.chapterCard}
                  style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}
                >
                  <div className={styles.chapterHeader}>
                    <span className={styles.chapterNumber}>{idx + 1}</span>
                    <div className={styles.chapterInfo}>
                      <h4 className={styles.chapterTitle}>{exercise.title}</h4>
                      <span className={styles.chapterDuration}>{exercise.category}</span>
                    </div>
                  </div>
                  <div className={styles.chapterTopics}>
                    <span className={styles.topicTag}>{exercise.questions.length} preguntas</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Consejos */}
          <div className={styles.infoBox}>
            <p><strong>💡 Consejo:</strong> Estos ejercicios son más efectivos cuando se realizan en grupo con otros miembros de la familia empresaria. Considera organizar una sesión de trabajo familiar para abordar los ejercicios más relevantes para vuestra situación.</p>
          </div>
        </>
      )}

      {/* Navegación */}
      <div className={styles.bottomNavigation}>
        <Link href="/curso-empresa-familiar/recursos/glosario" className={styles.bottomNavLink}>
          <div className={styles.bottomNavLabel}>← Anterior</div>
          <div className={styles.bottomNavTitle}>Glosario de Términos</div>
        </Link>
        <Link href="/curso-empresa-familiar" className={`${styles.bottomNavLink} ${styles.next}`}>
          <div className={styles.bottomNavLabel}>Volver →</div>
          <div className={styles.bottomNavTitle}>Índice del Curso</div>
        </Link>
      </div>

      <Footer appName="curso-empresa-familiar" />
    </div>
  );
}
