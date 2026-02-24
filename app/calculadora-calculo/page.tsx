'use client';

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
                    className={`${styles.serieBtn} ${tipoSerie === 'aritmetica' ? styles.serieActiva : ''}`}
                    onClick={() => setTipoSerie('aritmetica')}
                  >
                    Aritmética
                  </button>
                  <button
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
