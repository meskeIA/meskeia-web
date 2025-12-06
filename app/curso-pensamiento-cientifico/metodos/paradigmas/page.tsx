'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function ParadigmasPage() {
  return (
    <ChapterPage chapterId="paradigmas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La ciencia no progresa de manera lineal y acumulativa como tradicionalmente se pensaba. Thomas Kuhn revolucionó nuestra comprensión del desarrollo científico al mostrar que la ciencia avanza a través de paradigmas que ocasionalmente experimentan revoluciones dramáticas, cambiando completamente nuestra forma de entender la realidad.</p>
      </section>

        {/* Sección: Thomas Kuhn y la Teoría de los Paradigmas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Thomas Kuhn y la Teoría de los Paradigmas</h2>
          </div>
          <p>Thomas Kuhn, físico y filósofo estadounidense, transformó nuestra comprensión de cómo progresa la ciencia con su obra 'La estructura de las revoluciones científicas' (1962). Kuhn introdujo el concepto de 'paradigma', que define como el conjunto de creencias, valores, técnicas y logros compartidos por una comunidad científica específica. Un paradigma no es simplemente una teoría, sino toda una cosmovisión que determina qué preguntas son válidas, qué métodos son apropiados y qué respuestas son aceptables.</p>
          <p>Según Kuhn, los paradigmas funcionan como marcos conceptuales que guían la investigación científica durante períodos de 'ciencia normal'. Estos marcos no solo incluyen teorías específicas, sino también instrumentos, técnicas experimentales, criterios de evaluación y formas particulares de ver el mundo. Un paradigma exitoso debe ser suficientemente atractivo para ganar adherentes de otros enfoques competitivos, pero también debe ser lo suficientemente abierto como para permitir que los científicos resuelvan problemas dentro de su marco.</p>
          <p>Los paradigmas también determinan qué constituye un problema legítimo y qué cuenta como una solución válida. Cuando los científicos trabajan dentro de un paradigma establecido, no cuestionan sus fundamentos básicos, sino que se dedican a resolver 'rompecabezas' o problemas específicos utilizando las herramientas conceptuales y metodológicas que el paradigma proporciona.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> El paradigma geocéntrico de Ptolomeo dominó la astronomía durante más de mil años. Los astrónomos no cuestionaban si la Tierra estaba en el centro del universo, sino que perfeccionaban los cálculos de las órbitas planetarias usando epiciclos y deferentes para explicar los movimientos observados.</p>
          </div>
        </section>

        {/* Sección: Ciencia Normal versus Revoluciones Científicas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Ciencia Normal versus Revoluciones Científicas</h2>
          </div>
          <p>Kuhn distingue entre dos tipos fundamentales de actividad científica: la ciencia normal y las revoluciones científicas. La ciencia normal representa la mayor parte del trabajo científico cotidiano, donde los investigadores trabajan dentro de un paradigma establecido resolviendo problemas específicos o 'rompecabezas'. Durante estos períodos, los científicos no intentan crear nuevas teorías fundamentales, sino que refinan, extienden y aplican el paradigma dominante a nuevos casos.</p>
          <p>Sin embargo, ocasionalmente surgen 'anomalías': observaciones o resultados experimentales que no pueden explicarse satisfactoriamente dentro del paradigma existente. Inicialmente, estas anomalías se consideran problemas técnicos temporales o errores experimentales. Pero cuando las anomalías se acumulan y persisten, pueden generar una 'crisis' que eventualmente lleva a una revolución científica.</p>
          <p>Las revoluciones científicas son períodos extraordinarios donde se abandona un paradigma establecido en favor de uno nuevo e incompatible. Estos cambios no son simplemente adiciones al conocimiento existente, sino transformaciones fundamentales en la forma de entender la realidad. Durante una revolución, cambian no solo las respuestas a preguntas específicas, sino las preguntas mismas que se consideran importantes y legítimas.</p>
          <p>El proceso revolucionario es complejo y no se basa únicamente en evidencia empírica. Factores sociológicos, psicológicos y hasta estéticos influyen en la adopción de nuevos paradigmas. Los científicos jóvenes suelen ser más receptivos a las innovaciones paradigmáticas, mientras que los investigadores establecidos pueden resistir el cambio.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La medicina tradicional mexicana enfrentó una revolución paradigmática con la llegada de la medicina occidental. Mientras la medicina indígena se basaba en el equilibrio energético y el uso de plantas medicinales, la medicina occidental introdujo conceptos como gérmenes, cirugía y medicamentos sintéticos, cambiando completamente la comprensión de la salud y enfermedad.</p>
          </div>
        </section>

        {/* Sección: Del Reduccionismo al Pensamiento Sistémico */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Del Reduccionismo al Pensamiento Sistémico</h2>
          </div>
          <p>El paradigma científico occidental tradicionalmente se ha caracterizado por un enfoque reduccionista, que busca entender fenómenos complejos descomponiéndolos en sus partes más simples. Este enfoque, heredado de Descartes y Newton, asume que el todo puede entenderse completamente estudiando sus componentes individuales. El reduccionismo ha sido extraordinariamente exitoso en áreas como la física y la química, permitiendo avances tecnológicos impresionantes.</p>
          <p>Sin embargo, durante el siglo XX emergió gradualmente un nuevo paradigma: el pensamiento sistémico. Este enfoque reconoce que muchos fenómenos exhiben propiedades 'emergentes' que no pueden predecirse o explicarse simplemente estudiando sus componentes aislados. Los sistemas complejos, desde ecosistemas hasta organizaciones sociales, muestran comportamientos que surgen de las interacciones entre sus partes.</p>
          <p>El pensamiento sistémico enfatiza las relaciones, patrones y procesos dinámicos en lugar de elementos estáticos. Ve la realidad como una red interconectada de relaciones donde el contexto y las conexiones son tan importantes como los elementos individuales. Este cambio paradigmático ha influido profundamente en campos como la biología, la ecología, la psicología, la medicina integrativa y las ciencias sociales.</p>
          <p>La transición del reduccionismo al pensamiento sistémico representa una revolución kuhniana contemporánea. No se trata de abandonar completamente el reduccionismo, sino de reconocer sus limitaciones y complementarlo con enfoques más holísticos cuando sea apropiado. Esta transición refleja una comprensión más madura de la complejidad inherente en muchos fenómenos naturales y sociales.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La comprensión de la biodiversidad en la selva amazónica ilustra esta transición. El enfoque reduccionista catalogaría especies individuales, mientras que el pensamiento sistémico examina las redes de interdependencia: cómo los jaguares regulan poblaciones de herbívoros, que a su vez afectan la vegetación, que influye en el clima local, creando un sistema complejo donde cada elemento depende de todos los demás.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Los paradigmas son marcos conceptuales compartidos que guían la investigación científica y determinan qué preguntas y métodos son válidos</li>
            <li>La ciencia progresa a través de períodos de ciencia normal interrumpidos por revoluciones que cambian paradigmas fundamentales</li>
            <li>Las revoluciones científicas no son solo cambios teóricos, sino transformaciones completas en la visión del mundo</li>
            <li>El pensamiento sistémico representa una revolución paradigmática contemporánea que complementa el reduccionismo tradicional</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Puedes identificar algún paradigma dominante en tu campo de estudio o profesión que influya en cómo se abordan los problemas?</li>
            <li>¿Qué anomalías o problemas persistentes observas en tu área de interés que podrían señalar la necesidad de un cambio paradigmático?</li>
            <li>¿Cómo podría aplicarse el pensamiento sistémico para abordar problemas complejos en tu comunidad, como la pobreza, la contaminación o la educación?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Kuhn acuñó el término 'paradigma' inspirándose en la palabra griega 'paradeigma', que significa 'patrón' o 'ejemplo'. Curiosamente, antes de escribir su obra revolucionaria, Kuhn era físico y nunca había estudiado formalmente historia o filosofía de la ciencia. Su perspectiva 'externa' le permitió ver patrones que los filósofos de la ciencia tradicionales habían pasado por alto.</p>
      </div>
    </ChapterPage>
  );
}
