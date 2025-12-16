'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './GeneradorGradientes.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
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
        <h1 className={styles.title}>🎨 Generador de Gradientes CSS</h1>
        <p className={styles.subtitle}>
          Crea degradados profesionales con editor visual
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Preview */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Vista Previa</h2>

          <div
            className={styles.previewBox}
            style={{ background: gradientCSS }}
          />

          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <span>CSS</span>
              <button
                onClick={copyToClipboard}
                className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
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
              >
                ↗️ Lineal
              </button>
              <button
                className={`${styles.typeBtn} ${gradientType === 'radial' ? styles.typeActive : ''}`}
                onClick={() => setGradientType('radial')}
              >
                ⭕ Radial
              </button>
              <button
                className={`${styles.typeBtn} ${gradientType === 'conic' ? styles.typeActive : ''}`}
                onClick={() => setGradientType('conic')}
              >
                🔄 Cónico
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
                    >
                      {shape === 'circle' ? '⚫ Círculo' : '🥚 Elipse'}
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
                  >
                    {pos === 'center' ? '⊙' :
                     pos === 'top' ? '↑' :
                     pos === 'bottom' ? '↓' :
                     pos === 'left' ? '←' :
                     pos === 'right' ? '→' :
                     pos === 'top left' ? '↖' :
                     pos === 'top right' ? '↗' :
                     pos === 'bottom left' ? '↙' : '↘'}
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
                  title="Invertir gradiente"
                >
                  ⇄
                </button>
                <button
                  onClick={addColorStop}
                  className={styles.actionBtn}
                  disabled={colorStops.length >= 10}
                  title="Añadir color"
                >
                  +
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
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                    className={styles.hexInput}
                  />
                  <input
                    type="number"
                    value={stop.position}
                    onChange={(e) => updateColorStop(stop.id, 'position', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                    className={styles.positionInput}
                  />
                  <span className={styles.percentSign}>%</span>
                  <button
                    onClick={() => removeColorStop(stop.id)}
                    className={styles.removeBtn}
                    disabled={colorStops.length <= 2}
                    title="Eliminar"
                  >
                    ×
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
            <span className={styles.infoIcon}>↗️</span>
            <h4>Linear Gradient</h4>
            <p>Transición suave en línea recta. Perfecto para fondos, botones y headers</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>⭕</span>
            <h4>Radial Gradient</h4>
            <p>Se expande desde un punto central. Ideal para efectos de luz y profundidad</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔄</span>
            <h4>Conic Gradient</h4>
            <p>Rotación alrededor de un punto. Útil para gráficos circulares y efectos modernos</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('generador-gradientes')} />

      <Footer appName="generador-gradientes" />
    </div>
  );
}
