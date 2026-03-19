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

      <DisclaimerCard variant="financial"
        severity="critical">
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

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Instrumentos de ahorro para la jubilación</h3>
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
              <td>Deducción IRPF (hasta 30/47%)</td>
              <td>Baja (jubilación/incapacidad)</td>
            </tr>
            <tr>
              <td>Plan de pensiones empresa</td>
              <td>8.500 €/año adicionales</td>
              <td>Deducción IRPF empleado</td>
              <td>Baja (jubilación/incapacidad)</td>
            </tr>
            <tr>
              <td>PIAS (Plan Individual de Ahorro Sistemático)</td>
              <td>8.000 €/año (máx 240.000 total)</td>
              <td>Renta vitalicia exenta si &gt;10 años</td>
              <td>Media (rescate con pérdida fiscal)</td>
            </tr>
            <tr>
              <td>Fondos de inversión</td>
              <td>Sin límite</td>
              <td>Diferimiento de plusvalías (traspaso)</td>
              <td>Alta (venta en cualquier momento)</td>
            </tr>
            <tr>
              <td>Inmueble en alquiler</td>
              <td>Sin límite</td>
              <td>Deducciones gastos + amortización</td>
              <td>Muy baja (activo ilíquido)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🧑‍💼</span>
            <strong>30 años, empleado con IRPF alto</strong>
          </div>
          <p>Salario 45.000 €, cotización completa. La pensión cubrirá ~65% del sueldo. Brecha de ~15.750 €/año a cubrir con ahorro privado.</p>
          <div className={styles.escenarioExample}>Estrategia: Plan pensiones empresa + fondos indexados para 35 años</div>
          <div className={styles.escenarioTip}>💡 Con 35 años hasta jubilarse, 300 €/mes a 5% anual acumula ~280.000 €.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👩‍⚕️</span>
            <strong>45 años, autónoma en sector sanitario</strong>
          </div>
          <p>Cotizaciones históricamente bajas en RETA. Pensión estimada muy por debajo del nivel de vida actual. Brecha grande y poco tiempo.</p>
          <div className={styles.escenarioExample}>Estrategia: PIAS + alquiler inmobiliario para complementar</div>
          <div className={styles.escenarioTip}>💡 Con 20 años, necesita ahorrar más agresivamente: ~600-900 €/mes dependiendo del gap.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👴</span>
            <strong>55 años, cercano a jubilación</strong>
          </div>
          <p>Poco tiempo para acumular capital. La brecha debe cubrirse con activos ya existentes o ajustando expectativas de gasto en jubilación.</p>
          <div className={styles.escenarioExample}>Estrategia: Maximizar plan de empresa + optimizar hipoteca cancelada</div>
          <div className={styles.escenarioTip}>💡 Revisar si tiene PP antiguos olvidados; consolidarlos puede mejorar la gestión.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👩‍🏫</span>
            <strong>40 años, funcionaria con pensión alta estimada</strong>
          </div>
          <p>Con 30 años cotizados a buen salario, la pensión puede acercarse al máximo. Brecha pequeña pero conviene tener colchón para imprevistos.</p>
          <div className={styles.escenarioExample}>Estrategia: Fondos indexados de bajo coste para emergencias y mejoras</div>
          <div className={styles.escenarioTip}>💡 Con pensión cercana al máximo, el objetivo es flexibilidad, no cobertura obligatoria.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre la brecha de jubilación</h3>
        <div className={styles.faqItem}>
          <strong>¿Qué es exactamente la brecha de jubilación?</strong>
          <p>Es la diferencia entre tu último salario y la pensión pública que recibirás. Por ejemplo, si cobras 3.000 €/mes y tu pensión será 1.800 €, la brecha es 1.200 €/mes.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo se calcula la tasa de sustitución?</strong>
          <p>Es la pensión dividida entre el último salario, expresada en porcentaje. En España ronda el 70-80% para carreras completas, pero va descendiendo con las reformas.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuánto capital necesito para cubrir la brecha?</strong>
          <p>Multiplica la brecha mensual por 12 (anual) y divide entre el rendimiento esperado de tu cartera. Con una brecha de 1.000 €/mes y rendimiento del 4%, necesitas ~300.000 €.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Es mejor plan de pensiones o fondos de inversión?</strong>
          <p>Depende de tu tramo marginal de IRPF. Con tramos altos (45-47%), el plan de pensiones es muy ventajoso. Con tramos bajos, la flexibilidad de los fondos puede ser preferible.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿El ahorro privado tributa al jubilarse?</strong>
          <p>Los planes de pensiones tributan como renta del trabajo al rescate (19-47%). Los fondos de inversión tributan como renta del ahorro (19-28%). La diferencia fiscal es importante.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuándo es demasiado tarde para empezar a ahorrar?</strong>
          <p>Nunca, pero cuanto más tarde se empieza, más hay que aportar mensualmente. Empezar a los 50 puede requerir 3-4 veces más aportación mensual que empezar a los 30.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La inflación afecta al cálculo de la brecha?</strong>
          <p>Sí, considerablemente. Las pensiones se revalorizan con IPC, pero el coste de vida también sube. El cálculo debe incluir rendimientos reales (nominales menos inflación).</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué horizonte temporal usar para el cálculo?</strong>
          <p>La esperanza de vida en España supera los 83 años. Si te jubilas a los 67, debes planificar al menos 20-25 años de pensión y gastos en jubilación.</p>
          <div className={styles.faqTip}>💡 Planificar para 30 años da margen de seguridad frente a la longevidad.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo calcular y cubrir tu brecha de jubilación</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Estima tu pensión pública futura</strong>
            <p>Obtén tu vida laboral y usa el estimador de pensión pública de meskeIA para calcular cuánto recibirás aproximadamente del sistema público.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Define tu nivel de vida objetivo en jubilación</strong>
            <p>Estima cuánto dinero mensual necesitas para vivir cómodamente. Suele ser el 70-80% del último salario, aunque varía según estilo de vida.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Calcula la brecha</strong>
            <p>Resta la pensión estimada de tu objetivo de gasto. El resultado es la brecha mensual que el ahorro privado debe cubrir.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Determina el capital necesario</strong>
            <p>Multiplica la brecha anual por los años de jubilación esperados (20-30 años). Ajusta con un rendimiento esperado del capital invertido (3-5%).</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Elige los instrumentos de ahorro adecuados</strong>
            <p>Combina planes de pensiones (ventaja fiscal), fondos indexados (flexibilidad) y si es posible, inmuebles o PIAS según tu perfil y tiempo disponible.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Revisa y ajusta anualmente</strong>
            <p>La situación cambia: aumentos de sueldo, cambios legislativos, evolución de mercados. Revisa el plan cada año y ajusta las aportaciones.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📅</div>
          <strong>Empieza cuanto antes</strong>
          <p>El interés compuesto es tu mejor aliado. Empezar 10 años antes puede duplicar el capital acumulado con la misma aportación mensual.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🎯</div>
          <strong>Automatiza las aportaciones</strong>
          <p>Configura una transferencia automática mensual para ahorro jubilación. Lo que no ves, no lo gastas. Aumenta el importe con cada subida de sueldo.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🌍</div>
          <strong>Diversifica geográficamente</strong>
          <p>No concentres todo el ahorro en activos españoles. Los fondos indexados globales reducen el riesgo de concentración en un solo mercado.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📊</div>
          <strong>Reduce comisiones de gestión</strong>
          <p>Una diferencia del 1% en comisiones anuales puede suponer más del 20% menos de capital a 30 años. Elige fondos indexados de bajo coste.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🏦</div>
          <strong>Aprovecha el plan de empresa</strong>
          <p>Si tu empresa ofrece plan de pensiones con aportación empresarial, maximiza siempre esa ventaja: es remuneración diferida con ventaja fiscal.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📉</div>
          <strong>No rescates el ahorro antes de tiempo</strong>
          <p>Romper el plan de pensiones antes de la jubilación (salvo supuestos legales) implica tributar como renta del trabajo en el peor momento fiscal.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes al planificar la brecha de jubilación</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>No calcular la brecha hasta los 50-55 años</strong>: Cuando se calcula tarde, la brecha es enorme y el tiempo para cubrirla muy corto.</li>
          <li><strong>Confiar solo en la pensión pública</strong>: La tasa de sustitución media bajará en las próximas décadas. Depender exclusivamente del Estado aumenta el riesgo.</li>
          <li><strong>Ignorar la inflación</strong>: 1.500 € hoy no tendrán el mismo poder adquisitivo dentro de 30 años. El cálculo debe incluir inflación real.</li>
          <li><strong>Rescatar el plan de pensiones como capital único</strong>: Hacerlo en un solo año puede disparar el tipo marginal de IRPF. El rescate en forma de renta es generalmente más eficiente.</li>
          <li><strong>No diversificar los instrumentos</strong>: Poner todo en planes de pensiones limita la liquidez. Un mix con fondos, PIAS o inmuebles da más flexibilidad.</li>
          <li><strong>Sobreestimar la rentabilidad esperada</strong>: Calcular con un 8-10% de rendimiento esperado puede llevar a ahorrar menos de lo necesario. Usa estimaciones conservadoras (3-5%).</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-brecha-jubilacion')} />
      <ShareCard appName="estimador-brecha-jubilacion" />
      <Footer appName="estimador-brecha-jubilacion" />
    </div>
  );
}
