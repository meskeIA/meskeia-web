'use client';

import { useState, useCallback } from 'react';
import styles from './EstimadorPlusvalias.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_INMUEBLES_META,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  TRAMOS_IRPF_2025,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoActivo = 'inmueble' | 'fondos' | 'acciones' | 'cripto' | 'otros';

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

function calcularCuotaBaseAhorro(ganancia: number): number {
  let cuota = 0;
  let restante = Math.max(0, ganancia);
  let limiteAnterior = 0;

  for (const tramo of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
    const anchura = tramo.hasta - limiteAnterior;
    const base = Math.min(restante, anchura);
    if (base <= 0) break;
    cuota += base * (tramo.tipo / 100);
    restante -= base;
    limiteAnterior = tramo.hasta;
  }
  return cuota;
}

function calcularCuotaBaseGeneral(ganancia: number): number {
  let cuota = 0;
  let restante = Math.max(0, ganancia);
  let limiteAnterior = 0;

  for (const tramo of TRAMOS_IRPF_2025) {
    const anchura = tramo.hasta - limiteAnterior;
    const base = Math.min(restante, anchura);
    if (base <= 0) break;
    cuota += base * (tramo.tipo / 100);
    restante -= base;
    limiteAnterior = tramo.hasta;
  }
  return cuota;
}

function mesesEntreEchas(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
  return meses;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorPlusvalidasIRPFPage() {
  const [tipoActivo, setTipoActivo] = useState<TipoActivo>('inmueble');
  const [precioCompra, setPrecioCompra] = useState('');
  const [gastosCompra, setGastosCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [gastosVenta, setGastosVenta] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [fechaVenta, setFechaVenta] = useState('');

  const [resultado, setResultado] = useState<{
    precioCompra: number;
    gastosCompra: number;
    precioVenta: number;
    gastosVenta: number;
    valorAdquisicion: number;
    valorTransmision: number;
    gananciaPatrimonial: number;
    esGanancia: boolean;
    mesesTenencia: number;
    esLargoPlazo: boolean;
    cuotaIRPF: number;
    tipoEfectivo: number;
  } | null>(null);

  const calcular = useCallback(() => {
    const vCompra = parseSpanishNumber(precioCompra) || 0;
    const gCompra = parseSpanishNumber(gastosCompra) || 0;
    const vVenta = parseSpanishNumber(precioVenta) || 0;
    const gVenta = parseSpanishNumber(gastosVenta) || 0;

    if (vCompra <= 0 || vVenta <= 0) return;

    const meses = fechaCompra && fechaVenta ? mesesEntreEchas(fechaCompra, fechaVenta) : 13; // Default > 1 año
    const esLargoPlazo = meses > 12;

    const valorAdquisicion = vCompra + gCompra;
    const valorTransmision = vVenta - gVenta;
    const gananciaPatrimonial = valorTransmision - valorAdquisicion;
    const esGanancia = gananciaPatrimonial > 0;

    let cuotaIRPF = 0;
    if (esGanancia) {
      cuotaIRPF = esLargoPlazo
        ? calcularCuotaBaseAhorro(gananciaPatrimonial)
        : calcularCuotaBaseGeneral(gananciaPatrimonial);
    }

    const tipoEfectivo = gananciaPatrimonial > 0 ? (cuotaIRPF / gananciaPatrimonial) * 100 : 0;

    setResultado({
      precioCompra: vCompra,
      gastosCompra: gCompra,
      precioVenta: vVenta,
      gastosVenta: gVenta,
      valorAdquisicion,
      valorTransmision,
      gananciaPatrimonial,
      esGanancia,
      mesesTenencia: meses,
      esLargoPlazo,
      cuotaIRPF,
      tipoEfectivo,
    });
  }, [precioCompra, gastosCompra, precioVenta, gastosVenta, fechaCompra, fechaVenta]);

  const limpiar = () => {
    setPrecioCompra(''); setGastosCompra(''); setPrecioVenta(''); setGastosVenta('');
    setFechaCompra(''); setFechaVenta(''); setResultado(null);
  };

  const tiposActivo: { value: TipoActivo; label: string; gastosTip: string }[] = [
    { value: 'inmueble', label: '🏠 Inmueble (piso, casa, local...)', gastosTip: 'Compra: ITP/IVA, notaría, registro. Venta: comisión inmobiliaria, plusvalía municipal, gestoría' },
    { value: 'fondos', label: '📈 Fondos de inversión', gastosTip: 'Gastos de compra/venta: comisiones de suscripción/reembolso' },
    { value: 'acciones', label: '📊 Acciones o ETFs', gastosTip: 'Comisiones de compra/venta del bróker' },
    { value: 'cripto', label: '🪙 Criptomonedas', gastosTip: 'Comisiones de compra/venta en el exchange' },
    { value: 'otros', label: '💼 Otros activos', gastosTip: 'Cualquier gasto directamente relacionado con la transmisión' },
  ];

  const activoSeleccionado = tiposActivo.find(t => t.value === tipoActivo)!;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">💹</span>
        <h1 className={styles.title}>Estimador de Plusvalías IRPF 2025</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre el IRPF por la venta de inmuebles, fondos, acciones u otros activos
        </p>
      </header>

      <DisclaimerCard variant="financial" severity="medium" />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Datos de la operación</h2>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="tipoActivo">Tipo de activo</label>
              <select
                id="tipoActivo"
                value={tipoActivo}
                onChange={e => setTipoActivo(e.target.value as TipoActivo)}
                className={styles.select}
              >
                {tiposActivo.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className={styles.infoBox}>{activoSeleccionado.gastosTip}</div>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>
              📥 Datos de adquisición (compra)
            </h3>
            <NumberInput
              value={precioCompra}
              onChange={setPrecioCompra}
              label="Precio de compra"
              placeholder="150000"
              helperText="Precio pagado en la adquisición"
              min={0}
            />
            <NumberInput
              value={gastosCompra}
              onChange={setGastosCompra}
              label="Gastos de compra (ITP/IVA, notaría, etc.)"
              placeholder="0"
              helperText="Gastos e impuestos en la adquisición"
              min={0}
            />
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="fechaCompra">Fecha de compra (para calcular plazo)</label>
              <input
                type="date"
                id="fechaCompra"
                value={fechaCompra}
                onChange={e => setFechaCompra(e.target.value)}
                className={styles.select}
              />
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 'var(--spacing-md) 0 0.75rem', color: 'var(--text-primary)' }}>
              📤 Datos de transmisión (venta)
            </h3>
            <NumberInput
              value={precioVenta}
              onChange={setPrecioVenta}
              label="Precio de venta"
              placeholder="200000"
              helperText="Precio recibido en la transmisión"
              min={0}
            />
            <NumberInput
              value={gastosVenta}
              onChange={setGastosVenta}
              label="Gastos de venta (comisión, plusvalía municipal...)"
              placeholder="0"
              helperText="Gastos directamente vinculados a la venta"
              min={0}
            />
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="fechaVenta">Fecha de venta</label>
              <input
                type="date"
                id="fechaVenta"
                value={fechaVenta}
                onChange={e => setFechaVenta(e.target.value)}
                className={styles.select}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={calcular} className={styles.btnPrimary}>
                Estimar plusvalía
              </button>
              <button onClick={limpiar} className={styles.btnSecondary} aria-label="Limpiar formulario">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Cuota principal */}
              <div className={styles.cuotaDestacada}>
                <p className={styles.cuotaLabel}>
                  IRPF estimado a pagar por plusvalía
                  <span className={resultado.esLargoPlazo ? styles.badgeLargoPlazo : styles.badgeCortoplazo}>
                    {resultado.esLargoPlazo ? '> 1 año (base del ahorro)' : '< 1 año (base general)'}
                  </span>
                </p>
                <span className={styles.cuotaValor} role="status" aria-live="polite">
                  {resultado.esGanancia ? formatCurrency(resultado.cuotaIRPF) : '0,00 €'}
                </span>
                <p className={styles.cuotaTipoEfectivo}>
                  {resultado.esGanancia
                    ? `Tipo efectivo orientativo: ${formatNumber(resultado.tipoEfectivo, 2)}%`
                    : '⬇️ No hay ganancia patrimonial — posible pérdida deducible'}
                </p>
              </div>

              <div className={styles.resultsGrid}>
                <ResultCard
                  title="Ganancia patrimonial"
                  value={formatNumber(Math.abs(resultado.gananciaPatrimonial), 2)}
                  unit="€"
                  variant={resultado.esGanancia ? 'highlight' : 'warning'}
                  icon={resultado.esGanancia ? '📈' : '📉'}
                  description={resultado.esGanancia ? 'Beneficio de la operación' : 'Pérdida patrimonial'}
                />
                <ResultCard
                  title="Valor de adquisición"
                  value={formatNumber(resultado.valorAdquisicion, 2)}
                  unit="€"
                  variant="default"
                  icon="🛒"
                  description="Precio compra + gastos"
                />
                <ResultCard
                  title="Valor de transmisión"
                  value={formatNumber(resultado.valorTransmision, 2)}
                  unit="€"
                  variant="info"
                  icon="💰"
                  description="Precio venta - gastos"
                />
                {fechaCompra && fechaVenta && (
                  <ResultCard
                    title="Periodo de tenencia"
                    value={formatNumber(Math.floor(resultado.mesesTenencia / 12), 0)}
                    unit={`años ${resultado.mesesTenencia % 12} meses`}
                    variant="success"
                    icon="📅"
                    description={resultado.esLargoPlazo ? 'Base del ahorro' : 'Base general'}
                  />
                )}
              </div>

              {/* Desglose */}
              <div className={styles.desgloseCard}>
                <h3 className={styles.desgloseTitle}>Cálculo orientativo</h3>
                <div className={styles.desgloseRow}>
                  <span>Precio de compra</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultado.precioCompra)}</span>
                </div>
                <div className={styles.desgloseRow}>
                  <span>+ Gastos de compra</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultado.gastosCompra)}</span>
                </div>
                <div className={styles.desgloseRow}>
                  <span>= Valor de adquisición</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultado.valorAdquisicion)}</span>
                </div>
                <div className={styles.desgloseRow}>
                  <span>Precio de venta</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultado.precioVenta)}</span>
                </div>
                <div className={styles.desgloseRow}>
                  <span>- Gastos de venta</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultado.gastosVenta)}</span>
                </div>
                <div className={styles.desgloseRow}>
                  <span>= Valor de transmisión</span>
                  <span className={styles.desgloseValor}>{formatCurrency(resultado.valorTransmision)}</span>
                </div>
                <div className={styles.desgloseRow} style={{ fontWeight: 700 }}>
                  <span>{resultado.esGanancia ? 'Ganancia patrimonial' : 'Pérdida patrimonial'}</span>
                  <span className={styles.desgloseValor}>{formatCurrency(Math.abs(resultado.gananciaPatrimonial))}</span>
                </div>
                {resultado.esGanancia && (
                  <div className={styles.desgloseRow} style={{ fontWeight: 700, color: '#e53e3e' }}>
                    <span>IRPF estimado</span>
                    <span className={styles.desgloseValor}>{formatCurrency(resultado.cuotaIRPF)}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">💹</span>
              <p>Introduce los datos de la operación y pulsa «Estimar plusvalía»</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Herramienta de Orientación — No es asesoramiento fiscal</h3>
        <p>
          Este estimador proporciona una <strong>estimación orientativa</strong> basada en{' '}
          <a href={FISCAL_INMUEBLES_META.urlOficialIRPF} target="_blank" rel="noopener noreferrer">
            {FISCAL_INMUEBLES_META.fuente}
          </a>. El cálculo real puede variar por:
        </p>
        <ul>
          <li>Exenciones aplicables: reinversión en vivienda habitual, mayores de 65 años, dación en pago</li>
          <li>Coeficientes de abatimiento para activos adquiridos antes de 31/12/1994</li>
          <li>Compensación de pérdidas de ejercicios anteriores</li>
          <li>Tipo autonómico específico del IRPF</li>
          <li>Gastos deducibles no incluidos (mejoras en inmuebles, comisiones específicas)</li>
        </ul>
        <p>
          <strong>NO constituye asesoramiento fiscal.</strong> Para el cálculo exacto, consulta con un asesor fiscal
          o usa el simulador oficial de la{' '}
          <a href={FISCAL_INMUEBLES_META.urlOficialIRPF} target="_blank" rel="noopener noreferrer">
            Agencia Tributaria
          </a>.
        </p>
        <p className={styles.disclaimerFecha}>
          Datos verificados: {FISCAL_INMUEBLES_META.verificado} | Vigencia: {FISCAL_INMUEBLES_META.vigencia}
        </p>
      </div>

      <EducationalSection
        title="¿Qué son las plusvalías y cómo tributan?"
        subtitle="Guía sobre ganancias patrimoniales, base del ahorro y tramos IRPF 2025"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Ganancias y pérdidas patrimoniales en el IRPF</h2>
          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>📈 ¿Qué es una ganancia patrimonial?</h4>
              <p>
                Es la diferencia positiva entre el valor de transmisión (venta) y el valor de adquisición (compra)
                de un bien. Si vendes por más de lo que compraste (descontando gastos), tienes una ganancia patrimonial.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4>📉 ¿Y si pierdo dinero?</h4>
              <p>
                Las pérdidas patrimoniales pueden compensarse con ganancias del mismo año o de los 4 años siguientes.
                No es obligatorio declarar pérdidas si el importe es pequeño, pero puede interesar para compensar futuras ganancias.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4>⏱️ Importancia del plazo</h4>
              <p>
                Si el activo se tuvo <strong>más de 1 año</strong>, tributa en la base del ahorro (19-30%).
                Si se tuvo <strong>menos de 1 año</strong>, tributa en la base general con el IRPF normal (hasta 47%).
                Siempre conviene esperar al año si la diferencia es pequeña.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4>🏠 Exención vivienda habitual</h4>
              <p>
                La ganancia por venta de la vivienda habitual está exenta si reinviertes el importe en otra vivienda habitual
                en un plazo de 2 años. También exenta si el vendedor tiene más de 65 años y es su vivienda habitual.
              </p>
            </div>
          </div>

          <h3>Tramos base del ahorro 2025 (activos &gt; 1 año)</h3>
          <table className={styles.tramosTable}>
            <thead>
              <tr><th>Desde</th><th>Hasta</th><th>Tipo</th></tr>
            </thead>
            <tbody>
              <tr><td>0 €</td><td>6.000 €</td><td>19%</td></tr>
              <tr><td>6.000 €</td><td>50.000 €</td><td>21%</td></tr>
              <tr><td>50.000 €</td><td>200.000 €</td><td>23%</td></tr>
              <tr><td>200.000 €</td><td>300.000 €</td><td>27%</td></tr>
              <tr><td>300.000 €</td><td>En adelante</td><td>30%</td></tr>
            </tbody>
          </table>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-plusvalias-irpf')} />
      <ShareCard appName="estimador-plusvalias-irpf" />
      <Footer appName="estimador-plusvalias-irpf" />
    </div>
  );
}
