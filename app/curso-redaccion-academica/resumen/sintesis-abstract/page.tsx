'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function SintesisabstractPage() {
  return (
    <ChapterPage chapterId="sintesis-abstract">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El abstract de tu TFG o tesis es la puerta de entrada a tu investigación. En 200 palabras o menos, debes convencer a tu tribunal, supervisor y futuros lectores de que tu trabajo vale la pena. No es solo un resumen: es tu oportunidad de vender tu investigación. Piensa en las últimas veces que buscaste artículos académicos, ¿leíste completos aquellos cuyo abstract no te convenció en los primeros 30 segundos? Exactamente. Por eso dominar esta técnica no es opcional, es fundamental para que tu esfuerzo de meses se traduzca en impacto real.</p>
      </section>

      {/* Sección: Qué es un abstract y su función estratégica */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Qué es un abstract y su función estratégica</h2>
        </div>
          <p>Tu abstract es como el elevator pitch de tu investigación: tienes 30 segundos (150-250 palabras) para enganchar a alguien que tiene cientos de trabajos por revisar. No cometas el error de verlo como 'el párrafo que va al principio'. Es una herramienta de marketing académico.</p>
          <p>Cuando escribas tu abstract, pregúntate: '¿Por qué alguien debería invertir 2 horas leyendo mi TFG completo?' La respuesta debe estar clara en esas primeras líneas. Un evaluador experimentado puede predecir la calidad de una tesis leyendo solo su abstract, así de importante es.</p>
          <p>Los elementos que NUNCA pueden faltar son: el problema específico que abordas (no 'la educación en España' sino 'el impacto del uso de tablets en la comprensión lectora de estudiantes de 4º de primaria'), tu metodología concreta ('entrevistas a 25 docentes' no 'metodología cualitativa'), tus resultados más llamativos con números específicos, y qué significa esto para tu campo de estudio.</p>
          <p>Aquí está el secreto: tu abstract debe funcionar como un documento independiente. Alguien que solo lea esto debe entender qué hiciste, cómo lo hiciste, qué encontraste y por qué importa. Si necesita leer otra sección para entender tu abstract, has fallado.</p>
          <p>La función estratégica real del abstract es ser tu embajador cuando tú no estás presente. Bases de datos académicas lo indexarán, investigadores lo usarán para decidir si citar tu trabajo, y empleadores futuros lo leerán para evaluar tu capacidad investigativa.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo de abstract efectivo (TFG en Psicología):</strong></p>
          <p><em>&quot;Este estudio examina la relación entre el uso de redes sociales y los niveles de ansiedad en estudiantes universitarios españoles de 18-22 años. Mediante una encuesta validada aplicada a 312 estudiantes de cuatro universidades madrileñas durante octubre-noviembre 2023, se midió el tiempo diario en redes sociales, tipos de uso y niveles de ansiedad mediante la escala GAD-7. Los resultados revelan una correlación positiva significativa (r=0.67, p&lt;0.001) entre el uso pasivo de redes sociales (scroll sin interacción) y ansiedad, mientras que el uso activo (comentarios, publicaciones) no mostró correlación significativa. Estos hallazgos sugieren que no es el tiempo total en redes sociales, sino el tipo de uso, lo que influye en el bienestar psicológico, con implicaciones importantes para programas de salud mental universitaria.&quot;</em></p>
          <p>Nota cómo cada frase aporta datos concretos: población específica, fechas, números, herramientas de medición, y resultados cuantificados.</p>
        </div>
      </section>

      {/* Sección: Estructura y composición del resumen académico */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Estructura y composición del resumen académico</h2>
        </div>
          <p>Te voy a dar la fórmula exacta que funciona. Son cuatro párrafos cortos (2-3 oraciones cada uno) que siguen este patrón:</p>
          <p>Párrafo 1 - Contexto + Problema: '¿Qué falta saber y por qué es importante?' No escribas 'La educación es importante'. Escribe: 'Aunque el 78% de los colegios españoles han implementado tecnología digital, se desconoce su impacto específico en...' Ves la diferencia? Datos concretos, problema específico.</p>
          <p>Párrafo 2 - Objetivo + Metodología: Usa verbos decisivos: 'Este estudio analiza/examina/evalúa...' Luego especifica HOW: 'mediante análisis estadístico de datos de 200 empresas', 'a través de entrevistas semiestructuradas con 15 expertos', 'utilizando un diseño cuasiexperimental con grupo control'. Nada de 'se realizó una investigación cualitativa' - eso no dice nada.</p>
          <p>Párrafo 3 - Resultados: Aquí es donde diferencias un TFG mediocre de uno excelente. Incluye números específicos, porcentajes, correlaciones. &apos;Los resultados mostraron diferencias significativas&apos; vs &apos;El grupo experimental mejoró un 23% en comprensión lectora (p&lt;0.05) comparado con el control&apos;. La segunda opción demuestra rigor.</p>
          <p>Párrafo 4 - Conclusiones e Implicaciones: No repitas los resultados. Explica qué SIGNIFICA esto para tu campo. '¿Qué debería cambiar después de tu investigación?' 'Estos hallazgos sugieren la necesidad de revisar las políticas actuales de...' o 'Los resultados proporcionan evidencia para implementar...'</p>
          <p>Reglas de oro para cada párrafo: máximo 50 palabras por párrafo, verbos en pasado ('se analizó', 'se encontró'), cero adjetivos subjetivos ('interesante', 'relevante' - deja que los datos hablen), y cada oración debe poder defenderse ante un tribunal exigente.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>Ejemplo de estructura párrafo por párrafo (TFG en Marketing):

Párrafo 1: 'Las pequeñas empresas españolas destinan solo el 3.2% de su presupuesto a marketing digital, muy por debajo de la media europea (7.8%), limitando su competitividad en mercados globalizados.'

Párrafo 2: 'Esta investigación analiza las barreras que enfrentan las PYMES españolas para adoptar estrategias de marketing digital, mediante entrevistas en profundidad con 28 gerentes de empresas de 10-50 empleados en Andalucía durante marzo-mayo 2024.'

Párrafo 3: 'Se identificaron cuatro barreras principales: limitaciones presupuestarias (89% de encuestados), falta de conocimiento técnico (71%), resistencia al cambio (54%) y desconfianza en ROI digital (43%).'

Párrafo 4: 'Los resultados evidencian la necesidad de programas gubernamentales de capacitación digital específicos para PYMES, que aborden tanto aspectos técnicos como de mentalidad empresarial para mejorar la competitividad del tejido empresarial español.'</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Escribe tu abstract DESPUÉS de terminar todo tu TFG - necesitas conocer tus resultados reales para resumirlos efectivamente</li>
          <li>Incluye números específicos en cada párrafo: muestras, porcentajes, fechas, correlaciones - los datos concretos dan credibilidad</li>
          <li>Usa el 'test del extraño': alguien de otro campo debe entender de qué va tu investigación solo leyendo el abstract</li>
          <li>Cada oración debe aportar información nueva - si puedes eliminar una frase sin perder contenido, elimínala</li>
          <li>Termina siempre con implicaciones prácticas: ¿qué debería cambiar después de tu investigación?</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Empezar con generalidades ('La educación es fundamental...') - ve directo al problema específico que abordas</li>
          <li>Usar metodología vaga ('se realizó una investigación') - especifica técnicas, muestras y procedimientos exactos</li>
          <li>Presentar resultados sin números ('se encontraron diferencias') - siempre cuantifica tus hallazgos</li>
          <li>Escribir conclusiones obvias ('se necesita más investigación') - propón acciones concretas basadas en tus resultados</li>
          <li>Exceder 250 palabras - los evaluadores no leerán más, así de simple</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Aquí tienes mi truco de 20 años evaluando TFGs: después de escribir tu abstract, dáselo a leer a tu abuela, tu vecino o alguien totalmente ajeno a tu tema. Si pueden explicarte en sus palabras de qué va tu investigación, has triunfado. Si ponen cara de confusión, reescribe. Un abstract que solo entienden los expertos en tu tema muy específico es un abstract que fallará en su propósito de comunicar.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>EJERCICIO INMEDIATO: Toma tu TFG actual y escribe cuatro oraciones siguiendo esta fórmula exacta: 1) 'Aunque [dato conocido], se desconoce [tu problema específico]' 2) 'Este estudio [verbo de acción] mediante [metodología específica + números]' 3) 'Los resultados revelan [hallazgo 1 con números] y [hallazgo 2 con números]' 4) 'Estos hallazgos sugieren [implicación práctica específica]'. Tienes tu primer borrador de abstract en 10 minutos.</p>
      </div>
    </ChapterPage>
  );
}
