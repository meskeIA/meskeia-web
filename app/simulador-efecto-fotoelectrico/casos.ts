/**
 * Casos para clase — la tarea asignable de `simulador-efecto-fotoelectrico`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * La respuesta de cada caso la calcula `./motor.ts`, el MISMO módulo con el que las tarjetas,
 * el dibujo y la gráfica pintan sus cifras. Si la corrección y el panel calcularan distinto, la
 * app suspendería una respuesta que ella misma imprime.
 *
 *   · E del fotón                       → `energiaFotonEV(λ)`.
 *   · f₀                                → `frecuenciaUmbral(φ)`.
 *   · λ₀                                → `longitudUmbralNm(φ)`.
 *   · E_c máx (eV y J), v máx, V₀ y lo
 *     que le falta al fotón (−margen)   → `calcularFotoelectrico(λ, φ)`.
 *   · La corriente al cambiar la
 *     intensidad                        → `corrienteRelativa(λ, φ, I)`.
 *
 * Las ÚNICAS cuentas propias son las dos INVERSIONES que el motor no despeja:
 *
 *   · φ desde λ y el potencial de frenado medido (caso 11): φ = E(λ) − e·V₀, con la E del fotón
 *     del propio motor. Se devuelve a `calcularFotoelectrico(λ, φ)` y se exige que reproduzca el
 *     V₀ del enunciado con holgura relativa 1e-9.
 *   · La λ que da una E_c pedida (caso 12): λ = h·c/(φ + E_c), con el `HC_EV_NM` del motor. Se
 *     devuelve a `calcularFotoelectrico(λ, φ)` y se exige que reproduzca la E_c pedida.
 *
 * Si alguna no cuadra, la resolución sale con `{ ok: false }` en vez de con una cifra.
 *
 * ── LAS CONSTANTES: «TODOS LOS MÉTODOS COINCIDEN» ────────────────────────────
 *
 * ⚠️ El motor usa CODATA 2018 (h·c = 1.239,84 eV·nm). En clase se usan valores de libro, y con
 *    h = 6,63 × 10⁻³⁴, c = 3,00 × 10⁸ y e = 1,60 × 10⁻¹⁹ sale h·c = 1.243,1 eV·nm: un 0,26 % más,
 *    que a dos decimales de una energía de 4 eV ya cambia la cifra. Por eso CADA ENUNCIADO
 *    DECLARA las constantes que hay que usar (`constantesDeclaradas`, que se añade sola al
 *    enunciado según la magnitud), siempre las mismas:
 *
 *      · eV y nm (E, E_c, V₀, λ₀, φ, λ)  → h·c = 1240 eV·nm.
 *      · f₀                              → h = 6,63 × 10⁻³⁴ J·s y e = 1,60 × 10⁻¹⁹ C.
 *      · E_c en julios                   → h·c = 1240 eV·nm y 1 eV = 1,60 × 10⁻¹⁹ J.
 *      · v máx                           → h·c = 1240 eV·nm, e = 1,60 × 10⁻¹⁹ C y
 *                                          mₑ = 9,11 × 10⁻³¹ kg.
 *
 *    Y los datos y el redondeo pedido están elegidos para que con esas constantes Y con CODATA
 *    salga LA MISMA cifra redondeada, sin que ninguna de las dos quede a menos de un 20 % de
 *    media unidad de una frontera de redondeo. Lo comprueba `coincideConConstantesDeLibro`, cada
 *    caso lo lleva calculado en `coincideConstantes`, y el modo práctica vuelve a tirar los datos
 *    si no se cumple. `valorConConstantesDeLibro` repite las fórmulas con las constantes de libro:
 *    es la cuenta del ALUMNO, que solo sirve para esa comprobación y para escribir los pasos;
 *    nunca decide la respuesta.
 *
 * ⚠️ Los pasos de la solución se escriben con las constantes declaradas (lo que hace el alumno)
 *    y terminan con la cifra del motor, que es la que se corrige.
 * ⚠️ Justo en el umbral (E = φ) el motor dice «sin emisión neta»; ningún caso cae ahí.
 * ⚠️ Ningún caso pide la E_c de una luz que no arranca electrones: el caso 8 pide lo que le
 *    FALTA al fotón, que existe; `resolverCaso` responde `{ ok: false }` si se le pide una E_c,
 *    un V₀ o una velocidad sin emisión.
 *
 * ── DATOS QUE DISCRIMINAN (hallazgo 2628, 02/10/2026) ───────────────────────
 *
 * Un caso no sirve si su error conceptual típico da la misma cifra que la clave. Cada caso
 * anota en un comentario qué errores separa y qué cifra darían (sumar φ en vez de restarla,
 * usar la E del fotón como E_c, dejar la E_c en eV para la velocidad, confundir λ₀ con la λ
 * incidente, olvidar φ al despejar λ…).
 */

import { formatNumber } from '@/lib';
import {
  HC_EV_NM,
  METALES,
  calcularFotoelectrico,
  corrienteRelativa,
  energiaFotonEV,
  frecuenciaUmbral,
  longitudUmbralNm,
  regionEspectro,
} from './motor';

/** Holgura relativa con la que una inversión (φ o λ) tiene que reproducir el dato del enunciado. */
const HOLGURA_INVERSION = 1e-9;

/** Espacio duro antes del %: que el símbolo no salte solo de línea (RAE, 2010). */
const NBSP = ' ';

/* ─────────────────────────── Constantes de libro ─────────────────────────── */

/**
 * Las constantes que declaran los enunciados. Son las de los libros de secundaria; el motor usa
 * CODATA 2018. Ver la cabecera: los datos están elegidos para que las dos den la misma cifra.
 */
export const CONSTANTES_LIBRO = {
  /** h·c en eV·nm. */
  hcEVnm: 1240,
  /** h en J·s. */
  h: 6.63e-34,
  /** e en C (y 1 eV en J). */
  e: 1.6e-19,
  /** mₑ en kg. */
  me: 9.11e-31,
} as const;

/** Distancia mínima a una frontera de redondeo, en fracción de media unidad: el 20 %. */
const MARGEN_FRONTERA = 0.2;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Magnitud =
  /** E = h·c/λ, en eV. */
  | 'energiaFoton'
  /** f₀ = φ/h, en unidades de 10¹⁵ Hz. */
  | 'frecuenciaUmbral'
  /** λ₀ = h·c/φ, en nm. */
  | 'longitudUmbral'
  /** E_c máx = h·c/λ − φ, en eV. */
  | 'energiaCinetica'
  /** E_c máx en unidades de 10⁻¹⁹ J. */
  | 'energiaCineticaJulios'
  /** V₀ = E_c máx/e, en V. */
  | 'potencialFrenado'
  /** v máx = √(2·E_c/mₑ), en unidades de 10⁵ m/s. */
  | 'velocidadMaxima'
  /** φ − E, en eV, cuando el fotón NO arranca electrones. */
  | 'energiaQueFalta'
  /** E_c máx tras multiplicar la intensidad por `factorIntensidad`: la misma. */
  | 'energiaCineticaConIntensidad'
  /** φ despejada de λ y del potencial de frenado medido (inversión). */
  | 'funcionTrabajoDesdeFrenado'
  /** λ que da una E_c máx pedida (inversión). */
  | 'longitudParaEnergiaCinetica';

export interface DatosCaso {
  magnitud: Magnitud;
  /** Id de un metal de `METALES` (se toma su φ de la lista). */
  metal?: string;
  /** Función de trabajo en eV, para un metal sin nombre. Solo se usa si no hay `metal`. */
  phi?: number;
  /** Longitud de onda de la luz, en nm. */
  lambda?: number;
  /** Otra luz con la que se compara (luz roja frente a violeta), en nm. Solo para los pasos. */
  lambdaComparada?: number;
  /** Potencial de frenado medido, en V (inversión de φ). */
  V0?: number;
  /** Energía cinética máxima pedida, en eV (inversión de λ). */
  Ec?: number;
  /** Intensidad de partida, en % (0–100), para el caso de la intensidad. */
  intensidad?: number;
  /** Por cuánto se multiplica la intensidad. */
  factorIntensidad?: number;
  /** Decimales a los que se pide redondear. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** En la unidad de la respuesta (eV, × 10¹⁵ Hz, nm, × 10⁻¹⁹ J, V o × 10⁵ m/s). */
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «4,08», «1240». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

const SUPERINDICES: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

/**
 * Notación científica en formato español («6,624 × 10⁻¹⁹»), con el exponente fijado DESPUÉS de
 * redondear la mantisa, como `formatCientifico` de la vista. Solo da formato: no calcula física.
 */
function cientifico(valor: number, decimales = 3): string {
  if (!Number.isFinite(valor)) return '—';
  if (valor === 0) return '0';
  let exponente = Math.floor(Math.log10(Math.abs(valor)));
  const escala = 10 ** decimales;
  if (Math.round((Math.abs(valor) / 10 ** exponente) * escala) / escala >= 10) exponente += 1;
  const sup = String(exponente)
    .split('')
    .map((c) => SUPERINDICES[c] ?? c)
    .join('');
  return `${numero(valor / 10 ** exponente, decimales)} × 10${sup}`;
}

/** Una función de trabajo, siempre con dos decimales, como la escribe la vista: «4,50 eV». */
function phiTexto(phi: number): string {
  return `${formatNumber(phi, 2)} eV`;
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * ¿La cifra exacta tiene más decimales de los que se piden? Holgura RELATIVA: 504,0008 y 0,64
 * se juzgan con la misma vara (una absoluta de 1e-9 trataría distinto una cifra grande).
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

/** La φ del caso: la de la lista si hay `metal`, si no la escrita. null si no hay ninguna válida. */
function phiDe(datos: DatosCaso): number | null {
  if (datos.metal !== undefined) {
    const m = METALES.find((x) => x.id === datos.metal);
    return m ? m.phi : null;
  }
  return positivo(datos.phi) ? datos.phi : null;
}

/** «el sodio», «la plata» o «el metal», para los pasos. */
function nombreMetal(datos: DatosCaso): string {
  const m = datos.metal !== undefined ? METALES.find((x) => x.id === datos.metal) : undefined;
  if (!m) return 'el metal';
  return m.id === 'plata' ? 'la plata' : `el ${m.nombre.toLowerCase()}`;
}

/** «del sodio», «de la plata» o «del metal»: la contracción que «de» + `nombreMetal` no hace. */
function deMetal(datos: DatosCaso): string {
  const nombre = nombreMetal(datos);
  return nombre.startsWith('el ') ? `del ${nombre.slice(3)}` : `de ${nombre}`;
}

/** Unidad en la que sale el resultado de cada magnitud. */
export function unidadDeMagnitud(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'energiaFoton':
    case 'energiaCinetica':
    case 'energiaQueFalta':
    case 'energiaCineticaConIntensidad':
    case 'funcionTrabajoDesdeFrenado':
      return 'eV';
    case 'frecuenciaUmbral':
      return '× 10¹⁵ Hz';
    case 'longitudUmbral':
    case 'longitudParaEnergiaCinetica':
      return 'nm';
    case 'energiaCineticaJulios':
      return '× 10⁻¹⁹ J';
    case 'potencialFrenado':
      return 'V';
    case 'velocidadMaxima':
      return '× 10⁵ m/s';
    default:
      return '';
  }
}

/**
 * La frase de constantes que se añade al enunciado. Sale de la magnitud, no se escribe a mano:
 * así el enunciado no puede declarar unas constantes y la comprobación usar otras.
 */
export function constantesDeclaradas(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'frecuenciaUmbral':
      return 'Usa h = 6,63 × 10⁻³⁴ J·s y e = 1,60 × 10⁻¹⁹ C.';
    case 'energiaCineticaJulios':
      return 'Usa h·c = 1240 eV·nm y 1 eV = 1,60 × 10⁻¹⁹ J.';
    case 'velocidadMaxima':
      return 'Usa h·c = 1240 eV·nm, e = 1,60 × 10⁻¹⁹ C y mₑ = 9,11 × 10⁻³¹ kg.';
    default:
      return 'Usa h·c = 1240 eV·nm.';
  }
}

function conUnidad(valor: number, datos: DatosCaso): string {
  const unidad = unidadDeMagnitud(datos.magnitud);
  const cifra = formatNumber(valor, datos.decimales ?? 2);
  return unidad ? `${cifra} ${unidad}` : cifra;
}

/* ─────────────── La cuenta del alumno, con las constantes declaradas ─────────────── */

/**
 * La respuesta SIN redondear calculada con las constantes que declara el enunciado
 * (`CONSTANTES_LIBRO`). Es la cuenta que hace el alumno: sirve para comprobar que coincide con
 * la del motor tras redondear y para escribir los pasos. NUNCA es la respuesta que se corrige.
 * NaN si faltan datos.
 */
export function valorConConstantesDeLibro(datos: DatosCaso): number {
  const { hcEVnm, h, e, me } = CONSTANTES_LIBRO;
  const phi = phiDe(datos);
  const lambda = datos.lambda;
  const fotonLibro = positivo(lambda) ? hcEVnm / lambda : NaN;
  switch (datos.magnitud) {
    case 'energiaFoton':
      return fotonLibro;
    case 'frecuenciaUmbral':
      return phi === null ? NaN : (phi * e) / h / 1e15;
    case 'longitudUmbral':
      return phi === null ? NaN : hcEVnm / phi;
    case 'energiaCinetica':
    case 'energiaCineticaConIntensidad':
    case 'potencialFrenado':
      return phi === null ? NaN : fotonLibro - phi;
    case 'energiaCineticaJulios':
      return phi === null ? NaN : ((fotonLibro - phi) * e) / 1e-19;
    case 'velocidadMaxima':
      return phi === null ? NaN : Math.sqrt((2 * (fotonLibro - phi) * e) / me) / 1e5;
    case 'energiaQueFalta':
      return phi === null ? NaN : phi - fotonLibro;
    case 'funcionTrabajoDesdeFrenado':
      return typeof datos.V0 === 'number' ? fotonLibro - datos.V0 : NaN;
    case 'longitudParaEnergiaCinetica':
      return phi === null || typeof datos.Ec !== 'number' ? NaN : hcEVnm / (phi + datos.Ec);
    default:
      return NaN;
  }
}

/** Qué fracción de media unidad separa la cifra de la frontera de redondeo más cercana (0 a 1). */
function holguraFrontera(valor: number, decimales: number): number {
  const media = 10 ** -decimales / 2;
  return (media - Math.abs(valor - redondear(valor, decimales))) / media;
}

/** ¿Redondean a la misma cifra, y ninguna a menos de un 20 % de media unidad de una frontera? */
function coinciden(motor: number, libro: number, decimales: number): boolean {
  if (!Number.isFinite(motor) || !Number.isFinite(libro)) return false;
  const iguales = Math.abs(redondear(motor, decimales) - redondear(libro, decimales)) < 1e-9 * Math.max(1, Math.abs(motor));
  return iguales && holguraFrontera(motor, decimales) >= MARGEN_FRONTERA && holguraFrontera(libro, decimales) >= MARGEN_FRONTERA;
}

/* ─────────────────────────── resolverCaso ─────────────────────────── */

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  const { hcEVnm, h, e, me } = CONSTANTES_LIBRO;
  let valor: number;

  const necesitaPhi = datos.magnitud !== 'energiaFoton' && datos.magnitud !== 'funcionTrabajoDesdeFrenado';
  const phi = phiDe(datos);
  if (necesitaPhi && phi === null) return falta('la función de trabajo del metal', pasos);
  const necesitaLambda =
    datos.magnitud !== 'frecuenciaUmbral' &&
    datos.magnitud !== 'longitudUmbral' &&
    datos.magnitud !== 'longitudParaEnergiaCinetica';
  if (necesitaLambda && !positivo(datos.lambda)) return falta('la longitud de onda', pasos);

  /**
   * Los primeros pasos de todo caso con emisión: energía del fotón (con 1240), comparación con φ
   * y E_c = E − φ. Devuelve false si con esa luz no hay emisión (lo decide el MOTOR, no el texto).
   */
  const pasosEnergiaCinetica = (lambda: number, phiEV: number): boolean => {
    const fotonLibro = hcEVnm / lambda;
    const r = calcularFotoelectrico(lambda, phiEV);
    pasos.push(`Energía de cada fotón: E = h·c/λ = ${numero(hcEVnm)}/${numero(lambda)} = ${numero(fotonLibro)} eV.`);
    if (r === null || !r.hayEmision) {
      pasos.push(`Compara: ${numero(fotonLibro)} eV no supera φ = ${phiTexto(phiEV)}, así que no se arranca ningún electrón.`);
      return false;
    }
    pasos.push(`Compara: ${numero(fotonLibro)} eV > φ = ${phiTexto(phiEV)}, así que hay emisión.`);
    pasos.push(
      `Lo que le sobra al fotón tras pagar la función de trabajo es la energía cinética del electrón más rápido: E_c máx = E − φ = ${numero(fotonLibro)} − ${numero(phiEV)} = ${numero(fotonLibro - phiEV)} eV.`,
    );
    return true;
  };

  const sinEmision = (): Resolucion => ({
    ok: false,
    valor: NaN,
    pasos,
    error: 'Con esa luz no se arranca ningún electrón: no hay energía cinética, ni velocidad, ni potencial de frenado.',
  });

  switch (datos.magnitud) {
    /* ── Lo que sale directamente del motor ─────────────────────────────── */
    case 'energiaFoton': {
      const lambda = datos.lambda as number;
      const E = energiaFotonEV(lambda);
      if (E === null) return falta('la longitud de onda', pasos);
      valor = E;
      pasos.push('La energía de un fotón solo depende de su longitud de onda: E = h·c/λ. Con λ en nm y h·c = 1240 eV·nm, sale directamente en eV.');
      pasos.push(`E = ${numero(hcEVnm)}/${numero(lambda)} = ${numero(hcEVnm / lambda)} eV.`);
      pasos.push('El metal no interviene: decide si ese fotón arranca electrones, no cuánta energía trae.');
      break;
    }

    case 'frecuenciaUmbral': {
      const phiEV = phi as number;
      const f0 = frecuenciaUmbral(phiEV);
      if (f0 === null) return falta('la función de trabajo del metal', pasos);
      valor = f0 / 1e15;
      const phiJ = phiEV * e;
      pasos.push('La frecuencia umbral es la del fotón que trae justo la energía φ: h·f₀ = φ, así que f₀ = φ/h.');
      pasos.push(`Pasa φ a julios: φ = ${numero(phiEV)} · 1,60 × 10⁻¹⁹ = ${cientifico(phiJ)} J.`);
      pasos.push(
        `f₀ = ${cientifico(phiJ)} / 6,63 × 10⁻³⁴ = ${cientifico(phiJ / h)} Hz, es decir, ${numero(phiJ / h / 1e15)} × 10¹⁵ Hz.`,
      );
      pasos.push(
        `Por debajo de f₀ (o, lo que es lo mismo, con λ por encima de λ₀ = ${numero(hcEVnm)}/${numero(phiEV)} = ${numero(hcEVnm / phiEV, 1)} nm) ${nombreMetal(datos)} no emite, por intensa que sea la luz.`,
      );
      break;
    }

    case 'longitudUmbral': {
      const phiEV = phi as number;
      const l0 = longitudUmbralNm(phiEV);
      if (l0 === null) return falta('la función de trabajo del metal', pasos);
      valor = l0;
      pasos.push('λ₀ es la longitud de onda del fotón que trae justo la energía φ: h·c/λ₀ = φ, así que λ₀ = h·c/φ.');
      pasos.push(`λ₀ = ${numero(hcEVnm)}/${numero(phiEV)} = ${numero(hcEVnm / phiEV, 2)} nm.`);
      const region = regionEspectro(l0);
      pasos.push(
        `Es la λ MÁS LARGA que todavía arranca electrones: con λ < λ₀ hay emisión y con λ > λ₀ no. Aquí cae en el ${region}${region === 'visible' ? ', así que una parte de la luz visible sí funciona' : ''}.`,
      );
      break;
    }

    case 'energiaCinetica':
    case 'energiaCineticaConIntensidad': {
      const lambda = datos.lambda as number;
      const phiEV = phi as number;
      if (positivo(datos.lambdaComparada)) {
        const otra = calcularFotoelectrico(datos.lambdaComparada, phiEV);
        const fotonOtra = hcEVnm / datos.lambdaComparada;
        if (otra === null) return falta('la longitud de onda con la que se compara', pasos);
        pasos.push(
          otra.hayEmision
            ? `Con la luz de ${numero(datos.lambdaComparada)} nm: E = ${numero(hcEVnm)}/${numero(datos.lambdaComparada)} = ${numero(fotonOtra)} eV, mayor que φ = ${phiTexto(phiEV)}: también arranca electrones.`
            : `Con la luz de ${numero(datos.lambdaComparada)} nm: E = ${numero(hcEVnm)}/${numero(datos.lambdaComparada)} = ${numero(fotonOtra)} eV, menor que φ = ${phiTexto(phiEV)}: no arranca ningún electrón, por intensa que sea. No hay ninguna E_c que calcular con ella.`,
        );
      }
      if (!pasosEnergiaCinetica(lambda, phiEV)) return sinEmision();
      const r = calcularFotoelectrico(lambda, phiEV);
      if (r === null) return falta('la longitud de onda', pasos);
      valor = r.energiaCineticaEV;
      if (datos.magnitud === 'energiaCineticaConIntensidad') {
        const I = datos.intensidad;
        const factor = datos.factorIntensidad;
        if (!positivo(I)) return falta('la intensidad de partida', pasos);
        if (!positivo(factor)) return falta('cuánto cambia la intensidad', pasos);
        const antes = corrienteRelativa(lambda, phiEV, I);
        const despues = corrienteRelativa(lambda, phiEV, I * factor);
        if (antes === null || despues === null) {
          return { ok: false, valor: NaN, pasos, error: 'La intensidad no es válida.' };
        }
        pasos.push(
          'La intensidad no aparece en E_c máx = h·f − φ: cada electrón recibe la energía de UN solo fotón, y la energía de cada fotón solo depende de su color (su λ).',
        );
        pasos.push(
          `Multiplicar la intensidad por ${numero(factor)} multiplica por ${numero(factor)} los fotones por segundo y, con ellos, los electrones: la corriente relativa pasa del ${numero(antes)}${NBSP}% al ${numero(despues)}${NBSP}%. Pero cada electrón sale con la misma energía máxima de antes.`,
        );
      }
      break;
    }

    case 'energiaCineticaJulios': {
      const lambda = datos.lambda as number;
      const phiEV = phi as number;
      if (!pasosEnergiaCinetica(lambda, phiEV)) return sinEmision();
      const r = calcularFotoelectrico(lambda, phiEV);
      if (r === null) return falta('la longitud de onda', pasos);
      valor = r.energiaCineticaJ / 1e-19;
      const ecLibro = hcEVnm / lambda - phiEV;
      pasos.push(
        `A julios, multiplicando por la carga del electrón: E_c máx = ${numero(ecLibro)} · 1,60 × 10⁻¹⁹ = ${cientifico(ecLibro * e, 4)} J.`,
      );
      break;
    }

    case 'potencialFrenado': {
      const lambda = datos.lambda as number;
      const phiEV = phi as number;
      if (!pasosEnergiaCinetica(lambda, phiEV)) return sinEmision();
      const r = calcularFotoelectrico(lambda, phiEV);
      if (r === null) return falta('la longitud de onda', pasos);
      valor = r.potencialFrenado;
      const ecLibro = hcEVnm / lambda - phiEV;
      pasos.push(
        `El potencial de frenado es el que detiene justo al electrón más rápido: e·V₀ = E_c máx. Con la energía en eV, V₀ en voltios es el MISMO número: V₀ = ${numero(ecLibro)} V.`,
      );
      pasos.push('Por eso medir V₀ en el laboratorio es la forma de medir la energía cinética máxima.');
      break;
    }

    case 'velocidadMaxima': {
      const lambda = datos.lambda as number;
      const phiEV = phi as number;
      if (!pasosEnergiaCinetica(lambda, phiEV)) return sinEmision();
      const r = calcularFotoelectrico(lambda, phiEV);
      if (r === null) return falta('la longitud de onda', pasos);
      valor = r.velocidadMax / 1e5;
      const ecJ = (hcEVnm / lambda - phiEV) * e;
      const vLibro = Math.sqrt((2 * ecJ) / me);
      pasos.push(`Para la velocidad, la energía tiene que ir en julios: E_c máx = ${numero(hcEVnm / lambda - phiEV)} · 1,60 × 10⁻¹⁹ = ${cientifico(ecJ)} J.`);
      pasos.push(
        `De E_c = ½·mₑ·v² se despeja v = √(2·E_c/mₑ) = √(2 · ${cientifico(ecJ)} / 9,11 × 10⁻³¹) = ${cientifico(vLibro, 4)} m/s.`,
      );
      pasos.push('Sin relatividad: con unos pocos eV frente a los 511 keV del electrón en reposo, la corrección no se ve.');
      break;
    }

    case 'energiaQueFalta': {
      const lambda = datos.lambda as number;
      const phiEV = phi as number;
      const r = calcularFotoelectrico(lambda, phiEV);
      if (r === null) return falta('la longitud de onda', pasos);
      const fotonLibro = hcEVnm / lambda;
      pasos.push(`Energía de cada fotón: E = h·c/λ = ${numero(hcEVnm)}/${numero(lambda)} = ${numero(fotonLibro)} eV.`);
      // El régimen lo decide el motor, no el texto: si alguien cambia los datos, la frase sigue.
      if (r.hayEmision) {
        pasos.push(`Compara: ${numero(fotonLibro)} eV > φ = ${phiTexto(phiEV)}: este fotón sí arranca electrones.`);
        return { ok: false, valor: NaN, pasos, error: 'Con esa luz sí hay emisión: al fotón no le falta energía.' };
      }
      valor = -r.margenEV;
      pasos.push(
        `Compara: ${numero(fotonLibro)} eV < φ = ${phiTexto(phiEV)}. El fotón no llega y no se arranca ningún electrón, por intensa que sea la luz: más intensidad son más fotones, pero cada uno trae la misma energía.`,
      );
      pasos.push(
        `Le falta φ − E = ${numero(phiEV)} − ${numero(fotonLibro)} = ${numero(phiEV - fotonLibro)} eV. No es una energía cinética negativa: es que no hay emisión.`,
      );
      pasos.push(
        `Para arrancar electrones ${deMetal(datos)} haría falta λ < λ₀ = ${numero(hcEVnm)}/${numero(phiEV)} = ${numero(hcEVnm / phiEV, 1)} nm.`,
      );
      break;
    }

    /* ── Las dos inversiones, contrastadas de vuelta con el motor ───────── */
    case 'funcionTrabajoDesdeFrenado': {
      const lambda = datos.lambda as number;
      if (!positivo(datos.V0)) return falta('el potencial de frenado', pasos);
      const V0 = datos.V0;
      const E = energiaFotonEV(lambda);
      if (E === null) return falta('la longitud de onda', pasos);
      valor = E - V0;
      if (!(valor > 0)) {
        return { ok: false, valor: NaN, pasos, error: 'Con esos datos la función de trabajo no sale positiva.' };
      }
      const fotonLibro = hcEVnm / lambda;
      pasos.push(`El potencial de frenado da la energía cinética máxima en eV sin hacer cuentas: V₀ = ${formatNumber(V0, 2)} V, así que E_c máx = ${formatNumber(V0, 2)} eV.`);
      pasos.push(`Energía de cada fotón: E = h·c/λ = ${numero(hcEVnm)}/${numero(lambda)} = ${numero(fotonLibro)} eV.`);
      pasos.push(`De E_c máx = E − φ se despeja φ = E − E_c máx = ${numero(fotonLibro)} − ${numero(V0)} = ${numero(fotonLibro - V0)} eV.`);
      const comprobacion = calcularFotoelectrico(lambda, valor);
      if (
        comprobacion === null ||
        !comprobacion.hayEmision ||
        Math.abs(comprobacion.potencialFrenado - V0) > HOLGURA_INVERSION * V0
      ) {
        return { ok: false, valor: NaN, pasos, error: 'La función de trabajo despejada no reproduce el potencial de frenado.' };
      }
      // Con un valor inicial, `reduce` no lanza aunque la lista llegara vacía.
      const cercano = METALES.reduce<(typeof METALES)[number] | null>(
        (a, b) => (a === null || Math.abs(b.phi - valor) < Math.abs(a.phi - valor) ? b : a),
        null,
      );
      if (cercano) {
        pasos.push(
          `De los metales del simulador, el más cercano es ${cercano.id === 'plata' ? 'la plata' : `el ${cercano.nombre.toLowerCase()}`} (φ = ${phiTexto(cercano.phi)}). Se identifica por proximidad: la φ real depende del estado de la superficie y varía unas décimas de eV entre tablas.`,
        );
      }
      pasos.push(
        `Comprobación con el motor: con φ = ${numero(valor)} eV y λ = ${numero(lambda)} nm, el potencial de frenado sale ${numero(comprobacion.potencialFrenado)} V.`,
      );
      break;
    }

    case 'longitudParaEnergiaCinetica': {
      const phiEV = phi as number;
      if (!positivo(datos.Ec)) return falta('la energía cinética pedida', pasos);
      const Ec = datos.Ec;
      valor = HC_EV_NM / (phiEV + Ec);
      const eLibro = phiEV + Ec;
      pasos.push(
        `El fotón tiene que pagar la función de trabajo Y dejarle al electrón su energía cinética: E = φ + E_c máx = ${numero(phiEV)} + ${numero(Ec)} = ${numero(eLibro)} eV.`,
      );
      pasos.push(`Y de E = h·c/λ se despeja λ = h·c/E = ${numero(hcEVnm)}/${numero(eLibro)} = ${numero(hcEVnm / eLibro, 2)} nm.`);
      pasos.push(
        Ec < phiEV
          ? `Si te olvidas de φ (λ = h·c/E_c = ${numero(hcEVnm / Ec, 0)} nm) sale una luz que ni siquiera arranca electrones: su λ es mayor que λ₀ = ${numero(hcEVnm / phiEV, 1)} nm.`
          : `Si te olvidas de φ (λ = h·c/E_c = ${numero(hcEVnm / Ec, 0)} nm) los electrones saldrían con mucha menos energía de la pedida.`,
      );
      const comprobacion = calcularFotoelectrico(valor, phiEV);
      if (
        comprobacion === null ||
        !comprobacion.hayEmision ||
        Math.abs(comprobacion.energiaCineticaEV - Ec) > HOLGURA_INVERSION * Ec
      ) {
        return { ok: false, valor: NaN, pasos, error: 'La longitud de onda despejada no reproduce la energía cinética pedida.' };
      }
      pasos.push(
        `Comprobación con el motor: con λ = ${numero(valor, 3)} nm, E_c máx = ${numero(comprobacion.energiaCineticaEV)} eV.`,
      );
      break;
    }

    default:
      return { ok: false, valor: NaN, pasos, error: 'Magnitud desconocida.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  // La cifra del motor (CODATA 2018), que es la que se corrige, frente a la de libro.
  const libro = valorConConstantesDeLibro(datos);
  const unidad = unidadDeMagnitud(datos.magnitud);
  pasos.push(
    coinciden(valor, libro, decimales)
      ? `El simulador calcula con las constantes exactas (CODATA 2018, h·c = ${numero(HC_EV_NM, 2)} eV·nm) y le sale ${numero(valor)} ${unidad}: redondeando como pide el enunciado, la misma cifra.`
      : `El simulador calcula con las constantes exactas (CODATA 2018, h·c = ${numero(HC_EV_NM, 2)} eV·nm) y le sale ${numero(valor)} ${unidad}; la respuesta que se corrige es esa.`,
  );

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
 * ¿La cuenta con las constantes que declara el enunciado y la del motor (CODATA) dan la misma
 * cifra redondeada, las dos a más de un 20 % de media unidad de una frontera de redondeo? Es la
 * garantía de «todos los métodos coinciden». false si el caso no se resuelve.
 */
export function coincideConConstantesDeLibro(datos: DatosCaso): boolean {
  const r = resolverCaso(datos);
  if (!r.ok) return false;
  return coinciden(r.valor, valorConConstantesDeLibro(datos), datos.decimales ?? 2);
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * La tolerancia de un caso la da la PREGUNTA, no el tamaño de la cifra (hallazgo 2626,
 * 02/10/2026). Es el error de lectura de los datos propagado a la respuesta más media unidad del
 * redondeo pedido; aquí los datos son EXACTOS (nada se lee de una tabla ni de una gráfica), así
 * que solo queda el redondeo:
 *
 *   · si la cifra exacta tiene más decimales de los que se piden, media unidad del último
 *     decimal pedido: entra todo lo que redondea a la clave (de 503,5 a 504,5 en el caso 3, que
 *     incluye el 504,0008 del motor y el 504,07 de h·c = 1240 sin redondear);
 *   · si la cifra es exacta, no hay redondeo que tolerar: solo vale ella.
 *
 * Con CODATA casi todas las cifras exigen redondeo, y los datos están elegidos para que la cuenta
 * con las constantes declaradas caiga dentro de esa media unidad (ver la cabecera).
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
  /** El enunciado completo, con la frase de constantes (`constantesDeclaradas`) al final. */
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
   * Con las constantes que declara el enunciado sale la misma cifra redondeada que con las del
   * motor (`coincideConConstantesDeLibro`). Calculado: el spec exige que sea true en los doce.
   */
  coincideConstantes: boolean;
  /**
   * Qué poner en los controles para ver la cifra en el panel o para confirmarla. Solo donde es
   * VERDAD con los controles actuales y con los decimales que imprime cada tarjeta (3 en eV y V,
   * 1 en λ₀, mantisa de 3 decimales en Hz, J y m/s). El panel usa CODATA: donde su cifra difiere
   * de la de libro en el último decimal, el texto lo dice.
   */
  comoComprobar?: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible. La frase de constantes tampoco:
 * la añade `constantesDeclaradas` según la magnitud.
 *
 * Sin ciudades, países ni monedas: el canal aula es sobre todo de fuera de España. Las λ son las
 * «amables» con h·c = 1240 (155 → 8 eV, 200 → 6,2 eV, 248 → 5 eV, 310 → 4 eV, 400 → 3,1 eV,
 * 620 → 2 eV), y en cada caso se anota la cifra con CODATA (C) y con las constantes declaradas (L).
 */
type Definicion = Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'requiereRedondeo' | 'coincideConstantes'>;

const DEFINICIONES: ReadonlyArray<Definicion> = [
  {
    id: 1,
    titulo: 'La energía de un fotón',
    // Declara h·c = 1240 eV·nm. C: 3,99949 → 4,00 · L: 4,00 exacto.
    // Errores: λ/(h·c) = 0,25 · E en julios sin pasar a eV, 6,42 (× 10⁻¹⁹) · con h·c = 1243,1
    // (h, c y e de libro por separado) 4,01, que el enunciado descarta al fijar 1240.
    enunciado:
      'Una luz ultravioleta tiene una longitud de onda de 310 nm. ¿Qué energía lleva cada uno de sus fotones, en eV? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaFoton', lambda: 310 },
    etiquetaRespuesta: 'E del fotón en eV',
    pista: 'Con λ en nm y h·c = 1240 eV·nm, la energía sale en eV con una sola división: E = h·c/λ.',
    comoComprobar:
      'Pon λ = 310 nm (el metal da igual): la tarjeta «Energía del fotón» marca 3,999 eV, porque el simulador usa h·c = 1.239,84 eV·nm; con 1240 sale 4 exacto. Redondeadas a dos decimales, las dos dan 4,00.',
  },
  {
    id: 2,
    titulo: 'La frecuencia umbral',
    // Declara h = 6,63 × 10⁻³⁴ J·s y e = 1,60 × 10⁻¹⁹ C. C: 1,0010 → 1,00 · L: 0,9991 → 1,00.
    // Errores: φ en eV entre h en J·s, 6,24 × 10³³ Hz (6,24 × 10¹⁸ en estas unidades) · dar
    // λ₀ = 299,5 (nm) · φ·e·h, un número diminuto.
    enunciado:
      'La función de trabajo del plomo es φ = 4,14 eV. ¿Cuál es su frecuencia umbral f₀? Da el resultado en unidades de 10¹⁵ Hz, redondeado a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'frecuenciaUmbral', metal: 'plomo' },
    etiquetaRespuesta: 'f₀ en × 10¹⁵ Hz',
    pista: 'La frecuencia umbral es la del fotón con energía justo φ: f₀ = φ/h. Pasa antes φ de eV a julios.',
    comoComprobar:
      'Elige Plomo: la tarjeta «Frecuencia umbral f₀» marca 1,001 × 10¹⁵ Hz (con las constantes de libro sale 0,999 × 10¹⁵). Redondeadas a dos decimales, las dos dan 1,00.',
  },
  {
    id: 3,
    titulo: 'Hasta dónde funciona una célula fotoeléctrica',
    // Declara h·c = 1240 eV·nm. C: 504,0008 → 504 · L: 504,07 → 504.
    // Errores: φ/(h·c) = 0,002 · con h·c = 1243,1, 505 · dar f₀ = 5,9 × 10¹⁴ (Hz) en vez de λ₀.
    enunciado:
      'Una célula fotoeléctrica tiene el cátodo de sodio (φ = 2,46 eV). ¿Cuál es la longitud de onda más larga de la luz que todavía la hace funcionar, en nm? Redondea a unidades.',
    categoria: 'aplicado',
    datos: { magnitud: 'longitudUmbral', metal: 'sodio', decimales: 0 },
    etiquetaRespuesta: 'λ₀ en nm',
    pista: 'λ₀ = h·c/φ. Es la longitud de onda MÁS LARGA que todavía arranca electrones.',
    comoComprobar:
      'Elige Sodio: la tarjeta «Longitud de onda umbral λ₀» marca 504,0 nm. Con λ = 503 nm todavía hay emisión (la energía cinética máxima marca 0,005 eV); con λ = 505 nm, «sin emisión».',
  },
  {
    id: 4,
    titulo: 'La energía cinética máxima',
    // Declara h·c = 1240 eV·nm. C: 0,91936 → 0,92 · L: 0,92 exacto.
    // Errores: sumar φ, 9,08 · la E del fotón como E_c, 5,00 · φ − E, −0,92 (el signo cuenta).
    enunciado:
      'Se ilumina una placa de aluminio (φ = 4,08 eV) con luz ultravioleta de 248 nm. ¿Cuál es la energía cinética máxima de los electrones arrancados, en eV? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaCinetica', metal: 'aluminio', lambda: 248 },
    etiquetaRespuesta: 'E_c máx. en eV',
    pista: 'Calcula la energía del fotón y réstale la función de trabajo: E_c máx = h·c/λ − φ.',
    comoComprobar:
      'Elige Aluminio y pon λ = 248 nm: la tarjeta «Energía cinética máxima» marca 0,919 eV (con h·c = 1240 sale 0,920). Redondeadas a dos decimales, las dos dan 0,92.',
  },
  {
    id: 5,
    titulo: 'La energía cinética, en julios',
    // Declara h·c = 1240 eV·nm y 1 eV = 1,60 × 10⁻¹⁹ J. C: 2,6420 → 2,64 · L: 2,64 exacto.
    // Errores: dejarla en eV, 1,65 · la E del fotón en J, 12,80 · φ en J, 10,16 · sumar φ, 22,96.
    enunciado:
      'Una placa de platino (φ = 6,35 eV) se ilumina con luz ultravioleta de 155 nm. ¿Cuál es la energía cinética máxima de los electrones arrancados? Da el resultado en unidades de 10⁻¹⁹ J, redondeado a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'energiaCineticaJulios', metal: 'platino', lambda: 155 },
    etiquetaRespuesta: 'E_c máx. en × 10⁻¹⁹ J',
    pista: 'Saca E_c máx en eV como siempre y pásala a julios multiplicando por 1,60 × 10⁻¹⁹.',
    comoComprobar:
      'Elige Platino y pon λ = 155 nm: la tarjeta «Energía cinética máxima» marca 1,649 eV y, debajo, 2,642 × 10⁻¹⁹ J.',
  },
  {
    id: 6,
    titulo: 'Medir el potencial de frenado',
    // Declara h·c = 1240 eV·nm. C: 2,0592 → 2,06 · L: 2,06 exacto.
    // Errores: la E del fotón, 6,20 · E_c en julios (mantisa), 3,30 · sumar φ, 10,34 · dar φ, 4,14.
    enunciado:
      'En un experimento de laboratorio se ilumina un cátodo de plomo (φ = 4,14 eV) con luz ultravioleta de 200 nm y se aumenta poco a poco la tensión que frena a los electrones hasta que la corriente se anula. ¿Qué tensión marca el voltímetro en ese momento (el potencial de frenado V₀), en voltios? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'potencialFrenado', metal: 'plomo', lambda: 200 },
    etiquetaRespuesta: 'V₀ en V',
    pista: 'e·V₀ = E_c máx: con la energía en eV, el potencial en voltios es el mismo número.',
    comoComprobar:
      'Elige Plomo y pon λ = 200 nm: la tarjeta «Potencial de frenado V₀» marca 2,059 V, el mismo número que la energía cinética máxima en eV.',
  },
  {
    id: 7,
    titulo: 'La velocidad de los electrones',
    // Declara h·c = 1240 eV·nm, e = 1,60 × 10⁻¹⁹ C y mₑ = 9,11 × 10⁻³¹ kg.
    // C: 7,2620 → 7,26 · L: 7,2587 → 7,26.
    // Errores: E_c en eV en vez de J, 1,81 × 10¹⁵ m/s · sin el 2, 5,13 · la E del fotón como
    // E_c, 14,76.
    enunciado:
      'Una placa de cobre (φ = 4,70 eV) se ilumina con luz ultravioleta de 200 nm. ¿Cuál es la velocidad máxima de los electrones arrancados? Da el resultado en unidades de 10⁵ m/s, redondeado a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'velocidadMaxima', metal: 'cobre', lambda: 200 },
    etiquetaRespuesta: 'v máx. en × 10⁵ m/s',
    pista: 'v = √(2·E_c/mₑ), con E_c en JULIOS y mₑ en kilogramos.',
    comoComprobar:
      'Elige Cobre y pon λ = 200 nm: la tarjeta «Velocidad máxima» marca 7,262 × 10⁵ m/s (con las constantes de libro sale 7,259). Redondeadas a dos decimales, las dos dan 7,26.',
  },
  {
    id: 8,
    titulo: 'Luz violeta que no arranca nada',
    // Declara h·c = 1240 eV·nm. C: 1,21039 → 1,21 · L: 1,21 exacto.
    // Errores: E − φ, −1,21 (una «E_c negativa») · la E del fotón, 3,10 · dar φ, 4,31 · 0.
    enunciado:
      'Se ilumina una placa de zinc (φ = 4,31 eV) con una luz violeta de 400 nm muy intensa, y el amperímetro no marca corriente. ¿Cuánta energía le falta a cada fotón para poder arrancar un electrón, en eV? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'energiaQueFalta', metal: 'zinc', lambda: 400 },
    etiquetaRespuesta: 'Energía que falta en eV',
    pista: 'Compara primero la energía del fotón con φ. Si no llega, lo que le falta es φ − E.',
    comoComprobar:
      'Elige Zinc y pon λ = 400 nm: el mensaje de «Resultados» dice que a cada fotón le faltan 1,210 eV y, aunque subas la intensidad al 100 %, la corriente relativa sigue en 0 %.',
  },
  {
    id: 9,
    titulo: 'Duplicar la intensidad',
    // Declara h·c = 1240 eV·nm. C: 0,63960 → 0,64 · L: 0,64 exacto.
    // Errores: duplicar la E_c, 1,28 · la mitad, 0,32 · la E del fotón, 3,10.
    enunciado:
      'Una lámpara ilumina una placa de sodio (φ = 2,46 eV) con luz violeta de 400 nm. Si se duplica la intensidad de la lámpara sin cambiar su color, ¿cuál es la nueva energía cinética máxima de los electrones, en eV? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'energiaCineticaConIntensidad', metal: 'sodio', lambda: 400, intensidad: 40, factorIntensidad: 2 },
    etiquetaRespuesta: 'E_c máx. en eV',
    pista: 'Mira qué magnitudes aparecen en E_c máx = h·f − φ. ¿Está la intensidad?',
    comoComprobar:
      'Elige Sodio, pon λ = 400 nm y mueve la intensidad del 40 % al 80 %: la tarjeta «Energía cinética máxima» sigue en 0,640 eV, mientras la corriente relativa pasa del 40 % al 80 % y el dibujo pasa de 4 a 8 electrones.',
  },
  {
    id: 10,
    titulo: 'Luz roja frente a luz violeta',
    // Declara h·c = 1240 eV·nm. Metal sin nombre (φ = 2,20 eV), que no es ninguno de la lista.
    // C: 0,89961 → 0,90 · L: 0,90 exacto. La roja (2,00 eV) no llega: no se pide su E_c.
    // Errores: restar con la roja, −0,20 · la diferencia de las dos E del fotón, 1,10 · la E del
    // fotón violeta, 3,10 · sumar φ, 5,30.
    enunciado:
      'Una placa de un metal con φ = 2,20 eV se ilumina primero con luz roja de 620 nm y después con luz violeta de 400 nm. Solo una de las dos arranca electrones. ¿Con qué energía cinética máxima salen, en eV? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'energiaCinetica', phi: 2.2, lambda: 400, lambdaComparada: 620 },
    etiquetaRespuesta: 'E_c máx. en eV',
    pista: 'Calcula la energía de los fotones de cada luz y compárala con φ antes de restar nada.',
    comoComprobar:
      'Elige «Otro φ» y escribe 2,20. Con λ = 620 nm la tarjeta «Energía cinética máxima» dice «sin emisión»; con λ = 400 nm marca 0,900 eV.',
  },
  {
    id: 11,
    titulo: 'Identificar el metal',
    // Declara h·c = 1240 eV·nm. C: 4,49936 → 4,50 · L: 4,50 exacto. La solución nombra el
    // hierro (φ = 4,50 eV), el más cercano de la lista.
    // Errores: E + V₀, 5,50 · dar V₀, 0,50 · dar la E del fotón, 5,00.
    enunciado:
      'En un laboratorio se ilumina un metal desconocido con luz ultravioleta de 248 nm y se mide un potencial de frenado de 0,50 V. ¿Cuál es la función de trabajo del metal, en eV? Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { magnitud: 'funcionTrabajoDesdeFrenado', lambda: 248, V0: 0.5 },
    etiquetaRespuesta: 'φ en eV',
    pista: 'El potencial de frenado te da E_c máx en eV. Despeja φ de E_c máx = E − φ.',
    comoComprobar:
      'Elige «Otro φ», escribe tu resultado y pon λ = 248 nm: la tarjeta «Potencial de frenado V₀» debe marcar casi 0,50 V (con 4,50 eV, 0,499 V). Después busca entre los metales el que tiene esa φ.',
  },
  {
    id: 12,
    titulo: 'La luz que hace falta',
    // Declara h·c = 1240 eV·nm. C: 247,968 → 248 · L: 248 exacto.
    // Errores: olvidar φ, h·c/E_c = 1797 · restar en vez de sumar, h·c/(φ − E_c) = 343 · dar
    // λ₀ del zinc, 288.
    enunciado:
      'Se quiere que los electrones arrancados de una placa de zinc (φ = 4,31 eV) salgan con una energía cinética máxima de 0,69 eV. ¿Qué longitud de onda debe tener la luz, en nm? Redondea a unidades.',
    categoria: 'abstracto',
    datos: { magnitud: 'longitudParaEnergiaCinetica', metal: 'zinc', Ec: 0.69, decimales: 0 },
    etiquetaRespuesta: 'λ en nm',
    pista: 'El fotón tiene que pagar φ y además dejar la E_c: E = φ + E_c. Después, λ = h·c/E.',
    comoComprobar:
      'Elige Zinc y mueve λ hasta tu resultado: la tarjeta «Energía cinética máxima» debe marcar casi 0,69 eV (con 248 nm, 0,689 eV).',
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «0,92 eV», «7,26 × 10⁵ m/s». La
 * unidad es lo que va detrás de « en » en la etiqueta («v máx. en × 10⁵ m/s» → «× 10⁵ m/s»),
 * así que no se imprime nunca un número suelto junto a media frase (hallazgo 830 de
 * `simulador-genetica`).
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
    enunciado: `${def.enunciado} ${constantesDeclaradas(def.datos.magnitud)}`,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
    pasos: r.pasos,
    requiereRedondeo: r.ok && exigeRedondeo(r.valor, decimales),
    coincideConstantes: r.ok && coinciden(r.valor, valorConConstantesDeLibro(def.datos), decimales),
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
 * Longitudes de onda «amables» con h·c = 1240 eV·nm (124 → 10 eV, 155 → 8 eV, 200 → 6,2 eV,
 * 248 → 5 eV, 310 → 4 eV, 400 → 3,1 eV, 496 → 2,5 eV), todas dentro del deslizador (100–800 nm).
 * Con ellas y las φ de la lista (dos decimales), la cuenta de libro da una cifra EXACTA a dos
 * decimales, y la de CODATA se queda a menos de 0,0013 eV: siempre redondean igual. En λ₀ no es
 * así para todos los metales (plomo y hierro caen en una frontera), y esos se vuelven a tirar.
 */
const LONGITUDES = [124, 155, 200, 248, 310, 400, 496] as const;
const PREGUNTAS = ['energiaFoton', 'energiaCinetica', 'potencialFrenado', 'longitudUmbral'] as const;
type Pregunta = (typeof PREGUNTAS)[number];

/** Energía cinética mínima (eV): por debajo, una E_c de 0,04 deja una sola cifra significativa. */
const RESPUESTA_MINIMA_EV = 0.1;
const MAX_INTENTOS = 30;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

const ETIQUETAS: Record<Pregunta, string> = {
  energiaFoton: 'E del fotón en eV',
  energiaCinetica: 'E_c máx. en eV',
  potencialFrenado: 'V₀ en V',
  longitudUmbral: 'λ₀ en nm',
};

function enunciadoPractica(pregunta: Pregunta, d: DatosCaso): string {
  const metal = METALES.find((m) => m.id === d.metal);
  const placa = metal ? `una placa de ${metal.nombre.toLowerCase()} (φ = ${phiTexto(metal.phi)})` : 'una placa de metal';
  const lambda = d.lambda ?? NaN;
  const luz = `luz de ${numero(lambda)} nm`;
  const constantes = constantesDeclaradas(pregunta);
  switch (pregunta) {
    case 'energiaFoton':
      return `Una luz tiene una longitud de onda de ${numero(lambda)} nm. ¿Qué energía lleva cada fotón, en eV? Redondea a dos decimales. ${constantes}`;
    case 'energiaCinetica':
      return `Se ilumina ${placa} con ${luz}. ¿Cuál es la energía cinética máxima de los electrones arrancados, en eV? Redondea a dos decimales. ${constantes}`;
    case 'potencialFrenado':
      return `Se ilumina ${placa} con ${luz}. ¿Cuál es el potencial de frenado, en voltios? Redondea a dos decimales. ${constantes}`;
    case 'longitudUmbral':
    default:
      return `¿Cuál es la longitud de onda umbral λ₀ de ${placa}, en nm? Redondea a unidades. ${constantes}`;
  }
}

/** ¿Sirve el ejercicio? Se resuelve, las dos cuentas coinciden y la E_c no es diminuta. */
function aceptable(pregunta: Pregunta, datos: DatosCaso, r: Resolucion): boolean {
  if (!r.ok || !coinciden(r.valor, valorConConstantesDeLibro(datos), datos.decimales ?? 2)) return false;
  if (pregunta === 'energiaCinetica' || pregunta === 'potencialFrenado') return r.valor >= RESPUESTA_MINIMA_EV;
  return true;
}

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos, y por tanto el mismo
 * motor que el panel: si divergieran, el alumno entrenaría con una regla y sería corregido con
 * otra. Si una combinación no arranca electrones, no cumple la coincidencia de constantes o da
 * una E_c diminuta, se vuelve a tirar.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const decimales = pregunta === 'longitudUmbral' ? 0 : 2;

  const tirar = (): DatosCaso => ({
    magnitud: pregunta,
    metal: elegir(METALES, rnd).id,
    lambda: elegir(LONGITUDES, rnd),
    decimales,
  });

  let datos = tirar();
  let r = resolverCaso(datos);
  let intentos = 0;
  while (!aceptable(pregunta, datos, r) && intentos < MAX_INTENTOS) {
    datos = tirar();
    r = resolverCaso(datos);
    intentos += 1;
  }
  if (!aceptable(pregunta, datos, r)) {
    // Salida segura, que cumple todo para cualquier pregunta: sodio a 400 nm
    // (E = 3,10 eV, E_c = V₀ = 0,64, λ₀ = 504 nm).
    datos = { magnitud: pregunta, metal: 'sodio', lambda: 400, decimales };
    r = resolverCaso(datos);
  }

  return {
    enunciado: enunciadoPractica(pregunta, datos),
    datos,
    respuesta: r.ok ? redondear(r.valor, decimales) : NaN,
    etiquetaRespuesta: ETIQUETAS[pregunta],
    pasos: r.pasos,
  };
}
