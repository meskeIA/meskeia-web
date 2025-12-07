'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoMarketingDigital.module.css';

export default function InfluencerMarketingPage() {
  return (
    <ChapterPage chapterId="influencer-marketing">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            El marketing de influencers ha experimentado una revolución completa en 2025, evolucionando hacia un ecosistema sofisticado donde la autenticidad supera al alcance masivo. Las marcas españolas más exitosas han descubierto que un nano-influencer con 3.000 seguidores genuinamente comprometidos puede generar un ROI hasta 5 veces superior a una celebrity con millones de followers pasivos. Esta transformación ha redefinido completamente las estrategias: ya no se trata de impresiones, sino de conexiones reales, engagement auténtico y conversiones medibles. En este nuevo paradigma, las empresas que dominan la selección estratégica de influencers y la creación de contenido colaborativo están obteniendo ventajas competitivas significativas en el mercado digital español.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>La Nueva Taxonomía de Influencers en 2025</h2>
          <div className={styles.sectionContent}>
            <p>El ecosistema de influencers se ha refinado considerablemente: Nano-influencers (1K-10K seguidores) dominan nichos hiperlocales, Micro-influencers (10K-100K) lideran sectores específicos, Mid-tier influencers (100K-1M) cubren audiencias regionales, y Macro-influencers (1M+) se reservan para campañas de branding masivo. Los nano y micro-influencers representan el 78% del engagement genuino en 2025, especialmente efectivos en sectores como wellness, tecnología sostenible, gastronomía local y moda consciente. Su fuerza radica en la proximidad emocional con sus audiencias, generando tasas de conversión que superan el 12% en campañas bien ejecutadas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Caso Freshly Cosmetics: En 2024 utilizaron 50 nano-influencers de belleza natural, logrando un ROAS de 4,8€ por cada euro invertido, superando sus campañas tradicionales de Google Ads por primera vez en su historia.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Micro-Influencers: La Fórmula de la Conversión Auténtica</h2>
          <div className={styles.sectionContent}>
            <p>Los micro-influencers han demostrado ser el eslabón perfecto entre credibilidad y alcance. Sus audiencias los perciben como 'expertos accesibles', generando un nivel de confianza que se traduce en tasas de engagement del 8-12% y conversiones del 6-15%. En 2025, su valor se multiplica porque ofrecen contenido auténtico, responden personalmente a comentarios y mantienen relaciones genuinas con sus seguidores. Sus tarifas oscilan entre 300-2.000€ por colaboración, permitiendo campañas diversificadas y segmentadas que maximizan el ROI. Además, su contenido tiene mayor vida útil y genera más interacciones orgánicas a largo plazo.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Una micro-influencer de lifestyle sostenible con 25.000 seguidores puede generar más ventas directas para una marca de cosmética ecológica que un celebrity con 800.000 followers generalistas, debido a la relevancia y confianza de su audiencia.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>UGC 2.0: El Contenido Auténtico que Convierte</h2>
          <div className={styles.sectionContent}>
            <p>El User Generated Content ha evolucionado hacia UGC 2.0, donde la espontaneidad calculada reina suprema. Las marcas buscan contenidos 'imperfectos' grabados con smartphones, stories casuales y testimonios naturales que transmitan experiencias reales sin sobreproducción. Esta estrategia reduce costes de producción hasta un 60% mientras aumenta la credibilidad exponencialmente. Las campañas de UGC generan 8,5 veces más engagement que el contenido tradicional de marca y tienen un 73% más probabilidad de ser compartidas orgánicamente. La clave está en proporcionar frameworks creativos sin limitar la autenticidad del creador.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Primor lanzó #MiRutinaPrimor donde usuarios reales mostraban sus rutinas de belleza, generando más de 2 millones de visualizaciones orgánicas y aumentando las ventas online un 34% en el trimestre de la campaña.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategias Avanzadas de Colaboración en 2025</h2>
          <div className={styles.sectionContent}>
            <p>Las colaboraciones exitosas requieren un enfoque científico y humanizado. El proceso incluye: 1) Análisis profundo con herramientas como el Analizador de Influencers de meskeIA para verificar audiencias reales y detectar bots, 2) Establecimiento de KPIs híbridos (engagement, conversiones, brand sentiment), 3) Contratos flexibles con incentivos por performance, 4) Co-creación de contenidos que respeten la voz del influencer. Las marcas líderes invierten el 40% de su presupuesto en micro-influencers locales, 35% en mid-tier especializados y 25% en campañas macro para awareness. El presupuesto promedio mensual para marcas medianas oscila entre 5.000-15.000€ distribuido estratégicamente.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Utilizando el Generador UTM de meskeIA, las marcas pueden trackear con precisión qué influencers generan más tráfico cualificado y optimizar sus inversiones en tiempo real, mejorando el ROI hasta un 45%.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Los nano y micro-influencers generan 78% más engagement real que los macro-influencers en 2025</li>
            <li>UGC 2.0 con contenido 'imperfecto' aumenta credibilidad y reduce costes de producción en 60%</li>
            <li>La proximidad emocional vale más que el número de seguidores para generar conversiones</li>
            <li>Las estrategias híbridas local-digital son clave para el éxito en el mercado español actual</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Audita 15-20 micro-influencers de tu sector usando herramientas de análisis de audiencia real</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Desarrolla un briefing creativo flexible que mantenga la autenticidad del creador</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Implementa códigos UTM únicos para trackear conversiones específicas de cada colaboración</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Crea un sistema de incentivos por performance que premie resultados reales, no solo métricas de vanidad</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Estás midiendo el impacto real de tus influencers más allá de likes y comentarios?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tus colaboraciones actuales reflejan genuinamente los valores de tu marca y conectan con tu cliente ideal?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>En 2025, el 73% de las marcas españolas exitosas han reducido su inversión en macro-influencers, redistribuyendo el 68% de ese presupuesto hacia micro y nano-influencers locales, generando ROIs hasta 6 veces superiores según el último estudio de Marketing Digital España.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
