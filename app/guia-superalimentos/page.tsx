'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './GuiaSuperalimentos.module.css';
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

type CategoriaSuperalimento =
  | 'Frutas y bayas'
  | 'Verduras y hojas'
  | 'Semillas y frutos secos'
  | 'Algas y mar'
  | 'Cereales ancestrales'
  | 'Fermentados'
  | 'Hongos medicinales'
  | 'Especias y raíces';

interface Superalimento {
  nombre: string;
  nombreCientifico?: string;
  origen: string;
  categoria: CategoriaSuperalimento;
  nutrientesDestacados: string[];
  beneficiosTradicionales: string[];
  comoConsumirlo: string[];
  cantidadOrientativa: string;
  contraindicaciones: string;
  combinaBien: string[];
  descripcion: string;
  curiosidad: string;
}

// ============================================================
// DATOS
// ============================================================

const CATEGORIAS: Array<CategoriaSuperalimento | 'Todas'> = [
  'Todas',
  'Frutas y bayas',
  'Verduras y hojas',
  'Semillas y frutos secos',
  'Algas y mar',
  'Cereales ancestrales',
  'Fermentados',
  'Hongos medicinales',
  'Especias y raíces',
];

const SUPERALIMENTOS: Superalimento[] = [
  {
    nombre: 'Arándanos', nombreCientifico: 'Vaccinium myrtillus', origen: 'América del Norte y Europa',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Antocianinas', 'Vitamina C', 'Vitamina K', 'Manganeso', 'Fibra'],
    beneficiosTradicionales: ['Mejora la visión nocturna', 'Antioxidante potente', 'Memoria y función cognitiva', 'Salud cardiovascular'],
    comoConsumirlo: ['Frescos solos', 'En smoothies', 'Con yogur', 'Congelados todo el año'],
    cantidadOrientativa: '100–150 g/día (1 puñado generoso)',
    contraindicaciones: 'Interacción posible con anticoagulantes (warfarina). Consultar si se toma medicación.',
    combinaBien: ['Avena', 'Yogur griego', 'Semillas de chía', 'Espinacas'],
    descripcion: 'Los arándanos encabezan la mayoría de listas de superalimentos por su extraordinaria densidad de antioxidantes. Sus antocianinas (los pigmentos azul-morado) son los responsables de sus beneficios: protegen las células del estrés oxidativo, mejoran la circulación y tienen efectos antiinflamatorios bien documentados en estudios clínicos.',
    curiosidad: 'Los arándanos silvestres tienen hasta 10 veces más antioxidantes que los cultivados. En Suecia y Finlandia, la recolección de arándanos silvestres es un derecho consuetudinario: cualquier persona puede recoger arándanos en bosques públicos o privados bajo el "allemansrätten" (derecho de todo el mundo).',
  },
  {
    nombre: 'Espinacas', nombreCientifico: 'Spinacia oleracea', origen: 'Persia (actual Irán)',
    categoria: 'Verduras y hojas',
    nutrientesDestacados: ['Hierro', 'Vitamina K', 'Vitamina A', 'Folato', 'Magnesio', 'Luteína'],
    beneficiosTradicionales: ['Fortalece huesos', 'Salud visual', 'Prevención anemia', 'Antiinflamatorio'],
    comoConsumirlo: ['Crudas en ensaladas', 'Salteadas', 'En batidos verdes', 'En sopas'],
    cantidadOrientativa: '100–200 g/día (cruda o cocida)',
    contraindicaciones: 'Alto en oxalatos: limitar en personas con tendencia a cálculos renales. El hierro vegetal se absorbe mejor con vitamina C.',
    combinaBien: ['Limón', 'Ajo', 'Tomate', 'Huevo', 'Nueces'],
    descripcion: 'Las espinacas son el vegetal de hoja verde con mayor densidad nutricional. Ricas en hierro no hemo, folato, vitamina K y carotenoides, son el alimento por excelencia de las dietas basadas en plantas. La luteína y zeaxantina que contienen son los mejores nutrientes conocidos para la salud macular.',
    curiosidad: 'El famoso efecto de Popeye (espinacas = fuerza inmediata) se basó en un error tipográfico del siglo XIX: un nutricionista alemán calculó erróneamente el contenido de hierro multiplicándolo por 10. El mito del hierro "superpotente" de las espinacas persiste hoy pese a que el hierro vegetal se absorbe peor que el animal.',
  },
  {
    nombre: 'Semillas de chía', nombreCientifico: 'Salvia hispanica', origen: 'México y Guatemala',
    categoria: 'Semillas y frutos secos',
    nutrientesDestacados: ['Omega-3 (ALA)', 'Fibra (36%)', 'Calcio', 'Proteína completa', 'Antioxidantes'],
    beneficiosTradicionales: ['Saciedad duradera', 'Salud intestinal', 'Energía sostenida', 'Salud cardiovascular'],
    comoConsumirlo: ['Remojadas en agua/leche (chia pudding)', 'En smoothies', 'Sobre yogur', 'En masas de pan'],
    cantidadOrientativa: '15–25 g/día (1–2 cucharadas)',
    contraindicaciones: 'Remojar siempre antes de consumir: secas pueden causar problemas al tragar. Aumentar la ingesta de agua.',
    combinaBien: ['Leche vegetal', 'Cacao', 'Mango', 'Avena'],
    descripcion: 'Las semillas de chía eran el alimento de energía de los guerreros aztecas. Su contenido en fibra soluble es extraordinario: absorben hasta 12 veces su peso en agua, formando un gel que ralentiza la digestión y proporciona saciedad prolongada. Su perfil de omega-3 vegetal es de los mejores del reino vegetal.',
    curiosidad: 'En el Códice Mendocino (siglo XVI), la chía (llamada "chian") aparece como uno de los tributos que los pueblos conquistados pagaban al Imperio Azteca, junto con el maíz, el cacao y el amaranto. Era considerada tan valiosa como el oro para los mexicas.',
  },
  {
    nombre: 'Spirulina', nombreCientifico: 'Arthrospira platensis', origen: 'África y América Central (lagos alcalinos)',
    categoria: 'Algas y mar',
    nutrientesDestacados: ['Proteína completa (60–70%)', 'Vitamina B12', 'Hierro', 'Beta-caroteno', 'Ficocianina'],
    beneficiosTradicionales: ['Fuente proteica vegetal', 'Energía y vitalidad', 'Sistema inmune', 'Desintoxicante'],
    comoConsumirlo: ['1 cucharadita en agua/zumo', 'En smoothies (camufla el sabor)', 'En batidos de proteínas', 'En polvo sobre ensaladas'],
    cantidadOrientativa: '3–5 g/día (1 cucharadita de polvo)',
    contraindicaciones: 'No apta para personas con fenilcetonuria. Riesgo de contaminación con cianobacterias si no es de calidad certificada. Comprar siempre producto testado.',
    combinaBien: ['Plátano', 'Mango', 'Jengibre', 'Limón'],
    descripcion: 'La espirulina es una cianobacteria (erróneamente llamada alga) con el contenido proteico más alto de cualquier alimento conocido: hasta el 70% de su peso en seco son proteínas completas con todos los aminoácidos esenciales. La NASA la estudió como alimento para misiones espaciales de larga duración.',
    curiosidad: 'Los aztecas ya recolectaban y consumían espirulina del lago Texcoco en el siglo XV, llamándola "tecuitlatl". La describió el explorador franciscano Sahagún en 1521. Fue "redescubierta" por científicos franceses en el lago Chad en los años 1960, ignorando que llevaba siglos siendo alimento humano.',
  },
  {
    nombre: 'Cúrcuma', nombreCientifico: 'Curcuma longa', origen: 'India',
    categoria: 'Especias y raíces',
    nutrientesDestacados: ['Curcumina', 'Manganeso', 'Hierro', 'Vitamina B6', 'Potasio'],
    beneficiosTradicionales: ['Antiinflamatorio potente', 'Antioxidante', 'Salud digestiva', 'Función hepática'],
    comoConsumirlo: ['Con pimienta negra (aumenta absorción 2000%)', 'Golden milk', 'Curry y guisos', 'En batidos'],
    cantidadOrientativa: '1–3 g/día de curcumina (o ½–1 cucharadita de polvo con pimienta)',
    contraindicaciones: 'No recomendada en dosis altas en embarazo. Puede interferir con anticoagulantes. No suministrar sola sin pimienta negra (biodisponibilidad mínima).',
    combinaBien: ['Pimienta negra', 'Jengibre', 'Aceite de coco', 'Leche vegetal'],
    descripcion: 'La cúrcuma es la raíz dorada de la medicina ayurvédica con más de 4.000 años de uso. La curcumina, su principio activo, ha mostrado propiedades antiinflamatorias en estudios in vitro y algunos ensayos clínicos pequeños, aunque su biodisponibilidad oral es limitada. No es equivalente a un medicamento antiinflamatorio.',
    curiosidad: 'La piperina de la pimienta negra aumenta la absorción de curcumina en un 2.000% (veinte veces). Los sistemas culinarios de India y Asia siempre combinaron ambas especias intuitivamente durante milenios, mucho antes de que la ciencia explicara el porqué bioquímico de esa combinación.',
  },
  {
    nombre: 'Quinoa', nombreCientifico: 'Chenopodium quinoa', origen: 'Andes (Bolivia, Perú, Ecuador)',
    categoria: 'Cereales ancestrales',
    nutrientesDestacados: ['Proteína completa (todos los aminoácidos)', 'Fibra', 'Magnesio', 'Hierro', 'Sin gluten'],
    beneficiosTradicionales: ['Energía sostenida', 'Apta para celíacos', 'Músculo y recuperación', 'Saciedad'],
    comoConsumirlo: ['Cocida como arroz', 'En ensaladas frías', 'Porridge dulce', 'En sopas y guisos'],
    cantidadOrientativa: '60–80 g en seco por ración',
    contraindicaciones: 'Lavar bien para eliminar saponinas (capa amarga natural). Ninguna contraindicación significativa.',
    combinaBien: ['Aguacate', 'Legumbres', 'Verduras asadas', 'Limón y aceite de oliva'],
    descripcion: 'La quinoa es el único cereal vegetal con proteína completa: contiene todos los aminoácidos esenciales. Los incas la llamaban "el grano madre" y la cultivaron durante más de 5.000 años en los Andes. Sin gluten y con bajo índice glucémico, es ideal para atletas y personas con enfermedad celíaca.',
    curiosidad: 'La FAO declaró 2013 "Año Internacional de la Quinoa" por su potencial para la seguridad alimentaria mundial. Irónicamente, el boom mundial de la quinoa hizo que el precio se triplicara en Bolivia y Perú, donde los campesinos productores empezaron a vender toda su producción y pasaron a comer arroz y fideos.',
  },
  {
    nombre: 'Aguacate', nombreCientifico: 'Persea americana', origen: 'México y América Central',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Ácido oleico (omega-9)', 'Vitamina K', 'Folato', 'Potasio', 'Vitamina E', 'Luteína'],
    beneficiosTradicionales: ['Salud cardiovascular', 'Absorción de carotenoides', 'Piel y cabello', 'Saciedad'],
    comoConsumirlo: ['Guacamole', 'En tostadas', 'En ensaladas', 'En smoothies'],
    cantidadOrientativa: '½ aguacate al día (unos 75–100 g)',
    contraindicaciones: 'Alto en calorías (160 kcal/100g). Interacción con warfarina por alto contenido en vitamina K.',
    combinaBien: ['Tomate', 'Limón', 'Huevo', 'Salmón', 'Espinacas'],
    descripcion: 'El aguacate es la fruta grasa por excelencia. El 77% de sus calorías proviene de grasas, mayoritariamente ácido oleico (el mismo de aceite de oliva), con reconocidos efectos cardioprotectores. Actúa como potenciador de absorción de nutrientes: consumirlo con ensaladas multiplica la asimilación de carotenoides.',
    curiosidad: 'El aguacate evolucionó para ser consumido y dispersado por megafauna del Pleistoceno (mamuts, mastodontes, perezosos gigantes). Cuando estos animales se extinguieron hace 13.000 años, el aguacate quedó "huérfano de dispersor". Sobrevivió solo gracias a los humanos, que lo domesticaron hace unos 10.000 años en México.',
  },
  {
    nombre: 'Kéfir', nombreCientifico: 'Cultura mixta de bacterias y levaduras', origen: 'Cáucaso (Georgia, Armenia)',
    categoria: 'Fermentados',
    nutrientesDestacados: ['Probióticos (50+ cepas)', 'Proteína', 'Calcio', 'Vitamina K2', 'Vitamina B12'],
    beneficiosTradicionales: ['Microbiota intestinal', 'Digestión', 'Sistema inmune', 'Tolerancia a la lactosa'],
    comoConsumirlo: ['Solo como bebida', 'Con frutas', 'En smoothies', 'Sustituto del yogur'],
    cantidadOrientativa: '150–250 ml/día',
    contraindicaciones: 'El kéfir de leche no es apto para intolerantes severos (aunque contiene menos lactosa que la leche). El kéfir de agua o coco es alternativa vegana.',
    combinaBien: ['Arándanos', 'Plátano', 'Mango', 'Semillas de lino'],
    descripcion: 'El kéfir es el alimento probiótico más potente conocido: una sola porción contiene entre 7 y 10 billones de microorganismos vivos (bacterias y levaduras), superando a la mayoría de suplementos probióticos comerciales. Los nómadas del Cáucaso lo usaban para conservar la leche y notaron sus efectos digestivos positivos hace más de 3.000 años.',
    curiosidad: 'Los granos de kéfir son tan únicos que no pueden crearse desde cero en laboratorio: solo crecen por reproducción de granos existentes. Nadie ha conseguido sintetizar la simbiosis exacta entre sus más de 50 especies de bacterias y levaduras. Los granos originales del Cáucaso llevan siglos transmitiéndose de generación en generación.',
  },
  {
    nombre: 'Jengibre', nombreCientifico: 'Zingiber officinale', origen: 'Asia tropical (India, China)',
    categoria: 'Especias y raíces',
    nutrientesDestacados: ['Gingeroles', 'Shogaoles', 'Vitamina B6', 'Magnesio', 'Potasio'],
    beneficiosTradicionales: ['Antiemético (náuseas, mareo)', 'Antiinflamatorio', 'Digestivo', 'Circulación'],
    comoConsumirlo: ['Fresco rallado en infusión', 'En zumos', 'Rallado en wok y curry', 'Cristalizado como snack'],
    cantidadOrientativa: '2–4 g/día de jengibre fresco',
    contraindicaciones: 'En dosis muy altas puede interactuar con anticoagulantes. Evitar en reflujo grave (puede irritar). Precaución en embarazo con dosis altas.',
    combinaBien: ['Limón', 'Cúrcuma', 'Miel', 'Menta', 'Naranja'],
    descripcion: 'El jengibre es una de las pocas especias con beneficio antiemético bien documentado clínicamente: eficaz contra las náuseas del embarazo y la quimioterapia. Sus gingeroles (en fresco) y shogaoles (en seco) son potentes antiinflamatorios que inhiben la vía COX-2, la misma que los antiinflamatorios no esteroideos.',
    curiosidad: 'El jengibre fue la primera especia asiática en llegar a Europa, introducida por los fenicios y romanos. Era tan valorado en la Edad Media que se usaba como moneda de cambio: en algunas ciudades del Rin alemán, el equivalente a 1 kg de jengibre compraba una oveja. Chaucer lo mencionó en los Cuentos de Canterbury.',
  },
  {
    nombre: 'Semillas de lino', nombreCientifico: 'Linum usitatissimum', origen: 'Mesopotamia y Asia Central',
    categoria: 'Semillas y frutos secos',
    nutrientesDestacados: ['Omega-3 (ALA)', 'Lignanos (fitoestrógenos)', 'Fibra soluble e insoluble', 'Proteína'],
    beneficiosTradicionales: ['Salud cardiovascular', 'Tránsito intestinal', 'Equilibrio hormonal femenino', 'Antiinflamatorio'],
    comoConsumirlo: ['Molidas (absorción 10x mejor que enteras)', 'En smoothies', 'Sobre yogur', 'En masas de pan'],
    cantidadOrientativa: '1–2 cucharadas de lino molido/día',
    contraindicaciones: 'Las semillas enteras no se digieren y pasan sin absorberse. Moler siempre en molinillo. Aumentar consumo de agua.',
    combinaBien: ['Avena', 'Manzana', 'Yogur', 'Arándanos'],
    descripcion: 'Las semillas de lino son el alimento vegetal con mayor contenido en lignanos, compuestos con actividad estrogénica débil que modulan el metabolismo hormonal. Son también la fuente vegetal más rica en ácido alfa-linolénico (omega-3). La clave: molerlas justo antes de consumir, porque enteras el cuerpo no las digiere.',
    curiosidad: 'El lino es uno de los cultivos más antiguos de la humanidad: se han encontrado fibras de lino en cuevas prehistóricas de Georgia con más de 30.000 años. El lino de Egipto se usaba para envolver momias y como moneda en el comercio mediterráneo. Su uso simultáneo como alimento y textil es único en el reino vegetal.',
  },
  {
    nombre: 'Cacao puro', nombreCientifico: 'Theobroma cacao', origen: 'Cuenca del Amazonas',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Flavonoides (epicatequinas)', 'Magnesio', 'Hierro', 'Zinc', 'Teobromina'],
    beneficiosTradicionales: ['Salud cardiovascular', 'Humor y bienestar', 'Función cognitiva', 'Antioxidante'],
    comoConsumirlo: ['Cacao puro en polvo (mínimo 85% chocolate)', 'Raw cacao nibs', 'En batidos', 'Con avena'],
    cantidadOrientativa: '1–2 cucharadas de cacao puro o 20–30 g de chocolate ≥85%',
    contraindicaciones: 'El cacao puro (no el chocolate con azúcar) es el superalimento. El chocolate con leche o azúcar no cuenta. Estimulante: evitar en personas sensibles a la cafeína por la tarde.',
    combinaBien: ['Plátano', 'Avena', 'Mantequilla de almendra', 'Semillas de chía'],
    descripcion: 'El Theobroma significa "alimento de los dioses" en griego. El cacao puro es uno de los alimentos con mayor concentración de flavonoides, antioxidantes que mejoran la función endotelial y reducen la presión arterial. Los mayas lo llamaban "xocolatl" y lo usaban en ceremonias religiosas y como moneda.',
    curiosidad: 'La diferencia entre cacao y cocoa es el proceso: el cacao raw se procesa a <40°C conservando sus nutrientes; el cacao convencional se tuesta a alta temperatura, reduciendo sus flavonoides hasta un 90%. Los "cacao nibs" son el grano fermentado y roto antes de cualquier procesado: la forma más pura de consumir cacao.',
  },
  {
    nombre: 'Brócoli', nombreCientifico: 'Brassica oleracea var. italica', origen: 'Italia (Mediterráneo)',
    categoria: 'Verduras y hojas',
    nutrientesDestacados: ['Sulforafano', 'Vitamina C', 'Vitamina K', 'Folato', 'Fibra', 'Indoles'],
    beneficiosTradicionales: ['Anticancerígeno (estudios prometedores)', 'Detoxificación hepática', 'Antiinflamatorio', 'Sistema inmune'],
    comoConsumirlo: ['Al vapor (mejor conserva el sulforafano)', 'Crudo en ensalada', 'Salteado', 'Al horno'],
    cantidadOrientativa: '200–300 g 3–5 veces/semana',
    contraindicaciones: 'En hipotiroidismo: comer cocido (reduce bociógenos). En anticoagulantes: moderación por vitamina K.',
    combinaBien: ['Ajo', 'Limón', 'Aceite de oliva', 'Almendras', 'Tahini'],
    descripcion: 'El brócoli es el vegetal más estudiado en oncología preventiva. Su sulforafano activa genes de detoxificación hepática y tiene propiedades anticancerígenas demostradas en estudios in vitro y en animales. Los Brassica (brócoli, coliflor, col, kale) forman la familia vegetal más asociada a reducción de riesgo de cáncer en epidemiología.',
    curiosidad: 'La masticación del brócoli crudo activa una reacción enzimática: la mirosinasa rompe los glucosinolatos liberando sulforafano. Cocinar a alta temperatura destruye la mirosinasa. Solución: comer crudo o al vapor, o añadir mostaza molida al brócoli cocido (contiene la misma enzima).',
  },
  {
    nombre: 'Nueces', nombreCientifico: 'Juglans regia', origen: 'Asia Central y Persia',
    categoria: 'Semillas y frutos secos',
    nutrientesDestacados: ['Omega-3 (ALA)', 'Vitamina E', 'Polifenoles', 'Magnesio', 'Proteína'],
    beneficiosTradicionales: ['Salud cardiovascular', 'Función cerebral', 'Antiinflamatorio', 'Microbiota intestinal'],
    comoConsumirlo: ['Crudas (sin tostar para conservar omega-3)', 'En ensaladas', 'Con yogur', 'En repostería'],
    cantidadOrientativa: '28–30 g/día (7 nueces)',
    contraindicaciones: 'Alto contenido calórico: controlar la cantidad. Las nueces tostadas pierden gran parte de sus omega-3 por oxidación.',
    combinaBien: ['Arándanos', 'Avena', 'Manzana', 'Queso fresco'],
    descripcion: 'Las nueces son el fruto seco con mejor perfil de omega-3. Son el único fruto seco con cantidades significativas de ALA, el precursor de los omega-3 de cadena larga. Sus polifenoles, concentrados en la piel marrón del interior, son más potentes que los del aceite de oliva en estudios comparativos.',
    curiosidad: 'Una nuez completa (sin cáscara) se parece a un cerebro humano, lo que llevó en la Edad Media a la doctrina de las signaturas (la forma de un alimento indica para qué órgano es bueno). Curiosamente, esta superstición milenaria tiene algo de base: las nueces sí son el fruto seco más beneficioso para la salud cerebral.',
  },
  {
    nombre: 'Kale', nombreCientifico: 'Brassica oleracea var. sabellica', origen: 'Europa mediterránea',
    categoria: 'Verduras y hojas',
    nutrientesDestacados: ['Vitamina K (700% RDI/100g)', 'Vitamina C', 'Beta-caroteno', 'Calcio', 'Sulforafano'],
    beneficiosTradicionales: ['Salud ósea', 'Sistema inmune', 'Detoxificación', 'Antiinflamatorio'],
    comoConsumirlo: ['Crudo en ensaladas (masajeado con sal y limón)', 'Chips al horno', 'En smoothies verdes', 'Salteado'],
    cantidadOrientativa: '100–200 g 3–4 veces/semana',
    contraindicaciones: 'Muy alto en vitamina K: precaución con anticoagulantes tipo warfarina. Bociógeno en hipotiroidismo si se consume en grandes cantidades crudo.',
    combinaBien: ['Limón', 'Aguacate', 'Tahini', 'Frutos rojos', 'Almendras'],
    descripcion: 'El kale o col rizada es el vegetal con mayor concentración de vitamina K conocido. Una porción de 100 g cubre más de 7 veces la ingesta diaria recomendada. Es también una de las fuentes vegetales de calcio mejor absorbidas (mejor biodisponibilidad que la leche). Su popularidad en la última década lo ha convertido en símbolo de alimentación saludable.',
    curiosidad: 'El kale fue el vegetal más consumido en Europa durante la Edad Media: resistente al frío, fácil de cultivar y nutritivo. La popularización del arroz y el pan blanco lo marginó completamente durante siglos. Su "redescubrimiento" como superalimento en los 2010 fue impulsado por nutricionistas de EEUU que querían reivindicar vegetales tradicionales olvidados.',
  },
  {
    nombre: 'Miso', nombreCientifico: 'Pasta fermentada de soja', origen: 'China y Japón',
    categoria: 'Fermentados',
    nutrientesDestacados: ['Probióticos', 'Proteína', 'Vitaminas del grupo B', 'Manganeso', 'Zinc'],
    beneficiosTradicionales: ['Salud intestinal', 'Sistema inmune', 'Digestión', 'Salud cardiovascular (estudios japoneses)'],
    comoConsumirlo: ['Sopa de miso (no hervir: destruye probióticos)', 'Marinadas', 'Aliños', 'En salsas'],
    cantidadOrientativa: '1 cucharada (20 g) al día',
    contraindicaciones: 'Muy alto en sodio: limitar en hipertensión o dietas bajas en sal. No hervir para preservar las bacterias vivas.',
    combinaBien: ['Tofu', 'Algas', 'Setas', 'Cebollino', 'Jengibre'],
    descripcion: 'El miso es el alma de la cocina japonesa. Elaborado por fermentación de soja (y a veces arroz o cebada) con el hongo Aspergillus oryzae, el miso es un alimento vivo rico en enzimas y bacterias beneficiosas. Estudios epidemiológicos japoneses asocian el consumo regular de miso con menor incidencia de ciertos cánceres.',
    curiosidad: 'La sopa de miso fue el desayuno del samurái japonés durante siglos. Los registros históricos muestran que los guerreros del período Sengoku (s. XV–XVI) bebían sopa de miso antes de la batalla. Daba energía, minerales y era fácil de transportar en campaña en forma de pasta deshidratada.',
  },
  {
    nombre: 'Açaí', nombreCientifico: 'Euterpe oleracea', origen: 'Amazonas (Brasil, Perú)',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Antocianinas', 'Ácido oleico', 'Vitamina E', 'Manganeso', 'Fibra'],
    beneficiosTradicionales: ['Antioxidante muy potente', 'Energía', 'Salud cardiovascular', 'Antiinflamatorio'],
    comoConsumirlo: ['Açaí bowl', 'En smoothies', 'Congelado en pulpa', 'Suplemento en polvo'],
    cantidadOrientativa: '100 g de pulpa o 1 cucharada de polvo',
    contraindicaciones: 'El açaí con azúcar añadido (versión industrial) pierde sus beneficios. Elegir siempre pulpa pura sin azúcar. Puede interactuar con quimioterapia (consultar médico).',
    combinaBien: ['Plátano', 'Granola', 'Arándanos', 'Cacao', 'Leche de coco'],
    descripcion: 'El açaí contiene una alta concentración de antocianinas y polifenoles, antioxidantes potentes en pruebas in vitro. Es la baya del árbol palmito amazónico, fundamental en la dieta de las poblaciones ribereñas del Amazonas durante milenios. Su popularización global comenzó en Brasil en los años 90.',
    curiosidad: 'El 90% del açaí que se exporta del Brasil se consume en el propio país. Los estados brasileños de Pará y Amazonas son los mayores productores. En Belém do Pará, el açaí es un alimento básico diario, no un superalimento premium: se vende en mercados locales por centavos de euro el kilo.',
  },
  {
    nombre: 'Chucrut', nombreCientifico: 'Col fermentada en salmuera', origen: 'Asia Central (introducida en Europa por mongoles)',
    categoria: 'Fermentados',
    nutrientesDestacados: ['Probióticos (Lactobacillus)', 'Vitamina C', 'Vitamina K', 'Fibra', 'Enzimas'],
    beneficiosTradicionales: ['Microbiota intestinal', 'Digestión', 'Sistema inmune', 'Conservación de vitamina C'],
    comoConsumirlo: ['Sin cocinar (para preservar probióticos)', 'Como guarnición', 'En sándwiches', 'Con legumbres'],
    cantidadOrientativa: '2–4 cucharadas al día',
    contraindicaciones: 'Alto en sodio. El chucrut pasteurizado (en lata o tarro) ha perdido sus probióticos. Elegir el no pasteurizado (refrigerado).',
    combinaBien: ['Salchichas', 'Cerdo', 'Legumbres', 'Quesos curados'],
    descripcion: 'El chucrut es col blanca fermentada espontáneamente en su propio jugo con sal. El proceso de fermentación láctica produce millones de bacterias Lactobacillus y multiplica la vitamina C original. Es el alimento conservado que protegió a los marineros europeos del escorbuto durante siglos.',
    curiosidad: 'El capitán James Cook, el explorador que completó el primer circunnavegante del mundo, acreditó el éxito de sus viajes al chucrut: llevó barriles enteros a bordo para prevenir el escorbuto. Sus tripulaciones no perdieron un solo hombre por esta enfermedad, algo revolucionario en la navegación del siglo XVIII.',
  },
  {
    nombre: 'Salmón salvaje', nombreCientifico: 'Oncorhynchus spp.', origen: 'Océano Pacífico Norte',
    categoria: 'Algas y mar',
    nutrientesDestacados: ['Omega-3 EPA+DHA', 'Proteína completa', 'Vitamina D', 'Vitamina B12', 'Astaxantina'],
    beneficiosTradicionales: ['Salud cardiovascular', 'Antiinflamatorio', 'Función cerebral', 'Salud articular'],
    comoConsumirlo: ['Al horno o a la plancha', 'Ahumado', 'Carpaccio', 'En ensaladas'],
    cantidadOrientativa: '150 g, 2–3 veces/semana',
    contraindicaciones: 'El salmón de acuicultura (cultivado) tiene perfil de omega-3 inferior y puede contener contaminantes. Preferir siempre salvaje o de calidad certificada.',
    combinaBien: ['Aguacate', 'Espinacas', 'Alcaparras', 'Eneldo', 'Limón'],
    descripcion: 'El salmón salvaje es la fuente animal más concentrada de omega-3 EPA y DHA, los ácidos grasos con mayor evidencia científica de beneficio cardiovascular y cerebral. Su color rojo-naranja proviene de la astaxantina, un carotenoide antioxidante 6.000 veces más potente que la vitamina C.',
    curiosidad: 'La astaxantina que da el color característico al salmón no la produce el propio pez: la obtiene comiendo krill y algas que sí la sintetizan. El salmón de acuicultura, sin acceso a estas fuentes, tiene la carne blanca y se tiñe artificialmente con astaxantina sintética para simular el color del salvaje.',
  },
  {
    nombre: 'Alga nori', nombreCientifico: 'Pyropia yezoensis', origen: 'Japón y Corea',
    categoria: 'Algas y mar',
    nutrientesDestacados: ['Yodo', 'Vitamina B12 (debatida)', 'Proteína', 'EPA omega-3', 'Vitaminas del grupo B'],
    beneficiosTradicionales: ['Función tiroidea (yodo)', 'Salud cardiovascular', 'Detoxificante', 'Proteína marina'],
    comoConsumirlo: ['Sushi y onigiri', 'Tostada directa', 'En sopas', 'Triturada como condimento'],
    cantidadOrientativa: '1–3 hojas/semana (por alto contenido en yodo)',
    contraindicaciones: 'Muy alto en yodo: no exceder en hipertiroidismo. La vitamina B12 del alga nori es en gran parte un análogo inactivo, no sustituto de B12 animal o suplemento.',
    combinaBien: ['Arroz', 'Pepino', 'Tofu', 'Sésamo', 'Jengibre'],
    descripcion: 'El nori es el alga más consumida del mundo, gracias al sushi. Sus láminas tostadas concentran una densidad nutricional extraordinaria: proteína marina, omega-3 de cadena corta y la mayor concentración de yodo biodisponible del reino vegetal. Japón consume más de 10 millones de láminas de nori al día.',
    curiosidad: 'El alga nori tardó décadas en poder cultivarse. Hasta que la botánica británica Kathleen Drew-Baker descubrió en 1949 el ciclo de vida completo del alga, los cultivadores japoneses dependían de colonizaciones espontáneas. Su descubrimiento salvó la industria norera japonesa, devastada tras la Segunda Guerra Mundial. En Japón la llaman "la madre del mar".',
  },
  {
    nombre: 'Goji', nombreCientifico: 'Lycium barbarum', origen: 'China (Ningxia) y Mongolia',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Zeaxantina', 'Betaína', 'Vitamina C', 'Hierro', 'Polisacáridos LBP'],
    beneficiosTradicionales: ['Salud visual', 'Sistema inmune', 'Energía', 'Longevidad (medicina china)'],
    comoConsumirlo: ['Secas como snack', 'En infusión', 'Sobre yogur y porridge', 'Remojadas en agua'],
    cantidadOrientativa: '20–30 g de bayas secas/día',
    contraindicaciones: 'Interacción con warfarina. No consumir en embarazo en grandes cantidades. Muchas bayas de goji del mercado son de baja calidad con pesticidas: elegir ecológicas.',
    combinaBien: ['Avena', 'Almendras', 'Té verde', 'Cacao'],
    descripcion: 'Las bayas goji se han usado en la medicina tradicional china durante más de 2.000 años para la longevidad y la vitalidad. Su concentración de zeaxantina es la más alta de cualquier alimento conocido: este carotenoide protege específicamente la mácula ocular contra la degeneración macular asociada a la edad.',
    curiosidad: 'En el Tíbet y Ningxia (China) existe una festividad anual dedicada a la cosecha de las bayas goji: el "Festival del Goji" celebrado en agosto. Los cultivadores tibetanos creen que consumir bayas frescas directamente del arbusto durante la cosecha tiene propiedades medicinales superiores a las secas.',
  },
  {
    nombre: 'Avena', nombreCientifico: 'Avena sativa', origen: 'Europa Central y Oriente Medio',
    categoria: 'Cereales ancestrales',
    nutrientesDestacados: ['Beta-glucano (fibra soluble)', 'Manganeso', 'Fósforo', 'Magnesio', 'Avenantramidas'],
    beneficiosTradicionales: ['Colesterol LDL', 'Control glucemia', 'Saciedad', 'Salud cardiovascular'],
    comoConsumirlo: ['Porridge clásico', 'Overnight oats', 'En batidos', 'Granola casera'],
    cantidadOrientativa: '50–80 g/día en seco',
    contraindicaciones: 'La avena es naturalmente sin gluten pero puede estar contaminada en proceso. Celíacos: elegir avena certificada sin gluten. El beta-glucano necesita hidratación para actuar.',
    combinaBien: ['Plátano', 'Arándanos', 'Nueces', 'Semillas de lino', 'Canela'],
    descripcion: 'La avena es el cereal con mayor contenido en beta-glucano, una fibra soluble que reduce activamente el colesterol LDL. Es el único alimento con aprobación de la FDA americana para hacer declaraciones de salud cardiovascular en el etiquetado. Su índice glucémico es bajo cuando se consume en copos gruesos (no instantánea).',
    curiosidad: 'Los Quakers fueron los primeros en comercializar la avena procesada en EEUU en 1877. Antes, la avena era considerada comida para caballos y pueblos atrasados (el lexicógrafo inglés Samuel Johnson definió la avena en su diccionario de 1755 como "grano que en Inglaterra se da a los caballos, pero que en Escocia alimenta al pueblo").',
  },
  {
    nombre: 'Remolacha', nombreCientifico: 'Beta vulgaris', origen: 'Europa meridional',
    categoria: 'Verduras y hojas',
    nutrientesDestacados: ['Nitratos (→ óxido nítrico)', 'Betalaínas', 'Folato', 'Manganeso', 'Vitamina C'],
    beneficiosTradicionales: ['Rendimiento deportivo', 'Presión arterial', 'Oxigenación celular', 'Salud hepática'],
    comoConsumirlo: ['Zumo fresco (más eficaz)', 'Asada', 'Cruda rallada', 'En batidos'],
    cantidadOrientativa: '200–300 ml zumo o 200 g remolachas cocidas antes de ejercicio',
    contraindicaciones: 'Puede causar betauria (orina rojiza) inofensiva. Limitar en cálculos de oxalato. Alta en azúcares naturales: moderar en diabéticos.',
    combinaBien: ['Manzana', 'Jengibre', 'Zanahoria', 'Naranja', 'Nueces'],
    descripcion: 'La remolacha es el superalimento del deporte. Su contenido en nitratos inorgánicos (que el cuerpo convierte en óxido nítrico) dilata los vasos sanguíneos, mejora la oxigenación muscular y aumenta la resistencia. Múltiples estudios clínicos muestran mejoras de rendimiento de 1–3% en atletas de fondo, equivalente a meses de entrenamiento.',
    curiosidad: 'Durante las dos guerras mundiales, Alemania produjo azúcar de remolacha para sustituir la caña de azúcar inaccesible por el bloqueo naval. La remolacha azucarera (variedad distinta de la remolacha vegetal) sigue siendo la fuente del 20% del azúcar mundial. La remolacha roja debe su color a la betanina, usada también como colorante natural (E162).',
  },
  {
    nombre: 'Clorela', nombreCientifico: 'Chlorella vulgaris', origen: 'Agua dulce (Asia)',
    categoria: 'Algas y mar',
    nutrientesDestacados: ['Clorofila (la más alta de cualquier alimento)', 'Proteína completa (50–60%)', 'Vitaminas del grupo B', 'Hierro', 'CGF (Chlorella Growth Factor)'],
    beneficiosTradicionales: ['Desintoxicación de metales pesados', 'Sistema inmune', 'Energía', 'Salud hepática'],
    comoConsumirlo: ['En polvo (1 cucharadita en agua)', 'En cápsulas', 'En batidos verdes', 'Con cítricos para camuflar el sabor'],
    cantidadOrientativa: '3–5 g/día',
    contraindicaciones: 'Puede interactuar con anticoagulantes por vitamina K. Iniciar con dosis bajas (reacción de desintoxicación inicial posible). Comprar de calidad certificada (posible contaminación de cultivos).',
    combinaBien: ['Limón', 'Mango', 'Menta', 'Spirulina'],
    descripcion: 'La clorela es el organismo fotosintético con mayor concentración de clorofila conocida. Su CGF (Chlorella Growth Factor), un complejo de ácidos nucleicos y péptidos, estimula la reparación celular y el crecimiento de tejidos. Algunos estudios preliminares sugieren que podría unirse a ciertos compuestos en el intestino, pero no es un sustituto de la quelación médica supervisada cuando esta es necesaria.',
    curiosidad: 'La NASA y la Agencia Espacial Europea estudian la clorela como posible fuente de alimento y oxígeno en misiones de larga duración. En un espacio de 1 m², la clorela puede producir tanta proteína como 1.000 m² de soja, mientras absorbe CO₂ y libera O₂: el sistema de soporte vital perfecto para el espacio.',
  },
  {
    nombre: 'Trigo sarraceno', nombreCientifico: 'Fagopyrum esculentum', origen: 'China y Asia Central',
    categoria: 'Cereales ancestrales',
    nutrientesDestacados: ['Rutina (flavonoide)', 'Proteína completa', 'Magnesio', 'Sin gluten', 'D-quiro-inositol'],
    beneficiosTradicionales: ['Circulación y varices', 'Control glucemia', 'Salud cardiovascular', 'Digestión'],
    comoConsumirlo: ['Copos en porridge', 'Harina en tortitas (blinis)', 'Cocinado como arroz', 'Germinado'],
    cantidadOrientativa: '60–80 g en seco',
    contraindicaciones: 'No es un cereal (es un pseudocereal): naturalmente sin gluten. Algunas personas sensibles desarrollan fotosensibilidad con consumo elevado.',
    combinaBien: ['Setas', 'Cebolla', 'Huevo', 'Manzana', 'Arándanos'],
    descripcion: 'El trigo sarraceno o alforfón no es un trigo ni tiene gluten: es un pseudocereal emparentado con la acedera y el ruibarbo. Su rutina, un flavonoide poco común en alimentos, fortalece las paredes capilares y mejora la circulación. Es un alimento básico en Rusia (kasha), Japón (fideos soba) y los Alpes franceses (crêpes bretonas).',
    curiosidad: 'El Libro de los Récords Guinness registra la masa de crêpe de trigo sarraceno más grande del mundo: 6,7 metros de diámetro, preparada en Bretaña (Francia) en 2012. Las crêpes bretonas (galettes) son un patrimonio culinario francés que data del siglo XIII, cuando los cruzados trajeron el trigo sarraceno de sus viajes a Oriente.',
  },
  {
    nombre: 'Kombucha', nombreCientifico: 'Bebida fermentada con SCOBY', origen: 'Manchuria, China (siglo III a.C.)',
    categoria: 'Fermentados',
    nutrientesDestacados: ['Probióticos variados', 'Ácidos orgánicos (glucurónico, acético)', 'Vitaminas del grupo B', 'Enzimas'],
    beneficiosTradicionales: ['Salud intestinal', 'Energía', 'Sistema inmune', 'Función hepática (estudios preliminares)'],
    comoConsumirlo: ['240–360 ml/día como bebida', 'Sin mezclar con alcohol', 'Empezar con poco (200 ml/día) si es la primera vez'],
    cantidadOrientativa: '240–360 ml/día',
    contraindicaciones: 'No recomendada en embarazo (trazas de alcohol). Personas inmunocomprometidas: precaución (bacteria viva). El kombucha comercial con mucho azúcar añadido no tiene los beneficios del artesanal.',
    combinaBien: ['Jengibre', 'Cúrcuma', 'Limón', 'Bayas'],
    descripcion: 'El kombucha es té fermentado por un SCOBY (Symbiotic Culture Of Bacteria and Yeast), un cultivo simbiótico que transforma el té azucarado en una bebida probiótica levemente ácida y efervescente. Conocido en China como "el té de la inmortalidad", ha vivido un renacimiento global en la última década como alternativa a los refrescos.',
    curiosidad: 'El SCOBY madre del kombucha puede durar indefinidamente dividido y donado entre comunidades de fermentadores: hay SCOBYs en activo con más de 50 años de historia continua. Esta práctica comunitaria de compartir cultivos tiene paralelos con el pan de masa madre, el kéfir y el chucrut en diferentes culturas.',
  },
  {
    nombre: 'Semillas de cáñamo', nombreCientifico: 'Cannabis sativa (variedad industrial)', origen: 'Asia Central',
    categoria: 'Semillas y frutos secos',
    nutrientesDestacados: ['Proteína completa', 'Ratio omega-6:omega-3 ideal (3:1)', 'GLA (omega-6)', 'Magnesio', 'Zinc'],
    beneficiosTradicionales: ['Antiinflamatorio', 'Piel y cabello', 'Energía', 'Hormonal femenino'],
    comoConsumirlo: ['Crudas sobre ensaladas', 'En smoothies', 'Como topping en yogur', 'En masas'],
    cantidadOrientativa: '30 g/día (3 cucharadas)',
    contraindicaciones: 'Las semillas de cáñamo industrial (<0,3% THC) son completamente legales. Sin efectos psicoactivos. Las semillas peladas (hemp hearts) son más digestibles.',
    combinaBien: ['Avena', 'Espinacas', 'Aguacate', 'Smoothies verdes'],
    descripcion: 'Las semillas de cáñamo (hemp) son una proteína vegetal completa con el ratio de omega-6 a omega-3 más próximo al ideal para humanos (3:1). Contienen además GLA, un omega-6 antiinflamatorio raro en el mundo vegetal. Son fácilmente digeribles y tienen sabor suave a nuez que las hace versátiles.',
    curiosidad: 'El cáñamo fue uno de los primeros cultivos humanos conocidos: hay evidencias de su uso en Asia hace 12.000 años como fibra textil, alimento y medicina. La Declaración de Independencia de EEUU fue escrita en papel de cáñamo. Durante la Segunda Guerra Mundial, el gobierno americano fomentó masivamente su cultivo bajo el lema "Hemp for Victory".',
  },
  {
    nombre: 'Moringa', nombreCientifico: 'Moringa oleifera', origen: 'India (Himalaya)',
    categoria: 'Verduras y hojas',
    nutrientesDestacados: ['Vitamina C (7x naranja)', 'Calcio (4x leche)', 'Proteína', 'Hierro (3x espinacas)', 'Vitamina A'],
    beneficiosTradicionales: ['Malnutrición (programa FAO)', 'Antiinflamatorio', 'Glucemia', 'Sistema inmune'],
    comoConsumirlo: ['Polvo de hoja en batidos', 'Hojas frescas en ensalada', 'En infusión', 'Cápsulas'],
    cantidadOrientativa: '2–5 g de polvo/día',
    contraindicaciones: 'Puede tener efectos abortivos en dosis muy altas: evitar en embarazo. Las raíces y semillas tienen otros compuestos distintos a las hojas. Elegir siempre polvo de hoja.',
    combinaBien: ['Plátano', 'Mango', 'Cúrcuma', 'Leche de coco'],
    descripcion: 'La moringa es llamada el "árbol milagro" por la FAO, que la usa en programas de lucha contra la malnutrición en África subsahariana. Sus hojas secas concentran proporciones de nutrientes esenciales extraordinarias. Es el vegetal con mayor concentración de vitamina A, C y calcio por peso conocida en el mundo vegetal.',
    curiosidad: 'Una sola moringa puede crecer más de 3 metros en su primer año. Este crecimiento explosivo, combinado con su tolerancia extrema a la sequía y sus semillas que purifican el agua (contienen polielectrolitos naturales que sedimentan las impurezas), la convierten en una especie clave para la seguridad alimentaria en zonas áridas.',
  },
  {
    nombre: 'Natto', nombreCientifico: 'Soja fermentada con Bacillus subtilis', origen: 'Japón',
    categoria: 'Fermentados',
    nutrientesDestacados: ['Vitamina K2 (MK-7)', 'Nattokinasa (enzima)', 'Proteína', 'Probióticos', 'Hierro'],
    beneficiosTradicionales: ['Salud ósea', 'Anticoagulante natural', 'Salud cardiovascular', 'Microbiota'],
    comoConsumirlo: ['Sobre arroz (método tradicional japonés)', 'Con salsa de soja y cebollino', 'En tostadas', 'Mezclado con huevo'],
    cantidadOrientativa: '50–100 g/día',
    contraindicaciones: 'NO consumir con anticoagulantes tipo warfarina (nattokinasa tiene efecto anticoagulante potente). Olor y textura muy peculiares (filamentoso): sabor adquirido.',
    combinaBien: ['Arroz japonés', 'Alga nori', 'Cebollino', 'Mostaza japonesa'],
    descripcion: 'El natto es el alimento más rico en vitamina K2 (forma MK-7): una porción de 50 g proporciona más de 20 veces la ingesta diaria recomendada. Esta vitamina dirige el calcio a los huesos (evitando que se deposite en arterias). La nattokinasa, enzima única producida por la fermentación, tiene propiedades anticoagulantes y antihipertensivas documentadas.',
    curiosidad: 'El natto tiene el olor y la textura más polarizadores de cualquier alimento tradicional japonés: sus hilos mucilaginosos y su aroma intenso hacen que incluso muchos japoneses lo rechacen. Sin embargo, en las prefecturas del norte de Japón (Ibaraki, Miyagi) es un desayuno básico diario, y la región tiene una de las tasas más bajas de osteoporosis del mundo.',
  },
  {
    nombre: 'Amaranto', nombreCientifico: 'Amaranthus cruentus', origen: 'México y Guatemala',
    categoria: 'Cereales ancestrales',
    nutrientesDestacados: ['Proteína completa', 'Lisina (aminoácido raro en cereales)', 'Calcio', 'Hierro', 'Escualeno'],
    beneficiosTradicionales: ['Fuente proteica vegetal', 'Salud ósea', 'Colesterol LDL', 'Sin gluten'],
    comoConsumirlo: ['Inflado (como palomitas)', 'Cocinado como quinoa', 'Harina en repostería', 'Germinado'],
    cantidadOrientativa: '60–80 g en seco',
    contraindicaciones: 'Ninguna contraindicación significativa. Lavar bien antes de cocinar para eliminar saponinas.',
    combinaBien: ['Legumbres', 'Calabaza', 'Maíz', 'Frijoles negros'],
    descripcion: 'El amaranto fue el cereal sagrado de los aztecas, prohibido por los conquistadores españoles precisamente por su importancia en los rituales religiosos. Sus granos diminutos tienen proteína completa con lisina, el aminoácido que falta en la mayoría de cereales. El escualeno que contiene (también presente en el aceite de oliva) tiene propiedades anticancerígenas prometedoras.',
    curiosidad: 'Hernán Cortés prohibió el cultivo del amaranto en México tras la conquista, pena de muerte incluida. Era la base de las estatuas de los dioses aztecas (huauhtli), comidas ritualmente. Gracias a que los campesinos lo siguieron cultivando en secreto durante siglos, el amaranto sobrevivió hasta hoy.',
  },
  {
    nombre: 'Granada', nombreCientifico: 'Punica granatum', origen: 'Persia e India',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Punicalaginas', 'Vitamina C', 'Vitamina K', 'Folato', 'Potasio'],
    beneficiosTradicionales: ['Antioxidante potente', 'Presión arterial', 'Salud cardiovascular', 'Antiinflamatorio'],
    comoConsumirlo: ['Granos frescos solos', 'Zumo fresco', 'Sobre ensaladas', 'En salsas agridulces'],
    cantidadOrientativa: '½–1 granada o 250 ml zumo',
    contraindicaciones: 'Puede interactuar con medicamentos metabolizados por el hígado (similar al pomelo). Consultar con medicación crónica.',
    combinaBien: ['Yogur griego', 'Nueces', 'Espinacas', 'Queso feta', 'Rúcula'],
    descripcion: 'La granada tiene el contenido en punicalaginas más alto de cualquier fruta: estos polifenoles (exclusivos de la granada) se transforman en el intestino en urolitinas, compuestos con propiedades antiinflamatorias, anticancerígenas y de rejuvenecimiento celular probadas en estudios clínicos recientes.',
    curiosidad: 'La granada aparece en el arte, la mitología y la religión de prácticamente todas las culturas mediterráneas. En la mitología griega, Perséfone comió semillas de granada en el Hades, lo que la obligó a regresar al inframundo cada otoño (explicando el invierno). En la Biblia, en el Corán y en el arte budista también es símbolo recurrente de fertilidad y abundancia.',
  },
  {
    nombre: 'Reishi', nombreCientifico: 'Ganoderma lucidum', origen: 'Asia Oriental',
    categoria: 'Hongos medicinales',
    nutrientesDestacados: ['Beta-glucanos', 'Triterpenos (ganodérico ácido)', 'Polisacáridos', 'Germanio orgánico'],
    beneficiosTradicionales: ['Sistema inmune', 'Adaptógeno (estrés)', 'Sueño', 'Longevidad (TCM)'],
    comoConsumirlo: ['En extracto o cápsulas (no en alimento: demasiado amargo)', 'Infusión de polvo', 'Con cacao o café'],
    cantidadOrientativa: '1–2 g de extracto/día',
    contraindicaciones: 'No en embarazo. Puede interactuar con anticoagulantes e inmunosupresores. Preferir extractos estandarizados sobre polvo de seta entera (mejor biodisponibilidad).',
    combinaBien: ['Café', 'Cacao', 'Leche de avena', 'Miel'],
    descripcion: 'El reishi ("seta del año 10.000") es el hongo medicinal más estudiado en inmunooncología. Sus beta-glucanos modulan el sistema inmune (activando células NK y macrófagos) y sus triterpenos tienen propiedades adaptogénicas. En China y Japón se ha usado tradicionalmente como complemento en pacientes oncológicos, aunque la evidencia clínica de eficacia es todavía limitada y no sustituye los tratamientos médicos.',
    curiosidad: 'El reishi era tan raro y valorado en la China antigua que en los tratados medicinales se describía como disponible solo para los emperadores. Para el Imperio Tang (s. VII-X d.C.), encontrar un reishi silvestre era un presagio de reinado próspero y larga vida. Las pinturas chinas de longevidad siempre incluyen un reishi junto al sabio anciano.',
  },
  {
    nombre: "Lion's mane", nombreCientifico: 'Hericium erinaceus', origen: 'Asia Oriental y América del Norte',
    categoria: 'Hongos medicinales',
    nutrientesDestacados: ['Hericenonas', 'Erinacinas', 'Beta-glucanos', 'Polisacáridos neuroprotectores'],
    beneficiosTradicionales: ['Neuroplasticidad', 'Memoria y concentración', 'Neuroprotección', 'Sistema nervioso'],
    comoConsumirlo: ['Salteado (textura de marisco)', 'En extracto o cápsulas', 'Con mantequilla y ajo', 'En caldo'],
    cantidadOrientativa: '500 mg–1 g de extracto/día o 100–200 g fresco',
    contraindicaciones: 'No en alergia a setas. Los estudios clínicos en humanos son aún limitados. Las afirmaciones de mejora cognitiva exigen cautela.',
    combinaBien: ['Mantequilla', 'Ajo', 'Tomillo', 'Caldo de verduras'],
    descripcion: "El lion's mane (\"melena de león\") es el único hongo conocido que estimula la síntesis del Factor de Crecimiento Nervioso (NGF). Estudios en animales muestran regeneración axonal y mejoras cognitivas. Estudios piloto en humanos muestran mejoras en memoria y función ejecutiva en adultos mayores.",
    curiosidad: 'El hongo lion\'s mane tiene el aspecto más inusual del mundo fúngico: parece una cascada de pelo blanco o una melena de león. Los monjes budistas chinos lo llamaron "hongo de la cabeza del mono" y lo consumían como sustituto cárnico en sus dietas vegetarianas, por su textura sorprendentemente parecida al marisco.',
  },
  {
    nombre: 'Chaga', nombreCientifico: 'Inonotus obliquus', origen: 'Siberia, norte de Europa y América',
    categoria: 'Hongos medicinales',
    nutrientesDestacados: ['Betulinol', 'Beta-glucanos', 'Superóxido dismutasa (SOD)', 'Melanina', 'Vitaminas del grupo B'],
    beneficiosTradicionales: ['Antioxidante extremo (ORAC altísimo)', 'Sistema inmune', 'Antiinflamatorio', 'Energía sostenida'],
    comoConsumirlo: ['En extracto', 'Infusión de chaga trozado', 'Con café (sustituto de cafeína)', 'En polvo en batidos'],
    cantidadOrientativa: '1–2 g de extracto/día',
    contraindicaciones: 'Muy alto en oxalatos: no recomendado en insuficiencia renal o cálculos renales. Puede interactuar con anticoagulantes y antidiabéticos. No durante embarazo.',
    combinaBien: ['Café', 'Cacao', 'Canela', 'Regaliz'],
    descripcion: 'El chaga es un parásito del abedul que crece durante décadas formando una masa negra en el exterior del árbol. Contiene una alta concentración de antioxidantes en pruebas de laboratorio, aunque el índice ORAC ya no se utiliza como métrica de salud porque no predice efectos reales en el organismo. Los pueblos siberianos lo han usado como tónico durante siglos.',
    curiosidad: 'Alexander Solzhenitsyn mencionó el chaga en su novela "Pabellón del cáncer" (1968): describe a campesinos siberianos del siglo XIX que bebían infusión de chaga en lugar de té por ser más económico y porque parecían tener mejor salud. La novela generó el primer interés científico occidental por el chaga.',
  },
  {
    nombre: 'Cúrcuma negra', nombreCientifico: 'Kaempferia parviflora', origen: 'Tailandia',
    categoria: 'Especias y raíces',
    nutrientesDestacados: ['Metoxiflavonas (5,7-dimetoxiflavona)', 'Polimetoxiflavonas', 'Antioxidantes'],
    beneficiosTradicionales: ['Rendimiento físico', 'Circulación', 'Antiinflamatorio', 'Libido (medicina tailandesa)'],
    comoConsumirlo: ['En extracto o cápsulas', 'Polvo en smoothies', 'En infusión'],
    cantidadOrientativa: '300–500 mg de extracto/día',
    contraindicaciones: 'Estudios en humanos aún limitados. No confundir con Curcuma longa (cúrcuma amarilla). Efectos farmacológicos significativos: precaución con medicación.',
    combinaBien: ['Jengibre', 'Pimienta', 'Miel', 'Leche de coco'],
    descripcion: 'La cúrcuma negra o "ginger negro tailandés" es diferente de la cúrcuma amarilla común. Sus polimetoxiflavonas únicas tienen efectos vasodilatadores, mejoran el flujo sanguíneo y han mostrado en estudios preliminares aumentar el rendimiento físico y la tolerancia al ejercicio. En la medicina tradicional tailandesa se usa como energizante.',
    curiosidad: 'La cúrcuma negra ha sido un secreto de la medicina tradicional tailandesa durante siglos, especialmente entre las artes marciales Muay Thai. Los practicantes la usaban antes del combate para mejorar la resistencia y reducir el dolor. Solo en los últimos 10 años los investigadores han comenzado a estudiar sus mecanismos activos.',
  },
  {
    nombre: 'Maca', nombreCientifico: 'Lepidium meyenii', origen: 'Altiplano andino (Perú)',
    categoria: 'Especias y raíces',
    nutrientesDestacados: ['Macamidas', 'Macaenos', 'Hierro', 'Calcio', 'Aminoácidos esenciales'],
    beneficiosTradicionales: ['Energía y vitalidad', 'Equilibrio hormonal', 'Fertilidad', 'Adaptógeno'],
    comoConsumirlo: ['En polvo en batidos', 'Con cacao', 'En zumos de fruta', 'En cápsulas'],
    cantidadOrientativa: '1,5–3 g de polvo/día',
    contraindicaciones: 'No recomendada en cáncer hormono-dependiente (mama, próstata). Iniciar con dosis bajas. Evitar en embarazo por falta de estudios.',
    combinaBien: ['Cacao', 'Plátano', 'Leche de almendra', 'Canela'],
    descripcion: 'La maca crece exclusivamente en el altiplano andino a más de 4.000 metros de altitud, condiciones extremas de frío, viento y radiación UV que confieren a su raíz una composición única. Sus macamidas y macaenos son compuestos exclusivos de la planta con efectos adaptógenos y de modulación hormonal estudiados en ensayos clínicos.',
    curiosidad: 'Los guerreros incas consumían maca antes de las batallas para aumentar su resistencia y ferocidad. Tras la conquista española, los colonizadores la usaron como pago de impuestos por las comunidades andinas. Los conquistadores llevaron maca a España en el siglo XVI y fue usada en la corte real española como tónico energético.',
  },
  {
    nombre: 'Camu camu', nombreCientifico: 'Myrciaria dubia', origen: 'Amazonas (Perú, Brasil)',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Vitamina C (30–60x más que naranja)', 'Antocianinas', 'Ellagitaninos', 'Leucina'],
    beneficiosTradicionales: ['Sistema inmune', 'Antioxidante extremo', 'Estado de ánimo', 'Antiinflamatorio'],
    comoConsumirlo: ['En polvo (demasiado ácido para comer fresca)', 'En batidos', 'En cápsulas', 'Mezclado con zumos'],
    cantidadOrientativa: '5–10 g de polvo/día',
    contraindicaciones: 'Muy ácido: puede irritar el estómago en exceso. Tomar con alimentos. No usar como sustituto de medicación de vitamina C prescrita.',
    combinaBien: ['Mango', 'Plátano', 'Açaí', 'Espirulina'],
    descripcion: 'El camu camu es la fruta con mayor concentración de vitamina C de la naturaleza: hasta 60 veces más que la naranja por peso. Crece en los ribereños del Amazonas inundados estacionalmente. La vitamina C de camu camu tiene mayor biodisponibilidad que la vitamina C sintética según estudios comparativos.',
    curiosidad: 'El camu camu es tan ácido (pH 2,5–3) que es prácticamente incomible fresco: provoca contracción facial inmediata. Las poblaciones amazónicas lo consumen mezclado con agua y azúcar de caña. La versión en polvo freeze-dried concentra su vitamina C sin el ácido excesivo, manteniendo la biodisponibilidad.',
  },
  {
    nombre: 'Ashwagandha', nombreCientifico: 'Withania somnifera', origen: 'India y Oriente Medio',
    categoria: 'Especias y raíces',
    nutrientesDestacados: ['Withanólidos', 'Alcaloides (somnina, somniferina)', 'Hierro', 'Saponinas'],
    beneficiosTradicionales: ['Adaptógeno (estrés crónico)', 'Cortisol', 'Testosterona y fertilidad masculina', 'Sueño'],
    comoConsumirlo: ['En cápsulas de extracto estandarizado', 'En polvo con leche caliente', 'Latte de ashwagandha'],
    cantidadOrientativa: '300–600 mg de extracto estandarizado/día',
    contraindicaciones: 'No en embarazo (efecto uterocontráctil). Puede interactuar con sedantes, inmunosupresores y tiroides. Contraindicado en hipertiroidismo.',
    combinaBien: ['Leche de vaca o vegetal', 'Miel', 'Cardamomo', 'Cacao'],
    descripcion: 'La ashwagandha es el adaptógeno más estudiado de la medicina ayurvédica. Ensayos controlados randomizados muestran reducciones de cortisol de 15–30%, mejoras en fuerza muscular, calidad del sueño y niveles de testosterona en hombres. Es una de las pocas plantas con eficacia demostrada en reducción de ansiedad medida clínicamente.',
    curiosidad: 'El nombre "ashwagandha" en sánscrito significa "olor de caballo", haciendo referencia a su aroma peculiar y a la creencia de que confiere la fuerza y vitalidad de un caballo. El uso de la ashwagandha en la medicina ayurvédica está documentado en el Charaka Samhita, uno de los textos médicos más antiguos del mundo (siglo III a.C.).',
  },
  {
    nombre: 'Tempeh', nombreCientifico: 'Soja fermentada con Rhizopus oligosporus', origen: 'Java, Indonesia',
    categoria: 'Fermentados',
    nutrientesDestacados: ['Proteína completa (19g/100g)', 'Vitamina B12 (variable)', 'Hierro', 'Calcio', 'Probióticos'],
    beneficiosTradicionales: ['Fuente proteica vegetal', 'Salud intestinal', 'Colesterol', 'Densidad ósea'],
    comoConsumirlo: ['Salteado en wok', 'A la plancha con marinada', 'Desmenuzado en salsas', 'En bocadillo como sustituto de carne'],
    cantidadOrientativa: '100–150 g por ración (3–4 veces/semana)',
    contraindicaciones: 'El tempeh no pasteurizado puede no ser seguro en inmunocomprometidos. El tempeh cocido pierde sus probióticos pero mantiene el resto de nutrientes.',
    combinaBien: ['Salsa de soja', 'Jengibre', 'Ajo', 'Sésamo', 'Verduras salteadas'],
    descripcion: 'El tempeh es la proteína vegetal completa con más densidad nutricional. A diferencia del tofu (soja coagulada), el tempeh es soja entera fermentada: un bloque compacto unido por el micelio del hongo. La fermentación reduce los antinutrientes de la soja (fitatos, lectinas) y aumenta la biodisponibilidad de los minerales.',
    curiosidad: 'El tempeh es el único superalimento de origen indonesio y uno de los pocos que no tiene equivalente en ninguna otra cocina del mundo. Se prepara en Java desde al menos el siglo XVI según registros holandeses. La fermentación con Rhizopus fue domesticada por los javaneses durante generaciones antes de que la microbiología pudiera explicar el proceso.',
  },
  {
    nombre: 'Baobab', nombreCientifico: 'Adansonia digitata', origen: 'África subsahariana',
    categoria: 'Frutas y bayas',
    nutrientesDestacados: ['Vitamina C (6x naranja)', 'Calcio (2x leche)', 'Fibra prebiótica (50%)', 'Potasio', 'Antioxidantes'],
    beneficiosTradicionales: ['Sistema inmune', 'Salud ósea', 'Microbiota', 'Energía sostenida'],
    comoConsumirlo: ['En polvo en batidos', 'Mezclado con agua (bebida tradicional africana)', 'En muesli', 'En repostería'],
    cantidadOrientativa: '15–20 g de polvo/día (1–2 cucharadas)',
    contraindicaciones: 'Ninguna contraindicación significativa conocida. El polvo tiene sabor ácido agradable (limón-vainilla) y es muy versátil.',
    combinaBien: ['Leche de coco', 'Mango', 'Plátano', 'Avena'],
    descripcion: 'El baobab, llamado "árbol de la vida" en África, produce un fruto que se deshidrata de forma natural en su cáscara. Su pulpa en polvo concentra una densidad nutricional extraordinaria: más vitamina C que la naranja, más calcio que la leche y más fibra prebiótica que los alimentos fermentados convencionales.',
    curiosidad: 'El baobab puede vivir más de 3.000 años y almacenar hasta 120.000 litros de agua en su tronco, lo que le permite sobrevivir en zonas con meses de sequía total. Los ejemplares más viejos son huecos por dentro: algunas comunidades africanas los usan como almacén, refugio y hasta como bar improvisado. Uno de los más famosos tiene capacidad para 40 personas sentadas.',
  },
];

// ============================================================
// HELPERS
// ============================================================

function getCategoriaBadgeClass(categoria: CategoriaSuperalimento): string {
  const mapa: Record<CategoriaSuperalimento, string> = {
    'Frutas y bayas': styles.badgeFrutas,
    'Verduras y hojas': styles.badgeVerduras,
    'Semillas y frutos secos': styles.badgeSemillas,
    'Algas y mar': styles.badgeAlgas,
    'Cereales ancestrales': styles.badgeCereales,
    'Fermentados': styles.badgeFermentados,
    'Hongos medicinales': styles.badgeHongos,
    'Especias y raíces': styles.badgeEspecias,
  };
  return mapa[categoria] ?? '';
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function GuiaSuperalimentosPage() {
  const [categoria, setCategoria] = useState<CategoriaSuperalimento | 'Todas'>('Todas');
  const [busqueda, setBusqueda] = useState('');

  const superalimentosFiltrados = useMemo(() => {
    const busquedaLower = busqueda.toLowerCase().trim();
    return SUPERALIMENTOS.filter((s) => {
      const coincideCategoria = categoria === 'Todas' || s.categoria === categoria;
      if (!busquedaLower) return coincideCategoria;
      const coincideBusqueda =
        s.nombre.toLowerCase().includes(busquedaLower) ||
        (s.nombreCientifico?.toLowerCase().includes(busquedaLower) ?? false) ||
        s.origen.toLowerCase().includes(busquedaLower) ||
        s.descripcion.toLowerCase().includes(busquedaLower) ||
        s.nutrientesDestacados.some((n) => n.toLowerCase().includes(busquedaLower)) ||
        s.beneficiosTradicionales.some((b) => b.toLowerCase().includes(busquedaLower));
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoria, busqueda]);

  return (
    <div className={styles.container}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Guia de Superalimentos</h1>
        <p className={styles.heroSubtitle}>
          40 alimentos del mundo con densidad nutricional extraordinaria: propiedades, beneficios
          tradicionales, como consumirlos y curiosidades historicas y cientificas.
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* ── Controles ── */}
        <div className={styles.controles}>
          <div className={styles.buscadorWrap}>
            <span className={styles.buscadorIcon} aria-hidden="true">🔍</span>
            <input
              type="search"
              className={styles.buscador}
              placeholder="Buscar por nombre, nutriente, beneficio u origen..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar superalimento"
            />
          </div>

          <div className={styles.filtros} role="group" aria-label="Filtrar por categoría">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat}
                className={`${styles.filtroBtn} ${categoria === cat ? styles.filtroActivo : ''}`}
                onClick={() => setCategoria(cat)}
                aria-pressed={categoria === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className={styles.contador} role="status" aria-live="polite">
          {superalimentosFiltrados.length} de {SUPERALIMENTOS.length} superalimentos
        </p>

        {/* ── Grid de tarjetas ── */}
        {superalimentosFiltrados.length === 0 ? (
          <div className={styles.sinResultados}>
            <span className={styles.sinResultadosIcon} aria-hidden="true">🌿</span>
            <p>No se encontraron superalimentos con esos filtros.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {superalimentosFiltrados.map((s) => (
              <article key={s.nombre} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitulo}>{s.nombre}</h2>
                  {s.nombreCientifico && (
                    <span className={styles.cardNombreCientifico}>{s.nombreCientifico}</span>
                  )}
                  <div className={styles.cardMeta}>
                    <span className={`${styles.categoriaBadge} ${getCategoriaBadgeClass(s.categoria)}`}>
                      {s.categoria}
                    </span>
                    <span className={styles.origen}>Origen: {s.origen}</span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.descripcion}>{s.descripcion}</p>

                  {/* Nutrientes destacados */}
                  <div>
                    <p className={styles.seccionLabel}>Nutrientes destacados</p>
                    <div className={styles.nutrientesTags}>
                      {s.nutrientesDestacados.map((n) => (
                        <span key={n} className={styles.nutrientesTag}>{n}</span>
                      ))}
                    </div>
                  </div>

                  {/* Beneficios tradicionales */}
                  <div>
                    <p className={styles.seccionLabel}>Beneficios tradicionales</p>
                    <ul className={styles.beneficiosList}>
                      {s.beneficiosTradicionales.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Como consumirlo */}
                  <div>
                    <p className={styles.seccionLabel}>Como consumirlo</p>
                    <div className={styles.comoTags}>
                      {s.comoConsumirlo.map((c) => (
                        <span key={c} className={styles.comoTag}>{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Cantidad orientativa */}
                  <div className={styles.cantidadBox}>
                    <span className={styles.cantidadLabel}>Cantidad orientativa:</span>
                    {s.cantidadOrientativa}
                  </div>

                  {/* Contraindicaciones */}
                  <div className={styles.contraindicacionesBox}>
                    <span className={styles.contraindicacionesLabel}>Precauciones</span>
                    {s.contraindicaciones}
                  </div>

                  {/* Combina bien con */}
                  <div>
                    <p className={styles.seccionLabel}>Combina bien con</p>
                    <div className={styles.combinaTags}>
                      {s.combinaBien.map((c) => (
                        <span key={c} className={styles.combinaTag}>{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Curiosidad */}
                  <div className={styles.curiosidadBox}>
                    <span className={styles.curiosidadIcon} aria-hidden="true">💡</span>
                    <p className={styles.curiosidadText}>{s.curiosidad}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Sección educativa v2.0 ── */}
        <EducationalSection
          title="Los superalimentos: que son, que no son y como usarlos"
          subtitle="Guia practica para incorporar los alimentos mas nutritivos del mundo"
        >
          {/* Tabla comparativa */}
          <h3>Las 8 categorias de superalimentos</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Ejemplos clave</th>
                  <th>Principal beneficio</th>
                  <th>Nutriente estrella</th>
                  <th>Facil de incorporar</th>
                  <th>Nivel cientifico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Frutas y bayas</td>
                  <td>Arandanos, granada, acai</td>
                  <td>Antioxidante, corazon</td>
                  <td>Antocianinas, polifenoles</td>
                  <td>Muy facil</td>
                  <td>Muy alto (meta-analisis)</td>
                </tr>
                <tr>
                  <td>Verduras y hojas</td>
                  <td>Brocoli, espinacas, kale</td>
                  <td>Detox, inmunidad</td>
                  <td>Sulforafano, folato</td>
                  <td>Facil</td>
                  <td>Alto</td>
                </tr>
                <tr>
                  <td>Semillas y frutos secos</td>
                  <td>Chia, nueces, lino</td>
                  <td>Omega-3, saciedad</td>
                  <td>ALA, lignanos</td>
                  <td>Muy facil (topping)</td>
                  <td>Alto</td>
                </tr>
                <tr>
                  <td>Algas y mar</td>
                  <td>Spirulina, nori, clorela</td>
                  <td>Proteina densa, yodo</td>
                  <td>Proteina completa, B12</td>
                  <td>Moderado (sabor)</td>
                  <td>Moderado-alto</td>
                </tr>
                <tr>
                  <td>Cereales ancestrales</td>
                  <td>Quinoa, avena, amaranto</td>
                  <td>Energia sostenida</td>
                  <td>Beta-glucano, proteina</td>
                  <td>Facil</td>
                  <td>Alto (FDA aprueba avena)</td>
                </tr>
                <tr>
                  <td>Fermentados</td>
                  <td>Kefir, miso, chucrut</td>
                  <td>Microbiota intestinal</td>
                  <td>Probioticos vivos</td>
                  <td>Facil</td>
                  <td>Muy alto (microbioma)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 4 escenarios */}
          <h3>Para quien son cada tipo de superalimento</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Deportistas y activos</p>
              <p className={styles.escenarioDesc}>
                Remolacha (nitrato + rendimiento), proteina de quinoa o hemp, acai para recuperacion,
                spirulina pre-entrenamiento, aguacate para absorcion de nutrientes.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Dieta vegana o vegetariana</p>
              <p className={styles.escenarioDesc}>
                Quinoa + amaranto (proteina completa), alga nori (B12, yodo), spirulina (hierro, proteina),
                semillas de chia (omega-3), kefir de agua (probioticos sin lacteo).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Salud digestiva e intestinal</p>
              <p className={styles.escenarioDesc}>
                Kefir + chucrut + kombucha (microbiota), avena (beta-glucano prebiotico),
                miso (enzimas + probioticos), jengibre (digestivo natural).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <p className={styles.escenarioTitulo}>Estres, memoria y cerebro</p>
              <p className={styles.escenarioDesc}>
                Ashwagandha (cortisol), lions mane (NGF, neuroplasticidad), nueces (omega-3 cerebral),
                arandanos (memoria), cacao puro (flavonoides cognitivos).
              </p>
            </div>
          </div>

          {/* 6 FAQ */}
          <h3>Preguntas frecuentes sobre superalimentos</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Que es exactamente un superalimento?</p>
              <p className={styles.faqRespuesta}>
                El termino "superalimento" no tiene definicion cientifica oficial ni regulacion legal en la UE.
                Coloquialmente refiere a alimentos con densidad excepcional de nutrientes beneficiosos (antioxidantes,
                omega-3, probioticos, fitoquimicos) en relacion con sus calorias. Es un concepto de marketing
                consolidado en nutricion popular, no una categoria regulada.
              </p>
              <p className={styles.faqTip}>La guia muestra beneficios documentados, no promesas terapeuticas.</p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Puedo sustituir mi medicacion por superalimentos?</p>
              <p className={styles.faqRespuesta}>
                No. Los superalimentos son alimentos, no medicamentos. Pueden complementar una dieta equilibrada
                y hay evidencia de beneficios preventivos, pero no reemplazan tratamientos medicos prescritos.
                Consulta siempre con tu medico si tomas medicacion cronica.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Cuantos superalimentos debo tomar a la vez?</p>
              <p className={styles.faqRespuesta}>
                No hay numero magico. Lo mas efectivo es incorporar 3-5 de forma consistente y bien integrada
                en tu dieta diaria. La consistencia a largo plazo supera a la variedad excesiva a corto plazo.
                Mejor comer arandanos todos los dias que 10 superalimentos una vez por semana cada uno.
              </p>
              <p className={styles.faqTip}>Empieza por 2-3 y consolida el habito antes de anadir mas.</p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Los superalimentos en polvo son igual de efectivos que los frescos?</p>
              <p className={styles.faqRespuesta}>
                Depende del proceso. El freeze-drying (liofilizacion) conserva hasta el 97% de nutrientes.
                El secado a alta temperatura destruye vitaminas termolabiles (C, B) y enzimas. Spirulina, clorela,
                baobab y camu camu en polvo liofilizado son comparables al fresco. Kefir y chucrut pierden sus
                probioticos al pasteurizarse.
              </p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Los superalimentos son seguros en el embarazo?</p>
              <p className={styles.faqRespuesta}>
                La mayoria de alimentos de esta guia son seguros en el embarazo en cantidades normales (arandanos,
                espinacas, quinoa, avena, salmon). Sin embargo, algunos deben evitarse o limitarse: ashwagandha,
                maca, alga nori en exceso, reishi, chaga. Consulta con tu medico o matrona ante la duda.
              </p>
              <p className={styles.faqTip}>Las contraindicaciones de cada tarjeta incluyen informacion especifica por alimento.</p>
            </div>
            <div className={styles.faqItem}>
              <p className={styles.faqPregunta}>¿Por que los fermentados son tan importantes para la salud?</p>
              <p className={styles.faqRespuesta}>
                La investigacion del microbioma intestinal (2010-2025) ha revelado que una parte muy importante
                del tejido inmunitario se encuentra en el intestino, y la microbiota podría influir en el metabolismo,
                el estado de ánimo y otros procesos, aunque muchos mecanismos están aún por aclarar.
                Los fermentados son la forma mas eficaz de introducir bacterias beneficiosas vivas. Esta categoria
                ha pasado de ser "folklore tradicional" a tener respaldo cientifico solido en dos decadas.
              </p>
            </div>
          </div>

          {/* 5 pasos */}
          <h3>Como incorporar superalimentos en tu dieta</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Elige 1-2 segun tu objetivo principal:</span>
                Sistema inmune o microbiota → kefir + arandanos. Energia y deporte → remolacha + quinoa.
                Antiinflamatorio → curcuma con pimienta + salmon salvaje. Cerebro → nueces + cacao puro.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Integralos en comidas que ya haces:</span>
                No son suplementos, son alimentos. Anilos al desayuno, almuerzo o cena habitual.
                Curcuma en el sofrito, chia en el yogur, kale en la ensalada, arandanos en la avena.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Respeta las cantidades orientativas:</span>
                Mas no es mejor. La mayoria tiene cantidades optimas: excederse con spirulina, nori
                o kale puede causar efectos no deseados. Las tarjetas incluyen la dosis recomendada.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Verifica las contraindicaciones con tu medicacion:</span>
                Varios superalimentos interactuan con anticoagulantes (warfarina), antidiabéticos y
                antihipertensivos. Si tomas medicacion cronica, revisa las contraindicaciones de cada tarjeta
                o consulta con tu farmaceutico.
              </p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <p className={styles.stepContent}>
                <span className={styles.stepTitulo}>Da tiempo para ver resultados:</span>
                Los beneficios de los alimentos son acumulativos. Los estudios muestran efectos significativos
                con 4-12 semanas de consumo regular. No esperes cambios en dias: la nutricion es una inversion
                a largo plazo.
              </p>
            </div>
          </div>

          {/* 5 tips */}
          <h3>Consejos clave para aprovecharlos mejor</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🫙</span>
              <p className={styles.tipTexto}>
                Fermenta en casa: el kefir, el chucrut y el kombucha artesano tienen mas probioticos vivos
                que las versiones pasteurizadas del supermercado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <p className={styles.tipTexto}>
                Curcuma + pimienta + grasa: la curcumina necesita estos tres elementos para absorberse.
                Sin ellos, menos del 1% llega al torrente sanguineo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌿</span>
              <p className={styles.tipTexto}>
                Muele el lino justo antes de consumir: el lino entero pasa intacto. Molido, libera sus
                omega-3 y lignanos. Molido con antelacion se oxida rapidamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">❄️</span>
              <p className={styles.tipTexto}>
                Compra salmon congelado (salvaje): el salmon salvaje congelado en barco mantiene sus omega-3
                intactos y es mas economico que fresco. Busca "Pacific Wild" en la etiqueta.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥗</span>
              <p className={styles.tipTexto}>
                Aguacate en la ensalada multiplica la absorcion de beta-caroteno de las zanahorias y espinacas
                hasta 15 veces. La grasa saludable es necesaria para absorber vitaminas liposolubles.
              </p>
            </div>
          </div>

          {/* Warning box con errores comunes */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes al consumir superalimentos
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Creer que compensan una mala dieta:</strong> ningun superalimento contrarresta
                el azucar, los ultraprocesados o el sedentarismo. Son un complemento, no un rescate.
              </li>
              <li>
                <strong>Tomar kefir o chucrut pasteurizado:</strong> el proceso de pasteurizacion mata
                todos los probioticos. Busca siempre "no pasteurizado" o elaborado en casa.
              </li>
              <li>
                <strong>Comer semillas de lino enteras:</strong> el cuerpo no puede romper su cubierta.
                Pasan sin absorberse. Siempre molidas justo antes de consumir.
              </li>
              <li>
                <strong>Excederse con alimentos altos en yodo:</strong> spirulina, nori y clorela en exceso
                pueden alterar la funcion tiroidea, especialmente si hay patologia previa.
              </li>
              <li>
                <strong>Tomar curcuma sin pimienta negra ni grasa:</strong> la biodisponibilidad de curcumina
                sin piperina es inferior al 1%. La combinacion no es opcional, es necesaria para el efecto.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-superalimentos')} />
        <ShareCard appName="guia-superalimentos" />
      </main>

      <Footer appName="guia-superalimentos" />
    </div>
  );
}
