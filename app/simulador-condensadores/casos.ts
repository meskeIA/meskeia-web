/**
 * Casos para clase — la tarea asignable de `simulador-condensadores`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada del condensador ni del RC se reescribe aquí: se calcula con `./motor.ts`, el MISMO módulo
 * con el que la vista pinta sus tarjetas y la tabla del experimento. Si la corrección y el panel
 * calcularan distinto, la app suspendería una respuesta que ella misma imprime.
 *
 *   · C, Q, E y U                       → `calcularCondensador`, con A = cm²/1e4 y d = mm/1e3,
 *                                          las mismas conversiones que hace `page.tsx`.
 *   · El dieléctrico, en los dos modos   → `introducirDielectrico(enVacio, εr, modo)`, partiendo
 *                                          del mismo condensador en vacío que el experimento.
 *   · τ                                  → `constanteTiempo(R, C)`, con R = kΩ·1e3 y C = µF·1e-6.
 *   · V_C(t), I(t)                       → `estadoRC(modo, V, R, C, t)`.
 *   · εr de cada material                → `DIELECTRICOS`, por id. No hay ninguna cifra de
 *                                          material escrita aquí (ni rigidez dieléctrica, que se
 *                                          retiró del motor por falta de fuente).
 *
 * Las ÚNICAS cuentas propias son las dos INVERSIONES que el motor no despeja:
 *
 *   · la separación para una capacidad dada, d = ε₀·εr·A/C (caso 5);
 *   · el instante en que V_C llega a un valor, t = −τ·ln(1 − V_C/V) al cargar o
 *     t = −τ·ln(V_C/V) al descargar (caso 12).
 *
 * Para que no se aparten del motor, el resultado se DEVUELVE a `calcularCondensador` o a
 * `estadoRC` y se exige que reproduzca el dato del enunciado con holgura relativa 1e-9; si no
 * cuadra, la resolución sale con `{ ok: false }` en vez de con una cifra. Fuera de eso, solo hay
 * cambios de unidad (F → pF, J → nJ, s → ms…) y cifras que se ENSEÑAN en el desarrollo sin
 * decidir ninguna respuesta.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **ε₀**: el motor usa CODATA 2018, 8,8541878128·10⁻¹² F/m; en clase se usa 8,85·10⁻¹² F/m.
 *    Técnica de «todos los métodos coinciden» (la de los cuartiles de calculadora-estadistica):
 *    los enunciados que usan ε₀ dicen «toma ε₀ = 8,85·10⁻¹² F/m», y los datos y el redondeo
 *    pedido están elegidos para que con los DOS valores salga la misma cifra redondeada, y que
 *    ninguno quede a menos de 0,2 unidades (40 % de media unidad) de una frontera de redondeo.
 *    `coincideConEpsilonAula` lo comprueba, y el modo práctica descarta los datos que no lo
 *    cumplan. Como C, Q, U y la d despejada son PROPORCIONALES a ε₀, el valor de clase es el del
 *    motor multiplicado por 8,85·10⁻¹²/ε₀: no hace falta otra fórmula.
 * ⚠️ **Condensador ideal**: placas paralelas sin efectos de borde, el dieléctrico llena TODO el
 *    hueco y se mete en un condensador que estaba en VACÍO y cargado a la tensión de la batería
 *    (la tabla del experimento parte de ahí).
 * ⚠️ **RC**: en la carga el condensador parte descargado; en la descarga, cargado a V. La
 *    corriente se pide en módulo (en la descarga circula al revés).
 *
 * ── DATOS QUE DISCRIMINAN (hallazgo 2628, 02/10/2026) ───────────────────────
 *
 * Un caso no sirve si su error conceptual típico da la misma cifra que la clave. En cada caso
 * está anotado qué errores separa y qué cifra darían: olvidar pasar cm² a m² o mm a m, quitar el
 * ½ de la energía, aplicar el modo de batería contrario, usar e^(−t/τ) en lugar de 1 − e^(−t/τ)
 * o τ = R/C en lugar de R·C.
 */

import { formatNumber } from '@/lib';
import {
  DIELECTRICOS,
  EPSILON_0,
  calcularCondensador,
  constanteTiempo,
  estadoRC,
  introducirDielectrico,
  type Dielectrico,
  type ModoBateria,
  type ModoRC,
} from './motor';

/** Holgura relativa con la que una inversión (d o t) tiene que reproducir el dato del enunciado. */
const HOLGURA_INVERSION = 1e-9;

/** ε₀ redondeada que se usa en clase, en F/m. Solo para comprobar que el redondeo coincide. */
export const EPSILON_AULA = 8.85e-12;

/**
 * Distancia mínima, en unidades del último decimal pedido, entre cada valor (CODATA y de clase) y
 * la frontera de redondeo (…,5). 0,2 unidades es el 40 % de media unidad: el doble de lo que se
 * exige como mínimo, para que un alumno que redondee ε₀ a su manera no caiga al otro lado.
 */
const MARGEN_FRONTERA = 0.2;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** C = ε₀·εr·A/d, en pF. */
  | 'capacidad'
  /** Q = C·V, en nC. */
  | 'carga'
  /** E = V/d, en kV/m. */
  | 'campo'
  /** U = ½·C·V², en nJ. */
  | 'energia'
  /** d despejada para una capacidad dada: d = ε₀·εr·A/C, en mm. */
  | 'separacionParaCapacidad'
  /** Tensión final tras llenar de dieléctrico el condensador en vacío, en V. */
  | 'dielectricoTension'
  /** Energía final tras llenar de dieléctrico el condensador en vacío, en nJ. */
  | 'dielectricoEnergia'
  /** τ = R·C, en ms (o en s si `unidadTiempo` es 's'). */
  | 'tau'
  /** V_C en el instante t, en V. */
  | 'tensionRC'
  /** |I| en el instante t, en mA. */
  | 'corrienteRC'
  /** Instante en que V_C llega a `tensionObjetivo`, en s. */
  | 'tiempoParaTension';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Área de cada placa, en cm² (la unidad del campo de la vista). */
  areaCm2?: number;
  /** Separación entre placas, en mm. */
  separacionMm?: number;
  /** Tensión de la batería o de la fuente, en V. */
  tension?: number;
  /** Id de un material de `DIELECTRICOS` (por defecto, 'vacio'). */
  dielectrico?: string;
  /** Al meter el dieléctrico: ¿sigue la batería conectada? */
  modoBateria?: ModoBateria;
  /** Capacidad que se quiere conseguir, en pF (caso de d despejada). */
  capacidadObjetivoPf?: number;
  /** Resistencia, en kΩ. */
  resistenciaKOhm?: number;
  /** Capacidad del RC, en µF. */
  capacidadMicroF?: number;
  /** Carga o descarga. */
  modoRC?: ModoRC;
  /** Instante, en s. */
  tiempo?: number;
  /** Tensión del condensador que se quiere alcanzar, en V (caso de t despejado). */
  tensionObjetivo?: number;
  /** Unidad de τ en la respuesta. Por defecto 'ms'. */
  unidadTiempo?: 'ms' | 's';
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (pF, nC, kV/m, nJ, mm, V, ms o s, mA). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «0,0015», «220.000». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

const SUPERINDICES: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};

/**
 * Notación científica en formato español: «2,3611·10⁻¹¹». `formatNumber` no sirve aquí: por
 * debajo de 10⁻⁴ imprime «≈0», y los faradios de un condensador de aula son 10⁻¹¹.
 */
function cientifico(x: number, decimales = 4): string {
  if (!Number.isFinite(x)) return '—';
  if (x === 0) return '0';
  let exp = Math.floor(Math.log10(Math.abs(x)));
  // log10 en coma flotante puede quedarse a un pelo del entero: se corrige mirando la mantisa.
  if (Math.abs(x / 10 ** exp) < 1) exp -= 1;
  if (Math.abs(Number((x / 10 ** exp).toFixed(decimales))) >= 10) exp += 1;
  const mantisa = numero(x / 10 ** exp, decimales);
  if (exp === 0) return mantisa;
  const potencia = String(exp)
    .split('')
    .map((c) => SUPERINDICES[c] ?? c)
    .join('');
  return `${mantisa}·10${potencia}`;
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * ¿La cifra exacta tiene más decimales de los que se piden? Holgura RELATIVA: 484 ms y 0,5 V se
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

function fallo(error: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error };
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function noNegativo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

/** El material por su id, o null si no está en la lista del motor. */
function dielectricoDe(id: string | undefined): Dielectrico | null {
  return DIELECTRICOS.find((d) => d.id === (id ?? 'vacio')) ?? null;
}

/** «Vidrio Pyrex» → «vidrio Pyrex»: solo la inicial, para no rebajar el nombre propio. */
function minusculaInicial(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

/** Unidad en la que sale el resultado. */
export function unidadDe(datos: DatosCaso): string {
  switch (datos.magnitud) {
    case 'capacidad':
      return 'pF';
    case 'carga':
      return 'nC';
    case 'campo':
      return 'kV/m';
    case 'energia':
    case 'dielectricoEnergia':
      return 'nJ';
    case 'separacionParaCapacidad':
      return 'mm';
    case 'dielectricoTension':
    case 'tensionRC':
      return 'V';
    case 'tau':
      return datos.unidadTiempo === 's' ? 's' : 'ms';
    case 'corrienteRC':
      return 'mA';
    case 'tiempoParaTension':
      return 's';
    default:
      return '';
  }
}

/** ¿La respuesta depende de ε₀? Todas las que dependen son PROPORCIONALES a ε₀. */
export function dependeDeEpsilon(magnitud: Magnitud): boolean {
  return (
    magnitud === 'capacidad' ||
    magnitud === 'carga' ||
    magnitud === 'energia' ||
    magnitud === 'separacionParaCapacidad' ||
    magnitud === 'dielectricoEnergia'
  );
}

/** El valor que saldría con ε₀ = 8,85·10⁻¹² F/m (proporcional: basta reescalar el del motor). */
function conEpsilonAula(valor: number): number {
  return valor * (EPSILON_AULA / EPSILON_0);
}

/** Lejos de la frontera de redondeo, en unidades del último decimal pedido. */
function lejosDeLaFrontera(valor: number, decimales: number): boolean {
  const s = Math.abs(valor) * 10 ** decimales;
  const fraccion = s - Math.floor(s);
  return Math.abs(fraccion - 0.5) >= MARGEN_FRONTERA;
}

function conUnidad(valor: number, datos: DatosCaso): string {
  const unidad = unidadDe(datos);
  const cifra = formatNumber(valor, datos.decimales ?? 2);
  return unidad ? `${cifra} ${unidad}` : cifra;
}

/** Paso de conversión al SI de las placas: «A = 40 cm² = 0,004 m² (÷ 10.000) y …». */
function pasoPlacas(areaCm2: number, separacionMm: number, area: number, separacion: number): string {
  return `Pasa al SI: A = ${numero(areaCm2)} cm² = ${numero(area, 8)} m² (÷ 10.000) y d = ${numero(separacionMm)} mm = ${numero(separacion, 8)} m (÷ 1.000).`;
}

/** Paso de la capacidad: «C = ε₀·εr·A/d = …». */
function pasoCapacidad(material: Dielectrico, area: number, separacion: number, capacidad: number): string {
  const conMaterial =
    material.er === 1 ? 'en vacío, εr = 1' : `con ${minusculaInicial(material.nombre)}, εr = ${numero(material.er, 5)}`;
  return `C = ε₀·εr·A/d (${conMaterial}) = 8,8541878128·10⁻¹² · ${numero(material.er, 5)} · ${numero(area, 8)} / ${numero(separacion, 8)} = ${cientifico(capacidad)} F.`;
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
    /* ── El condensador: todo sale de calcularCondensador ───────────────── */
    case 'capacidad':
    case 'carga':
    case 'campo':
    case 'energia': {
      if (!positivo(datos.areaCm2)) return falta('el área de las placas', pasos);
      if (!positivo(datos.separacionMm)) return falta('la separación entre placas', pasos);
      const material = dielectricoDe(datos.dielectrico);
      if (!material) return fallo('El dieléctrico no está en la lista del simulador.', pasos);
      const tension = datos.tension ?? 0;
      if (datos.magnitud !== 'capacidad' && !positivo(tension)) return falta('la tensión de la batería', pasos);
      const area = datos.areaCm2 / 1e4;
      const separacion = datos.separacionMm / 1e3;
      const estado = calcularCondensador({ area, separacion, tension, er: material.er });
      if (!estado) return fallo('Con esos datos no hay condensador.', pasos);

      if (datos.magnitud === 'campo') {
        pasos.push(`Pasa la separación al SI: d = ${numero(datos.separacionMm)} mm = ${numero(separacion, 8)} m (÷ 1.000).`);
        valor = estado.campo / 1e3;
        pasos.push(
          `Entre placas planas el campo es uniforme: E = V/d = ${numero(tension)} / ${numero(separacion, 8)} = ${numero(estado.campo, 2)} V/m = ${numero(valor, 4)} kV/m.`,
        );
        pasos.push('El área no interviene: con la misma tensión y la misma separación, unas placas más grandes tienen el mismo campo (y más carga).');
        break;
      }

      pasos.push(pasoPlacas(datos.areaCm2, datos.separacionMm, area, separacion));
      pasos.push(pasoCapacidad(material, area, separacion, estado.capacidad));
      if (datos.magnitud === 'capacidad') {
        valor = estado.capacidad / 1e-12;
        pasos.push(`En picofaradios (1 pF = 10⁻¹² F): C = ${numero(valor, 4)} pF.`);
      } else if (datos.magnitud === 'carga') {
        valor = estado.carga / 1e-9;
        pasos.push(
          `Q = C·V = ${cientifico(estado.capacidad)} · ${numero(tension)} = ${cientifico(estado.carga)} C = ${numero(valor, 4)} nC (1 nC = 10⁻⁹ C).`,
        );
      } else {
        valor = estado.energia / 1e-9;
        pasos.push(
          `U = ½·C·V² = ½ · ${cientifico(estado.capacidad)} · ${numero(tension)}² = ${cientifico(estado.energia)} J = ${numero(valor, 4)} nJ (1 nJ = 10⁻⁹ J).`,
        );
        pasos.push(`Sin el ½ saldría el doble, ${numero(2 * valor, 2)} nJ: es el error más frecuente.`);
      }
      break;
    }

    /* ── Inversión 1: la separación para una capacidad dada ─────────────── */
    case 'separacionParaCapacidad': {
      if (!positivo(datos.areaCm2)) return falta('el área de las placas', pasos);
      if (!positivo(datos.capacidadObjetivoPf)) return falta('la capacidad buscada', pasos);
      const material = dielectricoDe(datos.dielectrico);
      if (!material) return fallo('El dieléctrico no está en la lista del simulador.', pasos);
      const area = datos.areaCm2 / 1e4;
      const objetivo = datos.capacidadObjetivoPf * 1e-12;
      pasos.push(
        `Pasa al SI: A = ${numero(datos.areaCm2)} cm² = ${numero(area, 8)} m² y C = ${numero(datos.capacidadObjetivoPf)} pF = ${cientifico(objetivo)} F.`,
      );
      const separacion = (EPSILON_0 * material.er * area) / objetivo;
      valor = separacion / 1e-3;
      pasos.push(
        `De C = ε₀·εr·A/d se despeja d = ε₀·εr·A/C = 8,8541878128·10⁻¹² · ${numero(material.er, 5)} · ${numero(area, 8)} / ${cientifico(objetivo)} = ${cientifico(separacion)} m = ${numero(valor, 4)} mm.`,
      );
      const comprobacion = calcularCondensador({ area, separacion, tension: 0, er: material.er });
      if (!comprobacion || Math.abs(comprobacion.capacidad - objetivo) > HOLGURA_INVERSION * objetivo) {
        return fallo('La separación despejada no reproduce la capacidad.', pasos);
      }
      pasos.push(
        `Comprobación: con d = ${numero(valor, 4)} mm, C = ε₀·εr·A/d = ${numero(comprobacion.capacidad / 1e-12, 4)} pF. A más separación, menos capacidad.`,
      );
      break;
    }

    /* ── El dieléctrico, con la batería conectada o desconectada ─────────── */
    case 'dielectricoTension':
    case 'dielectricoEnergia': {
      if (!positivo(datos.areaCm2)) return falta('el área de las placas', pasos);
      if (!positivo(datos.separacionMm)) return falta('la separación entre placas', pasos);
      if (!positivo(datos.tension)) return falta('la tensión de la batería', pasos);
      if (datos.modoBateria !== 'conectada' && datos.modoBateria !== 'desconectada') {
        return falta('si la batería sigue conectada', pasos);
      }
      const material = dielectricoDe(datos.dielectrico);
      if (!material) return fallo('El dieléctrico no está en la lista del simulador.', pasos);
      const area = datos.areaCm2 / 1e4;
      const separacion = datos.separacionMm / 1e3;
      const enVacio = calcularCondensador({ area, separacion, tension: datos.tension, er: 1 });
      if (!enVacio) return fallo('Con esos datos no hay condensador.', pasos);
      const final = introducirDielectrico(enVacio, material.er, datos.modoBateria);
      const otroModo: ModoBateria = datos.modoBateria === 'conectada' ? 'desconectada' : 'conectada';
      const alReves = introducirDielectrico(enVacio, material.er, otroModo);
      if (!final || !alReves) return fallo('Con esos datos no se puede meter el dieléctrico.', pasos);
      const er = numero(material.er, 5);

      if (datos.magnitud === 'dielectricoTension') {
        pasos.push(`Antes del dieléctrico, el condensador en vacío está a la tensión de la batería: V = ${numero(datos.tension)} V.`);
        if (datos.modoBateria === 'conectada') {
          pasos.push('La batería sigue conectada y fija la tensión: entra carga desde ella, pero V no cambia.');
        } else {
          pasos.push(
            `La batería se desconectó antes: la carga no tiene a dónde ir y Q se conserva. La capacidad se multiplica por εr = ${er}, así que V′ = Q/C′ = V/εr = ${numero(datos.tension)} / ${er}.`,
          );
        }
        valor = final.tension;
        pasos.push(`V′ = ${numero(valor, 4)} V.`);
        pasos.push(
          `Con la regla del otro modo (batería ${otroModo}) saldría ${numero(alReves.tension, 2)} V: lo primero es subrayar si la batería sigue conectada.`,
        );
        break;
      }

      pasos.push(pasoPlacas(datos.areaCm2, datos.separacionMm, area, separacion));
      const vacio = dielectricoDe('vacio');
      if (!vacio) return fallo('Falta el vacío en la lista del simulador.', pasos);
      pasos.push(pasoCapacidad(vacio, area, separacion, enVacio.capacidad));
      const u0 = enVacio.energia / 1e-9;
      pasos.push(
        `En vacío: U = ½·C·V² = ½ · ${cientifico(enVacio.capacidad)} · ${numero(datos.tension)}² = ${cientifico(enVacio.energia)} J = ${numero(u0, 4)} nJ.`,
      );
      valor = final.energia / 1e-9;
      if (datos.modoBateria === 'conectada') {
        pasos.push(
          `La batería sigue conectada: V no cambia y C′ = εr·C, así que U′ = ½·C′·V² = εr·U = ${er} · ${numero(u0, 4)} = ${numero(valor, 4)} nJ. La energía SUBE: la aporta la batería.`,
        );
      } else {
        pasos.push(
          `La batería se desconectó: Q se conserva y C′ = εr·C, así que U′ = Q²/(2·C′) = U/εr = ${numero(u0, 4)} / ${er} = ${numero(valor, 4)} nJ. La energía BAJA: la diferencia es el trabajo con el que el campo mete el dieléctrico.`,
        );
      }
      pasos.push(`Con la regla del otro modo (batería ${otroModo}) saldría ${numero(alReves.energia / 1e-9, 2)} nJ.`);
      break;
    }

    /* ── El circuito RC ─────────────────────────────────────────────────── */
    case 'tau':
    case 'tensionRC':
    case 'corrienteRC':
    case 'tiempoParaTension': {
      if (!positivo(datos.resistenciaKOhm)) return falta('la resistencia', pasos);
      if (!positivo(datos.capacidadMicroF)) return falta('la capacidad', pasos);
      const R = datos.resistenciaKOhm * 1e3;
      const C = datos.capacidadMicroF * 1e-6;
      const tau = constanteTiempo(R, C);
      if (tau === null) return fallo('Con esos datos no hay constante de tiempo.', pasos);
      pasos.push(
        `Pasa al SI: R = ${numero(datos.resistenciaKOhm)} kΩ = ${numero(R, 2)} Ω y C = ${numero(datos.capacidadMicroF)} µF = ${cientifico(C)} F.`,
      );
      pasos.push(`τ = R·C = ${numero(R, 2)} · ${cientifico(C)} = ${numero(tau, 6)} s.`);

      if (datos.magnitud === 'tau') {
        valor = datos.unidadTiempo === 's' ? tau : tau / 1e-3;
        if (datos.unidadTiempo !== 's') pasos.push(`En milisegundos: τ = ${numero(valor, 4)} ms.`);
        pasos.push(
          `Atajo útil: kΩ·µF = ms, así que ${numero(datos.resistenciaKOhm)} · ${numero(datos.capacidadMicroF)} = ${numero(tau / 1e-3, 4)} ms. Con R/C saldría ${cientifico(R / C, 2)}, que ni siquiera son segundos.`,
        );
        break;
      }

      if (!positivo(datos.tension)) return falta('la tensión de la fuente', pasos);
      const modo: ModoRC = datos.modoRC === 'descarga' ? 'descarga' : 'carga';

      if (datos.magnitud === 'tiempoParaTension') {
        const objetivo = datos.tensionObjetivo;
        if (!positivo(objetivo) || objetivo >= datos.tension) {
          return fallo('La tensión buscada tiene que estar entre 0 y la de la fuente.', pasos);
        }
        const p = objetivo / datos.tension;
        const t = modo === 'carga' ? -tau * Math.log(1 - p) : -tau * Math.log(p);
        if (modo === 'carga') {
          pasos.push(
            `Al cargar, V_C = V·(1 − e^(−t/τ)). Se despeja: e^(−t/τ) = 1 − V_C/V = 1 − ${numero(objetivo)}/${numero(datos.tension)} = ${numero(1 - p, 4)}.`,
          );
          pasos.push(`Tomando logaritmos: t = −τ·ln(1 − V_C/V) = −${numero(tau, 6)} · ln(${numero(1 - p, 4)}) = ${numero(t, 4)} s.`);
        } else {
          pasos.push(
            `Al descargar, V_C = V·e^(−t/τ). Se despeja: e^(−t/τ) = V_C/V = ${numero(objetivo)}/${numero(datos.tension)} = ${numero(p, 4)}.`,
          );
          pasos.push(`Tomando logaritmos: t = −τ·ln(V_C/V) = −${numero(tau, 6)} · ln(${numero(p, 4)}) = ${numero(t, 4)} s.`);
        }
        const comprobacion = estadoRC(modo, datos.tension, R, C, t);
        if (!comprobacion || Math.abs(comprobacion.tensionCondensador - objetivo) > HOLGURA_INVERSION * objetivo) {
          return fallo('El instante despejado no reproduce la tensión.', pasos);
        }
        valor = t;
        pasos.push(
          `Comprobación: en t = ${numero(t, 4)} s, V_C = ${numero(comprobacion.tensionCondensador, 4)} V. Es ${numero(t / tau, 4)}τ: ni τ ni una regla de tres.`,
        );
        break;
      }

      if (!noNegativo(datos.tiempo)) return falta('el instante', pasos);
      const estado = estadoRC(modo, datos.tension, R, C, datos.tiempo);
      const otro = estadoRC(modo === 'carga' ? 'descarga' : 'carga', datos.tension, R, C, datos.tiempo);
      if (!estado || !otro) return fallo('Con esos datos no se puede calcular el circuito.', pasos);
      const decaimiento = modo === 'carga' ? 1 - estado.fraccionCarga : estado.fraccionCarga;
      pasos.push(
        `t/τ = ${numero(datos.tiempo, 6)} / ${numero(tau, 6)} = ${numero(datos.tiempo / tau, 4)}, y e^(−t/τ) = ${numero(decaimiento, 4)}.`,
      );

      if (datos.magnitud === 'tensionRC') {
        valor = estado.tensionCondensador;
        if (modo === 'carga') {
          pasos.push(
            `Al cargar desde cero: V_C = V·(1 − e^(−t/τ)) = ${numero(datos.tension)} · (1 − ${numero(decaimiento, 4)}) = ${numero(valor, 4)} V.`,
          );
        } else {
          pasos.push(`Al descargar desde V: V_C = V·e^(−t/τ) = ${numero(datos.tension)} · ${numero(decaimiento, 4)} = ${numero(valor, 4)} V.`);
        }
        pasos.push(
          `Con la fórmula del otro proceso saldría ${numero(otro.tensionCondensador, 2)} V: la carga SUBE hacia V y la descarga BAJA hacia 0.`,
        );
        break;
      }

      // corrienteRC
      valor = estado.corriente / 1e-3;
      pasos.push(`Corriente inicial: I₀ = V/R = ${numero(datos.tension)} / ${numero(R, 2)} = ${numero(estado.corrienteInicial / 1e-3, 4)} mA.`);
      pasos.push(
        `La corriente decae igual al cargar que al descargar: I = I₀·e^(−t/τ) = ${numero(estado.corrienteInicial / 1e-3, 4)} · ${numero(decaimiento, 4)} = ${numero(valor, 4)} mA${modo === 'descarga' ? ' (en la descarga circula al revés; se pide el módulo)' : ''}.`,
      );
      pasos.push(
        `Con 1 − e^(−t/τ) saldría ${numero((estado.corrienteInicial * (1 - decaimiento)) / 1e-3, 2)} mA: esa forma es la de la tensión al cargar, no la de la corriente.`,
      );
      break;
    }

    default:
      return fallo('Magnitud desconocida.', pasos);
  }

  if (!Number.isFinite(valor)) {
    return fallo('El resultado no es un número finito.', pasos);
  }

  // El convenio de ε₀: se enseña que el valor de clase da la misma cifra redondeada.
  if (dependeDeEpsilon(datos.magnitud)) {
    const aula = conEpsilonAula(valor);
    const mismo = redondear(aula, decimales) === redondear(valor, decimales);
    pasos.push(
      mismo
        ? `Con ε₀ = 8,85·10⁻¹² F/m, el valor de clase, sale ${numero(aula, 4)} ${unidadDe(datos)}: redondeado ${textoRedondeo(decimales)}, la misma cifra.`
        : `Con ε₀ = 8,85·10⁻¹² F/m sale ${numero(aula, 4)} ${unidadDe(datos)}, que redondeado ${textoRedondeo(decimales)} da otra cifra: con estos datos el valor de ε₀ importa.`,
    );
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

/**
 * ¿Da lo mismo resolver con ε₀ = 8,85·10⁻¹² F/m que con el valor CODATA del simulador? Exige la
 * misma cifra redondeada y que ninguno de los dos valores quede a menos de `MARGEN_FRONTERA`
 * unidades de una frontera de redondeo. Si la respuesta no depende de ε₀, siempre es true.
 */
export function coincideConEpsilonAula(datos: DatosCaso): boolean {
  const r = resolverCaso(datos);
  if (!r.ok) return false;
  if (!dependeDeEpsilon(datos.magnitud)) return true;
  const decimales = datos.decimales ?? 2;
  const aula = conEpsilonAula(r.valor);
  return (
    redondear(aula, decimales) === redondear(r.valor, decimales) &&
    lejosDeLaFrontera(r.valor, decimales) &&
    lejosDeLaFrontera(aula, decimales)
  );
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * La tolerancia de un caso la da la PREGUNTA, no el tamaño de la cifra (hallazgo 2626,
 * 02/10/2026). Los datos son exactos (nada se lee de una tabla ni de una gráfica), así que solo
 * queda el redondeo:
 *
 *   · si la cifra exacta tiene más decimales de los que se piden, media unidad del último
 *     decimal pedido: entra todo lo que redondea a la clave, también la cifra calculada con
 *     ε₀ = 8,85·10⁻¹² F/m, que por construcción redondea a lo mismo;
 *   · si la cifra es exacta, no hay redondeo que tolerar: solo vale ella (E = 60 kV/m,
 *     V′ = 20 V, τ = 484 ms).
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
   * respuesta exacta (tolerancia 0) es lo único que separa 20 de 20,000000000000004.
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
   * Qué poner en los controles para ver la cifra en el panel. Solo donde es VERDAD con los
   * controles actuales, y con el formato exacto con el que la vista imprime cada tarjeta
   * (`conPrefijo`: 3 decimales por debajo de 10, 2 por debajo de 100 y 1 por encima).
   */
  comoComprobar?: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el canal aula es sobre todo de fuera de España. Los aparatos
 * (flash, tecla capacitiva, LED intermitente, temporizador) son solo el contexto: las cifras son
 * las del problema, no datos técnicos de ningún aparato real.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'La capacidad de un condensador plano',
    enunciado:
      'Un condensador de placas paralelas tiene placas de 40 cm² separadas 1,5 mm, con vacío entre ellas. Toma ε₀ = 8,85·10⁻¹² F/m. ¿Cuál es su capacidad, en picofaradios? Redondea a una décima.',
    categoria: 'abstracto',
    // C = ε₀·0,004/0,0015 = 23,6112 pF (con 8,85·10⁻¹²: 23,6000) → 23,6. Errores: sin pasar cm² a
    // m², 236.112 pF; sin pasar mm a m, 0,0236 pF (→ 0,0); A·d/ε₀ o d/A, cifras absurdas.
    datos: { magnitud: 'capacidad', areaCm2: 40, separacionMm: 1.5, dielectrico: 'vacio', decimales: 1 },
    etiquetaRespuesta: 'C en pF',
    pista: 'Pasa primero el área a m² (÷ 10.000) y la separación a m (÷ 1.000). Después, C = ε₀·εr·A/d, con εr = 1 en vacío.',
    comoComprobar:
      'Elige el dieléctrico «Vacío» y pon Área de cada placa = 40 cm² y Separación entre placas = 1,5 mm (la tensión da igual): la tarjeta «Capacidad C» marca 23,61 pF.',
  },
  {
    id: 2,
    titulo: 'Placas separadas por papel',
    enunciado:
      'En el laboratorio se monta un condensador con dos placas metálicas de 100 cm² separadas por varias hojas de papel apiladas, de 0,5 mm en total, que llenan todo el hueco (εr = 3,7). Se conecta a una batería de 12 V. Toma ε₀ = 8,85·10⁻¹² F/m. ¿Qué carga adquiere la placa positiva, en nanoculombios? Redondea a dos decimales.',
    categoria: 'aplicado',
    // C = 3,7·ε₀·0,01/0,0005 = 655,21 pF; Q = 12·C = 7,8625 nC (con 8,85·10⁻¹²: 7,8588) → 7,86.
    // Errores: sin εr, 2,12; dividiendo por εr, 0,57; d en mm, 0,0079 (→ 0,01); A en cm², 78.625.
    datos: { magnitud: 'carga', areaCm2: 100, separacionMm: 0.5, tension: 12, dielectrico: 'papel' },
    etiquetaRespuesta: 'Q en nC',
    pista: 'Calcula la capacidad con el papel (C = ε₀·εr·A/d, todo en el SI) y después Q = C·V. 1 nC = 10⁻⁹ C.',
    comoComprobar:
      'Deja el dieléctrico «Papel» y pon Área de cada placa = 100 cm², Separación entre placas = 0,5 mm y Tensión de la batería = 12 V: la tarjeta «Carga Q = C·V» marca 7,863 nC.',
  },
  {
    id: 3,
    titulo: 'El campo entre las placas',
    enunciado:
      'Las placas de un condensador, de 200 cm² cada una, están separadas 2,5 mm y conectadas a una batería de 150 V. ¿Cuánto vale el campo eléctrico entre ellas, en kV/m?',
    categoria: 'abstracto',
    // E = 150/0,0025 = 60.000 V/m = 60 kV/m exactos. Errores: d en mm, 60 V/m (0,06 kV/m);
    // responder en V/m, 60.000; E = V/A, 7.500 V/m (7,5 kV/m); E = V·d, 0,375.
    datos: { magnitud: 'campo', areaCm2: 200, separacionMm: 2.5, tension: 150, dielectrico: 'vacio', decimales: 0 },
    etiquetaRespuesta: 'E en kV/m',
    pista: 'Entre placas planas el campo es uniforme: E = V/d, con d en metros. El área no interviene. 1 kV/m = 1.000 V/m.',
    comoComprobar:
      'Pon Separación entre placas = 2,5 mm y Tensión de la batería = 150 V (el área y el dieléctrico dan igual): la tarjeta «Campo E = V/d» marca 60.000 V/m, que son 60 kV/m.',
  },
  {
    id: 4,
    titulo: 'La energía almacenada',
    enunciado:
      'Un condensador de placas paralelas en vacío tiene placas de 50 cm² separadas 2,5 mm y está cargado a 24 V. Toma ε₀ = 8,85·10⁻¹² F/m. ¿Qué energía almacena, en nanojulios? Redondea a dos decimales.',
    categoria: 'abstracto',
    // C = 17,708 pF; U = ½·C·24² = 5,1000 nJ (con 8,85·10⁻¹²: 5,0976) → 5,10. Errores: sin el ½,
    // 10,20; U = ½·C·V (sin elevar), 0,21; Q·V, 10,20; d en mm, 0,0051 (→ 0,01).
    datos: { magnitud: 'energia', areaCm2: 50, separacionMm: 2.5, tension: 24, dielectrico: 'vacio' },
    etiquetaRespuesta: 'U en nJ',
    pista: 'Primero C = ε₀·A/d en el SI. Después U = ½·C·V²: no olvides el ½ ni elevar V al cuadrado.',
    comoComprobar:
      'Elige el dieléctrico «Vacío» y pon Área de cada placa = 50 cm², Separación entre placas = 2,5 mm y Tensión de la batería = 24 V: la tarjeta «Energía U = ½·C·V²» marca 5,100 nJ.',
  },
  {
    id: 5,
    titulo: 'La separación de una tecla capacitiva',
    enunciado:
      'Una tecla capacitiva se modela como un condensador de placas paralelas de 1 cm² con aire entre ellas (εr = 1,00059). ¿A qué separación tienen que estar las placas para que la capacidad sea de 0,5 pF? Toma ε₀ = 8,85·10⁻¹² F/m y da el resultado en milímetros, redondeado a dos decimales.',
    categoria: 'aplicado',
    // d = ε₀·εr·A/C = 1,7719 mm (con 8,85·10⁻¹²: 1,7710; con εr = 1, 1,7708) → 1,77. Errores: A en
    // cm², 17.719 mm; respuesta en m, 0,00; C sin pasar a F, cifras de 10⁻¹²; d = C·A/ε₀, absurda.
    datos: { magnitud: 'separacionParaCapacidad', areaCm2: 1, capacidadObjetivoPf: 0.5, dielectrico: 'aire' },
    etiquetaRespuesta: 'd en mm',
    pista: 'Despeja d de C = ε₀·εr·A/d: d = ε₀·εr·A/C. Pasa A a m² y C a faradios (1 pF = 10⁻¹² F); saldrá d en metros.',
    comoComprobar:
      'Elige el dieléctrico «Aire (seco)» y pon Área de cada placa = 1 cm² y en Separación entre placas tu resultado: con 1,77 mm la tarjeta «Capacidad C» marca 500,5 fF, que son 0,5005 pF (1 fF = 0,001 pF).',
  },
  {
    id: 6,
    titulo: 'Vidrio con la batería conectada',
    enunciado:
      'Un condensador de placas de 50 cm² separadas 1,5 mm está en vacío y conectado a una batería de 12 V. Sin desconectar la batería, se llena el hueco con una lámina de vidrio Pyrex (εr = 5,6). Toma ε₀ = 8,85·10⁻¹² F/m. ¿Qué energía almacena el condensador al final, en nanojulios? Redondea a una décima.',
    categoria: 'aplicado',
    // U₀ = 2,1250 nJ; conectada, U′ = 5,6·U₀ = 11,900 nJ (con 8,85·10⁻¹²: 11,894) → 11,9. Errores:
    // modo desconectado, U₀/5,6 = 0,38 (→ 0,4); sin el dieléctrico, 2,1; sin el ½, 23,8.
    datos: {
      magnitud: 'dielectricoEnergia',
      areaCm2: 50,
      separacionMm: 1.5,
      tension: 12,
      dielectrico: 'pyrex',
      modoBateria: 'conectada',
      decimales: 1,
    },
    etiquetaRespuesta: 'U final en nJ',
    pista: 'Con la batería conectada la tensión no cambia y C se multiplica por εr: la energía ½·C·V² también se multiplica por εr.',
    comoComprobar:
      'Pon Área de cada placa = 50 cm², Separación entre placas = 1,5 mm, Tensión de la batería = 12 V, elige «Vidrio Pyrex» y pulsa «Batería conectada (V fija)»: en la tabla del experimento, la fila «Energía U» pasa de 2,125 nJ en vacío a 11,90 nJ con dieléctrico (× 5,60).',
  },
  {
    id: 7,
    titulo: 'Papel con la batería desconectada',
    enunciado:
      'Un condensador de placas paralelas en vacío, con placas de 80 cm² separadas 2 mm, se carga con una batería de 74 V y después se desconecta de ella. A continuación se llena el hueco con papel (εr = 3,7). ¿Qué tensión hay entre las placas al final, en voltios?',
    categoria: 'abstracto',
    // Desconectada: Q fija, V′ = V/εr = 74/3,7 = 20 V exactos (no depende de ε₀ ni de A ni de d).
    // Errores: modo conectado, 74; multiplicar por εr, 273,8.
    datos: {
      magnitud: 'dielectricoTension',
      areaCm2: 80,
      separacionMm: 2,
      tension: 74,
      dielectrico: 'papel',
      modoBateria: 'desconectada',
      decimales: 0,
    },
    etiquetaRespuesta: 'V final en V',
    pista: 'Sin batería, la carga no tiene a dónde ir: Q se conserva. Si C se multiplica por εr, ¿qué le pasa a V = Q/C?',
    comoComprobar:
      'Pon Área de cada placa = 80 cm², Separación entre placas = 2 mm, Tensión de la batería = 74 V, elige «Papel» y pulsa «Batería desconectada (Q fija)»: en la tabla del experimento, la fila «Tensión V» pasa de 74,00 V a 20,00 V (÷ 3,70).',
  },
  {
    id: 8,
    titulo: 'Teflón con la batería desconectada',
    enunciado:
      'Un condensador de placas de 50 cm² separadas 1 mm, en vacío, se carga a 24 V y se desconecta de la batería. Después se llena el hueco con teflón (εr = 2,1). Toma ε₀ = 8,85·10⁻¹² F/m. ¿Qué energía almacena al final, en nanojulios? Redondea a dos decimales.',
    categoria: 'abstracto',
    // U₀ = 12,750 nJ; desconectada, U′ = U₀/2,1 = 6,0714 nJ (con 8,85·10⁻¹²: 6,0686) → 6,07.
    // Errores: modo conectado, 2,1·U₀ = 26,78; sin cambio, 12,75; dividir por εr², 2,89.
    datos: {
      magnitud: 'dielectricoEnergia',
      areaCm2: 50,
      separacionMm: 1,
      tension: 24,
      dielectrico: 'teflon',
      modoBateria: 'desconectada',
    },
    etiquetaRespuesta: 'U final en nJ',
    pista: 'Aislado, Q no cambia: usa U = Q²/(2C). Si C se multiplica por εr, la energía se divide por εr.',
    comoComprobar:
      'Pon Área de cada placa = 50 cm², Separación entre placas = 1 mm, Tensión de la batería = 24 V, elige «Teflón» y pulsa «Batería desconectada (Q fija)»: en la tabla del experimento, la fila «Energía U» pasa de 12,75 nJ a 6,071 nJ (÷ 2,10).',
  },
  {
    id: 9,
    titulo: 'El ritmo de un LED intermitente',
    enunciado:
      'En un circuito que hace parpadear un LED, el ritmo lo marca un condensador de 2,2 µF que se carga a través de una resistencia de 220 kΩ. ¿Cuánto vale la constante de tiempo τ del circuito, en milisegundos?',
    categoria: 'aplicado',
    // τ = 220.000·2,2·10⁻⁶ = 0,484 s = 484 ms exactos. Errores: τ = R/C, 1·10¹¹; C/R, 1·10⁻¹¹;
    // dar los segundos en la casilla de ms, 0,484.
    datos: { magnitud: 'tau', resistenciaKOhm: 220, capacidadMicroF: 2.2, decimales: 0 },
    etiquetaRespuesta: 'τ en ms',
    pista: 'τ = R·C con R en ohmios y C en faradios sale en segundos. Atajo: kΩ por µF da milisegundos.',
    comoComprobar:
      'Pulsa «Teclear C en µF» y pon Capacidad C = 2,2 µF y Resistencia R = 220 kΩ: la tarjeta «Constante de tiempo τ = R·C» marca 484,0 ms.',
  },
  {
    id: 10,
    titulo: 'La carga del flash',
    enunciado:
      'El flash de una cámara guarda su energía en un condensador. En un modelo de laboratorio de la carga, una fuente de 9 V carga un condensador de 10 µF, inicialmente descargado, a través de una resistencia de 47 kΩ. ¿Qué tensión tiene el condensador 0,94 s después de conectarlo? Da el resultado en voltios, redondeado a dos decimales.',
    categoria: 'aplicado',
    // τ = 0,47 s, t = 2τ: V_C = 9·(1 − e⁻²) = 7,7820 → 7,78. Errores: e^(−t/τ) en vez de
    // 1 − e^(−t/τ), 1,22; τ = R/C (4,7·10⁹ s), 0,00; suponer t = τ, 5,69.
    datos: { magnitud: 'tensionRC', tension: 9, resistenciaKOhm: 47, capacidadMicroF: 10, modoRC: 'carga', tiempo: 0.94 },
    etiquetaRespuesta: 'V_C en V',
    pista: 'Calcula τ = R·C y cuántas τ son 0,94 s. Al cargar desde cero, V_C = V·(1 − e^(−t/τ)).',
    comoComprobar:
      'Pon Tensión de la batería = 9 V (en la parte 1), pulsa «Teclear C en µF», pon Capacidad C = 10 µF, Resistencia R = 47 kΩ, elige «Carga» y lleva el deslizador «Instante t» a 2,00τ (= 940,0 ms): la tarjeta «Tensión V_C(t)» marca 7,782 V.',
  },
  {
    id: 11,
    titulo: 'La corriente de descarga',
    enunciado:
      'Un condensador de 500 µF cargado a 12 V se descarga a través de una resistencia de 2 kΩ. ¿Qué intensidad circula 1,5 s después de cerrar el circuito? Da el resultado en miliamperios, redondeado a dos decimales.',
    categoria: 'abstracto',
    // τ = 1 s, I₀ = 6 mA, I = 6·e^(−1,5) = 1,3388 mA → 1,34. Errores: 1 − e^(−t/τ), 4,66; la
    // inicial, 6,00; R sin pasar a ohmios, 1.338,78 mA.
    datos: { magnitud: 'corrienteRC', tension: 12, resistenciaKOhm: 2, capacidadMicroF: 500, modoRC: 'descarga', tiempo: 1.5 },
    etiquetaRespuesta: 'I en mA',
    pista: 'La corriente empieza en I₀ = V/R y decae con la misma exponencial que la descarga: I = I₀·e^(−t/τ).',
    comoComprobar:
      'Pon Tensión de la batería = 12 V (en la parte 1), pulsa «Teclear C en µF», pon Capacidad C = 500 µF, Resistencia R = 2 kΩ, elige «Descarga» y lleva el deslizador «Instante t» a 1,50τ: la tarjeta «Corriente I(t), en sentido contrario a la carga» marca 1,339 mA.',
  },
  {
    id: 12,
    titulo: 'El temporizador que avisa a 8 V',
    enunciado:
      'Un temporizador enciende un aviso cuando la tensión de su condensador llega a 8 V. El condensador, de 22 µF e inicialmente descargado, se carga con una fuente de 12 V a través de una resistencia de 100 kΩ. ¿Cuántos segundos tarda en encenderse el aviso? Redondea a dos decimales.',
    categoria: 'aplicado',
    // τ = 2,2 s; t = −τ·ln(1 − 8/12) = 2,2·ln 3 = 2,4169 s → 2,42. Errores: −τ·ln(8/12) (la
    // forma de la descarga), 0,89; regla de tres t = (8/12)·τ, 1,47; responder τ, 2,20.
    datos: {
      magnitud: 'tiempoParaTension',
      tension: 12,
      tensionObjetivo: 8,
      resistenciaKOhm: 100,
      capacidadMicroF: 22,
      modoRC: 'carga',
    },
    etiquetaRespuesta: 't en s',
    pista: 'Escribe V_C = V·(1 − e^(−t/τ)) con V_C = 8 V, aísla la exponencial y toma logaritmo neperiano.',
    comoComprobar:
      'Pon Tensión de la batería = 12 V (en la parte 1), pulsa «Teclear C en µF», pon Capacidad C = 22 µF, Resistencia R = 100 kΩ y elige «Carga». Con el deslizador en 1,05τ (= 2,310 s) la tarjeta «Tensión V_C(t)» marca 7,801 V, y en 1,10τ (= 2,420 s), 8,006 V: los 8 V se cruzan entre los dos, muy cerca de 1,10τ.',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «7,86 nC». La unidad es lo que
 * va detrás de « en » en la etiqueta («U final en nJ» → «nJ»), así que no se imprime nunca un
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
 * Listas «amables». En el condensador, áreas y separaciones redondas; en el RC, R y C cuyo
 * producto es una τ limpia (0,1 s, 0,2 s, 0,5 s, 1 s, 2 s, 5 s, 10 s), así que t = n·τ se
 * escribe con pocas cifras. Solo materiales de `DIELECTRICOS` (sin el agua, que conduce).
 */
const AREAS_CM2 = [20, 25, 40, 50, 80, 100, 120, 150, 200] as const;
const SEPARACIONES_MM = [0.5, 1, 1.5, 2, 2.5] as const;
const TENSIONES_PLACAS = [6, 9, 12, 24, 50, 100] as const;
const MATERIALES = ['vacio', 'teflon', 'papel', 'pyrex'] as const;
const RESISTENCIAS_KOHM = [10, 20, 50, 100] as const;
const CAPACIDADES_MICROF = [10, 20, 50, 100] as const;
const RESISTENCIAS_TAU_KOHM = [10, 22, 47, 100, 220, 470] as const;
const CAPACIDADES_TAU_MICROF = [1, 2.2, 4.7, 10, 22, 47] as const;
const TENSIONES_RC = [5, 6, 9, 12, 24] as const;
const MULTIPLOS_TAU = [0.5, 1, 1.5, 2, 3] as const;
const MODOS_RC: readonly ModoRC[] = ['carga', 'descarga'];
const PREGUNTAS = ['capacidad', 'carga', 'energia', 'tau', 'tensionRC'] as const;
type Pregunta = (typeof PREGUNTAS)[number];

/**
 * Respuesta mínima: por debajo de 0,5 en la unidad pedida quedan una o dos cifras
 * significativas, poco para comprobar nada. Y por encima de 1.000 el prefijo ya no es el natural.
 */
const RESPUESTA_MINIMA = 0.5;
const RESPUESTA_MAXIMA = 1000;
const MAX_INTENTOS = 80;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/** Decimales para que la respuesta tenga tres cifras significativas: 7,86 · 23,6 · 655. */
function decimalesParaTresCifras(valor: number): number {
  const v = Math.abs(valor);
  if (v < 10) return 2;
  if (v < 100) return 1;
  return 0;
}

const ETIQUETAS: Record<Exclude<Pregunta, 'tau'>, string> = {
  capacidad: 'C en pF',
  carga: 'Q en nC',
  energia: 'U en nJ',
  tensionRC: 'V_C en V',
};

function etiquetaDe(pregunta: Pregunta, datos: DatosCaso): string {
  if (pregunta === 'tau') return `τ en ${datos.unidadTiempo === 's' ? 's' : 'ms'}`;
  return ETIQUETAS[pregunta];
}

function nombreMaterial(id: string | undefined): string {
  const material = dielectricoDe(id);
  if (!material || material.id === 'vacio') return 'vacío';
  return `${minusculaInicial(material.nombre)} (εr = ${numero(material.er, 5)})`;
}

function enunciadoPractica(pregunta: Pregunta, d: DatosCaso): string {
  const redondeo = `Redondea ${textoRedondeo(d.decimales ?? 2)}.`;
  const epsilon = 'Toma ε₀ = 8,85·10⁻¹² F/m.';
  const placas = `Un condensador de placas paralelas tiene placas de ${numero(d.areaCm2 ?? NaN)} cm² separadas ${numero(d.separacionMm ?? NaN)} mm, con ${nombreMaterial(d.dielectrico)} entre ellas`;
  switch (pregunta) {
    case 'capacidad':
      return `${placas}. ${epsilon} ¿Cuál es su capacidad, en picofaradios? ${redondeo}`;
    case 'carga':
      return `${placas}, y está conectado a una batería de ${numero(d.tension ?? NaN)} V. ${epsilon} ¿Qué carga tiene la placa positiva, en nanoculombios? ${redondeo}`;
    case 'energia':
      return `${placas}, y está cargado a ${numero(d.tension ?? NaN)} V. ${epsilon} ¿Qué energía almacena, en nanojulios? ${redondeo}`;
    case 'tau':
      return `Un condensador de ${numero(d.capacidadMicroF ?? NaN)} µF se carga a través de una resistencia de ${numero(d.resistenciaKOhm ?? NaN)} kΩ. ¿Cuánto vale la constante de tiempo τ, en ${d.unidadTiempo === 's' ? 'segundos' : 'milisegundos'}? ${redondeo}`;
    case 'tensionRC':
    default:
      return d.modoRC === 'descarga'
        ? `Un condensador de ${numero(d.capacidadMicroF ?? NaN)} µF cargado a ${numero(d.tension ?? NaN)} V se descarga a través de una resistencia de ${numero(d.resistenciaKOhm ?? NaN)} kΩ. ¿Qué tensión le queda ${numero(d.tiempo ?? NaN, 4)} s después de cerrar el circuito, en voltios? ${redondeo}`
        : `Una fuente de ${numero(d.tension ?? NaN)} V carga un condensador de ${numero(d.capacidadMicroF ?? NaN)} µF, inicialmente descargado, a través de una resistencia de ${numero(d.resistenciaKOhm ?? NaN)} kΩ. ¿Qué tensión tiene el condensador ${numero(d.tiempo ?? NaN, 4)} s después de conectarlo, en voltios? ${redondeo}`;
  }
}

/** Datos de reserva, que cumplen todo para cada pregunta (los de los casos 1, 2, 4, 9 y 10). */
function datosDeReserva(pregunta: Pregunta): DatosCaso {
  switch (pregunta) {
    case 'capacidad':
      return { magnitud: 'capacidad', areaCm2: 40, separacionMm: 1.5, dielectrico: 'vacio', decimales: 1 };
    case 'carga':
      return { magnitud: 'carga', areaCm2: 100, separacionMm: 0.5, tension: 12, dielectrico: 'papel', decimales: 2 };
    case 'energia':
      return { magnitud: 'energia', areaCm2: 50, separacionMm: 2.5, tension: 24, dielectrico: 'vacio', decimales: 2 };
    case 'tau':
      return { magnitud: 'tau', resistenciaKOhm: 220, capacidadMicroF: 2.2, unidadTiempo: 'ms', decimales: 1 };
    case 'tensionRC':
    default:
      return { magnitud: 'tensionRC', tension: 9, resistenciaKOhm: 47, capacidadMicroF: 10, modoRC: 'carga', tiempo: 0.94, decimales: 2 };
  }
}

/** ¿Sirven estos datos? Respuesta resoluble, en rango y, si usa ε₀, igual con 8,85·10⁻¹². */
function sirve(datos: DatosCaso): boolean {
  const r = resolverCaso(datos);
  return r.ok && r.valor >= RESPUESTA_MINIMA && r.valor < RESPUESTA_MAXIMA && coincideConEpsilonAula(datos);
}

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos, y por tanto el mismo
 * motor que el panel: si divergieran, el alumno entrenaría con una regla y sería corregido con
 * otra. Las preguntas con ε₀ (C, Q, U) solo salen con datos en los que 8,85·10⁻¹² y el valor
 * CODATA dan la misma cifra redondeada (`coincideConEpsilonAula`); si no, se vuelve a tirar.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);

  const tirar = (): DatosCaso => {
    if (pregunta === 'capacidad' || pregunta === 'carga' || pregunta === 'energia') {
      const base: DatosCaso = {
        magnitud: pregunta,
        areaCm2: elegir(AREAS_CM2, rnd),
        separacionMm: elegir(SEPARACIONES_MM, rnd),
        dielectrico: elegir(MATERIALES, rnd),
        tension: pregunta === 'capacidad' ? undefined : elegir(TENSIONES_PLACAS, rnd),
      };
      // Los decimales se eligen para tres cifras significativas, mirando la cifra del motor.
      const r = resolverCaso({ ...base, decimales: 2 });
      return { ...base, decimales: r.ok ? decimalesParaTresCifras(r.valor) : 2 };
    }
    if (pregunta === 'tau') {
      const resistenciaKOhm = elegir(RESISTENCIAS_TAU_KOHM, rnd);
      const capacidadMicroF = elegir(CAPACIDADES_TAU_MICROF, rnd);
      const enSegundos = resistenciaKOhm * capacidadMicroF >= 1000;
      return {
        magnitud: 'tau',
        resistenciaKOhm,
        capacidadMicroF,
        unidadTiempo: enSegundos ? 's' : 'ms',
        decimales: enSegundos ? 2 : 1,
      };
    }
    const resistenciaKOhm = elegir(RESISTENCIAS_KOHM, rnd);
    const capacidadMicroF = elegir(CAPACIDADES_MICROF, rnd);
    const tau = constanteTiempo(resistenciaKOhm * 1e3, capacidadMicroF * 1e-6) ?? 1;
    return {
      magnitud: 'tensionRC',
      tension: elegir(TENSIONES_RC, rnd),
      resistenciaKOhm,
      capacidadMicroF,
      modoRC: elegir(MODOS_RC, rnd),
      // Redondeado al milisegundo: 1,5·0,2 no es exactamente 0,3 en coma flotante.
      tiempo: Math.round(elegir(MULTIPLOS_TAU, rnd) * tau * 1000) / 1000,
      decimales: 2,
    };
  };

  let datos = tirar();
  let intentos = 0;
  while (!sirve(datos) && intentos < MAX_INTENTOS) {
    datos = tirar();
    intentos += 1;
  }
  if (!sirve(datos)) datos = datosDeReserva(pregunta);
  const r = resolverCaso(datos);

  return {
    enunciado: enunciadoPractica(pregunta, datos),
    datos,
    respuesta: r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN,
    etiquetaRespuesta: etiquetaDe(pregunta, datos),
    pasos: r.pasos,
  };
}
