'use client';

import Link from 'next/link';
import styles from './CursoPensamientoCientifico.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'fundamentos': '🔬',
  'verdad': '🎯',
  'metodos': '🧪',
  'aplicaciones': '💡',
  'propagacion': '🌐',
  'limites': '⚖️'
};

const MODULE_COLORS: Record<string, string> = {
  'fundamentos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'verdad': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'metodos': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'aplicaciones': 'linear-gradient(135deg, #2E86AB, #7FB3D3)',
  'propagacion': 'linear-gradient(135deg, #48A9A6, #2E86AB)',
  'limites': 'linear-gradient(135deg, #7FB3D3, #48A9A6)'
};

export default function CursoPensamientoCientificoPage() {
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
        <span className={styles.heroIcon}>🧠</span>
        <h1 className={styles.title}>Curso de Pensamiento Científico</h1>
        <p className={styles.subtitle}>
          Aprende a pensar como un científico: método científico, pensamiento crítico,
          falacias lógicas y cómo aplicar la ciencia en tu vida cotidiana
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
            <span className={styles.overviewIcon}>🎓</span>
            <h3>Aprenderás</h3>
            <p>Fundamentos del método científico y pensamiento crítico</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🛡️</span>
            <h3>Detectarás</h3>
            <p>Falacias lógicas, sesgos cognitivos y pseudociencia</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🧩</span>
            <h3>Aplicarás</h3>
            <p>Pensamiento científico en decisiones cotidianas</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🌟</span>
            <h3>Comprenderás</h3>
            <p>Los límites y responsabilidades de la ciencia</p>
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
                      href={`/curso-pensamiento-cientifico/${module.id}/${chapter.id}`}
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

      {/* Resources Section */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>📚 Recursos Adicionales</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/curso-pensamiento-cientifico/recursos/glosario" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📖</span>
            <div className={styles.resourceName}>Glosario de Términos</div>
            <div className={styles.resourceDesc}>Definiciones clave del pensamiento científico</div>
          </Link>
          <Link href="/curso-pensamiento-cientifico/recursos/ejercicios" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>✏️</span>
            <div className={styles.resourceName}>Ejercicios Prácticos</div>
            <div className={styles.resourceDesc}>Pon a prueba tu pensamiento crítico</div>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        {progress === 0 ? (
          <>
            <h2 className={styles.ctaTitle}>🚀 ¡Comienza tu Viaje Científico!</h2>
            <p className={styles.ctaText}>
              Desarrolla las habilidades de pensamiento crítico que te permitirán
              evaluar información, tomar mejores decisiones y entender el mundo
            </p>
            <Link
              href="/curso-pensamiento-cientifico/fundamentos/que-es-ciencia"
              className={styles.ctaButton}
            >
              Comenzar el Curso →
            </Link>
          </>
        ) : progress === 100 ? (
          <>
            <h2 className={styles.ctaTitle}>🎉 ¡Felicidades, has completado el curso!</h2>
            <p className={styles.ctaText}>
              Has desarrollado habilidades fundamentales de pensamiento científico.
              Ahora puedes aplicarlas en tu vida cotidiana.
            </p>
            <Link
              href="/curso-pensamiento-cientifico/recursos/ejercicios"
              className={styles.ctaButton}
            >
              Practicar con Ejercicios →
            </Link>
          </>
        ) : (
          <>
            <h2 className={styles.ctaTitle}>📈 ¡Sigue avanzando!</h2>
            <p className={styles.ctaText}>
              Llevas {completedCount} de {totalChapters} capítulos completados.
              ¡Continúa desarrollando tu pensamiento científico!
            </p>
            <Link
              href={`/curso-pensamiento-cientifico/${getNextIncompleteChapter(modules, isCompleted)}`}
              className={styles.ctaButton}
            >
              Continuar Curso →
            </Link>
          </>
        )}
      </section>

      <Footer appName="curso-pensamiento-cientifico" />
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
  return 'fundamentos/que-es-ciencia';
}
