'use client';

import { LegalNotice } from '@/components';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoTeoriaPolitica.module.css';

export default function RousseauPage() {
  return (
    <ChapterPage chapterId={7}>
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌿</span>
          <h2 className={styles.sectionTitleText}>Rousseau y la voluntad general</h2>
        </div>

        <p>
          <strong>Jean-Jacques Rousseau (1712-1778)</strong> fue un pensador singular que
          desafió muchas de las premisas de su época. Aunque es parte de la Ilustración,
          criticó el optimismo ilustrado sobre el progreso y la razón. Su obra influyó
          decisivamente en la Revolución Francesa y en el pensamiento democrático posterior.
        </p>

        <p>
          Nacido en Ginebra, Rousseau tuvo una vida errante y conflictiva. Fue músico,
          secretario, filósofo y novelista. Sus obras principales incluyen el <em>Discurso
          sobre el origen de la desigualdad</em> (1755) y <em>El contrato social</em> (1762).
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;El hombre ha nacido libre, y en todas partes se halla encadenado.&rdquo;
          </p>
          <cite>— Rousseau, El contrato social, I, 1</cite>
        </div>
      </section>

      {/* Crítica a la civilización */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔗</span>
          <h2 className={styles.sectionTitleText}>Crítica a la civilización</h2>
        </div>

        <p>
          Rousseau invierte la narrativa ilustrada del progreso. Mientras otros celebraban
          los avances de la ciencia y las artes, él argumentó que la civilización había
          <strong>corrompido</strong> al ser humano:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Nuestras almas se han corrompido a medida que nuestras ciencias y
            nuestras artes han avanzado hacia la perfección.&rdquo;
          </p>
          <cite>— Rousseau, Discurso sobre las ciencias y las artes</cite>
        </div>

        <h3>El origen de la desigualdad</h3>
        <p>
          En su <em>Segundo Discurso</em>, Rousseau rastrea el origen de la desigualdad
          hasta la institución de la <strong>propiedad privada</strong>:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;El primer hombre a quien, cercando un terreno, se le ocurrió decir
            &lsquo;esto es mío&rsquo; y halló gentes bastante simples para creerle, fue
            el verdadero fundador de la sociedad civil. ¡Cuántos crímenes, guerras,
            asesinatos; cuántas miserias y horrores habría evitado al género humano
            aquel que hubiese gritado: &lsquo;¡Guardaos de escuchar a este impostor!&rsquo;&rdquo;
          </p>
          <cite>— Rousseau, Discurso sobre el origen de la desigualdad</cite>
        </div>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🌿</span>
            <h4>Estado de naturaleza</h4>
            <p>El hombre natural era bueno, independiente, compasivo. Vivía en soledad sin necesidad de otros.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🏛️</span>
            <h4>Sociedad civil</h4>
            <p>La propiedad, la comparación, la dependencia: fuentes de desigualdad, envidia y opresión.</p>
          </div>
        </div>
      </section>

      {/* El buen salvaje */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👤</span>
          <h2 className={styles.sectionTitleText}>El &ldquo;buen salvaje&rdquo;</h2>
        </div>

        <p>
          Aunque Rousseau nunca usó exactamente la expresión &ldquo;buen salvaje&rdquo;,
          su descripción del hombre natural ha sido asociada con esta idea. El hombre
          primitivo poseía dos sentimientos naturales:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>💪</span>
            <h4>Amor de sí (amour de soi)</h4>
            <p>Instinto de autoconservación, natural y legítimo.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>💔</span>
            <h4>Piedad (pitié)</h4>
            <p>Compasión natural ante el sufrimiento ajeno, que modera el egoísmo.</p>
          </div>
        </div>

        <p>
          La sociedad pervierte estos sentimientos: el amor de sí se convierte en
          <strong>amor propio</strong> (amour propre), un deseo de reconocimiento y
          superioridad que nos hace dependientes de la opinión de otros.
        </p>

        <div className={styles.warningBox}>
          <p>
            <strong>Importante:</strong> Rousseau no propone volver al estado de
            naturaleza (es imposible e indeseable). Su análisis del hombre natural es
            una herramienta crítica para juzgar la sociedad actual y pensar cómo
            podría mejorarse.
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
          Si no podemos volver a la naturaleza, ¿cómo podemos ser libres en sociedad?
          Rousseau propone un nuevo tipo de contrato social que haga compatible la
          <strong>libertad con la obediencia a la ley</strong>:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Encontrar una forma de asociación que defienda y proteja de toda
            fuerza común la persona y los bienes de cada asociado, y por virtud de la
            cual cada uno, uniéndose a todos, no obedezca sino a sí mismo y quede tan
            libre como antes.&rdquo;
          </p>
          <cite>— Rousseau, El contrato social, I, 6</cite>
        </div>

        <h3>La cláusula fundamental</h3>
        <p>
          La solución de Rousseau es radical: cada asociado debe enajenar
          <strong>todos</strong> sus derechos a la comunidad. Pero como todos lo hacen
          por igual, nadie gana poder sobre nadie:
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Fórmula del pacto:</strong> &ldquo;Cada uno de nosotros pone en
            común su persona y todo su poder bajo la suprema dirección de la voluntad
            general, y nosotros recibimos corporativamente a cada miembro como parte
            indivisible del todo.&rdquo;
          </p>
        </div>
      </section>

      {/* La voluntad general */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>La voluntad general</h2>
        </div>

        <p>
          El concepto central de la teoría política de Rousseau es la <strong>voluntad
          general</strong> (volonté générale). Es lo que distingue su contrato del de
          Hobbes o Locke:
        </p>

        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👤</span>
            <h4>Voluntad de todos</h4>
            <p>Suma de intereses particulares. Puede equivocarse porque cada uno busca su propio bien.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>🎯</span>
            <h4>Voluntad general</h4>
            <p>Busca el bien común. Siempre es recta, aunque el pueblo pueda equivocarse al interpretarla.</p>
          </div>
        </div>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;La voluntad general es siempre recta y siempre tiende a la utilidad
            pública; pero no se sigue de ello que las deliberaciones del pueblo tengan
            siempre la misma rectitud.&rdquo;
          </p>
          <cite>— Rousseau, El contrato social, II, 3</cite>
        </div>

        <h3>¿Cómo se descubre la voluntad general?</h3>
        <p>
          Rousseau es consciente de la dificultad. Propone algunas condiciones:
        </p>
        <ul>
          <li>No debe haber facciones o partidos que distorsionen la deliberación</li>
          <li>Cada ciudadano debe opinar por sí mismo, no siguiendo a otros</li>
          <li>Las leyes deben ser generales (aplicarse a todos por igual)</li>
          <li>El pueblo debe estar bien informado</li>
        </ul>
      </section>

      {/* Soberanía popular */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👥</span>
          <h2 className={styles.sectionTitleText}>La soberanía popular</h2>
        </div>

        <p>
          Para Rousseau, la <strong>soberanía</strong> reside siempre en el pueblo y es
          inalienable: no puede transferirse a representantes.
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;La soberanía no puede ser representada, por la misma razón que no
            puede ser enajenada... Los diputados del pueblo no son ni pueden ser sus
            representantes; no son más que sus comisarios.&rdquo;
          </p>
          <cite>— Rousseau, El contrato social, III, 15</cite>
        </div>

        <h3>Crítica al parlamentarismo inglés</h3>
        <p>
          Rousseau critica duramente el sistema representativo inglés:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;El pueblo inglés piensa que es libre, pero se equivoca mucho; solo
            lo es durante la elección de los miembros del Parlamento; una vez elegidos,
            es esclavo, no es nada.&rdquo;
          </p>
          <cite>— Rousseau, El contrato social, III, 15</cite>
        </div>

        <div className={styles.warningBox}>
          <p>
            <strong>Tensión no resuelta:</strong> Rousseau reconoce que la democracia
            directa solo es posible en Estados pequeños. ¿Cómo aplicar sus principios
            a sociedades grandes? Este problema sigue siendo debatido.
          </p>
        </div>
      </section>

      {/* &ldquo;Obligar a ser libre&rdquo; */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>⚠️</span>
          <h2 className={styles.sectionTitleText}>La frase polémica</h2>
        </div>

        <p>
          Rousseau incluye una frase que ha generado controversia durante siglos:
        </p>

        <div className={styles.quoteBox}>
          <p>
            &ldquo;Quien rehúse obedecer a la voluntad general será obligado a ello
            por todo el cuerpo: lo que no significa otra cosa sino que se le obligará
            a ser libre.&rdquo;
          </p>
          <cite>— Rousseau, El contrato social, I, 7</cite>
        </div>

        <h3>Interpretaciones</h3>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👍</span>
            <h4>Interpretación benévola</h4>
            <p>Solo significa que la ley obliga a todos. Quien viola la ley pierde su libertad civil legítima.</p>
          </div>
          <div className={styles.conceptCard}>
            <span className={styles.conceptIcon}>👎</span>
            <h4>Interpretación crítica</h4>
            <p>Prefigura el totalitarismo: el Estado decide qué es la &ldquo;verdadera&rdquo; libertad y la impone.</p>
          </div>
        </div>

        <p>
          Pensadores como Isaiah Berlin y Jacob Talmon vieron en Rousseau el origen de
          las &ldquo;democracias totalitarias&rdquo;. Otros defienden que su énfasis en
          la participación directa y la igualdad lo hace incompatible con el totalitarismo.
        </p>
      </section>

      {/* Legado */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🌍</span>
          <h2 className={styles.sectionTitleText}>El legado de Rousseau</h2>
        </div>

        <p>
          La influencia de Rousseau es inmensa y contradictoria: ha sido invocado tanto
          por revolucionarios como por conservadores, por demócratas como por autoritarios.
        </p>

        <div className={styles.highlightBox}>
          <p>
            <strong>Influencia directa:</strong><br />
            • <strong>Revolución Francesa:</strong> La idea de soberanía popular y
            voluntad general inspiró a los jacobinos<br />
            • <strong>Romanticismo:</strong> La crítica a la razón fría y la valoración
            del sentimiento<br />
            • <strong>Democracia participativa:</strong> Crítica de la representación,
            énfasis en la participación directa<br />
            • <strong>Socialismo:</strong> Crítica de la propiedad como fuente de desigualdad<br />
            • <strong>Nacionalismo:</strong> La nación como comunidad moral unificada
          </p>
        </div>

        <h3>Ideas fundamentales</h3>
        <ul>
          <li>La desigualdad es producto de la historia, no de la naturaleza</li>
          <li>La sociedad puede y debe ser transformada</li>
          <li>La libertad auténtica es obediencia a la ley que uno mismo se da</li>
          <li>La democracia requiere virtud cívica y participación activa</li>
          <li>El interés común debe prevalecer sobre los intereses particulares</li>
        </ul>

        <p>
          Rousseau sigue siendo un pensador incómodo: demasiado radical para los
          liberales, demasiado individualista para los socialistas, demasiado utópico
          para los realistas. Pero sus preguntas siguen vigentes: ¿Es posible la
          libertad en sociedad? ¿Puede el pueblo gobernarse a sí mismo?
        </p>
      </section>
    </ChapterPage>
  );
}
