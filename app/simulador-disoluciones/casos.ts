/**
 * Casos para clase — la tarea asignable de `simulador-disoluciones` (02/11/2026).
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la química está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras, y nada lanza: un dato imposible da `{ ok: false, error }` o NaN.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Ninguna fórmula se reescribe aquí: las respuestas salen de `./motor.ts`, donde viven los dos
 * `useMemo` de la página (`calcularPreparacion` y `calcularDilucion`, trasladados tal cual) y
 * sus inversas. La masa molar de cada caso se lee de `SOLUTOS`, la misma lista que pintan los
 * botones del modo «Preparar»: un caso con «sal común» usa el mismo 58,44 que su botón. Las
 * únicas cuentas propias de este fichero son las de los ERRORES con nombre propio (la cifra que
 * daría equivocarse de una forma concreta), que no deciden ninguna respuesta correcta.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ (1) La molaridad, los g/L, el % m/v y las ppm usan el volumen de DISOLUCIÓN (enrasada),
 *    no el de disolvente. Los enunciados dicen «se enrasa hasta … mL de disolución».
 * ⚠️ (2) El % es masa/volumen: gramos de soluto por cada 100 mL de disolución, no masa/masa.
 *    Los enunciados de % lo escriben entero.
 * ⚠️ (3) ppm = mg/L, que solo vale para una disolución acuosa diluida (densidad ≈ 1 g/mL).
 *    Los enunciados de ppm lo dicen.
 * ⚠️ (4) En la dilución, el disolvente a añadir es V₂ − V₁: volúmenes aditivos, como la app.
 *    El enunciado que lo pregunta lo dice.
 * ⚠️ (5) Las masas molares son las de la lista de la app (NaCl 58,44 · glucosa 180,16 ·
 *    CuSO₄ 159,61 · KMnO₄ 158,03 · K₂Cr₂O₇ 294,18 · NiCl₂ 129,60), y el enunciado que las
 *    necesita las da con esa cifra. Un libro usa NaCl 58,5 o glucosa 180: menos de un 0,2 % de
 *    diferencia. Por eso la POLÍTICA de tolerancia se decide caso a caso, sin escribirla a mano:
 *    `dependeDeMasaMolar` recalcula con otra masa molar, y si la respuesta cambia se corrige
 *    con la RELATIVA (`toleranciaRelativa`: el mayor entre 0,01 y el 1 %); si no cambia (g/L,
 *    % m/v, ppm, V₁, disolvente, factor, C₂ de una dilución) con la de REDONDEO
 *    (`toleranciaDeRedondeo`: media unidad del último decimal si hay que redondear, 0 si la
 *    cifra es exacta). Para que el suelo de 0,01 de la relativa no valga más que el 1 %, toda
 *    respuesta que depende de la masa molar es ≥ 1, en los doce casos y en el modo práctica.
 *
 * ⚠️ Decimales como los imprime el panel: molaridad con 3, moles con 4, g/L y % m/v con 2, ppm
 *    sin decimales, V₁ y disolvente con 1, factor con 1. La masa a pesar, con 2. Si la cifra no
 *    es exacta, el enunciado pide redondear: lo decide `exigeRedondeo`, que decide también el
 *    margen, así que el texto y la corrección no pueden discrepar.
 *
 * ⚠️ Los datos caben en los deslizadores de la app (masa 0,5–100 g de 0,5 en 0,5; volumen
 *    50–1000 mL de 10 en 10; C₁ 0,1–5 de 0,1 en 0,1; C₂ 0,05–5 de 0,05 en 0,05 y ≤ C₁; V₂
 *    50–1000 de 10 en 10), para que el alumno pueda comprobarlo moviéndolos (`comoComprobar`).
 */

import { formatNumber } from '@/lib';
import {
  corregirNumero,
  dentroDeTolerancia,
  exigeRedondeo,
  redondearA,
  textoDesviacion,
  toleranciaDeRedondeo,
  toleranciaRelativa,
  type MagnitudAcotada,
} from '@/lib/calculadoras/correctorCasosAula';
import {
  calcularDilucion,
  calcularPreparacion,
  concentracionDiluida,
  masaParaMolaridad,
  masaParaPorcentaje,
  molaridadDesdeGPorLitro,
  solutoPorId,
} from './motor';

/* ─────────────────────────── Qué se pregunta ─────────────────────────── */

export type TipoPregunta =
  /** Modo Preparar: molaridad con masa, volumen y soluto. */
  | 'molaridad'
  /** Modo Preparar: moles de soluto con su masa y su soluto. */
  | 'moles'
  /** Modo Preparar: concentración másica (g/L) con masa y volumen. */
  | 'gPorLitro'
  /** Modo Preparar: % m/v con masa y volumen. */
  | 'porcentajeMV'
  /** Modo Preparar: ppm (≈ mg/L) con masa y volumen. */
  | 'ppm'
  /** Inversa: masa a pesar para una molaridad, un volumen y un soluto. */
  | 'masaParaMolaridad'
  /** Inversa: molaridad desde la concentración másica y el soluto. */
  | 'molaridadDesdeGPorLitro'
  /** Inversa: masa de soluto para un % m/v y un volumen. */
  | 'masaParaPorcentaje'
  /** Modo Diluir: volumen de disolución madre V₁ con C₁, C₂ y V₂. */
  | 'volumenMadre'
  /** Modo Diluir: disolvente a añadir, V₂ − V₁. */
  | 'disolvente'
  /** Modo Diluir: factor de dilución C₁/C₂. */
  | 'factor'
  /** Inversa de la dilución: C₂ con C₁, V₁ y V₂. */
  | 'concentracionDiluida';

/**
 * Todo lo necesario para recalcular la respuesta. Qué campos usa cada tipo:
 *   molaridad, gPorLitro, porcentajeMV, ppm → masaG, volumenML (y solutoId para nombrarlo;
 *                                            la molaridad lo necesita para la masa molar)
 *   moles                                  → masaG, solutoId
 *   masaParaMolaridad                      → molaridad, volumenML, solutoId
 *   molaridadDesdeGPorLitro                → gPorLitro, solutoId
 *   masaParaPorcentaje                     → porcentajeMV, volumenML (solutoId opcional)
 *   volumenMadre, disolvente, factor       → c1, c2, v2ML
 *   concentracionDiluida                   → c1, v1ML, v2ML
 * Masas en g, volúmenes en mL, concentraciones en mol/L.
 */
export interface DatosCaso {
  tipo: TipoPregunta;
  /** Id de `SOLUTOS` en `./motor.ts`: de ahí sale la masa molar. */
  solutoId?: string;
  masaG?: number;
  volumenML?: number;
  molaridad?: number;
  gPorLitro?: number;
  porcentajeMV?: number;
  c1?: number;
  c2?: number;
  v1ML?: number;
  v2ML?: number;
}

/** Lo que es fijo de cada tipo de pregunta. Un tipo nuevo no compila sin decidirlo todo. */
interface FichaPregunta {
  /** Lo que se escribe en la casilla, con la unidad. Nunca vacía. */
  etiqueta: string;
  /** Unidad de la respuesta; vacía solo para el factor, que no tiene. */
  unidad: string;
  /** Los decimales con los que la imprime el panel de la app. */
  decimales: number;
  /** Qué valores son imposibles, leído del enunciado (corrector compartido, hallazgo 1207). */
  magnitud: (datos: DatosCaso) => MagnitudAcotada;
  /** El porqué de un imposible por debajo del mínimo. */
  porDebajo: string;
  /** El porqué de un imposible por encima del máximo (solo donde hay máximo). */
  porEncima?: (datos: DatosCaso) => string;
}

const NO_NEGATIVA = (que: string): MagnitudAcotada => ({
  entero: false,
  minimo: 0,
  maximo: Number.POSITIVE_INFINITY,
  que,
});

export const FICHAS: Record<TipoPregunta, FichaPregunta> = {
  molaridad: {
    etiqueta: 'Molaridad, en mol/L',
    unidad: 'mol/L',
    decimales: 3,
    magnitud: () => NO_NEGATIVA('la molaridad'),
    porDebajo: 'Una concentración no puede ser negativa.',
  },
  moles: {
    etiqueta: 'Cantidad de soluto, en mol',
    unidad: 'mol',
    decimales: 4,
    magnitud: () => NO_NEGATIVA('la cantidad de soluto'),
    porDebajo: 'Una cantidad de sustancia no puede ser negativa.',
  },
  gPorLitro: {
    etiqueta: 'Concentración másica, en g/L',
    unidad: 'g/L',
    decimales: 2,
    magnitud: () => NO_NEGATIVA('la concentración'),
    porDebajo: 'Una concentración no puede ser negativa.',
  },
  porcentajeMV: {
    etiqueta: 'Concentración, en % m/v',
    unidad: '% m/v',
    decimales: 2,
    magnitud: () => NO_NEGATIVA('la concentración'),
    porDebajo: 'Una concentración no puede ser negativa.',
  },
  ppm: {
    etiqueta: 'Concentración, en ppm',
    unidad: 'ppm',
    decimales: 0,
    magnitud: () => NO_NEGATIVA('la concentración'),
    porDebajo: 'Una concentración no puede ser negativa.',
  },
  masaParaMolaridad: {
    etiqueta: 'Masa a pesar, en g',
    unidad: 'g',
    decimales: 2,
    magnitud: () => NO_NEGATIVA('la masa'),
    porDebajo: 'Una masa no puede ser negativa.',
  },
  molaridadDesdeGPorLitro: {
    etiqueta: 'Molaridad, en mol/L',
    unidad: 'mol/L',
    decimales: 3,
    magnitud: () => NO_NEGATIVA('la molaridad'),
    porDebajo: 'Una concentración no puede ser negativa.',
  },
  masaParaPorcentaje: {
    etiqueta: 'Masa de soluto, en g',
    unidad: 'g',
    decimales: 2,
    magnitud: () => NO_NEGATIVA('la masa'),
    porDebajo: 'Una masa no puede ser negativa.',
  },
  volumenMadre: {
    etiqueta: 'Volumen de disolución madre (V₁), en mL',
    unidad: 'mL',
    decimales: 1,
    magnitud: (d) => ({ entero: false, minimo: 0, maximo: d.v2ML ?? Number.POSITIVE_INFINITY, que: 'el volumen de madre' }),
    porDebajo: 'Un volumen no puede ser negativo.',
    porEncima: (d) =>
      `El volumen de madre no puede pasar del volumen final (V₂ = ${numero(d.v2ML ?? NaN)} mL): se toma una parte y se completa con disolvente.`,
  },
  disolvente: {
    etiqueta: 'Disolvente a añadir, en mL',
    unidad: 'mL',
    decimales: 1,
    magnitud: (d) => ({ entero: false, minimo: 0, maximo: d.v2ML ?? Number.POSITIVE_INFINITY, que: 'el disolvente a añadir' }),
    porDebajo: 'Un volumen no puede ser negativo.',
    porEncima: (d) =>
      `El disolvente que se añade no puede pasar del volumen final (V₂ = ${numero(d.v2ML ?? NaN)} mL), porque también hay que poner algo de madre.`,
  },
  factor: {
    etiqueta: 'Factor de dilución, sin unidad',
    unidad: '',
    decimales: 1,
    magnitud: () => ({ entero: false, minimo: 1, maximo: Number.POSITIVE_INFINITY, que: 'el factor de dilución' }),
    porDebajo: 'El factor de dilución es C₁ / C₂ y nunca es menor que 1: al diluir, la concentración baja.',
  },
  concentracionDiluida: {
    etiqueta: 'Concentración final (C₂), en mol/L',
    unidad: 'mol/L',
    decimales: 3,
    magnitud: (d) => ({ entero: false, minimo: 0, maximo: d.c1 ?? Number.POSITIVE_INFINITY, que: 'la concentración final' }),
    porDebajo: 'Una concentración no puede ser negativa.',
    porEncima: (d) =>
      `Al diluir, la concentración baja: no puede pasar de la de la madre (C₁ = ${numero(d.c1 ?? NaN)} mol/L).`,
  },
};

/* ─────────────────────────── Utilidades de texto ─────────────────────────── */

/** Cifra intermedia en formato español, sin ceros de relleno: «0,48749», «1000». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

/** «a unidades», «a una décima», «a dos decimales»…: lo mismo que dice el enunciado. */
function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  if (decimales === 3) return 'a tres decimales';
  if (decimales === 4) return 'a cuatro decimales';
  return `a ${decimales} decimales`;
}

/** «2,002 mol/L», «5,00 % m/v», «7,5» (el factor no tiene unidad). Espacio duro delante. */
export function textoRespuesta(valor: number, datos: DatosCaso): string {
  if (!Number.isFinite(valor)) return '—';
  const ficha = FICHAS[datos.tipo];
  const cifra = formatNumber(valor, ficha.decimales);
  return ficha.unidad ? `${cifra} ${ficha.unidad}` : cifra;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  /** Sin redondear, en la unidad de la ficha. */
  valor: number;
  pasos: string[];
  error?: string;
}

export interface OpcionesResolucion {
  /** Otra masa molar en lugar de la de la lista (la de un libro, o la sonda de la política). */
  masaMolar?: number;
}

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

function falta(nombre: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: `Falta un dato: ${nombre}.` };
}

/** La masa molar del caso: la de la opción si la hay, si no la del soluto de la lista. */
export function masaMolarDe(datos: DatosCaso, opciones: OpcionesResolucion = {}): number | undefined {
  if (positivo(opciones.masaMolar)) return opciones.masaMolar;
  if (!datos.solutoId) return undefined;
  return solutoPorId(datos.solutoId)?.masaMolar;
}

/** «el NaCl», para los pasos. */
function formulaDe(datos: DatosCaso): string {
  const s = datos.solutoId ? solutoPorId(datos.solutoId) : undefined;
  return s ? s.formula : 'soluto';
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca lanza.
 * Con `opciones.masaMolar` calcula con otra masa molar (la de un libro).
 */
export function resolverCaso(datos: DatosCaso, opciones: OpcionesResolucion = {}): Resolucion {
  const ficha = FICHAS[datos.tipo];
  if (!ficha) return { ok: false, valor: NaN, pasos: [], error: 'Tipo de pregunta desconocido.' };
  const pasos: string[] = [];
  const mm = masaMolarDe(datos, opciones);
  const formula = formulaDe(datos);
  let valor: number;

  switch (datos.tipo) {
    case 'molaridad': {
      if (!positivo(datos.masaG)) return falta('la masa de soluto', pasos);
      if (!positivo(datos.volumenML)) return falta('el volumen de disolución', pasos);
      if (!positivo(mm)) return falta('la masa molar', pasos);
      const r = calcularPreparacion(datos.masaG, datos.volumenML, mm);
      pasos.push(`Volumen de disolución en litros: ${numero(datos.volumenML)} mL ÷ 1000 = ${numero(r.litros)} L.`);
      pasos.push(
        `Moles de ${formula}: n = masa ÷ masa molar = ${numero(datos.masaG)} g ÷ ${numero(mm)} g/mol = ${numero(r.moles, 5)} mol.`,
      );
      pasos.push(`Molaridad: M = n ÷ V(L) = ${numero(r.moles, 5)} mol ÷ ${numero(r.litros)} L = ${numero(r.molaridad, 5)} mol/L.`);
      valor = r.molaridad;
      break;
    }

    case 'moles': {
      if (!positivo(datos.masaG)) return falta('la masa de soluto', pasos);
      if (!positivo(mm)) return falta('la masa molar', pasos);
      // El volumen no influye en los moles: el motor necesita uno y se le da 1 L.
      const r = calcularPreparacion(datos.masaG, datos.volumenML ?? 1000, mm);
      pasos.push('La masa molar es el puente entre los gramos y los moles: dice cuántos gramos pesa 1 mol.');
      pasos.push(
        `n = masa ÷ masa molar = ${numero(datos.masaG)} g ÷ ${numero(mm)} g/mol = ${numero(r.moles, 6)} mol.`,
      );
      valor = r.moles;
      break;
    }

    case 'gPorLitro': {
      if (!positivo(datos.masaG)) return falta('la masa de soluto', pasos);
      if (!positivo(datos.volumenML)) return falta('el volumen de disolución', pasos);
      const r = calcularPreparacion(datos.masaG, datos.volumenML, mm ?? 0);
      pasos.push(`Volumen de disolución en litros: ${numero(datos.volumenML)} mL ÷ 1000 = ${numero(r.litros)} L.`);
      pasos.push(`Concentración másica = masa ÷ V(L) = ${numero(datos.masaG)} g ÷ ${numero(r.litros)} L = ${numero(r.gPorLitro)} g/L.`);
      pasos.push('La masa molar no hace falta: los g/L cuentan gramos, no moles.');
      valor = r.gPorLitro;
      break;
    }

    case 'porcentajeMV': {
      if (!positivo(datos.masaG)) return falta('la masa de soluto', pasos);
      if (!positivo(datos.volumenML)) return falta('el volumen de disolución', pasos);
      const r = calcularPreparacion(datos.masaG, datos.volumenML, mm ?? 0);
      pasos.push('El % m/v son los gramos de soluto que hay en cada 100 mL de disolución.');
      pasos.push(
        `% m/v = masa (g) ÷ volumen (mL) × 100 = ${numero(datos.masaG)} ÷ ${numero(datos.volumenML)} × 100 = ${numero(r.porcentajeMV)} %.`,
      );
      valor = r.porcentajeMV;
      break;
    }

    case 'ppm': {
      if (!positivo(datos.masaG)) return falta('la masa de soluto', pasos);
      if (!positivo(datos.volumenML)) return falta('el volumen de disolución', pasos);
      const r = calcularPreparacion(datos.masaG, datos.volumenML, mm ?? 0);
      pasos.push(`Masa en miligramos: ${numero(datos.masaG)} g × 1000 = ${numero(datos.masaG * 1000)} mg.`);
      pasos.push(`Volumen en litros: ${numero(datos.volumenML)} mL ÷ 1000 = ${numero(r.litros)} L.`);
      pasos.push(
        `En una disolución acuosa diluida (densidad ≈ 1 g/mL), 1 ppm = 1 mg/L: ${numero(datos.masaG * 1000)} mg ÷ ${numero(r.litros)} L = ${numero(r.ppm)} ppm.`,
      );
      valor = r.ppm;
      break;
    }

    case 'masaParaMolaridad': {
      if (!positivo(datos.molaridad)) return falta('la molaridad', pasos);
      if (!positivo(datos.volumenML)) return falta('el volumen de disolución', pasos);
      if (!positivo(mm)) return falta('la masa molar', pasos);
      const litros = datos.volumenML / 1000;
      const moles = datos.molaridad * litros;
      pasos.push(`Volumen de disolución en litros: ${numero(datos.volumenML)} mL ÷ 1000 = ${numero(litros)} L.`);
      pasos.push(`Moles que hacen falta: n = M · V(L) = ${numero(datos.molaridad)} mol/L × ${numero(litros)} L = ${numero(moles, 5)} mol.`);
      valor = masaParaMolaridad(datos.molaridad, datos.volumenML, mm);
      pasos.push(`Masa a pesar: m = n · masa molar = ${numero(moles, 5)} mol × ${numero(mm)} g/mol = ${numero(valor, 5)} g de ${formula}.`);
      break;
    }

    case 'molaridadDesdeGPorLitro': {
      if (!positivo(datos.gPorLitro)) return falta('la concentración másica', pasos);
      if (!positivo(mm)) return falta('la masa molar', pasos);
      valor = molaridadDesdeGPorLitro(datos.gPorLitro, mm);
      pasos.push(`En cada litro de disolución hay ${numero(datos.gPorLitro)} g de ${formula}.`);
      pasos.push(
        `Esos gramos, en moles: M = (g/L) ÷ masa molar = ${numero(datos.gPorLitro)} g/L ÷ ${numero(mm)} g/mol = ${numero(valor, 5)} mol/L.`,
      );
      break;
    }

    case 'masaParaPorcentaje': {
      if (!positivo(datos.porcentajeMV)) return falta('el porcentaje', pasos);
      if (!positivo(datos.volumenML)) return falta('el volumen de disolución', pasos);
      valor = masaParaPorcentaje(datos.porcentajeMV, datos.volumenML);
      pasos.push(
        `Un ${numero(datos.porcentajeMV)} % m/v son ${numero(datos.porcentajeMV)} g de soluto en cada 100 mL de disolución.`,
      );
      pasos.push(
        `Para ${numero(datos.volumenML)} mL: m = ${numero(datos.porcentajeMV)} × ${numero(datos.volumenML)} ÷ 100 = ${numero(valor, 5)} g.`,
      );
      pasos.push('La masa molar no hace falta: el % m/v cuenta gramos, no moles.');
      break;
    }

    case 'volumenMadre':
    case 'disolvente':
    case 'factor': {
      if (!positivo(datos.c1)) return falta('la concentración de la madre', pasos);
      if (!positivo(datos.c2)) return falta('la concentración deseada', pasos);
      if (!positivo(datos.v2ML)) return falta('el volumen final', pasos);
      const r = calcularDilucion(datos.c1, datos.c2, datos.v2ML);
      if (!r.valido) {
        return {
          ok: false,
          valor: NaN,
          pasos,
          error: 'La concentración deseada debe ser menor o igual que la de la madre: diluyendo no se puede concentrar.',
        };
      }
      if (datos.tipo === 'factor') {
        valor = r.factor;
        pasos.push(
          `Factor de dilución = C₁ ÷ C₂ = ${numero(datos.c1)} mol/L ÷ ${numero(datos.c2)} mol/L = ${numero(valor, 5)}.`,
        );
        pasos.push(
          `La disolución final queda ${numero(valor, 5)} veces menos concentrada. El volumen final no influye en el factor.`,
        );
        break;
      }
      pasos.push('Al diluir solo se añade disolvente: los moles de soluto no cambian, así que C₁·V₁ = C₂·V₂.');
      pasos.push(
        `V₁ = C₂·V₂ ÷ C₁ = ${numero(datos.c2)} × ${numero(datos.v2ML)} ÷ ${numero(datos.c1)} = ${numero(r.v1, 5)} mL de disolución madre.`,
      );
      if (datos.tipo === 'volumenMadre') {
        valor = r.v1;
        pasos.push(`Se toman ${numero(r.v1, 5)} mL de madre y se completan con disolvente hasta ${numero(datos.v2ML)} mL.`);
      } else {
        valor = r.disolvente;
        pasos.push(
          `Con volúmenes aditivos, el disolvente a añadir es lo que falta hasta V₂: ${numero(datos.v2ML)} − ${numero(r.v1, 5)} = ${numero(valor, 5)} mL.`,
        );
      }
      break;
    }

    case 'concentracionDiluida': {
      if (!positivo(datos.c1)) return falta('la concentración de la madre', pasos);
      if (!positivo(datos.v1ML)) return falta('el volumen de madre', pasos);
      if (!positivo(datos.v2ML)) return falta('el volumen final', pasos);
      valor = concentracionDiluida(datos.c1, datos.v1ML, datos.v2ML);
      if (!Number.isFinite(valor)) {
        return { ok: false, valor: NaN, pasos, error: 'El volumen de madre no puede pasar del volumen final.' };
      }
      pasos.push('Al diluir solo se añade disolvente: los moles de soluto no cambian, así que C₁·V₁ = C₂·V₂.');
      pasos.push(
        `C₂ = C₁·V₁ ÷ V₂ = ${numero(datos.c1)} × ${numero(datos.v1ML)} ÷ ${numero(datos.v2ML)} = ${numero(valor, 5)} mol/L.`,
      );
      pasos.push('Los volúmenes pueden ir en mL los dos: las unidades se cancelan.');
      break;
    }

    default:
      return { ok: false, valor: NaN, pasos, error: 'Tipo de pregunta desconocido.' };
  }

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado.
  const redondeado = redondearA(valor, ficha.decimales);
  pasos.push(
    exigeRedondeo(valor, ficha.decimales)
      ? `Redondeando ${textoRedondeo(ficha.decimales)}: ${textoRespuesta(redondeado, datos)}.`
      : `Resultado: ${textoRespuesta(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Política de tolerancia ─────────────────────────── */

/**
 * ¿Cambia la respuesta con otra masa molar? Se prueba EJECUTANDO con un 1 % más, no leyendo el
 * tipo de pregunta (la lección de π en visualizador-volumenes). Llama a `resolverCaso`, nunca al
 * revés: `resolverCaso` no puede llamar a esta función sin recursión infinita.
 */
export function dependeDeMasaMolar(datos: DatosCaso): boolean {
  const base = resolverCaso(datos);
  const mm = masaMolarDe(datos);
  if (!base.ok || !positivo(mm)) return false;
  const otra = resolverCaso(datos, { masaMolar: mm * 1.01 });
  if (!otra.ok) return false;
  return Math.abs(otra.valor - base.valor) > 1e-9 * Math.max(1, Math.abs(base.valor));
}

/**
 * Relativa si la respuesta depende de la masa molar (acepta las de libro, a < 0,2 %); de
 * redondeo si no (media unidad del último decimal si hay que redondear, 0 si es exacta).
 */
export function toleranciaDe(datos: DatosCaso): number {
  const r = resolverCaso(datos);
  if (!r.ok) return 0;
  return dependeDeMasaMolar(datos)
    ? toleranciaRelativa(r.valor)
    : toleranciaDeRedondeo(r.valor, FICHAS[datos.tipo].decimales);
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** Los errores típicos del tema que el corrector reconoce por su nombre. */
export type ErrorConNombre =
  /** Volumen en mL donde va en L (o al revés): la respuesta sale ×1000 o ÷1000. */
  | 'volumen-en-ml'
  /** Olvidar la masa molar: dar g/L por molaridad, gramos por moles o moles por masa. */
  | 'falta-masa-molar'
  /** Multiplicar por la masa molar donde se divide (o dividir al revés). */
  | 'masa-molar-al-reves'
  /** % m/v calculado por litro (g/L) en vez de por 100 mL. */
  | 'porcentaje-por-litro'
  /** % m/v sin el × 100: los g/mL. */
  | 'tanto-por-uno'
  /** Dar el disolvente (V₂ − V₁) cuando se pide V₁. */
  | 'disolvente-por-v1'
  /** Dar V₁ cuando se pide el disolvente a añadir. */
  | 'v1-por-disolvente'
  /** Invertir el cociente de C₁·V₁ = C₂·V₂. */
  | 'cociente-invertido'
  /** El factor de dilución al revés: C₂/C₁. */
  | 'factor-invertido';

interface ErrorPosible {
  error: ErrorConNombre;
  /** La cifra que da cometer ese error con estos datos. */
  valor: number;
  motivo: string;
}

/** La cifra de cada error típico con los datos del caso. Solo las de errores que tienen sentido aquí. */
function erroresPosibles(datos: DatosCaso): ErrorPosible[] {
  const r = resolverCaso(datos);
  if (!r.ok) return [];
  const v = r.valor;
  const mm = masaMolarDe(datos);
  const litros = positivo(datos.volumenML) ? datos.volumenML / 1000 : NaN;
  const textoLitros = `${numero(datos.volumenML ?? NaN)} mL son ${numero(litros)} L`;
  const lista: ErrorPosible[] = [];

  const milVeces = (motivoMenor: string, motivoMayor: string) => {
    lista.push({ error: 'volumen-en-ml', valor: v / 1000, motivo: motivoMenor });
    lista.push({ error: 'volumen-en-ml', valor: v * 1000, motivo: motivoMayor });
  };

  switch (datos.tipo) {
    case 'molaridad':
      milVeces(
        `Tu cifra es mil veces menor: has dividido entre los mililitros. La molaridad va por LITRO (${textoLitros}).`,
        `Tu cifra es mil veces mayor: revisa el paso de mililitros a litros, que es dividir entre 1000 (${textoLitros}).`,
      );
      if (positivo(datos.masaG) && positivo(litros)) {
        lista.push({
          error: 'falta-masa-molar',
          valor: datos.masaG / litros,
          motivo: `Eso es la concentración en g/L. Para la molaridad hay que pasar los gramos a moles dividiendo entre la masa molar (${numero(mm ?? NaN)} g/mol).`,
        });
      }
      break;

    case 'moles':
      if (positivo(datos.masaG) && positivo(mm)) {
        lista.push({
          error: 'falta-masa-molar',
          valor: datos.masaG,
          motivo: `Eso es la masa en gramos. Para pasarla a moles divide entre la masa molar (${numero(mm)} g/mol).`,
        });
        lista.push({
          error: 'masa-molar-al-reves',
          valor: datos.masaG * mm,
          motivo: 'Has multiplicado por la masa molar: para pasar de gramos a moles se DIVIDE entre ella.',
        });
      }
      break;

    case 'gPorLitro':
      milVeces(
        `Tu cifra es mil veces menor: has dividido entre los mililitros. Los g/L van por LITRO (${textoLitros}).`,
        `Tu cifra es mil veces mayor: revisa el paso de mililitros a litros, que es dividir entre 1000 (${textoLitros}).`,
      );
      break;

    case 'porcentajeMV':
      lista.push({
        error: 'porcentaje-por-litro',
        valor: v * 10,
        motivo: 'Eso son gramos por LITRO. El % m/v son los gramos en cada 100 mL de disolución: diez veces menos.',
      });
      lista.push({
        error: 'tanto-por-uno',
        valor: v / 100,
        motivo: 'Eso son gramos por mililitro: multiplica por 100 para tener los gramos en cada 100 mL.',
      });
      break;

    case 'ppm':
      milVeces(
        `Tu cifra es mil veces menor: en ppm la masa va en miligramos (1 g = 1000 mg) y el volumen en litros (${textoLitros}).`,
        `Tu cifra es mil veces mayor: las ppm son miligramos por LITRO, no por mililitro (${textoLitros}).`,
      );
      break;

    case 'masaParaMolaridad':
      milVeces(
        `Tu cifra es mil veces menor: revisa el volumen. La molaridad son moles por litro (${textoLitros}).`,
        `Tu cifra es mil veces mayor: has multiplicado por los mililitros. Pasa el volumen a litros (${textoLitros}).`,
      );
      if (positivo(datos.molaridad) && positivo(litros)) {
        lista.push({
          error: 'falta-masa-molar',
          valor: datos.molaridad * litros,
          motivo: `Eso son los moles que hacen falta. Para saber cuánto pesar, multiplícalos por la masa molar (${numero(mm ?? NaN)} g/mol).`,
        });
      }
      break;

    case 'molaridadDesdeGPorLitro':
      if (positivo(datos.gPorLitro) && positivo(mm)) {
        lista.push({
          error: 'falta-masa-molar',
          valor: datos.gPorLitro,
          motivo: `Eso sigue siendo la concentración en g/L. Para la molaridad divide entre la masa molar (${numero(mm)} g/mol).`,
        });
        lista.push({
          error: 'masa-molar-al-reves',
          valor: mm / datos.gPorLitro,
          motivo: 'Has dividido al revés: molaridad = (g/L) ÷ masa molar.',
        });
      }
      break;

    case 'masaParaPorcentaje':
      lista.push({
        error: 'porcentaje-por-litro',
        valor: v / 10,
        motivo: `Has tomado el % como gramos por litro. Un ${numero(datos.porcentajeMV ?? NaN)} % m/v son ${numero(datos.porcentajeMV ?? NaN)} g en cada 100 mL.`,
      });
      break;

    case 'volumenMadre':
      if (positivo(datos.c1) && positivo(datos.c2) && positivo(datos.v2ML)) {
        lista.push({
          error: 'disolvente-por-v1',
          valor: datos.v2ML - v,
          motivo: 'Eso es el disolvente que se añade (V₂ − V₁). Se pide el volumen de disolución madre que se toma, V₁.',
        });
        lista.push({
          error: 'cociente-invertido',
          valor: (datos.c1 * datos.v2ML) / datos.c2,
          motivo: 'Has invertido el cociente: V₁ = C₂·V₂ ÷ C₁. Al diluir se toma MENOS volumen de madre que el volumen final.',
        });
      }
      break;

    case 'disolvente':
      if (positivo(datos.v2ML)) {
        lista.push({
          error: 'v1-por-disolvente',
          valor: datos.v2ML - v,
          motivo: 'Eso es V₁, el volumen de madre que se toma. El disolvente a añadir es lo que falta hasta el volumen final: V₂ − V₁.',
        });
      }
      break;

    case 'factor':
      if (positivo(datos.c1) && positivo(datos.c2)) {
        lista.push({
          error: 'factor-invertido',
          valor: datos.c2 / datos.c1,
          motivo: 'Has dividido al revés: el factor de dilución es C₁ ÷ C₂, y al diluir siempre es 1 o más.',
        });
      }
      break;

    case 'concentracionDiluida':
      if (positivo(datos.c1) && positivo(datos.v1ML) && positivo(datos.v2ML)) {
        lista.push({
          error: 'cociente-invertido',
          valor: (datos.c1 * datos.v2ML) / datos.v1ML,
          motivo: 'Has invertido los volúmenes: C₂ = C₁·V₁ ÷ V₂. Al diluir la concentración baja, no sube.',
        });
      }
      break;

    default:
      break;
  }
  return lista.filter((e) => Number.isFinite(e.valor));
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
  /** El error típico reconocido, o null. */
  error: ErrorConNombre | null;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza.
 *
 * Orden: no es un número → acierto → error con nombre → imposible → fallo genérico. Los errores
 * con nombre van ANTES que el imposible porque el factor invertido (C₂/C₁ < 1) es a la vez
 * imposible y un error típico, y el nombre enseña más. Cada error se reconoce con la relativa
 * de SU cifra (`dentroDeTolerancia`), y se descarta si su cifra cae dentro de la tolerancia de
 * la respuesta correcta: así un error nunca puede tapar un acierto.
 */
export function comprobarRespuesta(usuario: number, esperado: number, datos: DatosCaso): Veredicto {
  const ficha = FICHAS[datos.tipo];
  const r = resolverCaso(datos);
  const objetivo = r.ok ? r.valor : esperado;
  const tolerancia = toleranciaDe(datos);
  const magnitud = ficha.magnitud(datos);
  const c = corregirNumero(usuario, objetivo, { tolerancia, magnitud });
  const { diferencia } = c;

  if (c.estado === 'no-numerico') {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
      error: null,
    };
  }
  if (c.estado === 'acierto') {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia, error: null };
  }

  for (const e of erroresPosibles(datos)) {
    if (dentroDeTolerancia(e.valor, objetivo, tolerancia)) continue;
    if (dentroDeTolerancia(usuario, e.valor, toleranciaRelativa(e.valor))) {
      return { correcto: false, motivo: e.motivo, diferencia, tolerancia, error: e.error };
    }
  }

  if (c.estado === 'imposible') {
    const motivo =
      usuario < magnitud.minimo
        ? ficha.porDebajo
        : ficha.porEncima
          ? ficha.porEncima(datos)
          : (c.motivoImposible ?? 'Ese valor no es posible: repasa la cuenta.');
    return { correcto: false, motivo, diferencia, tolerancia, error: null };
  }

  return {
    correcto: false,
    // Con tolerancia 0, «50,004» para 50 no puede decir «Te has desviado 0» (hallazgo 3369)
    motivo: `No es correcto. Te has desviado ${textoDesviacion(diferencia, ficha.decimales, numero)} de la respuesta.`,
    diferencia,
    tolerancia,
    error: null,
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
  respuesta: number;
  respuestaTexto: string;
  /** ¿Pide el enunciado redondear? Lo decide `exigeRedondeo`, igual que el margen. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
  /**
   * Qué poner en el simulador para ver la cifra o confirmarla. Solo donde es VERDAD con los
   * deslizadores (pasos de 0,5 g, 10 mL, 0,1 y 0,05 mol/L) y con los decimales del panel.
   */
  comoComprobar?: string;
}

type Definicion = Omit<Caso, 'etiquetaRespuesta' | 'respuesta' | 'respuestaTexto' | 'requiereRedondeo' | 'pasos'>;

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, y el
 * «Redondea a…» del final del enunciado lo añade `exigeRedondeo`, de modo que editar un
 * enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: este canal es sobre todo de fuera de España.
 */
const DEFINICIONES: readonly Definicion[] = [
  {
    id: 1,
    titulo: 'Molaridad de una disolución de sal',
    enunciado:
      'Se disuelven 58,5 g de sal común (NaCl, masa molar 58,44 g/mol) en agua y se enrasa hasta 500 mL de disolución. ¿Cuál es la molaridad de la disolución, en mol/L?',
    categoria: 'abstracto',
    datos: { tipo: 'molaridad', solutoId: 'nacl', masaG: 58.5, volumenML: 500 },
    pista: 'Primero pasa los gramos a moles (divide entre la masa molar) y el volumen a litros; después, M = moles ÷ litros.',
    comoComprobar:
      'En «Preparar disolución», elige la sal común (NaCl) y pon 58,5 g y 500 mL: la Molaridad sale 2,002 mol/L.',
  },
  {
    id: 2,
    titulo: 'Moles en una muestra de sal',
    enunciado: '¿Cuántos moles de cloruro de sodio (NaCl, masa molar 58,44 g/mol) hay en 87,5 g de sal?',
    categoria: 'abstracto',
    datos: { tipo: 'moles', solutoId: 'nacl', masaG: 87.5 },
    pista: 'La masa molar dice cuántos gramos pesa 1 mol: n = masa ÷ masa molar.',
    comoComprobar:
      'En «Preparar disolución», elige la sal común (NaCl) y pon 87,5 g (el volumen da igual): los Moles de soluto salen 1,4973 mol.',
  },
  {
    id: 3,
    titulo: 'Concentración en gramos por litro',
    enunciado:
      'En el laboratorio se disuelven 12,5 g de sulfato de cobre(II) (CuSO₄) en agua y se enrasa hasta 250 mL de disolución. ¿Cuál es su concentración másica, en g/L?',
    categoria: 'aplicado',
    datos: { tipo: 'gPorLitro', solutoId: 'cuso4', masaG: 12.5, volumenML: 250 },
    pista: 'Los g/L son gramos de soluto por cada litro de disolución: pasa los 250 mL a litros y divide.',
    comoComprobar:
      'En «Preparar disolución», elige el sulfato de cobre(II) (CuSO₄) y pon 12,5 g y 250 mL: la Concentración másica sale 50,00 g/L.',
  },
  {
    id: 4,
    titulo: 'Un suero glucosado',
    enunciado:
      'Para preparar un suero se disuelven 25 g de glucosa (C₆H₁₂O₆) en agua y se enrasa hasta 500 mL de disolución. ¿Cuál es su concentración en % m/v (gramos de soluto por cada 100 mL de disolución)?',
    categoria: 'aplicado',
    datos: { tipo: 'porcentajeMV', solutoId: 'glucosa', masaG: 25, volumenML: 500 },
    pista: 'Si en 500 mL hay 25 g, ¿cuántos gramos hay en 100 mL? Eso es el % m/v.',
    comoComprobar:
      'En «Preparar disolución», elige la glucosa y pon 25 g y 500 mL: el % masa / volumen sale 5,00 % m/v.',
  },
  {
    id: 5,
    titulo: 'Una disolución patrón en ppm',
    enunciado:
      'Para calibrar un medidor de la calidad del agua se disuelve 1 g de sal común (NaCl) en agua y se enrasa hasta 500 mL de disolución. Es una disolución acuosa diluida, de densidad ≈ 1 g/mL, así que 1 ppm equivale a 1 mg/L. ¿Cuál es su concentración en ppm?',
    categoria: 'aplicado',
    datos: { tipo: 'ppm', solutoId: 'nacl', masaG: 1, volumenML: 500 },
    pista: 'Pasa la masa a miligramos y el volumen a litros: ppm ≈ mg ÷ L.',
    comoComprobar:
      'En «Preparar disolución», elige la sal común (NaCl) y pon 1 g y 500 mL: las ppm salen 2000 ppm.',
  },
  {
    id: 6,
    titulo: 'Cuánto permanganato pesar',
    enunciado:
      'Una práctica pide 500 mL de disolución de permanganato de potasio (KMnO₄, masa molar 158,03 g/mol) de concentración 0,2 mol/L. ¿Qué masa de KMnO₄ hay que pesar, en gramos?',
    categoria: 'aplicado',
    datos: { tipo: 'masaParaMolaridad', solutoId: 'kmno4', molaridad: 0.2, volumenML: 500 },
    pista: 'Calcula los moles que necesitas (molaridad × litros) y pásalos a gramos con la masa molar.',
    comoComprobar:
      'En «Preparar disolución», elige el permanganato de potasio (KMnO₄) y 500 mL: con 15,5 g la Molaridad sale 0,196 mol/L y con 16 g, 0,202 mol/L. Tu masa tiene que estar entre las dos.',
  },
  {
    id: 7,
    titulo: 'De gramos por litro a molaridad',
    enunciado:
      'Una disolución de sulfato de cobre(II) (CuSO₄, masa molar 159,61 g/mol) contiene 160 g de soluto por cada litro de disolución. ¿Cuál es su molaridad, en mol/L?',
    categoria: 'abstracto',
    datos: { tipo: 'molaridadDesdeGPorLitro', solutoId: 'cuso4', gPorLitro: 160 },
    pista: 'En un litro hay 160 g: pásalos a moles dividiendo entre la masa molar, y ya tienes los moles por litro.',
    comoComprobar:
      'En «Preparar disolución», elige el sulfato de cobre(II) (CuSO₄) y pon 40 g y 250 mL (160 g/L): la Molaridad sale 1,002 mol/L.',
  },
  {
    id: 8,
    titulo: 'Cuánta disolución madre tomar',
    enunciado:
      'En el laboratorio hay una disolución madre de 2,5 mol/L. Se necesitan 200 mL de una disolución de 0,75 mol/L del mismo soluto. ¿Qué volumen de disolución madre hay que tomar, en mL?',
    categoria: 'aplicado',
    datos: { tipo: 'volumenMadre', c1: 2.5, c2: 0.75, v2ML: 200 },
    pista: 'Los moles de soluto son los mismos antes y después de diluir: C₁·V₁ = C₂·V₂. Despeja V₁.',
    comoComprobar:
      'En «Diluir», pon C₁ = 2,5 mol/L, C₂ = 0,75 mol/L y V₂ = 200 mL: el Volumen de madre (V₁) sale 60,0 mL.',
  },
  {
    id: 9,
    titulo: 'Cuánta agua añadir',
    enunciado:
      'A partir de una disolución madre de 5 mol/L se quieren preparar 400 mL de disolución de 1,2 mol/L. ¿Cuántos mL de agua hay que añadir a la disolución madre? Supón que los volúmenes se suman: el volumen final es el de madre más el de agua.',
    categoria: 'aplicado',
    datos: { tipo: 'disolvente', c1: 5, c2: 1.2, v2ML: 400 },
    pista: 'Calcula primero el volumen de madre V₁ con C₁·V₁ = C₂·V₂; el agua es lo que falta hasta 400 mL.',
    comoComprobar:
      'En «Diluir», pon C₁ = 5 mol/L, C₂ = 1,2 mol/L y V₂ = 400 mL: el Disolvente a añadir sale 304,0 mL.',
  },
  {
    id: 10,
    titulo: 'El factor de dilución',
    enunciado:
      'Una disolución de 3 mol/L se diluye hasta obtener 150 mL de disolución de 0,4 mol/L. ¿Cuál es el factor de dilución, es decir, cuántas veces menos concentrada queda?',
    categoria: 'abstracto',
    datos: { tipo: 'factor', c1: 3, c2: 0.4, v2ML: 150 },
    pista: 'El factor de dilución compara las dos concentraciones: la de partida entre la final.',
    comoComprobar: 'En «Diluir», pon C₁ = 3 mol/L, C₂ = 0,4 mol/L y V₂ = 150 mL: el Factor de dilución sale 7,5×.',
  },
  {
    id: 11,
    titulo: 'La concentración tras diluir',
    enunciado:
      'Con una pipeta se toman 30 mL de una disolución de 2,5 mol/L, se pasan a un matraz aforado y se completa con agua hasta 250 mL. ¿Cuál es la concentración de la nueva disolución, en mol/L?',
    categoria: 'aplicado',
    datos: { tipo: 'concentracionDiluida', c1: 2.5, v1ML: 30, v2ML: 250 },
    pista: 'Los moles que había en los 30 mL ahora están repartidos en 250 mL: C₁·V₁ = C₂·V₂. Despeja C₂.',
    comoComprobar:
      'En «Diluir», pon C₁ = 2,5 mol/L, V₂ = 250 mL y en C₂ tu resultado: el Volumen de madre (V₁) debe salir 30,0 mL.',
  },
  {
    id: 12,
    titulo: 'Un suero fisiológico',
    enunciado:
      'El suero fisiológico es una disolución de sal común (NaCl) al 0,9 % m/v (gramos de soluto por cada 100 mL de disolución). ¿Cuántos gramos de sal hacen falta para preparar 500 mL de suero?',
    categoria: 'aplicado',
    datos: { tipo: 'masaParaPorcentaje', solutoId: 'nacl', porcentajeMV: 0.9, volumenML: 500 },
    pista: 'Un 0,9 % m/v son 0,9 g en cada 100 mL. ¿Cuántas veces caben 100 mL en 500 mL?',
    comoComprobar:
      'En «Preparar disolución», elige la sal común (NaCl) y pon tu masa y 500 mL: el % masa / volumen debe salir 0,90 % m/v.',
  },
];

/** Construye un caso o un ejercicio: respuesta, redondeo pedido y pasos salen del motor. */
function completar(enunciadoBase: string, datos: DatosCaso) {
  const ficha = FICHAS[datos.tipo];
  const r = resolverCaso(datos);
  const valor = r.ok ? redondearA(r.valor, ficha.decimales) : NaN;
  const requiereRedondeo = r.ok && exigeRedondeo(r.valor, ficha.decimales);
  return {
    enunciado: requiereRedondeo ? `${enunciadoBase} Redondea ${textoRedondeo(ficha.decimales)}.` : enunciadoBase,
    etiquetaRespuesta: ficha.etiqueta,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, datos),
    requiereRedondeo,
    pasos: r.pasos,
  };
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => ({
  ...def,
  ...completar(def.enunciado, def.datos),
}));

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente con
 * enteros pequeños, los primeros valores salen diminutos y parecidos, y `Math.floor(rnd()*n)`
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad (simulador-genetica, 14/09/2026).
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

/** Entero de `desde` a `hasta`, ambos incluidos. */
function entero(desde: number, hasta: number, rnd: () => number): number {
  return desde + Math.min(hasta - desde, Math.floor(rnd() * (hasta - desde + 1)));
}

/**
 * Concentración másica orientativa por encima de la cual el modo práctica no propone una
 * disolución (solubilidad en agua a temperatura ambiente, redondeada a la baja). La app no
 * limita la masa disuelta; el ejercicio, sí, para no pedir una disolución que no se puede hacer.
 */
const MAXIMO_G_POR_LITRO: Readonly<Record<string, number>> = {
  kmno4: 60,
  cuso4: 200,
  k2cr2o7: 120,
  nicl2: 600,
  nacl: 350,
  glucosa: 900,
};

/** Concentración másica (g/L) de la disolución de la que habla el ejercicio, si la hay. */
function gPorLitroDelEjercicio(d: DatosCaso): number | undefined {
  const mm = masaMolarDe(d);
  switch (d.tipo) {
    case 'molaridad':
    case 'gPorLitro':
    case 'porcentajeMV':
    case 'ppm':
      return positivo(d.masaG) && positivo(d.volumenML) ? d.masaG / (d.volumenML / 1000) : undefined;
    case 'masaParaMolaridad':
      return positivo(d.molaridad) && positivo(mm) ? d.molaridad * mm : undefined;
    case 'molaridadDesdeGPorLitro':
      return d.gPorLitro;
    case 'masaParaPorcentaje':
      return positivo(d.porcentajeMV) ? d.porcentajeMV * 10 : undefined;
    default:
      return undefined;
  }
}

/**
 * ¿Sirve como ejercicio? Se resuelve, cabe en la app, es una disolución que se puede hacer y
 * su respuesta no deja que el suelo de 0,01 de la tolerancia relativa valga más que el 1 %.
 */
function aceptable(d: DatosCaso): boolean {
  const r = resolverCaso(d);
  if (!r.ok || !(r.valor > 0)) return false;
  if (dependeDeMasaMolar(d) && r.valor < 1) return false;
  const gL = gPorLitroDelEjercicio(d);
  const maximo = d.solutoId ? MAXIMO_G_POR_LITRO[d.solutoId] : undefined;
  if (gL !== undefined && maximo !== undefined && gL > maximo) return false;
  switch (d.tipo) {
    case 'masaParaMolaridad':
    case 'masaParaPorcentaje':
      // La masa que se pide tiene que caber en el deslizador de la app (0,5 a 100 g).
      return r.valor >= 0.5 && r.valor <= 100;
    case 'volumenMadre':
    case 'disolvente':
    case 'factor': {
      // C₂ como mucho el 80 % de C₁: diluir de 2 a 1,95 mol/L no es un ejercicio de dilución.
      if (!positivo(d.c1) || !positivo(d.c2) || !(d.c2 <= 0.8 * d.c1)) return false;
      const dil = calcularDilucion(d.c1, d.c2, d.v2ML ?? 0);
      // V₁ y el disolvente iguales (C₂ = C₁/2) dejarían sin nombre el error de confundirlos.
      return dil.v1 >= 5 && Math.abs(dil.v1 - dil.disolvente) > 1;
    }
    case 'concentracionDiluida':
      return r.valor >= 0.05;
    case 'ppm':
      // «Diluida» de verdad, para que 1 ppm ≈ 1 mg/L se sostenga: como mucho 10 g/L.
      return r.valor <= 10000;
    default:
      return true;
  }
}

/** Enunciado del modo práctica: los mismos convenios que los casos fijos, sin contexto. */
function enunciadoPractica(d: DatosCaso): string {
  const s = d.solutoId ? solutoPorId(d.solutoId) : undefined;
  // Solo la inicial en minúscula: `toLowerCase` entero daría «cloruro de níquel(ii)».
  const nombre = s ? s.nombre.charAt(0).toLowerCase() + s.nombre.slice(1) : 'soluto';
  // La masa molar con dos decimales, como la imprime el panel («129,60», no «129,6»).
  const conMasaMolar = s ? `${nombre} (${s.formula}, masa molar ${formatNumber(s.masaMolar, 2)} g/mol)` : 'soluto';
  const sinMasaMolar = s ? `${nombre} (${s.formula})` : 'soluto';
  const enrase = `y se enrasa hasta ${numero(d.volumenML ?? NaN)} mL de disolución`;
  // «Se disuelve 1 g», «se disuelven 2,5 g».
  const seDisuelve = `${d.masaG === 1 ? 'Se disuelve' : 'Se disuelven'} ${numero(d.masaG ?? NaN)} g`;
  switch (d.tipo) {
    case 'molaridad':
      return `${seDisuelve} de ${conMasaMolar} en agua ${enrase}. ¿Cuál es la molaridad, en mol/L?`;
    case 'moles':
      return `¿Cuántos moles hay en ${numero(d.masaG ?? NaN)} g de ${conMasaMolar}?`;
    case 'gPorLitro':
      return `${seDisuelve} de ${sinMasaMolar} en agua ${enrase}. ¿Cuál es su concentración másica, en g/L?`;
    case 'porcentajeMV':
      return `${seDisuelve} de ${sinMasaMolar} en agua ${enrase}. ¿Cuál es su concentración en % m/v (gramos de soluto por cada 100 mL de disolución)?`;
    case 'ppm':
      return `${seDisuelve} de ${sinMasaMolar} en agua ${enrase}. Es una disolución acuosa diluida (densidad ≈ 1 g/mL, 1 ppm = 1 mg/L). ¿Cuál es su concentración en ppm?`;
    case 'masaParaMolaridad':
      return `Hay que preparar ${numero(d.volumenML ?? NaN)} mL de disolución de ${conMasaMolar} de concentración ${numero(d.molaridad ?? NaN)} mol/L. ¿Qué masa hay que pesar, en gramos?`;
    case 'molaridadDesdeGPorLitro':
      return `Una disolución de ${conMasaMolar} contiene ${numero(d.gPorLitro ?? NaN)} g de soluto por cada litro de disolución. ¿Cuál es su molaridad, en mol/L?`;
    case 'masaParaPorcentaje':
      return `¿Cuántos gramos de ${sinMasaMolar} hacen falta para preparar ${numero(d.volumenML ?? NaN)} mL de disolución al ${numero(d.porcentajeMV ?? NaN)} % m/v (gramos de soluto por cada 100 mL de disolución)?`;
    case 'volumenMadre':
      return `Hay una disolución madre de ${numero(d.c1 ?? NaN)} mol/L y se necesitan ${numero(d.v2ML ?? NaN)} mL de disolución de ${numero(d.c2 ?? NaN)} mol/L. ¿Qué volumen de madre hay que tomar, en mL?`;
    case 'disolvente':
      return `A partir de una disolución madre de ${numero(d.c1 ?? NaN)} mol/L se preparan ${numero(d.v2ML ?? NaN)} mL de disolución de ${numero(d.c2 ?? NaN)} mol/L. ¿Cuántos mL de disolvente hay que añadir a la madre? Supón que los volúmenes se suman.`;
    case 'factor':
      return `Una disolución de ${numero(d.c1 ?? NaN)} mol/L se diluye hasta obtener ${numero(d.v2ML ?? NaN)} mL de ${numero(d.c2 ?? NaN)} mol/L. ¿Cuál es el factor de dilución?`;
    case 'concentracionDiluida':
      return `Se toman ${numero(d.v1ML ?? NaN)} mL de una disolución de ${numero(d.c1 ?? NaN)} mol/L y se completa con disolvente hasta ${numero(d.v2ML ?? NaN)} mL. ¿Cuál es la nueva concentración, en mol/L?`;
    default:
      return '';
  }
}

const TIPOS: readonly TipoPregunta[] = [
  'molaridad',
  'moles',
  'gPorLitro',
  'porcentajeMV',
  'ppm',
  'masaParaMolaridad',
  'molaridadDesdeGPorLitro',
  'masaParaPorcentaje',
  'volumenMadre',
  'disolvente',
  'factor',
  'concentracionDiluida',
];

const IDS_SOLUTOS = ['kmno4', 'cuso4', 'k2cr2o7', 'nicl2', 'nacl', 'glucosa'] as const;
const VOLUMENES_ML = [100, 150, 200, 250, 300, 400, 500, 750, 1000] as const;
const MOLARIDADES = [0.1, 0.2, 0.25, 0.5, 1, 1.5, 2] as const;
const PORCENTAJES = [0.9, 1, 2, 2.5, 5, 10] as const;
const G_POR_LITRO = [60, 80, 100, 120, 150, 180, 200, 250, 300, 360, 450] as const;

/** Unos datos al azar del tipo pedido, en la rejilla de los deslizadores de la app. */
function datosAlAzar(tipo: TipoPregunta, rnd: () => number): DatosCaso {
  const solutoId = elegir(IDS_SOLUTOS, rnd);
  // Masas de 0,5 en 0,5 y volúmenes de 10 en 10, como los deslizadores; C₁ en décimas y C₂ en
  // veinteavos, con enteros para no arrastrar el 0,30000000000000004 de sumar 0,1.
  const masaG = entero(1, 200, rnd) / 2;
  const volumenML = elegir(VOLUMENES_ML, rnd);
  switch (tipo) {
    case 'moles':
      // Con la masa en el deslizador (≤ 100 g), solo la sal común llega a 1 mol, el suelo que
      // necesita la tolerancia relativa: 59 a 100 g de NaCl.
      return { tipo, solutoId: 'nacl', masaG: entero(118, 200, rnd) / 2, volumenML };
    case 'molaridad':
    case 'gPorLitro':
    case 'porcentajeMV':
      return { tipo, solutoId, masaG, volumenML };
    case 'ppm':
      // Concentraciones bajas, de agua: 0,5 a 5 g en el volumen.
      return { tipo, solutoId, masaG: entero(1, 10, rnd) / 2, volumenML };
    case 'masaParaMolaridad':
      return { tipo, solutoId, molaridad: elegir(MOLARIDADES, rnd), volumenML };
    case 'molaridadDesdeGPorLitro':
      return { tipo, solutoId, gPorLitro: elegir(G_POR_LITRO, rnd) };
    case 'masaParaPorcentaje':
      return { tipo, solutoId, porcentajeMV: elegir(PORCENTAJES, rnd), volumenML };
    case 'volumenMadre':
    case 'disolvente':
    case 'factor':
      return { tipo, c1: entero(5, 50, rnd) / 10, c2: entero(1, 60, rnd) / 20, v2ML: entero(5, 100, rnd) * 10 };
    case 'concentracionDiluida':
      return { tipo, c1: entero(5, 50, rnd) / 10, v1ML: entero(1, 20, rnd) * 5, v2ML: entero(10, 100, rnd) * 10 };
    default:
      return { tipo, solutoId, masaG, volumenML };
  }
}

export interface Ejercicio {
  enunciado: string;
  datos: DatosCaso;
  etiquetaRespuesta: string;
  respuesta: number;
  respuestaTexto: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

/**
 * Ejercicio aleatorio de cualquiera de los doce tipos. Usa EL MISMO `resolverCaso` que los doce
 * fijos, y por tanto el mismo motor que el panel: si divergieran, el alumno entrenaría con una
 * regla y sería corregido con otra. La semilla es obligatoria: la vista la saca en el clic, no
 * en el render (candado `check:reloj-azar`).
 */
export function generarEjercicioAleatorio(semilla: number): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const tipo = elegir(TIPOS, rnd);
  let datos = datosAlAzar(tipo, rnd);
  let intentos = 0;
  while (!aceptable(datos) && intentos < 60) {
    datos = datosAlAzar(tipo, rnd);
    intentos += 1;
  }
  // Sin suerte en 60 intentos, los datos del caso fijo de ese mismo tipo, que son aceptables.
  if (!aceptable(datos)) datos = (DEFINICIONES.find((d) => d.datos.tipo === tipo) ?? DEFINICIONES[0]).datos;
  return { datos, ...completar(enunciadoPractica(datos), datos) };
}
