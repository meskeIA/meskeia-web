'use client';

import { useState } from 'react';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function GlosarioPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <ChapterPage chapterId="terminos-clave">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📘</span>
          <h2 className={styles.sectionTitleText}>Glosario de Términos Académicos</h2>
        </div>
        <p>Este glosario reúne los términos fundamentales de la redacción académica que todo estudiante universitario debe dominar. Los conceptos están organizados por categorías temáticas para facilitar su consulta y comprensión durante el proceso de escritura de trabajos académicos.</p>
      </section>

      {/* Filtros */}
      <div className={styles.glossaryFilters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar término..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Contenido del glosario */}
      <div className={styles.glossaryContent}>

              {/* Estructura del Texto */}
              <div className={styles.glossarySection}>
                <h3 className={styles.glossaryLetter}>Estructura del Texto</h3>
                <div className={styles.glossaryTerms}>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Abstract</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Resumen conciso del trabajo académico que presenta el tema, metodología, resultados principales y conclusiones en 150-300 palabras.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: El abstract de un TFG debe incluir el problema de investigación, la metodología empleada y los hallazgos más relevantes.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Introducción</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Sección inicial que presenta el tema, justifica su relevancia, establece objetivos y anticipa la estructura del trabajo.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una buena introducción debe captar el interés del lector y contextualizar el problema de investigación desde lo general a lo específico.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Marco Teórico</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Sección que presenta y analiza las teorías, conceptos y estudios previos relevantes para fundamentar la investigación.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: El marco teórico de una tesis sobre educación digital debe incluir teorías del aprendizaje y estudios sobre tecnología educativa.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Metodología</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Apartado que describe detalladamente los métodos, técnicas e instrumentos utilizados para realizar la investigación.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: La metodología debe especificar si se utilizó un enfoque cualitativo, cuantitativo o mixto, y justificar esta elección.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Desarrollo</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Cuerpo principal del texto donde se exponen, analizan y discuten los argumentos e información relacionada con el tema.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: El desarrollo de un ensayo académico debe presentar los argumentos de forma lógica y respaldados con evidencia.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Conclusiones</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Sección final que sintetiza los hallazgos principales, responde a los objetivos planteados y sugiere líneas futuras de investigación.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Las conclusiones no deben introducir información nueva, sino integrar y evaluar lo expuesto en el desarrollo.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Anexos</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Material complementario que apoya el texto principal pero que no es esencial para su comprensión (tablas, gráficos, encuestas, etc.).</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Los cuestionarios completos utilizados en la investigación suelen incluirse como anexos al final del documento.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Índice</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Lista organizada de los contenidos del documento con las páginas correspondientes, que facilita la navegación del texto.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: El índice debe reflejar la estructura jerárquica del trabajo, diferenciando claramente entre capítulos, secciones y subsecciones.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Epígrafe</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Título breve y descriptivo que encabeza cada sección o subsección del trabajo académico.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Los epígrafes deben ser informativos y específicos: 'Análisis de resultados' es mejor que simplemente 'Resultados'.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Estado de la Cuestión</h4>
                      <span className={styles.glossaryCategory}>Estructura del Texto</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Revisión crítica de la literatura existente sobre el tema que identifica vacíos de conocimiento y justifica la investigación.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: El estado de la cuestión debe mostrar qué se ha investigado previamente y qué aspectos quedan por explorar.</em></p>
                  </div>
                </div>
              </div>

              {/* Citación y Referencias */}
              <div className={styles.glossarySection}>
                <h3 className={styles.glossaryLetter}>Citación y Referencias</h3>
                <div className={styles.glossaryTerms}>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Paráfrasis</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Reformulación de las ideas de otro autor con palabras propias, manteniendo el sentido original y citando la fuente.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Según García (2020), la educación virtual presenta desafíos metodológicos significativos para los docentes.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Cita Textual</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Reproducción exacta de las palabras de otro autor, entrecomillada y con referencia específica a la fuente.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Como afirma Pérez (2019): 'La investigación cualitativa permite comprender fenómenos complejos desde la perspectiva de los participantes' (p. 45).</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Bibliografía</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Lista completa de todas las fuentes consultadas y citadas en el trabajo, organizadas según un formato específico.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: La bibliografía debe incluir todos los libros, artículos y recursos digitales mencionados en el texto, siguiendo APA, MLA u otro estilo.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Plagio</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Apropiación indebida de ideas, palabras o trabajos ajenos sin reconocer la autoría correspondiente.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Copiar párrafos de internet sin citar la fuente constituye plagio y puede tener consecuencias académicas graves.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Referencia</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Información bibliográfica completa de una fuente, que permite al lector localizar y verificar el material citado.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una referencia APA incluye: Autor, A. A. (año). Título del trabajo. Editorial.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Nota a Pie de Página</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Comentario explicativo o referencia bibliográfica ubicada en la parte inferior de la página.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Las notas al pie se utilizan para aclaraciones que interrumpirían el flujo del texto principal.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Ibídem</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Expresión latina que significa 'en el mismo lugar', utilizada para referirse a la fuente citada inmediatamente antes.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Si se cita el mismo libro en dos notas consecutivas, se puede usar 'Ibídem' en la segunda.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Op. cit.</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Abreviatura de 'opus citatum' (obra citada), utilizada para referenciar una obra ya mencionada anteriormente.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: García, op. cit., p. 67, se usa cuando ya se citó completamente esa obra de García en una nota previa.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Et al.</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Expresión latina que significa 'y otros', utilizada cuando una obra tiene múltiples autores.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: En trabajos con más de tres autores, se cita el primero seguido de 'et al.': Martínez et al. (2021).</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Fuente Primaria</h4>
                      <span className={styles.glossaryCategory}>Citación y Referencias</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Documento o testimonio original que proporciona evidencia directa sobre el tema de investigación.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Los documentos históricos, entrevistas originales y datos experimentales son fuentes primarias.</em></p>
                  </div>
                </div>
              </div>

              {/* Coherencia y Cohesión */}
              <div className={styles.glossarySection}>
                <h3 className={styles.glossaryLetter}>Coherencia y Cohesión</h3>
                <div className={styles.glossaryTerms}>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Conectores Lógicos</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Palabras o expresiones que establecen relaciones semánticas entre ideas, oraciones o párrafos.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Conectores como 'sin embargo', 'por tanto', 'además' y 'en consecuencia' articulan el discurso académico.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Progresión Temática</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Desarrollo ordenado y lógico de las ideas a lo largo del texto, manteniendo la continuidad conceptual.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una buena progresión temática evita saltos abruptos entre ideas y mantiene el hilo argumentativo.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Cohesión Léxica</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Relación entre palabras del texto mediante sinónimos, hiperónimos, repeticiones y campos semánticos.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Usar 'estudiantes', 'alumnos' y 'discentes' en el mismo texto crea cohesión léxica por sinonimia.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Anáfora</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Mecanismo de cohesión que consiste en hacer referencia a un elemento mencionado previamente en el texto.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: El pronombre 'este' en 'Este fenómeno' refiere anafóricamente a un concepto explicado anteriormente.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Catáfora</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Referencia a un elemento que aparecerá posteriormente en el texto.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: 'Lo siguiente es fundamental: la metodología debe ser rigurosa' - 'lo siguiente' anticipa la información que viene.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Isotopía</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Recurrencia de elementos semánticos que dotan de coherencia temática al texto.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: En un texto sobre educación, la isotopía se mantiene con términos como 'enseñanza', 'aprendizaje', 'pedagógico'.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Párrafo de Transición</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Párrafo que conecta dos secciones del texto, resumiendo lo anterior e introduciendo lo siguiente.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: 'Después de analizar las causas del problema, examinaremos ahora las posibles soluciones.'</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Marcadores Discursivos</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Elementos que organizan el discurso y guían la interpretación del lector sobre las relaciones entre ideas.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: 'En primer lugar', 'por un lado', 'finalmente' son marcadores que estructuran la argumentación.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Elipsis</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Omisión de elementos del discurso que se sobreentienden por el contexto, evitando repeticiones innecesarias.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: 'Juan estudia medicina y María, derecho' - se omite 'estudia' en la segunda parte de la oración.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Tema y Rema</h4>
                      <span className={styles.glossaryCategory}>Coherencia y Cohesión</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Estructura informativa donde el tema es la información conocida y el rema aporta información nueva.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: 'La educación online (tema) presenta nuevos desafíos pedagógicos (rema).'</em></p>
                  </div>
                </div>
              </div>

              {/* Estilo Académico */}
              <div className={styles.glossarySection}>
                <h3 className={styles.glossaryLetter}>Estilo Académico</h3>
                <div className={styles.glossaryTerms}>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Registro Formal</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Nivel de lengua caracterizado por el uso de vocabulario técnico, estructuras complejas y tono impersonal.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: En lugar de 'creemos que', es preferible 'se considera que' o 'los datos sugieren que'.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Objetividad</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Presentación imparcial de la información, evitando juicios de valor y opiniones personales no fundamentadas.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: En lugar de 'es obvio que', usar 'los resultados indican que' o 'la evidencia sugiere que'.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Precisión Léxica</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Uso exacto y específico del vocabulario, eligiendo términos que expresen con exactitud el concepto deseado.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Distinguir entre 'método', 'técnica' y 'procedimiento' según el contexto específico de la investigación.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Concisión</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Expresión clara y directa de las ideas, eliminando palabras innecesarias sin perder precisión.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: En lugar de 'debido al hecho de que', simplemente usar 'porque' o 'dado que'.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Impersonalidad</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Evitación de referencias directas al autor mediante el uso de construcciones impersonales.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Preferir 'se observa que' o 'los datos muestran' en lugar de 'yo observé' o 'nosotros encontramos'.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Modalización</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Expresión del grado de certeza o posibilidad mediante verbos, adverbios y expresiones modales.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: 'Posiblemente', 'es probable que', 'los datos sugieren' expresan diferentes grados de certeza.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Nominalización</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Conversión de verbos y adjetivos en sustantivos para crear un estilo más formal y denso informativamente.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Transformar 'cuando se aplica' en 'la aplicación de' o 'analizar' en 'el análisis de'.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Tecnolecto</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Vocabulario especializado de una disciplina académica o científica específica.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Términos como 'paradigma', 'epistemología' o 'hermenéutica' forman parte del tecnolecto académico.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Hedging</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Estrategia discursiva para expresar cautela o incertidumbre en las afirmaciones académicas.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: 'Parece que', 'tiende a', 'en cierta medida' son expresiones de hedging que matizan las afirmaciones.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Intertextualidad</h4>
                      <span className={styles.glossaryCategory}>Estilo Académico</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Relación explícita entre el texto propio y otros textos mediante citas, referencias y alusiones.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Un trabajo académico establece intertextualidad al dialogar con teorías y estudios previos sobre el tema.</em></p>
                  </div>
                </div>
              </div>

              {/* Tipos de Textos */}
              <div className={styles.glossarySection}>
                <h3 className={styles.glossaryLetter}>Tipos de Textos</h3>
                <div className={styles.glossaryTerms}>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Ensayo Académico</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Texto argumentativo que desarrolla un punto de vista personal sobre un tema, respaldado con evidencia académica.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Un ensayo sobre la influencia de las redes sociales en la educación debe presentar argumentos fundamentados en investigación.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Artículo Científico</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Publicación que comunica resultados originales de investigación siguiendo un formato estandarizado.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Un artículo científico típicamente incluye resumen, introducción, metodología, resultados, discusión y conclusiones.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Tesis Doctoral</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Investigación original y extensiva que contribuye al conocimiento en una disciplina específica.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una tesis doctoral debe demostrar dominio del campo de estudio y aportar conocimiento nuevo y significativo.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>TFG (Trabajo de Fin de Grado)</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Proyecto académico que sintetiza y aplica los conocimientos adquiridos durante los estudios de grado.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Un TFG puede consistir en una investigación empírica, una revisión teórica o un proyecto de intervención.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>TFM (Trabajo de Fin de Máster)</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Trabajo de investigación más especializado que demuestra competencias avanzadas en el área de estudio.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Un TFM suele requerir mayor profundidad metodológica y teórica que un TFG.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Reseña Crítica</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Texto que analiza y evalúa críticamente una obra académica, destacando sus contribuciones y limitaciones.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una reseña de libro debe resumir el contenido, evaluar la metodología y situar la obra en su contexto académico.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Monografía</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Estudio detallado y exhaustivo sobre un tema específico, basado en investigación documental.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una monografía sobre la Guerra Civil española analizaría múltiples fuentes para ofrecer una visión comprehensiva.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Informe de Investigación</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Documento que presenta los resultados de una investigación de manera sistemática y objetiva.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Un informe de investigación de mercado incluye metodología, hallazgos, análisis y recomendaciones.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Paper</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Artículo académico breve que presenta resultados de investigación o reflexiones teóricas sobre un tema específico.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Un paper para un congreso académico suele tener entre 8-12 páginas y seguir un formato específico.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Revisión Sistemática</h4>
                      <span className={styles.glossaryCategory}>Tipos de Textos</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Síntesis rigurosa y exhaustiva de la literatura existente sobre un tema, siguiendo una metodología explícita.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una revisión sistemática sobre efectividad de tratamientos debe incluir criterios de selección y análisis de calidad.</em></p>
                  </div>
                </div>
              </div>

              {/* Evaluación */}
              <div className={styles.glossarySection}>
                <h3 className={styles.glossaryLetter}>Evaluación</h3>
                <div className={styles.glossaryTerms}>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Rúbrica</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Instrumento de evaluación que especifica criterios y niveles de desempeño para valorar trabajos académicos.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Una rúbrica para ensayos puede evaluar argumentación, uso de fuentes, estructura y expresión escrita.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Criterios de Evaluación</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Estándares específicos utilizados para juzgar la calidad de un trabajo académico.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Los criterios pueden incluir originalidad, rigor metodológico, claridad expositiva y relevancia del tema.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Retroalimentación</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Comentarios específicos sobre el trabajo del estudiante que orientan la mejora del desempeño académico.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: La retroalimentación efectiva señala fortalezas y áreas de mejora con sugerencias concretas.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Evaluación Formativa</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Valoración continua del proceso de aprendizaje que permite ajustar y mejorar el trabajo en desarrollo.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: La revisión de borradores y la discusión de avances constituyen evaluación formativa.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Evaluación Sumativa</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Valoración final del producto académico terminado para asignar una calificación.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: La defensa de tesis es un ejemplo de evaluación sumativa que determina la aprobación del trabajo.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Peer Review</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Proceso de evaluación por pares académicos que valoran la calidad de trabajos de investigación.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: Los artículos científicos pasan por peer review antes de ser publicados en revistas especializadas.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Originalidad</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Grado de novedad y aportación personal que presenta un trabajo académico respecto al conocimiento existente.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: La originalidad se evalúa considerando el planteamiento del problema, la metodología y las conclusiones.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Rigor Académico</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Aplicación sistemática y precisa de métodos de investigación y normas académicas establecidas.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: El rigor académico se evidencia en la fundamentación teórica, metodología apropiada y análisis consistente.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Autoría</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Reconocimiento de la responsabilidad intelectual sobre un trabajo académico y sus contribuciones específicas.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: En trabajos colaborativos, se debe especificar la contribución de cada autor claramente.</em></p>
                  </div>

                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>Defensa Oral</h4>
                      <span className={styles.glossaryCategory}>Evaluación</span>
                    </div>
                    <p className={styles.glossaryDefinition}>Presentación y argumentación oral del trabajo académico ante un tribunal evaluador.</p>
                    <p className={styles.glossaryExample}><em>Ejemplo: La defensa de tesis incluye exposición del trabajo, respuesta a preguntas y discusión con el tribunal.</em></p>
                  </div>
                </div>
              </div>
      </div>

      <div className={styles.practicalTip}>
        <h4>💡 Consejo</h4>
        <p>Utiliza este glosario como referencia constante durante tu proceso de escritura. Marca los términos que te resulten más desafiantes y revísalos regularmente para incorporarlos gradualmente a tu vocabulario académico activo.</p>
      </div>
    </ChapterPage>
  );
}
