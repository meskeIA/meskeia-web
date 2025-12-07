'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function Nuevas4pPage() {
  return (
    <ChapterPage chapterId="nuevas-4p">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            El marketing digital de 2025 ha evolucionado más allá de las tradicionales 4P del marketing mix. Los consumidores españoles, cada vez más exigentes y conectados, esperan experiencias personalizadas y auténticas que trasciendan la simple transacción comercial. Ya no compramos productos aislados, sino ecosistemas de valor que resuelven problemas reales y generan conexiones emocionales. En este nuevo paradigma, las marcas más exitosas han redefinido completamente su enfoque: desde cómo conceptualizan sus productos hasta cómo establecen precios dinámicos basados en valor percibido. Te mostraremos cómo aplicar estas estrategias avanzadas de marketing digital para crear propuestas de valor irresistibles y diferenciarte en un mercado saturado.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Producto como Ecosistema de Valor Integral</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, el concepto de producto se ha transformado radicalmente. Ya no vendemos artículos físicos o servicios aislados, sino ecosistemas completos de experiencias. Los consumidores evalúan el 'producto ampliado': la funcionalidad básica, la experiencia de compra, el servicio postventa, la comunidad que se genera alrededor, y el impacto social o ambiental. Las marcas exitosas diseñan propuestas de valor que abordan múltiples necesidades del cliente de forma integrada. Esto requiere una mentalidad de diseño centrado en el usuario, donde cada punto de contacto añade valor y refuerza la promesa de marca. La diferenciación ya no está en las características del producto, sino en cómo este se integra en la vida del cliente y qué transformación genera.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Hawkers, la marca española de gafas de sol, no vende solo gafas: vende estilo de vida y pertenencia a una comunidad global de jóvenes. Su estrategia incluye colaboraciones con influencers, experiencias de marca en eventos, contenido de lifestyle en redes sociales y un programa de embajadores que hace que los clientes se conviertan en promotores activos de la marca.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategias de Pricing Dinámico y Basado en Valor</h2>
          <div className={styles.sectionContent}>
            <p>El pricing en 2025 va mucho más allá de costes + margen. Las empresas líderes utilizan pricing psicológico, dinámico y basado en el valor percibido por el cliente. La inteligencia artificial permite ajustar precios en tiempo real considerando demanda, competencia, perfil del cliente, momento de compra y contexto. Los modelos de suscripción y freemium dominan sectores que tradicionalmente vendían productos únicos. El precio se convierte en una herramienta de comunicación que refuerza el posicionamiento de marca. Las estrategias más sofisticadas incluyen bundling inteligente, precios de anclaje y técnicas de urgencia y escasez respaldadas por datos reales de comportamiento del usuario.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cabify implementa pricing dinámico que considera no solo la demanda del momento, sino también patrones históricos, eventos en la ciudad, condiciones meteorológicas y perfil del usuario. Durante las horas punta, no solo aumentan tarifas, sino que ofrecen opciones premium o compartidas con descuentos inteligentes para optimizar la experiencia y maximizar ingresos.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Distribución Omnicanal: El Customer Journey Sin Fricción</h2>
          <div className={styles.sectionContent}>
            <p>La distribución moderna requiere una orquestación perfecta entre todos los canales donde el cliente puede interactuar con tu marca. No se trata de estar presente en múltiples plataformas, sino de crear una experiencia fluida y coherente. Los datos del cliente deben sincronizarse en tiempo real entre canales, permitiendo que una conversación iniciada en redes sociales continúe en el chat de la web y se resuelva por teléfono sin pérdida de contexto. La clave está en mapear completamente el customer journey e identificar todos los momentos de verdad donde puedes generar valor. Las tecnologías como QR codes, realidad aumentada, y showrooming digital están redefiniendo la experiencia de compra tanto online como offline.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Zara ha perfeccionado su estrategia omnicanal permitiendo que los clientes compren online y recojan en tienda, prueben productos con realidad aumentada desde casa, reciban notificaciones personalizadas cuando artículos de su wishlist llegan a tiendas cercanas, y accedan a styling personal tanto virtual como presencial. Su app integra inventario en tiempo real de todas las tiendas.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Hiperpersonalización: Marketing Uno a Uno Escalable</h2>
          <div className={styles.sectionContent}>
            <p>La personalización de 2025 va más allá de segmentar por demografía o comportamiento. Utilizamos machine learning para crear perfiles dinámicos que predicen necesidades individuales en tiempo real. Cada cliente recibe una experiencia única: desde el contenido que ve, hasta los productos recomendados, los precios mostrados, y los canales de comunicación preferidos. La hiperpersonalización incluye personalización predictiva (anticipando necesidades), contextual (adaptándose al momento y situación), y emocional (respondiendo al estado de ánimo detectado). Las herramientas de IA analizan patrones de navegación, historial de compras, interacciones en redes sociales, y hasta datos de terceros para crear experiencias verdaderamente individualizadas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Netflix España no solo recomienda contenido basado en lo que has visto, sino que personaliza thumbnails, trailers, orden de recomendaciones, y hasta los actores destacados en las descripciones según tus preferencias detectadas. Su algoritmo considera hora del día, dispositivo usado, día de la semana, y patrones estacionales para maximizar engagement.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Los productos son ecosistemas de experiencias, no artículos aislados</li>
            <li>El pricing dinámico basado en IA maximiza valor percibido y rentabilidad</li>
            <li>La omnicanalidad verdadera require sincronización de datos en tiempo real</li>
            <li>La hiperpersonalización utiliza IA para crear experiencias individuales a escala</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Mapea el ecosistema completo de tu producto usando herramientas como el Customer Journey Mapping de meskeIA</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Implementa testing A/B en tu estrategia de precios con la Calculadora ROI Marketing para medir impacto</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Audita la coherencia de datos entre tus canales utilizando el Analizador GEO de meskeIA para optimizar presencia local</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué transformación real genera mi producto en la vida de mis clientes más allá de su función básica?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Estoy utilizando datos de comportamiento para personalizar la experiencia de cada cliente individual?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Según el estudio de IAB Spain 2024, el 84% de los consumidores españoles están dispuestos a compartir datos personales a cambio de experiencias verdaderamente personalizadas, pero solo el 23% considera que las marcas actuales lo hacen correctamente.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
