'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function SesgosCognitivosPage() {
  return (
    <ChapterPage chapterId="sesgos-cognitivos">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Nuestro cerebro, diseñado para tomar decisiones rápidas en situaciones de supervivencia, utiliza atajos mentales que en las negociaciones modernas pueden jugarnos en contra. Estos sesgos cognitivos y heurísticas, estudiados extensamente por la psicología comportamental, influyen de manera decisiva en cómo evaluamos ofertas, tomamos decisiones y reaccionamos ante las propuestas de la otra parte. Comprender estos mecanismos mentales no solo nos ayuda a negociar mejor, sino que nos permite identificar cuándo están siendo utilizados en nuestra contra.</p>
      </section>

        {/* Sección 1: El Poder del Anclaje: Cuando la Primera Cifra Lo Determina Todo */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>El Poder del Anclaje: Cuando la Primera Cifra Lo Determina Todo</h2>
          </div>

          <p>El anclaje es uno de los sesgos más poderosos en negociación. Consiste en la tendencia a dar un peso desproporcionado a la primera información que recibimos, especialmente números, que actúan como 'anclas' para todas las evaluaciones posteriores. En el contexto hispanohablante, este sesgo se potencia por nuestra tendencia cultural a ser menos directos al inicio de las negociaciones.</p>
          <p>La neurociencia ha demostrado que incluso cuando sabemos que un número es completamente aleatorio, este sigue influyendo en nuestras decisiones posteriores. En negociaciones, quien establece el primer precio o condición tiene una ventaja significativa, ya que define el rango de discusión.</p>
          <p>Para usar el anclaje estratégicamente, es fundamental investigar previamente los rangos de mercado y establecer anclas ambiciosas pero defendibles. El ancla debe ir acompañada de justificación creíble para evitar que sea percibida como irreal. En culturas como la española o mexicana, donde las relaciones personales son importantes, un ancla demasiado agresiva puede dañar la confianza.</p>
          <p>Cuando somos víctimas del anclaje, la técnica más efectiva es el 'reencuadre' - presentar información alternativa que justifique un rango diferente. También funciona cuestionar abiertamente el ancla: '¿En qué se basa esa cifra?' o 'Los datos que manejo sugieren un rango diferente'.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>En 2024, María, directora de compras de una empresa textil colombiana, negocia con un proveedor brasileño. El proveedor abre con: 'Por la volatilidad del dólar, necesitamos subir los precios 40%'. Esta cifra ancla toda la negociación hacia aumentos significativos. María contraataca investigando aumentos reales de costos (15%) y presenta su propio ancla: 'Los datos del mercado regional indican ajustes del 8-12%'. Al cuestionar el ancla inicial con datos concretos, logra un acuerdo final del 18% en lugar del 25-30% que hubiera resultado del ancla original.</p>
          </div>
        </section>

        {/* Sección 2: Aversión a la Pérdida y el Arte del Encuadre de Propuestas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Aversión a la Pérdida y el Arte del Encuadre de Propuestas</h2>
          </div>

          <p>Los seres humanos sentimos las pérdidas aproximadamente 2.5 veces más intensamente que las ganancias equivalentes. Este sesgo, conocido como aversión a la pérdida, es fundamental en negociación porque influye dramáticamente en cómo percibimos las ofertas dependiendo de cómo estén presentadas o 'encuadradas'.</p>
          <p>El encuadre (framing) consiste en presentar la misma información de diferentes maneras para influir en la percepción. Una propuesta puede presentarse enfocándose en lo que se gana o en lo que se evita perder. En culturas latinoamericanas, donde la estabilidad y seguridad son valoradas, el encuadre de pérdidas suele ser especialmente efectivo.</p>
          <p>Existen varios tipos de encuadre efectivos: el encuadre temporal (comparar con situaciones pasadas o futuras), el encuadre de referencia (comparar con competidores o alternativas), y el encuadre de beneficios versus características. La clave está en presentar nuestra propuesta resaltando lo que la otra parte conserva o gana, mientras que las alternativas se presentan como pérdidas potenciales.</p>
          <p>Para defenderse del encuadre manipulativo, es esencial reformular mentalmente las propuestas en términos neutrales, enfocándose en el valor real intercambiado. Preguntas como '¿Cuál es realmente la diferencia neta?' o '¿Qué estoy ganando en valor absoluto?' ayudan a ver más allá del encuadre emocional.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Carlos negocia su renovación contractual en una empresa tecnológica madrileña. En lugar de pedir un aumento del 15%, encuadra su propuesta así: 'Manteniendo mi salario actual, la empresa perdería competitividad frente a ofertas externas que superan mi sueldo en 18%. Mi propuesta permite retener el talento con un ajuste menor (15%) evitando costos de sustitución que rondan los €25,000'. El encuadre transforma un 'gasto adicional' en un 'ahorro inteligente', resultando en la aprobación del aumento.</p>
          </div>
        </section>

        {/* Sección 3: Exceso de Confianza y Escalada de Compromiso: Cuando Persistir se Convierte en Trampa */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Exceso de Confianza y Escalada de Compromiso: Cuando Persistir se Convierte en Trampa</h2>
          </div>

          <p>El exceso de confianza nos lleva a sobreestimar nuestras capacidades de negociación y subestimar los riesgos, mientras que la escalada de compromiso nos impulsa a seguir invirtiendo recursos en una negociación porque ya hemos invertido mucho, independientemente de las probabilidades reales de éxito.</p>
          <p>Este sesgo es particularmente peligroso en el contexto empresarial hispanohablante, donde el orgullo profesional y el 'quedar bien' pueden llevarnos a persistir en negociaciones destinadas al fracaso. La escalada de compromiso se alimenta de la inversión emocional, temporal y de recursos ya realizada, creando la ilusión de que 'abandonar ahora sería desperdiciar todo lo invertido'.</p>
          <p>El exceso de confianza se manifiesta en preparación insuficiente, subestimación de la contraparte, y sobrestimación de nuestro BATNA (mejor alternativa). En culturas donde la experiencia y la antigüedad son respetadas, los negociadores senior son especialmente vulnerables a este sesgo.</p>
          <p>Para combatir estos sesgos, es fundamental establecer criterios objetivos de éxito y fracaso antes de iniciar la negociación, junto con puntos de revisión obligatorios. La técnica del 'abogado del diablo' - designar alguien para cuestionar nuestras decisiones - es especialmente útil. También ayuda preguntarse: 'Si empezara esta negociación desde cero hoy, ¿seguiría el mismo camino?'</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Una empresa argentina llevaba 8 meses negociando un joint venture con una firma europea, invirtiendo €50,000 en viajes y consultorías. Cuando surgieron nuevas objeciones regulatorias, el director general quiso continuar porque 'ya llevamos mucho invertido'. El CFO implementó una revisión objetiva: probabilidad de éxito bajó al 15%, costos adicionales estimados en €80,000. Aplicando la regla 'Si empezáramos hoy, ¿lo haríamos?', decidieron suspender las negociaciones, evitando pérdidas mayores y liberando recursos para oportunidades más viables.</p>
          </div>
        </section>

        {/* Sección 4: Disponibilidad y Reciprocidad: Los Motores Emocionales de la Persuasión */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>Disponibilidad y Reciprocidad: Los Motores Emocionales de la Persuasión</h2>
          </div>

          <p>La heurística de disponibilidad nos hace darle más peso a la información que recordamos fácilmente, generalmente porque es reciente, emocional o repetitiva. La reciprocidad, por su parte, es la tendencia profundamente humana a devolver favores, creando un poderoso motor de persuasión en las negociaciones.</p>
          <p>En el contexto cultural hispano, donde las relaciones personales son fundamentales para los negocios, estos dos sesgos adquieren particular relevancia. La disponibilidad puede llevar a decisiones basadas en anécdotas recientes en lugar de datos comprehensivos, mientras que la reciprocidad puede crear compromisos que van más allá de lo comercialmente sensato.</p>
          <p>La disponibilidad se puede usar estratégicamente compartiendo casos específicos, historias de éxito o testimonios que queremos que la otra parte recuerde fácilmente. La repetición de mensajes clave también aumenta su disponibilidad mental. Sin embargo, debemos cuidar que nuestros propios casos recientes no distorsionen nuestra perspectiva del mercado.</p>
          <p>La reciprocidad se activa con concesiones iniciales, información valiosa compartida gratuitamente, o gestos que demuestren buena fe. En culturas donde el honor y las relaciones son importantes, pequeñas concesiones o atenciones pueden generar reciprocidad desproporcionada. Sin embargo, es crucial que estas acciones parezcan genuinas, no calculadas.</p>
          <p>Para defenderse, es importante basar decisiones en datos comprehensivos, no solo en ejemplos memorables, y reconocer cuándo la sensación de 'deber algo' puede estar influyendo en nuestras concesiones.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>En una negociación comercial en Lima, el representante de una multinacional comparte el caso específico de una empresa local similar que 'triplicó sus ventas en 18 meses usando nuestra solución'. Esta historia específica y emocional se vuelve más 'disponible' mentalmente que estadísticas generales. Además, ofrece un estudio de mercado valorado en \$5,000 'como muestra de confianza mutua'. El comprador peruano, influido por la reciprocidad, acepta condiciones más favorables al proveedor. La combinación de disponibilidad (caso memorable) y reciprocidad (regalo inicial) resulta en un acuerdo 12% más favorable que las condiciones estándar de mercado.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>El anclaje hace que la primera cifra mencionada determine inconscientemente todo el rango de negociación posterior</li>
            <li>Las propuestas deben encuadrarse como ganancias o prevención de pérdidas según convenga, aprovechando que tememos perder más de lo que valoramos ganar</li>
            <li>El exceso de confianza y la escalada de compromiso pueden llevarnos a persistir en negociaciones fallidas por haber invertido ya recursos</li>
            <li>La información reciente y memorable influye desproporcionadamente en nuestras decisiones (disponibilidad)</li>
            <li>Los pequeños favores o concesiones iniciales generan una poderosa obligación psicológica de reciprocidad</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Recuerdas alguna negociación donde fuiste influido por la primera cifra mencionada? ¿Cómo podrías haber contrarrestado ese anclaje?</li>
            <li>¿Has persistido alguna vez en una negociación más por lo ya invertido que por las probabilidades reales de éxito?</li>
            <li>¿Qué historias o casos recientes han influido en tus decisiones de negociación? ¿Eran realmente representativos del panorama general?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de tu próxima negociación importante, prepara tres anclas diferentes con sus respectivas justificaciones, define criterios objetivos de cuándo suspender la negociación, y ten listos 2-3 casos específicos o pequeñas concesiones iniciales para activar reciprocidad.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Un experimento de Dan Ariely demostró que incluso pedir a personas que escriban los últimos dos dígitos de su número de seguridad social antes de ofertar en una subasta influye en sus ofertas. Los participantes con números más altos ofertaron hasta 346% más que aquellos con números bajos, demostrando el poder inconsciente del anclaje numérico.</p>
      </div>
    </ChapterPage>
  );
}
