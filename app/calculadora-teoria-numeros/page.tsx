'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './CalculadoraTeoriaNumeros.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  antiprimosHasta,
  analizarAntiprimo,
  LIMITE_EJEMPLOS,
  LIMITE_MAXIMO,
} from './motor-antiprimos';

type TipoCalculo = 'primos' | 'factorizacion' | 'mcdmcm' | 'divisores' | 'modular';

export default function CalculadoraTeoriaNumerosPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('primos');

  // Números primos
  const [numeroPrimo, setNumeroPrimo] = useState('');
  const [rangoInicio, setRangoInicio] = useState('');
  const [rangoFin, setRangoFin] = useState('');

  /**
   * Antiprimos: hasta dónde hay que cribar.
   *
   * Saber si un número es altamente compuesto exige conocer los divisores de TODOS los
   * anteriores, así que se criba un intervalo entero. Solo se hace en el modo Divisores, y
   * el tramo por defecto (100.000) cubre de sobra los ejemplos; solo si el usuario escribe
   * algo mayor se amplía, hasta el tope del motor. Al teclear un número largo los prefijos
   * caen todos dentro del tramo por defecto, de modo que la criba grande ocurre una vez y
   * no en cada pulsación.
   */
  const limiteAntiprimos = useMemo(() => {
    if (tipoCalculo !== 'divisores') return 0;
    const n = parseInt(numeroPrimo);
    if (!Number.isInteger(n) || n <= LIMITE_EJEMPLOS) return LIMITE_EJEMPLOS;
    return Math.min(n, LIMITE_MAXIMO);
  }, [tipoCalculo, numeroPrimo]);

  const antiprimos = useMemo(
    () => (limiteAntiprimos > 0 ? antiprimosHasta(limiteAntiprimos) : []),
    [limiteAntiprimos]
  );

  /** Los antiprimos que se ofrecen como ejemplo, del 6 al 5040 que cierra la serie clásica. */
  const ejemplosAntiprimos = useMemo(
    () => antiprimos.filter((a) => a.numero >= 6 && a.numero <= 5040),
    [antiprimos]
  );

  const analisisAntiprimo = useMemo(() => {
    if (tipoCalculo !== 'divisores') return null;
    const n = parseInt(numeroPrimo);
    if (!Number.isInteger(n)) return null;
    return analizarAntiprimo(n, antiprimos, limiteAntiprimos);
  }, [tipoCalculo, numeroPrimo, antiprimos, limiteAntiprimos]);

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
        <h1 className={styles.title}><span aria-hidden="true">🔢</span> Calculadora de Teoría de Números</h1>
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
                type="button"
                className={`${styles.tipoBtn} ${tipoCalculo === tipo.id ? styles.tipoActivo : ''}`}
                onClick={() => setTipoCalculo(tipo.id)}
                aria-pressed={tipoCalculo === tipo.id}
              >
                <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
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
              <>
                <NumberInput
                  value={numeroPrimo}
                  onChange={setNumeroPrimo}
                  label="Número"
                  placeholder="60"
                />
                <div className={styles.antiprimoEjemplos}>
                  <span className={styles.antiprimoEjemplosLabel}>
                    Antiprimos para probar (cada uno bate el récord de divisores de su época):
                  </span>
                  <div className={styles.antiprimoEjemplosBtns}>
                    {ejemplosAntiprimos.map((a) => (
                      <button
                        key={a.numero}
                        type="button"
                        className={styles.antiprimoBtn}
                        onClick={() => setNumeroPrimo(String(a.numero))}
                        aria-pressed={numeroPrimo === String(a.numero)}
                        title={`${formatNumber(a.numero, 0)} tiene ${a.divisores} divisores`}
                      >
                        {formatNumber(a.numero, 0)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
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
                    value={(resultados.siguientePrimo ?? 0).toString()}
                    variant="default"
                    icon="→"
                  />
                </>
              )}

              {resultados.tipo === 'rango' && (
                <>
                  <ResultCard
                    title="Primos encontrados"
                    value={(resultados.cantidad ?? 0).toString()}
                    variant="highlight"
                    icon="🔢"
                    description={`Entre ${resultados.inicio} y ${resultados.fin}`}
                  />
                  <div className={styles.primosLista}>
                    <h4>Lista de primos</h4>
                    <p className={styles.primos}>
                      {(resultados.primos ?? []).slice(0, 100).join(', ')}
                      {(resultados.primos ?? []).length > 100 ? '...' : ''}
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
                    value={(resultados.numDivisores ?? 0).toString()}
                    variant="info"
                    icon="÷"
                  />
                  <ResultCard
                    title="Suma de divisores"
                    value={formatNumber(resultados.sumaDivisores ?? 0, 0)}
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
                    value={formatNumber(resultados.mcd ?? 0, 0)}
                    variant="highlight"
                    icon="÷"
                    description="Máximo Común Divisor"
                  />
                  <ResultCard
                    title="MCM"
                    value={formatNumber(resultados.mcm ?? 0, 0)}
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
                    value={(resultados.cantidad ?? 0).toString()}
                    variant="highlight"
                    icon="📊"
                  />
                  <ResultCard
                    title="Suma de divisores"
                    value={formatNumber(resultados.suma ?? 0, 0)}
                    variant="info"
                    icon="Σ"
                  />
                  <ResultCard
                    title="Clasificación"
                    value={resultados.clasificacion ?? ''}
                    variant={resultados.clasificacion === 'Perfecto' ? 'success' : 'default'}
                    icon={resultados.clasificacion === 'Perfecto' ? '⭐' : resultados.clasificacion === 'Abundante' ? '📈' : '📉'}
                    description={`σ(n)-n ${resultados.clasificacion === 'Perfecto' ? '=' : resultados.clasificacion === 'Abundante' ? '>' : '<'} n`}
                  />
                  {analisisAntiprimo && (
                    <div
                      className={`${styles.antiprimoPanel} ${analisisAntiprimo.esAntiprimo ? styles.antiprimoPanelSi : ''}`}
                    >
                      <h4 className={styles.antiprimoTitulo}>
                        <span aria-hidden="true">{analisisAntiprimo.esAntiprimo ? '🏆' : '🔎'}</span>{' '}
                        {formatNumber(analisisAntiprimo.numero, 0)}{' '}
                        {analisisAntiprimo.esAntiprimo ? 'es un antiprimo' : 'no es un antiprimo'}
                      </h4>
                      <p className={styles.antiprimoTexto}>
                        {analisisAntiprimo.esAntiprimo ? (
                          <>
                            Tiene {analisisAntiprimo.divisores} divisores y ningún número menor
                            que él llega a esa cifra: es un récord. Por eso se le llama número
                            altamente compuesto.
                          </>
                        ) : (
                          <>
                            Tiene {analisisAntiprimo.divisores}{' '}
                            {analisisAntiprimo.divisores === 1 ? 'divisor' : 'divisores'}
                            {analisisAntiprimo.primeroConTantos &&
                            analisisAntiprimo.primeroConTantos.numero !== analisisAntiprimo.numero ? (
                              <>
                                , pero {formatNumber(analisisAntiprimo.primeroConTantos.numero, 0)} ya
                                llegaba a {analisisAntiprimo.primeroConTantos.divisores} siendo más
                                pequeño, así que no bate ningún récord.
                              </>
                            ) : (
                              <>, que no baten el récord de ningún número anterior.</>
                            )}
                          </>
                        )}
                      </p>
                      <p className={styles.antiprimoVecinos}>
                        {analisisAntiprimo.anterior && (
                          <>
                            Antiprimo anterior:{' '}
                            <button
                              type="button"
                              className={styles.antiprimoEnlace}
                              onClick={() => setNumeroPrimo(String(analisisAntiprimo.anterior!.numero))}
                              aria-label={`Analizar el antiprimo anterior, ${analisisAntiprimo.anterior.numero}`}
                            >
                              {formatNumber(analisisAntiprimo.anterior.numero, 0)}
                            </button>{' '}
                            ({analisisAntiprimo.anterior.divisores} divisores).{' '}
                          </>
                        )}
                        {analisisAntiprimo.siguiente ? (
                          <>
                            Siguiente:{' '}
                            <button
                              type="button"
                              className={styles.antiprimoEnlace}
                              onClick={() => setNumeroPrimo(String(analisisAntiprimo.siguiente!.numero))}
                              aria-label={`Analizar el antiprimo siguiente, ${analisisAntiprimo.siguiente.numero}`}
                            >
                              {formatNumber(analisisAntiprimo.siguiente.numero, 0)}
                            </button>{' '}
                            ({analisisAntiprimo.siguiente.divisores} divisores).
                          </>
                        ) : (
                          <>
                            El siguiente queda por encima de{' '}
                            {formatNumber(analisisAntiprimo.limiteExplorado, 0)}, que es hasta donde
                            se ha comprobado.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                  {!analisisAntiprimo && (resultados.numero ?? 0) > LIMITE_MAXIMO && (
                    <div className={styles.antiprimoPanel}>
                      <p className={styles.antiprimoTexto}>
                        Los divisores de este número sí se calculan, pero no si es un antiprimo:
                        para eso hay que contar los divisores de todos los números menores, y por
                        encima de {formatNumber(LIMITE_MAXIMO, 0)} la comprobación tardaría más de
                        lo que vale.
                      </p>
                    </div>
                  )}
                  <div className={styles.divisoresLista}>
                    <h4>Divisores de {resultados.numero}</h4>
                    <p className={styles.divisores}>
                      {(resultados.divisores ?? []).join(', ')}
                    </p>
                    <h4>Pares complementarios</h4>
                    <p className={styles.pares}>
                      {(resultados.pares ?? []).map(([a, b]) => `(${a}×${b})`).join(' ')}
                    </p>
                  </div>
                </>
              )}

              {resultados.tipo === 'modular' && (
                <>
                  <ResultCard
                    title={`${resultados.base} mod ${resultados.modulo}`}
                    value={(resultados.residuo ?? 0).toString()}
                    variant="highlight"
                    icon="mod"
                  />
                  {resultados.potenciaMod !== null && (
                    <ResultCard
                      title={`${resultados.base}^${resultados.exponente} mod ${resultados.modulo}`}
                      value={(resultados.potenciaMod ?? 0).toString()}
                      variant="highlight"
                      icon="^"
                      description="Exponenciación modular"
                    />
                  )}
                  <ResultCard
                    title={`φ(${resultados.modulo})`}
                    value={(resultados.phi ?? 0).toString()}
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
        title="¿Quieres aprender más sobre Teoría de Números?"
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
              <h4>Antiprimos</h4>
              <p>
                Lo contrario de un primo: en vez de tener los divisores justos, tiene más
                que cualquier número menor que él. 12 tiene 6 divisores y ninguno de los
                once anteriores llega a 6. Siguen 24, 36, 48, 60, 120… hasta el infinito.
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

        {/* Antiprimos (números altamente compuestos) */}
        <section className={styles.guideSection}>
          <h2>Antiprimos: los números con más divisores que ningún otro antes que ellos</h2>
          <p className={styles.introParagraph}>
            Un número es <strong>altamente compuesto</strong> —«antiprimo» en su nombre
            divulgativo— cuando tiene más divisores que <em>cualquier</em> número menor que él.
            El primo es el número con los divisores justos, dos; el antiprimo es el que bate el
            récord contrario. Ramanujan los estudió sistemáticamente en 1915, en el artículo
            donde acuñó el término <em>highly composite number</em>, y la serie no se acaba
            nunca: siempre hay un número con más divisores que todos los anteriores.
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Antiprimo</th>
                  <th>Factorización</th>
                  <th>Divisores</th>
                  <th>Qué récord bate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>6</td>
                  <td>2 × 3</td>
                  <td>4</td>
                  <td>El primero con 4 divisores</td>
                </tr>
                <tr>
                  <td>12</td>
                  <td>2² × 3</td>
                  <td>6</td>
                  <td>El primero con 6, y por eso la docena</td>
                </tr>
                <tr>
                  <td>24</td>
                  <td>2³ × 3</td>
                  <td>8</td>
                  <td>El primero con 8: las horas del día</td>
                </tr>
                <tr>
                  <td>36</td>
                  <td>2² × 3²</td>
                  <td>9</td>
                  <td>El primero con 9</td>
                </tr>
                <tr>
                  <td>60</td>
                  <td>2² × 3 × 5</td>
                  <td>12</td>
                  <td>El primero con 12: minutos y segundos</td>
                </tr>
                <tr>
                  <td>360</td>
                  <td>2³ × 3² × 5</td>
                  <td>24</td>
                  <td>El primero con 24: los grados del círculo</td>
                </tr>
                <tr>
                  <td>2520</td>
                  <td>2³ × 3² × 5 × 7</td>
                  <td>48</td>
                  <td>El menor divisible por todo del 1 al 10</td>
                </tr>
                <tr>
                  <td>5040</td>
                  <td>2⁴ × 3² × 5 × 7</td>
                  <td>60</td>
                  <td>El primero con 60 divisores</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Dónde te los encuentras sin saberlo</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🕐</span>
              <h4>60 minutos, 60 segundos</h4>
              <p>
                La hora no se parte en 100 sino en 60, que admite 12 formas de repartirse:
                media hora, un tercio, un cuarto, un quinto, un sexto, diez minutos, un
                cuarto de hora… Con 100 minutos, el tercio de hora no existiría. El sistema
                sexagesimal viene de Babilonia y la explicación que más se repite es
                justamente esa comodidad para dividir, aunque los historiadores discuten
                cuánto pesó frente a otras razones de su forma de contar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>360 grados</h4>
              <p>
                Con 24 divisores, el círculo se parte en mitades, tercios, cuartos, quintos,
                sextos, octavos, novenos, décimos, doceavos… todos con grados enteros. Un
                círculo de 100 grados solo admitiría mitades, cuartos, quintos y décimos: se
                acabaron los 120° del triángulo equilátero.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥚</span>
              <h4>La docena y las 24 horas</h4>
              <p>
                12 tiene 6 divisores frente a los 4 del 10. Una docena de huevos se reparte
                entre 2, 3, 4 o 6 personas sin partir ninguno; diez, solo entre 2 y 5. Lo
                mismo explica los 12 meses, las 24 horas y que las cajas de la industria
                vengan en 12, 24 o 36 unidades y no en 10, 20 o 30.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🏛️</span>
              <h4>Los 5040 vecinos de Platón</h4>
              <p>
                En <em>Las Leyes</em> (libro V), Platón propone que su ciudad ideal tenga
                exactamente 5040 hogares, y da la razón: admite muchísimas divisiones para
                repartir tierras, turnos e impuestos. Es divisible por todos los números del
                1 al 10 y tiene 60 divisores en total. Un antiprimo elegido a propósito
                veintitrés siglos antes de que tuvieran nombre.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👥</span>
              <h4>Repartir un grupo</h4>
              <p>
                Una clase de 24 se organiza en parejas, tríos, grupos de 4, de 6, de 8 o de
                12 sin que sobre nadie. Una de 23 solo admite un grupo entero: 23 es primo.
                Por eso los aforos, los equipos y los torneos tienden a números como 12, 16,
                24 o 32.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎵</span>
              <h4>Compases y ritmo</h4>
              <p>
                El compás de 12/8 se subdivide en 2, 3, 4 o 6 pulsos, y de ahí que sostenga
                a la vez el blues, la seguiriya y la nana. Un compás de 11 tiempos no se
                deja partir: existe, pero suena a rompecabezas a propósito.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h4>Tener muchos divisores no basta: hay que batir el récord</h4>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>40 no es antiprimo.</strong> Tiene 8 divisores, que no están mal, pero
                24 ya llegaba a 8 siendo mucho más pequeño. El récord ya estaba puesto.
              </li>
              <li>
                <strong>100 tampoco.</strong> Tiene 9 divisores, exactamente los mismos que 36.
                Empatar no cuenta: hace falta superar a todos los anteriores.
              </li>
              <li>
                <strong>96 tampoco</strong>, pese a sus 12 divisores, porque 60 ya tenía 12.
                Prueba estos tres números arriba y verás la explicación en cada caso.
              </li>
              <li>
                <strong>No son «lo contrario» de los primos en sentido estricto.</strong> El
                nombre es divulgativo y funciona como imagen, pero un número puede no ser ni
                primo ni antiprimo: la inmensa mayoría, de hecho, no es ninguna de las dos cosas.
              </li>
            </ul>
          </div>
        </section>

        {/* Sección 1: Tabla Comparativa de Conjuntos Numéricos */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa: Conjuntos Numéricos</h2>
          <p className={styles.introParagraph}>
            Los números se organizan en conjuntos anidados: cada conjunto amplía al anterior añadiendo nuevos elementos.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Conjunto</th>
                  <th>Qué incluye</th>
                  <th>Ejemplos</th>
                  <th>Op. cerradas</th>
                  <th>Aplicación típica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Naturales (ℕ)</strong></td>
                  <td>Enteros positivos desde 1 (o 0 según convenio)</td>
                  <td>1, 2, 3, 97, 1000</td>
                  <td>+, ×</td>
                  <td>Contar elementos, índices de arrays</td>
                </tr>
                <tr>
                  <td><strong>Enteros (ℤ)</strong></td>
                  <td>Naturales + cero + negativos</td>
                  <td>−5, 0, 7, −1000</td>
                  <td>+, −, ×</td>
                  <td>Temperaturas, deudas, posiciones relativas</td>
                </tr>
                <tr>
                  <td><strong>Racionales (ℚ)</strong></td>
                  <td>Fracciones p/q con q ≠ 0</td>
                  <td>1/2, −3/4, 0,333…</td>
                  <td>+, −, ×, ÷</td>
                  <td>Proporciones, probabilidades, tipos de interés</td>
                </tr>
                <tr>
                  <td><strong>Irracionales (ℝ\ℚ)</strong></td>
                  <td>Decimales infinitos no periódicos</td>
                  <td>√2 ≈ 1,414…, π ≈ 3,14159…, φ ≈ 1,618…</td>
                  <td>+, −, ×, ÷ (resultado puede ser racional)</td>
                  <td>Geometría, trigonometría, diseño áureo</td>
                </tr>
                <tr>
                  <td><strong>Reales (ℝ)</strong></td>
                  <td>Racionales + irracionales; toda la recta numérica</td>
                  <td>−7, 0, 2/3, π, e, √5</td>
                  <td>+, −, ×, ÷</td>
                  <td>Física, estadística, cálculo diferencial</td>
                </tr>
                <tr>
                  <td><strong>Complejos (ℂ)</strong></td>
                  <td>Reales + parte imaginaria (a + bi, i² = −1)</td>
                  <td>3 + 2i, −i, 0 + 5i</td>
                  <td>+, −, ×, ÷</td>
                  <td>Ingeniería eléctrica, señales AC, mecánica cuántica</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso: ¿Quién usa la Teoría de Números?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h4>Estudiante de ESO/Bachillerato</h4>
              </div>
              <p><strong>Situación:</strong> Estudia conjuntos numéricos para el examen de 4.º ESO.</p>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Clasificar √2 (irracional), 3/7 (racional), −5 (entero), π (trascendente).
                Usar la calculadora para verificar si 97 es primo antes del examen.
              </p>
              <p className={styles.escenarioTip}>
                Tip: repasa que ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ — cada conjunto contiene al anterior.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>💻</span>
                <h4>Programador — Criptografía RSA</h4>
              </div>
              <p><strong>Situación:</strong> Implementa RSA-2048 para cifrar comunicaciones.</p>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> RSA elige dos primos p y q de ~1.024 bits cada uno.
                Su producto n = p×q (2.048 bits) forma la clave pública. La seguridad depende
                de que factorizar n sea computacionalmente inviable.
              </p>
              <p className={styles.escenarioTip}>
                Tip: usa la aritmética modular para calcular d×e ≡ 1 (mod φ(n)) — la clave privada.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔬</span>
                <h4>Matemático — Congruencias Modulares</h4>
              </div>
              <p><strong>Situación:</strong> Estudia el Teorema Chino del Resto para sistemas de congruencias.</p>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Resolver x ≡ 2 (mod 3) y x ≡ 3 (mod 5).
                Por TCR, como MCD(3,5)=1, existe solución única módulo 15: x = 8.
                Verificar: 8 mod 3 = 2 ✓, 8 mod 5 = 3 ✓.
              </p>
              <p className={styles.escenarioTip}>
                Tip: el TCR funciona solo si los módulos son coprimos dos a dos (MCD = 1).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚡</span>
                <h4>Ingeniero — Circuitos AC</h4>
              </div>
              <p><strong>Situación:</strong> Analiza impedancias en circuitos de corriente alterna.</p>
              <p className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> La impedancia Z = R + jX donde j es la unidad imaginaria
                (j² = −1). Un circuito RLC tiene Z = 50 + j·30 Ω. El módulo |Z| = √(50² + 30²) ≈ 58,3 Ω
                determina la corriente máxima.
              </p>
              <p className={styles.escenarioTip}>
                Tip: los números complejos en forma polar (|Z|∠θ) simplifican la multiplicación de impedancias.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Teoría de Números</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué es un número primo y cómo se comprueba?</h4>
              <p>
                Un número primo es un entero mayor que 1 cuyo únicos divisores son 1 y él mismo.
                Para verificar si n es primo, basta dividirlo por todos los enteros de 2 hasta √n:
                si ninguno divide exactamente, es primo. Por ejemplo, 97 es primo porque no es divisible
                por 2, 3, 5, 7 (los únicos primos ≤ √97 ≈ 9,8).
              </p>
              <p className={styles.faqTip}>Primeros 15 primos: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuántos números primos hay?</h4>
              <p>
                Infinitos. Euclides lo demostró hacia el año 300 a.C. mediante reducción al absurdo:
                si existiera un primo máximo, el producto de todos los primos más 1 sería divisible
                por un primo no incluido en la lista, contradicción. El teorema de los números primos
                establece que la cantidad de primos menores que n es aproximadamente n / ln(n).
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el Teorema Fundamental de la Aritmética?</h4>
              <p>
                Todo entero mayor que 1 se puede expresar como producto de números primos de forma
                única (salvo el orden). Por ejemplo, 360 = 2³ × 3² × 5. Esta unicidad hace a los primos
                los &quot;bloques de construcción&quot; de los enteros y es la base de la factorización
                usada en criptografía.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Para qué sirven los números primos en criptografía?</h4>
              <p>
                RSA, el algoritmo más usado en internet (HTTPS, SSH, PGP), basa su seguridad en la
                dificultad de factorizar el producto de dos primos grandes. Dado n = p × q con p y q
                primos de 1.024 bits cada uno, factorizar n requiere miles de años con los mejores
                algoritmos actuales, aunque multiplicar p × q lleva microsegundos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es la aritmética modular?</h4>
              <p>
                Sistema donde los números &quot;dan la vuelta&quot; al llegar a un módulo m, como las horas
                en un reloj de 12h. Se escribe a ≡ b (mod m) si m divide a (a − b). Aplicaciones:
                criptografía (RSA, AES), códigos ISBN/IBAN (dígitos de control), calendarios
                (día de la semana de cualquier fecha) y teoría de juegos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Diferencia entre número irracional y trascendente?</h4>
              <p>
                Todo trascendente es irracional, pero no al revés. Un número irracional no se puede
                expresar como p/q (ej: √2). Un número trascendente además no es raíz de ningún
                polinomio con coeficientes enteros (ej: π, e). √2 es irracional pero algebraico
                (raíz de x² − 2 = 0). π y e son trascendentes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué es el número de oro (φ)?</h4>
              <p>
                φ = (1 + √5) / 2 ≈ 1,6180339887… Es la solución positiva de x² = x + 1. Aparece
                en la sucesión de Fibonacci (el cociente de términos consecutivos tiende a φ), en
                proporciones estéticas del arte y arquitectura, en la espiral de las conchas y en
                la distribución de hojas (filotaxia). 1/φ = φ − 1 ≈ 0,618.
              </p>
              <p className={styles.faqTip}>φ ≈ 1,618 — razón áurea presente en el Partenón, obras de Da Vinci y en la naturaleza.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo funciona el test de primalidad de Miller-Rabin?</h4>
              <p>
                Es un test probabilístico que determina si n es probablemente primo en tiempo
                O(k · log²n), donde k es el número de rondas. Escribe n − 1 = 2ˢ · d, elige
                una base a aleatoria y comprueba si aᵈ ≡ 1 (mod n) o a²ʳᵈ ≡ −1 (mod n) para
                algún r. Con k = 40 rondas, la probabilidad de error es menor que 4⁻⁴⁰ ≈ 10⁻²⁴.
                OpenSSL usa este test para generar claves RSA.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Guía Paso a Paso: Factorizar un Número y Verificar si es Primo</h2>
          <p className={styles.introParagraph}>
            Aprende a factorizar cualquier entero positivo usando la criba de Eratóstenes
            y el método de división por prueba.
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Construye la criba de Eratóstenes hasta √n</strong>
                <p>
                  Para factorizar n, solo necesitas los primos hasta √n. Ejemplo: para n = 360,
                  √360 ≈ 18,9, así que necesitas los primos hasta 18: {'{'}2, 3, 5, 7, 11, 13, 17{'}'}.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Divide por 2 todas las veces posibles</strong>
                <p>
                  360 ÷ 2 = 180, 180 ÷ 2 = 90, 90 ÷ 2 = 45. Ya no es divisible por 2.
                  Anotamos el factor 2³.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Divide por el siguiente primo (3)</strong>
                <p>
                  45 ÷ 3 = 15, 15 ÷ 3 = 5. Ya no es divisible por 3. Anotamos 3².
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Continúa con 5, 7, 11…</strong>
                <p>
                  5 ÷ 5 = 1. El cociente es 1, hemos terminado. Anotamos 5¹.
                  Resultado: 360 = 2³ × 3² × 5.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Verifica la factorización</strong>
                <p>
                  2³ × 3² × 5 = 8 × 9 × 5 = 8 × 45 = 360. ✓
                  El número de divisores es (3+1)(2+1)(1+1) = 4 × 3 × 2 = 24 divisores.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Para verificar si es primo: ¿el cociente final es mayor que 1?</strong>
                <p>
                  Si tras dividir por todos los primos hasta √n el cociente restante es mayor que 1,
                  ese cociente es un factor primo. Si desde el inicio ningún primo hasta √n divide a n,
                  entonces n es primo. Ejemplo: para 97, ningún primo hasta 9 (2, 3, 5, 7) divide a 97,
                  así que 97 es primo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Aplica la criba de Eratóstenes para listar primos en un rango</strong>
                <p>
                  Crea un array de booleanos de tamaño n+1 inicializado a verdadero. Marca como falso
                  los múltiplos de cada primo p comenzando desde p². Al terminar, los índices que siguen
                  siendo verdaderos son primos. Para el rango 1–50 obtienes:
                  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47 (15 primos).
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas al Trabajar con Teoría de Números</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⚡</span>
              <h4>Solo divide hasta √n para verificar primalidad</h4>
              <p>
                Si n tiene un divisor d {'>'} √n, entonces n/d {'<'} √n ya fue encontrado antes.
                Esto reduce la complejidad de O(n) a O(√n) — para n = 10⁹, de 10⁹ a solo ~31.623 iteraciones.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <h4>Usa criterios de divisibilidad antes de dividir</h4>
              <p>
                Descarta candidatos rápidamente: divisible por 2 si termina en par, por 3 si la
                suma de dígitos es múltiplo de 3, por 5 si termina en 0 o 5, por 7 aplica la
                regla de los 2 últimos dígitos. Esto evita cálculos costosos.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <h4>Usa el Teorema Chino del Resto para congruencias</h4>
              <p>
                Si tienes un sistema de congruencias con módulos coprimos, el TCR garantiza
                solución única módulo el producto de los módulos. Útil para reducir cálculos:
                trabajar módulo 3 y 5 por separado y combinar en módulo 15.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🛡️</span>
              <h4>Usa exponenciación modular rápida para criptografía</h4>
              <p>
                Calcular aⁿ mod m directamente desborda. La exponenciación binaria descompone
                el exponente en potencias de 2 y aplica mod en cada paso: complejidad O(log n)
                en lugar de O(n). Esencial para RSA con exponentes de 2.048 bits.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📐</span>
              <h4>El algoritmo de Euclides es la forma más rápida de calcular el MCD</h4>
              <p>
                MCD(a, b) = MCD(b, a mod b), con caso base MCD(a, 0) = a.
                Ejemplo: MCD(252, 105) → MCD(105, 42) → MCD(42, 21) → MCD(21, 0) = 21.
                Solo 4 pasos frente a listar todos los divisores.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏗️</span>
              <h4>Usa la criba segmentada para rangos de primos grandes</h4>
              <p>
                La criba de Eratóstenes clásica requiere O(n) memoria. La criba segmentada
                divide el rango en bloques del tamaño de la caché L1 (~32 KB), calculando
                cada bloque independientemente. Permite encontrar primos hasta 10¹² con
                memoria constante.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box — Errores Comunes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Comunes en Teoría de Números</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir primo con impar.</strong> No todo número impar es primo (ej: 9 = 3×3,
                15 = 3×5, 25 = 5×5). Y el único primo par es 2. Verificar siempre dividiendo hasta √n.
              </li>
              <li>
                <strong>Olvidar que 1 no es primo.</strong> El 1 no cumple la definición: un primo
                necesita exactamente dos divisores distintos (1 y él mismo). El 1 solo tiene un divisor.
                Esta exclusión preserva la unicidad del Teorema Fundamental de la Aritmética.
              </li>
              <li>
                <strong>Errores en criterios de divisibilidad.</strong> El criterio del 3 comprueba
                la suma de dígitos, no el último dígito. El criterio del 9 también usa la suma de dígitos
                (debe ser múltiplo de 9). El del 11 alterna suma y resta de dígitos. Confundirlos
                genera falsos positivos/negativos.
              </li>
              <li>
                <strong>Confundir número irracional con número &quot;muy grande&quot;.</strong>
                Los irracionales no son números enormes — son números cuya representación decimal es
                infinita y no periódica. √2 ≈ 1,41421… es irracional pero menor que 2. Un millón
                (1.000.000) es perfectamente racional (= 10⁶/1).
              </li>
              <li>
                <strong>No tener en cuenta el límite de los enteros de 32/64 bits.</strong>
                En programación, un int de 32 bits solo llega hasta 2.147.483.647 (≈ 2,1 × 10⁹).
                Para primos RSA de 2.048 bits hacen falta bibliotecas de aritmética de precisión
                arbitraria (BigInt en JavaScript, Python nativo, Java BigInteger).
              </li>
              <li>
                <strong>Asumir que MCD(a, b) siempre es menor que ambos.</strong> Si a divide a b,
                entonces MCD(a, b) = a — igual al menor. Y MCD(n, n) = n. Nunca asumir que el MCD
                es estrictamente menor que los dos valores de entrada sin verificarlo.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-teoria-numeros')} />

      <ShareCard appName="calculadora-teoria-numeros" />
      <Footer appName="calculadora-teoria-numeros" />
    </div>
  );
}
