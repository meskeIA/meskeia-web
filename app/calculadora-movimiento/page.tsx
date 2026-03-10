'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraMovimiento.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TipoMovimiento = 'mru' | 'mrua' | 'caida' | 'parabolico';

interface ResultadoMRU {
  tipo: 'mru';
  velocidad: number;
  distancia: number;
  tiempo: number;
}

interface ResultadoMRUA {
  tipo: 'mrua';
  velocidadFinal: number;
  distancia: number;
  aceleracion: number;
  tiempo: number;
}

interface ResultadoCaida {
  tipo: 'caida';
  velocidadFinal: number;
  altura: number;
  tiempo: number;
}

interface ResultadoParabolico {
  tipo: 'parabolico';
  alturaMaxima: number;
  alcance: number;
  tiempoVuelo: number;
  velocidadX: number;
  velocidadY: number;
}

type Resultado = ResultadoMRU | ResultadoMRUA | ResultadoCaida | ResultadoParabolico | null;

const G = 9.81; // Gravedad m/s²

const EJEMPLOS = [
  { nombre: '⚽ Pelota lanzada', tipo: 'parabolico' as TipoMovimiento, v0: '20', angulo: '45', t: '4' },
  { nombre: '🚗 Coche frenando', tipo: 'mrua' as TipoMovimiento, v0: '30', a: '-5', t: '6' },
  { nombre: '🚀 Cohete acelerando', tipo: 'mrua' as TipoMovimiento, v0: '0', a: '15', t: '10' },
  { nombre: '📦 Objeto en caída', tipo: 'caida' as TipoMovimiento, v0: '0', h: '100', t: '4.5' },
];

export default function CalculadoraMovimientoPage() {
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('mru');
  const [velocidadInicial, setVelocidadInicial] = useState('10');
  const [aceleracion, setAceleracion] = useState('2');
  const [tiempo, setTiempo] = useState('5');
  const [angulo, setAngulo] = useState('45');
  const [altura, setAltura] = useState('50');

  // Calcular resultados
  const resultado: Resultado = useMemo(() => {
    const v0 = parseSpanishNumber(velocidadInicial);
    const a = parseSpanishNumber(aceleracion);
    const t = parseSpanishNumber(tiempo);
    const ang = parseSpanishNumber(angulo);
    const h = parseSpanishNumber(altura);

    if (isNaN(t) || t <= 0) return null;

    switch (tipoMovimiento) {
      case 'mru': {
        if (isNaN(v0)) return null;
        const distancia = v0 * t;
        return {
          tipo: 'mru',
          velocidad: v0,
          distancia,
          tiempo: t
        };
      }

      case 'mrua': {
        if (isNaN(v0) || isNaN(a)) return null;
        const vf = v0 + a * t;
        const d = v0 * t + 0.5 * a * t * t;
        return {
          tipo: 'mrua',
          velocidadFinal: vf,
          distancia: d,
          aceleracion: a,
          tiempo: t
        };
      }

      case 'caida': {
        if (isNaN(v0)) return null;
        // Caída libre (v0 hacia abajo positiva o 0)
        const vf = v0 + G * t;
        const hCaida = v0 * t + 0.5 * G * t * t;
        return {
          tipo: 'caida',
          velocidadFinal: vf,
          altura: hCaida,
          tiempo: t
        };
      }

      case 'parabolico': {
        if (isNaN(v0) || isNaN(ang)) return null;
        const angRad = ang * Math.PI / 180;
        const vx = v0 * Math.cos(angRad);
        const vy = v0 * Math.sin(angRad);

        const tSubida = vy / G;
        const tVuelo = 2 * tSubida;
        const hMax = (vy * vy) / (2 * G);
        const alcance = vx * tVuelo;

        return {
          tipo: 'parabolico',
          alturaMaxima: hMax,
          alcance,
          tiempoVuelo: tVuelo,
          velocidadX: vx,
          velocidadY: vy
        };
      }

      default:
        return null;
    }
  }, [tipoMovimiento, velocidadInicial, aceleracion, tiempo, angulo, altura]);

  // Cargar ejemplo
  const cargarEjemplo = (ejemplo: typeof EJEMPLOS[0]) => {
    setTipoMovimiento(ejemplo.tipo);
    setVelocidadInicial(ejemplo.v0);
    if (ejemplo.a) setAceleracion(ejemplo.a);
    if (ejemplo.t) setTiempo(ejemplo.t);
    if (ejemplo.angulo) setAngulo(ejemplo.angulo);
    if (ejemplo.h) setAltura(ejemplo.h);
  };

  // Obtener fórmulas según tipo
  const getFormulas = () => {
    switch (tipoMovimiento) {
      case 'mru':
        return ['d = v × t', 'v = d / t', 't = d / v'];
      case 'mrua':
        return ['v = v₀ + a × t', 'd = v₀ × t + ½ × a × t²', 'v² = v₀² + 2 × a × d'];
      case 'caida':
        return ['v = v₀ + g × t', 'h = v₀ × t + ½ × g × t²', 'v² = v₀² + 2 × g × h'];
      case 'parabolico':
        return ['vₓ = v₀ × cos(θ)', 'vᵧ = v₀ × sin(θ)', 'H = vᵧ² / (2g)', 'R = vₓ × T'];
      default:
        return [];
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🚀 Calculadora de Movimiento</h1>
        <p className={styles.subtitle}>
          Cinemática: MRU, MRUA, Caída Libre y Tiro Parabólico
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Movimiento</h2>

          <div className={styles.tiposGrid}>
            <button
              className={`${styles.tipoBtn} ${tipoMovimiento === 'mru' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('mru')}
            >
              <span className={styles.tipoIcono}>→</span>
              <span className={styles.tipoNombre}>MRU</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoMovimiento === 'mrua' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('mrua')}
            >
              <span className={styles.tipoIcono}>⟶</span>
              <span className={styles.tipoNombre}>MRUA</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoMovimiento === 'caida' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('caida')}
            >
              <span className={styles.tipoIcono}>↓</span>
              <span className={styles.tipoNombre}>Caída</span>
            </button>
            <button
              className={`${styles.tipoBtn} ${tipoMovimiento === 'parabolico' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('parabolico')}
            >
              <span className={styles.tipoIcono}>↗</span>
              <span className={styles.tipoNombre}>Parabólico</span>
            </button>
          </div>

          {/* Inputs dinámicos */}
          <div className={styles.inputsSection}>
            <h3 className={styles.sectionTitle}>Parámetros</h3>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Velocidad Inicial (v₀)</label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={velocidadInicial}
                  onChange={(e) => setVelocidadInicial(e.target.value)}
                  className={styles.input}
                  placeholder="10"
                />
                <span className={styles.unit}>m/s</span>
              </div>
            </div>

            {(tipoMovimiento === 'mrua') && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Aceleración (a)</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={aceleracion}
                    onChange={(e) => setAceleracion(e.target.value)}
                    className={styles.input}
                    placeholder="2"
                  />
                  <span className={styles.unit}>m/s²</span>
                </div>
              </div>
            )}

            {tipoMovimiento === 'parabolico' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Ángulo de lanzamiento (θ)</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={angulo}
                    onChange={(e) => setAngulo(e.target.value)}
                    className={styles.input}
                    placeholder="45"
                  />
                  <span className={styles.unit}>°</span>
                </div>
              </div>
            )}

            {tipoMovimiento !== 'parabolico' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tiempo (t)</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    value={tiempo}
                    onChange={(e) => setTiempo(e.target.value)}
                    className={styles.input}
                    placeholder="5"
                  />
                  <span className={styles.unit}>s</span>
                </div>
              </div>
            )}

            {tipoMovimiento === 'caida' && (
              <div className={styles.infoBox}>
                <p>g = {formatNumber(G, 2)} m/s² (gravedad)</p>
              </div>
            )}
          </div>

          {/* Ejemplos */}
          <div className={styles.ejemplosSection}>
            <h3 className={styles.sectionTitle}>Ejemplos Rápidos</h3>
            <div className={styles.ejemplosGrid}>
              {EJEMPLOS.map((ej, idx) => (
                <button
                  key={idx}
                  className={styles.ejemploBtn}
                  onClick={() => cargarEjemplo(ej)}
                >
                  {ej.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {resultado ? (
            <>
              <div className={styles.resultsGrid}>
                {resultado.tipo === 'mru' && (
                  <>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Velocidad</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.velocidad, 2)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Distancia</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.distancia, 2)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Tiempo</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.tiempo, 2)}</span>
                      <span className={styles.resultUnit}>s</span>
                    </div>
                  </>
                )}

                {resultado.tipo === 'mrua' && (
                  <>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Velocidad Final</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.velocidadFinal, 2)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Distancia</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.distancia, 2)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Aceleración</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.aceleracion, 2)}</span>
                      <span className={styles.resultUnit}>m/s²</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Tiempo</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.tiempo, 2)}</span>
                      <span className={styles.resultUnit}>s</span>
                    </div>
                  </>
                )}

                {resultado.tipo === 'caida' && (
                  <>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Velocidad Final</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.velocidadFinal, 2)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Altura recorrida</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.altura, 2)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Tiempo</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.tiempo, 2)}</span>
                      <span className={styles.resultUnit}>s</span>
                    </div>
                  </>
                )}

                {resultado.tipo === 'parabolico' && (
                  <>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Altura Máxima</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.alturaMaxima, 2)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Alcance</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.alcance, 2)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Tiempo de Vuelo</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.tiempoVuelo, 2)}</span>
                      <span className={styles.resultUnit}>s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Velocidad X</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.velocidadX, 2)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Velocidad Y inicial</span>
                      <span className={styles.resultValue}>{formatNumber(resultado.velocidadY, 2)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                  </>
                )}
              </div>

              {/* Fórmulas utilizadas */}
              <div className={styles.formulasSection}>
                <h3>Fórmulas Utilizadas</h3>
                <div className={styles.formulasGrid}>
                  {getFormulas().map((f, i) => (
                    <div key={i} className={styles.formulaBox}>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📐</span>
              <p>Ingresa los parámetros para calcular</p>
            </div>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre Cinemática?"
        subtitle="Descubre los tipos de movimiento, fórmulas clave y ejemplos prácticos"
      >
        <section className={styles.guideSection}>
          <h2>Tipos de Movimiento en Física</h2>
          <p className={styles.introParagraph}>
            La cinemática es la rama de la física que estudia el movimiento de los cuerpos sin considerar
            las causas que lo producen. Los principales tipos de movimiento son el rectilíneo uniforme,
            el uniformemente acelerado, la caída libre y el tiro parabólico.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>MRU - Movimiento Rectilíneo Uniforme</h4>
              <p>
                Movimiento en línea recta con velocidad constante. No hay aceleración.
                d = v × t. Ejemplo: un tren a velocidad constante.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>MRUA - Mov. Rectilíneo Uniformemente Acelerado</h4>
              <p>
                Movimiento con aceleración constante. La velocidad cambia uniformemente.
                v = v₀ + a×t. Ejemplo: un coche acelerando.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Caída Libre</h4>
              <p>
                Caso especial de MRUA donde a = g = 9,81 m/s².
                Solo actúa la gravedad (sin resistencia del aire).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Tiro Parabólico</h4>
              <p>
                Combinación de MRU horizontal y caída libre vertical.
                La trayectoria es una parábola. Alcance máximo a 45°.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2>⚖️ Tabla Comparativa de Tipos de Movimiento</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>MRU</th>
                  <th>MRUA</th>
                  <th>Caída Libre</th>
                  <th>Tiro Parabólico</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Velocidad</strong></td>
                  <td>Constante</td>
                  <td>Variable (aumenta o disminuye)</td>
                  <td>Aumenta hacia abajo</td>
                  <td>Vx constante, Vy variable</td>
                </tr>
                <tr>
                  <td><strong>Aceleración</strong></td>
                  <td>a = 0</td>
                  <td>a = cte ≠ 0</td>
                  <td>a = g = 9,81 m/s²</td>
                  <td>ax = 0, ay = g</td>
                </tr>
                <tr>
                  <td><strong>Fórmula principal</strong></td>
                  <td>d = v × t</td>
                  <td>v = v₀ + a·t</td>
                  <td>h = ½·g·t²</td>
                  <td>R = v₀²·sin(2θ) / g</td>
                </tr>
                <tr>
                  <td><strong>Trayectoria</strong></td>
                  <td>Línea recta</td>
                  <td>Línea recta</td>
                  <td>Línea recta (vertical)</td>
                  <td>Parábola</td>
                </tr>
                <tr>
                  <td><strong>Ejemplo real</strong></td>
                  <td>Tren en autopista</td>
                  <td>Coche frenando</td>
                  <td>Piedra cayendo al vacío</td>
                  <td>Balón de fútbol lanzado</td>
                </tr>
                <tr>
                  <td><strong>Gravedad involucrada</strong></td>
                  <td>No</td>
                  <td>Solo si es vertical</td>
                  <td>Sí (g en vertical)</td>
                  <td>Sí (g en componente Y)</td>
                </tr>
                <tr>
                  <td><strong>Dificultad de cálculo</strong></td>
                  <td>⭐ Baja</td>
                  <td>⭐⭐ Media</td>
                  <td>⭐⭐ Media</td>
                  <td>⭐⭐⭐ Alta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2>💼 Casos de Uso Prácticos</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🎓</span>
                <h4>Estudiante de Bachillerato</h4>
              </div>
              <p>En la PAU, el <strong>MRUA</strong> y el <strong>tiro parabólico</strong> acumulan más del 60 % de los problemas de cinemática. El MRU suele aparecer como paso previo o condición inicial.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo tipo examen:</strong> Un coche parte del reposo y acelera a 3 m/s² durante 8 s. ¿Qué distancia recorre? → d = ½·a·t² = ½·3·64 = <strong>96 m</strong>
              </div>
              <p className={styles.escenarioTip}>💡 Tip: practica identificar el tipo de movimiento antes de buscar la fórmula.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🏋️</span>
                <h4>Deportista / Entrenador</h4>
              </div>
              <p>El <strong>tiro parabólico</strong> explica el vuelo de un balón. Con ángulo de 45° se maximiza el alcance horizontal. Reducir el ángulo aumenta la velocidad horizontal a costa de menos altura.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Un jugador lanza a 15 m/s y 30°. Alcance = v₀²·sin(60°)/g = 225·0,866/9,81 ≈ <strong>19,87 m</strong>
              </div>
              <p className={styles.escenarioTip}>💡 Tip: para un pase rasante, usa ángulos entre 15° y 25°.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🔬</span>
                <h4>Laboratorio de Física</h4>
              </div>
              <p>La <strong>caída libre</strong> es el experimento más sencillo para medir g. Se suelta un objeto desde una altura conocida y se mide el tiempo con un cronómetro o sensor.</p>
              <div className={styles.escenarioExample}>
                <strong>Verificar g:</strong> Sueltas una bola desde h = 1,5 m. Mides t = 0,553 s. → g = 2·h/t² = 2·1,5/0,306 ≈ <strong>9,80 m/s²</strong>
              </div>
              <p className={styles.escenarioTip}>💡 Tip: repite el experimento 5 veces y promedia para reducir error.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🚗</span>
                <h4>Conducción y Seguridad Vial</h4>
              </div>
              <p>El frenado de un coche es <strong>MRUA con a negativa</strong>. La distancia de frenado depende del cuadrado de la velocidad: duplicar la velocidad cuadruplica la distancia.</p>
              <div className={styles.escenarioExample}>
                <strong>A 120 km/h (33,3 m/s) con a = −7 m/s²:</strong> d = v²/(2·|a|) = 1.111/14 ≈ <strong>79,4 m</strong> solo de frenada (sin tiempo de reacción).
              </div>
              <p className={styles.escenarioTip}>💡 Tip: añade d_reacción = v·t_reacción (≈ 0,7 s) para la distancia total de parada.</p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2>❓ Preguntas Frecuentes sobre Cinemática</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la diferencia entre velocidad y aceleración?</h4>
              <p>La <strong>velocidad</strong> indica cuánto espacio recorre un objeto por unidad de tiempo (m/s). La <strong>aceleración</strong> mide cuánto cambia esa velocidad por unidad de tiempo (m/s²). Un objeto puede ir muy rápido pero con aceleración cero (MRU), o estar casi parado pero acelerando rápidamente.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué el ángulo de 45° da el alcance máximo en tiro parabólico?</h4>
              <p>El alcance es R = v₀²·sin(2θ)/g. La función sin(2θ) tiene su valor máximo (= 1) cuando 2θ = 90°, es decir, θ = 45°. Para ese ángulo, la velocidad se reparte igual entre componente horizontal y vertical, logrando el equilibrio óptimo entre distancia y altura.</p>
              <p className={styles.faqTip}>📐 Nota: ángulos complementarios (30° y 60°) dan el mismo alcance pero distinta altura máxima.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué pasa si la aceleración es negativa en MRUA?</h4>
              <p>Una aceleración negativa (desaceleración o frenado) significa que el objeto pierde velocidad. Si la velocidad inicial es positiva y la aceleración negativa, el objeto se frena hasta detenerse (v = 0) y, si continúa la aceleración, invierte su movimiento. Ejemplo: un coche frenando a −5 m/s² desde 20 m/s se detiene en t = 20/5 = 4 s.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿La masa afecta a la caída libre? ¿Por qué?</h4>
              <p>No, en caída libre ideal (sin resistencia del aire) todos los objetos caen igual independientemente de su masa. Galileo lo demostró: la fuerza gravitacional es F = m·g, pero también F = m·a, por lo que a = g para cualquier masa. En la realidad, la resistencia del aire sí diferencia objetos según su forma y densidad.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo se calcula la distancia de frenado de un coche a 120 km/h?</h4>
              <p>Primero convierte: 120 km/h ÷ 3,6 = 33,33 m/s. Con una deceleración típica de −7 m/s²: d = v²/(2·|a|) = 33,33²/(2·7) = 1.110,9/14 ≈ <strong>79,4 m</strong>. A esto hay que sumar la distancia de reacción: d_reac = 33,33 × 0,7 s ≈ 23,3 m. Total: ≈ 102,7 m.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿En qué se diferencia la caída libre del tiro parabólico?</h4>
              <p>En la <strong>caída libre</strong> el objeto solo tiene movimiento vertical (v₀ horizontal = 0). En el <strong>tiro parabólico</strong> hay además una velocidad horizontal inicial que se mantiene constante durante todo el vuelo. El resultado es una trayectoria curva (parábola) en lugar de una línea vertical.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo convierto km/h a m/s?</h4>
              <p>Divide entre 3,6: m/s = km/h ÷ 3,6. La razón: 1 km = 1.000 m y 1 h = 3.600 s, por tanto 1 km/h = 1.000/3.600 m/s = 1/3,6 m/s. Ejemplos: 36 km/h → 10 m/s, 90 km/h → 25 m/s, 120 km/h → 33,33 m/s.</p>
              <p className={styles.faqTip}>📐 Inverso: m/s × 3,6 = km/h.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué errores son más frecuentes en los problemas de cinemática?</h4>
              <p>Los cinco fallos más comunes son: (1) no convertir unidades al SI antes de calcular, (2) olvidar el signo negativo en desaceleraciones, (3) confundir distancia con desplazamiento en MRUA, (4) no descomponer la velocidad inicial en tiro parabólico, y (5) usar g = 10 cuando el enunciado no lo especifica.</p>
            </div>
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2>📋 Cómo Resolver un Problema de Cinemática: 7 Pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Identifica el tipo de movimiento</strong>
                <p>¿Hay aceleración? ¿Actúa la gravedad? ¿El movimiento es horizontal, vertical o en ambas direcciones? Responder estas preguntas determina el modelo a usar (MRU, MRUA, caída libre o tiro parabólico).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Lista los datos conocidos con unidades</strong>
                <p>Escribe explícitamente cada dato: v₀ = 20 m/s, θ = 30°, g = 9,81 m/s². Esto evita errores de sustitución y te muestra qué incógnita queda por despejar.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Convierte unidades si es necesario</strong>
                <p>Todo debe estar en el Sistema Internacional: metros (m), segundos (s) y m/s². Si el enunciado da km/h, divide entre 3,6. Si da minutos, multiplica por 60 para obtener segundos.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Elige la fórmula apropiada</strong>
                <p>Selecciona la ecuación que relacione los datos conocidos con la incógnita. En MRUA tienes tres ecuaciones; elige la que no incluya la variable que desconoces y no necesitas.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Despeja la incógnita</strong>
                <p>Manipula la ecuación algebraicamente antes de sustituir números. Despejar primero reduce errores aritméticos y permite verificar la dimensión del resultado.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Sustituye y calcula</strong>
                <p>Introduce los valores numéricos en la expresión ya despejada. Opera con cuidado con los signos negativos (deceleraciones, caídas hacia arriba) y los ángulos en radianes si usas calculadora científica.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div className={styles.stepContent}>
                <strong>Verifica el resultado</strong>
                <p>¿Tiene sentido físico? Una distancia negativa, un tiempo imaginario o una velocidad mayor que la de la luz indican un error. Comprueba también las unidades: el resultado debe tener las mismas dimensiones que la magnitud pedida.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Sección 5: Mejores Prácticas */}
        <section className={styles.guideSection}>
          <h2>✅ Mejores Prácticas para Estudiantes de Física</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✏️</span>
              <h4>Dibuja un esquema primero</h4>
              <p>Antes de cualquier cálculo, traza un diagrama con los vectores de velocidad, aceleración y la trayectoria. El dibujo aclara el sistema de referencia y los signos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📏</span>
              <h4>Todo en SI (metros, segundos, m/s²)</h4>
              <p>Convierte <em>todos</em> los datos al Sistema Internacional antes de operar. Mezclar km/h con m/s en la misma ecuación es el error más frecuente y más costoso en puntos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔍</span>
              <h4>MRU: sin aceleración implícita</h4>
              <p>Si el enunciado no menciona aceleración ni cambio de velocidad, asume MRU. No inventes datos. La sencillez del problema es una señal, no una trampa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>±</span>
              <h4>Define positivo y negativo antes de empezar</h4>
              <p>Elige un eje positivo (por ejemplo, hacia arriba o hacia la derecha) y mantén la convención durante todo el problema. La aceleración de frenado siempre es negativa si la velocidad es positiva.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>⬇️</span>
              <h4>Caída libre: g = 9,81 m/s² siempre hacia abajo</h4>
              <p>La gravedad actúa en el sentido negativo del eje Y (hacia abajo). En la fórmula h = ½·g·t², g ya incluye la dirección. No pongas g negativa si ya has definido positivo hacia abajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>↗️</span>
              <h4>Tiro parabólico: descompón siempre v₀</h4>
              <p>Nunca uses v₀ directamente en las ecuaciones del tiro parabólico. Siempre descompón: Vx = v₀·cos(θ) y Vy = v₀·sin(θ). Las ecuaciones horizontales y verticales se resuelven por separado.</p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Errores Conceptuales que Cuestan Puntos en el Examen</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir velocidad media con velocidad instantánea.</strong> La velocidad media es v_m = Δx/Δt para todo el trayecto; la instantánea es el valor en un instante concreto. En MRUA solo coinciden si el intervalo es infinitesimalmente pequeño.
              </li>
              <li>
                <strong>Olvidar que en tiro parabólico Vx es constante.</strong> La componente horizontal de la velocidad NO cambia durante el vuelo (no hay aceleración horizontal). Solo Vy varía por efecto de la gravedad.
              </li>
              <li>
                <strong>No descomponer la velocidad inicial en el tiro parabólico.</strong> Usar v₀ directamente en las ecuaciones verticales u horizontales es incorrecto. Siempre Vx = v₀·cos(θ) y Vy₀ = v₀·sin(θ).
              </li>
              <li>
                <strong>Usar g = 10 sin que el enunciado lo indique.</strong> El valor oficial es g = 9,81 m/s². Usar 10 puede introducir errores de hasta un 2 % que se penalizan. Solo usa g = 10 si el enunciado lo autoriza explícitamente.
              </li>
              <li>
                <strong>Confundir distancia recorrida con desplazamiento en MRUA.</strong> Si un objeto frena, para y retrocede, la distancia total recorrida es mayor que el desplazamiento neto. La fórmula d = v₀·t + ½·a·t² da el desplazamiento, no la distancia total.
              </li>
              <li>
                <strong>No considerar el signo negativo de la aceleración en frenadas.</strong> En un coche que frena, la aceleración es negativa (opuesta al movimiento). Si olvidas el signo, la fórmula dará una distancia de frenado mayor que la real.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-movimiento')} />

      <ShareCard appName="calculadora-movimiento" />
      <Footer appName="calculadora-movimiento" />
    </div>
  );
}
