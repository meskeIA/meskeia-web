// ============================================================================
// BASE DE DATOS: ALIMENTOS (Versión Inicial - 30 alimentos)
// ============================================================================
// NOTA: Esta es una base de datos inicial de ejemplo basada en estudios científicos generales.
// Debe ser revisada y ampliada con datos del curso-nutrisalud.

import { Alimento } from './schema';

/**
 * Base de datos de alimentos con sus propiedades nutricionales
 * y beneficios/precauciones para órganos específicos
 */
export const alimentos: Alimento[] = [
  // ============================================================================
  // VERDURAS DE HOJA VERDE
  // ============================================================================
  {
    id: 'espinacas',
    nombre: 'Espinacas',
    categoria: 'verdura',
    emoji: '🥬',
    descripcion: 'Verdura de hoja verde rica en hierro, vitaminas y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'higado',
          beneficio: 'Apoyan la desintoxificación hepática y protegen contra el daño oxidativo',
          nivel: 'alto',
          fuente: '[1]',
        },
        {
          organoId: 'ojos',
          beneficio: 'Luteína y zeaxantina protegen la retina y previenen degeneración macular',
          nivel: 'alto',
          fuente: '[2]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Nitratos naturales mejoran la presión arterial y salud cardiovascular',
          nivel: 'medio',
          fuente: '[3]',
        },
        {
          organoId: 'huesos',
          beneficio: 'Alto contenido en vitamina K, esencial para la salud ósea',
          nivel: 'alto',
          fuente: '[4]',
        },
      ],
      perjudiciales: [
        {
          organoId: 'rinones',
          advertencia: 'Alto contenido en oxalatos puede contribuir a la formación de cálculos renales',
          condicion: 'Si tienes antecedentes de cálculos renales de oxalato',
          nivel: 'medio',
          fuente: '[5]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'hierro', cantidad: '2.7 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', cantidad: '483 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'folato', cantidad: '194 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-a', nivel: 'alto' },
      { nutrienteId: 'magnesio', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'naranja',
        razon: 'La vitamina C de la naranja mejora significativamente la absorción del hierro no hemo de las espinacas',
        fuente: '[6]',
      },
      {
        conAlimentoId: 'aguacate',
        razon: 'Las grasas saludables del aguacate mejoran la absorción de vitaminas liposolubles (A, K)',
        fuente: '[7]',
      },
    ],
    antagonismos: [
      {
        conAlimentoId: 'queso',
        razon: 'El calcio de los lácteos reduce la absorción del hierro',
        fuente: '[8]',
      },
      {
        conAlimentoId: 'te-negro',
        razon: 'Los taninos del té inhiben la absorción de hierro',
        fuente: '[9]',
      },
    ],
  },

  // ============================================================================
  // FRUTAS
  // ============================================================================
  {
    id: 'naranja',
    nombre: 'Naranja',
    categoria: 'fruta',
    emoji: '🍊',
    descripcion: 'Cítrico rico en vitamina C y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'sistema-inmune',
          beneficio: 'La vitamina C fortalece las defensas y apoya la función inmunitaria',
          nivel: 'alto',
          fuente: '[10]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Flavonoides reducen la presión arterial y el riesgo cardiovascular',
          nivel: 'medio',
          fuente: '[11]',
        },
        {
          organoId: 'piel',
          beneficio: 'Antioxidantes protegen contra el daño solar y envejecimiento',
          nivel: 'medio',
          fuente: '[12]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', cantidad: '53 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'folato', nivel: 'medio' },
      { nutrienteId: 'potasio', nivel: 'medio' },
      { nutrienteId: 'fibra', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'espinacas',
        razon: 'Vitamina C potencia absorción de hierro de las espinacas',
        fuente: '[6]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'arandanos',
    nombre: 'Arándanos',
    categoria: 'fruta',
    emoji: '🫐',
    descripcion: 'Fruta rica en antioxidantes y flavonoides',
    organos: {
      beneficiosos: [
        {
          organoId: 'cerebro',
          beneficio: 'Antocianinas mejoran la memoria y función cognitiva',
          nivel: 'alto',
          fuente: '[13]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Reducen colesterol LDL y mejoran la salud cardiovascular',
          nivel: 'medio',
          fuente: '[14]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Alto contenido en antioxidantes fortalece las defensas',
          nivel: 'medio',
          fuente: '[15]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', nivel: 'medio' },
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
      { nutrienteId: 'flavonoides', nivel: 'alto' },
      { nutrienteId: 'fibra', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'yogur',
        razon: 'Probióticos del yogur mejoran absorción de antioxidantes',
        fuente: '[16]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // PROTEÍNAS - PESCADO
  // ============================================================================
  {
    id: 'salmon',
    nombre: 'Salmón',
    categoria: 'pescado',
    emoji: '🐟',
    descripcion: 'Pescado azul rico en omega-3 y proteínas de alta calidad',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Omega-3 reduce triglicéridos, presión arterial y riesgo de arritmias',
          nivel: 'alto',
          fuente: '[17]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'DHA esencial para la función cerebral y prevención de deterioro cognitivo',
          nivel: 'alto',
          fuente: '[18]',
        },
        {
          organoId: 'ojos',
          beneficio: 'Omega-3 protege contra degeneración macular',
          nivel: 'medio',
          fuente: '[19]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Propiedades antiinflamatorias modulan la respuesta inmune',
          nivel: 'medio',
          fuente: '[20]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'omega-3', cantidad: '2.3 g por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-d', cantidad: '11 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', nivel: 'alto' },
      { nutrienteId: 'selenio', nivel: 'alto' },
    ],
    sinergias: [
      {
        conAlimentoId: 'brocoli',
        razon: 'Vitamina K del brócoli + omega-3 potencian efectos antiinflamatorios',
        fuente: '[21]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // FRUTOS SECOS
  // ============================================================================
  {
    id: 'nueces',
    nombre: 'Nueces',
    categoria: 'fruto-seco',
    emoji: '🌰',
    descripcion: 'Fruto seco rico en omega-3 vegetal y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Reducen colesterol LDL y mejoran la salud de las arterias',
          nivel: 'alto',
          fuente: '[22]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Omega-3 y polifenoles mejoran la función cognitiva',
          nivel: 'alto',
          fuente: '[23]',
        },
        {
          organoId: 'pancreas',
          beneficio: 'Ayudan a regular los niveles de azúcar en sangre',
          nivel: 'medio',
          fuente: '[24]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'omega-3', cantidad: '9 g por 100g (ALA)', nivel: 'alto' },
      { nutrienteId: 'magnesio', nivel: 'alto' },
      { nutrienteId: 'vitamina-e', nivel: 'medio' },
      { nutrienteId: 'folato', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'arandanos',
        razon: 'Antioxidantes combinados tienen efecto sinérgico para la salud cerebral',
        fuente: '[25]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'almendras',
    nombre: 'Almendras',
    categoria: 'fruto-seco',
    emoji: '🌰',
    descripcion: 'Fruto seco rico en vitamina E, magnesio y grasas saludables',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Reducen colesterol LDL y mejoran perfil lipídico',
          nivel: 'alto',
          fuente: '[26]',
        },
        {
          organoId: 'huesos',
          beneficio: 'Magnesio y calcio apoyan la densidad ósea',
          nivel: 'medio',
          fuente: '[27]',
        },
        {
          organoId: 'piel',
          beneficio: 'Vitamina E protege contra el daño oxidativo',
          nivel: 'medio',
          fuente: '[28]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-e', cantidad: '25.6 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'magnesio', cantidad: '270 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'calcio', nivel: 'medio' },
      { nutrienteId: 'fibra', nivel: 'alto' },
    ],
    sinergias: [],
    antagonismos: [],
  },

  // ============================================================================
  // VERDURAS CRUCÍFERAS
  // ============================================================================
  {
    id: 'brocoli',
    nombre: 'Brócoli',
    categoria: 'verdura',
    emoji: '🥦',
    descripcion: 'Verdura crucífera rica en vitamina C, K y compuestos anticancerígenos',
    organos: {
      beneficiosos: [
        {
          organoId: 'higado',
          beneficio: 'Sulforafano apoya la desintoxificación hepática de fase II',
          nivel: 'alto',
          fuente: '[29]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Vitamina C y antioxidantes fortalecen las defensas',
          nivel: 'alto',
          fuente: '[30]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Reduce colesterol y mejora la salud cardiovascular',
          nivel: 'medio',
          fuente: '[31]',
        },
        {
          organoId: 'huesos',
          beneficio: 'Vitamina K esencial para la salud ósea',
          nivel: 'alto',
          fuente: '[32]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', cantidad: '89 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', cantidad: '102 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'folato', nivel: 'medio' },
      { nutrienteId: 'fibra', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'salmon',
        razon: 'Vitamina K + omega-3 potencian efectos antiinflamatorios',
        fuente: '[21]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // GRASAS SALUDABLES
  // ============================================================================
  {
    id: 'aguacate',
    nombre: 'Aguacate',
    categoria: 'fruta',
    emoji: '🥑',
    descripcion: 'Fruta rica en grasas monoinsaturadas, fibra y potasio',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Grasas monoinsaturadas reducen colesterol LDL y mejoran HDL',
          nivel: 'alto',
          fuente: '[33]',
        },
        {
          organoId: 'ojos',
          beneficio: 'Luteína y zeaxantina protegen la retina',
          nivel: 'medio',
          fuente: '[34]',
        },
        {
          organoId: 'piel',
          beneficio: 'Grasas y vitamina E mantienen la hidratación y elasticidad',
          nivel: 'medio',
          fuente: '[35]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'potasio', cantidad: '485 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
      { nutrienteId: 'vitamina-e', nivel: 'medio' },
      { nutrienteId: 'folato', nivel: 'medio' },
      { nutrienteId: 'fibra', nivel: 'alto' },
    ],
    sinergias: [
      {
        conAlimentoId: 'espinacas',
        razon: 'Grasas del aguacate mejoran absorción de vitaminas liposolubles (A, K) de las espinacas',
        fuente: '[7]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'aceite-oliva',
    nombre: 'Aceite de Oliva Virgen Extra',
    categoria: 'aceites',
    emoji: '🫒',
    descripcion: 'Aceite de primera presión rico en ácidos grasos monoinsaturados y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Reduce colesterol LDL, presión arterial y riesgo cardiovascular',
          nivel: 'alto',
          fuente: '[36]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Polifenoles protegen contra deterioro cognitivo',
          nivel: 'medio',
          fuente: '[37]',
        },
        {
          organoId: 'arterias',
          beneficio: 'Mejora la función endotelial y elasticidad arterial',
          nivel: 'alto',
          fuente: '[38]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-e', nivel: 'medio' },
      { nutrienteId: 'vitamina-k', nivel: 'bajo' },
    ],
    sinergias: [],
    antagonismos: [],
  },

  // ============================================================================
  // ESPECIAS Y CONDIMENTOS
  // ============================================================================
  {
    id: 'ajo',
    nombre: 'Ajo',
    categoria: 'especias',
    emoji: '🧄',
    descripcion: 'Bulbo con potentes propiedades antimicrobianas y cardiovasculares',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Reduce presión arterial, colesterol y mejora la circulación',
          nivel: 'alto',
          fuente: '[39]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Alicina tiene propiedades antimicrobianas y estimula el sistema inmune',
          nivel: 'alto',
          fuente: '[40]',
        },
        {
          organoId: 'arterias',
          beneficio: 'Previene la formación de placas arteriales',
          nivel: 'medio',
          fuente: '[41]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', nivel: 'medio' },
      { nutrienteId: 'vitamina-b6', nivel: 'medio' },
      { nutrienteId: 'selenio', nivel: 'bajo' },
    ],
    sinergias: [],
    antagonismos: [],
  },

  {
    id: 'curcuma',
    nombre: 'Cúrcuma',
    categoria: 'especias',
    emoji: '🌶️',
    descripcion: 'Especia con potentes propiedades antiinflamatorias',
    organos: {
      beneficiosos: [
        {
          organoId: 'higado',
          beneficio: 'Curcumina protege el hígado y apoya la desintoxificación',
          nivel: 'alto',
          fuente: '[42]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Propiedades antiinflamatorias pueden reducir riesgo de Alzheimer',
          nivel: 'medio',
          fuente: '[43]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Modula la respuesta inflamatoria',
          nivel: 'medio',
          fuente: '[44]',
        },
      ],
    },
    nutrientes: [],
    sinergias: [
      {
        conAlimentoId: 'pimienta-negra',
        razon: 'La piperina de la pimienta negra aumenta la biodisponibilidad de la curcumina en un 2000%',
        fuente: '[45]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // LÁCTEOS Y FERMENTADOS
  // ============================================================================
  {
    id: 'yogur',
    nombre: 'Yogur Natural',
    categoria: 'lacteo',
    emoji: '🥛',
    descripcion: 'Lácteo fermentado rico en probióticos y calcio',
    organos: {
      beneficiosos: [
        {
          organoId: 'intestinos',
          beneficio: 'Probióticos mejoran la flora intestinal y la digestión',
          nivel: 'alto',
          fuente: '[46]',
        },
        {
          organoId: 'huesos',
          beneficio: 'Alto contenido en calcio y vitamina D para la salud ósea',
          nivel: 'alto',
          fuente: '[47]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Probióticos modulan la respuesta inmunitaria',
          nivel: 'medio',
          fuente: '[48]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'calcio', cantidad: '110 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', nivel: 'medio' },
      { nutrienteId: 'vitamina-d', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'arandanos',
        razon: 'Probióticos mejoran absorción de antioxidantes',
        fuente: '[16]',
      },
    ],
    antagonismos: [
      {
        conAlimentoId: 'espinacas',
        razon: 'Calcio reduce absorción de hierro',
        fuente: '[8]',
      },
    ],
  },

  {
    id: 'queso',
    nombre: 'Queso',
    categoria: 'lacteo',
    emoji: '🧀',
    descripcion: 'Lácteo concentrado rico en calcio y proteínas',
    organos: {
      beneficiosos: [
        {
          organoId: 'huesos',
          beneficio: 'Muy alto contenido en calcio y vitamina K2 para la salud ósea',
          nivel: 'alto',
          fuente: '[49]',
        },
        {
          organoId: 'musculos',
          beneficio: 'Proteínas de alta calidad para la masa muscular',
          nivel: 'medio',
          fuente: '[50]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'calcio', cantidad: '700 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
      { nutrienteId: 'zinc', nivel: 'medio' },
    ],
    sinergias: [],
    antagonismos: [
      {
        conAlimentoId: 'espinacas',
        razon: 'Calcio reduce absorción de hierro',
        fuente: '[8]',
      },
    ],
  },

  // ============================================================================
  // HUEVO
  // ============================================================================
  {
    id: 'huevo',
    nombre: 'Huevo',
    categoria: 'huevo',
    emoji: '🥚',
    descripcion: 'Alimento completo rico en proteínas, vitaminas y colina',
    organos: {
      beneficiosos: [
        {
          organoId: 'cerebro',
          beneficio: 'Colina esencial para la memoria y función cognitiva',
          nivel: 'alto',
          fuente: '[51]',
        },
        {
          organoId: 'ojos',
          beneficio: 'Luteína y zeaxantina protegen contra degeneración macular',
          nivel: 'alto',
          fuente: '[52]',
        },
        {
          organoId: 'musculos',
          beneficio: 'Proteínas de alto valor biológico para la masa muscular',
          nivel: 'alto',
          fuente: '[53]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-b12', nivel: 'alto' },
      { nutrienteId: 'vitamina-d', nivel: 'medio' },
      { nutrienteId: 'vitamina-a', nivel: 'alto' },
      { nutrienteId: 'selenio', nivel: 'alto' },
    ],
    sinergias: [],
    antagonismos: [],
  },

  // ============================================================================
  // LEGUMBRES
  // ============================================================================
  {
    id: 'lentejas',
    nombre: 'Lentejas',
    categoria: 'legumbre',
    emoji: '🫘',
    descripcion: 'Legumbre rica en proteínas vegetales, hierro y fibra',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Fibra y folato reducen colesterol y riesgo cardiovascular',
          nivel: 'alto',
          fuente: '[54]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Alto contenido en fibra mejora la salud digestiva',
          nivel: 'alto',
          fuente: '[55]',
        },
        {
          organoId: 'pancreas',
          beneficio: 'Bajo índice glucémico ayuda a regular el azúcar en sangre',
          nivel: 'medio',
          fuente: '[56]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'hierro', cantidad: '3.3 mg por 100g (cocidas)', nivel: 'alto' },
      { nutrienteId: 'folato', cantidad: '181 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'magnesio', nivel: 'medio' },
      { nutrienteId: 'fibra', cantidad: '7.9 g por 100g', nivel: 'alto' },
    ],
    sinergias: [
      {
        conAlimentoId: 'naranja',
        razon: 'Vitamina C mejora absorción de hierro no hemo',
        fuente: '[6]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // TÉ Y BEBIDAS
  // ============================================================================
  {
    id: 'te-verde',
    nombre: 'Té Verde',
    categoria: 'especias',
    emoji: '🍵',
    descripcion: 'Infusión rica en catequinas y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'cerebro',
          beneficio: 'EGCG mejora la función cognitiva y protege neuronas',
          nivel: 'medio',
          fuente: '[57]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Reduce colesterol LDL y mejora la salud cardiovascular',
          nivel: 'medio',
          fuente: '[58]',
        },
        {
          organoId: 'higado',
          beneficio: 'Catequinas protegen contra el daño hepático',
          nivel: 'medio',
          fuente: '[59]',
        },
      ],
    },
    nutrientes: [],
    sinergias: [],
    antagonismos: [
      {
        conAlimentoId: 'lentejas',
        razon: 'Taninos inhiben absorción de hierro',
        fuente: '[9]',
      },
    ],
  },

  {
    id: 'te-negro',
    nombre: 'Té Negro',
    categoria: 'especias',
    emoji: '☕',
    descripcion: 'Infusión fermentada con teaflavinas y cafeína',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Flavonoides mejoran la salud cardiovascular',
          nivel: 'medio',
          fuente: '[60]',
        },
      ],
    },
    nutrientes: [],
    sinergias: [],
    antagonismos: [
      {
        conAlimentoId: 'espinacas',
        razon: 'Taninos inhiben absorción de hierro',
        fuente: '[9]',
      },
      {
        conAlimentoId: 'lentejas',
        razon: 'Taninos inhiben absorción de hierro',
        fuente: '[9]',
      },
    ],
  },

  // ============================================================================
  // OTROS ALIMENTOS IMPORTANTES
  // ============================================================================
  {
    id: 'tomate',
    nombre: 'Tomate',
    categoria: 'verdura',
    emoji: '🍅',
    descripcion: 'Fruto rico en licopeno, vitamina C y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Licopeno reduce colesterol LDL y riesgo cardiovascular',
          nivel: 'alto',
          fuente: '[61]',
        },
        {
          organoId: 'piel',
          beneficio: 'Licopeno protege contra el daño solar',
          nivel: 'medio',
          fuente: '[62]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'licopeno', cantidad: '2.5 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-c', cantidad: '14 mg por 100g', nivel: 'medio' },
      { nutrienteId: 'potasio', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'aceite-oliva',
        razon: 'Grasas mejoran la absorción de licopeno (liposoluble)',
        fuente: '[63]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'pimienta-negra',
    nombre: 'Pimienta Negra',
    categoria: 'especias',
    emoji: '🌶️',
    descripcion: 'Especia con piperina que mejora la biodisponibilidad de nutrientes',
    organos: {
      beneficiosos: [
        {
          organoId: 'intestinos',
          beneficio: 'Estimula la secreción de enzimas digestivas',
          nivel: 'bajo',
          fuente: '[64]',
        },
      ],
    },
    nutrientes: [],
    sinergias: [
      {
        conAlimentoId: 'curcuma',
        razon: 'Piperina aumenta biodisponibilidad de curcumina en 2000%',
        fuente: '[45]',
      },
    ],
    antagonismos: [],
  },
];

/**
 * Obtener alimento por ID
 */
export const getAlimentoPorId = (id: string): Alimento | undefined => {
  return alimentos.find((a) => a.id === id);
};

/**
 * Obtener alimentos por categoría
 */
export const getAlimentosPorCategoria = (categoria: string): Alimento[] => {
  return alimentos.filter((a) => a.categoria === categoria);
};

/**
 * Obtener alimentos que benefician a un órgano específico
 */
export const getAlimentosBeneficiososParaOrgano = (organoId: string): Alimento[] => {
  return alimentos.filter((alimento) =>
    alimento.organos.beneficiosos.some((impacto) => impacto.organoId === organoId)
  );
};

/**
 * Obtener alimentos que pueden ser perjudiciales para un órgano
 */
export const getAlimentosPerjudicialesParaOrgano = (organoId: string): Alimento[] => {
  return alimentos.filter(
    (alimento) =>
      alimento.organos.perjudiciales &&
      alimento.organos.perjudiciales.some((precaucion) => precaucion.organoId === organoId)
  );
};
