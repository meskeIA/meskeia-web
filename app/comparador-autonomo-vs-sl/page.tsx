'use client';

import { useState, useCallback } from 'react';
import styles from './ComparadorAutonomoVsSL.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard } from '@/components';
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

  // Si reparte dividendos: IRPF sobre dividendos (19% sobre los primeros 6.000 €, etc.)
  let irpfDividendos = 0;
  if (repartirDividendos) {
    // Base del ahorro por dividendos (simplificado: 19% hasta 6000, 21% hasta 50000, 23% hasta 200k, 27% hasta 300k, 30% resto)
    const div = beneficioNeto;
    if (div <= 6000) irpfDividendos = div * 0.19;
    else if (div <= 50000) irpfDividendos = 6000 * 0.19 + (div - 6000) * 0.21;
    else if (div <= 200000) irpfDividendos = 6000 * 0.19 + 44000 * 0.21 + (div - 50000) * 0.23;
    else if (div <= 300000) irpfDividendos = 6000 * 0.19 + 44000 * 0.21 + 150000 * 0.23 + (div - 200000) * 0.27;
    else irpfDividendos = 6000 * 0.19 + 44000 * 0.21 + 150000 * 0.23 + 100000 * 0.27 + (div - 300000) * 0.30;
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
              <h4>💡 El truco del salario en SL</h4>
              <p>
                El administrador puede cobrar un salario de la SL (si consta en estatutos), que es gasto deducible
                para la sociedad y tributará en su IRPF. Esto permite repartir la carga fiscal optimizando
                el beneficio que queda en la sociedad.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('comparador-autonomo-vs-sl')} />
      <ShareCard appName="comparador-autonomo-vs-sl" />
      <Footer appName="comparador-autonomo-vs-sl" />
    </div>
  );
}
