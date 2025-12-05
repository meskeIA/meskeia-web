'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import styles from './CursoTeoriaPolitica.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import {
  CHAPTERS,
  useCourse,
  getNextChapter,
  getPreviousChapter,
} from './CourseContext';

interface ChapterPageProps {
  chapterId: number;
  children: ReactNode;
}

export default function ChapterPage({ chapterId, children }: ChapterPageProps) {
  const { markChapterComplete, isChapterCompleted, getProgressPercentage } = useCourse();

  const chapter = CHAPTERS.find((ch) => ch.id === chapterId);
  const prevChapter = getPreviousChapter(chapterId);
  const nextChapter = getNextChapter(chapterId);
  const completed = isChapterCompleted(chapterId);
  const progress = getProgressPercentage();

  if (!chapter) {
    return <div>Capítulo no encontrado</div>;
  }

  const handleComplete = () => {
    if (!completed) {
      markChapterComplete(chapterId);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <div className={styles.chapterContainer}>
        {/* Hero */}
        <header className={styles.chapterHero}>
          <span className={styles.chapterHeroIcon}>{chapter.icon}</span>
          <h1 className={styles.chapterHeroTitle}>{chapter.title}</h1>
          <p className={styles.chapterHeroSubtitle}>{chapter.subtitle}</p>
          <div className={styles.chapterMeta}>
            <span>⏱️ {chapter.duration}</span>
            <span>📚 Capítulo {chapter.id} de {CHAPTERS.length}</span>
          </div>
        </header>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {prevChapter ? (
            <Link
              href={`/curso-teoria-politica/${prevChapter.module}/${prevChapter.slug}`}
              className={styles.navButton}
            >
              ← {prevChapter.title}
            </Link>
          ) : (
            <Link href="/curso-teoria-politica" className={styles.navButton}>
              ← Índice
            </Link>
          )}

          <div className={styles.navProgress}>
            <div className={styles.navProgressText}>{progress}%</div>
            <div className={styles.navProgressLabel}>Progreso</div>
          </div>

          {nextChapter ? (
            <Link
              href={`/curso-teoria-politica/${nextChapter.module}/${nextChapter.slug}`}
              className={styles.navButton}
            >
              {nextChapter.title} →
            </Link>
          ) : (
            <Link
              href="/curso-teoria-politica/recursos/documento-completo"
              className={styles.navButton}
            >
              Recursos →
            </Link>
          )}
        </nav>

        {/* Content */}
        {children}

        {/* Complete Section */}
        <div className={styles.completeSection}>
          <button
            onClick={handleComplete}
            className={`${styles.completeButton} ${completed ? styles.completed : ''}`}
            disabled={completed}
          >
            {completed ? '✓ Capítulo completado' : '✓ Marcar como completado'}
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className={styles.bottomNavigation}>
          {prevChapter ? (
            <Link
              href={`/curso-teoria-politica/${prevChapter.module}/${prevChapter.slug}`}
              className={styles.bottomNavLink}
            >
              <div className={styles.bottomNavLabel}>← Anterior</div>
              <div className={styles.bottomNavTitle}>
                {prevChapter.icon} {prevChapter.title}
              </div>
            </Link>
          ) : (
            <Link href="/curso-teoria-politica" className={styles.bottomNavLink}>
              <div className={styles.bottomNavLabel}>← Volver</div>
              <div className={styles.bottomNavTitle}>🏛️ Índice del curso</div>
            </Link>
          )}

          {nextChapter ? (
            <Link
              href={`/curso-teoria-politica/${nextChapter.module}/${nextChapter.slug}`}
              className={`${styles.bottomNavLink} ${styles.next}`}
            >
              <div className={styles.bottomNavLabel}>Siguiente →</div>
              <div className={styles.bottomNavTitle}>
                {nextChapter.icon} {nextChapter.title}
              </div>
            </Link>
          ) : (
            <Link
              href="/curso-teoria-politica/recursos/documento-completo"
              className={`${styles.bottomNavLink} ${styles.next}`}
            >
              <div className={styles.bottomNavLabel}>Recursos →</div>
              <div className={styles.bottomNavTitle}>📚 Documento completo</div>
            </Link>
          )}
        </div>
      </div>

      <Footer appName="curso-teoria-politica" />
    </div>
  );
}
