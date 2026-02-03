'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function EticaNegociacionPage() {
  return (
    <ChapterPage chapterId="etica-negociacion">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En el mundo empresarial actual, donde la información viaja a velocidades sin precedentes y las redes profesionales trascienden fronteras, la reputación se construye en años pero puede destruirse en minutos. La ética en la negociación no es solo una cuestión moral, sino una estrategia de supervivencia empresarial a largo plazo. Cuando negociamos, cada decisión que tomamos envía un mensaje sobre quiénes somos, cómo operamos y si podemos ser dignos de confianza en futuras transacciones. En el contexto empresarial hispanohablante, donde las relaciones personales y la palabra dada tienen un peso cultural significativo, negociar con integridad se convierte en una ventaja competitiva sostenible.</p>
      </section>

        {/* Sección 1: Las Líneas Rojas: Mentir, Manipular y Coaccionar */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>Las Líneas Rojas: Mentir, Manipular y Coaccionar</h2>
          </div>

          <p>En toda negociación existen límites éticos que, una vez cruzados, comprometen no solo el resultado inmediato sino nuestra credibilidad futura. Las tres líneas rojas fundamentales son mentir, manipular y coaccionar, cada una con consecuencias devastadoras para las relaciones profesionales.</p>
          <p>Mentir en una negociación va más allá de proporcionar información falsa; incluye omitir datos relevantes, exagerar capacidades o distorsionar la realidad. En el entorno empresarial español y latinoamericano, donde el networking y las referencias son cruciales, ser descubierto en una mentira puede cerrar puertas durante décadas. La mentira más común en negociaciones comerciales es exagerar la demanda de un producto o servicio ('tengo otros tres clientes interesados') cuando la realidad es diferente.</p>
          <p>La manipulación emocional es igualmente destructiva. Esto incluye crear falsas urgencias, usar chantaje emocional o explotar vulnerabilidades personales del otro negociador. Por ejemplo, amenazar con retirar una oferta laboral si el candidato no acepta inmediatamente, sabiendo que está en una situación económica difícil. La manipulación puede generar resultados a corto plazo, pero destruye la confianza necesaria para relaciones comerciales duraderas.</p>
          <p>La coacción implica usar presión indebida, amenazas o intimidación para forzar un acuerdo. En negociaciones empresariales, esto puede manifestarse como amenazas de acciones legales infundadas, presión sobre superiores del otro negociador o creación de consecuencias artificiales. La coacción no solo es éticamente reprensible, sino que puede tener implicaciones legales graves y generar contratos que posteriormente pueden ser anulados.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>En 2023, una empresa tecnológica de Barcelona perdió un contrato millonario con una multinacional después de que se descubriera que su director comercial había mentido sobre las capacidades técnicas de su software durante las negociaciones iniciales. Aunque el engaño no se descubrió hasta la fase de implementación, la multinacional no solo canceló el contrato, sino que compartió la experiencia en su red de proveedores, efectivamente vetando a la empresa de futuros proyectos en el sector. El director comercial fue despedido y la empresa tardó dos años en recuperar su reputación en el mercado catalán de tecnología.</p>
          </div>
        </section>

        {/* Sección 2: Dilemas Éticos Comunes y Estrategias de Resolución */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Dilemas Éticos Comunes y Estrategias de Resolución</h2>
          </div>

          <p>Los dilemas éticos en negociación raramente se presentan en blanco y negro. La mayoría de las situaciones reales involucran zonas grises donde las decisiones correctas no son evidentes. Identificar estos dilemas y desarrollar marcos de decisión claros es fundamental para mantener la integridad.</p>
          <p>Uno de los dilemas más frecuentes es el manejo de información privilegiada. ¿Qué hacer cuando conocemos información que podría cambiar significativamente la posición del otro negociador? Por ejemplo, saber que una empresa está a punto de ser adquirida mientras negociamos un contrato de suministro. El marco ético sugiere evaluar: ¿Es información que razonablemente deberían conocer? ¿Su desconocimiento los perjudica significativamente? ¿Revelar la información compromete nuestra posición legítima?</p>
          <p>Otro dilema común es la presión organizacional para obtener resultados 'a cualquier costo'. Cuando los superiores demandan resultados que solo pueden lograrse comprometiendo principios éticos, el profesional enfrenta el dilema entre la lealtad organizacional y la integridad personal. La estrategia recomendada es documentar las expectativas, proponer alternativas éticas y, si es necesario, escallar la situación a niveles superiores.</p>
          <p>El dilema de la reciprocidad también es frecuente: ¿Cómo responder cuando la otra parte usa tácticas poco éticas? La tentación de 'responder con la misma moneda' es fuerte, pero usualmente contraproducente. La estrategia más efectiva es nombrar el comportamiento directamente ('Noto que la información que me proporcionaste ayer ha cambiado significativamente') y establecer estándares claros para continuar la negociación.</p>
          <p>Para resolver estos dilemas, recomendamos el marco de las tres preguntas: ¿Es legal? ¿Es ético según mis valores? ¿Cómo me sentiría si esta decisión fuera pública? Este filtro simple pero efectivo ayuda a mantener la brújula moral en situaciones complejas.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Un gerente de compras de una cadena hotelera mexicana descubrió durante una negociación que su proveedor habitual de alimentos estaba ocultando problemas de calidad que habían causado intoxicaciones en otros hoteles. El gerente enfrentaba el dilema de usar esta información para obtener mejores precios (aprovechándose de la vulnerabilidad del proveedor) o abordar directamente el problema de calidad. Optó por la segunda opción: confrontó al proveedor sobre los problemas de calidad y negoció un plan de mejoras con penalizaciones claras. Aunque no obtuvo los descuentos que podría haber conseguido con chantaje, estableció una relación de confianza que resultó en un contrato de cinco años con términos favorables y cero incidentes de calidad.</p>
          </div>
        </section>

        {/* Sección 3: Construir Reputación a Largo Plazo: El Capital Más Valioso */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Construir Reputación a Largo Plazo: El Capital Más Valioso</h2>
          </div>

          <p>En el ecosistema empresarial hispanohablante, la reputación es el activo más valioso de un negociador. A diferencia de los recursos financieros o tecnológicos, la reputación se construye negociación por negociación y, una vez establecida, abre puertas que de otra manera permanecerían cerradas.</p>
          <p>La construcción de reputación comienza con la consistencia. Ser conocido por cumplir lo prometido, tratar con respeto a todas las partes y mantener estándares éticos altos, independientemente del tamaño o importancia de la negociación. En mercados como el español o el mexicano, donde los círculos empresariales son relativamente pequeños y las referencias circulan rápidamente, esta consistencia es crucial.</p>
          <p>La transparencia selectiva es otra herramienta poderosa. Esto no significa revelar toda la información, sino ser claro sobre limitaciones, plazos realistas y capacidades verdaderas. Un negociador con reputación de honestidad puede decir 'no puedo hacer eso' y ser creído, mientras que alguien sin esta reputación enfrentará escepticismo constante.</p>
          <p>La gestión de conflictos también contribuye significativamente a la reputación. Cómo manejamos las situaciones donde las cosas salen mal dice más sobre nuestro carácter que cómo actuamos cuando todo va bien. Asumir responsabilidad, proponer soluciones y mantener la calma bajo presión son características que se recuerdan y se comentan en redes profesionales.</p>
          <p>El networking ético es fundamental. Esto incluye mantener conexiones con personas de negociaciones pasadas, hacer seguimiento a acuerdos cerrados y, cuando es apropiado, hacer referrals o recomendaciones. En culturas donde las relaciones personales son importantes, estos gestos construyen un capital social invaluable.</p>
          <p>La reputación también se construye en cómo tratamos a personas con menos poder en la negociación. Cómo interactuamos con asistentes, proveedores pequeños o empleados junior es observado y recordado. En mercados emergentes latinoamericanos, donde la movilidad profesional es alta, la persona que hoy ocupa un puesto junior podría ser mañana el decisor clave en una negociación importante.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Patricia Hernández, directora de adquisiciones de una empresa farmacéutica colombiana, desarrolló una reputación excepcional en el sector durante sus 15 años de carrera. Su práctica de enviar seguimientos trimestrales a todos sus proveedores, reconocer públicamente el buen desempeño y manejar las crisis con transparencia la convirtió en la primera opción para proveedores internacionales que buscaban entrar al mercado colombiano. Cuando decidió independizarse como consultora en 2024, más del 80% de sus clientes iniciales fueron empresas que habían trabajado con ella anteriormente o que llegaron por referencia directa. Su reputación se había convertido literalmente en su principal activo empresarial, valuado por ella misma en más de 500,000 dólares en términos de oportunidades de negocio inmediatas.</p>
          </div>
        </section>

        {/* Sección 4: Negociar con Integridad: El Juego Infinito */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>Negociar con Integridad: El Juego Infinito</h2>
          </div>

          <p>El concepto de 'juego infinito', popularizado por James Carse y adaptado al mundo empresarial por Simon Sinek, revoluciona nuestra comprensión de la negociación ética. Mientras los juegos finitos se juegan para ganar, los juegos infinitos se juegan para continuar jugando. En negociación, esto significa optimizar para relaciones sostenibles en lugar de victorias de corto plazo.</p>
          <p>Negociar con mentalidad de juego infinito requiere un cambio fundamental de perspectiva. En lugar de ver cada negociación como una batalla donde hay ganadores y perdedores, la vemos como una oportunidad para fortalecer relaciones que generarán valor durante años. Esta perspectiva es especialmente relevante en mercados hispanohablantes, donde las relaciones comerciales tienden a ser más personales y duraderas.</p>
          <p>La integridad en este contexto significa alineación entre valores, palabras y acciones a través del tiempo. No se trata solo de ser honesto en una negociación específica, sino de construir un patrón de comportamiento que genere confianza predictiva. Cuando los otros negociadores pueden predecir que actuaremos con integridad, las negociaciones se vuelven más eficientes y los resultados más satisfactorios para todas las partes.</p>
          <p>El concepto de 'rival digno' es central en el juego infinito. En lugar de ver a la contraparte como un enemigo a derrotar, la vemos como un rival digno que nos ayuda a mejorar nuestras habilidades y a encontrar soluciones más creativas. Esta mentalidad fomenta colaboración en lugar de confrontación, llevando a resultados superiores para ambas partes.</p>
          <p>La inversión en capacidades propias es otro pilar del juego infinito. En lugar de buscar ventajas a través de tácticas cuestionables, invertimos en mejorar nuestras habilidades de negociación, conocimiento del mercado y capacidad de generar valor. Esta aproximación es sostenible a largo plazo y construye ventajas competitivas defendibles.</p>
          <p>Finalmente, el juego infinito requiere una visión causa mayor que el interés inmediato. Esto puede ser el éxito a largo plazo de la organización, el desarrollo de un sector industrial o el impacto positivo en la sociedad. Cuando negociamos con una causa mayor en mente, nuestras decisiones tienden naturalmente hacia la integridad y la sostenibilidad.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>El Grupo Bimbo, la empresa panificadora mexicana, ha aplicado consistentemente principios de juego infinito en sus negociaciones de adquisición durante su expansión latinoamericana. En lugar de usar tácticas agresivas para minimizar precios de compra, se enfocan en demostrar cómo la adquisición beneficiará a empleados, comunidades locales y consumidores. Durante la adquisición de panificadoras en Argentina, España y China, mantuvieron equipos locales, respetaron marcas regionales y cumplieron compromisos sociales previos de las empresas adquiridas. Esta aproximación ha resultado en integraciones más suaves, menor resistencia local y, paradójicamente, mejor desempeño financiero post-adquisición. Su reputación como 'adquirente ético' les ha dado acceso preferencial a oportunidades de compra en nuevos mercados, donde los dueños priorizan el legado de sus empresas sobre maximizar el precio de venta.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>Las líneas rojas éticas (mentir, manipular, coaccionar) una vez cruzadas comprometen permanentemente la credibilidad profesional</li>
            <li>Los dilemas éticos se resuelven mejor usando marcos de decisión claros como las tres preguntas: ¿Es legal? ¿Es ético? ¿Cómo me sentiría si fuera público?</li>
            <li>La reputación es el activo más valioso de un negociador y se construye a través de consistencia, transparencia y gestión ética de conflictos</li>
            <li>Negociar con mentalidad de juego infinito optimiza para relaciones sostenibles en lugar de victorias de corto plazo</li>
            <li>La integridad genera eficiencia en negociaciones al crear confianza predictiva entre las partes</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Puedes identificar una situación donde compromisiste tus valores éticos en una negociación? ¿Cuáles fueron las consecuencias a largo plazo?</li>
            <li>¿Cómo describirían tu reputación como negociador las personas con las que has trabajado en los últimos cinco años?</li>
            <li>¿En cuáles de tus negociaciones actuales estás aplicando mentalidad de juego finito cuando deberías estar pensando en juego infinito?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de tu próxima negociación importante, define por escrito cuáles son tus líneas rojas éticas no negociables. Compártelas con un mentor o colega de confianza para crear un sistema de accountability que te ayude a mantener tus estándares bajo presión.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de 2024 de IE Business School realizado en España y México, los ejecutivos que son percibidos como 'éticamente consistentes' por sus pares obtienen en promedio 23% mejores resultados en sus negociaciones a largo plazo, medido en términos de cumplimiento de acuerdos y oportunidades de re-negociación, comparado con aquellos percibidos como 'tácticamente agresivos'.</p>
      </div>
    </ChapterPage>
  );
}
