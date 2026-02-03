'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function TacticasPersuasionPage() {
  return (
    <ChapterPage chapterId="tacticas-persuasion">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La persuasión es el arte de influir en las decisiones de otros a través de técnicas psicológicas y comunicativas éticas. En el mundo hispanohablante, donde las relaciones personales tienen un peso fundamental en los negocios, dominar estas habilidades puede ser la diferencia entre una negociación exitosa y un acuerdo mediocre. Este capítulo te enseñará técnicas concretas basadas en la psicología del comportamiento humano, adaptadas a nuestro contexto cultural, para que puedas negociar con mayor efectividad y obtener mejores resultados tanto en el ámbito profesional como personal.</p>
      </section>

        {/* Sección 1: Los 6 Principios de Influencia de Cialdini Aplicados al Contexto Hispanohablante */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>Los 6 Principios de Influencia de Cialdini Aplicados al Contexto Hispanohablante</h2>
          </div>

          <p>Robert Cialdini identificó seis principios universales de persuasión que, adaptados a nuestra cultura, se vuelven herramientas poderosas. El primer principio es la RECIPROCIDAD: en España y Latinoamérica, este concepto es especialmente fuerte debido a nuestros valores culturales de cortesía y correspondencia. Cuando ofreces algo primero (información valiosa, un pequeño favor, o incluso una invitación a café), generas una obligación psicológica de devolver el gesto. El segundo principio es el COMPROMISO Y COHERENCIA: las personas buscan ser consistentes con sus compromisos previos. En negociaciones, puedes usar frases como 'Según lo que me comentaste la semana pasada...' para recordar posiciones anteriores. La VALIDACIÓN SOCIAL funciona especialmente bien en culturas colectivistas como las nuestras. Mencionar que 'otras empresas del sector ya han adoptado esta práctica' o 'la mayoría de nuestros clientes prefieren esta opción' genera confianza. La AUTORIDAD debe manejarse con cuidado en culturas donde la jerarquía es importante pero no debe ser impositiva. Presenta credenciales sutilmente y deja que otros validen tu experiencia. La SIMPATÍA es crucial en nuestro contexto: las relaciones personales preceden a los negocios. Invierte tiempo en conocer a la otra persona, sus intereses y conexiones familiares. Finalmente, la ESCASEZ debe comunicarse de manera auténtica: 'Esta oferta es válida hasta fin de mes por temas presupuestarios' suena más creíble que presión artificial.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>María, directora comercial de una empresa tecnológica en México, necesitaba cerrar un contrato importante. Aplicó los principios así: Reciprocidad - compartió un estudio de mercado exclusivo antes de la reunión. Compromiso - recordó al cliente que había mencionado la importancia de la innovación. Validación social - mencionó que empresas líderes del sector ya usaban su solución. Autoridad - su asistente mencionó casualmente sus certificaciones. Simpatía - descubrió que ambos eran fanáticos del fútbol y compartieron anécdotas. Escasez - explicó que el precio especial vencía por cierre de trimestre fiscal. Resultado: cerró el contrato con condiciones favorables.</p>
          </div>
        </section>

        {/* Sección 2: Preguntas Estratégicas y Escucha Activa: El Arte de Obtener Información Valiosa */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Preguntas Estratégicas y Escucha Activa: El Arte de Obtener Información Valiosa</h2>
          </div>

          <p>Las preguntas estratégicas son herramientas de recolección de información que también influyen en el pensamiento de tu contraparte. Existen cuatro tipos principales: PREGUNTAS ABIERTAS para explorar ('¿Cómo visualizas el proyecto ideal?'), PREGUNTAS CERRADAS para confirmar ('¿Tu presupuesto incluye implementación?'), PREGUNTAS HIPOTÉTICAS para probar escenarios ('¿Qué pasaría si pudiéramos reducir el tiempo de entrega a la mitad?') y PREGUNTAS DE SEGUIMIENTO para profundizar ('Mencionaste que la calidad es prioritaria, ¿podrías darme un ejemplo específico?'). La secuencia importa: comienza con preguntas abiertas para entender el panorama general, luego usa preguntas específicas para detalles clave. En el contexto hispanohablante, es crucial permitir pausas y no interrumpir, ya que muchas veces las personas necesitan tiempo para expresar ideas completas. La escucha activa va más allá de oír palabras; implica captar emociones, preocupaciones no expresadas y motivaciones ocultas. Técnicas efectivas incluyen: parafrasear para confirmar entendimiento ('Si entiendo bien, tu principal preocupación es...'), hacer eco de emociones ('Percibo que esto te genera cierta inquietud'), y resumir periódicamente ('Hasta ahora hemos identificado tres puntos clave'). En culturas donde el contexto es importante, presta atención a lo que NO se dice, los cambios de tono y el lenguaje corporal. Las pausas no siempre indican desacuerdo; pueden reflejar reflexión profunda, especialmente en culturas donde la contemplación antes de responder es valorada.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Carlos, gerente de RRHH en una empresa española, negociaba condiciones laborales con un candidato senior para un puesto directivo. Usó preguntas estratégicas: '¿Qué elementos debe tener tu próximo rol para considerarlo un paso adelante en tu carrera?' (abierta), '¿El salario base es más importante que los beneficios variables?' (cerrada), '¿Cómo reaccionarías si necesitáramos que viajes 20% del tiempo?' (hipotética). Cuando el candidato mencionó flexibilidad, Carlos profundizó: '¿Podrías darme ejemplos específicos de flexibilidad que has valorado en trabajos anteriores?' La escucha activa reveló que más que dinero, buscaba reconocimiento y autonomía. Carlos ajustó la propuesta incluyendo un título más senior y mayor autoridad de decisión, cerrando la contratación exitosamente.</p>
          </div>
        </section>

        {/* Sección 3: Cómo Hacer Concesiones Efectivas: El Arte del Intercambio Estratégico */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Cómo Hacer Concesiones Efectivas: El Arte del Intercambio Estratégico</h2>
          </div>

          <p>Una concesión efectiva no es una pérdida, sino una inversión estratégica que genera reciprocidad y avanza la negociación. La regla fundamental es nunca hacer concesiones gratuitas; siempre debe haber un intercambio, explícito o implícito. El patrón de concesiones es crucial: comienza con concesiones menores para establecer el principio de reciprocidad, luego gradualmente aumenta el valor. En el contexto hispanohablante, donde las relaciones son fundamentales, presenta las concesiones como gestos de buena voluntad pero siempre vinculados a contrapartidas. Frases efectivas incluyen: 'Podría considerar esto si me ayudas con aquello', 'En el espíritu de llegar a un acuerdo mutuamente beneficioso...', o 'Dado tu compromiso con los plazos, podríamos ser flexibles en...'. La temporalidad de las concesiones también importa: las concesiones tempranas demuestran flexibilidad y buena fe, las concesiones tardías pueden parecer desesperadas o manipuladoras. Una técnica poderosa es el 'paquete de concesiones': en lugar de negociar punto por punto, agrupa varios elementos. Por ejemplo: 'Si podemos acordar el precio en X, incluiríamos capacitación gratuita y soporte extendido'. Esto hace más difícil que la otra parte rechace todo el paquete. Las concesiones condicionales ('Si ustedes pueden comprometerse con un volumen mínimo, nosotros podríamos ofrecer descuentos por escala') crean interdependencia y compromiso mutuo. Siempre documenta las concesiones hechas y recibidas para evitar que se den por sentado en el futuro.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Ana, propietaria de una agencia de marketing en Colombia, negociaba un contrato anual con un cliente potencial que presionaba por menores precios. En lugar de reducir sus tarifas inmediatamente, estructuró concesiones estratégicas: 'Entiendo tu preocupación por el presupuesto. Si pueden comprometerse con un contrato de 18 meses en lugar de 12, podríamos incluir dos campañas adicionales sin costo extra'. Cuando el cliente pidió más flexibilidad en pagos, Ana respondió: 'Podríamos considerar pagos trimestrales en lugar de mensuales, si me permites incluir una cláusula de ajuste por inflación después del primer año'. Cada concesión generó una contrapartida, y al final logró un contrato más largo y rentable que su propuesta inicial.</p>
          </div>
        </section>

        {/* Sección 4: Gestionar Emociones Propias y Ajenas: La Inteligencia Emocional en la Negociación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>Gestionar Emociones Propias y Ajenas: La Inteligencia Emocional en la Negociación</h2>
          </div>

          <p>Las emociones en la negociación no son obstáculos a eliminar, sino información valiosa a gestionar estratégicamente. En culturas hispanohablantes, donde la expresión emocional es más aceptada que en culturas nórdicas, esta habilidad es especialmente relevante. Para gestionar tus propias emociones, desarrolla autoconciencia emocional: identifica tus triggers (¿te frustras con la indecisión? ¿te irritan las interrupciones?) y crea estrategias de respuesta. Técnicas útiles incluyen el anclaje físico (tocar discretamente un objeto para mantener calma), la respiración profunda entre intervenciones, y el reframing cognitivo (interpretar resistencia como necesidad de más información, no rechazo personal). Cuando detectes emociones negativas en ti, toma pausas estratégicas: 'Me gustaría revisar estos números con calma, ¿podemos retomar esto en 15 minutos?'. Para gestionar emociones ajenas, primero identifica las señales: cambios de tono, postura cerrada, aceleración del habla o silencios prolongados. El reconocimiento emocional es poderoso: 'Percibo que esto te genera preocupación, ¿podrías ayudarme a entender qué específicamente te inquieta?'. No minimices emociones ajenas con frases como 'cálmate' o 'no es para tanto', que pueden escalear conflictos. En su lugar, valida: 'Entiendo que esto es importante para ti, hablemos de cómo podemos abordarlo'. Las emociones positivas también se gestionan: celebra pequeños acuerdos ('Excelente, ya tenemos dos puntos resueltos'), usa humor apropiado para relajar tensiones, y mantén un tono esperanzador sobre soluciones. En contextos donde la pasión y el entusiasmo son valorados, no reprimas completamente las emociones positivas, pero manténlas profesionales.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Roberto, director de una startup en Argentina, negociaba inversión con un fondo de capital de riesgo. Durante la presentación, notó que uno de los socios se mostraba escéptico y comenzaba a hacer preguntas desafiantes con tono agresivo. En lugar de ponerse defensivo, Roberto pausó y dijo: 'Veo que tienes serias preocupaciones sobre nuestro modelo de negocio, y eso me parece muy valioso. ¿Podrías ayudarme a entender cuál es el riesgo que más te inquieta?' Esta respuesta transformó el interrogatorio en una conversación colaborativa sobre cómo mitigar riesgos. El socio escéptico se sintió escuchado y comenzó a sugerir soluciones. Roberto mantuvo la calma, validó las preocupaciones y las usó para fortalecer su propuesta, resultando en una inversión exitosa.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>Los principios de influencia de Cialdini deben adaptarse al contexto cultural hispanohablante, donde las relaciones personales y la reciprocidad tienen especial importancia</li>
            <li>Las preguntas estratégicas secuenciales (abiertas → específicas → hipotéticas) combinadas con escucha activa revelan motivaciones ocultas y necesidades reales</li>
            <li>Las concesiones efectivas siempre incluyen contrapartidas y se presentan como paquetes de valor mutuo, nunca como pérdidas gratuitas</li>
            <li>La gestión emocional implica reconocer y validar emociones ajenas mientras mantienes autocontrol estratégico de las propias</li>
            <li>En culturas relacionales como la nuestra, la persuasión auténtica basada en beneficios mutuos supera a las tácticas manipuladoras de corto plazo</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Cuál de los seis principios de Cialdini utilizas naturalmente y cuáles necesitas desarrollar más en tus negociaciones actuales?</li>
            <li>¿Cómo reaccionas emocionalmente cuando la otra parte rechaza tu propuesta inicial? ¿Esta reacción ayuda u obstaculiza tus objetivos?</li>
            <li>¿Tiendes a hacer concesiones rápidamente para evitar conflicto, o las usas estratégicamente como herramientas de intercambio?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de tu próxima negociación importante, prepara tres preguntas abiertas específicas sobre las motivaciones de la otra parte y practica frases de reconocimiento emocional como 'Entiendo que esto es importante para ti' o 'Percibo que tienes reservas sobre este punto'. Esta preparación te dará mayor confianza y control durante la conversación real.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de 2023 realizado en empresas latinoamericanas, los negociadores que utilizan técnicas de validación emocional ('entiendo tu preocupación') logran acuerdos 34% más rápido y con 28% mayor satisfacción mutua comparado con quienes se enfocan únicamente en aspectos técnicos, demostrando que en nuestras culturas, conectar emocionalmente no es 'perder tiempo' sino la clave del éxito.</p>
      </div>
    </ChapterPage>
  );
}
