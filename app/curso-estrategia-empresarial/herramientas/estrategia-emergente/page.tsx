'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function EstrategiaEmergentePage() {
  return (
    <ChapterPage chapterId="estrategia-emergente">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            La planificación estratégica tradicional asume que podemos predecir el futuro y ejecutar un plan. En 2025, eso es una fantasía peligrosa. Henry Mintzberg lo sabía ya en los 80: la estrategia real emerge de la acción, no del PowerPoint. Las empresas más exitosas de hoy no siguieron su plan inicial—lo descubrieron experimentando. Twitter empezó como plataforma de podcasts, Instagram como app de check-in, y Slack como herramienta interna de un videojuego fallido. La estrategia emergente no es caos disfrazado; es un enfoque sistemático para aprender haciendo en un mundo impredecible.
          </p>
        </section>

        {/* Secciones de contenido */}

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Mintzberg y la Realidad de Cómo se Hace Estrategia</h2>
          <div className={styles.sectionContent}>
            <p>Henry Mintzberg revolucionó el pensamiento estratégico con una idea simple pero radical: las estrategias reales emergen de patrones de decisiones, no de planes grandiosos. Estudió cientos de empresas y descubrió que menos del 10% de las estrategias planificadas se ejecutaban tal como se concibieron. El resto eran estrategias emergentes—patrones que surgían de responder a oportunidades y crisis imprevistas. En 2025, esta proporción es aún más extrema. Las empresas que sobreviven son las que mantienen una dirección general clara pero adaptan constantemente sus tácticas. La clave no es abandonar la planificación, sino equilibrar intención estratégica con flexibilidad táctica. Como dice Reid Hoffman de LinkedIn: 'Starting a company is like jumping off a cliff and assembling a plane on the way down.'</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Airbnb comenzó vendiendo cereales temáticos de Obama y McCain para financiarse durante la crisis de 2008. Su estrategia emergente real surgió cuando notaron que los huéspedes valoraban más la experiencia personal que el precio bajo. Pivotaron de 'alojamiento barato' a 'pertenencia en cualquier lugar'—una estrategia que nunca habría salido de un análisis de mercado tradicional.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Reconocer Patrones en el Ruido</h2>
          <div className={styles.sectionContent}>
            <p>La estrategia emergente requiere una habilidad crítica: distinguir entre ruido aleatorio y patrones significativos en tus datos y feedback. No toda desviación del plan es una señal estratégica—algunas son simplemente variaciones normales. Los patrones estratégicos suelen manifestarse como: comportamientos inesperados de clientes, usos no previstos de tu producto, segmentos que crecen más rápido de lo esperado, o quejas recurrentes que revelan necesidades no cubiertas. La clave está en crear sistemas de detección temprana. Jeff Bezos llama a esto 'high-velocity decision making'—la capacidad de procesar señales débiles antes de que se conviertan en tendencias evidentes. Esto requiere proximidad al cliente, equipos empoderados para experimentar, y métricas que capturen comportamientos emergentes, no solo KPIs tradicionales.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Zoom era una herramienta empresarial hasta 2020. La pandemia reveló un patrón emergente: familias, profesores, y amigos lo usaban masivamente para socializar. En lugar de resistir este 'mal uso', Zoom adaptó su producto y marketing. Lanzó fondos virtuales, mejoró la experiencia para usuarios no técnicos, y se posicionó como plataforma de conexión humana, no solo de reuniones corporativas.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Construir Loops de Feedback Acelerados</h2>
          <div className={styles.sectionContent}>
            <p>La velocidad del feedback determina la velocidad del aprendizaje estratégico. En mercados tradicionales, podías permitirte ciclos de feedback anuales. Hoy necesitas ciclos semanales o diarios. Los loops efectivos tienen tres componentes: hipótesis clara, experimento medible, y decisión rápida sobre continuar/pivotar/parar. La trampa común es confundir actividad con aprendizaje. Hacer muchos experimentos sin extraer conclusiones claras es tan inútil como no experimentar. El framework Build-Measure-Learn de Lean Startup sigue siendo válido, pero debe acelerarse. Las mejores empresas actuales pueden pivotar elementos de su estrategia en semanas, no trimestres. Esto requiere arquitecturas de producto modulares, equipos autónomos, y una cultura que celebre el aprendizaje rápido sobre tener razón.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Spotify lanza miles de experimentos simultáneamente—desde algoritmos de recomendación hasta interfaces de usuario. Su sistema de 'flags' les permite activar/desactivar funciones para segmentos específicos en tiempo real. Cuando detectan que una función reduce el engagement, la eliminan en horas. Esta capacidad de experimentación continua es su verdadera ventaja competitiva, más que cualquier algoritmo específico.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Decisiones Reversibles vs. Irreversibles</h2>
          <div className={styles.sectionContent}>
            <p>Jeff Bezos popularizó la distinción entre decisiones 'Tipo 1' (irreversibles, requieren análisis profundo) y 'Tipo 2' (reversibles, requieren velocidad). La mayoría de decisiones son Tipo 2, pero las tratamos como Tipo 1, paralizando la organización. En estrategia emergente, maximizas las decisiones reversibles para mantener optionalidad. Esto significa arquitecturas modulares, contratos flexibles, equipos multifuncionales, y evitar inversiones que te aten a un camino específico. La reversibilidad tiene un coste—equipos más generalistas, sistemas más complejos, menor eficiencia a corto plazo. Pero en entornos inciertos, la optionalidad vale más que la eficiencia. Como dice Nassim Taleb: 'The option to succeed is more valuable than the ability to avoid failure.' La clave está en identificar correctamente qué decisiones son realmente irreversibles.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Amazon Web Services empezó como infraestructura interna de Amazon. Cuando vieron demanda externa, no crearon una nueva empresa—diseñaron AWS como servicios modulares que podían escalar independientemente. Esta arquitectura reversible les permitió pivotar de retailer a proveedor de cloud sin apostar toda la empresa. Cada servicio podía fallar sin hundir el conjunto.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>Desarrollar Capacidad de Pivote Organizacional</h2>
          <div className={styles.sectionContent}>
            <p>El pivote no es admitir fracaso—es aplicar aprendizaje. Pero pivotar requiere capacidades organizacionales específicas: equipos psicológicamente seguros que reporten malas noticias rápido, sistemas financieros que permitan reasignar recursos ágilmente, y liderazgo que celebre el aprendizaje sobre la consistencia. La capacidad de pivote se construye en tiempos de calma, no de crisis. Incluye diversificar fuentes de ingresos, mantener efectivo para oportunidades, desarrollar talento versátil, y crear cultura de experimentación. Las organizaciones rígidas optimizan para eficiencia; las antifragiles optimizan para adaptabilidad. En 2025, la adaptabilidad gana. Como dice Eric Ries: 'The only way to win is to learn faster than anyone else.' Esto requiere humildad intelectual—la disposición a cambiar de opinión cuando los datos lo justifican.</p>
          </div>
          
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>Nintendo ha pivotado radicalmente múltiples veces: de cartas de juego a arcade, de arcade a consolas, de potencia bruta (GameCube) a innovación accesible (Wii), de consolas tradicionales a híbrida portátil (Switch). Cada pivote aprovechó capacidades existentes pero redefinió su mercado. Su capacidad de reinventarse, manteniendo su esencia lúdica, es su verdadera core competency.</p>
          </div>
        </section>


        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
            <li>Las estrategias exitosas emergen de patrones de acción, no de planes perfectos</li>
            <li>La velocidad de aprendizaje supera a la precisión de predicción en entornos inciertos</li>
            <li>Maximizar decisiones reversibles mantiene la optionalidad estratégica abierta</li>
            <li>Los loops de feedback acelerados son la ventaja competitiva del siglo XXI</li>
            <li>La capacidad de pivote se construye antes de necesitarla, no durante la crisis</li>
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>1</span>
              <p>Identifica tres métricas de comportamiento emergente (no solo KPIs tradicionales) que podrías trackear semanalmente</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>2</span>
              <p>Clasifica tus próximas cinco decisiones importantes como Tipo 1 (irreversibles) o Tipo 2 (reversibles)</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>3</span>
              <p>Diseña un experimento simple para validar una hipótesis sobre tu mercado que puedas completar en dos semanas</p>
            </div>
            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>4</span>
              <p>Mapea qué elementos de tu modelo de negocio actual son modulares vs. rígidamente acoplados</p>
            </div>
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
            <div className={styles.reflectionCard}>
              <p>¿Qué patrón inesperado en el comportamiento de tus clientes has estado ignorando o racionalizando?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>Si tuvieras que pivotar tu estrategia actual en 90 días, ¿qué capacidades organizacionales te faltarían?</p>
            </div>
            <div className={styles.reflectionCard}>
              <p>¿Cuántas de tus decisiones estratégicas recientes eran realmente irreversibles vs. las que trataste como irreversibles por miedo?</p>
            </div>
          </div>
        </section>

        {/* Curiosidad */}
        
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>El 70% de las empresas del Fortune 500 de 1955 habían desaparecido para 2017. Pero curiosamente, las que sobrevivieron no fueron las que mejor ejecutaron sus planes originales—fueron las que pivotaron más veces manteniendo su propósito core intacto.</p>
          </div>
        </section>
      </div>
    </ChapterPage>
  );
}
