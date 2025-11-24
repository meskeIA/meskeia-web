'use client';

import { useState, useEffect } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './ReglaDeTres.module.css';

type TabType = 'simple' | 'compuesta' | 'aprende';
type UnknownVar = 'a' | 'b' | 'c' | 'x';
type ProportionType = 'directa' | 'inversa';

interface HistoryItem {
  type: string;
  calculation: string;
  result: string;
  timestamp: string;
}

export default function ReglaDeTresPage() {
  const [activeTab, setActiveTab] = useState<TabType>('simple');
  const [unknownVar, setUnknownVar] = useState<UnknownVar>('x');
  const [proportionType, setProportionType] = useState<ProportionType>('directa');

  // Valores para regla simple
  const [a, setA] = useState<string>('');
  const [b, setB] = useState<string>('');
  const [c, setC] = useState<string>('');
  const [x, setX] = useState<string>('');

  // Valores para regla compuesta
  const [var1Known, setVar1Known] = useState<string>('');
  const [var1Unknown, setVar1Unknown] = useState<string>('');
  const [var2Known, setVar2Known] = useState<string>('');
  const [var2Unknown, setVar2Unknown] = useState<string>('');
  const [resultKnown, setResultKnown] = useState<string>('');
  const [relation1, setRelation1] = useState<ProportionType>('directa');
  const [relation2, setRelation2] = useState<ProportionType>('directa');

  // Resultado
  const [showResult, setShowResult] = useState<boolean>(false);
  const [resultMain, setResultMain] = useState<string>('');
  const [resultExplanation, setResultExplanation] = useState<string>('');
  const [resultSteps, setResultSteps] = useState<string[]>([]);

  // Historial
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Contenido educativo
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('meskeia_regla_tres_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4
    }).format(num);
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setShowResult(false);
  };

  const updateUnknown = (newUnknown: UnknownVar) => {
    setUnknownVar(newUnknown);
    // Limpiar el campo desconocido
    if (newUnknown === 'a') setA('');
    if (newUnknown === 'b') setB('');
    if (newUnknown === 'c') setC('');
    if (newUnknown === 'x') setX('');
  };

  const addToHistory = (type: string, calculation: string, result: string) => {
    const newItem: HistoryItem = {
      type,
      calculation,
      result,
      timestamp: new Date().toLocaleString('es-ES')
    };

    const newHistory = [newItem, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('meskeia_regla_tres_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres limpiar el historial?')) {
      setHistory([]);
      localStorage.removeItem('meskeia_regla_tres_history');
    }
  };

  const calculateSimple = () => {
    const values: { [key: string]: number } = {};

    if (unknownVar !== 'a' && a) values.a = parseFloat(a);
    if (unknownVar !== 'b' && b) values.b = parseFloat(b);
    if (unknownVar !== 'c' && c) values.c = parseFloat(c);
    if (unknownVar !== 'x' && x) values.x = parseFloat(x);

    if (Object.values(values).some(isNaN) || Object.keys(values).length !== 3) {
      alert('Por favor, introduce todos los valores conocidos correctamente');
      return;
    }

    let result = 0;
    let explanation = '';
    let steps: string[] = [];

    if (unknownVar === 'x') {
      if (proportionType === 'directa') {
        result = (values.b * values.c) / values.a;
        explanation = `Proporción directa: A más ${formatNumber(values.a)}, más ${formatNumber(values.c)}`;
        steps = [
          `Fórmula directa: X = (B × C) ÷ A`,
          `X = (${formatNumber(values.b)} × ${formatNumber(values.c)}) ÷ ${formatNumber(values.a)}`,
          `X = ${formatNumber(values.b * values.c)} ÷ ${formatNumber(values.a)}`,
          `X = ${formatNumber(result)}`
        ];
      } else {
        result = (values.b * values.a) / values.c;
        explanation = `Proporción inversa: A más ${formatNumber(values.a)}, menos resultado`;
        steps = [
          `Fórmula inversa: X = (B × A) ÷ C`,
          `X = (${formatNumber(values.b)} × ${formatNumber(values.a)}) ÷ ${formatNumber(values.c)}`,
          `X = ${formatNumber(values.b * values.a)} ÷ ${formatNumber(values.c)}`,
          `X = ${formatNumber(result)}`
        ];
      }
      setX(formatNumber(result));
    } else if (unknownVar === 'c') {
      if (proportionType === 'directa') {
        result = (values.a * values.x) / values.b;
        steps = [
          `Despejando C: C = (A × X) ÷ B`,
          `C = (${formatNumber(values.a)} × ${formatNumber(values.x)}) ÷ ${formatNumber(values.b)}`,
          `C = ${formatNumber(result)}`
        ];
      } else {
        result = (values.a * values.b) / values.x;
        steps = [
          `Proporción inversa, despejando C: C = (A × B) ÷ X`,
          `C = (${formatNumber(values.a)} × ${formatNumber(values.b)}) ÷ ${formatNumber(values.x)}`,
          `C = ${formatNumber(result)}`
        ];
      }
      explanation = `El tercer valor (C) es ${formatNumber(result)}`;
      setC(formatNumber(result));
    } else if (unknownVar === 'b') {
      if (proportionType === 'directa') {
        result = (values.c * values.a) / values.x;
        steps = [
          `Despejando B: B = (C × A) ÷ X`,
          `B = (${formatNumber(values.c)} × ${formatNumber(values.a)}) ÷ ${formatNumber(values.x)}`,
          `B = ${formatNumber(result)}`
        ];
      } else {
        result = (values.c * values.x) / values.a;
        steps = [
          `Proporción inversa, despejando B: B = (C × X) ÷ A`,
          `B = (${formatNumber(values.c)} × ${formatNumber(values.x)}) ÷ ${formatNumber(values.a)}`,
          `B = ${formatNumber(result)}`
        ];
      }
      explanation = `El segundo valor (B) es ${formatNumber(result)}`;
      setB(formatNumber(result));
    } else if (unknownVar === 'a') {
      if (proportionType === 'directa') {
        result = (values.b * values.c) / values.x;
        steps = [
          `Despejando A: A = (B × C) ÷ X`,
          `A = (${formatNumber(values.b)} × ${formatNumber(values.c)}) ÷ ${formatNumber(values.x)}`,
          `A = ${formatNumber(result)}`
        ];
      } else {
        result = (values.b * values.x) / values.c;
        steps = [
          `Proporción inversa, despejando A: A = (B × X) ÷ C`,
          `A = (${formatNumber(values.b)} × ${formatNumber(values.x)}) ÷ ${formatNumber(values.c)}`,
          `A = ${formatNumber(result)}`
        ];
      }
      explanation = `El primer valor (A) es ${formatNumber(result)}`;
      setA(formatNumber(result));
    }

    setResultMain(`${unknownVar.toUpperCase()} = ${formatNumber(result)}`);
    setResultExplanation(explanation);
    setResultSteps(steps);
    setShowResult(true);

    const proportionStr = `${unknownVar === 'a' ? '?' : formatNumber(values.a || result)} : ${unknownVar === 'b' ? '?' : formatNumber(values.b || result)} = ${unknownVar === 'c' ? '?' : formatNumber(values.c || result)} : ${unknownVar === 'x' ? '?' : formatNumber(values.x || result)}`;
    addToHistory('Simple', proportionStr, `${unknownVar.toUpperCase()} = ${formatNumber(result)}`);
  };

  const calculateCompound = () => {
    const v1k = parseFloat(var1Known);
    const v1u = parseFloat(var1Unknown);
    const v2k = parseFloat(var2Known);
    const v2u = parseFloat(var2Unknown);
    const rk = parseFloat(resultKnown);

    if ([v1k, v1u, v2k, v2u, rk].some(isNaN)) {
      alert('Por favor, introduce todos los valores');
      return;
    }

    let factor1 = relation1 === 'directa' ? v1u / v1k : v1k / v1u;
    let factor2 = relation2 === 'directa' ? v2u / v2k : v2k / v2u;
    const result = rk * factor1 * factor2;

    const steps = [
      `Variable 1 (${relation1}): ${formatNumber(v1k)} → ${formatNumber(v1u)}`,
      `Factor 1 = ${relation1 === 'directa' ? `${formatNumber(v1u)} ÷ ${formatNumber(v1k)}` : `${formatNumber(v1k)} ÷ ${formatNumber(v1u)}`} = ${formatNumber(factor1)}`,
      `Variable 2 (${relation2}): ${formatNumber(v2k)} → ${formatNumber(v2u)}`,
      `Factor 2 = ${relation2 === 'directa' ? `${formatNumber(v2u)} ÷ ${formatNumber(v2k)}` : `${formatNumber(v2k)} ÷ ${formatNumber(v2u)}`} = ${formatNumber(factor2)}`,
      `Resultado = ${formatNumber(rk)} × ${formatNumber(factor1)} × ${formatNumber(factor2)} = ${formatNumber(result)}`
    ];

    setResultMain(`Resultado = ${formatNumber(result)}`);
    setResultExplanation('Con las nuevas condiciones, el resultado cambia proporcionalmente');
    setResultSteps(steps);
    setShowResult(true);

    addToHistory('Compuesta', `${formatNumber(v1k)}→${formatNumber(v1u)}, ${formatNumber(v2k)}→${formatNumber(v2u)}`, formatNumber(result));
  };

  const loadExample = (type: string) => {
    setShowResult(false);

    switch (type) {
      case 'receta':
        setActiveTab('simple');
        setA('4');
        setB('200');
        setC('6');
        setX('');
        setUnknownVar('x');
        setProportionType('directa');
        setTimeout(() => calculateSimple(), 100);
        break;
      case 'pintura':
        setActiveTab('simple');
        setA('3');
        setB('2');
        setC('9');
        setX('');
        setUnknownVar('x');
        setProportionType('directa');
        setTimeout(() => calculateSimple(), 100);
        break;
      case 'velocidad':
        setActiveTab('simple');
        setA('2');
        setB('120');
        setC('3');
        setX('');
        setUnknownVar('x');
        setProportionType('directa');
        setTimeout(() => calculateSimple(), 100);
        break;
      case 'escalas':
        setActiveTab('simple');
        setA('1');
        setB('100');
        setC('5');
        setX('');
        setUnknownVar('x');
        setProportionType('directa');
        setTimeout(() => calculateSimple(), 100);
        break;
      case 'trabajo':
        setActiveTab('compuesta');
        setVar1Known('5');
        setVar1Unknown('8');
        setVar2Known('1');
        setVar2Unknown('1');
        setResultKnown('8');
        setRelation1('inversa');
        setRelation2('directa');
        setTimeout(() => calculateCompound(), 100);
        break;
    }
  };

  return (
    <>
      <AnalyticsTracker appName="regla-de-tres" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Calculadora de Regla de Tres",
            "description": "Herramienta educativa para resolver regla de tres simple y compuesta con explicaciones paso a paso y ejemplos prácticos españoles",
            "url": "https://meskeia.com/beta/regla-de-tres",
            "author": {
              "@type": "Organization",
              "name": "meskeIA",
              "email": "meskeia24@gmail.com"
            },
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web Browser",
            "inLanguage": "es-ES",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          })
        }}
      />

      <MeskeiaLogo />

      <div className={styles.container}>
        <div className={styles.pageTitle}>
          <h1>Calculadora de Regla de Tres</h1>
          <p className={styles.pageSubtitle}>
            Resuelve proporciones simples y compuestas con explicaciones paso a paso y ejemplos prácticos
          </p>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.calculatorPanel}>
            <div className={styles.calculatorTabs}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'simple' ? styles.active : ''}`}
                onClick={() => switchTab('simple')}
                type="button"
              >
                Simple
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'compuesta' ? styles.active : ''}`}
                onClick={() => switchTab('compuesta')}
                type="button"
              >
                Compuesta
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'aprende' ? styles.active : ''}`}
                onClick={() => switchTab('aprende')}
                type="button"
              >
                Aprende
              </button>
            </div>

            {activeTab === 'simple' && (
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>📐 Regla de Tres Simple</div>

                <div className={styles.proportionDisplay}>
                  <input
                    type="number"
                    value={a}
                    onChange={(e) => setA(e.target.value)}
                    className={`${styles.proportionInput} ${unknownVar === 'a' ? styles.unknown : ''}`}
                    placeholder="A"
                    step="0.01"
                    readOnly={unknownVar === 'a'}
                  />
                  <span className={styles.proportionSymbol}>:</span>
                  <input
                    type="number"
                    value={b}
                    onChange={(e) => setB(e.target.value)}
                    className={`${styles.proportionInput} ${unknownVar === 'b' ? styles.unknown : ''}`}
                    placeholder="B"
                    step="0.01"
                    readOnly={unknownVar === 'b'}
                  />
                  <span className={`${styles.proportionSymbol} ${styles.equalSign}`}>=</span>
                  <input
                    type="number"
                    value={c}
                    onChange={(e) => setC(e.target.value)}
                    className={`${styles.proportionInput} ${unknownVar === 'c' ? styles.unknown : ''}`}
                    placeholder="C"
                    step="0.01"
                    readOnly={unknownVar === 'c'}
                  />
                  <span className={styles.proportionSymbol}>:</span>
                  <input
                    type="number"
                    value={x}
                    onChange={(e) => setX(e.target.value)}
                    className={`${styles.proportionInput} ${unknownVar === 'x' ? styles.unknown : ''}`}
                    placeholder="X"
                    step="0.01"
                    readOnly={unknownVar === 'x'}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Selecciona qué valor quieres encontrar:</label>
                  <select value={unknownVar} onChange={(e) => updateUnknown(e.target.value as UnknownVar)}>
                    <option value="a">A (primer valor)</option>
                    <option value="b">B (segundo valor)</option>
                    <option value="c">C (tercer valor)</option>
                    <option value="x">X (cuarto valor)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Tipo de proporción:</label>
                  <select value={proportionType} onChange={(e) => setProportionType(e.target.value as ProportionType)}>
                    <option value="directa">Directa (a más, más)</option>
                    <option value="inversa">Inversa (a más, menos)</option>
                  </select>
                </div>

                <button type="button" className={styles.calcBtn} onClick={calculateSimple}>
                  Calcular
                </button>
              </div>
            )}

            {activeTab === 'compuesta' && (
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>📊 Regla de Tres Compuesta</div>

                <p className={styles.compuestaDesc}>
                  Para problemas con múltiples variables. Ejemplo: Si 5 trabajadores hacen 10 productos en 8 horas, ¿cuántos productos harán 8 trabajadores en 12 horas?
                </p>

                <div className={styles.inputGroup}>
                  <label>Variable 1 - Conocida:</label>
                  <input
                    type="number"
                    value={var1Known}
                    onChange={(e) => setVar1Known(e.target.value)}
                    className={styles.proportionInput}
                    placeholder="ej: 5 trabajadores"
                    step="0.01"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Variable 1 - Desconocida:</label>
                  <input
                    type="number"
                    value={var1Unknown}
                    onChange={(e) => setVar1Unknown(e.target.value)}
                    className={styles.proportionInput}
                    placeholder="ej: 8 trabajadores"
                    step="0.01"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Variable 2 - Conocida:</label>
                  <input
                    type="number"
                    value={var2Known}
                    onChange={(e) => setVar2Known(e.target.value)}
                    className={styles.proportionInput}
                    placeholder="ej: 8 horas"
                    step="0.01"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Variable 2 - Desconocida:</label>
                  <input
                    type="number"
                    value={var2Unknown}
                    onChange={(e) => setVar2Unknown(e.target.value)}
                    className={styles.proportionInput}
                    placeholder="ej: 12 horas"
                    step="0.01"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Resultado conocido:</label>
                  <input
                    type="number"
                    value={resultKnown}
                    onChange={(e) => setResultKnown(e.target.value)}
                    className={styles.proportionInput}
                    placeholder="ej: 10 productos"
                    step="0.01"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Relación Variable 1:</label>
                  <select value={relation1} onChange={(e) => setRelation1(e.target.value as ProportionType)}>
                    <option value="directa">Directa (más trabajadores → más productos)</option>
                    <option value="inversa">Inversa (más trabajadores → menos tiempo)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>Relación Variable 2:</label>
                  <select value={relation2} onChange={(e) => setRelation2(e.target.value as ProportionType)}>
                    <option value="directa">Directa (más horas → más productos)</option>
                    <option value="inversa">Inversa (más horas → menos velocidad)</option>
                  </select>
                </div>

                <button type="button" className={styles.calcBtn} onClick={calculateCompound}>
                  Calcular
                </button>
              </div>
            )}

            {activeTab === 'aprende' && (
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>📚 ¿Cómo funciona la Regla de Tres?</div>

                <div className={styles.aprendeContent}>
                  <h4>Regla de Tres Simple:</h4>
                  <p>
                    Se usa cuando tenemos 3 valores conocidos y queremos encontrar un cuarto valor.
                    La fórmula es: <strong>A : B = C : X</strong>
                  </p>

                  <p>
                    <strong>Directa:</strong> A más A, más C → X = (B × C) ÷ A<br />
                    <strong>Inversa:</strong> A más A, menos C → X = (B × A) ÷ C
                  </p>

                  <h4>Regla de Tres Compuesta:</h4>
                  <p>
                    Se usa cuando hay más de dos variables relacionadas. Se analiza cada variable por separado
                    para determinar si la relación es directa o inversa.
                  </p>

                  <div className={styles.example}>
                    <strong>💡 Ejemplo práctico:</strong><br />
                    Si 3 kg de naranjas cuestan 6€, ¿cuánto costarán 5 kg?<br />
                    <em>3 kg : 6€ = 5 kg : X€</em><br />
                    <em>X = (6€ × 5 kg) ÷ 3 kg = 10€</em>
                  </div>
                </div>
              </div>
            )}

            {showResult && (
              <div className={styles.resultSection}>
                <div className={styles.resultMain}>{resultMain}</div>
                <div className={styles.resultExplanation}>{resultExplanation}</div>
                {resultSteps.length > 0 && (
                  <div className={styles.resultSteps}>
                    <h4>Pasos de resolución:</h4>
                    {resultSteps.map((step, index) => (
                      <div key={index} className={styles.step}>{step}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.sidePanel}>
            <h3>Ejemplos rápidos</h3>
            <div className={styles.examplesGrid}>
              <button type="button" className={styles.exampleBtn} onClick={() => loadExample('receta')}>
                <div className={styles.exampleTitle}>🍰 Receta de cocina</div>
                <div className={styles.exampleDesc}>Para 4 personas necesito 200g harina. ¿Para 6 personas?</div>
              </button>

              <button type="button" className={styles.exampleBtn} onClick={() => loadExample('pintura')}>
                <div className={styles.exampleTitle}>🎨 Mezcla de pintura</div>
                <div className={styles.exampleDesc}>3 partes azul + 2 partes blanco = azul claro</div>
              </button>

              <button type="button" className={styles.exampleBtn} onClick={() => loadExample('velocidad')}>
                <div className={styles.exampleTitle}>🚗 Velocidad y tiempo</div>
                <div className={styles.exampleDesc}>En 2 horas recorro 120 km. ¿En 3 horas?</div>
              </button>

              <button type="button" className={styles.exampleBtn} onClick={() => loadExample('escalas')}>
                <div className={styles.exampleTitle}>📏 Escalas y planos</div>
                <div className={styles.exampleDesc}>En plano 1:100, 5cm representa 5m reales</div>
              </button>

              <button type="button" className={styles.exampleBtn} onClick={() => loadExample('trabajo')}>
                <div className={styles.exampleTitle}>👷 Trabajo y tiempo</div>
                <div className={styles.exampleDesc}>5 trabajadores, 8 días. ¿8 trabajadores cuántos días?</div>
              </button>
            </div>

            <div className={styles.historySection}>
              <h4>Historial de cálculos</h4>
              <div className={styles.historyList}>
                {history.length === 0 ? (
                  <div className={styles.historyEmpty}>No hay cálculos aún</div>
                ) : (
                  history.map((item, index) => (
                    <div key={index} className={styles.historyItem}>
                      <div>
                        <strong>[{item.type}] {item.result}</strong><br />
                        <small>{item.calculation}</small><br />
                        <small className={styles.timestamp}>{item.timestamp}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button type="button" className={styles.clearHistory} onClick={clearHistory}>
                Limpiar historial
              </button>
            </div>
          </div>
        </div>

        <div className={styles.educationalSection}>
          <h2>¿Cómo funciona esta regla de tres?</h2>
          <p>Herramienta especializada en regla de tres. Proporciona cálculos y análisis precisos para facilitar tu trabajo.</p>
          <ul>
            <li><strong>Función principal</strong>: Realiza cálculos especializados de forma rápida</li>
            <li><strong>Interfaz intuitiva</strong>: Diseño simple y fácil de usar sin curva de aprendizaje</li>
            <li><strong>Resultados instantáneos</strong>: Obtén respuestas al momento sin esperas</li>
            <li><strong>100% gratuito</strong>: Sin registro, sin límites, sin costos ocultos</li>
          </ul>
        </div>

        <div className={styles.educationalSection}>
          <h2>Casos de uso prácticos</h2>
          <ul>
            <li><strong>Uso profesional</strong>: Aplica en tu trabajo diario para ahorrar tiempo</li>
            <li><strong>Estudios</strong>: Ayuda en tareas académicas y proyectos</li>
            <li><strong>Vida cotidiana</strong>: Resuelve situaciones comunes del día a día</li>
            <li><strong>Toma de decisiones</strong>: Obtén datos precisos para decidir mejor</li>
          </ul>
        </div>
      </div>

      {/* Toggle para contenido educativo */}
      <div className={styles.educationalToggle}>
        <h3>📚 ¿Quieres aprender más sobre la Regla de Tres?</h3>
        <p className={styles.educationalSubtitle}>
          Descubre qué es la regla de tres, cuándo usarla, diferencias entre directa e inversa, casos de uso prácticos en la vida real, errores comunes y mucho más
        </p>
        <button
          type="button"
          onClick={() => setShowEducationalContent(!showEducationalContent)}
          className={styles.btnSecondary}
        >
          {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
        </button>
      </div>

      {/* Contenido educativo colapsable */}
      {showEducationalContent && (
        <div className={styles.educationalContent}>
          {/* Sección 1: Introducción */}
          <section className={styles.guideSection}>
            <h2>Guía Completa de la Regla de Tres</h2>

            <div className={styles.introSection}>
              <h3>¿Qué es la Regla de Tres?</h3>
              <p>
                La <strong>regla de tres</strong> es un método matemático que permite encontrar un valor desconocido cuando
                conocemos tres valores que guardan una relación de proporcionalidad. Es una de las herramientas más útiles
                para resolver problemas cotidianos de manera rápida y precisa.
              </p>
              <p>
                Se llama "de tres" porque necesitas <strong>tres valores conocidos</strong> para calcular el cuarto valor
                desconocido. Es aplicable en cocina, construcción, finanzas, ciencias, y prácticamente cualquier situación
                que involucre proporciones.
              </p>
            </div>

            {/* Tipos de regla de tres */}
            <div className={styles.typesSection}>
              <h3>Tipos de Regla de Tres</h3>
              <div className={styles.typesGrid}>
                <div className={styles.typeCard}>
                  <h4>📈 Regla de Tres Simple Directa</h4>
                  <p>
                    Cuando <strong>ambas magnitudes aumentan o disminuyen en la misma proporción</strong>. Si una
                    aumenta, la otra también aumenta proporcionalmente.
                  </p>
                  <p className={styles.example}>
                    <strong>Ejemplo:</strong> Si 3 kg de manzanas cuestan 9€, ¿cuánto costarán 5 kg?<br/>
                    Más kilos → Más dinero (proporcional directa)
                  </p>
                </div>

                <div className={styles.typeCard}>
                  <h4>📉 Regla de Tres Simple Inversa</h4>
                  <p>
                    Cuando <strong>una magnitud aumenta mientras la otra disminuye</strong> en proporción inversa.
                    Son magnitudes inversamente proporcionales.
                  </p>
                  <p className={styles.example}>
                    <strong>Ejemplo:</strong> Si 4 trabajadores tardan 12 días, ¿cuánto tardarán 6 trabajadores?<br/>
                    Más trabajadores → Menos días (proporcional inversa)
                  </p>
                </div>

                <div className={styles.typeCard}>
                  <h4>🔢 Regla de Tres Compuesta</h4>
                  <p>
                    Involucra <strong>más de dos magnitudes</strong> relacionadas simultáneamente. Combina
                    proporciones directas e inversas a la vez.
                  </p>
                  <p className={styles.example}>
                    <strong>Ejemplo:</strong> Si 5 obreros en 8 horas hacen 10 productos, ¿cuántos harán 8 obreros en 12 horas?<br/>
                    Múltiples variables relacionadas
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sección 2: Casos de Uso Prácticos */}
          <section className={styles.guideSection}>
            <h2>Casos de Uso en la Vida Real</h2>

            <div className={styles.useCasesGrid}>
              <div className={styles.useCaseCard}>
                <h3>🍳 Cocina y Recetas</h3>
                <ul>
                  <li><strong>Ajustar recetas:</strong> Si una receta es para 4 personas y necesitas 7 personas</li>
                  <li><strong>Conversión de ingredientes:</strong> Convertir gramos a tazas o cucharadas</li>
                  <li><strong>Tiempos de cocción:</strong> Ajustar tiempo según el tamaño de la porción</li>
                  <li><strong>Ejemplo:</strong> Si 200g de harina rinde para 4 personas, para 10 personas necesitas 500g</li>
                </ul>
              </div>

              <div className={styles.useCaseCard}>
                <h3>🏗️ Construcción y Reformas</h3>
                <ul>
                  <li><strong>Calcular materiales:</strong> Cemento, arena, ladrillos según metros cuadrados</li>
                  <li><strong>Pintura necesaria:</strong> Litros de pintura por m² de superficie</li>
                  <li><strong>Tiempo de obra:</strong> Obreros y días necesarios para terminar</li>
                  <li><strong>Ejemplo:</strong> Si 20 m² requieren 4 litros de pintura, 50 m² necesitarán 10 litros</li>
                </ul>
              </div>

              <div className={styles.useCaseCard}>
                <h3>💰 Finanzas y Comercio</h3>
                <ul>
                  <li><strong>Descuentos:</strong> Calcular precio final con porcentaje de descuento</li>
                  <li><strong>Conversión de divisas:</strong> Cambio de monedas en viajes</li>
                  <li><strong>Precios por cantidad:</strong> Comparar ofertas por peso o volumen</li>
                  <li><strong>Ejemplo:</strong> Si 100€ equivalen a 108 USD, ¿cuántos USD son 250€?</li>
                </ul>
              </div>

              <div className={styles.useCaseCard}>
                <h3>🚗 Viajes y Consumo</h3>
                <ul>
                  <li><strong>Consumo de combustible:</strong> Litros necesarios según kilómetros</li>
                  <li><strong>Velocidad y tiempo:</strong> Tiempo de viaje a diferentes velocidades</li>
                  <li><strong>Peajes y costes:</strong> Costes por kilómetro recorrido</li>
                  <li><strong>Ejemplo:</strong> Si 100 km consumen 6L, en 350 km consumirás 21L</li>
                </ul>
              </div>

              <div className={styles.useCaseCard}>
                <h3>⚗️ Química y Medicina</h3>
                <ul>
                  <li><strong>Dosificación de medicamentos:</strong> mg por kg de peso corporal</li>
                  <li><strong>Concentraciones:</strong> Diluir o concentrar soluciones</li>
                  <li><strong>Proporciones químicas:</strong> Mezclas y reactivos en laboratorio</li>
                  <li><strong>Ejemplo:</strong> Si 10 kg requieren 5 mg, ¿cuántos mg necesita una persona de 65 kg?</li>
                </ul>
              </div>

              <div className={styles.useCaseCard}>
                <h3>📐 Escalas y Planos</h3>
                <ul>
                  <li><strong>Planos arquitectónicos:</strong> Conversión escala 1:100, 1:50, etc.</li>
                  <li><strong>Mapas:</strong> Distancias reales vs distancias en mapa</li>
                  <li><strong>Maquetas:</strong> Proporciones para modelos a escala</li>
                  <li><strong>Ejemplo:</strong> Si en un plano 1:100, 5cm equivalen a 500cm reales</li>
                </ul>
              </div>

              <div className={styles.useCaseCard}>
                <h3>💼 Trabajo y Producción</h3>
                <ul>
                  <li><strong>Productividad:</strong> Unidades producidas por hora/trabajador</li>
                  <li><strong>Planificación:</strong> Recursos necesarios para un proyecto</li>
                  <li><strong>Costes laborales:</strong> Horas trabajadas vs salario</li>
                  <li><strong>Ejemplo:</strong> Si 3 personas tardan 10 horas, ¿cuánto tardan 7 personas? (inversa)</li>
                </ul>
              </div>

              <div className={styles.useCaseCard}>
                <h3>📊 Estadística y Porcentajes</h3>
                <ul>
                  <li><strong>Muestras poblacionales:</strong> Extrapolar datos de muestra</li>
                  <li><strong>Probabilidades:</strong> Calcular casos favorables</li>
                  <li><strong>Porcentajes:</strong> Cualquier cálculo porcentual</li>
                  <li><strong>Ejemplo:</strong> Si el 30% de 200 es 60, el 30% de 500 es 150</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sección 3: Cómo Identificar el Tipo */}
          <section className={styles.guideSection}>
            <h2>¿Cómo Saber si es Directa o Inversa?</h2>

            <div className={styles.identifySection}>
              <div className={styles.identifyCard}>
                <h3>✅ Es DIRECTA si:</h3>
                <ul>
                  <li>Al aumentar una magnitud, <strong>la otra también aumenta</strong></li>
                  <li>Al disminuir una magnitud, <strong>la otra también disminuye</strong></li>
                  <li>Las cantidades se mueven en <strong>la misma dirección</strong></li>
                  <li>Más de algo → Más de lo otro</li>
                  <li>Menos de algo → Menos de lo otro</li>
                </ul>
                <div className={styles.exampleBox}>
                  <strong>Ejemplos directos:</strong>
                  <p>• Más distancia → Más combustible</p>
                  <p>• Más kilos → Más precio</p>
                  <p>• Más horas → Más salario</p>
                  <p>• Más metros² → Más pintura</p>
                </div>
              </div>

              <div className={styles.identifyCard}>
                <h3>⚠️ Es INVERSA si:</h3>
                <ul>
                  <li>Al aumentar una magnitud, <strong>la otra disminuye</strong></li>
                  <li>Al disminuir una magnitud, <strong>la otra aumenta</strong></li>
                  <li>Las cantidades se mueven en <strong>dirección opuesta</strong></li>
                  <li>Más de algo → Menos de lo otro</li>
                  <li>Menos de algo → Más de lo otro</li>
                </ul>
                <div className={styles.exampleBox}>
                  <strong>Ejemplos inversos:</strong>
                  <p>• Más trabajadores → Menos tiempo</p>
                  <p>• Más velocidad → Menos tiempo</p>
                  <p>• Más grifos → Menos tiempo en llenar</p>
                  <p>• Más rendimiento → Menos consumo</p>
                </div>
              </div>
            </div>

            <div className={styles.trickSection}>
              <h4>🎯 Truco Infalible</h4>
              <p>
                Pregúntate: <strong>"Si duplico la primera cantidad, ¿qué pasa con la segunda?"</strong>
              </p>
              <ul>
                <li>Si también se duplica → <span className={styles.direct}>DIRECTA</span></li>
                <li>Si se reduce a la mitad → <span className={styles.inverse}>INVERSA</span></li>
              </ul>
            </div>
          </section>

          {/* Sección 4: Errores Comunes */}
          <section className={styles.guideSection}>
            <h2>Errores Comunes y Cómo Evitarlos</h2>

            <div className={styles.errorsGrid}>
              <div className={styles.errorCard}>
                <h4>❌ Error 1: Confundir Directa con Inversa</h4>
                <p className={styles.errorDesc}>
                  El error más común es aplicar regla directa cuando es inversa y viceversa.
                </p>
                <p className={styles.errorSolution}>
                  <strong>Solución:</strong> Siempre pregúntate si las magnitudes van en la misma dirección o en direcciones opuestas.
                  Haz una prueba mental duplicando una cantidad.
                </p>
              </div>

              <div className={styles.errorCard}>
                <h4>❌ Error 2: Olvidar las Unidades</h4>
                <p className={styles.errorDesc}>
                  Mezclar unidades diferentes (metros con kilómetros, horas con minutos) da resultados incorrectos.
                </p>
                <p className={styles.errorSolution}>
                  <strong>Solución:</strong> Convierte todas las cantidades a la misma unidad ANTES de calcular.
                  Ejemplo: Si tienes 2 horas y 30 minutos, usa 2,5 horas o 150 minutos, no mezcles.
                </p>
              </div>

              <div className={styles.errorCard}>
                <h4>❌ Error 3: Colocar Mal los Valores</h4>
                <p className={styles.errorDesc}>
                  Poner los números en posiciones incorrectas en la proporción A:B = C:X.
                </p>
                <p className={styles.errorSolution}>
                  <strong>Solución:</strong> Asegúrate de que A y C sean de la misma magnitud, y B y X de la otra.
                  Ejemplo: Si A es kilos, C también debe ser kilos. Si B es euros, X también será euros.
                </p>
              </div>

              <div className={styles.errorCard}>
                <h4>❌ Error 4: No Verificar el Resultado</h4>
                <p className={styles.errorDesc}>
                  Aceptar resultados absurdos sin cuestionar (ej: -10 kg de harina, 0,001 días).
                </p>
                <p className={styles.errorSolution}>
                  <strong>Solución:</strong> Siempre verifica que el resultado tenga sentido lógico.
                  Si 3 kg cuestan 9€, 5 kg NO pueden costar 1€. Revisa tus cálculos.
                </p>
              </div>

              <div className={styles.errorCard}>
                <h4>❌ Error 5: Aplicar Regla Simple a Problemas Compuestos</h4>
                <p className={styles.errorDesc}>
                  Intentar resolver con regla simple cuando hay más de dos magnitudes relacionadas.
                </p>
                <p className={styles.errorSolution}>
                  <strong>Solución:</strong> Si hay 3 o más magnitudes (trabajadores, horas, productos),
                  usa regla de tres compuesta, no simple.
                </p>
              </div>

              <div className={styles.errorCard}>
                <h4>❌ Error 6: División por Cero o Valores Inválidos</h4>
                <p className={styles.errorDesc}>
                  Introducir 0 en alguna de las cantidades conocidas hace la ecuación imposible.
                </p>
                <p className={styles.errorSolution}>
                  <strong>Solución:</strong> Todas las cantidades conocidas deben ser mayores que 0.
                  La regla de tres NO funciona con valores cero o negativos.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 5: FAQ */}
          <section className={styles.guideSection}>
            <h2>Preguntas Frecuentes</h2>

            <div className={styles.faqContainer}>
              <div className={styles.faqItem}>
                <h4>¿Cuándo debo usar regla de tres simple vs compuesta?</h4>
                <p>
                  Usa <strong>regla simple</strong> cuando solo tienes <strong>2 magnitudes relacionadas</strong>
                  (ej: kilos y precio, distancia y tiempo). Usa <strong>regla compuesta</strong> cuando tienes
                  <strong>3 o más magnitudes</strong> relacionadas simultáneamente (ej: trabajadores, horas y productos).
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Puedo usar regla de tres con decimales?</h4>
                <p>
                  Sí, totalmente. La regla de tres funciona con cualquier número real: enteros, decimales, fracciones.
                  Solo asegúrate de usar el mismo formato (decimal o fracción) en todos los valores para evitar confusiones.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué hago si el resultado me da un número muy grande o muy pequeño?</h4>
                <p>
                  Verifica primero que no hayas cometido errores de unidades (ej: confundir metros con kilómetros).
                  Si el resultado es correcto matemáticamente pero parece extraño, revisa el contexto del problema.
                  A veces los resultados extremos indican que algo en el planteamiento está mal.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Es lo mismo regla de tres que proporción?</h4>
                <p>
                  Sí, la regla de tres es un <strong>método para resolver proporciones</strong>. Toda regla de tres
                  se basa en establecer una proporción entre dos pares de valores. La proporción es el concepto matemático,
                  y la regla de tres es la técnica práctica para resolverla.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Funciona la regla de tres para porcentajes?</h4>
                <p>
                  Sí, los porcentajes son perfectos para regla de tres directa. Si X es el Y% de Z, puedes calcular
                  cualquier valor desconocido. Ejemplo: Si 50 es el 100%, ¿cuánto es el 30%? Respuesta: 15.
                  La regla de tres es la base de todos los cálculos porcentuales.
                </p>
              </div>

              <div className={styles.faqItem}>
                <h4>¿Qué significa "proporcionalidad directa" e "inversa"?</h4>
                <p>
                  <strong>Proporcionalidad directa:</strong> Dos magnitudes están directamente relacionadas si al multiplicar
                  una por un número, la otra también se multiplica por el mismo número. <strong>Proporcionalidad inversa:</strong>
                  Dos magnitudes son inversamente proporcionales si al multiplicar una por un número, la otra se divide por ese número.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      <Footer />
    </>
  );
}
