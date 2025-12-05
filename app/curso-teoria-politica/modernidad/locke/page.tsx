'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function LockePage() {
  return (
    <ChapterPage chapterId={5}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔐</span>
          <h2 className={styles.sectionTitleText}>John Locke y el liberalismo político</h2>
        </div>

        <p>
          <strong>John Locke (1632-1704)</strong> es considerado el padre del
          <strong>liberalismo político</strong>. Sus <em>Dos tratados sobre el gobierno civil</em>
          (1689) sentaron las bases teóricas de la Revolución Gloriosa inglesa y, posteriormente,
          de las revoluciones americana y francesa.
        </p>

        <p>
          A diferencia de Hobbes, Locke propone un Estado <strong>limitado</strong>, cuya
          función es proteger los derechos naturales de los individuos: vida, libertad y
          propiedad. Cuando el gobierno viola estos derechos, el pueblo tiene derecho a
          resistir y rebelarse.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Contexto histórico:</strong> Los <em>Dos tratados</em> se publicaron
            tras la Revolución Gloriosa (1688), que depuso al católico Jacobo II y
            estableció una monarquía constitucional con Guillermo de Orange. Locke
            justifica filosóficamente este cambio de régimen.
          </p>
        </div>
      </section>

      {/* Estado de naturaleza */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌿</span>
          <h2 className={styles.sectionTitleText}>El estado de naturaleza</h2>
        </div>

        <p>
          El estado de naturaleza de Locke es muy diferente al de Hobbes. No es un estado
          de guerra, sino un estado de <strong>libertad e igualdad</strong> gobernado
          por la ley natural:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;El estado de naturaleza tiene una ley de naturaleza que lo gobierna,
            y que obliga a todos; y la razón, que es esa ley, enseña a toda la humanidad
            que quiera consultarla que, siendo todos iguales e independientes, ninguno
            debe dañar a otro en su vida, salud, libertad o posesiones.&rdquo;
          </p>
          <cite>— Locke, Segundo Tratado, cap. II</cite>
        </div>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>⚔️</span>
            <h4>Hobbes</h4>
            <p>Estado de naturaleza = guerra de todos contra todos. Sin ley ni moral.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🌿</span>
            <h4>Locke</h4>
            <p>Estado de naturaleza = paz relativa gobernada por la ley natural y la razón.</p>
          </div>
        </div>

        <h3>El problema del estado de naturaleza</h3>
        <p>
          Aunque no es un estado de guerra, tiene inconvenientes que hacen deseable
          la creación del gobierno:
        </p>
        <ul>
          <li>Falta un <strong>juez imparcial</strong> para resolver disputas</li>
          <li>Cada uno es juez de su propia causa (parcialidad)</li>
          <li>Falta poder para <strong>ejecutar</strong> las sentencias</li>
          <li>Los castigos pueden ser desproporcionados (venganza)</li>
        </ul>
      </section>

      {/* La propiedad */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏠</span>
          <h2 className={styles.sectionTitleText}>La teoría de la propiedad</h2>
        </div>

        <p>
          La teoría lockeana de la <strong>propiedad</strong> es una de sus contribuciones
          más influyentes. Para Locke, la propiedad es un <strong>derecho natural</strong>,
          anterior al Estado:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Aunque la tierra y todas las criaturas inferiores sean comunes a todos
            los hombres, sin embargo, cada hombre tiene una propiedad en su propia persona.
            El trabajo de su cuerpo y la obra de sus manos son propiamente suyos.&rdquo;
          </p>
          <cite>— Locke, Segundo Tratado, cap. V</cite>
        </div>

        <h3>¿Cómo se adquiere la propiedad?</h3>
        <p>
          Locke establece que mezclando el <strong>trabajo</strong> con los recursos
          naturales, estos se convierten en propiedad privada:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🌍</span>
            <h4>Tierra común</h4>
            <p>Dios dio la tierra en común a todos los hombres</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>💪</span>
            <h4>+ Trabajo</h4>
            <p>El trabajo personal añade valor y saca el bien del estado común</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🏠</span>
            <h4>= Propiedad privada</h4>
            <p>El producto del trabajo es propiedad exclusiva de quien trabajó</p>
          </div>
        </div>

        <h3>Límites a la apropiación</h3>
        <ul>
          <li><strong>Cláusula de suficiencia:</strong> Debe quedar &ldquo;bastante y tan bueno&rdquo; para los demás</li>
          <li><strong>Cláusula de no desperdicio:</strong> No se puede acumular más de lo que se puede usar (pero el dinero permite superar este límite)</li>
        </ul>
      </section>

      {/* El contrato social */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📜</span>
          <h2 className={styles.sectionTitleText}>El contrato y el gobierno limitado</h2>
        </div>

        <p>
          Los hombres abandonan el estado de naturaleza no por miedo (como en Hobbes),
          sino para <strong>proteger mejor</strong> sus derechos ya existentes:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Fin del gobierno:</strong> &ldquo;El grande y principal fin de los
            hombres que se unen en comunidades y se ponen bajo gobierno es la preservación
            de su propiedad&rdquo; (entendida como vida, libertad y bienes).
          </p>
        </div>

        <h3>Diferencias con Hobbes</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👑</span>
            <h4>Hobbes: poder absoluto</h4>
            <p>El soberano está por encima de la ley. No hay límites a su poder.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>⚖️</span>
            <h4>Locke: poder limitado</h4>
            <p>El gobierno está sometido a la ley. Existen derechos que no puede violar.</p>
          </div>
        </div>

        <h3>División de poderes</h3>
        <p>
          Locke distingue tres poderes (aunque no son los mismos que Montesquieu):
        </p>
        <ul>
          <li><strong>Legislativo:</strong> El poder supremo, hace las leyes</li>
          <li><strong>Ejecutivo:</strong> Aplica las leyes de forma continua</li>
          <li><strong>Federativo:</strong> Gestiona las relaciones exteriores (guerra, paz, alianzas)</li>
        </ul>

        <p>
          El poder legislativo es el <strong>supremo</strong>, pero está limitado por
          la ley natural y el bien público. No puede transferirse ni actuar arbitrariamente.
        </p>
      </section>

      {/* El derecho de resistencia */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✊</span>
          <h2 className={styles.sectionTitleText}>El derecho de resistencia</h2>
        </div>

        <p>
          La aportación más revolucionaria de Locke es el <strong>derecho de resistencia</strong>:
          cuando el gobierno viola los derechos para los cuales fue instituido, el pueblo
          puede legítimamente rebelarse.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Cuando los legisladores intentan arrebatar y destruir la propiedad del
            pueblo, o reducirlo a la esclavitud bajo un poder arbitrario, se ponen a sí
            mismos en estado de guerra con el pueblo, que queda absuelto de cualquier
            obediencia adicional.&rdquo;
          </p>
          <cite>— Locke, Segundo Tratado, cap. XIX</cite>
        </div>

        <h3>¿Quién decide cuándo hay tiranía?</h3>
        <p>
          Esta es la pregunta crucial. Para Locke, cuando no hay un juez superior en la
          tierra, el <strong>pueblo</strong> debe juzgar. El pueblo es el árbitro final
          de si el gobierno ha actuado contra su confianza (trust).
        </p>

        <div className={styles.warningBox}>
          <p>
            <strong>Importante:</strong> Locke no promueve la rebelión fácil. El pueblo
            es paciente y solo se rebela tras repetidas violaciones. Además, es el
            gobierno el que inicia la &ldquo;rebelión&rdquo; cuando viola la ley; el
            pueblo solo responde en defensa propia.
          </p>
        </div>
      </section>

      {/* Tolerancia religiosa */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🙏</span>
          <h2 className={styles.sectionTitleText}>La tolerancia religiosa</h2>
        </div>

        <p>
          En su <em>Carta sobre la tolerancia</em> (1689), Locke defiende la separación
          entre Iglesia y Estado y la tolerancia entre diferentes confesiones cristianas:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Argumentos principales:</strong><br />
            • La fe no puede ser coaccionada; las creencias no cambian por la fuerza<br />
            • El magistrado civil solo tiene poder sobre bienes civiles, no espirituales<br />
            • La persecución religiosa genera desorden político<br />
            • La Iglesia es una asociación voluntaria
          </p>
        </div>

        <div className={styles.warningBox}>
          <p>
            <strong>Límites de la tolerancia lockeana:</strong> Locke excluye de la
            tolerancia a los católicos (por su lealtad al Papa, un &ldquo;príncipe
            extranjero&rdquo;) y a los ateos (porque los juramentos, base de la sociedad,
            no les obligan). Estos límites reflejan los prejuicios de su época.
          </p>
        </div>
      </section>

      {/* Legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>El legado de Locke</h2>
        </div>

        <p>
          La influencia de Locke en el mundo moderno es inmensa:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Influencia directa:</strong><br />
            • <strong>Declaración de Independencia de EE.UU.:</strong> &ldquo;Vida, libertad
            y búsqueda de la felicidad&rdquo; (variación de vida, libertad y propiedad)<br />
            • <strong>Constitución de EE.UU.:</strong> División de poderes, gobierno limitado<br />
            • <strong>Declaración de Derechos del Hombre (1789):</strong> Derechos naturales,
            soberanía popular<br />
            • <strong>Liberalismo clásico:</strong> Propiedad privada, mercado libre, Estado mínimo
          </p>
        </div>

        <p>
          Las ideas de Locke —derechos naturales, gobierno limitado, consentimiento de
          los gobernados, derecho de resistencia— se convirtieron en el vocabulario
          básico de las democracias liberales. Cuando hoy hablamos de &ldquo;derechos
          humanos&rdquo; o de &ldquo;Estado de derecho&rdquo;, estamos hablando en
          buena medida en términos lockeanos.
        </p>
      </section>
    </ChapterPage>
  );
}
