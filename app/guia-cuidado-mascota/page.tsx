'use client';

import Link from 'next/link';
import styles from './GuiaCuidadoMascota.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { CourseProvider, useCourse, COURSE_MODULES } from './CourseContext';
import { getRelatedApps } from '@/data/app-relations';

function GuideContent() {
  const { isCompleted, getProgressPercentage, getCompletedCount, getTotalChapters, getTotalDuration } = useCourse();
  const progress = getProgressPercentage();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🐾</span>
        <h1 className={styles.title}>Guía para el Cuidado de tu Mascota</h1>
        <p className={styles.subtitle}>
          Todo lo que necesitas saber para cuidar a tu perro o gato.
          Consejos prácticos, fáciles y cercanos para dueños de todos los niveles.
        </p>
        <a
          href="/videos/guia-cuidado-mascota.mp4"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoButton}
        >
          <span className={styles.videoIcon} aria-hidden="true">▶️</span>
          Ver introducción en video
        </a>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">📚</span>
          <div className={styles.statValue}>{getTotalChapters()}</div>
          <div className={styles.statLabel}>Capítulos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">⏱️</span>
          <div className={styles.statValue}>{getTotalDuration()}</div>
          <div className={styles.statLabel}>Minutos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">✅</span>
          <div className={styles.statValue}>{getCompletedCount()}</div>
          <div className={styles.statLabel}>Completados</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon} aria-hidden="true">📈</span>
          <div className={styles.statValue}>{progress}%</div>
          <div className={styles.statLabel}>Progreso</div>
        </div>
      </div>

      {/* Chapters */}
      <section className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">📖</span> Contenido de la Guía</h2>
        <div className={styles.chaptersGrid}>
          {COURSE_MODULES.map((module) => (
            module.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/guia-cuidado-mascota/${module.id}/${chapter.id}`}
                className={`${styles.chapterCard} ${isCompleted(chapter.id) ? styles.chapterCompleted : ''}`}
              >
                <div className={styles.chapterHeader}>
                  <div className={styles.chapterIcon}>{module.icon}</div>
                  <div className={styles.chapterInfo}>
                    <div className={styles.chapterTitle}>{chapter.title}</div>
                    <div className={styles.chapterDuration}><span aria-hidden="true">⏱️</span> {chapter.duration} min</div>
                  </div>
                </div>
                <div className={styles.chapterTopics}>
                  {chapter.topics.slice(0, 2).map((topic, i) => (
                    <span key={i} className={styles.topicTag}>{topic}</span>
                  ))}
                </div>
              </Link>
            ))
          ))}
        </div>
      </section>

      {/* Related Apps */}
      <section className={styles.appsSection}>
        <h2 className={styles.sectionTitle}><span aria-hidden="true">🧰</span> Herramientas de Mascotas</h2>
        <div className={styles.appsGrid}>
          <Link href="/planificador-mascota/" className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">📋</span>
            <div className={styles.appName}>Planificador</div>
            <div className={styles.appDesc}>Checklist completo</div>
          </Link>
          <Link href="/calculadora-alimentacion-mascotas/" className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">🍖</span>
            <div className={styles.appName}>Alimentación</div>
            <div className={styles.appDesc}>Cuánto debe comer</div>
          </Link>
          <Link href="/orientador-medicamentos-mascotas/" className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">💊</span>
            <div className={styles.appName}>Medicamentos</div>
            <div className={styles.appDesc}>Dosis correctas</div>
          </Link>
          <Link href="/calculadora-tamano-adulto-perro/" className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">📏</span>
            <div className={styles.appName}>Tamaño Adulto</div>
            <div className={styles.appDesc}>Peso de cachorro</div>
          </Link>
          <Link href="/calculadora-edad-mascotas/" className={styles.appCard}>
            <span className={styles.appIcon} aria-hidden="true">🎂</span>
            <div className={styles.appName}>Edad</div>
            <div className={styles.appDesc}>Años humanos</div>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}><span aria-hidden="true">🚀</span> ¡Comienza tu aprendizaje!</h2>
        <p className={styles.ctaText}>
          Aprende todo lo necesario para ser el mejor dueño que tu mascota pueda tener.
        </p>
        <Link href="/guia-cuidado-mascota/preparacion/antes-de-adoptar" className={styles.ctaButton}>
          Empezar la Guía
        </Link>
      </section>

      

      <DisclaimerCard variant="medical" severity="high" collapsible={false} context="guia-cuidado-mascota">
        <p>Esta guía proporciona <strong>información educativa general</strong> sobre cuidado de mascotas:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>No sustituye atención veterinaria</strong>: Consulta siempre con tu veterinario para diagnósticos, vacunas y tratamientos</li>
          <li><strong>Cada mascota es única</strong>: Razas, edades y estados de salud requieren cuidados específicos</li>
        </ul>
        <p className={styles.highlight}><strong><span aria-hidden="true">🐾</span> Ante cualquier emergencia médica de tu mascota, acude inmediatamente a tu veterinario o clínica de urgencias.</strong></p>
      </DisclaimerCard>

      <RelatedApps apps={getRelatedApps('guia-cuidado-mascota')} />

      <ShareCard appName="guia-cuidado-mascota" />
      <Footer appName="guia-cuidado-mascota" />
    </div>
  );
}

export default function GuiaCuidadoMascotaPage() {
  return (
    <CourseProvider>
      <GuideContent />
    </CourseProvider>
  );
}
