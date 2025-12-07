'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function PensamientoSistemicoVidaPage() {
  return (
    <ChapterPage chapterId="pensamiento-sistemico-vida">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          ¿Y si cada decisión que tomas fuera en realidad una intervención en un sistema complejo que no puedes ver completamente? Mientras navegas por tu día - desde elegir qué aplicación abrir al despertar hasta decidir cómo responder un email tenso - estás participando en una red de interacciones que se extiende mucho más allá de tu percepción inmediata. La pandemia de 2020 nos demostró de manera brutal cómo un evento microscópico en Wuhan podía paralizar economías globales en semanas, pero también reveló algo más profundo: vivimos en un mundo donde la comprensión sistémica ya no es una ventaja competitiva, sino una habilidad de supervivencia básica.
        </p>
      </section>

      {/* Tu Vida como Sistema Dinámico y Adaptativo */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔄</span>
          <h2 className={styles.sectionTitleText}>Tu Vida como Sistema Dinámico y Adaptativo</h2>
        </div>
        <p>
          Tu existencia no es una línea recta de causa y efecto, sino una red compleja de bucles interconectados que se autoorganiza constantemente. Piensa en cómo funciona tu smartphone: no es solo la suma de sus componentes, sino las interacciones emergentes entre hardware, software, datos y tu comportamiento las que crean la experiencia. De la misma manera, tu vida personal y profesional opera como un sistema adaptativo complejo donde pequeñas modificaciones pueden generar transformaciones exponenciales e impredecibles.</p>
        <p></p>
        <p>Considerar el caso de Ángela, directora de marketing en una empresa mexicana que, en marzo de 2020, decidió aprender Python durante el confinamiento. Esta decisión aparentemente personal desencadenó una cascada sistémica: automatizó procesos rutinarios en su trabajo, lo que liberó tiempo para estrategias más creativas, mejoró los resultados de su equipo, ganó reconocimiento interno, fue promovida a Chief Data Officer, y eventualmente fundó su propia consultora de marketing basado en datos. Cada elemento se retroalimentó con los otros, creando un patrón emergente que ella no había planificado conscientemente.</p>
        <p></p>
        <p>La ciencia de redes nos enseña que los sistemas vivos - incluida tu carrera profesional - exhiben propiedades emergentes que no pueden predecirse analizando componentes aislados. Tu red de contactos profesionales no es simplemente una lista de nombres en LinkedIn; es un ecosistema dinámico donde la fortaleza de vínculos débiles puede ser más valiosa que las conexiones obvias. Mark Granovetter demostró que el 70% de las oportunidades laborales llegan a través de conocidos casuales, no de contactos cercanos, porque estos vínculos débiles actúan como puentes entre diferentes clusters de información.</p>
        <p></p>
        <p>La adaptabilidad sistémica requiere desarrollar lo que los investigadores llaman &#39;sensibilidad al contexto&#39;: la capacidad de detectar patrones emergentes antes de que se vuelvan obvios. Durante 2023, profesionales que notaron tempranamente el impacto de herramientas como ChatGPT no solo adoptaron la tecnología, sino que rediseñaron fundamentalmente sus flujos de trabajo. No se trataba de usar IA como una calculadora más sofisticada, sino de reconceptualizar cómo crear valor en un ecosistema donde la inteligencia artificial amplifica capacidades humanas específicas.
        </p>

        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> El meteórico crecimiento de Mercado Libre durante 2020-2023 ilustra perfectamente la innovación sistémica. Cuando la pandemia cerró comercios físicos, la empresa no solo escaló su plataforma de e-commerce; simultáneamente expandió Mercado Pago como ecosistema financiero, lanzó Mercado Envíos para logística, desarrolló Mercado Crédito para financiamiento, y creó Mercado Ads para publicidad digital. Cada servicio se retroalimentaba con los otros, creando un ecosistema donde el valor total superaba exponencialmente la suma de las partes individuales. Para 2024, habían transformado el concepto mismo de comercio digital en América Latina.
          </p>
        </div>
      </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
          <li>Tu vida opera como un sistema adaptativo complejo, no como una secuencia predecible de eventos lineales</li>
          <li>Los vínculos débiles en tu red profesional suelen generar más oportunidades que las conexiones obvias</li>
          <li>La sensibilidad al contexto - detectar patrones emergentes tempranamente - es más valiosa que la planificación rígida</li>
          <li>Pequeñas intervenciones consistentes pueden generar transformaciones sistémicas exponenciales</li>
          <li>La emergencia sistémica significa que el valor total de tus actividades interconectadas supera la suma de partes individuales</li>
          <li>La adaptabilidad requiere mantener múltiples opciones abiertas en lugar de optimizar para un solo resultado</li>
        </ul>
      </div>

      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
          <li>Durante los próximos 7 días, documenta una decisión diaria aparentemente menor y rastrea al menos 3 efectos no obvios que genera en diferentes áreas de tu vida</li>
          <li>Mapea tu red profesional identificando específicamente 5 vínculos débiles (personas que ves/hablas menos de una vez al mes) y programa una conversación de 15 minutos con cada uno durante las próximas 3 semanas</li>
          <li>Identifica un proceso rutinario en tu trabajo que realizas semanalmente y experimenta modificando deliberadamente un solo elemento para observar cómo afecta el sistema completo</li>
          <li>Establece un &#39;radar de patrones emergentes&#39;: dedica 10 minutos cada viernes a identificar 3 tendencias, conversaciones o cambios sutiles en tu campo profesional que aún no son mainstream</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
          <li>¿Cuáles son los bucles de retroalimentación más poderosos en mi vida profesional actual, y cómo puedo fortalecerlos intencionalmente?</li>
          <li>¿Qué vínculos débiles en mi red han generado las oportunidades más inesperadas en los últimos dos años?</li>
          <li>¿En qué situaciones tiendo a buscar control directo cuando sería más efectivo influir indirectamente en el sistema?</li>
          <li>¿Cómo mis rutinas diarias están creando patrones emergentes que aún no reconozco completamente?</li>
          <li>¿Qué capacidades estoy desarrollando que podrían combinarse de maneras no obvias para crear valor emergente?</li>
        </ol>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          Investigadores de la Universidad de Barcelona descubrieron en 2024 que las personas que practican &#39;pensamiento sistémico&#39; muestran patrones de activación neuronal únicos en la corteza prefrontal: sus cerebros literalmente procesan información de manera más interconectada, creando más puentes entre diferentes regiones cerebrales. Esto sugiere que el pensamiento sistémico no es solo una herramienta conceptual, sino que puede reconfigurar físicamente cómo procesamos la realidad compleja.
        </p>
      </div>
    </ChapterPage>
  );
}
