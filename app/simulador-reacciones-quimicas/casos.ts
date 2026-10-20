/**
 * Casos para clase — la tarea asignable de `simulador-reacciones-quimicas` (20/10/2026).
 *
 * Por qué esta app: el 20/10/2026 recibió un aula presencial de Colombia (48 visitas, 35 de una
 * sola IP en 34 minutos; `scripts/detectar-eventos-aula.mjs`). La hermana `simulador-estequiometria`
 * ya tenía casos, pero el profesor eligió esta, y la tarea tiene que estar donde él manda a la clase.
 * Los casos de la hermana NO se pueden copiar: sus masas molares son otras (allí el O₂ vale
 * 31,998; aquí, 32,0), y la app suspendería un número que ella misma produce.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la química está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM.
 *
 * ── LA QUÍMICA NO SE REPLICA AQUÍ ─────────────────────────────────────────────
 *
 * Toda respuesta sale de `calcularEstequiometria`, `calcularLimitante` y `sobrante`, de
 * `./motor.ts`: las MISMAS funciones con que la página pinta sus dos tablas. Los pasos escriben
 * cifras intermedias —son la explicación para el alumno—, pero la RESPUESTA es la del motor.
 *
 * ── EL CONVENIO DE ESTA APP: LAS MASAS MOLARES ────────────────────────────────
 *
 * El simulador usa masas con tres decimales (H₂ 2,016 · CH₄ 16,043 · CaCO₃ 100,087…), y los
 * libros de secundaria, las redondeadas (H = 1, C = 12, O = 16, Na = 23, Cl = 35,5…). Técnica de
 * los cuartiles (skill /casos-aula-meskeia): los datos de los doce casos dan, con las dos
 * tablas, el mismo limitante y una respuesta dentro de la tolerancia, con margen (la mayor
 * desviación es 0,26 veces la tolerancia). El generador aleatorio descarta lo que no cumpla lo
 * mismo (`coincideConLibro`). Por eso la tolerancia es la RELATIVA del corrector (el mayor entre
 * 0,01 y el 1 %), no la de redondeo.
 *
 * · Ningún caso pregunta por la masa de H₂: con 2 frente a 2,016 la diferencia es del 0,8 %, al
 *   borde de la tolerancia.
 * · Ningún caso está cerca de la proporción exacta: el limitante es el mismo con las dos tablas.
 * · Todos los gramos son enteros y se pueden escribir tal cual en las calculadoras de la app:
 *   «Cargar en la calculadora» los pone en su pestaña.
 *
 * Nada lanza excepciones: un `throw` dentro de un render tumba la app entera; aquí los datos
 * imposibles devuelven `{ ok: false, error }` y un NaN.
 */

import { formatNumber } from '@/lib';
import {
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  redondearA,
  toleranciaRelativa,
  type Magnitud,
} from '@/lib/calculadoras/correctorCasosAula';
import {
  calcularEstequiometria,
  calcularLimitante,
  reaccionPorId,
  reactivosDe,
  sobrante,
  type Reaccion,
  type SustanciaR,
} from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

/**
 * · `moles` y `masa`: se conoce la masa de UNA sustancia (`base`) y se pide la cantidad de otra
 *   (`objetivo`) o de ella misma. Es la pestaña «Estequiometría».
 * · `masa-limitante` y `exceso`: se dan los gramos de cada reactivo y se pide el producto
 *   `objetivo` o lo que sobra del reactivo en exceso. Es la pestaña «Reactivo Límite».
 */
export type Pregunta = 'moles' | 'masa' | 'masa-limitante' | 'exceso';

export interface DatosCaso {
  pregunta: Pregunta;
  reaccionId: string;
  /** `moles` y `masa`: índice de la sustancia conocida en la ecuación. */
  base?: number;
  /** `moles` y `masa`: sus gramos. */
  gramos?: number;
  /** `masa-limitante` y `exceso`: gramos de cada reactivo, en el orden de la ecuación. */
  gramosReactivos?: number[];
  /** Índice en la ecuación de la sustancia por la que se pregunta. En `exceso` no se usa. */
  objetivo: number;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Lo que «Cargar en la calculadora» pone en los controles de la app. */
export type ConfiguracionCalculadora =
  | { pestana: 'estequiometria'; reaccionId: string; sustanciaIdx: number; gramos: number }
  | { pestana: 'limitante'; reaccionId: string; gramosReactivos: number[] };

/** Decimales de la respuesta: los moles con tres, las masas con dos. */
export function decimalesDe(pregunta: Pregunta): number {
  return pregunta === 'moles' ? 3 : 2;
}

export function unidadDe(pregunta: Pregunta): string {
  return pregunta === 'moles' ? 'mol' : 'g';
}

/** Lo que se escribe en la casilla, con unidad. Derivado de la pregunta, nunca a mano. */
export function etiquetaDe(pregunta: Pregunta): string {
  return pregunta === 'moles' ? 'Cantidad de sustancia, en mol' : 'Masa, en g';
}

/** «36,03 g», «0,500 mol». Espacio duro antes de la unidad (CLAUDE.md global §2). */
export function textoRespuesta(valor: number, unidad: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  return `${formatNumber(valor, decimales)} ${unidad}`;
}

/* ─────────────────────────── Formato de los pasos ─────────────────────────── */

/** «Óxido de hierro(III)» → «óxido de hierro(III)»: solo la inicial, no los numerales. */
function minuscula(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

/**
 * Cifra en formato español con los decimales que de verdad tiene, hasta `maxDecimales`, y sin
 * ceros de relleno: 14,34290 se escribe 14,3429 (un «0» final hace creer que la cifra es exacta).
 */
function cifra(n: number, maxDecimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  let d = 0;
  while (d < maxDecimales && Math.abs(redondearA(n, d) - n) > 1e-9 * Math.max(1, Math.abs(n))) d += 1;
  while (d > 0 && redondearA(n, d) === redondearA(n, d - 1)) d -= 1;
  return formatNumber(n, d);
}

/** La masa molar como la enseña la tabla del catálogo de la app: «32,000 g/mol». */
function masaMolar(s: SustanciaR): string {
  return `${formatNumber(s.masa, 3)} g/mol`;
}

/** «8 g de hidrógeno (H₂)» */
function porcion(gramos: number, s: SustanciaR): string {
  return `${cifra(gramos)} g de ${minuscula(s.nombre)} (${s.formula})`;
}

/**
 * El último paso: la cifra exacta y, si hay que redondear, su redondeo a lo pedido. La exacta va
 * con TRES decimales más: con dos, 68,08996 se escribía «68,0900 g → 68,09 g», que se lee como si
 * ya fuera exacta.
 */
function pasoFinal(simbolo: string, expresion: string, valor: number, pregunta: Pregunta): string {
  const decimales = decimalesDe(pregunta);
  const unidad = unidadDe(pregunta);
  const exacto = exigeRedondeo(valor, decimales)
    ? `${cifra(valor, decimales + 3)} ${unidad} → ${textoRespuesta(redondearA(valor, decimales), unidad, decimales)}`
    : textoRespuesta(valor, unidad, decimales);
  return `${simbolo} = ${expresion} = ${exacto}`;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/** Los pasos de moles de cada reactivo, cociente n ÷ coeficiente y quién se agota. */
function pasosDelLimitante(r: Reaccion, gramosReactivos: number[], pasos: string[]): void {
  const reactivos = reactivosDe(r);
  const res = calcularLimitante(r, gramosReactivos, 'gramos');
  const cocientes = reactivos.map((s, i) => gramosReactivos[i] / s.masa / s.coef);
  reactivos.forEach((s, i) => {
    pasos.push(`n(${s.formula}) = ${cifra(gramosReactivos[i])} g ÷ ${masaMolar(s)} = ${cifra(gramosReactivos[i] / s.masa)} mol`);
  });
  const comparacion = reactivos
    .map((s, i) => `${s.formula} ${cifra(gramosReactivos[i] / s.masa)} ÷ ${s.coef} = ${cifra(cocientes[i])}`)
    .join(' · ');
  const lim = reactivos[res.limiteIdx];
  pasos.push(
    `Cociente n ÷ coeficiente: ${comparacion}. El menor es el del ${minuscula(lim.nombre)} (${lim.formula}): es el reactivo limitante.`,
  );
}

/**
 * Resuelve un caso desde sus datos, sin mirar ninguna respuesta escrita. El número lo da
 * siempre el motor; los pasos son la explicación.
 */
export function resolverCaso(d: DatosCaso): Resolucion {
  const r = reaccionPorId(d.reaccionId);
  if (!r) return { ok: false, valor: NaN, pasos: [], error: 'Reacción desconocida.' };
  const objetivo = r.sustancias[d.objetivo];
  const pasos: string[] = [];

  if (d.pregunta === 'moles' || d.pregunta === 'masa') {
    const base = d.base === undefined ? undefined : r.sustancias[d.base];
    if (!base || !objetivo || d.base === undefined) return { ok: false, valor: NaN, pasos: [], error: 'Sustancia desconocida.' };
    if (!positivo(d.gramos)) return { ok: false, valor: NaN, pasos: [], error: 'La masa debe ser positiva.' };
    const filas = calcularEstequiometria(r, d.base, d.gramos, 'gramos');
    const fila = filas[d.objetivo];
    const molesBase = filas[d.base].moles;
    pasos.push(`La cantidad de sustancia es la masa entre la masa molar: n = m ÷ M.`);
    if (d.objetivo === d.base) {
      if (d.pregunta === 'masa') return { ok: false, valor: NaN, pasos: [], error: 'Se pregunta por la misma masa que se da.' };
      pasos.push(pasoFinal(`n(${base.formula})`, `${cifra(d.gramos)} g ÷ ${masaMolar(base)}`, fila.moles, d.pregunta));
      return { ok: Number.isFinite(fila.moles), valor: fila.moles, pasos };
    }
    pasos.push(`n(${base.formula}) = ${cifra(d.gramos)} g ÷ ${masaMolar(base)} = ${cifra(molesBase)} mol`);
    const relacion = `Por la ecuación ${r.ecuacion}, ${base.coef} mol de ${base.formula} ${base.coef === 1 ? 'va' : 'van'} con ${objetivo.coef} mol de ${objetivo.formula}`;
    if (d.pregunta === 'moles') {
      pasos.push(`${relacion}.`);
      pasos.push(pasoFinal(`n(${objetivo.formula})`, `${cifra(molesBase)} × ${objetivo.coef} ÷ ${base.coef}`, fila.moles, d.pregunta));
      return { ok: Number.isFinite(fila.moles), valor: fila.moles, pasos };
    }
    pasos.push(`${relacion}: n(${objetivo.formula}) = ${cifra(molesBase)} × ${objetivo.coef} ÷ ${base.coef} = ${cifra(fila.moles)} mol`);
    pasos.push(pasoFinal(`m(${objetivo.formula})`, `${cifra(fila.moles)} mol × ${masaMolar(objetivo)}`, fila.gramos, d.pregunta));
    return { ok: Number.isFinite(fila.gramos), valor: fila.gramos, pasos };
  }

  const reactivos = reactivosDe(r);
  const g = d.gramosReactivos ?? [];
  if (reactivos.length < 2) return { ok: false, valor: NaN, pasos: [], error: 'Con un solo reactivo no hay limitante.' };
  if (g.length !== reactivos.length || !g.every(positivo)) {
    return { ok: false, valor: NaN, pasos: [], error: 'Faltan las masas de los reactivos.' };
  }
  const res = calcularLimitante(r, g, 'gramos');
  if (res.limiteIdx < 0) return { ok: false, valor: NaN, pasos: [], error: 'Es una proporción exacta: no sobra ningún reactivo.' };
  pasosDelLimitante(r, g, pasos);
  const cociente = g[res.limiteIdx] / reactivos[res.limiteIdx].masa / reactivos[res.limiteIdx].coef;

  if (d.pregunta === 'masa-limitante') {
    const fila = res.filas[d.objetivo];
    if (!objetivo || objetivo.esReactivo || !fila) return { ok: false, valor: NaN, pasos: [], error: 'Se pregunta por un producto.' };
    pasos.push(`n(${objetivo.formula}) = ${cifra(cociente)} × ${objetivo.coef} = ${cifra(fila.moles)} mol`);
    pasos.push(pasoFinal(`m(${objetivo.formula})`, `${cifra(fila.moles)} mol × ${masaMolar(objetivo)}`, fila.gramos, d.pregunta));
    return { ok: Number.isFinite(fila.gramos), valor: fila.gramos, pasos };
  }

  // exceso: con dos reactivos, sobra el que no limita
  const idxSobra = res.limiteIdx === 0 ? 1 : 0;
  const s = reactivos[idxSobra];
  const disponibles = g[idxSobra] / s.masa;
  const consumidos = cociente * s.coef;
  const sob = sobrante(r, res, idxSobra);
  pasos.push(
    `El ${minuscula(s.nombre)} (${s.formula}) está en exceso. Se consumen ${cifra(cociente)} × ${s.coef} = ${cifra(consumidos)} mol de los ${cifra(disponibles)} mol que hay.`,
  );
  pasos.push(`Sobran ${cifra(disponibles)} − ${cifra(consumidos)} = ${cifra(sob.moles)} mol`);
  pasos.push(pasoFinal(`m(${s.formula}) sobrante`, `${cifra(sob.moles)} mol × ${masaMolar(s)}`, sob.gramos, d.pregunta));
  return { ok: Number.isFinite(sob.gramos), valor: sob.gramos, pasos };
}

/** Lo que pone «Cargar en la calculadora»: la pestaña, la reacción y los gramos del caso. */
export function configuracionDe(d: DatosCaso): ConfiguracionCalculadora | null {
  if (!reaccionPorId(d.reaccionId)) return null;
  if (d.pregunta === 'moles' || d.pregunta === 'masa') {
    if (d.base === undefined || !positivo(d.gramos)) return null;
    return { pestana: 'estequiometria', reaccionId: d.reaccionId, sustanciaIdx: d.base, gramos: d.gramos };
  }
  if (!d.gramosReactivos) return null;
  return { pestana: 'limitante', reaccionId: d.reaccionId, gramosReactivos: [...d.gramosReactivos] };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** Masas y moles son continuas: ninguna respuesta de esta app está acotada por arriba. */
export function magnitudDe(_pregunta: Pregunta): Magnitud {
  return 'real';
}

/** Tolerancia: la relativa del motor del corrector (el porqué, en la cabecera). */
export function toleranciaDe(esperado: number): number {
  return toleranciaRelativa(esperado);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Los errores típicos del tema, cada uno con el valor que produce y lo que hay que decirle al
 * alumno. Se calculan con el motor desde los datos, igual que la respuesta.
 */
export function erroresTipicos(d: DatosCaso): { valor: number; motivo: string }[] {
  const r = reaccionPorId(d.reaccionId);
  if (!r) return [];
  const errores: { valor: number; motivo: string }[] = [];
  const objetivo = r.sustancias[d.objetivo];

  if ((d.pregunta === 'moles' || d.pregunta === 'masa') && d.base !== undefined && positivo(d.gramos) && objetivo) {
    const base = r.sustancias[d.base];
    if (!base) return [];
    const molesBase = d.gramos / base.masa;
    if (d.pregunta === 'moles' && d.objetivo === d.base) {
      errores.push({ valor: d.gramos * base.masa, motivo: 'Has multiplicado la masa por la masa molar: los moles son m ÷ M.' });
      return errores;
    }
    if (base.coef !== objetivo.coef) {
      const sinCoeficientes = d.pregunta === 'moles' ? molesBase : molesBase * objetivo.masa;
      errores.push({ valor: sinCoeficientes, motivo: 'Te has saltado los coeficientes de la ecuación: los moles no van 1 a 1, multiplica por la razón entre los coeficientes.' });
      const alReves = molesBase * (base.coef / objetivo.coef);
      errores.push({ valor: d.pregunta === 'moles' ? alReves : alReves * objetivo.masa, motivo: 'Has puesto la razón entre los coeficientes al revés: va el de la sustancia que buscas arriba.' });
    }
    if (d.pregunta === 'masa') {
      errores.push({ valor: d.gramos * (objetivo.coef / base.coef), motivo: 'Los coeficientes son proporciones de MOLES, no de gramos: pasa primero la masa a moles.' });
      errores.push({ valor: molesBase * (objetivo.coef / base.coef), motivo: 'Eso son los moles: se piden gramos (multiplica por la masa molar).' });
    }
    return errores;
  }

  const reactivos = reactivosDe(r);
  const g = d.gramosReactivos ?? [];
  if (reactivos.length < 2 || g.length !== reactivos.length || !g.every(positivo)) return errores;
  const res = calcularLimitante(r, g, 'gramos');
  if (res.limiteIdx < 0) return errores;

  if (d.pregunta === 'masa-limitante' && objetivo) {
    const cocientes = reactivos.map((s, i) => g[i] / s.masa / s.coef);
    const conElExceso = Math.max(...cocientes) * objetivo.coef * objetivo.masa;
    errores.push({ valor: conElExceso, motivo: 'Has calculado con el reactivo en exceso. El producto lo decide el limitante: compara n ÷ coeficiente de los dos reactivos.' });
    errores.push({ valor: res.filas[d.objetivo]?.moles ?? NaN, motivo: 'Eso son los moles del producto: se piden gramos (multiplica por la masa molar).' });
  }
  if (d.pregunta === 'exceso') {
    const idxSobra = res.limiteIdx === 0 ? 1 : 0;
    const sob = sobrante(r, res, idxSobra);
    const consumidos = res.filas[r.sustancias.indexOf(reactivos[idxSobra])]?.gramos ?? NaN;
    errores.push({ valor: sob.moles, motivo: 'Eso son los moles que sobran: se piden gramos (multiplica por la masa molar).' });
    errores.push({ valor: consumidos, motivo: 'Esa es la masa que REACCIONA del reactivo en exceso: réstala de la que había para saber cuánto sobra.' });
  }
  return errores;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde con
 * un veredicto, no con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(usuario: number, esperado: number, d: DatosCaso): Veredicto {
  const tolerancia = toleranciaDe(esperado);
  const c = corregirNumero(usuario, esperado, { tolerancia, magnitud: magnitudDe(d.pregunta) });
  const { diferencia } = c;

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal, por ejemplo 36,03).', diferencia: NaN, tolerancia };
  }
  if (c.motivoImposible) return { correcto: false, motivo: c.motivoImposible, diferencia, tolerancia };
  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  if (usuario <= 0) {
    return { correcto: false, motivo: 'No es correcto: una masa o una cantidad de sustancia no pueden ser cero ni negativas.', diferencia, tolerancia };
  }

  for (const e of erroresTipicos(d)) {
    if (!dentroDeTolerancia(e.valor, esperado, tolerancia) && dentroDeTolerancia(usuario, e.valor, toleranciaDe(e.valor))) {
      return { correcto: false, motivo: e.motivo, diferencia, tolerancia };
    }
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${cifra(diferencia, decimalesDe(d.pregunta))} ${unidadDe(d.pregunta)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Las masas de libro ─────────────────────────── */

/**
 * Las masas molares con los pesos atómicos redondeados de los libros de secundaria (H = 1,
 * C = 12, N = 14, O = 16, Na = 23, Al = 27, S = 32, Cl = 35,5, Ca = 40, Fe = 56, Cu = 63,5,
 * Zn = 65,4, Ag = 108, Ba = 137,3). NO se usan para corregir: solo para que el generador
 * aleatorio descarte los ejercicios en los que quien las usa daría otra respuesta.
 */
const MASA_DE_LIBRO: Record<string, number> = {
  'H₂': 2, 'O₂': 32, 'H₂O': 18, 'N₂': 28, 'NH₃': 17, Na: 23, 'Cl₂': 71, NaCl: 58.5, C: 12, 'CO₂': 44,
  'CaCO₃': 100, CaO: 56, 'H₂O₂': 34, Fe: 56, 'CuSO₄': 159.5, 'FeSO₄': 152, Cu: 63.5, Zn: 65.4, HCl: 36.5,
  'ZnCl₂': 136.4, NaOH: 40, 'AgNO₃': 170, AgCl: 143.5, 'NaNO₃': 85, 'BaCl₂': 208.3, 'Na₂SO₄': 142,
  'BaSO₄': 233.3, 'CH₄': 16, 'C₃H₈': 44, 'C₆H₁₂O₆': 180, 'C₂H₅OH': 46, 'Fe₂O₃': 160, Al: 27,
  'Al₂O₃': 102, 'H₂SO₄': 98,
};

/** La misma reacción con las masas de libro, para recalcular con el MISMO motor. */
function conMasasDeLibro(r: Reaccion): Reaccion {
  return { ...r, sustancias: r.sustancias.map(s => ({ ...s, masa: MASA_DE_LIBRO[s.formula] ?? s.masa })) };
}

/** Solo el número de la respuesta y el limitante, con una reacción dada (la de libro). */
function resolverConReaccion(r: Reaccion, d: DatosCaso): { valor: number; limiteIdx: number } {
  if (d.pregunta === 'moles' || d.pregunta === 'masa') {
    const fila = calcularEstequiometria(r, d.base ?? -1, d.gramos ?? NaN, 'gramos')[d.objetivo];
    if (!fila) return { valor: NaN, limiteIdx: -1 };
    return { valor: d.pregunta === 'moles' ? fila.moles : fila.gramos, limiteIdx: -1 };
  }
  const res = calcularLimitante(r, d.gramosReactivos ?? [], 'gramos');
  if (d.pregunta === 'masa-limitante') return { valor: res.filas[d.objetivo]?.gramos ?? NaN, limiteIdx: res.limiteIdx };
  return { valor: sobrante(r, res, res.limiteIdx === 0 ? 1 : 0).gramos, limiteIdx: res.limiteIdx };
}

/**
 * ¿Da lo mismo con las masas de libro? Lo mismo = el mismo limitante y una respuesta dentro de
 * `margen` veces la tolerancia (0,6: deja sitio a que el alumno arrastre además algún redondeo).
 */
export function coincideConLibro(d: DatosCaso, margen = 0.6): boolean {
  const r = reaccionPorId(d.reaccionId);
  if (!r) return false;
  const app = resolverCaso(d);
  if (!app.ok) return false;
  const libro = resolverConReaccion(conMasasDeLibro(r), d);
  if (!Number.isFinite(libro.valor)) return false;
  if (libro.limiteIdx !== resolverConReaccion(r, d).limiteIdx) return false;
  return Math.abs(libro.valor - app.valor) <= margen * toleranciaDe(app.valor);
}

/* ─────────────────────────── Los doce casos ─────────────────────────── */

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  etiquetaRespuesta: string;
  unidad: string;
  /** Calculada por el motor desde `datos` y redondeada a los decimales pedidos. */
  respuesta: number;
  respuestaTexto: string;
  /** true si la cifra exacta tiene más decimales de los pedidos: el enunciado lo dice. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/** «Redondea a dos decimales.» o nada, según lo decida `exigeRedondeo` sobre la cifra exacta. */
function fraseRedondeo(d: DatosCaso): string {
  const r = resolverCaso(d);
  if (!r.ok || !exigeRedondeo(r.valor, decimalesDe(d.pregunta))) return '';
  return decimalesDe(d.pregunta) === 3 ? ' Redondea a tres decimales.' : ' Redondea a dos decimales.';
}

/** La ecuación tal como la escribe la app, para que el enunciado diga lo mismo que la pantalla. */
function ec(id: string): string {
  return reaccionPorId(id)?.ecuacion ?? '';
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países, gentilicios ni monedas: el público de este canal es sobre todo
 * latinoamericano, y un enunciado anclado a un lugar excluye a la mayor parte.
 *
 * ⚠️ Ningún TÍTULO lleva «gramos», «moles», «calcular» ni «todas»: el título entra en el nombre
 * accesible del botón de cada caso, y el acta del Inspector localiza los botones Gramos, Moles,
 * Calcular y Todas (20) por su nombre, que Playwright compara por subcadena. El spec lo vigila.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'unidad' | 'etiquetaRespuesta' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'De la balanza a la cantidad de sustancia',
    enunciado: '¿Cuántos moles de carbonato de calcio (CaCO₃) hay en una muestra de 50 g? Usa la masa molar que indica el simulador.',
    categoria: 'abstracto',
    datos: { pregunta: 'moles', reaccionId: 'calcinacion', base: 0, gramos: 50, objetivo: 0 },
    pista: 'n = m ÷ M. La masa molar del CaCO₃ está en el catálogo, en la tarjeta de la calcinación de la caliza.',
  },
  {
    id: 2,
    titulo: 'Oxígeno para una bombona',
    enunciado: `En la combustión del propano, ${ec('propano')}, ¿cuántos moles de oxígeno (O₂) hacen falta para quemar por completo 22 g de propano (C₃H₈)?`,
    categoria: 'abstracto',
    datos: { pregunta: 'moles', reaccionId: 'propano', base: 0, gramos: 22, objetivo: 1 },
    pista: 'Pasa el propano a moles; la ecuación dice que cada mol de C₃H₈ necesita 5 mol de O₂.',
  },
  {
    id: 3,
    titulo: 'Amoniaco para fertilizante',
    enunciado: `Un reactor fabrica amoniaco según ${ec('haber')}. Si reaccionan por completo 56 g de nitrógeno (N₂) con hidrógeno suficiente, ¿qué masa de amoniaco (NH₃) se forma?`,
    categoria: 'aplicado',
    datos: { pregunta: 'masa', reaccionId: 'haber', base: 0, gramos: 56, objetivo: 2 },
    pista: 'Por cada mol de N₂ se forman 2 mol de NH₃. Luego pasa los moles de NH₃ a gramos.',
  },
  {
    id: 4,
    titulo: 'Cal viva para el cemento',
    enunciado: `En un horno se calcinan 250 g de caliza pura según ${ec('calcinacion')}. ¿Qué masa de cal viva (CaO) se obtiene?`,
    categoria: 'aplicado',
    datos: { pregunta: 'masa', reaccionId: 'calcinacion', base: 0, gramos: 250, objetivo: 1 },
    pista: 'Los coeficientes son 1 y 1: los moles de CaO son los mismos que los de CaCO₃. Cambia solo la masa molar.',
  },
  {
    id: 5,
    titulo: 'El CO₂ que exhalamos',
    enunciado: `En la respiración celular, ${ec('glucosa')}. ¿Qué masa de dióxido de carbono (CO₂) se libera al oxidar por completo 90 g de glucosa (C₆H₁₂O₆)?`,
    categoria: 'aplicado',
    datos: { pregunta: 'masa', reaccionId: 'glucosa', base: 0, gramos: 90, objetivo: 2 },
    pista: 'Cada mol de glucosa da 6 mol de CO₂: no te saltes el coeficiente.',
  },
  {
    id: 6,
    titulo: 'Oxígeno para una estación espacial',
    enunciado: `En una estación espacial se obtiene oxígeno por electrólisis: ${ec('electrolisis')}. ¿Qué masa de agua (H₂O) hay que descomponer para obtener 64 g de oxígeno (O₂)?`,
    categoria: 'aplicado',
    datos: { pregunta: 'masa', reaccionId: 'electrolisis', base: 2, gramos: 64, objetivo: 0 },
    pista: 'Aquí se conoce un PRODUCTO y se busca un reactivo: el camino es el mismo. Por cada mol de O₂ se descomponen 2 mol de H₂O.',
  },
  {
    id: 7,
    titulo: 'Menos masa no es menos cantidad',
    enunciado: `Se mezclan 8 g de hidrógeno (H₂) con 32 g de oxígeno (O₂), que reaccionan según ${ec('sintesis-agua')}. Hay cuatro veces menos hidrógeno que oxígeno en masa, pero ¿qué masa de agua (H₂O) se forma como máximo?`,
    categoria: 'abstracto',
    datos: { pregunta: 'masa-limitante', reaccionId: 'sintesis-agua', gramosReactivos: [8, 32], objetivo: 2 },
    pista: 'Compara en moles y dividiendo entre el coeficiente: 8 g de H₂ son casi 4 mol, y el H₂ lleva un 2 delante.',
  },
  {
    id: 8,
    titulo: 'Sal de mesa a partir de sus elementos',
    enunciado: `Se hacen reaccionar 23 g de sodio (Na) con 71 g de cloro (Cl₂) según ${ec('nacl')}. ¿Qué masa de cloruro de sodio (NaCl) se forma como máximo?`,
    categoria: 'abstracto',
    datos: { pregunta: 'masa-limitante', reaccionId: 'nacl', gramosReactivos: [23, 71], objetivo: 2 },
    pista: 'Hay más o menos 1 mol de cada uno, pero el sodio lleva un 2 delante: divide entre el coeficiente antes de comparar.',
  },
  {
    id: 9,
    titulo: 'Precipitado en el análisis de un agua',
    enunciado: `Para analizar los cloruros de una muestra se mezclan 10 g de cloruro de sodio (NaCl) con 17 g de nitrato de plata (AgNO₃): ${ec('precipitacion-agcl')}. ¿Qué masa de cloruro de plata (AgCl) precipita como máximo?`,
    categoria: 'aplicado',
    datos: { pregunta: 'masa-limitante', reaccionId: 'precipitacion-agcl', gramosReactivos: [10, 17], objetivo: 2 },
    pista: 'Los coeficientes son 1 y 1: limita el que tenga menos moles, no menos gramos.',
  },
  {
    id: 10,
    titulo: 'Herrumbre en un recipiente cerrado',
    enunciado: `En un recipiente cerrado hay 112 g de limaduras de hierro (Fe) y 64 g de oxígeno (O₂), que reaccionan según ${ec('oxido-hierro')}. ¿Qué masa de óxido de hierro(III) (Fe₂O₃) se forma como máximo?`,
    categoria: 'aplicado',
    datos: { pregunta: 'masa-limitante', reaccionId: 'oxido-hierro', gramosReactivos: [112, 64], objetivo: 2 },
    pista: 'Divide los moles de Fe entre 4 y los de O₂ entre 3. Con el menor, calcula el Fe₂O₃ (coeficiente 2).',
  },
  {
    id: 11,
    titulo: 'Neutralizar un vertido ácido',
    enunciado: `Para neutralizar un vertido con 49 g de ácido sulfúrico (H₂SO₄) se añaden 60 g de hidróxido de sodio (NaOH): ${ec('acido-sulfo')}. ¿Cuántos gramos del reactivo en exceso quedan sin reaccionar?`,
    categoria: 'aplicado',
    datos: { pregunta: 'exceso', reaccionId: 'acido-sulfo', gramosReactivos: [49, 60], objetivo: 0 },
    pista: 'El ácido es dibásico: cada mol de H₂SO₄ gasta 2 mol de NaOH. Lo que sobra es lo que había menos lo que se gasta.',
  },
  {
    id: 12,
    titulo: 'Aluminio que sobra en una soldadura',
    enunciado: `En una soldadura de raíles se usan 160 g de óxido de hierro(III) (Fe₂O₃) y 81 g de aluminio (Al): ${ec('termita')}. ¿Cuántos gramos del reactivo en exceso quedan sin reaccionar?`,
    categoria: 'aplicado',
    datos: { pregunta: 'exceso', reaccionId: 'termita', gramosReactivos: [160, 81], objetivo: 0 },
    pista: 'Por cada mol de Fe₂O₃ se gastan 2 mol de Al. Calcula cuánto aluminio gasta el óxido y réstalo del que había.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map(def => {
  const r = resolverCaso(def.datos);
  const decimales = decimalesDe(def.datos.pregunta);
  const unidad = unidadDe(def.datos.pregunta);
  const valor = r.ok ? redondearA(r.valor, decimales) : NaN;
  return {
    ...def,
    enunciado: def.enunciado + fraseRedondeo(def.datos),
    etiquetaRespuesta: etiquetaDe(def.datos.pregunta),
    unidad,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, unidad, decimales),
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, decimales) : false,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * 1, 2, 3… los primeros valores salen diminutos y muy parecidos, y el «aleatorio» acaba dando
 * SIEMPRE el mismo ejercicio (simulador-genetica, 14/09/2026): reproducible no es variado.
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

function elegir<T>(rnd: () => number, opciones: readonly T[]): T {
  return opciones[Math.min(opciones.length - 1, Math.floor(rnd() * opciones.length))];
}

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  unidad: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

/** Gramos enteros que se pueden pesar en un laboratorio escolar. */
const GRAMOS = [4, 5, 8, 10, 12, 15, 16, 20, 24, 25, 30, 32, 40, 48, 50, 56, 60, 64, 72, 80, 90, 100, 112, 120, 150, 160, 200] as const;
const PREGUNTAS: readonly Pregunta[] = ['moles', 'masa', 'masa', 'masa-limitante', 'masa-limitante', 'exceso'];

/** «reaccionan por completo 8 g de…» o «se obtienen 8 g de…», según sea reactivo o producto. */
function fraseConocida(gramos: number, s: SustanciaR): string {
  return s.esReactivo ? `reaccionan por completo ${porcion(gramos, s)}` : `se obtienen ${porcion(gramos, s)}`;
}

/** Cómo se pregunta por la sustancia buscada, según su papel y el de la conocida. */
function fraseBuscada(conocida: SustanciaR, buscada: SustanciaR): string {
  if (!buscada.esReactivo) return conocida.esReactivo ? 'se forman' : 'se forman a la vez';
  return conocida.esReactivo ? 'reaccionan con ellos' : 'hacen falta';
}

function intentar(rnd: () => number): { datos: DatosCaso; enunciado: string } | null {
  const pregunta = elegir(rnd, PREGUNTAS);
  const r = elegir(rnd, REACCIONES_PRACTICA);
  const reactivos = reactivosDe(r);
  const indices = r.sustancias.map((_, i) => i);
  let datos: DatosCaso;
  let enunciado: string;

  if (pregunta === 'moles' || pregunta === 'masa') {
    const base = elegir(rnd, indices);
    // en `moles`, a veces la conversión directa; en `masa`, nunca la misma sustancia
    const objetivo = pregunta === 'moles' && rnd() < 0.35 ? base : elegir(rnd, indices.filter(i => i !== base));
    const gramos = elegir(rnd, GRAMOS);
    datos = { pregunta, reaccionId: r.id, base, gramos, objetivo };
    const conocida = r.sustancias[base];
    const buscada = r.sustancias[objetivo];
    // Se evita preguntar la MASA de H₂: 2 frente a 2,016 es un 0,8 %, al borde de la tolerancia.
    if (pregunta === 'masa' && buscada.formula === 'H₂') return null;
    enunciado = objetivo === base
      ? `¿Cuántos moles hay en ${porcion(gramos, conocida)}?`
      : `En la reacción ${r.ecuacion} ${fraseConocida(gramos, conocida)}. ¿Cuántos ${pregunta === 'moles' ? 'moles' : 'gramos'} de ${minuscula(buscada.nombre)} (${buscada.formula}) ${fraseBuscada(conocida, buscada)}?`;
  } else {
    if (reactivos.length !== 2) return null;
    const gramosReactivos = [elegir(rnd, GRAMOS), elegir(rnd, GRAMOS)];
    const productos = indices.filter(i => !r.sustancias[i].esReactivo);
    const objetivo = pregunta === 'masa-limitante' ? elegir(rnd, productos) : 0;
    datos = { pregunta, reaccionId: r.id, gramosReactivos, objetivo };
    // Lejos de la proporción exacta: el limitante no se decide por un decimal.
    const cocientes = reactivos.map((s, i) => gramosReactivos[i] / s.masa / s.coef);
    if (Math.abs(cocientes[0] - cocientes[1]) / Math.max(...cocientes) < 0.2) return null;
    const mezcla = `${porcion(gramosReactivos[0], reactivos[0])} y ${porcion(gramosReactivos[1], reactivos[1])}`;
    if (pregunta === 'masa-limitante') {
      const p = r.sustancias[objetivo];
      if (p.formula === 'H₂') return null;
      enunciado = `Reaccionan ${mezcla} según ${r.ecuacion}. ¿Qué masa de ${minuscula(p.nombre)} (${p.formula}) se forma como máximo?`;
    } else {
      enunciado = `Se mezclan ${mezcla}, que reaccionan según ${r.ecuacion}. ¿Cuántos gramos del reactivo en exceso quedan sin reaccionar?`;
    }
  }

  const res = resolverCaso(datos);
  // Un suelo y un techo: por debajo de 1 el margen mínimo de 0,01 pesa demasiado, y por encima
  // de 1000 las cifras dejan de ser de laboratorio escolar.
  if (!res.ok || res.valor < 1 || res.valor > 1000) return null;
  if (!coincideConLibro(datos)) return null;
  return { datos, enunciado };
}

/**
 * Las reacciones del modo práctica: todas las del catálogo menos dos cuya masa de libro no es
 * única. El CuSO₄ del hierro en sulfato de cobre se da como sal anhidra o como pentahidrato
 * (159,5 o 249,5 g/mol), y el zinc, como 65 o 65,4: con 65 la diferencia con el 65,38 de la app
 * es del 0,58 %, al borde de la tolerancia. Una pregunta sobre ellas tendría dos respuestas
 * según el libro.
 */
const REACCIONES_PRACTICA: readonly Reaccion[] = [
  'sintesis-agua', 'haber', 'nacl', 'combustion-carbono', 'electrolisis', 'calcinacion', 'agua-oxigenada',
  'sodio-agua', 'precipitacion-agcl', 'neutralizacion-hcl-naoh', 'baso4', 'metano', 'propano',
  'glucosa', 'etanol', 'oxido-hierro', 'termita', 'acido-sulfo',
].map(id => reaccionPorId(id)).filter((r): r is Reaccion => r !== undefined);

/** Si en 200 intentos no sale nada válido (no pasa con estas listas), el caso 7. */
const RESERVA: { datos: DatosCaso; enunciado: string } = {
  datos: { pregunta: 'masa-limitante', reaccionId: 'sintesis-agua', gramosReactivos: [8, 32], objetivo: 2 },
  enunciado: `Reaccionan 8 g de hidrógeno (H₂) y 32 g de oxígeno (O₂) según ${ec('sintesis-agua')}. ¿Qué masa de agua (H₂O) se forma como máximo?`,
};

/** Un ejercicio de práctica, con la MISMA resolución (`resolverCaso`) que los doce fijos. */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  let elegido: { datos: DatosCaso; enunciado: string } | null = null;
  for (let i = 0; i < 200 && !elegido; i++) elegido = intentar(rnd);
  const { datos, enunciado } = elegido ?? RESERVA;
  const r = resolverCaso(datos);
  const decimales = decimalesDe(datos.pregunta);
  const unidad = unidadDe(datos.pregunta);
  return {
    semilla,
    enunciado: enunciado + fraseRedondeo(datos),
    datos,
    respuesta: r.ok ? redondearA(r.valor, decimales) : NaN,
    etiquetaRespuesta: etiquetaDe(datos.pregunta),
    unidad,
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, decimales) : false,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
  };
}
