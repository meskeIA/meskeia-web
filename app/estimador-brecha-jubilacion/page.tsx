'use client';

import { useState } from 'react';
import styles from './EstimadorBrechaJubilacion.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ResultadoBrecha {
  brechaMensual: number;
  brechaAnual: number;
  brechaAcumulada20: number;
  porcentajePensionSobreSueldo: number;
  ahorroMensualNecesario: number;
  capitalNecesario: number;
  anosHastaJubilacion: number;
  tienBrecha: boolean;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

/**
 * Ahorro mensual necesario para acumular un capital en N años,
 * asumiendo rentabilidad anual r (interés compuesto).
 */
function calcularAhorroMensual(capital: number, anosAhorro: number, rentabilidadAnual: number): number {
  if (anosAhorro <= 0) return capital;
  const r = rentabilidadAnual / 100 / 12;
  const n = anosAhorro * 12;
  if (r === 0) return capital / n;
  // PMT = FV × r / ((1+r)^n - 1)
  return (capital * r) / (Math.pow(1 + r, n) - 1);
}

function calcularBrecha(
  sueldoNetoMensual: number,
  pensionEstimadaMensual: number,
  edadActual: number,
  edadJubilacion: number,
  anosJubilado: number,
  rentabilidadAnual: number
): ResultadoBrecha {
  const brechaMensual = Math.max(0, sueldoNetoMensual - pensionEstimadaMensual);
  const brechaAnual = brechaMensual * 12;
  const brechaAcumulada20 = brechaMensual * 12 * anosJubilado;
  const porcentaje = (pensionEstimadaMensual / sueldoNetoMensual) * 100;
  const anosHastaJubilacion = Math.max(0, edadJubilacion - edadActual);

  // Capital necesario para cubrir la brecha durante los años de jubilación
  // (simplificado: sin inflación, a valor actual)
  const capitalNecesario = brechaMensual * 12 * anosJubilado;
  const ahorroMensual = calcularAhorroMensual(capitalNecesario, anosHastaJubilacion, rentabilidadAnual);

  return {
    brechaMensual,
    brechaAnual,
    brechaAcumulada20: brechaAcumulada20,
    porcentajePensionSobreSueldo: porcentaje,
    ahorroMensualNecesario: Math.max(0, ahorroMensual),
    capitalNecesario,
    anosHastaJubilacion,
    tienBrecha: brechaMensual > 0,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorBrechaJubilacion() {
  const [sueldoNeto, setSueldoNeto] = useState('');
  const [pensionEstimada, setPensionEstimada] = useState('');
  const [edadActual, setEdadActual] = useState('');
  const [edadJubilacion, setEdadJubilacion] = useState('67');
  const [anosJubilado, setAnosJubilado] = useState('20');
  const [rentabilidad, setRentabilidad] = useState('3');
  const [resultado, setResultado] = useState<ResultadoBrecha | null>(null);
  const [error, setError] = useState('');

  function calcular() {
    setError('');
    const sueldo = parseFloat(sueldoNeto.replace(',', '.'));
    const pension = parseFloat(pensionEstimada.replace(',', '.'));
    const edad = parseInt(edadActual);
    const edadJub = parseInt(edadJubilacion);
    const anos = parseInt(anosJubilado);
    const rent = parseFloat(rentabilidad.replace(',', '.'));

    if (isNaN(sueldo) || sueldo <= 0) { setError('Introduce tu sueldo neto mensual actual.'); return; }
    if (isNaN(pension) || pension <= 0) { setError('Introduce la pensión estimada mensual.'); return; }
    if (isNaN(edad) || edad < 20 || edad > 70) { setError('Introduce tu edad actual (entre 20 y 70).'); return; }
    if (isNaN(edadJub) || edadJub <= edad) { setError('La edad de jubilación debe ser mayor que tu edad actual.'); return; }
    if (isNaN(anos) || anos < 1 || anos > 40) { setError('Introduce los años previstos de jubilación (entre 1 y 40).'); return; }

    setResultado(calcularBrecha(sueldo, pension, edad, edadJub, anos, rent));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📉</span>
        <h1 className={styles.title}>Estimador de Brecha de Jubilación</h1>
        <p className={styles.subtitle}>Descubre cuánto perderás al jubilarte y cuánto necesitas ahorrar</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Esta herramienta es SOLO orientativa e informativa.
          <br /><strong>No es</strong> asesoramiento financiero ni previsional personalizado.
          <br />Los cálculos son estimaciones simplificadas que no incluyen inflación, evolución salarial ni cambios legislativos futuros.
          <br /><strong>TÚ ERES RESPONSABLE</strong> de verificar esta información con un asesor financiero o previsional cualificado antes de tomar decisiones.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tus datos</h2>

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
            helperText="Obtenla del Estimador de Pensión Pública o del simulador oficial de la SS."
            min={100}
            max={10000}
          />

          <NumberInput
            value={edadActual}
            onChange={setEdadActual}
            label="Edad actual"
            placeholder="Ej: 45"
            min={20}
            max={70}
          />

          <NumberInput
            value={edadJubilacion}
            onChange={setEdadJubilacion}
            label="Edad prevista de jubilación"
            placeholder="67"
            min={60}
            max={75}
          />

          <NumberInput
            value={anosJubilado}
            onChange={setAnosJubilado}
            label="Años de jubilación previstos"
            placeholder="20"
            helperText="Expectativa de vida - edad de jubilación. Recomendado: 20-25 años."
            min={1}
            max={40}
          />

          <NumberInput
            value={rentabilidad}
            onChange={setRentabilidad}
            label="Rentabilidad anual esperada del ahorro (%)"
            placeholder="3"
            helperText="Conservador (depósitos): 2-3%. Moderado (fondos): 4-6%."
            min={0}
            max={15}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular brecha de jubilación">
            Calcular mi brecha
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu brecha de jubilación</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa &ldquo;Calcular mi brecha&rdquo; para ver los resultados.
            </p>
          ) : (
            <div className={styles.resultados}>
              {resultado.tienBrecha ? (
                <>
                  <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                    <span className={styles.resultLabel}>Brecha mensual</span>
                    <span className={styles.resultValueBig}>-{formatCurrency(resultado.brechaMensual)}</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Tu pensión cubre</span>
                    <span className={styles.resultValueDanger}>{formatNumber(resultado.porcentajePensionSobreSueldo, 1)}% de tu sueldo actual</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Brecha anual</span>
                    <span className={styles.resultValueDanger}>{formatCurrency(resultado.brechaAnual)}/año</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Brecha total en {anosJubilado} años de jubilación</span>
                    <span className={styles.resultValueDanger}>{formatCurrency(resultado.brechaAcumulada20)}</span>
                  </div>

                  {/* Barra visual */}
                  <div className={styles.brechaVisual}>
                    <div className={styles.barraLabel}>
                      <span>Pensión sobre sueldo actual</span>
                      <span>{formatNumber(resultado.porcentajePensionSobreSueldo, 1)}%</span>
                    </div>
                    <div
                      className={styles.barra}
                      role="progressbar"
                      aria-label={`Tu pensión cubre el ${formatNumber(resultado.porcentajePensionSobreSueldo, 1)}% de tu sueldo actual`}
                      aria-valuenow={Math.round(resultado.porcentajePensionSobreSueldo)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className={styles.barraFillPension}
                        style={{ width: `${Math.min(100, resultado.porcentajePensionSobreSueldo)}%` }} />
                    </div>
                  </div>

                  <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                    <span className={styles.resultLabel}>
                      Ahorro mensual estimado para cubrir la brecha
                      <br /><small>({resultado.anosHastaJubilacion} años de ahorro al {rentabilidad}% anual)</small>
                    </span>
                    <span className={styles.resultValuePositive}>{formatCurrency(resultado.ahorroMensualNecesario)}/mes</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Capital total a acumular</span>
                    <span className={styles.resultValue}>{formatCurrency(resultado.capitalNecesario)}</span>
                  </div>
                </>
              ) : (
                <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                  <span className={styles.resultLabel}>¡Tu pensión estimada supera o iguala tu sueldo actual!</span>
                  <span className={styles.resultValuePositive}>Sin brecha detectada</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Qué es la brecha de jubilación y por qué importa?" subtitle="Claves para planificar tu ahorro complementario">
        <p>La brecha de jubilación es la diferencia entre lo que ganas trabajando y lo que cobrarás cuando te jubiles. En España, la pensión media ronda el 70-80% del último salario, pero esa cifra varía mucho según el historial de cotización.</p>
        <h3>¿Cómo cubrir la brecha?</h3>
        <ul>
          <li><strong>Plan de pensiones</strong>: deducible en IRPF (hasta 1.500 €/año), pero con liquidez limitada hasta la jubilación.</li>
          <li><strong>Fondos de inversión</strong>: mayor liquidez, sin ventaja fiscal directa pero sin límite de aportación.</li>
          <li><strong>Inmuebles en alquiler</strong>: renta pasiva, pero requiere capital inicial y gestión.</li>
          <li><strong>Ahorro sistemático</strong>: el interés compuesto hace que empezar pronto sea más importante que el importe ahorrado.</li>
        </ul>
        <h3>El poder del tiempo</h3>
        <p>Ahorrar 200 €/mes durante 30 años al 4% genera más capital que ahorrar 400 €/mes durante 15 años al mismo tipo. Cuanto antes empieces, menor será el esfuerzo mensual.</p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-brecha-jubilacion')} />
      <ShareCard appName="estimador-brecha-jubilacion" />
      <Footer appName="estimador-brecha-jubilacion" />
    </div>
  );
}
