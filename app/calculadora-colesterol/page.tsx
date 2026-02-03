'use client';

import { useState, useCallback } from 'react';
import styles from './CalculadoraColesterol.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface CholesterolResults {
  ldlCalculado: number | null;
  ratioCtHdl: number;
  ratioLdlHdl: number;
  colesterolNoHdl: number;
  riesgoCtHdl: 'bajo' | 'moderado' | 'alto' | 'muy_alto';
  riesgoLdl: 'optimo' | 'cercano_optimo' | 'limite_alto' | 'alto' | 'muy_alto';
  riesgoHdl: 'bajo' | 'aceptable' | 'optimo';
  riesgoTrigliceridos: 'normal' | 'limite_alto' | 'alto' | 'muy_alto';
}

// Rangos de referencia según guías médicas
const RANGOS = {
  ldl: {
    optimo: 100,
    cercano_optimo: 129,
    limite_alto: 159,
    alto: 189,
  },
  hdl: {
    bajo: 40,
    aceptable: 60,
  },
  trigliceridos: {
    normal: 150,
    limite_alto: 199,
    alto: 499,
  },
  ratioCtHdl: {
    bajo: 3.5,
    moderado: 5,
    alto: 6,
  },
};

export default function CalculadoraColesterolPage() {
  const [colesterolTotal, setColesterolTotal] = useState('');
  const [hdl, setHdl] = useState('');
  const [ldl, setLdl] = useState('');
  const [trigliceridos, setTrigliceridos] = useState('');
  const [results, setResults] = useState<CholesterolResults | null>(null);

  // Calcular resultados
  const calcular = useCallback(() => {
    const ct = parseSpanishNumber(colesterolTotal);
    const hdlVal = parseSpanishNumber(hdl);
    const ldlInput = parseSpanishNumber(ldl);
    const tg = parseSpanishNumber(trigliceridos);

    // Validaciones mínimas
    if (isNaN(ct) || ct <= 0 || isNaN(hdlVal) || hdlVal <= 0) {
      alert('Por favor, introduce al menos el Colesterol Total y HDL');
      return;
    }

    // Calcular LDL con Friedewald si no se proporciona y hay triglicéridos
    let ldlVal = ldlInput;
    let ldlCalculado: number | null = null;

    if ((isNaN(ldlInput) || ldlInput <= 0) && !isNaN(tg) && tg > 0 && tg < 400) {
      // Fórmula de Friedewald: LDL = CT - HDL - (TG/5)
      ldlCalculado = ct - hdlVal - (tg / 5);
      ldlVal = ldlCalculado;
    }

    // Calcular ratios
    const ratioCtHdl = ct / hdlVal;
    const ratioLdlHdl = !isNaN(ldlVal) && ldlVal > 0 ? ldlVal / hdlVal : 0;
    const colesterolNoHdl = ct - hdlVal;

    // Evaluar riesgos
    const riesgoCtHdl = evaluarRatioCtHdl(ratioCtHdl);
    const riesgoLdl = evaluarLdl(ldlVal);
    const riesgoHdl = evaluarHdl(hdlVal);
    const riesgoTrigliceridos = evaluarTrigliceridos(tg);

    setResults({
      ldlCalculado,
      ratioCtHdl,
      ratioLdlHdl,
      colesterolNoHdl,
      riesgoCtHdl,
      riesgoLdl,
      riesgoHdl,
      riesgoTrigliceridos,
    });
  }, [colesterolTotal, hdl, ldl, trigliceridos]);

  // Funciones de evaluación
  const evaluarRatioCtHdl = (ratio: number): 'bajo' | 'moderado' | 'alto' | 'muy_alto' => {
    if (ratio < RANGOS.ratioCtHdl.bajo) return 'bajo';
    if (ratio < RANGOS.ratioCtHdl.moderado) return 'moderado';
    if (ratio < RANGOS.ratioCtHdl.alto) return 'alto';
    return 'muy_alto';
  };

  const evaluarLdl = (val: number): 'optimo' | 'cercano_optimo' | 'limite_alto' | 'alto' | 'muy_alto' => {
    if (isNaN(val) || val <= 0) return 'optimo';
    if (val < RANGOS.ldl.optimo) return 'optimo';
    if (val <= RANGOS.ldl.cercano_optimo) return 'cercano_optimo';
    if (val <= RANGOS.ldl.limite_alto) return 'limite_alto';
    if (val <= RANGOS.ldl.alto) return 'alto';
    return 'muy_alto';
  };

  const evaluarHdl = (val: number): 'bajo' | 'aceptable' | 'optimo' => {
    if (val < RANGOS.hdl.bajo) return 'bajo';
    if (val < RANGOS.hdl.aceptable) return 'aceptable';
    return 'optimo';
  };

  const evaluarTrigliceridos = (val: number): 'normal' | 'limite_alto' | 'alto' | 'muy_alto' => {
    if (isNaN(val) || val <= 0) return 'normal';
    if (val < RANGOS.trigliceridos.normal) return 'normal';
    if (val <= RANGOS.trigliceridos.limite_alto) return 'limite_alto';
    if (val <= RANGOS.trigliceridos.alto) return 'alto';
    return 'muy_alto';
  };

  // Obtener variante de ResultCard según riesgo
  const getVariant = (riesgo: string): 'success' | 'warning' | 'default' | 'highlight' => {
    if (riesgo === 'bajo' || riesgo === 'optimo' || riesgo === 'normal') return 'success';
    if (riesgo === 'moderado' || riesgo === 'cercano_optimo' || riesgo === 'aceptable' || riesgo === 'limite_alto') return 'warning';
    return 'default';
  };

  // Textos de riesgo
  const textoRiesgo: Record<string, string> = {
    bajo: 'Riesgo bajo',
    moderado: 'Riesgo moderado',
    alto: 'Riesgo alto',
    muy_alto: 'Riesgo muy alto',
    optimo: 'Óptimo',
    cercano_optimo: 'Cercano al óptimo',
    limite_alto: 'Límite alto',
    normal: 'Normal',
    aceptable: 'Aceptable',
  };

  // Generar recomendaciones
  const getRecomendaciones = (): string[] => {
    if (!results) return [];
    const recs: string[] = [];

    // Ratio CT/HDL
    if (results.riesgoCtHdl === 'alto' || results.riesgoCtHdl === 'muy_alto') {
      recs.push('Tu ratio CT/HDL indica riesgo cardiovascular elevado. Consulta con tu médico.');
    }

    // LDL
    if (results.riesgoLdl === 'alto' || results.riesgoLdl === 'muy_alto') {
      recs.push('Tu LDL (colesterol malo) está elevado. Considera reducir grasas saturadas y trans.');
    } else if (results.riesgoLdl === 'limite_alto') {
      recs.push('Tu LDL está en el límite. Vigila tu dieta y haz ejercicio regularmente.');
    }

    // HDL
    if (results.riesgoHdl === 'bajo') {
      recs.push('Tu HDL (colesterol bueno) es bajo. El ejercicio aeróbico puede ayudar a aumentarlo.');
    }

    // Triglicéridos
    if (results.riesgoTrigliceridos === 'alto' || results.riesgoTrigliceridos === 'muy_alto') {
      recs.push('Triglicéridos altos: reduce azúcares, alcohol y carbohidratos refinados.');
    } else if (results.riesgoTrigliceridos === 'limite_alto') {
      recs.push('Triglicéridos en el límite. Modera el consumo de azúcares y alcohol.');
    }

    // Si todo está bien
    if (recs.length === 0) {
      recs.push('Tus valores están dentro de rangos saludables. Mantén tus hábitos actuales.');
    }

    return recs;
  };

  // Limpiar
  const limpiar = () => {
    setColesterolTotal('');
    setHdl('');
    setLdl('');
    setTrigliceridos('');
    setResults(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🩺</span>
        <h1 className={styles.title}>Calculadora de Colesterol</h1>
        <p className={styles.subtitle}>
          Analiza tus niveles de colesterol, calcula ratios de riesgo cardiovascular
          y obtén recomendaciones personalizadas.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Formulario */}
      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Introduce tus valores</h2>
          <p className={styles.panelSubtitle}>Los valores deben estar en mg/dL (miligramos por decilitro)</p>

          <div className={styles.inputGrid}>
            <NumberInput
              value={colesterolTotal}
              onChange={setColesterolTotal}
              label="Colesterol Total (CT)"
              placeholder="200"
              helperText="Obligatorio"
              min={50}
              max={500}
            />
            <NumberInput
              value={hdl}
              onChange={setHdl}
              label="HDL (colesterol bueno)"
              placeholder="55"
              helperText="Obligatorio"
              min={10}
              max={150}
            />
            <NumberInput
              value={ldl}
              onChange={setLdl}
              label="LDL (colesterol malo)"
              placeholder="130"
              helperText="Opcional (se calcula si hay TG)"
              min={30}
              max={400}
            />
            <NumberInput
              value={trigliceridos}
              onChange={setTrigliceridos}
              label="Triglicéridos (TG)"
              placeholder="150"
              helperText="Opcional"
              min={30}
              max={1000}
            />
          </div>

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Analizar
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        {/* Resultados */}
        {results && (
          <div className={styles.resultsPanel}>
            <h2 className={styles.panelTitle}>Resultados</h2>

            <div className={styles.resultsGrid}>
              <ResultCard
                title="Ratio CT/HDL"
                value={formatNumber(results.ratioCtHdl, 2)}
                variant={getVariant(results.riesgoCtHdl)}
                icon="📊"
                description={textoRiesgo[results.riesgoCtHdl]}
              />
              <ResultCard
                title="Colesterol No-HDL"
                value={formatNumber(results.colesterolNoHdl, 0)}
                unit="mg/dL"
                variant={results.colesterolNoHdl < 130 ? 'success' : results.colesterolNoHdl < 160 ? 'warning' : 'default'}
                icon="🔬"
                description={results.colesterolNoHdl < 130 ? 'Óptimo' : results.colesterolNoHdl < 160 ? 'Aceptable' : 'Elevado'}
              />
              {results.ldlCalculado !== null && (
                <ResultCard
                  title="LDL (Friedewald)"
                  value={formatNumber(results.ldlCalculado, 0)}
                  unit="mg/dL"
                  variant={getVariant(results.riesgoLdl)}
                  icon="🧮"
                  description="Calculado automáticamente"
                />
              )}
              {results.ratioLdlHdl > 0 && (
                <ResultCard
                  title="Ratio LDL/HDL"
                  value={formatNumber(results.ratioLdlHdl, 2)}
                  variant={results.ratioLdlHdl < 2.5 ? 'success' : results.ratioLdlHdl < 3.5 ? 'warning' : 'default'}
                  icon="⚖️"
                  description={results.ratioLdlHdl < 2.5 ? 'Óptimo' : results.ratioLdlHdl < 3.5 ? 'Aceptable' : 'Elevado'}
                />
              )}
            </div>

            {/* Evaluación individual */}
            <div className={styles.evaluationSection}>
              <h3>Evaluación por parámetro</h3>
              <div className={styles.evaluationGrid}>
                <div className={`${styles.evaluationItem} ${styles[results.riesgoHdl]}`}>
                  <span className={styles.evalLabel}>HDL</span>
                  <span className={styles.evalValue}>{textoRiesgo[results.riesgoHdl]}</span>
                </div>
                <div className={`${styles.evaluationItem} ${styles[results.riesgoLdl]}`}>
                  <span className={styles.evalLabel}>LDL</span>
                  <span className={styles.evalValue}>{textoRiesgo[results.riesgoLdl]}</span>
                </div>
                <div className={`${styles.evaluationItem} ${styles[results.riesgoTrigliceridos]}`}>
                  <span className={styles.evalLabel}>Triglicéridos</span>
                  <span className={styles.evalValue}>{textoRiesgo[results.riesgoTrigliceridos]}</span>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className={styles.recommendationsSection}>
              <h3>💡 Recomendaciones</h3>
              <ul className={styles.recommendationsList}>
                {getRecomendaciones().map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>


      {/* Disclaimer Médico - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="medical"
        severity="critical"
        collapsible={false}
        context="calculadora-colesterol"
      >
        <p>
          Esta calculadora analiza valores de un <strong>análisis de sangre (analítica de lípidos)</strong>.
          Es fundamental que entiendas las siguientes limitaciones:
        </p>

        <ul className={styles.disclaimerList}>
          <li><strong>NO diagnostica enfermedades cardiovasculares</strong>: Los valores de colesterol son SOLO UNO de muchos factores de riesgo (hipertensión, diabetes, tabaquismo, historial familiar, edad, etc.)</li>
          <li><strong>Los rangos de referencia varían según tu perfil</strong>: Una persona con diabetes, hipertensión o antecedentes de infarto necesita valores de LDL más bajos que una persona sana</li>
          <li><strong>La fórmula de Friedewald tiene limitaciones</strong>: No es válida si los triglicéridos superan 400 mg/dL. Para triglicéridos muy altos, se necesita LDL directo</li>
          <li><strong>Los resultados requieren contexto clínico</strong>: Tu médico debe valorar analíticas previas, síntomas, medicación actual y otros factores antes de tomar decisiones</li>
        </ul>

        <p className={styles.highlight}>
          <strong>⚕️ Esta herramienta NO sustituye la interpretación médica de tus análisis.</strong>
          Si tu analítica muestra valores alterados, consulta con tu médico de familia, cardiólogo o endocrinólogo.
          Nunca inicies, cambies o suspendas medicación sin supervisión médica.
        </p>

        <p className={styles.emergency}>
          🚨 <strong>Si presentas dolor torácico, falta de aire, mareos intensos o síntomas de infarto,
          llama al 112 inmediatamente.</strong> El colesterol alto no suele dar síntomas hasta que causa complicaciones graves.
        </p>
      </DisclaimerCard>

      {/* Contenido Educativo */}
      <EducationalSection
        title="¿Qué significan estos valores?"
        subtitle="Entiende tu perfil lipídico y los factores de riesgo cardiovascular"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>Los componentes del colesterol</h2>
          <p className={styles.introParagraph}>
            El colesterol es una grasa esencial para el cuerpo, pero su exceso en sangre
            puede acumularse en las arterias y aumentar el riesgo cardiovascular.
            Un análisis de sangre mide varios parámetros que, en conjunto, dan una imagen
            completa de tu salud cardiovascular.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔵 Colesterol Total (CT)</h4>
              <p>
                Suma de todo el colesterol en sangre (HDL + LDL + VLDL).
                Es una medida general, pero por sí solo no indica el riesgo real.
              </p>
              <ul>
                <li><strong>Deseable:</strong> menos de 200 mg/dL</li>
                <li><strong>Límite alto:</strong> 200-239 mg/dL</li>
                <li><strong>Alto:</strong> 240 mg/dL o más</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>💚 HDL (Colesterol Bueno)</h4>
              <p>
                Lipoproteína de Alta Densidad. Transporta el colesterol desde las arterias
                hacia el hígado para su eliminación. <strong>Cuanto más alto, mejor</strong>.
              </p>
              <ul>
                <li><strong>Bajo (riesgo):</strong> menos de 40 mg/dL</li>
                <li><strong>Aceptable:</strong> 40-59 mg/dL</li>
                <li><strong>Óptimo (protector):</strong> 60 mg/dL o más</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>🔴 LDL (Colesterol Malo)</h4>
              <p>
                Lipoproteína de Baja Densidad. Deposita colesterol en las paredes arteriales,
                formando placas de ateroma. <strong>Cuanto más bajo, mejor</strong>.
              </p>
              <ul>
                <li><strong>Óptimo:</strong> menos de 100 mg/dL</li>
                <li><strong>Cercano al óptimo:</strong> 100-129 mg/dL</li>
                <li><strong>Límite alto:</strong> 130-159 mg/dL</li>
                <li><strong>Alto:</strong> 160-189 mg/dL</li>
                <li><strong>Muy alto:</strong> 190 mg/dL o más</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>🟡 Triglicéridos (TG)</h4>
              <p>
                Otro tipo de grasa en sangre. Niveles altos se asocian con enfermedad
                cardíaca, especialmente combinados con HDL bajo.
              </p>
              <ul>
                <li><strong>Normal:</strong> menos de 150 mg/dL</li>
                <li><strong>Límite alto:</strong> 150-199 mg/dL</li>
                <li><strong>Alto:</strong> 200-499 mg/dL</li>
                <li><strong>Muy alto:</strong> 500 mg/dL o más</li>
              </ul>
            </div>
          </div>

          <h3>Ratios e índices importantes</h3>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>📊 Ratio CT/HDL</h4>
              <p>
                El <strong>índice aterogénico</strong> más usado. Relaciona el colesterol total
                con el HDL protector. Es mejor predictor de riesgo que el CT solo.
              </p>
              <ul>
                <li><strong>Ideal:</strong> menos de 3,5</li>
                <li><strong>Moderado:</strong> 3,5 - 5</li>
                <li><strong>Riesgo alto:</strong> más de 5</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>⚖️ Ratio LDL/HDL</h4>
              <p>
                Compara directamente el colesterol &quot;malo&quot; con el &quot;bueno&quot;.
                Muy útil para evaluar el equilibrio del perfil lipídico.
              </p>
              <ul>
                <li><strong>Óptimo:</strong> menos de 2,5</li>
                <li><strong>Aceptable:</strong> 2,5 - 3,5</li>
                <li><strong>Elevado:</strong> más de 3,5</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>🔬 Colesterol No-HDL</h4>
              <p>
                CT menos HDL. Incluye todas las lipoproteínas aterogénicas (LDL, VLDL, etc.).
                Útil cuando no se mide LDL directamente.
              </p>
              <ul>
                <li><strong>Óptimo:</strong> menos de 130 mg/dL</li>
                <li><strong>Deseable:</strong> 130-159 mg/dL</li>
                <li><strong>Alto:</strong> 160 mg/dL o más</li>
              </ul>
            </div>

            <div className={styles.contentCard}>
              <h4>🧮 Fórmula de Friedewald</h4>
              <p>
                Permite estimar el LDL cuando no se mide directamente:
              </p>
              <p className={styles.formula}>
                LDL = CT - HDL - (Triglicéridos / 5)
              </p>
              <p>
                <em>Solo es válida si los triglicéridos son menores de 400 mg/dL.</em>
              </p>
            </div>
          </div>

          <h3>Factores que afectan el colesterol</h3>
          <ul className={styles.tipsList}>
            <li><strong>Dieta:</strong> Grasas saturadas y trans aumentan LDL; fibra y grasas insaturadas lo reducen.</li>
            <li><strong>Ejercicio:</strong> La actividad aeróbica regular aumenta el HDL protector.</li>
            <li><strong>Peso:</strong> El sobrepeso tiende a subir LDL y triglicéridos, y bajar HDL.</li>
            <li><strong>Tabaco:</strong> Fumar reduce el HDL y daña las arterias.</li>
            <li><strong>Genética:</strong> La hipercolesterolemia familiar causa niveles muy altos independientemente del estilo de vida.</li>
            <li><strong>Edad y sexo:</strong> El colesterol tiende a subir con la edad; las mujeres suelen tener HDL más alto.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-colesterol')} />
      <Footer appName="calculadora-colesterol" />
    </div>
  );
}
