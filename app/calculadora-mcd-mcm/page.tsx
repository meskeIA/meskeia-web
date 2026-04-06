'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CalculadoraMcdMcm.module.css';
import { MeskeiaLogo, Footer, ResultCard, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface Resultado {
  mcd: number;
  mcm: number;
  factoresMcd: Map<number, number>;
  factoresMcm: Map<number, number>;
  numeros: number[];
}

// Calcular MCD de dos números usando algoritmo de Euclides
function mcdDos(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Calcular MCM de dos números
function mcmDos(a: number, b: number): number {
  return Math.abs(a * b) / mcdDos(a, b);
}

// Calcular MCD de array de números
function mcdArray(nums: number[]): number {
  return nums.reduce((acc, num) => mcdDos(acc, num));
}

// Calcular MCM de array de números
function mcmArray(nums: number[]): number {
  return nums.reduce((acc, num) => mcmDos(acc, num));
}

// Factorizar un número
function factorizar(n: number): Map<number, number> {
  const factores = new Map<number, number>();
  let num = Math.abs(n);
  let divisor = 2;

  while (num > 1) {
    while (num % divisor === 0) {
      factores.set(divisor, (factores.get(divisor) || 0) + 1);
      num = num / divisor;
    }
    divisor++;
  }

  return factores;
}

// Obtener factores comunes (para MCD)
function factoresMcd(numeros: number[]): Map<number, number> {
  const todosFactores = numeros.map(n => factorizar(n));
  const resultado = new Map<number, number>();

  if (todosFactores.length === 0) return resultado;

  // Obtener todos los primos del primer número
  const primerFactores = todosFactores[0];

  primerFactores.forEach((exp, primo) => {
    let minExp = exp;
    // Verificar si el primo está en todos los demás y obtener mínimo exponente
    for (let i = 1; i < todosFactores.length; i++) {
      const expEnOtro = todosFactores[i].get(primo);
      if (expEnOtro === undefined) {
        minExp = 0;
        break;
      }
      minExp = Math.min(minExp, expEnOtro);
    }
    if (minExp > 0) {
      resultado.set(primo, minExp);
    }
  });

  return resultado;
}

// Obtener todos los factores (para MCM)
function factoresMcm(numeros: number[]): Map<number, number> {
  const todosFactores = numeros.map(n => factorizar(n));
  const resultado = new Map<number, number>();

  todosFactores.forEach(factores => {
    factores.forEach((exp, primo) => {
      const expActual = resultado.get(primo) || 0;
      resultado.set(primo, Math.max(expActual, exp));
    });
  });

  return resultado;
}

export default function CalculadoraMcdMcmPage() {
  const [inputs, setInputs] = useState(['', '', '']);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState('');

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, '']);
    }
  };

  const removeInput = (index: number) => {
    if (inputs.length > 2) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const calcular = () => {
    setError('');
    setResultado(null);

    // Parsear y validar números
    const numeros: number[] = [];
    for (const input of inputs) {
      if (input.trim() === '') continue;
      const num = parseSpanishNumber(input);
      if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        setError('Todos los valores deben ser números enteros positivos');
        return;
      }
      numeros.push(num);
    }

    if (numeros.length < 2) {
      setError('Introduce al menos 2 números');
      return;
    }

    const mcd = mcdArray(numeros);
    const mcm = mcmArray(numeros);

    setResultado({
      mcd,
      mcm,
      factoresMcd: factoresMcd(numeros),
      factoresMcm: factoresMcm(numeros),
      numeros,
    });
  };

  const limpiar = () => {
    setInputs(['', '', '']);
    setResultado(null);
    setError('');
  };

  const formatFactores = (factores: Map<number, number>): string => {
    if (factores.size === 0) return '1';
    const parts: string[] = [];
    const sortedKeys = Array.from(factores.keys()).sort((a, b) => a - b);
    sortedKeys.forEach(primo => {
      const exp = factores.get(primo)!;
      if (exp === 1) {
        parts.push(`${primo}`);
      } else {
        parts.push(`${primo}^${exp}`);
      }
    });
    return parts.join(' × ');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora MCD y MCM</h1>
        <p className={styles.subtitle}>
          Calcula el Máximo Común Divisor y Mínimo Común Múltiplo de hasta 5 números
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2>Introduce los números</h2>

          <div className={styles.inputList}>
            {inputs.map((input, index) => (
              <div key={index} className={styles.inputRow}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Número ${index + 1}`}
                  className={styles.numberInput}
                />
                {inputs.length > 2 && (
                  <button
                    onClick={() => removeInput(index)}
                    className={styles.removeBtn}
                    title="Eliminar"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {inputs.length < 5 && (
            <button onClick={addInput} className={styles.addBtn}>
              + Añadir número
            </button>
          )}

          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular MCD y MCM
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <ResultCard
                title="MCD (Máximo Común Divisor)"
                value={formatNumber(resultado.mcd, 0)}
                variant="highlight"
                icon="🔢"
                description="El mayor número que divide a todos"
              />

              <ResultCard
                title="MCM (Mínimo Común Múltiplo)"
                value={formatNumber(resultado.mcm, 0)}
                variant="info"
                icon="✖️"
                description="El menor múltiplo común a todos"
              />

              <div className={styles.explanationBox}>
                <h3>Descomposición en factores primos</h3>

                <div className={styles.factorizationGrid}>
                  {resultado.numeros.map((num, i) => (
                    <div key={i} className={styles.factorRow}>
                      <span className={styles.numLabel}>{formatNumber(num, 0)} =</span>
                      <span className={styles.factors}>{formatFactores(factorizar(num))}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.methodBox}>
                  <div className={styles.methodItem}>
                    <strong>MCD = {formatNumber(resultado.mcd, 0)}</strong>
                    <p>Factores comunes con menor exponente:</p>
                    <code>{formatFactores(resultado.factoresMcd) || '1'}</code>
                  </div>

                  <div className={styles.methodItem}>
                    <strong>MCM = {formatNumber(resultado.mcm, 0)}</strong>
                    <p>Todos los factores con mayor exponente:</p>
                    <code>{formatFactores(resultado.factoresMcm)}</code>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔢</span>
              <p>Introduce al menos 2 números y pulsa &quot;Calcular&quot;</p>
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="MCD y MCM: Guía Completa"
        subtitle="Entiende el algoritmo de Euclides, la factorización en primos y las aplicaciones del MCD y MCM en matemáticas y programación"
        icon="🔢"
      >
        <section>
          <h4>¿Qué son el MCD y el MCM?</h4>
          <ul>
            <li><strong>MCD (Máximo Común Divisor)</strong>: El mayor número entero positivo que divide exactamente a todos los números dados sin dejar resto. También llamado GCD en inglés (Greatest Common Divisor).</li>
            <li><strong>MCM (Mínimo Común Múltiplo)</strong>: El menor número entero positivo que es múltiplo de todos los números dados. También llamado LCM (Least Common Multiple).</li>
          </ul>
          <p><strong>Relación entre MCD y MCM</strong> (para dos números a y b): <code>MCD(a,b) × MCM(a,b) = a × b</code></p>
          <p>Ejemplo: MCD(12,18) = 6 y MCM(12,18) = 36 → 6 × 36 = 216 = 12 × 18 ✓</p>
        </section>

        <section>
          <h4>El algoritmo de Euclides: la forma más eficiente</h4>
          <p>El <strong>algoritmo de Euclides</strong> (≈300 a.C.) es uno de los algoritmos más antiguos conocidos y sigue siendo el más eficiente para calcular el MCD. Su principio: <em>MCD(a, b) = MCD(b, a mod b)</em>, y se repite hasta que el resto es 0.</p>
          <p><strong>Ejemplo paso a paso: MCD(48, 18)</strong></p>
          <ul>
            <li>MCD(48, 18): 48 = 2×18 + 12 → resto 12</li>
            <li>MCD(18, 12): 18 = 1×12 + 6 → resto 6</li>
            <li>MCD(12, 6): 12 = 2×6 + 0 → resto 0 → ¡MCD = 6!</li>
          </ul>
          <p>Esta herramienta usa el algoritmo de Euclides internamente. Para más de dos números: MCD(a,b,c) = MCD(MCD(a,b), c).</p>
        </section>

        <section>
          <h4>Método de factorización en primos</h4>
          <p>Alternativa al algoritmo de Euclides, más visual para aprender:</p>
          <ul>
            <li><strong>Para el MCD</strong>: Descompone cada número en factores primos. Toma los factores <em>comunes</em> con el <em>menor</em> exponente.</li>
            <li><strong>Para el MCM</strong>: Toma <em>todos</em> los factores (comunes y no comunes) con el <em>mayor</em> exponente.</li>
          </ul>
          <p><strong>Ejemplo: MCD y MCM de 12 y 18</strong></p>
          <ul>
            <li>12 = 2² × 3¹</li>
            <li>18 = 2¹ × 3²</li>
            <li>MCD = 2¹ × 3¹ = <strong>6</strong> (factores comunes, menor exponente)</li>
            <li>MCM = 2² × 3² = <strong>36</strong> (todos los factores, mayor exponente)</li>
          </ul>
        </section>

        <section>
          <h4>Aplicaciones en matemáticas</h4>
          <ul>
            <li><strong>Simplificar fracciones</strong>: Divide numerador y denominador por su MCD. Ej: 18/24 → MCD(18,24)=6 → 18/6 / 24/6 = 3/4.</li>
            <li><strong>Sumar fracciones con distinto denominador</strong>: El mínimo común denominador es el MCM de los denominadores. Ej: 1/4 + 1/6 → MCM(4,6)=12 → 3/12 + 2/12 = 5/12.</li>
            <li><strong>Problemas de distribución equitativa</strong>: ¿Cuántos grupos iguales máximos puedes formar con 24 manzanas y 36 naranjas? MCD(24,36) = 12 grupos, cada uno con 2 manzanas y 3 naranjas.</li>
            <li><strong>Números primos entre sí (coprimos)</strong>: Dos números son coprimos si su MCD = 1. Ej: MCD(8,9) = 1 → son coprimos aunque ninguno sea primo.</li>
          </ul>
        </section>

        <section>
          <h4>Aplicaciones en programación y tecnología</h4>
          <ul>
            <li><strong>Sincronización de ciclos</strong>: Si un proceso A se repite cada 6 segundos y B cada 4 segundos, ¿cuándo coinciden? MCM(6,4) = 12 segundos.</li>
            <li><strong>Reducción de razones en interfaces</strong>: Las relaciones de aspecto de pantallas (16:9, 4:3) se expresan reduciendo por su MCD. 1920×1080: MCD(1920,1080)=120 → 16:9.</li>
            <li><strong>Criptografía RSA</strong>: El algoritmo de Euclides extendido es fundamental para calcular el inverso modular, que es la base del cifrado RSA.</li>
            <li><strong>Algoritmos de fracciones en software</strong>: Calculadoras, hojas de cálculo y lenguajes de programación con tipos racionales (Python <code>fractions.Fraction</code>) usan el MCD para mantener fracciones en forma reducida.</li>
          </ul>
        </section>

        <section>
          <h4>Curiosidades y propiedades</h4>
          <ul>
            <li>MCD(a, 0) = a (cualquier número divide a 0)</li>
            <li>MCD(a, a) = a</li>
            <li>Si a divide a b, entonces MCD(a, b) = a y MCM(a, b) = b</li>
            <li>El algoritmo de Euclides tiene complejidad O(log min(a,b)) — extremadamente eficiente incluso con números muy grandes</li>
            <li>El MCD de los n primeros números naturales crece lentamente: MCD(1,2,...,n) = 1 para n &gt; 2, pero el MCM crece aproximadamente como e^n (función del primo más grande ≤ n)</li>
          </ul>
        </section>

        {/* SECCIÓN 1: Tabla Comparativa MCD vs MCM */}
        <section>
          <h4>Tabla Comparativa: MCD vs MCM</h4>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>MCD (Máximo Común Divisor)</th>
                  <th>MCM (Mínimo Común Múltiplo)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Definición</strong></td>
                  <td>Mayor entero que divide exactamente a todos los números</td>
                  <td>Menor entero positivo que es múltiplo de todos los números</td>
                </tr>
                <tr>
                  <td><strong>Cómo se calcula</strong></td>
                  <td>Factores comunes con el <em>menor</em> exponente</td>
                  <td>Todos los factores con el <em>mayor</em> exponente</td>
                </tr>
                <tr>
                  <td><strong>Qué representa</strong></td>
                  <td>El &quot;divisor más grande en común&quot;</td>
                  <td>El &quot;múltiplo más pequeño en común&quot;</td>
                </tr>
                <tr>
                  <td><strong>Cuándo se usa</strong></td>
                  <td>Simplificar fracciones, dividir en grupos iguales</td>
                  <td>Sumar fracciones, sincronizar ciclos</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo (12 y 18)</strong></td>
                  <td>MCD(12, 18) = <strong>6</strong></td>
                  <td>MCM(12, 18) = <strong>36</strong></td>
                </tr>
                <tr>
                  <td><strong>Verificación</strong></td>
                  <td colSpan={2}>MCD × MCM = 6 × 36 = 216 = 12 × 18 ✓</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <strong>Relación clave:</strong> Para dos números <em>a</em> y <em>b</em>, siempre se cumple que <code>MCD(a,b) × MCM(a,b) = a × b</code>. Esta propiedad permite calcular el MCM a partir del MCD (y viceversa) de forma rápida.
          </p>
        </section>

        {/* SECCIÓN 2: Casos de Uso — 4 perfiles */}
        <section>
          <h4>¿Quién usa el MCD y MCM? Casos reales</h4>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧮</span>
                <strong>Estudiante (Primaria / ESO)</strong>
              </div>
              <p>Trabaja con fracciones a diario: suma, resta y simplifica.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Sumar ½ + ⅓ → MCM(2, 3) = 6 → mínimo común denominador → 3/6 + 2/6 = 5/6
              </div>
              <div className={styles.escenarioTip}>
                Simplificar 12/18: MCD(12, 18) = 6 → 12/6 ÷ 18/6 = <strong>2/3</strong>
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🪚</span>
                <strong>Carpintero</strong>
              </div>
              <p>Necesita cortar tablones en piezas iguales sin desperdiciar material.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Tablones de 120 cm y 180 cm → MCD(120, 180) = 60 cm → piezas de 60 cm encajan perfectamente en ambos
              </div>
              <div className={styles.escenarioTip}>
                Resultado: 2 piezas del tablón corto y 3 del largo, sin cortes sobrantes.
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <strong>Programador</strong>
              </div>
              <p>Calcula cuándo coinciden tareas periódicas en sistemas o animaciones.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Tarea A cada 6 ms, tarea B cada 4 ms → MCM(6, 4) = 12 ms → cada 12 ms ambas se ejecutan a la vez
              </div>
              <div className={styles.escenarioTip}>
                Reducir relaciones de aspecto: 1920×1080 → MCD = 120 → <strong>16:9</strong>
              </div>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍳</span>
                <strong>Cocinero / Repostero</strong>
              </div>
              <p>Divide recetas en porciones exactas para distintos grupos de comensales.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Receta para 8 personas, otra para 12 → MCM(8, 12) = 24 → la cantidad mínima que funciona para ambas recetas sin fraccionar ingredientes
              </div>
              <div className={styles.escenarioTip}>
                MCD(8, 12) = 4 → se pueden hacer 4 raciones iguales con ambas recetas.
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN 3: FAQ — 8 preguntas */}
        <section>
          <h4>Preguntas Frecuentes sobre MCD y MCM</h4>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre MCD y MCM?</dt>
              <dd>El MCD busca el divisor más grande que comparten los números (divide <em>hacia abajo</em>), mientras el MCM busca el múltiplo más pequeño que tienen en común (escala <em>hacia arriba</em>). Para 4 y 6: MCD = 2 (cuánto cabe en ambos), MCM = 12 (primer número en el que ambos caben).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo calculo el MCD a mano?</dt>
              <dd>Dos métodos: <strong>(1) Factorización</strong>: descompón cada número en primos y toma los factores comunes con el exponente menor. <strong>(2) Algoritmo de Euclides</strong>: divide el mayor entre el menor, toma el resto, y repite hasta que el resto sea 0. El último divisor no nulo es el MCD.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el algoritmo de Euclides?</dt>
              <dd>Es un método de unos 2.300 años de antigüedad, atribuido al matemático griego Euclides. Se basa en que MCD(a, b) = MCD(b, a mod b). Ejemplo: MCD(48, 18) → MCD(18, 12) → MCD(12, 6) → MCD(6, 0) = <strong>6</strong>. Es el algoritmo más eficiente: funciona en O(log n) pasos.</dd>
              <div className={styles.faqTip}>El algoritmo de Euclides es uno de los algoritmos más antiguos en uso activo hoy en día.</div>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Sirve el MCD para simplificar fracciones?</dt>
              <dd>Sí, es el uso más habitual en matemáticas escolares. Para simplificar una fracción a/b, calcula MCD(a, b) y divide numerador y denominador entre ese valor. Ejemplo: 18/24 → MCD(18, 24) = 6 → (18÷6)/(24÷6) = <strong>3/4</strong> (fracción irreducible).</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo sumo fracciones con distinto denominador usando el MCM?</dt>
              <dd>El MCM de los denominadores es el mínimo común denominador (mcd). Ejemplo: 1/4 + 1/6 → MCM(4, 6) = 12 → convierte a 3/12 + 2/12 = <strong>5/12</strong>. Usar el MCM (y no otro múltiplo cualquiera) garantiza que la fracción resultante sea lo más sencilla posible.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puede el MCD ser 1?</dt>
              <dd>Sí, y es muy común. Si MCD(a, b) = 1, los números se llaman <strong>coprimos</strong> (o primos entre sí). Ejemplos: MCD(8, 9) = 1, MCD(14, 15) = 1. Ojo: los números no tienen que ser primos para ser coprimos entre sí.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué son los números coprimos?</dt>
              <dd>Dos números son coprimos (o relativamente primos) cuando su MCD es 1, es decir, no comparten ningún factor primo. Ejemplos: 9 y 16 son coprimos (9 = 3², 16 = 2⁴), aunque ninguno de los dos es un número primo. La coprimalidad es clave en criptografía y teoría de números.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué relación tiene el MCD con la criptografía RSA?</dt>
              <dd>El algoritmo RSA usa el <strong>algoritmo de Euclides extendido</strong> para calcular el inverso modular, que es la clave privada de descifrado. La seguridad de RSA depende de que MCD(e, φ(n)) = 1, donde e es el exponente público y φ(n) la función de Euler. Sin el MCD no existiría el cifrado moderno de clave pública.</dd>
              <div className={styles.faqTip}>RSA es el cifrado que protege HTTPS, tarjetas de crédito y firmas digitales.</div>
            </div>
          </dl>
        </section>

        {/* SECCIÓN 4: Guía Paso a Paso */}
        <section>
          <h4>Guía Paso a Paso: Cómo Calcular MCD y MCM</h4>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Descompón cada número en factores primos</strong>
                <p>Divide sucesivamente entre 2, 3, 5, 7… hasta que el cociente sea 1. Ejemplo: 48 = 2 × 2 × 2 × 2 × 3 = 2⁴ × 3¹ | 18 = 2 × 3 × 3 = 2¹ × 3²</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Identifica los factores comunes</strong>
                <p>Busca qué primos aparecen en TODOS los números. En el ejemplo: 2 y 3 aparecen en ambos (48 y 18).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Calcula el MCD por factorización</strong>
                <p>Toma los factores comunes con el <em>menor</em> exponente y multiplícalos. MCD(48, 18) = 2¹ × 3¹ = <strong>6</strong>. Verifica: 48 ÷ 6 = 8 ✓ | 18 ÷ 6 = 3 ✓</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Alternativa rápida: algoritmo de Euclides</strong>
                <p>MCD(48, 18): 48 = 2×18 + 12 → MCD(18, 12): 18 = 1×12 + 6 → MCD(12, 6): 12 = 2×6 + 0 → <strong>MCD = 6</strong>. Mucho más rápido para números grandes.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Calcula el MCM por factorización</strong>
                <p>Toma <em>todos</em> los factores primos (comunes y exclusivos) con el <em>mayor</em> exponente. MCM(48, 18) = 2⁴ × 3² = 16 × 9 = <strong>144</strong>.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Alternativa: MCM a partir del MCD</strong>
                <p>Usa la fórmula MCM(a, b) = (a × b) / MCD(a, b). MCM(48, 18) = (48 × 18) / 6 = 864 / 6 = <strong>144</strong>. Más eficiente y evita errores de factorización.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Verifica el resultado</strong>
                <p>Comprueba que MCD × MCM = a × b. Para 48 y 18: 6 × 144 = 864 = 48 × 18 ✓. Para 3 o más números, aplica MCD(MCD(a,b), c) y MCM(MCM(a,b), c) de forma encadenada.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* SECCIÓN 5: Mejores Prácticas */}
        <section>
          <h4>Consejos y Mejores Prácticas</h4>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <strong>Usa Euclides para números grandes</strong>
              <p>La factorización es visualmente clara pero lenta con números grandes (ej. 2.457 y 3.969). El algoritmo de Euclides calcula MCD(2457, 3969) en 5 pasos frente a decenas de divisiones.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔗</span>
              <strong>Calcula MCM a través del MCD</strong>
              <p>MCM(a, b) = (a × b) / MCD(a, b). Es más rápido y menos propenso a errores que factorizar dos veces. Con esta calculadora, ambos valores se calculan en un solo paso.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✂️</span>
              <strong>Simplifica fracciones siempre primero</strong>
              <p>Antes de sumar, restar o comparar fracciones, simplifícalas con el MCD. Trabajar con 3/4 es mucho más cómodo que con 18/24, aunque sean iguales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <strong>Verifica con la propiedad MCD × MCM = a × b</strong>
              <p>Es la comprobación más rápida para saber si has calculado bien. Si el producto no coincide, hay un error en alguno de los dos valores.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <strong>Para 3 o más números, aplica de forma encadenada</strong>
              <p>MCD(a, b, c) = MCD(MCD(a, b), c). Ejemplo: MCD(12, 18, 24) = MCD(MCD(12, 18), 24) = MCD(6, 24) = <strong>6</strong>. Esta calculadora lo hace automáticamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <strong>Recuerda qué operación necesitas</strong>
              <p>¿Dividir en grupos? → MCD. ¿Encontrar un denominador común? → MCM. ¿Sincronizar eventos? → MCM. ¿Simplificar una fracción? → MCD. La elección correcta evita cálculos innecesarios.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 6: Warning Box — Errores típicos */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores Frecuentes que Debes Evitar</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir MCD con MCM.</strong> El MCD siempre es ≤ al menor de los números; el MCM siempre es ≥ al mayor. Si obtienes un MCD mayor que alguno de los números, hay un error.
              </li>
              <li>
                <strong>Olvidar que MCD(a,b) × MCM(a,b) = a × b.</strong> Esta propiedad solo vale para <em>dos</em> números. Para tres o más, NO es cierta directamente. No intentes aplicarla a grupos de 3 números.
              </li>
              <li>
                <strong>Error en la factorización en primos.</strong> Verificar siempre multiplicando los factores: si 48 = 2⁴ × 3, entonces 16 × 3 = 48 ✓. Un error en un exponente arruina todo el cálculo.
              </li>
              <li>
                <strong>Confundir número primo con coprimo.</strong> Un número primo solo tiene dos divisores (1 y él mismo). Dos números coprimos tienen MCD = 1, pero pueden no ser primos. Ejemplo: 4 y 9 son coprimos (MCD = 1) pero ninguno es primo.
              </li>
              <li>
                <strong>Usar el MCM como denominador cuando hay una fracción ya simplificada.</strong> Siempre simplifica las fracciones antes de buscar el MCM de los denominadores. Trabajar con denominadores más pequeños reduce el riesgo de error.
              </li>
              <li>
                <strong>Aplicar el algoritmo de Euclides en el orden incorrecto.</strong> Siempre divide el número mayor entre el menor. MCD(18, 48) da el mismo resultado que MCD(48, 18), pero si empiezas con el menor: 18 = 0×48 + 18 y en el siguiente paso ya tienes MCD(48, 18), que es el orden correcto.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-mcd-mcm')} />

      <ShareCard appName="calculadora-mcd-mcm" />
      <Footer appName="calculadora-mcd-mcm" />
    </div>
  );
}
