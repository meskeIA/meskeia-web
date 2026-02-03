'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function MaquiaveloPage() {
  return (
    <ChapterPage chapterId={3}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🦊</span>
          <h2 className={styles.sectionTitleText}>Maquiavelo y el nacimiento de la política moderna</h2>
        </div>

        <p>
          <strong>Nicolás Maquiavelo (1469-1527)</strong> fue un diplomático, funcionario y
          pensador florentino cuya obra marcó una ruptura radical con la tradición política
          anterior. Se le considera el fundador del <strong>realismo político</strong> y el
          primer teórico del Estado moderno.
        </p>

        <p>
          Maquiavelo sirvió como secretario de la Segunda Cancillería de Florencia durante
          14 años, participando en misiones diplomáticas ante los principales poderes de
          Europa. Tras la caída de la República y el retorno de los Médici en 1512, fue
          destituido, encarcelado y torturado. En su retiro forzoso escribió sus obras
          principales.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Obras principales:</strong><br />
            • <em>El Príncipe</em> (1513): Manual para el gobernante nuevo<br />
            • <em>Discursos sobre la primera década de Tito Livio</em>: Análisis republicano<br />
            • <em>El arte de la guerra</em>: Tratado militar<br />
            • <em>Historia de Florencia</em>: Crónica política
          </p>
        </div>
      </section>

      {/* La ruptura con la tradición */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚡</span>
          <h2 className={styles.sectionTitleText}>La ruptura con la tradición</h2>
        </div>

        <p>
          Maquiavelo rompe con la tradición política medieval y clásica que subordinaba la
          política a la ética o la religión. Su enfoque es radicalmente nuevo:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>📖</span>
            <h4>Tradición anterior</h4>
            <p>La política debe guiarse por principios morales y religiosos universales</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🦊</span>
            <h4>Maquiavelo</h4>
            <p>La política tiene su propia lógica, independiente de la moral convencional</p>
          </div>
        </div>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Mi intención es escribir algo útil para quien lo lea, por lo que me ha
            parecido más conveniente ir directamente a la verdad efectiva de la cosa que
            a la representación imaginaria de la misma.&rdquo;
          </p>
          <cite>— Maquiavelo, El Príncipe, cap. XV</cite>
        </div>

        <p>
          Maquiavelo no busca describir cómo <em>deberían</em> ser los gobernantes, sino
          cómo <em>son</em> efectivamente y qué deben hacer para conservar el poder. El
          realismo político nace de esta mirada desencantada.
        </p>
      </section>

      {/* El Príncipe */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👑</span>
          <h2 className={styles.sectionTitleText}>El Príncipe: el arte de conservar el Estado</h2>
        </div>

        <p>
          <em>El Príncipe</em> está dirigido a un gobernante <strong>nuevo</strong>, que
          ha conquistado el poder y debe mantenerlo. El contexto es la fragmentación
          política de Italia y la amenaza de las potencias extranjeras.
        </p>

        <h3>Virtù y Fortuna</h3>
        <p>
          Los dos conceptos centrales de Maquiavelo son:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>💪</span>
            <h4>Virtù</h4>
            <p>Energía, capacidad de acción, audacia. No es la virtud moral, sino la habilidad política efectiva.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎲</span>
            <h4>Fortuna</h4>
            <p>El azar, las circunstancias cambiantes. Gobierna la mitad de nuestras acciones, pero la virtù puede domarla.</p>
          </div>
        </div>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;La fortuna es mujer: y es necesario, si se la quiere tener sometida,
            castigarla y golpearla... Se deja conquistar antes por los impetuosos que
            por los que proceden fríamente.&rdquo;
          </p>
          <cite>— Maquiavelo, El Príncipe, cap. XXV</cite>
        </div>
      </section>

      {/* El león y el zorro */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🦁</span>
          <h2 className={styles.sectionTitleText}>El león y el zorro</h2>
        </div>

        <p>
          Una de las imágenes más famosas de Maquiavelo es la del príncipe que debe
          combinar la fuerza del león con la astucia del zorro:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Siendo, pues, necesario a un príncipe saber bien usar la bestia, debe
            de ella tomar la zorra y el león; porque el león no se defiende de las trampas,
            la zorra no se defiende de los lobos. Es, pues, necesario ser zorra para
            conocer las trampas, y león para atemorizar a los lobos.&rdquo;
          </p>
          <cite>— Maquiavelo, El Príncipe, cap. XVIII</cite>
        </div>

        <h3>El uso de la crueldad</h3>
        <p>
          Maquiavelo distingue entre crueldades &ldquo;bien usadas&rdquo; y &ldquo;mal usadas&rdquo;:
        </p>

        <ul>
          <li><strong>Bien usadas:</strong> Se aplican de golpe al inicio, por necesidad, y luego cesan</li>
          <li><strong>Mal usadas:</strong> Comienzan pocas y van aumentando con el tiempo</li>
        </ul>

        <div className={styles.warningBox}>
          <p>
            <strong>Nota importante:</strong> Maquiavelo no celebra la crueldad, sino que
            la analiza como instrumento político. Su punto es que, si es inevitable usar
            la fuerza, es mejor hacerlo rápidamente y luego gobernar con clemencia.
          </p>
        </div>
      </section>

      {/* ¿Es mejor ser temido o amado? */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>❓</span>
          <h2 className={styles.sectionTitleText}>¿Temido o amado?</h2>
        </div>

        <p>
          La pregunta más célebre de <em>El Príncipe</em> recibe una respuesta matizada:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Surge de aquí una disputa: si es mejor ser amado que temido o viceversa.
            Se responde que sería menester ser lo uno y lo otro; pero como es difícil
            juntarlos, es mucho más seguro ser temido que amado, cuando se haya de
            carecer de uno de los dos.&rdquo;
          </p>
          <cite>— Maquiavelo, El Príncipe, cap. XVII</cite>
        </div>

        <p>
          La razón: los hombres aman según su voluntad, pero temen según la voluntad del
          príncipe. Sin embargo, Maquiavelo insiste: <strong>nunca debe ser odiado</strong>.
          El temor sin odio mantiene el orden; el odio provoca la ruina.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>El príncipe debe evitar:</strong><br />
            • Tocar los bienes de los súbditos<br />
            • Tocar a sus mujeres<br />
            • Parecer voluble, frívolo, afeminado, pusilánime o irresoluto<br />
            <br />
            <strong>Debe parecer:</strong><br />
            • Clemente, fiel, humano, íntegro, religioso<br />
            • (Aunque no siempre pueda serlo realmente)
          </p>
        </div>
      </section>

      {/* El Maquiavelo republicano */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🏛️</span>
          <h2 className={styles.sectionTitleText}>El Maquiavelo republicano</h2>
        </div>

        <p>
          Aunque <em>El Príncipe</em> es su obra más famosa, en los <em>Discursos sobre Tito Livio</em>
          Maquiavelo revela sus preferencias republicanas. Analiza la república romana como
          modelo de estabilidad y grandeza.
        </p>

        <h3>Las ventajas de la república</h3>
        <ul>
          <li>Las repúblicas son más estables porque no dependen de un solo hombre</li>
          <li>Pueden adaptarse mejor a las circunstancias cambiando de líderes</li>
          <li>El conflicto entre patricios y plebeyos fue fuente de libertad, no de debilidad</li>
          <li>Las buenas leyes nacen del &ldquo;tumulto&rdquo; entre facciones opuestas</li>
        </ul>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;En toda república hay dos espíritus contrapuestos: el de los grandes
            y el del pueblo, y todas las leyes que se hacen en pro de la libertad nacen
            de la desunión de ambos.&rdquo;
          </p>
          <cite>— Maquiavelo, Discursos, I, 4</cite>
        </div>
      </section>

      {/* Legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>El legado de Maquiavelo</h2>
        </div>

        <p>
          Maquiavelo fue simultáneamente admirado y demonizado. El término &ldquo;maquiavélico&rdquo;
          se convirtió en sinónimo de astucia amoral. Sin embargo, su influencia en el
          pensamiento político moderno es fundamental:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Contribuciones fundamentales:</strong><br />
            • Separación de política y moral religiosa<br />
            • Análisis empírico del poder (cómo es, no cómo debería ser)<br />
            • Concepto de &ldquo;razón de Estado&rdquo;<br />
            • El conflicto como motor de la libertad (republicanismo)<br />
            • La política como arte que requiere virtù específica
          </p>
        </div>

        <p>
          Su influencia se extiende desde los teóricos de la soberanía (Bodino, Hobbes)
          hasta los republicanos modernos, pasando por la Ilustración y el realismo
          político contemporáneo. Maquiavelo inauguró una forma de pensar la política
          que, para bien o para mal, sigue siendo central en nuestro tiempo.
        </p>
      </section>
    </ChapterPage>
  );
}
