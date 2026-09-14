/**
 * Casos de aula de simulador-genetica — 12 cruces fijos con respuesta comprobable.
 *
 * POR QUÉ ESTE FICHERO VIVE FUERA DE LA VISTA
 * El build compila `page.tsx` sin comprobar si la genética está bien: un cruce mal resuelto
 * no rompe nada, simplemente corrige mal al alumno. Aquí no hay React ni DOM, así que la
 * aritmética se puede probar sin navegador (tests/apps/simulador-genetica.spec.ts).
 *
 * LA REGLA DE ORO: NO SE REPLICA NADA
 * Todo el cálculo lo hace el MISMO motor que pinta la app —`components/genetics`—, que ya
 * estaba separado de la vista. `resolverCaso` llama a `generateMonohybridPunnett`,
 * `generateDihybridPunnett` y `generateSexLinkedPunnett`, y lee sus ratios. Si mañana cambia
 * un fenotipo en `organisms.ts`, cambian a la vez la app y los casos. Lo contrario —una tabla
 * de respuestas escrita a mano— produce el peor fallo posible aquí: que la app suspenda una
 * respuesta que ella misma produce.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────
 * EL CONVENIO DE ESTA APP (léelo antes de añadir un caso)
 *
 * 1. LAS PROPORCIONES SON SOBRE EL TOTAL DE LA DESCENDENCIA, no sobre un subconjunto.
 *    Es la ambigüedad cara de la genética escolar. En un cruce Xd Y × XD Xd, «¿qué
 *    proporción es daltónica?» admite dos lecturas legítimas: 2 de 4 sobre el total (50 %)
 *    o «la mitad de los varones» (50 % de ellos, 25 % del total). El motor cuenta SIEMPRE
 *    sobre las casillas del cuadro, así que cada enunciado ligado al sexo dice
 *    explícitamente «del total de la descendencia» y pregunta por UNA clave del cuadro.
 *
 * 2. EN LIGADO AL SEXO, EL SEXO FORMA PARTE DEL FENOTIPO. Las claves que devuelve el motor
 *    son «Daltónico (♂)» y «Daltónico (♀)», no «Daltónico» a secas: son dos casillas
 *    distintas y se preguntan por separado. Preguntar «Daltónico» devolvería `ok: false`.
 *
 * 3. GENOTIPO ≠ FENOTIPO. `Aa × Aa` da 3/4 de amarillas (fenotipo) pero solo 2/4 de `Aa`
 *    (genotipo). Cada caso declara en `busca.clase` cuál de los dos pide, y la etiqueta de
 *    la casilla lo repite, porque confundirlos es el error clásico del alumno y no debe
 *    poder confundirlo además el enunciado.
 *
 * 4. EL GENOTIPO SE ESCRIBE CON EL ALELO DOMINANTE PRIMERO (`Aa`, nunca `aA`; `XD Xd`,
 *    nunca `Xd XD`). Lo normaliza `normalizeGenotype`, y en las hembras ligadas al X lo
 *    fijó el Inspector el 20/08/2026.
 *
 * 5. DOMINANCIA INCOMPLETA: el heterocigoto tiene fenotipo PROPIO. En las bocas de dragón
 *    `Rr` no es rojo, es rosa, así que la proporción fenotípica de `Rr × Rr` es 1:2:1 y no
 *    3:1. Es justo el contraejemplo que hace entender la dominancia completa.
 *
 * 6. NADA DE `simulatePopulation`: usa `Math.random()`. Los casos que piden un número de
 *    individuos lo calculan como proporción × población, que es el valor ESPERADO y es
 *    determinista. Un caso que cambiara de respuesta entre dos lecturas rompería la consigna
 *    «haz los casos 3, 7 y 11», que es la razón de ser de todo esto.
 * ────────────────────────────────────────────────────────────────────────────────────────
 */

import {
  ORGANISMS,
  generateMonohybridPunnett,
  generateDihybridPunnett,
  generateSexLinkedPunnett,
} from './components/genetics';
import type { Trait, PunnettResult } from './components/types';
import { formatNumber } from '@/lib';

/** Qué se pregunta: una clave del cuadro, y en qué unidad se responde. */
export interface Busca {
  /** `fenotipo` lee phenotypeRatios; `genotipo` lee genotypeRatios. Ver convenio 3. */
  clase: 'fenotipo' | 'genotipo';
  /** La clave EXACTA que devuelve el motor ('Verde', 'Aa', 'Amarillo / Lisa', 'Daltónico (♂)'). */
  clave: string;
  /** `porcentaje` sobre el total; `individuos` multiplica por `poblacion`. */
  magnitud: 'porcentaje' | 'individuos';
  /** Solo con magnitud 'individuos'. */
  poblacion?: number;
}

/**
 * Unión discriminada por `tipo`. El discriminante es un literal en los tres miembros: sin
 * eso TypeScript no estrecha y `datos.rasgo1` compilaría en una rama que no lo tiene.
 */
export type DatosCaso =
  | {
      tipo: 'monohibrido';
      organismo: string;
      rasgo: string;
      padre: string;
      madre: string;
      busca: Busca;
    }
  | {
      tipo: 'dihibrido';
      organismo: string;
      rasgo1: string;
      rasgo2: string;
      /** Genotipos del progenitor 1 para el rasgo 1 y el rasgo 2. */
      padre1: string;
      padre2: string;
      madre1: string;
      madre2: string;
      busca: Busca;
    }
  | {
      tipo: 'ligado-sexo';
      organismo: string;
      rasgo: string;
      /** Genotipo del progenitor masculino (XD Y / Xd Y). */
      padre: string;
      /** Genotipo del progenitor femenino (XD XD / XD Xd / Xd Xd). */
      madre: string;
      busca: Busca;
    };

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
}

export interface Resolucion {
  ok: boolean;
  valor: number;
  pasos: string[];
  error?: string;
}

/** Busca un rasgo por id de organismo e id de rasgo. Devuelve null, nunca lanza. */
function buscarRasgo(organismoId: string, rasgoId: string): Trait | null {
  const organismo = ORGANISMS.find((o) => o.id === organismoId);
  if (!organismo) return null;
  return organismo.traits.find((t) => t.id === rasgoId) ?? null;
}

/** El cuadro de Punnett que corresponde a estos datos, con el motor de la app. */
function cuadroDe(datos: DatosCaso): { cuadro: PunnettResult; rasgos: Trait[] } | null {
  if (datos.tipo === 'dihibrido') {
    const t1 = buscarRasgo(datos.organismo, datos.rasgo1);
    const t2 = buscarRasgo(datos.organismo, datos.rasgo2);
    if (!t1 || !t2) return null;
    return {
      cuadro: generateDihybridPunnett(datos.padre1, datos.padre2, datos.madre1, datos.madre2, t1, t2),
      rasgos: [t1, t2],
    };
  }

  const t = buscarRasgo(datos.organismo, datos.rasgo);
  if (!t) return null;

  if (datos.tipo === 'ligado-sexo') {
    // El orden importa: el motor necesita saber qué progenitor es el macho (aporta X o Y).
    return {
      cuadro: generateSexLinkedPunnett(datos.padre, datos.madre, t, 'male', 'female'),
      rasgos: [t],
    };
  }

  return { cuadro: generateMonohybridPunnett(datos.padre, datos.madre, t), rasgos: [t] };
}

/**
 * Recalcula la respuesta del caso SIN mirar su campo `respuesta`. Es lo que permite al test
 * cazar un enunciado editado al que se le olvidó actualizar la solución.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const encontrado = cuadroDe(datos);
  if (!encontrado) {
    return { ok: false, valor: NaN, pasos: [], error: 'No existe ese organismo o ese rasgo' };
  }

  const { cuadro } = encontrado;
  const { busca } = datos;

  const fraccion =
    busca.clase === 'fenotipo'
      ? cuadro.phenotypeRatios[busca.clave]?.count
      : cuadro.genotypeRatios[busca.clave];

  if (typeof fraccion !== 'number' || !Number.isFinite(fraccion)) {
    const disponibles =
      busca.clase === 'fenotipo'
        ? Object.keys(cuadro.phenotypeRatios)
        : Object.keys(cuadro.genotypeRatios);
    return {
      ok: false,
      valor: NaN,
      pasos: [],
      error: `El cruce no produce «${busca.clave}». Sí produce: ${disponibles.join(', ')}`,
    };
  }

  const casillas = cuadro.cells.length;
  const aciertos = Math.round(fraccion * casillas);

  const valor =
    busca.magnitud === 'individuos'
      ? fraccion * (busca.poblacion ?? 0)
      : fraccion * 100;

  if (!Number.isFinite(valor)) {
    return { ok: false, valor: NaN, pasos: [], error: 'El resultado no es un número finito' };
  }

  const pasos: string[] = [];
  pasos.push(`Gametos del primer progenitor: ${cuadro.gametes1.join(', ')}`);
  pasos.push(`Gametos del segundo progenitor: ${cuadro.gametes2.join(', ')}`);
  pasos.push(`El cuadro de Punnett tiene ${casillas} casillas, todas igual de probables.`);
  pasos.push(
    `Casillas que dan ${busca.clase === 'fenotipo' ? 'el fenotipo' : 'el genotipo'} «${busca.clave}»: ${aciertos} de ${casillas}.`
  );

  if (busca.magnitud === 'individuos') {
    pasos.push(
      `Proporción esperada: ${aciertos}/${casillas}. Sobre ${busca.poblacion} individuos: ` +
        `${aciertos}/${casillas} × ${busca.poblacion} = ${numero(valor)}.`
    );
  } else {
    pasos.push(`Proporción: ${aciertos}/${casillas} = ${numero(valor)} %.`);
  }

  return { ok: true, valor, pasos };
}

/** Redondeo a 2 decimales, que es la precisión máxima que piden los enunciados. */
function redondear(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * El mismo número, ya escrito PARA LEERSE: con coma decimal y sin decimales de relleno.
 *
 * ⚠️ 14/09/2026 (hallazgo 828) — `redondear` devuelve un number y las plantillas lo
 * interpolaban directamente, así que salía el separador estadounidense: «Proporción: 9/16 =
 * 56.25 %» justo encima de «Respuesta: 56,25», que sí pasa por `formatNumber`. La misma
 * pantalla mezclaba los dos formatos.
 */
function numero(v: number): string {
  return Number.isInteger(v) ? formatNumber(v, 0) : formatNumber(v, 2);
}

/** Tolerancia al corregir: el MAYOR entre 0,01 y el 1 % del valor esperado. */
export function toleranciaDe(valor: number): number {
  return Math.max(0.01, Math.abs(valor) * 0.01);
}

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
  tolerancia: number;
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es número se responde
 * con un veredicto, no con una excepción que tumbaría el render.
 */
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
  if (diferencia <= tolerancia) {
    return { correcto: true, motivo: '¡Correcto!', diferencia, tolerancia };
  }

  return {
    correcto: false,
    motivo: `No es correcto. Te has desviado ${numero(diferencia)} de la respuesta.`,
    diferencia,
    tolerancia,
  };
}

/** Los datos de cada caso. La respuesta NO se escribe aquí: la calcula el motor más abajo. */
const DEFINICIONES: ReadonlyArray<Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>> = [
  {
    id: 1,
    titulo: 'Segunda ley: el cruce de dos híbridos',
    enunciado:
      'En los guisantes, el color amarillo de la semilla (A) domina sobre el verde (a). Se cruzan dos plantas heterocigotas: Aa × Aa. ¿Qué porcentaje de la descendencia tendrá semillas verdes?',
    categoria: 'abstracto',
    datos: {
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'Aa',
      madre: 'Aa',
      busca: { clase: 'fenotipo', clave: 'Verde', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de semillas verdes',
    pista: 'El verde es recesivo: solo aparece cuando se juntan los dos alelos minúsculos.',
  },
  {
    id: 2,
    titulo: 'Genotipo, que no es lo mismo que fenotipo',
    enunciado:
      'En el mismo cruce Aa × Aa de guisantes, no preguntamos por el color sino por el genotipo. ¿Qué porcentaje de la descendencia será heterocigoto, es decir, de genotipo Aa?',
    categoria: 'abstracto',
    datos: {
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'Aa',
      madre: 'Aa',
      busca: { clase: 'genotipo', clave: 'Aa', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de genotipo Aa',
    pista: 'Hay dos casillas del cuadro que llevan un alelo de cada tipo. No confundas 3:1 con 1:2:1.',
  },
  {
    id: 3,
    titulo: 'Primera ley: uniformidad de la primera generación',
    enunciado:
      'Se cruza una planta de guisante de línea pura con semillas amarillas (AA) con otra de línea pura con semillas verdes (aa). ¿Qué porcentaje de la descendencia tendrá semillas amarillas?',
    categoria: 'abstracto',
    datos: {
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'AA',
      madre: 'aa',
      busca: { clase: 'fenotipo', clave: 'Amarillo', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de semillas amarillas',
    pista: 'Cada progenitor solo puede dar un tipo de gameto. ¿Cuántos genotipos distintos salen?',
  },
  {
    id: 4,
    titulo: 'Cruce de prueba: averiguar un genotipo oculto',
    enunciado:
      'Una planta de semilla amarilla puede ser AA o Aa, y a simple vista no se distingue. Para averiguarlo se cruza con una planta verde (aa). Si la planta amarilla resulta ser Aa, ¿qué porcentaje de la descendencia saldrá con semillas verdes?',
    categoria: 'aplicado',
    datos: {
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'color-semilla',
      padre: 'Aa',
      madre: 'aa',
      busca: { clase: 'fenotipo', clave: 'Verde', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de semillas verdes',
    pista: 'La planta verde solo aporta alelos a, así que el resultado lo decide el otro progenitor.',
  },
  {
    id: 5,
    titulo: 'De la proporción al número de plantas',
    enunciado:
      'En los guisantes, la altura alta (T) domina sobre la enana (t). Se cruzan dos plantas altas heterocigotas (Tt × Tt) y se siembran 240 semillas. ¿Cuántas plantas enanas cabe esperar?',
    categoria: 'aplicado',
    datos: {
      tipo: 'monohibrido',
      organismo: 'guisantes',
      rasgo: 'altura-planta',
      padre: 'Tt',
      madre: 'Tt',
      busca: { clase: 'fenotipo', clave: 'Enana', magnitud: 'individuos', poblacion: 240 },
    },
    etiquetaRespuesta: 'plantas enanas de 240',
    pista: 'Calcula primero la proporción de enanas y aplícala al total sembrado.',
  },
  {
    id: 6,
    titulo: 'Tercera ley: dos caracteres a la vez',
    enunciado:
      'Se cruzan dos plantas de guisante heterocigotas para dos caracteres independientes, color y forma de la semilla: AaRr × AaRr. El amarillo (A) domina sobre el verde y la forma lisa (R) sobre la rugosa. ¿Qué porcentaje de la descendencia será a la vez amarilla y lisa?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dihibrido',
      organismo: 'guisantes',
      rasgo1: 'color-semilla',
      rasgo2: 'forma-semilla',
      padre1: 'Aa',
      padre2: 'Rr',
      madre1: 'Aa',
      madre2: 'Rr',
      busca: { clase: 'fenotipo', clave: 'Amarillo / Lisa', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% amarilla y lisa',
    pista: 'El cuadro pasa a tener 16 casillas. La proporción clásica de este cruce es 9:3:3:1.',
  },
  {
    id: 7,
    titulo: 'La casilla más rara del dihíbrido',
    enunciado:
      'En el mismo cruce AaRr × AaRr, ¿qué porcentaje de la descendencia será a la vez verde y rugosa, es decir, recesiva para los dos caracteres?',
    categoria: 'abstracto',
    datos: {
      tipo: 'dihibrido',
      organismo: 'guisantes',
      rasgo1: 'color-semilla',
      rasgo2: 'forma-semilla',
      padre1: 'Aa',
      padre2: 'Rr',
      madre1: 'Aa',
      madre2: 'Rr',
      busca: { clase: 'fenotipo', clave: 'Verde / Rugosa', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% verde y rugosa',
    pista: 'Es el 1 del 9:3:3:1. Solo una de las dieciséis casillas junta los cuatro alelos recesivos.',
  },
  {
    id: 8,
    titulo: 'Contar semillas de una cosecha',
    enunciado:
      'De ese mismo cruce AaRr × AaRr se recogen 320 semillas. ¿Cuántas cabe esperar que sean amarillas y rugosas a la vez?',
    categoria: 'aplicado',
    datos: {
      tipo: 'dihibrido',
      organismo: 'guisantes',
      rasgo1: 'color-semilla',
      rasgo2: 'forma-semilla',
      padre1: 'Aa',
      padre2: 'Rr',
      madre1: 'Aa',
      madre2: 'Rr',
      busca: {
        clase: 'fenotipo',
        clave: 'Amarillo / Rugosa',
        magnitud: 'individuos',
        poblacion: 320,
      },
    },
    etiquetaRespuesta: 'semillas amarillas y rugosas de 320',
    pista: 'Amarilla y rugosa es uno de los dos grupos de 3/16 del 9:3:3:1.',
  },
  {
    id: 9,
    titulo: 'Dominancia incompleta: el híbrido no se parece a ninguno',
    enunciado:
      'En la boca de dragón, el color de la flor tiene dominancia incompleta: RR da flores rojas, rr blancas y el heterocigoto Rr da flores rosas. Se cruzan dos plantas rosas (Rr × Rr). ¿Qué porcentaje de la descendencia tendrá flores rosas?',
    categoria: 'abstracto',
    datos: {
      tipo: 'monohibrido',
      organismo: 'flores',
      rasgo: 'color-flor',
      padre: 'Rr',
      madre: 'Rr',
      busca: { clase: 'fenotipo', clave: 'Rosa', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de flores rosas',
    pista: 'Aquí la proporción fenotípica no es 3:1, porque el heterocigoto tiene color propio.',
  },
  {
    id: 10,
    titulo: 'Dominancia incompleta en la primera generación',
    enunciado:
      'Se cruza una boca de dragón de flores rojas de línea pura (RR) con otra de flores blancas de línea pura (rr). ¿Qué porcentaje de la descendencia tendrá flores rosas?',
    categoria: 'abstracto',
    datos: {
      tipo: 'monohibrido',
      organismo: 'flores',
      rasgo: 'color-flor',
      padre: 'RR',
      madre: 'rr',
      busca: { clase: 'fenotipo', clave: 'Rosa', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de flores rosas',
    pista: 'Toda la descendencia hereda un alelo de cada progenitor. ¿Qué genotipo es ese?',
  },
  {
    id: 11,
    titulo: 'Herencia ligada al cromosoma X',
    enunciado:
      'El daltonismo se hereda ligado al cromosoma X y es recesivo. Un varón daltónico (Xd Y) tiene descendencia con una mujer portadora sana (XD Xd). ¿Qué porcentaje del total de la descendencia serán hijas daltónicas?',
    categoria: 'aplicado',
    datos: {
      tipo: 'ligado-sexo',
      organismo: 'humanos',
      rasgo: 'daltonismo',
      padre: 'Xd Y',
      madre: 'XD Xd',
      busca: { clase: 'fenotipo', clave: 'Daltónico (♀)', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de hijas daltónicas',
    pista:
      'Una hija necesita el alelo d por partida doble: uno del padre y otro de la madre. Cuenta sobre las cuatro casillas, no solo sobre las hijas.',
  },
  {
    id: 12,
    titulo: 'Cuando la madre es la afectada',
    enunciado:
      'Una mujer daltónica (Xd Xd) tiene descendencia con un varón de visión normal (XD Y). ¿Qué porcentaje del total de la descendencia serán hijos varones daltónicos?',
    categoria: 'aplicado',
    datos: {
      tipo: 'ligado-sexo',
      organismo: 'humanos',
      rasgo: 'daltonismo',
      padre: 'XD Y',
      madre: 'Xd Xd',
      busca: { clase: 'fenotipo', clave: 'Daltónico (♂)', magnitud: 'porcentaje' },
    },
    etiquetaRespuesta: '% de hijos varones daltónicos',
    pista:
      'El varón recibe su único X de la madre, y ella solo puede darle Xd. La mitad de la descendencia son varones.',
  },
];

/** Texto legible de la respuesta, con formato español (coma decimal). */
function formatearRespuesta(valor: number, etiqueta: string): string {
  const n = redondear(valor);
  const texto = n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  return `${texto} ${etiqueta.replace(/^% /, '% ')}`.trim();
}

/**
 * Los 12 casos, con la respuesta YA CALCULADA por el motor de la app. Si un cruce no se
 * puede resolver, el caso sale con respuesta NaN en vez de tumbar el módulo: el test lo
 * caza (invariante 4) y la vista lo puede pintar.
 */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  return {
    ...def,
    respuesta: r.ok ? redondear(r.valor) : NaN,
    respuestaTexto: r.ok ? formatearRespuesta(r.valor, def.etiquetaRespuesta) : (r.error ?? 'Sin solución'),
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS = CASOS.length;

/* ─────────────────────────── Modo práctica (aleatorio) ─────────────────────────── */

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32), y no es un adorno. Sembrando
 * xorshift32 directamente con 1, 2, 3… los primeros valores salen diminutos y muy
 * parecidos entre sí, así que `Math.floor(rnd() * n)` daba el índice 0 para todas las
 * semillas pequeñas: el «aleatorio» devolvía SIEMPRE el mismo ejercicio. Pasó la prueba de
 * reproducibilidad —era reproducible, desde luego— y solo se vio al pedirle seis semillas
 * seguidas y comparar las respuestas entre sí.
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

const GENOTIPOS_MONO = ['AA', 'Aa', 'aa'] as const;
const FENOTIPO_DE_BUSQUEDA = ['Amarillo', 'Verde'] as const;

/**
 * Las combinaciones que SÍ producen el fenotipo que preguntan, calculadas una sola vez con
 * el propio `resolverCaso`. Preguntar por un fenotipo que el cruce no da (`AA × AA` → verde)
 * tiene respuesta 0 y no enseña nada, así que esas quedan fuera de la baraja.
 *
 * ⚠️ La primera versión hacía esta criba dentro de la función, con un triple bucle cuyo
 * `break` solo salía del interior: el generador devolvía 100 con TODAS las semillas, y eso
 * no lo habría visto nadie —el ejercicio era válido, solo que siempre el mismo— si la
 * verificación no hubiera pedido seis semillas seguidas en vez de una.
 */
const COMBINACIONES: ReadonlyArray<{ padre: string; madre: string; clave: string }> = (() => {
  const validas: Array<{ padre: string; madre: string; clave: string }> = [];
  for (const padre of GENOTIPOS_MONO) {
    for (const madre of GENOTIPOS_MONO) {
      for (const clave of FENOTIPO_DE_BUSQUEDA) {
        const r = resolverCaso({
          tipo: 'monohibrido',
          organismo: 'guisantes',
          rasgo: 'color-semilla',
          padre,
          madre,
          busca: { clase: 'fenotipo', clave, magnitud: 'porcentaje' },
        });
        if (r.ok && r.valor > 0) validas.push({ padre, madre, clave });
      }
    }
  }
  return validas;
})();

/**
 * Ejercicio aleatorio de cruce monohíbrido. Usa EL MISMO `resolverCaso` que los 12 fijos:
 * si divergieran, el alumno entrenaría con una regla y sería corregido con otra.
 */
export function generarEjercicioAleatorio(semilla = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const elegida =
    COMBINACIONES[Math.floor(rnd() * COMBINACIONES.length)] ?? COMBINACIONES[0];

  const { padre, madre, clave } = elegida;

  const datos: DatosCaso = {
    tipo: 'monohibrido',
    organismo: 'guisantes',
    rasgo: 'color-semilla',
    padre,
    madre,
    busca: { clase: 'fenotipo', clave, magnitud: 'porcentaje' },
  };

  const r = resolverCaso(datos);

  return {
    enunciado: `En los guisantes, el amarillo (A) domina sobre el verde (a). Se cruza ${padre} × ${madre}. ¿Qué porcentaje de la descendencia tendrá semillas de color ${clave.toLowerCase()}?`,
    datos,
    respuesta: r.ok ? redondear(r.valor) : NaN,
    etiquetaRespuesta: `% de semillas de color ${clave.toLowerCase()}`,
    pasos: r.pasos,
  };
}
