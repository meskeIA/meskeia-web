/**
 * Motor del Comparador eléctrico vs combustión — sin dependencias, para poder probarlo a mano.
 *
 * EL MODELO
 * ─────────
 *   uso EV (€/año)       = km/100 · kWh/100 km · €/kWh + mantenimiento EV
 *   uso gasolina (€/año) = km/100 · l/100 km · €/l     + mantenimiento gasolina
 *   coste total EV(n)       = precio EV − ayuda + cargador + uso EV · n
 *   coste total gasolina(n) = precio gasolina + uso gasolina · n
 *   ventaja del EV(n)       = gasolina(n) − EV(n) = −I + S · n
 * con I = precio EV − ayuda + cargador − precio gasolina (diferencia inicial) y
 * S = uso gasolina − uso EV (lo que el eléctrico ahorra, o cuesta de más, cada año).
 *
 * POR QUÉ ASÍ (26/09/2026, hallazgos 1995 y 1998 del Inspector)
 * ─────────────────────────────────────────────────────────────
 * · El cargador se paga al comprar: entra ENTERO en el año 0 y una sola vez. Antes se repartía
 *   como cargador/10 cada año, así que antes del año 10 faltaba una parte (el equilibrio salía
 *   un año antes) y a 15 años se contaba 1,5 veces.
 * · Las columnas de coste son costes TOTALES (compra + uso), no una diferencia rotulada como
 *   coste: la tabla mostraba «costes» negativos cuando el eléctrico era más barato de comprar.
 * · La ventaja es una recta: si S ≤ 0 no crece nunca. Si además el eléctrico es más barato de
 *   comprar (I < 0), va por delante al principio y su ventaja se AGOTA; decir que «cada año
 *   adicional supone un ahorro mayor» a partir del primer año positivo era falso en ese caso.
 */

export interface DatosComparador {
  precioElectrico: number;
  precioGasolina: number;
  ayuda: number;
  kmAnuales: number;
  consumoElectrico: number;     // kWh/100 km
  consumoGasolina: number;      // l/100 km
  precioLuz: number;            // €/kWh
  precioGasolinaLitro: number;  // €/l
  cargador: number;
  mantElectrico: number;        // €/año
  mantGasolina: number;         // €/año
  anios: number;
}

export interface FilaAnual {
  anio: number;
  costeTotalEV: number;
  costeTotalGas: number;
  /** positivo = el eléctrico lleva ahorrado ese importe */
  ventajaEV: number;
}

/**
 * - `equilibrio`: el eléctrico cuesta más de comprar y lo recupera dentro del horizonte.
 * - `fuera-horizonte`: lo recupera, pero después del horizonte elegido.
 * - `desde-compra`: el eléctrico no cuesta más de comprar y su uso no es más caro.
 * - `ventaja-se-agota`: más barato de comprar, más caro de usar: la ventaja baja cada año.
 * - `nunca`: cuesta más de comprar y su uso no es más barato: no se recupera nunca.
 */
export type TipoVeredicto =
  | 'equilibrio'
  | 'fuera-horizonte'
  | 'desde-compra'
  | 'ventaja-se-agota'
  | 'nunca';

export interface ResultadoComparador {
  anios: number;
  energiaEV: number;
  energiaGas: number;
  /** S: ahorro de uso del eléctrico al año (negativo si su uso es más caro). */
  ahorroAnual: number;
  /** I: cuánto más cuesta el eléctrico al comprarlo, con cargador y tras la ayuda. */
  inversionInicialExtra: number;
  costePorKmEV: number;
  costePorKmGas: number;
  /** El eléctrico gasta menos en energía por km que la gasolina. */
  energiaMasBarataEV: boolean;
  tipo: TipoVeredicto;
  /** Primer año con ventaja ≥ 0 (tipos `equilibrio` y `fuera-horizonte`). */
  anioEquilibrio: number | null;
  /** Primer año con ventaja < 0 (tipo `ventaja-se-agota`). */
  anioCruce: number | null;
  tabla: FilaAnual[];
}

/** Redondeo a céntimos: evita que 0,1 + 0,2 decida de qué lado cae un año. */
function centimos(x: number): number {
  return Math.round(x * 100) / 100;
}

function ventaja(inversion: number, ahorro: number, n: number): number {
  return centimos(-inversion + ahorro * n);
}

/** Primer año n ≥ 1 con −I + S·n ≥ 0, para I > 0 y S > 0. */
export function anioDeEquilibrio(inversion: number, ahorro: number): number {
  let n = Math.max(1, Math.ceil(inversion / ahorro));
  while (n > 1 && ventaja(inversion, ahorro, n - 1) >= 0) n--;
  while (ventaja(inversion, ahorro, n) < 0) n++;
  return n;
}

/** Primer año n ≥ 1 con −I + S·n < 0, para I < 0 y S < 0. */
function anioDeCruce(inversion: number, ahorro: number): number {
  let n = Math.max(1, Math.floor(inversion / ahorro) + 1);
  while (n > 1 && ventaja(inversion, ahorro, n - 1) < 0) n--;
  while (ventaja(inversion, ahorro, n) >= 0) n++;
  return n;
}

export function calcularComparador(d: DatosComparador): ResultadoComparador {
  const energiaEV = (d.kmAnuales / 100) * d.consumoElectrico * d.precioLuz;
  const energiaGas = (d.kmAnuales / 100) * d.consumoGasolina * d.precioGasolinaLitro;
  const usoEV = energiaEV + d.mantElectrico;
  const usoGas = energiaGas + d.mantGasolina;

  const compraEV = d.precioElectrico - d.ayuda + d.cargador;
  const compraGas = d.precioGasolina;
  const inversionInicialExtra = centimos(compraEV - compraGas);
  const ahorroAnual = centimos(usoGas - usoEV);

  const tabla: FilaAnual[] = [];
  for (let anio = 1; anio <= d.anios; anio++) {
    tabla.push({
      anio,
      costeTotalEV: centimos(compraEV + usoEV * anio),
      costeTotalGas: centimos(compraGas + usoGas * anio),
      ventajaEV: ventaja(inversionInicialExtra, ahorroAnual, anio),
    });
  }

  let tipo: TipoVeredicto;
  let anioEquilibrio: number | null = null;
  let anioCruce: number | null = null;

  if (inversionInicialExtra <= 0 && ahorroAnual >= 0) {
    tipo = 'desde-compra';
  } else if (ahorroAnual > 0) {
    anioEquilibrio = anioDeEquilibrio(inversionInicialExtra, ahorroAnual);
    tipo = anioEquilibrio <= d.anios ? 'equilibrio' : 'fuera-horizonte';
  } else if (inversionInicialExtra < 0) {
    // ahorroAnual < 0: más barato de comprar, más caro de usar
    tipo = 'ventaja-se-agota';
    anioCruce = anioDeCruce(inversionInicialExtra, ahorroAnual);
  } else {
    tipo = 'nunca';
  }

  return {
    anios: d.anios,
    energiaEV,
    energiaGas,
    ahorroAnual,
    inversionInicialExtra,
    costePorKmEV: usoEV / d.kmAnuales,
    costePorKmGas: usoGas / d.kmAnuales,
    energiaMasBarataEV: energiaEV < energiaGas,
    tipo,
    anioEquilibrio,
    anioCruce,
    tabla,
  };
}
