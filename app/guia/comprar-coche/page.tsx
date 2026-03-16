'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaComprarCoche.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas disponibles para comprar un coche
const tools = [
  {
    id: 'comparador-vehiculos',
    name: 'Comparador de Vehículos',
    icon: '🚗',
    url: '/comparador-vehiculos/',
    question: '¿Me conviene más comprarlo, financiarlo, hacer renting o leasing?',
    description: 'Compara el coste total real de cada forma de adquisición: contado, financiación, renting y leasing. Incluye todos los gastos ocultos.',
    step: 1,
  },
  {
    id: 'simulador-prestamos',
    name: 'Estimador de Préstamos',
    icon: '🏦',
    url: '/estimador-prestamos/',
    question: '¿Cuánto pagaré de cuota mensual si lo financio?',
    description: 'Simula el préstamo del coche: cuota mensual, intereses totales, TAE real y coste final. Compara distintos plazos y tipos de interés.',
    step: 2,
  },
  {
    id: 'combustible',
    name: 'Calculadora de Combustible',
    icon: '⛽',
    url: '/calculadora-combustible/',
    question: '¿Cuánto me costará el combustible al año?',
    description: 'Calcula el consumo real en L/100km y el coste anual según tus kilómetros habituales. Compara gasolina, diésel e híbrido.',
    step: 3,
  },
  {
    id: 'seguro-vida',
    name: 'Calculadora de Seguro de Vida',
    icon: '🛡️',
    url: '/orientador-seguro-vida/',
    question: '¿Necesito seguro de vida si financio el coche?',
    description: 'Si financias el vehículo con un préstamo, valora si necesitas un seguro de vida vinculado. Calcula la cobertura mínima recomendada.',
    step: 4,
  },
];

// Pasos del journey de compra de coche
const journeySteps = [
  {
    number: 1,
    title: 'Define tu presupuesto real',
    description: 'El precio del coche no es el único gasto. Suma seguro, combustible, mantenimiento, ITV, aparcamiento y financiación.',
    tip: 'La regla general: el coste total mensual del coche no debería superar el 15% de tus ingresos netos.',
  },
  {
    number: 2,
    title: 'Elige la forma de adquisición',
    description: 'Contado, financiación, renting y leasing tienen perfiles de coste muy diferentes. La elección correcta depende de tu situación.',
    tip: 'Si pagas el coche en 5+ años de financiación, el renting puede ser más barato y sin sorpresas de mantenimiento.',
  },
  {
    number: 3,
    title: 'Calcula el coste real de uso',
    description: 'Un coche con precio bajo pero alto consumo puede costar más que uno más caro con menos consumo. Los números no mienten.',
    tip: 'Con 15.000 km/año, 1 L/100km de diferencia en consumo equivale a 200-250€ más al año en gasolina.',
  },
  {
    number: 4,
    title: 'Protege tu inversión',
    description: 'Un accidente o una enfermedad puede dejarte sin poder pagar la financiación. Valora los seguros necesarios.',
    tip: 'Si financias el coche, el banco puede requerirte un seguro de vida. Contrata uno propio en lugar del del banco: suele ser más barato.',
  },
];

// FAQs comunes
const faqData = [
  {
    question: '¿Qué es mejor, comprar al contado o financiar el coche?',
    answer: 'Financiar solo tiene sentido si el tipo de interés del préstamo es bajo (por debajo del 5% TAE) y puedes invertir el capital disponible a mayor rentabilidad. Si el tipo es alto (muchos concesionarios ofrecen 7-12% TAE disfrazados de "0% TIN"), el contado es casi siempre mejor. Usa el comparador para ver el coste total real en cada caso.',
  },
  {
    question: '¿Qué diferencia hay entre renting y leasing?',
    answer: 'El renting es un alquiler a largo plazo (3-5 años) que incluye mantenimiento, seguro e ITV. Ideal para autónomos o empresas que quieren cuota fija sin sorpresas. El leasing es una financiación con opción de compra al final; puedes quedártelo por el valor residual o devolverte. En el leasing el mantenimiento no está incluido. Ninguno implica ser propietario durante el contrato.',
  },
  {
    question: '¿Gasolina, diésel o híbrido? ¿Qué me compensa?',
    answer: 'Depende de tus kilómetros anuales. El diésel compensa si haces más de 15.000-20.000 km/año por carretera. Si haces pocos km o mucho ciudad, el gasolina o híbrido son mejores. Los eléctricos son los más baratos en coste por km (3-5 cts/km vs 8-12 cts del gasolina) pero tienen un precio de compra más alto. La calculadora de combustible te ayuda a comparar.',
  },
  {
    question: '¿Cuánto gasta realmente un coche al año (más allá del combustible)?',
    answer: 'Un coche medio en España cuesta entre 4.000 y 7.000€ al año en total: seguro (600-1.200€), combustible (1.000-2.000€), mantenimiento (500-800€), ITV (50-80€), aparcamiento (0-2.400€), impuesto de circulación (50-300€) y amortización o cuota de financiación. Muchas personas subestiman este coste en un 40-50%.',
  },
  {
    question: '¿Compro nuevo o de segunda mano?',
    answer: 'Un coche de segunda mano de 2-4 años suele ser la opción con mejor relación coste-valor. Pierde el 30-40% de valor en los primeros 3 años, pero ya está "rodado" y tiene garantía del concesionario si se compra allí. Nuevo tiene garantía del fabricante (2-7 años) y cero km, pero el mayor coste de depreciación lo pagas tú en los primeros años.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Javier quiere cambiar su coche y no sabe si financiar o hacer renting',
  situation: 'Administrativo de 41 años, hace 12.000 km/año. Tiene ahorrados 8.000€ y quiere un coche de gama media sobre 22.000€. Trabaja por cuenta ajena.',
  steps: [
    { tool: 'Comparador de Vehículos', result: 'Financiación al 7% TAE en 5 años: coste total 26.800€. Renting 3 años todo incluido: 450€/mes = 16.200€ sin ser propietario. Contado: 22.000€ + gastos. El renting sale caro a largo plazo, pero sin sorpresas.' },
    { tool: 'Estimador de Préstamos', result: 'Con 8.000€ de entrada y 14.000€ financiados al 5,9% a 4 años: cuota de 328€/mes. Coste total real: 23.750€. Viable sin que ahogue la economía mensual.' },
    { tool: 'Calculadora de Combustible', result: 'Gasolina: 1.320€/año con 12.000km. El híbrido que le gusta consume un 35% menos: 858€/año. Ahorro: 462€/año. En 5 años recupera la diferencia de precio.' },
  ],
  conclusion: 'Decisión: híbrido con 8.000€ de entrada + financiación 4 años. Coste mensual: 328€ cuota + seguro + combustible = 530€/mes. Dentro del presupuesto.',
};

export default function GuiaComprarCochePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🚗</span>
        <h1 className={styles.title}>Guía para Comprar un Coche</h1>
        <p className={styles.subtitle}>
          Compara formas de adquisición, calcula el coste real de uso
          y toma la mejor decisión financiera para tu situación.
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
          Tu camino hacia el coche adecuado
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
        <h2 className={styles.ctaTitle}>¿Listo para comparar opciones?</h2>
        <p className={styles.ctaText}>
          Empieza comparando el coste total de comprar, financiar y hacer renting.
          Los números te sorprenderán.
        </p>
        <Link href="/comparador-vehiculos/" className={styles.ctaButton}>
          Comparar formas de compra
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
              <p className={styles.otherGuideDescription}>Ordena tus finanzas antes de comprar</p>
            </div>
          </Link>
          <Link href="/guia/comprar-casa/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🏠</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Comprar Casa</h3>
              <p className={styles.otherGuideDescription}>La otra gran decisión financiera</p>
            </div>
          </Link>
          <Link href="/guia/invertir/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>📈</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Invertir</h3>
              <p className={styles.otherGuideDescription}>Haz crecer tus ahorros</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-comprar-coche')} />
      <Footer appName="guia-comprar-coche" />
    </div>
  );
}
