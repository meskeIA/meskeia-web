'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaJubilacion.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas del journey de jubilaci\u00f3n
const tools = [
  {
    id: 'simulador-jubilacion-publica',
    name: 'Simulador de Jubilaci\u00f3n P\u00fablica',
    icon: '\ud83c\udfe4',
    url: '/simulador-jubilacion-publica/',
    question: '\u00bfCu\u00e1ndo me jubilo y cu\u00e1nto cobrar\u00e9?',
    description: 'Edad de jubilaci\u00f3n seg\u00fan a\u00f1o de nacimiento, pensi\u00f3n estimada con sistema dual 2026, jubilaci\u00f3n anticipada y parcial. Todo en un solo simulador.',
    step: 1,
  },
  {
    id: 'planificador-ahorro-jubilacion',
    name: 'Planificador de Ahorro',
    icon: '\ud83d\udcb9',
    url: '/planificador-ahorro-jubilacion/',
    question: '\u00bfMe llega la pensi\u00f3n? \u00bfCu\u00e1nto necesito ahorrar?',
    description: 'Calcula la brecha entre tu sueldo y tu pensi\u00f3n, cu\u00e1nto ahorrar mensualmente, la ventaja fiscal del plan de pensiones y la proyecci\u00f3n de capital.',
    step: 2,
  },
  {
    id: 'estimador-irpf-pensionista',
    name: 'IRPF Pensionista',
    icon: '\ud83d\udcca',
    url: '/estimador-irpf-pensionista/',
    question: '\u00bfCu\u00e1nto pagar\u00e9 de impuestos como jubilado?',
    description: 'Estima el IRPF sobre tu pensi\u00f3n: reducci\u00f3n por rendimientos del trabajo, m\u00ednimo personal por edad (65/75 a\u00f1os) y pensi\u00f3n neta real.',
    step: 3,
  },
  {
    id: 'optimizador-rentas-60',
    name: 'Optimizador de Rentas 60+',
    icon: '\ud83d\udcb0',
    url: '/optimizador-rentas-60/',
    question: '\u00bfC\u00f3mo optimizo mis ingresos como jubilado?',
    description: 'Estrategia fiscal para pensionistas con m\u00faltiples fuentes de renta: pensi\u00f3n, plan de pensiones, ahorro, alquiler. Minimiza el IRPF total.',
    step: 4,
  },
  {
    id: 'estimador-complemento-minimos',
    name: 'Complemento a M\u00ednimos',
    icon: '\ud83d\udee1\ufe0f',
    url: '/estimador-complemento-minimos/',
    question: '\u00bfTengo derecho a un complemento si mi pensi\u00f3n es baja?',
    description: 'Comprueba si tu pensi\u00f3n est\u00e1 por debajo del m\u00ednimo garantizado y cu\u00e1nto complemento te corresponde seg\u00fan tu situaci\u00f3n familiar.',
    step: 5,
  },
  {
    id: 'estimador-pension-viudedad',
    name: 'Pensi\u00f3n de Viudedad',
    icon: '\ud83d\udc8d',
    url: '/estimador-pension-viudedad/',
    question: '\u00bfQu\u00e9 cobrar\u00eda mi pareja si yo falto?',
    description: 'Calcula la pensi\u00f3n de viudedad estimada: porcentaje aplicable (52%, 60% o 70%), base reguladora y m\u00ednimo garantizado.',
    step: 6,
  },
];

// Pasos del journey
const journeySteps = [
  {
    number: 1,
    title: 'Conoce tu pensi\u00f3n',
    description: 'El primer paso es saber cu\u00e1ndo podr\u00e1s jubilarte y cu\u00e1nto cobrar\u00e1s de pensi\u00f3n p\u00fablica.',
    tip: 'Descarga tu vida laboral en importass.seg-social.es para tener datos reales de cotizaci\u00f3n.',
  },
  {
    number: 2,
    title: 'Calcula la brecha',
    description: 'Compara tu sueldo actual con la pensi\u00f3n estimada. La diferencia es lo que necesitas cubrir con ahorro privado.',
    tip: 'La tasa de sustituci\u00f3n media en Espa\u00f1a ronda el 70-80%, pero var\u00eda mucho seg\u00fan historial.',
  },
  {
    number: 3,
    title: 'Planifica el ahorro',
    description: 'Define cu\u00e1nto ahorrar mensualmente y qu\u00e9 instrumentos usar (plan de pensiones, fondos, PIAS...).',
    tip: 'Empezar 10 a\u00f1os antes puede duplicar el capital acumulado con la misma aportaci\u00f3n mensual.',
  },
  {
    number: 4,
    title: 'Anticipa los impuestos',
    description: 'Las pensiones tributan como rendimientos del trabajo. Conocer tu IRPF evita sorpresas en la declaraci\u00f3n.',
    tip: 'Planificar el rescate del plan de pensiones (renta vs capital) puede ahorrarte miles de euros.',
  },
  {
    number: 5,
    title: 'Protege a tu familia',
    description: 'Calcula qu\u00e9 cobrar\u00eda tu pareja en caso de viudedad y si tienes derecho a complementos a m\u00ednimos.',
    tip: 'La pensi\u00f3n de viudedad se calcula sobre tu pensi\u00f3n, incluidas las reducciones por anticipaci\u00f3n.',
  },
];

// FAQs
const faqData = [
  {
    question: '\u00bfA qu\u00e9 edad me puedo jubilar?',
    answer: 'En 2026, la edad ordinaria es 66 a\u00f1os y 10 meses (o 65 con 38 a\u00f1os y 3 meses cotizados). En 2027 se estabiliza en 67 a\u00f1os (o 65 con 38 a\u00f1os y 6 meses).',
  },
  {
    question: '\u00bfCu\u00e1ntos a\u00f1os necesito cotizar para cobrar pensi\u00f3n?',
    answer: 'Un m\u00ednimo de 15 a\u00f1os, de los cuales al menos 2 deben estar dentro de los \u00faltimos 15 a\u00f1os. Con 15 a\u00f1os cobras el 50% de tu base reguladora; el 100% se alcanza con ~37 a\u00f1os.',
  },
  {
    question: '\u00bfQu\u00e9 es el sistema dual de pensiones 2026?',
    answer: 'Desde enero de 2026, la Seguridad Social calcula tu pensi\u00f3n con dos f\u00f3rmulas (cl\u00e1sica y ampliada) y aplica autom\u00e1ticamente la m\u00e1s favorable. No necesitas hacer nada, es de oficio.',
  },
  {
    question: '\u00bfPuedo jubilarme antes de la edad legal?',
    answer: 'S\u00ed: jubilaci\u00f3n anticipada voluntaria (hasta 2 a\u00f1os antes, 35+ a\u00f1os cotizados) o involuntaria (hasta 4 a\u00f1os, 33+ cotizados). Ambas implican reducciones permanentes en la pensi\u00f3n.',
  },
  {
    question: '\u00bfCu\u00e1nto puedo aportar al plan de pensiones?',
    answer: 'El l\u00edmite individual deducible es 1.500 \u20ac/a\u00f1o. Si tu empresa contribuye, el l\u00edmite conjunto sube a 10.000 \u20ac/a\u00f1o. Las aportaciones reducen tu base imponible del IRPF.',
  },
  {
    question: '\u00bfLa pensi\u00f3n paga IRPF?',
    answer: 'S\u00ed, tributa como rendimiento del trabajo. Los jubilados tienen reducciones espec\u00edficas y m\u00ednimos personales por edad (65 y 75 a\u00f1os) que reducen la base imponible.',
  },
  {
    question: '\u00bfQu\u00e9 pasa si mi pensi\u00f3n es muy baja?',
    answer: 'Si tu pensi\u00f3n queda por debajo del m\u00ednimo garantizado (888,70 \u20ac/mes en 2026 sin c\u00f3nyuge), la Seguridad Social la complementa autom\u00e1ticamente hasta ese m\u00ednimo, si cumples los requisitos de ingresos.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Antonio, 52 a\u00f1os, quiere planificar su jubilaci\u00f3n',
  situation: 'Empleado con sueldo neto de 2.400 \u20ac/mes, 28 a\u00f1os cotizados, base media de cotizaci\u00f3n de 2.800 \u20ac/mes. Prev\u00e9 jubilarse a los 67.',
  steps: [
    { tool: 'Simulador Jubilaci\u00f3n P\u00fablica', result: 'Pensi\u00f3n estimada: 1.680 \u20ac/mes (sistema dual). Edad: 67 a\u00f1os. Con 43 a\u00f1os cotizados al jubilarse, alcanza el 100%.' },
    { tool: 'Planificador de Ahorro', result: 'Brecha: 720 \u20ac/mes. Capital necesario: 172.800 \u20ac (20 a\u00f1os). Ahorro necesario: 485 \u20ac/mes al 4% durante 15 a\u00f1os.' },
    { tool: 'IRPF Pensionista', result: 'Con 1.680 \u20ac/mes (23.520 \u20ac/a\u00f1o), retenci\u00f3n IRPF ~8%. Pensi\u00f3n neta: ~1.546 \u20ac/mes.' },
    { tool: 'Pensi\u00f3n de Viudedad', result: 'Su pareja cobrar\u00eda ~873 \u20ac/mes (52% de la pensi\u00f3n). Suficiente con la pensi\u00f3n propia de ella.' },
  ],
  conclusion: 'Antonio necesita ahorrar 485 \u20ac/mes durante 15 a\u00f1os. Con 125 \u20ac/mes en plan de pensiones (ahorro fiscal ~375 \u20ac/a\u00f1o) y 360 \u20ac/mes en fondos indexados, cubre la brecha con margen.',
};

export default function GuiaJubilacionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>\ud83c\udfe4</span>
        <h1 className={styles.title}>Gu\u00eda de Jubilaci\u00f3n</h1>
        <p className={styles.subtitle}>
          Todo lo que necesitas para planificar tu jubilaci\u00f3n en Espa\u00f1a.
          Desde la pensi\u00f3n p\u00fablica hasta la protecci\u00f3n de tu familia.
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
          <span className={styles.sectionIcon}>\ud83d\uddfa\ufe0f</span>
          Tu camino hacia la jubilaci\u00f3n
        </h2>
        <div className={styles.journeyGrid}>
          {journeySteps.map((step) => (
            <div key={step.number} className={styles.journeyCard}>
              <div className={styles.journeyNumber}>{step.number}</div>
              <h3 className={styles.journeyTitle}>{step.title}</h3>
              <p className={styles.journeyDescription}>{step.description}</p>
              <div className={styles.journeyTip}>
                <span className={styles.tipIcon}>\ud83d\udca1</span>
                <span>{step.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Caso de estudio */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>\ud83d\udcd6</span>
          Ejemplo real
        </h2>
        <div className={styles.caseStudyCard}>
          <h3 className={styles.caseStudyTitle}>{caseStudy.title}</h3>
          <p className={styles.caseStudySituation}>
            <strong>Situaci\u00f3n:</strong> {caseStudy.situation}
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
            <span className={styles.conclusionIcon}>\u2705</span>
            <span><strong>Conclusi\u00f3n:</strong> {caseStudy.conclusion}</span>
          </div>
        </div>
      </section>

      {/* Herramientas */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>\ud83e\uddf0</span>
          Herramientas disponibles
        </h2>
        <p className={styles.toolsSubtitle}>
          S\u00edguelas en orden o usa directamente la que necesites.
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
              <span className={styles.toolCta}>Usar herramienta \u2192</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>\u2753</span>
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
                <span className={styles.faqToggle}>{openFaq === index ? '\u2212' : '+'}</span>
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
        <h2 className={styles.ctaTitle}>\u00bfListo para planificar tu jubilaci\u00f3n?</h2>
        <p className={styles.ctaText}>
          Empieza simulando tu pensi\u00f3n p\u00fablica. Es el primer paso para saber d\u00f3nde est\u00e1s.
        </p>
        <Link href="/simulador-jubilacion-publica/" className={styles.ctaButton}>
          Simular mi jubilaci\u00f3n
        </Link>
      </section>

      {/* Otras gu\u00edas */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>\ud83d\udcda</span>
          Otras gu\u00edas que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          <Link href="/guia/invertir/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>\ud83d\udcc8</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Gu\u00eda para Invertir</h3>
              <p className={styles.otherGuideDescription}>Haz crecer tus ahorros</p>
            </div>
          </Link>
          <Link href="/guia/ahorrar-dinero/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>\ud83d\udcb0</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Gu\u00eda para Ahorrar</h3>
              <p className={styles.otherGuideDescription}>Estrategias de ahorro</p>
            </div>
          </Link>
          <Link href="/guia/herencias/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>\u2696\ufe0f</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Gu\u00eda de Herencias</h3>
              <p className={styles.otherGuideDescription}>Planifica la sucesi\u00f3n</p>
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
