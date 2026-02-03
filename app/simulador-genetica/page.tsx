'use client';

import { useState, useEffect } from 'react';
import styles from './SimuladorGenetica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  useGeneticSimulation,
  PunnettSquare,
  StatisticsPanel,
  PopulationSimulator,
  PedigreeChart,
  getPossibleGenotypes,
  getSexLinkedGenotypes,
} from './components';

type TabType = 'punnett' | 'stats' | 'population' | 'pedigree';

export default function SimuladorGeneticaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('punnett');

  const {
    // Estado
    selectedOrganism,
    selectedTrait1,
    selectedTrait2,
    crossType,
    parent1Genotype,
    parent2Genotype,
    parent1Genotype2,
    parent2Genotype2,
    parent1Sex,
    parent2Sex,
    punnettResult,
    populationSimulation,
    pedigreeChart,
    animationState,
    animationStep,
    populationSize,

    // Acciones
    setSelectedOrganism,
    setSelectedTrait1,
    setSelectedTrait2,
    setCrossType,
    setParent1Genotype,
    setParent2Genotype,
    setParent1Genotype2,
    setParent2Genotype2,
    performCrossing,
    runPopulationSimulation,
    generatePedigree,
    setPopulationSize,
    startAnimation,
    nextAnimationStep,
    resetAnimation,
    getPossibleGenotypesForTrait,
    organisms,
  } = useGeneticSimulation();

  // Realizar cruce automáticamente cuando cambian los genotipos
  useEffect(() => {
    performCrossing();
  }, [parent1Genotype, parent2Genotype, selectedTrait1, performCrossing]);

  // Obtener fenotipos para preview
  const getPhentypeForGenotype = (genotype: string, sex: 'male' | 'female') => {
    const trait = selectedTrait1;
    if (!trait) return { name: '', icon: '' };

    if (trait.inheritanceMode === 'sex-linked') {
      const d = trait.alleles.dominant.symbol;
      const r = trait.alleles.recessive.symbol;

      if (sex === 'male') {
        if (genotype.includes(`X${r}`) && !genotype.includes(`X${d}`)) {
          const recessive = trait.phenotypes.find((p) =>
            p.genotypes.some((g) => g.includes(`X${r} Y`))
          );
          return recessive || { name: 'Desconocido', icon: '❓' };
        }
      } else {
        if (genotype.includes(`X${r} X${r}`) || genotype === `X${r}X${r}`) {
          const recessive = trait.phenotypes.find((p) =>
            p.genotypes.some((g) => g.includes(`X${r} X${r}`))
          );
          return recessive || { name: 'Desconocido', icon: '❓' };
        }
      }

      const dominant = trait.phenotypes.find((p) =>
        p.genotypes.some((g) => g.includes(`X${d}`))
      );
      return dominant || { name: 'Desconocido', icon: '❓' };
    }

    // Herencia normal
    for (const phenotype of trait.phenotypes) {
      if (phenotype.genotypes.includes(genotype)) {
        return phenotype;
      }
    }

    // Verificar normalizado
    const d = trait.alleles.dominant.symbol;
    const r = trait.alleles.recessive.symbol;
    const normalized =
      genotype === `${r}${d}` ? `${d}${r}` : genotype;

    for (const phenotype of trait.phenotypes) {
      if (phenotype.genotypes.includes(normalized)) {
        return phenotype;
      }
    }

    return { name: 'Desconocido', icon: '❓' };
  };

  const parent1Phenotype = getPhentypeForGenotype(parent1Genotype, parent1Sex);
  const parent2Phenotype = getPhentypeForGenotype(parent2Genotype, parent2Sex);

  const isSexLinked = selectedTrait1.inheritanceMode === 'sex-linked';

  // Genotipos disponibles
  const parent1Genotypes = isSexLinked
    ? getSexLinkedGenotypes(selectedTrait1, parent1Sex)
    : getPossibleGenotypes(selectedTrait1);

  const parent2Genotypes = isSexLinked
    ? getSexLinkedGenotypes(selectedTrait1, parent2Sex)
    : getPossibleGenotypes(selectedTrait1);

  // Rasgos disponibles para dihíbrido (sin los ligados al sexo)
  const availableTraitsForDihybrid = selectedOrganism.traits.filter(
    (t) => t.id !== selectedTrait1.id && t.inheritanceMode !== 'sex-linked'
  );

  const canDoDihybrid = availableTraitsForDihybrid.length > 0 && !isSexLinked;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🧬</span>
        <h1 className={styles.title}>Simulador de Genética Mendeliana</h1>
        <p className={styles.subtitle}>
          Visualiza cruces genéticos, cuadros de Punnett y herencia paso a paso
        </p>
      </header>

      <LegalNotice />

      {/* Selector de Organismo */}
      <div className={styles.organismSelector}>
        {organisms.map((organism) => (
          <button
            key={organism.id}
            className={`${styles.organismButton} ${
              selectedOrganism.id === organism.id ? styles.active : ''
            }`}
            onClick={() => setSelectedOrganism(organism.id)}
          >
            <span className={styles.organismIcon}>{organism.icon}</span>
            <span className={styles.organismName}>{organism.name}</span>
          </button>
        ))}
      </div>

      {/* Contenido Principal */}
      <div className={styles.mainContent}>
        {/* Panel de Configuración */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <span className={styles.panelIcon}>⚙️</span>
              Configuración del Cruce
            </h2>
          </div>

          <div className={styles.crossConfig}>
            {/* Tipo de cruce */}
            {canDoDihybrid && (
              <div className={styles.crossTypeToggle}>
                <button
                  className={`${styles.crossTypeBtn} ${
                    crossType === 'monohybrid' ? styles.active : ''
                  }`}
                  onClick={() => setCrossType('monohybrid')}
                >
                  Monohíbrido
                </button>
                <button
                  className={`${styles.crossTypeBtn} ${
                    crossType === 'dihybrid' ? styles.active : ''
                  }`}
                  onClick={() => setCrossType('dihybrid')}
                >
                  Dihíbrido
                </button>
              </div>
            )}

            {/* Selector de rasgo 1 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {crossType === 'dihybrid' ? 'Característica 1:' : 'Característica:'}
              </label>
              <select
                className={styles.select}
                value={selectedTrait1.id}
                onChange={(e) => setSelectedTrait1(e.target.value)}
              >
                {selectedOrganism.traits.map((trait) => (
                  <option key={trait.id} value={trait.id}>
                    {trait.name}
                  </option>
                ))}
              </select>
              <p className={styles.inheritanceInfo}>
                {selectedTrait1.inheritanceMode === 'sex-linked' && '🔗 Ligada al sexo - '}
                {selectedTrait1.inheritanceMode === 'incomplete' && '🎨 Dominancia incompleta - '}
                {selectedTrait1.description}
              </p>
            </div>

            {/* Selector de rasgo 2 (dihíbrido) */}
            {crossType === 'dihybrid' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Característica 2:</label>
                <select
                  className={styles.select}
                  value={selectedTrait2?.id || ''}
                  onChange={(e) => setSelectedTrait2(e.target.value)}
                >
                  {availableTraitsForDihybrid.map((trait) => (
                    <option key={trait.id} value={trait.id}>
                      {trait.name}
                    </option>
                  ))}
                </select>
                {selectedTrait2 && (
                  <p className={styles.inheritanceInfo}>{selectedTrait2.description}</p>
                )}
              </div>
            )}

            {/* Selectores de Padres */}
            <div className={styles.parentsContainer}>
              {/* Padre 1 */}
              <div className={styles.parentCard}>
                <div className={styles.parentLabel}>
                  <span className={styles.parentSex}>
                    {parent1Sex === 'male' ? '♂' : '♀'}
                  </span>
                  {parent1Sex === 'male' ? 'Padre' : 'Madre'}
                </div>
                <select
                  className={styles.genotypeSelect}
                  value={parent1Genotype}
                  onChange={(e) => setParent1Genotype(e.target.value)}
                >
                  {parent1Genotypes.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <div className={styles.phenotypePreview}>
                  <span className={styles.phenotypeIcon}>{parent1Phenotype.icon}</span>
                  <span className={styles.phenotypeName}>{parent1Phenotype.name}</span>
                </div>
              </div>

              <span className={styles.crossSymbol}>×</span>

              {/* Padre 2 */}
              <div className={styles.parentCard}>
                <div className={styles.parentLabel}>
                  <span className={styles.parentSex}>
                    {parent2Sex === 'male' ? '♂' : '♀'}
                  </span>
                  {parent2Sex === 'male' ? 'Padre' : 'Madre'}
                </div>
                <select
                  className={styles.genotypeSelect}
                  value={parent2Genotype}
                  onChange={(e) => setParent2Genotype(e.target.value)}
                >
                  {parent2Genotypes.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <div className={styles.phenotypePreview}>
                  <span className={styles.phenotypeIcon}>{parent2Phenotype.icon}</span>
                  <span className={styles.phenotypeName}>{parent2Phenotype.name}</span>
                </div>
              </div>
            </div>

            {/* Segundo rasgo para dihíbrido */}
            {crossType === 'dihybrid' && selectedTrait2 && (
              <div className={styles.parentsContainer}>
                <div className={styles.parentCard}>
                  <div className={styles.parentLabel}>Rasgo 2 - Padre</div>
                  <select
                    className={styles.genotypeSelect}
                    value={parent1Genotype2}
                    onChange={(e) => setParent1Genotype2(e.target.value)}
                  >
                    {getPossibleGenotypes(selectedTrait2).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <span className={styles.crossSymbol}>×</span>
                <div className={styles.parentCard}>
                  <div className={styles.parentLabel}>Rasgo 2 - Madre</div>
                  <select
                    className={styles.genotypeSelect}
                    value={parent2Genotype2}
                    onChange={(e) => setParent2Genotype2(e.target.value)}
                  >
                    {getPossibleGenotypes(selectedTrait2).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button className={styles.crossButton} onClick={performCrossing}>
              🧬 Realizar Cruce
            </button>
          </div>
        </div>

        {/* Panel de Resultados */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>
              <span className={styles.panelIcon}>📊</span>
              Resultados
            </h2>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'punnett' ? styles.active : ''}`}
              onClick={() => setActiveTab('punnett')}
            >
              Punnett
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Estadísticas
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'population' ? styles.active : ''}`}
              onClick={() => setActiveTab('population')}
            >
              Población
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'pedigree' ? styles.active : ''}`}
              onClick={() => {
                setActiveTab('pedigree');
                if (!pedigreeChart) generatePedigree();
              }}
            >
              Pedigree
            </button>
          </div>

          {/* Contenido de Tab */}
          {punnettResult ? (
            <>
              {activeTab === 'punnett' && (
                <PunnettSquare
                  punnett={punnettResult}
                  animationState={animationState}
                  animationStep={animationStep}
                  onStartAnimation={startAnimation}
                  onNextStep={nextAnimationStep}
                  onResetAnimation={resetAnimation}
                />
              )}

              {activeTab === 'stats' && (
                <StatisticsPanel punnett={punnettResult} />
              )}

              {activeTab === 'population' && (
                <PopulationSimulator
                  punnett={punnettResult}
                  simulation={populationSimulation}
                  populationSize={populationSize}
                  onSimulate={runPopulationSimulation}
                  onSetSize={setPopulationSize}
                />
              )}

              {activeTab === 'pedigree' && pedigreeChart && (
                <PedigreeChart pedigree={pedigreeChart} />
              )}

              {activeTab === 'pedigree' && !pedigreeChart && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>👨‍👩‍👧‍👦</div>
                  <p className={styles.emptyText}>
                    Generando árbol genealógico...
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🧬</div>
              <p className={styles.emptyText}>
                Configura el cruce y haz clic en &quot;Realizar Cruce&quot;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sección Educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre Genética Mendeliana?"
        subtitle="Descubre los fundamentos de la herencia, las leyes de Mendel y cómo aplicarlas"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>🧬 ¿Quién fue Gregor Mendel?</h2>
          <p>
            Gregor Johann Mendel (1822-1884) fue un monje agustino y científico austriaco,
            considerado el padre de la genética moderna. Realizó experimentos con guisantes
            en el jardín del monasterio donde vivía, descubriendo los patrones fundamentales
            de la herencia biológica.
          </p>
          <p>
            Sus trabajos, publicados en 1866, fueron ignorados durante décadas hasta que
            en 1900 tres científicos independientes redescubrieron sus leyes, dando inicio
            a la genética como ciencia.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>📜 Las Tres Leyes de Mendel</h2>

          <h3>1ª Ley: Uniformidad de los híbridos</h3>
          <p>
            Cuando se cruzan dos individuos de raza pura (homocigotos) para un carácter,
            todos los descendientes de la primera generación (F1) son iguales entre sí y
            muestran el carácter dominante.
          </p>
          <p><strong>Ejemplo:</strong> AA × aa → todos Aa (fenotipo dominante)</p>

          <h3>2ª Ley: Segregación de los alelos</h3>
          <p>
            Durante la formación de gametos, los dos alelos de cada gen se separan, de modo
            que cada gameto recibe solo un alelo. Al cruzar la F1 entre sí, reaparece el
            carácter recesivo en la proporción 3:1.
          </p>
          <p><strong>Ejemplo:</strong> Aa × Aa → 1 AA : 2 Aa : 1 aa (ratio 3:1 fenotípico)</p>

          <h3>3ª Ley: Transmisión independiente</h3>
          <p>
            Los genes de distintos caracteres se transmiten de forma independiente unos de otros.
            En un cruce dihíbrido (AaBb × AaBb), se obtiene la proporción 9:3:3:1.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>🔬 Conceptos Clave</h2>

          <h3>Genotipo vs Fenotipo</h3>
          <ul>
            <li><strong>Genotipo:</strong> La composición genética (ej: Aa, BB, Rr)</li>
            <li><strong>Fenotipo:</strong> La característica observable (ej: ojos marrones, flor púrpura)</li>
          </ul>

          <h3>Dominante vs Recesivo</h3>
          <ul>
            <li><strong>Dominante:</strong> Se expresa aunque solo haya una copia (A)</li>
            <li><strong>Recesivo:</strong> Solo se expresa en homocigosis (aa)</li>
          </ul>

          <h3>Homocigoto vs Heterocigoto</h3>
          <ul>
            <li><strong>Homocigoto:</strong> Dos alelos iguales (AA o aa)</li>
            <li><strong>Heterocigoto:</strong> Dos alelos diferentes (Aa) - también llamado &quot;portador&quot;</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>🎨 Tipos de Herencia</h2>

          <h3>Dominancia completa</h3>
          <p>
            El alelo dominante enmascara completamente al recesivo. El heterocigoto (Aa)
            muestra el mismo fenotipo que el homocigoto dominante (AA).
          </p>

          <h3>Dominancia incompleta</h3>
          <p>
            El heterocigoto muestra un fenotipo intermedio. Por ejemplo, en las flores
            de boca de dragón: rojo (RR) × blanco (rr) = rosa (Rr).
          </p>

          <h3>Codominancia</h3>
          <p>
            Ambos alelos se expresan completamente. Ejemplo: grupos sanguíneos ABO,
            donde el genotipo AB expresa ambos antígenos.
          </p>

          <h3>Herencia ligada al sexo</h3>
          <p>
            Genes ubicados en los cromosomas sexuales (generalmente el X). Los machos (XY)
            solo tienen un alelo, mientras que las hembras (XX) tienen dos. Ejemplos:
            daltonismo, hemofilia.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>🔢 El Cuadro de Punnett</h2>
          <p>
            Herramienta visual para predecir las proporciones de genotipos y fenotipos
            en la descendencia de un cruce. Se colocan los gametos de cada progenitor
            en los ejes y se combinan para obtener los posibles descendientes.
          </p>

          <h3>Interpretación de ratios</h3>
          <ul>
            <li><strong>Monohíbrido Aa × Aa:</strong> 1 AA : 2 Aa : 1 aa → Fenotípico 3:1</li>
            <li><strong>Dihíbrido AaBb × AaBb:</strong> 9:3:3:1</li>
            <li><strong>Cruce prueba Aa × aa:</strong> 1:1 (para determinar genotipo desconocido)</li>
          </ul>
        </section>

        <section className={styles.guideSection}>
          <h2>🏥 Aplicaciones Prácticas</h2>

          <h3>Asesoramiento genético</h3>
          <p>
            Permite calcular probabilidades de heredar enfermedades genéticas y ayudar
            a las familias a tomar decisiones informadas.
          </p>

          <h3>Mejora de cultivos y ganado</h3>
          <p>
            Los principios mendelianos son la base de los programas de selección
            artificial para mejorar características deseables.
          </p>

          <h3>Medicina personalizada</h3>
          <p>
            Entender la genética individual permite tratamientos más precisos y
            predicción de respuestas a medicamentos.
          </p>
        </section>
      </EducationalSection>

      {/* Apps Relacionadas */}
      <RelatedApps apps={getRelatedApps('simulador-genetica')} />

      <Footer appName="simulador-genetica" />
    </div>
  );
}
