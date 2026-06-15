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
import {
  calcularBitrateVideo,
  type TipoResolucionVideo,
  type TipoCodecVideo,
} from '@/lib/calculadoras/videografia';
import styles from './CalculadoraBitrateVideo.module.css';

// ─── Constantes de configuración ──────────────────────────────────────────────

const RESOLUCIONES: { id: TipoResolucionVideo; etiqueta: string; pixels: string }[] = [
  { id: '480p',  etiqueta: '480p',  pixels: '854×480' },
  { id: '720p',  etiqueta: '720p',  pixels: '1280×720' },
  { id: '1080p', etiqueta: '1080p', pixels: '1920×1080' },
  { id: '2k',    etiqueta: '2K',    pixels: '2048×1080' },
  { id: '4k',    etiqueta: '4K',    pixels: '3840×2160' },
  { id: '8k',    etiqueta: '8K',    pixels: '7680×4320' },
];

const FPS_OPCIONES: number[] = [24, 25, 30, 50, 60, 120];

const CODECS: { id: TipoCodecVideo; etiqueta: string; color: string }[] = [
  { id: 'h264',     etiqueta: 'H.264',     color: '#2E86AB' },
  { id: 'h265',     etiqueta: 'H.265',     color: '#48A9A6' },
  { id: 'prores422', etiqueta: 'ProRes 422', color: '#7FB3D3' },
  { id: 'raw',      etiqueta: 'RAW',        color: '#1a5278' },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculadoraBitrateVideoPage() {
  const [resolucion, setResolucion] = useState<TipoResolucionVideo>('4k');
  const [fps, setFps] = useState<number>(30);
  const [codec, setCodec] = useState<TipoCodecVideo>('h264');
  const [duracion, setDuracion] = useState<string>('10');

  const duracionNum = useMemo(() => {
    const v = parseFloat(duracion.replace(',', '.'));
    return isNaN(v) || v <= 0 ? 1 : v;
  }, [duracion]);

  // Resultado para los parámetros seleccionados
  const resultado = useMemo(
    () => calcularBitrateVideo(resolucion, fps, duracionNum, codec),
    [resolucion, fps, duracionNum, codec],
  );

  // Comparativa de los 4 codecs con los mismos parámetros
  const comparativa = useMemo(
    () =>
      CODECS.map((c) => ({
        ...c,
        resultado: calcularBitrateVideo(resolucion, fps, duracionNum, c.id),
      })),
    [resolucion, fps, duracionNum],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}><span aria-hidden="true">📹</span> Calculadora de Bitrate y Tamaño de Vídeo</h1>
        <p className={styles.heroSubtitle}>
          Estima el bitrate y el espacio en disco para cualquier resolución y códec
        </p>
      </header>

      <main className={styles.main}>
        <LegalNotice />

        {/* ── Panel de configuración ── */}
        <section className={styles.configPanel} aria-label="Parámetros de vídeo">
          {/* Resolución */}
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Resolución</label>
            <div className={styles.selectorResolucion} role="group" aria-label="Seleccionar resolución">
              {RESOLUCIONES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={`${styles.resBtn} ${resolucion === r.id ? styles.resBtnActive : ''}`}
                  onClick={() => setResolucion(r.id)}
                  aria-pressed={resolucion === r.id}
                  title={r.pixels}
                >
                  <span className={styles.resBtnLabel}>{r.etiqueta}</span>
                  <span className={styles.resBtnPixels}>{r.pixels}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FPS */}
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Fotogramas por segundo (fps)</label>
            <div className={styles.selectorFps} role="group" aria-label="Seleccionar fps">
              {FPS_OPCIONES.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`${styles.fpsBtn} ${fps === f ? styles.fpsBtnActive : ''}`}
                  onClick={() => setFps(f)}
                  aria-pressed={fps === f}
                >
                  {f} fps
                </button>
              ))}
            </div>
          </div>

          {/* Códec */}
          <div className={styles.configGroup}>
            <label className={styles.configLabel}>Códec</label>
            <div className={styles.selectorCodec} role="group" aria-label="Seleccionar códec">
              {CODECS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.codecBtn} ${codec === c.id ? styles.codecBtnActive : ''}`}
                  onClick={() => setCodec(c.id)}
                  aria-pressed={codec === c.id}
                  style={codec === c.id ? { borderColor: c.color, backgroundColor: c.color } : {}}
                >
                  {c.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {/* Duración */}
          <div className={styles.configGroup}>
            <label htmlFor="duracion-input" className={styles.configLabel}>
              Duración del vídeo (minutos)
            </label>
            <input
              id="duracion-input"
              type="number"
              min={0.1}
              max={600}
              step={0.5}
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              className={styles.duracionInput}
              inputMode="decimal"
              aria-label="Duración del vídeo en minutos"
            />
          </div>
        </section>

        {/* ── Resultados principales ── */}
        <section className={styles.resultadosPanel} role="status" aria-live="polite" aria-atomic="true" aria-label="Resultados">
          <div className={styles.resultadoDestacadoGrid}>
            <div className={styles.resultadoDestacado}>
              <span className={styles.resultadoIcono} aria-hidden="true">📡</span>
              <span className={styles.resultadoValor}>{resultado.bitrate_mbps} Mbps</span>
              <span className={styles.resultadoEtiqueta}>Bitrate estimado</span>
            </div>
            <div className={styles.resultadoDestacado}>
              <span className={styles.resultadoIcono} aria-hidden="true">💾</span>
              <span className={styles.resultadoValor}>{resultado.tamano_formateado}</span>
              <span className={styles.resultadoEtiqueta}>Tamaño de archivo</span>
            </div>
          </div>
          <p className={styles.resultadoDescripcion} role="status" aria-live="polite">
            {resultado.descripcion}
          </p>
        </section>

        {/* ── Comparativa de códecs ── */}
        <section className={styles.comparativaSection} aria-label="Comparativa entre códecs">
          <h2 className={styles.sectionTitle}>Comparativa de códecs para {resolucion} · {fps} fps · {duracionNum} min</h2>
          <div className={styles.tablaComparativaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th scope="col">Códec</th>
                  <th scope="col">Bitrate (Mbps)</th>
                  <th scope="col">Tamaño archivo</th>
                  <th scope="col">Uso típico</th>
                </tr>
              </thead>
              <tbody>
                {comparativa.map((c) => (
                  <tr
                    key={c.id}
                    className={codec === c.id ? styles.filaActiva : ''}
                  >
                    <td>
                      <span
                        className={styles.codecBadge}
                        style={{ backgroundColor: c.color }}
                        aria-label={`Códec ${c.etiqueta}`}
                      >
                        {c.etiqueta}
                      </span>
                    </td>
                    <td className={styles.celdaNumero}>{c.resultado.bitrate_mbps} Mbps</td>
                    <td className={styles.celdaNumero}>{c.resultado.tamano_formateado}</td>
                    <td className={styles.celdaUso}>{usoTipico(c.id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Sección educativa ── */}
        <EducationalSection
          title="Guía de Bitrate y Almacenamiento en Vídeo"
          subtitle="Qué significan los números y cómo planificar el almacenamiento en producción"
          icon="🎬"
        >
          <h3 className={styles.eduSubtitle}>¿Qué es el bitrate y por qué importa?</h3>
          <p className={styles.eduParrafo}>
            El <strong>bitrate</strong> (tasa de bits) es la cantidad de datos que se procesan por segundo
            al grabar o reproducir un vídeo, expresado en Mbps (megabits por segundo). Un bitrate más alto
            captura más detalle y produce archivos de mayor calidad, pero también ocupa más espacio en disco.
          </p>
          <p className={styles.eduParrafo}>
            El <strong>tamaño final del archivo</strong> depende del bitrate y de la duración: si grabas
            a 45 Mbps durante 10 minutos, necesitas aproximadamente (45 × 600 ÷ 8) = 3,375 MB ≈ 3,3 GB.
            Esta calculadora aplica esa fórmula teniendo en cuenta el efecto del fps y el factor de
            compresión de cada códec.
          </p>

          <h3 className={styles.eduSubtitle}>H.264 vs H.265 vs ProRes 422 vs RAW</h3>
          <div className={styles.tablaComparativaWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th scope="col">Códec</th>
                  <th scope="col">Compresión</th>
                  <th scope="col">Calidad</th>
                  <th scope="col">Rendimiento en edición</th>
                  <th scope="col">Cuándo usarlo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>H.264 / AVC</strong></td>
                  <td>Alta (×1)</td>
                  <td>Buena para distribución</td>
                  <td>Exige CPU/GPU; puede necesitar proxies</td>
                  <td>Redes sociales, YouTube, entrega final</td>
                </tr>
                <tr>
                  <td><strong>H.265 / HEVC</strong></td>
                  <td>Muy alta (≈×0,55 vs H.264)</td>
                  <td>Igual o superior a H.264 con menos datos</td>
                  <td>Más exigente que H.264; proxies recomendados</td>
                  <td>Archivos más ligeros que H.264, UHD en cámaras de consumo</td>
                </tr>
                <tr>
                  <td><strong>ProRes 422</strong></td>
                  <td>Baja (≈×10 vs H.264)</td>
                  <td>Alta; conserva mucho rango dinámico</td>
                  <td>Fluido en edición sin proxies</td>
                  <td>Producción profesional, documentales, posproducción</td>
                </tr>
                <tr>
                  <td><strong>RAW</strong></td>
                  <td>Mínima (≈×40 vs H.264)</td>
                  <td>Máxima; datos crudos del sensor</td>
                  <td>Pesado; requiere software dedicado y hardware potente</td>
                  <td>Cine, efectos visuales, máxima flexibilidad en color</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={styles.eduParrafo}>
            <strong>Nota:</strong> Los valores RAW son estimaciones. Los formatos RAW varían mucho según
            la cámara (BRAW de Blackmagic, ARRIRAW, CinemaDNG…) y algunos incluyen compresión lossless.
          </p>

          <h3 className={styles.eduSubtitle}>¿Cuándo usar cada códec?</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>📱 Redes sociales y YouTube</h4>
              <p>
                H.264 o H.265 en 1080p o 4K son la elección estándar. Ofrecen un equilibrio óptimo entre
                calidad de imagen y tamaño de archivo manejable para la distribución digital.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🎬 Producción profesional</h4>
              <p>
                ProRes 422 (o ProRes 4444 para transparencias) es el estándar de la industria para edición
                y posproducción. Los archivos son grandes, pero la edición fluye sin trabas y el rango de
                color es amplio.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>🎥 Cine y efectos visuales</h4>
              <p>
                RAW captura los datos brutos del sensor para máxima flexibilidad en gradación de color y
                efectos. Requiere almacenamiento masivo y flujos de trabajo especializados (DaVinci Resolve,
                ACES, etc.).
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>💾 Archivado a largo plazo</h4>
              <p>
                ProRes o un H.265 de bitrate alto son buenas opciones: ProRes por su calidad sin pérdidas
                significativas; H.265 por su tamaño reducido si el espacio es limitado pero se necesita
                buena calidad durante años.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Planificación de almacenamiento en producción</h3>
          <p className={styles.eduParrafo}>
            Calcular el almacenamiento necesario para un rodaje o proyecto de vídeo evita sorpresas.
            Algunos criterios prácticos:
          </p>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Estima la duración total grabada, no la del vídeo final</strong>
                <p>
                  Un documental de 30 minutos puede implicar 5-10 horas de material grabado.
                  Usa la relación de grabación (filming ratio) para calcular el almacenamiento real necesario.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Añade un margen del 20-30 % sobre la estimación</strong>
                <p>
                  Las estimaciones de bitrate son promedios. Las escenas con mucho movimiento generan
                  más datos con códecs de tasa variable (VBR) como H.264 y H.265.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Planifica la copia de seguridad desde el primer día</strong>
                <p>
                  En producciones profesionales, el material se duplica mínimo en dos dispositivos
                  físicos distintos desde el momento de la descarga de cámara. Multiplica el almacenamiento
                  estimado por 2 (o 3 para proyectos críticos).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Considera la velocidad de escritura de las tarjetas</strong>
                <p>
                  RAW y ProRes 4K requieren tarjetas CFexpress o SSDs rápidos. Comprueba que la tarjeta
                  puede sostener el bitrate de grabación del códec elegido sin interrupciones.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Evalúa si necesitas proxies en edición</strong>
                <p>
                  H.265 y RAW pueden saturar ordenadores sin GPU potente. Los proxies (versiones H.264
                  de baja resolución para editar) ahorran tiempo y permiten usar equipos menos potentes
                  sin sacrificar la calidad del material original.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué H.265 ocupa menos que H.264 con la misma calidad?</strong>
              <p>
                H.265 (HEVC) usa algoritmos de compresión más avanzados que H.264 (AVC): analiza
                bloques más grandes de imagen y elimina redundancias de forma más eficiente. El resultado
                es aproximadamente el mismo nivel de calidad visual con un archivo de la mitad de tamaño,
                aunque requiere más potencia de procesamiento tanto para codificar como para decodificar.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué es la tasa de bits variable (VBR) frente a la constante (CBR)?</strong>
              <p>
                Con CBR (tasa constante), el códec usa siempre el mismo bitrate, independientemente del
                contenido. Con VBR (tasa variable), el códec asigna más datos a escenas complejas y menos
                a escenas simples. VBR suele producir mejor calidad por el mismo tamaño de archivo, pero
                los tamaños son menos predecibles. Esta calculadora usa valores medios (aproximación de
                CBR) como referencia de planificación.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿El fps afecta al tamaño del archivo?</strong>
              <p>
                Sí, de forma proporcional. A 60 fps hay el doble de fotogramas por segundo que a 30 fps,
                lo que aproximadamente duplica el bitrate y el tamaño del archivo para el mismo contenido.
                El slow motion grabado a 120 fps ocupa cuatro veces más que a 30 fps.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿ProRes es mejor que RAW para posproducción?</strong>
              <p>
                Depende del objetivo. RAW preserva exactamente los datos crudos del sensor, lo que
                da la máxima flexibilidad para la gradación de color y recuperación de detalles. Sin
                embargo, ProRes 4444 es considerado &quot;visualmente sin pérdidas&quot; para la gran
                mayoría de producciones y es mucho más manejable. RAW suele reservarse para efectos
                visuales o cuando se requiere el máximo margen de maniobra posible.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Cómo sé qué tarjeta de memoria necesito?</strong>
              <p>
                La tarjeta debe soportar una velocidad de escritura sostenida igual o superior al bitrate
                de grabación. Por ejemplo, 4K ProRes 422 a 30 fps produce ≈450 Mbps ≈ 56 MB/s: necesitas
                una tarjeta con al menos 60-80 MB/s de escritura sostenida. Comprueba siempre la hoja de
                especificaciones de la cámara y de la tarjeta.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas en la gestión de almacenamiento</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💾</span>
              <div>
                <strong>Regla 3-2-1</strong>
                <p>3 copias del material, en 2 soportes distintos, con 1 copia fuera de la ubicación principal.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <div>
                <strong>Organiza por proyecto desde el inicio</strong>
                <p>Una estructura clara de carpetas (RAW, audio, proxy, proyecto edición) ahorra horas cuando el proyecto escala.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚡</span>
              <div>
                <strong>Proxies para edición fluida</strong>
                <p>Genera proxies H.264 de baja resolución para editar y enlaza al material original solo en el render final.</p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <div>
                <strong>Verifica las tarjetas antes del rodaje</strong>
                <p>Formatea siempre en la cámara (no en el ordenador) y haz una prueba de grabación para confirmar velocidades sostenidas.</p>
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
                Calcular solo el almacenamiento del material final, sin contar el material de rodaje
                en bruto: en ficción y documentales, la relación de grabación puede ser de 10:1 o más.
              </li>
              <li>
                Usar una tarjeta de clase 10 antigua para grabar 4K RAW: la velocidad sostenida mínima
                puede no alcanzarse, provocando cortes de grabación o archivos corruptos.
              </li>
              <li>
                Olvidar el espacio para el proyecto de edición, caché y renders: puede superar el
                tamaño del material original en proyectos con muchos efectos.
              </li>
              <li>
                Confiar en una sola copia del material durante el rodaje. Un disco puede fallar en
                cualquier momento; la regla es duplicar antes de borrar las tarjetas.
              </li>
              <li>
                Asumir que H.265 siempre es compatible: algunos equipos de transmisión en directo y
                software de edición más antiguo no soportan HEVC de forma nativa.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-bitrate-video')} />
        <ShareCard appName="calculadora-bitrate-video" />
      </main>

      <Footer appName="calculadora-bitrate-video" />
    </div>
  );
}

// ─── Función auxiliar: texto de uso típico por códec ─────────────────────────

function usoTipico(codec: TipoCodecVideo): string {
  switch (codec) {
    case 'h264':     return 'Distribución web, redes sociales';
    case 'h265':     return 'UHD eficiente, archivado moderado';
    case 'prores422': return 'Producción profesional, edición';
    case 'raw':      return 'Cine, efectos visuales, máxima calidad';
  }
}
