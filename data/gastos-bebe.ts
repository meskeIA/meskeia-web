/**
 * Gastos del primer año de un bebé — ESTIMACIÓN ORIENTATIVA PROPIA, sin fuente citable
 *
 * Lo usa `planificador-gastos-bebe`. Son rangos de precios de mercado (pañales, leche, ropa,
 * escuela infantil…) en tres niveles, no datos de una encuesta ni de una norma.
 *
 * Hasta el 12/10/2026 vivían en `data/fiscal/maternidad.ts` como «Estimaciones medias España
 * 2025», sin estudio ni año de origen (antipatrón 1 de neutralidad: cifras sin fuente) y bajo el
 * sello de ese módulo, que es el del RDL 9/2025 del permiso por nacimiento. Decidido por el
 * usuario en el parte del 11/10/2026 (cabo C0165): buscar una fuente citable y, si ninguna da ese
 * desglose por categoría, presentarlas como estimación propia con un aviso junto a las cifras y
 * sacarlas de `data/fiscal/`. En /reparar del 12/10/2026 no se encontró una fuente citable con
 * ese desglose (la tarea solo consulta dominios oficiales), así que van como estimación propia:
 * `GASTOS_BEBE_META.aviso` es el texto que la app pinta junto a las cifras. Si aparece una
 * fuente con el desglose, las cifras se ajustan a ella y el aviso pasa a citarla.
 */

export interface CategoriaGasto {
  categoria: string;
  icono: string;
  gastoMinimo: number; // €/año estimación baja
  gastoMedio: number;  // €/año estimación media
  gastoAlto: number;   // €/año estimación alta
  nota: string;
}

export const GASTOS_BEBE_META = {
  naturaleza: 'estimación orientativa propia',
  revisado: '2026-10-12',
  aviso:
    'Estas cifras son una estimación orientativa de meskeIA a partir de precios habituales de mercado en España, no los datos de un estudio con fuente citable. Úsalas como punto de partida y ajústalas con tus propios precios.',
} as const;

export const GASTOS_PRIMER_ANO_BEBE: CategoriaGasto[] = [
  {
    categoria: 'Pañales y toallitas',
    icono: '🧷',
    gastoMinimo: 400,
    gastoMedio: 700,
    gastoAlto: 1100,
    nota: 'Desechables estándar vs. eco/marca. Los reutilizables reducen coste a largo plazo.',
  },
  {
    categoria: 'Alimentación (leche, potitos, cereales)',
    icono: '🍼',
    gastoMinimo: 300,
    gastoMedio: 800,
    gastoAlto: 1500,
    nota: 'Lactancia materna exclusiva reduce significativamente. Fórmula + alimentación complementaria en el rango alto.',
  },
  {
    categoria: 'Ropa y calzado',
    icono: '👶',
    gastoMinimo: 200,
    gastoMedio: 500,
    gastoAlto: 1200,
    nota: 'Ropa heredada/segunda mano vs. nueva. Los bebés crecen muy rápido (4-5 tallas el primer año).',
  },
  {
    categoria: 'Cuna, cochecito, silla coche',
    icono: '🛏️',
    gastoMinimo: 300,
    gastoMedio: 800,
    gastoAlto: 2500,
    nota: 'Inversión inicial fuerte. Segunda mano o heredado reduce mucho el coste. La silla de coche (grupo 0+) es obligatoria.',
  },
  {
    categoria: 'Guardería / Escuela infantil',
    icono: '🏫',
    gastoMinimo: 0,
    gastoMedio: 3000,
    gastoAlto: 6000,
    nota: 'Desde 0 € (no guardería o pública gratuita en algunas CCAA) hasta 500+ €/mes en privada. La mayor partida si aplica.',
  },
  {
    categoria: 'Pediatra y farmacia',
    icono: '🩺',
    gastoMinimo: 50,
    gastoMedio: 200,
    gastoAlto: 600,
    nota: 'SS pública cubre revisiones y urgencias. Coste adicional si se usa pediatra privado o seguro médico.',
  },
  {
    categoria: 'Higiene y cuidado (cremas, gel, colonia)',
    icono: '🧴',
    gastoMinimo: 100,
    gastoMedio: 250,
    gastoAlto: 500,
    nota: 'Productos básicos vs. marcas especializadas.',
  },
  {
    categoria: 'Juguetes y estimulación',
    icono: '🧸',
    gastoMinimo: 50,
    gastoMedio: 200,
    gastoAlto: 500,
    nota: 'Los bebés necesitan pocos juguetes el primer año. Libros sensoriales y mantas de juego son lo más útil.',
  },
  {
    categoria: 'Seguro médico privado (bebé)',
    icono: '🏥',
    gastoMinimo: 0,
    gastoMedio: 400,
    gastoAlto: 900,
    nota: 'Opcional. Desde 0 € (solo SS pública) hasta 75 €/mes en seguro privado con copago.',
  },
  {
    categoria: 'Otros (biberones, chupetes, sacaleches, etc.)',
    icono: '🎒',
    gastoMinimo: 100,
    gastoMedio: 300,
    gastoAlto: 700,
    nota: 'Accesorios varios, bolsa de paseo, intercomunicador, bañera, cambiador...',
  },
];
