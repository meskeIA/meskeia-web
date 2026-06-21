import { Metadata } from 'next';
import Link from 'next/link';
import styles from './Guias.module.css';

export const metadata: Metadata = {
  title: 'Guías de fiscalidad, derecho laboral y finanzas | Delegum',
  description:
    'Guías paso a paso para decisiones completas en España: comprar casa, ser freelance, montar un negocio, invertir, ahorrar, jubilación y herencias. Cada guía reúne las herramientas de todo el proceso.',
  alternates: { canonical: 'https://delegum.com/guias/' },
};

// Selección curada de guías fiscal-laboral-financieras — viven en meskeIA y se abren allí
const GUIAS = [
  {
    icon: '🏠',
    name: 'Comprar casa',
    desc: 'Hipoteca, gastos de compraventa (ITP/IVA), notaría y la comparativa alquiler vs compra.',
    url: 'https://meskeia.com/guia/comprar-casa/',
  },
  {
    icon: '💼',
    name: 'Freelance en España',
    desc: 'Cuota de autónomo, IRPF, IVA, facturación, tarifas y comparativa con sociedad limitada.',
    url: 'https://meskeia.com/guia/freelance/',
  },
  {
    icon: '🏢',
    name: 'Montar un negocio',
    desc: 'Nombre de la empresa, punto de equilibrio, cashflow, tarifa y primeras facturas.',
    url: 'https://meskeia.com/guia/montar-negocio/',
  },
  {
    icon: '📈',
    name: 'Empezar a invertir',
    desc: 'Interés compuesto, perfil de riesgo, cartera diversificada y planificación de plusvalías.',
    url: 'https://meskeia.com/guia/invertir/',
  },
  {
    icon: '💰',
    name: 'Ahorrar dinero',
    desc: 'Control de gastos, regla 50/30/20, fondo de emergencia y estrategias para eliminar deudas.',
    url: 'https://meskeia.com/guia/ahorrar-dinero/',
  },
  {
    icon: '🏤',
    name: 'Planificar la jubilación',
    desc: 'Pensión pública, brecha de ingresos, ahorro complementario, plan de pensiones e IRPF del pensionista.',
    url: 'https://meskeia.com/guia/jubilacion/',
  },
  {
    icon: '📜',
    name: 'Gestionar una herencia',
    desc: 'Documentos, plazos, impuesto de sucesiones por CCAA, donaciones y plusvalía municipal.',
    url: 'https://meskeia.com/guia/herencias/',
  },
];

export default function GuiasPage() {
  return (
    <main className={styles.container}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Delegum · Guías</p>
        <h1 className={styles.title}>Guías de fiscalidad, laboral y finanzas</h1>
        <p className={styles.subtitle}>
          Procesos completos para decisiones importantes en España. Cada guía reúne, paso a paso,
          las herramientas que necesitas de principio a fin. Se abren en meskeia.com.
        </p>
      </header>

      <section className={styles.grid}>
        {GUIAS.map((g) => (
          <a key={g.url} href={g.url} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">{g.icon}</span>
            <div className={styles.cardText}>
              <h2 className={styles.name}>{g.name}</h2>
              <p className={styles.desc}>{g.desc}</p>
            </div>
          </a>
        ))}
      </section>

      <p className={styles.foot}>
        ¿Buscas un dato o un cálculo concreto?{' '}
        <Link href="/datos-fiscales" className={styles.link}>Datos fiscales</Link>
        {' · '}
        <Link href="/soluciones" className={styles.link}>Soluciones</Link>
      </p>
    </main>
  );
}
