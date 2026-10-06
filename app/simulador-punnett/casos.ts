/**
 * Casos para clase — la tarea asignable de `simulador-punnett`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la genética está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]): un cruce mal resuelto no rompe nada,
 * simplemente corrige mal al alumno. Aquí no hay React ni DOM, solo funciones puras, y se prueba
 * sin navegador (tests/apps/simulador-punnett.spec.ts).
 *
 * ── EL MOTOR ES EL DE LA APP ─────────────────────────────────────────────────
 *
 * `gametosMonohibrido`, `gametosB`, `ordenarAlelos`, `cruzarMonohibrido`, `gametosDihibridoP`,
 * `cruzarDihibrido`, `calcularProporciones`, `nombreFenotipo` y `porcentaje` se MOVIERON aquí
 * desde `page.tsx`, tal cual, y la página las importa de este fichero. Hay una sola
 * implementación: si la corrección contara las casillas de un modo y el cuadro de otro, la app
 * suspendería una respuesta que ella misma pinta.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **Las proporciones son sobre el TOTAL de la descendencia**, es decir, sobre las casillas del
 *    cuadro: 4 en el monohíbrido y 16 en el dihíbrido, también cuando un progenitor es
 *    homocigoto y repite gameto (la app pinta AA como «A, A» y no colapsa la fila). Repetir el
 *    gameto no cambia ningún porcentaje, pero sí el recuento de casillas, y por eso ningún caso
 *    pregunta «cuántas casillas».
 *
 * ⚠️ **Dominancia completa.** Es lo único que simula la app: AA y Aa dan el mismo fenotipo. La
 *    dominancia incompleta y la codominancia (ABO) viven en `simulador-genetica`, con sus propios
 *    casos; aquí no se pregunta por ellas.
 *
 * ⚠️ **Genotipo ≠ fenotipo.** Cada caso dice cuál de los dos pide, y la etiqueta de la casilla lo
 *    repite: confundir «heterocigotos» (genotipo Aa, 50 % en Aa × Aa) con «fenotipo dominante»
 *    (AA + Aa, 75 %) es el error clásico, y el enunciado no debe ayudar a cometerlo.
 *
 * ⚠️ **Las letras son las de la app**: A/a para el primer carácter y B/b para el segundo. Los
 *    casos aplicados dicen qué alelo es cada letra, para que el alumno pueda montar el cruce en
 *    los desplegables tal cual.
 *
 * ⚠️ **Respuesta EXACTA, sin el 1 % de margen.** Todas las respuestas son múltiplos de 6,25 % o
 *    números enteros, y el redondeo de 6,25 a «6» es justo el defecto que el Inspector cazó en
 *    esta app (hallazgo 751): un margen proporcional lo daría por bueno. La tolerancia es media
 *    centésima, el ruido de escribir la cifra. Se admite la fracción («3/4» vale 75 %) y quien
 *    escribe el tanto por uno (0,75) recibe un aviso propio, no un «incorrecto» a secas.
 */

import { formatNumber } from '@/lib';

/* ─────────────────────────── El motor de la app (movido de page.tsx) ─────────────────────────── */

export type Alelo = 'A' | 'a' | 'B' | 'b';
export type GenotipoPar = 'AA' | 'Aa' | 'aa';
export type GenotipoParB = 'BB' | 'Bb' | 'bb';
export type TipoHerencia = 'monohibrido' | 'dihibrido';

export type Fenotipo =
  | 'dominante'
  | 'recesivo'
  | 'dominante-dominante'
  | 'dominante-recesivo'
  | 'recesivo-dominante'
  | 'recesivo-recesivo';

export interface CeldaPunnett {
  genotipo: string;
  fenotipo: Fenotipo;
  color: string;
  gametoP1: string;
  gametoP2: string;
}

export const GENOTIPOS_A: GenotipoPar[] = ['AA', 'Aa', 'aa'];
export const GENOTIPOS_B: GenotipoParB[] = ['BB', 'Bb', 'bb'];

/** Espacio duro (U+00A0) entre la cifra y el «%» (CLAUDE.md global §2, 25/09/2026). */
export const ESPACIO_DURO = ' ';

/**
 * Porcentaje en formato español, con decimales SOLO cuando hacen falta: «25 %», «12,5 %»,
 * «6,25 %». Con Math.round a secas, 1/16 salía «6%» y 2/16 «13%», y la columna sumaba 101 %
 * en el dihíbrido clásico — en una página que pide al alumno verificar justamente esa suma
 * (hallazgo 751). Y 12,5 % es un dato que hay que poder copiar al examen.
 */
export const porcentaje = (v: number): string => {
  const t = formatNumber(v, 2);
  const cifra = t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t;
  // Con el «%» y separado por espacio DURO (U+00A0), como el «€»: con un espacio normal el «%»
  // saltaba solo a la línea siguiente («… 1 (6,25» / «%) recesivo-recesivo.»), hallazgo 2588.
  return `${cifra}${ESPACIO_DURO}%`;
};

/**
 * Los dos gametos de un genotipo.
 *
 * La validación vive en la entrada, no aquí: los <select> pasaban el valor con un `as
 * GenotipoPar` sin comprobar, y esta función terminaba devolviendo [a, a] para cualquier cosa
 * que no fuese AA ni Aa. Un valor desconocido —el navegador rechaza la opción y el desplegable
 * sigue enseñando «AA», pero React recibe cadena vacía— hacía que la rejilla se calculase con
 * un progenitor homocigoto recesivo: lo que se ve y lo que se calcula dejaban de ser lo mismo,
 * sin ningún aviso (hallazgo 754). Con `esGenotipoPar` en el onChange, lo que no se reconoce no
 * entra en el estado y el valor anterior se mantiene, así que aquí el tipo ya está garantizado.
 */
export function gametosMonohibrido(genotipo: GenotipoPar): [Alelo, Alelo] {
  if (genotipo === 'AA') return ['A', 'A'];
  if (genotipo === 'Aa') return ['A', 'a'];
  return ['a', 'a'];
}

export function gametosB(genotipo: GenotipoParB): [string, string] {
  if (genotipo === 'BB') return ['B', 'B'];
  if (genotipo === 'Bb') return ['B', 'b'];
  return ['b', 'b'];
}

export function ordenarAlelos(a: string, b: string): string {
  // Poner mayúscula primero
  if (a === a.toUpperCase() && b === b.toLowerCase()) return `${a}${b}`;
  if (b === b.toUpperCase() && a === a.toLowerCase()) return `${b}${a}`;
  return `${a}${b}`;
}

function colorMonohibrido(fenotipo: 'dominante' | 'recesivo'): string {
  return fenotipo === 'dominante' ? '#1a5278' : '#cccccc';
}

export function cruzarMonohibrido(p1: GenotipoPar, p2: GenotipoPar): CeldaPunnett[] {
  const g1 = gametosMonohibrido(p1);
  const g2 = gametosMonohibrido(p2);
  const celdas: CeldaPunnett[] = [];
  for (const a1 of g1) {
    for (const a2 of g2) {
      const genotipo = ordenarAlelos(a1, a2);
      const fenotipo: 'dominante' | 'recesivo' = genotipo.includes('A') ? 'dominante' : 'recesivo';
      // Determinar sub-tipo para color
      let colorClass: CeldaPunnett['fenotipo'];
      if (genotipo === 'AA') colorClass = 'dominante';
      else if (genotipo === 'Aa') colorClass = 'dominante'; // heterocigoto es dominante fenotípicamente
      else colorClass = 'recesivo';
      celdas.push({
        genotipo,
        fenotipo: colorClass,
        color: colorMonohibrido(fenotipo),
        gametoP1: a1,
        gametoP2: a2,
      });
    }
  }
  return celdas;
}

export function gametosDihibridoP(gA: GenotipoPar, gB: GenotipoParB): string[] {
  const aA = gametosMonohibrido(gA);
  const aB = gametosB(gB);
  const result: string[] = [];
  for (const a of aA) for (const b of aB) result.push(`${a}${b}`);
  return result;
}

export function cruzarDihibrido(
  p1gA: GenotipoPar,
  p1gB: GenotipoParB,
  p2gA: GenotipoPar,
  p2gB: GenotipoParB
): CeldaPunnett[] {
  const g1 = gametosDihibridoP(p1gA, p1gB);
  const g2 = gametosDihibridoP(p2gA, p2gB);
  const celdas: CeldaPunnett[] = [];
  for (const gam1 of g1) {
    for (const gam2 of g2) {
      // Combinar gametos: ordenar loci A y B
      const a1 = gam1[0];
      const b1 = gam1[1];
      const a2 = gam2[0];
      const b2 = gam2[1];
      const genoA = ordenarAlelos(a1, a2);
      const genoB = ordenarAlelos(b1, b2);
      const genotipo = `${genoA}${genoB}`;
      const tieneA = genoA.includes('A');
      const tieneB = genoB.includes('B');
      let fenotipo: CeldaPunnett['fenotipo'];
      if (tieneA && tieneB) fenotipo = 'dominante-dominante';
      else if (tieneA && !tieneB) fenotipo = 'dominante-recesivo';
      else if (!tieneA && tieneB) fenotipo = 'recesivo-dominante';
      else fenotipo = 'recesivo-recesivo';
      const colorMap: Record<CeldaPunnett['fenotipo'], string> = {
        'dominante': '#1a5278',
        'recesivo': '#cccccc',
        'dominante-dominante': '#1a5278',
        'dominante-recesivo': '#48A9A6',
        'recesivo-dominante': '#7FB3D3',
        'recesivo-recesivo': '#cccccc',
      };
      celdas.push({
        genotipo,
        fenotipo,
        color: colorMap[fenotipo],
        gametoP1: gam1,
        gametoP2: gam2,
      });
    }
  }
  return celdas;
}

export function calcularProporciones(celdas: CeldaPunnett[]): {
  genotipicas: Record<string, number>;
  fenotipicas: Record<string, number>;
} {
  const genotipicas: Record<string, number> = {};
  const fenotipicas: Record<string, number> = {};
  for (const c of celdas) {
    genotipicas[c.genotipo] = (genotipicas[c.genotipo] ?? 0) + 1;
    fenotipicas[c.fenotipo] = (fenotipicas[c.fenotipo] ?? 0) + 1;
  }
  return { genotipicas, fenotipicas };
}

export function nombreFenotipo(key: string): string {
  const map: Record<string, string> = {
    'dominante': 'Dominante (A_)',
    'recesivo': 'Recesivo (aa)',
    'dominante-dominante': 'Doble dominante (A_B_)',
    'dominante-recesivo': 'Dom. A / Rec. B (A_bb)',
    'recesivo-dominante': 'Rec. A / Dom. B (aaB_)',
    'recesivo-recesivo': 'Doble recesivo (aabb)',
  };
  return map[key] ?? key;
}

/* ─────────────────────────── Qué se pregunta ─────────────────────────── */

/**
 * La pregunta de un caso. Todas se responden leyendo el cuadro que pinta la app con el cruce
 * montado: el porcentaje de un fenotipo o de un genotipo, el número esperado de individuos en
 * una descendencia de tamaño dado, cuántos genotipos distintos salen o cuántos tipos de gametos
 * distintos forma un progenitor.
 */
export type Pregunta =
  | { que: 'porcentaje-fenotipo'; fenotipo: Fenotipo }
  | { que: 'porcentaje-genotipo'; genotipo: string }
  | { que: 'individuos-fenotipo'; fenotipo: Fenotipo; poblacion: number }
  | { que: 'individuos-genotipo'; genotipo: string; poblacion: number }
  | { que: 'genotipos-distintos' }
  | { que: 'gametos-distintos'; progenitor: 1 | 2 };

/**
 * El cruce de un caso. Unión discriminada por `tipo` con literales en los dos miembros: sin eso
 * TypeScript no estrecha y `datos.p1B` compilaría en el monohíbrido.
 */
export type DatosCaso =
  | { tipo: 'monohibrido'; p1: GenotipoPar; p2: GenotipoPar; pregunta: Pregunta }
  | {
      tipo: 'dihibrido';
      p1A: GenotipoPar;
      p1B: GenotipoParB;
      p2A: GenotipoPar;
      p2B: GenotipoParB;
      pregunta: Pregunta;
    };

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** ¿La respuesta de este caso es un porcentaje? Lo usa la corrección para la fracción y el tanto por uno. */
export function esPorcentaje(datos: DatosCaso): boolean {
  return datos.pregunta.que === 'porcentaje-fenotipo' || datos.pregunta.que === 'porcentaje-genotipo';
}

/* ─────────────────────────── Utilidades de presentación ─────────────────────────── */

const esGenA = (v: unknown): v is GenotipoPar => GENOTIPOS_A.includes(v as GenotipoPar);
const esGenB = (v: unknown): v is GenotipoParB => GENOTIPOS_B.includes(v as GenotipoParB);

/** Cifra entera o con los decimales justos, en formato español: «150», «56,25». */
function numero(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: 2 });
}

function mcd(a: number, b: number): number {
  return b === 0 ? a : mcd(b, a % b);
}

/** «3/4», «9/16», «1» — la fracción irreducible de n casillas sobre un total. */
function fraccion(n: number, total: number): string {
  if (n === 0) return '0';
  const d = mcd(n, total) || 1;
  return total / d === 1 ? `${n / d}` : `${n / d}/${total / d}`;
}

/** Cómo se dice un fenotipo en un enunciado o un desarrollo: «fenotipo recesivo (aa)». */
function fenotipoEnTexto(f: Fenotipo): string {
  const textos: Record<Fenotipo, string> = {
    'dominante': 'fenotipo dominante (A_)',
    'recesivo': 'fenotipo recesivo (aa)',
    'dominante-dominante': 'fenotipo dominante en los dos caracteres (A_B_)',
    'dominante-recesivo': 'fenotipo dominante en A y recesivo en B (A_bb)',
    'recesivo-dominante': 'fenotipo recesivo en A y dominante en B (aaB_)',
    'recesivo-recesivo': 'fenotipo recesivo en los dos caracteres (aabb)',
  };
  return textos[f];
}

/** El cruce como se escribe en clase: «Aa × Aa», «AaBb × Aabb». */
export function textoCruce(datos: DatosCaso): string {
  return datos.tipo === 'monohibrido'
    ? `${datos.p1} × ${datos.p2}`
    : `${datos.p1A}${datos.p1B} × ${datos.p2A}${datos.p2B}`;
}

/** Formatea una respuesta con su unidad: «56,25 %», «150 semillas», «9». */
export function textoRespuesta(valor: number, datos: DatosCaso, unidad = ''): string {
  if (!Number.isFinite(valor)) return '—';
  if (esPorcentaje(datos)) return porcentaje(valor);
  return unidad ? `${numero(valor)} ${unidad}` : numero(valor);
}

/* ─────────────────────────── Resolver un caso ─────────────────────────── */

/**
 * Recalcula la respuesta de un caso desde sus datos, con el MISMO motor que pinta el cuadro, y
 * explica cómo se llega a ella. No mira `respuesta`. Nunca lanza: un dato fuera de lugar
 * devuelve `{ ok: false }`.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const fallo = (error: string): Resolucion => ({ ok: false, valor: NaN, pasos: [], error });

  // Los genotipos llegan tipados, pero un caso escrito a mano en un test (o un dato corrupto)
  // podría traer otra cosa: el motor devolvería [a, a] en silencio (hallazgo 754).
  let celdas: CeldaPunnett[];
  let gametos1: string[];
  let gametos2: string[];
  if (datos.tipo === 'monohibrido') {
    if (!esGenA(datos.p1) || !esGenA(datos.p2)) return fallo('Genotipo no válido.');
    celdas = cruzarMonohibrido(datos.p1, datos.p2);
    gametos1 = [...gametosMonohibrido(datos.p1)];
    gametos2 = [...gametosMonohibrido(datos.p2)];
  } else {
    if (!esGenA(datos.p1A) || !esGenA(datos.p2A) || !esGenB(datos.p1B) || !esGenB(datos.p2B)) {
      return fallo('Genotipo no válido.');
    }
    celdas = cruzarDihibrido(datos.p1A, datos.p1B, datos.p2A, datos.p2B);
    gametos1 = gametosDihibridoP(datos.p1A, datos.p1B);
    gametos2 = gametosDihibridoP(datos.p2A, datos.p2B);
  }

  const total = celdas.length;
  const distintos = (g: string[]) => [...new Set(g)];
  const pasos: string[] = [
    `Cruce ${textoCruce(datos)}. Gametos del progenitor 1: ${distintos(gametos1).join(', ')}; ` +
      `del progenitor 2: ${distintos(gametos2).join(', ')}.`,
    `El cuadro tiene ${gametos1.length} × ${gametos2.length} = ${total} casillas, todas igual de probables.`,
  ];

  const { genotipicas, fenotipicas } = calcularProporciones(celdas);
  const p = datos.pregunta;

  switch (p.que) {
    case 'porcentaje-fenotipo':
    case 'individuos-fenotipo': {
      const n = fenotipicas[p.fenotipo] ?? 0;
      const genotiposDelFenotipo = Object.keys(genotipicas).filter(
        (g) => celdas.find((c) => c.genotipo === g)?.fenotipo === p.fenotipo,
      );
      pasos.push(
        n === 0
          ? `Ninguna casilla tiene el ${fenotipoEnTexto(p.fenotipo)}.`
          : `Tienen el ${fenotipoEnTexto(p.fenotipo)} ${n} de ${total} casillas (${genotiposDelFenotipo
              .map((g) => `${genotipicas[g]} ${g}`)
              .join(' + ')}): ${fraccion(n, total)} de la descendencia.`,
      );
      const pct = (n / total) * 100;
      if (p.que === 'porcentaje-fenotipo') {
        pasos.push(`${fraccion(n, total)} = ${porcentaje(pct)}.`);
        return { ok: true, valor: pct, pasos };
      }
      if (!(Number.isInteger(p.poblacion) && p.poblacion > 0)) return fallo('Población no válida.');
      const individuos = (n / total) * p.poblacion;
      pasos.push(`Valor esperado: ${fraccion(n, total)} × ${numero(p.poblacion)} = ${numero(individuos)}.`);
      return { ok: true, valor: individuos, pasos };
    }
    case 'porcentaje-genotipo':
    case 'individuos-genotipo': {
      // Un genotipo mal escrito («aA», «AbAb») no está en el cuadro y saldría 0 sin avisar.
      const patron = datos.tipo === 'monohibrido' ? /^(AA|Aa|aa)$/ : /^(AA|Aa|aa)(BB|Bb|bb)$/;
      if (!patron.test(p.genotipo)) return fallo('Genotipo no válido.');
      const n = genotipicas[p.genotipo] ?? 0;
      pasos.push(
        n === 0
          ? `Ninguna casilla tiene el genotipo ${p.genotipo}.`
          : `El genotipo ${p.genotipo} aparece en ${n} de ${total} casillas: ${fraccion(n, total)} de la descendencia.`,
      );
      const pct = (n / total) * 100;
      if (p.que === 'porcentaje-genotipo') {
        pasos.push(`${fraccion(n, total)} = ${porcentaje(pct)}.`);
        return { ok: true, valor: pct, pasos };
      }
      if (!(Number.isInteger(p.poblacion) && p.poblacion > 0)) return fallo('Población no válida.');
      const individuos = (n / total) * p.poblacion;
      pasos.push(`Valor esperado: ${fraccion(n, total)} × ${numero(p.poblacion)} = ${numero(individuos)}.`);
      return { ok: true, valor: individuos, pasos };
    }
    case 'genotipos-distintos': {
      const lista = Object.keys(genotipicas);
      pasos.push(`Genotipos que aparecen en el cuadro: ${lista.join(', ')}.`);
      pasos.push(`Son ${lista.length} genotipos distintos.`);
      return { ok: true, valor: lista.length, pasos };
    }
    case 'gametos-distintos': {
      const g = p.progenitor === 1 ? gametos1 : gametos2;
      const tipos = distintos(g);
      // Aquí la pregunta ES el primer paso, así que el desarrollo se escribe entero y aparte.
      return {
        ok: true,
        valor: tipos.length,
        pasos: [
          `Cruce ${textoCruce(datos)}. Cada gameto lleva UN alelo de cada gen (2.ª ley de Mendel).`,
          `Combinaciones del progenitor ${p.progenitor}: ${g.join(', ')}.`,
          tipos.length === g.length
            ? `Las ${g.length} son distintas: ${tipos.length} tipos de gametos.`
            : `Quitando las repetidas quedan ${tipos.join(', ')}: ${tipos.length} tipos de gametos. Un gen homocigoto solo aporta un alelo posible.`,
        ],
      };
    }
    default:
      return fallo('Pregunta desconocida.');
  }
}

/* ─────────────────────────── Corregir ─────────────────────────── */

/**
 * Media centésima: el ruido de escribir una cifra exacta. Ver la cabecera: el 1 % del valor
 * aceptaría «6» para un 6,25 %, que es el defecto que esta app ya tuvo (hallazgo 751).
 */
const TOLERANCIA = 0.005;
/**
 * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde EXACTO
 * de la tolerancia la resta en coma flotante decide por ±1 ulp.
 */
const RUIDO_BINARIO = 1e-9;

export function toleranciaDe(): number {
  return TOLERANCIA;
}

/**
 * Lee lo que escribe el alumno. Admite «75», «75 %», «56,25» y, en las preguntas de porcentaje,
 * la fracción («3/4» vale 75 %), que es como se razona el cuadro de Punnett. Devuelve NaN con
 * cualquier otra cosa; el NaN lo convierte `comprobarRespuesta` en un mensaje propio.
 *
 * `parseNumero` se inyecta (es `parseSpanishNumber` en la vista y en el test) para que este
 * módulo no duplique la lógica del parser.
 */
export function leerRespuesta(texto: string, datos: DatosCaso, parseNumero: (s: string) => number): number {
  const limpio = texto.trim().replace(/\s*%\s*$/, '').replace(/[−–]/g, '-');
  const frac = limpio.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const den = Number(frac[2]);
    if (!esPorcentaje(datos) || den === 0) return NaN;
    return (Number(frac[1]) / den) * 100;
  }
  return parseNumero(limpio);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Corrige la respuesta del alumno frente a la de un caso. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number, datos: DatosCaso): Veredicto {
  const tolerancia = TOLERANCIA;
  const enPorcentaje = esPorcentaje(datos);
  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: enPorcentaje
        ? 'Escribe un número (puedes usar la coma decimal) o una fracción como 3/4.'
        : 'Escribe un número entero.',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  // 0,75 cuando se pide 75: el cuadro está bien leído, la unidad no.
  if (enPorcentaje && esperado !== 0 && Math.abs(usuario * 100 - esperado) <= tolerancia + RUIDO_BINARIO) {
    return {
      correcto: false,
      motivo: 'Casi: has escrito la proporción en tanto por uno. Aquí se pide en porcentaje: multiplícala por 100.',
      diferencia,
      tolerancia,
    };
  }

  // 6 o 6,3 cuando se piden 6,25: el error es el redondeo, no la genética (hallazgo 751).
  if (enPorcentaje && diferencia < 0.5) {
    return {
      correcto: false,
      motivo: 'Muy cerca, pero el resultado es exacto: no redondees. Divide las casillas entre el total y multiplica por 100.',
      diferencia,
      tolerancia,
    };
  }

  return {
    correcto: false,
    motivo: 'No es correcto. Vuelve a contar las casillas del cuadro.',
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
  /** Lo que acompaña a la cifra en la solución («semillas»); vacío en porcentajes y recuentos. */
  unidad: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el canal de aula es sobre todo latinoamericano. Organismos de
 * libro de texto (guisantes, ratones, plantas con flor), sin enfermedades humanas: el riesgo
 * genético de una familia es consejo genético, no un ejercicio.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'Dos híbridos: cuántos muestran el carácter recesivo',
    enunciado:
      'Se cruzan dos individuos heterocigotos, Aa × Aa. El alelo A domina por completo sobre a. ¿Qué porcentaje de la descendencia mostrará el fenotipo recesivo?',
    categoria: 'abstracto',
    datos: { tipo: 'monohibrido', p1: 'Aa', p2: 'Aa', pregunta: { que: 'porcentaje-fenotipo', fenotipo: 'recesivo' } },
    etiquetaRespuesta: 'Fenotipo recesivo, en %',
    unidad: '',
    pista: 'Solo muestra el fenotipo recesivo quien tiene los dos alelos recesivos: busca las casillas aa.',
  },
  {
    id: 2,
    titulo: 'Genotipo, que no es lo mismo que fenotipo',
    enunciado:
      'En el mismo cruce Aa × Aa, ¿qué porcentaje de la descendencia es heterocigota (genotipo Aa)?',
    categoria: 'abstracto',
    datos: { tipo: 'monohibrido', p1: 'Aa', p2: 'Aa', pregunta: { que: 'porcentaje-genotipo', genotipo: 'Aa' } },
    etiquetaRespuesta: 'Genotipo Aa, en %',
    unidad: '',
    pista: 'Se pregunta por el GENOTIPO: cuenta solo las casillas Aa, no las AA, aunque se vean igual.',
  },
  {
    id: 3,
    titulo: 'Primera ley: la uniformidad de la F1',
    enunciado:
      'En los guisantes, el color amarillo de la semilla (A) domina sobre el verde (a). Se cruza una planta de raza pura amarilla (AA) con una de raza pura verde (aa). ¿Qué porcentaje de la primera generación (F1) es heterocigota?',
    categoria: 'aplicado',
    datos: { tipo: 'monohibrido', p1: 'AA', p2: 'aa', pregunta: { que: 'porcentaje-genotipo', genotipo: 'Aa' } },
    etiquetaRespuesta: 'Genotipo Aa, en %',
    unidad: '',
    pista: 'Un progenitor solo puede dar gametos A y el otro solo gametos a. ¿Qué combinaciones caben?',
  },
  {
    id: 4,
    titulo: 'Cruce de prueba: destapar un heterocigoto',
    enunciado:
      'En los ratones, el pelo oscuro (A) domina sobre el albino (a). Un ratón oscuro heterocigoto (Aa) se cruza con una hembra albina (aa). ¿Qué porcentaje de las crías se espera que sea albino?',
    categoria: 'aplicado',
    datos: { tipo: 'monohibrido', p1: 'Aa', p2: 'aa', pregunta: { que: 'porcentaje-fenotipo', fenotipo: 'recesivo' } },
    etiquetaRespuesta: 'Crías albinas, en %',
    unidad: '',
    pista: 'La madre aa solo da gametos a, así que el fenotipo de cada cría lo decide el gameto del padre.',
  },
  {
    id: 5,
    titulo: 'De la proporción al número de semillas',
    enunciado:
      'Se autofecunda una planta de guisante amarilla heterocigota (Aa × Aa; el amarillo A domina sobre el verde a) y se obtienen 600 semillas. ¿Cuántas semillas verdes se esperan?',
    categoria: 'aplicado',
    datos: {
      tipo: 'monohibrido',
      p1: 'Aa',
      p2: 'Aa',
      pregunta: { que: 'individuos-fenotipo', fenotipo: 'recesivo', poblacion: 600 },
    },
    etiquetaRespuesta: 'Semillas verdes',
    unidad: 'semillas',
    pista: 'Primero la fracción de semillas verdes en el cuadro; después multiplícala por 600.',
  },
  {
    id: 6,
    titulo: 'Un progenitor homocigoto dominante',
    enunciado:
      'Se cruzan un individuo AA y otro Aa (A domina por completo sobre a). ¿Qué porcentaje de la descendencia mostrará el fenotipo recesivo?',
    categoria: 'abstracto',
    datos: { tipo: 'monohibrido', p1: 'AA', p2: 'Aa', pregunta: { que: 'porcentaje-fenotipo', fenotipo: 'recesivo' } },
    etiquetaRespuesta: 'Fenotipo recesivo, en %',
    unidad: '',
    pista: 'Fíjate en lo que aporta el progenitor AA a cada casilla. ¿Puede alguna salir aa?',
  },
  {
    id: 7,
    titulo: 'Tercera ley: dos caracteres a la vez',
    enunciado:
      'Se cruzan dos dihíbridos, AaBb × AaBb, con dominancia completa en los dos genes. ¿Qué porcentaje de la descendencia muestra el fenotipo dominante en los dos caracteres (A_B_)?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dihibrido',
      p1A: 'Aa',
      p1B: 'Bb',
      p2A: 'Aa',
      p2B: 'Bb',
      pregunta: { que: 'porcentaje-fenotipo', fenotipo: 'dominante-dominante' },
    },
    etiquetaRespuesta: 'Fenotipo A_B_, en %',
    unidad: '',
    pista: 'Es el «9» de la proporción 9:3:3:1, sobre 16 casillas. El resultado tiene decimales y es exacto.',
  },
  {
    id: 8,
    titulo: 'La casilla más rara del dihíbrido',
    enunciado: 'En el cruce AaBb × AaBb, ¿qué porcentaje de la descendencia tiene el genotipo aabb?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dihibrido',
      p1A: 'Aa',
      p1B: 'Bb',
      p2A: 'Aa',
      p2B: 'Bb',
      pregunta: { que: 'porcentaje-genotipo', genotipo: 'aabb' },
    },
    etiquetaRespuesta: 'Genotipo aabb, en %',
    unidad: '',
    pista: 'Solo hay una forma de obtener aabb: el gameto ab de cada progenitor. Una casilla de 16.',
  },
  {
    id: 9,
    titulo: 'Cuántos genotipos distintos',
    enunciado:
      'En el cruce AaBb × AaBb el cuadro tiene 16 casillas, pero muchas se repiten. ¿Cuántos genotipos distintos aparecen en la descendencia?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dihibrido',
      p1A: 'Aa',
      p1B: 'Bb',
      p2A: 'Aa',
      p2B: 'Bb',
      pregunta: { que: 'genotipos-distintos' },
    },
    etiquetaRespuesta: 'Número de genotipos distintos',
    unidad: '',
    pista: 'Cada gen por separado da 3 genotipos (AA, Aa, aa y BB, Bb, bb). ¿Cuántas parejas se pueden formar?',
  },
  {
    id: 10,
    titulo: 'No todos los dihíbridos dan cuatro gametos',
    enunciado:
      'Un individuo de genotipo AaBB se cruza con otro aabb. ¿Cuántos tipos distintos de gametos puede formar el individuo AaBB?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dihibrido',
      p1A: 'Aa',
      p1B: 'BB',
      p2A: 'aa',
      p2B: 'bb',
      pregunta: { que: 'gametos-distintos', progenitor: 1 },
    },
    etiquetaRespuesta: 'Tipos de gametos',
    unidad: '',
    pista: 'Para el gen B este individuo solo tiene alelos B. Combina las opciones de cada gen.',
  },
  {
    id: 11,
    titulo: 'Cruce de prueba con dos caracteres',
    enunciado:
      'En los guisantes, la semilla amarilla (A) domina sobre la verde (a) y la lisa (B) sobre la rugosa (b). Una planta AaBb se cruza con otra verde y rugosa (aabb) y se obtienen 320 semillas. ¿Cuántas se espera que sean verdes y rugosas?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dihibrido',
      p1A: 'Aa',
      p1B: 'Bb',
      p2A: 'aa',
      p2B: 'bb',
      pregunta: { que: 'individuos-fenotipo', fenotipo: 'recesivo-recesivo', poblacion: 320 },
    },
    etiquetaRespuesta: 'Semillas verdes y rugosas',
    unidad: 'semillas',
    pista: 'El progenitor aabb solo da gametos ab: el fenotipo de cada semilla lo decide el gameto de la planta AaBb.',
  },
  {
    id: 12,
    titulo: 'Flores y tallos: un cruce asimétrico',
    enunciado:
      'En una planta, la flor morada (A) domina sobre la blanca (a) y el tallo alto (B) sobre el enano (b). Se cruzan una planta AaBb y otra Aabb. ¿Qué porcentaje de la descendencia tendrá flor morada y tallo enano?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dihibrido',
      p1A: 'Aa',
      p1B: 'Bb',
      p2A: 'Aa',
      p2B: 'bb',
      pregunta: { que: 'porcentaje-fenotipo', fenotipo: 'dominante-recesivo' },
    },
    etiquetaRespuesta: 'Flor morada y tallo enano, en %',
    unidad: '',
    pista: 'Morada y enana es A_bb. Por separado: A_ sale en 3/4 de Aa × Aa y bb en 1/2 de Bb × bb.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const valor = r.ok ? r.valor : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.datos, def.unidad),
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
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio y
 * aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
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

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  unidad: string;
  pasos: string[];
}

/** Tamaños de descendencia múltiplos de 16: el valor esperado sale entero en los dos tipos de cruce. */
const POBLACIONES = [160, 320, 480, 640, 800, 960] as const;
const PREGUNTAS = ['porcentaje-fenotipo', 'porcentaje-genotipo', 'individuos-fenotipo', 'genotipos-distintos'] as const;

/**
 * Ejercicio aleatorio sobre un cruce cualquiera de los que admite la app. Usa EL MISMO
 * `resolverCaso` que los doce fijos, y por tanto el mismo motor que el cuadro: si divergieran,
 * el alumno entrenaría con una regla y sería corregido con otra.
 *
 * Pregunta solo por fenotipos y genotipos que SÍ aparecen en el cuadro: un «0 %» de vez en
 * cuando está bien (caso 6), pero en un generador saldría a menudo y no enseñaría nada.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const dihibrido = rnd() < 0.5;
  const p1A = elegir(GENOTIPOS_A, rnd);
  const p2A = elegir(GENOTIPOS_A, rnd);
  const p1B = elegir(GENOTIPOS_B, rnd);
  const p2B = elegir(GENOTIPOS_B, rnd);
  const que = elegir(PREGUNTAS, rnd);

  const celdas = dihibrido ? cruzarDihibrido(p1A, p1B, p2A, p2B) : cruzarMonohibrido(p1A, p2A);
  const { genotipicas, fenotipicas } = calcularProporciones(celdas);
  const fenotipo = elegir(Object.keys(fenotipicas) as Fenotipo[], rnd);
  const genotipo = elegir(Object.keys(genotipicas), rnd);
  const poblacion = elegir(POBLACIONES, rnd);

  let pregunta: Pregunta;
  let texto: string;
  let etiqueta: string;
  let unidad = '';
  if (que === 'porcentaje-fenotipo') {
    pregunta = { que, fenotipo };
    texto = `¿Qué porcentaje de la descendencia mostrará el ${fenotipoEnTexto(fenotipo)}?`;
    etiqueta = 'Fenotipo, en %';
  } else if (que === 'porcentaje-genotipo') {
    pregunta = { que, genotipo };
    texto = `¿Qué porcentaje de la descendencia tendrá el genotipo ${genotipo}?`;
    etiqueta = `Genotipo ${genotipo}, en %`;
  } else if (que === 'individuos-fenotipo') {
    pregunta = { que, fenotipo, poblacion };
    texto = `Si nacen ${numero(poblacion)} descendientes, ¿cuántos se espera que muestren el ${fenotipoEnTexto(fenotipo)}?`;
    etiqueta = 'Número de descendientes';
    unidad = 'descendientes';
  } else {
    pregunta = { que: 'genotipos-distintos' };
    texto = '¿Cuántos genotipos distintos aparecen en la descendencia?';
    etiqueta = 'Número de genotipos distintos';
  }

  const datos: DatosCaso = dihibrido
    ? { tipo: 'dihibrido', p1A, p1B, p2A, p2B, pregunta }
    : { tipo: 'monohibrido', p1: p1A, p2: p2A, pregunta };
  const dominancia = dihibrido ? 'con dominancia completa en los dos genes' : 'con dominancia completa de A sobre a';
  const r = resolverCaso(datos);
  return {
    enunciado: `Se cruzan ${textoCruce(datos)}, ${dominancia}. ${texto}`,
    datos,
    respuesta: r.ok ? r.valor : NaN,
    etiquetaRespuesta: etiqueta,
    unidad,
    pasos: r.pasos,
  };
}
