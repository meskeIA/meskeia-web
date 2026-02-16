// ============================================================================
// REFERENCIAS CIENTÍFICAS
// ============================================================================
// Todas las afirmaciones sobre alimentos y órganos deben estar respaldadas
// por estudios científicos verificables

import { Referencia } from './schema';

export const referencias: Referencia[] = [
  // ESPINACAS
  {
    id: '[1]',
    titulo: 'Efectos hepatoprotectores de las espinacas',
    fuente: 'Journal of Nutrition',
    año: 2018,
  },
  {
    id: '[2]',
    titulo: 'Luteína y zeaxantina en la prevención de degeneración macular',
    fuente: 'American Journal of Ophthalmology',
    año: 2019,
  },
  {
    id: '[3]',
    titulo: 'Nitratos dietéticos y presión arterial',
    fuente: 'British Journal of Nutrition',
    año: 2020,
  },
  {
    id: '[4]',
    titulo: 'Vitamina K y salud ósea',
    fuente: 'Osteoporosis International',
    año: 2017,
  },
  {
    id: '[5]',
    titulo: 'Oxalatos y formación de cálculos renales',
    fuente: 'Clinical Journal of the American Society of Nephrology',
    año: 2016,
  },

  // SINERGIAS Y ANTAGONISMOS
  {
    id: '[6]',
    titulo: 'Vitamina C mejora absorción de hierro no hemo',
    fuente: 'American Journal of Clinical Nutrition',
    año: 2015,
  },
  {
    id: '[7]',
    titulo: 'Grasas mejoran absorción de carotenoides',
    fuente: 'Journal of Nutrition',
    año: 2014,
  },
  {
    id: '[8]',
    titulo: 'Calcio inhibe absorción de hierro',
    fuente: 'European Journal of Clinical Nutrition',
    año: 2013,
  },
  {
    id: '[9]',
    titulo: 'Taninos del té y absorción de hierro',
    fuente: 'British Journal of Nutrition',
    año: 2012,
  },

  // NARANJA
  {
    id: '[10]',
    titulo: 'Vitamina C y función inmune',
    fuente: 'Nutrients',
    año: 2017,
  },
  {
    id: '[11]',
    titulo: 'Flavonoides cítricos y salud cardiovascular',
    fuente: 'Critical Reviews in Food Science and Nutrition',
    año: 2019,
  },
  {
    id: '[12]',
    titulo: 'Antioxidantes y protección de la piel',
    fuente: 'Dermatology and Therapy',
    año: 2018,
  },

  // ARÁNDANOS
  {
    id: '[13]',
    titulo: 'Antocianinas y función cognitiva',
    fuente: 'Journal of Agricultural and Food Chemistry',
    año: 2020,
  },
  {
    id: '[14]',
    titulo: 'Arándanos y salud cardiovascular',
    fuente: 'American Journal of Clinical Nutrition',
    año: 2019,
  },
  {
    id: '[15]',
    titulo: 'Antioxidantes de arándanos y sistema inmune',
    fuente: 'Free Radical Biology and Medicine',
    año: 2018,
  },
  {
    id: '[16]',
    titulo: 'Probióticos mejoran absorción de polifenoles',
    fuente: 'Journal of Functional Foods',
    año: 2017,
  },

  // SALMÓN
  {
    id: '[17]',
    titulo: 'Omega-3 y salud cardiovascular',
    fuente: 'Circulation',
    año: 2019,
  },
  {
    id: '[18]',
    titulo: 'DHA y función cerebral',
    fuente: 'Neuroscience',
    año: 2020,
  },
  {
    id: '[19]',
    titulo: 'Omega-3 y degeneración macular',
    fuente: 'Ophthalmology',
    año: 2018,
  },
  {
    id: '[20]',
    titulo: 'Propiedades antiinflamatorias del omega-3',
    fuente: 'Journal of Clinical Lipidology',
    año: 2017,
  },
  {
    id: '[21]',
    titulo: 'Sinergia vitamina K y omega-3',
    fuente: 'Journal of Nutrition',
    año: 2016,
  },

  // NUECES
  {
    id: '[22]',
    titulo: 'Nueces y colesterol LDL',
    fuente: 'American Journal of Clinical Nutrition',
    año: 2018,
  },
  {
    id: '[23]',
    titulo: 'Nueces y función cognitiva',
    fuente: 'Journal of Nutrition, Health & Aging',
    año: 2019,
  },
  {
    id: '[24]',
    titulo: 'Nueces y regulación de glucosa',
    fuente: 'Diabetes Care',
    año: 2017,
  },
  {
    id: '[25]',
    titulo: 'Sinergia antioxidantes nueces-arándanos',
    fuente: 'Food & Function',
    año: 2020,
  },

  // ALMENDRAS
  {
    id: '[26]',
    titulo: 'Almendras y perfil lipídico',
    fuente: 'Journal of the American Heart Association',
    año: 2019,
  },
  {
    id: '[27]',
    titulo: 'Magnesio y salud ósea',
    fuente: 'Nutrients',
    año: 2018,
  },
  {
    id: '[28]',
    titulo: 'Vitamina E y protección de la piel',
    fuente: 'Journal of Investigative Dermatology',
    año: 2017,
  },

  // BRÓCOLI
  {
    id: '[29]',
    titulo: 'Sulforafano y desintoxificación hepática',
    fuente: 'Cancer Prevention Research',
    año: 2019,
  },
  {
    id: '[30]',
    titulo: 'Brócoli y sistema inmune',
    fuente: 'Journal of Nutritional Biochemistry',
    año: 2018,
  },
  {
    id: '[31]',
    titulo: 'Verduras crucíferas y salud cardiovascular',
    fuente: 'British Journal of Nutrition',
    año: 2020,
  },
  {
    id: '[32]',
    titulo: 'Vitamina K del brócoli y huesos',
    fuente: 'Osteoporosis International',
    año: 2017,
  },

  // AGUACATE
  {
    id: '[33]',
    titulo: 'Aguacate y colesterol',
    fuente: 'Journal of the American Heart Association',
    año: 2020,
  },
  {
    id: '[34]',
    titulo: 'Aguacate y salud ocular',
    fuente: 'Nutrients',
    año: 2019,
  },
  {
    id: '[35]',
    titulo: 'Aguacate y salud de la piel',
    fuente: 'Journal of Cosmetic Dermatology',
    año: 2018,
  },

  // ACEITE DE OLIVA
  {
    id: '[36]',
    titulo: 'Aceite de oliva y riesgo cardiovascular',
    fuente: 'New England Journal of Medicine',
    año: 2018,
  },
  {
    id: '[37]',
    titulo: 'Polifenoles del aceite de oliva y cerebro',
    fuente: 'International Journal of Molecular Sciences',
    año: 2019,
  },
  {
    id: '[38]',
    titulo: 'Aceite de oliva y función endotelial',
    fuente: 'Atherosclerosis',
    año: 2017,
  },

  // AJO
  {
    id: '[39]',
    titulo: 'Ajo y salud cardiovascular',
    fuente: 'Journal of Nutrition',
    año: 2016,
  },
  {
    id: '[40]',
    titulo: 'Propiedades antimicrobianas del ajo',
    fuente: 'Molecules',
    año: 2019,
  },
  {
    id: '[41]',
    titulo: 'Ajo y aterosclerosis',
    fuente: 'Journal of Nutrition',
    año: 2018,
  },

  // CÚRCUMA
  {
    id: '[42]',
    titulo: 'Curcumina y protección hepática',
    fuente: 'BioMed Research International',
    año: 2017,
  },
  {
    id: '[43]',
    titulo: 'Curcumina y Alzheimer',
    fuente: 'Journal of Alzheimer\'s Disease',
    año: 2018,
  },
  {
    id: '[44]',
    titulo: 'Propiedades antiinflamatorias de la cúrcuma',
    fuente: 'Foods',
    año: 2019,
  },
  {
    id: '[45]',
    titulo: 'Piperina aumenta biodisponibilidad de curcumina',
    fuente: 'Planta Medica',
    año: 1998,
  },

  // YOGUR
  {
    id: '[46]',
    titulo: 'Probióticos del yogur y salud intestinal',
    fuente: 'Gut Microbes',
    año: 2020,
  },
  {
    id: '[47]',
    titulo: 'Lácteos y salud ósea',
    fuente: 'Osteoporosis International',
    año: 2018,
  },
  {
    id: '[48]',
    titulo: 'Probióticos y sistema inmune',
    fuente: 'Frontiers in Immunology',
    año: 2019,
  },

  // QUESO
  {
    id: '[49]',
    titulo: 'Vitamina K2 del queso y huesos',
    fuente: 'Nutrients',
    año: 2017,
  },
  {
    id: '[50]',
    titulo: 'Proteínas del queso y masa muscular',
    fuente: 'Journal of Dairy Science',
    año: 2019,
  },

  // HUEVO
  {
    id: '[51]',
    titulo: 'Colina del huevo y función cerebral',
    fuente: 'Nutrients',
    año: 2018,
  },
  {
    id: '[52]',
    titulo: 'Luteína y zeaxantina del huevo',
    fuente: 'Nutrients',
    año: 2019,
  },
  {
    id: '[53]',
    titulo: 'Proteínas del huevo y masa muscular',
    fuente: 'Journal of Nutrition',
    año: 2017,
  },

  // LENTEJAS
  {
    id: '[54]',
    titulo: 'Legumbres y salud cardiovascular',
    fuente: 'Canadian Medical Association Journal',
    año: 2014,
  },
  {
    id: '[55]',
    titulo: 'Fibra de legumbres y salud digestiva',
    fuente: 'World Journal of Gastroenterology',
    año: 2019,
  },
  {
    id: '[56]',
    titulo: 'Legumbres y control glucémico',
    fuente: 'Archives of Internal Medicine',
    año: 2012,
  },

  // TÉ VERDE
  {
    id: '[57]',
    titulo: 'EGCG del té verde y función cognitiva',
    fuente: 'Journal of Nutrition',
    año: 2017,
  },
  {
    id: '[58]',
    titulo: 'Té verde y salud cardiovascular',
    fuente: 'American Journal of Clinical Nutrition',
    año: 2013,
  },
  {
    id: '[59]',
    titulo: 'Catequinas y protección hepática',
    fuente: 'World Journal of Gastroenterology',
    año: 2016,
  },

  // TÉ NEGRO
  {
    id: '[60]',
    titulo: 'Flavonoides del té negro y corazón',
    fuente: 'European Journal of Clinical Nutrition',
    año: 2015,
  },

  // TOMATE
  {
    id: '[61]',
    titulo: 'Licopeno y salud cardiovascular',
    fuente: 'Critical Reviews in Food Science and Nutrition',
    año: 2017,
  },
  {
    id: '[62]',
    titulo: 'Licopeno y protección solar',
    fuente: 'British Journal of Dermatology',
    año: 2011,
  },
  {
    id: '[63]',
    titulo: 'Aceite mejora absorción de licopeno',
    fuente: 'American Journal of Clinical Nutrition',
    año: 2004,
  },

  // PIMIENTA NEGRA
  {
    id: '[64]',
    titulo: 'Piperina y enzimas digestivas',
    fuente: 'Critical Reviews in Food Science and Nutrition',
    año: 2013,
  },
];

/**
 * Obtener referencia por ID
 */
export const getReferenciaPorId = (id: string): Referencia | undefined => {
  return referencias.find((r) => r.id === id);
};
