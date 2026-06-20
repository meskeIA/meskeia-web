'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  TIPOS_IS_2025,
  TRAMOS_IS_MICROPYMES_2026,
  OBLIGACIONES_SL_2025,
  FISCAL_SOCIEDADES_META,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/impuesto-sociedades/';

// Tipos de gravamen vigentes (referenciando las constantes; el tipo plano de
// microempresas del 23% quedó obsoleto y se sustituye por la escala progresiva)
const TIPOS = [
  { concepto: 'Tipo general', tipo: `${TIPOS_IS_2025.general}%`, detalle: 'Aplicable a la mayoría de sociedades.' },
  { concepto: 'Empresas de nueva creación', tipo: `${TIPOS_IS_2025.nuevaCreacion}%`, detalle: 'Primeros dos periodos impositivos con base imponible positiva.' },
  { concepto: 'Microempresas (cifra de negocio < 1 M€)', tipo: 'Escala 19% / 21%', detalle: 'Escala progresiva de la Ley 7/2024 (ver detalle abajo).' },
  { concepto: 'Cooperativas (resultados cooperativos)', tipo: `${TIPOS_IS_2025.cooperativas}%`, detalle: 'Resultados cooperativos de cooperativas protegidas.' },
  { concepto: 'Entidades parcialmente exentas', tipo: `${TIPOS_IS_2025.entidadesExentas}%`, detalle: 'Entidades sin ánimo de lucro no acogidas a la Ley 49/2002.' },
];

// Escala de microempresas con etiqueta legible del tramo
function rangoMicropyme(hasta: number, i: number): string {
  if (hasta === Infinity) return 'Resto de la base imponible';
  return `Hasta ${formatCurrency(hasta)}${i === 0 ? ' de base imponible' : ''}`;
}

export default function ImpuestoSociedadesPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_SOCIEDADES_META.verificado));
    } catch {
      return FISCAL_SOCIEDADES_META.verificado;
    }
  })();

  const textoCita =
    `«Tipos del Impuesto de Sociedades 2026», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_SOCIEDADES_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-impuesto-sociedades" />

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
            <h1 className={styles.heroTitle}>Tipos del Impuesto de Sociedades</h1>
            <p className={styles.subtitle}>
              Los <strong>tipos de gravamen</strong> del Impuesto sobre Sociedades en 2026: general,
              nueva creación, la nueva escala de microempresas (Ley 7/2024) y las obligaciones
              periódicas de una sociedad.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Impuesto de Sociedades — ${FISCAL_SOCIEDADES_META.vigencia}`}
            fuente={FISCAL_SOCIEDADES_META.fuente}
            verificado={FISCAL_SOCIEDADES_META.verificado}
            urlOficial={FISCAL_SOCIEDADES_META.urlOficial}
            nota={FISCAL_SOCIEDADES_META.nota}
          />

          {/* Tipos de gravamen */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tipos de gravamen</h2>
            <p className={styles.sectionIntro}>
              El tipo general es del {TIPOS_IS_2025.general}% y sobre él existen varios tipos
              especiales según el tipo de entidad y su situación.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Tipo de entidad</th>
                    <th scope="col" className={styles.numCol}>Tipo</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {TIPOS.map((t) => (
                    <tr key={t.concepto}>
                      <th scope="row" className={styles.rowHead}>{t.concepto}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{t.tipo}</span>
                      </td>
                      <td className={styles.notaCell}>{t.detalle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Escala microempresas */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Escala progresiva de microempresas (2026)</h2>
            <p className={styles.sectionIntro}>
              Las entidades con una cifra de negocio inferior a 1 millón de euros tributan desde 2025
              por una escala progresiva (Ley 7/2024), en lugar del antiguo tipo plano del 23%. Es una
              implantación gradual: 21%/22% en 2025, 19%/21% en 2026 y 17%/20% en 2027.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Base imponible</th>
                    <th scope="col" className={styles.numCol}>Tipo 2026</th>
                  </tr>
                </thead>
                <tbody>
                  {TRAMOS_IS_MICROPYMES_2026.map((t, i) => (
                    <tr key={t.hasta}>
                      <th scope="row" className={styles.rowHead}>{rangoMicropyme(t.hasta, i)}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{t.tipo}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Las sociedades de nueva creación mantienen el {TIPOS_IS_2025.nuevaCreacion}% en los dos
              primeros periodos con base imponible positiva, aunque sean microempresas.
            </p>
          </section>

          {/* Obligaciones periódicas */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Modelos y obligaciones periódicas</h2>
            <p className={styles.sectionIntro}>
              Una sociedad presenta a lo largo del año varios modelos ante la Agencia Tributaria.
              Estos son los más habituales:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Modelo</th>
                    <th scope="col">Concepto</th>
                    <th scope="col">Periodicidad</th>
                  </tr>
                </thead>
                <tbody>
                  {OBLIGACIONES_SL_2025.map((o) => (
                    <tr key={o.modelo}>
                      <th scope="row" className={styles.rowHead}>{o.modelo}</th>
                      <td>{o.nombre}</td>
                      <td className={styles.notaCell}>{o.periodicidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              La declaración anual (Modelo 200) se presenta en los 25 días tras los 6 meses desde el
              cierre del ejercicio (hasta el 25 de julio para ejercicios que coinciden con el año
              natural).
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
                <h2 className={styles.ctaTitle}>¿Autónomo o sociedad limitada?</h2>
                <p className={styles.ctaDesc}>
                  Compara cuánto pagarías tributando por IRPF como autónomo o por el Impuesto de
                  Sociedades como SL, según tu beneficio, con la calculadora de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/comparador-autonomo-vs-sl/" className={styles.ctaBtn}>
                Comparar autónomo vs SL →
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
