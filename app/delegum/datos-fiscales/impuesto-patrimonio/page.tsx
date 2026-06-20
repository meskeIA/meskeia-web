'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  BONIFICACIONES_CCAA_PATRIMONIO,
  ESCALA_PATRIMONIO_ESTATAL,
  MINIMO_EXENTO_ESTATAL,
  EXENCION_VIVIENDA_HABITUAL,
  UMBRAL_OBLIGACION_DECLARAR,
  ITSGF_UMBRAL,
  FISCAL_PATRIMONIO_META,
  type CCAAPatrimonio,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/impuesto-patrimonio/';

// Comunidades ordenadas alfabéticamente por nombre
const COMUNIDADES = [...BONIFICACIONES_CCAA_PATRIMONIO].sort((a, b) =>
  a.nombre.localeCompare(b.nombre, 'es'),
);

// Escala estatal con el límite inferior de cada tramo calculado
const TRAMOS_ESCALA = ESCALA_PATRIMONIO_ESTATAL.map((t, i) => ({
  desde: i === 0 ? 0 : ESCALA_PATRIMONIO_ESTATAL[i - 1].hasta,
  hasta: t.hasta,
  tipo: t.tipo,
}));

// Formatea un tipo en formato español: 0,2 %
function tipoPct(n: number): string {
  return `${n.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} %`;
}

// Rango de base liquidable de un tramo de la escala
function rangoBase(desde: number, hasta: number): string {
  if (hasta === Infinity) return `Más de ${formatCurrency(desde)}`;
  if (desde === 0) return `Hasta ${formatCurrency(hasta)}`;
  return `${formatCurrency(desde)} – ${formatCurrency(hasta)}`;
}

// Etiqueta legible de la bonificación autonómica
function etiquetaBonificacion(c: CCAAPatrimonio): string {
  if (c.foral) return 'Régimen foral';
  if (c.porcentajeBonificacion === 0) return 'Sin bonificación';
  if (c.porcentajeBonificacion === 100) {
    return c.itsgfInteraccion ? '≈ 100% (coordinada con ITSGF)' : '100%';
  }
  return `${c.porcentajeBonificacion}%`;
}

export default function ImpuestoPatrimonioPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_PATRIMONIO_META.verificado));
    } catch {
      return FISCAL_PATRIMONIO_META.verificado;
    }
  })();

  const textoCita =
    `«Impuesto sobre el Patrimonio por comunidad autónoma», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_PATRIMONIO_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-impuesto-patrimonio" />

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
            <h1 className={styles.heroTitle}>Impuesto sobre el Patrimonio por comunidad autónoma</h1>
            <p className={styles.subtitle}>
              El <strong>mínimo exento</strong>, la escala estatal por tramos, las bonificaciones de
              cada comunidad autónoma y el Impuesto de Solidaridad de las Grandes Fortunas (ITSGF).
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Impuesto sobre el Patrimonio — ${FISCAL_PATRIMONIO_META.vigencia}`}
            fuente={FISCAL_PATRIMONIO_META.fuente}
            verificado={FISCAL_PATRIMONIO_META.verificado}
            urlOficial={FISCAL_PATRIMONIO_META.urlOficial}
            nota={FISCAL_PATRIMONIO_META.nota}
          />

          <NovedadesFicha slug="impuesto-patrimonio" />

          {/* Datos estatales */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Mínimos, exenciones y umbrales estatales</h2>
            <p className={styles.sectionIntro}>
              El impuesto recae sobre el patrimonio neto (bienes y derechos menos deudas). Estos son
              los importes de referencia estatales; algunas comunidades reducen el mínimo exento.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col" className={styles.numCol}>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Mínimo exento general</th>
                    <td className={styles.numCol}>
                      <span className={styles.tipoTag}>{formatCurrency(MINIMO_EXENTO_ESTATAL)}</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Exención de la vivienda habitual</th>
                    <td className={styles.numCol}>{formatCurrency(EXENCION_VIVIENDA_HABITUAL)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Obligación de declarar (valor bruto de bienes)</th>
                    <td className={styles.numCol}>{formatCurrency(UMBRAL_OBLIGACION_DECLARAR)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Umbral del ITSGF (grandes fortunas)</th>
                    <td className={styles.numCol}>{formatCurrency(ITSGF_UMBRAL)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Hay obligación de declarar si la cuota sale a pagar o si el valor bruto de bienes y
              derechos supera {formatCurrency(UMBRAL_OBLIGACION_DECLARAR)}, aunque la cuota sea cero
              por bonificación autonómica.
            </p>
          </section>

          {/* Escala estatal */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Escala estatal por tramos</h2>
            <p className={styles.sectionIntro}>
              Se aplica sobre la base liquidable (patrimonio neto menos el mínimo exento) cuando la
              comunidad no tiene escala propia. Varias comunidades (Cataluña, Asturias, Baleares,
              Extremadura, Cantabria y Comunitat Valenciana) tienen tarifas propias algo más altas.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Base liquidable</th>
                    <th scope="col" className={styles.numCol}>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {TRAMOS_ESCALA.map((t) => (
                    <tr key={t.hasta}>
                      <th scope="row" className={styles.rowHead}>{rangoBase(t.desde, t.hasta)}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{tipoPct(t.tipo)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bonificaciones por CCAA */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Bonificaciones por comunidad autónoma</h2>
            <p className={styles.sectionIntro}>
              El impuesto está cedido a las comunidades, que aplican bonificaciones muy distintas
              sobre la cuota. Donde la bonificación es del 100% no se paga Patrimonio, pero los
              patrimonios superiores a {formatCurrency(ITSGF_UMBRAL)} pueden quedar sujetos al ITSGF
              estatal.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Comunidad autónoma</th>
                    <th scope="col">Bonificación</th>
                    <th scope="col" className={styles.numCol}>Mínimo exento</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {COMUNIDADES.map((c) => (
                    <tr key={c.id}>
                      <th scope="row" className={styles.rowHead}>{c.nombre}</th>
                      <td>{etiquetaBonificacion(c)}</td>
                      <td className={styles.numCol}>{formatCurrency(c.minimoExento)}</td>
                      <td className={styles.notaCell}>{c.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Navarra y País Vasco tienen régimen foral con normativa e importes propios. En las
              comunidades con bonificación «coordinada con ITSGF», la cuota real depende de la
              interacción con el impuesto de grandes fortunas; confirma siempre con tu comunidad.
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
                <h2 className={styles.ctaTitle}>¿Tienes que declarar el Patrimonio?</h2>
                <p className={styles.ctaDesc}>
                  Comprueba si superas el umbral de declaración y estima tu obligación según tu
                  comunidad con el orientador de Patrimonio de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/orientador-impuesto-patrimonio/" className={styles.ctaBtn}>
                Ir al orientador →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="impuesto-patrimonio" />

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
