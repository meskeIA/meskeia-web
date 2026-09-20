'use client';

import { useState } from 'react';
import styles from './EstimadorIrpfPensionista.module.css';
import { MeskeiaLogo, LegalNotice, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  FISCAL_IRPF_META,
  cuotaEscalaGeneral,
  calcularCuotaIntegraGeneral,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  OBLIGACION_DECLARAR_2025,
  calcularReduccionRendimientosTrabajo,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TramoEdad = 'menos65' | '65_74' | '75_mas';

interface ResultadoIrpfPensionista {
  /** Pensión anual + rescate del plan. NO incluye las rentas ajenas al trabajo. */
  rendimientosIntegrosTrabajo: number;
  /** Rescate del plan de pensiones declarado, ya incluido en el íntegro del trabajo. */
  rescatePP: number;
  /** Rentas de la base general distintas del trabajo (alquileres, intereses…). */
  otrasRentas: number;
  /** Suma de las dos anteriores. Es la que gradúa el tipo efectivo. */
  ingresosTotales: number;
  gastosDeducibles: number;
  rendimientosNetos: number;
  reduccionRRT: number;
  /** `true` cuando las otras rentas pasan del límite del art. 20 y la reducción no procede. */
  reduccionBloqueadaPorOtrasRentas: boolean;
  rendimientosNetosReducidos: number;
  minimoPersonal: number;
  baseImponible: number;
  cuotaBase: number;
  cuotaMinimo: number;
  cuotaIRPF: number;
  tipoEfectivo: number;
  pensionNetaMensual: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

/** Escala del art. 63 LIRPF. La cuota integra la pone `calcularCuotaIntegraGeneral`. */
const calcularCuotaIRPF = cuotaEscalaGeneral;

/**
 * Techo de rentas DISTINTAS de las del trabajo por encima del cual la reducción del art. 20
 * LIRPF deja de proceder: 6.500 € (redacción del RDL 4/2024).
 *
 * `data/fiscal/irpf.ts` lo advierte expresamente en la cabecera de
 * `REDUCCION_RENDIMIENTOS_TRABAJO_2025` — «esa condición no la modela este módulo: quien la
 * necesite debe comprobarla antes de llamar a `calcularReduccionRendimientosTrabajo`»— y es
 * lo que esta app no hacía hasta el 20/09/2026: con 11.200 € de pensión y 7.000 € de
 * alquileres aplicaba 4.943 € de reducción improcedente y publicaba 1.126,67 € de cuota de
 * menos.
 *
 * El importe sale de `REDUCCION_RENDIMIENTOS_TRABAJO_2025.limiteOtrasRentas`, la constante
 * del PROPIO art. 20. Durante unas horas del 20/09/2026 se tomó prestado el umbral homónimo
 * de `DEDUCCION_RENTAS_BAJAS_2025` (art. 80 bis), porque era el único importable y coincide
 * en 6.500 €: son dos artículos distintos, y si uno se moviera y el otro no, la app habría
 * publicado la cifra equivocada sin que nada avisara. El dato ya tiene constante propia.
 */
const LIMITE_OTRAS_RENTAS_ART_20 = REDUCCION_RENDIMIENTOS_TRABAJO_2025.limiteOtrasRentas;

/**
 * Lo que el mínimo por edad añade sobre el general, para la tabla comparativa. Son los
 * incrementos del art. 57.2 y 57.3 LIRPF, deducidos de los propios mínimos en vez de escritos
 * a mano: así no pueden divergir del total que la misma fila publica.
 *
 * minimo-ok: es la DIFERENCIA entre dos mínimos del art. 57 para enseñarla en pantalla, no una
 * resta del mínimo contra la base — el cálculo real lo hace `calcularCuotaIntegraGeneral`.
 */
const ADICIONAL_MINIMO_65 = MINIMOS_IRPF_2025.personal_65 - MINIMOS_IRPF_2025.personal;  // minimo-ok: diferencia entre dos mínimos del art. 57 para enseñarla en pantalla, no una resta contra la base
/** minimo-ok: ídem para el tramo de 75 años o más (art. 57.3 LIRPF). */
const ADICIONAL_MINIMO_75 = MINIMOS_IRPF_2025.personal_75 - MINIMOS_IRPF_2025.personal;  // minimo-ok: ídem, art. 57.3 LIRPF

/** Rango admisible de cada campo. Lo usan la guarda y el texto del aviso, para que no divirjan. */
const LIMITES = {
  pension: { min: 100, max: 10000 },
  rescate: { min: 0, max: 500000 },
  otrasRentas: { min: 0, max: 100000 },
} as const;

/** «entre 100 y 10.000 €», con los mismos números que aplica la guarda. */
function textoRango(rango: { min: number; max: number }): string {
  return `entre ${formatNumber(rango.min, 0)} y ${formatNumber(rango.max, 0)} €`;
}

function calcularReduccionRRT(rnt: number): number {
  return calcularReduccionRendimientosTrabajo(rnt);
}

function minimoPersonalPorEdad(tramo: TramoEdad): number {
  if (tramo === '75_mas') return MINIMOS_IRPF_2025.personal_75;
  if (tramo === '65_74') return MINIMOS_IRPF_2025.personal_65;
  return MINIMOS_IRPF_2025.personal;
}

function estimarIrpfPensionista(
  pensionMensual: number,
  rescatePP: number,
  otrasRentas: number,
  tramo: TramoEdad
): ResultadoIrpfPensionista {
  // Pensión con 14 pagas para cálculo anual IRPF
  const pensionAnual = pensionMensual * 14;

  // Rendimientos ÍNTEGROS DEL TRABAJO: la pensión y el rescate del plan, que el art. 17.2.a.3.ª
  // LIRPF califica como rendimiento del trabajo. Las rentas ajenas al trabajo NO entran aquí.
  //
  // Hasta el 20/09/2026 sí entraban, y el defecto no era cosmético: al engordar el rendimiento
  // NETO del trabajo rebajaban la reducción del art. 20, que se gradúa justo por ese
  // rendimiento. Un alquiler hacía así de menos una reducción que la ley calcula sin él.
  const rendimientosIntegrosTrabajo = pensionAnual + rescatePP;
  const ingresosTotales = rendimientosIntegrosTrabajo + otrasRentas;

  // Gastos deducibles generales (art. 19.2.f)
  const gastosDeducibles = GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral;

  // Rendimientos netos del trabajo
  const rendimientosNetos = Math.max(0, rendimientosIntegrosTrabajo - gastosDeducibles);

  // Reducción del art. 20, que exige no tener rentas ajenas al trabajo por encima del límite.
  const reduccionBloqueadaPorOtrasRentas = otrasRentas > LIMITE_OTRAS_RENTAS_ART_20;
  const reduccionRRT = reduccionBloqueadaPorOtrasRentas ? 0 : calcularReduccionRRT(rendimientosNetos);

  // Rendimiento neto reducido del trabajo
  const rendimientosNetosReducidos = Math.max(0, rendimientosNetos - reduccionRRT);

  // Mínimo personal según edad
  const minimoPersonal = minimoPersonalPorEdad(tramo);

  // Base imponible general: el rendimiento del trabajo ya reducido MÁS las otras rentas, que
  // se integran en la base general por su importe neto pero nunca en el RNT.
  const baseImponible = rendimientosNetosReducidos + otrasRentas;

  // Cuota integra (art. 63.1.2 LIRPF): escala sobre la base completa menos escala sobre el
  // minimo. Desde el 12/09/2026 la resta la hace data/fiscal/irpf.ts, que ademas acota el
  // minimo a la base: con una pension por debajo del minimo, la escala aplicada al minimo
  // entero devolvia mas cuota de la que hay que gravar, y solo el Math.max(0) lo tapaba.
  const cuotaBase = calcularCuotaIRPF(baseImponible);
  const cuotaMinimo = calcularCuotaIRPF(Math.min(minimoPersonal, baseImponible));
  const cuotaIRPF = calcularCuotaIntegraGeneral(baseImponible, minimoPersonal);

  const tipoEfectivo = ingresosTotales > 0 ? (cuotaIRPF / ingresosTotales) * 100 : 0;

  // Pensión neta mensual (resta el IRPF anual dividido por 14 pagas)
  const irpfMensual = cuotaIRPF / 14;
  const pensionNetaMensual = Math.max(0, pensionMensual - irpfMensual);

  return {
    rendimientosIntegrosTrabajo,
    rescatePP,
    otrasRentas,
    ingresosTotales,
    gastosDeducibles,
    rendimientosNetos,
    reduccionRRT,
    reduccionBloqueadaPorOtrasRentas,
    rendimientosNetosReducidos,
    minimoPersonal,
    baseImponible,
    cuotaBase,
    cuotaMinimo,
    cuotaIRPF,
    tipoEfectivo,
    pensionNetaMensual,
  };
}

/**
 * Un escenario del bloque educativo, resuelto por el MISMO motor que la calculadora.
 *
 * Existe para que los ejemplos no puedan volver a divergir de la norma: hasta el 20/09/2026
 * el escenario de pensión única publicaba «19.000 − 5.565 = 13.435 €», con una reducción de
 * la redacción del art. 20 anterior a 2023 y sin los 2.000 € de gastos del art. 19.2.f.
 *
 * @param integrosTrabajoAnuales Rendimientos íntegros del trabajo del ejemplo (€/año).
 */
function escenarioAnual(
  integrosTrabajoAnuales: number,
  otrasRentas: number,
  tramo: TramoEdad
): ResultadoIrpfPensionista {
  return estimarIrpfPensionista(integrosTrabajoAnuales / 14, 0, otrasRentas, tramo);
}

/** Escenarios del bloque educativo. Los importes de ejemplo son del ejemplo; el cálculo, de la norma. */
const ESC_PENSION_UNICA = escenarioAnual(19000, 0, '65_74');
const ESC_PENSION_ALQUILER = escenarioAnual(14000, 6000, '65_74');
const ESC_RESCATE_PP = estimarIrpfPensionista(15000 / 14, 30000, 0, '65_74');

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorIrpfPensionista() {
  const [pensionMensual, setPensionMensual] = useState('');
  const [rescatePP, setRescatePP] = useState('0');
  const [otrasRentasAnuales, setOtrasRentasAnuales] = useState('0');
  const [tramo, setTramo] = useState<TramoEdad>('65_74');
  const [resultado, setResultado] = useState<ResultadoIrpfPensionista | null>(null);
  const [error, setError] = useState('');

  /** Rechaza con aviso y retira cualquier resultado anterior: o se calcula, o no hay número. */
  function rechazar(mensaje: string) {
    setResultado(null);
    setError(mensaje);
  }

  /** Un campo opcional vacío vale 0; lo que no es un número NO vale 0, se rechaza. */
  function leerCampoOpcional(valor: string): number {
    return valor.trim() === '' ? 0 : parseSpanishNumber(valor);
  }

  function calcular() {
    setError('');

    // El parser canónico del proyecto. Hasta el 20/09/2026 aquí había un
    // parser-ok: la línea de abajo CITA la forma vieja para explicarla, no la ejecuta
    // `parseFloat(x.replace(',', '.'))`, que leía el separador de MILLAR español como coma
    // decimal: un rescate escrito «30.000» valía 30 €, la cuota salía 0,00 € en vez de
    // 10.738,50 € y el campo ni siquiera se reescribía, así que nada lo delataba.
    const pension = parseSpanishNumber(pensionMensual);
    const rescate = leerCampoOpcional(rescatePP);
    const otrasRentas = leerCampoOpcional(otrasRentasAnuales);

    // `parseSpanishNumber` devuelve NaN con lo que no es un número («1.2.3», «12abc»). Un NaN
    // NO puede colarse como 0: en una app fiscal eso es publicar un supuesto que nadie escribió.
    if (Number.isNaN(pension) || pension < LIMITES.pension.min || pension > LIMITES.pension.max) {
      rechazar(`Introduce tu pensión mensual bruta (${textoRango(LIMITES.pension)}).`);
      return;
    }
    if (Number.isNaN(rescate) || rescate < LIMITES.rescate.min || rescate > LIMITES.rescate.max) {
      rechazar(`El rescate de plan de pensiones debe ser un importe ${textoRango(LIMITES.rescate)}.`);
      return;
    }
    if (Number.isNaN(otrasRentas) || otrasRentas < LIMITES.otrasRentas.min || otrasRentas > LIMITES.otrasRentas.max) {
      rechazar(`Las otras rentas anuales deben ser un importe ${textoRango(LIMITES.otrasRentas)}.`);
      return;
    }

    setResultado(estimarIrpfPensionista(pension, rescate, otrasRentas, tramo));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Estimador IRPF Pensionista</h1>
        <p className={styles.subtitle}>Cuánto pagas de renta siendo jubilado y cuál es tu pensión neta real · 2026</p>
      </header>

      <RegionBadge variant="es-only" />


      <LegalNotice />

      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Esta herramienta es SOLO orientativa. El IRPF real depende de toda tu situación personal, familiar y de las deducciones autonómicas.
          <br /><strong>No es</strong> asesoramiento fiscal personalizado ni sustituye a la declaración de la renta.
          <br />Los cálculos aplican tramos estatales + autonómicos medios. Cada comunidad autónoma puede tener variaciones. Datos IRPF {FISCAL_IRPF_META.vigencia}.
          <br /><strong>Consulta con la Agencia Tributaria o un asesor fiscal</strong> antes de tomar decisiones.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <DataReference
        normativa={`IRPF ${FISCAL_IRPF_META.vigencia}`}
        fuente={FISCAL_IRPF_META.fuente}
        verificado={FISCAL_IRPF_META.verificado}
        urlOficial={FISCAL_IRPF_META.urlOficial}
        nota={FISCAL_IRPF_META.nota}
      />

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tus datos</h2>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="tramoEdad">Tu edad</label>
            <select
              id="tramoEdad"
              className={styles.select}
              value={tramo}
              onChange={e => setTramo(e.target.value as TramoEdad)}
            >
              <option value="menos65">Menos de 65 años</option>
              <option value="65_74">Entre 65 y 74 años</option>
              <option value="75_mas">75 años o más</option>
            </select>
            <p className={styles.hint}>
              {tramo === '75_mas'
                ? `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal_75)}`
                : tramo === '65_74'
                  ? `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal_65)}`
                  : `Mínimo personal aplicable: ${formatCurrency(MINIMOS_IRPF_2025.personal)}`}
            </p>
          </div>

          {/*
            Los tres campos van con `acotarAlSalir={false}`. Por defecto `NumberInput` reescribe
            al límite más próximo cualquier valor fuera de rango al perder el foco, y el foco se
            pierde JUSTO al pulsar el botón: la guarda de `calcular()` recibía siempre un valor ya
            dentro del rango y no rechazaba nunca. Teclear «12» publicaba la pensión neta de
            100 €/mes sin una palabra. Aquí el límite no es un valor neutro —es un supuesto
            fiscal—, así que el dato se queda como se escribió y la app lo rechaza y lo dice.
          */}
          <NumberInput
            value={pensionMensual}
            onChange={setPensionMensual}
            label="Pensión mensual bruta (€/mes)"
            placeholder="Ej: 1.400"
            helperText="El importe bruto mensual que recibes de la Seguridad Social (antes de IRPF). Puedes escribirlo con punto de millar: 1.400."
            min={LIMITES.pension.min}
            max={LIMITES.pension.max}
            acotarAlSalir={false}
          />

          <NumberInput
            value={rescatePP}
            onChange={setRescatePP}
            label="Rescate de plan de pensiones este año (€)"
            placeholder="0"
            helperText="Si rescatas un plan de pensiones, se suma como rendimiento del trabajo. Pon 0 si no aplica."
            min={LIMITES.rescate.min}
            max={LIMITES.rescate.max}
            acotarAlSalir={false}
          />

          <NumberInput
            value={otrasRentasAnuales}
            onChange={setOtrasRentasAnuales}
            label="Otras rentas anuales distintas del trabajo (€/año)"
            placeholder="0"
            helperText={`Alquileres, intereses o dividendos, por su importe neto anual. NO pongas aquí pensiones ni sueldos: esos son rendimientos del trabajo. Por encima de ${formatCurrency(LIMITE_OTRAS_RENTAS_ART_20)} decae la reducción del art. 20. Pon 0 si no aplica.`}
            min={LIMITES.otrasRentas.min}
            max={LIMITES.otrasRentas.max}
            acotarAlSalir={false}
          />

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Estimar IRPF pensionista">
            Estimar mi IRPF como pensionista
          </button>
        </div>

        {/* Resultados */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estimación orientativa IRPF</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce tus datos y pulsa el botón para estimar tu IRPF como pensionista.
            </p>
          ) : (
            <div className={styles.resultados}>
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Rendimientos íntegros del trabajo (anuales)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.rendimientosIntegrosTrabajo)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Gastos deducibles generales</span>
                <span className={styles.resultValue}>-{formatCurrency(resultado.gastosDeducibles)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Reducción por rendimientos del trabajo</span>
                <span className={styles.resultValue}>-{formatCurrency(resultado.reduccionRRT)}</span>
              </div>

              {resultado.reduccionBloqueadaPorOtrasRentas && (
                <p className={styles.resultNota}>
                  Tus rentas distintas del trabajo superan {formatCurrency(LIMITE_OTRAS_RENTAS_ART_20)},
                  así que la reducción del art. 20 LIRPF no procede y se ha aplicado {formatCurrency(0)}.
                </p>
              )}

              {resultado.otrasRentas > 0 && (
                <div className={styles.resultItem}>
                  <span className={styles.resultLabel}>Otras rentas distintas del trabajo</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.otrasRentas)}</span>
                </div>
              )}

              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>Base imponible estimada</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.baseImponible)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Mínimo personal (edad)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.minimoPersonal)}</span>
              </div>

              <div className={styles.divider} />

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Cuota IRPF estimada anual</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.cuotaIRPF)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Tipo efectivo estimado</span>
                <span className={styles.resultValue}>{formatNumber(resultado.tipoEfectivo, 1)}%</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                <span className={styles.resultLabel}>Pensión neta mensual estimada</span>
                <span className={styles.resultValueBig}>{formatCurrency(resultado.pensionNetaMensual)}/mes</span>
              </div>

              {(resultado.otrasRentas > 0 || resultado.rescatePP > 0) && (
                <p className={styles.resultNota}>
                  La cuota es la de TODAS las rentas declaradas ({formatCurrency(resultado.ingresosTotales)} en
                  total), no solo la de la pensión: la pensión neta de arriba les carga también su
                  parte del impuesto, así que en un año con rescate o con alquileres es un suelo,
                  no lo que cobrarás cada mes.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo tributa la pensión en el IRPF?" subtitle="Rendimientos del trabajo, reducciones y mínimos para jubilados · 2026">
        <p>La pensión pública de jubilación tributa como <strong>rendimiento del trabajo</strong>, igual que un salario. Sin embargo, los pensionistas tienen ventajas fiscales específicas que reducen su factura.</p>
        <h3>Reducción por rendimientos del trabajo</h3>
        <p>Si tus únicos ingresos son la pensión, aplica una reducción en función de tu renta neta:</p>
        <ul>
          <li>Renta neta ≤ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)}: reducción de {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)}</li>
          <li>Entre {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} y {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: reducción decreciente, en dos tramos</li>
          <li>Renta neta ≥ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: <strong>sin reducción</strong> — esta reducción se agota, no deja importe residual</li>
        </ul>
        <h3>Mínimo personal por edad</h3>
        <p>El mínimo personal genera una deducción efectiva sobre la cuota:</p>
        <ul>
          <li>General (hasta 65 años): {formatCurrency(MINIMOS_IRPF_2025.personal)}</li>
          <li>De 65 a 74 años: {formatCurrency(MINIMOS_IRPF_2025.personal_65)}</li>
          <li>75 años o más: {formatCurrency(MINIMOS_IRPF_2025.personal_75)}</li>
        </ul>
        <h3>Rescate del plan de pensiones</h3>
        <p>El rescate se suma íntegramente a los rendimientos del trabajo. Un rescate grande en forma de capital puede subir tu tipo marginal significativamente. Generalmente conviene rescatar en renta mensual para suavizar el impacto fiscal.</p>
        <h3>¿Quién está obligado a declarar?</h3>
        <p>
          Los pensionistas con un solo pagador y rendimientos del trabajo por debajo
          de {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.unPagador)} al año no están obligados a
          presentar declaración (salvo que tengan otras fuentes de renta). Con varios pagadores y un
          segundo que supere {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)},
          el límite baja a {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores)} al año.
        </p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Reducciones y mínimos aplicables a pensionistas (2026)</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Importe</th>
              <th>Condición</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Reducción rendimientos trabajo (art. 20, máxima)</td>
              <td>{formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)} (RNT ≤ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)})</td>
              <td>Rentas ajenas al trabajo ≤ {formatCurrency(LIMITE_OTRAS_RENTAS_ART_20)}</td>
            </tr>
            <tr>
              <td>Reducción rendimientos trabajo (art. 20, decreciente)</td>
              <td>De {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)} a {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion2)}</td>
              <td>RNT entre {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} y {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}</td>
            </tr>
            <tr>
              <td>Reducción rendimientos trabajo (art. 20, agotada)</td>
              <td>{formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion2)} — no deja importe residual</td>
              <td>RNT ≥ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}</td>
            </tr>
            <tr>
              <td>Gastos deducibles generales (art. 19.2.f)</td>
              <td>{formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)}</td>
              <td>Todo perceptor de rendimientos del trabajo</td>
            </tr>
            <tr>
              <td>Mínimo personal general</td>
              <td>{formatCurrency(MINIMOS_IRPF_2025.personal)}</td>
              <td>Todos los contribuyentes</td>
            </tr>
            <tr>
              <td>Mínimo por edad ≥65 años</td>
              <td>{formatCurrency(ADICIONAL_MINIMO_65)} adicionales (total {formatCurrency(MINIMOS_IRPF_2025.personal_65)})</td>
              <td>65 años o más a 31/12</td>
            </tr>
            <tr>
              <td>Mínimo por edad ≥75 años</td>
              <td>{formatCurrency(ADICIONAL_MINIMO_75)} adicionales (total {formatCurrency(MINIMOS_IRPF_2025.personal_75)})</td>
              <td>75 años o más a 31/12</td>
            </tr>
            <tr>
              <td>Límite obligación de declarar (un pagador)</td>
              <td>{formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.unPagador)}</td>
              <td>Un solo pagador (pensión)</td>
            </tr>
            <tr>
              <td>Límite obligación de declarar (dos pagadores)</td>
              <td>{formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores)} (si 2º pagador &gt; {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)})</td>
              <td>Pensión + otro pagador</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        {/*
          Los cuatro escenarios salen de `escenarioAnual`, es decir del MISMO motor que la
          calculadora. Antes iban escritos a mano y el primero publicaba una reducción de
          5.565 € que corresponde a la redacción del art. 20 anterior a 2023.
        */}
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
            <strong>Pensionista con pensión única</strong>
          </div>
          <p>68 años, pensión de {formatCurrency(ESC_PENSION_UNICA.rendimientosIntegrosTrabajo)}/año. Un solo pagador. Gastos del art. 19.2.f, reducción del art. 20 y mínimo por edad.</p>
          <div className={styles.escenarioExample}>
            {formatCurrency(ESC_PENSION_UNICA.rendimientosIntegrosTrabajo)} − {formatCurrency(ESC_PENSION_UNICA.gastosDeducibles)} (gastos) − {formatCurrency(ESC_PENSION_UNICA.reduccionRRT)} (reducción art. 20) = {formatCurrency(ESC_PENSION_UNICA.baseImponible)} de base → cuota {formatCurrency(ESC_PENSION_UNICA.cuotaIRPF)}
          </div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Si la retención aplicada es exacta, puede no ser obligatorio declarar aunque conviene hacerlo para verificar.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">👵</span>
            <strong>Pensionista con pensión + alquiler</strong>
          </div>
          <p>72 años, pensión {formatCurrency(ESC_PENSION_ALQUILER.rendimientosIntegrosTrabajo)} + alquiler {formatCurrency(ESC_PENSION_ALQUILER.otrasRentas)}/año ya neto de gastos. El alquiler va a la base general, pero NO es rendimiento del trabajo: no entra en el RNT que gradúa la reducción del art. 20.</p>
          <div className={styles.escenarioExample}>
            Base {formatCurrency(ESC_PENSION_ALQUILER.baseImponible)} → cuota {formatCurrency(ESC_PENSION_ALQUILER.cuotaIRPF)}. El alquiler no llega a {formatCurrency(LIMITE_OTRAS_RENTAS_ART_20)}, así que la reducción del art. 20 se mantiene ({formatCurrency(ESC_PENSION_ALQUILER.reduccionRRT)})
          </div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> El límite de {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.unPagador)} mira solo los rendimientos del trabajo; el alquiler tiene sus propios umbrales en el art. 96, y conviene comprobarlos aparte.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">💑</span>
            <strong>Matrimonio con dos pensiones</strong>
          </div>
          <p>Él cobra 18.000 €, ella 8.000 €. Cada uno tributa individualmente. Evaluar si la declaración conjunta ({formatCurrency(REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental)} de reducción en la base) es más beneficiosa.</p>
          <div className={styles.escenarioExample}>Individual vs conjunto: depende de la diferencia entre pensiones y tramos aplicables</div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Esa reducción va contra la BASE, así que se valora al tipo marginal — al revés que los mínimos del art. 57, que se gravan a tipo cero por la vía del art. 63.1.2.º.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏦</span>
            <strong>Pensionista con plan de pensiones rescatado</strong>
          </div>
          <p>Rescata {formatCurrency(ESC_RESCATE_PP.rescatePP)} del plan en el año de jubilación. Se suma a la pensión pública como rendimiento del trabajo y puede disparar el tramo marginal.</p>
          <div className={styles.escenarioExample}>
            Pensión {formatCurrency(ESC_RESCATE_PP.rendimientosIntegrosTrabajo - ESC_RESCATE_PP.rescatePP)} + rescate {formatCurrency(ESC_RESCATE_PP.rescatePP)} = {formatCurrency(ESC_RESCATE_PP.rendimientosIntegrosTrabajo)} → reducción art. 20 {formatCurrency(ESC_RESCATE_PP.reduccionRRT)} y cuota {formatCurrency(ESC_RESCATE_PP.cuotaIRPF)}
          </div>
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Rescatar el PP en años posteriores con menos ingresos puede ser fiscalmente más eficiente.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre el IRPF del pensionista</h3>
        <div className={styles.faqItem}>
          <strong>¿Las pensiones públicas siempre tributan?</strong>
          <p>Las pensiones del sistema público de SS tributan como rendimiento del trabajo. Existen exenciones totales solo para pensiones de incapacidad permanente absoluta o gran invalidez.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuándo estoy obligado a declarar siendo pensionista?</strong>
          <p>
            Con un solo pagador (solo pensión pública): obligatorio si los rendimientos del trabajo
            superan {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.unPagador)}. Con dos pagadores y
            un segundo que pase de {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)}:
            obligatorio si el total supera {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores)}.
          </p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿La pensión de viudedad también tributa?</strong>
          <p>Sí, la pensión de viudedad tributa como rendimiento del trabajo igual que la pensión de jubilación. Se suma al resto de ingresos del ejercicio.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo deducir gastos médicos como pensionista?</strong>
          <p>No existe deducción estatal general por gastos médicos. Algunas comunidades autónomas tienen deducciones específicas por enfermedad crónica, discapacidad o cuidados.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es el mínimo personal por edad?</strong>
          <p>
            Es la parte de la renta que se grava a tipo CERO para proteger la subsistencia del
            contribuyente mayor. A partir de 65 años sube
            a {formatCurrency(MINIMOS_IRPF_2025.personal_65)} y a partir de 75
            a {formatCurrency(MINIMOS_IRPF_2025.personal_75)}. No se resta de la base: el art. 63.1.2.º
            LIRPF aplica la escala dos veces —a la base completa y al mínimo— y resta la segunda cuota
            de la primera, así que el mínimo se valora a los tipos bajos de la escala. Para 75 años o
            más eso son {formatCurrency(cuotaEscalaGeneral(MINIMOS_IRPF_2025.personal_75))} de cuota
            anulada.
          </p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Conviene declarar aunque no esté obligado?</strong>
          <p>Sí puede convenir si la retención aplicada ha sido excesiva y puedes obtener devolución. También si tienes deducciones autonómicas o por inversión en vivienda habitual previa a 2013.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo afecta la discapacidad al IRPF del pensionista?</strong>
          <p>
            Lo que la discapacidad añade a un pensionista son MÍNIMOS adicionales: {formatCurrency(MINIMOS_IRPF_2025.discapacidad_33_65)} con
            grado entre el 33 % y el 65 %, y {formatCurrency(MINIMOS_IRPF_2025.discapacidad_65_mas)} desde
            el 65 %. Este estimador no los modela, así que con discapacidad reconocida su cuota es un
            techo, no la cifra definitiva.
          </p>
          <p>
            El gasto deducible incrementado del art. 19.2.f que a veces se cita aquí es otra cosa y
            <strong> no aplica a un pensionista</strong>: es un gasto, no la reducción del art. 20, y la
            ley lo reserva a los trabajadores en ACTIVO con discapacidad, condición que la jubilación
            no cumple.
          </p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Pueden los hijos incluirme como ascendiente a cargo?</strong>
          <p>Sí, si convives con ellos, tienes más de 65 años (o cualquier edad con discapacidad ≥33%), y no obtienes rentas superiores a 8.000 € anuales, tus hijos pueden aplicar el mínimo por ascendientes.</p>
          <div className={styles.faqTip}><span aria-hidden="true">💡</span> En este caso tú no puedes presentar declaración conjunta con tus hijos, pero ellos sí pueden aplicar ese mínimo.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo preparar la declaración IRPF siendo pensionista</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Reúne los datos de la pensión</strong>
            <p>Solicita el certificado de retenciones al INSS (disponible en sede.seg-social.gob.es). Incluye el importe bruto anual y las retenciones practicadas.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Identifica todos tus ingresos</strong>
            <p>Pensión pública, pensión complementaria, rentas de alquiler, dividendos, intereses, rescate de planes de pensiones. Cada uno tributa según su categoría.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Verifica las reducciones aplicables</strong>
            <p>Reducción por rendimientos del trabajo según tu nivel de renta, mínimo personal por edad (65 o 75 años), mínimos familiares si proceden.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Revisa deducciones autonómicas</strong>
            <p>Cada CCAA tiene deducciones propias para mayores: gastos por cuidados, alquiler de vivienda, discapacidad, etc. Consulta las de tu comunidad.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Compara individual vs conjunta</strong>
            <p>Si estás casado, usa el simulador de la AEAT para ver cuál modalidad resulta más favorable. La diferencia puede ser de varios cientos de euros.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Presenta antes del 30 de junio</strong>
            <p>El plazo es del 2 de abril al 30 de junio. Si sale a pagar y domicilias el pago, puedes presentar hasta el 25 de junio. Las prórrogas son muy limitadas.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📋</div>
          <strong>Solicita el certificado de retenciones en enero</strong>
          <p>El INSS lo envía automáticamente, pero puedes descargarlo en la web de SS. Tenerlo pronto facilita la preparación de la declaración.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🔍</div>
          <strong>Revisa el borrador con atención</strong>
          <p>El borrador de la AEAT puede no incluir todas tus deducciones autonómicas o el mínimo por edad correcto. Siempre verificar antes de confirmar.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">💰</div>
          <strong>Ajusta la retención de la pensión</strong>
          <p>Si año tras año tienes retenciones en exceso o insuficientes, solicita al INSS el cambio del porcentaje de retención para cuadrar mejor.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">🏠</div>
          <strong>Aprovecha deducciones por alquiler</strong>
          <p>Si alquilas tu vivienda habitual (siendo mayor), las deducciones por gastos pueden reducir significativamente el rendimiento neto del capital inmobiliario.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">👨‍👩‍👧</div>
          <strong>Coordina con la familia</strong>
          <p>Si un hijo te cuida o convives con él, puede aplicar el mínimo por ascendientes. Pero entonces tú no puedes declarar conjuntamente con tus hijos ni obtener esa deducción.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📊</div>
          <strong>Planifica el rescate del plan de pensiones</strong>
          <p>No rescates el plan en el mismo año de jubilación si recibes alta pensión. Rescatarlo al año siguiente o en forma de renta minimiza la tributación.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
          <strong>Errores frecuentes en el IRPF del pensionista</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>Confirmar el borrador sin revisar</strong>: El borrador puede tener errores en mínimos por edad, deducciones autonómicas o tratamiento de otros ingresos. Siempre revisar antes de confirmar.</li>
          <li><strong>No declarar pensiones del extranjero</strong>: Las pensiones de sistemas públicos extranjeros también tributan en España (convenios de doble imposición aparte). No declararlas es un error grave.</li>
          <li><strong>Olvidar que la pensión de viudedad también tributa</strong>: Muchos pensionistas con viudedad olvidan incluirla, lo que puede generar liquidaciones de la AEAT.</li>
          <li><strong>Rescatar el plan de pensiones en el año de jubilación</strong>: Ese año ya hay ingresos altos (últimas nóminas + pensión). Añadir el rescate del PP puede doblar la factura fiscal.</li>
          <li><strong>No aprovechar deducciones autonómicas</strong>: Muchas CCAA tienen deducciones específicas para mayores que no aparecen en el borrador automáticamente.</li>
          <li><strong>Desconocer el límite de {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores)} con dos pagadores</strong>: Si la pensión y un segundo pagador que supere {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)} rebasan juntos ese umbral, hay obligación de declarar aunque cada uno por separado esté por debajo del límite general de {formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.unPagador)}.</li>
        </ul>
      </div>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-irpf-pensionista')} />
      <ShareCard appName="estimador-irpf-pensionista" />
      <Footer appName="estimador-irpf-pensionista" />
    </div>
  );
}
