'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import styles from './CursoOptimizacionIA.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse, getChapterById, getNextChapter, getPreviousChapter } from './CourseContext';

interface ChapterPageProps {
  chapterId: string;
  children: ReactNode;
}

export default function ChapterPage({ chapterId, children }: ChapterPageProps) {
  const { isCompleted, markAsCompleted, markAsIncomplete, getProgressPercentage, getCompletedCount, getTotalChapters } = useCourse();

  const chapterData = getChapterById(chapterId);
  const nextChapter = getNextChapter(chapterId);
  const prevChapter = getPreviousChapter(chapterId);

  if (!chapterData) {
    return <div>Capítulo no encontrado</div>;
  }

  const { chapter, module } = chapterData;
  const completed = isCompleted(chapterId);
  const progress = getProgressPercentage();

  const handleComplete = () => {
    if (completed) {
      markAsIncomplete(chapterId);
    } else {
      markAsCompleted(chapterId);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <div className={styles.chapterContainer}>
        {/* Hero */}
        <header className={styles.chapterHero}>
          <span className={styles.chapterHeroIcon}>🤖</span>
          <h1 className={styles.chapterHeroTitle}>{chapter.title}</h1>
          <p className={styles.chapterHeroSubtitle}>{module.title}</p>
          <div className={styles.chapterMeta}>
            <span>⏱️ {chapter.duration} min de lectura</span>
            <span>📊 Progreso: {progress}%</span>
          </div>
        </header>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {prevChapter ? (
            <Link
              href={`/curso-optimizacion-ia/${prevChapter.module.id}/${prevChapter.chapter.id}`}
              className={styles.navButton}
            >
              ← Anterior
            </Link>
          ) : (
            <Link href="/curso-optimizacion-ia" className={styles.navButton}>
              ← Índice
            </Link>
          )}

          <div className={styles.navProgress}>
            <div className={styles.navProgressText}>{getCompletedCount()}/{getTotalChapters()}</div>
            <div className={styles.navProgressLabel}>completados</div>
          </div>

          {nextChapter ? (
            <Link
              href={`/curso-optimizacion-ia/${nextChapter.module.id}/${nextChapter.chapter.id}`}
              className={styles.navButton}
            >
              Siguiente →
            </Link>
          ) : (
            <Link href="/curso-optimizacion-ia" className={styles.navButton}>
              Finalizar →
            </Link>
          )}
        </nav>

        {/* Content */}
        {children}

        {/* Complete Button */}
        <div className={styles.completeSection}>
          <button
            onClick={handleComplete}
            className={`${styles.completeButton} ${completed ? styles.completed : ''}`}
          >
            {completed ? '✓ Capítulo Completado' : '✓ Marcar como Completado'}
          </button>
        </div>

        {/* Bottom Navigation */}
        <nav className={styles.bottomNavigation}>
          {prevChapter ? (
            <Link
              href={`/curso-optimizacion-ia/${prevChapter.module.id}/${prevChapter.chapter.id}`}
              className={styles.bottomNavLink}
            >
              <div className={styles.bottomNavLabel}>← Anterior</div>
              <div className={styles.bottomNavTitle}>{prevChapter.chapter.title}</div>
            </Link>
          ) : (
            <Link href="/curso-optimizacion-ia" className={styles.bottomNavLink}>
              <div className={styles.bottomNavLabel}>← Volver</div>
              <div className={styles.bottomNavTitle}>Índice del Curso</div>
            </Link>
          )}

          {nextChapter ? (
            <Link
              href={`/curso-optimizacion-ia/${nextChapter.module.id}/${nextChapter.chapter.id}`}
              className={`${styles.bottomNavLink} ${styles.next}`}
            >
              <div className={styles.bottomNavLabel}>Siguiente →</div>
              <div className={styles.bottomNavTitle}>{nextChapter.chapter.title}</div>
            </Link>
          ) : (
            <Link href="/curso-optimizacion-ia" className={`${styles.bottomNavLink} ${styles.next}`}>
              <div className={styles.bottomNavLabel}>Finalizar →</div>
              <div className={styles.bottomNavTitle}>Volver al Índice</div>
            </Link>
          )}
        </nav>
      </div>

      <Footer appName="curso-optimizacion-ia" />
    </div>
  );
}
