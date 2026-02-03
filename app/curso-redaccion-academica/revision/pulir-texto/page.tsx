'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function PulirtextoPage() {
  return (
    <ChapterPage chapterId="pulir-texto">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Te voy a enseñar algo que transformará completamente la calidad de tu TFG o tesis: cómo revisar como un verdadero profesional. La diferencia entre un trabajo que aprueba y uno que destaca no está en escribir más, sino en revisar mejor. Después de supervisar cientos de trabajos académicos, puedo asegurarte que los estudiantes que siguen un proceso sistemático de revisión obtienen calificaciones significativamente más altas. En las próximas líneas aprenderás las técnicas exactas que uso para transformar borradores ordinarios en textos académicos sólidos y convincentes.</p>
      </section>

      {/* Sección: Estrategias de Autorrevisión Sistemática */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Estrategias de Autorrevisión Sistemática</h2>
        </div>
          <p>Aquí está la técnica que cambió mi forma de revisar textos académicos: el método de las 'cinco lecturas'. Cada lectura tiene un propósito específico y nunca debes mezclarlos, porque tu cerebro no puede procesar todo al mismo tiempo.</p>
          <p>Primero, déjame contarte algo crucial: nunca revises el mismo día que escribes. Tu cerebro 'lee' lo que cree que escribió, no lo que realmente está en el papel. Espera mínimo 48 horas, idealmente una semana. Si tienes prisa, al menos duerme una noche antes de revisar.</p>
          <p>Ahora, las cinco lecturas:</p>
          <p><strong>Primera lectura - Vista de pájaro:</strong> Lee todo de corrido, sin detenerte. Pregúntate solo: '¿Este texto responde realmente a mi pregunta de investigación?' Si tu TFG pregunta sobre el impacto de las redes sociales en adolescentes, cada párrafo debe contribuir a responder eso. Marca con una X los párrafos que se desvían del tema.</p>
          <p><strong>Segunda lectura - Arquitectura argumentativa:</strong> Aquí examinas la columna vertebral de tu texto. Escribe en una hoja aparte la idea principal de cada párrafo en una oración. Si no puedes resumir un párrafo en una oración clara, ese párrafo tiene problemas. Si las ideas no fluyen lógicamente de una a otra, necesitas reordenar o agregar transiciones.</p>
          <p><strong>Tercera lectura - Evidencia y fuentes:</strong> Revisa cada afirmación que haces. Pregúntate: '¿Cómo sé que esto es verdad?' Si no tienes una cita que lo respalde, o es tu opinión personal sin fundamento académico, márcalo en rojo. En textos académicos, casi cada oración debe tener respaldo bibliográfico o ser una conclusión lógica derivada de evidencia previa.</p>
          <p><strong>Cuarta lectura - Claridad y precisión:</strong> Lee cada oración y pregúntate: '¿Un estudiante de primer año de mi carrera entendería esto?' Si usas jerga innecesaria o construcciones rebuscadas, simplifícalas. La academia valora la precisión, no la complejidad artificial.</p>
          <p><strong>Quinta lectura - Detalles técnicos:</strong> Solo aquí te ocupas de ortografía, puntuación y formato. Usa el corrector, pero no confíes ciegamente en él. Lee palabra por palabra, especialmente términos técnicos y nombres propios.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Te muestro un párrafo real de una tesis sobre educación digital, antes y después de aplicar estas cinco lecturas:

<strong>Antes:</strong> 'La implementación de tecnologías digitales en el ámbito educativo contemporáneo presenta múltiples desafíos y oportunidades que deben ser considerados desde una perspectiva holística e integral, tomando en cuenta diversos factores que influyen en el proceso de enseñanza-aprendizaje en la era digital actual.'

<strong>Después (tras las cinco lecturas):</strong> 'La integración de herramientas digitales en las aulas genera tres desafíos principales: la brecha tecnológica entre estudiantes (Pérez, 2022), la resistencia docente al cambio (García & López, 2021) y la falta de infraestructura adecuada (Ministerio de Educación, 2023). Sin embargo, los estudios demuestran que cuando estos obstáculos se superan, el rendimiento académico mejora hasta un 23% (Silva et al., 2022).'

Nota cómo el párrafo revisado: 1) Elimina palabrería innecesaria, 2) Presenta datos específicos, 3) Incluye citas concretas, 4) Es más fácil de leer pero igualmente académico.</p>
        </div>
      </section>

      {/* Sección: Checklist de Revisión Definitivo */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Checklist de Revisión Definitivo</h2>
        </div>
          <p>Después de años perfeccionando este proceso, he creado un checklist que uso con cada texto que reviso. No es solo una lista de verificación, es una hoja de ruta hacia la excelencia académica. Imprímelo y úsalo cada vez.</p>
          <p><strong>NIVEL 1: ESTRUCTURA GLOBAL (haz esto primero)</strong>
□ Mi introducción presenta claramente: problema → objetivos → hipótesis/pregunta → metodología → estructura del trabajo
□ Cada capítulo tiene un propósito específico que puedo explicar en una oración
□ Las conclusiones retoman directamente los objetivos planteados en la introducción
□ El título refleja exactamente el contenido del trabajo
□ Existe coherencia temporal: si escribo en presente sobre teorías actuales y en pasado sobre mi investigación</p>
          <p><strong>NIVEL 2: PÁRRAFOS Y ARGUMENTACIÓN (después del nivel 1)</strong>
□ Cada párrafo desarrolla UNA idea principal
□ La primera oración de cada párrafo indica el tema a tratar
□ Uso conectores apropiados entre oraciones: 'sin embargo', 'por tanto', 'además', 'en contraste'
□ No hay párrafos de una sola oración (excepto transiciones)
□ No hay párrafos de más de 8 oraciones (divídelos)
□ Cada afirmación tiene respaldo: cita, dato, ejemplo o razonamiento lógico</p>
          <p><strong>NIVEL 3: FUENTES Y CITACIÓN (crucial para la credibilidad)</strong>
□ Todas las citas en el texto aparecen en las referencias finales
□ Todas las referencias finales se citan en el texto
□ Uso citas directas solo cuando las palabras exactas del autor son irreemplazables
□ Las citas directas de más de 40 palabras están en párrafo independiente
□ Diferencio claramente entre mis ideas y las de otros autores
□ Uso fuentes actualizadas: mínimo 70% de los últimos 5 años
□ Incluyo fuentes primarias, no solo libros de texto</p>
          <p><strong>NIVEL 4: LENGUAJE ACADÉMICO (pulir hasta brillar)</strong>
□ Evito contracciones: 'no es' en lugar de 'no es'
□ Uso tercera persona: 'se observa' en lugar de 'observamos'
□ Elimino muletillas: 'muy', 'bastante', 'un poco'
□ Reemplazo verbos genéricos: 'realizar' → 'implementar', 'analizar', 'ejecutar'
□ Uso vocabulario preciso de mi disciplina
□ Evito repetir la misma palabra en párrafos consecutivos</p>
          <p><strong>NIVEL 5: FORMATO TÉCNICO (la presentación importa)</strong>
□ Márgenes, tipo de letra y espaciado según normas institucionales
□ Numeración correcta de páginas, capítulos y subcapítulos
□ Tablas y figuras numeradas y referenciadas en el texto
□ Títulos y subtítulos con formato consistente
□ Referencias en formato exacto según norma (APA, Vancouver, etc.)</p>
          <p>Cada nivel debe completarse antes de pasar al siguiente. No intentes hacerlo todo en una sola sesión.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Ejemplo de cómo aplicar el checklist a una introducción real:

<strong>ANTES DE CHECKLIST:</strong>
'Este trabajo habla sobre el estrés laboral. Es un problema muy importante hoy en día. Vamos a ver qué pasa con los empleados y como les afecta.'

<strong>DESPUÉS DE APLICAR CHECKLIST:</strong>
'El estrés laboral afecta al 68% de los trabajadores españoles, generando costes empresariales de 20.000 millones de euros anuales (INE, 2023). Esta investigación analiza la relación entre las demandas laborales excesivas y el síndrome de burnout en empleados del sector servicios. El objetivo principal es identificar factores predictores del estrés laboral para desarrollar estrategias preventivas específicas. Mediante un estudio cuantitativo con 340 participantes de cinco empresas madrileñas, se examinarán las variables: carga de trabajo, autonomía laboral y apoyo organizacional. El trabajo se estructura en cuatro capítulos: marco teórico, metodología, resultados y propuesta de intervención.'

Observa cómo el párrafo revisado cumple todos los puntos del checklist: presenta el problema con datos, define objetivos claros, explica la metodología y anticipa la estructura.</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Aplica el método de cinco lecturas separadas: nunca revises todo al mismo tiempo</li>
          <li>Espera mínimo 48 horas entre escribir y revisar para ganar objetividad</li>
          <li>Usa el checklist por niveles: completa uno antes de pasar al siguiente</li>
          <li>Lee tu texto en voz alta para detectar problemas de fluidez que el ojo no ve</li>
          <li>Cada párrafo debe poder resumirse en una oración clara</li>
          <li>Busca feedback de un compañero antes de la entrega final</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Revisar el mismo día que escribes: tu cerebro lee lo que 'cree' que escribió</li>
          <li>Empezar revisando ortografía en lugar de estructura: es como pintar una casa con cimientos rotos</li>
          <li>Confiar solo en el corrector automático: no detecta errores de coherencia ni precisión académica</li>
          <li>No contrastar cada párrafo con tu pregunta de investigación: causa desviaciones del tema</li>
          <li>Revisar todo al mismo tiempo: sobrecarga cognitiva que reduce la efectividad</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>El secreto de una revisión profesional está en la paciencia y la metodología. He visto estudiantes transformar trabajos mediocres en excelentes simplemente aplicando este proceso sistemático. La clave no es revisar más veces, sino revisar de forma más inteligente. Recuerda: un texto bien revisado hace invisible el esfuerzo de escritura, permitiendo que el lector se concentre completamente en tus ideas.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Toma el capítulo más importante de tu TFG o tesis (probablemente la introducción o el primer capítulo teórico) y aplica ahora mismo el método de cinco lecturas. Dedica 30 minutos a cada lectura, con descansos de 15 minutos entre cada una. Después usa el checklist nivel por nivel. Te garantizo que verás mejoras inmediatas y significativas en la calidad de tu texto.</p>
      </div>
    </ChapterPage>
  );
}
