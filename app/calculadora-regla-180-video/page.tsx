'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CalculadoraRegla180Video.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularRegla180, type ResultadoRegla180 } from '@/lib/calculadoras/videografia';

const FPS_COMUNES = [24, 25, 30, 48, 50, 60, 90, 120, 180, 240] as const;

export default function CalculadoraRegla180VideoPage() {
  const [fpsSeleccionado, setFpsSeleccionado] = useState<number>(25);
  const [fpsManual, setFpsManual] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoRegla180 | null>(null);
  const [error, setError] = useState<string>('');

  const calcular = (fps: number) => {
    if (!fps || fps <= 0 || fps > 960) {
      setError('Introduce un frame rate válido entre 1 y 960 fps');
      setResultado(null);
      return;
    }
    setError('');
    setResultado(calcularRegla180(fps));
  };

  const seleccionarFps = (fps: number) => {
    setFpsSeleccionado(fps);
    setFpsManual('');
    calcular(fps);
  };

  const handleManual = (valor: string) => {
    setFpsManual(valor);
    setFpsSeleccionado(0);
    const num = parseFloat(valor.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      calcular(num);
    } else {
      setResultado(null);
    }
  };

  // Calcular resultado inicial al montar
  const resultadoInicial: ResultadoRegla180 = calcularRegla180(25);
  const resultadoMostrado = resultado ?? resultadoInicial;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎬</span> Regla de los 180° para Vídeo</h1>
        <p className={styles.subtitle}>
          Encuentra la velocidad de obturación correcta para cualquier frame rate
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Selector de fps */}
        <section className={styles.selectorPanel}>
          <h2 className={styles.sectionTitle}>Frame rate (fps)</h2>
          <div className={styles.selectorFps}>
            {FPS_COMUNES.map(fps => (
              <button
                key={fps}
                type="button"
                onClick={() => seleccionarFps(fps)}
                className={`${styles.fpsBtn} ${fpsSeleccionado === fps ? styles.fpsBtnActive : ''}`}
                aria-pressed={fpsSeleccionado === fps}
              >
                {fps}
              </button>
            ))}
          </div>
          <div className={styles.inputManual}>
            <label htmlFor="fps-manual" className={styles.inputLabel}>
              O introduce un fps personalizado:
            </label>
            <input
              id="fps-manual"
              type="number"
              min="1"
              max="960"
              step="1"
              value={fpsManual}
              onChange={e => handleManual(e.target.value)}
              placeholder="ej. 23,976"
              className={`${styles.inputFps} ${fpsSeleccionado === 0 && fpsManual ? styles.inputFpsActive : ''}`}
              inputMode="decimal"
            />
          </div>
          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              {error}
            </div>
          )}
        </section>

        {/* Resultado principal */}
        <section className={styles.resultadoPrincipal} aria-label="Resultado de la regla de los 180°">
          <div className={styles.resultadoCard}>
            <p className={styles.resultadoLabel}>Velocidad de obturación</p>
            <p className={styles.obturadorDestacado} aria-live="polite">
              {resultadoMostrado.obturadorFormateado}
            </p>
            <p className={styles.resultadoFps}>
              Para <strong>{resultadoMostrado.fps} fps</strong>
            </p>
          </div>
          <p className={styles.descripcionResultado}>
            {resultadoMostrado.descripcion}
          </p>
        </section>

        {/* Tabla de referencia rápida */}
        <section className={styles.tablaSection}>
          <h2 className={styles.sectionTitle}>Tabla de referencia rápida</h2>
          <p className={styles.tablaSubtitulo}>
            Velocidades de obturación correctas según la regla de los 180° para todos los fps comunes
          </p>
          <div className={styles.tablaReferencia}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Frame rate (fps)</th>
                  <th scope="col">Obturador correcto</th>
                  <th scope="col">Uso habitual</th>
                </tr>
              </thead>
              <tbody>
                {[24, 25, 30, 48, 50, 60, 90, 120, 180, 240].map(fps => {
                  const res = calcularRegla180(fps);
                  const usos: Record<number, string> = {
                    24: 'Cine, plataformas streaming',
                    25: 'PAL, Europa, TV',
                    30: 'NTSC, YouTube, redes',
                    48: 'Cine HFR (The Hobbit)',
                    50: 'PAL HFR, slow 2×',
                    60: 'NTSC HFR, slow 2,4×',
                    90: 'Slow motion 3,75×',
                    120: 'Slow motion 5× / 4×',
                    180: 'Slow motion 7,5×',
                    240: 'Slow motion 10× / 8×',
                  };
                  const esFpsActual = fps === resultadoMostrado.fps;
                  return (
                    <tr key={fps} className={esFpsActual ? styles.filaActiva : ''}>
                      <td>
                        {fps} fps
                        {esFpsActual && (
                          <span className={styles.badgeActual} aria-label="seleccionado"> ◀</span>
                        )}
                      </td>
                      <td className={styles.celdaObturador}>{res.obturadorFormateado}</td>
                      <td className={styles.celdaUso}>{usos[fps] ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección educativa */}
        <EducationalSection
          title={<><span aria-hidden="true">📐</span> ¿Qué es la regla de los 180°?</>}
          subtitle="Fundamentos del motion blur cinematográfico"
        >
          <div className={styles.educativo}>
            <section className={styles.guideSection}>
              <h2>La regla de los 180°</h2>
              <p>
                La regla de los 180° establece que la velocidad de obturación debe ser
                aproximadamente el <strong>doble del frame rate</strong> (inverso del doble del fps).
                Por ejemplo, a 25 fps la velocidad correcta es 1/50 s; a 30 fps, 1/60 s.
              </p>
              <p>
                El nombre proviene del ángulo del obturador rotativo de las cámaras de cine
                analógico. Un ángulo de 180° significa que el obturador está abierto durante
                exactamente la mitad del ciclo de cada fotograma.
              </p>
            </section>

            <section className={styles.guideSection}>
              <h2>¿Por qué produce motion blur natural?</h2>
              <p>
                El ojo humano percibe el movimiento con una cierta cantidad de desenfoque
                (motion blur). Cuando la velocidad de obturación es demasiado alta
                (p. ej., 1/1000 s a 25 fps), los fotogramas quedan congelados y el movimiento
                parece artificial o &ldquo;robótico&rdquo;. Cuando es demasiado baja, los fotogramas
                se solapan demasiado y el resultado parece borroso.
              </p>
              <p>
                La regla de los 180° da el equilibrio óptimo: un motion blur que el cerebro
                asocia con movimiento real y fluido.
              </p>
            </section>

            <section className={styles.guideSection}>
              <h2>Cómo aplicarla con filtros ND</h2>
              <p>
                En exteriores con mucha luz, la velocidad 1/50 s puede sobreexponer la imagen.
                La solución no es cambiar la velocidad de obturación (romperías la regla),
                sino <strong>añadir un filtro de densidad neutra (ND)</strong>.
              </p>
              <ul className={styles.lista}>
                <li>Calcula primero la velocidad correcta según la regla de los 180°.</li>
                <li>Mide la exposición con esa velocidad.</li>
                <li>Si sobreexpone, añade ND hasta conseguir la exposición correcta
                  manteniendo la misma velocidad.</li>
                <li>Los filtros variables (VND) permiten ajustar con precisión.</li>
              </ul>
            </section>

            <section className={styles.guideSection}>
              <h2>24 fps cinematográfico vs 25 fps PAL</h2>
              <p>
                Los <strong>24 fps</strong> (más precisamente 23,976 fps) son el estándar
                histórico del cine y la distribución digital en plataformas globales.
                Producen el look &ldquo;cinematográfico&rdquo; reconocible por el espectador moderno.
                La velocidad de obturación correcta es 1/50 s (o 1/48 s para 24 exactos).
              </p>
              <p>
                Los <strong>25 fps</strong> son el estándar PAL, usado en Europa, partes de
                Asia y África para televisión y producción doméstica. La velocidad correcta
                es también 1/50 s, lo que facilita el trabajo en entornos con luz artificial
                a 50 Hz (sin efecto de flicker).
              </p>
              <div className={styles.warningBox}>
                <strong>Consejo práctico:</strong> Si grabas con luz artificial (fluorescentes,
                LED parpadeantes), usa 50 fps o 60 fps según la frecuencia eléctrica de tu
                país (50 Hz en Europa, 60 Hz en América). Así evitas el banding o flicker
                que aparece en algunos fps.
              </div>
            </section>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('calculadora-regla-180-video')} />
      <ShareCard appName="calculadora-regla-180-video" />
      <Footer appName="calculadora-regla-180-video" />
    </div>
  );
}
