'use client';

import Link from 'next/link';
import styles from './CursoEmpresaFamiliar.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'fundamentos': '🏠',
  'gobierno': '⚖️',
  'profesionalizacion': '🎓',
  'modelos': '🧩',
  'gestion-modelos': '📊',
  'sucesion': '🔄'
};

const MODULE_COLORS: Record<string, string> = {
  'fundamentos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'gobierno': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'profesionalizacion': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'modelos': 'linear-gradient(135deg, #2E86AB, #7FB3D3)',
  'gestion-modelos': 'linear-gradient(135deg, #48A9A6, #2E86AB)',
  'sucesion': 'linear-gradient(135deg, #7FB3D3, #48A9A6)'
};

export default function CursoEmpresaFamiliarPage() {
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
        <span className={styles.heroIcon}>🏢</span>
        <h1 className={styles.title}>Curso de Empresa Familiar</h1>
        <p className={styles.subtitle}>
          Domina la gestión de empresas familiares: gobierno corporativo, protocolo familiar,
          sucesión generacional y modelos de profesionalización. Casos reales de Inditex,
          Mercadona y El Corte Inglés.
        </p>
        <a
          href="/videos/curso-empresa-familiar.mp4"
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
            <span className={styles.overviewIcon}>🏛️</span>
            <h3>Gobierno</h3>
            <p>Consejo de Familia, protocolo y estructuras de decisión</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🔄</span>
            <h3>Sucesión</h3>
            <p>Planificación generacional y continuidad empresarial</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📈</span>
            <h3>Profesionalización</h3>
            <p>Separar familia y empresa para crecer con éxito</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🇪🇸</span>
            <h3>Casos Reales</h3>
            <p>Inditex, Mercadona, El Corte Inglés y más</p>
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
                      href={`/curso-empresa-familiar/${module.id}/${chapter.id}`}
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
          <Link href="/curso-empresa-familiar/recursos/glosario" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📖</span>
            <div className={styles.resourceName}>Glosario de Términos</div>
            <div className={styles.resourceDesc}>Conceptos clave de empresa familiar</div>
          </Link>
          <Link href="/curso-empresa-familiar/recursos/ejercicios" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>✏️</span>
            <div className={styles.resourceName}>Ejercicios Prácticos</div>
            <div className={styles.resourceDesc}>Aplica lo aprendido a tu empresa</div>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        {progress === 0 ? (
          <>
            <h2 className={styles.ctaTitle}>🚀 ¡Comienza tu Formación en Empresa Familiar!</h2>
            <p className={styles.ctaText}>
              Aprende a gestionar los desafíos únicos de las empresas familiares:
              gobierno, sucesión, profesionalización y modelos de gestión.
            </p>
            <Link
              href="/curso-empresa-familiar/fundamentos/que-es-empresa-familiar"
              className={styles.ctaButton}
            >
              Comenzar el Curso →
            </Link>
          </>
        ) : progress === 100 ? (
          <>
            <h2 className={styles.ctaTitle}>🎉 ¡Felicidades, has completado el curso!</h2>
            <p className={styles.ctaText}>
              Has adquirido conocimientos fundamentales sobre gestión de empresas familiares.
              Ahora puedes aplicarlos a tu propia situación empresarial.
            </p>
            <Link
              href="/curso-empresa-familiar/recursos/ejercicios"
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
              ¡Continúa desarrollando tus conocimientos en empresa familiar!
            </p>
            <Link
              href={`/curso-empresa-familiar/${getNextIncompleteChapter(modules, isCompleted)}`}
              className={styles.ctaButton}
            >
              Continuar Curso →
            </Link>
          </>
        )}
      </section>

      <Footer appName="curso-empresa-familiar" />
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
  return 'fundamentos/que-es-empresa-familiar';
}
