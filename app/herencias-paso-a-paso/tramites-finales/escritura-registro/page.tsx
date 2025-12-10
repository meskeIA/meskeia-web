'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function EscrituraRegistroPage() {
  return (
    <ChapterPage chapterId="escritura-registro">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Has llegado al momento final del proceso: la escritura pública y los cambios de titularidad. Después de todo lo que has hecho hasta ahora, este último paso puede parecer abrumador, pero en realidad es más sencillo de lo que imaginas. Piénsalo como el acto de \'mudanza\' legal donde todo pasa oficialmente a tu nombre.</p>
      </section>

      {/* Sección: La Escritura de Aceptación y Adjudicación: El Gran Final */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>La Escritura de Aceptación y Adjudicación: El Gran Final</h2>
        </div>
        <p>La escritura de aceptación y adjudicación es el documento que oficializa que tú y los demás herederos aceptáis la herencia y os repartís los bienes según corresponda. Es como el acta de una reunión muy importante, pero hecha ante notario.</p>
        <p>En esta escritura se detalla qué se queda cada heredero. Por ejemplo, si había una casa, dos cuentas bancarias y un coche, la escritura dirá claramente: \'María se queda la casa, Juan la cuenta del banco A y el coche, y ambos se reparten al 50% la cuenta del banco B\'.</p>
        <p>El notario leerá todo el documento, te explicará las partes importantes y te preguntará si estás de acuerdo. No tengas miedo de interrumpir si algo no te queda claro. El notario está ahí para ayudarte, no para juzgarte. Una vez que todos los herederos firmen, ya habréis aceptado oficialmente la herencia.</p>
        <p>Recuerda que una vez firmada la escritura, ya no hay vuelta atrás en cuanto a la aceptación de la herencia. Por eso es importante que llegues a esta cita con las ideas claras sobre qué estás heredando (bienes y deudas).</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Llega a la notaría con 10-15 minutos de antelación para estar tranquilo. Es normal sentirse nervioso, pero recuerda que el notario ha hecho esto miles de veces y te guiará en todo momento.</p>
        </div>
      </section>

      {/* Sección: Qué Documentos Llevar al Notario: Tu Kit de Supervivencia */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>Qué Documentos Llevar al Notario: Tu Kit de Supervivencia</h2>
        </div>
        <p>Ir al notario sin los documentos correctos es como ir al médico sin la tarjeta sanitaria: posible, pero complicado. Aquí tienes la lista definitiva de lo que necesitas llevar:</p>
        <p>Primero, los documentos de identificación: tu DNI original (no fotocopia) y el de todos los herederos que vayan a firmar. Si algún heredero no puede ir, necesitarás un poder notarial suyo.</p>
        <p>Segundo, todos los documentos que has ido recopilando: el certificado de defunción, el de últimas voluntades, el testamento o la declaración de herederos abintestato, los certificados del Registro Civil de familia, y por supuesto, la liquidación del impuesto de sucesiones ya pagada.</p>
        <p>Tercero, documentos de los bienes: escrituras de propiedades, certificados de participaciones bancarias, documentación de vehículos, seguros de vida, etc. Básicamente, todo lo que demuestre qué bienes tenía el fallecido.</p>
        <p>Cuarto, si hay menores o incapacitados entre los herederos, necesitarás las autorizaciones judiciales correspondientes.</p>
        <p>El notario te habrá dado una lista específica cuando concertaste la cita, pero es mejor llevar algo de más que quedarse corto.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Haz una carpeta con todos los documentos ordenados y lleva fotocopias de todo. Algunos notarios se quedan con las copias para su archivo, y así no te quedarás sin originales importantes.</p>
        </div>
      </section>

      {/* Sección: Inscripción en el Registro de la Propiedad: Hacer Oficial lo Oficial */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Inscripción en el Registro de la Propiedad: Hacer Oficial lo Oficial</h2>
        </div>
        <p>Una vez firmada la escritura, necesitas inscribir las propiedades inmobiliarias (casas, locales, terrenos) en el Registro de la Propiedad. Esto es fundamental porque hasta que no se haga esta inscripción, legalmente no puedes vender o hipotecar esas propiedades.</p>
        <p>Este trámite puedes hacerlo tú mismo o encargárselo a un gestor. Si decides hacerlo tú, necesitas llevar al Registro la escritura original de aceptación y adjudicación junto con la liquidación del impuesto de sucesiones pagada. El registrador revisará todo y, si está correcto, inscribirá la propiedad a tu nombre.</p>
        <p>El proceso suele tardar entre 15 y 30 días hábiles, dependiendo de la carga de trabajo del Registro. Te cobrarán unas tasas que varían según el valor de la propiedad, pero suelen rondar los 60-150 euros por cada inmueble.</p>
        <p>Una vez inscrita la propiedad, recibirás una nota simple actualizada donde aparecerás como propietario. Guarda este documento como oro en paño, porque es la prueba definitiva de que eres el dueño legal de la propiedad.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> Sin la inscripción en el Registro de la Propiedad no puedes vender la casa, ni hipotecarla, ni hacer ninguna operación importante con ella. Es un paso imprescindible, no opcional.</p>
        </div>
      </section>

      {/* Sección: Cambio de Titularidad en Bancos y Vehículos: Los Pequeños Grandes Detalles */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>Cambio de Titularidad en Bancos y Vehículos: Los Pequeños Grandes Detalles</h2>
        </div>
        <p>Con la escritura firmada ya puedes cambiar la titularidad de cuentas bancarias, vehículos y otros bienes. Para las cuentas bancarias, cada banco tiene sus propios procedimientos, pero generalmente necesitarás: copia autorizada de la escritura, tu DNI, y los documentos que te pida cada entidad específica.</p>
        <p>Lo más práctico es llamar primero al banco y preguntar exactamente qué necesitan y si puedes hacer el trámite por internet, teléfono o tienes que ir en persona. Algunos bancos son más ágiles que otros, pero en general el proceso es sencillo una vez que tienes la documentación correcta.</p>
        <p>Para los vehículos, debes ir a Tráfico (DGT) con la escritura, el DNI, el permiso de circulación del vehículo, la ficha técnica y pagar la tasa correspondiente (unos 55 euros). Si el coche tiene más de 10 años, también necesitarás pasar la ITV si no la tiene en vigor.</p>
        <p>Para otros bienes como seguros de vida, planes de pensiones, acciones, etc., cada entidad tiene sus propios requisitos, pero el documento base siempre será la escritura de aceptación y adjudicación junto con tu identificación.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Haz una lista de todos los bancos, aseguradoras y organismos donde necesitas cambiar titularidades, y ve tachandolos según los vayas completando. Así no se te olvidará ninguno y tendrás sensación de progreso.</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>La escritura de aceptación y adjudicación es el documento final que oficializa tu condición de heredero</li>
          <li>Necesitas inscribir las propiedades en el Registro de la Propiedad para poder disponer de ellas legalmente</li>
          <li>Cada banco y organismo tiene sus propios requisitos para el cambio de titularidad, pero todos necesitarán la escritura</li>
          <li>Una vez completados estos trámites, ya eres oficialmente el propietario de los bienes heredados</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿Tienes clara la lista de todos los bancos y organismos donde debes cambiar titularidades?</li>
          <li>¿Has verificado con el notario qué documentos específicos necesitas llevar a la firma?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En España, algunas propiedades muy antiguas aún no están inscritas en el Registro de la Propiedad. Si heredas una de estas propiedades, tendrás que hacer primero una \'inmatriculación\' para que aparezca por primera vez en el Registro, un proceso que puede ser más complejo pero que un buen profesional puede resolver.</p>
      </div>

      {/* Herramientas Vinculadas */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Herramientas de meskeIA para este tema</h4>
        <div className={styles.toolLinks}>

          <a href="/guia-tramitacion-herencias/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>📝</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Guía Tramitación Herencias</span>
              <span className={styles.toolDesc}>Orden de gestiones paso a paso</span>
            </div>
          </a>
        </div>
      </div>

    </ChapterPage>
  );
}
