'use client';

import Link from 'next/link';
import { ReactNode, useRef } from 'react';
import styles from './CursoEmprendimiento.module.css';
import { MeskeiaLogo, Footer, TextToSpeech } from '@/components';
import { CHAPTERS, useCourse } from './CourseContext';

interface ChapterSection {
  title: string;
  icon?: string;
  content: ReactNode;
}

interface ChapterPageProps {
  slug: string;
  sections: ChapterSection[];
}

export default function ChapterPage({ slug, sections }: ChapterPageProps) {
  const { markChapterComplete, isChapterCompleted } = useCourse();
  const contentRef = useRef<HTMLDivElement>(null);

  const chapter = CHAPTERS.find(ch => ch.slug === slug);
  const chapterIndex = CHAPTERS.findIndex(ch => ch.slug === slug);
  const prevChapter = chapterIndex > 0 ? CHAPTERS[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < CHAPTERS.length - 1 ? CHAPTERS[chapterIndex + 1] : null;

  if (!chapter) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <div className={styles.hero}>
          <h1>Capítulo no encontrado</h1>
        </div>
        <Footer key="pie" appName="curso-emprendimiento" />
      </div>
    );
  }

  const completed = isChapterCompleted(chapter.id);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Header del capítulo */}
      <div className={styles.chapterHero}>
        <div className={styles.chapterBreadcrumb}>
          <Link href="/curso-emprendimiento">Curso</Link>
          <span>›</span>
          <span>Capítulo {chapter.id}</span>
        </div>
        <h1 className={styles.chapterMainTitle}>
          <span>{chapter.icon}</span>
          {chapter.title}: {chapter.subtitle}
          <span className={styles.chapterBadge}>{chapter.duration}</span>
        </h1>
        <p className={styles.chapterIntro}>{chapter.description}</p>
        <div className={styles.ttsWrapper}>
          <TextToSpeech contentRef={contentRef} resetKey={slug} />
        </div>
      </div>

      {/* Contenido */}
      <div ref={contentRef}>
        {sections.map((section, idx) => (
          <section key={idx} className={styles.contentSection}>
            <h2>
              {section.icon && <span>{section.icon}</span>}
              {section.title}
            </h2>
            {section.content}
          </section>
        ))}
      </div>

      {/* Marcar como completado */}
      <div className={styles.completeSection}>
        <button
          onClick={() => markChapterComplete(chapter.id)}
          className={`${styles.completeButton} ${completed ? styles.completed : ''}`}
          disabled={completed}
        >
          {completed ? '✓ Capítulo completado' : '✓ Marcar como completado'}
        </button>
      </div>

      {/* Navegación */}
      <nav className={styles.chapterNav}>
        {prevChapter ? (
          <Link href={`/curso-emprendimiento/${prevChapter.slug}`} className={styles.navButton}>
            <span className={styles.navArrow}>←</span>
            <div>
              <div className={styles.navButtonLabel}>Anterior</div>
              <div className={styles.navButtonTitle}>{prevChapter.icon} {prevChapter.title}</div>
            </div>
          </Link>
        ) : (
          <Link href="/curso-emprendimiento" className={styles.navButton}>
            <span className={styles.navArrow}>←</span>
            <div>
              <div className={styles.navButtonLabel}>Volver al</div>
              <div className={styles.navButtonTitle}>📚 Índice del curso</div>
            </div>
          </Link>
        )}

        {nextChapter ? (
          <Link href={`/curso-emprendimiento/${nextChapter.slug}`} className={`${styles.navButton} ${styles.next}`}>
            <div>
              <div className={styles.navButtonLabel}>Siguiente</div>
              <div className={styles.navButtonTitle}>{nextChapter.icon} {nextChapter.title}</div>
            </div>
            <span className={styles.navArrow}>→</span>
          </Link>
        ) : (
          <Link href="/curso-emprendimiento/herramientas/business-model-canvas" className={`${styles.navButton} ${styles.next}`}>
            <div>
              <div className={styles.navButtonLabel}>Siguiente paso</div>
              <div className={styles.navButtonTitle}>🎨 Crear mi Canvas</div>
            </div>
            <span className={styles.navArrow}>→</span>
          </Link>
        )}
      </nav>

      <Footer key="pie" appName="curso-emprendimiento" />
    </div>
  );
}
