'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function GlosarioHerenciasPage() {
  return (
    <ChapterPage chapterId="glosario-herencias">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>A lo largo de este curso hemos utilizado términos legales que pueden resultar poco familiares. En este capítulo final, encontrarás un glosario completo con las definiciones explicadas de forma sencilla, además de respuestas a las preguntas más frecuentes sobre herencias.</p>
      </section>

      {/* Glosario de Términos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📚</span>
          <h2 className={styles.sectionTitleText}>Glosario de Términos</h2>
        </div>
        <p>Consulta este glosario siempre que encuentres un término que no comprendas. Están ordenados alfabéticamente para facilitar su búsqueda.</p>
        <dl className={styles.glossaryList}>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Abintestato</dt>
            <dd className={styles.glossaryDef}>Herencia sin testamento. La ley determina quiénes heredan.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Aceptación a beneficio de inventario</dt>
            <dd className={styles.glossaryDef}>Aceptar la herencia limitando la responsabilidad por deudas al valor de los bienes heredados.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Acta de notoriedad</dt>
            <dd className={styles.glossaryDef}>Documento notarial que declara quiénes son los herederos cuando no hay testamento.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Ajuar doméstico</dt>
            <dd className={styles.glossaryDef}>Bienes muebles de uso personal y del hogar. Se valora en un 3% del caudal hereditario.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Base imponible</dt>
            <dd className={styles.glossaryDef}>Valor sobre el que se calcula el impuesto, tras aplicar ciertas deducciones.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Caudal hereditario</dt>
            <dd className={styles.glossaryDef}>Conjunto de bienes, derechos y obligaciones que componen la herencia.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Causante</dt>
            <dd className={styles.glossaryDef}>Persona fallecida que deja la herencia.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Certificado de defunción</dt>
            <dd className={styles.glossaryDef}>Documento oficial que acredita el fallecimiento.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Certificado de últimas voluntades</dt>
            <dd className={styles.glossaryDef}>Documento que indica si existe testamento y ante qué notario se otorgó.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Cuaderno particional</dt>
            <dd className={styles.glossaryDef}>Documento donde se detalla el reparto de la herencia entre los herederos.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Heredero forzoso</dt>
            <dd className={styles.glossaryDef}>Persona que tiene derecho a una parte de la herencia por ley (hijos, ascendientes, cónyuge).</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Heredero universal</dt>
            <dd className={styles.glossaryDef}>Persona que hereda la totalidad o una parte proporcional del patrimonio.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Legatario</dt>
            <dd className={styles.glossaryDef}>Persona que recibe un bien concreto por testamento, sin asumir deudas.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Legítima</dt>
            <dd className={styles.glossaryDef}>Parte de la herencia que la ley reserva a los herederos forzosos.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Nuda propiedad</dt>
            <dd className={styles.glossaryDef}>Derecho a ser propietario de un bien, pero sin poder usarlo ni disfrutarlo.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Plusvalía municipal</dt>
            <dd className={styles.glossaryDef}>Impuesto sobre el incremento de valor de terrenos urbanos al transmitirse.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Testamento abierto</dt>
            <dd className={styles.glossaryDef}>Testamento otorgado ante notario, quien conserva el original.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Testamento ológrafo</dt>
            <dd className={styles.glossaryDef}>Testamento escrito de puño y letra por el testador, sin notario.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Usufructo</dt>
            <dd className={styles.glossaryDef}>Derecho a usar y disfrutar un bien ajeno sin ser propietario.</dd>
          </div>

          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>Usufructo viudal</dt>
            <dd className={styles.glossaryDef}>Derecho del cónyuge viudo a usar y disfrutar parte de la herencia.</dd>
          </div>
        </dl>
      </section>

      {/* Preguntas Frecuentes */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>❓</span>
          <h2 className={styles.sectionTitleText}>Preguntas Frecuentes</h2>
        </div>
        <p>Recopilamos las dudas más habituales de las personas que se enfrentan a tramitar una herencia.</p>
        <div className={styles.faqGrid}>

          <details className={styles.faqItem}>
            <summary>¿Cuánto tiempo tengo para tramitar la herencia?</summary>
            <p>El plazo crítico es de 6 meses para el Impuesto de Sucesiones y la Plusvalía Municipal. Sin embargo, la herencia en sí no prescribe.</p>
          </details>

          <details className={styles.faqItem}>
            <summary>¿Necesito abogado obligatoriamente?</summary>
            <p>No es obligatorio por ley, pero es muy recomendable en herencias complejas, con conflictos entre herederos o bienes en varios países.</p>
          </details>

          <details className={styles.faqItem}>
            <summary>¿Puedo acceder al dinero del fallecido para pagar el entierro?</summary>
            <p>Los bancos suelen permitir disponer de cantidades limitadas para gastos de sepelio previa presentación de facturas, pero el resto queda bloqueado hasta la adjudicación.</p>
          </details>

          <details className={styles.faqItem}>
            <summary>¿Qué pasa si hay más deudas que bienes?</summary>
            <p>Puedes renunciar a la herencia o aceptarla a beneficio de inventario, lo que limita tu responsabilidad al valor de lo heredado.</p>
          </details>

          <details className={styles.faqItem}>
            <summary>¿Puedo heredar si vivo fuera de España?</summary>
            <p>Sí, aunque los trámites pueden complicarse. Es recomendable otorgar poder notarial a alguien de confianza en España.</p>
          </details>
        </div>
      </section>

      {/* Herramientas de meskeIA */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🛠️</span>
          <h2 className={styles.sectionTitleText}>Herramientas de meskeIA</h2>
        </div>
        <p>Hemos creado varias herramientas gratuitas para facilitar la tramitación de tu herencia.</p>
        <div className={styles.toolLinkBox}>
          <div className={styles.toolLinks}>

          <a href="/guia-tramitacion-herencias/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>📋</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Guía Tramitación Herencias</span>
              <span className={styles.toolDesc}>Herramienta interactiva completa</span>
            </div>
          </a>

          <a href="/calculadora-sucesiones-nacional/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>🇪🇸</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Calculadora Sucesiones Nacional</span>
              <span className={styles.toolDesc}>Impuesto en 14 CCAA</span>
            </div>
          </a>

          <a href="/calculadora-sucesiones-cataluna/" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>🏴</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Calculadora Sucesiones Cataluña</span>
              <span className={styles.toolDesc}>Normativa catalana</span>
            </div>
          </a>
          </div>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
          <li>Este glosario te ayudará a entender la terminología legal</li>
          <li>Consulta las preguntas frecuentes ante cualquier duda</li>
          <li>Usa las herramientas de meskeIA para calcular impuestos</li>
          <li>Ante dudas complejas, consulta siempre con un profesional</li>
        </ul>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> En España se tramitan más de 400.000 herencias cada año. La mayoría se resuelven sin conflictos cuando los herederos están bien informados.</p>
      </div>
    </ChapterPage>
  );
}
