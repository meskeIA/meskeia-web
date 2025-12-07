'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function GoogleAdsPage() {
  return (
    <ChapterPage chapterId="google-ads">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 2025, Google Ads se ha consolidado como la herramienta de publicidad digital más sofisticada del mercado, impulsada por inteligencia artificial avanzada y capacidades de automatización sin precedentes. Con más del 85% del mercado de búsquedas en España, dominar esta plataforma significa acceso directo a tu audiencia objetivo en el momento preciso de decisión de compra. Este capítulo te guiará a través de las estrategias más efectivas del año, desde la optimización con IA generativa hasta la implementación de campañas omnicanal que maximizan cada euro invertido.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Search Ads: Dominando la Intención de Compra con IA</h2>
          <div className={styles.sectionContent}>
            <p>Las Search Ads en 2025 han evolucionado hacia la hiperpersonalización mediante IA generativa. Google ahora interpreta contexto semántico, intención emocional y momento del customer journey con precisión quirúrgica. La clave está en crear grupos de anuncios ultraespecíficos, utilizando extensiones dinámicas y títulos adaptativos que respondan a consultas conversacionales. Las nuevas funciones de Responsive Search Ads aprenden en tiempo real, optimizando automáticamente títulos y descripciones según el perfil del usuario. Implementa match types inteligentes que equilibren alcance y relevancia, y aprovecha las sugerencias de palabras clave impulsadas por IA.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Una asesoría fiscal madrileña utiliza el Generador de Palabras Clave de meskeIA para identificar términos como 'declaración renta autónomos Madrid 2025' (CPC: €2.30, volumen: 8.100 búsquedas/mes), logrando un CTR del 12% versus el 3.5% del sector.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Performance Max: El Ecosistema Publicitario Unificado</h2>
          <div className={styles.sectionContent}>
            <p>Performance Max representa la revolución de la publicidad automatizada en 2025, integrando todos los inventarios de Google (Search, Display, YouTube, Gmail, Discovery y Shopping) en una sola campaña inteligente. El algoritmo utiliza señales de conversión en tiempo real, datos de audiencia y Asset Groups optimizados para mostrar el anuncio correcto, en el momento preciso, al usuario ideal. La estrategia ganadora consiste en proporcionar al menos 15 assets creativos diversos, configurar objetivos de conversión específicos y utilizar audiencias de primera mano combinadas con segmentos similares potenciados por IA. Las campañas Performance Max bien configuradas pueden generar un 30% más de conversiones que las campañas tradicionales.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Décimas, la cadena española de moda deportiva, implementó Performance Max con catálogo completo y creatividades estacionales, aumentando su ROAS de 3.2 a 5.8 en seis meses, con especial éxito en YouTube Shorts y Discovery.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Display y Remarketing: Construcción de Marca Inteligente</h2>
          <div className={styles.sectionContent}>
            <p>El display advertising en 2025 se centra en experiencias inmersivas y remarketing predictivo. Las nuevas capacidades incluyen anuncios interactivos, realidad aumentada integrada y personalización dinámica basada en comportamiento multicanal. El remarketing avanzado utiliza machine learning para predecir el momento óptimo de reconexión, segmentando audiencias por probabilidad de conversión y lifetime value. Implementa listas de remarketing por valor del cliente, crea secuencias de anuncios que cuenten una historia de marca y utiliza formatos rich media que generen engagement auténtico.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El Corte Inglés utiliza remarketing predictivo combinado con datos de CRM, mostrando productos complementarios a usuarios que compraron en tienda física, logrando un incremento del 40% en el valor promedio del pedido online.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategia Multiplataforma: Google Ads vs Meta Ads en 2025</h2>
          <div className={styles.sectionContent}>
            <p>La decisión entre Google Ads y Meta Ads debe basarse en objetivos específicos y momento del customer journey. Google Ads domina la captura de demanda activa y conversiones directas, especialmente efectivo para servicios B2B, e-commerce de productos específicos y búsquedas transaccionales. Meta Ads sobresale en discovery, construcción de audiencia y engagement emocional, ideal para marcas de consumo, productos innovadores y targeting demográfico avanzado. La estrategia óptima en 2025 combina ambas plataformas: Meta para awareness y consideración, Google para conversión y retención. Utiliza la Calculadora ROI Marketing de meskeIA para comparar performance y asignar presupuesto de manera data-driven.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Freshly Cosmetics ejecuta una estrategia híbrida: Meta Ads para descubrimiento de producto con contenido de skincare routine (CPM: €4.20), trasladando usuarios a Google Search donde captura intenciones de compra específicas (CPC: €0.85), logrando un ROAS conjunto del 6.2.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>IA generativa transforma la personalización publicitaria en tiempo real</li>
            <li>Performance Max unifica todos los inventarios de Google en una estrategia cohesiva</li>
            <li>Remarketing predictivo mejora la eficiencia de reconexión con audiencias valiosas</li>
            <li>Estrategias multiplataforma maximizan el ROI combinando fortalezas de Google y Meta</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Implementa el Generador de Palabras Clave y Analizador SEO de meskeIA para investigación competitiva</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Configura Performance Max con mínimo 15 assets creativos y objetivos de conversión específicos</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Diseña secuencias de remarketing basadas en valor del cliente y probabilidad de conversión</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Utiliza la Calculadora ROI Marketing para optimizar distribución de presupuesto entre plataformas</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Estás aprovechando las capacidades de IA de Google Ads para optimización automática o sigues gestionando manualmente?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tu estrategia publicitaria considera el customer journey completo o se enfoca solo en conversiones inmediatas?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2025, las campañas que utilizan IA generativa para crear assets creativos dinámicos obtienen un 47% más de engagement y un 23% mejor CTR que las campañas con creatividades estáticas, según datos de Google España.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
