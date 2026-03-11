'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraAlgebraAbstracta.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

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

      <LegalNotice lastUpdated="2026-02-02" />

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
                    value={(resultados.ordenGrupoMultiplicativo ?? 0).toString()}
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
                      {(resultados.unidades ?? []).join(', ')}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Generadores de (Zn, +)</h4>
                    <p className={styles.elementos}>
                      {(resultados.generadoresAditivos ?? []).join(', ') || 'Ninguno'}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Generadores de (Zn*, ×)</h4>
                    <p className={styles.elementos}>
                      {(resultados.generadoresMultiplicativos ?? []).join(', ') || 'Ninguno'}
                    </p>
                  </div>
                </div>
              )}

              {resultados.tipo === 'anillo' && (
                <div className={styles.resultsGrid}>
                  <ResultCard
                    title={`[${resultados.elemento}] en Z${resultados.modulo}`}
                    value={(resultados.elemento ?? 0).toString()}
                    variant="highlight"
                    icon="a"
                  />
                  <ResultCard
                    title="Inverso aditivo (-a)"
                    value={(resultados.inversoAditivo ?? 0).toString()}
                    variant="info"
                    icon="-"
                  />
                  <ResultCard
                    title="Inverso multiplicativo (a⁻¹)"
                    value={resultados.inversoMultiplicativo != null ? resultados.inversoMultiplicativo.toString() : 'No existe'}
                    variant={resultados.inversoMultiplicativo !== null ? 'success' : 'warning'}
                    icon="⁻¹"
                  />
                  <ResultCard
                    title={`Orden (${operacion === '+' ? 'aditivo' : 'multiplicativo'})`}
                    value={(resultados.orden ?? 0) > 0 ? (resultados.orden ?? 0).toString() : 'N/A'}
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
                      value={(resultados.resultado ?? 0).toString()}
                      variant="highlight"
                      icon="="
                    />
                  )}

                  <div className={styles.listaElementos}>
                    <h4>Potencias de {resultados.elemento}</h4>
                    <p className={styles.elementos}>
                      {(resultados.potencias ?? []).map((p, i) => `${resultados.elemento ?? 0}^${i}=${p}`).join(', ')}
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
                          {(resultados.tablaSuma ?? []).map((fila, i) => (
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
                          {(resultados.tablaMult ?? []).map((fila, i) => (
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
                    value={(resultados.caracteristica ?? 0).toString()}
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
                      {(resultados.unidades ?? []).join(', ')}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Divisores de cero</h4>
                    <p className={styles.elementos}>
                      {(resultados.divisoresCero?.length ?? 0) > 0 ? (resultados.divisoresCero ?? []).sort((a, b) => a - b).join(', ') : 'Ninguno'}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Elementos idempotentes (a² = a)</h4>
                    <p className={styles.elementos}>
                      {(resultados.idempotentes ?? []).join(', ')}
                    </p>
                  </div>

                  <div className={styles.listaElementos}>
                    <h4>Elementos nilpotentes</h4>
                    <p className={styles.elementos}>
                      {(resultados.nilpotentes?.length ?? 0) > 0 ? (resultados.nilpotentes ?? []).join(', ') : 'Ninguno (excepto 0)'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>


      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-algebra-abstracta">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para explorar estructuras algebraicas (grupos, anillos, cuerpos):</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Verifica resultados en trabajos académicos</strong>: Especialmente en teoría de grupos, anillos modulares y álgebra abstracta</li>
          <li><strong>Consulta con tu profesor</strong>: Para asegurarte de interpretar correctamente las propiedades algebraicas</li>
        </ul>
      </DisclaimerCard>

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

        {/* 1. Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>Tabla Comparativa de Estructuras Algebraicas</h2>
          <p className={styles.introParagraph}>
            Comparación sistemática de las principales estructuras del álgebra abstracta, ordenadas de menor a mayor riqueza axiomática.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Estructura</th>
                  <th>Operación</th>
                  <th>Asociatividad</th>
                  <th>Elemento neutro</th>
                  <th>Inverso</th>
                  <th>Conmutatividad</th>
                  <th>Ejemplo concreto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Magma</strong></td>
                  <td>Clausura</td>
                  <td>No requerida</td>
                  <td>No requerido</td>
                  <td>No requerido</td>
                  <td>No requerida</td>
                  <td>(ℕ, −) enteros bajo resta</td>
                </tr>
                <tr>
                  <td><strong>Semigrupo</strong></td>
                  <td>Clausura</td>
                  <td>Sí</td>
                  <td>No requerido</td>
                  <td>No requerido</td>
                  <td>No requerida</td>
                  <td>(ℕ⁺, ×) enteros positivos bajo multiplicación</td>
                </tr>
                <tr>
                  <td><strong>Monoide</strong></td>
                  <td>Clausura</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>No requerido</td>
                  <td>No requerida</td>
                  <td>(ℕ, ×) con neutro 1, o (Σ*, ·) cadenas con concatenación</td>
                </tr>
                <tr>
                  <td><strong>Grupo</strong></td>
                  <td>Clausura</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>No requerida</td>
                  <td>(ℤ, +), GL(n,ℝ) matrices invertibles</td>
                </tr>
                <tr>
                  <td><strong>Grupo Abeliano</strong></td>
                  <td>Clausura</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>Sí</td>
                  <td>(ℤ, +), (ℚ\{'{'}0{'}'}, ×), (Z₇, +)</td>
                </tr>
                <tr>
                  <td><strong>Anillo</strong></td>
                  <td>+ y ×</td>
                  <td>Sí (ambas)</td>
                  <td>Sí (en +)</td>
                  <td>Sí (en +)</td>
                  <td>Sí (en +)</td>
                  <td>(ℤ, +, ×), Z₁₂, matrices M(n,ℤ)</td>
                </tr>
                <tr>
                  <td><strong>Cuerpo</strong></td>
                  <td>+ y ×</td>
                  <td>Sí (ambas)</td>
                  <td>Sí (ambas: 0 y 1)</td>
                  <td>Sí (ambas)</td>
                  <td>Sí (ambas)</td>
                  <td>(ℝ, +, ×), (ℚ, +, ×), GF(7) = Z₇ con p primo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de Uso */}
        <section className={styles.guideSection}>
          <h2>Casos de Uso por Perfil</h2>
          <p className={styles.introParagraph}>
            El álgebra abstracta tiene aplicaciones concretas muy distintas según el área de trabajo. Cada perfil usa estructuras y teoremas específicos.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧮</span>
                <h4>Estudiante de Matemáticas</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Grupos de simetría:</strong> El grupo diédrico D₄ (simetrías del cuadrado) tiene orden 8 y es el primer ejemplo de grupo no abeliano en cursos de álgebra.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Teorema de Lagrange:</strong> Si H es subgrupo de G, entonces |H| divide a |G|. En Z₁₂, los subgrupos tienen órdenes 1, 2, 3, 4, 6 y 12.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔐</span>
                <h4>Programador Criptógrafo</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>RSA usa aritmética modular:</strong> El exponente público e y privado d se calculan en ℤφ(n). Si p=61, q=53, n=3233, φ(n)=3120, entonces e=17 y d=2753.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Cuerpos finitos GF(p):</strong> AES usa GF(2⁸) = GF(256) para las operaciones de sustitución (S-Box). La multiplicación es polinomial módulo x⁸+x⁴+x³+x+1.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">⚛️</span>
                <h4>Físico Teórico</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Grupos de Lie:</strong> SU(2) describe el espín de partículas cuánticas. SU(3) clasifica los quarks en el Modelo Estándar (cromodinámica cuántica).
              </p>
              <p className={styles.escenarioTip}>
                <strong>Teoría de representaciones:</strong> Las representaciones irreducibles de SO(3) corresponden a los números cuánticos de momento angular l = 0, 1, 2, ... en mecánica cuántica.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h4>Ingeniero Informático</h4>
              </div>
              <p className={styles.escenarioExample}>
                <strong>Teoría de autómatas:</strong> Los monoides de transición (Σ*, ·) con concatenación modelan lenguajes regulares. El semiautómata mínimo corresponde al monoide sintáctico del lenguaje.
              </p>
              <p className={styles.escenarioTip}>
                <strong>Álgebra de Boole:</strong> ({'{'}0,1{'}'}, ∧, ∨, ¬) es un retículo booleano: base formal de todos los circuitos digitales. NOT, AND, OR son operaciones algebraicas sobre GF(2).
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes sobre Álgebra Abstracta</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia un grupo de un monoide?</dt>
              <dd>
                Un monoide tiene clausura, asociatividad y elemento neutro, pero <strong>no exige inversos</strong>. Un grupo añade el axioma de inverso: para cada a existe a⁻¹ tal que a·a⁻¹ = e. Por ejemplo, (ℕ, ×) es monoide con neutro 1, pero 2 no tiene inverso en ℕ, así que no es grupo.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Por qué ℤ bajo la multiplicación no es grupo?</dt>
              <dd>
                En (ℤ, ×) el neutro es 1, pero el elemento 2 no tiene inverso entero (1/2 ∉ ℤ). Solo los elementos {'{'}1, −1{'}'} tienen inverso multiplicativo en ℤ. Por eso (ℤ, ×) es monoide, no grupo. En cambio (ℤ, +) sí es grupo: el inverso de n es −n.
                <span className={styles.faqTip}>Regla: para que (ℤₙ, ×) sea grupo necesitas solo las unidades (elementos con mcd(a,n)=1), que forman el grupo (ℤₙ*, ×).</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es un homomorfismo?</dt>
              <dd>
                Una función f: G → H entre dos grupos que <strong>respeta la operación</strong>: f(a·b) = f(a)·f(b) para todo a,b ∈ G. Ejemplo concreto: f: (ℤ, +) → (ℤ₆, +) con f(n) = n mod 6. Se verifica: f(3+5) = f(8) = 2 = (3 mod 6 + 5 mod 6) mod 6 = (3+5) mod 6 = 2. ✓
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cómo se usa el álgebra abstracta en criptografía RSA?</dt>
              <dd>
                RSA opera en el grupo multiplicativo (ℤₙ*, ×) donde n = p·q (p, q primos). El teorema de Euler garantiza que a^φ(n) ≡ 1 (mod n) para todo a coprimo con n. Esto permite construir e·d ≡ 1 (mod φ(n)) de forma que cifrar con e y descifrar con d sean operaciones inversas.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el orden de un grupo?</dt>
              <dd>
                El <strong>orden del grupo</strong> es su cardinalidad: el número de elementos. El orden del grupo (Z₁₂, +) es 12. El <strong>orden de un elemento</strong> a es el menor entero positivo k tal que a^k = e. En (Z₁₂, +), el orden de 4 es 3, porque 4+4+4 = 12 ≡ 0 (mod 12).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué dice el teorema de Lagrange?</dt>
              <dd>
                Si H es un subgrupo de un grupo finito G, entonces |H| divide a |G|. Consecuencia: el orden de cualquier elemento divide al orden del grupo. En Z₁₅ (orden 15), los posibles órdenes de elementos son 1, 3, 5 y 15. No puede haber un elemento de orden 4 porque 4 no divide a 15.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es un grupo cíclico?</dt>
              <dd>
                Un grupo G es cíclico si existe un generador g tal que todo elemento de G es potencia de g: G = &#x27E8;g&#x27E9; = {'{'}g⁰, g¹, g², ...{'}'}. (Z₇, +) es cíclico con generadores 1, 2, 3, 4, 5 y 6. (Z₈*, ×) = {'{'}1,3,5,7{'}'} NO es cíclico: ningún elemento genera todo el grupo.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Diferencia entre anillo y cuerpo?</dt>
              <dd>
                En un <strong>anillo</strong> los elementos no nulos no necesitan tener inverso multiplicativo. En un <strong>cuerpo</strong> todo elemento no nulo es invertible. Z₆ es anillo: 2 y 3 no tienen inverso multiplicativo (mcd(2,6)=2≠1). Z₇ es cuerpo: 7 es primo, por lo tanto mcd(a,7)=1 para todo a∈{'{'}1,...,6{'}'}.
              </dd>
            </div>
          </dl>
        </section>

        {/* 4. Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>Cómo Verificar si un Conjunto forma un Grupo</h2>
          <p className={styles.introParagraph}>
            Método sistemático para verificar los 4 axiomas de grupo, con ejemplos en (Z₅, +).
          </p>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Verificar clausura</strong>
                <p>Para todo a, b ∈ G, comprobar que a·b ∈ G. En (Z₅, +): 3 + 4 = 7 ≡ 2 (mod 5) ∈ Z₅. ✓ Suma módulo n siempre permanece en Z₅.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Verificar asociatividad</strong>
                <p>Para todo a, b, c ∈ G, comprobar (a·b)·c = a·(b·c). En (Z₅, +): (2+3)+4 = 5+4 = 9 ≡ 4 y 2+(3+4) = 2+7 = 9 ≡ 4 (mod 5). ✓ La suma es asociativa.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Encontrar el elemento identidad</strong>
                <p>Encontrar e ∈ G tal que a·e = e·a = a para todo a. En (Z₅, +): el elemento 0 cumple a + 0 = a para todo a ∈ {'{'}0,1,2,3,4{'}'}. ✓ El elemento neutro es 0.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Verificar existencia de inversos</strong>
                <p>Para cada a ∈ G, encontrar a⁻¹ tal que a·a⁻¹ = e. En (Z₅, +): inverso de 3 es 2, porque 3+2=5≡0. Inversos: 0↔0, 1↔4, 2↔3, 3↔2, 4↔1. ✓ Todos tienen inverso.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Comprobar conmutatividad (opcional: grupo abeliano)</strong>
                <p>Si a·b = b·a para todo a,b ∈ G, el grupo es abeliano. En (Z₅, +): 2+3 = 5 ≡ 0 y 3+2 = 5 ≡ 0. ✓ (Z₅, +) es grupo abeliano. En GL(2,ℝ) matrices: A·B ≠ B·A en general, no es abeliano.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Calcular el orden del grupo y de sus elementos</strong>
                <p>|Z₅| = 5. Órdenes de elementos: ord(0)=1, ord(1)=5, ord(2)=5, ord(3)=5, ord(4)=5. Los elementos de orden 5 son generadores: {'{'}1,2,3,4{'}'} son todos generadores, confirmando que Z₅ es grupo cíclico.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Identificar subgrupos usando el teorema de Lagrange</strong>
                <p>Los posibles órdenes de subgrupos de Z₅ son divisores de 5: {'{'}1, 5{'}'}. Subgrupos: {'{'}0{'}'} (trivial) y Z₅ completo. Como 5 es primo, Z₅ no tiene subgrupos propios no triviales: todo grupo de orden primo es cíclico simple.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>Mejores Prácticas en Álgebra Abstracta</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">1️⃣</span>
              <h4>Verifica clausura primero</h4>
              <p>La clausura es el axioma más fácil de fallar y el primero en comprobar. En (ℤ impar, +): 3+5=8, que es par, por lo que los impares NO forman grupo bajo la suma. Sin clausura, el resto de axiomas son irrelevantes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">2️⃣</span>
              <h4>Construye tablas de Cayley para grupos finitos pequeños</h4>
              <p>Para grupos de orden ≤ 6, construir la tabla completa n×n revela toda la estructura. La propiedad de grupo garantiza que cada elemento aparece exactamente una vez en cada fila y columna (cuadrado latino). Esta herramienta la calcula automáticamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">3️⃣</span>
              <h4>Usa notación de ciclos para permutaciones</h4>
              <p>En el grupo simétrico S₄, la permutación (1 2 3)(4) se escribe como ciclo (1 2 3). El orden de un elemento es el mcm de las longitudes de sus ciclos: (1 2 3)(4 5) tiene orden mcm(3,2)=6. Más compacto que la notación matricial 4×4.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">4️⃣</span>
              <h4>Aplica el teorema de Lagrange para descartar subgrupos</h4>
              <p>Antes de buscar subgrupos, factoriza el orden del grupo. Si |G|=12, solo pueden existir subgrupos de órdenes 1, 2, 3, 4, 6, 12. Buscar un subgrupo de orden 5 en Z₁₂ es imposible: 5 no divide a 12.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">5️⃣</span>
              <h4>Distingue isomorfismo de homomorfismo</h4>
              <p>Un homomorfismo f: G → H preserva operaciones pero puede no ser biyectivo. Un isomorfismo es homomorfismo biyectivo: f⁻¹ también es homomorfismo. Z₄ y Z₂×Z₂ tienen el mismo orden (4) pero no son isomorfos: Z₄ tiene elementos de orden 4, Z₂×Z₂ no.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">6️⃣</span>
              <h4>Verifica si mcd(a,n)=1 antes de calcular inversos</h4>
              <p>En Zₙ, el elemento a tiene inverso multiplicativo si y solo si mcd(a,n)=1. En Z₁₂: mcd(5,12)=1 → inverso existe (es 5, pues 5×5=25≡1). mcd(4,12)=4≠1 → 4 no tiene inverso multiplicativo. Usa el algoritmo de Euclides extendido para calcularlo.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes al Trabajar con Estructuras Algebraicas</h3>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Olvidar verificar la clausura (el error más frecuente):</strong> Definir una operación en un subconjunto sin comprobar que permanece en él. Ejemplo: {'{'}1, −1{'}'} bajo suma de enteros no es cerrado: 1+(−1)=0, que no está en el conjunto.</li>
            <li><strong>Confundir grupo con monoide:</strong> Un monoide no exige inversos. (ℕ, +) es monoide (neutro=0) pero NO grupo: el natural 3 no tiene inverso en ℕ. (ℤ, +) sí es grupo porque −3 ∈ ℤ.</li>
            <li><strong>Asumir conmutatividad sin verificar:</strong> GL(n,ℝ) (matrices invertibles n×n) es grupo no abeliano para n≥2. En criptografía de curvas elípticas, la operación de grupo de puntos es abeliana, pero esto debe probarse, no asumirse.</li>
            <li><strong>Confundir orden del grupo con orden del elemento:</strong> En Z₁₂ (orden 12), el elemento 4 tiene orden 3 (porque 4+4+4=12≡0), no orden 12. El orden del elemento siempre divide al orden del grupo (Lagrange).</li>
            <li><strong>Usar operación incorrecta en aritmética modular:</strong> En Z₇ bajo multiplicación, el inverso de 3 es 5 (3×5=15≡1 mod 7), no 4. Siempre verificar: a × a⁻¹ ≡ 1 (mod n), NO a + a⁻¹ ≡ 0.</li>
            <li><strong>Confundir isomorfismo con homomorfismo:</strong> f: Z → Z₂ con f(n)=n mod 2 es homomorfismo (f(a+b)=f(a)+f(b)) pero NO isomorfismo (no es inyectivo). Un isomorfismo requiere biyectividad: f y f⁻¹ ambos son homomorfismos.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-algebra-abstracta')} />

      <ShareCard appName="calculadora-algebra-abstracta" />
      <Footer appName="calculadora-algebra-abstracta" />
    </div>
  );
}
