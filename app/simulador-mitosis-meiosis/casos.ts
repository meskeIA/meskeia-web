/**
 * Casos de aula de simulador-mitosis-meiosis — 12 recuentos fijos con respuesta comprobable.
 *
 * POR QUÉ ESTE FICHERO VIVE FUERA DE LA VISTA
 * El build compila `page.tsx` sin comprobar si la biología está bien: un recuento mal hecho
 * no rompe nada, simplemente corrige mal al alumno. Aquí no hay React ni DOM, así que se
 * puede probar sin navegador.
 *
 * LA REGLA DE ORO: NO SE REPLICA NADA
 * Todo el recuento sale de `./motor.ts`, el MISMO módulo con el que la app decide qué pinta
 * en cada fase: `cromosomasPorPolo`, `cromosomasEnLaCelula`, `recuentoTotal`,
 * `cromatidasPorCromosoma`, `gametosDistintosPorReparto`. Aquí no hay ni una fórmula propia.
 * Las magnitudes que el motor no tenía (cromátidas, gametos distintos, no disyunción) se
 * AÑADIERON allí, no se escribieron aquí: si los casos contaran con un convenio y la app con
 * otro, la app acabaría suspendiendo una respuesta que ella misma produce.
 *
 * ═════════════════════════════════════════════════════════════════════════════════════════
 * EL CONVENIO DE ESTA APP (léelo antes de tocar un enunciado)
 *
 * 1. CROMOSOMA ≠ CROMÁTIDA, y es justo lo que el alumno falla.
 *    Un cromosoma con dos cromátidas hermanas unidas por el centrómero sigue siendo UN
 *    cromosoma, no dos. Cuentan los CENTRÓMEROS, no los brazos. Por eso cada enunciado dice
 *    EXPLÍCITAMENTE, en mayúsculas, si pide CROMOSOMAS o CROMÁTIDAS: la ambigüedad da dos
 *    números legítimos que se diferencian en un factor 2 (o en un factor 1, según la fase),
 *    y corregir sobre una pregunta ambigua es peor que no corregir.
 *
 * 2. EN QUÉ FASES LOS CROMOSOMAS ESTÁN DUPLICADOS. El motor NO lo modelaba: se derivó de la
 *    secuencia en `cromatidasPorCromosoma(fases, indice)`, y este es el convenio que fija.
 *
 *      MITOSIS   Interfase → indefinido (la fase ABARCA la duplicación; ningún caso pregunta)
 *                Profase, Metafase ................ 2 cromátidas por cromosoma
 *                Anafase, Telofase, Citocinesis ... 1 (las hermanas ya se separaron)
 *
 *      MEIOSIS   Interfase → indefinido
 *                Profase I, Metafase I, Anafase I, Telofase I ... 2
 *                Profase II, Metafase II ........................ 2  ← NO hay duplicación
 *                                                                    entre meiosis I y II
 *                Anafase II, Telofase II ........................ 1
 *
 *    Separar HOMÓLOGOS no toca las cromátidas; separar HERMANAS sí, y desde ese momento cada
 *    cromátida es un cromosoma independiente de una sola cromátida.
 *
 * 3. «POR POLO» NO ES «EN LA CÉLULA». Durante la anafase y la telofase la célula todavía no
 *    se ha partido, así que los dos polos siguen dentro de ella: hay el DOBLE de cromosomas
 *    que los que recibe cada polo. `cromosomasPorPolo` responde lo primero y
 *    `cromosomasEnLaCelula` lo segundo; `recuentoTotal` suma además todas las células de la
 *    fase. Cada enunciado dice cuál de las tres cosas pide.
 *
 * 4. QUÉ SE SEPARA DECIDE SI EL RECUENTO BAJA. Al separarse HOMÓLOGOS cada polo recibe la
 *    MITAD (división reduccional, 2n → n: solo pasa en la anafase I). Al separarse CROMÁTIDAS
 *    HERMANAS cada polo recibe TANTOS COMO HABÍA, porque cada cromosoma se parte en dos
 *    cromosomas hijos: el recuento no baja (anafase de la mitosis y anafase II). Esa es la
 *    diferencia entre la mitosis y la meiosis I, y es la pareja de casos 3 y 4.
 *
 * 5. TODO CASO DECLARA EL 2n DEL ORGANISMO. Las fases del motor traen el organismo modelo
 *    (2n = 4) y los casos lo escalan con `escalarFase`, que es puro y paramétrico: la
 *    respuesta sale de EJECUTAR el modelo de la app con otro 2n, nunca de una tabla escrita a
 *    mano. El 2n ha de ser un entero par ≥ 2.
 *
 * 6. LOS GAMETOS DISTINTOS SON SOLO LOS DEL REPARTO AL AZAR (2^n). No se cuenta el
 *    crossing-over, que multiplicaría las combinaciones; el enunciado lo dice.
 * ═════════════════════════════════════════════════════════════════════════════════════════
 */

import { formatNumber } from '@/lib';
import {
  FASES_MEIOSIS,
  FASES_MITOSIS,
  cromatidasPorCromosoma,
  cromosomasEnLaCelula,
  cromosomasPorPolo,
  cromosomasPorPoloConNoDisyuncion,
  escalarFase,
  gametosDistintosPorReparto,
  recuentoTotal,
  type FaseConfig,
} from './motor';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Division = 'mitosis' | 'meiosis';

/** Qué se cuenta. Cada valor dice a la vez QUÉ (cromosomas/cromátidas) y DÓNDE (polo/célula). */
export type Magnitud =
  | 'cromosomas-por-polo'
  | 'cromatidas-por-polo'
  | 'cromosomas-en-celula'
  | 'cromatidas-en-celula'
  | 'cromosomas-totales'
  | 'celulas'
  | 'gametos-distintos'
  | 'cromosomas-gameto-no-disyuncion';

export interface DatosCaso {
  division: Division;
  /** `id` de una fase de FASES_MITOSIS o FASES_MEIOSIS ('metafase', 'anafase-i'…). */
  faseId: string;
  /** 2n del organismo del enunciado: entero par ≥ 2. */
  dosN: number;
  magnitud: Magnitud;
  /** Solo con `cromosomas-gameto-no-disyuncion`: cuántos elementos no se separan. */
  paresFallidos?: number;
  /** Solo con `cromosomas-gameto-no-disyuncion`: true = el polo que los recibe de más. */
  recibeDeMas?: boolean;
}

export interface Caso {
  id: number;
  titulo: string;
  enunciado: string;
  categoria: 'abstracto' | 'aplicado';
  datos: DatosCaso;
  /** Qué se escribe en la casilla. NUNCA vacía. */
  etiquetaRespuesta: string;
  /** La calcula `resolverCaso` ejecutando el motor. JAMÁS se escribe a mano. */
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

// ─── Utilidades de formato (nada de cálculo) ─────────────────────────────────

/** Un entero escrito en formato español (miles con punto). */
function ent(v: number): string {
  return Number.isFinite(v) ? formatNumber(v, 0) : 'no definido';
}

/** El nombre humano de la fase, tal y como lo rotula la app. */
function faseDe(division: Division, faseId: string): { fase: FaseConfig; indice: number } | null {
  const lista = division === 'mitosis' ? FASES_MITOSIS : FASES_MEIOSIS;
  const indice = lista.findIndex((f) => f.id === faseId);
  return indice < 0 ? null : { fase: lista[indice], indice };
}

function fallo(error: string): Resolucion {
  return { ok: false, valor: NaN, pasos: [], error };
}

/** Frase que describe qué se separa, para los pasos. */
function frasSeparacion(fase: FaseConfig): string {
  const que =
    fase.separacion === 'homologos' ? 'los cromosomas homólogos' : 'las cromátidas hermanas';
  const cuando = fase.disposicion === 'separando' ? 'se separan' : 'acaban de separarse';
  return `En la ${fase.nombre} ${cuando} ${que}.`;
}

// ─── El resolutor ────────────────────────────────────────────────────────────

/**
 * Recalcula la respuesta del caso SIN mirar su campo `respuesta`, ejecutando el motor de la
 * app sobre una copia de la fase escalada al 2n del enunciado.
 *
 * Nunca lanza: un dato imposible sale como `{ ok: false, error }` y un valor no calculable
 * como NaN. Un `throw` dentro de un render de React tumbaría la app entera.
 */
export function resolverCaso(datos: DatosCaso): Resolucion {
  const encontrada = faseDe(datos.division, datos.faseId);
  if (!encontrada) {
    return fallo(`La ${datos.division} no tiene ninguna fase con id «${datos.faseId}»`);
  }

  const { fase: original, indice } = encontrada;
  const lista = datos.division === 'mitosis' ? FASES_MITOSIS : FASES_MEIOSIS;
  const fase = escalarFase(original, datos.dosN);
  if (!fase) {
    return fallo('El 2n del organismo debe ser un número entero y par (2, 4, 6, 8…)');
  }

  const n = datos.dosN / 2;
  const cromatidas = cromatidasPorCromosoma(lista, indice);
  const tienePolos = fase.disposicion === 'separando' || fase.disposicion === 'polos';

  const pasos: string[] = [
    `${datos.division === 'mitosis' ? 'Mitosis' : 'Meiosis'} de un organismo con 2n = ${ent(
      datos.dosN
    )} (n = ${ent(n)}). Fase: ${fase.nombre}.`,
  ];

  switch (datos.magnitud) {
    case 'cromosomas-por-polo': {
      if (!tienePolos) return fallo(`La ${fase.nombre} no tiene polos: ahí nada se está separando`);
      const valor = cromosomasPorPolo(fase);
      pasos.push(frasSeparacion(fase));
      if (fase.separacion === 'homologos') {
        pasos.push(
          `Al separarse los homólogos cada polo recibe la MITAD de los ${ent(
            fase.cromosomasPorCelula
          )} cromosomas de la placa: ${ent(fase.cromosomasPorCelula)} ÷ 2 = ${ent(valor)}.`
        );
        pasos.push('Es la división reduccional: es aquí, y solo aquí, donde 2n baja a n.');
      } else {
        pasos.push(
          `Al separarse las cromátidas hermanas cada cromosoma se parte en dos cromosomas hijos, así que cada polo recibe TANTOS COMO HABÍA: ${ent(
            valor
          )}.`
        );
        pasos.push('El recuento no baja: esta separación es ecuacional, no reduccional.');
      }
      return { ok: true, valor, pasos };
    }

    case 'cromatidas-por-polo': {
      if (!tienePolos) return fallo(`La ${fase.nombre} no tiene polos: ahí nada se está separando`);
      if (!Number.isFinite(cromatidas)) {
        return fallo('En la interfase el número de cromátidas no está definido: la fase abarca la duplicación');
      }
      const porPolo = cromosomasPorPolo(fase);
      const valor = porPolo * cromatidas;
      pasos.push(frasSeparacion(fase));
      pasos.push(`Cada polo recibe ${ent(porPolo)} cromosomas.`);
      pasos.push(
        cromatidas === 2
          ? 'En esta fase cada cromosoma conserva sus DOS cromátidas hermanas: solo se separaron los homólogos.'
          : 'En esta fase cada cromosoma tiene UNA sola cromátida: las hermanas ya se separaron.'
      );
      pasos.push(`${ent(porPolo)} × ${ent(cromatidas)} = ${ent(valor)} cromátidas por polo.`);
      return { ok: true, valor, pasos };
    }

    case 'cromosomas-en-celula': {
      const valor = cromosomasEnLaCelula(fase);
      if (tienePolos) {
        pasos.push(
          `La célula TODAVÍA no se ha partido: los dos polos siguen dentro de ella, con ${ent(
            cromosomasPorPolo(fase)
          )} cromosomas cada uno.`
        );
        pasos.push(`${ent(cromosomasPorPolo(fase))} × 2 = ${ent(valor)} cromosomas en esa célula.`);
      } else {
        pasos.push(`En la ${fase.nombre} hay ${ent(valor)} cromosomas en cada célula.`);
        if (fase.celulas > 1) {
          pasos.push(`Y hay ${ent(fase.celulas)} células, cada una con esos ${ent(valor)}.`);
        }
      }
      return { ok: true, valor, pasos };
    }

    case 'cromatidas-en-celula': {
      if (!Number.isFinite(cromatidas)) {
        return fallo('En la interfase el número de cromátidas no está definido: la fase abarca la duplicación');
      }
      const cromosomas = cromosomasEnLaCelula(fase);
      const valor = cromosomas * cromatidas;
      pasos.push(`Cromosomas en esa célula: ${ent(cromosomas)}.`);
      pasos.push(
        cromatidas === 2
          ? 'Cada uno se duplicó en la interfase y conserva sus DOS cromátidas hermanas unidas por el centrómero.'
          : 'Cada uno tiene UNA sola cromátida: las hermanas ya se separaron y cada una es ya un cromosoma.'
      );
      pasos.push(`${ent(cromosomas)} × ${ent(cromatidas)} = ${ent(valor)} cromátidas.`);
      return { ok: true, valor, pasos };
    }

    case 'cromosomas-totales': {
      const valor = recuentoTotal(fase);
      pasos.push(
        `Hay ${ent(fase.celulas)} ${fase.celulas === 1 ? 'célula' : 'células'} y ${ent(
          cromosomasEnLaCelula(fase)
        )} cromosomas en cada una.`
      );
      pasos.push(
        `${ent(fase.celulas)} × ${ent(cromosomasEnLaCelula(fase))} = ${ent(valor)} cromosomas en total.`
      );
      return { ok: true, valor, pasos };
    }

    case 'celulas': {
      const valor = fase.celulas;
      pasos.push(
        `Al llegar a la ${fase.nombre} hay ${ent(valor)} ${valor === 1 ? 'célula' : 'células'}.`
      );
      return { ok: true, valor, pasos };
    }

    case 'gametos-distintos': {
      if (datos.division !== 'meiosis') {
        return fallo('Solo la meiosis produce gametos: la mitosis da células idénticas a la madre');
      }
      const valor = gametosDistintosPorReparto(datos.dosN);
      if (!Number.isFinite(valor)) return fallo('Ese 2n da un número de combinaciones inabarcable');
      pasos.push(`El organismo tiene n = ${ent(datos.dosN)} ÷ 2 = ${ent(n)} pares de homólogos.`);
      pasos.push(
        'En la metafase I cada par se orienta al azar e independientemente de los demás: cada par aporta 2 posibilidades.'
      );
      pasos.push(`2^${ent(n)} = ${ent(valor)} gametos genéticamente distintos.`);
      pasos.push('Es una cota por lo bajo: el crossing-over multiplica todavía más las combinaciones.');
      return { ok: true, valor, pasos };
    }

    case 'cromosomas-gameto-no-disyuncion': {
      if (!tienePolos) return fallo(`La ${fase.nombre} no tiene polos: ahí nada se está separando`);
      const fallidos = datos.paresFallidos ?? 1;
      const deMas = datos.recibeDeMas ?? true;
      const valor = cromosomasPorPoloConNoDisyuncion(fase, fallidos, deMas);
      if (!Number.isFinite(valor)) return fallo('Esa no disyunción no deja un número válido de cromosomas');
      const base = cromosomasPorPolo(fase);
      pasos.push(frasSeparacion(fase));
      pasos.push(`Si todo fuera bien, cada polo recibiría ${ent(base)} cromosomas.`);
      pasos.push(
        `Con ${ent(fallidos)} ${
          fase.separacion === 'homologos' ? 'par de homólogos que no se separa' : 'cromosoma cuyas hermanas no se separan'
        }, el polo que ${deMas ? 'lo recibe de más' : 'se queda sin él'} acaba con ${ent(base)} ${
          deMas ? '+' : '−'
        } ${ent(fallidos)} = ${ent(valor)} cromosomas.`
      );
      pasos.push('El otro polo queda con la cifra contraria: de ahí salen gametos n+1 y n−1.');
      return { ok: true, valor, pasos };
    }

    default:
      return fallo('Magnitud desconocida');
  }
}

// ─── Los 12 casos ────────────────────────────────────────────────────────────

/** Etiqueta genérica de una magnitud, para el modo práctica. Nunca vacía. */
function etiquetaDe(magnitud: Magnitud): string {
  switch (magnitud) {
    case 'cromosomas-por-polo':
      return 'cromosomas por polo';
    case 'cromatidas-por-polo':
      return 'cromátidas por polo';
    case 'cromosomas-en-celula':
      return 'cromosomas por célula';
    case 'cromatidas-en-celula':
      return 'cromátidas por célula';
    case 'cromosomas-totales':
      return 'cromosomas en total';
    case 'celulas':
      return 'células';
    case 'gametos-distintos':
      return 'gametos distintos';
    case 'cromosomas-gameto-no-disyuncion':
      return 'cromosomas del gameto';
    default:
      return 'unidades';
  }
}

type Definicion = Omit<Caso, 'respuesta' | 'respuestaTexto' | 'pasos'>;

/**
 * Los 12 enunciados. DETERMINISTAS: el caso 3 es el mismo para todos los alumnos y en todas
 * las lecturas, que es lo único que hace funcionar la consigna «resuelve los casos 3, 7 y 11».
 *
 * Cada enunciado dice las cuatro cosas que lo hacen inequívoco: qué división, qué fase, cuál
 * es el 2n del organismo, y si se piden CROMOSOMAS o CROMÁTIDAS, por polo o en la célula.
 */
const DEFINICIONES: readonly Definicion[] = [
  {
    id: 1,
    titulo: 'Contar cromosomas en la placa',
    enunciado:
      'Una célula con 2n = 8 se divide por MITOSIS. En la METAFASE todos los cromosomas están alineados uno a uno en la placa ecuatorial. ¿Cuántos CROMOSOMAS (no cromátidas) hay alineados en esa placa?',
    categoria: 'abstracto',
    datos: { division: 'mitosis', faseId: 'metafase', dosN: 8, magnitud: 'cromosomas-en-celula' },
    etiquetaRespuesta: 'cromosomas en la placa',
    pista:
      'En la mitosis no hay apareamiento de homólogos: la célula llega a la metafase con todos los cromosomas que tenía.',
  },
  {
    id: 2,
    titulo: 'La misma placa, contando cromátidas',
    enunciado:
      'La misma célula con 2n = 8, en la misma METAFASE de la MITOSIS. Cada cromosoma se duplicó en la interfase y conserva sus dos cromátidas hermanas unidas por el centrómero. Ahora cuenta CROMÁTIDAS: ¿cuántas hay en esa célula?',
    categoria: 'abstracto',
    datos: { division: 'mitosis', faseId: 'metafase', dosN: 8, magnitud: 'cromatidas-en-celula' },
    etiquetaRespuesta: 'cromátidas en la célula',
    pista:
      'Un cromosoma con dos cromátidas sigue siendo UN cromosoma: el caso 1 y este cuentan cosas distintas sobre el MISMO dibujo.',
  },
  {
    id: 3,
    titulo: 'Anafase de la mitosis: ¿baja el recuento?',
    enunciado:
      'En la ANAFASE de la MITOSIS de una célula con 2n = 8 se separan las cromátidas hermanas y cada una migra hacia un polo. ¿Cuántos CROMOSOMAS (no cromátidas) recibe CADA POLO?',
    categoria: 'abstracto',
    datos: { division: 'mitosis', faseId: 'anafase', dosN: 8, magnitud: 'cromosomas-por-polo' },
    etiquetaRespuesta: 'cromosomas por polo',
    pista:
      'Al separarse, cada cromátida pasa a ser un cromosoma independiente. Cuenta centrómeros en un polo, no brazos.',
  },
  {
    id: 4,
    titulo: 'Anafase I: lo que sí reduce',
    enunciado:
      'En la ANAFASE I de la MEIOSIS de una célula con 2n = 8 se separan los cromosomas HOMÓLOGOS —no las cromátidas hermanas, que siguen unidas—. ¿Cuántos CROMOSOMAS recibe CADA POLO?',
    categoria: 'abstracto',
    datos: { division: 'meiosis', faseId: 'anafase-i', dosN: 8, magnitud: 'cromosomas-por-polo' },
    etiquetaRespuesta: 'cromosomas por polo',
    pista:
      'Compara con el caso 3: mismo 2n, misma «anafase», pero lo que se separa no es lo mismo. Solo una de las dos reduce.',
  },
  {
    id: 5,
    titulo: 'Después de la anafase I siguen duplicados',
    enunciado:
      'En esa misma ANAFASE I (2n = 8), las cromátidas hermanas NO se han separado: cada cromosoma que llega al polo sigue teniendo dos. ¿Cuántas CROMÁTIDAS hay en CADA POLO?',
    categoria: 'abstracto',
    datos: { division: 'meiosis', faseId: 'anafase-i', dosN: 8, magnitud: 'cromatidas-por-polo' },
    etiquetaRespuesta: 'cromátidas por polo',
    pista:
      'Toma la respuesta del caso 4 y multiplícala por las cromátidas que tiene cada uno de esos cromosomas. Esta es la razón de que haga falta una meiosis II.',
  },
  {
    id: 6,
    titulo: 'Entre la meiosis I y la II no hay duplicación',
    enunciado:
      'Un animal tiene 2n = 12. Una de sus células entra en MEIOSIS y llega a la METAFASE II. Entre la meiosis I y la II NO hay una nueva duplicación del ADN. ¿Cuántas CROMÁTIDAS hay en cada una de esas células?',
    categoria: 'abstracto',
    datos: { division: 'meiosis', faseId: 'metafase-ii', dosN: 12, magnitud: 'cromatidas-en-celula' },
    etiquetaRespuesta: 'cromátidas por célula',
    pista:
      'Primero cuenta los cromosomas que hay en una célula tras la meiosis I, y luego cuántas cromátidas tiene cada uno.',
  },
  {
    id: 7,
    titulo: 'Anafase II: el recuento vuelve a no bajar',
    enunciado:
      'En ese mismo animal con 2n = 12, en la ANAFASE II de la MEIOSIS se separan las cromátidas hermanas dentro de cada una de las dos células. ¿Cuántos CROMOSOMAS recibe CADA POLO?',
    categoria: 'abstracto',
    datos: { division: 'meiosis', faseId: 'anafase-ii', dosN: 12, magnitud: 'cromosomas-por-polo' },
    etiquetaRespuesta: 'cromosomas por polo',
    pista:
      'La anafase II funciona igual que la anafase de la mitosis (caso 3), solo que en células que ya son haploides.',
  },
  {
    id: 8,
    titulo: 'Por qué cuatro células y no dos',
    enunciado:
      'Un espermatocito de ese mismo animal (2n = 12) completa la MEIOSIS entera hasta la TELOFASE II / citocinesis II. ¿Cuántas CÉLULAS hijas hay al terminar?',
    categoria: 'aplicado',
    datos: { division: 'meiosis', faseId: 'telofase-ii', dosN: 12, magnitud: 'celulas' },
    etiquetaRespuesta: 'células hijas',
    pista: 'La meiosis encadena DOS divisiones seguidas con una sola duplicación del ADN.',
  },
  {
    id: 9,
    titulo: 'Cerrar una herida',
    enunciado:
      'Una célula de la piel de la especie humana (2n = 46) se divide por MITOSIS para reparar una herida. Al terminar la CITOCINESIS, ¿cuántos CROMOSOMAS tiene CADA una de las células hijas?',
    categoria: 'aplicado',
    datos: { division: 'mitosis', faseId: 'citocinesis', dosN: 46, magnitud: 'cromosomas-en-celula' },
    etiquetaRespuesta: 'cromosomas por célula hija',
    pista: 'La mitosis produce células idénticas a la madre: es la división que NO reduce.',
  },
  {
    id: 10,
    titulo: 'La dotación de un gameto',
    enunciado:
      'En la especie humana (2n = 46), una célula germinal completa la MEIOSIS hasta la TELOFASE II. ¿Cuántos CROMOSOMAS tiene CADA una de las células resultantes, que son las que pueden convertirse en gametos?',
    categoria: 'aplicado',
    datos: { division: 'meiosis', faseId: 'telofase-ii', dosN: 46, magnitud: 'cromosomas-en-celula' },
    etiquetaRespuesta: 'cromosomas por gameto',
    pista:
      'Al fusionarse dos gametos la especie tiene que recuperar sus 46: cada uno aporta la mitad.',
  },
  {
    id: 11,
    titulo: 'Cuando un par no se separa',
    enunciado:
      'En la especie humana (2n = 46) ocurre una no disyunción: en la ANAFASE I un par de homólogos no se separa y los dos se van juntos al MISMO polo. ¿Cuántos CROMOSOMAS tendrá el gameto que procede de ese polo, el que recibió el par de más?',
    categoria: 'aplicado',
    datos: {
      division: 'meiosis',
      faseId: 'anafase-i',
      dosN: 46,
      magnitud: 'cromosomas-gameto-no-disyuncion',
      paresFallidos: 1,
      recibeDeMas: true,
    },
    etiquetaRespuesta: 'cromosomas del gameto',
    pista:
      'Calcula primero cuántos cromosomas tendría ese polo si todo hubiera ido bien, y súmale el cromosoma de más.',
  },
  {
    id: 12,
    titulo: 'Cuántos gametos distintos salen del azar',
    enunciado:
      'La mosca del vinagre (Drosophila melanogaster) tiene 2n = 8. En la metafase I cada par de homólogos se orienta al azar e independientemente de los demás. Sin contar el crossing-over, ¿cuántos gametos GENÉTICAMENTE DISTINTOS puede producir un individuo solo por ese reparto?',
    categoria: 'aplicado',
    datos: { division: 'meiosis', faseId: 'telofase-ii', dosN: 8, magnitud: 'gametos-distintos' },
    etiquetaRespuesta: 'gametos distintos',
    pista: 'Cada par aporta 2 posibilidades y los pares son independientes: multiplica, no sumes.',
  },
];

/** El número y su etiqueta juntos, en formato español. La unidad nunca se recorta. */
export function textoRespuesta(valor: number, etiqueta: string): string {
  if (!Number.isFinite(valor)) return 'Sin solución';
  return `${ent(valor)} ${etiqueta}`.trim();
}

/**
 * Los 12 casos con la respuesta YA CALCULADA por el motor. Si un caso no se pudiera resolver
 * sale con `respuesta: NaN` en vez de tumbar el módulo: la vista lo puede pintar y un test lo
 * caza.
 */
export const CASOS: readonly Caso[] = DEFINICIONES.map((def) => {
  const r = resolverCaso(def.datos);
  return {
    ...def,
    respuesta: r.ok ? r.valor : NaN,
    respuestaTexto: r.ok
      ? textoRespuesta(r.valor, def.etiquetaRespuesta)
      : (r.error ?? 'Sin solución'),
    pasos: r.pasos,
  };
});

export const TOTAL_CASOS: number = CASOS.length;

// ─── Corrección ──────────────────────────────────────────────────────────────

export interface Veredicto {
  correcto: boolean;
  motivo: string;
  diferencia: number;
}

/** Contrapartida de una magnitud: la misma pregunta contando la otra cosa. */
const CONTRAPARTIDA: Partial<Record<Magnitud, Magnitud>> = {
  'cromosomas-por-polo': 'cromatidas-por-polo',
  'cromosomas-en-celula': 'cromatidas-en-celula',
  'cromatidas-por-polo': 'cromosomas-por-polo',
  'cromatidas-en-celula': 'cromosomas-en-celula',
};

/** Recalcula con el MISMO motor otra magnitud del mismo enunciado; NaN si no procede. */
function otraMagnitud(datos: DatosCaso, magnitud: Magnitud): number {
  const r = resolverCaso({ ...datos, magnitud });
  return r.ok ? r.valor : NaN;
}

const NO_ES = 'No es correcto.';

/**
 * Diagnostica el error a partir del número que ha dado el alumno, pero SOLO con las lecturas
 * alternativas que el propio enunciado admite. Cada una se recalcula con el motor (contar
 * cromátidas donde se piden cromosomas, sumar las dos células, no aplicar la reducción…), y el
 * mensaje solo sale si el número del alumno coincide con ESA lectura.
 *
 * ⚠️ 26/09/2026 (hallazgo 2152) — antes bastaba con que el número fuera el doble o la mitad
 * del esperado, sin mirar la pregunta, y el alumno repasaba lo que no tocaba: «8» en el caso de
 * los gametos (2 × 4 en vez de 2^4) recibía la explicación de los polos, y «46» en el del
 * gameto humano (no haber reducido) la de cromosomas frente a cromátidas.
 */
function diagnostico(usuario: number, esperado: number, datos: DatosCaso): string | null {
  const encontrada = faseDe(datos.division, datos.faseId);
  if (!encontrada) return null;
  const fase = escalarFase(encontrada.fase, datos.dosN);
  if (!fase) return null;
  const n = datos.dosN / 2;
  const tienePolos = fase.disposicion === 'separando' || fase.disposicion === 'polos';

  switch (datos.magnitud) {
    case 'gametos-distintos':
      if (usuario === n * 2) {
        return `${NO_ES} Has multiplicado n × 2. Cada uno de los ${ent(n)} pares aporta 2 posibilidades y los pares son independientes: las posibilidades se MULTIPLICAN entre sí, 2 × 2 × … × 2 (${ent(n)} veces) = 2^${ent(n)}.`;
      }
      if (usuario === n) {
        return `${NO_ES} ${ent(n)} es el número de pares de homólogos, no de combinaciones: cada par aporta 2 posibilidades, así que hay que elevar 2 a ese número.`;
      }
      return null;

    case 'celulas':
      if (datos.division === 'meiosis' && usuario * 2 === esperado) {
        return `${NO_ES} Te has quedado en la meiosis I. La meiosis encadena DOS divisiones: la meiosis II vuelve a dividir cada una de las células que salieron de la primera.`;
      }
      return null;

    case 'cromosomas-por-polo':
    case 'cromosomas-en-celula':
    case 'cromatidas-por-polo':
    case 'cromatidas-en-celula': {
      const pideCromatidas = datos.magnitud.startsWith('cromatidas');
      const contrapartida = CONTRAPARTIDA[datos.magnitud];
      const otra = contrapartida ? otraMagnitud(datos, contrapartida) : NaN;
      const confundeCosa = Number.isFinite(otra) && otra !== esperado && usuario === otra;
      // Tras la anafase I la célula ya es haploide: dar el 2n es no haber aplicado la reducción.
      const noReduce =
        !pideCromatidas &&
        datos.division === 'meiosis' &&
        esperado < datos.dosN &&
        usuario === datos.dosN;

      if (confundeCosa && noReduce) {
        return `${NO_ES} ${ent(usuario)} serían las cromátidas, o los cromosomas si no hubiera reducción. En la anafase I se separan los HOMÓLOGOS: cada polo recibe la mitad de los cromosomas, y cada uno conserva todavía sus dos cromátidas hermanas.`;
      }
      if (confundeCosa) {
        return pideCromatidas
          ? `${NO_ES} Has contado CROMOSOMAS y se piden CROMÁTIDAS: en esta fase cada cromosoma conserva sus dos cromátidas hermanas.`
          : `${NO_ES} Has contado CROMÁTIDAS y se piden CROMOSOMAS: un cromosoma con dos cromátidas hermanas sigue siendo UN cromosoma (cuenta centrómeros).`;
      }
      if (noReduce) {
        return `${NO_ES} ${ent(datos.dosN)} es la dotación diploide (2n) de la célula de partida. En la anafase I se separan los homólogos y cada célula queda haploide (n = ${ent(n)}); la meiosis II ya no reduce el número.`;
      }

      const porPolo = datos.magnitud.endsWith('por-polo');
      if (porPolo && fase.separacion === 'hermanas' && usuario * 2 === esperado) {
        return `${NO_ES} Te ha salido la MITAD. Aquí se separan cromátidas HERMANAS, no homólogos: cada cromosoma se parte en dos cromosomas hijos y cada polo recibe tantos como había.`;
      }
      const enLaCelula = otraMagnitud(
        datos,
        pideCromatidas ? 'cromatidas-en-celula' : 'cromosomas-en-celula'
      );
      if (porPolo && tienePolos && usuario === enLaCelula) {
        return `${NO_ES} Te ha salido el DOBLE: has contado la célula entera, con sus dos polos, y se pide lo que recibe CADA polo.`;
      }
      if (!porPolo && tienePolos && usuario * 2 === esperado) {
        return `${NO_ES} Te ha salido la MITAD: has contado un solo polo. La célula todavía NO se ha partido, así que contiene los dos.`;
      }
      if (!porPolo && fase.celulas > 1 && usuario === esperado * fase.celulas) {
        return `${NO_ES} Te ha salido ${
          fase.celulas === 2 ? 'el DOBLE' : 'de más'
        }: has sumado las ${ent(fase.celulas)} células, y se pide lo que tiene CADA una.`;
      }
      return null;
    }

    case 'cromosomas-gameto-no-disyuncion': {
      const normal = cromosomasPorPolo(fase);
      if (usuario === normal) {
        return `${NO_ES} ${ent(normal)} es lo que recibiría el polo si todo fuera bien. Con la no disyunción ese polo se lleva además el cromosoma que no se separó.`;
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Corrige la respuesta del alumno. Nunca lanza: una entrada que no es un número se responde
 * con un veredicto, no con una excepción que tumbaría el render.
 *
 * ⚠️ 26/09/2026 (hallazgo 2149) — TODO lo que se pregunta aquí es un RECUENTO: cromosomas,
 * cromátidas, células o gametos. Solo vale el entero exacto. Antes se corregía con una
 * tolerancia del 1 % pensada para magnitudes continuas, y en el modo práctica, con 2^8 = 256
 * gametos, daba por buenos 254, 255 (el error clásico 2^n − 1), 257 y 258; en los fijos
 * aceptaba «46,4» cromosomas. «23,0» sigue valiendo: es 23 escrito de otra forma.
 *
 * `datos` es el enunciado: con él se diagnostica el error propio de esa pregunta. Sin él solo
 * se dice si es correcto o no.
 */
export function comprobarRespuesta(
  usuario: number,
  esperado: number,
  datos?: DatosCaso
): Veredicto {
  if (!Number.isFinite(usuario)) {
    return {
      correcto: false,
      motivo: 'Escribe un número entero (por ejemplo, 23).',
      diferencia: NaN,
    };
  }

  if (!Number.isFinite(esperado)) {
    return {
      correcto: false,
      motivo: 'Este caso no tiene una respuesta calculable.',
      diferencia: NaN,
    };
  }

  const diferencia = Math.abs(usuario - esperado);

  if (!Number.isInteger(usuario)) {
    return {
      correcto: false,
      motivo: `${NO_ES} Es un recuento: no hay fracciones de cromosoma, de cromátida, de célula ni de gameto. La respuesta es un número entero.`,
      diferencia,
    };
  }

  if (usuario === esperado) {
    return { correcto: true, motivo: '¡Correcto!', diferencia };
  }

  const propio = datos ? diagnostico(usuario, esperado, datos) : null;
  return {
    correcto: false,
    motivo:
      propio ?? `${NO_ES} Vuelve a contar con la pista, y luego abre la solución paso a paso.`,
    diferencia,
  };
}

// ─── Modo práctica (aleatorio reproducible) ──────────────────────────────────

/**
 * Generador reproducible: la misma semilla da siempre el mismo ejercicio.
 *
 * ⚠️ La semilla se MEZCLA antes de usarse (splitmix32), y no es un adorno. Sembrando
 * xorshift32 con enteros pequeños (1, 2, 3…) los primeros valores salen diminutos y muy
 * parecidos, así que `Math.floor(rnd() * n)` devuelve 0 con todas las semillas: el
 * «aleatorio» da SIEMPRE el mismo ejercicio y aun así pasa la prueba de reproducibilidad,
 * porque reproducible lo es. Ocurrió en simulador-genetica el 14/09/2026.
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

/** Enunciado generado para el modo práctica: dice división, fase, 2n y qué se cuenta. */
function enunciadoDe(datos: DatosCaso): string {
  const encontrada = faseDe(datos.division, datos.faseId);
  if (!encontrada) return 'Fase desconocida';
  const { fase } = encontrada;
  const division = datos.division === 'mitosis' ? 'MITOSIS' : 'MEIOSIS';
  const cabecera = `Una célula con 2n = ${ent(datos.dosN)} se divide por ${division}. En la ${
    fase.nombre
  }, `;
  const enPolos = fase.disposicion === 'separando' || fase.disposicion === 'polos';
  const aviso = enPolos ? ' (la célula todavía NO se ha partido, así que los dos polos siguen dentro)' : '';

  switch (datos.magnitud) {
    case 'cromosomas-por-polo':
      return `${cabecera}¿cuántos CROMOSOMAS (no cromátidas) recibe CADA POLO?`;
    case 'cromatidas-por-polo':
      return `${cabecera}¿cuántas CROMÁTIDAS hay en CADA POLO?`;
    case 'cromosomas-en-celula':
      return `${cabecera}¿cuántos CROMOSOMAS (no cromátidas) hay en CADA CÉLULA${aviso}?`;
    case 'cromatidas-en-celula':
      return `${cabecera}¿cuántas CROMÁTIDAS hay en CADA CÉLULA${aviso}?`;
    case 'cromosomas-totales':
      return `${cabecera}¿cuántos CROMOSOMAS hay en total sumando todas las células de la fase?`;
    case 'celulas':
      return `${cabecera}¿cuántas CÉLULAS hay?`;
    case 'gametos-distintos':
      return `Un organismo con 2n = ${ent(
        datos.dosN
      )} produce gametos por meiosis. Sin contar el crossing-over, ¿cuántos gametos GENÉTICAMENTE DISTINTOS puede dar el reparto al azar de sus pares de homólogos?`;
    case 'cromosomas-gameto-no-disyuncion':
      return `${cabecera}un elemento no se separa y los dos se van al mismo polo. ¿Cuántos CROMOSOMAS acaba teniendo el polo que los recibe de más?`;
    default:
      return cabecera;
  }
}

/**
 * La baraja del modo práctica: el producto de unas cuantas fases por varios 2n, cribado con
 * el PROPIO `resolverCaso` para que no entre ninguna combinación que el motor no resuelva.
 * Si el aleatorio y los 12 fijos calcularan distinto, el alumno entrenaría con una regla y
 * sería corregido con otra.
 */
const COMBINACIONES: readonly DatosCaso[] = (() => {
  const dosNes = [4, 6, 8, 10, 12, 14, 16];
  const plantillas: ReadonlyArray<Pick<DatosCaso, 'division' | 'faseId' | 'magnitud'>> = [
    { division: 'mitosis', faseId: 'metafase', magnitud: 'cromosomas-en-celula' },
    { division: 'mitosis', faseId: 'metafase', magnitud: 'cromatidas-en-celula' },
    { division: 'mitosis', faseId: 'anafase', magnitud: 'cromosomas-por-polo' },
    { division: 'mitosis', faseId: 'anafase', magnitud: 'cromosomas-en-celula' },
    { division: 'mitosis', faseId: 'citocinesis', magnitud: 'cromosomas-en-celula' },
    { division: 'meiosis', faseId: 'metafase-i', magnitud: 'cromatidas-en-celula' },
    { division: 'meiosis', faseId: 'anafase-i', magnitud: 'cromosomas-por-polo' },
    { division: 'meiosis', faseId: 'anafase-i', magnitud: 'cromatidas-por-polo' },
    { division: 'meiosis', faseId: 'metafase-ii', magnitud: 'cromosomas-en-celula' },
    { division: 'meiosis', faseId: 'anafase-ii', magnitud: 'cromosomas-por-polo' },
    { division: 'meiosis', faseId: 'telofase-ii', magnitud: 'cromosomas-en-celula' },
    { division: 'meiosis', faseId: 'telofase-ii', magnitud: 'cromosomas-totales' },
    { division: 'meiosis', faseId: 'telofase-ii', magnitud: 'gametos-distintos' },
  ];
  const validas: DatosCaso[] = [];
  for (const dosN of dosNes) {
    for (const p of plantillas) {
      const datos: DatosCaso = { ...p, dosN };
      const r = resolverCaso(datos);
      if (r.ok && Number.isFinite(r.valor) && r.valor > 0) validas.push(datos);
    }
  }
  return validas;
})();

/**
 * Ejercicio de práctica. Usa EL MISMO `resolverCaso` que los 12 casos fijos, así que no puede
 * corregir con un convenio distinto del que enseñan los casos numerados.
 */
export function generarEjercicioAleatorio(semilla: number = Date.now()): Ejercicio {
  const rnd = aleatorioCon(semilla);
  const datos = COMBINACIONES[Math.floor(rnd() * COMBINACIONES.length)] ?? COMBINACIONES[0];
  const r = resolverCaso(datos);
  return {
    enunciado: enunciadoDe(datos),
    datos,
    respuesta: r.ok ? r.valor : NaN,
    etiquetaRespuesta: etiquetaDe(datos.magnitud),
    pasos: r.pasos,
  };
}
