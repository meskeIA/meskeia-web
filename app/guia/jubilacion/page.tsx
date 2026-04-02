'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaJubilacion.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas del journey de jubilación
const tools = [
  {
    id: 'simulador-jubilacion-publica',
    name: 'Simulador de Jubilación Pública',
    icon: '🏤',
    url: '/simulador-jubilacion-publica/',
    question: '¿Cuándo me jubilo y cuánto cobraré?',
    description: 'Edad de jubilación según año de nacimiento, pensión estimada con sistema dual 2026, jubilación anticipada y parcial. Todo en un solo simulador.',
    step: 1,
  },
  {
    id: 'planificador-ahorro-jubilacion',
    name: 'Planificador de Ahorro',
    icon: '💹',
    url: '/planificador-ahorro-jubilacion/',
    question: '¿Me llega la pensión? ¿Cuánto necesito ahorrar?',
    description: 'Calcula la brecha entre tu sueldo y tu pensión, cuánto ahorrar mensualmente, la ventaja fiscal del plan de pensiones y la proyección de capital.',
    step: 2,
  },
  {
    id: 'estimador-irpf-pensionista',
    name: 'IRPF Pensionista',
    icon: '📊',
    url: '/estimador-irpf-pensionista/',
    question: '¿Cuánto pagaré de impuestos como jubilado?',
    description: 'Estima el IRPF sobre tu pensión: reducción por rendimientos del trabajo, mínimo personal por edad (65/75 años) y pensión neta real.',
    step: 3,
  },
  {
    id: 'optimizador-rentas-60',
    name: 'Optimizador de Rentas 60+',
    icon: '💰',
    url: '/optimizador-rentas-60/',
    question: '¿Cómo optimizo mis ingresos como jubilado?',
    description: 'Estrategia fiscal para pensionistas con múltiples fuentes de renta: pensión, plan de pensiones, ahorro, alquiler. Minimiza el IRPF total.',
    step: 4,
  },
  {
    id: 'estimador-complemento-minimos',
    name: 'Complemento a Mínimos',
    icon: '🛡️',
    url: '/estimador-complemento-minimos/',
    question: '¿Tengo derecho a un complemento si mi pensión es baja?',
    description: 'Comprueba si tu pensión está por debajo del mínimo garantizado y cuánto complemento te corresponde según tu situación familiar.',
    step: 5,
  },
  {
    id: 'estimador-pension-viudedad',
    name: 'Pensión de Viudedad',
    icon: '💍',
    url: '/estimador-pension-viudedad/',
    question: '¿Qué cobraría mi pareja si yo falto?',
    description: 'Calcula la pensión de viudedad estimada: porcentaje aplicable (52%, 60% o 70%), base reguladora y mínimo garantizado.',
    step: 6,
  },
];

// Pasos del journey
const journeySteps = [
  {
    number: 1,
    title: 'Conoce tu pensión',
    description: 'El primer paso es saber cuándo podrás jubilarte y cuánto cobrarás de pensión pública.',
    tip: 'Descarga tu vida laboral en importass.seg-social.es para tener datos reales de cotización.',
  },
  {
    number: 2,
    title: 'Calcula la brecha',
    description: 'Compara tu sueldo actual con la pensión estimada. La diferencia es lo que necesitas cubrir con ahorro privado.',
    tip: 'La tasa de sustitución media en España ronda el 70-80%, pero varía mucho según historial.',
  },
  {
    number: 3,
    title: 'Planifica el ahorro',
    description: 'Define cuánto ahorrar mensualmente y qué instrumentos usar (plan de pensiones, fondos, PIAS...).',
    tip: 'Empezar 10 años antes puede duplicar el capital acumulado con la misma aportación mensual.',
  },
  {
    number: 4,
    title: 'Anticipa los impuestos',
    description: 'Las pensiones tributan como rendimientos del trabajo. Conocer tu IRPF evita sorpresas en la declaración.',
    tip: 'Planificar el rescate del plan de pensiones (renta vs capital) puede ahorrarte miles de euros.',
  },
  {
    number: 5,
    title: 'Protege a tu familia',
    description: 'Calcula qué cobraría tu pareja en caso de viudedad y si tienes derecho a complementos a mínimos.',
    tip: 'La pensión de viudedad se calcula sobre tu pensión, incluidas las reducciones por anticipación.',
  },
];

// FAQs
const faqData = [
  {
    question: '¿A qué edad me puedo jubilar?',
    answer: 'En 2026, la edad ordinaria es 66 años y 10 meses (o 65 con 38 años y 3 meses cotizados). En 2027 se estabiliza en 67 años (o 65 con 38 años y 6 meses).',
  },
  {
    question: '¿Cuántos años necesito cotizar para cobrar pensión?',
    answer: 'Un mínimo de 15 años, de los cuales al menos 2 deben estar dentro de los últimos 15 años. Con 15 años cobras el 50% de tu base reguladora; el 100% se alcanza con ~37 años.',
  },
  {
    question: '¿Qué es el sistema dual de pensiones 2026?',
    answer: 'Desde enero de 2026, la Seguridad Social calcula tu pensión con dos fórmulas (clásica y ampliada) y aplica automáticamente la más favorable. No necesitas hacer nada, es de oficio.',
  },
  {
    question: '¿Puedo jubilarme antes de la edad legal?',
    answer: 'Sí: jubilación anticipada voluntaria (hasta 2 años antes, 35+ años cotizados) o involuntaria (hasta 4 años, 33+ cotizados). Ambas implican reducciones permanentes en la pensión.',
  },
  {
    question: '¿Cuánto puedo aportar al plan de pensiones?',
    answer: 'El límite individual deducible es 1.500 €/año. Si tu empresa contribuye, el límite conjunto sube a 10.000 €/año. Las aportaciones reducen tu base imponible del IRPF.',
  },
  {
    question: '¿La pensión paga IRPF?',
    answer: 'Sí, tributa como rendimiento del trabajo. Los jubilados tienen reducciones específicas y mínimos personales por edad (65 y 75 años) que reducen la base imponible.',
  },
  {
    question: '¿Qué pasa si mi pensión es muy baja?',
    answer: 'Si tu pensión queda por debajo del mínimo garantizado (888,70 €/mes en 2026 sin cónyuge), la Seguridad Social la complementa automáticamente hasta ese mínimo, si cumples los requisitos de ingresos.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Antonio, 52 años, quiere planificar su jubilación',
  situation: 'Empleado con sueldo neto de 2.400 €/mes, 28 años cotizados, base media de cotización de 2.800 €/mes. Prevé jubilarse a los 67.',
  steps: [
    { tool: 'Simulador Jubilación Pública', result: 'Pensión estimada: 1.680 €/mes (sistema dual). Edad: 67 años. Con 43 años cotizados al jubilarse, alcanza el 100%.' },
    { tool: 'Planificador de Ahorro', result: 'Brecha: 720 €/mes. Capital necesario: 172.800 € (20 años). Ahorro necesario: 485 €/mes al 4% durante 15 años.' },
    { tool: 'IRPF Pensionista', result: 'Con 1.680 €/mes (23.520 €/año), retención IRPF ~8%. Pensión neta: ~1.546 €/mes.' },
    { tool: 'Pensión de Viudedad', result: 'Su pareja cobraría ~873 €/mes (52% de la pensión). Suficiente con la pensión propia de ella.' },
  ],
  conclusion: 'Antonio necesita ahorrar 485 €/mes durante 15 años. Con 125 €/mes en plan de pensiones (ahorro fiscal ~375 €/año) y 360 €/mes en fondos indexados, cubre la brecha con margen.',
};

export default function GuiaJubilacionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🏤</span>
        <h1 className={styles.title}>Guía de Jubilación</h1>
        <p className={styles.subtitle}>
          Todo lo que necesitas para planificar tu jubilación en España.
          Desde la pensión pública hasta la protección de tu familia.
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

      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="retirement-guide"
      />

      {/* Journey */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗺️</span>
          Tu camino hacia la jubilación
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

      {/* Caso de estudio */}
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

      {/* Herramientas */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🧰</span>
          Herramientas disponibles
        </h2>
        <p className={styles.toolsSubtitle}>
          Síguelas en orden o usa directamente la que necesites.
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

      {/* FAQ */}
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

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Listo para planificar tu jubilación?</h2>
        <p className={styles.ctaText}>
          Empieza simulando tu pensión pública. Es el primer paso para saber dónde estás.
        </p>
        <Link href="/simulador-jubilacion-publica/" className={styles.ctaButton}>
          Simular mi jubilación
        </Link>
      </section>

      {/* Otras guías */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/invertir/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>📈</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Invertir</h3>
              <p className={styles.otherGuideDescription}>Haz crecer tus ahorros</p>
            </div>
          </Link>
          <Link href="/guia/ahorrar-dinero/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>💰</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Ahorrar</h3>
              <p className={styles.otherGuideDescription}>Estrategias de ahorro</p>
            </div>
          </Link>
          <Link href="/guia/herencias/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>⚖️</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía de Herencias</h3>
              <p className={styles.otherGuideDescription}>Planifica la sucesión</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-jubilacion')} />
      <ShareCard appName="guia-jubilacion" />
      <Footer appName="guia-jubilacion" />
    </div>
  );
}
