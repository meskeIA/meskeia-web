'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function CampanaIntegralPage() {
  return (
    <ChapterPage chapterId="campana-integral">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 2025, el marketing digital ha evolucionado hacia una disciplina hiperconectada donde la personalización masiva y la inteligencia artificial convergen para crear experiencias extraordinarias. Ya no basta con lanzar anuncios y esperar resultados; necesitas crear ecosistemas digitales que anticipen las necesidades de tu audiencia y generen conversiones de alto valor. Este módulo te enseñará a construir tu primera campaña integral utilizando las metodologías más avanzadas del momento, combinando estrategia humana con precisión tecnológica para destacar en un mercado donde cada día se lanzan más de 3 millones de anuncios digitales en España.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Fundamentos: Research e Identificación de tu Audiencia Ideal</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, conocer a tu audiencia va más allá de la demografía tradicional. Necesitas mapear el customer journey completo, desde la primera búsqueda hasta la post-compra. Utiliza el Generador de Palabras Clave de meskeIA para descubrir no solo qué buscan, sino cómo lo buscan y en qué momento del proceso de compra. Construye buyer personas multidimensionales que incluyan patrones de consumo de contenido, horarios de navegación, dispositivos preferidos y triggers emocionales. La clave está en combinar datos cuantitativos (analytics, búsquedas) con insights cualitativos (entrevistas, encuestas, comentarios en redes).</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona revolucionó su estrategia digital creando 12 buyer personas diferentes basados en hábitos de compra online vs offline, descubriendo que el 67% de sus clientes digitales investigan productos en redes sociales antes de comprar en tienda física.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategia de Contenido: SEO Local y Personalización Geográfica</h2>
          <div className={styles.sectionContent}>
            <p>El SEO en 2025 es contextual y geográfico. Cada región española tiene particularidades lingüísticas y culturales que impactan las conversiones. Usa el Analizador GEO de meskeIA para identificar variaciones regionales en búsquedas y adaptar tu contenido. Implementa estrategias de 'Topic Clusters' donde cada pieza de contenido refuerza las demás, creando autoridad temática. Desarrolla contenido para diferentes momentos del funnel: awareness (blogs educativos), consideration (comparativas, casos de estudio) y decision (testimonios, demos). El contenido debe ser omniplataforma pero nativo de cada canal.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>La cadena de restaurantes Lizarran incrementó reservas online un 89% creando contenido hiperlocalizado para cada ciudad, destacando platos regionales y eventos locales en sus estrategias de marketing de contenidos.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Creatividad Visual: Formatos que Convierten en 2025</h2>
          <div className={styles.sectionContent}>
            <p>Los formatos visuales dominantes en 2025 son carruseles informativos, vídeos verticales de 15-60 segundos y contenido generado por usuarios. El Generador de Carruseles de meskeIA te permitirá crear secuencias visuales que eduquen mientras venden. Prioriza la autenticidad sobre la perfección: los contenidos que muestran procesos reales, behind-the-scenes y testimonios genuinos generan 3.2 veces más engagement. Diseña para mobile-first, considerando que el 89% del tráfico digital español proviene de dispositivos móviles. Incorpora elementos interactivos como polls, quizzes y AR filters para aumentar el tiempo de interacción.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Hawkers aumentó sus ventas un 156% usando carruseles que combinan product showcase con tutoriales de estilo, donde cada slide aporta valor educativo mientras presenta diferentes modelos de gafas.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Medición Inteligente: Analytics que Impulsan Decisiones</h2>
          <div className={styles.sectionContent}>
            <p>La analítica predictiva es esencial para optimizar campañas en tiempo real. Configura UTMs detallados usando el Generador UTM de meskeIA para rastrear cada touchpoint del customer journey. Implementa la Calculadora ROI Marketing para evaluar no solo conversiones inmediatas, sino valor de vida del cliente (LTV). Establece dashboards automatizados que monitoreen KPIs críticos: coste por lead cualificado, tasa de conversión por canal, engagement rate por tipo de contenido y attribution modeling para entender qué canales realmente impulsan conversiones. La clave está en convertir datos en insights accionables.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Wallapop optimiza sus campañas usando machine learning para predecir qué usuarios tienen mayor probabilidad de realizar transacciones, ajustando sus pujas publicitarias automáticamente y reduciendo el CAC un 43%.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Customer journey mapping con datos cualitativos y cuantitativos</li>
            <li>SEO contextual y geolocalizado para máxima relevancia</li>
            <li>Contenido visual auténtico y mobile-first</li>
            <li>Analytics predictivos para optimización en tiempo real</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Crear 2-3 buyer personas detallados con entrevistas reales a clientes</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Desarrollar un calendar de contenidos para 3 plataformas durante 30 días</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Configurar UTMs personalizados para todas las campañas activas</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Implementar un dashboard de métricas con revisión semanal automatizada</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Puedo describir exactamente dónde y cómo mis clientes ideales consumen contenido?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Mis campañas están generando leads cualificados o solo tráfico vanity?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2025, las empresas españolas que personalizan sus campañas por regiones obtienen un ROI 4.6 veces superior, y el 73% de los consumidores españoles prefieren marcas que demuestran conocimiento local en sus comunicaciones.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
