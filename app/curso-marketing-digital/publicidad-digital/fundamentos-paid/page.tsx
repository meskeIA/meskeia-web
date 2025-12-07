'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function FundamentosPaidPage() {
  return (
    <ChapterPage chapterId="fundamentos-paid">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            La publicidad digital ha evolucionado dramáticamente en 2025, convirtiéndose en el ecosistema más sofisticado y efectivo para hacer crecer cualquier negocio. En España, el 78% de las empresas que han dominado los fundamentos de la publicidad digital han experimentado un crecimiento del 40% o más en sus ventas. Ya no se trata solo de 'hacer publicidad online', sino de crear sistemas publicitarios inteligentes que trabajen 24/7 para tu marca. Desde una tienda de moda sostenible en Valencia hasta una consultora tecnológica en Bilbao, cada euro invertido debe generar resultados medibles y escalables. En este módulo, descubrirás cómo transformar la inversión publicitaria de un gasto en una máquina de crecimiento predecible.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Métricas Fundamentales: La Brújula de tus Campañas</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, las métricas de publicidad digital han evolucionado hacia un enfoque más holístico. CPM (Coste por Mil impresiones) ahora incluye métricas de viewability y brand lift. CPC (Coste por Clic) se complementa con quality scores y engagement rates. CPA (Coste por Adquisición) incorpora el lifetime value del cliente. ROAS (Return on Ad Spend) es la métrica estrella, pero debe calcularse considerando tanto conversiones directas como asistidas. En Meta Ads, un ROAS saludable es 4:1 o superior, mientras que en Google Ads puede variar entre 2:1 y 8:1 según el sector. La clave está en establecer benchmarks específicos para tu industria y optimizar constantemente.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cabify optimizó sus métricas en 2024 implementando attribution modeling avanzado. Descubrieron que sus anuncios en Instagram tenían un ROAS aparente de 2.8:1, pero al incluir conversiones asistidas, el ROAS real era de 4.6:1, cambiando completamente su estrategia de inversión.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Ecosistema Orgánico vs Paid: La Sinergia Perfecta</h2>
          <div className={styles.sectionContent}>
            <p>La dicotomía entre orgánico y paid media ha desaparecido en 2025. Ahora hablamos de 'Earned Media Amplification': usar paid media para potenciar contenido orgánico de alto rendimiento. El contenido orgánico genera confianza y brand equity, mientras que paid media acelera el alcance y permite segmentación precisa. La estrategia 80/20 funciona: 80% del contenido orgánico de calidad, 20% de amplificación pagada estratégica. Las empresas más exitosas crean 'contenido híbrido': piezas diseñadas para funcionar orgánicamente pero optimizadas para paid distribution. Herramientas como meskeIA Generador de Carruseles pueden ayudarte a crear contenido que funcione en ambos canales.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona revolucionó su estrategia digital en 2024 creando contenido orgánico sobre recetas saludables que luego amplificaba con micro-inversiones en Facebook e Instagram. Resultado: 300% más engagement y 45% reducción en CAC comparado con campañas tradicionales.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Customer Journey Intelligence: Más Allá del Embudo Tradicional</h2>
          <div className={styles.sectionContent}>
            <p>El embudo lineal ha evolucionado hacia un 'messy middle' en 2025. Los consumidores españoles realizan un promedio de 11 touchpoints antes de convertir. El nuevo modelo incluye: Discovery (descubrimiento), Research (investigación), Consideration (consideración), Intent (intención), Purchase (compra) y Advocacy (recomendación). Cada etapa requiere creatividades específicas, canales optimizados y métricas diferenciadas. En Discovery usamos video ads con storytelling, en Research contenido educativo, en Consideration comparativas y testimonios, en Intent ofertas urgentes, en Purchase experiencias de checkout fluidas, y en Advocacy programas de referidos gamificados.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Desigual mappeó completamente el customer journey de su target millennial, descubriendo que el 67% de sus clientes consumían contenido en TikTok durante la fase de Discovery, pero convertían finalmente en Instagram Shopping después de 4-6 touchpoints. Esta insight les permitió optimizar su media mix y mejorar su ROAS un 52%.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Presupuestación Inteligente: Data-Driven Budget Allocation</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, la asignación de presupuesto publicitario debe ser dinámica y basada en performance real. Para e-commerce: 25-35% de revenue, SaaS B2B: 15-25%, servicios locales: 8-12%, productos de alto ticket: 20-30%. Pero estos son solo puntos de partida. Implementa 'portfolio budgeting': 60% en canales probados, 25% en optimización de existentes, 15% en experimentación. Usa attribution modeling para identificar el verdadero impacto de cada canal. La Calculadora ROI de meskeIA te permite simular diferentes escenarios de inversión y encontrar tu punto óptimo de rentabilidad. Además, considera factors estacionales: en España, incrementa presupuestos 40-50% durante Black Friday, Reyes y periods de rebajas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>ElTenedor (TheFork) implementó un sistema de presupuestación dinámica basado en machine learning que ajusta inversiones cada 48 horas según performance, estacionalidad y competencia. En 2024 lograron un incremento del 28% en eficiencia publicitaria manteniendo el mismo presupuesto total.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Las métricas de 2025 incluyen attribution modeling y lifetime value para decisiones más inteligentes</li>
            <li>La sinergia orgánico-paid genera más resultados que canales aislados</li>
            <li>El customer journey es no-lineal: optimiza cada touchpoint, no solo conversiones finales</li>
            <li>Presupuestación dinámica basada en data supera modelos fijos tradicionales</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Audita tus métricas actuales e implementa attribution modeling con Google Analytics 4</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Crea una estrategia de contenido híbrido que funcione orgánico y paid usando meskeIA</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Mapea tu customer journey específico con herramientas como Hotjar o Crazy Egg</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Calcula tu presupuesto óptimo por canal usando meskeIA Calculadora ROI</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Conoces el verdadero customer journey de tu audiencia o asumes un embudo tradicional?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tu presupuesto publicitario se basa en data real o en porcentajes genéricos de la industria?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2025, las empresas españolas que implementan attribution modeling avanzado descubren que el 43% de sus conversiones tienen múltiples touchpoints, cambiando radicalmente cómo asignan presupuestos entre canales.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
