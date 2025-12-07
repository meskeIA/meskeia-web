'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function AnalisisEntornoPage() {
  return (
    <ChapterPage chapterId="analisis-entorno">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            Si trabajas en una empresa hoy, probablemente has oído hablar de las 5 Fuerzas de Porter. Es el framework de estrategia más enseñado del mundo. El problema es que fue diseñado para un mundo que ya no existe. Un mundo donde las industrias cambiaban lentamente, donde podías mapear a tus competidores en una hoja de cálculo, y donde la planificación a cinco años tenía sentido. Hoy, tu competidor más peligroso puede ser una startup que no existía hace seis meses, o una empresa de IA que redefinirá tu industria el próximo trimestre. Esto no significa que Porter sea inútil, pero sí que necesitas entender tanto su valor como sus limitaciones para no acabar como Kodak: con un análisis perfecto de un juego que ya no se está jugando.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Las 5 Fuerzas: El GPS de las Industrias Estables</h2>
          <div className={styles.sectionContent}>
            <p>Las 5 Fuerzas de Porter (rivalidad, nuevos entrantes, sustitutos, poder de compradores y proveedores) funcionan como un GPS: son excelentes para entender dónde estás, pero no te dicen si el terreno va a cambiar mañana. Porter te ayuda a radiografiar la estructura de una industria en un momento dado. ¿Hay muchos competidores peleándose por el mismo pastel? ¿Es fácil que entre alguien nuevo? ¿Tienen tus clientes alternativas? Estas preguntas siguen siendo relevantes. El framework brilla cuando analizas industrias con dinámicas relativamente estables: la distribución de bebidas, la construcción, o los supermercados tradicionales. Te permite identificar dónde está el poder, quién se queda con los márgenes, y por qué algunas empresas ganan más que otras. Pero aquí está el problema: asume que las reglas del juego son fijas. En 2025, las reglas cambian constantemente.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Amazon empezó vendiendo libros online. Según Porter de 1995, tenía poco poder frente a proveedores (editoriales), alta rivalidad (librerías físicas establecidas), y barreras de entrada manejables. El análisis era correcto... para el negocio de libros. Pero Amazon no estaba jugando al negocio de libros. Estaba construyendo una plataforma que redefinió el comercio minorista completo. Porter no capturó esta dinámica porque no estaba diseñado para ello.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Ciclo de Vida: De Lineal a Caótico</h2>
          <div className={styles.sectionContent}>
            <p>El análisis tradicional del ciclo de vida (introducción, crecimiento, madurez, declive) asume una progresión ordenada y predecible. Era útil cuando las industrias evolucionaban en décadas. Hoy, los ciclos se han comprimido brutalmente y se han vuelto no lineales. Una industria puede saltar de introducción a declive en meses, o resucitar súbitamente por una innovación disruptiva. Los NFTs pasaron de inexistentes a valoraciones de miles de millones en 18 meses, y luego colapsaron igual de rápido. Las criptomonedas han 'muerto' y 'resucitado' múltiples veces. La industria del taxi existía sin cambios durante décadas hasta que Uber la redefinió en cinco años. El framework del ciclo de vida sigue siendo útil para entender patrones generales, pero no para predecir timing o duración. La clave es reconocer que estamos en una era de ciclos comprimidos y trayectorias impredecibles.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>La industria de los coches eléctricos no siguió el ciclo tradicional. Tesla saltó directamente a un modelo premium (contrario a la lógica tradicional de empezar por lo básico), creó su propia red de carga, y forzó a toda la industria automotriz a acelerar su transición eléctrica en menos de una década. Mientras los analistas debatían en qué 'fase' estaban los eléctricos, Tesla ya había redefinido las reglas.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Dinámicas No Lineales: Cuando 1+1=100</h2>
          <div className={styles.sectionContent}>
            <p>Los frameworks clásicos asumen relaciones lineales: más inversión = más resultados, más competidores = menos beneficios. La realidad de 2025 está dominada por dinámicas no lineales y efectos de red. Una pequeña ventaja inicial puede convertirse en dominación total (winner-takes-all). Los efectos de red crean círculos virtuosos: más usuarios atraen más usuarios, más datos mejoran el algoritmo, mejores algoritmos atraen más usuarios. Esto explica por qué Google domina búsquedas, por qué LinkedIn domina networking profesional, o por qué es casi imposible competir con WhatsApp. También explican los 'cisnes negros': eventos de baja probabilidad pero alto impacto que los modelos tradicionales no capturan. COVID-19, la guerra en Ucrania, o el boom de ChatGPT son ejemplos de eventos que redefinieron industrias enteras de la noche a la mañana. La estrategia moderna debe asumir que lo improbable es inevitable.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>TikTok no existía en Occidente en 2018. En 2020 ya tenía más de 800 millones de usuarios activos y había redefinido completamente las redes sociales, forzando a Instagram, YouTube y Snapchat a copiar su formato. No fue una evolución gradual; fue una explosión no lineal que los análisis tradicionales no habrían predicho.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Escenarios vs Predicciones: Navegar la Incertidumbre</h2>
          <div className={styles.sectionContent}>
            <p>Si no puedes predecir el futuro (y no puedes), la alternativa es prepararte para múltiples futuros posibles. El análisis de escenarios no trata de acertar qué va a pasar, sino de desarrollar opciones que funcionen en diferentes contextos. En lugar de apostar todo a una predicción, construyes capacidades y posiciones que te den flexibilidad. Esto significa mantener optionalidad: inversiones que te abren puertas sin cerrarte otras. Significa desarrollar sensores tempranos: métricas y señales que te avisen cuando el entorno está cambiando. Y significa construir capacidades de respuesta rápida: la habilidad de pivotar, experimentar y adaptarte más rápido que la competencia. En un mundo volátil, la velocidad de aprendizaje es más valiosa que la precisión de la predicción inicial. La pregunta no es 'qué va a pasar', sino 'cómo me aseguro de estar preparado para lo que sea que pase'.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cuando llegó la pandemia, las empresas que mejor respondieron no fueron las que la habían predicho (nadie lo hizo), sino las que tenían capacidades flexibles. Zoom ya tenía infraestructura escalable, Netflix ya había invertido en streaming, Amazon ya tenía logística de entrega. No predijeron COVID, pero tenían las opciones correctas cuando llegó el momento.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Herramientas Híbridas: Lo Mejor de Ambos Mundos</h2>
          <div className={styles.sectionContent}>
            <p>La estrategia efectiva en 2025 combina lo mejor de los frameworks clásicos con herramientas diseñadas para la complejidad. Usa Porter para entender la estructura actual de tu industria, pero complementa con análisis de plataformas, efectos de red, y dinámicas digitales. Mapea el ciclo de vida tradicional, pero asume que puede acelerarse, saltarse fases, o revertirse súbitamente. Desarrolla escenarios múltiples en lugar de planes únicos. Construye capacidades de sensing: sistemas que te avisen cuando están cambiando las reglas del juego. La clave está en mantener un pie en la estructura (lo que sabemos) y otro en la adaptabilidad (lo que podemos aprender). Los frameworks clásicos te dan una base sólida para entender patrones fundamentales. Las herramientas modernas te dan la agilidad para navegar la incertidumbre. Necesitas ambas.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Netflix usó análisis clásico para entender la industria del entretenimiento (poder de estudios, distribución, etc.), pero también construyó capacidades de datos y algoritmos que los frameworks tradicionales no contemplaban. Cuando llegó el streaming, tenían tanto el conocimiento del negocio tradicional como las herramientas digitales para redefinirlo.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Porter sigue siendo útil para entender estructura, pero es ciego a la velocidad de cambio</li>
            <li>Los ciclos de vida se han comprimido y vuelto no lineales; las industrias pueden saltar fases o resucitar súbitamente</li>
            <li>Las dinámicas no lineales y efectos de red dominan la economía digital; pequeñas ventajas se convierten en dominación total</li>
            <li>En lugar de predicciones precisas, necesitas escenarios múltiples y capacidades de respuesta rápida</li>
            <li>La estrategia efectiva combina frameworks clásicos con herramientas diseñadas para la complejidad</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Haz un análisis de 5 Fuerzas de tu industria, pero añade una sexta fuerza: 'disrupción digital potencial'</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Identifica tres escenarios posibles para tu industria en los próximos 18 meses (no 5 años)</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Lista las señales tempranas que te avisarían si tu industria está cambiando de reglas</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Evalúa qué capacidades tienes que te darían opciones en múltiples escenarios futuros</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué empresa de fuera de tu industria podría redefinir tu negocio en los próximos dos años?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué asunciones sobre tu industria podrían volverse obsoletas si cambia una sola variable clave?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tienes capacidades que te permitan responder rápido a cambios inesperados, o solo optimizas para el escenario actual?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>De las empresas incluidas en el primer análisis de Porter en 1980, más del 60% ya no existen o han perdido relevancia en sus industrias originales. Mientras tanto, las cinco empresas más valiosas del mundo en 2025 (Apple, Microsoft, Google, Amazon, Tesla) ni siquiera existían o eran irrelevantes cuando se popularizó el framework.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
