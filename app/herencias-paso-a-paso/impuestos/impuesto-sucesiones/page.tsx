'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function ImpuestoSucesionesPage() {
  return (
    <ChapterPage chapterId="impuesto-sucesiones">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Si has heredado, además de la gestión emocional y familiar que conlleva esta situación, te enfrentas a obligaciones fiscales que pueden generar cierta preocupación. El Impuesto de Sucesiones es uno de los tributos más complejos del sistema español, pero entenderlo te ayudará a cumplir con tus obligaciones sin sorpresas desagradables.</p>
      </section>

      {/* Sección: Qué es el Impuesto de Sucesiones y cuándo se paga */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Qué es el Impuesto de Sucesiones y cuándo se paga</h2>
        </div>
        <p>El Impuesto de Sucesiones es el tributo que debes pagar cuando recibes bienes por herencia. Piénsalo como el \'peaje\' que cobra Hacienda por el hecho de que unos bienes pasen del fallecido a ti. Este impuesto grava el valor de todo lo que heredas: la casa, el dinero del banco, las joyas, el coche, las acciones... todo cuenta.</p>
        <p>No importa si quieres o no esos bienes; desde el momento en que el familiar fallece, la ley considera que has adquirido tu parte correspondiente de la herencia. Es como si fuera una compraventa automática donde el \'precio\' que pagas es este impuesto.</p>
        <p>El impuesto se calcula sobre el valor real de los bienes en el momento del fallecimiento, no sobre lo que costaron originalmente. Por ejemplo, si tu padre compró una casa por 60.000 euros en 1985, pero ahora vale 200.000 euros, el impuesto se calcula sobre los 200.000 euros actuales. Por eso es fundamental hacer una valoración correcta de todos los bienes de la herencia.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Guarda todos los documentos que demuestren el valor de los bienes heredados: tasaciones, facturas recientes, extractos bancarios. Te servirán tanto para calcular el impuesto como para justificarte ante Hacienda.</p>
        </div>
      </section>

      {/* Sección: Los 6 meses críticos: plazos que no puedes ignorar */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Los 6 meses críticos: plazos que no puedes ignorar</h2>
        </div>
        <p>Tienes exactamente 6 meses desde el fallecimiento para presentar y pagar el Impuesto de Sucesiones. Este plazo es inflexible y empieza a contar desde el día siguiente al fallecimiento, no desde que te enteres o desde que se haga el testamento.</p>
        <p>Por ejemplo, si tu familiar falleció el 15 de marzo, tienes hasta el 15 de septiembre para cumplir con Hacienda. Si el último día cae en festivo, se prorroga al siguiente día hábil, pero no te confíes.</p>
        <p>¿Qué pasa si no llegas a tiempo? Hacienda te aplicará recargos e intereses que pueden ser muy costosos. El recargo mínimo es del 5% si te retrasas hasta 3 meses, pero puede llegar al 20% si el retraso es mayor. Además, se añaden intereses de demora que se calculan día a día.</p>
        <p>Si prevés que no vas a llegar al plazo, puedes solicitar una prórroga de 6 meses más, pero debes pedirla dentro de los primeros 5 meses y pagar un interés del 5% anual. Es mucho más barato que el recargo por retraso, así que no dudes en solicitarla si la necesitas.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> El plazo de 6 meses NO se detiene por estar tramitando la herencia o esperando documentos. Empieza a preparar la declaración desde el primer día, aunque no tengas todos los papeles completos.</p>
        </div>
      </section>

      {/* Sección: Un país, diecisiete impuestos diferentes */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Un país, diecisiete impuestos diferentes</h2>
        </div>
        <p>Aunque el Impuesto de Sucesiones es estatal, cada comunidad autónoma puede establecer sus propias bonificaciones, reducciones y tipos de gravamen. Esto significa que heredar en Madrid es completamente diferente a hacerlo en Andalucía o Cataluña.</p>
        <p>Por ejemplo, en Madrid existe una bonificación del 99% para cónyuges, descendientes y ascendientes, lo que significa que prácticamente no pagas impuesto. En cambio, en Andalucía las bonificaciones son menores y en Cataluña el sistema es diferente. Estas diferencias pueden suponer miles de euros de diferencia en el impuesto final.</p>
        <p>¿Qué comunidad autónoma aplica? Generalmente, donde tenía su residencia habitual el fallecido durante los últimos 5 años. Pero hay excepciones: si el heredero reside en el extranjero, se aplica la normativa estatal, que suele ser menos favorable.</p>
        <p>Un caso especial son los no residentes en España. Si heredas siendo residente en Francia, Reino Unido o cualquier otro país, las normas pueden ser diferentes y, en algunos casos, más gravosas. En estos casos es especialmente importante asesorarse bien.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Antes de calcular tu impuesto, averigua exactamente qué normativa te aplica. No asumas que será la de la comunidad donde están los bienes; puede que te corresponda otra más favorable.</p>
        </div>
      </section>

      {/* Sección: Bonificaciones y reducciones que pueden aliviarte */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Bonificaciones y reducciones que pueden aliviarte</h2>
        </div>
        <p>La ley establece varias reducciones que pueden disminuir significativamente tu impuesto, y es fundamental conocerlas para no pagar de más. Las más importantes son las reducciones por parentesco: los cónyuges e hijos menores de 21 años tienen reducciones de hasta 47.858 euros, los hijos mayores y cónyuges de 15.956 euros, y otros familiares cantidades menores.</p>
        <p>Existe una reducción especial muy importante para la vivienda habitual: si heredas la casa donde vivía el fallecido y mantienes la propiedad durante 10 años, puedes aplicar una reducción del 95% de su valor, hasta un máximo de 122.606 euros por heredero.</p>
        <p>Para empresas familiares y negocios, hay reducciones del 95% si cumples ciertos requisitos, como mantener la actividad empresarial durante 10 años. Esta reducción es clave para evitar que los herederos tengan que vender la empresa familiar para pagar impuestos.</p>
        <p>Las personas con discapacidad tienen reducciones adicionales que pueden llegar hasta 47.858 euros extra, dependiendo del grado de discapacidad. También hay reducciones por seguros de vida, pensiones y planes de jubilación, aunque con límites específicos.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Revisa cuidadosamente todos los requisitos de las reducciones. Algunos, como el de la vivienda habitual, requieren comprometerte a mantener la propiedad durante 10 años. Si vendes antes, deberás devolver la reducción aplicada.</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>El Impuesto de Sucesiones se paga sobre el valor actual de todos los bienes heredados, no sobre su precio de compra original</li>
          <li>Tienes exactamente 6 meses desde el fallecimiento para presentar y pagar el impuesto, sin excepciones</li>
          <li>Cada comunidad autónoma tiene sus propias bonificaciones, creando grandes diferencias en el impuesto final</li>
          <li>Las reducciones por parentesco, vivienda habitual y empresas familiares pueden reducir significativamente el impuesto a pagar</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿En qué comunidad autónoma tenía su residencia habitual el fallecido durante los últimos 5 años?</li>
          <li>¿Qué tipo de bienes has heredado y tienes una idea aproximada de su valor actual?</li>
          <li>¿Cumples los requisitos para aplicar alguna de las reducciones principales, especialmente la de vivienda habitual?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> España es uno de los pocos países europeos que mantiene un impuesto de sucesiones significativo. Países como Suecia o Italia lo eliminaron completamente, mientras que en Alemania solo se paga a partir de herencias muy elevadas. Sin embargo, las diferencias entre comunidades autónomas españolas son tan grandes que es como tener 17 países diferentes dentro del mismo territorio.</p>
      </div>

      {/* Herramientas Vinculadas */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Herramientas de meskeIA para este tema</h4>
        <div className={styles.toolLinks}>

          <a href="/calculadora-sucesiones-nacional/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>🇪🇸</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Calculadora Sucesiones Nacional</span>
              <span className={styles.toolDesc}>Calcula el impuesto en 14 CCAA</span>
            </div>
          </a>

          <a href="/calculadora-sucesiones-cataluna/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>🏴</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Calculadora Sucesiones Cataluña</span>
              <span className={styles.toolDesc}>Normativa específica catalana</span>
            </div>
          </a>
        </div>
      </div>

    </ChapterPage>
  );
}
