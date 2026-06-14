'use client';

import { useState } from 'react';
import styles from './EstimadorIrpfPensionista.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TramoEdad = 'menos65' | '65_74' | '75_mas';

interface ResultadoIrpfPensionista {
  rendimientosIntegros: number;
  gastosDeducibles: number;
  rendimientosNetos: number;
  reduccionRRT: number;
  rendimientosNetosReducidos: number;
  minimoPersonal: number;
  baseImponible: number;
  cuotaBase: number;
  cuotaMinimo: number;
  cuotaIRPF: number;
  tipoEfectivo: number;
  pensionNetaMensual: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularCuotaIRPF(base: number): number {
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= anterior) break;
    const enTramo = Math.min(base, tramo.hasta) - anterior;
    cuota += enTramo * tramo.tipo / 100;
    anterior = tramo.hasta;
  }
  return cuota;
}

function calcularReduccionRRT(rnt: number): number {
  const { limite1, reduccion1, limite2, reduccion2, factorInterpolacion } = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= limite1) return reduccion1;
  if (rnt >= limite2) return reduccion2;
  return reduccion1 - factorInterpolacion * (rnt - limite1);
}

function minimoPersonalPorEdad(tramo: TramoEdad): number {
  if (tramo === '75_mas') return MINIMOS_IRPF_2025.personal_75;
  if (tramo === '65_74') return MINIMOS_IRPF_2025.personal_65;
  return MINIMOS_IRPF_2025.personal;
}

function estimarIrpfPensionista(
  pensionMensual: number,
  rescatePP: number,
  otrosIngresos: number,
  tramo: TramoEdad
): ResultadoIrpfPensionista {
  // Pensión con 14 pagas para cálculo anual IRPF
  const pensionAnual = pensionMensual * 14;
  const rendimientosIntegros = pensionAnual + rescatePP + otrosIngresos;

  // Gastos deducibles generales
  const gastosDeducibles = GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral;

  // Rendimientos netos del trabajo
  const rendimientosNetos = Math.max(0, rendimientosIntegros - gastosDeducibles);

  // Reducción por rendimientos del trabajo (si son los únicos ingresos relevantes)
  const reduccionRRT = calcularReduccionRRT(rendimientosNetos);

  // Rendimientos netos reducidos = base imponible aproximada
  const rendimientosNetosReducidos = Math.max(0, rendimientosNetos - reduccionRRT);

  // Mínimo personal según edad
  const minimoPersonal = minimoPersonalPorEdad(tramo);

  // Base imponible
  const baseImponible = rendimientosNetosReducidos;

  // Cuota íntegra sobre base - cuota sobre mínimo personal
  const cuotaBase = calcularCuotaIRPF(baseImponible);
  const cuotaMinimo = calcularCuotaIRPF(minimoPersonal);
  const cuotaIRPF = Math.max(0, cuotaBase - cuotaMinimo);

  const tipoEfectivo = rendimientosIntegros > 0 ? (cuotaIRPF / rendimientosIntegros) * 100 : 0;

  // Pensión neta mensual (resta el IRPF anual dividido por 14 pagas)
  const irpfMensual = cuotaIRPF / 14;
  const pensionNetaMensual = Math.max(0, pensionMensual - irpfMensual);

  return {
    rendimientosIntegros,
    gastosDeducibles,
    rendimientosNetos,
    reduccionRRT,
    rendimientosNetosReducidos,
    minimoPersonal,
    baseImponible,
    cuotaBase,
    cuotaMinimo,
    cuotaIRPF,
    tipoEfectivo,
    pensionNetaMensual,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorIrpfPensionista() {
  const [pensionMensual, setPensionMensual] = useState('');
  const [rescatePP, setRescatePP] = useState('0');
  const [otrosIngresos, setOtrosIngresos] = useState('0');
  const [tramo, setTramo] = useState<TramoEdad>('65_74');
  const [resultado, setResultado] = useState<ResultadoIrpfPensionista | null>(null);
  const [error, setError] = useState('');

  function calcular() {
    setError('');
    const pension = parseFloat(pensionMensual.replace(',', '.'));
    const rescate = parseFloat(rescatePP.replace(',', '.')) || 0;
    const otros = parseFloat(otrosIngresos.replace(',', '.')) || 0;

    if (isNaN(pension) || pension < 100 || pension > 10000) { setError('Introduce tu pensión mensual bruta (entre 100 y 10.000 €).'); return; }
    if (rescate < 0 || rescate > 500000) { setError('El rescate de plan de pensiones debe estar entre 0 y 500.000 €.'); return; }
    if (otros < 0 || otros > 100000) { setError('Los otros ingresos anuales deben estar entre 0 y 100.000 €.'); return; }

    setResultado(estimarIrpfPensionista(pension, rescate, otros, tramo));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Estimador IRPF Pensionista</h1>
        <p className={styles.subtitle}>Cuánto pagas de renta siendo jubilado y cuál es tu pensión neta real · 2026</p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Esta herramienta es SOLO orientativa. El IRPF real depende de toda tu situación personal, familiar y de las deducciones autonómicas.
          <br /><strong>No es</strong> asesoramiento fiscal personalizado ni sustituye a la declaración de la renta.
          <br />Los cálculos aplican tramos estatales + autonómicos medios. Cada comunidad autónoma puede tener variaciones. Datos IRPF {FISCAL_IRPF_META.vigencia}.
          <br /><strong>Consulta con la Agencia Tributaria o un asesor fiscal</strong> antes de tomar decisiones.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <DataReference
        normativa={`IRPF ${FISCAL_IRPF_META.vigencia}`}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
        nota={FISCAL_IRPF_META.nota}
      />

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tus datos</h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tramoEdad">Tu edad</label>
            <select
              id="tramoEdad"
              className={styles.select}
              value={tramo}
              onChange={e => setTramo(e.target.value as TramoEdad)}
            >
              <option value="menos65">Menos de 65 años</option>
              <option value="65_74">Entre 65 y 74 años</option>
              <option value="75_mas">75 años o más</option>
            </select>
            <p className={styles.hint}>
              {tramo === '75_mas'
                ? `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal_75)}`
                : tramo === '65_74'
                  ? `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal_65)}`
                  : `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal)}`}
            </p>
          </div>

          <NumberInput
            value={pensionMensual}
            onChange={setPensionMensual}
            label="Pensión mensual bruta (€/mes)"
            placeholder="Ej: 1.400"
            helperText="El importe bruto mensual que recibes de la Seguridad Social (antes de IRPF)."
            min={100}
            max={10000}
          />

          <NumberInput
            value={rescatePP}
            onChange={setRescatePP}
            label="Rescate de plan de pensiones este año (€)"
            placeholder="0"
            helperText="Si rescatas un plan de pensiones, se suma como rendimiento del trabajo. Pon 0 si no aplica."
            min={0}
            max={500000}
          />

          <NumberInput
            value={otrosIngresos}
            onChange={setOtrosIngresos}
            label="Otros ingresos anuales sujetos a IRPF (€/año)"
            placeholder="0"
            helperText="Alquileres, trabajo parcial, pensión de viudedad u otros. Pon 0 si no aplica."
            min={0}
            max={100000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Estimar IRPF pensionista">
            Estimar mi IRPF como pensionista
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estimación orientativa IRPF</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa el botón para estimar tu IRPF como pensionista.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Rendimientos íntegros totales (anuales)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.rendimientosIntegros)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Gastos deducibles generales</span>
                <span className={styles.resultValue}>-{formatCurrency(resultado.gastosDeducibles)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Reducción por rendimientos del trabajo</span>
                <span className={styles.resultValue}>-{formatCurrency(resultado.reduccionRRT)}</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>Base imponible estimada</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.baseImponible)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Mínimo personal (edad)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.minimoPersonal)}</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Cuota IRPF estimada anual</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.cuotaIRPF)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Tipo efectivo estimado</span>
                <span className={styles.resultValue}>{formatNumber(resultado.tipoEfectivo, 1)}%</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                <span className={styles.resultLabel}>Pensión neta mensual estimada</span>
                <span className={styles.resultValueBig}>{formatCurrency(resultado.pensionNetaMensual)}/mes</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo tributa la pensión en el IRPF?" subtitle="Rendimientos del trabajo, reducciones y mínimos para jubilados · 2026">
        <p>La pensión pública de jubilación tributa como <strong>rendimiento del trabajo</strong>, igual que un salario. Sin embargo, los pensionistas tienen ventajas fiscales específicas que reducen su factura.</p>
        <h3>Reducción por rendimientos del trabajo</h3>
        <p>Si tus únicos ingresos son la pensión, aplica una reducción en función de tu renta neta:</p>
        <ul>
          <li>Renta neta ≤ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)}: reducción de {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)}</li>
          <li>Entre {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} y {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: reducción proporcional</li>
          <li>Renta neta &gt; {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: reducción de {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion2)}</li>
        </ul>
        <h3>Mínimo personal por edad</h3>
        <p>El mínimo personal genera una deducción efectiva sobre la cuota:</p>
        <ul>
          <li>General (hasta 65 años): {formatCurrency(MINIMOS_IRPF_2025.personal)}</li>
          <li>De 65 a 74 años: {formatCurrency(MINIMOS_IRPF_2025.personal_65)}</li>
          <li>75 años o más: {formatCurrency(MINIMOS_IRPF_2025.personal_75)}</li>
        </ul>
        <h3>Rescate del plan de pensiones</h3>
        <p>El rescate se suma íntegramente a los rendimientos del trabajo. Un rescate grande en forma de capital puede subir tu tipo marginal significativamente. Generalmente conviene rescatar en renta mensual para suavizar el impacto fiscal.</p>
        <h3>¿Quién está obligado a declarar?</h3>
        <p>Los pensionistas con única fuente de ingresos y pensión inferior a 22.000 €/año no están obligados a presentar declaración (salvo que tengan otras fuentes). Con varios pagadores, el límite baja a 15.000 €/año.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Reducciones y mínimos aplicables a pensionistas (2026)</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Importe</th>
              <th>Condición</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Reducción rendimientos trabajo (general)</td>
              <td>6.498 € (renta ≤13.115 €)</td>
              <td>Todos los trabajadores/pensionistas</td>
            </tr>
            <tr>
              <td>Mínimo personal general</td>
              <td>5.550 €</td>
              <td>Todos los contribuyentes</td>
            </tr>
            <tr>
              <td>Mínimo por edad ≥65 años</td>
              <td>1.150 € adicionales (total 6.700 €)</td>
              <td>65 años o más a 31/12</td>
            </tr>
            <tr>
              <td>Mínimo por edad ≥75 años</td>
              <td>2.550 € adicionales (total 8.100 €)</td>
              <td>75 años o más a 31/12</td>
            </tr>
            <tr>
              <td>Límite obligación de declarar (un pagador)</td>
              <td>22.000 €</td>
              <td>Un solo pagador (pensión)</td>
            </tr>
            <tr>
              <td>Límite obligación de declarar (dos pagadores)</td>
              <td>15.000 € (si 2º pagador &gt;1.500 €)</td>
              <td>Pensión + otro pagador</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👴</span>
            <strong>Pensionista con pensión única</strong>
          </div>
          <p>68 años, pensión de 19.000 €/año. Un solo pagador. Reducción rendimientos trabajo + mínimo por edad. Puede estar exento de declarar o con cuota mínima.</p>
          <div className={styles.escenarioExample}>Base imponible: 19.000 - 5.565 (reducción) = 13.435 € → cuota reducida</div>
          <div className={styles.escenarioTip}>💡 Si la retención aplicada es exacta, puede no ser obligatorio declarar aunque conviene hacerlo para verificar.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👵</span>
            <strong>Pensionista con pensión + alquiler</strong>
          </div>
          <p>72 años, pensión 14.000 € + alquiler vivienda 6.000 €/año. Dos fuentes de ingreso. La renta del alquiler se integra en base general menos gastos deducibles.</p>
          <div className={styles.escenarioExample}>Total ingresos: 20.000 € → obligación de declarar (supera 22.000 € no aplica aquí)</div>
          <div className={styles.escenarioTip}>💡 El alquiler permite deducir gastos (IBI, comunidad, seguros, amortización) que reducen el rendimiento neto.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>💑</span>
            <strong>Matrimonio con dos pensiones</strong>
          </div>
          <p>Él cobra 18.000 €, ella 8.000 €. Cada uno tributa individualmente. Evaluar si declaración conjunta (3.400 € reducción extra) es más beneficiosa.</p>
          <div className={styles.escenarioExample}>Individual vs conjunto: depende de la diferencia entre pensiones y tramos aplicables</div>
          <div className={styles.escenarioTip}>💡 Generalmente la declaración conjunta beneficia cuando hay diferencia grande entre ingresos del matrimonio.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏦</span>
            <strong>Pensionista con plan de pensiones rescatado</strong>
          </div>
          <p>Rescata 30.000 € del plan en el año de jubilación. Esto se suma a la pensión pública como rendimiento del trabajo, puede disparar el tramo marginal.</p>
          <div className={styles.escenarioExample}>Pensión 15.000 € + rescate PP 30.000 € = 45.000 € → tramo marginal más alto</div>
          <div className={styles.escenarioTip}>💡 Rescatar el PP en años posteriores con menos ingresos puede ser fiscalmente más eficiente.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre el IRPF del pensionista</h3>
        <div className={styles.faqItem}>
          <strong>¿Las pensiones públicas siempre tributan?</strong>
          <p>Las pensiones del sistema público de SS tributan como rendimiento del trabajo. Existen exenciones totales solo para pensiones de incapacidad permanente absoluta o gran invalidez.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuándo estoy obligado a declarar siendo pensionista?</strong>
          <p>Si tienes un solo pagador (solo pensión pública): obligatorio si superas 22.000 €. Si tienes dos pagadores y el segundo supera 1.500 €: obligatorio si el total supera 15.000 €.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La pensión de viudedad también tributa?</strong>
          <p>Sí, la pensión de viudedad tributa como rendimiento del trabajo igual que la pensión de jubilación. Se suma al resto de ingresos del ejercicio.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo deducir gastos médicos como pensionista?</strong>
          <p>No existe deducción estatal general por gastos médicos. Algunas comunidades autónomas tienen deducciones específicas por enfermedad crónica, discapacidad o cuidados.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es el mínimo personal por edad?</strong>
          <p>Es una cantidad que no tributa para proteger la subsistencia del contribuyente mayor. A los 65 años: 6.700 €; a los 75 años: 8.100 €. Se aplica al calcular la cuota íntegra.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Conviene declarar aunque no esté obligado?</strong>
          <p>Sí puede convenir si la retención aplicada ha sido excesiva y puedes obtener devolución. También si tienes deducciones autonómicas o por inversión en vivienda habitual previa a 2013.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo afecta la discapacidad al IRPF del pensionista?</strong>
          <p>Con discapacidad ≥33%, hay reducciones y mínimos adicionales. Con ≥65% de discapacidad, la reducción por rendimientos trabajo puede elevarse a 7.750 €.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Pueden los hijos incluirme como ascendiente a cargo?</strong>
          <p>Sí, si convives con ellos, tienes más de 65 años (o cualquier edad con discapacidad ≥33%), y no obtienes rentas superiores a 8.000 € anuales, tus hijos pueden aplicar el mínimo por ascendientes.</p>
          <div className={styles.faqTip}>💡 En este caso tú no puedes presentar declaración conjunta con tus hijos, pero ellos sí pueden aplicar ese mínimo.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo preparar la declaración IRPF siendo pensionista</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Reúne los datos de la pensión</strong>
            <p>Solicita el certificado de retenciones al INSS (disponible en sede.seg-social.gob.es). Incluye el importe bruto anual y las retenciones practicadas.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Identifica todos tus ingresos</strong>
            <p>Pensión pública, pensión complementaria, rentas de alquiler, dividendos, intereses, rescate de planes de pensiones. Cada uno tributa según su categoría.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Verifica las reducciones aplicables</strong>
            <p>Reducción por rendimientos del trabajo según tu nivel de renta, mínimo personal por edad (65 o 75 años), mínimos familiares si proceden.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Revisa deducciones autonómicas</strong>
            <p>Cada CCAA tiene deducciones propias para mayores: gastos por cuidados, alquiler de vivienda, discapacidad, etc. Consulta las de tu comunidad.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Compara individual vs conjunta</strong>
            <p>Si estás casado, usa el simulador de la AEAT para ver cuál modalidad resulta más favorable. La diferencia puede ser de varios cientos de euros.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Presenta antes del 30 de junio</strong>
            <p>El plazo es del 2 de abril al 30 de junio. Si sale a pagar y domicilias el pago, puedes presentar hasta el 25 de junio. Las prórrogas son muy limitadas.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📋</div>
          <strong>Solicita el certificado de retenciones en enero</strong>
          <p>El INSS lo envía automáticamente, pero puedes descargarlo en la web de SS. Tenerlo pronto facilita la preparación de la declaración.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🔍</div>
          <strong>Revisa el borrador con atención</strong>
          <p>El borrador de la AEAT puede no incluir todas tus deducciones autonómicas o el mínimo por edad correcto. Siempre verificar antes de confirmar.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💰</div>
          <strong>Ajusta la retención de la pensión</strong>
          <p>Si año tras año tienes retenciones en exceso o insuficientes, solicita al INSS el cambio del porcentaje de retención para cuadrar mejor.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🏠</div>
          <strong>Aprovecha deducciones por alquiler</strong>
          <p>Si alquilas tu vivienda habitual (siendo mayor), las deducciones por gastos pueden reducir significativamente el rendimiento neto del capital inmobiliario.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>👨‍👩‍👧</div>
          <strong>Coordina con la familia</strong>
          <p>Si un hijo te cuida o convives con él, puede aplicar el mínimo por ascendientes. Pero entonces tú no puedes declarar conjuntamente con tus hijos ni obtener esa deducción.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📊</div>
          <strong>Planifica el rescate del plan de pensiones</strong>
          <p>No rescates el plan en el mismo año de jubilación si recibes alta pensión. Rescatarlo al año siguiente o en forma de renta minimiza la tributación.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes en el IRPF del pensionista</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Confirmar el borrador sin revisar</strong>: El borrador puede tener errores en mínimos por edad, deducciones autonómicas o tratamiento de otros ingresos. Siempre revisar antes de confirmar.</li>
          <li><strong>No declarar pensiones del extranjero</strong>: Las pensiones de sistemas públicos extranjeros también tributan en España (convenios de doble imposición aparte). No declararlas es un error grave.</li>
          <li><strong>Olvidar que la pensión de viudedad también tributa</strong>: Muchos pensionistas con viudedad olvidan incluirla, lo que puede generar liquidaciones de la AEAT.</li>
          <li><strong>Rescatar el plan de pensiones en el año de jubilación</strong>: Ese año ya hay ingresos altos (últimas nóminas + pensión). Añadir el rescate del PP puede doblar la factura fiscal.</li>
          <li><strong>No aprovechar deducciones autonómicas</strong>: Muchas CCAA tienen deducciones específicas para mayores que no aparecen en el borrador automáticamente.</li>
          <li><strong>Desconocer el límite de 15.000 € con dos pagadores</strong>: Si la pensión y un segundo ingreso superan este umbral, hay obligación de declarar aunque cada uno por separado esté por debajo del límite.</li>
        </ul>
      </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-irpf-pensionista')} />
      <ShareCard appName="estimador-irpf-pensionista" />
      <Footer appName="estimador-irpf-pensionista" />
    </div>
  );
}
