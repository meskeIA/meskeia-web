// ============================================================================
// BASE DE DATOS: NUTRIENTES (Vitaminas, Minerales, etc.)
// ============================================================================

import { Nutriente } from './schema';

/**
 * Lista completa de nutrientes esenciales
 */
export const nutrientes: Nutriente[] = [
  // VITAMINAS LIPOSOLUBLES
  {
    id: 'vitamina-a',
    nombre: 'Vitamina A',
    tipo: 'vitamina',
    funcion: 'Esencial para la visión, sistema inmune y salud de la piel',
    dosis_recomendada: '900 µg/día (hombres), 700 µg/día (mujeres)',
    emoji: '👁️',
  },
  {
    id: 'vitamina-d',
    nombre: 'Vitamina D',
    tipo: 'vitamina',
    funcion: 'Absorción de calcio, salud ósea y función inmune',
    dosis_recomendada: '15 µg/día (600 UI)',
    emoji: '☀️',
  },
  {
    id: 'vitamina-e',
    nombre: 'Vitamina E',
    tipo: 'vitamina',
    funcion: 'Antioxidante que protege las células del daño',
    dosis_recomendada: '15 mg/día',
    emoji: '🛡️',
  },
  {
    id: 'vitamina-k',
    nombre: 'Vitamina K',
    tipo: 'vitamina',
    funcion: 'Coagulación sanguínea y salud ósea',
    dosis_recomendada: '120 µg/día (hombres), 90 µg/día (mujeres)',
    emoji: '🩸',
  },

  // VITAMINAS HIDROSOLUBLES
  {
    id: 'vitamina-c',
    nombre: 'Vitamina C',
    tipo: 'vitamina',
    funcion: 'Antioxidante, síntesis de colágeno, mejora absorción de hierro',
    dosis_recomendada: '90 mg/día (hombres), 75 mg/día (mujeres)',
    emoji: '🍊',
  },
  {
    id: 'vitamina-b1',
    nombre: 'Vitamina B1 (Tiamina)',
    tipo: 'vitamina',
    funcion: 'Metabolismo de carbohidratos y función nerviosa',
    dosis_recomendada: '1.2 mg/día (hombres), 1.1 mg/día (mujeres)',
  },
  {
    id: 'vitamina-b6',
    nombre: 'Vitamina B6',
    tipo: 'vitamina',
    funcion: 'Metabolismo de proteínas y producción de neurotransmisores',
    dosis_recomendada: '1.3 mg/día',
  },
  {
    id: 'vitamina-b12',
    nombre: 'Vitamina B12',
    tipo: 'vitamina',
    funcion: 'Formación de glóbulos rojos y función neurológica',
    dosis_recomendada: '2.4 µg/día',
    emoji: '🔴',
  },
  {
    id: 'folato',
    nombre: 'Folato (Vitamina B9)',
    tipo: 'vitamina',
    funcion: 'Síntesis de ADN y división celular',
    dosis_recomendada: '400 µg/día',
  },

  // MINERALES PRINCIPALES
  {
    id: 'hierro',
    nombre: 'Hierro',
    tipo: 'mineral',
    funcion: 'Transporte de oxígeno en la sangre',
    dosis_recomendada: '8 mg/día (hombres), 18 mg/día (mujeres)',
    emoji: '🩸',
  },
  {
    id: 'calcio',
    nombre: 'Calcio',
    tipo: 'mineral',
    funcion: 'Salud ósea y dental, contracción muscular',
    dosis_recomendada: '1000 mg/día',
    emoji: '🦴',
  },
  {
    id: 'magnesio',
    nombre: 'Magnesio',
    tipo: 'mineral',
    funcion: 'Función muscular, nerviosa y más de 300 reacciones enzimáticas',
    dosis_recomendada: '400 mg/día (hombres), 310 mg/día (mujeres)',
  },
  {
    id: 'zinc',
    nombre: 'Zinc',
    tipo: 'mineral',
    funcion: 'Sistema inmune, cicatrización y síntesis de proteínas',
    dosis_recomendada: '11 mg/día (hombres), 8 mg/día (mujeres)',
    emoji: '🛡️',
  },
  {
    id: 'potasio',
    nombre: 'Potasio',
    tipo: 'mineral',
    funcion: 'Equilibrio de fluidos, función nerviosa y presión arterial',
    dosis_recomendada: '3400 mg/día (hombres), 2600 mg/día (mujeres)',
  },
  {
    id: 'selenio',
    nombre: 'Selenio',
    tipo: 'mineral',
    funcion: 'Antioxidante y función tiroidea',
    dosis_recomendada: '55 µg/día',
  },

  // ÁCIDOS GRASOS ESENCIALES
  {
    id: 'omega-3',
    nombre: 'Omega-3',
    tipo: 'acido-graso',
    funcion: 'Salud cardiovascular, cerebral y antiinflamatorio',
    dosis_recomendada: '250-500 mg/día (EPA+DHA)',
    emoji: '🐟',
  },
  {
    id: 'omega-6',
    nombre: 'Omega-6',
    tipo: 'acido-graso',
    funcion: 'Crecimiento celular y función cerebral',
    dosis_recomendada: 'Varía según edad y sexo',
  },

  // ANTIOXIDANTES Y OTROS
  {
    id: 'licopeno',
    nombre: 'Licopeno',
    tipo: 'antioxidante',
    funcion: 'Antioxidante potente, protección cardiovascular',
    emoji: '🍅',
  },
  {
    id: 'flavonoides',
    nombre: 'Flavonoides',
    tipo: 'antioxidante',
    funcion: 'Antiinflamatorio y protección celular',
  },
  {
    id: 'fibra',
    nombre: 'Fibra',
    tipo: 'otro',
    funcion: 'Salud digestiva, control de glucosa y colesterol',
    dosis_recomendada: '25 g/día (mujeres), 38 g/día (hombres)',
  },
];

/**
 * Obtener nutriente por ID
 */
export const getNutrientePorId = (id: string): Nutriente | undefined => {
  return nutrientes.find((n) => n.id === id);
};

/**
 * Obtener nutrientes por tipo
 */
export const getNutrientesPorTipo = (tipo: string): Nutriente[] => {
  return nutrientes.filter((n) => n.tipo === tipo);
};
