/**
 * Casos para clase — la tarea asignable de `simulador-titulacion`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la química está
 * bien: una curva con forma de S plausible pasa cualquier compilación
 * ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA QUÍMICA NO SE REPLICA AQUÍ ─────────────────────────────────────────────
 *
 * Todo pH sale de `calcularPH` y todo volumen de equivalencia de `volumenEquivalencia`, las
 * dos de `./motor.ts`, el MISMO módulo con que el simulador pinta su panel «Estado actual» y
 * su curva. Si la corrección y el panel calculasen cada uno a su manera, la app podría
 * suspender un pH que ella misma acaba de mostrar. Los pasos de la solución sí hacen cuentas
 * propias —son la explicación para el alumno—, pero la RESPUESTA es siempre la del motor.
 *
 * ── EL CONVENIO DE ESTA APP (fijado por escrito) ──────────────────────────────
 *
 * · Siempre se titula un ÁCIDO (analito, en el matraz) con una BASE (titulante, en la
 *   bureta). V_eq = C_a·V_a/C_t. Volúmenes en mL y concentraciones en mol/L, así que
 *   C·V sale en milimoles.
 * · Ácido fuerte + base fuerte: la equivalencia es pH 7 exacto.
 * · Ácido débil + base fuerte: en la zona tampón el motor NO usa Henderson-Hasselbalch sino
 *   la cuadrática exacta del equilibrio (`phZonaTampon`). Los datos de los casos se eligieron
 *   donde las dos coinciden a dos decimales —la semiequivalencia, o relaciones A⁻/HA entre
 *   1:3 y 3:1 con C ≥ 0,05 M y pKa ≥ 4—, para que el alumno que use la H-H de su libro no
 *   suspenda. Por el mismo motivo, el pH inicial ½(pKa − log C) y la cuadrática coinciden a
 *   dos decimales en el caso 7. Equivalencia: 7 + ½(pKa + log C_sal).
 * · Ácido fuerte + base débil: antes de la equivalencia manda el ácido fuerte sobrante; en la
 *   equivalencia, 7 − ½(pKb + log C_sal); después, tampón inverso con H-H sobre el pOH.
 * · Ácido débil + base débil no entra en los doce casos: su equivalencia ½(pKa + 14 − pKb) es
 *   una aproximación que el propio motor rotula así. `resolverCaso` la resuelve igual, por si
 *   un caso futuro la pide.
 * · Todos los datos se pueden reproducir con los controles del simulador: V_analito entero
 *   entre 10 y 100 mL, concentraciones de 0,01 a 1 M en pasos de 0,01, pKa y pKb de 1 a 12
 *   en pasos de 0,1 (salvo el 4,76 del caso 7, que es el valor con el que ARRANCA el
 *   simulador y el que pone «Cargar en el simulador»), y volúmenes de titulante múltiplos de
 *   0,1 mL y como mucho 2·V_eq, que es el tope de la bureta.
 *
 * ── LA TOLERANCIA DEPENDE DE LA MAGNITUD ──────────────────────────────────────
 *
 * La regla general de la skill —el mayor entre 0,01 y el 1 % del valor— no vale para el pH:
 * es LOGARÍTMICO, así que el 1 % de 12,52 (0,125) aceptaría 12,40, que es un 24 % menos de
 * OH⁻, y en pH altos el margen crecería justo donde menos debe. Por eso:
 *   · pH → 0,02 absoluto. Absorbe el redondeo del alumno y la diferencia entre H-H y la
 *     cuadrática, que en los datos elegidos es < 0,005.
 *   · volumen → el mayor entre 0,01 mL y el 1 %.
 *   · concentración → el mayor entre 0,0005 mol/L y el 1 %.
 *
 * Nada lanza excepciones: un `throw` dentro de un render tumba la app entera; aquí los datos
 * imposibles devuelven `{ ok: false, error }` y un NaN.
 */

import { formatNumber } from '@/lib';
import { calcularPH, volumenEquivalencia, type TipoTitulacion } from './motor';

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

/** Qué se pide: el volumen de equivalencia, la concentración del analito o un pH. */
export type Pregunta = 'volumen-equivalencia' | 'concentracion-analito' | 'pH';

/** Magnitud de la respuesta: decide la unidad y la tolerancia. */
export type Magnitud = 'pH' | 'volumen' | 'concentracion';

export interface DatosCaso {
  pregunta: Pregunta;
  tipo: TipoTitulacion;
  /** Volumen de analito en el matraz, mL. */
  V_analito: number;
  /** Concentración del ácido, mol/L. Es la incógnita en `concentracion-analito`. */
  C_analito?: number;
  /** Concentración de la base de la bureta, mol/L. */
  C_titulante: number;
  /** pKa del ácido débil (obligatorio en ad-bf y ad-bd). */
  pKa?: number;
  /** pKb de la base débil (obligatorio en af-bd y ad-bd). */
  pKb?: number;
  /** Volumen de base añadido, mL. Obligatorio en `pH`. */
  V_titulante?: number;
  /** Volumen de equivalencia medido en el laboratorio, mL. Obligatorio en `concentracion-analito`. */
  V_eq_observado?: number;
  /** Decimales de la respuesta. Por defecto 2. */
  decimales?: number;
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Lo que «Cargar en el simulador» pone en los controles de la app. */
export interface ConfiguracionSimulador {
  tipo: TipoTitulacion;
  V_analito: number;
  C_analito: number;
  C_titulante: number;
  pKa?: number;
  pKb?: number;
}

/* ─────────────────────────── Formato ─────────────────────────── */

/**
 * La MISMA holgura con la que `calcularPH` decide que está «en» la equivalencia
 * (|V − V_eq| < 0,001 mL). Solo se usa para elegir qué explicación se escribe: el número lo
 * da siempre el motor.
 */
const HOLGURA_EQUIVALENCIA = 0.001;

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/**
 * Cifra en formato español con los decimales que de verdad tiene, hasta `maxDecimales`.
 * Pasa por `formatNumber`, que fija los decimales exactos; aquí solo se elige cuántos, para
 * que un paso intermedio no diga «0,1000».
 */
function cifra(n: number, maxDecimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  const v = Math.abs(n) < 1e-12 ? 0 : n;
  let d = 0;
  while (d < maxDecimales && Math.abs(redondear(v, d) - v) > 1e-9 * Math.max(1, Math.abs(v))) {
    d += 1;
  }
  return formatNumber(v, d).replace(/^-/, '−');
}

/** Un logaritmo con su signo tipográfico entre paréntesis si es negativo: «(−1)». */
function conSigno(n: number): string {
  return n < 0 ? `(${cifra(n)})` : cifra(n);
}

/**
 * La cifra que responde a la pregunta, dentro de un paso: con cuatro decimales si luego hay
 * que redondearla (y el paso final lo hace), y si no, con los dos que pide el enunciado. Así
 * ningún paso escribe «8,9» cuando la respuesta es «8,90».
 */
function resultado(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return exigeRedondeo(n, 2) ? cifra(n) : formatNumber(n, 2);
}

export function magnitudDe(pregunta: Pregunta): Magnitud {
  if (pregunta === 'volumen-equivalencia') return 'volumen';
  if (pregunta === 'concentracion-analito') return 'concentracion';
  return 'pH';
}

/** Unidad en que se pide y se da la respuesta. El pH no tiene. */
export function unidadDe(magnitud: Magnitud): string {
  if (magnitud === 'volumen') return 'mL';
  if (magnitud === 'concentracion') return 'mol/L';
  return '';
}

/**
 * Lo que se escribe en la casilla, con unidad. Se deriva de la magnitud y no se escribe a
 * mano, para que los doce casos y el modo práctica lo digan exactamente igual.
 */
export function etiquetaDe(magnitud: Magnitud): string {
  if (magnitud === 'volumen') return 'Volumen de base, en mL';
  if (magnitud === 'concentracion') return 'Concentración del ácido, en mol/L';
  return 'pH (sin unidad)';
}

/** El resultado con su unidad y los decimales pedidos: «30,00 mL», «0,08 mol/L», «8,90». */
export function textoRespuesta(valor: number, unidad: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const n = formatNumber(valor, decimales);
  return unidad ? `${n} ${unidad}` : n;
}

/** true si la cifra exacta tiene más decimales de los que se piden: el enunciado debe decirlo. */
export function exigeRedondeo(valor: number, decimales: number): boolean {
  if (!Number.isFinite(valor)) return false;
  return Math.abs(redondear(valor, decimales) - valor) > 1e-9 * Math.max(1, Math.abs(valor));
}

/* ─────────────────────────── Resolución ─────────────────────────── */

function positivo(n: number | undefined): n is number {
  return n !== undefined && Number.isFinite(n) && n > 0;
}

function pkValido(n: number | undefined): n is number {
  return n !== undefined && Number.isFinite(n) && n > 0 && n < 14;
}

const NOMBRE_TIPO: Record<TipoTitulacion, string> = {
  'af-bf': 'ácido fuerte con base fuerte',
  'ad-bf': 'ácido débil con base fuerte',
  'af-bd': 'ácido fuerte con base débil',
  'ad-bd': 'ácido débil con base débil',
};

/** El paso final muestra la cifra con LOS MISMOS decimales que `respuestaTexto`. */
function pasoFinal(valor: number, magnitud: Magnitud, decimales: number): string {
  const nombre = magnitud === 'pH' ? 'pH' : magnitud === 'volumen' ? 'V_eq' : 'C_ácido';
  const texto = textoRespuesta(redondear(valor, decimales), unidadDe(magnitud), decimales);
  return exigeRedondeo(valor, decimales)
    ? `Redondeando a ${decimales} decimales: ${nombre} = ${texto}.`
    : `Resultado: ${nombre} = ${texto}.`;
}

/** Concentración del ácido a partir del volumen de equivalencia observado: C_a = C_t·V_eq/V_a. */
function concentracionDesdeVeq(C_titulante: number, V_eq: number, V_analito: number): number {
  return (C_titulante * V_eq) / V_analito;
}

function resolverVolumen(d: DatosCaso, pasos: string[]): number {
  const Ca = d.C_analito as number;
  const nA = Ca * d.V_analito;
  const Veq = volumenEquivalencia(Ca, d.V_analito, d.C_titulante);
  pasos.push(
    `Moles de ácido en el matraz: n = C·V = ${cifra(Ca)} mol/L · ${cifra(d.V_analito)} mL = ${cifra(nA)} mmol (mol/L por mL da milimoles).`,
  );
  pasos.push(
    `En el punto de equivalencia se ha añadido la misma cantidad de base que de ácido: n(base) = ${cifra(nA)} mmol. Con la base a ${cifra(d.C_titulante)} mol/L, V_eq = n/C = ${cifra(nA)} / ${cifra(d.C_titulante)} = ${resultado(Veq)} mL.`,
  );
  if (d.tipo === 'ad-bf' || d.tipo === 'ad-bd') {
    pasos.push(
      'Aunque el ácido sea débil, la base lo neutraliza ENTERO: el volumen de equivalencia no depende del pKa, solo de los moles.',
    );
  }
  pasos.push(`En una línea: V_eq = C_a·V_a / C_t = ${cifra(Ca)} · ${cifra(d.V_analito)} / ${cifra(d.C_titulante)} = ${resultado(Veq)} mL.`);
  return Veq;
}

function resolverConcentracion(d: DatosCaso, pasos: string[]): number {
  const Veq = d.V_eq_observado as number;
  const nB = d.C_titulante * Veq;
  const Ca = concentracionDesdeVeq(d.C_titulante, Veq, d.V_analito);
  pasos.push(
    `Moles de base gastados hasta la equivalencia: n = C·V = ${cifra(d.C_titulante)} mol/L · ${cifra(Veq)} mL = ${cifra(nB)} mmol.`,
  );
  pasos.push(
    `En la equivalencia, n(ácido) = n(base) = ${cifra(nB)} mmol. Estaban en ${cifra(d.V_analito)} mL de muestra, así que C_ácido = ${cifra(nB)} / ${cifra(d.V_analito)} = ${resultado(Ca)} mol/L.`,
  );
  pasos.push(`En una línea: C_a = C_t·V_eq / V_a = ${cifra(d.C_titulante)} · ${cifra(Veq)} / ${cifra(d.V_analito)} = ${resultado(Ca)} mol/L.`);
  // Comprobación con el MISMO motor que el panel: con esa concentración, el V_eq del simulador.
  const vuelta = volumenEquivalencia(Ca, d.V_analito, d.C_titulante);
  pasos.push(
    `Comprobación con el simulador: con [Analito] = ${cifra(redondear(Ca, 2), 2)} M, ${cifra(d.V_analito)} mL y base ${cifra(d.C_titulante)} M, el panel marca V_eq = ${formatNumber(vuelta, 2)} mL.`,
  );
  return Ca;
}

/** Explica el pH con la fórmula de la zona en que cae el punto, y devuelve el del MOTOR. */
function resolverPH(d: DatosCaso, pasos: string[]): Resolucion {
  const Ca = d.C_analito as number;
  const Ct = d.C_titulante;
  const Va = d.V_analito;
  const V = d.V_titulante as number;
  const pKa = d.pKa ?? NaN;
  const pKb = d.pKb ?? NaN;
  const tipo = d.tipo;

  const valor = calcularPH(tipo, V, Va, Ca, Ct, pKa, pKb);
  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El pH no sale finito con estos datos.' };
  }

  const nA = Ca * Va;
  const nB = Ct * V;
  const Veq = volumenEquivalencia(Ca, Va, Ct);
  const Vtot = Va + V;
  const acidoDebil = tipo === 'ad-bf' || tipo === 'ad-bd';
  const baseDebil = tipo === 'af-bd' || tipo === 'ad-bd';

  pasos.push(
    `Es una titulación de ${NOMBRE_TIPO[tipo]}. Moles de ácido al principio: n = ${cifra(Ca)} mol/L · ${cifra(Va)} mL = ${cifra(nA)} mmol. V_eq = C_a·V_a / C_t = ${cifra(Ca)} · ${cifra(Va)} / ${cifra(Ct)} = ${resultado(Veq)} mL.`,
  );

  const enEquivalencia = Math.abs(V - Veq) < HOLGURA_EQUIVALENCIA;

  if (V <= 0) {
    if (acidoDebil) {
      const aprox = 0.5 * (pKa - Math.log10(Ca));
      pasos.push(
        `Todavía no se ha añadido base: en el matraz solo hay ácido DÉBIL, que se disocia poco. [H⁺] ≈ √(Ka·C), es decir, pH = ½(pKa − log C) = ½(${cifra(pKa)} − ${conSigno(Math.log10(Ca))}) = ${cifra(aprox)}.`,
      );
      pasos.push(
        `El simulador resuelve el equilibrio sin aproximar (una ecuación de segundo grado) y da ${resultado(valor)}: a dos decimales es lo mismo.`,
      );
    } else {
      pasos.push(
        `Todavía no se ha añadido base: el ácido FUERTE está disociado por completo, [H⁺] = ${cifra(Ca)} mol/L y pH = −log ${cifra(Ca)} = ${resultado(valor)}.`,
      );
    }
  } else if (enEquivalencia) {
    const Csal = nA / Vtot;
    pasos.push(
      `Se han añadido ${cifra(V)} mL, justo V_eq: es el punto de equivalencia. No sobra ni ácido ni base; en el matraz queda la sal, ${cifra(nA)} mmol en ${cifra(Va)} + ${cifra(V)} = ${cifra(Vtot)} mL, C_sal = ${cifra(Csal)} mol/L.`,
    );
    if (tipo === 'af-bf') {
      pasos.push('La sal de un ácido fuerte y una base fuerte (como el NaCl) no reacciona con el agua: el pH es neutro, 7.');
    } else if (tipo === 'ad-bf') {
      pasos.push(
        `La sal contiene la base conjugada del ácido débil (A⁻), que toma H⁺ del agua y libera OH⁻: el medio queda BÁSICO. pH = 7 + ½(pKa + log C_sal) = 7 + ½(${cifra(pKa)} + ${conSigno(Math.log10(Csal))}) = ${resultado(valor)}.`,
      );
      pasos.push('Por eso la equivalencia NO está en 7, y por eso se usa un indicador que vire en zona básica.');
    } else if (tipo === 'af-bd') {
      pasos.push(
        `La sal contiene el ácido conjugado de la base débil (BH⁺, como el NH₄⁺), que cede H⁺ al agua: el medio queda ÁCIDO. pH = 7 − ½(pKb + log C_sal) = 7 − ½(${cifra(pKb)} + ${conSigno(Math.log10(Csal))}) = ${resultado(valor)}.`,
      );
      pasos.push('Por eso la equivalencia NO está en 7, y por eso se usa un indicador que vire en zona ácida.');
    } else {
      pasos.push(
        `Los dos iones de la sal reaccionan con el agua y sus efectos se compensan en parte: pH ≈ ½(pKa + 14 − pKb) = ½(${cifra(pKa)} + 14 − ${cifra(pKb)}) = ${resultado(valor)}. No depende de la concentración.`,
      );
    }
  } else if (V < Veq) {
    if (acidoDebil) {
      const nHA = nA - nB;
      const hh = pKa + Math.log10(nB / nHA);
      const mitad = Math.abs(nB - nHA) < 1e-9;
      pasos.push(
        `Se han añadido ${cifra(nB)} mmol de base (${cifra(Ct)} · ${cifra(V)}), menos que el ácido: cada mol de base convierte un mol de ácido HA en su base conjugada A⁻. Quedan n(HA) = ${cifra(nA)} − ${cifra(nB)} = ${cifra(nHA)} mmol y n(A⁻) = ${cifra(nB)} mmol. Es una disolución amortiguadora (tampón).`,
      );
      if (mitad) {
        pasos.push(
          `Se ha neutralizado justo la MITAD del ácido (V = V_eq/2 = ${cifra(V)} mL): n(A⁻) = n(HA). En la ecuación de Henderson-Hasselbalch, pH = pKa + log(n(A⁻)/n(HA)) = pKa + log 1 = pKa = ${cifra(pKa)}.`,
        );
      } else {
        pasos.push(
          `Henderson-Hasselbalch: pH = pKa + log(n(A⁻)/n(HA)) = ${cifra(pKa)} + log(${cifra(nB)}/${cifra(nHA)}) = ${cifra(pKa)} + ${conSigno(Math.log10(nB / nHA))} = ${cifra(hh)}. El volumen total se cancela en el cociente.`,
        );
      }
      pasos.push(
        `El simulador resuelve el equilibrio sin aproximar y da ${resultado(valor)}: a dos decimales es lo mismo que Henderson-Hasselbalch.`,
      );
    } else {
      const nH = nA - nB;
      const cH = nH / Vtot;
      pasos.push(
        `Se han añadido ${cifra(nB)} mmol de base (${cifra(Ct)} · ${cifra(V)}), menos que el ácido: sobra ácido FUERTE. n(H⁺) = ${cifra(nA)} − ${cifra(nB)} = ${cifra(nH)} mmol en un volumen total de ${cifra(Va)} + ${cifra(V)} = ${cifra(Vtot)} mL.`,
      );
      pasos.push(`[H⁺] = ${cifra(nH)} / ${cifra(Vtot)} = ${cifra(cH, 5)} mol/L, y pH = −log[H⁺] = ${resultado(valor)}.`);
      if (baseDebil) {
        pasos.push('Mientras sobre ácido fuerte, que la base sea débil no cambia nada: el pH lo fija el H⁺ sobrante.');
      }
    }
  } else if (baseDebil) {
    const nBlibre = nB - nA;
    pasos.push(
      `Se han añadido ${cifra(nB)} mmol de base (${cifra(Ct)} · ${cifra(V)}), más que el ácido: todo el ácido es ya BH⁺ (${cifra(nA)} mmol) y sobran n(B) = ${cifra(nB)} − ${cifra(nA)} = ${cifra(nBlibre)} mmol de base débil. Es un tampón de la base.`,
    );
    const pOH = pKb + Math.log10(nA / nBlibre);
    pasos.push(
      `Henderson-Hasselbalch escrita para el pOH: pOH = pKb + log(n(BH⁺)/n(B)) = ${cifra(pKb)} + log(${cifra(nA)}/${cifra(nBlibre)}) = ${cifra(pOH)}.`,
    );
    pasos.push(`pH = 14 − pOH = 14 − ${cifra(pOH)} = ${resultado(valor)}.`);
  } else {
    const nOH = nB - nA;
    const cOH = nOH / Vtot;
    const pOH = -Math.log10(cOH);
    pasos.push(
      `Se han añadido ${cifra(nB)} mmol de base (${cifra(Ct)} · ${cifra(V)}), más que el ácido: sobra base FUERTE. n(OH⁻) = ${cifra(nB)} − ${cifra(nA)} = ${cifra(nOH)} mmol en ${cifra(Va)} + ${cifra(V)} = ${cifra(Vtot)} mL.`,
    );
    pasos.push(`[OH⁻] = ${cifra(nOH)} / ${cifra(Vtot)} = ${cifra(cOH, 5)} mol/L, pOH = −log[OH⁻] = ${cifra(pOH)}, y pH = 14 − pOH = ${resultado(valor)}.`);
    if (acidoDebil) {
      pasos.push('La base conjugada del ácido débil también aporta algo de OH⁻, pero frente a la base fuerte sobrante es despreciable.');
    }
  }

  return { ok: true, valor, pasos };
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: los datos imposibles devuelven `{ ok: false, error }`.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];
  const magnitud = magnitudDe(datos.pregunta);

  if (!positivo(datos.V_analito) || !positivo(datos.C_titulante)) {
    return { ok: false, valor: NaN, pasos, error: 'Faltan el volumen de ácido o la concentración de la base, y deben ser positivos.' };
  }

  let r: Resolucion;
  if (datos.pregunta === 'concentracion-analito') {
    if (!positivo(datos.V_eq_observado)) {
      return { ok: false, valor: NaN, pasos, error: 'Falta el volumen de equivalencia observado.' };
    }
    r = { ok: true, valor: resolverConcentracion(datos, pasos), pasos };
  } else {
    if (!positivo(datos.C_analito)) {
      return { ok: false, valor: NaN, pasos, error: 'Falta la concentración del ácido, y debe ser positiva.' };
    }
    if (datos.pregunta === 'volumen-equivalencia') {
      r = { ok: true, valor: resolverVolumen(datos, pasos), pasos };
    } else {
      const V = datos.V_titulante;
      if (V === undefined || !Number.isFinite(V) || V < 0) {
        return { ok: false, valor: NaN, pasos, error: 'Falta el volumen de base añadido, y no puede ser negativo.' };
      }
      if ((datos.tipo === 'ad-bf' || datos.tipo === 'ad-bd') && !pkValido(datos.pKa)) {
        return { ok: false, valor: NaN, pasos, error: 'Con un ácido débil hace falta su pKa.' };
      }
      if ((datos.tipo === 'af-bd' || datos.tipo === 'ad-bd') && !pkValido(datos.pKb)) {
        return { ok: false, valor: NaN, pasos, error: 'Con una base débil hace falta su pKb.' };
      }
      r = resolverPH(datos, pasos);
    }
  }

  if (!r.ok) return r;
  if (!Number.isFinite(r.valor)) {
    return { ok: false, valor: NaN, pasos, error: 'El resultado no es un número finito.' };
  }
  pasos.push(pasoFinal(r.valor, magnitud, decimales));
  return { ok: true, valor: r.valor, pasos };
}

/**
 * Lo que «Cargar en el simulador» pone en la app. `null` cuando cargarlo daría la respuesta:
 * en `concentracion-analito` la concentración ES la incógnita.
 */
export function configuracionDe(datos: DatosCaso): ConfiguracionSimulador | null {
  if (datos.pregunta === 'concentracion-analito' || datos.C_analito === undefined) return null;
  return {
    tipo: datos.tipo,
    V_analito: datos.V_analito,
    C_analito: datos.C_analito,
    C_titulante: datos.C_titulante,
    pKa: datos.pKa,
    pKb: datos.pKb,
  };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/**
 * Tolerancia según la magnitud (el porqué, en la cabecera):
 * pH → 0,02 absoluto · volumen → máx(0,01; 1 %) · concentración → máx(0,0005; 1 %).
 */
export function toleranciaDe(valor: number, magnitud: Magnitud): number {
  if (magnitud === 'pH') return 0.02;
  if (magnitud === 'volumen') return Math.max(0.01, Math.abs(valor) * 0.01);
  return Math.max(0.0005, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Margen de 1e-9 sobre la tolerancia: en el borde exacto la resta en binario decide por
 * ±1 ulp, y la misma desviación se aceptaría por arriba y se rechazaría por abajo (hallazgo
 * 1211 de `simulador-movimiento-circular`).
 */
const RUIDO_BINARIO = 1e-9;

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde con
 * un veredicto, no con una excepción que tumbaría el render.
 */
export function comprobarRespuesta(usuario: number, esperado: number, magnitud: Magnitud): Veredicto {
  const tolerancia = toleranciaDe(esperado, magnitud);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal, por ejemplo 8,73).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  // Los dos errores típicos del tema se dicen, no se esconden.
  if (magnitud === 'pH' && Math.abs(usuario - 7) < 1e-9 && Math.abs(esperado - 7) > 0.02) {
    return {
      correcto: false,
      motivo: 'No es correcto. El pH 7 solo corresponde a la equivalencia de un ácido fuerte con una base fuerte: aquí hay que calcularlo.',
      diferencia,
      tolerancia,
    };
  }
  if (magnitud === 'volumen' && esperado > 0 && Math.abs(usuario * 1000 - esperado) <= tolerancia + RUIDO_BINARIO) {
    return {
      correcto: false,
      motivo: 'El valor es correcto, pero en litros: se pide en mililitros (multiplica por 1000).',
      diferencia,
      tolerancia,
    };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${cifra(diferencia, magnitud === 'concentracion' ? 4 : 2)} de la respuesta.`,
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
  magnitud: Magnitud;
  etiquetaRespuesta: string;
  /** Unidad de la respuesta, sola: «mL», «mol/L» o vacía para el pH. */
  unidad: string;
  /** Calculada por el motor desde `datos` y redondeada a los decimales pedidos. */
  respuesta: number;
  respuestaTexto: string;
  /** true si la cifra exacta tiene más decimales de los pedidos: el enunciado lo dice. */
  requiereRedondeo: boolean;
  pasos: string[];
  pista: string;
}

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países, gentilicios ni monedas: el público de este canal es sobre todo
 * latinoamericano, y un enunciado anclado a un lugar excluye a la mayor parte.
 *
 * ⚠️ Ningún TÍTULO lleva las palabras de los botones de la app («Ir a equivalencia»,
 * «Reiniciar», «Ácido débil + Base fuerte», «Fenolftaleína», «Naranja de metilo»…): el título
 * entra en el nombre accesible del botón de cada caso, y el acta del Inspector localiza esos
 * botones por nombre parcial.
 */
const DEFINICIONES: ReadonlyArray<
  Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos' | 'unidad' | 'etiquetaRespuesta' | 'requiereRedondeo' | 'magnitud'>
> = [
  {
    id: 1,
    titulo: 'Cuánta base hace falta',
    enunciado:
      'Se titulan 20 mL de ácido clorhídrico (HCl) 0,15 M con hidróxido de sodio (NaOH) 0,10 M. ¿Qué volumen de NaOH hace falta para llegar al punto de equivalencia? Da el resultado en mL.',
    categoria: 'abstracto',
    datos: { pregunta: 'volumen-equivalencia', tipo: 'af-bf', V_analito: 20, C_analito: 0.15, C_titulante: 0.1 },
    pista: 'En la equivalencia, moles de base = moles de ácido. Calcula los moles de ácido con n = C·V y luego qué volumen de base los contiene.',
  },
  {
    id: 2,
    titulo: 'El gasto de base de un vinagre',
    enunciado:
      'En una práctica de laboratorio se ponen 10 mL de vinagre (ácido acético, CH₃COOH, 0,80 M) en un matraz y se titulan con NaOH 0,50 M desde la bureta. ¿Cuántos mL de NaOH se gastarán hasta el punto de equivalencia? Da el resultado en mL. Al cargar el caso en el simulador, el panel «Estado actual» muestra el V_eq.',
    categoria: 'aplicado',
    datos: { pregunta: 'volumen-equivalencia', tipo: 'ad-bf', V_analito: 10, C_analito: 0.8, C_titulante: 0.5, pKa: 4.76 },
    pista: 'Que el ácido acético sea débil no cambia el volumen: la base lo neutraliza entero. Solo importan los moles.',
  },
  {
    id: 3,
    titulo: 'La concentración de un limpiador ácido',
    enunciado:
      'Para saber cuánto ácido lleva una muestra diluida de un limpiador de baños (el ácido es HCl), se toman 25 mL y se titulan con NaOH 0,10 M. El punto de equivalencia llega cuando se han añadido 20,00 mL. ¿Cuál es la concentración de HCl en la muestra? Da el resultado en mol/L con dos decimales. Para comprobarlo, elige ácido fuerte con base fuerte, pon 25 mL, base 0,10 M y tu resultado en el deslizador [Analito]: el panel debe marcar V_eq = 20,00 mL.',
    categoria: 'aplicado',
    datos: { pregunta: 'concentracion-analito', tipo: 'af-bf', V_analito: 25, C_titulante: 0.1, V_eq_observado: 20 },
    pista: 'Primero los moles de NaOH gastados (C·V). En la equivalencia son los mismos que los de HCl, y estaban repartidos en los 25 mL de muestra.',
  },
  {
    id: 4,
    titulo: 'La acidez de un vinagre',
    enunciado:
      'Se toman 10 mL de un vinagre y se titulan con NaOH 0,20 M. El indicador cambia de color, justo en el punto de equivalencia, cuando se han añadido 42,50 mL. ¿Cuál es la concentración de ácido acético del vinagre? Da el resultado en mol/L con dos decimales. Para comprobarlo, elige ácido débil con base fuerte, pon 10 mL, base 0,20 M y tu resultado en el deslizador [Analito]: el panel debe marcar V_eq = 42,50 mL.',
    categoria: 'aplicado',
    datos: { pregunta: 'concentracion-analito', tipo: 'ad-bf', V_analito: 10, C_titulante: 0.2, V_eq_observado: 42.5, pKa: 4.76 },
    pista: 'C_ácido·V_ácido = C_base·V_eq. El ácido es débil, pero se neutraliza entero: la cuenta es la misma que con un ácido fuerte.',
  },
  {
    id: 5,
    titulo: 'Antes de la equivalencia: sobra ácido',
    enunciado:
      'Se titulan 25 mL de HCl 0,10 M con NaOH 0,10 M. ¿Cuál es el pH después de añadir 15 mL de NaOH? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { pregunta: 'pH', tipo: 'af-bf', V_analito: 25, C_analito: 0.1, C_titulante: 0.1, V_titulante: 15 },
    pista: 'Resta los moles de base a los de ácido: lo que sobra es H⁺. No olvides que ahora está disuelto en 25 + 15 mL.',
  },
  {
    id: 6,
    titulo: 'Pasada la equivalencia: sobra base',
    enunciado:
      'Se titulan 10 mL de HCl 0,10 M con NaOH 0,10 M. ¿Cuál es el pH después de añadir 15 mL de NaOH, es decir, 5 mL más de los necesarios? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { pregunta: 'pH', tipo: 'af-bf', V_analito: 10, C_analito: 0.1, C_titulante: 0.1, V_titulante: 15 },
    pista: 'Ahora lo que sobra es OH⁻. Calcula [OH⁻] en el volumen total, luego el pOH, y pH = 14 − pOH.',
  },
  {
    id: 7,
    titulo: 'El punto de partida de un ácido débil',
    enunciado:
      'Se ponen en el matraz 25 mL de un ácido débil 0,10 M con pKa = 4,76 (el del ácido acético) para titularlos con NaOH 0,10 M. ¿Cuál es el pH ANTES de añadir nada de base? Redondea a dos decimales. Es el estado con el que arranca el simulador al elegir ácido débil con base fuerte.',
    categoria: 'abstracto',
    datos: { pregunta: 'pH', tipo: 'ad-bf', V_analito: 25, C_analito: 0.1, C_titulante: 0.1, pKa: 4.76, V_titulante: 0 },
    pista: 'Un ácido débil no se disocia entero: [H⁺] ≠ C. Usa pH = ½(pKa − log C).',
  },
  {
    id: 8,
    titulo: 'Medio camino: el pH vale el pKa',
    enunciado:
      'El ácido benzoico (pKa = 4,2) se usa como conservante en alimentos y bebidas. Se titulan 25 mL de una disolución 0,10 M de ácido benzoico con NaOH 0,10 M. ¿Cuál es el pH cuando se han añadido 12,5 mL de NaOH? Redondea a dos decimales. En el simulador: carga el caso, pulsa 12 veces «+ 1 mL» y 5 veces «+ Gota (0,1 mL)».',
    categoria: 'aplicado',
    datos: { pregunta: 'pH', tipo: 'ad-bf', V_analito: 25, C_analito: 0.1, C_titulante: 0.1, pKa: 4.2, V_titulante: 12.5 },
    pista: 'Calcula primero V_eq. ¿Qué fracción del ácido se ha neutralizado con 12,5 mL? Mira qué dice entonces Henderson-Hasselbalch.',
  },
  {
    id: 9,
    titulo: 'Un tampón con tres partes de base conjugada',
    enunciado:
      'Se titulan 20 mL de un ácido débil 0,10 M (pKa = 4,8) con NaOH 0,10 M. ¿Cuál es el pH después de añadir 15 mL de NaOH? Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { pregunta: 'pH', tipo: 'ad-bf', V_analito: 20, C_analito: 0.1, C_titulante: 0.1, pKa: 4.8, V_titulante: 15 },
    pista: 'La base convierte HA en A⁻ mol a mol. Cuenta cuántos mmol quedan de cada uno y usa Henderson-Hasselbalch: pH = pKa + log(n(A⁻)/n(HA)).',
  },
  {
    id: 10,
    titulo: 'Un vinagre que no acaba en pH 7',
    enunciado:
      'Un vinagre diluido tiene ácido acético 0,20 M (toma pKa = 4,8). Se titulan 20 mL con NaOH 0,20 M. ¿Cuál es el pH en el punto de equivalencia? Compruébalo: carga el caso y pulsa el botón que lleva la bureta a la equivalencia.',
    categoria: 'aplicado',
    datos: { pregunta: 'pH', tipo: 'ad-bf', V_analito: 20, C_analito: 0.2, C_titulante: 0.2, pKa: 4.8, V_titulante: 20 },
    pista: 'En la equivalencia solo queda acetato de sodio en 40 mL. El acetato es una base débil: pH = 7 + ½(pKa + log C_sal).',
  },
  {
    id: 11,
    titulo: 'Un limpiador ácido titulado con amoníaco',
    enunciado:
      'Se titulan 20 mL de un limpiador que contiene HCl 0,20 M con una disolución de amoníaco (NH₃, base débil, pKb = 4,7) 0,20 M. ¿Cuál es el pH en el punto de equivalencia?',
    categoria: 'aplicado',
    datos: { pregunta: 'pH', tipo: 'af-bd', V_analito: 20, C_analito: 0.2, C_titulante: 0.2, pKb: 4.7, V_titulante: 20 },
    pista: 'En la equivalencia queda cloruro de amonio (NH₄Cl) en 40 mL. El NH₄⁺ es un ácido débil: pH = 7 − ½(pKb + log C_sal).',
  },
  {
    id: 12,
    titulo: 'Amoníaco de sobra: tampón de la base',
    enunciado:
      'Se titulan 20 mL de HCl 0,10 M con amoníaco 0,10 M (pKb = 4,7). ¿Cuál es el pH después de añadir 40 mL de amoníaco, el doble del volumen de equivalencia?',
    categoria: 'abstracto',
    datos: { pregunta: 'pH', tipo: 'af-bd', V_analito: 20, C_analito: 0.1, C_titulante: 0.1, pKb: 4.7, V_titulante: 40 },
    pista: 'Pasada la equivalencia hay NH₄⁺ y NH₃ a la vez: un tampón. Compara sus moles y usa pOH = pKb + log(n(NH₄⁺)/n(NH₃)).',
  },
];

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const magnitud = magnitudDe(def.datos.pregunta);
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  const unidad = unidadDe(magnitud);
  return {
    ...def,
    magnitud,
    etiquetaRespuesta: etiquetaDe(magnitud),
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
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32). Sembrando xorshift32 directamente
 * con 1, 2, 3… los primeros valores salen diminutos y muy parecidos, así que
 * `Math.floor(rnd() * n)` devuelve el índice 0 para todas las semillas pequeñas y el
 * «aleatorio» acaba dando SIEMPRE el mismo ejercicio. Pasó en `simulador-genetica` el
 * 14/09/2026 y pasó la prueba de reproducibilidad, porque reproducible no es variado.
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

export interface Ejercicio {
  semilla: number;
  enunciado: string;
  datos: DatosCaso;
  magnitud: Magnitud;
  respuesta: number;
  etiquetaRespuesta: string;
  unidad: string;
  requiereRedondeo: boolean;
  pasos: string[];
}

function elegir<T>(rnd: () => number, opciones: readonly T[]): T {
  return opciones[Math.min(opciones.length - 1, Math.floor(rnd() * opciones.length))];
}

/** Todos en la rejilla de los deslizadores: V entero, C en pasos de 0,01, pK en pasos de 0,1. */
const VOLUMENES_ANALITO = [10, 20, 25, 40, 50] as const;
const CONC_ANALITO = [0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5] as const;
const CONC_TITULANTE = [0.05, 0.1, 0.2, 0.25, 0.5] as const;
/** pKa ≥ 4: por debajo, Henderson-Hasselbalch y la cuadrática del motor se separan en la zona 1:3. */
const PKA = [4.2, 4.5, 4.8, 5.2, 5.5, 6] as const;
const PKB = [3.4, 4.2, 4.7, 5.3] as const;

type Escenario =
  | 'volumen'
  | 'concentracion'
  | 'afbf-antes'
  | 'afbf-exceso'
  | 'adbf-tampon'
  | 'adbf-equivalencia'
  | 'afbd-equivalencia'
  | 'afbd-despues';

const ESCENARIOS: readonly Escenario[] = [
  'volumen',
  'concentracion',
  'afbf-antes',
  'afbf-exceso',
  'adbf-tampon',
  'adbf-equivalencia',
  'afbd-equivalencia',
  'afbd-despues',
];

/** true si n es múltiplo de 0,1 (lo que se alcanza con «+ 1 mL» y «+ Gota»). */
function enDecimas(n: number): boolean {
  return Math.abs(n * 10 - Math.round(n * 10)) < 1e-9;
}

function enCentesimas(n: number): boolean {
  return Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;
}

const ACIDO_TEXTO: Record<TipoTitulacion, string> = {
  'af-bf': 'HCl',
  'ad-bf': 'un ácido débil',
  'af-bd': 'HCl',
  'ad-bd': 'un ácido débil',
};

const BASE_TEXTO: Record<TipoTitulacion, string> = {
  'af-bf': 'NaOH',
  'ad-bf': 'NaOH',
  'af-bd': 'amoníaco (NH₃)',
  'ad-bd': 'amoníaco (NH₃)',
};

function describir(d: DatosCaso): string {
  const pk =
    d.tipo === 'ad-bf'
      ? ` (pKa = ${cifra(d.pKa as number)})`
      : '';
  const pkb = d.tipo === 'af-bd' ? ` (pKb = ${cifra(d.pKb as number)})` : '';
  const conc = d.C_analito !== undefined ? ` ${formatNumber(d.C_analito, 2)} M` : '';
  return `Se titulan ${cifra(d.V_analito)} mL de ${ACIDO_TEXTO[d.tipo]}${conc}${pk} con ${BASE_TEXTO[d.tipo]} ${formatNumber(d.C_titulante, 2)} M${pkb}.`;
}

/** Un intento de ejercicio; `null` si los datos no cumplen las condiciones del escenario. */
function intentar(rnd: () => number): { datos: DatosCaso; pregunta: string } | null {
  const escenario = elegir(rnd, ESCENARIOS);
  const Va = elegir(rnd, VOLUMENES_ANALITO);
  const Ca = elegir(rnd, CONC_ANALITO);
  const Ct = elegir(rnd, CONC_TITULANTE);
  const pKa = elegir(rnd, PKA);
  const pKb = elegir(rnd, PKB);
  const Veq = volumenEquivalencia(Ca, Va, Ct);
  // Un V_eq razonable para una bureta de laboratorio (y para la escala de la curva).
  if (!(Veq >= 5 && Veq <= 100) || !enCentesimas(Veq)) return null;

  switch (escenario) {
    case 'volumen': {
      const tipo: TipoTitulacion = rnd() < 0.5 ? 'af-bf' : 'ad-bf';
      const datos: DatosCaso = { pregunta: 'volumen-equivalencia', tipo, V_analito: Va, C_analito: Ca, C_titulante: Ct, pKa: tipo === 'ad-bf' ? pKa : undefined };
      return { datos, pregunta: '¿Qué volumen de base hace falta para llegar al punto de equivalencia? Da el resultado en mL.' };
    }
    case 'concentracion': {
      const tipo: TipoTitulacion = rnd() < 0.5 ? 'af-bf' : 'ad-bf';
      const datos: DatosCaso = { pregunta: 'concentracion-analito', tipo, V_analito: Va, C_titulante: Ct, V_eq_observado: Veq, pKa: tipo === 'ad-bf' ? pKa : undefined };
      return {
        datos,
        pregunta: `El punto de equivalencia llega cuando se han añadido ${formatNumber(Veq, 2)} mL de base. ¿Cuál es la concentración del ácido? Da el resultado en mol/L con dos decimales.`,
      };
    }
    case 'afbf-antes':
    case 'afbf-exceso': {
      const f = escenario === 'afbf-antes' ? elegir(rnd, [0.2, 0.4, 0.5, 0.6, 0.8] as const) : elegir(rnd, [1.2, 1.4, 1.5, 1.6, 2] as const);
      const V = f * Veq;
      if (!enDecimas(V)) return null;
      const datos: DatosCaso = { pregunta: 'pH', tipo: 'af-bf', V_analito: Va, C_analito: Ca, C_titulante: Ct, V_titulante: redondear(V, 1) };
      return { datos, pregunta: `¿Cuál es el pH después de añadir ${cifra(redondear(V, 1))} mL de NaOH?` };
    }
    case 'adbf-tampon': {
      const f = elegir(rnd, [0.25, 0.5, 0.75] as const);
      const V = f * Veq;
      if (!enDecimas(V) || Ca < 0.05) return null;
      const datos: DatosCaso = { pregunta: 'pH', tipo: 'ad-bf', V_analito: Va, C_analito: Ca, C_titulante: Ct, pKa, V_titulante: redondear(V, 1) };
      // Solo donde Henderson-Hasselbalch y la cuadrática del motor coinciden a dos decimales:
      // si no, el alumno que usa la fórmula de su libro suspendería.
      const nA = Ca * Va;
      const nB = Ct * redondear(V, 1);
      const hh = pKa + Math.log10(nB / (nA - nB));
      const motor = calcularPH('ad-bf', redondear(V, 1), Va, Ca, Ct, pKa, NaN);
      if (redondear(hh, 2) !== redondear(motor, 2)) return null;
      return { datos, pregunta: `¿Cuál es el pH después de añadir ${cifra(redondear(V, 1))} mL de NaOH?` };
    }
    case 'adbf-equivalencia': {
      const datos: DatosCaso = { pregunta: 'pH', tipo: 'ad-bf', V_analito: Va, C_analito: Ca, C_titulante: Ct, pKa, V_titulante: Veq };
      return { datos, pregunta: '¿Cuál es el pH en el punto de equivalencia?' };
    }
    case 'afbd-equivalencia': {
      const datos: DatosCaso = { pregunta: 'pH', tipo: 'af-bd', V_analito: Va, C_analito: Ca, C_titulante: Ct, pKb, V_titulante: Veq };
      return { datos, pregunta: '¿Cuál es el pH en el punto de equivalencia?' };
    }
    case 'afbd-despues':
    default: {
      const f = elegir(rnd, [1.25, 1.5, 2] as const);
      const V = f * Veq;
      if (!enDecimas(V)) return null;
      const datos: DatosCaso = { pregunta: 'pH', tipo: 'af-bd', V_analito: Va, C_analito: Ca, C_titulante: Ct, pKb, V_titulante: redondear(V, 1) };
      return { datos, pregunta: `¿Cuál es el pH después de añadir ${cifra(redondear(V, 1))} mL de amoníaco?` };
    }
  }
}

/** Si ningún intento cuadra (no ocurre con estas listas, pero no se deja al azar): la semiequivalencia del caso 8. */
const RESERVA: { datos: DatosCaso; pregunta: string } = {
  datos: { pregunta: 'pH', tipo: 'ad-bf', V_analito: 25, C_analito: 0.1, C_titulante: 0.1, pKa: 4.2, V_titulante: 12.5 },
  pregunta: '¿Cuál es el pH después de añadir 12,5 mL de NaOH?',
};

/**
 * Ejercicio aleatorio. Usa EL MISMO `resolverCaso` que los doce fijos: si divergieran, el
 * alumno entrenaría con una regla y sería corregido con otra. Solo genera datos alcanzables
 * con los controles del simulador y, en la zona tampón, donde H-H y el motor coinciden. Si la
 * cifra exacta tiene más de dos decimales, el enunciado lo dice.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  let elegido: { datos: DatosCaso; pregunta: string } | null = null;
  for (let i = 0; i < 200 && !elegido; i++) {
    const intento = intentar(rnd);
    if (intento && resolverCaso(intento.datos).ok) elegido = intento;
  }
  const { datos, pregunta } = elegido ?? RESERVA;

  const r = resolverCaso(datos);
  const magnitud = magnitudDe(datos.pregunta);
  const redondeo = r.ok && exigeRedondeo(r.valor, 2) && magnitud !== 'concentracion' ? ' Redondea a dos decimales.' : '';
  const unidad = unidadDe(magnitud);
  return {
    semilla,
    enunciado: `${describir(datos)} ${pregunta}${redondeo}`,
    datos,
    magnitud,
    respuesta: r.ok ? redondear(r.valor, 2) : NaN,
    etiquetaRespuesta: etiquetaDe(magnitud),
    unidad,
    requiereRedondeo: r.ok ? exigeRedondeo(r.valor, 2) : false,
    pasos: r.ok ? r.pasos : [r.error ?? 'No se pudo resolver.'],
  };
}
