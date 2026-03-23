/**
 * Calculadora de Coeficientes de Abatimiento para Plusvalias Pre-1994
 * Usada por: MCP server (calcular_coeficientes_abatimiento)
 *
 * Calcula la reduccion aplicable sobre las ganancias patrimoniales derivadas
 * de elementos patrimoniales adquiridos antes del 31 de diciembre de 1994,
 * mediante los coeficientes de abatimiento (DT 9.a LIRPF).
 *
 * Marco normativo:
 *   - LIRPF DT 9.a: regimen transitorio ganancias patrimoniales pre-1994
 *   - Ley 26/2014: reforma que introdujo el limite de 400.000 EUR
 *   - DGT consultas vinculantes: criterios de aplicacion
 *
 * CONCEPTO:
 *   Los bienes adquiridos ANTES del 31/12/1994 generan ganancias con derecho
 *   a reduccion (abatimiento) sobre la parte de ganancia correspondiente al
 *   periodo anterior al 20/01/2006 (fecha de la reforma fiscal).
 *   La Ley 26/2014 limito el beneficio a un maximo acumulado de 400.000 EUR
 *   de valor de transmision en toda la vida del contribuyente.
 *
 * FUNCIONAMIENTO (DT 9.a LIRPF):
 *   1. La ganancia se divide en dos partes:
 *      a) Parte generada hasta el 19/01/2006: se aplica la reduccion
 *      b) Parte generada desde el 20/01/2006: sin reduccion (tributa normalmente)
 *
 *   2. La parte "pre-2006" se calcula linealmente segun los dias de cada periodo.
 *
 *   3. COEFICIENTES DE ABATIMIENTO por tipo de elemento:
 *      - Bienes inmuebles: 11,11% de reduccion por cada ano de tenencia antes de 31/12/1996
 *        (si el bien fue adquirido antes del 31/12/1986 → reduccion del 100%)
 *      - Acciones cotizadas en mercado organizado: 25% por cada ano
 *        (si adquiridas antes de 31/12/1991 → reduccion 100%)
 *      - Resto de bienes (acciones no cotizadas, otros): 14,28% por cada ano
 *        (si adquiridas antes de 31/12/1988 → reduccion 100%)
 *
 *   4. Los anos se computan desde la adquisicion hasta el 31/12/1996 (redondeados al alza).
 *
 * LIMITE DE 400.000 EUR (desde 2015):
 *   El total acumulado de valores de transmision sobre los que se aplica abatimiento
 *   a lo largo de toda la vida del contribuyente no puede superar 400.000 EUR.
 *   Hasta alcanzar ese limite, la reduccion es total segun los coeficientes.
 *
 * Fuente: LIRPF DT 9.a (Ley 26/2014) - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_plusvalias_irpf, calcular_venta_inmueble, calcular_irpf
 */

// --- Constantes ---

const FECHA_LIMITE_ADQUISICION = new Date('1994-12-31');
const FECHA_REFORMA_2006 = new Date('2006-01-20');
const FECHA_REFERENCIA_ABATIMIENTO = new Date('1996-12-31');

const LIMITE_ACUMULADO_400K = 400_000;   // EUR limite total acumulado de transmisiones

// Porcentajes de reduccion por ano de tenencia antes de 31/12/1996
const PCT_ABATIMIENTO_INMUEBLE_POR_ANO = 11.11;      // %
const PCT_ABATIMIENTO_ACCIONES_POR_ANO = 25;          // %
const PCT_ABATIMIENTO_OTROS_POR_ANO = 14.28;          // %

// Fechas a partir de las cuales el abatimiento es del 100%
const FECHA_100_PCT_INMUEBLES = new Date('1986-12-31');
const FECHA_100_PCT_ACCIONES = new Date('1991-12-31');
const FECHA_100_PCT_OTROS = new Date('1988-12-31');

// --- Tipos publicos ---

export type TipoActivoAbatimiento = 'inmueble' | 'acciones_cotizadas' | 'otros';

export interface ParametrosCoeficientesAbatimiento {
  tipoActivo: TipoActivoAbatimiento;
  /** Fecha de adquisicion del activo (debe ser anterior al 31/12/1994) */
  fechaAdquisicion: string;   // formato ISO: 'YYYY-MM-DD'
  /** Fecha de transmision */
  fechaTransmision: string;   // formato ISO: 'YYYY-MM-DD'
  /** Valor de adquisicion (EUR) */
  valorAdquisicion: number;
  /** Gastos de adquisicion (EUR) */
  gastosAdquisicion?: number;
  /** Valor de transmision (EUR) */
  valorTransmision: number;
  /** Gastos de transmision (EUR) */
  gastosTransmision?: number;
  /**
   * Valor acumulado de transmisiones previas sobre las que se aplico abatimiento (EUR)
   * Para verificar si se ha alcanzado el limite de 400.000 EUR
   */
  valorTransmisionesAnterioresConAbatimiento?: number;
}

export interface ResultadoCoeficientesAbatimiento {
  tipoActivo: TipoActivoAbatimiento;
  /** Valor de adquisicion total (con gastos) (EUR) */
  valorAdquisicionTotal: number;
  /** Valor de transmision neto (EUR) */
  valorTransmisionNeto: number;
  /** Ganancia patrimonial total (EUR) */
  gananciaTotalBruta: number;
  /** Dias totales de tenencia */
  diasTenenciaTotal: number;
  /** Dias de tenencia hasta el 19/01/2006 */
  diasHasta2006: number;
  /** Parte de la ganancia correspondiente al periodo pre-2006 (EUR) */
  gananciaPre2006: number;
  /** Anos de tenencia hasta el 31/12/1996 (para coeficientes) */
  anosHasta1996Redondeados: number;
  /** Porcentaje de reduccion aplicable (%) */
  pctReduccionAbatimiento: number;
  /** Reduccion por abatimiento aplicada (EUR) */
  reduccionAbatimiento: number;
  /** Ganancia sujeta tras abatimiento (EUR) */
  gananciaSujetaTotal: number;
  /** Limite disponible de 400.000 EUR tras transmisiones anteriores (EUR) */
  limiteDisponible: number;
  /** Cuota IRPF estimada escala del ahorro (EUR) */
  cuotaEstimada: number;
  advertencias: string[];
  fuenteDatos: string;
}

// --- Funcion auxiliar ---

function diasEntre(d1: Date, d2: Date): number {
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function cuotaAhorro(base: number): number {
  if (base <= 0) return 0;
  const tramos = [
    { hasta: 6_000, tipo: 19 }, { hasta: 50_000, tipo: 21 },
    { hasta: 200_000, tipo: 23 }, { hasta: 300_000, tipo: 27 }, { hasta: Infinity, tipo: 28 },
  ];
  let cuota = 0, resto = base, ant = 0;
  for (const t of tramos) {
    const tramo = Math.min(resto, t.hasta - ant);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    ant = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularCoeficientesAbatimiento(p: ParametrosCoeficientesAbatimiento): ResultadoCoeficientesAbatimiento {
  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const fechaAdq = new Date(p.fechaAdquisicion);
  const fechaTransm = new Date(p.fechaTransmision);

  if (fechaAdq > FECHA_LIMITE_ADQUISICION) {
    throw new Error(
      'El activo fue adquirido despues del 31/12/1994. ' +
      'Los coeficientes de abatimiento solo aplican a adquisiciones anteriores a esa fecha.'
    );
  }

  const gastosAdq = r(p.gastosAdquisicion ?? 0);
  const gastosTransm = r(p.gastosTransmision ?? 0);
  const valorAdquisicionTotal = r(p.valorAdquisicion + gastosAdq);
  const valorTransmisionNeto = r(p.valorTransmision - gastosTransm);
  const gananciaTotalBruta = r(Math.max(0, valorTransmisionNeto - valorAdquisicionTotal));

  if (gananciaTotalBruta === 0) {
    advertencias.push('No hay ganancia patrimonial. Si hay perdida, no se aplica abatimiento y la perdida puede compensar ganancias del ahorro.');
    return {
      tipoActivo: p.tipoActivo,
      valorAdquisicionTotal,
      valorTransmisionNeto,
      gananciaTotalBruta: 0,
      diasTenenciaTotal: diasEntre(fechaAdq, fechaTransm),
      diasHasta2006: 0,
      gananciaPre2006: 0,
      anosHasta1996Redondeados: 0,
      pctReduccionAbatimiento: 0,
      reduccionAbatimiento: 0,
      gananciaSujetaTotal: 0,
      limiteDisponible: r(LIMITE_ACUMULADO_400K - (p.valorTransmisionesAnterioresConAbatimiento ?? 0)),
      cuotaEstimada: 0,
      advertencias,
      fuenteDatos: 'LIRPF DT 9.a (Ley 26/2014) - vigente 2025',
    };
  }

  // Proporcion de la ganancia correspondiente al periodo pre-2006
  const diasTotal = diasEntre(fechaAdq, fechaTransm);
  const diasHasta2006 = Math.max(0, diasEntre(fechaAdq, FECHA_REFORMA_2006));
  const propPre2006 = diasTotal > 0 ? diasHasta2006 / diasTotal : 0;
  const gananciaPre2006 = r(gananciaTotalBruta * propPre2006);

  // Anos de tenencia hasta 31/12/1996 (redondeados al alza)
  const diasHasta1996 = Math.max(0, diasEntre(fechaAdq, FECHA_REFERENCIA_ABATIMIENTO));
  const anosHasta1996Redondeados = Math.ceil(diasHasta1996 / 365);

  // Porcentaje de reduccion segun tipo de activo
  let pctReduccionAbatimiento = 0;
  const fecha100pct = p.tipoActivo === 'inmueble' ? FECHA_100_PCT_INMUEBLES
    : p.tipoActivo === 'acciones_cotizadas' ? FECHA_100_PCT_ACCIONES
    : FECHA_100_PCT_OTROS;
  const pctPorAno = p.tipoActivo === 'inmueble' ? PCT_ABATIMIENTO_INMUEBLE_POR_ANO
    : p.tipoActivo === 'acciones_cotizadas' ? PCT_ABATIMIENTO_ACCIONES_POR_ANO
    : PCT_ABATIMIENTO_OTROS_POR_ANO;

  if (fechaAdq <= fecha100pct) {
    pctReduccionAbatimiento = 100;
  } else {
    pctReduccionAbatimiento = Math.min(100, anosHasta1996Redondeados * pctPorAno);
  }

  // Limite de 400.000 EUR
  const valorTransmAnteriores = r(p.valorTransmisionesAnterioresConAbatimiento ?? 0);
  const limiteDisponible = r(Math.max(0, LIMITE_ACUMULADO_400K - valorTransmAnteriores));
  const valorTransmAbatible = Math.min(p.valorTransmision, limiteDisponible);
  const propAbatible = p.valorTransmision > 0 ? valorTransmAbatible / p.valorTransmision : 0;
  const gananciaPre2006Abatible = r(gananciaPre2006 * propAbatible);

  const reduccionAbatimiento = r(gananciaPre2006Abatible * pctReduccionAbatimiento / 100);
  const gananciaSujetaTotal = r(gananciaTotalBruta - reduccionAbatimiento);
  const cuotaEstimada = r(cuotaAhorro(gananciaSujetaTotal));

  // Advertencias
  if (p.valorTransmision > limiteDisponible) {
    advertencias.push(
      'LIMITE DE 400.000 EUR: el valor de transmision (' + p.valorTransmision.toLocaleString('es-ES') + ' EUR) ' +
      'supera el limite disponible (' + limiteDisponible.toLocaleString('es-ES') + ' EUR). ' +
      'Solo se aplica abatimiento sobre la parte proporcional al limite disponible.'
    );
  }
  advertencias.push(
    'Coeficientes de abatimiento: reduccion del ' + pctReduccionAbatimiento.toFixed(2) + '% sobre la ' +
    'parte de ganancia generada antes del 20/01/2006, proporcional a los ' + anosHasta1996Redondeados +
    ' anos completos de tenencia hasta el 31/12/1996.'
  );
  advertencias.push(
    'Limite acumulado vitalicio de 400.000 EUR: si el contribuyente ha realizado transmisiones ' +
    'previas con abatimiento, el limite disponible se reduce. ' +
    'Es obligatorio declarar el valor de todas las transmisiones previas con abatimiento.'
  );
  if (pctReduccionAbatimiento === 100) {
    advertencias.push(
      'Abatimiento del 100%: el activo fue adquirido con suficiente antelacion para que la ganancia ' +
      'pre-2006 quede totalmente exenta. Solo tributa la parte de ganancia generada despues del 19/01/2006.'
    );
  }

  return {
    tipoActivo: p.tipoActivo,
    valorAdquisicionTotal,
    valorTransmisionNeto,
    gananciaTotalBruta,
    diasTenenciaTotal: diasTotal,
    diasHasta2006,
    gananciaPre2006,
    anosHasta1996Redondeados,
    pctReduccionAbatimiento,
    reduccionAbatimiento,
    gananciaSujetaTotal,
    limiteDisponible,
    cuotaEstimada,
    advertencias,
    fuenteDatos: 'LIRPF DT 9.a (Ley 26/2014) - vigente 2025',
  };
}
