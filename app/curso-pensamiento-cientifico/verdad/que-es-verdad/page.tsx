'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function QueEsVerdadPage() {
  return (
    <ChapterPage chapterId="que-es-verdad">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La pregunta por la verdad ha inquietado a la humanidad desde tiempos remotos. ¿Qué hace que algo sea verdadero? ¿Existe una verdad única e inmutable, o depende del contexto y la perspectiva? En este capítulo exploraremos las principales teorías filosóficas sobre la verdad, analizando cómo se relaciona con nuestra experiencia cotidiana y cómo el contexto influye en nuestra comprensión de lo que consideramos cierto.</p>
      </section>

        {/* Sección: Las Principales Teorías de la Verdad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Las Principales Teorías de la Verdad</h2>
          </div>
          <p>La filosofía ha desarrollado varias teorías para explicar qué constituye la verdad. La teoría de la correspondencia, defendida por filósofos como Aristóteles, sostiene que una proposición es verdadera cuando corresponde con los hechos de la realidad. Según esta visión, la afirmación 'está lloviendo' es verdadera solo si efectivamente está precipitando agua del cielo en ese momento y lugar específico.</p>
          <p>Por otro lado, la teoría de la coherencia propone que la verdad de una proposición depende de qué tan bien encaje con un sistema completo de creencias. Una afirmación es verdadera si es coherente con todo lo que sabemos y creemos. Esta teoría es especialmente relevante en contextos donde no podemos verificar directamente los hechos.</p>
          <p>Finalmente, la teoría pragmática, desarrollada por filósofos estadounidenses como William James, sugiere que la verdad de una idea se mide por su utilidad práctica y sus consecuencias exitosas. Una creencia es verdadera si funciona en la práctica y nos ayuda a navegar efectivamente por el mundo. Esta perspectiva ha ganado relevancia en campos aplicados como la medicina y la ingeniería, donde lo que 'funciona' suele considerarse más importante que las abstracciones teóricas.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Cuando un médico diagnostica diabetes basándose en análisis de sangre (correspondencia con hechos), consulta literatura médica para verificar que su diagnóstico sea consistente con el conocimiento establecido (coherencia), y prescribe un tratamiento que ha demostrado funcionar en pacientes similares (pragmatismo).</p>
          </div>
        </section>

        {/* Sección: Verdad Objetiva versus Verdad Subjetiva */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Verdad Objetiva versus Verdad Subjetiva</h2>
          </div>
          <p>La distinción entre verdad objetiva y subjetiva representa uno de los debates más fundamentales en filosofía. La verdad objetiva se refiere a hechos que existen independientemente de nuestras creencias, opiniones o percepciones personales. Por ejemplo, la distancia entre Ciudad de México y Buenos Aires es aproximadamente 7,300 kilómetros, sin importar lo que cualquier persona pueda pensar al respecto.</p>
          <p>La verdad subjetiva, en cambio, está relacionada con experiencias, valores y perspectivas individuales. Cuando alguien afirma que 'el mole poblano es el platillo más delicioso del mundo', está expresando una verdad subjetiva basada en su experiencia gustativa personal y cultural. Esta afirmación no puede ser verificada objetivamente porque depende de preferencias individuales.</p>
          <p>Sin embargo, la línea entre lo objetivo y lo subjetivo no siempre es clara. Muchas afirmaciones que consideramos objetivas están influenciadas por marcos conceptuales, instrumentos de medición y perspectivas culturales. El reto consiste en distinguir cuándo nuestras limitaciones humanas afectan nuestro acceso a verdades objetivas y cuándo la subjetividad es inherente al tipo de verdad que estamos buscando. Esta distinción es crucial en campos como la ciencia, el derecho y la ética, donde la objetividad es un ideal regulativo importante.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En un juicio, los testimonios de los testigos representan verdades subjetivas (cada persona percibe y recuerda los eventos de manera diferente), mientras que las pruebas forenses buscan establecer verdades objetivas (ADN, huellas dactilares, grabaciones de video).</p>
          </div>
        </section>

        {/* Sección: El Papel Fundamental del Contexto */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>El Papel Fundamental del Contexto</h2>
          </div>
          <p>El contexto juega un papel crucial en nuestra comprensión y determinación de la verdad. El contexto histórico influye en lo que una sociedad considera verdadero: lo que era aceptado como conocimiento científico en el siglo XVI puede parecer completamente erróneo hoy. El contexto cultural también modela nuestras concepciones de verdad: diferentes culturas pueden tener marcos interpretativos distintos para entender fenómenos similares.</p>
          <p>El contexto lingüístico es igualmente importante. Las palabras adquieren significados específicos dentro de contextos particulares, y una misma afirmación puede ser verdadera en un contexto y falsa en otro. Por ejemplo, decir 'Juan es alto' puede ser verdad en el contexto de un equipo de jockeys pero falso en el contexto de un equipo de baloncesto profesional.</p>
          <p>Además, el contexto metodológico determina qué criterios usamos para evaluar la verdad. Los estándares de evidencia en un laboratorio científico son diferentes a los de un tribunal, y ambos difieren de los criterios que usamos en conversaciones cotidianas. Reconocer la importancia del contexto no implica relativismo absoluto, sino una comprensión más sofisticada de cómo operan las afirmaciones de verdad en diferentes esferas de la experiencia humana. Esta sensibilidad contextual es especialmente relevante en nuestro mundo globalizado, donde diferentes tradiciones culturales y epistemológicas interactúan constantemente.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La afirmación 'el Sol sale por el este' es verdadera en el contexto de la experiencia cotidiana y la navegación práctica, pero técnicamente imprecisa desde la perspectiva astronómica moderna, que entiende que es la Tierra la que rota, no el Sol el que se mueve alrededor de nosotros.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Existen múltiples teorías sobre la verdad: correspondencia, coherencia y pragmática, cada una con criterios diferentes para determinar qué es verdadero</li>
            <li>La distinción entre verdad objetiva y subjetiva es fundamental pero a menudo compleja, especialmente cuando intervienen factores culturales y perceptivos</li>
            <li>El contexto histórico, cultural, lingüístico y metodológico influye significativamente en cómo entendemos y evaluamos las afirmaciones de verdad</li>
            <li>Una comprensión madura de la verdad requiere sensibilidad contextual sin caer en el relativismo absoluto</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Puedes pensar en una situación de tu vida cotidiana donde una afirmación sea verdadera según una teoría de la verdad pero cuestionable según otra?</li>
            <li>¿Cómo distingues entre tus creencias que consideras objetivamente verdaderas y aquellas que reconoces como subjetivas o culturalmente condicionadas?</li>
            <li>¿En qué medida crees que el contexto cultural latinoamericano influye en tu comprensión de ciertas verdades sobre la sociedad, la historia o los valores?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El filósofo austriaco Kurt Gödel demostró matemáticamente en 1931 que en cualquier sistema formal suficientemente complejo, siempre existirán afirmaciones verdaderas que no pueden ser demostradas dentro del propio sistema. Este teorema revolucionó nuestra comprensión de la verdad matemática y sugiere que la verdad completa podría ser, en principio, inalcanzable para cualquier sistema de conocimiento finito.</p>
      </div>
    </ChapterPage>
  );
}
