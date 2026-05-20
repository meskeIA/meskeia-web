'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraFovVideo.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularFOVVideo } from '@/lib/calculadoras/videografia';
import type { TipoSensor } from '@/lib/calculadoras/fotografia';

// Opciones de sensor
const SENSORES_OPCIONES: { valor: TipoSensor; etiqueta: string; detalle: string }[] = [
  { valor: 'ff',     etiqueta: 'Full Frame',          detalle: '36 × 24 mm — ×1,0' },
  { valor: 'apsc15', etiqueta: 'APS-C Nikon/Sony',    detalle: '23,5 × 15,6 mm — ×1,5' },
  { valor: 'apsc16', etiqueta: 'APS-C Canon',          detalle: '22,3 × 14,9 mm — ×1,6' },
  { valor: 'm43',    etiqueta: 'Micro 4/3',            detalle: '17,3 × 13,0 mm — ×2,0' },
];

// Focales comunes para acceso rápido
const FOCALES_COMUNES = [14, 16, 24, 28, 35, 50, 85, 135];

export default function CalculadoraFovVideoPage() {
  const [focal, setFocal] = useState<number>(24);
  const [focalInput, setFocalInput] = useState<string>('24');
  const [sensor, setSensor] = useState<TipoSensor>('ff');

  // Calcular resultado reactivamente
  const focalValida = focal >= 1 && focal <= 2000;
  const resultado = focalValida ? calcularFOVVideo(focal, sensor) : null;

  const handleFocalChange = useCallback((val: string) => {
    setFocalInput(val);
    const num = parseFloat(val.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      setFocal(num);
    }
  }, []);

  const handleFocalComun = useCallback((val: number) => {
    setFocal(val);
    setFocalInput(String(val));
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Ángulo de Campo (FOV) para Vídeo</h1>
        <p className={styles.subtitle}>Descubre el campo de visión de cualquier focal y sensor para vídeo</p>
      </header>

      {/* RGPD */}
      <LegalNotice />

      {/* Herramienta principal */}
      <div className={styles.mainContent}>

        {/* Panel izquierdo — inputs */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Configuración</h2>

          {/* Selector de sensor */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Tipo de sensor</label>
            <div className={styles.selectorSensor} role="group" aria-label="Seleccionar tipo de sensor">
              {SENSORES_OPCIONES.map(op => (
                <button
                  key={op.valor}
                  onClick={() => setSensor(op.valor)}
                  className={`${styles.sensorBtn} ${sensor === op.valor ? styles.sensorBtnActive : ''}`}
                  aria-pressed={sensor === op.valor}
                >
                  <span className={styles.sensorNombre}>{op.etiqueta}</span>
                  <span className={styles.sensorDetalle}>{op.detalle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input de focal */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="focal-input">
              Focal (mm)
            </label>
            <input
              id="focal-input"
              type="number"
              min={1}
              max={2000}
              step={1}
              value={focalInput}
              onChange={e => handleFocalChange(e.target.value)}
              className={styles.focalInput}
              inputMode="decimal"
              autoComplete="off"
              aria-label="Focal en milímetros"
            />
            <p className={styles.fieldHint}>Introduce la focal real de tu objetivo en mm</p>
          </div>

          {/* Focales comunes */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Focales comunes</label>
            <div className={styles.focalesGrid} role="group" aria-label="Acceso rápido a focales comunes">
              {FOCALES_COMUNES.map(f => (
                <button
                  key={f}
                  onClick={() => handleFocalComun(f)}
                  className={`${styles.focalBtn} ${focal === f ? styles.focalBtnActive : ''}`}
                  aria-pressed={focal === f}
                >
                  {f} mm
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho — resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* FOV destacado */}
              <div className={styles.fovDestacado} role="region" aria-label="Resultado principal FOV horizontal">
                <p className={styles.fovDestacadoLabel}>FOV horizontal</p>
                <p className={styles.fovDestacadoValor}>{resultado.fov_horizontal_deg}°</p>
                <p className={styles.fovClasificacion}>{resultado.clasificacion}</p>
                <p className={styles.fovSensorInfo}>
                  {resultado.sensorNombre} — {resultado.focal_mm} mm
                  {resultado.factorCrop > 1 ? ` (≡ ${resultado.focalEquivalenteFF} mm en FF)` : ''}
                </p>
              </div>

              {/* Tres ángulos */}
              <div className={styles.angulos}>
                <div className={styles.anguloCard}>
                  <span className={styles.anguloIcono} aria-hidden="true">↔</span>
                  <span className={styles.anguloTitulo}>Horizontal</span>
                  <span className={styles.anguloValor}>{resultado.fov_horizontal_deg}°</span>
                </div>
                <div className={styles.anguloCard}>
                  <span className={styles.anguloIcono} aria-hidden="true">↕</span>
                  <span className={styles.anguloTitulo}>Vertical</span>
                  <span className={styles.anguloValor}>{resultado.fov_vertical_deg}°</span>
                </div>
                <div className={styles.anguloCard}>
                  <span className={styles.anguloIcono} aria-hidden="true">↗</span>
                  <span className={styles.anguloTitulo}>Diagonal</span>
                  <span className={styles.anguloValor}>{resultado.fov_diagonal_deg}°</span>
                </div>
              </div>

              {/* Tabla comparativa entre sensores */}
              <div className={styles.comparativaWrapper}>
                <h3 className={styles.comparativaTitulo}>Comparativa de sensores — {resultado.focal_mm} mm</h3>
                <div className={styles.tablaComparativaWrapper} role="region" aria-label="Comparativa de FOV entre sensores">
                  <table className={styles.tablaComparativa}>
                    <thead>
                      <tr>
                        <th scope="col">Sensor</th>
                        <th scope="col">FOV horizontal</th>
                        <th scope="col">Focal equiv. FF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.comparativa.map(fila => (
                        <tr
                          key={fila.sensor}
                          className={fila.sensor === sensor ? styles.filaActiva : ''}
                        >
                          <td>{fila.nombre}</td>
                          <td><strong>{fila.fov_h}°</strong></td>
                          <td>{fila.sensor === 'ff' ? `${fila.focal_eq_ff} mm` : `${fila.focal_eq_ff} mm`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.sinResultado}>
              <p>Introduce una focal válida (1–2000 mm) para ver el ángulo de campo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Caja de aviso informativo */}
      <div className={styles.warningBox} role="note">
        <strong>Nota técnica:</strong> Los ángulos calculados corresponden a la relación de aspecto 16:9 estándar del sensor. En formatos con recorte adicional de vídeo (p. ej., 4K con crop extra), el FOV real puede ser algo menor. Consulta el manual de tu cámara para factores de recorte adicionales de vídeo.
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="Aprende sobre el ángulo de campo en vídeo"
        subtitle="Conceptos clave para elegir la focal correcta"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el ángulo de campo (FOV)?</h2>
          <p>
            El ángulo de campo (<em>Field of View</em>, FOV) es la porción del espacio que entra en el
            encuadre. Se mide en grados y depende de dos factores: la <strong>focal del objetivo</strong>
            (en mm) y el <strong>tamaño del sensor</strong>. Una focal corta da un ángulo amplio
            (más escena); una focal larga da un ángulo estrecho (menos escena, más compresión).
          </p>
          <p>
            El FOV horizontal es el más relevante en vídeo porque determina cuánto entra en el ancho
            de la imagen. El vertical depende de la relación de aspecto del sensor.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>El crop factor y su efecto en vídeo</h2>
          <p>
            El <strong>crop factor</strong> o factor de recorte indica cuánto más pequeño es un sensor
            respecto al Full Frame. Un APS-C con factor ×1,5 «recorta» el ángulo de visión como si
            usaras una focal 1,5× más larga en Full Frame.
          </p>
          <ul>
            <li><strong>Full Frame (×1,0):</strong> referencia universal.</li>
            <li><strong>APS-C Nikon/Sony (×1,5):</strong> un 35 mm actúa como un 52,5 mm en FF.</li>
            <li><strong>APS-C Canon (×1,6):</strong> un 35 mm actúa como un 56 mm en FF.</li>
            <li><strong>Micro 4/3 (×2,0):</strong> un 25 mm actúa como un 50 mm en FF.</li>
          </ul>
          <p>
            Además, muchas cámaras aplican un <strong>crop adicional en vídeo 4K</strong> incluso en
            modo Full Frame. Esto reduce aún más el ángulo de campo real. Verifica siempre el manual
            de tu cámara.
          </p>
        </section>

        <section className={styles.guideSection}>
          <h2>Focal para cada tipo de plano en vídeo</h2>
          <p>
            Estas son las focales de referencia aproximadas en un sensor <strong>Full Frame</strong>.
            Ajusta según tu crop factor.
          </p>
          <div className={styles.planoTable}>
            <div className={styles.planoRow}>
              <span className={styles.planoNombre}>Gran Plano General (GPG)</span>
              <span className={styles.planoFocal}>8–20 mm</span>
              <span className={styles.planoDesc}>Paisajes, arquitectura, escenas masivas. FOV {'>'} 90°</span>
            </div>
            <div className={styles.planoRow}>
              <span className={styles.planoNombre}>Plano General (PG)</span>
              <span className={styles.planoFocal}>20–35 mm</span>
              <span className={styles.planoDesc}>Cuerpo completo o grupo. FOV 55–90°</span>
            </div>
            <div className={styles.planoRow}>
              <span className={styles.planoNombre}>Plano Americano</span>
              <span className={styles.planoFocal}>35–50 mm</span>
              <span className={styles.planoDesc}>De rodillas a la cabeza. Visión «natural». FOV 35–55°</span>
            </div>
            <div className={styles.planoRow}>
              <span className={styles.planoNombre}>Plano Medio / Busto</span>
              <span className={styles.planoFocal}>50–85 mm</span>
              <span className={styles.planoDesc}>De cintura arriba. Ideal para entrevistas.</span>
            </div>
            <div className={styles.planoRow}>
              <span className={styles.planoNombre}>Primer Plano (PP)</span>
              <span className={styles.planoFocal}>85–135 mm</span>
              <span className={styles.planoDesc}>Rostro. Comprensión espacial mínima, bokeh natural.</span>
            </div>
            <div className={styles.planoRow}>
              <span className={styles.planoNombre}>Primerísimo Primer Plano</span>
              <span className={styles.planoFocal}>100–200 mm</span>
              <span className={styles.planoDesc}>Ojos, detalles. Fondo muy comprimido.</span>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Diferencia entre FOV horizontal, vertical y diagonal</h2>
          <ul>
            <li>
              <strong>Horizontal:</strong> el ángulo a lo ancho del encuadre. Es el valor de referencia
              más usado en vídeo (el ancho determina qué cabe en pantalla).
            </li>
            <li>
              <strong>Vertical:</strong> el ángulo a lo alto. En un sensor 16:9 es aproximadamente
              el 56% del horizontal.
            </li>
            <li>
              <strong>Diagonal:</strong> el ángulo de esquina a esquina. Es el valor más grande y
              el que suelen mencionar los fabricantes en publicidad. Útil para comparar objetivos.
            </li>
          </ul>
        </section>
      </EducationalSection>

      {/* Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('calculadora-fov-video')} />

      {/* Tarjeta de compartir */}
      <ShareCard appName="calculadora-fov-video" />

      {/* Footer */}
      <Footer appName="calculadora-fov-video" />
    </div>
  );
}
