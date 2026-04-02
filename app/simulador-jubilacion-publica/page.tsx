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
  ShareCard,
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
  EDAD_JUBILACION_2025,
  getSistemaDualParams,
  COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025,
  COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025,
  REQUISITOS_ANTICIPADA_INVOLUNTARIA,
  REQUISITOS_ANTICIPADA_VOLUNTARIA,
  REQUISITOS_JUBILACION_PARCIAL,
  JUBILACION_PARCIAL_META,
  CoeficienteReductor,
} from '@/data/fiscal';
import { jsonLd } from './metadata';

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
// L\u00d3GICA: EDAD DE JUBILACI\u00d3N
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
// L\u00d3GICA: PENSI\u00d3N
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
  if (mesesCotizados >= cotMinMeses) return '65 a\u00f1os';
  const e = datos2026.edadSinCotizacion;
  return e.meses > 0 ? `${e.anios} a\u00f1os y ${e.meses} meses` : `${e.anios} a\u00f1os`;
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
// L\u00d3GICA: JUBILACI\u00d3N ANTICIPADA
// ──────────────────────────────────────────────────────────────────────────────

function calcularReduccionAnticipada(trimestreAnticipacion: number, tipo: TipoAnticipada): number {
  const coeficientes: CoeficienteReductor[] = tipo === 'voluntaria'
    ? COEFICIENTES_ANTICIPADA_VOLUNTARIA_2025
    : COEFICIENTES_ANTICIPADA_INVOLUNTARIA_2025;

  let reduccionTotal = 0;
  for (let t = 1; t <= trimestreAnticipacion; t++) {
    const tramo = coeficientes.find(c => t >= c.trimestreDesde && t <= c.trimestreHasta);
    if (tramo) reduccionTotal += tramo.reduccionPorTrimestre;
  }
  return reduccionTotal;
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
    motivoImpedimento = `Se necesitan ${requisitos.anosMinimoCotizados} a\u00f1os cotizados. Tienes ${anosCotizados}.`;
  } else if (mesesAnticipacion > maxPermitidos) {
    motivoImpedimento = `La jubilaci\u00f3n anticipada ${tipo} permite un m\u00e1ximo de ${maxPermitidos / 12} a\u00f1os de antelaci\u00f3n.`;
  }

  const posible = cumpleCotizacion && mesesAnticipacion <= maxPermitidos;
  const reduccionTotal = posible ? calcularReduccionAnticipada(trimestreAnticipacion, tipo) : 0;
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
// L\u00d3GICA: JUBILACI\u00d3N PARCIAL
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
  if (!cumpleEdad) motivoImpedimento = `Se necesitan al menos ${req.edadMinima} a\u00f1os. Tienes ${edadActual}.`;
  else if (!cumpleCotizacion) motivoImpedimento = `Se necesitan ${req.anosCotizadosMinimos} a\u00f1os cotizados. Tienes ${anosCotizados}.`;
  else if (!cumpleReduccion) motivoImpedimento = `La reducci\u00f3n debe estar entre ${req.reduccionJornadaMin}% y ${req.reduccionJornadaMax}%.`;

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
  // Datos b\u00e1sicos compartidos
  const [anioNacimiento, setAnioNacimiento] = useState('');
  const [anosCotizados, setAnosCotizados] = useState('');
  const [baseMensual, setBaseMensual] = useState('');
  const [error, setError] = useState('');
  const [calculado, setCalculado] = useState(false);

  // Edad y pensi\u00f3n (se calculan juntas)
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
    meses > 0 ? `${anios} a\u00f1os y ${meses} meses` : `${anios} a\u00f1os`;

  // A\u00f1os cotizados como n\u00famero (reutilizado)
  const anosCotizadosNum = useMemo(() => {
    return parseFloat(anosCotizados?.replace(',', '.') || '0');
  }, [anosCotizados]);

  // ── C\u00e1lculo principal ──
  function calcular() {
    setError('');
    const anio = parseInt(anioNacimiento);
    const anos = parseFloat(anosCotizados.replace(',', '.'));
    const base = parseFloat(baseMensual.replace(',', '.'));

    if (!anio || anio < 1940 || anio > 2000) {
      setError('Selecciona tu a\u00f1o de nacimiento.'); return;
    }
    if (isNaN(anos) || anos < 1 || anos > 50) {
      setError('Introduce los a\u00f1os cotizados (entre 1 y 50).'); return;
    }
    if (isNaN(base) || base < 100 || base > 20000) {
      setError('Introduce una base de cotizaci\u00f3n v\u00e1lida (entre 100 y 20.000 \u20ac).'); return;
    }
    if (anos < COTIZACION_MINIMA.anosMinimosAcceso) {
      setError(`Se necesitan al menos ${COTIZACION_MINIMA.anosMinimosAcceso} a\u00f1os cotizados para acceder a pensi\u00f3n.`); return;
    }

    setResultadoEdad(calcularEdadJubilacion(anio, anos));
    setResultadoPension(estimarPension(base, anos));
    setCalculado(true);

    // Resetear secciones opcionales
    setResultadoAnticipada(null);
    setResultadoParcial(null);
  }

  // ── C\u00e1lculo anticipada ──
  function calcularAnticipada() {
    if (!resultadoPension) return;
    const meses = parseInt(mesesAnticipacion);
    if (isNaN(meses) || meses < 1) return;

    setResultadoAnticipada(
      orientarAnticipada(anosCotizadosNum, meses, tipoAnticipada, resultadoPension.pensionMensualFinal)
    );
  }

  // ── C\u00e1lculo parcial ──
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">\ud83c\udfe4</span>
          <h1 className={styles.title}>Simulador de Jubilaci\u00f3n P\u00fablica</h1>
          <p className={styles.subtitle}>
            Edad, pensi\u00f3n estimada, anticipada y parcial \u00b7 Sistema dual 2026
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard variant="financial" severity="critical">
          <span>
            Esta herramienta es SOLO orientativa e informativa sobre la jubilaci\u00f3n p\u00fablica espa\u00f1ola.
            <br /><strong>No es</strong> asesoramiento previsional personalizado ni sustituye al simulador oficial de la SS.
            <br />La pensi\u00f3n real se calcula con tu historial completo de cotizaci\u00f3n. Datos SS vigentes en {FISCAL_PENSIONES_META.vigencia}.
            <br /><strong>Consulta tu vida laboral</strong> en la Sede Electr\u00f3nica de la Seguridad Social antes de tomar decisiones.
            <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimaci\u00f3n.</em>
          </span>
        </DisclaimerCard>

        <DataReference
          normativa={FISCAL_PENSIONES_META.fuente}
          fuente={FISCAL_PENSIONES_META.fuente}
          verificado={FISCAL_PENSIONES_META.verificado}
          urlOficial={FISCAL_PENSIONES_META.urlOficial}
        />

        {/* ═══════ FORMULARIO PRINCIPAL ═══════ */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <span aria-hidden="true">\ud83d\udc64</span> Tus datos de cotizaci\u00f3n
          </h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="anioNacimiento">A\u00f1o de nacimiento</label>
            <select
              id="anioNacimiento"
              className={styles.select}
              value={anioNacimiento}
              onChange={e => setAnioNacimiento(e.target.value)}
            >
              <option value="">Selecciona tu a\u00f1o de nacimiento</option>
              {Array.from({ length: 46 }, (_, i) => 1955 + i).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <NumberInput
            value={anosCotizados}
            onChange={setAnosCotizados}
            label="A\u00f1os cotizados (estimados al jubilarte)"
            placeholder="Ej: 35"
            helperText="Incluye los a\u00f1os que te quedan por cotizar. Cons\u00faltalos en importass.seg-social.es"
            min={1}
            max={50}
          />

          <NumberInput
            value={baseMensual}
            onChange={setBaseMensual}
            label={`Base de cotizaci\u00f3n media mensual (\u20ac) \u2014 m\u00e1x. ${formatCurrency(4720.50)}/mes`}
            placeholder="Ej: 2.500"
            helperText="Aproximaci\u00f3n de tu salario bruto mensual medio de los \u00faltimos 25 a\u00f1os."
            min={100}
            max={20000}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              \u26a0\ufe0f {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular jubilaci\u00f3n">
            Simular mi jubilaci\u00f3n
          </button>

          <div className={styles.infoSS}>
            \ud83d\udca1 Para mayor precisi\u00f3n, usa el <strong>simulador oficial</strong> de la SS con tu historial real de cotizaci\u00f3n.
          </div>
        </div>

        {/* ═══════ RESULTADO 1: EDAD DE JUBILACI\u00d3N ═══════ */}
        {calculado && resultadoEdad && (
          <div className={styles.resultAge} role="status" aria-live="polite">
            <div className={styles.resultAgeNumber}>
              {edadTexto(resultadoEdad.edadAnios, resultadoEdad.edadMeses)}
            </div>
            <div className={styles.resultAgeYear}>
              Te jubilar\u00edas en {resultadoEdad.anioJubilacion}
            </div>
            <p className={styles.resultAgeDetail}>
              {resultadoEdad.cotizacionSuficiente ? (
                <>
                  Con {anosCotizados} a\u00f1os cotizados, superas el umbral de{' '}
                  {edadTexto(resultadoEdad.cotizacionNecesaria.anios, resultadoEdad.cotizacionNecesaria.meses)}{' '}
                  necesarios para jubilarte a los <strong>65 a\u00f1os</strong>.
                </>
              ) : (
                <>
                  Con {anosCotizados || '0'} a\u00f1os cotizados, no alcanzas el umbral de{' '}
                  {edadTexto(resultadoEdad.cotizacionNecesaria.anios, resultadoEdad.cotizacionNecesaria.meses)}{' '}
                  necesarios para jubilarte a los 65. Tu edad ordinaria es{' '}
                  <strong>{edadTexto(resultadoEdad.edadAlternativa.anios, resultadoEdad.edadAlternativa.meses)}</strong>.
                </>
              )}
            </p>

            {resultadoEdad.cotizacionSuficiente && (
              <div className={styles.resultAgeAlt}>
                Sin cotizaci\u00f3n suficiente, la edad ser\u00eda{' '}
                <strong>{edadTexto(resultadoEdad.edadAlternativa.anios, resultadoEdad.edadAlternativa.meses)}</strong>{' '}
                (a\u00f1o ~{resultadoEdad.anioAlternativo}).
              </div>
            )}
          </div>
        )}

        {/* ═══════ RESULTADO 2: PENSI\u00d3N ESTIMADA ═══════ */}
        {calculado && resultadoPension && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span aria-hidden="true">\ud83d\udcb0</span> Pensi\u00f3n estimada
            </h2>

            <div className={styles.resultados}>
              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>
                  Pensi\u00f3n mensual ({resultadoPension.formulaAplicada === 'dual' ? 'sistema ampliado' : 'sistema cl\u00e1sico'})
                </span>
                <span className={styles.resultValueBig}>
                  {formatCurrency(resultadoPension.pensionMensualFinal)}
                </span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Pensi\u00f3n anual (14 pagas)</span>
                <span className={styles.resultValue}>
                  {formatCurrency(resultadoPension.pensionMensualFinal * 14)}
                </span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>F\u00f3rmula cl\u00e1sica (25 a\u00f1os / 350)</span>
                <span className={styles.resultValue}>
                  BR {formatCurrency(resultadoPension.clasica.baseReguladora)} \u2192 {formatCurrency(resultadoPension.clasica.pensionBrutaMensual)}/mes
                </span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>F\u00f3rmula ampliada 2026 (sistema dual)</span>
                <span className={styles.resultValue}>
                  BR {formatCurrency(resultadoPension.dual.baseReguladora)} \u2192 {formatCurrency(resultadoPension.dual.pensionBrutaMensual)}/mes
                </span>
              </div>

              {resultadoPension.diferenciaMensual > 0 && (
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Diferencia entre f\u00f3rmulas</span>
                  <span className={styles.resultNote}>
                    {formatCurrency(resultadoPension.diferenciaMensual)}/mes a favor de la {resultadoPension.formulaAplicada === 'dual' ? 'ampliada' : 'cl\u00e1sica'}. La SS aplica autom\u00e1ticamente la m\u00e1s favorable.
                  </span>
                </div>
              )}

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Porcentaje por a\u00f1os cotizados</span>
                <span className={styles.resultValue}>{formatNumber(resultadoPension.porcentajeAplicable, 2)}%</span>
              </div>

              <div className={styles.barraProgreso}>
                <div className={styles.barraLabel}>
                  <span>Sobre pensi\u00f3n m\u00e1xima ({formatCurrency(LIMITES_PENSION_2025.maximaMensual)})</span>
                  <span>{formatNumber(resultadoPension.porcentajeSobreMaxima, 1)}%</span>
                </div>
                <div
                  className={styles.barra}
                  role="progressbar"
                  aria-label={`Pensi\u00f3n equivale al ${formatNumber(resultadoPension.porcentajeSobreMaxima, 1)}% de la pensi\u00f3n m\u00e1xima`}
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

        {/* ═══════ SECCI\u00d3N 3: JUBILACI\u00d3N ANTICIPADA (toggle) ═══════ */}
        {calculado && resultadoPension && (
          <div className={styles.toggleSection}>
            <button
              type="button"
              className={`${styles.toggleHeader} ${showAnticipada ? styles.toggleHeaderActive : ''}`}
              onClick={() => setShowAnticipada(!showAnticipada)}
              aria-expanded={showAnticipada}
              aria-controls="seccion-anticipada"
            >
              <span className={styles.toggleIcon} aria-hidden="true">\u23e9</span>
              <span className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>\u00bfPuedo jubilarme antes?</span>
                <span className={styles.toggleSubtitle}>Jubilaci\u00f3n anticipada: requisitos y coeficientes reductores</span>
              </span>
              <span className={`${styles.toggleArrow} ${showAnticipada ? styles.toggleArrowOpen : ''}`} aria-hidden="true">\u25bc</span>
            </button>

            {showAnticipada && (
              <div id="seccion-anticipada" className={styles.toggleContent}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="tipoAnticipada">Tipo de jubilaci\u00f3n anticipada</label>
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
                      ? `Hasta ${maxAnosAnticipada} a\u00f1os antes. Requiere ${REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados} a\u00f1os cotizados.`
                      : `Hasta ${maxAnosAnticipada} a\u00f1os antes. Requiere ${REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados} a\u00f1os cotizados.`}
                  </p>
                </div>

                <NumberInput
                  value={mesesAnticipacion}
                  onChange={setMesesAnticipacion}
                  label={`Meses de anticipaci\u00f3n (m\u00e1x. ${maxAnosAnticipada * 12})`}
                  placeholder={`${maxAnosAnticipada * 6}`}
                  helperText="Meses antes de tu edad de jubilaci\u00f3n ordinaria."
                  min={1}
                  max={maxAnosAnticipada * 12}
                />

                <button type="button" className={styles.btn} onClick={calcularAnticipada} aria-label="Calcular jubilaci\u00f3n anticipada">
                  Calcular anticipada
                </button>

                {resultadoAnticipada && (
                  <div className={styles.resultados} style={{ marginTop: '1.5rem' }}>
                    {resultadoAnticipada.posible ? (
                      <div className={styles.statusOk} role="status">
                        \u2705 En principio, podr\u00edas jubilarte anticipadamente
                      </div>
                    ) : (
                      <div className={styles.statusNok} role="alert">
                        \u274c No cumples los requisitos
                        <br /><small className={styles.smallNormal}>{resultadoAnticipada.motivoImpedimento}</small>
                      </div>
                    )}

                    <div className={styles.requisitosGrid}>
                      <div className={`${styles.requisitoItem} ${resultadoAnticipada.cumpleCotizacion ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoAnticipada.cumpleCotizacion ? '\u2713' : '\u2717'} A\u00f1os cotizados ({tipoAnticipada === 'voluntaria' ? REQUISITOS_ANTICIPADA_VOLUNTARIA.anosMinimoCotizados : REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosMinimoCotizados} req.)
                      </div>
                      <div className={`${styles.requisitoItem} ${resultadoAnticipada.mesesAnticipacion <= resultadoAnticipada.maxMesesPermitidos ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoAnticipada.mesesAnticipacion <= resultadoAnticipada.maxMesesPermitidos ? '\u2713' : '\u2717'} Antelaci\u00f3n (m\u00e1x. {resultadoAnticipada.maxMesesPermitidos} meses)
                      </div>
                      {tipoAnticipada === 'involuntaria' && (
                        <div className={`${styles.requisitoItem} ${styles.requisitoInfo}`}>
                          \u24d8 Adem\u00e1s: al menos {REQUISITOS_ANTICIPADA_INVOLUNTARIA.anosCotizadosEnUltimos15} a\u00f1os cotizados en los \u00faltimos 15 a\u00f1os de vida laboral
                        </div>
                      )}
                    </div>

                    {resultadoAnticipada.posible && (
                      <>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Anticipaci\u00f3n</span>
                          <span className={styles.resultValue}>{resultadoAnticipada.mesesAnticipacion} meses ({resultadoAnticipada.trimestreAnticipacion} trim.)</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Reducci\u00f3n total</span>
                          <span className={styles.resultValueDanger}>-{formatNumber(resultadoAnticipada.reduccionTotal, 2)}%</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Pensi\u00f3n con reducci\u00f3n</span>
                          <span className={styles.resultValueWarning}>{formatCurrency(resultadoAnticipada.pensionConReduccion)}/mes</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>P\u00e9rdida mensual permanente</span>
                          <span className={styles.resultValueDanger}>-{formatCurrency(resultadoAnticipada.perdidaMensual)}/mes</span>
                        </div>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>P\u00e9rdida anual (14 pagas)</span>
                          <span className={styles.resultValueDanger}>-{formatCurrency(resultadoAnticipada.perdidaMensual * 14)}/a\u00f1o</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════ SECCI\u00d3N 4: JUBILACI\u00d3N PARCIAL (toggle) ═══════ */}
        {calculado && resultadoPension && (
          <div className={styles.toggleSection}>
            <button
              type="button"
              className={`${styles.toggleHeader} ${showParcial ? styles.toggleHeaderActive : ''}`}
              onClick={() => setShowParcial(!showParcial)}
              aria-expanded={showParcial}
              aria-controls="seccion-parcial"
            >
              <span className={styles.toggleIcon} aria-hidden="true">\u2696\ufe0f</span>
              <span className={styles.toggleInfo}>
                <span className={styles.toggleTitle}>\u00bfPuedo trabajar y cobrar pensi\u00f3n a la vez?</span>
                <span className={styles.toggleSubtitle}>Jubilaci\u00f3n parcial: combina trabajo a media jornada + pensi\u00f3n</span>
              </span>
              <span className={`${styles.toggleArrow} ${showParcial ? styles.toggleArrowOpen : ''}`} aria-hidden="true">\u25bc</span>
            </button>

            {showParcial && (
              <div id="seccion-parcial" className={styles.toggleContent}>
                <NumberInput
                  value={reduccionJornada}
                  onChange={setReduccionJornada}
                  label={`Reducci\u00f3n de jornada (${req.reduccionJornadaMin}%\u2013${req.reduccionJornadaMax}%)`}
                  placeholder="50"
                  helperText="Porcentaje de tu jornada habitual que dejar\u00e1s de trabajar."
                  min={25}
                  max={75}
                />

                <NumberInput
                  value={salarioBruto}
                  onChange={setSalarioBruto}
                  label="Salario bruto mensual actual (\u20ac/mes)"
                  placeholder="Ej: 2.500"
                  helperText="Tu salario bruto mensual completo (jornada 100%)."
                  min={100}
                  max={50000}
                />

                <button type="button" className={styles.btn} onClick={calcularParcial} aria-label="Calcular jubilaci\u00f3n parcial">
                  Calcular parcial
                </button>

                {resultadoParcial && (
                  <div className={styles.resultados} style={{ marginTop: '1.5rem' }}>
                    {resultadoParcial.posible ? (
                      <div className={styles.statusOk} role="status">
                        \u2705 En principio, podr\u00edas acogerte a la jubilaci\u00f3n parcial
                      </div>
                    ) : (
                      <div className={styles.statusNok} role="alert">
                        \u274c No cumples los requisitos
                        <br /><small className={styles.smallNormal}>{resultadoParcial.motivoImpedimento}</small>
                      </div>
                    )}

                    <div className={styles.requisitosGrid}>
                      <div className={`${styles.requisitoItem} ${resultadoParcial.cumpleEdad ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoParcial.cumpleEdad ? '\u2713' : '\u2717'} Edad (\u2265 {req.edadMinima} a\u00f1os)
                      </div>
                      <div className={`${styles.requisitoItem} ${resultadoParcial.cumpleCotizacion ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoParcial.cumpleCotizacion ? '\u2713' : '\u2717'} Cotizaci\u00f3n (\u2265 {req.anosCotizadosMinimos} a\u00f1os)
                      </div>
                      <div className={`${styles.requisitoItem} ${resultadoParcial.cumpleReduccion ? styles.requisitoOk : styles.requisitoNok}`}>
                        {resultadoParcial.cumpleReduccion ? '\u2713' : '\u2717'} Jornada ({req.reduccionJornadaMin}%\u2013{req.reduccionJornadaMax}%)
                      </div>
                      <div className={`${styles.requisitoItem} ${styles.requisitoOk}`}>
                        \u2139 Contrato de relevo (empleador)
                      </div>
                    </div>

                    {resultadoParcial.posible && (
                      <>
                        <div className={styles.resultItem}>
                          <span className={styles.resultLabel}>Pensi\u00f3n parcial</span>
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
                            <div className={styles.comparativaLabel}>Jubilaci\u00f3n parcial</div>
                            <div className={styles.comparativaValue}>{formatCurrency(resultadoParcial.ingresosTotalesMensual)}</div>
                          </div>
                          <div className={styles.comparativaItem}>
                            <div className={styles.comparativaLabel}>Jubilaci\u00f3n completa</div>
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
            <span aria-hidden="true">\ud83d\udcca</span> Tabla de edad de jubilaci\u00f3n 2024-2027
          </h2>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>A\u00f1o</th>
                <th>Edad ordinaria</th>
                <th>Cotizaci\u00f3n para jubilarse a los 65</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_EDAD_JUBILACION.map(row => (
                <tr key={row.anio} className={row.anio === 2026 ? styles.tablaHighlight : ''}>
                  <td>{row.anio}{row.anio === 2026 ? ' \u2190' : ''}</td>
                  <td>{edadTexto(row.edadSinCotizacion.anios, row.edadSinCotizacion.meses)}</td>
                  <td>{edadTexto(row.cotizacionPara65.anios, row.cotizacionPara65.meses)} cotizados</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Desde 2027 la edad ordinaria se estabiliza en 67 a\u00f1os (o 65 con 38 a\u00f1os y 6 meses cotizados).
          </p>
        </div>

        {/* ═══════ CONTENIDO EDUCATIVO v2.0 ═══════ */}
        <EducationalSection
          title="\ud83d\udcda Todo sobre la jubilaci\u00f3n p\u00fablica en Espa\u00f1a"
          subtitle="Pensi\u00f3n, edad, anticipada, parcial \u2014 Normativa y preguntas frecuentes"
        >
          <h2><span aria-hidden="true">\ud83c\udfaf</span> 4 situaciones frecuentes</h2>

          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>\ud83d\udc69\u200d\ud83d\udcbc</span>
                <strong>Empleada con carrera completa</strong>
              </div>
              <p className={styles.escenarioExample}>Ana, 62 a\u00f1os, 38 a\u00f1os cotizados, base 2.200 \u20ac/mes.</p>
              <p className={styles.escenarioTip}>Con 38 a\u00f1os al 100%, cobra 2.200 \u20ac/mes. Puede jubilarse a los 65 con pensi\u00f3n \u00edntegra.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>\ud83d\udc68\u200d\ud83d\udd27</span>
                <strong>Aut\u00f3nomo con carrera irregular</strong>
              </div>
              <p className={styles.escenarioExample}>Carlos, 64 a\u00f1os, 28 a\u00f1os cotizados. Bases bajas al principio.</p>
              <p className={styles.escenarioTip}>Con 28 a\u00f1os obtiene el 88,75%. Cotizar 2 a\u00f1os m\u00e1s sube al 96,75%.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>\ud83d\udc77</span>
                <strong>Trabajador que quiere anticipar</strong>
              </div>
              <p className={styles.escenarioExample}>Pedro, 63 a\u00f1os, 36 cotizados. Quiere jubilarse 2 a\u00f1os antes.</p>
              <p className={styles.escenarioTip}>Puede anticipar voluntariamente (tiene 35+). Reducci\u00f3n ~6-7% permanente sobre su pensi\u00f3n.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>\u2696\ufe0f</span>
                <strong>Persona que prefiere transici\u00f3n gradual</strong>
              </div>
              <p className={styles.escenarioExample}>Mar\u00eda, 62 a\u00f1os, 35 cotizados. Quiere reducir jornada al 50%.</p>
              <p className={styles.escenarioTip}>Jubilaci\u00f3n parcial: cobra 50% pensi\u00f3n + 50% salario. Sigue cotizando al 100%.</p>
            </div>
          </div>

          <h2><span aria-hidden="true">\u2753</span> Preguntas frecuentes</h2>

          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>\u00bfCu\u00e1ntos a\u00f1os hay que cotizar para cobrar el 100%?</strong>
              <p>En 2025 se necesitan 36 a\u00f1os y 6 meses cotizados. Este requisito aumenta gradualmente hasta los 37 a\u00f1os en 2027.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfQu\u00e9 es el sistema dual de pensiones 2026?</strong>
              <p>Desde enero de 2026, la SS calcula tu pensi\u00f3n con dos f\u00f3rmulas (cl\u00e1sica de 25 a\u00f1os y ampliada) y aplica autom\u00e1ticamente la m\u00e1s favorable. Beneficia especialmente a trabajadores con lagunas o salarios variables.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfPuedo jubilarme antes de la edad ordinaria?</strong>
              <p>S\u00ed: anticipada voluntaria (hasta 2 a\u00f1os antes, 35+ a\u00f1os cotizados) o involuntaria (hasta 4 a\u00f1os, 33+ cotizados). Ambas implican coeficientes reductores permanentes.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfLa reducci\u00f3n por anticipada es permanente?</strong>
              <p>S\u00ed, se mantiene toda la vida. Un -10% de reducci\u00f3n se aplica durante toda la jubilaci\u00f3n. El punto de equilibrio suele estar entre 10-15 a\u00f1os.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfQu\u00e9 es la jubilaci\u00f3n parcial?</strong>
              <p>Permite reducir la jornada entre 25% y 75% a partir de los 60 a\u00f1os, combinando salario y pensi\u00f3n parcial. Requiere contrato de relevo y acuerdo con el empleador.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfPuedo trabajar y cobrar pensi\u00f3n a la vez?</strong>
              <p>S\u00ed: jubilaci\u00f3n parcial (salario + pensi\u00f3n proporcional) o jubilaci\u00f3n activa (50% pensi\u00f3n, 100% si aut\u00f3nomo con empleado).</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfC\u00f3mo consulto mis a\u00f1os cotizados?</strong>
              <p>En la Sede Electr\u00f3nica de la Seguridad Social (importass.seg-social.es) puedes descargar tu informe de vida laboral.</p>
              <p className={styles.faqTip}>\ud83d\udca1 Verifica la vida laboral antes de hacer planes \u2014 puede haber sorpresas.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>\u00bfCu\u00e1ndo ser\u00e1 definitiva la edad de 67 a\u00f1os?</strong>
              <p>En 2027. Desde ese a\u00f1o, la edad ordinaria es 67 a\u00f1os (o 65 con 38 a\u00f1os y 6 meses). No hay m\u00e1s escalones previstos.</p>
            </li>
          </ul>

          <h2><span aria-hidden="true">\ud83d\udcdd</span> C\u00f3mo preparar tu jubilaci\u00f3n paso a paso</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Consulta tu vida laboral</strong>
                <p>Descarga el informe en importass.seg-social.es. Verifica a\u00f1os cotizados y posibles lagunas.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Calcula tu edad y pensi\u00f3n</strong>
                <p>Usa este simulador para obtener tu edad de jubilaci\u00f3n y pensi\u00f3n estimada con el sistema dual 2026.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Valora la anticipada o parcial</strong>
                <p>Si cumples requisitos, compara la pensi\u00f3n reducida o parcial con la ordinaria. Calcula el punto de equilibrio.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Calcula la brecha</strong>
                <p>Compara tu sueldo actual con la pensi\u00f3n estimada. Si la diferencia es grande, planifica ahorro complementario.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Solicita cita previa</strong>
                <p>Presenta la solicitud en el INSS con 3-6 meses de antelaci\u00f3n a la fecha prevista de jubilaci\u00f3n.</p>
              </div>
            </div>
          </div>

          <h2><span aria-hidden="true">\ud83d\udca1</span> Consejos clave</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udccb</span>
              <strong>Revisa la vida laboral cada a\u00f1o</strong>
              <p>Un a\u00f1o no cotizado mal registrado puede costar 1-2% de pensi\u00f3n vitalicia.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udcc5</span>
              <strong>Planifica con 10 a\u00f1os</strong>
              <p>A los 55 ya puedes proyectar tu pensi\u00f3n con precisi\u00f3n y ajustar estrategias.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udca1</span>
              <strong>Maximiza bases finales</strong>
              <p>Los \u00faltimos 25 a\u00f1os definen tu base reguladora. Prioriza cotizar alto al final.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\u2696\ufe0f</span>
              <strong>Eval\u00faa el break-even</strong>
              <p>Si anticipas 2 a\u00f1os, necesitas ~15-20 a\u00f1os para compensar la reducci\u00f3n.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udd0d</span>
              <strong>Convenios internacionales</strong>
              <p>Per\u00edodos cotizados en pa\u00edses con convenio bilateral pueden sumarse.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipCardIcon}>\ud83d\udcca</span>
              <strong>Simulador oficial de la SS</strong>
              <p>Ofrece estimaciones personalizadas m\u00e1s precisas con tu historial real.</p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>\u26a0\ufe0f</span>
              <strong>Errores frecuentes al planificar la jubilaci\u00f3n</strong>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Creer que la edad es siempre 65 a\u00f1os:</strong> En 2026 es 66 a\u00f1os y 10 meses sin cotizaci\u00f3n suficiente.</li>
              <li><strong>No verificar la vida laboral:</strong> Muchas personas descubren lagunas o errores solo al solicitar la pensi\u00f3n.</li>
              <li><strong>Confundir a\u00f1os cotizados con a\u00f1os trabajados:</strong> El paro sin prestaci\u00f3n no cotiza y genera lagunas.</li>
              <li><strong>Calcular sobre sueldo bruto:</strong> Horas extra y complementos no siempre cotizan igual que el salario base.</li>
              <li><strong>Ignorar el impacto del IRPF:</strong> Las pensiones tributan como rendimientos del trabajo (retenciones del 8-15%).</li>
              <li><strong>No considerar la pensi\u00f3n m\u00ednima:</strong> Si tu pensi\u00f3n calculada queda por debajo del m\u00ednimo, se complementa autom\u00e1ticamente.</li>
              <li><strong>No agotar desempleo antes de anticipar:</strong> A veces es m\u00e1s rentable cobrar el desempleo completo primero.</li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-jubilacion-publica')} />
        <ShareCard appName="simulador-jubilacion-publica" />
        <Footer appName="simulador-jubilacion-publica" />
      </div>
    </>
  );
}
