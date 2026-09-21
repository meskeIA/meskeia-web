// Afinación de instrumentos — lógica pura (sin DOM ni audio)
//
// Cubre las dos cosas que un afinador cromático NO resuelve solo:
//
//  1. La afinación al aire de cada instrumento de cuerda, calculada a partir del La4 de
//     referencia. Hasta el 21/09/2026 las frecuencias estaban escritas a mano para 440 Hz,
//     así que elegir 442 Hz (orquesta) no cambiaba ni un decimal de la tabla de cuerdas.
//
//  2. La TRANSPOSICIÓN de los instrumentos que no suenan donde leen. Una trompeta o un
//     clarinete en si bemol que tocan su DO escrito hacen sonar un SI BEMOL real, así que
//     un afinador cromático les contesta con una nota distinta de la que están leyendo.
//     `notaEscritaDesdeReal` hace esa traducción en los dos sentidos.
//
// Convenio de `transposicion`: semitonos que hay que SUMAR a la nota escrita para obtener
// la que suena de verdad. Es negativa en casi todos los transpositores (suenan más grave
// de lo que leen): si bemol −2, mi bemol −9 (saxo alto), fa −7 (trompa).
//
// Afinaciones verificadas 2026-09: bandurria G#3-C#4-F#4-B4-E5-A5 y laúd español una octava
// por debajo; vihuela mexicana A3-D4-G4-B3-E4 (reentrante: la 3ª es la nota más aguda).

export const NOTAS_ES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
export const NOTAS_EN = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export type FamiliaInstrumento = 'cuerda' | 'viento' | 'tecla';

/** Nota como índice cromático (0 = Do … 11 = Si) más su octava científica. */
export interface NotaMusical {
  nota: number;
  octava: number;
}

export interface Afinacion {
  id: string;
  nombre: string;
  familia: FamiliaInstrumento;
  /** Semitonos que hay que sumar a la nota ESCRITA para obtener la que SUENA. 0 = no transpositor. */
  transposicion: number;
  /** Cuerdas al aire, de la 1ª a la última según la numeración propia del instrumento. */
  cuerdas?: NotaMusical[];
  /** Notas REALES (de concierto) con las que se afina un viento o una tecla. */
  referencias?: NotaMusical[];
  /** Aviso breve que la pantalla muestra junto al instrumento. */
  aviso?: string;
}

const n = (nota: number, octava: number): NotaMusical => ({ nota, octava });

// Índices: Do 0 · Do# 1 · Re 2 · Re# 3 · Mi 4 · Fa 5 · Fa# 6 · Sol 7 · Sol# 8 · La 9 · La# 10 · Si 11
export const AFINACIONES: Afinacion[] = [
  // --- Cuerda ---------------------------------------------------------------
  {
    id: 'guitarra',
    nombre: 'Guitarra estándar',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(4, 4), n(11, 3), n(7, 3), n(2, 3), n(9, 2), n(4, 2)],
  },
  {
    id: 'bajo',
    nombre: 'Bajo 4 cuerdas',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(7, 2), n(2, 2), n(9, 1), n(4, 1)],
  },
  {
    id: 'ukelele',
    nombre: 'Ukelele estándar',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(9, 4), n(4, 4), n(0, 4), n(7, 4)],
    aviso: 'Afinación reentrante: la 4ª cuerda (Sol4) es más aguda que la 3ª.',
  },
  {
    id: 'violin',
    nombre: 'Violín',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(4, 5), n(9, 4), n(2, 4), n(7, 3)],
  },
  {
    id: 'viola',
    nombre: 'Viola',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(9, 4), n(2, 4), n(7, 3), n(0, 3)],
  },
  {
    id: 'bandurria',
    nombre: 'Bandurria',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(9, 5), n(4, 5), n(11, 4), n(6, 4), n(1, 4), n(8, 3)],
    aviso: 'Seis órdenes dobles afinadas por cuartas. Cada par va al unísono exacto.',
  },
  {
    id: 'laud',
    nombre: 'Laúd español',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(9, 4), n(4, 4), n(11, 3), n(6, 3), n(1, 3), n(8, 2)],
    aviso: 'Misma afinación que la bandurria, una octava por debajo.',
  },
  {
    id: 'vihuela-mexicana',
    nombre: 'Vihuela mexicana',
    familia: 'cuerda',
    transposicion: 0,
    cuerdas: [n(4, 4), n(11, 3), n(7, 4), n(2, 4), n(9, 3)],
    aviso: 'Reentrante: la 3ª cuerda (Sol4) es la nota más aguda del instrumento.',
  },

  // --- Viento ---------------------------------------------------------------
  {
    id: 'trompeta',
    nombre: 'Trompeta (si bemol)',
    familia: 'viento',
    transposicion: -2,
    referencias: [n(10, 3), n(9, 4)],
  },
  {
    id: 'clarinete',
    nombre: 'Clarinete (si bemol)',
    familia: 'viento',
    transposicion: -2,
    referencias: [n(10, 3), n(9, 4)],
  },
  {
    id: 'saxo-alto',
    nombre: 'Saxo alto (mi bemol)',
    familia: 'viento',
    transposicion: -9,
    referencias: [n(10, 3), n(9, 4)],
  },
  {
    id: 'saxo-tenor',
    nombre: 'Saxo tenor (si bemol)',
    familia: 'viento',
    transposicion: -14,
    referencias: [n(10, 3), n(9, 4)],
  },
  {
    id: 'flauta',
    nombre: 'Flauta travesera',
    familia: 'viento',
    transposicion: 0,
    referencias: [n(9, 4), n(10, 4)],
    aviso: 'No transpositora: lo que lees es lo que suena.',
  },
  {
    id: 'trombon',
    nombre: 'Trombón',
    familia: 'viento',
    transposicion: 0,
    referencias: [n(10, 2), n(10, 3)],
    aviso: 'Leyendo en clave de fa suena tal como se escribe.',
  },

  // --- Tecla ----------------------------------------------------------------
  {
    id: 'piano',
    nombre: 'Piano',
    familia: 'tecla',
    transposicion: 0,
    referencias: [n(9, 4), n(0, 4)],
    aviso: 'Sirve para comprobar cuánto se ha ido una tecla, no para afinar el piano: son más de 200 cuerdas bajo tensión y el trabajo es de un técnico afinador.',
  },
];

export const AFINACION_POR_ID: Record<string, Afinacion> = AFINACIONES.reduce<Record<string, Afinacion>>(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {}
);

/** Índice cromático absoluto: Do0 = 0, La4 = 57. Permite sumar y restar semitonos sin casos raros. */
export function aSemitonoAbsoluto(nota: NotaMusical): number {
  return nota.octava * 12 + nota.nota;
}

export function desdeSemitonoAbsoluto(semitono: number): NotaMusical {
  return { nota: ((semitono % 12) + 12) % 12, octava: Math.floor(semitono / 12) };
}

/** Frecuencia de una nota, con el La4 de referencia configurable (440 estándar, 442 orquesta). */
export function frecuenciaDeNota(nota: number, octava: number, a4: number = 440): number {
  return a4 * Math.pow(2, (nota - 9 + (octava - 4) * 12) / 12);
}

export interface NotaDetectada extends NotaMusical {
  cents: number;
  frecuenciaExacta: number;
}

/** Nota más cercana a una frecuencia, con su desviación en cents (100 cents = 1 semitono). */
export function notaMasCercana(frecuencia: number, a4: number = 440): NotaDetectada {
  const semitonosDesdeA4 = 12 * Math.log2(frecuencia / a4);
  const semitonoRedondeado = Math.round(semitonosDesdeA4);
  const nota = ((semitonoRedondeado % 12) + 12 + 9) % 12; // +9 porque el La es el índice 9
  const octava = Math.floor((semitonoRedondeado + 9) / 12) + 4;
  const frecuenciaExacta = frecuenciaDeNota(nota, octava, a4);
  const cents = Math.round(1200 * Math.log2(frecuencia / frecuenciaExacta));

  return { nota, octava, cents, frecuenciaExacta };
}

/**
 * Traduce la nota que SUENA a la nota que el instrumentista LEE en su partitura.
 * Trompeta en si bemol (transposición −2): suena Si bemol 3 → lee Do 4.
 */
export function notaEscritaDesdeReal(real: NotaMusical, transposicion: number): NotaMusical {
  return desdeSemitonoAbsoluto(aSemitonoAbsoluto(real) - transposicion);
}

/** El camino inverso: qué suena cuando el instrumentista lee una nota concreta. */
export function notaRealDesdeEscrita(escrita: NotaMusical, transposicion: number): NotaMusical {
  return desdeSemitonoAbsoluto(aSemitonoAbsoluto(escrita) + transposicion);
}

/** Nombre en español con octava: `{ nota: 10, octava: 3 }` → «La#3». */
export function nombreNota(nota: NotaMusical): string {
  return `${NOTAS_ES[nota.nota]}${nota.octava}`;
}
