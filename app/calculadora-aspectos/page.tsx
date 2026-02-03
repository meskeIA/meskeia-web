'use client';

import { useState, useCallback, useMemo } from 'react';
import styles from './CalculadoraAspectos.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface AspectPreset {
  name: string;
  ratio: string;
  width: number;
  height: number;
  icon: string;
  category: string;
}

const PRESETS: AspectPreset[] = [
  // Redes Sociales
  { name: 'Instagram Post', ratio: '1:1', width: 1080, height: 1080, icon: '📸', category: 'Redes Sociales' },
  { name: 'Instagram Story', ratio: '9:16', width: 1080, height: 1920, icon: '📱', category: 'Redes Sociales' },
  { name: 'Instagram Landscape', ratio: '1.91:1', width: 1080, height: 566, icon: '🌅', category: 'Redes Sociales' },
  { name: 'Facebook Post', ratio: '1.91:1', width: 1200, height: 630, icon: '👍', category: 'Redes Sociales' },
  { name: 'Facebook Cover', ratio: '2.7:1', width: 820, height: 312, icon: '🖼️', category: 'Redes Sociales' },
  { name: 'Twitter Post', ratio: '16:9', width: 1200, height: 675, icon: '🐦', category: 'Redes Sociales' },
  { name: 'LinkedIn Post', ratio: '1.91:1', width: 1200, height: 627, icon: '💼', category: 'Redes Sociales' },
  { name: 'Pinterest Pin', ratio: '2:3', width: 1000, height: 1500, icon: '📌', category: 'Redes Sociales' },
  // Video
  { name: 'YouTube Thumbnail', ratio: '16:9', width: 1280, height: 720, icon: '▶️', category: 'Video' },
  { name: 'YouTube Banner', ratio: '16:9', width: 2560, height: 1440, icon: '📺', category: 'Video' },
  { name: 'TikTok Video', ratio: '9:16', width: 1080, height: 1920, icon: '🎵', category: 'Video' },
  { name: '4K Ultra HD', ratio: '16:9', width: 3840, height: 2160, icon: '🎬', category: 'Video' },
  { name: 'Full HD', ratio: '16:9', width: 1920, height: 1080, icon: '📹', category: 'Video' },
  // Fotografía
  { name: 'Foto 4:3', ratio: '4:3', width: 1600, height: 1200, icon: '📷', category: 'Fotografía' },
  { name: 'Foto 3:2', ratio: '3:2', width: 1800, height: 1200, icon: '🖼️', category: 'Fotografía' },
  { name: 'Golden Ratio', ratio: '1.618:1', width: 1618, height: 1000, icon: '✨', category: 'Fotografía' },
  { name: 'Cuadrado', ratio: '1:1', width: 1000, height: 1000, icon: '⬜', category: 'Fotografía' },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyRatio(width: number, height: number): string {
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;

  if (w > 100 || h > 100) {
    const ratio = width / height;
    return `${ratio.toFixed(2)}:1`;
  }

  return `${w}:${h}`;
}

export default function CalculadoraAspectosPage() {
  const [originalWidth, setOriginalWidth] = useState('1920');
  const [originalHeight, setOriginalHeight] = useState('1080');
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [lockRatio, setLockRatio] = useState(true);
  const [activeField, setActiveField] = useState<'width' | 'height'>('width');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = useMemo(() => {
    const cats = [...new Set(PRESETS.map(p => p.category))];
    return ['Todos', ...cats];
  }, []);

  const filteredPresets = useMemo(() => {
    if (selectedCategory === 'Todos') return PRESETS;
    return PRESETS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const currentRatio = useMemo(() => {
    const w = parseFloat(originalWidth) || 0;
    const h = parseFloat(originalHeight) || 0;
    if (w <= 0 || h <= 0) return { ratio: '0:0', decimal: 0 };
    return {
      ratio: simplifyRatio(w, h),
      decimal: w / h
    };
  }, [originalWidth, originalHeight]);

  const calculateNewDimension = useCallback((value: string, field: 'width' | 'height') => {
    if (!lockRatio) {
      if (field === 'width') {
        setNewWidth(value);
      } else {
        setNewHeight(value);
      }
      return;
    }

    const num = parseFloat(value) || 0;
    const ratio = currentRatio.decimal;

    if (ratio <= 0) return;

    if (field === 'width') {
      setNewWidth(value);
      if (num > 0) {
        setNewHeight(Math.round(num / ratio).toString());
      } else {
        setNewHeight('');
      }
    } else {
      setNewHeight(value);
      if (num > 0) {
        setNewWidth(Math.round(num * ratio).toString());
      } else {
        setNewWidth('');
      }
    }
  }, [lockRatio, currentRatio.decimal]);

  const applyPreset = (preset: AspectPreset) => {
    setOriginalWidth(preset.width.toString());
    setOriginalHeight(preset.height.toString());
    setNewWidth('');
    setNewHeight('');
  };

  const swapDimensions = () => {
    setOriginalWidth(originalHeight);
    setOriginalHeight(originalWidth);
    setNewWidth('');
    setNewHeight('');
  };

  const pixelCount = useMemo(() => {
    const w = parseFloat(newWidth) || 0;
    const h = parseFloat(newHeight) || 0;
    const pixels = w * h;
    if (pixels >= 1000000) {
      return `${(pixels / 1000000).toFixed(2)} MP`;
    }
    return `${pixels.toLocaleString('es-ES')} px`;
  }, [newWidth, newHeight]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📐 Calculadora de Aspectos</h1>
        <p className={styles.subtitle}>
          Redimensiona imágenes manteniendo proporciones perfectas
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Calculadora */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Dimensiones Originales</h2>

          <div className={styles.dimensionInputs}>
            <div className={styles.inputGroup}>
              <label>Ancho (px)</label>
              <input
                type="number"
                value={originalWidth}
                onChange={(e) => {
                  setOriginalWidth(e.target.value);
                  setNewWidth('');
                  setNewHeight('');
                }}
                className={styles.input}
                placeholder="1920"
              />
            </div>
            <button onClick={swapDimensions} className={styles.swapBtn} title="Intercambiar">
              ⇄
            </button>
            <div className={styles.inputGroup}>
              <label>Alto (px)</label>
              <input
                type="number"
                value={originalHeight}
                onChange={(e) => {
                  setOriginalHeight(e.target.value);
                  setNewWidth('');
                  setNewHeight('');
                }}
                className={styles.input}
                placeholder="1080"
              />
            </div>
          </div>

          <div className={styles.ratioDisplay}>
            <span className={styles.ratioLabel}>Ratio actual:</span>
            <span className={styles.ratioValue}>{currentRatio.ratio}</span>
            <span className={styles.ratioDecimal}>({currentRatio.decimal.toFixed(3)})</span>
          </div>

          <div className={styles.section}>
            <h3>Nuevas Dimensiones</h3>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={lockRatio}
                onChange={(e) => setLockRatio(e.target.checked)}
              />
              🔒 Mantener proporción
            </label>

            <div className={styles.dimensionInputs}>
              <div className={styles.inputGroup}>
                <label>Nuevo Ancho</label>
                <input
                  type="number"
                  value={newWidth}
                  onChange={(e) => calculateNewDimension(e.target.value, 'width')}
                  onFocus={() => setActiveField('width')}
                  className={`${styles.input} ${activeField === 'width' ? styles.inputActive : ''}`}
                  placeholder="Introduce ancho"
                />
              </div>
              <span className={styles.dimensionX}>×</span>
              <div className={styles.inputGroup}>
                <label>Nuevo Alto</label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => calculateNewDimension(e.target.value, 'height')}
                  onFocus={() => setActiveField('height')}
                  className={`${styles.input} ${activeField === 'height' ? styles.inputActive : ''}`}
                  placeholder="Introduce alto"
                />
              </div>
            </div>

            {(newWidth || newHeight) && (
              <div className={styles.resultInfo}>
                <span>Resolución: <strong>{pixelCount}</strong></span>
              </div>
            )}
          </div>

          {/* Preview visual */}
          <div className={styles.previewSection}>
            <h3>Vista Previa</h3>
            <div className={styles.previewContainer}>
              <div
                className={styles.previewBox}
                style={{
                  aspectRatio: currentRatio.decimal > 0 ? `${currentRatio.decimal}` : '1',
                }}
              >
                <span className={styles.previewText}>{currentRatio.ratio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Presets */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Presets Populares</h2>

          <div className={styles.categoryTabs}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryActive : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.presetGrid}>
            {filteredPresets.map((preset) => (
              <button
                key={preset.name}
                className={styles.presetBtn}
                onClick={() => applyPreset(preset)}
              >
                <span className={styles.presetIcon}>{preset.icon}</span>
                <span className={styles.presetName}>{preset.name}</span>
                <span className={styles.presetSize}>{preset.width}×{preset.height}</span>
                <span className={styles.presetRatio}>{preset.ratio}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>¿Por qué mantener la proporción?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🖼️</span>
            <h4>Sin Distorsión</h4>
            <p>Las imágenes mantienen su aspecto original sin estirarse ni comprimirse</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📱</span>
            <h4>Optimizado para Redes</h4>
            <p>Cada red social tiene dimensiones ideales para mejor visualización</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>✨</span>
            <h4>Calidad Profesional</h4>
            <p>Mantén la calidad visual en cualquier tamaño de redimensionado</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('calculadora-aspectos')} />

      <Footer appName="calculadora-aspectos" />
    </div>
  );
}
