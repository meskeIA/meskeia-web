'use client';
// @disclaimer: exempt

import Image from 'next/image';
import Link from 'next/link';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './DelegumHome.module.css';

// Pilares principales de Delegum
const PILARES = [
  {
    icon: '📊',
    titulo: 'Datos fiscales',
    desc: 'Tipos, tramos y coeficientes verificados, con fuente oficial y fecha. Listos para consultar o citar.',
    href: '/datos-fiscales',
    cta: 'Ver datos',
  },
  {
    icon: '🤖',
    titulo: 'Asistente IA',
    desc: 'Conecta Delegum (MCP) a Claude, ChatGPT o Mistral para orientar en cuestiones fiscales, laborales y financieras con cálculos reales.',
    href: '/asistente-ia',
    cta: 'Conectar',
  },
  {
    icon: '🧮',
    titulo: 'Calculadoras',
    desc: 'Selección de calculadoras de fiscalidad, derecho laboral y finanzas para hacer el número tú mismo.',
    href: '/calculadoras',
    cta: 'Calcular',
  },
];

export default function DelegumHome() {
  return (
    <>
      <AnalyticsTracker appName="delegum" />

      <main className={styles.container}>

        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroLockup}>
            <Image
              src="/delegum/simbolo-blanco.svg"
              alt=""
              aria-hidden="true"
              width={80}
              height={80}
              priority
            />
            <span className={styles.heroWordmark}>Delegum</span>
          </div>
          <p className={styles.heroSubtitle}>
            Tu plataforma de <strong>fiscalidad, derecho laboral y finanzas</strong> en España.
            Datos verificados, herramientas y un asistente de IA, en un solo sitio.
          </p>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            Normativa 2025-2026 · Sin registro · Sin coste
          </div>
        </header>

        {/* Pilares */}
        <section className={styles.pilaresSection} aria-label="Qué ofrece Delegum">
          <div className={styles.pilaresGrid}>
            {PILARES.map((p) => (
              <Link key={p.titulo} href={p.href} className={styles.pilarCard}>
                <span className={styles.pilarIcon} aria-hidden="true">{p.icon}</span>
                <h2 className={styles.pilarTitulo}>{p.titulo}</h2>
                <p className={styles.pilarDesc}>{p.desc}</p>
                <span className={styles.pilarCta}>{p.cta} →</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Qué es Delegum */}
        <section className={styles.queEs}>
          <h2 className={styles.sectionTitle}>Qué es Delegum</h2>
          <p>
            Delegum reúne en una sola marca todo lo que necesitas para entender la fiscalidad,
            el derecho laboral y las finanzas en España: una <strong>capa de datos normativos</strong>{' '}
            verificados y citables, un <strong>asistente de IA</strong> que orquesta los cálculos
            para orientarte en cada caso y una <strong>selección de calculadoras</strong>. Es un
            servicio de <a href="https://meskeia.com/" className={styles.link}>meskeIA</a> y comparte
            su compromiso: herramientas claras, gratuitas y sin recopilar datos personales.
          </p>
        </section>

      </main>
    </>
  );
}
