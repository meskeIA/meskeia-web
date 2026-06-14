'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoOptimizacionIA.module.css';

export default function LLMsRAGPage() {
  return (
    <ChapterPage chapterId="llms-rag">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🧠</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          Comprender cómo las inteligencias artificiales generativas seleccionan y citan contenido
          se ha convertido en una habilidad estratégica crítica para cualquier creador de contenido.
          Los Large Language Models (LLMs) han transformado radicalmente la forma en que se consume
          información, procesando miles de millones de consultas mensuales en motores de respuesta
          como ChatGPT, Perplexity, Claude y Gemini.
        </p>
        <p>
          Este capítulo te revelará los mecanismos internos que determinan qué fuentes son consideradas
          relevantes y autoritativas en el ecosistema de las IAs generativas, basándose en los patrones
          de citación más recientes y las tendencias actuales del sector.
        </p>
      </section>

      {/* LLMs */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤖</span>
          <h2 className={styles.sectionTitleText}>Los Large Language Models: El Cerebro Digital de la IA</h2>
        </div>
        <p>
          Los Large Language Models representan sistemas computacionales complejos basados en redes
          neuronales profundas entrenadas con billones de parámetros textuales. A diferencia de los
          algoritmos tradicionales de búsqueda que se basan en coincidencias de palabras clave, estos
          sistemas desarrollan una comprensión semántica profunda que les permite interpretar intenciones,
          contextos culturales y matices lingüísticos específicos del español latinoamericano.
        </p>
        <p>
          En su arquitectura fundamental, estos modelos funcionan mediante <strong>transformers</strong>,
          una tecnología que permite analizar secuencias completas de texto de manera simultánea.
          Los modelos más avanzados de proveedores como OpenAI, Anthropic o Google procesan ya
          contextos de cientos de miles de tokens —equivalentes a cientos de páginas de texto—, y
          esa capacidad sigue creciendo con cada nueva generación.
        </p>
        <p>
          Lo que hace especialmente relevante a estos sistemas para creadores de contenido es su capacidad
          de evaluación de autoridad temática. Los LLMs no solo analizan palabras clave, sino que evalúan
          la coherencia argumentativa, la profundidad del análisis, la precisión de los datos citados y
          la originalidad de las perspectivas presentadas.
        </p>

        <div className={styles.highlightBox}>
          <p>
            Estudios recientes revelan que contenido con citas académicas tiene
            <strong> 340% más probabilidades</strong> de ser referenciado por IAs generativas.
          </p>
        </div>

        <p>
          La evolución reciente ha introducido capacidades multimodales avanzadas: los modelos más
          recientes de OpenAI, Google y Anthropic pueden integrar información de gráficos, tablas,
          infografías y documentos PDF.
          Para el mercado hispanohablante, esto significa que contenido visualmente rico, con datos
          estructurados y análisis multidimensional, obtiene ventajas significativas en procesos de
          selección y citación.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo:</strong> Un informe sobre fintech en México que incluya gráficos de adopción
            digital, citas del Banco de México, análisis comparativo con Brasil y Argentina, y proyecciones
            respaldadas por consultoras como McKinsey, será citado consistentemente por modelos como
            Perplexity AI frente a artículos genéricos sobre el tema.
          </p>
        </div>
      </section>

      {/* RAG */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>RAG: El Motor de Búsqueda Inteligente</h2>
        </div>
        <p>
          Retrieval-Augmented Generation representa la evolución más significativa en sistemas de búsqueda
          desde el PageRank de Google. A diferencia de modelos tradicionales que dependen únicamente de
          su entrenamiento, los sistemas RAG ejecutan búsquedas en tiempo real, evalúan múltiples fuentes
          y construyen respuestas contextualizadas con referencias verificables.
        </p>

        <div className={styles.highlightBox}>
          <p>
            Más del <strong>78%</strong> de las respuestas generadas por ChatGPT con navegación
            web utilizan arquitectura RAG.
          </p>
        </div>

        <h3>Las 5 Etapas del Proceso RAG</h3>
        <ol>
          <li><strong>Query Understanding</strong> - Comprensión de la consulta: el sistema interpreta la intención y contexto</li>
          <li><strong>Retrieval</strong> - Recuperación: busca información relevante en bases de datos actualizadas</li>
          <li><strong>Relevance Scoring</strong> - Puntuación: evalúa la calidad y pertinencia de cada fuente</li>
          <li><strong>Re-ranking</strong> - Re-clasificación: prioriza fuentes basándose en autoridad y actualidad</li>
          <li><strong>Generation</strong> - Generación final: construye una respuesta coherente integrando múltiples fuentes</li>
        </ol>

        <p>
          Los algoritmos de puntuación en sistemas RAG evalúan factores específicos: <em>domain authority</em>,
          <em>freshness score</em>, <em>citation density</em>, <em>semantic relevance</em> y
          <em>user engagement metrics</em>.
        </p>

        <div className={styles.highlightBox}>
          <p>
            Investigaciones especializadas han identificado que contenido publicado en dominios con autoridad
            superior a 70 (según Ahrefs) tiene <strong>450% más probabilidades</strong> de citación.
          </p>
        </div>

        <p>
          Para el ecosistema de contenido en español, los sistemas RAG han desarrollado capacidades específicas
          de reconocimiento de autoridades regionales. Fuentes como universidades latinoamericanas prestigiosas,
          instituciones gubernamentales oficiales, medios establecidos y expertos con credenciales verificables
          reciben ponderaciones superiores.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo:</strong> Un análisis sobre inflación en Argentina que cite datos del INDEC,
            incluya perspectivas del BCRA, referencias a economistas reconocidos como Martín Guzmán, y
            compare con indicadores del FMI, será sistemáticamente preferido por sistemas RAG frente a
            análisis genéricos sin fuentes locales verificables.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>Los LLMs procesan hasta 200,000 tokens de contexto, evaluando autoridad temática y coherencia argumentativa</li>
          <li>RAG ejecuta búsquedas en tiempo real con cinco etapas de evaluación y re-ranking de fuentes</li>
          <li>Contenido con citas académicas tiene 340% más probabilidades de ser referenciado por IAs</li>
          <li>Dominios con autoridad superior a 70 obtienen 450% más citaciones en sistemas RAG</li>
          <li>Los algoritmos favorecen fuentes que demuestran comprensión de contextos culturales específicos</li>
        </ul>
      </div>

      {/* Acciones */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar Hoy</h4>
        <ul>
          <li>Implementa un sistema de citación académica en tus artículos, incluyendo al menos 5 referencias verificables por cada 1,000 palabras</li>
          <li>Crea contenido multimodal integrando gráficos con datos de fuentes oficiales como bancos centrales, universidades o instituciones gubernamentales</li>
          <li>Desarrolla una matriz de autoridad temática identificando 10 expertos reconocidos en tu nicho y establece menciones estratégicas</li>
          <li>Configura alertas en Google Scholar y bases de datos académicas para incorporar investigaciones recientes (últimos 12 meses)</li>
          <li>Estructura tu contenido con headers semánticos (H1-H4) y implementa schema markup para facilitar el procesamiento por sistemas RAG</li>
        </ul>
      </div>

      {/* Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Mi contenido incluye al menos 5 fuentes verificables y actualizadas en los últimos 12 meses?</li>
          <li>¿Estoy citando autoridades locales reconocidas en mi región o industria específica?</li>
          <li>¿Mis artículos ofrecen datos únicos o perspectivas originales que no se encuentran en competidores directos?</li>
          <li>¿Tengo implementado schema markup y estructura semántica que facilite el procesamiento por IAs?</li>
          <li>¿Mi autoridad de dominio supera el umbral de 70 puntos según herramientas como Ahrefs o Semrush?</li>
        </ol>
      </div>

      {/* Recursos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔧</span>
          <h2 className={styles.sectionTitleText}>Recursos Recomendados</h2>
        </div>
        <ul>
          <li><strong>Perplexity AI Pro</strong> - Para análisis de patrones de citación</li>
          <li><strong>Google Scholar Alerts</strong> - Para monitoreo de investigaciones recientes</li>
          <li><strong>Ahrefs Content Gap</strong> - Para identificar oportunidades de autoridad temática</li>
          <li><strong>Schema.org Markup Generator</strong> - Para estructura semántica</li>
          <li><strong>Answer The Public</strong> - Para identificar consultas emergentes en español</li>
        </ul>
      </section>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          Anthropic ha documentado que Claude puede procesar el equivalente a &quot;El Quijote&quot;
          completo en una sola consulta (200,000 tokens), permitiendo análisis contextuales de documentos
          extensos que superan la capacidad de comprensión de sistemas tradicionales de búsqueda por
          factores exponenciales.
        </p>
      </div>
    </ChapterPage>
  );
}
