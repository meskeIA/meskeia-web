'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function TecnicasCierrePage() {
  return (
    <ChapterPage chapterId="tecnicas-cierre">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El momento del cierre es donde se define el éxito o fracaso de cualquier negociación. Muchos profesionales dominan las técnicas de preparación y desarrollo, pero fallan en el momento crucial de cerrar el acuerdo. En el contexto empresarial hispanohablante, donde las relaciones personales y la confianza juegan un papel fundamental, saber cuándo y cómo cerrar una negociación requiere sensibilidad cultural y técnica refinada. Este capítulo te proporcionará las herramientas específicas para reconocer el momento óptimo, aplicar técnicas de cierre efectivas y manejar las situaciones más desafiantes del proceso negociador.</p>
      </section>

        {/* Sección 1: Identificando las Señales de Cierre: El Momento Perfecto */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>Identificando las Señales de Cierre: El Momento Perfecto</h2>
          </div>

          <p>Reconocer cuándo la otra parte está lista para cerrar es una habilidad que separa a los negociadores expertos de los principiantes. Las señales pueden ser verbales, no verbales o conductuales, y varían según el contexto cultural latinoamericano y español.</p>
          <p>Las señales verbales más comunes incluyen preguntas sobre detalles de implementación: '¿Cuándo podríamos empezar?', '¿Qué documentación necesitaríamos?', o '¿Cómo sería el proceso de pago?'. También aparecen comentarios condicionales como 'Si llegáramos a un acuerdo...' o 'Suponiendo que esto funcione...'. En culturas hispanohablantes, prestá especial atención a frases como 'Habría que consultarlo con el equipo' o 'Tendríamos que ver los números', que suelen indicar interés real pero necesidad de validación interna.</p>
          <p>Las señales no verbales son igualmente importantes. Observá cambios en el lenguaje corporal: inclinarse hacia adelante, relajar la postura, mantener contacto visual más prolongado, o comenzar a tomar notas activamente. En el contexto cultural español y latinoamericano, donde la comunicación no verbal es especialmente rica, también prestá atención a gestos de asentimiento más frecuentes o la reducción de gestos defensivos como brazos cruzados.</p>
          <p>Las señales conductuales incluyen la disposición a hacer concesiones menores, mostrar flexibilidad en puntos antes rígidos, o introducir temas relacionados con la implementación del acuerdo. Un cambio notable es cuando la conversación pasa de 'si' a 'cuándo' y 'cómo'. La clave está en ser paciente y no forzar el cierre antes de que estas señales aparezcan naturalmente.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>En una negociación para la compra de software empresarial en México, el director de IT de una empresa manufacturera llevaba tres reuniones evaluando opciones. Durante la cuarta reunión, comenzó a preguntar sobre tiempos de implementación, capacitación del personal y soporte técnico en español. Su lenguaje corporal cambió: dejó de revisar constantemente su teléfono y comenzó a tomar notas detalladas. Cuando comentó '¿Qué necesitaríamos para arrancar en enero?', el vendedor reconoció la señal perfecta de cierre y procedió con la técnica de resumen para consolidar el acuerdo.</p>
          </div>
        </section>

        {/* Sección 2: Técnicas de Cierre: Resumen, Alternativa y Urgencia */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Técnicas de Cierre: Resumen, Alternativa y Urgencia</h2>
          </div>

          <p>Las técnicas de cierre son herramientas específicas que facilitan la toma de decisión final. Cada técnica tiene su momento y contexto apropiado, y su efectividad depende de la correcta lectura de la situación y la cultura empresarial local.</p>
          <p>La técnica del resumen es especialmente efectiva en culturas hispanohablantes donde se valora la claridad y el consenso. Consiste en recapitular todos los puntos acordados, beneficios discutidos y condiciones aceptadas. Utilizá frases como: 'Entonces, hemos acordado que...', 'Para resumir los puntos principales...', o 'Si entiendo correctamente, estamos de acuerdo en...'. Esta técnica genera momentum psicológico y hace que rechazar el acuerdo parezca inconsistente con todo lo previamente discutido.</p>
          <p>La técnica de alternativa funciona presentando opciones limitadas, todas favorables para vos. Por ejemplo: '¿Preferirías comenzar con el paquete básico o directamente con la versión premium?' o '¿Te resulta mejor firmar hoy o necesitás hasta el viernes?'. En el contexto cultural latinoamericano, donde la toma de decisiones puede ser más consultiva, esta técnica debe aplicarse con sensibilidad, evitando presionar excesivamente.</p>
          <p>La técnica de urgencia debe usarse con extremo cuidado en culturas hispanohablantes, donde puede percibirse como presión indebida. Funciona mejor cuando la urgencia es real y justificada: 'Esta promoción vence el viernes' o 'Tenemos solo dos cupos disponibles para el curso'. La clave está en ser honesto y transparente, ya que la credibilidad es fundamental en estas culturas.</p>
          <p>Una técnica adicional muy efectiva es el cierre colaborativo: '¿Qué necesitamos resolver para seguir adelante?' Esta aproximación respeta la cultura de consenso común en España y Latinoamérica, invitando a la otra parte a participar activamente en la solución de obstáculos finales.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Un consultor argentino negociaba un proyecto de transformación digital con una empresa familiar española. Después de varias sesiones, aplicó la técnica del resumen: 'Perfecto, entonces acordamos un proyecto de 6 meses, comenzando con la digitalización del área comercial, con capacitación incluida para 20 empleados, soporte 24/7 en español, y el precio que discutimos de €45.000. ¿Hay algo más que necesitemos clarificar antes de preparar el contrato?' El director general respondió: 'Me parece bien, ¿cuándo podemos empezar?' El resumen claro y la pregunta abierta final permitieron un cierre natural sin presión.</p>
          </div>
        </section>

        {/* Sección 3: Superando Objeciones de Último Momento */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Superando Objeciones de Último Momento</h2>
          </div>

          <p>Las objeciones de último momento son frecuentes y a menudo representan miedos naturales ante la toma de decisión final. En culturas hispanohablantes, donde las decisiones importantes suelen consultarse ampliamente, estas objeciones requieren manejo especializado y paciencia cultural.</p>
          <p>Primero, mantené la calma y no muestres frustración. Las objeciones de último momento suelen ser emocionales más que racionales. Utilizá la técnica del reconocimiento: 'Entiendo perfectamente tu preocupación, es normal sentir esto antes de una decisión importante'. Esta validación emocional es crucial en culturas donde las relaciones personales son fundamentales.</p>
          <p>Segundo, identificá si la objeción es real o una manifestación de ansiedad por la decisión. Las objeciones reales requieren información adicional o modificaciones al acuerdo. Las objeciones emocionales necesitan tranquilización y reafirmación de beneficios. Preguntá directamente: '¿Hay algo específico que te preocupa o es la natural precaución antes de decidir?'</p>
          <p>Tercero, utilizá la técnica del 'feel, felt, found' adaptada culturalmente: 'Entiendo cómo te sentís, muchos clientes se han sentido igual, y lo que han encontrado es que...'. Esta técnica funciona especialmente bien en Latinoamérica, donde las referencias a experiencias de otros son muy valoradas.</p>
          <p>Cuarto, ofrecé garantías adicionales o períodos de prueba cuando sea posible. En culturas con alta aversión al riesgo, como muchas empresas familiares españolas o latinoamericanas, reducir la percepción de riesgo es fundamental. 'Si no estás completamente satisfecho en los primeros 30 días, revisamos el acuerdo'.</p>
          <p>Finalmente, utilizá la técnica de la pregunta directa: '¿Qué necesitás escuchar de mí para sentirte cómodo siguiendo adelante?' Esta pregunta pone la responsabilidad en la otra parte de articular exactamente qué falta para cerrar el acuerdo.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Una empresaria colombiana estaba negociando la venta de su startup a una multinacional. En el último momento, expresó: 'No sé si mis empleados estarán bien con el cambio'. El comprador respondió: 'Entiendo perfectamente esa preocupación, es normal querer proteger a tu equipo. Varios fundadores se han sentido igual. Lo que han encontrado es que les ofrecemos mejores oportunidades de crecimiento. ¿Qué tal si incluimos una cláusula de retención de empleados por 2 años y tú participas en el proceso de integración?' Esta respuesta reconoció la emoción, ofreció tranquilización y propuso una solución concreta.</p>
          </div>
        </section>

        {/* Sección 4: El Arte de Saber Cuándo Retirarse */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>El Arte de Saber Cuándo Retirarse</h2>
          </div>

          <p>Saber cuándo retirarse de una negociación es tan importante como saber cerrarla. Esta decisión requiere objetividad, disciplina emocional y una clara comprensión de tus límites y alternativas. En culturas hispanohablantes, donde mantener la relación es prioritario, retirarse requiere especial delicadeza.</p>
          <p>Antes de cualquier negociación, establecé tu 'punto de no retorno' o BATNA (Best Alternative to a Negotiated Agreement). Este debe incluir no solo aspectos económicos, sino también tiempo, recursos emocionales y costo de oportunidad. Escribílo y mantenélo visible durante la negociación para evitar decisiones emocionales.</p>
          <p>Las señales de que debés considerar retirarte incluyen: la otra parte no muestra flexibilidad en puntos fundamentales para vos, las concesiones requeridas superan tus límites predefinidos, el proceso se vuelve hostil o irrespetuoso, o cuando intuís que la otra parte no tiene real autoridad o intención de cerrar.</p>
          <p>Cuando decidas retirarte, hacélo con elegancia y dejando las puertas abiertas. En culturas hispanohablantes, utilizá frases como: 'Creo que en este momento nuestras expectativas están muy distanciadas, pero valoro mucho el tiempo que dedicamos a explorar esta oportunidad'. Evitá ultimátums o amenazas que puedan dañar relaciones futuras.</p>
          <p>Una técnica efectiva es el 'retiro temporal': 'Creo que necesitamos un receso para reflexionar sobre todos los puntos discutidos. ¿Qué tal si retomamos esto la próxima semana?' Esto puede generar reflexión en la otra parte y abrir nuevas posibilidades.</p>
          <p>Recordá que retirarse no es fracasar. En muchos casos, el retiro estratégico puede motivar a la otra parte a reconsiderar su posición. Además, preserva tus recursos para mejores oportunidades. La clave está en hacerlo con profesionalismo y respeto, manteniendo la reputación intacta para futuras negociaciones.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Un distribuidor español llevaba 2 meses negociando un contrato exclusivo con un fabricante brasileño. El fabricante continuamente movía los términos, reducía márgenes y agregaba condiciones. Cuando pidieron una garantía bancaria adicional del 50% del contrato, el distribuidor reconoció que había superado su BATNA. Les dijo: 'Valoro enormemente la oportunidad de trabajar juntos, pero creo que nuestras expectativas actuales están muy alejadas. Voy a tomarme un tiempo para evaluar si puedo ajustar mi propuesta. Mientras tanto, les deseo el mejor de los éxitos.' Tres semanas después, el fabricante lo contactó con una propuesta mucho más favorable, reconociendo que su profesionalismo al retirarse demostró seriedad empresarial.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>Las señales de cierre incluyen preguntas sobre implementación, cambios en lenguaje corporal y transición del 'si' al 'cuándo'</li>
            <li>La técnica del resumen es especialmente efectiva en culturas hispanohablantes que valoran claridad y consenso</li>
            <li>Las objeciones de último momento suelen ser emocionales y requieren validación antes que argumentación</li>
            <li>Establecer un BATNA claro antes de negociar es fundamental para saber cuándo retirarse</li>
            <li>Retirarse con elegancia puede ser más poderoso que aceptar un mal acuerdo</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿En qué negociaciones pasadas perdiste oportunidades de cierre por no reconocer las señales adecuadas?</li>
            <li>¿Cuáles son tus miedos principales al momento de cerrar una negociación y cómo podrías superarlos?</li>
            <li>¿Has estado alguna vez en una negociación donde deberías haberte retirado pero no lo hiciste? ¿Qué aprendiste de esa experiencia?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de tu próxima negociación importante, escribe en una tarjeta tus 3 condiciones mínimas no negociables y tu mejor alternativa si no llegas a un acuerdo. Mantenlas visibles durante toda la negociación para tomar decisiones objetivas en el momento del cierre.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de Harvard Business Review de 2023, el 68% de las negociaciones que fallan en el cierre podrían haberse salvado si el negociador hubiera reconocido correctamente las señales de la otra parte. Curiosamente, en culturas latinoamericanas, las señales no verbales representan hasta el 73% de la comunicación durante el proceso de cierre, comparado con el 55% en culturas anglosajonas.</p>
      </div>
    </ChapterPage>
  );
}
