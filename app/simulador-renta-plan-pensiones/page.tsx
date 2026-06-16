'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  RegionBadge,
  DataReference,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, formatCurrency } from '@/lib';
import {
  TRAMOS_IRPF_2025,
  FISCAL_PLAN_PENSIONES_META,
  LIMITES_PLAN_PENSIONES_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  COTIZACIONES_SS_2026,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
} from '@/data/fiscal';
import styles from './SimuladorRentaPlanPensiones.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type FormaRescate = 'capital' | 'renta' | 'mixto';

interface ResultadoEscenario {
  capitalAcumulado: number;     // Lo que tienes acumulado al jubilarte (bruto, antes de IRPF rescate)
  irpfAhorradoTotal: number;    // IRPF ahorrado durante la vida laboral por aportar (0 si sin plan)
  irpfRescate: number;          // IRPF pagado al rescatar (0 si sin plan)
  netoFinal: number;            // Neto efectivo final tras todo
  detalle: string;              // Texto descriptivo
}

// ─── Lógica IRPF ──────────────────────────────────────────────────────────────

/** Calcula la cuota IRPF sobre una base liquidable según los tramos 2025 */
function calcularCuotaIRPF(baseLiquidable: number): number {
  let cuota = 0;
  let baseRestante = Math.max(0, baseLiquidable);
  let limiteAnterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    const limiteSuperior = tramo.hasta === Infinity ? baseLiquidable + 1000 : tramo.hasta;
    const anchoTramo = limiteSuperior - limiteAnterior;
    const baseAplicada = Math.min(baseRestante, anchoTramo);
    if (baseAplicada > 0) {
      cuota += baseAplicada * (tramo.tipo / 100);
      baseRestante -= baseAplicada;
    }
    limiteAnterior = limiteSuperior;
    if (baseRestante <= 0) break;
  }
  return cuota;
}

/** Tipo marginal IRPF para una base liquidable concreta */
function tipoMarginal(baseLiquidable: number): number {
  for (const t of TRAMOS_IRPF_2025) {
    if (baseLiquidable <= t.hasta) return t.tipo;
  }
  return 47;
}

/** Calcula la base liquidable orientativa a partir del salario bruto */
function calcularBaseLiquidable(salarioBruto: number): number {
  // Cotizaciones SS trabajador
  const totalSSPct =
    COTIZACIONES_SS_2026.contingenciasComunes +
    COTIZACIONES_SS_2026.desempleo +
    COTIZACIONES_SS_2026.formacionProfesional +
    COTIZACIONES_SS_2026.mef;
  const ss = salarioBruto * (totalSSPct / 100);

  // Gastos deducibles art. 19 (2.000 €)
  const rnt = Math.max(0, salarioBruto - ss - GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral);

  // Reducción art. 20 (rendimientos del trabajo)
  const rd = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  let reduccion: number;
  if (rnt <= rd.limite1) {
    reduccion = rd.reduccion1;
  } else if (rnt < rd.limite2) {
    reduccion = rd.reduccion1 - rd.factorInterpolacion * (rnt - rd.limite1);
  } else {
    reduccion = rd.reduccion2;
  }

  // Base imponible aproximada
  const baseImponible = Math.max(0, rnt - reduccion);
  // Mínimo personal (5.550 €) — la base liquidable se calcula como base imponible
  // pero los mínimos se aplican como un "tramo cero"; aquí simplificamos
  // devolviendo la base imponible (que es la cifra que se compara con tramos
  // descontando el mínimo en el cálculo real).
  return baseImponible;
}

/** Capital acumulado tras N años aportando aporteAnual con rentabilidad anual rentab (%) */
function capitalFuturo(aporteAnual: number, anios: number, rentab: number): number {
  if (anios <= 0 || aporteAnual <= 0) return 0;
  let total = 0;
  const factor = 1 + rentab / 100;
  for (let i = 0; i < anios; i++) {
    total = (total + aporteAnual) * factor;
  }
  return total;
}

// ─── Casos preconfigurados ────────────────────────────────────────────────────

interface CasoPreconfigurado {
  id: string;
  etiqueta: string;
  descripcion: string;
  salario: number;
  aporte: number;
  edadActual: number;
  edadJubilacion: number;
  rentab: number;
  forma: FormaRescate;
  pre2007: boolean;
  pctPre2007: number;
}

const CASOS: CasoPreconfigurado[] = [
  {
    id: 'joven',
    etiqueta: 'Joven 30 años',
    descripcion: '40.000 € brutos, aporta 1.500 €/año durante 35 años. Rescate en renta.',
    salario: 40000,
    aporte: 1500,
    edadActual: 30,
    edadJubilacion: 65,
    rentab: 4,
    forma: 'renta',
    pre2007: false,
    pctPre2007: 0,
  },
  {
    id: 'mileurista',
    etiqueta: 'Mileurista 25.000 €',
    descripcion: 'Marginal bajo, ahorro fiscal modesto. ¿Compensa realmente?',
    salario: 25000,
    aporte: 1000,
    edadActual: 35,
    edadJubilacion: 67,
    rentab: 3,
    forma: 'renta',
    pre2007: false,
    pctPre2007: 0,
  },
  {
    id: 'alto',
    etiqueta: 'Alto 80.000 €',
    descripcion: 'Marginal 37%, ahorro fiscal grande. Ojo a la forma de rescate.',
    salario: 80000,
    aporte: 1500,
    edadActual: 45,
    edadJubilacion: 65,
    rentab: 3.5,
    forma: 'renta',
    pre2007: true,
    pctPre2007: 20,
  },
  {
    id: 'malrescate',
    etiqueta: 'Mal rescate (capital)',
    descripcion: 'Mismo perfil alto, pero rescata todo de golpe. Tributa en tramos altos.',
    salario: 80000,
    aporte: 1500,
    edadActual: 45,
    edadJubilacion: 65,
    rentab: 3.5,
    forma: 'capital',
    pre2007: false,
    pctPre2007: 0,
  },
];

// ─── Componente principal ────────────────────────────────────────────────────

export default function SimuladorRentaPlanPensionesPage() {
  const [salario, setSalario] = useState<number>(40000);
  const [aporte, setAporte] = useState<number>(1500);
  const [edadActual, setEdadActual] = useState<number>(35);
  const [edadJubilacion, setEdadJubilacion] = useState<number>(65);
  const [rentab, setRentab] = useState<number>(3);
  const [forma, setForma] = useState<FormaRescate>('renta');
  const [pre2007, setPre2007] = useState<boolean>(false);
  const [pctPre2007, setPctPre2007] = useState<number>(0);

  const aplicarCaso = useCallback((c: CasoPreconfigurado) => {
    setSalario(c.salario);
    setAporte(c.aporte);
    setEdadActual(c.edadActual);
    setEdadJubilacion(c.edadJubilacion);
    setRentab(c.rentab);
    setForma(c.forma);
    setPre2007(c.pre2007);
    setPctPre2007(c.pctPre2007);
  }, []);

  // ─── Cálculo de los 3 escenarios ───────────────────────────────────────────
  const calculo = useMemo(() => {
    const aniosAportando = Math.max(0, edadJubilacion - edadActual);
    const aporteEfectivo = Math.min(aporte, LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual);
    const baseLiq = calcularBaseLiquidable(salario);
    const margActual = tipoMarginal(baseLiq);

    // Pensión estimada (orientativa): 70% del salario bruto en activo
    const pensionBrutaAnual = salario * 0.7;
    const baseLiqPension = calcularBaseLiquidable(pensionBrutaAnual);
    const margPension = tipoMarginal(baseLiqPension);

    // RENTABILIDAD NEUTRA para escenario A (cuenta remunerada al 2,5%)
    const RENT_NEUTRA = 2.5;

    // ─── Escenario A — SIN plan ──────────────────────────────────────────────
    // Pago IRPF normal cada año (no aporto, no desgrava).
    // Lo que aportaría al plan, lo pongo en cuenta remunerada al 2,5%.
    // Pero esa cantidad es DESPUÉS de IRPF (porque no la desgravo).
    // Aporte neto post-IRPF = aporteEfectivo × (1 - margActual/100)
    const aporteNetoSinPlan = aporteEfectivo * (1 - margActual / 100);
    const capitalSinPlan = capitalFuturo(aporteNetoSinPlan, aniosAportando, RENT_NEUTRA);
    // Al rescatar, los rendimientos tributan como capital mobiliario (~19-23%),
    // pero el principal ya tributó. Simplificación: aplicar 21% sobre rendimientos.
    const aportadoTotal = aporteNetoSinPlan * aniosAportando;
    const rendimientosNeutros = Math.max(0, capitalSinPlan - aportadoTotal);
    const irpfRendimientos = rendimientosNeutros * 0.21;
    const escenarioA: ResultadoEscenario = {
      capitalAcumulado: capitalSinPlan,
      irpfAhorradoTotal: 0,
      irpfRescate: irpfRendimientos,
      netoFinal: capitalSinPlan - irpfRendimientos,
      detalle: 'Aporto a cuenta remunerada (2,5%) tras pagar IRPF',
    };

    // ─── Escenario B — CON plan, rescate ÓPTIMO ──────────────────────────────
    // Cada año: ahorras IRPF al marginal actual (margActual).
    // El ahorro fiscal lo reinviertes a 2,5% (cuenta remunerada).
    // El plan crece a la rentabilidad del plan.
    const ahorroFiscalAnual = aporteEfectivo * (margActual / 100);
    const capitalPlanB = capitalFuturo(aporteEfectivo, aniosAportando, rentab);
    const capitalAhorroFiscalB = capitalFuturo(ahorroFiscalAnual, aniosAportando, RENT_NEUTRA);

    // Al rescatar como renta: distribuir capitalPlanB en 10 años, sumando a la pensión.
    // Cada año: pensión + (capitalPlanB / 10) tributa según tramos.
    const aniosRenta = forma === 'capital' ? 1 : forma === 'mixto' ? 5 : 10;
    let irpfRescateB = 0;
    if (forma === 'renta') {
      // 10 años de mensualidades
      const rentaAnual = capitalPlanB / aniosRenta;
      // Aplicar régimen transitorio si aporte pre-2007 (40% reducción sobre la parte capital)
      // En renta NO se aplica el régimen transitorio (solo capital pre-2007 disfruta del 40%)
      const baseAnualRescate = baseLiqPension + rentaAnual;
      const cuotaConRescate = calcularCuotaIRPF(baseAnualRescate);
      const cuotaPensionSola = calcularCuotaIRPF(baseLiqPension);
      const irpfRescateAnual = cuotaConRescate - cuotaPensionSola;
      irpfRescateB = irpfRescateAnual * aniosRenta;
    } else if (forma === 'capital') {
      // Todo de golpe
      let importeQueTributa = capitalPlanB;
      if (pre2007 && pctPre2007 > 0) {
        const partePre2007 = capitalPlanB * (pctPre2007 / 100);
        const reduccion40 = partePre2007 * 0.4;
        importeQueTributa = capitalPlanB - reduccion40;
      }
      const baseAnualRescate = baseLiqPension + importeQueTributa;
      const cuotaConRescate = calcularCuotaIRPF(baseAnualRescate);
      const cuotaPensionSola = calcularCuotaIRPF(baseLiqPension);
      irpfRescateB = cuotaConRescate - cuotaPensionSola;
    } else {
      // Mixto 50/50: mitad capital (de golpe), mitad renta (5 años)
      const mitadCapital = capitalPlanB * 0.5;
      const mitadRenta = capitalPlanB * 0.5;
      // Capital
      let importeCapital = mitadCapital;
      if (pre2007 && pctPre2007 > 0) {
        const partePre2007 = mitadCapital * (pctPre2007 / 100);
        importeCapital = mitadCapital - partePre2007 * 0.4;
      }
      const baseAnoCapital = baseLiqPension + importeCapital;
      const cuotaCapital = calcularCuotaIRPF(baseAnoCapital);
      const cuotaPensionSola = calcularCuotaIRPF(baseLiqPension);
      const irpfCapital = cuotaCapital - cuotaPensionSola;
      // Renta 5 años
      const rentaAnual = mitadRenta / 5;
      const baseAnualRenta = baseLiqPension + rentaAnual;
      const cuotaRenta = calcularCuotaIRPF(baseAnualRenta);
      const irpfRentaAnual = cuotaRenta - cuotaPensionSola;
      irpfRescateB = irpfCapital + irpfRentaAnual * 5;
    }

    const totalCapitalB = capitalPlanB + capitalAhorroFiscalB;
    const escenarioB: ResultadoEscenario = {
      capitalAcumulado: totalCapitalB,
      irpfAhorradoTotal: ahorroFiscalAnual * aniosAportando,
      irpfRescate: irpfRescateB,
      netoFinal: totalCapitalB - irpfRescateB,
      detalle: `Plan al ${formatNumber(rentab, 1)}% + ahorro fiscal al 2,5% reinvertido. Rescate ${
        forma === 'renta' ? 'en renta (10 años)' : forma === 'capital' ? 'todo de golpe' : 'mixto 50/50'
      }`,
    };

    // ─── Escenario C — CON plan, MAL gestionado (todo de golpe) ──────────────
    const capitalPlanC = capitalFuturo(aporteEfectivo, aniosAportando, rentab);
    const capitalAhorroFiscalC = capitalFuturo(ahorroFiscalAnual, aniosAportando, RENT_NEUTRA);
    // Rescate todo de golpe en un año, sin régimen transitorio (mal planificado)
    const baseAnualMal = baseLiqPension + capitalPlanC;
    const cuotaMal = calcularCuotaIRPF(baseAnualMal);
    const cuotaPensionSolaMal = calcularCuotaIRPF(baseLiqPension);
    const irpfRescateC = cuotaMal - cuotaPensionSolaMal;
    const totalCapitalC = capitalPlanC + capitalAhorroFiscalC;
    const escenarioC: ResultadoEscenario = {
      capitalAcumulado: totalCapitalC,
      irpfAhorradoTotal: ahorroFiscalAnual * aniosAportando,
      irpfRescate: irpfRescateC,
      netoFinal: totalCapitalC - irpfRescateC,
      detalle: 'Mismo plan que B, pero rescatado todo de golpe (peor opción fiscal)',
    };

    return {
      escenarioA,
      escenarioB,
      escenarioC,
      margActual,
      margPension,
      baseLiq,
      baseLiqPension,
      pensionBrutaAnual,
      aniosAportando,
      aporteEfectivo,
      ahorroFiscalAnual,
    };
  }, [salario, aporte, edadActual, edadJubilacion, rentab, forma, pre2007, pctPre2007]);

  const diferenciaAB = calculo.escenarioB.netoFinal - calculo.escenarioA.netoFinal;
  const diferenciaAC = calculo.escenarioC.netoFinal - calculo.escenarioA.netoFinal;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏦</span>
        <h1 className={styles.title}>Simulador Plan de Pensiones IRPF</h1>
        <p className={styles.subtitle}>
          Ahorro fiscal hoy vs tributación al rescate — desmonta el mito del plan de pensiones
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa="Plan Pensiones IRPF 2025"
        fuente={FISCAL_PLAN_PENSIONES_META.fuente}
        verificado={FISCAL_PLAN_PENSIONES_META.verificado}
        urlOficial={FISCAL_PLAN_PENSIONES_META.urlOficial}
      />

      <LegalNotice />

      <main className={styles.main}>
        {/* Casos preconfigurados */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Casos preconfigurados</h2>
          <div className={styles.casosGrid}>
            {CASOS.map(c => (
              <button
                key={c.id}
                type="button"
                className={styles.casoBtn}
                onClick={() => aplicarCaso(c)}
                aria-label={`Aplicar caso ${c.etiqueta}: ${c.descripcion}`}
              >
                <strong>{c.etiqueta}</strong>
                <span>{c.descripcion}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Tu situación fiscal actual</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="salarioSlider">
              Salario bruto anual: <span className={styles.sliderValue}>{formatCurrency(salario)}</span>
            </label>
            <input
              id="salarioSlider"
              type="range"
              min={12000}
              max={200000}
              step={500}
              value={salario}
              onChange={e => setSalario(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>12.000 €</span>
              <span>200.000 €</span>
            </div>
            <p className={styles.sliderHint}>
              Base liquidable estimada: {formatCurrency(calculo.baseLiq)} · Tipo marginal actual: {formatNumber(calculo.margActual, 0)}%
            </p>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="aporteSlider">
              Aportación anual al plan: <span className={styles.sliderValue}>{formatCurrency(aporte)}</span>
            </label>
            <input
              id="aporteSlider"
              type="range"
              min={0}
              max={LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual}
              step={50}
              value={aporte}
              onChange={e => setAporte(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0 €</span>
              <span>{formatCurrency(LIMITES_PLAN_PENSIONES_2025.limiteIndividualAnual)} (máx. legal individual)</span>
            </div>
            <p className={styles.sliderHint}>
              Ahorro fiscal anual: {formatCurrency(calculo.ahorroFiscalAnual)} (al marginal {formatNumber(calculo.margActual, 0)}%)
            </p>
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Horizonte temporal</h2>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="edadActualSlider">
              Edad actual: <span className={styles.sliderValue}>{edadActual} años</span>
            </label>
            <input
              id="edadActualSlider"
              type="range"
              min={25}
              max={65}
              step={1}
              value={edadActual}
              onChange={e => setEdadActual(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>25</span>
              <span>65</span>
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="edadJubSlider">
              Edad de jubilación prevista: <span className={styles.sliderValue}>{edadJubilacion} años</span>
            </label>
            <input
              id="edadJubSlider"
              type="range"
              min={60}
              max={70}
              step={1}
              value={edadJubilacion}
              onChange={e => setEdadJubilacion(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>60</span>
              <span>70</span>
            </div>
            <p className={styles.sliderHint}>
              Años aportando: {calculo.aniosAportando} · Pensión bruta estimada: {formatCurrency(calculo.pensionBrutaAnual)}/año (~70% del salario, orientativo)
            </p>
          </div>

          <div className={styles.sliderGroup}>
            <label className={styles.sliderLabel} htmlFor="rentabSlider">
              Rentabilidad anual estimada del plan: <span className={styles.sliderValue}>{formatNumber(rentab, 1)}%</span>
            </label>
            <input
              id="rentabSlider"
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={rentab}
              onChange={e => setRentab(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRange}>
              <span>0%</span>
              <span>8%</span>
            </div>
            <p className={styles.sliderHint}>
              Históricamente, planes de pensiones renta variable: 3-5% anual neto.
            </p>
          </div>
        </div>

        {/* Forma de rescate */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Forma de rescate</h2>
          <div className={styles.formaRescate} role="radiogroup" aria-label="Forma de rescate del plan de pensiones">
            <label className={`${styles.formaOpt} ${forma === 'capital' ? styles.formaActiva : ''}`}>
              <input
                type="radio"
                name="forma"
                checked={forma === 'capital'}
                onChange={() => setForma('capital')}
              />
              <strong>En forma de capital</strong>
              <span>Todo de golpe en un año. Tributa todo en tramos altos.</span>
            </label>
            <label className={`${styles.formaOpt} ${forma === 'renta' ? styles.formaActiva : ''}`}>
              <input
                type="radio"
                name="forma"
                checked={forma === 'renta'}
                onChange={() => setForma('renta')}
              />
              <strong>En forma de renta (10 años)</strong>
              <span>Mensualidades durante 10 años. Distribuye carga fiscal.</span>
            </label>
            <label className={`${styles.formaOpt} ${forma === 'mixto' ? styles.formaActiva : ''}`}>
              <input
                type="radio"
                name="forma"
                checked={forma === 'mixto'}
                onChange={() => setForma('mixto')}
              />
              <strong>Mixto 50/50</strong>
              <span>Mitad capital, mitad renta a 5 años.</span>
            </label>
          </div>

          <div className={styles.regimenTransitorio}>
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={pre2007}
                onChange={e => setPre2007(e.target.checked)}
              />
              <span>
                <strong>Tengo aportaciones anteriores a 2007</strong>
                <small>Régimen transitorio: reducción 40% sobre la parte de capital pre-2007 (solo en rescate como capital)</small>
              </span>
            </label>
            {pre2007 && (
              <div className={styles.sliderGroup} style={{ marginTop: '1rem' }}>
                <label className={styles.sliderLabel} htmlFor="pctPre2007">
                  % del capital correspondiente a aportaciones pre-2007:{' '}
                  <span className={styles.sliderValue}>{formatNumber(pctPre2007, 0)}%</span>
                </label>
                <input
                  id="pctPre2007"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={pctPre2007}
                  onChange={e => setPctPre2007(Number(e.target.value))}
                  className={styles.slider}
                />
              </div>
            )}
          </div>
        </div>

        {/* 3 escenarios */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>3 escenarios comparados al jubilarte</h2>
          <div className={styles.tresEscenarios}>
            {/* A — Sin plan */}
            <div className={`${styles.escenarioPanel} ${styles.escenarioA}`}>
              <h3 className={styles.escenarioTitle}>A · Sin plan</h3>
              <p className={styles.escenarioSub}>{calculo.escenarioA.detalle}</p>
              <div className={styles.escenarioLine}>
                <span>Capital acumulado</span>
                <strong>{formatCurrency(calculo.escenarioA.capitalAcumulado)}</strong>
              </div>
              <div className={styles.escenarioLine}>
                <span>IRPF al rescatar</span>
                <strong>−{formatCurrency(calculo.escenarioA.irpfRescate)}</strong>
              </div>
              <div className={styles.escenarioTotal}>
                <span>Neto final</span>
                <strong>{formatCurrency(calculo.escenarioA.netoFinal)}</strong>
              </div>
            </div>

            {/* B — Con plan, rescate óptimo */}
            <div className={`${styles.escenarioPanel} ${styles.escenarioB}`}>
              <h3 className={styles.escenarioTitle}>B · Con plan, rescate óptimo</h3>
              <p className={styles.escenarioSub}>{calculo.escenarioB.detalle}</p>
              <div className={styles.escenarioLine}>
                <span>Capital acumulado</span>
                <strong>{formatCurrency(calculo.escenarioB.capitalAcumulado)}</strong>
              </div>
              <div className={styles.escenarioLine}>
                <span>IRPF ahorrado durante la vida laboral</span>
                <strong>+{formatCurrency(calculo.escenarioB.irpfAhorradoTotal)}</strong>
              </div>
              <div className={styles.escenarioLine}>
                <span>IRPF al rescatar</span>
                <strong>−{formatCurrency(calculo.escenarioB.irpfRescate)}</strong>
              </div>
              <div className={styles.escenarioTotal}>
                <span>Neto final</span>
                <strong>{formatCurrency(calculo.escenarioB.netoFinal)}</strong>
              </div>
            </div>

            {/* C — Con plan, mal rescate */}
            <div className={`${styles.escenarioPanel} ${styles.escenarioC}`}>
              <h3 className={styles.escenarioTitle}>C · Con plan, mal rescate</h3>
              <p className={styles.escenarioSub}>{calculo.escenarioC.detalle}</p>
              <div className={styles.escenarioLine}>
                <span>Capital acumulado</span>
                <strong>{formatCurrency(calculo.escenarioC.capitalAcumulado)}</strong>
              </div>
              <div className={styles.escenarioLine}>
                <span>IRPF ahorrado durante la vida laboral</span>
                <strong>+{formatCurrency(calculo.escenarioC.irpfAhorradoTotal)}</strong>
              </div>
              <div className={styles.escenarioLine}>
                <span>IRPF al rescatar (todo de golpe)</span>
                <strong>−{formatCurrency(calculo.escenarioC.irpfRescate)}</strong>
              </div>
              <div className={styles.escenarioTotal}>
                <span>Neto final</span>
                <strong>{formatCurrency(calculo.escenarioC.netoFinal)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Diferencias */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>¿Qué diferencia hay realmente?</h2>
          <div className={styles.diferenciaBox} role="status" aria-live="polite">
            <div className={styles.diferenciaItem}>
              <span className={styles.diferenciaLabel}>A vs B (rescate óptimo):</span>
              <strong className={diferenciaAB >= 0 ? styles.diferenciaPos : styles.diferenciaNeg}>
                {diferenciaAB >= 0 ? '+' : '−'}
                {formatCurrency(Math.abs(diferenciaAB))}
              </strong>
              <span className={styles.diferenciaDetalle}>
                {diferenciaAB >= 0
                  ? 'Si gestionas bien el rescate, GANAS respecto a no tener plan'
                  : 'Aún con buen rescate, en este caso PIERDES respecto a no tener plan'}
              </span>
            </div>
            <div className={styles.diferenciaItem}>
              <span className={styles.diferenciaLabel}>A vs C (mal rescate):</span>
              <strong className={diferenciaAC >= 0 ? styles.diferenciaPos : styles.diferenciaNeg}>
                {diferenciaAC >= 0 ? '+' : '−'}
                {formatCurrency(Math.abs(diferenciaAC))}
              </strong>
              <span className={styles.diferenciaDetalle}>
                {diferenciaAC >= 0
                  ? 'Aún rescatando mal, ganarías respecto a no tener plan'
                  : 'Si rescatas mal (todo de golpe), PIERDES respecto a no haber tenido plan'}
              </span>
            </div>
          </div>

          <div className={styles.mensajePedagogico}>
            <strong>Mensaje clave:</strong> El plan de pensiones es un{' '}
            <em>diferimiento fiscal</em>, no una desgravación pura. La clave del beneficio depende de:
            <ol>
              <li>La diferencia entre tu tipo marginal hoy ({formatNumber(calculo.margActual, 0)}%) y el de tu jubilación (~{formatNumber(calculo.margPension, 0)}%).</li>
              <li>La forma de rescate elegida (capital, renta o mixto).</li>
              <li>La rentabilidad real obtenida.</li>
            </ol>
          </div>
        </div>
      </main>

      <EducationalSection
        title="Guía Plan de Pensiones e IRPF"
        subtitle="Diferimiento fiscal y rescate inteligente"
      >
        <h3>¿Qué pasa con tu dinero según el escenario?</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Sin plan</th>
                <th>Con plan (rescate óptimo)</th>
                <th>Con plan (mal gestionado)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ahorro fiscal anual</td>
                <td>0 €</td>
                <td>Aportación × marginal actual</td>
                <td>Igual que B (ahorras lo mismo aportando)</td>
              </tr>
              <tr>
                <td>Rentabilidad esperada</td>
                <td>2-2,5% (cuenta remunerada)</td>
                <td>3-5% (renta mixta/variable)</td>
                <td>3-5% (igual que B)</td>
              </tr>
              <tr>
                <td>Cómo rescatas</td>
                <td>Disponible siempre, no necesitas rescate</td>
                <td>En renta a 10+ años (distribuye fiscalidad)</td>
                <td>Todo de golpe en un año (mala fiscalidad)</td>
              </tr>
              <tr>
                <td>Tipo IRPF al rescatar</td>
                <td>~21% sobre rendimientos (capital mobiliario)</td>
                <td>Marginal en jubilación (suele ser bajo)</td>
                <td>Tramos altos (37-45%) por suma de golpe</td>
              </tr>
              <tr>
                <td>Liquidez antes de jubilarte</td>
                <td>Total</td>
                <td>Limitada (plan: 10 años antigüedad o supuestos especiales)</td>
                <td>Limitada (igual que B)</td>
              </tr>
              <tr>
                <td>Régimen transitorio pre-2007</td>
                <td>No aplica</td>
                <td>Solo si rescatas como capital la parte pre-2007 (40% reducción)</td>
                <td>Aprovechable solo en capital pre-2007 — el resto tributa en bloque</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Los planes de pensiones tienen liquidez limitada: solo se pueden rescatar al jubilarte, en supuestos excepcionales (paro de larga duración, enfermedad grave, dependencia) o tras 10 años de antigüedad de las aportaciones (desde 2025, vencimientos progresivos).
        </p>

        <h3>Casos de Uso Reales</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h4>Joven 30 años con marginal 30%</h4>
            <p>
              Aporta 1.500 €/año durante 35 años a un plan al 4%. Ahorra 450 €/año en IRPF (que también puede reinvertir). Capital acumulado ~135.000 €. Si rescata en renta a 10 años, su tipo marginal en jubilación cae a ~24% → fiscalidad muy favorable. <strong>Compensa claramente.</strong>
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Mileurista 25.000 € con marginal 30%</h4>
            <p>
              Su pensión futura será ~17.500 € → marginal 24%. La diferencia entre 30% (hoy) y 24% (jubilación) es solo 6 puntos. El beneficio existe pero es modesto: la liquidez perdida puede no compensar. <strong>Considerar antes el fondo de emergencia.</strong>
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Alto 80.000 € con marginal 37%</h4>
            <p>
              Ahorra 555 €/año de IRPF por aportar 1.500 €. Su pensión será ~56.000 € (con tope SS) → marginal 37%. <strong>Si su pensión satura el tope (~47.000 €), el marginal en jubilación cae al 30% y compensa muy bien.</strong> Si encima aplica régimen transitorio, mejor todavía.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h4>Pensionista rescatando todo de golpe</h4>
            <p>
              Tiene 100.000 € en el plan. Si los rescata todos en un año: pensión 18.000 € + 100.000 € = base liquidable 118.000 €. Tributa por tramos hasta 45%. <strong>Pierde unos 30.000 € respecto a rescatar en renta a 10 años.</strong> Caso ejemplar de mala planificación.
            </p>
          </div>
        </div>

        <h3>Preguntas Frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿El plan de pensiones es desgravación o diferimiento?</strong>
            <p>
              Es un <em>diferimiento fiscal</em>, no una desgravación pura. Cuando aportas reduces tu base liquidable hoy (ahorras IRPF al marginal actual), pero al rescatar tributas como rendimiento del trabajo. Solo ganas si tu marginal en jubilación es MENOR que el actual. Si fuera igual, ganarías solo por el efecto de los rendimientos del plan.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuál es el límite anual de aportación 2025?</strong>
            <p>
              El límite individual a planes de pensiones es <strong>1.500 €/año</strong>. Si tu empresa hace contribuciones a un plan de empleo, el límite total sube hasta 8.500 € adicionales (10.000 € total). Las personas con discapacidad ≥33% tienen límite ampliado a 24.250 €.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es el régimen transitorio de aportaciones pre-2007?</strong>
            <p>
              Las aportaciones realizadas <em>antes del 1 de enero de 2007</em> y los rendimientos generados por ellas, si se rescatan en forma de <strong>capital</strong>, se benefician de una reducción del 40% sobre el importe a tributar. Solo aplica si rescatas como capital (no en renta) y dentro del año de jubilación o los 2 siguientes (calendario actual).
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo elegir entre rescate en capital o renta?</strong>
            <p>
              <strong>Renta</strong>: si tienes mucho capital y tu pensión + rescate en bloque te subiría de tramo. Distribuyes la tributación durante 10-15 años. Es la opción óptima en la mayoría de casos.<br />
              <strong>Capital</strong>: solo si tienes aportaciones pre-2007 (para aprovechar la reducción del 40%) o si necesitas el dinero todo a la vez. Cuidado: tributa en tramos altos.<br />
              <strong>Mixto</strong>: rescatas como capital la parte pre-2007 (con reducción) y el resto en renta. Suele ser óptimo si combinas ambos casos.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Y los planes de empleo (de empresa)?</strong>
            <p>
              Si tu empresa hace aportaciones a un plan de empleo, sumas con tu aportación individual hasta 8.500 € adicionales (10.000 € total). Las contribuciones del empleador <em>no</em> tributan como salario en especie hasta ese límite. Es la vía con más beneficio fiscal disponible.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué pasa si me jubilo y no rescato el plan?</strong>
            <p>
              No estás obligado a rescatar al jubilarte. Puedes mantener el plan vivo y seguir cobrando rendimientos. Cuando decidas rescatarlo, aplicarás los tramos IRPF de ese momento. <strong>Cuidado</strong>: si fallecen sin rescate, los herederos tributan como rendimiento del trabajo (no es ISD), no se beneficia de las reducciones por parentesco.
            </p>
          </div>
        </div>

        <h3>Cómo decidir si te conviene aportar — Paso a Paso</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Calcula tu tipo marginal IRPF actual</strong>
              <p>
                Identifica el tramo en el que cae tu base liquidable. Si estás al 30% o más, el plan tiene sentido fiscal. Si estás al 19-24%, el ahorro será modesto.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Estima tu marginal en jubilación</strong>
              <p>
                Tu pensión SS será aproximadamente el 70-80% de tu salario en activo (con techo en 3.359,60 €/mes en 2026). Calcula a qué tramo corresponde esa pensión. Si es claramente menor que tu marginal actual, el plan compensa.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Asegura tu fondo de emergencia primero</strong>
              <p>
                El plan tiene liquidez muy limitada. Antes de aportar, ten 3-6 meses de gastos en cuenta líquida. Si no, podrías quedarte sin acceso al dinero en una crisis.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Decide la forma de rescate ANTES de jubilarte</strong>
              <p>
                Lo ideal: planificar 5 años antes de jubilarte. Si tienes parte pre-2007 valiosa, rescata esa parte como capital en el año de jubilación o los 2 siguientes. El resto, en renta a 10-15 años para suavizar el IRPF.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Reinvierte el ahorro fiscal anual</strong>
              <p>
                El "truco" para que el plan compense de verdad: cada año que ahorras IRPF (300-555 €), reinviértelo en un fondo indexado o cuenta remunerada. Si te lo gastas, pierdes la mitad del beneficio.
              </p>
            </div>
          </div>
        </div>

        <h3>Mejores Prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <div>
              <strong>Compara con un fondo indexado</strong>
              <p>Para muchos perfiles (marginal &lt; 30%), un fondo indexado en cuenta de valores tiene más liquidez y similar rentabilidad fiscal a largo plazo.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🏢</span>
            <div>
              <strong>Aprovecha el plan de empleo</strong>
              <p>Si tu empresa ofrece plan de empleo, aporta lo que iguale el match empresarial. Es la vía más eficiente fiscalmente.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <div>
              <strong>Aporta al final de año</strong>
              <p>Cuando ya conoces tu salario anual, puedes ajustar la aportación al máximo que te permita reducir tu base.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <div>
              <strong>Revisa las comisiones</strong>
              <p>Comisiones de gestión &lt; 1,25% (renta variable) o &lt; 0,85% (renta fija). Por encima, la rentabilidad neta se come el ahorro fiscal.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📝</span>
            <div>
              <strong>Conserva documentación pre-2007</strong>
              <p>Si tienes aportaciones antes de 2007, guarda todos los certificados. La gestora debe poder identificar la parte pre-2007 para aplicar el régimen transitorio.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">👤</span>
            <div>
              <strong>Asesoramiento profesional</strong>
              <p>Para decisiones de rescate (especialmente con cantidades grandes o régimen transitorio), consulta con un asesor fiscal antes del año de jubilación.</p>
            </div>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            Errores frecuentes a evitar
          </div>
          <ul className={styles.warningList}>
            <li>Pensar que el plan "desgrava" sin más: en realidad difiere el impuesto, y al rescatar pagas IRPF.</li>
            <li>Rescatar todo de golpe en el año de jubilación sin planificar (el peor escenario fiscal posible).</li>
            <li>Ignorar la pérdida de liquidez: el plan no se puede tocar fácilmente antes de jubilarse.</li>
            <li>Aportar al máximo cuando tu marginal es bajo (&lt;24%): el ahorro fiscal no compensa el coste de oportunidad.</li>
            <li>No reinvertir el ahorro fiscal anual: si te lo gastas, pierdes la mitad del beneficio del plan.</li>
            <li>Olvidar el régimen transitorio pre-2007: hay que reclamarlo expresamente al rescatar (la entidad no lo aplica de oficio).</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-renta-plan-pensiones')} />
      <ShareCard appName="simulador-renta-plan-pensiones" />
      <Footer appName="simulador-renta-plan-pensiones" />
    </div>
  );
}
