'use client';

import { useState } from 'react';
import Image from 'next/image';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DisclaimerCard from '@/components/DisclaimerCard';
import DataReference from '@/components/DataReference';
import {
  SECCIONES_IAE,
  IAE_EXENCION,
  CNAE_VIGENCIA,
  FISCAL_CNAE_IAE_META,
} from '@/data/fiscal';
import { formatNumber, formatDate } from '@/lib';
import NovedadesFicha from '../NovedadesFicha';
import FichasRelacionadas from '../FichasRelacionadas';
import styles from '../Ficha.module.css';

const URL_CANONICA = 'https://delegum.com/datos-fiscales/cnae-iae/';
const URL_BUSCADOR = 'https://meskeia.com/conversor-cnae-iae/';

export default function CnaeIaePage() {
  const [citaCopiada, setCitaCopiada] = useState(false);

  const fechaVerificacion = (() => {
    try {
      return formatDate(new Date(FISCAL_CNAE_IAE_META.verificado));
    } catch {
      return FISCAL_CNAE_IAE_META.verificado;
    }
  })();

  const fechaCnae = (() => {
    try {
      return formatDate(new Date(CNAE_VIGENCIA.desde));
    } catch {
      return CNAE_VIGENCIA.desde;
    }
  })();

  const textoCita =
    `«Códigos de actividad: CNAE-2025 y epígrafes del IAE», Delegum (meskeIA). ` +
    `Fuentes: ${FISCAL_CNAE_IAE_META.cnae.fuente}; ${FISCAL_CNAE_IAE_META.iae.fuente}. ` +
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
      <AnalyticsTracker appName="delegum-datos-cnae-iae" />

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
            <h1 className={styles.heroTitle}>Códigos de actividad: CNAE-2025 e IAE</h1>
            <p className={styles.subtitle}>
              Qué clasificación pide cada organismo, las tres <strong>secciones del IAE</strong> y su
              efecto sobre la retención de IRPF en factura, la exención del impuesto por cifra de
              negocio y la entrada en vigor de la <strong>CNAE-2025</strong>.
            </p>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              Verificado el {fechaVerificacion} · Fuente oficial
            </div>
          </div>

          {/* Disclaimer fiscal — Nivel 1 CRÍTICO (no colapsable) */}
          <DisclaimerCard variant="financial" severity="critical" />
          <DataReference
            normativa={`CNAE-2025 e IAE — ${FISCAL_CNAE_IAE_META.vigencia}`}
            fuente={`${FISCAL_CNAE_IAE_META.cnae.fuente} · ${FISCAL_CNAE_IAE_META.iae.fuente}`}
            verificado={FISCAL_CNAE_IAE_META.verificado}
            urlOficial={FISCAL_CNAE_IAE_META.iae.urlOficial}
            nota="El catálogo completo de códigos no se reproduce en esta página: se consulta en el buscador enlazado más abajo."
          />

          <NovedadesFicha slug="cnae-iae" />

          {/* Quién pide qué */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Qué clasificación usa cada organismo</h2>
            <p className={styles.sectionIntro}>
              CNAE e IAE no son lo mismo ni son intercambiables. Quien se da de alta como autónomo o
              constituye una sociedad acaba declarando las dos, ante organismos distintos y con
              finalidades distintas:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Clasificación</th>
                    <th scope="col">Organismo</th>
                    <th scope="col">Finalidad</th>
                    <th scope="col">Dónde se declara</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>{CNAE_VIGENCIA.vigente}</th>
                    <td>{FISCAL_CNAE_IAE_META.cnae.organismo}</td>
                    <td>Finalidad {FISCAL_CNAE_IAE_META.cnae.finalidad}</td>
                    <td className={styles.notaCell}>
                      Se comunica a la Seguridad Social en el alta (y consta en registros mercantiles
                      y estadísticos). No determina ningún impuesto.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Epígrafe del IAE</th>
                    <td>{FISCAL_CNAE_IAE_META.iae.organismo}</td>
                    <td>Finalidad {FISCAL_CNAE_IAE_META.iae.finalidad}</td>
                    <td className={styles.notaCell}>
                      Se declara en el alta censal, modelo 036 o 037. De él dependen las obligaciones
                      fiscales de la actividad, empezando por la retención de IRPF.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              Confundirlos es el error más común al darse de alta: el código CNAE no sirve para
              rellenar el modelo 036, ni el epígrafe del IAE para el alta en la Seguridad Social.
            </p>
          </section>

          {/* Buscador de códigos */}
          <section className={styles.section}>
            <div className={styles.ctaBox}>
              <div className={styles.ctaText}>
                <h2 className={styles.ctaTitle}>Buscar un código concreto</h2>
                <p className={styles.ctaDesc}>
                  Esta ficha recoge los datos citables, no el catálogo: son varios miles de
                  epígrafes del IAE y de códigos CNAE-2025, que no se consultan de un vistazo. Para
                  localizar el tuyo por palabra clave o por código, usa el buscador de los catálogos
                  oficiales completos.
                </p>
              </div>
              <a href={URL_BUSCADOR} className={styles.ctaBtn}>
                Abrir el buscador de códigos →
              </a>
            </div>
          </section>

          {/* Secciones del IAE y retención */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Las tres secciones del IAE y la retención de IRPF</h2>
            <p className={styles.sectionIntro}>
              Las Tarifas del IAE se dividen en tres secciones. La sección en la que cae el epígrafe
              elegido decide si las facturas emitidas a empresas y a otros profesionales llevan
              retención de IRPF:
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Sección</th>
                    <th scope="col" className={styles.numCol}>¿Retención?</th>
                    <th scope="col">Quiénes se dan de alta</th>
                    <th scope="col">Efecto en la factura</th>
                  </tr>
                </thead>
                <tbody>
                  {SECCIONES_IAE.map((s) => (
                    <tr key={s.seccion}>
                      <th scope="row" className={styles.rowHead}>
                        Sección {s.seccion} — {s.nombre}
                      </th>
                      <td className={styles.numCol}>
                        <span className={styles.tipoTag}>{s.retencionIrpf ? 'Sí' : 'No'}</span>
                      </td>
                      <td className={styles.notaCell}>{s.quienes}</td>
                      <td className={styles.notaCell}>{s.retencion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              El tipo reducido del 7% durante el año de alta y los dos siguientes es opcional: el
              profesional puede renunciar a él y retener directamente el 15%. La retención no es un
              coste añadido, sino un pago a cuenta del IRPF del propio profesional.
            </p>
          </section>

          {/* Exención del IAE */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Exención del IAE por cifra de negocio</h2>
            <p className={styles.sectionIntro}>{IAE_EXENCION.descripcion}</p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Supuesto</th>
                    <th scope="col">Alcance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Cifra neta de negocio</th>
                    <td className={styles.notaCell}>
                      Exentos por debajo de{' '}
                      <span className={styles.tipoTag}>
                        {formatNumber(IAE_EXENCION.umbralCifraNegocio, 0)} €
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Personas físicas</th>
                    <td className={styles.notaCell}>
                      Exentas siempre, cualquiera que sea su cifra de negocio.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>Inicio de actividad</th>
                    <td className={styles.notaCell}>
                      Exentos los dos primeros períodos impositivos de la actividad.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              <strong>El matiz que más se pasa por alto:</strong> {IAE_EXENCION.nota} La exención
              alcanza a la cuota, no a la obligación censal. Base normativa:{' '}
              <a
                href={IAE_EXENCION.urlOficial}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {IAE_EXENCION.normativa}
              </a>.
            </p>
          </section>

          {/* Vigencia de la CNAE */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Vigencia: de la CNAE-2009 a la CNAE-2025</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Clasificación</th>
                    <th scope="col">Norma</th>
                    <th scope="col">Situación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className={styles.rowHead}>{CNAE_VIGENCIA.vigente}</th>
                    <td>{CNAE_VIGENCIA.normaVigente}</td>
                    <td className={styles.notaCell}>
                      Vigente. Operativa desde el {fechaCnae}.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={styles.rowHead}>{CNAE_VIGENCIA.anterior}</th>
                    <td>{CNAE_VIGENCIA.normaAnterior}</td>
                    <td className={styles.notaCell}>
                      Sustituida tras dieciséis años de vigencia.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tableFoot}>
              {CNAE_VIGENCIA.nota} Un código CNAE-2009 anotado en un trámite anterior no queda sin
              valor: se traduce a su equivalente en la CNAE-2025 mediante esa tabla, publicada por el{' '}
              <a
                href={FISCAL_CNAE_IAE_META.cnae.urlOficial}
                className={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {FISCAL_CNAE_IAE_META.cnae.organismo}
              </a>.
            </p>
          </section>

          {/* Sin equivalencia oficial */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>No existe una equivalencia oficial CNAE ⇄ IAE</h2>
            <p className={styles.sectionIntro}>
              Conviene decirlo con claridad porque condiciona cualquier herramienta que trabaje con
              estos códigos: <strong>no hay tabla oficial que traduzca un código CNAE a un epígrafe
              del IAE</strong>, ni al revés. Son clasificaciones de dos organismos distintos —INE y
              AEAT— construidas con finalidades distintas, estadística una y tributaria la otra, y sus
              criterios de agrupación no coinciden.
            </p>
            <p className={styles.sectionIntro}>
              Toda conversión automática entre ambas aplica, por tanto, un criterio de aproximación:
              es una sugerencia razonable, no un dato oficial, y la elección definitiva del epígrafe
              corresponde a quien firma el modelo 036 —conviene contrastarla con la AEAT o con un
              asesor, porque equivocarse tiene consecuencias fiscales.
            </p>
            <p className={styles.tableFoot}>
              Sí es oficial, en cambio, la correspondencia <strong>entre versiones de la CNAE</strong>{' '}
              (CNAE-2009 → CNAE-2025), publicada por el INE. Esa conversión es un dato; la otra, un
              criterio.
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

          <FichasRelacionadas slug="cnae-iae" />

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
