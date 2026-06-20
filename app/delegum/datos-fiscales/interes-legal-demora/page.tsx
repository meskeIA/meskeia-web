'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  INTERES_LEGAL_DINERO_2025,
  TIPOS_DEMORA_COMERCIAL,
  INTERES_DEMORA_TRIBUTARIO_2025,
  PLAZOS_RECLAMACION_COMERCIAL,
  FISCAL_INTERESES_META,
} from '@/data/fiscal';
import { formatDate } from '@/lib';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/interes-legal-demora/';

export default function InteresLegalDemoraPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_INTERESES_META.verificado));
    } catch {
      return FISCAL_INTERESES_META.verificado;
    }
  })();

  const textoCita =
    `«Interés legal del dinero y de demora 2026», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_INTERESES_META.fuente}. ` +
    `Verificado el ${fechaVerificacion}. ${URL_CANONICA}`;

  const copiarCita = async () => {
    try {
      await navigator.clipboard.writeText(textoCita);
      setCitaCopiada(true);
      setTimeout(() => setCitaCopiada(false), 2500);
    } catch {
      // El usuario puede seleccionar el texto manualmente
    }
  };

  return (
    <>
      <AnalyticsTracker appName="delegum-datos-interes-legal-demora" />

      <main className={styles.container}>
        <article className={styles.document}>

          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.heroLockup}>
              <Image
                src="/delegum/simbolo-blanco.svg"
                alt=""
                aria-hidden="true"
                width={56}
                height={56}
                className={styles.heroSymbol}
                priority
              />
              <span className={styles.heroWordmark}>Delegum</span>
            </div>
            <p className={styles.heroKicker}>Datos fiscales · Referencia</p>
            <h1 className={styles.heroTitle}>Interés legal del dinero y de demora</h1>
            <p className={styles.subtitle}>
              El <strong>interés legal del dinero</strong>, el <strong>interés de demora comercial</strong>{' '}
              por semestre (Ley 3/2004) y el <strong>interés de demora tributario</strong>, con la norma
              vigente.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer — Nivel 1 CRÍTICO (legal-fiscal) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Intereses — ${FISCAL_INTERESES_META.vigencia}`}
            fuente={FISCAL_INTERESES_META.fuente}
            verificado={FISCAL_INTERESES_META.verificado}
            urlOficial={FISCAL_INTERESES_META.urlOficialLey3}
            nota={FISCAL_INTERESES_META.nota}
          />

          {/* Interés legal y tributario */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Interés legal y de demora tributario</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Tipo de interés</th>
                    <th scope="col" className={styles.numCol}>%</th>
                    <th scope="col">Cuándo se aplica</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Interés legal del dinero</th>
                    <td className={styles.numCol}>
                      <span className={styles.tipoTag}>{INTERES_LEGAL_DINERO_2025.tipo}%</span>
                    </td>
                    <td className={styles.notaCell}>
                      Deudas civiles y mercantiles sin tipo pactado (art. 1108 CC). {INTERES_LEGAL_DINERO_2025.base}.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Interés de demora tributario</th>
                    <td className={styles.numCol}>
                      <span className={styles.tipoTag}>{INTERES_DEMORA_TRIBUTARIO_2025.tipo}%</span>
                    </td>
                    <td className={styles.notaCell}>
                      Liquidaciones, aplazamientos y fraccionamientos de la AEAT. {INTERES_DEMORA_TRIBUTARIO_2025.base}.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Demora comercial por semestre */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Interés de demora comercial (Ley 3/2004)</h2>
            <p className={styles.sectionIntro}>
              Para reclamar facturas impagadas entre empresas y autónomos. Equivale al tipo de
              referencia del BCE más 8 puntos, y se publica en el BOE cada semestre.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Semestre</th>
                    <th scope="col" className={styles.numCol}>Tipo BCE</th>
                    <th scope="col" className={styles.numCol}>+ 8 pp</th>
                    <th scope="col" className={styles.numCol}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {TIPOS_DEMORA_COMERCIAL.map((t) => (
                    <tr key={t.semestre}>
                      <th scope="row" className={styles.rowHead}>{t.semestre}</th>
                      <td className={styles.numCol}>{t.tipoBCE}%</td>
                      <td className={styles.numCol}>{t.incremento} pp</td>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{t.tipoTotal}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Los intereses se devengan automáticamente desde el día siguiente al vencimiento, sin avisar
              al deudor. Plazo legal de pago por defecto: {PLAZOS_RECLAMACION_COMERCIAL.plazoFactura} días.
              La deuda prescribe a los {PLAZOS_RECLAMACION_COMERCIAL.prescripcionDeuda} años.
            </p>
          </section>

          {/* Cómo citar */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cómo citar esta página</h2>
            <p className={styles.sectionIntro}>
              Puedes enlazar o citar estos datos indicando la fuente y la fecha de verificación:
            </p>
            <div className={styles.citaBox}>
              <p className={styles.citaTexto}>{textoCita}</p>
              <button type="button" className={styles.citaBtn} onClick={copiarCita} aria-live="polite">
                {citaCopiada ? '✓ Copiado' : 'Copiar cita'}
              </button>
            </div>
          </section>

          {/* CTA */}
          <section className={styles.section}>
            <div className={styles.ctaBox}>
              <div className={styles.ctaText}>
                <h2 className={styles.ctaTitle}>¿Cuánto te deben por una factura impagada?</h2>
                <p className={styles.ctaDesc}>
                  Calcula los intereses de demora de una factura vencida con el orientador de intereses
                  de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/orientador-intereses-demora/" className={styles.ctaBtn}>
                Calcular intereses →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="interes-legal-demora" />

          &
          <section className={styles.section}>
            <div className={styles.brandFoot}>
              <p>
                Esta página forma parte de <strong>Delegum</strong>, la plataforma de fiscalidad,
                derecho laboral y finanzas de{' '}
                <a href="https://meskeia.com/" className={styles.link}>meskeIA</a> — más de mil
                herramientas gratuitas para el día a día. Consulta también el resto de{' '}
                <a href="https://delegum.com/" className={styles.link}>Delegum</a>.
              </p>
            </div>
          </section>

        </article>
      </main>
    </>
  );
}
