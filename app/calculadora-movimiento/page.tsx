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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-movimiento')} />

      <ShareCard appName="calculadora-movimiento" />
      <Footer appName="calculadora-movimiento" />
    </div>
  );
}
