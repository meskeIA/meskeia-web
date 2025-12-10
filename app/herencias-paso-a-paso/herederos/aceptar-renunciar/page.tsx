'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function AceptarRenunciarPage() {
  return (
    <ChapterPage chapterId="aceptar-renunciar">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Te han nombrado heredero y ahora te enfrentas a una decisión importante: ¿aceptar o renunciar a la herencia? Esta elección no es tan obvia como parece, y tomarla sin información puede traerte consecuencias inesperadas. Tranquilo, vamos a explicarte todo lo que necesitas saber para decidir con seguridad.</p>
      </section>

      {/* Sección: Aceptar o renunciar: entendiendo las opciones */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Aceptar o renunciar: entendiendo las opciones</h2>
        </div>
        <p>Cuando eres heredero, la ley te da tres opciones principales. Primera opción: aceptar la herencia de forma pura y simple, lo que significa que recibes tanto los bienes como las deudas del fallecido, y responderás con tu propio patrimonio si las deudas superan los bienes. Segunda opción: aceptar a beneficio de inventario, donde solo respondes de las deudas hasta el valor de los bienes heredados, protegiendo tu patrimonio personal. Tercera opción: renunciar completamente a la herencia, rechazando tanto bienes como deudas.</p>
        <p>Piénsalo como si te ofrecieran una caja cerrada: la aceptación pura es cogerla sin mirar, el beneficio de inventario es abrirla primero para ver qué contiene antes de decidir si te quedas con todo, y renunciar es no coger la caja. Cada opción tiene sus ventajas e inconvenientes, y la decisión correcta depende de tu situación particular y del estado financiero de la herencia.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Nunca tomes esta decisión con prisas. Tienes derecho a solicitar un plazo para deliberar de hasta 30 días, durante el cual puedes investigar el verdadero estado de la herencia.</p>
        </div>
      </section>

      {/* Sección: Cuándo conviene renunciar a una herencia */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Cuándo conviene renunciar a una herencia</h2>
        </div>
        <p>Renunciar puede ser la decisión más inteligente en varias situaciones. Si el fallecido tenía más deudas que bienes, aceptar la herencia significaría que tú tendrías que pagar esas deudas con tu propio dinero. Por ejemplo, si heredas una casa valorada en 100.000 euros pero viene con deudas de 150.000 euros, al aceptar de forma pura quedarías debiendo 50.000 euros de tu bolsillo.</p>
        <p>También conviene renunciar cuando los gastos de tramitación superan el valor de los bienes, como ocurre a veces con propiedades muy deterioradas o con cargas importantes. Otros motivos válidos incluyen: evitar conflictos familiares irreconciliables, cuando no tienes medios económicos para afrontar los gastos del proceso, o simplemente cuando prefieres que otros herederos reciban tu parte.</p>
        <p>Recuerda que la renuncia es irrevocable: una vez que renuncias, no puedes cambiar de opinión. Tu parte se distribuirá entre los demás herederos o pasará a los siguientes en el orden de sucesión legal.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> Ten cuidado con las deudas ocultas. Algunas deudas pueden no aparecer inmediatamente, como reclamaciones de Hacienda o deudas con entidades financieras que surgen después.</p>
        </div>
      </section>

      {/* Sección: El beneficio de inventario: la opción más segura */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>El beneficio de inventario: la opción más segura</h2>
        </div>
        <p>La aceptación a beneficio de inventario es como tener un seguro: puedes quedarte con los bienes pero tu responsabilidad por las deudas se limita al valor de lo heredado. Es la opción más prudente cuando no tienes claro el estado financiero real de la herencia.</p>
        <p>El proceso requiere hacer un inventario detallado de todos los bienes y deudas ante notario. Aunque esto supone un coste adicional (normalmente entre 300-600 euros), te protege de sorpresas desagradables. Por ejemplo, si heredas bienes por valor de 80.000 euros pero aparecen deudas por 100.000 euros, solo responderás hasta los 80.000 euros del valor de los bienes, no del exceso.</p>
        <p>Esta modalidad es especialmente recomendable cuando el fallecido era empresario, tenía negocios o su situación financiera era compleja. También es útil cuando hay varios herederos y quieres evitar conflictos sobre quién debe pagar qué deudas. El inventario proporciona transparencia y seguridad jurídica para todos.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Si tienes la más mínima duda sobre las deudas del fallecido, elige siempre el beneficio de inventario. Es mejor pagar un poco más en notario que arriesgar tu patrimonio personal.</p>
        </div>
      </section>

      {/* Sección: Plazos y trámites: cómo formalizar tu decisión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Plazos y trámites: cómo formalizar tu decisión</h2>
        </div>
        <p>La ley no establece un plazo fijo para aceptar o renunciar, pero sí hay situaciones que pueden presionarte. Cualquier persona con interés legítimo (otros herederos, acreedores) puede pedirte judicialmente que decidas en un plazo máximo de 30 días. Mientras no decidas, sigues siendo heredero con todas las consecuencias.</p>
        <p>La aceptación puede ser expresa (firmando un documento) o tácita (comportándote como heredero, por ejemplo, vendiendo bienes de la herencia). La renuncia siempre debe ser expresa y hacerse ante notario o judicialmente. Cuesta aproximadamente entre 60-150 euros en notario.</p>
        <p>Si aceptas a beneficio de inventario, debes manifestarlo expresamente ante notario antes de hacer el inventario. Este inventario debe completarse en un plazo de 60 días prorrogables. Durante este período, no puedes disponer de los bienes salvo para gastos necesarios de conservación.</p>
        <p>Recuerda que si eres menor de edad o incapacitado, la decisión la tomará tu representante legal, pero necesitará autorización judicial para renunciar.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Documenta bien todos los pasos. Guarda copias de todos los documentos y mantén un registro de fechas, porque en las herencias los plazos son importantes y pueden tener consecuencias económicas.</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>Tienes tres opciones: aceptar pura y simplemente, aceptar a beneficio de inventario, o renunciar por completo</li>
          <li>El beneficio de inventario limita tu responsabilidad por deudas al valor de los bienes heredados</li>
          <li>Conviene renunciar cuando las deudas superan claramente a los bienes o cuando los gastos no compensan</li>
          <li>La renuncia es irrevocable y debe hacerse siempre ante notario o judicialmente</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿Conoces realmente la situación financiera de la persona fallecida y tienes información completa sobre posibles deudas?</li>
          <li>¿Tienes capacidad económica para asumir los gastos de tramitación y posibles deudas ocultas que puedan aparecer?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En España, puedes renunciar a una herencia incluso después de haberla aceptado, pero solo en casos muy excepcionales, como cuando aparecen testamentos posteriores desconocidos o se demuestra que la aceptación se hizo por error o engaño.</p>
      </div>

    </ChapterPage>
  );
}
