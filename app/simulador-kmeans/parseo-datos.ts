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
 * Los números pasan por `parseSpanishNumber`, que admite «12,5» y «12.5». La única
 * ambigüedad irreducible es el valor con exactamente tres decimales tras un punto
 * («1.234» se lee como mil doscientos treinta y cuatro, no como 1,234); está avisado
 * en la interfaz.
 */

import { parseSpanishNumber } from '@/lib';

export interface PuntoDato {
  x: number;
  y: number;
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

  // Si por delante de la primera fila numérica hay exactamente una línea, es la cabecera
  let nombres = { ...NOMBRES_POR_DEFECTO };
  if (indicePrimeraNumerica === 1) {
    const cabecera = separador.partir(lineas[0]).map((c) => c.trim()).filter((c) => c !== '');
    if (cabecera.length >= 2) {
      nombres = { x: cabecera[0], y: cabecera[1] };
    }
  }

  const puntos: PuntoDato[] = [];
  let filasIgnoradas = 0;
  const filasDatos = lineas.slice(indicePrimeraNumerica);

  for (const linea of filasDatos) {
    const campos = separador.partir(linea);
    const x = parseSpanishNumber(campos[0] ?? '');
    const y = parseSpanishNumber(campos[1] ?? '');
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      filasIgnoradas += 1;
      continue;
    }
    puntos.push({ x, y });
  }

  if (puntos.length < 2) {
    return {
      ok: false,
      error: `Solo se ha podido leer ${puntos.length === 1 ? 'una fila válida' : 'ninguna fila válida'}. Hacen falta al menos dos puntos para agrupar.`,
    };
  }

  const recortadoA = puntos.length > maxPuntos ? maxPuntos : null;
  const totalLeidas = filasDatos.length + (indicePrimeraNumerica === 1 ? 1 : 0);

  return {
    ok: true,
    datos: {
      puntos: recortadoA === null ? puntos : puntos.slice(0, maxPuntos),
      nombres,
      filasIgnoradas,
      totalLeidas,
      recortadoA,
    },
  };
}

export interface DatosEscalados {
  escalados: PuntoDato[];
  rangoX: { min: number; max: number };
  rangoY: { min: number; max: number };
}

/**
 * Lleva los valores reales al sistema de coordenadas del lienzo, cada eje por separado.
 *
 * Escalar cada eje a su propio rango equivale a normalizar los datos, que es justo lo que
 * k-means necesita cuando las dos variables tienen magnitudes distintas (una edad y un
 * salario, por ejemplo): sin normalizar, la variable de números grandes domina la distancia
 * euclídea y el agrupamiento la obedece solo a ella.
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
  const xs = puntos.map((p) => p.x);
  const ys = puntos.map((p) => p.y);
  const rangoX = { min: Math.min(...xs), max: Math.max(...xs) };
  const rangoY = { min: Math.min(...ys), max: Math.max(...ys) };

  const utilAncho = ancho - 2 * margen;
  const utilAlto = alto - 2 * margen;
  const amplitudX = rangoX.max - rangoX.min;
  const amplitudY = rangoY.max - rangoY.min;

  const escalados = puntos.map((p) => ({
    // Con amplitud 0 (todos los valores iguales en ese eje) se centra, que es lo único honesto
    x: amplitudX === 0 ? margen + utilAncho / 2 : margen + ((p.x - rangoX.min) / amplitudX) * utilAncho,
    y: amplitudY === 0 ? margen + utilAlto / 2 : margen + utilAlto - ((p.y - rangoY.min) / amplitudY) * utilAlto,
  }));

  return { escalados, rangoX, rangoY };
}
