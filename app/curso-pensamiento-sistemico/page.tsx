'use client';

import Link from 'next/link';
import styles from './CursoPensamientoSistemico.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'fundamentos': '📚',
  'conceptos-clave': '🔧',
  'sistemas-accion': '🌐',
  'aplicacion-practica': '🎯'
};

const MODULE_COLORS: Record<string, string> = {
  'fundamentos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'conceptos-clave': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'sistemas-accion': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'aplicacion-practica': 'linear-gradient(135deg, #2E86AB, #7FB3D3)'
};

export default function CursoPensamientoSistemicoPage() {
  const { isCompleted, getProgressPercentage, getCompletedCount, getTotalChapters, getTotalDuration, modules } = useCourse();

  const progress = getProgressPercentage();
  const completedCount = getCompletedCount();
  const totalChapters = getTotalChapters();
  const totalDuration = getTotalDuration();

  // Contador de capítulos para numerar globalmente
  let globalChapterIndex = 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔄</span>
        <h1 className={styles.title}>Curso de Pensamiento Sistémico</h1>
        <p className={styles.subtitle}>
          Aprende a entender el mundo como sistemas interconectados.
          Descubre cómo las partes se relacionan para formar totalidades complejas y aplica este enfoque a tu vida personal y profesional.
        </p>
        <a
          href="/videos/curso-pensamiento-sistemico.mp4"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoButton}
        >
          <span className={styles.videoIcon}>▶️</span>
          Ver introducción en video
        </a>
      </header>

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
            <p>Historia y bases del pensamiento sistémico</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🔧</span>
            <h3>Conceptos Clave</h3>
            <p>Redes, retroalimentación, emergencia, antifragilidad</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🌐</span>
            <h3>Sistemas en Acción</h3>
            <p>Organizaciones, economía, tecnología, clima</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🎯</span>
            <h3>Aplicación Práctica</h3>
            <p>Herramientas, decisiones y liderazgo sistémico</p>
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
                      href={`/curso-pensamiento-sistemico/${module.id}/${chapter.id}`}
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
        <h2 className={styles.ctaTitle}>¿Listo para pensar en sistemas?</h2>
        <p className={styles.ctaText}>
          Comienza con el primer capítulo y descubre cómo el pensamiento sistémico puede transformar tu forma de ver el mundo.
        </p>
        <Link
          href="/curso-pensamiento-sistemico/fundamentos/que-es-pensamiento-sistemico"
          className={styles.ctaButton}
        >
          Comenzar Curso →
        </Link>
      </section>

      {/* Recursos adicionales */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>📖 Cursos Relacionados</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/curso-pensamiento-cientifico" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>🔬</span>
            <div className={styles.resourceName}>Pensamiento Científico</div>
            <div className={styles.resourceDesc}>Aprende a usar el método científico</div>
          </Link>
          <Link href="/curso-decisiones-inversion" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📈</span>
            <div className={styles.resourceName}>Decisiones de Inversión</div>
            <div className={styles.resourceDesc}>Aplica el pensamiento sistémico a finanzas</div>
          </Link>
        </div>
      </section>

      <Footer appName="curso-pensamiento-sistemico" />
    </div>
  );
}
