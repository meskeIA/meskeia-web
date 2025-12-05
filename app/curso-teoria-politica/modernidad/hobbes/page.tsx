'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function HobbesPage() {
  return (
    <ChapterPage chapterId={4}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🐉</span>
          <h2 className={styles.sectionTitleText}>Hobbes y el Leviatán</h2>
        </div>

        <p>
          <strong>Thomas Hobbes (1588-1679)</strong> es considerado el fundador del
          pensamiento político moderno. Su obra principal, <em>Leviatán</em> (1651),
          presenta la primera teoría sistemática del <strong>contrato social</strong>
          y la justificación racional del Estado.
        </p>

        <p>
          Hobbes vivió en una época de profunda crisis: la Guerra Civil inglesa (1642-1651)
          enfrentó al Parlamento contra el rey Carlos I, quien acabó decapitado. Este
          contexto de violencia y desorden marca profundamente su pensamiento.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>El Leviatán:</strong> El título hace referencia al monstruo bíblico
            del Libro de Job. Para Hobbes, el Estado es un &ldquo;dios mortal&rdquo;,
            una creación artificial pero todopoderosa que garantiza la paz y la seguridad.
          </p>
        </div>
      </section>

      {/* El estado de naturaleza */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚔️</span>
          <h2 className={styles.sectionTitleText}>El estado de naturaleza</h2>
        </div>

        <p>
          Hobbes parte de una pregunta fundamental: ¿cómo serían los hombres sin Estado,
          sin poder común que los gobierne? Su respuesta es pesimista: el <strong>estado
          de naturaleza</strong> sería una situación de guerra de todos contra todos.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;En una situación semejante no existe oportunidad para la industria,
            ya que su fruto es incierto; por consiguiente, no hay cultivo de la tierra,
            ni navegación... no hay artes, ni letras, ni sociedad; y lo que es peor de
            todo, existe un continuo temor y peligro de muerte violenta; y la vida del
            hombre es solitaria, pobre, tosca, embrutecida y breve.&rdquo;
          </p>
          <cite>— Hobbes, Leviatán, cap. XIII</cite>
        </div>

        <h3>¿Por qué la guerra es inevitable?</h3>
        <p>
          Hobbes identifica tres causas principales del conflicto:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🏆</span>
            <h4>Competencia</h4>
            <p>Los hombres compiten por bienes escasos: riqueza, honor, poder</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>😨</span>
            <h4>Desconfianza</h4>
            <p>Cada uno teme que el otro le ataque primero, lo que genera ataques preventivos</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>😤</span>
            <h4>Gloria</h4>
            <p>Los hombres buscan reconocimiento y están dispuestos a luchar por él</p>
          </div>
        </div>
      </section>

      {/* La igualdad natural */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚖️</span>
          <h2 className={styles.sectionTitleText}>La igualdad natural</h2>
        </div>

        <p>
          Paradójicamente, Hobbes parte de la <strong>igualdad natural</strong> de los
          hombres. No una igualdad moral, sino física e intelectual:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;La naturaleza ha hecho a los hombres tan iguales en las facultades
            del cuerpo y del espíritu que, aunque pueda encontrarse a veces un hombre
            manifiestamente más fuerte de cuerpo o más sagaz de entendimiento que otro,
            cuando se considera en conjunto, la diferencia entre hombre y hombre no es
            tan importante.&rdquo;
          </p>
          <cite>— Hobbes, Leviatán, cap. XIII</cite>
        </div>

        <p>
          Incluso el más débil puede matar al más fuerte (mediante astucia, alianzas o
          mientras duerme). Esta igualdad de poder genera igualdad de esperanza en conseguir
          los fines, y por tanto, conflicto.
        </p>

        <div className={styles.warningBox}>
          <p>
            <strong>Consecuencia radical:</strong> En el estado de naturaleza no hay
            justicia ni injusticia. &ldquo;Donde no hay poder común, no hay ley; donde
            no hay ley, no hay injusticia.&rdquo; Los conceptos morales solo tienen
            sentido dentro del Estado.
          </p>
        </div>
      </section>

      {/* El contrato social */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📜</span>
          <h2 className={styles.sectionTitleText}>El contrato social</h2>
        </div>

        <p>
          ¿Cómo salir del estado de naturaleza? Los hombres, guiados por el <strong>miedo
          a la muerte</strong> y el deseo de una vida cómoda, pactan entre sí crear un
          poder común:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Autorizo y transfiero a este hombre o asamblea de hombres mi derecho
            de gobernarme a mí mismo, con la condición de que tú transfieras a él tu
            derecho, y autorices todos sus actos de la misma manera.&rdquo;
          </p>
          <cite>— Hobbes, Leviatán, cap. XVII</cite>
        </div>

        <h3>Características del contrato hobbesiano</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🤝</span>
            <h4>Es horizontal</h4>
            <p>Los súbditos pactan entre sí, no con el soberano. Este no es parte del contrato.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>♾️</span>
            <h4>Es irrevocable</h4>
            <p>Una vez transferido el derecho, no se puede recuperar sin el consentimiento del soberano.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👑</span>
            <h4>Es absoluto</h4>
            <p>El soberano recibe todo el poder necesario para garantizar la paz.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🛡️</span>
            <h4>Es condicional</h4>
            <p>Solo hay obligación de obedecer mientras el soberano proteja. Si no puede, cesa la obligación.</p>
          </div>
        </div>
      </section>

      {/* El soberano */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👑</span>
          <h2 className={styles.sectionTitleText}>Los poderes del soberano</h2>
        </div>

        <p>
          El soberano (que puede ser un monarca o una asamblea) posee poderes prácticamente
          ilimitados:
        </p>

        <ul>
          <li><strong>Legislar:</strong> Es la única fuente de la ley</li>
          <li><strong>Juzgar:</strong> Es el árbitro final de todas las disputas</li>
          <li><strong>Nombrar funcionarios:</strong> Controla toda la administración</li>
          <li><strong>Hacer la guerra y la paz:</strong> Monopolio de la violencia legítima</li>
          <li><strong>Censurar doctrinas:</strong> Decide qué opiniones pueden expresarse</li>
          <li><strong>Determinar la propiedad:</strong> Los súbditos poseen lo que el soberano les permite</li>
        </ul>

        <div className={styles.highlightBox}>
          <p>
            <strong>¿Por qué tanto poder?</strong> Hobbes argumenta que un poder dividido
            o limitado no puede garantizar la paz. Los conflictos entre poderes (rey vs.
            parlamento) fueron precisamente la causa de la Guerra Civil. Solo un poder
            <strong>indivisible e irresistible</strong> puede prevenir el retorno al
            estado de naturaleza.
          </p>
        </div>
      </section>

      {/* Límites y derechos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔒</span>
          <h2 className={styles.sectionTitleText}>Límites del poder y derechos del súbdito</h2>
        </div>

        <p>
          Aunque el poder del soberano es absoluto, Hobbes reconoce algunos límites:
        </p>

        <h3>Derechos inalienables</h3>
        <ul>
          <li><strong>Derecho a la autodefensa:</strong> Nadie puede renunciar al derecho de resistir quien le amenaza de muerte</li>
          <li><strong>Derecho a no autoincriminarse:</strong> Nadie está obligado a acusarse a sí mismo</li>
          <li><strong>Si el soberano no protege:</strong> Cesa la obligación de obediencia</li>
        </ul>

        <h3>Libertad del súbdito</h3>
        <p>
          La libertad consiste en hacer todo aquello que la ley no prohíbe. &ldquo;El
          silencio de la ley&rdquo; permite la libertad de movimiento, comercio,
          educación de los hijos, etc.
        </p>

        <div className={styles.warningBox}>
          <p>
            <strong>Tensión fundamental:</strong> ¿Puede llamarse &ldquo;libre&rdquo;
            a quien vive bajo un poder absoluto? Para Hobbes sí: la alternativa (el
            estado de naturaleza) es peor. La libertad política es imposible sin
            seguridad, y la seguridad requiere un poder fuerte.
          </p>
        </div>
      </section>

      {/* Legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>El legado de Hobbes</h2>
        </div>

        <p>
          La influencia de Hobbes es paradójica: fue rechazado por casi todos sus
          contemporáneos (ateos, absolutistas, republicanos), pero sus ideas
          fundamentaron el pensamiento político posterior:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Contribuciones fundamentales:</strong><br />
            • El Estado como construcción artificial, no natural ni divina<br />
            • La legitimidad basada en el consentimiento (aunque hipotético)<br />
            • El individualismo metodológico: partir del individuo para explicar la sociedad<br />
            • La soberanía como poder indivisible<br />
            • El estado de naturaleza como herramienta conceptual<br />
            • La seguridad como fin primario del Estado
          </p>
        </div>

        <p>
          Locke, Rousseau y Kant criticaron a Hobbes, pero aceptaron su marco básico:
          el contrato social, el estado de naturaleza, la legitimidad por consentimiento.
          Incluso hoy, cuando hablamos de &ldquo;estado fallido&rdquo; o de zonas sin
          ley, evocamos el fantasma hobbesiano de la guerra de todos contra todos.
        </p>
      </section>
    </ChapterPage>
  );
}
