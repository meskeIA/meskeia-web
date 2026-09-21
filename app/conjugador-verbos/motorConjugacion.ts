/**
 * Motor de Conjugación de Verbos Españoles
 * Maneja tanto verbos regulares como irregulares
 */

import { verbosIrregulares, ConjugacionCompleta } from './verbosIrregulares';

// Terminaciones para verbos regulares
const TERMINACIONES = {
  ar: {
    indicativo: {
      presente: ['o', 'as', 'a', 'amos', 'áis', 'an'],
      preterito_indefinido: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
      preterito_imperfecto: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
      futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
      condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    },
    subjuntivo: {
      presente: ['e', 'es', 'e', 'emos', 'éis', 'en'],
      preterito_imperfecto: ['ara', 'aras', 'ara', 'áramos', 'arais', 'aran'],
    },
    imperativo: {
      afirmativo: ['', 'a', 'e', 'emos', 'ad', 'en'],
      negativo: ['', 'es', 'e', 'emos', 'éis', 'en'],
    },
    gerundio: 'ando',
    participio: 'ado',
  },
  er: {
    indicativo: {
      presente: ['o', 'es', 'e', 'emos', 'éis', 'en'],
      preterito_indefinido: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
      preterito_imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
      futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
      condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    },
    subjuntivo: {
      presente: ['a', 'as', 'a', 'amos', 'áis', 'an'],
      preterito_imperfecto: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
    },
    imperativo: {
      afirmativo: ['', 'e', 'a', 'amos', 'ed', 'an'],
      negativo: ['', 'as', 'a', 'amos', 'áis', 'an'],
    },
    gerundio: 'iendo',
    participio: 'ido',
  },
  ir: {
    indicativo: {
      presente: ['o', 'es', 'e', 'imos', 'ís', 'en'],
      preterito_indefinido: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
      preterito_imperfecto: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
      futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
      condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    },
    subjuntivo: {
      presente: ['a', 'as', 'a', 'amos', 'áis', 'an'],
      preterito_imperfecto: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
    },
    imperativo: {
      afirmativo: ['', 'e', 'a', 'amos', 'id', 'an'],
      negativo: ['', 'as', 'a', 'amos', 'áis', 'an'],
    },
    gerundio: 'iendo',
    participio: 'ido',
  },
};

// Pronombres personales
export const PRONOMBRES = ['yo', 'tú', 'él/ella/Ud.', 'nosotros', 'vosotros', 'ellos/ellas/Uds.'];

/**
 * Nombres de los tiempos verbales, en el orden de la Nueva gramática de la RAE: cada
 * tiempo simple seguido de su compuesto, que es como se estudian y como se contrastan
 * («canté» frente a «he cantado»).
 *
 * Las claves de los tiempos SIMPLES coinciden con verbosIrregulares.ts, que es donde
 * están almacenados. Las de los COMPUESTOS no están almacenadas en ninguna parte: se
 * derivan en tiempo de ejecución con `añadirCompuestos()`, porque un compuesto español
 * es siempre el mismo auxiliar (haber) más el participio del verbo. Guardarlos en las
 * 72 fichas de irregulares sería copiar 72 veces la conjugación de «haber».
 */
export const TIEMPOS = {
  indicativo: {
    presente: 'Presente',
    preterito_perfecto: 'Pretérito Perfecto Compuesto',
    preterito_imperfecto: 'Pretérito Imperfecto',
    preterito_pluscuamperfecto: 'Pretérito Pluscuamperfecto',
    preterito_indefinido: 'Pretérito Indefinido',
    preterito_anterior: 'Pretérito Anterior',
    futuro: 'Futuro Simple',
    futuro_perfecto: 'Futuro Perfecto',
    condicional: 'Condicional Simple',
    condicional_perfecto: 'Condicional Perfecto',
  },
  subjuntivo: {
    presente: 'Presente de Subjuntivo',
    preterito_perfecto: 'Pretérito Perfecto de Subjuntivo',
    preterito_imperfecto: 'Imperfecto de Subjuntivo',
    preterito_pluscuamperfecto: 'Pluscuamperfecto de Subjuntivo',
    futuro: 'Futuro de Subjuntivo',
    futuro_perfecto: 'Futuro Perfecto de Subjuntivo',
  },
  imperativo: {
    afirmativo: 'Imperativo Afirmativo',
    negativo: 'Imperativo Negativo',
  },
};

/**
 * Advertencia de uso para los tiempos que existen pero apenas se usan hoy. Sin esto,
 * un estudiante que ve «hubo cantado» junto a «había cantado» no tiene forma de saber
 * que uno es corriente y el otro está prácticamente fuera de la lengua viva.
 *
 * Van separadas POR MODO a propósito: la clave `futuro` existe en los dos, y el futuro
 * de subjuntivo es arcaico mientras que el futuro de indicativo es el pan de cada día.
 * Con un solo diccionario plano, «cantaré» saldría marcado como arcaísmo.
 */
export const NOTAS_TIEMPO: { indicativo: Record<string, string>; subjuntivo: Record<string, string> } = {
  indicativo: {
    preterito_anterior: 'En desuso. Solo tras «cuando», «apenas», «después de que»: «apenas hubo salido, llamaron».',
  },
  subjuntivo: {
    futuro: 'Arcaico fuera del lenguaje jurídico y de los refranes: «adonde fueres, haz lo que vieres».',
    futuro_perfecto: 'Arcaico. Vive casi solo en textos legales: «si alguien hubiere incurrido en…».',
  },
};

/** Formas del auxiliar «haber» que arman los compuestos, por tiempo simple. */
const AUXILIAR_HABER = {
  presente: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
  preterito_imperfecto: ['había', 'habías', 'había', 'habíamos', 'habíais', 'habían'],
  preterito_indefinido: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron'],
  futuro: ['habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán'],
  condicional: ['habría', 'habrías', 'habría', 'habríamos', 'habríais', 'habrían'],
  subjuntivo_presente: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
  subjuntivo_imperfecto: ['hubiera', 'hubieras', 'hubiera', 'hubiéramos', 'hubierais', 'hubieran'],
  subjuntivo_futuro: ['hubiere', 'hubieres', 'hubiere', 'hubiéremos', 'hubiereis', 'hubieren'],
};

/**
 * Compone un tiempo compuesto: auxiliar conjugado + participio INVARIABLE.
 *
 * Que el participio no concuerde es justo lo que separa el español del francés o el
 * italiano: «las cartas que he escrito», nunca «escritas». Por eso aquí el participio
 * entra tal cual, sin tocarle el género ni el número.
 */
function componer(auxiliar: string[], participio: string): string[] {
  return auxiliar.map((forma) => `${forma} ${participio}`);
}

/**
 * Deriva el futuro de subjuntivo del imperfecto en -ra, que es de donde sale: las dos
 * formas comparten la raíz del pretérito indefinido (dijeron → dijera → dijere), así
 * que basta sustituir la -a- del morfema por una -e-. Vale igual para los regulares
 * (cantara → cantare) y para los irregulares (fuera → fuere, tuviera → tuviere), y
 * conserva la tilde donde la hay (cantáramos → cantáremos).
 *
 * El orden de los sufijos importa: «cantaras» acaba también en «ra», así que los
 * sufijos largos se comprueban antes que los cortos.
 */
function derivarFuturoSubjuntivo(imperfectoRa: string[]): string[] {
  const SUFIJOS: Array<[string, string]> = [
    ['ramos', 'remos'],
    ['rais', 'reis'],
    ['ras', 'res'],
    ['ran', 'ren'],
    ['ra', 're'],
  ];
  return imperfectoRa.map((forma) => {
    for (const [viejo, nuevo] of SUFIJOS) {
      if (forma.endsWith(viejo)) {
        return forma.slice(0, -viejo.length) + nuevo;
      }
    }
    return forma;
  });
}

/**
 * Obtiene la raíz y la terminación de un verbo
 */
function analizarVerbo(infinitivo: string): { raiz: string; terminacion: 'ar' | 'er' | 'ir' } | null {
  const verbo = infinitivo.toLowerCase().trim();

  if (verbo.endsWith('ar')) {
    return { raiz: verbo.slice(0, -2), terminacion: 'ar' };
  } else if (verbo.endsWith('er')) {
    return { raiz: verbo.slice(0, -2), terminacion: 'er' };
  } else if (verbo.endsWith('ir')) {
    return { raiz: verbo.slice(0, -2), terminacion: 'ir' };
  }

  return null;
}

/**
 * Conjuga un verbo regular
 */
function conjugarRegular(infinitivo: string): ConjugacionCompleta | null {
  const analisis = analizarVerbo(infinitivo);
  if (!analisis) return null;

  const { raiz, terminacion } = analisis;
  const term = TERMINACIONES[terminacion];

  return {
    infinitivo,
    gerundio: raiz + term.gerundio,
    participio: raiz + term.participio,
    indicativo: {
      presente: term.indicativo.presente.map(t => raiz + t),
      preterito_indefinido: term.indicativo.preterito_indefinido.map(t => raiz + t),
      preterito_imperfecto: term.indicativo.preterito_imperfecto.map(t => raiz + t),
      // Futuro y condicional: infinitivo completo + terminación
      futuro: term.indicativo.futuro.map(t => infinitivo + t),
      condicional: term.indicativo.condicional.map(t => infinitivo + t),
    },
    subjuntivo: {
      presente: term.subjuntivo.presente.map(t => raiz + t),
      preterito_imperfecto: term.subjuntivo.preterito_imperfecto.map(t => raiz + t),
    },
    imperativo: {
      afirmativo: term.imperativo.afirmativo.map((t, i) => {
        if (i === 0) return '-';
        return raiz + t;
      }),
      negativo: term.imperativo.negativo.map((t, i) => {
        if (i === 0) return '-';
        return 'no ' + raiz + t;
      }),
    },
  };
}

/**
 * Conjugación tal y como se muestra: los tiempos simples que están almacenados más los
 * compuestos y el futuro de subjuntivo, que se derivan. Las claves son exactamente las
 * de TIEMPOS, así que un tiempo nuevo en TIEMPOS sin su forma aquí no compila.
 */
export interface ConjugacionConCompuestos extends Omit<ConjugacionCompleta, 'indicativo' | 'subjuntivo'> {
  indicativo: Record<keyof typeof TIEMPOS.indicativo, string[]>;
  subjuntivo: Record<keyof typeof TIEMPOS.subjuntivo, string[]>;
}

/**
 * Completa una conjugación simple con los ocho tiempos que faltaban: los cinco
 * compuestos de indicativo, los dos de subjuntivo y el futuro de subjuntivo (simple y
 * compuesto). Ninguno se almacena: todos salen del participio del propio verbo y del
 * auxiliar, así que valen igual para un regular que para un irregular.
 */
export function expandirConCompuestos(conj: ConjugacionCompleta): ConjugacionConCompuestos {
  const participio = conj.participio;
  const futuroSubjuntivo = derivarFuturoSubjuntivo(conj.subjuntivo.preterito_imperfecto);

  return {
    ...conj,
    indicativo: {
      presente: conj.indicativo.presente,
      preterito_perfecto: componer(AUXILIAR_HABER.presente, participio),
      preterito_imperfecto: conj.indicativo.preterito_imperfecto,
      preterito_pluscuamperfecto: componer(AUXILIAR_HABER.preterito_imperfecto, participio),
      preterito_indefinido: conj.indicativo.preterito_indefinido,
      preterito_anterior: componer(AUXILIAR_HABER.preterito_indefinido, participio),
      futuro: conj.indicativo.futuro,
      futuro_perfecto: componer(AUXILIAR_HABER.futuro, participio),
      condicional: conj.indicativo.condicional,
      condicional_perfecto: componer(AUXILIAR_HABER.condicional, participio),
    },
    subjuntivo: {
      presente: conj.subjuntivo.presente,
      preterito_perfecto: componer(AUXILIAR_HABER.subjuntivo_presente, participio),
      preterito_imperfecto: conj.subjuntivo.preterito_imperfecto,
      preterito_pluscuamperfecto: componer(AUXILIAR_HABER.subjuntivo_imperfecto, participio),
      futuro: futuroSubjuntivo,
      futuro_perfecto: componer(AUXILIAR_HABER.subjuntivo_futuro, participio),
    },
  };
}

/**
 * Busca si un verbo es irregular o conjuga regularmente
 */
export function conjugarVerbo(infinitivo: string): ConjugacionConCompuestos | null {
  const verbo = infinitivo.toLowerCase().trim();

  // Primero buscar en irregulares
  const simples = verbosIrregulares[verbo] ?? conjugarRegular(verbo);
  if (!simples) return null;

  return expandirConCompuestos(simples);
}

/**
 * Verifica si un verbo es válido
 */
export function esVerboValido(infinitivo: string): boolean {
  const verbo = infinitivo.toLowerCase().trim();
  return verbo.endsWith('ar') || verbo.endsWith('er') || verbo.endsWith('ir');
}

/**
 * Verifica si un verbo es irregular
 */
export function esIrregular(infinitivo: string): boolean {
  const verbo = infinitivo.toLowerCase().trim();
  return verbo in verbosIrregulares;
}

/**
 * Obtiene la lista de verbos irregulares disponibles
 */
export function obtenerVerbosIrregulares(): string[] {
  return Object.keys(verbosIrregulares).sort();
}

/**
 * Busca verbos que coincidan con un patrón
 */
export function buscarVerbos(patron: string): string[] {
  const busqueda = patron.toLowerCase().trim();
  const irregulares = obtenerVerbosIrregulares();

  return irregulares.filter(verbo =>
    verbo.startsWith(busqueda) || verbo.includes(busqueda)
  ).slice(0, 10);
}

// Re-exportar tipo
export type { ConjugacionCompleta };
