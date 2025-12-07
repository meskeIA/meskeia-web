'use client';

import Link from 'next/link';
import styles from './CursoEstrategiaEmpresarial.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'fundamentos': '📚',
  'cambios': '💥',
  'herramientas': '🛠️',
  'aplicacion': '🎯'
};

const MODULE_COLORS: Record<string, string> = {
  'fundamentos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'cambios': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'herramientas': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'aplicacion': 'linear-gradient(135deg, #2E86AB, #48A9A6)'
};

export default function CursoEstrategiaEmpresarialPage() {
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
        <span className={styles.heroIcon}>♟️</span>
        <h1 className={styles.title}>Curso de Estrategia Empresarial</h1>
        <p className={styles.subtitle}>
          Pensamiento estratégico para la era de la incertidumbre. Desde los fundamentos clásicos
          hasta las nuevas realidades de la IA y la disrupción continua. Un curso honesto sobre
          qué funciona y qué ha dejado de funcionar.
        </p>
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
            <p>Porter, capacidades y lo que sigue siendo válido</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>💥</span>
            <h3>Lo Que Cambió</h3>
            <p>Por qué fracasaron las &quot;excelentes&quot; y los nuevos moats</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🛠️</span>
            <h3>Herramientas</h3>
            <p>De SWOT a opciones, experimentación y estrategia emergente</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🎯</span>
            <h3>Aplicación</h3>
            <p>OpenAI vs Anthropic, Tesla, Amazon e Inditex</p>
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
                      href={`/curso-estrategia-empresarial/${module.id}/${chapter.id}`}
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
        <h2 className={styles.ctaTitle}>¿Listo para pensar estratégicamente?</h2>
        <p className={styles.ctaText}>
          Comienza con el primer capítulo y descubre qué es realmente la estrategia empresarial,
          más allá de los frameworks y las modas.
        </p>
        <Link
          href="/curso-estrategia-empresarial/fundamentos/que-es-estrategia"
          className={styles.ctaButton}
        >
          Comenzar Curso →
        </Link>
      </section>

      {/* Recursos adicionales */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>🔧 Herramientas Relacionadas</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/calculadora-roi-marketing" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📊</span>
            <div className={styles.resourceName}>Calculadora ROI</div>
            <div className={styles.resourceDesc}>Mide el retorno de tus inversiones</div>
          </Link>
          <Link href="/analizador-geo" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>🤖</span>
            <div className={styles.resourceName}>Analizador GEO/AEO</div>
            <div className={styles.resourceDesc}>Optimiza para la era de la IA</div>
          </Link>
          <Link href="/curso-marketing-digital" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📈</span>
            <div className={styles.resourceName}>Curso Marketing Digital</div>
            <div className={styles.resourceDesc}>30 capítulos de marketing 2025</div>
          </Link>
        </div>
      </section>

      <Footer appName="curso-estrategia-empresarial" />
    </div>
  );
}
