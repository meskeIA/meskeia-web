/**
 * Motor de `simulador-estequiometria`: las reacciones, las masas molares y el cálculo del
 * reactivo limitante, el producto y el exceso.
 *
 * Vive fuera de `page.tsx` desde el 16/10/2026 (semilla S0199) porque lo usan DOS lectores: la
 * vista, que pinta el panel de resultados y las barras de moles, y `casos.ts`, que corrige los
 * casos para clase. Se MOVIÓ sin reescribir (skill /casos-aula-meskeia, «mover la aritmética,
 * no replicarla»): si cada uno calculase a su manera, la app podría suspender una masa que ella
 * misma acaba de mostrar. Sin React ni DOM.
 */

import { redondearA } from '@/lib/calculadoras/correctorCasosAula';

// ============================================
// TIPOS
// ============================================
export interface Sustancia {
  nombre: string;
  formula: string;
  masaMolar: number; // g/mol
  /** Decimales que el dato tiene DE VERDAD: los del peso atómico menos preciso de la fórmula. */
  decimalesM: number;
  coeficiente: number;
}

export type Reactivo = Sustancia;
export type Producto = Sustancia;

export interface Reaccion {
  id: string;
  nombre: string;
  tipo: string;
  ecuacion: string;
  reactivos: [Reactivo, Reactivo];
  productos: Producto[];
  contexto: string;
}

/** Qué reactivo se agota primero; «ambos» = mezcla estequiométrica (se agotan a la vez). */
export type Limitante = 'A' | 'B' | 'ambos';

export interface ResultadoCalculo {
  limitante: Limitante;
  molesA: number;
  molesB: number | null;
  molesProductoTeorico: number;
  masaProductoTeorica: number;
  masaProductoReal: number;
  exceso: { nombre: string; moles: number; gramos: number } | null;
}

// ============================================
// DATOS
// ============================================

/**
 * Pesos atómicos estándar abreviados de la IUPAC/CIAAW (tabla 2021, sin cambios en 2023 para
 * estos elementos; https://iupac.qmul.ac.uk/AtWt/), los mismos que usa
 * `app/tabla-periodica/elementos-data.ts`. El cloro solo tiene DOS decimales en esa tabla
 * (35,45), así que todo compuesto con cloro tiene dos.
 *
 * Hasta el 03/10/2026 las masas molares iban tecleadas con redondeos propios (N₂ 28,02, que no
 * es el redondeo de 28,014; Fe 55,85; CH₄ 16,04…) y se pintaban con un tercer decimal
 * rellenado con cero (hallazgos 2717 y 2718 del Inspector). Ahora se calculan de la fórmula.
 */
const PESO_ATOMICO = {
  H: { valor: 1.008, decimales: 3 },
  C: { valor: 12.011, decimales: 3 },
  N: { valor: 14.007, decimales: 3 },
  O: { valor: 15.999, decimales: 3 },
  Na: { valor: 22.99, decimales: 3 }, // 22,990
  Cl: { valor: 35.45, decimales: 2 },
  Fe: { valor: 55.845, decimales: 3 },
} as const;

type Elemento = keyof typeof PESO_ATOMICO;

/** Masa molar de una fórmula, redondeada a los decimales del peso atómico menos preciso. */
function mm(composicion: Partial<Record<Elemento, number>>): { masaMolar: number; decimalesM: number } {
  let suma = 0;
  let decimalesM = Infinity;
  for (const [simbolo, atomos] of Object.entries(composicion) as [Elemento, number][]) {
    suma += PESO_ATOMICO[simbolo].valor * atomos;
    decimalesM = Math.min(decimalesM, PESO_ATOMICO[simbolo].decimales);
  }
  // La suma arrastra ruido binario (2 · 35,45 + …): el redondeo del motor lo limpia (C0126).
  return { masaMolar: redondearA(suma, decimalesM), decimalesM };
}

export const REACCIONES: Reaccion[] = [
  {
    id: 'combustion-metano',
    nombre: 'Combustión del metano',
    tipo: 'Combustión',
    ecuacion: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O',
    reactivos: [
      { nombre: 'Metano', formula: 'CH₄', ...mm({ C: 1, H: 4 }), coeficiente: 1 }, // 16,043
      { nombre: 'Oxígeno', formula: 'O₂', ...mm({ O: 2 }), coeficiente: 2 }, // 31,998
    ],
    productos: [
      { nombre: 'Dióxido de carbono', formula: 'CO₂', ...mm({ C: 1, O: 2 }), coeficiente: 1 }, // 44,009
      { nombre: 'Agua', formula: 'H₂O', ...mm({ H: 2, O: 1 }), coeficiente: 2 }, // 18,015
    ],
    contexto: 'Gas natural ardiendo en una cocina o caldera',
  },
  {
    id: 'sintesis-agua',
    nombre: 'Síntesis del agua',
    tipo: 'Síntesis',
    ecuacion: '2 H₂ + O₂ → 2 H₂O',
    reactivos: [
      { nombre: 'Hidrógeno', formula: 'H₂', ...mm({ H: 2 }), coeficiente: 2 }, // 2,016
      { nombre: 'Oxígeno', formula: 'O₂', ...mm({ O: 2 }), coeficiente: 1 },
    ],
    productos: [
      { nombre: 'Agua', formula: 'H₂O', ...mm({ H: 2, O: 1 }), coeficiente: 2 },
    ],
    contexto: 'Reacción en pila de hidrógeno para coches eléctricos',
  },
  {
    id: 'neutralizacion',
    nombre: 'Neutralización ácido-base',
    tipo: 'Neutralización',
    ecuacion: 'HCl + NaOH → NaCl + H₂O',
    reactivos: [
      { nombre: 'Ácido clorhídrico', formula: 'HCl', ...mm({ H: 1, Cl: 1 }), coeficiente: 1 }, // 36,46
      { nombre: 'Hidróxido de sodio', formula: 'NaOH', ...mm({ Na: 1, O: 1, H: 1 }), coeficiente: 1 }, // 39,997
    ],
    productos: [
      { nombre: 'Cloruro de sodio', formula: 'NaCl', ...mm({ Na: 1, Cl: 1 }), coeficiente: 1 }, // 58,44
      { nombre: 'Agua', formula: 'H₂O', ...mm({ H: 2, O: 1 }), coeficiente: 1 },
    ],
    contexto: 'Neutralización en laboratorio o industria química',
  },
  {
    id: 'haber-bosch',
    nombre: 'Síntesis de amoniaco (Haber-Bosch)',
    tipo: 'Síntesis industrial',
    ecuacion: 'N₂ + 3 H₂ → 2 NH₃',
    reactivos: [
      { nombre: 'Nitrógeno', formula: 'N₂', ...mm({ N: 2 }), coeficiente: 1 }, // 28,014
      { nombre: 'Hidrógeno', formula: 'H₂', ...mm({ H: 2 }), coeficiente: 3 },
    ],
    productos: [
      { nombre: 'Amoniaco', formula: 'NH₃', ...mm({ N: 1, H: 3 }), coeficiente: 2 }, // 17,031
    ],
    contexto: 'Producción industrial de fertilizantes: alimenta a ~4000 millones de personas',
  },
  {
    id: 'oxidacion-hierro',
    nombre: 'Oxidación del hierro (herrumbre)',
    tipo: 'Oxidación',
    ecuacion: '4 Fe + 3 O₂ → 2 Fe₂O₃',
    reactivos: [
      { nombre: 'Hierro', formula: 'Fe', ...mm({ Fe: 1 }), coeficiente: 4 }, // 55,845
      { nombre: 'Oxígeno', formula: 'O₂', ...mm({ O: 2 }), coeficiente: 3 },
    ],
    productos: [
      { nombre: 'Óxido de hierro (III)', formula: 'Fe₂O₃', ...mm({ Fe: 2, O: 3 }), coeficiente: 2 }, // 159,687
    ],
    contexto: 'Corrosión de estructuras metálicas: el reactivo limitante determina cuánto herrumbre se forma',
  },
  {
    id: 'fermentacion',
    nombre: 'Fermentación alcohólica',
    tipo: 'Fermentación',
    ecuacion: 'C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂',
    reactivos: [
      { nombre: 'Glucosa', formula: 'C₆H₁₂O₆', ...mm({ C: 6, H: 12, O: 6 }), coeficiente: 1 }, // 180,156
      // No se consume: su masa molar no interviene en ningún cálculo ni se muestra.
      { nombre: 'Levadura (catalizador)', formula: '—', masaMolar: 1, decimalesM: 0, coeficiente: 0 },
    ],
    productos: [
      { nombre: 'Etanol', formula: 'C₂H₅OH', ...mm({ C: 2, H: 6, O: 1 }), coeficiente: 2 }, // 46,069
      { nombre: 'Dióxido de carbono', formula: 'CO₂', ...mm({ C: 1, O: 2 }), coeficiente: 2 },
    ],
    contexto: 'Producción de vino, cerveza y biocombustibles',
  },
];

/** La reacción con ese id, o undefined. */
export function reaccionPorId(id: string): Reaccion | undefined {
  return REACCIONES.find((r) => r.id === id);
}

/** ¿El segundo reactivo es un catalizador que no se consume (fermentación)? */
export function esReaccionConCatalizador(reaccion: Reaccion): boolean {
  return reaccion.reactivos[1].coeficiente === 0;
}

// ============================================
// LÓGICA DE CÁLCULO
// ============================================

/**
 * Incertidumbre relativa de una masa molar por su redondeo: medio dígito del último decimal.
 * HCl 36,46 → 0,005 / 36,46 = 0,014 %; NaOH 39,997 → 0,0005 / 39,997 = 0,0013 %.
 */
const incertidumbreRelativa = (s: Sustancia): number => (0.5 * 10 ** -s.decimalesM) / s.masaMolar;

export function calcular(reaccion: Reaccion, gramosA: number, gramosB: number, rendimiento: number): ResultadoCalculo {
  const rA = reaccion.reactivos[0];
  const rB = reaccion.reactivos[1];
  const producto = reaccion.productos[0];

  // Caso especial: B es catalizador (coef = 0) → solo un reactivo real
  if (rB.coeficiente === 0) {
    const molesA = gramosA / rA.masaMolar;
    const molesProducto = molesA * (producto.coeficiente / rA.coeficiente);
    const masaProductoTeorica = molesProducto * producto.masaMolar;
    const masaProductoReal = masaProductoTeorica * (rendimiento / 100);
    return {
      limitante: 'A',
      molesA,
      molesB: null,
      molesProductoTeorico: molesProducto,
      masaProductoTeorica,
      masaProductoReal,
      exceso: null,
    };
  }

  const molesA = gramosA / rA.masaMolar;
  const molesB = gramosB / rB.masaMolar;

  // Razón estequiométrica: el que tenga menor ratio es el limitante
  const ratioA = molesA / rA.coeficiente;
  const ratioB = molesB / rB.coeficiente;

  // Mezcla estequiométrica (hallazgo 2711): dos razones que difieren MENOS que la incertidumbre
  // de redondeo de las propias masas molares no se pueden distinguir con estos datos, así que
  // no hay limitante ni exceso. Con `<=` exacto la rama «Ninguno» que promete la FAQ era
  // inalcanzable: 36,46 g HCl + 40 g NaOH salía «HCl limitante, sobran 0,000 g de NaOH».
  const tolerancia = incertidumbreRelativa(rA) + incertidumbreRelativa(rB);
  const diferenciaRelativa = Math.abs(ratioA - ratioB) / Math.max(ratioA, ratioB);
  const limitante: Limitante = diferenciaRelativa <= tolerancia ? 'ambos' : ratioA < ratioB ? 'A' : 'B';

  const ratioLimitante = Math.min(ratioA, ratioB);
  const molesProducto = ratioLimitante * producto.coeficiente;
  const masaProductoTeorica = molesProducto * producto.masaMolar;
  const masaProductoReal = masaProductoTeorica * (rendimiento / 100);

  if (limitante === 'ambos') {
    return { limitante, molesA, molesB, molesProductoTeorico: molesProducto, masaProductoTeorica, masaProductoReal, exceso: null };
  }

  // Cálculo del exceso: lo disponible menos lo que consume el limitante
  const rExceso = limitante === 'A' ? rB : rA;
  const molesDisponiblesExceso = limitante === 'A' ? molesB : molesA;
  const molesExcesoRestante = molesDisponiblesExceso - ratioLimitante * rExceso.coeficiente;

  return {
    limitante,
    molesA,
    molesB,
    molesProductoTeorico: molesProducto,
    masaProductoTeorica,
    masaProductoReal,
    exceso: { nombre: rExceso.nombre, moles: molesExcesoRestante, gramos: molesExcesoRestante * rExceso.masaMolar },
  };
}

/**
 * Los moles de cada reactivo que harían falta para gastar TODO el otro: los de A para consumir
 * los `molesB` disponibles y los de B para consumir los `molesA`. Es la cuenta de las barras de
 * moles (hallazgo 2710: cada barra divide entre lo necesario de SU reactivo, no del otro) y la de
 * los casos que preguntan «¿cuántos gramos de B hacen falta?». Extraída del `useMemo` de las
 * barras el 16/10/2026 para que las dos lean la misma.
 */
export function molesNecesarios(reaccion: Reaccion, molesA: number, molesB: number): { necesariosA: number; necesariosB: number } {
  const [rA, rB] = reaccion.reactivos;
  return {
    necesariosA: molesB * (rA.coeficiente / rB.coeficiente),
    necesariosB: molesA * (rB.coeficiente / rA.coeficiente),
  };
}

/**
 * El porcentaje de una barra de moles, redondeado sin cruzar el 100 %: con los decimales justos
 * (de 0 a 2) para que lo que no llega al 100 % se lea por debajo y lo que lo pasa, por encima. La
 * página explica las barras con «el que no llega al 100 % es el limitante; el que lo pasa,
 * sobra», y con el redondeo a entero las DOS barras decían «100 %» cerca de la mezcla
 * estequiométrica: la combustión por defecto (CH₄ 99,73 %, O₂ 100,28 %) y la neutralización
 * (NaOH 99,90 %, HCl 100,10 %), hallazgo 3485. Si ni con dos decimales se separa del 100, se
 * trunca hacia él (99,999 → 99,99; 100,001 → 100,01): un 100 solo se escribe si es exacto.
 */
export function porcentajeDeBarraLegible(porcentaje: number): { valor: number; decimales: number } {
  const lado = Math.sign(porcentaje - 100);
  if (lado === 0 || !Number.isFinite(porcentaje)) return { valor: porcentaje, decimales: 0 };
  for (let decimales = 0; decimales <= 2; decimales++) {
    const f = 10 ** decimales;
    const valor = Math.round(porcentaje * f) / f;
    if (Math.sign(valor - 100) === lado) return { valor, decimales };
  }
  const valor = lado < 0 ? Math.floor(porcentaje * 100) / 100 : Math.ceil(porcentaje * 100) / 100;
  return { valor, decimales: 2 };
}
