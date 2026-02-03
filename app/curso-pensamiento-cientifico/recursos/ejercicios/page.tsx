'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../../CursoPensamientoCientifico.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

interface Exercise {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const EXERCISES: Exercise[] = [
  {
    id: 1,
    question: '¿Cuál de las siguientes afirmaciones describe mejor el concepto de falsabilidad de Popper?',
    options: [
      'Una teoría es científica si ha sido probada como verdadera',
      'Una teoría es científica si puede, en principio, ser refutada mediante evidencia',
      'Una teoría es científica si la mayoría de científicos la acepta',
      'Una teoría es científica si no cambia con el tiempo'
    ],
    correct: 1,
    explanation: 'Karl Popper propuso que la característica distintiva de las teorías científicas es que pueden ser falsables: deben poder formularse de manera que existan observaciones o experimentos que podrían refutarlas.',
    category: 'Método'
  },
  {
    id: 2,
    question: 'Juan dice: "No puedes confiar en lo que dice María sobre cambio climático porque ella trabaja para una empresa de energías renovables." ¿Qué tipo de falacia está cometiendo?',
    options: [
      'Hombre de paja',
      'Pendiente resbaladiza',
      'Ad hominem',
      'Falsa dicotomía'
    ],
    correct: 2,
    explanation: 'Es una falacia ad hominem porque ataca a la persona (su empleo) en lugar de evaluar los argumentos que presenta sobre el cambio climático. Aunque los conflictos de interés son relevantes, no invalidan automáticamente todos los argumentos.',
    category: 'Lógica'
  },
  {
    id: 3,
    question: 'En un estudio sobre un nuevo medicamento, ¿por qué es importante tener un grupo de control?',
    options: [
      'Para ahorrar dinero en la investigación',
      'Para poder comparar los efectos del medicamento con la ausencia de tratamiento',
      'Porque lo exige la ley',
      'Para tener más participantes en el estudio'
    ],
    correct: 1,
    explanation: 'El grupo de control permite aislar el efecto del tratamiento de otros factores. Sin él, no podríamos saber si las mejoras se deben al medicamento, al efecto placebo, o a la evolución natural de la enfermedad.',
    category: 'Método'
  },
  {
    id: 4,
    question: 'Un estudio muestra que las personas que desayunan tienen mejores notas. ¿Qué conclusión es más apropiada?',
    options: [
      'Desayunar causa mejores notas',
      'Las buenas notas hacen que la gente desayune más',
      'Existe una correlación, pero no podemos afirmar causalidad sin más investigación',
      'No hay ninguna relación entre ambos factores'
    ],
    correct: 2,
    explanation: 'Correlación no implica causación. Podría haber terceras variables (como estabilidad económica familiar, buenos hábitos generales, o calidad del sueño) que expliquen ambos fenómenos sin que uno cause el otro.',
    category: 'Lógica'
  },
  {
    id: 5,
    question: 'El sesgo de confirmación se refiere a:',
    options: [
      'Confirmar los resultados de un experimento repitiéndolo',
      'La tendencia a buscar y recordar información que apoya nuestras creencias previas',
      'La necesidad de que otros científicos confirmen nuestros hallazgos',
      'El proceso de validar hipótesis científicas'
    ],
    correct: 1,
    explanation: 'El sesgo de confirmación es uno de los sesgos cognitivos más comunes e importantes. Nos lleva a prestar más atención a la información que confirma lo que ya creemos y a ignorar o descartar la que lo contradice.',
    category: 'Sesgos'
  },
  {
    id: 6,
    question: '¿Cuál de estas características NO es típica de la pseudociencia?',
    options: [
      'Usa lenguaje científico pero sin rigor metodológico',
      'Sus afirmaciones son sometidas regularmente a revisión por pares',
      'Apela a autoridades no cualificadas en el tema',
      'Es resistente a la evidencia que la contradice'
    ],
    correct: 1,
    explanation: 'La revisión por pares (peer review) es una característica de la ciencia legítima, no de la pseudociencia. En el proceso de revisión por pares, otros expertos evalúan críticamente la metodología y conclusiones antes de la publicación.',
    category: 'Pseudociencia'
  },
  {
    id: 7,
    question: 'Según Thomas Kuhn, ¿qué es un "paradigma" en ciencia?',
    options: [
      'Un tipo de experimento de laboratorio',
      'Un marco conceptual compartido que define problemas y métodos aceptables',
      'Una teoría que ha sido probada como absolutamente verdadera',
      'Un instrumento de medición científica'
    ],
    correct: 1,
    explanation: 'Kuhn definió el paradigma como el conjunto de teorías, métodos, estándares y problemas legítimos que comparte una comunidad científica. Los paradigmas determinan qué preguntas vale la pena investigar y qué respuestas son aceptables.',
    category: 'Paradigmas'
  },
  {
    id: 8,
    question: '"Si permitimos que los estudiantes usen calculadoras en exámenes de matemáticas, pronto olvidarán cómo hacer operaciones básicas, luego perderán toda capacidad de razonamiento lógico, y finalmente la sociedad colapsará." Este argumento es un ejemplo de:',
    options: [
      'Argumento de autoridad',
      'Falsa dicotomía',
      'Pendiente resbaladiza',
      'Generalización apresurada'
    ],
    correct: 2,
    explanation: 'La pendiente resbaladiza sugiere que un pequeño paso inicial inevitablemente llevará a una cadena de consecuencias cada vez más extremas, sin justificar adecuadamente por qué cada paso lleva necesariamente al siguiente.',
    category: 'Lógica'
  },
  {
    id: 9,
    question: '¿Por qué es importante que los estudios científicos sean reproducibles?',
    options: [
      'Para que los científicos puedan publicar más artículos',
      'Para verificar que los resultados no fueron un error o fraude',
      'Porque la ley lo exige',
      'Para hacer la ciencia más difícil'
    ],
    correct: 1,
    explanation: 'La reproducibilidad es fundamental para la ciencia porque permite verificar independientemente los hallazgos. Si solo un laboratorio obtiene ciertos resultados y nadie más puede replicarlos, hay razones para dudar de su validez.',
    category: 'Método'
  },
  {
    id: 10,
    question: 'El efecto placebo demuestra que:',
    options: [
      'Todos los medicamentos son inútiles',
      'Las expectativas y creencias pueden producir cambios fisiológicos reales',
      'Los pacientes siempre mienten sobre su mejoría',
      'Solo los tratamientos costosos funcionan'
    ],
    correct: 1,
    explanation: 'El efecto placebo muestra el poder de las expectativas sobre nuestra fisiología. No significa que "todo está en la mente", sino que el contexto psicológico puede influir en procesos biológicos reales. Por eso los ensayos clínicos usan grupos de control con placebo.',
    category: 'Método'
  }
];

export default function EjerciciosPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>(new Array(EXERCISES.length).fill(false));

  const exercise = EXERCISES[currentQuestion];

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);
    if (selectedAnswer === exercise.correct && !answered[currentQuestion]) {
      setScore(score + 1);
      const newAnswered = [...answered];
      newAnswered[currentQuestion] = true;
      setAnswered(newAnswered);
    }
  };

  const handleNext = () => {
    if (currentQuestion < EXERCISES.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(new Array(EXERCISES.length).fill(false));
  };

  const progress = Math.round(((currentQuestion + 1) / EXERCISES.length) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <LegalNotice />

      {/* Hero */}
      <header className={styles.chapterHero}>
        <span className={styles.chapterHeroIcon}>✏️</span>
        <h1 className={styles.chapterHeroTitle}>Ejercicios de Pensamiento Crítico</h1>
        <p className={styles.chapterHeroSubtitle}>
          Pon a prueba tus conocimientos con {EXERCISES.length} preguntas sobre método científico, falacias y sesgos
        </p>
        <div className={styles.chapterMeta}>
          <span>📊 Puntuación: {score}/{EXERCISES.length}</span>
          <span>📝 Pregunta {currentQuestion + 1} de {EXERCISES.length}</span>
        </div>
      </header>

      {/* Barra de progreso */}
      <div style={{
        background: 'var(--border)',
        borderRadius: '100px',
        height: '8px',
        marginBottom: 'var(--spacing-xl)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          height: '100%',
          width: `${progress}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Pregunta */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>❓</span>
          <h2 className={styles.sectionTitleText}>Pregunta {currentQuestion + 1}</h2>
          <span className={styles.glossaryCategory}>{exercise.category}</span>
        </div>

        <p style={{ fontSize: '1.1rem', lineHeight: '1.7', marginBottom: 'var(--spacing-xl)' }}>
          {exercise.question}
        </p>

        {/* Opciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {exercise.options.map((option, idx) => {
            let bgColor = 'var(--hover)';
            let borderColor = 'transparent';

            if (showResult) {
              if (idx === exercise.correct) {
                bgColor = 'rgba(16, 185, 129, 0.15)';
                borderColor = 'var(--success)';
              } else if (idx === selectedAnswer && idx !== exercise.correct) {
                bgColor = 'rgba(239, 68, 68, 0.15)';
                borderColor = 'var(--danger)';
              }
            } else if (selectedAnswer === idx) {
              borderColor = 'var(--primary)';
              bgColor = 'rgba(46, 134, 171, 0.1)';
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
                style={{
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: 'var(--radius)',
                  textAlign: 'left',
                  cursor: showResult ? 'default' : 'pointer',
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <strong style={{ marginRight: 'var(--spacing-sm)' }}>
                  {String.fromCharCode(65 + idx)}.
                </strong>
                {option}
              </button>
            );
          })}
        </div>

        {/* Botón de confirmar */}
        {!showResult && (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className={styles.completeButton}
            style={{
              marginTop: 'var(--spacing-xl)',
              opacity: selectedAnswer === null ? 0.5 : 1,
              cursor: selectedAnswer === null ? 'not-allowed' : 'pointer'
            }}
          >
            Comprobar Respuesta
          </button>
        )}

        {/* Explicación */}
        {showResult && (
          <div className={selectedAnswer === exercise.correct ? styles.highlightBox : styles.warningBox}
               style={{ marginTop: 'var(--spacing-xl)' }}>
            <p>
              <strong>{selectedAnswer === exercise.correct ? '✅ ¡Correcto!' : '❌ Incorrecto'}</strong>
            </p>
            <p style={{ marginTop: 'var(--spacing-sm)' }}>{exercise.explanation}</p>
          </div>
        )}
      </section>

      {/* Navegación entre preguntas */}
      <div className={styles.bottomNavigation}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={styles.bottomNavLink}
          style={{
            opacity: currentQuestion === 0 ? 0.5 : 1,
            cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
            border: 'none',
            background: 'var(--bg-card)'
          }}
        >
          <div className={styles.bottomNavLabel}>← Anterior</div>
          <div className={styles.bottomNavTitle}>Pregunta {currentQuestion}</div>
        </button>

        {currentQuestion === EXERCISES.length - 1 && showResult ? (
          <button
            onClick={handleReset}
            className={`${styles.bottomNavLink} ${styles.next}`}
            style={{ border: 'none', background: 'var(--bg-card)' }}
          >
            <div className={styles.bottomNavLabel}>🔄 Reiniciar</div>
            <div className={styles.bottomNavTitle}>Volver a empezar</div>
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!showResult || currentQuestion === EXERCISES.length - 1}
            className={`${styles.bottomNavLink} ${styles.next}`}
            style={{
              opacity: (!showResult || currentQuestion === EXERCISES.length - 1) ? 0.5 : 1,
              cursor: (!showResult || currentQuestion === EXERCISES.length - 1) ? 'not-allowed' : 'pointer',
              border: 'none',
              background: 'var(--bg-card)'
            }}
          >
            <div className={styles.bottomNavLabel}>Siguiente →</div>
            <div className={styles.bottomNavTitle}>Pregunta {currentQuestion + 2}</div>
          </button>
        )}
      </div>

      {/* Enlace al índice */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <Link
          href="/curso-pensamiento-cientifico"
          style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          ← Volver al índice del curso
        </Link>
      </div>

      <Footer appName="curso-pensamiento-cientifico" />
    </div>
  );
}
