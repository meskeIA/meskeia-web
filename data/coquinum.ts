/**
 * Catálogo del portal Coquinum (coquinum.com) — fuente única de verdad.
 *
 * Lo consumen:
 * - `proxy.ts` (host-rewrite): qué slugs son apps del catálogo (passthrough) y
 *   qué rutas son páginas de portal (reescritura a /coquinum/*).
 * - `MeskeiaLogo` (breadcrumb): a qué categoría pertenece la app actual cuando se
 *   sirve bajo coquinum.com.
 * - `DescubreVertical`: banda meskeIA → Coquinum para apps gastro vistas en
 *   meskeia.com.
 * - `app/coquinum/[categoria]/page.tsx`: las tarjetas de cada parrilla.
 * - `CoquinumMasDeCategoria`: el bloque «Más de [categoría]» al pie de cada app.
 *
 * Para añadir una app a una categoría: una entrada en COQUINUM_APPS, nada más.
 * `npm run check:verticales` (y el propio build) avisan si algo queda descosido.
 *
 * Curaduría Fase 1 (2026-06-26): 5 categorías pobladas con apps existentes (36).
 * Los bloques roadmap (cocción/temperatura, conservación, food cost) se añadieron
 * después; ver _private/GASTRONOMIA.md.
 *
 * CONSOLIDACIÓN 9 → 6 (2026-08-09). El portal había llegado a nueve categorías para
 * 84 apps —Stemum tiene cinco disciplinas para 136— y tres estaban casi vacías
 * (costes 2 apps, cultura 4, conservación 6 con la mitad sin uso). Se notaba en el
 * único sitio donde se puede notar: de cada visita a la home del portal salían 0,45
 * visitas a una página de sección, contra 1,88 en Stemum. Quien pulsaba una de esas
 * categorías aterrizaba en una parrilla que no le daba nada y se iba. Las tres se
 * absorbieron en las categorías con las que ya compartían intención; ninguna app se
 * retiró y los tres slugs retirados mantienen 301 (ver COQUINUM_CATEGORIAS_RETIRADAS).
 */

// Categorías del portal: slug de ruta → etiqueta visible.
export const COQUINUM_CATEGORIAS: Record<string, string> = {
  'panaderia-reposteria': 'Panadería y repostería',
  'cocina-recetas': 'Cocina y recetas',
  'medidas-conversiones': 'Medidas y conversiones',
  'coccion': 'Cocción y conservación',
  'ingredientes-despensa': 'Ingredientes y despensa',
  'bebidas': 'Bebidas',
};

/**
 * Icono y descripción con que cada categoría se presenta en la home del portal.
 *
 * Vive aquí, y no en `app/coquinum/page.tsx`, porque allí era una lista escrita a
 * mano: su comentario seguía diciendo «las 5 categorías pobladas» cuando ya había
 * nueve, y retirar una categoría habría dejado su tarjeta enlazando a un 404 sin que
 * nada avisara. Es el mismo fallo que en julio de 2026 obligó a derivar las parrillas
 * del catálogo en Stemum y Coquinum. Al derivarse de aquí, una categoría nueva sin
 * ficha rompe `npm run check:verticales`, que es cuando conviene enterarse.
 */
export interface CoquinumCategoriaInfo {
  /** Emoji decorativo de la tarjeta (se pinta con aria-hidden). */
  icon: string;
  /** Qué reúne la sección, en una frase. */
  desc: string;
}

export const COQUINUM_CATEGORIA_INFO: Record<string, CoquinumCategoriaInfo> = {
  'panaderia-reposteria': {
    icon: '🍞',
    desc: 'Porcentaje del panadero, hidratación de masa, masa madre, temperatura de masa, ganache, gelatina y punto de azúcar.',
  },
  'cocina-recetas': {
    icon: '🍽️',
    desc: 'Escala recetas por raciones, planifica el menú semanal, calcula cantidades para un evento y pon precio a tus platos con escandallo y merma.',
  },
  'medidas-conversiones': {
    icon: '🥄',
    desc: 'Pasa de tazas y cucharadas a gramos con el peso real de cada ingrediente. Precisión para recetas que vienen en tazas.',
  },
  coccion: {
    icon: '🌡️',
    desc: 'El punto y la temperatura interna segura, los tiempos de cocción y asado, y el otro lado del termómetro: cuánto dura cada alimento, qué se puede congelar y cómo hacer conservas, encurtidos y fermentados.',
  },
  'ingredientes-despensa': {
    icon: '🥩',
    desc: 'Guías para elegir y usar aceite, carne, especias, quesos, setas, arroces, pastas y vinagres, y de dónde viene cada alimento: el mapa de las especias, su viaje por el mundo y su huella.',
  },
  bebidas: {
    icon: '🍷',
    desc: 'Café, té e infusiones, coctelería, cerveza y vino, con selectores para acertar con la copa.',
  },
};

/**
 * Categorías retiradas en la consolidación de 2026-08-09 → categoría que las absorbió.
 *
 * Las consume `proxy.ts` para responder 301 bajo coquinum.com. No se borran de aquí
 * aunque el tráfico sea pequeño: `/coccion/` y `/cultura-gastronomica/` tenían 23 y 18
 * impresiones en Google en 90 días, y una URL anunciada en el sitemap que pasa a
 * devolver 404 es exactamente el fallo silencioso que ya nos costó tres 404 internos
 * en julio de 2026.
 */
export const COQUINUM_CATEGORIAS_RETIRADAS: Record<string, string> = {
  'conservacion': 'coccion',
  'costes-cocina': 'cocina-recetas',
  'cultura-gastronomica': 'ingredientes-despensa',
};

/**
 * CATÁLOGO DE APPS — fuente única, también de las parrillas y del pie.
 *
 * Cada entrada es a la vez la pertenencia a categoría (breadcrumb, proxy,
 * contadores), la tarjeta que pinta `app/coquinum/[categoria]/page.tsx` y el
 * nombre con que la app aparece en el bloque «Más de [categoría]». Van juntas a
 * propósito: mientras fueron tres listas, una app podía llamarse e ilustrarse de
 * dos formas distintas dentro del mismo portal (pasaba en 21 títulos y 17 iconos
 * hasta el 28/07/2026), o quedar registrada sin tarjeta que la enlazase.
 *
 * Las apps viven en meskeIA y se sirven bajo coquinum.com en passthrough.
 * El orden dentro de cada categoría es el orden de su parrilla.
 */
export type CoquinumApp = {
  slug: string;
  /** Emoji decorativo de la tarjeta (se pinta con aria-hidden). */
  icon: string;
  /** Título con el que la app se presenta en el portal, parrilla y pie. */
  titulo: string;
  /** Qué resuelve, en 1-2 frases. */
  desc: string;
  /** Slug de categoría (clave de COQUINUM_CATEGORIAS). */
  categoria: string;
};

export const COQUINUM_APPS: CoquinumApp[] = [
  // Panadería y repostería (el foso técnico)
  {
    slug: 'calculadora-porcentaje-panadero',
    icon: '🥖',
    titulo: 'Porcentaje del panadero',
    desc: 'Expresa cada ingrediente como porcentaje de la harina para escalar fórmulas de pan sin perder las proporciones.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-hidratacion-pan',
    icon: '💧',
    titulo: 'Hidratación de la masa',
    desc: 'Calcula el agua según el porcentaje de hidratación que buscas, o averigua la hidratación de una masa ya hecha.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-masa-madre',
    icon: '🫙',
    titulo: 'Masa madre',
    desc: 'Sustituye levadura comercial por masa madre ajustando harina y agua del refresco para que cuadre la fórmula.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-temperatura-masa',
    icon: '🌡️',
    titulo: 'Temperatura del agua',
    desc: 'Halla la temperatura del agua de amasado para llegar a la temperatura final de masa que necesita la fermentación.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'fermentacion-temperatura',
    icon: '⏳',
    titulo: 'Fermentación por temperatura',
    desc: 'Calcula cuánto tarda el levado a la temperatura real de tu masa: la levadura va más rápido en verano y más lento en invierno.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-masa-pizza',
    icon: '🍕',
    titulo: 'Masa de pizza',
    desc: 'Harina, agua, sal, levadura y aceite en gramos para tus bolas, según el estilo: napolitana, romana, americana o focaccia.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-almibar',
    icon: '🍯',
    titulo: 'Almíbar',
    desc: 'Azúcar y agua según el uso —emborrachar, sorbetes, cócteles— con el °Brix resultante.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-merengue',
    icon: '🍥',
    titulo: 'Merengue',
    desc: 'Claras y azúcar para merengue francés, suizo o italiano, con la proporción 1:2.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-crema-pastelera',
    icon: '🍮',
    titulo: 'Crema pastelera',
    desc: 'Yemas, azúcar y maicena según la leche, para crema pastelera, ligera o inglesa.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-macarons',
    icon: '🌈',
    titulo: 'Macarons',
    desc: 'Almendra, azúcar glas, granulado y claras por el método francés (tant pour tant).',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-royal-icing',
    icon: '🎨',
    titulo: 'Glaseado real',
    desc: 'Azúcar glas y claras para tu glasa según la consistencia: contorno, media o relleno.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-ganache',
    icon: '🍫',
    titulo: 'Ganache',
    desc: 'Ratios de chocolate y nata según el uso —cobertura, relleno, trufa o batida— y el tipo de chocolate.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-gelatina',
    icon: '🍮',
    titulo: 'Gelatina',
    desc: 'Convierte entre hojas, polvo y otros gelificantes y ajusta la dosis al volumen y la firmeza que quieres.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'calculadora-puntos-azucar',
    icon: '🍬',
    titulo: 'Puntos del azúcar',
    desc: 'Temperaturas de cada punto del almíbar —hebra, bola, caramelo— para clavar merengues, confituras y dulces.',
    categoria: 'panaderia-reposteria',
  },
  {
    slug: 'guia-tipos-pan',
    icon: '🍞',
    titulo: 'Tipos de pan',
    desc: 'Guía de panes del mundo por masa, miga y corteza para entender qué los diferencia y cuándo usar cada uno.',
    categoria: 'panaderia-reposteria',
  },
  // Cocina y recetas (calculadoras generales + planificación)
  {
    slug: 'calculadora-cocina',
    icon: '⚖️',
    titulo: 'Conversor de cocina',
    desc: 'Pasa entre gramos, mililitros, tazas y cucharadas, y entre °C y °F, para seguir cualquier receta sin liarte con las medidas.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'escalador-recetas',
    icon: '🍽️',
    titulo: 'Escalador de recetas',
    desc: 'Ajusta las cantidades de una receta al número de raciones que necesitas, manteniendo las proporciones.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'planificador-menu',
    icon: '🗓️',
    titulo: 'Planificador de menú',
    desc: 'Organiza las comidas de la semana de forma equilibrada y variada para llegar con todo previsto a la compra.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'selector-dieta',
    icon: '🥗',
    titulo: 'Selector de dieta',
    desc: 'Compara patrones de alimentación según tus objetivos y preferencias para orientarte sobre cuál encaja contigo.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'cantidades-evento',
    icon: '🎉',
    titulo: 'Cantidades para un evento',
    desc: 'Cuánta comida y bebida preparar por invitado según el tipo de evento: aperitivo, comida sentada o barbacoa.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'asado-personas',
    icon: '🍖',
    titulo: 'Carne para un asado',
    desc: 'Cuánta carne comprar para tu asado o barbacoa según las personas y el apetito, con desglose por tipo.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'alergenos-alimentarios',
    icon: '🥜',
    titulo: 'Los 14 alérgenos alimentarios',
    desc: 'Los alérgenos de declaración obligatoria en la UE, con ejemplos y dónde se esconden en los platos. Con buscador.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'glosario-tecnicas-cocina',
    icon: '📖',
    titulo: 'Glosario de técnicas de cocina',
    desc: 'Qué significan blanquear, pochar, bresar, confitar o desglasar, agrupados por tipo de cocción. Con buscador.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'tipos-corte-cocina',
    icon: '🔪',
    titulo: 'Tipos de corte en cocina',
    desc: 'Brunoise, juliana, mirepoix, bastón o chiffonade: qué mide cada corte y para qué se usa. Con buscador.',
    categoria: 'cocina-recetas',
  },
  // Medidas y conversiones (la cuña LATAM: el foso técnico de precisión)
  {
    slug: 'conversor-tazas-gramos',
    icon: '🥄',
    titulo: 'Conversor de tazas a gramos',
    desc: 'Pasa de tazas, cucharadas y cucharaditas a gramos con el peso real de cada ingrediente: la harina no pesa lo mismo que el azúcar ni que los líquidos.',
    categoria: 'medidas-conversiones',
  },
  {
    slug: 'ajuste-recetas-altitud',
    icon: '⛰️',
    titulo: 'Ajuste de recetas por altitud',
    desc: 'Adapta una receta de nivel del mar a la altura a la que cocinas: punto de ebullición del agua y ajustes de horno, leudante, líquido y cocción.',
    categoria: 'medidas-conversiones',
  },
  {
    slug: 'conversor-temperatura-horno',
    icon: '🌡️',
    titulo: 'Conversor de temperatura de horno',
    desc: 'Pasa la temperatura del horno entre grados Celsius, Fahrenheit y gas mark, con el equivalente para horno de ventilador y los usos de cada nivel.',
    categoria: 'medidas-conversiones',
  },
  {
    slug: 'sustituciones-ingredientes',
    icon: '🔄',
    titulo: 'Sustituciones de ingredientes',
    desc: 'Con qué cambiar huevo, mantequilla, azúcar, leche o harina, con proporciones exactas y filtro vegano, sin gluten y sin lactosa.',
    categoria: 'medidas-conversiones',
  },
  {
    slug: 'conversor-moldes',
    icon: '⭕',
    titulo: 'Conversor de moldes',
    desc: 'Adapta los ingredientes de una receta al molde que tengas según el área de la base, y ajusta el tiempo de horno.',
    categoria: 'medidas-conversiones',
  },
  {
    slug: 'densidad-liquidos',
    icon: '💧',
    titulo: 'Conversor de líquidos (ml ↔ g)',
    desc: 'Convierte mililitros y gramos según el líquido: cada uno pesa distinto por su densidad (aceite, miel, leche…).',
    categoria: 'medidas-conversiones',
  },
  {
    slug: 'medidas-a-ojo',
    icon: '🤏',
    titulo: 'Medidas «a ojo»',
    desc: 'Cuánto es una pizca, un chorro, un vaso o un puñado: traduce las medidas imprecisas de las recetas.',
    categoria: 'medidas-conversiones',
  },
  {
    slug: 'conversor-onzas',
    icon: '⚖️',
    titulo: 'Conversor de onzas',
    desc: 'De onzas a gramos, mililitros, libras y tazas, separando la onza de peso de la onza líquida, con la diferencia entre EE. UU. y Reino Unido.',
    categoria: 'medidas-conversiones',
  },
  // Cocción y conservación · bloque de cocción (seguridad y punto)
  {
    slug: 'temperatura-coccion-carne',
    icon: '🌡️',
    titulo: 'Temperatura interna de cocción',
    desc: 'El punto exacto de vacuno, cerdo, pollo, carne picada y pescado, con la temperatura mínima segura del USDA. En °C y °F.',
    categoria: 'coccion',
  },
  {
    slug: 'tiempos-coccion',
    icon: '⏱️',
    titulo: 'Tiempos de cocción',
    desc: 'Cuánto cocer en agua huevos, arroz, pasta, legumbres y verduras, con notas prácticas y ajuste por altitud.',
    categoria: 'coccion',
  },
  {
    slug: 'conversor-horno-airfryer',
    icon: '🌀',
    titulo: 'Horno → freidora de aire',
    desc: 'Adapta cualquier receta de horno a la air fryer: baja la temperatura y reduce el tiempo, con tabla de alimentos.',
    categoria: 'coccion',
  },
  {
    slug: 'tiempos-asado',
    icon: '🍗',
    titulo: 'Tiempos de asado',
    desc: 'Cuánto asar pollo, pavo, cordero, cerdo o ternera según el peso, con la temperatura interna objetivo.',
    categoria: 'coccion',
  },
  {
    slug: 'sous-vide',
    icon: '♨️',
    titulo: 'Sous-vide',
    desc: 'Temperaturas y tiempos de cocción al vacío para carne, pollo, pescado, huevo y verduras.',
    categoria: 'coccion',
  },
  {
    slug: 'calculadora-salmuera',
    icon: '🧂',
    titulo: 'Salmuera (brining)',
    desc: 'La sal y el agua para tu salmuera según la concentración, con tiempos por pieza.',
    categoria: 'coccion',
  },
  {
    slug: 'huevo-perfecto',
    icon: '🥚',
    titulo: 'El huevo perfecto',
    desc: 'El tiempo exacto para el huevo en su punto, según el tamaño y si está frío de la nevera.',
    categoria: 'coccion',
  },
  {
    slug: 'puntos-humo-aceites',
    icon: '🔥',
    titulo: 'Puntos de humo de los aceites',
    desc: 'Con qué aceite freír, saltear o aliñar según su punto de humo, del aliño en crudo a la fritura. Con buscador y filtro por temperatura.',
    categoria: 'coccion',
  },
  // Cocción y conservación · tratar el alimento con frío o transformarlo para que dure
  // (bloque de la antigua categoría 'conservacion', absorbida el 09/08/2026)
  {
    slug: 'calculadora-caducidad',
    icon: '🧊',
    titulo: 'Cuánto dura cada alimento',
    desc: 'Tiempos de conservación en nevera, congelador y despensa para carnes, pescados, lácteos, verduras y sobras, con buscador y filtro.',
    categoria: 'coccion',
  },
  {
    slug: 'calculadora-congelacion',
    icon: '❄️',
    titulo: 'Qué se puede congelar',
    desc: 'Qué alimentos aguantan bien el congelador, cuáles no y cuánto duran, con buscador y filtro por categoría.',
    categoria: 'coccion',
  },
  {
    slug: 'descongelacion-segura',
    icon: '🧊',
    titulo: 'Descongelación segura',
    desc: 'Cuánto tarda en descongelarse un alimento según el peso y el método: nevera, agua fría o microondas. Nunca al ambiente.',
    categoria: 'coccion',
  },
  {
    slug: 'calculadora-mermelada',
    icon: '🍓',
    titulo: 'Mermelada',
    desc: 'Azúcar y limón para tu mermelada según la fruta y el dulzor, con aviso de cuándo necesita pectina.',
    categoria: 'coccion',
  },
  {
    slug: 'calculadora-encurtidos',
    icon: '🥒',
    titulo: 'Encurtidos',
    desc: 'Vinagre, agua, sal y azúcar para tu líquido de encurtido según el estilo y el volumen.',
    categoria: 'coccion',
  },
  {
    slug: 'fermentados-vegetales',
    icon: '🥬',
    titulo: 'Fermentados vegetales',
    desc: 'La sal exacta para fermentar verduras en seco (chucrut, kimchi) o en salmuera, la clave de una fermentación segura.',
    categoria: 'coccion',
  },
  // Cocina y recetas · poner números a la comida, del ala B2B / hostelería
  // (bloque de la antigua categoría 'costes-cocina', absorbida el 09/08/2026)
  {
    slug: 'escandallo-food-cost',
    icon: '💼',
    titulo: 'Escandallo y food cost',
    desc: 'Coste de la receta por ingredientes, coste por ración y precio de venta según tu food cost objetivo, con el margen bruto. Para hostelería y catering.',
    categoria: 'cocina-recetas',
  },
  {
    slug: 'calculadora-merma',
    icon: '📉',
    titulo: 'Calculadora de merma',
    desc: 'Peso neto, rendimiento, factor de corrección y coste real por kilo útil tras limpiar y cocinar. El coste que el precio de compra no refleja.',
    categoria: 'cocina-recetas',
  },
  // Ingredientes y despensa (producto: cómo elegir y usar)
  {
    slug: 'guia-aceite-oliva',
    icon: '🫒',
    titulo: 'Aceite de oliva',
    desc: 'Virgen extra, virgen, refinado y variedades de aceituna: cómo distinguirlos, leer la etiqueta y elegir según el uso.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-cortes-carne',
    icon: '🥩',
    titulo: 'Cortes de carne',
    desc: 'Mapa de los cortes de vacuno, cerdo, cordero y aves, con la cocción que mejor le va a cada pieza.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-especias',
    icon: '🌶️',
    titulo: 'Especias',
    desc: 'Aromas, usos y combinaciones de las especias del mundo para condimentar con criterio y sin desperdiciar.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-hierbas-aromaticas',
    icon: '🌿',
    titulo: 'Hierbas aromáticas',
    desc: 'Albahaca, tomillo, cilantro y compañía: con qué platos casan y cuándo añadirlas para que aporten al máximo.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-quesos',
    icon: '🧀',
    titulo: 'Quesos',
    desc: 'Familias de queso por leche, curación y textura, con ideas de maridaje y de tabla.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-setas',
    icon: '🍄',
    titulo: 'Setas',
    desc: 'Variedades comestibles, temporada y cómo cocinarlas para sacarles sabor sin estropear la textura.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-frutas-exoticas',
    icon: '🥭',
    titulo: 'Frutas exóticas',
    desc: 'Qué son, cómo elegirlas en su punto y cómo prepararlas, de la pitaya al maracuyá.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-vinagres-mundo',
    icon: '🍶',
    titulo: 'Vinagres del mundo',
    desc: 'De Módena al de arroz: perfiles de acidez y aroma y para qué brilla cada vinagre en la cocina.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-tipos-arroz',
    icon: '🍚',
    titulo: 'Tipos de arroz',
    desc: 'Redondo, bomba, basmati, jazmín o arborio: qué arroz pide cada plato según su almidón y su grano.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-tipos-pasta',
    icon: '🍝',
    titulo: 'Tipos de pasta',
    desc: 'Formas de pasta y la salsa que mejor agarra cada una, para que el plato funcione de verdad.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-superalimentos',
    icon: '🥑',
    titulo: 'Superalimentos',
    desc: 'Qué aportan realmente los alimentos de moda y cómo incorporarlos sin caer en exageraciones.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'aditivos-e-alimentarios',
    icon: '🧪',
    titulo: 'Aditivos E',
    desc: 'Qué significan los números E de las etiquetas: conservantes, colorantes y espesantes explicados con claridad.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-chiles',
    icon: '🌶️',
    titulo: 'Chiles y pimientos',
    desc: 'Los chiles del mundo ordenados por picor (escala Scoville), con su origen y usos. Filtro por nivel de picante.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-harinas',
    icon: '🌾',
    titulo: 'Harinas',
    desc: 'Qué harina usar para cada cosa, con su fuerza (W), su proteína y sus mejores usos.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-tipos-sal',
    icon: '🧂',
    titulo: 'Tipos de sal',
    desc: 'De la sal fina a la flor de sal: texturas, usos y diferencias para acertar con cada una.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-chocolate',
    icon: '🍫',
    titulo: 'Chocolate y cacao',
    desc: 'Qué significa el porcentaje y qué chocolate usar para cada cosa en repostería.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-azucares',
    icon: '🍬',
    titulo: 'Azúcares y endulzantes',
    desc: 'Tipos de endulzante, su poder dulce y sus usos. Filtro por tipo.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-tuberculos-latam',
    icon: '🥔',
    titulo: 'Tubérculos de Latinoamérica',
    desc: 'Yuca, boniato, malanga, papas andinas y más: qué son y cómo cocinarlos, con avisos de seguridad.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'guia-maices',
    icon: '🌽',
    titulo: 'Maíces y nixtamal',
    desc: 'Tipos de maíz y derivados, de la tortilla a la arepa, y qué es la nixtamalización.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'calendario-temporada',
    icon: '📅',
    titulo: 'Calendario de temporada',
    desc: 'Qué frutas y verduras son de temporada cada mes del año, para comer mejor y más sostenible.',
    categoria: 'ingredientes-despensa',
  },
  // Bebidas (todo el ala líquida)
  {
    slug: 'ratio-cafe',
    icon: '☕',
    titulo: 'Ratio de café',
    desc: 'Los gramos de café y el agua exactos según el método: V60, prensa, AeroPress, espresso, moka y cold brew.',
    categoria: 'bebidas',
  },
  {
    slug: 'escalado-cocteles',
    icon: '🍸',
    titulo: 'Escalado de cócteles',
    desc: 'Escala un cóctel a las copas que necesites y calcula la graduación de la mezcla. Consumo responsable.',
    categoria: 'bebidas',
  },
  {
    slug: 'aguas-frescas',
    icon: '🍋',
    titulo: 'Aguas frescas y limonada',
    desc: 'Las proporciones para limonada, naranjada, agua de jamaica, horchata o agua de fruta según los litros.',
    categoria: 'bebidas',
  },
  {
    slug: 'maridaje',
    icon: '🍷',
    titulo: 'Maridaje de comida',
    desc: 'Qué vino y qué cerveza van mejor con cada plato, y por qué combinan. Orientación, no regla.',
    categoria: 'bebidas',
  },
  {
    slug: 'guia-cafe',
    icon: '☕',
    titulo: 'Café',
    desc: 'Métodos de extracción, tuestes y orígenes para entender qué hay detrás de cada taza y preparar mejor café en casa.',
    categoria: 'bebidas',
  },
  {
    slug: 'guia-te',
    icon: '🍵',
    titulo: 'Té',
    desc: 'Verde, negro, oolong o blanco: temperaturas y tiempos de infusión para que cada té dé lo mejor de sí.',
    categoria: 'bebidas',
  },
  {
    slug: 'guia-infusiones',
    icon: '🌼',
    titulo: 'Infusiones',
    desc: 'Hierbas e infusiones más allá del té, sus aromas y para qué momento del día va cada una.',
    categoria: 'bebidas',
  },
  {
    slug: 'guia-cocteles',
    icon: '🍸',
    titulo: 'Coctelería',
    desc: 'Cócteles clásicos, sus proporciones y técnicas para prepararlos bien. Con consumo responsable.',
    categoria: 'bebidas',
  },
  {
    slug: 'guia-estilos-cerveza',
    icon: '🍺',
    titulo: 'Estilos de cerveza',
    desc: 'Lager, IPA, stout y compañía: qué define a cada estilo, su intensidad y con qué comida combinan.',
    categoria: 'bebidas',
  },
  {
    slug: 'guia-varietales-vino',
    icon: '🍇',
    titulo: 'Variedades de vino',
    desc: 'Las principales uvas y sus perfiles, para reconocer qué esperar de cada vino por su varietal.',
    categoria: 'bebidas',
  },
  {
    slug: 'que-vino-elegir',
    icon: '🍷',
    titulo: 'Qué vino elegir',
    desc: 'Selector que te sugiere el vino según el plato, el momento y tus preferencias para acertar con el maridaje.',
    categoria: 'bebidas',
  },
  {
    slug: 'que-cerveza-elegir',
    icon: '🍻',
    titulo: 'Qué cerveza elegir',
    desc: 'Selector que orienta hacia el estilo de cerveza que mejor encaja con lo que vas a comer o el momento.',
    categoria: 'bebidas',
  },
  // Ingredientes y despensa · de dónde viene y qué le pasa al alimento (visualizadores
  // temáticos de la antigua categoría 'cultura-gastronomica', absorbida el 09/08/2026)
  {
    slug: 'visualizador-mapa-especias',
    icon: '🗺️',
    titulo: 'Mapa de las especias',
    desc: 'De dónde viene cada especia y cómo las rutas comerciales movieron sabores por todo el planeta.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'visualizador-viaje-comida',
    icon: '🌍',
    titulo: 'El viaje de la comida',
    desc: 'Recorrido por el origen y la difusión de alimentos cotidianos: cómo llegaron a tu plato desde el otro lado del mundo.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'visualizador-huella-alimentos',
    icon: '🌱',
    titulo: 'Huella de los alimentos',
    desc: 'Compara el impacto ambiental —agua, CO₂, tierra— de lo que comemos para decidir con más información.',
    categoria: 'ingredientes-despensa',
  },
  {
    slug: 'visualizador-digestion-nutrientes',
    icon: '🧬',
    titulo: 'Digestión de nutrientes',
    desc: 'Visualiza el camino de hidratos, grasas y proteínas por el aparato digestivo y cómo se aprovechan.',
    categoria: 'ingredientes-despensa',
  },
];

// Apps de una categoría, en el orden del catálogo. Lo usa cada parrilla.
export function appsDeCategoria(categoria: string): CoquinumApp[] {
  return COQUINUM_APPS.filter((a) => a.categoria === categoria);
}

// Slug → categoría, derivado del catálogo: breadcrumb de MeskeiaLogo, banda
// DescubreVertical y llms.txt del portal.
export const COQUINUM_APP_CATEGORIA: Record<string, string> = Object.fromEntries(
  COQUINUM_APPS.map((a) => [a.slug, a.categoria]),
);

// Slugs de apps servidas bajo coquinum.com (passthrough en el proxy).
export const COQUINUM_APP_SLUGS = new Set(Object.keys(COQUINUM_APP_CATEGORIA));

// Rutas de páginas del portal (home + categorías) que el proxy reescribe a
// /coquinum/*. La cadena vacía representa la home (coquinum.com/).
export const COQUINUM_PORTAL_SLUGS = new Set(['', ...Object.keys(COQUINUM_CATEGORIAS)]);

// Conteos derivados automáticamente del catálogo (para los contadores de la
// home y del hero). Al añadir una app a COQUINUM_APPS se actualizan solos.
export const COQUINUM_APPS_POR_CATEGORIA: Record<string, number> = Object.values(
  COQUINUM_APP_CATEGORIA,
).reduce<Record<string, number>>((acc, categoria) => {
  acc[categoria] = (acc[categoria] ?? 0) + 1;
  return acc;
}, {});

// Total de apps publicadas en el portal.
export const COQUINUM_TOTAL_APPS = Object.keys(COQUINUM_APP_CATEGORIA).length;

// Nombre e icono para el bloque «Más de [categoría]» que se muestra al pie de
// cada app bajo coquinum.com (navegación interna verde, en lugar de dejar al
// visitante en un callejón sin salida). Se derivan del catálogo: una app se llama
// y se ilustra igual en la parrilla y en el pie.
export interface CoquinumAppInfo {
  nombre: string;
  icon: string;
}

export const COQUINUM_APP_INFO: Record<string, CoquinumAppInfo> = Object.fromEntries(
  COQUINUM_APPS.map((a) => [a.slug, { nombre: a.titulo, icon: a.icon }]),
);

export interface CoquinumHermana {
  slug: string;
  nombre: string;
  icon: string;
}

export interface CoquinumNavCategoria {
  categoria: string;
  categoriaSlug: string;
  hermanas: CoquinumHermana[];
}

/**
 * Dada una app del portal, devuelve su categoría y las apps "hermanas" (misma
 * categoría) para el bloque "Más de [categoría]". Devuelve null si el slug no es
 * una app de Coquinum.
 */
export function getCoquinumHermanas(slug: string, max = 6): CoquinumNavCategoria | null {
  const app = COQUINUM_APPS.find((a) => a.slug === slug);
  if (!app) return null;
  const hermanas = appsDeCategoria(app.categoria)
    .filter((a) => a.slug !== slug)
    .slice(0, max)
    .map((a) => ({ slug: a.slug, nombre: a.titulo, icon: a.icon }));
  return {
    categoria: COQUINUM_CATEGORIAS[app.categoria],
    categoriaSlug: app.categoria,
    hermanas,
  };
}
