/**
 * Casos para clase — la tarea asignable de `simulador-principio-pascal`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada se reescribe aquí: se calcula con `./motor.ts`, el MISMO módulo con el que las tres
 * secciones del simulador pintan sus cifras.
 *
 *   · presión del líquido y absoluta, en Pa y en atm → `calcularPresion`.
 *   · fuerza y recorrido de una prensa                → `calcularPrensa` (áreas con `areaCirculo`).
 *   · alturas y desnivel del tubo en U                → `calcularTuboU`.
 *
 * Las densidades de los líquidos con nombre salen de `simulador-flotabilidad/materiales.ts` por
 * id, la MISMA lista de los botones: el enunciado no puede decir una cifra y el botón otra.
 *
 * Las ÚNICAS cuentas propias son las INVERSIONES que el motor no despeja, y cada una se devuelve
 * al motor y se exige que reproduzca el dato del enunciado (holgura relativa 1e-9):
 *
 *   · profundidad desde la presión absoluta (caso 5):  h = (P − P₀)/(ρ·g);
 *   · fuerza de entrada para sostener una masa (caso 7): F₁ = m·g·A₁/A₂;
 *   · densidad del líquido añadido en el tubo en U (caso 11): ρ_B = ρ_A·h_A/h_B;
 *   · fuerza sobre una escotilla (caso 9): F = ρ·g·h·A, que es la definición de presión.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **g = 9,81 m/s²**, el `G` del motor, y **P₀ = 101.325 Pa** (1 atm exacta), su `P_ATM`.
 *    Hay libros que usan g = 9,8 y P₀ = 1,013·10⁵ Pa. `resolverCaso(datos, g, p0)` acepta otros
 *    valores para que el spec compruebe qué casos dependen de cada uno: esos, y SOLO esos,
 *    declaran el valor en el enunciado.
 * ⚠️ **La densidad del mercurio es 13.534 kg/m³** (a 25 °C), la de los botones; hay libros que
 *    redondean a 13.600. Todo enunciado que nombra un líquido escribe su densidad.
 * ⚠️ **«Presión del agua» es ρ·g·h, sin la atmósfera**; «presión total» o «absoluta» la suma.
 *    Cada enunciado dice cuál pide.
 * ⚠️ **Profundidades en m; diámetros, recorridos y alturas del tubo en cm; áreas de los émbolos
 *    en cm²**, como los campos de la app. En el tubo en U la g se simplifica: sus alturas no
 *    dependen de ella.
 *
 * ── DATOS QUE DISCRIMINAN ───────────────────────────────────────────────────
 *
 * Un caso no sirve si su error conceptual típico da la misma cifra que la clave (hallazgo 2628
 * de simulador-flotabilidad). Por eso la prensa del caso 6 tiene diámetros 5 y 30 (con el
 * cociente de diámetros sale 1200, no 7200), el buceador del caso 3 baja a 30 m de MAR (la regla
 * de «una atmósfera cada 10 m» da 4,00 y la clave es 3,98) y el barómetro del caso 4 se separa de
 * la densidad de libro 13.600. Los errores de cada caso, con la cifra que darían, están anotados
 * en su definición.
 */

import { formatNumber } from '@/lib';
import {
  calcularPresion,
  calcularPrensa,
  calcularTuboU,
  areaCirculo,
  G,
  P_ATM,
  CM2_POR_M2,
} from './motor';
import { LIQUIDOS } from '../simulador-flotabilidad/materiales';

/** Holgura relativa con la que una inversión tiene que reproducir el dato del enunciado. */
const HOLGURA_INVERSION = 1e-9;

/** Espacio duro antes del %: que el signo no salte solo de línea (Ortografía de la RAE, 2010). */
const NBSP = ' ';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** ρ·g·h, en Pa. */
  | 'presionLiquido'
  /** P₀ + ρ·g·h, en Pa. */
  | 'presionAbsoluta'
  /** (P₀ + ρ·g·h)/101.325, en atm. */
  | 'presionAbsolutaAtm'
  /** h = (P − P₀)/(ρ·g) desde la presión absoluta, en m. */
  | 'profundidadDesdePresion'
  /** F = ρ·g·h·A sobre una superficie con aire a 1 atm al otro lado, en N. */
  | 'fuerzaSobreSuperficie'
  /** F₂ = F₁·A₂/A₁, en N. */
  | 'fuerzaPrensa'
  /** F₁ = m·g·A₁/A₂ para sostener la masa m en el émbolo 2, en N. */
  | 'fuerzaEntradaParaMasa'
  /** x₂ = x₁·A₁/A₂, en cm. */
  | 'recorridoSalida'
  /** h_A = ρ_B·h_B/ρ_A en el tubo en U, en cm. */
  | 'alturaFondoTuboU'
  /** h_B − h_A, en cm. */
  | 'desnivelTuboU'
  /** ρ_B = ρ_A·h_A/h_B, en kg/m³. */
  | 'densidadTuboU';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Id de un líquido de `LIQUIDOS` (`'agua'`, `'mar'`…). Si está, manda sobre `densidadLiquido`. */
  liquido?: string;
  /** Densidad «de problema» del líquido, en kg/m³. */
  densidadLiquido?: number;
  /** Profundidad bajo la superficie, en m. */
  profundidad?: number;
  /** Presión absoluta medida, en Pa (dato de una inversión). */
  presionAbsoluta?: number;
  /** Área sobre la que empuja el líquido, en m² (caso de la escotilla). */
  areaM2?: number;
  /** Fuerza sobre el émbolo 1, en N. */
  fuerza?: number;
  /** Diámetros de los émbolos, en cm. Si están, mandan sobre las áreas. */
  diametro1?: number;
  diametro2?: number;
  /** Áreas de los émbolos, en cm². */
  area1?: number;
  area2?: number;
  /** Masa que sostiene el émbolo 2, en kg. */
  masa?: number;
  /** Lo que baja el émbolo 1, en cm. */
  recorrido?: number;
  /** Ids de los líquidos del tubo en U: el del fondo (A) y el añadido (B). */
  fondo?: string;
  anadido?: string;
  /** Densidades «de problema» del tubo en U, en kg/m³. */
  densidadFondo?: number;
  densidadAnadido?: number;
  /** Altura de la columna del líquido añadido sobre la separación, en cm. */
  alturaAnadido?: number;
  /** Altura del líquido del fondo sobre la separación, en la otra rama, en cm. */
  alturaFondo?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (Pa, atm, m, N, cm o kg/m³). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «0,005», «13.534», «29.430». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * ¿La cifra exacta tiene más decimales de los que se piden? Holgura RELATIVA: 302.430 y 0,5 se
 * juzgan con la misma vara.
 */
export function exigeRedondeo(valor: number, decimales: number): boolean {
  if (!Number.isFinite(valor)) return false;
  return Math.abs(redondear(valor, decimales) - valor) > 1e-9 * Math.max(1, Math.abs(valor));
}

/** «a unidades», «a una décima», «a dos decimales»: lo mismo que dice el enunciado. */
function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  return `a ${decimales} decimales`;
}

function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

function fallo(error: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** ¿Reproduce `obtenido` el dato del enunciado con holgura relativa 1e-9? */
function cuadra(obtenido: number | null | undefined, dato: number): boolean {
  if (obtenido === null || obtenido === undefined || !Number.isFinite(obtenido)) return false;
  return Math.abs(obtenido - dato) <= HOLGURA_INVERSION * Math.max(Math.abs(dato), 1e-12);
}

function densidadDe(id: string | undefined, deProblema: number | undefined): number {
  if (id !== undefined) return LIQUIDOS.find((l) => l.id === id)?.densidad ?? NaN;
  return deProblema ?? NaN;
}

/** Áreas de los émbolos en cm²: de los diámetros si los hay, si no las dadas. */
function areasPrensa(datos: DatosCaso, pasos: string[]): { a1: number; a2: number } | null {
  if (datos.diametro1 !== undefined || datos.diametro2 !== undefined) {
    const a1 = areaCirculo(datos.diametro1 ?? NaN);
    const a2 = areaCirculo(datos.diametro2 ?? NaN);
    if (a1 === null || a2 === null) return null;
    pasos.push(
      `Áreas de los émbolos, A = π·d²/4: A₁ = π·${numero(datos.diametro1 ?? NaN)}²/4 = ${numero(a1)} cm² y A₂ = π·${numero(datos.diametro2 ?? NaN)}²/4 = ${numero(a2)} cm².`,
    );
    pasos.push(
      `El cociente de áreas es el cuadrado del de diámetros: A₂/A₁ = (${numero(datos.diametro2 ?? NaN)}/${numero(datos.diametro1 ?? NaN)})² = ${numero(a2 / a1)}. No hace falta calcular π.`,
    );
    return { a1, a2 };
  }
  if (!positivo(datos.area1) || !positivo(datos.area2)) return null;
  return { a1: datos.area1, a2: datos.area2 };
}

/** Unidad en la que sale el resultado de cada magnitud. */
export function unidadDeMagnitud(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'presionLiquido':
    case 'presionAbsoluta':
      return 'Pa';
    case 'presionAbsolutaAtm':
      return 'atm';
    case 'profundidadDesdePresion':
      return 'm';
    case 'fuerzaSobreSuperficie':
    case 'fuerzaPrensa':
    case 'fuerzaEntradaParaMasa':
      return 'N';
    case 'recorridoSalida':
    case 'alturaFondoTuboU':
    case 'desnivelTuboU':
      return 'cm';
    case 'densidadTuboU':
      return 'kg/m³';
    default:
      return '';
  }
}

function cifraConUnidad(cifra: string, unidad: string): string {
  if (!unidad) return cifra;
  return `${cifra}${unidad === '%' ? NBSP : ' '}${unidad}`;
}

function conUnidad(valor: number, datos: DatosCaso): string {
  return cifraConUnidad(formatNumber(valor, datos.decimales ?? 2), unidadDeMagnitud(datos.magnitud));
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera.
 *
 * @param g  gravedad en m/s², la del motor por defecto.
 * @param p0 presión en la superficie en Pa, la del motor por defecto.
 *           Solo las cambia el spec, para saber qué casos dependen de cada una.
 */
export function resolverCaso(datos: DatosCaso, g: number = G, p0: number = P_ATM): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  let valor: number;

  if (!positivo(g)) return fallo('La gravedad tiene que ser un número positivo.', pasos);
  if (!positivo(p0)) return fallo('La presión atmosférica tiene que ser un número positivo.', pasos);

  switch (datos.magnitud) {
    /* ── Presión a una profundidad ─────────────────────────────────────── */
    case 'presionLiquido':
    case 'presionAbsoluta':
    case 'presionAbsolutaAtm':
    case 'fuerzaSobreSuperficie': {
      const rho = densidadDe(datos.liquido, datos.densidadLiquido);
      if (!positivo(rho)) return falta('la densidad del líquido', pasos);
      if (!positivo(datos.profundidad)) return falta('la profundidad', pasos);
      const r = calcularPresion(rho, datos.profundidad, p0, g);
      if (!r) return fallo('El motor no puede calcular con esos datos.', pasos);
      pasos.push(
        `Presión que añade el líquido: ρ·g·h = ${numero(rho)}·${numero(g)}·${numero(datos.profundidad)} = ${numero(r.presionHidrostatica)} Pa.`,
      );
      if (datos.magnitud === 'presionLiquido') {
        valor = r.presionHidrostatica;
        pasos.push('Se pide la presión del líquido, así que no se suma la atmósfera.');
      } else if (datos.magnitud === 'fuerzaSobreSuperficie') {
        if (!positivo(datos.areaM2)) return falta('el área', pasos);
        pasos.push(
          'La atmósfera empuja por los dos lados: desde fuera, a través del agua (es el P₀ de la presión absoluta), y desde dentro, con el aire de la cabina. Se cancelan, y la fuerza neta la pone solo ρ·g·h.',
        );
        valor = r.presionHidrostatica * datos.areaM2;
        pasos.push(`F = P·A = ${numero(r.presionHidrostatica)}·${numero(datos.areaM2)} = ${numero(valor)} N.`);
      } else {
        pasos.push(
          `Presión absoluta, sumando la atmósfera de la superficie: P = P₀ + ρ·g·h = ${numero(p0)} + ${numero(r.presionHidrostatica)} = ${numero(r.presionAbsoluta)} Pa.`,
        );
        if (datos.magnitud === 'presionAbsoluta') {
          valor = r.presionAbsoluta;
        } else {
          // El motor da la absoluta en atm dividiendo entre 1 atm; con otra P₀ el cociente
          // se rehace con el mismo valor de la atmósfera estándar.
          valor = r.presionAbsoluta / P_ATM;
          pasos.push(`En atmósferas: ${numero(r.presionAbsoluta)}/${numero(P_ATM)} = ${numero(valor)} atm.`);
        }
      }
      break;
    }

    case 'profundidadDesdePresion': {
      const rho = densidadDe(datos.liquido, datos.densidadLiquido);
      if (!positivo(rho)) return falta('la densidad del líquido', pasos);
      if (!positivo(datos.presionAbsoluta)) return falta('la presión medida', pasos);
      if (datos.presionAbsoluta <= p0) return fallo('Bajo el agua la presión absoluta es mayor que la atmosférica.', pasos);
      const pLiquido = datos.presionAbsoluta - p0;
      pasos.push(
        `La presión medida es absoluta: incluye la atmósfera. Lo que pone el agua es P − P₀ = ${numero(datos.presionAbsoluta)} − ${numero(p0)} = ${numero(pLiquido)} Pa.`,
      );
      valor = pLiquido / (rho * g);
      pasos.push(`Despeja h de ρ·g·h: h = ${numero(pLiquido)}/(${numero(rho)}·${numero(g)}) = ${numero(valor)} m.`);
      const r = calcularPresion(rho, valor, p0, g);
      if (!r || !cuadra(r.presionAbsoluta, datos.presionAbsoluta)) {
        return fallo('La profundidad despejada no reproduce la presión medida.', pasos);
      }
      pasos.push(`Comprobación: a ${numero(valor)} m, P = ${numero(p0)} + ${numero(r.presionHidrostatica)} = ${numero(r.presionAbsoluta)} Pa.`);
      break;
    }

    /* ── Prensa hidráulica ─────────────────────────────────────────────── */
    case 'fuerzaPrensa':
    case 'recorridoSalida': {
      const areas = areasPrensa(datos, pasos);
      if (!areas) return falta('el tamaño de los dos émbolos', pasos);
      const fuerza = datos.magnitud === 'fuerzaPrensa' ? datos.fuerza : 1;
      if (!positivo(fuerza)) return falta('la fuerza sobre el émbolo 1', pasos);
      const recorrido = datos.magnitud === 'recorridoSalida' ? datos.recorrido : 0;
      if (datos.magnitud === 'recorridoSalida' && !positivo(recorrido)) return falta('lo que baja el émbolo 1', pasos);
      const r = calcularPrensa(fuerza, areas.a1 / CM2_POR_M2, areas.a2 / CM2_POR_M2, (recorrido ?? 0) / 100, g);
      if (!r) return fallo('El motor no puede calcular con esos datos.', pasos);
      if (datos.magnitud === 'fuerzaPrensa') {
        pasos.push('La presión se transmite íntegra por el líquido: F₁/A₁ = F₂/A₂, así que F₂ = F₁·A₂/A₁.');
        valor = r.fuerzaSalida;
        pasos.push(`F₂ = ${numero(fuerza)}·${numero(r.ventaja)} = ${numero(valor)} N.`);
      } else {
        pasos.push(
          'El líquido no se comprime: el volumen que deja el émbolo 1 al bajar es el que ocupa el 2 al subir. A₁·x₁ = A₂·x₂, así que x₂ = x₁·A₁/A₂.',
        );
        valor = r.desplazamientoSalida * 100;
        pasos.push(`x₂ = ${numero(recorrido ?? NaN)}·${numero(areas.a1)}/${numero(areas.a2)} = ${numero(valor)} cm.`);
        pasos.push('La prensa multiplica la fuerza, pero el émbolo grande recorre menos en la misma proporción: el trabajo F·x no cambia.');
      }
      break;
    }

    case 'fuerzaEntradaParaMasa': {
      const areas = areasPrensa(datos, pasos);
      if (!areas) return falta('el tamaño de los dos émbolos', pasos);
      if (!positivo(datos.masa)) return falta('la masa', pasos);
      const peso = datos.masa * g;
      pasos.push(`El émbolo 2 tiene que sostener un peso P = m·g = ${numero(datos.masa)}·${numero(g)} = ${numero(peso)} N.`);
      pasos.push('Con F₁/A₁ = F₂/A₂ y F₂ = P, se despeja F₁ = P·A₁/A₂.');
      valor = (peso * areas.a1) / areas.a2;
      pasos.push(`F₁ = ${numero(peso)}·${numero(areas.a1)}/${numero(areas.a2)} = ${numero(valor)} N.`);
      const r = calcularPrensa(valor, areas.a1 / CM2_POR_M2, areas.a2 / CM2_POR_M2, 0, g);
      if (!r || !cuadra(r.masaSostenida, datos.masa)) {
        return fallo('La fuerza despejada no sostiene la masa del enunciado.', pasos);
      }
      pasos.push(`Comprobación: con F₁ = ${numero(valor)} N, el émbolo 2 sostiene ${numero(r.masaSostenida)} kg.`);
      break;
    }

    /* ── Tubo en U ─────────────────────────────────────────────────────── */
    case 'alturaFondoTuboU':
    case 'desnivelTuboU': {
      const rhoA = densidadDe(datos.fondo, datos.densidadFondo);
      const rhoB = densidadDe(datos.anadido, datos.densidadAnadido);
      if (!positivo(rhoA)) return falta('la densidad del líquido del fondo', pasos);
      if (!positivo(rhoB)) return falta('la densidad del líquido añadido', pasos);
      if (!positivo(datos.alturaAnadido)) return falta('la altura del líquido añadido', pasos);
      const r = calcularTuboU(rhoA, rhoB, datos.alturaAnadido / 100, g);
      if (!r) return fallo('Con esos líquidos no hay un equilibrio de dos capas: el añadido tiene que ser menos denso.', pasos);
      pasos.push(
        'A la altura de la superficie de separación, las dos ramas están a la misma presión: lo que hay encima pesa lo mismo en las dos. ρ_A·g·h_A = ρ_B·g·h_B, y la g se simplifica.',
      );
      const hA = r.alturaFondo * 100;
      pasos.push(`h_A = ρ_B·h_B/ρ_A = ${numero(rhoB)}·${numero(datos.alturaAnadido)}/${numero(rhoA)} = ${numero(hA)} cm.`);
      if (datos.magnitud === 'alturaFondoTuboU') {
        valor = hA;
      } else {
        valor = r.desnivel * 100;
        pasos.push(`Las dos alturas se miden desde la separación, así que el desnivel es su diferencia: h_B − h_A = ${numero(datos.alturaAnadido)} − ${numero(hA)} = ${numero(valor)} cm.`);
      }
      break;
    }

    case 'densidadTuboU': {
      const rhoA = densidadDe(datos.fondo, datos.densidadFondo);
      if (!positivo(rhoA)) return falta('la densidad del líquido del fondo', pasos);
      if (!positivo(datos.alturaAnadido)) return falta('la altura del líquido añadido', pasos);
      if (!positivo(datos.alturaFondo)) return falta('la altura del líquido del fondo', pasos);
      if (datos.alturaFondo >= datos.alturaAnadido) {
        return fallo('El líquido añadido queda encima solo si es menos denso: su columna tiene que ser más alta.', pasos);
      }
      pasos.push('A la altura de la separación: ρ_A·g·h_A = ρ_B·g·h_B. La g se simplifica y se despeja ρ_B.');
      valor = (rhoA * datos.alturaFondo) / datos.alturaAnadido;
      pasos.push(`ρ_B = ρ_A·h_A/h_B = ${numero(rhoA)}·${numero(datos.alturaFondo)}/${numero(datos.alturaAnadido)} = ${numero(valor)} kg/m³.`);
      const r = calcularTuboU(rhoA, valor, datos.alturaAnadido / 100, g);
      if (!r || !cuadra(r.alturaFondo * 100, datos.alturaFondo)) {
        return fallo('La densidad despejada no reproduce las alturas.', pasos);
      }
      pasos.push(`Comprobación: con ρ_B = ${numero(valor)} kg/m³, ${numero(datos.alturaAnadido)} cm de B equilibran ${numero(r.alturaFondo * 100)} cm de A.`);
      break;
    }

    default:
      return fallo('Magnitud desconocida.', pasos);
  }

  if (!Number.isFinite(valor)) {
    return fallo('El resultado no es un número finito.', pasos);
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado.
  const redondeado = redondear(valor, decimales);
  pasos.push(
    exigeRedondeo(valor, decimales)
      ? `Redondeando ${textoRedondeo(decimales)}: ${conUnidad(redondeado, datos)}.`
      : `Resultado: ${conUnidad(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * La tolerancia la da la PREGUNTA, no el tamaño de la cifra (hallazgo 2626 de
 * simulador-flotabilidad): los datos son exactos, así que solo queda el redondeo pedido. Media
 * unidad del último decimal si la cifra exacta tiene más decimales; 0 si es exacta.
 */
export function toleranciaDe(datos: DatosCaso): number {
  const decimales = datos.decimales ?? 2;
  const r = resolverCaso(datos);
  if (!r.ok) return 0;
  return exigeRedondeo(r.valor, decimales) ? 10 ** -decimales / 2 : 0;
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Corrige la respuesta del alumno. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number, datos: DatosCaso): Veredicto {
  const tolerancia = toleranciaDe(datos);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  // Margen de ruido binario (hallazgo 1211 de simulador-conservacion-energia): en el borde exacto
  // de la tolerancia la resta en coma flotante decide por ±1 ulp.
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia, 2)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
  /** La cifra exacta tiene más decimales de los pedidos. Se CALCULA, no se declara a mano. */
  requiereRedondeo: boolean;
  /**
   * Qué pulsar y escribir en el simulador para ver la cifra o confirmarla, con el formato de sus
   * tarjetas (Pa sin decimales, atm con tres, cm con cuatro cifras significativas).
   */
  comoComprobar?: string;
}

/** «1025 kg/m³»: la densidad de la lista, tal como la escribe el enunciado. */
function densidadTexto(id: string): string {
  const s = LIQUIDOS.find((l) => l.id === id);
  return s ? `${numero(s.densidad)} kg/m³` : '—';
}

const GRAVEDAD = `g = ${numero(G)} m/s²`;
const ATMOSFERA = `P₀ = ${numero(P_ATM)} Pa`;

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`. Sin
 * ciudades, países ni monedas: el canal aula es sobre todo de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'El fondo de una piscina',
    enunciado: `Una piscina de agua dulce (${densidadTexto('agua')}) tiene 3 m de profundidad. ¿Qué presión ejerce el agua sobre el fondo, sin contar la atmósfera, en pascales? Toma ${GRAVEDAD}.`,
    categoria: 'aplicado',
    // ρgh = 1000·9,81·3 = 29.430 Pa. Errores: g = 10, 30.000 · sumar la atmósfera, 130.755.
    datos: { magnitud: 'presionLiquido', liquido: 'agua', profundidad: 3, decimales: 0 },
    etiquetaRespuesta: 'Presión del agua en Pa',
    pista: 'La presión que pone el líquido es ρ·g·h, con la profundidad en metros.',
    comoComprobar:
      'En la sección 1 pulsa Agua dulce y escribe 3 en la profundidad: la tarjeta «Del líquido ρ·g·h (manométrica)» marca la cifra.',
  },
  {
    id: 2,
    titulo: 'Presión total a 20 metros',
    enunciado: `¿Cuál es la presión total (absoluta) a 20 m de profundidad en agua de mar (${densidadTexto('mar')})? Toma ${GRAVEDAD} y ${ATMOSFERA} en la superficie. Da el resultado en pascales.`,
    categoria: 'abstracto',
    // 101.325 + 1025·9,81·20 = 101.325 + 201.105 = 302.430 Pa. Errores: sin la atmósfera,
    // 201.105 · agua dulce, 297.525 · P₀ = 101.300, 302.405.
    datos: { magnitud: 'presionAbsoluta', liquido: 'mar', profundidad: 20, decimales: 0 },
    etiquetaRespuesta: 'Presión absoluta en Pa',
    pista: 'La presión absoluta suma la de la atmósfera en la superficie y la del agua, ρ·g·h.',
    comoComprobar:
      'En la sección 1 pulsa Agua de mar y escribe 20 en la profundidad: el recuadro de la presión absoluta marca la cifra.',
  },
  {
    id: 3,
    titulo: 'Un buceador a 30 metros',
    enunciado: `Un buceador desciende a 30 m de profundidad en el mar (${densidadTexto('mar')}). ¿Qué presión total soporta, en atmósferas? Toma ${GRAVEDAD} y ${ATMOSFERA} (1 atm) en la superficie, y redondea a dos decimales.`,
    categoria: 'aplicado',
    // (101.325 + 1025·9,81·30)/101.325 = 402.982,5/101.325 = 3,9771 → 3,98 atm. Errores: la regla
    // de una atmósfera cada 10 m, 4,00 · sin la atmósfera, 2,98 · agua dulce, 3,90.
    datos: { magnitud: 'presionAbsolutaAtm', liquido: 'mar', profundidad: 30, decimales: 2 },
    etiquetaRespuesta: 'Presión absoluta en atm',
    pista: 'Calcula la presión absoluta en pascales y divide entre 101.325 Pa, que es una atmósfera.',
    comoComprobar:
      'En la sección 1 pulsa Agua de mar y escribe 30 en la profundidad: el recuadro marca la presión absoluta en atm con tres decimales.',
  },
  {
    id: 4,
    titulo: 'El barómetro de mercurio',
    enunciado: `En un barómetro, la atmósfera sostiene una columna de mercurio (${densidadTexto('mercurio')}) de 76 cm. ¿Qué presión ejerce esa columna, en pascales? Toma ${GRAVEDAD} y redondea a unidades.`,
    categoria: 'aplicado',
    // 13.534·9,81·0,76 = 100.904,09 → 100.904 Pa. Errores: densidad de libro 13.600, 101.396 ·
    // 76 sin pasar a m, 10.090.409 · g = 10, 102.858.
    datos: { magnitud: 'presionLiquido', liquido: 'mercurio', profundidad: 0.76, decimales: 0 },
    etiquetaRespuesta: 'Presión de la columna en Pa',
    pista: 'Es la misma fórmula ρ·g·h, con la altura de la columna en metros: 76 cm = 0,76 m.',
    comoComprobar:
      'En la sección 1 pulsa Mercurio y escribe 0,76 en la profundidad: la tarjeta «Del líquido ρ·g·h (manométrica)» marca la cifra.',
  },
  {
    id: 5,
    titulo: '¿A qué profundidad está el sensor?',
    enunciado: `Un sensor sumergido en un lago de agua dulce (${densidadTexto('agua')}) mide una presión absoluta de 150.000 Pa. ¿A qué profundidad está, en metros? Toma ${GRAVEDAD} y ${ATMOSFERA} en la superficie, y redondea a dos decimales.`,
    categoria: 'aplicado',
    // h = (150.000 − 101.325)/(1000·9,81) = 48.675/9810 = 4,9618 → 4,96 m. Errores: sin restar la
    // atmósfera, 15,29 · g = 10, 4,87.
    datos: { magnitud: 'profundidadDesdePresion', liquido: 'agua', presionAbsoluta: 150000, decimales: 2 },
    etiquetaRespuesta: 'Profundidad en m',
    pista: 'El sensor mide la presión absoluta: resta primero la de la atmósfera, y lo que queda es ρ·g·h.',
    comoComprobar:
      'En la sección 1 pulsa Agua dulce y escribe tu profundidad: si es correcta, el recuadro de la presión absoluta marca unos 150.000 Pa.',
  },
  {
    id: 6,
    titulo: 'Una prensa con émbolos circulares',
    enunciado: 'En una prensa hidráulica, el émbolo pequeño tiene 5 cm de diámetro y el grande 30 cm. Si se empuja el pequeño con 200 N, ¿qué fuerza hace el grande, en newtons?',
    categoria: 'abstracto',
    // A₂/A₁ = (30/5)² = 36 → F₂ = 7200 N. Errores: el cociente de diámetros, 1200 · al revés,
    // 5,56.
    datos: { magnitud: 'fuerzaPrensa', fuerza: 200, diametro1: 5, diametro2: 30, decimales: 0 },
    etiquetaRespuesta: 'F₂ en N',
    pista: 'La fuerza se multiplica por el cociente de ÁREAS, no de diámetros. Un diámetro el doble es un área cuatro veces mayor.',
    comoComprobar:
      'En la sección 2 deja «Diámetro (cm)», escribe 200 en la fuerza, 5 y 30 en los diámetros: el recuadro marca la fuerza del émbolo 2.',
  },
  {
    id: 7,
    titulo: 'El gato hidráulico',
    enunciado: `Un gato hidráulico de taller tiene un émbolo pequeño de 10 cm² y uno grande de 400 cm². ¿Qué fuerza hay que hacer sobre el pequeño para sostener un coche de 1200 kg sobre el grande, en newtons? Toma ${GRAVEDAD}.`,
    categoria: 'aplicado',
    // F₁ = 1200·9,81·10/400 = 294,3 N. Errores: la masa sin g, 30 · al revés, 470.880 · g = 10, 300.
    datos: { magnitud: 'fuerzaEntradaParaMasa', masa: 1200, area1: 10, area2: 400, decimales: 1 },
    etiquetaRespuesta: 'F₁ en N',
    pista: 'El émbolo grande tiene que hacer una fuerza igual al peso del coche, m·g. Luego aplica F₁/A₁ = F₂/A₂.',
    comoComprobar:
      'En la sección 2 pulsa «Área (cm²)», escribe tu fuerza en F₁ y 10 y 400 en las áreas: si es correcta, el recuadro dice que sostiene 1200 kg.',
  },
  {
    id: 8,
    titulo: 'Lo que sube el coche',
    enunciado: 'En el mismo gato hidráulico (émbolos de 10 cm² y 400 cm²), el émbolo pequeño baja 20 cm. ¿Cuánto sube el coche, en centímetros?',
    categoria: 'aplicado',
    // x₂ = 20·10/400 = 0,5 cm. Errores: multiplicar por la ventaja, 800 · no cambia, 20.
    datos: { magnitud: 'recorridoSalida', recorrido: 20, area1: 10, area2: 400, decimales: 1 },
    etiquetaRespuesta: 'Sube en cm',
    pista: 'El líquido no se comprime: el volumen que baja en un émbolo, A₁·x₁, es el que sube en el otro, A₂·x₂.',
    comoComprobar:
      'En la sección 2 pulsa «Área (cm²)», escribe 10 y 400 en las áreas y 20 en lo que baja el émbolo 1: la tarjeta «Sube el émbolo 2» marca la cifra.',
  },
  {
    id: 9,
    titulo: 'La escotilla de un submarino',
    enunciado: `Un submarino navega a 50 m de profundidad en el mar (${densidadTexto('mar')}). Una escotilla de 0,25 m² tiene agua por fuera y, por dentro, aire a la presión atmosférica. ¿Qué fuerza neta hace el agua sobre la escotilla, en newtons? Toma ${GRAVEDAD} y redondea a unidades.`,
    categoria: 'aplicado',
    // ρgh = 1025·9,81·50 = 502.762,5 Pa · F = 502.762,5·0,25 = 125.690,6 → 125.691 N. Errores: con
    // la presión absoluta, 151.022 · olvidar el área, 502.763 · g = 10, 128.125.
    datos: { magnitud: 'fuerzaSobreSuperficie', liquido: 'mar', profundidad: 50, areaM2: 0.25, decimales: 0 },
    etiquetaRespuesta: 'Fuerza neta en N',
    pista: 'La atmósfera empuja por fuera (sobre el agua) y por dentro (el aire): se cancela. Queda la presión del agua, ρ·g·h, por el área.',
    comoComprobar:
      'En la sección 1 pulsa Agua de mar y escribe 50 en la profundidad: la tarjeta «Del líquido ρ·g·h» da la presión del agua. Multiplícala por 0,25 m².',
  },
  {
    id: 10,
    titulo: 'Agua y aceite en un tubo en U',
    enunciado: `Un tubo en U contiene agua (${densidadTexto('agua')}). Por una rama se vierte aceite de oliva (${densidadTexto('aceite')}), que no se mezcla y queda encima, hasta formar una columna de 15 cm sobre la superficie de separación. ¿Cuántos centímetros más alta queda la superficie del aceite que la del agua de la otra rama?`,
    categoria: 'abstracto',
    // h_agua = 920·15/1000 = 13,8 cm · desnivel = 15 − 13,8 = 1,2 cm. Errores: dar h_agua, 13,8 ·
    // al revés, 1000·15/920 = 16,3 → −1,3.
    datos: { magnitud: 'desnivelTuboU', fondo: 'agua', anadido: 'aceite', alturaAnadido: 15, decimales: 1 },
    etiquetaRespuesta: 'Desnivel en cm',
    pista: 'Iguala presiones a la altura de la separación para hallar la altura del agua en la otra rama, y resta.',
    comoComprobar:
      'En la sección 3 pulsa Agua dulce como fondo y Aceite de oliva como añadido, y escribe 15 en la altura de B: la tarjeta del desnivel marca la cifra.',
  },
  {
    id: 11,
    titulo: 'Un líquido desconocido',
    enunciado: `En un tubo en U con agua (${densidadTexto('agua')}) se vierte un líquido desconocido que no se mezcla con ella. Cuando se equilibra, la columna del líquido desconocido mide 20 cm sobre la superficie de separación, y el agua de la otra rama sube 16 cm sobre ese mismo nivel. ¿Cuál es la densidad del líquido desconocido, en kg/m³?`,
    categoria: 'aplicado',
    // ρ_B = 1000·16/20 = 800 kg/m³. Errores: al revés, 1250 · con el desnivel, 1000·4/20 = 200.
    datos: { magnitud: 'densidadTuboU', fondo: 'agua', alturaAnadido: 20, alturaFondo: 16, decimales: 0 },
    etiquetaRespuesta: 'Densidad en kg/m³',
    pista: 'A la altura de la separación, ρ_agua·h_agua = ρ_B·h_B. Despeja ρ_B.',
    comoComprobar:
      'En la sección 3 pulsa Agua dulce como fondo y «Otra densidad» como añadido, escribe tu resultado y 20 en la altura de B: si es correcto, el agua sube 16 cm.',
  },
  {
    id: 12,
    titulo: 'Agua sobre mercurio',
    enunciado: `Un tubo en U contiene mercurio (${densidadTexto('mercurio')}). Por una rama se vierten 27,2 cm de agua (${densidadTexto('agua')}) sobre el mercurio. ¿Cuántos centímetros sube el mercurio en la otra rama por encima de la superficie de separación? Redondea a dos decimales.`,
    categoria: 'abstracto',
    // h_Hg = 1000·27,2/13.534 = 2,0098 → 2,01 cm. Errores: densidad de libro 13.600, 2,00 · al
    // revés, 368,1.
    datos: { magnitud: 'alturaFondoTuboU', fondo: 'mercurio', anadido: 'agua', alturaAnadido: 27.2, decimales: 2 },
    etiquetaRespuesta: 'Altura del mercurio en cm',
    pista: 'Iguala presiones a la altura de la separación: ρ_Hg·h_Hg = ρ_agua·h_agua.',
    comoComprobar:
      'En la sección 3 pulsa Mercurio como fondo y Agua dulce como añadido, y escribe 27,2 en la altura de B: el recuadro marca la altura del mercurio.',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «29.430 Pa», «3,98 atm». La unidad
 * es lo que va detrás de « en » en la etiqueta, así que no se imprime nunca un número suelto
 * junto a media frase (hallazgo 830 de `simulador-genetica`).
 */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const corte = etiqueta.lastIndexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  return cifraConUnidad(formatNumber(valor, decimales), unidad);
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
    pasos: r.pasos,
    requiereRedondeo: r.ok && exigeRedondeo(r.valor, decimales),
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio. La semilla se MEZCLA
 * antes de usarse (splitmix32): sembrando xorshift32 directamente con enteros pequeños, el
 * «aleatorio» acaba dando siempre el mismo ejercicio (simulador-genetica, 14/09/2026).
 */
function aleatorioCon(semilla: number): () => number {
  let estado = (semilla >>> 0) || 1;
  return () => {
    estado = (estado + 0x9e3779b9) >>> 0;
    let z = estado;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    z = (z ^ (z >>> 15)) >>> 0;
    return z / 0x100000000;
  };
}

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

/** Densidades «de problema» sin nombre de sustancia, profundidades y medidas redondas. */
const DENSIDADES_LIQUIDO = [800, 900, 1000, 1030, 1200, 1250] as const;
const PROFUNDIDADES = [2, 4, 5, 8, 12, 15, 25, 40] as const;
const FUERZAS = [50, 80, 100, 150, 200, 250] as const;
const DIAMETROS = [[2, 10], [2, 20], [3, 12], [4, 20], [5, 25], [5, 40]] as const;
const RECORRIDOS = [5, 10, 15, 20, 30] as const;
const PAREJAS_TUBO = [[1000, 800], [1000, 900], [1200, 1000], [1250, 1000], [1000, 750]] as const;
const ALTURAS_TUBO = [8, 10, 12, 15, 18, 20, 24] as const;
const PREGUNTAS = ['presionLiquido', 'presionAbsoluta', 'fuerzaPrensa', 'recorridoSalida', 'alturaFondoTuboU'] as const;
type Pregunta = (typeof PREGUNTAS)[number];

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

const ETIQUETAS: Record<Pregunta, string> = {
  presionLiquido: 'Presión del líquido en Pa',
  presionAbsoluta: 'Presión absoluta en Pa',
  fuerzaPrensa: 'F₂ en N',
  recorridoSalida: 'Sube en cm',
  alturaFondoTuboU: 'Altura de A en cm',
};

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos, y por tanto el mismo
 * motor que el simulador: si divergieran, el alumno entrenaría con una regla y sería corregido
 * con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  let datos: DatosCaso;
  let enunciado: string;

  switch (pregunta) {
    case 'presionLiquido':
    case 'presionAbsoluta': {
      const rho = elegir(DENSIDADES_LIQUIDO, rnd);
      const h = elegir(PROFUNDIDADES, rnd);
      datos = { magnitud: pregunta, densidadLiquido: rho, profundidad: h, decimales: 0 };
      enunciado =
        pregunta === 'presionLiquido'
          ? `¿Qué presión ejerce un líquido de ${numero(rho)} kg/m³ a ${numero(h)} m de profundidad, sin contar la atmósfera, en pascales? Toma ${GRAVEDAD} y redondea a unidades.`
          : `¿Cuál es la presión absoluta a ${numero(h)} m de profundidad en un líquido de ${numero(rho)} kg/m³, en pascales? Toma ${GRAVEDAD} y ${ATMOSFERA}, y redondea a unidades.`;
      break;
    }
    case 'fuerzaPrensa': {
      const [d1, d2] = elegir(DIAMETROS, rnd);
      const f = elegir(FUERZAS, rnd);
      datos = { magnitud: 'fuerzaPrensa', fuerza: f, diametro1: d1, diametro2: d2, decimales: 0 };
      enunciado = `Una prensa hidráulica tiene émbolos de ${numero(d1)} cm y ${numero(d2)} cm de diámetro. Si se empuja el pequeño con ${numero(f)} N, ¿qué fuerza hace el grande, en newtons?`;
      break;
    }
    case 'recorridoSalida': {
      const [d1, d2] = elegir(DIAMETROS, rnd);
      const x = elegir(RECORRIDOS, rnd);
      datos = { magnitud: 'recorridoSalida', recorrido: x, diametro1: d1, diametro2: d2, decimales: 2 };
      enunciado = `En una prensa con émbolos de ${numero(d1)} cm y ${numero(d2)} cm de diámetro, el pequeño baja ${numero(x)} cm. ¿Cuánto sube el grande, en centímetros? Redondea a dos decimales.`;
      break;
    }
    case 'alturaFondoTuboU':
    default: {
      const [rhoA, rhoB] = elegir(PAREJAS_TUBO, rnd);
      const hB = elegir(ALTURAS_TUBO, rnd);
      datos = { magnitud: 'alturaFondoTuboU', densidadFondo: rhoA, densidadAnadido: rhoB, alturaAnadido: hB, decimales: 1 };
      enunciado = `Un tubo en U contiene un líquido A de ${numero(rhoA)} kg/m³. Por una rama se vierten ${numero(hB)} cm de un líquido B de ${numero(rhoB)} kg/m³, que no se mezcla y queda encima. ¿Cuántos centímetros sube A en la otra rama sobre la superficie de separación? Redondea a una décima.`;
      break;
    }
  }

  const r = resolverCaso(datos);
  const decimales = datos.decimales ?? 2;
  return {
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, decimales) : NaN,
    etiquetaRespuesta: ETIQUETAS[pregunta],
    pasos: r.pasos,
  };
}
