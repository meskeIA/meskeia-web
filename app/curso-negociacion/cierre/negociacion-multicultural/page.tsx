'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function NegociacionMulticulturalPage() {
  return (
    <ChapterPage chapterId="negociacion-multicultural">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>En un mundo cada vez más globalizado, el éxito empresarial depende de nuestra capacidad para negociar efectivamente con personas de diferentes culturas. Lo que funciona en España puede ser contraproducente en Japón, y lo que es cortés en México podría percibirse como debilidad en Alemania. Dominar las diferencias culturales en negociación no es solo una ventaja competitiva, es una necesidad para cualquier profesional del siglo XXI. Este módulo te equipará con las herramientas para navegar exitosamente en el complejo mundo de las negociaciones multiculturales.</p>
      </section>

        {/* Sección 1: Diferencias culturales en estilos de negociación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h2 className={styles.sectionTitleText}>Diferencias culturales en estilos de negociación</h2>
          </div>

          <p>Las culturas desarrollan estilos de negociación únicos basados en sus valores, historia y estructura social. Entender estas diferencias es fundamental para evitar malentendidos y construir relaciones sólidas.</p>
          <p>Las culturas individualistas como Estados Unidos priorizan los logros personales y la eficiencia. Los negociadores estadounidenses tienden a ser directos, orientados a resultados y prefieren acuerdos rápidos. Valoran la preparación técnica y los datos concretos por encima de las relaciones personales. En contraste, las culturas colectivistas como las asiáticas enfatizan la armonía grupal y las relaciones a largo plazo. Para ellos, conocer a la persona es tan importante como el negocio mismo.</p>
          <p>La percepción del tiempo también varía drásticamente. Los alemanes y suizos son monocrónicos: el tiempo es lineal, las citas son sagradas y la puntualidad refleja respeto. Las culturas policrónicas como las latinoamericanas ven el tiempo como flexible, priorizando las relaciones sobre los horarios estrictos.</p>
          <p>La jerarquía juega un papel crucial. En culturas con alta distancia de poder como Corea del Sur, la edad y el estatus determinan quién habla primero y toma decisiones. Las culturas igualitarias como las escandinavas permiten que cualquier miembro del equipo participe activamente.</p>
          <p>El concepto de 'salvar la cara' es vital en culturas asiáticas. Nunca contradecir públicamente o hacer que alguien se vea incompetente puede ser más importante que cerrar el mejor trato económico.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Una empresa española de energías renovables negoció con una compañía japonesa. Los españoles llegaron con presentaciones directas mostrando beneficios económicos inmediatos. Los japoneses parecían desinteresados. Solo después de tres cenas formales, intercambio de regalos corporativos y conocer las familias de los ejecutivos japoneses, comenzaron las verdaderas negociaciones. La empresa española aprendió que en Japón, 'nemawashi' (construir consenso informal antes de reuniones formales) es esencial. El contrato se cerró seis meses después, pero la relación duró décadas.</p>
          </div>
        </section>

        {/* Sección 2: Negociar con culturas de alto y bajo contexto */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h2 className={styles.sectionTitleText}>Negociar con culturas de alto y bajo contexto</h2>
          </div>

          <p>El antropólogo Edward Hall clasificó las culturas según cómo comunican información: alto contexto versus bajo contexto. Esta distinción es crucial para interpretar correctamente los mensajes durante negociaciones.</p>
          <p>Las culturas de bajo contexto (Alemania, Países Bajos, Estados Unidos, países escandinavos) comunican de manera explícita y directa. Las palabras tienen significado literal, los contratos son detallados y específicos, y el 'no' significa 'no'. Los negociadores alemanes, por ejemplo, esperan información precisa, cronogramas claros y decisiones rápidas basadas en hechos.</p>
          <p>Las culturas de alto contexto (Japón, Corea, países árabes, gran parte de Latinoamérica) comunican mediante subtextos, gestos, silencios y contexto situacional. Un 'sí' puede significar 'entiendo' pero no necesariamente 'acepto'. Las pausas largas no indican desinterés sino reflexión respetuosa.</p>
          <p>En negociaciones de alto contexto, es fundamental leer las señales no verbales. Un negociador japonés que inhala aire entre dientes está expresando dudas serias. Un ejecutivo árabe que ofrece múltiples tazas de té está construyendo confianza antes de abordar temas comerciales.</p>
          <p>La comunicación indirecta requiere paciencia y interpretación. Frases como 'es complicado' o 'necesitamos estudiarlo' en culturas asiáticas a menudo significan 'no' de manera respetuosa. Los negociadores latinos pueden usar historias personales para transmitir puntos comerciales importantes.</p>
          <p>Para tener éxito en contextos mixtos, adapta tu estilo. Con negociadores de bajo contexto, sé directo y específico. Con culturas de alto contexto, invierte tiempo en construir relaciones y aprende a interpretar señales sutiles.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Un director de compras mexicano negociaba un contrato de maquinaria con proveedores alemanes y coreanos. Los alemanes enviaron especificaciones técnicas detalladas, precios fijos y plazos definidos, esperando una respuesta rápida. Los coreanos invitaron al mexicano a cenar, preguntaron por su familia y hablaron de filosofía empresarial. Cuando el mexicano dijo 'suena interesante' a la propuesta coreana, ellos interpretaron interés genuino y prepararon una presentación elaborada. Los alemanes, al escuchar la misma frase, asumieron falta de compromiso. El mexicano aprendió a usar lenguaje específico con alemanes ('necesito reducir el precio 15%') y invertir tiempo relacional con los coreanos antes de discutir términos técnicos.</p>
          </div>
        </section>

        {/* Sección 3: Etiqueta y protocolo en negociaciones internacionales */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Etiqueta y protocolo en negociaciones internacionales</h2>
          </div>

          <p>El protocolo apropiado puede determinar el éxito o fracaso de una negociación antes de que comience la discusión comercial. Cada cultura tiene códigos específicos de comportamiento que demuestran respeto y profesionalismo.</p>
          <p>Los saludos varían significativamente. En Japón, la inclinación debe corresponder a la jerarquía: más profunda para superiores. En países árabes, un saludo prolongado con la mano derecha y preguntas por la familia son esenciales. Los alemanes prefieren apretones de manos firmes, breves y contacto visual directo. En India, el 'namaste' con palmas juntas es apropiado, especialmente con personas mayores.</p>
          <p>El intercambio de tarjetas de presentación tiene rituales específicos. En Japón, recibe las 'meishi' con ambas manos, léelas cuidadosamente y colócalas ordenadas por jerarquía en la mesa. Guardarlas inmediatamente en el bolsillo es una grave falta de respeto. En China, presenta tu tarjeta con ambas manos y el texto chino hacia el receptor.</p>
          <p>Los regalos corporativos requieren sensibilidad cultural. En China, evita relojes (símbolo de muerte) y números cuatro (mala suerte). En países musulmanes, evita productos de cuero o alcohol. Los alemanes prefieren regalos prácticos y de calidad, mientras que los japoneses valoran la presentación tanto como el contenido.</p>
          <p>La vestimenta comunica respeto y estatus. En culturas conservadoras como Corea del Sur, los trajes oscuros y formales son obligatorios. En Silicon Valley, la vestimenta casual puede generar más confianza que un traje. En países árabes, la modestia es crucial, especialmente para mujeres negociadoras.</p>
          <p>Los horarios de comida y reuniones varían. Los españoles pueden cenar a las 10 PM como parte de la negociación, mientras que los alemanes esperan terminar reuniones antes de las 5 PM. En Ramadán, evita programar almuerzos con socios musulmanes.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Una consultora argentina fue invitada a negociar un proyecto en Emiratos Árabes Unidos. Investigó previamente: vistió de manera conservadora, trajo regalos artesanales argentinos sin componentes de cuero, aprendió saludos básicos en árabe y evitó programar reuniones durante las horas de oración. Durante las reuniones, esperó a que le ofrecieran té antes de comenzar presentaciones, evitó mostrar las suelas de zapatos al sentarse y usó solo la mano derecha para documentos. Su cliente emiratí comentó posteriormente que su respeto por las costumbres locales fue decisivo para elegir su propuesta sobre competidores técnicamente similares pero culturalmente insensibles.</p>
          </div>
        </section>

        {/* Sección 4: Casos prácticos: EEUU, Europa, Asia, Latinoamérica */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>⚡</span>
            <h2 className={styles.sectionTitleText}>Casos prácticos: EEUU, Europa, Asia, Latinoamérica</h2>
          </div>

          <p>Analizar casos específicos por región permite desarrollar estrategias concretas para cada contexto cultural y evitar errores costosos en negociaciones reales.</p>
          <p>**Estados Unidos**: Los negociadores estadounidenses valoran la eficiencia, datos concretos y decisiones rápidas. Prepárate con ROI claro, cronogramas específicos y propuestas de ganar-ganar. Son directos con objeciones pero también flexibles para encontrar soluciones creativas. Evita demasiado contexto social; van directo al negocio.</p>
          <p>**Europa Occidental**: Los alemanes requieren preparación técnica exhaustiva, puntualidad absoluta y comunicación directa sin ambigüedades. Los franceses combinan lógica cartesiana con apreciación por el estilo y la presentación elegante. Los británicos usan humor sutil y understatement; un 'quite good' significa excelente. Los italianos mezclan formalidad con calidez personal.</p>
          <p>**Asia Oriental**: En Japón, invierte tiempo significativo en 'nemawashi' (construir consenso previo) y respeta la jerarquía estricta. Las decisiones son grupales y lentas pero muy duraderas. En China, las conexiones personales (guanxi) son fundamentales; cultiva relaciones a largo plazo. Los coreanos combinan respeto extremo por la edad con innovación tecnológica acelerada.</p>
          <p>**Latinoamérica**: Las relaciones personales preceden a los negocios. Los brasileños aprecian la calidez, proximidad física y conversaciones personales antes de temas comerciales. Los mexicanos valoran el respeto, la cortesía y evitan confrontaciones directas. Los chilenos y argentinos tienden a ser más directos que otros latinoamericanos pero mantienen la importancia de las relaciones. Los colombianos combinan formalidad en protocolos con flexibilidad en términos.</p>
          <p>**Medio Oriente**: La paciencia es virtud; las negociaciones pueden durar meses. La hospitalidad es sagrada; rechazar invitaciones sociales puede dañar relaciones comerciales. Las decisiones finales a menudo requieren aprobación familiar o tribal, no solo corporativa.</p>

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>Una startup fintech colombiana expandiéndose globalmente adaptó su estrategia por región: En Silicon Valley, presentaron métricas de crecimiento y escalabilidad en reuniones de 30 minutos. En Alemania, prepararon documentación técnica detallada sobre seguridad y cumplimiento regulatorio. En Japón, invirtieron seis meses construyendo relaciones antes de presentar productos, trabajando con consultores locales para navegar la jerarquía corporativa. En Brasil, participaron en eventos sociales, cenas familiares y construyeron 'jeitinho brasileiro' (flexibilidad creativa) en sus propuestas. Esta adaptación cultural les permitió cerrar contratos en cuatro continentes, mientras competidores con productos similares fracasaron por insensibilidad cultural.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
            <li>Las culturas individualistas priorizan eficiencia y resultados, mientras las colectivistas enfatizan relaciones y armonía grupal</li>
            <li>En culturas de alto contexto la comunicación es indirecta y sutil; en bajo contexto es explícita y directa</li>
            <li>El protocolo apropiado (saludos, regalos, vestimenta) puede determinar el éxito antes de comenzar negociaciones</li>
            <li>Cada región requiere estrategias específicas: eficiencia en EEUU, precisión en Alemania, relaciones en Asia, calidez en Latinoamérica</li>
            <li>Invertir tiempo en entender y respetar diferencias culturales genera ventajas competitivas duraderas</li>
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
            <li>¿Cómo ha influido mi trasfondo cultural en mi estilo de negociación y qué sesgos podría tener al negociar con otras culturas?</li>
            <li>¿Qué situaciones específicas he enfrentado donde las diferencias culturales crearon malentendidos y cómo podría haberlas manejado mejor?</li>
            <li>¿Con qué culturas planeo negociar en el futuro y qué investigación específica necesito hacer para prepararme adecuadamente?</li>
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>Antes de cualquier negociación internacional, invierte 30 minutos investigando tres aspectos clave de esa cultura: estilo de comunicación (directo vs indirecto), importancia de las relaciones vs tareas, y protocolo básico de reuniones. Esta pequeña inversión puede prevenir errores costosos y crear ventajas competitivas significativas.</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>Según un estudio de Harvard Business Review de 2024, las negociaciones internacionales que incluyen una fase de 'adaptación cultural' tienen 73% más probabilidades de generar acuerdos a largo plazo que aquellas que ignoran diferencias culturales. Las empresas que entrenan a sus ejecutivos en inteligencia cultural reportan un ROI promedio de 320% en sus negociaciones internacionales.</p>
      </div>
    </ChapterPage>
  );
}
