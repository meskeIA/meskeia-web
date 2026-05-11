'use client';

import { useState, useMemo } from 'react';
import styles from './OptimizadorRentas60.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
} from '@/data/fiscal/irpf';
import { TRAMOS_GANANCIAS_PATRIMONIALES_2025 } from '@/data/fiscal/inmuebles';
import { FISCAL_IRPF_META } from '@/data/fiscal';

// ─── Utilidades fiscales ───────────────────────────────────────────────────────

function calcularCuota(base: number, tramos: { hasta: number; tipo: number }[]): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let baseRestante = base;
  let tramoAnterior = 0;

  for (const tramo of tramos) {
    const anchoTramo = tramo.hasta - tramoAnterior;
    const baseEnTramo = Math.min(baseRestante, anchoTramo);
    cuota += (baseEnTramo * tramo.tipo) / 100;
    baseRestante -= baseEnTramo;
    tramoAnterior = tramo.hasta;
    if (baseRestante <= 0) break;
  }
  return cuota;
}

function calcularReduccionRRT(rnt: number): number {
  const r = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= r.limite1) return r.reduccion1;
  if (rnt >= r.limite2) return r.reduccion2;
  return r.reduccion1 - r.factorInterpolacion * (rnt - r.limite1);
}

function getMinimoPersonal(edad: number): number {
  if (edad >= 75) return MINIMOS_IRPF_2025.personal_75;
  if (edad >= 65) return MINIMOS_IRPF_2025.personal_65;
  return MINIMOS_IRPF_2025.personal;
}

function getTipoMarginal(baseGeneral: number): number {
  let acumulado = 0;
  let tipoMarginalActual = TRAMOS_IRPF_2025[0].tipo;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (baseGeneral <= tramo.hasta) {
      tipoMarginalActual = tramo.tipo;
      break;
    }
    acumulado = tramo.hasta;
    tipoMarginalActual = tramo.tipo;
  }
  void acumulado;
  return tipoMarginalActual;
}

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface Fuentes {
  pension: string;
  retiroPP: string;
  capitalMobiliario: string;
  alquilerNetoBruto: string;
  edad: string;
}

interface ResultadoIRPF {
  // Rendimientos
  pensionAnual: number;
  retiroPP: number;
  totalTrabajo: number;
  gastosDeducibles: number;
  reduccionRRT: number;
  rndNetoCuadrado: number; // Rendimiento neto del trabajo ajustado

  capitalMobiliario: number;
  alquilerNeto: number;
  reduccionAlquiler: number;
  alquilerLiquidable: number;

  // Bases
  baseGeneralBruta: number;
  minimoPersonal: number;
  baseGeneralLiquidable: number;
  baseAhorro: number;

  // Cuotas
  cuotaGeneral: number;
  cuotaMinimo: number; // cuota del mínimo personal (deducción)
  cuotaAhorro: number;
  cuotaTotal: number;

  // Análisis
  tipoEfectivo: number;
  tipoMarginal: number;
  tipoAhorroMarginal: number;
  recomendacion: string;
  recomendacionTipo: 'ok' | 'reducir-pp' | 'aumentar-pp' | 'neutro';
  edad: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function calcularIRPF(fuentes: Fuentes): ResultadoIRPF | null {
  const pension = parseFloat(fuentes.pension.replace(/\./g, '').replace(',', '.')) || 0;
  const retiroPP = parseFloat(fuentes.retiroPP.replace(/\./g, '').replace(',', '.')) || 0;
  const capitalMobiliario = parseFloat(fuentes.capitalMobiliario.replace(/\./g, '').replace(',', '.')) || 0;
  const alquilerNetoBruto = parseFloat(fuentes.alquilerNetoBruto.replace(/\./g, '').replace(',', '.')) || 0;
  const edad = parseInt(fuentes.edad) || 67;

  // ── Base general: rendimientos trabajo ──────────────────────────────────────
  const totalTrabajo = pension + retiroPP;
  const gastosDeducibles = totalTrabajo > 0 ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0;
  const rndNetoTrabajo = Math.max(0, totalTrabajo - gastosDeducibles);
  const reduccionRRT = totalTrabajo > 0 ? calcularReduccionRRT(rndNetoTrabajo) : 0;
  const rndNetoCuadrado = Math.max(0, rndNetoTrabajo - reduccionRRT);

  // ── Alquiler: reducción 50% arrendamiento inmobiliario (rendimiento capital inmobiliario)
  // Nota: la reducción del 60% solo aplica a vivienda habitual arrendada; para orientación usamos 50%
  const reduccionAlquiler = alquilerNetoBruto * 0.50;
  const alquilerLiquidable = alquilerNetoBruto - reduccionAlquiler;

  // ── Bases imponibles ────────────────────────────────────────────────────────
  const baseGeneralBruta = rndNetoCuadrado + alquilerLiquidable;
  const minimoPersonal = getMinimoPersonal(edad);
  const baseGeneralLiquidable = Math.max(0, baseGeneralBruta - minimoPersonal);
  const baseAhorro = capitalMobiliario;

  // ── Cuotas ──────────────────────────────────────────────────────────────────
  const cuotaGeneral = calcularCuota(baseGeneralLiquidable, TRAMOS_IRPF_2025);
  const cuotaMinimo = calcularCuota(minimoPersonal, TRAMOS_IRPF_2025); // El mínimo personal reduce la cuota
  const cuotaAhorro = calcularCuota(baseAhorro, TRAMOS_GANANCIAS_PATRIMONIALES_2025);

  // La cuota íntegra = cuota(base) - cuota(mínimo)
  // Para simplificar orientativamente: cuota total = cuota(base liquidable) + cuota ahorro
  const cuotaTotal = Math.max(0, cuotaGeneral) + cuotaAhorro;

  // ── Análisis de optimización ────────────────────────────────────────────────
  const ingresosBrutos = totalTrabajo + capitalMobiliario + alquilerNetoBruto;
  const tipoEfectivo = ingresosBrutos > 0 ? (cuotaTotal / ingresosBrutos) * 100 : 0;
  const tipoMarginal = getTipoMarginal(baseGeneralLiquidable);

  // Tipo marginal en la base del ahorro (€1 más de capital mobiliario)
  let tipoAhorroMarginal = 19;
  if (capitalMobiliario > 300000) tipoAhorroMarginal = 30;
  else if (capitalMobiliario > 200000) tipoAhorroMarginal = 27;
  else if (capitalMobiliario > 50000) tipoAhorroMarginal = 23;
  else if (capitalMobiliario > 6000) tipoAhorroMarginal = 21;

  // Recomendación de optimización
  let recomendacion: string;
  let recomendacionTipo: ResultadoIRPF['recomendacionTipo'];

  if (retiroPP === 0) {
    if (tipoMarginal <= tipoAhorroMarginal) {
      recomendacion = `Tu tipo marginal (${tipoMarginal}%) es igual o inferior al tipo del ahorro (${tipoAhorroMarginal}%). Podrías retirar del plan de pensiones sin incrementar tu tipo efectivo, siempre que el PP tributa como rendimiento del trabajo.`;
      recomendacionTipo = 'aumentar-pp';
    } else {
      recomendacion = `Tu tipo marginal en rendimientos del trabajo (${tipoMarginal}%) es superior al tipo marginal del ahorro (${tipoAhorroMarginal}%). Prioriza agotar primero el ahorro/fondos antes de retirar del plan de pensiones.`;
      recomendacionTipo = 'reducir-pp';
    }
  } else if (tipoMarginal > tipoAhorroMarginal + 5) {
    recomendacion = `Con tipo marginal del ${tipoMarginal}%, el plan de pensiones tributa más caro que el ahorro (${tipoAhorroMarginal}%). Considera reducir la retirada anual del PP y compensar con ahorro o fondos de inversión en su lugar.`;
    recomendacionTipo = 'reducir-pp';
  } else if (tipoMarginal < tipoAhorroMarginal) {
    recomendacion = `Tu tipo marginal (${tipoMarginal}%) es inferior al tipo del ahorro (${tipoAhorroMarginal}%). Tienes margen para retirar más del plan de pensiones sin pagar más que con el ahorro financiero.`;
    recomendacionTipo = 'aumentar-pp';
  } else {
    recomendacion = `Tu tipo marginal (${tipoMarginal}%) y el tipo del ahorro (${tipoAhorroMarginal}%) son similares. La diferencia fiscal entre fuentes es pequeña. Puedes priorizar según tus necesidades de liquidez.`;
    recomendacionTipo = 'neutro';
  }

  return {
    pensionAnual: pension,
    retiroPP,
    totalTrabajo,
    gastosDeducibles,
    reduccionRRT,
    rndNetoCuadrado,
    capitalMobiliario,
    alquilerNeto: alquilerNetoBruto,
    reduccionAlquiler,
    alquilerLiquidable,
    baseGeneralBruta,
    minimoPersonal,
    baseGeneralLiquidable,
    baseAhorro,
    cuotaGeneral,
    cuotaMinimo,
    cuotaAhorro,
    cuotaTotal,
    tipoEfectivo,
    tipoMarginal,
    tipoAhorroMarginal,
    recomendacion,
    recomendacionTipo,
    edad,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OptimizadorRentas60() {
  const [fuentes, setFuentes] = useState<Fuentes>({
    pension: '18000',
    retiroPP: '6000',
    capitalMobiliario: '3000',
    alquilerNetoBruto: '0',
    edad: '67',
  });

  const resultado = useMemo(() => {
    const hasDato = Object.values(fuentes).some(v => parseFloat(v.replace(/\./g, '').replace(',', '.')) > 0);
    if (!hasDato) return null;
    return calcularIRPF(fuentes);
  }, [fuentes]);

  function update(campo: keyof Fuentes) {
    return (val: string) => setFuentes(prev => ({ ...prev, [campo]: val }));
  }

  const recomendacionColor: Record<string, string> = {
    'ok': '#27AE60',
    'reducir-pp': '#E74C3C',
    'aumentar-pp': '#2E86AB',
    'neutro': '#E67E22',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Optimizador de Rentas 60+</h1>
        <p className={styles.subtitle}>Estrategia IRPF · Pensión · Plan de pensiones · Ahorro · Alquiler · España 2025</p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Esta herramienta es <strong>SOLO orientativa</strong>. El cálculo utiliza tipos estatales + autonómicos medios ponderados 2025 (Ley 35/2006 IRPF).
          <br />El IRPF real depende de la CCAA de residencia, deducciones personales/familiares, tratamiento de rentas irregulares y otras circunstancias individuales.
          <br /><strong>Consulta a un asesor fiscal</strong> antes de tomar decisiones de retirada de planes de pensiones o modificación de rentas.
          <br /><em>meskeIA no se responsabiliza de decisiones fiscales basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <DataReference
        normativa={FISCAL_IRPF_META.fuente}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
      />

      <div className={styles.mainContent}>
        {/* Formulario de fuentes de renta */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Fuentes de renta anuales</h2>
          <p className={styles.instruccion}>Introduce las cifras brutas anuales. Los resultados se actualizan automáticamente.</p>

          <div className={styles.fuenteSection}>
            <div className={styles.fuenteHeader}>
              <span aria-hidden="true">👷</span>
              <span className={styles.fuenteTitulo}>Rendimientos del trabajo</span>
              <span className={styles.fuenteBadge} style={{ background: '#2E86AB20', color: '#2E86AB' }}>Escala general</span>
            </div>
            <NumberInput
              value={fuentes.pension}
              onChange={update('pension')}
              label="Pensión pública SS (€/año brutos)"
              placeholder="18000"
              helperText="Pensión de jubilación de la Seguridad Social antes de retenciones."
            />
            <NumberInput
              value={fuentes.retiroPP}
              onChange={update('retiroPP')}
              label="Retirada del plan de pensiones (€/año)"
              placeholder="6000"
              helperText="Importe que retiras anualmente del plan. Tributa como rendimiento del trabajo, no del ahorro."
            />
          </div>

          <div className={styles.fuenteSection}>
            <div className={styles.fuenteHeader}>
              <span aria-hidden="true">💰</span>
              <span className={styles.fuenteTitulo}>Rendimientos del capital mobiliario</span>
              <span className={styles.fuenteBadge} style={{ background: '#48A9A620', color: '#48A9A6' }}>Escala ahorro 19-28%</span>
            </div>
            <NumberInput
              value={fuentes.capitalMobiliario}
              onChange={update('capitalMobiliario')}
              label="Intereses, dividendos y plusvalías de fondos (€/año)"
              placeholder="3000"
              helperText="Incluye: intereses de cuentas/depósitos, dividendos, ganancias de fondos de inversión y ETFs."
            />
          </div>

          <div className={styles.fuenteSection}>
            <div className={styles.fuenteHeader}>
              <span aria-hidden="true">🏠</span>
              <span className={styles.fuenteTitulo}>Alquiler de inmuebles</span>
              <span className={styles.fuenteBadge} style={{ background: '#E67E2220', color: '#E67E22' }}>Escala general − 50%</span>
            </div>
            <NumberInput
              value={fuentes.alquilerNetoBruto}
              onChange={update('alquilerNetoBruto')}
              label="Renta de alquiler bruta (€/año)"
              placeholder="0"
              helperText="Ingresos brutos por arrendamiento. Se aplica una reducción del 50% (orientativa; puede ser 60% para vivienda habitual arrendada o 0% para locales comerciales)."
            />
          </div>

          <div className={styles.fuenteSection}>
            <div className={styles.fuenteHeader}>
              <span aria-hidden="true">🎂</span>
              <span className={styles.fuenteTitulo}>Datos personales</span>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="edad">Edad</label>
              <select
                id="edad"
                className={styles.select}
                value={fuentes.edad}
                onChange={e => update('edad')(e.target.value)}
              >
                <option value="60">60-64 años</option>
                <option value="67">65-74 años</option>
                <option value="75">75 años o más</option>
              </select>
              <p className={styles.hint}>Determina el mínimo personal exento: 5.550€ (&lt;65), 6.700€ (65-74), 8.100€ (≥75).</p>
            </div>
          </div>
        </div>

        {/* Resultado */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Análisis fiscal orientativo</h2>

          {!resultado ? (
            <p className={styles.placeholder}>Introduce las fuentes de renta para ver el análisis fiscal en tiempo real.</p>
          ) : (
            <div className={styles.resultados}>
              {/* Recomendación destacada */}
              <div
                className={styles.recomendacionBox}
                style={{ borderColor: recomendacionColor[resultado.recomendacionTipo] }}
                role="status"
              >
                <span className={styles.recomendacionIcono} aria-hidden="true">
                  {resultado.recomendacionTipo === 'ok' ? '✅'
                    : resultado.recomendacionTipo === 'reducir-pp' ? '⚠️'
                    : resultado.recomendacionTipo === 'aumentar-pp' ? '💡'
                    : '⚖️'}
                </span>
                <p className={styles.recomendacionTexto}>{resultado.recomendacion}</p>
              </div>

              {/* KPIs principales */}
              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiValor}>{formatCurrency(resultado.cuotaTotal)}</span>
                  <span className={styles.kpiLabel}>IRPF estimado</span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiValor}>{formatNumber(resultado.tipoEfectivo, 1)}%</span>
                  <span className={styles.kpiLabel}>Tipo efectivo</span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiValor}>{resultado.tipoMarginal}%</span>
                  <span className={styles.kpiLabel}>Tipo marginal trabajo</span>
                </div>
                <div className={styles.kpiCard}>
                  <span className={styles.kpiValor}>{resultado.tipoAhorroMarginal}%</span>
                  <span className={styles.kpiLabel}>Tipo marginal ahorro</span>
                </div>
              </div>

              {/* Desglose bases */}
              <div className={styles.desgloseSection}>
                <div className={styles.desgloseTitle}>📋 Desglose de bases imponibles</div>

                <div className={styles.desgloseItem}>
                  <span>Rendimientos trabajo brutos</span>
                  <strong>{formatCurrency(resultado.totalTrabajo)}</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>− Gastos deducibles trabajo</span>
                  <span className={styles.descuento}>−{formatCurrency(resultado.gastosDeducibles)}</span>
                </div>
                <div className={styles.desgloseItem}>
                  <span>− Reducción rendimientos trabajo</span>
                  <span className={styles.descuento}>−{formatCurrency(resultado.reduccionRRT)}</span>
                </div>
                {resultado.alquilerNeto > 0 && (
                  <>
                    <div className={styles.desgloseItem}>
                      <span>+ Alquiler liquidable (−50%)</span>
                      <strong>{formatCurrency(resultado.alquilerLiquidable)}</strong>
                    </div>
                  </>
                )}
                <div className={`${styles.desgloseItem} ${styles.desgloseTotal}`}>
                  <span>Base general bruta</span>
                  <strong>{formatCurrency(resultado.baseGeneralBruta)}</strong>
                </div>
                <div className={styles.desgloseItem}>
                  <span>− Mínimo personal (edad {resultado.edad}+)</span>
                  <span className={styles.descuento}>−{formatCurrency(resultado.minimoPersonal)}</span>
                </div>
                <div className={`${styles.desgloseItem} ${styles.desgloseTotal}`}>
                  <span>Base general liquidable</span>
                  <strong>{formatCurrency(resultado.baseGeneralLiquidable)}</strong>
                </div>
                {resultado.capitalMobiliario > 0 && (
                  <div className={`${styles.desgloseItem} ${styles.desgloseAhorro}`}>
                    <span>Base del ahorro</span>
                    <strong>{formatCurrency(resultado.baseAhorro)}</strong>
                  </div>
                )}
              </div>

              {/* Desglose cuotas */}
              <div className={styles.desgloseSection}>
                <div className={styles.desgloseTitle}>💶 Desglose de cuotas</div>
                <div className={styles.desgloseItem}>
                  <span>Cuota base general</span>
                  <strong>{formatCurrency(resultado.cuotaGeneral)}</strong>
                </div>
                {resultado.capitalMobiliario > 0 && (
                  <div className={styles.desgloseItem}>
                    <span>Cuota base ahorro</span>
                    <strong>{formatCurrency(resultado.cuotaAhorro)}</strong>
                  </div>
                )}
                <div className={`${styles.desgloseItem} ${styles.desgloseTotal}`}>
                  <span>IRPF total estimado</span>
                  <strong>{formatCurrency(resultado.cuotaTotal)}</strong>
                </div>
                <div className={`${styles.desgloseItem} ${styles.desgloseTotal}`}>
                  <span>Renta neta estimada</span>
                  <strong>{formatCurrency(resultado.totalTrabajo + resultado.capitalMobiliario + resultado.alquilerNeto - resultado.cuotaTotal)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Por qué importa el orden de retirada en la jubilación?" subtitle="Estrategia fiscal para optimizar el IRPF con múltiples fuentes de renta">
        <p>Cuando te jubilas puedes tener varios tipos de renta: pensión pública, plan de pensiones, ahorro financiero (fondos, depósitos, dividendos) y quizás alquiler. Cada tipo tributa de forma diferente y en una escala distinta.</p>
        <h3>Las dos escalas del IRPF</h3>
        <ul>
          <li><strong>Escala general</strong> (progresiva, 19–47%): pensión pública, PP, alquiler neto. Se suman y el tipo marginal sube rápidamente.</li>
          <li><strong>Escala del ahorro</strong> (plana, 19–28%): intereses, dividendos, ganancias de fondos de inversión. Tributa aparte, con tipos menores a rentas altas.</li>
        </ul>
        <h3>El plan de pensiones: el problema de tributar como trabajo</h3>
        <p>El ahorro acumulado en un plan de pensiones <strong>tributa como rendimiento del trabajo</strong> cuando se rescata, igual que la pensión pública. Esto hace que si ya tienes una pensión elevada, retirar mucho del PP en un solo año puede llevarte a tramos del 37–45%, cuando ese mismo dinero en un fondo de inversión solo pagaría el 19–23%.</p>
        <p>La estrategia óptima suele ser <strong>retirar el PP en años con menor pensión</strong> (ej. los primeros años de jubilación anticipada, antes de cobrar la pensión completa) o en cantidades que no superen el umbral del siguiente tramo.</p>
        <h3>Estrategias prácticas</h3>
        <ul>
          <li><strong>Calcular el tramo marginal</strong>: si tu pensión te coloca en el 24%, retirar del PP hasta el límite del tramo (20.200€) es relativamente eficiente.</li>
          <li><strong>Fondos de inversión vs PP</strong>: los fondos tributan solo cuando se reembolsan (19–23%), y puedes traspasar entre fondos sin tributar. Suelen ser más eficientes fiscalmente para importes altos.</li>
          <li><strong>Renta vitalicia</strong>: los mayores de 65 años pueden convertir ganancias de fondos en rentas vitalicias con importantes reducciones fiscales (art. 38 LIRPF).</li>
          <li><strong>Distribución del alquiler</strong>: si tienes alquiler, la reducción del 50-60% hace que sea menos penalizador que la misma renta como rendimiento del trabajo.</li>
        </ul>
        <h3>¿Cuándo es mejor retirar del plan de pensiones?</h3>
        <p>Si tu tipo marginal de trabajo es igual o menor que el tipo marginal del ahorro (19% para bases &lt;6.000€, 21% para 6.000-50.000€), el PP no penaliza. Cuando el tipo de trabajo supera al del ahorro, conviene priorizar los fondos y retirar el PP de forma gradual o en años de menor renta.</p>
      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Tributación según tipo de renta (IRPF 2025)</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Tipo de renta</th>
              <th>Base</th>
              <th>Tipos aplicables</th>
              <th>Ventaja/Particularidad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Pensión pública / privada</td>
              <td>General</td>
              <td>19%-47%</td>
              <td>Reducción por rendimiento trabajo + mínimos edad</td>
            </tr>
            <tr>
              <td>Plan de pensiones (rescate)</td>
              <td>General (rendimiento trabajo)</td>
              <td>19%-47%</td>
              <td>Tributa al tipo marginal, muy sensible a la estrategia</td>
            </tr>
            <tr>
              <td>Dividendos / intereses</td>
              <td>Ahorro</td>
              <td>19%-28%</td>
              <td>Tipos más bajos, sin reducción por edad</td>
            </tr>
            <tr>
              <td>Plusvalía fondos/acciones</td>
              <td>Ahorro</td>
              <td>19%-28%</td>
              <td>Solo tributa al vender; traspaso fondos sin tributar</td>
            </tr>
            <tr>
              <td>Renta vitalicia (art. 38 LIRPF)</td>
              <td>Ahorro (% reducido)</td>
              <td>1,44%-3,92% efectivo</td>
              <td>Exención parcial muy ventajosa para mayores 65</td>
            </tr>
            <tr>
              <td>Alquiler vivienda habitual</td>
              <td>General</td>
              <td>19%-47%</td>
              <td>Deducción gastos y amortización reduce base</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏦</span>
            <strong>Rescate del plan de pensiones: cuándo y cómo</strong>
          </div>
          <p>Pensión 18.000 €/año + plan 80.000 €. Rescatar todo de golpe: tipo marginal 37-45%. Rescatar en renta mensual 6 años: tipo efectivo 19-24%. El ahorro puede ser de miles de euros.</p>
          <div className={styles.escenarioExample}>Rescate capital 80.000 € → tributación estimada 25.000 € | Renta 1.100 €/mes → ~14.000 €</div>
          <div className={styles.escenarioTip}>💡 Nunca rescatar el plan en el año de jubilación si hay nóminas altas. Esperar al año siguiente.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>💰</span>
            <strong>Renta vitalicia del artículo 38 LIRPF</strong>
          </div>
          <p>Más de 65 años, vende un inmueble o fondo. Puede reinvertir en renta vitalicia y la plusvalía queda exenta. La renta vitalicia tributa solo un pequeño porcentaje de interés.</p>
          <div className={styles.escenarioExample}>Plusvalía 60.000 € reinvertida en renta vitalicia → exenta de IRPF, solo tributa el &quot;rendimiento implícito&quot;</div>
          <div className={styles.escenarioTip}>💡 Plazo máximo 6 meses desde la venta para reinvertir. Obligatorio en renta vitalicia garantizada.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>📊</span>
            <strong>Optimización de la declaración conjunta</strong>
          </div>
          <p>Matrimonio: él cobra pensión 22.000 €, ella 8.000 €. La declaración conjunta ofrece reducción de 3.400 €. Comparar con individual para ver cuál es más ventajosa.</p>
          <div className={styles.escenarioExample}>Individual: 2 declaraciones. Conjunta: reducción 3.400 € aplicada pero se suman todos los ingresos</div>
          <div className={styles.escenarioTip}>💡 La conjunta no siempre es la mejor opción. Simular siempre con un asesor antes de elegir.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏠</span>
            <strong>Venta de la vivienda habitual con más de 65 años</strong>
          </div>
          <p>Si tienes más de 65 años y vendes tu vivienda habitual, la ganancia patrimonial está totalmente exenta de IRPF. Sin necesidad de reinvertir.</p>
          <div className={styles.escenarioExample}>Venta piso comprado 80.000 €, vendido 250.000 €: plusvalía 170.000 € → exenta de IRPF</div>
          <div className={styles.escenarioTip}>💡 Asegurarte de que sea tu vivienda habitual (residencia 3 años mínimo) antes de vender.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre optimización fiscal para mayores de 60</h3>
        <div className={styles.faqItem}>
          <strong>¿Cuándo está exenta la venta de la vivienda habitual?</strong>
          <p>Siempre para personas de 65 o más años. Y para cualquier edad si la ganancia se reinvierte en otra vivienda habitual en los 2 años siguientes. El domicilio debe ser la residencia habitual.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es la renta vitalicia del art. 38 LIRPF?</strong>
          <p>Mecanismo que permite a mayores de 65 años reinvertir la ganancia de la venta de cualquier bien (inmueble, fondo, acciones) en una renta vitalicia y dejar la plusvalía exenta de IRPF.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuál es el límite de la exención del art. 38?</strong>
          <p>El importe máximo que puede reinvertirse son 240.000 € (límite global para toda la vida). La parte reinvertida que supere ese límite no puede acogerse a la exención.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo tributan los dividendos y los fondos de inversión?</strong>
          <p>Como base del ahorro: 19% hasta 6.000 €; 21% de 6.000 a 50.000 €; 23% de 50.000 a 200.000 €; 27% de 200.000 a 300.000 €; 28% a partir de 300.000 €.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Es mejor tener rentas en base general o base ahorro?</strong>
          <p>Generalmente la base del ahorro es más eficiente (tipos 19-28%) frente a la base general (hasta 47%). Por eso los fondos de inversión y plusvalías suelen ser preferibles al rescate del plan de pensiones para acumulación.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Las prestaciones de dependencia tributan?</strong>
          <p>No, las prestaciones del SAAD y del sistema de atención a la dependencia están exentas de IRPF. Tampoco tributan como herencia si se perciben por familiar dependiente.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo compensar pérdidas de inversión con ganancias?</strong>
          <p>Sí, dentro de la base del ahorro puede compensarse con ganancias y pérdidas patrimoniales, y con rendimientos del capital mobiliario (dividendos, intereses), con ciertos límites.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Existe alguna deducción especial para mayores en el IRPF estatal?</strong>
          <p>El IRPF estatal no tiene deducciones específicas por edad más allá de los mínimos por edad (65 y 75 años). Las deducciones específicas para mayores suelen ser autonómicas y muy variables.</p>
          <div className={styles.faqTip}>💡 Revisar las deducciones autonómicas de tu CCAA: algunas tienen deducciones por alquiler, gastos sanitarios o situación de dependencia.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo optimizar tu fiscalidad después de los 60</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Haz un mapa de tus fuentes de ingresos</strong>
            <p>Lista todas tus fuentes: pensión pública, pensión privada, alquileres, dividendos, plan de pensiones, ahorro, etc. Clasifícalos según base general o base del ahorro.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Calcula tu tipo marginal actual</strong>
            <p>Con tus ingresos actuales, ¿en qué tramo estás? El tipo marginal determina qué rentas conviene generar en base ahorro vs base general para minimizar la factura fiscal.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Planifica el rescate del plan de pensiones</strong>
            <p>Si tienes plan de pensiones, decide cuándo y cómo rescatarlo. Generalmente es más eficiente hacerlo en años con pocos ingresos y en forma de renta mensual, no de capital único.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Evalúa la venta de activos y la reinversión</strong>
            <p>Si tienes inmuebles, fondos u otros activos, valora si la exención por reinversión en renta vitalicia (si tienes 65+) o la exención de vivienda habitual aplican a tu situación.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Revisa las deducciones autonómicas</strong>
            <p>Cada CCAA tiene deducciones específicas para mayores. Revisarlas en el borrador de la declaración o con un asesor puede descubrir beneficios no aplicados automáticamente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Consulta con asesor fiscal especializado</strong>
            <p>La planificación fiscal a partir de los 60 tiene muchas aristas (herencia, donaciones, dependencia). Un asesor fiscal especializado en mayor patrimonio y jubilación es una inversión rentable.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📅</div>
          <strong>Planifica el año de jubilación con detalle</strong>
          <p>El año en que dejas de trabajar y empiezas a cobrar pensión puede tener rentas altas de ambas fuentes. Es el año más crítico para la planificación fiscal.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📊</div>
          <strong>Diversifica las fuentes de ingresos</strong>
          <p>Tener ingresos en base general (pensión) y base ahorro (dividendos, plusvalías) permite repartir la carga fiscal entre escalas, reduciendo el tipo efectivo global.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🏠</div>
          <strong>No vendas la vivienda antes de los 65</strong>
          <p>Si puedes esperar, la exención total de la ganancia de la vivienda habitual a partir de los 65 años puede suponer decenas de miles de euros de ahorro fiscal.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💡</div>
          <strong>Usa el art. 38 antes de los 66 años</strong>
          <p>La renta vitalicia del art. 38 solo se puede contratar a partir de los 65. Planificar la venta de activos para ese momento puede permitir grandes exenciones fiscales.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>👫</div>
          <strong>Optimiza la declaración en pareja</strong>
          <p>La elección entre declaración individual y conjunta puede variar año a año según los ingresos. Simular ambas opciones antes de presentar es fundamental.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🎁</div>
          <strong>Considera donaciones en vida</strong>
          <p>Donar en vida puede ser más eficiente que dejar en herencia en CCAA con alta fiscalidad de sucesiones. Analizar el impacto de donaciones vs herencia con asesor.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores fiscales frecuentes a partir de los 60</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Rescatar el plan de pensiones todo de golpe</strong>: Es el error más caro y frecuente. En el año de jubilación, rescatar el plan completo puede disparar el tipo marginal al 45-47%.</li>
          <li><strong>Vender la vivienda habitual justo antes de los 65</strong>: Esperar hasta cumplir los 65 puede suponer la exención total de la ganancia. Vender unos meses antes puede costar decenas de miles de euros.</li>
          <li><strong>No aprovechar el art. 38 tras una venta con ganancia</strong>: Hay un plazo de 6 meses para reinvertir en renta vitalicia. Perder ese plazo hace que la ganancia tribute íntegramente.</li>
          <li><strong>Confirmar el borrador sin verificar</strong>: El borrador de la AEAT no incluye automáticamente todos los mínimos por edad ni deducciones autonómicas. Revisar siempre antes de confirmar.</li>
          <li><strong>No coordinar jubilación con la planificación hereditaria</strong>: Las decisiones fiscales en jubilación (liquidar activos, contratar rentas vitalicias) afectan directamente a la herencia. Planificar ambas dimensiones conjuntamente.</li>
          <li><strong>Ignorar la tributación de los seguros de vida</strong>: Los seguros de ahorro tributación diferida (SIALP, PIAS) tienen fiscalidad específica. No gestionarlos bien puede generar sorpresas en la declaración.</li>
        </ul>
      </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('optimizador-rentas-60')} />
      <ShareCard appName="optimizador-rentas-60" />
      <Footer appName="optimizador-rentas-60" />
    </div>
  );
}
