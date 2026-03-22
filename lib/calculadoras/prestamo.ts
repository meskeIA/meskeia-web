/**
 * Calculadora de Préstamos — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_prestamo)
 *
 * Soporta los tres sistemas de amortización bancarios:
 *   - Francés:   cuota constante (el más habitual en España)
 *   - Alemán:    amortización constante, cuotas decrecientes
 *   - Americano: solo intereses durante el plazo, capital al final (bullet)
 *
 * Incluye cálculo aproximado de TAE (con comisión de apertura).
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type SistemaAmortizacion = 'frances' | 'aleman' | 'americano';

export interface ParametrosPrestamo {
  /** Capital del préstamo en euros */
  capital: number;
  /** Plazo en meses */
  plazoMeses: number;
  /** Tipo de interés nominal anual (TIN) en % */
  tin: number;
  /** Sistema de amortización */
  sistema: SistemaAmortizacion;
  /** Comisión de apertura en % del capital (para cálculo TAE). Por defecto 0. */
  comisionApertura?: number;
}

export interface ResultadoPrestamo {
  /** Capital del préstamo */
  capital: number;
  /** Plazo en meses */
  plazoMeses: number;
  /** TIN anual (%) */
  tin: number;
  /** Sistema de amortización aplicado */
  sistema: SistemaAmortizacion;
  /** Nombre descriptivo del sistema */
  nombreSistema: string;
  /** Cuota del primer mes */
  cuotaInicial: number;
  /** Cuota del último mes */
  cuotaFinal: number;
  /** Total de intereses pagados */
  totalIntereses: number;
  /** Total pagado (capital + intereses + comisión) */
  totalPagado: number;
  /** TAE aproximada (incluyendo comisión de apertura si la hay) */
  taeAproximada: number;
  /** Comisión de apertura en euros */
  comisionAperturaEuros: number;
  /** Descripción del sistema para el usuario */
  descripcionSistema: string;
  /** Ventajas del sistema */
  ventajas: string;
  /** Primeros 6 meses de cuadro de amortización (muestra) */
  muestraCuotas: Array<{
    mes: number;
    cuota: number;
    interes: number;
    amortizacion: number;
    pendiente: number;
  }>;
}

// ─── Constantes descriptivas ───────────────────────────────────────────────────

const DESCRIPCIONES: Record<SistemaAmortizacion, { nombre: string; descripcion: string; ventajas: string }> = {
  frances: {
    nombre: 'Sistema Francés (cuota constante)',
    descripcion: 'Cuota mensual idéntica durante todo el préstamo. Al principio se pagan más intereses y menos capital; al final, más capital y menos intereses.',
    ventajas: 'Facilita la planificación financiera. El más habitual en España para hipotecas y préstamos personales.',
  },
  aleman: {
    nombre: 'Sistema Alemán (amortización constante)',
    descripcion: 'La amortización de capital es constante. Los intereses decrecen cada mes porque el saldo pendiente baja linealmente.',
    ventajas: 'Paga menos intereses totales que el francés. Cuota inicial más alta pero va bajando. Más económico a largo plazo.',
  },
  americano: {
    nombre: 'Sistema Americano (bullet o solo intereses)',
    descripcion: 'Durante el plazo solo se pagan intereses. Al vencimiento se devuelve todo el capital de golpe.',
    ventajas: 'Cuotas mensuales muy bajas durante el plazo. Útil para financiar activos que generen rentabilidad. Requiere liquidez al final.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularFrances(C: number, n: number, i: number) {
  const cuota = i === 0 ? C / n : C * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
  let saldo = C;
  let totalIntereses = 0;
  const cuotas = [];

  for (let mes = 1; mes <= n; mes++) {
    const interesMes = saldo * i;
    const amortMes = cuota - interesMes;
    saldo = Math.max(0, saldo - amortMes);
    totalIntereses += interesMes;
    cuotas.push({ mes, cuota, interes: interesMes, amortizacion: amortMes, pendiente: saldo });
  }
  return { cuotas, totalIntereses };
}

function calcularAleman(C: number, n: number, i: number) {
  const amortConst = C / n;
  let saldo = C;
  let totalIntereses = 0;
  const cuotas = [];

  for (let mes = 1; mes <= n; mes++) {
    const interesMes = saldo * i;
    const cuota = amortConst + interesMes;
    saldo = Math.max(0, saldo - amortConst);
    totalIntereses += interesMes;
    cuotas.push({ mes, cuota, interes: interesMes, amortizacion: amortConst, pendiente: saldo });
  }
  return { cuotas, totalIntereses };
}

function calcularAmericano(C: number, n: number, i: number) {
  const interesMensual = C * i;
  let totalIntereses = 0;
  const cuotas = [];

  for (let mes = 1; mes <= n; mes++) {
    const esUltimo = mes === n;
    const cuota = esUltimo ? interesMensual + C : interesMensual;
    const amort = esUltimo ? C : 0;
    totalIntereses += interesMensual;
    cuotas.push({ mes, cuota, interes: interesMensual, amortizacion: amort, pendiente: esUltimo ? 0 : C });
  }
  return { cuotas, totalIntereses };
}

/** TAE aproximada via Newton-Raphson (incluye comisión de apertura) */
function calcularTAE(capital: number, cuotaMensual: number, n: number, comisionEuros: number, esAmericano: boolean, interesMensual: number): number {
  if (esAmericano) {
    // Para americano: cuota = interés, último mes = interés + capital
    // Aproximación: TIN + spread por comisión
    return ((interesMensual * 12) + (comisionEuros / capital / (n / 12))) * 100;
  }

  // Flujo de caja desde el punto de vista del prestamista
  // Prestamista entrega (capital - comision), recibe cuotaMensual × n
  const efectivo = capital - comisionEuros;
  if (efectivo <= 0) return 0;

  // Buscar tasa mensual por Newton-Raphson (límite 50 iter)
  let tasa = cuotaMensual / efectivo / n;
  for (let iter = 0; iter < 50; iter++) {
    const fn = cuotaMensual * (1 - Math.pow(1 + tasa, -n)) / tasa - efectivo;
    const dfn = cuotaMensual * (Math.pow(1 + tasa, -n) * n / (tasa * (1 + tasa)) - (1 - Math.pow(1 + tasa, -n)) / (tasa * tasa));
    const nuevaTasa = tasa - fn / dfn;
    if (Math.abs(nuevaTasa - tasa) < 1e-9) { tasa = nuevaTasa; break; }
    tasa = nuevaTasa;
  }

  return Math.round((Math.pow(1 + tasa, 12) - 1) * 10000) / 100;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularPrestamo(p: ParametrosPrestamo): ResultadoPrestamo {
  if (p.capital <= 0) throw new Error('El capital debe ser mayor que cero.');
  if (p.plazoMeses <= 0 || p.plazoMeses > 600) throw new Error('El plazo debe estar entre 1 y 600 meses.');
  if (p.tin < 0 || p.tin > 50) throw new Error('El TIN debe estar entre 0 y 50%.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const i = p.tin / 100 / 12; // tasa mensual
  const comisionPct = Math.max(0, p.comisionApertura ?? 0);
  const comisionEuros = r(p.capital * comisionPct / 100);
  const desc = DESCRIPCIONES[p.sistema];

  let cuotas: ReturnType<typeof calcularFrances>['cuotas'];
  let totalIntereses: number;

  switch (p.sistema) {
    case 'aleman':
      ({ cuotas, totalIntereses } = calcularAleman(p.capital, p.plazoMeses, i));
      break;
    case 'americano':
      ({ cuotas, totalIntereses } = calcularAmericano(p.capital, p.plazoMeses, i));
      break;
    default:
      ({ cuotas, totalIntereses } = calcularFrances(p.capital, p.plazoMeses, i));
  }

  const cuotaInicial = r(cuotas[0].cuota);
  const cuotaFinal = r(cuotas[cuotas.length - 1].cuota);
  const totalPagado = r(p.capital + totalIntereses + comisionEuros);

  const taeAproximada = calcularTAE(
    p.capital,
    cuotas[0].cuota,
    p.plazoMeses,
    comisionEuros,
    p.sistema === 'americano',
    p.capital * i,
  );

  const muestraCuotas = cuotas.slice(0, 6).map(c => ({
    mes:          c.mes,
    cuota:        r(c.cuota),
    interes:      r(c.interes),
    amortizacion: r(c.amortizacion),
    pendiente:    r(c.pendiente),
  }));

  return {
    capital:              p.capital,
    plazoMeses:           p.plazoMeses,
    tin:                  p.tin,
    sistema:              p.sistema,
    nombreSistema:        desc.nombre,
    cuotaInicial,
    cuotaFinal,
    totalIntereses:       r(totalIntereses),
    totalPagado,
    taeAproximada,
    comisionAperturaEuros: comisionEuros,
    descripcionSistema:   desc.descripcion,
    ventajas:             desc.ventajas,
    muestraCuotas,
  };
}
