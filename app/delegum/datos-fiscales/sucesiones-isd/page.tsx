'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  BONIFICACIONES_CCAA_IS,
  TARIFA_ESTATAL_IS,
  FISCAL_SUCESIONES_META,
  type BonificacionGrupoIS,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/sucesiones-isd/';

// Lista de comunidades ordenada alfabéticamente por nombre
const COMUNIDADES = Object.values(BONIFICACIONES_CCAA_IS).sort((a, b) =>
  a.nombre.localeCompare(b.nombre, 'es'),
);

// Formatea un porcentaje en formato español (admite decimales como 99,9%)
function pct(n: number): string {
  return `${(n * 100).toLocaleString('es-ES', { maximumFractionDigits: 2 })}%`;
}

// Resume el tratamiento de un grupo de parentesco en una etiqueta legible
function resumenBonificacion(b: BonificacionGrupoIS | undefined): string {
  if (!b) return '—';
  if (b.escalonado && b.escalonado.length > 0) {
    return `Escalonada (hasta ${pct(b.escalonado[0].porcentaje)})`;
  }
  if (b.porcentaje === 0 && b.reduccionBase) {
    return `Reducción de ${formatCurrency(b.reduccionBase)} en base`;
  }
  if (b.porcentaje == null) return '—';
  let s = pct(b.porcentaje);
  if (b.exencion) s += ` · exento si la base < ${formatCurrency(b.exencion)}`;
  else if (b.limite) s += ` · hasta ${formatCurrency(b.limite)}`;
  else if (b.tope && b.porcentajeMayor != null) {
    s += ` hasta ${formatCurrency(b.tope)}, luego ${pct(b.porcentajeMayor)}`;
  }
  return s;
}

// Etiqueta del límite superior de un tramo de la tarifa estatal
function topeTramo(hasta: number): string {
  return hasta === Infinity ? 'En adelante' : `Hasta ${formatCurrency(hasta)}`;
}

export default function SucesionesIsdPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_SUCESIONES_META.verificado));
    } catch {
      return FISCAL_SUCESIONES_META.verificado;
    }
  })();

  const textoCita =
    `«Impuesto de Sucesiones por comunidad autónoma», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_SUCESIONES_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-sucesiones-isd" />

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
            <h1 className={styles.heroTitle}>Impuesto de Sucesiones por comunidad autónoma</h1>
            <p className={styles.subtitle}>
              Las <strong>bonificaciones autonómicas</strong> del Impuesto de Sucesiones (ISD)
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
            normativa={`Impuesto de Sucesiones — ${FISCAL_SUCESIONES_META.vigencia}`}
            fuente={FISCAL_SUCESIONES_META.fuente}
            verificado={FISCAL_SUCESIONES_META.verificado}
            urlOficial={FISCAL_SUCESIONES_META.urlOficial}
            nota={FISCAL_SUCESIONES_META.nota}
          />

          {/* Grupos de parentesco */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Grupos de parentesco</h2>
            <p className={styles.sectionIntro}>
              El ISD clasifica a los herederos en cuatro grupos según su parentesco con la persona
              fallecida. De ese grupo dependen las reducciones, el coeficiente multiplicador y la
              bonificación autonómica que se aplican.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Grupo</th>
                    <th scope="col">Parentesco</th>
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
              bonificaciones sobre la cuota. La columna «Grupos I y II» reúne a hijos, cónyuge y
              ascendientes; el «Grupo III» (hermanos, tíos, sobrinos) casi nunca está bonificado.
              La cuota se calcula según la comunidad donde residía la persona fallecida.
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
              Cataluña, País Vasco y Navarra (régimen foral) tienen tarifas y reducciones propias
              distintas del régimen común; en esos territorios la estimación es solo orientativa.
              Confirma siempre el tratamiento exacto en la hacienda autonómica correspondiente.
            </p>
          </section>

          {/* Tarifa estatal */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Tarifa estatal por tramos</h2>
            <p className={styles.sectionIntro}>
              Es la escala que se aplica sobre la base liquidable (tras las reducciones) cuando la
              comunidad no tiene tarifa propia. La cuota íntegra es la acumulada hasta el tramo
              anterior, y el tipo se aplica solo a la parte de base que cae dentro del tramo.
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
                  {TARIFA_ESTATAL_IS.map((t) => (
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
              de parentesco y el patrimonio previo del heredero (desde 1,00 en Grupos I y II hasta
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
                <h2 className={styles.ctaTitle}>¿Cuánto pagaría tu herencia según tu comunidad?</h2>
                <p className={styles.ctaDesc}>
                  Estima la cuota del Impuesto de Sucesiones con tu comunidad, grupo de parentesco y
                  valor de la herencia con la calculadora de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/estimador-impuesto-sucesiones/" className={styles.ctaBtn}>
                Estimar mi sucesión →
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
