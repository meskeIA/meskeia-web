import {
  Trait,
  PedigreeIndividual,
  PedigreeChart,
  Sex,
  PunnettResult,
} from '../types';
import { generateMonohybridPunnett, determinePhenotype, generateSexLinkedPunnett } from './crosses';

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

    // Obtener fenotipo
    const recessivePhenotype = trait.phenotypes.find((p) =>
      p.genotypes.some((g) => g.includes(`X${r}`))
    );
    const dominantPhenotype = trait.phenotypes.find((p) =>
      p.genotypes.some((g) => g.includes(`X${d}`))
    );

    if (isAffected && recessivePhenotype) {
      phenotypeInfo = {
        name: recessivePhenotype.name,
        color: recessivePhenotype.color,
      };
    } else if (dominantPhenotype) {
      phenotypeInfo = {
        name: dominantPhenotype.name,
        color: dominantPhenotype.color,
      };
    } else {
      phenotypeInfo = { name: 'Desconocido', color: '#9CA3AF' };
    }
  } else {
    // Herencia autosómica
    phenotypeInfo = determinePhenotype(genotype, trait);

    // Verificar si es afectado (homocigoto recesivo)
    const r = trait.alleles.recessive.symbol;
    if (genotype === `${r}${r}`) {
      isAffected = true;
    }

    // Verificar si es portador (heterocigoto)
    const d = trait.alleles.dominant.symbol;
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
