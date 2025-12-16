'use client';

import { useState } from 'react';
import styles from './ReglaDeTres.module.css';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoRegla = 'simple-directa' | 'simple-inversa' | 'compuesta';

interface ResultadoCalculo {
  valor: number;
  explicacion: string[];
  formula: string;
}

export default function CalculadoraReglaDeTresPage() {
  // Estado para tipo de regla
  const [tipoRegla, setTipoRegla] = useState<TipoRegla>('simple-directa');

  // Regla de tres simple
  const [valorA, setValorA] = useState('');
  const [valorB, setValorB] = useState('');
  const [valorC, setValorC] = useState('');

  // Regla de tres compuesta (valores adicionales)
  const [valorD, setValorD] = useState('');
  const [valorE, setValorE] = useState('');
  const [tipoRelacion2, setTipoRelacion2] = useState<'directa' | 'inversa'>('directa');

  // Resultado
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [error, setError] = useState('');

  const calcularReglaDeTres = () => {
    setError('');
    setResultado(null);

    const a = parseSpanishNumber(valorA);
    const b = parseSpanishNumber(valorB);
    const c = parseSpanishNumber(valorC);

    // Validaciones básicas
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError('Por favor, introduce valores numéricos válidos en todos los campos.');
      return;
    }

    if (a === 0) {
      setError('El valor A no puede ser cero.');
      return;
    }

    let valorX: number;
    let explicacion: string[] = [];
    let formula: string;

    if (tipoRegla === 'simple-directa') {
      // Proporción directa: A/B = C/X → X = (B × C) / A
      valorX = (b * c) / a;
      formula = 'X = (B × C) / A';
      explicacion = [
        `Regla de tres simple directa:`,
        `Si ${formatNumber(a, 2)} corresponde a ${formatNumber(b, 2)}`,
        `Entonces ${formatNumber(c, 2)} corresponde a X`,
        ``,
        `Planteamiento: ${formatNumber(a, 2)} → ${formatNumber(b, 2)}`,
        `              ${formatNumber(c, 2)} → X`,
        ``,
        `Fórmula: X = (B × C) / A`,
        `X = (${formatNumber(b, 2)} × ${formatNumber(c, 2)}) / ${formatNumber(a, 2)}`,
        `X = ${formatNumber(b * c, 2)} / ${formatNumber(a, 2)}`,
        `X = ${formatNumber(valorX, 4)}`,
      ];
    } else if (tipoRegla === 'simple-inversa') {
      // Proporción inversa: A × B = C × X → X = (A × B) / C
      valorX = (a * b) / c;
      formula = 'X = (A × B) / C';
      explicacion = [
        `Regla de tres simple inversa:`,
        `Si ${formatNumber(a, 2)} corresponde a ${formatNumber(b, 2)}`,
        `Entonces ${formatNumber(c, 2)} corresponde a X (inversamente)`,
        ``,
        `Planteamiento: ${formatNumber(a, 2)} → ${formatNumber(b, 2)}`,
        `              ${formatNumber(c, 2)} → X (inversa)`,
        ``,
        `Fórmula: X = (A × B) / C`,
        `X = (${formatNumber(a, 2)} × ${formatNumber(b, 2)}) / ${formatNumber(c, 2)}`,
        `X = ${formatNumber(a * b, 2)} / ${formatNumber(c, 2)}`,
        `X = ${formatNumber(valorX, 4)}`,
      ];
    } else {
      // Regla de tres compuesta
      const d = parseSpanishNumber(valorD);
      const e = parseSpanishNumber(valorE);

      if (isNaN(d) || isNaN(e)) {
        setError('Para regla de tres compuesta, completa todos los valores.');
        return;
      }

      if (d === 0) {
        setError('El valor D no puede ser cero.');
        return;
      }

      // Primera relación siempre directa, segunda según selección
      if (tipoRelacion2 === 'directa') {
        // Ambas directas: X = (B × C × E) / (A × D)
        valorX = (b * c * e) / (a * d);
        formula = 'X = (B × C × E) / (A × D)';
        explicacion = [
          `Regla de tres compuesta (directa-directa):`,
          ``,
          `Magnitud 1: ${formatNumber(a, 2)} → ${formatNumber(c, 2)} (directa)`,
          `Magnitud 2: ${formatNumber(d, 2)} → ${formatNumber(e, 2)} (directa)`,
          `Resultado:  ${formatNumber(b, 2)} → X`,
          ``,
          `Fórmula: X = (B × C × E) / (A × D)`,
          `X = (${formatNumber(b, 2)} × ${formatNumber(c, 2)} × ${formatNumber(e, 2)}) / (${formatNumber(a, 2)} × ${formatNumber(d, 2)})`,
          `X = ${formatNumber(b * c * e, 2)} / ${formatNumber(a * d, 2)}`,
          `X = ${formatNumber(valorX, 4)}`,
        ];
      } else {
        // Primera directa, segunda inversa: X = (B × C × D) / (A × E)
        valorX = (b * c * d) / (a * e);
        formula = 'X = (B × C × D) / (A × E)';
        explicacion = [
          `Regla de tres compuesta (directa-inversa):`,
          ``,
          `Magnitud 1: ${formatNumber(a, 2)} → ${formatNumber(c, 2)} (directa)`,
          `Magnitud 2: ${formatNumber(d, 2)} → ${formatNumber(e, 2)} (inversa)`,
          `Resultado:  ${formatNumber(b, 2)} → X`,
          ``,
          `Fórmula: X = (B × C × D) / (A × E)`,
          `X = (${formatNumber(b, 2)} × ${formatNumber(c, 2)} × ${formatNumber(d, 2)}) / (${formatNumber(a, 2)} × ${formatNumber(e, 2)})`,
          `X = ${formatNumber(b * c * d, 2)} / ${formatNumber(a * e, 2)}`,
          `X = ${formatNumber(valorX, 4)}`,
        ];
      }
    }

    setResultado({
      valor: valorX,
      explicacion,
      formula,
    });
  };

  const limpiarCampos = () => {
    setValorA('');
    setValorB('');
    setValorC('');
    setValorD('');
    setValorE('');
    setResultado(null);
    setError('');
  };

  const cargarEjemplo = () => {
    if (tipoRegla === 'simple-directa') {
      // Si 3 kg de naranjas cuestan 4,50€, ¿cuánto cuestan 5 kg?
      setValorA('3');
      setValorB('4,50');
      setValorC('5');
    } else if (tipoRegla === 'simple-inversa') {
      // Si 4 obreros hacen un trabajo en 6 días, ¿cuántos días tardarán 8 obreros?
      setValorA('4');
      setValorB('6');
      setValorC('8');
    } else {
      // Si 5 máquinas producen 200 piezas en 8 horas, ¿cuántas piezas producen 3 máquinas en 12 horas?
      setValorA('5');
      setValorB('200');
      setValorC('3');
      setValorD('8');
      setValorE('12');
      setTipoRelacion2('directa');
    }
    setResultado(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora Regla de Tres</h1>
        <p className={styles.subtitle}>
          Resuelve proporciones con regla de tres simple (directa e inversa) y compuesta
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Panel de configuración */}
        <section className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Regla de Tres</h2>

          <div className={styles.tipoSelector}>
            <button
              className={`${styles.tipoBtn} ${tipoRegla === 'simple-directa' ? styles.activo : ''}`}
              onClick={() => { setTipoRegla('simple-directa'); limpiarCampos(); }}
            >
              Simple Directa
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoRegla === 'simple-inversa' ? styles.activo : ''}`}
              onClick={() => { setTipoRegla('simple-inversa'); limpiarCampos(); }}
            >
              Simple Inversa
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoRegla === 'compuesta' ? styles.activo : ''}`}
              onClick={() => { setTipoRegla('compuesta'); limpiarCampos(); }}
            >
              Compuesta
            </button>
          </div>

          {/* Descripción del tipo seleccionado */}
          <div className={styles.tipoDescripcion}>
            {tipoRegla === 'simple-directa' && (
              <p>
                <strong>Proporción directa:</strong> Cuando una magnitud aumenta, la otra también aumenta en la misma proporción.
                <br /><em>Ejemplo: Si compras más kg, pagas más euros.</em>
              </p>
            )}
            {tipoRegla === 'simple-inversa' && (
              <p>
                <strong>Proporción inversa:</strong> Cuando una magnitud aumenta, la otra disminuye en la misma proporción.
                <br /><em>Ejemplo: Si hay más obreros, tardan menos días.</em>
              </p>
            )}
            {tipoRegla === 'compuesta' && (
              <p>
                <strong>Regla compuesta:</strong> Intervienen más de dos magnitudes relacionadas entre sí.
                <br /><em>Ejemplo: Máquinas, horas y piezas producidas.</em>
              </p>
            )}
          </div>
        </section>

        {/* Panel de entrada */}
        <section className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>Introduce los valores</h2>

          {tipoRegla !== 'compuesta' ? (
            /* Regla de tres simple */
            <div className={styles.proporcionSimple}>
              <div className={styles.proporcionRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="valorA">A (valor conocido)</label>
                  <input
                    type="text"
                    id="valorA"
                    value={valorA}
                    onChange={(e) => setValorA(e.target.value)}
                    placeholder="ej: 3"
                    className={styles.input}
                  />
                </div>
                <span className={styles.flecha}>→</span>
                <div className={styles.inputGroup}>
                  <label htmlFor="valorB">B (resultado conocido)</label>
                  <input
                    type="text"
                    id="valorB"
                    value={valorB}
                    onChange={(e) => setValorB(e.target.value)}
                    placeholder="ej: 4,50"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.proporcionRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="valorC">C (valor a calcular)</label>
                  <input
                    type="text"
                    id="valorC"
                    value={valorC}
                    onChange={(e) => setValorC(e.target.value)}
                    placeholder="ej: 5"
                    className={styles.input}
                  />
                </div>
                <span className={styles.flecha}>→</span>
                <div className={styles.inputGroup}>
                  <label>X (resultado)</label>
                  <div className={styles.resultadoX}>
                    {resultado ? formatNumber(resultado.valor, 2) : '?'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Regla de tres compuesta */
            <div className={styles.proporcionCompuesta}>
              <div className={styles.magnitudGroup}>
                <h3>Magnitud 1 (directa)</h3>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="valorA">A</label>
                    <input
                      type="text"
                      id="valorA"
                      value={valorA}
                      onChange={(e) => setValorA(e.target.value)}
                      placeholder="ej: 5"
                      className={styles.input}
                    />
                  </div>
                  <span className={styles.flecha}>→</span>
                  <div className={styles.inputGroup}>
                    <label htmlFor="valorC">C</label>
                    <input
                      type="text"
                      id="valorC"
                      value={valorC}
                      onChange={(e) => setValorC(e.target.value)}
                      placeholder="ej: 3"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.magnitudGroup}>
                <h3>
                  Magnitud 2
                  <select
                    value={tipoRelacion2}
                    onChange={(e) => setTipoRelacion2(e.target.value as 'directa' | 'inversa')}
                    className={styles.selectRelacion}
                  >
                    <option value="directa">(directa)</option>
                    <option value="inversa">(inversa)</option>
                  </select>
                </h3>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="valorD">D</label>
                    <input
                      type="text"
                      id="valorD"
                      value={valorD}
                      onChange={(e) => setValorD(e.target.value)}
                      placeholder="ej: 8"
                      className={styles.input}
                    />
                  </div>
                  <span className={styles.flecha}>→</span>
                  <div className={styles.inputGroup}>
                    <label htmlFor="valorE">E</label>
                    <input
                      type="text"
                      id="valorE"
                      value={valorE}
                      onChange={(e) => setValorE(e.target.value)}
                      placeholder="ej: 12"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.magnitudGroup}>
                <h3>Resultado</h3>
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="valorB">B (conocido)</label>
                    <input
                      type="text"
                      id="valorB"
                      value={valorB}
                      onChange={(e) => setValorB(e.target.value)}
                      placeholder="ej: 200"
                      className={styles.input}
                    />
                  </div>
                  <span className={styles.flecha}>→</span>
                  <div className={styles.inputGroup}>
                    <label>X</label>
                    <div className={styles.resultadoX}>
                      {resultado ? formatNumber(resultado.valor, 2) : '?'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.botonesAccion}>
            <button onClick={calcularReglaDeTres} className={styles.btnPrimary}>
              Calcular
            </button>
            <button onClick={cargarEjemplo} className={styles.btnSecondary}>
              Cargar Ejemplo
            </button>
            <button onClick={limpiarCampos} className={styles.btnOutline}>
              Limpiar
            </button>
          </div>
        </section>

        {/* Panel de resultados */}
        {resultado && (
          <section className={styles.resultadosPanel}>
            <h2 className={styles.sectionTitle}>Resultado</h2>

            <ResultCard
              title="Valor de X"
              value={formatNumber(resultado.valor, 4)}
              variant="highlight"
              icon="="
            />

            <div className={styles.explicacionBox}>
              <h3>Explicación paso a paso</h3>
              <pre className={styles.explicacionTexto}>
                {resultado.explicacion.join('\n')}
              </pre>
            </div>
          </section>
        )}
      </main>

      {/* Contenido educativo */}
      <EducationalSection
        title="Aprende sobre la Regla de Tres"
        subtitle="Conceptos, fórmulas y ejemplos prácticos"
        icon="📚"
      >
        <div className={styles.educationalContent}>
          <section className={styles.conceptoSection}>
            <h2>Qué es la Regla de Tres</h2>
            <p>
              La regla de tres es un método matemático para resolver problemas de proporcionalidad.
              Permite encontrar un valor desconocido cuando conocemos tres valores relacionados entre sí.
            </p>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Tipos de Regla de Tres</h2>

            <div className={styles.tipoCard}>
              <h3>Regla de Tres Simple Directa</h3>
              <p>
                Se usa cuando las magnitudes son <strong>directamente proporcionales</strong>:
                si una aumenta, la otra también aumenta en la misma proporción.
              </p>
              <div className={styles.ejemploBox}>
                <strong>Ejemplo:</strong> Si 3 kg de manzanas cuestan 6€, ¿cuánto cuestan 5 kg?
                <br />
                3 kg → 6€
                <br />
                5 kg → X = (6 × 5) / 3 = <strong>10€</strong>
              </div>
            </div>

            <div className={styles.tipoCard}>
              <h3>Regla de Tres Simple Inversa</h3>
              <p>
                Se usa cuando las magnitudes son <strong>inversamente proporcionales</strong>:
                si una aumenta, la otra disminuye en la misma proporción.
              </p>
              <div className={styles.ejemploBox}>
                <strong>Ejemplo:</strong> Si 4 pintores pintan una casa en 6 días, ¿cuántos días tardarán 8 pintores?
                <br />
                4 pintores → 6 días
                <br />
                8 pintores → X = (4 × 6) / 8 = <strong>3 días</strong>
              </div>
            </div>

            <div className={styles.tipoCard}>
              <h3>Regla de Tres Compuesta</h3>
              <p>
                Se usa cuando intervienen <strong>más de dos magnitudes</strong>.
                Cada magnitud puede ser directa o inversamente proporcional al resultado.
              </p>
              <div className={styles.ejemploBox}>
                <strong>Ejemplo:</strong> Si 5 máquinas producen 200 piezas en 8 horas,
                ¿cuántas piezas producen 3 máquinas en 12 horas?
                <br />
                Máquinas: directa (menos máquinas = menos piezas)
                <br />
                Horas: directa (más horas = más piezas)
                <br />
                X = (200 × 3 × 12) / (5 × 8) = <strong>180 piezas</strong>
              </div>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Cómo identificar si es directa o inversa</h2>
            <ul className={styles.listaConsejos}>
              <li>
                <strong>Directa:</strong> "Si hay más... hay más" o "Si hay menos... hay menos"
              </li>
              <li>
                <strong>Inversa:</strong> "Si hay más... hay menos" o "Si hay menos... hay más"
              </li>
            </ul>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-regla-de-tres')} />

      <Footer appName="calculadora-regla-de-tres" />
    </div>
  );
}
