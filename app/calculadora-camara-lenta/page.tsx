'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularCamaraLenta } from '@/lib/calculadoras/videografia';
import styles from './CalculadoraCamaraLenta.module.css';

// FPS comunes para grabación
const FPS_GRABACION_OPCIONES = [60, 90, 120, 180, 240, 480, 960] as const;

// FPS comunes para reproducción
const FPS_REPRODUCCION_OPCIONES = [24, 25, 30] as const;

// Colores por nivel de slow motion
const NIVEL_COLORES: Record<string, string> = {
  'Ligeramente ralentizado': 'nivelSuave',
  'Slow motion suave': 'nivelSuave',
  'Slow motion marcado': 'nivelMarcado',
  'Slow motion intenso': 'nivelIntenso',
  'Ultra slow motion': 'nivelUltra',
};

function formatDuracion(segundos: number): string {
  if (segundos < 60) {
    return `${Math.round(segundos * 10) / 10} s`;
  }
  const minutos = Math.floor(segundos / 60);
  const segs = Math.round(segundos % 60);
  return `${minutos} min ${segs} s`;
}

export default function CalculadoraCamaraLentaPage() {
  const [fpsGrabacion, setFpsGrabacion] = useState<number>(120);
  const [fpsGrabacionCustom, setFpsGrabacionCustom] = useState<string>('');
  const [fpsReproduccion, setFpsReproduccion] = useState<number>(25);
  const [fpsReproduccionCustom, setFpsReproduccionCustom] = useState<string>('');
  const [duracionStr, setDuracionStr] = useState<string>('');

  // fps efectivos (preset o custom)
  const fpsGrabacionEfectivo = useMemo(() => {
    const val = parseFloat(fpsGrabacionCustom);
    return fpsGrabacionCustom !== '' && val > 0 ? val : fpsGrabacion;
  }, [fpsGrabacion, fpsGrabacionCustom]);

  const fpsReproduccionEfectivo = useMemo(() => {
    const val = parseFloat(fpsReproduccionCustom);
    return fpsReproduccionCustom !== '' && val > 0 ? val : fpsReproduccion;
  }, [fpsReproduccion, fpsReproduccionCustom]);

  const duracionGrabacion = useMemo(() => {
    const val = parseFloat(duracionStr.replace(',', '.'));
    return !isNaN(val) && val > 0 ? val : undefined;
  }, [duracionStr]);

  const resultado = useMemo(
    () => calcularCamaraLenta(fpsGrabacionEfectivo, fpsReproduccionEfectivo, duracionGrabacion),
    [fpsGrabacionEfectivo, fpsReproduccionEfectivo, duracionGrabacion],
  );

  const nivelClase = NIVEL_COLORES[resultado.nivel] ?? 'nivelSuave';

  const handleFpsGrabacionPreset = (fps: number) => {
    setFpsGrabacion(fps);
    setFpsGrabacionCustom('');
  };

  const handleFpsReproduccionPreset = (fps: number) => {
    setFpsReproduccion(fps);
    setFpsReproduccionCustom('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🎬 Calculadora de Cámara Lenta</h1>
        <p>
          Calcula el factor de ralentización, la velocidad de obturación correcta y la duración
          final de tu vídeo a cámara lenta (slow motion).
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.controlsPanel}>
          {/* Panel de parámetros */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parámetros de grabación</h2>

            {/* FPS de grabación */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                FPS de grabación
                <span className={styles.valueBadge}>{fpsGrabacionEfectivo} fps</span>
              </label>
              <div className={styles.selectorFps}>
                {FPS_GRABACION_OPCIONES.map((fps) => (
                  <button
                    key={fps}
                    className={`${styles.fpsBtn} ${
                      fpsGrabacionCustom === '' && fpsGrabacion === fps ? styles.fpsBtnActive : ''
                    }`}
                    onClick={() => handleFpsGrabacionPreset(fps)}
                    aria-pressed={fpsGrabacionCustom === '' && fpsGrabacion === fps}
                  >
                    {fps}
                  </button>
                ))}
              </div>
              <input
                type="number"
                className={styles.customInput}
                placeholder="Otro valor (ej. 300)"
                value={fpsGrabacionCustom}
                min={1}
                max={10000}
                onChange={(e) => setFpsGrabacionCustom(e.target.value)}
                aria-label="FPS de grabación personalizado"
              />
              <span className={styles.unitLabel}>
                Cuantos más fps grabes, más ralentización podrás conseguir en la edición.
              </span>
            </div>

            {/* FPS de reproducción */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                FPS de reproducción (timeline)
                <span className={styles.valueBadge}>{fpsReproduccionEfectivo} fps</span>
              </label>
              <div className={styles.selectorFps}>
                {FPS_REPRODUCCION_OPCIONES.map((fps) => (
                  <button
                    key={fps}
                    className={`${styles.fpsBtn} ${
                      fpsReproduccionCustom === '' && fpsReproduccion === fps
                        ? styles.fpsBtnActive
                        : ''
                    }`}
                    onClick={() => handleFpsReproduccionPreset(fps)}
                    aria-pressed={fpsReproduccionCustom === '' && fpsReproduccion === fps}
                  >
                    {fps}
                  </button>
                ))}
              </div>
              <input
                type="number"
                className={styles.customInput}
                placeholder="Otro valor (ej. 60)"
                value={fpsReproduccionCustom}
                min={1}
                max={1000}
                onChange={(e) => setFpsReproduccionCustom(e.target.value)}
                aria-label="FPS de reproducción personalizado"
              />
              <span className={styles.unitLabel}>
                El fps del proyecto de edición: 24 (cine), 25 (PAL/Europa), 30 (NTSC/redes).
              </span>
            </div>

            {/* Duración de grabación */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel} htmlFor="duracion-input">
                Duración del clip grabado (opcional)
              </label>
              <div className={styles.duracionRow}>
                <input
                  id="duracion-input"
                  type="number"
                  className={styles.customInput}
                  placeholder="Ej: 10"
                  value={duracionStr}
                  min={0.1}
                  step={0.1}
                  onChange={(e) => setDuracionStr(e.target.value)}
                  aria-label="Duración del clip grabado en segundos"
                />
                <span className={styles.duracionUnit}>segundos</span>
              </div>
              <span className={styles.unitLabel}>
                Si introduces la duración de la grabación, verás cuánto durará el clip ralentizado.
              </span>
            </div>
          </div>

          {/* Panel de resultado */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado</h2>

            {/* Factor en grande */}
            <div className={styles.factorWrapper}>
              <div className={styles.factorDestacado} aria-live="polite">
                {resultado.factor_lentitud % 1 === 0
                  ? `${resultado.factor_lentitud}×`
                  : `${resultado.factor_lentitud.toFixed(2)}×`}
              </div>
              <div className={styles.factorLabel}>más lento</div>
              <div
                className={`${styles.nivelBadge} ${styles[nivelClase]}`}
                role="status"
                aria-label={`Nivel: ${resultado.nivel}`}
              >
                {resultado.nivel}
              </div>
            </div>

            {/* Detalles */}
            <div className={styles.resultBlock}>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>FPS de grabación</span>
                <span className={styles.resultValue}>{resultado.fps_grabacion} fps</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>FPS de reproducción</span>
                <span className={styles.resultValue}>{resultado.fps_reproduccion} fps</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Obturador en grabación</span>
                <span className={`${styles.resultValue} ${styles.obturadorValue}`}>
                  {resultado.obturador_grabacion}
                </span>
              </div>
              {resultado.duracion_resultado_s !== null && duracionGrabacion !== undefined && (
                <>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Duración grabada</span>
                    <span className={styles.resultValue}>{formatDuracion(duracionGrabacion)}</span>
                  </div>
                  <div className={styles.resultRowDestacado}>
                    <span className={styles.resultLabel}>Duración del clip ralentizado</span>
                    <span className={styles.resultValueBig}>
                      {formatDuracion(resultado.duracion_resultado_s)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Fórmula */}
            <div className={styles.formulaBox}>
              <p className={styles.formulaTex}>
                Factor = fps_grabación / fps_reproducción
              </p>
              <p className={styles.formulaCaption}>
                Obturador = 1 / (2 × fps_grabación) — regla de los 180°
              </p>
            </div>
          </div>
        </div>

        <EducationalSection
          title="Guía de Cámara Lenta (Slow Motion)"
          subtitle="Todo lo que necesitas saber para grabar slow motion de calidad"
          icon="🎬"
        >
          <h3 className={styles.eduSubtitle}>¿Qué es el slow motion real?</h3>
          <p className={styles.guideParagraph}>
            El slow motion real consiste en grabar a una cadencia de fotogramas (fps) mayor que la
            de reproducción. Al reproducir a 25 fps un clip grabado a 100 fps, cada segundo de
            grabación se convierte en 4 segundos de vídeo: el movimiento se ralentiza
            <strong> sin perder fluidez</strong>, porque todos los fotogramas son reales.
          </p>
          <p className={styles.guideParagraph}>
            Esto lo diferencia de la interpolación artificial (Optical Flow, Twixtor), que
            <strong> inventa</strong> fotogramas entre los que sí existen. La interpolación
            introduce artefactos en bordes y zonas de movimiento complejo; el slow motion real no.
          </p>

          <h3 className={styles.eduSubtitle}>Interpolación vs. slow motion real</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Característica</th>
                  <th>Slow motion real</th>
                  <th>Interpolación (IA/Optical Flow)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Calidad de movimiento</td>
                  <td>Perfecta — todos los frames son reales</td>
                  <td>Variable — artefactos en movimiento complejo</td>
                </tr>
                <tr>
                  <td>Requisito de cámara</td>
                  <td>Alta cadencia en sensor (60–960 fps)</td>
                  <td>Cualquier cámara</td>
                </tr>
                <tr>
                  <td>Procesado</td>
                  <td>Ninguno en edición</td>
                  <td>Intensivo en CPU/GPU o IA en la nube</td>
                </tr>
                <tr>
                  <td>Resolución</td>
                  <td>Puede bajar en modos de alta cadencia</td>
                  <td>Mantiene la resolución original</td>
                </tr>
                <tr>
                  <td>Caso de uso ideal</td>
                  <td>Movimientos rápidos: deporte, naturaleza, efectos creativos</td>
                  <td>Suavizar movimientos lentos o vídeos de baja cadencia</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>FPS necesarios por tipo de uso</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>🏃 Deporte y acción</h4>
              <p>
                120–240 fps para capturar gestos, saltos y momentos de impacto. Factor 4×–10× a 25
                fps de reproducción. Muchas cámaras compactas y smartphones alcanzan 120–240 fps a
                Full HD.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>💧 Líquidos y naturaleza</h4>
              <p>
                240–480 fps para goteo de agua, ondas o animales en vuelo. A 480 fps a 25 fps de
                reproducción, el factor es 19×. Se necesita cámara dedicada o smartphone de gama
                alta con modo dedicado.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🔥 Efectos visuales</h4>
              <p>
                500–1000 fps para explosiones, impactos o fenómenos físicos rápidos. A este rango
                la resolución suele bajar drásticamente. Requiere cámaras especializadas o modelos
                de alta gama.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🎥 Uso cinematográfico</h4>
              <p>
                48–120 fps para un slow motion suave y elegante: el clásico &quot;efecto
                cine&quot;. Con 120 fps a 24 fps de reproducción se obtiene un factor 5×, suficiente
                para la mayoría de usos narrativos.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>La regla de los 180° en slow motion</h3>
          <p className={styles.guideParagraph}>
            La regla de los 180° establece que la velocidad de obturación debe ser el doble del
            frame rate para obtener el <strong>motion blur natural</strong> que el ojo humano
            asocia con movimiento fluido. A 120 fps, la velocidad correcta es 1/240 s. A 240 fps,
            1/480 s.
          </p>
          <p className={styles.guideParagraph}>
            En slow motion es habitual necesitar <strong>filtros ND</strong> (densidad neutra) para
            reducir la luz y poder usar esa velocidad de obturación incluso en exteriores con mucha
            luz. Sin filtro ND, se tiende a cerrar el diafragma o reducir el ISO, lo que puede
            afectar a la calidad de imagen.
          </p>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué en alta cadencia la resolución baja?</strong>
              <p>
                El sensor necesita leer y transferir más datos por segundo. Para mantener altas
                tasas de fps, la electrónica del sensor trabaja con una región más pequeña (un
                recorte) o con menos líneas, lo que reduce la resolución efectiva. A 120 fps muchas
                cámaras graban en Full HD cuando a 30 fps lo hacían en 4K.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿El slow motion necesita mucha luz?</strong>
              <p>
                Sí. A mayor fps, menor tiempo de exposición por frame, lo que reduce la cantidad de
                luz que llega al sensor. En exteriores suele ser suficiente, pero en interiores
                puede ser un problema. Una apertura amplia y un ISO más alto compensan, aunque a
                costa de profundidad de campo y ruido.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿El audio se graba correctamente en slow motion?</strong>
              <p>
                Depende de la cámara. En la mayoría, el audio grabado durante la alta cadencia
                queda inutilizable (se distorsiona al ralentizarlo). En el montaje conviene
                sustituirlo por música, efectos de sonido o doblaje. Algunas cámaras de vídeo
                profesionales síncro el audio por separado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué factor de ralentización es el correcto para mi uso?</strong>
              <p>
                No existe un único valor correcto: depende del efecto que busques y del contexto.
                Un factor 2×–4× es sutil, ideal para añadir dramatismo sin que resulte evidente.
                Un factor 8×–20× es claramente perceptible como slow motion. Por encima de 20×
                (ultra slow motion) el efecto es llamativo y suele reservarse para momentos clave
                del montaje.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puedo mezclar clips normales y slow motion en el mismo proyecto?</strong>
              <p>
                Sí, es lo más habitual. Un proyecto a 25 fps puede contener clips grabados a 25,
                50, 100 o 200 fps. El software de edición (Premiere, DaVinci, Final Cut) interpreta
                automáticamente el factor de ralentización si configuras correctamente la
                interpretación del clip o la secuencia.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Flujo de trabajo recomendado</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Define el factor de ralentización que buscas</strong>
                <p>
                  Decide el efecto: ¿slow motion sutil (2×–4×) o extremo (10×+)? Eso determina
                  cuántos fps necesitas grabar con respecto al fps de tu proyecto.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Configura la cámara antes de grabar</strong>
                <p>
                  Selecciona el modo de alta cadencia en la cámara. Ajusta la velocidad de
                  obturación al doble del fps (regla 180°). Usa filtro ND si el entorno tiene
                  demasiada luz.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Verifica la exposición</strong>
                <p>
                  Comprueba el histograma o el zebra de la cámara. En alta cadencia la exposición
                  es crítica: los errores de exposición se amplifican al ralentizar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Graba con estabilización si es posible</strong>
                <p>
                  En slow motion cualquier vibración es visible. Usa estabilizador óptico (OIS),
                  electrónico (EIS) o gimbal. Evita el zoom óptico mientras grabas a alta cadencia
                  en sensores pequeños, ya que suele desactivar la estabilización.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Interpreta el clip en edición</strong>
                <p>
                  En tu software de edición, configura el clip grabado a su fps real (ej. 120 fps)
                  en un proyecto a 25 fps. El software aplicará automáticamente el factor 4,8×.
                  Ajusta la velocidad a mano si quieres un valor diferente.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌞</span>
              <div>
                <strong>Prioriza la luz natural</strong>
                <p>El slow motion en exteriores con luz directa suele dar los mejores resultados sin necesidad de filtros ND fuertes.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎛️</span>
              <div>
                <strong>Graba en log o perfil plano</strong>
                <p>Un perfil de color plano (S-Log, C-Log, N-Log) preserva más rango dinámico, especialmente útil en slow motion donde la exposición es crítica.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Recuerda la regla 180°</strong>
                <p>Siempre ajusta el obturador al doble del fps de grabación. Esta calculadora lo hace automáticamente para que no tengas que recordarlo en campo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎞️</span>
              <div>
                <strong>Usa el slow motion con criterio</strong>
                <p>El slow motion pierde impacto si se abusa. Úsalo en los momentos clave del montaje para que el espectador perciba su valor narrativo.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <div>
                <strong>Verifica el foco antes de grabar</strong>
                <p>En alta cadencia el autofoco puede ser más lento o desactivarse. Prefoca manualmente o usa AF-C si la cámara lo soporta bien a alta cadencia.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Combínalo con la calculadora de DoF</strong>
                <p>
                  La apertura amplia para slow motion (más luz) reduce la profundidad de campo.
                  Calcula la DoF en la{' '}
                  <a href="/calculadora-profundidad-campo/">calculadora de profundidad de campo</a>.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes al grabar slow motion
            </div>
            <ul className={styles.warningList}>
              <li>
                Grabar a 120 fps en un proyecto de 30 fps y no interpretar el clip: el vídeo se
                reproduce a velocidad normal porque el software lo trata como 30 fps.
              </li>
              <li>
                No ajustar el obturador: grabar a 120 fps con un obturador de 1/30 s produce
                motion blur excesivo y el slow motion se ve sucio.
              </li>
              <li>
                Confundir slow motion real con interpolación: 24 fps interpolados a 60 fps no es
                slow motion, es el mismo clip con fotogramas inventados — no captura nada nuevo.
              </li>
              <li>
                Grabar en interiores con luz insuficiente a 240+ fps: el ruido se multiplica al
                tener que subir el ISO y la imagen pierde calidad.
              </li>
              <li>
                Asumir que todos los modos de alta cadencia graban con calidad de color completa:
                algunos activan un submuestreo de color 4:2:0 en lugar de 4:2:2 para ahorrar
                ancho de banda.
              </li>
              <li>
                Ignorar el recorte de sensor: a 240 fps muchas cámaras usan un recorte central
                significativo, lo que cambia el ángulo de visión de forma inesperada.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-camara-lenta')} />
        <ShareCard appName="calculadora-camara-lenta" />
      </main>

      <Footer appName="calculadora-camara-lenta" />
    </div>
  );
}
