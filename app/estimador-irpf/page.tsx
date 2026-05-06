'use client';

import { useState, useCallback } from 'react';
import styles from './EstimadorIRPF.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  COTIZACIONES_SS_2025,
  BASES_SS_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  calcularDeduccionRentasBajas,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SituacionFamiliar = 'soltero' | 'casado_un_ingreso' | 'casado_dos_ingresos' | 'familia_monoparental';

interface DesgloseTramo {
  desde: number;
  hasta: number | null;
  tipo: number;
  baseAplicada: number;
  cuota: number;
}

// ─── Lógica de cálculo ────────────────────────────────────────────────────────

function calcularCuotaIRPF(baseLiquidable: number): { cuota: number; desglose: DesgloseTramo[] } {
  let cuota = 0;
  let baseRestante = Math.max(0, baseLiquidable);
  let limiteAnterior = 0;
  const desglose: DesgloseTramo[] = [];

  for (let i = 0; i < TRAMOS_IRPF_2025.length; i++) {
    const tramo = TRAMOS_IRPF_2025[i];
    const tramoDe = limiteAnterior;
    const tramoHasta = tramo.hasta === Infinity ? null : tramo.hasta;
    const anchuraTramo = tramo.hasta - limiteAnterior;
    const baseTramo = Math.min(baseRestante, anchuraTramo);

    if (baseTramo <= 0) {
      desglose.push({ desde: tramoDe, hasta: tramoHasta, tipo: tramo.tipo, baseAplicada: 0, cuota: 0 });
      limiteAnterior = tramo.hasta;
      continue;
    }

    const cuotaTramo = baseTramo * (tramo.tipo / 100);
    cuota += cuotaTramo;
    desglose.push({ desde: tramoDe, hasta: tramoHasta, tipo: tramo.tipo, baseAplicada: baseTramo, cuota: cuotaTramo });
    baseRestante -= baseTramo;
    limiteAnterior = tramo.hasta;
  }

  return { cuota, desglose };
}

function calcularMinimos(situacion: SituacionFamiliar, numHijos: number, hijosMenores3: number): number {
  let minimos = MINIMOS_IRPF_2025.personal;

  if (numHijos >= 1) minimos += MINIMOS_IRPF_2025.hijo_1;
  if (numHijos >= 2) minimos += MINIMOS_IRPF_2025.hijo_2;
  if (numHijos >= 3) minimos += MINIMOS_IRPF_2025.hijo_3;
  if (numHijos >= 4) minimos += MINIMOS_IRPF_2025.hijo_4_mas * (numHijos - 3);
  minimos += Math.min(hijosMenores3, numHijos) * MINIMOS_IRPF_2025.hijo_menor_3;

  if (situacion === 'familia_monoparental' && numHijos > 0) minimos += 2150;

  return minimos;
}

function calcularSSLaboralAnual(brutoAnual: number): number {
  const baseMensual = Math.max(BASES_SS_2025.minima, Math.min(brutoAnual / 12, BASES_SS_2025.maxima));
  const tipoTotal = COTIZACIONES_SS_2025.contingenciasComunes + COTIZACIONES_SS_2025.desempleo
    + COTIZACIONES_SS_2025.formacionProfesional + COTIZACIONES_SS_2025.mef;
  return baseMensual * (tipoTotal / 100) * 12;
}

function calcularReduccionRRT(rnt: number): number {
  const { limite1, reduccion1, limite2, reduccion2, factorInterpolacion } = REDUCCION_RENDIMIENTOS_TRABAJO_2025;
  if (rnt <= limite1) return reduccion1;
  if (rnt >= limite2) return reduccion2;
  return reduccion1 - factorInterpolacion * (rnt - limite1);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorIRPFPage() {
  // Entradas
  const [rendimientosTrabajo, setRendimientosTrabajo] = useState('');
  const [rendimientosCapital, setRendimientosCapital] = useState('');
  const [situacion, setSituacion] = useState<SituacionFamiliar>('soltero');
  const [numHijos, setNumHijos] = useState('0');
  const [hijosMenores3, setHijosMenores3] = useState('0');
  const [retencionesPracticadas, setRetencionesPracticadas] = useState('');
  const [esTrabajador, setEsTrabajador] = useState(true);

  // Resultado
  const [resultado, setResultado] = useState<{
    brutoAnual: number;
    reduccionTrabajo: number;
    ssAnual: number;
    baseImponibleGeneral: number;
    minimosPersonalesFamiliares: number;
    baseLiquidable: number;
    cuotaIntegra: number;
    desgloseTramos: DesgloseTramo[];
    deduccionRentasBajas: number;
    cuotaTrasDeducciones: number;
    retenciones: number;
    cuotaDiferencial: number;
    tipoEfectivo: number;
  } | null>(null);

  const calcular = useCallback(() => {
    const bruto = parseSpanishNumber(rendimientosTrabajo) || 0;
    const capital = parseSpanishNumber(rendimientosCapital) || 0;
    const retenciones = parseSpanishNumber(retencionesPracticadas) || 0;
    const hijos = parseInt(numHijos) || 0;
    const hijosM3 = parseInt(hijosMenores3) || 0;

    if (bruto <= 0 && capital <= 0) return;

    // SS laboral (si es trabajador)
    const ssAnual = esTrabajador ? calcularSSLaboralAnual(bruto) : 0;

    // Gastos deducibles generales del trabajo (art. 19.2.f LIRPF)
    const gastosDeducibles = esTrabajador && bruto > 0 ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0;

    // Rendimiento Neto del Trabajo (RNT) = bruto - SS - gastos deducibles
    const rnt = Math.max(0, bruto - ssAnual - gastosDeducibles);

    // Reducción por RNT (art. 20 LIRPF) — sobre el RNT, con umbrales correctos 2025
    const reduccionTrabajo = esTrabajador && bruto > 0 ? calcularReduccionRRT(rnt) : 0;

    // Base imponible general = RNTR + capital mobiliario
    const baseImponibleGeneral = Math.max(0, rnt - reduccionTrabajo) + capital;

    // Mínimos
    const minimosPersonalesFamiliares = calcularMinimos(situacion, hijos, hijosM3);

    // Base liquidable
    const baseLiquidable = Math.max(0, baseImponibleGeneral - minimosPersonalesFamiliares);

    // Cuota íntegra
    const { cuota: cuotaIntegra, desglose: desgloseTramos } = calcularCuotaIRPF(baseLiquidable);

    // Deducción por rentas bajas del trabajo (art. 80 bis LIRPF)
    const deduccionRentasBajas = esTrabajador && bruto > 0
      ? calcularDeduccionRentasBajas(rnt, capital)
      : 0;

    // Cuota tras deducciones (no puede ser negativa)
    const cuotaTrasDeducciones = Math.max(0, cuotaIntegra - deduccionRentasBajas);

    // Cuota diferencial
    const cuotaDiferencial = cuotaTrasDeducciones - retenciones;

    // Tipo efectivo sobre base imponible
    const tipoEfectivo = baseImponibleGeneral > 0 ? (cuotaTrasDeducciones / baseImponibleGeneral) * 100 : 0;

    setResultado({
      brutoAnual: bruto,
      reduccionTrabajo,
      ssAnual,
      baseImponibleGeneral,
      minimosPersonalesFamiliares,
      baseLiquidable,
      cuotaIntegra,
      desgloseTramos,
      deduccionRentasBajas,
      cuotaTrasDeducciones,
      retenciones,
      cuotaDiferencial,
      tipoEfectivo,
    });
  }, [rendimientosTrabajo, rendimientosCapital, situacion, numHijos, hijosMenores3, retencionesPracticadas, esTrabajador]);

  const limpiar = () => {
    setRendimientosTrabajo('');
    setRendimientosCapital('');
    setRetencionesPracticadas('');
    setNumHijos('0');
    setHijosMenores3('0');
    setResultado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Estimador IRPF 2025</h1>
        <p className={styles.subtitle}>
          Oriéntate sobre tu declaración de la renta: cuota íntegra, retenciones y resultado orientativo
        </p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial" severity="critical" />

      <DataReference
        normativa={FISCAL_IRPF_META.fuente}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tus datos orientativos</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={esTrabajador}
                  onChange={e => setEsTrabajador(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Soy trabajador por cuenta ajena (con nómina)
              </label>
            </div>

            <NumberInput
              value={rendimientosTrabajo}
              onChange={setRendimientosTrabajo}
              label="Rendimientos del trabajo brutos anuales"
              placeholder="30000"
              helperText="Salario bruto total del año (sin descontar SS ni IRPF)"
              min={0}
            />

            <NumberInput
              value={rendimientosCapital}
              onChange={setRendimientosCapital}
              label="Rendimientos del capital mobiliario (opcional)"
              placeholder="0"
              helperText="Dividendos, intereses bancarios recibidos en el año"
              min={0}
            />

            <NumberInput
              value={retencionesPracticadas}
              onChange={setRetencionesPracticadas}
              label="Retenciones ya practicadas"
              placeholder="0"
              helperText="Total IRPF retenido en nómina + otros (ver certificado retenciones)"
              min={0}
            />

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="situacion">Situación personal</label>
              <select
                id="situacion"
                value={situacion}
                onChange={e => setSituacion(e.target.value as SituacionFamiliar)}
                className={styles.select}
              >
                <option value="soltero">Soltero/a o divorciado/a</option>
                <option value="casado_un_ingreso">Casado/a (único ingreso familiar)</option>
                <option value="casado_dos_ingresos">Casado/a (dos ingresos)</option>
                <option value="familia_monoparental">Familia monoparental</option>
              </select>
            </div>

            <div className={styles.formRow}>
              <NumberInput
                value={numHijos}
                onChange={setNumHijos}
                label="Hijos a cargo"
                placeholder="0"
                min={0}
                max={10}
              />
              <NumberInput
                value={hijosMenores3}
                onChange={setHijosMenores3}
                label="Hijos menores de 3 años"
                placeholder="0"
                min={0}
                max={parseInt(numHijos) || 0}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={calcular} className={styles.btnPrimary}>
                Estimar IRPF
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
              {/* Resultado principal */}
              <div className={styles.resultadoFinal}>
                <p className={styles.resultadoLabel}>
                  {resultado.cuotaDiferencial >= 0 ? 'Resultado estimado: A PAGAR' : 'Resultado estimado: A DEVOLVER'}
                </p>
                <div
                  className={resultado.cuotaDiferencial >= 0 ? styles.resultadoValorPagar : styles.resultadoValorDevolver}
                  role="status"
                  aria-live="polite"
                >
                  {formatCurrency(Math.abs(resultado.cuotaDiferencial))}
                </div>
                <span className={resultado.cuotaDiferencial >= 0 ? styles.resultadoBadgePagar : styles.resultadoBadgeDevolver}>
                  {resultado.cuotaDiferencial >= 0 ? '📤 A ingresar en Hacienda' : '📥 Hacienda te devuelve'}
                </span>
              </div>

              {/* Tarjetas resumen */}
              <div className={styles.resultsGrid}>
                <ResultCard
                  title="Cuota íntegra"
                  value={formatNumber(resultado.cuotaIntegra, 2)}
                  unit="€"
                  variant="highlight"
                  icon="📊"
                  description="IRPF antes de deducciones y retenciones"
                />
                {resultado.deduccionRentasBajas > 0 && (
                  <ResultCard
                    title="Deducción rentas bajas"
                    value={`-${formatNumber(resultado.deduccionRentasBajas, 2)}`}
                    unit="€"
                    variant="success"
                    icon="🟢"
                    description="Art. 80 bis LIRPF (trabajo < 18.276 €)"
                  />
                )}
                <ResultCard
                  title="Tipo efectivo"
                  value={formatNumber(resultado.tipoEfectivo, 2)}
                  unit="%"
                  variant="info"
                  icon="📈"
                  description="Porcentaje sobre base imponible"
                />
                <ResultCard
                  title="Base imponible"
                  value={formatNumber(resultado.baseImponibleGeneral, 2)}
                  unit="€"
                  variant="default"
                  icon="📋"
                  description="Bruto menos SS y reducciones"
                />
                <ResultCard
                  title="Mínimos personales"
                  value={formatNumber(resultado.minimosPersonalesFamiliares, 2)}
                  unit="€"
                  variant="success"
                  icon="👨‍👩‍👧"
                  description="Reduce la base liquidable"
                />
              </div>

              {/* Desglose por tramos */}
              <div className={styles.tramosSection}>
                <h3 className={styles.tramosTitle}>📊 Desglose por tramos IRPF 2025</h3>
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
                    {resultado.desgloseTramos
                      .filter(t => t.baseAplicada > 0)
                      .map((t, i) => (
                        <tr key={i} className={styles.tramoAplicado}>
                          <td>{formatCurrency(t.desde)}</td>
                          <td>{t.hasta !== null ? formatCurrency(t.hasta) : 'En adelante'}</td>
                          <td>{t.tipo}%</td>
                          <td>{formatCurrency(t.baseAplicada)}</td>
                          <td>{formatCurrency(t.cuota)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">📊</span>
              <p>Introduce tus datos y pulsa «Estimar IRPF» para ver el resultado orientativo</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Herramienta de Orientación — No es asesoramiento fiscal</h3>
        <p>
          Este estimador proporciona una <strong>aproximación orientativa</strong> basada en{' '}
          <a href={FISCAL_IRPF_META.urlOficial} target="_blank" rel="noopener noreferrer">
            {FISCAL_IRPF_META.fuente}
          </a>. El cálculo real puede variar significativamente según:
        </p>
        <ul>
          <li>Tu comunidad autónoma (la tarifa autonómica puede diferir del tipo medio usado aquí)</li>
          <li>Deducciones autonómicas y estatales aplicables a tu situación</li>
          <li>Otras fuentes de renta no incluidas (inmuebles, actividades económicas, plusvalías)</li>
          <li>Aportaciones a planes de pensiones, hipotecas antiguas, donativos, etc.</li>
          <li>Cambios normativos posteriores a la fecha de verificación</li>
        </ul>
        <p>
          <strong>NO constituye asesoramiento fiscal.</strong> Para un cálculo exacto, utiliza el{' '}
          <a href="https://sede.agenciatributaria.gob.es/Sede/procedimientoini/GI01.shtml" target="_blank" rel="noopener noreferrer">
            simulador oficial de la Agencia Tributaria (Renta WEB)
          </a>{' '}
          o consulta con un asesor fiscal.
        </p>
        <p className={styles.disclaimerFecha}>
          Datos verificados: {FISCAL_IRPF_META.verificado} | Vigencia: {FISCAL_IRPF_META.vigencia}
        </p>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres entender mejor el IRPF?"
        subtitle="Cómo funciona la declaración de la renta, los tramos y cómo interpretar el resultado"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Cómo se calcula el IRPF?</h2>
          <p>
            El IRPF (Impuesto sobre la Renta de las Personas Físicas) grava la renta obtenida en el año.
            El proceso de cálculo tiene varios pasos:
          </p>

          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <h4>1️⃣ Base imponible</h4>
              <p>
                Es el resultado de restar a los ingresos brutos las cotizaciones a la Seguridad Social
                y la reducción por rendimientos del trabajo (hasta 6.498 € para rentas bajas).
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4>2️⃣ Mínimo personal y familiar</h4>
              <p>
                Una cantidad que reduce la base liquidable y no tributa: 5.550 € por defecto, más
                cantidades adicionales por hijos, ascendientes o discapacidad.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4>3️⃣ Cuota íntegra</h4>
              <p>
                El resultado de aplicar los tramos del IRPF a la base liquidable. Es un impuesto
                progresivo: cada tramo solo se aplica a la parte de renta que entra en él.
              </p>
            </div>
            <div className={styles.guideCard}>
              <h4>4️⃣ Cuota diferencial</h4>
              <p>
                Cuota íntegra menos las retenciones ya practicadas durante el año. Si es positiva,
                debes pagar a Hacienda. Si es negativa, Hacienda te devuelve.
              </p>
            </div>
          </div>

          <h3>Tramos IRPF 2025 orientativos</h3>
          <table className={styles.tramosOrientativos}>
            <thead>
              <tr><th>Desde</th><th>Hasta</th><th>Tipo marginal</th></tr>
            </thead>
            <tbody>
              <tr><td>0 €</td><td>12.450 €</td><td>19%</td></tr>
              <tr><td>12.450 €</td><td>20.200 €</td><td>24%</td></tr>
              <tr><td>20.200 €</td><td>35.200 €</td><td>30%</td></tr>
              <tr><td>35.200 €</td><td>60.000 €</td><td>37%</td></tr>
              <tr><td>60.000 €</td><td>300.000 €</td><td>45%</td></tr>
              <tr><td>300.000 €</td><td>En adelante</td><td>47%</td></tr>
            </tbody>
          </table>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            * Tipos orientativos que combinan tarifa estatal + autonómica media. Tu CCAA puede variar.
          </p>
        </section>

        {/* ── SECCIÓN 1: Tabla comparativa de perfiles ──────────────────── */}
        <section className={styles.guideSection}>
          <h2>¿Qué tipo de contribuyente eres? Comparativa de perfiles</h2>
          <p>El IRPF funciona de forma diferente según tu relación laboral y situación personal. Esta tabla resume las diferencias clave:</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Trabajador cuenta ajena</th>
                  <th>Autónomo (RETA)</th>
                  <th>Pensionista</th>
                  <th>Dos perceptores en el hogar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Obligación de declarar</strong></td>
                  <td>Un pagador &gt;22.000 € / dos pagadores &gt;15.000 €</td>
                  <td>Siempre si ingresos &gt;1.000 € (actividad económica)</td>
                  <td>Igual que asalariado; pensión mínima exenta si &lt;22.000 €</td>
                  <td>Umbral individual &gt;15.000 € si el 2.º pagador supera 1.500 €</td>
                </tr>
                <tr>
                  <td><strong>Cómo se retiene</strong></td>
                  <td>La empresa retiene automáticamente en nómina</td>
                  <td>Clientes retienen 15 % (7 % primeros 3 años); pagos propios trimestrales (mod. 130)</td>
                  <td>La SS retiene según cuantía de pensión</td>
                  <td>Cada empleador retiene según sus datos; riesgo de infra-retención</td>
                </tr>
                <tr>
                  <td><strong>Deducciones típicas</strong></td>
                  <td>SS, reducción rendimientos trabajo, mínimos familiares</td>
                  <td>Todos los gastos de actividad, cuotas RETA, amortizaciones</td>
                  <td>Reducción específica pensionistas, mínimo personal ≥65 (6.700 €)</td>
                  <td>Mínimos familiares compartidos; puede convenir tributación conjunta</td>
                </tr>
                <tr>
                  <td><strong>Tipo efectivo orientativo</strong></td>
                  <td>~14 % en 30.000 € brutos; ~22 % en 50.000 €</td>
                  <td>~12–18 % sobre rendimiento neto (sin gastos deducibles)</td>
                  <td>~10–14 % en pensiones medias (18.000–24.000 €)</td>
                  <td>Individualmente menor; conjunta puede ser peor si ambos ingresos similares</td>
                </tr>
                <tr>
                  <td><strong>Complejidad declaración</strong></td>
                  <td>Baja-media. Borrador suele ser correcto</td>
                  <td>Alta. Requiere libro de facturas + contabilidad de gastos</td>
                  <td>Baja. Datos precompletados por la SS</td>
                  <td>Media. Conviene comparar individual vs conjunta antes de confirmar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de uso con ejemplos concretos ────────────── */}
        <section className={styles.guideSection}>
          <h2>Ejemplos reales: cuánto pagas según tu situación</h2>
          <p>Cuatro perfiles con cálculos orientativos para el ejercicio 2025 (tarifa estatal + autonómica media):</p>
          <div className={styles.escenariosGrid}>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍💼</span>
                <h4>Asalariado soltero, 28.000 € brutos</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Cotización SS:</strong> ~1.745 €/año</p>
                <p><strong>Reducción rendimientos trabajo:</strong> ~3.700 €</p>
                <p><strong>Base imponible:</strong> ~22.555 €</p>
                <p><strong>Mínimo personal:</strong> 5.550 €</p>
                <p><strong>Cuota íntegra:</strong> ~3.170 €</p>
                <p><strong>Tipo efectivo:</strong> ~11,4 %</p>
                <p><strong>Retención habitual:</strong> ~3.200–3.400 €</p>
              </div>
              <div className={styles.escenarioTip}>
                Resultado habitual: pequeña devolución de 100–300 € si la retención fue correcta. Si tiene dos pagadores (el segundo &gt;1.500 €), puede salir a pagar.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👩‍👧‍👦</span>
                <h4>Asalariada casada, 45.000 €, 2 hijos menores</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>SS:</strong> ~2.800 €/año</p>
                <p><strong>Base imponible:</strong> ~38.800 €</p>
                <p><strong>Mínimo personal + familiar:</strong> 5.550 + 2.400 + 2.700 = <strong>10.650 €</strong></p>
                <p><strong>Base liquidable:</strong> ~28.150 €</p>
                <p><strong>Cuota íntegra:</strong> ~6.400 €</p>
                <p><strong>Tipo efectivo:</strong> ~13,6 %</p>
              </div>
              <div className={styles.escenarioTip}>
                El mínimo familiar por los 2 hijos ahorra ~1.600–1.800 € de cuota respecto a no tenerlos. Si ambos cónyuges trabajan y declaran individualmente, suele ser más ventajoso que la conjunta.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧾</span>
                <h4>Autónomo, 35.000 € rendimiento neto</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Cuota RETA (base mínima ~330 €/mes):</strong> ~3.960 €/año</p>
                <p><strong>Base imponible tras RETA:</strong> ~31.040 €</p>
                <p><strong>Sin reducción rendimientos trabajo</strong> (actividad económica)</p>
                <p><strong>Mínimo personal:</strong> 5.550 €</p>
                <p><strong>Base liquidable:</strong> ~25.490 €</p>
                <p><strong>Cuota íntegra:</strong> ~5.450 €</p>
                <p><strong>Tipo efectivo:</strong> ~13,4 % sobre rendimiento neto</p>
              </div>
              <div className={styles.escenarioTip}>
                La cuota RETA es deducible como gasto de actividad. Si además tiene gastos de vehículo, material o local, la base real puede ser significativamente menor. Los pagos fraccionados trimestrales (mod. 130) anticipan parte de esta cuota.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧓</span>
                <h4>Pensionista, 18.000 € jubilación</h4>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Reducción pensionistas (art. 20 LIRPF):</strong> ~1.800 €</p>
                <p><strong>Base imponible:</strong> ~16.200 €</p>
                <p><strong>Mínimo personal ≥65 años:</strong> 6.700 € (en lugar de 5.550 €)</p>
                <p><strong>Base liquidable:</strong> ~9.500 €</p>
                <p><strong>Cuota íntegra:</strong> ~1.805 €</p>
                <p><strong>Tipo efectivo:</strong> ~10,0 %</p>
              </div>
              <div className={styles.escenarioTip}>
                El mínimo personal de 6.700 € (≥65 años) o 8.100 € (≥75 años) reduce notablemente la cuota. La SS suele retener de forma ajustada, por lo que el resultado suele ser próximo a cero (ni paga ni devuelve).
              </div>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ────────────────────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el IRPF</h2>
          <div className={styles.faqList}>

            <div className={styles.faqItem}>
              <h4>¿Estoy obligado a declarar si solo tengo un pagador?</h4>
              <p>
                Con un único pagador, el umbral de obligación es <strong>22.000 € brutos anuales</strong>. Por debajo, no estás obligado, aunque puede convenirte si tienes derecho a devolución (por ejemplo, deducciones autonómicas o por maternidad). Con dos o más pagadores, si el segundo supera 1.500 €, el umbral baja a <strong>15.000 €</strong>.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre tipo marginal y tipo efectivo?</h4>
              <p>
                El <strong>tipo marginal</strong> es el porcentaje que se aplica al último euro que ganas (el del tramo más alto en el que entras). El <strong>tipo efectivo</strong> es el porcentaje real que pagas sobre toda tu base imponible. Por ejemplo, si ganas 35.200 € tu tipo marginal es 30 %, pero tu tipo efectivo será aproximadamente el 14–16 %, porque los primeros tramos tributan a tipos menores.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cómo afecta tener dos pagadores a la declaración?</h4>
              <p>
                Cada pagador retiene en función de los datos que le has comunicado, sin saber que existe otro. Si el segundo pagador ingresó más de 1.500 € y no ajustaste la retención del primero mediante el <strong>modelo 145</strong>, lo más probable es que la declaración salga <strong>a pagar</strong>. La solución: comunicar al pagador principal los ingresos del segundo para que aumente la retención durante el año.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo deducir el plan de pensiones?</h4>
              <p>
                Sí. Las aportaciones a planes de pensiones reducen directamente la <strong>base imponible general</strong>. El límite individual es <strong>1.500 € anuales</strong> (desde 2023). Si tu empresa también aporta, el límite conjunto sube a <strong>10.000 € anuales</strong> (1.500 € individuales + hasta 8.500 € empresa). Esta reducción se aplica antes de calcular la cuota, por lo que el ahorro fiscal real depende de tu tipo marginal (19–47 %).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué es la deducción por maternidad y cuánto es?</h4>
              <p>
                Es una deducción en cuota (no en base) de hasta <strong>1.200 € anuales</strong> (100 €/mes) por cada hijo menor de 3 años para madres trabajadoras que coticen a la SS. Puede cobrarse de forma anticipada mensualmente (100 €/mes) o bien deducirlo en la declaración anual. Si tienes gastos de custodia en guardería pública o autorizada, la deducción puede ampliarse hasta <strong>1.000 € adicionales</strong>.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Puedo presentar declaración conjunta con mi cónyuge?</h4>
              <p>
                Sí, los matrimonios pueden optar por la <strong>tributación conjunta</strong>, que aplica una reducción especial de <strong>3.400 € sobre la base imponible</strong> (5.000 € en monoparentales). Sin embargo, la conjunta casi nunca conviene cuando los dos trabajan con ingresos similares, porque la escala de IRPF es progresiva y se aplica sobre la suma de ambas rentas. Conviene compararla con la individual antes de confirmar el borrador.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Qué pasa si no estoy obligado pero me conviene declarar?</h4>
              <p>
                Puedes presentar la declaración voluntariamente aunque no estés obligado. Es habitual que salga <strong>a devolver</strong> en estos casos, por ejemplo si tuviste retenciones en nómina o tienes derecho a deducciones (maternidad, alquiler autonómico, donativos). La AEAT tiene un plazo de 6 meses para devolver desde la fecha de presentación; si lo supera, debe abonarte intereses.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>¿Cuándo me devuelve Hacienda si la declaración sale a devolver?</h4>
              <p>
                La AEAT tiene un plazo máximo de <strong>6 meses desde el fin del período voluntario</strong> (normalmente hasta el 30 de junio, por lo que el plazo vence en diciembre). En la práctica, las declaraciones presentadas en abril suelen tener devolución en <strong>4–6 semanas</strong>. Si presentas en junio, puede tardar hasta noviembre-diciembre. La devolución se realiza en la cuenta bancaria que hayas indicado.
              </p>
              <div className={styles.faqTip}>
                Consejo: para cobrar antes, presenta la declaración en la primera quincena de abril, cuando abren el plazo.
              </div>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 4: Guía paso a paso ───────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>Cómo hacer la declaración paso a paso</h2>
          <p>El proceso de declaración de la renta en Renta WEB (AEAT) tiene 6 etapas clave:</p>
          <div className={styles.stepGuide}>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">1</div>
              <div className={styles.stepContent}>
                <h4>Recopilar los documentos necesarios</h4>
                <p>
                  Antes de acceder a Renta WEB, ten a mano: <strong>certificado de retenciones</strong> del empleador (disponible en enero-febrero), datos de cuentas bancarias, referencia catastral de inmuebles en propiedad o alquiler, recibos de donaciones, aportaciones a planes de pensiones y cualquier operación patrimonial (venta de fondos, inmuebles, acciones).
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">2</div>
              <div className={styles.stepContent}>
                <h4>Acceder a Renta WEB desde la sede de la AEAT</h4>
                <p>
                  El borrador y Renta WEB están disponibles desde <strong>principios de abril</strong> en <em>sede.agenciatributaria.gob.es</em>. Puedes identificarte con Cl@ve PIN, certificado digital o número de referencia (casilla 505 de la declaración anterior). El acceso mediante DNI electrónico también es válido.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">3</div>
              <div className={styles.stepContent}>
                <h4>Revisar los datos precargados — no confirmar a ciegas</h4>
                <p>
                  El borrador incluye datos aportados por terceros (empleadores, bancos, SS). Los errores más frecuentes son: <strong>rendimientos de años anteriores mal imputados</strong>, rentas de alquiler no declaradas por el inquilino, imputación de rentas inmobiliarias en inmuebles vendidos ese año, o pérdidas patrimoniales no compensadas de ejercicios previos.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">4</div>
              <div className={styles.stepContent}>
                <h4>Incorporar datos no precargados manualmente</h4>
                <p>
                  Renta WEB no incluye automáticamente: <strong>aportaciones a planes de pensiones</strong> (si el gestor no las ha comunicado), <strong>deducciones autonómicas</strong> (alquiler, nacimiento, rehabilitación), donativos a ONG (aunque suelen venir precompletados), gastos de custodia de menores, o pérdidas patrimoniales de ejercicios anteriores pendientes de compensar.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">5</div>
              <div className={styles.stepContent}>
                <h4>Comparar tributación individual vs conjunta (si eres pareja)</h4>
                <p>
                  Renta WEB permite simular ambas modalidades sin confirmar. Hazlo siempre que estés casado/a. La <strong>conjunta suele convenir solo si uno de los dos no tiene ingresos o son muy bajos</strong> (&lt;3.000 €/año). Con dos sueldos similares, la individual es casi siempre mejor, porque en conjunta se pierde la reducción personal de 5.550 € del segundo cónyuge.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber} aria-hidden="true">6</div>
              <div className={styles.stepContent}>
                <h4>Confirmar, domiciliar o fraccionar el pago</h4>
                <p>
                  Si sale a devolver, recibirás el importe en tu cuenta en 4–8 semanas. Si sale a pagar, puedes <strong>domiciliar el pago hasta el 25 de junio</strong> (cargo el 30 de junio) o <strong>fraccionar en dos plazos</strong>: 60 % en junio y el 40 % restante el 5 de noviembre, sin recargo ni intereses. El fraccionamiento es automático si lo marcas al confirmar.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 5: Mejores prácticas ──────────────────────────────── */}
        <section className={styles.guideSection}>
          <h2>6 consejos para optimizar tu declaración</h2>
          <div className={styles.tipsGrid}>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Revisa siempre el borrador antes de confirmarlo</h4>
              <p>
                El borrador no es definitivo ni necesariamente correcto. La AEAT lo genera con los datos que tiene, pero puede incluir rendimientos de años anteriores o errores en imputaciones. Confirmar sin revisar puede suponer pagar de más o, peor, una regularización posterior con recargos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📋</span>
              <h4>Con dos pagadores, ajusta la retención durante el año</h4>
              <p>
                Si el segundo pagador te paga más de 1.500 € anuales, comunica esa situación a tu pagador principal mediante el <strong>modelo 145</strong>. Así ajustará la retención al alza y evitarás una sorpresa en junio. Es mucho mejor que afrontar un pago inesperado de 500–1.500 € en junio.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💼</span>
              <h4>Aporta al plan de pensiones antes del 31 de diciembre</h4>
              <p>
                Las aportaciones reducen la base imponible directamente: con tipo marginal del 30 %, cada 1.000 € aportados suponen <strong>300 € menos de IRPF</strong>. El límite individual es 1.500 €/año. Si tu empresa también aporta, el límite conjunto es 10.000 €. Las aportaciones del cónyuge (hasta 1.000 €) también reducen tu base si sus rentas son inferiores a 8.000 €.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
              <h4>Guarda los justificantes durante 4 años</h4>
              <p>
                Hacienda puede revisar cualquier declaración dentro del plazo de prescripción de <strong>4 años</strong> (desde el final del plazo de presentación). Conserva recibos de donaciones, facturas de obras, certificados de plan de pensiones, contratos de alquiler y cualquier documento que justifique tus deducciones. Los documentos digitales con firma tienen la misma validez que los físicos.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <h4>Presenta en abril si sale a devolver</h4>
              <p>
                La AEAT tramita las devoluciones por orden de presentación. Los que presentan en abril (primeras dos semanas) suelen recibir la devolución en <strong>3–5 semanas</strong>. Los que presentan en junio pueden esperar hasta noviembre. Si tu declaración sale a pagar, puedes igualmente presentarla en abril y domiciliar el pago para el 30 de junio, sin coste adicional.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <h4>Comprueba las deducciones autonómicas de tu CCAA</h4>
              <p>
                Las comunidades autónomas tienen deducciones propias que pueden ser muy relevantes: nacimiento de hijo (hasta 600 €/hijo en algunas CCAA), alquiler de vivienda habitual (hasta 15–20 % en Cataluña, Madrid, Valencia...), gastos de guardería, rehabilitación energética, o cuidado de familiares. Consulta el catálogo de tu comunidad en la web de la AEAT antes de confirmar.
              </p>
            </div>

          </div>
        </section>

        {/* ── SECCIÓN 6: Warning box — errores comunes ──────────────────── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>6 errores frecuentes que pueden costarte dinero (o una sanción)</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confirmar el borrador sin revisarlo.</strong> El borrador puede incluir rendimientos de ejercicios anteriores imputados erróneamente, inmuebles vendidos que siguen generando imputación de renta, o retenciones mal cuantificadas. Confirmarlo sin revisar implica aceptar posibles errores como propios.
              </li>
              <li>
                <strong>Olvidar declarar cuentas o inmuebles en el extranjero.</strong> Si tienes cuentas bancarias, inmuebles o valores en el extranjero con saldo superior a 50.000 €, estás obligado a presentar el <strong>modelo 720</strong>. Las sanciones por incumplimiento son de las más severas del sistema tributario español: multas del 150 % del valor no declarado en casos graves.
              </li>
              <li>
                <strong>No declarar el alquiler de tu vivienda (o segunda residencia).</strong> La AEAT cruza datos con los inquilinos: si tu inquilino declara el alquiler como gasto y tú no declaras los ingresos, Hacienda detectará la discrepancia. La regularización incluye cuota + intereses de demora + recargo del 15–20 % si es voluntaria tardía, o sanción si es inspeccionada.
              </li>
              <li>
                <strong>Ignorar la exención por reinversión en vivienda habitual al vender.</strong> Si vendes tu vivienda habitual y reinviertes el total en otra en el plazo de <strong>2 años</strong>, la ganancia patrimonial queda exenta de IRPF. Si no lo declaras correctamente (aunque no debas pagar), la AEAT puede considerar que no has aplicado la exención correctamente.
              </li>
              <li>
                <strong>No fraccionar el pago si la cuota es alta.</strong> Si la declaración sale a pagar más de 1.000 € y no tienes liquidez inmediata, el fraccionamiento automático (60 % en junio + 40 % en noviembre) <strong>no tiene coste ni recargo</strong>. Olvidarlo y pagar fuera de plazo sí genera recargos del 5–20 % según el retraso.
              </li>
              <li>
                <strong>Presentar fuera de plazo aunque salga a devolver.</strong> Presentar la declaración después del 30 de junio, aunque el resultado sea a devolver, puede conllevar una <strong>sanción formal de 200 €</strong> (reducible al 50 % si se paga voluntariamente, quedando en 100 €). No existe ventaja fiscal en retrasar una declaración a devolver.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-irpf')} />
      <ShareCard appName="estimador-irpf" />
      <Footer appName="estimador-irpf" />
    </div>
  );
}
