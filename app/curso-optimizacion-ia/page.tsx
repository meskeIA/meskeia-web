'use client';

import Link from 'next/link';
import styles from './CursoOptimizacionIA.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { useCourse, COURSE_MODULES } from './CourseContext';

const MODULE_ICONS: Record<string, string> = {
  'paradigma': '🔄',
  'como-piensan': '🧠',
  'eeat': '⭐',
  'optimizacion': '🛠️',
  'plataformas': '🤖',
  'medicion': '📊'
};

const MODULE_COLORS: Record<string, string> = {
  'paradigma': 'linear-gradient(135deg, #2E86AB, #48A9A6)',
  'como-piensan': 'linear-gradient(135deg, #48A9A6, #7FB3D3)',
  'eeat': 'linear-gradient(135deg, #7FB3D3, #2E86AB)',
  'optimizacion': 'linear-gradient(135deg, #2E86AB, #7FB3D3)',
  'plataformas': 'linear-gradient(135deg, #48A9A6, #2E86AB)',
  'medicion': 'linear-gradient(135deg, #7FB3D3, #48A9A6)'
};

export default function CursoOptimizacionIAPage() {
  const { isCompleted, getProgressPercentage, getCompletedCount, getTotalChapters, getTotalDuration, modules } = useCourse();

  const progress = getProgressPercentage();
  const completedCount = getCompletedCount();
  const totalChapters = getTotalChapters();
  const totalDuration = getTotalDuration();

  // Contador de módulos para numerar capítulos globalmente
  let globalChapterIndex = 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🤖</span>
        <h1 className={styles.title}>Curso de Optimización para IAs</h1>
        <p className={styles.subtitle}>
          Domina GEO y AEO: el nuevo paradigma del posicionamiento digital.
          Aprende cómo funcionan ChatGPT, Claude, Perplexity, Gemini y Grok, y optimiza tu contenido para que las IAs lo citen.
        </p>
        <a
          href="/videos/curso-optimizacion-ia.mp4"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.videoButton}
        >
          <span className={styles.videoIcon}>▶️</span>
          Ver introducción en video
        </a>
      </header>

      <LegalNotice />

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
            <span className={styles.overviewIcon}>🔄</span>
            <h3>Nuevo Paradigma</h3>
            <p>De SEO tradicional a GEO/AEO: el cambio de era</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🧠</span>
            <h3>Cómo Piensan</h3>
            <p>LLMs, RAG y el proceso de citación de las IAs</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>⭐</span>
            <h3>E-E-A-T</h3>
            <p>Experiencia, Expertise, Autoridad y Confianza</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🛠️</span>
            <h3>Optimización</h3>
            <p>Estructura, Schema Markup y entidades</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>🤖</span>
            <h3>Plataformas</h3>
            <p>ChatGPT, Perplexity, Gemini, AI Overviews</p>
          </div>
          <div className={styles.overviewCard}>
            <span className={styles.overviewIcon}>📊</span>
            <h3>Medición</h3>
            <p>Cómo saber si las IAs citan tu contenido</p>
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
                  style={{ background: MODULE_COLORS[module.id] || MODULE_COLORS['paradigma'] }}
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
                      href={`/curso-optimizacion-ia/${module.id}/${chapter.id}`}
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

      {/* Tabla comparativa GEO vs SEO */}
      <section className={styles.comparativaSection}>
        <h2 className={styles.sectionTitle}>⚖️ GEO/AEO vs SEO Tradicional</h2>
        <p className={styles.comparativaIntro}>
          Entiende las diferencias clave entre el posicionamiento clásico y la optimización para IAs generativas.
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>SEO Tradicional</th>
                <th>GEO / AEO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Objetivo</strong></td>
                <td>Aparecer en las primeras posiciones de Google</td>
                <td>Ser citado como fuente autorizada por IAs</td>
              </tr>
              <tr>
                <td><strong>Motor de destino</strong></td>
                <td>Google, Bing, Yahoo</td>
                <td>ChatGPT, Claude, Gemini, Grok, Perplexity</td>
              </tr>
              <tr>
                <td><strong>Factor clave</strong></td>
                <td>Palabras clave y backlinks</td>
                <td>Autoridad temática, E-E-A-T y estructura semántica</td>
              </tr>
              <tr>
                <td><strong>Formato de contenido</strong></td>
                <td>Artículos optimizados para clics</td>
                <td>Respuestas directas, datos verificables, Q&amp;A estructurado</td>
              </tr>
              <tr>
                <td><strong>Medición</strong></td>
                <td>Rankings, CTR, tráfico orgánico</td>
                <td>Citation Quality Index, frecuencia de citación cross-platform</td>
              </tr>
              <tr>
                <td><strong>Actualización</strong></td>
                <td>Revisiones puntuales</td>
                <td>Actualización sistemática obligatoria (trimestral mínimo)</td>
              </tr>
              <tr>
                <td><strong>Schema Markup</strong></td>
                <td>Opcional, mejora rich snippets</td>
                <td>Crítico: HowTo, FAQ y Article Schema aumentan citación un 4x</td>
              </tr>
              <tr>
                <td><strong>Contexto cultural</strong></td>
                <td>Relevancia secundaria</td>
                <td>Determinante: contenido local supera traducciones genéricas en &gt;300%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>❓ Preguntas Frecuentes sobre GEO/AEO</h2>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h4>¿Necesito abandonar el SEO tradicional para hacer GEO?</h4>
            <p>
              No. GEO y SEO son complementarios, no excluyentes. El SEO sigue siendo imprescindible para
              generar tráfico orgánico desde Google, que a su vez construye la autoridad de dominio que
              los sistemas IA también valoran. La estrategia óptima es implementar ambos en paralelo,
              priorizando GEO en contenidos de alto expertise y SEO en contenidos de alta demanda de búsqueda.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cuánto tiempo tarda en notarse la optimización GEO?</h4>
            <p>
              Los resultados en GEO son más lentos que en SEO: normalmente entre 3 y 6 meses para contenido
              nuevo. Sin embargo, las plataformas con acceso web en tiempo real como Perplexity y ChatGPT
              pueden indexar contenido nuevo en días. La autoridad temática —el factor más determinante—
              se construye progresivamente a lo largo de meses con publicaciones consistentes.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Qué plataforma de IA es más importante para empezar?</h4>
            <p>
              Depende de tu audiencia. Para contenido generalista, ChatGPT y Perplexity tienen el mayor
              alcance. Para contenido empresarial/profesional, Microsoft Copilot y Claude son clave.
              Para actualidad y redes sociales, Grok es estratégico. La recomendación es optimizar primero
              para Perplexity (cita fuentes de forma visible y comparte ingresos) y ChatGPT (mayor base de usuarios).
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Funciona el Schema Markup para todos los sistemas de IA?</h4>
            <p>
              Los sistemas que rastrean la web en tiempo real (Perplexity, ChatGPT Search, Gemini) se
              benefician directamente del Schema Markup. Los modelos de base que no hacen búsqueda web
              activa no lo leen en tiempo real, pero el Schema mejora la indexación en Google, que es
              fuente de entrenamiento para muchos modelos. Es una inversión que vale para ambos mundos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Es necesario publicar en inglés para ser citado por las IAs?</h4>
            <p>
              No, y de hecho el español representa una oportunidad: menos del 8% de las citaciones globales
              en IAs son en español, pese a ser el segundo idioma más hablado del mundo. Los creadores
              hispanohablantes que optimizan para GEO compiten en un espacio mucho menos saturado.
              El contenido con expertise regional específico (España, México, Argentina...) tiene
              ventaja adicional frente a traducciones genéricas del inglés.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h4>¿Cómo sé si una IA está citando mi contenido?</h4>
            <p>
              Herramientas como Perplexity AI (busca tu marca/URL directamente), BrightEdge AI Tracker
              y Semrush AI Overview Monitor permiten rastrear menciones. La forma más directa es
              preguntar a los propios modelos: &quot;¿Cuáles son las mejores fuentes sobre [tu tema]?&quot; o
              &quot;¿Qué dicen los expertos sobre [tu especialidad]?&quot; y ver si apareces. También puedes
              pegar tu URL y pedir a la IA que evalúe su calidad y citabilidad.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Listo para dominar el nuevo SEO?</h2>
        <p className={styles.ctaText}>
          Comienza con el primer capítulo y descubre cómo optimizar tu contenido para la era de las IAs.
        </p>
        <Link
          href="/curso-optimizacion-ia/paradigma/seo-a-geo"
          className={styles.ctaButton}
        >
          Comenzar Curso →
        </Link>
      </section>

      {/* Recursos adicionales */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>🔧 Herramientas Relacionadas</h2>
        <div className={styles.resourcesGrid}>
          <Link href="/analizador-geo" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>🎯</span>
            <div className={styles.resourceName}>Analizador GEO/AEO</div>
            <div className={styles.resourceDesc}>Analiza tu contenido con nuestro scoring</div>
          </Link>
          <Link href="/generador-schema-markup" className={styles.resourceCard}>
            <span className={styles.resourceIcon}>📝</span>
            <div className={styles.resourceName}>Generador Schema</div>
            <div className={styles.resourceDesc}>Crea datos estructurados para tu web</div>
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('curso-optimizacion-ia')} />
      <ShareCard appName="curso-optimizacion-ia" />
      <Footer appName="curso-optimizacion-ia" />
    </div>
  );
}
