'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEmpresaFamiliar.module.css';

export default function TipologiasPage() {
  return (
    <ChapterPage chapterId="tipologias">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Las empresas familiares no siguen un patrón único de desarrollo y organización. A medida que evolucionan desde su fundación hasta convertirse en corporaciones multigeneracionales, adoptan diferentes modelos organizativos que reflejan tanto su madurez empresarial como la relación entre familia y negocio. En España y Latinoamérica, donde las empresas familiares representan más del 85% del tejido empresarial, entender estas tipologías es crucial para identificar fortalezas, debilidades y oportunidades de mejora. Cada modelo presenta características distintivas en términos de liderazgo, toma de decisiones, profesionalización y mecanismos de gobierno corporativo.</p>
      </section>

        {/* Sección: Modelo Capitán: La PYME del Fundador */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Modelo Capitán: La PYME del Fundador</h2>
          </div>
          <p>El modelo Capitán representa la fase inicial de la mayoría de empresas familiares, donde un emprendedor visionario lidera la creación y desarrollo del negocio con una estructura organizativa simple y centralizada. En este modelo, el fundador concentra la toma de decisiones, mantiene control directo sobre todas las operaciones y establece la cultura empresarial basada en sus valores personales y visión del negocio.</p>
          <p>Características distintivas incluyen una estructura organizativa plana con pocos niveles jerárquicos, comunicación directa e informal entre el fundador y los empleados, y sistemas de control basados en la supervisión personal más que en procedimientos formalizados. La empresa depende fuertemente del conocimiento, relaciones y carisma del fundador, quien actúa como el motor principal del crecimiento y la innovación.</p>
          <p>Este modelo presenta ventajas significativas como rapidez en la toma de decisiones, flexibilidad para adaptarse a cambios del mercado, y una cultura empresarial coherente y sólida. Sin embargo, también conlleva riesgos importantes: alta dependencia de una sola persona, dificultades para delegar responsabilidades, y limitaciones en el crecimiento cuando la empresa supera la capacidad de gestión directa del fundador.</p>
          <p>La transición desde este modelo requiere que el fundador desarrolle habilidades de delegación, implemente sistemas de gestión más formales, y prepare la organización para funcionar con mayor autonomía. Este proceso resulta especialmente desafiante para fundadores acostumbrados al control directo y puede generar resistencias internas.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Juan Roig, fundador de Mercadona, ejemplifica perfectamente este modelo en las primeras décadas de la empresa. Roig mantenía control directo sobre decisiones estratégicas y operativas, visitaba personalmente las tiendas, y estableció la cultura de &#39;El Jefe&#39; (el cliente) que sigue definiendo la identidad corporativa. Su liderazgo personal fue fundamental para transformar una pequeña empresa familiar en la cadena de supermercados líder en España.</p>
          </div>
        </section>

        {/* Sección: Modelo Emperador: El Líder Carismático */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📊</span>
            <h2 className={styles.sectionTitleText}>Modelo Emperador: El Líder Carismático</h2>
          </div>
          <p>El modelo Emperador surge cuando la empresa familiar ha crecido significativamente pero mantiene un liderazgo altamente centralizado en una figura carismática que ejerce autoridad indiscutible sobre toda la organización. A diferencia del modelo Capitán, aquí la empresa tiene mayor tamaño y complejidad, pero el poder de decisión sigue concentrado en el líder familiar, quien es percibido como indispensable para el éxito del negocio.</p>
          <p>Este modelo se caracteriza por un liderazgo autocrático donde el &#39;emperador&#39; familiar toma todas las decisiones importantes, establece la visión estratégica de manera unilateral, y mantiene control sobre aspectos operativos y estratégicos. La organización desarrolla una estructura más compleja que el modelo Capitán, pero los mecanismos de gobierno siguen siendo informales y centrados en la voluntad del líder.</p>
          <p>Las ventajas incluyen una dirección estratégica clara y coherente, capacidad de respuesta rápida ante oportunidades o crisis, y una identidad corporativa fuerte asociada al liderazgo carismático. El líder emperador suele tener una visión a largo plazo y capacidad para inspirar tanto a empleados como a stakeholders externos.</p>
          <p>Sin embargo, los riesgos son considerables: creación de una cultura de dependencia que inhibe la iniciativa de otros miembros, dificultades para atraer y retener talento directivo externo, y problemas graves de sucesión cuando el líder se retira o desaparece. La falta de sistemas de gobierno formales puede generar conflictos familiares y decisiones subóptimas basadas en criterios personales más que empresariales.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Florentino Pérez en ACS y Real Madrid representa este modelo de liderazgo emperador. Su figura carismática y autoridad indiscutible han sido fundamentales para el crecimiento de ambas organizaciones. En ACS, Pérez mantiene control estratégico absoluto y su visión personal define las decisiones de inversión y expansión internacional, convirtiéndose en una figura indispensable para el funcionamiento de estas empresas familiares.</p>
          </div>
        </section>

        {/* Sección: Modelo Equipo Familiar: Todos Trabajan Juntos */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Modelo Equipo Familiar: Todos Trabajan Juntos</h2>
          </div>
          <p>El modelo Equipo Familiar se desarrolla cuando múltiples miembros de la familia participan activamente en la gestión del negocio, compartiendo responsabilidades y trabajando de manera colaborativa. Este modelo surge típicamente en la segunda generación, cuando los hijos del fundador se incorporan al negocio y asumen diferentes roles operativos o estratégicos.</p>
          <p>La estructura organizativa se basa en la complementariedad de habilidades y conocimientos de los miembros familiares, quienes suelen especializarse en diferentes áreas funcionales como producción, ventas, finanzas o desarrollo de nuevos negocios. La toma de decisiones tiende a ser más consensuada que en modelos anteriores, aunque puede carecer de mecanismos formales de resolución de conflictos.</p>
          <p>Este modelo presenta ventajas importantes como mayor diversidad de perspectivas en la toma de decisiones, aprovechamiento de diferentes talentos y habilidades familiares, y un fuerte compromiso emocional de todos los participantes con el éxito del negocio. La colaboración familiar puede generar sinergias importantes y una cultura empresarial única basada en valores compartidos.</p>
          <p>Los desafíos incluyen potenciales conflictos entre hermanos o primos por diferencias de opinión o ambiciones personales, dificultad para establecer criterios objetivos de evaluación del desempeño, y riesgo de nepotismo que puede desmotivar a empleados no familiares. La ausencia de un liderazgo claro puede generar parálisis en la toma de decisiones o falta de dirección estratégica coherente.</p>
          <p>La sostenibilidad de este modelo requiere establecer reglas claras de participación familiar, desarrollar mecanismos de comunicación efectivos, y crear sistemas de gobierno que permitan aprovechar las ventajas de la colaboración familiar mientras se minimizan los conflictos potenciales.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Los hermanos Puig (Marc, Mariona y Josefina) en Puig ejemplifican este modelo trabajando conjuntamente en diferentes áreas de la empresa de perfumes y moda. Marc lidera la estrategia general, Mariona se enfoca en sostenibilidad y innovación, mientras Josefina maneja relaciones institucionales. Su colaboración ha permitido expandir la empresa internacionalmente manteniendo la cohesión familiar y empresarial.</p>
          </div>
        </section>

        {/* Sección: Modelo Familia Profesional: Gestión con Criterio */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Modelo Familia Profesional: Gestión con Criterio</h2>
          </div>
          <p>El modelo Familia Profesional representa un nivel superior de evolución organizativa donde la empresa familiar adopta prácticas de gestión profesional manteniendo el control familiar sobre las decisiones estratégicas clave. Este modelo surge cuando la familia reconoce la necesidad de incorporar talento externo y sistemas de gestión más sofisticados para competir efectivamente en mercados complejos.</p>
          <p>Características fundamentales incluyen la separación clara entre propiedad y gestión, con miembros familiares ocupando posiciones solo cuando poseen las competencias requeridas. Se establecen criterios objetivos para la participación de familiares en el negocio, incluyendo requisitos de formación, experiencia externa y evaluación de desempeño. Los sistemas de gobierno corporativo se formalizan con consejos de administración independientes, comités especializados y protocolos familiares.</p>
          <p>Este modelo permite aprovechar las ventajas de la continuidad familiar (visión a largo plazo, compromiso emocional, valores sólidos) mientras incorpora las mejores prácticas de gestión empresarial. La profesionalización mejora la competitividad, facilita el acceso a financiación externa, y prepara la empresa para enfrentar desafíos de mercados globalizados.</p>
          <p>Los beneficios incluyen mayor credibilidad ante stakeholders externos, mejores sistemas de control y evaluación del desempeño, y capacidad de atraer talento directivo de primer nivel. La combinación de valores familiares con gestión profesional puede crear ventajas competitivas sostenibles.</p>
          <p>Los desafíos principales involucran la resistencia de algunos familiares a adoptar criterios meritocráticos, la necesidad de invertir en sistemas de gestión más costosos y complejos, y el riesgo de perder parte de la agilidad y flexibilidad características de empresas familiares menos formalizadas.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Grifols, bajo el liderazgo de la familia Grifols, exemplifica este modelo al combinar control familiar estratégico con gestión altamente profesionalizada. La empresa mantiene valores familiares de innovación y compromiso social mientras opera con estándares internacionales en sus operaciones farmacéuticas globales. Los miembros familiares ocupan posiciones clave solo cuando poseen las qualificaciones necesarias, y la empresa cuenta con sistemas de governance sofisticados.</p>
          </div>
        </section>

        {/* Sección: Modelo Corporación: Familia Propietaria, Gestión Delegada */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Modelo Corporación: Familia Propietaria, Gestión Delegada</h2>
          </div>
          <p>El modelo Corporación representa la máxima evolución de la empresa familiar, donde la familia mantiene la propiedad y control estratégico pero delega completamente la gestión operativa a directivos profesionales externos. Este modelo surge típicamente en generaciones avanzadas cuando la empresa ha alcanzado gran tamaño y complejidad, operando en múltiples mercados y sectores.</p>
          <p>La estructura organizativa se asemeja a una corporación pública con sistemas de gobierno corporativo sofisticados, incluyendo consejos de administración independientes, comités especializados, y mecanismos formales de supervisión y control. La familia ejerce influencia principalmente a través de su participación en el consejo de administración y la definición de políticas estratégicas de largo plazo.</p>
          <p>Este modelo permite que la empresa compita efectivamente con corporaciones multinacionales mientras preserva la continuidad y estabilidad asociadas con la propiedad familiar. Los sistemas de gestión son completamente profesionalizados, con criterios de selección de directivos basados exclusivamente en mérito y competencia.</p>
          <p>Las ventajas incluyen acceso al mejor talento directivo disponible en el mercado, sistemas de gestión optimizados para competir globalmente, y credibilidad máxima ante inversores, reguladores y otros stakeholders. La separación entre propiedad y gestión reduce conflictos de interés y permite decisiones basadas en criterios puramente empresariales.</p>
          <p>Los desafíos involucran el riesgo de perder parte de la identidad y cultura familiar distintiva, costos elevados de sistemas de governance corporativo, y la necesidad de mantener mecanismos efectivos de comunicación entre familia propietaria y gestión profesional. La familia debe desarrollar sofisticadas competencias de supervisión estratégica sin interferir en la gestión operativa.</p>
          <p>El éxito de este modelo requiere que la familia propietaria mantenga cohesión en su visión estratégica de largo plazo y desarrolle mecanismos efectivos para preservar los valores familiares dentro de una estructura corporativa profesionalizada.</p>

          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Inditex, fundada por Amancio Ortega, representa este modelo donde la familia Ortega mantiene control accionarial significativo pero la gestión operativa está completamente delegada a directivos profesionales como Pablo Isla (ex-CEO) y Marta Ortega (actual presidenta). La empresa opera con sistemas de governance corporativo de nivel internacional mientras preserva los valores de innovación, rapidez y customer focus establecidos por el fundador.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>Cada modelo de empresa familiar responde a diferentes etapas de evolución y circunstancias específicas de mercado y familia</li>
            <li>La transición entre modelos requiere cambios profundos en sistemas de gobierno, cultura organizativa y competencias familiares</li>
            <li>No existe un modelo superior universalmente: cada uno presenta ventajas y desafíos específicos según el contexto</li>
            <li>El éxito a largo plazo depende de la capacidad de elegir y implementar el modelo más adecuado para cada situación</li>
            <li>La profesionalización progresiva es una tendencia común, pero debe equilibrarse con la preservación de valores familiares distintivos</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿En qué modelo se encuentra actualmente su empresa familiar y qué características específicas lo confirman?</li>
            <li>¿Cuáles son los principales obstáculos que enfrenta su familia para evolucionar hacia un modelo más profesionalizado?</li>
            <li>¿Qué valores y características familiares distintivas deberían preservarse independientemente del modelo organizativo adoptado?</li>
        </ol>
      </section>

      {/* Consejo Práctico */}
      <div className={styles.warningBox}>
        <p><strong>💼 Consejo Práctico:</strong> Realice una evaluación honesta del modelo actual de su empresa familiar identificando tres fortalezas y tres debilidades específicas. Esto le ayudará a determinar si es necesario evolucionar hacia otro modelo y qué aspectos específicos requieren atención prioritaria para mejorar el desempeño organizativo.</p>
      </div>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Según un estudio de 2024 del Instituto de la Empresa Familiar, solo el 15% de las empresas familiares españolas han logrado implementar exitosamente el modelo Corporación, pero estas representan más del 60% del volumen de facturación total del sector familiar español, demostrando que la profesionalización avanzada, aunque desafiante, puede generar ventajas competitivas significativas.</p>
      </div>
    </ChapterPage>
  );
}
