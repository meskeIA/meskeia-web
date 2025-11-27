'use client';

import Link from 'next/link';
import styles from './CursoInversion.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { CHAPTERS, TOOLS, RESOURCES, useCourse } from './CourseContext';

export default function CursoDecisionesInversionPage() {
  const { getProgressPercentage, isChapterCompleted } = useCourse();
  const progressPercent = getProgressPercentage();
  const completedCount = CHAPTERS.filter(ch => isChapterCompleted(ch.id)).length;
  const totalDuration = CHAPTERS.reduce((acc, ch) => {
    const mins = parseInt(ch.duration);
    return acc + mins;
  }, 0);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>📊</div>
        <h1 className={styles.title}>Curso de Decisiones de Inversión</h1>
        <p className={styles.subtitle}>
          Aprende a invertir desde cero con metodología profesional. 10 capítulos con
          contenido práctico, herramientas interactivas y casos reales para construir
          y gestionar tu cartera de inversión.
        </p>
      </header>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📚</div>
          <div className={styles.statValue}>10</div>
          <div className={styles.statLabel}>Capítulos</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏱️</div>
          <div className={styles.statValue}>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</div>
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

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Este curso tiene fines exclusivamente educativos e informativos. El contenido
          NO constituye asesoramiento financiero, fiscal ni de inversión profesional.
          Las decisiones de inversión conllevan riesgos, incluyendo la posible pérdida
          del capital invertido. Antes de invertir, consulta con un asesor financiero
          profesional autorizado. Los resultados pasados no garantizan rendimientos futuros.
        </p>
      </div>

      {/* Overview */}
      <section className={styles.overviewSection}>
        <h2 className={styles.sectionTitle}>
          <span>📖</span> ¿Qué aprenderás?
        </h2>
        <p className={styles.overviewText}>
          Este curso te guiará paso a paso desde los conceptos básicos de inversión hasta
          la gestión avanzada de una cartera. Aprenderás a entender los mercados financieros,
          conocer los diferentes productos de inversión, desarrollar estrategias adaptadas a
          tu perfil y gestionar el riesgo de forma profesional. Todo con ejemplos prácticos
          y enfocado en el contexto español.
        </p>

        <div className={styles.methodologyGrid}>
          <div className={styles.methodCard}>
            <div className={styles.methodIcon}>📈</div>
            <div className={styles.methodTitle}>Productos</div>
            <div className={styles.methodDesc}>Acciones, bonos, ETFs, fondos</div>
          </div>
          <div className={styles.methodCard}>
            <div className={styles.methodIcon}>⚖️</div>
            <div className={styles.methodTitle}>Riesgo</div>
            <div className={styles.methodDesc}>Gestión y diversificación</div>
          </div>
          <div className={styles.methodCard}>
            <div className={styles.methodIcon}>🎯</div>
            <div className={styles.methodTitle}>Estrategias</div>
            <div className={styles.methodDesc}>Value, growth, dividendos</div>
          </div>
          <div className={styles.methodCard}>
            <div className={styles.methodIcon}>🧠</div>
            <div className={styles.methodTitle}>Psicología</div>
            <div className={styles.methodDesc}>Control emocional</div>
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
                href={`/curso-decisiones-inversion/${chapter.slug}`}
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
          <span>🛠️</span> Herramientas Complementarias
        </h2>
        <p className={styles.overviewText}>
          Pon en práctica lo aprendido con estas calculadoras y simuladores.
        </p>

        <div className={styles.toolsGrid}>
          {TOOLS.map((tool) => (
            tool.available ? (
              <Link key={tool.id} href={tool.href} className={styles.toolCard}>
                <div className={styles.toolIcon}>{tool.icon}</div>
                <div className={styles.toolName}>{tool.name}</div>
                <div className={styles.toolDesc}>{tool.description}</div>
                <div className={styles.toolExternal}>Abrir herramienta →</div>
              </Link>
            ) : (
              <div key={tool.id} className={`${styles.toolCard} ${styles.disabled}`}>
                <span className={styles.toolBadge}>Próximamente</span>
                <div className={styles.toolIcon}>{tool.icon}</div>
                <div className={styles.toolName}>{tool.name}</div>
                <div className={styles.toolDesc}>{tool.description}</div>
              </div>
            )
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>
          <span>📚</span> Recursos Adicionales
        </h2>

        <div className={styles.resourcesGrid}>
          {RESOURCES.map((resource) => (
            <Link key={resource.id} href={resource.href} className={styles.resourceCard}>
              <div className={styles.resourceIcon}>{resource.icon}</div>
              <div className={styles.resourceName}>{resource.name}</div>
              <div className={styles.resourceDesc}>{resource.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {completedCount === 0
            ? '¿Listo para empezar a invertir?'
            : completedCount === 10
              ? '¡Felicidades! Has completado el curso'
              : `Continúa donde lo dejaste (${completedCount}/10)`
          }
        </h2>
        <p className={styles.ctaText}>
          {completedCount === 0
            ? 'Comienza tu formación como inversor con el primer capítulo'
            : completedCount === 10
              ? 'Ahora tienes las herramientas para tomar decisiones de inversión informadas'
              : 'Sigue avanzando en tu formación financiera'
          }
        </p>
        <Link
          href={
            completedCount === 10
              ? '/interes-compuesto/'
              : `/curso-decisiones-inversion/${CHAPTERS[Math.min(completedCount, 9)].slug}`
          }
          className={styles.ctaButton}
        >
          {completedCount === 0
            ? '📚 Empezar el curso'
            : completedCount === 10
              ? '📈 Usar calculadora'
              : '▶️ Continuar'
          }
        </Link>
      </section>

      <Footer appName="curso-decisiones-inversion" />
    </div>
  );
}
