'use client';

import { useState } from 'react';
import styles from './TestHabitos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface Question {
  id: string;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  questions: Question[];
}

interface CategoryResult {
  category: string;
  icon: string;
  color: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  suggestion: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'hidratacion',
    name: 'Hidratación',
    icon: '💧',
    color: '#3498DB',
    questions: [
      {
        id: 'h1',
        text: '¿Cómo es tu hidratación general (incluyendo agua, infusiones, fruta, sopas, alimentos acuosos)?',
        options: [
          { text: 'Rara vez bebo y orina muy oscura', score: 1 },
          { text: 'Orina oscura frecuente', score: 2 },
          { text: 'Orina amarilla habitual', score: 3 },
          { text: 'Orina mayormente pálida la mayor parte del día', score: 4 },
        ],
      },
      {
        id: 'h2',
        text: '¿Sueles tener sed durante el día?',
        options: [
          { text: 'Sí, frecuentemente', score: 1 },
          { text: 'A veces', score: 2 },
          { text: 'Raramente', score: 3 },
          { text: 'Casi nunca, bebo antes de tener sed', score: 4 },
        ],
      },
      {
        id: 'h3',
        text: '¿Llevas contigo una botella de agua durante el día?',
        options: [
          { text: 'Nunca', score: 1 },
          { text: 'A veces', score: 2 },
          { text: 'Casi siempre', score: 3 },
          { text: 'Siempre', score: 4 },
        ],
      },
    ],
  },
  {
    id: 'alimentacion',
    name: 'Alimentación',
    icon: '🥗',
    color: '#27AE60',
    questions: [
      {
        id: 'a1',
        text: '¿Cuántas porciones de frutas y verduras consumes al día?',
        options: [
          { text: 'Menos de 2', score: 1 },
          { text: '2-3 porciones', score: 2 },
          { text: '4-5 porciones', score: 3 },
          { text: 'Más de 5 porciones', score: 4 },
        ],
      },
      {
        id: 'a2',
        text: '¿Con qué frecuencia comes alimentos ultraprocesados (bollería, snacks, comida rápida)?',
        options: [
          { text: 'A diario', score: 1 },
          { text: 'Varias veces por semana', score: 2 },
          { text: 'Ocasionalmente (1-2 veces/semana)', score: 3 },
          { text: 'Raramente o nunca', score: 4 },
        ],
      },
      {
        id: 'a3',
        text: '¿Sueles cocinar en casa con ingredientes frescos?',
        options: [
          { text: 'Raramente', score: 1 },
          { text: 'A veces (2-3 días/semana)', score: 2 },
          { text: 'Frecuentemente (4-5 días)', score: 3 },
          { text: 'Casi siempre (6-7 días)', score: 4 },
        ],
      },
    ],
  },
  {
    id: 'actividad',
    name: 'Actividad Física',
    icon: '🏃',
    color: '#E67E22',
    questions: [
      {
        id: 'f1',
        text: '¿Cuántos días a la semana realizas actividad física de al menos 30 minutos?',
        options: [
          { text: 'Ninguno', score: 1 },
          { text: '1-2 días', score: 2 },
          { text: '3-4 días', score: 3 },
          { text: '5 o más días', score: 4 },
        ],
      },
      {
        id: 'f2',
        text: '¿Cuánto tiempo pasas sentado/a durante el día de forma continuada?',
        options: [
          { text: 'Más de 8 horas sin levantarme', score: 1 },
          { text: '6-8 horas con pocas pausas', score: 2 },
          { text: '4-6 horas con pausas regulares', score: 3 },
          { text: 'Menos de 4 horas o me muevo frecuentemente', score: 4 },
        ],
      },
      {
        id: 'f3',
        text: '¿Incluyes en tu rutina caminar, subir escaleras o moverte de forma activa?',
        options: [
          { text: 'Raramente, uso siempre coche/ascensor', score: 1 },
          { text: 'A veces', score: 2 },
          { text: 'Frecuentemente', score: 3 },
          { text: 'Siempre que puedo', score: 4 },
        ],
      },
    ],
  },
  {
    id: 'descanso',
    name: 'Descanso y Sueño',
    icon: '😴',
    color: '#9B59B6',
    questions: [
      {
        id: 'd1',
        text: '¿Cuántas horas duermes habitualmente por noche?',
        options: [
          { text: 'Menos de 5 horas', score: 1 },
          { text: '5-6 horas', score: 2 },
          { text: '7-8 horas', score: 3 },
          { text: 'Más de 8 horas de calidad', score: 4 },
        ],
      },
      {
        id: 'd2',
        text: '¿Mantienes horarios regulares para acostarte y levantarte?',
        options: [
          { text: 'No, mis horarios son muy variables', score: 1 },
          { text: 'A veces', score: 2 },
          { text: 'Casi siempre entre semana', score: 3 },
          { text: 'Sí, incluso los fines de semana', score: 4 },
        ],
      },
      {
        id: 'd3',
        text: '¿Cómo describirías la calidad de tu sueño?',
        options: [
          { text: 'Mala, me despierto cansado/a', score: 1 },
          { text: 'Regular, a veces me cuesta dormir', score: 2 },
          { text: 'Buena, descanso bien la mayoría de noches', score: 3 },
          { text: 'Excelente, duermo profundamente', score: 4 },
        ],
      },
    ],
  },
  {
    id: 'tiempo',
    name: 'Gestión del Tiempo',
    icon: '⏰',
    color: '#E74C3C',
    questions: [
      {
        id: 't1',
        text: '¿Haces pausas durante tu jornada laboral o de estudio?',
        options: [
          { text: 'Nunca o casi nunca', score: 1 },
          { text: 'Solo cuando estoy muy cansado/a', score: 2 },
          { text: 'Hago pausas regulares (cada 1-2 horas)', score: 3 },
          { text: 'Sí, y aprovecho para moverme o desconectar', score: 4 },
        ],
      },
      {
        id: 't2',
        text: '¿Dedicas tiempo a actividades de ocio o hobbies?',
        options: [
          { text: 'Casi nunca tengo tiempo', score: 1 },
          { text: 'Ocasionalmente', score: 2 },
          { text: 'Varias veces por semana', score: 3 },
          { text: 'A diario tengo tiempo para mí', score: 4 },
        ],
      },
      {
        id: 't3',
        text: '¿Sientes que tienes equilibrio entre trabajo/obligaciones y vida personal?',
        options: [
          { text: 'No, el trabajo ocupa casi todo', score: 1 },
          { text: 'Poco equilibrio', score: 2 },
          { text: 'Bastante equilibrado', score: 3 },
          { text: 'Sí, gestiono bien mi tiempo', score: 4 },
        ],
      },
    ],
  },
  {
    id: 'social',
    name: 'Conexión Social',
    icon: '👥',
    color: '#1ABC9C',
    questions: [
      {
        id: 's1',
        text: '¿Con qué frecuencia pasas tiempo de calidad con familia o amigos?',
        options: [
          { text: 'Muy raramente', score: 1 },
          { text: 'Una vez al mes', score: 2 },
          { text: 'Semanalmente', score: 3 },
          { text: 'Varias veces por semana', score: 4 },
        ],
      },
      {
        id: 's2',
        text: '¿Te sientes apoyado/a por las personas de tu entorno?',
        options: [
          { text: 'No, me siento aislado/a', score: 1 },
          { text: 'A veces', score: 2 },
          { text: 'Generalmente sí', score: 3 },
          { text: 'Sí, tengo una buena red de apoyo', score: 4 },
        ],
      },
      {
        id: 's3',
        text: '¿Participas en actividades grupales o comunitarias?',
        options: [
          { text: 'Nunca', score: 1 },
          { text: 'Ocasionalmente', score: 2 },
          { text: 'Regularmente', score: 3 },
          { text: 'Frecuentemente, me gusta participar', score: 4 },
        ],
      },
    ],
  },
  {
    id: 'personal',
    name: 'Tiempo Personal',
    icon: '🎯',
    color: '#2E86AB',
    questions: [
      {
        id: 'p1',
        text: '¿Dedicas tiempo a la reflexión personal o mindfulness?',
        options: [
          { text: 'Nunca', score: 1 },
          { text: 'Raramente', score: 2 },
          { text: 'A veces (1-2 veces/semana)', score: 3 },
          { text: 'Regularmente (casi a diario)', score: 4 },
        ],
      },
      {
        id: 'p2',
        text: '¿Pasas tiempo al aire libre?',
        options: [
          { text: 'Casi nunca', score: 1 },
          { text: 'Ocasionalmente', score: 2 },
          { text: 'Varias veces por semana', score: 3 },
          { text: 'A diario', score: 4 },
        ],
      },
      {
        id: 'p3',
        text: '¿Limitas el uso de pantallas fuera del trabajo?',
        options: [
          { text: 'No, paso muchas horas con pantallas', score: 1 },
          { text: 'Intento limitarlo pero cuesta', score: 2 },
          { text: 'Lo controlo bastante bien', score: 3 },
          { text: 'Sí, tengo horarios sin pantallas', score: 4 },
        ],
      },
    ],
  },
];

const getLevel = (percentage: number): string => {
  if (percentage >= 80) return 'Frecuente';
  if (percentage >= 60) return 'Ocasional';
  if (percentage >= 40) return 'Poco frecuente';
  return 'Casi nunca';
};

const getSuggestion = (categoryId: string, percentage: number): string => {
  const suggestions: Record<string, Record<string, string>> = {
    hidratacion: {
      low: 'Intenta llevar una botella de agua contigo y establecer recordatorios para beber.',
      medium: 'Vas por buen camino. Prueba a beber un vaso de agua al despertar y antes de cada comida.',
      high: '¡Excelente hidratación! Mantén este hábito tan beneficioso.',
    },
    alimentacion: {
      low: 'Empieza añadiendo una pieza de fruta al día y cocinando más en casa.',
      medium: 'Buen progreso. Intenta planificar tus comidas semanales para mejorar aún más.',
      high: '¡Tu alimentación es muy equilibrada! Sigue así.',
    },
    actividad: {
      low: 'Comienza con caminatas cortas de 10-15 minutos y aumenta gradualmente.',
      medium: 'Bien hecho. Añade variedad con actividades que disfrutes.',
      high: '¡Fantástico nivel de actividad! Tu cuerpo te lo agradece.',
    },
    descanso: {
      low: 'Prioriza establecer una hora fija para acostarte y crear una rutina relajante.',
      medium: 'Vas bien. Evita pantallas 1 hora antes de dormir para mejorar la calidad.',
      high: '¡Excelente descanso! El sueño de calidad es fundamental.',
    },
    tiempo: {
      low: 'Reserva bloques de tiempo en tu agenda específicamente para ti.',
      medium: 'Buen equilibrio. Sigue protegiendo tu tiempo personal.',
      high: '¡Gestionas muy bien tu tiempo! Eso beneficia tu bienestar.',
    },
    social: {
      low: 'Intenta programar al menos una actividad social a la semana.',
      medium: 'Buena conexión. Cultiva las relaciones que te aportan.',
      high: '¡Excelente red social! Las relaciones son clave para el bienestar.',
    },
    personal: {
      low: 'Dedica 5-10 minutos al día para ti: lectura, paseo, respiración...',
      medium: 'Bien encaminado. Sigue dedicando tiempo a lo que te importa.',
      high: '¡Cuidas muy bien tu tiempo personal! Sigue así.',
    },
  };

  const level = percentage < 50 ? 'low' : percentage < 75 ? 'medium' : 'high';
  return suggestions[categoryId]?.[level] || '';
};

export default function TestHabitosPage() {
  const [currentStep, setCurrentStep] = useState<'intro' | 'test' | 'results'>('intro');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<CategoryResult[]>([]);

  const currentCategory = CATEGORIES[currentCategoryIndex];
  const totalQuestions = CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const canProceed = (): boolean => {
    if (!currentCategory) return false;
    return currentCategory.questions.every(q => answers[q.id] !== undefined);
  };

  const nextCategory = () => {
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const prevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const categoryResults: CategoryResult[] = CATEGORIES.map(category => {
      const categoryScore = category.questions.reduce(
        (acc, q) => acc + (answers[q.id] || 0),
        0
      );
      const maxScore = category.questions.length * 4;
      const percentage = Math.round((categoryScore / maxScore) * 100);

      return {
        category: category.name,
        icon: category.icon,
        color: category.color,
        score: categoryScore,
        maxScore,
        percentage,
        level: getLevel(percentage),
        suggestion: getSuggestion(category.id, percentage),
      };
    });

    setResults(categoryResults);
    setCurrentStep('results');
  };

  const resetTest = () => {
    setCurrentStep('intro');
    setCurrentCategoryIndex(0);
    setAnswers({});
    setResults([]);
  };

  const getOverallScore = (): number => {
    if (results.length === 0) return 0;
    const total = results.reduce((acc, r) => acc + r.percentage, 0);
    return Math.round(total / results.length);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🌟 Test de Hábitos Saludables</h1>
        <p className={styles.subtitle}>
          Evalúa tus hábitos de vida y descubre áreas de mejora para tu bienestar
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Intro */}
      {currentStep === 'intro' && (
        <div className={styles.introSection}>
          <div className={styles.introCard}>
            <h2>¿Qué evalúa este test?</h2>
            <p>
              Este test analiza 7 áreas fundamentales de tu estilo de vida de forma
              orientativa. No incluye temas médicos ni sensibles.
            </p>

            <div className={styles.areasGrid}>
              {CATEGORIES.map(cat => (
                <div
                  key={cat.id}
                  className={styles.areaItem}
                  style={{ borderColor: cat.color }}
                >
                  <span className={styles.areaIcon}>{cat.icon}</span>
                  <span className={styles.areaName}>{cat.name}</span>
                </div>
              ))}
            </div>

            <div className={styles.introInfo}>
              <p>📝 <strong>21 preguntas</strong> en total (3 por área)</p>
              <p>⏱️ <strong>5-7 minutos</strong> aproximadamente</p>
              <p>🔒 <strong>Sin registro</strong> - tus datos no se guardan</p>
            </div>

            <button
              className={styles.btnStart}
              onClick={() => setCurrentStep('test')}
            >
              Comenzar Test
            </button>
          </div>
        </div>
      )}

      {/* Test */}
      {currentStep === 'test' && currentCategory && (
        <div className={styles.testSection}>
          {/* Progress */}
          <div className={styles.progressBar}>
            <div className={styles.progressInfo}>
              <span>
                Área {currentCategoryIndex + 1} de {CATEGORIES.length}:{' '}
                <strong>{currentCategory.name}</strong>
              </span>
              <span>{answeredQuestions} / {totalQuestions} preguntas</span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(answeredQuestions / totalQuestions) * 100}%`,
                  backgroundColor: currentCategory.color,
                }}
              />
            </div>
          </div>

          {/* Category Header */}
          <div
            className={styles.categoryHeader}
            style={{ backgroundColor: currentCategory.color }}
          >
            <span className={styles.categoryIcon}>{currentCategory.icon}</span>
            <h2 className={styles.categoryName}>{currentCategory.name}</h2>
          </div>

          {/* Questions */}
          <div className={styles.questionsContainer}>
            {currentCategory.questions.map((question, qIndex) => (
              <div key={question.id} className={styles.questionCard}>
                <p className={styles.questionText}>
                  <span className={styles.questionNumber}>{qIndex + 1}.</span>
                  {question.text}
                </p>
                <div className={styles.optionsGrid}>
                  {question.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      className={`${styles.optionBtn} ${
                        answers[question.id] === option.score ? styles.optionSelected : ''
                      }`}
                      onClick={() => handleAnswer(question.id, option.score)}
                      style={{
                        '--option-color': currentCategory.color,
                      } as React.CSSProperties}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className={styles.navigation}>
            <button
              className={styles.btnNav}
              onClick={prevCategory}
              disabled={currentCategoryIndex === 0}
            >
              ← Anterior
            </button>
            <button
              className={styles.btnPrimary}
              onClick={nextCategory}
              disabled={!canProceed()}
            >
              {currentCategoryIndex === CATEGORIES.length - 1
                ? 'Ver Resultados'
                : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {currentStep === 'results' && (
        <div className={styles.resultsSection}>
          <div className={styles.overallScore}>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreValue}>{getOverallScore()}%</span>
              <span className={styles.scoreLabel}>Puntuación Global</span>
            </div>
            <p className={styles.scoreMessage}>
              {getOverallScore() >= 75
                ? '¡Excelente! Tus hábitos de vida son muy saludables.'
                : getOverallScore() >= 50
                ? 'Bien encaminado/a. Hay áreas donde puedes mejorar.'
                : 'Hay varias áreas con oportunidades de mejora.'}
            </p>
          </div>

          <h2 className={styles.resultsTitle}>📊 Tu Perfil de Hábitos</h2>

          <div className={styles.resultsGrid}>
            {results.map(result => (
              <div key={result.category} className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <span className={styles.resultIcon}>{result.icon}</span>
                  <span className={styles.resultCategory}>{result.category}</span>
                  <span
                    className={styles.resultLevel}
                    style={{ backgroundColor: result.color }}
                  >
                    {result.level}
                  </span>
                </div>

                <div className={styles.resultBar}>
                  <div
                    className={styles.resultBarFill}
                    style={{
                      width: `${result.percentage}%`,
                      backgroundColor: result.color,
                    }}
                  />
                </div>
                <div className={styles.resultPercent}>{result.percentage}%</div>

                <p className={styles.resultSuggestion}>{result.suggestion}</p>
              </div>
            ))}
          </div>

          <div className={styles.resultsActions}>
            <button className={styles.btnSecondary} onClick={resetTest}>
              🔄 Repetir Test
            </button>
          </div>
        </div>
      )}

      

      <DisclaimerCard variant="medical" severity="high" collapsible={false} context="test-habitos-saludables">
        <p>Este test es una <strong>herramienta de autoevaluación orientativa</strong> sobre hábitos saludables:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>No constituye un diagnóstico médico</strong>: Los resultados son informativos, no diagnósticos</li>
          <li><strong>Consulta con profesionales</strong>: Para una evaluación completa de tu estado de salud, acude a tu médico o nutricionista</li>
        </ul>
      </DisclaimerCard>

      <EducationalSection
        title="Ciencia de los Hábitos Saludables"
        subtitle="Evidencia científica para entender y transformar tu estilo de vida"
        icon="🌱"
      >
        {/* Tabla comparativa */}
        <div className={styles.eduTablaWrapper}>
          <table className={styles.eduTabla}>
            <thead>
              <tr>
                <th>Área</th>
                <th>Hábito clave</th>
                <th>Beneficio principal</th>
                <th>Tiempo mínimo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sueño</strong></td>
                <td>7-9 h regulares</td>
                <td>Memoria, inmunidad, peso</td>
                <td>Inmediato</td>
              </tr>
              <tr>
                <td><strong>Ejercicio</strong></td>
                <td>150 min/semana moderado</td>
                <td>Cardiovascular, estado de ánimo</td>
                <td>2-4 semanas</td>
              </tr>
              <tr>
                <td><strong>Nutrición</strong></td>
                <td>5 raciones fruta/verdura</td>
                <td>Micronutrientes, digestión</td>
                <td>1-2 semanas</td>
              </tr>
              <tr>
                <td><strong>Hidratación</strong></td>
                <td>Total recomendado EFSA: ~2 L (mujeres) / 2,5 L (hombres) contando alimentos y bebidas — variable según clima y actividad</td>
                <td>Concentración, piel, riñones</td>
                <td>24-48 horas</td>
              </tr>
              <tr>
                <td><strong>Gestión estrés</strong></td>
                <td>10 min meditación/día</td>
                <td>Cortisol, presión arterial</td>
                <td>4-8 semanas</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Casos de uso */}
        <h3>¿Quién se beneficia de este test?</h3>
        <div className={styles.eduEscenariosGrid}>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>🏃</span>
            <h4>Personas activas</h4>
            <p>Identifica qué áreas fuera del ejercicio están limitando tu rendimiento y recuperación.</p>
          </div>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>💼</span>
            <h4>Profesionales con estrés</h4>
            <p>Detecta si los hábitos de sueño y descanso están comprometidos por la carga laboral.</p>
          </div>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>👨‍👩‍👧</span>
            <h4>Familias</h4>
            <p>Evalúa el estilo de vida familiar y detecta áreas de mejora colectivas (alimentación, pantallas).</p>
          </div>
          <div className={styles.eduEscenarioCard}>
            <span className={styles.eduEscenarioIcon}>🎓</span>
            <h4>Estudiantes</h4>
            <p>El sueño y la nutrición impactan directamente en el aprendizaje. Este test ayuda a priorizar.</p>
          </div>
        </div>

        {/* FAQ */}
        <h3>Preguntas frecuentes</h3>
        <dl className={styles.eduFaqList}>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Cuánto tarda en formarse un hábito?</dt>
            <dd className={styles.eduFaqRespuesta}>La idea popular de «21 días» es un mito. Un estudio de la UCL (Lally, 2010) encontró que la media real es 66 días, con rangos de 18 a 254 días según la complejidad del hábito.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Qué es el modelo de «bucle de hábito»?</dt>
            <dd className={styles.eduFaqRespuesta}>Charles Duhigg describe el bucle: señal → rutina → recompensa. Para cambiar un hábito, mantén la señal y la recompensa, pero cambia la rutina. Identificar la señal es el paso más difícil.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Cuántas horas de sueño son suficientes?</dt>
            <dd className={styles.eduFaqRespuesta}>La OMS y la NSF recomiendan 7-9 horas para adultos. Menos de 6 horas crónicas se asocia con obesidad, diabetes tipo 2, deterioro cognitivo y mayor mortalidad.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Realmente importa cuándo como, no solo qué como?</dt>
            <dd className={styles.eduFaqRespuesta}>Sí. La crononutrición muestra que comer tarde altera el ritmo circadiano y el metabolismo. Cenar antes de las 20:00 y hacer ayuno nocturno de 12 h se asocia con mejor control glucémico.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Qué ejercicio es mejor para empezar?</dt>
            <dd className={styles.eduFaqRespuesta}>Caminar 30 minutos diarios es la intervención con mejor relación esfuerzo-beneficio para sedentarios. La OMS recomienda 150-300 min/semana de actividad moderada o 75-150 min intensa.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Las pantallas antes de dormir afectan realmente?</dt>
            <dd className={styles.eduFaqRespuesta}>Sí. La luz azul suprime la melatonina hasta 3 horas. Evita pantallas 1 h antes de dormir o usa filtros de luz azul desde las 20:00. Esto también mejora la calidad de sueño profundo.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Es malo tomar café?</dt>
            <dd className={styles.eduFaqRespuesta}>No con moderación. Hasta 3-4 tazas al día (400 mg cafeína) es seguro para la mayoría de adultos. El problema es tomarlo después de las 14:00: su vida media de 5-6 h altera el sueño nocturno.</dd>
          </div>
          <div className={styles.eduFaqItem}>
            <dt className={styles.eduFaqPregunta}>¿Cómo sé si tengo estrés crónico?</dt>
            <dd className={styles.eduFaqRespuesta}>Señales: tensión muscular persistente, insomnio, irritabilidad, digestión irregular, mayor frecuencia de resfriados. El estrés crónico eleva el cortisol, suprime el sistema inmune y aumenta la inflamación.</dd>
          </div>
        </dl>

        {/* Guía paso a paso */}
        <h3>Plan de mejora de hábitos en 6 semanas</h3>
        <ol className={styles.eduPasosList}>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>1</span>
            <div><strong>Semana 1 — Diagnóstico:</strong> Haz este test y anota tus puntuaciones por área. Elige solo 1-2 áreas a mejorar (no todas a la vez).</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>2</span>
            <div><strong>Semana 2 — Define el hábito mínimo viable:</strong> Ej: «Caminar 10 min después de comer» en vez de «hacer ejercicio». Cuanto más pequeño, más probable de cumplirse.</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>3</span>
            <div><strong>Semana 3 — Ancla a una rutina existente:</strong> Conecta el nuevo hábito a algo que ya haces. Ej: «Después de desayunar, tomo 5 min de sol en el balcón».</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>4</span>
            <div><strong>Semana 4 — Registra el progreso:</strong> Usa un calendario o app. Ver la cadena de días cumplidos («don't break the chain») es un motivador potente.</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>5</span>
            <div><strong>Semana 5 — Aumenta gradualmente:</strong> Si caminas 10 min, pasa a 15. El incremento del 10% semanal es sostenible y evita abandono.</div>
          </li>
          <li className={styles.eduPaso}>
            <span className={styles.eduPasoNum}>6</span>
            <div><strong>Semana 6 — Repite el test:</strong> Mide el cambio en tus puntuaciones. Celebra mejoras pequeñas y añade el siguiente hábito prioritario.</div>
          </li>
        </ol>

        {/* Tips */}
        <h3>6 claves para que los hábitos duren</h3>
        <div className={styles.eduTipsGrid}>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>🎯</span><p>Un hábito a la vez. El «todo o nada» es la principal causa de abandono.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>📅</span><p>Misma hora, mismo lugar. La consistencia contextual acelera la automatización.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>👥</span><p>Comparte tu objetivo con alguien. La responsabilidad social duplica la adherencia.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>⚡</span><p>Prepara el entorno: zapatillas a la vista, fruta en la encimera, móvil fuera del dormitorio.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>🔄</span><p>Los fallos son normales. Fallar un día no rompe el hábito; abandonar tras el fallo, sí.</p></div>
          <div className={styles.eduTipCard}><span className={styles.eduTipIcono}>🧠</span><p>Reencuadra la identidad: «soy una persona activa» funciona mejor que «intento hacer ejercicio».</p></div>
        </div>

        {/* Warning */}
        <div className={styles.warningBox}>
          <span className={styles.warningIcono}>⚠️</span>
          <div>
            <strong>Importante sobre este test</strong>
            <ul>
              <li>Los resultados son orientativos y no sustituyen la evaluación de un profesional sanitario.</li>
              <li>Cambios drásticos de dieta o ejercicio sin supervisión pueden ser contraproducentes.</li>
              <li>Si tienes condiciones de salud preexistentes, consulta a tu médico antes de modificar hábitos.</li>
              <li>El bienestar es multifactorial: un test no puede capturar toda la complejidad individual.</li>
            </ul>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-habitos-saludables')} />

      <ShareCard appName="test-habitos-saludables" />
      <Footer appName="test-habitos-saludables" />
    </div>
  );
}
