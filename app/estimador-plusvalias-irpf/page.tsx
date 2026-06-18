'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './EstimadorPlusvalias.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_INMUEBLES_META,
  calcularCuotaBaseAhorro,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TipoActivo = 'inmueble' | 'fondos' | 'acciones' | 'cripto' | 'plan-pensiones' | 'otros';
type Modo = 'calculo' | 'traspaso' | 'plan-pensiones';

interface Resultado {
  modo: Modo;
  precioCompra: number;
  gastosCompra: number;
  precioVenta: number;
  gastosVenta: number;
  valorAdquisicion: number;
  valorTransmision: number;
  gananciaPatrimonial: number; // con signo
  esGanancia: boolean;
  mesesTenencia: number;
  tieneFechas: boolean;
  perdidaDiferida: boolean;          // regla de los 2 meses bloquea la pérdida
  perdidasPreviasAplicadas: number;  // minusvalías de años anteriores aplicadas
  perdidasPreviasRestantes: number;  // las que quedan pendientes
  baseImponible: number;             // ganancia tras compensar (≥ 0)
  cuotaIRPF: number;
  tipoEfectivo: number;
}

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

// El cálculo de la cuota de la base del ahorro vive en data/fiscal (fuente única
// compartida con la tool MCP). Todas las ganancias por transmisión tributan en
// la base del ahorro, sea cual sea el plazo (desde 2015, Ley 26/2014).

function mesesEntreEchas(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const meses = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
  return meses;
}

const RESULTADO_VACIO = {
  precioCompra: 0, gastosCompra: 0, precioVenta: 0, gastosVenta: 0,
  valorAdquisicion: 0, valorTransmision: 0, gananciaPatrimonial: 0, esGanancia: false,
  mesesTenencia: 0, tieneFechas: false, perdidaDiferida: false,
  perdidasPreviasAplicadas: 0, perdidasPreviasRestantes: 0,
  baseImponible: 0, cuotaIRPF: 0, tipoEfectivo: 0,
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorPlusvalidasIRPFPage() {
  const [tipoActivo, setTipoActivo] = useState<TipoActivo>('inmueble');
  const [precioCompra, setPrecioCompra] = useState('');
  const [gastosCompra, setGastosCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [gastosVenta, setGastosVenta] = useState('');
  const [fechaCompra, setFechaCompra] = useState('');
  const [fechaVenta, setFechaVenta] = useState('');
  const [esTraspaso, setEsTraspaso] = useState(false);
  const [recompra, setRecompra] = useState(false);
  const [perdidasPreviasTexto, setPerdidasPreviasTexto] = useState('');

  const [resultado, setResultado] = useState<Resultado | null>(null);

  const traspasoAplicable = tipoActivo === 'fondos';
  const recompraAplicable = tipoActivo === 'acciones' || tipoActivo === 'fondos' || tipoActivo === 'cripto';
  const esPlanPensiones = tipoActivo === 'plan-pensiones';

  const calcular = useCallback(() => {
    if (tipoActivo === 'plan-pensiones') {
      setResultado({ modo: 'plan-pensiones', ...RESULTADO_VACIO });
      return;
    }

    const vCompra = parseSpanishNumber(precioCompra) || 0;
    const gCompra = parseSpanishNumber(gastosCompra) || 0;
    const vVenta = parseSpanishNumber(precioVenta) || 0;
    const gVenta = parseSpanishNumber(gastosVenta) || 0;
    const perdidasPrevias = parseSpanishNumber(perdidasPreviasTexto) || 0;

    if (vCompra <= 0 || vVenta <= 0) return;

    const valorAdquisicion = vCompra + gCompra;
    const valorTransmision = vVenta - gVenta;
    const gananciaPatrimonial = valorTransmision - valorAdquisicion;
    const esGanancia = gananciaPatrimonial > 0;
    const tieneFechas = !!(fechaCompra && fechaVenta);
    const meses = tieneFechas ? mesesEntreEchas(fechaCompra, fechaVenta) : 0;

    // Traspaso de fondos: diferimiento, 0 € a pagar en el año
    if (tipoActivo === 'fondos' && esTraspaso) {
      setResultado({
        modo: 'traspaso',
        precioCompra: vCompra, gastosCompra: gCompra, precioVenta: vVenta, gastosVenta: gVenta,
        valorAdquisicion, valorTransmision, gananciaPatrimonial, esGanancia,
        mesesTenencia: meses, tieneFechas,
        perdidaDiferida: false, perdidasPreviasAplicadas: 0, perdidasPreviasRestantes: perdidasPrevias,
        baseImponible: 0, cuotaIRPF: 0, tipoEfectivo: 0,
      });
      return;
    }

    // Regla de los dos meses: si hay pérdida y recompra, la pérdida se difiere
    const perdidaDiferida = !esGanancia && recompra && recompraAplicable;

    // Compensación con minusvalías de años anteriores (solo si hay ganancia)
    let perdidasAplicadas = 0;
    let baseImponible = 0;
    let cuota = 0;
    if (esGanancia) {
      perdidasAplicadas = Math.min(gananciaPatrimonial, perdidasPrevias);
      baseImponible = gananciaPatrimonial - perdidasAplicadas;
      cuota = calcularCuotaBaseAhorro(baseImponible);
    }
    const perdidasRestantes = Math.max(0, perdidasPrevias - perdidasAplicadas);
    const tipoEfectivo = gananciaPatrimonial > 0 ? (cuota / gananciaPatrimonial) * 100 : 0;

    setResultado({
      modo: 'calculo',
      precioCompra: vCompra, gastosCompra: gCompra, precioVenta: vVenta, gastosVenta: gVenta,
      valorAdquisicion, valorTransmision, gananciaPatrimonial, esGanancia,
      mesesTenencia: meses, tieneFechas,
      perdidaDiferida,
      perdidasPreviasAplicadas: perdidasAplicadas,
      perdidasPreviasRestantes: perdidasRestantes,
      baseImponible, cuotaIRPF: cuota, tipoEfectivo,
    });
  }, [tipoActivo, precioCompra, gastosCompra, precioVenta, gastosVenta, fechaCompra, fechaVenta, esTraspaso, recompra, recompraAplicable, perdidasPreviasTexto]);

  const limpiar = () => {
    setPrecioCompra(''); setGastosCompra(''); setPrecioVenta(''); setGastosVenta('');
    setFechaCompra(''); setFechaVenta(''); setEsTraspaso(false); setRecompra(false);
    setPerdidasPreviasTexto(''); setResultado(null);
  };

  const tiposActivo: { value: TipoActivo; label: string; gastosTip: string }[] = [
    { value: 'inmueble', label: '🏠 Inmueble (piso, casa, local...)', gastosTip: 'Compra: ITP/IVA, notaría, registro. Venta: comisión inmobiliaria, plusvalía municipal, gestoría' },
    { value: 'fondos', label: '📈 Fondo de inversión', gastosTip: 'Gastos de compra/venta: comisiones de suscripción y reembolso. Permite traspaso entre fondos sin tributar.' },
    { value: 'acciones', label: '📊 Acciones o ETF', gastosTip: 'Comisiones de compra/venta del bróker. Los ETF tributan como acciones (no admiten traspaso).' },
    { value: 'cripto', label: '🪙 Criptomonedas', gastosTip: 'Comisiones de compra/venta en el exchange. Cada intercambio cripto→cripto ya es una transmisión.' },
    { value: 'plan-pensiones', label: '🏦 Plan de pensiones', gastosTip: 'El rescate NO es ganancia patrimonial: tributa como rendimiento del trabajo en la base general.' },
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
          Calcula el IRPF por la venta o el traspaso de inmuebles, fondos, acciones, ETF o criptomonedas, con
          compensación de minusvalías y la regla de los dos meses
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={FISCAL_INMUEBLES_META.fuente}
        fuente={FISCAL_INMUEBLES_META.fuente}
        verificado={FISCAL_INMUEBLES_META.verificado}
        urlOficial={FISCAL_INMUEBLES_META.urlOficialIRPF}
      />

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
                onChange={e => { setTipoActivo(e.target.value as TipoActivo); setResultado(null); }}
                className={styles.select}
              >
                {tiposActivo.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className={styles.infoBox}>{activoSeleccionado.gastosTip}</div>
            </div>

            {esPlanPensiones ? (
              <div className={styles.infoBox} style={{ marginTop: 'var(--spacing-md)' }}>
                Los planes de pensiones no generan ganancia patrimonial. El rescate tributa como
                rendimiento del trabajo (base general). Pulsa «Estimar» para ver los detalles.
              </div>
            ) : (
              <>
                {traspasoAplicable && (
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={esTraspaso}
                      onChange={e => setEsTraspaso(e.target.checked)}
                    />
                    <span className={styles.checkText}>
                      <strong>Es un traspaso a otro fondo</strong> (no un reembolso a efectivo). El traspaso entre
                      fondos no tributa: difiere la ganancia.
                    </span>
                  </label>
                )}

                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>
                  <span aria-hidden="true">📥</span> Datos de adquisición (compra)
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
                  label="Gastos de compra (ITP/IVA, notaría, comisiones...)"
                  placeholder="0"
                  helperText="Gastos e impuestos en la adquisición"
                  min={0}
                />
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="fechaCompra">Fecha de compra (opcional, informativa)</label>
                  <input
                    type="date"
                    id="fechaCompra"
                    value={fechaCompra}
                    onChange={e => setFechaCompra(e.target.value)}
                    className={styles.select}
                  />
                </div>

                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 'var(--spacing-md) 0 0.75rem', color: 'var(--text-primary)' }}>
                  <span aria-hidden="true">📤</span> Datos de transmisión ({esTraspaso ? 'traspaso' : 'venta'})
                </h3>
                <NumberInput
                  value={precioVenta}
                  onChange={setPrecioVenta}
                  label={esTraspaso ? 'Valor actual del fondo' : 'Precio de venta'}
                  placeholder="200000"
                  helperText={esTraspaso ? 'Valor de la participación al traspasar' : 'Precio recibido en la transmisión'}
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
                  <label className={styles.label} htmlFor="fechaVenta">Fecha de venta (opcional, informativa)</label>
                  <input
                    type="date"
                    id="fechaVenta"
                    value={fechaVenta}
                    onChange={e => setFechaVenta(e.target.value)}
                    className={styles.select}
                  />
                </div>

                {recompraAplicable && !esTraspaso && (
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={recompra}
                      onChange={e => setRecompra(e.target.checked)}
                    />
                    <span className={styles.checkText}>
                      <strong>Recompro el mismo valor (u homogéneo)</strong> dentro del plazo de la regla antielusión
                      (2 meses en valores cotizados, 1 año en no cotizados). Solo afecta si la operación da pérdida.
                    </span>
                  </label>
                )}

                <NumberInput
                  value={perdidasPreviasTexto}
                  onChange={setPerdidasPreviasTexto}
                  label="Minusvalías pendientes de años anteriores (opcional)"
                  placeholder="0"
                  helperText="Pérdidas patrimoniales de los últimos 4 ejercicios pendientes de compensar"
                  min={0}
                />
              </>
            )}

            <div className={styles.buttonGroup}>
              <button type="button" onClick={calcular} className={styles.btnPrimary}>
                {esPlanPensiones ? 'Ver tributación' : 'Estimar plusvalía'}
              </button>
              <button type="button" onClick={limpiar} className={styles.btnSecondary} aria-label="Limpiar formulario">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {!resultado ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">💹</span>
              <p>Introduce los datos de la operación y pulsa «Estimar plusvalía»</p>
            </div>
          ) : resultado.modo === 'plan-pensiones' ? (
            <div className={styles.infoPanel}>
              <span className={styles.infoPanelIcon} aria-hidden="true">🏦</span>
              <h3>Un plan de pensiones no genera plusvalía</h3>
              <p>
                A diferencia de los fondos de inversión, el plan de pensiones <strong>no tributa como ganancia
                patrimonial</strong>. El rescate se considera <strong>rendimiento del trabajo</strong> y se integra en la
                base general del IRPF, junto a tu nómina o pensión.
              </p>
              <p>
                Rescatar todo de golpe en forma de capital puede dispararte a un tramo marginal alto (hasta el 47 %).
                Hacerlo en forma de renta suele ser más eficiente.
              </p>
              <p>
                Para entender en qué base tributa cada ingreso, usa el{' '}
                <Link href="/orientador-tipos-renta-irpf/">Orientador de tipos de renta del IRPF</Link>; para el cálculo
                de la cuota, el <Link href="/estimador-irpf/">Estimador de IRPF</Link>.
              </p>
            </div>
          ) : resultado.modo === 'traspaso' ? (
            <div className={styles.infoPanel}>
              <span className={styles.infoPanelIcon} aria-hidden="true">🔄</span>
              <h3>Traspaso entre fondos: diferimiento fiscal</h3>
              <span className={styles.infoPanelCuota}>0,00 €</span>
              <p>
                El traspaso de participaciones entre fondos de inversión <strong>no tributa en el año</strong>. La ganancia
                latente {resultado.gananciaPatrimonial > 0 && (<>de <strong>{formatCurrency(resultado.gananciaPatrimonial)}</strong> </>)}
                queda diferida: el nuevo fondo hereda el valor de adquisición original y solo tributarás cuando hagas el
                reembolso definitivo a efectivo.
              </p>
              <p>
                <strong>Ojo:</strong> esta ventaja NO aplica a los ETF ni a fondos fuera del régimen español/UE. Traspasar
                a un ETF sí genera hecho imponible inmediato.
              </p>
            </div>
          ) : (
            <>
              {/* Cuota principal */}
              <div className={styles.cuotaDestacada}>
                <p className={styles.cuotaLabel}>
                  IRPF estimado a pagar por plusvalía
                  <span className={styles.badgeLargoPlazo}>Base del ahorro</span>
                </p>
                <span className={styles.cuotaValor} role="status" aria-live="polite">
                  {resultado.esGanancia ? formatCurrency(resultado.cuotaIRPF) : '0,00 €'}
                </span>
                <p className={styles.cuotaTipoEfectivo}>
                  {resultado.esGanancia
                    ? `Tipo efectivo orientativo: ${formatNumber(resultado.tipoEfectivo, 2)}%`
                    : <><span aria-hidden="true">⬇️</span>{' No hay ganancia patrimonial — posible pérdida compensable'}</>}
                </p>
              </div>

              {/* Regla de los dos meses */}
              {resultado.perdidaDiferida && (
                <div className={styles.reglaBox}>
                  <strong>⚠️ Regla de los dos meses (art. 33.5 LIRPF):</strong> al recomprar el mismo valor (u homogéneo)
                  dentro del plazo, la pérdida de <strong>{formatCurrency(Math.abs(resultado.gananciaPatrimonial))}</strong>{' '}
                  <strong>no es computable este año</strong>: queda diferida hasta que vendas definitivamente los valores
                  recomprados. No podrás usarla ahora para compensar ganancias.
                </div>
              )}

              <div className={styles.resultsGrid}>
                <ResultCard
                  title={resultado.esGanancia ? 'Ganancia patrimonial' : 'Pérdida patrimonial'}
                  value={formatNumber(Math.abs(resultado.gananciaPatrimonial), 2)}
                  unit="€"
                  variant={resultado.esGanancia ? 'highlight' : 'warning'}
                  icon={resultado.esGanancia ? '📈' : '📉'}
                  description={resultado.esGanancia ? 'Beneficio de la operación' : 'Pérdida de la operación'}
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
                {resultado.tieneFechas && (
                  <ResultCard
                    title="Periodo de tenencia"
                    value={formatNumber(Math.floor(resultado.mesesTenencia / 12), 0)}
                    unit={`años ${resultado.mesesTenencia % 12} meses`}
                    variant="success"
                    icon="📅"
                    description="Informativo (no cambia la base)"
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
                {resultado.esGanancia && resultado.perdidasPreviasAplicadas > 0 && (
                  <>
                    <div className={styles.desgloseRow}>
                      <span>− Minusvalías de años anteriores</span>
                      <span className={styles.desgloseValor}>−{formatCurrency(resultado.perdidasPreviasAplicadas)}</span>
                    </div>
                    <div className={styles.desgloseRow}>
                      <span>= Base imponible del ahorro</span>
                      <span className={styles.desgloseValor}>{formatCurrency(resultado.baseImponible)}</span>
                    </div>
                  </>
                )}
                {resultado.esGanancia && (
                  <div className={styles.desgloseRow} style={{ fontWeight: 700, color: '#e53e3e' }}>
                    <span>IRPF estimado</span>
                    <span className={styles.desgloseValor}>{formatCurrency(resultado.cuotaIRPF)}</span>
                  </div>
                )}
              </div>

              {/* Compensación de minusvalías */}
              {resultado.esGanancia && resultado.perdidasPreviasAplicadas > 0 && (
                <div className={styles.reglaBox} style={{ background: 'rgba(46,134,171,0.08)', borderColor: 'var(--primary)', color: 'var(--text-primary)' }}>
                  <strong>Compensación aplicada:</strong> has reducido la ganancia en{' '}
                  {formatCurrency(resultado.perdidasPreviasAplicadas)} con minusvalías de años anteriores.
                  {resultado.perdidasPreviasRestantes > 0
                    ? <> Te quedan <strong>{formatCurrency(resultado.perdidasPreviasRestantes)}</strong> de minusvalías pendientes para los próximos ejercicios.</>
                    : <> Has agotado las minusvalías pendientes que introdujiste.</>}
                </div>
              )}

              {/* Pérdida del ejercicio compensable */}
              {!resultado.esGanancia && !resultado.perdidaDiferida && (
                <div className={styles.reglaBox} style={{ background: 'rgba(46,134,171,0.08)', borderColor: 'var(--primary)', color: 'var(--text-primary)' }}>
                  <strong>Pérdida compensable:</strong> esta pérdida de{' '}
                  {formatCurrency(Math.abs(resultado.gananciaPatrimonial))} puede compensar ganancias patrimoniales del
                  mismo año y, lo que sobre, durante los <strong>4 ejercicios siguientes</strong>. Además, hasta el 25 % puede
                  compensar rendimientos del capital mobiliario positivos (dividendos, intereses).
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3><span aria-hidden="true">⚠️</span> Herramienta de Orientación — No es asesoramiento fiscal</h3>
        <p>
          Este estimador proporciona una <strong>estimación orientativa</strong> basada en{' '}
          <a href={FISCAL_INMUEBLES_META.urlOficialIRPF} target="_blank" rel="noopener noreferrer">
            {FISCAL_INMUEBLES_META.fuente}
          </a>. El cálculo real puede variar por:
        </p>
        <ul>
          <li>Exenciones aplicables: reinversión en vivienda habitual, mayores de 65 años, dación en pago</li>
          <li>Coeficientes de abatimiento para activos adquiridos antes de 31/12/1994</li>
          <li>El método FIFO obligatorio cuando hay varias compras del mismo valor</li>
          <li>El límite del 25 % en la compensación con rendimientos del capital mobiliario</li>
          <li>Tipo autonómico específico del IRPF y gastos deducibles no incluidos (mejoras en inmuebles)</li>
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
        subtitle="Guía sobre ganancias patrimoniales, base del ahorro y planificación fiscal 2025"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Ganancias y pérdidas patrimoniales en el IRPF</h2>
          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">📈</span> ¿Qué es una ganancia patrimonial?</h4>
              <p>
                Es la diferencia positiva entre el valor de transmisión (venta) y el valor de adquisición (compra)
                de un bien. Si vendes por más de lo que compraste (descontando gastos), tienes una ganancia patrimonial.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">📉</span> ¿Y si pierdo dinero?</h4>
              <p>
                Las pérdidas patrimoniales pueden compensarse con ganancias del mismo año o de los 4 años siguientes.
                No es obligatorio declarar pérdidas si el importe es pequeño, pero puede interesar para compensar futuras ganancias.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">⏱️</span> ¿Importa el plazo de tenencia?</h4>
              <p>
                Desde 2015, <strong>todas las ganancias por transmisión tributan en la base del ahorro</strong>, tengas el
                activo días o años. La distinción corto/largo plazo desapareció. El plazo solo importa para los coeficientes
                de abatimiento de activos comprados antes de 1995.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4><span aria-hidden="true">🏠</span> Exención vivienda habitual</h4>
              <p>
                La ganancia por venta de la vivienda habitual está exenta si reinviertes el importe en otra vivienda habitual
                en un plazo de 2 años. También exenta si el vendedor tiene más de 65 años y es su vivienda habitual.
              </p>
            </div>
          </div>

          <h3>Tramos de la base del ahorro 2025</h3>
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

        {/* ── 1. Tabla Comparativa ─────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Comparativa por tipo de activo</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            No todos los activos tributan igual. Esta tabla resume las diferencias clave para 2025.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Activo</th>
                  <th>Tributa en</th>
                  <th>Gastos deducibles</th>
                  <th>Particularidad clave</th>
                  <th>Retención en origen</th>
                  <th>Complejidad declaración</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Inmueble</strong></td>
                  <td>Base del ahorro (cualquier plazo)</td>
                  <td>ITP/AJD, notaría, registro, gestoría, reformas que aumentan valor, comisión agencia, plusvalía municipal</td>
                  <td>Exenta por reinversión en vivienda habitual o mayores de 65 años</td>
                  <td>No aplica (el comprador no retiene)</td>
                  <td>Alta — muchos gastos y posibles exenciones</td>
                </tr>
                <tr>
                  <td><strong>Fondos de inversión</strong></td>
                  <td>Base del ahorro (o 0 € si es traspaso)</td>
                  <td>Comisiones de suscripción y reembolso</td>
                  <td>Traspaso entre fondos España/UE sin tributar hasta el reembolso final</td>
                  <td>19% retención automática en el reembolso</td>
                  <td>Media — la gestora informa en el certificado fiscal</td>
                </tr>
                <tr>
                  <td><strong>Acciones / ETF</strong></td>
                  <td>Base del ahorro (cualquier plazo)</td>
                  <td>Comisiones de compra y venta del bróker</td>
                  <td>Regla de los 2 meses invalida pérdidas si recompras; ETF NO admiten traspaso</td>
                  <td>19% retención automática (acciones españolas)</td>
                  <td>Media-alta — FIFO obligatorio con múltiples compras</td>
                </tr>
                <tr>
                  <td><strong>Criptomonedas</strong></td>
                  <td>Base del ahorro (cada unidad por separado)</td>
                  <td>Comisiones del exchange por compra y venta</td>
                  <td>Cada intercambio cripto→cripto es un hecho imponible independiente</td>
                  <td>No aplica (sin retención en origen)</td>
                  <td>Muy alta — exige registro de todas las operaciones</td>
                </tr>
                <tr>
                  <td><strong>Plan de pensiones</strong></td>
                  <td>Base general (rendimiento del trabajo)</td>
                  <td>No aplica (no es ganancia patrimonial)</td>
                  <td>El rescate tributa como trabajo; aportar reduce la base general</td>
                  <td>Retención de trabajo al rescate</td>
                  <td>Baja — pero el rescate en capital puede disparar el tipo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. Casos de Uso ──────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            Ejemplos concretos con números para que entiendas cómo se aplican las reglas en la práctica.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏠</span>
                <h4>Venta de piso comprado en 2015</h4>
              </div>
              <div className={styles.escenarioExample}>
                Compra en 2015 por 150.000 € (+ 13.500 € gastos ITP y notaría). Venta en 2024 por 230.000 € (− 10.000 € comisión inmobiliaria y plusvalía municipal).<br /><br />
                Valor adquisición: <strong>163.500 €</strong><br />
                Valor transmisión: <strong>220.000 €</strong><br />
                Ganancia patrimonial: <strong>56.500 €</strong><br />
                Cuota aprox. (base ahorro): <strong>~10.665 €</strong><br />
                <em>(6.000 × 19% + 44.000 × 21% + 6.500 × 23%)</em>
              </div>
              <p className={styles.escenarioTip}>
                Tributa en la base del ahorro (19–30%). Si fuera vivienda habitual y reinviertes en otra, la ganancia queda exenta.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔄</span>
                <h4>Traspaso entre fondos de inversión</h4>
              </div>
              <div className={styles.escenarioExample}>
                Tienes 30.000 € en el Fondo A (ganancia latente de 8.000 €). Traspasas al Fondo B domiciliado en España.<br /><br />
                Resultado fiscal: <strong>0 € a pagar en el año del traspaso</strong><br />
                El valor de adquisición del Fondo B hereda el coste original del Fondo A. La ganancia tributa cuando hagas el reembolso final.
              </div>
              <p className={styles.escenarioTip}>
                Atención: esta ventaja NO aplica a ETF ni a fondos domiciliados fuera de la UE. Un traspaso de Fondo A a un ETF sí genera hecho imponible inmediato.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h4>Acciones con pérdidas que compensan ganancias</h4>
              </div>
              <div className={styles.escenarioExample}>
                Venta de acciones de empresa A: +4.000 € de ganancia.<br />
                Venta de acciones de empresa B: −2.500 € de pérdida.<br /><br />
                Base imponible neta: <strong>1.500 €</strong><br />
                IRPF a pagar: <strong>285 € (19% sobre 1.500 €)</strong><br /><br />
                Si la pérdida hubiera sido mayor que la ganancia, el exceso puede compensarse en los 4 años siguientes.
              </div>
              <p className={styles.escenarioTip}>
                Regla de los 2 meses: si recompras las acciones de empresa B en los 2 meses siguientes a la venta, la pérdida de 2.500 € queda invalidada para compensar.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🪙</span>
                <h4>Criptomonedas: el intercambio BTC→ETH tributa</h4>
              </div>
              <div className={styles.escenarioExample}>
                Compraste 1 BTC en enero por 35.000 €. En agosto lo intercambiaste por 20 ETH (valor de mercado en ese momento: 52.000 €).<br /><br />
                Ganancia realizada: <strong>17.000 €</strong><br />
                Tributa en la <strong>base del ahorro</strong> (19–30%), tanto si lo tuviste meses como años.
              </div>
              <p className={styles.escenarioTip}>
                Cada intercambio cripto→cripto es una transmisión. No hace falta convertir a euros para que se genere el hecho imponible. Exporta el CSV del exchange para cada año.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. FAQ ───────────────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cómo puedo reducir la ganancia con gastos de compra y venta?</h4>
              <p>
                El valor de adquisición incluye el precio pagado más todos los gastos e impuestos directamente vinculados: ITP o IVA, notaría, registro de la propiedad, gestoría y comisiones del bróker. El valor de transmisión es el precio de venta menos los gastos de la operación: comisión de la agencia inmobiliaria, plusvalía municipal (IIVTNU), notaría y gestoría de la venta. Cuanto más detallados sean tus justificantes, menor será la ganancia declarada.
              </p>
              <span className={styles.faqTip}>Guarda todas las facturas relacionadas con la operación</span>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Las pérdidas de un año pueden compensarse en años siguientes?</h4>
              <p>
                Sí. Las pérdidas patrimoniales pendientes de compensar pueden aplicarse durante los 4 ejercicios siguientes. En primer lugar se compensan con ganancias del mismo tipo (base del ahorro con base del ahorro). Si quedan pérdidas sin compensar en la base del ahorro, pueden aplicarse hasta el 25% de los rendimientos de capital mobiliario positivos del mismo año. La compensación cruzada entre base general y base del ahorro también está limitada al 25% desde 2021.
              </p>
              <span className={styles.faqTip}>Esta herramienta aplica tus minusvalías pendientes sobre la ganancia actual</span>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es la exención por reinversión en vivienda habitual y cómo funciona?</h4>
              <p>
                Si vendes tu vivienda habitual con ganancia y reinviertes el importe obtenido en la adquisición de una nueva vivienda habitual en un plazo de 2 años (antes o después de la venta), la ganancia queda exenta en proporción a lo reinvertido. Si solo reinviertes parte del importe, la exención es parcial. Condición clave: el vendedor debe haber residido en la vivienda de forma continuada al menos 3 años, salvo causas justificadas.
              </p>
              <span className={styles.faqTip}>Válido también si adquiriste la nueva vivienda hasta 2 años antes de vender la anterior</span>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo tributan las donaciones de acciones o fondos?</h4>
              <p>
                Cuando donas acciones o fondos, el donante no tributa por IRPF en ese momento (el donante no tiene ganancia patrimonial). Sin embargo, el receptor hereda el valor de adquisición original del donante. Cuando el receptor venda en el futuro, tributará por la diferencia entre el valor de mercado en la fecha de la donación y el precio de venta. La donación en sí tributa por el Impuesto de Donaciones (a cargo del donatario).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Las plusvalías de planes de pensiones tributan igual que las de fondos de inversión?</h4>
              <p>
                No. Los planes de pensiones no generan ganancia patrimonial: las aportaciones son deducibles en la base general del IRPF (hasta 1.500 €/año) y las prestaciones tributan como rendimientos del trabajo al rescate, no como ganancias patrimoniales en la base del ahorro. En cambio, los fondos de inversión sí generan ganancias patrimoniales al reembolso, con los tipos de la base del ahorro (19–30%).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Tengo que declarar una venta de acciones aunque haya perdido dinero?</h4>
              <p>
                Técnicamente, si el importe total de transmisiones con retención supera los 1.600 € en el año, o si el conjunto de ganancias y pérdidas supera 500 €, existe obligación de declarar. En la práctica, si has vendido acciones a través de un bróker español, ya habrán practicado retención y te informarán en el certificado fiscal. Aunque la operación genere pérdida, interesa declararla para poder compensarla con futuras ganancias en los 4 años siguientes.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es la regla de los dos meses para compensar pérdidas?</h4>
              <p>
                En España, si vendes valores con pérdida y adquieres los mismos valores (o valores homogéneos) en los 2 meses anteriores o posteriores a la venta, la pérdida no puede compensarse en ese ejercicio: queda diferida hasta que vendas los valores recomprados. Esta norma antiabuso está en el art. 33.5 LIRPF y aplica a acciones y participaciones en fondos cotizados. Para valores no cotizados, el plazo se amplía a un año.
              </p>
              <span className={styles.faqTip}>Activa la casilla de recompra en el simulador para verlo aplicado</span>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo calculo el valor de adquisición de acciones compradas en varias veces (FIFO)?</h4>
              <p>
                La normativa española obliga a usar el método FIFO (First In, First Out): cuando vendas, se considera que vendes primero las acciones más antiguas. Por ejemplo, si compraste 100 acciones en 2020 a 10 € y 100 en 2022 a 15 €, y vendes 100 en 2025, el coste asignado es 10 € por acción (las de 2020). Tu bróker debe informarte del coste FIFO en el certificado fiscal anual.
              </p>
            </div>
          </div>
        </section>

        {/* ── 4. Guía Paso a Paso ──────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Cómo declarar plusvalías: 6 pasos</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
            Proceso completo desde que recopilas los datos hasta que cumplimentas el modelo 100.
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Recopilar todas las ventas del año</h4>
                <p>Obtén el extracto de operaciones de cada bróker, el certificado fiscal de la gestora de fondos, las escrituras de transmisión de inmuebles y los CSV de los exchanges de criptomonedas. Necesitas la fecha, el precio de compra, el precio de venta y las comisiones de cada operación.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Calcular el valor de adquisición con todos los gastos</h4>
                <p>Suma al precio de compra: ITP o IVA pagado, notaría, registro de la propiedad, gestoría, comisiones del bróker o agencia. En el caso de inmuebles heredados, el valor de adquisición es el declarado en el Impuesto de Sucesiones (IS), no el precio original del fallecido.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Calcular el valor de transmisión neto de gastos</h4>
                <p>Al precio de venta réstale: la comisión de la agencia inmobiliaria (habitualmente 3–5%), la plusvalía municipal abonada (IIVTNU), los honorarios de notaría y gestoría de la venta, y las comisiones del bróker. Cada euro deducido reduce directamente la ganancia patrimonial.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Aplicar el método FIFO si tienes acciones o fondos con múltiples compras</h4>
                <p>Ordena tus compras de más antigua a más reciente. Asigna las ventas empezando por las acciones o participaciones más antiguas. Esto determina el coste de adquisición de cada unidad vendida y, por tanto, la ganancia o pérdida resultante.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Compensar ganancias y pérdidas</h4>
                <p>Primero compensa las pérdidas de la base del ahorro con las ganancias de la base del ahorro. Si hay pérdidas excedentes, aplícalas sobre los rendimientos de capital mobiliario positivos (dividendos, intereses) hasta el límite del 25%. Las pérdidas no compensadas en el año se arrastran hasta 4 ejercicios.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Incluir en el modelo 100 (Declaración de la Renta)</h4>
                <p>Las ganancias y pérdidas de la base del ahorro se declaran en las casillas de «Ganancias y pérdidas patrimoniales derivadas de transmisiones». Las operaciones con retención ya aparecen precargadas; revisa que los valores coincidan con tu certificado fiscal y añade las que falten (criptomonedas, inmuebles, etc.).</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Mejores Prácticas ─────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Aspectos prácticos al declarar plusvalías</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <p><strong>Usa el traspaso en lugar de vender</strong> si tienes fondos de inversión con ganancia y quieres cambiar de estrategia: difieres la tributación hasta el reembolso final. Recuerda que los ETF no admiten traspaso.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📉</span>
              <p><strong>Aprovecha las pérdidas latentes antes de fin de año</strong> para compensar ganancias ya realizadas. Si tienes acciones en pérdida y no esperas que se recuperen, venderlas antes del 31 de diciembre reduce la base imponible del ejercicio. Recuerda respetar la regla de los 2 meses.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <p><strong>Deduce todos los gastos de adquisición en inmuebles:</strong> ITP/AJD (6–10% del precio), notaría (~0,5–1%), registro de la propiedad (~0,3–0,5%), gestoría (~300–600 €) y reformas que aumenten la superficie o mejoren la habitabilidad. Estos gastos pueden sumar fácilmente 10.000–20.000 € en un piso de 200.000 €.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <p><strong>En inmuebles heredados, el valor de adquisición es el declarado en el IS,</strong> no el precio original del fallecido. Si el inmueble se valoró en la herencia por debajo de mercado, la ganancia patrimonial al vender será mayor. Considera consultar con un asesor antes de aceptar una herencia con inmuebles.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔨</span>
              <p><strong>Guarda el justificante de obras y mejoras del inmueble.</strong> Las mejoras que aumenten el valor del bien (cambio de instalación eléctrica, reforma integral, ampliación de superficie) se añaden al valor de adquisición y reducen la ganancia. Las reparaciones de mantenimiento no son deducibles.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪙</span>
              <p><strong>Para criptomonedas, exporta el historial completo del exchange</strong> al finalizar el año y calcula el precio medio FIFO de cada criptomoneda. La falta de declaración es detectada por Hacienda mediante el modelo 721 (saldos en exchanges extranjeros &gt;50.000 €).</p>
            </div>
          </div>
        </section>

        {/* ── 6. Warning Box ───────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores frecuentes que cuestan dinero (o multas)</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Olvidar las comisiones del bróker</strong> en el valor de adquisición y transmisión. Cada comisión reduce la ganancia computable. En operaciones frecuentes, pueden suponer cientos de euros deducibles que se pierden por no incluirlos.
              </li>
              <li>
                <strong>Creer que un traspaso entre fondos nunca tributa.</strong> El régimen de traspasos aplica solo a fondos de inversión domiciliados en España o en la UE con convenio. Los ETF y fondos extranjeros fuera del régimen sí generan ganancia patrimonial inmediata al traspaso.
              </li>
              <li>
                <strong>Compensar pérdidas de acciones recomprando los mismos títulos en los 2 meses siguientes.</strong> La Agencia Tributaria invalida la compensación de esa pérdida, que queda diferida hasta la venta definitiva. El plazo es 2 meses tanto antes como después de la venta con pérdida.
              </li>
              <li>
                <strong>Creer que vender antes de un año cambia la tributación.</strong> Desde 2015, todas las ganancias por transmisión van a la base del ahorro (19–30%) sea cual sea la antigüedad del activo. La distinción corto/largo plazo desapareció: esperar al año ya no reduce el tipo.
              </li>
              <li>
                <strong>No declarar la venta de un inmueble aunque genere pérdida.</strong> Hacienda detecta las transmisiones inmobiliarias a través del Registro de la Propiedad y del modelo 600 (ITP). La omisión puede dar lugar a una liquidación paralela con recargo e intereses de demora.
              </li>
              <li>
                <strong>Ignorar la tributación de criptomonedas en intercambios entre monedas.</strong> Cada swap BTC→ETH, cada uso de criptomonedas para pagar bienes o servicios, y cada conversión a stablecoins es una transmisión que genera ganancia o pérdida. No hace falta convertir a euros para que nazca la obligación fiscal.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-plusvalias-irpf')} />
      <ShareCard appName="estimador-plusvalias-irpf" />
      <Footer appName="estimador-plusvalias-irpf" />
    </div>
  );
}
