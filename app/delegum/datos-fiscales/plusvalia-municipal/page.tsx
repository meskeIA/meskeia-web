'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import { COEFICIENTES_IIVTNU_2025, PLUSVALIA_MUNICIPAL_META } from '@/data/fiscal';
import { formatDate } from '@/lib';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/plusvalia-municipal/';

// Coeficiente en formato español: 0,14
function coefTxt(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PlusvaliaMunicipalPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(PLUSVALIA_MUNICIPAL_META.verificado));
    } catch {
      return PLUSVALIA_MUNICIPAL_META.verificado;
    }
  })();

  const textoCita =
    `«Plusvalía municipal (IIVTNU): coeficientes por años», Delegum (meskeIA). ` +
    `Fuente: ${PLUSVALIA_MUNICIPAL_META.baseNormativa}. ` +
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
      <AnalyticsTracker appName="delegum-datos-plusvalia-municipal" />

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
            <h1 className={styles.heroTitle}>Plusvalía municipal (IIVTNU)</h1>
            <p className={styles.subtitle}>
              Los <strong>coeficientes por años de tenencia</strong>, quién paga el impuesto, el tipo
              máximo legal y los dos métodos de cálculo (objetivo y real) tras el RDL 26/2021.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Plusvalía municipal (IIVTNU) — ${PLUSVALIA_MUNICIPAL_META.vigencia}`}
            fuente={PLUSVALIA_MUNICIPAL_META.baseNormativa}
            verificado={PLUSVALIA_MUNICIPAL_META.verificado}
            urlOficial={PLUSVALIA_MUNICIPAL_META.urlReferencia}
            nota={PLUSVALIA_MUNICIPAL_META.aviso}
          />

          {/* Qué es y quién paga */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Qué es y quién la paga</h2>
            <p className={styles.sectionIntro}>
              La plusvalía municipal grava el incremento de valor del suelo urbano al transmitir un
              inmueble. La gestiona cada ayuntamiento, que fija el tipo de gravamen hasta un máximo
              legal.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Quién la paga</th>
                    <td>{PLUSVALIA_MUNICIPAL_META.quien}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Tipo máximo legal</th>
                    <td><span className={styles.tipoTag}>{PLUSVALIA_MUNICIPAL_META.tipoMaximoLegal}%</span> — cada ayuntamiento fija el suyo hasta ese tope.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Base de cálculo</th>
                    <td>Valor catastral del suelo × coeficiente por años de tenencia (método objetivo).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Coeficientes por años */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Coeficientes por años de tenencia</h2>
            <p className={styles.sectionIntro}>
              En el método objetivo, la base imponible es el valor catastral del suelo multiplicado
              por estos coeficientes máximos. Cada ayuntamiento puede aplicar coeficientes iguales o
              inferiores.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Años de tenencia</th>
                    <th scope="col" className={styles.numCol}>Coeficiente máximo</th>
                  </tr>
                </thead>
                <tbody>
                  {COEFICIENTES_IIVTNU_2025.map((c) => (
                    <tr key={c.anios}>
                      <th scope="row" className={styles.rowHead}>{c.label}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{coefTxt(c.coeficiente)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Los coeficientes se actualizan cada año por la Ley de Presupuestos. Si no se aprueba,
              se prorrogan los del ejercicio anterior.
            </p>
          </section>

          {/* Métodos de cálculo */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Métodos de cálculo (RDL 26/2021)</h2>
            <p className={styles.sectionIntro}>
              Desde 2021 puedes elegir el método que te resulte más favorable, y si no ha habido
              incremento de valor no se paga el impuesto:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Método</th>
                    <th scope="col">Cómo se calcula la base</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Objetivo</th>
                    <td>Valor catastral del suelo × coeficiente según los años de tenencia.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Real</th>
                    <td>Incremento efectivo (precio de venta menos compra) en la parte proporcional al valor del suelo.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Se aplica el menor de los dos resultados. Si la transmisión no arroja incremento de
              valor del terreno (venta con pérdida acreditada por las escrituras), la operación queda
              no sujeta y no se paga.
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
                <h2 className={styles.ctaTitle}>¿Cuánto pagarás de plusvalía municipal?</h2>
                <p className={styles.ctaDesc}>
                  Compara el método objetivo y el real con tu valor catastral, años de tenencia y
                  precios de compra y venta en la calculadora de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/estimador-plusvalia-municipal/" className={styles.ctaBtn}>
                Calcular plusvalía →
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
