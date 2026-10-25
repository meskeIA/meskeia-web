/**
 * Casos para clase — la tarea asignable de `simulador-estequiometria` (semilla S0199, 16/10/2026).
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la química está
 * bien: una masa plausible pasa cualquier compilación ([[feedback_motor_calculo_aparte_y_probado]]).
 * Aquí no hay React ni DOM, solo funciones puras.
 *
 * ── LA QUÍMICA NO SE REPLICA AQUÍ ─────────────────────────────────────────────
 *
 * Toda respuesta sale de `calcular` y `molesNecesarios`, de `./motor.ts`, el MISMO módulo con
 * que el simulador pinta su panel de resultados y sus barras de moles. Los pasos de la
 * solución escriben cifras intermedias —son la explicación para el alumno—, pero la RESPUESTA
 * es siempre la del motor.
 *
 * ── EL CONVENIO DE ESTA APP: LAS MASAS MOLARES ────────────────────────────────
 *
 * El simulador usa los pesos atómicos de la IUPAC (H 1,008 · C 12,011 · O 15,999…), y los
 * libros de secundaria, los redondeados (H = 1, C = 12, O = 16, Na = 23, Cl = 35,5, Fe = 56).
 * Son dos convenios legítimos que dan cifras distintas: el H₂ pasa de 2 a 2,016, un 0,8 %.
 * Se resuelve con la técnica de los cuartiles (skill /casos-aula-meskeia): los datos de los
 * doce casos se eligieron para que las DOS tablas den la misma respuesta dentro de la
 * tolerancia, con margen (la mayor desviación es un 0,55 %), y el generador aleatorio
 * descarta lo que no cumpla lo mismo (`coincideConLibro`). El test lo comprueba con una tabla
 * de masas de libro escrita en el propio test.
 *
 * Por eso el corrector no usa la tolerancia de redondeo: con media centésima de margen, quien usa
 * las masas de su libro suspendería una cuenta bien hecha. Tampoco el 1 % fijo que usó hasta el
 * 25/10/2026 (hallazgo 3451): da por buenas las dos tablas, pero donde las dos coinciden aprueba
 * cifras que no salen de ninguna. Acepta el intervalo entre las dos respuestas exactas más un
 * margen medido para los redondeos intermedios (`ventanaDe`).
 *
 * · Todos los gramos son enteros y caben en los controles del simulador, y el rendimiento es
 *   un entero de 0 a 100, como su deslizador: «Cargar en el simulador» los pone tal cual.
 * · Ningún caso está cerca de la mezcla estequiométrica: el limitante es el mismo con las dos
 *   tablas de masas (el test lo exige).
 * · El producto por el que se pregunta es siempre el PRINCIPAL de la reacción, el que muestra
 *   el panel (CO₂, H₂O, NaCl, NH₃, Fe₂O₃ o etanol).
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
  textoDesviacion,
  toleranciaRelativa,
  type Magnitud,
} from '@/lib/calculadoras/correctorCasosAula';
import { calcular, esReaccionConCatalizador, molesNecesarios, reaccionPorId, type Reaccion } from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta = 'moles' | 'masa-necesaria' | 'masa-teorica' | 'exceso' | 'masa-real' | 'rendimiento';

export interface DatosCaso {
  pregunta: Pregunta;
  reaccionId: string;
  /** Gramos del primer reactivo (el de la izquierda en la ecuación). */
  gramosA: number;
  /** Gramos del segundo reactivo; 0 si es el catalizador de la fermentación. */
  gramosB: number;
  /** Rendimiento de la reacción, en %. Obligatorio en `masa-real`. */
  rendimiento?: number;
  /** Gramos de producto obtenidos de verdad. Obligatorio en `rendimiento`. */
  masaObtenida?: number;
  /** De qué reactivo se piden los moles en `moles`. Por defecto, el primero. */
  reactivo?: 'A' | 'B';
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Lo que «Cargar en el simulador» pone en los controles de la app. */
export interface ConfiguracionSimulador {
  reaccionId: string;
  gramosA: number;
  gramosB: number;
  rendimiento: number;
}

/** Decimales de la respuesta: los moles con tres, las masas y el rendimiento con dos. */
export function decimalesDe(pregunta: Pregunta): number {
  return pregunta === 'moles' ? 3 : 2;
}

export function unidadDe(pregunta: Pregunta): string {
  if (pregunta === 'moles') return 'mol';
  if (pregunta === 'rendimiento') return '%';
  return 'g';
}

/** Lo que se escribe en la casilla, con unidad. Derivado de la pregunta, nunca a mano. */
export function etiquetaDe(pregunta: Pregunta): string {
  if (pregunta === 'moles') return 'Cantidad de sustancia, en mol';
  if (pregunta === 'rendimiento') return 'Rendimiento, en %';
  return 'Masa, en g';
}

/**
 * El resultado con su unidad y los decimales pedidos: «21,95 g», «2,493 mol», «81,11 %».
 * Espacio duro antes de la unidad, para que el % no salte solo de línea (CLAUDE.md global §2).
 */
export function textoRespuesta(valor: number, unidad: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  return `${formatNumber(valor, decimales)} ${unidad}`;
}

/* ─────────────────────────── Formato de los pasos ─────────────────────────── */

/** «Óxido de hierro (III)» → «óxido de hierro (III)»: solo la inicial, no los numerales. */
function minuscula(texto: string): string {
  return texto.charAt(0).toLowerCase() + texto.slice(1);
}

/** Cifra en formato español con los decimales que de verdad tiene, hasta `maxDecimales`. */
function cifra(n: number, maxDecimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  let d = 0;
  while (d < maxDecimales && Math.abs(redondearA(n, d) - n) > 1e-9 * Math.max(1, Math.abs(n))) d += 1;
  return formatNumber(n, d);
}

/** La masa molar con los decimales que muestra la etiqueta «M = … g/mol» del simulador. */
function masaMolar(r: Reaccion, i: 0 | 1): string {
  const s = r.reactivos[i];
  return formatNumber(s.masaMolar, s.decimalesM);
}

function masaMolarProducto(r: Reaccion): string {
  const p = r.productos[0];
  return formatNumber(p.masaMolar, p.decimalesM);
}

/** El último paso: la cifra exacta y, si hay que redondear, su redondeo a lo pedido. */
function pasoFinal(simbolo: string, expresion: string, valor: number, pregunta: Pregunta): string {
  const decimales = decimalesDe(pregunta);
  const unidad = unidadDe(pregunta);
  const exacto = exigeRedondeo(valor, decimales)
    ? `${cifra(valor, decimales + 2)} ${unidad} → ${textoRespuesta(redondearA(valor, decimales), unidad, decimales)}`
    : textoRespuesta(valor, unidad, decimales);
  return `${simbolo} = ${expresion} = ${exacto}`;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

function positivo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

/**
 * Los pasos comunes a toda pregunta que necesita el limitante: moles de cada reactivo, razón
 * n/coeficiente y quién se agota. Devuelve también la razón del limitante, que es con la que
 * se calcula el producto.
 */
function pasosDelLimitante(r: Reaccion, d: DatosCaso, pasos: string[]): { ratio: number } | { error: string } {
  const [rA, rB] = r.reactivos;
  const c = calcular(r, d.gramosA, d.gramosB, 100);
  pasos.push(`n(${rA.formula}) = ${cifra(d.gramosA)} g ÷ ${masaMolar(r, 0)} g/mol = ${cifra(c.molesA)} mol`);
  if (esReaccionConCatalizador(r)) {
    pasos.push(`Solo se consume la ${minuscula(rA.nombre)}: la levadura es un catalizador, así que no hay limitante que buscar.`);
    return { ratio: c.molesA / rA.coeficiente };
  }
  const molesB = c.molesB ?? NaN;
  pasos.push(`n(${rB.formula}) = ${cifra(d.gramosB)} g ÷ ${masaMolar(r, 1)} g/mol = ${cifra(molesB)} mol`);
  const ratioA = c.molesA / rA.coeficiente;
  const ratioB = molesB / rB.coeficiente;
  if (c.limitante === 'ambos') return { error: 'Es una mezcla estequiométrica: los dos reactivos se agotan a la vez.' };
  const lim = c.limitante === 'A' ? rA : rB;
  pasos.push(
    `Razón n ÷ coeficiente: ${rA.formula} ${cifra(c.molesA)} ÷ ${rA.coeficiente} = ${cifra(ratioA)} · ${rB.formula} ${cifra(molesB)} ÷ ${rB.coeficiente} = ${cifra(ratioB)}. La menor es la del ${minuscula(lim.nombre)} (${lim.formula}): es el reactivo limitante.`,
  );
  return { ratio: Math.min(ratioA, ratioB) };
}

/**
 * Resuelve un caso desde sus datos, sin mirar ninguna respuesta escrita. El número lo da
 * siempre el motor (`calcular`, `molesNecesarios`); los pasos son la explicación.
 */
export function resolverCaso(d: DatosCaso): Resolucion {
  const r = reaccionPorId(d.reaccionId);
  if (!r) return { ok: false, valor: NaN, pasos: [], error: 'Reacción desconocida.' };
  const catalizador = esReaccionConCatalizador(r);
  if (!positivo(d.gramosA) || (!catalizador && !positivo(d.gramosB) && d.pregunta !== 'masa-necesaria')) {
    return { ok: false, valor: NaN, pasos: [], error: 'Las masas de los reactivos deben ser positivas.' };
  }
  const [rA, rB] = r.reactivos;
  const producto = r.productos[0];
  const pasos: string[] = [];

  switch (d.pregunta) {
    case 'moles': {
      const cual = d.reactivo ?? 'A';
      if (cual === 'B' && catalizador) return { ok: false, valor: NaN, pasos: [], error: 'La levadura no se pesa en moles.' };
      const gramos = cual === 'A' ? d.gramosA : d.gramosB;
      const c = calcular(r, d.gramosA, catalizador ? 0 : d.gramosB, 100);
      const valor = cual === 'A' ? c.molesA : (c.molesB ?? NaN);
      const s = cual === 'A' ? rA : rB;
      pasos.push(`La cantidad de sustancia es la masa entre la masa molar: n = m ÷ M.`);
      pasos.push(pasoFinal(`n(${s.formula})`, `${cifra(gramos)} g ÷ ${masaMolar(r, cual === 'A' ? 0 : 1)} g/mol`, valor, d.pregunta));
      return { ok: Number.isFinite(valor), valor, pasos };
    }

    case 'masa-necesaria': {
      if (catalizador) return { ok: false, valor: NaN, pasos: [], error: 'Con un solo reactivo no hay segundo reactivo que calcular.' };
      const c = calcular(r, d.gramosA, positivo(d.gramosB) ? d.gramosB : 1, 100);
      const { necesariosB } = molesNecesarios(r, c.molesA, c.molesB ?? 0);
      const valor = necesariosB * rB.masaMolar;
      pasos.push(`n(${rA.formula}) = ${cifra(d.gramosA)} g ÷ ${masaMolar(r, 0)} g/mol = ${cifra(c.molesA)} mol`);
      pasos.push(
        `Por la ecuación, ${rA.coeficiente} mol de ${rA.formula} reaccionan con ${rB.coeficiente} mol de ${rB.formula}: n(${rB.formula}) = ${cifra(c.molesA)} × ${rB.coeficiente} ÷ ${rA.coeficiente} = ${cifra(necesariosB)} mol`,
      );
      pasos.push(pasoFinal(`m(${rB.formula})`, `${cifra(necesariosB)} mol × ${masaMolar(r, 1)} g/mol`, valor, d.pregunta));
      return { ok: Number.isFinite(valor), valor, pasos };
    }

    case 'masa-teorica':
    case 'masa-real':
    case 'rendimiento': {
      if (d.pregunta === 'masa-real' && !(typeof d.rendimiento === 'number' && d.rendimiento > 0 && d.rendimiento <= 100)) {
        return { ok: false, valor: NaN, pasos: [], error: 'Falta el rendimiento.' };
      }
      if (d.pregunta === 'rendimiento' && !positivo(d.masaObtenida)) {
        return { ok: false, valor: NaN, pasos: [], error: 'Falta la masa obtenida.' };
      }
      const lim = pasosDelLimitante(r, d, pasos);
      if ('error' in lim) return { ok: false, valor: NaN, pasos, error: lim.error };
      const c = calcular(r, d.gramosA, catalizador ? 0 : d.gramosB, d.rendimiento ?? 100);
      pasos.push(`n(${producto.formula}) = ${cifra(lim.ratio)} × ${producto.coeficiente} = ${cifra(c.molesProductoTeorico)} mol`);
      const expresionTeorica = `${cifra(c.molesProductoTeorico)} mol × ${masaMolarProducto(r)} g/mol`;
      if (d.pregunta === 'masa-teorica') {
        pasos.push(pasoFinal(`m(${producto.formula})`, expresionTeorica, c.masaProductoTeorica, d.pregunta));
        return { ok: Number.isFinite(c.masaProductoTeorica), valor: c.masaProductoTeorica, pasos };
      }
      pasos.push(`m teórica(${producto.formula}) = ${expresionTeorica} = ${cifra(c.masaProductoTeorica)} g`);
      if (d.pregunta === 'masa-real') {
        pasos.push(
          pasoFinal(`m real`, `${cifra(c.masaProductoTeorica)} g × ${cifra(d.rendimiento ?? 100)} ÷ 100`, c.masaProductoReal, d.pregunta),
        );
        return { ok: Number.isFinite(c.masaProductoReal), valor: c.masaProductoReal, pasos };
      }
      const obtenida = d.masaObtenida ?? NaN;
      const valor = (obtenida / c.masaProductoTeorica) * 100;
      pasos.push(pasoFinal(`Rendimiento`, `${cifra(obtenida)} g ÷ ${cifra(c.masaProductoTeorica)} g × 100`, valor, d.pregunta));
      return { ok: Number.isFinite(valor), valor, pasos };
    }

    case 'exceso': {
      if (catalizador) return { ok: false, valor: NaN, pasos: [], error: 'Con un solo reactivo no sobra nada.' };
      const lim = pasosDelLimitante(r, d, pasos);
      if ('error' in lim) return { ok: false, valor: NaN, pasos, error: lim.error };
      const c = calcular(r, d.gramosA, d.gramosB, 100);
      if (!c.exceso) return { ok: false, valor: NaN, pasos, error: 'No sobra ningún reactivo.' };
      const sobra = c.limitante === 'A' ? rB : rA;
      const disponibles = c.limitante === 'A' ? (c.molesB ?? NaN) : c.molesA;
      const consumidos = lim.ratio * sobra.coeficiente;
      pasos.push(
        `El ${minuscula(sobra.nombre)} (${sobra.formula}) está en exceso. Se consumen ${cifra(lim.ratio)} × ${sobra.coeficiente} = ${cifra(consumidos)} mol de los ${cifra(disponibles)} mol que hay.`,
      );
      pasos.push(`Sobran ${cifra(disponibles)} − ${cifra(consumidos)} = ${cifra(c.exceso.moles)} mol`);
      pasos.push(
        pasoFinal(`m(${sobra.formula}) sobrante`, `${cifra(c.exceso.moles)} mol × ${formatNumber(sobra.masaMolar, sobra.decimalesM)} g/mol`, c.exceso.gramos, d.pregunta),
      );
      return { ok: Number.isFinite(c.exceso.gramos), valor: c.exceso.gramos, pasos };
    }
  }
}

/** Lo que pone «Cargar en el simulador». En `rendimiento` el deslizador queda en 100 %. */
export function configuracionDe(d: DatosCaso): ConfiguracionSimulador | null {
  const r = reaccionPorId(d.reaccionId);
  if (!r) return null;
  return {
    reaccionId: d.reaccionId,
    gramosA: d.gramosA,
    gramosB: esReaccionConCatalizador(r) ? 0 : d.gramosB,
    rendimiento: d.pregunta === 'masa-real' ? (d.rendimiento ?? 100) : 100,
  };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * Dominio de la respuesta para el corrector. Masas y moles son continuas; el rendimiento es un
 * porcentaje, y un «101 %» no está cerca de 100, está fuera de lo que existe (hallazgo 1207).
 */
export function magnitudDe(pregunta: Pregunta): Magnitud {
  return pregunta === 'rendimiento' ? 'porcentaje' : 'real';
}

/**
 * Margen para los redondeos intermedios, sobre el intervalo entre las dos tablas de masas: un
 * 0,5 % de la respuesta. Medido el 25/10/2026 en los doce casos y 80 prácticas: con los moles a
 * tres decimales y las masas molares a uno o dos, ninguna cuenta se sale del intervalo más de un
 * 0,20 %; n(HCl) a 1,1 mol en el caso 12 (80,81 %, el redondeo más grueso que anotó el Inspector)
 * se sale un 0,37 %. Los moles a dos decimales llegan al 1,33 %, y ni el 1 % de antes los cubría.
 */
const MARGEN_REDONDEO = 0.005;

/**
 * Lo que se da por bueno: de la menor a la mayor de las dos respuestas exactas (masas IUPAC y
 * masas de libro), más el margen de redondeo y media unidad del último decimal pedido. Se
 * expresa como un centro y una tolerancia para el corrector compartido.
 *
 * Hasta el 25/10/2026 era el 1 % de la respuesta en todos los casos (hallazgo 3451): justificado
 * por las masas de libro, pero el hueco entre las dos tablas va del 0,006 % al 0,55 % según el
 * caso, y donde es casi nulo el 1 % aprobaba cifras que no salen de ninguna tabla ni de ningún
 * redondeo (81,9 % en el caso 12, cuyas dos tablas dan 81,11 %; 166,7 g en el caso 9).
 */
export function ventanaDe(d: DatosCaso): { centro: number; tolerancia: number } {
  const iupac = resolverCaso(d);
  const r = reaccionPorId(d.reaccionId);
  if (!iupac.ok || !r) return { centro: NaN, tolerancia: 0 };
  const libro = resolverConReaccion(conMasasDeLibro(r), d);
  const otra = Number.isFinite(libro) ? libro : iupac.valor;
  const menor = Math.min(iupac.valor, otra);
  const mayor = Math.max(iupac.valor, otra);
  const margen = MARGEN_REDONDEO * Math.abs(iupac.valor) + 10 ** -decimalesDe(d.pregunta) / 2;
  return { centro: (menor + mayor) / 2, tolerancia: (mayor - menor) / 2 + margen };
}

/** La semianchura de la ventana: lo que se da por bueno a cada lado de su centro. */
export function toleranciaDe(d: DatosCaso): number {
  return ventanaDe(d).tolerancia;
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
  const catalizador = esReaccionConCatalizador(r);
  const c = calcular(r, d.gramosA, catalizador ? 0 : d.gramosB, d.rendimiento ?? 100);
  const producto = r.productos[0];
  const errores: { valor: number; motivo: string }[] = [];

  // Calcular el producto con el reactivo que SOBRA: el error más común del tema.
  if (!catalizador && c.molesB !== null && c.limitante !== 'ambos') {
    const ratioMayor = Math.max(c.molesA / r.reactivos[0].coeficiente, c.molesB / r.reactivos[1].coeficiente);
    const teoricaMal = ratioMayor * producto.coeficiente * producto.masaMolar;
    const motivoLim = 'Has calculado con el reactivo en exceso. El producto lo decide el limitante: compara n ÷ coeficiente de los dos reactivos.';
    if (d.pregunta === 'masa-teorica') errores.push({ valor: teoricaMal, motivo: motivoLim });
    if (d.pregunta === 'masa-real') errores.push({ valor: teoricaMal * ((d.rendimiento ?? 100) / 100), motivo: motivoLim });
    if (d.pregunta === 'rendimiento' && d.masaObtenida) errores.push({ valor: (d.masaObtenida / teoricaMal) * 100, motivo: motivoLim });
  }
  if (d.pregunta === 'masa-real' && (d.rendimiento ?? 100) < 100) {
    errores.push({ valor: c.masaProductoTeorica, motivo: 'Esa es la masa teórica: falta aplicar el rendimiento (multiplica por η ÷ 100).' });
  }
  if (d.pregunta === 'rendimiento' && d.masaObtenida) {
    errores.push({
      valor: d.masaObtenida / c.masaProductoTeorica,
      motivo: 'Has escrito el rendimiento en tanto por uno: se pide en %, multiplica por 100.',
    });
  }
  if (d.pregunta === 'exceso' && c.exceso) {
    errores.push({ valor: c.exceso.moles, motivo: 'Eso son los moles que sobran: se piden gramos (multiplica por la masa molar).' });
  }
  if (d.pregunta === 'moles') {
    const s = r.reactivos[d.reactivo === 'B' ? 1 : 0];
    const gramos = d.reactivo === 'B' ? d.gramosB : d.gramosA;
    errores.push({ valor: gramos * s.masaMolar, motivo: 'Has multiplicado la masa por la masa molar: los moles son m ÷ M.' });
  }
  return errores;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde con
 * un veredicto, no con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(usuario: number, esperado: number, d: DatosCaso): Veredicto {
  const ventana = ventanaDe(d);
  const centro = Number.isFinite(ventana.centro) ? ventana.centro : esperado;
  const tolerancia = Number.isFinite(ventana.centro) ? ventana.tolerancia : toleranciaRelativa(esperado);
  const c = corregirNumero(usuario, centro, { tolerancia, magnitud: magnitudDe(d.pregunta) });
  // La desviación que se enseña es frente a la respuesta de la clave, no frente al centro.
  const diferencia = Math.abs(usuario - esperado);

  if (c.estado === 'no-numerico') {
    return { correcto: false, motivo: 'Escribe un número (puedes usar la coma decimal, por ejemplo 21,95).', diferencia: NaN, tolerancia };
  }
  if (c.motivoImposible) return { correcto: false, motivo: c.motivoImposible, diferencia, tolerancia };
  if (c.estado === 'acierto') return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  if (usuario <= 0) {
    return { correcto: false, motivo: 'No es correcto: una masa, unos moles o un rendimiento no pueden ser cero ni negativos.', diferencia, tolerancia };
  }

  for (const e of erroresTipicos(d)) {
    if (!dentroDeTolerancia(e.valor, centro, tolerancia) && dentroDeTolerancia(usuario, e.valor, toleranciaRelativa(e.valor))) {
      return { correcto: false, motivo: e.motivo, diferencia, tolerancia };
    }
  }

  // textoDesviacion y no `cifra`: la ventana ya no tiene suelo de 0,01, y en unos moles pequeños
  // la desviación con tres decimales podía escribirse «0» (hallazgo 3369).
  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${textoDesviacion(diferencia, decimalesDe(d.pregunta), formatNumber)} ${unidadDe(d.pregunta)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/* ─────────────────────────── Las masas de libro ─────────────────────────── */

/**
 * Las masas molares con los pesos atómicos redondeados de los libros de secundaria (H = 1,
 * C = 12, N = 14, O = 16, Na = 23, Cl = 35,5, Fe = 56). NO se usan para corregir: solo para
 * que el generador aleatorio descarte los ejercicios en los que el alumno que las usa daría
 * otra respuesta.
 */
const MASA_DE_LIBRO: Record<string, number> = {
  'CH₄': 16, 'O₂': 32, 'CO₂': 44, 'H₂O': 18, 'H₂': 2, HCl: 36.5, NaOH: 40, NaCl: 58.5,
  'N₂': 28, 'NH₃': 17, Fe: 56, 'Fe₂O₃': 160, 'C₆H₁₂O₆': 180, 'C₂H₅OH': 46,
};

/** La misma reacción con las masas de libro, para recalcular con el MISMO motor. */
function conMasasDeLibro(r: Reaccion): Reaccion {
  const cambiar = <T extends { formula: string; masaMolar: number }>(s: T): T => ({ ...s, masaMolar: MASA_DE_LIBRO[s.formula] ?? s.masaMolar });
  return { ...r, reactivos: [cambiar(r.reactivos[0]), cambiar(r.reactivos[1])], productos: r.productos.map(cambiar) };
}

/**
 * ¿Da lo mismo con las masas de libro? Lo mismo = el mismo limitante y una respuesta a no más
 * de `margen` veces el 1 % de la IUPAC (0,6: un 0,6 %). El corrector acepta las dos respuestas
 * sea cual sea su distancia (`ventanaDe`); este filtro es el que impide que la ventana se abra
 * más de la cuenta en un ejercicio aleatorio.
 */
export function coincideConLibro(d: DatosCaso, margen = 0.6): boolean {
  const r = reaccionPorId(d.reaccionId);
  if (!r) return false;
  const iupac = resolverCaso(d);
  const libro = resolverConReaccion(conMasasDeLibro(r), d);
  if (!iupac.ok || !Number.isFinite(libro)) return false;
  const catalizador = esReaccionConCatalizador(r);
  const limI = calcular(r, d.gramosA, catalizador ? 0 : d.gramosB, 100).limitante;
  const limL = calcular(conMasasDeLibro(r), d.gramosA, catalizador ? 0 : d.gramosB, 100).limitante;
  return limI === limL && Math.abs(libro - iupac.valor) <= margen * toleranciaRelativa(iupac.valor);
}

/** Solo el número de la respuesta, con una reacción dada (la de libro). */
function resolverConReaccion(r: Reaccion, d: DatosCaso): number {
  const catalizador = esReaccionConCatalizador(r);
  const c = calcular(r, d.gramosA, catalizador ? 0 : d.gramosB || 1, d.rendimiento ?? 100);
  switch (d.pregunta) {
    case 'moles':
      return d.reactivo === 'B' ? (c.molesB ?? NaN) : c.molesA;
    case 'masa-necesaria':
      return molesNecesarios(r, c.molesA, c.molesB ?? 0).necesariosB * r.reactivos[1].masaMolar;
    case 'masa-teorica':
      return c.masaProductoTeorica;
    case 'masa-real':
      return c.masaProductoReal;
    case 'rendimiento':
      return ((d.masaObtenida ?? NaN) / c.masaProductoTeorica) * 100;
    case 'exceso':
      return c.exceso ? c.exceso.gramos : NaN;
  }
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

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países, gentilicios ni monedas: el público de este canal es sobre todo
 * latinoamericano, y un enunciado anclado a un lugar excluye a la mayor parte.
 *
 * ⚠️ Ningún TÍTULO repite el nombre de un botón de la app («Combustión del metano», «Aumentar
 * gramos…»): el título entra en el nombre accesible del botón de cada caso, y el acta del
 * Inspector localiza los botones de reacción por nombre.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'unidad' | 'etiquetaRespuesta' | 'requiereRedondeo'>> = [
  {
    id: 1,
    titulo: 'De gramos a moles',
    enunciado: '¿Cuántos moles de metano (CH₄) hay en 40 g de metano? Usa la masa molar que indica el simulador.',
    categoria: 'abstracto',
    datos: { pregunta: 'moles', reaccionId: 'combustion-metano', gramosA: 40, gramosB: 64 },
    pista: 'n = m ÷ M. La masa molar del CH₄ es la del carbono más cuatro veces la del hidrógeno.',
  },
  {
    id: 2,
    titulo: 'Oxígeno para quemarlo todo',
    enunciado: 'En la reacción CH₄ + 2 O₂ → CO₂ + 2 H₂O, ¿cuántos gramos de oxígeno (O₂) hacen falta para quemar por completo 32 g de metano (CH₄)?',
    categoria: 'abstracto',
    datos: { pregunta: 'masa-necesaria', reaccionId: 'combustion-metano', gramosA: 32, gramosB: 64 },
    pista: 'Pasa el metano a moles; la ecuación dice que cada mol de CH₄ necesita 2 mol de O₂. Luego pasa esos moles a gramos.',
  },
  {
    id: 3,
    titulo: 'CO₂ con el metano limitante',
    enunciado: 'Se mezclan 8 g de metano (CH₄) con 40 g de oxígeno (O₂) y arden según CH₄ + 2 O₂ → CO₂ + 2 H₂O. ¿Qué masa de dióxido de carbono (CO₂) se forma como máximo?',
    categoria: 'abstracto',
    datos: { pregunta: 'masa-teorica', reaccionId: 'combustion-metano', gramosA: 8, gramosB: 40 },
    pista: 'Primero el limitante: divide los moles de cada reactivo entre su coeficiente. El CO₂ se calcula SOLO con el limitante.',
  },
  {
    id: 4,
    titulo: 'Más masa no es más moles',
    enunciado: 'Se queman 20 g de metano (CH₄) con 48 g de oxígeno (O₂). Hay más oxígeno que metano en gramos, pero ¿qué masa de CO₂ se obtiene como máximo?',
    categoria: 'abstracto',
    datos: { pregunta: 'masa-teorica', reaccionId: 'combustion-metano', gramosA: 20, gramosB: 48 },
    pista: 'Compara en moles y dividiendo entre el coeficiente: el O₂ lleva un 2 delante en la ecuación.',
  },
  {
    id: 5,
    titulo: 'Agua en una pila de combustible',
    enunciado: 'Una pila de combustible recibe 6 g de hidrógeno (H₂) y 40 g de oxígeno (O₂), que reaccionan según 2 H₂ + O₂ → 2 H₂O. ¿Qué masa de agua puede producir como máximo?',
    categoria: 'aplicado',
    datos: { pregunta: 'masa-teorica', reaccionId: 'sintesis-agua', gramosA: 6, gramosB: 40 },
    pista: 'El hidrógeno pesa muy poco por mol: 6 g son casi 3 mol. Haz la razón n ÷ coeficiente de los dos.',
  },
  {
    id: 6,
    titulo: 'Amoniaco para fertilizante',
    enunciado: 'Un reactor de síntesis de amoniaco recibe 70 g de nitrógeno (N₂) y 30 g de hidrógeno (H₂): N₂ + 3 H₂ → 2 NH₃. ¿Qué masa de amoniaco (NH₃) se formaría si reaccionara todo el limitante?',
    categoria: 'aplicado',
    datos: { pregunta: 'masa-teorica', reaccionId: 'haber-bosch', gramosA: 70, gramosB: 30 },
    pista: 'Por cada mol de N₂ se forman 2 mol de NH₃. ¿Llega el hidrógeno para gastar todo el nitrógeno?',
  },
  {
    id: 7,
    titulo: 'Ácido que sobra',
    enunciado: 'Se mezclan 73 g de ácido clorhídrico (HCl) con 60 g de hidróxido de sodio (NaOH): HCl + NaOH → NaCl + H₂O. ¿Cuántos gramos del reactivo en exceso quedan sin reaccionar?',
    categoria: 'abstracto',
    datos: { pregunta: 'exceso', reaccionId: 'neutralizacion', gramosA: 73, gramosB: 60 },
    pista: 'Los coeficientes son 1 y 1: el limitante es el que tiene menos moles. Lo que sobra es lo disponible menos lo que gasta el limitante.',
  },
  {
    id: 8,
    titulo: 'Gas que queda en el quemador',
    enunciado: 'En un quemador mal regulado entran 24 g de metano (CH₄) y solo 64 g de oxígeno (O₂). ¿Cuántos gramos del reactivo en exceso salen sin quemar?',
    categoria: 'aplicado',
    datos: { pregunta: 'exceso', reaccionId: 'combustion-metano', gramosA: 24, gramosB: 64 },
    pista: 'Con poco oxígeno, el limitante es el O₂. Cada 2 mol de O₂ gastan 1 mol de CH₄.',
  },
  {
    id: 9,
    titulo: 'Hierro que no llega a oxidarse',
    enunciado: 'Una pieza de 280 g de hierro (Fe) se oxida en un recipiente cerrado que solo contiene 48 g de oxígeno (O₂): 4 Fe + 3 O₂ → 2 Fe₂O₃. ¿Cuántos gramos de hierro quedan sin oxidar cuando se acaba el oxígeno?',
    categoria: 'aplicado',
    datos: { pregunta: 'exceso', reaccionId: 'oxidacion-hierro', gramosA: 280, gramosB: 48 },
    pista: 'Por cada 3 mol de O₂ se gastan 4 mol de Fe. Calcula cuánto Fe gasta el oxígeno disponible.',
  },
  {
    id: 10,
    titulo: 'Etanol de un mosto',
    enunciado: 'Un mosto con 90 g de glucosa (C₆H₁₂O₆) fermenta según C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂ con un rendimiento del 85 %. ¿Qué masa de etanol (C₂H₅OH) se obtiene?',
    categoria: 'aplicado',
    datos: { pregunta: 'masa-real', reaccionId: 'fermentacion', gramosA: 90, gramosB: 0, rendimiento: 85 },
    pista: 'Calcula la masa teórica de etanol (1 mol de glucosa da 2 mol de etanol) y multiplícala por 0,85.',
  },
  {
    id: 11,
    titulo: 'Una pasada por el reactor',
    enunciado: 'En la síntesis industrial de amoniaco, en cada pasada por el reactor solo se transforma el 15 % de lo posible. Si entran 28 g de nitrógeno (N₂) y 12 g de hidrógeno (H₂), ¿qué masa de amoniaco (NH₃) sale en una pasada?',
    categoria: 'aplicado',
    datos: { pregunta: 'masa-real', reaccionId: 'haber-bosch', gramosA: 28, gramosB: 12, rendimiento: 15 },
    pista: 'El 15 % es el rendimiento: primero la masa teórica con el limitante, luego × 15 ÷ 100.',
  },
  {
    id: 12,
    titulo: 'Rendimiento de una práctica',
    enunciado: 'En una práctica se neutralizan 40 g de ácido clorhídrico (HCl) con 60 g de hidróxido de sodio (NaOH). Al evaporar el agua se recogen 52 g de cloruro de sodio (NaCl). ¿Cuál ha sido el rendimiento de la reacción?',
    categoria: 'aplicado',
    datos: { pregunta: 'rendimiento', reaccionId: 'neutralizacion', gramosA: 40, gramosB: 60, masaObtenida: 52 },
    pista: 'Rendimiento = masa obtenida ÷ masa teórica × 100. La teórica sale del limitante.',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
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

/** Gramos enteros razonables para cada reactivo, por reacción: [A, B]. */
const GRAMOS: Record<string, [readonly number[], readonly number[]]> = {
  'combustion-metano': [[8, 10, 12, 16, 20, 24, 32, 40], [16, 24, 32, 40, 48, 64, 80, 96, 120]],
  'sintesis-agua': [[2, 4, 6, 8, 10, 12], [16, 24, 32, 40, 48, 64, 80]],
  neutralizacion: [[20, 30, 36, 40, 50, 60, 73, 80], [20, 30, 40, 50, 60, 70, 80]],
  'haber-bosch': [[14, 28, 42, 56, 70, 84], [3, 4, 6, 9, 12, 15, 18, 24, 30]],
  'oxidacion-hierro': [[56, 84, 112, 168, 224, 280], [16, 24, 32, 48, 64, 80, 96]],
  fermentacion: [[36, 45, 60, 90, 120, 180, 270, 360], [0]],
};

const RENDIMIENTOS = [55, 60, 65, 70, 75, 80, 85, 90, 95] as const;
/**
 * Para la pregunta de rendimiento, también los casi completos: la neutralización y la combustión
 * rondan el 99 % (tabla del bloque educativo), y una respuesta pegada a 100 es la que pone a prueba
 * que el corrector rechace un «100,5 %» (hallazgo 1207; tests/corrector-aula-motor.spec.ts). La
 * masa obtenida va con un decimal, como la da una balanza de laboratorio: en gramos enteros, un
 * 99 % de 20 g se quedaba en un 95 %.
 */
const RENDIMIENTOS_CASI_COMPLETOS = [99.4, 99.6, 99.8] as const;
const PREGUNTAS: readonly Pregunta[] = ['moles', 'masa-necesaria', 'masa-teorica', 'exceso', 'masa-real', 'rendimiento'];

/** «8 g de metano (CH₄)» */
function porcion(gramos: number, s: { nombre: string; formula: string }): string {
  return `${cifra(gramos)} g de ${minuscula(s.nombre)} (${s.formula})`;
}

function intentar(rnd: () => number): { datos: DatosCaso; enunciado: string } | null {
  const pregunta = elegir(rnd, PREGUNTAS);
  const reaccionId = elegir(rnd, Object.keys(GRAMOS));
  const r = reaccionPorId(reaccionId);
  if (!r) return null;
  const catalizador = esReaccionConCatalizador(r);
  if (catalizador && (pregunta === 'exceso' || pregunta === 'masa-necesaria')) return null;
  const [listaA, listaB] = GRAMOS[reaccionId];
  const datos: DatosCaso = { pregunta, reaccionId, gramosA: elegir(rnd, listaA), gramosB: elegir(rnd, listaB) };
  const [rA, rB] = r.reactivos;
  const producto = r.productos[0];

  // Lejos de la mezcla estequiométrica: el limitante no se decide por un decimal.
  if (!catalizador && pregunta !== 'moles' && pregunta !== 'masa-necesaria') {
    const c = calcular(r, datos.gramosA, datos.gramosB, 100);
    const ra = c.molesA / rA.coeficiente;
    const rb = (c.molesB ?? 0) / rB.coeficiente;
    if (Math.abs(ra - rb) / Math.max(ra, rb) < 0.2) return null;
  }

  const mezcla = catalizador ? porcion(datos.gramosA, rA) : `${porcion(datos.gramosA, rA)} y ${porcion(datos.gramosB, rB)}`;
  let enunciado = '';
  switch (pregunta) {
    case 'moles': {
      const usarB = !catalizador && rnd() < 0.5;
      if (usarB) datos.reactivo = 'B';
      const s = usarB ? rB : rA;
      enunciado = `¿Cuántos moles hay en ${porcion(usarB ? datos.gramosB : datos.gramosA, s)}?`;
      break;
    }
    case 'masa-necesaria':
      enunciado = `En la reacción ${r.ecuacion}, ¿cuántos gramos de ${minuscula(rB.nombre)} (${rB.formula}) hacen falta para que reaccionen por completo ${porcion(datos.gramosA, rA)}?`;
      break;
    case 'masa-teorica':
      enunciado = `Reaccionan ${mezcla} según ${r.ecuacion}. ¿Qué masa de ${minuscula(producto.nombre)} (${producto.formula}) se forma como máximo?`;
      break;
    case 'exceso':
      enunciado = `Reaccionan ${mezcla} según ${r.ecuacion}. ¿Cuántos gramos del reactivo en exceso quedan sin reaccionar?`;
      break;
    case 'masa-real':
      datos.rendimiento = elegir(rnd, RENDIMIENTOS);
      enunciado = `Reaccionan ${mezcla} según ${r.ecuacion}, con un rendimiento del ${datos.rendimiento} %. ¿Qué masa de ${minuscula(producto.nombre)} (${producto.formula}) se obtiene?`;
      break;
    case 'rendimiento': {
      const c = calcular(r, datos.gramosA, catalizador ? 0 : datos.gramosB, 100);
      const eta = rnd() < 0.35 ? elegir(rnd, RENDIMIENTOS_CASI_COMPLETOS) : elegir(rnd, RENDIMIENTOS);
      datos.masaObtenida = Math.round(c.masaProductoTeorica * eta * 10 / 100) / 10;
      if (!positivo(datos.masaObtenida)) return null;
      enunciado = `Reaccionan ${mezcla} según ${r.ecuacion} y se recogen ${cifra(datos.masaObtenida)} g de ${minuscula(producto.nombre)} (${producto.formula}). ¿Cuál ha sido el rendimiento?`;
      break;
    }
  }

  const res = resolverCaso(datos);
  if (!res.ok || res.valor <= 0) return null;
  if (pregunta === 'exceso' && res.valor < 1) return null;
  if (!coincideConLibro(datos)) return null;
  return { datos, enunciado };
}

/** Si en 200 intentos no sale nada válido (no pasa con estas listas), el caso 3. */
const RESERVA: { datos: DatosCaso; enunciado: string } = {
  datos: { pregunta: 'masa-teorica', reaccionId: 'combustion-metano', gramosA: 8, gramosB: 40 },
  enunciado: 'Reaccionan 8 g de metano (CH₄) y 40 g de oxígeno (O₂) según CH₄ + 2 O₂ → CO₂ + 2 H₂O. ¿Qué masa de dióxido de carbono (CO₂) se forma como máximo?',
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
