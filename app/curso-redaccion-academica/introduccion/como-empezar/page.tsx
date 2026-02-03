'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function ComoempezarPage() {
  return (
    <ChapterPage chapterId="como-empezar">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Tu introducción académica es el momento decisivo donde tu lector decide si tu investigación vale la pena. No es solo el primer párrafo: es tu oportunidad de demostrar que dominas tu tema y que tu trabajo aporta algo valioso. En los próximos minutos, aprenderás las técnicas específicas que usan los investigadores experimentados para crear introducciones que realmente enganchen y convenzan. Vas a transformar esos párrafos iniciales vagos en una presentación sólida de tu trabajo.</p>
      </section>

      {/* Sección: Anatomía de una Introducción Académica Efectiva */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Anatomía de una Introducción Académica Efectiva</h2>
        </div>
          <p>Tu introducción debe funcionar como un embudo inteligente: empiezas con el panorama amplio y gradualmente enfocas hacia tu contribución específica. Piénsalo como una conversación donde primero estableces el contexto ('Sabes que existe este problema importante...') y luego justificas tu trabajo ('Pues bien, yo voy a resolverlo de esta manera específica').</p>
          <p>Empiezas con 2-3 oraciones que ubican tu tema en el mundo real. No hagas una revisión histórica completa; simplemente establece por qué tu área de estudio importa ahora. Por ejemplo, si estudias procrastinación académica, no necesitas explicar toda la historia de la psicología educativa.</p>
          <p>Luego identificas el vacío específico. Aquí usas frases como 'Sin embargo, pocos estudios han examinado...' o 'A pesar de estos avances, permanece unclear...'. Esta es tu oportunidad de oro: demostrar que encontraste un hueco real en el conocimiento.</p>
          <p>Después presentas tu pregunta de investigación de forma directa. No la escondas en párrafos largos. Una oración clara que diga exactamente qué vas a investigar. Algunos profesores prefieren que sea una pregunta literal ('¿Cómo afecta la música de fondo al rendimiento en tareas de memoria?'), otros prefieren una declaración ('Este estudio examina el efecto de...').</p>
          <p>Finalmente, adelantas tu contribución principal. En una o dos oraciones, explica qué van a encontrar en tu trabajo y por qué eso importa. No reveles todos tus resultados, pero sí indica el tipo de respuesta que vas a ofrecer.</p>
          <p>La extensión ideal para una introducción de TFG es 1-2 páginas. Para una tesis doctoral, puede llegar a 3-4 páginas. Si tu introducción ocupa más del 10% de tu trabajo total, probablemente está demasiado larga.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Ejemplo real de introducción efectiva:

'Los microplásticos representan una amenaza emergente para los ecosistemas marinos, con concentraciones que han aumentado exponencialmente en las últimas dos décadas (Thompson et al., 2020). Estudios recientes documentan su presencia en más de 180 especies marinas, alterando procesos fisiológicos fundamentales (García-López, 2021). Sin embargo, los mecanismos específicos de bioacumulación en peces pelágicos del Mediterráneo permanecen insuficientemente caracterizados, particularmente en especies de importancia comercial. Este estudio analiza los patrones de acumulación de microplásticos en tres especies representativas del litoral catalán, cuantificando su distribución tisular y evaluando los biomarcadores de estrés oxidativo asociados.'</p>
        </div>
      </section>

      {/* Sección: Estructurando Objetivos que Realmente Funcionen */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Estructurando Objetivos que Realmente Funcionen</h2>
        </div>
          <p>Tus objetivos son la promesa que haces al lector sobre qué va a encontrar en tu trabajo. Si están mal redactados, toda tu investigación parecerá confusa, incluso si es brillante. La clave está en usar verbos que indiquen acciones específicas y medibles.</p>
          <p>Evita verbos como 'conocer', 'estudiar', 'investigar' o 'comprender'. Son demasiado vagos. En su lugar, usa verbos que indiquen exactamente qué vas a hacer: 'cuantificar', 'comparar', 'identificar', 'evaluar', 'analizar', 'determinar', 'caracterizar', 'establecer'.</p>
          <p>Tu objetivo general debe ser ambicioso pero realizable en el tiempo y con los recursos que tienes. Una buena prueba: ¿puedes explicar en una oración cómo vas a medir si lo lograste? Si no puedes, necesitas ser más específico.</p>
          <p>Los objetivos específicos son los pasos metodológicos para alcanzar el general. Cada uno debe corresponder con una sección principal de tu trabajo. Si tienes tres objetivos específicos, probablemente tendrás tres capítulos de resultados. Esta coherencia estructura-objetivos es lo que buscan los evaluadores.</p>
          <p>Un truco profesional: redacta primero los objetivos específicos y después construye el general que los englobe. Esto garantiza coherencia interna.</p>
          <p>Revisa que tus objetivos sigan una secuencia lógica. Por ejemplo: primero 'identificar', después 'analizar', finalmente 'evaluar'. El orden debe reflejar tu proceso de investigación real.</p>
          <p>Para objetivos cuantitativos, incluye el nivel de precisión: '...con un margen de error del 5%' o '...en una muestra de 200 participantes'. Para objetivos cualitativos, especifica el tipo de análisis: '...mediante análisis temático' o '...utilizando teoría fundamentada'.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Ejemplo real de objetivos bien estructurados (TFG en Psicología):

Objetivo General: Evaluar la efectividad de un programa de mindfulness en la reducción de ansiedad académica en estudiantes universitarios de primer año.

Objetivos Específicos:
1. Medir los niveles de ansiedad académica previa y posterior a la intervención mediante la escala AMAS en una muestra de 80 estudiantes
2. Comparar los resultados del grupo experimental con un grupo control que recibió técnicas de relajación tradicionales
3. Identificar los componentes específicos del programa que los participantes perciben como más efectivos mediante entrevistas semiestructuradas
4. Determinar la persistencia de los efectos del programa mediante seguimiento a los 3 meses post-intervención</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Construye tu introducción como un embudo: panorama amplio → vacío específico → tu contribución</li>
          <li>Usa verbos de acción precisos: 'cuantificar', 'comparar', 'evaluar' en lugar de 'conocer' o 'estudiar'</li>
          <li>Cada objetivo específico debe corresponder con una sección de resultados</li>
          <li>Tu pregunta de investigación debe ser visible, no escondida en párrafos largos</li>
          <li>La introducción no debe ocupar más del 10% de tu trabajo total</li>
          <li>Adelanta tu contribución sin revelar todos los resultados</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Hacer revisión histórica exhaustiva en lugar de contextualizar el problema actual</li>
          <li>Objetivos que no se pueden medir ('comprender mejor...', 'profundizar en...')</li>
          <li>Desconexión entre número de objetivos específicos y estructura de resultados</li>
          <li>Esconder la pregunta de investigación en párrafos densos</li>
          <li>Justificación genérica ('es importante porque afecta a muchas personas')</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Escribe tu introducción dos veces: una versión preliminar antes de empezar y otra definitiva al final. La primera te ayuda a mantener el rumbo; la segunda, con el conocimiento completo de lo que encontraste, será mucho más precisa y convincente.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Toma tu introducción actual y aplica la 'prueba del embudo': ¿empiezas amplio y te enfocas gradualmente? ¿Tu pregunta de investigación es visible en el primer párrafo o está escondida? Reescribe solo el párrafo donde presentas tu pregunta de investigación, haciéndola más directa y específica.</p>
      </div>
    </ChapterPage>
  );
}
