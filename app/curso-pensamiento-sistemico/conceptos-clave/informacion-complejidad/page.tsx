'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function InformacionComplejidadPage() {
  return (
    <ChapterPage chapterId="informacion-complejidad">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          ¿Sabías que cuando Netflix cambió su algoritmo de recomendaciones en 2018, no solo alteró los hábitos de entretenimiento de 200 millones de usuarios, sino que modificó la producción cinematográfica mundial? Esta es la naturaleza del pensamiento sistémico en acción: reconocer que en un universo hiperconectado, cada decisión es simultáneamente causa y efecto de múltiples realidades interconectadas. Ya no podemos pensar en silos cuando WhatsApp procesa 100 mil millones de mensajes diarios, TikTok redefine culturas juveniles globales cada 15 segundos, y una startup en Medellín puede disrumpir industrias tradicionales de tres continentes. Bienvenido al pensamiento sistémico: la brújula cognitiva para navegar la complejidad exponencial del siglo XXI.
        </p>
      </section>

      {/* Información Cuántica: Cuando los Datos se Vuelven Arquitectos de Realidad */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>Información Cuántica: Cuando los Datos se Vuelven Arquitectos de Realidad</h2>
        </div>
        <p>
          Imagina por un momento que cada Like en Instagram no es solo una interacción social, sino una instrucción de construcción de realidad. Porque eso es exactamente lo que sucede: cada micro-acción digital alimenta algoritmos que reconfiguran la experiencia de millones de personas en tiempo real. La información ha evolucionado de ser un simple recurso a convertirse en el ADN de la complejidad moderna, donde cada bit de datos contiene el potencial de alterar ecosistemas completos.</p>
        <p></p>
        <p>Consideremos el fenómeno de MercadoLibre durante el Black Friday 2023. No fue simplemente una plataforma procesando transacciones; fue un sistema nervioso continental donde 40 millones de compradores, 300,000 vendedores, sistemas logísticos, algoritmos de pricing dinámico, y tendencias sociales convergieron en un ballet de complejidad. Cada búsqueda de producto generaba ondas de información que ajustaban precios, reposicionaban inventarios, modificaban estrategias de marketing y alteraban las decisiones de compra de usuarios que ni siquiera habían ingresado a la plataforma. Esta es la información como arquitecta: no registra la realidad, la construye.</p>
        <p></p>
        <p>La verdadera revolución no está en la cantidad de datos (big data), sino en la velocidad de retroalimentación (fast data). Cuando Rappi ajusta sus tarifas de delivery en Bogotá cada 3 minutos basándose en patrones de tráfico, demanda en tiempo real, y comportamiento histórico, está participando en un ecosistema donde la información se ha vuelto líquida, adaptativa, inteligente. Ya no hablamos de bases de datos, sino de flujos de información que aprenden, evolucionan y toman decisiones autónomas.</p>
        <p></p>
        <p>Pero aquí está el insight crítico que la mayoría pasa por alto: la información compleja no solo responde a patrones, los crea. Cuando Spotify descubrió que las canciones con ciertos patrones rítmicos aumentaban la probabilidad de ejercicio matutino en usuarios latinoamericanos, no solo personalizó playlists, sino que influyó en la producción musical global. Los compositores comenzaron a incorporar estos elementos, las discográficas ajustaron sus estrategias de lanzamiento, y hasta los gimnasios modificaron sus ambientes sonoros. Un algoritmo de recomendación se convirtió en un agente cultural transformador.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> En marzo 2024, cuando la fintech colombiana Nubank detectó patrones anómalos en transacciones durante el eclipse solar, no encontró fraude, sino un nuevo comportamiento: miles de usuarios realizaban micro-donaciones simultáneas a causas ambientales durante el fenómeno astronómico. Esta &#39;señal débil&#39; llevó a la empresa a desarrollar &#39;Nubank Verde&#39;, una función que permite donaciones automáticas vinculadas a eventos climáticos, generando $2.3 millones en contribuciones ambientales en su primer trimestre y redefiniendo la relación entre astronomía, consciencia ambiental y tecnología financiera.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>La información contemporánea no describe la realidad, la construye activamente a través de bucles de retroalimentación instantáneos</li>
          <li>Los sistemas complejos modernos funcionan como organismos vivos: cada elemento modifica y es modificado por el conjunto de manera no lineal</li>
          <li>La complejidad emergente surge cuando las interacciones entre componentes generan comportamientos que ningún elemento individual podría producir</li>
          <li>En ecosistemas hiperconectados, la adaptabilidad vale más que la planificación: las organizaciones resilientes son aquellas que evolucionan en tiempo real</li>
          <li>La incertidumbre no es un bug del sistema, es una feature: representa el espacio de posibilidades donde emergen las innovaciones más disruptivas</li>
          <li>Los patrones de información revelan futuros emergentes antes de que se materialicen en tendencias visibles</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Implementa un &#39;Dashboard de Señales Débiles&#39;: dedica 20 minutos semanales a monitorear anomalías en tus métricas habituales (conversaciones inusuales de clientes, patrones de comportamiento atípicos, correlaciones inesperadas entre variables). Documenta estas anomalías durante 30 días y busca patrones emergentes</li>
          <li>Practica &#39;Cartografía de Interacciones Ocultas&#39;: elige un proyecto actual y mapea visualmente no solo los stakeholders obvios, sino las conexiones de segundo y tercer grado. ¿Cómo afecta tu decisión a usuarios que nunca interactúan directamente contigo? Identifica al menos 3 conexiones no obvias esta semana</li>
          <li>Desarrolla tu &#39;Protocolo de Adaptación 48-Horas&#39;: diseña un framework personal de 5 pasos que puedas activar cuando detectes cambios significativos en tu entorno. Incluye: (1) pausa reflexiva, (2) mapeo de nuevas variables, (3) identificación de oportunidades ocultas, (4) prototipo de respuesta, (5) implementación experimental. Pruébalo con la próxima &#39;sorpresa&#39; que enfrentes</li>
          <li>Construye tu &#39;Red de Sensores Humanos&#39;: identifica 5 personas en diferentes industrias/geografías/generaciones que puedan alertarte sobre tendencias emergentes. Programa conversaciones mensuales de 15 minutos enfocadas únicamente en &#39;qué está cambiando&#39; en sus mundos</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>Si tu organización fuera un ecosistema biológico, ¿qué especie sería cada departamento y cómo están evolucionando las relaciones simbióticas entre ellos? ¿Hay especies en extinción o nuevas especies emergiendo?</li>
          <li>¿Qué información estás tratando como &#39;ruido&#39; que en realidad podría ser una señal de un futuro emergente? ¿Cómo cambiarían tus decisiones si esa &#39;anomalía&#39; fuera en realidad el patrón dominante del mañana?</li>
          <li>Imagina que pudieras ver las &#39;conexiones invisibles&#39; de tu proyecto como una red neuronal iluminada: ¿qué nodos están sobrecargados, cuáles desconectados, y dónde están emergiendo nuevas sinapsis que nadie ha notado?</li>
          <li>¿Qué pasaría si en lugar de resistir la incertidumbre, la usaras como materia prima para la innovación? ¿Cómo rediseñarías tu estrategia si la volatilidad fuera tu ventaja competitiva principal?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          En 2024, investigadores del Instituto Tecnológico de Monterrey descubrieron que los sistemas complejos pueden &#39;recordar&#39; estados anteriores a través de lo que denominaron &#39;memoria distribuida&#39;: cuando Netflix reintrodujo series canceladas años atrás, los algoritmos no solo recuperaron patrones de visualización históricos, sino que predijeron con 89% de precisión qué audiencias serían receptivas, sugiriendo que los sistemas digitales desarrollan una forma de &#39;nostalgia algorítmica&#39; que puede anticipar ciclos culturales de hasta 15 años.
        </p>
      </div>
    </ChapterPage>
  );
}
