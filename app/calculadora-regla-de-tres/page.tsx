'use client';

import { useState } from 'react';
import styles from './ReglaDeTres.module.css';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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

      <LegalNotice />

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

          {/* SECCIÓN 1: Tabla Comparativa */}
          <section className={styles.conceptoSection}>
            <h2>Comparativa: Directa vs Inversa vs Compuesta</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Característica</th>
                    <th>Simple Directa</th>
                    <th>Simple Inversa</th>
                    <th>Compuesta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Proporcionalidad</strong></td>
                    <td>Directa: ↑A → ↑B</td>
                    <td>Inversa: ↑A → ↓B</td>
                    <td>Mixta (directa e/o inversa)</td>
                  </tr>
                  <tr>
                    <td><strong>Fórmula</strong></td>
                    <td>X = (B × C) / A</td>
                    <td>X = (A × B) / C</td>
                    <td>Combina ambas fórmulas</td>
                  </tr>
                  <tr>
                    <td><strong>Número de magnitudes</strong></td>
                    <td>2 magnitudes</td>
                    <td>2 magnitudes</td>
                    <td>3 o más magnitudes</td>
                  </tr>
                  <tr>
                    <td><strong>Cuándo usarla</strong></td>
                    <td>Al aumentar una, la otra crece</td>
                    <td>Al aumentar una, la otra decrece</td>
                    <td>Varias variables interrelacionadas</td>
                  </tr>
                  <tr>
                    <td><strong>Ejemplo típico</strong></td>
                    <td>kg ↔ precio, km ↔ litros</td>
                    <td>trabajadores ↔ días, velocidad ↔ tiempo</td>
                    <td>máquinas × horas → piezas</td>
                  </tr>
                  <tr>
                    <td><strong>Aplicación habitual</strong></td>
                    <td>Compras, recetas, escalas</td>
                    <td>Planificación de recursos</td>
                    <td>Producción industrial, obras</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECCIÓN 2: Casos de Uso por perfil */}
          <section className={styles.conceptoSection}>
            <h2>¿Quién usa la regla de tres?</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                  <strong>Estudiante ESO/Bachillerato</strong>
                </div>
                <div className={styles.escenarioExample}>
                  <em>Problema:</em> Si un tren recorre 240 km en 3 horas, ¿cuánto tarda en recorrer 400 km a la misma velocidad?
                  <br /><strong>Solución directa:</strong> X = (3 × 400) / 240 = <strong>5 horas</strong>
                </div>
                <div className={styles.escenarioTip}>
                  Clave: velocidad constante → proporcionalidad directa entre distancia y tiempo.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">👨‍🍳</span>
                  <strong>Cocinero / Recetas</strong>
                </div>
                <div className={styles.escenarioExample}>
                  <em>Problema:</em> La receta de bizcocho para 4 personas lleva 200 g de harina. ¿Cuánta harina necesito para 10 personas?
                  <br /><strong>Solución directa:</strong> X = (200 × 10) / 4 = <strong>500 g</strong>
                </div>
                <div className={styles.escenarioTip}>
                  Regla de oro: los ingredientes siempre son directamente proporcionales al número de raciones.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                  <strong>Profesional de Compras</strong>
                </div>
                <div className={styles.escenarioExample}>
                  <em>Problema:</em> 500 unidades de un artículo cuestan 1.250 €. ¿Cuánto costarán 1.800 unidades al mismo precio unitario?
                  <br /><strong>Solución directa:</strong> X = (1.250 × 1.800) / 500 = <strong>4.500 €</strong>
                </div>
                <div className={styles.escenarioTip}>
                  Precio unitario = 1.250 / 500 = 2,50 €/ud. La regla de tres lo calcula directamente sin pasos intermedios.
                </div>
              </div>

              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
                  <strong>Cartógrafo / Ingeniero</strong>
                </div>
                <div className={styles.escenarioExample}>
                  <em>Problema:</em> En un mapa a escala 1:50.000, dos puntos están separados 3,5 cm. ¿Cuál es la distancia real?
                  <br /><strong>Solución directa:</strong> X = (50.000 × 3,5) / 1 = 175.000 cm = <strong>1,75 km</strong>
                </div>
                <div className={styles.escenarioTip}>
                  La escala es una proporción directa: 1 cm en el mapa equivale siempre a la misma distancia real.
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: FAQ */}
          <section className={styles.conceptoSection}>
            <h2>Preguntas Frecuentes</h2>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <strong>¿Cuándo es directa y cuándo inversa?</strong>
                <p>
                  Es directa cuando al aumentar una magnitud la otra también aumenta (más kg → más precio). Es inversa cuando al aumentar una la otra disminuye (más trabajadores → menos días). Pregúntate: ¿si A sube, B sube o baja?
                </p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué es la proporcionalidad compuesta?</strong>
                <p>
                  Ocurre cuando el resultado depende de <em>dos o más</em> magnitudes simultáneamente. Ejemplo: las piezas producidas dependen tanto del número de máquinas (directa) como de las horas de trabajo (directa). Cada magnitud adicional añade un factor al numerador o denominador.
                </p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cómo resuelvo si hay 4 magnitudes?</strong>
                <p>
                  Identifica el tipo de proporcionalidad de cada magnitud por separado. Las magnitudes directas van al numerador y las inversas al denominador: X = (B × C₁ × C₂ × …) / (A × D₁ × D₂ × …). Siempre mantén las unidades coherentes.
                </p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cuál es la diferencia con el tanto por ciento?</strong>
                <p>
                  El tanto por ciento es un caso particular de regla de tres directa donde A = 100. Por ejemplo, "¿el 15% de 240?" equivale a: 100 → 240; 15 → X = (240 × 15) / 100 = 36. Toda regla de porcentajes se puede resolver como regla de tres.
                </p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Sirve para calcular el IVA?</strong>
                <p>
                  Sí. Si un artículo cuesta 85 € sin IVA y el tipo es el 21%, el IVA a pagar es: 100 → 85; 21 → X = (85 × 21) / 100 = 17,85 €. El precio final es 85 + 17,85 = 102,85 €. También puedes calcular el precio sin IVA desde el precio con IVA.
                </p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué es exactamente una proporción?</strong>
                <p>
                  Una proporción es la igualdad de dos razones: A/B = C/D (o A:B = C:D). La regla de tres es el proceso para encontrar el término desconocido D cuando conocemos A, B y C. El producto de los extremos iguala el producto de los medios: A × D = B × C.
                </p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cómo verifico si el resultado es correcto?</strong>
                <p>
                  Sustituye X en la proporción original y comprueba que los cocientes son iguales. En directa: A/C debe ser igual a B/X. En inversa: A × B debe ser igual a C × X. Si la igualdad se cumple, el resultado es correcto.
                </p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Se aplica en física y química?</strong>
                <p>
                  Ampliamente. En física: distancia-velocidad-tiempo, ley de Ohm (V = I × R). En química: estequiometría (moles y masas molares), diluciones (C₁V₁ = C₂V₂), densidad (m = ρ × V). En todos estos casos la regla de tres permite calcular la variable desconocida sin necesitar más herramientas.
                </p>
                <div className={styles.faqTip}>
                  Ejemplo química: 36 g de H₂O son 2 moles. ¿Cuántos gramos son 5 moles? X = (36 × 5) / 2 = <strong>90 g</strong>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 4: Guía Paso a Paso */}
          <section className={styles.conceptoSection}>
            <h2>Guía Paso a Paso: Cómo Resolver Cualquier Regla de Tres</h2>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Lee el enunciado e identifica las magnitudes</strong>
                  <p>Subraya cada cantidad y su unidad. Escribe qué mide cada número: ¿kg?, ¿€?, ¿horas?, ¿personas?</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Determina cuántas magnitudes intervienen</strong>
                  <p>Si solo hay dos magnitudes → regla de tres simple. Si hay tres o más → compuesta.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Clasifica cada relación: directa o inversa</strong>
                  <p>Para cada par de magnitudes pregunta: "¿Si A aumenta, B aumenta (directa) o disminuye (inversa)?"</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Plantea la proporción en una tabla</strong>
                  <p>Escribe los valores conocidos en una tabla de dos columnas y X en la posición que corresponde al incógnito.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <strong>Aplica la fórmula adecuada</strong>
                  <p>Directa: X = (B × C) / A. Inversa: X = (A × B) / C. Compuesta: multiplica los factores según el tipo de cada magnitud.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <strong>Calcula y añade las unidades al resultado</strong>
                  <p>Realiza la operación aritmética y asegúrate de añadir la unidad correcta al resultado. Un número sin unidad es incompleto.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>7</div>
                <div className={styles.stepContent}>
                  <strong>Verifica: comprueba que la proporción se cumple</strong>
                  <p>Sustituye X por el valor obtenido. En directa: A/C = B/X. En inversa: A × B = C × X. Si la igualdad no se cumple, revisa el paso 3.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5: Mejores Prácticas */}
          <section className={styles.conceptoSection}>
            <h2>6 Consejos Profesionales para No Cometer Errores</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🎯</span>
                <strong>Escribe siempre las unidades</strong>
                <p>Operar sin unidades es la causa principal de errores. "3 kg → 6 €" es más seguro que "3 → 6".</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔍</span>
                <strong>Pregunta el "¿qué pasa si doblo?"</strong>
                <p>Para identificar el tipo, imagina que la magnitud A se duplica. Si B también se duplica → directa. Si B se reduce a la mitad → inversa.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📐</span>
                <strong>Mantén el orden en la tabla</strong>
                <p>Coloca siempre los valores conocidos en las mismas posiciones (A↔B, C↔X). Intercambiar filas o columnas sin criterio lleva a errores de planteamiento.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔢</span>
                <strong>Convierte unidades antes de calcular</strong>
                <p>Si mezclas horas con minutos o km con metros, convierte todo a la misma unidad antes de plantear la proporción.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">✅</span>
                <strong>Verifica con el sentido común</strong>
                <p>Si en directa obtienes X menor que B cuando C es mayor que A, algo está mal. El resultado debe tener sentido lógico.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚠️</span>
                <strong>En compuesta: analiza cada magnitud por separado</strong>
                <p>No intentes combinar todo de golpe. Evalúa una a una si cada magnitud es directa o inversa y luego construye la fórmula.</p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 6: Warning Box — Errores Más Comunes */}
          <section className={styles.conceptoSection}>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>6 Errores Más Comunes — y Cómo Evitarlos</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Invertir la proporción:</strong> En directa, X = (B × C) / A. Si pones A en el numerador en lugar de B × C, el resultado es erróneo. Recuerda: el incógnito X siempre está en diagonal respecto a B.
                </li>
                <li>
                  <strong>Confundir directa con inversa:</strong> "Más pintores → más días pintados" parece directa, pero si la pregunta es cuántos días tardan en terminar la misma obra, es inversa. El contexto de la pregunta manda.
                </li>
                <li>
                  <strong>Olvidar las unidades y mezclarlas:</strong> Usar 2 horas y 45 minutos como "2" y "45" en la misma proporción da un resultado absurdo. Convierte primero: 2 horas = 120 minutos.
                </li>
                <li>
                  <strong>Error en la compuesta por no analizar cada magnitud:</strong> Si tienes 3 magnitudes y clasificas mal una sola, el resultado puede ser hasta 100 veces mayor o menor del correcto. Analiza magnitud a magnitud.
                </li>
                <li>
                  <strong>Dividir entre cero:</strong> Si A = 0 o C = 0, la proporción es indefinida. Verifica que ningún valor conocido sea cero antes de calcular.
                </li>
                <li>
                  <strong>No verificar el resultado:</strong> Sustituyendo X en la proporción original puedes detectar cualquier error de cálculo en segundos. Sáltarte este paso es el error más habitual en exámenes.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-regla-de-tres')} />

      <ShareCard appName="calculadora-regla-de-tres" />
      <Footer appName="calculadora-regla-de-tres" />
    </div>
  );
}
