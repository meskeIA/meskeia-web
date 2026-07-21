// Glosario de técnicas de cocina — datos curados
//
// Recoge los verbos que aparecen en las recetas (blanquear, confitar, bresar,
// desglasar, nacarar...) agrupados por su método: cocción en líquido o vapor,
// con grasa o calor seco, preparación previa, y ligar/acabar. Cada técnica lleva
// una definición breve y correcta y un ejemplo típico. Terminología de uso común;
// algunas técnicas se llaman distinto según la región. Verificado: 2026-07.

export type Grupo = 'liquido' | 'grasa' | 'previa' | 'acabado';

export const ETIQUETA_GRUPO: Record<Grupo, string> = {
  liquido: 'En líquido o vapor',
  grasa: 'Con grasa o calor seco',
  previa: 'Preparación previa',
  acabado: 'Ligar y acabar',
};

export interface Tecnica {
  nombre: string;
  grupo: Grupo;
  definicion: string;
  ejemplo: string;
}

export const TECNICAS: Tecnica[] = [
  // --- En líquido o vapor (agua, caldo o vapor) ---
  {
    nombre: 'Hervir',
    grupo: 'liquido',
    definicion: 'Cocer un alimento sumergido en agua u otro líquido en plena ebullición, en torno a los 100 °C.',
    ejemplo: 'Pasta, patatas o legumbres.',
  },
  {
    nombre: 'Escaldar',
    grupo: 'liquido',
    definicion: 'Sumergir un alimento solo unos segundos en agua hirviendo, sin llegar a cocerlo.',
    ejemplo: 'Pelar tomates o almendras con facilidad.',
  },
  {
    nombre: 'Blanquear',
    grupo: 'liquido',
    definicion: 'Hervir un alimento muy brevemente y cortarlo enseguida en agua con hielo para fijar el color y frenar la cocción. No confundir con montar huevos.',
    ejemplo: 'Judías verdes, brócoli o guisantes.',
  },
  {
    nombre: 'Escalfar (pochar)',
    grupo: 'liquido',
    definicion: 'Cocer un alimento en un líquido caliente pero sin que llegue a hervir, a unos 70-90 °C, para que quede suave y jugoso.',
    ejemplo: 'Huevo escalfado, pescado o pollo.',
  },
  {
    nombre: 'Cocer al vapor',
    grupo: 'liquido',
    definicion: 'Cocinar con el vapor del agua hirviendo sin que el alimento toque el líquido, conservando textura y nutrientes.',
    ejemplo: 'Verduras, pescado o dim sum.',
  },
  {
    nombre: 'Guisar',
    grupo: 'liquido',
    definicion: 'Cocer alimentos troceados a fuego lento en abundante salsa o caldo hasta que quedan tiernos.',
    ejemplo: 'Guiso de carne con patatas.',
  },
  {
    nombre: 'Estofar',
    grupo: 'liquido',
    definicion: 'Cocer despacio y tapado con muy poco líquido, aprovechando el jugo que suelta el propio alimento.',
    ejemplo: 'Ternera estofada, rabo de toro.',
  },
  {
    nombre: 'Bresar (braisear)',
    grupo: 'liquido',
    definicion: 'Dorar primero la pieza a fuego fuerte y después cocerla lenta y tapada con algo de líquido, para una carne muy tierna.',
    ejemplo: 'Carrilleras, redondo, jarrete.',
  },
  {
    nombre: 'Reducir',
    grupo: 'liquido',
    definicion: 'Hervir un líquido para que se evapore parte del agua y concentre sabor, color y textura.',
    ejemplo: 'Salsas, caldos, reducción de vino.',
  },
  {
    nombre: 'Baño maría',
    grupo: 'liquido',
    definicion: 'Cocinar dentro de un recipiente apoyado en agua caliente, para un calor suave y uniforme que no quema el alimento.',
    ejemplo: 'Flan, natillas, fundir chocolate.',
  },
  {
    nombre: 'Escabechar',
    grupo: 'liquido',
    definicion: 'Cocer y conservar un alimento en una mezcla de vinagre, aceite, hierbas y especias que aporta sabor y lo preserva.',
    ejemplo: 'Mejillones, perdiz o bonito en escabeche.',
  },

  // --- Con grasa o calor seco ---
  {
    nombre: 'Freír',
    grupo: 'grasa',
    definicion: 'Cocinar sumergiendo el alimento en aceite caliente y abundante, que lo cuece y le da una costra dorada.',
    ejemplo: 'Patatas fritas, croquetas.',
  },
  {
    nombre: 'Saltear',
    grupo: 'grasa',
    definicion: 'Cocinar a fuego fuerte con poca grasa, moviendo la sartén para que el alimento salte y se dore sin cocerse en su jugo.',
    ejemplo: 'Verduras al wok, gambas.',
  },
  {
    nombre: 'Sofreír',
    grupo: 'grasa',
    definicion: 'Cocinar despacio a fuego medio-suave en grasa para ablandar los ingredientes sin apenas dorarlos.',
    ejemplo: 'Sofrito de cebolla, ajo y tomate.',
  },
  {
    nombre: 'Rehogar',
    grupo: 'grasa',
    definicion: 'Cocinar en poca grasa a fuego suave hasta que el alimento se ablanda y suelta su agua, sin tomar color.',
    ejemplo: 'Cebolla, puerro, espinacas.',
  },
  {
    nombre: 'Nacarar',
    grupo: 'grasa',
    definicion: 'Rehogar el arroz en grasa hasta que el grano se vuelve translúcido y brillante, antes de añadir el caldo.',
    ejemplo: 'Arroz, risotto, paella.',
  },
  {
    nombre: 'Confitar',
    grupo: 'grasa',
    definicion: 'Cocer un alimento despacio sumergido en grasa a baja temperatura, en torno a 60-90 °C, hasta que queda muy tierno.',
    ejemplo: 'Confit de pato, ajos o tomate confitado.',
  },
  {
    nombre: 'Sellar (marcar)',
    grupo: 'grasa',
    definicion: 'Dorar la superficie de una pieza a fuego fuerte para formar una costra que aporta sabor antes de terminar la cocción.',
    ejemplo: 'Solomillo, carne antes de guisar.',
  },
  {
    nombre: 'Dorar',
    grupo: 'grasa',
    definicion: 'Cocinar hasta que la superficie toma un color tostado por la reacción de Maillard, que crea aroma y sabor.',
    ejemplo: 'Cebolla, carne, pan.',
  },
  {
    nombre: 'Gratinar',
    grupo: 'grasa',
    definicion: 'Dorar la superficie de un plato con calor fuerte por arriba (grill u horno), a menudo con queso, bechamel o pan rallado.',
    ejemplo: 'Lasaña, macarrones, sopa de cebolla.',
  },
  {
    nombre: 'Asar',
    grupo: 'grasa',
    definicion: 'Cocinar con calor seco en horno, brasa o parrilla, sin sumergir el alimento en líquido.',
    ejemplo: 'Pollo asado, verduras al horno.',
  },
  {
    nombre: 'Flambear',
    grupo: 'grasa',
    definicion: 'Rociar el plato con una bebida alcohólica y prenderla brevemente para quemar el alcohol y aromatizar.',
    ejemplo: 'Crepes Suzette, gambas al whisky.',
  },
  {
    nombre: 'Ahumar',
    grupo: 'grasa',
    definicion: 'Aromatizar y a menudo cocinar un alimento exponiéndolo al humo de una madera, en frío o en caliente.',
    ejemplo: 'Salmón ahumado, costillas.',
  },

  // --- Preparación previa ---
  {
    nombre: 'Marinar',
    grupo: 'previa',
    definicion: 'Dejar un alimento en reposo en un líquido aromático (aceite, cítrico, hierbas, especias) para darle sabor y, a veces, ablandarlo.',
    ejemplo: 'Pollo, pescado, ceviche.',
  },
  {
    nombre: 'Macerar',
    grupo: 'previa',
    definicion: 'Dejar reposar un alimento en un líquido o en azúcar para que absorba sabor, se ablande o suelte su jugo.',
    ejemplo: 'Fresas con azúcar, frutas en licor.',
  },
  {
    nombre: 'Adobar',
    grupo: 'previa',
    definicion: 'Cubrir carne o pescado con una mezcla de pimentón, ajo, sal y especias que da sabor y ayuda a conservarlo.',
    ejemplo: 'Lomo adobado, pinchos morunos.',
  },
  {
    nombre: 'Bridar',
    grupo: 'previa',
    definicion: 'Atar una pieza con hilo de cocina para que mantenga la forma y se cocine de manera uniforme.',
    ejemplo: 'Pollo o pavo asado, redondo.',
  },
  {
    nombre: 'Mechar',
    grupo: 'previa',
    definicion: 'Introducir tiras de tocino, jamón u otro ingrediente en el interior de una pieza de carne para darle jugosidad y sabor.',
    ejemplo: 'Redondo mechado, lomo.',
  },
  {
    nombre: 'Empanar',
    grupo: 'previa',
    definicion: 'Pasar el alimento por harina, huevo batido y pan rallado antes de freírlo, para lograr una costra crujiente.',
    ejemplo: 'Escalope, croquetas, san jacobo.',
  },
  {
    nombre: 'Rebozar',
    grupo: 'previa',
    definicion: 'Cubrir el alimento con harina y huevo, o con una masa ligera, antes de freír, sin usar pan rallado.',
    ejemplo: 'Pescado rebozado, calamares.',
  },
  {
    nombre: 'Enharinar',
    grupo: 'previa',
    definicion: 'Cubrir el alimento con una capa fina de harina antes de cocinarlo, para que dore mejor o espese la salsa.',
    ejemplo: 'Pescado a la plancha, carne para guisar.',
  },
  {
    nombre: 'Tamizar',
    grupo: 'previa',
    definicion: 'Pasar un ingrediente en polvo por un colador fino para airearlo y deshacer los grumos.',
    ejemplo: 'Harina, azúcar glas, cacao.',
  },

  // --- Ligar y acabar ---
  {
    nombre: 'Emulsionar',
    grupo: 'acabado',
    definicion: 'Mezclar dos líquidos que por sí solos no se unen, como grasa y agua, hasta lograr una crema estable.',
    ejemplo: 'Mayonesa, vinagreta, alioli.',
  },
  {
    nombre: 'Montar',
    grupo: 'acabado',
    definicion: 'Batir enérgicamente un ingrediente para incorporar aire y aumentar su volumen y ligereza.',
    ejemplo: 'Nata montada, claras a punto de nieve.',
  },
  {
    nombre: 'Napar',
    grupo: 'acabado',
    definicion: 'Cubrir un alimento con una capa fina y uniforme de salsa que lo recubre sin encharcarlo.',
    ejemplo: 'Huevos napados, carne con su salsa.',
  },
  {
    nombre: 'Ligar',
    grupo: 'acabado',
    definicion: 'Espesar una salsa o crema para darle cuerpo, con harina, huevo, almidón o mantequilla.',
    ejemplo: 'Bechamel, salsa de un guiso.',
  },
  {
    nombre: 'Desglasar',
    grupo: 'acabado',
    definicion: 'Añadir líquido (vino, caldo o agua) a una sartén caliente para despegar y aprovechar los jugos caramelizados del fondo.',
    ejemplo: 'Base de una salsa tras dorar la carne.',
  },
  {
    nombre: 'Glasear',
    grupo: 'acabado',
    definicion: 'Dar brillo y una capa fina, dulce o gelatinosa, a un alimento para acabarlo.',
    ejemplo: 'Zanahorias glaseadas, bollería, jamón al horno.',
  },
  {
    nombre: 'Atemperar (chocolate)',
    grupo: 'acabado',
    definicion: 'Subir y bajar la temperatura del chocolate de forma controlada para que, al enfriar, quede brillante y crujiente.',
    ejemplo: 'Bombones, tabletas, coberturas.',
  },
  {
    nombre: 'Clarificar',
    grupo: 'acabado',
    definicion: 'Eliminar las impurezas de un líquido o de una grasa para dejarlo transparente y limpio.',
    ejemplo: 'Consomé, mantequilla clarificada.',
  },
];
