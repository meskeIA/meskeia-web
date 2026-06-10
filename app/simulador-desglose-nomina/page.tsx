'use client';

import { useState, useMemo, useEffect } from 'react';
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
  MINIMOS_IRPF_2025,
  COTIZACIONES_SS_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  FISCAL_IRPF_META,
} from '@/data/fiscal';
import styles from './SimuladorDesgloseNomina.module.css';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SituacionFamiliar = 'soltero' | 'casado_un_ingreso' | 'un_hijo' | 'dos_o_mas_hijos';
type ModoVista = 'simple' | 'detallado';
type ModoIRPF = 'auto' | 'manual';

type TipoPaso = 'bruto' | 'resta_ss' | 'resta_irpf' | 'intermedio' | 'neto' | 'gasto' | 'reduccion';

interface PasoNomina {
  etiqueta: string;
  importe: number;
  tipo: TipoPaso;
  detalle?: string;
  destacado?: boolean;
  delta?: number; // cantidad restada en el paso (informativa)
}

interface DesgloseTramoIRPF {
  desde: number;
  hasta: number | null;
  tipo: number;
  baseAplicada: number;
  cuota: number;
}

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

function calcularReduccionRRT(rnt: number): number {
  const { limite1, reduccion1, limite2, reduccion2, factorInterpolacion } =
    REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= limite1) return reduccion1;
  if (rnt >= limite2) return reduccion2;
  return reduccion1 - factorInterpolacion * (rnt - limite1);
}

function calcularMinimoPersonalFamiliar(situacion: SituacionFamiliar): number {
  let minimo = MINIMOS_IRPF_2025.personal;
  if (situacion === 'un_hijo') {
    minimo += MINIMOS_IRPF_2025.hijo_1;
  } else if (situacion === 'dos_o_mas_hijos') {
    minimo += MINIMOS_IRPF_2025.hijo_1 + MINIMOS_IRPF_2025.hijo_2;
  }
  return minimo;
}

function calcularCuotaIRPF(baseLiquidable: number): {
  cuota: number;
  desglose: DesgloseTramoIRPF[];
} {
  let cuota = 0;
  let baseRestante = Math.max(0, baseLiquidable);
  let limiteAnterior = 0;
  const desglose: DesgloseTramoIRPF[] = [];

  for (const tramo of TRAMOS_IRPF_2025) {
    const tramoDe = limiteAnterior;
    const tramoHasta = tramo.hasta === Infinity ? null : tramo.hasta;
    const anchuraTramo = tramo.hasta - limiteAnterior;
    const baseTramo = Math.min(baseRestante, anchuraTramo);

    if (baseTramo > 0) {
      const cuotaTramo = baseTramo * (tramo.tipo / 100);
      cuota += cuotaTramo;
      desglose.push({
        desde: tramoDe,
        hasta: tramoHasta,
        tipo: tramo.tipo,
        baseAplicada: baseTramo,
        cuota: cuotaTramo,
      });
      baseRestante -= baseTramo;
    }
    limiteAnterior = tramo.hasta;
    if (baseRestante <= 0) break;
  }

  return { cuota, desglose };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimuladorDesgloseNominaPage() {
  // Inputs
  const [bruto, setBruto] = useState<number>(30000);
  const [pagasAnuales, setPagasAnuales] = useState<12 | 14 | 15>(14);
  const [modoIRPF, setModoIRPF] = useState<ModoIRPF>('auto');
  const [retencionManual, setRetencionManual] = useState<number>(15);
  const [situacion, setSituacion] = useState<SituacionFamiliar>('soltero');
  const [modoVista, setModoVista] = useState<ModoVista>('detallado');
  const [pasosVisibles, setPasosVisibles] = useState<number>(0);

  // ─── Cálculos ────────────────────────────────────────────────────────────────
  const calculo = useMemo(() => {
    const brutoVal = Math.max(0, bruto);

    // 1) Cotizaciones SS (porción trabajador)
    const tCC = COTIZACIONES_SS_2025.contingenciasComunes;
    const tDes = COTIZACIONES_SS_2025.desempleo;
    const tFP = COTIZACIONES_SS_2025.formacionProfesional;
    const tMEI = COTIZACIONES_SS_2025.mef;
    const totalSSPct = tCC + tDes + tFP + tMEI;

    const cotCC = brutoVal * (tCC / 100);
    const cotDesempleo = brutoVal * (tDes / 100);
    const cotFP = brutoVal * (tFP / 100);
    const cotMEI = brutoVal * (tMEI / 100);
    const totalSS = cotCC + cotDesempleo + cotFP + cotMEI;

    // 2) Rendimiento Neto del Trabajo
    const gastosDeducibles =
      brutoVal > 0 ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0;
    const rnt = Math.max(0, brutoVal - totalSS - gastosDeducibles);

    // 3) Reducción rendimientos del trabajo (art. 20)
    const reduccion = brutoVal > 0 ? calcularReduccionRRT(rnt) : 0;
    const baseImponible = Math.max(0, rnt - reduccion);

    // 4) Mínimos personales y familiares
    const minimoPersonal = calcularMinimoPersonalFamiliar(situacion);
    const baseLiquidable = Math.max(0, baseImponible - minimoPersonal);

    // 5) IRPF
    const { cuota: cuotaAuto, desglose: desgloseTramos } =
      calcularCuotaIRPF(baseLiquidable);

    const irpfRetenido =
      modoIRPF === 'auto' ? cuotaAuto : brutoVal * (retencionManual / 100);

    // 6) Neto
    const netoAnual = Math.max(0, brutoVal - totalSS - irpfRetenido);
    const netoMensual = pagasAnuales > 0 ? netoAnual / pagasAnuales : 0;
    const brutoMensual = pagasAnuales > 0 ? brutoVal / pagasAnuales : 0;

    // KPIs %
    const pctRetenidoTotal =
      brutoVal > 0 ? ((totalSS + irpfRetenido) / brutoVal) * 100 : 0;
    const pctSS = brutoVal > 0 ? (totalSS / brutoVal) * 100 : 0;
    const pctIRPF = brutoVal > 0 ? (irpfRetenido / brutoVal) * 100 : 0;
    const pctNeto = brutoVal > 0 ? (netoAnual / brutoVal) * 100 : 0;

    // Pasos para el desglose visual
    const pasos: PasoNomina[] = [];
    pasos.push({
      etiqueta: 'Salario Bruto Anual',
      importe: brutoVal,
      tipo: 'bruto',
      detalle: `Tu salario bruto antes de cualquier deducción · ${pagasAnuales} pagas`,
      destacado: true,
    });

    if (modoVista === 'detallado') {
      pasos.push({
        etiqueta: `− Cotización SS Contingencias Comunes (${formatNumber(tCC, 2)} %)`,
        importe: brutoVal - cotCC,
        tipo: 'resta_ss',
        delta: cotCC,
        detalle: 'Cobertura de baja por enfermedad común, jubilación e incapacidad',
      });
      pasos.push({
        etiqueta: `− Cotización SS Desempleo (${formatNumber(tDes, 2)} %)`,
        importe: brutoVal - cotCC - cotDesempleo,
        tipo: 'resta_ss',
        delta: cotDesempleo,
        detalle: 'Cobertura del paro (porción trabajador)',
      });
      pasos.push({
        etiqueta: `− Cotización SS Formación Profesional (${formatNumber(tFP, 2)} %)`,
        importe: brutoVal - cotCC - cotDesempleo - cotFP,
        tipo: 'resta_ss',
        delta: cotFP,
        detalle: 'Financiación de cursos de formación continua',
      });
      pasos.push({
        etiqueta: `− Cotización SS MEI (${formatNumber(tMEI, 2)} %)`,
        importe: brutoVal - totalSS,
        tipo: 'resta_ss',
        delta: cotMEI,
        detalle:
          'Mecanismo de Equidad Intergeneracional para sostener el sistema de pensiones',
      });
    } else {
      pasos.push({
        etiqueta: `− Cotizaciones Seguridad Social (${formatNumber(totalSSPct, 2)} %)`,
        importe: brutoVal - totalSS,
        tipo: 'resta_ss',
        delta: totalSS,
        detalle:
          'Suma de Contingencias Comunes, Desempleo, Formación Profesional y MEI',
      });
    }

    pasos.push({
      etiqueta: '= Rendimiento del Trabajo (tras SS)',
      importe: brutoVal - totalSS,
      tipo: 'intermedio',
      detalle: 'Lo que te queda tras cotizar a la Seguridad Social',
    });

    pasos.push({
      etiqueta: `− Gastos deducibles art. 19 (${formatCurrency(gastosDeducibles)})`,
      importe: brutoVal - totalSS - gastosDeducibles,
      tipo: 'gasto',
      delta: gastosDeducibles,
      detalle: 'Gasto deducible general fijo de los rendimientos del trabajo',
    });

    pasos.push({
      etiqueta: `− Reducción rendimientos del trabajo (${formatCurrency(reduccion)})`,
      importe: baseImponible,
      tipo: 'reduccion',
      delta: reduccion,
      detalle: 'Reducción art. 20 LIRPF (decrece a medida que sube el sueldo)',
    });

    pasos.push({
      etiqueta: `− Mínimo personal y familiar (${formatCurrency(minimoPersonal)})`,
      importe: baseLiquidable,
      tipo: 'reduccion',
      delta: minimoPersonal,
      detalle: 'Renta exenta según tu situación familiar',
    });

    pasos.push({
      etiqueta: '= Base Liquidable',
      importe: baseLiquidable,
      tipo: 'intermedio',
      detalle: 'Base sobre la que se aplican los tramos del IRPF',
    });

    pasos.push({
      etiqueta: `− Cuota IRPF (${formatNumber(pctIRPF, 2)} % del bruto)`,
      importe: brutoVal - totalSS - irpfRetenido,
      tipo: 'resta_irpf',
      delta: irpfRetenido,
      detalle:
        modoIRPF === 'auto'
          ? 'Calculada por tramos sobre la base liquidable'
          : `Retención manual del ${formatNumber(retencionManual, 2)} % aplicada al bruto`,
    });

    pasos.push({
      etiqueta: '= Salario NETO Anual',
      importe: netoAnual,
      tipo: 'neto',
      detalle: `Lo que recibes en total a lo largo del año, en ${pagasAnuales} pagas`,
      destacado: true,
    });

    pasos.push({
      etiqueta: `÷ ${pagasAnuales} pagas → Salario NETO mensual`,
      importe: netoMensual,
      tipo: 'neto',
      detalle:
        pagasAnuales === 14
          ? '14 pagas: 12 mensuales + 2 pagas extras (no prorrateadas)'
          : pagasAnuales === 12
            ? '12 pagas prorrateadas (las extras vienen incluidas en cada nómina)'
            : '15 pagas: 14 ordinarias + 1 paga de incentivos',
      destacado: true,
    });

    return {
      brutoVal,
      brutoMensual,
      cotCC,
      cotDesempleo,
      cotFP,
      cotMEI,
      totalSS,
      totalSSPct,
      gastosDeducibles,
      rnt,
      reduccion,
      baseImponible,
      minimoPersonal,
      baseLiquidable,
      cuotaAuto,
      desgloseTramos,
      irpfRetenido,
      netoAnual,
      netoMensual,
      pctRetenidoTotal,
      pctSS,
      pctIRPF,
      pctNeto,
      pasos,
    };
  }, [bruto, pagasAnuales, modoIRPF, retencionManual, situacion, modoVista]);

  // ─── Animación: revelar pasos progresivamente ────────────────────────────────
  useEffect(() => {
    setPasosVisibles(0);
    const total = calculo.pasos.length;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= total; i++) {
      const t = setTimeout(() => setPasosVisibles(i), i * 220);
      timeouts.push(t);
    }
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [calculo.pasos.length, bruto, pagasAnuales, modoIRPF, retencionManual, situacion, modoVista]);

  // ─── Ejemplos preconfigurados ────────────────────────────────────────────────
  const ejemplos: { etiqueta: string; bruto: number; icono: string }[] = [
    { etiqueta: 'Mileurista', bruto: 14000, icono: '💶' },
    { etiqueta: 'Mediano', bruto: 30000, icono: '🧑‍💼' },
    { etiqueta: 'Alto', bruto: 60000, icono: '👔' },
    { etiqueta: 'Directivo', bruto: 120000, icono: '🏢' },
  ];

  // ─── Helpers de estilo de paso ───────────────────────────────────────────────
  const claseDePaso = (tipo: TipoPaso): string => {
    switch (tipo) {
      case 'bruto':
        return styles.pasoBruto;
      case 'resta_ss':
        return styles.pasoRestaSS;
      case 'resta_irpf':
        return styles.pasoRestaIRPF;
      case 'gasto':
      case 'reduccion':
        return styles.pasoReduccion;
      case 'intermedio':
        return styles.pasoIntermedio;
      case 'neto':
        return styles.pasoNeto;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">💼</span>
        <h1 className={styles.title}>Simulador Desglose de Nómina</h1>
        <p className={styles.subtitle}>
          Visualiza paso a paso cómo se transforma tu salario bruto anual en neto
          mensual: cotizaciones a la Seguridad Social, IRPF y deducciones explicadas.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa="IRPF y Seguridad Social 2025"
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
      />

      <LegalNotice />

      <main className={styles.main}>
        {/* Panel inputs */}
        <section className={styles.panel} aria-labelledby="inputs-titulo">
          <h2 id="inputs-titulo" className={styles.panelTitle}>Tus datos</h2>

          {/* Slider bruto anual */}
          <div className={styles.formGroup}>
            <label htmlFor="bruto-slider" className={styles.label}>
              Salario bruto anual: <strong>{formatCurrency(bruto)}</strong>
            </label>
            <input
              id="bruto-slider"
              type="range"
              min={12000}
              max={200000}
              step={500}
              value={bruto}
              onChange={e => setBruto(Number(e.target.value))}
              className={styles.slider}
              aria-label="Salario bruto anual en euros"
            />
            <div className={styles.sliderHints}>
              <span>12.000 €</span>
              <span>200.000 €</span>
            </div>
          </div>

          {/* Ejemplos preconfigurados */}
          <div className={styles.formGroup}>
            <span className={styles.label}>Perfiles de ejemplo</span>
            <div className={styles.ejemplosGrid}>
              {ejemplos.map(ej => (
                <button
                  key={ej.etiqueta}
                  type="button"
                  onClick={() => setBruto(ej.bruto)}
                  className={`${styles.ejemploBtn} ${bruto === ej.bruto ? styles.ejemploActivo : ''}`}
                  aria-label={`Cargar perfil ${ej.etiqueta} (${formatCurrency(ej.bruto)})`}
                >
                  <span className={styles.ejemploIcono} aria-hidden="true">{ej.icono}</span>
                  <span className={styles.ejemploEtiqueta}>{ej.etiqueta}</span>
                  <span className={styles.ejemploImporte}>{formatCurrency(ej.bruto)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pagas anuales */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="pagas-select" className={styles.label}>Pagas anuales</label>
              <select
                id="pagas-select"
                value={pagasAnuales}
                onChange={e => setPagasAnuales(Number(e.target.value) as 12 | 14 | 15)}
                className={styles.select}
              >
                <option value={12}>12 pagas (prorrateadas)</option>
                <option value={14}>14 pagas (sin prorratear)</option>
                <option value={15}>15 pagas (con incentivos)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="situacion-select" className={styles.label}>Situación familiar</label>
              <select
                id="situacion-select"
                value={situacion}
                onChange={e => setSituacion(e.target.value as SituacionFamiliar)}
                className={styles.select}
              >
                <option value="soltero">Soltero/a sin hijos</option>
                <option value="casado_un_ingreso">Casado/a un ingreso</option>
                <option value="un_hijo">Familia con 1 hijo</option>
                <option value="dos_o_mas_hijos">Familia con 2 o más hijos</option>
              </select>
            </div>
          </div>

          {/* Modo IRPF */}
          <div className={styles.formGroup}>
            <span className={styles.label}>Retención IRPF</span>
            <div className={styles.modoToggle} role="group" aria-label="Modo de cálculo IRPF">
              <button
                type="button"
                onClick={() => setModoIRPF('auto')}
                className={`${styles.modoBtn} ${modoIRPF === 'auto' ? styles.modoActivo : ''}`}
              >
                Calcular automáticamente
              </button>
              <button
                type="button"
                onClick={() => setModoIRPF('manual')}
                className={`${styles.modoBtn} ${modoIRPF === 'manual' ? styles.modoActivo : ''}`}
              >
                Manual
              </button>
            </div>
            {modoIRPF === 'manual' && (
              <div className={styles.manualSlider}>
                <label htmlFor="ret-manual" className={styles.subLabel}>
                  Retención IRPF aplicada: <strong>{formatNumber(retencionManual, 1)} %</strong>
                </label>
                <input
                  id="ret-manual"
                  type="range"
                  min={0}
                  max={47}
                  step={0.5}
                  value={retencionManual}
                  onChange={e => setRetencionManual(Number(e.target.value))}
                  className={styles.slider}
                  aria-label="Porcentaje de retención IRPF manual"
                />
              </div>
            )}
          </div>

          {/* Modo vista simple/detallado */}
          <div className={styles.formGroup}>
            <span className={styles.label}>Modo de visualización</span>
            <div className={styles.modoToggle} role="group" aria-label="Modo de visualización">
              <button
                type="button"
                onClick={() => setModoVista('simple')}
                className={`${styles.modoBtn} ${modoVista === 'simple' ? styles.modoActivo : ''}`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setModoVista('detallado')}
                className={`${styles.modoBtn} ${modoVista === 'detallado' ? styles.modoActivo : ''}`}
              >
                Detallado
              </button>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className={styles.kpiGrid} aria-label="Indicadores clave">
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Bruto anual</span>
            <span className={styles.kpiValue}>{formatCurrency(calculo.brutoVal)}</span>
            <span className={styles.kpiHint}>{formatCurrency(calculo.brutoMensual)} /paga</span>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiSS}`}>
            <span className={styles.kpiLabel}>Total Seguridad Social</span>
            <span className={styles.kpiValue}>{formatCurrency(calculo.totalSS)}</span>
            <span className={styles.kpiHint}>{formatNumber(calculo.pctSS, 2)} % del bruto</span>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiIRPF}`}>
            <span className={styles.kpiLabel}>Total IRPF retenido</span>
            <span className={styles.kpiValue}>{formatCurrency(calculo.irpfRetenido)}</span>
            <span className={styles.kpiHint}>{formatNumber(calculo.pctIRPF, 2)} % del bruto</span>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiNeto}`}>
            <span className={styles.kpiLabel}>Neto anual</span>
            <span className={styles.kpiValue}>{formatCurrency(calculo.netoAnual)}</span>
            <span className={styles.kpiHint}>{formatNumber(calculo.pctNeto, 2)} % del bruto</span>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiNeto}`}>
            <span className={styles.kpiLabel}>Neto mensual</span>
            <span className={styles.kpiValue}>{formatCurrency(calculo.netoMensual)}</span>
            <span className={styles.kpiHint}>{pagasAnuales} pagas/año</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>% retenido total</span>
            <span className={styles.kpiValue}>{formatNumber(calculo.pctRetenidoTotal, 2)} %</span>
            <span className={styles.kpiHint}>SS + IRPF</span>
          </div>
        </section>

        {/* Sankey simplificado */}
        <section className={styles.panel} aria-labelledby="sankey-titulo">
          <h2 id="sankey-titulo" className={styles.panelTitle}>Composición del bruto</h2>
          <div className={styles.sankeyBar}>
            <div
              className={styles.sankeySS}
              style={{ width: `${Math.max(0, calculo.pctSS)}%` }}
              title={`Seguridad Social: ${formatCurrency(calculo.totalSS)}`}
            >
              <span className={styles.sankeyLabel}>SS {formatNumber(calculo.pctSS, 1)}%</span>
            </div>
            <div
              className={styles.sankeyIRPF}
              style={{ width: `${Math.max(0, calculo.pctIRPF)}%` }}
              title={`IRPF: ${formatCurrency(calculo.irpfRetenido)}`}
            >
              <span className={styles.sankeyLabel}>IRPF {formatNumber(calculo.pctIRPF, 1)}%</span>
            </div>
            <div
              className={styles.sankeyNeto}
              style={{ width: `${Math.max(0, calculo.pctNeto)}%` }}
              title={`Neto: ${formatCurrency(calculo.netoAnual)}`}
            >
              <span className={styles.sankeyLabel}>Neto {formatNumber(calculo.pctNeto, 1)}%</span>
            </div>
          </div>
          <div className={styles.sankeyLeyenda}>
            <span><span className={`${styles.legendDot} ${styles.legendSS}`} /> Seguridad Social</span>
            <span><span className={`${styles.legendDot} ${styles.legendIRPF}`} /> IRPF</span>
            <span><span className={`${styles.legendDot} ${styles.legendNeto}`} /> Neto recibido</span>
          </div>
        </section>

        {/* Desglose paso a paso */}
        <section className={styles.panel} aria-labelledby="desglose-titulo">
          <h2 id="desglose-titulo" className={styles.panelTitle}>
            Desglose paso a paso (animado)
          </h2>
          <ol className={styles.desgloseList}>
            {calculo.pasos.map((paso, idx) => {
              const visible = idx < pasosVisibles;
              return (
                <li
                  key={idx}
                  className={`${styles.desglosePaso} ${claseDePaso(paso.tipo)} ${
                    paso.destacado ? styles.pasoDestacado : ''
                  } ${visible ? styles.pasoVisible : styles.pasoOculto}`}
                  aria-hidden={!visible}
                >
                  <div className={styles.pasoNumero} aria-hidden="true">{idx + 1}</div>
                  <div className={styles.pasoContenido}>
                    <div className={styles.pasoEtiqueta}>{paso.etiqueta}</div>
                    {paso.detalle && (
                      <div className={styles.pasoDetalle}>{paso.detalle}</div>
                    )}
                    {typeof paso.delta === 'number' && paso.delta > 0 && (
                      <div className={styles.pasoDelta}>
                        Se descuenta: {formatCurrency(paso.delta)}
                      </div>
                    )}
                  </div>
                  <div className={styles.pasoImporte}>
                    {formatCurrency(paso.importe)}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Desglose por tramos IRPF */}
        {modoIRPF === 'auto' && calculo.desgloseTramos.length > 0 && (
          <section className={styles.panel} aria-labelledby="tramos-titulo">
            <h2 id="tramos-titulo" className={styles.panelTitle}>
              Tramos IRPF aplicados
            </h2>
            <div className={styles.tableWrapper}>
              <table className={styles.tramosTable}>
                <thead>
                  <tr>
                    <th>Desde</th>
                    <th>Hasta</th>
                    <th>Tipo</th>
                    <th>Base aplicada</th>
                    <th>Cuota</th>
                  </tr>
                </thead>
                <tbody>
                  {calculo.desgloseTramos.map((t, i) => (
                    <tr key={i}>
                      <td>{formatCurrency(t.desde)}</td>
                      <td>{t.hasta !== null ? formatCurrency(t.hasta) : 'En adelante'}</td>
                      <td>{formatNumber(t.tipo, 0)} %</td>
                      <td>{formatCurrency(t.baseAplicada)}</td>
                      <td>{formatCurrency(t.cuota)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tramosNota}>
              El IRPF es <strong>progresivo por tramos</strong>: cada porción de tu base
              liquidable tributa al tipo del tramo en que cae, no al tipo más alto sobre el total.
            </p>
          </section>
        )}
      </main>

      <EducationalSection
        title="Guía de la Nómina Española"
        subtitle="Cómo se descompone tu salario bruto"
        icon="💼"
      >
        {/* Sección 1: Componentes de la nómina */}
        <section className={styles.guideSection}>
          <h3>Componentes de la Nómina</h3>
          <p>
            Tu nómina española descompone el salario en varios conceptos. Cada uno tiene
            una fórmula y una referencia legal específica:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Fórmula orientativa</th>
                  <th>Quién lo paga</th>
                  <th>Referencia legal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Salario bruto</strong></td>
                  <td>Salario base + complementos + pagas extra</td>
                  <td>Empresa</td>
                  <td>Estatuto de los Trabajadores (ET) art. 26</td>
                </tr>
                <tr>
                  <td><strong>SS Contingencias Comunes</strong></td>
                  <td>Bruto × 4,70 %</td>
                  <td>Trabajador (también empresa: 23,60 %)</td>
                  <td>LGSS art. 145; Orden PJC/51/2025</td>
                </tr>
                <tr>
                  <td><strong>SS Desempleo</strong></td>
                  <td>Bruto × 1,55 %</td>
                  <td>Trabajador (también empresa: 5,50 %)</td>
                  <td>LGSS art. 273; LPGE 2025</td>
                </tr>
                <tr>
                  <td><strong>SS Formación Profesional</strong></td>
                  <td>Bruto × 0,10 %</td>
                  <td>Trabajador (también empresa: 0,60 %)</td>
                  <td>Ley 30/2015 de Formación Profesional</td>
                </tr>
                <tr>
                  <td><strong>SS MEI</strong></td>
                  <td>Bruto × 0,12 %</td>
                  <td>Trabajador (también empresa: 0,67 %)</td>
                  <td>RDL 2/2023 — Mecanismo Equidad Intergeneracional</td>
                </tr>
                <tr>
                  <td><strong>Retención IRPF</strong></td>
                  <td>Variable según tramos y situación familiar</td>
                  <td>Trabajador (la empresa la ingresa en AEAT)</td>
                  <td>Ley 35/2006 IRPF + Reglamento</td>
                </tr>
                <tr>
                  <td><strong>Salario neto</strong></td>
                  <td>Bruto − cotizaciones SS − retención IRPF</td>
                  <td>Lo recibes tú</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de uso reales */}
        <section className={styles.guideSection}>
          <h3>Casos de Uso Reales</h3>
          <p>Cuatro perfiles típicos en España con cálculos orientativos a 2025:</p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>👨‍🔧 Mileurista — 14.000 € brutos / 14 pagas</h4>
              <p>
                <strong>SS trabajador:</strong> ~917 €/año<br />
                <strong>IRPF retenido:</strong> ~0–200 € (mínimo personal absorbe casi toda la base)<br />
                <strong>Neto anual:</strong> ~12.880 €<br />
                <strong>Neto mensual:</strong> ~920 €/paga
              </p>
              <p className={styles.escenarioTip}>
                Con un solo pagador y &lt;22.000 € no estás obligado a declarar IRPF.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🧑‍💼 Mediano — 30.000 € brutos / 14 pagas</h4>
              <p>
                <strong>SS trabajador:</strong> ~1.940 €/año<br />
                <strong>IRPF retenido:</strong> ~3.200–3.600 €<br />
                <strong>Neto anual:</strong> ~24.500 €<br />
                <strong>Neto mensual:</strong> ~1.750 €/paga
              </p>
              <p className={styles.escenarioTip}>
                Tipo efectivo total ~18 %. Es el rango donde la declaración suele salir
                cercana a 0 si solo hay un pagador.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>👔 Alto — 60.000 € brutos / 14 pagas</h4>
              <p>
                <strong>SS trabajador:</strong> ~3.880 €/año (con base máxima ~3.555 €)<br />
                <strong>IRPF retenido:</strong> ~12.500–13.500 €<br />
                <strong>Neto anual:</strong> ~43.000 €<br />
                <strong>Neto mensual:</strong> ~3.070 €/paga
              </p>
              <p className={styles.escenarioTip}>
                Entrarías en el tramo del 37 %. Plan de pensiones (1.500 €) ahorra ~555 €.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🏢 Directivo — 120.000 € brutos / 14 pagas</h4>
              <p>
                <strong>SS trabajador (base máx.):</strong> ~3.555 €/año<br />
                <strong>IRPF retenido:</strong> ~36.000–39.000 €<br />
                <strong>Neto anual:</strong> ~80.500 €<br />
                <strong>Neto mensual:</strong> ~5.750 €/paga
              </p>
              <p className={styles.escenarioTip}>
                Tramo marginal del 45 %. La SS topa en la base máxima, no sube proporcionalmente.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section className={styles.guideSection}>
          <h3>Preguntas Frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Por qué tu neto es menor de lo que esperabas?</h4>
              <p>
                Porque del bruto se descuentan tres cosas: cotizaciones a la Seguridad
                Social del trabajador (~6,47 %), retención de IRPF (variable según tu
                base liquidable, entre 0 y 47 %) y, si las hay, deducciones por convenio
                (cuota sindical, embargos). En España, una persona con 30.000 € brutos
                recibe en mano alrededor de 24.000–25.000 € netos al año.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Diferencia entre 12, 14 y 15 pagas?</h4>
              <p>
                Con <strong>14 pagas</strong> recibes 12 mensuales más 2 pagas extras
                (junio y diciembre habitualmente) que <em>no</em> están prorrateadas. Con
                <strong> 12 pagas prorrateadas</strong> el importe de las extras se reparte
                en las 12 nóminas (mensualidades más altas, pero sin sorpresas en junio
                ni diciembre). Con <strong>15 pagas</strong> hay una paga adicional, típicamente
                ligada a productividad o beneficios. El total anual es el mismo; cambia la
                distribución.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué cotiza el empresario y por qué no aparece en mi nómina?</h4>
              <p>
                La empresa paga, además de tu nómina, otra cotización a la Seguridad
                Social que <strong>no se descuenta de tu bruto</strong>: aproximadamente
                un 30 % adicional sobre tu base de cotización (Contingencias Comunes 23,60 %,
                Desempleo 5,50 %, Formación 0,60 %, FOGASA 0,20 %, MEI 0,67 %). Es un
                coste empresarial, por eso contratar a alguien con 30.000 € brutos cuesta
                a la empresa unos 39.000 €.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Las pagas extras tributan?</h4>
              <p>
                Sí. Las pagas extras forman parte del salario bruto anual y tributan
                igual que el resto. La diferencia es que en muchas empresas no se les
                aplica retención IRPF en el momento de cobrarlas, pero se incluyen en
                la base anual para calcular la retención del resto del año. Si son
                prorrateadas (12 pagas), están integradas en cada nómina mensual.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La retención IRPF de la nómina es definitiva?</h4>
              <p>
                No. Es un <strong>pago a cuenta</strong> del IRPF que se regulariza en
                la declaración anual de la renta (entre abril y junio del año siguiente).
                Si te retuvieron de más, Hacienda te devuelve la diferencia. Si te
                retuvieron de menos (por ejemplo, dos pagadores no comunicados con
                modelo 145), tendrás que pagar la diferencia en la declaración.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo afectan las cargas familiares?</h4>
              <p>
                Las situaciones familiares (cónyuge sin ingresos, hijos a cargo, hijos
                con discapacidad, ascendientes mayores de 65) <strong>aumentan el mínimo
                personal y familiar</strong>, que es la parte de tu base liquidable
                exenta de IRPF. Cada hijo añade entre 2.400 € (1.º) y 4.500 € (4.º+) al
                mínimo. Comunicar correctamente estos datos a la empresa mediante el
                <strong> modelo 145</strong> reduce la retención mensual.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 4: Cómo verificar tu nómina paso a paso */}
        <section className={styles.guideSection}>
          <h3>Cómo Verificar tu Nómina — Paso a Paso</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Comprueba tu salario bruto y los conceptos</h4>
                <p>
                  Verifica que en la parte superior aparezca tu salario base, los
                  complementos pactados (antigüedad, productividad, plus de transporte,
                  comida) y, en su caso, la prorrata de pagas extra. La suma debe
                  coincidir con tu contrato y convenio colectivo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Revisa la base de cotización a la Seguridad Social</h4>
                <p>
                  La base de cotización suele coincidir con el bruto (excepto si superas
                  la base máxima de 4.909,50 €/mes en 2025). Sobre ella se calculan los
                  porcentajes del trabajador: 4,70 % CC + 1,55 % desempleo + 0,10 % FP
                  + 0,12 % MEI = <strong>6,47 % total</strong>.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Comprueba el porcentaje de retención IRPF</h4>
                <p>
                  La empresa aplica un porcentaje calculado al inicio del año en
                  función de tu salario bruto previsto, situación familiar (modelo 145)
                  y comunidad autónoma. Si tus circunstancias cambian (matrimonio, hijo,
                  segundo pagador), <strong>solicita actualizar el modelo 145</strong>.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Calcula tu líquido a percibir</h4>
                <p>
                  Líquido = Total devengado − cotizaciones SS − retención IRPF − otras
                  deducciones (anticipos, embargos, cuota sindical). Este importe debe
                  coincidir con el ingreso bancario que recibes cada mes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Conserva tus nóminas durante al menos 4 años</h4>
                <p>
                  Es el plazo de prescripción tributaria. Las nóminas son la prueba
                  fundamental para reclamar diferencias salariales, acreditar ingresos
                  ante alquileres o hipotecas, y cotejar con el certificado de
                  retenciones que la empresa entrega en enero-febrero.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 5: Mejores prácticas */}
        <section className={styles.guideSection}>
          <h3>Mejores Prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h4>Mantén tu modelo 145 al día</h4>
              <p>
                Comunica a la empresa cualquier cambio de situación familiar (matrimonio,
                divorcio, hijos, ascendientes a cargo). Una situación bien declarada
                puede rebajar tu retención mensual de forma significativa.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💰</span>
              <h4>Aporta a un plan de pensiones antes del 31/12</h4>
              <p>
                Reduce directamente tu base imponible. Con tipo marginal del 30 %, cada
                1.000 € aportados son 300 € menos de IRPF. Límite individual: 1.500 €/año
                (10.000 € si la empresa coaporta).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧮</span>
              <h4>Compara siempre bruto, neto y coste empresa</h4>
              <p>
                Al negociar un sueldo no mires solo el bruto: pregunta por el neto (lo
                que cobras) y, si eres autónomo o consultor, compara con el coste
                empresa (lo que la empresa realmente paga, ~30 % por encima del bruto).
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📅</span>
              <h4>Si tienes dos pagadores, ajusta retenciones</h4>
              <p>
                Comunica a tu pagador principal mediante modelo 145 los ingresos del
                segundo. Sin esa comunicación, la declaración de junio puede salir a
                pagar entre 500 y 2.000 €.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <h4>Guarda nóminas, certificados y modelo 145</h4>
              <p>
                Hacienda y la Inspección de Trabajo pueden revisar 4 años atrás. Las
                nóminas te sirven también para reclamar atrasos por convenio o
                acreditar ingresos en alquileres y hipotecas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <h4>Revisa tu vida laboral y bases de cotización</h4>
              <p>
                Una vez al año descarga tu informe de vida laboral en la sede electrónica
                de la Seguridad Social. Las bases de cotización determinarán tu pensión
                futura: errores no detectados son difíciles de corregir años después.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 6: Errores comunes (warning box) */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Frecuentes que Pueden Costarte Dinero</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir bruto y neto al negociar el sueldo.</strong> Aceptar
              30.000 € pensando que es lo que cobrarás cuando en realidad son 24.000 €
              netos es uno de los errores más caros al cambiar de empleo.
            </li>
            <li>
              <strong>No actualizar el modelo 145 tras casarse o tener un hijo.</strong>
              {' '}La retención mensual sigue como si fueras soltero, retienen de más
              durante todo el año y solo lo recuperarás en la declaración del año
              siguiente (si la haces).
            </li>
            <li>
              <strong>Asumir que con un solo pagador nunca sales a pagar.</strong> Si
              durante el año tuviste indemnización, atrasos de convenio o pluses
              variables, la retención puede haber sido insuficiente y la declaración
              podría salir a pagar.
            </li>
            <li>
              <strong>Olvidar declarar dos pagadores.</strong> Con dos pagadores y el
              segundo &gt;1.500 € el umbral de obligación de declarar baja a 15.876 €.
              Muchas multas vienen de aquí: «no llegaba a 22.000» pero sí superaba el
              umbral de varios pagadores.
            </li>
            <li>
              <strong>No verificar la base de cotización.</strong> Si la empresa cotiza
              por una base inferior a tu salario real, tu pensión futura será menor.
              Es un fraude que solo se detecta revisando la vida laboral con calma.
            </li>
            <li>
              <strong>No guardar el certificado de retenciones de enero-febrero.</strong>
              Es el documento clave para hacer la declaración y reclamar errores. Si
              lo pierdes y la empresa cierra, recuperarlo puede ser muy complicado.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-desglose-nomina')} />
      <ShareCard appName="simulador-desglose-nomina" />
      <Footer appName="simulador-desglose-nomina" />
    </div>
  );
}
