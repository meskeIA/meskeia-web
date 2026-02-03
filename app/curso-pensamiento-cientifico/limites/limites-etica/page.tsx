'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function LimitesEticaPage() {
  return (
    <ChapterPage chapterId="limites-etica">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La ciencia ha transformado nuestra comprensión del mundo y mejorado la vida humana de maneras extraordinarias. Sin embargo, también enfrenta límites fundamentales y plantea dilemas éticos complejos que requieren reflexión cuidadosa. Comprender estos límites y responsabilidades es esencial para una práctica científica responsable y una sociedad informada.</p>
      </section>

        {/* Sección: Lo que la ciencia no puede responder */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>Lo que la ciencia no puede responder</h2>
          </div>
          <p>La ciencia es una herramienta poderosa para comprender el mundo natural, pero tiene límites inherentes que debemos reconocer. Estos límites no representan fracasos de la ciencia, sino características fundamentales de su método y alcance.</p>
          <p>Primero, la ciencia no puede abordar preguntas de valor y significado. No puede decirnos si algo es moralmente correcto o incorrecto, bello o feo, o si la vida tiene un propósito último. Puede informarnos sobre las consecuencias de nuestras acciones, pero no puede decidir por nosotros qué valores debemos priorizar. Por ejemplo, la ciencia puede estudiar los efectos del divorcio en los niños, pero no puede determinar si el divorcio es moralmente aceptable en una situación particular.</p>
          <p>Segundo, existen límites epistemológicos fundamentales. El principio de incertidumbre de Heisenberg en la física cuántica demuestra que hay aspectos de la realidad que no podemos conocer simultáneamente con precisión absoluta. En las ciencias sociales, la complejidad de los sistemas humanos hace imposible predecir comportamientos individuales con certeza.</p>
          <p>Tercero, la ciencia enfrenta limitaciones metodológicas. Algunos fenómenos son únicos e irrepetibles, como eventos históricos específicos, lo que dificulta la aplicación del método científico tradicional. Además, ciertos experimentos son éticamente imposibles de realizar, limitando nuestro conocimiento en áreas como la psicología del desarrollo o la medicina.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Un médico puede explicar científicamente los efectos del alcohol en el embarazo, pero no puede decidir si una mujer embarazada debe o no consumir alcohol; esa es una decisión personal que involucra valores, circunstancias individuales y consideraciones éticas que van más allá del conocimiento científico.</p>
          </div>
        </section>

        {/* Sección: Dilemas éticos en la investigación científica */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Dilemas éticos en la investigación científica</h2>
          </div>
          <p>Los avances científicos generan dilemas éticos complejos que requieren un equilibrio cuidadoso entre el progreso del conocimiento y el respeto por los derechos humanos y el bienestar social. Estos dilemas se intensifican cuando las aplicaciones tecnológicas de la ciencia tienen consecuencias imprevistas o controvertidas.</p>
          <p>En la investigación médica, el dilema fundamental es cómo balancear los riesgos para los participantes con los beneficios potenciales para la sociedad. Los experimentos médicos del pasado, como los realizados por los nazis o el estudio de Tuskegee sobre la sífilis en Estados Unidos, nos recuerdan la importancia de proteger a los sujetos de investigación. Hoy enfrentamos nuevos desafíos con la edición genética CRISPR, que puede curar enfermedades pero también plantea preguntas sobre la 'mejora' humana y la equidad en el acceso a estas tecnologías.</p>
          <p>La inteligencia artificial presenta dilemas únicos. ¿Cómo desarrollamos algoritmos justos cuando los datos históricos reflejan sesgos sociales? En países latinoamericanos, donde los sistemas de crédito pueden discriminar contra poblaciones indígenas o rurales, ¿cómo garantizamos que los algoritmos de IA no perpetúen estas inequidades?</p>
          <p>La investigación en biotecnología agrícola también genera controversias. Los cultivos genéticamente modificados pueden aumentar la producción alimentaria y la resistencia a enfermedades, beneficiando a países con inseguridad alimentaria. Sin embargo, también plantean preocupaciones sobre la dependencia de semillas corporativas, efectos ambientales a largo plazo y la preservación de variedades tradicionales de cultivos.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> En México, el debate sobre el maíz transgénico ilustra perfectamente estos dilemas: mientras la tecnología podría aumentar la productividad agrícola, también amenaza la diversidad genética del maíz criollo, fundamental para la cultura y soberanía alimentaria del país.</p>
          </div>
        </section>

        {/* Sección: Responsabilidad científica y compromiso social */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Responsabilidad científica y compromiso social</h2>
          </div>
          <p>Los científicos tienen responsabilidades que van más allá de la búsqueda del conocimiento. Esta responsabilidad incluye consideraciones sobre cómo se conduce la investigación, cómo se comunican los resultados y cómo se aplican los descubrimientos científicos en la sociedad.</p>
          <p>La responsabilidad comienza con la integridad en la investigación. Los científicos deben evitar el fraude, la fabricación de datos y el plagio, pero también tienen la obligación de reconocer las limitaciones de sus estudios y evitar la sobregeneralización de resultados. Durante la pandemia de COVID-19, vimos tanto ejemplos positivos como negativos: mientras muchos científicos comunicaron responsablemente la incertidumbre inherente en los datos emergentes, otros hicieron afirmaciones prematuras que contribuyeron a la confusión pública.</p>
          <p>La comunicación científica responsable es crucial, especialmente en temas que afectan políticas públicas. Los científicos deben esforzarse por hacer su trabajo accesible al público general sin simplificar excesivamente o generar malentendidos. En el contexto del cambio climático, por ejemplo, los científicos han luchado por comunicar la certeza sobre el calentamiento global antropogénico mientras reconocen incertidumbres sobre impactos específicos locales.</p>
          <p>La responsabilidad también implica considerar las consecuencias sociales de la investigación. Los científicos deben reflexionar sobre quién se beneficia de su trabajo y quién podría verse perjudicado. Esto es particularmente relevante en la investigación financiada con fondos públicos, donde existe una obligación especial de servir al interés público. En América Latina, donde los recursos para investigación son limitados, los científicos enfrentan decisiones difíciles sobre qué problemas priorizar: ¿investigación básica que puede tener aplicaciones futuras, o investigación aplicada que aborde problemas sociales inmediatos?</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Un investigador argentino que estudia enfermedades tropicales desatendidas como el Chagas enfrenta el dilema de si enfocar su trabajo en mecanismos básicos de la enfermedad o en desarrollar tratamientos prácticos para comunidades rurales pobres que no interesan a las farmacéuticas multinacionales.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La ciencia tiene límites inherentes y no puede responder preguntas sobre valores, significado o moralidad</li>
            <li>Los avances científicos generan dilemas éticos complejos que requieren equilibrar beneficios sociales con riesgos y derechos individuales</li>
            <li>Los científicos tienen responsabilidades que incluyen integridad en la investigación, comunicación responsable y consideración de las consecuencias sociales</li>
            <li>La reflexión ética debe acompañar el progreso científico para asegurar que sirva al bienestar humano y la justicia social</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo podemos equilibrar la libertad de investigación científica con la protección de valores sociales y derechos humanos?</li>
            <li>¿Qué responsabilidad tienen los científicos de considerar las posibles aplicaciones negativas de sus descubrimientos?</li>
            <li>¿De qué manera los sesgos culturales y socioeconómicos pueden influir en qué preguntas científicas se consideran importantes o prioritarias?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> El famoso físico J. Robert Oppenheimer, director científico del Proyecto Manhattan que desarrolló la bomba atómica, posteriormente reflexionó sobre la responsabilidad científica citando el texto sagrado hindú Bhagavad Gita: 'Ahora me he convertido en la Muerte, el destructor de mundos', ilustrando cómo los científicos pueden enfrentar consecuencias morales imprevistas de su trabajo.</p>
      </div>
    </ChapterPage>
  );
}
