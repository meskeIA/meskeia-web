'use client';

import { useState } from 'react';
import styles from './OrientadorJubilacionParcial.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_PENSIONES_META,
  REQUISITOS_JUBILACION_PARCIAL,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ResultadoJubilacionParcial {
  posible: boolean;
  cumpleEdad: boolean;
  cumpleCotizacion: boolean;
  cumpleReduccion: boolean;
  motivoImpedimento: string;
  pensionParcialMensual: number;
  salarioParcialMensual: number;
  ingresosTotalesMensual: number;
  diferenciaVsJubilacionCompleta: number;
  diferenciaVsTrabajo: number;
  porcentajeIngresosSobreSueldo: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

function orientarJubilacionParcial(
  edadActual: number,
  anosCotizados: number,
  reduccionJornada: number,
  salarioBrutoMensual: number,
  pensionOrdinaria: number
): ResultadoJubilacionParcial {
  const req = REQUISITOS_JUBILACION_PARCIAL;

  const cumpleEdad = edadActual >= req.edadMinima;
  const cumpleCotizacion = anosCotizados >= req.anosCotizadosMinimos;
  const cumpleReduccion = reduccionJornada >= req.reduccionJornadaMin && reduccionJornada <= req.reduccionJornadaMax;

  let motivoImpedimento = '';
  if (!cumpleEdad) {
    motivoImpedimento = `Se necesitan al menos ${req.edadMinima} años de edad. Tienes ${edadActual}.`;
  } else if (!cumpleCotizacion) {
    motivoImpedimento = `Se necesitan ${req.anosCotizadosMinimos} años cotizados. Tienes ${anosCotizados}.`;
  } else if (!cumpleReduccion) {
    motivoImpedimento = `La reducción de jornada debe estar entre ${req.reduccionJornadaMin}% y ${req.reduccionJornadaMax}%.`;
  }

  const posible = cumpleEdad && cumpleCotizacion && cumpleReduccion;

  // Pensión parcial = fracción de reducción de jornada × pensión ordinaria
  const fraccion = reduccionJornada / 100;
  const pensionParcialMensual = pensionOrdinaria * fraccion;

  // Salario parcial = jornada restante × salario
  const salarioParcialMensual = salarioBrutoMensual * (1 - fraccion);

  const ingresosTotalesMensual = pensionParcialMensual + salarioParcialMensual;
  const diferenciaVsJubilacionCompleta = ingresosTotalesMensual - pensionOrdinaria;
  const diferenciaVsTrabajo = ingresosTotalesMensual - salarioBrutoMensual;
  const porcentajeIngresosSobreSueldo = salarioBrutoMensual > 0
    ? (ingresosTotalesMensual / salarioBrutoMensual) * 100
    : 0;

  return {
    posible,
    cumpleEdad,
    cumpleCotizacion,
    cumpleReduccion,
    motivoImpedimento,
    pensionParcialMensual,
    salarioParcialMensual,
    ingresosTotalesMensual,
    diferenciaVsJubilacionCompleta,
    diferenciaVsTrabajo,
    porcentajeIngresosSobreSueldo,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorJubilacionParcial() {
  const [edadActual, setEdadActual] = useState('');
  const [anosCotizados, setAnosCotizados] = useState('');
  const [reduccionJornada, setReduccionJornada] = useState('50');
  const [salarioBruto, setSalarioBruto] = useState('');
  const [pensionOrdinaria, setPensionOrdinaria] = useState('');
  const [resultado, setResultado] = useState<ResultadoJubilacionParcial | null>(null);
  const [error, setError] = useState('');

  function orientar() {
    setError('');
    const edad = parseInt(edadActual);
    const anos = parseFloat(anosCotizados.replace(',', '.'));
    const reduccion = parseFloat(reduccionJornada.replace(',', '.'));
    const salario = parseFloat(salarioBruto.replace(',', '.'));
    const pension = parseFloat(pensionOrdinaria.replace(',', '.'));

    if (isNaN(edad) || edad < 55 || edad > 70) { setError('Introduce tu edad actual (entre 55 y 70).'); return; }
    if (isNaN(anos) || anos < 1 || anos > 50) { setError('Introduce los años cotizados (entre 1 y 50).'); return; }
    if (isNaN(reduccion) || reduccion < 25 || reduccion > 75) { setError('La reducción de jornada debe estar entre 25% y 75%.'); return; }
    if (isNaN(salario) || salario <= 0) { setError('Introduce tu salario bruto mensual actual.'); return; }
    if (isNaN(pension) || pension <= 0) { setError('Introduce tu pensión ordinaria estimada.'); return; }

    setResultado(orientarJubilacionParcial(edad, anos, reduccion, salario, pension));
  }

  const req = REQUISITOS_JUBILACION_PARCIAL;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Orientador de Jubilación Parcial</h1>
        <p className={styles.subtitle}>Trabaja y cobra pensión a la vez · Requisitos y cálculo SS 2025</p>
      </header>

      <DisclaimerCard variant="financial">
        <span>
          Esta herramienta es SOLO orientativa. Los requisitos concretos dependen de tu situación personal, convenio colectivo y acuerdo con el empleador.
          <br /><strong>No es</strong> asesoramiento previsional ni laboral personalizado.
          <br />El contrato de relevo es obligatorio para el empleador y su incumplimiento impide la jubilación parcial. Verificado en {FISCAL_PENSIONES_META.vigencia}.
          <br /><strong>Consulta con la Seguridad Social y tu empresa</strong> antes de solicitar la jubilación parcial.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta orientación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tu situación</h2>

          <NumberInput
            value={edadActual}
            onChange={setEdadActual}
            label="Edad actual"
            placeholder="Ej: 62"
            helperText={`Requisito mínimo: ${req.edadMinima} años cumplidos.`}
            min={55}
            max={70}
          />

          <NumberInput
            value={anosCotizados}
            onChange={setAnosCotizados}
            label="Años cotizados"
            placeholder="Ej: 35"
            helperText={`Requisito mínimo: ${req.anosCotizadosMinimos} años. Consúltalos en importass.seg-social.es`}
            min={1}
            max={50}
          />

          <NumberInput
            value={reduccionJornada}
            onChange={setReduccionJornada}
            label={`Porcentaje de reducción de jornada (${req.reduccionJornadaMin}%–${req.reduccionJornadaMax}%)`}
            placeholder="50"
            helperText="Porcentaje de tu jornada habitual que dejarás de trabajar."
            min={25}
            max={75}
          />

          <NumberInput
            value={salarioBruto}
            onChange={setSalarioBruto}
            label="Salario bruto mensual actual (€/mes)"
            placeholder="Ej: 2.500"
            helperText="Tu salario bruto mensual completo (jornada 100%)."
            min={100}
            max={50000}
          />

          <NumberInput
            value={pensionOrdinaria}
            onChange={setPensionOrdinaria}
            label="Pensión ordinaria estimada (€/mes)"
            placeholder="Ej: 1.600"
            helperText="Obtenla del Estimador de Pensión Pública o del simulador oficial de la SS."
            min={100}
            max={10000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={orientar} aria-label="Orientar jubilación parcial">
            Orientarme sobre jubilación parcial
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orientación</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa el botón para recibir orientación sobre la jubilación parcial.
            </p>
          ) : (
            <div className={styles.resultados}>
              {/* Estado */}
              {resultado.posible ? (
                <div className={styles.statusOk} role="status">
                  ✅ En principio, podrías acogerte a la jubilación parcial
                </div>
              ) : (
                <div className={styles.statusNok} role="alert">
                  ❌ No cumples los requisitos actuales
                  <br /><small className={styles.smallNormal}>{resultado.motivoImpedimento}</small>
                </div>
              )}

              {/* Requisitos */}
              <div className={styles.requisitosGrid}>
                <div className={`${styles.requisitoItem} ${resultado.cumpleEdad ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.cumpleEdad ? '✓' : '✗'} Edad (≥ {req.edadMinima} años)
                </div>
                <div className={`${styles.requisitoItem} ${resultado.cumpleCotizacion ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.cumpleCotizacion ? '✓' : '✗'} Cotización (≥ {req.anosCotizadosMinimos} años)
                </div>
                <div className={`${styles.requisitoItem} ${resultado.cumpleReduccion ? styles.requisitoOk : styles.requisitoNok}`}>
                  {resultado.cumpleReduccion ? '✓' : '✗'} Jornada reducida ({req.reduccionJornadaMin}%–{req.reduccionJornadaMax}%)
                </div>
                <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                  ℹ Contrato de relevo (empleador)
                </div>
              </div>

              {resultado.posible && (
                <>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Pensión parcial mensual</span>
                    <span className={styles.resultValue}>{formatCurrency(resultado.pensionParcialMensual)}/mes</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Salario parcial bruto mensual</span>
                    <span className={styles.resultValue}>{formatCurrency(resultado.salarioParcialMensual)}/mes</span>
                  </div>

                  <div className={`${styles.resultItem}`}>
                    <span className={styles.resultLabel}>Ingresos totales mensuales combinados</span>
                    <span className={styles.resultValueBig}>{formatCurrency(resultado.ingresosTotalesMensual)}/mes</span>
                  </div>

                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>% sobre tu sueldo actual</span>
                    <span className={styles.resultValuePositive}>{formatNumber(resultado.porcentajeIngresosSobreSueldo, 1)}%</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0' }}>
                    Comparativa con otras opciones:
                  </p>

                  <div className={styles.comparativaGrid}>
                    <div className={styles.comparativaItem}>
                      <div className={styles.comparativaLabel}>Solo trabajar</div>
                      <div className={styles.comparativaValue}>{formatCurrency(parseFloat(salarioBruto.replace(',', '.')) || 0)}</div>
                    </div>
                    <div className={`${styles.comparativaItem} ${styles.comparativaHighlight}`}>
                      <div className={styles.comparativaLabel}>Jubilación parcial</div>
                      <div className={styles.comparativaValue}>{formatCurrency(resultado.ingresosTotalesMensual)}</div>
                    </div>
                    <div className={styles.comparativaItem}>
                      <div className={styles.comparativaLabel}>Jubilación completa</div>
                      <div className={styles.comparativaValue}>{formatCurrency(parseFloat(pensionOrdinaria.replace(',', '.')) || 0)}</div>
                    </div>
                    <div className={styles.comparativaItem}>
                      <div className={styles.comparativaLabel}>Diferencia vs trabajar</div>
                      <div className={styles.comparativaValue}>{formatCurrency(resultado.diferenciaVsTrabajo)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Qué es la jubilación parcial en España?" subtitle="Compatibilidad trabajo y pensión, contrato de relevo · SS 2025">
        <p>La jubilación parcial permite acceder a una parte de la pensión de jubilación mientras se sigue trabajando a jornada reducida. El porcentaje de pensión que se recibe equivale al porcentaje de reducción de jornada acordado.</p>
        <h3>Requisitos principales (régimen general)</h3>
        <ul>
          <li><strong>Edad mínima</strong>: {req.edadMinima} años cumplidos.</li>
          <li><strong>Cotización mínima</strong>: {req.anosCotizadosMinimos} años (con contrato de relevo simultáneo).</li>
          <li><strong>Reducción de jornada</strong>: entre {req.reduccionJornadaMin}% y {req.reduccionJornadaMax}% de la jornada habitual.</li>
          <li><strong>Contrato de relevo</strong>: el empleador está obligado a contratar a un relevista que cubra la parte de jornada liberada.</li>
        </ul>
        <h3>¿Cómo se calcula la pensión parcial?</h3>
        <p>La pensión parcial equivale al porcentaje de reducción de jornada aplicado sobre la pensión que te correspondería si te jubilaras completamente. No se aplican coeficientes reductores por anticipación.</p>
        <h3>Ventajas e inconvenientes</h3>
        <ul>
          <li><strong>Ventaja</strong>: Transición suave entre trabajo pleno y jubilación completa, con ingresos combinados generalmente superiores a la pensión sola.</li>
          <li><strong>Ventaja</strong>: Se siguen acumulando años de cotización, lo que puede mejorar la pensión definitiva.</li>
          <li><strong>Inconveniente</strong>: Requiere acuerdo del empleador y formalización de contrato de relevo, lo que no siempre es posible.</li>
        </ul>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-jubilacion-parcial')} />
      <ShareCard appName="orientador-jubilacion-parcial" />
      <Footer appName="orientador-jubilacion-parcial" />
    </div>
  );
}
