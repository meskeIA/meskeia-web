'use client';

import { useState } from 'react';
import styles from './TestHabitos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

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
        text: '¿Cuántos vasos de agua (o líquidos saludables) bebes al día aproximadamente?',
        options: [
          { text: 'Menos de 4 vasos', score: 1 },
          { text: '4-6 vasos', score: 2 },
          { text: '6-8 vasos', score: 3 },
          { text: 'Más de 8 vasos', score: 4 },
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
  if (percentage >= 80) return 'Excelente';
  if (percentage >= 60) return 'Bueno';
  if (percentage >= 40) return 'Mejorable';
  return 'A trabajar';
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

          {/* Disclaimer */}
          <div className={styles.disclaimer}>
            <h3>📋 Información</h3>
            <p>
              Este test es una herramienta orientativa de autoevaluación. Los resultados
              no constituyen un diagnóstico ni sustituyen el consejo de profesionales de
              la salud. Para una evaluación completa de tu estado de salud, consulta con
              tu médico.
            </p>
          </div>
        </div>
      )}

      <Footer appName="test-habitos" />
    </div>
  );
}
