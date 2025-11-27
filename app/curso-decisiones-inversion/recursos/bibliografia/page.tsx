'use client';

import Link from 'next/link';
import styles from '../../CursoInversion.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface Book {
  title: string;
  author: string;
  year: string;
  description: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  category: string;
}

const BOOKS: Book[] = [
  // Clásicos
  {
    title: 'El inversor inteligente',
    author: 'Benjamin Graham',
    year: '1949',
    description: 'La biblia del value investing. Introduce conceptos fundamentales como el margen de seguridad y la diferencia entre inversión y especulación. Lectura obligatoria para cualquier inversor.',
    level: 'Intermedio',
    category: 'Clásicos',
  },
  {
    title: 'Un paseo aleatorio por Wall Street',
    author: 'Burton Malkiel',
    year: '1973',
    description: 'Defiende la teoría del mercado eficiente y la inversión indexada. Explica por qué es tan difícil batir al mercado consistentemente.',
    level: 'Principiante',
    category: 'Clásicos',
  },
  {
    title: 'Acciones ordinarias y beneficios extraordinarios',
    author: 'Philip Fisher',
    year: '1958',
    description: 'El enfoque cualitativo del análisis de empresas. Fisher se centra en la calidad del negocio y la gestión más que en los números.',
    level: 'Intermedio',
    category: 'Clásicos',
  },
  // Inversión indexada
  {
    title: 'El pequeño libro para invertir con sentido común',
    author: 'John C. Bogle',
    year: '2007',
    description: 'El fundador de Vanguard explica los principios de la inversión indexada: costes bajos, diversificación y paciencia.',
    level: 'Principiante',
    category: 'Inversión indexada',
  },
  {
    title: 'Si lo puedes, ¿cómo los millennials pueden hacerse ricos lentamente?',
    author: 'William J. Bernstein',
    year: '2014',
    description: 'Guía concisa y directa sobre cómo construir una cartera indexada simple. Perfecto para principiantes.',
    level: 'Principiante',
    category: 'Inversión indexada',
  },
  {
    title: 'Los cuatro pilares de la inversión',
    author: 'William J. Bernstein',
    year: '2002',
    description: 'Análisis profundo de la teoría de inversión, historia de los mercados, psicología del inversor y la industria financiera.',
    level: 'Intermedio',
    category: 'Inversión indexada',
  },
  // Psicología
  {
    title: 'Pensar rápido, pensar despacio',
    author: 'Daniel Kahneman',
    year: '2011',
    description: 'Nobel de economía explica los sesgos cognitivos que afectan nuestras decisiones, incluyendo las financieras. Fundamental para entender la psicología del inversor.',
    level: 'Intermedio',
    category: 'Psicología',
  },
  {
    title: 'La psicología del dinero',
    author: 'Morgan Housel',
    year: '2020',
    description: 'Historias cortas sobre la relación emocional con el dinero y las inversiones. Muy ameno y lleno de sabiduría práctica.',
    level: 'Principiante',
    category: 'Psicología',
  },
  // Estrategia
  {
    title: 'El manual del inversor en valor',
    author: 'Christopher Browne',
    year: '2006',
    description: 'Guía práctica del value investing desde la perspectiva de un gestor profesional.',
    level: 'Intermedio',
    category: 'Estrategia',
  },
  {
    title: 'One Up on Wall Street',
    author: 'Peter Lynch',
    year: '1989',
    description: 'El legendario gestor de Magellan comparte su filosofía de inversión accesible: invierte en lo que conoces.',
    level: 'Principiante',
    category: 'Estrategia',
  },
  // España específico
  {
    title: 'Independízate de Papá Estado',
    author: 'Carlos Galán',
    year: '2016',
    description: 'Enfocado en el contexto español: planes de pensiones, fiscalidad, indexación. Muy práctico para inversores españoles.',
    level: 'Principiante',
    category: 'España',
  },
  {
    title: 'Invierte en ti',
    author: 'Natalia de Santiago',
    year: '2022',
    description: 'Finanzas personales para el público general en España. Cubre ahorro, inversión y planificación de forma accesible.',
    level: 'Principiante',
    category: 'España',
  },
];

const CATEGORIES = ['Clásicos', 'Inversión indexada', 'Psicología', 'Estrategia', 'España'];

export default function BibliografiaPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <div className={styles.chapterContainer}>
        <header className={styles.chapterHero}>
          <div className={styles.chapterHeroIcon}>📚</div>
          <h1 className={styles.chapterHeroTitle}>Bibliografía Recomendada</h1>
          <p className={styles.chapterHeroSubtitle}>
            Los mejores libros para profundizar en inversión y finanzas personales
          </p>
        </header>

        <nav className={styles.navigation}>
          <Link href="/curso-decisiones-inversion/recursos/glosario" className={styles.navButton}>
            ← Glosario
          </Link>
          <div className={styles.navProgress}>
            <div className={styles.navProgressText}>Recursos</div>
            <div className={styles.navProgressLabel}>Material de referencia</div>
          </div>
          <Link href="/curso-decisiones-inversion/recursos/enlaces-utiles" className={styles.navButton}>
            Enlaces útiles →
          </Link>
        </nav>

        {/* Intro */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Cómo usar esta lista</h2>
          </div>
          <p>Los libros están organizados por categoría y nivel de dificultad. Si estás empezando, comienza por los marcados como &quot;Principiante&quot;. La inversión es un camino de aprendizaje continuo.</p>
          <div className={styles.highlightBox}>
            <p><strong>📌 Recomendación:</strong> No necesitas leer todos estos libros. Con 3-4 bien elegidos según tu nivel tendrás una base sólida. La calidad supera a la cantidad.</p>
          </div>
        </section>

        {/* Books by category */}
        {CATEGORIES.map(category => (
          <section key={category} className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>
                {category === 'Clásicos' && '🏛️'}
                {category === 'Inversión indexada' && '📈'}
                {category === 'Psicología' && '🧠'}
                {category === 'Estrategia' && '🎯'}
                {category === 'España' && '🇪🇸'}
              </span>
              <h2 className={styles.sectionTitleText}>{category}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {BOOKS.filter(b => b.category === category).map((book, index) => (
                <div
                  key={index}
                  style={{
                    background: 'var(--hover)',
                    borderRadius: 'var(--radius)',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{
                      color: 'var(--primary)',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      margin: 0,
                    }}>
                      {book.title}
                    </h3>
                    <span style={{
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      borderRadius: '12px',
                      background: book.level === 'Principiante' ? '#d4edda' :
                                  book.level === 'Intermedio' ? '#fff3cd' : '#f8d7da',
                      color: book.level === 'Principiante' ? '#155724' :
                             book.level === 'Intermedio' ? '#856404' : '#721c24',
                      fontWeight: 500,
                    }}>
                      {book.level}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 12px 0' }}>
                    {book.author} ({book.year})
                  </p>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {book.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Other resources */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎧</span>
            <h2 className={styles.sectionTitleText}>Otros recursos</h2>
          </div>

          <h3>Podcasts recomendados</h3>
          <ul>
            <li><strong>Buscando Valor (Alejandro Estebaranz):</strong> Value investing en España</li>
            <li><strong>El Club de Inversión:</strong> Inversión indexada y finanzas personales</li>
            <li><strong>Buen Gobierno:</strong> Análisis de empresas y actualidad bursátil</li>
            <li><strong>Rational Reminder (inglés):</strong> Evidencia académica sobre inversión</li>
          </ul>

          <h3>Blogs y webs educativas</h3>
          <ul>
            <li><strong>Bogleheads.org:</strong> Comunidad de inversión indexada</li>
            <li><strong>Rankia.com:</strong> Foros de inversión en español</li>
            <li><strong>Portfolio Charts:</strong> Análisis de carteras históricas</li>
          </ul>
        </section>

        <div className={styles.bottomNavigation}>
          <Link href="/curso-decisiones-inversion/recursos/glosario" className={styles.bottomNavLink}>
            <div className={styles.bottomNavLabel}>← Anterior</div>
            <div className={styles.bottomNavTitle}>📖 Glosario</div>
          </Link>
          <Link
            href="/curso-decisiones-inversion/recursos/enlaces-utiles"
            className={`${styles.bottomNavLink} ${styles.next}`}
          >
            <div className={styles.bottomNavLabel}>Siguiente →</div>
            <div className={styles.bottomNavTitle}>🔗 Enlaces útiles</div>
          </Link>
        </div>
      </div>

      <Footer appName="curso-decisiones-inversion" />
    </div>
  );
}
