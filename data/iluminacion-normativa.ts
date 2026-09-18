/**
 * Niveles de iluminación exigidos o recomendados en lugares de trabajo.
 *
 * Creado el 18/09/2026 a partir del hallazgo 911 del Inspector: estos umbrales vivían
 * escritos a mano en el JSX de `app/luxometro/`, sin edición de la norma, sin fecha de
 * verificación y con uno mal atribuido — la app daba 100 lx como mínimo del RD para
 * «zonas de paso» cuando el RD fija 25 lx (uso ocasional) y 50 lx (uso habitual) para
 * vías de circulación, y los 100 lx son otra fila de la tabla.
 *
 * Son dos cosas distintas y conviene no mezclarlas:
 *   · El RD 486/1997 es el MÍNIMO LEGAL exigible en España (obligación del empresario).
 *   · La UNE-EN 12464-1 es una norma técnica de BUENA PRÁCTICA, no de cumplimiento
 *     obligatorio por sí misma, y sus valores son bastante más altos.
 * Confundirlas lleva a decir que se incumple la ley cuando solo se está por debajo de la
 * recomendación técnica.
 */

export const ILUMINACION_RD486_META = {
  fuente: 'Real Decreto 486/1997, Anexo IV (disposiciones mínimas de seguridad y salud en los lugares de trabajo)',
  verificado: '2026-09-18',
  vigencia: 'vigente',
  urlOficial: 'https://www.boe.es/buscar/act.php?id=BOE-A-1997-8669',
  nota: 'Niveles MÍNIMOS exigibles. El propio Anexo IV obliga a DUPLICARLOS cuando hay riesgo apreciable de caídas o choques, cuando un error de apreciación visual puede suponer un peligro, o cuando el contraste entre el objeto y el fondo es muy débil.',
};

export const ILUMINACION_EN12464_META = {
  fuente: 'UNE-EN 12464-1 · Iluminación de los lugares de trabajo. Parte 1: lugares de trabajo en interiores',
  verificado: '2026-09-18',
  vigencia: 'edición de 2021',
  urlOficial: 'https://www.une.org/encuentra-tu-norma/busca-tu-norma/norma?c=N0068537',
  nota: 'Norma técnica de buena práctica, no de cumplimiento obligatorio por sí misma. Los valores son iluminancias mantenidas (Em) sobre el área de la tarea, no sobre el suelo.',
};

export interface NivelIluminacion {
  /** Zona o tarea, tal como la nombra la norma */
  zona: string;
  /** Iluminancia en lux */
  lux: number;
  /** Aclaración cuando el nombre de la norma no basta para saber dónde aplica */
  nota?: string;
}

/**
 * RD 486/1997, Anexo IV — niveles mínimos de iluminación, en el orden de la tabla oficial.
 * Los cuatro primeros son por exigencia visual de la TAREA; los cuatro últimos, por uso
 * del espacio. No son escalones de una misma escala: se elige la fila que describe el sitio.
 */
export const NIVELES_MINIMOS_RD486: NivelIluminacion[] = [
  { zona: 'Tareas con bajas exigencias visuales', lux: 100 },
  { zona: 'Tareas con exigencias visuales moderadas', lux: 200 },
  { zona: 'Tareas con exigencias visuales altas', lux: 500 },
  { zona: 'Tareas con exigencias visuales muy altas', lux: 1000 },
  { zona: 'Áreas o locales de uso ocasional', lux: 50 },
  { zona: 'Áreas o locales de uso habitual', lux: 100 },
  { zona: 'Vías de circulación de uso ocasional', lux: 25, nota: 'Pasillos y escaleras por los que se pasa de vez en cuando' },
  { zona: 'Vías de circulación de uso habitual', lux: 50, nota: 'El mínimo legal de un pasillo de paso continuo, no 100 lx' },
];

/**
 * UNE-EN 12464-1 — iluminancia mantenida (Em) recomendada para los puestos de oficina
 * más habituales. Es la tabla que se cita cuando se habla de «los 500 lx de la oficina».
 */
export const NIVELES_RECOMENDADOS_EN12464: NivelIluminacion[] = [
  { zona: 'Archivo', lux: 200 },
  { zona: 'Copia, circulación entre puestos', lux: 300 },
  { zona: 'Mostrador de recepción', lux: 300 },
  { zona: 'Escritura, lectura y trabajo con pantalla', lux: 500, nota: 'Con control del deslumbramiento de las pantallas' },
  { zona: 'Salas de reuniones y conferencias', lux: 500 },
  { zona: 'Dibujo técnico', lux: 750 },
];
