'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function EstrategiaRedesPage() {
  return (
    <ChapterPage chapterId="estrategia-redes">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            El mayor error en marketing digital de redes sociales no es estar ausente, sino estar en todas partes sin estrategia. En 2025, la saturación de contenido ha alcanzado niveles críticos: cada minuto se suben 500 horas de vídeo a YouTube y se publican 695,000 posts en Instagram. Solo el 2,3% del contenido orgánico en redes sociales genera engagement significativo. Este escenario ha convertido la presencia digital en un campo de batalla donde únicamente los más inteligentes y selectivos prosperan. Imagina invertir 20 horas semanales creando contenido para que menos del 1% de tus seguidores lo vean realmente. Este capítulo te transformará de un generador de ruido digital en un estratega quirúrgico que maximiza cada segundo invertido en redes sociales.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Selección Inteligente de Plataformas: El Método de los 3 Criterios</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, el éxito radica en dominar 2-3 plataformas, no en dispersarte en 10. Aplica los tres criterios fundamentales: (1) Demografía precisa - ¿dónde está exactamente tu buyer persona? (2) Formato nativo - ¿tu contenido encaja naturalmente? (3) ROI demostrable - ¿puedes medir conversiones reales? Por ejemplo, una consultoría tecnológica B2B debe priorizar LinkedIn (93% de decisores están activos) sobre TikTok. Utiliza meskeIA Analizador GEO para identificar concentraciones geográficas de tu audiencia y meskeIA Analizador SEO para evaluar el potencial de búsqueda orgánica en cada plataforma.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Mercadona abandonó Twitter/X en 2024 para concentrarse en Instagram y LinkedIn, incrementando su engagement rate del 2,1% al 8,7% y generando 23% más leads cualificados.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Arquitectura de Objetivos: El Framework ACCC</h2>
          <div className={styles.sectionContent}>
            <p>Cada publicación debe responder al framework ACCC: Awareness (notoriedad), Consideración (evaluación), Conversión (acción) o Comunidad (fidelización). Define KPIs específicos: Awareness - CPM y alcance único; Consideración - tiempo de visionado y saves; Conversión - CTR y CVR; Comunidad - tasa de respuesta y menciones espontáneas. Usa meskeIA Calculadora ROI Marketing para asignar valor económico a cada objetivo. En 2025, las empresas exitosas dedican: 30% awareness, 25% consideración, 25% conversión, 20% comunidad.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Glovo implementó esta matriz: TikTok para awareness viral (30M impresiones/mes), Instagram Stories para consideración con testimonios, LinkedIn para conversión B2B, y su app propia para comunidad con gamificación.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Frecuencia Optimizada: La Regla del Valor Concentrado</h2>
          <div className={styles.sectionContent}>
            <p>La nueva regla dorada es 'menos pero mejor'. En 2025, el algoritmo premia la profundidad sobre la frecuencia. Publica 3-5 veces por semana con contenido de alto valor, no 15 posts mediocres. Cada publicación debe generar al menos 30 segundos de atención. Implementa la técnica '80/20 de contenido': 80% educativo/entretenimiento, 20% promocional. Utiliza meskeIA Generador de Carruseles para crear contenido visualmente impactante y programa con herramientas que analicen tus ventanas de máxima audiencia activa.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Red Eléctrica de España publica solo 2 veces por semana en LinkedIn, pero cada post genera 50+ comentarios técnicos y 1,200+ reacciones, superando a competidores que publican diariamente.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Métricas de Negocio Real: Más Allá de las Vanity Metrics</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, las métricas que importan son: (1) Coste de Adquisición por Canal (CAC), (2) Valor de Vida del Cliente Social (CLV-Social), (3) Tasa de Conversión Atribuida, (4) Share of Voice cualitativo, (5) Engagement Rate Ponderado por Valor. Implementa un dashboard que conecte métricas sociales con ingresos reales. Usa meskeIA Calculadora ROI Marketing para trackear el impacto económico completo, no solo métricas de plataforma. El objetivo: cada euro invertido en redes sociales debe generar mínimo 3€ de retorno medible.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Inditex (Zara) mide 'Social Commerce Conversion': de cada 1,000 personas que ven un post, 47 visitan web, 12 añaden al carrito, 8 compran. Su ROI social promedio es 4,2€ por cada euro invertido.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Domina 2-3 plataformas en lugar de dispersarte en todas</li>
            <li>Cada publicación debe tener un objetivo ACCC específico y medible</li>
            <li>Menos frecuencia, más valor: la calidad supera cantidad exponencialmente</li>
            <li>Métricas conectadas a ingresos reales, no vanity metrics sin impacto</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Realiza una auditoría completa de tus canales actuales usando el método de los 3 criterios</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Implementa el framework ACCC con KPIs específicos para cada objetivo por plataforma</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Reduce tu frecuencia de publicación 50% y duplica el tiempo de creación por post</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Configura un dashboard de ROI real usando meskeIA para medir impacto económico directo</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Puedo demostrar con datos exactos cuántos euros genera cada red social para mi negocio?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Estoy creando contenido porque 'hay que estar' o porque genera resultados medibles?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2025, el 73% de las empresas españolas con mejor ROI en redes sociales están presentes en máximo 3 plataformas, mientras que el 89% de las que reportan pérdidas intentan estar en 6 o más canales.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
