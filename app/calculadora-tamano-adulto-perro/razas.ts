/**
 * Razas de referencia y rangos de peso adulto por categoría.
 *
 * Vive aparte de `page.tsx` porque `metadata.ts` los necesita para su FAQPage: cuando
 * la FAQ tenía su propia copia escrita a mano, la misma página servía DOS
 * clasificaciones incompatibles —la app decía «grande 16-40 kg» y el JSON-LD que leen
 * Google y las IAs seguía diciendo «25-45 kg» (Inspector, 20/08/2026)—.
 */
import { formatNumber } from '@/lib';

export type TamanoRaza = 'mini' | 'pequeno' | 'mediano' | 'grande' | 'gigante';

export interface RazaReferencia {
  nombre: string;
  tamano: TamanoRaza;
  pesoMin: number;   // kg de adulto
  pesoMax: number;
  maduracion: string;
}

export const razasReferencia: RazaReferencia[] = [
  // Mini
  { nombre: 'Chihuahua', tamano: 'mini', pesoMin: 1.5, pesoMax: 3, maduracion: '8-10 meses' },
  { nombre: 'Yorkshire Terrier', tamano: 'mini', pesoMin: 2, pesoMax: 3.5, maduracion: '8-10 meses' },
  { nombre: 'Pomerania', tamano: 'mini', pesoMin: 1.5, pesoMax: 3, maduracion: '8-10 meses' },
  { nombre: 'Maltés', tamano: 'mini', pesoMin: 3, pesoMax: 4, maduracion: '9-12 meses' },
  // Pequeño
  { nombre: 'Bichón Frisé', tamano: 'pequeno', pesoMin: 5, pesoMax: 10, maduracion: '10-12 meses' },
  { nombre: 'Cavalier King Charles', tamano: 'pequeno', pesoMin: 5.5, pesoMax: 8, maduracion: '10-12 meses' },
  { nombre: 'Jack Russell', tamano: 'pequeno', pesoMin: 6, pesoMax: 8, maduracion: '10-12 meses' },
  { nombre: 'Shih Tzu', tamano: 'pequeno', pesoMin: 4, pesoMax: 7, maduracion: '10-12 meses' },
  { nombre: 'Teckel', tamano: 'pequeno', pesoMin: 7, pesoMax: 15, maduracion: '10-12 meses' },
  // Mediano
  { nombre: 'Beagle', tamano: 'mediano', pesoMin: 9, pesoMax: 11, maduracion: '12-15 meses' },
  { nombre: 'Cocker Spaniel', tamano: 'mediano', pesoMin: 12, pesoMax: 15, maduracion: '12-15 meses' },
  { nombre: 'Bulldog Francés', tamano: 'mediano', pesoMin: 8, pesoMax: 14, maduracion: '12-14 meses' },
  { nombre: 'Border Collie', tamano: 'mediano', pesoMin: 14, pesoMax: 20, maduracion: '12-15 meses' },
  { nombre: 'Schnauzer Mediano', tamano: 'mediano', pesoMin: 14, pesoMax: 20, maduracion: '12-15 meses' },
  // Grande
  { nombre: 'Labrador Retriever', tamano: 'grande', pesoMin: 25, pesoMax: 36, maduracion: '18-24 meses' },
  { nombre: 'Golden Retriever', tamano: 'grande', pesoMin: 25, pesoMax: 34, maduracion: '18-24 meses' },
  { nombre: 'Pastor Alemán', tamano: 'grande', pesoMin: 22, pesoMax: 40, maduracion: '18-24 meses' },
  { nombre: 'Boxer', tamano: 'grande', pesoMin: 25, pesoMax: 32, maduracion: '18-24 meses' },
  { nombre: 'Husky Siberiano', tamano: 'grande', pesoMin: 16, pesoMax: 27, maduracion: '15-18 meses' },
  // Gigante
  { nombre: 'Pastor Bernés', tamano: 'gigante', pesoMin: 35, pesoMax: 55, maduracion: '24-36 meses' },
  { nombre: 'Gran Danés', tamano: 'gigante', pesoMin: 45, pesoMax: 90, maduracion: '24-36 meses' },
  { nombre: 'San Bernardo', tamano: 'gigante', pesoMin: 50, pesoMax: 90, maduracion: '24-36 meses' },
  { nombre: 'Mastín', tamano: 'gigante', pesoMin: 50, pesoMax: 70, maduracion: '24-36 meses' },
  { nombre: 'Terranova', tamano: 'gigante', pesoMin: 45, pesoMax: 70, maduracion: '24-36 meses' },
  { nombre: 'Rottweiler', tamano: 'gigante', pesoMin: 35, pesoMax: 60, maduracion: '18-24 meses' },
  { nombre: 'Dogo Alemán', tamano: 'gigante', pesoMin: 45, pesoMax: 90, maduracion: '24-36 meses' },
  { nombre: 'Leonberger', tamano: 'gigante', pesoMin: 45, pesoMax: 77, maduracion: '24-36 meses' },
];

/**
 * Qué son estos números y qué crédito merecen.
 *
 * Son una curva ORIENTATIVA propia: el porcentaje del peso adulto que se supone alcanzado a
 * cada edad. No proceden de ninguna tabla publicada, y conviene decirlo aquí porque la app
 * las usa como divisor —peso adulto = peso actual / porcentaje—, así que cualquier error
 * suyo se traslada entero al resultado.
 *
 * Contrastadas el 20/08/2026 contra la referencia veterinaria disponible, con este resultado:
 *
 *  · Salt et al. (2017), «Growth standard charts for monitoring bodyweight in dogs of
 *    different sizes», PLoS ONE 12(9):e0182064 — más de 6 millones de perros, y la base de
 *    las WALTHAM Puppy Growth Charts que se usan en clínica. Sus autores advierten de forma
 *    explícita que **sus estándares no aplican a perros de más de 40 kg**, que es justo la
 *    categoría «gigante» de esta app, la que aquí se modela con más detalle (hasta 144
 *    semanas). Para ese tramo no existe estándar publicado con el que comparar.
 *  · El estudio publica curvas de percentiles, no una tabla de «% del peso adulto por
 *    semana», así que no hay de dónde copiar las 51 constantes aunque se quisiera.
 *  · Los puntos sueltos que sí circulan en la literatura divulgativa NO coinciden con esta
 *    curva: a las 24 semanas se cita ~80 % para razas toy y ~66 % para grandes, mientras
 *    aquí figuran 90 % y 55 %. En razas grandes esa diferencia infla la estimación de peso
 *    adulto alrededor de un 19 %.
 *
 * Por eso NO se han sustituido por otras: cambiar un número sin fuente por otro número sin
 * fuente mejor no arregla nada, solo lo disimula. Lo que sí se ha hecho es retirar de la app
 * el caso de uso que convertía esta estimación en una decisión clínica (cálculo de dosis) y
 * decir en pantalla, con <DataReference>, de qué pie cojea el dato.
 *
 * Si alguna vez se publican estándares para >40 kg, este es el bloque que hay que rehacer.
 */
export const curvasCrecimiento: Record<TamanoRaza, Record<number, number>> = {
  mini: {
    8: 0.35, 12: 0.50, 16: 0.65, 20: 0.80, 24: 0.90, 28: 0.95, 32: 0.98, 40: 1.0,
  },
  pequeno: {
    8: 0.30, 12: 0.45, 16: 0.58, 20: 0.70, 24: 0.80, 28: 0.88, 32: 0.94, 40: 0.98, 48: 1.0,
  },
  mediano: {
    8: 0.25, 12: 0.38, 16: 0.50, 20: 0.60, 24: 0.70, 28: 0.78, 32: 0.85, 40: 0.92, 52: 0.98, 60: 1.0,
  },
  grande: {
    8: 0.20, 12: 0.30, 16: 0.40, 20: 0.48, 24: 0.55, 28: 0.62, 32: 0.68, 40: 0.78, 52: 0.88, 72: 0.96, 96: 1.0,
  },
  gigante: {
    8: 0.15, 12: 0.22, 16: 0.30, 20: 0.37, 24: 0.43, 28: 0.50, 32: 0.55, 40: 0.65, 52: 0.75, 72: 0.85, 96: 0.95, 144: 1.0,
  },
};

// Peso adulto típico de cada categoría, en kg. Sirve para contrastar la proyección
// con la categoría elegida: la estimación sale del propio peso del cachorro, así que
// sin una referencia externa como esta el resultado nunca se puede contradecir.
// Un peso en kg, con decimal solo si lo tiene: 1,5 kg / 3 kg
export const kg = (n: number): string => formatNumber(n, Number.isInteger(n) ? 0 : 1);
export const rangoKg = (min: number, max: number): string => `${kg(min)}-${kg(max)} kg`;

// Peso adulto típico de cada categoría, DERIVADO de las razas que la propia app clasifica en
// ella. Antes era una tabla escrita a mano, y divergió de las otras tres que hay en la página:
// decía que «grande» es 25-45 kg mientras clasificaba al Husky (16-27 kg) como grande, así que
// el aviso de coherencia corregía a quien había elegido bien —un husky proyectado a 18,2 kg
// salía «por debajo de lo habitual»—. Derivándolo no pueden volver a contradecirse: si mañana
// se añade una raza, el rango de su categoría la acoge sola.
export const rangosTipicos: Record<TamanoRaza, { min: number; max: number; etiqueta: string }> =
  razasReferencia.reduce((acc, raza) => {
    const actual = acc[raza.tamano];
    acc[raza.tamano] = actual
      ? { min: Math.min(actual.min, raza.pesoMin), max: Math.max(actual.max, raza.pesoMax), etiqueta: '' }
      : { min: raza.pesoMin, max: raza.pesoMax, etiqueta: '' };
    return acc;
  }, {} as Record<TamanoRaza, { min: number; max: number; etiqueta: string }>);
for (const t of Object.keys(rangosTipicos) as TamanoRaza[]) {
  rangosTipicos[t].etiqueta = rangoKg(rangosTipicos[t].min, rangosTipicos[t].max);
}

