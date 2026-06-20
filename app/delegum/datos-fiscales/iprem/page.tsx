'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import { IPREM_2026, FISCAL_IPREM_META } from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/iprem/';

// Cuantías del IPREM 2026 en sus distintas referencias
const CUANTIAS = [
  { concepto: 'Diario', importe: IPREM_2026.diario, nota: 'Año de 360 días (30 × 12).' },
  { concepto: 'Mensual', importe: IPREM_2026.mensual, nota: 'Referencia habitual de subsidios.' },
  { concepto: 'Anual (12 pagas)', importe: IPREM_2026.anual12, nota: 'Cuando no se incluyen pagas extra.' },
  { concepto: 'Anual (14 pagas)', importe: IPREM_2026.anual14, nota: 'Referencia más usada en ayudas y becas.' },
];

export default function IpremPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_IPREM_META.verificado));
    } catch {
      return FISCAL_IPREM_META.verificado;
    }
  })();

  const textoCita =
    `«IPREM 2026: cuantía diaria, mensual y anual», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_IPREM_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-iprem" />

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
            <h1 className={styles.heroTitle}>IPREM 2026</h1>
            <p className={styles.subtitle}>
              Las cuantías del <strong>Indicador Público de Renta de Efectos Múltiples</strong> en
              2026 (diaria, mensual y anual), para qué se usa y en qué se diferencia del Salario
              Mínimo.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`IPREM — ${FISCAL_IPREM_META.vigencia}`}
            fuente={FISCAL_IPREM_META.fuente}
            verificado={FISCAL_IPREM_META.verificado}
            urlOficial={FISCAL_IPREM_META.urlOficial}
            nota={FISCAL_IPREM_META.nota}
          />

          <NovedadesFicha slug="iprem" />

          {/* Cuantías */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cuantías del IPREM 2026</h2>
            <p className={styles.sectionIntro}>
              El IPREM permanece congelado desde 2022, por lo que las cuantías de 2026 coinciden con
              las de 2025. Estas son sus referencias diaria, mensual y anual:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Referencia</th>
                    <th scope="col" className={styles.numCol}>Cuantía 2026</th>
                    <th scope="col">Cuándo se usa</th>
                  </tr>
                </thead>
                <tbody>
                  {CUANTIAS.map((c) => (
                    <tr key={c.concepto}>
                      <th scope="row" className={styles.rowHead}>{c.concepto}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{formatCurrency(c.importe)}</span>
                      </td>
                      <td className={styles.notaCell}>{c.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Para el cálculo de topes de prestaciones, la Seguridad Social emplea un año de 360 días:
              el IPREM anual de 14 pagas equivale a {formatCurrency(IPREM_2026.diario14)} al día sobre
              esa base.
            </p>
          </section>

          {/* Para qué se usa */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>¿Para qué se usa el IPREM?</h2>
            <p className={styles.sectionIntro}>
              El IPREM es la vara de medir de buena parte de las ayudas públicas: fija los umbrales de
              renta por debajo de los cuales se puede acceder a una prestación. Algunos usos
              habituales:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Ámbito</th>
                    <th scope="col">Uso del IPREM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Desempleo y subsidios</th>
                    <td>Muchos subsidios exigen no superar el 75% del IPREM mensual; los topes de la prestación se fijan en múltiplos del IPREM.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Justicia gratuita</th>
                    <td>El derecho a abogado de oficio depende de no superar un número de veces el IPREM anual, según los miembros de la unidad familiar.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Becas y ayudas al estudio</th>
                    <td>Los umbrales de renta familiar se expresan en veces el IPREM.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Ayudas a la vivienda</th>
                    <td>El acceso a alquiler social o a bonos de vivienda suele limitarse a rentas inferiores a un múltiplo del IPREM.</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
                <h2 className={styles.ctaTitle}>¿Tienes derecho a justicia gratuita?</h2>
                <p className={styles.ctaDesc}>
                  Comprueba si tus ingresos están por debajo del umbral del IPREM para acceder a
                  abogado y procurador de oficio con el orientador de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/orientador-justicia-gratuita/" className={styles.ctaBtn}>
                Comprobar requisitos →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="iprem" />

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
