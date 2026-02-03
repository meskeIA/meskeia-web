'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function PlatonPage() {
  return (
    <ChapterPage chapterId={1}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📜</span>
          <h2 className={styles.sectionTitleText}>Platón y el Estado Ideal</h2>
        </div>

        <p>
          <strong>Platón (428-347 a.C.)</strong> nació en Atenas en el seno de una familia
          aristocrática. Su encuentro con Sócrates en 407 a.C. marcó el inicio de su
          dedicación a la filosofía, y la muerte de su maestro en 399 a.C., condenado por
          el pueblo ateniense, le corroboró en su desconfianza hacia la democracia.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;No acabarán los males para los hombres hasta que llegue la raza de los
            puros y auténticos filósofos al poder, o hasta que los jefes de las ciudades
            no se pongan verdaderamente a filosofar.&rdquo;
          </p>
          <cite>— Platón, Carta VII</cite>
        </div>

        <p>
          En 388 a.C. fundó la <strong>Academia</strong>, el primer centro de estudios
          dedicado específicamente al conocimiento, donde se estudiaron materias como
          matemáticas, retórica, astronomía y filosofía política.
        </p>
      </section>

      {/* La República */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏛️</span>
          <h2 className={styles.sectionTitleText}>La República (Politeia)</h2>
        </div>

        <p>
          La obra política más importante de Platón es <em>La República</em>, donde presenta
          el diseño de un <strong>Estado ideal</strong>. La pregunta central es:
          <em>¿Qué es la justicia?</em>, tanto desde la perspectiva individual (¿qué es un
          hombre bueno?) como política (¿qué es una polis justa?).
        </p>

        <h3>El origen de la sociedad</h3>
        <p>
          Para Platón, la sociedad se crea para satisfacer las necesidades del hombre:
          &ldquo;Ninguno de nosotros se basta a sí mismo, sino que necesita de muchas cosas&rdquo;.
          A diferencia de Aristóteles, no postula un impulso natural de sociabilidad, sino
          una necesidad práctica.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Las tres fases de la ciudad:</strong><br />
            1. <strong>Ciudad saludable:</strong> Vida simple con división básica del trabajo<br />
            2. <strong>Ciudad lujuriosa:</strong> Aparece la codicia y la necesidad de guerreros<br />
            3. <strong>Ciudad saneada:</strong> Purificada mediante la limitación de necesidades
          </p>
        </div>
      </section>

      {/* Estructura del Estado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚖️</span>
          <h2 className={styles.sectionTitleText}>La estructura del Estado ideal</h2>
        </div>

        <p>
          En la ciudad ideal platónica rige el <strong>principio de especialización</strong>:
          cada persona debe realizar la función para la que está naturalmente dotada.
          Platón establece una correspondencia entre las partes del alma y las clases sociales:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👑</span>
            <h4>Gobernantes-Filósofos</h4>
            <p>Alma racional · Virtud: Sabiduría · Función: Gobernar con conocimiento del Bien</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>⚔️</span>
            <h4>Guardianes-Guerreros</h4>
            <p>Alma irascible · Virtud: Valor · Función: Defender la ciudad</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🌾</span>
            <h4>Productores</h4>
            <p>Alma concupiscible · Virtud: Templanza · Función: Satisfacer necesidades materiales</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>⚖️</span>
            <h4>Justicia</h4>
            <p>Armonía entre las tres partes · Cada uno hace lo que le corresponde</p>
          </div>
        </div>

        <h3>La &ldquo;noble mentira&rdquo;</h3>
        <p>
          Para que los ciudadanos acepten su posición en la sociedad, Platón propone el
          mito de los metales: los dioses habrían mezclado oro en la composición de los
          gobernantes, plata en los guardianes, y bronce y hierro en los productores.
        </p>
      </section>

      {/* El filósofo-rey */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎓</span>
          <h2 className={styles.sectionTitleText}>El gobierno de los filósofos</h2>
        </div>

        <p>
          La propuesta más radical de Platón es que los <strong>filósofos deben gobernar</strong>.
          Su argumento parte de lo que considera que no funciona en la democracia:
        </p>

        <ul>
          <li><strong>Conflictos internos:</strong> Los filósofos pueden armonizar intereses por su visión del bien común</li>
          <li><strong>Incompetencia de gobernantes:</strong> Solo los filósofos conocen la verdad y pueden guiar correctamente</li>
          <li><strong>Mala educación:</strong> Los sofistas enseñan opiniones, no conocimiento verdadero</li>
        </ul>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Los filósofos son aquellos que pueden alcanzar lo que siempre es igual
            a sí mismo&rdquo; — es decir, las Ideas o Formas eternas, el mundo verdadero
            del que nuestro mundo sensible es solo una copia imperfecta.
          </p>
          <cite>— Platón, República</cite>
        </div>

        <h3>El mito de la caverna</h3>
        <p>
          La célebre alegoría ilustra la diferencia entre opinión y conocimiento: los
          hombres ordinarios son como prisioneros que solo ven sombras proyectadas en
          una pared, confundiéndolas con la realidad. El filósofo es quien logra liberarse,
          salir de la caverna y contemplar el sol (la Idea del Bien). Su deber es volver
          a la caverna para guiar a los demás.
        </p>
      </section>

      {/* Las paradojas */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Las tres paradojas</h2>
        </div>

        <p>
          Platón reconoce que su Estado ideal requiere romper con convenciones
          profundamente arraigadas. Propone tres <em>paradoxon</em> (contra-opiniones):
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👩‍⚖️</span>
            <h4>Igualdad de género</h4>
            <p>Hombres y mujeres deben poder realizar las mismas funciones según sus capacidades naturales</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🤝</span>
            <h4>Comunidad de bienes</h4>
            <p>Los guardianes no tendrán propiedad privada ni familias exclusivas para evitar intereses particulares</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <p>
            <strong>Nota crítica:</strong> El &ldquo;comunismo&rdquo; platónico solo afecta a la
            clase gobernante, no a los productores. No es una propuesta de igualdad
            económica general, sino un mecanismo para garantizar la dedicación exclusiva
            de los gobernantes al bien común.
          </p>
        </div>
      </section>

      {/* Evaluación */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Evaluación y legado</h2>
        </div>

        <p>
          <em>La República</em> es un texto complejo que admite múltiples interpretaciones.
          Algunos ven en ella principalmente una reflexión sobre el <strong>alma individual</strong>
          y la vida filosófica, más que un programa político práctico. Otros la interpretan
          como el primer diseño de una <strong>utopía política</strong>.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Ideas clave del legado platónico:</strong><br />
            • El Estado como reflejo del orden del alma<br />
            • La educación como fundamento del orden político<br />
            • La tensión entre filosofía y política, entre verdad y opinión<br />
            • El gobierno debe basarse en el conocimiento, no en la voluntad popular<br />
            • La justicia como armonía, cada cual cumpliendo su función
          </p>
        </div>

        <p>
          La influencia de Platón en la historia del pensamiento político es inmensa:
          desde las utopías renacentistas hasta las críticas de Karl Popper en el siglo XX,
          quien vio en Platón el origen del &ldquo;totalitarismo&rdquo;. Sea cual sea la
          interpretación, <em>La República</em> plantea preguntas fundamentales que siguen
          vigentes: ¿Quién debe gobernar? ¿Cuál es la relación entre conocimiento y poder?
          ¿Puede la política hacer buenos a los ciudadanos?
        </p>
      </section>
    </ChapterPage>
  );
}
