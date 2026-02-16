// ============================================================================
// BASE DE DATOS: ALIMENTOS (47 alimentos)
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
    descripcion: 'Verdura de hoja verde rica en hierro, vitaminas y antioxidantes, pero alto contenido en oxalatos',
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
          advertencia: 'MUY alto contenido en oxalatos puede contribuir a formación de cálculos renales de oxalato de calcio',
          condicion: 'Si tienes antecedentes de cálculos renales de oxalato',
          nivel: 'alto',
          fuente: '[5]',
        },
        {
          organoId: 'huesos',
          advertencia: 'Oxalatos bloquean absorción del calcio que contienen: solo se absorbe ~5% del calcio de las espinacas',
          condicion: 'Si buscas calcio, kale y brócoli son mejores opciones (bajos en oxalatos)',
          nivel: 'medio',
          fuente: '[97]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'hierro', cantidad: '2.7 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', cantidad: '483 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'folato', cantidad: '194 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-a', nivel: 'alto' },
      { nutrienteId: 'magnesio', nivel: 'medio' },
      { nutrienteId: 'calcio', nivel: 'medio' },
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
        razon: 'Combinación contraproducente: oxalatos (espinacas) bloquean calcio + calcio (queso) reduce hierro',
        fuente: '[8]',
      },
      {
        conAlimentoId: 'yogur',
        razon: 'Oxalatos bloquean absorción del calcio del lácteo. Mejor kale + yogur (bajo en oxalatos)',
        fuente: '[98]',
      },
      {
        conAlimentoId: 'te-negro',
        razon: 'Los taninos del té inhiben la absorción de hierro hasta 60%',
        fuente: '[9]',
      },
      {
        conAlimentoId: 'cafe',
        razon: 'Taninos moderados reducen absorción de hierro 35-40%',
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
    descripcion: 'Pescado azul rico en omega-3 (EPA+DHA) y proteínas de alta calidad',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Omega-3 reduce triglicéridos significativamente, presión arterial y riesgo de arritmias',
          nivel: 'alto',
          fuente: '[17]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'DHA constituye 30-40% de ácidos grasos en corteza cerebral, esencial para función cognitiva y memoria',
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
        {
          organoId: 'higado',
          beneficio: 'Omega-3 reduce inflamación y grasa hepática',
          nivel: 'medio',
          fuente: '[88]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'omega-3', cantidad: '2.3 g por 100g (EPA+DHA)', nivel: 'alto' },
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
      {
        conAlimentoId: 'kale',
        razon: 'Combinación óptima para huesos: vitamina D (salmón) + vitamina K1 y calcio (kale)',
        fuente: '[89]',
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
        razon: 'Probióticos mejoran absorción de antioxidantes de los frutos rojos',
        fuente: '[16]',
      },
      {
        conAlimentoId: 'platano',
        razon: 'Combinación simbiótica perfecta: probiótico (yogur) + prebiótico (plátano) se potencian mutuamente',
        fuente: '[92]',
      },
      {
        conAlimentoId: 'avena',
        razon: 'Probiótico + prebiótico (beta-glucanos de avena) alimentan bacterias beneficiosas',
        fuente: '[93]',
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
    descripcion: 'Lácteo concentrado rico en calcio, vitamina K2 y proteínas',
    organos: {
      beneficiosos: [
        {
          organoId: 'huesos',
          beneficio: 'Muy alto contenido en calcio y vitamina K2 (especialmente quesos curados) para depositar calcio en huesos',
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
    sinergias: [
      {
        conAlimentoId: 'salmon',
        razon: 'Calcio (queso) + vitamina D (salmón) + K2 (queso curado) = sinergia óptima para salud ósea',
        fuente: '[95]',
      },
    ],
    antagonismos: [
      {
        conAlimentoId: 'espinacas',
        razon: 'Más de 500mg de calcio reducen absorción de hierro hasta 50%',
        fuente: '[8]',
      },
      {
        conAlimentoId: 'lentejas',
        razon: 'Calcio compite con hierro por los mismos transportadores intestinales',
        fuente: '[96]',
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
    descripcion: 'Alimento completo rico en proteínas de alto valor biológico, colina y vitaminas',
    organos: {
      beneficiosos: [
        {
          organoId: 'cerebro',
          beneficio: 'La yema es la mejor fuente de colina, precursor de acetilcolina (neurotransmisor para memoria y aprendizaje)',
          nivel: 'alto',
          fuente: '[51]',
        },
        {
          organoId: 'ojos',
          beneficio: 'Luteína y zeaxantina protegen contra degeneración macular (mejor biodisponibles que en vegetales)',
          nivel: 'alto',
          fuente: '[52]',
        },
        {
          organoId: 'musculos',
          beneficio: 'Proteínas de alto valor biológico, óptimas para masa muscular',
          nivel: 'alto',
          fuente: '[53]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Estudios recientes muestran que consumo diario no eleva riesgo cardiovascular en personas sanas',
          nivel: 'medio',
          fuente: '[90]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-b12', nivel: 'alto' },
      { nutrienteId: 'vitamina-d', nivel: 'medio' },
      { nutrienteId: 'vitamina-a', nivel: 'alto' },
      { nutrienteId: 'selenio', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', nivel: 'bajo' },
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
          beneficio: 'Alto contenido en fibra mejora la salud digestiva y alimenta microbiota',
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
      {
        conAlimentoId: 'avena',
        razon: 'Proteínas complementarias: legumbres + cereales forman proteína completa (aminoácidos que se complementan)',
        fuente: '[94]',
      },
    ],
    antagonismos: [
      {
        conAlimentoId: 'te-verde',
        razon: 'Taninos del té reducen absorción de hierro 25-35%. Tomar té 1-2h antes/después de la comida',
        fuente: '[9]',
      },
      {
        conAlimentoId: 'te-negro',
        razon: 'Taninos inhiben absorción de hierro hasta 60%',
        fuente: '[9]',
      },
      {
        conAlimentoId: 'cafe',
        razon: 'Taninos moderados reducen absorción de hierro 35-40%',
        fuente: '[9]',
      },
    ],
  },

  // ============================================================================
  // TÉ Y BEBIDAS
  // ============================================================================
  {
    id: 'te-verde',
    nombre: 'Té Verde',
    categoria: 'especias',
    emoji: '🍵',
    descripcion: 'Infusión con catequinas, L-teanina y cafeína que combinan para "alerta relajada"',
    organos: {
      beneficiosos: [
        {
          organoId: 'cerebro',
          beneficio: 'Combinación natural cafeína + L-teanina produce "alerta relajada" ideal para trabajo cognitivo. EGCG protege neuronas',
          nivel: 'alto',
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
          beneficio: 'EGCG reduce grasa hepática y catequinas protegen contra el daño',
          nivel: 'medio',
          fuente: '[59]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Polifenoles alimentan bacterias beneficiosas y mejoran microbiota',
          nivel: 'medio',
          fuente: '[91]',
        },
      ],
    },
    nutrientes: [],
    sinergias: [],
    antagonismos: [
      {
        conAlimentoId: 'lentejas',
        razon: 'Taninos moderados reducen absorción de hierro 25-35% si se toma con comidas',
        fuente: '[9]',
      },
      {
        conAlimentoId: 'espinacas',
        razon: 'Taninos inhiben absorción de hierro no hemo',
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

  // ============================================================================
  // ALIMENTOS FERMENTADOS Y PROBIÓTICOS
  // ============================================================================
  {
    id: 'kefir',
    nombre: 'Kéfir',
    categoria: 'lacteo',
    emoji: '🥛',
    descripcion: 'Lácteo fermentado con 50+ cepas de probióticos, mayor diversidad que el yogur',
    organos: {
      beneficiosos: [
        {
          organoId: 'intestinos',
          beneficio: 'Más de 50 cepas de probióticos mejoran significativamente la diversidad de la microbiota',
          nivel: 'alto',
          fuente: '[65]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Probióticos modulan la respuesta inmunitaria y fortalecen las defensas',
          nivel: 'alto',
          fuente: '[66]',
        },
        {
          organoId: 'huesos',
          beneficio: 'Calcio y vitamina K2 producida por fermentación apoyan la salud ósea',
          nivel: 'medio',
          fuente: '[67]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'calcio', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', nivel: 'medio' },
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'arandanos',
        razon: 'Probióticos mejoran absorción de antioxidantes de los frutos rojos',
        fuente: '[16]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'cafe',
    nombre: 'Café',
    categoria: 'especias',
    emoji: '☕',
    descripcion: 'Bebida con antioxidantes, polifenoles y efectos hepatoprotectores',
    organos: {
      beneficiosos: [
        {
          organoId: 'higado',
          beneficio: '2-3 tazas diarias reducen significativamente el riesgo de enfermedad hepática',
          nivel: 'alto',
          fuente: '[68]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Cafeína mejora el estado de alerta y la función cognitiva',
          nivel: 'medio',
          fuente: '[69]',
        },
      ],
    },
    nutrientes: [],
    sinergias: [],
    antagonismos: [
      {
        conAlimentoId: 'lentejas',
        razon: 'Taninos moderados reducen absorción de hierro 35-40% si se toma con las comidas',
        fuente: '[9]',
      },
      {
        conAlimentoId: 'espinacas',
        razon: 'Taninos inhiben absorción de hierro no hemo',
        fuente: '[9]',
      },
    ],
  },

  {
    id: 'cacao',
    nombre: 'Cacao Puro / Chocolate Negro 70%+',
    categoria: 'especias',
    emoji: '🍫',
    descripcion: 'Rico en flavanoles, epicatequinas y magnesio para salud cerebral',
    organos: {
      beneficiosos: [
        {
          organoId: 'cerebro',
          beneficio: 'Flavanoles mejoran flujo sanguíneo cerebral y función cognitiva',
          nivel: 'medio',
          fuente: '[70]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Epicatequinas mejoran la salud cardiovascular',
          nivel: 'medio',
          fuente: '[71]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'magnesio', cantidad: '228 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'hierro', nivel: 'alto' },
    ],
    sinergias: [],
    antagonismos: [],
  },

  {
    id: 'avena',
    nombre: 'Avena',
    categoria: 'cereal',
    emoji: '🥣',
    descripcion: 'Cereal integral con beta-glucanos que reducen colesterol',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Beta-glucanos reducen significativamente el colesterol LDL (3g/día mínimo)',
          nivel: 'alto',
          fuente: '[72]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Fibra prebiótica alimenta bacterias beneficiosas',
          nivel: 'alto',
          fuente: '[73]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Liberación lenta de glucosa proporciona energía mental sostenida',
          nivel: 'medio',
          fuente: '[74]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'fibra', cantidad: '10 g por 100g', nivel: 'alto' },
      { nutrienteId: 'magnesio', nivel: 'medio' },
      { nutrienteId: 'hierro', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'nueces',
        razon: 'Proteínas complementarias (cereal + fruto seco)',
        fuente: '[75]',
      },
      {
        conAlimentoId: 'arandanos',
        razon: 'Hierro de avena + vitamina C de arándanos potencian absorción',
        fuente: '[6]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'remolacha',
    nombre: 'Remolacha',
    categoria: 'verdura',
    emoji: '🥕',
    descripcion: 'Raíz rica en nitratos naturales y betaína para hígado y presión arterial',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: '250ml de zumo reducen presión arterial 4-10 mmHg en pocas horas (nitratos → óxido nítrico)',
          nivel: 'alto',
          fuente: '[76]',
        },
        {
          organoId: 'higado',
          beneficio: 'Betaína apoya la metilación hepática y la función desintoxicante',
          nivel: 'medio',
          fuente: '[77]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'folato', nivel: 'alto' },
      { nutrienteId: 'potasio', nivel: 'medio' },
    ],
    sinergias: [],
    antagonismos: [],
  },

  {
    id: 'kale',
    nombre: 'Kale (Col rizada)',
    categoria: 'verdura',
    emoji: '🥬',
    descripcion: 'Verdura crucífera con bajo contenido en oxalatos, mejor que espinacas para calcio',
    organos: {
      beneficiosos: [
        {
          organoId: 'huesos',
          beneficio: 'Bajo en oxalatos (mejor absorción de calcio que espinacas) y rico en vitamina K',
          nivel: 'alto',
          fuente: '[78]',
        },
        {
          organoId: 'higado',
          beneficio: 'Glucosinolatos activan enzimas de desintoxificación fase II',
          nivel: 'alto',
          fuente: '[29]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Nitratos mejoran presión arterial y folato reduce homocisteína',
          nivel: 'medio',
          fuente: '[79]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-k', cantidad: '390 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'calcio', nivel: 'alto' },
      { nutrienteId: 'vitamina-c', nivel: 'alto' },
    ],
    sinergias: [
      {
        conAlimentoId: 'aguacate',
        razon: 'Grasas del aguacate mejoran absorción de vitamina K y otros nutrientes liposolubles',
        fuente: '[7]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'platano',
    nombre: 'Plátano',
    categoria: 'fruta',
    emoji: '🍌',
    descripcion: 'Fruta rica en potasio y prebióticos (inulina), especialmente verde',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Potasio antagoniza el sodio y ayuda a reducir la presión arterial',
          nivel: 'medio',
          fuente: '[80]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Plátano verde contiene almidón resistente (prebiótico) que alimenta bacterias beneficiosas',
          nivel: 'medio',
          fuente: '[81]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Triptófano precursor de serotonina, mejora el ánimo',
          nivel: 'bajo',
          fuente: '[82]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'potasio', cantidad: '358 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-b6', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'yogur',
        razon: 'Combinación simbiótica: prebiótico (plátano) + probiótico (yogur)',
        fuente: '[83]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'cebolla',
    nombre: 'Cebolla',
    categoria: 'verdura',
    emoji: '🧅',
    descripcion: 'Bulbo rico en quercetina, inulina (prebiótico) y compuestos azufrados',
    organos: {
      beneficiosos: [
        {
          organoId: 'intestinos',
          beneficio: 'Inulina (FOS) alimenta bacterias beneficiosas como prebiótico',
          nivel: 'alto',
          fuente: '[84]',
        },
        {
          organoId: 'higado',
          beneficio: 'Compuestos azufrados apoyan la producción de glutatión para desintoxificación',
          nivel: 'medio',
          fuente: '[85]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Quercetina tiene propiedades antioxidantes y antiinflamatorias',
          nivel: 'medio',
          fuente: '[86]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'naranja',
        razon: 'Quercetina (cebolla) + vitamina C (naranja) se potencian mutuamente como antioxidantes',
        fuente: '[87]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // CARNES
  // ============================================================================
  {
    id: 'pollo',
    nombre: 'Pollo (pechuga)',
    categoria: 'carne',
    emoji: '🍗',
    descripcion: 'Carne blanca magra rica en proteínas de alta calidad y baja en grasas saturadas',
    organos: {
      beneficiosos: [
        {
          organoId: 'musculos',
          beneficio: 'Proteína completa con todos los aminoácidos esenciales para masa muscular',
          nivel: 'alto',
          fuente: '[100]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Selenio y zinc apoyan la función inmunitaria',
          nivel: 'medio',
          fuente: '[101]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Bajo en grasas saturadas comparado con carnes rojas',
          nivel: 'medio',
          fuente: '[102]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-b6', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', nivel: 'medio' },
      { nutrienteId: 'selenio', nivel: 'alto' },
      { nutrienteId: 'zinc', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'brocoli',
        razon: 'Proteína (pollo) + fibra y antioxidantes (brócoli) = comida completa equilibrada',
        fuente: '[103]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'ternera',
    nombre: 'Ternera',
    categoria: 'carne',
    emoji: '🥩',
    descripcion: 'Carne roja rica en hierro hemo, zinc y vitamina B12',
    organos: {
      beneficiosos: [
        {
          organoId: 'musculos',
          beneficio: 'Proteínas completas y creatina natural apoyan masa muscular',
          nivel: 'alto',
          fuente: '[104]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Vitamina B12 esencial para función neurológica y prevención de anemia perniciosa',
          nivel: 'alto',
          fuente: '[105]',
        },
      ],
      perjudiciales: [
        {
          organoId: 'corazon',
          advertencia: 'Alto contenido en grasas saturadas puede elevar colesterol LDL si se consume en exceso',
          condicion: 'Moderar consumo (1-2 veces/semana) y elegir cortes magros',
          nivel: 'medio',
          fuente: '[106]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'hierro', cantidad: '2.6 mg por 100g (hemo, alta absorción)', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', cantidad: '2.6 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'zinc', cantidad: '4.8 mg por 100g', nivel: 'alto' },
    ],
    sinergias: [
      {
        conAlimentoId: 'kale',
        razon: 'Vitamina K del kale + proteínas de ternera = comida completa para músculos y huesos',
        fuente: '[107]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'cerdo',
    nombre: 'Cerdo (lomo)',
    categoria: 'carne',
    emoji: '🥓',
    descripcion: 'Carne rica en tiamina (vitamina B1), proteínas y minerales',
    organos: {
      beneficiosos: [
        {
          organoId: 'cerebro',
          beneficio: 'Tiamina esencial para metabolismo energético cerebral y función cognitiva',
          nivel: 'alto',
          fuente: '[108]',
        },
        {
          organoId: 'musculos',
          beneficio: 'Proteínas completas para mantenimiento muscular',
          nivel: 'alto',
          fuente: '[109]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-b6', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', nivel: 'medio' },
      { nutrienteId: 'zinc', nivel: 'medio' },
      { nutrienteId: 'selenio', nivel: 'medio' },
    ],
    sinergias: [],
    antagonismos: [],
  },

  {
    id: 'pavo',
    nombre: 'Pavo',
    categoria: 'carne',
    emoji: '🦃',
    descripcion: 'Carne blanca muy magra con alto contenido en triptófano',
    organos: {
      beneficiosos: [
        {
          organoId: 'musculos',
          beneficio: 'Proteínas magras de alta calidad para masa muscular sin exceso de grasas',
          nivel: 'alto',
          fuente: '[110]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Triptófano precursor de serotonina, mejora el ánimo y calidad del sueño',
          nivel: 'medio',
          fuente: '[111]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Selenio y zinc fortalecen las defensas',
          nivel: 'medio',
          fuente: '[112]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-b6', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', nivel: 'medio' },
      { nutrienteId: 'selenio', nivel: 'alto' },
      { nutrienteId: 'zinc', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'avena',
        razon: 'Carbohidratos complejos (avena) + triptófano (pavo) mejoran absorción de triptófano al cerebro',
        fuente: '[113]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // FRUTAS ADICIONALES
  // ============================================================================
  {
    id: 'manzana',
    nombre: 'Manzana',
    categoria: 'fruta',
    emoji: '🍎',
    descripcion: 'Fruta rica en fibra soluble (pectina), quercetina y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Pectina reduce colesterol LDL y flavonoides mejoran salud cardiovascular',
          nivel: 'alto',
          fuente: '[114]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Pectina actúa como prebiótico alimentando bacterias beneficiosas',
          nivel: 'alto',
          fuente: '[115]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Quercetina protege neuronas contra estrés oxidativo',
          nivel: 'medio',
          fuente: '[116]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', nivel: 'medio' },
      { nutrienteId: 'potasio', nivel: 'medio' },
      { nutrienteId: 'fibra', cantidad: '2.4 g por 100g', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'almendras',
        razon: 'Fibra (manzana) + grasas saludables (almendras) = sensación de saciedad prolongada',
        fuente: '[117]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'fresas',
    nombre: 'Fresas',
    categoria: 'fruta',
    emoji: '🍓',
    descripcion: 'Fruta rica en vitamina C, manganeso y antioxidantes antocianinas',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Antocianinas reducen presión arterial y mejoran perfil lipídico',
          nivel: 'alto',
          fuente: '[118]',
        },
        {
          organoId: 'cerebro',
          beneficio: 'Flavonoides mejoran memoria y retrasan deterioro cognitivo',
          nivel: 'medio',
          fuente: '[119]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Alto contenido en vitamina C fortalece las defensas',
          nivel: 'alto',
          fuente: '[120]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', cantidad: '59 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'folato', nivel: 'medio' },
      { nutrienteId: 'potasio', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'yogur',
        razon: 'Antioxidantes (fresas) + probióticos (yogur) = mejor absorción de polifenoles',
        fuente: '[121]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'kiwi',
    nombre: 'Kiwi',
    categoria: 'fruta',
    emoji: '🥝',
    descripcion: 'Fruta con mayor densidad nutricional, rica en vitamina C, K y actinidina (enzima digestiva)',
    organos: {
      beneficiosos: [
        {
          organoId: 'sistema-inmune',
          beneficio: 'Contiene MÁS vitamina C que la naranja (92 mg vs 53 mg por 100g)',
          nivel: 'alto',
          fuente: '[122]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Actinidina ayuda a digerir proteínas y mejora tránsito intestinal',
          nivel: 'medio',
          fuente: '[123]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Reduce triglicéridos y mejora función cardiovascular',
          nivel: 'medio',
          fuente: '[124]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', cantidad: '92 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', nivel: 'alto' },
      { nutrienteId: 'vitamina-e', nivel: 'medio' },
      { nutrienteId: 'folato', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'pollo',
        razon: 'Actinidina del kiwi mejora la digestión de proteínas animales',
        fuente: '[125]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'pina',
    nombre: 'Piña',
    categoria: 'fruta',
    emoji: '🍍',
    descripcion: 'Fruta tropical rica en bromelina (enzima antiinflamatoria), vitamina C y manganeso',
    organos: {
      beneficiosos: [
        {
          organoId: 'intestinos',
          beneficio: 'Bromelina ayuda a digerir proteínas y reduce inflamación intestinal',
          nivel: 'alto',
          fuente: '[126]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Bromelina tiene propiedades antiinflamatorias e inmunomoduladoras',
          nivel: 'medio',
          fuente: '[127]',
        },
        {
          organoId: 'musculos',
          beneficio: 'Bromelina reduce dolor muscular post-ejercicio',
          nivel: 'medio',
          fuente: '[128]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', cantidad: '48 mg por 100g', nivel: 'medio' },
      { nutrienteId: 'vitamina-b6', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'ternera',
        razon: 'Bromelina ablanda y mejora digestión de carnes (por eso se usa como marinado)',
        fuente: '[129]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // LEGUMBRES ADICIONALES
  // ============================================================================
  {
    id: 'garbanzos',
    nombre: 'Garbanzos',
    categoria: 'legumbre',
    emoji: '🫘',
    descripcion: 'Legumbre rica en proteína vegetal, fibra, hierro y folato',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Fibra y saponinas reducen colesterol LDL y riesgo cardiovascular',
          nivel: 'alto',
          fuente: '[130]',
        },
        {
          organoId: 'pancreas',
          beneficio: 'Bajo índice glucémico ayuda a regular azúcar en sangre',
          nivel: 'alto',
          fuente: '[131]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Alto contenido en fibra alimenta microbiota beneficiosa',
          nivel: 'medio',
          fuente: '[132]',
        },
        {
          organoId: 'huesos',
          beneficio: 'Magnesio, calcio y manganeso apoyan la densidad ósea',
          nivel: 'medio',
          fuente: '[133]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'hierro', cantidad: '2.9 mg por 100g (cocidos)', nivel: 'alto' },
      { nutrienteId: 'folato', cantidad: '172 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'magnesio', nivel: 'medio' },
      { nutrienteId: 'fibra', cantidad: '7.6 g por 100g', nivel: 'alto' },
    ],
    sinergias: [
      {
        conAlimentoId: 'naranja',
        razon: 'Vitamina C mejora absorción de hierro no hemo de los garbanzos',
        fuente: '[6]',
      },
      {
        conAlimentoId: 'avena',
        razon: 'Proteínas complementarias: legumbres + cereales = proteína completa',
        fuente: '[94]',
      },
    ],
    antagonismos: [
      {
        conAlimentoId: 'te-verde',
        razon: 'Taninos del té reducen absorción de hierro 25-35%',
        fuente: '[9]',
      },
      {
        conAlimentoId: 'cafe',
        razon: 'Taninos moderados reducen absorción de hierro 35-40%',
        fuente: '[9]',
      },
    ],
  },

  {
    id: 'judias',
    nombre: 'Judías (Alubias)',
    categoria: 'legumbre',
    emoji: '🫘',
    descripcion: 'Legumbre con alto contenido en proteína, fibra y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Fibra soluble y flavonoides reducen colesterol y presión arterial',
          nivel: 'alto',
          fuente: '[134]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Fibra prebiótica alimenta bacterias beneficiosas',
          nivel: 'alto',
          fuente: '[135]',
        },
        {
          organoId: 'pancreas',
          beneficio: 'Bajo índice glucémico previene picos de azúcar',
          nivel: 'medio',
          fuente: '[136]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'hierro', cantidad: '2.5 mg por 100g (cocidas)', nivel: 'alto' },
      { nutrienteId: 'folato', nivel: 'alto' },
      { nutrienteId: 'magnesio', nivel: 'medio' },
      { nutrienteId: 'fibra', cantidad: '6.4 g por 100g', nivel: 'alto' },
    ],
    sinergias: [
      {
        conAlimentoId: 'tomate',
        razon: 'Vitamina C del tomate mejora absorción de hierro de las judías',
        fuente: '[6]',
      },
    ],
    antagonismos: [
      {
        conAlimentoId: 'queso',
        razon: 'Calcio compite con hierro por los mismos transportadores intestinales',
        fuente: '[96]',
      },
    ],
  },

  {
    id: 'guisantes',
    nombre: 'Guisantes',
    categoria: 'legumbre',
    emoji: '🟢',
    descripcion: 'Legumbre verde rica en proteína vegetal, fibra y vitaminas del grupo B',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Fibra y potasio apoyan la salud cardiovascular',
          nivel: 'medio',
          fuente: '[137]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Fibra mejora tránsito intestinal y alimenta microbiota',
          nivel: 'medio',
          fuente: '[138]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Vitaminas C y K fortalecen las defensas',
          nivel: 'medio',
          fuente: '[139]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
      { nutrienteId: 'vitamina-c', nivel: 'medio' },
      { nutrienteId: 'folato', nivel: 'medio' },
      { nutrienteId: 'fibra', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'zanahoria',
        razon: 'Combinación clásica: fibra + betacarotenos = salud digestiva y visual',
        fuente: '[140]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // VERDURAS ADICIONALES
  // ============================================================================
  {
    id: 'zanahoria',
    nombre: 'Zanahoria',
    categoria: 'verdura',
    emoji: '🥕',
    descripcion: 'Raíz rica en betacarotenos (provitamina A), fibra y antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'ojos',
          beneficio: 'Betacarotenos se convierten en vitamina A, esencial para la visión nocturna y salud ocular',
          nivel: 'alto',
          fuente: '[141]',
        },
        {
          organoId: 'piel',
          beneficio: 'Betacarotenos protegen contra daño solar y mejoran la salud de la piel',
          nivel: 'medio',
          fuente: '[142]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Vitamina A apoya la función inmunitaria y salud de mucosas',
          nivel: 'medio',
          fuente: '[143]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-a', cantidad: '835 µg por 100g (beta-caroteno)', nivel: 'alto' },
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
      { nutrienteId: 'potasio', nivel: 'medio' },
      { nutrienteId: 'fibra', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'aceite-oliva',
        razon: 'Grasas mejoran absorción de betacarotenos liposolubles hasta 600%',
        fuente: '[144]',
      },
      {
        conAlimentoId: 'aguacate',
        razon: 'Grasas del aguacate potencian absorción de vitamina A',
        fuente: '[7]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'pimientos',
    nombre: 'Pimientos (Rojos)',
    categoria: 'verdura',
    emoji: '🫑',
    descripcion: 'Verdura con MÁS vitamina C que la naranja, rica en carotenoides',
    organos: {
      beneficiosos: [
        {
          organoId: 'sistema-inmune',
          beneficio: 'Contiene MÁS vitamina C que las naranjas (127 mg vs 53 mg por 100g)',
          nivel: 'alto',
          fuente: '[145]',
        },
        {
          organoId: 'ojos',
          beneficio: 'Luteína, zeaxantina y capsantina protegen la retina',
          nivel: 'alto',
          fuente: '[146]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Antioxidantes mejoran salud cardiovascular',
          nivel: 'medio',
          fuente: '[147]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', cantidad: '127 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-a', nivel: 'alto' },
      { nutrienteId: 'vitamina-b6', nivel: 'medio' },
      { nutrienteId: 'folato', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'espinacas',
        razon: 'Vitamina C del pimiento mejora absorción de hierro de las espinacas',
        fuente: '[6]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'calabacin',
    nombre: 'Calabacín',
    categoria: 'verdura',
    emoji: '🥒',
    descripcion: 'Verdura baja en calorías, rica en agua, potasio y vitaminas',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Potasio ayuda a regular la presión arterial',
          nivel: 'medio',
          fuente: '[148]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Fibra soluble e insoluble mejora el tránsito intestinal',
          nivel: 'medio',
          fuente: '[149]',
        },
        {
          organoId: 'ojos',
          beneficio: 'Luteína y zeaxantina protegen la salud ocular',
          nivel: 'bajo',
          fuente: '[150]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-c', nivel: 'medio' },
      { nutrienteId: 'potasio', nivel: 'medio' },
      { nutrienteId: 'folato', nivel: 'bajo' },
    ],
    sinergias: [
      {
        conAlimentoId: 'aceite-oliva',
        razon: 'Al cocinar con aceite de oliva se mejora la biodisponibilidad de carotenoides',
        fuente: '[151]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'pepino',
    nombre: 'Pepino',
    categoria: 'verdura',
    emoji: '🥒',
    descripcion: 'Verdura muy hidratante (96% agua), baja en calorías con antioxidantes',
    organos: {
      beneficiosos: [
        {
          organoId: 'rinones',
          beneficio: 'Alto contenido en agua promueve hidratación y función renal',
          nivel: 'medio',
          fuente: '[152]',
        },
        {
          organoId: 'piel',
          beneficio: 'Sílice y antioxidantes apoyan la salud de la piel',
          nivel: 'medio',
          fuente: '[153]',
        },
        {
          organoId: 'corazon',
          beneficio: 'Potasio ayuda a regular la presión arterial',
          nivel: 'bajo',
          fuente: '[154]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
      { nutrienteId: 'potasio', nivel: 'bajo' },
      { nutrienteId: 'vitamina-c', nivel: 'bajo' },
    ],
    sinergias: [
      {
        conAlimentoId: 'yogur',
        razon: 'Combinación refrescante que mejora digestión (tzatziki)',
        fuente: '[155]',
      },
    ],
    antagonismos: [],
  },

  {
    id: 'apio',
    nombre: 'Apio',
    categoria: 'verdura',
    emoji: '🥬',
    descripcion: 'Verdura baja en calorías, con apigenina y ftalidas que reducen presión arterial',
    organos: {
      beneficiosos: [
        {
          organoId: 'corazon',
          beneficio: 'Ftalidas relajan las paredes arteriales y reducen la presión arterial',
          nivel: 'medio',
          fuente: '[156]',
        },
        {
          organoId: 'intestinos',
          beneficio: 'Fibra insoluble mejora el tránsito intestinal',
          nivel: 'medio',
          fuente: '[157]',
        },
        {
          organoId: 'rinones',
          beneficio: 'Propiedades diuréticas suaves apoyan función renal',
          nivel: 'bajo',
          fuente: '[158]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'vitamina-k', nivel: 'medio' },
      { nutrienteId: 'folato', nivel: 'bajo' },
      { nutrienteId: 'potasio', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'manzana',
        razon: 'Combinación de fibras + flavonoides = efecto antioxidante potenciado',
        fuente: '[159]',
      },
    ],
    antagonismos: [],
  },

  // ============================================================================
  // CARNE ADICIONAL
  // ============================================================================
  {
    id: 'cordero',
    nombre: 'Cordero',
    categoria: 'carne',
    emoji: '🥩',
    descripcion: 'Carne roja rica en proteínas, hierro hemo, zinc y vitamina B12',
    organos: {
      beneficiosos: [
        {
          organoId: 'musculos',
          beneficio: 'Proteínas completas y aminoácidos esenciales para masa muscular',
          nivel: 'alto',
          fuente: '[160]',
        },
        {
          organoId: 'sistema-inmune',
          beneficio: 'Zinc apoya la función inmunitaria y cicatrización',
          nivel: 'medio',
          fuente: '[161]',
        },
      ],
      perjudiciales: [
        {
          organoId: 'corazon',
          advertencia: 'Alto contenido en grasas saturadas puede elevar colesterol LDL',
          condicion: 'Moderar consumo (1-2 veces/semana) y elegir cortes magros',
          nivel: 'medio',
          fuente: '[162]',
        },
      ],
    },
    nutrientes: [
      { nutrienteId: 'hierro', cantidad: '1.9 mg por 100g (hemo)', nivel: 'alto' },
      { nutrienteId: 'vitamina-b12', cantidad: '2.6 µg por 100g', nivel: 'alto' },
      { nutrienteId: 'zinc', cantidad: '4.2 mg por 100g', nivel: 'alto' },
      { nutrienteId: 'vitamina-b6', nivel: 'medio' },
    ],
    sinergias: [
      {
        conAlimentoId: 'remolacha',
        razon: 'Hierro hemo (cordero) + nitratos (remolacha) = mejor oxigenación muscular',
        fuente: '[163]',
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
