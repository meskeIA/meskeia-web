'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoOptimizacionIA.module.css';

export default function EstructuraSchemaPage() {
  return (
    <ChapterPage chapterId="estructura-schema">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🛠️</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          En el panorama digital actual, la optimización para motores generativos e inteligencia artificial
          (GEO/AEO) ha redefinido completamente las reglas del juego. Mientras que el SEO tradicional se
          enfocaba en posicionamiento en resultados de búsqueda, el GEO busca que las IAs como ChatGPT,
          Claude, Gemini y Copilot seleccionen, comprendan y recomienden nuestro contenido como fuente autorizada.
        </p>

        <div className={styles.highlightBox}>
          <p>
            Los estudios de BrightEdge revelan que el <strong>71%</strong> de las búsquedas generativas
            utilizan contenido estructurado semánticamente, mientras que el <strong>43%</strong> de las respuestas
            de IA provienen de sitios con Schema Markup implementado.
          </p>
        </div>

        <p>
          Esta transformación no es solo técnica, sino conceptual: debemos pensar como las IAs &quot;leen&quot; y
          procesan información, priorizando claridad, estructura lógica y señales semánticas que faciliten
          la comprensión algorítmica.
        </p>
      </section>

      {/* Estructura Semántica */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📐</span>
          <h2 className={styles.sectionTitleText}>Estructura Semántica para Inteligencia Artificial</h2>
        </div>
        <p>
          La arquitectura de contenido para IAs requiere una precisión quirúrgica en la organización
          informacional. Los modelos de lenguaje procesan contenido mediante patrones de reconocimiento
          semántico que valoran la jerarquía clara y la progresión lógica de ideas.
        </p>

        <h3>Jerarquía de Headers Optimizada</h3>
        <ul>
          <li><strong>H1</strong> - Debe funcionar como un &quot;prompt natural&quot;, conteniendo la palabra clave principal y el contexto específico</li>
          <li><strong>H2</strong> - Pilares temáticos que respondan a intenciones específicas: ¿Qué?, ¿Cómo?, ¿Por qué?, ¿Cuándo?</li>
          <li><strong>H3-H6</strong> - Granularidad que las IAs necesitan para extraer fragmentos específicos</li>
        </ul>

        <div className={styles.infoBox}>
          <p>
            <strong>Párrafos óptimos:</strong> Entre 50-80 palabras para facilitar la segmentación algorítmica.
            Las listas numeradas son especialmente poderosas porque las IAs las interpretan como secuencias procesables.
          </p>
        </div>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo de estructura óptima:</strong>
          </p>
          <ul>
            <li>H1: &quot;Estrategias de Marketing Digital para Startups Fintech en Mercados Emergentes&quot;</li>
            <li>H2: &quot;Fundamentos de Marketing Fintech&quot; (con H3: Regulaciones por país, H3: Audiencia objetivo)</li>
            <li>H2: &quot;Canales de Adquisición&quot; (con H3: LinkedIn Ads B2B, H3: Content Marketing, H3: Influencer partnerships)</li>
            <li>H2: &quot;Métricas y Optimización&quot; (con tabla comparativa de herramientas y lista de KPIs)</li>
          </ul>
        </div>
      </section>

      {/* Schema Markup */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏷️</span>
          <h2 className={styles.sectionTitleText}>Schema Markup y Entidades para Visibilidad de IA</h2>
        </div>
        <p>
          El Schema Markup en 2025 funciona como un &quot;traductor universal&quot; entre contenido humano y
          comprensión artificial.
        </p>

        <h3>Tipos de Schema Más Impactantes</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>📝</span>
            <h4>HowTo Schema</h4>
            <p>Aumenta 340% la probabilidad de ser citado en respuestas de IA</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>❓</span>
            <h4>FAQ Schema</h4>
            <p>Genera snippets directos en el 67% de consultas relacionadas</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>📰</span>
            <h4>Article Schema</h4>
            <p>Con propiedades extendidas: author, dateModified, publisher</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🏢</span>
            <h4>Organization</h4>
            <p>Define entidades para el Knowledge Graph</p>
          </div>
        </div>

        <h3>Implementación Efectiva</h3>
        <p>
          La implementación debe ser granular: cada paso de un &quot;HowTo&quot; requiere &quot;name&quot;, &quot;text&quot; e &quot;image&quot;.
          Las FAQs deben anticipar consultas de cola larga e incluir variaciones de preguntas.
        </p>

        <div className={styles.highlightBox}>
          <p>
            El Knowledge Graph moderno valora entidades con múltiples señales de validación: menciones
            consistentes, enlaces a fuentes autoritativas, y conexiones semánticas claras. Cuando sea
            posible, incluye identificadores únicos como <strong>Wikidata IDs</strong>.
          </p>
        </div>

        <div className={styles.exampleBox}>
          <p>
            <strong>Implementación completa para un blog de software:</strong>
          </p>
          <ul>
            <li>FAQ Schema con preguntas como &quot;¿Cómo implementar DevOps efectivamente?&quot;, &quot;¿Cómo implementar CI/CD con GitHub Actions?&quot;</li>
            <li>HowTo Schema para tutorial &quot;Deploying a React App to AWS&quot;: step 1 &quot;Configurar AWS CLI&quot;, step 2 &quot;Crear bucket S3&quot;, etc.</li>
            <li>Article Schema con author entity conectando a LinkedIn, dateModified actualizado mensualmente</li>
          </ul>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>Los H1-H6 funcionan como &quot;prompts naturales&quot; que guían la interpretación de IAs</li>
          <li>Las tablas comparativas y listas numeradas facilitan la extracción directa de datos</li>
          <li>Schema Markup aumenta 340% la probabilidad de citación en respuestas generativas</li>
          <li>Las entidades con identificadores únicos y relaciones claras dominan el Knowledge Graph</li>
          <li>La granularidad semántica supera a la extensión de contenido en relevancia algorítmica</li>
          <li>Los topic clusters interconectados establecen autoridad temática profunda</li>
        </ul>
      </div>

      {/* Acciones */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar Hoy</h4>
        <ul>
          <li>Realiza un Schema Audit de tus 10 páginas más importantes usando Google Rich Results Test</li>
          <li>Crea un Topic Cluster Map identificando tu tema principal y 5-7 subtemas relacionados, con plan de internal linking semántico</li>
          <li>Implementa FAQ Schema en 3 páginas principales, con al menos 5 preguntas por página que reflejen consultas reales</li>
          <li>Desarrolla un Entity Map listando 20 entidades clave de tu nicho con sus Wikidata IDs cuando existan</li>
          <li>Reestructura 5 artículos existentes aplicando jerarquía H1-H6 optimizada, con párrafos de máximo 80 palabras</li>
        </ul>
      </div>

      {/* Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Mi contenido actual permite a una IA extraer respuestas precisas sin ambigüedad contextual?</li>
          <li>¿Qué entidades específicas de mi industria debería &quot;poseer&quot; semánticamente para establecer autoridad?</li>
          <li>¿Mis estructuras de contenido facilitan la segmentación algorítmica para respuestas directas?</li>
          <li>¿Cómo puedo transformar mi expertise en señales semánticas que las IAs reconozcan y valoren?</li>
          <li>¿Mi internal linking crea una red semántica coherente que refuerce mi autoridad temática?</li>
        </ol>
      </div>

      {/* Recursos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔧</span>
          <h2 className={styles.sectionTitleText}>Recursos Recomendados</h2>
        </div>
        <ul>
          <li><strong>Google Rich Results Test</strong> - search.google.com/test/rich-results</li>
          <li><strong>Schema.org documentation</strong> - schema.org</li>
          <li><strong>Merkle Schema Markup Generator</strong> - technicalseo.com/tools/schema-markup-generator</li>
          <li><strong>Wikidata Entity Search</strong> - wikidata.org</li>
          <li><strong>BrightEdge Generative AI Research</strong> - brightedge.com</li>
          <li><strong>Google Search Central AI Guidelines</strong> - developers.google.com/search/docs</li>
        </ul>
      </section>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          Estudios de Conductor revelan que el contenido con Schema Markup tiene
          <strong> 4x más probabilidades</strong> de aparecer en respuestas de ChatGPT y Claude.
          Además, sitios con entidades bien definidas experimentaron un aumento promedio del
          <strong> 156%</strong> en traffic referral de motores generativos comparado con sitios
          sin optimización semántica.
        </p>
      </div>
    </ChapterPage>
  );
}
