'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function AnalizartextosPage() {
  return (
    <ChapterPage chapterId="analizar-textos">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Cuando te enfrentes a una reseña académica, no estás simplemente resumiendo un texto, sino dialogando críticamente con él. La reseña es tu oportunidad de demostrar comprensión profunda, análisis riguroso y capacidad de evaluación académica. Dominar esta habilidad no solo mejorará tus calificaciones, sino que será fundamental en tu desarrollo profesional e investigativo.</p>
      </section>

      {/* Sección: ¿Qué es una Reseña Crítica? */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>¿Qué es una Reseña Crítica?</h2>
        </div>
          <p>Una reseña crítica académica es tu análisis profesional de un trabajo de investigación, donde demuestras que puedes leer como un experto en tu campo. Te guío paso a paso para que entiendas la diferencia práctica entre resumir y reseñar.</p>
          <p>Cuando solo resumes, dices: "El autor afirma que la pobreza urbana ha aumentado en las últimas décadas." Cuando reseñas críticamente, escribes: "Aunque Pérez documenta el incremento de la pobreza urbana con datos convincentes de censos nacionales, su análisis se limita a variables cuantitativas y no considera factores cualitativos como las redes de apoyo comunitario que varios estudios recientes han identificado como determinantes."</p>
          <p>¿Ves la diferencia? En la reseña crítica:
- Reconoces los méritos ("datos convincentes")
- Identificas las fuentes ("censos nacionales")
- Señalas limitaciones específicas ("solo variables cuantitativas")
- Conectas con el campo de conocimiento ("estudios recientes")</p>
          <p>Para desarrollar este enfoque crítico, pregúntate mientras lees:
1. ¿Qué evidencias presenta el autor y qué tan sólidas son?
2. ¿Qué perspectivas o enfoques alternativos no está considerando?
3. ¿Cómo se relaciona este trabajo con otros que he leído?
4. ¿Qué preguntas importantes quedan sin responder?</p>
          <p>Tu tarea no es atacar el trabajo, sino evaluarlo profesionalmente. Un cirujano no odia el cuerpo que opera; simplemente identifica con precisión qué está funcionando bien y qué necesita atención. Así debes abordar tu reseña crítica.</p>
          <p>Recuerda: estás entrenándote para ser un investigador que puede evaluar la calidad académica. Esta habilidad será crucial cuando escribas tu marco teórico, cuando evalúes fuentes para tu tesis, y cuando participes en debates académicos profesionales.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Ejemplo de evolución de resumen a reseña crítica:

RESUMEN: "Rodríguez, M. (2023). Impacto de las redes sociales en la educación universitaria. Editorial Académica, Madrid, 320 págs. El autor examina cómo Facebook e Instagram afectan el rendimiento estudiantil."

RESEÑA CRÍTICA: "Rodríguez, M. (2023). Impacto de las redes sociales en la educación universitaria. Editorial Académica, Madrid, 320 págs. Aunque Rodríguez ofrece un análisis cuantitativo riguroso del uso de Facebook e Instagram entre estudiantes universitarios, basado en una muestra de 1,200 participantes, su estudio presenta limitaciones metodológicas significativas al excluir plataformas emergentes como TikTok y al no considerar variables socioeconómicas que la literatura reciente (Davis, 2022; Chen et al., 2023) ha identificado como determinantes en los patrones de uso digital."</p>
        </div>
      </section>

      {/* Sección: Estructura de la Reseña Académica */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Estructura de la Reseña Académica</h2>
        </div>
          <p>Te voy a enseñar la arquitectura de una reseña que impresionará a cualquier evaluador académico. Cada sección tiene un propósito específico y te muestro exactamente cómo escribirla.</p>
          <p><strong>1. INTRODUCCIÓN (Tu gancho profesional)</strong>
No empieces con "En este trabajo se va a reseñar...". Eso es amateur. Engancha desde la primera línea:</p>
          <p>"La pregunta sobre si la inteligencia artificial puede reemplazar la creatividad humana cobra nueva relevancia con la propuesta de Thompson (2023) en 'Algoritmos y Arte: Una revolución creativa', donde argumenta que la IA no solo imita, sino que genuinamente crea."</p>
          <p>En tu introducción debes:
- Presentar el tema de forma atractiva
- Ubicar al autor en su contexto académico
- Adelantar tu valoración general (sin revelar todo)</p>
          <p><strong>2. DESCRIPCIÓN DEL CONTENIDO (Tu demostración de comprensión)</strong>
Aquí demuestras que entendiste perfectamente el trabajo. Estructura esta sección así:
- Tesis central del autor
- Argumentos principales (máximo 3-4)
- Metodología utilizada
- Conclusiones centrales</p>
          <p>Ejemplo práctico: "Thompson estructura su argumento en tres pilares: primero, que la creatividad es esencialmente combinatoria (capítulos 1-2); segundo, que los algoritmos pueden generar combinaciones genuinamente novedosas (capítulos 3-5); y tercero, que la evaluación estética es independiente del origen humano o artificial de la obra (capítulos 6-7). Su metodología combina análisis filosófico con estudios de caso de obras generadas por IA."</p>
          <p><strong>3. ANÁLISIS CRÍTICO (Tu expertise en acción)</strong>
Esta es la sección que marca la diferencia entre una reseña promedio y una excepcional. Evalúa sistemáticamente:</p>
          <p><em>Fortalezas específicas:</em> "La principal contribución de Thompson radica en su marco teórico integrador, que supera la falsa dicotomía entre creatividad humana y artificial presente en trabajos anteriores como los de Mitchell (2019) y García (2021)."</p>
          <p><em>Limitaciones metodológicas:</em> "Sin embargo, el análisis se ve limitado por la ausencia de perspectivas neurociencia cognitiva contemporáneas, particularmente los hallazgos de Bennet et al. (2022) sobre los mecanismos neuronales específicos de la creatividad."</p>
          <p><em>Contexto académico:</em> "El trabajo dialoga productivamente con la tradición filosófica de Boden (1994) sobre creatividad, aunque no aborda las críticas recientes de la escuela fenomenológica (Varela, 2020)."</p>
          <p><strong>4. VALORACIÓN FINAL (Tu veredicto profesional)</strong>
Concluye con una evaluación equilibrada que muestre tu criterio académico maduro. No digas simplemente "es un buen libro". Sé específico sobre su contribución, limitaciones y relevancia para diferentes audiencias.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Ejemplo de transición fluida entre secciones:

"[Final de descripción] ...concluyendo que la IA alcanzará paridad creativa con humanos en la próxima década.

[Inicio de análisis crítico] Esta predicción temporal, aunque provocativa, revela una de las principales debilidades del análisis de Thompson: la ausencia de criterios operacionales claros para medir la 'paridad creativa'. Mientras que su marco teórico es sólido..."

Observa cómo la transición conecta las ideas y introduce el análisis de forma natural, no abrupta.</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Tu reseña crítica debe demostrar que puedes leer como un experto: identifica fortalezas, limitaciones y contexto académico</li>
          <li>Estructura cada párrafo con propósito específico: descripción objetiva primero, análisis crítico después</li>
          <li>Conecta siempre el trabajo reseñado con otros estudios del campo para mostrar tu conocimiento contextual</li>
          <li>Usa un tono profesional pero accesible: riguroso sin ser pedante, crítico sin ser destructivo</li>
          <li>Equilibra reconocimiento de méritos con señalamiento de limitaciones específicas y fundamentadas</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Escribir solo un resumen extendido sin análisis crítico real</li>
          <li>Hacer críticas vagas como 'el autor no profundiza lo suficiente' sin especificar qué falta exactamente</li>
          <li>Emitir juicios personales ('no me gustó') en lugar de evaluaciones académicas fundamentadas</li>
          <li>No contextualizar el trabajo dentro del campo de conocimiento relevante</li>
          <li>Usar un tono demasiado informal o demasiado agresivo en lugar del registro académico apropiado</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>El secreto de una reseña excepcional está en mostrar que conoces el campo académico. Cuando escribas 'Aunque el análisis de X es valioso, no considera los hallazgos recientes de Y y Z que cuestionan esta perspectiva', estás demostrando que no solo leíste un texto, sino que entiendes el panorama completo de investigación. Esa es la diferencia entre un estudiante y un futuro investigador.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>EJERCICIO PRÁCTICO INMEDIATO: Toma un artículo clave de tu marco teórico y escribe solo el primer párrafo de una reseña crítica. Debe enganchar, contextualizar y adelantar tu valoración en máximo 100 palabras. Luego pregúntate: ¿Un experto en mi área se sentiría intrigado por seguir leyendo? Si la respuesta es no, reescribe hasta que lo sea. Este párrafo es tu carta de presentación como investigador.</p>
      </div>
    </ChapterPage>
  );
}
