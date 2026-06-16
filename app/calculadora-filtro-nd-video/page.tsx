'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './CalculadoraFiltroNdVideo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularFiltroNDVideo } from '@/lib/calculadoras/videografia';

// Velocidades de obturación comunes en fracción de segundo
const VELOCIDADES_OBTURADOR: { etiqueta: string; valor_s: number }[] = [
  { etiqueta: '1/25',   valor_s: 1 / 25   },
  { etiqueta: '1/30',   valor_s: 1 / 30   },
  { etiqueta: '1/50',   valor_s: 1 / 50   },
  { etiqueta: '1/60',   valor_s: 1 / 60   },
  { etiqueta: '1/100',  valor_s: 1 / 100  },
  { etiqueta: '1/125',  valor_s: 1 / 125  },
  { etiqueta: '1/250',  valor_s: 1 / 250  },
  { etiqueta: '1/500',  valor_s: 1 / 500  },
  { etiqueta: '1/1000', valor_s: 1 / 1000 },
  { etiqueta: '1/2000', valor_s: 1 / 2000 },
];

const FPS_PRESETS = [24, 25, 30, 50, 60];

export default function CalculadoraFiltroNdVideoPage() {
  const [fps, setFps] = useState<number>(25);
  const [fpsManual, setFpsManual] = useState<string>('');
  const [usarFpsManual, setUsarFpsManual] = useState(false);
  const [obturadorActualS, setObturadorActualS] = useState<number>(1 / 250);
  const [obturadorEtiqueta, setObturadorEtiqueta] = useState<string>('1/250');

  const fpsEfectivo = usarFpsManual
    ? Math.max(1, Math.min(1000, parseInt(fpsManual) || 25))
    : fps;

  const resultado = useMemo(
    () => calcularFiltroNDVideo(fpsEfectivo, obturadorActualS),
    [fpsEfectivo, obturadorActualS],
  );

  const handleFpsPreset = (valor: number) => {
    setUsarFpsManual(false);
    setFps(valor);
  };

  const handleFpsManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFpsManual(e.target.value);
    setUsarFpsManual(true);
  };

  const handleObturadorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const etiqueta = e.target.value;
    const encontrado = VELOCIDADES_OBTURADOR.find(v => v.etiqueta === etiqueta);
    if (encontrado) {
      setObturadorActualS(encontrado.valor_s);
      setObturadorEtiqueta(etiqueta);
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎬</span> Calculadora de Filtro ND para Vídeo</h1>
        <p className={styles.subtitle}>
          Encuentra el filtro de densidad neutra necesario para cumplir la regla de los 180°
        </p>
      </header>

      <LegalNotice />

      {/* Panel de inputs */}
      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>

          {/* Frame rate */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Frame rate (fps)</legend>
            <div className={styles.presetBtns} role="group" aria-label="Frame rates comunes">
              {FPS_PRESETS.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFpsPreset(f)}
                  className={`${styles.presetBtn} ${!usarFpsManual && fps === f ? styles.presetBtnActive : ''}`}
                  aria-pressed={!usarFpsManual && fps === f}
                >
                  {f} fps
                </button>
              ))}
            </div>
            <div className={styles.inputRow}>
              <label htmlFor="fps-manual" className={styles.inputLabel}>
                Otro valor:
              </label>
              <input
                id="fps-manual"
                type="number"
                min={1}
                max={1000}
                value={fpsManual}
                onChange={handleFpsManualChange}
                placeholder="ej. 48"
                className={`${styles.inputNumber} ${usarFpsManual ? styles.inputActive : ''}`}
                aria-label="Frame rate personalizado en fps"
              />
            </div>
          </fieldset>

          {/* Velocidad de obturación actual */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Velocidad de obturación actual</legend>
            <p className={styles.fieldHint}>
              Selecciona la velocidad que usas ahora en exteriores (sin filtro ND)
            </p>
            <select
              value={obturadorEtiqueta}
              onChange={handleObturadorChange}
              className={styles.select}
              aria-label="Velocidad de obturación actual"
            >
              {VELOCIDADES_OBTURADOR.map(v => (
                <option key={v.etiqueta} value={v.etiqueta}>
                  {v.etiqueta} s
                </option>
              ))}
            </select>
          </fieldset>

          {/* Resumen de parámetros */}
          <div className={styles.resumenParams}>
            <span>
              <strong>FPS:</strong> {fpsEfectivo} fps
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong>Obturador objetivo:</strong> {resultado.obturadorObjetivo} s
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong>Actual:</strong> {resultado.obturadorActual} s
            </span>
          </div>
        </div>

        {/* Resultado */}
        <div className={styles.resultsPanel}>
          {!resultado.necesitaND ? (
            <div className={styles.noNdCard} role="status">
              <span className={styles.noNdIcon} aria-hidden="true">✅</span>
              <div>
                <strong className={styles.noNdTitulo}>No necesitas filtro ND</strong>
                <p className={styles.noNdTexto}>
                  Tu velocidad de obturación actual ({resultado.obturadorActual} s) ya es{' '}
                  <strong>igual o más lenta</strong> que la recomendada por la regla de los 180°
                  ({resultado.obturadorObjetivo} s a {fpsEfectivo} fps).
                </p>
                <p className={styles.noNdTexto}>
                  Si recibes demasiada luz, reduce la apertura o baja el ISO antes de recurrir a un ND.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.paradasCard} role="status">
                <span className={styles.paradasNum}>
                  {resultado.paradas_necesarias_exactas.toFixed(1)}
                </span>
                <span className={styles.paradasLabel}>paradas de ND necesarias</span>
                <p className={styles.paradasDesc}>{resultado.recomendacion}</p>
              </div>

              <h2 className={styles.tablaTitle}>Opciones de filtro ND disponibles</h2>
              <div className={styles.tablaWrapper}>
                <table className={styles.tablaFiltros} aria-label="Opciones de filtro ND">
                  <thead>
                    <tr>
                      <th scope="col">Filtro</th>
                      <th scope="col">Paradas</th>
                      <th scope="col">Obturador resultante</th>
                      <th scope="col">Desviación regla 180°</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.opciones.map(opcion => (
                      <tr
                        key={opcion.denominacion}
                        className={opcion.recomendado ? styles.filtroRecomendado : ''}
                        aria-label={
                          opcion.recomendado
                            ? `${opcion.denominacion} — filtro recomendado`
                            : opcion.denominacion
                        }
                      >
                        <td>
                          <span className={styles.denominacion}>
                            {opcion.denominacion}
                            {opcion.recomendado && (
                              <span className={styles.badgeRecomendado} aria-hidden="true">
                                ★ Recomendado
                              </span>
                            )}
                          </span>
                        </td>
                        <td>{opcion.paradas}</td>
                        <td>{opcion.obturadorResultante} s</td>
                        <td>
                          <span
                            className={
                              opcion.desviacionRegla180_stops === 0
                                ? styles.desvPerfecta
                                : opcion.desviacionRegla180_stops <= 0.5
                                ? styles.desvBuena
                                : styles.desvAlta
                            }
                          >
                            {opcion.desviacionRegla180_stops === 0
                              ? 'Perfecto'
                              : `±${opcion.desviacionRegla180_stops.toFixed(2)} stops`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Qué es un filtro ND y para qué sirve en vídeo?"
        subtitle="Todo lo que necesitas saber sobre la densidad neutra en videografía"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es un filtro de densidad neutra?</h2>
          <p>
            Un filtro ND (Neutral Density) es un elemento óptico que reduce la cantidad de luz
            que entra al sensor <strong>sin alterar los colores</strong>. Actúa como unas «gafas
            de sol» para la cámara: reduce la exposición de forma controlada para que puedas
            mantener la velocidad de obturación correcta aunque haya mucha luz.
          </p>

          <h2>La regla de los 180°</h2>
          <p>
            En cine y vídeo, la velocidad de obturación óptima es <strong>el doble del frame rate</strong>.
            Esta relación proviene del ángulo de obturación de las cámaras de cine analógico (180°):
          </p>
          <ul>
            <li>24 fps → obturador a 1/48 s (≈ 1/50 s)</li>
            <li>25 fps → obturador a 1/50 s</li>
            <li>30 fps → obturador a 1/60 s</li>
            <li>50 fps → obturador a 1/100 s</li>
            <li>60 fps → obturador a 1/120 s</li>
          </ul>
          <p>
            Esta velocidad produce el <strong>motion blur natural</strong> que el ojo humano asocia
            con movimiento fluido. Con una velocidad demasiado alta el vídeo parece «entrecortado»
            (efecto jello o stroboscópico); con una velocidad demasiado baja el movimiento queda
            borroso en exceso.
          </p>

          <h2>ND fijo vs. ND variable: diferencias clave</h2>
          <div className={styles.warningBox}>
            <strong>ND fijo:</strong> Ofrece exactamente N paradas de reducción. Mayor nitidez óptica,
            sin efecto cruz (flare en X) y mejor mantenimiento del color. Ideal cuando conoces bien
            las condiciones de luz. Suele ser más económico.
          </div>
          <p>
            <strong>ND variable:</strong> Combina dos polarizadores cruzados para ajustar la reducción
            de forma continua (por ejemplo, de ND2 a ND400). Muy flexible para condiciones cambiantes,
            pero puede introducir un efecto de «X» oscura a niveles extremos y ligera pérdida de nitidez.
            Requiere mayor presupuesto para buena calidad óptica.
          </p>

          <h2>Nomenclatura ND: paradas vs. denominación numérica</h2>
          <p>
            Los filtros se identifican de dos formas equivalentes:
          </p>
          <table className={styles.tablaFiltros} aria-label="Nomenclatura de filtros ND">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Paradas (stops)</th>
                <th scope="col">Factor de reducción</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>ND2</td><td>1 stop</td><td>2×</td></tr>
              <tr><td>ND4</td><td>2 stops</td><td>4×</td></tr>
              <tr><td>ND8</td><td>3 stops</td><td>8×</td></tr>
              <tr><td>ND16</td><td>4 stops</td><td>16×</td></tr>
              <tr><td>ND32</td><td>5 stops</td><td>32×</td></tr>
              <tr><td>ND64</td><td>6 stops</td><td>64×</td></tr>
              <tr><td>ND128</td><td>7 stops</td><td>128×</td></tr>
              <tr><td>ND256</td><td>8 stops</td><td>256×</td></tr>
              <tr><td>ND512</td><td>9 stops</td><td>512×</td></tr>
              <tr><td>ND1000</td><td>~10 stops</td><td>1000×</td></tr>
            </tbody>
          </table>
          <p>
            La denominación numérica (ND8, ND64…) indica el factor multiplicador de exposición.
            Las paradas (stops) se calculan como log₂ del factor. La calculadora usa ambas referencias.
          </p>

          <h2>¿Cuándo usar filtros ND en vídeo?</h2>
          <ul>
            <li>
              <strong>Exteriores con luz intensa:</strong> Es el caso más habitual. Con ISO 100 y apertura
              f/4 en pleno sol, la exposición correcta puede requerir 1/2000 s, muy por encima de la regla
              de los 180°. Un ND8–ND64 soluciona el problema.
            </li>
            <li>
              <strong>Apertura creativa:</strong> Si quieres filmar con f/1.8 para fondo desenfocado
              en condiciones de luz media, un ND te permite mantener esa apertura sin sobreexponer.
            </li>
            <li>
              <strong>Slow motion real en exteriores:</strong> Al grabar a 120 fps el obturador objetivo
              es 1/240 s, lo que casi nunca es problema en interiores, pero sí en exteriores soleados.
            </li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-filtro-nd-video')} />

      <ShareCard appName="calculadora-filtro-nd-video" />

      <Footer appName="calculadora-filtro-nd-video" />
    </div>
  );
}
