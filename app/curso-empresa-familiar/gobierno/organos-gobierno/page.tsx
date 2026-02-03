'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEmpresaFamiliar.module.css';

export default function OrganosGobiernoPage() {
  return (
    <ChapterPage chapterId="organos-gobierno">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Las empresas familiares requieren estructuras de gobierno sofisticadas que equilibren los intereses de la familia con las necesidades del negocio. En 2024, observamos cómo gigantes como Inditex, Mercadona y El Corte Inglés han desarrollado sistemas de gobierno que les permiten mantener su esencia familiar mientras compiten globalmente. La clave del éxito radica en establecer órganos de decisión claros que separen la gestión familiar de la empresarial, evitando conflictos y optimizando la toma de decisiones. Este capítulo explorará las instituciones fundamentales que permiten a las empresas familiares profesionalizarse sin perder su identidad.</p>
      </section>

        {/* Sección: El Consejo de Familia: funciones y composición */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>El Consejo de Familia: funciones y composición</h2>
          </div>
          <p>El Consejo de Familia constituye el órgano de gobierno más característico de las empresas familiares, actuando como el nexo entre la familia y la empresa. Su función principal es preservar los valores familiares, facilitar la comunicación entre generaciones y establecer las políticas que regirán la relación familia-empresa. En España, la tendencia actual muestra que las empresas familiares más exitosas han formalizado estos consejos desde la segunda generación.</p>
          <p>La composición del Consejo de Familia debe ser representativa de todas las ramas familiares, incluyendo tanto a miembros activos en el negocio como a aquellos que permanecen como accionistas pasivos. Típicamente incluye entre 5 y 12 miembros, dependiendo del tamaño y complejidad de la familia empresaria. Es fundamental establecer criterios claros de participación, como edad mínima (generalmente 18-21 años), tenencia accionarial o conocimiento del negocio.</p>
          <p>Entre sus funciones específicas se encuentran: la elaboración y actualización del protocolo familiar, la definición de políticas de empleo familiar, la supervisión de programas de formación para la siguiente generación, la resolución de conflictos familiares y la comunicación de decisiones estratégicas. En el contexto latinoamericano, estos consejos también abordan temas culturales específicos como la migración generacional y la diversificación geográfica de la familia.</p>
          <p>Un aspecto crucial es la profesionalización del Consejo de Familia mediante la incorporación de consejeros independientes especializados en empresa familiar. Estos profesionales aportan objetividad y mejores prácticas, ayudando a evitar que las emociones familiares interfieran en decisiones estratégicas. La periodicidad de reuniones suele ser trimestral, con sesiones extraordinarias cuando las circunstancias lo requieren.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La familia March, propietaria de Grupo Ferrer, estableció en 2019 un Consejo de Familia que incluye representantes de las tres ramas familiares activas. Este órgano se reúne trimestralmente y ha desarrollado un protocolo familiar que regula desde el acceso de familiares a puestos directivos hasta las políticas de dividendos. Su éxito se evidencia en la armonía familiar mantenida durante la reciente expansión internacional del grupo farmacéutico.</p>
          </div>
        </section>

        {/* Sección: El Consejo de Administración en la empresa familiar */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📊</span>
            <h2 className={styles.sectionTitleText}>El Consejo de Administración en la empresa familiar</h2>
          </div>
          <p>El Consejo de Administración en las empresas familiares presenta características únicas que lo diferencian del modelo tradicional corporativo. Su desafío principal radica en equilibrar la representación familiar con la independencia necesaria para una supervisión efectiva de la gestión. En el contexto español actual, la Ley de Sociedades de Capital establece el marco legal, pero las empresas familiares requieren adaptaciones específicas para su realidad.</p>
          <p>La composición ideal combina consejeros familiares, independientes y ejecutivos en proporciones que varían según el tamaño y madurez de la empresa. Las mejores prácticas sugieren que al menos un tercio de los consejeros sean independientes, especialmente cuando la empresa alcanza cierta dimensión o cotiza en bolsa. Estos consejeros independientes aportan experiencia sectorial, conocimientos financieros y una perspectiva objetiva sobre las decisiones estratégicas.</p>
          <p>Las funciones del Consejo de Administración incluyen la supervisión de la estrategia empresarial, la evaluación del desempeño de la alta dirección, el control de riesgos y el cumplimiento normativo. En empresas familiares, debe también velar por el equilibrio entre los intereses de accionistas familiares y la sostenibilidad del negocio. Esto implica tomar decisiones difíciles sobre distribución de dividendos, reinversión de beneficios y políticas de crecimiento.</p>
          <p>Un aspecto distintivo es la gestión de conflictos de interés entre roles familiares y empresariales. El Consejo debe establecer protocolos claros para situaciones donde los intereses familiares puedan divergir de los empresariales. La profesionalización progresiva del Consejo, incorporando comités especializados (auditoría, retribuciones, nombramientos), se ha convertido en una tendencia dominante entre las empresas familiares españolas y latinoamericanas de mayor tamaño.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Mercadona, bajo el liderazgo de Juan Roig, mantiene un Consejo de Administración donde la familia conserva el control pero incorpora consejeros independientes con experiencia en retail y distribución. Este equilibrio le ha permitido mantener su cultura familiar de &#39;jefe&#39; mientras adopta las mejores prácticas de gobierno corporativo, siendo reconocida como una de las empresas mejor gestionadas de España.</p>
          </div>
        </section>

        {/* Sección: El Comité de Dirección y la gestión ejecutiva */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>El Comité de Dirección y la gestión ejecutiva</h2>
          </div>
          <p>El Comité de Dirección representa el núcleo operativo de la empresa familiar, donde se materializan las decisiones estratégicas aprobadas por el Consejo de Administración. Su composición y funcionamiento determinan en gran medida la capacidad de ejecución y la agilidad competitiva de la organización. En las empresas familiares, este órgano enfrenta el desafío único de integrar la visión familiar con la profesionalización de la gestión.</p>
          <p>La tendencia actual en España y Latinoamérica muestra una profesionalización creciente de estos comités, incorporando directivos externos junto a miembros familiares. Esta hibridación permite combinar el conocimiento profundo del negocio familiar con expertise sectorial y mejores prácticas de gestión. Los miembros familiares aportan continuidad, valores corporativos y visión a largo plazo, mientras que los profesionales externos contribuyen con metodologías, redes de contacto y experiencia en diferentes mercados.</p>
          <p>Las reuniones del Comité de Dirección suelen ser semanales o quincenales, con un enfoque en la ejecución operativa, seguimiento de KPIs y toma de decisiones tácticas. Es fundamental establecer procesos claros de reporting hacia el Consejo de Administración y mecanismos de comunicación con el Consejo de Familia cuando las decisiones afecten intereses familiares.</p>
          <p>Un aspecto crítico es la gestión del talento y la sucesión en puestos ejecutivos. El Comité debe equilibrar las aspiraciones de desarrollo de los miembros familiares con la necesidad de contar con los mejores profesionales en cada posición. Esto requiere políticas claras de evaluación del desempeño, planes de desarrollo y, en algunos casos, la valentía de tomar decisiones difíciles sobre la idoneidad de familiares para determinados roles.</p>
          <p>La digitalización y la sostenibilidad se han convertido en temas prioritarios para los Comités de Dirección en 2024, requiriendo nuevas competencias y enfoques de gestión que no siempre están presentes en las generaciones familiares tradicionales.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> El Corte Inglés ha evolucionado su Comité de Dirección incorporando profesionales externos en áreas clave como transformación digital y sostenibilidad, manteniendo el liderazgo familiar en las decisiones estratégicas. Esta estructura híbrida le ha permitido acelerar su adaptación al comercio omnicanal y a las nuevas expectativas de los consumidores, especialmente durante y después de la pandemia.</p>
          </div>
        </section>

        {/* Sección: Diferencias entre Junta de Accionistas y Consejo de Familia */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Diferencias entre Junta de Accionistas y Consejo de Familia</h2>
          </div>
          <p>La distinción entre la Junta de Accionistas y el Consejo de Familia constituye uno de los aspectos más complejos del gobierno de empresas familiares, generando frecuentes confusiones que pueden derivar en conflictos organizacionales. Ambos órganos representan a la familia, pero desde perspectivas y con objetivos fundamentalmente diferentes que requieren una delimitación precisa de competencias.</p>
          <p>La Junta de Accionistas es un órgano legal obligatorio que agrupa a todos los propietarios del capital social, independientemente de su condición familiar. Sus decisiones se basan estrictamente en criterios de propiedad accionarial y están reguladas por la legislación mercantil. Sus competencias incluyen la aprobación de cuentas anuales, distribución de dividendos, nombramiento de consejeros y decisiones sobre modificaciones estatutarias. Cada accionista ejerce sus derechos proporcionalmente a su participación en el capital.</p>
          <p>Por el contrario, el Consejo de Familia es un órgano voluntario que representa los intereses familiares más allá de la mera propiedad accionarial. Su enfoque trasciende lo puramente económico para abordar aspectos emocionales, valores, tradición y legado familiar. Aquí la representación puede seguir criterios diferentes a la participación accionarial, como la representación por ramas familiares o generaciones, buscando dar voz a todos los miembros de la familia empresaria.</p>
          <p>Las diferencias en el alcance temporal también son significativas. Mientras la Junta de Accionistas se centra en resultados y decisiones con impacto inmediato o a corto plazo, el Consejo de Familia adopta una perspectiva transgeneracional, preocupándose por la preservación del legado familiar y la preparación de futuras generaciones. Esta diferencia de horizontes temporales puede generar tensiones que requieren una gestión cuidadosa.</p>
          <p>En la práctica, es esencial establecer protocolos claros que definan qué temas corresponden a cada órgano y cómo se coordinarán cuando haya solapamientos. La comunicación fluida entre ambos órganos, a menudo a través de miembros que participan en ambos, resulta fundamental para evitar decisiones contradictorias o duplicidades funcionales.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En Puig, la empresa de perfumes y moda, la familia ha establecido una clara diferenciación: la Junta de Accionistas se centra en decisiones corporativas y financieras, mientras su Consejo de Familia gestiona temas como la formación de la cuarta generación, la preservación de valores corporativos y las políticas de filantropía familiar. Esta separación les ha permitido mantener la armonía familiar mientras toman decisiones empresariales ágiles en un sector altamente competitivo.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>El Consejo de Familia actúa como guardián de los valores familiares y facilitador de comunicación intergeneracional</li>
            <li>El Consejo de Administración debe equilibrar representación familiar con independencia profesional para una supervisión efectiva</li>
            <li>La profesionalización del Comité de Dirección es clave para mantener la competitividad sin perder la esencia familiar</li>
            <li>La Junta de Accionistas y el Consejo de Familia tienen enfoques complementarios pero diferenciados en tiempo y objetivos</li>
            <li>La comunicación y coordinación entre todos los órganos de gobierno es fundamental para evitar conflictos y duplicidades</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Qué órganos de gobierno existen actualmente en su empresa familiar y cómo se coordinan entre ellos?</li>
            <li>¿Cómo equilibra su familia los intereses emocionales familiares con las necesidades de profesionalización del negocio?</li>
            <li>¿Qué criterios utiliza o utilizaría para determinar la participación de miembros familiares versus profesionales externos en los órganos de gobierno?</li>
        </ol>
      </section>

      {/* Consejo Práctico */}
      <div className={styles.warningBox}>
        <p><strong>💼 Consejo Práctico:</strong> Elabore un diagrama organizacional que muestre claramente las competencias, composición y flujos de comunicación entre todos los órganos de gobierno de su empresa familiar. Esto ayudará a identificar solapamientos, vacíos de responsabilidad y oportunidades de mejora en la coordinación entre órganos.</p>
      </div>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Según un estudio de 2024 del Instituto de Empresa Familiar, el 78% de las empresas familiares españolas de tercera generación que han implementado Consejos de Familia formales muestran tasas de supervivencia superiores al 65%, comparado con solo el 12% de aquellas que no han formalizado estas estructuras de gobierno.</p>
      </div>
    </ChapterPage>
  );
}
