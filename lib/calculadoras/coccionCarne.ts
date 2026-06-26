// Temperaturas internas de cocción — datos curados (seguridad alimentaria)
//
// Cada alimento trae sus puntos de cocción (del menos al más hecho) con la
// temperatura interna en °C y °F, y la TEMPERATURA MÍNIMA SEGURA según el USDA,
// por debajo de la cual hay riesgo de patógenos. Algunos puntos culinarios
// habituales (un solomillo poco hecho, un salmón jugoso) quedan por debajo del
// mínimo seguro: se marcan como tales para que el usuario decida con información.
//
// Fuente de los mínimos seguros: USDA FSIS «Safe Minimum Internal Temperatures».
// Verificado: 2026-06. Medir siempre con termómetro en la parte más gruesa.

export interface MetaCoccion {
  fuente: string;
  urlOficial: string;
  verificado: string;
}

export const COCCION_META: MetaCoccion = {
  fuente: 'USDA FSIS — Safe Minimum Internal Temperatures',
  urlOficial: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/safe-temperature-chart',
  verificado: '2026-06',
};

export interface PuntoCoccion {
  nombre: string;
  tempC: number;
  tempF: number;
  descripcion: string;
  seguro: boolean; // alcanza o supera el mínimo seguro del USDA
}

export interface AlimentoCoccion {
  id: string;
  nombre: string;
  emoji: string;
  minSeguroC: number;
  minSeguroF: number;
  reposoMin: number; // minutos de reposo recomendados tras la cocción
  avisoCrudo?: string; // matiz cuando hay puntos por debajo del mínimo
  puntos: PuntoCoccion[];
}

export const ALIMENTOS_COCCION: AlimentoCoccion[] = [
  {
    id: 'vacuno',
    nombre: 'Vacuno y cordero (pieza entera)',
    emoji: '🥩',
    minSeguroC: 63,
    minSeguroF: 145,
    reposoMin: 3,
    avisoCrudo: 'Los puntos poco hecho y al punto menos quedan por debajo del mínimo seguro del USDA. Son habituales en piezas enteras de calidad selladas por fuera, pero implican cierto riesgo: evítalos en personas vulnerables (embarazo, infancia, mayores, inmunodeprimidos).',
    puntos: [
      { nombre: 'Poco hecho', tempC: 52, tempF: 126, descripcion: 'Centro rojo y jugoso.', seguro: false },
      { nombre: 'Al punto menos', tempC: 57, tempF: 135, descripcion: 'Centro rosado intenso.', seguro: false },
      { nombre: 'Al punto', tempC: 63, tempF: 145, descripcion: 'Rosado claro. Mínimo seguro con 3 min de reposo.', seguro: true },
      { nombre: 'Al punto más', tempC: 68, tempF: 154, descripcion: 'Apenas un toque rosado.', seguro: true },
      { nombre: 'Muy hecho', tempC: 72, tempF: 162, descripcion: 'Sin rosa, más firme.', seguro: true },
    ],
  },
  {
    id: 'cerdo',
    nombre: 'Cerdo (pieza entera)',
    emoji: '🐖',
    minSeguroC: 63,
    minSeguroF: 145,
    reposoMin: 3,
    puntos: [
      { nombre: 'Jugoso', tempC: 63, tempF: 145, descripcion: 'Ligeramente rosado y jugoso. Mínimo seguro con 3 min de reposo.', seguro: true },
      { nombre: 'Al punto', tempC: 68, tempF: 154, descripcion: 'Apenas rosado, tierno.', seguro: true },
      { nombre: 'Muy hecho', tempC: 71, tempF: 160, descripcion: 'Totalmente blanco.', seguro: true },
    ],
  },
  {
    id: 'aves',
    nombre: 'Aves (pollo, pavo)',
    emoji: '🍗',
    minSeguroC: 74,
    minSeguroF: 165,
    reposoMin: 0,
    avisoCrudo: 'Las aves se cocinan siempre hasta el mínimo seguro: no hay punto «poco hecho» admisible. El jugo debe salir transparente.',
    puntos: [
      { nombre: 'Hecho (seguro)', tempC: 74, tempF: 165, descripcion: 'Jugo transparente, carne blanca y firme. Único punto recomendado.', seguro: true },
    ],
  },
  {
    id: 'picada',
    nombre: 'Carne picada (hamburguesa, albóndigas)',
    emoji: '🍔',
    minSeguroC: 71,
    minSeguroF: 160,
    reposoMin: 0,
    avisoCrudo: 'La carne picada no admite término poco hecho: al picarla, los patógenos de la superficie pasan al interior. Cocínala siempre al mínimo seguro (las de ave, a 74 °C).',
    puntos: [
      { nombre: 'Hecho (seguro)', tempC: 71, tempF: 160, descripcion: 'Sin zonas rosadas en el interior. Carne de ave picada: 74 °C.', seguro: true },
    ],
  },
  {
    id: 'pescado',
    nombre: 'Pescado y marisco',
    emoji: '🐟',
    minSeguroC: 63,
    minSeguroF: 145,
    reposoMin: 0,
    avisoCrudo: 'El punto jugoso (típico en salmón o atún) queda por debajo del mínimo seguro. Para crudo o poco hecho, usa pescado muy fresco y previamente congelado (anisakis).',
    puntos: [
      { nombre: 'Jugoso', tempC: 52, tempF: 126, descripcion: 'Centro translúcido (salmón, atún).', seguro: false },
      { nombre: 'Al punto', tempC: 58, tempF: 136, descripcion: 'Opaco pero jugoso, se desmiga apenas.', seguro: false },
      { nombre: 'Hecho', tempC: 63, tempF: 145, descripcion: 'Opaco y se desmiga con facilidad. Mínimo seguro.', seguro: true },
    ],
  },
];

export const ALIMENTO_COCCION_POR_ID: Record<string, AlimentoCoccion> =
  ALIMENTOS_COCCION.reduce<Record<string, AlimentoCoccion>>((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {});
