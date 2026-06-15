'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './InferenciaBayesiana.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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
        <span className={styles.heroIcon} aria-hidden="true">🧠</span>
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
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabActive : ''}`}
          >
            <span className={styles.tabIcon} aria-hidden="true">{tab.icon}</span>
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
                  inputMode="decimal"
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
                  inputMode="decimal"
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
                  inputMode="decimal"
                  value={likelihoodBNotA}
                  onChange={e => setLikelihoodBNotA(e.target.value)}
                  className={styles.input}
                  placeholder="0,05"
                />
                <span className={styles.helpText}>Probabilidad de observar B si A es falso</span>
              </div>

              <button type="button" onClick={() => loadExample('simple')} className={styles.btnSecondary}>
                Cargar ejemplo (enfermedad rara)
              </button>
            </div>

            <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
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
                          inputMode="decimal"
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
                          inputMode="decimal"
                          value={h.likelihood}
                          onChange={e => updateHypothesis(i, 'likelihood', e.target.value)}
                          className={styles.inputSmall}
                          placeholder="0,8"
                        />
                      </div>
                    </div>
                    {hypotheses.length > 2 && (
                      <button type="button" onClick={() => removeHypothesis(i)} className={styles.btnRemove}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className={styles.buttonRow}>
                {hypotheses.length < 6 && (
                  <button type="button" onClick={addHypothesis} className={styles.btnSecondary}>
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

            <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
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
                  inputMode="decimal"
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
                  inputMode="decimal"
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
                  inputMode="decimal"
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
                      type="button"
                      onClick={() => toggleObservation(i)}
                      aria-pressed={obs}
                      className={`${styles.obsBtn} ${obs ? styles.obsPositive : styles.obsNegative}`}
                    >
                      {i + 1}: {obs ? '✓' : '✗'}
                    </button>
                  ))}
                </div>
                <div className={styles.buttonRow}>
                  <button type="button" onClick={addObservation} className={styles.btnSmall} disabled={seqObservations.length >= 10}>
                    + Añadir
                  </button>
                  <button type="button" onClick={removeObservation} className={styles.btnSmall} disabled={seqObservations.length <= 1}>
                    - Quitar
                  </button>
                </div>
              </div>

              <button onClick={() => loadExample('sequential')} className={styles.btnSecondary}>
                Cargar ejemplo
              </button>
            </div>

            <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
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
                  inputMode="decimal"
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
                  inputMode="decimal"
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
                  inputMode="decimal"
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

            <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="true">
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
              <span className={styles.appIcon} aria-hidden="true">🏥</span>
              <div>
                <h4>Diagnóstico Médico</h4>
                <p>Interpretar resultados de tests considerando prevalencia y características del test.</p>
              </div>
            </div>
            <div className={styles.applicationCard}>
              <span className={styles.appIcon} aria-hidden="true">📧</span>
              <div>
                <h4>Filtros de Spam</h4>
                <p>Clasificar emails como spam basándose en palabras clave y patrones históricos.</p>
              </div>
            </div>
            <div className={styles.applicationCard}>
              <span className={styles.appIcon} aria-hidden="true">🤖</span>
              <div>
                <h4>Machine Learning</h4>
                <p>Redes bayesianas, clasificadores Naive Bayes, inferencia probabilística.</p>
              </div>
            </div>
            <div className={styles.applicationCard}>
              <span className={styles.appIcon} aria-hidden="true">⚖️</span>
              <div>
                <h4>Sistemas Legales</h4>
                <p>Evaluar probabilidad de culpabilidad dada la evidencia (aunque controvertido).</p>
              </div>
            </div>
          </div>

          {/* Tabla Comparativa: Frecuentista vs Bayesiano vs ML */}
          <div className={styles.eduComparativaSection}>
            <h3>⚖️ Frecuentista vs Bayesiano vs Machine Learning</h3>
            <p className={styles.eduComparativaSubtitle}>Tres paradigmas estadísticos: diferencias clave, cuándo usarlos y ejemplos reales</p>
            <div className={styles.eduTablaWrapper}>
              <table className={styles.eduTablaComparativa}>
                <thead>
                  <tr>
                    <th>Enfoque</th>
                    <th>Probabilidad</th>
                    <th>Requiere priors</th>
                    <th>Interpretación</th>
                    <th>Actualización con datos</th>
                    <th>Uso típico</th>
                    <th>Ejemplo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>🔬 Frecuentista</strong></td>
                    <td>Frecuencia límite de experimentos repetidos</td>
                    <td>No (rechazado filosóficamente)</td>
                    <td>P-value: P(datos|H₀). Intervalo de confianza: 95% de experimentos contendrían el parámetro</td>
                    <td>Test de hipótesis una vez por dataset; no hay actualización incremental</td>
                    <td>Ensayos clínicos, control de calidad, A/B testing clásico</td>
                    <td>t-test, ANOVA, chi-cuadrado, regresión logística con p-values</td>
                  </tr>
                  <tr>
                    <td><strong>🧠 Bayesiano</strong></td>
                    <td>Grado de creencia, actualizable con evidencia</td>
                    <td>Sí (prior obligatorio; puede ser no informativo)</td>
                    <td>Posterior: probabilidad directa de la hipótesis dado los datos</td>
                    <td>Continua: cada dato actualiza el posterior que se convierte en nuevo prior</td>
                    <td>Diagnóstico médico, pronósticos con incertidumbre, sistemas de recomendación</td>
                    <td>Teorema de Bayes, redes bayesianas, MCMC, Stan/PyMC</td>
                  </tr>
                  <tr>
                    <td><strong>🤖 Machine Learning</strong></td>
                    <td>Función de pérdida optimizada; no necesariamente probabilista</td>
                    <td>Implícitamente (arquitectura, hiperparámetros, regularización)</td>
                    <td>Predicción: output numeral o probabilístico sin interpretación causal directa</td>
                    <td>Reentrenamiento con nuevos datos; no actualización bayesiana pura</td>
                    <td>Clasificación masiva, reconocimiento de imágenes, NLP, series temporales</td>
                    <td>Random Forest, XGBoost, redes neuronales, Naive Bayes como caso especial</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Casos de Uso */}
          <div className={styles.eduEscenariosSection}>
            <h3>💼 Casos de Uso por Perfil Profesional</h3>
            <p className={styles.eduEscenariosSubtitle}>Cómo aplica el teorema de Bayes en 4 disciplinas con ejemplos numéricos concretos</p>
            <div className={styles.eduEscenariosGrid}>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">🏥</span>
                  <h4>Médico — Diagnóstico Clínico</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Caso real:</strong> Test COVID con sensibilidad 95% y especificidad 90% en una población con prevalencia 1%. Un paciente da positivo. P(COVID|+) = (0,95 × 0,01) / (0,95×0,01 + 0,10×0,99) = 0,0095 / 0,1085 ≈ <strong>8,8%</strong>. Solo 1 de cada 11 positivos tiene COVID realmente.</p>
                <p className={styles.eduEscenarioTip}><strong>Clave clínica:</strong> La sensibilidad/especificidad del test NO es el valor predictivo. La prevalencia de la enfermedad en la consulta (no en la población general) es el prior correcto para el diagnóstico individual.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">🤖</span>
                  <h4>Científico de Datos — Clasificación y Detección de Fraude</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Caso real:</strong> Filtro de spam Naive Bayes. P(spam|&quot;dinero&quot;,&quot;gratis&quot;,&quot;urgente&quot;) = P(&quot;dinero&quot;|spam) × P(&quot;gratis&quot;|spam) × P(&quot;urgente&quot;|spam) × P(spam) / P(evidencia). Con P(spam)=0,3 y LRs de 8×, 12× y 5×, el posterior supera 99,9%. En detección de fraude bancario: transacción en país inusual (LR+15) + importe atípico (LR+8) + hora nocturna (LR+3) → posterior 85% de fraude aunque la tasa base sea 0,1%.</p>
                <p className={styles.eduEscenarioTip}><strong>Clave técnica:</strong> Naive Bayes asume independencia condicional entre features, lo que raramente se cumple pero simplifica el cálculo enormemente. Para modelos más precisos con dependencias: redes bayesianas o modelos gráficos probabilísticos.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">📊</span>
                  <h4>Economista — Pronósticos con Incertidumbre</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Caso real:</strong> Pronóstico de recesión. Prior basado en ciclo económico histórico: P(recesión en 12 meses) = 15%. Aparece dato nuevo: curva de rendimientos invertida (LR = 4,2 históricamente). Posterior = (4,2 × 0,15) / (4,2×0,15 + 1×0,85) = 0,63 / 1,48 ≈ <strong>42,6%</strong>. Nuevo dato: PMI manufacturero cae a 47 (LR = 2,8). Posterior actualizado → <strong>68%</strong>.</p>
                <p className={styles.eduEscenarioTip}><strong>Clave económica:</strong> Los pronósticos bayesianos cuantifican la incertidumbre explícitamente, algo que los modelos VAR clásicos no hacen. Permite comunicar &quot;68% de probabilidad de recesión&quot; en lugar de &quot;probablemente habrá recesión&quot;.</p>
              </div>
              <div className={styles.eduEscenarioCard}>
                <div className={styles.eduEscenarioHeader}>
                  <span className={styles.eduEscenarioIcon} aria-hidden="true">🔬</span>
                  <h4>Investigador Científico — Meta-análisis y Experimentos</h4>
                </div>
                <p className={styles.eduEscenarioExample}><strong>Caso real:</strong> Meta-análisis bayesiano de eficacia de un fármaco. Prior de 3 estudios previos: P(eficaz) = 60%. Nuevo ECA con n=500 muestra OR=1,8 (p=0,03). Posterior bayesiano: 84%. Tercer estudio con n=200, OR=1,4 (p=0,12): posterior 79%. Comparar con meta-análisis frecuentista: solo reporta I²=34% y OR combinado=1,65 sin cuantificar la probabilidad de eficacia.</p>
                <p className={styles.eduEscenarioTip}><strong>Clave científica:</strong> El intervalo creíble bayesiano (ej: &quot;95% de probabilidad de que el OR esté entre 1,2 y 2,4&quot;) es directamente interpretable, a diferencia del intervalo de confianza frecuentista. En estudios con muestras pequeñas, el prior bien especificado mejora la estimación.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre Inferencia Bayesiana</h3>
            <p className={styles.eduFaqSubtitle}>8 preguntas clave con respuestas detalladas y ejemplos numéricos</p>
            <div className={styles.eduFaqList}>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué es la probabilidad a priori (prior)?</h4>
                <p>El <strong>prior P(H)</strong> es tu creencia inicial sobre la hipótesis H <em>antes</em> de observar ningún dato. Puede basarse en: (1) estadísticas poblacionales (ej: prevalencia de una enfermedad = 1% → prior = 0,01), (2) datos históricos (ej: 30% de proyectos similares fallaron → prior de fracaso = 0,30), o (3) ser &quot;no informativo&quot; (P(H) = 0,5 si no tienes ninguna información). El prior NO es arbitrario cuando existen datos: usar P(H) = 0,5 para una enfermedad con prevalencia del 0,001% es un error grave que inflará artificialmente el VPP.</p>
                <p className={styles.faqTip}>Regla práctica: busca siempre la tasa base (base rate) del fenómeno que estudias antes de aplicar Bayes.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuál es la diferencia entre el enfoque bayesiano y el frecuentista?</h4>
                <p>La diferencia es filosófica y práctica. <strong>Frecuentista:</strong> la probabilidad es la frecuencia límite en experimentos repetidos. Solo acepta que H es verdadera o falsa (no probabilística). Produce P-values: &quot;si H₀ fuera cierta, la probabilidad de observar estos datos o más extremos es 3%&quot;. <strong>Bayesiano:</strong> la probabilidad es grado de creencia, actualizable. Produce directamente P(H|datos): &quot;dado lo observado, hay 87% de probabilidad de que H sea cierta&quot;. Diferencia práctica: un bayesiano puede decir &quot;hay 92% de probabilidad de que el fármaco funcione&quot;; un frecuentista solo puede decir &quot;rechazamos H₀ con p=0,04&quot;. El intervalo creíble bayesiano es directamente interpretable; el intervalo de confianza frecuentista, no.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cómo se elige el prior y cuándo importa su elección?</h4>
                <p>El prior importa <strong>mucho</strong> con pocos datos y <strong>poco</strong> con muchos datos. Criterios de elección: (1) <strong>Prior informativo:</strong> basado en literatura científica o datos históricos (ej: efectividad de vacunas similares). (2) <strong>Prior conjugado:</strong> elige la familia distribucional que hace el cálculo analítico (Beta para proporciones, Gamma para tasas). (3) <strong>Prior de Jeffreys:</strong> invariante ante transformaciones de escala, matemáticamente neutro. (4) <strong>Prior uniforme:</strong> P(H)=0,5, válido solo si genuinamente no sabes nada. Con n &gt; 100 observaciones, priors razonablemente distintos convergen al mismo posterior si los datos son informativos.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué es el teorema de Bayes aplicado al diagnóstico médico?</h4>
                <p>En diagnóstico: P(enfermedad|test+) = P(test+|enfermedad) × P(enfermedad) / P(test+). Donde P(test+|enfermedad) = sensibilidad, P(enfermedad) = prevalencia, P(test+) = P(test+|enf)×P(enf) + P(test+|sano)×P(sano). Ejemplo numérico: test COVID, sensibilidad=95%, especificidad=90%, prevalencia=1%. P(COVID|+) = (0,95×0,01) / (0,95×0,01 + 0,10×0,99) = 0,0095/0,1085 = <strong>8,8%</strong>. Conclusión: en población de baja prevalencia, un positivo es mayoritariamente un falso positivo. Comparar: con prevalencia=50% → VPP=90,5%. El mismo test, completamente diferente utilidad clínica.</p>
                <p className={styles.faqTip}>La paradoja del test: un test excelente en laboratorio puede ser clínicamente inútil en screening masivo de enfermedades raras.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué es la verosimilitud (likelihood) y en qué se diferencia del posterior?</h4>
                <p><strong>Verosimilitud P(E|H):</strong> mide cuán compatible es la evidencia E con la hipótesis H. Es una función de H dados los datos, no una probabilidad de H. No suma 1 al variar H. <strong>Posterior P(H|E):</strong> probabilidad de H dados los datos, sí suma 1 al variar H. La confusión entre ambos es el &quot;error del fiscal&quot;: confundir P(match_ADN|inocente) = 0,000001 con P(inocente|match_ADN) = 0,000001. Son distintas porque ignora la prevalencia de culpables con ese perfil ADN en la población. El <strong>Likelihood Ratio</strong> LR = P(E|H)/P(E|¬H) es la medida de fuerza de evidencia: LR=10 significa que E es 10× más probable si H es cierta que si no lo es.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cuándo usar inferencia bayesiana en lugar de tests estadísticos clásicos?</h4>
                <p>Usa inferencia <strong>bayesiana</strong> cuando: (1) tienes conocimiento previo relevante que sería un desperdicio ignorar, (2) necesitas probabilidades directas (&quot;87% de que el efecto sea positivo&quot;), (3) el tamaño muestral es pequeño y el prior mejora la estimación, (4) necesitas actualización continua (sistemas en tiempo real, A/B testing continuo), (5) quieres cuantificar evidencia a favor de H₀ (algo imposible con p-values). Usa tests <strong>frecuentistas</strong> cuando: (1) el campo exige p-values (reguladores farmacéuticos, publicaciones con estándares CONSORT), (2) no tienes justificación para priors informativos, (3) el n es grande y el prior tendrá poco impacto, (4) prefieres la objetividad percibida del procedimiento sin priors.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Qué son los intervalos creíbles y en qué se diferencian de los intervalos de confianza?</h4>
                <p><strong>Intervalo creíble bayesiano al 95%:</strong> &quot;dado los datos observados, hay un 95% de probabilidad de que el parámetro esté en [a, b]&quot;. Interpretación directa y natural. <strong>Intervalo de confianza frecuentista al 95%:</strong> &quot;si repitiéramos el experimento infinitas veces, el 95% de los intervalos calculados contendría el verdadero parámetro&quot;. NO significa que el parámetro esté en ese intervalo con probabilidad 95%. Ejemplo: estimación de conversión de una campaña. IC frecuentista 95% = [2,3% ; 5,7%]. IC creíble bayesiano 95% = [2,1% ; 5,4%]. Numéricamente similares, pero el bayesiano tiene la interpretación que los profesionales quieren usar (y que a menudo usan erróneamente para el frecuentista).</p>
                <p className={styles.faqTip}>El 95% del IC frecuentista es sobre el procedimiento, no sobre el parámetro. El 95% del IC creíble es sobre el parámetro.</p>
              </div>
              <div className={styles.eduFaqItem}>
                <h4>❓ ¿Cómo afecta el tamaño muestral al posterior?</h4>
                <p>Con <strong>n pequeño</strong>: el posterior está dominado por el prior; dos investigadores con priors distintos obtienen posteriors muy diferentes con los mismos datos. Con <strong>n grande</strong>: los datos dominan y el prior se &quot;lava&quot;; priors razonablemente distintos convergen al mismo posterior (fenómeno de &quot;consistencia bayesiana&quot;). Ejemplo numérico: prior P(moneda justa) = 0,5. Tras 10 lanzamientos con 7 caras → posterior = 65%. Tras 100 lanzamientos con 70 caras → posterior = 96,4%. Tras 1.000 lanzamientos con 700 caras → posterior &gt; 99,99%, independientemente del prior inicial (siempre que no fuera 0 o 1). Regla práctica: necesitas al menos n~10/P(H) observaciones para que los datos dominen sobre un prior informativo.</p>
              </div>
            </div>
          </div>

          {/* Guía Paso a Paso */}
          <div className={styles.eduStepSection}>
            <h3>📋 Test COVID con 95% Sensibilidad en Población con 1% de Prevalencia: Guía Paso a Paso</h3>
            <p className={styles.eduComparativaSubtitle}>7 pasos para aplicar el teorema de Bayes a un problema diagnóstico real</p>
            <div className={styles.eduStepGuide}>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>1</div>
                <div className={styles.eduStepContent}>
                  <h4>Define la hipótesis y la evidencia</h4>
                  <p><strong>H</strong> = &quot;el paciente tiene COVID-19&quot;. <strong>¬H</strong> = &quot;no tiene COVID-19&quot;. <strong>E</strong> = &quot;el test PCR da positivo&quot;. Pregunta que responde Bayes: P(COVID|test+), es decir, ¿qué probabilidad hay de tener COVID dado un positivo? Esta no es la sensibilidad del test, que responde a P(test+|COVID).</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>2</div>
                <div className={styles.eduStepContent}>
                  <h4>Establece el prior P(H) a partir de la prevalencia</h4>
                  <p><strong>P(COVID) = 1% = 0,01</strong>. Fuente: datos epidemiológicos de la región en ese momento. Este es el prior: de cada 100 personas que se hacen el test en esa situación epidemiológica, aproximadamente 1 tiene COVID. Por tanto P(¬COVID) = 0,99.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>3</div>
                <div className={styles.eduStepContent}>
                  <h4>Determina P(test+|COVID) — Sensibilidad</h4>
                  <p><strong>P(test+|COVID) = 95% = 0,95</strong>. Significado: si el paciente tiene COVID, el test detecta correctamente el 95% de los casos. El 5% restante son falsos negativos (test negativo en paciente enfermo). Este dato proviene de estudios de validación clínica del test PCR.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>4</div>
                <div className={styles.eduStepContent}>
                  <h4>Determina P(test+|¬COVID) — Tasa de falsos positivos</h4>
                  <p><strong>P(test+|¬COVID) = 1 − especificidad</strong>. Si especificidad = 90%, entonces P(test+|¬COVID) = <strong>10% = 0,10</strong>. Significado: 1 de cada 10 personas sanas da positivo igualmente. Este 10% de falsos positivos en una población mayoritariamente sana tendrá un gran impacto en el resultado final.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>5</div>
                <div className={styles.eduStepContent}>
                  <h4>Calcula P(test+) — Probabilidad total de obtener un positivo</h4>
                  <p>P(test+) = P(test+|COVID) × P(COVID) + P(test+|¬COVID) × P(¬COVID)</p>
                  <p>= 0,95 × 0,01 + 0,10 × 0,99 = <strong>0,0095 + 0,099 = 0,1085</strong></p>
                  <p>Interpretación: el 10,85% de los tests dan positivo. De cada 10.000 personas, 1.085 tienen test positivo.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>6</div>
                <div className={styles.eduStepContent}>
                  <h4>Aplica el Teorema de Bayes para obtener el posterior</h4>
                  <p>P(COVID|test+) = P(test+|COVID) × P(COVID) / P(test+)</p>
                  <p>= 0,95 × 0,01 / 0,1085 = 0,0095 / 0,1085 ≈ <strong>8,76%</strong></p>
                  <p>Visualización: de los 1.085 positivos por 10.000 personas, solo 95 son verdaderos positivos (enfermos) y 990 son falsos positivos (sanos con test erróneo). VPP = 95 / 1.085 = 8,76%.</p>
                </div>
              </div>
              <div className={styles.eduStepItem}>
                <div className={styles.eduStepNumber}>7</div>
                <div className={styles.eduStepContent}>
                  <h4>Interpreta y decide con el resultado</h4>
                  <p>Un test positivo, con esta prevalencia, solo implica <strong>8,76% de probabilidad real de tener COVID</strong>. Decisión clínica: no aislar definitivamente por un solo positivo, sino hacer test confirmatorio o esperar síntomas. Si la prevalencia sube al 10% (epidemia activa), el mismo test da VPP = 51,4%. Si la prevalencia es 30%, VPP = 80,3%. Comunicación al paciente: &quot;El test es positivo pero en la situación actual hay un 8,76% de probabilidad de que tengas COVID. Recomendamos confirmación.&quot;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className={styles.eduTipsSection}>
            <h3>✅ Mejores Prácticas en Inferencia Bayesiana</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📊</span>
                <h4>Siempre reporta el prior</h4>
                <p>Nunca presentes un posterior sin indicar el prior usado y su fuente. Dos personas con priors distintos obtienen resultados diferentes con los mismos datos.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🔢</span>
                <h4>Usa frecuencias naturales</h4>
                <p>En vez de &quot;0,001 probabilidad&quot;, di &quot;1 de cada 1.000 personas&quot;. Las frecuencias naturales reducen errores de interpretación hasta en un 70% según estudios de Gigerenzer.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🔄</span>
                <h4>Actualiza secuencialmente</h4>
                <p>No esperes a tener todos los datos. Cada nueva observación puede (y debe) actualizar el posterior. El aprendizaje bayesiano es continuo, no puntual.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">⚖️</span>
                <h4>Calcula el LR antes del prior</h4>
                <p>El Likelihood Ratio es la &quot;fuerza de la evidencia&quot; independiente del contexto. Calcula LR = P(E|H)/P(E|¬H) primero; luego aplica al prior específico de cada caso.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">🎯</span>
                <h4>Analiza la sensibilidad al prior</h4>
                <p>Si el posterior cambia mucho con pequeños cambios en el prior, necesitas más evidencia. Si es robusto al prior, los datos son suficientemente informativos.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon} aria-hidden="true">📝</span>
                <h4>Documenta tus asunciones</h4>
                <p>La independencia entre observaciones, la estacionariedad del proceso, y el modelo elegido son asunciones que afectan el resultado. Explicítalas siempre.</p>
              </div>
            </div>
          </div>

          {/* Warning Box */}
          <div className={styles.eduWarningBox}>
            <div className={styles.eduWarningHeader}>
              <span className={styles.eduWarningIcon} aria-hidden="true">⚠️</span>
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
