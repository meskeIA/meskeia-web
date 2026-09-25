import {
  Trait,
  PedigreeIndividual,
  PedigreeChart,
  Sex,
  PunnettResult,
} from '../types';
import {
  generateMonohybridPunnett,
  generateDihybridPunnett,
  determinePhenotype,
  determineSexLinkedPhenotype,
  generateSexLinkedPunnett,
} from './crosses';

// Generar un pedigree de 3 generaciones basado en el cruce
export function generatePedigree(
  grandparent1MGenotype: string,
  grandparent1FGenotype: string,
  grandparent2MGenotype: string,
  grandparent2FGenotype: string,
  trait: Trait
): PedigreeChart {
  const individuals: PedigreeIndividual[] = [];
  const connections: PedigreeChart['connections'] = [];

  const isSexLinked = trait.inheritanceMode === 'sex-linked';

  // Generación 0: Abuelos
  // Familia 1 (izquierda)
  const grandpa1 = createPedigreeIndividual(
    'gp1m',
    0,
    0,
    'male',
    grandparent1MGenotype,
    trait,
    isSexLinked
  );
  const grandma1 = createPedigreeIndividual(
    'gp1f',
    0,
    1,
    'female',
    grandparent1FGenotype,
    trait,
    isSexLinked
  );

  // Familia 2 (derecha)
  const grandpa2 = createPedigreeIndividual(
    'gp2m',
    0,
    2,
    'male',
    grandparent2MGenotype,
    trait,
    isSexLinked
  );
  const grandma2 = createPedigreeIndividual(
    'gp2f',
    0,
    3,
    'female',
    grandparent2FGenotype,
    trait,
    isSexLinked
  );

  individuals.push(grandpa1, grandma1, grandpa2, grandma2);

  // Generación 1: Padres (resultado del cruce de abuelos)
  // Cruce familia 1
  let punnett1: PunnettResult;
  if (isSexLinked) {
    punnett1 = generateSexLinkedPunnett(
      grandparent1MGenotype,
      grandparent1FGenotype,
      trait,
      'male',
      'female'
    );
  } else {
    punnett1 = generateMonohybridPunnett(grandparent1MGenotype, grandparent1FGenotype, trait);
  }

  // Seleccionar un hijo aleatorio de familia 1 (será el padre)
  const parent1Cell = selectRandomCell(punnett1);
  const father = createPedigreeIndividual(
    'p1',
    1,
    0,
    'male',
    parent1Cell.genotype,
    trait,
    isSexLinked,
    ['gp1m', 'gp1f']
  );

  // Cruce familia 2
  let punnett2: PunnettResult;
  if (isSexLinked) {
    punnett2 = generateSexLinkedPunnett(
      grandparent2MGenotype,
      grandparent2FGenotype,
      trait,
      'male',
      'female'
    );
  } else {
    punnett2 = generateMonohybridPunnett(grandparent2MGenotype, grandparent2FGenotype, trait);
  }

  // Seleccionar una hija aleatoria de familia 2 (será la madre)
  const parent2Cell = selectRandomCellBySex(punnett2, 'female', isSexLinked);
  const mother = createPedigreeIndividual(
    'p2',
    1,
    1,
    'female',
    parent2Cell.genotype,
    trait,
    isSexLinked,
    ['gp2m', 'gp2f']
  );

  individuals.push(father, mother);

  connections.push({
    parent1Id: 'gp1m',
    parent2Id: 'gp1f',
    childIds: ['p1'],
  });

  connections.push({
    parent1Id: 'gp2m',
    parent2Id: 'gp2f',
    childIds: ['p2'],
  });

  // Generación 2: Hijos (resultado del cruce de padres)
  let punnett3: PunnettResult;
  if (isSexLinked) {
    punnett3 = generateSexLinkedPunnett(
      parent1Cell.genotype,
      parent2Cell.genotype,
      trait,
      'male',
      'female'
    );
  } else {
    punnett3 = generateMonohybridPunnett(parent1Cell.genotype, parent2Cell.genotype, trait);
  }

  // Generar 4 hijos representativos (uno de cada celda del Punnett)
  const childIds: string[] = [];
  const usedGenotypes = new Set<string>();

  for (let i = 0; i < Math.min(4, punnett3.cells.length); i++) {
    const cell = punnett3.cells[i];
    const childId = `c${i + 1}`;
    childIds.push(childId);

    // Alternar sexo para variedad, o usar el sexo del Punnett si es ligado al sexo
    let childSex: Sex;
    if (isSexLinked) {
      childSex = cell.phenotype.includes('♂') ? 'male' : 'female';
    } else {
      childSex = i % 2 === 0 ? 'male' : 'female';
    }

    const child = createPedigreeIndividual(
      childId,
      2,
      i,
      childSex,
      cell.genotype,
      trait,
      isSexLinked,
      ['p1', 'p2']
    );

    individuals.push(child);
  }

  connections.push({
    parent1Id: 'p1',
    parent2Id: 'p2',
    childIds,
  });

  return { individuals, connections };
}

// Crear un individuo del pedigree
function createPedigreeIndividual(
  id: string,
  generation: number,
  position: number,
  sex: Sex,
  genotype: string,
  trait: Trait,
  isSexLinked: boolean,
  parentIds?: [string, string]
): PedigreeIndividual {
  let phenotypeInfo;
  let isAffected = false;
  let isCarrier = false;

  if (isSexLinked) {
    // Para herencia ligada al sexo
    const d = trait.alleles.dominant.symbol;
    const r = trait.alleles.recessive.symbol;

    if (sex === 'female') {
      // Hembra
      if (genotype.includes(`X${r} X${r}`) || genotype.includes(`X${r}X${r}`)) {
        isAffected = true;
      } else if (genotype.includes(`X${d}`) && genotype.includes(`X${r}`)) {
        isCarrier = true;
      }
    } else {
      // Macho
      if (genotype.includes(`X${r}`) && !genotype.includes(`X${d}`)) {
        isAffected = true;
      }
    }

    /**
     * ⚠️ 25/09/2026 (hallazgo 1693, ALTO) — el fenotipo recesivo se buscaba como «el primer
     * fenotipo con algún genotipo que contenga X${r}», y el dominante ya lo cumple por la
     * portadora (XD Xd, XW Xw): cada afectado salía rotulado «Visión normal» u «Ojos rojos»
     * bajo el símbolo relleno de «Afectado», contra el cuadro de Punnett y las Estadísticas.
     * El fenotipo sale ahora de la misma función que usa el cuadro, así que no pueden discrepar.
     */
    phenotypeInfo = determineSexLinkedPhenotype(genotype, trait, sex);
  } else {
    // Herencia autosómica
    phenotypeInfo = determinePhenotype(genotype, trait);

    const r = trait.alleles.recessive.symbol;
    const d = trait.alleles.dominant.symbol;

    /**
     * En los grupos sanguíneos no hay «afectados»: el grupo O es un fenotipo más, no una
     * condición, y pintarlo con el símbolo relleno del árbol lo habría presentado como tal.
     * Lo que sí se marca es el PORTADOR del alelo recesivo (Iᴬi, Iᴮi), porque es justo lo que
     * explica que dos padres de grupo A puedan tener un hijo O.
     *
     * ⚠️ 24/09/2026 (hallazgo 1589) — la excepción se escribió con `trait.alleles.codominant`,
     * así que solo alcanzaba al ABO: el Factor Rh, de dominancia completa, caía en la rama
     * general y el Rh negativo (dd) salía relleno bajo la leyenda «Afectado», en una app con
     * aviso médico. La excepción es del RASGO (`sinAfectados`), no del modo de herencia. El
     * portador sale igual para los dos: heterocigoto con un alelo recesivo (Iᴬi, Iᴮi, Dd).
     */
    if (trait.sinAfectados) {
      return {
        id,
        generation,
        position,
        sex,
        genotype,
        phenotype: phenotypeInfo.name,
        phenotypeColor: phenotypeInfo.color,
        isAffected: false,
        isCarrier: genotype.length === 2 && genotype.includes(r) && genotype !== `${r}${r}`,
        parentIds,
      };
    }

    /**
     * ⚠️ 25/09/2026 (hallazgo 1697) — en dominancia incompleta no hay portadores ni afectados:
     * el heterocigoto tiene fenotipo PROPIO (Rr, flor rosa) y se distingue a simple vista, que es
     * justo lo contrario de un portador según la guía de la app («fenotípicamente igual al
     * homocigoto dominante»); y la flor blanca no es una afección. El árbol marcaba los Rr con el
     * medio relleno de «Portador» y los rr con el relleno de «Afectado». Aquí el fenotipo se lee
     * en el rótulo de cada individuo y la leyenda del árbol lo explica (PedigreeChart.tsx).
     */
    if (trait.inheritanceMode === 'incomplete') {
      return {
        id,
        generation,
        position,
        sex,
        genotype,
        phenotype: phenotypeInfo.name,
        phenotypeColor: phenotypeInfo.color,
        isAffected: false,
        isCarrier: false,
        parentIds,
      };
    }

    // Verificar si es afectado (homocigoto recesivo)
    if (genotype === `${r}${r}`) {
      isAffected = true;
    }

    // Verificar si es portador (heterocigoto)
    if (
      (genotype.includes(d) && genotype.includes(r)) ||
      genotype === `${d}${r}` ||
      genotype === `${r}${d}`
    ) {
      isCarrier = true;
    }
  }

  return {
    id,
    generation,
    position,
    sex,
    genotype,
    phenotype: phenotypeInfo.name,
    phenotypeColor: phenotypeInfo.color,
    isAffected,
    isCarrier,
    parentIds,
  };
}

// Seleccionar una celda aleatoria del Punnett
function selectRandomCell(punnett: PunnettResult) {
  const index = Math.floor(Math.random() * punnett.cells.length);
  return punnett.cells[index];
}

// Seleccionar una celda por sexo (para herencia ligada al sexo)
function selectRandomCellBySex(
  punnett: PunnettResult,
  targetSex: Sex,
  isSexLinked: boolean
) {
  if (!isSexLinked) {
    return selectRandomCell(punnett);
  }

  const sexSymbol = targetSex === 'male' ? '♂' : '♀';
  const matchingCells = punnett.cells.filter((cell) =>
    cell.phenotype.includes(sexSymbol)
  );

  if (matchingCells.length === 0) {
    return selectRandomCell(punnett);
  }

  const index = Math.floor(Math.random() * matchingCells.length);
  return matchingCells[index];
}

// Generar pedigree simple basado solo en los padres
export function generateSimplePedigree(
  parent1Genotype: string,
  parent2Genotype: string,
  trait: Trait,
  numChildren: number = 4
): PedigreeChart {
  const individuals: PedigreeIndividual[] = [];
  const isSexLinked = trait.inheritanceMode === 'sex-linked';

  // Padres
  const father = createPedigreeIndividual(
    'p1',
    0,
    0,
    'male',
    parent1Genotype,
    trait,
    isSexLinked
  );
  const mother = createPedigreeIndividual(
    'p2',
    0,
    1,
    'female',
    parent2Genotype,
    trait,
    isSexLinked
  );

  individuals.push(father, mother);

  // Generar hijos
  let punnett: PunnettResult;
  if (isSexLinked) {
    punnett = generateSexLinkedPunnett(
      parent1Genotype,
      parent2Genotype,
      trait,
      'male',
      'female'
    );
  } else {
    punnett = generateMonohybridPunnett(parent1Genotype, parent2Genotype, trait);
  }

  const childIds: string[] = [];
  for (let i = 0; i < numChildren; i++) {
    const cellIndex = i % punnett.cells.length;
    const cell = punnett.cells[cellIndex];
    const childId = `c${i + 1}`;
    childIds.push(childId);

    let childSex: Sex;
    if (isSexLinked) {
      childSex = cell.phenotype.includes('♂') ? 'male' : 'female';
    } else {
      childSex = i % 2 === 0 ? 'male' : 'female';
    }

    const child = createPedigreeIndividual(
      childId,
      1,
      i,
      childSex,
      cell.genotype,
      trait,
      isSexLinked,
      ['p1', 'p2']
    );

    individuals.push(child);
  }

  return {
    individuals,
    connections: [
      {
        parent1Id: 'p1',
        parent2Id: 'p2',
        childIds,
      },
    ],
  };
}

/**
 * Árbol de un cruce DIHÍBRIDO: cada individuo lleva el genotipo y el fenotipo de los DOS rasgos
 * («Bb Vv», «Gris / Alas normales»).
 *
 * ⚠️ 25/09/2026 (hallazgo 1694) — el árbol se construía siempre con el rasgo 1 aunque el cruce
 * fuera dihíbrido: en BbVv × bbvv enseñaba Bb × bb, «Gris»/«Negro», sin rastro de las alas ni
 * aviso de haberlas dejado fuera.
 *
 * Dos decisiones que el árbol declara en pantalla (PedigreeChart.tsx), porque no se deducen:
 * - El símbolo (afectado/portador) sigue al rasgo 1. Un símbolo de pedigrí describe UN carácter;
 *   el del rasgo 2 se lee en el genotipo y el fenotipo escritos debajo.
 * - Con 16 casillas, cuatro hijos no pueden ir en proporción (en el monohíbrido sí: son las
 *   cuatro casillas). Se eligen como EJEMPLOS de lo que puede salir: primero un hijo de cada
 *   fenotipo distinto, luego de cada genotipo distinto, y solo después se repiten esos mismos, por
 *   turno. Tomar la primera fila del cuadro, por ejemplo, daría en AaRr × AaRr cuatro hijos
 *   amarillos y lisos, que es la mitad del cruce escondida. Las proporciones, en Estadísticas.
 */
export function generateDihybridPedigree(
  genotiposProgenitor1: [string, string],
  genotiposProgenitor2: [string, string],
  trait1: Trait,
  trait2: Trait,
  numChildren: number = 4
): PedigreeChart {
  const individuo = (
    id: string,
    generation: number,
    position: number,
    sex: Sex,
    genotipo1: string,
    genotipo2: string,
    parentIds?: [string, string]
  ): PedigreeIndividual => {
    const rasgo1 = createPedigreeIndividual(id, generation, position, sex, genotipo1, trait1, false, parentIds);
    const rasgo2 = createPedigreeIndividual(id, generation, position, sex, genotipo2, trait2, false, parentIds);
    return {
      ...rasgo1,
      genotype: `${genotipo1} ${genotipo2}`,
      phenotype: `${rasgo1.phenotype} / ${rasgo2.phenotype}`,
    };
  };

  const father = individuo('p1', 0, 0, 'male', genotiposProgenitor1[0], genotiposProgenitor1[1]);
  const mother = individuo('p2', 0, 1, 'female', genotiposProgenitor2[0], genotiposProgenitor2[1]);

  const punnett = generateDihybridPunnett(
    genotiposProgenitor1[0],
    genotiposProgenitor1[1],
    genotiposProgenitor2[0],
    genotiposProgenitor2[1],
    trait1,
    trait2
  );
  const elegidas = elegirCasillasDeEjemplo(punnett, numChildren);

  const children: PedigreeIndividual[] = elegidas.map((cell, i) => {
    const [genotipo1, genotipo2] = cell.genotype.split(' ');
    return individuo(`c${i + 1}`, 1, i, i % 2 === 0 ? 'male' : 'female', genotipo1, genotipo2, ['p1', 'p2']);
  });

  return {
    individuals: [father, mother, ...children],
    connections: [{ parent1Id: 'p1', parent2Id: 'p2', childIds: children.map((c) => c.id) }],
  };
}

/** Las casillas de los hijos de ejemplo: fenotipos distintos, luego genotipos distintos, luego en orden. */
function elegirCasillasDeEjemplo(punnett: PunnettResult, cuantas: number): PunnettResult['cells'] {
  const elegidas: PunnettResult['cells'] = [];
  const usadas = new Set<number>();
  const pasadas: Array<(cell: PunnettResult['cells'][number]) => string> = [
    (cell) => cell.phenotype,
    (cell) => cell.genotype,
  ];

  for (const clave of pasadas) {
    const vistas = new Set(elegidas.map(clave));
    punnett.cells.forEach((cell, i) => {
      if (elegidas.length >= cuantas || usadas.has(i) || vistas.has(clave(cell))) return;
      vistas.add(clave(cell));
      usadas.add(i);
      elegidas.push(cell);
    });
  }
  // Menos combinaciones distintas que hijos: se repiten ellas, por turno. Repetir las casillas
  // del cuadro en orden daría en Bb VV × bb vv tres grises y un negro, que parece un 3:1 donde
  // hay un 1:1.
  const distintas = elegidas.length;
  for (let i = 0; distintas > 0 && elegidas.length < cuantas; i++) {
    elegidas.push(elegidas[i % distintas]);
  }
  return elegidas;
}
