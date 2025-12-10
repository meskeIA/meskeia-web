'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function QueHacerPrimeroPage() {
  return (
    <ChapterPage chapterId="que-hacer-primero">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>Perder a un ser querido es doloroso, y enfrentarse a trámites burocráticos en estos momentos puede resultar abrumador. Este capítulo te guiará paso a paso por las primeras acciones necesarias tras un fallecimiento, para que sepas exactamente qué hacer y en qué orden, permitiéndote centrarte en lo verdaderamente importante.</p>
      </section>

      {/* Sección: Las primeras 48 horas: lo más urgente */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📌</span>
          <h2 className={styles.sectionTitleText}>Las primeras 48 horas: lo más urgente</h2>
        </div>
        <p>Cuando alguien fallece, el reloj comienza a correr para ciertos trámites legales. No te agobies: tienes tiempo suficiente, pero es importante conocer las prioridades. En primer lugar, si el fallecimiento ocurre en casa, debes llamar al médico de cabecera o al 112 para que certifique la defunción. Si sucede en el hospital, el personal médico se encarga de esto automáticamente.</p>
        <p>Dentro de las primeras 24 horas, necesitas contactar con una funeraria. Ellos te ayudarán con muchos trámites iniciales, pero recuerda que eres tú quien toma las decisiones. No te sientas presionado a contratar servicios adicionales si no los deseas. La funeraria puede ayudarte a obtener algunos documentos básicos, pero hay gestiones que solo puede hacer la familia.</p>
        <p>Es fundamental localizar cuanto antes el DNI del fallecido y, si existe, el testamento. Pregunta a familiares cercanos si saben dónde se guardaban estos documentos. Si no encuentras el testamento, no te preocupes: más adelante te explicaremos cómo averiguar si existe uno.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Haz una lista de las tareas urgentes y repártelas entre familiares cercanos. No tienes que gestionarlo todo tú solo, y delegar te ayudará a reducir el estrés.</p>
        </div>
      </section>

      {/* Sección: El certificado de defunción: tu documento clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🔍</span>
          <h2 className={styles.sectionTitleText}>El certificado de defunción: tu documento clave</h2>
        </div>
        <p>El certificado de defunción es el documento más importante que necesitarás para todos los trámites posteriores. Existen dos tipos: el certificado médico de defunción (que certifica la causa médica del fallecimiento) y el certificado literal de defunción del Registro Civil (el documento oficial que necesitas para las herencias).</p>
        <p>Para obtener el certificado literal, debes acudir al Registro Civil donde se inscribió la defunción, normalmente el del lugar donde ocurrió el fallecimiento. Necesitarás llevar tu DNI y, si eres familiar directo (cónyuge, hijos, padres, hermanos), podrás solicitarlo sin problemas. Si no eres familiar directo, necesitarás una autorización o poder notarial.</p>
        <p>Pide varias copias desde el principio (recomendamos al menos 5-6 copias). Cada entidad que contactes (bancos, seguros, notario, etc.) te pedirá una copia, y si solo tienes una, tendrás que volver al Registro Civil múltiples veces. El coste por copia es mínimo (alrededor de 4 euros), pero te ahorrará muchas molestias posteriores.</p>
        <p>El certificado literal contiene información esencial: datos personales del fallecido, fecha y lugar de defunción, estado civil y, muy importante, si estaba casado en régimen de gananciales o separación de bienes.</p>
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> Solicita el certificado literal de defunción en papel oficial con código seguro de verificación. Algunos trámites no aceptan fotocopias, y este formato te garantiza que será válido en todas las gestiones.</p>
        </div>
      </section>

      {/* Sección: A quién avisar y en qué orden de prioridad */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>💡</span>
          <h2 className={styles.sectionTitleText}>A quién avisar y en qué orden de prioridad</h2>
        </div>
        <p>Una vez que tengas el certificado de defunción, es momento de avisar a las diferentes instituciones. Existe un orden lógico que te facilitará las gestiones posteriores. Primero, contacta con el banco principal del fallecido. Necesitan saber del fallecimiento para bloquear las cuentas y evitar problemas. Lleva el certificado de defunción y tu DNI como familiar.</p>
        <p>Segundo, avisa a la compañía de seguros si el fallecido tenía seguro de vida o decesos. Estos seguros suelen tener plazos para reclamar, y es mejor iniciar el proceso cuanto antes. La mayoría de compañías tienen teléfonos gratuitos de atención 24 horas para estos casos.</p>
        <p>Tercero, comunica el fallecimiento a Hacienda si el fallecido tenía obligaciones tributarias pendientes, y a la Seguridad Social para gestionar pensiones y prestaciones. La Seguridad Social también te informará sobre posibles pensiones de viudedad u orfandad.</p>
        <p>Cuarto, contacta con empresas de suministros (luz, gas, agua, teléfono) para cambiar la titularidad o dar de baja los servicios. Algunos permiten hacerlo por teléfono, otros requieren acudir presencialmente.</p>
        <p>Finalmente, avisa a otros organismos como el ayuntamiento (para temas de IBI y tasas municipales), compañías de seguros de hogar y vehículos, y entidades donde el fallecido tuviera contratos o servicios activos.</p>
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> No canceles inmediatamente todos los servicios del domicilio del fallecido. Si la vivienda va a tardar en venderse o heredarse, necesitarás mantener servicios básicos como luz y agua para conservarla en buen estado.</p>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>Las primeras 48 horas son cruciales, pero tienes tiempo suficiente si organizas las prioridades</li>
          <li>El certificado literal de defunción es tu documento clave: solicita varias copias desde el principio</li>
          <li>Contacta primero con bancos y seguros, después con administraciones públicas y por último con empresas de servicios</li>
          <li>No tienes que gestionarlo todo solo: reparte tareas entre familiares y acepta ayuda</li>
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
          <li>¿Has localizado ya el DNI del fallecido y sabes dónde buscar un posible testamento?</li>
          <li>¿Tienes claro cuál es el banco principal del fallecido y qué seguros tenía contratados?</li>
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En España, el Registro Civil guarda los certificados de defunción durante 100 años. Después de este tiempo, se trasladan al Archivo Histórico Provincial, donde se conservan indefinidamente para futuras investigaciones genealógicas.</p>
      </div>

    </ChapterPage>
  );
}
