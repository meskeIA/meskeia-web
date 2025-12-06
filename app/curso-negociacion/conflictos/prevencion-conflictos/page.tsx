'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function PrevencionConflictosPage() {
  return (
    <ChapterPage chapterId="prevencion-conflictos">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>El 85% de los conflictos empresariales se originan por malentendidos que pudieron haberse evitado con una comunicación preventiva adecuada. En el contexto hispanohablante, donde las relaciones personales son fundamentales para los negocios, la prevención de conflictos no es solo una habilidad técnica, sino una competencia cultural esencial. La inversión en tiempo y recursos para prevenir conflictos es siempre menor que el costo de resolverlos una vez que han escalado. Dominar estas técnicas te permitirá construir negociaciones más sólidas y relaciones comerciales duraderas.</p>
      </section>

        {/* Sección 1: Identificación Temprana de Señales de Conflicto */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>Identificación Temprana de Señales de Conflicto</h2>
          </div>

          <p>Las señales de conflicto temprano son como los síntomas de una enfermedad: detectarlas a tiempo puede evitar complicaciones mayores. En el contexto empresarial hispanohablante, estas señales suelen manifestarse de manera sutil debido a nuestra tendencia cultural a evitar confrontaciones directas.</p>
          <p>Las señales verbales incluyen cambios en el tono de voz, uso de lenguaje más formal de lo habitual, respuestas evasivas o demasiado breves, y la aparición de frases como 'ya veremos', 'lo consultaré' o 'no estoy muy convencido'. En México y otros países latinoamericanos, frases como 'ahorita' o 'en un ratito' pueden indicar resistencia pasiva cuando se repiten constantemente.</p>
          <p>Las señales no verbales son igualmente reveladoras: cambios en el lenguaje corporal, evitar el contacto visual, cruzar los brazos, alejarse físicamente durante las conversaciones, o mostrar signos de impaciencia como mirar el reloj frecuentemente. En España, el aumento en la gesticulación puede indicar frustración creciente.</p>
          <p>Las señales contextuales incluyen retrasos en respuestas a emails o llamadas, cancelaciones frecuentes de reuniones, involucrar a terceras personas inesperadamente en las conversaciones, o solicitar documentación adicional de manera repetitiva. También es crucial observar cambios en los patrones de comunicación: si alguien que normalmente era proactivo se vuelve reactivo, o si las reuniones informales se formalizan súbitamente.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>En una negociación para la expansión de una franquicia española en Colombia, el franquiciador notó que su contraparte colombiana comenzó a responder emails con retrasos de varios días (antes respondía el mismo día), sus respuestas se volvieron más formales ('Estimado señor' en lugar del habitual 'Hola Carlos'), y en las videollamadas evitaba el contacto visual directo con la cámara. Estos cambios surgieron después de discutir las condiciones financieras. Al detectar estas señales, el franquiciador organizó una llamada informal para abordar las preocupaciones, descubriendo que existían malentendidos sobre los términos de pago que se resolvieron antes de que escalaran a un conflicto mayor.</p>
          </div>
        </section>

        {/* Sección 2: Comunicación Preventiva y Establecimiento de Expectativas Claras */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Comunicación Preventiva y Establecimiento de Expectativas Claras</h2>
          </div>

          <p>La comunicación preventiva es el arte de abordar potenciales malentendidos antes de que se conviertan en conflictos reales. En culturas hispanohablantes, donde a menudo se valora la armonía sobre la confrontación directa, establecer marcos de comunicación abierta desde el inicio es fundamental.</p>
          <p>El primer paso es crear un protocolo de comunicación explícito. Esto incluye definir cuándo, cómo y con qué frecuencia se comunicarán las partes, establecer canales preferidos (email, WhatsApp Business, reuniones presenciales), y acordar tiempos de respuesta realistas. En América Latina, donde WhatsApp es omnipresente en los negocios, es crucial separar comunicaciones formales de informales.</p>
          <p>El establecimiento de expectativas claras requiere documentar todos los acuerdos, incluso los aparentemente menores. Utiliza el principio de 'confirmación activa': después de cada conversación importante, envía un resumen escrito comenzando con 'Para confirmar lo que acordamos...'. Esto no es desconfianza, sino profesionalismo.</p>
          <p>Implementa reuniones de seguimiento regulares, incluso cuando todo parece ir bien. En España, estas pueden ser desayunos de trabajo informales; en México, almuerzos de negocios. El objetivo es crear espacios seguros donde las preocupaciones puedan expresarse antes de convertirse en problemas.</p>
          <p>Desarrolla un vocabulario de 'banderas amarillas': frases que ambas partes pueden usar para señalar preocupaciones sin crear confrontación. Por ejemplo, 'necesito revisar esto con más detalle' o 'me gustaría explorar alternativas' pueden ser códigos acordados para pausar y recalibrar.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Una constructora peruana estableció un protocolo con sus proveedores mexicanos que incluía reuniones virtuales semanales de 30 minutos cada viernes, reportes de progreso cada miércoles por email, y un código de 'semáforo': verde para 'todo en orden', amarillo para 'atención necesaria' y rojo para 'intervención urgente'. Cuando un proveedor marcó 'amarillo' por segunda semana consecutiva, activaron una reunión extraordinaria que reveló problemas logísticos que podrían haber causado retrasos de semanas. La solución temprana les ahorró \$50,000 dólares en penalizaciones.</p>
          </div>
        </section>

        {/* Sección 3: Cláusulas de Resolución en Contratos */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Cláusulas de Resolución en Contratos</h2>
          </div>

          <p>Las cláusulas de resolución de conflictos son el seguro de vida de cualquier acuerdo comercial. En el contexto hispano, donde las relaciones personales influyen significativamente en los negocios, estas cláusulas deben equilibrar formalidad legal con flexibilidad relacional.</p>
          <p>La estructura escalonada es fundamental: comienza con negociación directa entre las partes (30-60 días), seguida de mediación con un tercero neutral (30-45 días), y finalmente arbitraje o procedimiento judicial. Especifica plazos concretos para cada etapa y qué constituye 'buena fe' en cada fase.</p>
          <p>Incorpora cláusulas de 'enfriamiento': períodos obligatorios de pausa antes de escalar el conflicto. Durante este tiempo, ambas partes se comprometen a no tomar acciones que puedan empeorar la situación. En culturas latinas, donde las emociones pueden intensificar disputas, estos períodos son especialmente valiosos.</p>
          <p>Define claramente qué constituye un conflicto activable versus desacuerdos menores. Establece umbrales monetarios o de impacto que determinen cuándo aplicar procedimientos formales. No todos los desacuerdos necesitan el mismo nivel de escalamiento.</p>
          <p>Incluye cláusulas de preservación de relación: acuerdos explícitos para mantener comunicación comercial normal durante disputas, proteger información confidencial, y evitar declaraciones públicas negativas. En mercados pequeños como muchos países latinoamericanos, la reputación es crucial.</p>
          <p>Especifica la ley aplicable y jurisdicción, considerando las complejidades del comercio internacional hispano. Para contratos entre países, considera arbitraje internacional con árbitros familiarizados con ambas culturas jurídicas.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Un acuerdo entre una empresa tecnológica argentina y una distribuidora española incluyó una cláusula que establecía: '1) Negociación directa (45 días), con reunión presencial u online obligatoria entre CEOs; 2) Mediación por mediador certificado bilingüe con experiencia en ambos mercados (30 días); 3) Arbitraje bajo reglas de la Corte de Arbitraje de Madrid, con procedimiento en español'. También incluyeron una 'cláusula de continuidad comercial' que obligaba a ambas partes a mantener el servicio normal durante disputas menores (bajo €25,000). Esta estructura les permitió resolver dos disputas significativas sin afectar su relación comercial de €2 millones anuales.</p>
          </div>
        </section>

        {/* Sección 4: Construcción de Relaciones Antes de Necesitarlas */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>Construcción de Relaciones Antes de Necesitarlas</h2>
          </div>

          <p>En el mundo hispano, donde 'los negocios se hacen entre personas', construir relaciones sólidas antes de enfrentar dificultades es una inversión estratégica fundamental. Esta aproximación relacional a menudo determina el éxito o fracaso de una negociación más que los aspectos técnicos del acuerdo.</p>
          <p>La construcción proactiva de relaciones comienza con la investigación cultural profunda de tus contrapartes. Entiende no solo sus estructuras organizacionales, sino sus valores culturales, tradiciones empresariales y protocolos sociales. En México, conocer sobre festividades regionales puede abrir puertas; en Argentina, entender la cultura del fútbol puede facilitar conexiones.</p>
          <p>Invierte tiempo en interacciones no transaccionales: almuerzos sin agenda comercial específica, invitaciones a eventos culturales, intercambio de información valiosa sin expectativas inmediatas de reciprocidad. En España, las sobremesas pueden ser más valiosas que las reuniones formales para construir confianza genuina.</p>
          <p>Crea una red de stakeholders, no solo tomadores de decisión. Incluye asistentes ejecutivos, gerentes medios, y personal operativo que puede influir en la implementación de acuerdos. En culturas jerárquicas latinoamericanas, tener aliados en diferentes niveles organizacionales es crucial.</p>
          <p>Desarrolla un sistema de 'mantenimiento relacional': cumpleaños, aniversarios empresariales, felicitaciones por logros profesionales o familiares. Utiliza herramientas CRM para trackear estos momentos importantes y mantener comunicación regular sin agenda comercial.</p>
          <p>Establece reciprocidad gradual: comparte información valiosa, haz conexiones beneficiosas, ofrece insights de mercado. El principio de reciprocidad es especialmente fuerte en culturas hispanas y crea obligaciones morales positivas.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Un empresario chileno que planeaba expandirse a mercados centroamericanos invirtió seis meses en construir relaciones antes de iniciar negociaciones formales. Participó en conferencias industriales en Guatemala y Costa Rica, organizó cenas informales con líderes del sector, estableció partnerships con universidades locales para programas de intercambio, y creó un newsletter mensual con insights del mercado chileno que compartía gratuitamente. Cuando finalmente presentó su propuesta de joint venture, ya tenía tres potenciales socios compitiendo por trabajar con él, y logró condiciones 40% mejores que las que habría obtenido en una negociación 'fría'. Más importante aún, cuando surgió una crisis regulatoria local seis meses después, sus socios lo defendieron activamente ante las autoridades.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>Las señales de conflicto temprano incluyen cambios sutiles en comunicación, comportamiento y patrones de interacción que requieren observación activa</li>
            <li>La comunicación preventiva debe incluir protocolos explícitos, confirmación activa de acuerdos y espacios seguros para expresar preocupaciones</li>
            <li>Las cláusulas de resolución efectivas siguen una estructura escalonada con plazos específicos y consideraciones culturales apropiadas</li>
            <li>La construcción proactiva de relaciones requiere inversión genuina en interacciones no transaccionales y mantenimiento sistemático</li>
            <li>En culturas hispanas, la prevención de conflictos es tanto una competencia técnica como cultural que puede determinar el éxito comercial a largo plazo</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Qué señales de conflicto temprano he pasado por alto en mis negociaciones pasadas y cómo podría haberlas detectado mejor?</li>
            <li>¿Cómo puedo mejorar mis sistemas actuales de comunicación preventiva para crear mayor claridad y confianza con mis contrapartes?</li>
            <li>¿Qué relaciones comerciales importantes necesito fortalecer antes de enfrentar futuras negociaciones o desafíos empresariales?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Implementa la 'regla de confirmación 48 horas': después de cualquier conversación importante de negociación, envía un email en las siguientes 48 horas resumiendo los puntos acordados, las acciones a seguir y las expectativas mutuas. Comienza siempre con 'Para confirmar nuestro entendimiento mutuo...' y termina preguntando si hay algo que agregar o clarificar.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de 2024 de la Cámara de Comercio Hispana Internacional, las empresas que invierten en construcción proactiva de relaciones antes de negociar reportan un 73% menos conflictos contractuales y un 45% mayor duración en sus partnerships comerciales. Además, el costo promedio de prevenir un conflicto es aproximadamente 15 veces menor que resolverlo una vez escalado, con la diferencia siendo aún mayor en mercados hispanohablantes donde los procesos legales pueden ser más prolongados.</p>
      </div>
    </ChapterPage>
  );
}
