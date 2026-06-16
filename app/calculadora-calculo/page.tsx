'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './CalculadoraCalculo.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoCalculo = 'derivadas' | 'integrales' | 'limites' | 'series';

interface FuncionBase {
  nombre: string;
  funcion: string;
  derivada: string;
  integral: string;
}

export default function CalculadoraCalculoPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('derivadas');

  // Derivadas numéricas
  const [funcionDerivada, setFuncionDerivada] = useState<string>('x^2');
  const [puntoDerivada, setPuntoDerivada] = useState('');

  // Integrales definidas
  const [funcionIntegral, setFuncionIntegral] = useState<string>('x^2');
  const [limiteA, setLimiteA] = useState('');
  const [limiteB, setLimiteB] = useState('');
  const [numRectangulos, setNumRectangulos] = useState('100');

  // Límites
  const [funcionLimite, setFuncionLimite] = useState<string>('sin(x)/x');
  const [puntoLimite, setPuntoLimite] = useState('0');

  // Series
  const [tipoSerie, setTipoSerie] = useState<'aritmetica' | 'geometrica'>('aritmetica');
  const [primerTermino, setPrimerTermino] = useState('');
  const [razon, setRazon] = useState('');
  const [numTerminos, setNumTerminos] = useState('');

  const funcionesComunes: FuncionBase[] = [
    { nombre: 'x²', funcion: 'x^2', derivada: '2x', integral: 'x³/3' },
    { nombre: 'x³', funcion: 'x^3', derivada: '3x²', integral: 'x⁴/4' },
    { nombre: 'sin(x)', funcion: 'sin(x)', derivada: 'cos(x)', integral: '-cos(x)' },
    { nombre: 'cos(x)', funcion: 'cos(x)', derivada: '-sin(x)', integral: 'sin(x)' },
    { nombre: 'eˣ', funcion: 'e^x', derivada: 'eˣ', integral: 'eˣ' },
    { nombre: 'ln(x)', funcion: 'ln(x)', derivada: '1/x', integral: 'x·ln(x) - x' },
    { nombre: '1/x', funcion: '1/x', derivada: '-1/x²', integral: 'ln|x|' },
    { nombre: '√x', funcion: 'sqrt(x)', derivada: '1/(2√x)', integral: '(2/3)x^(3/2)' },
  ];

  // Evaluar función en un punto (simplificado para funciones básicas)
  const evaluarFuncion = (func: string, x: number): number => {
    try {
      const expr = func
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/e\^/g, 'Math.exp(')
        .replace(/pi/gi, 'Math.PI')
        .replace(/x/g, `(${x})`);

      // eslint-disable-next-line no-eval
      return eval(expr);
    } catch {
      return NaN;
    }
  };

  // Derivada numérica usando diferencia central
  const derivadaNumerica = (func: string, x: number, h = 0.0001): number => {
    const fxPlusH = evaluarFuncion(func, x + h);
    const fxMinusH = evaluarFuncion(func, x - h);
    return (fxPlusH - fxMinusH) / (2 * h);
  };

  // Segunda derivada
  const segundaDerivada = (func: string, x: number, h = 0.0001): number => {
    const fxPlusH = evaluarFuncion(func, x + h);
    const fx = evaluarFuncion(func, x);
    const fxMinusH = evaluarFuncion(func, x - h);
    return (fxPlusH - 2 * fx + fxMinusH) / (h * h);
  };

  // Integral por suma de Riemann (regla del punto medio)
  const integralNumerica = (func: string, a: number, b: number, n: number): number => {
    const dx = (b - a) / n;
    let suma = 0;
    for (let i = 0; i < n; i++) {
      const xMid = a + (i + 0.5) * dx;
      suma += evaluarFuncion(func, xMid);
    }
    return suma * dx;
  };

  // Límite numérico
  const limiteNumerico = (func: string, x: number): { izquierda: number; derecha: number; limite: number | null } => {
    const deltas = [0.1, 0.01, 0.001, 0.0001, 0.00001];

    const valoresIzq = deltas.map(d => evaluarFuncion(func, x - d));
    const valoresDer = deltas.map(d => evaluarFuncion(func, x + d));

    const izquierda = valoresIzq[valoresIzq.length - 1];
    const derecha = valoresDer[valoresDer.length - 1];

    const limite = Math.abs(izquierda - derecha) < 0.001 ? (izquierda + derecha) / 2 : null;

    return { izquierda, derecha, limite };
  };

  const resultados = useMemo(() => {
    switch (tipoCalculo) {
      case 'derivadas': {
        const x = parseSpanishNumber(puntoDerivada);
        if (isNaN(x)) return null;

        const valorFuncion = evaluarFuncion(funcionDerivada, x);
        const primeraDerivada = derivadaNumerica(funcionDerivada, x);
        const segDerivada = segundaDerivada(funcionDerivada, x);

        // Información adicional
        const esCreciente = primeraDerivada > 0;
        const esConcavaArriba = segDerivada > 0;

        return {
          tipo: 'derivada',
          valorFuncion,
          primeraDerivada,
          segundaDerivada: segDerivada,
          esCreciente,
          esConcavaArriba,
          punto: x
        };
      }

      case 'integrales': {
        const a = parseSpanishNumber(limiteA);
        const b = parseSpanishNumber(limiteB);
        const n = parseInt(numRectangulos) || 100;
        if (isNaN(a) || isNaN(b)) return null;

        const resultado = integralNumerica(funcionIntegral, a, b, n);
        const valorEnA = evaluarFuncion(funcionIntegral, a);
        const valorEnB = evaluarFuncion(funcionIntegral, b);

        return {
          tipo: 'integral',
          resultado,
          valorEnA,
          valorEnB,
          intervalo: `[${formatNumber(a, 2)}, ${formatNumber(b, 2)}]`,
          precision: n
        };
      }

      case 'limites': {
        const x = parseSpanishNumber(puntoLimite);
        if (isNaN(x)) return null;

        const resultado = limiteNumerico(funcionLimite, x);
        const valorEnPunto = evaluarFuncion(funcionLimite, x);

        return {
          tipo: 'limite',
          ...resultado,
          valorEnPunto,
          existe: resultado.limite !== null,
          punto: x
        };
      }

      case 'series': {
        const a1 = parseSpanishNumber(primerTermino);
        const r = parseSpanishNumber(razon);
        const n = parseInt(numTerminos);
        if (isNaN(a1) || isNaN(r) || isNaN(n) || n <= 0) return null;

        if (tipoSerie === 'aritmetica') {
          // Sn = n/2 * (2a1 + (n-1)*d)
          const ultimoTermino = a1 + (n - 1) * r;
          const suma = (n / 2) * (a1 + ultimoTermino);
          const terminos = Array.from({ length: Math.min(n, 10) }, (_, i) => a1 + i * r);

          return {
            tipo: 'serie',
            subtipo: 'aritmetica',
            suma,
            ultimoTermino,
            terminos,
            formula: `aₙ = ${formatNumber(a1, 2)} + (n-1)×${formatNumber(r, 2)}`
          };
        } else {
          // Sn = a1 * (1 - r^n) / (1 - r)
          const ultimoTermino = a1 * Math.pow(r, n - 1);
          const suma = r === 1 ? a1 * n : a1 * (1 - Math.pow(r, n)) / (1 - r);
          const sumaInfinita = Math.abs(r) < 1 ? a1 / (1 - r) : null;
          const terminos = Array.from({ length: Math.min(n, 10) }, (_, i) => a1 * Math.pow(r, i));

          return {
            tipo: 'serie',
            subtipo: 'geometrica',
            suma,
            ultimoTermino,
            sumaInfinita,
            converge: Math.abs(r) < 1,
            terminos,
            formula: `aₙ = ${formatNumber(a1, 2)} × ${formatNumber(r, 2)}^(n-1)`
          };
        }
      }

      default:
        return null;
    }
  }, [tipoCalculo, funcionDerivada, puntoDerivada, funcionIntegral, limiteA, limiteB, numRectangulos, funcionLimite, puntoLimite, tipoSerie, primerTermino, razon, numTerminos]);

  const tipos: { id: TipoCalculo; nombre: string; icono: string }[] = [
    { id: 'derivadas', nombre: 'Derivadas', icono: 'f\'(x)' },
    { id: 'integrales', nombre: 'Integrales', icono: '∫' },
    { id: 'limites', nombre: 'Límites', icono: 'lim' },
    { id: 'series', nombre: 'Series', icono: 'Σ' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>∫ Calculadora de Cálculo</h1>
        <p className={styles.subtitle}>
          Derivadas, integrales definidas, límites y series numéricas
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Cálculo</h2>

          <div className={styles.tiposGrid}>
            {tipos.map((tipo) => (
              <button
                key={tipo.id}
                type="button"
                aria-pressed={tipoCalculo === tipo.id}
                className={`${styles.tipoBtn} ${tipoCalculo === tipo.id ? styles.tipoActivo : ''}`}
                onClick={() => setTipoCalculo(tipo.id)}
              >
                <span className={styles.tipoIcono}>{tipo.icono}</span>
                <span className={styles.tipoNombre}>{tipo.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.inputsSection}>
            {tipoCalculo === 'derivadas' && (
              <>
                <div className={styles.funcionSelector}>
                  <label className={styles.label}>Función f(x)</label>
                  <select
                    value={funcionDerivada}
                    onChange={(e) => setFuncionDerivada(e.target.value)}
                    className={styles.select}
                  >
                    {funcionesComunes.map((f) => (
                      <option key={f.funcion} value={f.funcion}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                <NumberInput
                  value={puntoDerivada}
                  onChange={setPuntoDerivada}
                  label="Punto x"
                  placeholder="2"
                  helperText="Punto donde calcular la derivada"
                />
              </>
            )}

            {tipoCalculo === 'integrales' && (
              <>
                <div className={styles.funcionSelector}>
                  <label className={styles.label}>Función f(x)</label>
                  <select
                    value={funcionIntegral}
                    onChange={(e) => setFuncionIntegral(e.target.value)}
                    className={styles.select}
                  >
                    {funcionesComunes.map((f) => (
                      <option key={f.funcion} value={f.funcion}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.limitesRow}>
                  <NumberInput
                    value={limiteA}
                    onChange={setLimiteA}
                    label="Límite inferior (a)"
                    placeholder="0"
                  />
                  <NumberInput
                    value={limiteB}
                    onChange={setLimiteB}
                    label="Límite superior (b)"
                    placeholder="2"
                  />
                </div>
                <NumberInput
                  value={numRectangulos}
                  onChange={setNumRectangulos}
                  label="Precisión (subdivisiones)"
                  placeholder="100"
                  helperText="Más = mayor precisión"
                />
              </>
            )}

            {tipoCalculo === 'limites' && (
              <>
                <div className={styles.funcionSelector}>
                  <label className={styles.label}>Función f(x)</label>
                  <select
                    value={funcionLimite}
                    onChange={(e) => setFuncionLimite(e.target.value)}
                    className={styles.select}
                  >
                    <option value="sin(x)/x">sin(x)/x</option>
                    <option value="(x^2-1)/(x-1)">(x²-1)/(x-1)</option>
                    <option value="(1+1/x)^x">(1+1/x)^x → e</option>
                    {funcionesComunes.map((f) => (
                      <option key={f.funcion} value={f.funcion}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
                <NumberInput
                  value={puntoLimite}
                  onChange={setPuntoLimite}
                  label="x tiende a"
                  placeholder="0"
                />
              </>
            )}

            {tipoCalculo === 'series' && (
              <>
                <div className={styles.serieSelector}>
                  <button
                    type="button"
                    aria-pressed={tipoSerie === 'aritmetica'}
                    className={`${styles.serieBtn} ${tipoSerie === 'aritmetica' ? styles.serieActiva : ''}`}
                    onClick={() => setTipoSerie('aritmetica')}
                  >
                    Aritmética
                  </button>
                  <button
                    type="button"
                    aria-pressed={tipoSerie === 'geometrica'}
                    className={`${styles.serieBtn} ${tipoSerie === 'geometrica' ? styles.serieActiva : ''}`}
                    onClick={() => setTipoSerie('geometrica')}
                  >
                    Geométrica
                  </button>
                </div>
                <NumberInput
                  value={primerTermino}
                  onChange={setPrimerTermino}
                  label="Primer término (a₁)"
                  placeholder="1"
                />
                <NumberInput
                  value={razon}
                  onChange={setRazon}
                  label={tipoSerie === 'aritmetica' ? 'Diferencia (d)' : 'Razón (r)'}
                  placeholder={tipoSerie === 'aritmetica' ? '2' : '0,5'}
                />
                <NumberInput
                  value={numTerminos}
                  onChange={setNumTerminos}
                  label="Número de términos (n)"
                  placeholder="10"
                />
              </>
            )}
          </div>
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>∫</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {resultados.tipo === 'derivada' && (
                <>
                  <ResultCard
                    title={`f(${formatNumber(resultados.punto ?? 0, 2)})`}
                    value={formatNumber(resultados.valorFuncion ?? 0, 6)}
                    variant="default"
                    icon="f"
                    description="Valor de la función"
                  />
                  <ResultCard
                    title={`f'(${formatNumber(resultados.punto ?? 0, 2)})`}
                    value={formatNumber(resultados.primeraDerivada ?? 0, 6)}
                    variant="highlight"
                    icon="f'"
                    description="Primera derivada"
                  />
                  <ResultCard
                    title={`f''(${formatNumber(resultados.punto ?? 0, 2)})`}
                    value={formatNumber(resultados.segundaDerivada ?? 0, 6)}
                    variant="info"
                    icon="f''"
                    description="Segunda derivada"
                  />
                  <ResultCard
                    title="Comportamiento"
                    value={resultados.esCreciente ? 'Creciente' : 'Decreciente'}
                    variant={resultados.esCreciente ? 'success' : 'warning'}
                    icon={resultados.esCreciente ? '📈' : '📉'}
                  />
                  <ResultCard
                    title="Concavidad"
                    value={resultados.esConcavaArriba ? 'Cóncava arriba' : 'Cóncava abajo'}
                    variant="default"
                    icon={resultados.esConcavaArriba ? '⌣' : '⌢'}
                  />
                </>
              )}

              {resultados.tipo === 'integral' && (
                <>
                  <ResultCard
                    title={`∫f(x)dx ${resultados.intervalo}`}
                    value={formatNumber(resultados.resultado ?? 0, 6)}
                    variant="highlight"
                    icon="∫"
                    description="Integral definida"
                  />
                  <ResultCard
                    title="f(a)"
                    value={formatNumber(resultados.valorEnA ?? 0, 6)}
                    variant="default"
                    icon="a"
                  />
                  <ResultCard
                    title="f(b)"
                    value={formatNumber(resultados.valorEnB ?? 0, 6)}
                    variant="default"
                    icon="b"
                  />
                  <ResultCard
                    title="Precisión"
                    value={`${resultados.precision} subdivisiones`}
                    variant="info"
                    icon="📊"
                    description="Método: punto medio"
                  />
                </>
              )}

              {resultados.tipo === 'limite' && (
                <>
                  <ResultCard
                    title={`lim x→${formatNumber(resultados.punto ?? 0, 2)}`}
                    value={(resultados as any).existe ? formatNumber((resultados as any).limite ?? 0, 6) : 'No existe'}
                    variant={(resultados as any).existe ? 'highlight' : 'warning'}
                    icon="lim"
                  />
                  <ResultCard
                    title="Límite por izquierda"
                    value={formatNumber((resultados as any).izquierda ?? 0, 6)}
                    variant="default"
                    icon="←"
                  />
                  <ResultCard
                    title="Límite por derecha"
                    value={formatNumber((resultados as any).derecha ?? 0, 6)}
                    variant="default"
                    icon="→"
                  />
                  <ResultCard
                    title={`f(${formatNumber(resultados.punto ?? 0, 2)})`}
                    value={isNaN((resultados as any).valorEnPunto) ? 'Indefinido' : formatNumber((resultados as any).valorEnPunto ?? 0, 6)}
                    variant="info"
                    icon="f"
                    description="Valor en el punto"
                  />
                </>
              )}

              {resultados.tipo === 'serie' && (
                <>
                  <ResultCard
                    title={`S${numTerminos}`}
                    value={formatNumber(resultados.suma ?? 0, 6)}
                    variant="highlight"
                    icon="Σ"
                    description={`Suma de ${numTerminos} términos`}
                  />
                  <ResultCard
                    title="Último término"
                    value={formatNumber(resultados.ultimoTermino ?? 0, 6)}
                    variant="info"
                    icon={`a${numTerminos}`}
                  />
                  {resultados.subtipo === 'geometrica' && (
                    <>
                      <ResultCard
                        title="Suma infinita (S∞)"
                        value={resultados.sumaInfinita !== null ? formatNumber(resultados.sumaInfinita ?? 0, 6) : 'Diverge'}
                        variant={resultados.converge ? 'success' : 'warning'}
                        icon="∞"
                        description={resultados.converge ? '|r| < 1' : '|r| ≥ 1'}
                      />
                    </>
                  )}
                  <div className={styles.terminosBox}>
                    <h4>Primeros términos</h4>
                    <p className={styles.terminos}>
                      {(resultados.terminos ?? []).map((t: number, i: number) => formatNumber(t, 2)).join(', ')}
                      {parseInt(numTerminos) > 10 ? '...' : ''}
                    </p>
                    <p className={styles.formulaSmall}>{resultados.formula}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {tipoCalculo === 'derivadas' && (
            <div className={styles.tablaDerivadas}>
              <h3>Derivadas e Integrales Comunes</h3>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>f(x)</th>
                    <th>f&apos;(x)</th>
                    <th>∫f(x)dx</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionesComunes.map((f) => (
                    <tr key={f.funcion}>
                      <td>{f.nombre}</td>
                      <td>{f.derivada}</td>
                      <td>{f.integral}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Cálculo?"
        subtitle="Derivadas, integrales, límites y sus aplicaciones"
      >
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Definición</th>
                <th>Método numérico</th>
                <th>Precisión</th>
                <th>Aplicación principal</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Derivada primera</td><td>Tasa de cambio instantáneo</td><td>Diferencia central: [f(x+h)-f(x-h)]/(2h)</td><td>Alta (h=0,0001)</td><td>Velocidad, optimización, pendiente</td></tr>
              <tr><td>Derivada segunda</td><td>Curvatura de la función</td><td>Diferencia finita de orden 2</td><td>Media</td><td>Concavidad, puntos de inflexión</td></tr>
              <tr><td>Integral definida</td><td>Área bajo la curva en [a,b]</td><td>Suma de Riemann (punto medio)</td><td>Variable (↑ subdivisiones)</td><td>Áreas, probabilidad, trabajo</td></tr>
              <tr><td>Límite</td><td>Valor hacia el que tiende f(x)</td><td>Aproximación sucesiva</td><td>Alta</td><td>Continuidad, derivadas, series</td></tr>
              <tr><td>Serie aritmética</td><td>Suma con diferencia constante d</td><td>Sₙ = n/2·(2a₁ + (n-1)d)</td><td>Exacta</td><td>Pagos iguales, aritmética</td></tr>
              <tr><td>Serie geométrica</td><td>Suma con razón constante r</td><td>Sₙ = a₁·(1-rⁿ)/(1-r)</td><td>Exacta</td><td>Capitalización, física cuántica</td></tr>
              <tr><td>Serie geométrica ∞</td><td>Suma infinita convergente</td><td>S∞ = a₁/(1-r) si |r|&lt;1</td><td>Exacta</td><td>Probabilidad, análisis</td></tr>
              <tr><td>Punto crítico</td><td>f&apos;(x) = 0</td><td>Evaluar derivada en el punto</td><td>Alta</td><td>Máximos, mínimos, puntos silla</td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🚀</span> Física: velocidad instantánea</h3>
            <p>La derivada de la posición respecto al tiempo da la velocidad instantánea. Calcula f&apos;(t) en cualquier instante para analizar el movimiento de un objeto.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">📊</span> Probabilidad: área bajo distribución</h3>
            <p>Integra una función de densidad de probabilidad entre dos valores para calcular la probabilidad de que una variable aleatoria caiga en ese rango.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">💰</span> Finanzas: series geométricas</h3>
            <p>Una inversión con capitalización compuesta forma una serie geométrica. Calcula la suma total acumulada tras n períodos con razón (1 + tasa de interés).</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">📐</span> Optimización de funciones</h3>
            <p>Encuentra máximos y mínimos de funciones de coste o beneficio. La primera derivada cero indica un punto crítico; la segunda determina si es máximo o mínimo.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🔬</span> Verificar límites teóricos</h3>
            <p>Comprueba límites clásicos como lim(x→0) sin(x)/x = 1 o lim(x→∞)(1+1/x)^x = e, observando la convergencia desde ambos lados del punto.</p>
          </div>
          <div className={styles.escenarioCard}>
            <h3><span aria-hidden="true">🎓</span> Preparar exámenes de cálculo</h3>
            <p>Verifica tus cálculos manuales de derivadas, integrales y límites antes de un examen. Identifica dónde te equivocas comparando con los resultados numéricos.</p>
          </div>
        </div>

        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>¿Cuál es la diferencia entre derivada e integral?</h3>
            <p>La derivada mide la tasa de cambio (velocidad, pendiente). La integral acumula valores (área, trabajo). El Teorema Fundamental del Cálculo las conecta: la integral de f&apos;(x) entre a y b es f(b) - f(a).</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Por qué se usa h muy pequeño para derivadas numéricas?</h3>
            <p>La derivada es el límite del cociente incremental cuando h→0. Usando h=0,0001 obtenemos una aproximación muy precisa sin problemas de redondeo numérico que aparecen con h demasiado pequeño.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué significa que un límite no existe?</h3>
            <p>Cuando el límite por la izquierda ≠ límite por la derecha, el límite no existe en ese punto. Ocurre en discontinuidades como f(x) = 1/x en x=0, donde ±∞ son diferentes.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Cuándo converge una serie geométrica infinita?</h3>
            <p>Una serie geométrica infinita converge (tiene suma finita) únicamente cuando |r| &lt; 1. Si |r| ≥ 1, los términos no tienden a cero y la suma diverge hacia infinito.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué es el Teorema Fundamental del Cálculo?</h3>
            <p>Establece que la derivación e integración son operaciones inversas. Si F(x) es antiderivada de f(x), entonces ∫ₐᵇ f(x)dx = F(b) - F(a). Es el puente entre cálculo diferencial e integral.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Cómo mejoro la precisión de una integral numérica?</h3>
            <p>Aumentando el número de subdivisiones (rectángulos). Con 100 subdivisiones el error es ~1%; con 1000 es ~0,01%. Para funciones muy oscilantes o discontinuas, necesitas más subdivisiones.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué diferencia hay entre integral definida e indefinida?</h3>
            <p>La integral definida ∫ₐᵇ f(x)dx da un número (el área entre a y b). La integral indefinida ∫f(x)dx da una familia de funciones F(x) + C, donde C es la constante de integración.</p>
          </div>
          <div className={styles.faqItem}>
            <h3>¿Qué indica la segunda derivada?</h3>
            <p>La segunda derivada f&apos;&apos;(x) mide la concavidad. Si f&apos;&apos;(x) &gt; 0, la función es cóncava hacia arriba (forma de U). Si f&apos;&apos;(x) &lt; 0, es cóncava hacia abajo. En un punto crítico, indica si es mínimo o máximo.</p>
          </div>
        </div>

        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Selecciona el tipo de cálculo</h3>
              <p>Elige entre Derivadas, Integrales, Límites o Series según la operación matemática que necesites resolver.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Elige la función</h3>
              <p>Selecciona una de las 8 funciones predefinidas (x², sin(x), eˣ, ln(x), etc.) o la más cercana a tu función de estudio.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Ingresa los valores requeridos</h3>
              <p>Para derivadas: el punto x. Para integrales: los límites a y b. Para límites: el punto de tendencia. Para series: a₁, razón y número de términos.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Analiza los resultados</h3>
              <p>Observa el resultado principal y los valores auxiliares: comportamiento creciente/decreciente, concavidad, límites laterales o suma infinita.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Ajusta la precisión (integrales)</h3>
              <p>Para integrales, incrementa las subdivisiones (100 → 1000 → 10000) si necesitas mayor exactitud. Observa cómo converge el resultado.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>Contrasta con la tabla de derivadas</h3>
              <p>Compara el resultado numérico con la tabla de &quot;Derivadas e Integrales Comunes&quot;. Verifica que coincide con la solución analítica exacta.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>7</div>
            <div className={styles.stepContent}>
              <h3>Interpreta el resultado</h3>
              <p>Traduce el número a su significado físico o geométrico: una derivada positiva indica función creciente; una integral positiva indica área por encima del eje X.</p>
            </div>
          </div>
        </div>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🎯</span> Verifica con valores conocidos</h3>
            <p>Prueba primero con funciones cuya derivada conozcas: si f(x) = x², f&apos;(2) debe dar exactamente 4. Si coincide, confía en los resultados más complejos.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">📊</span> Usa 1000+ subdivisiones para integrales</h3>
            <p>Con funciones oscilantes como sin(x), usa al menos 1000 subdivisiones para obtener resultados precisos. El cálculo es rápido y la ganancia en precisión es significativa.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">↔️</span> Compara límites laterales</h3>
            <p>Siempre observa si el límite por izquierda y derecha son iguales. Si difieren, el límite no existe. Es fundamental para detectar discontinuidades.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">🔢</span> Verifica convergencia en series</h3>
            <p>Para series geométricas, comprueba |r| &lt; 1 antes de interpretar la suma infinita. Si |r| ≥ 1, la serie diverge y no tiene suma finita.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">📈</span> Interpreta el signo de la derivada</h3>
            <p>f&apos;(x) &gt; 0: función creciente. f&apos;(x) &lt; 0: decreciente. f&apos;(x) = 0: punto crítico (posible máximo, mínimo o inflexión). La segunda derivada aclara el tipo.</p>
          </div>
          <div className={styles.tipCard}>
            <h3><span aria-hidden="true">⚡</span> Combina herramientas</h3>
            <p>Usa derivadas para encontrar puntos críticos, luego intégralas para calcular áreas. Combinar las cuatro operaciones te da una visión completa del comportamiento de la función.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <h3><span aria-hidden="true">⚠️</span> Limitaciones de los métodos numéricos</h3>
          <ul className={styles.warningList}>
            <li>Los métodos numéricos tienen errores de redondeo y aproximación. No son exactos como el cálculo simbólico.</li>
            <li>Para funciones con discontinuidades o singularidades, los resultados pueden ser incorrectos o inestables.</li>
            <li>La integral numérica por punto medio puede ser imprecisa en funciones con variación muy rápida.</li>
            <li>Para uso académico riguroso, verifica siempre con herramientas simbólicas como Wolfram Alpha o MATLAB.</li>
          </ul>
        </div>

        <section className={styles.guideSection}>
          <h2>Cálculo Diferencial e Integral</h2>
          <p className={styles.introParagraph}>
            El cálculo es la rama de las matemáticas que estudia el cambio continuo.
            Tiene dos ramas principales: diferencial (derivadas) e integral (integrales).
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Derivadas</h4>
              <p>
                Miden la tasa de cambio instantáneo de una función. f&apos;(x) nos dice
                la pendiente de la tangente en cada punto. Aplicaciones: velocidad,
                optimización, tasas de crecimiento.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Integrales</h4>
              <p>
                La integral definida calcula el área bajo una curva. La integral
                indefinida es la antiderivada. Aplicaciones: áreas, volúmenes,
                trabajo, probabilidad.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Límites</h4>
              <p>
                El límite describe el comportamiento de una función cerca de un punto.
                Es la base del cálculo. lim(x→a) f(x) = L significa que f(x) se
                acerca a L cuando x se acerca a a.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Series</h4>
              <p>
                Sumas de secuencias de números. Aritméticas (diferencia constante)
                y geométricas (razón constante). Fundamentales en análisis y
                aproximaciones de funciones.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-calculo')} />

      <ShareCard appName="calculadora-calculo" />
      <Footer appName="calculadora-calculo" />
    </div>
  );
}
