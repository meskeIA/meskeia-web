'use client';

import Link from 'next/link';
import styles from './GuiaIndex.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

const guias = [
  {
    slug: 'comprar-casa',
    icon: '🏠',
    title: 'Comprar Casa en España',
    description:
      'Simulador de hipoteca, gastos de compraventa, ITP/IVA, notaría y comparativa alquiler vs compra. Todo para tomar la mejor decisión sobre tu vivienda.',
    tools: 5,
  },
  {
    slug: 'invertir',
    icon: '📈',
    title: 'Empezar a Invertir',
    description:
      'Desde el ahorro hasta la cartera diversificada: interés compuesto, perfil de riesgo, simulador de cartera y planificación de plusvalías.',
    tools: 4,
  },
  {
    slug: 'jubilacion',
    icon: '🏤',
    title: 'Planificar la Jubilación',
    description:
      'Pensión pública, brecha de ingresos, ahorro complementario, plan de pensiones, IRPF como pensionista y protección familiar. El journey completo.',
    tools: 6,
  },
  {
    slug: 'freelance',
    icon: '💼',
    title: 'Freelance en España',
    description:
      'Cuota de autónomo, IRPF, IVA, facturación, tarifas y comparativa con SL. Todo lo que necesitas para trabajar por cuenta propia.',
    tools: 3,
  },
  {
    slug: 'ahorrar-dinero',
    icon: '💰',
    title: 'Ahorrar Dinero',
    description:
      'Control de gastos, regla 50/30/20, fondo de emergencia, eliminar suscripciones y pagar deudas. Ordena tus finanzas personales.',
    tools: 4,
  },
  {
    slug: 'montar-negocio',
    icon: '🏢',
    title: 'Montar un Negocio',
    description:
      'Genera el nombre de tu empresa, calcula el punto de equilibrio, planifica el cashflow, fija tu tarifa y emite tus primeras facturas.',
    tools: 5,
  },
  {
    slug: 'comprar-coche',
    icon: '🚗',
    title: 'Comprar un Coche',
    description:
      'Compara contado vs financiación vs renting, simula el préstamo, calcula el consumo real y elige el seguro adecuado para tu vehículo.',
    tools: 4,
  },
  {
    slug: 'vivir-sano',
    icon: '🥗',
    title: 'Vivir Más Sano',
    description:
      'IMC, macros y calorías, optimización del sueño, control de hidratación y seguimiento de hábitos saludables duraderos.',
    tools: 5,
  },
  {
    slug: 'accesibilidad',
    icon: '♿',
    title: 'Accesibilidad Digital',
    description:
      'Kit de apoyos visuales para autismo, TDAH y dislexia. Herramientas de regulación emocional, comunicación, lectura y rutinas. Sin registro ni instalación.',
    tools: 9,
  },
  {
    slug: 'herencias',
    icon: '📜',
    title: 'Gestionar una Herencia',
    description:
      'Documentos, impuestos y plazos para tramitar una herencia en España. Impuesto de sucesiones por comunidad autónoma, donaciones y plusvalía municipal.',
    tools: 4,
  },
  {
    slug: 'pensar-mejor',
    icon: '🧠',
    title: 'Pensar Mejor',
    description:
      'Herramientas de reflexión profesional: conócete, decide mejor y emprende con criterio. Tests basados en Kahneman, Csikszentmihalyi, Bezos y Osterwalder.',
    tools: 14,
  },
  {
    slug: 'programar-con-ia',
    icon: '🚀',
    title: 'Programar con IA',
    description:
      'Tengo una idea para una web, app o script. Nunca lo he hecho solo. ¿Por dónde empiezo? Elige tus herramientas, aprende a dar instrucciones y construye algo real paso a paso.',
    tools: 6,
  },
  {
    slug: 'primer-empleo',
    icon: '🎓',
    title: 'Del Estudio al Primer Empleo',
    description:
      'Terminaste los exámenes y toca buscar trabajo. Mide tus competencias, crea tu currículum, prepara la entrevista y entiende tu primer sueldo, paso a paso.',
    tools: 5,
  },
  {
    slug: 'seguridad-internet',
    icon: '🛡️',
    title: 'Seguridad y Privacidad en Internet',
    description:
      'Protege tus cuentas y tu privacidad sin ser un experto: contraseñas fuertes, verificación en dos pasos, detectar el phishing, cuidar tus datos y qué hacer si te hackean.',
    tools: 6,
  },
];

export default function GuiasIndexPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🗺️</span>
        <h1 className={styles.title}>Guías meskeIA</h1>
        <p className={styles.subtitle}>
          Decisiones importantes con herramientas gratuitas. Cada guía reúne las calculadoras
          que necesitas para el proceso completo, de principio a fin.
        </p>
      </header>

      <LegalNotice />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Todas las guías</h2>
        <div className={styles.grid}>
          {guias.map((guia) => (
            <Link key={guia.slug} href={`/guia/${guia.slug}/`} className={styles.card}>
              <span className={styles.cardIcon}>{guia.icon}</span>
              <h3 className={styles.cardTitle}>{guia.title}</h3>
              <p className={styles.cardDescription}>{guia.description}</p>
              <div className={styles.cardStats}>
                <span>🔧 {guia.tools} herramientas</span>
                <span className={styles.cardArrow}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer appName="guias-index" />
    </div>
  );
}
