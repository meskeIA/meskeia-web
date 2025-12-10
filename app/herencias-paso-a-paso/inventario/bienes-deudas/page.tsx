'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function BienesDeudasPage() {
  return (
    <ChapterPage chapterId="bienes-deudas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Hacer el inventario de una herencia puede parecer una tarea abrumadora, especialmente cuando estás lidiando con la pérdida de un ser querido. Sin embargo, es un paso fundamental que te permitirá conocer exactamente qué bienes y deudas forman parte de la herencia, y así tomar decisiones informadas sobre si aceptarla o no.</p>
      </section>

      {/* Sección: Qué incluir en el inventario: Todo cuenta, aunque parezca poco */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Qué incluir en el inventario: Todo cuenta, aunque parezca poco</h2>
        </div>
        <p>El inventario debe incluir absolutamente todos los bienes y derechos que tenía el fallecido en el momento de su muerte. Esto significa que no solo debes anotar lo evidente como la casa, el coche o la cuenta del banco, sino también elementos que podrían pasar desapercibidos.</p>
        <p>Empecemos por los bienes inmuebles: viviendas, locales, garajes, trasteros, parcelas o cualquier terreno. Aunque la casa esté hipotecada, sigue siendo parte del patrimonio. También incluye los bienes muebles: coches, motos, embarcaciones, joyas, obras de arte, antigüedades, electrodomésticos de valor, o incluso colecciones de monedas o sellos.</p>
        <p>No olvides los bienes intangibles: cuentas bancarias, depósitos, acciones, bonos, participaciones en empresas, derechos de autor, patentes, o dinero que le debían al fallecido (por ejemplo, si había prestado dinero a alguien). También revisa si tenía seguros de vida, planes de pensiones o fondos de inversión.</p>
        <p>Incluso las pertenencias aparentemente sin valor pueden tener importancia legal o sentimental. Un consejo práctico: haz fotos de todo y guarda recibos, facturas o certificados que demuestren la propiedad de los bienes.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Revisa cajones, armarios y documentos personales. A menudo se encuentran pólizas de seguro olvidadas o cuentas bancarias en entidades diferentes a la principal.</p>
        </div>
      </section>

      {/* Sección: Cómo valorar los bienes: El arte de poner precio justo */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Cómo valorar los bienes: El arte de poner precio justo</h2>
        </div>
        <p>Una vez que sepas qué hay en la herencia, necesitas darle un valor económico a cada bien. Esta valoración es crucial porque determinará el importe de los impuestos que tendrás que pagar y la parte que corresponde a cada heredero.</p>
        <p>Para los inmuebles, lo más recomendable es contratar a un tasador oficial. Aunque supone un coste (entre 300-600 euros normalmente), te dará una valoración objetiva y respaldada profesionalmente. También puedes consultar el valor catastral en la página web del Catastro, aunque ten en cuenta que suele ser inferior al valor real de mercado.</p>
        <p>Los vehículos se pueden valorar consultando páginas especializadas como Coches.net o pidiendo una tasación en un concesionario oficial de la marca. Para otros bienes como joyas, obras de arte o antigüedades, es necesario acudir a expertos o casas de subastas que emitan certificados de valoración.</p>
        <p>Las cuentas bancarias y inversiones tienen su valor a fecha de fallecimiento, que puedes solicitar al banco mediante un certificado de saldos. Para bienes cotidianos como muebles o electrodomésticos, puedes hacer una estimación razonable basándote en su estado y antigüedad, consultando precios de segunda mano en portales como Wallapop o Milanuncios.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Guarda todos los certificados de valoración y justificantes. Hacienda puede pedirte que demuestres cómo llegaste a esas cifras, especialmente si los valores parecen bajos.</p>
        </div>
      </section>

      {/* Sección: Investigar deudas del fallecido: Lo que debes y no debes heredar */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Investigar deudas del fallecido: Lo que debes y no debes heredar</h2>
        </div>
        <p>Las deudas también se heredan, por eso es fundamental hacer una investigación exhaustiva antes de decidir si aceptar la herencia. Recuerda que si las deudas superan a los bienes, puedes renunciar a la herencia o aceptarla \'a beneficio de inventario\'.</p>
        <p>Comienza pidiendo un informe de la Central de Información de Riesgos del Banco de España (CIRBE), que te dirá si el fallecido tenía préstamos o créditos pendientes. También solicita certificados de deudas a Hacienda y a la Seguridad Social, ya que las deudas con las administraciones públicas son muy comunes.</p>
        <p>Revisa extractos bancarios de los últimos meses para identificar pagos recurrentes: recibos de luz, agua, gas, teléfono, seguros, comunidad de propietarios, préstamos personales o hipotecas. Contacta con estas empresas para conocer el saldo pendiente exacto.</p>
        <p>No olvides deudas menos evidentes como multas de tráfico impagadas, deudas con particulares (que pueden aparecer en forma de pagarés o contratos), cuotas de colegios profesionales, o incluso deudas derivadas de ser avalista de terceros. Pregunta a familiares cercanos si conocían algún compromiso económico del fallecido.</p>
        <p>Si aparecen acreedores reclamando dinero después de aceptar la herencia, no entres en pánico. Tienes derecho a exigir que demuestren la existencia y legitimidad de la deuda.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> Ten cuidado con acreedores que aparecen de forma inesperada reclamando cantidades muy altas sin documentación clara. Algunos intentan aprovecharse del desconocimiento de los herederos.</p>
        </div>
      </section>

      {/* Sección: El ajuar doméstico: Esos objetos que también cuentan */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>El ajuar doméstico: Esos objetos que también cuentan</h2>
        </div>
        <p>El ajuar doméstico incluye todos los bienes muebles de uso ordinario del hogar: muebles, ropa, electrodomésticos, libros, utensilios de cocina, productos de limpieza, y en general todo lo que servía para el uso personal y doméstico del fallecido.</p>
        <p>La ley española establece que el ajuar doméstico se valora, salvo prueba en contrario, en el 3% del valor del resto de los bienes de la herencia. Esto significa que si la herencia vale 200.000 euros (sin contar el ajuar), automáticamente se añaden 6.000 euros más en concepto de ajuar doméstico.</p>
        <p>Sin embargo, puedes demostrar que el ajuar vale menos del 3% si haces una relación detallada y valorada de todos los objetos. Esto puede merecer la pena si los muebles y enseres son antiguos, de poco valor, o si la casa estaba prácticamente vacía.</p>
        <p>Por el contrario, si hay objetos de especial valor (como joyas, obras de arte, antigüedades o colecciones), no forman parte del ajuar doméstico sino que deben inventariarse y valorarse por separado como bienes específicos.</p>
        <p>Un aspecto importante: el ajuar doméstico suele repartirse entre los herederos de común acuerdo, pero si hay conflictos, puede ser necesario hacer lotes o incluso vender los objetos y repartir el dinero. La ropa y objetos de uso muy personal normalmente se entregan a los familiares más cercanos sin valoración económica.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Si hay objetos con valor sentimental pero no económico, como fotos familiares o recuerdos personales, acordad su reparto antes de hacer el inventario oficial para evitar conflictos posteriores.</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>El inventario debe incluir todos los bienes y deudas, por pequeños que parezcan</li>
          <li>Una valoración correcta te protege ante Hacienda y asegura un reparto justo</li>
          <li>Las deudas también se heredan: investigarlas a fondo te evitará sorpresas desagradables</li>
          <li>El ajuar doméstico se valora automáticamente al 3%, pero puedes demostrar un valor diferente</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿Has revisado ya todos los documentos personales y correspondencia del fallecido en busca de bienes o deudas que podrían pasar desapercibidos?</li>
          <li>¿Tienes claro qué bienes necesitan valoración profesional y cuáles puedes estimar tú mismo de forma razonable?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En España, si encuentras dinero en efectivo guardado en casa del fallecido, legalmente forma parte de la herencia y debe declararse. Hacienda puede investigar el origen de cantidades importantes, especialmente si no coinciden con los ingresos declarados del fallecido en años anteriores.</p>
      </div>

      {/* Herramientas Vinculadas */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Herramientas de meskeIA para este tema</h4>
        <div className={styles.toolLinks}>

          <a href="/guia-tramitacion-herencias/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>📋</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Guía Tramitación Herencias</span>
              <span className={styles.toolDesc}>Checklist completo de documentos</span>
            </div>
          </a>
        </div>
      </div>

    </ChapterPage>
  );
}
