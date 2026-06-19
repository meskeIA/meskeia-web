'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import { SMI_2026, SMI_2025, FISCAL_SMI_META } from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/smi-salario-minimo/';

export default function SmiPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_SMI_META.verificado));
    } catch {
      return FISCAL_SMI_META.verificado;
    }
  })();

  // Cuantías del SMI 2026
  const CUANTIAS = [
    { concepto: 'Mensual (14 pagas)', valor: formatCurrency(SMI_2026.mensual14) },
    { concepto: 'Mensual (12 pagas, prorrateadas)', valor: formatCurrency(SMI_2026.mensual12) },
    { concepto: 'Anual', valor: formatCurrency(SMI_2026.anual) },
    { concepto: 'Diario', valor: formatCurrency(SMI_2026.diario) },
    { concepto: 'Por hora (empleadas de hogar)', valor: formatCurrency(SMI_2026.hogarHora) },
    { concepto: 'Por día (trabajadores eventuales y temporeros)', valor: formatCurrency(SMI_2026.eventualesDia) },
  ];

  // Comparativa 2025 vs 2026
  const COMPARATIVA = [
    { concepto: 'Mensual (14 pagas)', y2025: formatCurrency(SMI_2025.mensual14), y2026: formatCurrency(SMI_2026.mensual14) },
    { concepto: 'Anual', y2025: formatCurrency(SMI_2025.anual), y2026: formatCurrency(SMI_2026.anual) },
    { concepto: 'Diario', y2025: formatCurrency(SMI_2025.diario), y2026: formatCurrency(SMI_2026.diario) },
  ];

  const textoCita =
    `«Salario Mínimo Interprofesional (SMI) 2026», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_SMI_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-smi" />

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
            <h1 className={styles.heroTitle}>Salario Mínimo Interprofesional (SMI) 2026</h1>
            <p className={styles.subtitle}>
              Cuantías del <strong>SMI</strong> vigente en España: mensual, anual, diario y por hora,
              con la comparativa respecto a 2025 y la norma oficial.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer — Nivel 2 ALTO (laboral, sin componente fiscal directo) */}
          <DisclaimerCard variant="financial" severity="high" />
          <DataReference
            normativa={`SMI — ${FISCAL_SMI_META.vigencia}`}
            fuente={FISCAL_SMI_META.fuente}
            verificado={FISCAL_SMI_META.verificado}
            urlOficial={FISCAL_SMI_META.urlOficial}
            nota={SMI_2026.boe}
          />

          {/* Cuantías 2026 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cuantías del SMI 2026</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col" className={styles.numCol}>Importe bruto</th>
                  </tr>
                </thead>
                <tbody>
                  {CUANTIAS.map((c) => (
                    <tr key={c.concepto}>
                      <th scope="row" className={styles.rowHead}>{c.concepto}</th>
                      <td className={styles.numCol}>{c.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              El SMI se fija por defecto en <strong>14 pagas</strong>. Si el contrato prorratea las
              extra, el importe mensual equivalente es {formatCurrency(SMI_2026.mensual12)}, pero el
              total anual no cambia. Vigente desde el 1 de enero de 2026 ({SMI_2026.boe}).
            </p>
          </section>

          {/* Comparativa 2025-2026 */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Evolución 2025 → 2026</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col" className={styles.numCol}>2025</th>
                    <th scope="col" className={styles.numCol}>2026</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVA.map((c) => (
                    <tr key={c.concepto}>
                      <th scope="row" className={styles.rowHead}>{c.concepto}</th>
                      <td className={styles.numCol}>{c.y2025}</td>
                      <td className={styles.numCol}>{c.y2026}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              El SMI 2026 sube un <strong>{SMI_2026.incrementoPct}%</strong> respecto a 2025.
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
                <h2 className={styles.ctaTitle}>¿Cuánto queda en neto?</h2>
                <p className={styles.ctaDesc}>
                  Calcula el sueldo neto a partir del bruto, con IRPF y cotizaciones, con la
                  calculadora de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/estimador-sueldo-neto/" className={styles.ctaBtn}>
                Calcular sueldo neto →
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
