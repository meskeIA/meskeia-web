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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-plan-pensiones')} />
      <ShareCard appName="orientador-plan-pensiones" />
      <Footer appName="orientador-plan-pensiones" />
    </div>
  );
}
