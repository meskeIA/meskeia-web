'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorSombras.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

type ShadowType = 'box' | 'text';

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

interface ShadowPreset {
  name: string;
  layers: Omit<ShadowLayer, 'id'>[];
  type: ShadowType;
}

const PRESETS: ShadowPreset[] = [
  {
    name: 'Suave',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.1, inset: false }]
  },
  {
    name: 'Elevado',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 8, blur: 24, spread: -4, color: '#000000', opacity: 0.15, inset: false }]
  },
  {
    name: 'Flotante',
    type: 'box',
    layers: [
      { offsetX: 0, offsetY: 20, blur: 40, spread: -12, color: '#000000', opacity: 0.2, inset: false },
      { offsetX: 0, offsetY: 4, blur: 8, spread: -2, color: '#000000', opacity: 0.1, inset: false }
    ]
  },
  {
    name: 'Neomorfismo',
    type: 'box',
    layers: [
      { offsetX: 10, offsetY: 10, blur: 30, spread: 0, color: '#000000', opacity: 0.15, inset: false },
      { offsetX: -10, offsetY: -10, blur: 30, spread: 0, color: '#ffffff', opacity: 0.7, inset: false }
    ]
  },
  {
    name: 'Interior',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.2, inset: true }]
  },
  {
    name: 'Dramático',
    type: 'box',
    layers: [{ offsetX: 12, offsetY: 12, blur: 0, spread: 0, color: '#1A1A1A', opacity: 1, inset: false }]
  },
  {
    name: 'Glow',
    type: 'box',
    layers: [{ offsetX: 0, offsetY: 0, blur: 20, spread: 5, color: '#2E86AB', opacity: 0.6, inset: false }]
  },
  {
    name: 'Multicapa',
    type: 'box',
    layers: [
      { offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 0.06, inset: false },
      { offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: '#000000', opacity: 0.08, inset: false },
      { offsetX: 0, offsetY: 8, blur: 16, spread: 0, color: '#000000', opacity: 0.1, inset: false }
    ]
  },
  {
    name: 'Texto Sutil',
    type: 'text',
    layers: [{ offsetX: 1, offsetY: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.3, inset: false }]
  },
  {
    name: 'Texto Glow',
    type: 'text',
    layers: [{ offsetX: 0, offsetY: 0, blur: 10, spread: 0, color: '#2E86AB', opacity: 0.8, inset: false }]
  },
];

const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function GeneradorSombrasPage() {
  const [shadowType, setShadowType] = useState<ShadowType>('box');
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: '1', offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.1, inset: false }
  ]);
  const [activeLayer, setActiveLayer] = useState('1');
  const [boxColor, setBoxColor] = useState('#FFFFFF');
  const [boxRadius, setBoxRadius] = useState(12);
  const [copied, setCopied] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addLayer = () => {
    if (layers.length >= 5) return;
    const newLayer: ShadowLayer = {
      id: generateId(),
      offsetX: 0,
      offsetY: 8,
      blur: 16,
      spread: 0,
      color: '#000000',
      opacity: 0.15,
      inset: false
    };
    setLayers([...layers, newLayer]);
    setActiveLayer(newLayer.id);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    if (activeLayer === id) {
      setActiveLayer(newLayers[0].id);
    }
  };

  const updateLayer = (id: string, field: keyof ShadowLayer, value: number | string | boolean) => {
    setLayers(layers.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const currentLayer = layers.find(l => l.id === activeLayer) || layers[0];

  const shadowCSS = useMemo(() => {
    const shadowsStr = layers.map(l => {
      const color = hexToRgba(l.color, l.opacity);
      if (shadowType === 'box') {
        return `${l.inset ? 'inset ' : ''}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${color}`;
      } else {
        return `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${color}`;
      }
    }).join(',\n    ');

    return shadowType === 'box'
      ? `box-shadow: ${shadowsStr};`
      : `text-shadow: ${shadowsStr};`;
  }, [layers, shadowType]);

  const previewStyle = useMemo(() => {
    const shadowValue = layers.map(l => {
      const color = hexToRgba(l.color, l.opacity);
      if (shadowType === 'box') {
        return `${l.inset ? 'inset ' : ''}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${color}`;
      } else {
        return `${l.offsetX}px ${l.offsetY}px ${l.blur}px ${color}`;
      }
    }).join(', ');

    if (shadowType === 'box') {
      return { boxShadow: shadowValue, background: boxColor, borderRadius: `${boxRadius}px` };
    } else {
      return { textShadow: shadowValue };
    }
  }, [layers, shadowType, boxColor, boxRadius]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shadowCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const applyPreset = (preset: ShadowPreset) => {
    setShadowType(preset.type);
    const newLayers = preset.layers.map(l => ({ ...l, id: generateId() }));
    setLayers(newLayers);
    setActiveLayer(newLayers[0].id);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🌓 Generador de Sombras CSS</h1>
        <p className={styles.subtitle}>
          Crea box-shadow y text-shadow con editor visual
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Preview */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Vista Previa</h2>

          <div className={styles.previewArea}>
            {shadowType === 'box' ? (
              <div className={styles.previewBox} style={previewStyle}>
                <span>Preview</span>
              </div>
            ) : (
              <div className={styles.previewText} style={previewStyle}>
                Texto de Ejemplo
              </div>
            )}
          </div>

          {shadowType === 'box' && (
            <div className={styles.boxOptions}>
              <div className={styles.optionRow}>
                <label>Color de fondo</label>
                <input
                  type="color"
                  value={boxColor}
                  onChange={(e) => setBoxColor(e.target.value)}
                  className={styles.colorPicker}
                />
              </div>
              <div className={styles.optionRow}>
                <label>Border radius: {boxRadius}px</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={boxRadius}
                  onChange={(e) => setBoxRadius(parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>
            </div>
          )}

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
              <code>{shadowCSS}</code>
            </pre>
          </div>

          {/* Presets */}
          <div className={styles.presetsSection}>
            <h3 className={styles.sectionTitle}>Presets</h3>
            <div className={styles.presetsGrid}>
              {PRESETS.filter(p => p.type === shadowType).map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetBtn}
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho - Controles */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración</h2>

          {/* Tipo de sombra */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Tipo de Sombra</label>
            <div className={styles.typeTabs}>
              <button
                className={`${styles.typeBtn} ${shadowType === 'box' ? styles.typeActive : ''}`}
                onClick={() => setShadowType('box')}
              >
                📦 Box Shadow
              </button>
              <button
                className={`${styles.typeBtn} ${shadowType === 'text' ? styles.typeActive : ''}`}
                onClick={() => setShadowType('text')}
              >
                ✏️ Text Shadow
              </button>
            </div>
          </div>

          {/* Capas */}
          <div className={styles.controlGroup}>
            <div className={styles.layersHeader}>
              <label className={styles.label}>Capas ({layers.length}/5)</label>
              <button
                onClick={addLayer}
                className={styles.addBtn}
                disabled={layers.length >= 5}
              >
                + Añadir
              </button>
            </div>

            <div className={styles.layerTabs}>
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className={`${styles.layerTab} ${activeLayer === layer.id ? styles.layerActive : ''}`}
                  onClick={() => setActiveLayer(layer.id)}
                >
                  <span>Capa {index + 1}</span>
                  {layers.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLayer(layer.id);
                      }}
                      className={styles.removeLayerBtn}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controles de la capa activa */}
          {currentLayer && (
            <div className={styles.layerControls}>
              {/* Offset X */}
              <div className={styles.sliderGroup}>
                <label>Offset X: {currentLayer.offsetX}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={currentLayer.offsetX}
                  onChange={(e) => updateLayer(currentLayer.id, 'offsetX', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Offset Y */}
              <div className={styles.sliderGroup}>
                <label>Offset Y: {currentLayer.offsetY}px</label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={currentLayer.offsetY}
                  onChange={(e) => updateLayer(currentLayer.id, 'offsetY', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Blur */}
              <div className={styles.sliderGroup}>
                <label>Blur: {currentLayer.blur}px</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentLayer.blur}
                  onChange={(e) => updateLayer(currentLayer.id, 'blur', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </div>

              {/* Spread (solo box-shadow) */}
              {shadowType === 'box' && (
                <div className={styles.sliderGroup}>
                  <label>Spread: {currentLayer.spread}px</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={currentLayer.spread}
                    onChange={(e) => updateLayer(currentLayer.id, 'spread', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              )}

              {/* Color y Opacidad */}
              <div className={styles.colorRow}>
                <div className={styles.colorGroup}>
                  <label>Color</label>
                  <input
                    type="color"
                    value={currentLayer.color}
                    onChange={(e) => updateLayer(currentLayer.id, 'color', e.target.value)}
                    className={styles.colorPicker}
                  />
                </div>
                <div className={styles.opacityGroup}>
                  <label>Opacidad: {Math.round(currentLayer.opacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={currentLayer.opacity}
                    onChange={(e) => updateLayer(currentLayer.id, 'opacity', parseFloat(e.target.value))}
                    className={styles.slider}
                  />
                </div>
              </div>

              {/* Inset (solo box-shadow) */}
              {shadowType === 'box' && (
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={currentLayer.inset}
                    onChange={(e) => updateLayer(currentLayer.id, 'inset', e.target.checked)}
                  />
                  Inset (sombra interior)
                </label>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>Propiedades de Sombras CSS</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>↔️</span>
            <h4>Offset X/Y</h4>
            <p>Desplazamiento horizontal y vertical de la sombra respecto al elemento</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🌫️</span>
            <h4>Blur</h4>
            <p>Desenfoque de la sombra. Mayor valor = más suave y difusa</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>⭕</span>
            <h4>Spread</h4>
            <p>Expansión de la sombra. Valores positivos la agrandan, negativos la reducen</p>
          </div>
        </div>
      </div>

      <Footer appName="generador-sombras" />
    </div>
  );
}
