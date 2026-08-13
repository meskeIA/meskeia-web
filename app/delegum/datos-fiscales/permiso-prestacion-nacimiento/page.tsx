'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  PERMISO_NACIMIENTO_2025,
  AMPLIACIONES_PERMISO,
  PRESTACION_NACIMIENTO_2025,
  DEDUCCION_MATERNIDAD_IRPF_2025,
  FISCAL_MATERNIDAD_META,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/permiso-prestacion-nacimiento/';

// Requisitos de cotización por edad (desde los datos)
const COTIZACION = PRESTACION_NACIMIENTO_2025.cotizacionMinima;
const REQUISITOS_COTIZACION = [
  { edad: 'Menores de 21 años', nota: COTIZACION.menores21.nota },
  { edad: 'Entre 21 y 25 años', nota: COTIZACION.entre21y25.nota },
  { edad: '26 años o más', nota: COTIZACION.mayores26.nota },
];

function etiquetaFamilia(tipo: 'biparental' | 'monoparental'): string {
  return tipo === 'biparental' ? 'Biparental (por progenitor)' : 'Monoparental (progenitor único)';
}

export default function PermisoPrestacionNacimientoPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_MATERNIDAD_META.verificado));
    } catch {
      return FISCAL_MATERNIDAD_META.verificado;
    }
  })();

  const textoCita =
    `«Permiso y prestación por nacimiento 2026», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_MATERNIDAD_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-permiso-prestacion-nacimiento" />

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
            <h1 className={styles.heroTitle}>Permiso y prestación por nacimiento</h1>
            <p className={styles.subtitle}>
              Las <strong>semanas de permiso por nacimiento y cuidado del menor</strong> (RDL 9/2025),
              la prestación de la Seguridad Social y la deducción por maternidad en el IRPF.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Permiso y prestación por nacimiento — ${FISCAL_MATERNIDAD_META.vigencia}`}
            fuente={FISCAL_MATERNIDAD_META.fuente}
            verificado={FISCAL_MATERNIDAD_META.verificado}
            urlOficial={FISCAL_MATERNIDAD_META.urlOficial}
            nota={FISCAL_MATERNIDAD_META.nota}
          />

          <NovedadesFicha slug="permiso-prestacion-nacimiento" />

          {/* Duración del permiso */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Duración del permiso (RDL 9/2025)</h2>
            <p className={styles.sectionIntro}>
              Desde el 31 de julio de 2025, el permiso por nacimiento y cuidado del menor se amplió.
              Las primeras 6 semanas son obligatorias e ininterrumpidas tras el parto; el resto se
              disfruta de forma flexible hasta los 12 meses, más unas semanas de cuidado prolongado
              repartibles hasta los 8 años.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Tipo de familia</th>
                    <th scope="col" className={styles.numCol}>Total</th>
                    <th scope="col" className={styles.numCol}>Obligatorias</th>
                    <th scope="col" className={styles.numCol}>Flexibles (≤12 meses)</th>
                    <th scope="col" className={styles.numCol}>Cuidado prolongado (≤8 años)</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISO_NACIMIENTO_2025.map((p) => (
                    <tr key={p.tipoFamilia}>
                      <th scope="row" className={styles.rowHead}>{etiquetaFamilia(p.tipoFamilia)}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{p.semanasTotal} sem.</span>
                      </td>
                      <td className={styles.numCol}>{p.semanasObligatorias} sem.</td>
                      <td className={styles.numCol}>{p.semanasFlexiblesHasta12Meses} sem.</td>
                      <td className={styles.numCol}>{p.semanasCuidadoProlongadoHasta8Anios} sem.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Ampliaciones */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Ampliaciones del permiso</h2>
            <p className={styles.sectionIntro}>
              En determinadas circunstancias el permiso se amplía con semanas adicionales:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Motivo</th>
                    <th scope="col" className={styles.numCol}>Semanas extra</th>
                    <th scope="col">Aplicación</th>
                  </tr>
                </thead>
                <tbody>
                  {AMPLIACIONES_PERMISO.map((a) => (
                    <tr key={a.motivo}>
                      <th scope="row" className={styles.rowHead}>{a.motivo}</th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>+{a.semanasExtra}</span>
                      </td>
                      <td className={styles.notaCell}>
                        {a.porProgenitor ? 'Por progenitor. ' : 'Solo un progenitor. '}{a.nota}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Prestación económica */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Prestación económica</h2>
            <p className={styles.sectionIntro}>
              Durante el permiso se cobra el <strong>{PRESTACION_NACIMIENTO_2025.porcentajeBaseReguladora}%
              de la base reguladora</strong> (base de cotización del mes anterior ÷ 30), una prestación{' '}
              <strong>exenta de IRPF</strong>. El periodo mínimo de cotización exigido depende de la edad:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Edad del progenitor</th>
                    <th scope="col">Cotización mínima exigida</th>
                  </tr>
                </thead>
                <tbody>
                  {REQUISITOS_COTIZACION.map((r) => (
                    <tr key={r.edad}>
                      <th scope="row" className={styles.rowHead}>{r.edad}</th>
                      <td className={styles.notaCell}>{r.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Sin el periodo mínimo de cotización se cobra una prestación no contributiva del 100% del
              IPREM —o la base reguladora, si fuese inferior— durante{' '}
              {PRESTACION_NACIMIENTO_2025.noContributiva.duracion} días naturales, ampliables en{' '}
              {PRESTACION_NACIMIENTO_2025.noContributiva.incrementoDias} en caso de familia numerosa,
              monoparentalidad, parto múltiple o discapacidad igual o superior al 65%. El incremento se
              aplica una sola vez aunque concurran varios supuestos (art. 182 LGSS).
            </p>
          </section>

          {/* Deducción por maternidad */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Deducción por maternidad en el IRPF</h2>
            <p className={styles.sectionIntro}>
              Las mujeres con hijos menores de 3 años con derecho al mínimo por descendientes pueden
              aplicar esta deducción en su declaración de la renta (también el padre viudo o tutor con
              guarda y custodia exclusiva):
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
                    <th scope="row" className={styles.rowHead}>Deducción anual por hijo menor de 3 años</th>
                    <td className={styles.numCol}>
                      <span className={styles.tipoTag}>{formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.importeAnualPorHijo)}</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Equivalente mensual (cobro anticipado, Modelo 140)</th>
                    <td className={styles.numCol}>{formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.importeMensualPorHijo)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Incremento máximo por gastos de guardería</th>
                    <td className={styles.numCol}>{formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.incrementoGuarderia.importeMaximoAnual)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Desde el 1 de enero de 2023 (art. 64 de la Ley 31/2022) basta con estar de alta en la
              Seguridad Social o mutualidad, <strong>o</strong> percibir prestación o subsidio de
              desempleo en el momento del nacimiento, <strong>o</strong> darse de alta después con 30
              días cotizados —en cuyo caso ese mes se suman{' '}
              {formatCurrency(DEDUCCION_MATERNIDAD_IRPF_2025.incrementoAltaPosterior.importe)}—. No se
              computan los meses en que se perciba por el mismo hijo/a el complemento de ayuda para la
              infancia del ingreso mínimo vital. El incremento por guardería requiere que el centro
              autorizado comunique los datos a la AEAT y no puede superar el gasto efectivo no
              subvencionado.
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
                <h2 className={styles.ctaTitle}>¿Cuánto cobrarás por el nacimiento?</h2>
                <p className={styles.ctaDesc}>
                  Estima la cuantía y la duración de tu prestación por nacimiento según tu base de
                  cotización y tu situación familiar con la calculadora de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/estimacion-prestacion-nacimiento/" className={styles.ctaBtn}>
                Estimar mi prestación →
              </a>
            </div>
          </section>

          <FichasRelacionadas slug="permiso-prestacion-nacimiento" />

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
