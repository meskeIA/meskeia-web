'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraProbabilidad.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Cálculo</h2>

          <div className={styles.tiposGrid}>
            {tipos.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                className={`${styles.tipoBtn} ${tipoCalculo === tipo.id ? styles.tipoActivo : ''}`}
                onClick={() => { setTipoCalculo(tipo.id); limpiar(); }}
                aria-pressed={tipoCalculo === tipo.id}
              >
                <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
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

          <button type="button" onClick={limpiar} className={styles.btnLimpiar}>
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
                    value={formatNumber(resultados.probabilidad ?? 0, 6)}
                    variant="highlight"
                    icon="🎯"
                  />
                  <ResultCard
                    title="Porcentaje"
                    value={formatNumber(resultados.porcentaje ?? 0, 2)}
                    unit="%"
                    variant="info"
                    icon="📊"
                  />
                  <ResultCard
                    title="Odds (a favor)"
                    value={resultados.odds ?? ''}
                    variant="default"
                    icon="⚖️"
                  />
                  <ResultCard
                    title="Complemento P(no ocurra)"
                    value={formatNumber(resultados.complemento ?? 0, 6)}
                    variant="default"
                    icon="🔄"
                  />
                </>
              )}

              {tipoCalculo === 'combinaciones' && resultados && 'combinaciones' in resultados && (
                <>
                  <ResultCard
                    title="Combinaciones C(n,r)"
                    value={formatNumber(resultados.combinaciones ?? 0, 0)}
                    variant="highlight"
                    icon="🔢"
                    description="Sin importar el orden"
                  />
                  <ResultCard
                    title="Permutaciones P(n,r)"
                    value={formatNumber(resultados.permutaciones ?? 0, 0)}
                    variant="info"
                    icon="🔄"
                    description="Importa el orden"
                  />
                  <ResultCard
                    title="n!"
                    value={formatNumber(resultados.factorialN ?? 0, 0)}
                    variant="default"
                    icon="❗"
                  />
                  <ResultCard
                    title="r!"
                    value={formatNumber(resultados.factorialR ?? 0, 0)}
                    variant="default"
                    icon="❗"
                  />
                </>
              )}

              {tipoCalculo === 'permutaciones' && resultados && 'permutaciones' in resultados && !('combinaciones' in resultados) && (
                <>
                  <ResultCard
                    title="Permutaciones P(n,r)"
                    value={formatNumber(resultados.permutaciones ?? 0, 0)}
                    variant="highlight"
                    icon="🔄"
                    description="Sin repetición"
                  />
                  <ResultCard
                    title="Permutaciones con repetición"
                    value={formatNumber(resultados.permutacionesConRepeticion ?? 0, 0)}
                    variant="info"
                    icon="🔁"
                    description="n^r"
                  />
                  <ResultCard
                    title="n!"
                    value={formatNumber(resultados.factorialN ?? 0, 0)}
                    variant="default"
                    icon="❗"
                  />
                </>
              )}

              {tipoCalculo === 'binomial' && resultados && 'probabilidadExacta' in resultados && (
                <>
                  <ResultCard
                    title="P(X = k) exacta"
                    value={formatNumber(resultados.probabilidadExacta ?? 0, 6)}
                    variant="highlight"
                    icon="🎯"
                    description={`${formatNumber((resultados.probabilidadExacta ?? 0) * 100, 2)}%`}
                  />
                  <ResultCard
                    title="P(X ≤ k) acumulada"
                    value={formatNumber(resultados.probabilidadAcumulada ?? 0, 6)}
                    variant="info"
                    icon="📈"
                    description={`${formatNumber((resultados.probabilidadAcumulada ?? 0) * 100, 2)}%`}
                  />
                  <ResultCard
                    title="Media (μ)"
                    value={formatNumber(resultados.media ?? 0, 2)}
                    variant="default"
                    icon="📊"
                    description="Valor esperado"
                  />
                  <ResultCard
                    title="Desviación estándar (σ)"
                    value={formatNumber(resultados.desviacion ?? 0, 4)}
                    variant="default"
                    icon="📉"
                  />
                </>
              )}

              {tipoCalculo === 'condicional' && resultados && 'pADadoB' in resultados && (
                <>
                  <ResultCard
                    title="P(A|B)"
                    value={formatNumber(resultados.pADadoB ?? 0, 6)}
                    variant="highlight"
                    icon="🔗"
                    description="Probabilidad de A dado B"
                  />
                  <ResultCard
                    title="P(B|A)"
                    value={formatNumber(resultados.pBDadoA ?? 0, 6)}
                    variant="info"
                    icon="🔗"
                    description="Probabilidad de B dado A"
                  />
                  <ResultCard
                    title="P(A ∪ B)"
                    value={formatNumber(resultados.pAoB ?? 0, 6)}
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
                P(E) = Casos favorables / Casos posibles = {favorables} / {posibles} = {formatNumber(resultados.probabilidad ?? 0, 6)}
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

      

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-probabilidad">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para comprender cálculos probabilísticos:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Verifica resultados en exámenes y trabajos</strong>: Especialmente en combinatoria, distribuciones y probabilidad condicional</li>
          <li><strong>Consulta con tu profesor</strong>: Para asegurarte de aplicar correctamente las fórmulas en contextos específicos</li>
        </ul>
      </DisclaimerCard>

      <EducationalSection
        title="Aprende Probabilidad: Conceptos, Fórmulas y Guía Práctica"
        subtitle="Desde probabilidad simple hasta distribuciones: todo lo que necesitas para dominar el cálculo probabilístico"
        icon="📚"
      >
        <div className={styles.educationalContent}>

          {/* Tabla comparativa */}
          <section className={styles.guideSection}>
            <h2>📊 Comparativa de los 6 Tipos de Cálculo</h2>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Fórmula</th>
                  <th>¿Orden importa?</th>
                  <th>¿Repetición?</th>
                  <th>Uso típico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Probabilidad Simple</strong></td>
                  <td>P = F / T</td>
                  <td>—</td>
                  <td>—</td>
                  <td>Dados, monedas, cartas</td>
                </tr>
                <tr>
                  <td><strong>Combinaciones</strong></td>
                  <td>n! / (r! × (n-r)!)</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Lotería, grupos, equipos</td>
                </tr>
                <tr>
                  <td><strong>Permutaciones sin rep.</strong></td>
                  <td>n! / (n-r)!</td>
                  <td>Sí</td>
                  <td>No</td>
                  <td>Pódio, contraseñas únicas</td>
                </tr>
                <tr>
                  <td><strong>Permutaciones con rep.</strong></td>
                  <td>n^r</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>PINs, códigos, matrículas</td>
                </tr>
                <tr>
                  <td><strong>Distribución Binomial</strong></td>
                  <td>C(n,k) · p^k · (1-p)^(n-k)</td>
                  <td>—</td>
                  <td>Independiente</td>
                  <td>Ensayos repetidos (acierto/fallo)</td>
                </tr>
                <tr>
                  <td><strong>Probabilidad Condicional</strong></td>
                  <td>P(A∩B) / P(B)</td>
                  <td>—</td>
                  <td>—</td>
                  <td>Diagnósticos, Bayes, ML</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Casos de uso */}
          <section className={styles.guideSection}>
            <h2>👥 ¿Quién usa esta calculadora?</h2>
            <div className={styles.casosUsoGrid}>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🎓</div>
                <div className={styles.casoTitle}>Estudiante de Bachillerato</div>
                <div className={styles.casoSubtitle}>Preparando selectividad / EvAU</div>
                <div className={styles.casoDesc}>
                  La combinatoria y probabilidad son temas fijos en matemáticas II.
                  Practica con combinaciones, permutaciones y probabilidad simple
                  para afianzar fórmulas y ganar velocidad en el examen.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🏫</div>
                <div className={styles.casoTitle}>Estudiante Universitario</div>
                <div className={styles.casoSubtitle}>Estadística, Matemáticas, Física</div>
                <div className={styles.casoDesc}>
                  La distribución binomial y la probabilidad condicional son pilares
                  de cualquier curso de probabilidad. Verifica tus cálculos y comprende
                  la diferencia entre P(X=k) exacta y P(X≤k) acumulada.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>🎲</div>
                <div className={styles.casoTitle}>Aficionado a Juegos Estratégicos</div>
                <div className={styles.casoSubtitle}>Póker, dados, loterías</div>
                <div className={styles.casoDesc}>
                  Calcula las probabilidades reales de tus jugadas favoritas.
                  ¿Cuántas manos de póker posibles hay? ¿Cuál es la probabilidad
                  de sacar una escalera de color? Los números te sorprenderán.
                </div>
              </div>
              <div className={styles.casoCard}>
                <div className={styles.casoIcon}>💻</div>
                <div className={styles.casoTitle}>Analista de Datos / ML</div>
                <div className={styles.casoSubtitle}>Machine Learning y estadística aplicada</div>
                <div className={styles.casoDesc}>
                  La probabilidad condicional es la base del Teorema de Bayes, clasificadores
                  Naive Bayes y diagnósticos médicos. Verifica los cálculos de tus modelos
                  probabilísticos con ejemplos concretos.
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas Frecuentes sobre Probabilidad</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cuándo uso combinaciones y cuándo permutaciones?</div>
                <div className={styles.faqRespuesta}>
                  La clave es el orden. Si el orden importa (el primero es diferente del segundo),
                  usa permutaciones. Si no importa, usa combinaciones. Ejemplo: elegir 3 personas de un
                  grupo de 10 para formar un equipo (orden no importa → combinaciones). Elegir oro,
                  plata y bronce entre 10 atletas (orden sí importa → permutaciones).
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es el factorial y por qué crece tan rápido?</div>
                <div className={styles.faqRespuesta}>
                  n! = n × (n-1) × (n-2) × ... × 1. Representa el número de formas de ordenar
                  n elementos. Crece extremadamente rápido: 10! = 3.628.800, 20! ≈ 2,4 × 10¹⁸.
                  Por eso los problemas de permutaciones de conjuntos grandes producen números astronómicos.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cuándo aplica exactamente la distribución binomial?</div>
                <div className={styles.faqRespuesta}>
                  Se aplica cuando: (1) hay n ensayos independientes, (2) cada ensayo tiene solo dos
                  resultados (éxito/fracaso), (3) la probabilidad p de éxito es constante en todos
                  los ensayos. Ejemplo válido: lanzar una moneda 10 veces. No válido: extraer cartas
                  sin reposición (p cambia en cada extracción).
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cómo calculo la probabilidad de ganar la Primitiva?</div>
                <div className={styles.faqRespuesta}>
                  La Primitiva consiste en acertar 6 números de 49. El número de combinaciones posibles
                  es C(49,6) = 13.983.816. La probabilidad de acertar el pleno es 1/13.983.816 ≈ 0,00000715%
                  (1 entre casi 14 millones). Con la calculadora: n=49, r=6 → combinaciones.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es el Teorema de Bayes y para qué sirve?</div>
                <div className={styles.faqRespuesta}>
                  Bayes permite actualizar probabilidades cuando se obtiene nueva información.
                  Fórmula: P(A|B) = P(B|A) × P(A) / P(B). Aplicación clásica: un test médico
                  con 99% de precisión puede dar muchos falsos positivos si la enfermedad es rara
                  (prevalencia 0,1%). Bayes explica por qué la probabilidad real de estar enfermo
                  puede ser solo del 9% aunque el test sea positivo.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Por qué la suma de todas las probabilidades debe ser 1?</div>
                <div className={styles.faqRespuesta}>
                  Porque la suma de todos los eventos posibles del espacio muestral representa
                  la certeza (algo SIEMPRE ocurre). Si P(cara) + P(cruz) = 0,5 + 0,5 = 1 en una
                  moneda justa. Si la suma no es 1, el modelo probabilístico está mal definido.
                  La propiedad del complemento: P(A) + P(no A) = 1 siempre.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es la falacia del jugador?</div>
                <div className={styles.faqRespuesta}>
                  Es el error de creer que eventos pasados independientes afectan probabilidades futuras.
                  Ejemplo: si en la ruleta han salido 10 rojos seguidos, muchos creen que toca negro.
                  Error: la probabilidad de rojo/negro siempre es la misma en cada tirada. Los eventos
                  son independientes. El casino fue diseñado para que los jugadores cometan este error.
                </div>
              </div>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cómo sé si dos eventos son independientes o dependientes?</div>
                <div className={styles.faqRespuesta}>
                  Matemáticamente: dos eventos A y B son independientes si P(A∩B) = P(A) × P(B).
                  Intuitivamente: B es independiente de A si conocer que A ocurrió no cambia la
                  probabilidad de B. Extracción con reposición → independiente. Sin reposición →
                  dependiente (la probabilidad cambia en cada extracción).
                </div>
              </div>
            </div>
          </section>

          {/* Guía paso a paso */}
          <section className={styles.guideSection}>
            <h2>🗺️ Cómo resolver cualquier problema de probabilidad: 6 pasos</h2>
            <ol className={styles.pasosList}>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>1</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Identifica si hay orden y si hay repetición</div>
                  <div className={styles.pasoDesc}>
                    Pregunta clave: ¿el orden de selección importa? ¿Se puede repetir un elemento?
                    Orden + sin repetición → permutaciones. Sin orden + sin repetición → combinaciones.
                    Orden + con repetición → permutaciones con repetición (n^r).
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>2</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Define el espacio muestral</div>
                  <div className={styles.pasoDesc}>
                    El espacio muestral es el conjunto de TODOS los resultados posibles.
                    Para un dado: {`{1,2,3,4,5,6}`}. Para dos dados: 36 pares posibles.
                    El denominador de la probabilidad simple siempre es el tamaño del espacio muestral.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>3</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Cuenta los casos favorables</div>
                  <div className={styles.pasoDesc}>
                    Identifica cuántos resultados del espacio muestral cumplen la condición buscada.
                    A veces se cuentan directamente; otras, con fórmulas de combinatoria.
                    En dos dados, sumar 7 tiene 6 casos favorables: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1).
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>4</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Elige el modelo probabilístico correcto</div>
                  <div className={styles.pasoDesc}>
                    ¿Ensayos repetidos con éxito/fracaso independiente? → Distribución binomial.
                    ¿Probabilidad conociendo que otro evento ocurrió? → Probabilidad condicional.
                    ¿Cuántas formas de organizar/seleccionar? → Combinatoria.
                    ¿Probabilidad directa? → Fórmula básica P = F/T.
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>5</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Aplica la fórmula y calcula</div>
                  <div className={styles.pasoDesc}>
                    Sustituye los valores en la fórmula elegida. Verifica que la probabilidad
                    resultante esté entre 0 y 1. Si es mayor que 1, hay un error en el planteamiento
                    (generalmente en el espacio muestral o en los casos favorables).
                  </div>
                </div>
              </li>
              <li className={styles.paso}>
                <span className={styles.pasoNum}>6</span>
                <div className={styles.pasoContent}>
                  <div className={styles.pasoTitle}>Interpreta el resultado en contexto</div>
                  <div className={styles.pasoDesc}>
                    Un resultado de 0,003 significa 0,3% de probabilidad (muy raro, 1 de cada 333 veces).
                    Convierte siempre a porcentaje para comunicar el resultado. Para decisiones,
                    compara con probabilidades de referencia: moneda = 50%, dado = 16,7%, lotería ≈ 0,000007%.
                  </div>
                </div>
              </li>
            </ol>
          </section>

          {/* Tips y Errores */}
          <section className={styles.guideSection}>
            <h2>💡 Tips y Errores Frecuentes</h2>
            <div className={styles.tipsErrorsSection}>
              <div className={styles.tipsColumn}>
                <div className={styles.tipsHeader}>✅ Tips de Experto</div>
                <div className={styles.tipItem}>
                  Usa el complemento para simplificar: P(&ldquo;al menos 1&rdquo;) = 1 - P(&ldquo;ninguno&rdquo;).
                  Casi siempre es más fácil calcular el complemento.
                </div>
                <div className={styles.tipItem}>
                  Antes de calcular, identifica: ¿con reposición (extracción + devolver) o sin
                  reposición? Cambia completamente la fórmula a usar.
                </div>
                <div className={styles.tipItem}>
                  En la binomial, calcula primero P(X=k) exacta y luego P(X≤k) acumulada
                  para entender la distribución completa.
                </div>
                <div className={styles.tipItem}>
                  P(A∪B) = P(A) + P(B) - P(A∩B). Recuerda restar la intersección
                  para no contarla dos veces (principio de inclusión-exclusión).
                </div>
                <div className={styles.tipItem}>
                  Para verificar: la suma de todas las probabilidades del espacio muestral
                  siempre debe dar exactamente 1 (o 100%).
                </div>
                <div className={styles.tipItem}>
                  En problemas con múltiples pasos, usa el principio multiplicativo:
                  si hay m formas de hacer A y n formas de hacer B, hay m×n formas de hacer A y B.
                </div>
              </div>
              <div className={styles.tipsColumn}>
                <div className={styles.errorsHeader}>❌ Errores Frecuentes</div>
                <div className={styles.errorItem}>
                  Confundir &ldquo;y&rdquo; con &ldquo;o&rdquo;: P(A y B) = P(A∩B) ≠ P(A∪B) = P(A o B).
                  Son operaciones completamente distintas.
                </div>
                <div className={styles.errorItem}>
                  Usar combinaciones cuando el orden importa. Si &ldquo;primero llegó Ana&rdquo;
                  es diferente de &ldquo;primero llegó Juan&rdquo;, son permutaciones.
                </div>
                <div className={styles.errorItem}>
                  Aplicar la binomial sin verificar que los ensayos sean independientes.
                  Si p cambia en cada ensayo (extracción sin reposición), la binomial no aplica.
                </div>
                <div className={styles.errorItem}>
                  Falacia del jugador: creer que racha de resultados pasados independientes
                  cambia la probabilidad futura. Cada lanzamiento de moneda siempre es 50%.
                </div>
                <div className={styles.errorItem}>
                  Confundir P(A|B) con P(B|A). Son probabilidades diferentes:
                  P(enfermo|positivo) ≠ P(positivo|enfermo).
                </div>
                <div className={styles.errorItem}>
                  Olvidar el caso complementario. En &ldquo;¿probabilidad de sacar al menos un 6 en 3 dados?&rdquo;
                  es más fácil calcular 1 - P(ningún 6) = 1 - (5/6)³ ≈ 42%.
                </div>
              </div>
            </div>
          </section>

          {/* Conceptos fundamentales (mantenido) */}
          <section className={styles.guideSection}>
            <h2>📖 Conceptos Fundamentales</h2>
            <p className={styles.introParagraph}>
              La probabilidad es la rama de las matemáticas que estudia la posibilidad de que ocurran eventos.
              Se expresa como un número entre 0 (imposible) y 1 (seguro), o como porcentaje entre 0% y 100%.
            </p>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>Probabilidad Simple</h4>
                <p>
                  P(E) = Casos favorables / Casos posibles. Es la base de toda la teoría.
                  Ejemplo: En un dado, P(sacar 6) = 1/6 ≈ 16,7%.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Combinaciones C(n,r)</h4>
                <p>
                  Selección de r elementos de n donde el orden NO importa.
                  Ejemplo: Elegir 3 cartas de 52 = C(52,3) = 22.100 formas.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Permutaciones P(n,r)</h4>
                <p>
                  Ordenación de r elementos de n donde el orden SÍ importa.
                  Ejemplo: Medallas entre 10 atletas = P(10,3) = 720 resultados.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Distribución Binomial</h4>
                <p>
                  Modela n ensayos independientes con probabilidad p constante.
                  Ejemplo: lanzar 10 monedas, probabilidad de exactamente 7 caras.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Probabilidad Condicional</h4>
                <p>
                  P(A|B) = P(A∩B) / P(B). Probabilidad de A sabiendo que B ocurrió.
                  Fundamental en diagnósticos médicos y machine learning (Bayes).
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Eventos Independientes</h4>
                <p>
                  A y B son independientes si P(A∩B) = P(A) × P(B). Si conocer B no
                  cambia la probabilidad de A, los eventos no se influyen entre sí.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 1 — Tabla Comparativa: Enfoques de Probabilidad */}
          <section className={styles.guideSection}>
            <h2>📐 Enfoques de la Probabilidad: Tabla Comparativa</h2>
            <p className={styles.introParagraph}>
              Existen cuatro grandes enfoques para definir y calcular probabilidades. Cada uno se aplica en contextos distintos y parte de supuestos diferentes.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Enfoque</th>
                    <th>Definición</th>
                    <th>Fórmula clave</th>
                    <th>Cuándo usar</th>
                    <th>Ejemplo concreto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Clásica (Laplace)</strong></td>
                    <td>Todos los resultados son igualmente posibles</td>
                    <td>P(A) = casos favorables / casos totales</td>
                    <td>Juegos de azar simétricos, dados, monedas, urnas</td>
                    <td>P(cara) = 1/2 = 0,5 con moneda justa</td>
                  </tr>
                  <tr>
                    <td><strong>Frecuentista</strong></td>
                    <td>Límite de la frecuencia relativa tras muchos ensayos</td>
                    <td>P(A) = lím n→∞ (n_A / n)</td>
                    <td>Experimentos repetibles, control de calidad, medicina</td>
                    <td>Lanzar moneda 10.000 veces → cara ≈ 5.000 veces → P ≈ 0,5</td>
                  </tr>
                  <tr>
                    <td><strong>Subjetiva (Bayesiana)</strong></td>
                    <td>Grado de creencia o confianza del observador, actualizable con evidencia</td>
                    <td>P(A|B) = P(B|A) × P(A) / P(B)</td>
                    <td>Diagnóstico médico, IA, decisiones con información parcial</td>
                    <td>Test COVID positivo (sensibilidad 99%): probabilidad real de infección depende de prevalencia</td>
                  </tr>
                  <tr>
                    <td><strong>Geométrica</strong></td>
                    <td>Proporción de área o longitud favorable sobre el total</td>
                    <td>P(A) = medida favorable / medida total</td>
                    <td>Problemas continuos, dardos, geometría probabilística</td>
                    <td>Aguja de Buffon: P(cruzar línea) = 2L / (πd) donde L es longitud de aguja y d separación de líneas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 2 — Casos de Uso por Perfil */}
          <section className={styles.guideSection}>
            <h2>👤 Quién Usa la Probabilidad: 4 Perfiles Reales</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🧮</span>
                  <div>
                    <strong>Estudiante de ESO/Bachillerato</strong>
                    <p>Combinatoria y probabilidad clásica</p>
                  </div>
                </div>
                <div className={styles.escenarioExample}>
                  <strong>Problema típico:</strong> ¿De cuántas formas se puede formar un comité de 3 personas de entre 8 candidatos?<br />
                  <em>C(8,3) = 8! / (3! × 5!) = 56 combinaciones</em>
                </div>
                <div className={styles.escenarioTip}>
                  Tip: Distingue siempre si el orden importa (permutación) o no (combinación) antes de escribir la fórmula.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🩺</span>
                  <div>
                    <strong>Médico o Profesional de la Salud</strong>
                    <p>Interpretación de tests diagnósticos</p>
                  </div>
                </div>
                <div className={styles.escenarioExample}>
                  <strong>Caso real:</strong> Test con sensibilidad 95% y especificidad 90%, enfermedad con prevalencia 1%.<br />
                  <em>Valor predictivo positivo (VPP) = P(enfermo|positivo) ≈ 8,7% — no el 95% que intuitivamente se asume</em>
                </div>
                <div className={styles.escenarioTip}>
                  Tip: Usa siempre el Teorema de Bayes con la prevalencia real de la población. El VPP varía radicalmente según el contexto.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🏭</span>
                  <div>
                    <strong>Gestor de Riesgos</strong>
                    <p>Evaluación de fallos y fiabilidad</p>
                  </div>
                </div>
                <div className={styles.escenarioExample}>
                  <strong>Escenario:</strong> Un componente falla con probabilidad 0,02 en cada uso. ¿Cuál es la probabilidad de que falle exactamente 1 vez en 10 usos?<br />
                  <em>P(X=1) = C(10,1) × 0,02¹ × 0,98⁹ ≈ 0,167 (16,7%)</em>
                </div>
                <div className={styles.escenarioTip}>
                  Tip: La distribución binomial es perfecta para modelar fallos en sistemas con n ensayos independientes y probabilidad de fallo constante.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon}>🎰</span>
                  <div>
                    <strong>Aficionado a Juegos de Azar</strong>
                    <p>Entender la ventaja de la banca</p>
                  </div>
                </div>
                <div className={styles.escenarioExample}>
                  <strong>Ejemplo — Ruleta europea:</strong> La banca tiene 37 números (1-36 + 0). Apostar a un número: P(ganar) = 1/37 ≈ 2,7%, pero el pago es 35:1.<br />
                  <em>Valor esperado por €1 = (1/37 × 35) − (36/37 × 1) = −0,027 € → ventaja banca 2,7%</em>
                </div>
                <div className={styles.escenarioTip}>
                  Tip: El valor esperado siempre es negativo para el jugador en juegos de casino. La probabilidad no &ldquo;recuerda&rdquo; tiradas anteriores (falacia del jugador).
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3 — FAQ Profesional */}
          <section className={styles.guideSection}>
            <h2>❓ Preguntas Frecuentes: Probabilidad en Profundidad</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué diferencia hay entre probabilidad y estadística?</div>
                <div className={styles.faqRespuesta}>
                  La probabilidad parte de un modelo conocido y predice resultados futuros. La estadística va en sentido contrario: parte de datos observados para inferir el modelo subyacente. Ejemplo: probabilidad dice &ldquo;si la moneda es justa, en 100 lanzamientos esperamos ~50 caras&rdquo;; estadística dice &ldquo;hemos obtenido 62 caras en 100 lanzamientos, ¿es la moneda justa?&rdquo;
                </div>
                <div className={styles.faqTip}>Regla práctica: probabilidad = deducción del modelo; estadística = inducción desde los datos.</div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es la probabilidad condicionada y cómo se interpreta?</div>
                <div className={styles.faqRespuesta}>
                  P(A|B) es la probabilidad de que ocurra A <em>sabiendo</em> que B ya ha ocurrido. Se calcula como P(A|B) = P(A∩B) / P(B). Reduce el espacio muestral al subconjunto compatible con B. Ejemplo: P(sacar 6 | el dado es par) = P({`{6}`} ∩ {`{2,4,6}`}) / P({`{2,4,6}`}) = (1/6) / (3/6) = 1/3 ≈ 33,3%.
                </div>
                <div className={styles.faqTip}>Visualízalo como: &ldquo;dado que estamos en el mundo donde B es verdad, ¿con qué frecuencia ocurre A?&rdquo;</div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué significa que dos sucesos sean independientes?</div>
                <div className={styles.faqRespuesta}>
                  A y B son independientes si P(A∩B) = P(A) × P(B), es decir, si el conocimiento de que B ocurrió no modifica la probabilidad de A. Equivalentemente, P(A|B) = P(A). Ejemplo con moneda y dado: P(cara ∩ sacar 6) = 0,5 × (1/6) = 1/12. Verificación: P(cara|sacar 6) = P(cara) = 0,5. Contra-ejemplo: extracción sin reposición — la segunda extracción depende de la primera.
                </div>
                <div className={styles.faqTip}>No confundir independencia con mutua exclusión: dos eventos mutuamente excluyentes con P &gt; 0 son necesariamente dependientes.</div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cómo funciona el Teorema de Bayes en diagnóstico médico?</div>
                <div className={styles.faqRespuesta}>
                  Ejemplo completo: enfermedad con prevalencia 1% (P(E)=0,01), test con sensibilidad 95% (P(+|E)=0,95) y especificidad 90% (P(−|no E)=0,90). Entonces P(+|no E)=0,10. Aplicando Bayes: P(E|+) = [0,95 × 0,01] / [0,95 × 0,01 + 0,10 × 0,99] = 0,0095 / (0,0095 + 0,099) ≈ 0,087 = 8,7%. A pesar de un test positivo, solo hay 8,7% de probabilidad real de estar enfermo.
                </div>
                <div className={styles.faqTip}>Este resultado contraintuitivo se llama paradoja de los falsos positivos. La baja prevalencia domina el resultado.</div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Por qué la probabilidad de cara/cruz no es exactamente 50%?</div>
                <div className={styles.faqRespuesta}>
                  En teoría (enfoque clásico de Laplace), P(cara) = 1/2 = 0,5 exactamente si la moneda es perfectamente simétrica y homogénea. En la práctica, los experimentos físicos muestran desviaciones mínimas: monedas reales tienen ligeras asimetrías de peso. El enfoque frecuentista confirma que tras muchos lanzamientos la frecuencia relativa se aproxima a 0,5 (ley de los grandes números), pero nunca con precisión infinita.
                </div>
                <div className={styles.faqTip}>La diferencia entre probabilidad teórica (modelo matemático) y frecuencia empírica (experimento real) es fundamental en estadística.</div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es la falacia del jugador y por qué es un error cognitivo?</div>
                <div className={styles.faqRespuesta}>
                  La falacia del jugador (gambler&apos;s fallacy) es creer que una racha de un resultado hace más probable el resultado contrario en el siguiente evento independiente. Ejemplo: ruleta muestra 10 rojos seguidos → P(negro en la siguiente tirada) sigue siendo 18/37 ≈ 48,6%, no aumenta. Los eventos pasados no &ldquo;desequilibran&rdquo; los futuros porque son estadísticamente independientes. La falacia se produce porque el cerebro busca patrones donde no los hay.
                </div>
                <div className={styles.faqTip}>La falacia inversa (hot hand fallacy) es creer que la racha continuará. Ambos son errores cognitivos bien documentados en psicología del comportamiento.</div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Cómo se calcula la probabilidad con dos dados?</div>
                <div className={styles.faqRespuesta}>
                  El espacio muestral de dos dados tiene 6 × 6 = 36 resultados equiprobables. Para calcular P(suma = k): contar los pares (d1, d2) tal que d1+d2=k. Suma 7: (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) → 6 casos → P = 6/36 = 1/6 ≈ 16,7%. Suma 2: solo (1,1) → P = 1/36 ≈ 2,8%. Suma 12: solo (6,6) → P = 1/36. La suma 7 es la más probable porque tiene más combinaciones.
                </div>
                <div className={styles.faqTip}>Con la calculadora: casos favorables = número de pares que suman k, casos posibles = 36.</div>
              </div>

              <div className={styles.faqItem}>
                <div className={styles.faqPregunta}>¿Qué es la ley de los grandes números?</div>
                <div className={styles.faqRespuesta}>
                  La ley de los grandes números (Bernoulli, 1713) establece que la frecuencia relativa de un suceso converge a su probabilidad teórica cuando el número de ensayos tiende a infinito. Versión débil: para cualquier ε &gt; 0, P(|frecuencia − p| &gt; ε) → 0 cuando n → ∞. Ejemplo: lanzar moneda 10 veces puede dar 7 caras (70%); lanzarla 1.000.000 de veces dará entre 49,9% y 50,1% con altísima probabilidad.
                </div>
                <div className={styles.faqTip}>La ley de los grandes números NO dice que las desviaciones se &ldquo;compensarán&rdquo; — las desviaciones absolutas crecen, solo la proporción converge.</div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4 — Guía Paso a Paso (7 pasos) */}
          <section className={styles.guideSection}>
            <h2>🗺️ Cómo Resolver Cualquier Problema de Probabilidad: 7 Pasos</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Identifica el experimento aleatorio</strong>
                  <p>Define claramente el experimento: ¿qué acción se realiza? ¿qué resultado se observa? Ejemplo: &ldquo;lanzar un dado de 6 caras una vez&rdquo;. Sin experimento bien definido, el cálculo carece de base.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Define el espacio muestral (Ω)</strong>
                  <p>Lista o describe todos los resultados posibles. Dado: Ω = {`{1,2,3,4,5,6}`}. Dos dados: 36 pares. Moneda 3 veces: 2³ = 8 resultados. El tamaño de Ω es el denominador en la probabilidad clásica.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Define el suceso de interés (A)</strong>
                  <p>Expresa el evento como subconjunto de Ω. &ldquo;Sacar número par&rdquo; = {`{2,4,6}`}. &ldquo;Sumar más de 9 con dos dados&rdquo; = {`{(4,6),(5,5),(5,6),(6,4),(6,5),(6,6)}`}. Contar los elementos de A da el numerador.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Verifica la equiprobabilidad o asigna probabilidades</strong>
                  <p>En el enfoque clásico, todos los resultados deben ser equiprobables. Si no lo son (dado cargado, urna con bolas de distinto peso), debes asignar probabilidades individuales y asegurarte de que sumen 1.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <strong>Elige el modelo y aplica la fórmula</strong>
                  <p>Selección sin orden → C(n,r). Selección con orden → P(n,r). Ensayos independientes éxito/fallo → Binomial B(n,p). Condicionado → P(A|B) = P(A∩B)/P(B). Probabilidad directa → P = F/T. Aplica la fórmula con los valores identificados.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <strong>Verifica que el resultado sea válido (0 ≤ P ≤ 1)</strong>
                  <p>Una probabilidad siempre está entre 0 y 1. Si obtienes un valor fuera de ese rango, revisa el espacio muestral o los casos favorables. Verifica también que P(A) + P(Ā) = 1 donde Ā es el complementario de A.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <strong>Interpreta el resultado en el contexto del problema</strong>
                  <p>Convierte a porcentaje para comunicar (0,167 → 16,7%). Compara con referencias: P &lt; 1% es muy improbable; P &gt; 90% es casi seguro. Para decisiones, calcula también el valor esperado: E[X] = Σ(x · P(x)) para saber si la apuesta o inversión es favorable.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5 — Mejores Prácticas */}
          <section className={styles.guideSection}>
            <h2>💡 Mejores Prácticas: 6 Tips Accionables</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <div className={styles.tipIcon}>🌳</div>
                <strong>Usa diagramas de árbol para probabilidad compuesta</strong>
                <p>Cuando hay varios pasos (extraer bolita, luego otra), dibuja el árbol de probabilidades. Las ramas representan resultados y sus etiquetas son probabilidades. La probabilidad de un camino completo es el producto de sus ramas: P(rojo, luego azul) = P(rojo) × P(azul|rojo).</p>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipIcon}>📊</div>
                <strong>Construye tablas de contingencia para Bayes</strong>
                <p>Antes de aplicar Bayes, construye una tabla 2×2 con valores absolutos (no porcentajes). Con población hipotética de 10.000 personas: enfermedad presente/ausente × test positivo/negativo. Esto hace visible el número de falsos positivos y facilita el cálculo mental.</p>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipIcon}>✅</div>
                <strong>Verifica siempre que las probabilidades sumen 1</strong>
                <p>Después de calcular todas las probabilidades de un espacio muestral, su suma debe ser exactamente 1. Si no, hay un error en el modelo. Ejemplo binomial: Σ P(X=k) para k de 0 a n siempre da 1. Es la prueba de coherencia básica de cualquier modelo probabilístico.</p>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipIcon}>🔄</div>
                <strong>Usa el complementario para simplificar</strong>
                <p>P(al menos 1 éxito en n ensayos) = 1 − P(ningún éxito) = 1 − (1−p)ⁿ. Casi siempre es más sencillo calcular el complementario. Ejemplo: P(al menos un 6 en 4 lanzamientos) = 1 − (5/6)⁴ ≈ 1 − 0,482 = 0,518 (51,8%).</p>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipIcon}>🔢</div>
                <strong>Verifica la independencia antes de multiplicar</strong>
                <p>P(A∩B) = P(A) × P(B) solo si A y B son independientes. Con extracción sin reposición, la segunda probabilidad cambia: extraer 2 ases de 52 cartas → P = (4/52) × (3/51) = 12/2652 ≈ 0,45%. No uses (4/52)² ya que los eventos son dependientes.</p>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipIcon}>📐</div>
                <strong>Redondea al final, no en pasos intermedios</strong>
                <p>En cálculos con múltiples pasos (Bayes, binomial acumulada), mantén todos los decimales hasta el resultado final. Redondear en cada paso acumula error. Ejemplo: P(A∩B) = 0,95 × 0,01 = 0,0095 (no 0,01 redondeado), luego calcular el denominador completo y redondear solo al presentar el resultado.</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 6 — Warning Box: Errores Clásicos */}
          <section className={styles.guideSection}>
            <h2>⚠️ Errores Clásicos que Debes Evitar</h2>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon}>🚨</span>
                <strong>6 errores frecuentes en cálculo de probabilidades</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Falacia del jugador:</strong> Creer que 10 rojos seguidos en la ruleta hace más probable el negro. La probabilidad de cada tirada independiente NO cambia: P(rojo) = 18/37 siempre, independientemente de tiradas previas. Los números no tienen memoria.
                </li>
                <li>
                  <strong>Confundir frecuencia relativa con probabilidad teórica:</strong> Si en 20 lanzamientos de moneda salen 13 caras (65%), eso no significa que P(cara) = 0,65. La frecuencia relativa converge a la probabilidad solo con muchos ensayos (ley de los grandes números). Con 20 lanzamientos, la variabilidad es alta.
                </li>
                <li>
                  <strong>No verificar independencia antes de multiplicar:</strong> P(A∩B) = P(A) × P(B) solo vale si A y B son independientes. Extraer 2 cartas de una baraja sin reposición: P(as en 1.ª y as en 2.ª) = (4/52) × (3/51) ≠ (4/52)². Ignorar la dependencia lleva a probabilidades incorrectas.
                </li>
                <li>
                  <strong>Confundir P(A|B) con P(B|A):</strong> Son probabilidades distintas. P(positivo|enfermo) = sensibilidad del test ≠ P(enfermo|positivo) = valor predictivo positivo. Este error, conocido como &ldquo;transposición del condicional&rdquo;, es frecuente en medicina y derecho y puede tener consecuencias graves.
                </li>
                <li>
                  <strong>Usar combinaciones cuando el orden importa:</strong> Si el problema pide &ldquo;¿de cuántas formas puede quedar el pódio (1.º, 2.º, 3.º)?&rdquo;, el orden importa → permutaciones P(n,r). Usar C(n,r) subestimaría el resultado: P(10,3) = 720 ≠ C(10,3) = 120.
                </li>
                <li>
                  <strong>Aplicar la binomial sin verificar sus condiciones:</strong> La distribución B(n,p) requiere: (1) n ensayos fijos, (2) exactamente dos resultados (éxito/fallo), (3) probabilidad p constante, (4) ensayos independientes. Si extraes bolas sin reposición de una urna, p cambia en cada extracción → la distribución correcta es la hipergeométrica, no la binomial.
                </li>
              </ul>
            </div>
          </section>

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-probabilidad')} />

      <ShareCard appName="calculadora-probabilidad" />
      <Footer appName="calculadora-probabilidad" />
    </div>
  );
}
