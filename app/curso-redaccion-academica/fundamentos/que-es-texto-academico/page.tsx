'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function QueestextoacademicoPage() {
  return (
    <ChapterPage chapterId="que-es-texto-academico">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Si alguna vez te has sentado frente a una página en blanco preguntándote cómo empezar tu TFG o tesis, este módulo es para ti. Escribir académicamente no es cuestión de talento innato - es una técnica específica que puedes dominar siguiendo pasos concretos. Aquí aprenderás a transformar tus ideas en argumentos sólidos, a usar las fuentes correctamente y a estructurar tu texto para que cualquier lector pueda seguir tu razonamiento. Al final de este módulo, tendrás las herramientas prácticas para escribir con la autoridad y claridad que exige el mundo académico.</p>
      </section>

      {/* Sección: ¿Qué es un texto académico? */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>¿Qué es un texto académico?</h2>
        </div>
          <p>Imagina que estás en una conversación con expertos de tu campo. No puedes llegar y decir 'creo que esto es así porque se me ocurre'. Necesitas datos, necesitas mostrar que has hecho tu tarea, y necesitas construir tu argumento paso a paso. Eso es exactamente lo que hace un texto académico: participa en una conversación intelectual seria usando las reglas del juego académico.</p>
          <p>La diferencia clave está en cómo tratas cada afirmación. En una conversación casual podrías decir 'las redes sociales son adictivas'. En un texto académico escribirías: 'Estudios recientes sugieren que el uso excesivo de redes sociales presenta patrones similares a comportamientos adictivos (Smith, 2023), particularmente en usuarios de 16-25 años, donde el 34% reporta dificultades para controlar su uso diario (González et al., 2022)'. ¿Ves la diferencia? Cada palabra tiene un propósito y un respaldo.</p>
          <p>Tu lenguaje debe ser tu herramienta más precisa. Evita palabras como 'muy', 'bastante', 'mucho' - son vagas. En lugar de 'muchos estudiantes tienen problemas', escribe 'el 67% de los estudiantes encuestados reportó dificultades'. En lugar de 'es muy importante', explica exactamente por qué es relevante para tu investigación.</p>
          <p>La estructura no es opcional, es tu mapa de ruta. Cada párrafo debe tener una idea central clara, cada sección debe conectar con la siguiente, y tu lector nunca debe perderse preguntándose 'y esto para qué sirve'. Piensa en tu texto como un edificio: necesitas cimientos sólidos (introducción), paredes bien construidas (desarrollo) y un techo que cierre todo (conclusiones).</p>
          <p>La objetividad académica no significa eliminar tu voz, significa fundamentar cada punto que haces. Puedes tener una perspectiva, pero debe estar construida sobre evidencia sólida, no sobre preferencias personales. Tu trabajo es guiar al lector a través de los datos y el análisis hasta llegar a conclusiones bien fundamentadas.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Compara estos dos enfoques:

No académico: 'Pienso que la educación online es mejor porque es más flexible y los estudiantes pueden aprender a su ritmo.'

Académico: 'Los modelos de educación en línea han demostrado ventajas significativas en términos de flexibilidad temporal y personalización del aprendizaje. Un estudio longitudinal de tres años (Rodriguez & Martinez, 2022) encontró que el 78% de estudiantes en modalidades híbridas reportó mayor satisfacción con la gestión de tiempo académico, mientras que los sistemas adaptativos de aprendizaje mostraron una mejora del 23% en retención de contenidos comparado con metodologías presenciales tradicionales (Instituto de Educación Digital, 2023).'</p>
        </div>
      </section>

      {/* Sección: Tipos de Textos Académicos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Tipos de Textos Académicos</h2>
        </div>
          <p>Cada tipo de texto académico tiene su personalidad y sus reglas específicas. Es como elegir la herramienta correcta para cada trabajo - no usarías un martillo para atornillar. Entender estas diferencias te ahorrará horas de reescritura y te ayudará a enfocar tu energía correctamente desde el inicio.</p>
          <p>El ensayo académico es tu espacio para desarrollar un argumento sofisticado. No es una lista de puntos ni un resumen de fuentes - es tu oportunidad de tomar una posición y defenderla magistralmente. Empieza con una tesis controvertida pero defendible, algo que valga la pena argumentar. Por ejemplo, en lugar de 'la contaminación es mala', podrías argumentar 'las políticas actuales de reducción de emisiones en España son insuficientes para cumplir los objetivos del Acuerdo de París, requiriendo una reestructuración fundamental del sector energético'. Cada párrafo debe agregar una capa a tu argumento.</p>
          <p>El artículo científico sigue una lógica implacable: problema-método-resultados-interpretación. Tu introducción debe convencer al lector de que tu pregunta de investigación vale la pena. Tu metodología debe ser tan detallada que otro investigador pueda replicar exactamente lo que hiciste. Tus resultados deben presentarse sin interpretación (solo los hechos), y tu discusión es donde conectas tus hallazgos con el panorama más amplio de tu campo.</p>
          <p>Tu TFG o tesis es tu momento de brillar como investigador independiente. No es solo un trabajo más largo - es la demostración de que puedes identificar un problema real, diseñar una metodología apropiada, ejecutar la investigación rigurosamente y contribuir algo nuevo al conocimiento de tu campo. La clave está en encontrar el equilibrio entre ambición y factibilidad.</p>
          <p>Los informes técnicos son la traducción del conocimiento académico al mundo aplicado. Aquí tu audiencia necesita saber qué hacer con tu información. Estructura todo pensando en la utilidad práctica: resumen ejecutivo (para quien toma decisiones), metodología (para quien necesita replicar), resultados (datos claros) y recomendaciones específicas (pasos concretos a seguir).</p>
          <p>Recuerda que independientemente del tipo de texto, tu lector debe poder seguir tu lógica sin esfuerzo. Si tienes que explicar tu texto después de que alguien lo lee, necesitas reescribirlo.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Estructura de párrafo en ensayo académico:

'La implementación de tecnologías de inteligencia artificial en procesos educativos presenta desafíos éticos significativos que requieren marcos regulatorios específicos [oración tema]. Algoritmos de evaluación automatizada han mostrado sesgos sistemáticos contra estudiantes de minorías étnicas, con diferencias de hasta 15 puntos porcentuales en calificaciones similares (Chen et al., 2023) [evidencia]. Estos sesgos se amplifican cuando los sistemas de IA determinan acceso a programas académicos avanzados, perpetuando desigualdades educativas existentes [análisis]. La ausencia de transparencia algorítmica impide que estudiantes y educadores comprendan los criterios de evaluación, violando principios básicos de equidad educativa [consecuencias]. Por tanto, la adopción de IA educativa debe subordinarse al desarrollo de protocolos de auditoría algorítmica y marcos de transparencia [conclusión del párrafo].'</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Cada afirmación necesita evidencia específica y citable - nunca hagas generalizaciones sin datos</li>
          <li>Tu estructura es tu aliada: una idea central por párrafo, transiciones claras entre secciones</li>
          <li>Usa números y datos concretos en lugar de palabras vagas como 'mucho' o 'poco'</li>
          <li>Cita mientras escribes, no al final - evitarás pesadillas de referencias perdidas</li>
          <li>Lee tu texto en voz alta: si suena confuso hablado, necesitas simplificar la escritura</li>
          <li>Cada párrafo debe conectar claramente con tu argumento principal - elimina todo lo que no aporte</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Escribir párrafos que parecen listas de fuentes sin análisis propio</li>
          <li>Usar 'algunos autores dicen' en lugar de citas específicas con nombres y fechas</li>
          <li>Empezar párrafos sin conectar con la idea anterior</li>
          <li>Hacer conclusiones que no se derivan de la evidencia presentada</li>
          <li>Cambiar de tercera a primera persona inconsistentemente</li>
          <li>Incluir información irrelevante solo porque 'es interesante'</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Antes de escribir cualquier párrafo, pregúntate: '¿Qué punto específico estoy tratando de probar aquí?' Si no puedes responder en una oración clara, todavía no estás listo para escribir ese párrafo.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Toma el último párrafo que escribiste para tu TFG/tesis. ¿Tiene una oración tema clara? ¿Cada oración siguiente apoya esa idea? ¿Terminaste el párrafo conectando de vuelta a tu argumento principal? Si alguna respuesta es no, reescríbelo ahora mismo.</p>
      </div>
    </ChapterPage>
  );
}
