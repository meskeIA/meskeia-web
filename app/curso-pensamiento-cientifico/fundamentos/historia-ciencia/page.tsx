'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function HistoriaCienciaPage() {
  return (
    <ChapterPage chapterId="historia-ciencia">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El pensamiento científico, tal como lo conocemos hoy, es el resultado de miles de años de evolución intelectual. Desde las primeras observaciones de los astrónomos babilonios hasta los algoritmos de inteligencia artificial, la humanidad ha desarrollado métodos cada vez más sofisticados para comprender la naturaleza y transformar su entorno.</p>
      </section>

        {/* Sección: De la Antigüedad al Renacimiento: Los Primeros Pasos del Conocimiento */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>De la Antigüedad al Renacimiento: Los Primeros Pasos del Conocimiento</h2>
          </div>
          <p>Las civilizaciones antiguas sentaron las bases del pensamiento científico a través de la observación sistemática y la búsqueda de patrones en la naturaleza. Los babilonios desarrollaron sofisticados calendarios astronómicos que aún influyen en nuestra medición del tiempo, mientras que los egipcios aplicaron principios geométricos para construir las pirámides con una precisión asombrosa.</p>
          <p>En la antigua Grecia, pensadores como Tales de Mileto comenzaron a buscar explicaciones naturales para los fenómenos, alejándose de las interpretaciones puramente míticas. Aristóteles estableció un sistema de clasificación que dominó el pensamiento occidental durante más de mil años, aunque muchas de sus ideas resultaron incorrectas. Su método de observación y categorización, sin embargo, fue fundamental para el desarrollo posterior de la ciencia.</p>
          <p>Durante la Edad Media, el mundo islámico preservó y expandió el conocimiento griego. Científicos como Al-Hazen desarrollaron el método experimental, mientras que Al-Khwarizmi creó el álgebra. En Europa, las universidades medievales comenzaron a institucionalizar el conocimiento, preparando el terreno para los grandes cambios que vendrían con el Renacimiento. Este período vio el resurgimiento del interés por la observación directa de la naturaleza y la experimentación controlada.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando preparas café por las mañanas, estás aplicando conocimientos que se remontan a los alquimistas árabes medievales, quienes perfeccionaron técnicas de destilación y extracción que son fundamentales en este proceso cotidiano.</p>
          </div>
        </section>

        {/* Sección: La Revolución Científica: Transformando Nuestra Visión del Universo */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>La Revolución Científica: Transformando Nuestra Visión del Universo</h2>
          </div>
          <p>Entre los siglos XVI y XVIII, Europa experimentó una transformación radical en su forma de entender el mundo natural. Nicolás Copérnico desafió la visión geocéntrica del universo, proponiendo que la Tierra giraba alrededor del Sol. Esta idea revolucionaria no solo cambió la astronomía, sino que cuestionó la autoridad tradicional y religiosa sobre el conocimiento.</p>
          <p>Galileo Galilei perfeccionó el telescopio y realizó observaciones que confirmaron las teorías copernicanas, enfrentándose a la Inquisición por defender sus descubrimientos. Su método de combinar observación, experimentación y matemáticas estableció un nuevo estándar para la investigación científica. Johannes Kepler descubrió las leyes del movimiento planetario, demostrando que los planetas seguían órbitas elípticas, no circulares como se creía.</p>
          <p>Isaac Newton sintetizó estos avances en sus Principia Mathematica, estableciendo las leyes de la mecánica que explicaban tanto el movimiento de los cuerpos terrestres como celestes. Su método de formular leyes matemáticas universales a partir de observaciones específicas se convirtió en el modelo de la ciencia moderna. Francis Bacon desarrolló el método científico experimental, enfatizando la importancia de la observación sistemática y la formulación de hipótesis verificables.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando usas una app de navegación como Google Maps para llegar a un restaurante, estás beneficiándote directamente de las leyes de Newton y Kepler: los satélites GPS orbitan siguiendo estas leyes físicas fundamentales descubiertas durante la Revolución Científica.</p>
          </div>
        </section>

        {/* Sección: La Ciencia Moderna y Contemporánea: Revoluciones Continuas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>La Ciencia Moderna y Contemporánea: Revoluciones Continuas</h2>
          </div>
          <p>Los siglos XIX y XX presenciaron aceleraciones extraordinarias en el desarrollo científico. Charles Darwin revolucionó la biología con su teoría de la evolución, mientras que Dmitri Mendeleev organizó los elementos químicos en la tabla periódica, prediciendo la existencia de elementos aún no descubiertos. La química y la biología se establecieron como disciplinas experimentales rigurosas.</p>
          <p>El siglo XX trajo dos revoluciones conceptuales fundamentales: la relatividad de Einstein y la mecánica cuántica. Einstein demostró que el tiempo y el espacio no son absolutos, mientras que los físicos cuánticos revelaron que a nivel subatómico, la realidad funciona de manera probabilística, no determinística. Estas teorías no solo transformaron la física, sino que cambiaron nuestra comprensión filosófica de la realidad.</p>
          <p>La segunda mitad del siglo XX vio el nacimiento de nuevas disciplinas interdisciplinarias: la biología molecular, la informática, la neurociencia y la ciencia de materiales. El descubrimiento del ADN, el desarrollo de computadoras y el proyecto del genoma humano ejemplifican cómo la ciencia moderna combina teoría, experimentación y tecnología avanzada. Hoy, la inteligencia artificial, la biotecnología y la física cuántica prometen nuevas revoluciones que apenas comenzamos a vislumbrar.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando recibes una notificación de WhatsApp en tu teléfono móvil, participas en un proceso que involucra teoría cuántica (en los semiconductores), relatividad (para la sincronización GPS) y algoritmos de inteligencia artificial (para el reconocimiento de voz), mostrando cómo la ciencia contemporánea integra múltiples disciplinas.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>El pensamiento científico evolucionó gradualmente desde la observación antigua hasta el método experimental moderno</li>
            <li>La Revolución Científica estableció la importancia de la verificación empírica y la formulación matemática de las leyes naturales</li>
            <li>La ciencia moderna se caracteriza por la interdisciplinariedad y la integración de teoría, experimentación y tecnología avanzada</li>
            <li>Cada período histórico construyó sobre los conocimientos anteriores, aunque a veces requirió revoluciones conceptuales para avanzar</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo influyeron los contextos culturales y religiosos en el desarrollo del pensamiento científico en diferentes épocas?</li>
            <li>¿Qué características del método científico moderno consideras más importantes para distinguir la ciencia de otras formas de conocimiento?</li>
            <li>¿De qué manera los avances científicos contemporáneos están transformando tu vida cotidiana y la sociedad en general?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Galileo nunca dejó caer objetos desde la Torre de Pisa para demostrar sus teorías sobre la gravedad, como cuenta la leyenda popular. En realidad, usó planos inclinados en experimentos controlados en su casa, un método mucho más preciso que le permitió medir con exactitud la aceleración de los objetos en caída libre.</p>
      </div>
    </ChapterPage>
  );
}
