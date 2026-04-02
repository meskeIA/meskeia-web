'use client';

import { useState } from 'react';
import styles from './PlanificadorAhorroJubilacion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  NumberInput,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_PENSIONES_META,
  FISCAL_PLAN_PENSIONES_META,
  LIMITES_PLAN_PENSIONES_2025,
} from '@/data/fiscal';
import { TRAMOS_IRPF_2025 } from '@/data/fiscal';
import { jsonLd } from './metadata';

// ──────────────────────────────────────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────────────────────────────────────

interface ResultadoBrecha {
  brechaMensual: number;
  brechaAnual: number;
  porcentajePensionSobreSueldo: number;
  capitalNecesario: number;
  ahorroMensualNecesario: number;
  anosHastaJubilacion: number;
  tieneBrecha: boolean;
}

interface ProyeccionEscenario {
  nombre: string;
  rentabilidad: number;
  capitalFinal: number;
  totalAportado: number;
  totalIntereses: number;
  pensionComplementaria: number;
}

interface ResultadoPlanPensiones {
  aportacionAnual: number;
  deducibleAnual: number;
  tipoMarginal: number;
  ahorroFiscalAnual: number;
  costeNetoMensual: number;
  superaLimite: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// L\u00d3GICA
// ──────────────────────────────────────────────────────────────────────────────

function calcularAhorroMensual(capital: number, anos: number, rentAnual: number): number {
  if (anos <= 0) return capital;
  const r = rentAnual / 100 / 12;
  const n = anos * 12;
  if (r === 0) return capital / n;
  return (capital * r) / (Math.pow(1 + r, n) - 1);
}

function calcularBrecha(
  sueldoNeto: number,
  pensionEstimada: number,
  edadActual: number,
  edadJubilacion: number,
  anosJubilado: number,
  rentabilidad: number
): ResultadoBrecha {
  const brechaMensual = Math.max(0, sueldoNeto - pensionEstimada);
  const brechaAnual = brechaMensual * 12;
  const porcentaje = (pensionEstimada / sueldoNeto) * 100;
  const anosHastaJubilacion = Math.max(0, edadJubilacion - edadActual);
  const capitalNecesario = brechaMensual * 12 * anosJubilado;
  const ahorroMensual = calcularAhorroMensual(capitalNecesario, anosHastaJubilacion, rentabilidad);

  return {
    brechaMensual,
    brechaAnual,
    porcentajePensionSobreSueldo: porcentaje,
    capitalNecesario,
    ahorroMensualNecesario: Math.max(0, ahorroMensual),
    anosHastaJubilacion,
    tieneBrecha: brechaMensual > 0,
  };
}

function calcularCapitalFuturo(aportacionMensual: number, anos: number, rentAnual: number): number {
  if (anos <= 0) return 0;
  const r = rentAnual / 100 / 12;
  const n = anos * 12;
  if (r === 0) return aportacionMensual * n;
  return aportacionMensual * ((Math.pow(1 + r, n) - 1) / r);
}

function calcularProyecciones(
  aportacionMensual: number,
  anosHasta: number,
  anosJubilado: number
): ProyeccionEscenario[] {
  const escenarios = [
    { nombre: 'Conservador', rentabilidad: 3 },
    { nombre: 'Moderado', rentabilidad: 5 },
    { nombre: 'Agresivo', rentabilidad: 7 },
  ];

  return escenarios.map(e => {
    const capitalFinal = calcularCapitalFuturo(aportacionMensual, anosHasta, e.rentabilidad);
    const totalAportado = aportacionMensual * 12 * anosHasta;
    return {
      nombre: e.nombre,
      rentabilidad: e.rentabilidad,
      capitalFinal,
      totalAportado,
      totalIntereses: capitalFinal - totalAportado,
      pensionComplementaria: anosJubilado > 0 ? capitalFinal / (anosJubilado * 12) : 0,
    };
  });
}

function tipoMarginalIRPF(baseImponible: number): number {
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseImponible <= tramo.hasta) return tramo.tipo;
  }
  return 47;
}

function calcularPlanPensiones(
  baseImponible: number,
  aportacionMensual: number
): ResultadoPlanPensiones {
  const aportacionAnual = aportacionMensual * 12;
  const deducibleAnual = Math.min(aportacionAnual, LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual);
  const tipoMarginal = tipoMarginalIRPF(baseImponible);
  const ahorroFiscalAnual = deducibleAnual * tipoMarginal / 100;
  const costeNetoAnual = aportacionAnual - ahorroFiscalAnual;

  return {
    aportacionAnual,
    deducibleAnual,
    tipoMarginal,
    ahorroFiscalAnual,
    costeNetoMensual: costeNetoAnual / 12,
    superaLimite: aportacionAnual > LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

export default function PlanificadorAhorroJubilacionPage() {
  // Datos b\u00e1sicos
  const [sueldoNeto, setSueldoNeto] = useState('');
  const [pensionEstimada, setPensionEstimada] = useState('');
  const [edadActual, setEdadActual] = useState('');
  const [edadJubilacion, setEdadJubilacion] = useState('67');
  const [anosJubilado, setAnosJubilado] = useState('20');
  const [rentabilidad, setRentabilidad] = useState('4');
  const [error, setError] = useState('');
  const [calculado, setCalculado] = useState(false);

  // Resultados
  const [brecha, setBrecha] = useState<ResultadoBrecha | null>(null);
  const [proyecciones, setProyecciones] = useState<ProyeccionEscenario[]>([]);

  // Plan de pensiones (toggle)
  const [showPlan, setShowPlan] = useState(false);
  const [baseImponible, setBaseImponible] = useState('');
  const [aportacionPlan, setAportacionPlan] = useState('');
  const [resultadoPlan, setResultadoPlan] = useState<ResultadoPlanPensiones | null>(null);

  // ── C\u00e1lculo principal ──
  function calcular() {
    setError('');
    const sueldo = parseFloat(sueldoNeto.replace(',', '.'));
    const pension = parseFloat(pensionEstimada.replace(',', '.'));
    const edad = parseInt(edadActual);
    const edadJub = parseInt(edadJubilacion);
    const anos = parseInt(anosJubilado);
    const rent = parseFloat(rentabilidad.replace(',', '.'));

    if (isNaN(sueldo) || sueldo <= 0) { setError('Introduce tu sueldo neto mensual.'); return; }
    if (isNaN(pension) || pension <= 0) { setError('Introduce la pensi\u00f3n estimada mensual.'); return; }
    if (isNaN(edad) || edad < 20 || edad > 70) { setError('Introduce tu edad (entre 20 y 70).'); return; }
    if (isNaN(edadJub) || edadJub <= edad) { setError('La edad de jubilaci\u00f3n debe ser mayor que tu edad actual.'); return; }
    if (isNaN(anos) || anos < 1 || anos > 40) { setError('A\u00f1os de jubilaci\u00f3n entre 1 y 40.'); return; }

    const brechaResult = calcularBrecha(sueldo, pension, edad, edadJub, anos, rent);
    setBrecha(brechaResult);

    // Proyecciones con el ahorro mensual necesario
    if (brechaResult.tieneBrecha) {
      setProyecciones(calcularProyecciones(brechaResult.ahorroMensualNecesario, brechaResult.anosHastaJubilacion, anos));
    } else {
      setProyecciones([]);
    }

    setCalculado(true);
    setResultadoPlan(null);
  }

  // ── C\u00e1lculo plan de pensiones ──
  function calcularPlan() {
    const base = parseFloat(baseImponible.replace(',', '.'));
    const aportacion = parseFloat(aportacionPlan.replace(',', '.'));
    if (isNaN(base) || isNaN(aportacion) || aportacion <= 0) return;
    setResultadoPlan(calcularPlanPensiones(base, aportacion));
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">\ud83d\udcb9</span>
          <h1 className={styles.title}>Planificador de Ahorro para la Jubilaci\u00f3n</h1>
          <p className={styles.subtitle}>
            Brecha, ahorro necesario, ventaja fiscal y proyecci\u00f3n de capital
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical">
          <span>
            Esta herramienta es SOLO orientativa e informativa.
            <br /><strong>No es</strong> asesoramiento financiero ni fiscal personalizado.
            <br />Los c\u00e1lculos son estimaciones simplificadas que no incluyen inflaci\u00f3n, evoluci\u00f3n salarial ni cambios legislativos futuros.
            <br /><strong>Consulta con un asesor financiero cualificado</strong> antes de tomar decisiones de ahorro o inversi\u00f3n.
            <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimaci\u00f3n.</em>
          </span>
        </DisclaimerCard>

        <DataReference
          normativa={FISCAL_PLAN_PENSIONES_META.fuente}
          fuente={FISCAL_PLAN_PENSIONES_META.fuente}
          verificado={FISCAL_PLAN_PENSIONES_META.verificado}
          urlOficial={FISCAL_PLAN_PENSIONES_META.urlOficial}
        />

        {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 FORMULARIO PRINCIPAL \u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">\ud83d\udc64</span> Tu situaci\u00f3n actual
          </h2>

          <NumberInput
            value={sueldoNeto}
            onChange={setSueldoNeto}
            label="Sueldo neto mensual actual (\u20ac)"
            placeholder="Ej: 2.200"
            helperText="Lo que recibes en tu cuenta cada mes."
            min={100}
            max={50000}
          />

          <NumberInput
            value={pensionEstimada}
            onChange={setPensionEstimada}
            label="Pensi\u00f3n estimada mensual (\u20ac)"
            placeholder="Ej: 1.400"
            helperText="Obt\u00e9nla del Simulador de Jubilaci\u00f3n P\u00fablica o del simulador oficial de la SS."
            min={100}
            max={10000}
          />

          <NumberInput
            value={edadActual}
            onChange={setEdadActual}
            label="Edad actual"
            placeholder="Ej: 40"
            min={20}
            max={70}
          />

          <NumberInput
            value={edadJubilacion}
            onChange={setEdadJubilacion}
            label="Edad prevista de jubilaci\u00f3n"
            placeholder="67"
            min={55}
            max={75}
          />

          <NumberInput
            value={anosJubilado}
            onChange={setAnosJubilado}
            label="A\u00f1os de jubilaci\u00f3n previstos"
            placeholder="20"
            helperText="Esperanza de vida - edad jubilaci\u00f3n. Recomendado: 20-25 a\u00f1os."
            min={1}
            max={40}
          />

          <NumberInput
            value={rentabilidad}
            onChange={setRentabilidad}
            label="Rentabilidad anual esperada (%)"
            placeholder="4"
            helperText="Conservador (dep\u00f3sitos): 2-3%. Moderado (fondos): 4-6%. Agresivo: 7%+."
            min={0}
            max={15}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              \u26a0\ufe0f {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular plan de ahorro">
            Planificar mi ahorro
          </button>
        </div>

        {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 RESULTADO 1: BRECHA \u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
        {calculado && brecha && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">\ud83d\udcc9</span> Tu brecha de jubilaci\u00f3n
            </h2>

            <div className={styles.resultados}>
              {brecha.tieneBrecha ? (
                <>
                  <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                    <span className={styles.resultLabel}>Brecha mensual</span>
                    <span className={styles.resultValueBig}>-{formatCurrency(brecha.brechaMensual)}</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Tu pensi\u00f3n cubre</span>
                    <span className={styles.resultValueDanger}>{formatNumber(brecha.porcentajePensionSobreSueldo, 1)}% de tu sueldo</span>
                  </div>

                  <div className={styles.brechaVisual}>
                    <div className={styles.barraLabel}>
                      <span>Pensi\u00f3n sobre sueldo</span>
                      <span>{formatNumber(brecha.porcentajePensionSobreSueldo, 1)}%</span>
                    </div>
                    <div
                      className={styles.barra}
                      role="progressbar"
                      aria-label={`La pensi\u00f3n cubre el ${formatNumber(brecha.porcentajePensionSobreSueldo, 1)}% del sueldo`}
                      aria-valuenow={Math.round(brecha.porcentajePensionSobreSueldo)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className={styles.barraFillDanger} style={{ width: `${Math.min(100, brecha.porcentajePensionSobreSueldo)}%` }} />
                    </div>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Brecha total en {anosJubilado} a\u00f1os</span>
                    <span className={styles.resultValueDanger}>{formatCurrency(brecha.capitalNecesario)}</span>
                  </div>

                  <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                    <span className={styles.resultLabel}>
                      Ahorro mensual necesario
                      <br /><small>({brecha.anosHastaJubilacion} a\u00f1os al {rentabilidad}% anual)</small>
                    </span>
                    <span className={styles.resultValuePositive}>{formatCurrency(brecha.ahorroMensualNecesario)}/mes</span>
                  </div>
                </>
              ) : (
                <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                  <span className={styles.resultLabel}>\u00a1Tu pensi\u00f3n supera o iguala tu sueldo actual!</span>
                  <span className={styles.resultValuePositive}>Sin brecha detectada</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 RESULTADO 2: PROYECCI\u00d3N POR ESCENARIOS \u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
        {calculado && brecha && brecha.tieneBrecha && proyecciones.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">\ud83d\udcca</span> Proyecci\u00f3n: {formatCurrency(brecha.ahorroMensualNecesario)}/mes durante {brecha.anosHastaJubilacion} a\u00f1os
            </h2>

            <div className={styles.escenariosGrid}>
              {proyecciones.map(e => (
                <div key={e.nombre} className={`${styles.escenarioCard} ${e.rentabilidad === parseFloat(rentabilidad.replace(',', '.')) ? styles.escenarioCardActive : ''}`}>
                  <div className={styles.escenarioLabel}>{e.nombre}</div>
                  <div className={styles.escenarioRent}>{formatNumber(e.rentabilidad, 0)}% anual</div>
                  <span className={styles.escenarioCapital}>{formatCurrency(e.capitalFinal)}</span>
                  <div className={styles.escenarioPension}>{formatCurrency(e.pensionComplementaria)}/mes</div>
                </div>
              ))}
            </div>

            <div className={styles.resultados}>
              {proyecciones.map(e => (
                <div key={e.nombre} className={styles.resultItem}>
                  <span className={styles.resultLabel}>{e.nombre} ({formatNumber(e.rentabilidad, 0)}%)</span>
                  <span className={styles.resultNote}>
                    Aportado: {formatCurrency(e.totalAportado)} \u00b7
                    Intereses: {formatCurrency(e.totalIntereses)} \u00b7
                    Total: {formatCurrency(e.capitalFinal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 SECCI\u00d3N 3: PLAN DE PENSIONES (toggle) \u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
        {calculado && brecha && brecha.tieneBrecha && (
          <div className={styles.toggleSection}>
            <button
              type="button"
              className={`${styles.toggleHeader} ${showPlan ? styles.toggleHeaderActive : ''}`}
              onClick={() => setShowPlan(!showPlan)}
              aria-expanded={showPlan}
              aria-controls="seccion-plan"
            >
              <span className={styles.toggleIcon} aria-hidden="true">\ud83d\udcbc</span>
              <span className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>\u00bfCu\u00e1nto me ahorro con un plan de pensiones?</span>
                <span className={styles.toggleSubtitle}>Ventaja fiscal IRPF, coste real y l\u00edmites de deducci\u00f3n 2025</span>
              </span>
              <span className={`${styles.toggleArrow} ${showPlan ? styles.toggleArrowOpen : ''}`} aria-hidden="true">\u25bc</span>
            </button>

            {showPlan && (
              <div id="seccion-plan" className={styles.toggleContent}>
                <NumberInput
                  value={baseImponible}
                  onChange={setBaseImponible}
                  label="Base imponible IRPF anual (\u20ac)"
                  placeholder="Ej: 35.000"
                  helperText="Aproximaci\u00f3n de tu salario bruto anual sujeto a IRPF."
                  min={0}
                  max={300000}
                />

                <NumberInput
                  value={aportacionPlan}
                  onChange={setAportacionPlan}
                  label={`Aportaci\u00f3n mensual al plan (\u20ac) \u2014 l\u00edmite deducible ${formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual / 12)}/mes`}
                  placeholder="Ej: 125"
                  helperText={`M\u00e1ximo deducible: ${formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/a\u00f1o. Puedes aportar m\u00e1s, pero sin ventaja fiscal adicional.`}
                  min={10}
                  max={5000}
                />

                <button type="button" className={styles.btn} onClick={calcularPlan} aria-label="Calcular ventaja fiscal">
                  Calcular ventaja fiscal
                </button>

                {resultadoPlan && (
                  <div className={styles.resultados} style={{ marginTop: '1.5rem' }}>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Aportaci\u00f3n anual</span>
                      <span className={styles.resultValue}>{formatCurrency(resultadoPlan.aportacionAnual)}/a\u00f1o</span>
                    </div>

                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Importe deducible en IRPF</span>
                      <span className={styles.resultValue}>{formatCurrency(resultadoPlan.deducibleAnual)}/a\u00f1o</span>
                    </div>

                    {resultadoPlan.superaLimite && (
                      <div className={styles.aviso} role="status">
                        \u26a0\ufe0f Tu aportaci\u00f3n supera el l\u00edmite deducible ({formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/a\u00f1o). El exceso de {formatCurrency(resultadoPlan.aportacionAnual - resultadoPlan.deducibleAnual)}/a\u00f1o no genera ventaja fiscal.
                      </div>
                    )}

                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Tu tipo marginal IRPF</span>
                      <span className={styles.resultValue}>{formatNumber(resultadoPlan.tipoMarginal, 0)}%</span>
                    </div>

                    <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                      <span className={styles.resultLabel}>Ahorro fiscal anual (desgravaci\u00f3n IRPF)</span>
                      <span className={styles.resultValuePositive}>+{formatCurrency(resultadoPlan.ahorroFiscalAnual)}/a\u00f1o</span>
                    </div>

                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Coste real mensual (tras desgravaci\u00f3n)</span>
                      <span className={styles.resultValue}>{formatCurrency(resultadoPlan.costeNetoMensual)}/mes</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* \u2550\u2550\u2550\u2550\u2550\u2550\u2550 CONTENIDO EDUCATIVO v2.0 \u2550\u2550\u2550\u2550\u2550\u2550\u2550 */}
        <EducationalSection
          title="\ud83d\udcda Planificar el ahorro para la jubilaci\u00f3n"
          subtitle="Brecha, instrumentos de ahorro, plan de pensiones y errores frecuentes"
        >
          <h2><span aria-hidden="true">\ud83c\udfaf</span> 4 perfiles de ahorro</h2>

          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>\ud83e\uddd1\u200d\ud83d\udcbc</span>
                <strong>30 a\u00f1os, empleado con IRPF alto</strong>
              </div>
              <p className={styles.casoExample}>Salario 45.000 \u20ac, pensi\u00f3n ~65% del sueldo. 35 a\u00f1os por delante.</p>
              <p className={styles.casoTip}>\ud83d\udca1 Con 300 \u20ac/mes al 5% anual durante 35 a\u00f1os acumula ~280.000 \u20ac. Plan de empresa + fondos indexados.</p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>\ud83d\udc69\u200d\u2695\ufe0f</span>
                <strong>45 a\u00f1os, aut\u00f3noma con bases bajas</strong>
              </div>
              <p className={styles.casoExample}>Cotizaciones hist\u00f3ricamente bajas en RETA. Brecha grande y poco tiempo.</p>
              <p className={styles.casoTip}>\ud83d\udca1 Con 20 a\u00f1os, necesita ~600-900 \u20ac/mes. PIAS + fondos + alquiler inmobiliario.</p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>\ud83d\udc74</span>
                <strong>55 a\u00f1os, cercano a jubilaci\u00f3n</strong>
              </div>
              <p className={styles.casoExample}>Poco tiempo para acumular. La brecha debe cubrirse con activos existentes.</p>
              <p className={styles.casoTip}>\ud83d\udca1 Maximizar plan de empresa + revisar si tiene PP antiguos olvidados.</p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>\ud83d\udc69\u200d\ud83c\udfeb</span>
                <strong>40 a\u00f1os, funcionaria con pensi\u00f3n alta</strong>
              </div>
              <p className={styles.casoExample}>Pensi\u00f3n cercana al m\u00e1ximo. Brecha peque\u00f1a.</p>
              <p className={styles.casoTip}>\ud83d\udca1 El objetivo es flexibilidad: fondos indexados de bajo coste como colch\u00f3n.</p>
            </div>
          </div>

          <h2><span aria-hidden="true">\ud83d\udcca</span> Instrumentos de ahorro comparados</h2>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Instrumento</th>
                  <th>L\u00edmite anual</th>
                  <th>Ventaja fiscal</th>
                  <th>Liquidez</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Plan de pensiones individual</td>
                  <td>1.500 \u20ac/a\u00f1o</td>
                  <td>Deducci\u00f3n IRPF (hasta 47%)</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>Plan de pensiones empresa</td>
                  <td>8.500 \u20ac/a\u00f1o extra</td>
                  <td>Deducci\u00f3n IRPF empleado</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>PIAS</td>
                  <td>8.000 \u20ac/a\u00f1o</td>
                  <td>Renta vitalicia exenta si &gt;10 a\u00f1os</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>Fondos de inversi\u00f3n</td>
                  <td>Sin l\u00edmite</td>
                  <td>Diferimiento de plusval\u00edas</td>
                  <td>Alta</td>
                </tr>
                <tr>
                  <td>Inmueble en alquiler</td>
                  <td>Sin l\u00edmite</td>
                  <td>Deducciones gastos</td>
                  <td>Muy baja</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2><span aria-hidden="true">\u2753</span> Preguntas frecuentes</h2>

          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>\u00bfQu\u00e9 es la brecha de jubilaci\u00f3n?</strong>
              <p>La diferencia entre tu sueldo actual y tu pensi\u00f3n futura. Si cobras 3.000 \u20ac/mes y tu pensi\u00f3n ser\u00e1 1.800 \u20ac, la brecha es 1.200 \u20ac/mes.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfEs mejor plan de pensiones o fondos de inversi\u00f3n?</strong>
              <p>Depende de tu tramo IRPF. Con tramos altos (45-47%), el plan es muy ventajoso. Con tramos bajos, la flexibilidad de los fondos puede ser preferible.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfCu\u00e1ndo puedo rescatar el plan de pensiones?</strong>
              <p>En jubilaci\u00f3n, invalidez, fallecimiento, dependencia, desempleo largo, enfermedad grave. Desde 2025, tambi\u00e9n aportaciones con m\u00e1s de 10 a\u00f1os.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfC\u00f3mo tributa el rescate del plan?</strong>
              <p>Como rendimiento del trabajo en IRPF. En renta mensual el impacto se distribuye. En capital concentra la tributaci\u00f3n en un solo ejercicio.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfEl inter\u00e9s compuesto importa tanto?</strong>
              <p>S\u00ed. Ahorrar 200 \u20ac/mes durante 30 a\u00f1os al 4% genera m\u00e1s capital que 400 \u20ac/mes durante 15 a\u00f1os. Cuanto antes empieces, menor el esfuerzo.</p>
              <p className={styles.faqTip}>\ud83d\udca1 Planificar para 25-30 a\u00f1os de jubilaci\u00f3n da margen frente a la longevidad.</p>
            </li>
          </ul>

          <h2><span aria-hidden="true">\ud83d\udcdd</span> C\u00f3mo planificar tu ahorro paso a paso</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Estima tu pensi\u00f3n p\u00fablica</strong>
                <p>Usa el Simulador de Jubilaci\u00f3n P\u00fablica de meskeIA o el simulador oficial de la SS.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula tu brecha</strong>
                <p>Resta la pensi\u00f3n de tu sueldo neto. El resultado es lo que el ahorro privado debe cubrir.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Define cu\u00e1nto puedes ahorrar mensualmente</strong>
                <p>Usa esta herramienta para ver cu\u00e1nto necesitas. Automatiza la aportaci\u00f3n mensual.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Elige los instrumentos adecuados</strong>
                <p>Combina plan de pensiones (ventaja fiscal), fondos indexados (flexibilidad) y si es posible, PIAS o inmuebles.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Revisa y ajusta anualmente</strong>
                <p>Aumentos de sueldo, cambios legislativos, evoluci\u00f3n de mercados. Ajusta las aportaciones cada a\u00f1o.</p>
              </div>
            </div>
          </div>

          <h2><span aria-hidden="true">\ud83d\udca1</span> Consejos clave</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udcc5</span>
              <strong>Empieza cuanto antes</strong>
              <p>Empezar 10 a\u00f1os antes puede duplicar el capital con la misma aportaci\u00f3n mensual.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83c\udfaf</span>
              <strong>Automatiza las aportaciones</strong>
              <p>Lo que no ves, no lo gastas. Aumenta con cada subida de sueldo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83c\udf0d</span>
              <strong>Diversifica</strong>
              <p>No concentres todo en activos espa\u00f1oles. Fondos indexados globales reducen el riesgo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udcb8</span>
              <strong>Reduce comisiones</strong>
              <p>1% menos en comisiones = 20% m\u00e1s de capital a 30 a\u00f1os. Elige fondos de bajo coste.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83c\udfe6</span>
              <strong>Aprovecha el plan de empresa</strong>
              <p>Si tu empresa ofrece plan con aportaci\u00f3n empresarial, maxim\u00edzalo siempre.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udcc9</span>
              <strong>No rescates antes de tiempo</strong>
              <p>Romper el plan anticipadamente implica tributar al tipo marginal m\u00e1s alto.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>\u26a0\ufe0f</span>
              <strong>Errores frecuentes al planificar el ahorro</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>No calcular la brecha hasta los 50-55 a\u00f1os:</strong> Cuando se calcula tarde, la brecha es enorme y el tiempo muy corto.</li>
              <li><strong>Confiar solo en la pensi\u00f3n p\u00fablica:</strong> La tasa de sustituci\u00f3n bajar\u00e1 en las pr\u00f3ximas d\u00e9cadas.</li>
              <li><strong>Ignorar la inflaci\u00f3n:</strong> 1.500 \u20ac hoy no tendr\u00e1n el mismo poder adquisitivo en 30 a\u00f1os.</li>
              <li><strong>Rescatar el plan como capital \u00fanico:</strong> Puede disparar el tipo marginal al 45-47%. El rescate en renta es m\u00e1s eficiente.</li>
              <li><strong>Sobreestimar la rentabilidad:</strong> Calcular con 8-10% puede llevar a ahorrar menos de lo necesario. Usa estimaciones conservadoras (3-5%).</li>
              <li><strong>No diversificar instrumentos:</strong> Todo en plan de pensiones limita la liquidez. Un mix con fondos y PIAS da m\u00e1s flexibilidad.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('planificador-ahorro-jubilacion')} />
        <ShareCard appName="planificador-ahorro-jubilacion" />
        <Footer appName="planificador-ahorro-jubilacion" />
      </div>
    </>
  );
}
