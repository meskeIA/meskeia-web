'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  TIPOS_IVA,
  EXENCIONES_ART20,
  RECARGO_EQUIVALENCIA,
  RECARGO_EQUIVALENCIA_TABACO,
  FISCAL_IVA_META,
} from '@/data/fiscal';
import { formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/iva-tipos/';

export default function IvaTiposPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_IVA_META.verificado));
    } catch {
      return FISCAL_IVA_META.verificado;
    }
  })();

  const textoCita =
    `«Tipos de IVA en España 2025-2026», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_IVA_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-iva-tipos" />

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
            <h1 className={styles.heroTitle}>Tipos de IVA en España</h1>
            <p className={styles.subtitle}>
              Los tres tipos del <strong>Impuesto sobre el Valor Añadido</strong> —general, reducido y
              superreducido— con ejemplos de a qué se aplican, las operaciones exentas y el recargo de
              equivalencia.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`IVA — ${FISCAL_IVA_META.vigencia}`}
            fuente={FISCAL_IVA_META.fuente}
            verificado={FISCAL_IVA_META.verificado}
            urlOficial={FISCAL_IVA_META.urlOficial}
            nota={FISCAL_IVA_META.nota}
          />

          <NovedadesFicha slug="iva-tipos" />

          {/* Tipos de IVA */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tipos impositivos</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Tipo</th>
                    <th scope="col" className={styles.numCol}>Porcentaje</th>
                    <th scope="col">Ejemplos de aplicación</th>
                  </tr>
                </thead>
                <tbody>
                  {TIPOS_IVA.map((t) => (
                    <tr key={t.id}>
                      <th scope="row" className={styles.rowHead}>{t.nombre}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{t.porcentaje}%</span>
                      </td>
                      <td className={styles.notaCell}>{t.ejemplos.join(' · ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Estos tipos se aplican en el <strong>territorio IVA</strong> (península y Baleares).
              Canarias usa el <strong>IGIC</strong> y Ceuta y Melilla el <strong>IPSI</strong>, con
              tipos distintos.
            </p>
          </section>

          {/* Exenciones */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Operaciones exentas (art. 20)</h2>
            <p className={styles.sectionIntro}>
              No repercuten IVA, pero —a diferencia de las exportaciones— normalmente tampoco permiten
              deducir el IVA soportado.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Actividad</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {EXENCIONES_ART20.map((e) => (
                    <tr key={e.actividad}>
                      <th scope="row" className={styles.rowHead}>{e.actividad}</th>
                      <td className={styles.notaCell}>{e.detalle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recargo de equivalencia */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Recargo de equivalencia</h2>
            <p className={styles.sectionIntro}>
              Régimen obligatorio para comerciantes minoristas (personas físicas) que venden a
              consumidor final. El proveedor les repercute el IVA más este recargo.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Tipo de IVA</th>
                    <th scope="col" className={styles.numCol}>Recargo</th>
                  </tr>
                </thead>
                <tbody>
                  {RECARGO_EQUIVALENCIA.map((r) => (
                    <tr key={r.tipoIVA}>
                      <th scope="row" className={styles.rowHead}>{r.tipoIVA}%</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{r.recargo}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              El tabaco tiene un recargo específico del {RECARGO_EQUIVALENCIA_TABACO}%. A cambio del
              recargo, el comerciante en este régimen no presenta autoliquidaciones de IVA.
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
                <h2 className={styles.ctaTitle}>¿Qué IVA aplicar en tu factura?</h2>
                <p className={styles.ctaDesc}>
                  Resuelve qué tipo corresponde según la operación —nacional, intracomunitaria,
                  exportación— con el orientador de IVA de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/orientador-iva-espana/" className={styles.ctaBtn}>
                Abrir orientador del IVA →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="iva-tipos" />

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
