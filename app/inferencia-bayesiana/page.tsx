'use client';

import { useState, useMemo } from 'react';
import styles from './InferenciaBayesiana.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice lastUpdated="2026-02-02" />

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
      

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="inferencia-bayesiana">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para comprender la inferencia bayesiana y el teorema de Bayes:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Verifica resultados en trabajos académicos</strong>: Especialmente en estadística, probabilidad y análisis de datos</li>
          <li><strong>Consulta con un estadístico</strong>: Para decisiones médicas, financieras o de investigación crítica</li>
        </ul>
      </DisclaimerCard>

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

          {/* Tabla Comparativa */}
          <div className={styles.eduComparativaSection}>
            <h3>⚖️ Comparativa de Métodos de Inferencia Bayesiana</h3>
            <p className={styles.eduComparativaSubtitle}>¿Cuándo usar cada modo de esta calculadora?</p>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th>🎯 Bayes Simple</th>
                    <th>📊 Hipótesis Múltiples</th>
                    <th>🔄 Secuencial</th>
                    <th>🏥 Diagnóstico</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>Nº hipótesis</strong></td><td>1 (A o ¬A)</td><td>2-6 mutuamente excluyentes</td><td>1 (actualización iterativa)</td><td>1 (enfermedad sí/no)</td></tr>
                  <tr><td><strong>Tipo de evidencia</strong></td><td>Un único evento B</td><td>Un único evento E</td><td>Secuencia de observaciones</td><td>Resultado de test médico</td></tr>
                  <tr><td><strong>Salida principal</strong></td><td>Posterior P(A|B) + LR</td><td>Ranking de hipótesis</td><td>Evolución del posterior</td><td>VPP + VPN + Matriz</td></tr>
                  <tr><td><strong>Caso de uso típico</strong></td><td>¿Está enferma esta persona?</td><td>¿Qué diagnóstico es más probable?</td><td>¿Cambia mi creencia con los datos?</td><td>¿Cuánto vale un positivo?</td></tr>
                  <tr><td><strong>Complejidad</strong></td><td>⭐ Baja</td><td>⭐⭐ Media</td><td>⭐⭐ Media</td><td>⭐⭐⭐ Alta</td></tr>
                  <tr><td><strong>Ideal para</strong></td><td>Aprender Bayes, casos simples</td><td>Diagnóstico diferencial</td><td>Investigación, ML</td><td>Medicina, screening</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Casos de Uso */}
          <div className={styles.eduEscenariosSection}>
            <h3>💼 Casos de Uso Reales</h3>
            <p className={styles.eduEscenariosSubtitle}>Aplicaciones concretas del Teorema de Bayes en distintos campos</p>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🏥</span>
                  <h4>Diagnóstico Médico y Screening</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Ejemplo:</strong> Test de cáncer con sensibilidad 99%, especificidad 99%, prevalencia 0,1%. Positivo → solo 9% probabilidad real de tener cáncer.</p>
                <p className={styles.eduEscenarioTip}><strong>Por qué importa:</strong> Evita la &quot;falacia del fiscal&quot; y el sobretratamiento. Comprenderlo salva vidas y recursos sanitarios.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🤖</span>
                  <h4>Machine Learning y Clasificación</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Ejemplo:</strong> Filtro de spam: P(spam|&quot;ganaste&quot;) = P(&quot;ganaste&quot;|spam) × P(spam) / P(&quot;ganaste&quot;). Trained con millones de emails.</p>
                <p className={styles.eduEscenarioTip}><strong>Por qué importa:</strong> Naive Bayes es el algoritmo base para clasificación de texto, detección de fraude y sistemas de recomendación.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>🔬</span>
                  <h4>Investigación Científica</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Ejemplo:</strong> Experimento de física: prior = 50%, cada medición actualiza el posterior. Tras 10 obs. positivas → 98,4% de confianza.</p>
                <p className={styles.eduEscenarioTip}><strong>Por qué importa:</strong> La estadística bayesiana permite incorporar conocimiento previo de forma rigurosa, crucial en estudios con muestras pequeñas.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon}>📈</span>
                  <h4>Decisiones Empresariales y A/B Testing</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Ejemplo:</strong> Test A/B web: prior 50%, variante B tiene CR 4,2% vs 3,8% de A. Tras 1.000 visitas → 85% probabilidad de que B sea mejor.</p>
                <p className={styles.eduEscenarioTip}><strong>Por qué importa:</strong> A diferencia del enfoque frecuentista, el bayesiano da probabilidades directas de superioridad, más interpretables para decisiones de negocio.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre Inferencia Bayesiana</h3>
            <p className={styles.eduFaqSubtitle}>Respuestas detalladas a las dudas más comunes</p>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué diferencia hay entre frecuentista y bayesiano?</h4>
                <p>El enfoque <strong>frecuentista</strong> trata la probabilidad como la frecuencia límite de un experimento repetido: P-values, intervalos de confianza, hipótesis nula. El <strong>bayesiano</strong> trata la probabilidad como grado de creencia: actualiza creencias previas con datos. En la práctica: bayesiano permite decir &quot;hay 87% de probabilidad de que H sea cierta&quot;; frecuentista solo permite &quot;si H fuera falsa, veríamos estos datos con probabilidad p&quot;.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué es el &quot;error del fiscal&quot; y por qué es tan grave?</h4>
                <p>El <strong>error del fiscal</strong> (Prosecutor&apos;s Fallacy) confunde P(evidencia|inocente) con P(inocente|evidencia). Ejemplo real: ADN coincide en 1 de 1 millón → fiscal dice &quot;hay 1 en 1 millón de probabilidad de inocencia&quot;. Error: si la ciudad tiene 10 millones, hay ~10 personas con ese ADN. La probabilidad real de inocencia depende de la prevalencia del delito y otras pruebas. Ha llevado a condenas injustas.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cómo elijo un prior cuando no tengo información previa?</h4>
                <p>Tres opciones: (1) <strong>Prior no informativo</strong>: P(H) = 0,5 (máxima incertidumbre), bueno para comenzar. (2) <strong>Prior basado en prevalencia</strong>: usa estadísticas poblacionales (ej: prevalencia de la enfermedad en la región). (3) <strong>Prior de Jeffreys</strong>: matemáticamente neutro respecto a la escala. Con suficiente evidencia, el impacto del prior disminuye y los resultados convergen.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Por qué el Likelihood Ratio (LR) es tan importante?</h4>
                <p>El LR es la &quot;fuerza de la evidencia&quot; independiente del prior. LR = P(E|H) / P(E|¬H). Interpretación: LR = 10 → la evidencia es 10 veces más probable bajo H que bajo ¬H. Regla práctica: LR &gt; 10 = fuerte, LR &gt; 100 = muy fuerte. Ventaja: en medicina se usa para combinar múltiples tests independientes multiplicando sus LRs.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuándo el VPP (Valor Predictivo Positivo) puede ser engañoso?</h4>
                <p>Cuando la prevalencia es muy baja. Un test con 99% sensibilidad y 99% especificidad tiene VPP = 50% si la prevalencia es 1% (por cada verdadero positivo, hay un falso positivo). Consecuencia: los programas de screening masivo para enfermedades raras generan muchos falsos positivos. Solución: hacer pruebas confirmatorias en positivos, no tratar directamente.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué es la actualización secuencial y para qué sirve?</h4>
                <p>Es aplicar Bayes múltiples veces: el posterior de hoy se convierte en el prior de mañana. Sirve para: sistemas de navegación (GPS acumula mediciones para localización precisa), predicción meteorológica (actualización hora a hora), aprendizaje automático online (actualización con cada dato nuevo). La belleza: el orden de las observaciones no importa, el resultado final es el mismo.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Pueden dos personas con el mismo prior llegar a conclusiones diferentes?</h4>
                <p>Con los mismos datos, eventualmente no: con suficiente evidencia, cualquier prior razonable converge al mismo posterior. Pero con pocos datos, sí: si una persona cree P(H) = 0,01 y otra P(H) = 0,5, observar el mismo resultado puede llevarlas a posteriors muy distintos. Esto ilustra por qué en ciencia se publica evidencia acumulada, no estudios aislados.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué herramientas se usan para la inferencia bayesiana avanzada?</h4>
                <p>Para modelos simples: esta calculadora, Excel, Python (scipy.stats). Para modelos complejos: <strong>MCMC</strong> (Markov Chain Monte Carlo) con herramientas como PyMC, Stan, JAGS. Para ML bayesiano: scikit-learn (GaussianNB), TensorFlow Probability. Para investigación: R con paquetes BayesFactor, rstanarm. El costo computacional escala con la complejidad del modelo.</p>
              </div>
            </div>
          </div>

          {/* Guía Paso a Paso */}
          <div className={styles.eduStepSection}>
            <h3>📋 Cómo Aplicar el Teorema de Bayes: Guía Paso a Paso</h3>
            <p className={styles.eduComparativaSubtitle}>7 pasos para resolver cualquier problema bayesiano</p>
            <div className={styles.eduStepGuide}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>Define claramente la hipótesis H</h4>
                  <p>Enuncia explícitamente qué es H y qué es ¬H. Ejemplo: H = &quot;el paciente tiene tuberculosis&quot;, ¬H = &quot;no tiene tuberculosis&quot;. Evitar ambigüedades: &quot;tiene infección&quot; es demasiado vago. La precisión aquí determina la calidad de todo el análisis.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>Establece el prior P(H)</h4>
                  <p>Busca datos de prevalencia o base rate. Fuentes: estadísticas nacionales de salud (para enfermedades), datos históricos de proyectos (para predicciones empresariales), frecuencias de eventos pasados. Si no hay datos, usa P(H) = 0,5 y documenta la incertidumbre.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>Determina P(E|H) - Verosimilitud</h4>
                  <p>¿Con qué probabilidad observarías esta evidencia E si H fuera cierta? En medicina: sensibilidad del test. En clasificación: P(palabra|spam). Esta probabilidad debe obtenerse de estudios de validación, no estimarse subjetivamente cuando sea posible.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Determina P(E|¬H) - Falsos positivos</h4>
                  <p>¿Con qué probabilidad observarías E si H fuera falsa? En medicina: 1 - especificidad. Este valor es crítico: un falso positivo alto destruye el valor del test incluso con alta sensibilidad. Ejemplo: síntoma de fiebre → P(fiebre|no gripe) = 0,4 porque muchas enfermedades causan fiebre.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>Calcula P(E) - Probabilidad total</h4>
                  <p>P(E) = P(E|H)×P(H) + P(E|¬H)×P(¬H). Este es el &quot;denominador normalizador&quot; que hace que el posterior sea una probabilidad válida. Se puede calcular como suma ponderada si hay múltiples hipótesis: P(E) = Σ P(E|Hᵢ)×P(Hᵢ).</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Aplica la fórmula y calcula el posterior</h4>
                  <p>P(H|E) = P(E|H) × P(H) / P(E). Verifica que P(H|E) + P(¬H|E) = 1. Si tienes múltiples hipótesis, verifica que todos los posteriors sumen 1. Calcula también el Likelihood Ratio = P(E|H)/P(E|¬H) para comunicar la fuerza de la evidencia independientemente del prior.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>7</div>
                <div className={styles.eduStepContent}>
                  <h4>Interpreta y comunica el resultado correctamente</h4>
                  <p>Comunica siempre: el posterior con su incertidumbre, el prior usado y su fuente, y las limitaciones. Di &quot;dado este test positivo, la probabilidad de tener la enfermedad es 15%&quot;, NO &quot;el test dice que tienes la enfermedad&quot;. Con priors inciertos, muestra el rango de posteriors posibles (análisis de sensibilidad).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className={styles.eduTipsSection}>
            <h3>✅ Mejores Prácticas en Inferencia Bayesiana</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📊</span>
                <h4>Siempre reporta el prior</h4>
                <p>Nunca presentes un posterior sin indicar el prior usado y su fuente. Dos personas con priors distintos obtienen resultados diferentes con los mismos datos.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔢</span>
                <h4>Usa frecuencias naturales</h4>
                <p>En vez de &quot;0,001 probabilidad&quot;, di &quot;1 de cada 1.000 personas&quot;. Las frecuencias naturales reducen errores de interpretación hasta en un 70% según estudios de Gigerenzer.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔄</span>
                <h4>Actualiza secuencialmente</h4>
                <p>No esperes a tener todos los datos. Cada nueva observación puede (y debe) actualizar el posterior. El aprendizaje bayesiano es continuo, no puntual.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>⚖️</span>
                <h4>Calcula el LR antes del prior</h4>
                <p>El Likelihood Ratio es la &quot;fuerza de la evidencia&quot; independiente del contexto. Calcula LR = P(E|H)/P(E|¬H) primero; luego aplica al prior específico de cada caso.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🎯</span>
                <h4>Analiza la sensibilidad al prior</h4>
                <p>Si el posterior cambia mucho con pequeños cambios en el prior, necesitas más evidencia. Si es robusto al prior, los datos son suficientemente informativos.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>📝</span>
                <h4>Documenta tus asunciones</h4>
                <p>La independencia entre observaciones, la estacionariedad del proceso, y el modelo elegido son asunciones que afectan el resultado. Explicítalas siempre.</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className={styles.eduWarningBox}>
            <div className={styles.eduWarningHeader}>
              <span className={styles.eduWarningIcon}>⚠️</span>
              <h3>Errores Conceptuales que Invalidan el Análisis Bayesiano</h3>
            </div>
            <ul className={styles.eduWarningList}>
              <li><strong>❌ Confundir P(H|E) con P(E|H):</strong> El &quot;error del fiscal&quot; y la &quot;falacia del médico&quot;. P(cáncer|positivo) ≠ P(positivo|cáncer). La sensibilidad del test no es la probabilidad de estar enfermo.</li>
              <li><strong>❌ Ignorar la prevalencia (base rate neglect):</strong> Un test del 99% de precisión tiene VPP = 50% para una enfermedad con prevalencia del 1%. La prevalencia multiplica cualquier test.</li>
              <li><strong>❌ Usar el posterior como nuevo prior sin datos nuevos:</strong> Solo actualiza cuando tienes evidencia nueva e independiente. Reutilizar los mismos datos para actualizar el prior es &quot;double-dipping&quot; y viola la inferencia bayesiana.</li>
              <li><strong>❌ Asumir independencia entre observaciones sin verificar:</strong> Si las obs. 2, 3 y 4 dependen de la obs. 1, multiplicar sus likelihoods sobreestima la evidencia. En epidemiología, los contagios violan la independencia.</li>
              <li><strong>❌ Prior basado en deseos, no en datos:</strong> Un prior de 0,99 para &quot;mi hipótesis favorita&quot; hace casi imposible que los datos la rechacen. El prior debe reflejar el conocimiento real, no el sesgo de confirmación.</li>
              <li><strong>❌ Interpretar el posterior como certeza:</strong> P(H|datos) = 0,95 significa &quot;95% de credibilidad&quot;, no certeza. Siempre hay incertidumbre del modelo, asunciones de independencia y errores de medición que el número no captura.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('inferencia-bayesiana')} />
      <ShareCard appName="inferencia-bayesiana" />
      <Footer appName="inferencia-bayesiana" />
    </div>
  );
}
