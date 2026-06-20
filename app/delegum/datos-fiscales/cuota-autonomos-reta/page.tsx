'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  TRAMOS_RETA_2025,
  TIPO_COTIZACION_RETA,
  TARIFA_PLANA_2025,
  FISCAL_AUTONOMOS_META,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/cuota-autonomos-reta/';

// Etiqueta legible del rango de rendimiento neto mensual de un tramo
function rangoRendimiento(min: number, max: number | null): string {
  if (min === 0) return `Hasta ${formatCurrency(max as number)}`;
  if (max === null) return `Más de ${formatCurrency(min)}`;
  return `${formatCurrency(min)} – ${formatCurrency(max)}`;
}

export default function CuotaAutonomosRetaPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_AUTONOMOS_META.verificado));
    } catch {
      return FISCAL_AUTONOMOS_META.verificado;
    }
  })();

  const tipoPct = (TIPO_COTIZACION_RETA * 100).toLocaleString('es-ES', { minimumFractionDigits: 2 });

  const textoCita =
    `«Cuota de autónomos (RETA): tramos 2026», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_AUTONOMOS_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-cuota-autonomos-reta" />

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
            <h1 className={styles.heroTitle}>Cuota de autónomos (RETA): tramos</h1>
            <p className={styles.subtitle}>
              La tabla de <strong>cotización por ingresos reales</strong> 2026: según tu rendimiento neto
              mensual, el tramo, la base mínima y la cuota a la Seguridad Social. Más el tipo aplicable y
              la tarifa plana.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer — Nivel 1 CRÍTICO */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`RETA — ${FISCAL_AUTONOMOS_META.vigencia}`}
            fuente={FISCAL_AUTONOMOS_META.fuente}
            verificado={FISCAL_AUTONOMOS_META.verificado}
            urlOficial={FISCAL_AUTONOMOS_META.urlOficial}
            nota={FISCAL_AUTONOMOS_META.nota}
          />

          {/* Tramos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tramos de cotización por ingresos reales 2026</h2>
            <p className={styles.sectionIntro}>
              El rendimiento neto mensual determina el tramo. Dentro de cada tramo puedes elegir tu base
              entre un mínimo y un máximo; la cuota es la base × {tipoPct}%. La columna «cuota mínima» es
              lo que pagas eligiendo la base mínima del tramo.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Rendimiento neto mensual</th>
                    <th scope="col" className={styles.numCol}>Base mínima</th>
                    <th scope="col" className={styles.numCol}>Cuota mínima/mes</th>
                    <th scope="col" className={styles.numCol}>Cuota máxima/mes</th>
                  </tr>
                </thead>
                <tbody>
                  {TRAMOS_RETA_2025.map((t) => (
                    <tr key={t.id}>
                      <th scope="row" className={styles.rowHead}>
                        {rangoRendimiento(t.rendimientoMin, t.rendimientoMax)}
                      </th>
                      <td className={styles.numCol}>{formatCurrency(t.baseMinima)}</td>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{formatCurrency(t.cuotaMinima)}</span>
                      </td>
                      <td className={styles.numCol}>{formatCurrency(t.cuotaMaxima)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Los tres primeros tramos forman la <strong>tabla reducida</strong> (rendimientos por debajo
              del SMI). El rendimiento neto se calcula tras restar gastos deducibles, la propia cuota y la
              deducción adicional por gastos genéricos (7%; 3% para autónomos societarios).
            </p>
          </section>

          {/* Tipo de cotización */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tipo de cotización: {tipoPct}%</h2>
            <p className={styles.sectionIntro}>
              El tipo único del RETA se desglosa en: contingencias comunes <strong>28,30%</strong>,
              contingencias profesionales <strong>1,30%</strong>, cese de actividad <strong>0,90%</strong>,
              formación profesional <strong>0,10%</strong> y mecanismo de equidad intergeneracional (MEI){' '}
              <strong>0,90%</strong>.
            </p>
          </section>

          {/* Tarifa plana */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tarifa plana para nuevos autónomos</h2>
            <p className={styles.sectionIntro}>
              Los nuevos autónomos pueden cotizar una cuota fija de{' '}
              <strong>{formatCurrency(TARIFA_PLANA_2025.cuota)} al mes</strong> durante los primeros{' '}
              {TARIFA_PLANA_2025.duracion} meses, prorrogable otros {TARIFA_PLANA_2025.duracion} si los
              rendimientos se mantienen por debajo del SMI. Es independiente del tramo de ingresos.
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
                <h2 className={styles.ctaTitle}>¿Cuál es tu cuota según lo que facturas?</h2>
                <p className={styles.ctaDesc}>
                  Estima tu cuota mensual a partir de tus ingresos y gastos reales con la calculadora de
                  autónomos de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/estimador-cuota-autonomo/" className={styles.ctaBtn}>
                Estimar mi cuota →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="cuota-autonomos-reta" />

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
