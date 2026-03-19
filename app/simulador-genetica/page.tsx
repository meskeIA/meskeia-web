'use client';

import { useState, useEffect } from 'react';
import styles from './SimuladorGenetica.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
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

      <DisclaimerCard
        variant="educational"
        severity="medium"
        collapsible={true}
        context="simulador-genetica-disclaimer"
      />

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

        {/* ── TABLA COMPARATIVA ─────────────────────────────────────── */}
        <div className={styles.comparativaSection}>
          <h2>⚖️ Comparativa: Tipos de Herencia Genética</h2>
          <p className={styles.comparativaSubtitle}>
            Los cuatro modos de herencia que incluye el simulador y sus diferencias clave
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Dominancia Completa</th>
                  <th>Dominancia Incompleta</th>
                  <th>Codominancia</th>
                  <th>Ligada al sexo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Fenotipo F1 (heterocigoto)</strong></td>
                  <td>Igual al dominante (Aa = AA)</td>
                  <td>Fenotipo intermedio (Rr = rosa)</td>
                  <td>Ambos rasgos visibles (AB)</td>
                  <td>Diferente en ♂ y ♀</td>
                </tr>
                <tr>
                  <td><strong>Ratio fenotípico F2</strong></td>
                  <td>3 : 1</td>
                  <td>1 : 2 : 1</td>
                  <td>1 : 2 : 1</td>
                  <td>Varía según el sexo del cruce</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo clásico</strong></td>
                  <td>Color flor guisante (P/p)</td>
                  <td>Boca de dragón rojo × blanco</td>
                  <td>Grupos sanguíneos ABO (I^A/I^B)</td>
                  <td>Daltonismo (X^R/X^r), hemofilia</td>
                </tr>
                <tr>
                  <td><strong>Portadores detectables</strong></td>
                  <td>❌ No (igual que dominante)</td>
                  <td>✅ Sí (fenotipo intermedio)</td>
                  <td>✅ Sí (ambos rasgos visibles)</td>
                  <td>✅ Hembras portadoras (X^R X^r)</td>
                </tr>
                <tr>
                  <td><strong>Afecta igual a ambos sexos</strong></td>
                  <td>✅ Sí</td>
                  <td>✅ Sí</td>
                  <td>✅ Sí</td>
                  <td>❌ No (más frecuente en ♂)</td>
                </tr>
                <tr>
                  <td><strong>Frecuencia en exámenes de Bio</strong></td>
                  <td>⭐⭐⭐ Muy habitual</td>
                  <td>⭐⭐ Habitual</td>
                  <td>⭐⭐ Habitual</td>
                  <td>⭐⭐⭐ Muy habitual</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CASOS DE USO ──────────────────────────────────────────── */}
        <div className={styles.escenariosSection}>
          <h2>💼 Casos de Uso Prácticos</h2>
          <p className={styles.escenariosSubtitle}>
            Cómo sacar el máximo partido al simulador según tu perfil
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h3>Estudiante de ESO y Bachillerato</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Ejemplo de ejercicio:</p>
                <code>
                  {`Mujer portadora (X^R X^r) × hombre daltónico (X^r Y)
→ ¿Probabilidad de hija daltónica?
→ Respuesta: 25% (1 de cada 4 hijos)`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Selecciona &quot;Herencia ligada al sexo&quot;,
                elige los genotipos y el cuadro de Punnett se construye automáticamente.
                La pestaña Estadísticas muestra los porcentajes exactos que pide el examen.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔬</span>
                <h3>Universitario de Biología o Medicina</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Ejemplo de análisis clínico:</p>
                <code>
                  {`Padres portadores de fibrosis quística (Aa × Aa)
→ 25% afectados, 50% portadores, 25% libres
→ Árbol genealógico con 3 generaciones`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> La pestaña Pedigree genera árboles
                genealógicos visuales con símbolos estándar (cuadrado = ♂, círculo = ♀,
                relleno = afectado). Ideal para prácticas de asesoramiento genético.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🐕</span>
                <h3>Criador de animales o plantas</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Planificación de cruces selectivos:</p>
                <code>
                  {`Objetivo: maximizar descendencia de pelo liso
Cruce AA (liso) × aa (rizado) → todos Aa (liso)
Cruce Aa × Aa → 75% liso, 25% rizado
→ Simular 100 individuos en pestaña Población`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> La pestaña Población simula hasta
                1.000 individuos y muestra la distribución real frente a la teórica.
                El test chi-cuadrado verifica si los resultados son estadísticamente esperables.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏥</span>
                <h3>Asesoramiento genético familiar</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Cálculo de riesgo hereditario:</p>
                <code>
                  {`Abuelo daltónico → hija portadora (no afectada)
Hija portadora × marido sano:
→ 50% hijos varones daltónicos
→ 50% hijas portadoras`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Simula cada generación por separado
                y observa cómo una característica recesiva &quot;desaparece&quot; en F1 y
                reaparece en F2 o en varones, como ocurre con el daltonismo en familias reales.
              </p>
            </div>
          </div>
        </div>

        {/* ── FAQ AMPLIADO ──────────────────────────────────────────── */}
        <div className={styles.faqSection}>
          <h2>❓ Preguntas Frecuentes sobre Genética Mendeliana</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué en algunos cruces no obtengo la proporción 3:1?</h4>
              <p>
                La proporción 3:1 es exclusiva del cruce monohíbrido entre dos heterocigotos
                (Aa × Aa) con dominancia completa. Si usas dominancia incompleta o codominancia,
                el ratio fenotípico será 1:2:1 porque el heterocigoto muestra un fenotipo
                diferente. En cruces dihíbridos, la proporción esperada es 9:3:3:1.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Tip:</strong> Siempre identifica primero el modo de herencia antes
                de calcular proporciones. El simulador lo indica junto a cada característica.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia exacta hay entre dominancia incompleta y codominancia?</h4>
              <p>
                En <strong>dominancia incompleta</strong>, los dos alelos &quot;se mezclan&quot;
                produciendo un fenotipo intermedio (rojo + blanco = rosa). En
                <strong> codominancia</strong>, ambos alelos se expresan de forma completa y
                simultánea: el individuo AB del grupo sanguíneo tiene antígenos A y B en
                sus glóbulos rojos, no un antígeno &quot;intermedio&quot;.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla mnemotécnica:</strong> Incompleta = mezcla de pintura.
                Codominancia = mezcla de manchas (cada color se mantiene intacto).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué es un individuo portador y cómo se identifica?</h4>
              <p>
                Un portador es un individuo heterocigoto (Aa) que <strong>no muestra</strong> el
                fenotipo recesivo pero puede transmitirlo a su descendencia. En herencia autosómica,
                el portador es fenotípicamente igual al homocigoto dominante. En herencia ligada
                al sexo, las mujeres X^R X^r son portadoras: no están afectadas pero el 50% de
                sus hijos varones lo estarán.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>En el simulador:</strong> Los portadores aparecen marcados con
                sombreado parcial en el árbol genealógico (Pedigree), siguiendo el estándar
                clínico internacional.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Para qué sirve el cruce prueba (test cross)?</h4>
              <p>
                El cruce prueba consiste en cruzar un individuo de fenotipo dominante
                con genotipo desconocido (A?) con un homocigoto recesivo (aa). Si toda
                la descendencia muestra fenotipo dominante → el individuo era AA. Si
                aparece un 50% de recesivos → era Aa (portador). Es la herramienta
                clásica de Mendel para determinar genotipos ocultos.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Cómo probarlo:</strong> Selecciona un organismo y cruza
                Aa × aa en el simulador para ver el resultado 1:1 en acción.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo no se cumple la 3ª Ley de Mendel?</h4>
              <p>
                La ley de transmisión independiente solo aplica cuando los dos genes
                estudiados están en <strong>cromosomas diferentes</strong> o muy alejados
                en el mismo cromosoma. Si los genes están en el mismo cromosoma y cerca
                (genes ligados), se transmiten juntos más frecuentemente de lo esperado
                y la proporción 9:3:3:1 no se cumple. La frecuencia de recombinación
                mide el grado de ligamiento.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Por qué el daltonismo afecta mucho más a los hombres?</h4>
              <p>
                El gen del daltonismo está en el cromosoma X. Los hombres (XY) solo
                tienen un cromosoma X, por lo que un único alelo recesivo (X^r Y) es
                suficiente para ser daltónico (prevalencia: ~8% de hombres). Las mujeres
                (XX) necesitan dos alelos recesivos (X^r X^r) para ser daltónicas, lo
                que ocurre solo en el ~0,4% de los casos. Las mujeres con un solo alelo
                recesivo (X^R X^r) son portadoras sanas.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué mide el test chi-cuadrado en la pestaña Población?</h4>
              <p>
                El chi-cuadrado (χ²) compara las proporciones observadas en la simulación
                con las esperadas según la teoría mendeliana. Un valor χ² bajo (p &gt; 0,05)
                indica que las diferencias son atribuibles al azar y los resultados
                son <strong>compatibles con las leyes de Mendel</strong>. Un valor alto
                (p &lt; 0,05) sugiere que algo no encaja con la herencia simple (ligamiento,
                selección, muestra pequeña).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Regla práctica:</strong> Con muestras pequeñas (&lt;30 individuos)
                el χ² es poco fiable. Aumenta la población a 200-500 individuos para
                resultados más robustos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Puedo usar este simulador para aprender genética de poblaciones?</h4>
              <p>
                Sí, de forma básica. La pestaña Población implementa distribución
                binomial para simular el azar de la meiosis en una muestra. No modela
                deriva genética, selección natural ni mutación (que requieren el
                principio de Hardy-Weinberg), pero sirve perfectamente para visualizar
                por qué las proporciones mendelianas son probabilísticas y cómo se
                aproximan a las teóricas con muestras grandes.
              </p>
            </div>
          </div>
        </div>

        {/* ── GUÍA PASO A PASO ──────────────────────────────────────── */}
        <div className={styles.stepGuideSection}>
          <h2>📋 Cómo Resolver un Problema de Genética: 7 Pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Lee el enunciado e identifica el tipo de herencia</h4>
                <p>
                  Busca palabras clave: &quot;portador&quot; indica heterocigoto, &quot;afectado&quot;
                  indica homocigoto recesivo, &quot;ligado al sexo&quot; o &quot;más frecuente en
                  hombres&quot; indica herencia ligada al X. Si el fenotipo F1 es intermedio,
                  es dominancia incompleta.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Asigna símbolos a los alelos</h4>
                <p>
                  Elige una letra y usa mayúscula para el dominante (A) y minúscula para
                  el recesivo (a). En herencia ligada al sexo añade el cromosoma: X^A, X^a, Y.
                  <strong> Convenio universal:</strong> el alelo dominante siempre va primero (Aa, no aA).
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Determina los genotipos de los progenitores</h4>
                <p>
                  Fenotipo dominante sin información adicional → genotipo incierto (A?).
                  Usa el contexto: si tiene hijos recesivos, debe ser heterocigoto (Aa).
                  Un individuo afectado por una enfermedad recesiva siempre es homocigoto (aa).
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Construye el cuadro de Punnett</h4>
                <p>
                  Coloca los gametos del progenitor 1 en las filas y los del progenitor 2
                  en las columnas. En monohíbrido, cada progenitor Aa produce 2 tipos de
                  gametos (A y a). En dihíbrido AaBb produce 4 (AB, Ab, aB, ab). El simulador
                  hace esto automáticamente en la pestaña Punnett.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Lee las proporciones genotípicas</h4>
                <p>
                  Cuenta cuántas veces aparece cada genotipo en las celdas del Punnett.
                  Ejemplo: Aa × Aa → 1 AA : 2 Aa : 1 aa (proporciones 1/4, 1/2, 1/4).
                  La pestaña Estadísticas del simulador hace este recuento automáticamente.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Convierte a proporciones fenotípicas</h4>
                <p>
                  Agrupa los genotipos por fenotipo según el modo de herencia. En dominancia
                  completa, AA y Aa tienen el mismo fenotipo → 3 dominantes : 1 recesivo.
                  En dominancia incompleta, cada genotipo tiene su propio fenotipo → 1:2:1.
                </p>
              </div>
            </div>
            <div className={styles.stepItem}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Responde la pregunta concreta del enunciado</h4>
                <p>
                  Si pide probabilidad, expresa en fracción o porcentaje (1/4 = 25%). Si pide
                  &quot;¿cuántos de 80 hijos?&quot;, multiplica la probabilidad por el total
                  (0,25 × 80 = 20 individuos afectados). Si pide el fenotipo, nombra el rasgo
                  observado, no el genotipo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── MEJORES PRÁCTICAS ─────────────────────────────────────── */}
        <div className={styles.tipsSection}>
          <h2>✅ Mejores Prácticas para Estudiar Genética</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔤</span>
              <h4>Convención de letras siempre consistente</h4>
              <p>
                Usa la misma letra para ambos alelos de un rasgo (Aa, no AB).
                Reserva letras distintas para rasgos distintos en dihíbridos (AaBb).
                El orden importa: dominante primero.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <h4>Dibuja el Punnett aunque parezca obvio</h4>
              <p>
                El 70% de errores en exámenes de genética ocurren por calcular
                mentalmente sin cuadro. Con el Punnett visible, los errores de
                gametos y combinaciones se eliminan.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔗</span>
              <h4>Verifica independencia antes del dihíbrido</h4>
              <p>
                La proporción 9:3:3:1 solo vale si los genes están en cromosomas
                distintos. Si el enunciado no lo especifica, asume independencia
                pero anótalo como supuesto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>♀♂</span>
              <h4>En ligada al sexo, sigue el cromosoma X</h4>
              <p>
                El padre pasa su X solo a las hijas y su Y solo a los hijos.
                Nunca hay transmisión padre-hijo de rasgos ligados al X. Esta
                regla elimina el 90% de los errores en estos problemas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✖️</span>
              <h4>Multiplica probabilidades en cruces independientes</h4>
              <p>
                En dihíbridos, la probabilidad de un genotipo combinado es el
                producto de las individuales. P(AABB) = P(AA) × P(BB) = 1/4 × 1/4
                = 1/16. Nunca sumes en este caso.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🧪</span>
              <h4>Usa el cruce prueba para genotipos inciertos</h4>
              <p>
                Si no sabes si un individuo de fenotipo dominante es AA o Aa,
                crúzalo con aa. Si aparecen descendientes recesivos, es Aa.
                Si todos son dominantes, es probable que sea AA.
              </p>
            </div>
          </div>
        </div>

        {/* ── WARNING BOX ───────────────────────────────────────────── */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores Comunes que Hacen Fallar los Problemas de Genética</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ Confundir ratio fenotípico con genotípico:</strong> En dominancia
              completa Aa × Aa, el ratio genotípico es 1:2:1 pero el fenotípico es 3:1.
              El enunciado siempre pide uno de los dos; leerlo bien evita este error.
            </li>
            <li>
              <strong>❌ Olvidar que &quot;portador&quot; significa heterocigoto asintomático:</strong>{' '}
              Un portador (Aa) tiene fenotipo dominante. Si el enunciado dice &quot;portador&quot;,
              el genotipo es Aa, no aa. Este error se comete en el 40% de los exámenes de selectividad.
            </li>
            <li>
              <strong>❌ Aplicar la 3ª Ley a genes ligados:</strong> Si dos características
              siempre van juntas en una familia, sospecha que los genes están en el mismo
              cromosoma. En ese caso, la proporción dihíbrida 9:3:3:1 no se cumplirá.
            </li>
            <li>
              <strong>❌ Creer que padre daltónico transmite la enfermedad a sus hijos varones:</strong>{' '}
              El padre pasa el cromosoma Y a sus hijos varones, no el X. El daltonismo
              paterno pasa a las hijas (portadoras), no a los hijos. El &quot;abuelo saltado&quot;
              es un patrón clásico de herencia ligada al X.
            </li>
            <li>
              <strong>❌ Confundir dominancia incompleta con codominancia:</strong> En
              dominancia incompleta hay un solo fenotipo intermedio (rosa). En codominancia
              hay dos fenotipos simultáneos en el mismo individuo (tipo AB: antígenos A y B).
              No son intercambiables.
            </li>
            <li>
              <strong>❌ Sacar conclusiones de muestras pequeñas:</strong> Con 4 o 8
              descendientes, las proporciones reales pueden alejarse mucho de las teóricas
              por azar. La proporción 3:1 de Mendel emerge estadísticamente en muestras
              de 100+ individuos. El test chi-cuadrado lo confirma.
            </li>
          </ul>
        </div>
      </EducationalSection>

      {/* Apps Relacionadas */}
      <RelatedApps apps={getRelatedApps('simulador-genetica')} />

      <ShareCard appName="simulador-genetica" />
      <Footer appName="simulador-genetica" />
    </div>
  );
}
