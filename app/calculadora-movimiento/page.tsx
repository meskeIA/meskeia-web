'use client';

import { useState, useMemo } from 'react';
import styles from './CalculadoraMovimiento.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard, DisclaimerCard } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { redondearA } from '@/lib/calculadoras/correctorCasosAula';
import { G, resolverRectilineo, resolverParabolico, type ResultadoRectilineo, type ResultadoParabolico } from './motor';
import SimuladorCinematica from './SimuladorCinematica';
import CasosAula from './CasosAula';
import { PREGUNTAS_FRECUENTES } from './metadata';

type TipoMovimiento = 'mru' | 'mrua' | 'caida' | 'parabolico';

/** MRU, MRUA y caída libre comparten motor: son el mismo movimiento con a = 0, a o g. */
interface ResultadoLineal extends ResultadoRectilineo {
  tipo: 'mru' | 'mrua' | 'caida';
  v0: number;
  aceleracion: number;
  tiempo: number;
}

type Resultado = ResultadoLineal | (ResultadoParabolico & { tipo: 'parabolico' }) | null;

/**
 * Cifra de resultado con 2 decimales. Pasa por `redondearA`, que limpia la coma flotante antes de
 * redondear: ½·9,81·3² llega como 44,14499… y Intl lo dejaba en 44,14, cuando a mano es 44,145 →
 * 44,15; con t = 1, 5 o 7 el mismo empate sí subía (hallazgo 3946).
 */
function cifra(valor: number): string {
  return formatNumber(redondearA(valor, 2), 2);
}

// El icono va aparte del nombre para pintarlo con aria-hidden: dentro del texto del botón, el
// lector lo leía como parte del nombre («balón de fútbol, Pelota lanzada», hallazgo 3955).
const EJEMPLOS = [
  { icono: '⚽', nombre: 'Pelota lanzada', tipo: 'parabolico' as TipoMovimiento, v0: '20', angulo: '45', t: '4' },
  { icono: '🚗', nombre: 'Coche frenando', tipo: 'mrua' as TipoMovimiento, v0: '30', a: '-5', t: '6' },
  { icono: '↩️', nombre: 'Frena y da la vuelta', tipo: 'mrua' as TipoMovimiento, v0: '20', a: '-5', t: '6' },
  { icono: '🚀', nombre: 'Cohete acelerando', tipo: 'mrua' as TipoMovimiento, v0: '0', a: '15', t: '10' },
  { icono: '📦', nombre: 'Objeto en caída', tipo: 'caida' as TipoMovimiento, v0: '0', t: '4,5' },
  { icono: '🏀', nombre: 'Lanzado hacia arriba', tipo: 'caida' as TipoMovimiento, v0: '-10', t: '3' },
];

export default function CalculadoraMovimientoPage() {
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('mru');
  const [velocidadInicial, setVelocidadInicial] = useState('10');
  const [aceleracion, setAceleracion] = useState('2');
  const [tiempo, setTiempo] = useState('5');
  const [angulo, setAngulo] = useState('45');

  // Calcular resultados
  const resultado: Resultado = useMemo(() => {
    const v0 = parseSpanishNumber(velocidadInicial);
    const a = parseSpanishNumber(aceleracion);
    const t = parseSpanishNumber(tiempo);
    const ang = parseSpanishNumber(angulo);

    if (tipoMovimiento === 'parabolico') {
      // El tiempo no interviene: el vuelo dura lo que dicta el ángulo
      if (isNaN(v0) || isNaN(ang) || v0 <= 0 || ang <= 0 || ang >= 90) return null;
      return { tipo: 'parabolico', ...resolverParabolico(v0, ang) };
    }

    if (isNaN(t) || t <= 0 || isNaN(v0)) return null;
    const acel = tipoMovimiento === 'mru' ? 0 : tipoMovimiento === 'caida' ? G : a;
    if (isNaN(acel)) return null;
    return {
      tipo: tipoMovimiento,
      v0,
      aceleracion: acel,
      tiempo: t,
      ...resolverRectilineo({ v0, a: acel }, t),
    };
  }, [tipoMovimiento, velocidadInicial, aceleracion, tiempo, angulo]);

  // Sin cifra, el aviso nombra lo que falta: en el MRUA con la aceleración vacía pedía la
  // velocidad y el tiempo, que ya estaban puestos (hallazgo 3954).
  const avisoSinCifra = (() => {
    if (tipoMovimiento === 'parabolico') return 'Introduce una velocidad mayor que 0 y un ángulo entre 0° y 90°';
    const faltaAceleracion = tipoMovimiento === 'mrua' && isNaN(parseSpanishNumber(aceleracion));
    const v0 = parseSpanishNumber(velocidadInicial);
    const t = parseSpanishNumber(tiempo);
    const faltaBase = isNaN(v0) || isNaN(t) || t <= 0;
    if (!faltaAceleracion) return 'Introduce la velocidad inicial y un tiempo mayor que 0';
    return faltaBase
      ? 'Introduce la velocidad inicial, la aceleración y un tiempo mayor que 0'
      : 'Introduce la aceleración (negativa si el móvil frena)';
  })();

  // Cargar ejemplo
  const cargarEjemplo = (ejemplo: typeof EJEMPLOS[0]) => {
    setTipoMovimiento(ejemplo.tipo);
    setVelocidadInicial(ejemplo.v0);
    if (ejemplo.a) setAceleracion(ejemplo.a);
    if (ejemplo.t) setTiempo(ejemplo.t);
    if (ejemplo.angulo) setAngulo(ejemplo.angulo);
  };

  // Obtener fórmulas según tipo
  const getFormulas = () => {
    switch (tipoMovimiento) {
      case 'mru':
        return ['x = v × t', 'v = x / t', 't = x / v'];
      case 'mrua':
        return ['v = v₀ + a × t', 'x = v₀ × t + ½ × a × t²', 'v² = v₀² + 2 × a × x', 't parada = −v₀ / a'];
      case 'caida':
        return ['v = v₀ + g × t', 'y = v₀ × t + ½ × g × t²', 'v² = v₀² + 2 × g × y'];
      case 'parabolico':
        return ['vₓ = v₀ × cos(θ)', 'vᵧ = v₀ × sin(θ)', 'T = 2 × vᵧ / g', 'H = vᵧ² / (2g)', 'R = vₓ × T'];
      default:
        return [];
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🚀</span> Calculadora y simulador de MRU y MRUA</h1>
        <p className={styles.subtitle}>
          Cinemática con el móvil animado y sus gráficas x-t, v-t y a-t en el MRU, el MRUA (MRUV)
          y la caída libre, y alcance, altura y tiempo de vuelo del tiro parabólico
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-movimiento" />

      <div className={styles.mainContent}>
        {/* Panel de configuración */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Tipo de Movimiento</h2>

          <div className={styles.tiposGrid}>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipoMovimiento === 'mru' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('mru')}
              aria-pressed={tipoMovimiento === 'mru'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">→</span>
              <span className={styles.tipoNombre}>MRU</span>
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipoMovimiento === 'mrua' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('mrua')}
              aria-pressed={tipoMovimiento === 'mrua'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">⟶</span>
              <span className={styles.tipoNombre}>MRUA</span>
              <span className={styles.tipoAlias}>o MRUV</span>
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipoMovimiento === 'caida' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('caida')}
              aria-pressed={tipoMovimiento === 'caida'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">↓</span>
              <span className={styles.tipoNombre}>Caída</span>
            </button>
            <button
              type="button"
              className={`${styles.tipoBtn} ${tipoMovimiento === 'parabolico' ? styles.tipoActivo : ''}`}
              onClick={() => setTipoMovimiento('parabolico')}
              aria-pressed={tipoMovimiento === 'parabolico'}
            >
              <span className={styles.tipoIcono} aria-hidden="true">↗</span>
              <span className={styles.tipoNombre}>Parabólico</span>
            </button>
          </div>

          {/* Inputs dinámicos */}
          <div className={styles.inputsSection}>
            <h3 className={styles.sectionTitle}>Parámetros</h3>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="mov-v0">Velocidad Inicial (v₀)</label>
              <div className={styles.inputWrapper}>
                <input
                  id="mov-v0"
                  type="text"
                  inputMode="decimal"
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
                <label className={styles.label} htmlFor="mov-a">Aceleración (a)</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="mov-a"
                    type="text"
                    inputMode="decimal"
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
                <label className={styles.label} htmlFor="mov-angulo">Ángulo de lanzamiento (θ)</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="mov-angulo"
                    type="text"
                    inputMode="decimal"
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
                <label className={styles.label} htmlFor="mov-t">Tiempo (t)</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="mov-t"
                    type="text"
                    inputMode="decimal"
                    value={tiempo}
                    onChange={(e) => setTiempo(e.target.value)}
                    className={styles.input}
                    placeholder="5"
                  />
                  <span className={styles.unit}>s</span>
                </div>
              </div>
            )}

            {tipoMovimiento === 'mrua' && (
              <div className={styles.infoBox}>
                <p>Una aceleración negativa con velocidad positiva es un frenado: si dura lo bastante, el móvil se para y da la vuelta.</p>
              </div>
            )}

            {tipoMovimiento === 'caida' && (
              <div className={styles.infoBox}>
                <p>g = {formatNumber(G, 2)} m/s² (gravedad), con el eje positivo hacia abajo: una v₀ negativa es lanzar hacia arriba.</p>
              </div>
            )}
          </div>

          {/* Ejemplos */}
          <div className={styles.ejemplosSection}>
            <h3 className={styles.sectionTitle}>Ejemplos Rápidos</h3>
            <div className={styles.ejemplosGrid}>
              {EJEMPLOS.map((ej, idx) => (
                <button
                  type="button"
                  key={idx}
                  className={styles.ejemploBtn}
                  onClick={() => cargarEjemplo(ej)}
                >
                  <span aria-hidden="true">{ej.icono}</span> {ej.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel} role="status" aria-live="polite" aria-atomic="false">
          <h2 className={styles.sectionTitle}>Resultados</h2>

          {resultado ? (
            <>
              <div className={styles.resultsGrid}>
                {resultado.tipo !== 'parabolico' && (
                  <>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>
                        {resultado.tipo === 'mru' ? 'Velocidad' : 'Velocidad final'}
                      </span>
                      <span className={styles.resultValue}>{cifra(resultado.velocidadFinal)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>
                        {resultado.tipo === 'caida' ? 'Desplazamiento vertical (y)' : 'Desplazamiento (x)'}
                      </span>
                      <span className={styles.resultValue}>{cifra(resultado.desplazamiento)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Distancia recorrida</span>
                      <span className={styles.resultValue}>{cifra(resultado.distancia)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    {resultado.tipo !== 'mru' && (
                      <div className={styles.resultCard}>
                        <span className={styles.resultLabel}>Aceleración</span>
                        <span className={styles.resultValue}>{cifra(resultado.aceleracion)}</span>
                        <span className={styles.resultUnit}>m/s²</span>
                      </div>
                    )}
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Tiempo</span>
                      <span className={styles.resultValue}>{cifra(resultado.tiempo)}</span>
                      <span className={styles.resultUnit}>s</span>
                    </div>
                  </>
                )}

                {resultado.tipo === 'parabolico' && (
                  <>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Altura Máxima</span>
                      <span className={styles.resultValue}>{cifra(resultado.alturaMaxima)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Alcance</span>
                      <span className={styles.resultValue}>{cifra(resultado.alcance)}</span>
                      <span className={styles.resultUnit}>m</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Tiempo de Vuelo</span>
                      <span className={styles.resultValue}>{cifra(resultado.tiempoVuelo)}</span>
                      <span className={styles.resultUnit}>s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Velocidad X</span>
                      <span className={styles.resultValue}>{cifra(resultado.velocidadX)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                    <div className={styles.resultCard}>
                      <span className={styles.resultLabel}>Velocidad Y inicial</span>
                      <span className={styles.resultValue}>{cifra(resultado.velocidadY)}</span>
                      <span className={styles.resultUnit}>m/s</span>
                    </div>
                  </>
                )}
              </div>

              {resultado.tipo !== 'parabolico' && resultado.tParada !== null && resultado.xParada !== null && (
                <p className={styles.notaParada}>
                  Se detiene en t = {cifra(resultado.tParada)} s, a {cifra(resultado.xParada)} m
                  del origen, y vuelve: la distancia recorrida ({cifra(resultado.distancia)} m) es mayor
                  que el desplazamiento ({cifra(resultado.desplazamiento)} m).
                </p>
              )}

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
              <span className={styles.placeholderIcon} aria-hidden="true">📐</span>
              <p>{avisoSinCifra}</p>
            </div>
          )}
        </div>
      </div>

      {resultado && resultado.tipo !== 'parabolico' && (
        <SimuladorCinematica
          modo={resultado.tipo}
          v0={resultado.v0}
          a={resultado.aceleracion}
          T={resultado.tiempo}
        />
      )}

      {resultado && resultado.tipo === 'parabolico' && (
        <p className={styles.simEnlace}>
          <span aria-hidden="true">🎯</span> Para ver la trayectoria animada y comparar hasta tres
          lanzamientos con distinto ángulo o velocidad, abre el{' '}
          <a href="/simulador-proyectiles/">simulador de tiro parabólico</a>.
        </p>
      )}

      {/* Tarea asignable para clase (skill /casos-aula-meskeia) */}
      <CasosAula />

      {/* Sección educativa */}
      <EducationalSection
        title="¿Quieres aprender más sobre Cinemática?"
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

        {/* Lectura de las gráficas del simulador (S0179) */}
        <section className={styles.guideSection}>
          <h2><span aria-hidden="true">📈</span> Cómo leer las gráficas x-t, v-t y a-t</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Pendiente de x-t = velocidad</h4>
              <p>
                En el MRU la gráfica posición-tiempo es una recta: su inclinación es la velocidad.
                En el MRUA es una parábola, cada vez más inclinada si acelera y menos si frena. Donde
                la parábola alcanza su vértice, la velocidad es cero: ahí el móvil se para.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Pendiente de v-t = aceleración</h4>
              <p>
                La gráfica velocidad-tiempo del MRUA es una recta inclinada, y su pendiente es la
                aceleración. Si cruza el eje horizontal, la velocidad cambia de signo: el móvil da la
                vuelta.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Área bajo v-t = desplazamiento</h4>
              <p>
                El área entre la recta v-t y el eje horizontal es el desplazamiento: cuenta positiva
                por encima del eje y negativa por debajo. Si las sumas todas como positivas, sale la
                distancia recorrida. Con v₀ = 20 m/s y a = −5 m/s² durante 6 s: +40 m hasta pararse y
                −10 m de vuelta, desplazamiento 30 m y distancia 50 m.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>a-t es una recta horizontal</h4>
              <p>
                En todos estos movimientos la aceleración no cambia, así que su gráfica es una recta
                horizontal: en el eje (a = 0) para el MRU, por encima o por debajo para el MRUA, y a la
                altura de g en la caída libre.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 1: Tabla Comparativa */}
        <section className={styles.guideSection}>
          <h2><span aria-hidden="true">⚖️</span> Tabla Comparativa de Tipos de Movimiento</h2>
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
                  <td><span aria-hidden="true">⭐</span> Baja</td>
                  <td><span aria-hidden="true">⭐⭐</span> Media</td>
                  <td><span aria-hidden="true">⭐⭐</span> Media</td>
                  <td><span aria-hidden="true">⭐⭐⭐</span> Alta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 2: Casos de Uso Prácticos */}
        <section className={styles.guideSection}>
          <h2><span aria-hidden="true">💼</span> Casos de Uso Prácticos</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎓</span>
                <h4>Estudiante de preparatoria</h4>
              </div>
              <p>En los problemas de cinemática de un examen de admisión universitaria, el <strong>MRUA</strong> y el <strong>tiro parabólico</strong> piden más pasos, y el MRU suele aparecer como paso previo o condición inicial.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo tipo examen:</strong> Un coche parte del reposo y acelera a 3 m/s² durante 8 s. ¿Qué distancia recorre? → d = ½·a·t² = ½·3·64 = <strong>96 m</strong>
              </div>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Tip: practica identificar el tipo de movimiento antes de buscar la fórmula.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏋️</span>
                <h4>Deportista / Entrenador</h4>
              </div>
              <p>El <strong>tiro parabólico</strong> explica el vuelo de un balón. Con ángulo de 45° se maximiza el alcance horizontal. Reducir el ángulo aumenta la velocidad horizontal a costa de menos altura.</p>
              <div className={styles.escenarioExample}>
                <strong>Ejemplo:</strong> Un jugador lanza a 15 m/s y 30°. Alcance = v₀²·sin(60°)/g = 225·0,866/9,81 ≈ <strong>19,86 m</strong>
              </div>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Tip: para un pase rasante, usa ángulos entre 15° y 25°.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔬</span>
                <h4>Laboratorio de Física</h4>
              </div>
              <p>La <strong>caída libre</strong> es el experimento más sencillo para medir g. Se suelta un objeto desde una altura conocida y se mide el tiempo con un cronómetro o sensor.</p>
              <div className={styles.escenarioExample}>
                <strong>Verificar g:</strong> Sueltas una bola desde h = 1,5 m. Mides t = 0,553 s. → g = 2·h/t² = 2·1,5/0,553² = 3/0,305809 ≈ <strong>9,81 m/s²</strong> (sin redondear t² antes de dividir)
              </div>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Tip: repite el experimento 5 veces y promedia para reducir error.</p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚗</span>
                <h4>Conducción y Seguridad Vial</h4>
              </div>
              <p>El frenado de un coche es <strong>MRUA con a negativa</strong>. La distancia de frenado depende del cuadrado de la velocidad: duplicar la velocidad cuadruplica la distancia.</p>
              <div className={styles.escenarioExample}>
                <strong>A 120 km/h (33,3 m/s) con a = −7 m/s²:</strong> d = v²/(2·|a|) = 1.111/14 ≈ <strong>79,4 m</strong> solo de frenada (sin tiempo de reacción).
              </div>
              <p className={styles.escenarioTip}><span aria-hidden="true">💡</span> Tip: añade d_reacción = v·t_reacción (≈ 0,7 s) para la distancia total de parada.</p>
            </div>
          </div>
        </section>

        {/* Sección 3: FAQ Ampliado */}
        <section className={styles.guideSection}>
          <h2><span aria-hidden="true">❓</span> Preguntas Frecuentes sobre Cinemática</h2>
          <div className={styles.faqList}>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question} className={styles.faqItem}>
                <h4>{f.question}</h4>
                <p>{f.answer}</p>
                {f.nota && (
                  <p className={styles.faqTip}><span aria-hidden="true">📐</span> {f.nota}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Sección 4: Guía Paso a Paso */}
        <section className={styles.guideSection}>
          <h2><span aria-hidden="true">📋</span> Cómo Resolver un Problema de Cinemática: 7 Pasos</h2>
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
          <h2><span aria-hidden="true">✅</span> Mejores Prácticas para Estudiantes de Física</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✏️</span>
              <h4>Dibuja un esquema primero</h4>
              <p>Antes de cualquier cálculo, traza un diagrama con los vectores de velocidad, aceleración y la trayectoria. El dibujo aclara el sistema de referencia y los signos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h4>Todo en SI (metros, segundos, m/s²)</h4>
              <p>Convierte <em>todos</em> los datos al Sistema Internacional antes de operar. Mezclar km/h con m/s en la misma ecuación es el error más frecuente y más costoso en puntos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>MRU: sin aceleración implícita</h4>
              <p>Si el enunciado no menciona aceleración ni cambio de velocidad, asume MRU. No inventes datos. La sencillez del problema es una señal, no una trampa.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">±</span>
              <h4>Define positivo y negativo antes de empezar</h4>
              <p>Elige un eje positivo (por ejemplo, hacia arriba o hacia la derecha) y mantén la convención durante todo el problema. La aceleración de frenado siempre es negativa si la velocidad es positiva.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⬇️</span>
              <h4>Caída libre: g = 9,81 m/s² siempre hacia abajo</h4>
              <p>La gravedad actúa en el sentido negativo del eje Y (hacia abajo). En la fórmula h = ½·g·t², g ya incluye la dirección. No pongas g negativa si ya has definido positivo hacia abajo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">↗️</span>
              <h4>Tiro parabólico: descompón siempre v₀</h4>
              <p>Nunca uses v₀ directamente en las ecuaciones del tiro parabólico. Siempre descompón: Vx = v₀·cos(θ) y Vy = v₀·sin(θ). Las ecuaciones horizontales y verticales se resuelven por separado.</p>
            </div>
          </div>
        </section>

        {/* Sección 6: Warning Box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores Conceptuales que Cuestan Puntos en el Examen</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir velocidad media con velocidad instantánea.</strong> La velocidad media es v_m = Δx/Δt para todo el trayecto; la instantánea es el valor en un instante concreto. En el MRUA, la media de un intervalo es la instantánea en su punto medio: v_m = (v₀ + v)/2 = v(t/2), dure lo que dure el intervalo, y no coincide con la de ningún otro instante.
              </li>
              <li>
                <strong>Olvidar que en tiro parabólico Vx es constante.</strong> La componente horizontal de la velocidad NO cambia durante el vuelo (no hay aceleración horizontal). Solo Vy varía por efecto de la gravedad.
              </li>
              <li>
                <strong>No descomponer la velocidad inicial en el tiro parabólico.</strong> Usar v₀ directamente en las ecuaciones verticales u horizontales es incorrecto. Siempre Vx = v₀·cos(θ) y Vy₀ = v₀·sin(θ).
              </li>
              <li>
                <strong>Usar g = 10 sin que el enunciado lo indique.</strong> La app usa g = 9,81 m/s², el valor redondeado habitual. Usar 10 puede introducir errores de hasta un 2 % que se penalizan. Solo usa g = 10 si el enunciado lo autoriza explícitamente.
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

      <RelatedApps />

      <ShareCard appName="calculadora-movimiento" />
      <Footer appName="calculadora-movimiento" />
    </div>
  );
}
