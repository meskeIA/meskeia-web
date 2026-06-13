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
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_PENSIONES_META,
  FISCAL_PLAN_PENSIONES_META,
  LIMITES_PLAN_PENSIONES_2025,
  tipoMarginalDesdeRendimientosBrutos,
} from '@/data/fiscal';
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
// LÓGICA
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

function calcularPlanPensiones(
  baseImponible: number,
  aportacionMensual: number
): ResultadoPlanPensiones {
  const aportacionAnual = aportacionMensual * 12;
  const deducibleAnual = Math.min(aportacionAnual, LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual);
  const tipoMarginal = tipoMarginalDesdeRendimientosBrutos(baseImponible);
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
  // Datos básicos
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

  // ── Cálculo principal ──
  function calcular() {
    setError('');
    const sueldo = parseFloat(sueldoNeto.replace(',', '.'));
    const pension = parseFloat(pensionEstimada.replace(',', '.'));
    const edad = parseInt(edadActual);
    const edadJub = parseInt(edadJubilacion);
    const anos = parseInt(anosJubilado);
    const rent = parseFloat(rentabilidad.replace(',', '.'));

    if (isNaN(sueldo) || sueldo <= 0) { setError('Introduce tu sueldo neto mensual.'); return; }
    if (isNaN(pension) || pension <= 0) { setError('Introduce la pensión estimada mensual.'); return; }
    if (isNaN(edad) || edad < 20 || edad > 70) { setError('Introduce tu edad (entre 20 y 70).'); return; }
    if (isNaN(edadJub) || edadJub <= edad) { setError('La edad de jubilación debe ser mayor que tu edad actual.'); return; }
    if (isNaN(anos) || anos < 1 || anos > 40) { setError('Años de jubilación entre 1 y 40.'); return; }

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

  // ── Cálculo plan de pensiones ──
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
          <span className={styles.heroIcon} aria-hidden="true">💹</span>
          <h1 className={styles.title}>Planificador de Ahorro para la Jubilación</h1>
          <p className={styles.subtitle}>
            Brecha, ahorro necesario, ventaja fiscal y proyección de capital
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical">
          <span>
            Esta herramienta es SOLO orientativa e informativa.
            <br /><strong>No es</strong> asesoramiento financiero ni fiscal personalizado.
            <br />Los cálculos son estimaciones simplificadas que no incluyen inflación, evolución salarial ni cambios legislativos futuros.
            <br /><strong>Consulta con un asesor financiero cualificado</strong> antes de tomar decisiones de ahorro o inversión.
            <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
          </span>
        </DisclaimerCard>

        <DataReference
          normativa={FISCAL_PLAN_PENSIONES_META.fuente}
          fuente={FISCAL_PLAN_PENSIONES_META.fuente}
          verificado={FISCAL_PLAN_PENSIONES_META.verificado}
          urlOficial={FISCAL_PLAN_PENSIONES_META.urlOficial}
        />

        {/* ═══════ FORMULARIO PRINCIPAL ═══════ */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">👤</span> Tu situación actual
          </h2>

          <NumberInput
            value={sueldoNeto}
            onChange={setSueldoNeto}
            label="Sueldo neto mensual actual (€)"
            placeholder="Ej: 2.200"
            helperText="Lo que recibes en tu cuenta cada mes."
            min={100}
            max={50000}
          />

          <NumberInput
            value={pensionEstimada}
            onChange={setPensionEstimada}
            label="Pensión estimada mensual (€)"
            placeholder="Ej: 1.400"
            helperText="Obténla del Simulador de Jubilación Pública o del simulador oficial de la SS."
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
            label="Edad prevista de jubilación"
            placeholder="67"
            min={55}
            max={75}
          />

          <NumberInput
            value={anosJubilado}
            onChange={setAnosJubilado}
            label="Años de jubilación previstos"
            placeholder="20"
            helperText="Esperanza de vida - edad jubilación. Recomendado: 20-25 años."
            min={1}
            max={40}
          />

          <NumberInput
            value={rentabilidad}
            onChange={setRentabilidad}
            label="Rentabilidad anual esperada (%)"
            placeholder="4"
            helperText="Conservador (depósitos): 2-3%. Moderado (fondos): 4-6%. Agresivo: 7%+."
            min={0}
            max={15}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular plan de ahorro">
            Planificar mi ahorro
          </button>
        </div>

        {/* ═══════ RESULTADO 1: BRECHA ═══════ */}
        {calculado && brecha && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">📉</span> Tu brecha de jubilación
            </h2>

            <div className={styles.resultados}>
              {brecha.tieneBrecha ? (
                <>
                  <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                    <span className={styles.resultLabel}>Brecha mensual</span>
                    <span className={styles.resultValueBig}>-{formatCurrency(brecha.brechaMensual)}</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Tu pensión cubre</span>
                    <span className={styles.resultValueDanger}>{formatNumber(brecha.porcentajePensionSobreSueldo, 1)}% de tu sueldo</span>
                  </div>

                  <div className={styles.brechaVisual}>
                    <div className={styles.barraLabel}>
                      <span>Pensión sobre sueldo</span>
                      <span>{formatNumber(brecha.porcentajePensionSobreSueldo, 1)}%</span>
                    </div>
                    <div
                      className={styles.barra}
                      role="progressbar"
                      aria-label={`La pensión cubre el ${formatNumber(brecha.porcentajePensionSobreSueldo, 1)}% del sueldo`}
                      aria-valuenow={Math.round(brecha.porcentajePensionSobreSueldo)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className={styles.barraFillDanger} style={{ width: `${Math.min(100, brecha.porcentajePensionSobreSueldo)}%` }} />
                    </div>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Brecha total en {anosJubilado} años</span>
                    <span className={styles.resultValueDanger}>{formatCurrency(brecha.capitalNecesario)}</span>
                  </div>

                  <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                    <span className={styles.resultLabel}>
                      Ahorro mensual necesario
                      <br /><small>({brecha.anosHastaJubilacion} años al {rentabilidad}% anual)</small>
                    </span>
                    <span className={styles.resultValuePositive}>{formatCurrency(brecha.ahorroMensualNecesario)}/mes</span>
                  </div>
                </>
              ) : (
                <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                  <span className={styles.resultLabel}>¡Tu pensión supera o iguala tu sueldo actual!</span>
                  <span className={styles.resultValuePositive}>Sin brecha detectada</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ RESULTADO 2: PROYECCIÓN POR ESCENARIOS ═══════ */}
        {calculado && brecha && brecha.tieneBrecha && proyecciones.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">📊</span> Proyección: {formatCurrency(brecha.ahorroMensualNecesario)}/mes durante {brecha.anosHastaJubilacion} años
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
                    Aportado: {formatCurrency(e.totalAportado)} ·
                    Intereses: {formatCurrency(e.totalIntereses)} ·
                    Total: {formatCurrency(e.capitalFinal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 3: PLAN DE PENSIONES (toggle) ═══════ */}
        {calculado && brecha && brecha.tieneBrecha && (
          <div className={styles.toggleSection}>
            <button
              type="button"
              className={`${styles.toggleHeader} ${showPlan ? styles.toggleHeaderActive : ''}`}
              onClick={() => setShowPlan(!showPlan)}
              aria-expanded={showPlan}
              aria-controls="seccion-plan"
            >
              <span className={styles.toggleIcon} aria-hidden="true">💼</span>
              <span className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>¿Cuánto me ahorro con un plan de pensiones?</span>
                <span className={styles.toggleSubtitle}>Ventaja fiscal IRPF, coste real y límites de deducción 2025</span>
              </span>
              <span className={`${styles.toggleArrow} ${showPlan ? styles.toggleArrowOpen : ''}`} aria-hidden="true">▼</span>
            </button>

            {showPlan && (
              <div id="seccion-plan" className={styles.toggleContent}>
                <NumberInput
                  value={baseImponible}
                  onChange={setBaseImponible}
                  label="Base imponible IRPF anual (€)"
                  placeholder="Ej: 35.000"
                  helperText="Aproximación de tu salario bruto anual sujeto a IRPF."
                  min={0}
                  max={300000}
                />

                <NumberInput
                  value={aportacionPlan}
                  onChange={setAportacionPlan}
                  label={`Aportación mensual al plan (€) — límite deducible ${formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual / 12)}/mes`}
                  placeholder="Ej: 125"
                  helperText={`Máximo deducible: ${formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/año. Puedes aportar más, pero sin ventaja fiscal adicional.`}
                  min={10}
                  max={5000}
                />

                <button type="button" className={styles.btn} onClick={calcularPlan} aria-label="Calcular ventaja fiscal">
                  Calcular ventaja fiscal
                </button>

                {resultadoPlan && (
                  <div className={styles.resultados} style={{ marginTop: '1.5rem' }}>
                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Aportación anual</span>
                      <span className={styles.resultValue}>{formatCurrency(resultadoPlan.aportacionAnual)}/año</span>
                    </div>

                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Importe deducible en IRPF</span>
                      <span className={styles.resultValue}>{formatCurrency(resultadoPlan.deducibleAnual)}/año</span>
                    </div>

                    {resultadoPlan.superaLimite && (
                      <div className={styles.aviso} role="status">
                        ⚠️ Tu aportación supera el límite deducible ({formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/año). El exceso de {formatCurrency(resultadoPlan.aportacionAnual - resultadoPlan.deducibleAnual)}/año no genera ventaja fiscal.
                      </div>
                    )}

                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Tu tipo marginal IRPF</span>
                      <span className={styles.resultValue}>{formatNumber(resultadoPlan.tipoMarginal, 0)}%</span>
                    </div>

                    <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                      <span className={styles.resultLabel}>Ahorro fiscal anual (desgravación IRPF)</span>
                      <span className={styles.resultValuePositive}>+{formatCurrency(resultadoPlan.ahorroFiscalAnual)}/año</span>
                    </div>

                    <div className={styles.resultItem}>
                      <span className={styles.resultLabel}>Coste real mensual (tras desgravación)</span>
                      <span className={styles.resultValue}>{formatCurrency(resultadoPlan.costeNetoMensual)}/mes</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ CONTENIDO EDUCATIVO v2.0 ═══════ */}
        <EducationalSection
          title="📚 Planificar el ahorro para la jubilación"
          subtitle="Brecha, instrumentos de ahorro, plan de pensiones y errores frecuentes"
        >
          <h2><span aria-hidden="true">🎯</span> 4 perfiles de ahorro</h2>

          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>🧑‍💼</span>
                <strong>30 años, empleado con IRPF alto</strong>
              </div>
              <p className={styles.casoExample}>Salario 45.000 €, pensión ~65% del sueldo. 35 años por delante.</p>
              <p className={styles.casoTip}>💡 Con 300 €/mes al 5% anual nominal durante 35 años acumula ~280.000 € nominales (~145.000 € de poder adquisitivo actual si la inflación promedia 2%). Plan de empresa + fondos indexados.</p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>👩‍⚕️</span>
                <strong>45 años, autónoma con bases bajas</strong>
              </div>
              <p className={styles.casoExample}>Cotizaciones históricamente bajas en RETA. Brecha grande y poco tiempo.</p>
              <p className={styles.casoTip}>💡 Con 20 años, necesita ~600-900 €/mes. PIAS + fondos + alquiler inmobiliario.</p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>👴</span>
                <strong>55 años, cercano a jubilación</strong>
              </div>
              <p className={styles.casoExample}>Poco tiempo para acumular. La brecha debe cubrirse con activos existentes.</p>
              <p className={styles.casoTip}>💡 Maximizar plan de empresa + revisar si tiene PP antiguos olvidados.</p>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoIcon}>👩‍🏫</span>
                <strong>40 años, funcionaria con pensión alta</strong>
              </div>
              <p className={styles.casoExample}>Pensión cercana al máximo. Brecha pequeña.</p>
              <p className={styles.casoTip}>💡 El objetivo es flexibilidad: fondos indexados de bajo coste como colchón.</p>
            </div>
          </div>

          <h2><span aria-hidden="true">📊</span> Instrumentos de ahorro comparados</h2>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Instrumento</th>
                  <th>Límite anual</th>
                  <th>Ventaja fiscal</th>
                  <th>Liquidez</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Plan de pensiones individual</td>
                  <td>1.500 €/año</td>
                  <td>Deducción IRPF (hasta 47%)</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>Plan de pensiones empresa</td>
                  <td>8.500 €/año extra</td>
                  <td>Deducción IRPF empleado</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>PIAS</td>
                  <td>8.000 €/año</td>
                  <td>Renta vitalicia exenta si &gt;10 años</td>
                  <td>Media</td>
                </tr>
                <tr>
                  <td>Fondos de inversión</td>
                  <td>Sin límite</td>
                  <td>Diferimiento de plusvalías</td>
                  <td>Alta</td>
                </tr>
                <tr>
                  <td>Inmueble en alquiler</td>
                  <td>Sin límite</td>
                  <td>Deducciones gastos</td>
                  <td>Muy baja</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>

          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Qué es la brecha de jubilación?</strong>
              <p>La diferencia entre tu sueldo actual y tu pensión futura. Si cobras 3.000 €/mes y tu pensión será 1.800 €, la brecha es 1.200 €/mes.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Es mejor plan de pensiones o fondos de inversión?</strong>
              <p>Depende de tu tramo IRPF. Con tramos altos (45-47%), el plan es muy ventajoso. Con tramos bajos, la flexibilidad de los fondos puede ser preferible.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuándo puedo rescatar el plan de pensiones?</strong>
              <p>En jubilación, invalidez, fallecimiento, dependencia, desempleo largo, enfermedad grave. Desde 2025, también aportaciones con más de 10 años.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo tributa el rescate del plan?</strong>
              <p>Como rendimiento del trabajo en IRPF. En renta mensual el impacto se distribuye. En capital concentra la tributación en un solo ejercicio.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿El interés compuesto importa tanto?</strong>
              <p>Sí. Ahorrar 200 €/mes durante 30 años al 4% genera más capital que 400 €/mes durante 15 años. Cuanto antes empieces, menor el esfuerzo.</p>
              <p className={styles.faqTip}>💡 Planificar para 25-30 años de jubilación da margen frente a la longevidad.</p>
            </li>
          </ul>

          <h2><span aria-hidden="true">📝</span> Cómo planificar tu ahorro paso a paso</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Estima tu pensión pública</strong>
                <p>Usa el Simulador de Jubilación Pública de meskeIA o el simulador oficial de la SS.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula tu brecha</strong>
                <p>Resta la pensión de tu sueldo neto. El resultado es lo que el ahorro privado debe cubrir.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Define cuánto puedes ahorrar mensualmente</strong>
                <p>Usa esta herramienta para ver cuánto necesitas. Automatiza la aportación mensual.</p>
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
                <p>Aumentos de sueldo, cambios legislativos, evolución de mercados. Ajusta las aportaciones cada año.</p>
              </div>
            </div>
          </div>

          <h2><span aria-hidden="true">💡</span> Consejos clave</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>📅</span>
              <strong>Empieza cuanto antes</strong>
              <p>Empezar 10 años antes puede duplicar el capital con la misma aportación mensual.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>🎯</span>
              <strong>Automatiza las aportaciones</strong>
              <p>Lo que no ves, no lo gastas. Aumenta con cada subida de sueldo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>🌍</span>
              <strong>Diversifica</strong>
              <p>No concentres todo en activos españoles. Fondos indexados globales reducen el riesgo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>💸</span>
              <strong>Reduce comisiones</strong>
              <p>1% menos en comisiones = 20% más de capital a 30 años. Elige fondos de bajo coste.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>🏦</span>
              <strong>Aprovecha el plan de empresa</strong>
              <p>Si tu empresa ofrece plan con aportación empresarial, maximízalo siempre.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>📉</span>
              <strong>No rescates antes de tiempo</strong>
              <p>Romper el plan anticipadamente implica tributar al tipo marginal más alto.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Errores frecuentes al planificar el ahorro</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>No calcular la brecha hasta los 50-55 años:</strong> Cuando se calcula tarde, la brecha es enorme y el tiempo muy corto.</li>
              <li><strong>Confiar exclusivamente en la pensión pública:</strong> las proyecciones de la AIREF apuntan a una posible caída de la tasa de sustitución en las próximas décadas, aunque depende de futuras reformas legislativas. Diversificar fuentes reduce el riesgo de cualquier cambio adverso.</li>
              <li><strong>Ignorar la inflación:</strong> 1.500 € hoy no tendrán el mismo poder adquisitivo en 30 años.</li>
              <li><strong>Rescatar el plan como capital único:</strong> Puede disparar el tipo marginal al 45-47%. El rescate en renta es más eficiente.</li>
              <li><strong>Sobreestimar la rentabilidad:</strong> Calcular con 8-10% puede llevar a ahorrar menos de lo necesario. Usa estimaciones conservadoras (3-5%).</li>
              <li><strong>No diversificar instrumentos:</strong> Todo en plan de pensiones limita la liquidez. Un mix con fondos y PIAS da más flexibilidad.</li>
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
