/**
 * Motor de la calculadora de edad de mascotas — sin dependencias, para que lo lean por igual la
 * página, la FAQ (las dos bocas: visible y FAQPage) y las tablas del bloque educativo.
 *
 * QUÉ REGLA ES: la regla convencional orientativa de uso veterinario divulgativo — el primer año
 * equivale a 15 años humanos, el segundo a 9 más (24 en total) y, a partir del tercero, cada año
 * suma 4, 5, 6 o 7 según el tamaño del perro (4 en el gato). NO es el modelo epigenético de
 * Wang et al. (Cell Systems, 2020: 16·ln(edad) + 31, calibrado en labradores y sin tamaño): la
 * página lo atribuía a ese modelo sin usarlo (hallazgo 3010, 07/10/2026).
 *
 * Dentro de los dos primeros años se INTERPOLA entre los anclajes 0 → 0, 1 → 15 y 2 → 24, como
 * ya se hacía por encima de 2: antes un cachorro de 3 meses salía con 15 años humanos (3009).
 *
 * Las etapas vitales dependen del tamaño (los perros grandes envejecen antes) y salen de UNA sola
 * tabla que leen el motor, la FAQ y la guía: antes había cuatro umbrales distintos (3013).
 */

export type TipoMascota = 'perro' | 'gato';
export type TamanoPerro = 'pequeno' | 'mediano' | 'grande' | 'gigante';

/** Años humanos que suma cada año a partir del tercero. */
export const FACTOR_POR_ANIO: Record<TamanoPerro, number> = {
  pequeno: 4, // < 10 kg
  mediano: 5, // 10-25 kg
  grande: 6, // 25-45 kg
  gigante: 7, // > 45 kg
};
export const FACTOR_GATO = 4;

export const EDAD_HUMANA_ANIO_1 = 15;
export const EDAD_HUMANA_ANIO_2 = 24;

/** Rango de edad que admite la calculadora (años del animal). */
export const EDAD_MINIMA = 0;
export const EDAD_MAXIMA = 30;

export const NOMBRE_TAMANO: Record<TamanoPerro, string> = {
  pequeno: 'pequeño',
  mediano: 'mediano',
  grande: 'grande',
  gigante: 'gigante',
};

export const PESO_TAMANO: Record<TamanoPerro, string> = {
  pequeno: '<10 kg',
  mediano: '10-25 kg',
  grande: '25-45 kg',
  gigante: '>45 kg',
};

export const TAMANOS: TamanoPerro[] = ['pequeno', 'mediano', 'grande', 'gigante'];

function factorDe(tipo: TipoMascota, tamano: TamanoPerro): number {
  return tipo === 'gato' ? FACTOR_GATO : FACTOR_POR_ANIO[tamano];
}

/** Edad humana equivalente. `edad` en años del animal, ya validada (0-30). */
export function calcularEdadHumana(tipo: TipoMascota, tamano: TamanoPerro, edad: number): number {
  if (edad <= 0) return 0;
  if (edad <= 1) return edad * EDAD_HUMANA_ANIO_1;
  if (edad <= 2) return EDAD_HUMANA_ANIO_1 + (edad - 1) * (EDAD_HUMANA_ANIO_2 - EDAD_HUMANA_ANIO_1);
  return EDAD_HUMANA_ANIO_2 + (edad - 2) * factorDe(tipo, tamano);
}

// ─── Etapas vitales ───────────────────────────────────────────────────────

export type ClaveEtapa = 'cria' | 'joven' | 'adulto' | 'maduro' | 'senior' | 'geriatrico';

/** Edad (años del animal) a la que EMPIEZA cada etapa; la cría va de 0 a `joven`. */
export interface UmbralesEtapa {
  joven: number;
  adulto: number;
  maduro: number;
  senior: number;
  geriatrico: number;
}

/**
 * Orientativas: no hay un umbral oficial único, y cada veterinario lo ajusta al animal concreto.
 * Lo que sí es común a las guías divulgativas es el orden: cuanto más grande el perro, antes llega
 * a senior. El gato no depende del peso.
 */
export const UMBRALES_PERRO: Record<TamanoPerro, UmbralesEtapa> = {
  pequeno: { joven: 1, adulto: 3, maduro: 7, senior: 10, geriatrico: 14 },
  mediano: { joven: 1, adulto: 3, maduro: 6, senior: 8, geriatrico: 12 },
  grande: { joven: 1, adulto: 3, maduro: 5, senior: 7, geriatrico: 10 },
  gigante: { joven: 1, adulto: 3, maduro: 4, senior: 6, geriatrico: 10 },
};
export const UMBRALES_GATO: UmbralesEtapa = { joven: 1, adulto: 3, maduro: 7, senior: 11, geriatrico: 15 };

export function umbralesDe(tipo: TipoMascota, tamano: TamanoPerro): UmbralesEtapa {
  return tipo === 'gato' ? UMBRALES_GATO : UMBRALES_PERRO[tamano];
}

export interface Etapa {
  clave: ClaveEtapa;
  nombre: string;
  descripcion: string;
}

const DESCRIPCION_ETAPA: Record<ClaveEtapa, string> = {
  cria: 'Etapa de crecimiento rápido, socialización y aprendizaje',
  joven: 'Lleno de energía, necesita mucho ejercicio y juego',
  adulto: 'Equilibrado y en su mejor momento físico y mental',
  maduro: 'Más tranquilo; empieza a necesitar más descanso',
  senior: 'Necesita revisiones veterinarias más frecuentes y cuidados especiales',
  geriatrico: 'Requiere atención especial: confort y calidad de vida',
};

export function nombreEtapa(tipo: TipoMascota, clave: ClaveEtapa): string {
  const nombres: Record<ClaveEtapa, string> = {
    cria: tipo === 'gato' ? 'Gatito' : 'Cachorro',
    joven: tipo === 'gato' ? 'Gato joven' : 'Perro joven',
    adulto: 'Adulto',
    maduro: 'Maduro',
    senior: 'Senior',
    geriatrico: 'Geriátrico',
  };
  return nombres[clave];
}

export function obtenerEtapa(tipo: TipoMascota, tamano: TamanoPerro, edad: number): Etapa {
  const u = umbralesDe(tipo, tamano);
  const clave: ClaveEtapa =
    edad >= u.geriatrico
      ? 'geriatrico'
      : edad >= u.senior
        ? 'senior'
        : edad >= u.maduro
          ? 'maduro'
          : edad >= u.adulto
            ? 'adulto'
            : edad >= u.joven
              ? 'joven'
              : 'cria';
  return { clave, nombre: nombreEtapa(tipo, clave), descripcion: DESCRIPCION_ETAPA[clave] };
}

/** «1 año», «2,5 años». */
export function textoAnios(n: number, formatear: (v: number) => string): string {
  return `${formatear(n)} ${n === 1 ? 'año' : 'años'}`;
}
