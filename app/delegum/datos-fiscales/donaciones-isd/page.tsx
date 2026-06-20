'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  BONIFICACIONES_CCAA_ID,
  TARIFA_ESTATAL_ID,
  FISCAL_DONACIONES_META,
  type BonificacionGrupoID,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/donaciones-isd/';

// Lista de comunidades ordenada alfabéticamente por nombre
const COMUNIDADES = Object.values(BONIFICACIONES_CCAA_ID).sort((a, b) =>
  a.nombre.localeCompare(b.nombre, 'es'),
);

// Formatea un porcentaje en formato español (admite decimales como 99,9%)
function pct(n: number): string {
  return `${(n * 100).toLocaleString('es-ES', { maximumFractionDigits: 2 })}%`;
}

// Resume el tratamiento de un grupo de parentesco en una etiqueta legible
function resumenBonificacion(b: BonificacionGrupoID | undefined): string {
  if (!b) return '—';
  if (b.escalonado && b.escalonado.length > 0) {
    return `Escalonada (hasta ${pct(b.escalonado[0].porcentaje)})`;
  }
  if (b.porcentaje == null) return '—';
  let s = pct(b.porcentaje);
  if (b.exencion) s += ` · exento si la base < ${formatCurrency(b.exencion)}`;
  else if (b.limite) s += ` · hasta ${formatCurrency(b.limite)}`;
  if (b.requiereEscritura) s += ' · requiere escritura';
  return s;
}

// Etiqueta del límite superior de un tramo de la tarifa estatal
function topeTramo(hasta: number): string {
  return hasta === Infinity ? 'En adelante' : `Hasta ${formatCurrency(hasta)}`;
}

export default function DonacionesIsdPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_DONACIONES_META.verificado));
    } catch {
      return FISCAL_DONACIONES_META.verificado;
    }
  })();

  const textoCita =
    `«Impuesto de Donaciones por comunidad autónoma», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_DONACIONES_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-donaciones-isd" />

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
            <h1 className={styles.heroTitle}>Impuesto de Donaciones por comunidad autónoma</h1>
            <p className={styles.subtitle}>
              Las <strong>bonificaciones autonómicas</strong> del Impuesto de Donaciones (ISD)
              comunidad por comunidad, junto con los grupos de parentesco, la tarifa estatal por
              tramos y las reducciones aplicables.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Impuesto de Donaciones — ${FISCAL_DONACIONES_META.vigencia}`}
            fuente={FISCAL_DONACIONES_META.fuente}
            verificado={FISCAL_DONACIONES_META.verificado}
            urlOficial={FISCAL_DONACIONES_META.urlOficial}
            nota={FISCAL_DONACIONES_META.nota}
          />

          <NovedadesFicha slug="donaciones-isd" />

          {/* Grupos de parentesco */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Grupos de parentesco</h2>
            <p className={styles.sectionIntro}>
              El ISD clasifica al donatario (quien recibe) en cuatro grupos según su parentesco con
              el donante. De ese grupo dependen las reducciones, el coeficiente multiplicador y la
              bonificación autonómica que se aplican.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Grupo</th>
                    <th scope="col">Parentesco con el donante</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Grupo I</th>
                    <td>Descendientes y adoptados menores de 21 años.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Grupo II</th>
                    <td>Descendientes y adoptados de 21 o más años, cónyuge y ascendientes.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Grupo III</th>
                    <td>Hermanos, tíos y sobrinos (colaterales de 2.º y 3.er grado) y parientes por afinidad.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Grupo IV</th>
                    <td>Primos, colaterales de 4.º grado o más lejanos y personas sin parentesco.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Bonificaciones por CCAA */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Bonificaciones por comunidad autónoma</h2>
            <p className={styles.sectionIntro}>
              El impuesto está cedido a las comunidades autónomas, que fijan sus propias
              bonificaciones sobre la cuota. En donaciones suelen ser <strong>menos generosas que en
              herencias</strong>. La columna «Grupos I y II» reúne a hijos, cónyuge y ascendientes;
              el «Grupo III» (hermanos, tíos, sobrinos) casi nunca está bonificado.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Comunidad autónoma</th>
                    <th scope="col">Grupos I y II</th>
                    <th scope="col">Grupo III</th>
                    <th scope="col">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {COMUNIDADES.map((c) => (
                    <tr key={c.nombre}>
                      <th scope="row" className={styles.rowHead}>
                        {c.nombre}
                        {c.regimen === 'foral' && (
                          <span className={styles.tipoTag} style={{ marginLeft: '0.4rem' }}>foral</span>
                        )}
                      </th>
                      <td>{resumenBonificacion(c.bonificaciones['I-descendiente'])}</td>
                      <td>{resumenBonificacion(c.bonificaciones['III'])}</td>
                      <td className={styles.notaCell}>{c.notas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Cataluña, País Vasco y Navarra (régimen foral) tienen tarifas y reducciones propias;
              Cataluña aplica una tarifa reducida (5%–9%) a Grupos I y II con escritura pública. En
              esos territorios la estimación es solo orientativa: confirma siempre el tratamiento en
              la hacienda autonómica.
            </p>
          </section>

          {/* Tarifa estatal */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tarifa estatal por tramos</h2>
            <p className={styles.sectionIntro}>
              Es la escala que se aplica sobre la base liquidable (tras las reducciones) cuando la
              comunidad no tiene tarifa propia. La cuota íntegra es la acumulada hasta el tramo
              anterior, y el tipo se aplica solo a la parte de base que cae dentro del tramo. La
              tarifa de donaciones tiene 16 tramos, más detallados que la de sucesiones.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Base liquidable</th>
                    <th scope="col" className={styles.numCol}>Cuota íntegra</th>
                    <th scope="col" className={styles.numCol}>Tipo aplicable al resto</th>
                  </tr>
                </thead>
                <tbody>
                  {TARIFA_ESTATAL_ID.map((t) => (
                    <tr key={t.hasta}>
                      <th scope="row" className={styles.rowHead}>{topeTramo(t.hasta)}</th>
                      <td className={styles.numCol}>{formatCurrency(t.cuota)}</td>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{pct(t.tipo / 100)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Sobre la cuota resultante se aplica además un coeficiente multiplicador según el grupo
              de parentesco y el patrimonio previo del donatario (desde 1,00 en Grupos I y II hasta
              2,40 en el Grupo IV), antes de la bonificación autonómica.
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
                <h2 className={styles.ctaTitle}>¿Cuánto pagarías por una donación según tu comunidad?</h2>
                <p className={styles.ctaDesc}>
                  Estima la cuota del Impuesto de Donaciones con tu comunidad, grupo de parentesco y
                  valor donado con la calculadora de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/estimador-impuesto-donaciones/" className={styles.ctaBtn}>
                Estimar mi donación →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="donaciones-isd" />

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
