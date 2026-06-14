'use client';
// @disclaimer: exempt

import Link from 'next/link';
import styles from './CursoNegociacion.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'preparacion': '📋',
  'psicologia': '🧠',
  'cierre': '🤝',
  'conflictos': '⚖️'
};

const MODULE_COLORS: Record<string, string> = {
  'preparacion': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'psicologia': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'cierre': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'conflictos': 'linear-gradient(135deg, #2E86AB, #7FB3D3)'
};

export default function CursoNegociacionPage() {
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
        <span className={styles.heroIcon} aria-hidden="true">🤝</span>
        <h1 className={styles.title}>Curso de Negociación Exitosa</h1>
        <p className={styles.subtitle}>
          Domina el arte de negociar: desde la preparación estratégica hasta el cierre de acuerdos.
          Aprende BATNA, ZOPA, técnicas de persuasión, gestión de conflictos y negociación multicultural.
        </p>
        <a
          href="/videos/curso-negociacion.mp4"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoButton}
        >
          <span className={styles.videoIcon} aria-hidden="true">▶️</span>
          Ver introducción en video
        </a>
      </header>

      <LegalNotice />

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">📚</span>
          <div className={styles.statValue}>{totalChapters}</div>
          <div className={styles.statLabel}>Capítulos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">⏱️</span>
          <div className={styles.statValue}>{totalDuration}</div>
          <div className={styles.statLabel}>Minutos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">✅</span>
          <div className={styles.statValue}>{completedCount}/{totalChapters}</div>
          <div className={styles.statLabel}>Completados</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">📊</span>
          <div className={styles.statValue}>{progress}%</div>
          <div className={styles.statLabel}>Progreso</div>
        </div>
      </div>

      {/* Overview Section */}
      <section className={styles.overviewSection}>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon} aria-hidden="true">📋</span>
            <h3>Preparación</h3>
            <p>BATNA, ZOPA y análisis estratégico antes de negociar</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon} aria-hidden="true">🧠</span>
            <h3>Psicología</h3>
            <p>Sesgos cognitivos, persuasión y tácticas de influencia</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon} aria-hidden="true">🤝</span>
            <h3>Cierre</h3>
            <p>Técnicas de cierre, contratos y negociación internacional</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon} aria-hidden="true">⚖️</span>
            <h3>Conflictos</h3>
            <p>Mediación, arbitraje y ética en la negociación</p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📖</span> Contenido del Curso</h2>

        {modules.map((module) => {
          const completedInModule = module.chapters.filter(ch => isCompleted(ch.id)).length;
          const moduleProgress = Math.round((completedInModule / module.chapters.length) * 100);

          return (
            <div key={module.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <div
                  className={styles.moduleIcon}
                  style={{ background: MODULE_COLORS[module.id] || MODULE_COLORS['preparacion'] }}
                >
                  {MODULE_ICONS[module.id] || '📖'}
                </div>
                <div className={styles.moduleInfo}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleSubtitle}>{module.chapters.length} capítulos</p>
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
                      href={`/curso-negociacion/${module.id}/${chapter.id}`}
                      className={`${styles.chapterCard} ${completed ? styles.chapterCompleted : ''}`}
                    >
                      <div className={styles.chapterHeader}>
                        <span className={styles.chapterNumber}>{globalChapterIndex}</span>
                        <div className={styles.chapterInfo}>
                          <h4 className={styles.chapterTitle}>{chapter.title}</h4>
                          <span className={styles.chapterDuration}><span aria-hidden="true">⏱️</span> {chapter.duration} min</span>
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

      {/* Resources Section */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📚</span> Recursos Adicionales</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/curso-negociacion/recursos/glosario" className={styles.resourceCard}>
            <span className={styles.resourceIcon} aria-hidden="true">📖</span>
            <div className={styles.resourceName}>Glosario de Términos</div>
            <div className={styles.resourceDesc}>BATNA, ZOPA, anclaje y más conceptos clave</div>
          </Link>
          <Link href="/curso-negociacion/recursos/ejercicios" className={styles.resourceCard}>
            <span className={styles.resourceIcon} aria-hidden="true">✏️</span>
            <div className={styles.resourceName}>Ejercicios Prácticos</div>
            <div className={styles.resourceDesc}>Practica con escenarios de negociación reales</div>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        {progress === 0 ? (
          <>
            <h2 className={styles.ctaTitle}><span aria-hidden="true">🚀</span> ¡Comienza tu Formación en Negociación!</h2>
            <p className={styles.ctaText}>
              Aprende a preparar, conducir y cerrar negociaciones exitosas.
              Domina las técnicas que usan los mejores negociadores del mundo.
            </p>
            <Link
              href="/curso-negociacion/preparacion/fundamentos-negociacion"
              className={styles.ctaButton}
            >
              Comenzar el Curso →
            </Link>
          </>
        ) : progress === 100 ? (
          <>
            <h2 className={styles.ctaTitle}><span aria-hidden="true">🎉</span> ¡Felicidades, has completado el curso!</h2>
            <p className={styles.ctaText}>
              Has adquirido conocimientos fundamentales sobre negociación exitosa.
              Ahora puedes aplicarlos en tu vida profesional y personal.
            </p>
            <Link
              href="/curso-negociacion/recursos/ejercicios"
              className={styles.ctaButton}
            >
              Practicar con Ejercicios →
            </Link>
          </>
        ) : (
          <>
            <h2 className={styles.ctaTitle}><span aria-hidden="true">📈</span> ¡Sigue avanzando!</h2>
            <p className={styles.ctaText}>
              Llevas {completedCount} de {totalChapters} capítulos completados.
              ¡Continúa desarrollando tus habilidades de negociación!
            </p>
            <Link
              href={`/curso-negociacion/${getNextIncompleteChapter(modules, isCompleted)}`}
              className={styles.ctaButton}
            >
              Continuar Curso →
            </Link>
          </>
        )}
      </section>

      <RelatedApps apps={getRelatedApps('curso-negociacion')} />
      <ShareCard appName="curso-negociacion" />
      <Footer appName="curso-negociacion" />
    </div>
  );
}

// Helper para encontrar el siguiente capítulo no completado
function getNextIncompleteChapter(
  modules: typeof COURSE_MODULES,
  isCompleted: (id: string) => boolean
): string {
  for (const module of modules) {
    for (const chapter of module.chapters) {
      if (!isCompleted(chapter.id)) {
        return `${module.id}/${chapter.id}`;
      }
    }
  }
  return 'preparacion/fundamentos-negociacion';
}
