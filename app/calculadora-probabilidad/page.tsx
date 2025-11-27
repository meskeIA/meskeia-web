'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraProbabilidad.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';

type TipoCalculo = 'simple' | 'combinaciones' | 'permutaciones' | 'binomial' | 'condicional';

export default function CalculadoraProbabilidadPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('simple');

  // Probabilidad Simple
  const [favorables, setFavorables] = useState('');
  const [posibles, setPosibles] = useState('');

  // Combinaciones y Permutaciones
  const [n, setN] = useState('');
  const [r, setR] = useState('');

  // Distribución Binomial
  const [ensayos, setEnsayos] = useState('');
  const [exitos, setExitos] = useState('');
  const [probExito, setProbExito] = useState('');

  // Probabilidad Condicional
  const [probA, setProbA] = useState('');
  const [probB, setProbB] = useState('');
  const [probAyB, setProbAyB] = useState('');

  // Factorial helper
  const factorial = (num: number): number => {
    if (num < 0) return NaN;
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) {
      result *= i;
    }
    return result;
  };

  // Combinaciones C(n,r) = n! / (r! * (n-r)!)
  const calcularCombinaciones = (n: number, r: number): number => {
    if (r > n || r < 0 || n < 0) return NaN;
    return factorial(n) / (factorial(r) * factorial(n - r));
  };

  // Permutaciones P(n,r) = n! / (n-r)!
  const calcularPermutaciones = (n: number, r: number): number => {
    if (r > n || r < 0 || n < 0) return NaN;
    return factorial(n) / factorial(n - r);
  };

  // Distribución Binomial P(X=k) = C(n,k) * p^k * (1-p)^(n-k)
  const calcularBinomial = (n: number, k: number, p: number): number => {
    if (k > n || k < 0 || p < 0 || p > 1) return NaN;
    return calcularCombinaciones(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  const resultados = useMemo(() => {
    switch (tipoCalculo) {
      case 'simple': {
        const fav = parseInt(favorables);
        const pos = parseInt(posibles);
        if (isNaN(fav) || isNaN(pos) || pos <= 0 || fav < 0) return null;
        const prob = fav / pos;
        return {
          probabilidad: prob,
          porcentaje: prob * 100,
          odds: fav > 0 ? `${fav}:${pos - fav}` : '0:' + pos,
          complemento: 1 - prob
        };
      }
      case 'combinaciones': {
        const nVal = parseInt(n);
        const rVal = parseInt(r);
        if (isNaN(nVal) || isNaN(rVal)) return null;
        const comb = calcularCombinaciones(nVal, rVal);
        const perm = calcularPermutaciones(nVal, rVal);
        return {
          combinaciones: comb,
          permutaciones: perm,
          factorialN: factorial(nVal),
          factorialR: factorial(rVal)
        };
      }
      case 'permutaciones': {
        const nVal = parseInt(n);
        const rVal = parseInt(r);
        if (isNaN(nVal) || isNaN(rVal)) return null;
        const perm = calcularPermutaciones(nVal, rVal);
        const permConRep = Math.pow(nVal, rVal);
        return {
          permutaciones: perm,
          permutacionesConRepeticion: permConRep,
          factorialN: factorial(nVal)
        };
      }
      case 'binomial': {
        const nVal = parseInt(ensayos);
        const kVal = parseInt(exitos);
        const pVal = parseFloat(probExito.replace(',', '.'));
        if (isNaN(nVal) || isNaN(kVal) || isNaN(pVal)) return null;
        const probExacta = calcularBinomial(nVal, kVal, pVal);

        // P(X <= k)
        let probAcumulada = 0;
        for (let i = 0; i <= kVal; i++) {
          probAcumulada += calcularBinomial(nVal, i, pVal);
        }

        // Media y varianza
        const media = nVal * pVal;
        const varianza = nVal * pVal * (1 - pVal);

        return {
          probabilidadExacta: probExacta,
          probabilidadAcumulada: probAcumulada,
          media,
          varianza,
          desviacion: Math.sqrt(varianza)
        };
      }
      case 'condicional': {
        const pA = parseFloat(probA.replace(',', '.'));
        const pB = parseFloat(probB.replace(',', '.'));
        const pAB = parseFloat(probAyB.replace(',', '.'));
        if (isNaN(pA) || isNaN(pB) || isNaN(pAB)) return null;

        // P(A|B) = P(A∩B) / P(B)
        const pADadoB = pB > 0 ? pAB / pB : NaN;
        // P(B|A) = P(A∩B) / P(A)
        const pBDadoA = pA > 0 ? pAB / pA : NaN;
        // P(A∪B) = P(A) + P(B) - P(A∩B)
        const pAoB = pA + pB - pAB;
        // Independencia: P(A∩B) = P(A) * P(B)
        const sonIndependientes = Math.abs(pAB - (pA * pB)) < 0.001;

        return {
          pADadoB,
          pBDadoA,
          pAoB,
          sonIndependientes
        };
      }
      default:
        return null;
    }
  }, [tipoCalculo, favorables, posibles, n, r, ensayos, exitos, probExito, probA, probB, probAyB]);

  const limpiar = () => {
    setFavorables('');
    setPosibles('');
    setN('');
    setR('');
    setEnsayos('');
    setExitos('');
    setProbExito('');
    setProbA('');
    setProbB('');
    setProbAyB('');
  };

  const tipos: { id: TipoCalculo; nombre: string; icono: string }[] = [
    { id: 'simple', nombre: 'Probabilidad Simple', icono: '🎲' },
    { id: 'combinaciones', nombre: 'Combinaciones', icono: '🔢' },
    { id: 'permutaciones', nombre: 'Permutaciones', icono: '🔄' },
    { id: 'binomial', nombre: 'Distribución Binomial', icono: '📊' },
    { id: 'condicional', nombre: 'Probabilidad Condicional', icono: '🔗' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎲 Calculadora de Probabilidad</h1>
        <p className={styles.subtitle}>
          Calcula probabilidades, combinaciones, permutaciones y distribuciones estadísticas
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Cálculo</h2>

          <div className={styles.tiposGrid}>
            {tipos.map((tipo) => (
              <button
                key={tipo.id}
                className={`${styles.tipoBtn} ${tipoCalculo === tipo.id ? styles.tipoActivo : ''}`}
                onClick={() => { setTipoCalculo(tipo.id); limpiar(); }}
              >
                <span className={styles.tipoIcono}>{tipo.icono}</span>
                <span className={styles.tipoNombre}>{tipo.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.inputsSection}>
            {tipoCalculo === 'simple' && (
              <>
                <NumberInput
                  value={favorables}
                  onChange={setFavorables}
                  label="Casos favorables"
                  placeholder="6"
                  min={0}
                />
                <NumberInput
                  value={posibles}
                  onChange={setPosibles}
                  label="Casos posibles (total)"
                  placeholder="36"
                  min={1}
                />
                <p className={styles.helper}>Ejemplo: En 2 dados, probabilidad de sumar 7</p>
              </>
            )}

            {(tipoCalculo === 'combinaciones' || tipoCalculo === 'permutaciones') && (
              <>
                <NumberInput
                  value={n}
                  onChange={setN}
                  label="n (total de elementos)"
                  placeholder="10"
                  min={0}
                />
                <NumberInput
                  value={r}
                  onChange={setR}
                  label="r (elementos a elegir)"
                  placeholder="3"
                  min={0}
                />
                <p className={styles.helper}>
                  {tipoCalculo === 'combinaciones'
                    ? 'C(n,r): El orden NO importa'
                    : 'P(n,r): El orden SÍ importa'}
                </p>
              </>
            )}

            {tipoCalculo === 'binomial' && (
              <>
                <NumberInput
                  value={ensayos}
                  onChange={setEnsayos}
                  label="n (número de ensayos)"
                  placeholder="10"
                  min={1}
                />
                <NumberInput
                  value={exitos}
                  onChange={setExitos}
                  label="k (éxitos deseados)"
                  placeholder="3"
                  min={0}
                />
                <NumberInput
                  value={probExito}
                  onChange={setProbExito}
                  label="p (probabilidad de éxito)"
                  placeholder="0,5"
                  helperText="Valor entre 0 y 1"
                />
              </>
            )}

            {tipoCalculo === 'condicional' && (
              <>
                <NumberInput
                  value={probA}
                  onChange={setProbA}
                  label="P(A)"
                  placeholder="0,3"
                  helperText="Probabilidad del evento A"
                />
                <NumberInput
                  value={probB}
                  onChange={setProbB}
                  label="P(B)"
                  placeholder="0,4"
                  helperText="Probabilidad del evento B"
                />
                <NumberInput
                  value={probAyB}
                  onChange={setProbAyB}
                  label="P(A ∩ B)"
                  placeholder="0,12"
                  helperText="Probabilidad de A y B juntos"
                />
              </>
            )}
          </div>

          <button onClick={limpiar} className={styles.btnLimpiar}>
            Limpiar
          </button>
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📐</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {tipoCalculo === 'simple' && resultados && 'probabilidad' in resultados && (
                <>
                  <ResultCard
                    title="Probabilidad"
                    value={formatNumber(resultados.probabilidad, 6)}
                    variant="highlight"
                    icon="🎯"
                  />
                  <ResultCard
                    title="Porcentaje"
                    value={formatNumber(resultados.porcentaje, 2)}
                    unit="%"
                    variant="info"
                    icon="📊"
                  />
                  <ResultCard
                    title="Odds (a favor)"
                    value={resultados.odds}
                    variant="default"
                    icon="⚖️"
                  />
                  <ResultCard
                    title="Complemento P(no ocurra)"
                    value={formatNumber(resultados.complemento, 6)}
                    variant="default"
                    icon="🔄"
                  />
                </>
              )}

              {tipoCalculo === 'combinaciones' && resultados && 'combinaciones' in resultados && (
                <>
                  <ResultCard
                    title="Combinaciones C(n,r)"
                    value={formatNumber(resultados.combinaciones, 0)}
                    variant="highlight"
                    icon="🔢"
                    description="Sin importar el orden"
                  />
                  <ResultCard
                    title="Permutaciones P(n,r)"
                    value={formatNumber(resultados.permutaciones, 0)}
                    variant="info"
                    icon="🔄"
                    description="Importa el orden"
                  />
                  <ResultCard
                    title="n!"
                    value={formatNumber(resultados.factorialN, 0)}
                    variant="default"
                    icon="❗"
                  />
                  <ResultCard
                    title="r!"
                    value={formatNumber(resultados.factorialR, 0)}
                    variant="default"
                    icon="❗"
                  />
                </>
              )}

              {tipoCalculo === 'permutaciones' && resultados && 'permutaciones' in resultados && !('combinaciones' in resultados) && (
                <>
                  <ResultCard
                    title="Permutaciones P(n,r)"
                    value={formatNumber(resultados.permutaciones, 0)}
                    variant="highlight"
                    icon="🔄"
                    description="Sin repetición"
                  />
                  <ResultCard
                    title="Permutaciones con repetición"
                    value={formatNumber(resultados.permutacionesConRepeticion, 0)}
                    variant="info"
                    icon="🔁"
                    description="n^r"
                  />
                  <ResultCard
                    title="n!"
                    value={formatNumber(resultados.factorialN, 0)}
                    variant="default"
                    icon="❗"
                  />
                </>
              )}

              {tipoCalculo === 'binomial' && resultados && 'probabilidadExacta' in resultados && (
                <>
                  <ResultCard
                    title="P(X = k) exacta"
                    value={formatNumber(resultados.probabilidadExacta, 6)}
                    variant="highlight"
                    icon="🎯"
                    description={`${formatNumber(resultados.probabilidadExacta * 100, 2)}%`}
                  />
                  <ResultCard
                    title="P(X ≤ k) acumulada"
                    value={formatNumber(resultados.probabilidadAcumulada, 6)}
                    variant="info"
                    icon="📈"
                    description={`${formatNumber(resultados.probabilidadAcumulada * 100, 2)}%`}
                  />
                  <ResultCard
                    title="Media (μ)"
                    value={formatNumber(resultados.media, 2)}
                    variant="default"
                    icon="📊"
                    description="Valor esperado"
                  />
                  <ResultCard
                    title="Desviación estándar (σ)"
                    value={formatNumber(resultados.desviacion, 4)}
                    variant="default"
                    icon="📉"
                  />
                </>
              )}

              {tipoCalculo === 'condicional' && resultados && 'pADadoB' in resultados && (
                <>
                  <ResultCard
                    title="P(A|B)"
                    value={formatNumber(resultados.pADadoB, 6)}
                    variant="highlight"
                    icon="🔗"
                    description="Probabilidad de A dado B"
                  />
                  <ResultCard
                    title="P(B|A)"
                    value={formatNumber(resultados.pBDadoA, 6)}
                    variant="info"
                    icon="🔗"
                    description="Probabilidad de B dado A"
                  />
                  <ResultCard
                    title="P(A ∪ B)"
                    value={formatNumber(resultados.pAoB, 6)}
                    variant="default"
                    icon="⚡"
                    description="Probabilidad de A o B"
                  />
                  <ResultCard
                    title="¿Son independientes?"
                    value={resultados.sonIndependientes ? 'Sí' : 'No'}
                    variant={resultados.sonIndependientes ? 'success' : 'warning'}
                    icon={resultados.sonIndependientes ? '✅' : '❌'}
                  />
                </>
              )}
            </div>
          )}

          {tipoCalculo === 'simple' && resultados && 'probabilidad' in resultados && (
            <div className={styles.formulaBox}>
              <h3>Fórmula aplicada</h3>
              <p className={styles.formula}>
                P(E) = Casos favorables / Casos posibles = {favorables} / {posibles} = {formatNumber(resultados.probabilidad, 6)}
              </p>
            </div>
          )}

          {tipoCalculo === 'combinaciones' && resultados && 'combinaciones' in resultados && (
            <div className={styles.formulaBox}>
              <h3>Fórmulas aplicadas</h3>
              <p className={styles.formula}>
                C(n,r) = n! / (r! × (n-r)!) = {n}! / ({r}! × {parseInt(n) - parseInt(r)}!)
              </p>
              <p className={styles.formula}>
                P(n,r) = n! / (n-r)! = {n}! / {parseInt(n) - parseInt(r)}!
              </p>
            </div>
          )}

          {tipoCalculo === 'binomial' && resultados && 'probabilidadExacta' in resultados && (
            <div className={styles.formulaBox}>
              <h3>Fórmula Binomial</h3>
              <p className={styles.formula}>
                P(X=k) = C(n,k) × p^k × (1-p)^(n-k)
              </p>
              <p className={styles.formulaSmall}>
                P(X={exitos}) = C({ensayos},{exitos}) × {probExito}^{exitos} × (1-{probExito})^{parseInt(ensayos) - parseInt(exitos)}
              </p>
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Probabilidad?"
        subtitle="Descubre conceptos clave, fórmulas y ejemplos prácticos"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Fundamentales de Probabilidad</h2>
          <p className={styles.introParagraph}>
            La probabilidad es la rama de las matemáticas que estudia la posibilidad de que ocurran eventos.
            Se expresa como un número entre 0 (imposible) y 1 (seguro), o como porcentaje entre 0% y 100%.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Probabilidad Simple</h4>
              <p>
                P(E) = Casos favorables / Casos posibles. Es la base de toda la teoría de probabilidad.
                Ejemplo: En un dado, P(sacar 6) = 1/6 ≈ 0,167.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Combinaciones C(n,r)</h4>
              <p>
                Selección de r elementos de un conjunto de n donde el orden NO importa.
                Ejemplo: Elegir 3 cartas de 52 = C(52,3) = 22.100 formas.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Permutaciones P(n,r)</h4>
              <p>
                Ordenación de r elementos de un conjunto de n donde el orden SÍ importa.
                Ejemplo: Medallas (oro, plata, bronce) entre 10 atletas = P(10,3) = 720.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Distribución Binomial</h4>
              <p>
                Modela el número de éxitos en n ensayos independientes con probabilidad p.
                Ejemplo: Lanzar 10 monedas, probabilidad de exactamente 7 caras.
              </p>
            </div>
          </div>

          <h3>Probabilidad Condicional y Teorema de Bayes</h3>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>P(A|B) - Probabilidad Condicional</h4>
              <p>
                Probabilidad de A sabiendo que B ya ocurrió: P(A|B) = P(A∩B) / P(B).
                Fundamental en diagnósticos médicos y machine learning.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Eventos Independientes</h4>
              <p>
                Dos eventos son independientes si P(A∩B) = P(A) × P(B).
                Si un evento no afecta al otro, son independientes.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-probabilidad" />
    </div>
  );
}
