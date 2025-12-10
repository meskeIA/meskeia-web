'use client';

import Link from 'next/link';
import styles from './HerenciasPasoPaso.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse } from './CourseContext';

// Iconos y colores por módulo
const MODULE_ICONS: Record<string, string> = {
  'primeros-pasos': '🚀',
  'herederos': '👥',
  'inventario': '📋',
  'impuestos': '💰',
  'tramites-finales': '📝',
  'glosario': '📚'
};

const MODULE_COLORS: Record<string, string> = {
  'primeros-pasos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'herederos': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'inventario': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'impuestos': 'linear-gradient(135deg, #E67E22, #F39C12)',
  'tramites-finales': 'linear-gradient(135deg, #10B981, #059669)',
  'glosario': 'linear-gradient(135deg, #6366F1, #8B5CF6)'
};

// Herramientas vinculadas al curso
const LINKED_TOOLS = [
  { name: 'Guía Tramitación Herencias', url: '/guia-tramitacion-herencias/', icon: '📋', desc: 'Checklist interactivo de documentos' },
  { name: 'Calculadora Sucesiones Nacional', url: '/calculadora-sucesiones-nacional/', icon: '🇪🇸', desc: 'Impuesto en 14 CCAA' },
  { name: 'Calculadora Sucesiones Cataluña', url: '/calculadora-sucesiones-cataluna/', icon: '🏴', desc: 'Normativa específica catalana' }
];

export default function HerenciasPasoPasoPage() {
  const { modules, isCompleted, getProgressPercentage, getCompletedCount, getTotalChapters, getTotalDuration } = useCourse();

  const progress = getProgressPercentage();
  const completedCount = getCompletedCount();
  const totalChapters = getTotalChapters();
  const totalDuration = getTotalDuration();

  // Encontrar el primer capítulo no completado o el primero
  const getFirstUncompletedChapter = () => {
    for (const module of modules) {
      for (const chapter of module.chapters) {
        if (!isCompleted(chapter.id)) {
          return { moduleId: module.id, chapterId: chapter.id };
        }
      }
    }
    // Si todos están completados, devolver el primero
    return { moduleId: modules[0].id, chapterId: modules[0].chapters[0].id };
  };

  const firstChapter = getFirstUncompletedChapter();

  // Calcular progreso por módulo
  const getModuleProgress = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    const completed = module.chapters.filter(ch => isCompleted(ch.id)).length;
    return Math.round((completed / module.chapters.length) * 100);
  };

  // Contador global de capítulos
  let globalChapterIndex = 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>📜</span>
        <h1 className={styles.title}>Herencias Paso a Paso</h1>
        <p className={styles.subtitle}>
          Guía práctica para tramitar una herencia en España. Aprende qué hacer, en qué orden,
          y qué impuestos pagar. Explicado de forma sencilla para que puedas gestionarlo con confianza.
        </p>
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
          <div className={styles.statValue}>{completedCount}</div>
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
        <h2 className={styles.sectionTitle}>📋 ¿Qué aprenderás?</h2>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🚀</span>
            <h3>Primeros Pasos</h3>
            <p>Qué hacer en los primeros días y cómo saber si hay testamento</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>👥</span>
            <h3>Herederos</h3>
            <p>Quién tiene derecho a heredar y cómo aceptar o renunciar</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>💰</span>
            <h3>Impuestos</h3>
            <p>Impuesto de Sucesiones, plusvalía y otros gastos a considerar</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📝</span>
            <h3>Trámites</h3>
            <p>Escritura, registro y cambio de titularidad paso a paso</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta guía proporciona <strong>orientación general</strong> sobre el proceso de tramitación
          de herencias en España. <strong>NO constituye asesoramiento legal, fiscal ni notarial</strong>.
          Cada caso tiene particularidades que requieren valoración profesional.
        </p>
      </div>

      {/* Modules Section */}
      <section className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}>📖 Contenido del Curso</h2>

        {modules.map((module) => {
          const moduleProgress = getModuleProgress(module.id);
          return (
            <div key={module.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <div
                  className={styles.moduleIcon}
                  style={{ background: MODULE_COLORS[module.id] || MODULE_COLORS['primeros-pasos'] }}
                >
                  {MODULE_ICONS[module.id] || '📚'}
                </div>
                <div className={styles.moduleInfo}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleSubtitle}>{module.chapters.length} capítulo{module.chapters.length > 1 ? 's' : ''}</p>
                </div>
                <div className={styles.moduleProgress}>{moduleProgress}%</div>
              </div>

              <div className={styles.chaptersGrid}>
                {module.chapters.map((chapter) => {
                  globalChapterIndex++;
                  const completed = isCompleted(chapter.id);
                  return (
                    <Link
                      key={chapter.id}
                      href={`/herencias-paso-a-paso/${module.id}/${chapter.id}`}
                      className={`${styles.chapterCard} ${completed ? styles.chapterCompleted : ''}`}
                    >
                      <div className={styles.chapterHeader}>
                        <div className={styles.chapterNumber}>{globalChapterIndex}</div>
                        <div className={styles.chapterInfo}>
                          <h4 className={styles.chapterTitle}>{chapter.title}</h4>
                          <p className={styles.chapterDuration}>⏱️ {chapter.duration} min</p>
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
        <h2 className={styles.ctaTitle}>
          {completedCount === 0 ? '🚀 ¡Comienza tu Aprendizaje!' : '📖 Continúa donde lo dejaste'}
        </h2>
        <p className={styles.ctaText}>
          {completedCount === 0
            ? 'Aprende a tramitar una herencia paso a paso, con explicaciones claras y ejemplos prácticos.'
            : `Has completado ${completedCount} de ${totalChapters} capítulos. ¡Sigue avanzando!`
          }
        </p>
        <Link
          href={`/herencias-paso-a-paso/${firstChapter.moduleId}/${firstChapter.chapterId}`}
          className={styles.ctaButton}
        >
          {completedCount === 0 ? 'Comenzar Guía' : 'Continuar Guía'}
        </Link>
      </section>

      {/* Resources Section - Herramientas Vinculadas */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>🛠️ Herramientas para Practicar</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Usa estas herramientas de meskeIA para calcular impuestos y consultar la documentación necesaria.
        </p>
        <div className={styles.resourcesGrid}>
          {LINKED_TOOLS.map((tool) => (
            <Link key={tool.url} href={tool.url} className={styles.resourceCard}>
              <span className={styles.resourceIcon}>{tool.icon}</span>
              <div className={styles.resourceName}>{tool.name}</div>
              <div className={styles.resourceDesc}>{tool.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <Footer appName="herencias-paso-a-paso" />
    </div>
  );
}
