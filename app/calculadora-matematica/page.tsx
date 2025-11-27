'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraMatematica.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';

type TipoOperacion = 'matrices' | 'fracciones' | 'potencias' | 'raices' | 'logaritmos';

export default function CalculadoraMatematicaPage() {
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion>('matrices');

  // Matrices 2x2
  const [matrizA, setMatrizA] = useState(['', '', '', '']);
  const [matrizB, setMatrizB] = useState(['', '', '', '']);
  const [operacionMatriz, setOperacionMatriz] = useState<'suma' | 'resta' | 'mult' | 'det' | 'inv'>('suma');

  // Fracciones
  const [num1, setNum1] = useState('');
  const [den1, setDen1] = useState('');
  const [num2, setNum2] = useState('');
  const [den2, setDen2] = useState('');
  const [operacionFraccion, setOperacionFraccion] = useState<'+' | '-' | '*' | '/'>( '+');

  // Potencias y raíces
  const [base, setBase] = useState('');
  const [exponente, setExponente] = useState('');
  const [radicando, setRadicando] = useState('');
  const [indice, setIndice] = useState('2');

  // Logaritmos
  const [logNumero, setLogNumero] = useState('');
  const [logBase, setLogBase] = useState('10');

  // Funciones auxiliares
  const mcd = (a: number, b: number): number => b === 0 ? Math.abs(a) : mcd(b, a % b);

  const simplificarFraccion = (num: number, den: number): [number, number] => {
    if (den === 0) return [NaN, NaN];
    const divisor = mcd(num, den);
    const signo = den < 0 ? -1 : 1;
    return [(num / divisor) * signo, Math.abs(den / divisor)];
  };

  const resultados = useMemo(() => {
    switch (tipoOperacion) {
      case 'matrices': {
        const a = matrizA.map(v => parseFloat(v) || 0);
        const b = matrizB.map(v => parseFloat(v) || 0);

        // Matriz A: [a00, a01, a10, a11]
        const detA = a[0] * a[3] - a[1] * a[2];
        const detB = b[0] * b[3] - b[1] * b[2];

        let resultado: number[] = [];
        let descripcion = '';

        switch (operacionMatriz) {
          case 'suma':
            resultado = [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
            descripcion = 'A + B';
            break;
          case 'resta':
            resultado = [a[0] - b[0], a[1] - b[1], a[2] - b[2], a[3] - b[3]];
            descripcion = 'A - B';
            break;
          case 'mult':
            resultado = [
              a[0] * b[0] + a[1] * b[2],
              a[0] * b[1] + a[1] * b[3],
              a[2] * b[0] + a[3] * b[2],
              a[2] * b[1] + a[3] * b[3]
            ];
            descripcion = 'A × B';
            break;
          case 'det':
            return { tipo: 'determinante', detA, detB };
          case 'inv':
            if (detA === 0) return { tipo: 'error', mensaje: 'La matriz A no tiene inversa (det = 0)' };
            resultado = [a[3] / detA, -a[1] / detA, -a[2] / detA, a[0] / detA];
            descripcion = 'A⁻¹';
            break;
        }

        return { tipo: 'matriz', resultado, descripcion, detA, detB };
      }

      case 'fracciones': {
        const n1 = parseInt(num1);
        const d1 = parseInt(den1) || 1;
        const n2 = parseInt(num2);
        const d2 = parseInt(den2) || 1;

        if (isNaN(n1) || isNaN(n2)) return null;

        let numRes: number, denRes: number;

        switch (operacionFraccion) {
          case '+':
            numRes = n1 * d2 + n2 * d1;
            denRes = d1 * d2;
            break;
          case '-':
            numRes = n1 * d2 - n2 * d1;
            denRes = d1 * d2;
            break;
          case '*':
            numRes = n1 * n2;
            denRes = d1 * d2;
            break;
          case '/':
            numRes = n1 * d2;
            denRes = d1 * n2;
            break;
          default:
            return null;
        }

        const [numSimp, denSimp] = simplificarFraccion(numRes, denRes);
        const decimal = numSimp / denSimp;

        return {
          tipo: 'fraccion',
          numOriginal: numRes,
          denOriginal: denRes,
          numSimplificado: numSimp,
          denSimplificado: denSimp,
          decimal,
          operacion: operacionFraccion
        };
      }

      case 'potencias': {
        const b = parseFloat(base.replace(',', '.'));
        const e = parseFloat(exponente.replace(',', '.'));
        if (isNaN(b) || isNaN(e)) return null;

        const resultado = Math.pow(b, e);
        const inversa = Math.pow(b, -e);

        return {
          tipo: 'potencia',
          base: b,
          exponente: e,
          resultado,
          inversa,
          esEntera: Number.isInteger(resultado)
        };
      }

      case 'raices': {
        const r = parseFloat(radicando.replace(',', '.'));
        const i = parseFloat(indice.replace(',', '.'));
        if (isNaN(r) || isNaN(i) || i === 0) return null;

        if (r < 0 && i % 2 === 0) {
          return { tipo: 'error', mensaje: 'No existe raíz real de índice par para números negativos' };
        }

        const resultado = r < 0 ? -Math.pow(-r, 1 / i) : Math.pow(r, 1 / i);
        const cuadrado = Math.pow(resultado, 2);
        const cubo = Math.pow(resultado, 3);

        return {
          tipo: 'raiz',
          radicando: r,
          indice: i,
          resultado,
          cuadrado,
          cubo,
          esEntera: Number.isInteger(resultado)
        };
      }

      case 'logaritmos': {
        const num = parseFloat(logNumero.replace(',', '.'));
        const baseLog = parseFloat(logBase.replace(',', '.'));
        if (isNaN(num) || num <= 0 || isNaN(baseLog) || baseLog <= 0 || baseLog === 1) return null;

        const resultado = Math.log(num) / Math.log(baseLog);
        const logNatural = Math.log(num);
        const log10 = Math.log10(num);
        const log2 = Math.log2(num);

        return {
          tipo: 'logaritmo',
          numero: num,
          base: baseLog,
          resultado,
          logNatural,
          log10,
          log2
        };
      }

      default:
        return null;
    }
  }, [tipoOperacion, matrizA, matrizB, operacionMatriz, num1, den1, num2, den2, operacionFraccion, base, exponente, radicando, indice, logNumero, logBase]);

  const tipos: { id: TipoOperacion; nombre: string; icono: string }[] = [
    { id: 'matrices', nombre: 'Matrices 2×2', icono: '📊' },
    { id: 'fracciones', nombre: 'Fracciones', icono: '➗' },
    { id: 'potencias', nombre: 'Potencias', icono: '²' },
    { id: 'raices', nombre: 'Raíces', icono: '√' },
    { id: 'logaritmos', nombre: 'Logaritmos', icono: 'log' },
  ];

  const actualizarMatriz = (matriz: 'A' | 'B', index: number, valor: string) => {
    if (matriz === 'A') {
      const nueva = [...matrizA];
      nueva[index] = valor;
      setMatrizA(nueva);
    } else {
      const nueva = [...matrizB];
      nueva[index] = valor;
      setMatrizB(nueva);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔢 Calculadora Matemática Avanzada</h1>
        <p className={styles.subtitle}>
          Matrices, fracciones, potencias, raíces y logaritmos
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Operación</h2>

          <div className={styles.tiposGrid}>
            {tipos.map((tipo) => (
              <button
                key={tipo.id}
                className={`${styles.tipoBtn} ${tipoOperacion === tipo.id ? styles.tipoActivo : ''}`}
                onClick={() => setTipoOperacion(tipo.id)}
              >
                <span className={styles.tipoIcono}>{tipo.icono}</span>
                <span className={styles.tipoNombre}>{tipo.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.inputsSection}>
            {tipoOperacion === 'matrices' && (
              <>
                <div className={styles.operacionesMatriz}>
                  {(['suma', 'resta', 'mult', 'det', 'inv'] as const).map(op => (
                    <button
                      key={op}
                      className={`${styles.opBtn} ${operacionMatriz === op ? styles.opActivo : ''}`}
                      onClick={() => setOperacionMatriz(op)}
                    >
                      {op === 'suma' ? 'A+B' : op === 'resta' ? 'A-B' : op === 'mult' ? 'A×B' : op === 'det' ? 'Det' : 'A⁻¹'}
                    </button>
                  ))}
                </div>

                <div className={styles.matricesContainer}>
                  <div className={styles.matrizInput}>
                    <h4>Matriz A</h4>
                    <div className={styles.matrizGrid}>
                      {[0, 1, 2, 3].map(i => (
                        <input
                          key={i}
                          type="text"
                          value={matrizA[i]}
                          onChange={(e) => actualizarMatriz('A', i, e.target.value)}
                          className={styles.matrizCell}
                          placeholder="0"
                        />
                      ))}
                    </div>
                  </div>

                  {operacionMatriz !== 'det' && operacionMatriz !== 'inv' && (
                    <div className={styles.matrizInput}>
                      <h4>Matriz B</h4>
                      <div className={styles.matrizGrid}>
                        {[0, 1, 2, 3].map(i => (
                          <input
                            key={i}
                            type="text"
                            value={matrizB[i]}
                            onChange={(e) => actualizarMatriz('B', i, e.target.value)}
                            className={styles.matrizCell}
                            placeholder="0"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {tipoOperacion === 'fracciones' && (
              <>
                <div className={styles.fraccionesContainer}>
                  <div className={styles.fraccion}>
                    <input
                      type="text"
                      value={num1}
                      onChange={(e) => setNum1(e.target.value)}
                      placeholder="Num"
                      className={styles.fraccionInput}
                    />
                    <div className={styles.fraccionLinea} />
                    <input
                      type="text"
                      value={den1}
                      onChange={(e) => setDen1(e.target.value)}
                      placeholder="Den"
                      className={styles.fraccionInput}
                    />
                  </div>

                  <div className={styles.operacionFraccion}>
                    {(['+', '-', '*', '/'] as const).map(op => (
                      <button
                        key={op}
                        className={`${styles.opFracBtn} ${operacionFraccion === op ? styles.opActivo : ''}`}
                        onClick={() => setOperacionFraccion(op)}
                      >
                        {op === '*' ? '×' : op === '/' ? '÷' : op}
                      </button>
                    ))}
                  </div>

                  <div className={styles.fraccion}>
                    <input
                      type="text"
                      value={num2}
                      onChange={(e) => setNum2(e.target.value)}
                      placeholder="Num"
                      className={styles.fraccionInput}
                    />
                    <div className={styles.fraccionLinea} />
                    <input
                      type="text"
                      value={den2}
                      onChange={(e) => setDen2(e.target.value)}
                      placeholder="Den"
                      className={styles.fraccionInput}
                    />
                  </div>
                </div>
              </>
            )}

            {tipoOperacion === 'potencias' && (
              <>
                <NumberInput
                  value={base}
                  onChange={setBase}
                  label="Base"
                  placeholder="2"
                />
                <NumberInput
                  value={exponente}
                  onChange={setExponente}
                  label="Exponente"
                  placeholder="10"
                />
                <p className={styles.helper}>Calcula base^exponente</p>
              </>
            )}

            {tipoOperacion === 'raices' && (
              <>
                <NumberInput
                  value={radicando}
                  onChange={setRadicando}
                  label="Radicando"
                  placeholder="16"
                />
                <NumberInput
                  value={indice}
                  onChange={setIndice}
                  label="Índice de la raíz"
                  placeholder="2"
                  helperText="2 = raíz cuadrada, 3 = raíz cúbica"
                />
              </>
            )}

            {tipoOperacion === 'logaritmos' && (
              <>
                <NumberInput
                  value={logNumero}
                  onChange={setLogNumero}
                  label="Número"
                  placeholder="100"
                  helperText="Debe ser mayor que 0"
                />
                <NumberInput
                  value={logBase}
                  onChange={setLogBase}
                  label="Base del logaritmo"
                  placeholder="10"
                  helperText="10 = común, e ≈ 2,718 = natural"
                />
              </>
            )}
          </div>
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🧮</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          ) : resultados.tipo === 'error' ? (
            <div className={styles.error}>
              <span>⚠️</span>
              <p>{resultados.mensaje}</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {resultados.tipo === 'matriz' && (
                <>
                  <div className={styles.matrizResultado}>
                    <h3>{resultados.descripcion}</h3>
                    <div className={styles.matrizGrid}>
                      {resultados.resultado.map((v: number, i: number) => (
                        <span key={i} className={styles.matrizCellRes}>
                          {formatNumber(v, 4)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ResultCard
                    title="det(A)"
                    value={formatNumber(resultados.detA, 4)}
                    variant="info"
                    icon="📐"
                  />
                  <ResultCard
                    title="det(B)"
                    value={formatNumber(resultados.detB, 4)}
                    variant="default"
                    icon="📐"
                  />
                </>
              )}

              {resultados.tipo === 'determinante' && (
                <>
                  <ResultCard
                    title="det(A)"
                    value={formatNumber(resultados.detA, 4)}
                    variant="highlight"
                    icon="📐"
                  />
                  <ResultCard
                    title="det(B)"
                    value={formatNumber(resultados.detB, 4)}
                    variant="info"
                    icon="📐"
                  />
                </>
              )}

              {resultados.tipo === 'fraccion' && (
                <>
                  <div className={styles.fraccionResultado}>
                    <h3>Resultado</h3>
                    <div className={styles.fraccionGrande}>
                      <span>{resultados.numSimplificado}</span>
                      <div className={styles.fraccionLineaGrande} />
                      <span>{resultados.denSimplificado}</span>
                    </div>
                  </div>
                  <ResultCard
                    title="Decimal"
                    value={formatNumber(resultados.decimal, 6)}
                    variant="highlight"
                    icon="🔢"
                  />
                  {resultados.numOriginal !== resultados.numSimplificado && (
                    <ResultCard
                      title="Sin simplificar"
                      value={`${resultados.numOriginal}/${resultados.denOriginal}`}
                      variant="default"
                      icon="📝"
                    />
                  )}
                </>
              )}

              {resultados.tipo === 'potencia' && (
                <>
                  <ResultCard
                    title={`${resultados.base}^${resultados.exponente}`}
                    value={formatNumber(resultados.resultado, 10)}
                    variant="highlight"
                    icon="²"
                  />
                  <ResultCard
                    title={`${resultados.base}^${-resultados.exponente}`}
                    value={formatNumber(resultados.inversa, 10)}
                    variant="info"
                    icon="⁻¹"
                    description="Inverso"
                  />
                  <ResultCard
                    title="¿Es entero?"
                    value={resultados.esEntera ? 'Sí' : 'No'}
                    variant={resultados.esEntera ? 'success' : 'default'}
                    icon={resultados.esEntera ? '✅' : '❌'}
                  />
                </>
              )}

              {resultados.tipo === 'raiz' && (
                <>
                  <ResultCard
                    title={`ⁿ√${resultados.radicando} (n=${resultados.indice})`}
                    value={formatNumber(resultados.resultado, 10)}
                    variant="highlight"
                    icon="√"
                  />
                  <ResultCard
                    title="Resultado²"
                    value={formatNumber(resultados.cuadrado, 6)}
                    variant="info"
                    icon="²"
                  />
                  <ResultCard
                    title="Resultado³"
                    value={formatNumber(resultados.cubo, 6)}
                    variant="default"
                    icon="³"
                  />
                  <ResultCard
                    title="¿Es exacta?"
                    value={resultados.esEntera ? 'Sí' : 'No'}
                    variant={resultados.esEntera ? 'success' : 'default'}
                    icon={resultados.esEntera ? '✅' : '❌'}
                  />
                </>
              )}

              {resultados.tipo === 'logaritmo' && (
                <>
                  <ResultCard
                    title={`log${resultados.base === 10 ? '' : '₍' + resultados.base + '₎'}(${resultados.numero})`}
                    value={formatNumber(resultados.resultado, 10)}
                    variant="highlight"
                    icon="log"
                  />
                  <ResultCard
                    title="ln (logaritmo natural)"
                    value={formatNumber(resultados.logNatural, 10)}
                    variant="info"
                    icon="e"
                  />
                  <ResultCard
                    title="log₁₀ (logaritmo común)"
                    value={formatNumber(resultados.log10, 10)}
                    variant="default"
                    icon="10"
                  />
                  <ResultCard
                    title="log₂ (logaritmo binario)"
                    value={formatNumber(resultados.log2, 10)}
                    variant="default"
                    icon="2"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Matemáticas Avanzadas?"
        subtitle="Descubre conceptos clave y aplicaciones prácticas"
      >
        <section className={styles.guideSection}>
          <h2>Conceptos Matemáticos Fundamentales</h2>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Matrices</h4>
              <p>
                Arreglos rectangulares de números. Fundamentales en álgebra lineal,
                gráficos por computadora, machine learning y resolución de sistemas de ecuaciones.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Determinantes</h4>
              <p>
                Número asociado a una matriz cuadrada. Si det = 0, la matriz no tiene inversa.
                Usado para resolver sistemas de ecuaciones y calcular áreas/volúmenes.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Logaritmos</h4>
              <p>
                log_b(x) = y significa b^y = x. Esenciales en ciencias, ingeniería,
                escalas de medición (pH, decibelios) y complejidad algorítmica.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Fracciones</h4>
              <p>
                Representación de división entre dos números. Simplificar usando el MCD.
                Base fundamental para proporciones, ratios y álgebra.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-matematica" />
    </div>
  );
}
