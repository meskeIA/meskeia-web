/**
 * Motor de importación de datos propios del Simulador de K-Means.
 *
 * Vive aparte de la vista y sin dependencias de React a propósito: el parseo de una tabla
 * pegada es la única lógica no trivial de esta funcionalidad, y un lienzo con puntos
 * plausibles pasa cualquier build sin demostrar que los números se han leído bien.
 * Sus casos resueltos a mano están en `tests/kmeans-parseo-motor.spec.ts`.
 *
 * Formatos admitidos (se decide el separador con la primera fila numérica y se aplica a todas):
 *   tabulador (pegar desde una hoja de cálculo) · punto y coma · espacios · coma
 *
 * Los números pasan por `parseSpanishNumber`, que admite «12,5» y «12.5». Hay dos ambigüedades
 * irreducibles, y las dos se dicen en la interfaz en vez de resolverse en silencio:
 *   - el valor con exactamente tres decimales tras un punto («1.234» se lee como mil
 *     doscientos treinta y cuatro, no como 1,234);
 *   - la coma decimal con la coma como separador de columnas: «1,5,2,5» es tanto (1,5; 2,5)
 *     como cuatro columnas enteras. Se leen columnas (es lo que es en un CSV internacional) y
 *     el resultado trae un `aviso` que lo dice con los números de la primera fila (hallazgo
 *     2455 del Inspector, 29/09/2026: antes se leía (1; 5) sin decir nada).
 */

import { formatNumber, parseSpanishNumber } from '@/lib';

export interface PuntoDato {
  x: number;
  y: number;
}

export interface Rango {
  min: number;
  max: number;
}

export interface DatosTabulares {
  /** Valores tal y como los escribió la persona, sin escalar */
  puntos: PuntoDato[];
  /** Nombres de las dos columnas usadas (de la cabecera, si la había) */
  nombres: { x: string; y: string };
  /** Filas con contenido que no se pudieron leer como par de números */
  filasIgnoradas: number;
  /** Filas con contenido encontradas en el texto (sin contar vacías ni comentarios) */
  totalLeidas: number;
  /** Número de puntos conservados si hubo que recortar; null si entraron todos */
  recortadoA: number | null;
  /** Lectura posiblemente ambigua que conviene revisar; null si no la hay */
  aviso: string | null;
}

export type ResultadoParseo =
  | { ok: true; datos: DatosTabulares }
  | { ok: false; error: string };

/** Tope de puntos: por encima el SVG se vuelve pesado y el dibujo ilegible */
export const MAX_PUNTOS_IMPORTADOS = 2000;

const NOMBRES_POR_DEFECTO = { x: 'Columna 1', y: 'Columna 2' };

/**
 * Orden deliberado: los espacios se prueban ANTES que la coma porque «12,5 30,2»
 * (decimales españoles separados por espacio) partido por comas produce campos como
 * «5 30» que parsean a 530 sin protestar — un separador equivocado que parecería válido.
 */
const SEPARADORES: { id: string; partir: (linea: string) => string[] }[] = [
  { id: 'tabulador', partir: (l) => l.split('\t') },
  { id: 'punto y coma', partir: (l) => l.split(';') },
  { id: 'espacios', partir: (l) => l.split(/\s+/) },
  { id: 'coma', partir: (l) => l.split(',') },
];

function esNumero(campo: string | undefined): boolean {
  if (campo === undefined) return false;
  return Number.isFinite(parseSpanishNumber(campo));
}

/** Un separador sirve si deja al menos dos campos y los dos primeros son números */
function separadorSirve(campos: string[]): boolean {
  return campos.length >= 2 && esNumero(campos[0]) && esNumero(campos[1]);
}

function lineasConContenido(texto: string): string[] {
  return texto
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('#'));
}

/** Un valor leído, para citarlo en un aviso: los enteros sin decimales */
function citarValor(v: number): string {
  return formatNumber(v, Number.isInteger(v) ? 0 : 2);
}

export function parsearDatosTabulares(
  texto: string,
  maxPuntos: number = MAX_PUNTOS_IMPORTADOS,
): ResultadoParseo {
  const lineas = lineasConContenido(texto);
  if (lineas.length === 0) {
    return { ok: false, error: 'No hay datos: pega o carga al menos dos filas con dos columnas numéricas.' };
  }

  // El separador lo decide la primera línea que se deje leer como par de números
  let separador: (typeof SEPARADORES)[number] | null = null;
  let indicePrimeraNumerica = -1;
  for (let i = 0; i < lineas.length && separador === null; i++) {
    for (const cand of SEPARADORES) {
      if (separadorSirve(cand.partir(lineas[i]))) {
        separador = cand;
        indicePrimeraNumerica = i;
        break;
      }
    }
  }

  if (separador === null) {
    return {
      ok: false,
      error: 'No se ha encontrado ninguna fila con dos columnas numéricas. Revisa que cada línea tenga dos números separados por tabulador, punto y coma, espacio o coma.',
    };
  }

  /*
   * La línea que va justo antes de la primera fila numérica es la cabecera SOLO si ninguno de
   * sus campos es un número. «edad;ingresos» lo es; «1;abc» no: es una fila de datos rota, y
   * hasta el 29/09/2026 se tomaba por cabecera, nombraba los ejes «1» y «abc» y no se contaba
   * como descartada (hallazgo 2454). Cualquier otra línea previa también es una fila que no se
   * ha podido leer, y se cuenta como tal en vez de desaparecer en silencio.
   */
  let nombres = { ...NOMBRES_POR_DEFECTO };
  let filasIgnoradas = 0;
  for (let i = 0; i < indicePrimeraNumerica; i++) {
    const campos = separador.partir(lineas[i]).map((c) => c.trim()).filter((c) => c !== '');
    const esCabecera = i === indicePrimeraNumerica - 1 && !campos.some((c) => esNumero(c));
    if (esCabecera) {
      if (campos.length >= 2) nombres = { x: campos[0], y: campos[1] };
    } else {
      filasIgnoradas += 1;
    }
  }

  const puntos: PuntoDato[] = [];
  const filasDatos = lineas.slice(indicePrimeraNumerica);
  let maxCampos = 0;

  for (const linea of filasDatos) {
    const campos = separador.partir(linea);
    const x = parseSpanishNumber(campos[0] ?? '');
    const y = parseSpanishNumber(campos[1] ?? '');
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      filasIgnoradas += 1;
      continue;
    }
    maxCampos = Math.max(maxCampos, campos.length);
    puntos.push({ x, y });
  }

  if (puntos.length < 2) {
    return {
      ok: false,
      error: `Solo se ha podido leer ${puntos.length === 1 ? 'una fila válida' : 'ninguna fila válida'}. Hacen falta al menos dos puntos para agrupar.`,
    };
  }

  // Coma como separador y más de dos campos: puede ser una coma decimal partida en dos
  let aviso: string | null = null;
  if (separador.id === 'coma' && maxCampos > 2) {
    aviso =
      `Las filas traen ${maxCampos} campos separados por comas y se han leído los dos primeros ` +
      `como X e Y (en la primera fila, X = ${citarValor(puntos[0].x)} e Y = ${citarValor(puntos[0].y)}). ` +
      'Si tus números llevan coma decimal, separa las columnas con punto y coma o tabulador.';
  }

  const recortadoA = puntos.length > maxPuntos ? maxPuntos : null;

  return {
    ok: true,
    datos: {
      puntos: recortadoA === null ? puntos : puntos.slice(0, maxPuntos),
      nombres,
      filasIgnoradas,
      totalLeidas: lineas.length,
      recortadoA,
      aviso,
    },
  };
}

// ===== Normalización y paso al lienzo =====

export function rangoDe(valores: number[]): Rango {
  let min = Infinity;
  let max = -Infinity;
  for (const v of valores) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

/** Min-max: el mínimo del eje va a 0 y el máximo a 1. Sin amplitud, al centro (0,5). */
export function normalizar(v: number, rango: Rango): number {
  const amplitud = rango.max - rango.min;
  return amplitud === 0 ? 0.5 : (v - rango.min) / amplitud;
}

/** Inversa de `normalizar`. Sin amplitud, todo el eje vale su único valor. */
export function desnormalizar(u: number, rango: Rango): number {
  return rango.min + u * (rango.max - rango.min);
}

/** El cuadrado del lienzo donde se dibujan los datos importados: lado px por unidad normalizada */
export interface MarcoDatos {
  x0: number;
  y0: number;
  lado: number;
}

export function marcoDatos(ancho: number, alto: number, margen: number): MarcoDatos {
  const lado = Math.min(ancho, alto) - 2 * margen;
  return { x0: (ancho - lado) / 2, y0: (alto - lado) / 2, lado };
}

export interface DatosEscalados {
  escalados: PuntoDato[];
  rangoX: Rango;
  rangoY: Rango;
}

/**
 * Lleva los valores reales al lienzo: cada eje se normaliza min-max a [0, 1] y los dos se
 * dibujan con los MISMOS píxeles por unidad, en un cuadrado centrado.
 *
 * Por qué min-max y por qué un cuadrado (hallazgo 2451 del Inspector, 29/09/2026). Hasta
 * entonces cada eje se estiraba a su hueco del lienzo, 540 px el X y 340 el Y, y el algoritmo
 * medía distancias en esos píxeles: el X pesaba 1,59 veces más que el Y (2,52 en d²) y el
 * agrupamiento cambiaba con solo intercambiar las columnas. Normalizar tiene que tratar a las
 * dos variables por igual. De las dos escalas de libro (min-max y z-score) se elige min-max
 * porque es la que ya enseña la app —el resumen de la importación da el mínimo y el máximo de
 * cada eje— y porque convierte el lienzo en el propio espacio normalizado: con el mismo número
 * de píxeles por unidad en los dos ejes, la distancia que se VE es la que usa el algoritmo, y
 * el «centroide más cercano» se puede comprobar a ojo. Su punto débil conocido, la
 * sensibilidad a un valor extremo, se ve en el propio dibujo (el resto se apiña en un lado).
 *
 * El eje Y se invierte porque en SVG la coordenada crece hacia abajo y en una gráfica
 * se espera que los valores altos queden arriba.
 */
export function escalarAlLienzo(
  puntos: PuntoDato[],
  ancho: number,
  alto: number,
  margen: number,
): DatosEscalados {
  const rangoX = rangoDe(puntos.map((p) => p.x));
  const rangoY = rangoDe(puntos.map((p) => p.y));
  const marco = marcoDatos(ancho, alto, margen);

  const escalados = puntos.map((p) => ({
    x: marco.x0 + normalizar(p.x, rangoX) * marco.lado,
    y: marco.y0 + marco.lado - normalizar(p.y, rangoY) * marco.lado,
  }));

  return { escalados, rangoX, rangoY };
}

/**
 * Del lienzo a las unidades de las columnas importadas: para dar los centroides en edades y
 * euros y no en píxeles (hallazgo 2450). La media es lineal, así que desnormalizar el
 * centroide del lienzo da exactamente la media del grupo en las variables originales.
 * Vale también para un punto añadido o arrastrado después: se lee con la misma escala.
 */
export function lienzoADatos(
  p: PuntoDato,
  marco: MarcoDatos,
  rangoX: Rango,
  rangoY: Rango,
): PuntoDato {
  return {
    x: desnormalizar((p.x - marco.x0) / marco.lado, rangoX),
    y: desnormalizar((marco.y0 + marco.lado - p.y) / marco.lado, rangoY),
  };
}
