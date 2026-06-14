'use client';
// @disclaimer: exempt

import { useState, useCallback, useMemo } from 'react';
import styles from './GeneradorGradientes.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type GradientType = 'linear' | 'radial' | 'conic';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientPreset {
  name: string;
  colors: { color: string; position: number }[];
  type: GradientType;
  angle: number;
}

const PRESETS: GradientPreset[] = [
  { name: 'Atardecer', colors: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 100 }], type: 'linear', angle: 135 },
  { name: 'Océano', colors: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }], type: 'linear', angle: 135 },
  { name: 'Bosque', colors: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }], type: 'linear', angle: 135 },
  { name: 'Lavanda', colors: [{ color: '#a18cd1', position: 0 }, { color: '#fbc2eb', position: 100 }], type: 'linear', angle: 135 },
  { name: 'Medianoche', colors: [{ color: '#232526', position: 0 }, { color: '#414345', position: 100 }], type: 'linear', angle: 135 },
  { name: 'Aurora', colors: [{ color: '#00c6fb', position: 0 }, { color: '#005bea', position: 100 }], type: 'linear', angle: 135 },
  { name: 'Fuego', colors: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }], type: 'linear', angle: 90 },
  { name: 'Menta', colors: [{ color: '#00b09b', position: 0 }, { color: '#96c93d', position: 100 }], type: 'linear', angle: 45 },
  { name: 'Arcoíris', colors: [{ color: '#ff0000', position: 0 }, { color: '#ff7f00', position: 17 }, { color: '#ffff00', position: 33 }, { color: '#00ff00', position: 50 }, { color: '#0000ff', position: 67 }, { color: '#4b0082', position: 83 }, { color: '#9400d3', position: 100 }], type: 'linear', angle: 90 },
  { name: 'meskeIA', colors: [{ color: '#2E86AB', position: 0 }, { color: '#48A9A6', position: 100 }], type: 'linear', angle: 135 },
];

const RADIAL_SHAPES = ['circle', 'ellipse'] as const;
const RADIAL_POSITIONS = [
  'center', 'top', 'bottom', 'left', 'right',
  'top left', 'top right', 'bottom left', 'bottom right'
] as const;

export default function GeneradorGradientesPage() {
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(135);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#2E86AB', position: 0 },
    { id: '2', color: '#48A9A6', position: 100 },
  ]);
  const [radialShape, setRadialShape] = useState<typeof RADIAL_SHAPES[number]>('circle');
  const [radialPosition, setRadialPosition] = useState<typeof RADIAL_POSITIONS[number]>('center');
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addColorStop = useCallback(() => {
    if (colorStops.length >= 10) return;

    const positions = colorStops.map(s => s.position).sort((a, b) => a - b);
    let newPosition = 50;

    for (let i = 0; i < positions.length - 1; i++) {
      const gap = positions[i + 1] - positions[i];
      if (gap > 20) {
        newPosition = positions[i] + gap / 2;
        break;
      }
    }

    setColorStops([...colorStops, { id: generateId(), color: '#ffffff', position: newPosition }]);
  }, [colorStops]);

  const removeColorStop = useCallback((id: string) => {
    if (colorStops.length <= 2) return;
    setColorStops(colorStops.filter(stop => stop.id !== id));
  }, [colorStops]);

  const updateColorStop = useCallback((id: string, field: 'color' | 'position', value: string | number) => {
    setColorStops(colorStops.map(stop =>
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  }, [colorStops]);

  const gradientCSS = useMemo(() => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${stopsString})`;
      case 'radial':
        return `radial-gradient(${radialShape} at ${radialPosition}, ${stopsString})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg at ${radialPosition}, ${stopsString})`;
      default:
        return '';
    }
  }, [gradientType, angle, colorStops, radialShape, radialPosition]);

  const fullCSS = useMemo(() => {
    return `background: ${gradientCSS};`;
  }, [gradientCSS]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const applyPreset = (preset: GradientPreset) => {
    setGradientType(preset.type);
    setAngle(preset.angle);
    setColorStops(preset.colors.map((c, i) => ({
      id: generateId(),
      color: c.color,
      position: c.position
    })));
  };

  const reverseGradient = () => {
    setColorStops(colorStops.map(stop => ({
      ...stop,
      position: 100 - stop.position
    })));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🎨</span> Generador de Gradientes CSS</h1>
        <p className={styles.subtitle}>
          Crea degradados profesionales con editor visual
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Preview */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Vista Previa</h2>

          <div
            className={styles.previewBox}
            style={{ background: gradientCSS }}
            role="img"
            aria-label={`Vista previa del gradiente: ${gradientCSS}`}
          />

          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <span>CSS</span>
              <button
                onClick={copyToClipboard}
                className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                aria-label="Copiar código CSS al portapapeles"
              >
                <span role="status" aria-live="polite">{copied ? '✓ Copiado' : <><span aria-hidden="true">📋</span> Copiar</>}</span>
              </button>
            </div>
            <pre className={styles.codeBlock}>
              <code>{fullCSS}</code>
            </pre>
          </div>

          {/* Presets */}
          <div className={styles.presetsSection}>
            <h3 className={styles.sectionTitle}>Presets</h3>
            <div className={styles.presetsGrid}>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetBtn}
                  onClick={() => applyPreset(preset)}
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.map(c => `${c.color} ${c.position}%`).join(', ')})`
                  }}
                  title={preset.name}
                >
                  <span className={styles.presetName}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Controles */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración</h2>

          {/* Tipo de gradiente */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Tipo de Gradiente</label>
            <div className={styles.typeTabs}>
              <button
                className={`${styles.typeBtn} ${gradientType === 'linear' ? styles.typeActive : ''}`}
                onClick={() => setGradientType('linear')}
                aria-pressed={gradientType === 'linear'}
              >
                <span aria-hidden="true">↗️</span> Lineal
              </button>
              <button
                className={`${styles.typeBtn} ${gradientType === 'radial' ? styles.typeActive : ''}`}
                onClick={() => setGradientType('radial')}
                aria-pressed={gradientType === 'radial'}
              >
                <span aria-hidden="true">⭕</span> Radial
              </button>
              <button
                className={`${styles.typeBtn} ${gradientType === 'conic' ? styles.typeActive : ''}`}
                onClick={() => setGradientType('conic')}
                aria-pressed={gradientType === 'conic'}
              >
                <span aria-hidden="true">🔄</span> Cónico
              </button>
            </div>
          </div>

          {/* Ángulo (para linear y conic) */}
          {(gradientType === 'linear' || gradientType === 'conic') && (
            <div className={styles.controlGroup}>
              <label className={styles.label}>
                Ángulo: {angle}°
              </label>
              <div className={styles.angleControl}>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className={styles.slider}
                />
                <div className={styles.anglePresets}>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                    <button
                      key={a}
                      className={`${styles.angleBtn} ${angle === a ? styles.angleActive : ''}`}
                      onClick={() => setAngle(a)}
                      aria-pressed={angle === a}
                    >
                      {a}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Opciones radiales */}
          {gradientType === 'radial' && (
            <>
              <div className={styles.controlGroup}>
                <label className={styles.label}>Forma</label>
                <div className={styles.selectRow}>
                  {RADIAL_SHAPES.map(shape => (
                    <button
                      key={shape}
                      className={`${styles.shapeBtn} ${radialShape === shape ? styles.shapeActive : ''}`}
                      onClick={() => setRadialShape(shape)}
                      aria-pressed={radialShape === shape}
                    >
                      <span aria-hidden="true">{shape === 'circle' ? '⚫' : '🥚'}</span> {shape === 'circle' ? 'Círculo' : 'Elipse'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Posición (para radial y conic) */}
          {(gradientType === 'radial' || gradientType === 'conic') && (
            <div className={styles.controlGroup}>
              <label className={styles.label}>Posición</label>
              <div className={styles.positionGrid}>
                {RADIAL_POSITIONS.map(pos => (
                  <button
                    key={pos}
                    className={`${styles.positionBtn} ${radialPosition === pos ? styles.positionActive : ''}`}
                    onClick={() => setRadialPosition(pos)}
                    aria-pressed={radialPosition === pos}
                    aria-label={pos}
                  >
                    <span aria-hidden="true">
                      {pos === 'center' ? '⊙' :
                       pos === 'top' ? '↑' :
                       pos === 'bottom' ? '↓' :
                       pos === 'left' ? '←' :
                       pos === 'right' ? '→' :
                       pos === 'top left' ? '↖' :
                       pos === 'top right' ? '↗' :
                       pos === 'bottom left' ? '↙' : '↘'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Stops */}
          <div className={styles.controlGroup}>
            <div className={styles.stopsHeader}>
              <label className={styles.label}>Colores ({colorStops.length}/10)</label>
              <div className={styles.stopsActions}>
                <button
                  onClick={reverseGradient}
                  className={styles.actionBtn}
                  aria-label="Invertir gradiente"
                >
                  <span aria-hidden="true">⇄</span>
                </button>
                <button
                  onClick={addColorStop}
                  className={styles.actionBtn}
                  disabled={colorStops.length >= 10}
                  aria-label="Añadir color"
                >
                  <span aria-hidden="true">+</span>
                </button>
              </div>
            </div>

            <div className={styles.colorStops}>
              {colorStops.map((stop, index) => (
                <div key={stop.id} className={styles.colorStop}>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                    className={styles.colorInput}
                    aria-label={`Color ${index + 1} (selector visual)`}
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                    className={styles.hexInput}
                    aria-label={`Color ${index + 1} (valor hexadecimal)`}
                  />
                  <input
                    type="number"
                    value={stop.position}
                    onChange={(e) => updateColorStop(stop.id, 'position', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className={styles.positionInput}
                    inputMode="numeric"
                    aria-label={`Posición del color ${index + 1} en porcentaje`}
                  />
                  <span className={styles.percentSign}>%</span>
                  <button
                    onClick={() => removeColorStop(stop.id)}
                    className={styles.removeBtn}
                    disabled={colorStops.length <= 2}
                    aria-label={`Eliminar color ${index + 1}`}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>Tipos de Gradientes CSS</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">↗️</span>
            <h4>Linear Gradient</h4>
            <p>Transición suave en línea recta. Perfecto para fondos, botones y headers</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">⭕</span>
            <h4>Radial Gradient</h4>
            <p>Se expande desde un punto central. Ideal para efectos de luz y profundidad</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon} aria-hidden="true">🔄</span>
            <h4>Conic Gradient</h4>
            <p>Rotación alrededor de un punto. Útil para gráficos circulares y efectos modernos</p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Guía de Gradientes CSS"
        subtitle="Todo lo que necesitas saber para crear gradientes profesionales"
        icon="🎨"
      >
        {/* 1. TABLA COMPARATIVA — tipos de gradiente */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de Gradiente</th>
                <th>Sintaxis CSS</th>
                <th>Dirección</th>
                <th>Mejor uso</th>
                <th>Compatibilidad</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Linear</td><td>linear-gradient()</td><td>Línea recta</td><td>Fondos, botones, separadores</td><td>✅ Todos los navegadores</td></tr>
              <tr><td>Radial</td><td>radial-gradient()</td><td>Desde un punto central</td><td>Efectos de luz, spotlight</td><td>✅ Todos los navegadores</td></tr>
              <tr><td>Cónico</td><td>conic-gradient()</td><td>Alrededor de un punto</td><td>Gráficos circulares, ruedas de color</td><td>✅ Chrome 69+, Firefox 83+</td></tr>
              <tr><td>Repetitivo linear</td><td>repeating-linear-gradient()</td><td>Líneas repetidas</td><td>Patrones, rayas, zebra</td><td>✅ Todos los navegadores</td></tr>
              <tr><td>Repetitivo radial</td><td>repeating-radial-gradient()</td><td>Anillos concéntricos</td><td>Efectos de onda, diana</td><td>✅ Todos los navegadores</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🖥️</span>
              <strong>Diseñador Web</strong>
            </div>
            <p>Crea gradientes para fondos de hero sections, botones call-to-action y separadores de secciones que combinen con la paleta de marca.</p>
            <div className={styles.escenarioTip}>Tip: Para hero sections usa ángulos de 135° con colores de marca al 80% de opacidad.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📱</span>
              <strong>Desarrollador Frontend</strong>
            </div>
            <p>Genera código CSS listo para copiar y pegar en proyectos React, Vue o Angular. Compatibilidad garantizada con navegadores modernos.</p>
            <div className={styles.escenarioTip}>Tip: Usa variables CSS (--color-primary) en lugar de colores hardcodeados para gradientes reutilizables.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎓</span>
              <strong>Estudiante de Diseño</strong>
            </div>
            <p>Experimenta con teoría del color y transiciones para entender cómo los gradientes afectan la percepción visual y la jerarquía de la información.</p>
            <div className={styles.escenarioTip}>Tip: Los gradientes análogos (colores adyacentes en la rueda) crean transiciones más suaves y naturales.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🛍️</span>
              <strong>Emprendedor / Marketing</strong>
            </div>
            <p>Diseña gradientes para banners de redes sociales, fondos de presentaciones y materiales de marca con aspecto profesional sin contratar diseñador.</p>
            <div className={styles.escenarioTip}>Tip: Los gradientes de morado a rosa funcionan excepcionalmente bien en Instagram y redes sociales.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre Gradientes CSS</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuántos colores se pueden usar en un gradiente?</div>
              <div className={styles.faqRespuesta}>No hay límite técnico. Se pueden usar tantos color stops como se necesiten. Sin embargo, más de 4-5 colores suele crear gradientes caóticos. Lo más efectivo es usar 2-3 colores bien elegidos con buen contraste entre ellos.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué diferencia hay entre linear-gradient y background-image con gradiente?</div>
              <div className={styles.faqRespuesta}>Son lo mismo. <code>linear-gradient()</code> es una función de imagen CSS, por lo que se asigna a <code>background-image</code> o <code>background</code>. No se puede usar en <code>background-color</code>.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo se añade transparencia a un gradiente?</div>
              <div className={styles.faqRespuesta}>Usando colores con canal alfa: <code>rgba(255, 0, 0, 0.5)</code> o la notación moderna <code>#FF000080</code> (HEX con alpha). También puedes usar <code>transparent</code> para transición a transparente.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Por qué mi gradiente se ve gris en el medio entre dos colores saturados?</div>
              <div className={styles.faqRespuesta}>Es el &quot;problema del gris&quot; en interpolación RGB. Los colores complementarios pasan por gris al mezclarse linealmente. La solución es añadir un color intermedio vibrante o usar interpolación en el espacio de color oklch con <code>in oklch</code>.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Los gradientes CSS afectan al rendimiento de la página?</div>
              <div className={styles.faqRespuesta}>Mínimamente. Son más eficientes que imágenes rasterizadas porque el navegador los renderiza en GPU. Sin embargo, gradientes muy complejos en elementos que cambian frecuentemente (como animaciones) sí pueden impactar el rendimiento.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Se pueden animar gradientes CSS?</div>
              <div className={styles.faqRespuesta}>Directamente no, porque CSS no interpola gradientes con <code>transition</code>. La técnica más común es animar <code>background-position</code> en un gradiente de fondo más grande (background-size: 200%), o usar @keyframes con custom properties.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es un color stop y cómo funciona?</div>
              <div className={styles.faqRespuesta}>Un color stop define dónde empieza o termina un color en el gradiente. Por ejemplo, <code>linear-gradient(red 20%, blue 80%)</code> indica que el rojo ocupa hasta el 20% y el azul comienza en el 80%, con transición entre ambos puntos.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo crear un gradiente con efecto de &quot;glassmorphism&quot;?</div>
              <div className={styles.faqRespuesta}>El glassmorphism combina <code>background: rgba(255,255,255,0.1)</code> con <code>backdrop-filter: blur(10px)</code> y un borde semitransparente. El gradiente en este contexto se aplica al fondo del contenedor padre, no al elemento glass.</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Define el propósito del gradiente</strong> — ¿Es un fondo de página, un botón, una barra de progreso? El contexto determina qué tipo (linear, radial, cónico) y qué intensidad de contraste es apropiada.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Elige los colores base</strong> — Parte de la paleta de tu marca o usa teoría del color: análogos para suavidad, complementarios para contraste, triádicos para dinamismo.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Selecciona el ángulo o dirección</strong> — 0° es vertical hacia arriba, 90° es horizontal hacia la derecha, 135° es diagonal. Los ángulos diagonales (45°, 135°) suelen dar mayor dinamismo.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Ajusta los color stops</strong> — Experimenta con la posición de cada color. Un stop al 30% concentra el primer color y da transición más brusca. Al 70% da más espacio al primer color.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Verifica la accesibilidad</strong> — Comprueba el contraste de cualquier texto sobre el gradiente. El contraste mínimo WCAG AA es 4.5:1 para texto normal. Usa una herramienta de contraste con el color más claro del gradiente.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Copia el código CSS generado</strong> — El código incluye los prefijos necesarios. Pégalo en tu hoja de estilos en la propiedad <code>background</code> o <code>background-image</code>.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🎯</span>
            <strong>Regla 60-30-10</strong>
            <p>Aplica el color dominante al 60%, el secundario al 30% y el de acento al 10%. Esta proporción crea gradientes equilibrados.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🌡️</span>
            <strong>Temperatura de color</strong>
            <p>Los gradientes cálidos (naranja→amarillo) transmiten energía y urgencia. Los fríos (azul→violeta) comunican calma y profesionalidad.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📐</span>
            <strong>Ángulos que funcionan</strong>
            <p>Los ángulos 45°, 135° y 160° son los más usados en diseño profesional. Evita 0° y 90° exactos salvo en diseños muy geométricos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔁</span>
            <strong>Gradientes repetitivos</strong>
            <p>Con <code>repeating-linear-gradient</code> puedes crear patrones de rayas sin imágenes. Ideal para texturas de fondo sutiles.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🌓</span>
            <strong>Dark mode</strong>
            <p>Los gradientes oscuros deben tener menos saturación que sus equivalentes en modo claro. Un azul vibrante en claro se convierte en un azul apagado en oscuro.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>💾</span>
            <strong>Variables CSS</strong>
            <p>Define tus colores de gradiente como custom properties: <code>--grad-start</code> y <code>--grad-end</code>. Así puedes cambiar el tema sin reescribir todos los gradientes.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Errores comunes con gradientes CSS</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Texto sobre gradiente sin verificar contraste</strong> — El contraste varía a lo largo del gradiente; compruébalo en el punto más desfavorable.</li>
            <li><strong>Demasiados colores</strong> — Más de 4 color stops suele producir resultados confusos. Simplifica y usa transiciones suaves.</li>
            <li><strong>Copiar sin prefijos de navegador</strong> — Para compatibilidad con Safari antiguo, algunos gradientes requieren <code>-webkit-</code>. Verifica siempre en varios navegadores.</li>
            <li><strong>Gradientes en background-color</strong> — <code>background-color</code> solo acepta colores sólidos. Los gradientes van en <code>background</code> o <code>background-image</code>.</li>
            <li><strong>Olvidar el fallback</strong> — Añade un <code>background-color</code> sólido antes del gradiente como fallback para navegadores muy antiguos.</li>
            <li><strong>Gradiente sin relación con la marca</strong> — Un gradiente genérico &quot;bonito&quot; que no respeta la paleta de marca daña la coherencia visual. Usa siempre colores de la identidad corporativa.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-gradientes')} />

      <ShareCard appName="generador-gradientes" />
      <Footer appName="generador-gradientes" />
    </div>
  );
}
