'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function TecnologiaIaPage() {
  return (
    <ChapterPage chapterId="tecnologia-ia">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          Imagina por un momento que cada vez que abres WhatsApp, Netflix o tu app bancaria, estás activando miles de sistemas interconectados que operan simultáneamente en tres continentes. No eres simplemente un usuario; eres un nodo activo en una red que procesa 2.5 quintillones de bytes de datos diariamente. Esta no es una metáfora: es la realidad sistémica de nuestro tiempo. Los sistemas tecnológicos actuales han trascendido la lógica de &#39;causa-efecto&#39; lineal que dominó el siglo XX, evolucionando hacia ecosistemas adaptativos donde un algoritmo de recomendación puede influir elecciones democráticas, donde una actualización de iOS puede impactar la economía de apps en 175 países simultáneamente, y donde la inteligencia artificial no &#39;piensa&#39; como nosotros, sino que emerge de patrones que ni sus propios creadores comprenden completamente. ¿Estamos equipados mentalmente para operar en esta realidad de complejidad exponencial?
        </p>
      </section>

      {/* Internet: El Sistema Nervioso Global de la Humanidad */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>Internet: El Sistema Nervioso Global de la Humanidad</h2>
        </div>
        <p>
          Cada segundo, mientras lees esto, 12 millones de mensajes de WhatsApp circulan por cables submarinos, satélites y torres de telecomunicaciones, creando una sinfonía de información que conecta desde un vendedor de arepas en Bogotá hasta un desarrollador de software en Barcelona. Internet ha evolucionado de ser una &#39;autopista de información&#39; hacia algo más parecido a un organismo vivo: un sistema que aprende, se adapta y evoluciona sin arquitecto central. La analogía con el sistema nervioso humano no es casual. Así como nuestras neuronas procesan información a través de sinapsis, cada router, servidor y dispositivo móvil actúa como un nodo de procesamiento que toma decisiones autónomas sobre el flujo de datos. Cuando envías un mensaje desde México hacia Argentina, no sigue una ruta predeterminada; el protocolo TCP/IP permite que cada &#39;paquete&#39; de información encuentre dinámicamente el camino más eficiente, adaptándose en tiempo real a congestiones, fallas o cambios en la red. Esta capacidad de autoorganización representa uno de los ejemplos más sofisticados de resiliencia sistémica en la historia humana. Durante el apagón de Facebook de octubre 2021, que afectó a 3.5 billones de usuarios globalmente, observamos tanto la fragilidad como la robustez de estos sistemas: mientras las plataformas de Meta colapsaron por una falla en su protocolo BGP (Border Gateway Protocol), otras redes como Telegram, Signal y hasta los servicios de SMS experimentaron aumentos exponenciales de tráfico, demostrando cómo los sistemas complejos se rebalancean automáticamente. En Latinoamérica, esta adaptabilidad ha generado innovaciones únicas. Rappi, nacida en Colombia, no se limitó a replicar modelos de delivery existentes; creó un ecosistema que conecta comercios locales, repartidores independientes, sistemas de pago digitales y algoritmos de optimización logística, adaptándose a realidades específicas como el tráfico de Bogotá, los barrios de difícil acceso en Buenos Aires o las preferencias culinarias regionales. Su expansión a 9 países latinoamericanos ilustra cómo los sistemas digitales exitosos no se &#39;escalan&#39; linealmente, sino que evolucionan orgánicamente, incorporando variables locales que los transforman en cada nuevo contexto. La verdadera complejidad de Internet emerge de sus efectos de segundo y tercer orden: algoritmos de recomendación que moldean preferencias culturales, sistemas de geolocalizacion que redefinen conceptos de privacidad, y plataformas de e-commerce que alteran patrones de consumo intergeneracionales. No estamos simplemente &#39;usando&#39; Internet; estamos co-evolucionando con él, en un proceso de adaptación mutua que redefine tanto la tecnología como nuestra humanidad.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> En marzo 2023, cuando ChatGPT experimentó interrupciones masivas, observamos un &#39;efecto rebote&#39; sistémico fascinante: Claude de Anthropic reportó aumentos de 400% en nuevos usuarios, Bing Chat experimentó sobrecargas de tráfico, y plataformas como Notion AI vieron picos de uso inusuales. Simultáneamente, en América Latina, startups como Cliengo (Argentina) ofrecieron versiones gratuitas extendidas de sus chatbots, aprovechando la ventana de oportunidad. Este episodio ilustra cómo los sistemas tecnológicos no operan en aislamiento: son ecosistemas interconectados donde la falla de un componente genera ondas de adaptación que se propagan globalmente, creando oportunidades emergentes imposibles de predecir linealmente.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>Los sistemas tecnológicos modernos exhiben propiedades emergentes: comportamientos que surgen de la interacción, no de la programación individual de componentes</li>
          <li>La complejidad sistémica se manifiesta en efectos de segundo y tercer orden que trascienden la intención original de los diseñadores</li>
          <li>Cada usuario/dispositivo es simultáneamente consumidor y productor de complejidad, generando bucles de retroalimentación impredecibles</li>
          <li>Los riesgos sistémicos en tecnología son interdependientes: pequeñas fallas pueden generar cascadas de efectos desproporcionados</li>
          <li>La resiliencia tecnológica emerge de la diversidad y redundancia, no de la eficiencia optimizada en un solo parámetro</li>
          <li>Los sistemas digitales co-evolucionan con contextos culturales, creando variaciones locales de fenómenos globales</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Documenta tu &#39;red de dependencias digitales&#39; durante una semana: anota cada app, plataforma y servicio digital que usas, identificando qué sucedería si cada uno fallara simultáneamente</li>
          <li>Practica &#39;seguimiento de efectos&#39;: la próxima vez que un sistema digital falle (una app, un servicio), observa activamente las adaptaciones que realizas y cómo otros sistemas compensan automáticamente</li>
          <li>Implementa &#39;redundancia consciente&#39; en un área crítica de tu trabajo: identifica una herramienta digital de la cual dependes completamente y establece al menos dos alternativas funcionales</li>
          <li>Experimenta con &#39;desconexión sistémica&#39;: dedica 4 horas semanales a actividades completamente offline, observando qué procesos mentales y hábitos emergen en ausencia de sistemas digitales</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿En qué momentos mi relación con la tecnología pasa de ser instrumental (usar herramientas) a sistémica (formar parte de un ecosistema más amplio)?</li>
          <li>¿Cómo han evolucionado mis patrones de pensamiento y toma de decisiones desde que adopté sistemas de inteligencia artificial como ChatGPT o asistentes virtuales?</li>
          <li>¿Qué capacidades humanas estoy potenciando versus cuáles estoy delegando a sistemas tecnológicos, y cómo afecta esto mi autonomía cognitiva?</li>
          <li>¿De qué manera los algoritmos de recomendación (YouTube, Spotify, Instagram) han influenciado mis preferencias sin que me diera cuenta conscientemente?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          En 2024, investigadores del MIT descubrieron que los patrones de comunicación entre modelos de IA (como cuando GPT-4 &#39;conversa&#39; con Claude) generan estructuras informacionales similares a las redes de comunicación entre colonias de hormigas: ambos sistemas desarrollan &#39;protocolos emergentes&#39; que optimizan el flujo de información sin coordinación centralizada. Más fascinante aún: estos patrones aparecen independientemente del contenido específico de la comunicación, sugiriendo que la inteligencia distribuida sigue principios universales que trascienden el sustrato biológico o digital.
        </p>
      </div>
    </ChapterPage>
  );
}
