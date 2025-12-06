'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function DifusionIdeasPage() {
  return (
    <ChapterPage chapterId="difusion-ideas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En la era digital, las ideas no solo se propagan más rápido que nunca, sino que lo hacen siguiendo patrones específicos que pueden determinar qué información prevalece y cuál desaparece. Comprender estos mecanismos es fundamental para navegar críticamente en el océano de información contemporáneo y participar de manera consciente en la construcción del conocimiento colectivo.</p>
      </section>

        {/* Sección: Redes Sociales y la Viralidad del Conocimiento */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Redes Sociales y la Viralidad del Conocimiento</h2>
          </div>
          <p>Las redes sociales han transformado radicalmente la velocidad y el alcance con que se difunden las ideas. A diferencia de los medios tradicionales, donde la información fluía de manera unidireccional desde instituciones autorizadas hacia el público, las plataformas digitales permiten que cualquier usuario se convierta en un nodo de distribución de conocimiento. Este cambio democratiza el acceso a la información, pero también introduce nuevos desafíos epistemológicos.</p>
          <p>La viralidad funciona siguiendo principios matemáticos similares a los de una epidemia: una idea necesita alcanzar un 'número reproductivo básico' superior a 1 para expandirse exponencialmente. Sin embargo, no todas las ideas virales poseen valor epistémico. Las características que favorecen la viralidad —simplicidad, carga emocional, capacidad de generar reacciones inmediatas— no siempre coinciden con las que definen al conocimiento riguroso: complejidad, matices, verificabilidad y precisión.</p>
          <p>El algoritmo de cada plataforma actúa como un filtro epistémico invisible que prioriza contenido basado en métricas de engagement (likes, comentarios, compartidos) más que en criterios de veracidad o relevancia científica. Esto crea un ecosistema donde las ideas más atractivas emocionalmente pueden superar a las más precisas empíricamente.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Durante la pandemia de COVID-19, información médica simplificada como 'remedios caseros milagrosos' se viralizó más rápidamente en WhatsApp y Facebook que estudios científicos complejos sobre tratamientos efectivos, precisamente porque la primera era más fácil de entender y compartir.</p>
          </div>
        </section>

        {/* Sección: Sesgos de Confirmación: Filtros Cognitivos en la Recepción de Ideas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Sesgos de Confirmación: Filtros Cognitivos en la Recepción de Ideas</h2>
          </div>
          <p>El sesgo de confirmación representa uno de los obstáculos más significativos para la propagación objetiva del conocimiento. Este mecanismo cognitivo nos predispone a buscar, interpretar y recordar información que confirma nuestras creencias preexistentes, mientras tendemos a ignorar o descartar evidencia contradictoria. Desde una perspectiva evolutiva, este sesgo pudo haber sido adaptativo al permitir decisiones rápidas en entornos peligrosos, pero en el contexto de la construcción de conocimiento representa un filtro distorsionador.</p>
          <p>Cuando una idea nueva circula por redes sociales, no encuentra una audiencia neutral. Cada receptor la procesa a través de sus marcos conceptuales previos, experiencias personales y afiliaciones grupales. Las ideas que desafían significativamente nuestros esquemas mentales generan disonancia cognitiva —una tensión psicológica incómoda— que tendemos a resolver desestimando la nueva información en lugar de revisar nuestras creencias.</p>
          <p>Este fenómeno se intensifica en el entorno digital debido al 'efecto de mera exposición': cuanto más frecuentemente encontramos una idea, más familiar y creíble nos parece, independientemente de su veracidad. Los algoritmos, al mostrar contenido similar al que previamente hemos consumido, refuerzan este ciclo de confirmación, creando espirales de certidumbre ilusoria.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En debates sobre cambio climático en redes sociales argentinas, usuarios que inicialmente dudan de la influencia humana tienden a compartir únicamente estudios que cuestionan el consenso científico, ignorando la abrumadora evidencia que lo respalda, incluso cuando proviene de instituciones prestigiosas como el CONICET.</p>
          </div>
        </section>

        {/* Sección: Cámaras de Eco: La Fragmentación Epistémica del Espacio Público */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Cámaras de Eco: La Fragmentación Epistémica del Espacio Público</h2>
          </div>
          <p>Las cámaras de eco representan espacios comunicativos donde las ideas circulan principalmente entre individuos con perspectivas similares, amplificándose y radicalizándose sin enfrentar contraargumentación significativa. A diferencia del sesgo de confirmación —que es un fenómeno individual— las cámaras de eco constituyen estructuras sociales que moldean colectivamente la percepción de la realidad.</p>
          <p>En el entorno digital, las cámaras de eco emergen tanto por selección activa (elegimos seguir a personas afines) como por filtrado algorítmico (las plataformas nos muestran contenido similar al que ya consumimos). Esta segmentación epistemológica fragmenta el espacio público en múltiples realidades paralelas, donde diferentes grupos pueden mantener versiones incompatibles de los 'hechos' sobre un mismo fenómeno.</p>
          <p>El peligro epistémico de las cámaras de eco radica en que generan una ilusión de consenso: al estar expuestos principalmente a personas que piensan como nosotros, sobrestimamos cuánta gente comparte nuestras creencias y subestimamos la fuerza de posiciones alternativas. Esto erosiona la función correctiva del debate público, donde tradicionalmente las ideas débiles eran expuestas a crítica y refinadas o descartadas.</p>
          <p>Las cámaras de eco también aceleran la polarización epistémica: cuando las ideas circulan sin oposición, tienden a volverse más extremas. Un grupo que inicialmente tenía una posición moderada sobre un tema puede, a través de la discusión repetida entre miembros afines, adoptar versiones más radicales de esa misma posición.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En grupos de WhatsApp de padres de familia en México, la desconfianza inicial hacia ciertas vacunas puede evolucionar hacia posiciones completamente antivacunas cuando los miembros solo comparten estudios desacreditados y testimonios anecdóticos, sin exposición a evidencia médica robusta o perspectivas pediatras especializadas.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La viralidad en redes sociales no garantiza la veracidad o calidad epistémica de las ideas</li>
            <li>Los sesgos de confirmación actúan como filtros cognitivos que distorsionan la recepción objetiva de nueva información</li>
            <li>Las cámaras de eco fragmentan el espacio público en múltiples realidades epistémicas paralelas</li>
            <li>Los algoritmos de redes sociales pueden amplificar estos sesgos cognitivos y crear espirales de polarización</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo puedes identificar cuándo estás operando dentro de una cámara de eco en tu consumo de información digital?</li>
            <li>¿Qué estrategias podrías implementar para exponerte deliberadamente a perspectivas que desafíen tus creencias actuales?</li>
            <li>¿De qué manera los sesgos de confirmación podrían estar influyendo en tu evaluación de información sobre temas importantes como salud, política o medio ambiente?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Un estudio de 2018 del MIT encontró que las noticias falsas se propagan seis veces más rápido que las verdaderas en Twitter, y alcanzan a 1,500 personas 35% más rápido. Paradójicamente, esto no se debe a bots, sino a humanos reales que encuentran las noticias falsas más 'novedosas' y emocionalmente impactantes, lo que las hace más propensas a ser compartidas.</p>
      </div>
    </ChapterPage>
  );
}
