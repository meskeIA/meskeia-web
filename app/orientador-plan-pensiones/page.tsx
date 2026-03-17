'use client';

import { useState } from 'react';
import styles from './OrientadorPlanPensiones.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { TRAMOS_IRPF_2025 } from '@/data/fiscal';
import {
  FISCAL_PENSIONES_META,
  LIMITES_PLAN_PENSIONES_2025,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ResultadoPlanPensiones {
  aportacionAnual: number;
  deducibleAnual: number;
  tipoMarginal: number;
  ahorroFiscalAnual: number;
  costeNetoAnual: number;
  costeNetoMensual: number;
  capitalAcumulado: number;
  pensionComplementariaMensual: number;
  anosHastaJubilacion: number;
  superaLimite: boolean;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function tipoMarginalIRPF(baseImponible: number): number {
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseImponible <= tramo.hasta) return tramo.tipo;
  }
  return 47;
}

function calcularCapitalFuturo(
  aportacionMensual: number,
  anosAhorro: number,
  rentabilidadAnual: number
): number {
  if (anosAhorro <= 0) return 0;
  const r = rentabilidadAnual / 100 / 12;
  const n = anosAhorro * 12;
  if (r === 0) return aportacionMensual * n;
  // FV de anualidad: PMT × ((1+r)^n - 1) / r
  return aportacionMensual * ((Math.pow(1 + r, n) - 1) / r);
}

function orientarPlanPensiones(
  baseImponible: number,
  aportacionMensual: number,
  edadActual: number,
  edadJubilacion: number,
  rentabilidadAnual: number,
  anosJubilacion: number
): ResultadoPlanPensiones {
  const aportacionAnual = aportacionMensual * 12;
  const deducibleAnual = Math.min(aportacionAnual, LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual);
  const tipoMarginal = tipoMarginalIRPF(baseImponible);
  const ahorroFiscalAnual = deducibleAnual * tipoMarginal / 100;
  const costeNetoAnual = aportacionAnual - ahorroFiscalAnual;
  const anosHastaJubilacion = Math.max(0, edadJubilacion - edadActual);
  const capitalAcumulado = calcularCapitalFuturo(aportacionMensual, anosHastaJubilacion, rentabilidadAnual);
  const pensionComplementariaMensual = anosJubilacion > 0
    ? capitalAcumulado / (anosJubilacion * 12)
    : 0;

  return {
    aportacionAnual,
    deducibleAnual,
    tipoMarginal,
    ahorroFiscalAnual,
    costeNetoAnual,
    costeNetoMensual: costeNetoAnual / 12,
    capitalAcumulado,
    pensionComplementariaMensual,
    anosHastaJubilacion,
    superaLimite: aportacionAnual > LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorPlanPensiones() {
  const [baseImponible, setBaseImponible] = useState('');
  const [aportacionMensual, setAportacionMensual] = useState('');
  const [edadActual, setEdadActual] = useState('');
  const [edadJubilacion, setEdadJubilacion] = useState('67');
  const [rentabilidad, setRentabilidad] = useState('4');
  const [anosJubilacion, setAnosJubilacion] = useState('20');
  const [resultado, setResultado] = useState<ResultadoPlanPensiones | null>(null);
  const [error, setError] = useState('');

  function orientar() {
    setError('');
    const base = parseFloat(baseImponible.replace(',', '.'));
    const aportacion = parseFloat(aportacionMensual.replace(',', '.'));
    const edad = parseInt(edadActual);
    const edadJub = parseInt(edadJubilacion);
    const rent = parseFloat(rentabilidad.replace(',', '.'));
    const anosJub = parseInt(anosJubilacion);

    if (isNaN(base) || base < 0 || base > 300000) { setError('Introduce tu base imponible anual (entre 0 y 300.000 €).'); return; }
    if (isNaN(aportacion) || aportacion < 10 || aportacion > 5000) { setError('Introduce la aportación mensual (entre 10 y 5.000 €).'); return; }
    if (isNaN(edad) || edad < 18 || edad > 70) { setError('Introduce tu edad actual (entre 18 y 70).'); return; }
    if (isNaN(edadJub) || edadJub <= edad) { setError('La edad de jubilación debe ser mayor que tu edad actual.'); return; }
    if (isNaN(rent) || rent < 0 || rent > 15) { setError('Introduce una rentabilidad entre 0% y 15%.'); return; }
    if (isNaN(anosJub) || anosJub < 1 || anosJub > 40) { setError('Introduce los años previstos de jubilación (entre 1 y 40).'); return; }

    setResultado(orientarPlanPensiones(base, aportacion, edad, edadJub, rent, anosJub));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">💼</span>
        <h1 className={styles.title}>Orientador de Plan de Pensiones</h1>
        <p className={styles.subtitle}>Cuánto ahorras en IRPF, cuánto acumulas y cuánto cobrarás · 2025</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Esta herramienta es SOLO orientativa. Las condiciones reales dependen del plan concreto contratado y de tu declaración de la renta.
          <br /><strong>No es</strong> asesoramiento financiero ni fiscal personalizado.
          <br />El ahorro fiscal es una estimación. La tributación al rescate varía según el importe y la forma de cobro. Datos IRPF vigentes en {FISCAL_PENSIONES_META.vigencia}.
          <br /><strong>Consulta con tu entidad gestora y un asesor fiscal</strong> antes de decidir.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tus datos</h2>

          <NumberInput
            value={baseImponible}
            onChange={setBaseImponible}
            label="Base imponible IRPF anual (€)"
            placeholder="Ej: 35.000"
            helperText="Aproximación de tu salario bruto o ingresos sujetos a IRPF."
            min={0}
            max={300000}
          />

          <NumberInput
            value={aportacionMensual}
            onChange={setAportacionMensual}
            label={`Aportación mensual al plan (€/mes) — límite deducible ${formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual / 12)}/mes`}
            placeholder="Ej: 125"
            helperText={`Máximo deducible: ${formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/año. Puedes aportar más, pero sin ventaja fiscal adicional.`}
            min={10}
            max={5000}
          />

          <NumberInput
            value={edadActual}
            onChange={setEdadActual}
            label="Edad actual"
            placeholder="Ej: 40"
            min={18}
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
            value={rentabilidad}
            onChange={setRentabilidad}
            label="Rentabilidad anual esperada del plan (%)"
            placeholder="4"
            helperText="Conservador: 2-3%. Moderado: 4-5%. Dinámico: 6-8%."
            min={0}
            max={15}
          />

          <NumberInput
            value={anosJubilacion}
            onChange={setAnosJubilacion}
            label="Años previstos de jubilación"
            placeholder="20"
            helperText="Para estimar la pensión complementaria mensual. Recomendado: 20-25 años."
            min={1}
            max={40}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={orientar} aria-label="Calcular plan de pensiones">
            Orientarme sobre mi plan de pensiones
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orientación fiscal</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa el botón para ver el impacto fiscal y el capital acumulado.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>Aportación anual</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.aportacionAnual)}/año</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Importe deducible en IRPF</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.deducibleAnual)}/año</span>
              </div>

              {resultado.superaLimite && (
                <div className={styles.aviso} role="status">
                  ⚠️ Tu aportación supera el límite deducible ({formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/año). El exceso de {formatCurrency(resultado.aportacionAnual - resultado.deducibleAnual)}/año no genera ventaja fiscal.
                </div>
              )}

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Tu tipo marginal IRPF estimado</span>
                <span className={styles.resultValue}>{formatNumber(resultado.tipoMarginal, 0)}%</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                <span className={styles.resultLabel}>Ahorro fiscal anual (desgravación IRPF)</span>
                <span className={styles.resultValuePositive}>+{formatCurrency(resultado.ahorroFiscalAnual)}/año</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Coste neto real mensual (tras desgravación)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.costeNetoMensual)}/mes</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Años de ahorro hasta jubilación</span>
                <span className={styles.resultValue}>{resultado.anosHastaJubilacion} años</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Capital acumulado estimado</span>
                <span className={styles.resultValueBig}>{formatCurrency(resultado.capitalAcumulado)}</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                <span className={styles.resultLabel}>
                  Pensión complementaria estimada
                  <br /><small>({anosJubilacion} años de jubilación, rescate en renta)</small>
                </span>
                <span className={styles.resultValuePositive}>{formatCurrency(resultado.pensionComplementariaMensual)}/mes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo funcionan los planes de pensiones en España?" subtitle="Ventajas fiscales, límites y tributación al rescate · 2025">
        <p>Un plan de pensiones es un producto de ahorro a largo plazo con ventaja fiscal: las aportaciones reducen tu base imponible del IRPF en el año en que las realizas.</p>
        <h3>Límites de aportación deducible 2025</h3>
        <ul>
          <li><strong>Límite individual</strong>: {formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}/año (trabajador por cuenta ajena o autónomo)</li>
          <li><strong>Límite empresa</strong>: {formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteEmpresaAnual)}/año adicional si hay aportación del empleador</li>
          <li><strong>Límite total</strong>: {formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteTotalAnual)}/año (suma individual + empresa)</li>
        </ul>
        <h3>¿Cuánto me ahorro en IRPF?</h3>
        <p>El ahorro depende de tu tipo marginal. Si estás en el tramo del 30% y aportas el máximo ({formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)}), pagas {formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual * 0.30)} menos en tu declaración ese año.</p>
        <h3>Tributación al rescate</h3>
        <p>Al jubilarte, el rescate tributa como <strong>rendimiento del trabajo</strong>. Si lo cobras en renta mensual, el impacto fiscal se distribuye en el tiempo. Un rescate total en forma de capital concentra toda la fiscalidad en un solo ejercicio, lo que puede disparar el tipo efectivo.</p>
        <h3>¿Cuándo se puede rescatar?</h3>
        <p>Jubilación, invalidez, fallecimiento, dependencia severa, desempleo de larga duración, enfermedad grave y, desde 2025, aportaciones con más de 10 años de antigüedad.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Tipos de planes de pensiones</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Límite aportación</th>
              <th>Quién aporta</th>
              <th>Deducción IRPF</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Individual</td>
              <td>1.500 €/año</td>
              <td>El partícipe</td>
              <td>Sí, hasta 1.500 €</td>
            </tr>
            <tr>
              <td>De empleo (empresa)</td>
              <td>8.500 €/año adicionales</td>
              <td>Empresa (+partícipe)</td>
              <td>Sí, para el empleado</td>
            </tr>
            <tr>
              <td>Asociado</td>
              <td>1.500 € (comparte con individual)</td>
              <td>Asociación/colectivo</td>
              <td>Sí, según normativa</td>
            </tr>
            <tr>
              <td>Cónyuge (aportación)</td>
              <td>1.000 €/año extra</td>
              <td>El otro cónyuge</td>
              <td>Sí, 1.000 € adicionales</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👔</span>
            <strong>Empleado con tramo IRPF alto</strong>
          </div>
          <p>Salario 60.000 €, tipo marginal 45%. Aportar 1.500 €/año al plan individual le supone un ahorro fiscal de 675 €. La ventaja fiscal es máxima.</p>
          <div className={styles.escenarioExample}>Ahorro fiscal: 1.500 € × 45% = 675 €/año en la declaración</div>
          <div className={styles.escenarioTip}>💡 Si la empresa ofrece plan de empleo, negociar aportación empresarial multiplica el beneficio.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏢</span>
            <strong>Empleado con plan de empresa</strong>
          </div>
          <p>La empresa aporta 3.000 €/año al plan de empleo. El empleado puede añadir hasta 8.500 € adicionales con deducción fiscal completa.</p>
          <div className={styles.escenarioExample}>Ejemplo: Empresa 3.000 € + empleado 6.000 € = 9.000 €/año de ahorro total</div>
          <div className={styles.escenarioTip}>💡 El plan de empleo es una de las ventajas salariales más eficientes fiscalmente disponibles.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🧑‍💻</span>
            <strong>Autónomo con ingresos variables</strong>
          </div>
          <p>Ingresos fluctuantes, tipo marginal varía según el año. Aportar en años de mayores ingresos maximiza la deducción. Límite 1.500 € individual.</p>
          <div className={styles.escenarioExample}>Año bueno (47% marginal): 1.500 € aporta → 705 € de ahorro fiscal</div>
          <div className={styles.escenarioTip}>💡 Los autónomos pueden promover un plan de empleo simplificado para acceder al límite 8.500 €.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👫</span>
            <strong>Cónyuge sin ingresos o con pocos</strong>
          </div>
          <p>Pareja con un solo ingreso. El cónyuge con mayor renta puede aportar 1.000 € al plan del otro cónyuge y deducirlos adicionalmente.</p>
          <div className={styles.escenarioExample}>Cónyuge aporta 1.000 € al plan del otro → 1.000 € más de deducción IRPF</div>
          <div className={styles.escenarioTip}>💡 Este beneficio adicional no consume el límite individual de 1.500 € del aportante.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre planes de pensiones</h3>
        <div className={styles.faqItem}>
          <strong>¿Cuándo puedo rescatar el plan de pensiones?</strong>
          <p>En jubilación, incapacidad permanente total o gran invalidez, fallecimiento, dependencia severa, enfermedad grave y desempleo de larga duración. Desde 2025, también las aportaciones con más de 10 años de antigüedad.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo tributa el rescate del plan?</strong>
          <p>Como rendimiento del trabajo en IRPF, al tipo marginal que corresponda según el total de ingresos ese año. Si se rescata en forma de capital, puede ser conveniente hacerlo en un año con pocos ingresos.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Es mejor rescatar en capital o en renta?</strong>
          <p>Depende de la situación fiscal. En capital en un año completo puede disparar el tramo marginal. La renta mensual distribuye la tributación y suele ser más eficiente fiscalmente a largo plazo.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo cambiar de plan de pensiones?</strong>
          <p>Sí, el traspaso entre planes de pensiones es libre, gratuito y sin coste fiscal. No genera tributación en el momento del traspaso.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué pasa con el plan si fallezco?</strong>
          <p>Los derechos consolidados pasan a los beneficiarios designados o herederos legales. Tributan como rendimiento del trabajo para el perceptor en el año del cobro.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué rentabilidad tienen los planes de pensiones?</strong>
          <p>Variable según el tipo de fondo (renta fija, mixta, variable). Históricamente los planes de renta variable a largo plazo han rendido 4-7% anual, pero sin garantías.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué son las comisiones de gestión y depósito?</strong>
          <p>Son gastos anuales del plan: gestión (máx 1,5% para renta variable) y depósito (máx 0,25%). Comisiones altas pueden mermar significativamente la rentabilidad a largo plazo.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Los planes de pensiones tienen garantía estatal?</strong>
          <p>No tienen garantía estatal de capital. En caso de quiebra de la gestora, los activos del plan están separados y protegidos. No cuentan con el Fondo de Garantía de Depósitos.</p>
          <div className={styles.faqTip}>💡 Elegir gestoras solventes y diversificar entre varios planes reduce el riesgo.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo elegir y gestionar tu plan de pensiones</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Define tu horizonte temporal</strong>
            <p>Si te quedan más de 20 años para jubilarte, puedes asumir más riesgo (renta variable). Con menos de 5 años, conviene ir a perfiles más conservadores.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Compara comisiones de gestión</strong>
            <p>Una diferencia del 1% en comisiones puede suponer el 20-25% menos de capital a 30 años. Busca planes indexados con comisiones bajas (&lt;0,5%).</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Calcula tu deducción fiscal exacta</strong>
            <p>Consulta tu tipo marginal de IRPF. Multiplica por el importe a aportar. Ese es el ahorro fiscal real que recibirás en la declaración del año siguiente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Automatiza aportaciones mensuales</strong>
            <p>Es mejor aportar mensualmente que de golpe al final del año. El &quot;coste promedio&quot; reduce el riesgo de invertir en el peor momento del mercado.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Revisa el perfil de riesgo cada 5 años</strong>
            <p>A medida que te acercas a la jubilación, reduce progresivamente el peso en renta variable y aumenta en renta fija o garantizada.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Planifica la estrategia de rescate</strong>
            <p>Decide con años de antelación si rescatarás en capital, renta o mixto. Consulta con un asesor fiscal para optimizar la tributación.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📊</div>
          <strong>Maximiza el plan de empresa primero</strong>
          <p>Si tu empresa tiene plan de empleo con aportación empresarial, aprovéchalo al máximo antes de contratar un plan individual.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💸</div>
          <strong>Reinvierte la devolución fiscal</strong>
          <p>La devolución de IRPF por el plan de pensiones debería reinvertirse en el propio plan o en fondos complementarios para maximizar el efecto compuesto.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🔄</div>
          <strong>Traspasa sin miedo</strong>
          <p>Si tu plan actual tiene altas comisiones o mal rendimiento, traspásalo a uno mejor. Es gratis y no tiene impacto fiscal inmediato.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🎯</div>
          <strong>Aporta más en años de mayores ingresos</strong>
          <p>El ahorro fiscal es mayor cuando el tipo marginal es más alto. En años de bonus, extra o incrementos, aportar más al plan multiplica el beneficio.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📅</div>
          <strong>No esperes a diciembre</strong>
          <p>Aportar en enero permite que el dinero esté invertido todo el año. No dejes para diciembre lo que puedes aportar en enero.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>👨‍👩‍👧</div>
          <strong>Nombra beneficiarios</strong>
          <p>Designa beneficiarios expresamente en el plan. En caso de fallecimiento, esto agiliza la gestión y permite que los derechos lleguen a quien corresponde.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes con los planes de pensiones</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Rescatar el plan completo en el año de jubilación</strong>: Puede disparar el tipo marginal de IRPF al 45-47% por acumulación de ingresos. El rescate en renta suele ser más eficiente.</li>
          <li><strong>No comparar comisiones antes de contratar</strong>: Diferencias de 1-1,5% en comisiones anuales suponen decenas de miles de euros menos a 30 años.</li>
          <li><strong>Pensar que no es accesible antes de jubilarse</strong>: Desde 2025, las aportaciones con más de 10 años pueden rescatarse libremente, dando más flexibilidad.</li>
          <li><strong>Aportar sin saber el tipo marginal</strong>: Si tu tipo marginal es bajo (19-24%), la ventaja fiscal del plan puede no compensar su iliquidez frente a fondos de inversión.</li>
          <li><strong>Ignorar el plan de empleo de la empresa</strong>: Es uno de los beneficios fiscales más rentables y muchos trabajadores no lo aprovechan o desconocen su existencia.</li>
          <li><strong>No actualizar la asignación de activos</strong>: Mantener un perfil muy agresivo cuando se está a 2-3 años de jubilarse puede suponer pérdidas significativas en el peor momento.</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-plan-pensiones')} />
      <ShareCard appName="orientador-plan-pensiones" />
      <Footer appName="orientador-plan-pensiones" />
    </div>
  );
}
