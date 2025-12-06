'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function PseudocienciaPage() {
  return (
    <ChapterPage chapterId="pseudociencia">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En la era digital, estamos constantemente expuestos a una avalancha de información donde se mezclan datos científicos rigurosos con afirmaciones pseudocientíficas y teorías conspirativas. La capacidad de distinguir entre ciencia legítima y pseudociencia se ha vuelto una habilidad fundamental para navegar responsablemente en el mundo moderno y tomar decisiones informadas sobre nuestra salud, medio ambiente y sociedad.</p>
      </section>

        {/* Sección: Identificando la Pseudociencia: Señales de Alerta */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Identificando la Pseudociencia: Señales de Alerta</h2>
          </div>
          <p>La pseudociencia se presenta como científica, pero carece de los fundamentos metodológicos rigurosos que caracterizan a la ciencia genuina. Una de las características más distintivas es la ausencia de falsabilidad: mientras que las teorías científicas pueden ser refutadas mediante evidencia empírica, las afirmaciones pseudocientíficas suelen formularse de manera que no pueden ser probadas como falsas.</p>
          <p>Otra señal de alarma es el uso de testimonios anecdóticos como evidencia principal. La pseudociencia frecuentemente se basa en historias personales emotivas en lugar de estudios controlados y replicables. También es común el uso de lenguaje técnico impresionante pero vacío de contenido real, diseñado más para intimidar que para explicar.</p>
          <p>Las afirmaciones extraordinarias sin evidencia extraordinaria son otra característica típica. Mientras que la ciencia real requiere múltiples estudios independientes para validar hallazgos significativos, la pseudociencia a menudo hace proclamas revolucionarias basadas en evidencia débil o inexistente. Además, suele presentar teorías que permanecen estáticas y no evolucionan con nueva información, a diferencia del conocimiento científico que se refina constantemente.</p>
          <p>La pseudociencia también tiende a apelar a la autoridad de manera inapropiada, citando a supuestos expertos que carecen de credenciales relevantes en el campo específico, o utilizando títulos impresionantes pero irrelevantes para el tema en cuestión.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Los productos de 'agua alcalina milagrosa' que se venden en México prometen curar desde cáncer hasta diabetes. Usan terminología científica como 'reestructuración molecular' y citan testimonios emotivos, pero evitan mencionar estudios clínicos rigurosos. Cuando se les pregunta por evidencia científica, recurren a teorías conspirativas sobre la industria farmacéutica.</p>
          </div>
        </section>

        {/* Sección: Anatomía de las Teorías Conspirativas: Patrones y Mecanismos */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Anatomía de las Teorías Conspirativas: Patrones y Mecanismos</h2>
          </div>
          <p>Las teorías conspirativas comparten patrones estructurales reconocibles que las hacen atractivas pero problemáticas desde el punto de vista epistemológico. Funcionan bajo la lógica del 'diseño inteligente malévolo', donde eventos complejos o aleatorios se atribuyen a la acción coordinada de grupos poderosos con agendas ocultas.</p>
          <p>Un elemento central es la resistencia a la refutación: cuando se presenta evidencia que contradice la teoría, ésta se reinterpreta como parte de la conspiración misma, creando un sistema de creencias autoinmune a la crítica. Este fenómeno, conocido como 'immunizing strategy', convierte cualquier contraargumento en confirmación adicional de la teoría.</p>
          <p>Las teorías conspirativas también explotan sesgos cognitivos naturales como el sesgo de confirmación y la tendencia a buscar patrones incluso donde no los hay. Proporcionan explicaciones simples para fenómenos complejos, satisfaciendo nuestra necesidad psicológica de control y comprensión del mundo.</p>
          <p>Otro aspecto crucial es cómo estas teorías crean identidad grupal y pertenencia. Los creyentes se ven como una minoría ilustrada que ha 'despertado' a la verdad, mientras que quienes no aceptan la teoría son considerados ignorantes o cómplices. Esta dinámica social refuerza la adherencia a la creencia y dificulta el cambio de opinión.</p>
          <p>La propagación digital ha amplificado estos fenómenos, creando cámaras de eco donde las teorías conspirativas se refuerzan mutuamente y evolucionan rápidamente, adaptándose a nuevos eventos y incorporando elementos diversos en narrativas cada vez más complejas.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Durante la pandemia de COVID-19 circuló ampliamente en WhatsApp la teoría de que el virus fue creado deliberadamente para controlar la población. Cuando se mostraba evidencia científica sobre su origen natural, los proponentes argumentaban que los científicos estaban 'comprados' o amenazados, convirtiendo cada refutación en 'prueba' adicional de la conspiración.</p>
          </div>
        </section>

        {/* Sección: Desarrollando Pensamiento Crítico: Herramientas contra la Desinformación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Desarrollando Pensamiento Crítico: Herramientas contra la Desinformación</h2>
          </div>
          <p>El pensamiento crítico es nuestra mejor defensa contra la desinformación y requiere el desarrollo de habilidades específicas y hábitos mentales saludables. La primera herramienta fundamental es la verificación de fuentes: antes de aceptar o compartir información, debemos evaluar la credibilidad de quien la presenta, sus calificaciones, conflictos de interés potenciales y el historial de precisión de sus afirmaciones previas.</p>
          <p>La triangulación de información es otra estrategia esencial: contrastar la misma información en múltiples fuentes independientes y confiables. Si una afirmación extraordinaria aparece solo en un sitio web o cadena de WhatsApp, es motivo de sospecha inmediata. Las noticias científicas legítimas suelen ser reportadas por múltiples medios especializados y pueden rastrearse hasta publicaciones académicas revisadas por pares.</p>
          <p>Es crucial desarrollar tolerancia a la incertidumbre. Mientras que las teorías conspirativas y la pseudociencia ofrecen certezas reconfortantes, la ciencia real frecuentemente presenta rangos de probabilidad y reconoce limitaciones en el conocimiento actual. Aprender a sentirse cómodo diciendo 'no lo sé' o 'la evidencia aún no es concluyente' es una marca de madurez intelectual.</p>
          <p>La alfabetización estadística básica es invaluable para evaluar afirmaciones cuantitativas. Entender conceptos como correlación versus causalidad, tamaño de muestra, y significancia estadística nos ayuda a evaluar estudios y encuestas que circulan en medios populares.</p>
          <p>Finalmente, debemos cultivar la metacognición: la capacidad de reflexionar sobre nuestros propios procesos de pensamiento, reconocer nuestros sesgos y estar dispuestos a cambiar de opinión cuando la evidencia lo justifique.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Antes de creer un artículo de Facebook sobre una 'cura natural' para la hipertensión, un pensador crítico verificaría: ¿quién escribió el artículo y qué credenciales tiene? ¿Se cita algún estudio científico real? ¿Qué dicen fuentes médicas establecidas como la OMS o universidades reconocidas? ¿La afirmación parece demasiado buena para ser verdad?</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La pseudociencia carece de falsabilidad y se basa en testimonios anecdóticos en lugar de evidencia rigurosa</li>
            <li>Las teorías conspirativas son inmunes a la refutación porque reinterpretan cualquier contraargumento como confirmación adicional</li>
            <li>El pensamiento crítico requiere verificar fuentes, triangular información y desarrollar tolerancia a la incertidumbre</li>
            <li>La alfabetización científica y estadística básica son herramientas esenciales para evaluar afirmaciones en la era digital</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Puedes identificar alguna creencia que hayas tenido en el pasado que ahora reconoces como pseudocientífica? ¿Qué te ayudó a cambiar de opinión?</li>
            <li>¿Cómo puedes aplicar las herramientas de pensamiento crítico en tu vida diaria, especialmente al consumir información en redes sociales?</li>
            <li>¿De qué manera los sesgos cognitivos naturales pueden hacernos más susceptibles a teorías conspirativas, y cómo podemos contrarrestar esta tendencia?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El término 'pseudociencia' fue popularizado por el filósofo Karl Popper en los años 1930, pero el fenómeno es mucho más antiguo. Los antiguos alquimistas ya utilizaban lenguaje técnico impresionante y afirmaciones grandiosas sin evidencia empírica sólida, demostrando que la tendencia humana a crear conocimiento aparentemente científico pero metodológicamente deficiente ha existido durante milenios.</p>
      </div>
    </ChapterPage>
  );
}
