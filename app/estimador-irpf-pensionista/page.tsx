'use client';

import { useState } from 'react';
import styles from './EstimadorIrpfPensionista.module.css';
import { MeskeiaLogo, LegalNotice, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard,
  DataReference, RegionBadge
} from '@/components';
import { formatCurrency, formatNumber, formatPercentage, parseSpanishNumber } from '@/lib';
import {
  FISCAL_IRPF_META,
  cuotaEscalaGeneral,
  calcularCuotaIntegraGeneral,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  OBLIGACION_DECLARAR_2025,
  calcularRendimientoNetoTrabajo,
  calcularCuotaBaseAhorro,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  DEDUCCIONES_IRPF_DISCAPACIDAD_2025,
  NORMAS_MINIMOS_FAMILIARES_IRPF,
  CALENDARIO_FISCAL,
  FISCAL_CALENDARIO_META,
} from '@/data/fiscal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TramoEdad = 'menos65' | '65_74' | '75_mas';

interface ResultadoIrpfPensionista {
  /** Pensión anual + rescate del plan. NO incluye las rentas ajenas al trabajo. */
  rendimientosIntegrosTrabajo: number;
  /** Rescate del plan de pensiones declarado, ya incluido en el íntegro del trabajo. */
  rescatePP: number;
  /** Rentas de la base GENERAL distintas del trabajo: alquileres, por su rendimiento neto. */
  otrasRentas: number;
  /**
   * Rendimientos del capital mobiliario del art. 25.1 a 25.3 (intereses, dividendos), que el
   * art. 46.a LIRPF lleva a la base del AHORRO, con su propia escala (art. 66).
   */
  rentasAhorro: number;
  /** Suma de todo lo anterior. Es la que gradúa el tipo efectivo. */
  ingresosTotales: number;
  gastosDeducibles: number;
  rendimientosNetos: number;
  reduccionRRT: number;
  /** `true` cuando las otras rentas pasan del límite del art. 20 y la reducción no procede. */
  reduccionBloqueadaPorOtrasRentas: boolean;
  rendimientosNetosReducidos: number;
  minimoPersonal: number;
  /** Base liquidable general, con el mínimo dentro (art. 63.1.2.º). */
  baseImponible: number;
  /** Base liquidable del ahorro (aquí, los intereses y dividendos declarados). */
  baseAhorro: number;
  /**
   * Parte del mínimo que la base general no agota y pasa a la del ahorro (art. 56.2 LIRPF):
   * «formará parte de la base liquidable general por el importe de esta última y de la base
   * liquidable del ahorro por el resto». Acotada a la base del ahorro.
   */
  minimoEnAhorro: number;
  /** Cuota de la base general: escala del art. 63 menos la misma escala sobre el mínimo. */
  cuotaGeneral: number;
  /** Cuota de la base del ahorro: escala del art. 66 menos esa escala sobre `minimoEnAhorro`. */
  cuotaAhorro: number;
  cuotaIRPF: number;
  /**
   * IRPF anual que genera la PENSIÓN por sí sola: la misma cadena (arts. 19, 20 y 63.1.2.º) sin
   * rescate, alquileres ni intereses. Es lo que mira la retención de la Seguridad Social.
   */
  cuotaPension: number;
  tipoEfectivo: number;
  /** Pensión mensual menos `cuotaPension` / 14. NO resta el impuesto de las demás rentas. */
  pensionNetaMensual: number;
}

// ─── Lógica ───────────────────────────────────────────────────────────────────

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
 * de la deducción de la DA 61.ª (entonces `DEDUCCION_RENTAS_BAJAS_2025`, rotulada «art. 80 bis»), porque era el único importable y coincide
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

/** Edad del ascendiente del art. 59 LIRPF, desde `data/fiscal`. El techo de rentas, de `NORMAS_MINIMOS`. */
const REQUISITOS_ASCENDIENTE = DEDUCCIONES_IRPF_DISCAPACIDAD_2025.requisitosAscendiente;

/** Mínimo por discapacidad del contribuyente y sus gastos de asistencia (art. 60.1 LIRPF). */
const DISCAPACIDAD_CONTRIBUYENTE = DEDUCCIONES_IRPF_DISCAPACIDAD_2025.contribuyente;
/** Con grado ≥ 65 % los gastos de asistencia se suman sin más requisito: 9.000 + 3.000 (hallazgo 2780). */
const MINIMO_DISCAPACIDAD_65_CON_ASISTENCIA =
  MINIMOS_IRPF_2025.discapacidad_65_mas + DISCAPACIDAD_CONTRIBUYENTE.gastosAsistencia65oMas;

/** Límites del art. 96 LIRPF (obligación de declarar), con la excepción de los pensionistas. */
const OBLIGACION = OBLIGACION_DECLARAR_2025;
const EXCEPCION_PENSIONISTAS = OBLIGACION_DECLARAR_2025.trabajo.excepcionPensionistas;

/** Normas comunes de los mínimos familiares (art. 61 LIRPF): 1.800 € de la 2.ª, convivencia de la 5.ª. */
const NORMAS_MINIMOS = NORMAS_MINIMOS_FAMILIARES_IRPF;

/**
 * Plazo de la campaña de la Renta (modelo 100), de `data/fiscal/calendario.ts`, que deja las
 * fechas exactas sin fijar porque cambian cada ejercicio. Hasta el 03/10/2026 el paso 6 de la guía
 * escribía las de una campaña concreta («del 2 de abril al 30 de junio … hasta el 25 de junio»,
 * hallazgo 2781).
 */
const PLAZO_CAMPANA_RENTA =
  CALENDARIO_FISCAL.find((m) => m.modelo === '100')?.plazo ?? FISCAL_CALENDARIO_META.nota;

/** Primer y último tipo de la escala del ahorro (art. 66), para el texto de ayuda del campo. */
const TIPO_AHORRO_MIN = TRAMOS_GANANCIAS_PATRIMONIALES_2025[0].tipo;
const TIPO_AHORRO_MAX = TRAMOS_GANANCIAS_PATRIMONIALES_2025[TRAMOS_GANANCIAS_PATRIMONIALES_2025.length - 1].tipo;

/** «11,7 %» con espacio duro (U+00A0), como exige el formato español. Recibe puntos porcentuales. */
function formatPorcentaje(valor: number, decimales = 0): string {
  return formatPercentage(valor / 100, decimales);
}

/** Rango admisible de cada campo. Lo usan la guarda y el texto del aviso, para que no divirjan. */
const LIMITES = {
  pension: { min: 100, max: 10000 },
  rescate: { min: 0, max: 500000 },
  otrasRentas: { min: 0, max: 100000 },
  rentasAhorro: { min: 0, max: 500000 },
} as const;

/** «entre 100 y 10.000 €», con los mismos números que aplica la guarda. */
function textoRango(rango: { min: number; max: number }): string {
  return `entre ${formatNumber(rango.min, 0)} y ${formatNumber(rango.max, 0)} €`;
}

function minimoPersonalPorEdad(tramo: TramoEdad): number {
  if (tramo === '75_mas') return MINIMOS_IRPF_2025.personal_75;
  if (tramo === '65_74') return MINIMOS_IRPF_2025.personal_65;
  return MINIMOS_IRPF_2025.personal;
}

/**
 * @param otrasRentas  Rentas de la base GENERAL distintas del trabajo (alquileres).
 * @param rentasAhorro Intereses y dividendos: base del AHORRO (art. 46.a LIRPF).
 */
function estimarIrpfPensionista(
  pensionMensual: number,
  rescatePP: number,
  otrasRentas: number,
  rentasAhorro: number,
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
  const ingresosTotales = rendimientosIntegrosTrabajo + otrasRentas + rentasAhorro;

  // Arts. 19 y 20 LIRPF. La reducción del art. 20 se mide sobre los íntegros (una pensión no
  // tiene gastos de las letras a) a e)), ANTES de restar los 2.000 € de la letra f): hasta el
  // 25/09/2026 se medía después (hallazgo 1687 de estimador-sueldo-neto, mismo defecto). Y se
  // pierde con más de LIMITE_OTRAS_RENTAS_ART_20 de rentas ajenas al trabajo. Ese límite
  // cuenta TODAS las rentas distintas del trabajo, «excluidas las exentas» (art. 20): las de la
  // base general y también los intereses y dividendos de la del ahorro.
  const rendimientoTrabajo = calcularRendimientoNetoTrabajo({
    integros: rendimientosIntegrosTrabajo,
    gastosAaE: 0,
    otrasRentas: otrasRentas + rentasAhorro,
  });
  const gastosDeducibles = rendimientoTrabajo.otrosGastos;
  const rendimientosNetos = rendimientoTrabajo.rendimientoNeto;
  const reduccionBloqueadaPorOtrasRentas = rendimientoTrabajo.reduccionPerdidaPorOtrasRentas;
  const reduccionRRT = rendimientoTrabajo.reduccion;
  const rendimientosNetosReducidos = rendimientoTrabajo.rendimientoNetoReducido;

  // Mínimo personal según edad
  const minimoPersonal = minimoPersonalPorEdad(tramo);

  // Base imponible general: el rendimiento del trabajo ya reducido MÁS los alquileres, que
  // se integran en la base general por su importe neto pero nunca en el RNT.
  //
  // Los intereses y dividendos NO entran aquí. Son rendimientos del capital mobiliario del
  // art. 25.1-3, y el art. 46.a los lleva a la base del AHORRO, que se grava con la escala del
  // art. 66 (19 % a 30 %) y no con la general. Hasta el 26/09/2026 un único campo mezclaba
  // alquileres con intereses y dividendos y lo sumaba todo aquí: 5.000 € de dividendos sobre
  // una pensión de 1.500 €/mes salían al 24-30 % de la escala general, 478 € de cuota de más
  // (hallazgo 2131).
  const baseImponible = rendimientosNetosReducidos + otrasRentas;
  const baseAhorro = rentasAhorro;

  // Cuota íntegra general (art. 63.1.2.º LIRPF): escala sobre la base completa menos escala
  // sobre el mínimo. La resta la hace data/fiscal/irpf.ts, que además acota el mínimo a la base.
  const cuotaGeneral = calcularCuotaIntegraGeneral(baseImponible, minimoPersonal);

  // Art. 56.2 LIRPF: si la base general no agota el mínimo, el resto forma parte de la base del
  // ahorro, y el art. 66.1.2.º lo grava allí a tipo cero por el mismo método (escala sobre la
  // base menos escala sobre esa parte del mínimo). Sin esto, un pensionista cuya pensión queda
  // bajo el mínimo pagaría por sus intereses aunque la ley los deje a cubierto.
  const minimoSobrante = Math.max(0, minimoPersonal - baseImponible);
  const minimoEnAhorro = Math.min(minimoSobrante, baseAhorro);
  const cuotaAhorro = Math.max(0, calcularCuotaBaseAhorro(baseAhorro) - calcularCuotaBaseAhorro(minimoEnAhorro));

  const cuotaIRPF = cuotaGeneral + cuotaAhorro;

  const tipoEfectivo = ingresosTotales > 0 ? (cuotaIRPF / ingresosTotales) * 100 : 0;

  // Pensión neta mensual: la pensión menos el IRPF que corresponde a la PENSIÓN, no a todas las
  // rentas. Hasta el 03/10/2026 restaba la cuota TOTAL entre 14 y avisaba debajo de que era «un
  // suelo» (hallazgo 2776): con 1.500 €/mes y un rescate de 30.000 € publicaba 602,96 €/mes, y con
  // 100.000 € de alquiler, 0,00 €/mes. Pero el rótulo y el FAQPage hablan de la pensión menos las
  // retenciones de la Seguridad Social, que solo miran la pensión: el IRPF del rescate lo retiene
  // la gestora y el del alquiler no sale de la pensión. Así que se calcula la cuota de la pensión
  // SOLA, con la misma cadena: sin otras rentas, la reducción del art. 20 se gradúa solo con ella
  // (la Seguridad Social no sabe de los alquileres) y el mínimo se grava a tipo cero con
  // `calcularCuotaIntegraGeneral`, nunca restándolo de la base.
  const soloPension = calcularRendimientoNetoTrabajo({ integros: pensionAnual, gastosAaE: 0, otrasRentas: 0 });
  const cuotaPension = calcularCuotaIntegraGeneral(soloPension.rendimientoNetoReducido, minimoPersonal);
  const pensionNetaMensual = Math.max(0, pensionMensual - cuotaPension / 14);

  return {
    rendimientosIntegrosTrabajo,
    rescatePP,
    otrasRentas,
    rentasAhorro,
    ingresosTotales,
    gastosDeducibles,
    rendimientosNetos,
    reduccionRRT,
    reduccionBloqueadaPorOtrasRentas,
    rendimientosNetosReducidos,
    minimoPersonal,
    baseImponible,
    baseAhorro,
    minimoEnAhorro,
    cuotaGeneral,
    cuotaAhorro,
    cuotaIRPF,
    cuotaPension,
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
  return estimarIrpfPensionista(integrosTrabajoAnuales / 14, 0, otrasRentas, 0, tramo);
}

/** Escenarios del bloque educativo. Los importes de ejemplo son del ejemplo; el cálculo, de la norma. */
const ESC_PENSION_UNICA = escenarioAnual(19000, 0, '65_74');
const ESC_PENSION_ALQUILER = escenarioAnual(14000, 6000, '65_74');
const ESC_RESCATE_PP = estimarIrpfPensionista(15000 / 14, 30000, 0, 0, '65_74');

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorIrpfPensionista() {
  const [pensionMensual, setPensionMensual] = useState('');
  const [rescatePP, setRescatePP] = useState('0');
  const [otrasRentasAnuales, setOtrasRentasAnuales] = useState('0');
  const [rentasAhorroAnuales, setRentasAhorroAnuales] = useState('0');
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
    const rentasAhorro = leerCampoOpcional(rentasAhorroAnuales);

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
      rechazar(`Los alquileres y otras rentas de la base general deben ser un importe ${textoRango(LIMITES.otrasRentas)}.`);
      return;
    }
    if (Number.isNaN(rentasAhorro) || rentasAhorro < LIMITES.rentasAhorro.min || rentasAhorro > LIMITES.rentasAhorro.max) {
      rechazar(`Los intereses y dividendos deben ser un importe ${textoRango(LIMITES.rentasAhorro)}.`);
      return;
    }

    setResultado(estimarIrpfPensionista(pension, rescate, otrasRentas, rentasAhorro, tramo));
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📊</span>
        <h1 className={styles.title}>Estimador IRPF Pensionista</h1>
        <p className={styles.subtitle}>Cuánto pagas de renta siendo jubilado y cuál es tu pensión neta real · {FISCAL_IRPF_META.vigencia}</p>
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
            helperText="Si rescatas un plan de pensiones, se suma como rendimiento del trabajo. El estimador lo suma entero: no aplica la reducción del régimen transitorio (DT 12.ª) a lo aportado hasta 2006. Pon 0 si no aplica."
            min={LIMITES.rescate.min}
            max={LIMITES.rescate.max}
            acotarAlSalir={false}
          />

          <NumberInput
            value={otrasRentasAnuales}
            onChange={setOtrasRentasAnuales}
            label="Alquileres y otras rentas de la base general (€/año)"
            placeholder="0"
            helperText="Rendimiento neto anual de alquileres y demás rentas que tributan con la escala general. NO pongas aquí pensiones ni sueldos: esos son rendimientos del trabajo. Pon 0 si no aplica."
            min={LIMITES.otrasRentas.min}
            max={LIMITES.otrasRentas.max}
            acotarAlSalir={false}
          />

          <NumberInput
            value={rentasAhorroAnuales}
            onChange={setRentasAhorroAnuales}
            label="Intereses y dividendos (€/año)"
            placeholder="0"
            helperText={`Intereses de cuentas y depósitos y dividendos, por su importe neto anual. Tributan en la base del ahorro, con su propia escala (del ${formatPorcentaje(TIPO_AHORRO_MIN)} al ${formatPorcentaje(TIPO_AHORRO_MAX)}). Pon 0 si no aplica.`}
            min={LIMITES.rentasAhorro.min}
            max={LIMITES.rentasAhorro.max}
            acotarAlSalir={false}
          />

          <p className={styles.hint}>
            Si alquileres, intereses y dividendos suman más de {formatCurrency(LIMITE_OTRAS_RENTAS_ART_20)},
            decae la reducción del art. 20.
          </p>

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              <span aria-hidden="true">⚠️</span> {error}
            </div>
          )}

          {/* Sin aria-label: el texto visible ya es su nombre accesible (WCAG 2.5.3, hallazgo 2778). */}
          <button type="button" className={styles.btn} onClick={calcular}>
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
                  <span className={styles.resultLabel}>Alquileres y otras rentas de la base general</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.otrasRentas)}</span>
                </div>
              )}

              <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                <span className={styles.resultLabel}>Base imponible general</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.baseImponible)}</span>
              </div>

              {resultado.baseAhorro > 0 && (
                <div className={`${styles.resultItem} ${styles.resultItemHighlight}`}>
                  <span className={styles.resultLabel}>Base imponible del ahorro</span>
                  <span className={styles.resultValue}>{formatCurrency(resultado.baseAhorro)}</span>
                </div>
              )}

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Mínimo personal (edad)</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.minimoPersonal)}</span>
              </div>

              {resultado.minimoEnAhorro > 0 && (
                <p className={styles.resultNota}>
                  Tu base general no agota el mínimo: {formatCurrency(resultado.minimoEnAhorro)} de él
                  se aplican a la base del ahorro, donde también se gravan a tipo cero (arts. 56.2 y 66 LIRPF).
                </p>
              )}

              <div className={styles.divider} />

              {resultado.baseAhorro > 0 && (
                <>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Cuota de la base general</span>
                    <span className={styles.resultValue}>{formatCurrency(resultado.cuotaGeneral)}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Cuota de la base del ahorro</span>
                    <span className={styles.resultValue}>{formatCurrency(resultado.cuotaAhorro)}</span>
                  </div>
                </>
              )}

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Cuota IRPF estimada anual</span>
                <span className={styles.resultValue}>{formatCurrency(resultado.cuotaIRPF)}</span>
              </div>

              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>Tipo efectivo estimado</span>
                <span className={styles.resultValue}>{formatPorcentaje(resultado.tipoEfectivo, 1)}</span>
              </div>

              <div className={`${styles.resultItem} ${styles.resultItemSolution}`}>
                <span className={styles.resultLabel}>Pensión neta mensual estimada</span>
                <span className={styles.resultValueBig}>{formatCurrency(resultado.pensionNetaMensual)}/mes</span>
              </div>

              {/*
                Cómo se obtiene la cifra de arriba, junto a ella (hallazgo 2776). Con otras rentas,
                además, a dónde va el resto de la cuota: el reparto es MARGINAL —lo que esas rentas
                añaden sobre lo que pagaría la pensión sola—, que es justo lo que no sale de la pensión.
              */}
              <p className={styles.resultNota}>
                Es tu pensión menos el IRPF que genera la pensión por sí sola
                ({formatCurrency(resultado.cuotaPension)} al año), repartido en 14 pagas. Es la referencia
                de la retención que te aplica la Seguridad Social, que solo mira la pensión y tu situación
                personal; la retención real sale del procedimiento del Reglamento del IRPF y puede no
                coincidir al euro: la diferencia se ajusta en la declaración.
                {resultado.cuotaIRPF > resultado.cuotaPension && (
                  <>
                    {' '}Los {formatCurrency(resultado.cuotaIRPF - resultado.cuotaPension)} restantes de
                    la cuota los añaden el rescate, los alquileres o los intereses y dividendos, y no salen
                    de la pensión: los retiene quien los paga (la gestora del plan, el banco) o se pagan en
                    la declaración.
                  </>
                )}
              </p>

              {resultado.rescatePP > 0 && (
                <p className={styles.resultNota}>
                  El rescate se ha sumado entero. Si parte de él procede de aportaciones hechas hasta el
                  31/12/2006 y lo cobras en forma de capital en el año de la jubilación o en los dos
                  siguientes, esa parte admite la reducción del régimen transitorio (disposición
                  transitoria 12.ª LIRPF), que este estimador no aplica: tu cuota sería menor.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Cómo tributa la pensión en el IRPF?" subtitle={`Rendimientos del trabajo, reducciones y mínimos para jubilados · ${FISCAL_IRPF_META.vigencia}`}>
        <p>La pensión pública de jubilación tributa como <strong>rendimiento del trabajo</strong>, igual que un salario. Sin embargo, los pensionistas tienen ventajas fiscales específicas que reducen su factura.</p>
        <h3>Reducción por rendimientos del trabajo</h3>
        <p>Si tus únicos ingresos son la pensión, aplica una reducción en función de su importe anual:</p>
        <ul>
          <li>Pensión anual (sin restar los {formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)} de gastos, art. 20) ≤ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)}: reducción de {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)}</li>
          <li>Entre {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} y {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: reducción decreciente, en dos tramos</li>
          <li>Pensión anual ≥ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: <strong>sin reducción</strong> — esta reducción se agota, no deja importe residual</li>
        </ul>
        <h3>Mínimo personal por edad</h3>
        <p>El mínimo personal genera una deducción efectiva sobre la cuota:</p>
        <ul>
          <li>General (hasta 65 años): {formatCurrency(MINIMOS_IRPF_2025.personal)}</li>
          <li>De 65 a 74 años: {formatCurrency(MINIMOS_IRPF_2025.personal_65)}</li>
          <li>75 años o más: {formatCurrency(MINIMOS_IRPF_2025.personal_75)}</li>
        </ul>
        <h3>Rescate del plan de pensiones</h3>
        <p>
          El rescate tributa como rendimiento del trabajo (art. 17.2.a LIRPF) y se suma a la pensión
          en la base general: un rescate grande en forma de capital puede subir tu tipo marginal. Lo
          aportado desde 2007 tributa entero cobres cuando cobres, así que repartirlo en varios años
          o cobrarlo como renta suaviza el tramo. Lo aportado hasta el 31/12/2006 tiene un régimen
          transitorio (disposición transitoria 12.ª LIRPF): esa parte admite la reducción del
          art. 17 de la ley vigente a esa fecha si la cobras en forma de capital, y solo «en el
          ejercicio en el que acaezca la contingencia correspondiente, o en los dos ejercicios
          siguientes» (DT 12.ª.4). Cobrada después, o como renta, esa reducción se pierde. Pide a la
          gestora cuánto de tu plan es de cada época antes de decidir. Este estimador suma el rescate
          entero y no aplica esa reducción.
        </p>
        <h3>¿Quién está obligado a declarar?</h3>
        <p>
          No está obligado quien cobra solo rendimientos del trabajo —la pensión lo es— de un único
          pagador por debajo de {formatCurrency(OBLIGACION.trabajo.unPagador)} al año (art. 96.2.a
          LIRPF), sea cual sea la retención que le hayan aplicado. Con más de un pagador, si el segundo
          y los siguientes suman más de {formatCurrency(OBLIGACION.trabajo.limiteSegundoPagador)}, el
          límite baja a {formatCurrency(OBLIGACION.trabajo.variosPagadores)} (art. 96.3.a).
        </p>
        <p>
          Excepción propia de los pensionistas ({EXCEPCION_PENSIONISTAS.articulo}): si todos tus
          rendimientos del trabajo son pensiones o prestaciones pasivas del art. 17.2.a —una pensión
          de la Seguridad Social y otra de una mutualidad, por ejemplo— y pediste a la Agencia
          Tributaria que fijara tu retención por el procedimiento especial (art. 89.A del Reglamento
          del IRPF), el límite sigue en {formatCurrency(EXCEPCION_PENSIONISTAS.limite)} aunque
          tengas varios pagadores.
        </p>
        <p>
          Esos límites solo eximen a quien obtiene rentas <strong>exclusivamente</strong> del
          trabajo, del capital mobiliario con retención (hasta {formatCurrency(OBLIGACION.capitalMobiliario.limite)})
          o imputadas (hasta {formatCurrency(OBLIGACION.rentasImputadas.limite)}), según el art. 96.2.
          Un alquiler no está en esa lista: el pensionista que cobra un alquiler está obligado a
          declarar, salvo que todas sus rentas juntas no lleguen
          a {formatCurrency(OBLIGACION.limiteConjuntoGeneral.limite)}.
        </p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Reducciones y mínimos aplicables a pensionistas ({FISCAL_IRPF_META.vigencia})</h3>
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
              <td>{formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)}</td>
              <td>Pensión anual íntegra (sin restar los {formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)} de gastos) ≤ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)}, y rentas ajenas al trabajo ≤ {formatCurrency(LIMITE_OTRAS_RENTAS_ART_20)}</td>
            </tr>
            <tr>
              <td>Reducción rendimientos trabajo (art. 20, decreciente)</td>
              <td>De {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)} a {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion2)}</td>
              <td>Pensión anual íntegra (sin restar los {formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)}) entre {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} y {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}</td>
            </tr>
            <tr>
              <td>Reducción rendimientos trabajo (art. 20, agotada)</td>
              <td>{formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion2)} — no deja importe residual</td>
              <td>Pensión anual íntegra (sin restar los {formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)}) ≥ {formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}</td>
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
            <tr>
              <td>Límite obligación de declarar (pensionistas con varios pagadores)</td>
              <td>{formatCurrency(EXCEPCION_PENSIONISTAS.limite)} ({EXCEPCION_PENSIONISTAS.articulo})</td>
              <td>Solo pensiones o prestaciones pasivas (art. 17.2.a), con la retención fijada por el procedimiento especial del art. 89.A del Reglamento</td>
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
          <div className={styles.escenarioTip}>
            <span aria-hidden="true">💡</span>{' '}
            {ESC_PENSION_UNICA.rendimientosIntegrosTrabajo <= OBLIGACION.trabajo.unPagador
              ? <>No está obligado a declarar: cobra solo rendimientos del trabajo de un único pagador y no pasan de {formatCurrency(OBLIGACION.trabajo.unPagador)} (art. 96.2.a LIRPF), sea cual sea la retención. Si le han retenido más de {formatCurrency(ESC_PENSION_UNICA.cuotaIRPF)} en el año, le conviene declarar para recuperar la diferencia.</>
              : <>Está obligado a declarar: sus rendimientos del trabajo pasan de {formatCurrency(OBLIGACION.trabajo.unPagador)} (art. 96.2.a LIRPF).</>}
          </div>
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
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> Está obligado a declarar aunque la pensión no llegue a {formatCurrency(OBLIGACION.trabajo.unPagador)}: el art. 96.2 solo exime a quien obtiene rentas exclusivamente del trabajo, del capital mobiliario con retención o imputadas, y un alquiler no está en esa lista.</div>
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
          <div className={styles.escenarioTip}><span aria-hidden="true">💡</span> El ejemplo suma el rescate entero. Si parte del plan son aportaciones hechas hasta el 31/12/2006, cobrarla en capital este año o en los dos siguientes le permite aplicar a esa parte la reducción del régimen transitorio (DT 12.ª LIRPF); más tarde la pierde. Lo aportado desde 2007 tributa entero en cualquier año: eso sí puede convenir repartirlo en años de menos ingresos.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre el IRPF del pensionista</h3>
        <div className={styles.faqItem}>
          <strong>¿Las pensiones públicas siempre tributan?</strong>
          <p>
            Por regla general sí: las pensiones públicas tributan como rendimiento del trabajo
            (art. 17.2.a LIRPF), y así la de jubilación y la de viudedad. Pero el art. 7 LIRPF declara
            exentas varias: las de incapacidad permanente absoluta o gran invalidez de la Seguridad
            Social (letra f); las de inutilidad o incapacidad permanente de clases pasivas que
            inhabilitan para toda profesión u oficio (g); las de orfandad y a favor de nietos y
            hermanos de los regímenes públicos percibidas por «menores de veintidós años o
            incapacitados para todo trabajo» (h); las derivadas de actos de terrorismo (a), y las
            reconocidas por lesiones o mutilaciones de la Guerra Civil (c). Una pensión exenta no se
            suma a las demás rentas: no la incluyas en este estimador.
          </p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cuándo estoy obligado a declarar siendo pensionista?</strong>
          <p>
            Si solo cobras rendimientos del trabajo —la pensión lo es—: con un único pagador, si
            superan {formatCurrency(OBLIGACION.trabajo.unPagador)} al año (art. 96.2.a LIRPF). Con varios
            pagadores y un segundo y siguientes que sumen más
            de {formatCurrency(OBLIGACION.trabajo.limiteSegundoPagador)}, si superan
            {' '}{formatCurrency(OBLIGACION.trabajo.variosPagadores)} (art. 96.3.a), salvo la excepción
            de los pensionistas ({EXCEPCION_PENSIONISTAS.articulo}): si todos tus rendimientos del
            trabajo son pensiones o prestaciones pasivas del art. 17.2.a y tu retención se fijó por el
            procedimiento especial que se pide a la Agencia Tributaria (art. 89.A del Reglamento del
            IRPF), el límite sigue en {formatCurrency(EXCEPCION_PENSIONISTAS.limite)}.
          </p>
          <p>
            Esos límites solo valen si tus rentas son exclusivamente del trabajo, del capital
            mobiliario con retención (hasta {formatCurrency(OBLIGACION.capitalMobiliario.limite)}) o
            imputadas (hasta {formatCurrency(OBLIGACION.rentasImputadas.limite)}), como dice el
            art. 96.2. Con un alquiler estás obligado, salvo que todas tus rentas juntas no lleguen
            a {formatCurrency(OBLIGACION.limiteConjuntoGeneral.limite)}.
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
          <div className={styles.faqTip}>
            <span aria-hidden="true">💡</span> Si convives con un hijo que aplica por ti el mínimo por
            ascendientes, mira antes lo que pierde él: si presentas declaración con rentas superiores
            a {formatCurrency(NORMAS_MINIMOS.rentasMaximasDeclaracion)}, se queda sin ese mínimo
            (art. 61.2.ª LIRPF).
          </div>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Cómo afecta la discapacidad al IRPF del pensionista?</strong>
          <p>
            Lo que la discapacidad añade a un pensionista son MÍNIMOS adicionales (art. 60.1 LIRPF):
            {' '}{formatCurrency(MINIMOS_IRPF_2025.discapacidad_33_65)} con un grado del {formatPorcentaje(33)} al
            {' '}{formatPorcentaje(64)}, y {formatCurrency(MINIMOS_IRPF_2025.discapacidad_65_mas)} con un grado
            del {formatPorcentaje(65)} o más, que además se aumenta
            en {formatCurrency(DISCAPACIDAD_CONTRIBUYENTE.gastosAsistencia65oMas)} en concepto de gastos de
            asistencia: {formatCurrency(MINIMO_DISCAPACIDAD_65_CON_ASISTENCIA)} en total. Con un grado
            del {formatPorcentaje(33)} al {formatPorcentaje(64)}, esos
            {' '}{formatCurrency(DISCAPACIDAD_CONTRIBUYENTE.gastosAsistencia33a65)} de gastos de asistencia solo se
            suman si acreditas necesitar ayuda de terceras personas o movilidad reducida. Quien cobra
            una pensión de la Seguridad Social por incapacidad permanente total, absoluta o gran
            invalidez tiene acreditado por ley al menos el {formatPorcentaje(33)} (art. 60.3). Este
            estimador no modela estos mínimos, así que con discapacidad reconocida su cuota es un
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
          <p>
            Sí, si tienes más de {REQUISITOS_ASCENDIENTE.edadMinima} años (o cualquier edad con una
            discapacidad reconocida de al menos el {formatPorcentaje(33)}), convives con tu hijo al
            menos {NORMAS_MINIMOS.convivenciaMinima} (art. 61.5.ª LIRPF) y no obtienes rentas anuales,
            excluidas las exentas, superiores a {formatCurrency(NORMAS_MINIMOS.rentasMaximasAscendiente)}:
            él puede aplicar en su declaración el mínimo por ascendientes del art. 59
            ({formatCurrency(MINIMOS_IRPF_2025.ascendiente_65)}, y {formatCurrency(MINIMOS_IRPF_2025.ascendiente_75)} si
            tienes más de 75 años). Es un mínimo, no una deducción: esa parte de su renta se grava a tipo cero.
          </p>
          <div className={styles.faqTip}>
            <span aria-hidden="true">💡</span> Lo pierde si tú presentas tu propia declaración con rentas
            superiores a {formatCurrency(NORMAS_MINIMOS.rentasMaximasDeclaracion)} (art. 61.2.ª LIRPF),
            aunque no estés obligado y solo sea para pedir una devolución: antes de presentarla,
            comparad lo que recuperas tú con lo que deja de ahorrarse él. Y no existe una declaración
            conjunta de padres e hijos mayores de edad: la unidad familiar del art. 82 la forman los
            cónyuges con sus hijos menores o incapacitados judicialmente.
          </div>
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
            <p>Pensión pública, pensión complementaria, rentas de alquiler, dividendos, intereses, rescate de planes de pensiones. Cada uno tributa según su categoría: los intereses y los dividendos, en la base del ahorro.</p>
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
            <strong>Presenta antes de que cierre la campaña</strong>
            <p>{PLAZO_CAMPANA_RENTA} Si sale a pagar y quieres domiciliar el pago, la domiciliación se cierra unos días antes del final. Confirma las fechas del ejercicio en el calendario del contribuyente de la Agencia Tributaria.</p>
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
          <p>Si convives con un hijo al menos {NORMAS_MINIMOS.convivenciaMinima} y tus rentas no pasan de {formatCurrency(NORMAS_MINIMOS.rentasMaximasAscendiente)}, él puede aplicar el mínimo por ascendientes (art. 59 LIRPF). Lo pierde si tú presentas declaración con rentas superiores a {formatCurrency(NORMAS_MINIMOS.rentasMaximasDeclaracion)} (art. 61.2.ª), aunque sea solo para pedir una devolución: echad las cuentas juntos antes de presentarla.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon} aria-hidden="true">📊</div>
          <strong>Planifica el rescate del plan de pensiones</strong>
          <p>Lo aportado desde 2007 tributa entero cobres cuando cobres: repartirlo en años de menos ingresos o cobrarlo como renta suaviza el tramo. Lo aportado hasta el 31/12/2006 solo conserva la reducción del régimen transitorio si lo cobras en capital en el año de la jubilación o en los dos siguientes (DT 12.ª.4 LIRPF): retrasarlo más, o cobrarlo como renta, la pierde. Pide a la gestora cuánto hay de cada época.</p>
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
          <li><strong>Decidir la fecha del rescate del plan sin mirar de qué época son las aportaciones</strong>: El año de jubilación ya suele traer ingresos altos (últimas nóminas + pensión), y sumarle el rescate sube el tramo. Pero si hay aportaciones anteriores a 2007, la reducción del régimen transitorio para cobrarlas en capital solo vale ese año y los dos siguientes (DT 12.ª.4 LIRPF): retrasar el rescate más allá la pierde.</li>
          <li><strong>No aprovechar deducciones autonómicas</strong>: Muchas CCAA tienen deducciones específicas para mayores que no aparecen en el borrador automáticamente.</li>
          <li><strong>Desconocer el límite de {formatCurrency(OBLIGACION.trabajo.variosPagadores)} con dos pagadores</strong>: Si la pensión y un segundo pagador que supere {formatCurrency(OBLIGACION.trabajo.limiteSegundoPagador)} rebasan juntos ese umbral, hay obligación de declarar aunque cada uno por separado esté por debajo del límite general de {formatCurrency(OBLIGACION.trabajo.unPagador)}. Salvo que todo sean pensiones o prestaciones pasivas y hayas pedido el procedimiento especial de retención (art. 89.A del Reglamento del IRPF): entonces el límite sigue en {formatCurrency(EXCEPCION_PENSIONISTAS.limite)} ({EXCEPCION_PENSIONISTAS.articulo}).</li>
        </ul>
      </div>

      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="estimador-irpf-pensionista" />
      <Footer appName="estimador-irpf-pensionista" />
    </div>
  );
}
