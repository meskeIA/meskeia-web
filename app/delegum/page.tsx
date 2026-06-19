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
    href: '/delegum/datos-fiscales',
    cta: 'Ver datos',
  },
  {
    icon: '🤖',
    titulo: 'Asistente IA',
    desc: 'Conecta Delegum (MCP) a Claude, ChatGPT o Mistral y resuelve consultas reales como una gestoría.',
    href: '/delegum/asistente-ia',
    cta: 'Conectar',
  },
  {
    icon: '🧮',
    titulo: 'Calculadoras',
    desc: 'Selección de calculadoras de fiscalidad, laboral y finanzas para hacer el número tú mismo.',
    href: '#calculadoras',
    cta: 'Calcular',
  },
];

// Selección curada de calculadoras (viven en meskeIA, se enlazan)
const CALCULADORAS = [
  { icon: '💶', name: 'Sueldo neto', desc: 'Del bruto al neto con IRPF y Seguridad Social.', url: 'https://meskeia.com/estimador-sueldo-neto/' },
  { icon: '💼', name: 'Cuota de autónomo', desc: 'Cuota RETA mensual por ingresos reales 2025.', url: 'https://meskeia.com/estimador-cuota-autonomo/' },
  { icon: '🧭', name: 'Tipos de renta IRPF', desc: 'Cómo tributa cada ingreso: base general o del ahorro.', url: 'https://meskeia.com/orientador-tipos-renta-irpf/' },
  { icon: '🧾', name: 'Orientador del IVA', desc: 'Qué IVA aplicar en cada operación, con simulador.', url: 'https://meskeia.com/orientador-iva-espana/' },
  { icon: '📋', name: 'Gastos de compraventa', desc: 'ITP/IVA, notaría, registro y plusvalía del inmueble.', url: 'https://meskeia.com/estimador-compraventa-inmueble/' },
  { icon: '💰', name: 'Hipoteca', desc: 'Cuota y cuadro de amortización completo.', url: 'https://meskeia.com/estimador-hipoteca/' },
  { icon: '🏤', name: 'Jubilación pública', desc: 'Edad y pensión estimada con el sistema dual 2026.', url: 'https://meskeia.com/simulador-jubilacion-publica/' },
  { icon: '💍', name: 'Pensión de viudedad', desc: 'Porcentaje, base reguladora y mínimos 2025.', url: 'https://meskeia.com/estimador-pension-viudedad/' },
  { icon: '⚖️', name: 'Legítimas (herencia)', desc: 'Herencia forzosa según el régimen civil de tu CCAA.', url: 'https://meskeia.com/estimador-legitimas/' },
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
            Tu asesoría digital <strong>fiscal, laboral y financiera</strong> para España.
            Datos verificados, un asistente de IA y calculadoras, en un solo sitio.
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
            verificados y citables, un <strong>asistente de IA</strong> que actúa como gestoría y una{' '}
            <strong>selección de calculadoras</strong>. Es un servicio de{' '}
            <a href="https://meskeia.com/" className={styles.link}>meskeIA</a> y comparte su
            compromiso: herramientas claras, gratuitas y sin recopilar datos personales.
          </p>
        </section>

        {/* Calculadoras curadas */}
        <section id="calculadoras" className={styles.calcSection}>
          <h2 className={styles.sectionTitle}>Calculadoras destacadas</h2>
          <p className={styles.calcIntro}>
            Una selección de las herramientas fiscales, laborales y financieras de meskeIA.
            Se abren en meskeia.com, donde está el catálogo completo.
          </p>
          <div className={styles.calcGrid}>
            {CALCULADORAS.map((c) => (
              <a key={c.url} href={c.url} className={styles.calcCard}>
                <span className={styles.calcIcon} aria-hidden="true">{c.icon}</span>
                <div className={styles.calcText}>
                  <h3 className={styles.calcName}>{c.name}</h3>
                  <p className={styles.calcDesc}>{c.desc}</p>
                </div>
              </a>
            ))}
          </div>
          <p className={styles.calcFoot}>
            ¿Buscas otra herramienta?{' '}
            <a href="https://meskeia.com/apps/" className={styles.link}>Ver todas en meskeIA →</a>
          </p>
        </section>

      </main>
    </>
  );
}
