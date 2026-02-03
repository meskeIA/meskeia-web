'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function QueEsCienciaPage() {
  return (
    <ChapterPage chapterId="que-es-ciencia">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La ciencia es una de las formas más poderosas que tenemos para comprender el mundo que nos rodea, desde el funcionamiento de nuestros smartphones hasta los misterios del universo. Sin embargo, ¿qué distingue al conocimiento científico de otras formas de entender la realidad como la religión, la filosofía o el sentido común?</p>
      </section>

        {/* Sección: Definición y características de la ciencia */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Definición y características de la ciencia</h2>
          </div>
          <p>La ciencia es un sistema organizado de conocimientos sobre el mundo natural y social, obtenido mediante métodos específicos que buscan la objetividad y la precisión. No es simplemente una colección de datos o hechos curiosos, sino una forma particular de aproximarse a la realidad que se caracteriza por ser sistemática, metódica y autocorrectiva.</p>
          <p>Las características fundamentales de la ciencia incluyen: la búsqueda de explicaciones naturales para los fenómenos observados, la formulación de hipótesis que puedan ser puestas a prueba, la reproducibilidad de los experimentos y observaciones, y la construcción de teorías que unifiquen y expliquen múltiples fenómenos. Además, la ciencia es acumulativa: cada nueva generación de científicos construye sobre el trabajo de las anteriores, refinando, corrigiendo y expandiendo nuestro conocimiento.</p>
          <p>Una característica esencial es que la ciencia es falible y provisional. Esto no es una debilidad, sino una fortaleza: significa que está abierta a la corrección y mejora constante. Las teorías científicas no son verdades absolutas grabadas en piedra, sino las mejores explicaciones disponibles con la evidencia actual, siempre sujetas a revisión si aparecen nuevos datos que las contradigan.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando un médico diagnostica una enfermedad, no se basa en intuiciones o tradiciones familiares, sino en síntomas observables, análisis de laboratorio reproducibles y conocimiento médico respaldado por miles de estudios. Si aparece nueva evidencia, el diagnóstico puede cambiar.</p>
          </div>
        </section>

        {/* Sección: Diferencias con otras formas de conocimiento */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Diferencias con otras formas de conocimiento</h2>
          </div>
          <p>Aunque la ciencia es una forma valiosa de conocimiento, no es la única. Coexiste con otras formas legítimas de entender la realidad, cada una con sus propios métodos y propósitos. El conocimiento religioso, por ejemplo, aborda preguntas sobre el sentido de la vida, los valores morales y la trascendencia, utilizando la fe, la revelación y la tradición como fuentes de autoridad.</p>
          <p>El conocimiento filosófico emplea la razón y la argumentación lógica para explorar preguntas fundamentales sobre la existencia, la ética y el conocimiento mismo. A diferencia de la ciencia, no necesariamente requiere evidencia empírica y puede abordar cuestiones que van más allá de lo observable.</p>
          <p>El sentido común y la sabiduría tradicional, transmitidos de generación en generación, han permitido a las sociedades sobrevivir y prosperar durante milenios. Este conocimiento práctico, aunque valioso, suele basarse en experiencias limitadas y puede contener sesgos o imprecisiones.</p>
          <p>Lo que distingue a la ciencia es su compromiso con la evidencia empírica, la verificación independiente y la disposición a cambiar de opinión ante nueva evidencia. Mientras otras formas de conocimiento pueden valorar la tradición, la autoridad o la fe, la ciencia privilegia la observación sistemática y la experimentación controlada.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Ante una epidemia, la medicina tradicional podría recomendar hierbas basándose en siglos de uso, la religión podría ofrecer consuelo espiritual y explicaciones sobre el sufrimiento, mientras que la ciencia buscaría identificar el patógeno, entender su mecanismo de transmisión y desarrollar tratamientos basados en evidencia experimental.</p>
          </div>
        </section>

        {/* Sección: Los cuatro pilares: empirismo, racionalidad, verificación e imaginación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Los cuatro pilares: empirismo, racionalidad, verificación e imaginación</h2>
          </div>
          <p>La ciencia se sustenta en cuatro pilares fundamentales que trabajan en conjunto. El empirismo es la base: el conocimiento científico debe estar fundamentado en la experiencia y la observación. Los científicos no pueden simplemente especular; deben salir al mundo, observar, medir y experimentar. Este pilar nos recuerda que la realidad externa es el juez final de nuestras ideas.</p>
          <p>La racionalidad exige que las explicaciones científicas sean lógicas, coherentes y estén bien argumentadas. No basta con acumular datos; estos deben organizarse mediante razonamiento riguroso para construir explicaciones que tengan sentido. Las teorías científicas deben ser internamente consistentes y conectar logicamente las evidencias con las conclusiones.</p>
          <p>La verificación implica que las afirmaciones científicas deben poder ser puestas a prueba por investigadores independientes. Si un resultado no puede ser reproducido o verificado por otros, pierde credibilidad científica. Este pilar asegura que el conocimiento científico trascienda las opiniones personales y los sesgos individuales.</p>
          <p>Finalmente, la imaginación es el motor creativo de la ciencia. Los grandes avances científicos requieren capacidad para ver patrones ocultos, formular preguntas originales y concebir explicaciones innovadoras. Sin imaginación, la ciencia sería solo una acumulación mecánica de datos sin mayor significado.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> El descubrimiento de la penicilina por Alexander Fleming ilustra estos cuatro pilares: observó empíricamente que un moho mataba bacterias, razonó sobre las posibles causas, permitió que otros verificaran sus hallazgos, y tuvo la imaginación para ver en un 'accidente' de laboratorio una revolución médica.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La ciencia es un sistema organizado de conocimientos basado en métodos específicos que buscan objetividad y precisión</li>
            <li>Se diferencia de otras formas de conocimiento por su compromiso con la evidencia empírica y la verificación independiente</li>
            <li>Es falible y provisional, lo cual constituye una fortaleza que permite su autocorrección y mejora continua</li>
            <li>Se sustenta en cuatro pilares: empirismo (observación), racionalidad (lógica), verificación (reproducibilidad) e imaginación (creatividad)</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿En qué situaciones de tu vida cotidiana aplicas sin darte cuenta principios del método científico?</li>
            <li>¿Cómo pueden coexistir y complementarse diferentes formas de conocimiento sin entrar en conflicto?</li>
            <li>¿Por qué crees que la característica de ser 'provisional' fortalece en lugar de debilitar el conocimiento científico?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Galileo Galilei tuvo que defender su trabajo científico ante la Inquisición no porque la Iglesia fuera 'anticientífica', sino porque representaba una forma radicalmente nueva de entender cómo conocemos la realidad. Su famosa frase 'Eppur si muove' (Y sin embargo se mueve) simboliza la tensión histórica entre diferentes formas de autoridad del conocimiento.</p>
      </div>
    </ChapterPage>
  );
}
