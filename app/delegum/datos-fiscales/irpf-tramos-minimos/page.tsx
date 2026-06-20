'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  FISCAL_IRPF_META,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/irpf-tramos-minimos/';

// Convierte una escala acumulativa (por "hasta") en rangos desde-hasta con etiqueta
function aRangos(tramos: { hasta: number; tipo: number }[]) {
  return tramos.map((t, i) => {
    const desde = i === 0 ? 0 : tramos[i - 1].hasta;
    let etiqueta: string;
    if (desde === 0) {
      etiqueta = `Hasta ${formatCurrency(t.hasta)}`;
    } else if (!isFinite(t.hasta)) {
      etiqueta = `Más de ${formatCurrency(desde)}`;
    } else {
      etiqueta = `${formatCurrency(desde)} – ${formatCurrency(t.hasta)}`;
    }
    return { etiqueta, tipo: t.tipo };
  });
}

// Mínimos personales y familiares con etiqueta legible
const MINIMOS = [
  { concepto: 'Mínimo personal (general)', importe: MINIMOS_IRPF_2025.personal },
  { concepto: 'Mínimo personal a partir de 65 años', importe: MINIMOS_IRPF_2025.personal_65 },
  { concepto: 'Mínimo personal a partir de 75 años', importe: MINIMOS_IRPF_2025.personal_75 },
  { concepto: 'Primer hijo', importe: MINIMOS_IRPF_2025.hijo_1 },
  { concepto: 'Segundo hijo', importe: MINIMOS_IRPF_2025.hijo_2 },
  { concepto: 'Tercer hijo', importe: MINIMOS_IRPF_2025.hijo_3 },
  { concepto: 'Cuarto hijo y siguientes', importe: MINIMOS_IRPF_2025.hijo_4_mas },
  { concepto: 'Adicional por cada hijo menor de 3 años', importe: MINIMOS_IRPF_2025.hijo_menor_3 },
  { concepto: 'Ascendiente a cargo (mayor de 65 años)', importe: MINIMOS_IRPF_2025.ascendiente_65 },
  { concepto: 'Ascendiente a cargo (mayor de 75 años)', importe: MINIMOS_IRPF_2025.ascendiente_75 },
  { concepto: 'Discapacidad del 33% al 65%', importe: MINIMOS_IRPF_2025.discapacidad_33_65 },
  { concepto: 'Discapacidad del 65% o superior', importe: MINIMOS_IRPF_2025.discapacidad_65_mas },
];

export default function IrpfTramosMinimosPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_IRPF_META.verificado));
    } catch {
      return FISCAL_IRPF_META.verificado;
    }
  })();

  const rangosGeneral = aRangos(TRAMOS_IRPF_2025);
  const rangosAhorro = aRangos(TRAMOS_GANANCIAS_PATRIMONIALES_2025);

  const textoCita =
    `«Tramos y mínimos del IRPF 2025», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_IRPF_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-irpf-tramos-minimos" />

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
            <h1 className={styles.heroTitle}>Tramos y mínimos del IRPF</h1>
            <p className={styles.subtitle}>
              La <strong>escala general</strong> del IRPF por tramos, la <strong>escala del ahorro</strong> y
              los <strong>mínimos personales y familiares</strong> que no tributan, con la norma vigente.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`IRPF — ${FISCAL_IRPF_META.vigencia}`}
            fuente={FISCAL_IRPF_META.fuente}
            verificado={FISCAL_IRPF_META.verificado}
            urlOficial={FISCAL_IRPF_META.urlOficial}
            nota={FISCAL_IRPF_META.nota}
          />

          {/* Escala general */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Escala general del IRPF 2025</h2>
            <p className={styles.sectionIntro}>
              Se aplica a la base general: salario, rendimientos de actividades económicas, pensiones y
              alquileres. Es una escala <strong>progresiva</strong>: cada tramo de tu base tributa a su
              tipo, no toda la renta al tipo más alto.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Base liquidable general</th>
                    <th scope="col" className={styles.numCol}>Tipo aplicable</th>
                  </tr>
                </thead>
                <tbody>
                  {rangosGeneral.map((r) => (
                    <tr key={r.etiqueta}>
                      <th scope="row" className={styles.rowHead}>{r.etiqueta}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{r.tipo}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Tipos orientativos que suman la parte estatal y un <strong>tipo autonómico medio</strong>.
              Cada comunidad autónoma aprueba su propia escala, así que el tipo final varía según dónde
              residas.
            </p>
          </section>

          {/* Escala del ahorro */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Escala del ahorro 2025</h2>
            <p className={styles.sectionIntro}>
              Se aplica a la base del ahorro: intereses, dividendos y ganancias patrimoniales por venta
              de bienes (acciones, fondos, inmuebles, criptomonedas). Tiene tipos propios, más bajos que
              la escala general.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Base liquidable del ahorro</th>
                    <th scope="col" className={styles.numCol}>Tipo aplicable</th>
                  </tr>
                </thead>
                <tbody>
                  {rangosAhorro.map((r) => (
                    <tr key={r.etiqueta}>
                      <th scope="row" className={styles.rowHead}>{r.etiqueta}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{r.tipo}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mínimos personales y familiares */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Mínimos personales y familiares 2025</h2>
            <p className={styles.sectionIntro}>
              Es la parte de la renta que no tributa, por destinarse a las necesidades básicas del
              contribuyente y su familia. Reduce la base sobre la que se calcula el impuesto.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col" className={styles.numCol}>Importe anual</th>
                  </tr>
                </thead>
                <tbody>
                  {MINIMOS.map((m) => (
                    <tr key={m.concepto}>
                      <th scope="row" className={styles.rowHead}>{m.concepto}</th>
                      <td className={styles.numCol}>{formatCurrency(m.importe)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Los mínimos por descendientes se prorratean entre ambos progenitores y exigen convivencia y
              límite de rentas del descendiente. La cuantía exacta puede variar por la escala autonómica.
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
                <h2 className={styles.ctaTitle}>¿Quieres saber cuánto pagas de IRPF?</h2>
                <p className={styles.ctaDesc}>
                  Calcula tu sueldo neto aplicando los tramos, los mínimos y las cotizaciones con la
                  calculadora de meskeIA.
                </p>
              </div>
              <a
                href="https://meskeia.com/estimador-sueldo-neto/"
                className={styles.ctaBtn}
              >
                Calcular sueldo neto →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="irpf-tramos-minimos" />

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
