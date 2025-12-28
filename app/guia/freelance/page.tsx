'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaFreelance.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas disponibles para freelances
const tools = [
  {
    id: 'cuota-autonomo',
    name: 'Calculadora Cuota Autónomo',
    icon: '💶',
    url: '/calculadora-cuota-autonomo/',
    question: '¿Cuánto pagaré de cuota a la Seguridad Social?',
    description: 'Sistema de tramos 2025. Calcula tu cuota según ingresos reales y aprovecha la tarifa plana si eres nuevo.',
    step: 1,
  },
  {
    id: 'simulador-irpf',
    name: 'Simulador IRPF',
    icon: '📊',
    url: '/simulador-irpf/',
    question: '¿Cuánto pagaré de IRPF este año?',
    description: 'Simula tu declaración de la renta. Deducciones, tipos marginales y resultado estimado.',
    step: 2,
  },
  {
    id: 'calculadora-iva',
    name: 'Calculadora IVA',
    icon: '🧾',
    url: '/calculadora-iva/',
    question: '¿Cuánto IVA debo cobrar y declarar?',
    description: 'Calcula IVA al 21%, 10% o 4%. Separa base imponible de impuesto para tus facturas.',
    step: 3,
  },
  {
    id: 'tarifa-freelance',
    name: 'Calculadora Tarifa Freelance',
    icon: '💰',
    url: '/calculadora-tarifa-freelance/',
    question: '¿Cuánto debería cobrar por hora/proyecto?',
    description: 'Calcula tu tarifa considerando gastos, impuestos, vacaciones y horas reales de trabajo.',
    step: 4,
  },
  {
    id: 'generador-facturas',
    name: 'Generador de Facturas',
    icon: '📄',
    url: '/generador-facturas/',
    question: '¿Cómo hago una factura correcta?',
    description: 'Genera facturas profesionales con IVA e IRPF. Descarga en PDF listas para enviar.',
    step: 5,
  },
  {
    id: 'autonomo-vs-sl',
    name: 'Autónomo vs SL',
    icon: '⚖️',
    url: '/simulador-autonomo-vs-sl/',
    question: '¿Me conviene más ser autónomo o montar una SL?',
    description: 'Comparativa fiscal completa. Descubre a partir de qué ingresos compensa constituir sociedad.',
    step: 6,
  },
];

// Pasos del journey freelance
const journeySteps = [
  {
    number: 1,
    title: 'Calcula tus costes fijos',
    description: 'Antes de fijar precios, conoce cuánto pagarás obligatoriamente cada mes.',
    tip: 'La cuota de autónomo es tu coste fijo principal. En 2025 va por tramos según ingresos.',
  },
  {
    number: 2,
    title: 'Entiende tus impuestos',
    description: 'IRPF trimestral (modelo 130) e IVA trimestral (modelo 303). Más la renta anual.',
    tip: 'Retén un 30-35% de tus ingresos para impuestos. Mejor que te sobre que quedarte corto.',
  },
  {
    number: 3,
    title: 'Fija tu tarifa correctamente',
    description: 'Tu tarifa debe cubrir costes + impuestos + vacaciones + beneficio razonable.',
    tip: 'Error común: dividir el sueldo deseado entre horas. Olvidan impuestos, vacaciones y horas no facturables.',
  },
  {
    number: 4,
    title: 'Factura correctamente',
    description: 'Cada factura debe tener IVA (21% normalmente) y retención IRPF (15% o 7% si eres nuevo).',
    tip: 'Si facturas a empresas, ellos te retienen IRPF. Si facturas a particulares, no hay retención.',
  },
];

// FAQs comunes
const faqData = [
  {
    question: '¿Cuánto es la cuota de autónomo en 2025?',
    answer: 'En 2025 la cuota va por tramos según rendimientos netos: desde 200€/mes (ingresos bajos) hasta 590€/mes (ingresos altos). Si te das de alta por primera vez, puedes acogerte a la tarifa plana de 80€/mes durante el primer año.',
  },
  {
    question: '¿Qué es la tarifa plana de autónomos?',
    answer: 'Es una cuota reducida de 80€/mes para nuevos autónomos durante los primeros 12 meses. Se puede extender 12 meses más si tus rendimientos están por debajo del SMI. Requisito: no haber sido autónomo en los últimos 2 años.',
  },
  {
    question: '¿Cuánto IRPF tengo que retener en mis facturas?',
    answer: 'Si facturas a empresas o profesionales: 15% de retención (o 7% si eres nuevo autónomo en tus primeros 3 años). Si facturas a particulares: no hay retención, pero debes hacer pagos fraccionados trimestrales (modelo 130).',
  },
  {
    question: '¿Cuándo me conviene pasar de autónomo a SL?',
    answer: 'Como regla general, a partir de 40.000-50.000€ de beneficio anual puede empezar a compensar una SL. Pero depende de muchos factores: si reinviertes beneficios, si quieres protección patrimonial, si tienes empleados, etc.',
  },
  {
    question: '¿Cuánto debería cobrar por hora como freelance?',
    answer: 'Depende de tu sector, experiencia y costes. Una fórmula básica: (Sueldo deseado + Impuestos + Cuota + Gastos) / Horas facturables reales. Recuerda que no facturas 8h/día: hay reuniones, admin, formación, vacaciones...',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Laura quiere hacerse freelance como diseñadora',
  situation: 'Diseñadora gráfica, 28 años, actualmente empleada con sueldo bruto de 28.000€/año. Quiere independizarse y trabajar por su cuenta.',
  steps: [
    { tool: 'Cuota Autónomo', result: 'Con tarifa plana: 80€/mes el primer año. Después, según ingresos estimados de 2.500€/mes netos: unos 294€/mes.' },
    { tool: 'Simulador IRPF', result: 'Con 30.000€ de ingresos y gastos deducibles, IRPF estimado: ~4.200€/año (14%).' },
    { tool: 'Tarifa Freelance', result: 'Para igualar su sueldo anterior + cubrir costes: necesita facturar ~45€/hora o ~2.800€/mes.' },
  ],
  conclusion: 'Laura necesita 3-4 clientes estables para arrancar. Decide empezar con algunos proyectos mientras mantiene su empleo, y dar el salto cuando tenga cartera.',
};

export default function GuiaFreelancePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>💼</span>
        <h1 className={styles.title}>Guía Freelance</h1>
        <p className={styles.subtitle}>
          Todo lo que necesitas saber para trabajar por tu cuenta en España.
          Cuotas, impuestos, facturación y tarifas.
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

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗺️</span>
          Tu camino como freelance
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
          Usa las que necesites según tu situación. No es un proceso lineal.
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
        <h2 className={styles.ctaTitle}>¿Listo para dar el salto?</h2>
        <p className={styles.ctaText}>
          Empieza calculando cuánto pagarás de cuota de autónomo.
          Es el primer coste fijo que debes conocer.
        </p>
        <Link href="/calculadora-cuota-autonomo/" className={styles.ctaButton}>
          Calcular mi cuota de autónomo
        </Link>
      </section>

      {/* Cross-linking */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/emprendedor/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🚀</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Emprender</h3>
              <p className={styles.otherGuideDescription}>Si quieres montar un negocio</p>
            </div>
          </Link>
          <Link href="/guia/comprar-casa/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🏠</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Comprar Casa</h3>
              <p className={styles.otherGuideDescription}>Hipoteca siendo autónomo</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-freelance')} />
      <Footer appName="guia-freelance" />
    </div>
  );
}
