'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../../CursoNegociacion.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface Exercise {
  id: string;
  title: string;
  category: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  scenario: string;
  questions: string[];
  tips: string[];
}

const EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    title: 'Negociación Salarial',
    category: 'Preparación',
    difficulty: 'Básico',
    scenario: 'Has trabajado dos años en tu empresa con excelentes resultados. Tu salario actual es de €35,000/año. Sabes que el mercado paga €42,000-€48,000 para tu puesto. Tu jefe te cita para la revisión anual.',
    questions: [
      '¿Cuál es tu BATNA en esta situación?',
      '¿Cuál debería ser tu precio de reserva, precio probable y meta ambiciosa?',
      '¿Qué información adicional necesitarías investigar antes de la reunión?',
      '¿Cómo estructurarías tu propuesta inicial?'
    ],
    tips: [
      'Tu BATNA podría incluir ofertas de otras empresas o proyectos freelance',
      'Investiga no solo salarios, sino también beneficios, bonos y oportunidades de crecimiento',
      'Prepara evidencia concreta de tus logros y su impacto en la empresa'
    ]
  },
  {
    id: 'ex-2',
    title: 'Proveedor Difícil',
    category: 'Poder',
    difficulty: 'Intermedio',
    scenario: 'Tu empresa depende de un proveedor único para un componente crítico. El proveedor anuncia un aumento del 25% en precios. Cambiar de proveedor tomaría 6 meses y afectaría la producción.',
    questions: [
      '¿Cómo evaluarías las fuentes de poder de cada parte?',
      '¿Qué estrategias podrías usar para aumentar tu poder negociador a corto plazo?',
      '¿Cómo plantearías la primera reunión de negociación?',
      '¿Qué concesiones podrías ofrecer a cambio de mantener el precio actual?'
    ],
    tips: [
      'El proveedor también tiene interés en mantener la relación',
      'Considera ofrezcer contratos más largos o volúmenes mayores',
      'Explora si hay otros clientes en la misma situación para negociar colectivamente'
    ]
  },
  {
    id: 'ex-3',
    title: 'Cierre de Venta Compleja',
    category: 'Cierre',
    difficulty: 'Avanzado',
    scenario: 'Llevas 4 meses negociando un contrato de €500,000 con una multinacional. El comité de compras está dividido: el director de operaciones te apoya, pero el CFO prefiere a la competencia. La decisión final es en una semana.',
    questions: [
      '¿Qué técnicas de cierre serían más apropiadas en este contexto?',
      '¿Cómo abordarías al CFO escéptico?',
      '¿Qué objeciones podrías anticipar y cómo las manejarías?',
      '¿Deberías hacer una última concesión para cerrar? ¿Cuál y cómo?'
    ],
    tips: [
      'Entiende las preocupaciones específicas del CFO (¿precio, riesgo, referencias?)',
      'Usa al director de operaciones como aliado interno',
      'Cualquier concesión final debe parecer excepcional y tener contrapartida'
    ]
  },
  {
    id: 'ex-4',
    title: 'Mediación entre Socios',
    category: 'Conflictos',
    difficulty: 'Avanzado',
    scenario: 'Dos socios al 50% de una empresa están en conflicto sobre la estrategia de crecimiento. Uno quiere reinvertir todas las ganancias, el otro quiere distribuir dividendos. Ambos te piden ayuda para mediar.',
    questions: [
      '¿Cuáles podrían ser los intereses subyacentes de cada socio?',
      '¿Qué preguntas harías a cada uno por separado antes de reunirlos?',
      '¿Cómo estructurarías la sesión de mediación?',
      '¿Qué opciones creativas podrían satisfacer a ambos?'
    ],
    tips: [
      'Explora las razones detrás de cada posición (necesidades personales, visión de futuro)',
      'Busca soluciones que no sean todo/nada (parcialmente reinvertir, parcialmente dividendos)',
      'Considera mecanismos de ajuste según resultados futuros'
    ]
  },
  {
    id: 'ex-5',
    title: 'Negociación Internacional',
    category: 'Cultural',
    difficulty: 'Intermedio',
    scenario: 'Tu empresa española va a negociar un acuerdo de distribución con una empresa japonesa. Es la primera reunión presencial en Tokio después de meses de emails formales.',
    questions: [
      '¿Qué diferencias culturales deberías considerar?',
      '¿Cómo adaptarías tu estilo de negociación?',
      '¿Qué errores comunes deberías evitar?',
      '¿Cómo interpretarías señales de interés o desinterés de los japoneses?'
    ],
    tips: [
      'La primera reunión probablemente sea para construir relación, no para cerrar acuerdos',
      'El silencio puede ser reflexión, no desacuerdo',
      'Lleva tarjetas de presentación de calidad y entrega/recibe con ambas manos'
    ]
  },
  {
    id: 'ex-6',
    title: 'Detectando Sesgos',
    category: 'Psicología',
    difficulty: 'Básico',
    scenario: 'Estás evaluando comprar un coche usado. El vendedor abre diciendo: "El dueño anterior pagó €18,000 hace tres años. Es una ganga a €12,000". Tú habías pensado en gastar máximo €10,000.',
    questions: [
      '¿Qué sesgo está intentando activar el vendedor?',
      '¿Cómo podrías contrarrestar el efecto de anclaje?',
      '¿Qué preguntas harías para obtener información más objetiva?',
      '¿Cómo reestructurarías la negociación?'
    ],
    tips: [
      'El precio original es irrelevante para el valor actual del coche',
      'Investiga precios de mercado para coches similares antes de la reunión',
      'Tu ancla debería basarse en datos objetivos, no en la propuesta del vendedor'
    ]
  }
];

const CATEGORIES = ['Todos', 'Preparación', 'Poder', 'Psicología', 'Cierre', 'Conflictos', 'Cultural'];
const DIFFICULTIES = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];

export default function EjerciciosPage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeDifficulty, setActiveDifficulty] = useState('Todos');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesCategory = activeCategory === 'Todos' || ex.category === activeCategory;
    const matchesDifficulty = activeDifficulty === 'Todos' || ex.difficulty === activeDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico': return 'var(--success)';
      case 'Intermedio': return 'var(--warning)';
      case 'Avanzado': return 'var(--danger)';
      default: return 'var(--primary)';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.chapterHero}>
        <span className={styles.chapterHeroIcon}>✏️</span>
        <h1 className={styles.chapterHeroTitle}>Ejercicios Prácticos</h1>
        <p className={styles.chapterHeroSubtitle}>
          Pon a prueba tus habilidades de negociación con escenarios reales
        </p>
      </header>

      {/* Navegación */}
      <nav className={styles.navigation}>
        <Link href="/curso-negociacion" className={styles.navButton}>
          ← Volver al Curso
        </Link>
        <div className={styles.navProgress}>
          <div className={styles.navProgressText}>{EXERCISES.length}</div>
          <div className={styles.navProgressLabel}>ejercicios</div>
        </div>
        <Link href="/curso-negociacion/recursos/glosario" className={styles.navButton}>
          Glosario →
        </Link>
      </nav>

      {/* Filtros */}
      <div className={styles.glossaryFilters}>
        <div className={styles.categoryFilters}>
          <strong style={{ marginRight: '1rem', color: 'var(--text-primary)' }}>Tema:</strong>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`${styles.categoryButton} ${activeCategory === cat ? styles.categoryActive : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className={styles.categoryFilters} style={{ marginTop: '1rem' }}>
          <strong style={{ marginRight: '1rem', color: 'var(--text-primary)' }}>Nivel:</strong>
          {DIFFICULTIES.map(diff => (
            <button
              key={diff}
              onClick={() => setActiveDifficulty(diff)}
              className={`${styles.categoryButton} ${activeDifficulty === diff ? styles.categoryActive : ''}`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Ejercicios */}
      <div className={styles.glossaryContent}>
        {filteredExercises.length > 0 ? (
          filteredExercises.map(exercise => (
            <div key={exercise.id} className={styles.contentSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>📋</span>
                <div style={{ flex: 1 }}>
                  <h2 className={styles.sectionTitleText}>{exercise.title}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className={styles.topicTag}>{exercise.category}</span>
                    <span
                      className={styles.topicTag}
                      style={{ background: getDifficultyColor(exercise.difficulty), color: 'white' }}
                    >
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.highlightBox}>
                <strong>Escenario:</strong>
                <p>{exercise.scenario}</p>
              </div>

              <h3>Preguntas para reflexionar:</h3>
              <ol>
                {exercise.questions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ol>

              <button
                onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                className={styles.categoryButton}
                style={{ marginTop: '1rem' }}
              >
                {expandedExercise === exercise.id ? '🔼 Ocultar pistas' : '💡 Ver pistas'}
              </button>

              {expandedExercise === exercise.id && (
                <div className={styles.practicalTip} style={{ marginTop: '1rem' }}>
                  <h4>💡 Pistas</h4>
                  <ul>
                    {exercise.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No se encontraron ejercicios con los filtros seleccionados.</p>
            <button
              onClick={() => { setActiveCategory('Todos'); setActiveDifficulty('Todos'); }}
              className={styles.resetButton}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <Footer appName="curso-negociacion" />
    </div>
  );
}
