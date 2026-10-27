/**
 * Estimador IRPF — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_irpf)
 *
 * Calcula la cuota diferencial IRPF incluyendo rendimientos del trabajo,
 * capital mobiliario e inmobiliario, aplicando gastos deducibles,
 * reducción RNT, mínimos personales y familiares.
 *
 * Fuente: Ley 35/2006 IRPF + LPGE 2025
 */

import {
  TRAMOS_IRPF_2025,
  calcularCuotaIntegraGeneral,
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  calcularRendimientoNetoTrabajo,
  REDUCCION_TRIBUTACION_CONJUNTA_2025,
  FISCAL_IRPF_META,
  calcularDeduccionRentasBajas,
  limitarDeduccionRendimientosTrabajo,
  DEDUCCION_RENDIMIENTOS_TRABAJO,
} from '@/data/fiscal';

/** Ejercicio de las cuantías de la DA 61.ª: el mismo que el resto de datos de este motor y que estimador-irpf. */
const EJERCICIO_DEDUCCION_TRABAJO = 2025 as const;

// ─── Tipos públicos ────────────────────────────────────────────────────────────

// Tramos de la base del ahorro. Esta copia SÍ tenía el 30 % correcto, a diferencia de las
// otras nueve del catálogo —que se quedaron en el 28 % de 2024 y se drenaron el 09/09/2026—,
// pero se importa igualmente: una copia que hoy coincide es una copia que mañana diverge, y
// es exactamente así como las otras nueve llegaron a divergir sin que nadie lo viera.
const TRAMOS_AHORRO_2025 = TRAMOS_GANANCIAS_PATRIMONIALES_2025;

export type SituacionFamiliarIRPF = 'soltero' | 'casado_sin_ingresos' | 'casado_con_ingresos';

export interface ParametrosIRPF {
  /** Rendimientos netos del trabajo (bruto - SS) */
  rendimientosTrabajo: number;
  /** Rendimientos capital mobiliario (dividendos, intereses...) */
  rendimientosCapitalMobiliario?: number;
  /** Rendimientos capital inmobiliario (alquiler...) */
  rendimientosCapitalInmobiliario?: number;
  /** Ganancias patrimoniales a largo plazo (>12 meses) */
  gananciasPLargo?: number;
  /** Ganancias patrimoniales a corto plazo (≤12 meses) */
  gananciasPCorto?: number;
  /** Retenciones ya practicadas (€) */
  retenciones?: number;
  /** Situación familiar */
  situacion?: SituacionFamiliarIRPF;
  /** Número de hijos */
  numHijos?: number;
  /** Hijos menores de 3 años */
  hijosMenores3?: number;
  /** ¿Tiene rendimientos del trabajo? (para aplicar gastos deducibles) */
  esTrabajador?: boolean;
  /**
   * Rendimientos ÍNTEGROS del trabajo (el bruto, sin restar la SS). Con `esNomina`, permite
   * aplicar la deducción de la DA 61.ª LIRPF, que se mide sobre los íntegros (cabo C0469).
   */
  brutoTrabajo?: number;
  /** ¿Los rendimientos del trabajo son de prestación efectiva de servicios (nómina)? Una pensión no lo es. */
  esNomina?: boolean;
}

export interface TramoDetalle {
  desde: number;
  hasta: number;
  tipo: number;
  cuota: number;
}

export interface ResultadoIRPF {
  /** Rendimientos netos del trabajo (tras gastos deducibles y reducción RNT) */
  rendimientosTrabajoNetos: number;
  /** Gastos deducibles trabajo */
  gastosDeducibles: number;
  /** Reducción RNT aplicada */
  reduccionRNT: number;
  /** Base imponible general */
  baseImponibleGeneral: number;
  /** Base imponible del ahorro */
  baseImponibleAhorro: number;
  /** Mínimo personal y familiar */
  minimoPersonalFamiliar: number;
  /** Reducción por tributación conjunta (art. 84.2): 3.400 € con un solo perceptor */
  reduccionConjunta: number;
  /** Parte del mínimo que no cabe en la base general y pasa a la del ahorro (art. 56.2) */
  minimoEnAhorro: number;
  /** Base liquidable general */
  baseLiquidableGeneral: number;
  /** Base liquidable del ahorro */
  baseLiquidableAhorro: number;
  /** Cuota íntegra general */
  cuotaIntegraGeneral: number;
  /** Cuota íntegra ahorro */
  cuotaIntegralAhorro: number;
  /** Cuota íntegra total */
  cuotaIntegra: number;
  /** Deducción por obtención de rendimientos del trabajo (DA 61.ª), ya topada; 0 si no se aplicó */
  deduccionRendimientosTrabajo: number;
  /**
   * true si la deducción de la DA 61.ª podría corresponder y no se ha aplicado porque faltan
   * `brutoTrabajo` y `esNomina`: el resultado no la incluye y hay que decirlo
   */
  deduccionTrabajoSinDatos: boolean;
  /** Cuota tras la deducción de la DA 61.ª */
  cuotaLiquida: number;
  /** Retenciones practicadas */
  retenciones: number;
  /** Cuota diferencial (a pagar / devolver) */
  cuotaDiferencial: number;
  /** Tipo efectivo general (%) */
  tipoEfectivoGeneral: number;
  /** Desglose por tramos generales */
  desgloseGeneral: TramoDetalle[];
  /** Desglose por tramos ahorro */
  desgloseAhorro: TramoDetalle[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const r = (n: number) => Math.round(n * 100) / 100;

function calcularCuotaTramos(
  base: number,
  tramos: { hasta: number; tipo: number }[]
): { cuota: number; desglose: TramoDetalle[] } {
  let cuota = 0;
  let baseAnterior = 0;
  const desglose: TramoDetalle[] = [];
  for (const tramo of tramos) {
    if (base <= baseAnterior) break;
    const baseEnTramo = Math.min(base, tramo.hasta) - baseAnterior;
    const cuotaTramo = baseEnTramo * (tramo.tipo / 100);
    cuota += cuotaTramo;
    desglose.push({
      desde: baseAnterior,
      hasta: Math.min(base, tramo.hasta),
      tipo: tramo.tipo,
      cuota: r(cuotaTramo),
    });
    baseAnterior = tramo.hasta;
  }
  return { cuota, desglose };
}

function calcularMinimo(situacion: SituacionFamiliarIRPF, numHijos: number, hijosMenores3: number): number {
  let minimo = MINIMOS_IRPF_2025.personal;
  const ordenHijos = [MINIMOS_IRPF_2025.hijo_1, MINIMOS_IRPF_2025.hijo_2, MINIMOS_IRPF_2025.hijo_3];
  let descendientes = 0;
  for (let i = 0; i < numHijos; i++) {
    descendientes += i < 3 ? ordenHijos[i] : MINIMOS_IRPF_2025.hijo_4_mas;
  }
  // Un menor de 3 años es uno de los hijos: no puede haber más que hijos (como estimador-irpf)
  descendientes += Math.min(hijosMenores3, numHijos) * MINIMOS_IRPF_2025.hijo_menor_3;
  // Dos cónyuges con ingresos: cada uno aplica la mitad del mínimo por descendientes
  // (art. 61.1.ª LIRPF). Hasta el 25/09/2026 entraba entero (hallazgo 1688, mismo defecto).
  minimo += situacion === 'casado_con_ingresos' ? descendientes / 2 : descendientes;
  return minimo;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularIRPF(p: ParametrosIRPF): ResultadoIRPF {
  if (p.rendimientosTrabajo < 0) throw new Error('Los rendimientos del trabajo no pueden ser negativos.');

  const situacion = p.situacion ?? 'soltero';
  const numHijos = p.numHijos ?? 0;
  const hijosMenores3 = p.hijosMenores3 ?? 0;
  const esTrabajador = p.esTrabajador !== false;

  const capInmob = p.rendimientosCapitalInmobiliario ?? 0;
  const gananciaCorto = p.gananciasPCorto ?? 0;
  const capMob = p.rendimientosCapitalMobiliario ?? 0;
  const gananciaLargo = p.gananciasPLargo ?? 0;

  // Rendimientos del trabajo netos
  // `rendimientosTrabajo` llega ya sin la SS (bruto − SS), así que es el rendimiento sobre el
  // que el art. 20 mide su reducción; los 2.000 € de la letra f) se restan DESPUÉS. Hasta el
  // 25/09/2026 se restaban antes (hallazgo 1687 de estimador-sueldo-neto, mismo defecto).
  // Y la reducción se pierde con más de 6.500 € de rentas distintas del trabajo (art. 20 LIRPF),
  // como en estimador-irpf: hasta el 26/10/2026 no se le pasaban, y 9.000 € netos de trabajo con
  // 7.000 € de intereses pagaban 1.350,00 € donde son 1.625,50 € (hito unificar-app-motor).
  const rendimiento = calcularRendimientoNetoTrabajo({
    integros: p.rendimientosTrabajo,
    gastosAaE: 0,
    otrosGastos: esTrabajador ? GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral : 0,
    otrasRentas: Math.max(0, capInmob) + Math.max(0, gananciaCorto) + Math.max(0, capMob) + Math.max(0, gananciaLargo),
  });
  const reduccionRNT = r(esTrabajador ? rendimiento.reduccion : 0);
  const rendimientosTrabajoNetos = r(Math.max(0, rendimiento.rendimientoNeto - reduccionRNT));

  // Base imponible general
  const baseImponibleGeneral = r(rendimientosTrabajoNetos + capInmob + gananciaCorto);

  // Base imponible del ahorro
  const baseImponibleAhorro = r(Math.max(0, capMob + gananciaLargo));

  // Mínimo personal y familiar
  const minimoPersonalFamiliar = calcularMinimo(situacion, numHijos, hijosMenores3);

  // Reducción por tributación conjunta (art. 84.2 LIRPF), como estimador-irpf con «casado/a (un
  // ingreso)»: la base general primero y el remanente, la del ahorro. Hasta el 26/10/2026 no
  // existía aquí: 40.000 € de capital con 2 hijos pagaban 8.280,00 € donde son 5.449,50 €.
  const reduccionConjunta = situacion === 'casado_sin_ingresos' ? REDUCCION_TRIBUTACION_CONJUNTA_2025.biparental : 0;
  const reduccionConjuntaGeneral = Math.min(reduccionConjunta, Math.max(0, baseImponibleGeneral));
  const baseLiquidableAhorro = r(Math.max(0, baseImponibleAhorro - (reduccionConjunta - reduccionConjuntaGeneral)));

  // Base liquidable general.
  //
  // ⚠️ CORREGIDO EL 09/09/2026. Hasta hoy esta línea era
  //     baseLiquidableGeneral = baseImponibleGeneral − minimoPersonalFamiliar
  // es decir, restaba el mínimo de la BASE. Eso lo valora al tipo MARGINAL del
  // contribuyente, y el art. 63.1.2º LIRPF establece justo lo contrario: la escala se
  // aplica a la base liquidable completa y la cuota resultante «se minorará en el importe
  // derivado de aplicar a la parte de la base liquidable general correspondiente al mínimo
  // personal y familiar esta misma escala» (AEAT, Manual práctico Renta 2025, «Gravamen
  // estatal»). El mínimo se valora así a los tipos de los PRIMEROS tramos, no al marginal.
  //
  // El método antiguo subestimaba la cuota, y cuanto más alta la renta más: con 50.000 € de
  // base y 5.550 € de mínimo daba 12.148,00 € donde corresponden 13.147,00 € — casi 1.000 €
  // menos. Lo destapó que dos tools del mismo MCP discreparan 255 €/año en el mismo caso.
  const baseLiquidableGeneral = r(baseImponibleGeneral - reduccionConjuntaGeneral);
  // Lo que del mínimo no cabe en la base general se grava a tipo cero en la del ahorro (art.
  // 56.2 LIRPF). Hasta el 26/10/2026 se perdía: 500 € de intereses sin otras rentas pagaban 95 €.
  const minimoEnAhorro = Math.max(0, minimoPersonalFamiliar - Math.max(0, baseLiquidableGeneral));

  // Cuota integra general = escala(base liquidable) - escala(minimo personal y familiar).
  // Desde el 12/09/2026 esa resta la hace `calcularCuotaIntegraGeneral` y ya no se
  // reescribe aqui; `calcularCuotaTramos` se conserva solo para el DESGLOSE que se imprime,
  // que es el de la primera aplicacion de la escala (a la base entera).
  const { desglose: desgloseGeneral } = calcularCuotaTramos(
    baseLiquidableGeneral,
    TRAMOS_IRPF_2025,
  );
  const cuotaGeneral = calcularCuotaIntegraGeneral(baseLiquidableGeneral, minimoPersonalFamiliar);

  // Cuota íntegra ahorro, con la parte del mínimo que le corresponde (el desglose, sin ella)
  const { desglose: desgloseAhorro } = calcularCuotaTramos(baseLiquidableAhorro, TRAMOS_AHORRO_2025);
  const cuotaAhorro = calcularCuotaIntegraGeneral(baseLiquidableAhorro, minimoEnAhorro, TRAMOS_AHORRO_2025);

  const cuotaIntegra = r(cuotaGeneral + cuotaAhorro);

  // Deducción por obtención de rendimientos del trabajo (DA 61.ª LIRPF), como estimador-irpf:
  // solo por prestación efectiva de servicios y medida sobre los íntegros, que este motor no
  // conoce si solo recibe el neto de SS. Por eso va con los dos campos opcionales; sin ellos no
  // se aplica y el resultado lo dice (cabo C0469: con el SMI de 2025, 16.576 € brutos, la tool
  // daba 339,56 € de cuota donde la app da 0 €). El tope es la cuota íntegra general en la
  // proporción del trabajo en la base general (DA 61.ª.1, último párrafo).
  const otrasRentas = Math.max(0, capInmob) + Math.max(0, gananciaCorto) + Math.max(0, capMob) + Math.max(0, gananciaLargo);
  const bruto = p.brutoTrabajo ?? 0;
  if (p.brutoTrabajo !== undefined && bruto < p.rendimientosTrabajo) {
    throw new Error('El bruto del trabajo no puede ser menor que los rendimientos del trabajo netos de Seguridad Social.');
  }
  const conDatosDeduccion = p.esNomina !== undefined && p.brutoTrabajo !== undefined;
  const pesoTrabajo = baseImponibleGeneral > 0 ? rendimientosTrabajoNetos / baseImponibleGeneral : 0;
  const deduccionRendimientosTrabajo = conDatosDeduccion && p.esNomina && bruto > 0
    ? r(limitarDeduccionRendimientosTrabajo(
        calcularDeduccionRentasBajas(bruto, otrasRentas, EJERCICIO_DEDUCCION_TRABAJO),
        cuotaGeneral,
        pesoTrabajo,
      ))
    : 0;
  // Sin los datos, se avisa solo si la deducción podría corresponder: con un neto por encima del
  // límite el bruto también lo está, y con más otras rentas del límite no hay deducción
  const limites = DEDUCCION_RENDIMIENTOS_TRABAJO[EJERCICIO_DEDUCCION_TRABAJO];
  const deduccionTrabajoSinDatos = !conDatosDeduccion && esTrabajador
    && p.rendimientosTrabajo > 0 && p.rendimientosTrabajo < limites.limiteMaximo
    && otrasRentas <= limites.limiteOtrasRentas && cuotaGeneral > 0;
  const cuotaLiquida = r(Math.max(0, cuotaIntegra - deduccionRendimientosTrabajo));

  const retenciones = p.retenciones ?? 0;
  const cuotaDiferencial = r(cuotaLiquida - retenciones);

  const tipoEfectivoGeneral = baseImponibleGeneral > 0
    ? r((cuotaGeneral / baseImponibleGeneral) * 100)
    : 0;

  return {
    rendimientosTrabajoNetos,
    gastosDeducibles: rendimiento.otrosGastos,
    reduccionRNT,
    baseImponibleGeneral,
    baseImponibleAhorro,
    minimoPersonalFamiliar,
    reduccionConjunta: r(reduccionConjunta),
    minimoEnAhorro: r(minimoEnAhorro),
    baseLiquidableGeneral,
    baseLiquidableAhorro,
    cuotaIntegraGeneral: r(cuotaGeneral),
    cuotaIntegralAhorro: r(cuotaAhorro),
    cuotaIntegra,
    deduccionRendimientosTrabajo,
    deduccionTrabajoSinDatos,
    cuotaLiquida,
    retenciones,
    cuotaDiferencial,
    tipoEfectivoGeneral,
    desgloseGeneral,
    desgloseAhorro,
    fuenteDatos: `${FISCAL_IRPF_META.fuente} — verificado ${FISCAL_IRPF_META.verificado}`,
  };
}
