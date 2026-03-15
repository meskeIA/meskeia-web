'use client';

import { useState, useCallback } from 'react';
import styles from './EstimadorIRPF.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, ShareCard } from '@/components';
import { formatNumber, formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  TRAMOS_IRPF_2025,
  MINIMOS_IRPF_2025,
  COTIZACIONES_SS_2025,
  BASES_SS_2025,
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

    // Reducción por rendimientos del trabajo (art. 20 LIRPF) — estimación orientativa
    let reduccionTrabajo = 0;
    if (esTrabajador && bruto > 0) {
      if (bruto <= 14047.5) reduccionTrabajo = 6498;
      else if (bruto <= 19747.5) reduccionTrabajo = 6498 - 1.14286 * (bruto - 14047.5);
      else reduccionTrabajo = 2000;
    }

    // SS laboral (si es trabajador)
    const ssAnual = esTrabajador ? calcularSSLaboralAnual(bruto) : 0;

    // Base imponible general
    const baseImponibleGeneral = Math.max(0, bruto - ssAnual - reduccionTrabajo) + capital;

    // Mínimos
    const minimosPersonalesFamiliares = calcularMinimos(situacion, hijos, hijosM3);

    // Base liquidable
    const baseLiquidable = Math.max(0, baseImponibleGeneral - minimosPersonalesFamiliares);

    // Cuota íntegra
    const { cuota: cuotaIntegra, desglose: desgloseTramos } = calcularCuotaIRPF(baseLiquidable);

    // Cuota diferencial
    const cuotaDiferencial = cuotaIntegra - retenciones;

    // Tipo efectivo sobre base imponible
    const tipoEfectivo = baseImponibleGeneral > 0 ? (cuotaIntegra / baseImponibleGeneral) * 100 : 0;

    setResultado({
      brutoAnual: bruto,
      reduccionTrabajo,
      ssAnual,
      baseImponibleGeneral,
      minimosPersonalesFamiliares,
      baseLiquidable,
      cuotaIntegra,
      desgloseTramos,
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
                  description="IRPF calculado antes de retenciones"
                />
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-irpf')} />
      <ShareCard appName="estimador-irpf" />
      <Footer appName="estimador-irpf" />
    </div>
  );
}
