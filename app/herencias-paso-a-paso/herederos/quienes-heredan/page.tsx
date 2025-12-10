'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function QuienesHeredanPage() {
  return (
    <ChapterPage chapterId="quienes-heredan">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Una de las primeras preguntas que surge cuando fallece un familiar es: ¿quién tiene derecho a heredar? Es normal sentirse confundido ante esta situación, especialmente cuando hay que tomar decisiones importantes en un momento emocionalmente difícil. La buena noticia es que la ley española tiene reglas claras que determinan quiénes son los herederos, y en este capítulo te ayudaremos a entenderlas de forma sencilla.</p>
      </section>

      {/* Sección: Con Testamento vs Sin Testamento: Las Dos Situaciones Básicas */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Con Testamento vs Sin Testamento: Las Dos Situaciones Básicas</h2>
        </div>
        <p>La primera distinción fundamental es si el fallecido dejó testamento o no. Cuando hay testamento, el proceso es más claro porque la persona expresó por escrito cuáles eran sus deseos. Sin embargo, incluso con testamento, no todo vale: la ley protege a ciertos familiares cercanos reservándoles una parte de la herencia llamada \'legítima\'.</p>
        <p>Cuando no hay testamento, hablamos de \'sucesión intestada\' o \'abintestato\'. En este caso, la ley determina automáticamente quiénes son los herederos siguiendo un orden muy específico. Es como si la ley escribiera un testamento estándar basado en los lazos familiares más cercanos.</p>
        <p>Imaginemos el caso de María, que falleció dejando un piso y algunos ahorros. Si María hizo testamento dejando todo a su hija Ana, esta será la heredera principal. Pero si María tenía más hijos, estos tendrán derecho a su parte legítima aunque el testamento no los mencione. Si María no hizo testamento y tenía dos hijos, Ana y Pedro, ambos heredarán por partes iguales automáticamente.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Si encuentras un testamento entre los documentos del fallecido, guárdalo en lugar seguro y comunícaselo inmediatamente al notario. Incluso si parece que te perjudica, es fundamental respetarlo y seguir el procedimiento legal.</p>
        </div>
      </section>

      {/* Sección: El Orden de Sucesión Legal: Quién Hereda Cuando No Hay Testamento */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>El Orden de Sucesión Legal: Quién Hereda Cuando No Hay Testamento</h2>
        </div>
        <p>Cuando no hay testamento, la ley establece un orden de prelación muy lógico, basado en los vínculos familiares más estrechos. Es como una fila ordenada donde los primeros en la cola tienen preferencia absoluta sobre los que vienen después.</p>
        <p>Primer lugar: Los descendientes (hijos, nietos, bisnietos...). Los hijos heredan por partes iguales, y si alguno ha fallecido, sus hijos (los nietos del fallecido) ocupan su lugar. Por ejemplo, si Juan tenía tres hijos pero uno falleció dejando dos nietos, la herencia se divide en tres partes: una para cada hijo vivo y una tercera parte que se reparte entre los dos nietos.</p>
        <p>Segundo lugar: Los ascendientes (padres, abuelos...), pero solo si no hay descendientes. Los padres heredan por partes iguales, y si solo vive uno, este hereda todo.</p>
        <p>Tercer lugar: El cónyuge, cuando no hay descendientes ni ascendientes. Cuarto lugar: Los hermanos y sobrinos. Quinto lugar: Otros parientes hasta el cuarto grado (primos, tíos...). Si no hay ningún familiar hasta el cuarto grado, hereda el Estado.</p>
        <p>Es importante recordar que el cónyuge separado legalmente no hereda, pero el divorciado tampoco. Sin embargo, la pareja de hecho puede tener derechos según la legislación de cada comunidad autónoma.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Si no estás seguro del grado de parentesco que te une con el fallecido, haz un árbol genealógico sencillo. Esto te ayudará a determinar si tienes derechos hereditarios y te será útil cuando vayas al notario.</p>
        </div>
      </section>

      {/* Sección: La Legítima: La Parte Sagrada de la Herencia */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>La Legítima: La Parte Sagrada de la Herencia</h2>
        </div>
        <p>La legítima es uno de los conceptos más importantes del derecho sucesorio español. Es la parte de la herencia que la ley reserva obligatoriamente a determinados familiares, sin importar lo que diga el testamento. Es decir, aunque el testamento diga otra cosa, estos familiares tienen derecho garantizado a su porción.</p>
        <p>¿Quiénes son los \'legitimarios\'? En primer lugar, los hijos y descendientes, que tienen derecho a dos tercios de la herencia. Si no hay descendientes, los padres y ascendientes tienen derecho a la mitad de la herencia. El cónyuge viudo también tiene derechos legitimarios que varían según quién más concurra a la herencia.</p>
        <p>Pongamos un ejemplo práctico: Pedro falleció dejando una herencia de 300.000 euros y un testamento en el que dejaba todo a una ONG. Sin embargo, Pedro tenía dos hijas. Las hijas tienen derecho a la legítima, que son dos tercios de 300.000 euros, es decir, 200.000 euros (100.000 euros para cada una). La ONG solo recibiría el tercio restante: 100.000 euros.</p>
        <p>Esto significa que nadie puede desheredar completamente a sus hijos o padres sin una causa muy grave y específica prevista en la ley. La legítima protege los vínculos familiares más estrechos y garantiza que la familia no quede desprotegida.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> Si eres legitimario y el testamento no respeta tu legítima, no renuncies a tus derechos por desconocimiento. Tienes un plazo de 4 años desde la muerte para reclamar tu legítima. Consulta con un abogado especializado antes de firmar cualquier documento.</p>
        </div>
      </section>

      {/* Sección: Derechos Especiales del Cónyuge Viudo */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Derechos Especiales del Cónyuge Viudo</h2>
        </div>
        <p>El cónyuge viudo tiene una situación especial en las herencias españolas, con derechos que varían según quién más concurra a heredar. Estos derechos están pensados para proteger al viudo y garantizar que pueda mantener un nivel de vida digno tras la pérdida de su pareja.</p>
        <p>Cuando concurre con hijos: el cónyuge viudo tiene derecho al usufructo (uso y disfrute) de un tercio de la herencia. Esto significa que puede vivir en la casa familiar, cobrar los alquileres de las propiedades, o recibir los intereses de los ahorros, pero no puede vender estos bienes. La propiedad será de los hijos.</p>
        <p>Cuando concurre con padres del fallecido: el cónyuge viudo tiene derecho al usufructo de la mitad de la herencia. Cuando no hay ni descendientes ni ascendientes: el cónyuge hereda dos tercios de la herencia en plena propiedad, además del ajuar doméstico.</p>
        <p>Por ejemplo, si Ana enviudó y su marido dejó una casa valorada en 200.000 euros y dos hijos, Ana podrá seguir viviendo en la casa (usufructo de un tercio = 66.666 euros de valor), mientras que los hijos serán los propietarios. Si Ana quiere vender la casa, necesitará el acuerdo de los hijos.</p>
        <p>Un derecho adicional importante es el del ajuar doméstico: muebles, electrodomésticos, ropa, objetos personales... todo esto corresponde al cónyuge viudo sin que compute para el cálculo de la herencia.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Si eres cónyuge viudo, es recomendable hacer un inventario detallado del ajuar doméstico (muebles, electrodomésticos, objetos personales) al inicio del proceso. Estos bienes te corresponden automáticamente y no tienes que compartirlos con otros herederos.</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>Con testamento o sin él, siempre existen herederos con derechos garantizados por la ley (legitimarios)</li>
          <li>Cuando no hay testamento, la ley establece un orden claro: primero hijos, luego padres, después cónyuge, hermanos, y otros parientes</li>
          <li>La legítima es la parte de la herencia que no se puede quitar a ciertos familiares, sin importar lo que diga el testamento</li>
          <li>El cónyuge viudo tiene derechos especiales de usufructo y derecho al ajuar doméstico completo</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿Sabías si tu familiar fallecido había hecho testamento? ¿Has buscado entre sus documentos o preguntado a su notario habitual?</li>
          <li>Según el orden de sucesión legal, ¿en qué posición te encuentras tú como posible heredero?</li>
          <li>Si hay testamento, ¿crees que respeta la legítima de todos los legitimarios o podría haber problemas?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En España, a diferencia de otros países como Reino Unido o Estados Unidos, no puedes desheredar completamente a tus hijos. Nuestro sistema de legítimas tiene raíces en el derecho romano y protege los vínculos familiares de forma muy estricta. Incluso los Reyes de España están sujetos a estas normas para sus herencias personales.</p>
      </div>

    </ChapterPage>
  );
}
