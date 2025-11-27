'use client';

import Link from 'next/link';
import styles from '../../CursoInversion.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface LinkItem {
  name: string;
  url: string;
  description: string;
}

interface LinkCategory {
  title: string;
  icon: string;
  links: LinkItem[];
}

const LINK_CATEGORIES: LinkCategory[] = [
  {
    title: 'Reguladores y organismos oficiales',
    icon: '🏛️',
    links: [
      { name: 'CNMV', url: 'https://www.cnmv.es', description: 'Comisión Nacional del Mercado de Valores. Consulta entidades autorizadas y alertas sobre chiringuitos financieros.' },
      { name: 'Banco de España', url: 'https://www.bde.es', description: 'Información sobre tipos de interés, Letras del Tesoro y entidades financieras autorizadas.' },
      { name: 'Tesoro Público', url: 'https://www.tesoro.es', description: 'Compra directa de Letras, Bonos y Obligaciones del Estado español.' },
      { name: 'Agencia Tributaria', url: 'https://sede.agenciatributaria.gob.es', description: 'Información fiscal, modelos de declaración, consultas vinculantes sobre inversiones.' },
    ],
  },
  {
    title: 'Brokers y plataformas',
    icon: '💻',
    links: [
      { name: 'MyInvestor', url: 'https://myinvestor.es', description: 'Fondos indexados Vanguard sin comisiones de custodia. Ideal para inversión pasiva en España.' },
      { name: 'Indexa Capital', url: 'https://indexacapital.com', description: 'Roboadvisor líder en España. Gestión automatizada de carteras indexadas.' },
      { name: 'Interactive Brokers', url: 'https://www.interactivebrokers.com', description: 'Broker internacional con acceso a mercados globales y comisiones competitivas.' },
      { name: 'DEGIRO', url: 'https://www.degiro.es', description: 'Broker europeo con comisiones muy bajas para ETFs y acciones.' },
      { name: 'Trade Republic', url: 'https://traderepublic.com', description: 'Neobroker alemán con planes de inversión automáticos en ETFs.' },
    ],
  },
  {
    title: 'Análisis y datos de mercado',
    icon: '📊',
    links: [
      { name: 'Morningstar', url: 'https://www.morningstar.es', description: 'Análisis de fondos y ETFs, ratings, X-Ray de cartera. Referencia en la industria.' },
      { name: 'JustETF', url: 'https://www.justetf.com/es', description: 'Buscador de ETFs, comparativas, información de composición y costes.' },
      { name: 'Yahoo Finance', url: 'https://finance.yahoo.com', description: 'Cotizaciones en tiempo real, noticias financieras, screener de acciones.' },
      { name: 'Investing.com', url: 'https://es.investing.com', description: 'Datos de mercados globales, calendario económico, herramientas de análisis.' },
      { name: 'MSCI', url: 'https://www.msci.com', description: 'Información oficial sobre índices MSCI (World, Emerging Markets, etc.).' },
    ],
  },
  {
    title: 'Herramientas de planificación',
    icon: '🧮',
    links: [
      { name: 'Portfolio Visualizer', url: 'https://www.portfoliovisualizer.com', description: 'Backtesting de carteras, análisis de asset allocation, optimización (inglés).' },
      { name: 'Backtest Portfolio', url: 'https://backtest.curvo.eu', description: 'Simulador de carteras con ETFs europeos. Muy útil para inversores de la UE.' },
      { name: 'Portfolio Charts', url: 'https://portfoliocharts.com', description: 'Análisis visual de diferentes carteras modelo a lo largo de la historia.' },
      { name: 'Calculadora Interés Compuesto (meskeIA)', url: '/interes-compuesto/', description: 'Nuestra herramienta para calcular el crecimiento de tus inversiones.' },
    ],
  },
  {
    title: 'Comunidades y foros',
    icon: '👥',
    links: [
      { name: 'Bogleheads España', url: 'https://www.bogleheads.es', description: 'Comunidad española de inversión indexada siguiendo los principios de John Bogle.' },
      { name: 'Rankia', url: 'https://www.rankia.com', description: 'Foros de inversión en español. Amplia comunidad y mucha información sobre España.' },
      { name: 'Reddit r/SpainFIRE', url: 'https://www.reddit.com/r/SpainFIRE/', description: 'Comunidad de independencia financiera enfocada en España.' },
      { name: 'Reddit r/Bogleheads', url: 'https://www.reddit.com/r/Bogleheads/', description: 'Comunidad internacional de inversión indexada (inglés).' },
    ],
  },
  {
    title: 'Educación financiera',
    icon: '🎓',
    links: [
      { name: 'Finanzas para todos (CNMV/BdE)', url: 'https://www.finanzasparatodos.es', description: 'Portal educativo oficial del Banco de España y la CNMV.' },
      { name: 'Investopedia', url: 'https://www.investopedia.com', description: 'Enciclopedia de términos financieros y tutoriales (inglés).' },
      { name: 'Khan Academy - Finanzas', url: 'https://es.khanacademy.org/economics-finance-domain', description: 'Cursos gratuitos de finanzas y economía.' },
    ],
  },
];

export default function EnlacesUtilesPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <div className={styles.chapterContainer}>
        <header className={styles.chapterHero}>
          <div className={styles.chapterHeroIcon}>🔗</div>
          <h1 className={styles.chapterHeroTitle}>Enlaces Útiles</h1>
          <p className={styles.chapterHeroSubtitle}>
            Recursos, herramientas y webs recomendadas para inversores
          </p>
        </header>

        <nav className={styles.navigation}>
          <Link href="/curso-decisiones-inversion/recursos/bibliografia" className={styles.navButton}>
            ← Bibliografía
          </Link>
          <div className={styles.navProgress}>
            <div className={styles.navProgressText}>Recursos</div>
            <div className={styles.navProgressLabel}>Material de referencia</div>
          </div>
          <Link href="/curso-decisiones-inversion" className={styles.navButton}>
            Inicio curso →
          </Link>
        </nav>

        {/* Disclaimer */}
        <div className={styles.disclaimer}>
          <h3>⚠️ Aviso importante</h3>
          <p>
            Los enlaces a terceros se proporcionan con fines informativos y educativos.
            meskeIA no tiene relación comercial con ninguna de las plataformas mencionadas
            y no recibe comisiones por sus recomendaciones. Realiza siempre tu propia
            investigación antes de utilizar cualquier servicio financiero.
          </p>
        </div>

        {/* Links by category */}
        {LINK_CATEGORIES.map((category, catIndex) => (
          <section key={catIndex} className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>{category.icon}</span>
              <h2 className={styles.sectionTitleText}>{category.title}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {category.links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={link.url}
                  target={link.url.startsWith('/') ? '_self' : '_blank'}
                  rel={link.url.startsWith('/') ? undefined : 'noopener noreferrer'}
                  style={{
                    display: 'block',
                    background: 'var(--hover)',
                    borderRadius: 'var(--radius)',
                    padding: '16px 20px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'all 0.2s ease',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.background = 'var(--hover)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{
                      color: 'var(--primary)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      margin: 0,
                    }}>
                      {link.name}
                    </h3>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {link.url.startsWith('/') ? '↗ meskeIA' : '↗ Externo'}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}

        {/* Final note */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Nota final</h2>
          </div>
          <p>
            La inversión es un viaje de aprendizaje continuo. No necesitas dominar todo desde el principio.
            Empieza con lo básico (un broker, un par de fondos indexados) y ve profundizando a medida
            que ganes experiencia y confianza.
          </p>
          <div className={styles.highlightBox}>
            <p><strong>🎯 Recuerda:</strong> El mejor momento para empezar a invertir fue hace 10 años. El segundo mejor momento es ahora. ¡Éxito en tu camino como inversor!</p>
          </div>
        </section>

        <div className={styles.bottomNavigation}>
          <Link href="/curso-decisiones-inversion/recursos/bibliografia" className={styles.bottomNavLink}>
            <div className={styles.bottomNavLabel}>← Anterior</div>
            <div className={styles.bottomNavTitle}>📚 Bibliografía</div>
          </Link>
          <Link
            href="/curso-decisiones-inversion"
            className={`${styles.bottomNavLink} ${styles.next}`}
          >
            <div className={styles.bottomNavLabel}>Volver →</div>
            <div className={styles.bottomNavTitle}>📊 Inicio del curso</div>
          </Link>
        </div>
      </div>

      <Footer appName="curso-decisiones-inversion" />
    </div>
  );
}
