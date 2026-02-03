'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function RecursosHerramientasPage() {
  return (
    <ChapterPage chapterId="recursos-herramientas">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            El marketing digital en 2025 ha evolucionado hacia un ecosistema híbrido donde la inteligencia artificial, la personalización extrema y la privacidad de datos convergen. Los profesionales exitosos no son solo ejecutores de campañas, sino estrategas digitales que combinan creatividad humana con capacidades tecnológicas avanzadas. Este nuevo paradigma requiere un enfoque metodológico para construir tu arsenal de herramientas, desarrollar competencias futuras y mantener una mentalidad de innovación constante. La diferencia entre un marketer promedio y uno excepcional radica en su capacidad de adaptar su stack tecnológico a objetivos específicos y presupuestos reales.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Herramientas Gratuitas Esenciales en 2025</h2>
          <div className={styles.sectionContent}>
            <p>El arsenal gratuito de 2025 incluye Google Analytics 4 con IA integrada, Google Search Console con insights de búsqueda por voz, y Bing Webmaster Tools (ahora esencial con el crecimiento de Copilot). Para contenido visual, Canva Magic Design y Adobe Express ofrecen capacidades de IA generativa. En SEO, herramientas como el Generador de Palabras Clave de meskeIA y Ubersuggest Free proporcionan insights competitivos. Para redes sociales, Meta Business Suite y LinkedIn Campaign Manager básico permiten gestión profesional sin coste. La clave está en la integración: usar Zapier Free para conectar estas herramientas y crear flujos automatizados.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>La agencia madrileña DigitalBoost logró gestionar 15 clientes PYME usando exclusivamente herramientas gratuitas durante sus primeros 8 meses, generando €180,000 en facturación antes de invertir en herramientas premium.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Stack Tecnológico por Niveles de Inversión</h2>
          <div className={styles.sectionContent}>
            <p>**Nivel Starter (0-300€/mes):** Combinación de herramientas gratuitas con Mailchimp, Canva Pro y meskeIA para optimización de contenidos. **Nivel Growth (300-1000€/mes):** Incorpora HubSpot Marketing, Semrush Pro, Hotjar y ActiveCampaign para automatización avanzada. **Nivel Enterprise (+1000€/mes):** Salesforce Marketing Cloud, Ahrefs, Sprinklr para gestión omnicanal y herramientas de IA especializadas. Cada nivel debe justificar su ROI: una herramienta que no genere al menos 3x su coste mensual debe ser reconsiderada. La escalabilidad es clave: elige herramientas que crezcan contigo.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Glovo España evolucionó su stack desde herramientas básicas hasta una infraestructura de €50,000/mes que gestiona millones de interacciones diarias, manteniendo siempre el criterio de ROI por herramienta.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Formación Continua Estratégica</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, la formación efectiva combina certificaciones oficiales, microlearning y experiencia práctica. Google AI Essentials, Meta Blueprint avanzado y las certificaciones de HubSpot son fundamentales. Plataformas como Platzi y LinkedIn Learning ofrecen rutas especializadas en marketing con IA. Los podcasts 'Marketing en Español' y 'Growth Hacking' proporcionan insights semanales. Participa en eventos como OMExpo, eShow o Digitalks para networking estratégico. Dedica 6-8 horas mensuales distribuidas: 70% contenido técnico, 20% tendencias y 10% casos de estudio de la competencia.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Laura Ribas, CMO de Wallapop, invierte 10 horas mensuales en formación continua y atribuye el 30% de sus innovaciones de campaña a conocimientos adquiridos en los últimos 6 meses.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Mentalidad de Experimentación Sistemática</h2>
          <div className={styles.sectionContent}>
            <p>La mentalidad de 2025 se basa en experimentación estructurada, no en intuición. Implementa un framework de testing: hipótesis clara, métricas de éxito definidas, timeframe específico y criterios de escalado. Usa metodologías como ICE Score (Impact, Confidence, Ease) para priorizar experimentos. Documenta todo en herramientas como Notion o Airtable. Acepta que el 70% de tus experimentos fallarán, pero el 30% exitoso compensará con creces. La clave es velocidad de iteración: prefiere 10 experimentos pequeños que uno grande.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cabify ejecuta +200 experimentos anuales en su estrategia digital, con una tasa de éxito del 28% que ha generado mejoras acumuladas del 340% en conversión durante los últimos dos años.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>El ROI de cada herramienta debe ser medible y justificable</li>
            <li>La formación continua es inversión, no gasto operativo</li>
            <li>La experimentación sistemática supera a la intuición</li>
            <li>La IA es un multiplicador de capacidades, no un sustituto</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Audita tu stack actual calculando ROI real de cada herramienta</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Diseña un plan de formación de 6 meses con objetivos específicos</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Implementa un sistema de experimentación con al menos 2 tests mensuales</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Únete a 2 comunidades especializadas en tu vertical de negocio</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Puedes justificar el ROI de cada herramienta que usas actualmente?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué porcentaje de tu tiempo inviertes en aprender versus ejecutar?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>El 84% de los marketers que implementan sistemas de experimentación estructurada superan sus KPIs anuales en un 45% de media, según el último informe de Marketing Experiments Institute 2024.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
