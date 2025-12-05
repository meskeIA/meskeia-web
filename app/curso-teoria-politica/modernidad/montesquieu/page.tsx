'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function MontesquieuPage() {
  return (
    <ChapterPage chapterId={6}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚖️</span>
          <h2 className={styles.sectionTitleText}>Montesquieu y la división de poderes</h2>
        </div>

        <p>
          <strong>Charles-Louis de Secondat, barón de Montesquieu (1689-1755)</strong>,
          es uno de los pensadores más influyentes de la Ilustración. Su obra principal,
          <em>El espíritu de las leyes</em> (1748), sentó las bases de la teoría
          constitucional moderna y del principio de <strong>separación de poderes</strong>.
        </p>

        <p>
          Montesquieu fue magistrado del Parlamento de Burdeos y viajó extensamente por
          Europa, quedando especialmente impresionado por el sistema político inglés.
          Su método combina el análisis empírico con la reflexión filosófica: busca
          entender las leyes no en abstracto, sino en relación con el clima, la geografía,
          las costumbres y la historia de cada pueblo.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>El espíritu de las leyes:</strong> El título refleja el proyecto
            de Montesquieu: no estudiar las leyes como normas aisladas, sino comprender
            el &ldquo;espíritu&rdquo; que las anima, las múltiples relaciones que las
            conectan con la sociedad que las produce.
          </p>
        </div>
      </section>

      {/* Tipos de gobierno */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏛️</span>
          <h2 className={styles.sectionTitleText}>Los tipos de gobierno</h2>
        </div>

        <p>
          Montesquieu distingue tres tipos de gobierno, cada uno con su <strong>naturaleza</strong>
          (lo que lo hace ser) y su <strong>principio</strong> (la pasión que lo mueve):
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🗳️</span>
            <h4>República</h4>
            <p><strong>Naturaleza:</strong> El pueblo (o parte de él) tiene el poder soberano</p>
            <p><strong>Principio:</strong> Virtud (amor a la patria y a la igualdad)</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👑</span>
            <h4>Monarquía</h4>
            <p><strong>Naturaleza:</strong> Uno solo gobierna según leyes fijas y establecidas</p>
            <p><strong>Principio:</strong> Honor (ambición de distinguirse)</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>😰</span>
            <h4>Despotismo</h4>
            <p><strong>Naturaleza:</strong> Uno solo gobierna sin leyes ni reglas, según su voluntad</p>
            <p><strong>Principio:</strong> Temor (miedo al castigo)</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <p>
            <strong>Importante:</strong> Montesquieu no considera al despotismo como un
            gobierno legítimo, sino como una <strong>corrupción</strong> del poder.
            Es el estado al que pueden degenerar tanto las repúblicas como las monarquías
            si pierden sus principios.
          </p>
        </div>
      </section>

      {/* Separación de poderes */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚖️</span>
          <h2 className={styles.sectionTitleText}>La separación de poderes</h2>
        </div>

        <p>
          La contribución más célebre de Montesquieu es su teoría de la <strong>separación
          de poderes</strong>, desarrollada especialmente en el Libro XI de <em>El espíritu
          de las leyes</em>, dedicado a la constitución de Inglaterra.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Cuando el poder legislativo y el poder ejecutivo se reúnen en la misma
            persona o el mismo cuerpo, no hay libertad... Tampoco hay libertad si el poder
            de juzgar no está separado del poder legislativo y del ejecutivo.&rdquo;
          </p>
          <cite>— Montesquieu, El espíritu de las leyes, XI, 6</cite>
        </div>

        <h3>Los tres poderes</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>📜</span>
            <h4>Poder Legislativo</h4>
            <p>Hace las leyes, las corrige o las deroga. Debe residir en una asamblea representativa.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>⚔️</span>
            <h4>Poder Ejecutivo</h4>
            <p>Hace la paz o la guerra, envía embajadas, establece la seguridad. Debe estar en manos del monarca.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>⚖️</span>
            <h4>Poder Judicial</h4>
            <p>Castiga los crímenes y juzga las disputas entre particulares. Debe ser independiente y temporal.</p>
          </div>
        </div>

        <h3>El equilibrio de poderes</h3>
        <p>
          Más que una separación absoluta, Montesquieu busca un <strong>equilibrio</strong>
          mediante controles mutuos. Cada poder debe poder &ldquo;frenar&rdquo; a los demás:
        </p>
        <ul>
          <li>El ejecutivo puede vetar las leyes del legislativo</li>
          <li>El legislativo puede fiscalizar al ejecutivo</li>
          <li>El judicial es independiente pero no permanente</li>
        </ul>

        <div className={styles.highlightBox}>
          <p>
            <strong>La fórmula célebre:</strong> &ldquo;Para que no se pueda abusar del
            poder es preciso que, por la disposición de las cosas, el poder detenga al
            poder.&rdquo; El poder no debe concentrarse en las mismas manos.
          </p>
        </div>
      </section>

      {/* La libertad política */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🕊️</span>
          <h2 className={styles.sectionTitleText}>La libertad política</h2>
        </div>

        <p>
          Montesquieu define la <strong>libertad política</strong> no como hacer lo que
          se quiere, sino como poder hacer lo que se debe querer:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;La libertad es el derecho de hacer todo lo que las leyes permiten; y
            si un ciudadano pudiera hacer lo que las leyes prohíben, no tendría más libertad,
            porque los demás tendrían ese mismo poder.&rdquo;
          </p>
          <cite>— Montesquieu, El espíritu de las leyes, XI, 3</cite>
        </div>

        <h3>Libertad y seguridad</h3>
        <p>
          La libertad política consiste también en la <strong>seguridad</strong> de que
          las leyes serán aplicadas de manera justa y previsible. Un ciudadano es libre
          cuando puede confiar en que no será perseguido arbitrariamente.
        </p>

        <div className={styles.warningBox}>
          <p>
            <strong>Contra el despotismo:</strong> En el despotismo, aunque no haya leyes
            que prohíban muchas cosas, el ciudadano no es libre porque vive en la
            incertidumbre y el temor. La libertad requiere leyes fijas y conocidas.
          </p>
        </div>
      </section>

      {/* Factores que influyen en las leyes */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>Factores que influyen en las leyes</h2>
        </div>

        <p>
          Una de las ideas más originales de Montesquieu es que las leyes deben adaptarse
          a las circunstancias de cada pueblo. No hay un modelo único válido universalmente.
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🌡️</span>
            <h4>Clima</h4>
            <p>El clima afecta al temperamento de los pueblos: el frío produce vigor, el calor indolencia.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🏔️</span>
            <h4>Geografía</h4>
            <p>Las islas favorecen la libertad, las grandes llanuras el despotismo.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>📊</span>
            <h4>Tamaño del territorio</h4>
            <p>Las repúblicas requieren territorios pequeños, las monarquías medianos, los despotismos grandes.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🙏</span>
            <h4>Religión y costumbres</h4>
            <p>Las leyes deben respetar las costumbres establecidas y no contradecir la religión predominante.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <p>
            <strong>Nota crítica:</strong> La teoría climática de Montesquieu fue
            criticada ya en su época y hoy se considera obsoleta y eurocéntrica.
            Sin embargo, su idea general de que las leyes deben adaptarse a las
            circunstancias sociales sigue siendo relevante.
          </p>
        </div>
      </section>

      {/* Legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>El legado de Montesquieu</h2>
        </div>

        <p>
          La influencia de Montesquieu en el constitucionalismo moderno es difícil de
          exagerar:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Influencia directa:</strong><br />
            • <strong>Constitución de EE.UU. (1787):</strong> Separación estricta entre
            ejecutivo, legislativo y judicial; sistema de checks and balances<br />
            • <strong>Declaración de Derechos del Hombre (1789):</strong> Art. 16:
            &ldquo;Una sociedad en la que la garantía de los derechos no está asegurada,
            ni la separación de poderes determinada, no tiene Constitución&rdquo;<br />
            • <strong>Todas las constituciones liberales:</strong> División de poderes
            como garantía de libertad
          </p>
        </div>

        <h3>Ideas fundamentales del legado</h3>
        <ul>
          <li>El poder debe estar dividido para evitar el abuso</li>
          <li>La libertad requiere leyes fijas y conocidas</li>
          <li>Cada forma de gobierno tiene su lógica propia</li>
          <li>Las leyes deben adaptarse a las circunstancias de cada sociedad</li>
          <li>El gobierno moderado es preferible a los extremos</li>
        </ul>

        <p>
          Montesquieu combinó el análisis empírico con la aspiración normativa: quería
          entender cómo funcionan las sociedades reales, pero también identificar las
          condiciones de la libertad política. Esta doble perspectiva lo convierte en
          un fundador tanto de la ciencia política como del constitucionalismo moderno.
        </p>
      </section>
    </ChapterPage>
  );
}
