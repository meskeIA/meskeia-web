'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function PlanMarketingPage() {
  return (
    <ChapterPage chapterId="plan-marketing">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 2025, el marketing digital ya no es solo una estrategia complementaria: es el motor principal de crecimiento de cualquier negocio. Con la IA generativa revolucionando la personalización, la privacidad de datos redefiniendo la publicidad digital y nuevas plataformas emergiendo constantemente, tener un plan estratégico sólido marca la diferencia entre liderar tu mercado o quedarte atrás. Este capítulo te enseñará a crear un plan de marketing digital que no solo sea un documento bonito, sino una herramienta viva que transforme tus objetivos en resultados medibles y rentables.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Análisis de Situación Digital: DAFO 3.0</h2>
          <div className={styles.sectionContent}>
            <p>El DAFO digital en 2025 va más allá del análisis tradicional. En **Debilidades**, evalúa tu Core Web Vitals, compatibilidad con iOS 18, uso de datos first-party y capacidades de IA. En **Amenazas**, considera la eliminación progresiva de cookies de terceros, regulaciones como la Ley de Servicios Digitales europea y la saturación publicitaria. Las **Fortalezas** incluyen tu base de datos propia, contenido evergreen y presencia en plataformas emergentes. En **Oportunidades**, identifica el marketing conversacional con IA, el social commerce y las búsquedas por voz. Utiliza herramientas como el Analizador SEO de meskeIA para evaluar objetivamente tu situación técnica actual.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona identificó en su DAFO 2024 la oportunidad del social commerce en Instagram, lanzando compras directas desde Stories que incrementaron sus ventas online un 45% en seis meses.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Objetivos SMART Digitales con IA</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, los objetivos SMART deben integrar métricas de IA y experiencia del usuario. Ejemplos específicos: 'Aumentar la tasa de conversión de chatbot de 12% a 25% en Q2 2025 mediante implementación de GPT-4', 'Reducir bounce rate en móvil del 65% al 40% optimizando Core Web Vitals', 'Incrementar lifetime value de clientes email de 150€ a 300€ con personalización IA en 8 meses'. Cada objetivo debe tener métricas de vanidad (seguidores) y métricas de negocio (conversiones, ingresos). La Calculadora ROI Marketing de meskeIA te ayuda a establecer objetivos financieros realistas y medibles.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Wallapop definió en 2024 el objetivo de reducir tiempo promedio de venta de productos de 8 a 5 días usando algoritmos de recomendación, logrando un 78% de cumplimiento en el primer trimestre.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Ecosistema de Canales Digitales 2025</h2>
          <div className={styles.sectionContent}>
            <p>La estrategia multicanal inteligente de 2025 se basa en el customer journey fragmentado. **Canales de descubrimiento**: TikTok (todas las edades), YouTube Shorts, Instagram Reels. **Canales de consideración**: Google Search, LinkedIn (B2B), YouTube long-form. **Canales de conversión**: Email marketing, WhatsApp Business, remarketing en Meta. **Canales de fidelización**: Comunidades en Discord, newsletters personalizadas, programas de referidos. Cada canal debe tener un propósito específico y métricas únicas. No disperses esfuerzos: es mejor dominar 3-4 canales que estar presente superficialmente en 10.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>El Corte Inglés desarrolló un ecosistema donde TikTok genera awareness, Instagram educa sobre productos, WhatsApp resuelve dudas de compra y email fideliza, consiguiendo un customer journey integrado que aumentó su ROI 2.3x.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Presupuesto Digital Inteligente</h2>
          <div className={styles.sectionContent}>
            <p>La distribución presupuestaria 2025 debe ser: 40% en canales con ROI probado, 30% en experimentación y nuevas plataformas, 20% en herramientas y tecnología (IA, analítica, automatización), 10% en formación del equipo. Implementa presupuestos dinámicos que se ajusten según performance mensual. Invierte obligatoriamente en herramientas de first-party data, plataformas de marketing automation con IA y análisis predictivo. No olvides presupuestar para cumplimiento de regulaciones (GDPR, DSA) y ciberseguridad. Las herramientas meskeIA, como el Generador UTM, te ayudan a trackear ROI de cada inversión con precisión.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Inditex asignó en 2024 un 45% de su presupuesto digital a IA y automatización, incluyendo chatbots, personalización de contenidos y análisis predictivo de tendencias, generando un ahorro de costes del 28% mientras aumentaba conversiones.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>El DAFO digital debe incluir capacidades de IA y datos first-party como factores críticos</li>
            <li>Los objetivos SMART 2025 integran métricas de experiencia del usuario y tecnologías emergentes</li>
            <li>El ecosistema multicanal se basa en propósitos específicos, no en presencia generalizada</li>
            <li>El presupuesto digital debe ser dinámico y orientado a capacidades tecnológicas del futuro</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Realiza un audit completo de tu presencia digital usando herramientas de análisis como las de meskeIA</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Define 5 objetivos SMART específicos para 2025, incluyendo métricas de IA y UX</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Mapea tu customer journey actual e identifica gaps en tu ecosistema de canales</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Crea un presupuesto digital trimestral con un 30% destinado a experimentación</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Estás preparado para un mundo sin cookies de terceros y cómo afectará a tu estrategia actual?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tus métricas de éxito reflejan verdadero valor de negocio o solo vanity metrics?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>El 89% de las empresas españolas que implementaron IA en marketing durante 2024 reportaron un aumento promedio del 34% en conversiones, pero solo el 23% tenía un plan estratégico digital documentado antes de la implementación.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
