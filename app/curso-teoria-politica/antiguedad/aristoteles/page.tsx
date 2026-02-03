'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function AristotelesPage() {
  return (
    <ChapterPage chapterId={2}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎓</span>
          <h2 className={styles.sectionTitleText}>Aristóteles: el fundador de la ciencia política</h2>
        </div>

        <p>
          <strong>Aristóteles (384-322 a.C.)</strong> nació en Estagira, Macedonia. A los 17 años
          se trasladó a Atenas para integrarse en la Academia de Platón, donde permaneció veinte
          años. Fue tutor del joven Alejandro Magno y en 335 a.C. fundó el <strong>Liceo</strong>,
          su propia escuela filosófica.
        </p>

        <p>
          A diferencia de su maestro Platón, Aristóteles no buscó definir el Estado ideal abstracto,
          sino <strong>describir y clasificar</strong> los regímenes políticos existentes mediante
          un método inductivo. Junto con sus discípulos, estudió 158 constituciones diferentes.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>El método aristotélico:</strong> En vez de extraer la teoría desde el
            &ldquo;cielo de las ideas&rdquo; (Platón), Aristóteles parte analíticamente desde
            la realidad fáctica y la experiencia recibida. Su mirada es la del &ldquo;biólogo&rdquo;,
            un clasificador sistemático.
          </p>
        </div>
      </section>

      {/* El animal político */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏛️</span>
          <h2 className={styles.sectionTitleText}>El hombre como animal político</h2>
        </div>

        <p>
          La famosa definición aristotélica establece que el hombre es un <em>&ldquo;zoon politikon&rdquo;</em>
          (animal político). A diferencia de Platón, para Aristóteles la sociabilidad es un
          <strong>impulso natural</strong>, no una mera necesidad práctica.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;El hombre es por naturaleza un animal político. Y el que por naturaleza
            y no por azar carece de ciudad está por debajo o por encima de lo humano.&rdquo;
          </p>
          <cite>— Aristóteles, Política</cite>
        </div>

        <p>
          Pero el hombre no es un mero animal gregario: está <strong>dotado de logos</strong>
          (razón y lenguaje), lo que le permite deliberar sobre lo justo y lo injusto, lo
          bueno y lo malo. La vida política es, por tanto, esencialmente deliberativa.
        </p>

        <h3>La polis como fin natural</h3>
        <p>
          Toda comunidad tiende a un fin (<em>telos</em>). La <strong>polis</strong> es la
          comunidad más perfecta porque permite alcanzar la <em>autarkeia</em> (autosuficiencia)
          y la vida buena. Surge de comunidades menores (familia, aldea), pero las supera
          cualitativamente: &ldquo;la polis surge a causa de las necesidades de la vida,
          pero existe ahora para vivir bien&rdquo;.
        </p>
      </section>

      {/* El ciudadano */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👤</span>
          <h2 className={styles.sectionTitleText}>El ciudadano y la ciudadanía</h2>
        </div>

        <p>
          Para Aristóteles, la polis es fundamentalmente una &ldquo;comunidad de ciudadanos&rdquo;.
          El <strong>ciudadano</strong> se define por su participación en el gobierno:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>⚖️</span>
            <h4>Definición</h4>
            <p>Ciudadano es quien participa en la administración de justicia y en el gobierno</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🔄</span>
            <h4>Gobierno por turno</h4>
            <p>&ldquo;Gobiernan y son gobernados&rdquo; según vayan rotando en los cargos</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👨‍👩‍👧</span>
            <h4>Criterio de origen</h4>
            <p>Generalmente, ciudadano es &ldquo;aquel cuyos padres son ambos ciudadanos&rdquo;</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>💰</span>
            <h4>Criterio económico</h4>
            <p>&ldquo;Quienes están exentos de los trabajos necesarios&rdquo; (ocio para la política)</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <p>
            <strong>Importante:</strong> Aristóteles excluye de la ciudadanía a mujeres,
            esclavos, extranjeros y trabajadores manuales. El ciudadano necesita <em>scholé</em>
            (ocio) para dedicarse a la deliberación política. Estas exclusiones reflejan
            los prejuicios de su época, no principios universales.
          </p>
        </div>
      </section>

      {/* Tipos de régimen */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📊</span>
          <h2 className={styles.sectionTitleText}>Clasificación de los regímenes políticos</h2>
        </div>

        <p>
          Aristóteles elabora la clasificación más influyente de la historia del pensamiento
          político, combinando dos criterios:
        </p>

        <ul>
          <li><strong>Cuantitativo:</strong> ¿Cuántos gobiernan? (uno, pocos, muchos)</li>
          <li><strong>Cualitativo:</strong> ¿Para quién gobiernan? (bien común vs. interés propio)</li>
        </ul>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👑</span>
            <h4>Monarquía → Tiranía</h4>
            <p>Gobierno de uno: recto si busca el bien común, desviado si busca su propio beneficio</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎖️</span>
            <h4>Aristocracia → Oligarquía</h4>
            <p>Gobierno de pocos: recto si gobiernan los mejores, desviado si gobiernan los ricos</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🗳️</span>
            <h4>Politeia → Democracia</h4>
            <p>Gobierno de muchos: recto si busca el bien común, desviado si solo favorece a los pobres</p>
          </div>
        </div>

        <div className={styles.highlightBox}>
          <p>
            <strong>La clave es la clase social:</strong> Aristóteles señala que el número
            de gobernantes es un &ldquo;accidente&rdquo;. El criterio decisivo es la diferencia
            entre pobres y ricos: la oligarquía es el gobierno de los ricos, la democracia
            el de los pobres. Esta tensión de clase es la mayor fuente de inestabilidad política.
          </p>
        </div>
      </section>

      {/* La constitución mixta */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚖️</span>
          <h2 className={styles.sectionTitleText}>La politeia: el régimen mixto</h2>
        </div>

        <p>
          El régimen que Aristóteles considera más viable para la mayoría de las ciudades
          es la <strong>politeia</strong> (a veces traducida como &ldquo;república&rdquo;
          o &ldquo;gobierno constitucional&rdquo;). Es una mezcla de oligarquía y democracia
          que busca el <strong>término medio</strong>.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Lo mejor es la vida media, en aquella medida que cada uno pueda alcanzar.&rdquo;
          </p>
          <cite>— Aristóteles, Política</cite>
        </div>

        <h3>La importancia de la clase media</h3>
        <p>
          La estabilidad del régimen mixto depende de una <strong>clase media numerosa</strong>.
          Los muy ricos tienden a la arrogancia y a no querer obedecer; los muy pobres, a la
          envidia y al servilismo. Solo la clase media puede equilibrar estos extremos.
        </p>

        <ul>
          <li>Los de clase media son los más dispuestos a escuchar la razón</li>
          <li>No codician los bienes ajenos ni suscitan la envidia de otros</li>
          <li>Pueden gobernar y ser gobernados según el turno</li>
        </ul>
      </section>

      {/* Crítica a Platón */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Crítica a Platón</h2>
        </div>

        <p>
          Aristóteles dedica parte de su <em>Política</em> a criticar las propuestas de su maestro:
        </p>

        <h3>Contra el Estado unitario</h3>
        <p>
          Platón quería una ciudad lo más unificada posible. Aristóteles objeta: la polis
          es esencialmente <strong>plural</strong>, compuesta de elementos diferentes. Pretender
          unificarla excesivamente destruiría su naturaleza.
        </p>

        <h3>Contra el comunismo de los guardianes</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>❤️</span>
            <h4>Argumento afectivo</h4>
            <p>&ldquo;Lo que es común a muchos es objeto de menos cuidado&rdquo;. Amamos más lo que es nuestro.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>📈</span>
            <h4>Argumento económico</h4>
            <p>&ldquo;Producirán más beneficio si cada uno se dedica a lo suyo propio&rdquo;</p>
          </div>
        </div>

        <p>
          Aristóteles defiende la <strong>propiedad privada</strong>, aunque admite la
          utilidad de ciertos bienes comunales. Sin propiedad privada, argumenta, ni
          siquiera podríamos ejercer la generosidad con amigos y huéspedes.
        </p>
      </section>

      {/* Legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>El legado de Aristóteles</h2>
        </div>

        <p>
          La influencia de Aristóteles en el pensamiento político occidental es incalculable.
          Sus conceptos fundamentaron:
        </p>

        <ul>
          <li>La teoría de las <strong>formas de gobierno</strong> (retomada por Polibio, Cicerón, Maquiavelo, Montesquieu)</li>
          <li>La idea del <strong>gobierno mixto</strong> como el más estable</li>
          <li>El concepto de <strong>ciudadanía activa</strong> y participación política</li>
          <li>El <strong>republicanismo clásico</strong> y su énfasis en la virtud cívica</li>
          <li>La distinción entre <strong>ética y política</strong> como saberes prácticos</li>
        </ul>

        <div className={styles.highlightBox}>
          <p>
            <strong>Ideas fundamentales del legado aristotélico:</strong><br />
            • El hombre es naturalmente político (zoon politikon)<br />
            • La política busca el bien vivir, no solo el vivir<br />
            • El mejor régimen es el que equilibra intereses contrapuestos<br />
            • La clase media es el fundamento de la estabilidad<br />
            • El buen ciudadano sabe gobernar y ser gobernado
          </p>
        </div>

        <p>
          A través de la recepción medieval (Tomás de Aquino) y el Renacimiento (republicanismo
          italiano), las ideas aristotélicas llegaron hasta la Ilustración y los debates
          fundacionales de las democracias modernas. Aún hoy, conceptos como &ldquo;virtud
          cívica&rdquo;, &ldquo;deliberación pública&rdquo; o &ldquo;clase media como
          estabilizadora&rdquo; tienen raíces aristotélicas.
        </p>
      </section>
    </ChapterPage>
  );
}
