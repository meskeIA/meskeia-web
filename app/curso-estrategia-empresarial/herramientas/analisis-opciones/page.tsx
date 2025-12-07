'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function AnalisisOpcionesPage() {
  return (
    <ChapterPage chapterId="analisis-opciones">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            Cuando fundé mi primera startup en 2018, pasé semanas perfeccionando un análisis SWOT. Fortalezas, debilidades, oportunidades, amenazas... todo muy ordenado en su matriz de 2x2. Tres meses después, un competidor que ni siquiera estaba en nuestro radar lanzó una solución basada en IA que hizo obsoleto nuestro producto. El SWOT no me había preparado para eso. La realidad es que los frameworks de los 80 asumen un mundo predecible donde puedes catalogar amenazas y oportunidades. En 2025, la velocidad de cambio hace que esa predictibilidad sea una ilusión peligrosa. Necesitamos herramientas que nos ayuden a tomar decisiones inteligentes con información incompleta, mantener opciones abiertas y adaptarnos rápido cuando las cosas cambian. Este capítulo te muestra cómo.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Por qué el SWOT tradicional ya no funciona</h2>
          <div className={styles.sectionContent}>
            <p>El análisis SWOT fue diseñado para un mundo donde las industrias cambiaban lentamente y los competidores eran conocidos. Hoy, sus limitaciones son evidentes: primero, es estático en un mundo dinámico. Una fortaleza hoy puede ser irrelevante mañana (pregunta a Nokia sobre su 'superior hardware'). Segundo, no captura la velocidad del cambio. Tesla no aparecía en el SWOT de BMW en 2010, pero en 2020 ya valía más que BMW, Audi y Mercedes juntas. Tercero, trata las amenazas como externas y controlables, cuando la mayor amenaza suele venir de donde menos lo esperas. Cuarto, fomenta el pensamiento lineal: si tengo esta fortaleza, debería hacer esto. Pero en entornos de alta incertidumbre, mantener opciones abiertas es más valioso que optimizar una sola dirección. El SWOT te da la ilusión de control y claridad cuando lo que realmente necesitas es flexibilidad y velocidad de respuesta.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Blockbuster en 2005 tenía fortalezas claras: 9.000 tiendas, marca reconocida, acuerdos con estudios. Sus amenazas parecían manejables: algún competidor online pequeño como Netflix. Su SWOT sugería expandir las tiendas físicas. Pero no capturó la velocidad de adopción del streaming ni cómo Netflix usaría los datos de visualización para crear contenido original. En 5 años, Blockbuster quebró.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Pensamiento en opciones reales: mantén varias cartas en la mano</h2>
          <div className={styles.sectionContent}>
            <p>En lugar de apostar todo a una estrategia, piensa como un inversor en opciones financieras. Una opción te da el derecho, pero no la obligación, de hacer algo en el futuro. En estrategia, esto significa hacer pequeñas inversiones que te mantengan varias puertas abiertas. Amazon no decidió de golpe ser líder en cloud computing; empezó resolviendo sus propios problemas de infraestructura, luego vio la oportunidad y dobló la apuesta. Google no planificó dominar la publicidad online; experimentó con AdWords, vio que funcionaba, y escaló. La clave es hacer experimentos baratos que te den información valiosa. Si funciona, inviertes más. Si no, cortas rápido y pruebas otra cosa. Esto requiere un cambio mental: de 'planificar y ejecutar' a 'experimentar y aprender'. En mercados inciertos, la capacidad de pivotar vale más que la eficiencia operativa.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Shopify comenzó como una tienda online de equipos de snowboard que sus fundadores crearon porque no encontraban una plataforma de e-commerce que les gustara. Al ver que otros querían usar su tecnología, mantuvieron ambas opciones: la tienda física y el software. Cuando vieron tracción en el software, cerraron la tienda y se enfocaron en la plataforma. Hoy Shopify vale más de 60.000 millones de dólares.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Matriz de decisiones bajo incertidumbre</h2>
          <div className={styles.sectionContent}>
            <p>Cuando no puedes predecir el futuro, puedes al menos estructurar tus opciones. La matriz de decisiones evalúa cada opción estratégica en diferentes escenarios futuros. Primero, define 3-4 escenarios plausibles (no solo el optimista y pesimista). Segundo, lista tus opciones estratégicas principales. Tercero, evalúa cómo le iría a cada opción en cada escenario. No necesitas números exactos; usa escalas simples (muy bien, bien, mal, muy mal). Cuarto, identifica opciones 'robustas' que funcionan decentemente en la mayoría de escenarios, y opciones 'asimétricas' que pueden fallar en algunos casos pero tienen un potencial enorme en otros. La decisión final depende de tu tolerancia al riesgo y recursos disponibles. Esta herramienta no te dice qué hacer, pero sí te obliga a pensar sistemáticamente sobre futuros alternativos.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Una empresa de formación presencial en 2019 podría haber evaluado escenarios: 1) Crecimiento normal, 2) Recesión económica, 3) Disrupción tecnológica, 4) Crisis sanitaria. Las opciones: seguir solo presencial, invertir en online, modelo híbrido, o vender la empresa. El análisis habría mostrado que el modelo híbrido era robusto en todos los escenarios, mientras que solo presencial era muy vulnerable al escenario 4, que efectivamente ocurrió con COVID-19.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Análisis de escenarios práctico: más allá del 'y si...'</h2>
          <div className={styles.sectionContent}>
            <p>Los escenarios no son predicciones; son herramientas para expandir tu perspectiva y prepararte para diferentes futuros. Un buen análisis de escenarios combina tendencias observables con discontinuidades posibles. Empieza identificando las 2-3 variables clave que más impactan tu negocio (demanda, regulación, tecnología, competencia). Luego crea escenarios combinando diferentes estados de estas variables. Hazlos específicos: no 'la economía va mal', sino 'inflación al 8%, tipos de interés al 6%, desempleo al 12%'. Para cada escenario, pregúntate: ¿cómo cambiaría el comportamiento de mis clientes? ¿Qué nuevos competidores podrían aparecer? ¿Qué capacidades necesitaría? El valor no está en acertar el escenario correcto, sino en haber pensado las implicaciones de cada uno. Cuando algo cambia, ya tienes un marco mental para responder rápido.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Netflix en 2010 modeló escenarios sobre el futuro del entretenimiento: 1) TV tradicional sigue dominando, 2) Streaming crece gradualmente, 3) Streaming se vuelve mainstream, 4) Contenido original se vuelve clave. Prepararon estrategias para cada uno: licenciar más contenido, invertir en tecnología, crear contenido propio. Cuando el escenario 4 se materializó, ya tenían ventaja con House of Cards y Orange is the New Black.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Herramientas ágiles para PYMEs y emprendedores</h2>
          <div className={styles.sectionContent}>
            <p>Las grandes consultoras cobran millones por análisis estratégicos que tardan meses. Tú no tienes ese tiempo ni dinero. Necesitas herramientas rápidas y efectivas. El 'Strategy Canvas' de 15 minutos: dibuja un eje con tus principales decisiones estratégicas y otro con el nivel de certeza que tienes sobre cada una. Las decisiones con alta certeza, ejecútalas ya. Las de baja certeza, conviértelas en experimentos baratos. La 'Regla del 10-10-10': ¿cómo me sentiré sobre esta decisión en 10 minutos, 10 meses y 10 años? Te ayuda a balancear urgencia con perspectiva. El 'Pre-mortem': imagina que tu estrategia fracasó rotundamente. ¿Qué salió mal? Esto te ayuda a identificar riesgos que no ves cuando estás optimista. Usa estas herramientas regularmente, no solo en crisis. La estrategia no es un evento anual; es un músculo que ejercitas constantemente.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Brian Chesky de Airbnb usa una versión del pre-mortem que llama '¿Qué nos mataría?'. Cada trimestre, el equipo directivo dedica una sesión a imaginar cómo podría fracasar Airbnb: regulación hostil, competidores con más recursos, cambios en comportamiento del consumidor, crisis de confianza. Para cada 'amenaza de muerte', desarrollan planes de contingencia. Esta práctica les ha ayudado a navegar crisis como COVID-19 o regulaciones restrictivas en ciudades clave.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>El SWOT tradicional asume predictibilidad que ya no existe en la mayoría de industrias</li>
            <li>Mantener opciones abiertas vale más que optimizar una sola estrategia en entornos inciertos</li>
            <li>Los escenarios no predicen el futuro, pero preparan tu mente para responder rápido cuando cambia</li>
            <li>Las decisiones estratégicas se toman mejor con herramientas simples usadas frecuentemente que con análisis complejos hechos una vez al año</li>
            <li>En mercados volátiles, la velocidad de respuesta supera a la planificación perfecta</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Haz un inventario de tus 'opciones estratégicas' actuales: ¿qué experimentos baratos podrías lanzar esta semana?</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Define 3-4 escenarios plausibles para tu industria en los próximos 2 años y evalúa cómo afectarían a tu negocio</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Programa 30 minutos mensuales para hacer un 'pre-mortem' de tus decisiones estratégicas principales</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Identifica las 2-3 variables clave que más impactan tu negocio y crea alertas para monitorizarlas semanalmente</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué fortalezas de tu negocio podrían volverse irrelevantes en los próximos 2 años y cómo te prepararías?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cuál sería tu respuesta si tu principal competidor desapareciera mañana o si apareciera uno completamente nuevo?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué pequeños experimentos podrías hacer hoy que te mantendrían opciones abiertas para futuros inciertos?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>Las empresas que sobreviven crisis no son las que mejor planifican, sino las que mantienen más efectivo y opciones abiertas. Durante la crisis de 2008, las empresas con mayor liquidez no solo sobrevivieron mejor, sino que compraron activos baratos de competidores menos preparados. Amazon, por ejemplo, usó la crisis para acelerar su expansión internacional mientras otros recortaban inversiones.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
