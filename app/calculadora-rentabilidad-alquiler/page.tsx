'use client';

import { useState } from 'react';
import styles from './CalculadoraRentabilidadAlquiler.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatCurrency, formatNumber } from '@/lib';

// ===== TIPOS =====
interface ResultadoRentabilidad {
  // Inversión inicial
  precioCompra: number;
  gastosCompra: number;
  reforma: number;
  inversionTotal: number;
  // Ingresos anuales
  alquilerBrutoAnual: number;
  // Gastos anuales
  ibi: number;
  comunidad: number;
  seguro: number;
  mantenimiento: number;
  cuotaHipotecaAnual: number;
  gastosTotalesAnual: number;
  // Resultados
  rentabilidadBruta: number;
  rentabilidadNeta: number;
  cashFlowMensual: number;
  paybackAnios: number;
  // Estado
  conHipoteca: boolean;
}

// ===== HELPERS =====
function calcularCuotaHipoteca(capital: number, tasaAnual: number, anios: number): number {
  if (capital <= 0 || anios <= 0) return 0;
  const r = tasaAnual / 100 / 12;
  const n = anios * 12;
  if (r === 0) return capital / n;
  return (capital * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function getSemaforo(rentabilidadNeta: number): { icon: string; titulo: string; descripcion: string } {
  if (rentabilidadNeta >= 7) {
    return {
      icon: '🟢',
      titulo: 'Excelente rentabilidad',
      descripcion: `Una rentabilidad neta del ${formatNumber(rentabilidadNeta, 1)}% es muy atractiva. Supera claramente la media del mercado inmobiliario español (3-5%) y los bonos del Estado.`,
    };
  } else if (rentabilidadNeta >= 4) {
    return {
      icon: '🟡',
      titulo: 'Rentabilidad aceptable',
      descripcion: `Una rentabilidad neta del ${formatNumber(rentabilidadNeta, 1)}% está en la media del mercado. Es razonable si valoras la seguridad del ladrillo frente a otros activos.`,
    };
  } else if (rentabilidadNeta >= 1) {
    return {
      icon: '🟠',
      titulo: 'Rentabilidad baja',
      descripcion: `Una rentabilidad neta del ${formatNumber(rentabilidadNeta, 1)}% es baja. Considera si existen otras inversiones más rentables o si el precio de compra es elevado.`,
    };
  } else {
    return {
      icon: '🔴',
      titulo: 'Inversión con pérdidas',
      descripcion: `El cash flow es negativo. Los gastos superan los ingresos. Revisa el precio de compra, los gastos estimados o el alquiler esperado.`,
    };
  }
}

export default function CalculadoraRentabilidadAlquilerPage() {
  // ===== ESTADO: PRECIO DE COMPRA =====
  const [precioCompra, setPrecioCompra] = useState('200000');
  const [porcentajeGastosCompra, setPorcentajeGastosCompra] = useState(10); // % gastos compra (ITP, notaría, registro)
  const [reforma, setReforma] = useState('0');

  // ===== ESTADO: INGRESOS =====
  const [alquilerMensual, setAlquilerMensual] = useState('900');
  const [tasaOcupacion, setTasaOcupacion] = useState(92); // % de ocupación anual

  // ===== ESTADO: GASTOS ANUALES =====
  const [ibi, setIbi] = useState('400');
  const [comunidad, setComunidad] = useState('1200');
  const [seguro, setSeguro] = useState('300');
  const [mantenimiento, setMantenimiento] = useState('500');

  // ===== ESTADO: HIPOTECA (OPCIONAL) =====
  const [conHipoteca, setConHipoteca] = useState(false);
  const [entradaHipoteca, setEntradaHipoteca] = useState('40000');
  const [tasaHipoteca, setTasaHipoteca] = useState('3.5');
  const [aniosHipoteca, setAniosHipoteca] = useState(25);

  // ===== RESULTADO =====
  const [resultado, setResultado] = useState<ResultadoRentabilidad | null>(null);

  const calcular = () => {
    const compra = parseFloat(precioCompra.replace(/\./g, '').replace(',', '.')) || 0;
    const reformaNum = parseFloat(reforma.replace(/\./g, '').replace(',', '.')) || 0;
    const alqMensual = parseFloat(alquilerMensual.replace(/\./g, '').replace(',', '.')) || 0;
    const ibiNum = parseFloat(ibi.replace(/\./g, '').replace(',', '.')) || 0;
    const comunidadNum = parseFloat(comunidad.replace(/\./g, '').replace(',', '.')) || 0;
    const seguroNum = parseFloat(seguro.replace(/\./g, '').replace(',', '.')) || 0;
    const mantenimientoNum = parseFloat(mantenimiento.replace(/\./g, '').replace(',', '.')) || 0;

    // Inversión inicial
    const gastosCompra = compra * (porcentajeGastosCompra / 100);
    const inversionTotal = compra + gastosCompra + reformaNum;

    // Ingresos anuales ajustados por tasa de ocupación
    const alquilerBrutoAnual = alqMensual * 12 * (tasaOcupacion / 100);

    // Hipoteca
    let cuotaHipotecaMensual = 0;
    let capitalHipoteca = 0;
    if (conHipoteca) {
      const entrada = parseFloat(entradaHipoteca.replace(/\./g, '').replace(',', '.')) || 0;
      capitalHipoteca = compra - entrada;
      const tasa = parseFloat(tasaHipoteca.replace(',', '.')) || 3.5;
      cuotaHipotecaMensual = calcularCuotaHipoteca(capitalHipoteca, tasa, aniosHipoteca);
    }
    const cuotaHipotecaAnual = cuotaHipotecaMensual * 12;

    // Gastos anuales totales
    const gastosTotalesAnual = ibiNum + comunidadNum + seguroNum + mantenimientoNum + cuotaHipotecaAnual;

    // Rentabilidad bruta (sin gastos)
    const ingresosBrutos = alqMensual * 12;
    const rentabilidadBruta = inversionTotal > 0 ? (ingresosBrutos / inversionTotal) * 100 : 0;

    // Rentabilidad neta
    const ingresosNetos = alquilerBrutoAnual - gastosTotalesAnual;
    const rentabilidadNeta = inversionTotal > 0 ? (ingresosNetos / inversionTotal) * 100 : 0;

    // Cash flow mensual
    const cashFlowMensual = (alquilerBrutoAnual - gastosTotalesAnual) / 12;

    // Payback (años para recuperar inversión)
    const paybackAnios = ingresosNetos > 0 ? inversionTotal / ingresosNetos : 9999;

    setResultado({
      precioCompra: compra,
      gastosCompra,
      reforma: reformaNum,
      inversionTotal,
      alquilerBrutoAnual,
      ibi: ibiNum,
      comunidad: comunidadNum,
      seguro: seguroNum,
      mantenimiento: mantenimientoNum,
      cuotaHipotecaAnual,
      gastosTotalesAnual,
      rentabilidadBruta,
      rentabilidadNeta,
      cashFlowMensual,
      paybackAnios,
      conHipoteca,
    });
  };

  const semaforo = resultado ? getSemaforo(resultado.rentabilidadNeta) : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🏘️ Rentabilidad de Inversión en Alquiler</h1>
        <p className={styles.heroSubtitle}>
          Calcula el ROI bruto y neto de comprar un piso para alquilar. Cash flow real, payback y análisis completo de gastos.
        </p>
      </header>

      <LegalNotice />

      {/* ===== SECCIÓN 1: INVERSIÓN INICIAL ===== */}
      <section className={styles.formSection} aria-labelledby="sec-inversion">
        <h2 className={styles.sectionTitle} id="sec-inversion">
          <span aria-hidden="true">💰</span> Inversión inicial
        </h2>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="precioCompra">
              Precio de compra (€)
            </label>
            <input
              id="precioCompra"
              type="text"
              inputMode="decimal"
              value={precioCompra}
              onChange={e => setPrecioCompra(e.target.value)}
              placeholder="200.000"
              style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Precio de compra en euros"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="reforma">
              Coste de reforma (€) <span className={styles.labelHint}>(opcional)</span>
            </label>
            <input
              id="reforma"
              type="text"
              inputMode="decimal"
              value={reforma}
              onChange={e => setReforma(e.target.value)}
              placeholder="0"
              style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Coste de reforma en euros"
            />
          </div>
          <div className={styles.inputGroupFull}>
            <label className={styles.label} htmlFor="gastos-compra">
              Gastos de compra: <strong style={{ color: 'var(--primary)' }}>{porcentajeGastosCompra}%</strong>
              <span className={styles.labelHint}>(ITP/IVA, notaría, registro, gestoría)</span>
            </label>
            <div className={styles.rangeContainer}>
              <input
                id="gastos-compra"
                type="range"
                min={7}
                max={15}
                step={0.5}
                value={porcentajeGastosCompra}
                onChange={e => setPorcentajeGastosCompra(parseFloat(e.target.value))}
                className={styles.rangeInput}
                aria-label={`Gastos de compra: ${porcentajeGastosCompra}%`}
              />
              <span className={styles.rangeValue}>{porcentajeGastosCompra}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 2: INGRESOS ===== */}
      <section className={styles.formSection} aria-labelledby="sec-ingresos">
        <h2 className={styles.sectionTitle} id="sec-ingresos">
          <span aria-hidden="true">📈</span> Ingresos por alquiler
        </h2>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="alquilerMensual">
              Alquiler mensual (€)
            </label>
            <input
              id="alquilerMensual"
              type="text"
              inputMode="decimal"
              value={alquilerMensual}
              onChange={e => setAlquilerMensual(e.target.value)}
              placeholder="900"
              style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Alquiler mensual en euros"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="ocupacion">
              Tasa de ocupación: <strong style={{ color: 'var(--primary)' }}>{tasaOcupacion}%</strong>
              <span className={styles.labelHint}>(meses ocupados / año)</span>
            </label>
            <div className={styles.rangeContainer}>
              <input
                id="ocupacion"
                type="range"
                min={50}
                max={100}
                step={1}
                value={tasaOcupacion}
                onChange={e => setTasaOcupacion(parseInt(e.target.value))}
                className={styles.rangeInput}
                aria-label={`Tasa de ocupación: ${tasaOcupacion}%`}
              />
              <span className={styles.rangeValue}>{tasaOcupacion}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 3: GASTOS ===== */}
      <section className={styles.formSection} aria-labelledby="sec-gastos">
        <h2 className={styles.sectionTitle} id="sec-gastos">
          <span aria-hidden="true">📉</span> Gastos anuales estimados
        </h2>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="ibi">IBI anual (€)</label>
            <input
              id="ibi"
              type="text"
              inputMode="decimal"
              value={ibi}
              onChange={e => setIbi(e.target.value)}
              placeholder="400"
              style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="IBI anual en euros"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="comunidad">Gastos comunidad anuales (€)</label>
            <input
              id="comunidad"
              type="text"
              inputMode="decimal"
              value={comunidad}
              onChange={e => setComunidad(e.target.value)}
              placeholder="1200"
              style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Gastos de comunidad anuales en euros"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="seguro">Seguro hogar/alquiler anual (€)</label>
            <input
              id="seguro"
              type="text"
              inputMode="decimal"
              value={seguro}
              onChange={e => setSeguro(e.target.value)}
              placeholder="300"
              style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Seguro de hogar o alquiler anual en euros"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="mantenimiento">Reparaciones/mantenimiento anuales (€)</label>
            <input
              id="mantenimiento"
              type="text"
              inputMode="decimal"
              value={mantenimiento}
              onChange={e => setMantenimiento(e.target.value)}
              placeholder="500"
              style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
              aria-label="Reparaciones y mantenimiento anuales en euros"
            />
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 4: HIPOTECA (OPCIONAL) ===== */}
      <section className={styles.formSection} aria-labelledby="sec-hipoteca">
        <h2 className={styles.sectionTitle} id="sec-hipoteca">
          <span aria-hidden="true">🏦</span> Hipoteca <span className={styles.labelHint}>(opcional)</span>
        </h2>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroupFull}>
            <label className={styles.toggle} htmlFor="toggle-hipoteca">
              <input
                id="toggle-hipoteca"
                type="checkbox"
                checked={conHipoteca}
                onChange={e => setConHipoteca(e.target.checked)}
                className={styles.checkboxInput}
                aria-checked={conHipoteca}
              />
              <span className={styles.toggleLabel}>Incluir hipoteca en el cálculo</span>
            </label>
          </div>
          {conHipoteca && (
            <div className={styles.mortgageFields}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="entrada">Entrada (€)</label>
                <input
                  id="entrada"
                  type="text"
                  inputMode="decimal"
                  value={entradaHipoteca}
                  onChange={e => setEntradaHipoteca(e.target.value)}
                  placeholder="40000"
                  style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  aria-label="Entrada de la hipoteca en euros"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="tasa">Tipo interés anual (%)</label>
                <input
                  id="tasa"
                  type="text"
                  inputMode="decimal"
                  value={tasaHipoteca}
                  onChange={e => setTasaHipoteca(e.target.value)}
                  placeholder="3,5"
                  style={{ padding: '10px 14px', border: '2px solid var(--border, #e5e7eb)', borderRadius: '8px', fontSize: '1rem', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  aria-label="Tipo de interés anual de la hipoteca"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="anios-hipoteca">
                  Plazo: <strong style={{ color: 'var(--primary)' }}>{aniosHipoteca} años</strong>
                </label>
                <div className={styles.rangeContainer}>
                  <input
                    id="anios-hipoteca"
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={aniosHipoteca}
                    onChange={e => setAniosHipoteca(parseInt(e.target.value))}
                    className={styles.rangeInput}
                    aria-label={`Plazo hipoteca: ${aniosHipoteca} años`}
                  />
                  <span className={styles.rangeValue}>{aniosHipoteca}a</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ===== BOTÓN CALCULAR ===== */}
      <div className={styles.btnWrapper}>
        <button onClick={calcular} className={styles.btnCalcular} aria-label="Calcular rentabilidad">
          Calcular rentabilidad
        </button>
      </div>

      {/* ===== RESULTADOS ===== */}
      {resultado && semaforo && (
        <section className={styles.resultsSection} aria-live="polite" aria-label="Resultados de rentabilidad">
          <h2 className={styles.resultsSectionTitle}>📊 Análisis de rentabilidad</h2>

          {/* Tarjetas principales */}
          <div className={styles.resultsGrid}>
            <div className={`${styles.metricCard} ${styles.highlight}`}>
              <span className={styles.metricIcon} aria-hidden="true">📈</span>
              <div className={styles.metricLabel}>Rentabilidad bruta</div>
              <div className={styles.metricValue}>{formatNumber(resultado.rentabilidadBruta, 2)}%</div>
              <div className={styles.metricSub}>Sin gastos</div>
            </div>
            <div className={`${styles.metricCard} ${resultado.rentabilidadNeta >= 4 ? styles.positive : resultado.rentabilidadNeta >= 1 ? '' : styles.negative}`}>
              <span className={styles.metricIcon} aria-hidden="true">🎯</span>
              <div className={styles.metricLabel}>Rentabilidad neta</div>
              <div className={`${styles.metricValue} ${resultado.rentabilidadNeta >= 4 ? styles.green : resultado.rentabilidadNeta < 1 ? styles.red : ''}`}>{formatNumber(resultado.rentabilidadNeta, 2)}%</div>
              <div className={styles.metricSub}>Con todos los gastos</div>
            </div>
            <div className={`${styles.metricCard} ${resultado.cashFlowMensual >= 0 ? styles.positive : styles.negative}`}>
              <span className={styles.metricIcon} aria-hidden="true">💶</span>
              <div className={styles.metricLabel}>Cash flow mensual</div>
              <div className={`${styles.metricValue} ${resultado.cashFlowMensual >= 0 ? styles.green : styles.red}`}>{formatCurrency(resultado.cashFlowMensual)}</div>
              <div className={styles.metricSub}>Neto mensual estimado</div>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricIcon} aria-hidden="true">⏳</span>
              <div className={styles.metricLabel}>Payback</div>
              <div className={styles.metricValue}>
                {resultado.paybackAnios >= 999 ? '∞' : formatNumber(resultado.paybackAnios, 1)}
                {resultado.paybackAnios < 999 && <span style={{ fontSize: '0.9rem' }}> años</span>}
              </div>
              <div className={styles.metricSub}>Para recuperar inversión</div>
            </div>
          </div>

          {/* Semáforo */}
          <div className={styles.semaforo} role="status">
            <span className={styles.semaforoIcon} aria-hidden="true">{semaforo.icon}</span>
            <div className={styles.semaforoTexto}>
              <p className={styles.semaforoTitulo}>{semaforo.titulo}</p>
              <p className={styles.semaforoDes}>{semaforo.descripcion}</p>
            </div>
          </div>

          {/* Desglose ingresos */}
          <div className={styles.desgloceTable}>
            <h3 className={styles.desgloceTitle}>📋 Desglose de la inversión</h3>
            <div className={styles.tableRow}>
              <span className={styles.rowLabel}>Precio de compra</span>
              <span className={styles.rowValue}>{formatCurrency(resultado.precioCompra)}</span>
            </div>
            <div className={styles.tableRow}>
              <span className={styles.rowLabel}>Gastos de compra ({porcentajeGastosCompra}%)</span>
              <span className={`${styles.rowValue} ${styles.red}`}>− {formatCurrency(resultado.gastosCompra)}</span>
            </div>
            {resultado.reforma > 0 && (
              <div className={styles.tableRow}>
                <span className={styles.rowLabel}>Reforma</span>
                <span className={`${styles.rowValue} ${styles.red}`}>− {formatCurrency(resultado.reforma)}</span>
              </div>
            )}
            <div className={`${styles.tableRow} ${styles.total}`}>
              <span className={styles.rowLabel}>Inversión total</span>
              <span className={styles.rowValue}>{formatCurrency(resultado.inversionTotal)}</span>
            </div>
          </div>

          {/* Desglose ingresos vs gastos */}
          <div className={styles.desgloceTable}>
            <h3 className={styles.desgloceTitle}>💰 Ingresos vs gastos anuales</h3>
            <div className={styles.tableRow}>
              <span className={styles.rowLabel}>Alquiler bruto anual ({tasaOcupacion}% ocupación)</span>
              <span className={`${styles.rowValue} ${styles.green}`}>+ {formatCurrency(resultado.alquilerBrutoAnual)}</span>
            </div>
            <div className={styles.tableRow}>
              <span className={styles.rowLabel}>IBI</span>
              <span className={`${styles.rowValue} ${styles.red}`}>− {formatCurrency(resultado.ibi)}</span>
            </div>
            <div className={styles.tableRow}>
              <span className={styles.rowLabel}>Gastos de comunidad</span>
              <span className={`${styles.rowValue} ${styles.red}`}>− {formatCurrency(resultado.comunidad)}</span>
            </div>
            <div className={styles.tableRow}>
              <span className={styles.rowLabel}>Seguro hogar/alquiler</span>
              <span className={`${styles.rowValue} ${styles.red}`}>− {formatCurrency(resultado.seguro)}</span>
            </div>
            <div className={styles.tableRow}>
              <span className={styles.rowLabel}>Reparaciones y mantenimiento</span>
              <span className={`${styles.rowValue} ${styles.red}`}>− {formatCurrency(resultado.mantenimiento)}</span>
            </div>
            {resultado.conHipoteca && resultado.cuotaHipotecaAnual > 0 && (
              <div className={styles.tableRow}>
                <span className={styles.rowLabel}>Cuotas hipoteca anuales</span>
                <span className={`${styles.rowValue} ${styles.red}`}>− {formatCurrency(resultado.cuotaHipotecaAnual)}</span>
              </div>
            )}
            <div className={`${styles.tableRow} ${styles.total}`}>
              <span className={styles.rowLabel}>Resultado anual neto</span>
              <span className={`${styles.rowValue} ${resultado.cashFlowMensual >= 0 ? styles.green : styles.red}`}>
                {resultado.cashFlowMensual >= 0 ? '+ ' : ''}{formatCurrency((resultado.alquilerBrutoAnual - resultado.gastosTotalesAnual))}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* NOTA FISCAL */}
      {resultado && (
        <div className={styles.notaFiscal} role="note" aria-label="Nota sobre fiscalidad del alquiler">
          <strong>🧾 Fiscalidad del alquiler (orientación)</strong>
          <ul>
            <li><strong>Amortización deducible:</strong> el 3% del valor de construcción del inmueble (excluido el suelo) reduce el rendimiento neto anual en IRPF.</li>
            <li><strong>Reducción por arrendamiento de vivienda habitual:</strong> el rendimiento neto positivo tiene una reducción del 50% en IRPF (60% en contratos anteriores a 2023 con el mismo arrendatario).</li>
            <li>Estas reducciones pueden mejorar significativamente la rentabilidad neta real. Consulta con un asesor fiscal para tu situación concreta.</li>
          </ul>
        </div>
      )}

      {/* DISCLAIMER FINANCIERO */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="calculadora-rentabilidad-alquiler"
        collapsible={false}
      />

      {/* CONTENIDO EDUCATIVO */}
      <EducationalSection
        title="Guía: Invertir en inmobiliario para alquilar"
        subtitle="Métricas, ejemplos reales, errores frecuentes y pasos para evaluar una inversión"
        defaultOpen={false}
      >
        {/* 1. TABLA COMPARATIVA */}
        <div className={styles.eduComparativa}>
          <h2>Métricas de rentabilidad en alquiler: ¿cuál usar?</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr><th>Métrica</th><th>Qué mide</th><th>Fórmula</th><th>Ventaja</th><th>Limitación</th></tr>
              </thead>
              <tbody>
                <tr><td>Rentabilidad bruta</td><td>Ingresos anuales / precio compra</td><td>(Alquiler × 12) / Precio × 100</td><td>Rápida de calcular</td><td>Ignora todos los gastos</td></tr>
                <tr><td>Rentabilidad neta</td><td>Ingresos tras gastos operativos</td><td>(Alquiler − Gastos) × 12 / Precio × 100</td><td>Más realista que la bruta</td><td>No incluye financiación</td></tr>
                <tr><td>Rentabilidad neta-neta</td><td>Incluye vacíos e impagos</td><td>Neta × factor de ocupación real</td><td>La más conservadora y fiable</td><td>Requiere datos históricos</td></tr>
                <tr><td>Cap Rate</td><td>Rendimiento sin apalancamiento</td><td>NOI / Valor de mercado × 100</td><td>Estándar internacional</td><td>Ignora financiación e impuestos</td></tr>
                <tr><td>Cash-on-Cash</td><td>Retorno sobre capital propio</td><td>Flujo caja anual / Capital aportado × 100</td><td>Ideal con hipoteca</td><td>No compara propiedades distintas</td></tr>
                <tr><td>ROE (Return on Equity)</td><td>Ganancia sobre fondos propios</td><td>(Beneficio + Plusvalía) / Equity × 100</td><td>Visión total de la inversión</td><td>Complejo de calcular con precisión</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ESCENARIOS */}
        <div className={styles.eduEscenarios}>
          <h2>Ejemplos reales por perfil de inversor</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏙️</span><h3>Piso en Madrid al contado</h3></div>
              <p className={styles.escenarioExample}>Compra 280.000 € · Alquiler 1.200 €/mes · Gastos 250 €/mes. Rentabilidad bruta: 5,14%. Neta: 4,07%. Cap rate: 4,07%.</p>
              <span className={styles.escenarioTip}>Zona prime = menor rentabilidad, menor riesgo</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏡</span><h3>Piso en ciudad media con hipoteca</h3></div>
              <p className={styles.escenarioExample}>Compra 120.000 € · 30% entrada · Hipoteca 500 €/mes · Alquiler 700 €/mes. Cash-on-cash sobre 36.000 € invertidos: 6,7%.</p>
              <span className={styles.escenarioTip}>Apalancamiento mejora el cash-on-cash</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🎓</span><h3>Piso de estudiantes por habitaciones</h3></div>
              <p className={styles.escenarioExample}>Compra 95.000 € · 3 habitaciones a 350 €/mes. Ingresos 1.050 €/mes vs 650 € en alquiler convencional. Rentabilidad bruta: 13,3%.</p>
              <span className={styles.escenarioTip}>Mayor rentabilidad, mayor gestión</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏖️</span><h3>Alquiler vacacional (Airbnb)</h3></div>
              <p className={styles.escenarioExample}>Compra 200.000 € · 120 noches/año a 90 €. Ingresos 10.800 €/año. Rentabilidad bruta: 5,4% pero con alta estacionalidad y gestión intensiva.</p>
              <span className={styles.escenarioTip}>Compara siempre con alquiler tradicional</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🔨</span><h3>Compra para reformar y alquilar</h3></div>
              <p className={styles.escenarioExample}>Precio 80.000 € + reforma 25.000 € = coste total 105.000 €. Alquiler 750 €/mes. Rentabilidad bruta real: 8,6% (muy superior a compra sin reforma).</p>
              <span className={styles.escenarioTip}>La reforma bien ejecutada multiplica la rentabilidad</span>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}><span className={styles.escenarioIcon}>🏢</span><h3>Local comercial en zona céntrica</h3></div>
              <p className={styles.escenarioExample}>Compra 150.000 € · Alquiler 900 €/mes. Rentabilidad bruta: 7,2%. Mayor que residencial pero con vacíos más largos y menor protección legal.</p>
              <span className={styles.escenarioTip}>Mayor rendimiento, mayor riesgo de vacío</span>
            </div>
          </div>
        </div>

        {/* 3. FAQ */}
        <div className={styles.eduFaq}>
          <h2>Preguntas frecuentes sobre rentabilidad del alquiler</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}><h4>¿Qué rentabilidad mínima es aceptable en un alquiler?</h4><p>En España, una rentabilidad bruta por encima del 5-6% se considera interesante. Neta superior al 4% ya es competitiva frente a otras inversiones de bajo riesgo. En capitales como Madrid o Barcelona, el 3-4% neto es habitual por la presión del precio.</p></div>
            <div className={styles.faqItem}><h4>¿Debo comparar la rentabilidad con la bolsa o los depósitos?</h4><p>Sí. La referencia más usada es el bono español a 10 años (~3-3,5% en 2025). Si tu alquiler neto supera eso con menor volatilidad, la inversión tiene sentido. La bolsa históricamente ofrece un 7-8% anual medio, pero con mucha más volatilidad.</p></div>
            <div className={styles.faqItem}><h4>¿Qué gastos debo incluir en el cálculo?</h4><p>IBI, comunidad de propietarios, seguro del hogar, seguro de impago, tasa de basuras, reparaciones estimadas (1-2% del valor anual), gestoría, periodos de vacío y posible hipoteca. Ignorar cualquiera de estos distorsiona el resultado.</p></div>
            <div className={styles.faqItem}><h4>¿Cómo afecta la hipoteca a la rentabilidad?</h4><p>Con hipoteca, la métrica relevante es el cash-on-cash return: flujo de caja anual (alquiler − gastos − cuota hipoteca) dividido entre el capital propio aportado. Si el diferencial entre alquiler y cuota es positivo, el apalancamiento amplifica la rentabilidad sobre tu inversión real.</p></div>
            <div className={styles.faqItem}><h4>¿Debo incluir la revalorización del piso en la rentabilidad?</h4><p>Puedes calcular la rentabilidad total (alquiler + plusvalía estimada), pero es especulativa. La rentabilidad por alquiler puro es más objetiva y útil para comparar inversiones. La plusvalía solo se materializa al vender y tributa en IRPF como ganancia patrimonial.</p></div>
            <div className={styles.faqItem}><h4>¿Cómo tributa el alquiler en el IRPF?</h4><p>Los rendimientos del alquiler habitual se integran en la base general del IRPF. Puedes deducir todos los gastos necesarios (hipoteca, IBI, reparaciones, comunidad, seguros). El rendimiento neto reducido tiene una reducción del 50% si el inquilino usa el piso como vivienda habitual (60% en contratos anteriores a 2023).</p></div>
            <div className={styles.faqItem}><h4>¿Qué porcentaje de vacío debo asumir?</h4><p>En una previsión conservadora, asume 1 mes de vacío al año (8,3% de vacío). En zonas con alta demanda puede ser menor; en zonas con menor demanda o alquiler vacacional, puede ser del 20-30%. El vacío es el factor que más diferencia la rentabilidad bruta de la neta real.</p></div>
            <div className={styles.faqItem}><h4>¿Es mejor comprar para alquilar o invertir en REITs/SOCIMIs?</h4><p>Las SOCIMIs (cotizadas en bolsa) ofrecen liquidez inmediata, diversificación y gestión profesional, pero pierdes el control y el apalancamiento directo. La compra directa permite mayor personalización, apalancamiento bancario y deducciones fiscales, pero requiere gestión activa y es ilíquida. Son complementarias.</p></div>
          </div>
        </div>

        {/* 4. GUÍA PASO A PASO */}
        <div className={styles.eduGuia}>
          <h2>Cómo evaluar una inversión en alquiler en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.eduStep}><div className={styles.stepNumber}>1</div><div className={styles.stepContent}><strong>Calcula el precio de compra total</strong><p>Suma precio escritura + ITP o IVA (según si es segunda mano o nueva) + notaría + registro + gestoría. En segunda mano, añade un 10-12% al precio de compra como coste real de adquisición.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>2</div><div className={styles.stepContent}><strong>Estima el alquiler de mercado realista</strong><p>Consulta Idealista, Fotocasa y portales locales para pisos similares en la misma zona. Usa el percentil 50 (mediana), no el máximo. Descuenta un 5% para ser conservador.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>3</div><div className={styles.stepContent}><strong>Lista todos los gastos anuales</strong><p>IBI + comunidad + seguro hogar + seguro impago (~3,5% del alquiler anual) + reparaciones estimadas (1% del valor) + vacío estimado (1 mes). Suma todo antes de calcular.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>4</div><div className={styles.stepContent}><strong>Calcula las tres rentabilidades</strong><p>Bruta = (alquiler × 12) / precio. Neta = (alquiler − gastos mensuales) × 12 / precio. Neta-neta = neta ajustada por el factor de ocupación real (ej: 11 meses/12).</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>5</div><div className={styles.stepContent}><strong>Analiza el flujo de caja mensual</strong><p>Alquiler − cuota hipoteca − gastos mensuales = flujo de caja. Si es negativo, el piso te cuesta dinero cada mes aunque haya revalorización. El flujo positivo indica independencia financiera progresiva.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>6</div><div className={styles.stepContent}><strong>Compara con alternativas de inversión</strong><p>Bono español a 10 años, depósitos bancarios, fondos indexados. Si tu rentabilidad neta no supera claramente el bono más un margen por iliquidez y gestión, reconsidera la operación.</p></div></div>
            <div className={styles.eduStep}><div className={styles.stepNumber}>7</div><div className={styles.stepContent}><strong>Evalúa el riesgo y la zona</strong><p>Demanda de alquiler, evolución de precios histórica, perfil socioeconómico de la zona, proyectos urbanísticos cercanos y regulación local de alquiler. Una zona en declive demográfico puede destruir la rentabilidad en 5 años.</p></div></div>
          </div>
        </div>

        {/* 5. TIPS */}
        <div className={styles.eduTips}>
          <h2>Claves para maximizar la rentabilidad</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📍</span><strong>La zona lo es todo</strong><p>Una propiedad mediocre en zona prime siempre supera a una excelente en zona deprimida. Prioriza demanda de alquiler sobre precio bajo.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🔒</span><strong>Contrata seguro de impago</strong><p>Cuesta un 3-5% del alquiler anual y cubre 12 meses de impago + defensa jurídica. El coste vs el riesgo hace que sea casi obligatorio.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🧾</span><strong>Declara todo correctamente</strong><p>Las deducciones legales (gastos, amortización del inmueble) pueden reducir tu carga fiscal significativamente. Un gestor especializado en IRPF inmobiliario se amortiza en el primer año.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🔧</span><strong>Provisiona para reparaciones</strong><p>Reserva el 1% del valor del piso al año para mantenimiento. Un propietario que no provisiona sufre sorpresas que destrozan la rentabilidad de varios años.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>📊</span><strong>Revisa la renta cada año</strong><p>Actualiza según IPC o el índice pactado en el contrato. No actualizar durante años crea una brecha que luego es difícil de recuperar con el mismo inquilino.</p></div>
            <div className={styles.tipCard}><span className={styles.tipIcon}>🤝</span><strong>Selección de inquilino rigurosa</strong><p>Solicita 3 últimas nóminas, contrato laboral y referencias. Un buen inquilino durante 5 años vale más que una renta 10% más alta con moroso.</p></div>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores que destruyen la rentabilidad del alquiler</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Calcular solo la rentabilidad bruta e ignorar los gastos reales — puede multiplicar por 2 la percepción de beneficio</li>
            <li>No incluir los gastos de compra (ITP, notaría, registro) en el precio total de inversión — infla artificialmente la rentabilidad</li>
            <li>Asumir ocupación del 100% sin provisionar vacíos ni impagos — una sola mensualidad perdida destruye meses de margen</li>
            <li>No actualizar la renta anualmente según IPC — en 5 años puedes cobrar un 15-20% menos que el mercado</li>
            <li>Ignorar la fiscalidad — sin optimizar las deducciones, pagas más IRPF del necesario</li>
            <li>Comparar solo con depósitos bancarios en lugar de con el conjunto del mercado de inversión alternativo</li>
            <li>Comprar en zona con sobreoferta de alquiler o declive demográfico por el precio bajo — el precio bajo suele tener un motivo</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-rentabilidad-alquiler')} />

      <ShareCard appName="calculadora-rentabilidad-alquiler" />
      <Footer appName="calculadora-rentabilidad-alquiler" />
    </div>
  );
}
