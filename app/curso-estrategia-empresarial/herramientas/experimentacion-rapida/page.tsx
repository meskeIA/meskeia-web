'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function ExperimentacionRapidaPage() {
  return (
    <ChapterPage chapterId="experimentacion-rapida">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            Tu competidor más peligroso no es quien conoces, sino quien está experimentando en silencio. Mientras tú perfeccionas tu plan de negocio de 40 páginas, alguien está lanzando su décima versión mejorada. La diferencia entre planificar y experimentar no es filosófica: es supervivencia. Netflix no planificó ser una empresa de streaming en 1997, lo descubrió experimentando. Airbnb no sabía que revolucionaría la hostelería cuando alquilaron tres colchones inflables. La estrategia moderna no es predecir el futuro, es construirlo iteración a iteración.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El mito del plan de negocio perfecto</h2>
          <div className={styles.sectionContent}>
            <p>El plan de negocio tradicional asume que puedes predecir el futuro. Es una ficción peligrosa. Las mejores empresas actuales no se parecen en nada a su plan original. Twitter empezó como plataforma de podcasting (Odeo). Instagram era una app de check-in llamada Burbn. Slack surgió de un videojuego fallido. El problema no es que estos emprendedores fueran malos planificando, sino que el mercado cambió más rápido que sus predicciones. Un plan detallado te da falsa seguridad y te hace inflexible. En 2025, la velocidad de cambio hace que cualquier plan de más de 6 meses sea especulación. El plan perfecto es el enemigo de la acción imperfecta. No necesitas saber el destino final, necesitas saber el siguiente paso.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Drew Houston de Dropbox no escribió un plan de negocio de 50 páginas. Grabó un video de 3 minutos mostrando cómo funcionaría el producto (que aún no existía) y lo subió a Hacker News. En una noche obtuvo 75.000 registros. Ese experimento de una noche validó más que cualquier estudio de mercado tradicional.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Lean Strategy: de hipótesis a realidad</h2>
          <div className={styles.sectionContent}>
            <p>La estrategia lean convierte tus suposiciones en experimentos medibles. Cada decisión estratégica es una hipótesis que puedes validar o refutar rápidamente. En lugar de 'creemos que el mercado quiere X', dices 'hipótesis: el 15% de nuestros usuarios pagará por la funcionalidad Y en 30 días'. Defines métricas claras, ejecutas el experimento, mides resultados, aprendes y decides: continuar, pivotar o parar. Este enfoque no es solo para startups. Amazon usa esto constantemente: lanza servicios en beta, mide tracción real, escala los exitosos y mata los que no funcionan. La clave está en hacer experimentos baratos y rápidos antes de comprometer recursos grandes.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Buffer empezó como una simple landing page que decía 'programa tus tweets'. Cuando la gente hacía clic en 'empezar', aparecía un mensaje: 'estamos construyendo Buffer, déjanos tu email'. Sin escribir una línea de código, validaron que había demanda. Solo entonces construyeron el producto.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>MVPs estratégicos: el arte de hacer menos</h2>
          <div className={styles.sectionContent}>
            <p>Un MVP estratégico no es una versión cutre de tu visión final, es la forma más barata de aprender algo crítico sobre tu mercado. No se trata de construir rápido y mal, sino de identificar qué necesitas saber y diseñar el experimento mínimo para aprenderlo. ¿Tu hipótesis es que la gente pagará por tu servicio? No necesitas la app completa, necesitas validar disposición de pago. ¿Crees que hay demanda en un segmento específico? Haz marketing directo antes de construir nada. El MVP estratégico responde una pregunta específica con el menor esfuerzo posible. Cada iteración debe enseñarte algo que no sabías y acercarte a un modelo de negocio viable.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Zappos empezó sin inventario. El fundador iba a tiendas de zapatos, fotografiaba productos, los subía a su web. Cuando alguien compraba, él iba a la tienda, compraba los zapatos y los enviaba. Perdía dinero en cada venta, pero aprendió que la gente sí compraría zapatos online, algo que nadie sabía en 1999.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Fail fast, learn faster: la ventaja del fracaso rápido</h2>
          <div className={styles.sectionContent}>
            <p>El fracaso rápido no es un objetivo, es una herramienta. Cuanto antes descubras que algo no funciona, menos recursos desperdicias y más opciones mantienes abiertas. La mayoría de empresas fracasan lentamente, quemando tiempo y dinero en algo que no tiene futuro. Las empresas exitosas fracasan rápido en cosas pequeñas para tener éxito en cosas grandes. Google mata productos constantemente (Google+, Google Glass, Google Wave) porque prefiere fallar rápido que mantener zombis. Cada fracaso rápido libera recursos para el siguiente experimento. La clave está en definir criterios claros de éxito/fracaso antes de empezar y respetarlos aunque duela.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Facebook lanzó Facebook Home (launcher para Android) con gran fanfarria en 2013. A los 6 meses, viendo que no tenía tracción, lo descontinuaron silenciosamente. Esos recursos se redirigieron a Instagram y WhatsApp. Fallar rápido en Home les permitió ganar en mobile.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Cuándo sí planificar en detalle</h2>
          <div className={styles.sectionContent}>
            <p>La experimentación no significa caos. Hay momentos donde la planificación detallada es crítica: cuando los errores son irreversibles, cuando necesitas coordinar muchos recursos, o cuando entras en mercados regulados. SpaceX no puede 'iterar' con cohetes tripulados sin planificación exhaustiva. Los bancos no pueden experimentar con cumplimiento normativo. La farmacéutica no puede hacer MVPs con medicamentos. La regla es simple: planifica en detalle cuando el coste del error es mayor que el coste de la planificación. En todo lo demás, experimenta. Incluso en estos casos, puedes combinar ambos enfoques: planificación detallada para lo crítico, experimentación rápida para lo incierto.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Amazon planifica meticulosamente la logística de Black Friday (no pueden experimentar con fallos de entrega), pero experimenta constantemente con el diseño de su web, precios dinámicos y recomendaciones. Saben cuándo usar cada herramienta.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Los planes detallados dan falsa seguridad en entornos de alta incertidumbre</li>
            <li>Cada decisión estratégica es una hipótesis que puedes validar experimentalmente</li>
            <li>El MVP estratégico responde preguntas críticas con el menor esfuerzo posible</li>
            <li>Fallar rápido en cosas pequeñas te permite ganar en cosas grandes</li>
            <li>Planifica en detalle solo cuando el coste del error supera el coste de la planificación</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Convierte tu próxima decisión estratégica en una hipótesis medible con criterios claros de éxito/fracaso</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Diseña un experimento de 30 días para validar tu suposición más arriesgada sobre tu mercado</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Identifica qué aspectos de tu negocio requieren planificación detallada y cuáles pueden experimentarse</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Define 3 métricas que te dirían si debes continuar, pivotar o parar tu proyecto actual</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué suposición sobre tu mercado o clientes nunca has validado experimentalmente?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿En qué estás invirtiendo tiempo/dinero sin datos reales que lo justifiquen?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cuál sería la forma más barata de probar si tu idea más arriesgada realmente funciona?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>El 70% de las funcionalidades que desarrollan las empresas de software nunca se usan o se usan raramente. Microsoft descubrió que el 64% de las funcionalidades de Office nunca las usa nadie. Esto no es un problema de desarrollo, es un problema estratégico: están construyendo cosas que nadie quiere porque no experimentan antes de construir.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
