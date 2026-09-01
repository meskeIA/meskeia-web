'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './CalculadoraMatematica.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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
        <h1 className={styles.title}><span aria-hidden="true">🔢</span> Calculadora Matemática Avanzada</h1>
        <p className={styles.subtitle}>
          Matrices, fracciones, potencias, raíces y logaritmos
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Operación</h2>

          <div className={styles.tiposGrid} role="tablist">
            {tipos.map((tipo) => (
              <button
                key={tipo.id}
                role="tab"
                aria-selected={tipoOperacion === tipo.id}
                className={`${styles.tipoBtn} ${tipoOperacion === tipo.id ? styles.tipoActivo : ''}`}
                onClick={() => setTipoOperacion(tipo.id)}
              >
                <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
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
                      aria-pressed={operacionMatriz === op}
                    >
                      {op === 'suma' ? 'A+B' : op === 'resta' ? 'A-B' : op === 'mult' ? 'A×B' : op === 'det' ? 'Det' : 'A⁻¹'}
                    </button>
                  ))}
                </div>

                <div className={styles.matricesContainer}>
                  <div className={styles.matrizInput}>
                    <h3>Matriz A</h3>
                    <div className={styles.matrizGrid}>
                      {[0, 1, 2, 3].map(i => (
                        <input
                          key={i}
                          type="text"
                          inputMode="decimal"
                          value={matrizA[i]}
                          onChange={(e) => actualizarMatriz('A', i, e.target.value)}
                          className={styles.matrizCell}
                          placeholder="0"
                          aria-label={`Matriz A, fila ${i < 2 ? 1 : 2} columna ${i % 2 + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {operacionMatriz !== 'det' && operacionMatriz !== 'inv' && (
                    <div className={styles.matrizInput}>
                      <h3>Matriz B</h3>
                      <div className={styles.matrizGrid}>
                        {[0, 1, 2, 3].map(i => (
                          <input
                            key={i}
                            type="text"
                            inputMode="decimal"
                            value={matrizB[i]}
                            onChange={(e) => actualizarMatriz('B', i, e.target.value)}
                            className={styles.matrizCell}
                            placeholder="0"
                            aria-label={`Matriz B, fila ${i < 2 ? 1 : 2} columna ${i % 2 + 1}`}
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
                      inputMode="numeric"
                      value={num1}
                      onChange={(e) => setNum1(e.target.value)}
                      placeholder="Num"
                      className={styles.fraccionInput}
                      aria-label="Numerador de la primera fracción"
                    />
                    <div className={styles.fraccionLinea} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={den1}
                      onChange={(e) => setDen1(e.target.value)}
                      placeholder="Den"
                      className={styles.fraccionInput}
                      aria-label="Denominador de la primera fracción"
                    />
                  </div>

                  <div className={styles.operacionFraccion}>
                    {(['+', '-', '*', '/'] as const).map(op => (
                      <button
                        key={op}
                        className={`${styles.opFracBtn} ${operacionFraccion === op ? styles.opActivo : ''}`}
                        onClick={() => setOperacionFraccion(op)}
                        aria-pressed={operacionFraccion === op}
                      >
                        {op === '*' ? '×' : op === '/' ? '÷' : op}
                      </button>
                    ))}
                  </div>

                  <div className={styles.fraccion}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={num2}
                      onChange={(e) => setNum2(e.target.value)}
                      placeholder="Num"
                      className={styles.fraccionInput}
                      aria-label="Numerador de la segunda fracción"
                    />
                    <div className={styles.fraccionLinea} />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={den2}
                      onChange={(e) => setDen2(e.target.value)}
                      placeholder="Den"
                      className={styles.fraccionInput}
                      aria-label="Denominador de la segunda fracción"
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

        <div className={styles.resultsPanel} role="status" aria-live="polite">
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">🧮</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          ) : resultados.tipo === 'error' ? (
            <div className={styles.error} role="alert">
              <span aria-hidden="true">⚠️</span>
              <p>{resultados.mensaje}</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {resultados.tipo === 'matriz' && (
                <>
                  <div className={styles.matrizResultado}>
                    <h3>{resultados.descripcion}</h3>
                    <div className={styles.matrizGrid}>
                      {Array.isArray(resultados.resultado) && resultados.resultado.map((v: number, i: number) => (
                        <span key={i} className={styles.matrizCellRes}>
                          {formatNumber(v, 4)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ResultCard
                    title="det(A)"
                    value={formatNumber(resultados.detA ?? 0, 4)}
                    variant="info"
                    icon="📐"
                  />
                  <ResultCard
                    title="det(B)"
                    value={formatNumber(resultados.detB ?? 0, 4)}
                    variant="default"
                    icon="📐"
                  />
                </>
              )}

              {resultados.tipo === 'determinante' && (
                <>
                  <ResultCard
                    title="det(A)"
                    value={formatNumber(resultados.detA ?? 0, 4)}
                    variant="highlight"
                    icon="📐"
                  />
                  <ResultCard
                    title="det(B)"
                    value={formatNumber(resultados.detB ?? 0, 4)}
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
                    value={formatNumber(resultados.decimal ?? 0, 6)}
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
                    title={`${resultados.base ?? 0}^${resultados.exponente ?? 0}`}
                    value={formatNumber(Number(resultados.resultado ?? 0), 10)}
                    variant="highlight"
                    icon="²"
                  />
                  <ResultCard
                    title={`${resultados.base ?? 0}^${-(resultados.exponente ?? 0)}`}
                    value={formatNumber(resultados.inversa ?? 0, 10)}
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
                    title={`ⁿ√${resultados.radicando ?? 0} (n=${resultados.indice ?? 0})`}
                    value={formatNumber(Number(resultados.resultado ?? 0), 10)}
                    variant="highlight"
                    icon="√"
                  />
                  <ResultCard
                    title="Resultado²"
                    value={formatNumber(resultados.cuadrado ?? 0, 6)}
                    variant="info"
                    icon="²"
                  />
                  <ResultCard
                    title="Resultado³"
                    value={formatNumber(resultados.cubo ?? 0, 6)}
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
                    title={`log${(resultados.base ?? 0) === 10 ? '' : '₍' + (resultados.base ?? 0) + '₎'}(${resultados.numero ?? 0})`}
                    value={formatNumber(Number(resultados.resultado ?? 0), 10)}
                    variant="highlight"
                    icon="log"
                  />
                  <ResultCard
                    title="ln (logaritmo natural)"
                    value={formatNumber(resultados.logNatural ?? 0, 10)}
                    variant="info"
                    icon="e"
                  />
                  <ResultCard
                    title="log₁₀ (logaritmo común)"
                    value={formatNumber(resultados.log10 ?? 0, 10)}
                    variant="default"
                    icon="10"
                  />
                  <ResultCard
                    title="log₂ (logaritmo binario)"
                    value={formatNumber(resultados.log2 ?? 0, 10)}
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
        title="¿Quieres aprender más sobre Matemáticas Avanzadas?"
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

        {/* SECCIÓN 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa de Operaciones Matemáticas</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de operación</th>
                  <th>Qué resuelve</th>
                  <th>Nivel educativo típico</th>
                  <th>Herramientas necesarias</th>
                  <th>Aplicación práctica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Aritmética básica</strong></td>
                  <td>Sumas, restas, multiplicaciones y divisiones de números reales</td>
                  <td>Primaria (6-12 años)</td>
                  <td>Calculadora básica, papel y lápiz</td>
                  <td>Presupuestos, cambio en efectivo, recetas de cocina</td>
                </tr>
                <tr>
                  <td><strong>Potencias y raíces</strong></td>
                  <td>Multiplicaciones repetidas y sus inversas (2⁴ = 16, √16 = 4)</td>
                  <td>Secundaria (12-16 años)</td>
                  <td>Calculadora científica</td>
                  <td>Interés compuesto, áreas, física (E = mc²)</td>
                </tr>
                <tr>
                  <td><strong>Logaritmos</strong></td>
                  <td>Exponentes inversos: log₁₀(100) = 2 porque 10² = 100</td>
                  <td>Preparatoria (16-18 años)</td>
                  <td>Calculadora científica o tabla logarítmica</td>
                  <td>Escala Richter, pH, decibelios, tiempo de duplicación</td>
                </tr>
                <tr>
                  <td><strong>Trigonometría</strong></td>
                  <td>Relaciones entre ángulos y lados de triángulos (seno, coseno)</td>
                  <td>Preparatoria (16-18 años)</td>
                  <td>Calculadora en modo grados o radianes</td>
                  <td>Navegación, arquitectura, física ondulatoria, GPS</td>
                </tr>
                <tr>
                  <td><strong>Álgebra lineal (matrices)</strong></td>
                  <td>Sistemas de ecuaciones y transformaciones geométricas</td>
                  <td>Universidad (1º-2º curso)</td>
                  <td>Software matemático (MATLAB, Python)</td>
                  <td>Gráficos 3D, machine learning, criptografía, redes neuronales</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECCIÓN 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>¿Quién usa estas operaciones y para qué?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧒</span>
                <h4>Estudiante de primaria/secundaria</h4>
              </div>
              <p>Necesita resolver operaciones básicas y fracciones para exámenes y problemas cotidianos.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo real:</strong> Calcular 3/4 + 1/2 = 5/4 = 1,25. Con esta calculadora obtiene el resultado simplificado al instante.
              </div>
              <p className={styles.escenarioTip}>Usa la sección <em>Fracciones</em> para verificar sus cálculos paso a paso.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📐</span>
                <h4>Estudiante de preparatoria</h4>
              </div>
              <p>Trabaja con funciones logarítmicas y exponenciales en matemáticas de los últimos años de secundaria.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo real:</strong> Resolver log₂(128) = 7 (porque 2⁷ = 128). También comprueba que ln(e³) = 3.
              </div>
              <p className={styles.escenarioTip}>Usa la sección <em>Logaritmos</em> para comparar log, ln y log₂ simultáneamente.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚙️</span>
                <h4>Ingeniero en Diseño</h4>
              </div>
              <p>Calcula potencias y raíces para dimensionar componentes mecánicos o eléctricos.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo real:</strong> Si la resistencia R = √(P/G) y P = 100 W, G = 4 S, entonces R = √25 = 5 Ω.
              </div>
              <p className={styles.escenarioTip}>Usa <em>Potencias</em> y <em>Raíces</em> para cálculos rápidos sin errores de redondeo.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💹</span>
                <h4>Analista Financiero</h4>
              </div>
              <p>Usa logaritmos para calcular el tiempo de duplicación de una inversión con interés compuesto.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo real:</strong> Con un 7% anual, ¿cuándo se duplica el capital? t = ln(2) / ln(1,07) ≈ 10,24 años (regla del 70: 70/7 = 10 años).
              </div>
              <p className={styles.escenarioTip}>Usa <em>Logaritmos</em> con base e (natural) para modelos de crecimiento continuo.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Matemáticas</h2>
          <ol className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Qué es el orden de las operaciones (PEMDAS/BODMAS)?</strong>
              <p>
                Es la jerarquía que determina qué operación se realiza primero: <em>Paréntesis, Exponentes, Multiplicación/División, Adición/Sustracción</em>.
                Ejemplo: <strong>2 + 3 × 4 = 14</strong> (no 20), porque primero se hace 3 × 4 = 12, luego 2 + 12 = 14.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Por qué no se puede dividir por cero?</strong>
              <p>
                Porque no existe ningún número que multiplicado por 0 dé un valor distinto de 0. Si 6 ÷ 0 = x, entonces x × 0 = 6, lo cual es imposible.
                En la calculadora aparecerá error o <em>Infinity</em> según el contexto.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la raíz cuadrada de un número negativo?</strong>
              <p>
                No existe como número real. Por ejemplo, √(−9) no tiene solución en ℝ porque ningún número real al cuadrado da negativo.
                En matemáticas avanzadas se usa el número imaginario <em>i</em>, donde i² = −1, y √(−9) = 3i.
              </p>
              <p className={styles.faqTip}>Esta calculadora indica el error automáticamente al intentar raíces de índice par con radicando negativo.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuál es la diferencia entre log y ln?</strong>
              <p>
                <strong>log</strong> (sin subíndice) suele referirse al <em>logaritmo decimal</em> en base 10: log(100) = 2.
                <strong>ln</strong> es el <em>logaritmo natural</em> en base e ≈ 2,71828: ln(e²) = 2.
                La relación entre ambos es: log(x) = ln(x) / ln(10) ≈ ln(x) / 2,3026.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es un número irracional?</strong>
              <p>
                Un número que no puede expresarse como fracción p/q de enteros. Su decimal no tiene período.
                Ejemplos: √2 = 1,41421356…, π = 3,14159265…, e = 2,71828182…
                Aparecen frecuentemente al calcular raíces y logaritmos.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Para qué sirven los logaritmos en la vida real?</strong>
              <p>
                Comprimen escalas enormes en valores manejables. La escala Richter: un sismo de magnitud 7 libera 10 veces más energía que uno de magnitud 6.
                El pH: un líquido con pH 3 tiene 100 veces más iones H⁺ que uno con pH 5. Los decibelios: cada 10 dB duplica la percepción sonora.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cómo se calcula una potencia fraccionaria?</strong>
              <p>
                Una potencia fraccionaria combina raíz y potencia: x^(m/n) = ⁿ√(xᵐ).
                Ejemplo: 8^(2/3) = ³√(8²) = ³√64 = 4. También: 27^(1/3) = ³√27 = 3.
                En la sección de potencias puedes introducir exponentes decimales como 0,5 (equivalente a raíz cuadrada).
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué es la notación científica?</strong>
              <p>
                Forma de expresar números muy grandes o muy pequeños como producto de un número entre 1 y 10 por una potencia de 10.
                Ejemplo: la velocidad de la luz es 300.000.000 m/s = <strong>3 × 10⁸ m/s</strong>.
                La masa de un electrón es 0,00000000000000000000000000000091 kg = <strong>9,1 × 10⁻³¹ kg</strong>.
              </p>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía: Resolver Expresiones Matemáticas Complejas (PEMDAS)</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Sigue estos 7 pasos para resolver cualquier expresión respetando el orden de operaciones correcto.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica los paréntesis más internos</strong>
                <p>Busca el par de paréntesis más profundo y resuélvelo primero. En <code>(2 + (3 × 4))</code>, primero calculas el paréntesis interior: 3 × 4 = 12.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Resuelve las potencias y raíces</strong>
                <p>Una vez eliminados los paréntesis internos, calcula exponentes y raíces de izquierda a derecha. Ejemplo: 2³ = 8 antes de multiplicar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Multiplica y divide (de izquierda a derecha)</strong>
                <p>Estas operaciones tienen la misma prioridad. <code>12 ÷ 3 × 2 = 4 × 2 = 8</code>, no 12 ÷ 6 = 2. Resuelve en el orden en que aparecen.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Suma y resta (de izquierda a derecha)</strong>
                <p>Igual que el paso anterior: misma prioridad, de izquierda a derecha. <code>10 − 3 + 2 = 7 + 2 = 9</code>, no 10 − 5 = 5.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Verifica la expresión completa con un ejemplo</strong>
                <p>Aplica todo a <code>2 + 3 × (4² − 6) ÷ 5</code>: primero 4² = 16, luego 16 − 6 = 10, luego 3 × 10 = 30, luego 30 ÷ 5 = 6, finalmente 2 + 6 = <strong>8</strong>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Comprueba el resultado con estimación</strong>
                <p>Redondea cada número al entero más cercano y opera mentalmente. Si el resultado exacto se aleja mucho de la estimación, revisa el proceso.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Añade paréntesis explícitos si hay dudas</strong>
                <p>Cuando la expresión es ambigua, agrupa con paréntesis aunque no sean estrictamente necesarios. <code>(2 + 3) × 4</code> es inequívoco: resultado 20.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas al Calcular con esta Herramienta</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <h4>Usa paréntesis para mayor claridad</h4>
              <p>Aunque la calculadora siga el orden correcto, escribir <code>(3 × 4) + 2</code> en lugar de <code>3 × 4 + 2</code> elimina cualquier ambigüedad y te ayuda a revisar tu trabajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Verifica con estimación aproximada</h4>
              <p>Antes de aceptar un resultado, estima mentalmente. Si calculas 97 × 103, espera un resultado cerca de 100² = 10.000. El resultado exacto es 9.991, lo que confirma que es correcto.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h4>Cambia la base de logaritmos con la fórmula adecuada</h4>
              <p>Para calcular log₅(125), usa el cambio de base: log₅(125) = log(125) / log(5) = 2,0969 / 0,6990 = 3. Introduce la base 5 en la sección de logaritmos y obtendrás el resultado directo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Distingue grados de radianes en trigonometría</h4>
              <p>sen(30°) = 0,5 en grados, pero sen(30) en radianes ≈ −0,988. Antes de calcular funciones trigonométricas, confirma la unidad angular que usa tu calculadora o fórmula.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">➗</span>
              <h4>Simplifica fracciones antes de operar</h4>
              <p>Trabajar con fracciones reducidas reduce errores de cálculo. En lugar de operar 12/18 + 8/12, simplifica primero: 2/3 + 2/3 = 4/3. La calculadora de fracciones simplifica automáticamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <h4>Aprovecha las propiedades de los logaritmos</h4>
              <p>log(a × b) = log(a) + log(b) y log(aⁿ) = n × log(a). Por ejemplo, log(8) = log(2³) = 3 × log(2) ≈ 3 × 0,301 = 0,903. Estas propiedades simplifican cálculos complejos.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — Errores Clásicos */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Clásicos que Debes Evitar</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Ignorar el orden de operaciones:</strong> 2 + 3 × 4 <em>no</em> es 20. Primero la multiplicación: 3 × 4 = 12, luego la suma: 2 + 12 = <strong>14</strong>.
              </li>
              <li>
                <strong>Confundir a² con 2a:</strong> Si a = 5, entonces a² = 5² = 25, pero 2a = 2 × 5 = 10. Son expresiones completamente distintas.
              </li>
              <li>
                <strong>Creer que √(a + b) = √a + √b:</strong> √(9 + 16) = √25 = 5, <em>no</em> √9 + √16 = 3 + 4 = 7. La raíz no distribuye sobre la suma.
              </li>
              <li>
                <strong>Creer que log(a + b) = log(a) + log(b):</strong> log(2 + 8) = log(10) = 1, pero log(2) + log(8) = log(16) ≈ 1,204. Solo se cumple log(a × b) = log(a) + log(b).
              </li>
              <li>
                <strong>Dividir por cero:</strong> 5 ÷ 0 no es infinito ni 0; es una operación <em>indefinida</em>. En programación genera error o el valor especial <code>Infinity</code>.
              </li>
              <li>
                <strong>Confundir grados y radianes:</strong> cos(90°) = 0, pero cos(90 rad) ≈ −0,448. Antes de usar valores trigonométricos, verifica siempre la unidad angular del cálculo.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-matematica')} />

      <ShareCard appName="calculadora-matematica" />
      <Footer appName="calculadora-matematica" />
    </div>
  );
}
