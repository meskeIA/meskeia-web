'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function DataDrivenMarketingPage() {
  return (
    <ChapterPage chapterId="data-driven-marketing">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            En 2025, el marketing digital se ha convertido en una disciplina hiperconectada donde cada clic, cada interacción y cada conversión cuenta una historia. Pero aquí está la realidad: no necesitas ser un experto en inteligencia artificial para dominar el arte del marketing basado en datos. La verdadera ventaja competitiva radica en saber qué medir, cuándo actuar y cómo transformar métricas frías en estrategias que generen resultados tangibles. Este capítulo te enseñará a navegar el océano de datos del marketing digital con la precisión de un estratega y la agilidad de un emprendedor moderno.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Nuevo Mapa de Métricas que Mueven el Negocio</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, las métricas de vanidad han muerto oficialmente. Los algoritmos de plataformas como Meta, TikTok y LinkedIn priorizan el engagement auténtico sobre la cantidad. Las métricas que realmente importan son: Customer Acquisition Cost (CAC), Customer Lifetime Value (CLV), Marketing Qualified Leads (MQL), Revenue Attribution y Time to Value. Estas métricas conectan directamente con el crecimiento del negocio. Herramientas como la Calculadora ROI Marketing de meskeIA te ayudan a calcular instantáneamente el retorno real de tus campañas, eliminando las conjeturas de la ecuación.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona Tech revolucionó su estrategia digital midiendo 'frecuencia de compra online + valor del carrito + satisfacción post-entrega', logrando aumentar un 60% la retención de clientes digitales en 2024.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Google Analytics 4 + IA: Tu Centro de Comando Digital</h2>
          <div className={styles.sectionContent}>
            <p>GA4 en 2025 es significativamente más potente gracias a las actualizaciones de Google AI. Las nuevas funcionalidades incluyen predicciones de churn mejoradas, análisis de cohortes automático, y conexión directa con Google Ads Performance Max. Lo crítico es configurar eventos personalizados que reflejen tu funnel específico. La integración con Search Console ahora permite análisis unificados de SEO y conversiones. Combinar GA4 con herramientas como el Analizador SEO de meskeIA te da una visión 360° del rendimiento orgánico y pagado.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Una startup española de SaaS usa GA4 para predecir qué usuarios freemium tienen 80% de probabilidad de convertirse en premium, activando campañas automáticas de nurturing.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Dashboards Inteligentes para Decisiones Rápidas</h2>
          <div className={styles.sectionContent}>
            <p>Los dashboards de 2025 son dinámicos e interactivos. Looker Studio ahora incluye conectores nativos con más de 800 fuentes de datos, mientras que herramientas como Notion y Monday han desarrollado capacidades de reporting avanzado. La clave es crear dashboards por roles: Ejecutivo (KPIs globales), Táctico (métricas por canal) y Operativo (datos en tiempo real). Automatiza las actualizaciones usando Zapier o Make.com para que los datos fluyan sin intervención manual. La regla de oro: si no puedes tomar una decisión basándote en el dashboard, necesitas rediseñarlo.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>ElTenedor (TheFork España) creó dashboards que actualizan cada 15 minutos: reservas por zona geográfica, ROI por tipo de restaurante y predicción de demanda para próximos 7 días.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>IA Generativa + Intuición Estratégica: La Fórmula 2025</h2>
          <div className={styles.sectionContent}>
            <p>La inteligencia artificial generativa ha cambiado las reglas del juego. Herramientas como ChatGPT para análisis, Claude para interpretación de datos y Gemini para predicciones, amplifican tu capacidad analítica. Sin embargo, la intuición estratégica sigue siendo insustituible para entender contexto cultural, timing de mercado y matices emocionales. El proceso ganador es: 1) Recopila datos objetivos, 2) Analiza patrones con IA, 3) Aplica contexto humano, 4) Valida hipótesis con tests pequeños. La IA procesa información, pero tú defines la estrategia.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Hawkers utiliza IA para analizar tendencias de color en redes sociales, pero sus diseñadores toman las decisiones finales basándose en intuición sobre la marca y conocimiento del consumidor español.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>En 2025, los datos predictivos superan a los datos descriptivos</li>
            <li>La automatización libera tiempo para estrategia, no reemplaza el criterio</li>
            <li>Los mejores insights nacen en la intersección de datos + contexto humano</li>
            <li>La velocidad de respuesta a los datos determina la ventaja competitiva</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Migra completamente a métricas de negocio y elimina vanity metrics</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Configura eventos personalizados en GA4 alineados con tu customer journey</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Diseña un dashboard ejecutivo con máximo 5 KPIs críticos</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Implementa un sistema de alertas automáticas para métricas clave</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>5</span>
              <p>Prueba herramientas meskeIA como el Analizador GEO para optimizar campañas locales</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Puedes tomar una decisión estratégica basándote únicamente en tu dashboard actual?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué porcentaje de tus decisiones de marketing se basa en datos vs. intuición?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cómo podrías usar IA generativa para acelerar tu análisis de datos sin perder el factor humano?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Según un estudio de HubSpot 2024, las empresas que combinan IA para análisis de datos con intuición humana para estrategia tienen un 127% más probabilidades de superar sus objetivos de revenue que aquellas que solo usan uno de los enfoques.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
