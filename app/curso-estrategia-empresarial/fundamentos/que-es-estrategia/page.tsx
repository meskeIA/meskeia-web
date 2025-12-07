'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function QueEsEstrategiaPage() {
  return (
    <ChapterPage chapterId="que-es-estrategia">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            Te han vendido que la estrategia es hacer planes a cinco años y seguirlos religiosamente. Es mentira. En 2025, las empresas que siguen planes rígidos mueren. Netflix no planeó ser una empresa de contenido original cuando enviaba DVDs por correo. Amazon no tenía en su plan estratégico de 1997 convertirse en el líder mundial de cloud computing. La estrategia real no es predecir el futuro, es construir la capacidad de responder cuando ese futuro te sorprende.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>La Definición Honesta: Estrategia es Coherencia en el Caos</h2>
          <div className={styles.sectionContent}>
            <p>La estrategia no es un documento de PowerPoint. Es un patrón coherente de decisiones que tomas cuando no tienes toda la información. Es tu forma de apostar en la incertidumbre. Mientras que en los 80 las empresas podían planificar a décadas, hoy la estrategia es más como navegar en una tormenta: necesitas una brújula (tus principios), pero tu ruta cambiará constantemente. La coherencia no significa rigidez. Significa que tus decisiones, aunque adaptativas, apuntan hacia una dirección consistente. Amazon lleva 30 años siendo coherente con 'obsesión por el cliente', pero ha pivotado desde libros a todo, de retail a servicios empresariales.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Spotify nunca planeó competir con Netflix en podcasts, pero cuando vieron que el audio era el futuro del entretenimiento, invirtieron \$1B en podcasts. Coherente con su misión de 'desbloquear el potencial de la creatividad humana', pero completamente imprevisto en su plan original.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Misión y Valores: Tu GPS Cuando se Cae Google Maps</h2>
          <div className={styles.sectionContent}>
            <p>Los valores no son pósters motivacionales en la pared. Son criterios de decisión cuando tienes que elegir rápido y con información incompleta. Una buena misión no describe lo que haces, sino por qué existe tu empresa. Tesla no fabrica coches, 'acelera la transición mundial hacia la energía sostenible'. Esa diferencia les permitió entrar en baterías, paneles solares y energía. Una misión clara te da permiso para pivotar sin perder identidad. Los valores son tus filtros: cuando tienes diez oportunidades y recursos para tres, tus valores deciden por ti. Sin ellos, cada decisión es un debate eterno.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Patagonia rechaza constantemente oportunidades de crecimiento que no alineen con su misión ambiental. Demandó a Trump, cerró tiendas en Black Friday para protestar por el consumismo, y dona beneficios a causas ambientales. Menos crecimiento, más coherencia, mayor lealtad.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>El Arte de Elegir Qué NO Hacer</h2>
          <div className={styles.sectionContent}>
            <p>La estrategia es principalmente renuncia. Apple no hace televisores, coches baratos, o veinte modelos de iPhone. Steve Jobs decía que estaba más orgulloso de lo que Apple no hacía que de lo que sí hacía. En un mundo de oportunidades infinitas, tu ventaja competitiva es tu capacidad de decir 'no'. Cada 'sí' es un 'no' implícito a otras mil cosas. Las empresas mediocres intentan hacer todo. Las grandes se enfocan obsesivamente en pocas cosas y las hacen mejor que nadie. El FOMO (Fear of Missing Out) mata más estrategias que la competencia.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Google tiene un cementerio de más de 200 productos cancelados: Google+, Google Glass, Stadia. Pero mantiene su foco en búsqueda y publicidad, que generan el 80% de sus ingresos. Experimentan mucho, pero no se dispersan en el core business.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategia vs Táctica vs Operaciones: Las Tres Velocidades</h2>
          <div className={styles.sectionContent}>
            <p>Estrategia es 'dónde jugar y cómo ganar'. Táctica es 'cómo ejecutar la estrategia este trimestre'. Operaciones es 'cómo hacer que funcione hoy'. Diferentes horizontes temporales, diferentes tipos de decisiones. Un error común es confundirlas: lanzar una campaña en redes sociales es táctica, no estrategia. Abrir una oficina en México puede ser táctica o estrategia, según el contexto. La clave es que cada nivel alimente al siguiente: las operaciones informan las tácticas, las tácticas validan o cuestionan la estrategia. En 2025, estos ciclos son más rápidos: lo que antes era estrategia anual ahora puede ser trimestral.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Cuando Zoom vio que la pandemia disparaba su uso, su estrategia fue 'convertirse en la plataforma de comunicación empresarial'. Táctica: mejorar seguridad y escalabilidad en meses. Operaciones: mantener servidores funcionando con 30x más tráfico. Tres niveles, un objetivo.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Estrategia Emergente: Cuando el Plan se Encuentra con la Realidad</h2>
          <div className={styles.sectionContent}>
            <p>Henry Mintzberg demostró que la estrategia real emerge de la intersección entre lo que planeas y lo que descubres haciendo. Las mejores estrategias son 50% intención, 50% emergencia. Netflix planeó ser Blockbuster online, descubrió que el streaming era posible, y emergió como creador de contenido. No lo planearon desde el día uno, pero cuando vieron la oportunidad, fueron coherentes con su misión de entretenimiento. La planificación estratégica tradicional asume que puedes predecir. La estrategia emergente asume que puedes aprender. En mercados volátiles, aprender rápido es más valioso que planificar perfecto.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Instagram comenzó como Burbn, una app de check-in como Foursquare. Los fundadores notaron que los usuarios solo usaban la función de fotos. Pivotaron completamente, mantuvieron solo las fotos, y crearon Instagram. Estrategia emergente en acción.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Estrategia es coherencia en decisiones, no planes rígidos a largo plazo</li>
            <li>Los valores son criterios de decisión cuando tienes información incompleta</li>
            <li>Elegir qué NO hacer es más importante que elegir qué hacer</li>
            <li>Estrategia, táctica y operaciones operan en diferentes horizontes temporales</li>
            <li>La mejor estrategia emerge del equilibrio entre planificación y aprendizaje</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Escribe en una frase por qué existe tu empresa (no qué hace, sino por qué)</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Lista las 3 cosas más importantes que NO vas a hacer este año</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Identifica una decisión reciente: ¿fue estratégica, táctica u operacional?</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Define tus 3 valores core como criterios de decisión específicos</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Tus decisiones de los últimos 6 meses siguen un patrón coherente?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Qué oportunidades has rechazado y por qué criterios?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Tu estrategia actual sigue siendo relevante si tu industria cambia 50% en dos años?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>El 67% de las empresas consideradas 'excelentes' en 1982 habían fracasado o perdido relevancia en 2012. La obsesión por seguir planes perfectos las mató más rápido que la falta de planificación.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
