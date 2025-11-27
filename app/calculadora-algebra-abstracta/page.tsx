'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraAlgebraAbstracta.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';

type TipoCalculo = 'grupos' | 'anillos' | 'cayley' | 'propiedades';

export default function CalculadoraAlgebraAbstractaPage() {
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('grupos');

  // Grupo Zn
  const [moduloGrupo, setModuloGrupo] = useState('');
  const [elementoA, setElementoA] = useState('');
  const [elementoB, setElementoB] = useState('');
  const [operacion, setOperacion] = useState<'+' | '*'>('+');

  // Tabla de Cayley
  const [nCayley, setNCayley] = useState('5');

  // Funciones auxiliares
  const mod = (a: number, n: number): number => ((a % n) + n) % n;

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

  // Encontrar inverso multiplicativo usando algoritmo de Euclides extendido
  const inversoMultiplicativo = (a: number, n: number): number | null => {
    if (mcd(a, n) !== 1) return null;

    let [old_r, r] = [a, n];
    let [old_s, s] = [1, 0];

    while (r !== 0) {
      const quotient = Math.floor(old_r / r);
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
    }

    return mod(old_s, n);
  };

  // Encontrar orden de un elemento
  const ordenElemento = (a: number, n: number, op: '+' | '*'): number => {
    if (op === '+') {
      // Orden aditivo: menor k tal que k*a ≡ 0 (mod n)
      if (a === 0) return 1;
      return n / mcd(a, n);
    } else {
      // Orden multiplicativo: menor k tal que a^k ≡ 1 (mod n)
      if (mcd(a, n) !== 1) return -1; // No tiene orden
      let result = 1;
      let power = a;
      while (power !== 1) {
        power = mod(power * a, n);
        result++;
        if (result > n) return -1;
      }
      return result;
    }
  };

  // Función de Euler
  const euler = (n: number): number => {
    let result = n;
    for (let p = 2; p * p <= n; p++) {
      if (n % p === 0) {
        while (n % p === 0) n /= p;
        result -= result / p;
      }
    }
    if (n > 1) result -= result / n;
    return result;
  };

  // Generar unidades de Zn
  const unidadesZn = (n: number): number[] => {
    const unidades: number[] = [];
    for (let i = 1; i < n; i++) {
      if (mcd(i, n) === 1) unidades.push(i);
    }
    return unidades;
  };

  // Verificar si un número es generador del grupo
  const esGenerador = (a: number, n: number, op: '+' | '*'): boolean => {
    const orden = ordenElemento(a, n, op);
    if (op === '+') {
      return orden === n;
    } else {
      return orden === euler(n);
    }
  };

  const resultados = useMemo(() => {
    const n = parseInt(moduloGrupo);
    const a = parseInt(elementoA);
    const b = parseInt(elementoB);

    switch (tipoCalculo) {
      case 'grupos': {
        if (isNaN(n) || n < 2) return null;

        const unidades = unidadesZn(n);
        const phi = euler(n);

        // Generadores de (Zn, +)
        const generadoresAditivos = [];
        for (let i = 1; i < n; i++) {
          if (esGenerador(i, n, '+')) generadoresAditivos.push(i);
        }

        // Generadores de (Zn*, *)
        const generadoresMultiplicativos = unidades.filter(u => esGenerador(u, n, '*'));

        return {
          tipo: 'grupo',
          modulo: n,
          ordenGrupoAditivo: n,
          ordenGrupoMultiplicativo: phi,
          unidades,
          generadoresAditivos,
          generadoresMultiplicativos,
          esCiclico: generadoresMultiplicativos.length > 0
        };
      }

      case 'anillos': {
        if (isNaN(n) || n < 2 || isNaN(a)) return null;

        const amod = mod(a, n);

        // Operaciones con a
        const inversoAditivo = mod(-a, n);
        const inversoMult = inversoMultiplicativo(amod, n);
        const orden = ordenElemento(amod, n, operacion);

        // Si hay b, calcular operación
        let resultado = null;
        if (!isNaN(b)) {
          const bmod = mod(b, n);
          if (operacion === '+') {
            resultado = mod(amod + bmod, n);
          } else {
            resultado = mod(amod * bmod, n);
          }
        }

        // Potencias de a
        const potencias: number[] = [];
        let pot = 1;
        for (let i = 0; i < Math.min(n, 10); i++) {
          potencias.push(pot);
          pot = mod(pot * amod, n);
        }

        return {
          tipo: 'anillo',
          modulo: n,
          elemento: amod,
          inversoAditivo,
          inversoMultiplicativo: inversoMult,
          orden,
          esUnidad: inversoMult !== null,
          esGeneradorAditivo: esGenerador(amod, n, '+'),
          esGeneradorMultiplicativo: inversoMult !== null && esGenerador(amod, n, '*'),
          resultado,
          potencias
        };
      }

      case 'cayley': {
        const nc = parseInt(nCayley);
        if (isNaN(nc) || nc < 2 || nc > 12) return null;

        // Tabla de suma
        const tablaSuma: number[][] = [];
        for (let i = 0; i < nc; i++) {
          const fila: number[] = [];
          for (let j = 0; j < nc; j++) {
            fila.push(mod(i + j, nc));
          }
          tablaSuma.push(fila);
        }

        // Tabla de multiplicación
        const tablaMult: number[][] = [];
        for (let i = 0; i < nc; i++) {
          const fila: number[] = [];
          for (let j = 0; j < nc; j++) {
            fila.push(mod(i * j, nc));
          }
          tablaMult.push(fila);
        }

        return {
          tipo: 'cayley',
          modulo: nc,
          tablaSuma,
          tablaMult
        };
      }

      case 'propiedades': {
        if (isNaN(n) || n < 2) return null;

        // Verificar propiedades del anillo Zn
        const unidades = unidadesZn(n);
        const phi = euler(n);

        // Es dominio de integridad si n es primo
        const esPrimo = (num: number): boolean => {
          if (num < 2) return false;
          for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) return false;
          }
          return true;
        };

        const primo = esPrimo(n);

        // Divisores de cero
        const divisoresCero: number[] = [];
        for (let i = 1; i < n; i++) {
          for (let j = i; j < n; j++) {
            if (mod(i * j, n) === 0 && i !== 0 && j !== 0) {
              if (!divisoresCero.includes(i)) divisoresCero.push(i);
              if (!divisoresCero.includes(j)) divisoresCero.push(j);
            }
          }
        }

        // Elementos nilpotentes (a^k = 0 para algún k)
        const nilpotentes: number[] = [];
        for (let i = 1; i < n; i++) {
          let pot = i;
          for (let k = 1; k <= n; k++) {
            pot = mod(pot * i, n);
            if (pot === 0) {
              nilpotentes.push(i);
              break;
            }
          }
        }

        // Elementos idempotentes (a² = a)
        const idempotentes: number[] = [];
        for (let i = 0; i < n; i++) {
          if (mod(i * i, n) === i) {
            idempotentes.push(i);
          }
        }

        return {
          tipo: 'propiedades',
          modulo: n,
          esPrimo: primo,
          esCuerpo: primo, // Zn es cuerpo ⟺ n es primo
          esDominioIntegridad: primo,
          phi,
          numUnidades: phi,
          unidades,
          divisoresCero,
          nilpotentes,
          idempotentes,
          caracteristica: n
        };
      }

      default:
        return null;
    }
  }, [tipoCalculo, moduloGrupo, elementoA, elementoB, operacion, nCayley]);

  const tipos: { id: TipoCalculo; nombre: string; icono: string }[] = [
    { id: 'grupos', nombre: 'Grupos Zn', icono: 'G' },
    { id: 'anillos', nombre: 'Anillos', icono: 'R' },
    { id: 'cayley', nombre: 'Tabla Cayley', icono: '⊕' },
    { id: 'propiedades', nombre: 'Propiedades', icono: '📋' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔷 Calculadora de Álgebra Abstracta</h1>
        <p className={styles.subtitle}>
          Grupos, anillos, cuerpos y estructuras algebraicas en Zn
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Análisis</h2>

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
            {(tipoCalculo === 'grupos' || tipoCalculo === 'propiedades') && (
              <NumberInput
                value={moduloGrupo}
                onChange={setModuloGrupo}
                label="Módulo n"
                placeholder="12"
                helperText="Grupo Zn"
              />
            )}

            {tipoCalculo === 'anillos' && (
              <>
                <NumberInput
                  value={moduloGrupo}
                  onChange={setModuloGrupo}
                  label="Módulo n"
                  placeholder="12"
                />
                <NumberInput
                  value={elementoA}
                  onChange={setElementoA}
                  label="Elemento a"
                  placeholder="7"
                />
                <NumberInput
                  value={elementoB}
                  onChange={setElementoB}
                  label="Elemento b (opcional)"
                  placeholder="5"
                  helperText="Para calcular a ⊕ b o a ⊗ b"
                />
                <div className={styles.operacionSelector}>
                  <button
                    className={`${styles.opBtn} ${operacion === '+' ? styles.opActivo : ''}`}
                    onClick={() => setOperacion('+')}
                  >
                    Suma (+)
                  </button>
                  <button
                    className={`${styles.opBtn} ${operacion === '*' ? styles.opActivo : ''}`}
                    onClick={() => setOperacion('*')}
                  >
                    Producto (×)
                  </button>
                </div>
              </>
            )}

            {tipoCalculo === 'cayley' && (
              <NumberInput
                value={nCayley}
                onChange={setNCayley}
                label="Módulo n (máx 12)"
                placeholder="5"
                helperText="Tablas de Cayley para Zn"
              />
            )}
          </div>
        </div>

        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {!resultados ? (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔷</span>
              <p>Ingresa los valores para analizar</p>
            </div>
          ) : (
            <>
              {resultados.tipo === 'grupo' && (
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title={`(Z${resultados.modulo}, +)`}
                    value={`Orden: ${resultados.ordenGrupoAditivo}`}
                    variant="highlight"
                    icon="+"
                    description="Grupo aditivo"
                  />
                  <ResultCard
                    title={`(Z${resultados.modulo}*, ×)`}
                    value={`Orden: ${resultados.ordenGrupoMultiplicativo}`}
                    variant="highlight"
                    icon="×"
                    description="Grupo multiplicativo de unidades"
                  />
                  <ResultCard
                    title="φ(n)"
                    value={resultados.ordenGrupoMultiplicativo.toString()}
                    variant="info"
                    icon="φ"
                    description="Función de Euler"
                  />
                  <ResultCard
                    title="¿Es cíclico?"
                    value={resultados.esCiclico ? 'Sí' : 'No'}
                    variant={resultados.esCiclico ? 'success' : 'default'}
                    icon={resultados.esCiclico ? '✅' : '❌'}
                  />

                  <div className={styles.listaElementos}>
                    <h4>Unidades (invertibles)</h4>
                    <p className={styles.elementos}>
                      {resultados.unidades.join(', ')}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Generadores de (Zn, +)</h4>
                    <p className={styles.elementos}>
                      {resultados.generadoresAditivos.join(', ') || 'Ninguno'}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Generadores de (Zn*, ×)</h4>
                    <p className={styles.elementos}>
                      {resultados.generadoresMultiplicativos.join(', ') || 'Ninguno'}
                    </p>
                  </div>
                </div>
              )}

              {resultados.tipo === 'anillo' && (
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title={`[${resultados.elemento}] en Z${resultados.modulo}`}
                    value={resultados.elemento.toString()}
                    variant="highlight"
                    icon="a"
                  />
                  <ResultCard
                    title="Inverso aditivo (-a)"
                    value={resultados.inversoAditivo.toString()}
                    variant="info"
                    icon="-"
                  />
                  <ResultCard
                    title="Inverso multiplicativo (a⁻¹)"
                    value={resultados.inversoMultiplicativo !== null ? resultados.inversoMultiplicativo.toString() : 'No existe'}
                    variant={resultados.inversoMultiplicativo !== null ? 'success' : 'warning'}
                    icon="⁻¹"
                  />
                  <ResultCard
                    title={`Orden (${operacion === '+' ? 'aditivo' : 'multiplicativo'})`}
                    value={resultados.orden > 0 ? resultados.orden.toString() : 'N/A'}
                    variant="default"
                    icon="ord"
                  />
                  <ResultCard
                    title="¿Es unidad?"
                    value={resultados.esUnidad ? 'Sí' : 'No'}
                    variant={resultados.esUnidad ? 'success' : 'default'}
                    icon={resultados.esUnidad ? '✅' : '❌'}
                  />
                  {resultados.resultado !== null && (
                    <ResultCard
                      title={`a ${operacion} b`}
                      value={resultados.resultado.toString()}
                      variant="highlight"
                      icon="="
                    />
                  )}

                  <div className={styles.listaElementos}>
                    <h4>Potencias de {resultados.elemento}</h4>
                    <p className={styles.elementos}>
                      {resultados.potencias.map((p, i) => `${resultados.elemento}^${i}=${p}`).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {resultados.tipo === 'cayley' && (
                <>
                  <div className={styles.tablaSection}>
                    <h3>Tabla de Suma (Z{resultados.modulo}, +)</h3>
                    <div className={styles.tablaWrapper}>
                      <table className={styles.tablaCayley}>
                        <thead>
                          <tr>
                            <th>+</th>
                            {Array.from({ length: resultados.modulo }, (_, i) => (
                              <th key={i}>{i}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {resultados.tablaSuma.map((fila, i) => (
                            <tr key={i}>
                              <th>{i}</th>
                              {fila.map((val, j) => (
                                <td key={j}>{val}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className={styles.tablaSection}>
                    <h3>Tabla de Multiplicación (Z{resultados.modulo}, ×)</h3>
                    <div className={styles.tablaWrapper}>
                      <table className={styles.tablaCayley}>
                        <thead>
                          <tr>
                            <th>×</th>
                            {Array.from({ length: resultados.modulo }, (_, i) => (
                              <th key={i}>{i}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {resultados.tablaMult.map((fila, i) => (
                            <tr key={i}>
                              <th>{i}</th>
                              {fila.map((val, j) => (
                                <td key={j} className={val === 0 && i !== 0 && j !== 0 ? styles.ceroDiv : ''}>
                                  {val}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {resultados.tipo === 'propiedades' && (
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title="¿Es cuerpo?"
                    value={resultados.esCuerpo ? 'Sí' : 'No'}
                    variant={resultados.esCuerpo ? 'success' : 'warning'}
                    icon={resultados.esCuerpo ? '✅' : '❌'}
                    description={resultados.esCuerpo ? 'n es primo' : 'n no es primo'}
                  />
                  <ResultCard
                    title="¿Es dominio de integridad?"
                    value={resultados.esDominioIntegridad ? 'Sí' : 'No'}
                    variant={resultados.esDominioIntegridad ? 'success' : 'default'}
                    icon={resultados.esDominioIntegridad ? '✅' : '❌'}
                  />
                  <ResultCard
                    title="Característica"
                    value={resultados.caracteristica.toString()}
                    variant="info"
                    icon="char"
                  />
                  <ResultCard
                    title="Número de unidades"
                    value={`${resultados.numUnidades} (φ(${resultados.modulo}))`}
                    variant="default"
                    icon="φ"
                  />

                  <div className={styles.listaElementos}>
                    <h4>Unidades (Z{resultados.modulo}*)</h4>
                    <p className={styles.elementos}>
                      {resultados.unidades.join(', ')}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Divisores de cero</h4>
                    <p className={styles.elementos}>
                      {resultados.divisoresCero.length > 0 ? resultados.divisoresCero.sort((a, b) => a - b).join(', ') : 'Ninguno'}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Elementos idempotentes (a² = a)</h4>
                    <p className={styles.elementos}>
                      {resultados.idempotentes.join(', ')}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Elementos nilpotentes</h4>
                    <p className={styles.elementos}>
                      {resultados.nilpotentes.length > 0 ? resultados.nilpotentes.join(', ') : 'Ninguno (excepto 0)'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Álgebra Abstracta?"
        subtitle="Grupos, anillos, cuerpos y estructuras algebraicas"
      >
        <section className={styles.guideSection}>
          <h2>Álgebra Abstracta: Conceptos Fundamentales</h2>
          <p className={styles.introParagraph}>
            El álgebra abstracta estudia estructuras algebraicas como grupos, anillos y cuerpos.
            Es fundamental en criptografía, teoría de códigos y física teórica.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Grupos</h4>
              <p>
                Un conjunto G con una operación * que cumple: clausura, asociatividad,
                elemento neutro e inversos. (Zn, +) es siempre un grupo.
                (Zn*, ×) es el grupo de unidades.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Anillos</h4>
              <p>
                Un conjunto con dos operaciones (+ y ×) donde (R, +) es grupo abeliano,
                × es asociativa y distributiva sobre +. Zn es un anillo con unidad.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Cuerpos</h4>
              <p>
                Un anillo donde todos los elementos no nulos tienen inverso multiplicativo.
                Zn es cuerpo si y solo si n es primo. Fundamental en álgebra lineal.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Tabla de Cayley</h4>
              <p>
                Representa completamente la estructura de un grupo finito.
                Cada fila y columna contiene cada elemento exactamente una vez
                (propiedad de grupo).
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <Footer appName="calculadora-algebra-abstracta" />
    </div>
  );
}
