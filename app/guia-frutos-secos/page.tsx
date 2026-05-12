'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GuiaFrutosSecos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
} from '@/components';
import ShareCard from '@/components/ShareCard';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ============================================================
// TIPOS
// ============================================================

type CategoriaFrutoSeco = 'Nuez' | 'Semilla' | 'Legumbre' | 'Drupa';
type RegionFrutoSeco = 'Mediterráneo' | 'América' | 'Asia' | 'África' | 'Oceanía';
type NivelCalorico = 'Moderado' | 'Alto' | 'Muy alto';
type PerfilNutricional =
  | 'Proteínas'
  | 'Omega-3'
  | 'Fibra'
  | 'Antioxidantes'
  | 'Magnesio'
  | 'Hierro'
  | 'Vitamina E';

interface FrutoSeco {
  nombre: string;
  nombreCientifico: string;
  categoria: CategoriaFrutoSeco;
  region: RegionFrutoSeco;
  paisesPrincipales: string[];
  caloriasPor100g: number;
  proteinasPor100g: number;
  grasasPor100g: number;
  carbohidratosPor100g: number;
  nivelCalorico: NivelCalorico;
  destacanEn: string[];
  conservacion: string;
  usosCulinarios: string[];
  beneficios: string[];
  descripcion: string;
  curiosidad: string;
}

// ============================================================
// DATOS
// ============================================================

const CATEGORIAS: Array<CategoriaFrutoSeco | 'Todas'> = [
  'Todas',
  'Nuez',
  'Semilla',
  'Legumbre',
  'Drupa',
];

const REGIONES: Array<RegionFrutoSeco | 'Todas'> = [
  'Todas',
  'Mediterráneo',
  'América',
  'Asia',
  'África',
  'Oceanía',
];

const NIVELES_CALORICOS: Array<NivelCalorico | 'Todos'> = [
  'Todos',
  'Moderado',
  'Alto',
  'Muy alto',
];

const PERFILES_NUTRICIONALES: Array<PerfilNutricional | 'Todos'> = [
  'Todos',
  'Proteínas',
  'Omega-3',
  'Fibra',
  'Antioxidantes',
  'Magnesio',
  'Hierro',
  'Vitamina E',
];

const FRUTOS_SECOS: FrutoSeco[] = [
  // NUECES Y DRUPAS (12)
  {
    nombre: 'Almendra',
    nombreCientifico: 'Prunus dulcis',
    categoria: 'Drupa',
    region: 'Mediterráneo',
    paisesPrincipales: ['EE.UU. (California)', 'España', 'Australia'],
    caloriasPor100g: 579,
    proteinasPor100g: 21,
    grasasPor100g: 50,
    carbohidratosPor100g: 22,
    nivelCalorico: 'Alto',
    destacanEn: ['Vitamina E', 'Magnesio', 'Fibra'],
    conservacion: 'Frasco hermético, lugar fresco, 12 meses',
    usosCulinarios: ['Snacks', 'Repostería', 'Leche vegetal', 'Salsas'],
    beneficios: [
      'Reduce colesterol LDL',
      'Salud cardiovascular',
      'Saciedad',
    ],
    descripcion:
      'Una de las nueces más versátiles del mundo. España es el segundo productor mundial. Variedades importantes: Marcona (la más cara), Largueta, Comuna.',
    curiosidad:
      'California produce 80% mundial — pero la almendra es originaria de Asia central, no de América.',
  },
  {
    nombre: 'Nuez',
    nombreCientifico: 'Juglans regia',
    categoria: 'Nuez',
    region: 'Mediterráneo',
    paisesPrincipales: ['China', 'EE.UU.', 'Irán'],
    caloriasPor100g: 654,
    proteinasPor100g: 15,
    grasasPor100g: 65,
    carbohidratosPor100g: 14,
    nivelCalorico: 'Muy alto',
    destacanEn: ['Omega-3', 'Antioxidantes', 'Magnesio'],
    conservacion: 'Cáscara: lugar fresco 6 meses. Pelada: nevera 3 meses',
    usosCulinarios: ['Snacks', 'Ensaladas', 'Salsas', 'Repostería'],
    beneficios: [
      'Salud cerebral',
      'Reduce inflamación',
      'Salud del corazón',
    ],
    descripcion:
      'El fruto seco con mayor contenido de Omega-3 vegetal. Su forma se parece a un cerebro humano; los estudios muestran beneficios cardiovasculares y cognitivos asociados al consumo moderado. Llamada "la nuez del rey" en latín.',
    curiosidad:
      'Su forma simétrica al cerebro humano sirvió en la antigüedad como prueba de la "doctrina de las signaturas".',
  },
  {
    nombre: 'Pistacho',
    nombreCientifico: 'Pistacia vera',
    categoria: 'Drupa',
    region: 'Asia',
    paisesPrincipales: ['Irán', 'EE.UU.', 'Turquía'],
    caloriasPor100g: 562,
    proteinasPor100g: 20,
    grasasPor100g: 45,
    carbohidratosPor100g: 28,
    nivelCalorico: 'Alto',
    destacanEn: ['Proteínas', 'Vitamina B6', 'Antioxidantes'],
    conservacion: 'Frasco hermético, lugar fresco, 6 meses',
    usosCulinarios: ['Snacks', 'Repostería oriental', 'Helados', 'Pesto'],
    beneficios: [
      'Salud ocular (luteína)',
      'Reduce colesterol',
      'Saciedad',
    ],
    descripcion:
      'Originario de Asia central, milenario en cocinas persa y turca. La cáscara se abre naturalmente al madurar — los pistachos cerrados se descartan.',
    curiosidad:
      'Es la única nuez que se "sonríe" al estar lista — los iraníes lo llaman "la nuez sonriente".',
  },
  {
    nombre: 'Avellana',
    nombreCientifico: 'Corylus avellana',
    categoria: 'Nuez',
    region: 'Mediterráneo',
    paisesPrincipales: ['Turquía', 'Italia', 'España (Reus)'],
    caloriasPor100g: 628,
    proteinasPor100g: 15,
    grasasPor100g: 61,
    carbohidratosPor100g: 17,
    nivelCalorico: 'Muy alto',
    destacanEn: ['Vitamina E', 'Manganeso', 'Cobre'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: ['Snacks', 'Pralinés', 'Nutella', 'Repostería'],
    beneficios: ['Salud cardiovascular', 'Antioxidante', 'Energía'],
    descripcion:
      'Turquía produce el 70% mundial. La avellana de Reus (España) tiene IGP. Base de la Nutella, Ferrero y Toblerone — Ferrero compra 25% de la producción mundial.',
    curiosidad:
      'Una sola fábrica de Nutella usa 25% de la cosecha mundial de avellanas.',
  },
  {
    nombre: 'Anacardo',
    nombreCientifico: 'Anacardium occidentale',
    categoria: 'Drupa',
    region: 'América',
    paisesPrincipales: ['Vietnam', 'India', 'Brasil'],
    caloriasPor100g: 553,
    proteinasPor100g: 18,
    grasasPor100g: 44,
    carbohidratosPor100g: 30,
    nivelCalorico: 'Alto',
    destacanEn: ['Hierro', 'Magnesio', 'Cobre'],
    conservacion: 'Frasco hermético, 6-9 meses',
    usosCulinarios: ['Snacks', 'Quesos veganos', 'Pollo asiático', 'Mantequilla'],
    beneficios: ['Salud ósea', 'Salud cerebral', 'Antioxidante'],
    descripcion:
      'Originario de Brasil pero hoy se cultiva principalmente en Asia. Una sola almendra crece fuera de cada "manzana de cajú". Nunca se vende con cáscara: contiene urushiol tóxico.',
    curiosidad:
      'La "manzana de cajú" (la falsa fruta) es comestible y se usa para hacer feni (licor) en Goa, India.',
  },
  {
    nombre: 'Castaña',
    nombreCientifico: 'Castanea sativa',
    categoria: 'Nuez',
    region: 'Mediterráneo',
    paisesPrincipales: ['China', 'España', 'Italia'],
    caloriasPor100g: 213,
    proteinasPor100g: 2.4,
    grasasPor100g: 2.3,
    carbohidratosPor100g: 45,
    nivelCalorico: 'Moderado',
    destacanEn: ['Fibra', 'Vitamina C', 'Vitamina B6'],
    conservacion: 'Nevera con piel: 1 mes. Cocidas: congelador 3 meses',
    usosCulinarios: ['Asadas', 'Purés', 'Marrón glacé', 'Sopa'],
    beneficios: ['Bajas en grasa', 'Sin gluten', 'Energía sostenida'],
    descripcion:
      'Único fruto seco bajo en grasa y alto en carbohidratos — más parecido a un cereal que a un fruto seco. Imprescindible en otoños europeos asadas.',
    curiosidad:
      'Galicia produce 50% del marrón glacé europeo — la castaña gallega tiene IGP propia.',
  },
  {
    nombre: 'Pacana / Pecan',
    nombreCientifico: 'Carya illinoinensis',
    categoria: 'Nuez',
    region: 'América',
    paisesPrincipales: ['EE.UU.', 'México'],
    caloriasPor100g: 691,
    proteinasPor100g: 9,
    grasasPor100g: 72,
    carbohidratosPor100g: 14,
    nivelCalorico: 'Muy alto',
    destacanEn: ['Antioxidantes', 'Vitamina E', 'Manganeso'],
    conservacion: 'Nevera 6 meses, congelador 1 año',
    usosCulinarios: ['Repostería', 'Pecan pie', 'Ensaladas', 'Praliné'],
    beneficios: [
      'Antiinflamatorio',
      'Salud cerebral',
      'Reduce colesterol',
    ],
    descripcion:
      'Nuez americana nativa de los nativos americanos. Más cremosa y dulce que la nuez europea. EE.UU. produce 80% mundial — Georgia y Texas son los principales estados.',
    curiosidad:
      'El "pecan pie" es plato oficial del Día de Acción de Gracias en EE.UU. desde finales del siglo XIX.',
  },
  {
    nombre: 'Nuez de macadamia',
    nombreCientifico: 'Macadamia integrifolia',
    categoria: 'Nuez',
    region: 'Oceanía',
    paisesPrincipales: ['Australia', 'Sudáfrica', 'Hawái'],
    caloriasPor100g: 718,
    proteinasPor100g: 8,
    grasasPor100g: 76,
    carbohidratosPor100g: 14,
    nivelCalorico: 'Muy alto',
    destacanEn: ['Grasas monoinsaturadas', 'Manganeso', 'Tiamina'],
    conservacion: 'Frasco hermético en nevera, 6 meses',
    usosCulinarios: [
      'Snacks gourmet',
      'Repostería',
      'Ensaladas',
      'Aceite cosmético',
    ],
    beneficios: ['Salud cardiovascular', 'Antioxidante', 'Energía'],
    descripcion:
      'El fruto seco más caro del mundo. Originario de Australia, donde los aborígenes la llamaban "kindal-kindal". Sus cáscaras son tan duras que se necesitan máquinas industriales.',
    curiosidad:
      'Las cáscaras de macadamia son uno de los materiales más duros del mundo — pueden romper una hélice de avión.',
  },
  {
    nombre: 'Nuez de Brasil',
    nombreCientifico: 'Bertholletia excelsa',
    categoria: 'Nuez',
    region: 'América',
    paisesPrincipales: ['Bolivia', 'Brasil', 'Perú'],
    caloriasPor100g: 656,
    proteinasPor100g: 14,
    grasasPor100g: 67,
    carbohidratosPor100g: 12,
    nivelCalorico: 'Muy alto',
    destacanEn: ['Selenio (más alto del mundo)', 'Magnesio', 'Vitamina E'],
    conservacion: 'Nevera 6 meses, congelador 1 año',
    usosCulinarios: ['Snacks', 'Repostería', 'Smoothies', 'Pestos'],
    beneficios: [
      'Antioxidante (selenio)',
      'Salud tiroidea',
      'Salud cerebral',
    ],
    descripcion:
      'Una de las nueces más grandes del mundo, recolectada solo en árboles silvestres del Amazonas. Contiene la mayor cantidad de selenio del reino vegetal — solo 1-2 al día son suficientes.',
    curiosidad:
      '1 nuez de Brasil contiene 100% de la dosis diaria recomendada de selenio — más es tóxico.',
  },
  {
    nombre: 'Piñón',
    nombreCientifico: 'Pinus pinea',
    categoria: 'Semilla',
    region: 'Mediterráneo',
    paisesPrincipales: ['España', 'Portugal', 'China'],
    caloriasPor100g: 673,
    proteinasPor100g: 14,
    grasasPor100g: 68,
    carbohidratosPor100g: 13,
    nivelCalorico: 'Muy alto',
    destacanEn: ['Vitamina K', 'Magnesio', 'Manganeso'],
    conservacion: 'Frasco hermético en nevera, 3 meses',
    usosCulinarios: ['Pesto', 'Repostería', 'Ensaladas', 'Empanadillas'],
    beneficios: ['Salud ocular', 'Saciedad', 'Antioxidante'],
    descripcion:
      'Semilla del pino piñonero mediterráneo. Uno de los frutos secos más caros: 60-100€/kg. España produce el 30% mundial. Imprescindible en pesto y muchos platos mediterráneos.',
    curiosidad:
      'Recolectar piñones es trabajo manual: cada cono debe abrirse al sol y los piñones se extraen uno a uno.',
  },
  {
    nombre: 'Coco',
    nombreCientifico: 'Cocos nucifera',
    categoria: 'Drupa',
    region: 'Asia',
    paisesPrincipales: ['Indonesia', 'Filipinas', 'India'],
    caloriasPor100g: 354,
    proteinasPor100g: 3.3,
    grasasPor100g: 33,
    carbohidratosPor100g: 15,
    nivelCalorico: 'Alto',
    destacanEn: ['Fibra', 'Manganeso', 'Cobre'],
    conservacion: 'Pulpa fresca: nevera 1 semana. Seco: 6 meses',
    usosCulinarios: ['Curry', 'Repostería', 'Leche vegetal', 'Aceite'],
    beneficios: ['Energía rápida', 'Hidratación', 'Antimicrobiano'],
    descripcion:
      'Técnicamente una drupa, no una nuez. Indonesia produce 30% mundial. Cada parte es útil: agua, pulpa, leche, aceite, fibra de la cáscara y carbón. El árbol más generoso del mundo.',
    curiosidad:
      'El agua de coco es estéril y tiene composición similar al plasma sanguíneo — se usó como suero en la 2ª Guerra Mundial.',
  },
  {
    nombre: 'Cacahuete / Maní',
    nombreCientifico: 'Arachis hypogaea',
    categoria: 'Legumbre',
    region: 'América',
    paisesPrincipales: ['China', 'India', 'EE.UU.'],
    caloriasPor100g: 567,
    proteinasPor100g: 26,
    grasasPor100g: 49,
    carbohidratosPor100g: 16,
    nivelCalorico: 'Alto',
    destacanEn: ['Proteínas', 'Niacina', 'Folato'],
    conservacion: 'Frasco hermético, 6 meses',
    usosCulinarios: [
      'Snacks',
      'Mantequilla de cacahuete',
      'Curry tailandés',
      'Salsas',
    ],
    beneficios: ['Saciedad', 'Salud cardiovascular', 'Energía'],
    descripcion:
      'Técnicamente NO es un fruto seco — es una legumbre que crece bajo tierra. Originario de Sudamérica. EE.UU. usa 50% de su cosecha para mantequilla de cacahuete.',
    curiosidad:
      'George Washington Carver (1864-1943) descubrió más de 300 usos para el cacahuete — desde leche hasta tinta.',
  },

  // SEMILLAS (12)
  {
    nombre: 'Pipas de girasol',
    nombreCientifico: 'Helianthus annuus',
    categoria: 'Semilla',
    region: 'Mediterráneo',
    paisesPrincipales: ['Ucrania', 'Rusia', 'España'],
    caloriasPor100g: 584,
    proteinasPor100g: 21,
    grasasPor100g: 52,
    carbohidratosPor100g: 20,
    nivelCalorico: 'Alto',
    destacanEn: ['Vitamina E', 'Magnesio', 'Selenio'],
    conservacion: 'Frasco hermético, 6 meses',
    usosCulinarios: ['Snacks', 'Ensaladas', 'Pan', 'Mantequilla'],
    beneficios: ['Salud cardiovascular', 'Antioxidante', 'Energía'],
    descripcion:
      'Las pipas o semillas de girasol son uno de los snacks más populares del mundo. España las consume saladas; los rusos crudas; los americanos en mantequilla.',
    curiosidad:
      'Los aztecas las cultivaban para obtener colorante amarillo — más que para comer.',
  },
  {
    nombre: 'Pipas de calabaza',
    nombreCientifico: 'Cucurbita pepo',
    categoria: 'Semilla',
    region: 'América',
    paisesPrincipales: ['China', 'India', 'México'],
    caloriasPor100g: 559,
    proteinasPor100g: 30,
    grasasPor100g: 49,
    carbohidratosPor100g: 11,
    nivelCalorico: 'Alto',
    destacanEn: ['Magnesio', 'Zinc', 'Hierro'],
    conservacion: 'Frasco hermético, 3-6 meses',
    usosCulinarios: ['Snacks', 'Ensaladas', 'Pesto verde', 'Pan'],
    beneficios: ['Salud prostática', 'Sueño (triptófano)', 'Inmunidad'],
    descripcion:
      'Pepitas verdes muy nutritivas. Las pipas mexicanas (variedad pepita) son las más populares para comer. Altísimo contenido en zinc, ideales para salud masculina.',
    curiosidad:
      'El pesto verde en México (con pepita) precede al pesto italiano genovés en al menos 2.000 años.',
  },
  {
    nombre: 'Sésamo',
    nombreCientifico: 'Sesamum indicum',
    categoria: 'Semilla',
    region: 'África',
    paisesPrincipales: ['Sudán', 'India', 'Birmania'],
    caloriasPor100g: 573,
    proteinasPor100g: 18,
    grasasPor100g: 50,
    carbohidratosPor100g: 23,
    nivelCalorico: 'Alto',
    destacanEn: ['Calcio', 'Hierro', 'Cobre'],
    conservacion: 'Frasco hermético, 6 meses',
    usosCulinarios: ['Tahini', 'Hummus', 'Pan', 'Sushi'],
    beneficios: ['Salud ósea', 'Salud cardiovascular', 'Saciedad'],
    descripcion:
      'Una de las semillas más antiguas (5000 años en Mesopotamia). Base del tahini y del aceite de sésamo asiático. La variedad negra tiene más antioxidantes que la blanca.',
    curiosidad:
      'El "sésamo ábrete" de Las mil y una noches viene del crujido que hacen las cápsulas al abrir y soltar las semillas.',
  },
  {
    nombre: 'Chía',
    nombreCientifico: 'Salvia hispanica',
    categoria: 'Semilla',
    region: 'América',
    paisesPrincipales: ['México', 'Argentina', 'Bolivia'],
    caloriasPor100g: 486,
    proteinasPor100g: 17,
    grasasPor100g: 31,
    carbohidratosPor100g: 42,
    nivelCalorico: 'Alto',
    destacanEn: ['Omega-3', 'Fibra', 'Calcio'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: ['Pudding', 'Smoothies', 'Yogur', 'Pan'],
    beneficios: [
      'Saciedad alta',
      'Salud digestiva',
      'Energía sostenida',
    ],
    descripcion:
      'Semilla mexicana de alto valor nutricional, base de la dieta de los aztecas y mayas. Forma gel al contacto con agua (10x su volumen), excelente para hidratación y saciedad.',
    curiosidad:
      'Los guerreros aztecas se alimentaban con 1 cucharada de chía al día durante largas marchas — los llamaban "corredores chía".',
  },
  {
    nombre: 'Lino / Linaza',
    nombreCientifico: 'Linum usitatissimum',
    categoria: 'Semilla',
    region: 'Asia',
    paisesPrincipales: ['Canadá', 'Rusia', 'Kazajistán'],
    caloriasPor100g: 534,
    proteinasPor100g: 18,
    grasasPor100g: 42,
    carbohidratosPor100g: 29,
    nivelCalorico: 'Alto',
    destacanEn: ['Omega-3', 'Fibra soluble', 'Lignanos'],
    conservacion: 'Refrigerado, 6 meses (rápida oxidación)',
    usosCulinarios: ['Pan', 'Smoothies', 'Yogur', 'Sustituto huevo'],
    beneficios: [
      'Equilibrio hormonal',
      'Salud digestiva',
      'Reduce colesterol',
    ],
    descripcion:
      'Semillas planas marrones o doradas con altísimo contenido en omega-3 vegetal y lignanos (fitoestrógenos). Deben molerse para absorber los nutrientes.',
    curiosidad:
      'Carlomagno hizo aprobar leyes en el siglo IX para que sus súbditos comieran lino — creía que era esencial para la salud.',
  },
  {
    nombre: 'Cáñamo / Hemp',
    nombreCientifico: 'Cannabis sativa',
    categoria: 'Semilla',
    region: 'Asia',
    paisesPrincipales: ['China', 'Francia', 'Canadá'],
    caloriasPor100g: 553,
    proteinasPor100g: 32,
    grasasPor100g: 49,
    carbohidratosPor100g: 9,
    nivelCalorico: 'Alto',
    destacanEn: ['Proteína completa', 'Omega-3 y 6', 'Magnesio'],
    conservacion: 'Refrigerado en frasco hermético, 6 meses',
    usosCulinarios: ['Smoothies', 'Yogur', 'Ensaladas', 'Pan'],
    beneficios: [
      'Proteína completa vegetal',
      'Equilibrio hormonal',
      'Salud cardiovascular',
    ],
    descripcion:
      'Semillas de cáñamo industrial (sin THC). Una de las pocas proteínas vegetales completas con todos los aminoácidos esenciales. Perfecto para vegetarianos y veganos.',
    curiosidad:
      'El cáñamo legal contiene menos de 0.3% THC — no tiene efectos psicoactivos en absoluto.',
  },
  {
    nombre: 'Amapola',
    nombreCientifico: 'Papaver somniferum',
    categoria: 'Semilla',
    region: 'Mediterráneo',
    paisesPrincipales: ['República Checa', 'Turquía', 'España'],
    caloriasPor100g: 525,
    proteinasPor100g: 18,
    grasasPor100g: 42,
    carbohidratosPor100g: 28,
    nivelCalorico: 'Alto',
    destacanEn: ['Calcio', 'Manganeso', 'Magnesio'],
    conservacion: 'Frasco hermético, 6 meses',
    usosCulinarios: ['Pan', 'Bagels', 'Repostería', 'Strudel'],
    beneficios: ['Salud ósea', 'Sueño', 'Salud digestiva'],
    descripcion:
      'Semillas pequeñas y oscuras de la flor de la amapola. Las semillas comestibles no contienen los alcaloides opiáceos del resto de la planta.',
    curiosidad:
      'Pueden dar positivo en test antidoping de opiáceos — los atletas las evitan antes de competiciones.',
  },
  {
    nombre: 'Mostaza',
    nombreCientifico: 'Sinapis alba / Brassica nigra',
    categoria: 'Semilla',
    region: 'Mediterráneo',
    paisesPrincipales: ['Canadá', 'Nepal', 'Ucrania'],
    caloriasPor100g: 508,
    proteinasPor100g: 26,
    grasasPor100g: 36,
    carbohidratosPor100g: 28,
    nivelCalorico: 'Alto',
    destacanEn: ['Selenio', 'Omega-3', 'Magnesio'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: ['Mostaza', 'Curry', 'Encurtidos', 'Vinagretas'],
    beneficios: [
      'Antioxidante',
      'Antiinflamatorio',
      'Salud digestiva',
    ],
    descripcion:
      'Semillas pequeñas amarillas (Sinapis alba) o negras (Brassica nigra) que dan la mostaza condimento. Toda la familia es picante por la presencia de sinigrina.',
    curiosidad:
      'Dijon (Francia) tiene la AOC más antigua del mundo para la mostaza — desde 1390.',
  },
  {
    nombre: 'Comino',
    nombreCientifico: 'Cuminum cyminum',
    categoria: 'Semilla',
    region: 'Mediterráneo',
    paisesPrincipales: ['India', 'Siria', 'Turquía'],
    caloriasPor100g: 375,
    proteinasPor100g: 18,
    grasasPor100g: 22,
    carbohidratosPor100g: 44,
    nivelCalorico: 'Moderado',
    destacanEn: ['Hierro', 'Manganeso', 'Calcio'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: ['Curry', 'Tex-mex', 'Embutidos', 'Pan'],
    beneficios: [
      'Salud digestiva',
      'Antiinflamatorio',
      'Energía',
    ],
    descripcion:
      'Semilla aromática esencial en cocinas india, mexicana y de Oriente Medio. Una de las especias más antiguas (5000 años en Egipto). Sabor cálido y terroso.',
    curiosidad:
      'En la Edad Media se usaba como anti-infidelidad: las novias llevaban comino en el bolsillo durante las bodas.',
  },
  {
    nombre: 'Hinojo (semilla)',
    nombreCientifico: 'Foeniculum vulgare',
    categoria: 'Semilla',
    region: 'Mediterráneo',
    paisesPrincipales: ['India', 'China', 'Egipto'],
    caloriasPor100g: 345,
    proteinasPor100g: 16,
    grasasPor100g: 15,
    carbohidratosPor100g: 52,
    nivelCalorico: 'Moderado',
    destacanEn: ['Manganeso', 'Hierro', 'Calcio'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: ['Embutidos', 'Té', 'Pan', 'Curry'],
    beneficios: [
      'Salud digestiva',
      'Antiespasmódico',
      'Antiinflamatorio',
    ],
    descripcion:
      'Semillas con sabor a anís y regaliz. En India se masticaban tradicionalmente al final de las comidas para mejorar la digestión y refrescar el aliento.',
    curiosidad:
      'En los restaurantes indios siempre hay un cuenco de hinojo en la salida — costumbre milenaria post-comida.',
  },
  {
    nombre: 'Cardamomo (semilla)',
    nombreCientifico: 'Elettaria cardamomum',
    categoria: 'Semilla',
    region: 'Asia',
    paisesPrincipales: ['Guatemala', 'India', 'Sri Lanka'],
    caloriasPor100g: 311,
    proteinasPor100g: 11,
    grasasPor100g: 7,
    carbohidratosPor100g: 68,
    nivelCalorico: 'Moderado',
    destacanEn: ['Manganeso', 'Hierro', 'Magnesio'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: ['Café árabe', 'Curry', 'Té chai', 'Repostería'],
    beneficios: [
      'Salud digestiva',
      'Antibacteriano',
      'Aliento fresco',
    ],
    descripcion:
      'Tercera especia más cara del mundo (después del azafrán y la vainilla). Esencial en el café árabe (qahwa) y el té chai indio. Sabor intenso a alcanfor y eucalipto.',
    curiosidad:
      'Guatemala es el mayor productor mundial — pero el cardamomo es originario de la India.',
  },
  {
    nombre: 'Quinua',
    nombreCientifico: 'Chenopodium quinoa',
    categoria: 'Semilla',
    region: 'América',
    paisesPrincipales: ['Bolivia', 'Perú', 'Ecuador'],
    caloriasPor100g: 368,
    proteinasPor100g: 14,
    grasasPor100g: 6,
    carbohidratosPor100g: 64,
    nivelCalorico: 'Moderado',
    destacanEn: ['Proteína completa', 'Manganeso', 'Magnesio'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: [
      'Ensaladas',
      'Hamburguesas vegetales',
      'Sopa',
      'Cereal',
    ],
    beneficios: [
      'Proteína completa vegetal',
      'Sin gluten',
      'Saciedad',
    ],
    descripcion:
      'Pseudo-cereal andino sagrado para los Incas (la "madre de los granos"). Una de las pocas proteínas vegetales completas. Sin gluten.',
    curiosidad:
      'La ONU declaró 2013 "Año Internacional de la Quinua" por su potencial para combatir el hambre mundial.',
  },

  // EXÓTICOS (6)
  {
    nombre: 'Anacardo de tigre / Chufa',
    nombreCientifico: 'Cyperus esculentus',
    categoria: 'Drupa',
    region: 'Mediterráneo',
    paisesPrincipales: ['España (Valencia)', 'Egipto', 'Burkina Faso'],
    caloriasPor100g: 386,
    proteinasPor100g: 6,
    grasasPor100g: 23,
    carbohidratosPor100g: 43,
    nivelCalorico: 'Alto',
    destacanEn: ['Fibra', 'Magnesio', 'Hierro'],
    conservacion: 'Frasco hermético en seco, 12 meses',
    usosCulinarios: ['Horchata', 'Harina', 'Snacks', 'Repostería'],
    beneficios: [
      'Saciedad',
      'Sin gluten',
      'Salud digestiva',
    ],
    descripcion:
      'Pequeño tubérculo (técnicamente no fruto seco) base de la horchata valenciana. La chufa de Valencia tiene DOP. Sabor dulce a almendra y avellana.',
    curiosidad:
      'La horchata valenciana es la única bebida vegetal del mundo con DOP en sus ingredientes.',
  },
  {
    nombre: 'Bellota',
    nombreCientifico: 'Quercus rotundifolia',
    categoria: 'Nuez',
    region: 'Mediterráneo',
    paisesPrincipales: ['España', 'Portugal', 'Marruecos'],
    caloriasPor100g: 387,
    proteinasPor100g: 6,
    grasasPor100g: 24,
    carbohidratosPor100g: 41,
    nivelCalorico: 'Moderado',
    destacanEn: ['Fibra', 'Vitamina B6', 'Manganeso'],
    conservacion: 'Crudas: 2 meses. Tostadas: 12 meses',
    usosCulinarios: [
      'Harina sin gluten',
      'Snacks',
      'Café de bellota',
      'Postres',
    ],
    beneficios: ['Sin gluten', 'Saciedad', 'Antioxidante'],
    descripcion:
      'Fruto del encino y el alcornoque. En España es esencial para criar el cerdo ibérico — pero también es comestible para humanos tras lavarla bien para eliminar taninos.',
    curiosidad:
      'Los íberos basaban su dieta en la harina de bellota — sigue siendo alimento gourmet en Andalucía.',
  },
  {
    nombre: 'Castaña de agua',
    nombreCientifico: 'Eleocharis dulcis',
    categoria: 'Drupa',
    region: 'Asia',
    paisesPrincipales: ['China', 'Tailandia', 'India'],
    caloriasPor100g: 97,
    proteinasPor100g: 1,
    grasasPor100g: 0.1,
    carbohidratosPor100g: 23,
    nivelCalorico: 'Moderado',
    destacanEn: ['Fibra', 'Potasio', 'Vitamina B6'],
    conservacion: 'Nevera 1 mes en agua, latas: 12 meses',
    usosCulinarios: [
      'Wok asiático',
      'Ensaladas',
      'Sopas',
      'Rolls vietnamitas',
    ],
    beneficios: [
      'Bajas en calorías',
      'Crujientes',
      'Hidratación',
    ],
    descripcion:
      'Tubérculo acuático asiático muy crujiente, no tiene relación con la castaña europea. Se usa por su textura única que mantiene incluso después de cocinada.',
    curiosidad:
      'Su crujido es tan distintivo que la cocina china las usa solo por la textura, no el sabor.',
  },
  {
    nombre: 'Tigernut tostado / Chufa egipcia',
    nombreCientifico: 'Cyperus esculentus',
    categoria: 'Drupa',
    region: 'África',
    paisesPrincipales: ['Egipto', 'Nigeria', 'España'],
    caloriasPor100g: 425,
    proteinasPor100g: 7,
    grasasPor100g: 26,
    carbohidratosPor100g: 45,
    nivelCalorico: 'Alto',
    destacanEn: ['Fibra', 'Hierro', 'Magnesio'],
    conservacion: 'Frasco hermético, 12 meses',
    usosCulinarios: ['Snacks', 'Harina paleo', 'Smoothies', 'Repostería'],
    beneficios: [
      'Sin gluten',
      'Resistente al almidón',
      'Saciedad',
    ],
    descripcion:
      'Versión africana/egipcia de la chufa valenciana. Muy popular en dietas paleo y veganas como sustituto de los frutos secos para alérgicos.',
    curiosidad:
      'Se han encontrado chufas en tumbas egipcias de 6.000 años — son uno de los cultivos más antiguos del mundo.',
  },
  {
    nombre: 'Pistacho de anacardo / Pequí',
    nombreCientifico: 'Caryocar villosum',
    categoria: 'Drupa',
    region: 'América',
    paisesPrincipales: ['Brasil'],
    caloriasPor100g: 287,
    proteinasPor100g: 5,
    grasasPor100g: 20,
    carbohidratosPor100g: 14,
    nivelCalorico: 'Moderado',
    destacanEn: ['Vitamina A', 'Vitamina E', 'Hierro'],
    conservacion: 'Refrigerado, 3 meses',
    usosCulinarios: [
      'Cocina amazónica',
      'Arroz brasileño',
      'Postres',
    ],
    beneficios: [
      'Antioxidante',
      'Salud ocular',
      'Vitaminas liposolubles',
    ],
    descripcion:
      'Fruto amazónico brasileño con sabor único y aceite de color naranja. Característico de la cocina del Cerrado brasileño.',
    curiosidad:
      'El aceite de pequí se usa en la cocina indígena amazónica desde hace siglos — solo está empezando a internacionalizarse.',
  },
  {
    nombre: 'Habas de soja',
    nombreCientifico: 'Glycine max',
    categoria: 'Legumbre',
    region: 'Asia',
    paisesPrincipales: ['EE.UU.', 'Brasil', 'China'],
    caloriasPor100g: 446,
    proteinasPor100g: 36,
    grasasPor100g: 20,
    carbohidratosPor100g: 30,
    nivelCalorico: 'Alto',
    destacanEn: ['Proteína completa', 'Hierro', 'Calcio'],
    conservacion: 'Frasco hermético, 12 meses (secas)',
    usosCulinarios: [
      'Tofu',
      'Leche de soja',
      'Edamame',
      'Salsa de soja',
    ],
    beneficios: [
      'Proteína completa vegetal',
      'Equilibrio hormonal',
      'Salud ósea',
    ],
    descripcion:
      'Técnicamente legumbre, no fruto seco. Pero las habas tostadas (soya nuts) compiten en el mercado de snacks. Una de las pocas proteínas completas del reino vegetal.',
    curiosidad:
      'EE.UU. produce 35% de la soja mundial — pero la planta es originaria de China hace 5.000 años.',
  },
];

// ============================================================
// HELPERS
// ============================================================

function getCategoriaBadgeClass(categoria: CategoriaFrutoSeco): string {
  const mapa: Record<CategoriaFrutoSeco, string> = {
    Nuez: styles.badgeNuez,
    Semilla: styles.badgeSemilla,
    Legumbre: styles.badgeLegumbre,
    Drupa: styles.badgeDrupa,
  };
  return mapa[categoria] ?? '';
}

function getNivelCaloricoClass(nivel: NivelCalorico): string {
  const mapa: Record<NivelCalorico, string> = {
    Moderado: styles.nivelModerado,
    Alto: styles.nivelAlto,
    'Muy alto': styles.nivelMuyAlto,
  };
  return mapa[nivel] ?? '';
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function GuiaFrutosSecosPage() {
  const [categoria, setCategoria] = useState<CategoriaFrutoSeco | 'Todas'>(
    'Todas',
  );
  const [region, setRegion] = useState<RegionFrutoSeco | 'Todas'>('Todas');
  const [nivel, setNivel] = useState<NivelCalorico | 'Todos'>('Todos');
  const [perfil, setPerfil] = useState<PerfilNutricional | 'Todos'>('Todos');
  const [busqueda, setBusqueda] = useState('');

  const frutosFiltrados = useMemo(() => {
    const busquedaLower = busqueda.toLowerCase().trim();
    return FRUTOS_SECOS.filter((f) => {
      const coincideCategoria = categoria === 'Todas' || f.categoria === categoria;
      const coincideRegion = region === 'Todas' || f.region === region;
      const coincideNivel = nivel === 'Todos' || f.nivelCalorico === nivel;
      const coincidePerfil =
        perfil === 'Todos' ||
        f.destacanEn.some((d) =>
          d.toLowerCase().includes(perfil.toLowerCase()),
        );

      if (!busquedaLower) {
        return (
          coincideCategoria && coincideRegion && coincideNivel && coincidePerfil
        );
      }

      const coincideBusqueda =
        f.nombre.toLowerCase().includes(busquedaLower) ||
        f.nombreCientifico.toLowerCase().includes(busquedaLower) ||
        f.paisesPrincipales.some((p) =>
          p.toLowerCase().includes(busquedaLower),
        ) ||
        f.descripcion.toLowerCase().includes(busquedaLower) ||
        f.destacanEn.some((d) => d.toLowerCase().includes(busquedaLower)) ||
        f.beneficios.some((b) => b.toLowerCase().includes(busquedaLower));

      return (
        coincideCategoria &&
        coincideRegion &&
        coincideNivel &&
        coincidePerfil &&
        coincideBusqueda
      );
    });
  }, [categoria, region, nivel, perfil, busqueda]);

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Guía de Frutos Secos y Semillas</h1>
        <p className={styles.heroSubtitle}>
          Descubre 30 frutos secos y semillas: nutrición, beneficios,
          conservación y usos culinarios. Filtra por categoría, origen, perfil
          nutricional y nivel calórico.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── Controles ── */}
        <div className={styles.controles}>
          <div className={styles.buscadorWrap}>
            <span className={styles.buscadorIcon} aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              className={styles.buscador}
              placeholder="Buscar por nombre, país, nutriente o beneficio..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar fruto seco"
            />
          </div>

          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Categoría</span>
            <div
              className={styles.filtros}
              role="group"
              aria-label="Filtrar por categoría"
            >
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filtroBtn} ${
                    categoria === cat ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setCategoria(cat)}
                  aria-pressed={categoria === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Región de origen</span>
            <div
              className={styles.filtros}
              role="group"
              aria-label="Filtrar por región"
            >
              {REGIONES.map((reg) => (
                <button
                  key={reg}
                  className={`${styles.filtroBtn} ${
                    region === reg ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setRegion(reg)}
                  aria-pressed={region === reg}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Nivel calórico</span>
            <div
              className={styles.filtros}
              role="group"
              aria-label="Filtrar por nivel calórico"
            >
              {NIVELES_CALORICOS.map((n) => (
                <button
                  key={n}
                  className={`${styles.filtroBtn} ${
                    nivel === n ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setNivel(n)}
                  aria-pressed={nivel === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filtroGrupo}>
            <span className={styles.filtroLabel}>Perfil nutricional</span>
            <div
              className={styles.filtros}
              role="group"
              aria-label="Filtrar por perfil nutricional"
            >
              {PERFILES_NUTRICIONALES.map((p) => (
                <button
                  key={p}
                  className={`${styles.filtroBtn} ${
                    perfil === p ? styles.filtroActivo : ''
                  }`}
                  onClick={() => setPerfil(p)}
                  aria-pressed={perfil === p}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          Mostrando {frutosFiltrados.length} de {FRUTOS_SECOS.length} frutos
          secos
        </p>

        {/* ── Grid de tarjetas ── */}
        {frutosFiltrados.length === 0 ? (
          <div className={styles.sinResultados}>
            <span className={styles.sinResultadosIcon} aria-hidden="true">
              🌰
            </span>
            <p>No se encontraron frutos secos con esos filtros.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {frutosFiltrados.map((f) => (
              <article key={f.nombre} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitulo}>{f.nombre}</h2>
                  <span className={styles.cardNombreCientifico}>
                    {f.nombreCientifico}
                  </span>
                  <div className={styles.cardMeta}>
                    <span
                      className={`${styles.categoriaBadge} ${getCategoriaBadgeClass(
                        f.categoria,
                      )}`}
                    >
                      {f.categoria}
                    </span>
                    <span className={styles.regionBadge}>{f.region}</span>
                    <span
                      className={`${styles.nivelBadge} ${getNivelCaloricoClass(
                        f.nivelCalorico,
                      )}`}
                    >
                      {f.nivelCalorico}
                    </span>
                  </div>
                  <div className={styles.paises}>
                    <span className={styles.paisesLabel}>Países:</span>{' '}
                    {f.paisesPrincipales.join(', ')}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.descripcion}>{f.descripcion}</p>

                  {/* Información nutricional */}
                  <div className={styles.nutricionGrid}>
                    <div className={styles.nutricionItem}>
                      <span className={styles.nutricionValor}>
                        {f.caloriasPor100g}
                      </span>
                      <span className={styles.nutricionLabel}>kcal</span>
                    </div>
                    <div className={styles.nutricionItem}>
                      <span className={styles.nutricionValor}>
                        {f.proteinasPor100g}g
                      </span>
                      <span className={styles.nutricionLabel}>Proteína</span>
                    </div>
                    <div className={styles.nutricionItem}>
                      <span className={styles.nutricionValor}>
                        {f.grasasPor100g}g
                      </span>
                      <span className={styles.nutricionLabel}>Grasas</span>
                    </div>
                    <div className={styles.nutricionItem}>
                      <span className={styles.nutricionValor}>
                        {f.carbohidratosPor100g}g
                      </span>
                      <span className={styles.nutricionLabel}>Carbs</span>
                    </div>
                  </div>
                  <p className={styles.nutricionNota}>
                    Valores por 100 g de producto
                  </p>

                  {/* Nutrientes destacados */}
                  <div>
                    <p className={styles.seccionLabel}>Destaca en</p>
                    <div className={styles.nutrientesTags}>
                      {f.destacanEn.map((n) => (
                        <span key={n} className={styles.nutrientesTag}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Conservación */}
                  <div className={styles.conservacionBox}>
                    <span className={styles.conservacionLabel}>
                      Conservación:
                    </span>{' '}
                    {f.conservacion}
                  </div>

                  {/* Usos culinarios */}
                  <div>
                    <p className={styles.seccionLabel}>Usos culinarios</p>
                    <div className={styles.usosTags}>
                      {f.usosCulinarios.map((u) => (
                        <span key={u} className={styles.usosTag}>
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Beneficios */}
                  <div>
                    <p className={styles.seccionLabel}>Beneficios clave</p>
                    <ul className={styles.beneficiosList}>
                      {f.beneficios.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Curiosidad */}
                  <div className={styles.curiosidadBox}>
                    <span className={styles.curiosidadIcon} aria-hidden="true">
                      💡
                    </span>
                    <p className={styles.curiosidadText}>{f.curiosidad}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Sección educativa v2.0 ── */}
        <EducationalSection
          title="Guía de Frutos Secos y Semillas"
          subtitle="Descubre 30 frutos secos y semillas: nutrición, beneficios, conservación y usos culinarios"
        >
          <p>Las indicaciones de beneficios para la salud son orientativas y proceden de estudios nutricionales generales. No sustituyen el consejo médico personalizado, especialmente en caso de alergias, diabetes, embarazo o tratamientos médicos.</p>

          <h3>Tabla comparativa nutricional</h3>
          <p>
            Los frutos secos varían enormemente en su perfil nutricional. Estos
            son los más representativos por categoría:
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Fruto seco</th>
                  <th>Kcal/100g</th>
                  <th>Proteína</th>
                  <th>Grasas</th>
                  <th>Destaca en</th>
                  <th>Categoría</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nuez de macadamia</td>
                  <td>718</td>
                  <td>8 g</td>
                  <td>76 g</td>
                  <td>Grasas monoinsaturadas</td>
                  <td>Muy calórico</td>
                </tr>
                <tr>
                  <td>Nuez común</td>
                  <td>654</td>
                  <td>15 g</td>
                  <td>65 g</td>
                  <td>Omega-3 vegetal</td>
                  <td>Muy calórico</td>
                </tr>
                <tr>
                  <td>Almendra</td>
                  <td>579</td>
                  <td>21 g</td>
                  <td>50 g</td>
                  <td>Vitamina E, magnesio</td>
                  <td>Calórico</td>
                </tr>
                <tr>
                  <td>Cacahuete</td>
                  <td>567</td>
                  <td>26 g</td>
                  <td>49 g</td>
                  <td>Proteína vegetal</td>
                  <td>Calórico</td>
                </tr>
                <tr>
                  <td>Chía</td>
                  <td>486</td>
                  <td>17 g</td>
                  <td>31 g</td>
                  <td>Omega-3, fibra</td>
                  <td>Calórico</td>
                </tr>
                <tr>
                  <td>Cáñamo</td>
                  <td>553</td>
                  <td>32 g</td>
                  <td>49 g</td>
                  <td>Proteína completa</td>
                  <td>Calórico</td>
                </tr>
                <tr>
                  <td>Castaña</td>
                  <td>213</td>
                  <td>2,4 g</td>
                  <td>2,3 g</td>
                  <td>Carbohidratos, fibra</td>
                  <td>Moderado</td>
                </tr>
                <tr>
                  <td>Castaña de agua</td>
                  <td>97</td>
                  <td>1 g</td>
                  <td>0,1 g</td>
                  <td>Fibra, hidratación</td>
                  <td>Bajo</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Para quién son cada tipo de fruto seco</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Deportistas y activos</p>
              <p className={styles.escenarioDesc}>
                Almendras y pistachos pre-entreno (energía sostenida y proteína),
                cacahuetes y nueces post-entreno (recuperación), chía en
                bebidas isotónicas caseras (hidratación + ALA omega-3). Mezcla
                de pipas de calabaza y semillas de cáñamo para zinc, magnesio y
                proteína completa.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>
                Vegetarianos y veganos
              </p>
              <p className={styles.escenarioDesc}>
                Cáñamo, quinua y soja como fuentes de proteína completa con
                todos los aminoácidos esenciales. Lino y chía para omega-3
                vegetal (ALA). Sésamo y almendras para calcio biodisponible.
                Anacardos para hierro y zinc.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Snacks saludables</p>
              <p className={styles.escenarioDesc}>
                Un puñado (25-30 g) entre comidas mantiene la saciedad sin
                disparar la insulina. Almendras y pistachos son ideales por su
                ratio proteína/grasa. Pipas con cáscara obligan a comer despacio
                y dan sensación de plenitud.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Repostería</p>
              <p className={styles.escenarioDesc}>
                Almendra para mazapanes y bizcochos. Avellana para pralinés y
                cremas. Pacana para tartas americanas. Coco rallado para
                macaroons y tropicales. Piñones para repostería mediterránea.
                Castaña para purés dulces y marrón glacé.
              </p>
            </div>
          </div>

          <h3>Preguntas frecuentes sobre frutos secos</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>
                ¿Engordan los frutos secos?
              </p>
              <p className={styles.faqRespuesta}>
                No tan automáticamente como su densidad calórica sugiere. La
                mayoría tienen 500-700 kcal/100 g, pero estudios consistentes
                muestran que su consumo regular en cantidades razonables (25-30
                g/día) NO se asocia con aumento de peso. La grasa, fibra y
                proteína dan saciedad y reducen la ingesta total. Además, parte
                de las calorías de las nueces y almendras enteras no se
                absorben.
              </p>
              <p className={styles.faqTip}>
                Un puñado al día (25-30 g) es la cantidad ideal para la mayoría.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>
                ¿Crudos, tostados o salados?
              </p>
              <p className={styles.faqRespuesta}>
                Crudos conservan más nutrientes (vitamina E, ácidos grasos sin
                oxidar). Tostados sin sal tienen mejor sabor y digestibilidad
                (las antinutrientes como fitatos se reducen). Tostados con sal
                añaden sodio innecesario y a menudo se fríen en aceites de mala
                calidad. La mejor opción cotidiana: crudos o tostados sin sal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>
                ¿Cuáles son los más saludables?
              </p>
              <p className={styles.faqRespuesta}>
                Todos lo son en cantidades moderadas. Las nueces destacan por
                omega-3, las almendras por vitamina E y magnesio, los pistachos
                por proteína y luteína, las pacanas por antioxidantes, la nuez
                de Brasil por selenio. Lo más importante es la variedad: mezclar
                tipos da un perfil nutricional más completo que centrarse en
                uno solo.
              </p>
              <p className={styles.faqTip}>
                Una mezcla de almendra + nuez + pistacho cubre la mayoría de
                nutrientes esenciales.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>
                ¿Cómo evito que se pongan rancios?
              </p>
              <p className={styles.faqRespuesta}>
                Las grasas insaturadas oxidan al contacto con luz, calor y aire.
                Conserva los frutos secos en frasco hermético opaco, en lugar
                fresco y seco. Las nueces, pacanas y nueces de Brasil son las
                más sensibles: nevera o congelador alargan su vida útil de 3-6
                meses a 1-2 años. Si huelen a "pintura" o "cartón", están
                rancios.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>
                ¿Son seguros los frutos secos para los niños?
              </p>
              <p className={styles.faqRespuesta}>
                Frutos secos enteros NO se recomiendan en menores de 5 años por
                riesgo de atragantamiento. A partir de los 6-8 meses sí pueden
                introducirse en forma de cremas (sin azúcar añadido, sin sal),
                molidos o como ingrediente en preparaciones blandas (yogur,
                purés, bizcochos). Vigilar siempre alergias en la primera
                exposición.
              </p>
            </div>
          </div>

          <h3>Cómo tostar y conservar frutos secos en casa</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Compra crudos enteros:</span>{' '}
                Mejor calidad y precio que ya tostados con sal. Comprueba la
                fecha de envasado y evita los que tengan polvo, manchas oscuras
                o aroma rancio.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>
                  Tuesta a baja temperatura:
                </span>{' '}
                Horno a 150 °C durante 10-15 minutos, removiendo a media
                cocción. Tostar a más de 180 °C destruye antioxidantes y crea
                acrilamidas. Para almendras enteras: 12 minutos. Avellanas:
                10 minutos. Nueces: 8-10 minutos máximo.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Enfría completamente:</span>{' '}
                Antes de guardar, deja enfriar 30 minutos en una rejilla.
                Frutos secos calientes en un frasco crean condensación y
                aceleran la oxidación.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Guarda herméticamente:</span>{' '}
                Frasco de cristal opaco o lata con tapa hermética, en lugar
                fresco (despensa) y seco. Si vives en zona cálida o vas a
                tardar más de 1 mes en consumirlos, mejor en nevera.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>
                  Congela los más sensibles:
                </span>{' '}
                Nueces, pacanas y nueces de Brasil duran 1-2 años en
                congelador sin perder calidad. Sácalos directamente del
                congelador a la receta o déjalos atemperar 5 minutos.
              </p>
            </div>
          </div>

          <h3>Consejos clave para sacarles partido</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                💧
              </span>
              <p className={styles.tipTexto}>
                Activa los frutos secos: remojarlos 8-12 horas reduce los
                fitatos (antinutrientes) y libera enzimas. Especialmente útil
                para almendras, anacardos y nueces de Brasil.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⚖️
              </span>
              <p className={styles.tipTexto}>
                Pesa antes de comer: un puñado puede ser 30 g o 80 g sin que lo
                notes. La forma más fiable es pesar 25-30 g al inicio del día y
                guardarlos en un cuenco.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🌾
              </span>
              <p className={styles.tipTexto}>
                Muele el lino justo antes de consumir: el lino entero pasa
                intacto por el aparato digestivo. Molido libera omega-3 y
                lignanos. Molido y guardado se oxida en pocos días.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🥛
              </span>
              <p className={styles.tipTexto}>
                Haz tu propia leche vegetal: 1 taza de almendras o anacardos
                remojados + 4 tazas de agua + dátil opcional, batir y colar.
                Más nutritiva y sin aditivos que las comerciales.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🥣
              </span>
              <p className={styles.tipTexto}>
                Combina con vitamina C para absorber hierro: anacardos,
                pistachos y pipas de calabaza tienen hierro vegetal. Acompaña
                con tomate, pimiento rojo o cítricos para multiplicar la
                absorción hasta 3 veces.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              Errores frecuentes con frutos secos
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Comerlos rancios sin notarlo:</strong> los frutos secos
                con grasas oxidadas pierden sus beneficios y aportan compuestos
                pro-inflamatorios. Si saben a "cartón" o "pintura", tíralos.
                Compra en cantidades pequeñas para rotar el stock.
              </li>
              <li>
                <strong>Confundir saciedad con licencia para excederse:</strong>{' '}
                un puñado de almendras (25 g) tiene 145 kcal, pero un cuenco
                "para picar mientras veo la tele" puede ser 200 g y 1.150 kcal.
                La densidad energética es altísima.
              </li>
              <li>
                <strong>Ignorar las alergias cruzadas:</strong> quien tiene
                alergia a frutos secos de árbol (almendra, nuez, anacardo) no
                necesariamente es alérgico al cacahuete (legumbre) y viceversa,
                pero hay que descartarlo siempre con prueba médica antes de
                introducir.
              </li>
              <li>
                <strong>Dárselos enteros a niños menores de 5 años:</strong> el
                riesgo de atragantamiento es real y serio. En menores de 5
                años, siempre molidos o en crema. Las cremas comerciales sin
                azúcar añadido son una alternativa segura.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-frutos-secos')} />
        <ShareCard appName="guia-frutos-secos" />
      </main>

      <Footer appName="guia-frutos-secos" />
    </div>
  );
}
