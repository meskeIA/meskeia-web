'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function AntesdeescribirPage() {
  return (
    <ChapterPage chapterId="antes-de-escribir">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>¿Te has quedado alguna vez paralizado frente a la página en blanco de tu TFG? ¿O has empezado a escribir directamente y luego te has dado cuenta de que has perdido el hilo? Te entiendo perfectamente. La diferencia entre un trabajo académico que fluye y uno que se convierte en una pesadilla no está en el talento, sino en la estrategia. Como tu tutor, te voy a enseñar un método probado que convierte la escritura académica de un caos en un proceso predecible y manejable. Miles de estudiantes han salvado sus TFG siguiendo estos pasos.</p>
      </section>

      {/* Sección: Las tres fases de la escritura académica: Planificación, Redacción y Revisión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Las tres fases de la escritura académica: Planificación, Redacción y Revisión</h2>
        </div>
          <p>Déjame contarte algo que he observado en 15 años dirigiendo tesis: los estudiantes que planifican terminan sus trabajos en la mitad del tiempo y con el doble de calidad. Pero atención, porque aquí viene el secreto que nadie te explica: cada fase requiere un estado mental completamente diferente, y mezclarlas es la receta perfecta para el bloqueo del escritor.</p>
          <p><strong>FASE 1: PLANIFICACIÓN (El detective)</strong>
En esta fase eres un detective reuniendo pistas. Tu misión es clara: definir qué vas a investigar, cómo lo vas a hacer y qué estructura seguirá tu texto. Dedica el 30% de tu tiempo total a esta fase. Si tu TFG te va a llevar 6 meses, invierte casi 2 meses solo en planificar. Sé que suena mucho, pero créeme, luego me darás las gracias.</p>
          <p>Empezarás definiendo tu pregunta de investigación con precisión quirúrgica. No vale 'Voy a hablar de inteligencia artificial'. Necesitas algo como: '¿Cómo están transformando los chatbots de IA la experiencia del cliente en el sector bancario español entre 2020-2024?' ¿Ves la diferencia? La segunda pregunta ya te está diciendo qué estudiar, dónde, cuándo y cómo.</p>
          <p>Luego, crearás tu esquema. No un índice bonito, sino una estructura que responda a tu pregunta paso a paso. Cada apartado debe tener un propósito claro en tu argumentación. Piensa en tu esquema como los planos de una casa: cada habitación tiene una función específica.</p>
          <p><strong>FASE 2: REDACCIÓN (El constructor)</strong>
Ahora cambias de sombrero. Olvídate de la perfección, de buscar la palabra exacta o de que cada frase suene académica. Tu única misión es construir, poner ladrillos sobre el plano que ya tienes. Escribe rápido, escribe mal si es necesario, pero escribe. Esta fase debe representar el 50% de tu tiempo.</p>
          <p>Un truco que enseño a todos mis estudiantes: empieza cada sesión de escritura repasando lo que escribiste el día anterior. Te ayudará a retomar el hilo y mantener la coherencia. Y usa marcadores como [AMPLIAR AQUÍ] o [BUSCAR CITA] cuando sepas que necesitas algo pero no quieras interrumpir tu flujo de escritura.</p>
          <p><strong>FASE 3: REVISIÓN (El editor implacable)</strong>
Aquí te conviertes en tu crítico más duro. Esta fase consume el 20% restante de tu tiempo, pero es donde tu trabajo pasa de amateur a profesional. Revisa en capas: primero la estructura general (¿responde mi texto a la pregunta inicial?), luego la argumentación (¿cada párrafo aporta algo a mi tesis?), después el estilo (¿suena académico pero comprensible?) y finalmente los errores de forma.</p>
          <p>La clave del éxito es la disciplina de no mezclar estas fases. Cuando estés planificando, resiste la tentación de escribir párrafos completos. Cuando estés redactando, ignora los errores de ortografía. Y cuando revises, no añadas contenido nuevo sin replantearte toda la estructura.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p><strong>Ejemplo real de planificación de un TFG en Psicología:</strong>

<strong>Pregunta de investigación:</strong> ¿Cómo influye el uso de Instagram en los niveles de ansiedad social de estudiantes universitarias de 18-22 años en Madrid?

<strong>Esquema argumentativo:</strong>
1. <strong>Introducción</strong> (¿Por qué es relevante este problema ahora?)
   - Datos sobre uso de Instagram en universitarios
   - Aumento de ansiedad social post-pandemia
   - Pregunta e hipótesis

2. <strong>Marco teórico</strong> (¿Qué sabemos ya sobre esto?)
   2.1 Teorías de la comparación social en redes sociales
   2.2 Ansiedad social: definición y medición
   2.3 Estudios previos sobre Instagram y bienestar mental

3. <strong>Metodología</strong> (¿Cómo lo voy a estudiar?)
   3.1 Enfoque cuantitativo: encuestas validadas
   3.2 Muestra: 200 estudiantes de 3 universidades madrileñas
   3.3 Variables e instrumentos de medida

4. <strong>Resultados</strong> (¿Qué he encontrado?)
   4.1 Correlaciones entre tiempo de uso e indicadores de ansiedad
   4.2 Análisis por tipo de contenido consumido

5. <strong>Discusión</strong> (¿Qué significa esto?)
   - Interpretación de resultados
   - Limitaciones del estudio
   - Implicaciones prácticas

<strong>Cronograma real:</strong>
- Meses 1-2: Revisión bibliográfica y diseño metodológico
- Mes 3: Recogida de datos
- Mes 4: Análisis de datos
- Mes 5: Redacción completa
- Mes 6: Revisión y formato final</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Dedica el 30% de tu tiempo a planificar, 50% a redactar y 20% a revisar - esta proporción salvará tu TFG</li>
          <li>Define tu pregunta de investigación con precisión: debe indicar qué, cómo, dónde y cuándo estudias</li>
          <li>Cada apartado de tu esquema debe tener una función clara en tu argumentación global</li>
          <li>En la fase de redacción, prioriza el flujo sobre la perfección - los errores se corrigen después</li>
          <li>Revisa en capas: primero estructura, luego argumentación, después estilo y finalmente forma</li>
          <li>No mezcles fases: cuando planificas, solo planificas; cuando escribes, solo escribes; cuando revisas, solo revisas</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Empezar a escribir la introducción sin tener claro el argumento completo del trabajo</li>
          <li>Revisar cada párrafo mientras escribes - esto mata tu flujo creativo y ralentiza todo el proceso</li>
          <li>Planificar de forma demasiado rígida sin dejar espacio para hallazgos inesperados durante la investigación</li>
          <li>Confundir 'hacer el índice' con planificar - el esquema debe mostrar tu argumentación, no solo los temas</li>
          <li>Saltarse la revisión estructural y centrarse solo en corregir errores de ortografía</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Aquí tienes mi truco secreto para estudiantes bloqueados: en tu esquema inicial, escribe después de cada apartado una frase que empiece por 'En esta sección demuestro que...' Si no puedes completar esa frase, es que ese apartado no tiene función clara en tu trabajo. Este simple ejercicio ha salvado cientos de TFG de convertirse en trabajos divagantes sin rumbo fijo.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>EJERCICIO PRÁCTICO para esta semana: Toma tu tema de TFG y dedica exactamente 3 horas a crear tu esquema argumentativo. Paso 1 (30 min): Convierte tu tema en una pregunta específica. Paso 2 (90 min): Crea un esquema de 4-5 apartados principales, escribiendo después de cada uno 'En esta sección demuestro que...' Paso 3 (60 min): Busca 10 fuentes preliminares y asígnalas a cada apartado. Al final de estas 3 horas tendrás el 80% de la planificación hecha. Compártelo con tu tutor antes de escribir una sola línea del trabajo final.</p>
      </div>
    </ChapterPage>
  );
}
