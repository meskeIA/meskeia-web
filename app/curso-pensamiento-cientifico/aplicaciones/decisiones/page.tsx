'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function DecisionesPage() {
  return (
    <ChapterPage chapterId="decisiones">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Cada día tomamos cientos de decisiones, desde qué desayunar hasta decisiones más complejas como elegir una universidad o evaluar información médica. Sin embargo, nuestro cerebro no siempre procesa la información de manera óptima, cayendo en sesgos y errores sistemáticos. El método científico ofrece herramientas valiosas para mejorar nuestra toma de decisiones cotidianas.</p>
      </section>

        {/* Sección: Los Sesgos Cognitivos: Cuando Nuestro Cerebro Nos Engaña */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Los Sesgos Cognitivos: Cuando Nuestro Cerebro Nos Engaña</h2>
          </div>
          <p>Los sesgos cognitivos son desviaciones sistemáticas en nuestro procesamiento de información que nos alejan de la racionalidad óptima. Aunque estos atajos mentales fueron útiles para la supervivencia de nuestros ancestros, en el mundo moderno pueden llevarnos a decisiones incorrectas. El sesgo de confirmación nos hace buscar información que confirme nuestras creencias previas mientras ignoramos evidencia contradictoria. Por ejemplo, si creemos que cierta marca de automóviles es la mejor, tendemos a recordar más las reseñas positivas y minimizar las negativas. El sesgo de disponibilidad nos lleva a sobreestimar la probabilidad de eventos que recordamos fácilmente, generalmente porque son dramáticos o recientes. Después de ver noticias sobre accidentes aéreos, muchas personas sobreestiman el riesgo de volar, aunque estadísticamente es más seguro que conducir. El sesgo de anclaje nos hace depender excesivamente de la primera información que recibimos. En las negociaciones, quien menciona el primer precio establece un 'ancla' que influye desproporcionadamente en el resultado final, incluso cuando ese precio inicial es arbitrario.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Ana busca información sobre vacunas en internet después de escuchar a una amiga expresar dudas. Sin darse cuenta, hace clic principalmente en artículos que confirman sus preocupaciones iniciales, ignorando los estudios científicos que muestran su seguridad y eficacia.</p>
          </div>
        </section>

        {/* Sección: Pensamiento Probabilístico: Navegando la Incertidumbre */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Pensamiento Probabilístico: Navegando la Incertidumbre</h2>
          </div>
          <p>El pensamiento probabilístico nos ayuda a tomar mejores decisiones en situaciones de incertidumbre, que son la mayoría en la vida real. En lugar de pensar en términos absolutos, aprendemos a evaluar la probabilidad de diferentes resultados. La falacia del jugador es un error común donde creemos que eventos pasados afectan probabilidades futuras independientes. Si una moneda cae cara cinco veces seguidas, la probabilidad de que caiga cruz en el siguiente lanzamiento sigue siendo 50%, no mayor. El teorema de Bayes nos enseña a actualizar nuestras creencias cuando recibimos nueva información. Si un test médico da positivo, la probabilidad real de tener la enfermedad depende no solo de la precisión del test, sino también de qué tan común es la enfermedad en la población. La comprensión de frecuencias naturales nos ayuda a interpretar estadísticas médicas y de riesgo. Es más intuitivo pensar '2 de cada 100 personas' que '2% de probabilidad'. El concepto de valor esperado nos permite comparar opciones considerando tanto la probabilidad como el impacto de diferentes resultados, herramienta fundamental para decisiones financieras y de inversión.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Luis considera dos rutas para llegar al trabajo. La Ruta A toma 30 minutos el 80% del tiempo, pero 60 minutos el 20% restante debido al tráfico. La Ruta B siempre toma 35 minutos. Usando pensamiento probabilístico: Ruta A = (0.8 × 30) + (0.2 × 60) = 36 minutos promedio. La Ruta B es más confiable.</p>
          </div>
        </section>

        {/* Sección: Evaluación de Evidencia: Separando Hechos de Opiniones */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Evaluación de Evidencia: Separando Hechos de Opiniones</h2>
          </div>
          <p>En la era de la información, saber evaluar evidencia es crucial para tomar decisiones informadas. No todas las fuentes son igualmente confiables, y no todos los tipos de evidencia tienen el mismo valor. La jerarquía de evidencia científica coloca a las revisiones sistemáticas y metaanálisis en la cima, seguidos por ensayos controlados aleatorios, estudios de cohorte, estudios de casos y controles, y finalmente testimonios personales y opiniones de expertos. Al evaluar testimonios personales, debemos recordar que las experiencias individuales, aunque válidas emocionalmente, pueden no ser representativas de la población general. La correlación no implica causación es un principio fundamental: que dos variables cambien juntas no significa que una cause la otra. Puede existir una tercera variable que influya en ambas, o la relación puede ser coincidental. El tamaño de la muestra importa: conclusiones basadas en pocos casos son menos confiables que aquellas con muestras grandes. También debemos considerar posibles conflictos de interés: quien financia un estudio o proporciona información puede tener motivaciones que sesguen los resultados. La reproducibilidad es clave: resultados que pueden replicarse independientemente son más confiables que hallazgos únicos.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> María lee que un estudio muestra que cierto suplemento mejora la memoria. Antes de comprarlo, verifica: ¿quién financió el estudio? (la empresa que vende el suplemento). ¿Cuántos participantes tuvo? (solo 20 personas). ¿Se ha replicado? (no encuentra otros estudios). Decide esperar más evidencia.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Los sesgos cognitivos son atajos mentales que pueden llevarnos a decisiones incorrectas en el mundo moderno</li>
            <li>El pensamiento probabilístico nos ayuda a tomar mejores decisiones bajo incertidumbre usando conceptos como valor esperado y el teorema de Bayes</li>
            <li>No toda evidencia es igual: debemos evaluar fuentes, considerar conflictos de interés y distinguir correlación de causación</li>
            <li>La aplicación consciente del método científico en decisiones cotidianas puede mejorar significativamente nuestros resultados</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Puedes identificar una decisión reciente donde un sesgo cognitivo pudo haber influido en tu elección? ¿Cómo podrías haberlo evitado?</li>
            <li>Piensa en una decisión importante que tengas que tomar pronto. ¿Cómo podrías aplicar el pensamiento probabilístico para evaluarla mejor?</li>
            <li>¿Qué criterios usas actualmente para evaluar si una fuente de información es confiable? ¿Cómo podrías mejorar este proceso?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El premio Nobel Daniel Kahneman descubrió que los médicos expertos cometen los mismos sesgos cognitivos que cualquier persona cuando toman decisiones fuera de su área de expertise. Esto demuestra que la educación especializada no nos inmuniza contra estos errores sistemáticos de pensamiento.</p>
      </div>
    </ChapterPage>
  );
}
