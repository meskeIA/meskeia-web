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

// Nombres de los tiempos verbales (deben coincidir con verbosIrregulares.ts)
export const TIEMPOS = {
  indicativo: {
    presente: 'Presente',
    preterito_indefinido: 'Pretérito Indefinido',
    preterito_imperfecto: 'Pretérito Imperfecto',
    futuro: 'Futuro Simple',
    condicional: 'Condicional Simple',
  },
  subjuntivo: {
    presente: 'Presente de Subjuntivo',
    preterito_imperfecto: 'Imperfecto de Subjuntivo',
  },
  imperativo: {
    afirmativo: 'Imperativo Afirmativo',
    negativo: 'Imperativo Negativo',
  },
};

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
 * Busca si un verbo es irregular o conjuga regularmente
 */
export function conjugarVerbo(infinitivo: string): ConjugacionCompleta | null {
  const verbo = infinitivo.toLowerCase().trim();

  // Primero buscar en irregulares
  if (verbosIrregulares[verbo]) {
    return verbosIrregulares[verbo];
  }

  // Si no es irregular, conjugar regularmente
  return conjugarRegular(verbo);
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
