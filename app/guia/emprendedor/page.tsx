'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaEmprendedor.module.css';
import { MeskeiaLogo, Footer } from '@/components';

// Datos de las herramientas del ecosistema emprendedor
const tools = [
  {
    id: 'comparador-formas-juridicas',
    name: 'Comparador de Formas Jurídicas',
    icon: '⚖️',
    url: '/comparador-formas-juridicas/',
    question: '¿Autónomo, SL, cooperativa o asociación? Compara las ventajas de cada opción según tu situación.',
  },
  {
    id: 'simulador-autonomo-vs-sl',
    name: 'Simulador Autónomo vs SL',
    icon: '📊',
    url: '/simulador-autonomo-vs-sl/',
    question: '¿Qué me conviene fiscalmente con mis ingresos? Simula con tus números reales.',
  },
  {
    id: 'asistente-alta-autonomo',
    name: 'Asistente Alta Autónomo',
    icon: '📝',
    url: '/asistente-alta-autonomo/',
    question: '¿Cómo me doy de alta como autónomo? Checklist completo paso a paso.',
  },
  {
    id: 'asistente-constitucion-sociedad',
    name: 'Asistente Constitución Sociedad',
    icon: '🏢',
    url: '/asistente-constitucion-sociedad/',
    question: '¿Cómo creo una SL paso a paso? Guía con costes y plazos.',
  },
  {
    id: 'asistente-constitucion-asociacion',
    name: 'Asistente Constitución Asociación',
    icon: '🤝',
    url: '/asistente-constitucion-asociacion/',
    question: '¿Cómo creo una asociación sin ánimo de lucro? Proceso y requisitos.',
  },
  {
    id: 'calculadora-cuota-autonomo',
    name: 'Calculadora Cuota Autónomo',
    icon: '💶',
    url: '/calculadora-cuota-autonomo/',
    question: '¿Cuánto pagaré de cuota mensual? Tramos actualizados 2025.',
  },
  {
    id: 'calendario-fiscal-emprendedor',
    name: 'Calendario Fiscal del Emprendedor',
    icon: '📅',
    url: '/calendario-fiscal-emprendedor/',
    question: '¿Cuándo tengo que presentar cada modelo tributario? Fechas clave.',
  },
];

// Datos del journey
const journeySteps = [
  {
    number: 1,
    title: 'Decide tu forma jurídica',
    description: '¿Autónomo, SL, cooperativa o asociación? Cada opción tiene ventajas según tu situación personal, el tipo de negocio y tu nivel de riesgo.',
    tools: [
      { name: 'Comparador Formas Jurídicas', url: '/comparador-formas-juridicas/', icon: '⚖️' },
    ],
  },
  {
    number: 2,
    title: 'Compara fiscalmente',
    description: 'Si dudas entre autónomo y SL, simula con tus números reales. Según tus ingresos previstos, una opción puede ahorrarte miles de euros al año.',
    tools: [
      { name: 'Simulador Autónomo vs SL', url: '/simulador-autonomo-vs-sl/', icon: '📊' },
    ],
  },
  {
    number: 3,
    title: 'Date de alta',
    description: 'Según tu elección, sigue el proceso paso a paso. Cada forma jurídica tiene sus trámites, plazos y costes específicos.',
    tools: [
      { name: 'Alta Autónomo', url: '/asistente-alta-autonomo/', icon: '📝' },
      { name: 'Constituir SL', url: '/asistente-constitucion-sociedad/', icon: '🏢' },
      { name: 'Crear Asociación', url: '/asistente-constitucion-asociacion/', icon: '🤝' },
    ],
  },
  {
    number: 4,
    title: 'Conoce tu calendario fiscal',
    description: 'No te pillen las fechas. Sabe exactamente cuándo presentar cada modelo tributario para evitar sanciones y recargos.',
    tools: [
      { name: 'Calendario Fiscal', url: '/calendario-fiscal-emprendedor/', icon: '📅' },
    ],
  },
];

// FAQ data
const faqData = [
  {
    question: '¿Cuánto cuesta darse de alta como autónomo?',
    answer: 'El alta en sí es gratuita (trámite online en Hacienda y Seguridad Social). El coste real es la cuota mensual: desde 80€/mes con tarifa plana el primer año, después según tus ingresos reales.',
    linkText: 'Calculadora Cuota Autónomo',
    linkUrl: '/calculadora-cuota-autonomo/',
  },
  {
    question: '¿Qué diferencia hay entre autónomo y SL?',
    answer: 'El autónomo responde con todo su patrimonio personal ante deudas; la SL limita la responsabilidad al capital aportado (mínimo 1€ desde 2022). Fiscalmente, el autónomo tributa por IRPF (progresivo hasta 47%) y la SL por Impuesto de Sociedades (25% fijo).',
    linkText: 'Comparador Formas Jurídicas',
    linkUrl: '/comparador-formas-juridicas/',
  },
  {
    question: '¿Puedo facturar sin ser autónomo?',
    answer: 'Técnicamente no de forma habitual. La ley exige alta si hay habitualidad en la actividad. Hay matices para ingresos muy puntuales y por debajo del SMI, pero Hacienda puede reclamar.',
    linkText: 'Asistente Alta Autónomo',
    linkUrl: '/asistente-alta-autonomo/',
  },
  {
    question: '¿Cuánto tarda montar una SL?',
    answer: 'Entre 1-2 semanas si usas constitución telemática (PAE o notaría digital). Coste aproximado: 400-600€ entre notaría, registro mercantil y gestoría. Con el capital social mínimo de 1€, ya puedes constituirla.',
    linkText: 'Asistente Constitución Sociedad',
    linkUrl: '/asistente-constitucion-sociedad/',
  },
  {
    question: '¿Cuándo tengo que pagar impuestos?',
    answer: 'IVA e IRPF se presentan trimestralmente (20 de abril, julio, octubre y enero). En enero también los resúmenes anuales. El Impuesto de Sociedades es anual (julio). El calendario fiscal te marca todas las fechas.',
    linkText: 'Calendario Fiscal',
    linkUrl: '/calendario-fiscal-emprendedor/',
  },
];

export default function GuiaEmprendedorPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🚀</span>
        <h1 className={styles.title}>Guía para Emprender en España</h1>
        <p className={styles.subtitle}>
          Todo lo que necesitas calcular antes de montar tu negocio.
          Sin registro, sin coste, en 15 minutos.
        </p>
        <div className={styles.heroBadges}>
          <span className={styles.badge}>📦 7 herramientas</span>
          <span className={styles.badge}>🔄 Actualizado 2025</span>
          <span className={styles.badge}>✨ 100% gratuito</span>
        </div>
        <Link href="/comparador-formas-juridicas/" className={styles.ctaButton}>
          Empezar ahora →
        </Link>
      </header>

      {/* Journey Section */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon}>📍</span>
          Tu camino para emprender
        </h2>
        <div className={styles.journeySteps}>
          {journeySteps.map((step) => (
            <div key={step.number} className={styles.journeyStep}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
                <div className={styles.stepTools}>
                  {step.tools.map((tool) => (
                    <Link key={tool.url} href={tool.url} className={styles.toolLink}>
                      <span className={styles.toolIcon}>{tool.icon}</span>
                      {tool.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Bonus Step */}
          <div className={`${styles.journeyStep} ${styles.bonusStep}`}>
            <div className={styles.stepNumber}>+</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>Bonus: Calcula tu cuota</h3>
              <p className={styles.stepDescription}>
                Si vas de autónomo, descubre exactamente cuánto pagarás de cuota mensual según los tramos de ingresos de 2025.
              </p>
              <div className={styles.stepTools}>
                <Link href="/calculadora-cuota-autonomo/" className={styles.toolLink}>
                  <span className={styles.toolIcon}>💶</span>
                  Calculadora Cuota Autónomo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className={styles.caseStudySection}>
        <div className={styles.caseStudyHeader}>
          <span className={styles.caseStudyIcon}>💡</span>
          <h2 className={styles.caseStudyTitle}>Ejemplo: Carlos quiere montar una consultoría de marketing</h2>
        </div>
        <div className={styles.caseStudySteps}>
          <div className={styles.caseStep}>
            <div className={styles.caseStepNumber}>1</div>
            <div className={styles.caseStepContent}>
              <p className={styles.caseStepAction}>Usó el Comparador de Formas Jurídicas</p>
              <p className={styles.caseStepResult}>
                Descubrió que con su perfil (trabaja solo, sin empleados, ingresos estimados 45.000€/año)
                le convenía <span className={styles.caseStepHighlight}>empezar como autónomo</span>.
              </p>
            </div>
          </div>
          <div className={styles.caseStep}>
            <div className={styles.caseStepNumber}>2</div>
            <div className={styles.caseStepContent}>
              <p className={styles.caseStepAction}>Usó el Simulador Autónomo vs SL</p>
              <p className={styles.caseStepResult}>
                Confirmó que como autónomo pagaría ~8.200€/año en impuestos vs ~9.100€ si montase una SL.
                <span className={styles.caseStepHighlight}> Ahorro: 900€/año</span>.
              </p>
            </div>
          </div>
          <div className={styles.caseStep}>
            <div className={styles.caseStepNumber}>3</div>
            <div className={styles.caseStepContent}>
              <p className={styles.caseStepAction}>Usó el Asistente Alta Autónomo</p>
              <p className={styles.caseStepResult}>
                Vio el checklist completo: alta en Hacienda (modelo 036), alta en Seguridad Social,
                y que podía <span className={styles.caseStepHighlight}>hacerlo online en 1 día</span>.
              </p>
            </div>
          </div>
          <div className={styles.caseStep}>
            <div className={styles.caseStepNumber}>4</div>
            <div className={styles.caseStepContent}>
              <p className={styles.caseStepAction}>Usó la Calculadora Cuota Autónomo</p>
              <p className={styles.caseStepResult}>
                Descubrió que con la tarifa plana pagaría <span className={styles.caseStepHighlight}>80€/mes el primer año</span>,
                luego según ingresos reales.
              </p>
            </div>
          </div>
          <div className={styles.caseStep}>
            <div className={styles.caseStepNumber}>5</div>
            <div className={styles.caseStepContent}>
              <p className={styles.caseStepAction}>Usó el Calendario Fiscal</p>
              <p className={styles.caseStepResult}>
                Marcó en su agenda: IVA trimestral (abril, julio, octubre, enero), IRPF trimestral,
                y <span className={styles.caseStepHighlight}>resumen anual en enero</span>.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.caseStudyResult}>
          <p className={styles.caseStudyResultText}>
            <strong>Resultado:</strong> Carlos tenía claro todo el proceso en 20 minutos.
            Decisión informada y sin sorpresas.
            <span className={styles.caseStudyResultEmoji}>✅</span>
          </p>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon}>🧰</span>
          Herramientas de esta guía
        </h2>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.url} className={styles.toolCard}>
              <span className={styles.toolCardIcon}>{tool.icon}</span>
              <h3 className={styles.toolCardName}>{tool.name}</h3>
              <p className={styles.toolCardQuestion}>{tool.question}</p>
              <span className={styles.toolCardCta}>
                Usar herramienta <span className={styles.toolCardArrow}>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon}>❓</span>
          Preguntas frecuentes sobre emprender
        </h2>
        <div className={styles.faqList}>
          {faqData.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={styles.faqQuestion}
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaqIndex === index}
              >
                {faq.question}
                <span className={`${styles.faqArrow} ${openFaqIndex === index ? styles.faqArrowOpen : ''}`}>
                  ▼
                </span>
              </button>
              <div className={`${styles.faqAnswer} ${openFaqIndex === index ? styles.faqAnswerOpen : ''}`}>
                <p className={styles.faqAnswerText}>{faq.answer}</p>
                <Link href={faq.linkUrl} className={styles.faqAnswerLink}>
                  → {faq.linkText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-selling Section */}
      <section className={styles.crossSellingSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionTitleIcon}>🔗</span>
          También te puede interesar
        </h2>
        <div className={styles.crossSellingGrid}>
          <Link href="/?suite=freelance" className={styles.crossSellingCard}>
            <span className={styles.crossSellingIcon}>💼</span>
            <h3 className={styles.crossSellingName}>Suite Freelance</h3>
            <p className={styles.crossSellingDescription}>Facturación, clientes y productividad</p>
          </Link>
          <Link href="/?suite=fiscal" className={styles.crossSellingCard}>
            <span className={styles.crossSellingIcon}>🏛️</span>
            <h3 className={styles.crossSellingName}>Suite Fiscal</h3>
            <p className={styles.crossSellingDescription}>Todas las calculadoras de impuestos</p>
          </Link>
          <Link href="/?suite=finanzas" className={styles.crossSellingCard}>
            <span className={styles.crossSellingIcon}>📈</span>
            <h3 className={styles.crossSellingName}>Suite Finanzas</h3>
            <p className={styles.crossSellingDescription}>Inversión y planificación financiera</p>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>¿Listo para dar el paso?</h2>
        <Link href="/comparador-formas-juridicas/" className={styles.finalCtaButton}>
          Empezar con el Comparador de Formas Jurídicas
        </Link>
        <p className={styles.finalCtaNote}>Es gratis, sin registro, y te lleva 2 minutos.</p>
      </section>

      <Footer appName="guia-emprendedor" />
    </div>
  );
}
