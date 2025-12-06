'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function VerdadLenguajePage() {
  return (
    <ChapterPage chapterId="verdad-lenguaje">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La búsqueda de la verdad es una empresa compleja que involucra no solo los hechos del mundo, sino también las herramientas conceptuales que usamos para comprenderlos. El lenguaje que hablamos, la lógica que aplicamos y nuestra capacidad de pensar críticamente determinan en gran medida qué tan cerca podemos estar de la verdad.</p>
      </section>

        {/* Sección: El Poder del Lenguaje: Cómo las Palabras Moldean la Realidad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>El Poder del Lenguaje: Cómo las Palabras Moldean la Realidad</h2>
          </div>
          <p>El lenguaje no es simplemente un vehículo neutral para transmitir información; es una fuerza activa que moldea nuestra percepción de la realidad. Esta idea, conocida como relativismo lingüístico o hipótesis Sapir-Whorf, sugiere que la estructura de nuestro idioma influye en cómo pensamos y experimentamos el mundo.</p>
          <p>Consideremos el español y su riqueza para expresar relaciones familiares. Tenemos palabras específicas como 'cuñado', 'concuño', 'nuera' o 'yerno', que no existen como palabras únicas en otros idiomas como el inglés. Esta precisión lingüística refleja y refuerza la importancia cultural de las relaciones familiares extendidas en las sociedades hispanohablantes.</p>
          <p>El fenómeno va más allá del vocabulario. La estructura gramatical también importa. En español, la conjugación verbal indica automáticamente quién realiza la acción (yo, tú, él), mientras que en inglés esto requiere pronombres explícitos. Esto puede influir en cómo concebimos la agencia y la responsabilidad personal.</p>
          <p>Los marcos conceptuales (frames) que usamos también determinan qué aspectos de la realidad destacamos. Cuando hablamos de 'recursos humanos' en lugar de 'trabajadores', estamos enmarcando a las personas como insumos económicos. Cuando decimos 'países en vías de desarrollo' en lugar de 'países pobres', estamos eligiendo una perspectiva temporal optimista sobre una descripción estática.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La palabra 'saudade' en portugués describe una melancolía nostálgica que no tiene equivalente exacto en español. Los hablantes de portugués pueden identificar y experimentar este sentimiento de manera más precisa precisamente porque tienen una palabra para nombrarlo.</p>
          </div>
        </section>

        {/* Sección: Trampas del Razonamiento: Identificando Falacias Lógicas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Trampas del Razonamiento: Identificando Falacias Lógicas</h2>
          </div>
          <p>Las falacias lógicas son errores sistemáticos en el razonamiento que pueden parecer convincentes pero que invalidan la lógica de un argumento. Reconocerlas es fundamental para el pensamiento crítico y la búsqueda de la verdad.</p>
          <p>El ad hominem es quizás la falacia más común en debates políticos. En lugar de atacar las ideas, se ataca a la persona. 'No podemos confiar en sus propuestas económicas porque es un político corrupto' ejemplifica esta falacia. Aunque la corrupción sea real, no invalida automáticamente todas sus ideas económicas.</p>
          <p>La falacia del hombre de paja consiste en distorsionar la posición del oponente para que sea más fácil de atacar. Si alguien propone regular cierta industria y el oponente responde 'quiere destruir el libre mercado', está creando un hombre de paja.</p>
          <p>La falsa dicotomía presenta solo dos opciones cuando existen más alternativas. 'O apoyas completamente las políticas del gobierno o eres un traidor' ignora múltiples posiciones intermedias y matices.</p>
          <p>El argumento de autoridad falaz apela a expertos fuera de su área de competencia. Que un futbolista famoso recomiende un producto financiero no le da credibilidad científica a esa recomendación.</p>
          <p>La pendiente resbaladiza sugiere que un evento llevará inevitablemente a consecuencias extremas. 'Si legalizamos esta droga, pronto todos serán drogadictos' ejemplifica este error lógico.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En redes sociales es común ver: 'El 90% de los doctores recomiendan X'. Esto puede ser una falacia de autoridad si los 'doctores' son PhDs en literatura, no médicos, y X es un suplemento nutricional.</p>
          </div>
        </section>

        {/* Sección: El Arte del Pensamiento Crítico: Herramientas para la Verdad */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>El Arte del Pensamiento Crítico: Herramientas para la Verdad</h2>
          </div>
          <p>El pensamiento crítico es la habilidad de analizar información de manera objetiva y formar juicios razonados. No se trata de criticar por criticar, sino de evaluar evidencia, identificar sesgos y construir argumentos sólidos.</p>
          <p>Un pensador crítico eficaz cultiva la curiosidad intelectual y la humildad epistémica: el reconocimiento de las limitaciones de nuestro conocimiento. Esto implica estar dispuesto a cambiar de opinión ante nueva evidencia y reconocer cuándo no sabemos algo.</p>
          <p>La verificación de fuentes es fundamental en la era de la información. Preguntas clave incluyen: ¿Quién publica esta información? ¿Tiene conflictos de interés? ¿La información es primaria o de segunda mano? ¿Se puede corroborar con fuentes independientes?</p>
          <p>El pensamiento crítico también requiere distinguir entre correlación y causación. Que dos eventos ocurran juntos no significa que uno cause el otro. El aumento en ventas de helados y el aumento en ahogamientos durante el verano están correlacionados, pero el helado no causa ahogamientos; el factor común es el clima cálido.</p>
          <p>Finalmente, un pensador crítico practica la caridad interpretativa: interpretar los argumentos ajenos en su forma más fuerte y razonable antes de evaluarlos. Esto evita malentendidos y eleva el nivel del discurso intelectual.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Ante la afirmación 'los videojuegos causan violencia', un pensador crítico preguntaría: ¿Qué estudios respaldan esto? ¿Consideraron otras variables como entorno familiar o problemas de salud mental? ¿Por qué países con alto consumo de videojuegos como Japón tienen tasas de violencia tan bajas?</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>El lenguaje no solo describe la realidad, sino que activamente la moldea a través de vocabulario, estructura gramatical y marcos conceptuales</li>
            <li>Las falacias lógicas son errores sistemáticos en el razonamiento que pueden parecer convincentes pero invalidan los argumentos</li>
            <li>El pensamiento crítico requiere curiosidad intelectual, humildad epistémica y habilidades específicas de evaluación de evidencia</li>
            <li>La búsqueda de la verdad es un proceso activo que requiere herramientas conceptuales sofisticadas y constante vigilancia contra sesgos cognitivos</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo influye tu lengua materna en la forma en que percibes y categorizas las experiencias cotidianas?</li>
            <li>¿Puedes identificar una ocasión reciente en la que hayas usado o detectado una falacia lógica en una conversación o debate?</li>
            <li>¿Qué estrategias específicas podrías implementar para mejorar tu capacidad de pensamiento crítico en la era de las redes sociales?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El idioma pirahã de la Amazonía brasileña carece de números exactos más allá de 'pocos' y 'muchos', y sus hablantes tienen dificultades con tareas matemáticas que requieren conteo preciso. Esto sugiere que algunas capacidades cognitivas pueden estar genuinamente limitadas por el lenguaje disponible.</p>
      </div>
    </ChapterPage>
  );
}
