'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function FundamentosNegociacionPage() {
  return (
    <ChapterPage chapterId="fundamentos-negociacion">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En el mundo profesional y personal de 2024, negociar ya no es una habilidad opcional: es una competencia esencial que determina nuestro éxito. Desde conseguir un aumento salarial hasta cerrar un contrato comercial o resolver un conflicto familiar, negociamos constantemente sin darnos cuenta. Sin embargo, la mayoría de las personas aborda estas situaciones sin una estrategia clara, perdiendo oportunidades valiosas. En este módulo aprenderás los fundamentos que transformarán tu capacidad de crear valor y alcanzar acuerdos beneficiosos para todas las partes.</p>
      </section>

        {/* Sección 1: La negociación como habilidad esencial en el siglo XXI */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>La negociación como habilidad esencial en el siglo XXI</h2>
          </div>

          <p>Negociar es el proceso mediante el cual dos o más partes con intereses diferentes buscan llegar a un acuerdo mutuamente beneficioso. Lejos de ser únicamente una herramienta de ventas o diplomacia, la negociación está presente en cada aspecto de nuestras vidas profesionales y personales.</p>
          <p>En el contexto laboral actual, especialmente en España y Latinoamérica, la negociación se ha vuelto crítica debido a varios factores. La economía digital ha creado nuevos modelos de trabajo donde profesionales independientes deben negociar constantemente sus condiciones. Las empresas buscan colaboradores que puedan crear valor a través de alianzas estratégicas. Además, la cultura empresarial se ha vuelto más horizontal, requiriendo habilidades de influencia sin autoridad formal.</p>
          <p>La negociación efectiva se basa en cuatro pilares fundamentales: preparación, comunicación, creatividad y persistencia. La preparación implica conocer tanto nuestros objetivos como los de la contraparte. La comunicación efectiva va más allá de hablar bien; incluye escucha activa y lectura de señales no verbales. La creatividad nos permite encontrar soluciones innovadoras que beneficien a ambas partes. La persistencia nos ayuda a superar obstáculos sin dañar la relación.</p>
          <p>Una negociación exitosa no se mide únicamente por obtener lo que queremos, sino por crear valor para todas las partes involucradas, preservar las relaciones a largo plazo y establecer precedentes positivos para futuras interacciones.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Ana, directora de marketing en una empresa mexicana, necesita aumentar su presupuesto para el lanzamiento de un producto. En lugar de simplemente pedir más dinero, prepara una propuesta mostrando cómo el aumento del 30% en presupuesto puede generar un incremento del 45% en ventas proyectadas. Durante la reunión, escucha las preocupaciones del CFO sobre liquidez y propone un esquema de liberación gradual de fondos vinculado a métricas específicas de performance. El resultado: obtiene el presupuesto completo y fortalece su credibilidad como líder estratégica.</p>
          </div>
        </section>

        {/* Sección 2: Negociación posicional vs negociación basada en intereses */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Negociación posicional vs negociación basada en intereses</h2>
          </div>

          <p>La distinción entre negociación posicional y negociación basada en intereses representa uno de los cambios más significativos en el enfoque moderno de la negociación. Esta diferenciación, popularizada por el método Harvard de negociación, ha revolucionado la forma en que entendemos estos procesos.</p>
          <p>La negociación posicional se centra en defender una postura específica. Los negociadores se aferran a sus demandas iniciales y ven el proceso como una batalla donde uno debe ganar y el otro perder. Este enfoque genera varios problemas: endurece las posiciones, daña las relaciones, consume tiempo excesivo y frecuentemente produce resultados subóptimos para ambas partes.</p>
          <p>Por el contrario, la negociación basada en intereses se enfoca en comprender las necesidades, preocupaciones y motivaciones subyacentes de cada parte. Este enfoque reconoce que las posiciones son solo una forma de satisfacer intereses más profundos, y que pueden existir múltiples maneras de lograr esos objetivos.</p>
          <p>Para implementar la negociación basada en intereses, debemos dominar el arte de hacer preguntas abiertas que revelen motivaciones: '¿Qué es lo más importante para usted en este acuerdo?', '¿Qué necesita lograr para considerar esta negociación exitosa?', '¿Cuáles son sus principales preocupaciones?'</p>
          <p>En el contexto cultural hispanoamericano, donde las relaciones personales son fundamentales para los negocios, la negociación basada en intereses resulta especialmente efectiva. Permite construir confianza, demostrar respeto por la contraparte y crear soluciones que honren las necesidades de ambas partes, elementos clave en nuestra cultura empresarial.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Carlos, propietario de una pequeña empresa de software en Colombia, necesita renovar el contrato con su cliente principal. Su posición inicial: aumentar el precio en 25%. El cliente responde que su presupuesto está congelado. En lugar de insistir en el aumento, Carlos explora los intereses: descubre que el cliente necesita funcionalidades adicionales pero teme los sobrecostos. La solución: un contrato por dos años al precio actual, incluyendo las nuevas funcionalidades, con una cláusula de revisión automática de precios vinculada al índice de inflación. Ambos obtienen certidumbre y valor añadido.</p>
          </div>
        </section>

        {/* Sección 3: Tipos de negociación: distributiva vs integrativa */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Tipos de negociación: distributiva vs integrativa</h2>
          </div>

          <p>La clasificación de las negociaciones en distributivas e integrativas nos ayuda a elegir la estrategia más apropiada según el contexto y los objetivos. Esta distinción es fundamental para maximizar los resultados y gestionar adecuadamente las relaciones.</p>
          <p>Las negociaciones distributivas, también conocidas como 'ganar-perder', se caracterizan porque el beneficio de una parte implica necesariamente una pérdida para la otra. Son típicas cuando se negocia un recurso limitado que no puede expandirse: el precio de un producto único, la división de una herencia, o los términos de una indemnización. En estas situaciones, las tácticas incluyen mantener información privada, establecer anclas altas o bajas según convenga, y demostrar la fortaleza de la posición propia.</p>
          <p>Las negociaciones integrativas o 'ganar-ganar' buscan expandir el valor total disponible antes de distribuirlo. Se basan en la premisa de que las partes tienen intereses diferentes pero complementarios, lo que permite crear soluciones que beneficien a todos. Estas negociaciones requieren transparencia, creatividad y colaboración.</p>
          <p>La clave está en reconocer que la mayoría de las negociaciones aparentemente distributivas tienen elementos integrativos ocultos. Un vendedor y un comprador no solo negocian precio; también pueden considerar plazos de pago, garantías, servicios adicionales, volúmenes futuros, referencias comerciales, etc.</p>
          <p>Para identificar oportunidades integrativas, debemos explorar diferentes variables, entender las prioridades relativas de cada parte, buscar economías de escala o complementariedades, y considerar elementos de tiempo que puedan crear valor. La pregunta clave es: '¿Cómo podemos hacer que este acuerdo sea más valioso para ambos?'</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>María, dueña de un restaurante en Madrid, negocia con un proveedor de verduras orgánicas. Inicialmente parece distributivo: ella quiere precios bajos, él márgenes altos. Sin embargo, al explorar intereses, descubren oportunidades integrativas: María necesita garantía de suministro para eventos especiales y el proveedor busca flujo de caja predecible. Acuerdan un contrato anual con precios escalonados según volumen, pagos adelantados con descuento, y exclusividad territorial para el proveedor. El resultado: María reduce costos 15% y asegura suministro; el proveedor aumenta facturación 40% y mejora su flujo de caja.</p>
          </div>
        </section>

        {/* Sección 4: El mito del pastel fijo y cómo superarlo */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>El mito del pastel fijo y cómo superarlo</h2>
          </div>

          <p>El mito del pastel fijo es una de las creencias limitantes más destructivas en negociación. Esta mentalidad asume que existe una cantidad fija de valor disponible y que cualquier beneficio para una parte debe venir necesariamente a costa de la otra. Esta percepción no solo limita los resultados posibles, sino que también genera dinámicas adversariales innecesarias.</p>
          <p>En la realidad empresarial de 2024, especialmente en economías emergentes como las latinoamericanas, las oportunidades de crear valor son abundantes. La digitalización, la globalización y los nuevos modelos de negocio han multiplicado las formas de generar beneficios mutuos. Sin embargo, muchos negociadores siguen atrapados en paradigmas tradicionales que les impiden ver estas posibilidades.</p>
          <p>Para superar el mito del pastel fijo, debemos desarrollar una mentalidad de abundancia que se enfoque en crear valor antes de distribuirlo. Esto implica explorar múltiples variables simultaneamente: precio, calidad, tiempo, riesgo, prestigio, acceso a redes, conocimiento, etc. Cada variable representa una dimensión donde se puede crear valor.</p>
          <p>Las técnicas para expandir el valor incluyen: el intercambio de concesiones asimétricas (dar algo que nos cuesta poco pero vale mucho para la contraparte), la creación de paquetes que combinen diferentes elementos, el aprovechamiento de economías de escala, y la identificación de sinergias entre las capacidades de ambas partes.</p>
          <p>En el contexto cultural hispanoamericano, donde la confianza y las relaciones a largo plazo son prioritarias, superar el mito del pastel fijo es especialmente importante. Permite construir alianzas duraderas, generar recomendaciones, y crear redes de valor que trascienden la transacción inmediata.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Diego, desarrollador inmobiliario en Buenos Aires, negocia la compra de un terreno con una familia que lo heredó. Inicialmente se enfocan solo en el precio, creando tensión. Diego cambia el enfoque: explora las preocupaciones de la familia y descubre que necesitan liquidez inmediata para gastos médicos, pero también quieren honrar la memoria del abuelo que construyó allí su primer negocio. La solución creativa: Diego paga un precio justo con liquidación inmediata, se compromete a incluir una placa conmemorativa en el desarrollo, y ofrece a los herederos la primera opción de compra sobre las unidades comerciales a precio preferencial. Resultado: la familia obtiene liquidez, reconocimiento y oportunidad futura; Diego consigue el terreno, buena reputación en el barrio y potenciales socios comerciales.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>La negociación es una habilidad esencial que impacta todos los aspectos de nuestra vida profesional y personal</li>
            <li>Enfocarse en intereses subyacentes en lugar de posiciones rígidas genera mejores resultados y preserva relaciones</li>
            <li>Las negociaciones integrativas buscan crear valor para todas las partes, mientras que las distributivas dividen recursos limitados</li>
            <li>El mito del pastel fijo limita las posibilidades; siempre debemos buscar formas de expandir el valor total</li>
            <li>La preparación, comunicación, creatividad y persistencia son los pilares de toda negociación efectiva</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿En cuáles de mis negociaciones recientes me enfoqué en posiciones en lugar de explorar intereses subyacentes?</li>
            <li>¿Qué oportunidades de crear valor adicional he perdido por asumir que existía un 'pastel fijo'?</li>
            <li>¿Cómo podría aplicar técnicas integrativas en mis próximas negociaciones laborales o comerciales?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de tu próxima negociación importante, dedica 15 minutos a escribir tres posibles intereses que podría tener la otra parte, más allá de lo obvio. Luego, prepara preguntas abiertas para validar o descubrir estos intereses durante la conversación. Esta simple preparación puede transformar una negociación distributiva en una oportunidad integrativa.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de 2023 realizado en empresas españolas y mexicanas, los negociadores que utilizan técnicas integrativas obtienen en promedio 23% más valor que quienes se enfocan únicamente en aspectos distributivos. Además, el 78% de estos acuerdos resultan en nuevos negocios o colaboraciones futuras, comparado con solo el 31% de las negociaciones puramente distributivas.</p>
      </div>
    </ChapterPage>
  );
}
