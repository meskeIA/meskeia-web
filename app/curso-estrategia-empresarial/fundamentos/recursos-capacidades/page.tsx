'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function RecursosCapacidadesPage() {
  return (
    <ChapterPage chapterId="recursos-capacidades">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            Si no puedes controlar el mercado, la competencia o la tecnología, ¿qué puedes controlar? Tus recursos y capacidades. Pero aquí viene la trampa: la mayoría de empresarios se mienten a sí mismos sobre lo que realmente saben hacer bien. Dicen 'somos buenos en atención al cliente' cuando sus reviews son mediocres, o 'tenemos un gran equipo técnico' cuando tardan meses en lanzar una funcionalidad básica. En 2025, con APIs que democratizan casi cualquier tecnología y servicios que puedes contratar por horas, la pregunta no es qué puedes hacer, sino qué puedes hacer mejor que nadie. Y más importante: qué puedes hacer que sea imposible de copiar rápidamente.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Inventario Brutal: Qué Tienes Realmente</h2>
          <div className={styles.sectionContent}>
            <p>Antes de hablar de capacidades distintivas, necesitas un inventario honesto. Los recursos tangibles son fáciles: dinero, oficinas, equipos, inventario. Los intangibles son donde está el valor real: marca, datos, relaciones, conocimiento, cultura. Pero cuidado con el autoengaño. Tener 10.000 seguidores en LinkedIn no es 'una marca fuerte'. Tener datos de clientes no es 'inteligencia de mercado' si no sabes interpretarlos. El framework VRIO sigue siendo útil: ¿es Valioso? ¿es Raro? ¿es Inimitable? ¿está tu Organización preparada para explotarlo? En 2025, añade una quinta pregunta: ¿es Defendible ante la IA? Porque si ChatGPT puede replicar tu 'expertise' en copywriting, no era tan distintivo como creías.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Zara no tiene la mejor tecnología ni los mejores diseñadores. Su capacidad distintiva real es la velocidad: pueden llevar una idea del diseño a la tienda en 2 semanas. Eso requiere integración vertical, relaciones con proveedores, sistemas de información y una cultura de urgencia que tardaron décadas en construir. Amazon Web Services no empezó queriendo ser líder en cloud; era su infraestructura interna que decidieron monetizar.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Capacidades vs Actividades: La Diferencia Que Importa</h2>
          <div className={styles.sectionContent}>
            <p>Una actividad es algo que haces. Una capacidad es algo que haces excepcionalmente bien, de forma consistente y difícil de replicar. McDonald's no cocina hamburguesas; tiene la capacidad de entregar comida consistente a escala global con trabajadores sin experiencia. Netflix no hace streaming; tiene la capacidad de predecir qué querrás ver antes de que lo sepas tú mismo. Las capacidades distintivas tienen tres características: son específicas de tu contexto, mejoran con el uso y requieren múltiples elementos trabajando juntos. En la era de las APIs, cualquiera puede integrar pagos, enviar emails o procesar datos. La capacidad distintiva está en cómo combinas esas piezas de forma única.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Spotify vs Apple Music: ambos tienen acceso a la misma música, usan tecnologías similares y tienen aplicaciones comparables. Pero Spotify desarrolló la capacidad de crear playlists que se sienten personales. Eso requiere algoritmos, datos de comportamiento, comprensión cultural, y equipos de curadores humanos trabajando juntos. Apple, con todos sus recursos, no ha podido replicarlo completamente.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Core Competencies: Más Allá del Marketing</h2>
          <div className={styles.sectionContent}>
            <p>Las core competencies no son lo que pones en tu página web. Son capacidades que: 1) proporcionan acceso a múltiples mercados, 2) contribuyen significativamente al valor percibido por el cliente, y 3) son difíciles de imitar. Honda no fabrica coches; domina motores pequeños y eficientes. Eso les permite competir en coches, motos, cortacéspedes y generadores. 3M no hace productos; domina adhesivos, abrasivos y materiales. En startups, la core competency suele ser menos obvia: puede ser tu capacidad de aprender rápido, de atraer talento específico, o de entender profundamente un nicho de mercado. Pero cuidado: en mercados que cambian rápido, las core competencies pueden convertirse en rigideces que te impiden pivotar.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Kodak tenía una core competency en química de materiales fotográficos. Eso les hizo dominantes durante décadas, pero cuando el mundo se volvió digital, esa misma competencia se convirtió en una trampa. Tenían tanto invertido en conocimiento y activos físicos que no pudieron canibalizar su propio negocio. Mientras tanto, Instagram, sin saber nada de fotografía tradicional, redefinió cómo compartimos imágenes.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Build vs Buy vs Partner: La Decisión del Millón</h2>
          <div className={styles.sectionContent}>
            <p>En 2025, esta decisión se toma casi diariamente. ¿Desarrollas tu propio sistema de pagos o usas Stripe? ¿Construyes tu equipo de marketing o contratas una agencia? ¿Creas tu propia IA o usas OpenAI? La regla general: construye solo lo que puede ser distintivo y defendible. Todo lo demás, cómpralo o asóciate. Pero hay matices: construir te da control y aprendizaje, comprar te da velocidad, asociarte te da acceso sin compromiso. El peligro del 'buy everything' es que te conviertes en un integrador sin capacidades distintivas. El peligro del 'build everything' es que te quedas sin recursos para lo que realmente importa.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Uber no construyó mapas (usa Google Maps), no construyó pagos (integra múltiples procesadores), no construyó coches (usa vehículos de terceros). Construyó la capacidad de conectar oferta y demanda de transporte en tiempo real a escala global. Tesla, al contrario, decidió construir baterías, software, chips y hasta su red de carga. Ambas estrategias pueden funcionar, pero requieren recursos y mentalidades completamente diferentes.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Mapa de Capacidades: Tu GPS Estratégico</h2>
          <div className={styles.sectionContent}>
            <p>Necesitas un mapa visual de tus capacidades actuales vs las que necesitas para tu estrategia. Eje X: importancia para tu estrategia (baja a alta). Eje Y: tu nivel actual (débil a fuerte). Cuadrante superior derecho: tus fortalezas distintivas, protégelas y explótalas. Cuadrante inferior derecho: gaps críticos, prioridad máxima para desarrollar o adquirir. Cuadrante superior izquierdo: fortalezas irrelevantes, candidatas para monetizar externamente o eliminar. Este mapa debe actualizarse cada 6 meses porque las capacidades importantes cambian rápido. Y recuerda: es mejor ser excelente en pocas cosas que mediocre en muchas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cuando Reed Hastings fundó Netflix, sus capacidades eran logística de DVDs y algoritmos de recomendación. Cuando decidió hacer streaming, necesitaba capacidades de tecnología de video y negociación de contenido. Cuando decidió crear contenido original, necesitaba capacidades de producción y talento creativo. En cada transición, mantuvieron lo distintivo (datos y personalización) y construyeron o adquirieron el resto.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Las capacidades distintivas son combinaciones únicas de recursos que mejoran con el uso y son difíciles de replicar</li>
            <li>En la era de las APIs, la ventaja está en cómo combinas servicios externos, no en construir todo desde cero</li>
            <li>Las core competencies pueden convertirse en rigideces si el mercado cambia más rápido que tu capacidad de adaptación</li>
            <li>Build vs buy vs partner: construye solo lo que puede ser distintivo y defendible</li>
            <li>Es mejor ser excelente en pocas capacidades que mediocre en muchas</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Haz un inventario brutal: lista 10 cosas que crees que haces bien y pide feedback honesto a clientes y empleados</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Aplica el test VRIO a tus 3 capacidades más importantes: ¿siguen siendo defendibles ante la IA y la competencia actual?</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Crea tu mapa de capacidades: importancia vs nivel actual, identifica los 3 gaps más críticos</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Revisa tus últimas 5 decisiones de build vs buy: ¿construiste cosas que podrías haber comprado más barato y rápido?</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>Si tuvieras que explicar en una frase qué haces mejor que nadie, ¿cuál sería esa frase?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cuáles de tus capacidades actuales seguirán siendo relevantes dentro de 3 años?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿En qué inviertes tiempo y recursos que podrías externalizar para enfocarte en lo distintivo?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>El 70% de las capacidades distintivas de las empresas del Fortune 500 de 1995 eran irrelevantes en 2015. Y el ritmo se está acelerando: las capacidades distintivas de 2020 pueden ser commodities en 2025. La paradoja: nunca han sido más importantes las capacidades distintivas, pero nunca han durado tan poco.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
