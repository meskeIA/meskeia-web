'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function RawlsPage() {
  return (
    <ChapterPage chapterId={9}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📊</span>
          <h2 className={styles.sectionTitleText}>Rawls y la teoría de la justicia</h2>
        </div>

        <p>
          <strong>John Rawls (1921-2002)</strong> fue un filósofo político estadounidense
          cuya obra <em>Teoría de la justicia</em> (1971) revitalizó la filosofía política
          normativa y se convirtió en una de las obras más influyentes del siglo XX.
        </p>

        <p>
          Rawls intentó formular una teoría de la justicia que pudiera servir como
          alternativa tanto al utilitarismo (que justifica sacrificar a algunos por el
          bien de la mayoría) como al libertarismo (que ignora las desigualdades
          inmerecidas). Su propuesta: la <strong>justicia como equidad</strong>.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Obras principales:</strong><br />
            • <em>Teoría de la justicia</em> (1971)<br />
            • <em>Liberalismo político</em> (1993)<br />
            • <em>La justicia como equidad: una reformulación</em> (2001)
          </p>
        </div>
      </section>

      {/* El problema de la justicia */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>❓</span>
          <h2 className={styles.sectionTitleText}>El problema de la justicia</h2>
        </div>

        <p>
          Rawls se pregunta: ¿Cuáles serían los principios de justicia que elegirían
          personas racionales para organizar la estructura básica de la sociedad?
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;La justicia es la primera virtud de las instituciones sociales,
            como la verdad lo es de los sistemas de pensamiento.&rdquo;
          </p>
          <cite>— Rawls, Teoría de la justicia</cite>
        </div>

        <h3>La estructura básica de la sociedad</h3>
        <p>
          Rawls se centra en la <strong>estructura básica</strong>: las instituciones
          principales (constitución política, sistema económico, familia, propiedad)
          que distribuyen derechos, deberes y las ventajas de la cooperación social.
        </p>

        <div className={styles.warningBox}>
          <p>
            <strong>Importante:</strong> Rawls no propone principios para evaluar
            acciones individuales, sino para juzgar las <strong>instituciones</strong>.
            Una sociedad justa es aquella cuyas instituciones básicas cumplen con
            los principios de justicia.
          </p>
        </div>
      </section>

      {/* La posición original */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎭</span>
          <h2 className={styles.sectionTitleText}>La posición original</h2>
        </div>

        <p>
          El dispositivo metodológico central de Rawls es la <strong>posición original</strong>:
          una situación hipotética en la que las partes eligen los principios de justicia
          desde detrás de un <strong>&ldquo;velo de ignorancia&rdquo;</strong>.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>El velo de ignorancia:</strong> Las partes no conocen:<br />
            • Su posición social o clase<br />
            • Sus talentos y habilidades naturales<br />
            • Su concepción del bien (religión, valores, planes de vida)<br />
            • Las particularidades de su sociedad (nivel de desarrollo, etc.)<br />
            • Su generación
          </p>
        </div>

        <h3>¿Por qué el velo de ignorancia?</h3>
        <p>
          Si nadie sabe qué posición ocupará en la sociedad, nadie puede diseñar
          principios que le favorezcan personalmente. El velo garantiza la
          <strong>imparcialidad</strong>: los principios elegidos serán justos
          porque no están sesgados por intereses particulares.
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎲</span>
            <h4>Sin el velo</h4>
            <p>Los ricos propondrían bajos impuestos; los pobres, redistribución total. No hay acuerdo imparcial.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎭</span>
            <h4>Con el velo</h4>
            <p>Como puedo acabar en cualquier posición, elegiré principios que protejan también a los peor situados.</p>
          </div>
        </div>
      </section>

      {/* Los dos principios de justicia */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚖️</span>
          <h2 className={styles.sectionTitleText}>Los dos principios de justicia</h2>
        </div>

        <p>
          Rawls argumenta que, desde la posición original, las personas elegirían dos
          principios ordenados lexicográficamente (el primero tiene prioridad sobre el segundo):
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Primer principio (libertades básicas):</strong><br />
            &ldquo;Cada persona ha de tener un derecho igual al esquema más extenso de
            libertades básicas iguales que sea compatible con un esquema semejante de
            libertades para los demás.&rdquo;
          </p>
        </div>

        <p>
          Las libertades básicas incluyen: libertad de pensamiento y conciencia, libertad
          de expresión, derecho al voto, derecho a ocupar cargos públicos, libertad
          personal (integridad física, propiedad personal), protección contra la
          detención arbitraria.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Segundo principio (igualdad):</strong><br />
            Las desigualdades sociales y económicas deben satisfacer dos condiciones:<br /><br />
            a) <strong>Principio de diferencia:</strong> Deben beneficiar a los miembros
            menos aventajados de la sociedad.<br /><br />
            b) <strong>Igualdad de oportunidades:</strong> Deben estar vinculadas a
            posiciones y cargos abiertos a todos en condiciones de justa igualdad de
            oportunidades.
          </p>
        </div>
      </section>

      {/* El principio de diferencia */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📈</span>
          <h2 className={styles.sectionTitleText}>El principio de diferencia</h2>
        </div>

        <p>
          El <strong>principio de diferencia</strong> es la aportación más original de Rawls.
          No exige igualdad absoluta, pero sí que cualquier desigualdad solo es justa si
          mejora la situación de los más desfavorecidos:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>❌</span>
            <h4>Desigualdad injusta</h4>
            <p>Los ricos ganan más, pero los pobres no mejoran (o empeoran)</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>✅</span>
            <h4>Desigualdad justa</h4>
            <p>Los ricos ganan más, pero esto genera beneficios que también mejoran la situación de los pobres</p>
          </div>
        </div>

        <h3>Justificación del principio de diferencia</h3>
        <p>
          Rawls argumenta que, tras el velo de ignorancia, las personas serían
          <strong>aversos al riesgo</strong> (criterio &ldquo;maximin&rdquo;): preferirían
          maximizar el mínimo, asegurarse de que, si les toca la peor posición, esta
          sea lo mejor posible.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Los talentos y capacidades naturales son, desde el punto de vista
            moral, arbitrarios. Nadie merece sus dotes naturales ni su posición de
            partida en la sociedad.&rdquo;
          </p>
          <cite>— Rawls, Teoría de la justicia</cite>
        </div>
      </section>

      {/* Críticas */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Críticas a Rawls</h2>
        </div>

        <h3>Desde la izquierda</h3>
        <ul>
          <li><strong>G.A. Cohen:</strong> El principio de diferencia permite demasiada desigualdad; los talentosos pueden &ldquo;extorsionar&rdquo; a la sociedad</li>
          <li><strong>Feminismo:</strong> Rawls ignora la familia como esfera de justicia; el velo oculta el género</li>
          <li><strong>Comunitarismo:</strong> El &ldquo;yo&rdquo; rawlsiano es abstracto, sin identidad ni comunidad</li>
        </ul>

        <h3>Desde la derecha</h3>
        <ul>
          <li><strong>Robert Nozick:</strong> Los talentos sí son &ldquo;míos&rdquo;; la redistribución viola la propiedad de uno mismo</li>
          <li><strong>Libertarismo:</strong> El Estado mínimo es el único justo; cualquier redistribución es coerción</li>
          <li><strong>Utilitarismo:</strong> ¿Por qué priorizar a los peor situados sobre el bienestar agregado?</li>
        </ul>

        <div className={styles.warningBox}>
          <p>
            <strong>El propio Rawls evolucionó:</strong> En <em>Liberalismo político</em>
            (1993) reformuló su teoría para hacerla compatible con el pluralismo de
            doctrinas comprehensivas. El consenso sobre la justicia debe ser
            &ldquo;político, no metafísico&rdquo;.
          </p>
        </div>
      </section>

      {/* Legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>El legado de Rawls</h2>
        </div>

        <p>
          La influencia de Rawls en la filosofía política contemporánea es inmensa:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Contribuciones fundamentales:</strong><br />
            • Revitalizó la filosofía política normativa (frente al positivismo y al análisis conceptual)<br />
            • Estableció la justicia distributiva como problema central<br />
            • Desarrolló el contractualismo moderno<br />
            • Articuló el liberalismo igualitario<br />
            • Influyó en debates sobre redistribución, Estado del bienestar, derechos humanos
          </p>
        </div>

        <h3>Ideas fundamentales del legado rawlsiano</h3>
        <ul>
          <li>La justicia exige igualdad de libertades básicas para todos</li>
          <li>Las desigualdades solo son justas si benefician a los menos aventajados</li>
          <li>Las posiciones sociales deben estar abiertas a todos en igualdad de oportunidades</li>
          <li>Los talentos naturales son moralmente arbitrarios; sus frutos deben compartirse</li>
          <li>Una sociedad justa es aquella que todos podrían aceptar desde una posición imparcial</li>
        </ul>

        <p>
          Aunque ha sido criticado desde múltiples perspectivas, Rawls estableció los
          términos del debate contemporáneo sobre la justicia. Prácticamente toda la
          filosofía política posterior se define en relación con él: ampliando,
          criticando o reformulando su teoría. Sus preguntas siguen siendo las nuestras:
          ¿Qué debemos a los demás? ¿Cuánta desigualdad es aceptable? ¿Cómo organizar
          una sociedad de ciudadanos libres e iguales?
        </p>
      </section>
    </ChapterPage>
  );
}
