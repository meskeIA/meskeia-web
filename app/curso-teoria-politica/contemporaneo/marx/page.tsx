'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function MarxPage() {
  return (
    <ChapterPage chapterId={8}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚙️</span>
          <h2 className={styles.sectionTitleText}>Marx y la crítica del capitalismo</h2>
        </div>

        <p>
          <strong>Karl Marx (1818-1883)</strong> fue un filósofo, economista e historiador
          alemán cuyo pensamiento transformó radicalmente la teoría política y social.
          Su análisis del capitalismo y su visión de una sociedad sin clases influyeron
          en movimientos revolucionarios, partidos políticos y regímenes de todo el mundo.
        </p>

        <p>
          Nacido en Tréveris (Prusia) en una familia de origen judío, Marx estudió derecho
          y filosofía, trabajó como periodista y vivió exiliado en París, Bruselas y
          finalmente Londres, donde escribió sus obras principales, incluido <em>El Capital</em>.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Obras fundamentales:</strong><br />
            • <em>Manuscritos económico-filosóficos</em> (1844)<br />
            • <em>El Manifiesto Comunista</em> (1848, con Engels)<br />
            • <em>El Capital</em> (Vol. I, 1867; Vols. II y III póstumos)
          </p>
        </div>
      </section>

      {/* Materialismo histórico */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏭</span>
          <h2 className={styles.sectionTitleText}>El materialismo histórico</h2>
        </div>

        <p>
          Marx propone una nueva forma de entender la historia: el <strong>materialismo
          histórico</strong>. Frente al idealismo de Hegel (que veía la historia como
          desarrollo del Espíritu), Marx afirma que son las condiciones materiales de
          producción las que determinan la vida social:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;No es la conciencia de los hombres la que determina su ser, sino,
            por el contrario, el ser social es lo que determina su conciencia.&rdquo;
          </p>
          <cite>— Marx, Prólogo a la Contribución a la crítica de la economía política</cite>
        </div>

        <h3>Base y superestructura</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🏗️</span>
            <h4>Base (estructura económica)</h4>
            <p>Las fuerzas productivas (tecnología, trabajo) y las relaciones de producción (propiedad, clases)</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🏛️</span>
            <h4>Superestructura</h4>
            <p>El Estado, el derecho, la religión, la filosofía, la moral. Reflejan y legitiman la base económica.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <p>
            <strong>Matización importante:</strong> Marx no afirmó un determinismo
            económico absoluto. La superestructura tiene &ldquo;autonomía relativa&rdquo;
            y puede influir sobre la base. Las interpretaciones más rígidas (como el
            &ldquo;marxismo vulgar&rdquo;) simplificaron su pensamiento.
          </p>
        </div>
      </section>

      {/* Lucha de clases */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚔️</span>
          <h2 className={styles.sectionTitleText}>La lucha de clases</h2>
        </div>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;La historia de todas las sociedades hasta nuestros días es la
            historia de las luchas de clases.&rdquo;
          </p>
          <cite>— Marx y Engels, El Manifiesto Comunista</cite>
        </div>

        <p>
          Para Marx, el motor de la historia es el conflicto entre clases sociales con
          intereses antagónicos. En cada época histórica hay una clase dominante y
          clases dominadas:
        </p>

        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Antigüedad</span>
            <p className={styles.timelineText}>Amos vs. Esclavos</p>
          </div>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Edad Media</span>
            <p className={styles.timelineText}>Señores feudales vs. Siervos</p>
          </div>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Capitalismo</span>
            <p className={styles.timelineText}>Burguesía vs. Proletariado</p>
          </div>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Futuro</span>
            <p className={styles.timelineText}>Sociedad sin clases (comunismo)</p>
          </div>
        </div>

        <h3>Burguesía y proletariado</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎩</span>
            <h4>Burguesía</h4>
            <p>Clase propietaria de los medios de producción (fábricas, tierras, capital)</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👷</span>
            <h4>Proletariado</h4>
            <p>Clase desposeída que solo tiene su fuerza de trabajo para vender</p>
          </div>
        </div>
      </section>

      {/* Explotación y plusvalía */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💰</span>
          <h2 className={styles.sectionTitleText}>Explotación y plusvalía</h2>
        </div>

        <p>
          Marx analiza el mecanismo de la <strong>explotación capitalista</strong> mediante
          el concepto de <strong>plusvalía</strong>:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>El mecanismo:</strong><br />
            1. El trabajador vende su fuerza de trabajo a cambio de un salario<br />
            2. El salario equivale al mínimo necesario para la subsistencia<br />
            3. Pero el trabajador produce más valor del que recibe como salario<br />
            4. Esa diferencia (plusvalía) es apropiada por el capitalista<br />
            5. La plusvalía es la fuente de la ganancia
          </p>
        </div>

        <p>
          La explotación no requiere mala voluntad del capitalista: es un mecanismo
          estructural del sistema. El capitalista, para sobrevivir en la competencia,
          debe extraer plusvalía; si no lo hace, será eliminado por otros que sí lo hagan.
        </p>
      </section>

      {/* Alienación */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>😔</span>
          <h2 className={styles.sectionTitleText}>La alienación</h2>
        </div>

        <p>
          En sus escritos tempranos, Marx desarrolla el concepto de <strong>alienación</strong>
          (Entfremdung): el trabajador en el capitalismo está separado, enajenado:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>📦</span>
            <h4>Del producto</h4>
            <p>Lo que produce no le pertenece; se convierte en mercancía ajena</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🔧</span>
            <h4>Del proceso</h4>
            <p>El trabajo es impuesto, repetitivo, sin creatividad ni sentido</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👤</span>
            <h4>De sí mismo</h4>
            <p>El trabajador no se realiza; el trabajo le embrutece</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👥</span>
            <h4>De los demás</h4>
            <p>La competencia reemplaza a la cooperación; el otro es rival</p>
          </div>
        </div>

        <p>
          La alienación no es solo económica: afecta a toda la existencia humana. El
          comunismo prometía superar esta alienación recuperando el control sobre el
          trabajo y la vida social.
        </p>
      </section>

      {/* El Estado y la revolución */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏛️</span>
          <h2 className={styles.sectionTitleText}>El Estado como instrumento de clase</h2>
        </div>

        <p>
          Para Marx, el <strong>Estado</strong> no es neutral ni representa el interés
          general: es un instrumento de la clase dominante para mantener su dominio:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;El poder político del Estado moderno no es más que una junta que
            administra los negocios comunes de toda la clase burguesa.&rdquo;
          </p>
          <cite>— Marx y Engels, El Manifiesto Comunista</cite>
        </div>

        <h3>La revolución proletaria</h3>
        <p>
          Marx prevé que las contradicciones del capitalismo (crisis, concentración
          del capital, empobrecimiento del proletariado) llevarán inevitablemente a
          una <strong>revolución</strong>. El proletariado tomará el poder y establecerá
          la &ldquo;dictadura del proletariado&rdquo; como fase de transición.
        </p>

        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Fase 1</span>
            <p className={styles.timelineText}>Revolución proletaria: toma del poder</p>
          </div>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Fase 2</span>
            <p className={styles.timelineText}>Dictadura del proletariado: transformación de la sociedad</p>
          </div>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Fase 3</span>
            <p className={styles.timelineText}>Socialismo: &ldquo;De cada cual según su capacidad, a cada cual según su trabajo&rdquo;</p>
          </div>
          <div className={styles.timelineItem}>
            <span className={styles.timelineYear}>Fase 4</span>
            <p className={styles.timelineText}>Comunismo: &ldquo;De cada cual según su capacidad, a cada cual según sus necesidades&rdquo;. Extinción del Estado.</p>
          </div>
        </div>
      </section>

      {/* Críticas y legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Críticas y legado</h2>
        </div>

        <h3>Críticas principales</h3>
        <ul>
          <li><strong>Profecías incumplidas:</strong> La revolución no ocurrió en los países más desarrollados; el proletariado no se empobreció progresivamente</li>
          <li><strong>Determinismo:</strong> ¿Realmente la base económica determina todo lo demás?</li>
          <li><strong>El Estado después de la revolución:</strong> Los regímenes comunistas no &ldquo;extinguieron&rdquo; el Estado; lo fortalecieron</li>
          <li><strong>La violencia revolucionaria:</strong> ¿Justifica el fin los medios?</li>
          <li><strong>Subestimación del mercado:</strong> Las economías planificadas fracasaron en eficiencia</li>
        </ul>

        <div className={styles.highlightBox}>
          <p>
            <strong>Legado e influencia:</strong><br />
            • Análisis estructural de la sociedad y la economía<br />
            • Crítica de la ideología como legitimación del poder<br />
            • Visibilización de la explotación y la desigualdad<br />
            • Movimientos obreros, sindicatos, partidos socialistas<br />
            • Revoluciones del siglo XX (Rusia, China, Cuba...)<br />
            • Influencia en las ciencias sociales (sociología, historia, economía)
          </p>
        </div>

        <p>
          Aunque el comunismo histórico fracasó, muchas herramientas analíticas de Marx
          siguen siendo útiles: el análisis de clase, la crítica de la ideología, la
          atención a los condicionamientos económicos de la política. La pregunta por
          la justicia económica y la distribución de la riqueza sigue vigente.
        </p>
      </section>
    </ChapterPage>
  );
}
