'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function EvolucionMarketingPage() {
  return (
    <ChapterPage chapterId="evolucion-marketing">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            El marketing digital ha experimentado la transformación más profunda de su historia en los últimos cinco años. En 2025, ya no se trata de interrumpir a las personas con mensajes publicitarios, sino de convertirse en parte integral de su experiencia digital diaria. Las marcas que lideran el mercado han entendido que el verdadero poder radica en crear ecosistemas de valor que van mucho más allá de la venta. Esta evolución del producto al propósito no es solo una tendencia, es la nueva realidad del marketing digital. Este capítulo te mostrará cómo las empresas más exitosas están construyendo conexiones auténticas, generando confianza en tiempo real y creando experiencias que transforman clientes ocasionales en embajadores de marca. Prepárate para descubrir los principios que están redefiniendo las reglas del juego digital.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Del Marketing de Producto al Marketing Centrado en el Cliente</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, el marketing digital ha evolucionado hacia una personalización extrema. Ya no basta con conocer datos demográficos básicos; las marcas líderes utilizan IA conversacional, análisis de sentimiento en tiempo real y patrones de comportamiento micro-segmentados para crear experiencias únicas. Herramientas como el Analizador SEO de meskeIA permiten entender no solo qué buscan los usuarios, sino el contexto emocional detrás de cada búsqueda. Esta transformación implica pasar de 'interrumpir y vender' a 'entender y servir'. Las empresas exitosas están creando Customer Data Platforms (CDP) que unifican todos los puntos de contacto digital, permitiendo conversaciones coherentes a través de email, redes sociales, chatbots con IA y experiencias web personalizadas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El Corte Inglés ha revolucionado su estrategia digital creando perfiles unificados que conectan compras online, offline y preferencias en redes sociales, logrando aumentar el valor medio por cliente un 34% en 2024.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>La Era del Propósito Digital: Impacto Medible y Transparente</h2>
          <div className={styles.sectionContent}>
            <p>El propósito corporativo en 2025 debe ser digital-first y medible. Los consumidores no solo quieren saber que una marca tiene valores, sino ver el impacto en tiempo real. Las marcas más exitosas utilizan dashboards públicos que muestran su progreso en objetivos sociales y ambientales. La gamificación del propósito, donde los usuarios pueden participar activamente en las causas de la marca, se ha convertido en una estrategia clave. Las redes sociales ya no son solo canales de comunicación, sino plataformas de activismo compartido donde las marcas y sus audiencias crean impacto conjunto. El storytelling ha evolucionado hacia el 'storyliving', donde las audiencias viven y participan en la narrativa de propósito de la marca.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Naturgy ha creado una app que permite a los usuarios ver en tiempo real cómo su consumo energético contribuye a proyectos de energía renovable, generando un 45% más de engagement que las campañas tradicionales.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategias Híbridas: Cuándo Combinar Producto y Propósito</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, las marcas más sofisticadas han desarrollado estrategias híbridas que adaptan su enfoque según el contexto digital y el customer journey. Durante la fase de descubrimiento (awareness), priorizan el propósito para generar conexión emocional. En la fase de consideración, combinan beneficios funcionales con valores. En la conversión, se enfocan en producto y experiencia. Las herramientas de automatización de marketing permiten activar diferentes narrativas según el comportamiento del usuario. El Generador de Carruseles de meskeIA, por ejemplo, permite crear contenido que alterna seamlessly entre aspectos emocionales y funcionales según la audiencia segmentada.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona utiliza IA para mostrar contenido centrado en sostenibilidad a usuarios eco-conscientes y precio/calidad a usuarios price-sensitive, manteniendo coherencia de marca pero adaptando el mensaje.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Construcción de Confianza en el Ecosistema Digital</h2>
          <div className={styles.sectionContent}>
            <p>La confianza digital en 2025 se construye a través de micro-interacciones transparentes y consistentes. Los usuarios evalúan a las marcas en tiempo real: velocidad de respuesta en redes sociales, precisión de recomendaciones, transparencia en el uso de datos y coherencia entre lo prometido y lo entregado. Las marcas líderes han implementado 'confianza como servicio', utilizando tecnologías como blockchain para verificar claims, reviews auténticas y trazabilidad de productos. La gestión de reputación online se ha vuelto proactiva: no se espera a que surjan problemas, sino que se anticipan y se abordan antes de que escalen. Las herramientas de monitorización de marca ahora incluyen análisis de sentimiento predictivo.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Inditex utiliza QR codes en sus prendas que conectan con blockchain, permitiendo a los clientes verificar la autenticidad del producto y la sostenibilidad de su cadena de suministro, aumentando la confianza del 67% de sus clientes millennials.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>La personalización extrema con IA es el nuevo estándar del marketing digital</li>
            <li>El propósito debe ser digital-first, medible y participativo</li>
            <li>Las estrategias híbridas se adaptan dinámicamente al customer journey</li>
            <li>La confianza se construye a través de micro-interacciones transparentes y consistentes</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Implementa un Customer Data Platform que unifique todos tus puntos de contacto digital</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Crea un dashboard público que muestre el progreso de tus objetivos de propósito en tiempo real</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Utiliza herramientas como el Analizador SEO de meskeIA para entender el contexto emocional de las búsquedas de tu audiencia</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Desarrolla un protocolo de respuesta en redes sociales que construya confianza en cada interacción</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Tus datos de cliente están creando experiencias verdaderamente personalizadas o solo campañas segmentadas?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cómo pueden tus clientes participar activamente en el propósito de tu marca a través de canales digitales?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2024, el 89% de los consumidores españoles abandonaron una compra online debido a experiencias no personalizadas, mientras que las marcas con propósito digital claro generaron un 2.3x más engagement orgánico en redes sociales, según el estudio Digital Trust Index de IAB Spain.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
