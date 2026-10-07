/**
 * Casos para clase — la tarea asignable de `simulador-modelo-bohr`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Las respuestas se calculan con `./motor.ts`, el MISMO módulo con el que el diagrama, las
 * tarjetas y la tabla de la serie pintan sus cifras: `energiaNivel`, `calcularTransicion`,
 * `energiaIonizacionDesde` y `radioOrbitaNm`. Las dos inversiones (de qué nivel sale una línea,
 * a qué nivel sube un electrón) no despejan nada: prueban los niveles con `calcularTransicion` y
 * se quedan con el que reproduce el dato.
 *
 * ── EL CONVENIO: DOS JUEGOS DE CONSTANTES ────────────────────────────────────
 *
 * ⚠️ El motor usa E_ion = 13,598 eV y R_H = 1,09678·10⁷ m⁻¹ (masa reducida, CODATA 2018); el
 *    libro de texto, 13,6 eV y R = 1,097·10⁷ m⁻¹, con c = 3,00·10⁸ m/s, e = 1,602·10⁻¹⁹ C y
 *    a₀ = 0,0529 nm. Difieren en la cuarta cifra (Hα: 656,47 frente a 656,34 nm).
 *
 *    Es la técnica de los cuartiles de calculadora-estadistica: cada caso pide un redondeo en el
 *    que LAS DOS cuentas dan la misma cifra, y el enunciado declara las constantes de libro. Así
 *    un alumno que resuelve con el libro no puede acertar el método y fallar el caso. El spec lo
 *    comprueba con fórmulas de libro PROPIAS, no con las de este módulo. Por eso la longitud de
 *    onda de Paschen α (1875,6 frente a 1875,2 nm, que redondean distinto a unidades) no es un
 *    caso: se pregunta la de 5 → 3 (1282,2 frente a 1281,9: 1282 las dos).
 *
 *    Las constantes de libro viven aquí (`LIBRO`) solo para DOS cosas: escribir en la solución
 *    la cuenta que hace el alumno y descartar del modo práctica los saltos en los que las dos
 *    cuentas redondearían distinto. La respuesta es siempre la del motor.
 *
 * ⚠️ Las energías de los niveles son NEGATIVAS (el cero es el electrón libre). Quien escribe la
 *    cifra sin el signo recibe un aviso propio, no un «incorrecto» a secas.
 * ⚠️ Las longitudes de onda son en el vacío, que es lo que da la ecuación de Rydberg.
 */

import { formatNumber } from '@/lib';
import {
  NIVEL_MAXIMO,
  energiaNivel,
  calcularTransicion,
  energiaIonizacionDesde,
  radioOrbitaNm,
} from './motor';

/** Las constantes del libro de texto, las que declaran los enunciados. */
export const LIBRO = {
  energiaIonizacion: 13.6,
  rydberg: 1.097e7,
  velocidadLuz: 3.0e8,
  cargaElemental: 1.602e-19,
  radioBohrNm: 0.0529,
} as const;

/** Error relativo máximo con el que una inversión acepta un nivel: la línea tiene que estar ahí. */
const HOLGURA_NIVEL = 0.01;

/** Hasta qué nivel se buscan las inversiones. */
const NIVEL_BUSQUEDA = 20;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** Eₙ, en eV (negativa). */
  | 'energiaNivel'
  /** |ΔE| del salto, en eV. */
  | 'energiaFoton'
  /** |ΔE| del salto, en unidades de 10⁻¹⁹ J. */
  | 'energiaFotonJulios'
  /** λ del salto, en nm. */
  | 'longitudOnda'
  /** f = c/λ del salto, en unidades de 10¹⁴ Hz. */
  | 'frecuencia'
  /** Energía para arrancar el electrón desde el nivel n, en eV. */
  | 'energiaIonizacion'
  /** rₙ = n²·a₀, en nm. */
  | 'radioOrbita'
  /** El nivel de partida de una línea de emisión de λ conocida que acaba en `nFinal`. */
  | 'nivelDesdeLongitud'
  /** El nivel al que sube un electrón que parte de `nInicial` y absorbe `energiaEV`. */
  | 'nivelDesdeEnergia';

export interface DatosCaso {
  magnitud: Magnitud;
  /** El nivel de las preguntas de un solo nivel. */
  n?: number;
  /** Los niveles de partida y llegada de un salto. */
  nInicial?: number;
  nFinal?: number;
  /** Longitud de onda medida, en nm (dato de una inversión). */
  lambdaNm?: number;
  /** Energía absorbida, en eV (dato de una inversión). */
  energiaEV?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  const texto = (Math.abs(n) + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
  return n < 0 ? `−${texto}` : texto;
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

export function exigeRedondeo(valor: number, decimales: number): boolean {
  if (!Number.isFinite(valor)) return false;
  return Math.abs(redondear(valor, decimales) - valor) > 1e-9 * Math.max(1, Math.abs(valor));
}

function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  return `a ${decimales} decimales`;
}

function fallo(error: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error };
}

function esNivelFinito(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 1;
}

/** «n = 3», «n = ∞». */
function nivel(n: number): string {
  return n === Infinity ? '∞' : String(n);
}

/** 1/n² − 1/m², con n < m y m = ∞ admitido. */
function factorSalto(nInferior: number, nSuperior: number): number {
  const inv = (k: number) => (k === Infinity ? 0 : 1 / (k * k));
  return inv(nInferior) - inv(nSuperior);
}

/** Unidad de cada magnitud, la que se escribe detrás de la cifra. */
export function unidadDeMagnitud(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'energiaNivel':
    case 'energiaFoton':
    case 'energiaIonizacion':
      return 'eV';
    case 'energiaFotonJulios':
      return '× 10⁻¹⁹ J';
    case 'longitudOnda':
    case 'radioOrbita':
      return 'nm';
    case 'frecuencia':
      return '× 10¹⁴ Hz';
    default:
      return '';
  }
}

/**
 * La cifra con su unidad: «−1,51 eV», «656 nm», «4,57 × 10¹⁴ Hz», o «n = 4» si se pregunta un
 * nivel. El signo menos es el tipográfico, como en el resto de la app.
 */
export function textoRespuesta(valor: number, magnitud: Magnitud, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  if (magnitud === 'nivelDesdeLongitud' || magnitud === 'nivelDesdeEnergia') return `n = ${valor}`;
  const cifra = formatNumber(Math.abs(valor), decimales);
  return `${valor < 0 ? '−' : ''}${cifra} ${unidadDeMagnitud(magnitud)}`;
}

/** Línea de la solución que compara el motor con la cuenta de libro. */
function pasoConvenio(motor: number, libro: number, decimales: number, magnitud: Magnitud): string {
  return `El simulador usa 13,598 eV y R_H = 1,09678·10⁷ m⁻¹, que corrigen el movimiento del núcleo: da ${numero(motor, 4)}; con los valores del libro sale ${numero(libro, 4)}. Las dos cuentas redondean ${textoRedondeo(decimales)} a ${textoRespuesta(redondear(motor, decimales), magnitud, decimales)}.`;
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca lanza.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  let valor: number;

  switch (datos.magnitud) {
    case 'energiaNivel': {
      if (!esNivelFinito(datos.n)) return fallo('Falta un nivel válido (entero desde 1).', pasos);
      const e = energiaNivel(datos.n);
      if (e === null) return fallo('El motor no puede calcular ese nivel.', pasos);
      const libro = -LIBRO.energiaIonizacion / (datos.n * datos.n);
      pasos.push(`Energía de un nivel del hidrógeno: Eₙ = −13,6/n² eV.`);
      pasos.push(`E${subindice(datos.n)} = −13,6/${datos.n}² = −13,6/${datos.n * datos.n} = ${numero(libro)} eV.`);
      pasos.push('Es negativa porque el cero es el electrón libre: ligado al núcleo tiene menos energía.');
      pasos.push(pasoConvenio(e, libro, decimales, datos.magnitud));
      valor = e;
      break;
    }

    case 'energiaIonizacion': {
      if (!esNivelFinito(datos.n)) return fallo('Falta un nivel válido (entero desde 1).', pasos);
      const e = energiaIonizacionDesde(datos.n);
      if (e === null) return fallo('El motor no puede calcular ese nivel.', pasos);
      const libro = LIBRO.energiaIonizacion / (datos.n * datos.n);
      pasos.push(`Ionizar es llevar el electrón del nivel ${datos.n} al ∞, donde la energía vale 0.`);
      pasos.push(`E_ion = 0 − E${subindice(datos.n)} = 13,6/${datos.n}² = ${numero(libro)} eV.`);
      pasos.push(pasoConvenio(e, libro, decimales, datos.magnitud));
      valor = e;
      break;
    }

    case 'radioOrbita': {
      if (!esNivelFinito(datos.n)) return fallo('Falta un nivel válido (entero desde 1).', pasos);
      const r = radioOrbitaNm(datos.n);
      if (r === null) return fallo('El motor no puede calcular ese nivel.', pasos);
      const libro = datos.n * datos.n * LIBRO.radioBohrNm;
      pasos.push(`El radio de las órbitas crece con el cuadrado del nivel: rₙ = n²·a₀, con a₀ = 0,0529 nm.`);
      pasos.push(`r${subindice(datos.n)} = ${datos.n}²·0,0529 = ${datos.n * datos.n}·0,0529 = ${numero(libro)} nm.`);
      pasos.push(`El simulador usa a₀ = 0,0529177 nm y da ${numero(r)} nm. Las dos redondean ${textoRedondeo(decimales)} a ${textoRespuesta(redondear(r, decimales), datos.magnitud, decimales)}.`);
      valor = r;
      break;
    }

    case 'energiaFoton':
    case 'energiaFotonJulios':
    case 'longitudOnda':
    case 'frecuencia': {
      const ni = datos.nInicial;
      const nf = datos.nFinal;
      if (ni === undefined || nf === undefined) return fallo('Faltan los dos niveles del salto.', pasos);
      const t = calcularTransicion(ni, nf);
      if (!t) return fallo('No hay salto entre esos niveles.', pasos);
      const factor = factorSalto(t.nInferior, t.nSuperior);
      const nInf = nivel(t.nInferior);
      const nSup = nivel(t.nSuperior);
      pasos.push(
        `El electrón ${t.sentido === 'emision' ? 'baja' : 'sube'} del nivel ${nivel(ni)} al ${nivel(nf)}: ${t.sentido === 'emision' ? 'emite' : 'absorbe'} un fotón${t.serie ? ` de la serie de ${t.serie}` : ''}.`,
      );
      if (datos.magnitud === 'longitudOnda') {
        const libro = 1e9 / (LIBRO.rydberg * factor);
        pasos.push(`Ecuación de Rydberg, con el nivel de abajo primero: 1/λ = R·(1/${nInf}² − 1/${nSup}²) = 1,097·10⁷·${numero(factor, 5)} = ${numero(LIBRO.rydberg * factor / 1e6, 4)}·10⁶ m⁻¹.`);
        pasos.push(`λ = 1/(${numero(LIBRO.rydberg * factor / 1e6, 4)}·10⁶) m = ${numero(libro, 2)} nm (1 nm = 10⁻⁹ m).`);
        pasos.push(pasoConvenio(t.lambdaNm, libro, decimales, datos.magnitud));
        valor = t.lambdaNm;
      } else if (datos.magnitud === 'frecuencia') {
        const libro = (LIBRO.velocidadLuz * LIBRO.rydberg * factor) / 1e14;
        pasos.push(`1/λ = R·(1/${nInf}² − 1/${nSup}²) = 1,097·10⁷·${numero(factor, 5)} m⁻¹, y f = c/λ = c·(1/λ).`);
        pasos.push(`f = 3,00·10⁸·1,097·10⁷·${numero(factor, 5)} = ${numero(libro, 4)}·10¹⁴ Hz.`);
        valor = t.frecuencia / 1e14;
        pasos.push(pasoConvenio(valor, libro, decimales, datos.magnitud));
      } else {
        const libroEV = LIBRO.energiaIonizacion * factor;
        pasos.push(`ΔE = |E${subindice(nf)} − E${subindice(ni)}| = 13,6·(1/${nInf}² − 1/${nSup}²) = 13,6·${numero(factor, 5)} = ${numero(libroEV)} eV.`);
        if (datos.magnitud === 'energiaFoton') {
          pasos.push(pasoConvenio(t.energiaFotonEV, libroEV, decimales, datos.magnitud));
          valor = t.energiaFotonEV;
        } else {
          const libroJ = (libroEV * LIBRO.cargaElemental) / 1e-19;
          pasos.push(`En julios, 1 eV = 1,602·10⁻¹⁹ J: ΔE = ${numero(libroEV)}·1,602·10⁻¹⁹ = ${numero(libroJ)}·10⁻¹⁹ J.`);
          valor = t.energiaFotonJ / 1e-19;
          pasos.push(pasoConvenio(valor, libroJ, decimales, datos.magnitud));
        }
      }
      break;
    }

    case 'nivelDesdeLongitud': {
      const nf = datos.nFinal;
      const lambda = datos.lambdaNm;
      if (!esNivelFinito(nf)) return fallo('Falta el nivel de llegada.', pasos);
      if (typeof lambda !== 'number' || !Number.isFinite(lambda) || lambda <= 0) return fallo('Falta la longitud de onda.', pasos);
      pasos.push(
        `De Rydberg: 1/λ = R·(1/${nf}² − 1/n²), así que 1/n² = 1/${nf}² − 1/(R·λ). Con λ = ${numero(lambda)} nm = ${numero(lambda, 2)}·10⁻⁹ m:`,
      );
      const inversoN2 = 1 / (nf * nf) - 1 / (LIBRO.rydberg * lambda * 1e-9);
      pasos.push(`1/n² = ${numero(1 / (nf * nf), 4)} − ${numero(1 / (LIBRO.rydberg * lambda * 1e-9), 4)} = ${numero(inversoN2, 4)}, y n = 1/√${numero(inversoN2, 4)} = ${numero(1 / Math.sqrt(inversoN2), 2)}.`);
      const n = buscarNivel((k) => calcularTransicion(k, nf)?.lambdaNm ?? NaN, lambda, nf);
      if (n === null) return fallo('Ninguna línea del hidrógeno que acabe en ese nivel tiene esa longitud de onda.', pasos);
      const t = calcularTransicion(n, nf);
      pasos.push(`Los niveles son enteros: n = ${n}. Comprobación: el salto ${n} → ${nf} da ${numero(t?.lambdaNm ?? NaN, 2)} nm.`);
      valor = n;
      break;
    }

    case 'nivelDesdeEnergia': {
      const ni = datos.nInicial;
      const e = datos.energiaEV;
      if (!esNivelFinito(ni)) return fallo('Falta el nivel de partida.', pasos);
      if (typeof e !== 'number' || !Number.isFinite(e) || e <= 0) return fallo('Falta la energía absorbida.', pasos);
      const eInicial = -LIBRO.energiaIonizacion / (ni * ni);
      pasos.push(`Partiendo de E${subindice(ni)} = ${numero(eInicial)} eV, al absorber ${numero(e)} eV el electrón queda en E = ${numero(eInicial)} + ${numero(e)} = ${numero(eInicial + e)} eV.`);
      pasos.push(`Despeja n de −13,6/n² = ${numero(eInicial + e)}: n² = 13,6/${numero(-(eInicial + e))} = ${numero(LIBRO.energiaIonizacion / -(eInicial + e), 2)}, y n ≈ ${numero(Math.sqrt(LIBRO.energiaIonizacion / -(eInicial + e)), 2)}.`);
      const n = buscarNivel((k) => calcularTransicion(ni, k)?.energiaFotonEV ?? NaN, e, ni);
      if (n === null) return fallo('Con esa energía el electrón no llega exactamente a ningún nivel: el fotón no se absorbe.', pasos);
      const t = calcularTransicion(ni, n);
      pasos.push(`Los niveles son enteros: n = ${n}. Comprobación: el salto ${ni} → ${n} absorbe ${numero(t?.energiaFotonEV ?? NaN, 3)} eV.`);
      valor = n;
      break;
    }

    default:
      return fallo('Magnitud desconocida.', pasos);
  }

  if (!Number.isFinite(valor)) return fallo('El resultado no es un número finito.', pasos);

  const redondeado = redondear(valor, decimales);
  pasos.push(
    exigeRedondeo(valor, decimales)
      ? `Redondeando ${textoRedondeo(decimales)}: ${textoRespuesta(redondeado, datos.magnitud, decimales)}.`
      : `Resultado: ${textoRespuesta(redondeado, datos.magnitud, decimales)}.`,
  );
  return { ok: true, valor, pasos };
}

/** E₃, r₂…: subíndice del nivel para escribir en la solución. */
function subindice(n: number): string {
  if (n === Infinity) return '∞';
  const digitos = '₀₁₂₃₄₅₆₇₈₉';
  return String(n)
    .split('')
    .map((c) => digitos[Number(c)] ?? c)
    .join('');
}

/**
 * El nivel k > `desde` cuya magnitud (calculada por el motor) se acerca al dato con error
 * relativo ≤ 1 %. null si ninguno lo hace o si dos lo hacen (la pregunta no sería inequívoca).
 */
function buscarNivel(magnitud: (k: number) => number, dato: number, desde: number): number | null {
  const candidatos: number[] = [];
  for (let k = desde + 1; k <= NIVEL_BUSQUEDA; k++) {
    const v = magnitud(k);
    if (Number.isFinite(v) && Math.abs(v - dato) <= HOLGURA_NIVEL * dato) candidatos.push(k);
  }
  return candidatos.length === 1 ? candidatos[0] : null;
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * La tolerancia la da la PREGUNTA: media unidad del último decimal pedido, siempre, porque con
 * dos juegos de constantes legítimos ninguna cifra es «exacta» (el caso se diseña para que los
 * dos redondeen igual). Un nivel es un entero: tolerancia 0.
 */
export function toleranciaDe(datos: DatosCaso): number {
  if (datos.magnitud === 'nivelDesdeLongitud' || datos.magnitud === 'nivelDesdeEnergia') return 0;
  return 10 ** -(datos.decimales ?? 2) / 2;
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
      motivo: 'Escribe un número (puedes usar la coma decimal y el signo menos).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const RUIDO_BINARIO = 1e-9;
  const diferencia = Math.abs(usuario - esperado);
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  // La cifra está bien pero sin el signo: el error más típico con los niveles.
  if (esperado < 0 && Math.abs(-usuario - esperado) <= tolerancia + RUIDO_BINARIO) {
    return {
      correcto: false,
      motivo: 'La cifra es correcta, pero falta el signo: la energía de un nivel ligado es negativa.',
      diferencia,
      tolerancia,
    };
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
  /** La cifra del motor tiene más decimales de los pedidos. Se CALCULA, no se declara a mano. */
  requiereRedondeo: boolean;
  /** Qué pulsar en el simulador para ver la cifra o confirmarla. */
  comoComprobar?: string;
}

const CON_ENERGIA = 'Usa Eₙ = −13,6/n² eV';
const CON_RYDBERG = 'Usa la ecuación de Rydberg con R = 1,097·10⁷ m⁻¹';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`. Cada
 * redondeo está elegido para que la cuenta de libro y la del motor den la misma cifra (el spec
 * lo comprueba). Sin ciudades, países ni monedas.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'La energía del nivel 3',
    enunciado: `¿Cuál es la energía del electrón del átomo de hidrógeno en el nivel n = 3, en electronvoltios? ${CON_ENERGIA} y redondea a dos decimales.`,
    categoria: 'abstracto',
    // −13,6/9 = −1,5111 (motor −1,5109) → −1,51 eV. Errores: sin signo, 1,51 · con 1/n, −4,53.
    datos: { magnitud: 'energiaNivel', n: 3, decimales: 2 },
    etiquetaRespuesta: 'E₃ en eV',
    pista: 'Divide 13,6 entre n² y pon el signo menos: el electrón ligado tiene menos energía que libre.',
    comoComprobar: 'Pulsa 3 en el nivel de partida: la tarjeta «Energía del nivel 3» marca la cifra con tres decimales.',
  },
  {
    id: 2,
    titulo: 'La energía del nivel 5',
    enunciado: `¿Cuál es la energía del electrón del hidrógeno en el nivel n = 5, en electronvoltios? ${CON_ENERGIA} y redondea a dos decimales.`,
    categoria: 'abstracto',
    // −13,6/25 = −0,544 (motor −0,5439) → −0,54 eV. Errores: con 1/n, −2,72 · sin signo, 0,54.
    datos: { magnitud: 'energiaNivel', n: 5, decimales: 2 },
    etiquetaRespuesta: 'E₅ en eV',
    pista: 'Eₙ = −13,6/n², con n² = 25.',
    comoComprobar: 'Pulsa 5 en el nivel de partida: la tarjeta «Energía del nivel 5» marca la cifra.',
  },
  {
    id: 3,
    titulo: 'El fotón de la línea roja',
    enunciado: `El electrón del hidrógeno baja del nivel 3 al nivel 2. ¿Qué energía tiene el fotón emitido, en electronvoltios? ${CON_ENERGIA} y redondea a dos decimales.`,
    categoria: 'abstracto',
    // 13,6·(1/4 − 1/9) = 13,6·5/36 = 1,8889 (motor 1,8887) → 1,89 eV. Errores: E₃ sola, 1,51 ·
    // E₂ sola, 3,40 · sumar, 4,91.
    datos: { magnitud: 'energiaFoton', nInicial: 3, nFinal: 2, decimales: 2 },
    etiquetaRespuesta: 'ΔE en eV',
    pista: 'La energía del fotón es la diferencia entre las energías de los dos niveles.',
    comoComprobar: 'Pulsa el atajo «Hα, roja (3 → 2)»: la tarjeta «Energía del fotón ΔE» marca la cifra con tres decimales.',
  },
  {
    id: 4,
    titulo: 'La línea roja de las nebulosas',
    enunciado: `Las nebulosas de emisión brillan en rojo por la línea Hα del hidrógeno, el salto del nivel 3 al 2. ¿Cuál es su longitud de onda, en nanómetros? ${CON_RYDBERG} y redondea a unidades.`,
    categoria: 'aplicado',
    // 1/λ = 1,097·10⁷·5/36 → λ = 656,3 nm (motor 656,5) → 656 nm. Errores: con los niveles al
    // revés en la resta, λ negativa · 1/λ sin invertir.
    datos: { magnitud: 'longitudOnda', nInicial: 3, nFinal: 2, decimales: 0 },
    etiquetaRespuesta: 'λ en nm',
    pista: '1/λ = R·(1/2² − 1/3²). Calcula 1/λ y después inviértelo; pasa de metros a nanómetros.',
    comoComprobar: 'Pulsa el atajo «Hα, roja (3 → 2)»: el recuadro marca λ con dos decimales.',
  },
  {
    id: 5,
    titulo: 'La primera línea de Lyman',
    enunciado: `¿Cuál es la longitud de onda del fotón que emite el hidrógeno cuando el electrón baja del nivel 2 al 1, en nanómetros? ${CON_RYDBERG} y redondea a unidades.`,
    categoria: 'abstracto',
    // 1/λ = 1,097·10⁷·3/4 → λ = 121,5 nm (motor 121,6) → 122 nm. Errores: con 1/n, 182 nm.
    datos: { magnitud: 'longitudOnda', nInicial: 2, nFinal: 1, decimales: 0 },
    etiquetaRespuesta: 'λ en nm',
    pista: '1/λ = R·(1/1² − 1/2²) = R·3/4.',
    comoComprobar: 'Pulsa el atajo «Lyman α (2 → 1)»: el recuadro marca λ y dice que es ultravioleta.',
  },
  {
    id: 6,
    titulo: 'Una línea infrarroja',
    enunciado: `El electrón del hidrógeno baja del nivel 5 al 3 (serie de Paschen). ¿Cuál es la longitud de onda del fotón, en nanómetros? ${CON_RYDBERG} y redondea a unidades.`,
    categoria: 'abstracto',
    // 1/λ = 1,097·10⁷·(1/9 − 1/25) = 1,097·10⁷·16/225 → λ = 1281,9 (motor 1282,2) → 1282 nm.
    // Errores: 5 → 2, 434.
    datos: { magnitud: 'longitudOnda', nInicial: 5, nFinal: 3, decimales: 0 },
    etiquetaRespuesta: 'λ en nm',
    pista: '1/λ = R·(1/3² − 1/5²). El resultado debe salir por encima de 750 nm: infrarrojo.',
    comoComprobar: 'Pulsa 5 en el nivel de partida y 3 en el de llegada: el recuadro marca λ y dice que es infrarrojo.',
  },
  {
    id: 7,
    titulo: 'Arrancar un electrón excitado',
    enunciado: `Un átomo de hidrógeno tiene el electrón en el nivel n = 2. ¿Qué energía mínima hay que darle para arrancarlo (ionizarlo), en electronvoltios? ${CON_ENERGIA} y redondea a dos decimales.`,
    categoria: 'aplicado',
    // 13,6/4 = 3,40 (motor 3,3996) → 3,40 eV. Errores: desde el fundamental, 13,6 · el salto
    // 2 → 1, 10,20.
    datos: { magnitud: 'energiaIonizacion', n: 2, decimales: 2 },
    etiquetaRespuesta: 'E de ionización en eV',
    pista: 'Ionizar es llevarlo de su nivel hasta n = ∞, donde la energía vale 0.',
    comoComprobar: 'Pulsa 2 en el nivel de partida y ∞ en el de llegada: la tarjeta «Energía del fotón ΔE» marca la cifra.',
  },
  {
    id: 8,
    titulo: 'La frecuencia de la línea Hβ',
    enunciado: `¿Cuál es la frecuencia de la luz que emite el hidrógeno al bajar el electrón del nivel 4 al 2 (línea Hβ)? ${CON_RYDBERG} y c = 3,00·10⁸ m/s. Da el resultado en unidades de 10¹⁴ Hz, con dos decimales.`,
    categoria: 'abstracto',
    // f = c·R·(1/4 − 1/16) = 3·10⁸·1,097·10⁷·0,1875 = 6,1706·10¹⁴ (motor 6,1651) → 6,17.
    // Errores: confundir f con 1/λ, 2,06·10⁶ · la de Hα, 4,57.
    datos: { magnitud: 'frecuencia', nInicial: 4, nFinal: 2, decimales: 2 },
    etiquetaRespuesta: 'f en unidades de 10¹⁴ Hz',
    pista: 'Rydberg da 1/λ; la frecuencia es f = c/λ = c·(1/λ).',
    comoComprobar: 'Pulsa 4 en el nivel de partida y 2 en el de llegada: la tarjeta «Frecuencia f = c/λ» marca la cifra en notación científica.',
  },
  {
    id: 9,
    titulo: 'La energía de Lyman α en julios',
    enunciado: `¿Qué energía tiene, en julios, el fotón que emite el hidrógeno al bajar del nivel 2 al 1? ${CON_ENERGIA} y 1 eV = 1,602·10⁻¹⁹ J. Da el resultado en unidades de 10⁻¹⁹ J, con dos decimales.`,
    categoria: 'abstracto',
    // 13,6·3/4 = 10,2 eV · 10,2·1,602 = 16,3404 (motor 16,3401) → 16,34. Errores: en eV, 10,20 ·
    // dividir por 1,602, 6,37.
    datos: { magnitud: 'energiaFotonJulios', nInicial: 2, nFinal: 1, decimales: 2 },
    etiquetaRespuesta: 'ΔE en unidades de 10⁻¹⁹ J',
    pista: 'Calcula la energía en eV y multiplícala por 1,602·10⁻¹⁹ J/eV.',
    comoComprobar: 'Pulsa el atajo «Lyman α (2 → 1)»: la tarjeta «En julios» marca la cifra en notación científica.',
  },
  {
    id: 10,
    titulo: 'El tamaño de la órbita 3',
    enunciado: 'En el modelo de Bohr, ¿cuál es el radio de la órbita n = 3 del hidrógeno, en nanómetros? Toma el radio de Bohr a₀ = 0,0529 nm y redondea a tres decimales.',
    categoria: 'abstracto',
    // 9·0,0529 = 0,4761 (motor 0,4763) → 0,476 nm. Errores: con n, 0,159 · con n³, 1,428.
    datos: { magnitud: 'radioOrbita', n: 3, decimales: 3 },
    etiquetaRespuesta: 'r₃ en nm',
    pista: 'El radio crece con el cuadrado del nivel: rₙ = n²·a₀.',
    comoComprobar: 'Pulsa 3 en el nivel de partida: la tarjeta «Radio de la órbita 3» marca la cifra con cuatro decimales.',
  },
  {
    id: 11,
    titulo: '¿De qué nivel viene esta línea?',
    enunciado: `En el espectro de una nebulosa aparece una línea del hidrógeno de 486 nm, de la serie de Balmer (el electrón llega al nivel 2). ¿Desde qué nivel bajó el electrón? ${CON_RYDBERG}.`,
    categoria: 'aplicado',
    // 1/n² = 1/4 − 1/(1,097·10⁷·486·10⁻⁹) = 0,25 − 0,18757 = 0,06243 → n = 4,002 → 4.
    datos: { magnitud: 'nivelDesdeLongitud', nFinal: 2, lambdaNm: 486, decimales: 0 },
    etiquetaRespuesta: 'Nivel de partida n',
    pista: 'Despeja 1/n² de la ecuación de Rydberg con el nivel de llegada 2. El nivel es un número entero.',
    comoComprobar: 'Pulsa el nivel de llegada 2 y prueba niveles de partida hasta que el recuadro marque unos 486 nm.',
  },
  {
    id: 12,
    titulo: '¿Hasta dónde sube el electrón?',
    enunciado: `Un átomo de hidrógeno en el estado fundamental (n = 1) absorbe un fotón de 12,09 eV. ¿A qué nivel sube el electrón? ${CON_ENERGIA}.`,
    categoria: 'aplicado',
    // E = −13,6 + 12,09 = −1,51 eV → n² = 13,6/1,51 = 9,01 → n = 3. Errores: n² sin raíz, 9.
    datos: { magnitud: 'nivelDesdeEnergia', nInicial: 1, energiaEV: 12.09, decimales: 0 },
    etiquetaRespuesta: 'Nivel de llegada n',
    pista: 'Suma la energía del fotón a la del nivel 1 y busca qué nivel tiene esa energía.',
    comoComprobar: 'Pulsa 1 en el nivel de partida y prueba niveles de llegada hasta que la energía del fotón marque unos 12,09 eV.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.datos.magnitud, decimales),
    pasos: r.pasos,
    requiereRedondeo: r.ok && exigeRedondeo(r.valor, decimales),
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/** splitmix32: la semilla se MEZCLA antes de usarse (reproducible no es variado). */
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

const PREGUNTAS = ['energiaNivel', 'energiaFoton', 'longitudOnda'] as const;
type Pregunta = (typeof PREGUNTAS)[number];

const ETIQUETAS: Record<Pregunta, string> = {
  energiaNivel: 'Eₙ en eV',
  energiaFoton: 'ΔE en eV',
  longitudOnda: 'λ en nm',
};

const MAX_INTENTOS = 40;

/** Lo que daría la cuenta de libro, para descartar los ejercicios en que libro y motor discrepan. */
function valorLibro(datos: DatosCaso): number {
  if (datos.magnitud === 'energiaNivel' && datos.n) return -LIBRO.energiaIonizacion / (datos.n * datos.n);
  const ni = datos.nInicial ?? NaN;
  const nf = datos.nFinal ?? NaN;
  const factor = factorSalto(Math.min(ni, nf), Math.max(ni, nf));
  if (datos.magnitud === 'energiaFoton') return LIBRO.energiaIonizacion * factor;
  return 1e9 / (LIBRO.rydberg * factor);
}

function enunciadoPractica(datos: DatosCaso): string {
  if (datos.magnitud === 'energiaNivel') {
    return `¿Cuál es la energía del electrón del hidrógeno en el nivel n = ${datos.n}, en electronvoltios? ${CON_ENERGIA} y redondea a dos decimales.`;
  }
  const verbo = (datos.nInicial ?? 0) > (datos.nFinal ?? 0) ? 'baja' : 'sube';
  const foton = verbo === 'baja' ? 'emitido' : 'absorbido';
  if (datos.magnitud === 'energiaFoton') {
    return `El electrón del hidrógeno ${verbo} del nivel ${datos.nInicial} al ${datos.nFinal}. ¿Qué energía tiene el fotón ${foton}, en electronvoltios? ${CON_ENERGIA} y redondea a dos decimales.`;
  }
  return `El electrón del hidrógeno ${verbo} del nivel ${datos.nInicial} al ${datos.nFinal}. ¿Cuál es la longitud de onda del fotón ${foton}, en nanómetros? ${CON_RYDBERG} y redondea a unidades.`;
}

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos. Solo se ofrecen los
 * ejercicios en los que la cuenta de libro y la del motor redondean igual: si no, un alumno que
 * hace bien la cuenta del enunciado sería corregido con otra cifra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const elegirNivel = (max: number) => 1 + Math.min(max - 1, Math.floor(rnd() * max));

  let datos: DatosCaso = { magnitud: 'energiaFoton', nInicial: 3, nFinal: 2, decimales: 2 };
  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    const pregunta = PREGUNTAS[Math.min(PREGUNTAS.length - 1, Math.floor(rnd() * PREGUNTAS.length))];
    let candidato: DatosCaso;
    if (pregunta === 'energiaNivel') {
      candidato = { magnitud: pregunta, n: elegirNivel(NIVEL_MAXIMO), decimales: 2 };
    } else {
      const a = elegirNivel(NIVEL_MAXIMO - 1);
      const b = a + elegirNivel(NIVEL_MAXIMO - a);
      const emite = rnd() < 0.7;
      candidato = {
        magnitud: pregunta,
        nInicial: emite ? b : a,
        nFinal: emite ? a : b,
        decimales: pregunta === 'longitudOnda' ? 0 : 2,
      };
    }
    const r = resolverCaso(candidato);
    const d = candidato.decimales ?? 2;
    if (r.ok && redondear(r.valor, d) === redondear(valorLibro(candidato), d)) {
      datos = candidato;
      break;
    }
  }

  const r = resolverCaso(datos);
  const decimales = datos.decimales ?? 2;
  return {
    enunciado: enunciadoPractica(datos),
    datos,
    respuesta: r.ok ? redondear(r.valor, decimales) : NaN,
    etiquetaRespuesta: ETIQUETAS[datos.magnitud as Pregunta],
    pasos: r.pasos,
  };
}
