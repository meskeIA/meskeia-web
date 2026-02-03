'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraTeoriaNumeros.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoCalculo = 'primos' | 'factorizacion' | 'mcdmcm' | 'divisores' | 'modular';

export default function CalculadoraTeoriaNumerosPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('primos');

  // Números primos
  const [numeroPrimo, setNumeroPrimo] = useState('');
  const [rangoInicio, setRangoInicio] = useState('');
  const [rangoFin, setRangoFin] = useState('');

  // MCD y MCM
  const [numero1, setNumero1] = useState('');
  const [numero2, setNumero2] = useState('');
  const [numero3, setNumero3] = useState('');

  // Aritmética modular
  const [base, setBase] = useState('');
  const [exponente, setExponente] = useState('');
  const [modulo, setModulo] = useState('');

  // Funciones auxiliares
  const esPrimo = (n: number): boolean => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const factorizar = (n: number): Map<number, number> => {
    const factores = new Map<number, number>();
    let num = Math.abs(n);

    if (num < 2) return factores;

    for (let i = 2; i <= Math.sqrt(num); i++) {
      while (num % i === 0) {
        factores.set(i, (factores.get(i) || 0) + 1);
        num /= i;
      }
    }
    if (num > 1) {
      factores.set(num, 1);
    }
    return factores;
  };

  const mcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  const mcm = (a: number, b: number): number => {
    return Math.abs(a * b) / mcd(a, b);
  };

  const obtenerDivisores = (n: number): number[] => {
    const divisores: number[] = [];
    n = Math.abs(n);
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        divisores.push(i);
        if (i !== n / i) {
          divisores.push(n / i);
        }
      }
    }
    return divisores.sort((a, b) => a - b);
  };

  const cribaEratostenes = (max: number): number[] => {
    if (max < 2) return [];
    const sieve = new Array(max + 1).fill(true);
    sieve[0] = sieve[1] = false;

    for (let i = 2; i <= Math.sqrt(max); i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= max; j += i) {
          sieve[j] = false;
        }
      }
    }

    return sieve.map((isPrime, index) => isPrime ? index : -1).filter(n => n !== -1);
  };

  const potenciaModular = (base: number, exp: number, mod: number): number => {
    if (mod === 1) return 0;
    let result = 1;
    base = base % mod;
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod;
      }
      exp = Math.floor(exp / 2);
      base = (base * base) % mod;
    }
    return result;
  };

  const funcionEuler = (n: number): number => {
    let result = n;
    for (let p = 2; p * p <= n; p++) {
      if (n % p === 0) {
        while (n % p === 0) {
          n /= p;
        }
        result -= result / p;
      }
    }
    if (n > 1) {
      result -= result / n;
    }
    return result;
  };

  const resultados = useMemo(() => {
    switch (tipoCalculo) {
      case 'primos': {
        const n = parseInt(numeroPrimo);
        const inicio = parseInt(rangoInicio) || 2;
        const fin = parseInt(rangoFin) || 100;

        if (!isNaN(n) && n > 0) {
          const primo = esPrimo(n);

          // Encontrar primos cercanos
          let anteriorPrimo = n - 1;
          while (anteriorPrimo > 1 && !esPrimo(anteriorPrimo)) anteriorPrimo--;

          let siguientePrimo = n + 1;
          while (!esPrimo(siguientePrimo) && siguientePrimo < n + 1000) siguientePrimo++;

          // Posición en la secuencia de primos
          let posicion = 0;
          if (primo) {
            for (let i = 2; i <= n; i++) {
              if (esPrimo(i)) posicion++;
            }
          }

          return {
            tipo: 'verificacion',
            numero: n,
            esPrimo: primo,
            anteriorPrimo: anteriorPrimo > 1 ? anteriorPrimo : null,
            siguientePrimo,
            posicion: primo ? posicion : null
          };
        }

        if (fin > inicio && fin - inicio <= 1000) {
          const primos = cribaEratostenes(fin).filter(p => p >= inicio);
          return {
            tipo: 'rango',
            inicio,
            fin,
            primos,
            cantidad: primos.length
          };
        }

        return null;
      }

      case 'factorizacion': {
        const n = parseInt(numeroPrimo);
        if (isNaN(n) || n < 2) return null;

        const factores = factorizar(n);
        const factoresArray = Array.from(factores.entries());

        // Formato de factorización
        const factorizacionStr = factoresArray
          .map(([p, e]) => e > 1 ? `${p}^${e}` : `${p}`)
          .join(' × ');

        // Número de divisores = producto de (exponente + 1)
        const numDivisores = factoresArray.reduce((acc, [, e]) => acc * (e + 1), 1);

        // Suma de divisores
        const sumaDivisores = obtenerDivisores(n).reduce((a, b) => a + b, 0);

        // Es perfecto si suma de divisores propios = n
        const esPerfecto = sumaDivisores - n === n;

        return {
          tipo: 'factorizacion',
          numero: n,
          factores: factoresArray,
          factorizacionStr,
          numDivisores,
          sumaDivisores,
          esPerfecto,
          esPrimo: factoresArray.length === 1 && factoresArray[0][1] === 1
        };
      }

      case 'mcdmcm': {
        const a = parseInt(numero1);
        const b = parseInt(numero2);
        const c = parseInt(numero3);

        if (isNaN(a) || isNaN(b)) return null;

        let mcdResult: number, mcmResult: number;

        if (!isNaN(c) && c > 0) {
          // Tres números
          mcdResult = mcd(mcd(a, b), c);
          mcmResult = mcm(mcm(a, b), c);
        } else {
          // Dos números
          mcdResult = mcd(a, b);
          mcmResult = mcm(a, b);
        }

        // Verificar relación mcd × mcm = a × b (solo para 2 números)
        const producto = isNaN(c) ? a * b : null;
        const productoMcdMcm = isNaN(c) ? mcdResult * mcmResult : null;

        // Coprimos
        const sonCoprimos = mcdResult === 1;

        return {
          tipo: 'mcdmcm',
          numeros: isNaN(c) ? [a, b] : [a, b, c],
          mcd: mcdResult,
          mcm: mcmResult,
          producto,
          productoMcdMcm,
          sonCoprimos
        };
      }

      case 'divisores': {
        const n = parseInt(numeroPrimo);
        if (isNaN(n) || n < 1) return null;

        const divisores = obtenerDivisores(n);
        const divisoresPropios = divisores.slice(0, -1);
        const suma = divisores.reduce((a, b) => a + b, 0);
        const sumaPropios = divisoresPropios.reduce((a, b) => a + b, 0);

        // Clasificación
        let clasificacion: string;
        if (sumaPropios === n) clasificacion = 'Perfecto';
        else if (sumaPropios > n) clasificacion = 'Abundante';
        else clasificacion = 'Deficiente';

        // Pares de divisores
        const pares: [number, number][] = [];
        for (let i = 0; i < divisores.length / 2; i++) {
          pares.push([divisores[i], divisores[divisores.length - 1 - i]]);
        }

        return {
          tipo: 'divisores',
          numero: n,
          divisores,
          divisoresPropios,
          cantidad: divisores.length,
          suma,
          sumaPropios,
          clasificacion,
          pares
        };
      }

      case 'modular': {
        const b = parseInt(base);
        const e = parseInt(exponente);
        const m = parseInt(modulo);

        if (isNaN(b) || isNaN(m) || m <= 0) return null;

        // Residuo simple
        const residuo = ((b % m) + m) % m;

        // Potencia modular (si hay exponente)
        let potenciaMod = null;
        if (!isNaN(e) && e >= 0) {
          potenciaMod = potenciaModular(b, e, m);
        }

        // Función de Euler φ(m)
        const phi = funcionEuler(m);

        // Inverso modular (existe si mcd(b, m) = 1)
        let inverso = null;
        if (mcd(b, m) === 1) {
          // Usando teorema de Euler: b^(-1) ≡ b^(φ(m)-1) (mod m)
          inverso = potenciaModular(b, phi - 1, m);
        }

        return {
          tipo: 'modular',
          base: b,
          exponente: e,
          modulo: m,
          residuo,
          potenciaMod,
          phi,
          inverso,
          tieneInverso: inverso !== null
        };
      }

      default:
        return null;
    }
  }, [tipoCalculo, numeroPrimo, rangoInicio, rangoFin, numero1, numero2, numero3, base, exponente, modulo]);

  const tipos: { id: TipoCalculo; nombre: string; icono: string }[] = [
    { id: 'primos', nombre: 'Primos', icono: '🔢' },
    { id: 'factorizacion', nombre: 'Factorización', icono: '×' },
    { id: 'mcdmcm', nombre: 'MCD / MCM', icono: '÷' },
    { id: 'divisores', nombre: 'Divisores', icono: '📊' },
    { id: 'modular', nombre: 'Aritmética Modular', icono: 'mod' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔢 Calculadora de Teoría de Números</h1>
        <p className={styles.subtitle}>
          Números primos, factorización, MCD, MCM, divisores y aritmética modular
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
            {tipoCalculo === 'primos' && (
              <>
                <NumberInput
                  value={numeroPrimo}
                  onChange={setNumeroPrimo}
                  label="Verificar número"
                  placeholder="97"
                  helperText="¿Es primo?"
                />
                <div className={styles.separador}>— o generar rango —</div>
                <div className={styles.rangoRow}>
                  <NumberInput
                    value={rangoInicio}
                    onChange={setRangoInicio}
                    label="Desde"
                    placeholder="1"
                  />
                  <NumberInput
                    value={rangoFin}
                    onChange={setRangoFin}
                    label="Hasta"
                    placeholder="100"
                  />
                </div>
              </>
            )}

            {tipoCalculo === 'factorizacion' && (
              <NumberInput
                value={numeroPrimo}
                onChange={setNumeroPrimo}
                label="Número a factorizar"
                placeholder="360"
              />
            )}

            {tipoCalculo === 'mcdmcm' && (
              <>
                <NumberInput
                  value={numero1}
                  onChange={setNumero1}
                  label="Primer número"
                  placeholder="24"
                />
                <NumberInput
                  value={numero2}
                  onChange={setNumero2}
                  label="Segundo número"
                  placeholder="36"
                />
                <NumberInput
                  value={numero3}
                  onChange={setNumero3}
                  label="Tercer número (opcional)"
                  placeholder=""
                />
              </>
            )}

            {tipoCalculo === 'divisores' && (
              <NumberInput
                value={numeroPrimo}
                onChange={setNumeroPrimo}
                label="Número"
                placeholder="60"
              />
            )}

            {tipoCalculo === 'modular' && (
              <>
                <NumberInput
                  value={base}
                  onChange={setBase}
                  label="Base (a)"
                  placeholder="7"
                />
                <NumberInput
                  value={exponente}
                  onChange={setExponente}
                  label="Exponente (opcional)"
                  placeholder="100"
                  helperText="Para calcular a^n mod m"
                />
                <NumberInput
                  value={modulo}
                  onChange={setModulo}
                  label="Módulo (m)"
                  placeholder="13"
                />
              </>
            )}
          </div>
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔢</span>
              <p>Ingresa los valores para calcular</p>
            </div>
          ) : (
            <div className={styles.resultsGrid}>
              {resultados.tipo === 'verificacion' && (
                <>
                  <ResultCard
                    title={`${resultados.numero}`}
                    value={resultados.esPrimo ? '✓ Es Primo' : '✗ No es Primo'}
                    variant={resultados.esPrimo ? 'success' : 'warning'}
                    icon={resultados.esPrimo ? '✅' : '❌'}
                  />
                  {resultados.esPrimo && resultados.posicion && (
                    <ResultCard
                      title="Posición"
                      value={`${resultados.posicion}° primo`}
                      variant="info"
                      icon="📍"
                    />
                  )}
                  {resultados.anteriorPrimo && (
                    <ResultCard
                      title="Primo anterior"
                      value={resultados.anteriorPrimo.toString()}
                      variant="default"
                      icon="←"
                    />
                  )}
                  <ResultCard
                    title="Siguiente primo"
                    value={resultados.siguientePrimo.toString()}
                    variant="default"
                    icon="→"
                  />
                </>
              )}

              {resultados.tipo === 'rango' && (
                <>
                  <ResultCard
                    title="Primos encontrados"
                    value={resultados.cantidad.toString()}
                    variant="highlight"
                    icon="🔢"
                    description={`Entre ${resultados.inicio} y ${resultados.fin}`}
                  />
                  <div className={styles.primosLista}>
                    <h4>Lista de primos</h4>
                    <p className={styles.primos}>
                      {resultados.primos.slice(0, 100).join(', ')}
                      {resultados.primos.length > 100 ? '...' : ''}
                    </p>
                  </div>
                </>
              )}

              {resultados.tipo === 'factorizacion' && (
                <>
                  <div className={styles.factorizacionBox}>
                    <h3>{resultados.numero} =</h3>
                    <p className={styles.factorizacion}>{resultados.factorizacionStr}</p>
                  </div>
                  <ResultCard
                    title="Número de divisores"
                    value={resultados.numDivisores.toString()}
                    variant="info"
                    icon="÷"
                  />
                  <ResultCard
                    title="Suma de divisores"
                    value={formatNumber(resultados.sumaDivisores, 0)}
                    variant="default"
                    icon="Σ"
                  />
                  <ResultCard
                    title="Clasificación"
                    value={resultados.esPrimo ? 'Primo' : resultados.esPerfecto ? 'Perfecto' : 'Compuesto'}
                    variant={resultados.esPrimo ? 'success' : resultados.esPerfecto ? 'highlight' : 'default'}
                    icon={resultados.esPrimo ? '⭐' : resultados.esPerfecto ? '🌟' : '📦'}
                  />
                </>
              )}

              {resultados.tipo === 'mcdmcm' && (
                <>
                  <ResultCard
                    title="MCD"
                    value={formatNumber(resultados.mcd, 0)}
                    variant="highlight"
                    icon="÷"
                    description="Máximo Común Divisor"
                  />
                  <ResultCard
                    title="MCM"
                    value={formatNumber(resultados.mcm, 0)}
                    variant="highlight"
                    icon="×"
                    description="Mínimo Común Múltiplo"
                  />
                  <ResultCard
                    title="¿Son coprimos?"
                    value={resultados.sonCoprimos ? 'Sí' : 'No'}
                    variant={resultados.sonCoprimos ? 'success' : 'default'}
                    icon={resultados.sonCoprimos ? '✅' : '❌'}
                    description="MCD = 1"
                  />
                  {resultados.producto !== null && (
                    <ResultCard
                      title="a × b = MCD × MCM"
                      value={`${resultados.producto} = ${resultados.productoMcdMcm}`}
                      variant="info"
                      icon="="
                      description="Siempre se cumple"
                    />
                  )}
                </>
              )}

              {resultados.tipo === 'divisores' && (
                <>
                  <ResultCard
                    title="Cantidad de divisores"
                    value={resultados.cantidad.toString()}
                    variant="highlight"
                    icon="📊"
                  />
                  <ResultCard
                    title="Suma de divisores"
                    value={formatNumber(resultados.suma, 0)}
                    variant="info"
                    icon="Σ"
                  />
                  <ResultCard
                    title="Clasificación"
                    value={resultados.clasificacion}
                    variant={resultados.clasificacion === 'Perfecto' ? 'success' : 'default'}
                    icon={resultados.clasificacion === 'Perfecto' ? '⭐' : resultados.clasificacion === 'Abundante' ? '📈' : '📉'}
                    description={`σ(n)-n ${resultados.clasificacion === 'Perfecto' ? '=' : resultados.clasificacion === 'Abundante' ? '>' : '<'} n`}
                  />
                  <div className={styles.divisoresLista}>
                    <h4>Divisores de {resultados.numero}</h4>
                    <p className={styles.divisores}>
                      {resultados.divisores.join(', ')}
                    </p>
                    <h4>Pares complementarios</h4>
                    <p className={styles.pares}>
                      {resultados.pares.map(([a, b]) => `(${a}×${b})`).join(' ')}
                    </p>
                  </div>
                </>
              )}

              {resultados.tipo === 'modular' && (
                <>
                  <ResultCard
                    title={`${resultados.base} mod ${resultados.modulo}`}
                    value={resultados.residuo.toString()}
                    variant="highlight"
                    icon="mod"
                  />
                  {resultados.potenciaMod !== null && (
                    <ResultCard
                      title={`${resultados.base}^${resultados.exponente} mod ${resultados.modulo}`}
                      value={resultados.potenciaMod.toString()}
                      variant="highlight"
                      icon="^"
                      description="Exponenciación modular"
                    />
                  )}
                  <ResultCard
                    title={`φ(${resultados.modulo})`}
                    value={resultados.phi.toString()}
                    variant="info"
                    icon="φ"
                    description="Función de Euler"
                  />
                  <ResultCard
                    title="Inverso modular"
                    value={resultados.tieneInverso ? resultados.inverso!.toString() : 'No existe'}
                    variant={resultados.tieneInverso ? 'success' : 'warning'}
                    icon="⁻¹"
                    description={resultados.tieneInverso ? `${resultados.base}×${resultados.inverso} ≡ 1 (mod ${resultados.modulo})` : 'MCD ≠ 1'}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Teoría de Números?"
        subtitle="Descubre la belleza de los números enteros"
      >
        <section className={styles.guideSection}>
          <h2>Teoría de Números: Conceptos Fundamentales</h2>
          <p className={styles.introParagraph}>
            La teoría de números estudia las propiedades de los números enteros.
            Es una de las ramas más antiguas de las matemáticas y tiene aplicaciones
            fundamentales en criptografía moderna.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Números Primos</h4>
              <p>
                Un número mayor que 1 que solo es divisible por 1 y por sí mismo.
                Son los &quot;átomos&quot; de los números: todo entero se descompone
                en primos de forma única (Teorema Fundamental de la Aritmética).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>MCD y MCM</h4>
              <p>
                MCD: mayor número que divide a ambos. MCM: menor número divisible
                por ambos. Relación: MCD(a,b) × MCM(a,b) = a × b.
                Algoritmo de Euclides para calcular MCD.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Números Perfectos</h4>
              <p>
                Iguales a la suma de sus divisores propios. Ejemplos: 6 = 1+2+3,
                28 = 1+2+4+7+14. Relacionados con primos de Mersenne (2^p - 1).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Aritmética Modular</h4>
              <p>
                &quot;Matemáticas del reloj&quot;: a ≡ b (mod n) si n divide a (a-b).
                Base de RSA y criptografía. La función φ(n) de Euler cuenta
                coprimos menores que n.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-teoria-numeros')} />

      <Footer appName="calculadora-teoria-numeros" />
    </div>
  );
}
