'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function PlusvaliaOtrosPage() {
  return (
    <ChapterPage chapterId="plusvalia-otros">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Ya hemos visto los principales impuestos de la herencia, pero aún quedan algunos gastos importantes por conocer. La plusvalía municipal suele ser una sorpresa desagradable para muchos herederos, y los gastos notariales también pueden generar dudas sobre su importe real.</p>
      </section>

      {/* Sección: Qué es la plusvalía municipal y por qué la pagas */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Qué es la plusvalía municipal y por qué la pagas</h2>
        </div>
        <p>La plusvalía municipal, técnicamente llamada \'Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana\', es un tributo que grava el aumento teórico del valor del suelo urbano cuando se produce una transmisión. En palabras sencillas: cuando heredas una vivienda o terreno urbano, el ayuntamiento considera que ese suelo ha aumentado de valor desde que lo adquirió el fallecido, y te cobra un impuesto por ese incremento.</p>
        <p>Es importante entender que este impuesto no mide el incremento real del valor. No importa si la casa vale ahora más o menos que cuando la compró tu familiar. El ayuntamiento aplica unos coeficientes fijos según los años que han pasado y el valor catastral del suelo. Por ejemplo, si tu padre compró una casa hace 15 años, el ayuntamiento calculará automáticamente que el suelo ha tenido un incremento de valor, aunque la vivienda esté ahora en peores condiciones.</p>
        <p>Este impuesto solo afecta a bienes inmuebles urbanos: casas, pisos, locales, garajes, terrenos urbanos. Si heredas una finca rústica en el campo, normalmente no pagarás plusvalía municipal. Cada heredero debe pagar la parte proporcional según su porcentaje de herencia.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Si la herencia incluye varios inmuebles en municipios diferentes, tendrás que pagar la plusvalía en cada ayuntamiento por separado. Organiza bien los papeles por municipios para no confundirte.</p>
        </div>
      </section>

      {/* Sección: Cuándo y cómo se paga la plusvalía municipal */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Cuándo y cómo se paga la plusvalía municipal</h2>
        </div>
        <p>Tienes un plazo de 6 meses desde el fallecimiento para presentar y pagar la plusvalía municipal en el ayuntamiento donde esté ubicado el inmueble. Este plazo puede prorrogarse otros 6 meses si presentas una solicitud motivada antes de que expire el primer plazo.</p>
        <p>Para calcular el importe necesitarás: el valor catastral del suelo (aparece desglosado en el recibo del IBI), el número de años que transcurrieron desde que el fallecido adquirió el inmueble hasta su muerte, y los coeficientes y tipos de gravamen que aplica cada ayuntamiento. Cada municipio tiene sus propios porcentajes, por lo que el mismo inmueble puede generar plusvalías muy diferentes según dónde esté ubicado.</p>
        <p>El cálculo es complejo, pero la mayoría de ayuntamientos ofrecen calculadoras online en sus webs o ventanillas de información. También puedes pedirle a una gestoría que lo calcule por ti. Un ejemplo: una casa con valor catastral del suelo de 20.000€, adquirida hace 10 años, en un municipio con coeficientes medios, puede generar una plusvalía de entre 800 y 1.500€.</p>
        <p>Recuerda que desde 2021, si puedes demostrar que no hubo incremento real de valor (con una tasación, por ejemplo), puedes solicitar la exención del pago.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Algunos ayuntamientos ofrecen bonificaciones para herencias familiares directas o cuando el heredero es mayor de cierta edad. Pregunta en el ayuntamiento si existen estas ventajas fiscales.</p>
        </div>
      </section>

      {/* Sección: Gastos de notaría, registro y gestoría */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Gastos de notaría, registro y gestoría</h2>
        </div>
        <p>Los gastos notariales para la herencia no son fijos, sino que dependen de varios factores: el valor de los bienes, el número de herederos y la complejidad del caso. Para una herencia estándar con un inmueble valorado en 200.000€, los honorarios notariales suelen rondar entre 600 y 1.200€. El notario cobra por la escritura de herencia, las copias autorizadas que necesites, y otros trámites como la declaración de herederos si no hay testamento.</p>
        <p>Los gastos del Registro de la Propiedad son más predecibles. Rondan el 0,1-0,2% del valor de los inmuebles, con un mínimo de unos 100€ por finca. Si heredas una casa valorada en 150.000€, el registro costará aproximadamente 150-300€.</p>
        <p>La gestoría es opcional, pero muchas familias la contratan por comodidad. Una gestoría se encarga de preparar todos los papeles, hacer las liquidaciones de impuestos, y acompañarte en los trámites. Sus honorarios varían mucho según la zona y la complejidad: desde 800€ para casos sencillos hasta 2.500€ o más para herencias complicadas. Antes de contratar, pide un presupuesto detallado y asegúrate de que incluye todos los trámites que necesitas.</p>
        <p>Si decides hacerlo tú mismo, es perfectamente posible. Solo necesitarás más tiempo y paciencia para recopilar documentos y entender los formularios de cada organismo.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> Cuidado con las gestorías que piden pagos por adelantado sin explicar claramente qué servicios incluyen. Un presupuesto serio debe detallar cada concepto y sus honorarios específicos.</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>La plusvalía municipal se paga siempre que se hereden inmuebles urbanos, independientemente de si han ganado valor real</li>
          <li>Tienes 6 meses para pagar la plusvalía, prorrogables otros 6 meses si lo solicitas a tiempo</li>
          <li>Los gastos de notario y registro son obligatorios, pero la gestoría es opcional aunque puede ahorrarte tiempo y complicaciones</li>
          <li>Desde 2021 puedes reclamar la exención de plusvalía si demuestras que no hubo incremento real de valor del inmueble</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿Tienes clara la ubicación de todos los inmuebles de la herencia para saber en qué ayuntamientos debes pagar plusvalía?</li>
          <li>¿Prefieres gestionar tú mismo todos los trámites o contratar una gestoría para que te ayude con el papeleo?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> Aunque se llame \'plusvalía municipal\', este impuesto no tiene nada que ver con las plusvalías que se pagan al vender una vivienda. Son tributos completamente diferentes, con normativas y cálculos distintos, que pueden coexistir si heredas y luego vendes el inmueble.</p>
      </div>

      {/* Herramientas Vinculadas */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Herramientas de meskeIA para este tema</h4>
        <div className={styles.toolLinks}>

          <a href="/guia-tramitacion-herencias/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>💰</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Guía Tramitación Herencias</span>
              <span className={styles.toolDesc}>Costes orientativos</span>
            </div>
          </a>
        </div>
      </div>

    </ChapterPage>
  );
}
