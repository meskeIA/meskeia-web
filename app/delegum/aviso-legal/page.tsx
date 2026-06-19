'use client';
// @disclaimer: exempt

import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from '../Delegum.module.css';

export default function DelegumAvisoLegalPage() {
  return (
    <>
      <AnalyticsTracker appName="delegum-aviso-legal" />

      <main className={styles.container}>
        <article className={styles.document}>

          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroLockup}>
              <Image
                src="/delegum/simbolo-blanco.svg"
                alt=""
                aria-hidden="true"
                width={64}
                height={64}
                className={styles.heroSymbol}
                priority
              />
              <h1 className={styles.heroWordmark}>Delegum</h1>
            </div>
            <p className={styles.subtitle}>
              Aviso Legal y Términos de Uso
            </p>
          </div>

          <p className={styles.legalUpdated}>Última actualización: 6 de junio de 2026</p>

          {/* Aceptación */}
          <section className={styles.section}>
            <div className={styles.disclaimer}>
              <strong>Al utilizar Delegum aceptas estos términos en su totalidad.</strong> Si no estás de
              acuerdo con alguna parte, no utilices el servidor ni sus herramientas. Estos términos
              constituyen un acuerdo legal vinculante entre tú y meskeIA, titular de Delegum.
            </div>
          </section>

          {/* 1. Qué es Delegum */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Qué es Delegum</h2>
            <p className={styles.sectionIntro}>
              Delegum es un <strong>servidor MCP (Model Context Protocol)</strong> gratuito que ofrece
              cálculos orientativos en materia <strong>fiscal, laboral y financiera</strong> conforme a la
              normativa española del ejercicio 2025. Funciona sobre la biblioteca de cálculo de meskeIA.
            </p>
            <p className={styles.sectionIntro}>
              Delegum <strong>no es un despacho profesional</strong> ni una asesoría colegiada, y
              <strong> no presta asesoramiento fiscal, laboral ni jurídico vinculante</strong>. Es una
              herramienta de apoyo y orientación, nunca un sustituto del juicio de un profesional cualificado.
            </p>
          </section>

          {/* 2. Naturaleza orientativa */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Naturaleza orientativa de los resultados</h2>
            <p className={styles.sectionIntro}>
              Todos los resultados que devuelve Delegum son <strong>estimaciones aproximadas</strong> de
              carácter educativo y orientativo. Pueden no contemplar las particularidades de tu caso concreto
              y dependen de factores que la herramienta no puede conocer ni verificar:
            </p>
            <ul className={styles.legalList}>
              <li>El convenio colectivo aplicable, en cálculos laborales.</li>
              <li>La comunidad autónoma y el municipio, en impuestos cedidos y tributos locales.</li>
              <li>Tu situación personal, familiar, patrimonial y crediticia completa.</li>
              <li>Cambios normativos posteriores a la fecha de verificación de los datos (ejercicio 2025).</li>
              <li>Las condiciones específicas de cada entidad, organismo o contrato.</li>
            </ul>
            <p className={styles.sectionIntro}>
              Los resultados <strong>no son vinculantes</strong> ni constituyen ofertas, liquidaciones
              oficiales ni compromisos de ninguna administración o entidad.
            </p>
          </section>

          {/* 3. Limitación de responsabilidad */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Limitación de responsabilidad</h2>
            <div className={styles.disclaimer}>
              <strong>EL SERVICIO SE PROPORCIONA «TAL COMO ESTÁ» Y «SEGÚN DISPONIBILIDAD».</strong> meskeIA
              no garantiza que los resultados sean exactos, completos o estén actualizados, y no asume
              responsabilidad alguna por:
              <ul className={styles.legalList} style={{ marginTop: '0.75rem' }}>
                <li>La precisión, completitud o fiabilidad de los cálculos.</li>
                <li>Las decisiones tomadas basándose en los resultados.</li>
                <li>Pérdidas económicas o daños directos, indirectos o consecuenciales.</li>
                <li>Interrupciones del servicio, errores técnicos o falta de disponibilidad.</li>
              </ul>
            </div>
            <p className={styles.sectionIntro}>
              Dado que el servicio es <strong>completamente gratuito</strong>, la responsabilidad total de
              meskeIA, si la hubiera, no excederá en ningún caso el importe de <strong>cero euros (0 €)</strong>.
            </p>
          </section>

          {/* 4. El canal MCP y los asistentes de IA */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Uso a través de asistentes de IA de terceros</h2>
            <p className={styles.sectionIntro}>
              Delegum se consume conectándolo a un asistente de IA de un tercero (por ejemplo Claude, ChatGPT
              o Mistral). Cada respuesta de Delegum incluye <strong>siempre un aviso legal</strong> que
              recuerda su carácter orientativo y la recomendación de consultar a un profesional.
            </p>
            <p className={styles.sectionIntro}>
              No obstante, <strong>la forma en que ese asistente de IA presenta, resume o reformula las
              respuestas escapa al control de Delegum</strong>. Ni Delegum ni meskeIA, como titular del
              servicio, se responsabilizan de cómo un cliente de terceros muestre los resultados ni el
              aviso legal asociado. El uso de dichos asistentes se rige además por los términos del
              proveedor correspondiente.
            </p>
          </section>

          {/* 5. Responsabilidad del usuario */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Responsabilidad del usuario</h2>
            <p className={styles.sectionIntro}>Al utilizar Delegum aceptas que:</p>
            <ul className={styles.legalList}>
              <li>
                <strong>Verificarás toda información crítica</strong> con un profesional cualificado
                (asesor fiscal colegiado, graduado social o abogado) o con el organismo oficial competente
                (AEAT, SEPE, Seguridad Social) antes de tomar cualquier decisión.
              </li>
              <li><strong>Asumes el riesgo</strong> de las decisiones que tomes a partir de los resultados.</li>
              <li>Entiendes que los resultados son orientativos y pueden diferir de cálculos oficiales.</li>
              <li>No utilizarás el servicio para fines ilegales ni para presentar sus resultados como asesoramiento profesional propio.</li>
            </ul>
          </section>

          {/* 6. Datos y privacidad */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Datos y privacidad</h2>
            <ul className={styles.privacyList}>
              <li>Los parámetros de cada consulta se procesan en memoria y <strong>no se almacenan</strong>.</li>
              <li>No se requiere cuenta, email ni ningún dato personal para usar el servidor.</li>
              <li>Toda la comunicación viaja cifrada por <strong>HTTPS/TLS</strong>.</li>
              <li>Política de privacidad completa: <a href="/privacidad" className={styles.link}>meskeia.com/privacidad</a>.</li>
            </ul>
          </section>

          {/* 7. Modificaciones */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Modificaciones del servicio</h2>
            <p className={styles.sectionIntro}>
              meskeIA se reserva el derecho de modificar, suspender o discontinuar Delegum o cualquiera de
              sus herramientas, así como de actualizar estos términos y los algoritmos de cálculo conforme a
              cambios normativos, en cualquier momento y sin previo aviso.
            </p>
          </section>

          {/* Reconocimiento final */}
          <section className={styles.section}>
            <div className={styles.disclaimer}>
              <strong>Al utilizar Delegum reconoces que has leído, entendido y aceptas quedar vinculado por
              estos Términos de Uso, y que el servicio es una herramienta orientativa que no sustituye el
              asesoramiento de un profesional colegiado.</strong>
            </div>
          </section>

        </article>
      </main>
    </>
  );
}
