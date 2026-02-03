'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function EstrategiaContenidosPage() {
  return (
    <ChapterPage chapterId="estrategia-contenidos">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 2025, el marketing de contenidos se ha convertido en el corazón de toda estrategia digital exitosa. Con la saturación de información y el auge de la inteligencia artificial, los consumidores ya no se conforman con contenido genérico: buscan experiencias personalizadas que respondan a sus necesidades específicas en cada momento del proceso de compra. Las empresas españolas que dominan esta disciplina están viendo crecimientos del 300% en engagement y del 150% en conversiones. Este enfoque estratégico no solo atrae audiencia, sino que construye confianza, establece autoridad de marca y genera un ecosistema de contenido que trabaja 24/7 para tu negocio. La diferencia entre una estrategia de contenidos exitosa y una que fracasa radica en entender que cada pieza debe servir un propósito específico dentro del customer journey.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Arquitectura del Funnel de Contenidos 2025</h2>
          <div className={styles.sectionContent}>
            <p>El funnel moderno se estructura en cuatro niveles: TOFU (Descubrimiento), MOFU (Consideración), BOFU (Decisión) y POFU (Fidelización post-compra). En TOFU, creamos contenido que responde a las primeras dudas del usuario utilizando palabras clave de búsqueda amplia. MOFU profundiza en soluciones específicas con contenido comparativo y educativo. BOFU elimina objeciones con pruebas sociales y demostraciones. POFU mantiene la relación con contenido de valor continuo. El Generador de Palabras Clave de meskeAI puede identificar términos específicos para cada etapa.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona Tech utiliza esta arquitectura perfectamente: artículos TOFU sobre alimentación saludable, guías MOFU sobre planificación de menús, ofertas BOFU personalizadas y recetas POFU exclusivas para clientes del club.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Matriz de Formatos por Intención de Usuario</h2>
          <div className={styles.sectionContent}>
            <p>Cada formato debe alinearse con la intención de búsqueda y el momento del customer journey. Para intención informacional (TOFU): posts de blog SEO-optimizados, vídeos educativos, infografías virales. Para intención de investigación (MOFU): webinars, ebooks con lead magnets, comparativas detalladas, calculadoras interactivas. Para intención transaccional (BOFU): landing pages específicas, demos en vivo, estudios de caso, testimonios en vídeo. El contenido debe ser omnicanal pero adaptado a las particularidades de cada plataforma.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cabify España domina esta estrategia: crean contenido TOFU sobre movilidad urbana en su blog, webinars MOFU sobre sostenibilidad para empresas, y landing pages BOFU con calculadoras de ahorro para corporativos utilizando herramientas como la Calculadora ROI Marketing de meskeAI.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Calendario Editorial Basado en Datos</h2>
          <div className={styles.sectionContent}>
            <p>El calendario editorial de 2025 es una herramienta de business intelligence que integra: análisis de tendencias estacionales, momentos de alta intención de compra, eventos del sector, comportamientos de la audiencia y oportunidades de SEO. Debe incluir columnas para: palabra clave objetivo, búsquedas mensuales, dificultad SEO, persona buyer, etapa del funnel, formato, canal de distribución, fecha de publicación, y métricas esperadas. Las herramientas de meskeAI como el Analizador SEO pueden optimizar la selección de keywords y timing.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Zara utiliza un calendario híper-segmentado que combina tendencias de moda, estacionalidad, eventos fashion week y análisis de comportamiento online para crear contenido que anticipa demandas antes que la competencia.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Repurposing Estratégico Multiplataforma</h2>
          <div className={styles.sectionContent}>
            <p>El repurposing inteligente consiste en adaptar un contenido madre a múltiples formatos y canales manteniendo coherencia de mensaje pero optimizando para cada plataforma. Una masterclass puede generar: artículo de blog optimizado SEO, carrusel de LinkedIn con puntos clave, vídeos cortos para TikTok/Instagram, newsletter con insights, infografía para Pinterest, y podcast. La clave está en entender las particularidades de consumo de contenido en cada canal. El Generador de Carruseles de meskeAI facilita la creación de contenido visual para redes sociales.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Thebridge (escuela de tecnología) es referente en repurposing: sus webinars sobre programación se convierten en artículos técnicos en Medium, hilos de Twitter con código, vídeos de YouTube, posts de Instagram con tips visuales y newsletters especializadas por tecnología.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Cada contenido debe tener un propósito específico en el customer journey</li>
            <li>La personalización y segmentación son obligatorias en 2025</li>
            <li>El repurposing estratégico multiplica el ROI hasta un 400%</li>
            <li>Los datos deben guiar todas las decisiones de contenido</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Audita tu contenido actual usando el framework TOFU-MOFU-BOFU-POFU</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Implementa un calendario editorial basado en datos con herramientas meskeAI</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Crea una matriz de repurposing para cada tipo de contenido que produces</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Define KPIs específicos para cada etapa del funnel y mídelos mensualmente</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Cada pieza de contenido que creo tiene un objetivo claro y medible?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Estoy aprovechando al máximo cada contenido a través del repurposing estratégico?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Las empresas que implementan estrategias de contenido basadas en funnels específicos generan un 67% más leads calificados y reducen el coste de adquisición de cliente en un 43%, según datos de ContentMarketing Institute 2025.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
