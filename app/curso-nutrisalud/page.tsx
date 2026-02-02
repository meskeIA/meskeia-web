'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './CursoNutrisalud.module.css';
import { MeskeiaLogo, Footer, DisclaimerCard, LastUpdated, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  MODULES,
  CHAPTERS,
  RESOURCES,
  useCourse,
  getChaptersByModule,
  getTotalDuration,
} from './CourseContext';

// Componente Modal de Consentimiento Médico
function ConsentModal() {
  const { acceptConsent, declineConsent } = useCourse();
  const [checks, setChecks] = useState({
    educational: false,
    notMedical: false,
    professional: false,
    responsibility: false,
  });

  const allChecked = Object.values(checks).every(Boolean);

  const handleChange = (key: keyof typeof checks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.consentOverlay}>
      <div className={styles.consentModal}>
        <div className={styles.consentHeader}>
          <span className={styles.consentIcon}>🩺</span>
          <h2 className={styles.consentTitle}>Antes de continuar</h2>
          <p className={styles.consentSubtitle}>
            Información importante sobre el Curso de Nutrición
          </p>
          <a
            href="/videos/curso-nutrisalud.mp4"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.videoButton}
          >
            <span className={styles.videoIcon}>▶️</span>
            Ver introducción en video
          </a>
        </div>

        <div className={styles.consentBody}>
          <div className={styles.importantNotice}>
            <h3>⚠️ Aviso Médico Importante</h3>
            <p>
              Este Curso de Nutrición es una herramienta educativa e informativa que proporciona
              conocimiento nutricional basado en literatura científica. El contenido
              está diseñado para fines de educación general y culturización sobre
              nutrición.
            </p>
          </div>

          <div className={styles.consentRequirements}>
            <h3>Por favor, confirma que entiendes lo siguiente:</h3>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checks.educational}
                  onChange={() => handleChange('educational')}
                />
                <span className={styles.checkboxLabel}>
                  <strong>Contenido educativo:</strong> Este curso proporciona
                  información nutricional con fines puramente educativos y de
                  divulgación científica.
                </span>
              </label>

              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checks.notMedical}
                  onChange={() => handleChange('notMedical')}
                />
                <span className={styles.checkboxLabel}>
                  <strong>No sustituye consejo médico:</strong> Esta información NO
                  sustituye el diagnóstico, tratamiento o asesoramiento de un
                  profesional de la salud cualificado.
                </span>
              </label>

              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checks.professional}
                  onChange={() => handleChange('professional')}
                />
                <span className={styles.checkboxLabel}>
                  <strong>Consulta profesional:</strong> Antes de realizar cambios
                  significativos en mi alimentación o si tengo condiciones médicas,
                  consultaré con un profesional de la salud.
                </span>
              </label>

              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={checks.responsibility}
                  onChange={() => handleChange('responsibility')}
                />
                <span className={styles.checkboxLabel}>
                  <strong>Responsabilidad personal:</strong> Entiendo que las
                  decisiones sobre mi salud y alimentación son mi responsabilidad y
                  que debo buscar asesoramiento profesional cuando sea necesario.
                </span>
              </label>
            </div>

            <div className={styles.emergencyNotice}>
              <strong>🚨 En caso de emergencia médica:</strong> Contacta inmediatamente
              con servicios de emergencia (112 en España) o acude al centro de salud
              más cercano. No utilices esta información para autodiagnóstico.
            </div>
          </div>

          <div className={styles.legalLinks}>
            Al continuar, aceptas los{' '}
            <a href="/terminos" target="_blank" rel="noopener noreferrer">
              Términos de Uso
            </a>{' '}
            y la{' '}
            <a href="/privacidad" target="_blank" rel="noopener noreferrer">
              Política de Privacidad
            </a>{' '}
            de meskeIA.
          </div>
        </div>

        <div className={styles.consentFooter}>
          <button onClick={declineConsent} className={styles.btnDecline}>
            No acepto, salir
          </button>
          <button
            onClick={acceptConsent}
            className={styles.btnAccept}
            disabled={!allChecked}
          >
            {allChecked
              ? 'Acepto y quiero aprender'
              : 'Marca todas las casillas para continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function CursoNutrisaludPage() {
  const { hasAcceptedConsent, getProgressPercentage, isChapterCompleted } = useCourse();

  const progress = getProgressPercentage();
  const completedCount = CHAPTERS.filter((ch) => isChapterCompleted(ch.id)).length;
  const totalDuration = getTotalDuration();

  // Si no ha aceptado el consentimiento, mostrar modal
  if (!hasAcceptedConsent) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <ConsentModal />
      </div>
    );
  }

  // Determinar el siguiente capítulo a estudiar
  const nextChapter = CHAPTERS.find((ch) => !isChapterCompleted(ch.id)) || CHAPTERS[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🥗</span>
        <h1 className={styles.title}>Curso de Nutrición</h1>
        <p className={styles.subtitle}>
          Conocimiento nutricional avanzado basado en ciencia.
          Más allá de los consejos básicos que ya conoces.
        </p>
      </header>

      <LastUpdated lastUpdate="2 de febrero de 2026" />

      <DisclaimerCard variant="medical" severity="low" collapsible={true} context="curso-nutrisalud">
        <p>Este curso es una <strong>herramienta educativa</strong> basada en evidencia científica:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>No sustituye consejo médico profesional</strong>: El contenido es informativo, no prescriptivo</li>
          <li><strong>Consulta con profesionales de la salud</strong>: Antes de realizar cambios significativos en tu alimentación o estilo de vida</li>
        </ul>
      </DisclaimerCard>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📚</span>
          <div className={styles.statValue}>{MODULES.length}</div>
          <div className={styles.statLabel}>Módulos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📖</span>
          <div className={styles.statValue}>{CHAPTERS.length}</div>
          <div className={styles.statLabel}>Capítulos</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏱️</span>
          <div className={styles.statValue}>{Math.round(totalDuration / 60)}h</div>
          <div className={styles.statLabel}>Duración Total</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📊</span>
          <div className={styles.statValue}>{progress}%</div>
          <div className={styles.statLabel}>
            {completedCount}/{CHAPTERS.length} completados
          </div>
        </div>
      </div>

      {/* Módulos y Capítulos */}
      <section className={styles.modulesSection}>
        <h2 className={styles.sectionTitle}>📚 Contenido del Curso</h2>

        {MODULES.map((module) => {
          const moduleChapters = getChaptersByModule(module.slug);
          return (
            <div key={module.id} className={styles.moduleCard}>
              <div className={styles.moduleHeader}>
                <div
                  className={styles.moduleIcon}
                  style={{ background: `${module.color}20` }}
                >
                  {module.icon}
                </div>
                <div className={styles.moduleInfo}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleSubtitle}>{module.subtitle}</p>
                </div>
              </div>

              <div className={styles.chaptersGrid}>
                {moduleChapters.map((chapter) => {
                  const completed = isChapterCompleted(chapter.id);
                  return (
                    <Link
                      key={chapter.id}
                      href={`/curso-nutrisalud/${chapter.module}/${chapter.slug}`}
                      className={`${styles.chapterCard} ${completed ? styles.chapterCompleted : ''}`}
                    >
                      <div className={styles.chapterHeader}>
                        <span className={styles.chapterNumber}>{chapter.id}</span>
                        <div className={styles.chapterInfo}>
                          <h4 className={styles.chapterTitle}>
                            {chapter.icon} {chapter.title}
                          </h4>
                          <span className={styles.chapterDuration}>
                            {chapter.duration}
                          </span>
                        </div>
                      </div>
                      <p className={styles.chapterDesc}>{chapter.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Recursos */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>📖 Recursos Adicionales</h2>
        <div className={styles.resourcesGrid}>
          {RESOURCES.map((resource) => (
            <Link
              key={resource.id}
              href={resource.href}
              className={styles.resourceCard}
            >
              <span className={styles.resourceIcon}>{resource.icon}</span>
              <h3 className={styles.resourceName}>{resource.name}</h3>
              <p className={styles.resourceDesc}>{resource.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {progress === 0
            ? '¿Listo para empezar?'
            : progress === 100
              ? '¡Enhorabuena! Has completado el curso'
              : `Continúa tu aprendizaje (${progress}% completado)`}
        </h2>
        <p className={styles.ctaText}>
          {progress === 0
            ? 'Comienza tu viaje hacia una nutrición consciente y basada en ciencia.'
            : progress === 100
              ? 'Has completado todos los capítulos. ¡Revisa el glosario para reforzar conceptos!'
              : `Tu próximo capítulo: ${nextChapter.icon} ${nextChapter.title}`}
        </p>
        <Link
          href={
            progress === 100
              ? '/curso-nutrisalud/recursos/glosario'
              : `/curso-nutrisalud/${nextChapter.module}/${nextChapter.slug}`
          }
          className={styles.ctaButton}
        >
          {progress === 0
            ? 'Comenzar el curso'
            : progress === 100
              ? 'Ver Glosario'
              : 'Continuar aprendiendo'}
        </Link>
      </section>

      <RelatedApps apps={getRelatedApps('curso-nutrisalud')} />

      <Footer appName="curso-nutrisalud" />
    </div>
  );
}
