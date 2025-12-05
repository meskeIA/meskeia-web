'use client';

import Link from 'next/link';
import styles from './CursoTeoriaPolitica.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import {
  MODULES,
  CHAPTERS,
  RESOURCES,
  useCourse,
  getChaptersByModule,
  getTotalDuration,
} from './CourseContext';

export default function CursoTeoriaPoliticaPage() {
  const { getProgressPercentage, isChapterCompleted } = useCourse();

  const progress = getProgressPercentage();
  const completedCount = CHAPTERS.filter((ch) => isChapterCompleted(ch.id)).length;
  const totalDuration = getTotalDuration();

  // Determinar el siguiente capítulo a estudiar
  const nextChapter = CHAPTERS.find((ch) => !isChapterCompleted(ch.id)) || CHAPTERS[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🏛️</span>
        <h1 className={styles.title}>Curso de Introducción a la Teoría Política</h1>
        <p className={styles.subtitle}>
          Recorre 2.500 años de pensamiento político: desde la Grecia clásica hasta
          las teorías contemporáneas de la justicia. Los grandes pensadores que
          moldearon nuestra forma de entender el poder, el Estado y la sociedad.
        </p>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <div className={styles.statValue}>{MODULES.length}</div>
          <div className={styles.statLabel}>Módulos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📖</span>
          <div className={styles.statValue}>{CHAPTERS.length}</div>
          <div className={styles.statLabel}>Capítulos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏱️</span>
          <div className={styles.statValue}>{Math.round(totalDuration / 60)}h {totalDuration % 60}m</div>
          <div className={styles.statLabel}>Duración Total</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📊</span>
          <div className={styles.statValue}>{progress}%</div>
          <div className={styles.statLabel}>
            {completedCount}/{CHAPTERS.length} completados
          </div>
        </div>
      </div>

      {/* Qué aprenderás */}
      <section className={styles.overviewSection}>
        <h2 className={styles.sectionTitle}>
          <span>🎯</span> ¿Qué aprenderás?
        </h2>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🏛️</span>
            <h3>Fundamentos clásicos</h3>
            <p>Las bases del pensamiento político con Platón y Aristóteles</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>⚔️</span>
            <h3>Estado moderno</h3>
            <p>El nacimiento del Estado con Maquiavelo, Hobbes y Locke</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>💡</span>
            <h3>Ilustración</h3>
            <p>La razón y el contrato social con Montesquieu y Rousseau</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🌍</span>
            <h3>Pensamiento contemporáneo</h3>
            <p>Crítica y justicia con Marx y Rawls</p>
          </div>
        </div>
      </section>

      {/* Módulos y Capítulos */}
      <section className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}>
          <span>📚</span> Contenido del Curso
        </h2>

        {MODULES.map((module) => {
          const moduleChapters = getChaptersByModule(module.slug);
          const moduleCompleted = moduleChapters.filter((ch) =>
            isChapterCompleted(ch.id)
          ).length;

          return (
            <div key={module.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <div
                  className={styles.moduleIcon}
                  style={{ background: `${module.color}20` }}
                >
                  {module.icon}
                </div>
                <div className={styles.moduleInfo}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleSubtitle}>{module.subtitle}</p>
                </div>
                <div className={styles.moduleProgress}>
                  {moduleCompleted}/{moduleChapters.length}
                </div>
              </div>

              <div className={styles.chaptersGrid}>
                {moduleChapters.map((chapter) => {
                  const completed = isChapterCompleted(chapter.id);
                  return (
                    <Link
                      key={chapter.id}
                      href={`/curso-teoria-politica/${chapter.module}/${chapter.slug}`}
                      className={`${styles.chapterCard} ${completed ? styles.chapterCompleted : ''}`}
                    >
                      <div className={styles.chapterHeader}>
                        <span className={styles.chapterNumber}>
                          {completed ? '✓' : chapter.id}
                        </span>
                        <div className={styles.chapterInfo}>
                          <h4 className={styles.chapterTitle}>
                            {chapter.icon} {chapter.title}
                          </h4>
                          <span className={styles.chapterDuration}>
                            {chapter.duration} · {chapter.subtitle}
                          </span>
                        </div>
                      </div>
                      <p className={styles.chapterDesc}>{chapter.description}</p>
                      <div className={styles.chapterTopics}>
                        {chapter.topics.slice(0, 3).map((topic, idx) => (
                          <span key={idx} className={styles.topicTag}>
                            {topic}
                          </span>
                        ))}
                        {chapter.topics.length > 3 && (
                          <span className={styles.topicMore}>
                            +{chapter.topics.length - 3}
                          </span>
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

      {/* Recursos */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>
          <span>📖</span> Recursos Adicionales
        </h2>
        <div className={styles.resourcesGrid}>
          {RESOURCES.map((resource) => (
            <Link
              key={resource.id}
              href={resource.href}
              className={styles.resourceCard}
            >
              <span className={styles.resourceIcon}>{resource.icon}</span>
              <h3 className={styles.resourceName}>{resource.name}</h3>
              <p className={styles.resourceDesc}>{resource.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {progress === 0
            ? '¿Listo para empezar?'
            : progress === 100
              ? '¡Enhorabuena! Has completado el curso'
              : `Continúa tu aprendizaje (${progress}% completado)`}
        </h2>
        <p className={styles.ctaText}>
          {progress === 0
            ? 'Comienza tu viaje por la historia del pensamiento político occidental.'
            : progress === 100
              ? 'Has completado todos los capítulos. ¡Descarga el documento completo para profundizar!'
              : `Tu próximo capítulo: ${nextChapter.icon} ${nextChapter.title}`}
        </p>
        <Link
          href={
            progress === 100
              ? '/curso-teoria-politica/recursos/documento-completo'
              : `/curso-teoria-politica/${nextChapter.module}/${nextChapter.slug}`
          }
          className={styles.ctaButton}
        >
          {progress === 0
            ? '🏛️ Comenzar el curso'
            : progress === 100
              ? '📚 Ver documento completo'
              : '▶️ Continuar aprendiendo'}
        </Link>
      </section>

      <Footer appName="curso-teoria-politica" />
    </div>
  );
}
