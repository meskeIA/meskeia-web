'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function TonoacademicoPage() {
  return (
    <ChapterPage chapterId="tono-academico">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La redacción académica es tu herramienta más poderosa para comunicar conocimiento con credibilidad. No se trata de impresionar con palabras complejas, sino de construir argumentos sólidos que convenzan a tu lector desde la primera línea. En este módulo, te guiaré paso a paso para transformar tu escritura en un texto que refleje el rigor de tu investigación. Cada técnica que aprenderás aquí puedes aplicarla inmediatamente a tu TFG o tesis.</p>
      </section>

      {/* Sección: Características del Registro Académico Formal */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Características del Registro Académico Formal</h2>
        </div>
          <p>El registro académico se construye como una conversación intelectual entre expertos, donde cada palabra cuenta y cada frase debe aportar valor. Tu objetivo no es escribir de manera pomposa, sino comunicar ideas complejas con la precisión de un cirujano y la claridad de un buen profesor.</p>
          <p>Empecemos con el vocabulario. Cada disciplina tiene su lenguaje técnico, pero esto no significa usar jerga innecesaria. En lugar de escribir 'las cosas que pasan en la economía', escribe 'los fenómenos económicos observados'. En vez de 'el problema es muy importante', utiliza 'esta problemática presenta implicaciones significativas para...' La diferencia está en la especificidad: cada término debe ser el más preciso posible para lo que quieres expresar.</p>
          <p>La estructura sintáctica académica requiere equilibrio. Las oraciones deben ser lo suficientemente complejas para expresar ideas sofisticadas, pero no tanto que pierdan claridad. Observa esta progresión:</p>
          <p>Versión básica: 'Los estudiantes no rinden bien. Hay muchos factores. Algunos son sociales.'
Versión académica: 'El rendimiento académico estudiantil se ve influenciado por múltiples variables, entre las cuales los factores socioeconómicos presentan una correlación estadísticamente significativa.'</p>
          <p>Pero cuidado con la versión sobrecargada: 'La performance académica de los educandos experimenta fluctuaciones debido a la multicausalidad de variables intervinientes de naturaleza socioeconómica que establecen correlaciones de significatividad estadística.' Esta última versión es académicamente pomposa, no rigurosa.</p>
          <p>Un truco práctico: lee tu texto en voz alta. Si te quedas sin aliento en una oración, probablemente sea demasiado larga. Si suena como si estuvieras hablando con un amigo en el café, necesitas mayor formalidad. El punto dulce está en el medio: suenas como un experto explicando su campo a otro experto.</p>
          <p>Para el tono neutro, elimina marcadores emocionales innecesarios. En lugar de 'es increíble que...', usa 'resulta notable que...'. En vez de 'obviamente', emplea 'como se puede observar'. Tu pasión por el tema debe transmitirse a través de la solidez de tus argumentos, no de adjetivos emotivos.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Compara estos dos enfoques del mismo tema:

Versión informal: 'Hoy en día todo el mundo usa redes sociales y eso está cambiando cómo nos comunicamos de una manera brutal.'

Versión académica: 'El uso generalizado de las plataformas de redes sociales ha generado transformaciones sustanciales en los patrones de comunicación interpersonal, modificando tanto los códigos lingüísticos como las dinámicas de interacción social (Smith, 2023).'</p>
        </div>
      </section>

      {/* Sección: Objetividad e Impersonalidad */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Objetividad e Impersonalidad</h2>
        </div>
          <p>La impersonalidad académica no significa borrar tu voz, sino canalizar tu autoridad intelectual a través de la evidencia y el análisis riguroso. Tu lector debe confiar en tus conclusiones porque están sólidamente fundamentadas, no porque tú se lo pidas.</p>
          <p>La estrategia más efectiva es el 'se' impersonal, que funciona como un zoom que enfoca la acción o el proceso, no el actor. Observa estas transformaciones:</p>
          <p>'Yo analicé los datos durante tres meses' → 'Se analizaron los datos durante un período de tres meses'
'Creo que estos resultados son importantes' → 'Estos resultados sugieren implicaciones significativas para...'
'En mi opinión, la teoría de X es incorrecta' → 'Los hallazgos obtenidos cuestionan los postulados de la teoría de X'</p>
          <p>La voz pasiva es tu aliada cuando quieres enfatizar el proceso o el resultado por encima del investigador. 'Realicé entrevistas a 30 participantes' se convierte en 'Se realizaron entrevistas semiestructuradas a 30 participantes'. La diferencia es sutil pero poderosa: el foco está en la metodología, no en ti.</p>
          <p>Sin embargo, no abuses de la voz pasiva porque puede volver tu texto lento y confuso. Alterna entre construcciones impersonales y voz activa con sujetos académicos: 'Los datos revelan...', 'La evidencia sugiere...', 'Los resultados indican...'.</p>
          <p>Cuando presentes tu propia contribución intelectual, puedes usar la primera persona del plural ('nosotros') o construcciones como 'el presente estudio', 'esta investigación'. Por ejemplo: 'En este trabajo se propone un modelo alternativo...' o 'Los resultados de esta investigación permiten concluir...'</p>
          <p>Un consejo práctico: cada vez que escribas 'yo pienso', 'creo', 'me parece', detente y pregúntate: ¿qué evidencia tengo para esta afirmación? Luego reformula: 'Los datos sugieren...', 'La evidencia indica...', 'Los resultados permiten inferir...'. Tu credibilidad no viene de tu opinión, sino de tu capacidad para interpretar evidencia.</p>
          <p>Para verificar tu nivel de objetividad, aplica la prueba del escéptico: ¿podría un lector inteligente pero crítico cuestionar esta afirmación? Si la respuesta es sí por falta de evidencia, refuerza tu argumento. Si es no porque está bien fundamentada, has logrado la objetividad académica.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Observa cómo un mismo hallazgo se presenta con diferente nivel de objetividad:

Subjetivo: 'Después de revisar las entrevistas, me di cuenta de que los participantes estaban claramente frustrados con el sistema.'

Objetivo: 'El análisis de las transcripciones reveló un patrón recurrente de expresiones asociadas con frustración hacia el sistema institucional, evidenciado en el 78% de los participantes entrevistados.'</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Sustituye verbos genéricos (hacer, tener, ser) por verbos específicos de tu disciplina</li>
          <li>Cada oración debe aportar información nueva y verificable</li>
          <li>Usa conectores lógicos (sin embargo, por tanto, en consecuencia) para construir argumentos sólidos</li>
          <li>Reemplaza 'yo pienso/creo' por 'los datos sugieren/la evidencia indica'</li>
          <li>Lee cada párrafo y pregúntate: ¿qué evidencia concreta estoy aportando aquí?</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Escribir 'como ya mencioné anteriormente' en lugar de referencias específicas</li>
          <li>Usar 'obviamente' o 'claramente' cuando algo requiere demostración</li>
          <li>Mezclar registro coloquial ('un montón de', 'súper importante') con académico</li>
          <li>Construir párrafos sin oración temática clara</li>
          <li>Presentar opiniones personales como si fueran conclusiones científicas</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Imagínate explicando tu investigación a un colega experto pero escéptico. Cada afirmación debe estar respaldada, cada conclusión debe seguirse lógicamente de la evidencia. Tu texto debe convencer por su rigor, no por su retórica.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Toma el párrafo de introducción de tu trabajo actual. Subraya cada verbo genérico y sustitúyelo por uno específico. Identifica cada opinión personal y reformúlala como análisis basado en evidencia. Finalmente, lee el párrafo en voz alta: debe sonar como la explicación clara de un experto, no como una charla informal ni como un texto artificialmente complicado.</p>
      </div>
    </ChapterPage>
  );
}
