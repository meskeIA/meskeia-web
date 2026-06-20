'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import { getModelosCalendario, FISCAL_CALENDARIO_META, type ModeloFiscal } from '@/data/fiscal';
import { formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/calendario-fiscal/';

const TRIMESTRALES = getModelosCalendario('trimestral');
const ANUALES = getModelosCalendario('anual');
const RENTA_SOCIEDADES = getModelosCalendario('renta-sociedades');

function TablaModelos({ modelos }: { modelos: ModeloFiscal[] }) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Modelo</th>
            <th scope="col">Concepto</th>
            <th scope="col">A quién aplica</th>
            <th scope="col">Plazo</th>
          </tr>
        </thead>
        <tbody>
          {modelos.map((m) => (
            <tr key={m.modelo}>
              <th scope="row" className={styles.rowHead}>
                <span className={styles.tipoTag}>{m.modelo}</span>
              </th>
              <td>{m.nombre}</td>
              <td className={styles.notaCell}>{m.quien}</td>
              <td className={styles.notaCell}>{m.plazo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CalendarioFiscalPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_CALENDARIO_META.verificado));
    } catch {
      return FISCAL_CALENDARIO_META.verificado;
    }
  })();

  const textoCita =
    `«Calendario fiscal de España: plazos de los modelos», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_CALENDARIO_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-calendario-fiscal" />

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
            <h1 className={styles.heroTitle}>Calendario fiscal</h1>
            <p className={styles.subtitle}>
              Los <strong>plazos recurrentes</strong> de los modelos tributarios en España —
              trimestrales, resúmenes anuales, la Renta y el Impuesto de Sociedades— con el perfil
              al que aplica cada uno.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Calendario del contribuyente — ${FISCAL_CALENDARIO_META.vigencia}`}
            fuente={FISCAL_CALENDARIO_META.fuente}
            verificado={FISCAL_CALENDARIO_META.verificado}
            urlOficial={FISCAL_CALENDARIO_META.urlOficial}
            nota={FISCAL_CALENDARIO_META.nota}
          />

          <NovedadesFicha slug="calendario-fiscal" />

          {/* Trimestrales */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Modelos trimestrales</h2>
            <p className={styles.sectionIntro}>
              Con carácter general se presentan hasta el día 20 del mes siguiente a cada trimestre.
              El cuarto trimestre del IVA (303) y de los pagos fraccionados del IRPF (130/131) se
              amplía hasta el 30 de enero.
            </p>
            <TablaModelos modelos={TRIMESTRALES} />
          </section>

          {/* Anuales */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Resúmenes y declaraciones anuales</h2>
            <p className={styles.sectionIntro}>
              Resúmenes informativos del ejercicio anterior, que se presentan a comienzos de año.
            </p>
            <TablaModelos modelos={ANUALES} />
          </section>

          {/* Renta y Sociedades */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Renta y Sociedades</h2>
            <p className={styles.sectionIntro}>
              Las dos grandes declaraciones anuales: la Renta de las personas físicas y el Impuesto
              de Sociedades.
            </p>
            <TablaModelos modelos={RENTA_SOCIEDADES} />
            <p className={styles.tableFoot}>
              Si el último día de un plazo cae en fin de semana o festivo, se traslada al siguiente
              día hábil. Para domiciliar el pago, la fecha límite es unos días anterior al fin del
              plazo. Las fechas exactas de cada ejercicio se publican en el calendario del
              contribuyente de la AEAT.
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

          {/* CTA a la calculadora */}
          <section className={styles.section}>
            <div className={styles.ctaBox}>
              <div className={styles.ctaText}>
                <h2 className={styles.ctaTitle}>¿Quieres las fechas exactas de este año?</h2>
                <p className={styles.ctaDesc}>
                  Consulta el calendario fiscal interactivo de meskeIA, con las fechas del ejercicio
                  ya ajustadas a días hábiles según tu perfil.
                </p>
              </div>
              <a href="https://meskeia.com/calendario-fiscal-emprendedor/" className={styles.ctaBtn}>
                Ver el calendario interactivo →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="calendario-fiscal" />

          {/* Pertenencia a meskeIA */}
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
