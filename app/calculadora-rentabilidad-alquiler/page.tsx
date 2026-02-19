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

      {/* DISCLAIMER FINANCIERO */}
      <DisclaimerCard
        variant="financial"
        severity="medium"
        context="calculadora-rentabilidad-alquiler"
        collapsible={true}
      />

      {/* CONTENIDO EDUCATIVO */}
      <EducationalSection
        title="📚 Guía: Invertir en inmobiliario para alquilar"
        subtitle="Conceptos clave antes de tomar una decisión"
      >
        <section>
          <h2>¿Qué es la rentabilidad bruta del alquiler?</h2>
          <p>
            La <strong>rentabilidad bruta</strong> es el cociente entre los ingresos anuales por alquiler y el precio total de compra del inmueble. Es una métrica rápida pero incompleta, ya que no considera ningún gasto.
          </p>
          <p>
            <strong>Fórmula:</strong> Rentabilidad bruta = (Alquiler mensual × 12) / Precio de compra × 100
          </p>
          <p>
            En España, la rentabilidad bruta media del alquiler oscila entre el <strong>4% y el 8%</strong>, dependiendo de la ciudad y zona.
          </p>

          <h2>¿Qué es la rentabilidad neta?</h2>
          <p>
            La <strong>rentabilidad neta</strong> descuenta todos los gastos anuales (IBI, comunidad, seguro, reparaciones, hipoteca) de los ingresos. Es el indicador más realista de la inversión.
          </p>
          <p>
            Una rentabilidad neta del <strong>4-5%</strong> se considera razonable en el mercado español actual. Por encima del 7% es excelente.
          </p>

          <h2>¿Qué es el cash flow en una inversión inmobiliaria?</h2>
          <p>
            El <strong>cash flow mensual</strong> es la diferencia entre lo que cobras de alquiler y lo que pagas en gastos (incluida la cuota de hipoteca si la tienes). Es el dinero real que entra en tu bolsillo cada mes.
          </p>
          <p>
            Un cash flow negativo significa que la propiedad te cuesta dinero mes a mes. Solo tiene sentido aceptarlo si la revalorización del inmueble compensa esas pérdidas.
          </p>

          <h2>¿Qué gastos suele tener un propietario?</h2>
          <ul>
            <li><strong>IBI</strong>: Impuesto sobre Bienes Inmuebles. Varía por municipio y valor catastral. Suele ser entre 200€ y 800€ al año.</li>
            <li><strong>Comunidad de propietarios</strong>: Gastos comunes del edificio. Entre 600€ y 2.400€ al año según el edificio.</li>
            <li><strong>Seguro de hogar</strong>: Obligatorio si hay hipoteca. Entre 200€ y 500€ al año.</li>
            <li><strong>Reparaciones y mantenimiento</strong>: Electrodomésticos, fontanería, pintura. Estima entre el 0,5% y 1% del valor del inmueble al año.</li>
            <li><strong>Tasa de ocupación</strong>: Los periodos sin inquilino (cambio de arrendatario, obras) reducen los ingresos efectivos. El 90-95% es razonable para zonas con alta demanda.</li>
          </ul>

          <h2>Gastos de compra en España</h2>
          <p>
            Al adquirir un inmueble en España hay que sumar entre el <strong>8% y el 15%</strong> del precio de compra en gastos:
          </p>
          <ul>
            <li><strong>ITP (Impuesto de Transmisiones Patrimoniales)</strong>: Entre el 6% y el 10% según la comunidad autónoma (inmueble de segunda mano).</li>
            <li><strong>IVA + AJD</strong>: 10% IVA + 1-1,5% AJD para obra nueva.</li>
            <li><strong>Notaría</strong>: 0,1% - 0,5% del precio de escritura.</li>
            <li><strong>Registro de la propiedad</strong>: 0,05% - 0,3%.</li>
            <li><strong>Gestoría</strong>: 300€ - 600€ generalmente.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-rentabilidad-alquiler')} />

      <Footer appName="calculadora-rentabilidad-alquiler" />
    </div>
  );
}
