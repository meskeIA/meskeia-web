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
import { formatNumber } from '@/lib';
import styles from './CalculadoraRegla500NPFAstrofoto.module.css';

interface SensorConfig {
  id: string;
  nombre: string;
  factor: number;
  anchoMM: number;
  altoMM: number;
}

const SENSORES: SensorConfig[] = [
  { id: 'ff', nombre: 'Full Frame', factor: 1.0, anchoMM: 36, altoMM: 24 },
  { id: 'apsc15', nombre: 'APS-C Nikon/Sony (×1,5)', factor: 1.5, anchoMM: 23.5, altoMM: 15.6 },
  { id: 'apsc16', nombre: 'APS-C Canon (×1,6)', factor: 1.6, anchoMM: 22.3, altoMM: 14.9 },
  { id: 'm43', nombre: 'Micro 4/3 (×2,0)', factor: 2.0, anchoMM: 17.3, altoMM: 13 },
];

const APERTURAS = [1.4, 1.8, 2, 2.8, 4, 5.6] as const;

interface PresetDeclinacion {
  id: string;
  nombre: string;
  emoji: string;
  declinacion: number;
}

const PRESETS_DECLINACION: PresetDeclinacion[] = [
  { id: 'ecuador', nombre: 'Ecuador celeste / Orión', emoji: '🌌', declinacion: 0 },
  { id: 'vialactea', nombre: 'Vía Láctea típica', emoji: '✨', declinacion: 30 },
  { id: 'casiopea', nombre: 'Casiopea / cielo medio norte', emoji: '⭐', declinacion: 60 },
  { id: 'polaris', nombre: 'Cerca de Polaris', emoji: '🧭', declinacion: 85 },
];

function pixelPitchUm(sensor: SensorConfig, megapixeles: number): number {
  const areaMM2 = sensor.anchoMM * sensor.altoMM;
  const numPixels = megapixeles * 1e6;
  return Math.sqrt(areaMM2 / numPixels) * 1000;
}

function regla500(focalMM: number, factor: number): number {
  const focalEqFF = focalMM * factor;
  return 500 / focalEqFF;
}

function regla300(focalMM: number, factor: number): number {
  const focalEqFF = focalMM * factor;
  return 300 / focalEqFF;
}

function reglaNPF(
  focalMM: number,
  apertura: number,
  pixelPitchUmVal: number,
  declinacionGrados: number,
): number {
  const declinacionRad = (declinacionGrados * Math.PI) / 180;
  const cosD = Math.cos(declinacionRad);
  if (cosD < 0.001) return Infinity;
  return (35 * apertura + 30 * pixelPitchUmVal) / (focalMM * cosD);
}

function formatSegundos(s: number): string {
  if (!isFinite(s)) return '∞';
  if (s >= 60) return `${formatNumber(s / 60, 1)} min`;
  if (s >= 10) return `${formatNumber(s, 0)} s`;
  return `${formatNumber(s, 1)} s`;
}

export default function CalculadoraRegla500NPFAstrofotoPage() {
  const [focal, setFocal] = useState(14);
  const [aperturaIdx, setAperturaIdx] = useState(3); // f/2,8
  const [sensorId, setSensorId] = useState('ff');
  const [megapixeles, setMegapixeles] = useState(24);
  const [declinacion, setDeclinacion] = useState(0);
  const [tiempoElegido, setTiempoElegido] = useState(20);

  const sensor = SENSORES.find((s) => s.id === sensorId)!;
  const apertura = APERTURAS[aperturaIdx];

  const pitch = useMemo(() => pixelPitchUm(sensor, megapixeles), [sensor, megapixeles]);
  const t500 = useMemo(() => regla500(focal, sensor.factor), [focal, sensor.factor]);
  const t300 = useMemo(() => regla300(focal, sensor.factor), [focal, sensor.factor]);
  const tNPF = useMemo(
    () => reglaNPF(focal, apertura, pitch, declinacion),
    [focal, apertura, pitch, declinacion],
  );

  // Veredicto basado en el tiempo elegido frente al NPF y al 500
  const veredicto = useMemo(() => {
    if (tiempoElegido <= tNPF) {
      return {
        label: '✅ Estrellas puntuales (dentro de NPF)',
        cls: 'expOk',
        descripcion:
          'Tu tiempo está por debajo del NPF: las estrellas saldrán como puntos limpios. Es el resultado ideal en astrofotografía.',
      };
    }
    if (tiempoElegido <= t500) {
      return {
        label: '🟡 Micro-estelas tolerables',
        cls: 'expWarn',
        descripcion:
          'Estás entre NPF y regla 500: a tamaño completo verás microestelas, pero a tamaño web o impresión moderada pasan desapercibidas.',
      };
    }
    if (tiempoElegido <= t500 * 1.5) {
      return {
        label: '🟠 Estelas visibles',
        cls: 'expWarn',
        descripcion:
          'Has cruzado la regla 500. Las estrellas dejan rastro visible. Útil solo si buscas un look "soft" o vas a hacer time-lapse.',
      };
    }
    return {
      label: '🔴 Estelas marcadas (star trails)',
      cls: 'expBad',
      descripcion:
        'Tiempo excesivo para fotos de "estrellas como puntos". Si buscas star trails intencionados, perfecto. Para Vía Láctea, baja el tiempo.',
    };
  }, [tiempoElegido, tNPF, t500]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">🌌</span> Regla 500 y NPF para Astrofotografía</h1>
        <p>
          Calcula el tiempo máximo de exposición antes de que las estrellas dejen de ser puntos y
          se conviertan en estelas. Regla 500 simple y NPF precisa con visualización en vivo.
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        <div className={styles.controlsPanel}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Parámetros de tu cámara</h2>

            <div className={styles.inputGroup}>
              <label htmlFor="sensor-select">Sensor</label>
              <select
                id="sensor-select"
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
                className={styles.selectInput}
              >
                {SENSORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.anchoMM} × {s.altoMM} mm)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="mp-input">
                Megapíxeles del sensor
                <span className={styles.valueBadge}>{megapixeles} MP</span>
              </label>
              <input
                id="mp-input"
                type="range"
                min={10}
                max={61}
                step={1}
                value={megapixeles}
                onChange={(e) => setMegapixeles(parseInt(e.target.value))}
                aria-valuetext={`${megapixeles} megapíxeles`}
              />
              <span className={styles.unitLabel}>
                Pixel pitch calculado: <strong>{formatNumber(pitch, 2)} µm</strong>. Sensores más
                densos (más MP, mismo tamaño) son más exigentes con el tiempo de exposición.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="focal-input">
                Focal (mm)
                <span className={styles.valueBadge}>
                  {focal} mm
                  {sensor.factor !== 1 && (
                    <small> · eq. {formatNumber(focal * sensor.factor, 0)} mm FF</small>
                  )}
                </span>
              </label>
              <input
                id="focal-input"
                type="range"
                min={8}
                max={85}
                step={1}
                value={focal}
                onChange={(e) => setFocal(parseInt(e.target.value))}
                aria-valuetext={`${focal} milímetros`}
              />
              <span className={styles.unitLabel}>
                Cuanto más larga la focal, más rápido aparecen las estelas. Para Vía Láctea: 14-24
                mm. Para constelaciones: 35-50 mm.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label>
                Apertura (f-stop)
                <span className={styles.valueBadge}>
                  f/{formatNumber(apertura, apertura < 10 && apertura % 1 !== 0 ? 1 : 0)}
                </span>
              </label>
              <div className={styles.aperturaGrid}>
                {APERTURAS.map((a, idx) => (
                  <button
                    key={a}
                    type="button"
                    className={`${styles.aperturaBtn} ${aperturaIdx === idx ? styles.aperturaActive : ''}`}
                    onClick={() => setAperturaIdx(idx)}
                    aria-pressed={aperturaIdx === idx}
                  >
                    f/{formatNumber(a, a < 10 && a % 1 !== 0 ? 1 : 0)}
                  </button>
                ))}
              </div>
              <span className={styles.unitLabel}>
                Aperturas más amplias (f/1,4-f/2,8) permiten exposiciones más cortas. En NPF, la
                apertura entra explícitamente en la fórmula.
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="dec-input">
                Declinación celeste (°)
                <span className={styles.valueBadge}>{declinacion}°</span>
              </label>
              <input
                id="dec-input"
                type="range"
                min={0}
                max={89}
                step={1}
                value={declinacion}
                onChange={(e) => setDeclinacion(parseInt(e.target.value))}
                aria-valuetext={`${declinacion} grados de declinación`}
              />
              <div className={styles.chipsRow}>
                {PRESETS_DECLINACION.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`${styles.focalChip} ${declinacion === p.declinacion ? styles.chipActive : ''}`}
                    onClick={() => setDeclinacion(p.declinacion)}
                    title={`${p.declinacion}°`}
                    aria-pressed={declinacion === p.declinacion}
                  >
                    <span aria-hidden="true">{p.emoji}</span> {p.nombre}
                  </button>
                ))}
              </div>
              <span className={styles.unitLabel}>
                Las estrellas cerca del ecuador celeste (0°) se mueven más rápido; las cercanas a
                Polaris (90°) apenas se mueven. La NPF usa esto; la regla 500 lo ignora.
              </span>
            </div>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Resultado</h2>

            <CieloSVG tiempo={tiempoElegido} tiempoNPF={tNPF} focalMM={focal} />

            <div className={styles.inputGroup}>
              <label htmlFor="tiempo-input">
                Tu tiempo de exposición
                <span className={styles.valueBadge}>{formatSegundos(tiempoElegido)}</span>
              </label>
              <input
                id="tiempo-input"
                type="range"
                min={1}
                max={60}
                step={1}
                value={tiempoElegido}
                onChange={(e) => setTiempoElegido(parseInt(e.target.value))}
                aria-valuetext={`${tiempoElegido} segundos`}
              />
            </div>

            <p className={`${styles.veredicto} ${styles[veredicto.cls]}`} aria-live="polite">
              {veredicto.label}
            </p>
            <p className={styles.veredictoDesc}>{veredicto.descripcion}</p>

            <div className={styles.resultBlock} role="status" aria-live="polite" aria-atomic="true">
              <h3 className={styles.resultTitle}>Tiempos máximos</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>NPF (precisa)</span>
                <span className={`${styles.resultValue} ${styles.expOk}`}>
                  {formatSegundos(tNPF)}
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Regla 500 (clásica)</span>
                <span className={styles.resultValue}>{formatSegundos(t500)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Regla 300 (conservadora)</span>
                <span className={styles.resultValue}>{formatSegundos(t300)}</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Focal equivalente FF</span>
                <span className={styles.resultValue}>
                  {formatNumber(focal * sensor.factor, 0)} mm
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Pixel pitch</span>
                <span className={styles.resultValue}>{formatNumber(pitch, 2)} µm</span>
              </div>
            </div>

            <div className={styles.formulaBox}>
              <p className={styles.formulaTex}>
                NPF: t = (35·N + 30·p) / (f · cos δ)
              </p>
              <p className={styles.formulaTex}>500: t = 500 / (f · factor_recorte)</p>
              <p className={styles.formulaCaption}>
                N = apertura, p = pixel pitch (µm), f = focal real (mm), δ = declinación
              </p>
            </div>
          </div>
        </div>

        <EducationalSection
          title="Guía completa de exposición sin estelas"
          subtitle="Cómo elegir el tiempo correcto para Vía Láctea y cielo nocturno"
          icon="🌌"
        >
          <h3 className={styles.eduSubtitle}>¿Por qué las estrellas se mueven en la foto?</h3>
          <p className={styles.guideParagraph}>
            La Tierra rota 360° cada 24 horas. Desde la cámara, las estrellas parecen desplazarse
            ~15° por hora en el ecuador celeste (~0,25° por minuto). A focales largas, ese
            movimiento equivale a varios píxeles por segundo y la estrella deja de ser un punto.
          </p>
          <p className={styles.guideParagraph}>
            La <strong>regla 500</strong> y la <strong>NPF</strong> calculan el tiempo máximo de
            exposición para que el desplazamiento sea menor que el tamaño de unos pocos píxeles —
            lo justo para que el ojo siga viendo un punto, no una raya.
          </p>

          <h3 className={styles.eduSubtitle}>Regla 500 vs NPF: cuándo usar cada una</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Aspecto</th>
                  <th>Regla 500</th>
                  <th>NPF</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cuándo usar</td>
                  <td>Cálculo rápido de campo</td>
                  <td>Cuando quieres el mejor resultado</td>
                </tr>
                <tr>
                  <td>Considera apertura</td>
                  <td>No</td>
                  <td>Sí (35·N)</td>
                </tr>
                <tr>
                  <td>Considera pixel pitch</td>
                  <td>No</td>
                  <td>Sí (30·p)</td>
                </tr>
                <tr>
                  <td>Considera declinación</td>
                  <td>No</td>
                  <td>Sí (cos δ)</td>
                </tr>
                <tr>
                  <td>Aplicabilidad</td>
                  <td>Sensores antiguos &lt;20 MP</td>
                  <td>Sensores modernos &gt;24 MP</td>
                </tr>
                <tr>
                  <td>Tendencia</td>
                  <td>Suele ser optimista (tiempo demasiado largo)</td>
                  <td>Más conservadora, refleja mejor la realidad</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Ejemplos rápidos en Full Frame 24 MP</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🌌</span> Vía Láctea — 14 mm f/2,8 cerca del ecuador celeste</h4>
              <p>
                Regla 500: ~35 s. NPF: ~19 s. Usa 15-20 s a ISO 3200-6400 según contaminación
                lumínica. Con cámara muy resuelta (45+ MP), baja a 13 s.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">⭐</span> Constelación con 50 mm f/1,8 a declinación 30°</h4>
              <p>
                Regla 500: 10 s. NPF: ~6 s. Con un 50 mm el límite cae rápido. Aquí ayuda mucho que
                la apertura sea amplia para mantener ISO razonable.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">🧭</span> Cielo cercano a Polaris</h4>
              <p>
                Las estrellas circumpolares apenas se mueven respecto al sensor. NPF tiende a
                infinito y puedes exponer 60-120 s sin problema con focales cortas. Ideal para
                composiciones con Polaris fija.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4><span aria-hidden="true">📷</span> Star trails intencionados</h4>
              <p>
                Para hacer rayas circulares en torno a Polaris: ignora la NPF. Toma muchas fotos de
                20-30 s seguidas (intervalómetro) y combínalas. O una sola de 10-60 minutos si tu
                cámara aguanta el ruido térmico.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>El triángulo de exposición en astrofoto</h3>
          <p className={styles.guideParagraph}>
            La astrofotografía es donde el triángulo se vuelve crítico. Tienes muy poca luz, los
            sujetos se mueven y solo puedes &quot;subir&quot; tres palancas:
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Apertura</h4>
              <p>
                Lo más amplia posible (f/1,4-f/2,8). Cada stop ganado equivale a duplicar la luz
                sin tocar tiempo ni ISO. Por eso las lentes &quot;astro&quot; como un 14 mm f/1,8
                son tan apreciadas.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Tiempo</h4>
              <p>
                Limitado por NPF/500. Pasarlo causa estelas. Es la palanca menos flexible: te la
                impone la rotación terrestre.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>ISO</h4>
              <p>
                Sube hasta donde el ruido sea aceptable (típicamente 3200-6400 en FF moderna).
                Mejor pasarse un poco que tener foto subexpuesta — el ruido se reduce en edición,
                las sombras vacías no.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿La regla 500 sirve para mi cámara de 45 MP?</strong>
              <p>
                Sí, pero da resultados optimistas. A 45 MP en FF, el pixel pitch baja a ~4 µm. La
                regla 500 dará un tiempo en el que las estelas son visibles a 100 %. Mejor NPF, o
                divide el resultado de la 500 entre 1,5.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> Si solo vas a publicar a tamaño web, la regla 500 sigue siendo aceptable.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué la NPF da tiempos &quot;infinitos&quot; cerca de Polaris?</strong>
              <p>
                Porque las estrellas circumpolares se mueven muy poco respecto al sensor. El
                cos(declinación) se acerca a 0 y la división de la fórmula tiende a infinito. En
                la práctica, otros factores limitan (ruido térmico, contaminación) antes de que las
                estelas sean visibles.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es el &quot;pixel pitch&quot; y cómo lo calculo?</strong>
              <p>
                Es la distancia entre el centro de un píxel y el siguiente, en micrómetros (µm). Lo
                calculas como ancho_sensor_mm / ancho_pixels × 1000. Sensores con más MP a igual
                tamaño tienen pitch más pequeño y son más exigentes con el tiempo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Necesito conocer la declinación exacta?</strong>
              <p>
                No para empezar. Para Vía Láctea cerca del centro galáctico (Sagitario, julio-
                septiembre), δ ≈ -30°. Para constelaciones del hemisferio norte medio, δ ≈ 40°. Si
                no lo sabes, deja 0° (peor caso) y vas a salvo.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> La regla 500 ignora la declinación y por eso es más conservadora al cerca del
                ecuador y demasiado conservadora cerca de los polos celestes.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Y si quiero más tiempo del que permite la NPF?</strong>
              <p>
                Opciones: (1) trípode ecuatorial o star tracker — sigue el movimiento de las
                estrellas, permite exposiciones de minutos sin estelas; (2) apilamiento de varias
                fotos cortas — apilando 10 fotos de 15 s en software (Sequator, DeepSkyStacker)
                obtienes el equivalente a 150 s de calidad sin estelas; (3) aceptar las estelas
                como parte del look.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Esto sirve para fotografía deep-sky?</strong>
              <p>
                No directamente. Esta calculadora asume astrofoto &quot;nightscape&quot; (paisaje
                + estrellas) sin seguimiento. Para nebulosas y galaxias necesitas un montura
                ecuatorial motorizada que sigue el cielo, y los tiempos pueden ser de minutos a
                horas.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Cómo planificar una sesión de Vía Láctea</h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Comprueba la fase lunar</strong>
                <p>
                  La Vía Láctea solo se ve bien con Luna nueva o luna creciente baja. Una Luna
                  llena arruina la sesión. Usa una app de fases o el calendario lunar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Encuentra un cielo oscuro</strong>
                <p>
                  Aléjate al menos 30-50 km de ciudades grandes. Usa mapas de contaminación lumínica
                  (LightPollutionMap.info) para localizar zonas Bortle 3 o mejor.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Sabe dónde está la Vía Láctea</strong>
                <p>
                  El núcleo galáctico (Sagitario) es visible en hemisferio norte de marzo a
                  septiembre. Mejor visible en julio-agosto, al sur, 1-2 h después del crepúsculo
                  astronómico.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Configura la cámara con esta calculadora</strong>
                <p>
                  Modo manual, RAW, enfoque manual al infinito (truco: enfoca a una estrella
                  brillante con LiveView a 10×). Aplica el tiempo NPF, apertura máxima, ISO
                  3200-6400.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Revisa el histograma, no la pantalla</strong>
                <p>
                  La pantalla engaña en la oscuridad. Usa el histograma: tiene que haber datos en
                  el tercio medio para tener margen en edición. Si está pegado a la izquierda,
                  sube ISO o tiempo.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📷</span>
              <div>
                <strong>Dispara siempre en RAW</strong>
                <p>Imprescindible para recuperar sombras y ajustar WB sin pérdida en posproducción.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔭</span>
              <div>
                <strong>Trípode firme y disparador remoto</strong>
                <p>O el temporizador de 2 s. Pulsar el botón ya genera trepidación visible en exposiciones largas.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <div>
                <strong>Enfoca manualmente al infinito</strong>
                <p>El AF no funciona en oscuridad. LiveView a 10×, enfoca a una estrella brillante hasta verla puntual.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <div>
                <strong>Apila varias fotos cortas</strong>
                <p>10 × 15 s apiladas en Sequator dan más calidad que 1 × 150 s — sin estelas y menos ruido.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌙</span>
              <div>
                <strong>Luna nueva o creciente baja</strong>
                <p>Con luna llena no hay Vía Láctea posible. Planifica la sesión en el calendario lunar.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎓</span>
              <div>
                <strong>Combínalo con el resto de simuladores</strong>
                <p>
                  Mira el <a href="/simulador-fotografia/">triángulo de exposición</a>, el{' '}
                  <a href="/calculadora-profundidad-campo/">DoF</a> y el{' '}
                  <a href="/visualizador-focales-fotografia/">visualizador de focales</a>.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Aplicar la regla 500 con cámaras de alta resolución y descubrir estelas en el
                resultado final. En sensores &gt;24 MP, usa NPF o regla 400/300.
              </li>
              <li>
                Confiar en el autofoco para enfocar al infinito. En oscuridad, el AF falla. Usa
                LiveView a 10×.
              </li>
              <li>
                Disparar en JPEG: imposible recuperar la calidad nocturna luego. RAW siempre.
              </li>
              <li>
                Olvidar la regla 1/focal de trepidación: tu trípode también la sufre con viento.
                Para focales largas, cuelga peso del trípode.
              </li>
              <li>
                Subir el ISO más de lo necesario por miedo a subexponer. La sombra negra en RAW se
                recupera; el ruido extra no.
              </li>
              <li>
                Mezclar fotos con la luna alta y pretender Vía Láctea: la luz lunar lava el cielo
                aunque la Luna no esté en el encuadre.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-regla-500-npf-astrofoto')} />
        <ShareCard appName="calculadora-regla-500-npf-astrofoto" />
      </main>

      <Footer appName="calculadora-regla-500-npf-astrofoto" />
    </div>
  );
}

interface CieloSVGProps {
  tiempo: number;
  tiempoNPF: number;
  focalMM: number;
}

interface EstrellaPos {
  x: number;
  y: number;
  r: number;
  brillo: number;
  angulo: number;
}

const ESTRELLAS_FIJAS: EstrellaPos[] = [
  { x: 0.08, y: 0.18, r: 2.5, brillo: 1, angulo: 0 },
  { x: 0.22, y: 0.4, r: 1.5, brillo: 0.7, angulo: 5 },
  { x: 0.35, y: 0.15, r: 2.2, brillo: 0.9, angulo: 10 },
  { x: 0.48, y: 0.55, r: 1.2, brillo: 0.6, angulo: 12 },
  { x: 0.6, y: 0.25, r: 3, brillo: 1, angulo: 14 },
  { x: 0.72, y: 0.42, r: 1.8, brillo: 0.8, angulo: 18 },
  { x: 0.83, y: 0.18, r: 2, brillo: 0.9, angulo: 20 },
  { x: 0.92, y: 0.5, r: 1.3, brillo: 0.6, angulo: 22 },
  { x: 0.15, y: 0.62, r: 2.2, brillo: 0.85, angulo: 8 },
  { x: 0.28, y: 0.72, r: 1.5, brillo: 0.7, angulo: 11 },
  { x: 0.42, y: 0.3, r: 1.8, brillo: 0.75, angulo: 13 },
  { x: 0.55, y: 0.78, r: 2.5, brillo: 0.95, angulo: 16 },
  { x: 0.67, y: 0.6, r: 1.5, brillo: 0.7, angulo: 17 },
  { x: 0.78, y: 0.7, r: 1.8, brillo: 0.8, angulo: 19 },
  { x: 0.05, y: 0.45, r: 1.5, brillo: 0.65, angulo: 4 },
  { x: 0.18, y: 0.85, r: 2, brillo: 0.85, angulo: 9 },
  { x: 0.4, y: 0.85, r: 1.5, brillo: 0.7, angulo: 14 },
  { x: 0.62, y: 0.85, r: 2, brillo: 0.85, angulo: 17 },
  { x: 0.85, y: 0.85, r: 1.8, brillo: 0.8, angulo: 20 },
  { x: 0.95, y: 0.32, r: 1.5, brillo: 0.7, angulo: 21 },
];

function CieloSVG({ tiempo, tiempoNPF }: CieloSVGProps) {
  const W = 480;
  const H = 220;

  // Longitud de la estela: proporcional al exceso sobre NPF
  const excessFactor = Math.max(0, tiempo / tiempoNPF - 1);
  const estelaPx = Math.min(28, excessFactor * 12);

  return (
    <svg
      className={styles.cieloSvg}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Cielo nocturno con tiempo de exposición ${tiempo} segundos`}
    >
      <defs>
        <radialGradient id="cieloNoche" cx="50%" cy="100%" r="120%">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#0f172a" stopOpacity="1" />
          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="vialacteaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cielo */}
      <rect x={0} y={0} width={W} height={H} fill="url(#cieloNoche)" />

      {/* Vía Láctea suave en diagonal */}
      <ellipse
        cx={W * 0.5}
        cy={H * 0.55}
        rx={W * 0.55}
        ry={H * 0.15}
        fill="url(#vialacteaGrad)"
        transform={`rotate(-18 ${W * 0.5} ${H * 0.55})`}
      />

      {/* Silueta de montaña al fondo */}
      <polygon
        points={`0,${H} 0,${H * 0.88} ${W * 0.2},${H * 0.78} ${W * 0.35},${H * 0.85} ${W * 0.55},${H * 0.7} ${W * 0.7},${H * 0.82} ${W * 0.85},${H * 0.75} ${W},${H * 0.88} ${W},${H}`}
        fill="#0a0a14"
      />

      {/* Estrellas: puntos o estelas según el tiempo */}
      {ESTRELLAS_FIJAS.map((e, idx) => {
        const cx = e.x * W;
        const cy = e.y * H * 0.78; // limitamos al 78% superior (encima de montañas)
        const opacity = e.brillo;

        if (estelaPx < 0.5) {
          // Estrellas como puntos
          return <circle key={idx} cx={cx} cy={cy} r={e.r} fill="#fff" opacity={opacity} />;
        }

        // Estrellas como estelas (líneas inclinadas según ángulo)
        const angRad = (e.angulo * Math.PI) / 180;
        const dx = Math.cos(angRad) * estelaPx;
        const dy = Math.sin(angRad) * estelaPx * 0.3;
        return (
          <line
            key={idx}
            x1={cx - dx / 2}
            y1={cy - dy / 2}
            x2={cx + dx / 2}
            y2={cy + dy / 2}
            stroke="#fff"
            strokeWidth={e.r * 1.5}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}

      {/* Banda de zona de tiempo */}
      <text
        x={W / 2}
        y={H - 8}
        fontSize="11"
        fill="#94a3b8"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
      >
        Vista previa: estrellas a {tiempo} s vs NPF {isFinite(tiempoNPF) ? `${formatNumber(tiempoNPF, 1)} s` : '∞'}
      </text>
    </svg>
  );
}
