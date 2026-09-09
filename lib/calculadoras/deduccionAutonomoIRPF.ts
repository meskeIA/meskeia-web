/**
 * Calculadora de Gastos Deducibles IRPF Autónomo — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_deduccion_autonomo_irpf) y la API Route
 * /api/chatgpt/gastos-deducibles (ChatGPT Actions).
 *
 * ⚠️ Este motor NO tiene app: sus cifras solo las lee un LLM, que se las recita a
 * una persona. No hay pantalla donde el usuario pueda ver el desglose y sospechar,
 * así que todo lo que el motor no diga, no existe: un gasto que se ignora en
 * silencio o una cuota mal calculada llegan al usuario como si fueran ciertos.
 * De ahí la disciplina de este fichero: nada se descarta sin dejar línea o
 * advertencia, y las cifras se publican ya redondeadas para que el desglose cuadre
 * consigo mismo.
 *
 * Calcula los gastos deducibles en el IRPF para autónomos en estimación
 * directa simplificada (EDS) o normal (EDN), conforme al RIRPF arts. 28-30
 * y la LIRPF.
 *
 * Gastos deducibles principales:
 *
 * A) CUOTAS SS AUTÓNOMO (RETA)
 *    - 100% deducible (art. 30.2.1 LIRPF)
 *
 * B) SUMINISTROS OFICINA EN CASA (art. 30.2.5 LIRPF, desde 2018)
 *    - Si el domicilio habitual se usa para la actividad:
 *    - Fórmula: 30% × (% superficie destinada a actividad) × gasto total suministros
 *    - Suministros: luz, agua, gas, internet, teléfono
 *    - Afectación parcial del inmueble: porcentaje de la superficie
 *
 * C) GASTOS DE DIFÍCIL JUSTIFICACIÓN — EDS (art. 30.2.4 RIRPF)
 *    - 7% del rendimiento neto previo (máximo 2.000 €/año) — solo EDS
 *    - Sustituyó la deducción del 5% hasta 2023; subió a 7% desde 2023
 *
 * D) DIETAS Y GASTOS DE MANUTENCIÓN (art. 30.2.6 LIRPF)
 *    - El autónomo puede deducir sus propias dietas si:
 *      a) La actividad se realiza en un establecimiento de hostelería
 *      b) Se paga por medios electrónicos
 *      c) Límites = mismos que para trabajadores (26,67 €/día España sin pernoctar)
 *
 * E) VEHÍCULO (uso exclusivo actividad económica — difícil de acreditar)
 *    - Para transporte de mercancías, enseñanza conductores, agentes comerciales:
 *      100% deducible si uso exclusivo acreditado
 *    - Para el resto: AEAT generalmente no admite deducción parcial en ED
 *    - Autónomos EDS: 50% en algunos criterios DGT — muy controvertido
 *
 * F) LOCAL / ALQUILER OFICINA EXTERIOR
 *    - 100% deducible si es la sede de la actividad
 *
 * G) OTROS GASTOS (art. 28 LIRPF)
 *    - Seguros de responsabilidad civil
 *    - Asesoría / gestoría
 *    - Material de oficina, publicidad, formación
 *    - Amortizaciones de inmovilizado
 *
 * Fuente: LIRPF arts. 28-30 + RIRPF arts. 22 y 30 + consultas DGT.
 * La escala general y su fecha de verificación NO se copian aquí: se importan de
 * `@/data/fiscal` (TRAMOS_IRPF_2025 + FISCAL_IRPF_META), que es lo único que el
 * Vigía Normativo re-sella. Ver `fuenteDatos` en el resultado.
 *
 * Encadenable con: calcular_modelo_130, calcular_cuota_autonomo, calcular_irpf
 */

import { TRAMOS_IRPF_2025, MINIMOS_IRPF_2025, FISCAL_IRPF_META } from '@/data/fiscal';

// ─── Constantes ────────────────────────────────────────────────────────────────

const PCT_SUMINISTROS_DEDUCIBLE = 30;        // % sobre la parte proporcional
const PCT_DIFICIL_JUSTIFICACION_EDS = 7;     // % rendimiento neto previo (EDS)
const LIMITE_DIFICIL_JUSTIFICACION = 2000;   // € máximo anual
const DIETA_MAX_ESPANIA_SIN_PERNOCTAR = 26.67; // €/día (art. 9 RIRPF)
const DIETA_MAX_ESPANIA_PERNOCTANDO = 53.34;
const DIETA_MAX_EXTRANJERO_SIN_PERNOCTAR = 48.08;
const DIETA_MAX_EXTRANJERO_PERNOCTANDO = 91.35;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type ModalidadEstimacion = 'simplificada' | 'directa_normal';

export interface GastoDeducibleAutonomo {
  concepto: string;
  importeTotal: number;
  importeDeducible: number;
  pctDeduccion: number;
  observacion: string;
}

export interface ParametrosDeduccionAutonomoIRPF {
  /** Modalidad de estimación directa */
  modalidadEstimacion: ModalidadEstimacion;
  /** Ingresos brutos anuales de la actividad (€) */
  ingresosBrutos: number;
  /** Cuotas SS autónomo (RETA) anuales pagadas (€) */
  cuotasSSAutonomo?: number;
  /** Alquiler del local / oficina exterior anual (€) */
  alquilerLocal?: number;
  /** Gasto en suministros del domicilio habitual (luz, agua, internet...) anual (€) */
  gastosSupministrosHogar?: number;
  /** % de la superficie del hogar dedicada a la actividad (0-100) */
  pctSuperficieActividadHogar?: number;
  /** Gastos de asesoría/gestoría anuales (€) */
  gastosAsesoria?: number;
  /** Seguros de responsabilidad civil, accidentes, etc. anuales (€) */
  gastosSeguros?: number;
  /** Material de oficina, publicidad, formación, etc. (€) */
  otrosGastos?: number;
  /** Gastos de dietas en hostelería (pagados con tarjeta) anuales (€) */
  gastosDietas?: number;
  /** Días de dietas en España sin pernoctar */
  diasDietasEspaniaSinPernoctar?: number;
  /** Días de dietas en España pernoctando */
  diasDietasEspaniaPernoctando?: number;
  /** Días de dietas en extranjero sin pernoctar */
  diasDietasExtranjeroSinPernoctar?: number;
  /** Días de dietas en extranjero pernoctando */
  diasDietasExtranjeroPernoctando?: number;
  /**
   * Otros gastos deducibles acreditados no incluidos en los apartados anteriores (€).
   * (amortizaciones, compras de mercancías, etc.)
   */
  otrosGastosAcreditados?: number;
}

export interface ResultadoDeduccionAutonomoIRPF {
  /** Ingresos brutos anuales (€) */
  ingresosBrutos: number;
  /** Detalle de gastos deducibles */
  gastos: GastoDeducibleAutonomo[];
  /** Total gastos deducibles antes de difícil justificación (€) */
  totalGastosDeducibles: number;
  /** Rendimiento neto previo (€) = ingresos - gastos (antes de deducción difícil justificación) */
  rendimientoNetoPrevio: number;
  /** Deducción por gastos de difícil justificación (solo EDS) (€) */
  deduccionDificilJustificacion: number;
  /** **Rendimiento neto de la actividad (€)** */
  rendimientoNetoActividad: number;
  /**
   * Tipo MARGINAL de la escala general (%): el que grava el último euro ganado,
   * NO el que se paga sobre todo el rendimiento. El tipo que de verdad se soporta
   * es `tipoEfectivoEstimado`.
   */
  tipoIRPFEstimado: number;
  /** Tipo EFECTIVO (%) = cuota / rendimiento neto de la actividad */
  tipoEfectivoEstimado: number;
  /**
   * Cuota íntegra estimada (€) por aplicación de la escala general TRAMO A TRAMO
   * al rendimiento neto de la actividad, ANTES de minorar el mínimo personal y
   * familiar (art. 63.1.2º LIRPF). Es por tanto una cota SUPERIOR: ver advertencias.
   */
  cuotaIRPFEstimada: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const r = (n: number) => Math.round(n * 100) / 100;

/** Formato español para textos de observaciones y advertencias. */
const fmt = (n: number) =>
  n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Cuota de la escala general aplicada TRAMO A TRAMO — la misma lógica que
 * `calcularCuotaTramos` de lib/calculadoras/irpf.ts, sobre la escala importada.
 *
 * ⚠️ Hasta el 09/09/2026 este motor localizaba el tramo y multiplicaba la base
 * ENTERA por ese tipo marginal, con una escala copiada como escalera de `if`.
 * Era el error de «mi tramo es el 37 %, luego pago el 37 % de todo» —justo lo que
 * la app `simulador-mito-tramo-superior` existe para desmentir—: 36.800 € de
 * rendimiento daban 13.616,00 € donde la escala da 9.317,50 € (+46 %), y además
 * producía saltos de hasta 6.000 € en los cinco bordes, de modo que ganar 1 € más
 * dejaba cientos de euros menos. Recitado por un LLM, eso hacía aparentar que
 * «deducir 1 € más» ahorraba 622 € en el borde de los 12.450 €.
 */
function cuotaEscalaGeneral(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let anterior = 0;
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= anterior) break;
    cuota += (Math.min(base, tramo.hasta) - anterior) * (tramo.tipo / 100);
    anterior = tramo.hasta;
  }
  return r(cuota);
}

/** Tipo marginal de la escala importada (el del último euro de la base). */
function tipoMarginalEscala(base: number): number {
  for (const tramo of TRAMOS_IRPF_2025) {
    if (base <= tramo.hasta) return tramo.tipo;
  }
  return TRAMOS_IRPF_2025[TRAMOS_IRPF_2025.length - 1].tipo;
}

/**
 * Saneado de importes: NaN, Infinity y negativos NO se ignoran en silencio —
 * se computan como 0 € y se dice por qué. Un gasto negativo llegaba a restar del
 * total y producía rendimientos MAYORES que los ingresos (p. ej. −100 días de
 * dietas daban −2.667 € de gasto deducible).
 */
function importeSaneado(valor: number | undefined, etiqueta: string, advertencias: string[]): number {
  if (valor == null) return 0; // cubre undefined y el null que puede llegar del JSON
  if (!Number.isFinite(valor)) {
    advertencias.push(
      `DATO NO VÁLIDO: «${etiqueta}» no es un número finito. Se ha computado como 0 €; ` +
      'revise el dato y repita el cálculo.'
    );
    return 0;
  }
  if (valor < 0) {
    advertencias.push(
      `DATO NEGATIVO: «${etiqueta}» se ha recibido en negativo (${fmt(valor)}). Un gasto no ` +
      'puede ser negativo, así que se ha computado como 0 €.'
    );
    return 0;
  }
  return r(valor);
}

/** Igual que `importeSaneado`, pero para porcentajes (0-100). */
function porcentajeSaneado(valor: number | undefined, etiqueta: string, advertencias: string[]): number {
  if (valor == null) return 0; // cubre undefined y el null que puede llegar del JSON
  if (!Number.isFinite(valor)) {
    advertencias.push(
      `DATO NO VÁLIDO: «${etiqueta}» no es un número finito. Se ha computado como 0 %.`
    );
    return 0;
  }
  if (valor < 0) {
    advertencias.push(
      `DATO NEGATIVO: «${etiqueta}» se ha recibido en negativo (${fmt(valor)} %). Se ha computado como 0 %.`
    );
    return 0;
  }
  return r(valor);
}

/** Igual que `importeSaneado`, pero para días (no se redondea a céntimos). */
function diasSaneados(valor: number | undefined, etiqueta: string, advertencias: string[]): number {
  if (valor == null) return 0; // cubre undefined y el null que puede llegar del JSON
  if (!Number.isFinite(valor)) {
    advertencias.push(
      `DATO NO VÁLIDO: «${etiqueta}» no es un número finito. Se ha computado como 0 días.`
    );
    return 0;
  }
  if (valor < 0) {
    advertencias.push(
      `DATO NEGATIVO: «${etiqueta}» se ha recibido en negativo (${fmt(valor)} días). ` +
      'Se ha computado como 0 días.'
    );
    return 0;
  }
  return valor;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularDeduccionAutonomoIRPF(p: ParametrosDeduccionAutonomoIRPF): ResultadoDeduccionAutonomoIRPF {
  if (typeof p.ingresosBrutos !== 'number' || !Number.isFinite(p.ingresosBrutos)) {
    throw new Error('Los ingresos brutos deben ser un número finito (NaN e Infinity no son válidos).');
  }
  if (p.ingresosBrutos < 0) throw new Error('Los ingresos brutos no pueden ser negativos.');

  const gastos: GastoDeducibleAutonomo[] = [];
  const advertencias: string[] = [];

  // Todas las cifras se sanean y redondean UNA vez, aquí, y a partir de este punto
  // solo se opera con los valores ya redondeados. Así el desglose publicado cuadra
  // consigo mismo: hasta el 09/09/2026 `ingresosBrutos` se publicaba redondeado
  // pero el rendimiento previo se calculaba con el valor en crudo, y 56 de cada
  // 2.997 combinaciones publicaban un desglose que no sumaba (1,9 %).
  const ingresos = r(p.ingresosBrutos);
  const cuotasSS = importeSaneado(p.cuotasSSAutonomo, 'cuotas SS autónomo (RETA)', advertencias);
  const alquiler = importeSaneado(p.alquilerLocal, 'alquiler de local u oficina', advertencias);
  const suministros = importeSaneado(p.gastosSupministrosHogar, 'suministros del hogar', advertencias);
  const asesoria = importeSaneado(p.gastosAsesoria, 'gastos de asesoría o gestoría', advertencias);
  const seguros = importeSaneado(p.gastosSeguros, 'gastos de seguros', advertencias);
  const otros = importeSaneado(p.otrosGastos, 'material de oficina, publicidad y formación', advertencias);
  const gastoDietas = importeSaneado(p.gastosDietas, 'gastos de dietas', advertencias);
  const otrosAcreditados = importeSaneado(p.otrosGastosAcreditados, 'otros gastos acreditados', advertencias);

  let pctSuperficie = porcentajeSaneado(
    p.pctSuperficieActividadHogar, '% de superficie del hogar afecta a la actividad', advertencias
  );
  if (pctSuperficie > 100) {
    advertencias.push(
      `DATO FUERA DE RANGO: el porcentaje de superficie afecta a la actividad (${fmt(pctSuperficie)} %) ` +
      'no puede superar el 100 %. Se ha limitado al 100 %.'
    );
    pctSuperficie = 100;
  }

  // A) Cuotas SS
  if (cuotasSS > 0) {
    gastos.push({
      concepto: 'Cuotas SS autónomo (RETA)',
      importeTotal: cuotasSS,
      importeDeducible: cuotasSS,
      pctDeduccion: 100,
      observacion: 'Deducibles al 100% (art. 30.2.1 LIRPF). Incluye cuota base, mejoras voluntarias y contingencias profesionales.',
    });
  }

  // B) Alquiler local
  if (alquiler > 0) {
    gastos.push({
      concepto: 'Alquiler oficina / local de negocio',
      importeTotal: alquiler,
      importeDeducible: alquiler,
      pctDeduccion: 100,
      observacion: 'Deducible al 100% si el local se usa exclusivamente para la actividad. Requiere contrato de arrendamiento y facturas.',
    });
  }

  // C) Suministros hogar.
  //
  // ⚠️ La guarda antigua exigía gasto Y porcentaje, así que sin el % no se creaba
  // ni línea ni advertencia: los suministros declarados desaparecían del resultado
  // sin dejar rastro. El motor gemelo del mismo dominio
  // (`calcularGastosDeduciblesAutonomo`) SÍ cubría el caso; aquí se copia su
  // comportamiento y además se deja la línea con 0 € para que el importe declarado
  // aparezca en el desglose.
  if (suministros > 0) {
    // El % publicado es el que MANDA: el importe se deriva de él, no del porcentaje
    // en crudo. Antes el % se redondeaba a 2 decimales pero el importe usaba el
    // valor sin redondear, así que con 100.000 € y 33,335 % de superficie se
    // publicaba «10 %» y 10.000,50 €, que no se reconstruyen entre sí.
    const pctSuperficiePub = r(pctSuperficie);
    const pctDeduccion = r(pctSuperficiePub * PCT_SUMINISTROS_DEDUCIBLE / 100);
    const importeDeducible = r(suministros * pctDeduccion / 100);
    gastos.push({
      concepto: 'Suministros hogar (oficina en casa)',
      importeTotal: suministros,
      importeDeducible,
      pctDeduccion,
      observacion: pctDeduccion > 0
        ? `Fórmula: ${PCT_SUMINISTROS_DEDUCIBLE}% × ${fmt(pctSuperficiePub)}% de superficie afecta = ${fmt(pctDeduccion)}% del total de suministros. Art. 30.2.5 LIRPF.`
        : `Sin porcentaje de superficie afecta declarado, la fórmula del art. 30.2.5 LIRPF (${PCT_SUMINISTROS_DEDUCIBLE}% × % de superficie) da 0%: los ${fmt(suministros)} € declarados NO se han computado como deducibles.`,
    });
    if (pctDeduccion > 0) {
      advertencias.push('Para deducir suministros del hogar, el autónomo debe estar dado de alta con el domicilio habitual como sede de la actividad (en el modelo 036/037). AEAT puede requerir acreditación de la afectación.');
    } else {
      advertencias.push(
        `VIVIENDA HABITUAL: ha declarado ${fmt(suministros)} € de suministros del domicilio pero no ha ` +
        'especificado el porcentaje de superficie afecta a la actividad (metros cuadrados del despacho / ' +
        'total de la vivienda). Sin ese dato, los suministros se calculan al 0 % y NO reducen el ' +
        'rendimiento. Indique el porcentaje de superficie y repita el cálculo.'
      );
    }
  }

  // D) Asesoría / gestoría
  if (asesoria > 0) {
    gastos.push({
      concepto: 'Asesoría / gestoría',
      importeTotal: asesoria,
      importeDeducible: asesoria,
      pctDeduccion: 100,
      observacion: 'Deducibles al 100% con factura. Incluye asesoría fiscal, laboral, contable y jurídica.',
    });
  }

  // E) Seguros
  if (seguros > 0) {
    gastos.push({
      concepto: 'Seguros (RC, accidentes, salud)',
      importeTotal: seguros,
      importeDeducible: seguros,
      pctDeduccion: 100,
      observacion: 'Deducibles al 100%: seguros de responsabilidad civil, accidentes, salud (hasta 500 €/persona IRPF como retribución en especie exenta). Con factura.',
    });
  }

  // F) Otros gastos (material, publicidad, formación)
  if (otros > 0) {
    gastos.push({
      concepto: 'Material de oficina, publicidad, formación y otros',
      importeTotal: otros,
      importeDeducible: otros,
      pctDeduccion: 100,
      observacion: 'Deducibles al 100% si están vinculados a la actividad y están justificados con factura.',
    });
  }

  // G) Dietas propias del autónomo
  const diasEspSin = diasSaneados(p.diasDietasEspaniaSinPernoctar, 'días de dietas en España sin pernoctar', advertencias);
  const diasEspPer = diasSaneados(p.diasDietasEspaniaPernoctando, 'días de dietas en España pernoctando', advertencias);
  const diasExtSin = diasSaneados(p.diasDietasExtranjeroSinPernoctar, 'días de dietas en el extranjero sin pernoctar', advertencias);
  const diasExtPer = diasSaneados(p.diasDietasExtranjeroPernoctando, 'días de dietas en el extranjero pernoctando', advertencias);
  const totalDiasDietas = diasEspSin + diasEspPer + diasExtSin + diasExtPer;

  const limiteDietas = r(
    diasEspSin * DIETA_MAX_ESPANIA_SIN_PERNOCTAR +
    diasEspPer * DIETA_MAX_ESPANIA_PERNOCTANDO +
    diasExtSin * DIETA_MAX_EXTRANJERO_SIN_PERNOCTAR +
    diasExtPer * DIETA_MAX_EXTRANJERO_PERNOCTANDO
  );

  if (gastoDietas > 0 || limiteDietas > 0) {
    const importeDeducibleDietas = r(Math.min(gastoDietas, limiteDietas));
    const excesoDietas = r(gastoDietas - importeDeducibleDietas);
    gastos.push({
      concepto: 'Dietas propias del autónomo (hostelería + tarjeta)',
      importeTotal: gastoDietas,
      importeDeducible: importeDeducibleDietas,
      pctDeduccion: gastoDietas > 0 ? r(importeDeducibleDietas / gastoDietas * 100) : 0,
      observacion:
        `Límite según días declarados: ${fmt(limiteDietas)} €` +
        (excesoDietas > 0 ? `. No deducible por exceso sobre el límite: ${fmt(excesoDietas)} €` : '') +
        '. Requiere pago con tarjeta y que la actividad se realice en establecimiento de hostelería (art. 30.2.6 LIRPF).',
    });
    advertencias.push('Las dietas del autónomo son deducibles solo si se pagan con medios electrónicos y en establecimientos de hostelería/restauración. Los importes en efectivo no son deducibles.');

    // ⚠️ Sin días declarados el límite es 0 y `Math.min(gasto, 0)` se tragaba el
    // gasto entero: la línea salía a 0 € y ninguna advertencia decía que faltaba
    // el dato. Hasta 1.200 € reportados como no deducibles por un dato que falta.
    if (gastoDietas > 0 && totalDiasDietas === 0) {
      advertencias.push(
        `DIETAS SIN DÍAS DECLARADOS: ha declarado ${fmt(gastoDietas)} € de dietas pero ningún día de ` +
        'desplazamiento. El límite del art. 9 RIRPF se calcula POR DÍA (26,67 €/día en España sin ' +
        'pernoctar, 53,34 € pernoctando; 48,08 € y 91,35 € en el extranjero), de modo que sin días el ' +
        'importe deducible es 0 €. Indique los días de cada tipo y repita el cálculo.'
      );
    }
  }

  // H) Otros gastos acreditados
  if (otrosAcreditados > 0) {
    gastos.push({
      concepto: 'Otros gastos acreditados (amortizaciones, compras, etc.)',
      importeTotal: otrosAcreditados,
      importeDeducible: otrosAcreditados,
      pctDeduccion: 100,
      observacion: 'Gastos deducibles adicionales acreditados con factura y vinculados a la actividad económica.',
    });
  }

  const totalGastosDeducibles = r(gastos.reduce((s, g) => s + g.importeDeducible, 0));
  const rendimientoNetoPrevio = r(ingresos - totalGastosDeducibles);

  // Deducción gastos difícil justificación (solo EDS)
  let deduccionDificilJustificacion = 0;
  if (p.modalidadEstimacion === 'simplificada' && rendimientoNetoPrevio > 0) {
    deduccionDificilJustificacion = r(Math.min(
      rendimientoNetoPrevio * PCT_DIFICIL_JUSTIFICACION_EDS / 100,
      LIMITE_DIFICIL_JUSTIFICACION
    ));
  }

  const rendimientoNetoActividad = r(rendimientoNetoPrevio - deduccionDificilJustificacion);

  // ─── Cuota por la escala general ────────────────────────────────────────────
  //
  // POR QUÉ NO SE LLAMA A `calcularIRPF` de lib/calculadoras/irpf.ts, teniéndolo al lado:
  //
  //   1. Su cadena es la de los rendimientos del TRABAJO (gastos del art. 19 y
  //      reducción del art. 20). Aquí se calculan rendimientos de ACTIVIDADES
  //      ECONÓMICAS, a los que el art. 20 no les aplica. Con `esTrabajador: false`
  //      se saltan ambos, y de `calcularIRPF` solo quedaría vivo lo que hay abajo.
  //   2. Lo único que entonces añadiría es minorar el mínimo personal y familiar,
  //      y ese mínimo es PERSONAL, no de la actividad: este motor solo ve UNA
  //      fuente de renta y ninguna circunstancia familiar. Como la tool está
  //      declarada «encadenable con calcular_irpf», si aquí ya se minorase el
  //      mínimo y el LLM sumara ambos resultados para el mismo contribuyente, el
  //      mínimo se restaría DOS veces.
  //
  // Por eso se publica la cuota íntegra de la escala —cota SUPERIOR bien definida—
  // y se nombra en una advertencia, en euros, cuánto la bajaría el mínimo personal.
  // Lo que SÍ se importa de `@/data/fiscal` es la escala: la copia local que había
  // aquí ya no existe.
  const tipoIRPFEstimado = tipoMarginalEscala(rendimientoNetoActividad);
  const cuotaIRPFEstimada = cuotaEscalaGeneral(rendimientoNetoActividad);
  const tipoEfectivoEstimado = rendimientoNetoActividad > 0
    ? r(cuotaIRPFEstimada / rendimientoNetoActividad * 100)
    : 0;

  // Efecto del mínimo personal por el método del art. 63.1.2º LIRPF: la escala se
  // aplica a la base completa y la cuota se minora en la escala aplicada al mínimo.
  const minimoPersonal = MINIMOS_IRPF_2025.personal;
  const cuotaDelMinimoPersonal = cuotaEscalaGeneral(Math.min(minimoPersonal, rendimientoNetoActividad));

  advertencias.push(`Gastos de difícil justificación: solo aplicable en estimación directa SIMPLIFICADA. El ${PCT_DIFICIL_JUSTIFICACION_EDS}% del rendimiento neto previo, con un máximo de ${LIMITE_DIFICIL_JUSTIFICACION.toLocaleString('es-ES')} €/año (art. 30.2.4 RIRPF).`);
  advertencias.push('El vehículo de uso mixto (laboral y personal) NO es deducible en estimación directa salvo que se acredite uso exclusivo para la actividad (muy restrictivo según AEAT). Para agentes comerciales y transporte: posible 100%.');
  advertencias.push(
    `La cuota se obtiene aplicando la escala general TRAMO A TRAMO (art. 63 LIRPF): el ${tipoIRPFEstimado} % ` +
    'es el tipo MARGINAL, el que grava el último euro, y NO el que se paga sobre todo el rendimiento. ' +
    `El tipo efectivo real es del ${fmt(tipoEfectivoEstimado)} %.`
  );
  advertencias.push(
    `La cuota estimada es ANTERIOR a minorar el mínimo personal (${fmt(minimoPersonal)} €) y no considera ` +
    'circunstancias familiares, otras fuentes de renta, retenciones ni pagos fraccionados del modelo 130. ' +
    `Solo por el mínimo personal, la cuota bajaría en ${fmt(cuotaDelMinimoPersonal)} € ` +
    `(quedaría en ${fmt(r(cuotaIRPFEstimada - cuotaDelMinimoPersonal))} €). Use calcular_irpf para la cuota ` +
    'con todas las circunstancias personales y familiares.'
  );

  return {
    ingresosBrutos: ingresos,
    gastos,
    totalGastosDeducibles,
    rendimientoNetoPrevio,
    deduccionDificilJustificacion,
    rendimientoNetoActividad,
    tipoIRPFEstimado,
    tipoEfectivoEstimado,
    cuotaIRPFEstimada,
    advertencias,
    fuenteDatos:
      'LIRPF arts. 28-30 + RIRPF arts. 22 y 30 + DGT consultas vinculantes · escala general: ' +
      `${FISCAL_IRPF_META.fuente} — vigencia ${FISCAL_IRPF_META.vigencia}, verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
