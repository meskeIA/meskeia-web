'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaHerencias.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, DisclaimerCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas del journey
const tools = [
  {
    id: 'orientacion-tramitacion-herencias',
    name: 'Orientación para Tramitar la Herencia',
    icon: '📋',
    url: '/orientacion-tramitacion-herencias/',
    question: '¿Qué documentos necesito y en qué orden actúo?',
    description: 'Checklist interactivo personalizado según tu situación, timeline de 9 pasos, plazos críticos y costes orientativos de notaría y registro.',
    step: 1,
  },
  {
    id: 'estimador-impuesto-sucesiones',
    name: 'Estimador Impuesto de Sucesiones',
    icon: '💸',
    url: '/estimador-impuesto-sucesiones/',
    question: '¿Cuánto pagaré de Impuesto de Sucesiones?',
    description: 'Cálculo orientativo del Impuesto de Sucesiones para las 17 comunidades autónomas. Incluye reducciones, coeficiente multiplicador y bonificaciones autonómicas.',
    step: 2,
  },
  {
    id: 'estimador-impuesto-donaciones',
    name: 'Estimador Impuesto de Donaciones',
    icon: '🎁',
    url: '/estimador-impuesto-donaciones/',
    question: '¿Y si recibo una donación en vida?',
    description: 'Calcula el Impuesto sobre Donaciones en las 17 CCAA. Útil si los herederos reciben bienes antes del fallecimiento para anticipar la carga fiscal.',
    step: 3,
  },
  {
    id: 'simulador-compraventa-inmueble',
    name: 'Estimador de Gastos de Compraventa',
    icon: '🏠',
    url: '/simulador-compraventa-inmueble/',
    question: '¿Cuánto cuesta vender o comprar un inmueble heredado?',
    description: 'Calcula todos los gastos al vender o comprar un inmueble: ITP/IVA, AJD, notaría, registro, gestoría e inmobiliaria.',
    step: 4,
  },
];

// Etapas del journey hereditario
const journeySteps = [
  {
    number: 1,
    title: 'Primeras gestiones (semana 1)',
    description: 'Obtener el certificado de defunción es el primer paso. Sin él no puedes iniciar nada. Se obtiene en el Registro Civil o por sede electrónica en minutos.',
    tip: 'El certificado de defunción es gratuito si se solicita telemáticamente en el Registro Civil.',
  },
  {
    number: 2,
    title: 'Conocer si hay testamento (días 15+)',
    description: 'A partir del día 15 hábil desde el fallecimiento puedes solicitar el certificado de últimas voluntades en el Ministerio de Justicia. Te dirá si existe testamento y en qué notaría.',
    tip: 'El mismo trámite incluye el certificado de seguros de vida. Solo cuesta ~4 € cada uno.',
  },
  {
    number: 3,
    title: 'Inventario y valoración de bienes',
    description: 'Recopilar escrituras de inmuebles, extractos bancarios, permisos de circulación de vehículos y cualquier otro activo. También deudas: hipotecas, préstamos, facturas pendientes.',
    tip: 'El Registro de la Propiedad permite consultar online los inmuebles a nombre del fallecido mediante nota simple (~10 €).',
  },
  {
    number: 4,
    title: 'Impuesto de Sucesiones — antes de 6 meses',
    description: 'Es el plazo más crítico. Se paga en la comunidad autónoma donde residía el fallecido. Prorrogable 6 meses más si se solicita antes del 5.º mes.',
    tip: 'En Madrid, Canarias y Aragón la bonificación es del 99-100% para hijos y cónyuge. En Cataluña aplica tarifa propia. Calcula antes con el estimador.',
  },
  {
    number: 5,
    title: 'Escritura de aceptación y adjudicación',
    description: 'Tras pagar los impuestos, el notario formaliza la escritura donde los herederos aceptan la herencia y se distribuyen los bienes. Necesaria para inscribir inmuebles y cambiar titularidades.',
    tip: 'Si hay un solo heredero y los bienes son solo bancarios, muchos bancos aceptan la herencia sin escritura notarial.',
  },
  {
    number: 6,
    title: 'Inscripciones y cambios de titularidad',
    description: 'Registro de la Propiedad para inmuebles, DGT para vehículos, entidades bancarias para cuentas e inversiones. Sin plazo fijo, pero necesario para poder vender o hipotecar.',
    tip: 'Inscribe los inmuebles cuanto antes: si luego quieres vender, el comprador exigirá que estén a tu nombre.',
  },
];

// FAQs
const faqData = [
  {
    question: '¿Cuánto tiempo tengo para aceptar o renunciar a una herencia?',
    answer: 'No hay plazo legal para aceptar o renunciar, pero sí para pagar el Impuesto de Sucesiones (6 meses prorrogables). Sin embargo, cualquier acreedor del fallecido puede interpelarte judicialmente para que te pronuncies en un plazo de 30 días.',
  },
  {
    question: '¿Qué pasa si la herencia tiene más deudas que bienes?',
    answer: 'Tienes dos opciones: renunciar a la herencia (irrevocable, ante notario) o aceptarla "a beneficio de inventario", que limita tu responsabilidad a los bienes recibidos. La aceptación pura y simple hace que respondas con tu propio patrimonio.',
  },
  {
    question: '¿El Impuesto de Sucesiones es igual en todas las comunidades autónomas?',
    answer: 'No. Varía enormemente. Madrid y Canarias tienen bonificaciones del 99% para descendientes y cónyuge (prácticamente cero). Cataluña aplica tarifas propias con reducciones moderadas. Asturias o Comunidad Valenciana pueden suponer cuotas significativas. Usa el estimador para tu CCAA concreta.',
  },
  {
    question: '¿Se puede vender un piso heredado antes de pagar el Impuesto de Sucesiones?',
    answer: 'Legalmente puedes venderlo, pero el Registro de la Propiedad no inscribirá el cambio de titularidad al comprador hasta que el inmueble esté a tu nombre y el impuesto esté pagado. En la práctica, los compradores exigen todo en regla antes de firmar.',
  },
  {
    question: '¿Qué diferencia hay entre herencia y donación en vida?',
    answer: 'La herencia tributa por el Impuesto de Sucesiones y Donaciones (rama sucesiones) y se produce por fallecimiento. La donación en vida tributa por la misma ley pero rama donaciones, con tarifas distintas (hasta 34% estatal vs 25,5% en sucesiones). Algunas CCAA bonifican mucho las donaciones; otras no.',
  },
  {
    question: '¿Hay que declarar la herencia en el IRPF?',
    answer: 'La herencia en sí no tributa en IRPF, solo en el Impuesto de Sucesiones. Pero si vendes bienes heredados con posterioridad, la ganancia patrimonial sí tributa en IRPF. El precio de adquisición para calcular la ganancia es el valor declarado en sucesiones.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Ana gestiona la herencia de su madre',
  situation: 'Madre fallece en Madrid dejando un piso (180.000 €), cuenta bancaria (25.000 €) y un coche (8.000 €). Sin deudas. Ana, hija única de 45 años, tiene un patrimonio previo de 50.000 €.',
  steps: [
    { tool: 'Orientación Tramitación', result: 'Checklist personalizado: 12 documentos necesarios (incluyendo nota simple del piso). Timeline: 9 pasos con plazos críticos marcados en rojo (6 meses IS y Plusvalía).' },
    { tool: 'Estimador Sucesiones (Madrid)', result: 'Base imponible: ~213.000 €. Después de reducción Gr. II (15.956 €) y bonificación Madrid 99%: cuota final aproximada de ~150 €. Madrid es muy favorable para descendientes directos.' },
    { tool: 'Estimador Gastos Compraventa', result: 'Si Ana vende el piso heredado (180.000 €): gastos vendedor ~3.600 € (gestoría, notaría, registro). Plusvalía municipal según valor catastral y años de tenencia del fallecido.' },
  ],
  conclusion: 'Ana obtiene una herencia neta de ~213.000 € con un coste fiscal mínimo en Madrid. Clave: actúa antes de los 6 meses para el Impuesto de Sucesiones y la Plusvalía Municipal.',
};

export default function GuiaHerenciasPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📜</span>
        <h1 className={styles.title}>Guía para Gestionar una Herencia</h1>
        <p className={styles.subtitle}>
          Qué documentos necesitas, qué impuestos pagar, en qué orden actuar
          y cuánto cuesta tramitar una herencia en España.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{tools.length}</span>
            <span className={styles.heroStatLabel}>Herramientas</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{journeySteps.length}</span>
            <span className={styles.heroStatLabel}>Etapas clave</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>17</span>
            <span className={styles.heroStatLabel}>CCAA cubiertas</span>
          </div>
        </div>
      </header>

      <LegalNotice />
      <DisclaimerCard variant="general" severity="high" />

      {/* Journey */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🗺️</span>
          El proceso paso a paso
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
          Empieza por el checklist de documentos. Después calcula los impuestos según tu comunidad autónoma.
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
                type="button"
                className={`${styles.faqQuestion} ${openFaq === index ? styles.faqQuestionOpen : ''}`}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                aria-expanded={openFaq === index ? 'true' : 'false'}
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
        <h2 className={styles.ctaTitle}>¿Por dónde empezar?</h2>
        <p className={styles.ctaText}>
          El primer paso es saber qué documentos necesitas según tu situación.
          El checklist te guía en menos de 2 minutos.
        </p>
        <Link href="/orientacion-tramitacion-herencias/" className={styles.ctaButton}>
          Generar mi checklist personalizado
        </Link>
      </section>

      {/* Otras guías */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías relacionadas
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/invertir/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>📈</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Invertir</h3>
              <p className={styles.otherGuideDescription}>Qué hacer con el dinero heredado</p>
            </div>
          </Link>
          <Link href="/guia/comprar-casa/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>🏠</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Comprar Casa</h3>
              <p className={styles.otherGuideDescription}>Si vendes un inmueble heredado para comprar otro</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-herencias')} />
      <Footer appName="guia-herencias" />
    </div>
  );
}
