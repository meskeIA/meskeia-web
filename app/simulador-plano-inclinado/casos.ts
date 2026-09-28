/**
 * Casos para clase — la tarea asignable de `simulador-plano-inclinado`.
 *
 * Vive fuera de `page.tsx` porque el build compila la vista sin comprobar si la física está
 * bien ([[feedback_motor_calculo_aparte_y_probado]]). Aquí no hay React ni DOM, solo funciones
 * puras.
 *
 * ── LA ARITMÉTICA ES LA DE LA APP ─────────────────────────────────────────────
 *
 * Nada de la dinámica se reescribe aquí: toda respuesta sale de `analizarPlano` (`./motor.ts`),
 * que es el cuerpo del `useMemo` `fisica` de la página trasladado tal cual. Si la corrección y el
 * panel «Análisis de fuerzas» calcularan distinto, la app suspendería una respuesta que ella
 * misma imprime.
 *
 * La única magnitud que el panel no publica es la fuerza para SUBIR el bloque a velocidad
 * constante. También sale del motor: se ejecuta con μₛ = μₖ, y entonces el «rozamiento máximo»
 * que devuelve es justo μₖ·N; la fuerza es Pₓ + ese rozamiento. Las demás cuentas de este
 * fichero son de presentación (el paso a paso), y ninguna decide una respuesta.
 *
 * ── LOS CONVENIOS, POR ESCRITO ───────────────────────────────────────────────
 *
 * ⚠️ **g = 9,81 m/s²**, como la app. Todo enunciado cuya respuesta cambie con otra g lo dice
 *    («toma g = 9,81 m/s²»); con g = 9,8 la diferencia suele entrar en la tolerancia del 1 %,
 *    con g = 10 casi nunca.
 * ⚠️ **La fuerza aplicada es paralela al plano**, positiva cuesta arriba, y no altera la normal:
 *    N = m·g·cos θ.
 * ⚠️ **En reposo, el rozamiento NO es μₛ·N**: es lo justo para equilibrar, |F − m·g·sen θ|.
 *    μₛ·N es solo el máximo. Es el error clásico y tiene su propio caso (el 6).
 * ⚠️ **El límite exacto tg θ = μₛ cuenta como reposo** (la app usa ≤). Ningún caso cae en él.
 * ⚠️ **«¿Desliza?» se responde con un número**: la aceleración, que es 0 si no desliza.
 */

import { formatNumber } from '@/lib';
import { G, analizarPlano, type AnalisisPlano, type ParametrosPlano } from './motor';

/**
 * Valores de referencia para lo que el enunciado no da porque NO influye en la respuesta (la
 * masa en el ángulo crítico, por ejemplo): el motor necesita un número.
 */
const MASA_REFERENCIA = 1;
const ANGULO_REFERENCIA = 0;
const LONGITUD_REFERENCIA = 4;

/* ─────────────────────────── Datos de un caso ─────────────────────────── */

export type Pregunta =
  /** Componente del peso paralela al plano, m·g·sen θ (N). */
  | 'pesoParalelo'
  /** Fuerza normal, m·g·cos θ (N). */
  | 'normal'
  /** |a| en m/s²: 0 si el bloque no desliza. */
  | 'aceleracion'
  /** Rozamiento que actúa DE VERDAD (N): el que equilibra si hay reposo, μₖ·N si desliza. */
  | 'rozamientoReal'
  /** Ángulo a partir del cual resbala, arctg μₛ (grados). */
  | 'anguloCritico'
  /** Tiempo en bajar la rampa entera partiendo del reposo (s). */
  | 'tiempo'
  /** Velocidad al llegar al pie de la rampa (m/s). */
  | 'velocidadFinal'
  /** Fuerza paralela para SUBIRLO a velocidad constante: Pₓ + μₖ·N (N). */
  | 'fuerzaSubir'
  /** Energía potencial en lo alto de la rampa respecto de su pie, m·g·L·sen θ (J). */
  | 'energiaPotencial'
  /** Energía disipada por el rozamiento en la bajada completa, μₖ·N·L (J). */
  | 'trabajoRozamiento';

export interface DatosCaso {
  pregunta: Pregunta;
  /** kg */
  masa?: number;
  /** grados */
  angulo?: number;
  muS?: number;
  muK?: number;
  /** N, paralela al plano, positiva cuesta arriba. Por defecto 0. */
  fuerza?: number;
  /** m de rampa */
  longitud?: number;
  /** Decimales a los que se pide la respuesta. Por defecto 2. */
  decimales?: number;
}

/* ─────────────────────────── Resolución ─────────────────────────── */

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Cifra intermedia en formato español, sin ceros de relleno: «84,9571», «0,5». */
function numero(n: number, decimales = 4): string {
  if (!Number.isFinite(n)) return '—';
  return (n + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales;
  return Math.round(valor * factor) / factor;
}

/** «a unidades», «a una décima», «a dos decimales»: lo mismo que dice el enunciado. */
function textoRedondeo(decimales: number): string {
  if (decimales <= 0) return 'a unidades';
  if (decimales === 1) return 'a una décima';
  if (decimales === 2) return 'a dos decimales';
  if (decimales === 3) return 'a tres decimales';
  return `a ${decimales} decimales`;
}

/** Unidad en la que sale cada pregunta. */
export function unidadDePregunta(pregunta: Pregunta): string {
  switch (pregunta) {
    case 'pesoParalelo':
    case 'normal':
    case 'rozamientoReal':
    case 'fuerzaSubir':
      return 'N';
    case 'aceleracion':
      return 'm/s²';
    case 'anguloCritico':
      return '°';
    case 'tiempo':
      return 's';
    case 'velocidadFinal':
      return 'm/s';
    case 'energiaPotencial':
    case 'trabajoRozamiento':
      return 'J';
    default:
      return '';
  }
}

function conUnidad(valor: number, datos: DatosCaso): string {
  const unidad = unidadDePregunta(datos.pregunta);
  const cifra = formatNumber(valor, datos.decimales ?? 2);
  if (!unidad) return cifra;
  return unidad === '°' ? `${cifra}°` : `${cifra} ${unidad}`;
}

function error(texto: string, pasos: string[]): Resolucion {
  return { ok: false, valor: NaN, pasos, error: texto };
}

function finitoNoNegativo(n: number | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

/** Paso con el peso y sus dos componentes, que casi todos los casos necesitan. */
function pasosPeso(p: ParametrosPlano, f: AnalisisPlano, g: number, pasos: string[]): void {
  pasos.push(`Peso: P = m·g = ${numero(p.masa)}·${numero(g)} = ${numero(f.peso)} N.`);
  pasos.push(
    `Componente paralela al plano (tira cuesta abajo): Pₓ = m·g·sen θ = ${numero(f.peso)}·sen ${numero(p.angulo)}° = ${numero(f.peso)}·${numero(Math.sin(f.rad))} = ${numero(f.pesoParalelo)} N.`,
  );
  pasos.push(
    `Componente perpendicular: P_y = m·g·cos θ = ${numero(f.peso)}·${numero(Math.cos(f.rad))} = ${numero(f.pesoPerpendicular)} N. La fuerza aplicada es paralela al plano, así que la normal la equilibra: N = ${numero(f.normal)} N.`,
  );
}

/**
 * Paso que decide si el bloque se mueve, comparando con μₛ·N. Devuelve lo que dice el motor.
 * `fuerza` distinta de 0 cambia la redacción, no la regla.
 */
function pasosDecidir(p: ParametrosPlano, f: AnalisisPlano, pasos: string[]): void {
  const tendencia = Math.abs(f.resultanteSinRozar);
  pasos.push(
    `Rozamiento estático máximo: μₛ·N = ${numero(p.muS)}·${numero(f.normal)} = ${numero(f.rozamientoMaximo)} N.`,
  );
  const lado =
    p.fuerza === 0
      ? `Lo que tira del bloque es Pₓ = ${numero(tendencia)} N`
      : `Lo que tira del bloque es |F − Pₓ| = |${numero(p.fuerza)} − ${numero(f.pesoParalelo)}| = ${numero(tendencia)} N`;
  if (f.estado === 'reposo') {
    pasos.push(
      `${lado}, que NO supera ${numero(f.rozamientoMaximo)} N: el rozamiento estático basta para sujetarlo y el bloque no se mueve.`,
    );
  } else {
    pasos.push(
      `${lado}, que supera ${numero(f.rozamientoMaximo)} N: el bloque ${f.estado === 'baja' ? 'baja' : 'sube'}. En movimiento, el rozamiento pasa a ser el cinético: μₖ·N = ${numero(p.muK)}·${numero(f.normal)} = ${numero(f.rozamientoReal)} N, opuesto al movimiento.`,
    );
  }
  if (p.fuerza === 0 && p.angulo > 0 && p.angulo < 90) {
    pasos.push(
      `Atajo sin fuerza aplicada: la masa y g se cancelan y basta comparar tg θ = tg ${numero(p.angulo)}° = ${numero(Math.tan(f.rad))} con μₛ = ${numero(p.muS)}.`,
    );
  }
}

/** Paso con la aceleración de un bloque que desliza (ΣF = m·a en el eje del plano). */
function pasoAceleracion(p: ParametrosPlano, f: AnalisisPlano, pasos: string[]): void {
  const tendencia = Math.abs(f.resultanteSinRozar);
  pasos.push(
    `Segunda ley de Newton a lo largo del plano: a = (${p.fuerza === 0 ? 'Pₓ' : '|F − Pₓ|'} − μₖ·N)/m = (${numero(tendencia)} − ${numero(f.rozamientoReal)})/${numero(p.masa)} = ${numero(Math.abs(f.aceleracion))} m/s².`,
  );
}

/**
 * Recalcula la respuesta desde los datos, sin mirar el campo `respuesta` del caso. Nunca
 * lanza: un `throw` dentro de un render de React tumbaría la app entera, mientras que un
 * `{ ok: false }` se pinta.
 *
 * `g` vale la de la app; se puede cambiar solo para comprobar qué casos dependen de ella.
 */
export function resolverCaso(datos: DatosCaso, g: number = G): Resolucion {
  const decimales = datos.decimales ?? 2;
  const pasos: string[] = [];

  const p: ParametrosPlano = {
    masa: datos.masa ?? MASA_REFERENCIA,
    angulo: datos.angulo ?? ANGULO_REFERENCIA,
    muS: datos.muS ?? 0,
    muK: datos.muK ?? 0,
    fuerza: datos.fuerza ?? 0,
    longitud: datos.longitud ?? LONGITUD_REFERENCIA,
  };

  if (!(Number.isFinite(g) && g > 0)) return error('La gravedad debe ser un número positivo.', pasos);
  if (!(Number.isFinite(p.masa) && p.masa > 0)) return error('Falta un dato: una masa positiva.', pasos);
  if (!(Number.isFinite(p.angulo) && p.angulo >= 0 && p.angulo < 90)) {
    return error('El ángulo debe estar entre 0° y 90°.', pasos);
  }
  if (!finitoNoNegativo(p.muS) || !finitoNoNegativo(p.muK)) {
    return error('Los coeficientes de rozamiento no pueden ser negativos.', pasos);
  }
  if (p.muK > p.muS) return error('El coeficiente cinético no puede superar al estático.', pasos);
  if (!Number.isFinite(p.fuerza)) return error('La fuerza aplicada debe ser un número.', pasos);
  if (!(Number.isFinite(p.longitud) && p.longitud > 0)) {
    return error('Falta un dato: una rampa de longitud positiva.', pasos);
  }

  const f = analizarPlano(p, g);
  let valor: number;

  switch (datos.pregunta) {
    case 'pesoParalelo': {
      pasos.push(`Peso: P = m·g = ${numero(p.masa)}·${numero(g)} = ${numero(f.peso)} N.`);
      pasos.push(
        `La componente paralela al plano es la que tira del bloque cuesta abajo: Pₓ = m·g·sen θ = ${numero(f.peso)}·sen ${numero(p.angulo)}° = ${numero(f.peso)}·${numero(Math.sin(f.rad))} = ${numero(f.pesoParalelo)} N.`,
      );
      pasos.push('Va con el SENO: con θ = 0 (suelo horizontal) debe salir 0, y sen 0 = 0.');
      valor = f.pesoParalelo;
      break;
    }

    case 'normal': {
      pasos.push(`Peso: P = m·g = ${numero(p.masa)}·${numero(g)} = ${numero(f.peso)} N.`);
      pasos.push(
        `Componente perpendicular al plano: P_y = m·g·cos θ = ${numero(f.peso)}·cos ${numero(p.angulo)}° = ${numero(f.peso)}·${numero(Math.cos(f.rad))} = ${numero(f.pesoPerpendicular)} N.`,
      );
      pasos.push(
        `En la dirección perpendicular no hay movimiento, así que la normal equilibra a P_y: N = ${numero(f.normal)} N.`,
      );
      pasos.push(
        `Error clásico: escribir N = m·g = ${numero(f.peso)} N. Eso solo vale en un suelo horizontal; en la rampa la normal es menor que el peso.`,
      );
      valor = f.normal;
      break;
    }

    case 'aceleracion': {
      pasosPeso(p, f, g, pasos);
      pasosDecidir(p, f, pasos);
      if (f.estado === 'reposo') {
        pasos.push('Como no se mueve, su aceleración es 0.');
      } else {
        pasoAceleracion(p, f, pasos);
      }
      valor = Math.abs(f.aceleracion);
      break;
    }

    case 'rozamientoReal': {
      pasosPeso(p, f, g, pasos);
      pasosDecidir(p, f, pasos);
      if (f.estado === 'reposo') {
        pasos.push(
          `En reposo, el rozamiento estático NO vale μₛ·N: vale justo lo que hace falta para equilibrar, Fr = ${p.fuerza === 0 ? 'Pₓ' : '|F − Pₓ|'} = ${numero(f.rozamientoReal)} N. Los ${numero(f.rozamientoMaximo)} N de μₛ·N son solo el máximo que podría llegar a dar.`,
        );
      } else {
        pasos.push(`Como desliza, actúa el rozamiento cinético: Fr = μₖ·N = ${numero(f.rozamientoReal)} N.`);
      }
      valor = f.rozamientoReal;
      break;
    }

    case 'anguloCritico': {
      pasos.push(
        'Sin fuerza aplicada, el bloque está a punto de resbalar cuando la componente que tira cuesta abajo iguala al rozamiento máximo: m·g·sen θ = μₛ·m·g·cos θ.',
      );
      pasos.push('La masa y g aparecen a los dos lados y se cancelan: tg θ = μₛ.');
      pasos.push(`θ = arctg μₛ = arctg ${numero(p.muS)} = ${numero(f.anguloCritico)}°.`);
      pasos.push(
        'Por debajo de ese ángulo se queda quieto; por encima, resbala. No depende de la masa: un objeto más pesado no aguanta más inclinación.',
      );
      valor = f.anguloCritico;
      break;
    }

    case 'tiempo':
    case 'velocidadFinal': {
      pasosPeso(p, f, g, pasos);
      pasosDecidir(p, f, pasos);
      if (f.estado !== 'baja' || f.tiempoRecorrido === null || f.velocidadFinal === null) {
        return error('Con estos datos el bloque no baja por la rampa: no hay recorrido que calcular.', pasos);
      }
      pasoAceleracion(p, f, pasos);
      const a = Math.abs(f.aceleracion);
      if (datos.pregunta === 'tiempo') {
        pasos.push(
          `Parte del reposo y recorre toda la rampa con aceleración constante: L = ½·a·t², así que t = √(2·L/a) = √(2·${numero(p.longitud)}/${numero(a)}) = ${numero(f.tiempoRecorrido)} s.`,
        );
        valor = f.tiempoRecorrido;
      } else {
        pasos.push(
          `Parte del reposo: v² = 2·a·L, así que v = √(2·${numero(a)}·${numero(p.longitud)}) = ${numero(f.velocidadFinal)} m/s (lo mismo que v = a·t, con t = ${numero(f.tiempoRecorrido)} s).`,
        );
        valor = f.velocidadFinal;
      }
      break;
    }

    case 'fuerzaSubir': {
      // El motor con μₛ = μₖ devuelve como «rozamiento máximo» justo μₖ·N.
      const cinetico = analizarPlano({ ...p, muS: p.muK, fuerza: 0 }, g);
      pasosPeso(p, f, g, pasos);
      pasos.push(
        `Subiendo, el rozamiento es el cinético y apunta cuesta ABAJO, igual que Pₓ: μₖ·N = ${numero(p.muK)}·${numero(cinetico.normal)} = ${numero(cinetico.rozamientoMaximo)} N.`,
      );
      valor = cinetico.pesoParalelo + cinetico.rozamientoMaximo;
      pasos.push(
        `A velocidad constante la aceleración es 0, así que las fuerzas a lo largo del plano se anulan: F = Pₓ + μₖ·N = ${numero(cinetico.pesoParalelo)} + ${numero(cinetico.rozamientoMaximo)} = ${numero(valor)} N.`,
      );
      pasos.push(
        `Para ARRANCARLO desde el reposo haría falta más, porque manda μₛ: Pₓ + μₛ·N = ${numero(f.pesoParalelo)} + ${numero(f.rozamientoMaximo)} = ${numero(f.pesoParalelo + f.rozamientoMaximo)} N. Una vez en marcha, basta con ${numero(valor)} N.`,
      );
      break;
    }

    case 'energiaPotencial': {
      pasos.push(
        `Altura de la rampa: h = L·sen θ = ${numero(p.longitud)}·sen ${numero(p.angulo)}° = ${numero(f.alturaTotal)} m. La rampa es la hipotenusa, no la altura.`,
      );
      pasos.push(
        `Energía potencial respecto del pie de la rampa: Ep = m·g·h = ${numero(p.masa)}·${numero(g)}·${numero(f.alturaTotal)} = ${numero(f.energiaPotencial)} J.`,
      );
      pasos.push('No depende del rozamiento ni del camino: solo de cuánto se ha subido.');
      valor = f.energiaPotencial;
      break;
    }

    case 'trabajoRozamiento': {
      pasosPeso(p, f, g, pasos);
      pasosDecidir(p, f, pasos);
      if (f.estado !== 'baja' || f.energiaCinetica === null) {
        return error('Con estos datos el bloque no baja por la rampa: no hay recorrido que calcular.', pasos);
      }
      valor = f.trabajoRozamiento;
      pasos.push(
        `Energía disipada en toda la rampa: W = Fr·L = μₖ·N·L = ${numero(f.rozamientoReal)}·${numero(p.longitud)} = ${numero(valor)} J. Se convierte en calor en la superficie de contacto.`,
      );
      pasos.push(
        `Balance: arriba tiene Ep = m·g·L·sen θ = ${numero(f.energiaPotencial)} J, y llega abajo con Ec = Ep − W = ${numero(f.energiaCinetica)} J.`,
      );
      break;
    }

    default:
      return error('Pregunta desconocida.', pasos);
  }

  if (!Number.isFinite(valor)) {
    return error('El resultado no es un número finito.', pasos);
  }

  // El último paso muestra la cifra con los MISMOS decimales que pide el enunciado.
  const redondeado = redondear(valor, decimales);
  const exacto = Math.abs(valor - redondeado) < 1e-9;
  pasos.push(
    exacto
      ? `Resultado: ${conUnidad(redondeado, datos)}.`
      : `Redondeando ${textoRedondeo(decimales)}: ${conUnidad(redondeado, datos)}.`,
  );
  return { ok: true, valor, pasos };
}

/* ─────────────────────────── Corrección ─────────────────────────── */

/** El MAYOR entre 0,01 y el 1 % del valor. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/** Corrige la respuesta del alumno. Nunca lanza. */
export function comprobarRespuesta(usuario: number, esperado: number): Veredicto {
  const tolerancia = toleranciaDe(esperado);

  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número (puedes usar la coma decimal).',
      diferencia: NaN,
      tolerancia,
    };
  }

  const diferencia = Math.abs(usuario - esperado);
  /**
   * Margen de ruido binario (hallazgo 1211 de `simulador-conservacion-energia`): en el borde
   * EXACTO de la tolerancia la resta en coma flotante decide por ±1 ulp. 1e-9 absorbe ese ruido
   * y queda siete órdenes de magnitud por debajo de la tolerancia más pequeña (0,01).
   */
  const RUIDO_BINARIO = 1e-9;
  if (diferencia <= tolerancia + RUIDO_BINARIO) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia, 2)} de la respuesta.`,
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
  respuesta: number;
  respuestaTexto: string;
  pasos: string[];
  pista: string;
  /** El enunciado pide redondear: la respuesta exacta tiene más decimales de los que se piden. */
  requiereRedondeo: boolean;
  /**
   * Cómo ver la cifra en el simulador, con los decimales que imprime el panel. Solo donde es
   * VERDAD con los deslizadores actuales.
   */
  comoComprobar?: string;
}

/** Recordatorio de g para las pistas. */
const PISTA_G = 'Usa g = 9,81 m/s², la del simulador: con g = 10 el resultado queda fuera de la tolerancia.';

/** El orden importa en el simulador: μₖ nunca puede superar a μₛ, así que μₛ va primero. */
const ORDEN_MU = 'mueve μₛ antes que μₖ, porque μₖ no puede superarlo';

/**
 * Los datos de cada caso. La respuesta NO se escribe aquí: la calcula `resolverCaso`, de modo
 * que editar un enunciado sin tocar la solución es imposible.
 *
 * Sin ciudades, países ni monedas: el 91 % de este canal es de fuera de España.
 */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'La componente del peso que tira cuesta abajo',
    enunciado:
      'Un bloque de 10 kg está apoyado en un plano inclinado 30°. ¿Cuánto vale la componente de su peso paralela al plano? Toma g = 9,81 m/s² y da el resultado en newtons con dos decimales.',
    categoria: 'abstracto',
    datos: { pregunta: 'pesoParalelo', masa: 10, angulo: 30, muS: 0.5, muK: 0.3 },
    etiquetaRespuesta: 'Pₓ en N',
    requiereRedondeo: false,
    pista: `Pₓ = m·g·sen θ, y sen 30° = 0,5 exacto. ${PISTA_G}`,
    comoComprobar:
      'Pon la masa en 10 kg y el ángulo en 30°: la fila «Peso paralelo m·g·sen θ» del panel da 49,05 N.',
  },
  {
    id: 2,
    titulo: 'La fuerza normal en una rampa',
    enunciado:
      'El mismo bloque de 10 kg sobre el plano de 30°, sin ninguna otra fuerza aplicada. ¿Cuánto vale la fuerza normal que le hace el plano? Toma g = 9,81 m/s². Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { pregunta: 'normal', masa: 10, angulo: 30, muS: 0.5, muK: 0.3 },
    etiquetaRespuesta: 'N en N',
    requiereRedondeo: true,
    pista: `N = m·g·cos θ, NO m·g: la normal es perpendicular a la superficie, no al suelo. cos 30° ≈ 0,866. ${PISTA_G}`,
    comoComprobar:
      'Pon la masa en 10 kg y el ángulo en 30°: la fila «Normal N = m·g·cos θ» da 84,96 N.',
  },
  {
    id: 3,
    titulo: 'Un trineo sobre una ladera helada',
    enunciado:
      'Un trineo de 20 kg baja por una ladera helada inclinada 30° en la que el rozamiento se puede despreciar. ¿Con qué aceleración baja? Toma g = 9,81 m/s² y da el resultado en m/s² con tres decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'aceleracion', masa: 20, angulo: 30, muS: 0, muK: 0, decimales: 3 },
    etiquetaRespuesta: 'a en m/s²',
    requiereRedondeo: false,
    pista: `Sin rozamiento, la única fuerza a lo largo del plano es Pₓ = m·g·sen θ, y a = Pₓ/m = g·sen θ. La masa no hace falta. ${PISTA_G}`,
    comoComprobar:
      'Pulsa el material «Sin rozamiento (caso ideal)», pon la masa en 20 kg y el ángulo en 30°: la fila «Aceleración» da 4,90 m/s² (el panel redondea a dos decimales). Cambia la masa: la aceleración no se mueve.',
  },
  {
    id: 4,
    titulo: 'Un bloque sobre una rampa empinada',
    enunciado:
      'Un bloque de 2 kg se deja quieto sobre un plano inclinado 40°, con μₛ = 0,5 y μₖ = 0,3. ¿Desliza? Responde con su aceleración en m/s² (escribe 0 si no desliza). Toma g = 9,81 m/s². Redondea a dos decimales.',
    categoria: 'abstracto',
    datos: { pregunta: 'aceleracion', masa: 2, angulo: 40, muS: 0.5, muK: 0.3 },
    etiquetaRespuesta: 'a en m/s²',
    requiereRedondeo: true,
    pista: `Primero decide si se mueve comparando Pₓ con μₛ·N (o tg θ con μₛ). Si se mueve, en la segunda ley usa μₖ, no μₛ. ${PISTA_G}`,
    comoComprobar: `Pon masa 2 kg, ángulo 40°, μₛ = 0,50 y μₖ = 0,30 (${ORDEN_MU}): la fila «Aceleración» da 4,05 m/s².`,
  },
  {
    id: 5,
    titulo: 'Una maleta en una cinta parada',
    enunciado:
      'Una maleta de 4 kg descansa sobre una cinta transportadora inclinada 25° que está detenida. Entre la maleta y la cinta, μₛ = 0,5 y μₖ = 0,3. ¿Desliza? Responde con su aceleración en m/s² (escribe 0 si no desliza). Toma g = 9,81 m/s². Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'aceleracion', masa: 4, angulo: 25, muS: 0.5, muK: 0.3 },
    etiquetaRespuesta: 'a en m/s²',
    requiereRedondeo: false,
    pista: 'Compara tg θ con μₛ: la masa y g se cancelan. Si la tangente no supera a μₛ, el rozamiento estático la sujeta.',
    comoComprobar: `Pon masa 4 kg, ángulo 25°, μₛ = 0,50 y μₖ = 0,30 (${ORDEN_MU}) y lee el aviso de arriba del simulador y la fila «Aceleración».`,
  },
  {
    id: 6,
    titulo: 'El rozamiento de una caja que no se mueve',
    enunciado:
      'Una caja de 20 kg está quieta sobre la rampa de carga de un camión, inclinada 30°. Entre la caja y la rampa, μₛ = 0,7 y μₖ = 0,5. ¿Cuánto vale la fuerza de rozamiento que actúa sobre la caja? Toma g = 9,81 m/s² y da el resultado en newtons con dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'rozamientoReal', masa: 20, angulo: 30, muS: 0.7, muK: 0.5 },
    etiquetaRespuesta: 'Fr en N',
    requiereRedondeo: false,
    pista: 'Cuidado: μₛ·N es el rozamiento MÁXIMO, no el que hay. Si la caja está quieta, el rozamiento vale justo lo necesario para que la suma de fuerzas sea cero.',
    comoComprobar: `Pon masa 20 kg, ángulo 30°, μₛ = 0,70 y μₖ = 0,50 (${ORDEN_MU}): compara la fila «Rozamiento máximo μₛ·N» con la fila «Rozamiento real». La respuesta es la segunda.`,
  },
  {
    id: 7,
    titulo: 'A partir de qué inclinación resbala',
    enunciado:
      'Una caja de madera está sobre una tabla que se va inclinando poco a poco. El coeficiente de rozamiento estático entre las dos es μₛ = 0,75. ¿A partir de qué ángulo empieza a resbalar la caja? Da el resultado en grados. Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'anguloCritico', muS: 0.75, muK: 0.5 },
    etiquetaRespuesta: 'θ en grados',
    requiereRedondeo: true,
    pista: 'Justo al empezar a resbalar, m·g·sen θ = μₛ·m·g·cos θ. Divide los dos lados por m·g·cos θ. No hace falta la masa ni la g.',
    comoComprobar: `Pon μₛ = 0,75 y μₖ = 0,50 (${ORDEN_MU}) y mueve el ángulo: a 36° la caja se queda quieta y a 37° resbala. La fila «Ángulo crítico arctg(μₛ)» lo da con una décima: 36,9°.`,
  },
  {
    id: 8,
    titulo: 'Cuánto tarda en bajar un tobogán',
    enunciado:
      'Un niño de 25 kg se suelta desde lo alto de un tobogán recto de 4 m de longitud inclinado 30°. Entre su ropa y el tobogán, μₛ = 0,3 y μₖ = 0,2. ¿Cuánto tarda en llegar abajo? Toma g = 9,81 m/s². Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'tiempo', masa: 25, angulo: 30, muS: 0.3, muK: 0.2, longitud: 4 },
    etiquetaRespuesta: 't en s',
    requiereRedondeo: true,
    pista: `Calcula primero la aceleración (con μₖ) y después usa L = ½·a·t², porque parte del reposo. ${PISTA_G}`,
    comoComprobar: `Pon masa 25 kg, ángulo 30°, μₛ = 0,30, μₖ = 0,20 (${ORDEN_MU}) y rampa de 4 m: la fila «Tiempo en bajar 4,0 m» da 1,58 s. Pulsa el botón que suelta el bloque para verlo bajar.`,
  },
  {
    id: 9,
    titulo: 'La velocidad al final de una rampa de descarga',
    enunciado:
      'Una caja de 12 kg se suelta desde lo alto de una rampa de descarga de 5 m inclinada 35°. Entre la caja y la rampa, μₛ = 0,4 y μₖ = 0,25. ¿Con qué velocidad llega al pie de la rampa? Toma g = 9,81 m/s². Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'velocidadFinal', masa: 12, angulo: 35, muS: 0.4, muK: 0.25, longitud: 5 },
    etiquetaRespuesta: 'v en m/s',
    requiereRedondeo: true,
    pista: `Aceleración con μₖ y después v² = 2·a·L (parte del reposo). sen 35° ≈ 0,5736 y cos 35° ≈ 0,8192. ${PISTA_G}`,
    comoComprobar: `Pon masa 12 kg, ángulo 35°, μₛ = 0,40, μₖ = 0,25 (${ORDEN_MU}) y rampa de 5 m: la fila «Velocidad al llegar abajo» da 6,01 m/s.`,
  },
  {
    id: 10,
    titulo: 'Empujar una caja rampa arriba',
    enunciado:
      'Una persona empuja una caja de 20 kg por una rampa inclinada 15°, con una fuerza paralela a la rampa, y la sube a velocidad constante. Entre la caja y la rampa, μₛ = 0,4 y μₖ = 0,3. ¿Qué fuerza tiene que hacer? Toma g = 9,81 m/s². Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'fuerzaSubir', masa: 20, angulo: 15, muS: 0.4, muK: 0.3 },
    etiquetaRespuesta: 'F en N',
    requiereRedondeo: true,
    pista: `A velocidad constante, a = 0. Al subir, tanto Pₓ como el rozamiento cinético apuntan cuesta abajo, y la fuerza tiene que compensar los dos. ${PISTA_G}`,
    comoComprobar:
      'Pon masa 20 kg, ángulo 15° y los dos coeficientes en 0,30 (así el simulador usa μₖ también para arrancar). Con la fuerza en 107 N la caja se queda quieta y con 108 N sube: tu resultado tiene que estar entre los dos.',
  },
  {
    id: 11,
    titulo: 'La energía potencial en lo alto de la rampa',
    enunciado:
      'Un bloque de 8 kg está en lo alto de una rampa de 5 m de longitud inclinada 30°. ¿Cuánta energía potencial tiene respecto del pie de la rampa? Toma g = 9,81 m/s² y da el resultado en julios con dos decimales.',
    categoria: 'abstracto',
    datos: { pregunta: 'energiaPotencial', masa: 8, angulo: 30, muS: 0.5, muK: 0.3, longitud: 5 },
    etiquetaRespuesta: 'Ep en J',
    requiereRedondeo: false,
    pista: `Ep = m·g·h, y h NO es la longitud de la rampa: es su altura, h = L·sen θ. ${PISTA_G}`,
    comoComprobar: `Pon masa 8 kg, ángulo 30°, rampa de 5 m y μₛ = 0,50, μₖ = 0,30 (${ORDEN_MU}): el panel da la altura equivalente, 2,50 m, bajo la longitud de la rampa, y la fila «Energía potencial inicial», 196,20 J.`,
  },
  {
    id: 12,
    titulo: 'La energía que disipa el rozamiento de un esquí',
    enunciado:
      'Una esquiadora de 50 kg baja 10 m por una pendiente de 30°. Entre los esquís y la nieve, μₛ = 0,15 y μₖ = 0,1. ¿Cuánta energía disipa el rozamiento en ese tramo? Toma g = 9,81 m/s². Redondea a dos decimales.',
    categoria: 'aplicado',
    datos: { pregunta: 'trabajoRozamiento', masa: 50, angulo: 30, muS: 0.15, muK: 0.1, longitud: 10 },
    etiquetaRespuesta: 'W en J',
    requiereRedondeo: true,
    pista: `El trabajo del rozamiento es fuerza por distancia: W = μₖ·N·L, con N = m·g·cos θ. ${PISTA_G}`,
    comoComprobar: `Pon masa 50 kg, ángulo 30°, μₛ = 0,15, μₖ = 0,10 (${ORDEN_MU}) y rampa de 10 m: la fila «Disipado por rozamiento» da 424,79 J.`,
  },
];

/**
 * Formatea el resultado con su unidad a partir de la etiqueta: «84,96 N». La unidad es lo que
 * va detrás de « en » en la etiqueta («Pₓ en N» → «N»), así que no se imprime nunca un número
 * suelto junto a media frase (hallazgo 830 de `simulador-genetica`).
 */
export function textoRespuesta(valor: number, etiqueta: string, decimales = 2): string {
  if (!Number.isFinite(valor)) return '—';
  const corte = etiqueta.indexOf(' en ');
  const unidad = corte === -1 ? '' : etiqueta.slice(corte + 4);
  const cifra = formatNumber(valor, decimales);
  if (!unidad) return cifra;
  return unidad === 'grados' ? `${cifra}°` : `${cifra} ${unidad}`;
}

/** Los doce casos, con su respuesta CALCULADA por el motor y no escrita a mano. */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  const decimales = def.datos.decimales ?? 2;
  const valor = r.ok ? redondear(r.valor, decimales) : NaN;
  return {
    ...def,
    respuesta: valor,
    respuestaTexto: textoRespuesta(valor, def.etiquetaRespuesta, decimales),
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
 * devuelve el índice 0 una y otra vez: el «aleatorio» acaba dando SIEMPRE el mismo ejercicio
 * y aun así pasa la prueba de reproducibilidad, porque reproducible no es variado.
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
  enunciado: string;
  datos: DatosCaso;
  respuesta: number;
  etiquetaRespuesta: string;
  pasos: string[];
}

/**
 * Listas «amables»: cifras que se teclean sin error y caben en los deslizadores del simulador.
 * Ningún par ángulo/μₛ cae en el límite exacto tg θ = μₛ (tg 45° = 1 no está en la lista de μₛ).
 */
const MASAS = [2, 4, 5, 8, 10, 12, 20] as const;
const ANGULOS = [15, 20, 25, 30, 35, 40, 45] as const;
const MU_ESTATICOS = [0.2, 0.3, 0.4, 0.5, 0.6, 0.8] as const;
const MU_CINETICOS = [0.1, 0.15, 0.2, 0.3, 0.4, 0.5] as const;
const LONGITUDES = [2, 3, 4, 5, 6, 8] as const;
const PREGUNTAS = [
  'pesoParalelo',
  'normal',
  'aceleracion',
  'rozamientoReal',
  'anguloCritico',
  'tiempo',
  'velocidadFinal',
] as const;

function elegir<T>(lista: readonly T[], rnd: () => number): T {
  return lista[Math.min(lista.length - 1, Math.floor(rnd() * lista.length))];
}

/**
 * Ejercicio aleatorio con los mismos tipos de pregunta que los casos fijos. Usa EL MISMO
 * `resolverCaso` que los doce, y por tanto el mismo motor que el panel: si divergieran, el
 * alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const pregunta = elegir(PREGUNTAS, rnd);
  const masa = elegir(MASAS, rnd);
  let angulo: number = elegir(ANGULOS, rnd);
  const muS = elegir(MU_ESTATICOS, rnd);
  const muK = elegir(MU_CINETICOS.filter((m) => m < muS), rnd);
  const longitud = elegir(LONGITUDES, rnd);

  // Tiempo y velocidad solo existen si el bloque baja: se sube el ángulo hasta que resbale
  // (con un número de intentos acotado; 45° con μₛ ≤ 0,8 resbala siempre).
  if (pregunta === 'tiempo' || pregunta === 'velocidadFinal') {
    let intentos = 0;
    while (
      analizarPlano({ masa, angulo, muS, muK, fuerza: 0, longitud }).estado !== 'baja' &&
      intentos < ANGULOS.length
    ) {
      angulo = ANGULOS[Math.min(ANGULOS.length - 1, ANGULOS.indexOf(angulo as (typeof ANGULOS)[number]) + 1)];
      intentos += 1;
    }
  }

  const datos: DatosCaso = { pregunta, masa, angulo, muS, muK, longitud };
  const g = 'Toma g = 9,81 m/s².';
  const redondeo = 'Redondea a dos decimales.';
  const situacion = `Un bloque de ${numero(masa)} kg está sobre un plano inclinado ${numero(angulo)}°, con μₛ = ${numero(muS)} y μₖ = ${numero(muK)}.`;

  let enunciado: string;
  let etiqueta: string;

  if (pregunta === 'pesoParalelo') {
    enunciado = `Un bloque de ${numero(masa)} kg está sobre un plano inclinado ${numero(angulo)}°. ¿Cuánto vale la componente de su peso paralela al plano, en newtons? ${g} ${redondeo}`;
    etiqueta = 'Pₓ en N';
  } else if (pregunta === 'normal') {
    enunciado = `Un bloque de ${numero(masa)} kg está sobre un plano inclinado ${numero(angulo)}°, sin otra fuerza aplicada. ¿Cuánto vale la fuerza normal, en newtons? ${g} ${redondeo}`;
    etiqueta = 'N en N';
  } else if (pregunta === 'aceleracion') {
    enunciado = `${situacion} Se deja quieto. ¿Desliza? Responde con su aceleración en m/s² (escribe 0 si no desliza). ${g} ${redondeo}`;
    etiqueta = 'a en m/s²';
  } else if (pregunta === 'rozamientoReal') {
    // Si resbala, la pregunta sigue teniendo una única respuesta (μₖ·N): el paréntesis lo dice.
    enunciado = `${situacion} Se deja quieto. ¿Cuánto vale la fuerza de rozamiento que actúa sobre él, en newtons (si desliza, la que actúa mientras desliza)? ${g} ${redondeo}`;
    etiqueta = 'Fr en N';
  } else if (pregunta === 'anguloCritico') {
    enunciado = `El coeficiente de rozamiento estático entre un objeto y una tabla es μₛ = ${numero(muS)}. ¿A partir de qué ángulo de inclinación empieza a resbalar el objeto? Da el resultado en grados. ${redondeo}`;
    etiqueta = 'θ en grados';
  } else if (pregunta === 'tiempo') {
    enunciado = `${situacion} Se suelta desde lo alto de una rampa de ${numero(longitud)} m. ¿Cuánto tarda en llegar abajo, en segundos? ${g} ${redondeo}`;
    etiqueta = 't en s';
  } else {
    enunciado = `${situacion} Se suelta desde lo alto de una rampa de ${numero(longitud)} m. ¿Con qué velocidad llega abajo, en m/s? ${g} ${redondeo}`;
    etiqueta = 'v en m/s';
  }

  const r = resolverCaso(datos);
  return {
    enunciado,
    datos,
    respuesta: r.ok ? redondear(r.valor, datos.decimales ?? 2) : NaN,
    etiquetaRespuesta: etiqueta,
    pasos: r.pasos,
  };
}
