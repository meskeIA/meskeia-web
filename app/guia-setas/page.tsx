'use client';

import { useState, useMemo } from 'react';
import styles from './GuiaSetas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
} from '@/components';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ============================================================
// TIPOS
// ============================================================

type Comestibilidad = 'Comestible' | 'Comestible con precaución' | 'No comestible' | 'Tóxica' | 'Mortal';
type Habitat = 'Bosque caducifolio' | 'Bosque de coníferas' | 'Prados y pastos' | 'Zonas húmedas' | 'Bosque mixto' | 'Zonas urbanas';
type Temporada = 'Primavera' | 'Verano' | 'Otoño' | 'Invierno' | 'Todo el año';

interface Seta {
  nombre: string;
  nombreCientifico: string;
  familia: string;
  comestibilidad: Comestibilidad;
  habitat: Habitat[];
  temporada: Temporada[];
  sombrero: string;
  laminas: string;
  pie: string;
  olor: string;
  especiesConfusas: string[];
  distribucion: string;
  usosCulinarios: string;
  aviso: string;
  descripcion: string;
  curiosidad: string;
}

// ============================================================
// DATOS
// ============================================================

const SETAS: Seta[] = [
  {
    nombre: 'Boletus edulis', nombreCientifico: 'Boletus edulis', familia: 'Boletaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Bosque de coníferas', 'Bosque mixto'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Convexo, 5–30 cm, marrón castaño, cutícula seca o ligeramente viscosa',
    laminas: 'Sin láminas: poros blancos que amarillean con la edad',
    pie: 'Robusto, 5–15 cm, blanco a marrón claro con retícula blanca en la parte superior',
    olor: 'Agradable, suave, a nuez',
    especiesConfusas: ['Boletus satanas (tóxico: pie rojo)', 'Tylopilus felleus (amargo, pie con retícula oscura)'],
    distribucion: 'Toda Europa, Norte de Asia, Norte de América',
    usosCulinarios: 'Risottos, pastas, guisos, seco en polvo. Uno de los más valorados culinariamente.',
    aviso: 'Confirmar siempre la ausencia de pie rojo y no azulear al corte. El boletus satanas (tóxico) tiene el pie rojizo.',
    descripcion: 'El rey de los hongos silvestres. El boletus edulis, conocido como "cep" en Cataluña o "calabaza" en algunas zonas, es el hongo comestible más valorado de Europa. Su carne blanca firme y su sabor profundo a bosque lo convierten en un ingrediente premium de la alta cocina mundial.',
    curiosidad: 'En Italia, el boletus edulis (porcino) se comercializa fresco en mercados de lujo a precios de hasta 60 €/kg en temporada alta. El nombre "porcini" (cerditos) hace referencia a su aspecto rollizo y regordete.',
  },
  {
    nombre: 'Rebozuelo', nombreCientifico: 'Cantharellus cibarius', familia: 'Cantharellaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Bosque de coníferas', 'Bosque mixto'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Irregular, ondulado, 2–10 cm, amarillo dorado uniforme',
    laminas: 'Falsas láminas: pliegues ramificados del mismo color que el sombrero',
    pie: 'Macizo, 3–8 cm, amarillo dorado, se estrecha hacia la base',
    olor: 'Afrutado, a albaricoque',
    especiesConfusas: ['Hygrophoropsis aurantiaca (tóxico: láminas verdaderas naranjas)'],
    distribucion: 'Toda Europa, Asia, América del Norte y del Sur',
    usosCulinarios: 'Salteados con mantequilla y ajo, huevos revueltos, salsas y guisos. Aroma afrutado muy apreciado.',
    aviso: 'Distinguir por los pliegues (no láminas verdaderas) y el olor afrutado. La hygrophoropsis aurantiaca (tóxica) tiene láminas naranjas reales y olor desagradable.',
    descripcion: 'Uno de los hongos comestibles más queridos de Europa. Su color dorado brillante y su olor afrutado lo hacen inconfundible. Crece en simbiosis con árboles (micorrícico), por lo que no puede cultivarse artificialmente. Esta escasez lo hace muy valorado en los mercados.',
    curiosidad: 'Los rebozuelos son uno de los pocos hongos que resisten bien la congelación en fresco. En los países escandinavos, es tradicional recolectarlos en verano y congelarlos para usar durante todo el invierno en guisos y salsas.',
  },
  {
    nombre: 'Níscalo', nombreCientifico: 'Lactarius deliciosus', familia: 'Russulaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque de coníferas'],
    temporada: ['Otoño'],
    sombrero: 'Anaranjado con zonas concéntricas, 5–15 cm, embudo progresivo',
    laminas: 'Anaranjadas, se verdean al tacto',
    pie: 'Corto y robusto, anaranjado con hoyuelos más oscuros',
    olor: 'Suave, agradable',
    especiesConfusas: ['Lactarius torminosus (tóxico: láminas rosadas, sin verdear)'],
    distribucion: 'Europa principalmente, asociado a pinos',
    usosCulinarios: 'A la plancha, al ajillo, en guisos. Muy popular en España, especialmente en Cataluña.',
    aviso: 'Verificar que el látex sea naranja-zanahoria (azulea con el aire) y que crezca bajo pinos. El L. torminosus (tóxico) crece bajo abedules y tiene látex blanco.',
    descripcion: 'El hongo más recolectado en España. Asociado exclusivamente a bosques de pinos, el níscalo tiene una temporada otoñal bien definida. Su látex naranja característico y su asociación con coníferas lo hacen relativamente fácil de identificar para recolectores con experiencia.',
    curiosidad: 'En España, el níscalo tiene más de 40 nombres regionales distintos: robellón, mizclo, esclatasang, pinatell... Esta variedad de nombres refleja la enorme tradición micológica regional española, especialmente en Cataluña y Aragón.',
  },
  {
    nombre: 'Trompeta de la muerte', nombreCientifico: 'Craterellus cornucopioides', familia: 'Cantharellaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Bosque mixto'],
    temporada: ['Otoño'],
    sombrero: 'Forma de trompeta, 3–8 cm, gris oscuro a negro, bordes ondulados',
    laminas: 'Sin láminas: superficie externa gris con venas apenas visibles',
    pie: 'Hueco, tubular, negro o gris oscuro',
    olor: 'Suave, ligeramente afrutado',
    especiesConfusas: ['Difícil de confundir por su forma única'],
    distribucion: 'Europa, Asia, América del Norte',
    usosCulinarios: 'Excelente seca (potencia el sabor enormemente). Salsas, pastas, risottos. Sabor intenso a trufas.',
    aviso: 'Su color oscuro dificulta verla en el bosque. No se confunde fácilmente con especies tóxicas.',
    descripcion: 'A pesar de su nombre amenazador, la trompeta de la muerte es un hongo comestible excelente. Su nombre hace referencia a su aspecto de trompeta oscura, no a su toxicidad. Seca, tiene un sabor potente similar a las trufas y se usa como sucedáneo asequible de estas.',
    curiosidad: 'La trompeta de la muerte es tan difícil de ver en el suelo del bosque que en Dinamarca se llama "trompeta de los ciegos" (blindetrompet). Crece en grupos densos entre las hojas muertas, siendo prácticamente invisible para quien no sabe dónde mirar.',
  },
  {
    nombre: 'Champiñón silvestre', nombreCientifico: 'Agaricus campestris', familia: 'Agaricaceae',
    comestibilidad: 'Comestible',
    habitat: ['Prados y pastos'],
    temporada: ['Primavera', 'Verano', 'Otoño'],
    sombrero: 'Blanco, 5–12 cm, liso, a veces con escamas en el centro',
    laminas: 'Rosadas de joven, se oscurecen a marrón-chocolate con la madurez',
    pie: 'Corto y robusto, con anillo membranoso fugaz',
    olor: 'Agradable, a champiñón',
    especiesConfusas: ['Amanita phalloides joven (mortal: siempre blanco, con volva)', 'Agaricus xanthodermus (tóxico: amarilla al corte, olor a tinta)'],
    distribucion: 'Cosmopolita, prados y campos de Europa y América',
    usosCulinarios: 'Todos los usos culinarios del champiñón cultivado, pero con más sabor.',
    aviso: 'CRÍTICO: comprobar que las láminas sean rosadas (nunca blancas) y que no amarilee al corte. Si amarillea, es A. xanthodermus (tóxico).',
    descripcion: 'El ancestro silvestre del champiñón cultivado. Crece en prados y pastizales, especialmente donde hay abono orgánico. Tiene mucho más sabor que su primo de cultivo. Identificación relativamente segura para expertos, pero requiere precaución por las posibles confusiones con amanitas.',
    curiosidad: 'El champiñón cultivado (Agaricus bisporus) fue desarrollado a partir del champiñón silvestre en Francia en el siglo XVII. Hoy es el hongo más producido en el mundo, con una producción anual de más de 4 millones de toneladas.',
  },
  {
    nombre: 'Matamoscas', nombreCientifico: 'Amanita muscaria', familia: 'Amanitaceae',
    comestibilidad: 'Tóxica',
    habitat: ['Bosque caducifolio', 'Bosque de coníferas', 'Bosque mixto'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Rojo brillante con manchas blancas, 5–20 cm, globoso luego aplanado',
    laminas: 'Blancas, libres del pie',
    pie: 'Blanco, con anillo blanco y volva escamosa en la base',
    olor: 'Suave',
    especiesConfusas: ['Amanita caesarea (comestible: naranja sin manchas blancas, volva blanca en saco)'],
    distribucion: 'Hemisferio Norte, cosmopolita',
    usosCulinarios: 'No comestible. Algunos la consumen tras hervido prolongado, práctica de alto riesgo.',
    aviso: 'TÓXICA. Contiene muscimol y ácido iboténico. Síntomas: delirios, alucinaciones, náuseas. No mortal usualmente pero con intoxicación seria.',
    descripcion: 'El hongo más icónico de la cultura popular. Su sombrero rojo con manchas blancas aparece en cuentos de hadas, videojuegos y decoraciones navideñas. Es tóxico aunque raramente mortal. Sus principios activos psicoactivos han sido usados en rituales chamánicos en Siberia durante milenios.',
    curiosidad: 'Existe una teoría académica (aunque controvertida) que sugiere que el soma del Rigveda —la bebida sagrada de los antiguos indoeuropeos— era preparado a base de Amanita muscaria. El etnobotánico R. Gordon Wasson la desarrolló en su libro de 1968.',
  },
  {
    nombre: 'Oreja de Judas', nombreCientifico: 'Auricularia auricula-judae', familia: 'Auriculariaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Zonas húmedas'],
    temporada: ['Todo el año'],
    sombrero: 'Forma de oreja, gelatinoso, marrón-morado, 3–12 cm',
    laminas: 'Sin láminas: superficie lisa en interior, rugosa en exterior',
    pie: 'Sin pie definido, se adhiere lateralmente al sustrato',
    olor: 'Casi inodoro',
    especiesConfusas: ['Auricularia mesenterica (comestible pero menos sabrosa)'],
    distribucion: 'Cosmopolita, crece sobre madera muerta (especialmente saúco)',
    usosCulinarios: 'Fundamental en la cocina china y asiática: sopas, salteados, sopa hot-pot. Textura gelatinosa única.',
    aviso: 'Inconfundible por su textura gelatinosa y forma de oreja. Crece sobre madera muerta.',
    descripcion: 'El hongo más consumido en Asia después del shiitake. Su textura gelatinosa y crujiente a la vez lo hace indispensable en la cocina china. Crece durante todo el año sobre madera muerta, especialmente de saúco. Muy fácil de identificar por su forma única.',
    curiosidad: 'El nombre "Oreja de Judas" proviene de la leyenda medieval de que Judas Iscariote se ahorcó de un saúco —el árbol donde más comúnmente crece este hongo. En chino se llama "木耳" (mù ěr = oreja de árbol), nombre igualmente descriptivo.',
  },
  {
    nombre: 'Seta de cardo', nombreCientifico: 'Pleurotus eryngii', familia: 'Pleurotaceae',
    comestibilidad: 'Comestible',
    habitat: ['Prados y pastos', 'Zonas urbanas'],
    temporada: ['Primavera', 'Otoño', 'Invierno'],
    sombrero: 'Convexo a aplanado, 5–15 cm, marrón claro a grisáceo, borde ondulado',
    laminas: 'Blancas, decurrentes por el pie',
    pie: 'Corto y excéntrico o central, blanco, muy carnoso',
    olor: 'Agradable, ligeramente anisado',
    especiesConfusas: ['Otras especies de Pleurotus (todos comestibles)'],
    distribucion: 'Cuenca mediterránea: España, Francia, Italia, Grecia, Oriente Medio',
    usosCulinarios: 'A la plancha (como filete), guisos, sopas. Una de las setas con mejor textura cárnica.',
    aviso: 'Prácticamente imposible confundirla con especies tóxicas. Muy segura para recolectores principiantes.',
    descripcion: 'La seta de cardo o "pleurotus" crece en raíces muertas de cardos y otras umbelíferas. Es la seta silvestre española más apreciada después del níscalo. Su textura carnosa y su sabor delicado la hacen perfecta a la plancha, como un filete vegetal. También se cultiva comercialmente.',
    curiosidad: 'El Pleurotus eryngii es capaz de descomponer plásticos de polietileno. Investigaciones recientes han demostrado que sus enzimas (lacasas y peroxidasas) pueden degradar ciertos polímeros, abriendo posibilidades para la biorremediación de residuos plásticos.',
  },
  {
    nombre: 'Seta de chopo', nombreCientifico: 'Agrocybe aegerita', familia: 'Strophariaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Zonas urbanas'],
    temporada: ['Primavera', 'Otoño'],
    sombrero: 'Convexo, 5–12 cm, marrón ocre, borde liso',
    laminas: 'Blanquecinas, luego marrón cigar',
    pie: 'Fibroso, 5–12 cm, con anillo membranoso',
    olor: 'Agradable, harina húmeda',
    especiesConfusas: ['Galerina marginata (mortal: crece en madera, sin sabor harinoso)', 'Pholiota spp. (olor desagradable)'],
    distribucion: 'Europa, Asia, cultivada mundialmente',
    usosCulinarios: 'Salteadas, en guisos, tortillas. Sabor intenso y textura firme.',
    aviso: 'CUIDADO: Galerina marginata es mortal y crece también en madera. Verificar el anillo y el olor harinoso del pie. Colectores expertos solamente.',
    descripcion: 'Muy popular en España e Italia (donde se llama "piopino"). Crece en grupos en tocones y troncos de chopos, álamos y olmos. Su anillo membranoso y su olor harinoso son características clave. Ampliamente cultivada en Asia bajo el nombre "seta yanagi".',
    curiosidad: 'La Agrocybe aegerita es uno de los hongos con mayor contenido de ergotioneína, un antioxidante que el cuerpo humano no puede sintetizar por sí mismo. Recientes estudios asocian la ergotioneína con la prevención del envejecimiento celular.',
  },
  {
    nombre: 'Oronja', nombreCientifico: 'Amanita caesarea', familia: 'Amanitaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Bosque mixto'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Naranja uniforme sin manchas, 8–20 cm, liso',
    laminas: 'Amarillas, libres del pie',
    pie: 'Amarillo, con anillo amarillo estriado y volva blanca en saco',
    olor: 'Agradable, suave',
    especiesConfusas: ['Amanita muscaria (tóxico: rojo con manchas blancas)', 'Amanita phalloides joven en huevo (mortal)'],
    distribucion: 'Sur de Europa, región mediterránea',
    usosCulinarios: 'Cruda en carpaccio, a la plancha. Considerada el hongo más fino de Europa.',
    aviso: 'CRÍTICO: en estado de huevo (antes de abrirse), verificar siempre que el interior sea naranja-amarillo, nunca blanco-verdoso (A. phalloides). Solo para expertos consumados.',
    descripcion: 'Considerada el hongo más exquisito de Europa. El "huevo de rey" romano era la oronja, reservada para banquetes imperiales. Sus láminas amarillas y la volva en forma de saco blanco son características diagnósticas. Su confusión con amanitas tóxicas en estado joven es el mayor riesgo.',
    curiosidad: 'El emperador romano Claudio murió envenenado en el año 54 d.C., posiblemente con Amanita phalloides mezclada con oronjas reales. Su mujer Agripina era aficionada a las setas y algunos historiadores señalan que el envenenamiento fue deliberado para favorecer la sucesión de Nerón.',
  },
  {
    nombre: 'Pie azul', nombreCientifico: 'Lepista nuda', familia: 'Tricholomataceae',
    comestibilidad: 'Comestible con precaución',
    habitat: ['Bosque caducifolio', 'Bosque mixto', 'Prados y pastos'],
    temporada: ['Otoño', 'Invierno'],
    sombrero: 'Violeta-lila, 5–15 cm, convexo luego aplanado',
    laminas: 'Violetas, apretadas',
    pie: 'Violeta, fibroso, base bulbosa',
    olor: 'Aromático, anisado',
    especiesConfusas: ['Cortinarius violaceus (tóxico: sin olor anisado, cortina en pie)', 'Cortinarius sp. varios (tóxicos)'],
    distribucion: 'Europa y América del Norte',
    usosCulinarios: 'Salteados, guisos. Cocinar bien: cruda puede causar trastornos digestivos.',
    aviso: 'Debe cocinarse siempre. Cruda es indigesta. Peligro de confusión con cortinarios tóxicos: verificar ausencia de cortina y presencia de olor anisado.',
    descripcion: 'El pie azul o "blewit" inglés es reconocible por su coloración violeta uniforme en todas sus partes. Crece tarde en el otoño cuando la mayoría de setas ya han desaparecido. Debe cocinarse bien porque cruda causa problemas digestivos. Su olor anisado es muy característico.',
    curiosidad: 'En Reino Unido, el pie azul (blewit) fue la primera seta en ser cultivada comercialmente, antes que el champiñón. Sin embargo, su cultivo fue abandonado porque el proceso era más complejo y los rendimientos menores que con el champiñón.',
  },
  {
    nombre: 'Gírgola', nombreCientifico: 'Pleurotus ostreatus', familia: 'Pleurotaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Zonas urbanas'],
    temporada: ['Otoño', 'Invierno', 'Primavera'],
    sombrero: 'En forma de ostra, 5–25 cm, gris a marrón claro, borde ondulado',
    laminas: 'Blancas, decurrentes por el pie',
    pie: 'Muy corto o ausente, lateral',
    olor: 'Agradable, suave, a anís',
    especiesConfusas: ['Pleurotus cornucopiae (comestible)', 'Crepidotus spp. (no comestibles, pequeños, sin olor anisado)'],
    distribucion: 'Cosmopolita, sobre madera muerta de frondosas',
    usosCulinarios: 'Salteadas, al ajillo, en sopas. Una de las más versátiles y asequibles.',
    aviso: 'Muy segura. Prácticamente inconfundible con tóxicas. Verificar que crezca en madera muerta y el olor agradable.',
    descripcion: 'La gírgola o seta ostra es la segunda seta más cultivada del mundo. Crece en racimos sobre troncos muertos de frondosas, especialmente en invierno. Es una de las pocas setas disponibles cuando las demás han desaparecido. Su textura firme y sabor suave la hacen muy versátil.',
    curiosidad: 'Los kits de cultivo de gírgola son los más populares del mercado: basta inocular paja o serrín con el micelio y la seta crece en 2–3 semanas en casa. Las gírgolas cultivadas consumen el sustrato (paja, cartón, granos de café) reduciendo residuos orgánicos.',
  },
  {
    nombre: 'Falsa oronja', nombreCientifico: 'Amanita phalloides', familia: 'Amanitaceae',
    comestibilidad: 'Mortal',
    habitat: ['Bosque caducifolio', 'Bosque mixto'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Verde oliváceo con fibras radiantes, 5–15 cm',
    laminas: 'Blancas, libres del pie',
    pie: 'Blanco con anillo y volva en saco en la base',
    olor: 'Casi inodoro, ligeramente dulzón',
    especiesConfusas: ['Amanita caesarea joven (comestible: interior naranja)', 'Champiñón silvestre joven (comestible: sin volva, láminas rosadas)'],
    distribucion: 'Europa, Asia, introducida en América, Australia, Sudáfrica',
    usosCulinarios: 'MORTAL. Ningún uso culinario.',
    aviso: 'MORTAL. Causa el 90% de las muertes por intoxicación micológica en el mundo. Contiene amatoxinas que destruyen el hígado en 6-16 días. NO HAY ANTÍDOTO. La dosis letal es media seta.',
    descripcion: 'El hongo más peligroso del mundo. La Amanita phalloides ("seta de la muerte") es responsable del 90% de las muertes por intoxicación micológica en el mundo. Media seta adulta contiene suficiente amatoxina para matar a un adulto. Los síntomas aparecen tarde (6-24 horas) cuando el daño ya es irreversible.',
    curiosidad: 'Las amatoxinas de la Amanita phalloides son termoestables: ni hervir ni freír las destruye. Este fue uno de los motivos históricos de las intoxicaciones mortales: las víctimas creían haber "cocinado bien" el hongo. Su toxicidad es independiente de la preparación culinaria.',
  },
  {
    nombre: 'Colmenilla', nombreCientifico: 'Morchella esculenta', familia: 'Morchellaceae',
    comestibilidad: 'Comestible con precaución',
    habitat: ['Bosque caducifolio', 'Prados y pastos'],
    temporada: ['Primavera'],
    sombrero: 'Alveolado como panal de miel, 5–12 cm, crema a marrón, hueco',
    laminas: 'Sin láminas: alvéolos profundos',
    pie: 'Hueco, blanco a crema, acanalado',
    olor: 'Agradable, terroso',
    especiesConfusas: ['Gyromitra esculenta (tóxica: lóbulos cerebrales, no alveolada)'],
    distribucion: 'Europa, América del Norte, Asia',
    usosCulinarios: 'Siempre bien cocida. Rellenas, en salsas de nata, con huevos. Excelente sabor.',
    aviso: 'Cocinar siempre: cruda contiene hemolisinas tóxicas. Peligro de confusión con Gyromitra (tóxica con toxina volátil que se elimina parcialmente al hervir, pero peligrosa).',
    descripcion: 'Una de las setas de primavera más codiciadas. Su aspecto de "panal de miel" sobre un pie hueco la hace inconfundible para los expertos. Aparece en primavera, a menudo después de incendios. Debe cocinarse siempre porque cruda contiene hemolisinas que se destruyen con el calor.',
    curiosidad: 'Las colmenillas aparecen masivamente en los primeros años después de incendios forestales. Su micelio sobrevive al fuego y florece con la regeneración de los suelos quemados. Los recolectores escandinavos y americanos siguen los rastros de incendios para cosecharlas.',
  },
  {
    nombre: 'Seta parasol', nombreCientifico: 'Macrolepiota procera', familia: 'Agaricaceae',
    comestibilidad: 'Comestible',
    habitat: ['Prados y pastos', 'Bosque caducifolio', 'Zonas urbanas'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Escamoso, 10–30 cm, blanco-grisáceo con escamas marrones, pezón oscuro central',
    laminas: 'Blancas, libres del pie',
    pie: 'Alto (hasta 30 cm), con anillo movible, decorado con franjas marrones',
    olor: 'Agradable, ligeramente a nuez',
    especiesConfusas: ['Macrolepiota venenata (tóxica)', 'Lepiota cristata (tóxica, pequeña, olor a goma)'],
    distribucion: 'Europa, América, África',
    usosCulinarios: 'El sombrero empanado y frito es un plato clásico. El pie es demasiado fibroso para comer.',
    aviso: 'No comer especies pequeñas de Lepiota (muchas son tóxicas). Solo las Macrolepiota grandes (>20 cm) son seguras. El anillo movible es característica clave.',
    descripcion: 'Una seta espectacular por su tamaño: puede superar 30 cm de diámetro. Su anillo doble y movible, su aspecto de parasol y su pezón central oscuro son características diagnósticas. El sombrero rebozado y frito es un manjar campestre clásico en muchas regiones europeas.',
    curiosidad: 'La seta parasol puede aparecer en lugares insólitos: jardines urbanos, arcenes de carretera, parques. Crece en lugares donde el suelo ha sido removido o hay materia orgánica en descomposición. Es una de las pocas setas grandes que aparece en plena ciudad.',
  },
  {
    nombre: 'Shiitake', nombreCientifico: 'Lentinula edodes', familia: 'Omphalotaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio'],
    temporada: ['Primavera', 'Otoño'],
    sombrero: 'Marrón, 5–15 cm, convexo, borde involuto con restos de velo',
    laminas: 'Blancas, apretadas',
    pie: 'Fibroso, blanco con base marrón',
    olor: 'Intenso, umami',
    especiesConfusas: ['Pocas: bien diferenciado por su sustrato (madera de caducifolias asiáticas)'],
    distribucion: 'Asia Oriental nativa; cultivado mundialmente',
    usosCulinarios: 'Fundamental en la cocina asiática. Sopas, salteados, ramen, salsas. Seco potencia el sabor.',
    aviso: 'El consumo de shiitake crudo o poco cocinado puede causar dermatitis flagelada en personas sensibles. Siempre bien cocido.',
    descripcion: 'El segundo hongo más consumido del mundo. Nativo de los bosques de robles de Asia Oriental, el shiitake se cultiva mundialmente desde hace siglos. Es el hongo del umami: su alto contenido en glutamatos lo convierte en potenciador del sabor natural. Los estudios sobre sus propiedades inmunomoduladoras son prometedores.',
    curiosidad: 'El shiitake se cultiva en Japón desde al menos el año 1000 d.C. El nombre combina "shii" (árbol de roble japonés Castanopsis) y "take" (hongo). Hoy es el cultivo micológico más estudiado del mundo, con más de 2.000 artículos científicos sobre sus propiedades.',
  },
  {
    nombre: 'Seta de San Jorge', nombreCientifico: 'Calocybe gambosa', familia: 'Lyophyllaceae',
    comestibilidad: 'Comestible',
    habitat: ['Prados y pastos', 'Bosque caducifolio'],
    temporada: ['Primavera'],
    sombrero: 'Blanco a crema, 5–15 cm, convexo, borde ondulado',
    laminas: 'Blancas, apretadas',
    pie: 'Robusto, blanco, macizo',
    olor: 'Harina fresca, muy intenso',
    especiesConfusas: ['Clitocybe rivulosa (tóxica: olor harinoso pero menos intenso)', 'Entoloma sinuatum (tóxica: láminas rosadas)'],
    distribucion: 'Europa, zona templada',
    usosCulinarios: 'Tortillas, guisos, revueltos. Sabor intenso a harina húmeda muy apreciado.',
    aviso: 'El olor harinoso intenso es clave. La Clitocybe rivulosa (tóxica) tiene olor más débil y crece en círculos en prados. La Entoloma sinuatum tiene láminas que se vuelven rosadas.',
    descripcion: 'La seta de San Jorge o "perrechico" vasco aparece por San Jorge (23 de abril), de ahí su nombre. Su olor inconfundible a harina fresca la identifica. Muy apreciada en el País Vasco y Navarra, donde alcanza precios premium en temporada. Crece en "corros de brujas" (anillos).',
    curiosidad: 'El término "corro de brujas" para definir los círculos donde crecen las setas viene de la creencia medieval de que eran provocados por las brujas que bailaban en esos círculos durante el sabbat. La explicación real es que el micelio crece radialmente desde un punto central agotando los nutrientes.',
  },
  {
    nombre: 'Coprino comatus', nombreCientifico: 'Coprinus comatus', familia: 'Agaricaceae',
    comestibilidad: 'Comestible con precaución',
    habitat: ['Prados y pastos', 'Zonas urbanas'],
    temporada: ['Primavera', 'Verano', 'Otoño'],
    sombrero: 'Forma de bala, blanco con escamas pardas, 5–15 cm; se delicua en negro',
    laminas: 'Blancas, luego rosadas y finalmente negras líquidas (autolisis)',
    pie: 'Hueco, blanco, anillo movible',
    olor: 'Agradable, suave',
    especiesConfusas: ['Coprinus atramentarius (tóxico si se combina con alcohol)'],
    distribucion: 'Cosmopolita, terrenos removidos, jardines, arcenes',
    usosCulinarios: 'Solo muy joven, antes de que las láminas se vuelvan negras. Salteados, en revueltos. Comer en menos de 2 horas tras la recolección.',
    aviso: 'Consumir solo joven. Si las láminas empiezan a oscurecer, descartar. NO combinar con alcohol en las 24-48h siguientes. Comer rápido: se delicua en horas.',
    descripcion: 'El "champiñón tinta" se autodigiere (delicua) en pocas horas, convirtiéndose en un líquido negro. Esta tinta se usó históricamente para escribir y como pigmento artístico. Solo es comestible muy joven, antes del proceso de autolisis. Su efimera ventana de consumo la hace poco práctica.',
    curiosidad: 'La tinta del Coprinus comatus fue usada por monjes medievales para iluminar manuscritos. El naturalista inglés Beatrix Potter (sí, la autora de Peter Rabbit) era también una destacada micóloga amateur y pintó detalladas acuarelas científicas de esta seta en los años 1890.',
  },
  {
    nombre: 'Trompeta amarilla', nombreCientifico: 'Craterellus lutescens', familia: 'Cantharellaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque de coníferas', 'Bosque mixto'],
    temporada: ['Otoño'],
    sombrero: 'Trompeta hueca, 3–8 cm, marrón amarillento a grisáceo, borde lobulado',
    laminas: 'Pliegues poco marcados, amarillo-naranja en el exterior',
    pie: 'Hueco, amarillo-naranja brillante',
    olor: 'Suave, afrutado',
    especiesConfusas: ['Craterellus cornucopioides (comestible, negro)'],
    distribucion: 'Europa, América del Norte',
    usosCulinarios: 'Salsas, risottos, sopas. Excelente seca. Su pie amarillo-naranja le da un toque de color.',
    aviso: 'Muy segura. No se confunde con tóxicas. Acompañante frecuente de la trompeta de la muerte.',
    descripcion: 'Prima de la trompeta de la muerte pero con el pie exterior de llamativo color naranja-amarillo. Crece en los mismos hábitats y temporadas que las trompetas negras, a menudo mezclada con ellas. Su tamaño pequeño y color discreto la hacen pasar desapercibida. Excelente seca.',
    curiosidad: 'Las trompetas amarillas y negras a menudo crecen juntas formando alfombras en el suelo del bosque. En Cataluña se les llama "rossinyols de tardor" (ruiseñores de otoño) y son recolectadas junto a los rebozuelos como parte de la tradición micológica catalana.',
  },
  {
    nombre: 'Seta de olivo', nombreCientifico: 'Omphalotus olearius', familia: 'Omphalotaceae',
    comestibilidad: 'Tóxica',
    habitat: ['Bosque caducifolio'],
    temporada: ['Otoño'],
    sombrero: 'Naranja-dorado brillante, 6–18 cm, embudo progresivo',
    laminas: 'Anaranjadas, bioluminiscentes de noche',
    pie: 'Anaranjado, excéntrico, en grupos en la base de los árboles',
    olor: 'Agradable, afrutado (engañoso)',
    especiesConfusas: ['Cantharellus cibarius (comestible: pliegues no láminas, olor afrutado, nunca en madera)'],
    distribucion: 'Cuenca mediterránea, Sur de Europa',
    usosCulinarios: 'TÓXICA. No comestible.',
    aviso: 'TÓXICA. Confundida frecuentemente con rebozuelos. Diferencias: láminas verdaderas (no pliegues), crece en madera muerta de olivos y encinas, láminas bioluminiscentes de noche. El rebozuelo nunca crece en madera.',
    descripcion: 'Una de las intoxicaciones más frecuentes en el área mediterránea. La seta de olivo se confunde con el rebozuelo por su color y olor similares. Las diferencias son claras: la seta de olivo tiene láminas verdaderas (el rebozuelo tiene pliegues), crece en madera y sus láminas brillan en la oscuridad.',
    curiosidad: 'Las láminas de la seta de olivo son bioluminiscentes: brillan con una luz verde-azulada en la oscuridad. Esta bioluminiscencia se produce por la enzima luciferina-luciferasa, la misma que utilizan las luciérnagas. Su función biológica en los hongos no está completamente aclarada.',
  },
  {
    nombre: 'Pedo de lobo gigante', nombreCientifico: 'Calvatia gigantea', familia: 'Agaricaceae',
    comestibilidad: 'Comestible con precaución',
    habitat: ['Prados y pastos', 'Zonas urbanas'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Esfera blanca, 10–80 cm diámetro, sin sombrero ni láminas',
    laminas: 'Sin láminas: interior blanco esponjoso (comestible) o negro-aceituna (esporas, no comer)',
    pie: 'Sin pie definido, adherido al suelo por cordón',
    olor: 'Suave',
    especiesConfusas: ['Amanita phalloides joven en huevo (mortal: al cortar siempre muestra la silueta de la futura amanita)'],
    distribucion: 'Europa, América del Norte, zonas templadas',
    usosCulinarios: 'Solo si el interior es blanco uniforme. En rodajas a la plancha, rebozado, en guisos.',
    aviso: 'CRÍTICO: comer solo si el interior es completamente blanco y esponjoso. Al corte siempre debe ser blanco uniforme. Si aparece cualquier silueta oscura, podría ser una amanita joven. Los "pedos de lobo" marrones-aceitosos son maduros y no comestibles.',
    descripcion: 'El hongo más grande del mundo en peso: ejemplares documentados de hasta 20 kg. Cuando es joven y su interior es blanco puro, es comestible. A diferencia de cualquier otra seta, al cortarlo en rodajas se obtienen rodajas blancas perfectas sin láminas ni estructura interna visible.',
    curiosidad: 'Un ejemplar de Calvatia gigantea puede producir hasta 7 billones de esporas. Si todas germinaran y los hongos resultantes produjeran el mismo número, la masa resultante sería mayor que el peso de la Tierra. Esta "cadena reproductiva" demostró a los naturalistas victorianos la reproducción fúngica.',
  },
  {
    nombre: 'Níscalo de abeto', nombreCientifico: 'Lactarius salmonicolor', familia: 'Russulaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque de coníferas'],
    temporada: ['Otoño'],
    sombrero: 'Salmón-anaranjado, 5–12 cm, zonas concéntricas más claras',
    laminas: 'Salmón-anaranjado, no verdean al tacto (diferencia con L. deliciosus)',
    pie: 'Anaranjado pálido, sin hoyuelos',
    olor: 'Agradable, resinoso',
    especiesConfusas: ['Lactarius deliciosus (comestible, verdea al tacto)'],
    distribucion: 'Montañas europeas con abetos',
    usosCulinarios: 'Similares al níscalo: a la plancha, guisos. Algo más fino de sabor.',
    aviso: 'Inconfundible entre los colectores experimentados. La diferencia con L. deliciosus: no verdea.',
    descripcion: 'El níscalo de abeto crece en bosques de abetos (no pinos como el níscalo común). A diferencia del Lactarius deliciosus, sus láminas no se verdean al tacto. Tiene un sabor algo más delicado y es igualmente apreciado gastronomicamente. Su distribución se limita a montañas con abetales.',
    curiosidad: 'Los lactarius (níscaros y lactarios) se llaman así porque exudan un látex al cortarlos o romperlos. Este látex puede ser blanco, azul, verde o rojo según la especie. El látex del Lactarius indigo, una especie americana no comestible, es de un espectacular azul intenso.',
  },
  {
    nombre: 'Falso níscalo', nombreCientifico: 'Lactarius torminosus', familia: 'Russulaceae',
    comestibilidad: 'Tóxica',
    habitat: ['Bosque caducifolio'],
    temporada: ['Otoño'],
    sombrero: 'Rosado-rojizo con zonas concéntricas, 5–15 cm, borde lanoso-peludo',
    laminas: 'Rosadas, no verdean',
    pie: 'Corto, rosado, con hoyuelos',
    olor: 'Afrutado pero acre',
    especiesConfusas: ['Lactarius deliciosus (comestible: borde liso, látex naranja, bajo coníferas)'],
    distribucion: 'Europa, especialmente bajo abedules',
    usosCulinarios: 'TÓXICA. No comestible.',
    aviso: 'TÓXICA. Crece bajo abedules (no pinos), borde del sombrero peloso-lanoso, látex blanco acre. El níscalo comestible crece bajo coníferas y tiene látex naranja.',
    descripcion: 'La confusión más clásica con el níscalo (L. deliciosus). El falso níscalo se distingue por su crecimiento bajo abedules (nunca pinos), el borde peloso de su sombrero y su látex blanco (no naranja). La intoxicación causa gastroenteritis severa pero raramente mortal.',
    curiosidad: 'En Finlandia y los países bálticos, el Lactarius torminosus se consume después de un proceso de fermentación o salazón especial que neutraliza sus toxinas. Esta tradición, transmitida de generación en generación, es extremadamente peligrosa si no se realiza correctamente.',
  },
  {
    nombre: 'Melera', nombreCientifico: 'Armillaria mellea', familia: 'Physalacriaceae',
    comestibilidad: 'Comestible con precaución',
    habitat: ['Bosque caducifolio', 'Bosque mixto'],
    temporada: ['Otoño'],
    sombrero: 'Miel-amarillento con escamas marrones, 3–12 cm, convexo',
    laminas: 'Blancas a crema, a veces con manchas',
    pie: 'Con anillo membranoso, base en grupo',
    olor: 'Agradable, ligeramente ácido',
    especiesConfusas: ['Galerina marginata (mortal: sin anillo membranoso típico)', 'Pholiota spp. (olor desagradable)'],
    distribucion: 'Cosmopolita, parásito y saprotrofo de árboles',
    usosCulinarios: 'Solo bien cocida: cruda causa trastornos. Guisos, estofados, pickles. Poco sola por el sabor algo acre.',
    aviso: 'Cocinar siempre y bien. Confusion mortal posible con Galerina marginata. Solo expertos. Los pies son demasiado fibrosos para comer.',
    descripcion: 'La melera es uno de los hongos más comunes de los bosques europeos. Crece en enormes grupos en la base de árboles o sobre raíces. Es parásita de árboles vivos y puede ser un problema en montes. Comestible bien cocinada pero puede causar intoxicaciones si se consume cruda o poco cocida.',
    curiosidad: 'El organismo vivo más grande del mundo es una Armillaria ostoyae (especie relacionada) en el bosque de Malheur (Oregon, EEUU): su micelio ocupa 9,6 km² de superficie forestal y tiene más de 8.650 años de antigüedad. Los árboles que mata se lo comunica a través de las mismas raíces.',
  },
  {
    nombre: 'Seta imperial', nombreCientifico: 'Tricholoma matsutake', familia: 'Tricholomataceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque de coníferas'],
    temporada: ['Otoño'],
    sombrero: 'Marrón oscuro fibrilado, 8–20 cm, borde involuto',
    laminas: 'Blancas, apretadas, con anillo membranoso',
    pie: 'Robusto, blanco arriba y marrón abajo del anillo',
    olor: 'Muy intenso, canela y especias, único',
    especiesConfusas: ['Tricholoma caligatum (comestible, olor similar)'],
    distribucion: 'Japón, Corea, Escandinavia, Norte de América, España (Sierra de Guadarrama)',
    usosCulinarios: 'Solo en Japón: a la brasa, en sopas dobin-mushi. No suele exportarse para cocinar: se valora crudo.',
    aviso: 'El olor especiado es característico e inconfundible. Poco peligro de confusión.',
    descripcion: 'El hongo más caro del mundo. En Japón, un ejemplar de calidad puede alcanzar 1.000 € en subasta. Su escasez se debe a que no puede cultivarse: vive en simbiosis con pinos centenarios japoneses (Pinus densiflora). La deforestación y el envejecimiento de los pinares han reducido su producción al 1% de los años 1940.',
    curiosidad: 'El matsutake es considerado en Japón un símbolo del otoño y de la autenticidad natural. En 2021, cuando el precio del matsutake japonés superó 2.000€/kg, el matsutake coreano e importado copó el mercado japonés generando un escándalo nacional sobre la autenticidad gastronómica.',
  },
  {
    nombre: 'Seta yesquera', nombreCientifico: 'Fomes fomentarius', familia: 'Polyporaceae',
    comestibilidad: 'No comestible',
    habitat: ['Bosque caducifolio'],
    temporada: ['Todo el año'],
    sombrero: 'Forma de pezuña de caballo, 10–40 cm, marrón-gris con capas concéntricas',
    laminas: 'Sin láminas: poros muy finos en la parte inferior',
    pie: 'Sin pie, sésil en el árbol',
    olor: 'Suave, fúngico',
    especiesConfusas: ['Ganoderma applanatum (similar, también no comestible)'],
    distribucion: 'Europa, Asia, América del Norte, África',
    usosCulinarios: 'No comestible. Usos: medicina tradicional, yesca para fuego, material para bisutería.',
    aviso: 'No tóxica pero no comestible. No confundir con setas comestibles. Crece en troncos vivos o muertos.',
    descripcion: 'La yesquera es un hongo leñoso perenne que crece en los troncos de árboles formando estructuras en forma de pezuña de caballo. Crece año tras año añadiendo capas. No es comestible, pero ha sido fundamental para los humanos durante milenios como material para encender fuego y en medicina tradicional.',
    curiosidad: 'Ötzi, el hombre del hielo (momia de 5.300 años hallada en los Alpes), llevaba consigo un trozo de yesquera (Fomes fomentarius) para hacer fuego. Esto demuestra que el uso de este hongo como yesca se remonta al menos al Neolítico. También se encontraron trozos en contextos arqueológicos del Paleolítico.',
  },
  {
    nombre: 'Lengua de vaca', nombreCientifico: 'Fistulina hepatica', familia: 'Fistulinaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Forma de lengua o hígado, 10–30 cm, rojo-parduzco, superficie babosa',
    laminas: 'Poros individuales tubulares, blancos a crema',
    pie: 'Muy corto, lateral, rojo',
    olor: 'Suave, ligeramente ácido',
    especiesConfusas: ['Difícil de confundir por su aspecto único'],
    distribucion: 'Europa, América del Norte, Australia',
    usosCulinarios: 'Cruda en ensaladas (sabor ácido), cocinada en guisos. Sabor ácido que puede no gustar a todos.',
    aviso: 'Inconfundible. Aspecto de carne cruda y textura que sangra al cortarla. Sin riesgos de confusión.',
    descripcion: 'La "lengua de buey" o "hígado del bosque" es uno de los hongos más extraños de la flora micológica europea. Su aspecto es inquietante: parece un trozo de hígado sangrante adherido al árbol. Al cortarla exuda un jugo rojo. Comestible y singular, crece en robles y castaños viejos.',
    curiosidad: 'La Fistulina hepatica tiene la textura más parecida a la carne de cualquier seta conocida. Su aspecto tan similar a carne animal generó históricamente supersticiones sobre "árboles sangrantes". En la actualidad se usa en cocina vegana como sustituto cárnico de textura y color convincentes.',
  },
  {
    nombre: 'Boleto del diablo', nombreCientifico: 'Rubroboletus satanas', familia: 'Boletaceae',
    comestibilidad: 'Tóxica',
    habitat: ['Bosque caducifolio', 'Bosque mixto'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Gris-blanquecino, 10–30 cm, convexo',
    laminas: 'Sin láminas: poros rojo sangre',
    pie: 'Robusto, rojo con retícula roja, base bulbosa',
    olor: 'Nauseabundo, a cadáver en ejemplares adultos',
    especiesConfusas: ['Boletus edulis (comestible: poros blancos/amarillos, pie con retícula blanca)'],
    distribucion: 'Europa meridional y central',
    usosCulinarios: 'TÓXICA. No comestible.',
    aviso: 'TÓXICA. Sus poros rojo sangre y el azuleado inmediato al corte lo distinguen del boletus comestible. Causa gastroenteritis severa. Los ejemplares adultos huelen mal.',
    descripcion: 'El "boleto de Satanás" es el impostor más peligroso del boletus edulis. Su sombrero grisáceo puede confundirse de lejos, pero sus poros rojos y el pie rojo reticulado son señales claras de peligro. Al cortarlo, la carne azulea instantáneamente. Causa intoxicaciones gastrointestinales severas.',
    curiosidad: 'El Rubroboletus satanas sintetiza bolesatina, una proteína que inhibe la síntesis proteica celular. Es una de las toxinas micológicas más complejas conocidas, con una estructura molecular similar a algunas toxinas bacterianas patógenas. Se investiga su potencial farmacológico.',
  },
  {
    nombre: 'Tremella fuciformis', nombreCientifico: 'Tremella fuciformis', familia: 'Tremellaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Zonas húmedas'],
    temporada: ['Todo el año'],
    sombrero: 'Gelatinoso, translúcido, forma de flor blanca o de oreja de madera, 5–15 cm',
    laminas: 'Sin láminas ni poros: superficie lisa gelatinosa',
    pie: 'Sin pie definido, inserción lateral en la madera',
    olor: 'Casi inodoro',
    especiesConfusas: ['Tremella mesenterica (comestible, amarilla)'],
    distribucion: 'Asia tropical, África, América, cultivada mundialmente',
    usosCulinarios: 'Sopas dulces chinas (dessert soup), postres, cosméticos. Textura gelatinosa muy particular.',
    aviso: 'Muy segura. Inconfundible por su aspecto gelatinoso translúcido.',
    descripcion: 'La "seta de nieve" o "jade blanco del bosque" es fundamental en la medicina tradicional china. Su textura gelatinosa translúcida y su capacidad de absorber agua la hacen versátil en cocina dulce asiática. También se usa en cosméticos por sus polisacáridos hidratantes.',
    curiosidad: 'La tremella contiene tremellasina, un polisacárido que puede absorber hasta 500 veces su peso en agua. Esta propiedad la hace de gran interés para la industria cosmética como sustituto vegetal del ácido hialurónico. Varias marcas de lujo la incluyen ya en sus sérum hidratantes.',
  },
  {
    nombre: 'Hongo ostra rosa', nombreCientifico: 'Pleurotus djamor', familia: 'Pleurotaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Zonas húmedas'],
    temporada: ['Todo el año'],
    sombrero: 'Rosa a salmón, 5–15 cm, en forma de ostra',
    laminas: 'Blancas a rosadas, decurrentes',
    pie: 'Muy corto o ausente, lateral',
    olor: 'Suave, agradable',
    especiesConfusas: ['Otras gírgolas (todas comestibles)'],
    distribucion: 'Trópicos de Asia, África y América; cultivada mundialmente',
    usosCulinarios: 'Salteados, sopas, platos asiáticos. Color decorativo que desaparece al cocinar.',
    aviso: 'Muy segura. El color rosa brillante la hace inconfundible.',
    descripcion: 'La gírgola rosa o "hongo flamingo" es la variedad más llamativa del género Pleurotus. Su color rosa brillante (que desaparece al cocinarse) la hace muy popular en la cocina asiática contemporánea y en la cocina vegana por su atractivo visual. Crece sobre madera muerta tropical.',
    curiosidad: 'El color rosa del Pleurotus djamor se desvanece completamente al calentarse porque los pigmentos carotenoides que lo producen son termolábiles. Los chefs de alta cocina a veces la sirven cruda o semicruda para preservar su color en platos de presentación artística.',
  },
  {
    nombre: 'Hongo cola de pavo', nombreCientifico: 'Trametes versicolor', familia: 'Polyporaceae',
    comestibilidad: 'No comestible',
    habitat: ['Bosque caducifolio', 'Bosque mixto', 'Zonas urbanas'],
    temporada: ['Todo el año'],
    sombrero: 'Semicircular en capas, 3–10 cm, colores concéntricos variables (marrón, gris, naranja, verde)',
    laminas: 'Poros muy finos en la parte inferior',
    pie: 'Sin pie, sésil en madera',
    olor: 'Casi inodoro',
    especiesConfusas: ['Trametes hirsuta (similar, menos colorida)'],
    distribucion: 'Cosmopolita, uno de los hongos más comunes del mundo',
    usosCulinarios: 'No comestible (textura leñosa). Uso medicinal: extracto PSK/PSP aprobado en Japón y China como coadyuvante oncológico.',
    aviso: 'No tóxica pero incomestible. Muy fácil de identificar. Uso para medicina, no cocina.',
    descripcion: 'El hongo más investigado del mundo en oncología. Sus polisacáridos PSK (Krestin en Japón) y PSP se usan como inmunomoduladores en tratamientos de cáncer en Asia. Es uno de los hongos más comunes del planeta, visible en cualquier bosque sobre madera muerta en todas las estaciones.',
    curiosidad: 'El Trametes versicolor fue el primer hongo aprobado farmacológicamente en el mundo: en 1977, Japón aprobó el extracto PSK (Krestin) como coadyuvante en quimioterapia. Desde entonces se han realizado más de 400 estudios clínicos sobre sus propiedades inmunomoduladoras.',
  },
  {
    nombre: 'Rúsula verdadera', nombreCientifico: 'Russula virescens', familia: 'Russulaceae',
    comestibilidad: 'Comestible',
    habitat: ['Bosque caducifolio', 'Bosque mixto'],
    temporada: ['Verano', 'Otoño'],
    sombrero: 'Verde grisáceo craquelado, 5–12 cm, cutícula que se desprende en parches',
    laminas: 'Blancas, apretadas, frágiles',
    pie: 'Blanco, rígido, frágil (característica de las rúsulas)',
    olor: 'Agradable, neutro',
    especiesConfusas: ['Amanita phalloides (mortal: verde pero no craquelado, con anillo y volva)'],
    distribucion: 'Europa, zona templada',
    usosCulinarios: 'Salteadas, en guisos. La mejor rúsula comestible. Muy apreciada en España e Italia.',
    aviso: 'CRÍTICO: verificar ausencia de anillo y volva (que tendrían las amanitas tóxicas verdes). La cutícula craquelada en parches es diagnóstica.',
    descripcion: 'La rúsula verde o "rúsula de los quesos" es una de las setas de verano más apreciadas. Su sombrero verde craquelado en parches irregulares (como un mosaico) es su característica más reconocible. Pertenece al género de los hongos más frágiles: sus láminas se rompen al más mínimo contacto.',
    curiosidad: 'Todas las Russula y Lactarius son micorrícicas: no pueden cultivarse en laboratorio porque necesitan las raíces de árboles específicos para desarrollarse. Esta dependencia simbiótica explica por qué nunca encontramos rúsulas cultivadas en supermercados.',
  },
  {
    nombre: 'Seta de pino', nombreCientifico: 'Suillus luteus', familia: 'Suillaceae',
    comestibilidad: 'Comestible con precaución',
    habitat: ['Bosque de coníferas'],
    temporada: ['Otoño'],
    sombrero: 'Marrón castaño viscoso-baboso, 5–12 cm',
    laminas: 'Sin láminas: poros amarillos',
    pie: 'Amarillo con anillo membranoso que delimita zona granulosa oscura superior',
    olor: 'Agradable',
    especiesConfusas: ['Suillus granulatus (comestible, similar sin anillo)'],
    distribucion: 'Europa, asociada exclusivamente a pinos',
    usosCulinarios: 'Quitar la cutícula viscosa antes de cocinar. Guisos, salteados. Puede ser algo indigesta en grandes cantidades.',
    aviso: 'Quitar siempre la cutícula viscosa del sombrero que puede causar trastornos digestivos. Consumir con moderación.',
    descripcion: 'Uno de los boletos más comunes bajo pinos. Su sombrero viscoso (baboso) y sus poros amarillos la identifican fácilmente. Es comestible pero de calidad mediocre y puede causar digestiones pesadas si no se pela la cutícula y se consume en exceso. Muy abundante en bosques de pinos en otoño.',
    curiosidad: 'Los Suillus son tan dependientes de los pinos que se usan en repoblaciones forestales: inoculando el suelo con su micelio se mejora enormemente la supervivencia de los pinos plantados. Esta relación simbiótica (micorrizas) es esencial para el desarrollo de los pinos jóvenes.',
  },
  {
    nombre: 'Hygrocybe coccinea', nombreCientifico: 'Hygrocybe coccinea', familia: 'Hygrophoraceae',
    comestibilidad: 'Comestible',
    habitat: ['Prados y pastos'],
    temporada: ['Otoño'],
    sombrero: 'Rojo escarlata, 2–6 cm, convexo, superficie húmeda brillante',
    laminas: 'Rojas, pocas y gruesas, algo separadas',
    pie: 'Rojo, hueco, brillante',
    olor: 'Suave',
    especiesConfusas: ['Hygrocybe punicea (comestible, más grande)'],
    distribucion: 'Europa, prados antiguos sin fertilizar',
    usosCulinarios: 'Comestible pero de poco interés culinario por su pequeño tamaño. Valor ornamental mayor.',
    aviso: 'Poco peligro de confusión. Su valor principal es como indicador ecológico, no culinario.',
    descripcion: 'Las higrocybes son las joyas de los prados europeos: pequeñas, brillantes y de colores intensos (rojo, naranja, amarillo, verde). La H. coccinea destaca por su rojo escarlata brillante. Son indicadoras de prados antiguos sin fertilizar, por lo que su presencia señala ecosistemas de alto valor ecológico.',
    curiosidad: 'Los prados de higrocybes (waxcap grasslands) son ecosistemas protegidos en Europa. Países Bajos, Reino Unido y los países escandinavos los catalogan como "prados de alta diversidad fúngica". La presencia de higrocybes es señal de que el prado no ha sido fertilizado ni removido durante al menos 50 años.',
  },
];

// ============================================================
// HELPERS
// ============================================================

const COMESTIBILIDADES: (Comestibilidad | 'Todas')[] = [
  'Todas', 'Comestible', 'Comestible con precaución', 'No comestible', 'Tóxica', 'Mortal',
];

const HABITATS: (Habitat | 'Todos')[] = [
  'Todos', 'Bosque caducifolio', 'Bosque de coníferas', 'Bosque mixto', 'Prados y pastos', 'Zonas húmedas', 'Zonas urbanas',
];

function badgeClass(comestibilidad: Comestibilidad): string {
  switch (comestibilidad) {
    case 'Comestible': return styles.comestible;
    case 'Comestible con precaución': return styles.comestiblePrecaucion;
    case 'No comestible': return styles.noComestible;
    case 'Tóxica': return styles.toxica;
    case 'Mortal': return styles.mortal;
  }
}

function avisoClass(comestibilidad: Comestibilidad): string {
  switch (comestibilidad) {
    case 'Comestible': return styles.avisoComestible;
    case 'Comestible con precaución': return styles.avisoComestiblePrecaucion;
    case 'No comestible': return styles.avisoNoComestible;
    case 'Tóxica': return styles.avisoToxica;
    case 'Mortal': return styles.avisoMortal;
  }
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function GuiaSetasPage() {
  const [comestibilidad, setComestibilidad] = useState<Comestibilidad | 'Todas'>('Todas');
  const [habitat, setHabitat] = useState<Habitat | 'Todos'>('Todos');
  const [busqueda, setBusqueda] = useState('');

  const setasFiltradas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return SETAS.filter((s) => {
      const matchC = comestibilidad === 'Todas' || s.comestibilidad === comestibilidad;
      const matchH = habitat === 'Todos' || s.habitat.includes(habitat as Habitat);
      const matchB = !q || (
        s.nombre.toLowerCase().includes(q) ||
        s.nombreCientifico.toLowerCase().includes(q) ||
        s.familia.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q) ||
        s.habitat.some((h) => h.toLowerCase().includes(q)) ||
        s.temporada.some((t) => t.toLowerCase().includes(q))
      );
      return matchC && matchH && matchB;
    });
  }, [comestibilidad, habitat, busqueda]);

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Guía de Setas</h1>
          <p className={styles.subtitle}>
            40 setas silvestres con ficha completa: comestibilidad, hábitat, temporada, morfología, especies confusas y avisos de seguridad.
          </p>
          <div className={styles.heroStats}>
            <span className={styles.stat}><strong>40</strong> setas</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>5</strong> niveles comestibilidad</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.stat}><strong>6</strong> hábitats</span>
          </div>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="medical"
          severity="high"
          collapsible={false}
        />

        {/* Controles */}
        <div className={styles.controlsSection}>
          {/* Buscador */}
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Buscar por nombre, familia, hábitat o temporada…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar seta"
            />
            {busqueda && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro comestibilidad */}
          <div className={styles.filtrosRow} role="group" aria-label="Filtrar por comestibilidad">
            {COMESTIBILIDADES.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.filtroBtn} ${comestibilidad === c ? styles.filtroActivo : ''}`}
                onClick={() => setComestibilidad(c)}
                aria-pressed={comestibilidad === c}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Filtro hábitat */}
          <div className={styles.filtrosRow} role="group" aria-label="Filtrar por hábitat">
            {HABITATS.map((h) => (
              <button
                key={h}
                type="button"
                className={`${styles.filtroBtn} ${habitat === h ? styles.filtroActivo : ''}`}
                onClick={() => setHabitat(h)}
                aria-pressed={habitat === h}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Contador */}
        <div className={styles.resultadosHeader} role="status" aria-live="polite">
          {setasFiltradas.length === 0 ? (
            <p className={styles.sinResultados}>No hay resultados para los filtros seleccionados.</p>
          ) : (
            <p className={styles.contadorResultados}>
              {setasFiltradas.length === SETAS.length
                ? `Mostrando las ${SETAS.length} setas`
                : `${setasFiltradas.length} seta${setasFiltradas.length !== 1 ? 's' : ''} encontrada${setasFiltradas.length !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Grid de tarjetas */}
        <div className={styles.setasGrid}>
          {setasFiltradas.map((seta) => (
            <article key={seta.nombreCientifico} className={styles.setaCard}>

              {/* Header */}
              <div className={styles.cardHeader}>
                <div className={styles.cardNombres}>
                  <h2 className={styles.nombreComun}>{seta.nombre}</h2>
                  <p className={styles.nombreCientifico}>{seta.nombreCientifico}</p>
                </div>
                <span className={`${styles.comestibilidadBadge} ${badgeClass(seta.comestibilidad)}`}>
                  {seta.comestibilidad}
                </span>
              </div>

              {/* Familia */}
              <span className={styles.familiaTag}>{seta.familia}</span>

              {/* Descripción */}
              <p className={styles.descripcionCorta}>{seta.descripcion}</p>

              {/* Meta grid: morfología */}
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>Sombrero</div>
                  <div className={styles.metaValor}>{seta.sombrero}</div>
                </div>
                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>Láminas</div>
                  <div className={styles.metaValor}>{seta.laminas}</div>
                </div>
                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>Pie</div>
                  <div className={styles.metaValor}>{seta.pie}</div>
                </div>
                <div className={styles.metaItem}>
                  <div className={styles.metaLabel}>Olor</div>
                  <div className={styles.metaValor}>{seta.olor}</div>
                </div>
              </div>

              {/* Temporada */}
              <div>
                <div className={styles.metaLabel}>Temporada</div>
                <div className={styles.chipsRow}>
                  {seta.temporada.map((t) => (
                    <span key={t} className={styles.chip}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Hábitat */}
              <div>
                <div className={styles.metaLabel}>Hábitat</div>
                <div className={styles.chipsRow}>
                  {seta.habitat.map((h) => (
                    <span key={h} className={styles.chip}>{h}</span>
                  ))}
                </div>
              </div>

              {/* Distribución */}
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Distribución</div>
                <div className={styles.metaValor}>{seta.distribucion}</div>
              </div>

              {/* Usos culinarios */}
              <div className={styles.metaItem}>
                <div className={styles.metaLabel}>Usos culinarios</div>
                <div className={styles.metaValor}>{seta.usosCulinarios}</div>
              </div>

              {/* Especies confusas */}
              {seta.especiesConfusas.length > 0 && seta.especiesConfusas[0] !== 'Difícil de confundir por su forma única' && seta.especiesConfusas[0] !== 'Otras especies de Pleurotus (todos comestibles)' && seta.especiesConfusas[0] !== 'Pocas: bien diferenciado por su sustrato (madera de caducifolias asiáticas)' && (
                <div className={styles.confusasSection}>
                  <div className={styles.confusasLabel}>Especies confusas</div>
                  {seta.especiesConfusas.map((e) => (
                    <div key={e} className={styles.confusaItem}>{e}</div>
                  ))}
                </div>
              )}

              {/* Aviso */}
              <div className={`${styles.avisoBox} ${avisoClass(seta.comestibilidad)}`}>
                {seta.aviso}
              </div>

              {/* Curiosidad */}
              <div className={styles.curiosidadBox}>
                <span className={styles.curiosidadLabel}>Curiosidad: </span>
                {seta.curiosidad}
              </div>

            </article>
          ))}
        </div>

        {/* EducationalSection — patrón v2.0 */}
        <EducationalSection
          title="Micología: identificar, respetar y disfrutar las setas"
          subtitle="De la recolección segura a la cocina: todo lo que necesitas saber"
        >

          {/* 1. Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>Tipos de comestibilidad: qué significa cada categoría</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Significado</th>
                    <th>Ejemplos</th>
                    <th>Riesgo</th>
                    <th>Acción recomendada</th>
                    <th>Toxinas típicas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Comestible</strong></td>
                    <td>Segura para el consumo general correctamente identificada</td>
                    <td>Boletus edulis, Rebozuelo, Níscalo</td>
                    <td>Bajo (si identificación correcta)</td>
                    <td>Identificar con seguridad, cocinar bien</td>
                    <td>Ninguna</td>
                  </tr>
                  <tr>
                    <td><strong>Comestible con precaución</strong></td>
                    <td>Comestible bajo condiciones específicas (cocción, preparación)</td>
                    <td>Colmenilla, Pie azul, Melera</td>
                    <td>Medio (si se incumple la preparación)</td>
                    <td>Cocinar siempre bien, seguir instrucciones específicas</td>
                    <td>Hemolisinas, sustancias indigestas en crudo</td>
                  </tr>
                  <tr>
                    <td><strong>No comestible</strong></td>
                    <td>No tóxica pero sin valor gastronómico (textura leñosa, amarga)</td>
                    <td>Yesquera, Cola de pavo</td>
                    <td>Bajo (no tóxica)</td>
                    <td>No consumir, pero sin peligro al manipular</td>
                    <td>Ninguna</td>
                  </tr>
                  <tr>
                    <td><strong>Tóxica</strong></td>
                    <td>Produce intoxicación de gravedad variable, raramente mortal</td>
                    <td>Matamoscas, Seta de olivo, Boleto del diablo</td>
                    <td>Alto</td>
                    <td>No consumir en ningún caso, urgencias si ingesta</td>
                    <td>Muscimol, ácido iboténico, iludinina, bolesatina</td>
                  </tr>
                  <tr>
                    <td><strong>Mortal</strong></td>
                    <td>Media seta puede causar la muerte. Sin antídoto.</td>
                    <td>Falsa oronja (A. phalloides)</td>
                    <td>Extremo</td>
                    <td>Urgencias inmediatas si ingesta; sin antídoto</td>
                    <td>Amatoxinas (alfa-amanitina)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 2. Escenarios */}
          <section className={styles.guideSection}>
            <h2>Situaciones habituales del recolector</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h4>Primera salida al bosque</h4>
                <p>Solo recolectar especies inconfundibles: boletus edulis, rebozuelo, gírgola, trompeta de la muerte. No recoger ninguna especie que no estés absolutamente seguro de identificar.</p>
                <div className={styles.escenarioExample}>Regla: si tienes alguna duda, no la recojas.</div>
              </div>
              <div className={styles.escenarioCard}>
                <h4>Encontrar una seta blanca en el campo</h4>
                <p>Las setas blancas son las más peligrosas: incluyen la Amanita phalloides (joven) y el champiñón xanthodermus. Verificar siempre las láminas (deben ser rosadas), la ausencia de volva y si amarillea al corte.</p>
                <div className={styles.escenarioExample}>Nunca asumir que una seta blanca en campo es un champiñón.</div>
              </div>
              <div className={styles.escenarioCard}>
                <h4>Seta naranja bajo pinos en otoño</h4>
                <p>Probablemente un níscalo (L. deliciosus). Verificar: látex naranja al cortar una lámina, que verde un poco al aire, pie con hoyuelos anaranjados y crecimiento estrictamente bajo pinos. El falso níscalo crece bajo abedules.</p>
                <div className={styles.escenarioExample}>El hábitat (árbol asociado) es clave en lactarios.</div>
              </div>
              <div className={styles.escenarioCard}>
                <h4>Intoxicación sospechosa</h4>
                <p>Si aparecen síntomas 6-24 horas después de consumir setas: urgencias inmediatamente. Conservar la seta o fotos para identificación. Los síntomas tardíos indican amatoxinas (Amanita phalloides) — potencialmente mortales.</p>
                <div className={styles.escenarioExample}>Síntomas tardíos = urgencias sin demora.</div>
              </div>
            </div>
          </section>

          {/* 3. FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes sobre setas y seguridad</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <h4>¿Hervir las setas tóxicas las hace seguras?</h4>
                <p>
                  No en todos los casos. Las amatoxinas de la Amanita phalloides son completamente termoestables: ni hervir ni freír las destruye. Esta es la principal causa histórica de muertes por setas: las víctimas creían haber "cocinado bien" el hongo.
                </p>
                <p>
                  Algunas toxinas como las hemolisinas de la colmenilla cruda sí se destruyen con el calor. Pero nunca asumir que cocinar elimina el peligro sin verificarlo para cada especie.
                </p>
                <p className={styles.faqTip}>
                  Regla: la cocción no compensa la identificación errónea.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Es verdad que la plata se ennegrece con setas tóxicas?</h4>
                <p>
                  Mito completamente falso. La plata no reacciona con ninguna toxina micológica. Esta leyenda ha causado muertes históricas: personas que creyeron que sus cubiertos de plata no reaccionaban y concluyeron equivocadamente que la seta era segura.
                </p>
                <p className={styles.faqTip}>
                  El único método fiable de identificación es el morfológico + botánico.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cuándo debo ir a urgencias si he comido setas?</h4>
                <p>
                  Inmediatamente si: síntomas aparecen después de 6 horas (indica amatoxinas), hay insuficiencia hepática o renal, o si la persona es niño o anciano. Si los síntomas aparecen en las primeras 2 horas, suelen ser menos graves (gastroenteritis), pero igualmente buscar atención médica y conservar la seta para identificación.
                </p>
                <p className={styles.faqTip}>
                  Guardar siempre una muestra de la seta o fotografía detallada.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Es ilegal recolectar setas en España?</h4>
                <p>
                  Depende de la comunidad autónoma y del monte. En montes privados se necesita permiso del propietario. En montes públicos, muchas CCAA permiten recolección para autoconsumo con límites de cantidad (generalmente 3–10 kg/día/persona). Andalucía, Cataluña y Castilla y León tienen normativas específicas. Consultar la normativa autonómica antes de salir.
                </p>
                <p className={styles.faqTip}>
                  En parques nacionales está prohibida la recolección en toda España.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h4>¿Cómo conservar las setas recolectadas?</h4>
                <p>
                  Frescos: máximo 3-4 días en nevera sin plástico (usar papel). Secos: las más adecuadas son boletus, rebozuelo, trompeta de la muerte y shiitake. Congelados: blanquear 1-2 minutos antes de congelar (excepto rebozuelo que puede congelarse en fresco). Los níscaros se conservan mal: consumir el mismo día.
                </p>
                <p className={styles.faqTip}>
                  Las setas delicuescentes (coprinus) deben consumirse en horas.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Pasos para recolectar de forma segura */}
          <section className={styles.guideSection}>
            <h2>Cómo recolectar setas de forma segura: 5 pasos</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h4>Estudia antes de salir</h4>
                  <p>Aprende a identificar 5-10 especies con seguridad absoluta antes de recolectar. Usa guías con fotografías de todas las fases del desarrollo (joven, maduro, viejo). La identificación errónea del estado joven es la causa más frecuente de accidentes.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h4>Recoge la seta entera (con la base)</h4>
                  <p>La volva (membrana en la base) es característica diagnóstica clave para las amanitas. Recolectar solo el sombrero puede impedir la identificación. Usa una cesta de mimbre para que las esporas se dispersen durante el recorrido.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h4>Verifica en casa con guía antes de cocinar</h4>
                  <p>No cocines ninguna seta hasta confirmar la identificación en casa con una guía fiable. Separa físicamente las setas recolectadas para identificar. Una sola seta tóxica mezclada con otras puede intoxicar a toda la familia.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h4>Cocina siempre bien</h4>
                  <p>Muchas setas comestibles son tóxicas en crudo (colmenilla, pie azul, melera) o indigestas. Cocinar a fuego alto (no simplemente calentar) y durante suficiente tiempo. El coprinus solo es comestible muy joven y debe consumirse el mismo día.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <h4>Guarda una muestra y anota dónde la encontraste</h4>
                  <p>Conserva una muestra de cada seta en papel de periódico en la nevera hasta 48 horas después del consumo. Si hay intoxicación, la muestra permite identificar la especie y orientar el tratamiento médico. Los árboles cercanos son datos diagnósticos cruciales.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Tips */}
          <section className={styles.guideSection}>
            <h2>Consejos del recolector experto</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌳</span>
                <h4>Aprende los árboles del bosque</h4>
                <p>Muchas setas son micorrícicas (asociadas a un árbol específico). Saber si estás bajo pinos, robles, abedules o encinas es información diagnóstica crucial.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📷</span>
                <h4>Fotografía antes de recolectar</h4>
                <p>Fotografia la seta en su hábitat natural, la base con la volva, las láminas por debajo y el corte del pie. Estas imágenes ayudan en identificaciones posteriores y en urgencias.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📚</span>
                <h4>Únete a una sociedad micológica</h4>
                <p>Las sociedades micológicas locales organizan salidas con expertos. Es la manera más segura de aprender a identificar setas en campo con orientación directa.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌧️</span>
                <h4>Temperatura y humedad son la clave</h4>
                <p>Las mejores condiciones: lluvia moderada seguida de temperaturas suaves (15-20 °C) y noches frescas. En otoño después de las primeras lluvias tras el verano seco son los mejores días.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🍽️</span>
                <h4>Prueba una especie nueva en poca cantidad</h4>
                <p>Al probar una seta comestible por primera vez, consume poca cantidad (50-100 g) y espera 24 horas antes de consumir más. Algunas personas tienen sensibilidades individuales a setas perfectamente comestibles.</p>
              </div>
            </div>
          </section>

          {/* 6. Warning Box (v2.0 obligatorio) */}
          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <h3>Errores que pueden ser mortales en la recolección de setas</h3>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Asumir que "si no sabe mal no es tóxica":</strong> La Amanita phalloides tiene sabor agradable y olor dulzón. No existe ninguna característica organoléptica (color, olor, sabor, tacto) que garantice la seguridad de una seta desconocida.
                </li>
                <li>
                  <strong>Confundir champiñones silvestres blancos con champiñones de cultivo:</strong> El champiñón silvestre tiene láminas rosadas (nunca blancas). Una seta blanca con láminas blancas en el campo puede ser Amanita phalloides joven. Verificar siempre las láminas y la ausencia de volva.
                </li>
                <li>
                  <strong>Recolectar setas en estado de "huevo":</strong> Muchas setas en estado joven (forma de bola) son imposibles de identificar sin abrirlas. El interior debe ser naranja o amarillo (oronja comestible) y nunca blanco-verdoso (amanita tóxica).
                </li>
                <li>
                  <strong>Ignorar los síntomas tardíos:</strong> Los síntomas de intoxicación por amatoxinas aparecen entre 6 y 24 horas después del consumo, cuando el daño hepático ya es significativo. Esperar a que "pase" es un error potencialmente mortal. Ante cualquier síntoma digestivo tras consumir setas silvestres: urgencias.
                </li>
                <li>
                  <strong>Mezclar setas de distintas especies en la recolección:</strong> Una sola seta tóxica mezclada con setas comestibles puede contaminar toda la cesta. Guardar cada especie por separado durante la identificación.
                </li>
                <li>
                  <strong>Dar setas silvestres a niños y ancianos sin precaución extra:</strong> Niños y ancianos son más vulnerables a las toxinas micológicas. La misma dosis que un adulto tolera puede ser mortal para un niño. Los niños no deben consumir setas de recolección sin supervisión médica especializada.
                </li>
              </ul>
            </div>
          </section>

        </EducationalSection>

        <RelatedApps apps={getRelatedApps('guia-setas')} />
        <ShareCard appName="guia-setas" />
        <Footer appName="guia-setas" />
    </div>
  );
}
