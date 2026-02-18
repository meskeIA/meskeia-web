'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaVivirSano.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas disponibles para vivir más sano
const tools = [
  {
    id: 'imc',
    name: 'Calculadora de IMC',
    icon: '⚖️',
    url: '/calculadora-imc/',
    question: '¿Está mi peso en el rango saludable?',
    description: 'Calcula tu Índice de Masa Corporal y entiende qué significa para tu salud a largo plazo.',
    step: 1,
  },
  {
    id: 'calorias-ejercicio',
    name: 'Calorías y Ejercicio',
    icon: '🔥',
    url: '/calculadora-calorias-ejercicio/',
    question: '¿Cuántas calorías quemo con mi actividad?',
    description: 'Calcula tus necesidades calóricas según tu actividad física y tu objetivo: perder, mantener o ganar peso.',
    step: 2,
  },
  {
    id: 'macros',
    name: 'Calculadora de Macros',
    icon: '🥗',
    url: '/calculadora-macros/',
    question: '¿Cuántas proteínas, carbos y grasas necesito?',
    description: 'Distribuye tus macronutrientes según tu objetivo. Perder grasa, ganar músculo o simplemente comer equilibrado.',
    step: 3,
  },
  {
    id: 'hidratacion',
    name: 'Calculadora de Hidratación',
    icon: '💧',
    url: '/calculadora-hidratacion/',
    question: '¿Cuánta agua necesito beber al día?',
    description: 'Calcula tu necesidad de agua según tu peso, actividad física y temperatura. La hidratación afecta directamente al rendimiento.',
    step: 4,
  },
  {
    id: 'sueno',
    name: 'Calculadora de Sueño',
    icon: '😴',
    url: '/calculadora-sueno/',
    question: '¿A qué hora me conviene acostarme?',
    description: 'Calcula los ciclos de sueño óptimos para despertar descansado. El sueño es el hábito de salud más infravalorado.',
    step: 5,
  },
  {
    id: 'habitos',
    name: 'Seguimiento de Hábitos',
    icon: '✅',
    url: '/seguimiento-habitos/',
    question: '¿Cómo convierto mis intenciones en hábitos?',
    description: 'Registra y visualiza tus hábitos diarios. La consistencia a lo largo del tiempo es lo que genera resultados reales.',
    step: 6,
  },
  {
    id: 'menu',
    name: 'Planificador de Menú',
    icon: '🍽️',
    url: '/planificador-menu/',
    question: '¿Cómo organizo mis comidas de la semana?',
    description: 'Planifica tu menú semanal para comer equilibrado, ahorrar tiempo y evitar las malas decisiones por falta de planificación.',
    step: 7,
  },
];

// Pasos del journey de salud
const journeySteps = [
  {
    number: 1,
    title: 'Conoce tu punto de partida',
    description: 'Calcula tu IMC y tus necesidades calóricas reales. Sin datos no puedes tomar decisiones informadas sobre tu salud.',
    tip: 'El IMC es una guía, no un diagnóstico. Combínalo con perímetro de cintura y porcentaje de grasa para una foto más completa.',
  },
  {
    number: 2,
    title: 'Planifica tu nutrición',
    description: 'Define tus macros según tu objetivo y organiza tus comidas de la semana para no improvisar.',
    tip: 'Preparar la comida del domingo para toda la semana (meal prep) es la estrategia más eficaz para mantener una dieta consistente.',
  },
  {
    number: 3,
    title: 'Optimiza sueño e hidratación',
    description: 'El 80% de los resultados vienen del sueño, la hidratación y el estrés, no solo de la dieta y el ejercicio.',
    tip: 'Dormir menos de 7 horas aumenta el apetito, reduce la fuerza y dispara el cortisol. El sueño es entrenamiento también.',
  },
  {
    number: 4,
    title: 'Construye hábitos duraderos',
    description: 'La salud no se consigue en un sprint de 30 días. Se construye con pequeñas acciones repetidas durante meses.',
    tip: 'Empieza con solo 2-3 hábitos pequeños. Añadir uno cada mes es mucho más sostenible que cambiar todo a la vez.',
  },
];

// FAQs comunes
const faqData = [
  {
    question: '¿Qué es mejor para adelgazar, dieta o ejercicio?',
    answer: 'La alimentación representa aproximadamente el 80% de los resultados en composición corporal. El ejercicio contribuye directamente menos de lo que creemos en términos calóricos, pero es fundamental para mantener la masa muscular, mejorar el metabolismo a largo plazo y la salud general. La fórmula ganadora: déficit calórico moderado (300-500 kcal) + entrenamiento de fuerza + paciencia.',
  },
  {
    question: '¿Cuántas proteínas necesito al día?',
    answer: 'La recomendación general para mantener o ganar masa muscular es 1,6-2,2g de proteína por kg de peso corporal. Para alguien de 70kg, esto significa entre 112-154g de proteína al día. Si estás en déficit calórico (perdiendo peso), ir hacia el límite superior ayuda a preservar músculo mientras se pierde grasa.',
  },
  {
    question: '¿Cuántas horas de sueño necesito?',
    answer: 'La mayoría de los adultos necesitan entre 7 y 9 horas. Más importante que las horas totales es la regularidad: acostarse y levantarse a la misma hora, incluso los fines de semana, sincroniza el ritmo circadiano y mejora la calidad del sueño. La deuda de sueño acumulada no se recupera del todo con dormir más el fin de semana.',
  },
  {
    question: '¿Cuánta agua debo beber al día?',
    answer: 'La recomendación estándar de "8 vasos" es una simplificación. Tus necesidades dependen del peso, temperatura, actividad física y dieta. Una guía práctica: la orina debe ser de color amarillo pálido. Si es oscura, bebe más. Si es casi incolora, ya estás bien hidratado. La calculadora de hidratación te dará una cifra personalizada.',
  },
  {
    question: '¿Cuánto tarda en formarse un hábito?',
    answer: 'El mito de los "21 días" es falso. Los estudios muestran que un hábito tarda entre 18 y 254 días en automatizarse, con una media de 66 días. La clave no es el tiempo sino la frecuencia y consistencia. Usar un sistema de seguimiento visual (como el de la app de hábitos) crea compromiso y hace visible el progreso.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Marcos quiere perder 12kg y tener más energía durante el día',
  situation: 'Técnico informático de 38 años, trabaja sentado 8h al día. Pesa 90kg, 1,78m. Se siente cansado permanentemente y quiere perder peso.',
  steps: [
    { tool: 'Calculadora de IMC', result: 'IMC 28,4 → Sobrepeso leve. Objetivo realista: bajar a 78kg (IMC 24,6) en 10-12 meses.' },
    { tool: 'Calorías y Macros', result: 'Gasto diario estimado: 2.200 kcal. Con déficit de 400 kcal: 1.800 kcal/día. Proteína objetivo: 160g. Estrategia viable sin pasar hambre.' },
    { tool: 'Calculadora de Sueño', result: 'Está durmiendo 5,5h. Calculando ciclos: debería acostarse a las 23:00 para levantarse a las 6:30 con 5 ciclos completos. Cambio de hábito inmediato.' },
  ],
  conclusion: 'A los 6 meses: 8kg menos, sin dietas extremas. El cambio más impactante fue dormir 7,5h: redujo el apetito y la energía subió notablemente.',
};

export default function GuiaVivirSanoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🌿</span>
        <h1 className={styles.title}>Guía para Vivir Más Sano</h1>
        <p className={styles.subtitle}>
          Nutrición, sueño, hidratación y hábitos. Todo lo que necesitas para
          mejorar tu salud de forma sostenible, sin dietas milagro.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{tools.length}</span>
            <span className={styles.heroStatLabel}>Herramientas</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{journeySteps.length}</span>
            <span className={styles.heroStatLabel}>Pasos clave</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>100%</span>
            <span className={styles.heroStatLabel}>Gratuito</span>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Disclaimer Salud */}
      <DisclaimerCard
        variant="medical"
        severity="high"
      />

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗺️</span>
          Tu camino hacia una vida más sana
        </h2>
        <div className={styles.journeyGrid}>
          {journeySteps.map((step) => (
            <div key={step.number} className={styles.journeyCard}>
              <div className={styles.journeyNumber}>{step.number}</div>
              <h3 className={styles.journeyTitle}>{step.title}</h3>
              <p className={styles.journeyDescription}>{step.description}</p>
              <div className={styles.journeyTip}>
                <span className={styles.tipIcon}>💡</span>
                <span>{step.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Caso de Estudio */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📖</span>
          Ejemplo real
        </h2>
        <div className={styles.caseStudyCard}>
          <h3 className={styles.caseStudyTitle}>{caseStudy.title}</h3>
          <p className={styles.caseStudySituation}>
            <strong>Situación:</strong> {caseStudy.situation}
          </p>
          <div className={styles.caseStudySteps}>
            {caseStudy.steps.map((step, index) => (
              <div key={index} className={styles.caseStudyStep}>
                <span className={styles.caseStudyStepNumber}>{index + 1}</span>
                <div>
                  <strong>{step.tool}:</strong> {step.result}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.caseStudyConclusion}>
            <span className={styles.conclusionIcon}>✅</span>
            <span><strong>Conclusión:</strong> {caseStudy.conclusion}</span>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🧰</span>
          Herramientas disponibles
        </h2>
        <p className={styles.toolsSubtitle}>
          Empieza por las que más necesitas. No tienes que usarlas todas a la vez.
        </p>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.url} className={styles.toolCard}>
              <div className={styles.toolHeader}>
                <span className={styles.toolIcon}>{tool.icon}</span>
                <span className={styles.toolStep}>Paso {tool.step}</span>
              </div>
              <h3 className={styles.toolName}>{tool.name}</h3>
              <p className={styles.toolQuestion}>{tool.question}</p>
              <p className={styles.toolDescription}>{tool.description}</p>
              <span className={styles.toolCta}>Usar herramienta →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>❓</span>
          Preguntas frecuentes
        </h2>
        <div className={styles.faqList}>
          {faqData.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={`${styles.faqQuestion} ${openFaq === index ? styles.faqQuestionOpen : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                aria-expanded={openFaq === index}
              >
                <span>{faq.question}</span>
                <span className={styles.faqToggle}>{openFaq === index ? '−' : '+'}</span>
              </button>
              {openFaq === index && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Listo para empezar el cambio?</h2>
        <p className={styles.ctaText}>
          Calcula tu IMC para saber en qué punto estás.
          Es el primer paso para entender qué necesitas mejorar.
        </p>
        <Link href="/calculadora-imc/" className={styles.ctaButton}>
          Calcular mi IMC
        </Link>
      </section>

      {/* Cross-linking */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/ahorrar-dinero/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>💰</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Ahorrar Dinero</h3>
              <p className={styles.otherGuideDescription}>Ordena tus finanzas personales</p>
            </div>
          </Link>
          <Link href="/guia/freelance/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>💼</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Freelance</h3>
              <p className={styles.otherGuideDescription}>Trabaja por tu cuenta</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-vivir-sano')} />
      <Footer appName="guia-vivir-sano" />
    </div>
  );
}
