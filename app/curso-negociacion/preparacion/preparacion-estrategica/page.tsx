'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function PreparacionEstrategicaPage() {
  return (
    <ChapterPage chapterId="preparacion-estrategica">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El 90% de las negociaciones exitosas se ganan antes de sentarse en la mesa. La preparación estratégica no es solo recopilar información; es transformar esa información en ventaja competitiva. En un entorno empresarial cada vez más competitivo, donde una negociación puede definir el futuro de un proyecto o una carrera profesional, la diferencia entre el éxito y el fracaso radica en la calidad de tu preparación. Este módulo te equipará con las herramientas específicas para llegar a cualquier negociación con confianza y estrategia clara.</p>
      </section>

        {/* Sección 1: Investigar a la otra parte: información es poder */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>Investigar a la otra parte: información es poder</h2>
          </div>

          <p>La información es la moneda más valiosa en cualquier negociación. Conocer a tu contraparte te permite anticipar sus movimientos, entender sus motivaciones y diseñar propuestas que generen valor mutuo. La investigación efectiva va más allá de datos básicos; requiere un enfoque sistemático y estratégico.</p>
          <p>Comienza por el perfil profesional y empresarial. Utiliza LinkedIn, páginas web corporativas, informes anuales y noticias recientes para entender la situación actual de la empresa o persona. Identifica sus logros recientes, desafíos públicos, cambios organizacionales y tendencias del sector. Esta información te dará contexto sobre sus prioridades actuales.</p>
          <p>El análisis financiero es crucial en negociaciones comerciales. Revisa estados financieros, resultados trimestrales, flujo de caja y comparativos con la competencia. Una empresa con liquidez limitada negociará de forma diferente a una con recursos abundantes. En el contexto latinoamericano, considera factores como fluctuaciones monetarias, regulaciones locales y ciclos económicos regionales.</p>
          <p>Investiga el historial de negociación. ¿Cómo han manejado acuerdos similares en el pasado? ¿Qué tipo de términos suelen aceptar? Habla con colegas, proveedores o clientes que hayan negociado con ellos. Esta información de primera mano es invaluable para entender su estilo y preferencias.</p>
          <p>No olvides el factor cultural. En España, las relaciones personales y la confianza son fundamentales. En México, el respeto por la jerarquía influye en las dinámicas. En Argentina, la negociación tiende a ser más directa. Adapta tu enfoque según el contexto cultural específico.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Ana, directora comercial de una empresa de software en Madrid, debe negociar un contrato con una multinacional brasileña. Su investigación revela que la empresa brasileña reportó pérdidas en el último trimestre debido a la devaluación del real, pero está expandiéndose agresivamente en el mercado español para diversificar ingresos. También descubre que el director de compras brasileño valora las relaciones a largo plazo y prefiere proveedores que ofrezcan flexibilidad en pagos. Con esta información, Ana estructura una propuesta con descuentos por volumen a futuro y términos de pago escalonados, presentándose como un socio estratégico para su expansión, no solo un proveedor.</p>
          </div>
        </section>

        {/* Sección 2: Definir tus objetivos e intereses subyacentes */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Definir tus objetivos e intereses subyacentes</h2>
          </div>

          <p>Muchas negociaciones fracasan porque los participantes confunden posiciones con intereses. Una posición es lo que dices que quieres; un interés es por qué lo quieres. La claridad en tus objetivos e intereses subyacentes es fundamental para una negociación exitosa y para identificar oportunidades de valor compartido.</p>
          <p>Define tres niveles de objetivos: el ideal (lo mejor que podrías conseguir), el objetivo (lo que esperas razonablemente conseguir) y el mínimo aceptable (tu límite inferior). Esta estructura te da flexibilidad durante la negociación sin perder el foco. Por ejemplo, en una negociación salarial, tu ideal podría ser 15% de aumento, tu objetivo 10%, y tu mínimo 7%.</p>
          <p>Identifica tus intereses subyacentes preguntándote '¿por qué?' repetidamente. Si quieres un precio más bajo, ¿es para mejorar márgenes, cumplir presupuesto, o demostrar valor a tus superiores? Cada razón sugiere estrategias diferentes. Si el interés real es demostrar valor, quizás un precio igual con servicios adicionales sea más útil que un descuento directo.</p>
          <p>Prioritiza tus intereses. No todos los objetivos tienen la misma importancia. Crea una matriz donde asignes pesos relativos a cada elemento: precio, plazos, calidad, términos de pago, exclusividad, etc. Esta priorización te ayudará a hacer concesiones estratégicas durante la negociación, cediendo en aspectos menos importantes para ganar en los cruciales.</p>
          <p>Considera intereses a largo plazo versus beneficios inmediatos. En culturas empresariales latinoamericanas, donde las relaciones comerciales tienden a ser duraderas, sacrificar ganancia a corto plazo por una relación sólida puede ser más valioso. Evalúa cómo cada objetivo impacta tu relación futura con la contraparte.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Carlos, gerente de una empresa de construcción en Colombia, negocia un contrato con una minera internacional. Su posición inicial es reducir el precio 20%. Sin embargo, al analizar sus intereses subyacentes, descubre que su verdadera preocupación es el flujo de caja, ya que otros proyectos se han retrasado. Durante la negociación, en lugar de insistir solo en el precio, propone mantener el precio original a cambio de un adelanto del 40% al firmar el contrato. La minera acepta porque necesita asegurar el proveedor rápidamente, y Carlos resuelve su problema real de liquidez.</p>
          </div>
        </section>

        {/* Sección 3: Anticipar objeciones y preparar respuestas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Anticipar objeciones y preparar respuestas</h2>
          </div>

          <p>Las objeciones son predecibles si conoces bien a tu contraparte y tu propuesta. Anticiparlas te permite preparar respuestas sólidas, mantener el control de la conversación y demostrar profesionalismo. Una objeción bien manejada puede convertirse en una oportunidad para fortalecer tu posición.</p>
          <p>Crea un mapa de objeciones categorizando por tipo: precio ('es muy caro'), capacidad ('no creemos que puedan entregar a tiempo'), valor ('no vemos el beneficio'), riesgo ('es muy arriesgado para nosotros'), y proceso ('necesitamos más tiempo para decidir'). Para cada categoría, desarrolla respuestas específicas con datos, ejemplos y alternativas.</p>
          <p>Utiliza la técnica de respuesta en tres pasos: reconocer, reformular y responder. Primero, reconoce la validez de la preocupación ('entiendo su inquietud sobre los plazos'). Segundo, reformula para asegurar comprensión ('si interpreto correctamente, les preocupa cumplir con su cronograma de producción'). Tercero, responde con información específica y propuestas constructivas.</p>
          <p>Prepara evidencia de apoyo para cada respuesta. Testimonios de clientes, casos de estudio, datos de rendimiento, certificaciones, o garantías específicas. En el contexto hispanoamericano, donde la credibilidad personal es crucial, incluye referencias de personas conocidas o respetadas en el sector.</p>
          <p>Practica respuestas a objeciones emocionales. Frases como 'no tenemos presupuesto', 'la junta directiva no aprobará esto', o 'necesitamos pensarlo' a menudo esconden otros intereses. Desarrolla preguntas de exploración para descubrir las verdaderas preocupaciones: '¿qué tendría que cambiar para que esto fuera atractivo para su junta?', '¿cuáles son sus prioridades principales este trimestre?'</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>María, vendedora de equipos médicos en Chile, sabe que los hospitales públicos siempre objetarán el precio por restricciones presupuestarias. Anticipa esta objeción preparando tres alternativas: un modelo básico con funcionalidades esenciales a menor precio, un plan de leasing que distribuye el costo en tres años, y una propuesta de comodato donde el hospital paga por uso. Cuando el director del hospital dice 'es demasiado caro para nuestro presupuesto', María responde: 'Entiendo la presión presupuestaria del sector público. ¿Le interesaría explorar alternativas que le permitan acceder a la tecnología sin impactar su presupuesto de capital?' y presenta sus opciones preparadas.</p>
          </div>
        </section>

        {/* Sección 4: El checklist del negociador preparado */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>El checklist del negociador preparado</h2>
          </div>

          <p>Un checklist sistemático garantiza que no olvides elementos críticos en tu preparación. Esta herramienta debe ser tu compañera en cada negociación, adaptándola según el contexto específico pero manteniendo los elementos fundamentales.</p>
          <p>Información de la contraparte: perfil de la empresa/persona, situación financiera actual, historial de negociaciones, presiones o urgencias conocidas, estilo de negociación preferido, y decisores reales en el proceso. Incluye información cultural y personal que pueda influir en la dinámica.</p>
          <p>Tus objetivos y estrategia: objetivos ideal/esperado/mínimo claramente definidos, intereses subyacentes priorizados, alternativas disponibles (BATNA), límites no negociables, y concesiones que estás dispuesto a hacer. Define también tu estrategia de apertura y diferentes escenarios posibles.</p>
          <p>Argumentos y evidencia: propuesta de valor clara y diferenciada, evidencia de apoyo (datos, testimonios, casos), respuestas preparadas a objeciones principales, y materiales de apoyo organizados. Incluye calculadoras o herramientas que puedan ser útiles durante la negociación.</p>
          <p>Logística y ambiente: lugar de la negociación, participantes confirmados, agenda propuesta, materiales necesarios, y consideraciones técnicas (conexión, proyector, documentos). En negociaciones virtuales, verifica tecnología y ten respaldos preparados.</p>
          <p>Aspectos legales y contractuales: términos estándar de tu industria, cláusulas importantes a incluir, aspectos regulatorios relevantes, y proceso de aprobación interno. Ten clara la autoridad que tienes para comprometerte y qué requiere aprobación superior.</p>
          <p>Seguimiento post-negociación: proceso para documentar acuerdos, responsables de implementación, fechas de seguimiento, y métricas para evaluar éxito. Define también cómo manejar modificaciones o disputas futuras.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Roberto, director de una empresa de logística en México, usa su checklist antes de negociar un contrato importante con una cadena de supermercados. Descubre que la cadena está bajo presión por incremento de costos inflacionarios y que el gerente de compras será evaluado por ahorro de costos. Roberto ajusta su estrategia para enfocarse en eficiencias operacionales y reducción de mermas, en lugar de competir solo por precio. Su checklist le recuerda verificar regulaciones de transporte recientes y prepare propuestas de optimización de rutas. Durante la negociación, presenta un análisis de costo total que demuestra ahorros del 12% en costos operativos totales, ganando el contrato pese a no ser la oferta más barata.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>La información específica y actual sobre tu contraparte es más valiosa que datos generales abundantes</li>
            <li>Los intereses subyacentes son más importantes que las posiciones declaradas en una negociación</li>
            <li>Anticipar objeciones te permite mantener el control y convertir resistencias en oportunidades</li>
            <li>Un checklist sistemático evita errores costosos y garantiza preparación integral</li>
            <li>La preparación debe adaptarse al contexto cultural específico de cada negociación</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Qué fuentes de información sobre mis contrapartes he estado subutilizando y podrían darme ventaja competitiva?</li>
            <li>En mis últimas negociaciones importantes, ¿cuáles fueron mis verdaderos intereses subyacentes versus lo que pedí explícitamente?</li>
            <li>¿Qué objeciones recurrentes recibo en mis negociaciones y cómo podría preparar mejores respuestas?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de tu próxima negociación importante, dedica 30 minutos a investigar las últimas noticias, cambios organizacionales o logros públicos de tu contraparte en los últimos 6 meses. Esta información reciente te dará contexto actual sobre sus prioridades y presiones, permitiéndote conectar mejor tu propuesta con sus necesidades actuales.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de Harvard Business School de 2023, los negociadores que invierten al menos 2 horas en preparación por cada hora de negociación obtienen resultados 34% mejores que aquellos que se preparan menos. Además, en culturas latinas, el 67% de los ejecutivos considera que conocer información personal básica (familia, aficiones, logros recientes) de su contraparte es tan importante como conocer información comercial para construir confianza durante la negociación.</p>
      </div>
    </ChapterPage>
  );
}
