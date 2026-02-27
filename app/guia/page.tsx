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
