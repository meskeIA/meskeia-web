'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  TABLA_AMORTIZACION_2026,
  MULTIPLICADORES_DEGRESIVO_2026,
  FISCAL_AMORTIZACION_META,
} from '@/data/fiscal';
import { formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/amortizacion-inmovilizado/';

// Multiplicadores de la amortización degresiva por porcentaje constante (art. 12.1.b LIS)
const MULTIPLICADORES = [
  { periodo: 'Período de amortización menor de 5 años', factor: MULTIPLICADORES_DEGRESIVO_2026.menor5 },
  { periodo: 'Período de amortización de 5 a 8 años', factor: MULTIPLICADORES_DEGRESIVO_2026.entre5y8 },
  { periodo: 'Período de amortización mayor de 8 años', factor: MULTIPLICADORES_DEGRESIVO_2026.mayor8 },
];

// Formatea un multiplicador en formato español: ×1,5
function factorTxt(n: number): string {
  return `× ${n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
}

export default function AmortizacionInmovilizadoPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_AMORTIZACION_META.verificado));
    } catch {
      return FISCAL_AMORTIZACION_META.verificado;
    }
  })();

  const textoCita =
    `«Tabla de coeficientes de amortización del inmovilizado», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_AMORTIZACION_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-amortizacion-inmovilizado" />

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
            <h1 className={styles.heroTitle}>Tabla de coeficientes de amortización</h1>
            <p className={styles.subtitle}>
              Los <strong>coeficientes de amortización lineal</strong> por tipo de activo del
              artículo 12.1 de la Ley del Impuesto sobre Sociedades, el período máximo admitido y los
              métodos de amortización degresiva.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Amortización del inmovilizado — ${FISCAL_AMORTIZACION_META.vigencia}`}
            fuente={FISCAL_AMORTIZACION_META.fuente}
            verificado={FISCAL_AMORTIZACION_META.verificado}
            urlOficial={FISCAL_AMORTIZACION_META.urlOficial}
            nota={FISCAL_AMORTIZACION_META.nota}
          />

          <NovedadesFicha slug="amortizacion-inmovilizado" />

          {/* Tabla de coeficientes lineales */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Coeficientes de amortización lineal</h2>
            <p className={styles.sectionIntro}>
              Para cada tipo de elemento, la amortización lineal admitida fiscalmente puede ir desde
              el <strong>coeficiente máximo</strong> (la más rápida) hasta la que resulta del
              <strong> período máximo</strong> (la más lenta). Cualquier porcentaje dentro de ese
              intervalo es deducible sin justificación adicional.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Tipo de elemento</th>
                    <th scope="col" className={styles.numCol}>Coef. lineal máx.</th>
                    <th scope="col" className={styles.numCol}>Período máx.</th>
                    <th scope="col" className={styles.numCol}>¿Degresivo?</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLA_AMORTIZACION_2026.map((a) => (
                    <tr key={a.id}>
                      <th scope="row" className={styles.rowHead}>{a.nombre}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{a.coefLinealMax}%</span>
                      </td>
                      <td className={styles.numCol}>{a.periodoMax} años</td>
                      <td className={styles.numCol}>{a.degresivoExcluido ? 'No' : 'Sí'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Selección de los elementos más habituales de la tabla oficial del art. 12.1.a LIS. Los
              edificios, el mobiliario y los enseres solo admiten amortización lineal (no degresiva).
            </p>
          </section>

          {/* Amortización degresiva */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Amortización degresiva por porcentaje constante</h2>
            <p className={styles.sectionIntro}>
              Este método (art. 12.1.b LIS) concentra más gasto en los primeros años. Se multiplica
              el coeficiente lineal por el factor correspondiente al período elegido, y el porcentaje
              resultante se aplica cada año sobre el valor pendiente de amortizar.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Período de amortización</th>
                    <th scope="col" className={styles.numCol}>Multiplicador</th>
                  </tr>
                </thead>
                <tbody>
                  {MULTIPLICADORES.map((m) => (
                    <tr key={m.periodo}>
                      <th scope="row" className={styles.rowHead}>{m.periodo}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{factorTxt(m.factor)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              El porcentaje constante resultante no puede ser inferior al{' '}
              {MULTIPLICADORES_DEGRESIVO_2026.minimoPorcentaje}%. La amortización degresiva no se
              aplica a edificios, mobiliario ni enseres.
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
                <h2 className={styles.ctaTitle}>¿Quieres el cuadro de amortización año a año?</h2>
                <p className={styles.ctaDesc}>
                  Calcula la amortización lineal, degresiva o por suma de dígitos de tu activo, con
                  cuadro anual y valor contable, en la calculadora de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/calculadora-amortizacion-inmovilizado/" className={styles.ctaBtn}>
                Calcular amortización →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="amortizacion-inmovilizado" />

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
