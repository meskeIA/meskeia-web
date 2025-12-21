import {
  Trait,
  Genotype,
  PunnettCell,
  PunnettResult,
  Individual,
  CrossResult,
  OffspringResult,
  Sex,
} from '../types';

// Parsear genotipo string a tupla
export function parseGenotype(genotypeStr: string): Genotype {
  // Manejar formatos como "Aa", "AA", "aa"
  if (genotypeStr.length === 2) {
    return [genotypeStr[0], genotypeStr[1]];
  }
  // Manejar formato con espacio "A a"
  const parts = genotypeStr.split(' ');
  if (parts.length === 2) {
    return [parts[0], parts[1]];
  }
  return [genotypeStr[0], genotypeStr[1] || genotypeStr[0]];
}

// Generar gametos a partir de un genotipo
export function generateGametes(genotype: Genotype): string[] {
  const [allele1, allele2] = genotype;
  if (allele1 === allele2) {
    return [allele1]; // Homocigoto: solo un tipo de gameto
  }
  return [allele1, allele2]; // Heterocigoto: dos tipos de gametos
}

// Generar gametos para cruce dihíbrido
export function generateDihybridGametes(genotype1: Genotype, genotype2: Genotype): string[] {
  const gametes1 = generateGametes(genotype1);
  const gametes2 = generateGametes(genotype2);

  const result: string[] = [];
  for (const g1 of gametes1) {
    for (const g2 of gametes2) {
      result.push(`${g1}${g2}`);
    }
  }
  return [...new Set(result)]; // Eliminar duplicados
}

// Generar gametos para herencia ligada al sexo
export function generateSexLinkedGametes(
  genotypeStr: string,
  sex: Sex
): string[] {
  // Formato: "XD XD", "XD Xd", "Xd Y", etc.
  const parts = genotypeStr.split(' ');

  if (sex === 'female') {
    // Hembra: XX
    const gametes = parts.map((p) => p); // Cada X puede ir a un gameto
    return [...new Set(gametes)];
  } else {
    // Macho: XY
    return parts; // Un gameto con X, otro con Y
  }
}

// Determinar fenotipo a partir del genotipo
export function determinePhenotype(
  genotypeStr: string,
  trait: Trait
): { name: string; color: string; icon: string } {
  // Normalizar el genotipo (ordenar alelos)
  const normalizedGenotype = normalizeGenotype(genotypeStr, trait);

  for (const phenotype of trait.phenotypes) {
    if (phenotype.genotypes.includes(normalizedGenotype)) {
      return {
        name: phenotype.name,
        color: phenotype.color,
        icon: phenotype.icon,
      };
    }
  }

  // Fallback para dominancia incompleta u otros casos
  // Verificar si es heterocigoto en dominancia incompleta
  if (trait.inheritanceMode === 'incomplete') {
    const d = trait.alleles.dominant.symbol;
    const r = trait.alleles.recessive.symbol;
    if (
      (genotypeStr.includes(d) && genotypeStr.includes(r)) ||
      genotypeStr === `${d}${r}` ||
      genotypeStr === `${r}${d}`
    ) {
      // Buscar el fenotipo intermedio
      const intermediate = trait.phenotypes.find((p) =>
        p.genotypes.some((g) => g.includes(d) && g.includes(r))
      );
      if (intermediate) {
        return {
          name: intermediate.name,
          color: intermediate.color,
          icon: intermediate.icon,
        };
      }
    }
  }

  // Default
  return {
    name: 'Desconocido',
    color: '#9CA3AF',
    icon: '❓',
  };
}

// Normalizar genotipo (ordenar alelos: mayúscula primero)
export function normalizeGenotype(genotypeStr: string, trait: Trait): string {
  const d = trait.alleles.dominant.symbol;
  const r = trait.alleles.recessive.symbol;

  // Para herencia ligada al sexo
  if (trait.inheritanceMode === 'sex-linked') {
    return genotypeStr; // Ya viene normalizado
  }

  // Contar alelos
  const alleles = genotypeStr.replace(/\s/g, '').split('');
  const sorted = alleles.sort((a, b) => {
    // Mayúsculas primero
    if (a === d && b === r) return -1;
    if (a === r && b === d) return 1;
    return a.localeCompare(b);
  });

  return sorted.join('');
}

// Generar cuadro de Punnett para cruce monohíbrido
export function generateMonohybridPunnett(
  parent1Genotype: string,
  parent2Genotype: string,
  trait: Trait
): PunnettResult {
  const genotype1 = parseGenotype(parent1Genotype);
  const genotype2 = parseGenotype(parent2Genotype);

  const gametes1 = generateGametes(genotype1);
  const gametes2 = generateGametes(genotype2);

  // Expandir a 2 gametos si es homocigoto
  const expandedGametes1 = gametes1.length === 1 ? [gametes1[0], gametes1[0]] : gametes1;
  const expandedGametes2 = gametes2.length === 1 ? [gametes2[0], gametes2[0]] : gametes2;

  const cells: PunnettCell[] = [];
  const genotypeCount: Record<string, number> = {};
  const phenotypeCount: Record<string, { count: number; color: string; icon: string }> = {};

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const gamete1 = expandedGametes1[col];
      const gamete2 = expandedGametes2[row];
      const rawGenotype = `${gamete1}${gamete2}`;
      const genotype = normalizeGenotype(rawGenotype, trait);
      const phenotypeInfo = determinePhenotype(genotype, trait);

      cells.push({
        row,
        col,
        gamete1,
        gamete2,
        genotype,
        phenotype: phenotypeInfo.name,
        phenotypeColor: phenotypeInfo.color,
        phenotypeIcon: phenotypeInfo.icon,
        probability: 0.25,
      });

      // Contar genotipos
      genotypeCount[genotype] = (genotypeCount[genotype] || 0) + 1;

      // Contar fenotipos
      if (!phenotypeCount[phenotypeInfo.name]) {
        phenotypeCount[phenotypeInfo.name] = {
          count: 0,
          color: phenotypeInfo.color,
          icon: phenotypeInfo.icon,
        };
      }
      phenotypeCount[phenotypeInfo.name].count += 1;
    }
  }

  // Convertir conteos a ratios (de 4)
  const genotypeRatios: Record<string, number> = {};
  for (const [genotype, count] of Object.entries(genotypeCount)) {
    genotypeRatios[genotype] = count / 4;
  }

  const phenotypeRatios: Record<string, { count: number; color: string; icon: string }> = {};
  for (const [phenotype, data] of Object.entries(phenotypeCount)) {
    phenotypeRatios[phenotype] = {
      count: data.count / 4,
      color: data.color,
      icon: data.icon,
    };
  }

  return {
    cells,
    gametes1: expandedGametes1,
    gametes2: expandedGametes2,
    genotypeRatios,
    phenotypeRatios,
    size: 2,
  };
}

// Generar cuadro de Punnett para cruce dihíbrido
export function generateDihybridPunnett(
  parent1Genotype1: string,
  parent1Genotype2: string,
  parent2Genotype1: string,
  parent2Genotype2: string,
  trait1: Trait,
  trait2: Trait
): PunnettResult {
  const genotype1a = parseGenotype(parent1Genotype1);
  const genotype1b = parseGenotype(parent1Genotype2);
  const genotype2a = parseGenotype(parent2Genotype1);
  const genotype2b = parseGenotype(parent2Genotype2);

  const gametes1 = generateDihybridGametes(genotype1a, genotype1b);
  const gametes2 = generateDihybridGametes(genotype2a, genotype2b);

  // Expandir a 4 gametos
  const expandedGametes1 = expandGametes(gametes1, 4);
  const expandedGametes2 = expandGametes(gametes2, 4);

  const cells: PunnettCell[] = [];
  const genotypeCount: Record<string, number> = {};
  const phenotypeCount: Record<string, { count: number; color: string; icon: string }> = {};

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const gamete1 = expandedGametes1[col];
      const gamete2 = expandedGametes2[row];

      // Combinar gametos para obtener genotipo dihíbrido
      const allele1a = gamete1[0];
      const allele1b = gamete1[1];
      const allele2a = gamete2[0];
      const allele2b = gamete2[1];

      const genotypePart1 = normalizeGenotype(`${allele1a}${allele2a}`, trait1);
      const genotypePart2 = normalizeGenotype(`${allele1b}${allele2b}`, trait2);
      const fullGenotype = `${genotypePart1} ${genotypePart2}`;

      const phenotype1 = determinePhenotype(genotypePart1, trait1);
      const phenotype2 = determinePhenotype(genotypePart2, trait2);
      const combinedPhenotype = `${phenotype1.name} / ${phenotype2.name}`;

      cells.push({
        row,
        col,
        gamete1,
        gamete2,
        genotype: fullGenotype,
        phenotype: combinedPhenotype,
        phenotypeColor: phenotype1.color, // Color del primer rasgo
        phenotypeIcon: `${phenotype1.icon}${phenotype2.icon}`,
        probability: 1 / 16,
      });

      // Contar genotipos
      genotypeCount[fullGenotype] = (genotypeCount[fullGenotype] || 0) + 1;

      // Contar fenotipos
      if (!phenotypeCount[combinedPhenotype]) {
        phenotypeCount[combinedPhenotype] = {
          count: 0,
          color: phenotype1.color,
          icon: `${phenotype1.icon}${phenotype2.icon}`,
        };
      }
      phenotypeCount[combinedPhenotype].count += 1;
    }
  }

  // Convertir conteos a ratios (de 16)
  const genotypeRatios: Record<string, number> = {};
  for (const [genotype, count] of Object.entries(genotypeCount)) {
    genotypeRatios[genotype] = count / 16;
  }

  const phenotypeRatios: Record<string, { count: number; color: string; icon: string }> = {};
  for (const [phenotype, data] of Object.entries(phenotypeCount)) {
    phenotypeRatios[phenotype] = {
      count: data.count / 16,
      color: data.color,
      icon: data.icon,
    };
  }

  return {
    cells,
    gametes1: expandedGametes1,
    gametes2: expandedGametes2,
    genotypeRatios,
    phenotypeRatios,
    size: 4,
  };
}

// Expandir gametos a un tamaño específico
function expandGametes(gametes: string[], targetSize: number): string[] {
  if (gametes.length === targetSize) return gametes;

  const result: string[] = [];
  const repetitions = targetSize / gametes.length;

  for (const gamete of gametes) {
    for (let i = 0; i < repetitions; i++) {
      result.push(gamete);
    }
  }

  return result;
}

// Generar cuadro de Punnett para herencia ligada al sexo
export function generateSexLinkedPunnett(
  parent1Genotype: string,
  parent2Genotype: string,
  trait: Trait,
  parent1Sex: Sex,
  parent2Sex: Sex
): PunnettResult {
  const gametes1 = generateSexLinkedGametes(parent1Genotype, parent1Sex);
  const gametes2 = generateSexLinkedGametes(parent2Genotype, parent2Sex);

  // Para herencia ligada al sexo, el padre (XY) aporta X o Y
  // La madre (XX) aporta uno de sus X

  const cells: PunnettCell[] = [];
  const genotypeCount: Record<string, number> = {};
  const phenotypeCount: Record<string, { count: number; color: string; icon: string }> = {};

  // Determinar quién es macho y quién es hembra
  let maleGametes: string[];
  let femaleGametes: string[];

  if (parent1Sex === 'male') {
    maleGametes = gametes1;
    femaleGametes = gametes2;
  } else {
    maleGametes = gametes2;
    femaleGametes = gametes1;
  }

  // Expandir gametos a 2
  const expandedMaleGametes = maleGametes.length === 1 ? [maleGametes[0], maleGametes[0]] : maleGametes;
  const expandedFemaleGametes = femaleGametes.length === 1 ? [femaleGametes[0], femaleGametes[0]] : femaleGametes;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const maleGamete = expandedMaleGametes[col];
      const femaleGamete = expandedFemaleGametes[row];

      let genotype: string;
      let offspringSex: Sex;

      if (maleGamete === 'Y' || maleGamete.includes('Y')) {
        // Hijo macho
        genotype = `${femaleGamete} Y`;
        offspringSex = 'male';
      } else {
        // Hija hembra
        genotype = `${femaleGamete} ${maleGamete}`;
        offspringSex = 'female';
      }

      const phenotypeInfo = determineSexLinkedPhenotype(genotype, trait, offspringSex);

      cells.push({
        row,
        col,
        gamete1: parent1Sex === 'male' ? maleGamete : femaleGamete,
        gamete2: parent1Sex === 'male' ? femaleGamete : maleGamete,
        genotype,
        phenotype: `${phenotypeInfo.name} (${offspringSex === 'male' ? '♂' : '♀'})`,
        phenotypeColor: phenotypeInfo.color,
        phenotypeIcon: phenotypeInfo.icon,
        probability: 0.25,
      });

      // Contar genotipos
      genotypeCount[genotype] = (genotypeCount[genotype] || 0) + 1;

      // Contar fenotipos
      const phenoKey = `${phenotypeInfo.name} (${offspringSex === 'male' ? '♂' : '♀'})`;
      if (!phenotypeCount[phenoKey]) {
        phenotypeCount[phenoKey] = {
          count: 0,
          color: phenotypeInfo.color,
          icon: phenotypeInfo.icon,
        };
      }
      phenotypeCount[phenoKey].count += 1;
    }
  }

  // Convertir conteos a ratios
  const genotypeRatios: Record<string, number> = {};
  for (const [genotype, count] of Object.entries(genotypeCount)) {
    genotypeRatios[genotype] = count / 4;
  }

  const phenotypeRatios: Record<string, { count: number; color: string; icon: string }> = {};
  for (const [phenotype, data] of Object.entries(phenotypeCount)) {
    phenotypeRatios[phenotype] = {
      count: data.count / 4,
      color: data.color,
      icon: data.icon,
    };
  }

  return {
    cells,
    gametes1: parent1Sex === 'male' ? expandedMaleGametes : expandedFemaleGametes,
    gametes2: parent1Sex === 'male' ? expandedFemaleGametes : expandedMaleGametes,
    genotypeRatios,
    phenotypeRatios,
    size: 2,
  };
}

// Determinar fenotipo para herencia ligada al sexo
function determineSexLinkedPhenotype(
  genotype: string,
  trait: Trait,
  sex: Sex
): { name: string; color: string; icon: string } {
  const d = trait.alleles.dominant.symbol;
  const r = trait.alleles.recessive.symbol;

  // Verificar si tiene al menos un alelo dominante
  const hasDominant = genotype.includes(`X${d}`);
  const hasRecessive = genotype.includes(`X${r}`);

  if (sex === 'female') {
    // Hembra: necesita ser homocigota recesiva para mostrar fenotipo recesivo
    if (!hasDominant && hasRecessive) {
      // Xr Xr
      const recessive = trait.phenotypes.find((p) =>
        p.genotypes.some((g) => g.includes(`X${r} X${r}`) || g.includes(`X${r}X${r}`))
      );
      if (recessive) {
        return { name: recessive.name, color: recessive.color, icon: recessive.icon };
      }
    }
    // Dominante o portadora
    const dominant = trait.phenotypes.find((p) =>
      p.genotypes.some((g) => g.includes(`X${d}`))
    );
    if (dominant) {
      return { name: dominant.name, color: dominant.color, icon: dominant.icon };
    }
  } else {
    // Macho: solo tiene un X, así que muestra el fenotipo de ese alelo
    if (hasRecessive && !hasDominant) {
      const recessive = trait.phenotypes.find((p) =>
        p.genotypes.some((g) => g.includes(`X${r} Y`) || g.includes(`X${r}Y`))
      );
      if (recessive) {
        return { name: recessive.name, color: recessive.color, icon: recessive.icon };
      }
    }
    const dominant = trait.phenotypes.find((p) =>
      p.genotypes.some((g) => g.includes(`X${d} Y`) || g.includes(`X${d}Y`))
    );
    if (dominant) {
      return { name: dominant.name, color: dominant.color, icon: dominant.icon };
    }
  }

  return { name: 'Desconocido', color: '#9CA3AF', icon: '❓' };
}

// Crear individuo a partir de genotipo
export function createIndividual(
  id: string,
  sex: Sex,
  genotypeStr: string,
  trait: Trait
): Individual {
  const phenotypeInfo = trait.inheritanceMode === 'sex-linked'
    ? determineSexLinkedPhenotype(genotypeStr, trait, sex)
    : determinePhenotype(genotypeStr, trait);

  return {
    id,
    sex,
    genotype: parseGenotype(genotypeStr.replace(/\s/g, '').substring(0, 2)),
    phenotype: phenotypeInfo.name,
    phenotypeColor: phenotypeInfo.color,
    phenotypeIcon: phenotypeInfo.icon,
  };
}

// Realizar cruce completo
export function performCross(
  parent1Genotype: string,
  parent2Genotype: string,
  trait: Trait,
  parent1Sex: Sex = 'male',
  parent2Sex: Sex = 'female',
  populationSize: number = 0
): CrossResult {
  const parent1 = createIndividual('parent1', parent1Sex, parent1Genotype, trait);
  const parent2 = createIndividual('parent2', parent2Sex, parent2Genotype, trait);

  let punnett: PunnettResult;

  if (trait.inheritanceMode === 'sex-linked') {
    punnett = generateSexLinkedPunnett(
      parent1Genotype,
      parent2Genotype,
      trait,
      parent1Sex,
      parent2Sex
    );
  } else {
    punnett = generateMonohybridPunnett(parent1Genotype, parent2Genotype, trait);
  }

  // Agrupar offspring por genotipo
  const offspringMap = new Map<string, OffspringResult>();

  for (const cell of punnett.cells) {
    const key = `${cell.genotype}-${cell.phenotype}`;
    if (offspringMap.has(key)) {
      const existing = offspringMap.get(key)!;
      existing.probability += cell.probability;
      existing.count += 1;
    } else {
      offspringMap.set(key, {
        genotype: cell.genotype,
        phenotype: cell.phenotype,
        phenotypeColor: cell.phenotypeColor,
        phenotypeIcon: cell.phenotypeIcon,
        probability: cell.probability,
        count: 1,
      });
    }
  }

  // Si hay tamaño de población, simular
  const offspring = Array.from(offspringMap.values());

  if (populationSize > 0) {
    // Ajustar conteos basados en simulación
    let remaining = populationSize;
    for (const off of offspring) {
      off.count = Math.round(off.probability * populationSize);
      remaining -= off.count;
    }
    // Distribuir residuo
    if (remaining > 0 && offspring.length > 0) {
      offspring[0].count += remaining;
    }
  }

  return {
    parent1,
    parent2,
    punnett,
    offspring,
    totalOffspring: populationSize || 4,
  };
}
