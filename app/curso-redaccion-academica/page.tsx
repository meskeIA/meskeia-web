'use client';
// @disclaimer: exempt

import Link from 'next/link';
import styles from './CursoRedaccionAcademica.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { useCourse } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'fundamentos': '📚',
  'planificacion': '📋',
  'introduccion': '🚀',
  'desarrollo': '📝',
  'conclusiones': '🎯',
  'citas': '📖',
  'resumen': '📄',
  'resena': '🔍',
  'coherencia': '🔗',
  'estilo': '✍️',
  'revision': '🔧',
  'proyecto-final': '🏆',
  'glosario': '📘'
};

const MODULE_COLORS: Record<string, string> = {
  'fundamentos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'planificacion': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'introduccion': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'desarrollo': 'linear-gradient(135deg, #2E86AB, #7FB3D3)',
  'conclusiones': 'linear-gradient(135deg, #48A9A6, #2E86AB)',
  'citas': 'linear-gradient(135deg, #7FB3D3, #48A9A6)',
  'resumen': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'resena': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'coherencia': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'estilo': 'linear-gradient(135deg, #2E86AB, #7FB3D3)',
  'revision': 'linear-gradient(135deg, #48A9A6, #2E86AB)',
  'proyecto-final': 'linear-gradient(135deg, #7FB3D3, #48A9A6)',
  'glosario': 'linear-gradient(135deg, #2E86AB, #48A9A6)'
};

export default function CursoRedaccionAcademicaPage() {
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
        <span className={styles.heroIcon}>📝</span>
        <h1 className={styles.title}>Curso de Redacción Académica</h1>
        <p className={styles.subtitle}>
          Guía práctica para escribir textos académicos de calidad.
          Aprende a estructurar tu TFG, TFM, tesis o artículo científico con pautas aplicables desde el primer día.
        </p>
        <a
          href="/videos/curso-redaccion-academica.mp4"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoButton}
        >
          <span className={styles.videoIcon}>▶️</span>
          Ver introducción en video
        </a>
      </header>

      <LegalNotice />

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
            <p>Qué es un texto académico y sus características</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📋</span>
            <h3>Planificación</h3>
            <p>Organiza tu trabajo antes de escribir</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🚀</span>
            <h3>Introducción</h3>
            <p>Cómo empezar tu texto de forma efectiva</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📝</span>
            <h3>Desarrollo</h3>
            <p>Argumentación y progresión temática</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🎯</span>
            <h3>Conclusiones</h3>
            <p>Cierra tu trabajo de forma memorable</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📖</span>
            <h3>Citas</h3>
            <p>APA, MLA y cómo citar correctamente</p>
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
                      href={`/curso-redaccion-academica/${module.id}/${chapter.id}`}
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
        <h2 className={styles.ctaTitle}>¿Listo para mejorar tu escritura académica?</h2>
        <p className={styles.ctaText}>
          Comienza con el primer capítulo y aprende los fundamentos que transformarán tu forma de escribir.
        </p>
        <Link
          href="/curso-redaccion-academica/fundamentos/que-es-texto-academico"
          className={styles.ctaButton}
        >
          Comenzar Curso →
        </Link>
      </section>

      {/* Recursos adicionales */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>🔧 Herramientas Relacionadas</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/contador-palabras" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📊</span>
            <div className={styles.resourceName}>Contador de Palabras</div>
            <div className={styles.resourceDesc}>Controla la extensión de tu texto</div>
          </Link>
          <Link href="/conversor-texto" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>🔄</span>
            <div className={styles.resourceName}>Conversor de Texto</div>
            <div className={styles.resourceDesc}>Mayúsculas, minúsculas y más</div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('curso-redaccion-academica')} />
      <ShareCard appName="curso-redaccion-academica" />
      <Footer appName="curso-redaccion-academica" />
    </div>
  );
}
