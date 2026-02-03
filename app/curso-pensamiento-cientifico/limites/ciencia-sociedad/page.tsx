'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function CienciaSociedadPage() {
  return (
    <ChapterPage chapterId="ciencia-sociedad">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>La ciencia no existe en un vacío social, sino que se desarrolla dentro de contextos políticos, económicos y culturales específicos que influyen tanto en sus métodos como en sus aplicaciones. En el siglo XXI, enfrentamos desafíos sin precedentes que requieren una comprensión profunda de los límites y posibilidades de la empresa científica. Este capítulo explora cómo la ciencia interactúa con la sociedad democrática y examina los retos que definen nuestro futuro colectivo.</p>
      </section>

        {/* Sección: El Papel de la Ciencia en la Sociedad Contemporánea */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📌</span>
            <h2 className={styles.sectionTitleText}>El Papel de la Ciencia en la Sociedad Contemporánea</h2>
          </div>
          <p>La ciencia moderna ha transformado radicalmente nuestras sociedades, desde la medicina que prolonga nuestras vidas hasta las tecnologías que conectan el mundo. Sin embargo, su influencia va más allá de los productos tecnológicos: la ciencia moldea nuestra visión del mundo y fundamenta muchas decisiones políticas y sociales. En América Latina, vemos cómo la investigación científica en agricultura ha revolucionado cultivos tradicionales como el maíz y la quinoa, pero también genera debates sobre soberanía alimentaria y conocimientos ancestrales. La ciencia opera en una tensión constante entre su pretensión de objetividad universal y su inserción en contextos sociales particulares. Los científicos, lejos de ser observadores neutrales, son actores sociales cuyas investigaciones reflejan y a la vez influyen en las prioridades de sus sociedades. Esta dualidad plantea preguntas fundamentales: ¿quién decide qué se investiga? ¿cómo se distribuyen los beneficios del conocimiento científico? La respuesta a estas interrogantes define el carácter democrático o elitista de la empresa científica en cada sociedad.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> El desarrollo de vacunas contra el COVID-19 ilustra esta tensión: mientras la ciencia logró crear vacunas efectivas en tiempo récord, las decisiones sobre su distribución global revelaron profundas desigualdades sociales y geopolíticas.</p>
          </div>
        </section>

        {/* Sección: Ciencia y Democracia: Entre el Conocimiento Experto y la Participación Ciudadana */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🔍</span>
            <h2 className={styles.sectionTitleText}>Ciencia y Democracia: Entre el Conocimiento Experto y la Participación Ciudadana</h2>
          </div>
          <p>La relación entre ciencia y democracia presenta una paradoja fundamental: mientras la democracia se basa en el principio de que todos los ciudadanos pueden participar en las decisiones colectivas, la ciencia genera conocimientos especializados que requieren formación técnica para ser comprendidos cabalmente. Esta tensión se manifiesta en controversias como las políticas de salud pública, donde el conocimiento epidemiológico debe traducirse en medidas que afectan la vida cotidiana de millones de personas. En países como Chile y Costa Rica, los debates sobre energía nuclear ejemplifican esta problemática: ¿deben las decisiones tecnológicas quedar exclusivamente en manos de expertos, o los ciudadanos tienen derecho a participar aunque no posean conocimientos técnicos especializados? La democratización de la ciencia no implica relativizar el conocimiento científico, sino crear mecanismos para que la expertise técnica dialogue con los valores y preferencias ciudadanas. Esto requiere tanto científicos capaces de comunicar efectivamente como ciudadanos con alfabetización científica básica. El desafío es construir una 'democracia epistémica' que respete tanto el rigor del conocimiento científico como la legitimidad de la participación democrática.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> Los debates sobre el fracking en Argentina muestran esta tensión: mientras geólogos y economistas aportan datos técnicos sobre viabilidad y riesgos, las comunidades locales plantean preocupaciones sobre impacto ambiental y social que trascienden lo puramente científico.</p>
          </div>
        </section>

        {/* Sección: Los Desafíos Científicos del Siglo XXI: Límites y Posibilidades */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>💡</span>
            <h2 className={styles.sectionTitleText}>Los Desafíos Científicos del Siglo XXI: Límites y Posibilidades</h2>
          </div>
          <p>El siglo XXI presenta a la humanidad desafíos de una escala y complejidad sin precedentes que ponen a prueba los límites de la ciencia. El cambio climático, la pérdida de biodiversidad, las pandemias globales y la desigualdad social requieren enfoques científicos interdisciplinarios que trascienden las fronteras tradicionales entre disciplinas. En América Latina, la deforestación del Amazonas ejemplifica esta complejidad: su comprensión requiere integrar climatología, biología, antropología, economía y ciencias políticas. La ciencia enfrenta también límites epistemológicos inherentes. Los sistemas complejos, como el clima global o las sociedades humanas, presentan propiedades emergentes que desafían la predicción precisa. La incertidumbre no es una falla temporal del conocimiento científico, sino una característica intrínseca de muchos fenómenos naturales y sociales. Además, algunos problemas trascienden el ámbito científico: la ciencia puede informarnos sobre las consecuencias del cambio climático, pero no puede decirnos qué tipo de sociedad queremos construir. Estos límites no disminuyen la importancia de la ciencia, sino que subrayan la necesidad de integrarla con otras formas de conocimiento y con procesos democráticos de toma de decisiones.</p>
          
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> La gestión de recursos hídricos en México ilustra estos desafíos: aunque la hidrología puede modelar la disponibilidad de agua, las decisiones sobre su distribución entre agricultura, industria y consumo urbano involucran valores sociales que trascienden lo científico.</p>
          </div>
        </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
            <li>La ciencia no es neutral sino que está socialmente situada y refleja las prioridades de su contexto histórico</li>
            <li>La democratización de la ciencia requiere equilibrar la expertise técnica con la participación ciudadana</li>
            <li>Los desafíos del siglo XXI demandan enfoques interdisciplinarios que reconozcan los límites del conocimiento científico</li>
            <li>La incertidumbre es una característica intrínseca de muchos sistemas complejos, no una falla temporal del conocimiento</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
            <li>¿Cómo puede la ciencia mantener su rigor metodológico mientras se abre a la participación democrática en la definición de prioridades de investigación?</li>
            <li>¿Qué mecanismos institucionales podrían facilitar el diálogo entre conocimiento científico y saberes tradicionales en tu contexto local?</li>
            <li>Frente a la incertidumbre científica inherente en temas como el cambio climático, ¿cómo deberían las sociedades tomar decisiones políticas basadas en evidencia científica?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En 1975, los científicos de Asilomar, California, se impusieron voluntariamente una moratoria en la investigación con ADN recombinante hasta establecer protocolos de seguridad. Fue la primera vez en la historia que la comunidad científica pausó colectivamente una línea de investigación por consideraciones éticas, demostrando que la autorregulación científica es posible cuando existe consenso sobre los riesgos potenciales.</p>
      </div>
    </ChapterPage>
  );
}
