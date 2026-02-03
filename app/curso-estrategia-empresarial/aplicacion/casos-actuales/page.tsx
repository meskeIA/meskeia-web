'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function CasosActualesPage() {
  return (
    <ChapterPage chapterId="casos-actuales">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            La estrategia empresarial se entiende mejor viendo cómo actúan las empresas que están ganando ahora mismo. No hablemos de teorías abstractas: analicemos las decisiones reales de OpenAI, Tesla, Amazon e Inditex. Estas empresas no siguen los manuales clásicos al pie de la letra. Han desarrollado enfoques únicos que les permiten competir en un mundo donde las reglas cambian constantemente. Estudiar sus movimientos nos da pistas sobre qué funciona realmente cuando la incertidumbre es la norma y la velocidad lo es todo.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>OpenAI vs. Anthropic: Dos Filosofías Estratégicas</h2>
          <div className={styles.sectionContent}>
            <p>OpenAI y Anthropic representan dos enfoques completamente distintos para competir en IA generativa. OpenAI eligió la estrategia de 'move fast and break things': lanzar rápido, capturar mercado, iterar sobre la marcha. ChatGPT se lanzó sin estar 'perfecto', pero consiguió 100 millones de usuarios en dos meses. Su filosofía: es mejor tener el 70% del mercado con un producto al 80% que el 10% del mercado con un producto al 95%. Anthropic, fundada por ex-empleados de OpenAI, apostó por el enfoque contrario: seguridad primero, desarrollo más lento pero más responsable. Claude se posiciona como la alternativa 'segura' y 'ética'. Ambas estrategias pueden ser correctas, pero requieren capacidades organizacionales muy diferentes. OpenAI necesita velocidad y tolerancia al riesgo; Anthropic necesita rigor técnico y paciencia para construir confianza.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cuando OpenAI lanzó GPT-4, Anthropic tardó meses más en lanzar Claude 3, pero lo hizo con mejores salvaguardas de seguridad. OpenAI ganó cuota de mercado, Anthropic ganó contratos empresariales que priorizan la seguridad. Dos estrategias, dos resultados válidos.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Tesla vs. Fabricantes Tradicionales: Disrupción desde Fuera</h2>
          <div className={styles.sectionContent}>
            <p>Tesla no ganó por hacer coches eléctricos mejores que los tradicionales. Ganó porque redefinió qué es un coche. Mientras BMW y Mercedes pensaban en 'electrificar' sus modelos existentes, Tesla construyó un 'ordenador con ruedas'. Su ventaja no está en las baterías (que compra a Panasonic), sino en el software, los datos y la experiencia del usuario. Tesla actualiza sus coches por WiFi, como tu móvil. Recoge datos de conducción de millones de kilómetros para entrenar su piloto automático. Ha convertido la compra de un coche en una experiencia tipo Apple Store. Los fabricantes tradicionales siguen pensando en términos de 'modelo 2024' vs 'modelo 2025', mientras Tesla piensa en iteraciones continuas. La lección: cuando una industria madura se enfrenta a disrupción, el peligro no viene de competidores que hacen lo mismo un poco mejor, sino de quienes cambian las reglas del juego.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>En 2023, Tesla tenía márgenes del 20% por coche mientras los fabricantes tradicionales luchaban por conseguir un 5%. La diferencia no está en los costes de fabricación, sino en que Tesla vende software y servicios además del hardware.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Amazon: La Estrategia del 'Day 1'</h2>
          <div className={styles.sectionContent}>
            <p>Jeff Bezos popularizó el concepto 'Day 1': Amazon debe actuar siempre como si fuera su primer día, manteniendo la mentalidad de startup independientemente de su tamaño. Esto significa obsesión por el cliente por encima de la competencia, pensamiento a largo plazo, y voluntad de experimentar y fallar. Amazon lanza cientos de productos y servicios cada año; la mayoría fracasan, pero los éxitos (AWS, Prime, Alexa) más que compensan los fracasos. Su estrategia no es planificar el futuro perfecto, sino crear opciones y mantener la capacidad de pivotar rápidamente. AWS nació como un 'proyecto interno' para resolver sus propios problemas de infraestructura; hoy genera más beneficios que todo el negocio de retail. Esta mentalidad 'Day 1' les permite competir simultáneamente en retail, cloud, publicidad, entretenimiento y logística sin perder foco.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Amazon Fire Phone fue un fracaso épico en 2014, perdiendo cientos de millones. Pero los aprendizajes de ese fracaso alimentaron el desarrollo de Alexa y Echo, que dominan el mercado de asistentes de voz. Fracaso táctico, éxito estratégico.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Inditex: El Modelo Único Español</h2>
          <div className={styles.sectionContent}>
            <p>Inditex (Zara, Massimo Dutti, Pull&Bear) ha conseguido algo que parecía imposible: competir globalmente en moda desde España. Su secreto no está en diseño superior o precios más bajos, sino en velocidad de respuesta. Mientras la industria tradicional planifica colecciones con 6-12 meses de antelación, Zara puede tener una prenda en tienda en 2-3 semanas desde el concepto inicial. Esto les permite 'copiar' tendencias de pasarelas y redes sociales casi en tiempo real. Su estrategia de integración vertical (controlan diseño, producción, distribución y venta) era considerada 'obsoleta' por los expertos, pero les da una flexibilidad que sus competidores no tienen. Además, producen en lotes pequeños deliberadamente: si algo no se vende, las pérdidas son mínimas; si se vende bien, pueden reaccionar rápido. Han convertido la escasez en una ventaja competitiva.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cuando Zara ve que un tipo de vestido se agota rápidamente en Madrid y Milán, puede tener más unidades en esas tiendas en una semana. H&M, con su modelo de producción en Asia, tardaría meses en reaccionar.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Tu Propia Estrategia: Framework de Síntesis</h2>
          <div className={styles.sectionContent}>
            <p>Después de estudiar estos casos, ¿cómo defines tu propia estrategia? Primero, identifica tu 'superpoder único': qué puedes hacer que tus competidores no pueden copiar fácilmente. OpenAI tiene velocidad de ejecución, Tesla tiene integración software-hardware, Amazon tiene obsesión por el cliente, Inditex tiene velocidad de respuesta. Segundo, decide tu filosofía de riesgo: ¿prefieres fallar rápido y barato (OpenAI) o construir lento y seguro (Anthropic)? Tercero, identifica dónde puedes crear loops de feedback: datos, aprendizaje, mejora continua. Cuarto, mantén optionalidad: no pongas todos los huevos en una cesta. Quinto, define qué NO vas a hacer: la estrategia es tanto sobre decir no como sobre decir sí. Tu estrategia no tiene que ser revolucionaria, pero sí tiene que ser coherente con tus capacidades y sostenible en el tiempo.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Una consultoría pequeña podría elegir especializarse en un nicho muy específico (ej: transformación digital para clínicas dentales), desarrollar metodologías propias, y crear contenido educativo que atraiga clientes. Su 'superpoder' sería conocimiento profundo del sector, no tamaño o recursos.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>La velocidad de ejecución puede ser más valiosa que la perfección del producto</li>
            <li>Los disruptores cambian las reglas del juego, no juegan mejor con las reglas existentes</li>
            <li>Mantener mentalidad de startup es más importante que el tamaño de la empresa</li>
            <li>La integración vertical puede ser una ventaja competitiva en la era de la velocidad</li>
            <li>Tu estrategia debe ser coherente con tus capacidades únicas, no copiar lo que funciona para otros</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Identifica cuál es tu 'superpoder único' como empresa o profesional</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Analiza a un competidor que esté ganando en tu sector: ¿qué hace diferente?</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Define qué tres cosas NO vas a hacer para mantener el foco estratégico</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Diseña un experimento pequeño para probar una nueva dirección estratégica</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>Si tuvieras que reinventar tu industria desde cero, ¿qué harías diferente?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Estás optimizando un modelo que puede volverse obsoleto o construyendo el futuro?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué datos o feedback loops podrías crear para mejorar continuamente tu propuesta de valor?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Amazon perdió dinero durante sus primeros 7 años como empresa pública (1997-2003), pero su estrategia a largo plazo les ha convertido en una de las empresas más valiosas del mundo. A veces, la paciencia estratégica es más valiosa que la rentabilidad inmediata.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
