'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './TestPerfilInversor.module.css';
import { MeskeiaLogo, Footer, EducationalSection } from '@/components';

// Definición de preguntas con puntuaciones
interface Option {
  text: string;
  points: number;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: '¿Cuál es tu horizonte temporal de inversión?',
    options: [
      { text: 'Menos de 2 años - Necesitaré el dinero pronto', points: 1 },
      { text: '2 a 5 años - Plazo medio', points: 2 },
      { text: '5 a 10 años - Largo plazo', points: 3 },
      { text: 'Más de 10 años - No tengo prisa', points: 4 },
    ],
  },
  {
    id: 2,
    text: 'Si tu cartera perdiera un 20% de su valor en un mes, ¿qué harías?',
    options: [
      { text: 'Vendería todo inmediatamente para evitar más pérdidas', points: 1 },
      { text: 'Vendería una parte para reducir el riesgo', points: 2 },
      { text: 'Mantendría la posición y esperaría la recuperación', points: 3 },
      { text: 'Aprovecharía para comprar más a precios más bajos', points: 4 },
    ],
  },
  {
    id: 3,
    text: '¿Cuánta experiencia tienes invirtiendo en bolsa o fondos de inversión?',
    options: [
      { text: 'Ninguna - Soy completamente nuevo/a', points: 1 },
      { text: 'Poca - He invertido alguna vez pero sin seguimiento', points: 2 },
      { text: 'Moderada - Invierto regularmente desde hace años', points: 3 },
      { text: 'Amplia - Llevo más de 10 años invirtiendo activamente', points: 4 },
    ],
  },
  {
    id: 4,
    text: '¿Qué porcentaje de tus ahorros totales vas a destinar a inversiones?',
    options: [
      { text: 'Menos del 20% - Solo una pequeña parte', points: 1 },
      { text: '20% a 40% - Una parte moderada', points: 2 },
      { text: '40% a 60% - Una parte significativa', points: 3 },
      { text: 'Más del 60% - La mayor parte de mis ahorros', points: 4 },
    ],
  },
  {
    id: 5,
    text: '¿Cuál es tu situación laboral y estabilidad de ingresos?',
    options: [
      { text: 'Ingresos variables o inestables', points: 1 },
      { text: 'Empleo estable pero sin grandes ahorros aún', points: 2 },
      { text: 'Empleo estable con buen colchón de emergencia', points: 3 },
      { text: 'Múltiples fuentes de ingresos o patrimonio consolidado', points: 4 },
    ],
  },
  {
    id: 6,
    text: '¿Cómo te sentirías si tu inversión cayera un 30% en un año?',
    options: [
      { text: 'Muy preocupado/a - No podría dormir tranquilo/a', points: 1 },
      { text: 'Preocupado/a - Me generaría ansiedad', points: 2 },
      { text: 'Algo inquieto/a pero entendería que es normal', points: 3 },
      { text: 'Tranquilo/a - Es parte del juego a largo plazo', points: 4 },
    ],
  },
  {
    id: 7,
    text: '¿Cuál es tu objetivo principal al invertir?',
    options: [
      { text: 'Preservar mi capital - No perder dinero', points: 1 },
      { text: 'Obtener algo más que la inflación', points: 2 },
      { text: 'Hacer crecer mi patrimonio a largo plazo', points: 3 },
      { text: 'Maximizar rentabilidad aunque implique más riesgo', points: 4 },
    ],
  },
  {
    id: 8,
    text: '¿Tienes otros ahorros o inversiones además de lo que vas a invertir ahora?',
    options: [
      { text: 'No, este es todo mi ahorro', points: 1 },
      { text: 'Tengo un pequeño fondo de emergencia', points: 2 },
      { text: 'Tengo fondo de emergencia + otras inversiones', points: 3 },
      { text: 'Tengo un patrimonio diversificado (inmuebles, fondos, etc.)', points: 4 },
    ],
  },
  {
    id: 9,
    text: '¿Cómo reaccionas normalmente ante noticias económicas negativas?',
    options: [
      { text: 'Me alarmo y pienso en proteger lo que tengo', points: 1 },
      { text: 'Me preocupo pero intento mantener la calma', points: 2 },
      { text: 'Las sigo pero no cambio mi estrategia', points: 3 },
      { text: 'Las veo como potenciales oportunidades', points: 4 },
    ],
  },
  {
    id: 10,
    text: '¿Qué afirmación te representa mejor?',
    options: [
      { text: '"Prefiero ganar poco pero seguro a arriesgarme a perder"', points: 1 },
      { text: '"Acepto algo de riesgo si la posible ganancia lo justifica"', points: 2 },
      { text: '"Estoy dispuesto a asumir volatilidad por mayores rendimientos"', points: 3 },
      { text: '"No me importa perder temporalmente si a largo plazo gano más"', points: 4 },
    ],
  },
];

// Perfiles de inversor
type ProfileType = 'conservador' | 'moderado' | 'equilibrado' | 'dinamico' | 'agresivo';

interface Profile {
  name: string;
  icon: string;
  range: [number, number];
  description: string;
  traits: {
    riesgo: string;
    horizonte: string;
    volatilidad: string;
    objetivo: string;
  };
  allocation: {
    rv: number;
    rf: number;
    liq: number;
    alt: number;
  };
  recommendations: string[];
}

const PROFILES: Record<ProfileType, Profile> = {
  conservador: {
    name: 'Conservador',
    icon: '🛡️',
    range: [10, 16],
    description: 'Priorizas la seguridad sobre la rentabilidad. Prefieres evitar pérdidas aunque eso signifique menores ganancias. Ideal para horizontes cortos o personas cercanas a la jubilación.',
    traits: {
      riesgo: 'Muy bajo',
      horizonte: '< 3 años',
      volatilidad: '5-8%',
      objetivo: 'Preservar capital',
    },
    allocation: { rv: 15, rf: 60, liq: 20, alt: 5 },
    recommendations: [
      'Fondos monetarios y depósitos a plazo',
      'Bonos gubernamentales de corto plazo',
      'ETFs de renta fija de alta calidad',
      'Mantener un colchón de emergencia amplio',
    ],
  },
  moderado: {
    name: 'Moderado',
    icon: '⚖️',
    range: [17, 22],
    description: 'Buscas un equilibrio entre seguridad y crecimiento. Aceptas algo de volatilidad pero sin excesos. Perfil común para quienes empiezan a invertir con prudencia.',
    traits: {
      riesgo: 'Bajo',
      horizonte: '3-5 años',
      volatilidad: '8-12%',
      objetivo: 'Batir inflación',
    },
    allocation: { rv: 30, rf: 50, liq: 15, alt: 5 },
    recommendations: [
      'Fondos mixtos conservadores',
      'Combinación de ETFs de renta fija y variable',
      'Planes de pensiones conservadores',
      'Diversificación geográfica moderada',
    ],
  },
  equilibrado: {
    name: 'Equilibrado',
    icon: '📊',
    range: [23, 28],
    description: 'Buscas crecimiento a largo plazo aceptando volatilidad moderada. Entiendes que las caídas son temporales y mantienes la calma. Perfil más común entre inversores experimentados.',
    traits: {
      riesgo: 'Medio',
      horizonte: '5-10 años',
      volatilidad: '12-15%',
      objetivo: 'Crecimiento sostenido',
    },
    allocation: { rv: 50, rf: 35, liq: 10, alt: 5 },
    recommendations: [
      'Fondos indexados globales (MSCI World)',
      'ETFs de acumulación',
      'Cartera 60/40 clásica',
      'Aportaciones periódicas (DCA)',
    ],
  },
  dinamico: {
    name: 'Dinámico',
    icon: '📈',
    range: [29, 34],
    description: 'Priorizas el crecimiento y toleras bien la volatilidad. Las caídas no te asustan y sabes que son oportunidades. Horizonte largo y capacidad de aguantar malos años.',
    traits: {
      riesgo: 'Alto',
      horizonte: '10-15 años',
      volatilidad: '15-20%',
      objetivo: 'Maximizar crecimiento',
    },
    allocation: { rv: 70, rf: 20, liq: 5, alt: 5 },
    recommendations: [
      'ETFs de renta variable global',
      'Fondos indexados de mercados desarrollados',
      'Exposición a mercados emergentes',
      'Small caps para mayor potencial',
    ],
  },
  agresivo: {
    name: 'Agresivo',
    icon: '🚀',
    range: [35, 40],
    description: 'Buscas máxima rentabilidad asumiendo alto riesgo. Tienes experiencia, horizonte muy largo y capacidad de no vender en pánico durante crisis. Perfil para inversores experimentados.',
    traits: {
      riesgo: 'Muy alto',
      horizonte: '> 15 años',
      volatilidad: '20-25%',
      objetivo: 'Máxima rentabilidad',
    },
    allocation: { rv: 90, rf: 5, liq: 0, alt: 5 },
    recommendations: [
      'ETFs 100% renta variable global',
      'Exposición significativa a mercados emergentes',
      'Factor investing (small value, momentum)',
      'Considerar apalancamiento moderado a largo plazo',
    ],
  },
};

// Determinar perfil según puntuación
function getProfile(score: number): ProfileType {
  if (score <= 16) return 'conservador';
  if (score <= 22) return 'moderado';
  if (score <= 28) return 'equilibrado';
  if (score <= 34) return 'dinamico';
  return 'agresivo';
}

// Calcular posición en la barra (0-100%)
function getBarPosition(score: number): number {
  // Score va de 10 a 40, mapeamos a 0-100%
  return Math.min(100, Math.max(0, ((score - 10) / 30) * 100));
}

export default function TestPerfilInversorPage() {
  const [phase, setPhase] = useState<'start' | 'questions' | 'result'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleStart = () => {
    setPhase('questions');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId: number, points: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: points }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setPhase('result');
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setPhase('start');
    setCurrentQuestion(0);
    setAnswers({});
  };

  // Calcular puntuación total
  const totalScore = Object.values(answers).reduce((sum, points) => sum + points, 0);
  const profileType = getProfile(totalScore);
  const profile = PROFILES[profileType];

  // Renderizar pantalla de inicio
  if (phase === 'start') {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🎯 Test de Perfil Inversor</h1>
          <p className={styles.subtitle}>Descubre tu tolerancia al riesgo en 5 minutos</p>
        </header>

        <div className={styles.startScreen}>
          <div className={styles.startIcon}>📊</div>
          <h2 className={styles.startTitle}>¿Qué tipo de inversor eres?</h2>
          <p className={styles.startDescription}>
            Responde 10 preguntas sobre tu situación financiera, experiencia y actitud
            ante el riesgo. Al final recibirás tu perfil personalizado con recomendaciones
            de inversión adaptadas a ti.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>10 preguntas sencillas</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>5 minutos para completar</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Resultado inmediato</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Recomendaciones personalizadas</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>100% gratuito y privado</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>No requiere registro</span>
            </div>
          </div>

          <button className={styles.startButton} onClick={handleStart}>
            Comenzar Test →
          </button>
        </div>

        <div className={styles.disclaimer}>
          <h3>⚠️ Aviso Importante</h3>
          <p>
            Este test es orientativo y educativo. El resultado <strong>no constituye
            asesoramiento financiero</strong>. Tu perfil real puede variar según
            circunstancias personales no contempladas en este cuestionario. Antes de
            invertir, consulta con un profesional autorizado.
          </p>
        </div>

        <EducationalSection
          title="¿Quieres aprender más sobre perfiles de inversor?"
          subtitle="Descubre qué significan los perfiles, cómo influyen en tu estrategia y conceptos clave"
        >
          <section className={styles.guideSection}>
            <h2>Conceptos Clave</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>🎯 ¿Qué es el perfil inversor?</h4>
                <p>
                  Es una clasificación que combina tu tolerancia al riesgo, horizonte temporal,
                  situación financiera y objetivos. Determina qué tipo de inversiones son
                  más adecuadas para ti y cómo distribuir tu cartera.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>📊 Renta Variable vs Renta Fija</h4>
                <p>
                  La renta variable (acciones, fondos) tiene mayor potencial de rentabilidad
                  pero más volatilidad. La renta fija (bonos, depósitos) es más estable pero
                  con menor rentabilidad esperada. Tu perfil determina la proporción ideal.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>⏰ Horizonte temporal</h4>
                <p>
                  El tiempo que puedes mantener la inversión es crucial. A más largo plazo,
                  puedes asumir más riesgo porque tienes tiempo de recuperarte de caídas.
                  A corto plazo, necesitas inversiones más conservadoras.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>💰 Diversificación</h4>
                <p>
                  No pongas todos los huevos en la misma cesta. Diversificar entre diferentes
                  tipos de activos, sectores y geografías reduce el riesgo global de tu
                  cartera sin sacrificar necesariamente la rentabilidad esperada.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿Puede cambiar mi perfil inversor con el tiempo?</summary>
                <p>
                  Sí, es normal que cambie. A medida que te acercas a la jubilación, sueles
                  volverte más conservador. También puede cambiar por eventos vitales (herencia,
                  pérdida de empleo, matrimonio) o simplemente por más experiencia invirtiendo.
                  Se recomienda revisar el perfil anualmente.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Es malo ser conservador?</summary>
                <p>
                  No existe un perfil "mejor" o "peor". Lo importante es que se ajuste a tu
                  situación real. Un perfil conservador es perfectamente válido si tienes
                  horizonte corto, baja tolerancia a pérdidas, o necesitas preservar capital.
                  Lo malo sería invertir de forma agresiva cuando no puedes permitirte perder.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Debo invertir todo según mi perfil?</summary>
                <p>
                  El perfil es una guía, no una regla absoluta. Puedes tener una parte más
                  conservadora (fondo de emergencia, metas a corto plazo) y otra más agresiva
                  (jubilación lejana). Lo importante es entender por qué tomas cada decisión.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué pasa si mis respuestas están en el límite entre dos perfiles?</summary>
                <p>
                  Es normal. Los perfiles son un espectro, no categorías rígidas. Si estás entre
                  "moderado" y "equilibrado", puedes elegir una distribución intermedia. Además,
                  puedes ajustar según tu intuición personal y experiencia previa.
                </p>
              </details>
            </div>
          </section>
        </EducationalSection>

        <Footer appName="test-perfil-inversor" />
      </div>
    );
  }

  // Renderizar preguntas
  if (phase === 'questions') {
    const question = QUESTIONS[currentQuestion];
    const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;
    const selectedAnswer = answers[question.id];

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🎯 Test de Perfil Inversor</h1>
          <p className={styles.subtitle}>Responde con sinceridad para obtener resultados precisos</p>
        </header>

        <div className={styles.progressText}>
          Pregunta {currentQuestion + 1} de {QUESTIONS.length}
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.questionCard}>
          <span className={styles.questionNumber}>Pregunta {question.id}</span>
          <h2 className={styles.questionText}>{question.text}</h2>

          <div className={styles.optionsGrid}>
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`${styles.optionButton} ${selectedAnswer === option.points ? styles.selected : ''}`}
                onClick={() => handleAnswer(question.id, option.points)}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className={styles.optionText}>{option.text}</span>
              </button>
            ))}
          </div>

          <div className={styles.navigation}>
            <button
              className={`${styles.navButton} ${styles.prev}`}
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              ← Anterior
            </button>
            <button
              className={`${styles.navButton} ${styles.next}`}
              onClick={handleNext}
              disabled={selectedAnswer === undefined}
            >
              {currentQuestion === QUESTIONS.length - 1 ? 'Ver Resultado' : 'Siguiente →'}
            </button>
          </div>
        </div>

        <Footer appName="test-perfil-inversor" />
      </div>
    );
  }

  // Renderizar resultado
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎉 ¡Test Completado!</h1>
        <p className={styles.subtitle}>Aquí está tu perfil de inversor personalizado</p>
      </header>

      <div className={styles.resultScreen}>
        <div className={styles.resultHeader}>
          <div className={styles.resultIcon}>{profile.icon}</div>
          <h2 className={styles.resultTitle}>Tu perfil es:</h2>
          <p className={styles.resultProfile}>{profile.name}</p>
        </div>

        {/* Barra visual de perfil */}
        <div className={styles.profileBar}>
          <div className={`${styles.profileSegment} ${styles.conservador}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.moderado}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.equilibrado}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.dinamico}`} style={{ width: '20%' }} />
          <div className={`${styles.profileSegment} ${styles.agresivo}`} style={{ width: '20%' }} />
        </div>
        <div className={styles.profileMarker}>
          <span
            className={styles.profileArrow}
            style={{ left: `${getBarPosition(totalScore)}%` }}
          >
            ▼
          </span>
        </div>
        <div className={styles.profileLabels}>
          <span>Conservador</span>
          <span>Moderado</span>
          <span>Equilibrado</span>
          <span>Dinámico</span>
          <span>Agresivo</span>
        </div>

        {/* Descripción */}
        <div className={styles.profileDescription}>
          <h4>Descripción de tu perfil</h4>
          <p>{profile.description}</p>
        </div>

        {/* Características */}
        <div className={styles.profileTraits}>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>⚠️</div>
            <span className={styles.traitLabel}>Nivel de riesgo</span>
            <span className={styles.traitValue}>{profile.traits.riesgo}</span>
          </div>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>📅</div>
            <span className={styles.traitLabel}>Horizonte ideal</span>
            <span className={styles.traitValue}>{profile.traits.horizonte}</span>
          </div>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>📊</div>
            <span className={styles.traitLabel}>Volatilidad esperada</span>
            <span className={styles.traitValue}>{profile.traits.volatilidad}</span>
          </div>
          <div className={styles.traitCard}>
            <div className={styles.traitIcon}>🎯</div>
            <span className={styles.traitLabel}>Objetivo principal</span>
            <span className={styles.traitValue}>{profile.traits.objetivo}</span>
          </div>
        </div>

        {/* Distribución recomendada */}
        <div className={styles.allocationSection}>
          <h4>📊 Distribución de activos recomendada</h4>
          <div className={styles.allocationBar}>
            {profile.allocation.rv > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.rv}`}
                style={{ width: `${profile.allocation.rv}%` }}
              >
                {profile.allocation.rv}%
              </div>
            )}
            {profile.allocation.rf > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.rf}`}
                style={{ width: `${profile.allocation.rf}%` }}
              >
                {profile.allocation.rf}%
              </div>
            )}
            {profile.allocation.liq > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.liq}`}
                style={{ width: `${profile.allocation.liq}%` }}
              >
                {profile.allocation.liq}%
              </div>
            )}
            {profile.allocation.alt > 0 && (
              <div
                className={`${styles.allocationSegment} ${styles.alt}`}
                style={{ width: `${profile.allocation.alt}%` }}
              >
                {profile.allocation.alt}%
              </div>
            )}
          </div>
          <div className={styles.allocationLegend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.rv}`} />
              <span>Renta Variable ({profile.allocation.rv}%)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.rf}`} />
              <span>Renta Fija ({profile.allocation.rf}%)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.liq}`} />
              <span>Liquidez ({profile.allocation.liq}%)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.alt}`} />
              <span>Alternativos ({profile.allocation.alt}%)</span>
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className={styles.profileDescription}>
          <h4>💡 Recomendaciones para tu perfil</h4>
          <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
            {profile.recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Acciones */}
        <div className={styles.resultActions}>
          <Link href="/calculadora-inversiones/" className={`${styles.actionButton} ${styles.primary}`}>
            💼 Ir a Calculadora de Inversiones
          </Link>
          <Link href="/curso-decisiones-inversion/" className={`${styles.actionButton} ${styles.secondary}`}>
            📚 Curso de Inversión
          </Link>
          <button onClick={handleRestart} className={`${styles.actionButton} ${styles.secondary}`}>
            🔄 Repetir Test
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Este resultado es orientativo y educativo. <strong>No constituye asesoramiento
          financiero personalizado</strong>. Las rentabilidades pasadas no garantizan
          resultados futuros. Antes de invertir, considera tu situación personal completa
          y consulta con un profesional autorizado por la CNMV.
        </p>
      </div>

      <Footer appName="test-perfil-inversor" />
    </div>
  );
}
