'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function MetaAdsPage() {
  return (
    <ChapterPage chapterId="meta-ads">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            Meta Ads (Facebook e Instagram) ha evolucionado dramáticamente en 2025, consolidándose como la plataforma publicitaria más sofisticada del ecosistema digital. Con más de 3.2 mil millones de usuarios activos mensuales y algoritmos de IA que procesan más de 100.000 señales por segundo, estas plataformas ofrecen posibilidades de segmentación y optimización que eran impensables hace apenas dos años. En España, el 78% de las empresas que dominan Meta Ads reportan un crecimiento del 40% o más en sus ventas digitales. Este capítulo te llevará desde los conceptos fundamentales hasta las estrategias avanzadas que están utilizando los profesionales más exitosos en 2025, incluyendo cómo aprovechar las nuevas funcionalidades de IA generativa y automatización inteligente.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estructura de Campañas 3.0: Arquitectura Inteligente</h2>
          <div className={styles.sectionContent}>
            <p>La estructura tradicional de Meta Ads ha evolucionado hacia un modelo más inteligente en 2025. Mantenemos la jerarquía Campaña &gt; Conjunto de Anuncios &gt; Anuncios, pero ahora incorporamos objetivos Advantage+ que utilizan machine learning para optimización automática. Las campañas ahora se configuran por intención de compra (awareness, consideration, conversion), los conjuntos de anuncios aprovechan Detailed Targeting Expansion por defecto, y los anuncios se benefician del Dynamic Creative que combina automáticamente elementos para maximizar performance. La clave es trabajar con el algoritmo, no contra él, proporcionando múltiples variantes para que la IA encuentre las combinaciones ganadoras.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El Corte Inglés ha revolucionado sus campañas en 2025 usando Advantage+ Shopping Campaigns, logrando un 35% más de ROAS comparado con campañas manuales tradicionales, simplificando su estructura de 200 conjuntos de anuncios a solo 20.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Audiencias Inteligentes: Beyond Demographics</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, las audiencias han trascendido los datos demográficos básicos. Meta ahora utiliza señales comportamentales en tiempo real, patrones de navegación cross-device y análisis predictivo de intenciones de compra. Las Advantage+ Audiences combinan automáticamente audiencias guardadas, personalizadas y similares, mientras que las Custom Audiences basadas en eventos específicos del pixel permiten retargeting hiperpersonalizado. Lo más revolucionario son las Value-Based Custom Audiences, que priorizan usuarios con mayor potencial de valor de vida (LTV). La herramienta Analizador GEO de meskeIA puede complementar perfectamente esta segmentación proporcionando insights de comportamiento local.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Zara utiliza Value-Based Lookalike Audiences creadas a partir de sus mejores clientes (top 10% en LTV), logrando un 50% más de conversiones de alto valor comparado con audiencias similares tradicionales.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Creative Excellence en la Era de la IA</h2>
          <div className={styles.sectionContent}>
            <p>Las creatividades ganadoras en 2025 aprovechan la IA generativa pero mantienen el factor humano. Los formatos que mejor convierten son: videos nativos de 6-15 segundos con subtítulos automáticos, carruseles con producto + lifestyle, y anuncios de colección que permiten navegación inmersiva. La regla actual es 80% mobile-first, con creatividades que funcionan sin sonido los primeros 3 segundos. Las herramientas como el Generador de Carruseles de meskeIA permiten crear variaciones profesionales rápidamente. Lo crucial es usar User-Generated Content auténtico combinado con elementos de marca sutiles.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona ha aumentado su engagement un 60% usando videos de 9 segundos protagonizados por empleados reales mostrando productos, con CTA integrados naturalmente en la narrativa.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Optimización Predictiva y Escalado Inteligente</h2>
          <div className={styles.sectionContent}>
            <p>El escalado en 2025 se basa en IA predictiva y automatización inteligente. Meta's Advantage+ Budget Optimization distribuye presupuesto automáticamente entre conjuntos de anuncios con mejor performance. La clave es establecer Cost Controls inteligentes y usar Bid Strategies apropiadas para cada objetivo. Para escalado manual, la nueva regla es incrementos del 25% cada 2-3 días monitoreando Power 5 metrics (ROAS, CPC, CTR, CVR, CPM). Las herramientas como la Calculadora ROI Marketing de meskeIA son fundamentales para tomar decisiones de escalado basadas en datos reales y proyecciones precisas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>La cadena hotelera NH Hotels implementó escalado automático con Advantage+ Budget Optimization, reduciendo el tiempo de gestión un 70% mientras mejoraba el ROAS de 2.8 a 4.2 en temporada alta 2025.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Measurement y Attribution en iOS 17+</h2>
          <div className={styles.sectionContent}>
            <p>Con las limitaciones de iOS 17+ y la eliminación gradual de third-party cookies, la medición en 2025 requiere un enfoque híbrido. Meta's Conversions API es obligatorio para tracking preciso, complementado con UTM parameters avanzados (generados con herramientas como el Generador UTM de meskeIA) y análisis de incrementalidad. El Attribution Settings ahora permite ventanas personalizadas de atribución, mientras que Lift Studies proporcionan medición real de incremento. La clave es combinar datos first-party con modelos estadísticos de atribución mixta.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El marketplace Wallapop ha implementado un sistema de medición híbrido que combina Conversions API, UTMs personalizados y surveys de incrementalidad, logrando medir con 95% de precisión el impacto real de sus campañas de Meta Ads.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Las campañas Advantage+ aprovechan IA para optimización automática superior</li>
            <li>Las audiencias value-based superan significativamente a las demográficas tradicionales</li>
            <li>El contenido nativo y user-generated genera 3x más engagement que contenido branded</li>
            <li>La medición híbrida (Conversions API + UTMs + incrementalidad) es esencial post-iOS 17+</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Implementar Conversions API junto con Pixel de Facebook para tracking completo</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Migrar campañas tradicionales a estructura Advantage+ para mejor performance</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Crear banco de creatividades UGC auténtico con llamadas a la acción naturales</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Configurar UTM parameters avanzados usando herramientas especializadas para mejor atribución</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Estoy aprovechando completamente las capacidades de IA de Meta o sigo gestionando manualmente?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Mi estrategia de measurement actual me permite tomar decisiones de optimización precisas en el ecosistema post-cookies?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2025, las empresas españolas que utilizan campañas Advantage+ reportan un 42% menos de tiempo dedicado a gestión manual y un 38% mejor ROAS comparado con campañas tradicionales, según el último informe de Meta Business España.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
