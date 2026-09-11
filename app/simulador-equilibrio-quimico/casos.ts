/**
 * Motor del Simulador de Equilibrio Químico y de sus 12 casos para clase.
 *
 * Este módulo NO es solo el de los casos: es el motor entero de la app, que vivía dentro de
 * `page.tsx` y se movió aquí el 11/09/2026. La razón es la regla que gobierna toda esta
 * sistemática: si los casos calcularan el equilibrio con un convenio y el simulador con
 * otro, la app suspendería una respuesta que ella misma produce. Moverlo —en vez de
 * replicarlo— hace que eso sea imposible, porque solo hay una implementación. `page.tsx`
 * reimporta de aquí `REACCIONES`, `calcularQ`, `nuevoEquilibrio`, `deltaN`,
 * `nuevoKcConTemperatura` y `equilibrioDePartida`, y no calcula nada por su cuenta.
 *
 * Y vive fuera de la vista por lo de siempre: el build compila la página sin comprobar si la
 * química está bien. Un Kc calculado con los exponentes cambiados compila igual de limpio
 * que el correcto.
 *
 * POR QUÉ ESTA APP TIENE DOS TIPOS DE CASO Y NO UNO
 * ────────────────────────────────────────────────
 * El equilibrio químico se pregunta de dos maneras distintas en clase, y las dos hacen
 * falta:
 *
 * · Los casos 1 a 6 son NUMÉRICOS: calcular Q, Δn o la Kc a otra temperatura. Se responden
 *   con un número y se corrigen con tolerancia.
 * · Los casos 7 a 12 son de PREDICCIÓN: hacia dónde se desplaza el equilibrio al añadir un
 *   reactivo, subir la temperatura o comprimir. Se responden eligiendo entre tres opciones
 *   —derecha, izquierda o no se desplaza— y el alumno se compromete ANTES de tocar los
 *   controles. Ese compromiso previo es todo el valor pedagógico: mover un deslizador y ver
 *   la gráfica no enseña nada si no había una hipótesis que confirmar o romper.
 *
 * LA REGLA QUE HACE VIABLES LOS CASOS DE PREDICCIÓN
 * ────────────────────────────────────────────────
 * Una pregunta cualitativa suena bien aunque no tenga respuesta única, y ese es el riesgo
 * específico de este tipo de caso. Aquí la respuesta correcta NO está escrita a mano en
 * ninguna tabla: sale de `simularPerturbacion`, que ejecuta el mismo modelo que el
 * simulador —perturba el estado, recalcula el equilibrio y mide el avance ξ— y deduce la
 * dirección del signo de ese avance. Si el modelo no supiera responder, el caso no entraría.
 *
 * EL CONVENIO DE CÁLCULO (lo que de verdad importa en esta app)
 * ────────────────────────────────────────────────────────────
 * 1. QUÉ ENTRA EN Q Y EN Kc. Los sólidos y los líquidos puros NO entran: solo gases (g) y
 *    especies en disolución (aq). La excepción didáctica es la esterificación, que al ser
 *    TODA líquida se trata como una disolución y entonces sí entran las cuatro especies.
 *    Es el convenio del simulador, y los casos lo heredan por usar su misma función.
 *
 * 2. Δn SE CUENTA SOLO SOBRE GASES. Δn = (moles de gas en productos) − (moles de gas en
 *    reactivos). Es lo que decide si la presión afecta: con Δn = 0 comprimir no desplaza
 *    nada, y el caso 11 existe justo para que eso se vea.
 *
 * 3. EXOTÉRMICA ⟺ ΔH < 0. Es la única definición que usa la app. No hay un campo booleano
 *    aparte que pueda contradecir al signo —lo hubo, y se contradijeron.
 *
 * 4. LAS Kc SON DIDÁCTICAS, NO TABULADAS. Están elegidas para que la simulación se vea: la
 *    Kc real del proceso Haber-Bosch a 298 K es del orden de 10⁸ y la del proceso de
 *    contacto, de 10²⁶. Lo que sí es real —y es lo que la app enseña— son los ΔH, el signo
 *    del desplazamiento y cómo cambia Kc con la temperatura según van 't Hoff. Los
 *    enunciados de los casos no presentan estos valores como constantes medidas.
 *
 * LOS 12 CASOS SON DETERMINISTAS Y UNIVERSALES: el caso 3 es el mismo para todo el mundo,
 * hoy y dentro de un año. Es lo único que hace que «resuelve los casos 3, 7 y 11» funcione
 * como consigna de clase.
 */

import { parseSpanishNumber } from '@/lib';

export type EstadoFisico = 'g' | 'l' | 's' | 'aq';
export type DireccionDesplazamiento = 'derecha' | 'izquierda' | 'equilibrio';

export interface Especie {
  simbolo: string;
  coef: number;
  estado: EstadoFisico;
}

export interface Reaccion {
  id: string;
  nombre: string;
  ecuacion: string;
  reactivos: Especie[];
  productos: Especie[];
  Kc: number;
  /**
   * ΔH de reacción en kJ/mol. El SIGNO ya dice si es exotérmica (ΔH<0) o endotérmica
   * (ΔH>0), así que no hay un campo `exotermica` aparte: tenerlo permitía que se
   * contradijeran, y eso es lo que pasó — la esterificación llevaba `exotermica: false`
   * con `deltaH: -3` y la tarjeta se rotulaba «endotérmica · ΔH = -3 kJ/mol», que es
   * imposible (hallazgo 172).
   */
  deltaH: number; // kJ/mol
  contexto: string;
  // Concentraciones iniciales sugeridas (orden = reactivos + productos)
  inicialesSugeridas: Record<string, number>;
}

export type TipoPerturbacion =
  | 'anadir-reactivo'
  | 'quitar-reactivo'
  | 'anadir-producto'
  | 'quitar-producto'
  | 'subir-temperatura'
  | 'bajar-temperatura'
  | 'comprimir'
  | 'expandir'
  | 'catalizador';

export interface Perturbacion {
  tipo: TipoPerturbacion;
  especie?: string;
  cantidad?: number;
  descripcion: string;
}

// ============================================================
// Reacciones del simulador
// ============================================================

export const REACCIONES: Reaccion[] = [
  {
    id: 'haber-bosch',
    nombre: 'Síntesis de amoníaco (Haber-Bosch)',
    ecuacion: 'N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g)',
    reactivos: [
      { simbolo: 'N₂', coef: 1, estado: 'g' },
      { simbolo: 'H₂', coef: 3, estado: 'g' },
    ],
    productos: [{ simbolo: 'NH₃', coef: 2, estado: 'g' }],
    Kc: 0.5,
    deltaH: -92,
    contexto: 'Producción industrial de fertilizantes. Δn = 2 − 4 = −2 (mol gas).',
    inicialesSugeridas: { 'N₂': 1.0, 'H₂': 3.0, 'NH₃': 0.5 },
  },
  {
    id: 'esterificacion',
    nombre: 'Esterificación (acetato de etilo)',
    ecuacion: 'CH₃COOH(l) + C₂H₅OH(l) ⇌ CH₃COOC₂H₅(l) + H₂O(l)',
    reactivos: [
      { simbolo: 'CH₃COOH', coef: 1, estado: 'l' },
      { simbolo: 'C₂H₅OH', coef: 1, estado: 'l' },
    ],
    productos: [
      { simbolo: 'CH₃COOC₂H₅', coef: 1, estado: 'l' },
      { simbolo: 'H₂O', coef: 1, estado: 'l' },
    ],
    Kc: 4.0,
    deltaH: -3,
    contexto: 'Equilibrio en disolución líquida. Δn = 0, la presión no afecta.',
    inicialesSugeridas: { 'CH₃COOH': 1.0, 'C₂H₅OH': 1.0, 'CH₃COOC₂H₅': 0.2, 'H₂O': 0.2 },
  },
  {
    id: 'pcl5',
    nombre: 'Disociación de PCl₅',
    ecuacion: 'PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)',
    reactivos: [{ simbolo: 'PCl₅', coef: 1, estado: 'g' }],
    productos: [
      { simbolo: 'PCl₃', coef: 1, estado: 'g' },
      { simbolo: 'Cl₂', coef: 1, estado: 'g' },
    ],
    Kc: 0.04,
    deltaH: 88,
    contexto: 'Reacción endotérmica. Δn = +1: la presión sí afecta.',
    inicialesSugeridas: { 'PCl₅': 1.0, 'PCl₃': 0.1, 'Cl₂': 0.1 },
  },
  {
    id: 'so3',
    nombre: 'Síntesis de SO₃ (proceso de contacto)',
    ecuacion: '2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g)',
    reactivos: [
      { simbolo: 'SO₂', coef: 2, estado: 'g' },
      { simbolo: 'O₂', coef: 1, estado: 'g' },
    ],
    productos: [{ simbolo: 'SO₃', coef: 2, estado: 'g' }],
    Kc: 4.32,
    deltaH: -198,
    contexto: 'Producción de ácido sulfúrico. Δn = −1: comprimir favorece productos.',
    inicialesSugeridas: { 'SO₂': 1.0, 'O₂': 0.5, 'SO₃': 0.5 },
  },
  {
    id: 'no2-n2o4',
    nombre: 'Equilibrio NO₂ / N₂O₄',
    ecuacion: '2 NO₂(g) ⇌ N₂O₄(g)',
    reactivos: [{ simbolo: 'NO₂', coef: 2, estado: 'g' }],
    productos: [{ simbolo: 'N₂O₄', coef: 1, estado: 'g' }],
    Kc: 170,
    deltaH: -57,
    contexto: 'Equilibrio rojizo/incoloro clásico. Δn = −1.',
    inicialesSugeridas: { 'NO₂': 0.2, 'N₂O₄': 1.0 },
  },
  {
    id: 'water-gas-shift',
    nombre: 'Water-gas shift (CO + H₂O)',
    ecuacion: 'CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)',
    reactivos: [
      { simbolo: 'CO', coef: 1, estado: 'g' },
      { simbolo: 'H₂O', coef: 1, estado: 'g' },
    ],
    productos: [
      { simbolo: 'CO₂', coef: 1, estado: 'g' },
      { simbolo: 'H₂', coef: 1, estado: 'g' },
    ],
    Kc: 5.0,
    deltaH: -41,
    contexto: 'Producción de hidrógeno industrial. Δn = 0, P no afecta.',
    inicialesSugeridas: { 'CO': 1.0, 'H₂O': 1.0, 'CO₂': 0.5, 'H₂': 0.5 },
  },
];

// ============================================================
// Funciones de cálculo
// ============================================================

function especieParticipaEnK(estado: EstadoFisico, reaccionTodaEnLiquido: boolean): boolean {
  // Sólidos y líquidos puros NO entran en Kc.
  // Excepción didáctica: la esterificación se trata como en disolución, así que
  // si TODA la reacción es líquida, las concentraciones sí entran en Kc.
  if (reaccionTodaEnLiquido) return true;
  return estado === 'g' || estado === 'aq';
}

export function calcularQ(reaccion: Reaccion, concentraciones: Record<string, number>): number {
  const todaEnLiquido =
    reaccion.reactivos.every((e) => e.estado === 'l') &&
    reaccion.productos.every((e) => e.estado === 'l');

  let numerador = 1;
  let denominador = 1;
  let hayNumerador = false;
  let hayDenominador = false;

  for (const p of reaccion.productos) {
    if (especieParticipaEnK(p.estado, todaEnLiquido)) {
      const c = Math.max(concentraciones[p.simbolo] ?? 0, 1e-12);
      numerador *= Math.pow(c, p.coef);
      hayNumerador = true;
    }
  }
  for (const r of reaccion.reactivos) {
    if (especieParticipaEnK(r.estado, todaEnLiquido)) {
      const c = concentraciones[r.simbolo] ?? 0;
      // Con un reactivo agotado el cociente DIVERGE. Antes se sustituía por un suelo de
      // 1e-12 y el resultado —«9.259.259.259,2593»— se presentaba como una cifra exacta a
      // cuatro decimales: el epsilon interno asomando en pantalla (hallazgo 175). Se
      // devuelve Infinity y la interfaz lo rotula como lo que es.
      if (c === 0) return Infinity;
      denominador *= Math.pow(c, r.coef);
      hayDenominador = true;
    }
  }
  if (!hayNumerador) numerador = 1;
  if (!hayDenominador) denominador = 1;
  return numerador / denominador;
}

export function deltaN(reaccion: Reaccion): number {
  const sumProd = reaccion.productos
    .filter((e) => e.estado === 'g')
    .reduce((s, e) => s + e.coef, 0);
  const sumReact = reaccion.reactivos
    .filter((e) => e.estado === 'g')
    .reduce((s, e) => s + e.coef, 0);
  return sumProd - sumReact;
}

/**
 * Calcula nuevo equilibrio resolviendo numéricamente el avance ξ tal que Q(ξ) = Kc.
 * Usa búsqueda binaria sobre el rango físicamente posible de ξ.
 */
export function nuevoEquilibrio(
  reaccion: Reaccion,
  concentraciones: Record<string, number>,
  KcEfectiva: number,
): Record<string, number> {
  const todaEnLiquido =
    reaccion.reactivos.every((e) => e.estado === 'l') &&
    reaccion.productos.every((e) => e.estado === 'l');

  // Rango de ξ
  // ξ > 0: avanza hacia productos, consume reactivos. Limit: min(c[r]/coef)
  let ximax = Infinity;
  for (const r of reaccion.reactivos) {
    if (especieParticipaEnK(r.estado, todaEnLiquido)) {
      const c = concentraciones[r.simbolo] ?? 0;
      ximax = Math.min(ximax, c / r.coef);
    }
  }
  // ξ < 0: avanza hacia reactivos, consume productos. Limit: -min(c[p]/coef)
  let ximin = -Infinity;
  for (const p of reaccion.productos) {
    if (especieParticipaEnK(p.estado, todaEnLiquido)) {
      const c = concentraciones[p.simbolo] ?? 0;
      ximin = Math.max(ximin, -c / p.coef);
    }
  }
  if (!isFinite(ximax)) ximax = 100;
  if (!isFinite(ximin)) ximin = -100;

  // f(ξ) = Q(concentraciones desplazadas en ξ) - Kc
  const f = (xi: number): number => {
    const conc: Record<string, number> = {};
    for (const r of reaccion.reactivos) {
      conc[r.simbolo] = Math.max((concentraciones[r.simbolo] ?? 0) - r.coef * xi, 1e-12);
    }
    for (const p of reaccion.productos) {
      conc[p.simbolo] = Math.max((concentraciones[p.simbolo] ?? 0) + p.coef * xi, 1e-12);
    }
    return calcularQ(reaccion, conc) - KcEfectiva;
  };

  // Búsqueda binaria con ε
  const eps = 1e-6;
  let lo = ximin + eps;
  let hi = ximax - eps;
  const flo = f(lo);
  const fhi = f(hi);
  let xi = 0;
  if (flo * fhi > 0) {
    /**
     * No hay raíz DENTRO del rango, y eso no es un caso patológico: es una reacción
     * prácticamente completa. La solución está en el extremo, así que el avance es el
     * extremo mismo.
     *
     * Hasta el 11/09/2026 esta rama devolvía las concentraciones sin tocar, y el efecto se
     * veía en pantalla: con el proceso de contacto (2 SO₂ + O₂ ⇌ 2 SO₃, ΔH = −198 kJ/mol)
     * bastaba subir la temperatura por encima de unos 470 K para que la Kc cayera a 4·10⁻¹⁴
     * y el simulador dejara de moverse. El alumno subía el deslizador esperando ver
     * descomponerse el SO₃ —que es LA lección de Le Chatelier en una reacción exotérmica— y
     * no pasaba nada, sin ningún aviso. El rango de temperatura llega a 2.000 K, así que la
     * zona muda era perfectamente alcanzable.
     *
     * La causa es el ε de 1e-6 con el que se recortan los extremos: impide acercarse lo
     * suficiente al agotamiento del producto como para que Q baje por debajo de una Kc tan
     * pequeña, de modo que f queda con el mismo signo en los dos extremos.
     *
     * Con f > 0 en todo el rango, Q supera a Kc en cualquier punto y el sistema retrocede
     * todo lo que puede (xi = lo, negativo); con f < 0, avanza todo lo que puede (xi = hi).
     */
    xi = flo > 0 ? lo : hi;
    const extremo: Record<string, number> = {};
    for (const r of reaccion.reactivos) {
      extremo[r.simbolo] = Math.max((concentraciones[r.simbolo] ?? 0) - r.coef * xi, 0);
    }
    for (const p of reaccion.productos) {
      extremo[p.simbolo] = Math.max((concentraciones[p.simbolo] ?? 0) + p.coef * xi, 0);
    }
    return extremo;
  }
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-9) {
      xi = mid;
      break;
    }
    if (fm * f(lo) < 0) {
      hi = mid;
    } else {
      lo = mid;
    }
    xi = mid;
  }

  const resultado: Record<string, number> = {};
  for (const r of reaccion.reactivos) {
    resultado[r.simbolo] = Math.max((concentraciones[r.simbolo] ?? 0) - r.coef * xi, 0);
  }
  for (const p of reaccion.productos) {
    resultado[p.simbolo] = Math.max((concentraciones[p.simbolo] ?? 0) + p.coef * xi, 0);
  }
  return resultado;
}

/**
 * Ecuación de van't Hoff simplificada: ln(K2/K1) = -ΔH/R · (1/T2 − 1/T1)
 * R = 8.314 J/(mol·K), ΔH en J/mol
 */
/**
 * Temperatura de referencia del simulador, en kelvin, y ancla de van 't Hoff.
 *
 * ⚠️ Las Kc de este simulador son DIDÁCTICAS: valores elegidos para que la simulación sea
 * legible, no constantes tabuladas. Hasta el 23/08/2026 la interfaz las rotulaba «Kc (a
 * 298 K, referencia)», y eso era falso para cuatro de las seis reacciones: la Kc real a
 * 298 K del proceso Haber-Bosch es del orden de 10⁸, y la del proceso de contacto, de 10²⁶
 * (hallazgo 173). Con esos números la simulación no se puede ver, así que se usan valores
 * de aula — pero no se presentan como lo que no son.
 *
 * Lo que SÍ es real y es lo que la app enseña: los ΔH de cada reacción, el signo del
 * desplazamiento y cómo cambia Kc con la temperatura según van 't Hoff. Esa física es
 * correcta sea cual sea el valor de partida.
 */
export const T_REFERENCIA_K = 298;

/** Rango de temperatura que admite el simulador, en kelvin (no hay temperaturas absolutas negativas) */
export const T_MIN_K = 100;
export const T_MAX_K = 2000;

/**
 * Equilibrio de partida, redondeado a cuatro decimales.
 *
 * `nuevoEquilibrio` resuelve numéricamente y devuelve valores como 0,5964470977695575, que
 * es exacto pero ilegible en un campo de concentración. Cuatro decimales bastan de sobra:
 * la tolerancia con la que la app decide «⇌ Equilibrio» es del 2 %.
 */
export function equilibrioDePartida(reaccion: Reaccion): Record<string, number> {
  const eq = nuevoEquilibrio(reaccion, reaccion.inicialesSugeridas, reaccion.Kc);
  return Object.fromEntries(Object.entries(eq).map(([k, v]) => [k, Math.round(v * 10000) / 10000]));
}

/** Exotérmica ⟺ ΔH < 0. Es la ÚNICA definición que usa la app, para que no pueda divergir. */
export function esExotermicaDe(deltaH: number): boolean {
  return deltaH < 0;
}

export function nuevoKcConTemperatura(
  KcInicial: number,
  deltaH_kJmol: number,
  T1: number,
  T2: number,
): number {
  if (T1 === T2) return KcInicial;
  const R = 8.314;
  const dHJ = deltaH_kJmol * 1000;
  const lnRatio = (-dHJ / R) * (1 / T2 - 1 / T1);
  return KcInicial * Math.exp(lnRatio);
}


// ============================================================
// CASOS PARA CLASE — tipos
// ============================================================

/** Qué magnitud pide un caso numérico. Cada valor tiene su rama en `resolverCasoNumerico`. */
export type MagnitudPedida = 'cociente-Q' | 'delta-n' | 'Kc-a-temperatura';

/** Qué se le hace al equilibrio en un caso de predicción. */
export type PerturbacionCaso =
  | 'anadir-especie'
  | 'quitar-especie'
  | 'cambiar-temperatura'
  | 'cambiar-volumen'
  | 'catalizador';

/** Todo lo necesario para recalcular un caso numérico sin mirar su respuesta. */
export interface DatosNumericos {
  magnitud: MagnitudPedida;
  reaccionId: string;
  /** Estado del sistema, para `cociente-Q`. */
  concentraciones?: Record<string, number>;
  /** Temperatura final en kelvin, para `Kc-a-temperatura`. */
  temperaturaFinalK?: number;
}

/** Todo lo necesario para recalcular un caso de predicción sin mirar su respuesta. */
export interface DatosPrediccion {
  perturbacion: PerturbacionCaso;
  reaccionId: string;
  /** Especie que se añade o se retira. */
  especie?: string;
  /** Cuánto se añade (o se retira, si es negativo), en mol/L. */
  cantidad?: number;
  /** Temperatura final en kelvin. */
  temperaturaFinalK?: number;
  /**
   * Factor por el que se multiplica el VOLUMEN. Comprimir a la mitad es 0,5, y entonces
   * todas las concentraciones se duplican.
   */
  factorVolumen?: number;
}

export interface CasoNumerico {
  id: number;
  tipo: 'numerico';
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosNumericos;
  ecuacion: string;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  pasos: readonly string[];
  pista: string;
  requiereRedondeo: boolean;
}

export interface CasoPrediccion {
  id: number;
  tipo: 'prediccion';
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosPrediccion;
  ecuacion: string;
  etiquetaRespuesta: string;
  /** Las tres opciones cerradas, siempre en el mismo orden. */
  opciones: readonly DireccionDesplazamiento[];
  respuesta: DireccionDesplazamiento;
  respuestaTexto: string;
  /** Aquí los «pasos» son el MECANISMO, no un desarrollo aritmético. */
  pasos: readonly string[];
  pista: string;
}

export type CasoEquilibrio = CasoNumerico | CasoPrediccion;

export interface Comprobacion {
  correcto: boolean;
  motivo: 'acierto' | 'fallo' | 'vacia' | 'no-numerico';
  diferencia?: number;
  tolerancia?: number;
}

// ============================================================
// RESOLUCIÓN DE LOS CASOS NUMÉRICOS
// ============================================================

export interface ResultadoNumerico {
  ok: boolean;
  valor: number;
  error: string | null;
}

function reaccionDe(id: string): Reaccion | null {
  return REACCIONES.find((r) => r.id === id) ?? null;
}

/**
 * Recalcula un caso numérico desde sus `datos`, SIN mirar la respuesta declarada.
 *
 * Nada lanza: un dato que falta sale como `{ ok: false }` con su motivo. Un `throw` dentro
 * de un render de React tumbaría la app entera; un resultado no-ok se pinta como aviso.
 */
export function resolverCasoNumerico(datos: DatosNumericos): ResultadoNumerico {
  const reaccion = reaccionDe(datos.reaccionId);
  if (reaccion === null) return { ok: false, valor: NaN, error: 'Esa reacción no existe' };

  switch (datos.magnitud) {
    case 'cociente-Q': {
      if (datos.concentraciones === undefined)
        return { ok: false, valor: NaN, error: 'Faltan las concentraciones' };
      const q = calcularQ(reaccion, datos.concentraciones);
      return Number.isFinite(q)
        ? { ok: true, valor: q, error: null }
        : { ok: false, valor: NaN, error: 'Hay un reactivo agotado: el cociente diverge' };
    }
    case 'delta-n':
      return { ok: true, valor: deltaN(reaccion), error: null };
    case 'Kc-a-temperatura': {
      if (datos.temperaturaFinalK === undefined)
        return { ok: false, valor: NaN, error: 'Falta la temperatura' };
      const k = nuevoKcConTemperatura(
        reaccion.Kc,
        reaccion.deltaH,
        T_REFERENCIA_K,
        datos.temperaturaFinalK,
      );
      return Number.isFinite(k)
        ? { ok: true, valor: k, error: null }
        : { ok: false, valor: NaN, error: 'La constante se sale del rango representable' };
    }
  }
}

// ============================================================
// RESOLUCIÓN DE LOS CASOS DE PREDICCIÓN
// ============================================================

export interface ResultadoPrediccion {
  ok: boolean;
  direccion: DireccionDesplazamiento;
  /** Avance de reacción ξ del reajuste. Su SIGNO es lo que decide la dirección. */
  avance: number;
  /** El equilibrio de partida, a la temperatura de referencia. */
  antes: Record<string, number>;
  /** El estado justo después de la perturbación, antes de que el sistema reaccione. */
  perturbado: Record<string, number>;
  /** El nuevo equilibrio al que llega el sistema. */
  despues: Record<string, number>;
  KcEfectiva: number;
  error: string | null;
}

/**
 * Umbral por debajo del cual un avance se considera nulo.
 *
 * No es un capricho: `equilibrioDePartida` redondea a cuatro decimales, así que el punto de
 * partida no está EXACTAMENTE en equilibrio y volver a resolverlo deja siempre un ξ residual
 * del orden de 1e-5. Sin umbral, el caso del catalizador —que no desplaza nada— saldría
 * desplazándose un pelo hacia algún lado. El umbral es relativo a la escala de
 * concentraciones del sistema, para que valga igual en una reacción de 0,2 mol/L que en una
 * de 3 mol/L.
 */
function umbralDeAvance(concentraciones: Record<string, number>): number {
  const escala = Math.max(...Object.values(concentraciones), 0.1);
  return Math.max(1e-4, escala * 1e-3);
}

/**
 * Ejecuta una perturbación sobre el equilibrio de una reacción y devuelve hacia dónde se
 * desplaza.
 *
 * Es la función que garantiza que los casos de predicción tienen una única respuesta
 * correcta: la dirección NO se declara, se deduce del signo del avance ξ que calcula el
 * mismo motor que mueve el simulador.
 *
 * ⚠️ El desplazamiento se mide comparando el nuevo equilibrio con el estado PERTURBADO, no
 * con el de partida. Es la diferencia que decide bien el caso de la compresión: al reducir
 * el volumen a la mitad, todas las concentraciones se duplican de golpe —incluidas las de
 * los productos—, así que comparar con el estado inicial diría «hacia la derecha» siempre,
 * incluso cuando el equilibrio no se mueve. Lo que es el desplazamiento es el REAJUSTE.
 */
export function simularPerturbacion(datos: DatosPrediccion): ResultadoPrediccion {
  const fallo = (error: string): ResultadoPrediccion => ({
    ok: false,
    direccion: 'equilibrio',
    avance: NaN,
    antes: {},
    perturbado: {},
    despues: {},
    KcEfectiva: NaN,
    error,
  });

  const reaccion = reaccionDe(datos.reaccionId);
  if (reaccion === null) return fallo('Esa reacción no existe');

  const antes = equilibrioDePartida(reaccion);
  let perturbado: Record<string, number> = { ...antes };
  let KcEfectiva = reaccion.Kc;

  switch (datos.perturbacion) {
    case 'anadir-especie':
    case 'quitar-especie': {
      if (datos.especie === undefined || datos.cantidad === undefined)
        return fallo('Faltan la especie o la cantidad');
      if (!(datos.especie in antes)) return fallo('Esa especie no participa en la reacción');
      const signo = datos.perturbacion === 'anadir-especie' ? 1 : -1;
      const nueva = antes[datos.especie] + signo * datos.cantidad;
      if (nueva <= 0) return fallo('La perturbación agotaría esa especie');
      perturbado[datos.especie] = nueva;
      break;
    }
    case 'cambiar-temperatura': {
      if (datos.temperaturaFinalK === undefined) return fallo('Falta la temperatura');
      if (datos.temperaturaFinalK < T_MIN_K || datos.temperaturaFinalK > T_MAX_K)
        return fallo('Esa temperatura está fuera del rango del simulador');
      KcEfectiva = nuevoKcConTemperatura(
        reaccion.Kc,
        reaccion.deltaH,
        T_REFERENCIA_K,
        datos.temperaturaFinalK,
      );
      break;
    }
    case 'cambiar-volumen': {
      if (datos.factorVolumen === undefined || datos.factorVolumen <= 0)
        return fallo('Falta el factor de volumen');
      // Reducir el volumen a la mitad (factor 0,5) DUPLICA todas las concentraciones.
      const factorConcentracion = 1 / datos.factorVolumen;
      perturbado = Object.fromEntries(
        Object.entries(antes).map(([especie, c]) => [especie, c * factorConcentracion]),
      );
      break;
    }
    case 'catalizador':
      // Un catalizador acelera los dos sentidos por igual: no cambia Kc ni el estado.
      break;
  }

  if (!Number.isFinite(KcEfectiva) || KcEfectiva <= 0)
    return fallo('La constante se sale del rango representable');

  const despues = nuevoEquilibrio(reaccion, perturbado, KcEfectiva);

  // El avance ξ se lee en el primer producto: su concentración cambia en +coef · ξ.
  const producto = reaccion.productos[0];
  const avance = (despues[producto.simbolo] - perturbado[producto.simbolo]) / producto.coef;

  const umbral = umbralDeAvance(perturbado);
  const direccion: DireccionDesplazamiento =
    Math.abs(avance) < umbral ? 'equilibrio' : avance > 0 ? 'derecha' : 'izquierda';

  return { ok: true, direccion, avance, antes, perturbado, despues, KcEfectiva, error: null };
}

// ============================================================
// COMPROBACIÓN DE RESPUESTAS
// ============================================================

/** El mayor entre 0,01 y el 1 % del valor. Mismo convenio que el resto del catálogo. */
export function toleranciaDe(valorEsperado: number): number {
  return Math.max(0.01, Math.abs(valorEsperado) * 0.01);
}

/**
 * Compara la respuesta numérica del alumno con la esperada.
 *
 * El parseo usa `parseSpanishNumber`, no `parseFloat`: con `parseFloat` la entrada «0,02»
 * se leería como 0 —se queda con el prefijo y tira el resto— y el alumno vería suspendida
 * una respuesta correcta escrita en el formato del propio enunciado.
 */
export function comprobarRespuesta(respuestaUsuario: string, valorEsperado: number): Comprobacion {
  if (respuestaUsuario.trim() === '') return { correcto: false, motivo: 'vacia' };
  const valor = parseSpanishNumber(respuestaUsuario);
  if (!Number.isFinite(valor)) return { correcto: false, motivo: 'no-numerico' };
  const tolerancia = toleranciaDe(valorEsperado);
  const diferencia = Math.abs(valor - valorEsperado);
  return {
    correcto: diferencia <= tolerancia,
    motivo: diferencia <= tolerancia ? 'acierto' : 'fallo',
    diferencia,
    tolerancia,
  };
}

/** Compara la predicción elegida con la que da el modelo. */
export function comprobarPrediccion(
  eleccion: DireccionDesplazamiento | null,
  esperada: DireccionDesplazamiento,
): Comprobacion {
  if (eleccion === null) return { correcto: false, motivo: 'vacia' };
  return { correcto: eleccion === esperada, motivo: eleccion === esperada ? 'acierto' : 'fallo' };
}

/** Cómo se lee cada dirección en la interfaz. Una sola fuente para los tres sitios. */
export const TEXTO_DIRECCION: Record<DireccionDesplazamiento, string> = {
  derecha: 'Hacia la derecha (se forman más productos)',
  izquierda: 'Hacia la izquierda (se forman más reactivos)',
  equilibrio: 'No se desplaza',
};

export const OPCIONES_DIRECCION: readonly DireccionDesplazamiento[] = [
  'derecha',
  'izquierda',
  'equilibrio',
];

// ============================================================
// LOS 12 CASOS
// ============================================================

interface DefinicionNumerica {
  tipo: 'numerico';
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosNumericos;
  etiquetaRespuesta: string;
  pasos: readonly string[];
  pista: string;
  requiereRedondeo?: boolean;
}

interface DefinicionPrediccion {
  tipo: 'prediccion';
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosPrediccion;
  etiquetaRespuesta: string;
  pasos: readonly string[];
  pista: string;
}

type Definicion = DefinicionNumerica | DefinicionPrediccion;

const DEFINICIONES: readonly Definicion[] = [
  {
    tipo: 'numerico',
    titulo: 'Cociente de reacción Q',
    enunciado:
      'En la síntesis de amoníaco, un recipiente contiene [N₂] = 1 mol/L, [H₂] = 2 mol/L y [NH₃] = 0,4 mol/L. Calcula el cociente de reacción Q en ese instante.',
    categoria: 'abstracto',
    datos: {
      magnitud: 'cociente-Q',
      reaccionId: 'haber-bosch',
      concentraciones: { 'N₂': 1, 'H₂': 2, 'NH₃': 0.4 },
    },
    etiquetaRespuesta: 'Valor de Q (sin unidad)',
    pasos: [
      'Q tiene la misma forma que Kc: productos arriba, reactivos abajo, cada uno elevado a su coeficiente.',
      'Q = [NH₃]² / ([N₂] · [H₂]³) = 0,4² / (1 · 2³).',
      'Numerador: 0,4² = 0,16. Denominador: 1 · 8 = 8.',
      'Q = 0,16 / 8 = 0,02.',
    ],
    pista: 'El coeficiente de cada especie es su EXPONENTE, no un factor que multiplica.',
  },
  {
    tipo: 'numerico',
    titulo: 'Q cuando los coeficientes son todos 1',
    enunciado:
      'En la reacción de desplazamiento del gas de agua, un reactor contiene [CO] = 0,5 mol/L, [H₂O] = 0,5 mol/L, [CO₂] = 1 mol/L y [H₂] = 1 mol/L. Calcula Q.',
    categoria: 'aplicado',
    datos: {
      magnitud: 'cociente-Q',
      reaccionId: 'water-gas-shift',
      concentraciones: { CO: 0.5, 'H₂O': 0.5, 'CO₂': 1, 'H₂': 1 },
    },
    etiquetaRespuesta: 'Valor de Q (sin unidad)',
    pasos: [
      'Todos los coeficientes valen 1, así que no hay exponentes que aplicar.',
      'Q = ([CO₂] · [H₂]) / ([CO] · [H₂O]) = (1 · 1) / (0,5 · 0,5).',
      'Denominador: 0,5 · 0,5 = 0,25.',
      'Q = 1 / 0,25 = 4. Como Kc vale 5 en el simulador, Q < Kc y el sistema aún avanzará hacia los productos.',
    ],
    pista: 'Dividir entre 0,25 es lo mismo que multiplicar por 4.',
  },
  {
    tipo: 'numerico',
    titulo: 'Variación de moles de gas (Δn)',
    enunciado:
      'Para la síntesis de trióxido de azufre, 2 SO₂(g) + O₂(g) ⇌ 2 SO₃(g), calcula Δn, la variación del número de moles de GAS entre productos y reactivos.',
    categoria: 'abstracto',
    datos: { magnitud: 'delta-n', reaccionId: 'so3' },
    etiquetaRespuesta: 'Valor de Δn (mol de gas)',
    pasos: [
      'Δn = (moles de gas en los productos) − (moles de gas en los reactivos).',
      'Productos: 2 mol de SO₃(g). Reactivos: 2 mol de SO₂(g) + 1 mol de O₂(g) = 3 mol.',
      'Δn = 2 − 3 = −1.',
      'Al ser negativo, comprimir el sistema favorece el lado de los productos: hay menos moléculas de gas a la derecha.',
    ],
    pista: 'Solo cuentan las especies marcadas como gas (g). Los sólidos y los líquidos no.',
  },
  {
    tipo: 'numerico',
    titulo: 'Q en una reacción en disolución',
    enunciado:
      'En la formación de un éster, el matraz contiene [ácido] = 1 mol/L, [alcohol] = 0,5 mol/L, [éster] = 1 mol/L y [agua] = 1 mol/L. Calcula Q sabiendo que, al ser una reacción entre líquidos que se comportan como una disolución, las cuatro especies entran en el cociente.',
    categoria: 'aplicado',
    datos: {
      magnitud: 'cociente-Q',
      reaccionId: 'esterificacion',
      concentraciones: { 'CH₃COOH': 1, 'C₂H₅OH': 0.5, 'CH₃COOC₂H₅': 1, 'H₂O': 1 },
    },
    etiquetaRespuesta: 'Valor de Q (sin unidad)',
    pasos: [
      'Q = ([éster] · [agua]) / ([ácido] · [alcohol]).',
      'Numerador: 1 · 1 = 1. Denominador: 1 · 0,5 = 0,5.',
      'Q = 1 / 0,5 = 2.',
      'Kc vale 4, así que Q < Kc: todavía se formará más éster.',
    ],
    pista:
      'Ojo con el agua: aquí NO es disolvente, es uno de los productos de la reacción y sí cuenta.',
  },
  {
    tipo: 'numerico',
    titulo: 'Comprobar si un sistema está en equilibrio',
    enunciado:
      'Un recipiente con pentacloruro de fósforo contiene [PCl₅] = 0,5 mol/L, [PCl₃] = 0,2 mol/L y [Cl₂] = 0,1 mol/L. Calcula Q y compáralo después con Kc, que vale 0,04.',
    categoria: 'abstracto',
    datos: {
      magnitud: 'cociente-Q',
      reaccionId: 'pcl5',
      concentraciones: { 'PCl₅': 0.5, 'PCl₃': 0.2, 'Cl₂': 0.1 },
    },
    etiquetaRespuesta: 'Valor de Q (sin unidad)',
    pasos: [
      'Q = ([PCl₃] · [Cl₂]) / [PCl₅] = (0,2 · 0,1) / 0,5.',
      'Numerador: 0,2 · 0,1 = 0,02.',
      'Q = 0,02 / 0,5 = 0,04.',
      'Q = Kc exactamente, así que el sistema YA está en equilibrio: no se desplaza en ningún sentido.',
    ],
    pista: 'Un sistema está en equilibrio cuando Q y Kc coinciden, no cuando las concentraciones son iguales.',
  },
  {
    tipo: 'numerico',
    titulo: 'La constante cambia con la temperatura',
    enunciado:
      'La disociación del pentacloruro de fósforo es endotérmica (ΔH = +88 kJ/mol) y su constante vale 0,04 a 298 K. Calcula cuánto vale a 350 K usando la ecuación de van ’t Hoff. Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { magnitud: 'Kc-a-temperatura', reaccionId: 'pcl5', temperaturaFinalK: 350 },
    etiquetaRespuesta: 'Valor de Kc a 350 K',
    pasos: [
      'Ecuación de van ’t Hoff: ln(K₂/K₁) = −(ΔH/R) · (1/T₂ − 1/T₁), con ΔH en J/mol y R = 8,314 J/(mol·K).',
      'ΔH = +88.000 J/mol, T₁ = 298 K y T₂ = 350 K.',
      '1/350 − 1/298 = 0,0028571 − 0,0033557 = −0,0004986.',
      'ln(K₂/K₁) = −(88.000/8,314) · (−0,0004986) = −10.584,6 · (−0,0004986) = 5,277.',
      'K₂/K₁ = e^5,277 ≈ 195,8, así que K₂ = 0,04 · 195,8 ≈ 7,83.',
      'Sube al calentar, que es lo esperable: en una reacción endotérmica el calor actúa como un reactivo más.',
    ],
    pista: 'Convierte el ΔH a julios antes de dividir entre R, o el exponente saldrá mil veces menor.',
    requiereRedondeo: true,
  },
  {
    tipo: 'prediccion',
    titulo: 'Añadir un reactivo',
    enunciado:
      'El sistema de síntesis de amoníaco está en equilibrio. Se inyecta más nitrógeno, de forma que su concentración aumenta en 0,5 mol/L. Antes de tocar los controles, predice hacia dónde se desplazará el equilibrio.',
    categoria: 'aplicado',
    datos: {
      perturbacion: 'anadir-especie',
      reaccionId: 'haber-bosch',
      especie: 'N₂',
      cantidad: 0.5,
    },
    etiquetaRespuesta: '¿Hacia dónde se desplaza?',
    pasos: [
      'El principio de Le Chatelier dice que el sistema responde OPONIÉNDOSE al cambio que se le impone.',
      'Si se añade nitrógeno, el sistema tiende a consumirlo.',
      'El nitrógeno se consume avanzando hacia los productos, así que el equilibrio se desplaza a la derecha y se forma más amoníaco.',
      'Numéricamente: al subir [N₂] el denominador de Q crece, Q baja por debajo de Kc, y el sistema avanza hasta volver a igualarlos.',
    ],
    pista: 'El sistema siempre intenta deshacer lo que le acabas de hacer.',
  },
  {
    tipo: 'prediccion',
    titulo: 'Calentar una reacción exotérmica',
    enunciado:
      'El sistema de síntesis de trióxido de azufre, que es exotérmico (ΔH = −198 kJ/mol), está en equilibrio a 298 K. Se calienta hasta 500 K. Predice hacia dónde se desplazará el equilibrio.',
    categoria: 'aplicado',
    datos: {
      perturbacion: 'cambiar-temperatura',
      reaccionId: 'so3',
      temperaturaFinalK: 500,
    },
    etiquetaRespuesta: '¿Hacia dónde se desplaza?',
    pasos: [
      'En una reacción exotérmica el calor se puede leer como un PRODUCTO más: reactivos ⇌ productos + calor.',
      'Calentar es como añadir ese producto, así que el sistema se opone consumiéndolo.',
      'El equilibrio se desplaza hacia la izquierda: se descompone parte del SO₃.',
      'Numéricamente, van ’t Hoff con ΔH < 0 hace BAJAR la constante al subir la temperatura, y con un Kc menor el sistema retrocede.',
    ],
    pista: 'Escribe el calor como una especie más de la ecuación y aplica Le Chatelier sobre ella.',
  },
  {
    tipo: 'prediccion',
    titulo: 'Calentar una reacción endotérmica',
    enunciado:
      'El sistema de disociación del pentacloruro de fósforo, que es endotérmico (ΔH = +88 kJ/mol), está en equilibrio a 298 K. Se calienta hasta 500 K. Predice hacia dónde se desplazará el equilibrio.',
    categoria: 'abstracto',
    datos: {
      perturbacion: 'cambiar-temperatura',
      reaccionId: 'pcl5',
      temperaturaFinalK: 500,
    },
    etiquetaRespuesta: '¿Hacia dónde se desplaza?',
    pasos: [
      'En una reacción endotérmica el calor se lee como un REACTIVO: reactivos + calor ⇌ productos.',
      'Calentar es como añadir ese reactivo, y el sistema se opone consumiéndolo.',
      'El equilibrio se desplaza hacia la derecha: se disocia más PCl₅.',
      'Es exactamente la respuesta contraria a la del caso 8, y la única diferencia entre los dos es el SIGNO de ΔH.',
    ],
    pista: 'Compara con el caso anterior: lo único que ha cambiado es si el calor entra o sale.',
  },
  {
    tipo: 'prediccion',
    titulo: 'Comprimir cuando Δn no es cero',
    enunciado:
      'El equilibrio entre dióxido de nitrógeno y su dímero, 2 NO₂(g) ⇌ N₂O₄(g), está estabilizado. Se reduce el volumen del recipiente a la mitad, manteniendo la temperatura. Predice hacia dónde se desplazará el equilibrio.',
    categoria: 'abstracto',
    datos: {
      perturbacion: 'cambiar-volumen',
      reaccionId: 'no2-n2o4',
      factorVolumen: 0.5,
    },
    etiquetaRespuesta: '¿Hacia dónde se desplaza?',
    pasos: [
      'Reducir el volumen a la mitad duplica todas las concentraciones y sube la presión.',
      'El sistema se opone a la subida de presión yendo hacia el lado que tiene MENOS moléculas de gas.',
      'Aquí Δn = 1 − 2 = −1: hay 2 moléculas a la izquierda y solo 1 a la derecha.',
      'El equilibrio se desplaza hacia la derecha, y se forma más N₂O₄ (el gas incoloro).',
    ],
    pista: 'Cuenta cuántas moléculas de gas hay a cada lado de la flecha.',
  },
  {
    tipo: 'prediccion',
    titulo: 'Comprimir cuando Δn es cero',
    enunciado:
      'El reactor de desplazamiento del gas de agua, CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g), está en equilibrio. Se reduce el volumen a la mitad, manteniendo la temperatura. Predice hacia dónde se desplazará el equilibrio.',
    categoria: 'aplicado',
    datos: {
      perturbacion: 'cambiar-volumen',
      reaccionId: 'water-gas-shift',
      factorVolumen: 0.5,
    },
    etiquetaRespuesta: '¿Hacia dónde se desplaza?',
    pasos: [
      'Aquí hay 2 moléculas de gas a cada lado: Δn = 2 − 2 = 0.',
      'Al duplicarse TODAS las concentraciones, el numerador y el denominador de Q se multiplican por lo mismo.',
      'Q no cambia, sigue siendo igual a Kc, y el sistema no tiene ningún motivo para moverse.',
      'La presión no desplaza un equilibrio con Δn = 0. Es la excepción que conviene tener vista antes de un examen.',
    ],
    pista: 'Si el número de moléculas de gas es el mismo a los dos lados, comprimir no rompe nada.',
  },
  {
    tipo: 'prediccion',
    titulo: 'Añadir un catalizador',
    enunciado:
      'El sistema de síntesis de amoníaco está en equilibrio y se le añade un catalizador de hierro. Predice hacia dónde se desplazará el equilibrio.',
    categoria: 'aplicado',
    datos: { perturbacion: 'catalizador', reaccionId: 'haber-bosch' },
    etiquetaRespuesta: '¿Hacia dónde se desplaza?',
    pasos: [
      'Un catalizador rebaja la energía de activación de la reacción directa y de la inversa EN LA MISMA medida.',
      'Acelera por igual los dos sentidos, así que el equilibrio se alcanza antes, pero no cambia de sitio.',
      'La constante Kc no depende del catalizador: solo depende de la temperatura.',
      'El equilibrio no se desplaza. Lo que cambia es el tiempo que tarda en llegar, y eso es justo por lo que la industria lo usa.',
    ],
    pista: 'Pregúntate si el catalizador aparece en la expresión de Kc.',
  },
];

/**
 * Formato español, sin ceros de relleno.
 *
 * Los enteros salen sin decimales (Δn = −1), y el resto con los que necesiten hasta cuatro.
 * Un caso marcado con  se muestra con los 2 decimales que pide su
 * enunciado, para que la solución y lo que se pide no digan cosas distintas.
 */
/**
 * Formato español, sin ceros de relleno.
 *
 * Los enteros salen sin decimales (Δn = −1) y el resto con los que necesiten, hasta cuatro.
 * Un caso marcado con `requiereRedondeo` se muestra con los 2 decimales que pide su
 * enunciado, para que la solución y lo que se pide no digan cosas distintas.
 */
function formatearValor(valor: number, decimalesFijos?: number): string {
  if (!Number.isFinite(valor)) return 'no definido';
  if (decimalesFijos !== undefined) return valor.toFixed(decimalesFijos).replace('.', ',');
  if (Number.isInteger(valor)) return String(valor).replace('.', ',');
  // Los ceros de relleno se quitan SOLO si quedan a la derecha de la coma, y el punto
  // decimal solo si se ha quedado huérfano: `\.$` con la barra, no `.$`, que borraría el
  // último carácter sea cual sea y dejaría «0,02» en «0,0».
  return valor
    .toFixed(4)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
    .replace('.', ',');
}

/**
 * Construye un caso resolviéndolo con el motor.
 *
 * La respuesta NUNCA se escribe a mano en `DEFINICIONES`: sale de `resolverCasoNumerico` o
 * de `simularPerturbacion`. Es lo que garantiza que la app y sus casos no puedan divergir.
 */
function construirCaso(definicion: Definicion, indice: number): CasoEquilibrio {
  const id = indice + 1;
  const reaccion = reaccionDe(definicion.datos.reaccionId);
  const ecuacion = reaccion?.ecuacion ?? '';

  if (definicion.tipo === 'numerico') {
    const resultado = resolverCasoNumerico(definicion.datos);
    return {
      id,
      tipo: 'numerico',
      titulo: definicion.titulo,
      enunciado: definicion.enunciado,
      categoria: definicion.categoria,
      datos: definicion.datos,
      ecuacion,
      etiquetaRespuesta: definicion.etiquetaRespuesta,
      respuesta: resultado.valor,
      respuestaTexto: formatearValor(resultado.valor, definicion.requiereRedondeo === true ? 2 : undefined),
      pasos: definicion.pasos,
      pista: definicion.pista,
      requiereRedondeo: definicion.requiereRedondeo === true,
    };
  }

  const simulacion = simularPerturbacion(definicion.datos);
  return {
    id,
    tipo: 'prediccion',
    titulo: definicion.titulo,
    enunciado: definicion.enunciado,
    categoria: definicion.categoria,
    datos: definicion.datos,
    ecuacion,
    etiquetaRespuesta: definicion.etiquetaRespuesta,
    opciones: OPCIONES_DIRECCION,
    respuesta: simulacion.direccion,
    respuestaTexto: TEXTO_DIRECCION[simulacion.direccion],
    pasos: definicion.pasos,
    pista: definicion.pista,
  };
}

/** Los 12 casos fijos, con ids 1..12 sin huecos. */
export const CASOS: readonly CasoEquilibrio[] = DEFINICIONES.map(construirCaso);

export const TOTAL_CASOS = CASOS.length;
