'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function CuerpoargumentacionPage() {
  return (
    <ChapterPage chapterId="cuerpo-argumentacion">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Cuando revisas tu borrador y sientes que tus ideas están ahí pero no logran convencer, el problema casi siempre está en cómo construyes tus párrafos. Un párrafo académico débil puede arruinar el mejor argumento, mientras que uno bien estructurado puede hacer brillar incluso ideas complejas. En este módulo no solo aprenderás la teoría de la construcción de párrafos, sino que desarrollarás las habilidades prácticas para transformar tus borradores actuales en textos académicos sólidos y persuasivos que realmente comuniquen el valor de tu investigación.</p>
      </section>

      {/* Sección: Anatomía del Párrafo Académico: Construcción Paso a Paso */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Anatomía del Párrafo Académico: Construcción Paso a Paso</h2>
        </div>
          <p>Piensa en tu párrafo como una conversación estructurada con tu lector. Cada elemento tiene un propósito específico que puedes dominar con práctica deliberada. La oración tópica es tu declaración de intenciones: debe ser lo suficientemente específica para guiar el párrafo completo, pero lo suficientemente amplia para desarrollarla en 150-200 palabras. Por ejemplo, en lugar de escribir 'Las redes sociales son importantes', prueba con 'El uso de Instagram como herramienta de marketing político transformó las estrategias electorales en América Latina durante 2018-2022'. Esta segunda versión te da una ruta clara para desarrollar.</p>
          <p>Ahora viene el desarrollo: cada oración posterior debe responder a una pregunta implícita que genera la oración tópica. Si dices que Instagram transformó las estrategias, el lector se pregunta ¿cómo?, ¿cuándo?, ¿con qué efectos? Tu trabajo es anticipar estas preguntas y responderlas sistemáticamente. La evidencia no debe ser decorativa, sino funcional. Cada dato, cita o ejemplo debe servir para fortalecer tu argumento principal.</p>
          <p>El cierre del párrafo es crucial pero a menudo descuidado. No se trata de repetir lo ya dicho, sino de consolidar el argumento y preparar el terreno para el siguiente párrafo. Una técnica efectiva es el 'puente temático': una oración que conecta la idea que acabas de desarrollar con la que desarrollarás después. Por ejemplo: 'Esta transformación en las estrategias de comunicación política generó, a su vez, cambios significativos en los patrones de participación ciudadana'.</p>
          <p>La coherencia interna del párrafo se logra con conectores precisos y progresión temática clara. Cada oración debe retomar un elemento de la anterior y añadir información nueva. Si saltas de una idea a otra sin conexión evidente, pierdes al lector y debilitas tu argumento.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Párrafo de una tesis en Educación: 'La implementación de metodologías activas en la enseñanza universitaria de ciencias exactas presenta desafíos específicos que requieren adaptaciones pedagógicas particulares. Según el estudio longitudinal de Martínez et al. (2022), el 73% de los docentes de matemáticas reporta dificultades para integrar el aprendizaje basado en problemas debido a la estructura secuencial del currículum. Esta resistencia estructural se manifiesta especialmente en cursos introductorios, donde la carga conceptual impide la implementación de dinámicas colaborativas extensas (López-García, 2021, p. 45). Sin embargo, las experiencias piloto desarrolladas en tres universidades públicas demuestran que la adaptación gradual de estas metodologías genera mejoras significativas en la comprensión conceptual después del segundo semestre de implementación. Estos resultados sugieren que el éxito de la innovación pedagógica depende menos de la metodología elegida que de la estrategia de implementación institucional.'</p>
        </div>
      </section>

      {/* Sección: Tipos de Argumentos en la Escritura Académica */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Tipos de Argumentos en la Escritura Académica</h2>
        </div>
          <p>Dominar los tipos de argumentos te permitirá construir párrafos más convincentes y variados. Pero la clave no está en memorizarlos, sino en saber cuándo y cómo usar cada uno para fortalecer tu caso específico.</p>
          <p>El argumento de autoridad funciona cuando citas fuentes reconocidas, pero debe ir más allá de la simple mención. Introduce la fuente, presenta su credencial relevante y explica por qué su perspectiva es significativa para tu argumento. En lugar de escribir 'Según García (2020)', prueba con 'García (2020), cuya investigación longitudinal sobre políticas educativas en contextos rurales abarca quince años de trabajo de campo, sostiene que...'. Esta contextualización le da peso real a la cita.</p>
          <p>Los argumentos empíricos requieren interpretación activa de tu parte. Los datos por sí solos no argumentan nada; tú debes explicar qué significan en el contexto de tu investigación. Si presentas una estadística, dedica al menos dos oraciones a interpretarla: una para explicar qué muestra el dato y otra para conectarlo con tu argumento mayor.</p>
          <p>La analogía es poderosa pero peligrosa. Funciona cuando las similitudes son realmente significativas y ayudan a clarificar conceptos complejos. Pero puede debilitar tu argumento si la comparación es forzada o superficial. Usa analogías para explicar, no para probar.</p>
          <p>Los argumentos lógicos son la columna vertebral de tu texto académico. Se basan en cadenas de razonamiento donde cada paso se sigue del anterior. La clave está en hacer explícitos los vínculos lógicos. Usa conectores como 'por tanto', 'en consecuencia', 'dado que', 'si... entonces' para guiar al lector a través de tu razonamiento.</p>
          <p>La combinación estratégica es lo que distingue un texto académico maduro. No uses todos los tipos en cada párrafo, sino selecciona los más apropiados para cada punto específico. Un párrafo puede comenzar con un argumento de autoridad, desarrollarse con evidencia empírica y cerrar con una conexión lógica hacia el siguiente punto.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Párrafo de una investigación en Sociología que combina argumentos: 'El fenómeno de gentrificación en barrios históricos de América Latina responde a dinámicas globales pero se manifiesta con características locales específicas. Harvey (2019), reconocido teórico urbano cuyo trabajo sobre geografía del capitalismo es referencia mundial, identifica tres mecanismos centrales de desplazamiento residencial en contextos de renovación urbana. Los datos del censo 2018-2022 en cinco capitales latinoamericanas confirman esta tendencia: el incremento promedio del 340% en valores de arriendo coincide temporalmente con la llegada de inversiones inmobiliarias internacionales (Instituto de Estudios Urbanos, 2023). Este patrón replica lo observado en ciudades europeas durante los años noventa, donde la secuencia renovación-valorización-desplazamiento se completó en períodos similares de cuatro a seis años. Por tanto, los indicadores actuales sugieren que estamos ante la fase inicial de un proceso de transformación urbana que requerirá intervención política específica para proteger a las comunidades vulnerables.'</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Tu oración tópica debe ser lo suficientemente específica para guiar todo el párrafo</li>
          <li>Cada párrafo necesita entre 3-4 tipos de oraciones: tópica, desarrollo, evidencia y cierre</li>
          <li>Los conectores no son decorativos: úsalos para mostrar relaciones lógicas específicas</li>
          <li>Combina tipos de argumentos estratégicamente, no uses todos en cada párrafo</li>
          <li>El cierre del párrafo debe preparar el terreno para el siguiente punto</li>
          <li>La evidencia siempre necesita tu interpretación explícita</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Párrafos de una sola idea sin desarrollo: escribir la tesis y pasar al siguiente punto</li>
          <li>Citas huérfanas: presentar fuentes sin explicar por qué son relevantes o creíbles</li>
          <li>Datos sin interpretación: mostrar estadísticas sin explicar qué significan para tu argumento</li>
          <li>Saltos temáticos: cambiar de idea sin conectores o transiciones claras</li>
          <li>Párrafos demasiado largos: intentar desarrollar múltiples ideas en un solo bloque</li>
          <li>Argumentos circulares: repetir la misma idea con palabras diferentes en lugar de desarrollarla</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Antes de escribir cada párrafo, hazte tres preguntas: ¿Qué quiero que el lector entienda al final de este párrafo? ¿Qué evidencia necesito para convencerlo? ¿Cómo conecta esto con mi argumento general? Si no puedes responder claramente, no estás listo para escribir ese párrafo.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Toma el capítulo que estás escribiendo ahora y elige tres párrafos consecutivos. En cada uno, identifica: 1) La oración tópica (¿está realmente ahí?), 2) El tipo de argumento principal que usas, 3) La conexión con el párrafo siguiente. Reescribe las transiciones entre párrafos hasta que un lector externo pueda seguir tu razonamiento sin saltos lógicos. Luego aplica la misma técnica al resto del capítulo.</p>
      </div>
    </ChapterPage>
  );
}
