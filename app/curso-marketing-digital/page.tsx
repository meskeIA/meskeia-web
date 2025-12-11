'use client';

import Link from 'next/link';
import styles from './CursoMarketingDigital.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'fundamentos': '📚',
  'branding': '🎨',
  'customer-centricity': '👥',
  'contenidos-seo': '✍️',
  'redes-sociales': '📱',
  'publicidad-digital': '📣',
  'automatizacion-ia': '🤖',
  'aplicacion-practica': '🎯'
};

const MODULE_COLORS: Record<string, string> = {
  'fundamentos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'branding': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'customer-centricity': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'contenidos-seo': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'redes-sociales': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'publicidad-digital': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'automatizacion-ia': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'aplicacion-practica': 'linear-gradient(135deg, #48A9A6, #7FB3D3)'
};

export default function CursoMarketingDigitalPage() {
  const { isCompleted, getProgressPercentage, getCompletedCount, getTotalChapters, getTotalDuration, modules } = useCourse();

  const progress = getProgressPercentage();
  const completedCount = getCompletedCount();
  const totalChapters = getTotalChapters();
  const totalDuration = getTotalDuration();

  // Contador de capítulos para numerar globalmente
  let globalChapterIndex = 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📈</span>
        <h1 className={styles.title}>Curso de Marketing Digital</h1>
        <p className={styles.subtitle}>
          Domina el marketing digital en 2025: desde fundamentos de branding hasta IA y automatización.
          Estrategias prácticas para emprendedores, marketers y profesionales que quieren resultados reales.
        </p>
        <a
          href="/videos/curso-marketing-digital.mp4"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoButton}
        >
          <span className={styles.videoIcon}>▶️</span>
          Ver introducción en video
        </a>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <div className={styles.statValue}>{totalChapters}</div>
          <div className={styles.statLabel}>Capítulos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏱️</span>
          <div className={styles.statValue}>{totalDuration}</div>
          <div className={styles.statLabel}>Minutos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✅</span>
          <div className={styles.statValue}>{completedCount}/{totalChapters}</div>
          <div className={styles.statLabel}>Completados</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📊</span>
          <div className={styles.statValue}>{progress}%</div>
          <div className={styles.statLabel}>Progreso</div>
        </div>
      </div>

      {/* Overview Section */}
      <section className={styles.overviewSection}>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📚</span>
            <h3>Fundamentos</h3>
            <p>Evolución del marketing, las nuevas 4P y segmentación</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🎨</span>
            <h3>Branding</h3>
            <p>Posicionamiento, storytelling y marca personal</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>✍️</span>
            <h3>SEO y Contenidos</h3>
            <p>Estrategia de contenidos, SEO y GEO/AEO</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📣</span>
            <h3>Publicidad</h3>
            <p>Meta Ads, Google Ads y medición</p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}>📖 Contenido del Curso</h2>

        {modules.map((module) => {
          const completedInModule = module.chapters.filter(ch => isCompleted(ch.id)).length;
          const moduleProgress = Math.round((completedInModule / module.chapters.length) * 100);

          return (
            <div key={module.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <div
                  className={styles.moduleIcon}
                  style={{ background: MODULE_COLORS[module.id] || MODULE_COLORS['fundamentos'] }}
                >
                  {MODULE_ICONS[module.id] || '📖'}
                </div>
                <div className={styles.moduleInfo}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleSubtitle}>{module.chapters.length} capítulo{module.chapters.length > 1 ? 's' : ''}</p>
                </div>
                <span className={styles.moduleProgress}>{moduleProgress}%</span>
              </div>

              <div className={styles.chaptersGrid}>
                {module.chapters.map((chapter) => {
                  globalChapterIndex++;
                  const completed = isCompleted(chapter.id);

                  return (
                    <Link
                      key={chapter.id}
                      href={`/curso-marketing-digital/${module.id}/${chapter.id}`}
                      className={`${styles.chapterCard} ${completed ? styles.chapterCompleted : ''}`}
                    >
                      <div className={styles.chapterHeader}>
                        <span className={styles.chapterNumber}>{globalChapterIndex}</span>
                        <div className={styles.chapterInfo}>
                          <h4 className={styles.chapterTitle}>{chapter.title}</h4>
                          <span className={styles.chapterDuration}>⏱️ {chapter.duration} min</span>
                        </div>
                      </div>
                      <div className={styles.chapterTopics}>
                        {chapter.topics.slice(0, 2).map((topic, idx) => (
                          <span key={idx} className={styles.topicTag}>{topic}</span>
                        ))}
                        {chapter.topics.length > 2 && (
                          <span className={styles.topicMore}>+{chapter.topics.length - 2}</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Listo para dominar el marketing digital?</h2>
        <p className={styles.ctaText}>
          Comienza con el primer capítulo y descubre cómo el marketing ha evolucionado hacia un enfoque centrado en el cliente y el propósito.
        </p>
        <Link
          href="/curso-marketing-digital/fundamentos/evolucion-marketing"
          className={styles.ctaButton}
        >
          Comenzar Curso →
        </Link>
      </section>

      {/* Recursos adicionales */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>🔧 Herramientas Relacionadas</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/generador-palabras-clave" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>🔍</span>
            <div className={styles.resourceName}>Generador de Keywords</div>
            <div className={styles.resourceDesc}>Encuentra palabras clave para tu contenido</div>
          </Link>
          <Link href="/analizador-geo" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>🤖</span>
            <div className={styles.resourceName}>Analizador GEO/AEO</div>
            <div className={styles.resourceDesc}>Optimiza para ChatGPT, Perplexity y Gemini</div>
          </Link>
          <Link href="/calculadora-roi-marketing" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📊</span>
            <div className={styles.resourceName}>Calculadora ROI Marketing</div>
            <div className={styles.resourceDesc}>Mide el retorno de tus campañas</div>
          </Link>
        </div>
      </section>

      <Footer appName="curso-marketing-digital" />
    </div>
  );
}
