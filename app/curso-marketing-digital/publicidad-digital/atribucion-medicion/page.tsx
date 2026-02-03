'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function AtribucionMedicionPage() {
  return (
    <ChapterPage chapterId="atribucion-medicion">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En el ecosistema digital de 2025, donde los consumidores interactúan con las marcas a través de más de 12 puntos de contacto antes de convertir, la medición precisa se ha convertido en el santo grial del marketing. Con la desaparición total de las cookies de terceros de Chrome y las nuevas regulaciones de privacidad que limitan el tracking tradicional, las empresas que dominen la atribución basada en datos first-party y modelos predictivos tendrán una ventaja competitiva insuperable. Ya no basta con saber que una campaña funciona: necesitamos entender exactamente cómo, cuándo y por qué cada euro invertido genera retorno. En este nuevo paradigma, donde la inteligencia artificial redefine la personalización y los canales se multiplican exponencialmente, la medición inteligente no es solo una habilidad técnica, es la diferencia entre crecer de forma sostenible o desperdiciar presupuesto en un mercado cada vez más competitivo.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Nuevo Paradigma de la Atribución Post-Cookies</h2>
          <div className={styles.sectionContent}>
            <p>La realidad de 2025 ha obligado a reinventar completamente la atribución. Con Google eliminando definitivamente las cookies de terceros y Apple intensificando las restricciones del ATT, los marketers enfrentan una 'caja negra' donde el 40% de las conversiones aparecen como tráfico directo. Los consumidores españoles, especialmente la Generación Z, utilizan hasta 8 dispositivos diferentes en su customer journey, saltando entre TikTok, Instagram, WhatsApp Business y Google en cuestión de minutos. Esta fragmentación exige modelos de atribución probabilística que combinen datos first-party con machine learning. Las empresas más avanzadas están implementando Customer Data Platforms (CDP) que unifican la identidad del usuario sin depender de cookies, utilizando técnicas como el fingerprinting ético y el modelado de mix media para reconstruir el recorrido completo del cliente.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Inditex ha desarrollado un sistema propio que rastrea cómo un usuario ve una Story de Zara en Instagram, busca el producto en Google, lo comparte por WhatsApp, visita la tienda física y finalmente compra online, asignando valor a cada touchpoint mediante algoritmos de aprendizaje automático.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Modelos de Atribución Potenciados por IA</h2>
          <div className={styles.sectionContent}>
            <p>Los modelos de atribución de 2025 van más allá de los tradicionales first-click o last-click. Los modelos algorítmicos utilizan inteligencia artificial para ponderar dinámicamente cada interacción según su probabilidad real de influir en la conversión. El modelo de descomposición temporal analiza no solo qué canales intervienen, sino cuándo y en qué secuencia generan mayor impacto. Los modelos de Shapley Value, adaptados del game theory, distribuyen el valor de forma más justa entre todos los touchpoints. Herramientas como el Calculadora ROI Marketing de meskeIA permiten simular diferentes escenarios de atribución para optimizar la asignación presupuestaria. Estos sistemas también incorporan datos externos como estacionalidad, competencia y tendencias de mercado para predictions más precisas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>ElCorteInglés utiliza un modelo híbrido que detecta que los anuncios en YouTube tienen un 300% más de impacto cuando se combinan con remarketing en Google Shopping durante las dos semanas previas al Black Friday.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategia UTM Avanzada y Tracking Multiplataforma</h2>
          <div className={styles.sectionContent}>
            <p>La nomenclatura UTM en 2025 requiere una arquitectura más sofisticada que permita análisis granular cross-platform. La estructura recomendada incluye parámetros custom que identifiquen audience segments, creative variants, funnel stage y device context. El Generador UTM de meskeIA automatiza esta complejidad, creando códigos consistentes que se adaptan automáticamente a las particularidades de cada plataforma (Instagram Stories requieren UTMs más cortos, LinkedIn permite mayor detalle). Los UTMs dinámicos se generan en tiempo real basándose en el perfil del usuario, la hora del día y el contexto de navegación. Esta estrategia permite no solo tracking preciso, sino también personalization a escala, donde cada clic lleva información valiosa sobre la intención y el comportamiento del usuario.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Un UTM avanzado para Cabify: utm_source=tiktok&utm_medium=video&utm_campaign=verano2025&utm_content=madrid_millennials&utm_term=descuento15&utm_audience=frequent_users&utm_funnel=conversion</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Dashboards Inteligentes: De Métricas a Decisiones</h2>
          <div className={styles.sectionContent}>
            <p>Los dashboards de rendimiento en 2025 son ecosistemas de inteligencia que combinan datos descriptivos, predictivos y prescriptivos en una sola interfaz. Ya no muestran solo qué pasó, sino qué va a pasar y qué deberías hacer al respecto. Integran APIs de todas las plataformas (Meta, Google, TikTok, Amazon DSP) con datos de CRM y analytics para ofrecer una visión 360º del customer lifetime value. Las herramientas de meskeIA como el Analizador SEO se conectan con estos dashboards para correlacionar performance orgánico con paid media. Los alertas inteligentes notifican automáticamente cuando una campaña está underperforming o cuando surge una oportunidad de optimización. La visualización utiliza storytelling data para que cualquier stakeholder, desde el CEO hasta el ejecutivo de cuentas, entienda inmediatamente el estado y las oportunidades de mejora.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El dashboard de Banco Santander predice que aumentar un 20% la inversión en LinkedIn durante enero generará 150 leads cualificados adicionales con un 85% de probabilidad, mostrando el impacto exacto en pipeline y revenue proyectado.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>La atribución post-cookies requiere combinar datos first-party con modelos probabilísticos de IA</li>
            <li>Los modelos algoritmicos superan en precisión a los modelos tradicionales en un 40%</li>
            <li>Los UTMs dinámicos permiten tracking granular y personalización simultánea</li>
            <li>Los dashboards predictivos transforman datos en decisiones estratégicas accionables</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Audita tu modelo de atribución actual e identifica gaps de medición cross-device</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Implementa una estructura UTM estandarizada usando el Generador UTM de meskeIA</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Configura un dashboard unificado que integre todas tus fuentes de datos</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Establece alertas inteligentes para optimización automática de campañas underperforming</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Puedes rastrear con precisión el journey completo de un cliente desde el primer touchpoint hasta la compra y retention?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tus decisiones de inversión publicitaria se basan en intuición o en datos predictivos validados?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Según el último estudio de IAB Spain 2025, las empresas que utilizan modelos de atribución basados en IA obtienen un ROAS 2.3x superior y reducen el waste publicitario en un 34% comparado con modelos tradicionales de last-click.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
