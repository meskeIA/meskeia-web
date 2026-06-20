'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  TABLA_EDAD_JUBILACION,
  COTIZACION_MINIMA,
  TRAMOS_PORCENTAJE_PENSION_2025,
  LIMITES_PENSION_2025,
  FISCAL_PENSIONES_META,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/pensiones-jubilacion/';

// Incrementos por mes cotizado (desde los datos): tramo intermedio y tramo final
const INCREMENTO_INTERMEDIO = TRAMOS_PORCENTAJE_PENSION_2025[1].incrementoPorMes;
const INCREMENTO_FINAL = TRAMOS_PORCENTAJE_PENSION_2025[2].incrementoPorMes;

// Límites de pensión 2026 (€/mes, 14 pagas)
const LIMITES = [
  { concepto: 'Pensión máxima', importe: LIMITES_PENSION_2025.maximaMensual },
  { concepto: 'Mínima con cónyuge a cargo (≥65)', importe: LIMITES_PENSION_2025.minimaConConyuge },
  { concepto: 'Mínima unidad unipersonal (≥65)', importe: LIMITES_PENSION_2025.minimaSolo },
  { concepto: 'Mínima con cónyuge no a cargo (≥65)', importe: LIMITES_PENSION_2025.minimaSinConyuge },
];

// Formatea años y meses: «66 años y 10 meses» / «65 años»
function aniosMeses({ anios, meses }: { anios: number; meses: number }): string {
  return meses > 0 ? `${anios} años y ${meses} meses` : `${anios} años`;
}

// Formatea un incremento porcentual: 0,21%
function pctTxt(n: number): string {
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function PensionesJubilacionPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_PENSIONES_META.verificado));
    } catch {
      return FISCAL_PENSIONES_META.verificado;
    }
  })();

  const textoCita =
    `«Pensión de jubilación 2026: edad, años cotizados y cuantías», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_PENSIONES_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-pensiones-jubilacion" />

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
            <h1 className={styles.heroTitle}>Pensión de jubilación: edad, cotización y cuantías</h1>
            <p className={styles.subtitle}>
              La <strong>edad de jubilación</strong>, los años mínimos de cotización, el porcentaje de
              pensión según los años cotizados y los límites de la pensión pública en 2026.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Pensión de jubilación — ${FISCAL_PENSIONES_META.vigencia}`}
            fuente={FISCAL_PENSIONES_META.fuente}
            verificado={FISCAL_PENSIONES_META.verificado}
            urlOficial={FISCAL_PENSIONES_META.urlOficial}
            nota={FISCAL_PENSIONES_META.nota}
          />

          {/* Edad de jubilación */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Edad de jubilación ordinaria</h2>
            <p className={styles.sectionIntro}>
              La edad depende de los años cotizados. Con cotización suficiente puedes jubilarte a los
              65 años; en caso contrario, la edad sube progresivamente hasta los 67 años en 2027.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Año de jubilación</th>
                    <th scope="col">Edad sin cotización suficiente</th>
                    <th scope="col">Cotización para jubilarse a los 65</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLA_EDAD_JUBILACION.map((e) => (
                    <tr key={e.anio}>
                      <th scope="row" className={styles.rowHead}>{e.anio}</th>
                      <td>{aniosMeses(e.edadSinCotizacion)}</td>
                      <td>{aniosMeses(e.cotizacionPara65)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Años cotizados y porcentaje */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Años cotizados y porcentaje de pensión</h2>
            <p className={styles.sectionIntro}>
              Hacen falta al menos {COTIZACION_MINIMA.anosMinimosAcceso} años cotizados para tener
              derecho a pensión. El porcentaje sobre la base reguladora crece con los años cotizados
              hasta alcanzar el 100% con unos {Math.floor(COTIZACION_MINIMA.anosParaCien)} años y 9
              meses.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Años cotizados</th>
                    <th scope="col" className={styles.numCol}>Porcentaje de la base reguladora</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>{COTIZACION_MINIMA.anosMinimosAcceso} años (mínimo de acceso)</th>
                    <td className={styles.numCol}><span className={styles.tipoTag}>50%</span></td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Cada mes adicional (hasta ~23 años)</th>
                    <td className={styles.numCol}>+ {pctTxt(INCREMENTO_INTERMEDIO)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Cada mes adicional (a partir de ~23 años)</th>
                    <td className={styles.numCol}>+ {pctTxt(INCREMENTO_FINAL)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>~36 años y 9 meses</th>
                    <td className={styles.numCol}><span className={styles.tipoTag}>100%</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              La base reguladora es el promedio de las 300 últimas bases de cotización (25 años)
              dividido entre 350. Desde 2026 convive con un sistema dual que descarta los peores años
              de un periodo más amplio; la Seguridad Social aplica de oficio el cálculo más favorable.
            </p>
          </section>

          {/* Límites de pensión */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Pensión máxima y mínima 2026</h2>
            <p className={styles.sectionIntro}>
              Toda pensión contributiva tiene un tope máximo y, según la situación familiar, una
              cuantía mínima garantizada. Importes mensuales en 14 pagas:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col" className={styles.numCol}>Importe mensual</th>
                  </tr>
                </thead>
                <tbody>
                  {LIMITES.map((l) => (
                    <tr key={l.concepto}>
                      <th scope="row" className={styles.rowHead}>{l.concepto}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{formatCurrency(l.importe)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              La pensión máxima anual asciende a {formatCurrency(LIMITES_PENSION_2025.maximaAnual)} (14
              pagas). Las cuantías mínimas requieren acreditar límites de ingresos y se complementan
              hasta el mínimo garantizado cuando la pensión calculada queda por debajo.
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
                <h2 className={styles.ctaTitle}>¿Cuánto cobrarás de pensión?</h2>
                <p className={styles.ctaDesc}>
                  Estima tu pensión pública según tu edad, años cotizados y bases, incluyendo
                  jubilación anticipada y parcial, con el simulador de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/simulador-jubilacion-publica/" className={styles.ctaBtn}>
                Simular mi jubilación →
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
