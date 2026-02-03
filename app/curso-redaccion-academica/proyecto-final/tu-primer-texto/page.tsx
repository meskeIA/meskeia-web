'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function TuprimertextoPage() {
  return (
    <ChapterPage chapterId="tu-primer-texto">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Llegamos al momento crucial de tu trabajo académico: la etapa final de preparación y revisión. Lo que harás en los próximos minutos puede marcar la diferencia entre un trabajo correcto y uno verdaderamente excelente. No se trata solo de cumplir requisitos, sino de presentar un documento que refleje tu rigor académico y profesionalismo.</p>
      </section>

      {/* Sección: Checklist definitivo antes de entregar tu trabajo */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Checklist definitivo antes de entregar tu trabajo</h2>
        </div>
          <p>La revisión final no es un mero trámite, es tu última oportunidad para elevar la calidad de tu trabajo. Te voy a guiar a través de un sistema de revisión en cuatro etapas que he perfeccionado después de supervisar cientos de trabajos académicos.</p>
          <p><strong>Primera etapa: Coherencia argumentativa</strong>
Imprime tu trabajo y lee cada párrafo en voz alta. Si te quedas sin aire antes de terminar una oración, está demasiado larga. Si un párrafo ocupa más de media página, divídelo. Ahora, toma un marcador y subraya la idea principal de cada párrafo. Si no puedes identificarla en los primeros 15 segundos, ese párrafo necesita reescritura.</p>
          <p>Verifica las transiciones entre párrafos usando esta técnica: lee la última oración del párrafo A y la primera del párrafo B. ¿Existe una conexión lógica? Si no, añade conectores como 'Por consiguiente', 'Sin embargo', 'De manera similar' o reescribe una de las oraciones.</p>
          <p><strong>Segunda etapa: Verificación de fuentes</strong>
Abre tu documento en una pantalla y tu lista de referencias en otra. Ve párrafo por párrafo verificando que cada afirmación que no sea de conocimiento común tenga su cita correspondiente. Usa la función 'Buscar' de tu procesador de texto para localizar cada autor de tu bibliografía en el cuerpo del texto. Si un autor aparece en la bibliografía pero no en el texto, elimínalo. Si aparece en el texto pero no en la bibliografía, añádelo inmediatamente.</p>
          <p><strong>Tercera etapa: Estructura y flujo</strong>
Crea un 'mapa' de tu trabajo escribiendo en una hoja separada el tema de cada párrafo en una sola línea. Este ejercicio te revelará si tu argumentación progresa lógicamente o si hay saltos conceptuales. Un trabajo bien estructurado debería leerse como una escalera: cada escalón (párrafo) te lleva naturalmente al siguiente.</p>
          <p><strong>Cuarta etapa: Precisión lingüística</strong>
Elimina muletillas académicas innecesarias. Busca y reemplaza frases vagas como 'es importante mencionar que', 'cabe destacar que', 'resulta interesante que' por afirmaciones directas. Convierte la voz pasiva en activa siempre que sea posible: en lugar de 'fueron analizados los datos', escribe 'analizamos los datos'.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p><strong>Ejemplo de párrafo ANTES de la revisión:</strong>

"Es importante mencionar que la tecnología digital ha transformado de manera significativa los procesos educativos en las instituciones de educación superior, lo que ha generado nuevos desafíos y oportunidades que deben ser considerados por los administradores educativos y docentes."

<strong>El MISMO párrafo DESPUÉS de aplicar nuestras técnicas:</strong>

"La transformación digital ha redefinido la educación superior en tres dimensiones fundamentales: la personalización del aprendizaje, la democratización del acceso al conocimiento y la necesidad de competencias digitales docentes (García-Ruiz, 2023). Esta investigación analiza cómo 15 universidades latinoamericanas han gestionado esta transición durante 2020-2023."</p>
        </div>
      </section>

      {/* Sección: Formato y presentación impecable */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Formato y presentación impecable</h2>
        </div>
          <p>La presentación de tu trabajo es tu carta de presentación profesional. Un documento mal formateado distrae al lector de tu contenido y puede costarte puntos valiosos. Aquí te explico cómo conseguir una presentación impecable paso a paso.</p>
          <p><strong>Configuración básica que nunca falla</strong>
Abre tu procesador de texto y configura estos parámetros ANTES de hacer cualquier ajuste manual: márgenes de 2.5 cm en todos los lados, fuente Times New Roman 12pt para texto normal, interlineado 1.5, alineación justificada. Esta configuración es universalmente aceptada y facilita la lectura.</p>
          <p><strong>Jerarquía visual clara</strong>
Tus títulos deben crear una jerarquía visual evidente. Usa el sistema de estilos de tu procesador (no formato manual): Título 1 en negrita, 14pt, centrado o alineado a la izquierda según tu institución; Título 2 en negrita, 12pt, alineado a la izquierda; Título 3 en negrita cursiva, 12pt. Nunca uses más de tres niveles de títulos en un trabajo de grado.</p>
          <p><strong>Paginación y numeración profesional</strong>
La portada nunca se numera, pero sí cuenta. La página de contenidos, agradecimientos y resumen van con números romanos (i, ii, iii). El cuerpo del trabajo comienza con el número 1 arábigo. Coloca los números en la esquina superior derecha, fuente 10pt. Si tu trabajo supera las 100 páginas, incluye también el número de capítulo en el encabezado.</p>
          <p><strong>Tablas y figuras que suman puntos</strong>
Cada tabla debe tener un número consecutivo y un título ANTES de la tabla: 'Tabla 1. Distribución de la muestra por género y edad'. Cada figura debe tener número y título DESPUÉS de la imagen: 'Figura 3. Evolución de matrículas 2019-2023'. Usa el mismo formato para todos: negrita para el número, normal para el título, tamaño 11pt.</p>
          <p><strong>Control de calidad final</strong>
Antes de enviar, exporta tu documento a PDF y ábrelo en otro dispositivo (tablet, otro ordenador). Los errores de formato son más visibles en un entorno diferente. Revisa especialmente las páginas donde termina un capítulo: evita que queden líneas huérfanas (una línea sola al final de la página) o viudas (una línea sola al inicio de la página).</p>
          <p><strong>Detalles que marcan la diferencia</strong>
Las citas largas (más de 40 palabras) van en párrafo aparte, con sangría de 1.25 cm a ambos lados, sin comillas, interlineado sencillo. Los números del 1 al 10 se escriben en letras, del 11 en adelante en cifras, excepto si inician una oración. Las referencias bibliográficas van con sangría francesa (primera línea sin sangría, siguientes con 1.25 cm).</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo de formato correcto para una tabla académica:</strong></p>
          <p><em>Tabla 2. Comparación de metodologías didácticas en educación superior</em></p>
          <ul>
            <li>Clase magistral: 124 participantes, 68.2% satisfacción, 7.3 ± 1.2 rendimiento</li>
            <li>Aprendizaje activo: 118 participantes, 84.7% satisfacción, 8.1 ± 0.9 rendimiento (p &lt; 0.001)</li>
            <li>Método híbrido: 97 participantes, 79.4% satisfacción, 7.8 ± 1.1 rendimiento (p &lt; 0.05)</li>
          </ul>
          <p><em>Nota:</em> Los datos de rendimiento se presentan como media ± desviación estándar en escala de 0-10.</p>
          <p><strong>Ejemplo de cita larga correctamente formateada:</strong></p>
          <p><em>&quot;La transformación de la educación superior trasciende lo meramente tecnológico para convertirse en un cambio paradigmático que afecta la esencia misma del proceso educativo.&quot;</em> (Castells, 2019, p. 247)</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Lee cada párrafo en voz alta para detectar problemas de fluidez y longitud</li>
          <li>Crea un 'mapa' de tu trabajo escribiendo el tema de cada párrafo en una línea</li>
          <li>Usa la función 'Buscar' para verificar que cada autor citado aparezca en la bibliografía</li>
          <li>Configura los estilos de título en tu procesador antes de formatear manualmente</li>
          <li>Exporta a PDF y revisa en otro dispositivo para detectar errores de formato</li>
          <li>Elimina muletillas académicas y convierte voz pasiva en activa</li>
          <li>Numera y titula consistentemente todas las tablas y figuras</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Párrafos que ocupan más de media página sin división lógica</li>
          <li>Ausencia de conectores entre párrafos (por tanto, sin embargo, además)</li>
          <li>Citas en el texto sin su correspondiente referencia bibliográfica</li>
          <li>Uso de formato manual en lugar de estilos predefinidos</li>
          <li>Tablas y figuras sin numeración consecutiva o títulos descriptivos</li>
          <li>Mezcla de criterios de numeración (a veces en letras, a veces en cifras)</li>
          <li>Referencias bibliográficas sin sangría francesa</li>
          <li>Líneas huérfanas o viudas al final/inicio de página</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>Imprime las primeras cinco páginas de tu trabajo y dáselas a un familiar para que las lea. Si te dice 'no entiendo de qué trata', tu introducción necesita reescritura. Un trabajo académico debe ser comprensible para un lector inteligente aunque no sea especialista en tu tema.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Programa dos sesiones de revisión separadas por al menos 24 horas. En la primera, enfócate en contenido y estructura. En la segunda, en formato y detalles. Tu cerebro necesita ese descanso para detectar errores que antes pasó por alto. Usa la técnica del 'párrafo por párrafo': nunca revises más de 10 párrafos seguidos sin hacer una pausa.</p>
      </div>
    </ChapterPage>
  );
}
