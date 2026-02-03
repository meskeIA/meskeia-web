'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEmpresaFamiliar.module.css';

export default function ComplejidadEmpresaFamiliarPage() {
  return (
    <ChapterPage chapterId="complejidad-empresa-familiar">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Las empresas familiares enfrentan una doble complejidad única en el mundo empresarial: deben gestionar simultáneamente las dinámicas familiares y las demandas del negocio. Esta dualidad se intensifica conforme la empresa crece y las generaciones se suceden, creando desafíos que van desde la toma de decisiones hasta la preservación de los valores fundacionales. Comprender cómo evoluciona esta complejidad es fundamental para garantizar la supervivencia y el éxito a largo plazo de cualquier empresa familiar.</p>
      </section>

        {/* Sección: La Dualidad de Complejidades: Familia vs Empresa */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>La Dualidad de Complejidades: Familia vs Empresa</h2>
          </div>
          <p>En las empresas familiares coexisten dos sistemas con lógicas diferentes que frecuentemente entran en tensión. El sistema familiar opera bajo principios de amor incondicional, lealtad y equidad, donde las decisiones se toman considerando las emociones y el bienestar de todos los miembros. Por el contrario, el sistema empresarial se rige por criterios de eficiencia, meritocracia y rentabilidad, donde las decisiones deben basarse en datos objetivos y resultados medibles.</p>
          <p>Esta dualidad genera conflictos únicos que no experimentan las empresas no familiares. Por ejemplo, cuando un hijo del fundador no posee las competencias necesarias para ocupar un puesto directivo, surge la tensión entre el deseo familiar de incluirlo (lógica familiar) y la necesidad empresarial de contar con el mejor talento disponible (lógica empresarial). Estos dilemas se magnifican cuando aumenta el número de familiares involucrados y cuando la empresa crece en tamaño y complejidad.</p>
          <p>La gestión exitosa requiere encontrar un equilibrio que respete ambos sistemas sin comprometer ninguno. Esto implica establecer estructuras de gobierno familiar claras, definir roles y responsabilidades específicas, y crear mecanismos de comunicación que permitan separar las decisiones familiares de las empresariales. Las empresas familiares más exitosas han aprendido a profesionalizar la gestión manteniendo los valores familiares como guía estratégica.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Mercadona ejemplifica perfectamente esta gestión dual. Mientras mantiene los valores familiares de los Roig centrados en el cliente y los trabajadores, ha profesionalizado completamente su gestión con directivos no familiares en posiciones clave, separando claramente las decisiones estratégicas familiares de la operación diaria del negocio.</p>
          </div>
        </section>

        {/* Sección: El Crecimiento Generacional: Desafíos Exponenciales */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📊</span>
            <h2 className={styles.sectionTitleText}>El Crecimiento Generacional: Desafíos Exponenciales</h2>
          </div>
          <p>El crecimiento generacional en las empresas familiares sigue una progresión matemática que complica exponencialmente su gestión. La primera generación, liderada por el fundador, funciona con estructuras simples y toma de decisiones centralizada. Sin embargo, cuando la segunda generación asume el control, el número de propietarios se multiplica, y con la tercera generación, puede llegar a incluir docenas de familiares con diferentes intereses, competencias y expectativas.</p>
          <p>Este crecimiento numérico conlleva desafíos específicos en múltiples dimensiones. En primer lugar, la comunicación se vuelve más compleja, ya que mantener informados y alineados a todos los miembros requiere estructuras formales que antes no existían. En segundo lugar, aparecen diferentes visiones sobre el futuro de la empresa, especialmente entre familiares que trabajan en el negocio y aquellos que son únicamente propietarios. En tercer lugar, surgen necesidades financieras diversas, donde algunos familiares pueden requerir liquidez mientras otros prefieren reinvertir en el crecimiento.</p>
          <p>Además, cada nueva generación aporta sus propias perspectivas, formación y experiencias, que pueden diferir significativamente de las generaciones anteriores. Los millennials y la Generación Z en las empresas familiares actuales priorizan aspectos como la sostenibilidad, la responsabilidad social y el equilibrio vida-trabajo, valores que pueden contrastar con el enfoque más tradicional de generaciones anteriores. Esta diversidad generacional, aunque enriquecedora, requiere mecanismos de integración y consenso cada vez más sofisticados.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> El grupo Puig, empresa familiar de perfumes y cosmética, gestiona actualmente su cuarta generación con más de 20 familiares involucrados. Han implementado un consejo familiar, una asamblea familiar anual y programas específicos de formación para preparar a las nuevas generaciones, reconociendo que la complejidad aumenta exponencialmente con cada generación.</p>
          </div>
        </section>

        {/* Sección: La Travesía Generacional: Primera a Tercera Generación */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>La Travesía Generacional: Primera a Tercera Generación</h2>
          </div>
          <p>Cada generación en una empresa familiar enfrenta desafíos únicos y cumple roles específicos en su evolución. La primera generación, caracterizada por el espíritu emprendedor del fundador, se enfoca en la creación, supervivencia y establecimiento del negocio. El fundador típicamente centraliza las decisiones, opera con estructuras informales y basa su liderazgo en el carisma personal y la visión empresarial. Su principal desafío es construir un negocio sostenible mientras prepara a la siguiente generación.</p>
          <p>La segunda generación asume el reto de la profesionalización y el crecimiento. Debe transformar la empresa artesanal del fundador en una organización más estructurada, implementando sistemas de gestión, procesos formales y estructuras organizativas. Esta generación frecuentemente lucha por equilibrar el respeto a la herencia del fundador con la necesidad de modernizar la empresa. Es común que surjan conflictos entre hermanos sobre la dirección estratégica, especialmente cuando poseen formaciones y experiencias diferentes.</p>
          <p>La tercera generación enfrenta el desafío de la diversificación y la renovación estratégica. Con un mayor número de propietarios familiares, debe gestionar la complejidad de múltiples ramas familiares con intereses potencialmente divergentes. Esta generación típicamente se caracteriza por una mayor profesionalización, la incorporación de talento externo en posiciones clave y la implementación de estructuras de gobierno familiar más sofisticadas. Su éxito depende de su capacidad para mantener la unidad familiar mientras adapta la empresa a nuevos mercados y oportunidades.</p>
          <p>Cada transición generacional representa un momento crítico que puede determinar la supervivencia de la empresa. Las estadísticas muestran que solo el 30% de las empresas familiares sobreviven a la segunda generación, y apenas el 12% llega a la tercera generación operando exitosamente.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Inditex representa un caso excepcional de transición exitosa de primera a segunda generación. Amancio Ortega construyó el imperio textil manteniendo el control y la visión estratégica, pero gradualmente incorporó talento profesional externo como Pablo Isla, quien dirigió la compañía durante más de una década, preparando el terreno para futuras transiciones generacionales.</p>
          </div>
        </section>

        {/* Sección: Claves de Supervivencia y Longevidad Empresarial */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Claves de Supervivencia y Longevidad Empresarial</h2>
          </div>
          <p>La longevidad de las empresas familiares depende de múltiples factores interrelacionados que deben gestionarse de manera integral y proactiva. El primer factor crítico es la planificación sucesoria temprana y sistemática. Las empresas familiares longevas no dejan la sucesión al azar, sino que implementan procesos estructurados de identificación, desarrollo y preparación de sucesores, que pueden durar décadas. Este proceso incluye la exposición de los potenciales sucesores a diferentes áreas del negocio, formación externa, experiencia en otras empresas y mentoring sistemático.</p>
          <p>El segundo factor es la profesionalización progresiva sin perder la esencia familiar. Esto implica implementar sistemas de gestión profesionales, contratar talento externo cuando sea necesario, establecer métricas de desempeño objetivas y crear estructuras organizativas eficientes. Sin embargo, esta profesionalización debe mantener los valores familiares que constituyen la ventaja competitiva única de la empresa.</p>
          <p>El tercer factor es la innovación y adaptación constante. Las empresas familiares longevas han demostrado una capacidad excepcional para reinventarse manteniendo su esencia. Esto incluye la diversificación estratégica, la adopción de nuevas tecnologías, la expansión a nuevos mercados y la evolución del modelo de negocio según las demandas del entorno.</p>
          <p>Finalmente, el gobierno familiar efectivo constituye el cuarto pilar de la longevidad. Esto incluye la existencia de órganos de gobierno familiar (asamblea familiar, consejo familiar), protocolos familiares claros, mecanismos de resolución de conflictos y sistemas de comunicación efectivos entre familiares. Estas estructuras permiten gestionar la creciente complejidad familiar mientras mantienen la unidad y el compromiso con el proyecto empresarial común.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> El Corte Inglés, con más de 80 años de historia, ha sobrevivido implementando estos factores clave: sucesión planificada desde Ramón Areces hasta Isidoro Álvarez y posteriormente a Marta Álvarez, profesionalización constante incorporando directivos externos, innovación continua adaptándose al retail digital, y estructuras de gobierno que han permitido gestionar la transición generacional exitosamente.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Las empresas familiares gestionan simultáneamente dos lógicas diferentes: la familiar (basada en emociones y equidad) y la empresarial (basada en eficiencia y resultados)</li>
            <li>La complejidad aumenta exponencialmente con cada generación, requiriendo estructuras de gobierno y comunicación cada vez más sofisticadas</li>
            <li>Cada generación cumple un rol específico: la primera crea y establece, la segunda profesionaliza y crece, la tercera diversifica y renueva</li>
            <li>Solo el 30% de empresas familiares sobrevive a la segunda generación y el 12% a la tercera, destacando la importancia de la gestión proactiva</li>
            <li>La longevidad depende de cuatro factores clave: planificación sucesoria, profesionalización con valores, innovación constante y gobierno familiar efectivo</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿En qué situaciones específicas has observado conflictos entre la lógica familiar y la empresarial en tu organización?</li>
            <li>¿Qué estructuras de gobierno familiar podrían ayudar a gestionar mejor la creciente complejidad generacional en tu empresa?</li>
            <li>¿Cuáles de los cuatro factores de longevidad empresarial consideras más débiles en tu empresa familiar actual?</li>
        </ol>
      </section>

      {/* Consejo Práctico */}
      <div className={styles.warningBox}>
        <p><strong>💼 Consejo Práctico:</strong> Implementa reuniones familiares mensuales separadas de las reuniones empresariales. En las familiares, discute temas de valores, visión compartida y bienestar familiar. En las empresariales, enfócate exclusivamente en resultados, estrategia y operaciones. Esta separación ayuda a gestionar la dualidad de complejidades de manera más efectiva.</p>
      </div>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Según un estudio de 2024 del Instituto de la Empresa Familiar, España cuenta con más de 1.1 millones de empresas familiares que generan el 67% del PIB y el 75% del empleo privado. Sin embargo, la edad promedio de los fundadores actuales es de 67 años, lo que significa que en los próximos 10 años se producirá la mayor transferencia generacional de la historia empresarial española.</p>
      </div>
    </ChapterPage>
  );
}
