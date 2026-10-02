/**
 * Casos para clase — la tarea asignable de `simulador-mas-resorte`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada del MAS se reescribe aquí: se calcula con `describirOscilador`, `calcularEstado` y
 * `energiaInicial` de `./motor.ts`, el MISMO módulo con el que la animación, las tarjetas y las
 * barras de energía pintan sus cifras. Si la corrección y el panel calcularan distinto, la app
 * suspendería una respuesta que ella misma imprime.
 *
 *   · ω₀, T, f, γ_c y el período amortiguado → `describirOscilador(k, m, γ)`.
 *   · E = ½·k·A²                              → `energiaInicial(A, k)`.
 *   · a máxima                                → `calcularEstado(…, t = 0).a`, en el extremo.
 *   · v máxima                                → `calcularEstado(…, t = T/4).v`, en el equilibrio.
 *   · E_k y v en una posición x               → `calcularEstado(…, t)` en el instante en que
 *     el motor pasa por x, t = arccos(x/A)/ω₀ (x(t) = A·cos(ω₀t) con x(0) = A, v(0) = 0).
 *
 * Las ÚNICAS cuentas propias son las dos INVERSIONES que el motor no despeja: k = m·ω² (caso 4)
 * y m = k/ω² (caso 5), con ω = 2π/T o ω = 2πf, las mismas que la FAQ de la app enseña para
 * «medir k experimentalmente». Para que no se aparten del motor, el resultado se devuelve a
 * `describirOscilador` y se exige que reproduzca el T (o la f) del enunciado; si no cuadra, la
 * resolución sale con `{ ok: false }` en vez de con una cifra. El arccos del instante t es el
 * tercer cálculo propio, y no decide ninguna respuesta: solo elige cuándo leer el motor.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **x(0) = A y v(0) = 0**, como declara el PASO 3 del bloque educativo y la cabecera del motor.
 * ⚠️ **ω₀ = √(k/m)**, **T = 2π/ω_d** (con γ = 0, ω_d = ω₀) y **f = 1/T**.
 * ⚠️ **γ es el coeficiente viscoso en N·s/m** (m·x″ + γ·x′ + k·x = 0), así que β = γ/(2m) y el
 *    amortiguamiento crítico es **γ_c = 2√(k·m)**. Un libro que escriba A·e^(−γt) usa otra γ.
 * ⚠️ **Con γ = 0 el régimen es «libre»**, no «subamortiguado»: la amplitud no decrece (motor.ts).
 *    Por eso ningún caso pregunta el régimen con una palabra: el caso 11 pide γ_c y el 12, el
 *    período amortiguado, que son números.
 * ⚠️ **Sin gravedad**: la app no es un muelle vertical con g, la línea de equilibrio del lienzo es
 *    la posición de reposo. Ningún caso usa g en la CUENTA. El caso 7 (cama elástica) es vertical,
 *    y con g el MAS es el mismo alrededor del equilibrio con la persona encima; g solo pone una
 *    condición de verosimilitud: la lona solo empuja, así que «sin despegarse» exige
 *    ω₀²·A ≤ g (hallazgo 2627, 02/10/2026). Con k/m = 100 s⁻² y A = 0,05 m son 5 m/s².
 *
 * ── DATOS QUE DISCRIMINAN (hallazgo 2628, 02/10/2026) ───────────────────────
 *
 * Un caso no sirve si su error conceptual típico da la misma cifra que la clave. Por eso no se
 * usan f = 1 Hz (T = 1/f = f y f² = f: cambiar T por f no se nota), ni β = 1 o m = 1 en el
 * amortiguado (β² = β y γ/(2m) = γ/2: olvidar el cuadrado o la m no se nota). El caso 5 va con
 * f = 0,5 Hz y el 12 con m = 0,5 kg y β = 2 s⁻¹; los errores que eso separa están anotados en
 * cada uno y fijados en el spec.
 */

import { formatNumber } from '@/lib';
import { calcularEstado, describirOscilador, energiaInicial } from './motor';

/** Holgura relativa con la que una inversión (k o m) tiene que reproducir el T o la f dados. */
const HOLGURA_INVERSION = 1e-9;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** ω₀ = √(k/m). */
  | 'omega0'
  /** T = 2π/ω₀, sin amortiguamiento. */
  | 'periodo'
  /** f = 1/T, sin amortiguamiento. */
  | 'frecuencia'
  /** k despejada del período medido: k = m·(2π/T)². */
  | 'constanteDesdePeriodo'
  /** m despejada de la frecuencia medida: m = k/(2πf)². */
  | 'masaDesdeFrecuencia'
  /** E = ½·k·A². */
  | 'energia'
  /** v máxima = A·ω₀, al pasar por el equilibrio. */
  | 'velocidadMaxima'
  /** a máxima = k·A/m, en los extremos. */
  | 'aceleracionMaxima'
  /** E_k al pasar por la posición x: ½·k·(A² − x²). */
  | 'energiaCineticaEnX'
  /** |v| al pasar por la posición x: ω₀·√(A² − x²). */
  | 'velocidadEnX'
  /** γ_c = 2√(k·m). */
  | 'gammaCritico'
  /** T = 2π/ω_d con amortiguamiento γ > 0. */
  | 'periodoAmortiguado';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Masa, en kg. */
  m?: number;
  /** Constante del muelle, en N/m. */
  k?: number;
  /** Amplitud, en m. */
  A?: number;
  /** Posición por la que se pregunta, en m (medida desde el equilibrio). */
  x?: number;
  /** Coeficiente de amortiguamiento viscoso, en N·s/m. Por defecto 0. */
  gamma?: number;
  /** Período medido, en s (caso de k despejada). */
  T?: number;
  /** Si el período se da como «N oscilaciones en t segundos»: el número de oscilaciones. */
  oscilaciones?: number;
  /** …y el tiempo que tardan, en s. Con los dos, T = tiempo/oscilaciones. */
  tiempo?: number;
  /** Frecuencia medida, en Hz (caso de m despejada). */
  f?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (rad/s, s, Hz, N/m, kg, J, m/s, m/s² o N·s/m). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «6,2832», «40.000». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * ¿La cifra exacta tiene más decimales de los que se piden? Holgura RELATIVA: 315,83 y 0,5 se
 * juzgan con la misma vara (una absoluta de 1e-9 trataría distinto una cifra grande).
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

/** Falta un dato obligatorio: se responde con un error legible, nunca con una excepción. */
function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** Unidad en la que sale el resultado de cada magnitud. */
export function unidadDeMagnitud(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'omega0':
      return 'rad/s';
    case 'periodo':
    case 'periodoAmortiguado':
      return 's';
    case 'frecuencia':
      return 'Hz';
    case 'constanteDesdePeriodo':
      return 'N/m';
    case 'masaDesdeFrecuencia':
      return 'kg';
    case 'energia':
    case 'energiaCineticaEnX':
      return 'J';
    case 'velocidadMaxima':
    case 'velocidadEnX':
      return 'm/s';
    case 'aceleracionMaxima':
      return 'm/s²';
    case 'gammaCritico':
      return 'N·s/m';
    default:
      return '';
  }
}

function conUnidad(valor: number, datos: DatosCaso): string {
  const unidad = unidadDeMagnitud(datos.magnitud);
  const cifra = formatNumber(valor, datos.decimales ?? 2);
  return unidad ? `${cifra} ${unidad}` : cifra;
}

/** El instante en que el oscilador libre (x(0) = A, v(0) = 0) pasa por primera vez por x. */
function instanteEnPosicion(A: number, x: number, omega0: number): number {
  return Math.acos(x / A) / omega0;
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  const gamma = datos.gamma ?? 0;
  let valor: number;

  if (!Number.isFinite(gamma) || gamma < 0) {
    return { ok: false, valor: NaN, pasos, error: 'El amortiguamiento no puede ser negativo.' };
  }

  switch (datos.magnitud) {
    /* ── Lo que sale directamente de describirOscilador ─────────────────── */
    case 'omega0': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      const o = describirOscilador(datos.k, datos.m, 0);
      valor = o.omega0;
      pasos.push(
        `La pulsación propia solo depende del muelle y de la masa: ω₀ = √(k/m) = √(${numero(datos.k)}/${numero(datos.m)}) = √${numero(datos.k / datos.m)} = ${numero(valor)} rad/s.`,
      );
      pasos.push('La amplitud no interviene: si separas más el bloque, oscila con el mismo ritmo (isocronismo).');
      break;
    }

    case 'periodo': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      const o = describirOscilador(datos.k, datos.m, 0);
      if (o.periodo === null) return { ok: false, valor: NaN, pasos, error: 'El sistema no oscila.' };
      pasos.push(`Primero la pulsación: ω₀ = √(k/m) = √(${numero(datos.k)}/${numero(datos.m)}) = ${numero(o.omega0)} rad/s.`);
      valor = o.periodo;
      pasos.push(`El período es el tiempo de una oscilación completa: T = 2π/ω₀ = 2π/${numero(o.omega0)} = ${numero(valor)} s.`);
      pasos.push(`Equivale a T = 2π·√(m/k): con más masa el período crece, con un muelle más duro se acorta.`);
      break;
    }

    case 'frecuencia': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      const o = describirOscilador(datos.k, datos.m, 0);
      if (o.frecuencia === null || o.periodo === null) {
        return { ok: false, valor: NaN, pasos, error: 'El sistema no oscila.' };
      }
      pasos.push(
        `ω₀ = √(k/m) = √(${numero(datos.k)}/${numero(datos.m)}) = √${numero(datos.k / datos.m)} = ${numero(o.omega0)} rad/s. Solo cuenta la razón k/m.`,
      );
      valor = o.frecuencia;
      pasos.push(
        `La frecuencia son las oscilaciones por segundo: f = ω₀/(2π) = ${numero(o.omega0)}/(2π) = ${numero(valor)} Hz (o f = 1/T, con T = ${numero(o.periodo)} s).`,
      );
      pasos.push('Ojo: ω₀ va en rad/s y f en Hz. No son la misma magnitud: ω₀ = 2π·f.');
      break;
    }

    case 'gammaCritico': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      const o = describirOscilador(datos.k, datos.m, 0);
      valor = o.gammaCritico;
      pasos.push(
        `El amortiguamiento crítico es γ_c = 2·√(k·m) = 2·√(${numero(datos.k)}·${numero(datos.m)}) = 2·√${numero(datos.k * datos.m)} = ${numero(valor)} N·s/m.`,
      );
      pasos.push(
        'Con γ = γ_c el sistema vuelve al equilibrio lo más rápido posible SIN cruzarlo; con menos, rebota (subamortiguado); con más, vuelve más despacio (sobreamortiguado).',
      );
      break;
    }

    case 'periodoAmortiguado': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      if (!(gamma > 0)) return falta('un amortiguamiento mayor que cero', pasos);
      const o = describirOscilador(datos.k, datos.m, gamma);
      const umbral = `¿Oscila? γ_c = 2·√(k·m) = 2·√(${numero(datos.k)}·${numero(datos.m)}) = ${numero(o.gammaCritico)} N·s/m.`;
      // El régimen lo decide el motor, no el texto: si alguien cambia los datos, la frase sigue.
      if (o.regimen !== 'subamortiguado' || o.omegaD === null || o.periodo === null) {
        pasos.push(`${umbral} Con γ = ${numero(gamma)} N·s/m el sistema no llega a oscilar.`);
        return { ok: false, valor: NaN, pasos, error: 'Con ese amortiguamiento el sistema no oscila: no hay período.' };
      }
      pasos.push(
        `${umbral} Como γ = ${numero(gamma)} N·s/m es menor, el régimen es subamortiguado: oscila con amplitud decreciente.`,
      );
      pasos.push(`β = γ/(2m) = ${numero(gamma)}/(2·${numero(datos.m)}) = ${numero(o.beta)} s⁻¹ y ω₀ = √(k/m) = ${numero(o.omega0)} rad/s.`);
      pasos.push(
        `Pulsación amortiguada: ω_d = √(ω₀² − β²) = √(${numero(o.omega0 * o.omega0)} − ${numero(o.beta * o.beta)}) = ${numero(o.omegaD)} rad/s.`,
      );
      valor = o.periodo;
      pasos.push(`T = 2π/ω_d = 2π/${numero(o.omegaD)} = ${numero(valor)} s.`);
      pasos.push(
        `Con ω₀ en lugar de ω_d saldría 2π/${numero(o.omega0)} = ${numero((2 * Math.PI) / o.omega0)} s, que es el error típico: el amortiguamiento hace el período un poco MÁS largo.`,
      );
      break;
    }

    /* ── Las dos inversiones, contrastadas de vuelta con el motor ───────── */
    case 'constanteDesdePeriodo': {
      if (!positivo(datos.m)) return falta('la masa', pasos);
      let T = datos.T;
      if (positivo(datos.oscilaciones) && positivo(datos.tiempo)) {
        T = datos.tiempo / datos.oscilaciones;
        pasos.push(
          `Período de UNA oscilación: T = ${numero(datos.tiempo)} s / ${numero(datos.oscilaciones)} = ${numero(T)} s. Cronometrar varias oscilaciones reduce el error de reacción.`,
        );
      }
      if (!positivo(T)) return falta('el período', pasos);
      const omega = (2 * Math.PI) / T;
      pasos.push(`Pulsación: ω₀ = 2π/T = 2π/${numero(T)} = ${numero(omega)} rad/s.`);
      valor = datos.m * omega * omega;
      pasos.push(`De ω₀ = √(k/m) se despeja k = m·ω₀² = ${numero(datos.m)}·${numero(omega)}² = ${numero(valor)} N/m.`);
      const comprobacion = describirOscilador(valor, datos.m, 0).periodo;
      if (comprobacion === null || Math.abs(comprobacion - T) > HOLGURA_INVERSION * T) {
        return { ok: false, valor: NaN, pasos, error: 'La constante despejada no reproduce el período.' };
      }
      pasos.push(`Comprobación: con k = ${numero(valor, 2)} N/m y m = ${numero(datos.m)} kg, T = 2π·√(m/k) = ${numero(comprobacion)} s.`);
      break;
    }

    case 'masaDesdeFrecuencia': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.f)) return falta('la frecuencia', pasos);
      const omega = 2 * Math.PI * datos.f;
      pasos.push(`Pulsación: ω₀ = 2π·f = 2π·${numero(datos.f)} = ${numero(omega)} rad/s.`);
      valor = datos.k / (omega * omega);
      pasos.push(`De ω₀ = √(k/m) se despeja m = k/ω₀² = ${numero(datos.k)}/${numero(omega)}² = ${numero(valor)} kg.`);
      const comprobacion = describirOscilador(datos.k, valor, 0).frecuencia;
      if (comprobacion === null || Math.abs(comprobacion - datos.f) > HOLGURA_INVERSION * datos.f) {
        return { ok: false, valor: NaN, pasos, error: 'La masa despejada no reproduce la frecuencia.' };
      }
      pasos.push(`Comprobación: con m = ${numero(valor)} kg y k = ${numero(datos.k)} N/m, f = √(k/m)/(2π) = ${numero(comprobacion)} Hz.`);
      break;
    }

    /* ── Energía y cinemática, leyendo el estado del motor ──────────────── */
    case 'energia': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.A)) return falta('la amplitud', pasos);
      valor = energiaInicial(datos.A, datos.k);
      pasos.push(
        'En el extremo (x = A) el bloque está parado: toda la energía es potencial elástica, y sin rozamiento se conserva durante toda la oscilación.',
      );
      pasos.push(`E = ½·k·A² = ½·${numero(datos.k)}·${numero(datos.A)}² = ${numero(valor)} J.`);
      pasos.push('La masa no interviene. Y si doblas la amplitud, la energía se multiplica por cuatro (E ∝ A²).');
      break;
    }

    case 'velocidadMaxima': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      if (!positivo(datos.A)) return falta('la amplitud', pasos);
      const o = describirOscilador(datos.k, datos.m, 0);
      if (o.periodo === null) return { ok: false, valor: NaN, pasos, error: 'El sistema no oscila.' };
      // Un cuarto de período después de soltarlo desde x = A, el bloque pasa por el equilibrio.
      const estado = calcularEstado(datos.A, datos.k, datos.m, 0, o.periodo / 4);
      valor = Math.abs(estado.v);
      pasos.push(`ω₀ = √(k/m) = √(${numero(datos.k)}/${numero(datos.m)}) = ${numero(o.omega0)} rad/s.`);
      pasos.push(
        `La velocidad es máxima al pasar por el equilibrio (x = 0), donde toda la energía es cinética: v_máx = A·ω₀ = ${numero(datos.A)}·${numero(o.omega0)} = ${numero(valor)} m/s.`,
      );
      pasos.push(
        `Por energías sale lo mismo: ½·m·v_máx² = ½·k·A², así que v_máx = A·√(k/m).`,
      );
      break;
    }

    case 'aceleracionMaxima': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      if (!positivo(datos.A)) return falta('la amplitud', pasos);
      // En t = 0 el bloque está en x = A, el extremo: ahí la fuerza del muelle es la mayor.
      const estado = calcularEstado(datos.A, datos.k, datos.m, 0, 0);
      valor = Math.abs(estado.a);
      pasos.push(
        `La fuerza del muelle es F = −k·x (ley de Hooke), y es mayor cuanto más lejos del equilibrio: en los extremos, x = ±A.`,
      );
      pasos.push(
        `Por la segunda ley de Newton, a_máx = k·A/m = ${numero(datos.k)}·${numero(datos.A)}/${numero(datos.m)} = ${numero(valor)} m/s², dirigida hacia el equilibrio.`,
      );
      pasos.push(`Equivale a a_máx = ω₀²·A, con ω₀² = k/m = ${numero(datos.k / datos.m)} rad²/s².`);
      break;
    }

    case 'energiaCineticaEnX':
    case 'velocidadEnX': {
      if (!positivo(datos.k)) return falta('la constante del muelle', pasos);
      if (!positivo(datos.m)) return falta('la masa', pasos);
      if (!positivo(datos.A)) return falta('la amplitud', pasos);
      if (typeof datos.x !== 'number' || !Number.isFinite(datos.x)) return falta('la posición', pasos);
      if (Math.abs(datos.x) > datos.A) {
        return { ok: false, valor: NaN, pasos, error: 'La posición no puede estar más lejos del equilibrio que la amplitud.' };
      }
      const o = describirOscilador(datos.k, datos.m, 0);
      const estado = calcularEstado(datos.A, datos.k, datos.m, 0, instanteEnPosicion(datos.A, datos.x, o.omega0));
      const E = energiaInicial(datos.A, datos.k);
      const Ep = 0.5 * datos.k * datos.x * datos.x;
      pasos.push(`Sin rozamiento la energía total se conserva: E = ½·k·A² = ½·${numero(datos.k)}·${numero(datos.A)}² = ${numero(E)} J.`);
      pasos.push(`En x = ${numero(datos.x)} m, la potencial elástica es E_p = ½·k·x² = ½·${numero(datos.k)}·${numero(datos.x)}² = ${numero(Ep)} J.`);
      if (datos.magnitud === 'energiaCineticaEnX') {
        valor = estado.Ek;
        pasos.push(`El resto es cinética: E_k = E − E_p = ${numero(E)} − ${numero(Ep)} = ${numero(valor)} J.`);
      } else {
        valor = Math.abs(estado.v);
        pasos.push(`El resto es cinética: E_k = E − E_p = ${numero(E)} − ${numero(Ep)} = ${numero(estado.Ek)} J.`);
        pasos.push(
          `De E_k = ½·m·v² se despeja v = √(2·E_k/m) = √(2·${numero(estado.Ek)}/${numero(datos.m)}) = ${numero(valor)} m/s.`,
        );
        pasos.push(
          `Atajo: v = ω₀·√(A² − x²) = ${numero(o.omega0)}·√(${numero(datos.A)}² − ${numero(datos.x)}²) = ${numero(valor)} m/s. Sale el mismo módulo al ir que al volver.`,
        );
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
  pasos.push(
    exigeRedondeo(valor, decimales)
      ? `Redondeando ${textoRedondeo(decimales)}: ${conUnidad(redondeado, datos)}.`
      : `Resultado: ${conUnidad(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * La tolerancia de un caso la da la PREGUNTA, no el tamaño de la cifra (hallazgo 2626,
 * 02/10/2026). Es el error de lectura de los datos propagado a la respuesta más media unidad del
 * redondeo pedido; aquí los datos son EXACTOS (nada se lee de una tabla ni de una gráfica), así
 * que solo queda el redondeo:
 *
 *   · si la cifra exacta tiene más decimales de los que se piden, media unidad del último
 *     decimal pedido: entra todo lo que redondea a la clave (de 315,5 a 316,5 en el caso 4, que
 *     incluye el 315,83 sin redondear y el 315,51 de usar π ≈ 3,14);
 *   · si la cifra es exacta, no hay redondeo que tolerar: solo vale ella (γ_c = 100, E = 1 J,
 *     a_máx = 40 en Practicar).
 *
 * Antes era el mayor entre 0,01 y el 1 % de la respuesta, y el 1 % de una cifra no es la escala
 * de su error: pasaban 99 y 101 por γ_c = 100 exactos, el 315 de truncar 315,83 o 1,04 por
 * 1,05. Ningún error conceptual caía dentro del 1 %: lo que colaban eran redondeos mal hechos.
 * Es la forma reparada en simulador-circuitos-electricos (060c1e94), simulador-distribucion-normal
 * (afdef86f) y simulador-fotografia (794ace00).
 *
 * ⚠️ Redondear un paso intermedio puede sacar la respuesta del margen; la intro lo avisa.
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

/**
 * Corrige la respuesta del alumno. Nunca lanza. Recibe los `datos` del caso porque la
 * tolerancia depende de la pregunta (ver `toleranciaDe`), no de la cifra.
 */
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
  /**
   * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde
   * EXACTO de la tolerancia la resta en coma flotante decide por ±1 ulp, así que la misma
   * desviación se aceptaba por arriba y se rechazaba por abajo. 1e-9 absorbe ese ruido y queda
   * seis órdenes de magnitud por debajo de la menor tolerancia no nula (0,005); con una
   * respuesta exacta (tolerancia 0) es lo único que separa 0,3 de 0,30000000000000004.
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
   * La respuesta exacta tiene más decimales de los que se piden, así que el enunciado dice
   * «redondea». Se CALCULA desde el motor, no se declara a mano: no puede mentir.
   */
  requiereRedondeo: boolean;
  /**
   * Qué poner en los deslizadores para ver la cifra en el panel o para confirmarla. Solo donde
   * es VERDAD con los controles actuales, y con los decimales que imprime el panel (3).
   */
  comoComprobar?: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: más del 90 % de este canal es de fuera de España. Los
 * datos están elegidos para que k/m sea un cuadrado perfecto (ω₀ entero; en el caso 12 lo es
 * ω₀² − β², y ω_d sale entera); donde sale π (T, f,
 * k despejada), el enunciado pide el redondeo y el caso lo marca con `requiereRedondeo`, que se
 * calcula comparando la respuesta exacta con la redondeada.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'La pulsación propia',
    enunciado:
      'Un bloque de 2 kg está unido a un muelle de constante k = 50 N/m y oscila sin rozamiento. ¿Cuál es su pulsación (frecuencia angular) propia ω₀, en rad/s?',
    categoria: 'abstracto',
    datos: { magnitud: 'omega0', m: 2, k: 50, decimales: 0 },
    etiquetaRespuesta: 'ω₀ en rad/s',
    pista: 'ω₀ = √(k/m). Solo dependen del muelle y de la masa: la amplitud no hace falta.',
    comoComprobar: 'Pon Masa m = 2,0 kg y Constante k = 50 N/m (γ = 0): la tarjeta «ω₀» marca 5,000 rad/s.',
  },
  {
    id: 2,
    titulo: 'El período de oscilación',
    enunciado:
      'Un bloque de 1 kg cuelga de un muelle de constante k = 36 N/m y oscila sin rozamiento. ¿Cuánto tarda en hacer una oscilación completa? Da el resultado en segundos, redondeado a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'periodo', m: 1, k: 36 },
    etiquetaRespuesta: 'T en s',
    pista: 'Calcula primero ω₀ = √(k/m) y después T = 2π/ω₀.',
    comoComprobar: 'Pon Masa m = 1,0 kg y Constante k = 36 N/m (γ = 0): la tarjeta «Período T» marca 1,047 s.',
  },
  {
    id: 3,
    titulo: 'La suspensión de un coche',
    enunciado:
      'Cada rueda de un coche soporta 400 kg y su muelle de suspensión tiene una constante k = 40.000 N/m. Si se ignora el amortiguador, ¿con qué frecuencia rebota la carrocería? Da el resultado en hercios, redondeado a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'frecuencia', m: 400, k: 40000 },
    etiquetaRespuesta: 'f en Hz',
    pista: 'f = ω₀/(2π), con ω₀ = √(k/m). Cuidado con no confundir ω₀ (rad/s) con f (Hz).',
    comoComprobar:
      'Los deslizadores no llegan a 400 kg, pero solo importa la razón k/m = 100: pon Masa m = 1,0 kg y Constante k = 100 N/m y la tarjeta «Frecuencia f» marca 1,592 Hz.',
  },
  {
    id: 4,
    titulo: 'Medir la constante de un muelle',
    enunciado:
      'Para medir la constante de un muelle se le cuelga una masa de 2 kg, se la hace oscilar y se cronometran 10 oscilaciones completas en 5 s. ¿Cuánto vale la constante k del muelle, en N/m? Redondea a unidades.',
    categoria: 'aplicado',
    datos: { magnitud: 'constanteDesdePeriodo', m: 2, oscilaciones: 10, tiempo: 5, decimales: 0 },
    etiquetaRespuesta: 'k en N/m',
    pista: 'Saca primero el período de UNA oscilación. Después despeja k de T = 2π·√(m/k): k = m·(2π/T)².',
    comoComprobar:
      'Con 2 kg tu k no cabe en el deslizador, pero el período solo depende de k/m: pon Masa m = 0,5 kg y en Constante k tu resultado dividido entre 4. La tarjeta «Período T» debe marcar 0,500 s (con k = 79 N/m, 0,500 s).',
  },
  {
    id: 5,
    titulo: 'Una masa sin báscula',
    enunciado:
      'Para averiguar la masa de un objeto sin báscula, se cuelga de un muelle de constante k = 20 N/m y se mide que oscila con una frecuencia de 0,5 Hz. ¿Qué masa tiene el objeto, en kg? Redondea a dos decimales.',
    categoria: 'aplicado',
    // m = 20/(2π·0,5)² = 20/π² = 2,0264 → 2,03 kg. Con f = 0,5 Hz (y no 1 Hz, hallazgo 2628) los
    // errores típicos dan otra cifra: T y f cambiados, 20·0,5²/(4π²) = 0,13 · f sin elevar,
    // 20/(4π²·0,5) = 1,01 · ω sin elevar, 20/π = 6,37 · sin el 2π, 20/0,5² = 80.
    datos: { magnitud: 'masaDesdeFrecuencia', k: 20, f: 0.5 },
    etiquetaRespuesta: 'm en kg',
    pista: 'ω₀ = 2π·f, y de ω₀ = √(k/m) se despeja m = k/ω₀².',
    comoComprobar:
      'Pon Constante k = 20 N/m y en Masa m tu resultado redondeado a la décima: la tarjeta «Frecuencia f» debe marcar casi 0,5 Hz (con 2,0 kg, 0,503 Hz).',
  },
  {
    id: 6,
    titulo: 'La energía de la oscilación',
    enunciado:
      'Un muelle de constante k = 50 N/m se estira 0,2 m desde su posición de equilibrio y se suelta, sin rozamiento. ¿Cuál es la energía mecánica total de la oscilación, en julios?',
    categoria: 'abstracto',
    datos: { magnitud: 'energia', k: 50, A: 0.2, decimales: 0 },
    etiquetaRespuesta: 'E en J',
    pista: 'En el extremo el bloque está parado, así que toda la energía es potencial elástica: E = ½·k·A².',
    comoComprobar:
      'Pon Constante k = 50 N/m y Amplitud A = 0,20 m (la masa da igual, γ = 0): en «Energías del sistema», la barra «Total E» marca 1,000 J todo el rato.',
  },
  {
    id: 7,
    titulo: 'Rebotar en una cama elástica',
    enunciado:
      'Una persona de 50 kg se balancea suavemente de pie sobre una cama elástica, sin despegarse de la lona. La lona se comporta como un muelle de constante k = 5000 N/m y la persona oscila con una amplitud de 5 cm alrededor de su posición de equilibrio. ¿Cuál es su velocidad máxima, en m/s?',
    categoria: 'aplicado',
    // v_máx = A·ω₀ = 0,05·√(5000/50) = 0,05·10 = 0,5 m/s exactos. «Sin despegarse» exige que en
    // el punto alto ω₀²·A = 100·0,05 = 5 m/s² no pase de g (hallazgo 2627): con A = 0,2 m eran
    // 20 m/s², el doble. El error típico, A·ω₀² (la a_máx), da 5.
    datos: { magnitud: 'velocidadMaxima', m: 50, k: 5000, A: 0.05, decimales: 1 },
    etiquetaRespuesta: 'v máx. en m/s',
    pista: 'La velocidad es máxima al pasar por el equilibrio: v_máx = A·ω₀, con ω₀ = √(k/m).',
  },
  {
    id: 8,
    titulo: 'La aceleración en el extremo',
    enunciado:
      'Un bloque de 2 kg unido a un muelle de constante k = 80 N/m oscila sin rozamiento con una amplitud de 0,25 m. ¿Cuál es el valor máximo (en módulo) de su aceleración, en m/s²?',
    categoria: 'abstracto',
    datos: { magnitud: 'aceleracionMaxima', m: 2, k: 80, A: 0.25, decimales: 0 },
    etiquetaRespuesta: 'a máx. en m/s²',
    pista: 'La fuerza del muelle, F = k·x, es máxima en los extremos (x = A). Aplica F = m·a.',
    comoComprobar:
      'Pon Masa m = 2,0 kg, Constante k = 80 N/m y Amplitud A = 0,25 m, pulsa «Pausar» y después «Reiniciar»: en t = 0 el bloque está en el extremo y la tarjeta «Aceleración a» marca −10,000 m/s² (el signo dice que apunta hacia el equilibrio).',
  },
  {
    id: 9,
    titulo: 'Energía cinética a mitad de camino',
    enunciado:
      'Un bloque de 2 kg unido a un muelle de constante k = 40 N/m oscila sin rozamiento con una amplitud de 0,5 m. ¿Qué energía cinética tiene cuando pasa por x = 0,3 m, en julios?',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaCineticaEnX', m: 2, k: 40, A: 0.5, x: 0.3, decimales: 1 },
    etiquetaRespuesta: 'E_k en J',
    pista: 'La energía total ½·k·A² se conserva. En x = 0,3 m una parte es potencial (½·k·x²) y el resto, cinética.',
  },
  {
    id: 10,
    titulo: 'Un carrito en un carril de aire',
    enunciado:
      'En un carril de aire de laboratorio (sin rozamiento), un carrito de 1 kg está unido a un muelle de constante k = 100 N/m. Se separa 0,5 m del equilibrio y se suelta. ¿Qué rapidez lleva cuando está a 0,3 m del equilibrio, en m/s?',
    categoria: 'aplicado',
    datos: { magnitud: 'velocidadEnX', m: 1, k: 100, A: 0.5, x: 0.3, decimales: 0 },
    etiquetaRespuesta: 'v en m/s',
    pista: 'Por energías: ½·m·v² = ½·k·(A² − x²). O directamente v = ω₀·√(A² − x²).',
  },
  {
    id: 11,
    titulo: 'El cierre de una puerta',
    enunciado:
      'El cierre automático de una puerta se modela como una masa de 25 kg unida a un muelle de constante k = 100 N/m. ¿Qué coeficiente de amortiguamiento γ, en N·s/m, hace que cierre lo más rápido posible sin rebotar (amortiguamiento crítico)?',
    categoria: 'aplicado',
    datos: { magnitud: 'gammaCritico', m: 25, k: 100, decimales: 0 },
    etiquetaRespuesta: 'γ_c en N·s/m',
    pista: 'El amortiguamiento crítico es γ_c = 2·√(k·m): separa oscilar (menos) de no oscilar (más).',
  },
  {
    id: 12,
    titulo: 'El período con amortiguamiento',
    enunciado:
      'Un bloque de 0,5 kg unido a un muelle de constante k = 10 N/m oscila con un amortiguamiento viscoso γ = 2 N·s/m. ¿Cuál es el período de sus oscilaciones, en segundos? Redondea a dos decimales.',
    categoria: 'abstracto',
    // ω₀² = 10/0,5 = 20, β = 2/(2·0,5) = 2, ω_d = √(20 − 4) = 4 rad/s, T = 2π/4 = 1,5708 → 1,57 s.
    // Con m = 0,5 y β = 2 (y no m = 1 y β = 1, hallazgo 2628) los errores dan otra cifra: ω₀ en
    // vez de ω_d, 2π/√20 = 1,40 · β sin elevar, 2π/√18 = 1,48 · β = γ/2 (sin la m), 2π/√19 = 1,44
    // · β = γ/m (sin el 2), 2π/2 = 3,14.
    datos: { magnitud: 'periodoAmortiguado', m: 0.5, k: 10, gamma: 2 },
    etiquetaRespuesta: 'T en s',
    pista: 'Con amortiguamiento la oscilación va a ω_d = √(ω₀² − β²), con β = γ/(2m), no a ω₀. Después, T = 2π/ω_d.',
    comoComprobar:
      'Pon Masa m = 0,5 kg, Constante k = 10 N/m y Amortiguamiento γ = 2,0 N·s/m: la tarjeta «ω amortiguada» marca 4,000 rad/s y «Período T», 1,571 s.',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «1,05 s». La unidad es lo que
 * va detrás de « en » en la etiqueta («v máx. en m/s» → «m/s»), así que no se imprime nunca un
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
    requiereRedondeo: r.ok && exigeRedondeo(r.valor, decimales),
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

/**
 * Listas «amables»: masas y pulsaciones enteras, así que k = m·ω₀² es entera y ω₀ = √(k/m)
 * sale exacta. Las posiciones son 0,6·A y 0,8·A, el triángulo 3-4-5: √(A² − x²) es exacta.
 */
const MASAS = [1, 2, 3, 4, 5] as const;
const PULSACIONES = [2, 3, 4, 5, 6, 8, 10] as const;
const AMPLITUDES = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5] as const;
const FRACCIONES_POSICION = [0.6, 0.8] as const;
const PREGUNTAS = [
  'omega0',
  'periodo',
  'frecuencia',
  'energia',
  'velocidadMaxima',
  'aceleracionMaxima',
  'energiaCineticaEnX',
  'velocidadEnX',
] as const;
type Pregunta = (typeof PREGUNTAS)[number];

/**
 * Respuesta mínima: con dos decimales, una respuesta de 0,02 J dejaría una o dos cifras
 * significativas, poco para comprobar nada. Por debajo de 0,5 se vuelven a tirar los datos.
 */
const RESPUESTA_MINIMA = 0.5;
const MAX_INTENTOS = 30;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

const ETIQUETAS: Record<Pregunta, string> = {
  omega0: 'ω₀ en rad/s',
  periodo: 'T en s',
  frecuencia: 'f en Hz',
  energia: 'E en J',
  velocidadMaxima: 'v máx. en m/s',
  aceleracionMaxima: 'a máx. en m/s²',
  energiaCineticaEnX: 'E_k en J',
  velocidadEnX: 'v en m/s',
};

function enunciadoPractica(pregunta: Pregunta, d: DatosCaso): string {
  const bloque = `Un bloque de ${numero(d.m ?? NaN)} kg unido a un muelle de constante k = ${numero(d.k ?? NaN)} N/m oscila sin rozamiento`;
  const conA = `${bloque} con una amplitud de ${numero(d.A ?? NaN)} m.`;
  const redondeo = 'Redondea a dos decimales.';
  switch (pregunta) {
    case 'omega0':
      return `${bloque}. ¿Cuál es su pulsación propia ω₀, en rad/s? ${redondeo}`;
    case 'periodo':
      return `${bloque}. ¿Cuál es su período, en segundos? ${redondeo}`;
    case 'frecuencia':
      return `${bloque}. ¿Cuál es su frecuencia, en hercios? ${redondeo}`;
    case 'energia':
      return `${conA} ¿Cuál es la energía mecánica total, en julios? ${redondeo}`;
    case 'velocidadMaxima':
      return `${conA} ¿Cuál es su velocidad máxima, en m/s? ${redondeo}`;
    case 'aceleracionMaxima':
      return `${conA} ¿Cuál es el módulo de su aceleración máxima, en m/s²? ${redondeo}`;
    case 'energiaCineticaEnX':
      return `${conA} ¿Qué energía cinética tiene al pasar por x = ${numero(d.x ?? NaN)} m, en julios? ${redondeo}`;
    case 'velocidadEnX':
    default:
      return `${conA} ¿Qué rapidez lleva al pasar por x = ${numero(d.x ?? NaN)} m, en m/s? ${redondeo}`;
  }
}

/**
 * Ejercicio aleatorio de MAS sin amortiguamiento. Usa EL MISMO `resolverCaso` que los doce
 * fijos, y por tanto el mismo motor que el panel: si divergieran, el alumno entrenaría con
 * una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);

  const tirar = (): DatosCaso => {
    const m = elegir(MASAS, rnd);
    const omega = elegir(PULSACIONES, rnd);
    const A = elegir(AMPLITUDES, rnd);
    const fraccion = elegir(FRACCIONES_POSICION, rnd);
    return {
      magnitud: pregunta,
      m,
      k: m * omega * omega,
      A,
      // Redondeada a milímetros: 0,6·0,3 no es exactamente 0,18 en coma flotante.
      x: Math.round(A * fraccion * 1000) / 1000,
      decimales: 2,
    };
  };

  let datos = tirar();
  let r = resolverCaso(datos);
  let intentos = 0;
  while (!(r.ok && r.valor >= RESPUESTA_MINIMA) && intentos < MAX_INTENTOS) {
    datos = tirar();
    r = resolverCaso(datos);
    intentos += 1;
  }
  if (!(r.ok && r.valor >= RESPUESTA_MINIMA)) {
    // Salida segura, que cumple el mínimo para cualquier pregunta: m = 1, ω₀ = 4, A = 0,5.
    datos = { magnitud: pregunta, m: 1, k: 16, A: 0.5, x: 0.3, decimales: 2 };
    r = resolverCaso(datos);
  }

  return {
    enunciado: enunciadoPractica(pregunta, datos),
    datos,
    respuesta: r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN,
    etiquetaRespuesta: ETIQUETAS[pregunta],
    pasos: r.pasos,
  };
}
