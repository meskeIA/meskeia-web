'use client';

import Link from 'next/link';
import styles from './CursoOptimizacionIA.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'paradigma': '🔄',
  'como-piensan': '🧠',
  'eeat': '⭐',
  'optimizacion': '🛠️',
  'plataformas': '🤖',
  'medicion': '📊'
};

const MODULE_COLORS: Record<string, string> = {
  'paradigma': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'como-piensan': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'eeat': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'optimizacion': 'linear-gradient(135deg, #2E86AB, #7FB3D3)',
  'plataformas': 'linear-gradient(135deg, #48A9A6, #2E86AB)',
  'medicion': 'linear-gradient(135deg, #7FB3D3, #48A9A6)'
};

export default function CursoOptimizacionIAPage() {
  const { isCompleted, getProgressPercentage, getCompletedCount, getTotalChapters, getTotalDuration, modules } = useCourse();

  const progress = getProgressPercentage();
  const completedCount = getCompletedCount();
  const totalChapters = getTotalChapters();
  const totalDuration = getTotalDuration();

  // Contador de módulos para numerar capítulos globalmente
  let globalChapterIndex = 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🤖</span>
        <h1 className={styles.title}>Curso de Optimización para IAs</h1>
        <p className={styles.subtitle}>
          Domina GEO y AEO: el nuevo paradigma del posicionamiento digital.
          Aprende cómo funcionan ChatGPT, Perplexity y Gemini, y optimiza tu contenido para que las IAs lo citen.
        </p>
        <a
          href="/videos/curso-optimizacion-ia.mp4"
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
            <span className={styles.overviewIcon}>🔄</span>
            <h3>Nuevo Paradigma</h3>
            <p>De SEO tradicional a GEO/AEO: el cambio de era</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🧠</span>
            <h3>Cómo Piensan</h3>
            <p>LLMs, RAG y el proceso de citación de las IAs</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>⭐</span>
            <h3>E-E-A-T</h3>
            <p>Experiencia, Expertise, Autoridad y Confianza</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🛠️</span>
            <h3>Optimización</h3>
            <p>Estructura, Schema Markup y entidades</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🤖</span>
            <h3>Plataformas</h3>
            <p>ChatGPT, Perplexity, Gemini, AI Overviews</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📊</span>
            <h3>Medición</h3>
            <p>Cómo saber si las IAs citan tu contenido</p>
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
                  style={{ background: MODULE_COLORS[module.id] || MODULE_COLORS['paradigma'] }}
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
                      href={`/curso-optimizacion-ia/${module.id}/${chapter.id}`}
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
        <h2 className={styles.ctaTitle}>¿Listo para dominar el nuevo SEO?</h2>
        <p className={styles.ctaText}>
          Comienza con el primer capítulo y descubre cómo optimizar tu contenido para la era de las IAs.
        </p>
        <Link
          href="/curso-optimizacion-ia/paradigma/seo-a-geo"
          className={styles.ctaButton}
        >
          Comenzar Curso →
        </Link>
      </section>

      {/* Recursos adicionales */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>🔧 Herramientas Relacionadas</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/analizador-geo" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>🎯</span>
            <div className={styles.resourceName}>Analizador GEO/AEO</div>
            <div className={styles.resourceDesc}>Analiza tu contenido con nuestro scoring</div>
          </Link>
          <Link href="/generador-schema-markup" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📝</span>
            <div className={styles.resourceName}>Generador Schema</div>
            <div className={styles.resourceDesc}>Crea datos estructurados para tu web</div>
          </Link>
        </div>
      </section>

      <Footer appName="curso-optimizacion-ia" />
    </div>
  );
}
