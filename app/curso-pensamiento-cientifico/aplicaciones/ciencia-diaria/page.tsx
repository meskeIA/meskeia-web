'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function CienciaDiariaPage() {
  return (
    <ChapterPage chapterId="ciencia-diaria">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El pensamiento científico no es exclusivo de laboratorios y universidades; es una herramienta poderosa que podemos aplicar en nuestras decisiones diarias. Desde evaluar tratamientos médicos hasta gestionar nuestras finanzas o mejorar nuestras relaciones, el método científico nos ofrece un marco riguroso para tomar mejores decisiones basadas en evidencia. En este módulo exploraremos cómo llevar la ciencia a tres áreas fundamentales de nuestra vida cotidiana.</p>
      </section>

        {/* Sección: Pensamiento Científico en la Salud y Medicina */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Pensamiento Científico en la Salud y Medicina</h2>
          </div>
          <p>Aplicar el pensamiento científico en el ámbito de la salud implica adoptar una actitud crítica y basada en evidencia ante la información médica. Esto significa cuestionar afirmaciones extraordinarias, buscar fuentes confiables y entender la diferencia entre correlación y causalidad. En un mundo donde proliferan los remedios milagrosos y las pseudoterapias, el pensamiento científico nos protege de decisiones que pueden comprometer nuestra salud.</p>
          <p>La medicina basada en evidencia utiliza el método científico para evaluar tratamientos. Esto implica estudios controlados, revisión por pares y replicación de resultados. Como ciudadanos, podemos aplicar estos principios evaluando críticamente la información de salud que recibimos. Es fundamental distinguir entre fuentes confiables (revistas científicas, instituciones médicas reconocidas) y fuentes cuestionables (redes sociales, testimonios anecdóticos, sitios web sin respaldo científico).</p>
          <p>Al enfrentar una decisión médica, podemos aplicar el pensamiento científico formulando preguntas específicas: ¿Cuál es la evidencia disponible? ¿Qué tan confiables son los estudios? ¿Existen conflictos de interés? ¿Los beneficios superan los riesgos? Esta aproximación nos ayuda a tomar decisiones informadas junto con profesionales de la salud, evitando tanto la credulidad excesiva como el escepticismo infundado.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> María encuentra en redes sociales que el té de guanábana 'cura el cáncer'. Aplicando pensamiento científico, busca estudios peer-reviewed en PubMed y consulta con su oncólogo. Descubre que aunque algunos compuestos de la guanábana muestran actividad antitumoral in vitro, no existe evidencia clínica sólida en humanos, y algunos estudios sugieren posible toxicidad neurológica.</p>
          </div>
        </section>

        {/* Sección: Análisis Científico en Finanzas Personales */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Análisis Científico en Finanzas Personales</h2>
          </div>
          <p>Las finanzas personales están llenas de afirmaciones que requieren análisis crítico. El pensamiento científico nos ayuda a evaluar estrategias de inversión, ofertas financieras y consejos económicos basándonos en datos objetivos en lugar de emociones o promesas exageradas. La economía comportamental ha demostrado que nuestros sesgos cognitivos pueden llevarnos a decisiones financieras irracionales.</p>
          <p>Al aplicar el método científico a las finanzas, comenzamos formulando hipótesis claras sobre nuestros objetivos financieros y las estrategias para alcanzarlos. Luego recopilamos datos: analizamos nuestros ingresos y gastos, investigamos el rendimiento histórico de diferentes inversiones, y evaluamos los riesgos involucrados. Es crucial entender conceptos como la diversificación, el interés compuesto y la relación riesgo-rendimiento basándose en evidencia empírica, no en intuición.</p>
          <p>La experimentación controlada también aplica en finanzas personales. Podemos probar diferentes métodos de ahorro o presupuesto durante períodos específicos, midiendo resultados objetivamente. Por ejemplo, comparar el ahorro logrado con diferentes aplicaciones de presupuesto o estrategias de inversión. La clave está en mantener registros detallados y evaluar resultados sin sesgos emocionales, ajustando nuestras estrategias basándose en evidencia real de nuestro comportamiento financiero.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Carlos recibe una oferta de inversión que promete '30% de rendimiento garantizado en 6 meses'. Aplicando pensamiento científico, investiga: verifica que la empresa esté registrada ante la CNBV, busca estados financieros auditados, compara con rendimientos históricos del mercado (CETES, índices bursátiles), y consulta con asesores independientes. Concluye que es probable una estafa piramidal.</p>
          </div>
        </section>

        {/* Sección: Método Científico en Relaciones y Comunicación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Método Científico en Relaciones y Comunicación</h2>
          </div>
          <p>Aunque parezca contraintuitivo aplicar ciencia a las relaciones humanas, el pensamiento científico puede mejorar significativamente nuestra comunicación y vínculos interpersonales. Esto no significa tratar a las personas como objetos de laboratorio, sino aplicar principios como la observación objetiva, la formulación de hipótesis sobre comportamientos, y la evaluación de resultados de diferentes estrategias comunicativas.</p>
          <p>La psicología experimental ha identificado patrones en la comunicación humana que podemos aplicar conscientemente. Por ejemplo, la escucha activa, la comunicación no violenta y las técnicas de resolución de conflictos han sido validadas empíricamente. Al observar nuestras interacciones sin juicios previos, podemos identificar patrones problemáticos y probar nuevas aproximaciones de manera sistemática.</p>
          <p>En las relaciones, podemos aplicar el pensamiento científico evaluando nuestras suposiciones sobre las intenciones de otros. En lugar de asumir motivaciones basándose en emociones, podemos buscar evidencia a través de la comunicación directa. Esto implica hacer preguntas abiertas, verificar nuestra comprensión y estar dispuestos a cambiar nuestras hipótesis cuando la evidencia lo contradiga. La metacognición nos ayuda a reconocer nuestros sesgos emocionales y comunicarnos de manera más efectiva.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Ana nota que su pareja está distante últimamente. En lugar de asumir que 'ya no la quiere', aplica pensamiento científico: observa patrones específicos, considera hipótesis alternativas (estrés laboral, problemas familiares), y prueba su hipótesis comunicándose directamente: 'He notado que has estado callado esta semana, ¿hay algo que te preocupa?'</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>El pensamiento científico protege contra decisiones de salud basadas en pseudociencia y testimonios anecdóticos</li>
            <li>En finanzas personales, la evaluación basada en datos objetivos previene decisiones impulsivas y estafas</li>
            <li>La comunicación efectiva mejora cuando aplicamos observación objetiva y verificación de hipótesis sobre las intenciones de otros</li>
            <li>El método científico en la vida cotidiana requiere mantener registros, evaluar evidencia y ajustar estrategias basándose en resultados reales</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿En qué situaciones de tu vida diaria has tomado decisiones basándote más en emociones que en evidencia?</li>
            <li>¿Cómo podrías implementar un sistema de 'experimentos controlados' para mejorar algún aspecto específico de tu vida?</li>
            <li>¿Qué sesgos cognitivos reconoces en tu forma de evaluar información sobre salud, finanzas o relaciones?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Los médicos que practican medicina basada en evidencia tienen tasas de error diagnóstico significativamente menores que aquellos que confían principalmente en su intuición clínica. Estudios muestran que la combinación de experiencia médica con evaluación sistemática de evidencia científica reduce errores diagnósticos hasta en un 40%, demostrando que incluso los expertos se benefician del pensamiento científico estructurado.</p>
      </div>
    </ChapterPage>
  );
}
