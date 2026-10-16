/**
 * Intensidades máximas admisibles de los conductores de cobre en instalaciones interiores.
 * REBT, ITC-BT-19, apartado 2.2.3, Tabla 1: «Intensidades admisibles (A) al aire 40 °C.
 * Nº de conductores con carga y naturaleza del aislamiento».
 *
 * Creado el 16/10/2026 a raíz de un mensaje de contacto («es imposible que 40 A pasen por un
 * cable de 1,5»): `calculadora-seccion-cable` solo aplicaba el criterio de caída de tensión, y
 * en un tramo corto con mucha corriente recomendaba 1,5 mm² para 40 A. Lo que decide en ese
 * caso es el calentamiento del conductor, que es lo que da esta tabla.
 *
 * Transcrita columna a columna de la imagen de la tabla en el texto de la ITC-BT-19, con la
 * cabecera de cada método leída en tiras verticales para no desplazar ninguna columna.
 *
 * Lo que la tabla NO recoge, y por eso la app lo dice en vez de calcularlo:
 *   · Aluminio: la Tabla 1 de la ITC solo trae cobre.
 *   · Agrupamiento de varios circuitos, otras temperaturas ambiente y cables enterrados: la
 *     ITC remite a la UNE 20460-5-523 y sus factores de corrección. Los valores de aquí son
 *     para UN circuito al aire a 40 °C.
 */

export const INTENSIDADES_ITC_BT_19_META = {
  fuente: 'Reglamento Electrotécnico para Baja Tensión (RD 842/2002), ITC-BT-19, apartado 2.2.3, Tabla 1',
  verificado: '2026-10-16',
  vigencia: 'vigente',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099',
  nota: 'Cobre, un solo circuito, aire a 40 °C. Para agrupamientos, otras temperaturas o cables enterrados la ITC remite a la UNE 20460-5-523.',
};

/** Secciones de la Tabla 1, en mm² */
export const SECCIONES_TABLA_ITC_BT_19 = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300,
] as const;

/**
 * Las 11 columnas de la Tabla 1 (cobre), en el orden de SECCIONES_TABLA_ITC_BT_19.
 * `null` es una celda vacía o con guion en el original: la columna no tiene valor para esa sección.
 */
export const COLUMNAS_ITC_BT_19: Record<number, (number | null)[]> = {
  1: [11, 15, 20, 25, 34, 45, 59, null, null, null, null, null, null, null, null, null],
  2: [11.5, 16, 21, 27, 37, 49, 64, 77, 94, null, null, null, null, null, null, null],
  3: [13, 17.5, 23, 30, 40, 54, 70, 86, 103, null, null, null, null, null, null, null],
  4: [13.5, 18.5, 24, 32, 44, 59, 77, 96, 117, 149, 180, 208, 236, 268, 315, 360],
  5: [15, 21, 27, 36, 50, 66, 84, 104, 125, 160, 194, 225, 260, 297, 350, 404],
  6: [16, 22, 30, 37, 52, 70, 88, 110, 133, 171, 207, 240, 278, 317, 374, 423],
  7: [null, null, null, null, null, null, 96, 119, 145, 188, 230, 267, 310, 354, 419, 484],
  8: [18, 25, 34, 44, 60, 80, 106, 131, 159, 202, 245, 284, 338, 386, 455, 524],
  9: [21, 29, 38, 49, 68, 91, 116, 144, 175, 224, 271, 314, 363, 415, 490, 565],
  10: [24, 33, 45, 57, 76, 105, 123, 154, 188, 244, 296, 348, 404, 464, 552, 640],
  11: [null, null, null, null, null, null, 166, 206, 250, 321, 391, 455, 525, 601, 711, 821],
};

export type MetodoInstalacion = 'A' | 'A2' | 'B' | 'B2' | 'C' | 'E' | 'F' | 'G';
export type Aislamiento = 'PVC' | 'XLPE';
export type ConductoresCargados = 2 | 3;

interface Asignacion {
  columna: number;
  /** Nota 1) de la tabla: «A partir de 25 mm² de sección» */
  seccionMinima?: number;
}

export interface MetodoTabla {
  id: MetodoInstalacion;
  descripcion: string;
  /** Columna por aislamiento y número de conductores cargados; ausente = la tabla no lo recoge */
  columnas: Record<Aislamiento, Partial<Record<ConductoresCargados, Asignacion>>>;
}

/** Filas de la Tabla 1 con la columna que corresponde a cada combinación */
export const METODOS_ITC_BT_19: MetodoTabla[] = [
  {
    id: 'A',
    descripcion: 'Conductores aislados en tubos empotrados en paredes aislantes',
    columnas: { PVC: { 3: { columna: 2 }, 2: { columna: 3 } }, XLPE: { 3: { columna: 5 }, 2: { columna: 6 } } },
  },
  {
    id: 'A2',
    descripcion: 'Cables multiconductores en tubos empotrados en paredes aislantes',
    columnas: { PVC: { 3: { columna: 1 }, 2: { columna: 2 } }, XLPE: { 3: { columna: 4 }, 2: { columna: 5 } } },
  },
  {
    id: 'B',
    descripcion: 'Conductores aislados en tubos en montaje superficial o empotrados en obra (incluye canaletas)',
    columnas: { PVC: { 3: { columna: 4 }, 2: { columna: 5 } }, XLPE: { 3: { columna: 8 }, 2: { columna: 9 } } },
  },
  {
    id: 'B2',
    descripcion: 'Cables multiconductores en tubos en montaje superficial o empotrados en obra',
    columnas: { PVC: { 3: { columna: 3 }, 2: { columna: 4 } }, XLPE: { 3: { columna: 6 }, 2: { columna: 8 } } },
  },
  {
    id: 'C',
    descripcion: 'Cables multiconductores directamente sobre la pared o en bandeja no perforada',
    columnas: { PVC: { 3: { columna: 5 }, 2: { columna: 6 } }, XLPE: { 3: { columna: 8 }, 2: { columna: 9 } } },
  },
  {
    id: 'E',
    descripcion: 'Cables multiconductores al aire libre o en bandeja perforada, separados de la pared al menos 0,3 veces su diámetro',
    columnas: { PVC: { 3: { columna: 6 }, 2: { columna: 8 } }, XLPE: { 3: { columna: 9 }, 2: { columna: 10 } } },
  },
  {
    id: 'F',
    descripcion: 'Cables unipolares en contacto mutuo o en bandeja perforada, separados de la pared al menos un diámetro',
    columnas: { PVC: { 3: { columna: 7 } }, XLPE: { 3: { columna: 10, seccionMinima: 25 } } },
  },
  {
    id: 'G',
    descripcion: 'Cables unipolares separados entre sí al menos un diámetro',
    columnas: { PVC: { 3: { columna: 9, seccionMinima: 25 } }, XLPE: { 3: { columna: 11 } } },
  },
];

/**
 * Intensidad admisible en A de una sección para un método, aislamiento y número de conductores
 * cargados, o `null` si la tabla no da valor para esa combinación.
 */
export function intensidadAdmisible(
  metodo: MetodoInstalacion,
  aislamiento: Aislamiento,
  conductores: ConductoresCargados,
  seccion: number,
): number | null {
  const fila = METODOS_ITC_BT_19.find((m) => m.id === metodo);
  const asignacion = fila?.columnas[aislamiento][conductores];
  if (!asignacion) return null;
  if (asignacion.seccionMinima !== undefined && seccion < asignacion.seccionMinima) return null;
  const indice = SECCIONES_TABLA_ITC_BT_19.indexOf(seccion as (typeof SECCIONES_TABLA_ITC_BT_19)[number]);
  if (indice === -1) return null;
  return COLUMNAS_ITC_BT_19[asignacion.columna][indice];
}
