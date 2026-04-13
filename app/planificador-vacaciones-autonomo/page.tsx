'use client';

import { useState, useMemo } from 'react';
import styles from './PlanificadorVacacionesAutonomo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ============================================
// TIPOS
// ============================================

interface NivelProduccion {
  id: string;
  label: string;
  porcentaje: number;
  descripcion: string;
}

interface EstacionalidadMes {
  mes: string;
  diseno: string;
  consultoria: string;
  traduccion: string;
  marketing: string;
}

// ============================================
// CONSTANTES
// ============================================

const DIAS_LABORABLES_MES = 22;
const DIAS_NATURALES_MES = 30;
const MESES_COMPENSACION = 2;
const MESES_ANO = 12;

const NIVELES_PRODUCCION: NivelProduccion[] = [
  {
    id: 'total',
    label: 'No, desconexión total',
    porcentaje: 0,
    descripcion: '0% producción — descanso completo',
  },
  {
    id: 'emails',
    label: 'Algo, responder emails urgentes',
    porcentaje: 0.15,
    descripcion: '15% producción — mínimo imprescindible',
  },
  {
    id: 'medio-gas',
    label: 'Sí, medio gas',
    porcentaje: 0.40,
    descripcion: '40% producción — trabajo parcial',
  },
];

const ESTACIONALIDAD: EstacionalidadMes[] = [
  { mes: 'Enero', diseno: '⬇️ Baja', consultoria: '⬇️ Baja', traduccion: '➡️ Normal', marketing: '⬇️ Baja' },
  { mes: 'Febrero', diseno: '➡️ Normal', consultoria: '➡️ Normal', traduccion: '➡️ Normal', marketing: '➡️ Normal' },
  { mes: 'Marzo', diseno: '⬆️ Alta', consultoria: '⬆️ Alta', traduccion: '➡️ Normal', marketing: '⬆️ Alta' },
  { mes: 'Abril', diseno: '⬆️ Alta', consultoria: '⬆️ Alta', traduccion: '➡️ Normal', marketing: '⬆️ Alta' },
  { mes: 'Mayo', diseno: '⬆️ Alta', consultoria: '⬆️ Alta', traduccion: '⬆️ Alta', marketing: '⬆️ Alta' },
  { mes: 'Junio', diseno: '➡️ Normal', consultoria: '➡️ Normal', traduccion: '⬆️ Alta', marketing: '➡️ Normal' },
  { mes: 'Julio', diseno: '⬇️ Baja', consultoria: '⬇️ Baja', traduccion: '➡️ Normal', marketing: '⬇️ Baja' },
  { mes: 'Agosto', diseno: '⬇️ Baja', consultoria: '⬇️ Baja', traduccion: '⬇️ Baja', marketing: '⬇️ Baja' },
  { mes: 'Septiembre', diseno: '⬆️ Alta', consultoria: '⬆️ Alta', traduccion: '⬆️ Alta', marketing: '⬆️ Alta' },
  { mes: 'Octubre', diseno: '⬆️ Alta', consultoria: '⬆️ Alta', traduccion: '⬆️ Alta', marketing: '⬆️ Alta' },
  { mes: 'Noviembre', diseno: '⬆️ Alta', consultoria: '⬆️ Alta', traduccion: '⬆️ Alta', marketing: '⬆️ Alta' },
  { mes: 'Diciembre', diseno: '⬇️ Baja', consultoria: '⬇️ Baja', traduccion: '⬆️ Alta', marketing: '⬆️ Alta' },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function PlanificadorVacacionesAutonomoPage() {
  // Estados de entrada
  const [ingresosMensuales, setIngresosMensuales] = useState('3000');
  const [gastosFijos, setGastosFijos] = useState('1500');
  const [diasVacaciones, setDiasVacaciones] = useState(15);
  const [nivelProduccion, setNivelProduccion] = useState('total');

  // Cálculos en tiempo real
  const resultados = useMemo(() => {
    const ingresos = parseFloat(ingresosMensuales.replace(/\./g, '').replace(',', '.')) || 0;
    const gastos = parseFloat(gastosFijos.replace(/\./g, '').replace(',', '.')) || 0;

    if (ingresos <= 0 || gastos <= 0 || diasVacaciones <= 0) {
      return null;
    }

    const produccion = NIVELES_PRODUCCION.find(n => n.id === nivelProduccion);
    const porcentajeProduccion = produccion?.porcentaje ?? 0;

    const ingresosDiarios = ingresos / DIAS_LABORABLES_MES;
    const gastosDiarios = gastos / DIAS_NATURALES_MES;

    // Lo que dejas de facturar
    const facturacionPerdida = ingresosDiarios * diasVacaciones * (1 - porcentajeProduccion);

    // Gastos que siguen corriendo durante vacaciones
    const gastosVacaciones = gastosDiarios * diasVacaciones;

    // Impacto total
    const impactoTotal = facturacionPerdida + gastosVacaciones;

    // Para compensar (distribuido en 2 meses: 1 antes + 1 después)
    const facturacionExtraNecesaria = impactoTotal / MESES_COMPENSACION;
    const ingresosMensualesObjetivo = ingresos + facturacionExtraNecesaria;

    // Ahorro mensual preventivo
    const ahorroMensual = impactoTotal / MESES_ANO;

    // Porcentaje de incremento necesario
    const porcentajeIncremento = ingresos > 0 ? (facturacionExtraNecesaria / ingresos) * 100 : 0;

    return {
      ingresosDiarios,
      gastosDiarios,
      facturacionPerdida,
      gastosVacaciones,
      impactoTotal,
      facturacionExtraNecesaria,
      ingresosMensualesObjetivo,
      ahorroMensual,
      porcentajeIncremento,
      porcentajeProduccion,
    };
  }, [ingresosMensuales, gastosFijos, diasVacaciones, nivelProduccion]);

  // Formato para inputs numéricos
  const handleNumericInput = (
    value: string,
    setter: (v: string) => void
  ) => {
    // Permitir solo dígitos, puntos y comas
    const limpio = value.replace(/[^0-9.,]/g, '');
    setter(limpio);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        {/* Hero Section */}
        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🏖️</span> Planificador de Vacaciones para Autónomos
          </h1>
          <p className={styles.subtitle}>
            Calcula el impacto económico real de tus vacaciones y planifica cómo compensarlo
          </p>
        </header>

        {/* Enlaces legales RGPD */}
        <LegalNotice />

        {/* Disclaimer */}
        <DisclaimerCard
          variant="financial"
          severity="medium"
          context="planificador-vacaciones-autonomo"
          collapsible={true}
        />

        {/* Formulario principal */}
        <section className={styles.mainContent}>
          <div className={styles.inputPanel}>
            <h2 className={styles.panelTitle}>
              <span aria-hidden="true">📝</span> Tus datos
            </h2>

            {/* Ingresos mensuales */}
            <div className={styles.formGroup}>
              <label htmlFor="ingresos" className={styles.label}>
                Ingresos mensuales medios
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="ingresos"
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={ingresosMensuales}
                  onChange={(e) => handleNumericInput(e.target.value, setIngresosMensuales)}
                  placeholder="3.000"
                  aria-describedby="ingresos-help"
                />
                <span className={styles.inputSuffix}>€</span>
              </div>
              <small id="ingresos-help" className={styles.helpText}>
                Facturación media mensual (bruta)
              </small>
            </div>

            {/* Gastos fijos */}
            <div className={styles.formGroup}>
              <label htmlFor="gastos" className={styles.label}>
                Gastos fijos mensuales
              </label>
              <div className={styles.inputWrapper}>
                <input
                  id="gastos"
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={gastosFijos}
                  onChange={(e) => handleNumericInput(e.target.value, setGastosFijos)}
                  placeholder="1.500"
                  aria-describedby="gastos-help"
                />
                <span className={styles.inputSuffix}>€</span>
              </div>
              <small id="gastos-help" className={styles.helpText}>
                Incluye alquiler, cuota RETA, suministros, seguros, etc.
              </small>
            </div>

            {/* Días de vacaciones */}
            <div className={styles.formGroup}>
              <label htmlFor="dias" className={styles.label}>
                Días laborables de vacaciones: <strong>{diasVacaciones}</strong>
              </label>
              <input
                id="dias"
                type="range"
                min={5}
                max={30}
                value={diasVacaciones}
                onChange={(e) => setDiasVacaciones(parseInt(e.target.value, 10))}
                className={styles.slider}
                aria-valuenow={diasVacaciones}
                aria-valuemin={5}
                aria-valuemax={30}
              />
              <div className={styles.sliderLabels}>
                <span>5 días</span>
                <span>15 días</span>
                <span>30 días</span>
              </div>
            </div>

            {/* Nivel de producción */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                ¿Puedes trabajar a medio gas en vacaciones?
              </label>
              <div className={styles.radioGroup}>
                {NIVELES_PRODUCCION.map((nivel) => (
                  <label key={nivel.id} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="produccion"
                      value={nivel.id}
                      checked={nivelProduccion === nivel.id}
                      onChange={(e) => setNivelProduccion(e.target.value)}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioText}>
                      <strong>{nivel.label}</strong>
                      <small>{nivel.descripcion}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Resultados */}
          {resultados && (
            <div className={styles.resultsPanel}>
              {/* Panel: Impacto económico */}
              <div className={styles.resultCard}>
                <h2 className={styles.panelTitle}>
                  <span aria-hidden="true">💸</span> Impacto económico
                </h2>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Facturación que dejas de percibir</span>
                  <span className={styles.resultValue}>
                    {formatCurrency(resultados.facturacionPerdida)}
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Gastos fijos que siguen corriendo</span>
                  <span className={styles.resultValue}>
                    {formatCurrency(resultados.gastosVacaciones)}
                  </span>
                </div>
                <div className={`${styles.resultRow} ${styles.resultTotal}`}>
                  <span className={styles.resultLabel}>Impacto total</span>
                  <span className={styles.resultValueHighlight}>
                    {formatCurrency(resultados.impactoTotal)}
                  </span>
                </div>
                <p className={styles.resultNote}>
                  <span aria-hidden="true">ℹ️</span> Son {diasVacaciones} días laborables
                  {resultados.porcentajeProduccion > 0
                    ? ` trabajando al ${formatNumber(resultados.porcentajeProduccion * 100, 0)}%`
                    : ' con desconexión total'}
                </p>
              </div>

              {/* Panel: Compensación */}
              <div className={styles.resultCard}>
                <h2 className={styles.panelTitle}>
                  <span aria-hidden="true">📊</span> Plan de compensación
                </h2>
                <p className={styles.compensationText}>
                  Para compensar, necesitas facturar{' '}
                  <strong>{formatCurrency(resultados.facturacionExtraNecesaria)} extra</strong>{' '}
                  en el mes anterior y posterior a tus vacaciones.
                </p>
                <div className={styles.barComparison}>
                  <div className={styles.barRow}>
                    <span className={styles.barLabel}>Mes normal</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: '60%' }}
                        aria-label={`Mes normal: ${formatCurrency(parseFloat(ingresosMensuales.replace(/\./g, '').replace(',', '.')) || 0)}`}
                      />
                    </div>
                    <span className={styles.barValue}>
                      {formatCurrency(parseFloat(ingresosMensuales.replace(/\./g, '').replace(',', '.')) || 0)}
                    </span>
                  </div>
                  <div className={styles.barRow}>
                    <span className={styles.barLabel}>Mes compensación</span>
                    <div className={styles.barTrack}>
                      <div
                        className={`${styles.barFill} ${styles.barFillHighlight}`}
                        style={{ width: `${Math.min(95, 60 * (1 + resultados.porcentajeIncremento / 100))}%` }}
                        aria-label={`Mes compensación: ${formatCurrency(resultados.ingresosMensualesObjetivo)}`}
                      />
                    </div>
                    <span className={styles.barValue}>
                      {formatCurrency(resultados.ingresosMensualesObjetivo)}
                    </span>
                  </div>
                </div>
                <p className={styles.incrementNote}>
                  +{formatNumber(resultados.porcentajeIncremento, 1)}% sobre tu facturación habitual
                </p>
              </div>

              {/* Panel: Ahorro preventivo */}
              <div className={styles.resultCard}>
                <h2 className={styles.panelTitle}>
                  <span aria-hidden="true">🐖</span> Ahorro preventivo
                </h2>
                <p className={styles.savingText}>
                  Si ahorras{' '}
                  <strong>{formatCurrency(resultados.ahorroMensual)}/mes</strong>{' '}
                  durante todo el año, tus vacaciones están cubiertas sin necesidad de facturar más.
                </p>
                <div className={styles.savingHighlight}>
                  <span className={styles.savingAmount}>
                    {formatCurrency(resultados.ahorroMensual)}
                  </span>
                  <span className={styles.savingLabel}>al mes</span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Tabla de estacionalidad */}
        <section className={styles.seasonSection}>
          <h2 className={styles.sectionTitle}>
            <span aria-hidden="true">📅</span> Mejores épocas para vacaciones según tu sector
          </h2>
          <p className={styles.sectionSubtitle}>
            Aprovecha los meses de baja demanda de tu sector para descansar
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.seasonTable}>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Diseño/Dev</th>
                  <th>Consultoría</th>
                  <th>Traducción</th>
                  <th>Marketing</th>
                </tr>
              </thead>
              <tbody>
                {ESTACIONALIDAD.map((fila) => (
                  <tr key={fila.mes}>
                    <td className={styles.mesCell}>{fila.mes}</td>
                    <td>{fila.diseno}</td>
                    <td>{fila.consultoria}</td>
                    <td>{fila.traduccion}</td>
                    <td>{fila.marketing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tableNote}>
            <span aria-hidden="true">💡</span> Estos datos son orientativos y varían según tu nicho específico y cartera de clientes.
          </p>
        </section>

        {/* Contenido educativo */}
        <EducationalSection
          title="📚 Todo sobre vacaciones para autónomos"
          subtitle="Estadísticas, consejos y preguntas frecuentes"
        >
          {/* Estadísticas */}
          <section className={styles.guideSection}>
            <h2>Estadísticas: autónomos y vacaciones en España</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>12%</span>
                <span className={styles.statLabel}>de autónomos no toma vacaciones nunca</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>35%</span>
                <span className={styles.statLabel}>toma menos de 10 días al año</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>53%</span>
                <span className={styles.statLabel}>trabaja parcialmente en vacaciones</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statNumber}>22</span>
                <span className={styles.statLabel}>días laborables de vacaciones tiene un asalariado</span>
              </div>
            </div>
          </section>

          {/* Por qué descansar */}
          <section className={styles.guideSection}>
            <h2>Por qué descansar es invertir en tu negocio</h2>
            <ul className={styles.benefitsList}>
              <li>
                <strong>Productividad:</strong> Después de vacaciones, la productividad aumenta
                entre un 20% y un 40% durante las semanas siguientes.
              </li>
              <li>
                <strong>Creatividad:</strong> El descanso activa el modo &quot;difuso&quot; del cerebro,
                favoreciendo ideas innovadoras y soluciones a problemas enquistados.
              </li>
              <li>
                <strong>Salud:</strong> El burnout crónico reduce la capacidad de trabajo hasta un 50%.
                Prevenir es más rentable que curar.
              </li>
              <li>
                <strong>Perspectiva:</strong> Alejarse del día a día permite reevaluar tu negocio
                con ojos frescos y tomar decisiones estratégicas más acertadas.
              </li>
              <li>
                <strong>Relaciones:</strong> Mantener relaciones personales sanas repercute
                directamente en tu estabilidad emocional y profesional.
              </li>
            </ul>
          </section>

          {/* Comparativa asalariado vs autónomo */}
          <section className={styles.guideSection}>
            <h2>Vacaciones: asalariado vs autónomo</h2>
            <div className={styles.comparisonTable}>
              <table className={styles.seasonTable}>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Asalariado</th>
                    <th>Autónomo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Días mínimos legales</td>
                    <td>22 días laborables</td>
                    <td>Sin mínimo legal</td>
                  </tr>
                  <tr>
                    <td>Cobras durante vacaciones</td>
                    <td>Sí, salario completo</td>
                    <td>No, dejas de facturar</td>
                  </tr>
                  <tr>
                    <td>Cuota SS en vacaciones</td>
                    <td>La paga la empresa</td>
                    <td>Sigues pagando RETA</td>
                  </tr>
                  <tr>
                    <td>Gastos fijos</td>
                    <td>Los asume la empresa</td>
                    <td>Siguen corriendo</td>
                  </tr>
                  <tr>
                    <td>Planificación necesaria</td>
                    <td>Avisar al jefe</td>
                    <td>Avisar clientes + colchón financiero</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>

            <div className={styles.faqItem}>
              <h3>¿Puedo desgravar gastos de vacaciones?</h3>
              <p>
                En general, <strong>no</strong>. Los gastos de ocio personal no son deducibles.
                Sin embargo, si combinas vacaciones con un viaje de trabajo (reunión con cliente,
                congreso, formación), los gastos proporcionales a la actividad profesional sí pueden
                ser deducibles. Conserva siempre las facturas y justificación del motivo profesional.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Sigo pagando cuota RETA en vacaciones?</h3>
              <p>
                <strong>Sí, siempre.</strong> La cuota de autónomo se paga los 365 días del año,
                independientemente de si trabajas o no. No existe un mecanismo para suspender la cuota
                temporalmente por vacaciones. Solo podrías darte de baja, pero eso implica perder
                bonificaciones y reactivar el alta después.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Debo avisar a mis clientes?</h3>
              <p>
                <strong>Sí, es fundamental.</strong> Avisa con al menos 2-4 semanas de antelación.
                Deja claro las fechas exactas, quién atiende urgencias (si aplica), y asegúrate de
                entregar todo el trabajo pendiente antes de irte. Una buena comunicación refuerza
                tu profesionalidad.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cuántos días de vacaciones debería tomar?</h3>
              <p>
                No hay una cifra mágica, pero los expertos recomiendan un mínimo de <strong>15-20 días
                laborables al año</strong> (3-4 semanas). Repartirlos en bloques de 1-2 semanas es más
                sostenible que intentar acumular todo en agosto. Algunos autónomos prefieren semanas
                de 4 días durante períodos de baja demanda.
              </p>
            </div>
          </section>

          {/* Tips */}
          <section className={styles.guideSection}>
            <h2>5 consejos para unas vacaciones sin estrés</h2>
            <ol className={styles.tipsList}>
              <li>
                <strong>Comunica con antelación:</strong> Envía un email a todos tus clientes activos
                al menos 3 semanas antes con tus fechas exactas.
              </li>
              <li>
                <strong>Deja trabajo adelantado:</strong> Entrega todo lo pendiente antes de irte.
                Si tienes entregas programadas durante tus vacaciones, negocia adelantarlas.
              </li>
              <li>
                <strong>Configura respuesta automática:</strong> En email y canales de comunicación,
                indica tus fechas de ausencia y cuándo responderás.
              </li>
              <li>
                <strong>Crea un fondo de vacaciones:</strong> Ahorra una cantidad fija cada mes
                (como calculamos arriba) para que no sea un golpe económico.
              </li>
              <li>
                <strong>Desconecta de verdad:</strong> Desinstala el email del trabajo del móvil,
                o usa un segundo dispositivo que dejas en casa.
              </li>
            </ol>
          </section>

          {/* Warning box */}
          <section className={styles.guideSection}>
            <h3>Errores comunes que debes evitar</h3>
            <div className={styles.warningBox}>
              <ul>
                <li>
                  <strong>No avisar a los clientes:</strong> Desaparecer sin previo aviso daña tu
                  reputación profesional y puede costarte contratos.
                </li>
                <li>
                  <strong>No planificar financieramente:</strong> Irse de vacaciones sin colchón
                  económico genera ansiedad y arruina el descanso.
                </li>
                <li>
                  <strong>No desconectar realmente:</strong> Estar &quot;de vacaciones&quot; pero
                  respondiendo emails constantemente no es descansar. Tu cerebro necesita desconexión real.
                </li>
                <li>
                  <strong>Concentrar todo en agosto:</strong> Si tu sector tiene baja demanda en enero
                  o julio, aprovecha esos meses y trabaja cuando hay más trabajo.
                </li>
                <li>
                  <strong>No delegar ni automatizar:</strong> Si tienes tareas recurrentes, considera
                  automatizarlas o delegarlas temporalmente antes de irte.
                </li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        {/* Apps relacionadas */}
        <RelatedApps apps={getRelatedApps('planificador-vacaciones-autonomo')} />

        {/* Tarjeta de compartir */}
        <ShareCard appName="planificador-vacaciones-autonomo" />

        {/* Footer */}
        <Footer appName="planificador-vacaciones-autonomo" />
      </div>
    </>
  );
}
