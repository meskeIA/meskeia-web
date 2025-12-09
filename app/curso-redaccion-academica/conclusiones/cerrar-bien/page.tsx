'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function CerrarbienPage() {
  return (
    <ChapterPage chapterId="cerrar-bien">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Escribir conclusiones efectivas no es un requisito burocrático, es tu última oportunidad para impactar al lector y demostrar el valor real de tu investigación. En este módulo aprenderás a transformar las conclusiones de simples resúmenes a verdaderos momentos de cierre académico que sinteticen, proyecten y resignifiquen tu trabajo.</p>
      </section>

      {/* Sección: Qué debe contener una conclusión académica */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Qué debe contener una conclusión académica</h2>
        </div>
          <p>Piensa en tu conclusión como una conversación inteligente con alguien que acaba de leer tu trabajo completo. No necesita que le repitas todo, pero sí que le muestres qué significa realmente lo que descubriste. Una conclusión académica efectiva debe contener cuatro elementos fundamentales que trabajarás en párrafos separados:</p>
          <p><strong>Párrafo 1: Tu respuesta directa</strong> - Comienza retomando tu pregunta de investigación original, pero ahora desde la posición de alguien que ya tiene la respuesta. En lugar de 'Este trabajo se propuso investigar si...', escribe 'La investigación realizada demuestra que...' o 'Los hallazgos revelan que...'. Este párrafo debe ser contundente y claro.</p>
          <p><strong>Párrafo 2: El significado más profundo</strong> - Aquí interpretas tus resultados en un contexto más amplio. ¿Qué implican tus hallazgos para la disciplina? ¿Cómo se conectan con debates teóricos existentes? ¿Qué confirman, cuestionan o amplían del conocimiento actual? Este es el párrafo más analítico de tu conclusión.</p>
          <p><strong>Párrafo 3: Limitaciones y proyecciones</strong> - Reconoce honestamente las limitaciones de tu investigación, pero no como una debilidad, sino como una invitación a futuras investigaciones. Identifica qué preguntas surgieron durante tu proceso que no pudiste responder, qué aspectos merecen profundización o qué nuevas líneas de investigación se abren.</p>
          <p><strong>Párrafo 4: Impacto y relevancia</strong> - Cierra reflexionando sobre las implicaciones prácticas, teóricas o metodológicas de tu trabajo. ¿Por qué debería importarle a alguien fuera de tu círculo académico inmediato?</p>
          <p>La extensión ideal varía: 1-2 páginas para TFG, 2-4 páginas para tesis de maestría, y hasta 6-8 páginas para tesis doctorales. Más importante que la longitud es la densidad conceptual: cada oración debe aportar valor analítico, no solo ocupar espacio.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Ejemplo de párrafo inicial de conclusión efectiva (TFG en Psicología Educativa):

"Los resultados obtenidos confirman que la implementación de técnicas de mindfulness en el aula no solo reduce los niveles de ansiedad académica en estudiantes universitarios, sino que genera cambios significativos en sus estrategias de autorregulación emocional. Contrario a nuestra hipótesis inicial, que planteaba efectos principalmente a nivel sintomatológico, los hallazgos revelan transformaciones más profundas en la percepción que los estudiantes tienen sobre su capacidad de agencia frente al estrés académico. Esta investigación demuestra que las intervenciones contemplativas en contextos educativos operan tanto a nivel conductual como cognitivo, generando recursos psicológicos que trascienden la situación específica de aprendizaje."</p>
        </div>
      </section>

      {/* Sección: Cómo retomar la tesis sin repetirte */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Cómo retomar la tesis sin repetirte</h2>
        </div>
          <p>El mayor desafío de escribir conclusiones es retomar tu planteamiento inicial sin sonar repetitivo. La clave está en entender que ahora tienes una perspectiva diferente: ya no eres alguien que se pregunta, sino alguien que responde desde el conocimiento adquirido.</p>
          <p><strong>Estrategia 1: Cambio de temporalidad verbal</strong> - En lugar de 'Este trabajo se propone demostrar...', escribe 'La investigación realizada demuestra...'. En lugar de 'Hipotetizamos que...', utiliza 'Los hallazgos confirman que...' o 'Los resultados revelan que...'. Este cambio temporal marca la diferencia entre plantear una pregunta y ofrecer una respuesta fundamentada.</p>
          <p><strong>Estrategia 2: Ampliación del contexto</strong> - Si en la introducción dijiste 'Las redes sociales influyen en la autoestima adolescente', en la conclusión puedes escribir 'Los hallazgos revelan que la relación entre redes sociales y autoestima adolescente es más compleja de lo que sugieren los enfoques deterministas, mostrando patrones diferenciados según...' Amplías el marco interpretativo.</p>
          <p><strong>Estrategia 3: Uso de verbos analíticos</strong> - Reemplaza verbos neutros como 'mostrar', 'demostrar', 'comprobar' por verbos que implican profundidad analítica: 'revelar', 'evidenciar', 'problematizar', 'complejizar', 'cuestionar', 'resignificar'. Estos verbos transmiten que no solo confirmaste algo, sino que aportaste una nueva comprensión.</p>
          <p><strong>Estrategia 4: La técnica del zoom-out</strong> - Imagínate ajustando una cámara: en la introducción enfocaste un problema específico, en la conclusión alejas la cámara para mostrar cómo tu hallazgo específico se conecta con panoramas más amplios de conocimiento.</p>
          <p><strong>Estrategia 5: Mostrar la evolución de tu pensamiento</strong> - Reconoce explícitamente cómo tu comprensión evolucionó durante la investigación. Frases como 'Inicialmente planteamos... sin embargo, los hallazgos sugieren una interpretación más matizada...' o 'Si bien la hipótesis original se confirmó parcialmente, emergieron dimensiones no contempladas inicialmente...' muestran reflexividad y profundidad intelectual.</p>
          <p>Evita completamente frases como 'Como se dijo anteriormente...', 'Tal como se mencionó...', o reproducciones literales de párrafos de la introducción. Tu conclusión debe sonar como una conversación nueva, informada por todo el proceso investigativo.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Comparación práctica:

<strong>Introducción original:</strong> 'Esta investigación analiza el impacto de las metodologías activas en el rendimiento académico de estudiantes de ingeniería, partiendo de la hipótesis de que la implementación de aprendizaje basado en problemas mejorará significativamente los resultados de aprendizaje.'

<strong>Conclusión mejorada:</strong> 'Los hallazgos obtenidos confirman que la implementación de metodologías activas, específicamente el aprendizaje basado en problemas, transforma no solo los indicadores cuantitativos de rendimiento académico, sino fundamentalmente la relación que los estudiantes de ingeniería establecen con el conocimiento. Más allá de la mejora estadísticamente significativa en las calificaciones, esta investigación revela que las metodologías activas generan competencias metacognitivas que preparan a los futuros ingenieros para enfrentar problemas complejos en contextos profesionales reales.'</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Estructura tu conclusión en párrafos específicos: respuesta directa, significado amplio, limitaciones y proyecciones, impacto</li>
          <li>Cambia la temporalidad verbal: de 'se propone' a 'se demuestra'</li>
          <li>Usa verbos analíticos que muestren profundidad: revelar, problematizar, complejizar</li>
          <li>Aplica la técnica del zoom-out: conecta tus hallazgos específicos con debates más amplios</li>
          <li>Muestra la evolución de tu pensamiento durante la investigación</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Copiar y pegar párrafos completos de la introducción cambiando solo el tiempo verbal</li>
          <li>Introducir datos nuevos o referencias no mencionadas en el desarrollo</li>
          <li>Limitarse a enumerar resultados sin interpretarlos analíticamente</li>
          <li>Usar frases de relleno como 'Como se dijo anteriormente' o 'Tal como se mencionó'</li>
          <li>Terminar abruptamente sin proyectar el valor o impacto de la investigación</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Lee tu introducción y tu conclusión seguidas, como si fueran párrafos consecutivos. Si suenan redundantes o repetitivas, necesitas reescribir la conclusión. La mejor conclusión es la que podría funcionar como un abstract independiente de tu investigación, pero que claramente proviene de alguien que ya completó el trabajo, no de alguien que apenas lo está planteando.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Toma tu conclusión actual y reescribe el primer párrafo aplicando estas estrategias: 1) Cambia todos los verbos a tiempo pasado o presente definitivo, 2) Amplía el contexto interpretativo de tus hallazgos, 3) Usa al menos dos verbos analíticos (revelar, evidenciar, problematizar). Después compara ambas versiones y evalúa cuál suena más como una respuesta fundamentada que como una repetición de preguntas.</p>
      </div>
    </ChapterPage>
  );
}
