'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function CitarCorrectamentePage() {
  return (
    <ChapterPage chapterId="citar-correctamente">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Citar correctamente no es solo una formalidad académica: es la diferencia entre un trabajo respetable y uno que puede ser descalificado por plagio. Como investigador o estudiante, tu credibilidad depende de cómo manejes las fuentes de información. En este capítulo aprenderás no solo las reglas técnicas del citado, sino cuándo y por qué aplicar cada tipo de cita, cómo construir referencias que realmente aporten valor a tu texto, y cómo usar herramientas que simplifiquen este proceso. Dominar estas habilidades te ahorrará horas de trabajo y te dará la confianza de que tu texto cumple con los estándares académicos más exigentes.</p>
      </section>

      {/* Sección: Por qué citar: ética académica y prevención del plagio */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Por qué citar: ética académica y prevención del plagio</h2>
        </div>
          <p>Citar correctamente va más allá de seguir normas: es un acto de integridad intelectual que protege tu reputación académica y demuestra tu rigor investigativo. El plagio, incluso involuntario, puede tener consecuencias devastadoras: desde la anulación de tu trabajo hasta la expulsión académica o daños irreparables a tu carrera profesional.</p>
          <p>La primera regla práctica es simple pero absoluta: toda idea, dato, concepto o frase que no sea de tu autoría original debe llevar cita. Esto incluye no solo las citas textuales obvias, sino también las paráfrasis, los datos estadísticos, las teorías establecidas, y hasta las ideas ampliamente conocidas si no son de conocimiento general básico.</p>
          <p>Para aplicar esta regla en tu trabajo diario, hazte esta pregunta cada vez que escribas una oración: "¿Podría otra persona haber llegado a esta misma conclusión o formulación sin consultar fuentes externas?". Si la respuesta es no, necesitas una cita. Por ejemplo, si escribes "El 73% de los estudiantes universitarios experimenta estrés académico", esa estadística específica requiere obligatoriamente una fuente, aunque parezca lógica o creíble.</p>
          <p>Un error frecuente es pensar que cambiar algunas palabras de un texto original evita el plagio. Esto es falso y peligroso. Incluso cuando parafrasees completamente un párrafo con tus propias palabras, si la idea central proviene de otra fuente, debes citarla. La paráfrasis sin cita sigue siendo plagio intelectual.</p>
          <p>Establece desde el primer día de investigación un sistema personal de rastreo de fuentes. Cada vez que leas algo relevante, anota inmediatamente la fuente completa y la página específica, aunque no planees citarlo todavía. Esta práctica preventiva te evitará el pánico de buscar una fuente que recuerdas vagamente pero no puedes localizar cuando estés terminando tu trabajo.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>INCORRECTO: Los estudiantes universitarios sufren mucho estrés durante los exámenes finales, lo que afecta su rendimiento académico.

CORRECTO: Según Martínez y López (2023), el 78% de los estudiantes universitarios reporta niveles elevados de estrés durante los períodos de exámenes, lo que correlaciona negativamente con su rendimiento académico (p. 45).</p>
        </div>
      </section>

      {/* Sección: Cita textual vs paráfrasis: estrategias para decidir cuándo usar cada una */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Cita textual vs paráfrasis: estrategias para decidir cuándo usar cada una</h2>
        </div>
          <p>La decisión entre cita textual y paráfrasis no es arbitraria: cada una cumple funciones específicas y tu elección debe ser estratégica. Una cita textual es necesaria cuando las palabras exactas del autor son importantes: definiciones precisas, declaraciones controversiales, frases especialmente elocuentes, o cuando el autor es una autoridad reconocida y sus palabras exactas añaden peso a tu argumento.</p>
          <p>Usa citas textuales cuando: el autor proporciona una definición técnica que no puedes mejorar, cuando las palabras específicas son objeto de análisis (especialmente en estudios literarios o lingüísticos), cuando quieres mostrar el estilo o tono particular de un autor, o cuando citas una fuente primaria histórica donde la formulación original es relevante.</p>
          <p>La paráfrasis, por el contrario, es tu herramienta para integrar ideas ajenas manteniendo la fluidez de tu propio estilo. Úsala cuando necesites adaptar información compleja a tu nivel de audiencia, cuando combines ideas de múltiples fuentes, cuando la información es importante pero no las palabras específicas, o cuando una cita textual interrumpiría el ritmo de tu argumentación.</p>
          <p>Para parafrasear efectivamente, sigue esta técnica de tres pasos: primero, lee el texto original y ciérralo; segundo, escribe la idea con tus propias palabras sin consultar el original; tercero, revisa que hayas capturado la idea correctamente pero con tu propia formulación. Este proceso garantiza que realmente entiendas el concepto y no solo copies estructuras sintácticas.</p>
          <p>Un principio práctico crucial: nunca uses más del 10% de citas textuales en tu trabajo total. Si dependes excesivamente de citas textuales, tu texto pierde voz propia y se convierte en un collage de opiniones ajenas. Tu trabajo debe demostrar que puedes procesar, sintetizar y comunicar ideas complejas, no solo reproducirlas.</p>
          <p>Cuando uses citas textuales, intégralas fluidamente en tu texto. Nunca "arrojes" una cita sin contexto. Preséntala, explícala y conecta su relevancia con tu argumento central.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>CITA TEXTUAL EFECTIVA: Rodríguez (2022) define el pensamiento crítico como "la capacidad de analizar información de manera objetiva y formular juicios razonados" (p. 23), definición que adoptaremos en este estudio por su precisión metodológica.

PARÁFRASIS EFECTIVA: Según Rodríguez (2022), el pensamiento crítico implica evaluar información sin sesgos personales para llegar a conclusiones fundamentadas (p. 23).</p>
        </div>
      </section>

      {/* Sección: Sistemas de citación: APA 7, MLA, Chicago y Vancouver aplicados */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Sistemas de citación: APA 7, MLA, Chicago y Vancouver aplicados</h2>
        </div>
          <p>Cada sistema de citación responde a las necesidades específicas de diferentes disciplinas académicas, y dominar el sistema correcto para tu área es fundamental. APA 7 (American Psychological Association) es obligatorio en psicología, educación, ciencias sociales y muchas áreas de investigación empírica. MLA (Modern Language Association) es el estándar en literatura, humanidades y estudios culturales. Chicago se usa frecuentemente en historia y algunas disciplinas humanísticas. Vancouver es específico para ciencias biomédicas.</p>
          <p>En APA 7, las citas en el texto siguen el formato autor-fecha: (García, 2023) o García (2023). Para citas textuales, añade la página: (García, 2023, p. 45). Con múltiples autores: dos autores se conectan con "y" en español (García y Martínez, 2023), tres o más se abrevian (García et al., 2023). Las referencias van en orden alfabético al final.</p>
          <p>En MLA, usa autor-página en el texto: (García 45) o García afirma que... (45). No incluyas el año en las citas en el texto. Para fuentes electrónicas sin paginación, usa párrafos si están numerados: (García párr. 3). Las referencias se llaman "Obras Citadas" y van en orden alfabético.</p>
          <p>Chicago ofrece dos sistemas: notas-bibliografía (preferido en humanidades) usa notas al pie numeradas, mientras que autor-fecha funciona similar a APA. Vancouver usa números entre paréntesis o como superíndices: (1) o¹, y las referencias se listan numéricamente en orden de aparición.</p>
          <p>Para aplicar esto prácticamente, identifica primero qué sistema exige tu institución o revista objetivo. Nunca mezcles sistemas dentro del mismo trabajo. Usa las guías oficiales actualizadas, no resúmenes de terceros que pueden contener errores. Configura tu procesador de textos con los estilos automáticos del sistema elegido para mantener consistencia.</p>
          <p>Un consejo crucial: cada sistema tiene actualizaciones periódicas. APA 7, por ejemplo, introdujo cambios significativos respecto a APA 6 en el manejo de DOIs, URLs y fuentes electrónicas. Siempre verifica que uses la versión más reciente del manual correspondiente.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>MISMA FUENTE EN DIFERENTES SISTEMAS:

APA 7: Según García (2023), "la metodología cualitativa permite explorar fenómenos complejos" (p. 78).
Referencia: García, M. (2023). Metodología de investigación social. Editorial Académica.

MLA: García sostiene que "la metodología cualitativa permite explorar fenómenos complejos" (78).
Referencia: García, María. Metodología de investigación social. Editorial Académica, 2023.

Chicago: García argumenta que "la metodología cualitativa permite explorar fenómenos complejos".¹
Nota al pie: ¹ María García, Metodología de investigación social (Editorial Académica, 2023), 78.</p>
        </div>
      </section>

      {/* Sección: Construcción de bibliografía: proceso paso a paso */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Construcción de bibliografía: proceso paso a paso</h2>
        </div>
          <p>Una bibliografía sólida se construye sistemáticamente desde el primer día de investigación, no como una tarea de último momento. El proceso efectivo requiere organización, precisión y consistencia absoluta en el formato elegido.</p>
          <p>Paso 1: Recopilación sistemática. Cada vez que consultes una fuente, registra inmediatamente todos los datos bibliográficos completos: autor(es) completo(s), título exacto, editorial, lugar de publicación, año, páginas consultadas, DOI o URL si aplica, y fecha de acceso para fuentes web. Un error común es anotar solo parcialmente esta información, lo que después te obligará a buscar nuevamente fuentes ya consultadas.</p>
          <p>Paso 2: Categorización por tipos de fuente. Libros, artículos de revista, capítulos de libro editado, tesis, sitios web, documentos gubernamentales, etc., tienen formatos específicos diferentes. Agrúpalos desde el inicio para aplicar el formato correcto a cada categoría.</p>
          <p>Paso 3: Aplicación consistente del formato. Usa una guía actualizada del sistema de citación requerido y aplícala rigurosamente. Presta atención especial a detalles como cursivas vs comillas, uso de mayúsculas, puntuación específica, y orden de elementos. En APA 7, por ejemplo, solo la primera letra del título y subtítulo se capitaliza, mientras que en MLA se capitaliza cada palabra principal.</p>
          <p>Paso 4: Organización alfabética rigurosa. Ordena por apellido del primer autor, considerando partículas como "de", "del", "von" según las reglas específicas del sistema usado. Para autores corporativos, usa la primera palabra significativa (ignora "La", "El", "The").</p>
          <p>Paso 5: Revisión de consistencia. Verifica que todas las fuentes citadas en el texto aparezcan en la bibliografía y viceversa. Revisa que el formato sea idéntico en todas las entradas: espaciado, sangrías, cursivas, puntuación.</p>
          <p>Paso 6: Verificación de fuentes. Antes de finalizar, confirma que puedes acceder nuevamente a cada fuente listada, especialmente las electrónicas que pueden cambiar de ubicación o desaparecer.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>PROCESO PRÁCTICO PARA UN ARTÍCULO DE REVISTA EN APA 7:

Datos recopilados: Autor: Ana María Rodríguez Vega; Título: Impacto de la tecnología en el aprendizaje universitario; Revista: Revista de Educación Superior; Volumen 45, Número 3; Páginas 123-145; Año 2023; DOI: 10.1234/res.2023.45.3.123

Formato final: Rodríguez Vega, A. M. (2023). Impacto de la tecnología en el aprendizaje universitario. Revista de Educación Superior, 45(3), 123-145. https://doi.org/10.1234/res.2023.45.3.123</p>
        </div>
      </section>

      {/* Sección: Herramientas de gestión bibliográfica: Zotero y Mendeley en la práctica */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✍️</span>
          <h2 className={styles.sectionTitleText}>Herramientas de gestión bibliográfica: Zotero y Mendeley en la práctica</h2>
        </div>
          <p>Los gestores bibliográficos no son solo convenientes: son indispensables para investigación seria. Automatizan la recopilación, organización y formateo de referencias, eliminando errores humanos y ahorrando horas de trabajo tedioso. Zotero y Mendeley son las opciones más robustas y gratuitas disponibles.</p>
          <p>Zotero destaca por su integración perfecta con navegadores web. Instala la extensión de navegador y captura referencias directamente desde bases de datos académicas, bibliotecas digitales, Amazon, Google Scholar, y prácticamente cualquier sitio web con un solo clic. El software detecta automáticamente el tipo de fuente (libro, artículo, página web) y extrae los metadatos correctos.</p>
          <p>Para maximizar Zotero: organiza tus referencias en carpetas temáticas desde el inicio, usa etiquetas para categorizar por temas transversales, aprovecha la función de búsqueda avanzada para localizar rápidamente fuentes específicas, y sincroniza tu biblioteca en la nube para acceder desde múltiples dispositivos. La función de notas te permite anexar resúmenes o comentarios a cada referencia.</p>
          <p>Mendeley combina gestión bibliográfica con red social académica. Su fortaleza principal es la lectura y anotación de PDFs dentro del mismo programa. Puedes resaltar texto, añadir notas, y estas anotaciones se sincronizan automáticamente con la referencia bibliográfica correspondiente.</p>
          <p>Para usar Mendeley efectivamente: configura carpetas para diferentes proyectos, usa la función de "watched folders" para que añada automáticamente PDFs que descargas, aprovecha las recomendaciones basadas en tu biblioteca para descubrir nueva literatura relevante, y únete a grupos públicos de tu área de investigación.</p>
          <p>Ambas herramientas se integran con Word, Google Docs y LibreOffice. Instala el plugin correspondiente y podrás insertar citas y generar bibliografías automáticamente en el formato requerido (APA, MLA, Chicago, etc.). Cuando cambies de formato de citación, todas las citas y la bibliografía se actualizan automáticamente.</p>
          <p>Un flujo de trabajo eficiente: usa Zotero o Mendeley para recopilar fuentes durante la investigación, lee y anota PDFs dentro del gestor, inserta citas mientras escribes usando el plugin, y genera la bibliografía final automáticamente. Este proceso elimina virtualmente los errores de formato y te permite concentrarte en el contenido de tu investigación.</p>
        
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>FLUJO PRÁCTICO CON ZOTERO:
1. Navegando en JSTOR, encuentras un artículo relevante
2. Clic en el ícono de Zotero en tu navegador → se guarda automáticamente con metadatos completos
3. En Word, posicionas el cursor donde necesitas la cita
4. Clic en "Add/Edit Citation" del plugin de Zotero → buscas el autor → insertas la cita
5. Al final del documento, clic en "Add/Edit Bibliography" → se genera automáticamente la lista completa en formato APA
6. Si cambias a formato MLA, todas las citas y bibliografía se actualizan instantáneamente</p>
        </div>
      </section>

      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          <li>Cita inmediatamente: anota la fuente completa cada vez que encuentres información relevante, nunca pospongas este paso</li>
          <li>Usa la regla del 10%: máximo 10% de tu texto debe ser citas textuales, el resto debe ser paráfrasis y análisis propio</li>
          <li>Instala un gestor bibliográfico hoy mismo: Zotero o Mendeley te ahorrarán horas de trabajo y eliminarán errores de formato</li>
          <li>Verifica el sistema requerido antes de empezar: APA para ciencias sociales, MLA para humanidades, Chicago para historia, Vancouver para medicina</li>
          <li>Revisa la consistencia al final: todas las citas en el texto deben aparecer en la bibliografía y viceversa</li>
        </ul>
      </div>

      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          <li>Recopilar fuentes al final del proceso de escritura en lugar de hacerlo durante la investigación inicial</li>
          <li>Mezclar diferentes sistemas de citación dentro del mismo trabajo</li>
          <li>Pensar que parafrasear sin citar evita el plagio - toda idea ajena necesita referencia, incluso parafraseada</li>
        </ul>
      </div>

      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>El secreto de los investigadores experimentados es tratarr cada cita como una inversión en credibilidad. Una bibliografía extensa y bien formateada no solo evita problemas de plagio: demuestra que conoces profundamente tu campo de estudio y que tu trabajo se basa en fundamentos sólidos. Los evaluadores siempre revisan primero la bibliografía para juzgar la seriedad de la investigación.</p>
      </div>

      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>Abre tu trabajo actual y revisa las últimas tres páginas que escribiste. Identifica cada afirmación que no sea obviamente de tu creación original y verifica que tenga su cita correspondiente. Si encuentras alguna sin cita, busca la fuente ahora mismo y añádela. Luego, instala Zotero o Mendeley y transfiere todas tus fuentes actuales al gestor - este paso inicial te ahorrará horas en las próximas semanas.</p>
      </div>
    </ChapterPage>
  );
}
