'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import { TIPOS_ITP_CCAA_2025, FISCAL_INMUEBLES_META } from '@/data/fiscal';
import { formatDate } from '@/lib';
import styles from './ItpCcaa.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/itp-ccaa/';

// La fila "Media orientativa" no es una CCAA real: la separamos para no listarla en la tabla
const COMUNIDADES = TIPOS_ITP_CCAA_2025.filter((t) => t.ccaa !== 'Media orientativa');

export default function ItpCcaaPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_INMUEBLES_META.verificado));
    } catch {
      return FISCAL_INMUEBLES_META.verificado;
    }
  })();

  const textoCita =
    `«Tipos de ITP por comunidad autónoma 2025-2026», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_INMUEBLES_META.fuente}. ` +
    `Verificado el ${fechaVerificacion}. ${URL_CANONICA}`;

  const copiarCita = async () => {
    try {
      await navigator.clipboard.writeText(textoCita);
      setCitaCopiada(true);
      setTimeout(() => setCitaCopiada(false), 2500);
    } catch {
      // Si el navegador bloquea el portapapeles, el usuario puede seleccionar el texto manualmente
    }
  };

  return (
    <>
      <AnalyticsTracker appName="delegum-datos-itp-ccaa" />

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
            <h1 className={styles.heroTitle}>Tipos de ITP por comunidad autónoma</h1>
            <p className={styles.subtitle}>
              Tipos del <strong>Impuesto de Transmisiones Patrimoniales</strong> aplicables a la
              compra de vivienda de segunda mano, comunidad por comunidad, con sus tipos reducidos
              y la norma vigente.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`ITP — ${FISCAL_INMUEBLES_META.vigencia}`}
            fuente={FISCAL_INMUEBLES_META.fuente}
            verificado={FISCAL_INMUEBLES_META.verificado}
            urlOficial={FISCAL_INMUEBLES_META.urlOficialITP}
            nota={FISCAL_INMUEBLES_META.nota}
          />

          {/* Tabla de referencia */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tabla por comunidad autónoma</h2>
            <p className={styles.sectionIntro}>
              El tipo general se aplica a la compra de vivienda usada entre particulares. El tipo
              reducido corresponde a colectivos como jóvenes, familias numerosas o personas con
              discapacidad, casi siempre con límites de valor del inmueble (ver detalle en cada fila).
            </p>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Comunidad autónoma</th>
                    <th scope="col" className={styles.numCol}>Tipo general</th>
                    <th scope="col" className={styles.numCol}>Reducido</th>
                    <th scope="col">Condiciones y notas</th>
                  </tr>
                </thead>
                <tbody>
                  {COMUNIDADES.map((t) => (
                    <tr key={t.ccaa}>
                      <th scope="row" className={styles.ccaaCell}>{t.ccaa}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoGeneral}>{t.tipo}%</span>
                      </td>
                      <td className={styles.numCol}>
                        {t.reducido != null ? `${t.reducido}%` : '—'}
                      </td>
                      <td className={styles.notaCell}>{t.notaReducido ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Media orientativa nacional del tipo general: <strong>≈ 8%</strong>. Los tipos
              reducidos suelen exigir que sea la vivienda habitual y no superar un valor máximo;
              confirma siempre el requisito exacto en la hacienda de tu comunidad.
            </p>
          </section>

          {/* Cómo citar */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cómo citar esta tabla</h2>
            <p className={styles.sectionIntro}>
              Puedes enlazar o citar estos datos indicando la fuente y la fecha de verificación:
            </p>
            <div className={styles.citaBox}>
              <p className={styles.citaTexto}>{textoCita}</p>
              <button
                type="button"
                className={styles.citaBtn}
                onClick={copiarCita}
                aria-live="polite"
              >
                {citaCopiada ? '✓ Copiado' : 'Copiar cita'}
              </button>
            </div>
          </section>

          {/* CTA a la calculadora */}
          <section className={styles.section}>
            <div className={styles.ctaBox}>
              <div className={styles.ctaText}>
                <h2 className={styles.ctaTitle}>¿Quieres calcular el coste total de tu compra?</h2>
                <p className={styles.ctaDesc}>
                  Estima los gastos completos de la compraventa —ITP, notaría, registro y
                  plusvalía— con la calculadora de meskeIA.
                </p>
              </div>
              <a
                href="https://meskeia.com/estimador-compraventa-inmueble/"
                className={styles.ctaBtn}
              >
                Calcular gastos de compra →
              </a>
            </div>
          </section>

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
