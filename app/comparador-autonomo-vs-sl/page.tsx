'use client';

import { useState, useCallback } from 'react';
import styles from './ComparadorAutonomoVsSL.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  FISCAL_AUTONOMOS_META,
  FISCAL_SOCIEDADES_META,
  TRAMOS_IRPF_2025,
  TRAMOS_RETA_2025,
  TIPO_COTIZACION_RETA,
  TIPOS_IS_2025,
  RETENCIONES_IS_2025,
  AUTONOMO_SOCIETARIO_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
} from '@/data/fiscal';

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

function calcularCuotaIRPF(baseLiquidable: number): number {
  let cuota = 0;
  let restante = Math.max(0, baseLiquidable);
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

function calcularCuotaBaseAhorro(base: number): number {
  let cuota = 0;
  let restante = Math.max(0, base);
  let limiteAnterior = 0;
  for (const tramo of TRAMOS_GANANCIAS_PATRIMONIALES_2025) {
    const anchura = tramo.hasta - limiteAnterior;
    const baseTramo = Math.min(restante, anchura);
    if (baseTramo <= 0) break;
    cuota += baseTramo * (tramo.tipo / 100);
    restante -= baseTramo;
    limiteAnterior = tramo.hasta;
  }
  return cuota;
}

function calcularCuotaReta(rendimientoMensual: number): number {
  const tramo = TRAMOS_RETA_2025.find(t => {
    if (t.rendimientoMax === null) return rendimientoMensual >= t.rendimientoMin;
    return rendimientoMensual >= t.rendimientoMin && rendimientoMensual < t.rendimientoMax;
  }) || TRAMOS_RETA_2025[0];
  return tramo.baseMinima * TIPO_COTIZACION_RETA * 12;
}

interface ResultadoFiscal {
  ingresosBrutos: number;
  gastosDeducibles: number;
  rendimientoNeto: number;
  cuotaSS: number;
  baseImpuestos: number;
  cuotaImpuestos: number;
  totalCargas: number;
  netoAnual: number;
  tipoEfectivoTotal: number;
}

function calcularAutonomo(beneficio: number, gastosDeducibles: number): ResultadoFiscal {
  const rendimientoMensual = Math.max(0, beneficio - gastosDeducibles) / 12;
  const cuotaRetaAnual = calcularCuotaReta(rendimientoMensual);

  // Rendimiento neto = beneficio - gastos deducibles - cuota SS
  const rendimientoNeto = Math.max(0, beneficio - gastosDeducibles - cuotaRetaAnual);

  // IRPF: reducción mínima de 5.550 (mínimo personal básico)
  const minimoPersonal = 5550;
  const baseLiquidable = Math.max(0, rendimientoNeto - minimoPersonal);
  const cuotaIRPF = calcularCuotaIRPF(baseLiquidable);

  const totalCargas = cuotaRetaAnual + cuotaIRPF;
  const netoAnual = beneficio - gastosDeducibles - totalCargas;

  return {
    ingresosBrutos: beneficio,
    gastosDeducibles,
    rendimientoNeto,
    cuotaSS: cuotaRetaAnual,
    baseImpuestos: rendimientoNeto,
    cuotaImpuestos: cuotaIRPF,
    totalCargas,
    netoAnual: Math.max(0, netoAnual),
    tipoEfectivoTotal: beneficio > 0 ? (totalCargas / beneficio) * 100 : 0,
  };
}

function calcularSL(beneficio: number, gastosDeducibles: number, tipoIS: number, repartirDividendos: boolean): ResultadoFiscal {
  // Beneficio contable de la SL = beneficio - gastos deducibles
  const beneficioSL = Math.max(0, beneficio - gastosDeducibles);

  // IS
  const cuotaIS = beneficioSL * (tipoIS / 100);
  const beneficioNeto = beneficioSL - cuotaIS;

  // Autónomo societario obligatorio (cotización administrador)
  const cuotaAutoSocietario = AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual * 12;

  // Si reparte dividendos: IRPF sobre dividendos usando tramos oficiales base del ahorro
  let irpfDividendos = 0;
  if (repartirDividendos) {
    irpfDividendos = calcularCuotaBaseAhorro(beneficioNeto);
  }

  const totalCargas = cuotaIS + cuotaAutoSocietario + irpfDividendos;
  const netoAnual = repartirDividendos ? beneficioNeto - irpfDividendos - cuotaAutoSocietario : beneficioNeto - cuotaAutoSocietario;

  return {
    ingresosBrutos: beneficio,
    gastosDeducibles,
    rendimientoNeto: beneficioSL,
    cuotaSS: cuotaAutoSocietario,
    baseImpuestos: beneficioSL,
    cuotaImpuestos: cuotaIS + irpfDividendos,
    totalCargas,
    netoAnual: Math.max(0, netoAnual),
    tipoEfectivoTotal: beneficio > 0 ? (totalCargas / beneficio) * 100 : 0,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ComparadorAutonomoVsSLPage() {
  const [beneficio, setBeneficio] = useState('');
  const [gastosDeducibles, setGastosDeducibles] = useState('');
  const [tipoIS, setTipoIS] = useState<'25' | '23' | '15'>('25');
  const [repartirDividendos, setRepartirDividendos] = useState(true);

  const [resultados, setResultados] = useState<{
    autonomo: ResultadoFiscal;
    sl: ResultadoFiscal;
    ahorroSL: number;
    convieneSL: boolean;
  } | null>(null);

  const calcular = useCallback(() => {
    const b = parseSpanishNumber(beneficio) || 0;
    const g = parseSpanishNumber(gastosDeducibles) || 0;
    if (b <= 0) return;

    const resAutonomo = calcularAutonomo(b, g);
    const resSL = calcularSL(b, g, parseInt(tipoIS), repartirDividendos);
    const ahorroSL = resAutonomo.totalCargas - resSL.totalCargas;

    setResultados({ autonomo: resAutonomo, sl: resSL, ahorroSL, convieneSL: ahorroSL > 0 });
  }, [beneficio, gastosDeducibles, tipoIS, repartirDividendos]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Comparador Autónomo vs SL 2025</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre qué forma fiscal conviene más según tu nivel de ingresos
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={FISCAL_AUTONOMOS_META.fuente}
        fuente={FISCAL_AUTONOMOS_META.fuente}
        verificado={FISCAL_AUTONOMOS_META.verificado}
        urlOficial={FISCAL_AUTONOMOS_META.urlOficial}
      />

      {/* Configuración */}
      <div className={styles.configSection}>
        <h2 className={styles.configTitle}>Introduce tus datos orientativos</h2>
        <div className={styles.configGrid}>
          <NumberInput
            value={beneficio}
            onChange={setBeneficio}
            label="Beneficio bruto anual previsto"
            placeholder="60000"
            helperText="Ingresos totales de tu actividad"
            min={0}
          />
          <NumberInput
            value={gastosDeducibles}
            onChange={setGastosDeducibles}
            label="Gastos deducibles anuales"
            placeholder="10000"
            helperText="Gastos de la actividad (material, servicios, etc.)"
            min={0}
          />
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tipoIS">Tipo IS para la SL</label>
            <select
              id="tipoIS"
              value={tipoIS}
              onChange={e => setTipoIS(e.target.value as '25' | '23' | '15')}
              className={styles.select}
            >
              <option value="25">25% — Tipo general</option>
              <option value="23">23% — Micropyme (&lt; 1M € facturación)</option>
              <option value="15">15% — SL de nueva creación (primeros 2 años)</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={repartirDividendos}
                onChange={e => setRepartirDividendos(e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              Repartir todo el beneficio como dividendos
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
              Si no repartes dividendos, el beneficio queda en la sociedad (reinversión).
            </p>
          </div>
          <button onClick={calcular} className={styles.btnCalcular}>
            Comparar
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultados ? (
        <>
          {/* Ganador */}
          <div className={styles.resultadoGanador} role="status" aria-live="polite">
            <p className={styles.ganadorLabel}>Resultado orientativo de la comparativa</p>
            <p className={styles.ganadorTexto}>
              {resultados.convieneSL
                ? '🏆 Con estos datos, la SL tiene menor carga fiscal'
                : '🏆 Con estos datos, el Autónomo tiene menor carga fiscal'}
            </p>
            {Math.abs(resultados.ahorroSL) > 0 && (
              <p className={styles.ganadorAhorro}>
                Diferencia orientativa: {formatCurrency(Math.abs(resultados.ahorroSL))} al año
                {resultados.convieneSL ? ' a favor de la SL' : ' a favor del Autónomo'}
              </p>
            )}
            <p className={styles.ganadorNota}>
              ⚠️ Estimación simplificada. La decisión real depende de muchos otros factores.
            </p>
          </div>

          <div className={styles.comparativaGrid}>
            {/* Columna Autónomo */}
            <div className={styles.columnaAutonomo}>
              <div className={styles.columnaHeader}>
                <span className={styles.columnaEmoji} aria-hidden="true">👤</span>
                <h2 className={styles.columnaTitulo}>Régimen Autónomo</h2>
                <p className={styles.columnaSubtitulo}>IRPF + RETA</p>
              </div>
              <div className={styles.columnaBody}>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Ingresos brutos</span>
                  <span className={styles.filaValor}>{formatCurrency(resultados.autonomo.ingresosBrutos)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Gastos deducibles</span>
                  <span className={styles.filaValor}>- {formatCurrency(resultados.autonomo.gastosDeducibles)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Cuota RETA (SS)</span>
                  <span className={styles.filaValor}>- {formatCurrency(resultados.autonomo.cuotaSS)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Rendimiento neto</span>
                  <span className={styles.filaValor}>{formatCurrency(resultados.autonomo.rendimientoNeto)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>IRPF estimado</span>
                  <span className={styles.filaValor}>- {formatCurrency(resultados.autonomo.cuotaImpuestos)}</span>
                </div>
                <div className={styles.filaResultado + ' ' + styles.filaTotal}>
                  <span>Total cargas (SS + IRPF)</span>
                  <span>{formatCurrency(resultados.autonomo.totalCargas)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Tipo efectivo total</span>
                  <span className={styles.filaValor}>{formatNumber(resultados.autonomo.tipoEfectivoTotal, 1)}%</span>
                </div>
                <div className={styles.filaResultado + ' ' + styles.filaNetoPositivo}>
                  <span>Neto anual estimado</span>
                  <span>{formatCurrency(resultados.autonomo.netoAnual)}</span>
                </div>
              </div>
            </div>

            {/* Columna SL */}
            <div className={styles.columnaSL}>
              <div className={styles.columnaHeader}>
                <span className={styles.columnaEmoji} aria-hidden="true">🏢</span>
                <h2 className={styles.columnaTitulo}>Sociedad Limitada</h2>
                <p className={styles.columnaSubtitulo}>IS {tipoIS}% + dividendos{repartirDividendos ? '' : ' (sin repartir)'}</p>
              </div>
              <div className={styles.columnaBody}>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Ingresos brutos SL</span>
                  <span className={styles.filaValor}>{formatCurrency(resultados.sl.ingresosBrutos)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Gastos deducibles</span>
                  <span className={styles.filaValor}>- {formatCurrency(resultados.sl.gastosDeducibles)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Impuesto de Sociedades ({tipoIS}%)</span>
                  <span className={styles.filaValor}>- {formatCurrency(resultados.sl.cuotaImpuestos)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Autónomo societario (SS)</span>
                  <span className={styles.filaValor}>- {formatCurrency(resultados.sl.cuotaSS)}</span>
                </div>
                {repartirDividendos && (
                  <div className={styles.filaResultado}>
                    <span className={styles.filaLabel}>IRPF sobre dividendos</span>
                    <span className={styles.filaValor}>incluido arriba</span>
                  </div>
                )}
                <div className={styles.filaResultado + ' ' + styles.filaTotal}>
                  <span>Total cargas (IS + SS{repartirDividendos ? ' + IRPF div.' : ''})</span>
                  <span>{formatCurrency(resultados.sl.totalCargas)}</span>
                </div>
                <div className={styles.filaResultado}>
                  <span className={styles.filaLabel}>Tipo efectivo total</span>
                  <span className={styles.filaValor}>{formatNumber(resultados.sl.tipoEfectivoTotal, 1)}%</span>
                </div>
                <div className={styles.filaResultado + ' ' + styles.filaNetoPositivo}>
                  <span>Neto anual estimado</span>
                  <span>{formatCurrency(resultados.sl.netoAnual)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden="true">⚖️</span>
          <p>Introduce tu beneficio anual y pulsa «Comparar» para ver la estimación orientativa</p>
        </div>
      )}

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Herramienta de Orientación — No es asesoramiento fiscal ni mercantil</h3>
        <p>
          Esta comparativa es una <strong>estimación orientativa muy simplificada</strong> basada en{' '}
          <a href={FISCAL_IRPF_META.urlOficial} target="_blank" rel="noopener noreferrer">
            {FISCAL_IRPF_META.fuente}
          </a>{' '}y{' '}
          <a href="https://sede.agenciatributaria.gob.es/Sede/impuesto-sociedades.html" target="_blank" rel="noopener noreferrer">
            {FISCAL_SOCIEDADES_META.fuente}
          </a>. La decisión real autónomo vs SL depende de factores no incluidos:
        </p>
        <ul>
          <li>Salario del administrador (reduce beneficio de la SL, pero tributa en IRPF del administrador)</li>
          <li>Costes de constitución y mantenimiento de la SL (notaría, registro, gestoría mensual)</li>
          <li>Obligaciones contables y registrales adicionales de la SL</li>
          <li>Responsabilidad limitada vs ilimitada del autónomo</li>
          <li>Cotización autónomo societario: obligatoria incluso con pérdidas</li>
          <li>Deducciones específicas en IS (I+D, emprendedores, etc.)</li>
          <li>Tu CCAA y posibles deducciones autonómicas del IRPF</li>
        </ul>
        <p>
          <strong>Consulta siempre con un asesor fiscal y mercantil</strong> antes de tomar esta decisión.
          Los datos normativos están verificados a {FISCAL_SOCIEDADES_META.verificado}.
        </p>
        <p className={styles.disclaimerFecha}>
          Datos verificados: {FISCAL_SOCIEDADES_META.verificado} | Vigencia: {FISCAL_SOCIEDADES_META.vigencia}
        </p>
      </div>

      <EducationalSection
        title="¿Cuándo conviene más una SL que ser autónomo?"
        subtitle="Factores clave para decidir la forma jurídica más adecuada para tu negocio"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Autónomo vs SL: más allá de los impuestos</h2>
          <p>
            La decisión no es solo fiscal. Hay factores mercantiles, laborales y estratégicos que pesan tanto como
            el ahorro tributario.
          </p>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>📊 Fiscalidad (cuándo suele convenir SL)</h4>
              <ul>
                <li>Beneficios netos anuales superiores a <strong>40.000-60.000 €</strong> aprox.</li>
                <li>Cuando no necesitas retirar todo el beneficio como salario</li>
                <li>Si vas a reinvertir beneficios en el negocio</li>
                <li>Primeros 2 años: tipo IS 15% vs IRPF progresivo</li>
              </ul>
            </div>
            <div className={styles.guideCard}>
              <h4>⚠️ Costes de la SL a considerar</h4>
              <ul>
                <li>Constitución: ~1.500-3.000 € (notaría + registro)</li>
                <li>Gestoría mensual: ~150-400 €/mes</li>
                <li>Autónomo societario obligatorio: ~512 €/mes</li>
                <li>Legalización libros, cuentas anuales...</li>
              </ul>
            </div>
            <div className={styles.guideCard}>
              <h4>🛡️ Responsabilidad</h4>
              <p>
                El autónomo responde con su patrimonio personal (incluso vivienda habitual en algunos casos).
                La SL limita la responsabilidad al capital social, aunque el administrador puede responder
                personalmente en ciertos supuestos.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4>💡 Salario del administrador en SL</h4>
              <p>
                El administrador puede cobrar un salario de la SL (si consta en estatutos), que es gasto deducible
                para la sociedad y tributa en el IRPF del perceptor. Permite distribuir el beneficio entre IS y IRPF,
                siempre que el salario sea de mercado y esté documentado (la AEAT puede impugnar salarios desviados
                del valor razonable).
              </p>
            </div>
          </div>
        </section>

        {/* ── 1. Tabla Comparativa ──────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Tabla comparativa: Autónomo vs SL de un vistazo</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>👤 Autónomo</th>
                  <th>🏢 Sociedad Limitada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Capital mínimo</td>
                  <td>0 €</td>
                  <td>3.000 € (o 1 € SRL formación sucesiva)</td>
                </tr>
                <tr>
                  <td>Responsabilidad patrimonial</td>
                  <td>Ilimitada — responde con todos sus bienes</td>
                  <td>Limitada al capital social aportado</td>
                </tr>
                <tr>
                  <td>Tipo impositivo principal</td>
                  <td>IRPF progresivo: 19%–47%</td>
                  <td>IS fijo: 15% (nuevas) / 23% (micropyme) / 25%</td>
                </tr>
                <tr>
                  <td>Cotización mínima mensual SS</td>
                  <td>~230 €/mes (rendimiento bajo, tramo mínimo 2025)</td>
                  <td>~512 €/mes (autónomo societario obligatorio)</td>
                </tr>
                <tr>
                  <td>Costes de constitución</td>
                  <td>~50-150 € (alta en Hacienda y SS)</td>
                  <td>~1.500-3.000 € (notaría + Registro Mercantil)</td>
                </tr>
                <tr>
                  <td>Costes de gestoría anuales</td>
                  <td>~600-1.800 €/año</td>
                  <td>~2.400-5.000 €/año (más obligaciones contables)</td>
                </tr>
                <tr>
                  <td>Tiempo de constitución</td>
                  <td>1-3 días (alta telemática)</td>
                  <td>4-8 semanas (proceso registral completo)</td>
                </tr>
                <tr>
                  <td>Imagen ante clientes</td>
                  <td>Persona física con NIF, válida para la mayoría de contratos B2B y B2C en España</td>
                  <td>Persona jurídica, suele exigirse en licitaciones públicas y algunos contratos B2B internacionales</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. Casos de Uso ───────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Casos de uso reales: ¿cuándo conviene cada forma?</h2>
          <p>
            Los números abstractos no convencen. Aquí tienes cuatro perfiles concretos con estimaciones reales
            para que encuentres el que más se parece a tu situación.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h4>Freelance — 30.000 € beneficio neto</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Como <strong>autónomo</strong>: ~8.200 € IRPF + ~3.900 € RETA = <strong>12.100 € en cargas</strong>.
                </p>
                <p>
                  Como <strong>SL</strong> (IS 25%): ~5.400 € IS + ~6.144 € autónomo societario = ~11.500 €.
                  Añade costes fijos SL de ~5.000-6.000 €/año (gestoría, cuentas anuales, etc.).
                </p>
              </div>
              <p className={styles.escenarioTip}>
                Veredicto: La SL no compensa a este nivel. Los costes fijos anuales eliminan el ahorro fiscal.
                Continúa como autónomo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧑‍💼</span>
                <h4>Consultor — 60.000 € beneficio neto</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Como <strong>autónomo</strong>: ~22.000 € IRPF + ~5.500 € RETA = <strong>27.500 € en cargas</strong>.
                </p>
                <p>
                  Como <strong>SL</strong> con salario 30.000 €: IS ~7.500 € + IRPF salario ~5.000 € + autónomo societario ~6.144 €
                  = ~18.600 €. Ahorro bruto ~8.900 €, menos costes SL ~5.500 € → <strong>ahorro neto real ~3.400 €/año</strong>.
                </p>
              </div>
              <p className={styles.escenarioTip}>
                Veredicto: Empieza a compensar. Si reinviertes beneficios y no lo retiras todo, el ahorro real puede superar 6.000 €/año.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                <h4>Empresa en crecimiento — reinversión de beneficios</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Si tienes 80.000 € de beneficio y reinviertes 50.000 € en la empresa (equipos, contrataciones,
                  marketing), la SL solo tributa al <strong>23-25% IS</strong> por esos 50.000 € que no retiras.
                  Como autónomo, tributarías al 43-47% de IRPF por <em>todos</em> los beneficios, reinviertas o no.
                </p>
              </div>
              <p className={styles.escenarioTip}>
                Veredicto: La SL es ideal cuando creces y reinviertes. Cada euro no retirado tributa ~22 puntos menos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
                <h4>Profesional con clientes internacionales</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p>
                  Los contratos B2B con empresas de la UE y EE.UU. suelen exigir una entidad jurídica formal.
                  Con SL puedes emitir facturas con NIF europeo (IVA UE), participar en licitaciones públicas
                  y firmar contratos donde una empresa contratante no puede trabajar con un autónomo individual.
                </p>
              </div>
              <p className={styles.escenarioTip}>
                Veredicto: Aunque el ahorro fiscal no sea enorme, la imagen y capacidad contractual de la SL
                abre puertas que justifican el coste.
              </p>
            </div>
          </div>
        </section>

        {/* ── 3. FAQ ────────────────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre autónomo vs SL</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿A partir de cuántos ingresos compensa crear una SL?</dt>
              <dd>
                No hay una cifra exacta porque depende de cuánto retiras, cuánto reinviertes y los costes fijos de
                tu SL. Como referencia orientativa: con beneficios netos entre <strong>40.000-50.000 €</strong> y
                costes SL de ~5.000 €/año, el ahorro fiscal empieza a cubrir los gastos de estructura. Con más de
                60.000 € el ahorro suele ser claro. Por debajo de 35.000 €, la SL raramente compensa.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo ser administrador de mi SL sin cobrar salario?</dt>
              <dd>
                Sí, pero debes estar dado de alta como autónomo societario igualmente si controlas más del 25%
                del capital social y trabajas en la empresa. La cotización mínima es ~512 €/mes (2025)
                independientemente de si te pagas salario. No cobrar salario puede generar problemas con la AEAT
                por operaciones vinculadas si la SL tiene actividad real.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué pasa si la SL tiene pérdidas? ¿Respondo yo personalmente?</dt>
              <dd>
                En general, no. La responsabilidad está limitada al capital social. Sin embargo, el administrador
                puede responder personalmente si: hay deudas tributarias o de SS no atendidas, se continúa
                operando con fondos propios negativos sin tomar medidas (art. 363 LSC), o hay conductas fraudulentas
                o negligentes. La limitación de responsabilidad no es absoluta.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo tener SL y seguir siendo autónomo al mismo tiempo?</dt>
              <dd>
                Sí. Puedes ser administrador/socio de tu SL (alta como autónomo societario) y simultáneamente
                tener actividad por cuenta propia diferenciada. Pagarías las dos cotizaciones, pero cada actividad
                tributa de forma separada. Es una situación legal perfectamente válida, aunque compleja
                desde el punto de vista administrativo.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuánto tarda crear una SL en España?</dt>
              <dd>
                El proceso completo lleva entre <strong>4 y 8 semanas</strong>: certificación nombre en Registro
                Mercantil Central (1-3 días), apertura cuenta bancaria y depósito capital (2-5 días hábiles),
                escritura notarial (1 día, cita previa), presentación ITP-AJD exento (inmediato), inscripción
                Registro Mercantil Provincial (15-30 días), NIF definitivo Hacienda (1-5 días). Los registros
                mercantiles de grandes ciudades pueden tardar más.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué impuestos paga la SL aparte del Impuesto de Sociedades?</dt>
              <dd>
                La SL también debe presentar y/o pagar: <strong>IVA</strong> (trimestral, modelo 303),
                <strong> retenciones IRPF</strong> de empleados y profesionales (modelo 111, trimestral),
                <strong> retenciones de alquileres</strong> si los hay (modelo 115),
                <strong> resumen anual</strong> (modelos 190/180),
                <strong> Impuesto de Actividades Económicas</strong> (IAE) si factura más de 1 M €,
                y <strong>Cuentas Anuales</strong> en el Registro Mercantil (no es un impuesto, pero sí obligación).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿El autónomo societario tiene las mismas prestaciones que el autónomo normal?</dt>
              <dd>
                Sí, en general. El autónomo societario cotiza en el RETA y tiene acceso a las mismas prestaciones:
                cese de actividad (paro del autónomo), incapacidad temporal, jubilación, maternidad/paternidad.
                La diferencia es que la base de cotización suele ser más alta (mínimo ~1.634 €/mes en 2025),
                lo que implica mayor cuota pero también mejores prestaciones futuras.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo cambiar de autónomo a SL sin perder clientes ni contratos?</dt>
              <dd>
                La transición no es automática. Tus contratos como autónomo son personales — deberás renegociar
                o subrogar cada contrato a nombre de la nueva SL. En la práctica, la mayoría de clientes aceptan
                el cambio sin problema si se gestiona bien. Eso sí, deberás emitir nuevas facturas con el NIF
                de la SL desde la fecha de constitución. La cesión de actividad (aportación de rama de actividad)
                tiene ventajas fiscales específicas — consúltalo con tu asesor.
              </dd>
            </div>
          </dl>
        </section>

        {/* ── 4. Guía Paso a Paso ───────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Cómo constituir una SL en España: 6 pasos</h2>
          <p>
            Si tras el análisis decides que la SL es tu opción, este es el proceso oficial paso a paso
            con plazos y costes reales (2025).
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h4>Certificación negativa del nombre</h4>
                <p>
                  Solicita en el <strong>Registro Mercantil Central</strong> que el nombre elegido para tu SL
                  no está ya registrado. Puedes hacerlo online en <em>rmc.es</em>. Plazo habitual: <strong>1-3 días hábiles</strong>.
                  Coste: <strong>13,52 €</strong>. La certificación tiene validez de 6 meses para presentar
                  la escritura.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h4>Apertura de cuenta bancaria y depósito del capital social</h4>
                <p>
                  Abre una cuenta a nombre de la sociedad en constitución y deposita el capital mínimo:
                  <strong> 3.000 € para SRL estándar</strong> o <strong>1 € para SRL de formación sucesiva</strong>
                  (con restricciones de reparto de dividendos hasta alcanzar 3.000 € en reservas). El banco
                  emitirá un certificado de depósito que necesitarás en el notario. Plazo: 2-5 días hábiles.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h4>Escritura de constitución ante notario</h4>
                <p>
                  Con la certificación del nombre y el certificado bancario, acude al notario para firmar
                  los estatutos sociales y la escritura de constitución. Si tienes un socio único, es más
                  sencillo. Coste orientativo: <strong>600-900 €</strong> (depende de los honorarios notariales
                  y la complejidad de los estatutos). Duración: 1 día (con cita previa).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h4>Autoliquidación del ITP-AJD (exento)</h4>
                <p>
                  Aunque desde 2010 la constitución de SL está <strong>exenta del Impuesto de Transmisiones
                  Patrimoniales y Actos Jurídicos Documentados</strong>, la Ley obliga a presentar igualmente
                  el modelo de autoliquidación (modelo 600 en la CCAA correspondiente) como trámite formal,
                  con cuota cero. Es un papeleo necesario antes de inscribir en el Registro Mercantil.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h4>Inscripción en el Registro Mercantil Provincial</h4>
                <p>
                  Presenta la escritura notarial y la autoliquidación de ITP en el Registro Mercantil de la
                  provincia donde tengas el domicilio social. Coste: <strong>300-400 €</strong> (aranceles
                  registrales). Plazo legal: 15 días hábiles, pero en la práctica puede extenderse
                  <strong> 15-30 días</strong> o más en ciudades grandes. Solo tras la inscripción existe
                  legalmente la SL.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h4>NIF definitivo y alta en Hacienda</h4>
                <p>
                  Solicita el NIF definitivo en la Agencia Tributaria (sustituye al NIF provisional que
                  obteniste al inicio). Presenta el <strong>modelo 036</strong> de declaración censal de alta
                  y el <strong>modelo 840</strong> (IAE, exento si facturas menos de 1 M €). También deberás
                  dar de alta el/los administrador(es) como autónomo(s) societario(s) en la Seguridad Social.
                  Plazo: 1-5 días hábiles.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── 5. Mejores Prácticas ──────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>6 buenas prácticas si decides crear una SL</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Evalúa el umbral real de rentabilidad</h4>
              <p>
                No crees una SL solo por el ahorro fiscal si los beneficios son inferiores a <strong>50.000 €</strong>.
                Los costes fijos anuales (gestoría ~3.000 €, cuentas anuales, autónomo societario ~6.144 €)
                suman fácilmente <strong>5.000-7.000 €/año</strong> en obligaciones que el autónomo no tiene.
                Haz el cálculo neto real antes de decidir.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💶</span>
              <h4>Establece un salario razonable al administrador</h4>
              <p>
                Si cobras salario de tu SL, fija una cantidad <strong>de mercado</strong> y documentada en
                los estatutos o en un contrato laboral de alta dirección. La AEAT puede impugnar operaciones
                vinculadas (socio-administrador y su sociedad) si el salario parece artificialmente bajo
                o alto para desviar bases imponibles. Regla práctica: entre el 40-60% del beneficio bruto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Aprovecha el tipo reducido del 15% en IS los primeros 2 años</h4>
              <p>
                Las SL de nueva creación tributan al <strong>15%</strong> en el primer ejercicio con base
                imponible positiva y en el siguiente (art. 29.1 LIS). Este tipo reducido puede suponer un
                ahorro de hasta <strong>8-10 puntos porcentuales</strong> frente al tipo general del 23-25%.
                Para aprovecharlo al máximo, planifica los ingresos del año de constitución.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🤝</span>
              <h4>Contrata una gestoría especializada en pymes</h4>
              <p>
                El coste de una buena gestoría (200-400 €/mes) se recupera fácilmente con optimización fiscal
                legal: aplicar correctamente deducciones en IS (I+D, formación, inversiones), gestionar
                correctamente el IVA, evitar sanciones por errores formales y planificar la distribución
                de dividendos vs. salario de forma óptima cada ejercicio.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏦</span>
              <h4>Separa cuenta personal y cuenta de empresa desde el primer día</h4>
              <p>
                Es la práctica más básica y la más ignorada. Mezclar pagos personales y empresariales hace
                imposible demostrar la deducibilidad de gastos y puede provocar que la AEAT considere como
                <em> retribución en especie</em> todos los pagos con la tarjeta de la empresa. Crea la cuenta
                societaria antes de constituir y nunca la uses para gastos personales.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <h4>Valora la responsabilidad del administrador</h4>
              <p>
                La SL limita responsabilidad del socio, pero el <strong>administrador</strong> responde
                personalmente si no convoca junta ante pérdidas que reducen el patrimonio neto por debajo
                de la mitad del capital social (art. 363 LSC), y por deudas tributarias o de SS en caso
                de conducta negligente. Llevar los libros al día y actuar diligentemente es tu mejor protección.
              </p>
            </div>
          </div>
        </section>

        {/* ── 6. Warning Box ────────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores comunes que debes evitar con una SL</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Constituir SL sin capital de trabajo suficiente.</strong> Los 3.000 € mínimos de capital
                social no cubren ni un mes de gastos en la mayoría de actividades. Antes de constituir, calcula
                cuántos meses de runway necesitas y asegúrate de tenerlos disponibles al margen del capital social.
              </li>
              <li>
                <strong>Mezclar gastos personales y de empresa.</strong> Hacienda puede considerar esos gastos
                personales como retribución en especie al socio-administrador, tributando en IRPF y generando
                diferencias en IS. Además, la empresa pierde la deducibilidad de esos gastos.
              </li>
              <li>
                <strong>No registrar las actas del consejo de administración.</strong> Aunque seas el único socio
                y administrador, tienes la obligación legal de levantar acta de los acuerdos relevantes (reparto
                de dividendos, cambios estatutarios, aprobación de cuentas). Sin actas, las decisiones pueden
                impugnarse y Hacienda puede cuestionar operaciones vinculadas.
              </li>
              <li>
                <strong>Olvidar el IAE si superas 1.000.000 € de facturación.</strong> Por debajo de ese umbral,
                las empresas están exentas del Impuesto de Actividades Económicas. Pero si tu SL supera el millón,
                debes darte de alta en el epígrafe correspondiente y pagar la cuota municipal. El incumplimiento
                conlleva sanciones desde la primera liquidación.
              </li>
              <li>
                <strong>Retirar dinero de la SL como «préstamo del socio» sin formalizar.</strong> Cualquier
                salida de dinero de la sociedad hacia el socio que no sea salario o dividendo formalmente aprobado
                puede ser recalificado por la AEAT como dividendo encubierto, con la consiguiente tributación
                en IRPF del socio más intereses de demora y posible sanción.
              </li>
              <li>
                <strong>No depositar las Cuentas Anuales antes del 30 de julio.</strong> Las SL deben presentar
                las cuentas del ejercicio anterior en el Registro Mercantil antes del 30 de julio de cada año.
                El incumplimiento tiene sanciones de <strong>1.200 € a 60.000 €</strong> según el volumen de
                facturación, y la empresa queda en situación de cierre registral (no puede inscribir actos).
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-autonomo-vs-sl')} />
      <ShareCard appName="comparador-autonomo-vs-sl" />
      <Footer appName="comparador-autonomo-vs-sl" />
    </div>
  );
}
