'use client';

import Link from 'next/link';
import styles from './CursoEmprendimiento.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { CHAPTERS, TOOLS, useCourse } from './CourseContext';

export default function CursoEmprendimientoPage() {
  const { getProgressPercentage, isChapterCompleted } = useCourse();
  const progressPercent = getProgressPercentage();
  const completedCount = CHAPTERS.filter(ch => isChapterCompleted(ch.id)).length;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>🚀</div>
        <h1 className={styles.title}>Curso de Emprendimiento Práctico</h1>
        <p className={styles.subtitle}>
          Aprende a crear, validar y lanzar tu idea de negocio con metodología práctica.
          6 capítulos + herramientas interactivas para convertir tu idea en realidad.
        </p>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statValue}>6</div>
          <div className={styles.statLabel}>Capítulos</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏱️</div>
          <div className={styles.statValue}>2h 20m</div>
          <div className={styles.statLabel}>Duración total</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛠️</div>
          <div className={styles.statValue}>3</div>
          <div className={styles.statLabel}>Herramientas</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statValue}>{progressPercent}%</div>
          <div className={styles.statLabel}>Tu progreso</div>
        </div>
      </div>

      {/* Overview */}
      <section className={styles.overviewSection}>
        <h2 className={styles.sectionTitle}>
          <span>📖</span> ¿Qué aprenderás?
        </h2>
        <p className={styles.overviewText}>
          Este curso te guiará paso a paso desde la identificación de una oportunidad de negocio
          hasta la validación de tu modelo. Aprenderás las metodologías más utilizadas por startups
          exitosas como Lean Startup, Design Thinking y Business Model Generation. Todo explicado
          con ejemplos reales de empresas españolas como Glovo, Wallapop, Zara o Mercadona.
        </p>

        <div className={styles.methodologyGrid}>
          <div className={styles.methodCard}>
            <div className={styles.methodIcon}>🎯</div>
            <div className={styles.methodTitle}>Lean Startup</div>
            <div className={styles.methodDesc}>Construir-Medir-Aprender</div>
          </div>
          <div className={styles.methodCard}>
            <div className={styles.methodIcon}>💭</div>
            <div className={styles.methodTitle}>Design Thinking</div>
            <div className={styles.methodDesc}>Centrado en el usuario</div>
          </div>
          <div className={styles.methodCard}>
            <div className={styles.methodIcon}>🎨</div>
            <div className={styles.methodTitle}>Business Model Canvas</div>
            <div className={styles.methodDesc}>Modelo visual de negocio</div>
          </div>
        </div>
      </section>

      {/* Chapters */}
      <section className={styles.chaptersSection}>
        <h2 className={styles.sectionTitle}>
          <span>🎓</span> Capítulos del curso
        </h2>

        <div className={styles.chaptersGrid}>
          {CHAPTERS.map((chapter) => {
            const completed = isChapterCompleted(chapter.id);
            return (
              <Link
                key={chapter.id}
                href={`/curso-emprendimiento/capitulo/${chapter.slug}`}
                className={styles.chapterCard}
              >
                <div className={styles.chapterHeader}>
                  <div className={styles.chapterNumber}>
                    {completed ? '✓' : chapter.id}
                  </div>
                  <div className={styles.chapterInfo}>
                    <h3 className={styles.chapterTitle}>
                      {chapter.icon} {chapter.title}
                    </h3>
                    <span className={styles.chapterDuration}>
                      {chapter.duration} · {chapter.subtitle}
                    </span>
                  </div>
                </div>
                <p className={styles.chapterDesc}>{chapter.description}</p>
                <div className={styles.chapterTopics}>
                  {chapter.topics.map((topic, idx) => (
                    <span key={idx} className={styles.topicTag}>{topic}</span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tools */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span>🛠️</span> Herramientas Interactivas
        </h2>

        <div className={styles.toolsGrid}>
          {TOOLS.map((tool) => (
            <Link key={tool.id} href={tool.href} className={styles.toolCard}>
              <div className={styles.toolIcon}>{tool.icon}</div>
              <div className={styles.toolName}>{tool.name}</div>
              <div className={styles.toolDesc}>{tool.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {completedCount === 0
            ? '¿Listo para empezar?'
            : completedCount === 6
              ? '¡Felicidades! Has completado el curso'
              : `Continúa donde lo dejaste (${completedCount}/6)`
          }
        </h2>
        <p className={styles.ctaText}>
          {completedCount === 0
            ? 'Comienza tu viaje emprendedor con el primer capítulo'
            : completedCount === 6
              ? 'Ahora es momento de poner en práctica todo lo aprendido'
              : 'Sigue avanzando en tu formación como emprendedor'
          }
        </p>
        <Link
          href={
            completedCount === 6
              ? '/curso-emprendimiento/herramientas/business-model-canvas'
              : `/curso-emprendimiento/capitulo/${CHAPTERS[Math.min(completedCount, 5)].slug}`
          }
          className={styles.ctaButton}
        >
          {completedCount === 0
            ? '🚀 Empezar el curso'
            : completedCount === 6
              ? '🎨 Crear mi Canvas'
              : '▶️ Continuar'
          }
        </Link>
      </section>

      <Footer appName="curso-emprendimiento" />
    </div>
  );
}
