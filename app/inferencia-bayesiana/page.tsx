'use client';

import { useState, useMemo } from 'react';
import styles from './InferenciaBayesiana.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TabType = 'simple' | 'multiple' | 'sequential' | 'diagnostic';

interface Hypothesis {
  name: string;
  prior: string;
  likelihood: string;
}

export default function InferenciaBayesianaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simple');

  // Simple Bayes
  const [priorA, setPriorA] = useState('0,01');
  const [likelihoodBA, setLikelihoodBA] = useState('0,9');
  const [likelihoodBNotA, setLikelihoodBNotA] = useState('0,05');

  // Multiple hypotheses
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([
    { name: 'H1', prior: '0,5', likelihood: '0,8' },
    { name: 'H2', prior: '0,3', likelihood: '0,4' },
    { name: 'H3', prior: '0,2', likelihood: '0,1' },
  ]);

  // Sequential updates
  const [seqPrior, setSeqPrior] = useState('0,5');
  const [seqLikelihood, setSeqLikelihood] = useState('0,7');
  const [seqLikelihoodNeg, setSeqLikelihoodNeg] = useState('0,3');
  const [seqObservations, setSeqObservations] = useState<boolean[]>([true, true, false, true]);

  // Diagnostic test
  const [prevalence, setPrevalence] = useState('1');
  const [sensitivity, setSensitivity] = useState('95');
  const [specificity, setSpecificity] = useState('90');

  // Parser
  const parseNum = (s: string): number => {
    return parseFloat(s.replace(',', '.'));
  };

  // Simple Bayes results
  const simpleResults = useMemo(() => {
    const pA = parseNum(priorA);
    const pBA = parseNum(likelihoodBA);
    const pBNotA = parseNum(likelihoodBNotA);

    if (isNaN(pA) || isNaN(pBA) || isNaN(pBNotA)) return null;
    if (pA < 0 || pA > 1 || pBA < 0 || pBA > 1 || pBNotA < 0 || pBNotA > 1) return null;

    const pNotA = 1 - pA;
    const pB = pBA * pA + pBNotA * pNotA;

    if (pB === 0) return null;

    const posterior = (pBA * pA) / pB;
    const likelihoodRatio = pBA / pBNotA;
    const priorOdds = pA / pNotA;
    const posteriorOdds = priorOdds * likelihoodRatio;

    return {
      pA,
      pNotA,
      pBA,
      pBNotA,
      pB,
      posterior,
      posteriorNotA: 1 - posterior,
      likelihoodRatio,
      priorOdds,
      posteriorOdds,
      updateFactor: posterior / pA,
    };
  }, [priorA, likelihoodBA, likelihoodBNotA]);

  // Multiple hypotheses results
  const multipleResults = useMemo(() => {
    const parsed = hypotheses.map(h => ({
      name: h.name,
      prior: parseNum(h.prior),
      likelihood: parseNum(h.likelihood),
    }));

    if (parsed.some(h => isNaN(h.prior) || isNaN(h.likelihood))) return null;
    if (parsed.some(h => h.prior < 0 || h.prior > 1 || h.likelihood < 0 || h.likelihood > 1)) return null;

    const totalPrior = parsed.reduce((sum, h) => sum + h.prior, 0);
    if (Math.abs(totalPrior - 1) > 0.001) return null;

    const pEvidence = parsed.reduce((sum, h) => sum + h.likelihood * h.prior, 0);
    if (pEvidence === 0) return null;

    const results = parsed.map(h => ({
      ...h,
      posterior: (h.likelihood * h.prior) / pEvidence,
      contribution: (h.likelihood * h.prior),
    }));

    return {
      hypotheses: results,
      pEvidence,
      mostLikely: results.reduce((max, h) => h.posterior > max.posterior ? h : max),
    };
  }, [hypotheses]);

  // Sequential update results
  const sequentialResults = useMemo(() => {
    const prior = parseNum(seqPrior);
    const likPos = parseNum(seqLikelihood);
    const likNeg = parseNum(seqLikelihoodNeg);

    if (isNaN(prior) || isNaN(likPos) || isNaN(likNeg)) return null;
    if (prior < 0 || prior > 1 || likPos < 0 || likPos > 1 || likNeg < 0 || likNeg > 1) return null;

    const steps: { observation: boolean; priorBefore: number; posterior: number; likelihoodRatio: number }[] = [];
    let currentPrior = prior;

    for (const obs of seqObservations) {
      const lik = obs ? likPos : (1 - likPos);
      const likNotH = obs ? likNeg : (1 - likNeg);
      const pEvidence = lik * currentPrior + likNotH * (1 - currentPrior);
      const posterior = (lik * currentPrior) / pEvidence;
      const lr = lik / likNotH;

      steps.push({
        observation: obs,
        priorBefore: currentPrior,
        posterior,
        likelihoodRatio: lr,
      });

      currentPrior = posterior;
    }

    return {
      initialPrior: prior,
      steps,
      finalPosterior: steps.length > 0 ? steps[steps.length - 1].posterior : prior,
    };
  }, [seqPrior, seqLikelihood, seqLikelihoodNeg, seqObservations]);

  // Diagnostic test results
  const diagnosticResults = useMemo(() => {
    const prev = parseNum(prevalence) / 100;
    const sens = parseNum(sensitivity) / 100;
    const spec = parseNum(specificity) / 100;

    if (isNaN(prev) || isNaN(sens) || isNaN(spec)) return null;
    if (prev < 0 || prev > 1 || sens < 0 || sens > 1 || spec < 0 || spec > 1) return null;

    const truePositive = sens * prev;
    const falsePositive = (1 - spec) * (1 - prev);
    const trueNegative = spec * (1 - prev);
    const falseNegative = (1 - sens) * prev;

    const pPositive = truePositive + falsePositive;
    const pNegative = trueNegative + falseNegative;

    const ppv = pPositive > 0 ? truePositive / pPositive : 0;
    const npv = pNegative > 0 ? trueNegative / pNegative : 0;

    const positiveLR = sens / (1 - spec);
    const negativeLR = (1 - sens) / spec;

    return {
      prevalence: prev,
      sensitivity: sens,
      specificity: spec,
      truePositive,
      falsePositive,
      trueNegative,
      falseNegative,
      pPositive,
      pNegative,
      ppv,
      npv,
      positiveLR,
      negativeLR,
      accuracy: truePositive + trueNegative,
    };
  }, [prevalence, sensitivity, specificity]);

  // Handlers
  const addHypothesis = () => {
    if (hypotheses.length < 6) {
      setHypotheses([...hypotheses, { name: `H${hypotheses.length + 1}`, prior: '0', likelihood: '0,5' }]);
    }
  };

  const removeHypothesis = (index: number) => {
    if (hypotheses.length > 2) {
      setHypotheses(hypotheses.filter((_, i) => i !== index));
    }
  };

  const updateHypothesis = (index: number, field: keyof Hypothesis, value: string) => {
    const updated = [...hypotheses];
    updated[index] = { ...updated[index], [field]: value };
    setHypotheses(updated);
  };

  const toggleObservation = (index: number) => {
    const updated = [...seqObservations];
    updated[index] = !updated[index];
    setSeqObservations(updated);
  };

  const addObservation = () => {
    if (seqObservations.length < 10) {
      setSeqObservations([...seqObservations, true]);
    }
  };

  const removeObservation = () => {
    if (seqObservations.length > 1) {
      setSeqObservations(seqObservations.slice(0, -1));
    }
  };

  // Load examples
  const loadExample = (tab: TabType) => {
    switch (tab) {
      case 'simple':
        setPriorA('0,001');
        setLikelihoodBA('0,99');
        setLikelihoodBNotA('0,01');
        break;
      case 'multiple':
        setHypotheses([
          { name: 'Gripe', prior: '0,6', likelihood: '0,8' },
          { name: 'COVID', prior: '0,2', likelihood: '0,9' },
          { name: 'Resfriado', prior: '0,15', likelihood: '0,6' },
          { name: 'Alergia', prior: '0,05', likelihood: '0,3' },
        ]);
        break;
      case 'sequential':
        setSeqPrior('0,5');
        setSeqLikelihood('0,8');
        setSeqLikelihoodNeg('0,2');
        setSeqObservations([true, true, false, true, true]);
        break;
      case 'diagnostic':
        setPrevalence('1');
        setSensitivity('95');
        setSpecificity('90');
        break;
    }
  };

  const tabs: { id: TabType; name: string; icon: string }[] = [
    { id: 'simple', name: 'Bayes Simple', icon: '🎯' },
    { id: 'multiple', name: 'Múltiples Hipótesis', icon: '📊' },
    { id: 'sequential', name: 'Actualización Secuencial', icon: '🔄' },
    { id: 'diagnostic', name: 'Test Diagnóstico', icon: '🏥' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🧠</span>
        <h1 className={styles.title}>Inferencia Bayesiana</h1>
        <p className={styles.subtitle}>
          Teorema de Bayes paso a paso - Actualiza creencias con evidencia
        </p>
      </header>

      {/* Tabs */}
      <nav className={styles.tabNav}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.name}</span>
          </button>
        ))}
      </nav>

      <main className={styles.mainContent}>
        {/* Simple Bayes */}
        {activeTab === 'simple' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Teorema de Bayes</h2>
              <p className={styles.formula}>P(A|B) = P(B|A) × P(A) / P(B)</p>

              <div className={styles.inputGroup}>
                <label className={styles.label}>P(A) - Prior (probabilidad inicial)</label>
                <input
                  type="text"
                  value={priorA}
                  onChange={e => setPriorA(e.target.value)}
                  className={styles.input}
                  placeholder="0,01"
                />
                <span className={styles.helpText}>Tu creencia inicial antes de ver evidencia</span>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>P(B|A) - Likelihood (verosimilitud)</label>
                <input
                  type="text"
                  value={likelihoodBA}
                  onChange={e => setLikelihoodBA(e.target.value)}
                  className={styles.input}
                  placeholder="0,9"
                />
                <span className={styles.helpText}>Probabilidad de observar B si A es verdad</span>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>P(B|¬A) - Falso positivo</label>
                <input
                  type="text"
                  value={likelihoodBNotA}
                  onChange={e => setLikelihoodBNotA(e.target.value)}
                  className={styles.input}
                  placeholder="0,05"
                />
                <span className={styles.helpText}>Probabilidad de observar B si A es falso</span>
              </div>

              <button onClick={() => loadExample('simple')} className={styles.btnSecondary}>
                Cargar ejemplo (enfermedad rara)
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>

              {simpleResults ? (
                <>
                  <div className={styles.mainResult}>
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>P(A|B) - Posterior</span>
                      <span className={styles.resultValue}>
                        {formatNumber(simpleResults.posterior, 6)}
                      </span>
                      <span className={styles.resultPercent}>
                        ({formatNumber(simpleResults.posterior * 100, 2)}%)
                      </span>
                    </div>
                  </div>

                  {/* Step by step */}
                  <div className={styles.stepsSection}>
                    <h3 className={styles.stepsTitle}>Cálculo paso a paso</h3>

                    <div className={styles.step}>
                      <span className={styles.stepNum}>1</span>
                      <div className={styles.stepContent}>
                        <span className={styles.stepLabel}>Calcular P(B) - Probabilidad total</span>
                        <span className={styles.stepFormula}>
                          P(B) = P(B|A)×P(A) + P(B|¬A)×P(¬A)
                        </span>
                        <span className={styles.stepCalc}>
                          = {formatNumber(simpleResults.pBA, 4)} × {formatNumber(simpleResults.pA, 4)} + {formatNumber(simpleResults.pBNotA, 4)} × {formatNumber(simpleResults.pNotA, 4)}
                        </span>
                        <span className={styles.stepResult}>
                          = {formatNumber(simpleResults.pB, 6)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.step}>
                      <span className={styles.stepNum}>2</span>
                      <div className={styles.stepContent}>
                        <span className={styles.stepLabel}>Aplicar Teorema de Bayes</span>
                        <span className={styles.stepFormula}>
                          P(A|B) = P(B|A) × P(A) / P(B)
                        </span>
                        <span className={styles.stepCalc}>
                          = {formatNumber(simpleResults.pBA, 4)} × {formatNumber(simpleResults.pA, 4)} / {formatNumber(simpleResults.pB, 6)}
                        </span>
                        <span className={styles.stepResult}>
                          = {formatNumber(simpleResults.posterior, 6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional stats */}
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Prior P(A)</span>
                      <span className={styles.statValue}>{formatNumber(simpleResults.pA * 100, 4)}%</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Posterior P(A|B)</span>
                      <span className={styles.statValue}>{formatNumber(simpleResults.posterior * 100, 4)}%</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Factor de actualización</span>
                      <span className={styles.statValue}>×{formatNumber(simpleResults.updateFactor, 2)}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Likelihood Ratio</span>
                      <span className={styles.statValue}>{formatNumber(simpleResults.likelihoodRatio, 2)}</span>
                    </div>
                  </div>

                  <div className={styles.interpretation}>
                    <h4>Interpretación</h4>
                    <p>
                      Antes de ver la evidencia B, la probabilidad de A era {formatNumber(simpleResults.pA * 100, 2)}%.
                      Después de observar B, la probabilidad aumenta a {formatNumber(simpleResults.posterior * 100, 2)}%.
                      {simpleResults.updateFactor > 1
                        ? ` La evidencia hace ${formatNumber(simpleResults.updateFactor, 1)} veces más probable que A sea verdad.`
                        : ` La evidencia hace menos probable que A sea verdad.`}
                    </p>
                  </div>
                </>
              ) : (
                <p className={styles.placeholder}>
                  Introduce valores válidos (probabilidades entre 0 y 1).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Multiple Hypotheses */}
        {activeTab === 'multiple' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Múltiples Hipótesis</h2>
              <p className={styles.description}>
                Compara varias hipótesis mutuamente excluyentes dado un mismo evento observado.
              </p>

              <div className={styles.hypothesesList}>
                {hypotheses.map((h, i) => (
                  <div key={i} className={styles.hypothesisRow}>
                    <input
                      type="text"
                      value={h.name}
                      onChange={e => updateHypothesis(i, 'name', e.target.value)}
                      className={styles.inputSmall}
                      placeholder="Nombre"
                    />
                    <div className={styles.hypothesisInputs}>
                      <div>
                        <label className={styles.miniLabel}>Prior</label>
                        <input
                          type="text"
                          value={h.prior}
                          onChange={e => updateHypothesis(i, 'prior', e.target.value)}
                          className={styles.inputSmall}
                          placeholder="0,5"
                        />
                      </div>
                      <div>
                        <label className={styles.miniLabel}>P(E|H)</label>
                        <input
                          type="text"
                          value={h.likelihood}
                          onChange={e => updateHypothesis(i, 'likelihood', e.target.value)}
                          className={styles.inputSmall}
                          placeholder="0,8"
                        />
                      </div>
                    </div>
                    {hypotheses.length > 2 && (
                      <button onClick={() => removeHypothesis(i)} className={styles.btnRemove}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.buttonRow}>
                {hypotheses.length < 6 && (
                  <button onClick={addHypothesis} className={styles.btnSecondary}>
                    + Añadir hipótesis
                  </button>
                )}
                <button onClick={() => loadExample('multiple')} className={styles.btnSecondary}>
                  Cargar ejemplo (diagnóstico)
                </button>
              </div>

              <div className={styles.priorSum}>
                Suma de priors: {formatNumber(hypotheses.reduce((sum, h) => sum + parseNum(h.prior), 0), 4)}
                {Math.abs(hypotheses.reduce((sum, h) => sum + parseNum(h.prior), 0) - 1) > 0.001 && (
                  <span className={styles.warning}> (debe ser 1)</span>
                )}
              </div>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Resultados</h2>

              {multipleResults ? (
                <>
                  <div className={styles.mainResult}>
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>Hipótesis más probable</span>
                      <span className={styles.resultValue}>
                        {multipleResults.mostLikely.name}
                      </span>
                      <span className={styles.resultPercent}>
                        ({formatNumber(multipleResults.mostLikely.posterior * 100, 2)}%)
                      </span>
                    </div>
                  </div>

                  <div className={styles.hypothesesResults}>
                    <table className={styles.resultsTable}>
                      <thead>
                        <tr>
                          <th>Hipótesis</th>
                          <th>Prior</th>
                          <th>Likelihood</th>
                          <th>Posterior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {multipleResults.hypotheses.map((h, i) => (
                          <tr key={i} className={h.name === multipleResults.mostLikely.name ? styles.highlighted : ''}>
                            <td>{h.name}</td>
                            <td>{formatNumber(h.prior * 100, 1)}%</td>
                            <td>{formatNumber(h.likelihood, 2)}</td>
                            <td className={styles.posteriorCell}>
                              <div className={styles.posteriorBar}>
                                <div
                                  className={styles.posteriorFill}
                                  style={{ width: `${h.posterior * 100}%` }}
                                />
                              </div>
                              <span>{formatNumber(h.posterior * 100, 1)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>P(Evidencia)</span>
                    <span className={styles.statValue}>{formatNumber(multipleResults.pEvidence, 4)}</span>
                  </div>
                </>
              ) : (
                <p className={styles.placeholder}>
                  Asegúrate de que los priors sumen 1 y todos los valores sean válidos.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Sequential Updates */}
        {activeTab === 'sequential' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Actualización Secuencial</h2>
              <p className={styles.description}>
                Observa cómo la probabilidad se actualiza con cada nueva observación.
              </p>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Prior inicial P(H)</label>
                <input
                  type="text"
                  value={seqPrior}
                  onChange={e => setSeqPrior(e.target.value)}
                  className={styles.input}
                  placeholder="0,5"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>P(Obs+|H) - Prob. de obs. positiva si H es cierta</label>
                <input
                  type="text"
                  value={seqLikelihood}
                  onChange={e => setSeqLikelihood(e.target.value)}
                  className={styles.input}
                  placeholder="0,7"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>P(Obs+|¬H) - Prob. de obs. positiva si H es falsa</label>
                <input
                  type="text"
                  value={seqLikelihoodNeg}
                  onChange={e => setSeqLikelihoodNeg(e.target.value)}
                  className={styles.input}
                  placeholder="0,3"
                />
              </div>

              <div className={styles.observationsSection}>
                <label className={styles.label}>Observaciones (click para cambiar)</label>
                <div className={styles.observationButtons}>
                  {seqObservations.map((obs, i) => (
                    <button
                      key={i}
                      onClick={() => toggleObservation(i)}
                      className={`${styles.obsBtn} ${obs ? styles.obsPositive : styles.obsNegative}`}
                    >
                      {i + 1}: {obs ? '✓' : '✗'}
                    </button>
                  ))}
                </div>
                <div className={styles.buttonRow}>
                  <button onClick={addObservation} className={styles.btnSmall} disabled={seqObservations.length >= 10}>
                    + Añadir
                  </button>
                  <button onClick={removeObservation} className={styles.btnSmall} disabled={seqObservations.length <= 1}>
                    - Quitar
                  </button>
                </div>
              </div>

              <button onClick={() => loadExample('sequential')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Evolución del Posterior</h2>

              {sequentialResults ? (
                <>
                  <div className={styles.mainResult}>
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>Posterior final P(H|datos)</span>
                      <span className={styles.resultValue}>
                        {formatNumber(sequentialResults.finalPosterior, 6)}
                      </span>
                      <span className={styles.resultPercent}>
                        ({formatNumber(sequentialResults.finalPosterior * 100, 2)}%)
                      </span>
                    </div>
                  </div>

                  <div className={styles.sequenceTimeline}>
                    <div className={styles.timelinePoint}>
                      <span className={styles.timelineLabel}>Inicial</span>
                      <span className={styles.timelineValue}>
                        {formatNumber(sequentialResults.initialPrior * 100, 1)}%
                      </span>
                    </div>
                    {sequentialResults.steps.map((step, i) => (
                      <div key={i} className={styles.timelineStep}>
                        <div className={`${styles.timelineArrow} ${step.observation ? styles.arrowUp : styles.arrowDown}`}>
                          {step.observation ? '↑' : '↓'}
                        </div>
                        <div className={styles.timelinePoint}>
                          <span className={styles.timelineLabel}>
                            Obs {i + 1}: {step.observation ? '✓' : '✗'}
                          </span>
                          <span className={styles.timelineValue}>
                            {formatNumber(step.posterior * 100, 1)}%
                          </span>
                          <span className={styles.timelineLR}>
                            LR: {formatNumber(step.likelihoodRatio, 2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.interpretation}>
                    <h4>Resumen</h4>
                    <p>
                      Empezando con un prior de {formatNumber(sequentialResults.initialPrior * 100, 1)}%,
                      después de {seqObservations.length} observaciones
                      ({seqObservations.filter(o => o).length} positivas, {seqObservations.filter(o => !o).length} negativas),
                      la probabilidad final es {formatNumber(sequentialResults.finalPosterior * 100, 2)}%.
                    </p>
                  </div>
                </>
              ) : (
                <p className={styles.placeholder}>
                  Introduce valores válidos para ver la evolución.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Diagnostic Test */}
        {activeTab === 'diagnostic' && (
          <div className={styles.moduleContainer}>
            <div className={styles.inputPanel}>
              <h2 className={styles.panelTitle}>Test Diagnóstico</h2>
              <p className={styles.description}>
                Calcula el valor predictivo de un test médico o diagnóstico.
              </p>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Prevalencia (%)</label>
                <input
                  type="text"
                  value={prevalence}
                  onChange={e => setPrevalence(e.target.value)}
                  className={styles.input}
                  placeholder="1"
                />
                <span className={styles.helpText}>Porcentaje de la población con la condición</span>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Sensibilidad (%)</label>
                <input
                  type="text"
                  value={sensitivity}
                  onChange={e => setSensitivity(e.target.value)}
                  className={styles.input}
                  placeholder="95"
                />
                <span className={styles.helpText}>Tasa de verdaderos positivos (detecta enfermos)</span>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Especificidad (%)</label>
                <input
                  type="text"
                  value={specificity}
                  onChange={e => setSpecificity(e.target.value)}
                  className={styles.input}
                  placeholder="90"
                />
                <span className={styles.helpText}>Tasa de verdaderos negativos (detecta sanos)</span>
              </div>

              <button onClick={() => loadExample('diagnostic')} className={styles.btnSecondary}>
                Cargar ejemplo típico
              </button>
            </div>

            <div className={styles.resultsPanel}>
              <h2 className={styles.panelTitle}>Valores Predictivos</h2>

              {diagnosticResults ? (
                <>
                  <div className={styles.mainResultsGrid}>
                    <div className={styles.resultHighlight}>
                      <span className={styles.resultLabel}>VPP (Valor Predictivo Positivo)</span>
                      <span className={styles.resultValue}>
                        {formatNumber(diagnosticResults.ppv * 100, 2)}%
                      </span>
                      <span className={styles.resultNote}>
                        Si el test es +, prob. de tener la condición
                      </span>
                    </div>
                    <div className={styles.resultHighlightAlt}>
                      <span className={styles.resultLabel}>VPN (Valor Predictivo Negativo)</span>
                      <span className={styles.resultValue}>
                        {formatNumber(diagnosticResults.npv * 100, 2)}%
                      </span>
                      <span className={styles.resultNote}>
                        Si el test es -, prob. de NO tener la condición
                      </span>
                    </div>
                  </div>

                  {/* Confusion matrix */}
                  <div className={styles.confusionMatrix}>
                    <h3 className={styles.matrixTitle}>Matriz de Confusión (por 10.000 personas)</h3>
                    <table className={styles.matrixTable}>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Enfermo</th>
                          <th>Sano</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className={styles.matrixRowHeader}>Test +</td>
                          <td className={styles.truePositive}>
                            VP: {Math.round(diagnosticResults.truePositive * 10000)}
                          </td>
                          <td className={styles.falsePositive}>
                            FP: {Math.round(diagnosticResults.falsePositive * 10000)}
                          </td>
                          <td>{Math.round(diagnosticResults.pPositive * 10000)}</td>
                        </tr>
                        <tr>
                          <td className={styles.matrixRowHeader}>Test -</td>
                          <td className={styles.falseNegative}>
                            FN: {Math.round(diagnosticResults.falseNegative * 10000)}
                          </td>
                          <td className={styles.trueNegative}>
                            VN: {Math.round(diagnosticResults.trueNegative * 10000)}
                          </td>
                          <td>{Math.round(diagnosticResults.pNegative * 10000)}</td>
                        </tr>
                        <tr>
                          <td className={styles.matrixRowHeader}>Total</td>
                          <td>{Math.round(diagnosticResults.prevalence * 10000)}</td>
                          <td>{Math.round((1 - diagnosticResults.prevalence) * 10000)}</td>
                          <td>10.000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>LR+ (Likelihood Ratio +)</span>
                      <span className={styles.statValue}>{formatNumber(diagnosticResults.positiveLR, 2)}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>LR- (Likelihood Ratio -)</span>
                      <span className={styles.statValue}>{formatNumber(diagnosticResults.negativeLR, 4)}</span>
                    </div>
                    <div className={styles.statCard}>
                      <span className={styles.statLabel}>Precisión global</span>
                      <span className={styles.statValue}>{formatNumber(diagnosticResults.accuracy * 100, 2)}%</span>
                    </div>
                  </div>

                  <div className={styles.interpretation}>
                    <h4>Interpretación práctica</h4>
                    <p>
                      Con una prevalencia del {formatNumber(diagnosticResults.prevalence * 100, 2)}%,
                      si una persona da positivo, solo hay un {formatNumber(diagnosticResults.ppv * 100, 1)}%
                      de probabilidad de que realmente tenga la condición. Esto ilustra la
                      <strong> paradoja del test</strong>: incluso tests muy precisos pueden tener bajo VPP
                      con prevalencias bajas.
                    </p>
                  </div>
                </>
              ) : (
                <p className={styles.placeholder}>
                  Introduce valores válidos (porcentajes entre 0 y 100).
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>Aviso Importante</h3>
        <p>
          Esta calculadora es una herramienta educativa para entender la inferencia bayesiana.
          Para decisiones médicas, financieras o de investigación, consulta con profesionales
          cualificados y utiliza software especializado.
        </p>
      </div>

      {/* Educational content */}
      <EducationalSection
        title="¿Quieres entender mejor la inferencia bayesiana?"
        subtitle="Aprende los conceptos fundamentales y cuándo aplicar el teorema de Bayes"
      >
        <section className={styles.guideSection}>
          <h2>Guía de Inferencia Bayesiana</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🎯 El Teorema de Bayes</h4>
              <p>
                El teorema de Bayes permite actualizar creencias cuando recibimos nueva información.
                Transforma la probabilidad previa (prior) en probabilidad posterior usando la
                verosimilitud de la evidencia.
              </p>
              <p className={styles.formula}>
                P(H|E) = P(E|H) × P(H) / P(E)
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📊 Prior vs Posterior</h4>
              <p>
                <strong>Prior P(H)</strong>: Tu creencia inicial antes de ver datos. Puede basarse
                en conocimiento previo, experiencia o ser &quot;no informativo&quot;.
              </p>
              <p>
                <strong>Posterior P(H|E)</strong>: Tu creencia actualizada después de ver la evidencia.
                El posterior de hoy se convierte en el prior de mañana.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📈 Likelihood (Verosimilitud)</h4>
              <p>
                P(E|H) mide cuán probable es observar la evidencia E si la hipótesis H fuera cierta.
                NO es lo mismo que P(H|E). Esta confusión es el &quot;error del fiscal&quot;.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔢 Likelihood Ratio</h4>
              <p>
                La razón P(E|H)/P(E|¬H) indica cuánto más probable es la evidencia bajo H
                que bajo ¬H. Un LR de 10 significa que la evidencia es 10 veces más probable
                si H es verdadera.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🏥 La Paradoja del Test</h4>
              <p>
                Un test con 99% de sensibilidad y 99% de especificidad parece excelente.
                Pero si la prevalencia es 1%, ¡solo el 50% de los positivos están realmente enfermos!
                El VPP depende crucialmente de la prevalencia.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🔄 Actualización Secuencial</h4>
              <p>
                La belleza de Bayes: cada nueva observación actualiza el posterior, que se convierte
                en el nuevo prior. Con suficiente evidencia, incluso priors muy diferentes
                convergen al mismo resultado.
              </p>
            </div>
          </div>

          <h3>Aplicaciones Prácticas</h3>
          <div className={styles.applicationsList}>
            <div className={styles.applicationCard}>
              <span className={styles.appIcon}>🏥</span>
              <div>
                <h4>Diagnóstico Médico</h4>
                <p>Interpretar resultados de tests considerando prevalencia y características del test.</p>
              </div>
            </div>
            <div className={styles.applicationCard}>
              <span className={styles.appIcon}>📧</span>
              <div>
                <h4>Filtros de Spam</h4>
                <p>Clasificar emails como spam basándose en palabras clave y patrones históricos.</p>
              </div>
            </div>
            <div className={styles.applicationCard}>
              <span className={styles.appIcon}>🤖</span>
              <div>
                <h4>Machine Learning</h4>
                <p>Redes bayesianas, clasificadores Naive Bayes, inferencia probabilística.</p>
              </div>
            </div>
            <div className={styles.applicationCard}>
              <span className={styles.appIcon}>⚖️</span>
              <div>
                <h4>Sistemas Legales</h4>
                <p>Evaluar probabilidad de culpabilidad dada la evidencia (aunque controvertido).</p>
              </div>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('inferencia-bayesiana')} />
      <Footer appName="inferencia-bayesiana" />
    </div>
  );
}
