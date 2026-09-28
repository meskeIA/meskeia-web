/**
 * Predicciones para clase del Simulador de Transformaciones — tarea de tipo C: PREDICCIÓN
 * ANTES DE MOVER.
 *
 * El alumno se compromete con una predicción («si muevo c de 0 a 3, ¿hacia dónde va el
 * vértice?») ANTES de tocar el deslizador, y solo después carga el escenario y lo mueve. Ese
 * compromiso previo es todo el valor pedagógico: mover un deslizador y ver la curva no enseña
 * nada si no había una hipótesis que confirmar o romper.
 *
 * Vive fuera de la vista porque el build compila la página sin comprobar si la matemática está
 * bien. Y NO calcula por su cuenta: cada rasgo se mide EJECUTANDO `evaluarTransformada`, la
 * misma función (`motor.ts`) con la que el lienzo pinta la curva azul. Con dos
 * implementaciones, la app podría suspender una predicción que ella misma enseña en pantalla.
 *
 * EL CONVENIO DE ESTA APP (lo que decide qué respuesta es la correcta)
 * ────────────────────────────────────────────────────────────────────
 * 1. SE MIDE LO QUE SE VE. La ventana del lienzo es x ∈ [−10, 10], y ∈ [−8, 8] (las constantes
 *    X_MIN…Y_MAX de `dibujar` en `page.tsx`). Los rasgos se miden en la rejilla x = i/100 con i
 *    ENTERO de −1000 a 1000 — sumar 0,01 en bucle acumula error y desplaza los extremos. Un
 *    rasgo que cae fuera de la ventana (un vértice por encima de y = 8, una cresta recortada)
 *    no se puede ver moverse, y el caso se rechaza con `ok: false`.
 * 2. SOLO VALORES QUE LOS DESLIZADORES ALCANZAN: a, b ∈ [−3, 3], c, d ∈ [−5, 5], múltiplos de
 *    0,1, y b ≠ 0 (la app sustituye b = 0 por 0,001).
 * 3. «NO CAMBIA» ES |después − antes| < 1e-6. Pero un cambio real más pequeño que
 *    `UMBRAL_VISIBLE` (0,05 unidades, menos de un píxel en el lienzo) tampoco se VE: el alumno
 *    que predice «no cambia» vería que no cambia y sería suspendido. Esos escenarios se
 *    rechazan. Ocurre con el máximo de sin al cambiar b: la cresta real vale 1, pero la rejilla
 *    solo la roza, y el mayor valor muestreado varía unas millonésimas de un b a otro.
 * 4. LAS CRESTAS SON MÁXIMOS LOCALES ESTRICTOS INTERIORES de la muestra (f[i] > f[i−1] y
 *    f[i] ≥ f[i+1]). Una cresta a menos de 0,15 de un borde de la ventana (dentro o fuera) es
 *    ambigua para el ojo —se ve «media cresta»—, y el escenario se rechaza.
 * 5. EL MÁXIMO SOLO SE PREGUNTA SI SE VE UNA CRESTA ENTERA: el mayor valor medido tiene que
 *    coincidir con |a| + d. Con b muy pequeño la onda es tan ancha que la ventana no llega a
 *    ninguna cresta, y «el punto más alto» sería el borde, no la amplitud.
 *
 * «No cambia» se ofrece SIEMPRE como opción, aunque en un caso no sea la correcta: es el error
 * típico («estirar no mueve el vértice… ¿o sí?»), y quitarla regalaría la respuesta.
 *
 * Los 12 casos son DETERMINISTAS y universales: el caso 3 es el mismo para todo el mundo, hoy
 * y dentro de un año. Es lo único que hace que «haz los casos 3, 7 y 11» funcione en clase.
 *
 * Nada lanza excepciones: un dato inválido sale como `{ ok: false, error }` o como NaN.
 */

import { formatNumber } from '@/lib';
import { FUNCIONES_BASE, construirEcuacion, evaluarBase, evaluarTransformada, type FuncionBase } from './motor';

// ============================================================
// TIPOS
// ============================================================

export type Rasgo = 'x-vertice' | 'y-vertice' | 'x-inicio' | 'maximo' | 'crestas' | 'valor-en';
export type Respuesta = 'aumenta' | 'disminuye' | 'no-cambia';
export type Parametro = 'a' | 'b' | 'c' | 'd';

export interface Parametros {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface DatosCaso {
  funcion: FuncionBase;
  /** La partida: lo que se carga en el simulador. */
  antes: Parametros;
  /** El único deslizador que se mueve… */
  parametro: Parametro;
  /** …y hasta dónde. */
  nuevoValor: number;
  rasgo: Rasgo;
  /** Solo para `valor-en`: la x donde se lee la altura. */
  x0?: number;
}

export interface ResultadoCaso {
  ok: boolean;
  respuesta: Respuesta | null;
  /** El rasgo medido en la partida (NaN si `ok` es false). */
  antes: number;
  /** El rasgo medido tras mover el deslizador (NaN si `ok` es false). */
  despues: number;
  /** La explicación del mecanismo, con las cifras antes/después. Vacía si `ok` es false. */
  explicacion: string[];
  error?: string;
}

export interface OpcionRespuesta {
  valor: Respuesta;
  etiqueta: string;
}

export type MotivoComprobacion = 'acierto' | 'fallo' | 'vacia' | 'no-disponible';

export interface Comprobacion {
  correcto: boolean;
  motivo: MotivoComprobacion;
}

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  respuesta: Respuesta;
  pasos: string[];
  pista: string;
}

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  respuesta: Respuesta;
  pasos: string[];
}

// ============================================================
// CONSTANTES DEL CONVENIO
// ============================================================

/** La ventana que pinta el lienzo (X_MIN, X_MAX, Y_MIN, Y_MAX de `dibujar` en page.tsx). */
export const VENTANA = { xMin: -10, xMax: 10, yMin: -8, yMax: 8 } as const;

/** La rejilla de medida: x = i / DIVISIONES_POR_UNIDAD, con i entero. */
const DIVISIONES_POR_UNIDAD = 100;
const I_MIN = VENTANA.xMin * DIVISIONES_POR_UNIDAD;
const I_MAX = VENTANA.xMax * DIVISIONES_POR_UNIDAD;

/** El recorrido de cada deslizador (atributos min/max de los `<input type="range">`). */
export const LIMITES: Readonly<Record<Parametro, { min: number; max: number }>> = {
  a: { min: -3, max: 3 },
  b: { min: -3, max: 3 },
  c: { min: -5, max: 5 },
  d: { min: -5, max: 5 },
};

/** Por debajo de esto, «no cambia». */
export const UMBRAL_IGUAL = 1e-6;
/** Por debajo de esto el cambio existe pero no se ve: el escenario se rechaza (convenio 3). */
export const UMBRAL_VISIBLE = 0.05;
/** Una cresta a menos de esto de un borde es ambigua para el ojo (convenio 4), en centésimas. */
const MARGEN_CRESTAS = 15;

/** Qué rasgos tienen sentido en cada función base. */
export const RASGOS_DE: Readonly<Record<FuncionBase, readonly Rasgo[]>> = {
  sin: ['maximo', 'crestas', 'valor-en'],
  cos: ['maximo', 'crestas', 'valor-en'],
  cuadratica: ['x-vertice', 'y-vertice', 'valor-en'],
  absoluto: ['x-vertice', 'y-vertice', 'valor-en'],
  raiz: ['x-inicio', 'valor-en'],
};

const OPCIONES_HORIZONTAL: readonly OpcionRespuesta[] = [
  { valor: 'aumenta', etiqueta: 'Se desplaza a la derecha' },
  { valor: 'disminuye', etiqueta: 'Se desplaza a la izquierda' },
  { valor: 'no-cambia', etiqueta: 'No se mueve' },
];

const OPCIONES_VERTICAL: readonly OpcionRespuesta[] = [
  { valor: 'aumenta', etiqueta: 'Sube' },
  { valor: 'disminuye', etiqueta: 'Baja' },
  { valor: 'no-cambia', etiqueta: 'No cambia' },
];

const OPCIONES_CRESTAS: readonly OpcionRespuesta[] = [
  { valor: 'aumenta', etiqueta: 'Se ven más crestas' },
  { valor: 'disminuye', etiqueta: 'Se ven menos crestas' },
  { valor: 'no-cambia', etiqueta: 'Se ven las mismas' },
];

// ============================================================
// UTILIDADES
// ============================================================

/** Cifra para el alumno: entera si lo es, si no con 1 o 2 decimales (formato español). */
export function cifra(v: number): string {
  if (!Number.isFinite(v)) return formatNumber(v, 0);
  const r = Math.round(v * 100) / 100;
  if (Number.isInteger(r)) return formatNumber(r, 0);
  const decimales = Math.abs(r * 10 - Math.round(r * 10)) < 1e-9 ? 1 : 2;
  return formatNumber(r, decimales);
}

function conValor(p: Parametros, parametro: Parametro, valor: number): Parametros {
  return { ...p, [parametro]: valor };
}

function ecuacionDe(funcion: FuncionBase, p: Parametros): string {
  return construirEcuacion(funcion, p.a, p.b, p.c, p.d);
}

function evaluar(funcion: FuncionBase, p: Parametros, x: number): number {
  return evaluarTransformada(funcion, p.a, p.b, p.c, p.d, x);
}

function nombreFuncion(funcion: FuncionBase): string {
  return FUNCIONES_BASE.find(f => f.id === funcion)?.etiqueta ?? funcion;
}

/** ¿Es un valor que el deslizador de ese parámetro puede tomar? */
function enRejilla(parametro: Parametro, valor: number): boolean {
  if (!Number.isFinite(valor)) return false;
  const { min, max } = LIMITES[parametro];
  if (valor < min - 1e-9 || valor > max + 1e-9) return false;
  if (Math.abs(valor * 10 - Math.round(valor * 10)) > 1e-9) return false;
  if (parametro === 'b' && Math.abs(valor) < 1e-9) return false;
  return true;
}

function dentroX(x: number): boolean {
  return Number.isFinite(x) && x >= VENTANA.xMin && x <= VENTANA.xMax;
}

function dentroY(y: number): boolean {
  return Number.isFinite(y) && y >= VENTANA.yMin && y <= VENTANA.yMax;
}

/** El vértice de x² o |x| en la rejilla: el mínimo si a > 0, el máximo si a < 0. */
function localizarVertice(funcion: FuncionBase, p: Parametros): { x: number; y: number } | null {
  if (funcion !== 'cuadratica' && funcion !== 'absoluto') return null;
  if (p.a === 0) return null;
  let mejorI = Number.NaN;
  let mejorV = Number.NaN;
  for (let i = I_MIN; i <= I_MAX; i++) {
    const v = evaluar(funcion, p, i / DIVISIONES_POR_UNIDAD);
    if (!Number.isFinite(v)) continue;
    const mejora = Number.isNaN(mejorV) || (p.a > 0 ? v < mejorV : v > mejorV);
    if (mejora) {
      mejorI = i;
      mejorV = v;
    }
  }
  if (Number.isNaN(mejorV)) return null;
  return { x: mejorI / DIVISIONES_POR_UNIDAD, y: mejorV };
}

/** Máximos locales estrictos interiores de la muestra i ∈ [−limite, limite] (en centésimas). */
function contarCrestas(funcion: FuncionBase, p: Parametros, limite: number): number {
  const valores: number[] = [];
  for (let i = -limite; i <= limite; i++) valores.push(evaluar(funcion, p, i / DIVISIONES_POR_UNIDAD));
  let crestas = 0;
  for (let j = 1; j < valores.length - 1; j++) {
    const previo = valores[j - 1];
    const actual = valores[j];
    const siguiente = valores[j + 1];
    if (!Number.isFinite(previo) || !Number.isFinite(actual) || !Number.isFinite(siguiente)) continue;
    if (actual > previo && actual >= siguiente) crestas++;
  }
  return crestas;
}

function maximoDeRejilla(funcion: FuncionBase, p: Parametros): number {
  let maximo = Number.NaN;
  for (let i = I_MIN; i <= I_MAX; i++) {
    const v = evaluar(funcion, p, i / DIVISIONES_POR_UNIDAD);
    if (!Number.isFinite(v)) continue;
    if (Number.isNaN(maximo) || v > maximo) maximo = v;
  }
  return maximo;
}

// ============================================================
// MEDIR UN RASGO (ejecutando el motor del lienzo)
// ============================================================

/**
 * Mide un rasgo visible de la gráfica evaluando `evaluarTransformada` en la rejilla de la
 * ventana. Devuelve NaN si el rasgo no se puede medir con esa función o esos parámetros.
 */
export function medirRasgo(funcion: FuncionBase, p: Parametros, rasgo: Rasgo, x0?: number): number {
  switch (rasgo) {
    case 'x-vertice': {
      const vertice = localizarVertice(funcion, p);
      return vertice === null ? Number.NaN : vertice.x;
    }
    case 'y-vertice': {
      const vertice = localizarVertice(funcion, p);
      return vertice === null ? Number.NaN : vertice.y;
    }
    case 'x-inicio': {
      if (funcion !== 'raiz' || !(p.b > 0)) return Number.NaN;
      for (let i = I_MIN; i <= I_MAX; i++) {
        const x = i / DIVISIONES_POR_UNIDAD;
        if (Number.isFinite(evaluar(funcion, p, x))) return x;
      }
      return Number.NaN;
    }
    case 'maximo': {
      if (funcion !== 'sin' && funcion !== 'cos') return Number.NaN;
      return maximoDeRejilla(funcion, p);
    }
    case 'crestas': {
      if (funcion !== 'sin' && funcion !== 'cos') return Number.NaN;
      return contarCrestas(funcion, p, I_MAX);
    }
    case 'valor-en': {
      if (x0 === undefined || !Number.isFinite(x0)) return Number.NaN;
      return evaluar(funcion, p, x0);
    }
  }
}

/** Por qué un rasgo medido no se puede VER en la ventana, o null si se ve. */
function motivoNoVisible(funcion: FuncionBase, p: Parametros, rasgo: Rasgo, valor: number, x0?: number): string | null {
  if (!Number.isFinite(valor)) return 'El rasgo no se puede medir con estos valores.';
  switch (rasgo) {
    case 'x-vertice':
    case 'y-vertice': {
      const vertice = localizarVertice(funcion, p);
      if (vertice === null || !dentroX(vertice.x) || !dentroY(vertice.y)) {
        return 'El vértice queda fuera de la ventana de la gráfica.';
      }
      return null;
    }
    case 'x-inicio': {
      if (!dentroX(valor) || !dentroY(evaluar(funcion, p, valor))) {
        return 'El punto donde empieza la gráfica queda fuera de la ventana.';
      }
      return null;
    }
    case 'maximo': {
      if (!dentroY(valor)) return 'El punto más alto queda fuera de la ventana.';
      // Convenio 5: tiene que verse una cresta entera, cuya altura es |a| + d.
      if (Math.abs(valor - (Math.abs(p.a) + p.d)) >= UMBRAL_VISIBLE) {
        return 'En la ventana no se ve ninguna cresta completa.';
      }
      return null;
    }
    case 'crestas': {
      if (!dentroY(maximoDeRejilla(funcion, p))) return 'Las crestas quedan recortadas por arriba.';
      // Convenio 4: una cresta pegada al borde se ve a medias.
      const dentro = contarCrestas(funcion, p, I_MAX - MARGEN_CRESTAS);
      const fuera = contarCrestas(funcion, p, I_MAX + MARGEN_CRESTAS);
      if (dentro !== fuera) return 'Hay una cresta justo en el borde de la ventana: no se puede contar a ojo.';
      return null;
    }
    case 'valor-en': {
      if (x0 === undefined || !dentroX(x0)) return 'Ese punto queda fuera de la ventana.';
      if (!dentroY(valor)) return 'La gráfica pasa por ese punto fuera de la ventana.';
      return null;
    }
  }
}

// ============================================================
// OPCIONES Y COMPROBACIÓN
// ============================================================

/** Las tres opciones de un rasgo. Siempre las tres: quitar «no cambia» regalaría la respuesta. */
export function opcionesDe(rasgo: Rasgo): readonly OpcionRespuesta[] {
  switch (rasgo) {
    case 'x-vertice':
    case 'x-inicio':
      return OPCIONES_HORIZONTAL;
    case 'crestas':
      return OPCIONES_CRESTAS;
    case 'y-vertice':
    case 'maximo':
    case 'valor-en':
      return OPCIONES_VERTICAL;
  }
}

/** El texto de la opción correcta, tal y como se muestra en los botones. */
export function etiquetaRespuesta(rasgo: Rasgo, respuesta: Respuesta): string {
  return opcionesDe(rasgo).find(o => o.valor === respuesta)?.etiqueta ?? respuesta;
}

/** Compara la opción elegida con la que da el motor. */
export function comprobarPrediccion(eleccion: Respuesta | null, esperada: Respuesta | null): Comprobacion {
  if (esperada === null) return { correcto: false, motivo: 'no-disponible' };
  if (eleccion === null) return { correcto: false, motivo: 'vacia' };
  return eleccion === esperada ? { correcto: true, motivo: 'acierto' } : { correcto: false, motivo: 'fallo' };
}

// ============================================================
// LA EXPLICACIÓN DEL MECANISMO
// ============================================================

function mecanismoDelParametro(datos: DatosCaso): string {
  const viejo = datos.antes[datos.parametro];
  const nuevo = datos.nuevoValor;
  const cambiaSigno = Math.sign(viejo) !== Math.sign(nuevo);
  switch (datos.parametro) {
    case 'a': {
      const base =
        'a multiplica lo que sale de g: cada altura, medida desde la línea y = d, se multiplica por a. ' +
        'Si |a| crece, la gráfica se estira en vertical; si |a| baja, se aplasta.';
      return cambiaSigno
        ? `${base} Aquí además a cambia de signo, y eso voltea la gráfica respecto a la línea y = d: lo que estaba por encima pasa a estar por debajo (una reflexión).`
        : base;
    }
    case 'b': {
      const base =
        'b multiplica a x DENTRO de g: con |b| mayor que 1 la gráfica recorre lo mismo en menos espacio y se comprime en horizontal; con |b| menor que 1 se estira.';
      return cambiaSigno
        ? `${base} Aquí además b cambia de signo, y eso refleja la gráfica respecto a la recta vertical x = c, como en un espejo.`
        : base;
    }
    case 'c':
      return (
        'c se resta a x antes de entrar en g: f(x) = a·g(b·(x − c)) + d. Lo que g hacía en x = 0 ahora ocurre en x = c. ' +
        'Por eso c positivo desplaza la gráfica a la derecha y c negativo a la izquierda, aunque con c negativo la fórmula se lea «x + …».'
      );
    case 'd':
      return 'd se suma al final, fuera de g: cada punto de la gráfica sube d unidades (o baja, si d es negativo). La gráfica se traslada en vertical sin deformarse.';
  }
}

function paridad(funcion: FuncionBase): string {
  switch (funcion) {
    case 'cos':
      return 'cos es una función PAR: cos(−u) = cos(u). Cambiar el signo del argumento no cambia el valor.';
    case 'sin':
      return 'sin es una función IMPAR: sin(−u) = −sin(u). Cambiar el signo del argumento cambia el signo del valor.';
    case 'cuadratica':
      return 'x² es una función PAR: (−u)² = u². Cambiar el signo del argumento no cambia el valor.';
    case 'absoluto':
      return '|x| es una función PAR: |−u| = |u|. Cambiar el signo del argumento no cambia el valor.';
    case 'raiz':
      return '√x solo existe para argumentos positivos o cero: al cambiar el signo del argumento, la gráfica pasa al otro lado.';
  }
}

function efectoEnElRasgo(datos: DatosCaso, despuesP: Parametros, antes: number, despues: number): string {
  const { funcion, parametro, rasgo } = datos;
  const p0 = datos.antes;
  switch (rasgo) {
    case 'x-vertice': {
      if (parametro === 'c') {
        return `El vértice está donde el argumento de g vale 0, es decir, en x = c: pasa de x = ${cifra(antes)} a x = ${cifra(despues)}.`;
      }
      const giro =
        parametro === 'a' && Math.sign(p0.a) !== Math.sign(despuesP.a)
          ? ' Al voltearse, el vértice pasa de ser el punto más bajo a ser el más alto (o al revés), pero en la misma x.'
          : '';
      return `El vértice está donde el argumento de g vale 0, es decir, en x = c, y c no ha cambiado: ${parametro} no lo mueve a los lados. Sigue en x = ${cifra(antes)}.${giro}`;
    }
    case 'y-vertice': {
      if (parametro === 'd') {
        return `En el vértice g vale 0, así que su altura es a·0 + d = d: pasa de y = ${cifra(antes)} a y = ${cifra(despues)}.`;
      }
      const porque = parametro === 'a' ? ' Multiplicar 0 por a sigue dando 0.' : '';
      return `En el vértice g vale 0, así que su altura es a·0 + d = d, y d no ha cambiado.${porque} Sigue en y = ${cifra(antes)}.`;
    }
    case 'x-inicio': {
      if (parametro === 'c') {
        return `√ solo existe si lo de dentro es positivo o cero: b·(x − c) ≥ 0, que con b positivo es x ≥ c. El punto de partida pasa de x = ${cifra(antes)} a x = ${cifra(despues)}.`;
      }
      return `√ solo existe si lo de dentro es positivo o cero: b·(x − c) ≥ 0, que con b positivo es x ≥ c. Como c no ha cambiado, la gráfica sigue empezando en x = ${cifra(antes)}.`;
    }
    case 'maximo': {
      const regla = `${funcion} oscila entre −1 y 1, así que el punto más alto de a·${funcion}(…) + d está a una altura |a| + d.`;
      if (parametro === 'a' || parametro === 'd') {
        return `${regla} Pasa de ${cifra(antes)} a ${cifra(despues)}.`;
      }
      return `${regla} Cambiar ${parametro} solo mueve o aprieta la onda a lo ancho: no toca ni |a| ni d, así que sigue en ${cifra(antes)}.`;
    }
    case 'crestas': {
      const periodo = (b: number) => cifra((2 * Math.PI) / Math.abs(b));
      const cuenta = `Entre x = −10 y x = 10 se ven ${cifra(antes)} crestas antes y ${cifra(despues)} después.`;
      if (parametro === 'b') {
        return `El periodo de ${funcion} (lo que tarda en repetirse) es 2π ≈ 6,28; con b pasa a ser 2π/|b|: de ${periodo(p0.b)} a ${periodo(despuesP.b)}. Cuanto más corto el periodo, más ondas caben en las 20 unidades de la ventana. ${cuenta}`;
      }
      if (parametro === 'a') {
        return Math.sign(p0.a) !== Math.sign(despuesP.a)
          ? `Al voltearse, las crestas pasan a estar donde antes había valles, que están en otras x; la anchura de la onda no cambia. ${cuenta}`
          : `a solo cambia la altura de la onda, no su anchura: las crestas siguen en las mismas x. ${cuenta}`;
      }
      if (parametro === 'c') {
        return `Desplazar no cambia la anchura de la onda: las crestas se deslizan de lado, y alguna puede entrar o salir por un borde. ${cuenta}`;
      }
      return `Subir o bajar la gráfica no mueve las crestas a los lados. ${cuenta}`;
    }
    case 'valor-en': {
      const x0 = datos.x0 ?? 0;
      const u0 = p0.b * (x0 - p0.c);
      const u1 = despuesP.b * (x0 - despuesP.c);
      const g0 = evaluarBase(funcion, u0);
      const g1 = evaluarBase(funcion, u1);
      const lectura = `En x = ${cifra(x0)} lo de dentro de g es b·(x − c): ${cifra(u0)} antes y ${cifra(u1)} después.`;
      const valores = `f(${cifra(x0)}) = a·g + d pasa de ${cifra(antes)} a ${cifra(despues)}.`;
      if (parametro === 'b' && Math.abs(Math.abs(p0.b) - Math.abs(despuesP.b)) < 1e-9) {
        return `${lectura} ${paridad(funcion)} ${valores}`;
      }
      if (parametro === 'a' || parametro === 'd') {
        return `${lectura} Ese argumento no cambia, así que g vale lo mismo (${cifra(g0)}); lo que cambia es lo que se hace con él fuera. ${valores}`;
      }
      return `${lectura} Con otro argumento, g da otro valor: ${cifra(g0)} antes y ${cifra(g1)} después. ${valores}`;
    }
  }
}

function frasesRasgo(rasgo: Rasgo, x0?: number): string {
  switch (rasgo) {
    case 'x-vertice':
      return 'El vértice';
    case 'y-vertice':
      return 'La altura del vértice';
    case 'x-inicio':
      return 'El punto donde empieza la gráfica';
    case 'maximo':
      return 'El punto más alto de la gráfica';
    case 'crestas':
      return 'El número de crestas en la ventana';
    case 'valor-en':
      return `El valor de f(${cifra(x0 ?? 0)})`;
  }
}

function construirExplicacion(datos: DatosCaso, antes: number, despues: number, respuesta: Respuesta): string[] {
  const despuesP = conValor(datos.antes, datos.parametro, datos.nuevoValor);
  return [
    `Antes: ${ecuacionDe(datos.funcion, datos.antes)}. Después: ${ecuacionDe(datos.funcion, despuesP)}. Solo cambia ${datos.parametro}, de ${cifra(datos.antes[datos.parametro])} a ${cifra(datos.nuevoValor)}.`,
    mecanismoDelParametro(datos),
    efectoEnElRasgo(datos, despuesP, antes, despues),
    `${frasesRasgo(datos.rasgo, datos.x0)}: «${etiquetaRespuesta(datos.rasgo, respuesta)}». Carga el escenario y mueve el deslizador ${datos.parametro} para verlo.`,
  ];
}

// ============================================================
// RESOLVER UN CASO (sin mirar la respuesta declarada)
// ============================================================

function fallo(error: string): ResultadoCaso {
  return { ok: false, respuesta: null, antes: Number.NaN, despues: Number.NaN, explicacion: [], error };
}

/**
 * Mide el rasgo en la partida y tras mover el deslizador, con el motor del lienzo, y decide la
 * respuesta. Es la ÚNICA fuente de respuestas: la usan los doce casos fijos y el modo práctica.
 */
export function resolverCaso(datos: DatosCaso): ResultadoCaso {
  const { funcion, antes: p0, parametro, nuevoValor, rasgo, x0 } = datos;

  if (!FUNCIONES_BASE.some(f => f.id === funcion)) return fallo('Función base desconocida.');
  const parametros: readonly Parametro[] = ['a', 'b', 'c', 'd'];
  for (const nombre of parametros) {
    if (!enRejilla(nombre, p0[nombre])) {
      return fallo(`El valor de partida de ${nombre} no se puede poner con su deslizador.`);
    }
  }
  if (!parametros.includes(parametro)) return fallo('Parámetro desconocido.');
  if (!enRejilla(parametro, nuevoValor)) {
    return fallo(`El valor nuevo de ${parametro} no se puede poner con su deslizador.`);
  }
  if (Math.abs(nuevoValor - p0[parametro]) < 1e-9) {
    return fallo('El valor nuevo es el mismo que el de partida.');
  }
  if (!RASGOS_DE[funcion].includes(rasgo)) {
    return fallo(`Ese rasgo no tiene sentido con ${nombreFuncion(funcion)}.`);
  }
  if (rasgo === 'valor-en' && (x0 === undefined || !Number.isFinite(x0))) {
    return fallo('Falta la x donde se lee el valor.');
  }

  const p1 = conValor(p0, parametro, nuevoValor);
  const antes = medirRasgo(funcion, p0, rasgo, x0);
  const despues = medirRasgo(funcion, p1, rasgo, x0);

  const noVisibleAntes = motivoNoVisible(funcion, p0, rasgo, antes, x0);
  if (noVisibleAntes !== null) return fallo(`En la partida: ${noVisibleAntes}`);
  const noVisibleDespues = motivoNoVisible(funcion, p1, rasgo, despues, x0);
  if (noVisibleDespues !== null) return fallo(`Tras el cambio: ${noVisibleDespues}`);

  const diferencia = despues - antes;
  if (Math.abs(diferencia) >= UMBRAL_IGUAL && Math.abs(diferencia) < UMBRAL_VISIBLE) {
    return fallo('El cambio es demasiado pequeño para verse en la gráfica.');
  }

  const respuesta: Respuesta =
    Math.abs(diferencia) < UMBRAL_IGUAL ? 'no-cambia' : diferencia > 0 ? 'aumenta' : 'disminuye';

  return {
    ok: true,
    respuesta,
    antes,
    despues,
    explicacion: construirExplicacion(datos, antes, despues, respuesta),
  };
}

// ============================================================
// ENUNCIADOS
// ============================================================

function preguntaDe(rasgo: Rasgo, x0?: number): string {
  switch (rasgo) {
    case 'x-vertice':
      return '¿hacia dónde se mueve el vértice de la gráfica (su punto más bajo o más alto)?';
    case 'y-vertice':
      return '¿qué le pasa a la altura del vértice de la gráfica?';
    case 'x-inicio':
      return '¿hacia dónde se mueve el punto donde empieza la gráfica?';
    case 'maximo':
      return '¿qué le pasa a la altura del punto más alto de la gráfica?';
    case 'crestas':
      return 'entre x = −10 y x = 10, ¿se ven más crestas, menos o las mismas?';
    case 'valor-en': {
      const x = cifra(x0 ?? 0);
      return `¿qué le pasa al valor de f(${x}), la altura de la gráfica justo encima de x = ${x}?`;
    }
  }
}

/** El enunciado sale de los datos: partida (con la ecuación que muestra la app), cambio y pregunta. */
export function construirEnunciado(datos: DatosCaso, contexto?: string): string {
  const { funcion, antes: p, parametro, nuevoValor, rasgo, x0 } = datos;
  const despues = conValor(p, parametro, nuevoValor);
  const partida =
    `En el simulador, elige ${nombreFuncion(funcion)} y parte de ${ecuacionDe(funcion, p)} ` +
    `(a = ${cifra(p.a)}, b = ${cifra(p.b)}, c = ${cifra(p.c)}, d = ${cifra(p.d)}).`;
  const cambio =
    `Vas a mover el deslizador ${parametro} de ${cifra(p[parametro])} a ${cifra(nuevoValor)}, ` +
    `con lo que la fórmula pasa a ser ${ecuacionDe(funcion, despues)}.`;
  const pregunta = `Antes de moverlo, predice: ${preguntaDe(rasgo, x0)}`;
  return [contexto, partida, cambio, pregunta].filter(Boolean).join(' ');
}

// ============================================================
// LOS 12 CASOS
// ============================================================

interface Definicion {
  titulo: string;
  categoria: 'abstracto' | 'aplicado';
  /** Solo en los aplicados: la situación real que modela el cambio. */
  contexto?: string;
  datos: DatosCaso;
  pista: string;
}

const PARTIDA: Parametros = { a: 1, b: 1, c: 0, d: 0 };

/**
 * Solo se escriben a mano el título, el contexto, los datos y la pista. El enunciado, la
 * respuesta y la explicación salen de `construirEnunciado` y `resolverCaso`, que ejecuta el
 * motor del lienzo.
 */
const DEFINICIONES: readonly Definicion[] = [
  {
    titulo: 'Desplazar la parábola con c',
    categoria: 'abstracto',
    datos: { funcion: 'cuadratica', antes: PARTIDA, parametro: 'c', nuevoValor: 3, rasgo: 'x-vertice' },
    pista: 'Busca la x donde lo de dentro del paréntesis, x − c, vale 0.',
  },
  {
    titulo: 'El signo engañoso de (x + 2)²',
    categoria: 'abstracto',
    datos: { funcion: 'cuadratica', antes: PARTIDA, parametro: 'c', nuevoValor: -2, rasgo: 'x-vertice' },
    pista: 'Que en la fórmula aparezca un «+» no quiere decir que vaya a la derecha: ¿en qué x vale 0 el paréntesis x + 2?',
  },
  {
    titulo: 'Bajar el pico de |x|',
    categoria: 'abstracto',
    datos: { funcion: 'absoluto', antes: { a: 1, b: 1, c: 2, d: 1 }, parametro: 'd', nuevoValor: -3, rasgo: 'y-vertice' },
    pista: 'd se suma a todos los puntos de la gráfica, también al vértice.',
  },
  {
    titulo: 'Estirar no mueve el vértice',
    categoria: 'abstracto',
    datos: { funcion: 'cuadratica', antes: PARTIDA, parametro: 'a', nuevoValor: 3, rasgo: 'x-vertice' },
    pista: '¿Cuánto vale x² en el vértice? ¿Y 3 veces eso?',
  },
  {
    titulo: 'Voltear la parábola',
    categoria: 'abstracto',
    datos: {
      funcion: 'cuadratica',
      antes: { a: 1, b: 1, c: 0, d: 2 },
      parametro: 'a',
      nuevoValor: -1,
      rasgo: 'valor-en',
      x0: 2,
    },
    pista: 'Calcula a·x² + 2 en x = 2 con a = 1 y con a = −1.',
  },
  {
    titulo: 'Subir el volumen de una onda',
    categoria: 'aplicado',
    contexto:
      'Una onda de sonido se puede modelar con sin(x); el parámetro a hace de volumen, porque fija lo alto que suben las crestas.',
    datos: { funcion: 'sin', antes: PARTIDA, parametro: 'a', nuevoValor: 2.5, rasgo: 'maximo' },
    pista: 'sin(x) nunca pasa de 1. ¿Qué pasa si multiplicas todos sus valores por 2,5?',
  },
  {
    titulo: 'Retrasar una señal',
    categoria: 'aplicado',
    contexto:
      'Una señal periódica que llega un poco más tarde se modela desplazando la onda en horizontal con c, sin cambiar su forma.',
    datos: { funcion: 'sin', antes: PARTIDA, parametro: 'c', nuevoValor: 2, rasgo: 'maximo' },
    pista: 'Desplazar a un lado, ¿cambia lo alto que llega la onda?',
  },
  {
    titulo: 'Un tono más agudo',
    categoria: 'aplicado',
    contexto:
      'Un tono más agudo es una onda que vibra más veces en el mismo tiempo. En el modelo sin(b·x), eso se consigue aumentando b.',
    datos: { funcion: 'sin', antes: PARTIDA, parametro: 'b', nuevoValor: 2, rasgo: 'crestas' },
    pista: 'Con b = 2, sin(2x) completa una onda en la mitad de espacio que sin(x).',
  },
  {
    titulo: 'Un tono más grave',
    categoria: 'aplicado',
    contexto:
      'Un tono más grave es una onda que vibra menos veces en el mismo tiempo. En el modelo cos(b·x), eso se consigue bajando b.',
    datos: { funcion: 'cos', antes: PARTIDA, parametro: 'b', nuevoValor: 0.5, rasgo: 'crestas' },
    pista: 'Con b = 0,5 cada onda ocupa el doble de ancho: 4π ≈ 12,57 en lugar de 2π ≈ 6,28.',
  },
  {
    titulo: 'Reflejar el coseno',
    categoria: 'abstracto',
    datos: { funcion: 'cos', antes: PARTIDA, parametro: 'b', nuevoValor: -1, rasgo: 'valor-en', x0: 1 },
    pista: 'Con b = −1 se calcula cos(−1) en lugar de cos(1). Mira la gráfica de cos: ¿es simétrica respecto al eje vertical?',
  },
  {
    titulo: 'Reflejar el seno',
    categoria: 'abstracto',
    datos: { funcion: 'sin', antes: PARTIDA, parametro: 'b', nuevoValor: -1, rasgo: 'valor-en', x0: 1 },
    pista: 'Con b = −1 se calcula sin(−1) en lugar de sin(1). ¿El seno es simétrico respecto al eje vertical, o respecto al origen?',
  },
  {
    titulo: 'Dónde empieza la raíz',
    categoria: 'abstracto',
    datos: { funcion: 'raiz', antes: PARTIDA, parametro: 'c', nuevoValor: 4, rasgo: 'x-inicio' },
    pista: '√(x − 4) solo existe si x − 4 no es negativo.',
  },
];

function construirCaso(definicion: Definicion, indice: number): Caso {
  const resultado = resolverCaso(definicion.datos);
  return {
    id: indice + 1,
    titulo: definicion.titulo,
    enunciado: construirEnunciado(definicion.datos, definicion.contexto),
    categoria: definicion.categoria,
    datos: definicion.datos,
    // Si el motor rechazara un caso, `respuesta` quedaría en 'no-cambia' pero `resolverCaso`
    // devolvería null: la invariante 3 del test lo detecta.
    respuesta: resultado.respuesta ?? 'no-cambia',
    pasos: resultado.ok ? resultado.explicacion : [resultado.error ?? 'Caso no disponible.'],
    pista: definicion.pista,
  };
}

/** Los 12 casos fijos, con ids 1..12 sin huecos. */
export const CASOS: readonly Caso[] = DEFINICIONES.map(construirCaso);

export const TOTAL_CASOS: number = CASOS.length;

// ============================================================
// MODO PRÁCTICA (aleatorio, reproducible por semilla)
// ============================================================

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente
 * con 1, 2, 3… los primeros valores salen diminutos y parecidos, y `Math.floor(rnd() * n)`
 * devuelve el índice 0 para todas las semillas pequeñas: en `simulador-genetica` (14/09/2026)
 * el «aleatorio» daba SIEMPRE el mismo ejercicio y pasaba la prueba de reproducibilidad,
 * porque reproducible no es variado.
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

function elegir<T>(rnd: () => number, lista: readonly T[]): T {
  return lista[Math.floor(rnd() * lista.length)] ?? lista[0];
}

const FUNCIONES_PRACTICA: readonly FuncionBase[] = ['sin', 'cos', 'cuadratica', 'absoluto', 'raiz'];
const PARAMETROS_PRACTICA: readonly Parametro[] = ['a', 'b', 'c', 'd'];

/** Valores de partida: sencillos, para que la ecuación se lea de un vistazo. */
const PARTIDAS_PRACTICA: Readonly<Record<Parametro, readonly number[]>> = {
  a: [1, 1, 2, -1, 0.5],
  b: [1, 1, 2, 0.5, -1],
  c: [0, 0, 1, -1, 2, -2],
  d: [0, 0, 1, -1, 2, -2],
};

/** Valores a los que se mueve el deslizador: todos en su rejilla. */
const NUEVOS_PRACTICA: Readonly<Record<Parametro, readonly number[]>> = {
  a: [-2, -1, 0.5, 1, 1.5, 2, 3],
  b: [-2, -1, 0.5, 1, 2, 3],
  c: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
  d: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
};

const X0_PRACTICA: readonly number[] = [-3, -2, -1, 1, 2, 3];

const INTENTOS_PRACTICA = 200;

/** Escenario de reserva si el sorteo no diera con uno válido: el caso 1. */
const RESERVA_PRACTICA: DatosCaso = DEFINICIONES[0].datos;

/**
 * Ejercicio al azar: función, partida, parámetro, valor nuevo y rasgo compatible. Descarta los
 * candidatos que `resolverCaso` rechaza (rasgo fuera de la ventana, cambio que no se ve…) y usa
 * EL MISMO `resolverCaso` que los doce fijos: si divergieran, el alumno entrenaría con una
 * regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla: number = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  let datos: DatosCaso = RESERVA_PRACTICA;
  let resultado: ResultadoCaso = resolverCaso(RESERVA_PRACTICA);
  for (let intento = 0; intento < INTENTOS_PRACTICA; intento++) {
    const funcion = elegir(rnd, FUNCIONES_PRACTICA);
    const rasgo = elegir(rnd, RASGOS_DE[funcion]);
    const parametro = elegir(rnd, PARAMETROS_PRACTICA);
    const antes: Parametros = {
      a: elegir(rnd, PARTIDAS_PRACTICA.a),
      b: elegir(rnd, PARTIDAS_PRACTICA.b),
      c: elegir(rnd, PARTIDAS_PRACTICA.c),
      d: elegir(rnd, PARTIDAS_PRACTICA.d),
    };
    const nuevoValor = elegir(rnd, NUEVOS_PRACTICA[parametro]);
    const candidato: DatosCaso =
      rasgo === 'valor-en'
        ? { funcion, antes, parametro, nuevoValor, rasgo, x0: elegir(rnd, X0_PRACTICA) }
        : { funcion, antes, parametro, nuevoValor, rasgo };
    const prueba = resolverCaso(candidato);
    // Muchos parámetros no tocan muchos rasgos, así que «no cambia» saldría casi la mitad de
    // las veces y el alumno aprendería a apostar por ella. Se descarta uno de cada dos.
    if (prueba.respuesta === 'no-cambia' && rnd() < 0.5) continue;
    if (prueba.ok && prueba.respuesta !== null) {
      datos = candidato;
      resultado = prueba;
      break;
    }
  }
  return {
    semilla,
    enunciado: construirEnunciado(datos),
    datos,
    respuesta: resultado.respuesta ?? 'no-cambia',
    pasos: resultado.ok ? resultado.explicacion : [resultado.error ?? 'Ejercicio no disponible.'],
  };
}
