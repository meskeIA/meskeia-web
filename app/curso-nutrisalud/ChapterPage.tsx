'use client';

import { ReactNode, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './CursoNutrisalud.module.css';
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
  const { markChapterComplete, isChapterCompleted, hasAcceptedConsent, isLoaded } = useCourse();
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Redirigir a la portada del curso si no se ha aceptado el consentimiento.
  //
  // Va en un efecto y espera a `isLoaded` por dos motivos distintos:
  // 1. Navegar es un efecto secundario: hacerlo durante el render se ejecuta dos
  //    veces en StrictMode y dejaría de ocurrir si el componente se memoizara,
  //    y un control de acceso que falla debe hacerlo cerrando, no abriendo.
  // 2. `hasAcceptedConsent` es `false` en el primer render hasta que se lee
  //    localStorage. Sin esperar a `isLoaded`, quien ya había aceptado y entraba
  //    a un capítulo por URL directa (marcador, buscador, recarga) era devuelto a
  //    la portada; solo se libraba al navegar con <Link>, porque entonces el
  //    provider del layout no se remonta y el estado ya estaba cargado.
  useEffect(() => {
    if (isLoaded && !hasAcceptedConsent) {
      router.replace('/curso-nutrisalud');
    }
  }, [isLoaded, hasAcceptedConsent, router]);

  if (!isLoaded || !hasAcceptedConsent) {
    return null;
  }

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
              href={`/curso-nutrisalud/${prevChapter.module}/${prevChapter.slug}`}
              className={styles.navButton}
            >
              ← {prevChapter.title}
            </Link>
          ) : (
            <Link href="/curso-nutrisalud" className={styles.navButton}>
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
              href={`/curso-nutrisalud/${nextChapter.module}/${nextChapter.slug}`}
              className={styles.navButton}
            >
              {nextChapter.title} →
            </Link>
          ) : (
            <Link
              href="/curso-nutrisalud/recursos/glosario"
              className={styles.navButton}
            >
              Glosario →
            </Link>
          )}
        </nav>

        {/* Disclaimer médico */}
        <div className={styles.medicalDisclaimer}>
          <span className={styles.disclaimerIcon}>ℹ️</span>
          <p className={styles.disclaimerText}>
            <strong>Recordatorio:</strong> Este contenido es educativo y no sustituye
            el consejo médico profesional. Consulta con profesionales de la salud
            antes de realizar cambios en tu alimentación.
          </p>
        </div>

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
              href={`/curso-nutrisalud/${prevChapter.module}/${prevChapter.slug}`}
              className={styles.bottomNavLink}
            >
              <div className={styles.bottomNavLabel}>← Anterior</div>
              <div className={styles.bottomNavTitle}>
                {prevChapter.icon} {prevChapter.title}
              </div>
            </Link>
          ) : (
            <Link href="/curso-nutrisalud" className={styles.bottomNavLink}>
              <div className={styles.bottomNavLabel}>← Volver</div>
              <div className={styles.bottomNavTitle}>🥗 Inicio del curso</div>
            </Link>
          )}

          {nextChapter ? (
            <Link
              href={`/curso-nutrisalud/${nextChapter.module}/${nextChapter.slug}`}
              className={`${styles.bottomNavLink} ${styles.next}`}
            >
              <div className={styles.bottomNavLabel}>Siguiente →</div>
              <div className={styles.bottomNavTitle}>
                {nextChapter.icon} {nextChapter.title}
              </div>
            </Link>
          ) : (
            <Link
              href="/curso-nutrisalud/recursos/glosario"
              className={`${styles.bottomNavLink} ${styles.next}`}
            >
              <div className={styles.bottomNavLabel}>Siguiente →</div>
              <div className={styles.bottomNavTitle}>📖 Glosario Nutricional</div>
            </Link>
          )}
        </div>
      </div>

      <Footer appName="curso-nutrisalud" />
    </div>
  );
}
