'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function MarketingAutomationPage() {
  return (
    <ChapterPage chapterId="marketing-automation">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            La automatización de marketing ha evolucionado de enviar emails automáticos a convertirse en el sistema nervioso de tu estrategia digital. En 2025, las empresas que dominan la automatización logran hasta un 451% más de leads cualificados y reducen sus costes de adquisición en un 40%. No estamos hablando de robots enviando mensajes masivos, sino de ecosistemas inteligentes que utilizan IA para crear experiencias únicas para cada cliente potencial. Empresas como Cabify o ElCorteInglés.es ya utilizan automatización avanzada para personalizar cada interacción y maximizar conversiones. En este módulo, te enseñaremos a construir tu propio motor de automatización que trabajará 24/7 para hacer crecer tu negocio de forma escalable y rentable.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Qué es Realmente el Marketing Automation en 2025</h2>
          <div className={styles.sectionContent}>
            <p>Marketing automation es la combinación de tecnología, datos e inteligencia artificial para crear experiencias de cliente personalizadas y escalables. Va mucho más allá del email marketing: incluye segmentación dinámica, scoring predictivo, personalización web en tiempo real y orquestación multicanal. La clave está en los 'triggers' inteligentes que activan acciones basadas en comportamientos específicos del usuario. En 2025, las plataformas más avanzadas utilizan machine learning para optimizar automáticamente el timing, el contenido y el canal de cada comunicación. meskeIA integra estas capacidades permitiendo crear flujos sofisticados sin necesidad de conocimientos técnicos avanzados.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona Tech utiliza automatización para personalizar ofertas online según historial de compra, ubicación y preferencias dietéticas, logrando un 43% más de engagement que sus campañas genéricas.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Flujos de Automatización que Generan Resultados</h2>
          <div className={styles.sectionContent}>
            <p>Los flujos más efectivos en 2025 son: flujo de bienvenida progresivo (7-14 días), secuencias de nurturing basadas en intereses, flujos de abandono multicanal (email + SMS + push), reactivación de clientes inactivos y upselling post-compra. Cada flujo debe incluir múltiples puntos de salida, personalización dinámica y testing continuo. La clave es mapear el customer journey específico de tu audiencia y crear contenido relevante para cada etapa. Los flujos modernos integran contenido interactivo, vídeos personalizados y llamadas a la acción contextuales. Utiliza herramientas como el Generador UTM de meskeIA para trackear cada touchpoint de tus flujos.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Hawkers implementa un flujo de abandono que incluye: email inmediato con recordatorio, segundo email con descuento del 10% a las 24h, SMS con descuento del 15% a las 72h, y push notification final con envío gratuito, recuperando el 28% de carritos abandonados.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Lead Scoring: Prioriza tus Oportunidades de Oro</h2>
          <div className={styles.sectionContent}>
            <p>El lead scoring moderno combina datos demográficos, comportamentales y predictivos para asignar puntuaciones dinámicas. En 2025, los sistemas más avanzados evalúan más de 50 variables en tiempo real: páginas visitadas, tiempo en el sitio, interacciones con emails, descargas, actividad en redes sociales e incluso patrones de navegación. La IA identifica patrones ocultos que predicen la intención de compra con un 89% de precisión. Establece umbrales claros: leads fríos (0-40 puntos), templados (41-70) y calientes (71-100). El scoring debe actualizarse automáticamente y sincronizarse con tu CRM para que ventas priorice los contactos más prometedores.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Typeform utiliza un sistema de scoring que combina respuestas del formulario, comportamiento web y engagement social, permitiendo a su equipo de ventas enfocar esfuerzos en leads con 5x más probabilidad de conversión.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Tecnologías y Herramientas de Automatización 2025</h2>
          <div className={styles.sectionContent}>
            <p>El ecosistema de herramientas se divide en tres categorías: todo-en-uno (HubSpot, ActiveCampaign), especializadas (Mailchimp para email, Zapier para integraciones) y plataformas con IA (meskeIA, Salesforce Einstein). En 2025, busca herramientas que ofrezcan: API abierta para integraciones, análisis predictivo nativo, personalización dinámica, multicanal real y GDPR compliance automático. Las mejores inversiones son aquellas que crecen contigo: desde automatizaciones básicas hasta flujos enterprise complejos. Evalúa capacidades de segmentación, facilidad de uso, soporte técnico y escalabilidad de precios antes de decidir.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Comparativa práctica 2025: Mailchimp (ideal para empezar, €9-299/mes), ActiveCampaign (mejor relación precio-funciones, €15-259/mes), HubSpot (todo-en-uno pero costoso, €45-3200/mes), meskeIA (IA avanzada con precios competitivos, consultar planes actuales).</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>La automatización moderna combina IA, datos y multicanal para experiencias hiperpersonalizadas</li>
            <li>Los flujos efectivos tienen múltiples touchpoints, personalización dinámica y optimización continua</li>
            <li>El lead scoring basado en IA puede predecir intención de compra con 89% de precisión</li>
            <li>Elegir la herramienta correcta depende de tu tamaño, presupuesto y necesidades de integración</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Mapea tu customer journey actual e identifica oportunidades de automatización específicas</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Configura un sistema básico de lead scoring con al menos 10 criterios de puntuación</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Prueba 2-3 herramientas con trials gratuitos y compara funcionalidades reales con tu caso de uso</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué porcentaje de tus leads actuales podrían beneficiarse de un flujo automatizado personalizado?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cuánto tiempo dedica tu equipo semanalmente a tareas que podrían automatizarse?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Las empresas que utilizan marketing automation avanzado generan un 80% más de leads y reducen el coste por adquisición en un 33%, mientras que el 76% de las empresas recuperan su inversión en automatización en los primeros 12 meses (HubSpot Research, 2025).</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
