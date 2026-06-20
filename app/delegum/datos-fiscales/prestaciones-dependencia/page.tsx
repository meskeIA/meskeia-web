'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  GRADOS_DEPENDENCIA,
  PRESTACIONES_DEPENDENCIA_2025,
  COTIZACION_CUIDADOR_NO_PROFESIONAL_2025,
  DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
  FISCAL_DEPENDENCIA_META,
} from '@/data/fiscal';
import { formatCurrency, formatDate } from '@/lib';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/prestaciones-dependencia/';

const CUIDADOR = COTIZACION_CUIDADOR_NO_PROFESIONAL_2025;
const DISCAP = DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente;

export default function PrestacionesDependenciaPage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_DEPENDENCIA_META.verificado));
    } catch {
      return FISCAL_DEPENDENCIA_META.verificado;
    }
  })();

  const tipoCotizacionTxt = CUIDADOR.tipoCotizacion.toLocaleString('es-ES', { minimumFractionDigits: 2 });

  const textoCita =
    `«Prestaciones por dependencia (SAAD): grados y cuantías», Delegum (meskeIA). ` +
    `Fuente: ${FISCAL_DEPENDENCIA_META.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-prestaciones-dependencia" />

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
            <h1 className={styles.heroTitle}>Prestaciones por dependencia (SAAD)</h1>
            <p className={styles.subtitle}>
              Los <strong>grados de dependencia</strong>, las cuantías de las prestaciones económicas
              del SAAD por grado, la cotización del cuidador no profesional y las deducciones por
              discapacidad en el IRPF.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`Dependencia y cuidadores — ${FISCAL_DEPENDENCIA_META.vigencia}`}
            fuente={FISCAL_DEPENDENCIA_META.fuente}
            verificado={FISCAL_DEPENDENCIA_META.verificado}
            urlOficial={FISCAL_DEPENDENCIA_META.urlOficial}
            nota={FISCAL_DEPENDENCIA_META.nota}
          />

          {/* Grados */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Grados de dependencia</h2>
            <p className={styles.sectionIntro}>
              El grado se determina con el baremo de valoración de la dependencia (BVD). De él
              dependen los servicios y las prestaciones a las que se tiene acceso.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Grado</th>
                    <th scope="col">Descripción</th>
                    <th scope="col" className={styles.numCol}>Puntuación BVD</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADOS_DEPENDENCIA.map((g) => (
                    <tr key={g.grado}>
                      <th scope="row" className={styles.rowHead}>{g.nombre}</th>
                      <td className={styles.notaCell}>{g.descripcion}</td>
                      <td className={styles.numCol}>{g.puntuacionBVDDesde}–{g.puntuacionBVDHasta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Prestaciones económicas */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Prestaciones económicas SAAD (cuantías máximas)</h2>
            <p className={styles.sectionIntro}>
              Cuantías máximas estatales por mes. El copago, según la capacidad económica del
              beneficiario, puede reducirlas, y algunas comunidades autónomas las complementan.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Prestación</th>
                    <th scope="col" className={styles.numCol}>Tipo</th>
                    <th scope="col" className={styles.numCol}>Cuantía máxima/mes</th>
                  </tr>
                </thead>
                <tbody>
                  {PRESTACIONES_DEPENDENCIA_2025.map((p) => (
                    <tr key={`${p.grado}-${p.tipo}`}>
                      <th scope="row" className={styles.rowHead}>{p.nombre}</th>
                      <td className={styles.numCol}>{p.tipo}</td>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{formatCurrency(p.cuantiaMaximaMensual)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              PEVS = prestación vinculada a servicio (pago de servicio privado acreditado). PECEF =
              cuidados en el entorno familiar (retribuye al cuidador no profesional). PAP = asistencia
              personal (solo Grado III).
            </p>
          </section>

          {/* Cotización del cuidador */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cotización del cuidador no profesional</h2>
            <p className={styles.sectionIntro}>
              El cuidador familiar puede darse de alta en la Seguridad Social mediante convenio
              especial. Desde 2023 el Estado abona el 100% de la cuota.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col" className={styles.numCol}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Base de cotización mensual</th>
                    <td className={styles.numCol}>{formatCurrency(CUIDADOR.baseCotizacionMensual)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Tipo de cotización</th>
                    <td className={styles.numCol}>{tipoCotizacionTxt}%</td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Cuota mensual aproximada</th>
                    <td className={styles.numCol}>
                      <span className={styles.tipoTag}>{formatCurrency(CUIDADOR.cuotaMensualAproximada)}</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>A cargo del Estado</th>
                    <td className={styles.numCol}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              El cuidador queda protegido frente a jubilación, incapacidad temporal y muerte y
              supervivencia, sin coste para la familia.
            </p>
          </section>

          {/* Deducciones IRPF */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Deducciones de IRPF por discapacidad</h2>
            <p className={styles.sectionIntro}>
              El mínimo por discapacidad reduce la base imponible del IRPF (no la cuota directamente),
              y se acumula con el mínimo por gastos de asistencia cuando se acredita ayuda de terceros
              o movilidad reducida.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Concepto</th>
                    <th scope="col" className={styles.numCol}>Mínimo anual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Discapacidad del 33% al 64%</th>
                    <td className={styles.numCol}>
                      <span className={styles.tipoTag}>{formatCurrency(DISCAP.discapacidad33a65)}</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Discapacidad del 65% o más</th>
                    <td className={styles.numCol}>
                      <span className={styles.tipoTag}>{formatCurrency(DISCAP.discapacidad65oMas)}</span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Gastos de asistencia (acumulable)</th>
                    <td className={styles.numCol}>{formatCurrency(DISCAP.gastosAsistencia33a65)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Existen mínimos equivalentes por ascendientes o descendientes con discapacidad a cargo,
              sujetos a requisitos de renta y convivencia.
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
                <h2 className={styles.ctaTitle}>¿Qué prestación te corresponde según tu grado?</h2>
                <p className={styles.ctaDesc}>
                  Estima las cuantías de las prestaciones SAAD, los servicios disponibles y el copago
                  según tu grado de dependencia con la herramienta de meskeIA.
                </p>
              </div>
              <a href="https://meskeia.com/estimacion-prestaciones-dependencia/" className={styles.ctaBtn}>
                Estimar prestaciones →
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
