/**
 * Casos para clase — la tarea asignable de `simulador-gas-ideal`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada de PV = nRT se reescribe aquí: se calcula SOLO con `calcularGasIdeal` y
 * `calcularProceso` de `./motor.ts`, que son los cuerpos de los `useMemo` de las pestañas
 * «Ley del Gas Ideal» y «Procesos» trasladados tal cual. Si la corrección y el panel
 * calcularan distinto, la app suspendería una respuesta que ella misma imprime.
 *
 * Cuando un caso pide algo que la app no despeja directamente (V₂ conocida P₂, T₂ conocida P₂,
 * la ley combinada) se ENCADENA el motor: primero n con el estado 1
 * (`calcularGasIdeal('n', …)`) y después la incógnita con el estado 2 y esa misma n
 * (`calcularGasIdeal('V' | 'T', …)`). Si en ese camino falta un dato que no influye (el volumen
 * de un recipiente rígido, la presión de un proceso isobárico) se toma uno de referencia y la
 * solución lo dice.
 *
 * Las únicas cuentas propias de este fichero son CONVERSIONES de presentación (°C ↔ K, Pa ↔ atm,
 * m³ ↔ L) y la resta ΔV del paso a paso, que no deciden ninguna respuesta.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **R = 8,314 J/(mol·K) y 1 atm = 101.325 Pa**, como la app, que trabaja en el SI por dentro.
 *    Muchos libros usan R = 0,0821 atm·L/(mol·K); el resultado difiere menos de un 0,1 %, que
 *    entra de sobra en la tolerancia del 1 %. Lo dicen las pistas de los casos de PV = nRT.
 *
 * ⚠️ **T(K) = T(°C) + 273,15**, porque la app resta 273,15 para pasar a °C. Con 273 la diferencia
 *    también entra en la tolerancia; los casos 7, 9 y 12 están elegidos para que dé lo mismo.
 *
 * ⚠️ **En la pestaña Procesos la n no se teclea: sale del estado inicial**, n = P₁V₁/(RT₁)
 *    (hallazgo 2352, REPARADO el 28/09/2026). Hasta entonces era un campo libre, el estado de
 *    fábrica no cumplía PV = nRT (1 atm y 10 L frente a 1 mol y 300 K: un factor 2,46) y la app
 *    mezclaba el W que salía de V con el ΔU que salía de n; por eso estos casos solo preguntan
 *    P₂, V₂, T₂ o el W de un isobárico (W = P·ΔV), que no dependen de n. Siguen valiendo tal
 *    cual: ninguno de esos cuatro cambió con la reparación.
 *
 * ⚠️ **Decimales como los imprime el panel**, para que `comoComprobar` sea verdad al pie de la
 *    letra: P en atm con 3, V en L con 3, T en K con 2 (el «Resultado» de «Ley del Gas Ideal»,
 *    con 3), °C con 1 o 2, n con 4 y W en J con 2.
 */

import { formatNumber } from '@/lib';
import { ATM_TO_PA, L_TO_M3, calcularGasIdeal, calcularProceso } from './motor';

/** Paso de °C a K: la app resta este mismo 273,15 para mostrar los °C. */
const CERO_CELSIUS_K = 273.15;

/**
 * Valores de referencia para lo que el enunciado no da porque NO influye en la respuesta: el
 * motor necesita un número, y la solución avisa de que cualquier otro da lo mismo.
 */
const P_REFERENCIA_ATM = 1;
const V_REFERENCIA_L = 10;
const T_REFERENCIA_K = 300;

/**
 * γ del aire: `calcularProceso` lo pide siempre, aunque solo lo usen el adiabático y los Q y ΔU
 * que ningún caso pregunta. La n no se le pasa: la deriva él del estado inicial.
 */
const GAMMA_REFERENCIA = 1.4;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** PV = nRT, despejando P (atm) con V, T y n. */
  | 'presion'
  /** PV = nRT, despejando V (L) con P, T y n. */
  | 'volumen'
  /** PV = nRT, despejando T (K, o °C con `enCelsius`) con P, V y n. */
  | 'temperatura'
  /** PV = nRT, despejando n (mol) con P, V y T. */
  | 'moles'
  /** Ley de Boyle con la pestaña Procesos (isotermo): P₂ conocido V₂. */
  | 'presionIsotermo'
  /** Ley de Charles con la pestaña Procesos (isobárico): V₂ conocida T₂. */
  | 'volumenIsobaro'
  /** Ley de Gay-Lussac con la pestaña Procesos (isocórico): P₂ conocida T₂. */
  | 'presionIsocoro'
  /** W = P·ΔV del proceso isobárico de la pestaña Procesos. */
  | 'trabajoIsobaro'
  /** V₂ conocidos P₂ y T₂ (si falta T₂, es la misma que T₁): se encadena el motor vía n. */
  | 'volumenFinal'
  /** T₂ conocidos P₂ y V₂ (si falta uno, es el mismo que el inicial): se encadena vía n. */
  | 'temperaturaFinal';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Presión inicial (o única), en atm. */
  P1?: number;
  /** Volumen inicial (o único), en L. */
  V1?: number;
  /** Temperatura inicial (o única), en K. */
  T1?: number;
  /** La misma temperatura, si el enunciado la da en °C. Manda sobre `T1`. */
  T1C?: number;
  /** Cantidad de gas, en mol. */
  n?: number;
  /** Presión final, en atm. */
  P2?: number;
  /** Volumen final, en L. */
  V2?: number;
  /** Temperatura final, en K. */
  T2?: number;
  /** La misma temperatura final, en °C. Manda sobre `T2`. */
  T2C?: number;
  /** La temperatura que se PIDE va en °C (por defecto, en K). */
  enCelsius?: boolean;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (atm, L, K o °C, mol o J). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «0,48749», «101.325». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** «a unidades», «a una décima», «a dos decimales»: lo mismo que dice el enunciado. */
function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  return `a ${decimales} decimales`;
}

/** Falta un dato obligatorio: se responde con un error legible, nunca con una excepción. */
function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** Unidad en la que sale el resultado de cada magnitud. */
export function unidadDeMagnitud(datos: DatosCaso): string {
  switch (datos.magnitud) {
    case 'presion':
    case 'presionIsotermo':
    case 'presionIsocoro':
      return 'atm';
    case 'volumen':
    case 'volumenIsobaro':
    case 'volumenFinal':
      return 'L';
    case 'temperatura':
    case 'temperaturaFinal':
      return datos.enCelsius ? '°C' : 'K';
    case 'moles':
      return 'mol';
    case 'trabajoIsobaro':
      return 'J';
    default:
      return '';
  }
}

function conUnidad(valor: number, datos: DatosCaso): string {
  const unidad = unidadDeMagnitud(datos);
  const cifra = formatNumber(valor, datos.decimales ?? 2);
  return unidad ? `${cifra} ${unidad}` : cifra;
}

/**
 * Una temperatura del enunciado en kelvin, con el paso que la convierte si venía en °C.
 * `undefined` si no hay ninguna de las dos.
 */
function temperaturaK(
  kelvin: number | undefined,
  celsius: number | undefined,
  nombre: string,
  pasos: string[],
): number | undefined {
  if (typeof celsius === 'number' && Number.isFinite(celsius)) {
    const t = celsius + CERO_CELSIUS_K;
    pasos.push(
      `${nombre} en kelvin: ${numero(celsius)} °C + 273,15 = ${numero(t)} K. En las leyes de los gases la temperatura va SIEMPRE en kelvin.`,
    );
    return t;
  }
  return kelvin;
}

/** Cantidad de gas desde un estado, con el MISMO motor que la pestaña «Ley del Gas Ideal». */
function molesDesde(Patm: number, VL: number, TK: number): number {
  const n = calcularGasIdeal('n', Patm, VL, TK, 0);
  return n === null ? NaN : n;
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  let valor: number;

  switch (datos.magnitud) {
    /* ── PV = nRT, una sola vez ─────────────────────────────────────────── */
    case 'presion': {
      const T = temperaturaK(datos.T1, datos.T1C, 'Temperatura', pasos);
      if (!positivo(datos.V1)) return falta('el volumen', pasos);
      if (!positivo(T)) return falta('la temperatura', pasos);
      if (!positivo(datos.n)) return falta('la cantidad de gas', pasos);
      const atm = calcularGasIdeal('P', 0, datos.V1, T, datos.n);
      if (atm === null) return falta('un volumen positivo', pasos);
      const V = datos.V1 * L_TO_M3;
      pasos.push(`Datos en el SI: V = ${numero(datos.V1)} L = ${numero(V, 6)} m³, T = ${numero(T)} K, n = ${numero(datos.n)} mol.`);
      pasos.push(
        `De PV = nRT se despeja P = nRT/V = ${numero(datos.n)}·8,314·${numero(T)}/${numero(V, 6)} = ${numero(atm * ATM_TO_PA, 1)} Pa.`,
      );
      valor = atm;
      pasos.push(`En atmósferas (1 atm = 101.325 Pa): P = ${numero(atm * ATM_TO_PA, 1)}/101.325 = ${numero(valor)} atm.`);
      break;
    }

    case 'volumen': {
      const T = temperaturaK(datos.T1, datos.T1C, 'Temperatura', pasos);
      if (!positivo(datos.P1)) return falta('la presión', pasos);
      if (!positivo(T)) return falta('la temperatura', pasos);
      if (!positivo(datos.n)) return falta('la cantidad de gas', pasos);
      const litros = calcularGasIdeal('V', datos.P1, 0, T, datos.n);
      if (litros === null) return falta('una presión positiva', pasos);
      const P = datos.P1 * ATM_TO_PA;
      pasos.push(`Datos en el SI: P = ${numero(datos.P1)} atm = ${numero(P, 1)} Pa, T = ${numero(T)} K, n = ${numero(datos.n)} mol.`);
      pasos.push(
        `De PV = nRT se despeja V = nRT/P = ${numero(datos.n)}·8,314·${numero(T)}/${numero(P, 1)} = ${numero(litros * L_TO_M3, 6)} m³.`,
      );
      valor = litros;
      pasos.push(`En litros (1 m³ = 1000 L): V = ${numero(valor)} L.`);
      break;
    }

    case 'temperatura': {
      if (!positivo(datos.P1)) return falta('la presión', pasos);
      if (!positivo(datos.V1)) return falta('el volumen', pasos);
      if (!positivo(datos.n)) return falta('la cantidad de gas', pasos);
      const kelvin = calcularGasIdeal('T', datos.P1, datos.V1, 0, datos.n);
      if (kelvin === null) return falta('una cantidad de gas positiva', pasos);
      const P = datos.P1 * ATM_TO_PA;
      const V = datos.V1 * L_TO_M3;
      pasos.push(
        `Datos en el SI: P = ${numero(datos.P1)} atm = ${numero(P, 1)} Pa, V = ${numero(datos.V1)} L = ${numero(V, 6)} m³, n = ${numero(datos.n)} mol.`,
      );
      pasos.push(
        `De PV = nRT se despeja T = PV/(nR) = ${numero(P, 1)}·${numero(V, 6)}/(${numero(datos.n)}·8,314) = ${numero(kelvin)} K.`,
      );
      if (datos.enCelsius) {
        valor = kelvin - CERO_CELSIUS_K;
        pasos.push(`En grados Celsius: ${numero(kelvin)} − 273,15 = ${numero(valor)} °C.`);
      } else {
        valor = kelvin;
      }
      break;
    }

    case 'moles': {
      const T = temperaturaK(datos.T1, datos.T1C, 'Temperatura', pasos);
      if (!positivo(datos.P1)) return falta('la presión', pasos);
      if (!positivo(datos.V1)) return falta('el volumen', pasos);
      if (!positivo(T)) return falta('la temperatura', pasos);
      const P = datos.P1 * ATM_TO_PA;
      const V = datos.V1 * L_TO_M3;
      pasos.push(
        `Datos en el SI: P = ${numero(datos.P1)} atm = ${numero(P, 1)} Pa, V = ${numero(datos.V1)} L = ${numero(V, 6)} m³, T = ${numero(T)} K.`,
      );
      valor = molesDesde(datos.P1, datos.V1, T);
      pasos.push(
        `De PV = nRT se despeja n = PV/(RT) = ${numero(P, 1)}·${numero(V, 6)}/(8,314·${numero(T)}) = ${numero(valor, 5)} mol.`,
      );
      break;
    }

    /* ── Pestaña Procesos ───────────────────────────────────────────────── */
    case 'presionIsotermo': {
      if (!positivo(datos.P1)) return falta('la presión inicial', pasos);
      if (!positivo(datos.V1) || !positivo(datos.V2)) return falta('los dos volúmenes', pasos);
      const r = calcularProceso({
        proceso: 'isotermo',
        P1atm: datos.P1,
        V1L: datos.V1,
        T1K: T_REFERENCIA_K,
        V2L: datos.V2,
        T2K: T_REFERENCIA_K,
        gamma: GAMMA_REFERENCIA,
      });
      if (!r) return falta('volúmenes positivos', pasos);
      pasos.push('La temperatura no cambia (proceso isotermo): se cumple la ley de Boyle, P₁·V₁ = P₂·V₂.');
      valor = r.P2 / ATM_TO_PA;
      pasos.push(
        `P₂ = P₁·V₁/V₂ = ${numero(datos.P1)}·${numero(datos.V1)}/${numero(datos.V2)} = ${numero(valor)} atm. Las unidades de volumen se cancelan: se puede trabajar en litros.`,
      );
      pasos.push(
        datos.V2 < datos.V1
          ? 'El volumen baja y la presión sube en la misma proporción: son inversamente proporcionales.'
          : 'El volumen sube y la presión baja en la misma proporción: son inversamente proporcionales.',
      );
      break;
    }

    case 'volumenIsobaro': {
      const T1 = temperaturaK(datos.T1, datos.T1C, 'Temperatura inicial', pasos);
      const T2 = temperaturaK(datos.T2, datos.T2C, 'Temperatura final', pasos);
      if (!positivo(datos.V1)) return falta('el volumen inicial', pasos);
      if (!positivo(T1) || !positivo(T2)) return falta('las dos temperaturas', pasos);
      const r = calcularProceso({
        proceso: 'isobaro',
        P1atm: datos.P1 ?? P_REFERENCIA_ATM,
        V1L: datos.V1,
        T1K: T1,
        V2L: datos.V1,
        T2K: T2,
        gamma: GAMMA_REFERENCIA,
      });
      if (!r) return falta('una temperatura inicial positiva', pasos);
      pasos.push('La presión no cambia (proceso isobárico): se cumple la ley de Charles, V₁/T₁ = V₂/T₂.');
      valor = r.V2 / L_TO_M3;
      pasos.push(`V₂ = V₁·T₂/T₁ = ${numero(datos.V1)}·${numero(T2)}/${numero(T1)} = ${numero(valor)} L.`);
      break;
    }

    case 'presionIsocoro': {
      const T1 = temperaturaK(datos.T1, datos.T1C, 'Temperatura inicial', pasos);
      const T2 = temperaturaK(datos.T2, datos.T2C, 'Temperatura final', pasos);
      if (!positivo(datos.P1)) return falta('la presión inicial', pasos);
      if (!positivo(T1) || !positivo(T2)) return falta('las dos temperaturas', pasos);
      const r = calcularProceso({
        proceso: 'isocoro',
        P1atm: datos.P1,
        V1L: datos.V1 ?? V_REFERENCIA_L,
        T1K: T1,
        V2L: datos.V1 ?? V_REFERENCIA_L,
        T2K: T2,
        gamma: GAMMA_REFERENCIA,
      });
      if (!r) return falta('una temperatura inicial positiva', pasos);
      pasos.push('El volumen no cambia (recipiente rígido, proceso isocórico): se cumple la ley de Gay-Lussac, P₁/T₁ = P₂/T₂.');
      valor = r.P2 / ATM_TO_PA;
      pasos.push(`P₂ = P₁·T₂/T₁ = ${numero(datos.P1)}·${numero(T2)}/${numero(T1)} = ${numero(valor)} atm.`);
      if (typeof datos.T1C === 'number' && typeof datos.T2C === 'number' && datos.T1C !== 0) {
        pasos.push(
          `Con las temperaturas en °C saldría ${numero(datos.P1)}·${numero(datos.T2C)}/${numero(datos.T1C)} = ${numero((datos.P1 * datos.T2C) / datos.T1C)} atm, que es falso: la proporcionalidad solo vale en kelvin.`,
        );
      }
      break;
    }

    case 'trabajoIsobaro': {
      const T1 = temperaturaK(datos.T1, datos.T1C, 'Temperatura inicial', pasos);
      const T2 = temperaturaK(datos.T2, datos.T2C, 'Temperatura final', pasos);
      if (!positivo(datos.P1)) return falta('la presión', pasos);
      if (!positivo(datos.V1)) return falta('el volumen inicial', pasos);
      if (!positivo(T1) || !positivo(T2)) return falta('las dos temperaturas', pasos);
      const r = calcularProceso({
        proceso: 'isobaro',
        P1atm: datos.P1,
        V1L: datos.V1,
        T1K: T1,
        V2L: datos.V1,
        T2K: T2,
        gamma: GAMMA_REFERENCIA,
      });
      if (!r) return falta('una temperatura inicial positiva', pasos);
      const V2L = r.V2 / L_TO_M3;
      const P = datos.P1 * ATM_TO_PA;
      pasos.push(`Volumen final (ley de Charles, a presión constante): V₂ = V₁·T₂/T₁ = ${numero(datos.V1)}·${numero(T2)}/${numero(T1)} = ${numero(V2L)} L.`);
      pasos.push(
        `A presión constante, W = P·ΔV, con P en Pa y ΔV en m³: P = ${numero(datos.P1)} atm = ${numero(P, 1)} Pa y ΔV = ${numero(V2L)} − ${numero(datos.V1)} = ${numero(V2L - datos.V1)} L = ${numero((V2L - datos.V1) * L_TO_M3, 6)} m³.`,
      );
      valor = r.W;
      pasos.push(
        `W = ${numero(P, 1)}·${numero((V2L - datos.V1) * L_TO_M3, 6)} = ${numero(valor, 2)} J. Sale positivo: el gas se expande y hace trabajo sobre el exterior.`,
      );
      break;
    }

    /* ── Encadenando el motor: n con el estado 1, la incógnita con el 2 ─── */
    case 'volumenFinal': {
      const T1dada = temperaturaK(datos.T1, datos.T1C, 'Temperatura inicial', pasos);
      const T2dada = temperaturaK(datos.T2, datos.T2C, 'Temperatura final', pasos);
      if (!positivo(datos.P1) || !positivo(datos.P2)) return falta('las dos presiones', pasos);
      if (!positivo(datos.V1)) return falta('el volumen inicial', pasos);
      const isotermo = T2dada === undefined;
      const T1 = T1dada ?? T_REFERENCIA_K;
      const T2 = T2dada ?? T1;
      if (!positivo(T1) || !positivo(T2)) return falta('temperaturas positivas', pasos);
      if (isotermo) {
        pasos.push(
          T1dada === undefined
            ? `La temperatura no cambia y el enunciado no la da porque no influye: tomamos T = ${numero(T1)} K (con cualquier otra sale lo mismo).`
            : `La temperatura no cambia: T₂ = T₁ = ${numero(T1)} K.`,
        );
      }
      const n = molesDesde(datos.P1, datos.V1, T1);
      pasos.push(
        `Cantidad de gas con el estado inicial: n = P₁V₁/(RT₁) = ${numero(datos.P1 * ATM_TO_PA, 1)}·${numero(datos.V1 * L_TO_M3, 6)}/(8,314·${numero(T1)}) = ${numero(n, 5)} mol.`,
      );
      const litros = calcularGasIdeal('V', datos.P2, 0, T2, n);
      if (litros === null || !Number.isFinite(n)) return falta('una presión final positiva', pasos);
      valor = litros;
      pasos.push(
        `Volumen final con la MISMA n: V₂ = nRT₂/P₂ = ${numero(n, 5)}·8,314·${numero(T2)}/${numero(datos.P2 * ATM_TO_PA, 1)} = ${numero(litros * L_TO_M3, 7)} m³ = ${numero(valor)} L.`,
      );
      pasos.push(
        isotermo
          ? `Atajo (ley de Boyle): V₂ = V₁·P₁/P₂ = ${numero(datos.V1)}·${numero(datos.P1)}/${numero(datos.P2)}. La temperatura se cancela.`
          : `Atajo (ley combinada, P₁V₁/T₁ = P₂V₂/T₂): V₂ = V₁·(P₁/P₂)·(T₂/T₁) = ${numero(datos.V1)}·(${numero(datos.P1)}/${numero(datos.P2)})·(${numero(T2)}/${numero(T1)}). La n se cancela.`,
      );
      break;
    }

    case 'temperaturaFinal': {
      const T1 = temperaturaK(datos.T1, datos.T1C, 'Temperatura inicial', pasos);
      if (!positivo(T1)) return falta('la temperatura inicial', pasos);
      const P1 = datos.P1 ?? P_REFERENCIA_ATM;
      const V1 = datos.V1 ?? V_REFERENCIA_L;
      const P2 = datos.P2 ?? P1;
      const V2 = datos.V2 ?? V1;
      if (!positivo(P1) || !positivo(V1) || !positivo(P2) || !positivo(V2)) {
        return falta('presiones y volúmenes positivos', pasos);
      }
      if (datos.V2 === undefined) {
        pasos.push(
          datos.V1 === undefined
            ? `El volumen no cambia (recipiente rígido) y el enunciado no lo da porque no influye: tomamos V = ${numero(V1)} L (con cualquier otro sale lo mismo).`
            : `El volumen no cambia: V₂ = V₁ = ${numero(V1)} L.`,
        );
      }
      if (datos.P2 === undefined) {
        pasos.push(
          datos.P1 === undefined
            ? `La presión no cambia y el enunciado no la da porque no influye: tomamos P = ${numero(P1)} atm (con cualquier otra sale lo mismo).`
            : `La presión no cambia: P₂ = P₁ = ${numero(P1)} atm.`,
        );
      }
      if (datos.V1 !== undefined && datos.V2 !== undefined && datos.V1 !== 0) {
        pasos.push(`Tomamos V₁ = ${numero(V1)} L; entonces V₂ = ${numero(V2)} L (${numero(V2 / V1)} veces V₁). Con cualquier otro V₁ sale lo mismo.`);
      }
      const n = molesDesde(P1, V1, T1);
      pasos.push(
        `Cantidad de gas con el estado inicial: n = P₁V₁/(RT₁) = ${numero(P1 * ATM_TO_PA, 1)}·${numero(V1 * L_TO_M3, 6)}/(8,314·${numero(T1)}) = ${numero(n, 5)} mol.`,
      );
      const kelvin = calcularGasIdeal('T', P2, V2, 0, n);
      if (kelvin === null || !Number.isFinite(n)) return falta('una cantidad de gas positiva', pasos);
      pasos.push(
        `Temperatura final con la MISMA n: T₂ = P₂V₂/(nR) = ${numero(P2 * ATM_TO_PA, 1)}·${numero(V2 * L_TO_M3, 6)}/(${numero(n, 5)}·8,314) = ${numero(kelvin)} K.`,
      );
      pasos.push(
        `Atajo: T₂ = T₁·(P₂/P₁)·(V₂/V₁) = ${numero(T1)}·(${numero(P2)}/${numero(P1)})·(${numero(V2)}/${numero(V1)}), siempre con T en kelvin.`,
      );
      if (datos.enCelsius) {
        valor = kelvin - CERO_CELSIUS_K;
        pasos.push(`En grados Celsius: ${numero(kelvin)} − 273,15 = ${numero(valor)} °C.`);
      } else {
        valor = kelvin;
      }
      break;
    }

    default:
      return { ok: false, valor: NaN, pasos, error: 'Magnitud desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado.
  const redondeado = redondear(valor, decimales);
  const exacto = Math.abs(valor - redondeado) < 1e-9;
  pasos.push(
    exacto
      ? `Resultado: ${conUnidad(redondeado, datos)}.`
      : `Redondeando ${textoRedondeo(decimales)}: ${conUnidad(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Corrige la respuesta del alumno. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number): Veredicto {
  const tolerancia = toleranciaDe(esperado);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  /**
   * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde
   * EXACTO de la tolerancia la resta en coma flotante decide por ±1 ulp, así que la misma
   * desviación se aceptaba por arriba y se rechazaba por abajo. 1e-9 absorbe ese ruido y queda
   * siete órdenes de magnitud por debajo de la tolerancia más pequeña (0,01).
   */
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
  /**
   * Qué teclear, y en qué pestaña, para ver la cifra en el simulador o para confirmarla. Solo
   * donde es VERDAD con los controles actuales, y con los decimales que imprime el panel.
   */
  comoComprobar?: string;
}

/** Recordatorio de R para las pistas de los casos que usan PV = nRT. */
const PISTA_R =
  'Si usas R = 0,0821 atm·L/(mol·K), como muchos libros, el resultado cambia menos de un 0,1\u00A0% y también vale.';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'La presión de un gas encerrado',
    enunciado:
      'Un recipiente de 10 L contiene 2 mol de un gas ideal a 300 K. ¿Qué presión ejerce el gas? Da el resultado en atmósferas, redondeado a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'presion', V1: 10, T1: 300, n: 2 },
    etiquetaRespuesta: 'P en atm',
    pista: `De PV = nRT, P = nRT/V. Con R = 8,314 J/(mol·K) trabaja en el SI (V en m³) y pasa los pascales a atmósferas al final (1 atm = 101.325 Pa). ${PISTA_R}`,
    comoComprobar:
      'En la pestaña «Ley del Gas Ideal», elige Calcular «Presión (P)» y escribe V = 10, T = 300 y n = 2: el Resultado sale 4,923 atm.',
  },
  {
    id: 2,
    titulo: 'El volumen molar',
    enunciado:
      '¿Qué volumen ocupa 1 mol de gas ideal a 273,15 K (0 °C) y 1 atm? Da el resultado en litros, redondeado a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'volumen', P1: 1, T1: 273.15, n: 1 },
    etiquetaRespuesta: 'V en L',
    pista: `V = nRT/P. Es el famoso «22,4 L» de los libros, con un decimal más. ${PISTA_R}`,
    comoComprobar:
      'En la pestaña «Ley del Gas Ideal», elige Calcular «Volumen (V)» y escribe P = 1, T = 273,15 y n = 1: el Resultado sale 22,413 L.',
  },
  {
    id: 3,
    titulo: 'Cuánto gas hay en un tanque',
    enunciado:
      'Un tanque pequeño de 5 L contiene gas a 2 atm y 25 °C. ¿Cuántos moles de gas hay dentro? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'moles', P1: 2, V1: 5, T1C: 25 },
    etiquetaRespuesta: 'n en mol',
    pista: `Pasa primero la temperatura a kelvin (sumando 273,15) y despeja n = PV/(RT). ${PISTA_R}`,
    comoComprobar:
      'En la pestaña «Ley del Gas Ideal», elige Calcular «Cantidad (n)» y escribe P = 2, V = 5 y T = 298,15: el Resultado sale 0,4088 mol.',
  },
  {
    id: 4,
    titulo: 'La temperatura de un recipiente',
    enunciado:
      'Un recipiente de laboratorio de 12 L contiene 0,5 mol de gas a 1,5 atm. ¿A qué temperatura está el gas, en grados Celsius? Redondea a una décima.',
    categoria: 'aplicado',
    datos: { magnitud: 'temperatura', P1: 1.5, V1: 12, n: 0.5, enCelsius: true, decimales: 1 },
    etiquetaRespuesta: 'T en °C',
    pista: `T = PV/(nR) sale en kelvin: réstale 273,15 para pasarla a grados Celsius. ${PISTA_R}`,
    comoComprobar:
      'En la pestaña «Ley del Gas Ideal», elige Calcular «Temperatura (T)» y escribe P = 1,5, V = 12 y n = 0,5: el Resultado sale 438,742 K, y su equivalencia, 165,59 °C.',
  },
  {
    id: 5,
    titulo: 'Comprimir con un pistón',
    enunciado:
      'Un cilindro con pistón contiene 10 L de aire a 1 atm. Se empuja el pistón despacio, sin que cambie la temperatura, hasta que el aire ocupa 4 L. ¿Qué presión tiene ahora el aire, en atmósferas?',
    categoria: 'aplicado',
    datos: { magnitud: 'presionIsotermo', P1: 1, V1: 10, V2: 4, decimales: 1 },
    etiquetaRespuesta: 'P₂ en atm',
    pista: 'A temperatura constante, P₁·V₁ = P₂·V₂ (ley de Boyle). Si el volumen se hace más pequeño, la presión tiene que subir.',
    comoComprobar:
      'En la pestaña «Procesos», elige «Isotermo (T cte)» y escribe P₁ = 1, V₁ = 10 y V₂ = 4: P₂ sale 2,500 atm.',
  },
  {
    id: 6,
    titulo: 'Un globo al calentarse',
    enunciado:
      'Un globo contiene 2 L de aire a 300 K. Se calienta a presión constante hasta 360 K. ¿Qué volumen tiene ahora, en litros?',
    categoria: 'aplicado',
    datos: { magnitud: 'volumenIsobaro', V1: 2, T1: 300, T2: 360, decimales: 1 },
    etiquetaRespuesta: 'V₂ en L',
    pista: 'A presión constante, V₁/T₁ = V₂/T₂ (ley de Charles): el volumen crece en la misma proporción que la temperatura en kelvin.',
    comoComprobar:
      'En la pestaña «Procesos», elige «Isobárico (P cte)» y escribe V₁ = 2, T₁ = 300 y T₂ = 360: V₂ sale 2,400 L.',
  },
  {
    id: 7,
    titulo: 'Un aerosol al sol',
    enunciado:
      'Un aerosol es un recipiente rígido. Uno contiene gas a 2 atm y 20 °C, y al dejarlo al sol el gas llega a 60 °C. ¿Qué presión alcanza, en atmósferas? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'presionIsocoro', P1: 2, T1C: 20, T2C: 60 },
    etiquetaRespuesta: 'P₂ en atm',
    pista: 'A volumen constante, P₁/T₁ = P₂/T₂ (ley de Gay-Lussac), con las temperaturas en KELVIN. Si te sale 6 atm, has usado los grados Celsius.',
    comoComprobar:
      'En la pestaña «Procesos», elige «Isocórico (V cte)» y escribe P₁ = 2, T₁ = 293,15 y T₂ = 333,15: P₂ sale 2,273 atm.',
  },
  {
    id: 8,
    titulo: 'Una expansión a temperatura constante',
    enunciado:
      'Un gas ocupa 3 L a 4 atm. Se expande sin que cambie su temperatura hasta que su presión es 1,5 atm. ¿Qué volumen ocupa entonces, en litros?',
    categoria: 'abstracto',
    datos: { magnitud: 'volumenFinal', P1: 4, V1: 3, P2: 1.5, decimales: 0 },
    etiquetaRespuesta: 'V₂ en L',
    pista: 'A temperatura constante, P₁·V₁ = P₂·V₂. La temperatura no hace falta: se cancela.',
    comoComprobar:
      'En la pestaña «Procesos», elige «Isotermo (T cte)» y escribe P₁ = 4, V₁ = 3 y en V₂ tu resultado: P₂ debe salir 1,500 atm.',
  },
  {
    id: 9,
    titulo: 'La ley combinada en un compresor',
    enunciado:
      'En un compresor, una muestra de aire que ocupa 6 L a 1 atm y 27 °C se comprime y se calienta hasta 2 atm y 127 °C. ¿Qué volumen ocupa ahora, en litros? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'volumenFinal', P1: 1, V1: 6, T1C: 27, P2: 2, T2C: 127 },
    etiquetaRespuesta: 'V₂ en L',
    pista: `P₁V₁/T₁ = P₂V₂/T₂, con las temperaturas en kelvin. Duplicar la presión reduce el volumen a la mitad, pero calentar lo vuelve a aumentar. ${PISTA_R}`,
  },
  {
    id: 10,
    titulo: 'El trabajo de un gas que se expande',
    enunciado:
      'Un gas encerrado en un cilindro con pistón libre está a 2 atm, ocupa 5 L y tiene 300 K. Se calienta a presión constante hasta 480 K y se expande hasta 8 L. ¿Qué trabajo hace el gas al empujar el pistón, en julios? Redondea a unidades.',
    categoria: 'aplicado',
    datos: { magnitud: 'trabajoIsobaro', P1: 2, V1: 5, T1: 300, T2: 480, decimales: 0 },
    etiquetaRespuesta: 'W en J',
    pista: 'A presión constante, W = P·ΔV. Para que salga en julios, P en pascales y ΔV en metros cúbicos (1 L = 0,001 m³).',
    comoComprobar:
      'En la pestaña «Procesos», elige «Isobárico (P cte)» y escribe P₁ = 2, V₁ = 5, T₁ = 300 y T₂ = 480: V₂ sale 8,000 L y el Trabajo W, 607,95 J.',
  },
  {
    id: 11,
    titulo: 'Hasta dónde calentar un recipiente rígido',
    enunciado:
      'Un recipiente rígido contiene gas a 300 K y 1,2 atm. ¿A qué temperatura hay que llevarlo para que la presión llegue a 1,8 atm? Da el resultado en kelvin.',
    categoria: 'abstracto',
    datos: { magnitud: 'temperaturaFinal', P1: 1.2, T1: 300, P2: 1.8, decimales: 0 },
    etiquetaRespuesta: 'T₂ en K',
    pista: 'A volumen constante, P₁/T₁ = P₂/T₂: despeja T₂. El volumen no hace falta.',
    comoComprobar:
      'En la pestaña «Procesos», elige «Isocórico (V cte)» y escribe P₁ = 1,2, T₁ = 300 y en T₂ tu resultado: P₂ debe salir 1,800 atm.',
  },
  {
    id: 12,
    titulo: 'Duplicar el volumen',
    enunciado:
      'Un gas está a 20 °C. ¿Hasta qué temperatura, en grados Celsius, hay que calentarlo a presión constante para que su volumen se duplique? Redondea a unidades.',
    categoria: 'aplicado',
    datos: { magnitud: 'temperaturaFinal', V1: 10, V2: 20, T1C: 20, enCelsius: true, decimales: 0 },
    etiquetaRespuesta: 'T₂ en °C',
    pista: 'A presión constante el volumen es proporcional a la temperatura en KELVIN. Duplicar los grados Celsius (40 °C) no duplica el volumen.',
    comoComprobar:
      'En la pestaña «Procesos», elige «Isobárico (P cte)» y escribe V₁ = 10, T₁ = 293,15 y en T₂ tu resultado pasado a kelvin (súmale 273,15): V₂ debe salir muy cerca de 20 L, el doble (con 313 °C, 19,995 L).',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «4,92 atm». La unidad es lo que
 * va detrás de « en » en la etiqueta («P₂ en atm» → «atm»), así que no se imprime nunca un
 * número suelto junto a media frase (hallazgo 830 de `simulador-genetica`).
 */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const corte = etiqueta.indexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  const cifra = formatNumber(valor, decimales);
  return unidad ? `${cifra} ${unidad}` : cifra;
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
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
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

/** Listas «amables»: cifras que se teclean sin error y dan resultados razonables. */
const MOLES = [0.5, 1, 1.5, 2] as const;
const TEMPERATURAS = [250, 300, 350, 400, 450, 500] as const;
const VOLUMENES = [2, 5, 10, 20] as const;
const PRESIONES = [0.5, 1, 2, 3] as const;
const PREGUNTAS = ['presion', 'volumen', 'temperatura', 'moles', 'boyle', 'charles', 'gayLussac'] as const;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/** Dos valores DISTINTOS de la misma lista (un proceso sin cambio no es un ejercicio). */
function elegirDos<T>(lista: readonly T[], rnd: () => number): [T, T] {
  const a = elegir(lista, rnd);
  const resto = lista.filter((x) => x !== a);
  return [a, elegir(resto, rnd)];
}

/**
 * Ejercicio aleatorio de PV = nRT o de una de las tres leyes. Usa EL MISMO `resolverCaso` que
 * los doce fijos, y por tanto el mismo motor que las pestañas: si divergieran, el alumno
 * entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const n = elegir(MOLES, rnd);
  const T = elegir(TEMPERATURAS, rnd);
  const V = elegir(VOLUMENES, rnd);
  const P = elegir(PRESIONES, rnd);
  const redondeo = 'Redondea a dos decimales.';

  let datos: DatosCaso;
  let enunciado: string;
  let etiqueta: string;

  if (pregunta === 'presion') {
    datos = { magnitud: 'presion', V1: V, T1: T, n };
    enunciado = `Un recipiente de ${numero(V)} L contiene ${numero(n)} mol de un gas ideal a ${numero(T)} K. ¿Qué presión ejerce el gas, en atmósferas? ${redondeo}`;
    etiqueta = 'P en atm';
  } else if (pregunta === 'volumen') {
    datos = { magnitud: 'volumen', P1: P, T1: T, n };
    enunciado = `¿Qué volumen ocupan ${numero(n)} mol de un gas ideal a ${numero(T)} K y ${numero(P)} atm? Da el resultado en litros. ${redondeo}`;
    etiqueta = 'V en L';
  } else if (pregunta === 'temperatura') {
    // Se descartan las combinaciones que darían un gas a pocas decenas de kelvin: un
    // ejercicio de gas ideal a −250 °C enseña física equivocada. Número de intentos acotado.
    let [p, v, m] = [P, V, n];
    let intentos = 0;
    const kelvin = (pp: number, vv: number, mm: number) => calcularGasIdeal('T', pp, vv, 0, mm) ?? NaN;
    while (!(kelvin(p, v, m) >= 200 && kelvin(p, v, m) <= 800) && intentos < 20) {
      p = elegir(PRESIONES, rnd);
      v = elegir(VOLUMENES, rnd);
      m = elegir(MOLES, rnd);
      intentos += 1;
    }
    if (!(kelvin(p, v, m) >= 200 && kelvin(p, v, m) <= 800)) [p, v, m] = [2, 20, 1];
    datos = { magnitud: 'temperatura', P1: p, V1: v, n: m };
    enunciado = `Un recipiente de ${numero(v)} L contiene ${numero(m)} mol de gas a ${numero(p)} atm. ¿A qué temperatura está el gas, en kelvin? ${redondeo}`;
    etiqueta = 'T en K';
  } else if (pregunta === 'moles') {
    // Se descartan las combinaciones que dan menos de 0,2 mol: con dos decimales, la tolerancia
    // mínima (0,01) sería más del 5 % de la respuesta y aceptaría casi cualquier cosa.
    let [p, v, t] = [P, V, T];
    let intentos = 0;
    while (molesDesde(p, v, t) < 0.2 && intentos < 20) {
      p = elegir(PRESIONES, rnd);
      v = elegir(VOLUMENES, rnd);
      t = elegir(TEMPERATURAS, rnd);
      intentos += 1;
    }
    if (!(molesDesde(p, v, t) >= 0.2)) [p, v, t] = [2, 20, 300];
    datos = { magnitud: 'moles', P1: p, V1: v, T1: t };
    enunciado = `Un recipiente de ${numero(v)} L contiene gas a ${numero(p)} atm y ${numero(t)} K. ¿Cuántos moles de gas hay dentro? ${redondeo}`;
    etiqueta = 'n en mol';
  } else if (pregunta === 'boyle') {
    const [V1, V2] = elegirDos(VOLUMENES, rnd);
    datos = { magnitud: 'presionIsotermo', P1: P, V1, V2 };
    enunciado = `Un gas ocupa ${numero(V1)} L a ${numero(P)} atm. Sin que cambie su temperatura, su volumen pasa a ${numero(V2)} L. ¿Qué presión tiene ahora, en atmósferas? ${redondeo}`;
    etiqueta = 'P₂ en atm';
  } else if (pregunta === 'charles') {
    const [T1, T2] = elegirDos(TEMPERATURAS, rnd);
    datos = { magnitud: 'volumenIsobaro', V1: V, T1, T2 };
    enunciado = `Un gas ocupa ${numero(V)} L a ${numero(T1)} K. A presión constante, su temperatura pasa a ${numero(T2)} K. ¿Qué volumen ocupa ahora, en litros? ${redondeo}`;
    etiqueta = 'V₂ en L';
  } else {
    const [T1, T2] = elegirDos(TEMPERATURAS, rnd);
    datos = { magnitud: 'presionIsocoro', P1: P, T1, T2 };
    enunciado = `Un recipiente rígido contiene gas a ${numero(P)} atm y ${numero(T1)} K. Su temperatura pasa a ${numero(T2)} K. ¿Qué presión alcanza, en atmósferas? ${redondeo}`;
    etiqueta = 'P₂ en atm';
  }

  const r = resolverCaso(datos);
  return {
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN,
    etiquetaRespuesta: etiqueta,
    pasos: r.pasos,
  };
}
