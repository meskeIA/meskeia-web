// Los 14 alérgenos alimentarios de declaración obligatoria en la Unión Europea.
//
// Lista fijada en el Anexo II del Reglamento (UE) nº 1169/2011, sobre la
// información alimentaria facilitada al consumidor. Estos 14 grupos deben
// declararse siempre y destacarse en la lista de ingredientes. Para cada uno se
// recoge un ejemplo de a qué se refiere y dónde suele "esconderse" (fuentes
// ocultas, trazas y contaminación cruzada). Verificado: 2026.

export type GrupoAlergeno = 'animal' | 'vegetal' | 'aditivo';

export const ETIQUETA_GRUPO: Record<GrupoAlergeno, string> = {
  animal: 'De origen animal',
  vegetal: 'De origen vegetal',
  aditivo: 'Aditivo',
};

export interface Alergeno {
  nombre: string;
  emoji: string;
  grupo: GrupoAlergeno;
  ejemplos: string;
  oculto: string;
}

export const ALERGENOS: Alergeno[] = [
  {
    nombre: 'Cereales con gluten',
    emoji: '🌾',
    grupo: 'vegetal',
    ejemplos: 'Trigo, centeno, cebada, avena, espelta y kamut.',
    oculto: 'Rebozados, salsas espesadas, embutidos, cerveza, salsa de soja y regaliz.',
  },
  {
    nombre: 'Crustáceos',
    emoji: '🦐',
    grupo: 'animal',
    ejemplos: 'Gambas, langostinos, cangrejo, langosta, cigala.',
    oculto: 'Caldos y fumets, surimi, algunas salsas y pastas asiáticas.',
  },
  {
    nombre: 'Huevos',
    emoji: '🥚',
    grupo: 'animal',
    ejemplos: 'Clara y yema, y todo lo que los lleve.',
    oculto: 'Mayonesa, bollería, rebozados, pasta al huevo, algunos vinos (clarificado).',
  },
  {
    nombre: 'Pescado',
    emoji: '🐟',
    grupo: 'animal',
    ejemplos: 'Todas las especies de pescado.',
    oculto: 'Salsa Worcestershire y colatura (anchoa), caldos, surimi, algunas pizzas.',
  },
  {
    nombre: 'Cacahuetes',
    emoji: '🥜',
    grupo: 'vegetal',
    ejemplos: 'Cacahuete y sus derivados.',
    oculto: 'Salsas satay, repostería, snacks y algunos aceites sin refinar.',
  },
  {
    nombre: 'Soja',
    emoji: '🫘',
    grupo: 'vegetal',
    ejemplos: 'Habas de soja y derivados.',
    oculto: 'Salsa de soja, lecitina de soja (E-322) de chocolates y bollería, embutidos.',
  },
  {
    nombre: 'Leche',
    emoji: '🥛',
    grupo: 'animal',
    ejemplos: 'Leche y lactosa; también quesos, nata y mantequilla.',
    oculto: 'Bollería, purés, embutidos, caramelos, margarinas y algunos pan de molde.',
  },
  {
    nombre: 'Frutos de cáscara',
    emoji: '🌰',
    grupo: 'vegetal',
    ejemplos: 'Almendra, avellana, nuez, anacardo, pacana, nuez de Brasil, pistacho y macadamia.',
    oculto: 'Pesto, turrones, repostería, panes y algunas salsas.',
  },
  {
    nombre: 'Apio',
    emoji: '🥬',
    grupo: 'vegetal',
    ejemplos: 'Tallo, hoja, semilla y raíz (apionabo).',
    oculto: 'Caldos y cubitos, sopas, sales condimentadas y muchos preparados.',
  },
  {
    nombre: 'Mostaza',
    emoji: '🟡',
    grupo: 'vegetal',
    ejemplos: 'Grano, polvo y salsa de mostaza.',
    oculto: 'Aderezos, marinados, salsas, currys y embutidos.',
  },
  {
    nombre: 'Granos de sésamo',
    emoji: '🫓',
    grupo: 'vegetal',
    ejemplos: 'Semillas de sésamo y tahini.',
    oculto: 'Pan de hamburguesa, hummus, panes, dulces y aceites.',
  },
  {
    nombre: 'Dióxido de azufre y sulfitos',
    emoji: '⚗️',
    grupo: 'aditivo',
    ejemplos: 'En concentración superior a 10 mg/kg o 10 mg/l.',
    oculto: 'Vino, frutas desecadas, frutos secos, patatas procesadas, encurtidos y zumos.',
  },
  {
    nombre: 'Altramuces',
    emoji: '🌱',
    grupo: 'vegetal',
    ejemplos: 'Altramuz y harina de altramuz.',
    oculto: 'Panes y bollería sin gluten, harinas mixtas y algunos snacks.',
  },
  {
    nombre: 'Moluscos',
    emoji: '🦪',
    grupo: 'animal',
    ejemplos: 'Almejas, mejillones, berberechos, calamar, pulpo, caracoles.',
    oculto: 'Paellas y arroces, salsas, y algunos condimentos asiáticos.',
  },
];
