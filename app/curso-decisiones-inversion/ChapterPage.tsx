'use client';

import { ReactNode, useRef } from 'react';
import Link from 'next/link';
import styles from './CursoInversion.module.css';
import { MeskeiaLogo, Footer, TextToSpeech } from '@/components';
import { CHAPTERS, useCourse } from './CourseContext';

interface ChapterSection {
  title: string;
  icon: string;
  content: ReactNode;
}

interface ChapterPageProps {
  slug: string;
  sections: ChapterSection[];
}

export default function ChapterPage({ slug, sections }: ChapterPageProps) {
  const { markChapterComplete, isChapterCompleted } = useCourse();
  const contentRef = useRef<HTMLDivElement>(null);

  const currentChapter = CHAPTERS.find((ch) => ch.slug === slug);
  const currentIndex = CHAPTERS.findIndex((ch) => ch.slug === slug);
  const prevChapter = currentIndex > 0 ? CHAPTERS[currentIndex - 1] : null;
  const nextChapter = currentIndex < CHAPTERS.length - 1 ? CHAPTERS[currentIndex + 1] : null;

  if (!currentChapter) {
    return <div>Capítulo no encontrado</div>;
  }

  const isCompleted = isChapterCompleted(currentChapter.id);

  const handleComplete = () => {
    if (!isCompleted) {
      markChapterComplete(currentChapter.id);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <div className={styles.chapterContainer}>
        {/* Hero */}
        <header className={styles.chapterHero}>
          <div className={styles.chapterHeroIcon}>{currentChapter.icon}</div>
          <h1 className={styles.chapterHeroTitle}>{currentChapter.title}</h1>
          <p className={styles.chapterHeroSubtitle}>
            {currentChapter.subtitle} · {currentChapter.duration}
          </p>
        </header>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {prevChapter ? (
            <Link
              href={`/curso-decisiones-inversion/${prevChapter.slug}`}
              className={styles.navButton}
            >
              ← {prevChapter.title}
            </Link>
          ) : (
            <Link href="/curso-decisiones-inversion" className={styles.navButton}>
              ← Inicio del curso
            </Link>
          )}

          <div className={styles.navCenter}>
            <div className={styles.navProgress}>
              <div className={styles.navProgressText}>
                {currentChapter.id} de {CHAPTERS.length}
              </div>
              <div className={styles.navProgressLabel}>Progreso del curso</div>
            </div>
            <TextToSpeech contentRef={contentRef} resetKey={slug} />
          </div>

          {nextChapter ? (
            <Link
              href={`/curso-decisiones-inversion/${nextChapter.slug}`}
              className={styles.navButton}
            >
              {nextChapter.title} →
            </Link>
          ) : (
            <Link href="/curso-decisiones-inversion/recursos/glosario" className={styles.navButton}>
              Recursos →
            </Link>
          )}
        </nav>

        {/* Disclaimer para capítulos financieros específicos */}
        {['productos-financieros', 'estrategias-inversion', 'aspectos-fiscales', 'casos-practicos'].includes(slug) && (
          <div className={styles.disclaimer}>
            <h3>⚠️ Aviso Importante</h3>
            <p>
              Este contenido es educativo e informativo. NO constituye asesoramiento de inversión.
              Consulta con un profesional antes de tomar decisiones financieras.
            </p>
          </div>
        )}

        {/* Content Sections */}
        <div ref={contentRef}>
          {sections.map((section, index) => (
            <section key={index} className={styles.contentSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <h2 className={styles.sectionTitleText}>{section.title}</h2>
              </div>
              {section.content}
            </section>
          ))}
        </div>

        {/* Complete Button */}
        <div className={styles.completeSection}>
          <button
            onClick={handleComplete}
            className={`${styles.completeButton} ${isCompleted ? styles.completed : ''}`}
            disabled={isCompleted}
          >
            {isCompleted ? '✓ Capítulo completado' : 'Marcar como completado'}
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className={styles.bottomNavigation}>
          {prevChapter ? (
            <Link
              href={`/curso-decisiones-inversion/${prevChapter.slug}`}
              className={styles.bottomNavLink}
            >
              <div className={styles.bottomNavLabel}>← Anterior</div>
              <div className={styles.bottomNavTitle}>
                {prevChapter.icon} {prevChapter.title}
              </div>
            </Link>
          ) : (
            <Link href="/curso-decisiones-inversion" className={styles.bottomNavLink}>
              <div className={styles.bottomNavLabel}>← Volver</div>
              <div className={styles.bottomNavTitle}>📊 Inicio del curso</div>
            </Link>
          )}

          {nextChapter ? (
            <Link
              href={`/curso-decisiones-inversion/${nextChapter.slug}`}
              className={`${styles.bottomNavLink} ${styles.next}`}
            >
              <div className={styles.bottomNavLabel}>Siguiente →</div>
              <div className={styles.bottomNavTitle}>
                {nextChapter.icon} {nextChapter.title}
              </div>
            </Link>
          ) : (
            <Link
              href="/curso-decisiones-inversion/recursos/glosario"
              className={`${styles.bottomNavLink} ${styles.next}`}
            >
              <div className={styles.bottomNavLabel}>Siguiente →</div>
              <div className={styles.bottomNavTitle}>📖 Glosario Financiero</div>
            </Link>
          )}
        </div>
      </div>

      <Footer appName="curso-decisiones-inversion" />
    </div>
  );
}
