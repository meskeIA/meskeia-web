'use client';

import { useState, useMemo } from 'react';
import styles from './EstimacionPrestacionesDependencia.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  LegalNotice, RegionBadge
} from '@/components';
import DataReference from '@/components/DataReference';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency } from '@/lib';
import {
  FISCAL_DEPENDENCIA_META,
  GRADOS_DEPENDENCIA,
  PRESTACIONES_DEPENDENCIA_2025,
  SERVICIOS_SAAD,
  COPAGO_DEPENDENCIA_2025,
} from '@/data/fiscal';

// ===== TIPOS =====
interface GradoSeleccionado {
  grado: number;
  nombre: string;
  descripcion: string;
  puntuacionBVDDesde: number;
  puntuacionBVDHasta: number;
}

// ===== ICONOS POR GRADO =====
const ICONOS_GRADO: Record<number, string> = {
  1: '🟡',
  2: '🟠',
  3: '🔴',
};

const ICONOS_SERVICIO: Record<string, string> = {
  teleasistencia: '📞',
  sad: '🏠',
  centroDia: '☀️',
  centroNoche: '🌙',
  residencia: '🏥',
  prevencion: '💪',
};

export default function EstimacionPrestacionesDependencia() {
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | null>(null);

  // Prestaciones económicas filtradas por grado
  const prestacionesGrado = useMemo(() => {
    if (gradoSeleccionado === null) return [];
    return PRESTACIONES_DEPENDENCIA_2025.filter((p) => p.grado === gradoSeleccionado);
  }, [gradoSeleccionado]);

  // Servicios disponibles y no disponibles para el grado
  const serviciosDisponibles = useMemo(() => {
    if (gradoSeleccionado === null) return [];
    return SERVICIOS_SAAD.filter((s) => s.gradosAcceso.includes(gradoSeleccionado));
  }, [gradoSeleccionado]);

  const serviciosNoDisponibles = useMemo(() => {
    if (gradoSeleccionado === null) return [];
    return SERVICIOS_SAAD.filter((s) => !s.gradosAcceso.includes(gradoSeleccionado));
  }, [gradoSeleccionado]);

  // Grado seleccionado como objeto
  const gradoInfo: GradoSeleccionado | undefined = useMemo(() => {
    if (gradoSeleccionado === null) return undefined;
    return GRADOS_DEPENDENCIA.find((g) => g.grado === gradoSeleccionado);
  }, [gradoSeleccionado]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">💶</span>
        <h1 className={styles.title}>Estimación de Prestaciones por Dependencia</h1>
        <p className={styles.subtitle}>
          Consulta las prestaciones económicas y servicios del SAAD según el grado de dependencia
          reconocido. Cuantías máximas estatales 2025 orientativas.
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      {/* Disclaimer crítico */}
      <DisclaimerCard variant="financial" severity="critical" collapsible={false}>
        <p>
          Esta herramienta es <strong>exclusivamente orientativa</strong>. Las cuantías mostradas son
          los <strong>máximos estatales</strong> fijados por la Ley 39/2006 y su normativa de
          desarrollo. La prestación real depende de:
        </p>
        <ul>
          <li>El <strong>copago</strong> según la capacidad económica del beneficiario (renta + patrimonio)</li>
          <li>La <strong>comunidad autónoma</strong>, que puede complementar o modificar importes</li>
          <li>La <strong>valoración individual</strong> del Programa Individual de Atención (PIA)</li>
        </ul>
        <p>
          meskeIA <strong>no sustituye</strong> la valoración oficial del SAAD ni el asesoramiento
          de los Servicios Sociales de tu municipio.
        </p>
      </DisclaimerCard>

      {/* Referencia de datos */}
      <DataReference
        normativa="Dependencia SAAD 2025"
        fuente={FISCAL_DEPENDENCIA_META.fuente}
        verificado={FISCAL_DEPENDENCIA_META.verificado}
        urlOficial={FISCAL_DEPENDENCIA_META.urlOficial}
      />

      {/* Selector de grado */}
      <section className={styles.gradoSelector}>
        <h2 className={styles.sectionTitle}>Selecciona el grado de dependencia reconocido</h2>
        <div className={styles.gradoGrid}>
          {GRADOS_DEPENDENCIA.map((grado) => (
            <button
              key={grado.grado}
              type="button"
              className={`${styles.gradoCard} ${gradoSeleccionado === grado.grado ? styles.gradoCardActivo : ''}`}
              onClick={() => setGradoSeleccionado(grado.grado)}
              aria-pressed={gradoSeleccionado === grado.grado}
              aria-label={`Seleccionar ${grado.nombre}`}
            >
              <span className={styles.gradoCardIcon} aria-hidden="true">
                {ICONOS_GRADO[grado.grado]}
              </span>
              <span className={styles.gradoCardTitle}>{grado.nombre}</span>
              <span className={styles.gradoCardDesc}>{grado.descripcion}</span>
              <span className={styles.gradoCardRango}>
                BVD: {grado.puntuacionBVDDesde}–{grado.puntuacionBVDHasta} puntos
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Resultados */}
      {gradoSeleccionado !== null && gradoInfo ? (
        <section className={styles.resultados} aria-live="polite">
          <h2 className={styles.resultadosTitle}>
            Prestaciones para {gradoInfo.nombre}
          </h2>

          {/* Prestaciones económicas */}
          <h3 className={styles.resultadosSubtitle}>
            <span aria-hidden="true">💰</span> Prestaciones económicas (máximos mensuales)
          </h3>
          <div className={styles.prestacionesList}>
            {prestacionesGrado.map((p) => (
              <div key={`${p.grado}-${p.tipo}`} className={styles.prestacionItem}>
                <div className={styles.prestacionInfo}>
                  <span className={styles.prestacionTipo}>{p.tipo}</span>
                  <p className={styles.prestacionNombre}>{p.nombre}</p>
                  <p className={styles.prestacionDesc}>{p.descripcion}</p>
                </div>
                <div className={styles.prestacionCuantia}>
                  {formatCurrency(p.cuantiaMaximaMensual)}
                  <span className={styles.prestacionMes}>/mes máximo</span>
                </div>
              </div>
            ))}
          </div>

          {/* Servicios SAAD */}
          <h3 className={styles.resultadosSubtitle}>
            <span aria-hidden="true">🏛️</span> Servicios del catálogo SAAD
          </h3>
          <div className={styles.serviciosList}>
            {serviciosDisponibles.map((s) => (
              <div key={s.id} className={styles.servicioItem}>
                <span className={styles.servicioNombre}>
                  <span aria-hidden="true">{ICONOS_SERVICIO[s.id] ?? '📋'}</span>{' '}
                  {s.nombre}
                </span>
                <span className={styles.servicioDesc}>{s.descripcion}</span>
              </div>
            ))}
            {serviciosNoDisponibles.map((s) => (
              <div key={s.id} className={`${styles.servicioItem} ${styles.servicioNoDisponible}`}>
                <span className={styles.servicioNombre}>
                  <span aria-hidden="true">{ICONOS_SERVICIO[s.id] ?? '📋'}</span>{' '}
                  {s.nombre}
                </span>
                <span className={styles.servicioNoDisponibleTag}>
                  No disponible para Grado {gradoSeleccionado}
                </span>
              </div>
            ))}
          </div>

          {/* Nota de copago */}
          <div className={styles.copagoNota} role="note">
            <strong><span aria-hidden="true">ℹ️</span> Sobre el copago:</strong>{' '}
            {COPAGO_DEPENDENCIA_2025.nota} El IPREM de referencia 2025 es de{' '}
            {formatCurrency(COPAGO_DEPENDENCIA_2025.iprem2025Mensual)}/mes. Por debajo del 100%
            del IPREM no se aplica copago. Estas cuantías son máximas estatales, sujetas a copago
            según capacidad económica.
          </div>
        </section>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden="true">👆</span>
          <p className={styles.placeholderText}>
            Selecciona un grado de dependencia para ver las prestaciones económicas y servicios disponibles.
          </p>
        </div>
      )}

      {/* Sección educativa v2.0 */}
      <EducationalSection title="Todo sobre las prestaciones por dependencia en España" subtitle="Guía sobre grados, prestaciones y procedimientos">
        {/* Tabla comparativa */}
        <section className={styles.eduSection}>
          <h2>Comparativa de prestaciones económicas por grado</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Prestación</th>
                  <th>Grado I</th>
                  <th>Grado II</th>
                  <th>Grado III</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>PEVS</strong> — Vinculada a servicio</td>
                  <td>{formatCurrency(300)}/mes</td>
                  <td>{formatCurrency(426.12)}/mes</td>
                  <td>{formatCurrency(833.96)}/mes</td>
                </tr>
                <tr>
                  <td><strong>PECEF</strong> — Cuidados entorno familiar</td>
                  <td>{formatCurrency(153)}/mes</td>
                  <td>{formatCurrency(286.66)}/mes</td>
                  <td>{formatCurrency(449.77)}/mes</td>
                </tr>
                <tr>
                  <td><strong>PAP</strong> — Asistencia personal</td>
                  <td>No disponible</td>
                  <td>No disponible</td>
                  <td>{formatCurrency(833.96)}/mes</td>
                </tr>
                <tr>
                  <td><strong>Teleasistencia</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td><strong>Ayuda a domicilio (SAD)</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td><strong>Centro de Día</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td><strong>Centro de Noche</strong></td>
                  <td>No</td>
                  <td>Sí</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <td><strong>Atención Residencial</strong></td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.eduSection}>
          <h2>Escenarios habituales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji} aria-hidden="true">👵</span>
                <span className={styles.escenarioTag}>Cuidadora familiar</span>
              </div>
              <p>
                María, 72 años, con Grado II. Su hija la cuida en casa. Solicita la PECEF
                (hasta {formatCurrency(286.66)}/mes). Además, la hija queda dada de alta
                en la Seguridad Social como cuidadora no profesional con cuota 100% bonificada
                por el Estado.
              </p>
              <div className={styles.escenarioResultado}>
                PECEF + alta SS cuidadora con coste cero
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji} aria-hidden="true">🏥</span>
                <span className={styles.escenarioTag}>Residencia concertada</span>
              </div>
              <p>
                Antonio, 85 años, con Grado III y gran dependencia. No puede ser atendido en casa.
                Solicita plaza en residencia pública concertada. Si no hay plaza disponible, puede
                solicitar la PEVS (hasta {formatCurrency(833.96)}/mes) para contratar una residencia
                privada acreditada.
              </p>
              <div className={styles.escenarioResultado}>
                Servicio residencial o PEVS como alternativa
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji} aria-hidden="true">☀️</span>
                <span className={styles.escenarioTag}>Centro de día + SAD</span>
              </div>
              <p>
                Carmen, 68 años, Grado I. Vive sola pero necesita supervisión. Combina centro
                de día (lunes a viernes) con ayuda a domicilio (SAD) los fines de semana. La
                teleasistencia 24h complementa la atención con un dispositivo de alarma.
              </p>
              <div className={styles.escenarioResultado}>
                Combinación de servicios para autonomía máxima
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioEmoji} aria-hidden="true">🧑‍🦼</span>
                <span className={styles.escenarioTag}>Asistencia personal</span>
              </div>
              <p>
                Luis, 45 años, con Grado III por lesión medular. Quiere mantener una vida activa
                y trabajar. Solicita la PAP (hasta {formatCurrency(833.96)}/mes) para contratar un
                asistente personal que le ayude en las actividades diarias y el desplazamiento al trabajo.
              </p>
              <div className={styles.escenarioResultado}>
                PAP: orientada a mantener la vida activa y la autonomía
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre prestaciones por dependencia</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre la PEVS y la PECEF?</h4>
              <p>
                La PEVS (Prestación Económica Vinculada a Servicio) se concede cuando no hay plaza
                pública disponible, y se destina a pagar un servicio privado acreditado (residencia,
                centro de día). La PECEF (Prestación Económica para Cuidados en el Entorno Familiar)
                compensa al cuidador familiar no profesional que atiende al dependiente en su domicilio.
                Las cuantías máximas de la PEVS son superiores a las de la PECEF.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Quién puede solicitar la PAP (Asistencia Personal)?</h4>
              <p>
                La PAP solo está disponible para personas con Grado III (Gran Dependencia). Su finalidad
                es contratar un asistente personal que facilite la vida autónoma del beneficiario:
                trabajo, estudios, ocio. A diferencia de las demás prestaciones, la PAP está especialmente
                orientada a personas más jóvenes que quieren mantener una vida activa.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo se calcula el copago en dependencia?</h4>
              <p>
                El copago depende de la capacidad económica del beneficiario (renta + patrimonio).
                Por debajo del IPREM ({formatCurrency(COPAGO_DEPENDENCIA_2025.iprem2025Mensual)}/mes
                en 2025) no se aplica copago. Por encima, el porcentaje aumenta progresivamente, con un
                máximo del 90% del coste del servicio. Los tramos exactos varían por comunidad autónoma.
                Consulta con los Servicios Sociales de tu municipio.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuánto tarda la resolución del grado de dependencia?</h4>
              <p>
                La ley establece un plazo máximo de 6 meses desde la solicitud hasta la resolución
                del grado y la aprobación del PIA (Programa Individual de Atención). En la práctica,
                los plazos varían mucho por comunidad autónoma y pueden extenderse entre 6 y 18 meses.
                Es recomendable solicitar cuanto antes, ya que las prestaciones se devengan desde la
                fecha de solicitud (con retroactividad).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede el cuidador familiar cotizar a la Seguridad Social?</h4>
              <p>
                Sí. Desde 2023, el cuidador no profesional puede suscribir un convenio especial con la
                Seguridad Social. El Estado cubre el 100% de la cuota (aproximadamente{' '}
                {formatCurrency(335.19)}/mes), proporcionando cobertura por jubilación, incapacidad
                temporal y muerte y supervivencia. El cuidador debe estar dado de alta como tal en el
                sistema SAAD.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Se pueden combinar servicios con prestaciones económicas?</h4>
              <p>
                En general, los servicios y las prestaciones económicas son incompatibles entre sí para
                la misma necesidad. Sin embargo, sí se pueden combinar servicios complementarios (por
                ejemplo, teleasistencia + centro de día + SAD). La combinación concreta se determina
                en el PIA según las necesidades del beneficiario y los recursos disponibles.
              </p>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo solicitar las prestaciones por dependencia: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Acude a los Servicios Sociales de tu municipio</strong>
                <p>
                  Es el punto de entrada al sistema. Un trabajador social te informará de los
                  requisitos, te ayudará con la solicitud y te orientará sobre la documentación
                  necesaria (certificado médico, empadronamiento, DNI).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Presenta la solicitud de valoración de dependencia</strong>
                <p>
                  Rellena el formulario oficial de tu comunidad autónoma. Adjunta el certificado
                  médico actualizado y la documentación de identidad. La solicitud se puede
                  presentar en el registro de la consejería competente o por vía telemática.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Recibe la visita del equipo valorador</strong>
                <p>
                  Un profesional acudirá al domicilio para aplicar el Baremo de Valoración de
                  Dependencia (BVD). Evaluará las actividades básicas de la vida diaria que la
                  persona puede realizar con o sin ayuda. La puntuación (0–100) determina el grado.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Resolución del grado de dependencia</strong>
                <p>
                  La administración emite la resolución con el grado reconocido (I, II o III).
                  Si no estás conforme, puedes presentar recurso en el plazo de un mes. Con el
                  grado reconocido se inicia la elaboración del PIA.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Elaboración del PIA (Programa Individual de Atención)</strong>
                <p>
                  Un profesional de Servicios Sociales te propone la combinación de servicios
                  y/o prestaciones económicas más adecuada. El PIA debe contar con tu aceptación.
                  Aquí se determina la prestación concreta y el importe (tras aplicar copago).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Inicio de la prestación y revisiones periódicas</strong>
                <p>
                  Una vez aprobado el PIA, se inicia el servicio o el cobro de la prestación
                  económica. Las prestaciones se devengan desde la fecha de solicitud (con
                  retroactividad). El grado se revisa periódicamente o cuando cambien las
                  circunstancias.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Consejos */}
        <section className={styles.eduSection}>
          <h2>Consejos para gestionar las prestaciones por dependencia</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <strong>Solicita cuanto antes</strong>
              <p>
                Las prestaciones se devengan desde la fecha de solicitud. Cada mes de retraso
                en presentarla es un mes de prestación que se pierde.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <strong>Prepara bien la documentación médica</strong>
              <p>
                Un informe médico detallado que describa las limitaciones funcionales mejora
                la valoración del BVD. Incluye informes de especialistas si los hay.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏠</span>
              <strong>Solicita la visita en el peor momento</strong>
              <p>
                Si la persona tiene días mejores y peores, intenta que la visita del valorador
                coincida con un momento representativo de la situación real de dependencia.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📞</span>
              <strong>Activa la teleasistencia mientras esperas</strong>
              <p>
                La teleasistencia municipal suele tramitarse más rápido que el SAAD. Es un
                complemento de seguridad inmediato mientras se resuelve el expediente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💼</span>
              <strong>Registra al cuidador en la Seguridad Social</strong>
              <p>
                Si optas por la PECEF, da de alta al cuidador en el convenio especial.
                El Estado paga el 100% de la cuota: jubilación e IT sin coste.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <strong>Revisa el grado si la situación empeora</strong>
              <p>
                Si la dependencia se agrava, puedes solicitar una revisión del grado en
                cualquier momento. Un grado superior da acceso a cuantías mayores y más servicios.
              </p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes al gestionar prestaciones por dependencia</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir cuantía máxima con cuantía real:</strong> Los importes publicados son
              máximos estatales. El copago puede reducirlos significativamente según la capacidad
              económica del beneficiario.
            </li>
            <li>
              <strong>No solicitar la retroactividad:</strong> Las prestaciones se devengan desde la
              fecha de solicitud, pero hay que reclamarla. Si la resolución tarda 12 meses, tienes
              derecho a los atrasos.
            </li>
            <li>
              <strong>Olvidar dar de alta al cuidador en SS:</strong> El convenio especial con cuota
              bonificada al 100% es un derecho del cuidador familiar. No activarlo supone perder
              cotización para la jubilación.
            </li>
            <li>
              <strong>Aceptar el primer PIA sin negociar:</strong> El PIA es una propuesta, no una
              imposición. Puedes solicitar cambios en la combinación de servicios o prestaciones si
              no se ajusta a tus necesidades reales.
            </li>
            <li>
              <strong>No recurrir un grado bajo:</strong> Si crees que la valoración no refleja la
              situación real, tienes un mes para presentar recurso. Es habitual que se concedan
              grados superiores en segunda valoración.
            </li>
            <li>
              <strong>Desconocer las ayudas autonómicas:</strong> Muchas comunidades complementan las
              prestaciones estatales con ayudas propias (adaptación de vivienda, respiro familiar,
              transporte). Consulta en tu CCAA.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimacion-prestaciones-dependencia')} />
      <ShareCard appName="estimacion-prestaciones-dependencia" />
      <Footer appName="estimacion-prestaciones-dependencia" />
    </div>
  );
}
