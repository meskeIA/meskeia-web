'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaMontarNegocio.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Herramientas disponibles para montar un negocio
const tools = [
  {
    id: 'generador-nombres',
    name: 'Generador de Nombres de Empresa',
    icon: '✨',
    url: '/generador-nombres-empresa/',
    question: '¿Cómo se va a llamar mi negocio?',
    description: 'Genera nombres únicos y memorables para tu empresa o marca. Comprueba disponibilidad y encuentra el nombre perfecto.',
    step: 1,
  },
  {
    id: 'break-even',
    name: 'Estimador Break-Even',
    icon: '⚖️',
    url: '/estimador-break-even/',
    question: '¿Cuánto tengo que vender para cubrir gastos?',
    description: 'Calcula el punto de equilibrio de tu negocio: unidades vendidas o ingresos mínimos para no perder dinero. Fundamental antes de lanzar.',
    step: 2,
  },
  {
    id: 'cashflow',
    name: 'Planificador de Cashflow',
    icon: '💸',
    url: '/planificador-cashflow/',
    question: '¿Tendré dinero en caja el próximo mes?',
    description: 'Planifica los cobros y pagos de tu negocio mes a mes. Detecta problemas de liquidez antes de que sean una crisis.',
    step: 3,
  },
  {
    id: 'tarifa-freelance',
    name: 'Calculadora de Tarifa Freelance',
    icon: '💰',
    url: '/orientador-tarifa-freelance/',
    question: '¿Cuánto tengo que cobrar por hora para vivir bien?',
    description: 'Calcula tu tarifa mínima viable teniendo en cuenta cuota de autónomos, IRPF, vacaciones y gastos. Sin subestimarte.',
    step: 4,
  },
  {
    id: 'roi-marketing',
    name: 'ROI de Marketing',
    icon: '📢',
    url: '/estimador-roi-marketing/',
    question: '¿Cuánto me está rentando la publicidad?',
    description: 'Mide el retorno de tus inversiones en marketing. Descubre qué canales funcionan y cuáles estás desperdiciando.',
    step: 5,
  },
  {
    id: 'facturas',
    name: 'Generador de Facturas',
    icon: '🧾',
    url: '/generador-facturas/',
    question: '¿Cómo emito facturas correctas con IVA e IRPF?',
    description: 'Genera facturas profesionales para autónomos con IVA e IRPF calculados. Descárgalas en PDF listas para enviar.',
    step: 6,
  },
  {
    id: 'presupuestos',
    name: 'Generador de Presupuestos',
    icon: '📋',
    url: '/calculadora-presupuestos/',
    question: '¿Cómo presupuesto un proyecto de forma profesional?',
    description: 'Crea presupuestos detallados para tus clientes. Incluye partidas, IVA, condiciones y descuentos de forma profesional.',
    step: 7,
  },
];

// Pasos del journey de emprendimiento
const journeySteps = [
  {
    number: 1,
    title: 'Valida la idea antes de invertir',
    description: 'Antes de gastar dinero en web, logo o local, calcula si el negocio es viable financieramente. Muchos fracasos se evitan con números.',
    tip: 'Si el break-even requiere vender más de lo que el mercado puede absorber, la idea necesita ajustes antes de lanzar.',
  },
  {
    number: 2,
    title: 'Planifica las finanzas del negocio',
    description: 'Un negocio puede ser rentable y quedarse sin dinero en caja. El cashflow mensual es más crítico que el beneficio en papel.',
    tip: 'El 82% de las pymes que cierran lo hacen por problemas de liquidez, no de rentabilidad. Planifica el cashflow desde el día 1.',
  },
  {
    number: 3,
    title: 'Fija precios y tarifas correctas',
    description: 'El error más común de los emprendedores: cobrar menos de lo necesario por miedo a perder clientes. Los números deben mandar.',
    tip: 'Tu tarifa debe cubrir: gastos fijos, cuota de autónomos, IRPF, vacaciones y días sin facturar. Úsala como mínimo, no como objetivo.',
  },
  {
    number: 4,
    title: 'Gestiona el día a día con rigor',
    description: 'Una vez lanzado, la gestión financiera es continua: facturas a tiempo, control de gastos y análisis del retorno de cada inversión.',
    tip: 'Separa desde el primer día cuenta personal y cuenta del negocio. Mezclarlas es la receta para perder el control financiero.',
  },
];

// FAQs comunes
const faqData = [
  {
    question: '¿Cuándo conviene darse de alta como autónomo?',
    answer: 'En España, es obligatorio darse de alta de autónomo cuando se realiza actividad económica de forma habitual, aunque no hay una cifra oficial de ingresos mínimos. La Seguridad Social puede reclamar el alta si facturas de forma recurrente, aunque sea poco. Dicho esto, si estás en fase de validación y facturas puntualmente, existen fórmulas como facturar a través de cooperativas de trabajo asociado o plataformas de facturación. Consulta con un asesor para tu caso.',
  },
  {
    question: '¿Qué es el break-even y por qué es tan importante?',
    answer: 'El break-even o punto de equilibrio es el nivel de ventas en el que ingresos = gastos (beneficio cero). Por encima, ganas dinero; por debajo, pierdes. Calcularlo antes de lanzar te dice si el negocio es viable: si necesitas vender 500 unidades al mes para no perder dinero pero el mercado solo absorbe 100, hay un problema estructural que hay que resolver antes de invertir más.',
  },
  {
    question: '¿Cómo fijo el precio de mi producto o servicio?',
    answer: 'Hay tres enfoques: 1) Coste + margen (calculas tus costes y añades un margen), 2) Valor percibido (cobras lo que el cliente percibe que vale), 3) Precios de mercado (te alineas con la competencia). Para servicios, el método de tarifa por hora asegura que cubres todos tus costes reales. La calculadora de tarifa freelance te ayuda con el punto de partida mínimo.',
  },
  {
    question: '¿Qué diferencia hay entre facturación y beneficio?',
    answer: 'La facturación (o ventas) es el total de lo que cobras a los clientes. El beneficio es lo que queda después de restar TODOS los gastos: materiales, sueldos, alquiler, marketing, cuota de autónomos, impuestos, etc. Es habitual ver negocios que facturan mucho pero ganan poco porque sus costes son altos. Controlar el margen (beneficio / facturación) es clave para la sostenibilidad.',
  },
  {
    question: '¿Cuánto dinero necesito para empezar un negocio?',
    answer: 'Depende enormemente del tipo de negocio. Un servicio profesional (consultoría, diseño, programación) puede empezar con menos de 1.000€. Una tienda física necesita mínimo 15.000-30.000€. En general, planifica tener capital suficiente para cubrir al menos 6 meses de gastos fijos sin ingresos, más la inversión inicial. La calculadora de cashflow te ayuda a ver cuánto necesitas en caja mes a mes.',
  },
];

// Caso de estudio
const caseStudy = {
  title: 'Elena quiere montar su consultoría de comunicación tras 10 años en empresa',
  situation: 'Comunicadora de 35 años, sueldo neto actual 2.200€/mes. Quiere montar su propia consultoría pero no sabe si es viable ni cuánto cobrar.',
  steps: [
    { tool: 'Estimador Break-Even', result: 'Con gastos fijos de 800€/mes (cuota autónomos + herramientas) y tarifa de 60€/h, necesita facturar 13,3 horas al mes solo para no perder. Viable.' },
    { tool: 'Calculadora de Tarifa Freelance', result: 'Tarifa mínima para mantener el mismo nivel de vida: 52€/h. Con 100 horas facturables al mes (realista con 2-3 clientes): 5.200€ brutos = 2.800€ netos. Mejor que en empresa.' },
    { tool: 'Planificador de Cashflow', result: 'Los 3 primeros meses los clientes pagan a 30-60 días. Necesita colchón de 3.000€ para cubrir esos desfases iniciales sin agobios.' },
  ],
  conclusion: 'Con 3.000€ de colchón y 2 clientes iniciales, el modelo es viable desde el mes 4. Decide lanzarse con contratos de 3 meses mínimo para asegurar predictibilidad.',
};

export default function GuiaMontarNegocioPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🚀</span>
        <h1 className={styles.title}>Guía para Montar un Negocio</h1>
        <p className={styles.subtitle}>
          Valida tu idea con números reales, fija precios correctos
          y gestiona el día a día de tu negocio desde el primer día.
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
          Tu camino para lanzar el negocio
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
          Úsalas según la etapa en la que estés. No necesitas todas a la vez.
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
        <h2 className={styles.ctaTitle}>¿Listo para validar tu idea?</h2>
        <p className={styles.ctaText}>
          Empieza calculando el break-even de tu negocio.
          Si los números salen, tienes una idea viable. Si no, es mejor saberlo ahora.
        </p>
        <Link href="/estimador-break-even/" className={styles.ctaButton}>
          Calcular mi punto de equilibrio
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
              <p className={styles.otherGuideDescription}>Empieza a trabajar por tu cuenta</p>
            </div>
          </Link>
          <Link href="/guia/ahorrar-dinero/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>💰</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía Ahorrar Dinero</h3>
              <p className={styles.otherGuideDescription}>Gestiona tus finanzas personales</p>
            </div>
          </Link>
          <Link href="/guia/invertir/" className={styles.otherGuideCard}>
            <span className={styles.otherGuideIcon}>📈</span>
            <div>
              <h3 className={styles.otherGuideTitle}>Guía para Invertir</h3>
              <p className={styles.otherGuideDescription}>Reinvierte los beneficios del negocio</p>
            </div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-montar-negocio')} />
      <Footer appName="guia-montar-negocio" />
    </div>
  );
}
