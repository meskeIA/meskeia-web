'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function CustomerJourneyPage() {
  return (
    <ChapterPage chapterId="customer-journey">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 2025, el customer journey se ha transformado en un ecosistema dinámico donde cada interacción determina el éxito de tu marca. Los consumidores españoles realizan una media de 14 touchpoints digitales antes de comprar, moviéndose fluidamente entre TikTok, Google, reseñas online y tiendas físicas. Las empresas que dominan este mapa complejo no solo venden más, sino que construyen comunidades leales. El secreto está en entender que ya no vendemos productos, sino que diseñamos experiencias memorables que convierten clientes en embajadores de marca.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Journey Circular: Más allá del embudo tradicional</h2>
          <div className={styles.sectionContent}>
            <p>El embudo de ventas lineal ha quedado obsoleto. En 2025 trabajamos con journeys circulares donde advocacy, discovery y purchase se entrelazan constantemente. Los clientes pueden empezar en cualquier punto: un TikTok viral, una recomendación de Google SGE, o una story de Instagram. Las marcas exitosas diseñan múltiples puntos de entrada y reconexión. La clave está en crear loops de valor: cada interacción debe generar tres outcomes: satisfacción inmediata, información para personalización futura, y motivo para volver. Herramientas como el Analizador GEO de meskeIA te permiten mapear estos patrones geográficos de comportamiento para optimizar cada touchpoint local.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Carrefour España ha implementado un journey circular perfecto: desde su app puedes planificar compras, recibir ofertas personalizadas basadas en compras anteriores, hacer click & collect, y generar listas que otros familiares pueden completar, creando un ciclo continuo de engagement.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Omnicanalidad inteligente: La sincronización perfecta</h2>
          <div className={styles.sectionContent}>
            <p>La omnicanalidad de 2025 va más allá de estar presente en varios canales. Se trata de crear una experiencia fluida donde el cliente puede cambiar de dispositivo y canal sin perder contexto. Los datos se unifican en tiempo real, la personalización se mantiene consistente, y cada canal potencia al siguiente. Las marcas líderes utilizan AI para predecir qué canal usará el cliente en su próxima interacción y preparan la experiencia con anticipación. La integración de WhatsApp Business API, chatbots conversacionales, y asistentes de voz ha revolucionado la atención al cliente instantánea.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El Corte Inglés domina la omnicanalidad: puedes añadir productos al carrito desde Instagram, consultar disponibilidad por WhatsApp, probarte virtualmente desde la app, recoger en tienda física y cambiar online sin complicaciones. Su programa de personalización reconoce tus preferencias en cualquier canal.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Micro-momentos y momentos de fricción</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, los momentos de verdad se han fracturado en cientos de micro-momentos. Cada clic, cada scroll, cada pausa en un video genera data valiosa. Las marcas exitosas identifican y optimizan estos micro-momentos: el momento exacto cuando un usuario duda en checkout, cuándo busca reviews, o cuándo compara precios. Simultáneamente, detectamos y eliminamos momentos de fricción: formularios largos, tiempos de carga, pasos innecesarios. La diferencia entre conversión y abandono se decide en estas fracciones de segundo.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Glovo ha perfeccionado los micro-momentos: su algoritmo detecta cuándo dudas al elegir restaurante y te muestra opciones similares, reduce la fricción del pago con un clic, y optimiza los tiempos de entrega mostrados en tiempo real para evitar decepciones.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Mapeo avanzado con IA y datos en tiempo real</h2>
          <div className={styles.sectionContent}>
            <p>El mapeo de customer journey en 2025 combina analytics tradicional con IA predictiva. Utilizamos heatmaps de comportamiento, análisis de sentimientos en redes sociales, y tracking cross-device para crear mapas dinámicos que evolucionan en tiempo real. Las herramientas de meskeIA como el Generador de Palabras Clave te ayudan a identificar intenciones de búsqueda en cada etapa del journey, mientras que el Analizador SEO optimiza el contenido para cada momento del proceso. El objetivo es crear journey maps que no solo describan lo que pasó, sino que predigan y mejoren lo que pasará.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Wallapop utiliza machine learning para mapear el journey de compra-venta: predice cuándo un usuario está listo para vender, qué productos le interesarán, y personaliza las notificaciones push para maximizar engagement sin generar saturación.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Los journeys circulares generan más valor que los embudos lineales</li>
            <li>Los micro-momentos determinan el éxito de la conversión</li>
            <li>La omnicanalidad debe ser invisible para el usuario</li>
            <li>La IA predictiva personaliza experiencias antes de que el cliente actúe</li>
            <li>Cada touchpoint debe generar valor inmediato y futuro</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Realiza una auditoría completa de todos tus touchpoints digitales y físicos</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Implementa tracking cross-device para unificar el journey de cada usuario</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Identifica los 5 micro-momentos críticos en tu proceso de conversión</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Utiliza herramientas meskeIA para optimizar palabras clave en cada etapa del journey</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>5</span>
              <p>Diseña contenido específico para cada momento de fricción detectado</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Puedes rastrear a un cliente específico a través de todos sus touchpoints con tu marca?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué porcentaje de tus ventas proviene de clientes que regresan al journey circular?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tus equipos de marketing, ventas y customer service comparten la misma visión del customer journey?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En España, el 89% de los consumidores utilizan una media de 6.8 dispositivos diferentes durante su customer journey, y las empresas que logran sincronizar perfectamente la experiencia cross-device aumentan sus conversiones un 34% (Estudio IAB Spain 2025).</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
