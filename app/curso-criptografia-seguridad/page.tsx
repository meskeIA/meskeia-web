'use client';

import Link from 'next/link';
import styles from './CursoCriptografiaSeguridad.module.css';
import { MeskeiaLogo, Footer } from '@/components';
import { useCourse } from './CourseContext';

// Iconos y colores por módulo
const MODULE_ICONS: Record<string, string> = {
  'historia': '📜',
  'fundamentos': '🔑',
  'hashes': '🔢',
  'contrasenas': '🛡️',
  'seguridad-avanzada': '🚀'
};

const MODULE_COLORS: Record<string, string> = {
  'historia': 'linear-gradient(135deg, #8B7355, #A08060)',
  'fundamentos': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'hashes': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'contrasenas': 'linear-gradient(135deg, #10B981, #059669)',
  'seguridad-avanzada': 'linear-gradient(135deg, #6366F1, #8B5CF6)'
};

// Herramientas vinculadas al curso
const LINKED_TOOLS = [
  { name: 'Cifrado Clásico', url: '/cifrado-clasico/', icon: '🏛️', desc: 'César y cifrados históricos' },
  { name: 'Cifrado Vigenère', url: '/cifrado-vigenere/', icon: '🔐', desc: 'Cifrado polialfabético' },
  { name: 'Cifrado Playfair', url: '/cifrado-playfair/', icon: '🔲', desc: 'Cifrado por matriz' },
  { name: 'Cifrado Transposición', url: '/cifrado-transposicion/', icon: '🔀', desc: 'Reordenación de letras' },
  { name: 'Codificador Base64', url: '/codificador-base64/', icon: '📝', desc: 'Codificación de texto' },
  { name: 'Cifrado AES', url: '/cifrado-aes/', icon: '🔒', desc: 'Cifrado moderno estándar' },
  { name: 'Generador de Hashes', url: '/generador-hashes/', icon: '🔢', desc: 'MD5, SHA-1, SHA-256...' },
  { name: 'Generador de Contraseñas', url: '/generador-contrasenas/', icon: '🔑', desc: 'Contraseñas seguras' }
];

export default function CursoCriptografiaSeguridadPage() {
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
        <span className={styles.heroIcon}>🔐</span>
        <h1 className={styles.title}>Curso de Criptografía y Seguridad</h1>
        <p className={styles.subtitle}>
          Domina los fundamentos de la criptografía: desde cifrados históricos como César y Vigenère
          hasta técnicas modernas como AES y SHA-256. Aprende practicando con herramientas reales.
        </p>
        <a
          href="https://youtu.be/ML8dP8yihBw"
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
            <span className={styles.overviewIcon}>📜</span>
            <h3>Historia</h3>
            <p>Desde César hasta Enigma: la evolución de los cifrados</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🔑</span>
            <h3>Fundamentos</h3>
            <p>Cifrado simétrico, asimétrico y el estándar AES</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🔢</span>
            <h3>Hashes</h3>
            <p>MD5, SHA-256 y verificación de integridad</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🛡️</span>
            <h3>Seguridad</h3>
            <p>Contraseñas seguras, 2FA y buenas prácticas</p>
          </div>
        </div>
      </section>

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
                  style={{ background: MODULE_COLORS[module.id] || MODULE_COLORS['fundamentos'] }}
                >
                  {MODULE_ICONS[module.id] || '📚'}
                </div>
                <div className={styles.moduleInfo}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleSubtitle}>{module.chapters.length} capítulos</p>
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
                      href={`/curso-criptografia-seguridad/${module.id}/${chapter.id}`}
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
            ? 'Descubre el fascinante mundo de la criptografía, desde sus orígenes hasta las técnicas modernas.'
            : `Has completado ${completedCount} de ${totalChapters} capítulos. ¡Sigue avanzando!`
          }
        </p>
        <Link
          href={`/curso-criptografia-seguridad/${firstChapter.moduleId}/${firstChapter.chapterId}`}
          className={styles.ctaButton}
        >
          {completedCount === 0 ? 'Comenzar Curso' : 'Continuar Curso'}
        </Link>
      </section>

      {/* Resources Section - Herramientas Vinculadas */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>🛠️ Herramientas para Practicar</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
          Cada capítulo incluye enlaces a estas herramientas para que puedas practicar lo aprendido.
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

      <Footer appName="curso-criptografia-seguridad" />
    </div>
  );
}
