'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorJubilacionPublica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  NumberInput,
  ShareCard, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_PENSIONES_META,
  TABLA_EDAD_JUBILACION,
  getEdadJubilacion,
  COTIZACION_MINIMA,
  TRAMOS_PORCENTAJE_PENSION_2025,
  LIMITES_PENSION_2025,
  BASE_REGULADORA,
  BASES_SS_2026,
  getSistemaDualParams,
  COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025,
  COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025,
  REQUISITOS_ANTICIPADA_INVOLUNTARIA,
  REQUISITOS_ANTICIPADA_VOLUNTARIA,
  REQUISITOS_JUBILACION_PARCIAL,
  JUBILACION_PARCIAL_META,
  getCoeficienteAnticipada,
} from '@/data/fiscal';

// ──────────────────────────────────────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────────────────────────────────────

interface ResultadoEdad {
  edadAnios: number;
  edadMeses: number;
  anioJubilacion: number;
  cotizacionSuficiente: boolean;
  cotizacionNecesaria: { anios: number; meses: number };
  edadAlternativa: { anios: number; meses: number };
  anioAlternativo: number;
}

interface ResultadoFormula {
  baseReguladora: number;
  pensionBrutaMensual: number;
  pensionBrutaAnual: number;
  limitada: boolean;
}

interface ResultadoPension {
  clasica: ResultadoFormula;
  dual: ResultadoFormula;
  formulaAplicada: 'clasica' | 'dual';
  diferenciaMensual: number;
  porcentajeAplicable: number;
  edadOrdinaria: string;
  mesesParaCien: number;
  porcentajeSobreMaxima: number;
  pensionMensualFinal: number;
}

type TipoAnticipada = 'voluntaria' | 'involuntaria';

interface ResultadoAnticipada {
  posible: boolean;
  motivoImpedimento: string;
  cumpleCotizacion: boolean;
  mesesAnticipacion: number;
  trimestreAnticipacion: number;
  reduccionTotal: number;
  pensionConReduccion: number;
  perdidaMensual: number;
  maxMesesPermitidos: number;
}

interface ResultadoParcial {
  posible: boolean;
  cumpleEdad: boolean;
  cumpleCotizacion: boolean;
  cumpleReduccion: boolean;
  motivoImpedimento: string;
  pensionParcialMensual: number;
  salarioParcialMensual: number;
  ingresosTotalesMensual: number;
  porcentajeIngresosSobreSueldo: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// LÓGICA: EDAD DE JUBILACIÓN
// ──────────────────────────────────────────────────────────────────────────────

function calcularEdadJubilacion(anioNacimiento: number, anosCotizados: number): ResultadoEdad {
  for (let anioJub = anioNacimiento + 65; anioJub <= anioNacimiento + 70; anioJub++) {
    const datos = getEdadJubilacion(anioJub);
    const cotMin = datos.cotizacionPara65.anios * 12 + datos.cotizacionPara65.meses;
    const mesesCotizados = Math.round(anosCotizados * 12);

    if (mesesCotizados >= cotMin) {
      return {
        edadAnios: 65,
        edadMeses: 0,
        anioJubilacion: anioNacimiento + 65,
        cotizacionSuficiente: true,
        cotizacionNecesaria: datos.cotizacionPara65,
        edadAlternativa: datos.edadSinCotizacion,
        anioAlternativo: anioNacimiento + datos.edadSinCotizacion.anios + (datos.edadSinCotizacion.meses > 0 ? 1 : 0),
      };
    }

    const edadOrd = datos.edadSinCotizacion;
    const anioEdadOrd = anioNacimiento + edadOrd.anios + (edadOrd.meses > 0 ? 1 : 0);

    if (anioJub >= anioEdadOrd) {
      return {
        edadAnios: edadOrd.anios,
        edadMeses: edadOrd.meses,
        anioJubilacion: anioNacimiento + edadOrd.anios,
        cotizacionSuficiente: false,
        cotizacionNecesaria: datos.cotizacionPara65,
        edadAlternativa: edadOrd,
        anioAlternativo: anioNacimiento + edadOrd.anios,
      };
    }
  }

  return {
    edadAnios: 67,
    edadMeses: 0,
    anioJubilacion: anioNacimiento + 67,
    cotizacionSuficiente: false,
    cotizacionNecesaria: { anios: 38, meses: 6 },
    edadAlternativa: { anios: 67, meses: 0 },
    anioAlternativo: anioNacimiento + 67,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// LÓGICA: PENSIÓN
// ──────────────────────────────────────────────────────────────────────────────

function calcularPorcentajePension(mesesCotizados: number): number {
  if (mesesCotizados < COTIZACION_MINIMA.mesesMinimosAcceso) return 0;
  let porcentaje = 50;
  for (const tramo of TRAMOS_PORCENTAJE_PENSION_2025) {
    if (mesesCotizados <= tramo.mesesDesde) break;
    const mesesEnTramo = Math.min(mesesCotizados, tramo.mesesHasta) - tramo.mesesDesde;
    if (mesesEnTramo > 0) porcentaje += mesesEnTramo * tramo.incrementoPorMes;
  }
  return Math.min(100, porcentaje);
}

function calcularEdadOrdinaria(mesesCotizados: number): string {
  const datos2026 = getEdadJubilacion(2026);
  const cotMinMeses = datos2026.cotizacionPara65.anios * 12 + datos2026.cotizacionPara65.meses;
  if (mesesCotizados >= cotMinMeses) return '65 años';
  const e = datos2026.edadSinCotizacion;
  return e.meses > 0 ? `${e.anios} años y ${e.meses} meses` : `${e.anios} años`;
}

function aplicarLimites(pensionBruta: number): { pension: number; limitada: boolean } {
  const pension = Math.max(
    LIMITES_PENSION_2025.minimaSinConyuge,
    Math.min(LIMITES_PENSION_2025.maximaMensual, pensionBruta)
  );
  return { pension, limitada: pension !== pensionBruta };
}

function estimarPension(baseMensualMedia: number, anosCotizados: number): ResultadoPension {
  const mesesCotizados = Math.round(anosCotizados * 12);
  const porcentajeAplicable = calcularPorcentajePension(mesesCotizados);

  const brClasica = baseMensualMedia * BASE_REGULADORA.factor;
  const pensionClasica = brClasica * (porcentajeAplicable / 100);
  const limClasica = aplicarLimites(pensionClasica);

  const dualParams = getSistemaDualParams(2026);
  const brDual = baseMensualMedia * (dualParams.basesSeleccionadas / dualParams.divisor);
  const pensionDual = brDual * (porcentajeAplicable / 100);
  const limDual = aplicarLimites(pensionDual);

  const mejorEsClasica = limClasica.pension >= limDual.pension;
  const pensionFinal = mejorEsClasica ? limClasica.pension : limDual.pension;

  return {
    clasica: {
      baseReguladora: brClasica,
      pensionBrutaMensual: limClasica.pension,
      pensionBrutaAnual: limClasica.pension * 14,
      limitada: limClasica.limitada,
    },
    dual: {
      baseReguladora: brDual,
      pensionBrutaMensual: limDual.pension,
      pensionBrutaAnual: limDual.pension * 14,
      limitada: limDual.limitada,
    },
    formulaAplicada: mejorEsClasica ? 'clasica' : 'dual',
    diferenciaMensual: Math.abs(limClasica.pension - limDual.pension),
    porcentajeAplicable,
    edadOrdinaria: calcularEdadOrdinaria(mesesCotizados),
    mesesParaCien: COTIZACION_MINIMA.mesesParaCien,
    porcentajeSobreMaxima: (pensionFinal / LIMITES_PENSION_2025.maximaMensual) * 100,
    pensionMensualFinal: pensionFinal,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// LÓGICA: JUBILACIÓN ANTICIPADA
// ──────────────────────────────────────────────────────────────────────────────

function calcularReduccionAnticipada(anosCotizados: number, trimestreAnticipacion: number, tipo: TipoAnticipada): number {
  const coeficientes = tipo === 'voluntaria'
    ? COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025
    : COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025;

  return getCoeficienteAnticipada(anosCotizados, coeficientes) * trimestreAnticipacion;
}

function orientarAnticipada(
  anosCotizados: number,
  mesesAnticipacion: number,
  tipo: TipoAnticipada,
  pensionOrdinaria: number
): ResultadoAnticipada {
  const requisitos = tipo === 'voluntaria'
    ? REQUISITOS_ANTICIPADA_VOLUNTARIA
    : REQUISITOS_ANTICIPADA_INVOLUNTARIA;

  const cumpleCotizacion = anosCotizados >= requisitos.anosMinimoCotizados;
  const maxPermitidos = requisitos.maxMesesAnticipacion;
  const mesesReales = Math.min(mesesAnticipacion, maxPermitidos);
  const trimestreAnticipacion = Math.ceil(mesesReales / 3);

  let motivoImpedimento = '';
  if (!cumpleCotizacion) {
    motivoImpedimento = `Se necesitan ${requisitos.anosMinimoCotizados} años cotizados. Tienes ${anosCotizados}.`;
  } else if (mesesAnticipacion > maxPermitidos) {
    motivoImpedimento = `La jubilación anticipada ${tipo} permite un máximo de ${maxPermitidos / 12} años de antelación.`;
  }

  const posible = cumpleCotizacion && mesesAnticipacion <= maxPermitidos;
  const reduccionTotal = posible ? calcularReduccionAnticipada(anosCotizados, trimestreAnticipacion, tipo) : 0;
  const pensionConReduccion = pensionOrdinaria * (1 - reduccionTotal / 100);

  return {
    posible,
    motivoImpedimento,
    cumpleCotizacion,
    mesesAnticipacion: mesesReales,
    trimestreAnticipacion,
    reduccionTotal,
    pensionConReduccion,
    perdidaMensual: pensionOrdinaria - pensionConReduccion,
    maxMesesPermitidos: maxPermitidos,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// LÓGICA: JUBILACIÓN PARCIAL
// ──────────────────────────────────────────────────────────────────────────────

function orientarParcial(
  edadActual: number,
  anosCotizados: number,
  reduccionJornada: number,
  salarioBrutoMensual: number,
  pensionOrdinaria: number
): ResultadoParcial {
  const req = REQUISITOS_JUBILACION_PARCIAL;
  const cumpleEdad = edadActual >= req.edadMinima;
  const cumpleCotizacion = anosCotizados >= req.anosCotizadosMinimos;
  const cumpleReduccion = reduccionJornada >= req.reduccionJornadaMin && reduccionJornada <= req.reduccionJornadaMax;

  let motivoImpedimento = '';
  if (!cumpleEdad) motivoImpedimento = `Se necesitan al menos ${req.edadMinima} años. Tienes ${edadActual}.`;
  else if (!cumpleCotizacion) motivoImpedimento = `Se necesitan ${req.anosCotizadosMinimos} años cotizados. Tienes ${anosCotizados}.`;
  else if (!cumpleReduccion) motivoImpedimento = `La reducción debe estar entre ${req.reduccionJornadaMin}% y ${req.reduccionJornadaMax}%.`;

  const posible = cumpleEdad && cumpleCotizacion && cumpleReduccion;
  const fraccion = reduccionJornada / 100;
  const pensionParcialMensual = pensionOrdinaria * fraccion;
  const salarioParcialMensual = salarioBrutoMensual * (1 - fraccion);
  const ingresosTotalesMensual = pensionParcialMensual + salarioParcialMensual;

  return {
    posible,
    cumpleEdad,
    cumpleCotizacion,
    cumpleReduccion,
    motivoImpedimento,
    pensionParcialMensual,
    salarioParcialMensual,
    ingresosTotalesMensual,
    porcentajeIngresosSobreSueldo: salarioBrutoMensual > 0
      ? (ingresosTotalesMensual / salarioBrutoMensual) * 100
      : 0,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────────────────────────────────────

export default function SimuladorJubilacionPublicaPage() {
  // Datos básicos compartidos
  const [anioNacimiento, setAnioNacimiento] = useState('');
  const [anosCotizados, setAnosCotizados] = useState('');
  const [baseMensual, setBaseMensual] = useState('');
  const [error, setError] = useState('');
  const [calculado, setCalculado] = useState(false);

  // Edad y pensión (se calculan juntas)
  const [resultadoEdad, setResultadoEdad] = useState<ResultadoEdad | null>(null);
  const [resultadoPension, setResultadoPension] = useState<ResultadoPension | null>(null);

  // Anticipada (toggle)
  const [showAnticipada, setShowAnticipada] = useState(false);
  const [tipoAnticipada, setTipoAnticipada] = useState<TipoAnticipada>('voluntaria');
  const [mesesAnticipacion, setMesesAnticipacion] = useState('12');
  const [resultadoAnticipada, setResultadoAnticipada] = useState<ResultadoAnticipada | null>(null);

  // Parcial (toggle)
  const [showParcial, setShowParcial] = useState(false);
  const [reduccionJornada, setReduccionJornada] = useState('50');
  const [salarioBruto, setSalarioBruto] = useState('');
  const [resultadoParcial, setResultadoParcial] = useState<ResultadoParcial | null>(null);

  const edadTexto = (anios: number, meses: number) =>
    meses > 0 ? `${anios} años y ${meses} meses` : `${anios} años`;

  // Años cotizados como número (reutilizado)
  const anosCotizadosNum = useMemo(() => {
    return parseFloat(anosCotizados?.replace(',', '.') || '0');
  }, [anosCotizados]);

  // ── Cálculo principal ──
  function calcular() {
    setError('');
    const anio = parseInt(anioNacimiento);
    const anos = parseFloat(anosCotizados.replace(',', '.'));
    const base = parseFloat(baseMensual.replace(',', '.'));

    if (!anio || anio < 1940 || anio > 2000) {
      setError('Selecciona tu año de nacimiento.'); return;
    }
    if (isNaN(anos) || anos < 1 || anos > 50) {
      setError('Introduce los años cotizados (entre 1 y 50).'); return;
    }
    if (isNaN(base) || base < 100 || base > 20000) {
      setError('Introduce una base de cotización válida (entre 100 y 20.000 €).'); return;
    }
    if (anos < COTIZACION_MINIMA.anosMinimosAcceso) {
      setError(`Se necesitan al menos ${COTIZACION_MINIMA.anosMinimosAcceso} años cotizados para acceder a pensión.`); return;
    }

    setResultadoEdad(calcularEdadJubilacion(anio, anos));
    setResultadoPension(estimarPension(base, anos));
    setCalculado(true);

    // Resetear secciones opcionales
    setResultadoAnticipada(null);
    setResultadoParcial(null);
  }

  // ── Cálculo anticipada ──
  function calcularAnticipada() {
    if (!resultadoPension) return;
    const meses = parseInt(mesesAnticipacion);
    if (isNaN(meses) || meses < 1) return;

    setResultadoAnticipada(
      orientarAnticipada(anosCotizadosNum, meses, tipoAnticipada, resultadoPension.pensionMensualFinal)
    );
  }

  // ── Cálculo parcial ──
  function calcularParcial() {
    if (!resultadoPension) return;
    const anio = parseInt(anioNacimiento);
    const edadActual = new Date().getFullYear() - anio;
    const reduccion = parseFloat(reduccionJornada.replace(',', '.'));
    const salario = parseFloat(salarioBruto.replace(',', '.'));
    if (isNaN(reduccion) || isNaN(salario) || salario <= 0) return;

    setResultadoParcial(
      orientarParcial(edadActual, anosCotizadosNum, reduccion, salario, resultadoPension.pensionMensualFinal)
    );
  }

  const maxAnosAnticipada = tipoAnticipada === 'voluntaria' ? 2 : 4;
  const req = REQUISITOS_JUBILACION_PARCIAL;

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🏤</span>
          <h1 className={styles.title}>Simulador de Jubilación Pública</h1>
          <p className={styles.subtitle}>
            Edad, pensión estimada, anticipada y parcial · Sistema dual 2026
          </p>
        </header>

      <RegionBadge variant="es-only" />


        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical">
          <span>
            Esta herramienta es SOLO orientativa e informativa sobre la jubilación pública española.
            <br /><strong>No es</strong> asesoramiento previsional personalizado ni sustituye al simulador oficial de la SS.
            <br />La pensión real se calcula con tu historial completo de cotización. Datos SS vigentes en {FISCAL_PENSIONES_META.vigencia}.
            <br /><strong>Consulta tu vida laboral</strong> en la Sede Electrónica de la Seguridad Social antes de tomar decisiones.
            <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
          </span>
        </DisclaimerCard>

        <DataReference
          normativa={`Jubilación y Pensiones ${FISCAL_PENSIONES_META.vigencia}`}
          fuente={FISCAL_PENSIONES_META.fuente}
          verificado={FISCAL_PENSIONES_META.verificado}
          urlOficial={FISCAL_PENSIONES_META.urlOficial}
          nota={FISCAL_PENSIONES_META.nota}
        />

        {/* ═══════ FORMULARIO PRINCIPAL ═══════ */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">👤</span> Tus datos de cotización
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="anioNacimiento">Año de nacimiento</label>
            <select
              id="anioNacimiento"
              className={styles.select}
              value={anioNacimiento}
              onChange={e => setAnioNacimiento(e.target.value)}
            >
              <option value="">Selecciona tu año de nacimiento</option>
              {Array.from({ length: 46 }, (_, i) => 1955 + i).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <NumberInput
            value={anosCotizados}
            onChange={setAnosCotizados}
            label="Años cotizados (estimados al jubilarte)"
            placeholder="Ej: 35"
            helperText="Incluye los años que te quedan por cotizar. Consúltalos en importass.seg-social.es"
            min={1}
            max={50}
          />

          <NumberInput
            value={baseMensual}
            onChange={setBaseMensual}
            label={`Base de cotización media mensual (€) — máx. ${formatCurrency(BASES_SS_2026.maxima)}/mes`}
            placeholder="Ej: 2.500"
            helperText="Aproximación de tu salario bruto mensual medio de los últimos 25 años."
            min={100}
            max={20000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular jubilación">
            Simular mi jubilación
          </button>

          <div className={styles.infoSS}>
            💡 Para mayor precisión, usa el <strong>simulador oficial</strong> de la SS con tu historial real de cotización.
          </div>
        </div>

        {/* ═══════ RESULTADO 1: EDAD DE JUBILACIÓN ═══════ */}
        {calculado && resultadoEdad && (
          <div className={styles.resultAge} role="status" aria-live="polite">
            <div className={styles.resultAgeNumber}>
              {edadTexto(resultadoEdad.edadAnios, resultadoEdad.edadMeses)}
            </div>
            <div className={styles.resultAgeYear}>
              Te jubilarías en {resultadoEdad.anioJubilacion}
            </div>
            <p className={styles.resultAgeDetail}>
              {resultadoEdad.cotizacionSuficiente ? (
                <>
                  Con {anosCotizados} años cotizados, superas el umbral de{' '}
                  {edadTexto(resultadoEdad.cotizacionNecesaria.anios, resultadoEdad.cotizacionNecesaria.meses)}{' '}
                  necesarios para jubilarte a los <strong>65 años</strong>.
                </>
              ) : (
                <>
                  Con {anosCotizados || '0'} años cotizados, no alcanzas el umbral de{' '}
                  {edadTexto(resultadoEdad.cotizacionNecesaria.anios, resultadoEdad.cotizacionNecesaria.meses)}{' '}
                  necesarios para jubilarte a los 65. Tu edad ordinaria es{' '}
                  <strong>{edadTexto(resultadoEdad.edadAlternativa.anios, resultadoEdad.edadAlternativa.meses)}</strong>.
                </>
              )}
            </p>

            {resultadoEdad.cotizacionSuficiente && (
              <div className={styles.resultAgeAlt}>
                Sin cotización suficiente, la edad sería{' '}
                <strong>{edadTexto(resultadoEdad.edadAlternativa.anios, resultadoEdad.edadAlternativa.meses)}</strong>{' '}
                (año ~{resultadoEdad.anioAlternativo}).
              </div>
            )}
          </div>
        )}

        {/* ═══════ RESULTADO 2: PENSIÓN ESTIMADA ═══════ */}
        {calculado && resultadoPension && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">💰</span> Pensión estimada
            </h2>

            <div className={styles.resultados}>
              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>
                  Pensión mensual ({resultadoPension.formulaAplicada === 'dual' ? 'sistema ampliado' : 'sistema clásico'})
                </span>
                <span className={styles.resultValueBig}>
                  {formatCurrency(resultadoPension.pensionMensualFinal)}
                </span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Pensión anual (14 pagas)</span>
                <span className={styles.resultValue}>
                  {formatCurrency(resultadoPension.pensionMensualFinal * 14)}
                </span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Fórmula clásica (25 años / 350)</span>
                <span className={styles.resultValue}>
                  BR {formatCurrency(resultadoPension.clasica.baseReguladora)} → {formatCurrency(resultadoPension.clasica.pensionBrutaMensual)}/mes
                </span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Fórmula ampliada 2026 (sistema dual)</span>
                <span className={styles.resultValue}>
                  BR {formatCurrency(resultadoPension.dual.baseReguladora)} → {formatCurrency(resultadoPension.dual.pensionBrutaMensual)}/mes
                </span>
              </div>

              {resultadoPension.diferenciaMensual > 0 && (
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Diferencia entre fórmulas</span>
                  <span className={styles.resultNote}>
                    {formatCurrency(resultadoPension.diferenciaMensual)}/mes a favor de la {resultadoPension.formulaAplicada === 'dual' ? 'ampliada' : 'clásica'}. La SS aplica automáticamente la más favorable.
                  </span>
                </div>
              )}

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Porcentaje por años cotizados</span>
                <span className={styles.resultValue}>{formatNumber(resultadoPension.porcentajeAplicable, 2)}%</span>
              </div>

              <div className={styles.barraProgreso}>
                <div className={styles.barraLabel}>
                  <span>Sobre pensión máxima ({formatCurrency(LIMITES_PENSION_2025.maximaMensual)})</span>
                  <span>{formatNumber(resultadoPension.porcentajeSobreMaxima, 1)}%</span>
                </div>
                <div
                  className={styles.barra}
                  role="progressbar"
                  aria-label={`Pensión equivale al ${formatNumber(resultadoPension.porcentajeSobreMaxima, 1)}% de la pensión máxima`}
                  aria-valuenow={Math.round(resultadoPension.porcentajeSobreMaxima)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className={styles.barraFill} style={{ width: `${Math.min(100, resultadoPension.porcentajeSobreMaxima)}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 3: JUBILACIÓN ANTICIPADA (toggle) ═══════ */}
        {calculado && resultadoPension && (
          <div className={styles.toggleSection}>
            <button
              type="button"
              className={`${styles.toggleHeader} ${showAnticipada ? styles.toggleHeaderActive : ''}`}
              onClick={() => setShowAnticipada(!showAnticipada)}
              aria-expanded={showAnticipada}
              aria-controls="seccion-anticipada"
            >
              <span className={styles.toggleIcon} aria-hidden="true">⏩</span>
              <span className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>¿Puedo jubilarme antes?</span>
                <span className={styles.toggleSubtitle}>Jubilación anticipada: requisitos y coeficientes reductores</span>
              </span>
              <span className={`${styles.toggleArrow} ${showAnticipada ? styles.toggleArrowOpen : ''}`} aria-hidden="true">▼</span>
            </button>

            {showAnticipada && (
              <div id="seccion-anticipada" className={styles.toggleContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="tipoAnticipada">Tipo de jubilación anticipada</label>
                  <select
                    id="tipoAnticipada"
                    className={styles.select}
                    value={tipoAnticipada}
                    onChange={e => { setTipoAnticipada(e.target.value as TipoAnticipada); setResultadoAnticipada(null); }}
                  >
                    <option value="voluntaria">Voluntaria (a tu iniciativa)</option>
                    <option value="involuntaria">Involuntaria (ERE, despido, cierre empresa...)</option>
                  </select>
                  <p className={styles.hint}>
                    {tipoAnticipada === 'voluntaria'
                      ? `Hasta ${maxAnosAnticipada} años antes. Requiere ${REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados} años cotizados.`
                      : `Hasta ${maxAnosAnticipada} años antes. Requiere ${REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados} años cotizados.`}
                  </p>
                </div>

                <NumberInput
                  value={mesesAnticipacion}
                  onChange={setMesesAnticipacion}
                  label={`Meses de anticipación (máx. ${maxAnosAnticipada * 12})`}
                  placeholder={`${maxAnosAnticipada * 6}`}
                  helperText="Meses antes de tu edad de jubilación ordinaria."
                  min={1}
                  max={maxAnosAnticipada * 12}
                />

                <button type="button" className={styles.btn} onClick={calcularAnticipada} aria-label="Calcular jubilación anticipada">
                  Calcular anticipada
                </button>

                {resultadoAnticipada && (
                  <div className={styles.resultados} style={{ marginTop: '1.5rem' }}>
                    {resultadoAnticipada.posible ? (
                      <div className={styles.statusOk} role="status">
                        ✅ En principio, podrías jubilarte anticipadamente
                      </div>
                    ) : (
                      <div className={styles.statusNok} role="alert">
                        ❌ No cumples los requisitos
                        <br /><small className={styles.smallNormal}>{resultadoAnticipada.motivoImpedimento}</small>
                      </div>
                    )}

                    <div className={styles.requisitosGrid}>
                      <div className={`${styles.requisitoItem} ${resultadoAnticipada.cumpleCotizacion ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoAnticipada.cumpleCotizacion ? '✓' : '✗'} Años cotizados ({tipoAnticipada === 'voluntaria' ? REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados : REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados} req.)
                      </div>
                      <div className={`${styles.requisitoItem} ${resultadoAnticipada.mesesAnticipacion <= resultadoAnticipada.maxMesesPermitidos ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoAnticipada.mesesAnticipacion <= resultadoAnticipada.maxMesesPermitidos ? '✓' : '✗'} Antelación (máx. {resultadoAnticipada.maxMesesPermitidos} meses)
                      </div>
                      {tipoAnticipada === 'involuntaria' && (
                        <div className={`${styles.requisitoItem} ${styles.requisitoInfo}`}>
                          ⓘ Además: al menos {REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosCotizadosEnUltimos15} años cotizados en los últimos 15 años de vida laboral
                        </div>
                      )}
                    </div>

                    {resultadoAnticipada.posible && (
                      <>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Anticipación</span>
                          <span className={styles.resultValue}>{resultadoAnticipada.mesesAnticipacion} meses ({resultadoAnticipada.trimestreAnticipacion} trim.)</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Reducción total</span>
                          <span className={styles.resultValueDanger}>-{formatNumber(resultadoAnticipada.reduccionTotal, 2)}%</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Pensión con reducción</span>
                          <span className={styles.resultValueWarning}>{formatCurrency(resultadoAnticipada.pensionConReduccion)}/mes</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Pérdida mensual permanente</span>
                          <span className={styles.resultValueDanger}>-{formatCurrency(resultadoAnticipada.perdidaMensual)}/mes</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Pérdida anual (14 pagas)</span>
                          <span className={styles.resultValueDanger}>-{formatCurrency(resultadoAnticipada.perdidaMensual * 14)}/año</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ SECCIÓN 4: JUBILACIÓN PARCIAL (toggle) ═══════ */}
        {calculado && resultadoPension && (
          <div className={styles.toggleSection}>
            <button
              type="button"
              className={`${styles.toggleHeader} ${showParcial ? styles.toggleHeaderActive : ''}`}
              onClick={() => setShowParcial(!showParcial)}
              aria-expanded={showParcial}
              aria-controls="seccion-parcial"
            >
              <span className={styles.toggleIcon} aria-hidden="true">⚖️</span>
              <span className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>¿Puedo trabajar y cobrar pensión a la vez?</span>
                <span className={styles.toggleSubtitle}>Jubilación parcial: combina trabajo a media jornada + pensión</span>
              </span>
              <span className={`${styles.toggleArrow} ${showParcial ? styles.toggleArrowOpen : ''}`} aria-hidden="true">▼</span>
            </button>

            {showParcial && (
              <div id="seccion-parcial" className={styles.toggleContent}>
                <NumberInput
                  value={reduccionJornada}
                  onChange={setReduccionJornada}
                  label={`Reducción de jornada (${req.reduccionJornadaMin}%–${req.reduccionJornadaMax}%)`}
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

                <button type="button" className={styles.btn} onClick={calcularParcial} aria-label="Calcular jubilación parcial">
                  Calcular parcial
                </button>

                {resultadoParcial && (
                  <div className={styles.resultados} style={{ marginTop: '1.5rem' }}>
                    {resultadoParcial.posible ? (
                      <div className={styles.statusOk} role="status">
                        ✅ En principio, podrías acogerte a la jubilación parcial
                      </div>
                    ) : (
                      <div className={styles.statusNok} role="alert">
                        ❌ No cumples los requisitos
                        <br /><small className={styles.smallNormal}>{resultadoParcial.motivoImpedimento}</small>
                      </div>
                    )}

                    <div className={styles.requisitosGrid}>
                      <div className={`${styles.requisitoItem} ${resultadoParcial.cumpleEdad ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoParcial.cumpleEdad ? '✓' : '✗'} Edad (≥ {req.edadMinima} años)
                      </div>
                      <div className={`${styles.requisitoItem} ${resultadoParcial.cumpleCotizacion ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoParcial.cumpleCotizacion ? '✓' : '✗'} Cotización (≥ {req.anosCotizadosMinimos} años)
                      </div>
                      <div className={`${styles.requisitoItem} ${resultadoParcial.cumpleReduccion ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoParcial.cumpleReduccion ? '✓' : '✗'} Jornada ({req.reduccionJornadaMin}%–{req.reduccionJornadaMax}%)
                      </div>
                      <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                        ℹ Contrato de relevo (empleador)
                      </div>
                    </div>

                    {resultadoParcial.posible && (
                      <>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Pensión parcial</span>
                          <span className={styles.resultValue}>{formatCurrency(resultadoParcial.pensionParcialMensual)}/mes</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Salario parcial bruto</span>
                          <span className={styles.resultValue}>{formatCurrency(resultadoParcial.salarioParcialMensual)}/mes</span>
                        </div>
                        <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                          <span className={styles.resultLabel}>Ingresos totales combinados</span>
                          <span className={styles.resultValueBig}>{formatCurrency(resultadoParcial.ingresosTotalesMensual)}/mes</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>% sobre tu sueldo actual</span>
                          <span className={styles.resultValuePositive}>{formatNumber(resultadoParcial.porcentajeIngresosSobreSueldo, 1)}%</span>
                        </div>

                        <div className={styles.comparativaGrid}>
                          <div className={styles.comparativaItem}>
                            <div className={styles.comparativaLabel}>Solo trabajar</div>
                            <div className={styles.comparativaValue}>{formatCurrency(parseFloat(salarioBruto.replace(',', '.')) || 0)}</div>
                          </div>
                          <div className={`${styles.comparativaItem} ${styles.comparativaHighlight}`}>
                            <div className={styles.comparativaLabel}>Jubilación parcial</div>
                            <div className={styles.comparativaValue}>{formatCurrency(resultadoParcial.ingresosTotalesMensual)}</div>
                          </div>
                          <div className={styles.comparativaItem}>
                            <div className={styles.comparativaLabel}>Jubilación completa</div>
                            <div className={styles.comparativaValue}>{formatCurrency(resultadoPension.pensionMensualFinal)}</div>
                          </div>
                          <div className={styles.comparativaItem}>
                            <div className={styles.comparativaLabel}>Diferencia vs trabajar</div>
                            <div className={styles.comparativaValue}>{formatCurrency(resultadoParcial.ingresosTotalesMensual - (parseFloat(salarioBruto.replace(',', '.')) || 0))}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ TABLA DE EDAD ═══════ */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">📊</span> Tabla de edad de jubilación 2024-2027
          </h2>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Año</th>
                <th>Edad ordinaria</th>
                <th>Cotización para jubilarse a los 65</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_EDAD_JUBILACION.map(row => (
                <tr key={row.anio} className={row.anio === 2026 ? styles.tablaHighlight : ''}>
                  <td>{row.anio}{row.anio === 2026 ? ' ←' : ''}</td>
                  <td>{edadTexto(row.edadSinCotizacion.anios, row.edadSinCotizacion.meses)}</td>
                  <td>{edadTexto(row.cotizacionPara65.anios, row.cotizacionPara65.meses)} cotizados</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Desde 2027 la edad ordinaria se estabiliza en 67 años (o 65 con 38 años y 6 meses cotizados).
          </p>
        </div>

        {/* ═══════ CONTENIDO EDUCATIVO v2.0 ═══════ */}
        <EducationalSection
          title="📚 Todo sobre la jubilación pública en España"
          subtitle="Pensión, edad, anticipada, parcial — Normativa y preguntas frecuentes"
        >
          <h2><span aria-hidden="true">🎯</span> 4 situaciones frecuentes</h2>

          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👩‍💼</span>
                <strong>Empleada con carrera completa</strong>
              </div>
              <p className={styles.escenarioExample}>Ana, 62 años, 38 años cotizados, base 2.200 €/mes.</p>
              <p className={styles.escenarioTip}>Con 38 años al 100%, cobra 2.200 €/mes. Puede jubilarse a los 65 con pensión íntegra.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👨‍🔧</span>
                <strong>Autónomo con carrera irregular</strong>
              </div>
              <p className={styles.escenarioExample}>Carlos, 64 años, 28 años cotizados. Bases bajas al principio.</p>
              <p className={styles.escenarioTip}>Con 28 años obtiene el 88,75%. Cotizar 2 años más sube al 96,75%.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>👷</span>
                <strong>Trabajador que quiere anticipar</strong>
              </div>
              <p className={styles.escenarioExample}>Pedro, 63 años, 36 cotizados. Quiere jubilarse 2 años antes.</p>
              <p className={styles.escenarioTip}>Puede anticipar voluntariamente (tiene 35+). Reducción ~6-7% permanente sobre su pensión.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
                <strong>Persona que prefiere transición gradual</strong>
              </div>
              <p className={styles.escenarioExample}>María, 62 años, 35 cotizados. Quiere reducir jornada al 50%.</p>
              <p className={styles.escenarioTip}>Jubilación parcial: cobra 50% pensión + 50% salario. Sigue cotizando al 100%.</p>
            </div>
          </div>

          <h2><span aria-hidden="true">❓</span> Preguntas frecuentes</h2>

          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Cuántos años hay que cotizar para cobrar el 100%?</strong>
              <p>En 2026 se necesitan 36 años y 9 meses cotizados para alcanzar el 100% de la base reguladora. Este requisito ha aumentado progresivamente en los últimos años según la Ley 27/2011 y la Ley 21/2021.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es el sistema dual de pensiones 2026?</strong>
              <p>Desde enero de 2026, la SS calcula tu pensión con dos fórmulas (clásica de 25 años y ampliada) y aplica automáticamente la más favorable. Beneficia especialmente a trabajadores con lagunas o salarios variables.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Puedo jubilarme antes de la edad ordinaria?</strong>
              <p>Sí: anticipada voluntaria (hasta 2 años antes, 35+ años cotizados) o involuntaria (hasta 4 años, 33+ cotizados). Ambas implican coeficientes reductores permanentes.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿La reducción por anticipada es permanente?</strong>
              <p>Sí, se mantiene toda la vida. Un -10% de reducción se aplica durante toda la jubilación. El punto de equilibrio suele estar entre 10-15 años.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la jubilación parcial?</strong>
              <p>Permite reducir la jornada entre 25% y 75% a partir de los 60 años, combinando salario y pensión parcial. Requiere contrato de relevo y acuerdo con el empleador.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Puedo trabajar y cobrar pensión a la vez?</strong>
              <p>Sí: jubilación parcial (salario + pensión proporcional) o jubilación activa (50% pensión, 100% si autónomo con empleado).</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo consulto mis años cotizados?</strong>
              <p>En la Sede Electrónica de la Seguridad Social (importass.seg-social.es) puedes descargar tu informe de vida laboral.</p>
              <p className={styles.faqTip}>💡 Verifica la vida laboral antes de hacer planes — puede haber sorpresas.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuándo será definitiva la edad de 67 años?</strong>
              <p>En 2027. Desde ese año, la edad ordinaria es 67 años (o 65 con 38 años y 6 meses). No hay más escalones previstos.</p>
            </li>
          </ul>

          <h2><span aria-hidden="true">📝</span> Cómo preparar tu jubilación paso a paso</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Consulta tu vida laboral</strong>
                <p>Descarga el informe en importass.seg-social.es. Verifica años cotizados y posibles lagunas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula tu edad y pensión</strong>
                <p>Usa este simulador para obtener tu edad de jubilación y pensión estimada con el sistema dual 2026.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Valora la anticipada o parcial</strong>
                <p>Si cumples requisitos, compara la pensión reducida o parcial con la ordinaria. Calcula el punto de equilibrio.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula la brecha</strong>
                <p>Compara tu sueldo actual con la pensión estimada. Si la diferencia es grande, planifica ahorro complementario.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Solicita cita previa</strong>
                <p>Presenta la solicitud en el INSS con 3-6 meses de antelación a la fecha prevista de jubilación.</p>
              </div>
            </div>
          </div>

          <h2><span aria-hidden="true">💡</span> Consejos clave</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>📋</span>
              <strong>Revisa la vida laboral cada año</strong>
              <p>Un año no cotizado mal registrado puede costar 1-2% de pensión vitalicia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>📅</span>
              <strong>Planifica con 10 años</strong>
              <p>A los 55 ya puedes proyectar tu pensión con precisión y ajustar estrategias.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>💡</span>
              <strong>Maximiza bases finales</strong>
              <p>Los últimos 25 años definen tu base reguladora. Prioriza cotizar alto al final.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>⚖️</span>
              <strong>Evalúa el break-even</strong>
              <p>Si anticipas 2 años, necesitas ~15-20 años para compensar la reducción.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>🔍</span>
              <strong>Convenios internacionales</strong>
              <p>Períodos cotizados en países con convenio bilateral pueden sumarse.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>📊</span>
              <strong>Simulador oficial de la SS</strong>
              <p>Ofrece estimaciones personalizadas más precisas con tu historial real.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <strong>Errores frecuentes al planificar la jubilación</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Creer que la edad es siempre 65 años:</strong> En 2026 es 66 años y 10 meses sin cotización suficiente.</li>
              <li><strong>No verificar la vida laboral:</strong> Muchas personas descubren lagunas o errores solo al solicitar la pensión.</li>
              <li><strong>Confundir años cotizados con años trabajados:</strong> El paro sin prestación no cotiza y genera lagunas.</li>
              <li><strong>Calcular sobre sueldo bruto:</strong> Horas extra y complementos no siempre cotizan igual que el salario base.</li>
              <li><strong>Ignorar el impacto del IRPF:</strong> Las pensiones tributan como rendimientos del trabajo (retenciones del 8-15%).</li>
              <li><strong>No considerar la pensión mínima:</strong> Si tu pensión calculada queda por debajo del mínimo, se complementa automáticamente.</li>
              <li><strong>No agotar desempleo antes de anticipar:</strong> A veces es más rentable cobrar el desempleo completo primero.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-jubilacion-publica')} />
        <ShareCard appName="simulador-jubilacion-publica" />
        <Footer appName="simulador-jubilacion-publica" />
    </div>
  );
}
