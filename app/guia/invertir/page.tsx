'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaInvertir.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, DisclaimerCard, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas disponibles para inversión
const tools = [
  {
    id: 'test-perfil-inversor',
    name: 'Test Perfil Inversor',
    icon: '🎯',
    url: '/test-perfil-inversor/',
    question: '¿Qué tipo de inversor soy?',
    description: 'Descubre tu tolerancia al riesgo y horizonte temporal. El primer paso antes de elegir dónde invertir.',
    step: 1,
  },
  {
    id: 'interes-compuesto',
    name: 'Calculadora Interés Compuesto',
    icon: '📈',
    url: '/estimador-interes-compuesto/',
    question: '¿Cuánto puede crecer mi dinero a largo plazo?',
    description: 'Visualiza el poder del interés compuesto. Aportes periódicos + tiempo = crecimiento exponencial.',
    step: 2,
  },
  {
    id: 'estimador-inversiones',
    name: 'Estimador de Inversiones',
    icon: '💰',
    url: '/estimador-inversiones/',
    question: '¿Cuánto necesito ahorrar para mi objetivo?',
    description: 'Calcula cuánto aportar mensualmente para alcanzar tu meta de ahorro o jubilación.',
    step: 3,
  },
  {
    id: 'estimador-cartera',
    name: 'Simulador de Cartera',
    icon: '📊',
    url: '/estimador-cartera-inversion/',
    question: '¿Cómo se comportaría mi cartera?',
    description: 'Simulación Monte Carlo, ratio Sharpe y análisis de volatilidad para tu distribución de activos.',
    step: 4,
  },
];

// Pasos del journey de inversión
const journeySteps = [
  {
    number: 1,
    title: 'Conoce tu perfil',
    description: 'Antes de invertir, entiende cuánto riesgo puedes asumir y cuánto tiempo tienes.',
    tip: 'Un inversor conservador a largo plazo puede permitirse más riesgo que uno agresivo a corto plazo.',
  },
  {
    number: 2,
    title: 'Entiende el interés compuesto',
    description: 'El tiempo es tu mayor aliado. Empezar pronto importa más que empezar con mucho.',
    tip: '10.000€ creciendo a un 7% anual (media histórica aproximada de índices globales como el MSCI World en USD; no garantizada) serían ~76.000€ en 30 años. El secreto es el tiempo, no la cantidad inicial.',
  },
  {
    number: 3,
    title: 'Define tu objetivo',
    description: 'Ahorro para emergencias, jubilación, compra de casa... Cada objetivo tiene su estrategia.',
    tip: 'Primero fondo de emergencia (3-6 meses de gastos), luego inversión a largo plazo.',
  },
  {
    number: 4,
    title: 'Diversifica y mantén',
    description: 'No pongas todos los huevos en la misma cesta. Y sobre todo: no vendas en pánico.',
    tip: 'Los fondos indexados globales ofrecen diversificación automática con costes muy bajos.',
  },
];

// FAQs comunes
const faqData = [
  {
    question: '¿Cuánto dinero necesito para empezar a invertir?',
    answer: 'Puedes empezar desde 50-100€ mensuales. Muchos brokers no tienen mínimos. Lo importante no es cuánto, sino empezar pronto y ser constante. Los fondos indexados permiten invertir cantidades pequeñas de forma diversificada.',
  },
  {
    question: '¿Qué son los fondos indexados?',
    answer: 'Son fondos que replican un índice bursátil (como el MSCI World o el S&P 500 de EE. UU.) de forma automática. Tienen comisiones muy bajas (0,1-0,3% anual) y ofrecen diversificación instantánea en cientos de empresas. Son la opción favorita para inversores pasivos. El MSCI World incluye empresas de múltiples países y se considera más adecuado como referencia para el inversor internacional.',
  },
  {
    question: '¿Cuánto debería invertir de mi sueldo?',
    answer: 'Una guía orientativa es destinar un porcentaje a necesidades básicas, otro a gastos discrecionales y otro a ahorro/inversión (la proporción depende de tu nivel de ingresos y situación). Antes de invertir, conviene tener un fondo de emergencia de 3-6 meses de gastos. Invierte únicamente lo que puedas mantener a largo plazo sin necesitar.',
  },
  {
    question: '¿Es seguro invertir en bolsa?',
    answer: 'A corto plazo, la bolsa es volátil y puedes perder. A largo plazo (15+ años), históricamente siempre ha dado rentabilidad positiva. La clave es: diversificar, no invertir dinero que necesites pronto, y no vender en las caídas.',
  },
  {
    question: '¿Cuántos impuestos pago por mis inversiones?',
    answer: 'En España, las plusvalías tributan del 19% al 30% según el importe. Hasta 6.000€: 19%. De 6.000€ a 50.000€: 21%. De 50.000€ a 200.000€: 23%. De 200.000€ a 300.000€: 27%. Más de 300.000€: 30%. Solo pagas cuando vendes con beneficio.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Pablo quiere empezar a invertir para su jubilación',
  situation: 'Ingeniero de 30 años, sueldo neto de 2.200€/mes. Tiene 5.000€ ahorrados y quiere empezar a invertir pensando en los próximos 30-35 años.',
  steps: [
    { tool: 'Test Perfil Inversor', result: 'Perfil moderado-agresivo. Con 30+ años por delante, puede asumir volatilidad a cambio de mayor rentabilidad esperada.' },
    { tool: 'Interés Compuesto', result: 'Invirtiendo 300€/mes a un 7% anual estimado (media histórica aproximada de índices globales; no garantizada) durante 30 años: ~340.000€ (108.000€ aportaciones + 232.000€ rendimiento).' },
    { tool: 'Simulador Cartera', result: 'Cartera 80% renta variable global / 20% bonos. Rentabilidad esperada 6-7%, volatilidad asumible para su perfil.' },
  ],
  conclusion: 'Pablo decide invertir 300€/mes en un fondo indexado global. Automatiza las aportaciones y se compromete a no tocar el dinero hasta la jubilación.',
};

export default function GuiaInvertirPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📈</span>
        <h1 className={styles.title}>Guía para Invertir</h1>
        <p className={styles.subtitle}>
          Primeros pasos en inversión: desde entender tu perfil
          hasta construir una cartera diversificada.
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

      {/* Disclaimer Legal */}
      <DisclaimerCard
        variant="financial"
        severity="high"
      />

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗺️</span>
          Tu camino hacia la inversión
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
          Empieza por conocer tu perfil. Después explora el resto según tu situación.
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
        <h2 className={styles.ctaTitle}>¿Listo para empezar?</h2>
        <p className={styles.ctaText}>
          El primer paso es conocerte. Descubre qué tipo de inversor eres
          y cuánto riesgo puedes asumir.
        </p>
        <Link href="/test-perfil-inversor/" className={styles.ctaButton}>
          Hacer test de perfil inversor
        </Link>
      </section>

      {/* Cross-linking */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/freelance/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>💼</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Freelance</h3>
              <p className={styles.otherGuideDescription}>Gestiona tus ingresos variables</p>
            </div>
          </Link>
          <Link href="/guia/comprar-casa/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🏠</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Comprar Casa</h3>
              <p className={styles.otherGuideDescription}>Otra forma de invertir tu dinero</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-invertir')} />
      <ShareCard appName="guia-invertir" />
      <Footer appName="guia-invertir" />
    </div>
  );
}
