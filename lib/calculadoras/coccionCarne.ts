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
  // Matiz a la vista bajo la tabla: puntos por debajo del mínimo, o un caso en el que el mínimo
  // del USDA no basta (el cerdo de matanza casera sin análisis de triquina)
  avisoCrudo?: string;
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
    // AESAN, ficha «Triquinelosis» (13/03/2025, consultada el 19/11/2026), págs. 4-6: la carne
    // comercializada se analiza (Reglamento de Ejecución (UE) 2015/1375) y «no son necesarias
    // medidas específicas en el hogar»; «el principal riesgo recae en la carne de cerdos
    // sacrificados en matanzas domiciliarias y de jabalíes cazados para autoconsumo que no son
    // sometidos a análisis de triquina»; además, «Cocinar bien la carne a 70° C al menos 2 minutos
    // de forma que se alcance esta temperatura en todo el producto»; la salazón, el ahumado, la
    // desecación y la congelación no son métodos seguros.
    avisoCrudo: 'El cerdo que se vende en la Unión Europea ya pasa el análisis de triquina, y para él basta el mínimo del USDA. El riesgo está en el cerdo de matanza casera y en el jabalí cazado para consumo propio sin ese análisis: la AESAN pide analizar la carne antes de comerla y, además, cocinarla a 70 °C al menos 2 minutos en toda la pieza. Ni el curado, ni el ahumado, ni la congelación la hacen segura.',
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
    avisoCrudo: 'El punto jugoso (típico en salmón o atún) queda por debajo del mínimo seguro. Para crudo o poco hecho, usa pescado muy fresco y previamente congelado contra el anisakis: en casa, a −15 °C o menos durante al menos 4 días (la AESAN recomienda contar 5 desde que entra en el congelador); el congelado industrial, a −20 °C 24 horas o a −35 °C 15 horas.',
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
