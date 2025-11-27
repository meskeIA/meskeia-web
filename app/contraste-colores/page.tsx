'use client';

import { useState, useMemo } from 'react';
import styles from './ContrasteColores.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

interface ContrastResult {
  ratio: number;
  normalAA: boolean;
  normalAAA: boolean;
  largeAA: boolean;
  largeAAA: boolean;
}

// Convierte HEX a RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calcula luminancia relativa según WCAG 2.1
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calcula ratio de contraste
function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Evalúa cumplimiento WCAG
function evaluateContrast(ratio: number): ContrastResult {
  return {
    ratio,
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7,
    largeAA: ratio >= 3,
    largeAAA: ratio >= 4.5,
  };
}

const PRESET_PAIRS = [
  { name: 'Negro sobre Blanco', fg: '#000000', bg: '#FFFFFF' },
  { name: 'meskeIA', fg: '#FFFFFF', bg: '#2E86AB' },
  { name: 'Gris Oscuro', fg: '#333333', bg: '#FFFFFF' },
  { name: 'Azul Link', fg: '#0066CC', bg: '#FFFFFF' },
  { name: 'Error', fg: '#DC3545', bg: '#FFFFFF' },
  { name: 'Éxito', fg: '#28A745', bg: '#FFFFFF' },
  { name: 'Modo Oscuro', fg: '#E5E5E5', bg: '#1A1A1A' },
  { name: 'Muted', fg: '#666666', bg: '#FFFFFF' },
];

export default function ContrasteColoresPage() {
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#FFFFFF');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const ratio = getContrastRatio(foreground, background);
    return evaluateContrast(ratio);
  }, [foreground, background]);

  const swapColors = () => {
    setForeground(background);
    setBackground(foreground);
  };

  const applyPreset = (fg: string, bg: string) => {
    setForeground(fg);
    setBackground(bg);
  };

  const copyResult = async () => {
    const text = `Contraste: ${result.ratio.toFixed(2)}:1\nTexto: ${foreground}\nFondo: ${background}\nNormal AA: ${result.normalAA ? 'Pasa' : 'Falla'}\nNormal AAA: ${result.normalAAA ? 'Pasa' : 'Falla'}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRatioColor = () => {
    if (result.ratio >= 7) return '#28A745';
    if (result.ratio >= 4.5) return '#2E86AB';
    if (result.ratio >= 3) return '#FFC107';
    return '#DC3545';
  };

  const getScoreLabel = () => {
    if (result.ratio >= 7) return 'Excelente';
    if (result.ratio >= 4.5) return 'Bueno';
    if (result.ratio >= 3) return 'Aceptable';
    return 'Insuficiente';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎯 Contraste de Colores</h1>
        <p className={styles.subtitle}>
          Verifica la accesibilidad según WCAG 2.1
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Preview y Resultados */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Vista Previa</h2>

          <div
            className={styles.previewBox}
            style={{ backgroundColor: background, color: foreground }}
          >
            <div className={styles.previewContent}>
              <h3 className={styles.previewTitle}>Título de Ejemplo</h3>
              <p className={styles.previewText}>
                Este es un texto de ejemplo para visualizar el contraste entre el color de texto y el fondo.
              </p>
              <p className={styles.previewSmall}>
                Texto pequeño (14px) para verificar legibilidad.
              </p>
              <button
                className={styles.previewButton}
                style={{ backgroundColor: foreground, color: background }}
              >
                Botón de Ejemplo
              </button>
            </div>
          </div>

          {/* Ratio de contraste */}
          <div className={styles.ratioSection}>
            <div className={styles.ratioDisplay}>
              <span className={styles.ratioValue} style={{ color: getRatioColor() }}>
                {result.ratio.toFixed(2)}:1
              </span>
              <span className={styles.ratioLabel} style={{ color: getRatioColor() }}>
                {getScoreLabel()}
              </span>
            </div>

            <div className={styles.ratioBar}>
              <div
                className={styles.ratioProgress}
                style={{
                  width: `${Math.min(result.ratio / 21 * 100, 100)}%`,
                  backgroundColor: getRatioColor()
                }}
              />
              <div className={styles.ratioMarkers}>
                <span style={{ left: `${3 / 21 * 100}%` }}>3:1</span>
                <span style={{ left: `${4.5 / 21 * 100}%` }}>4.5:1</span>
                <span style={{ left: `${7 / 21 * 100}%` }}>7:1</span>
              </div>
            </div>
          </div>

          {/* Tabla WCAG */}
          <div className={styles.wcagTable}>
            <div className={styles.wcagHeader}>
              <span></span>
              <span>AA</span>
              <span>AAA</span>
            </div>
            <div className={styles.wcagRow}>
              <span>Texto Normal</span>
              <span className={result.normalAA ? styles.pass : styles.fail}>
                {result.normalAA ? '✓ Pasa' : '✗ Falla'}
              </span>
              <span className={result.normalAAA ? styles.pass : styles.fail}>
                {result.normalAAA ? '✓ Pasa' : '✗ Falla'}
              </span>
            </div>
            <div className={styles.wcagRow}>
              <span>Texto Grande</span>
              <span className={result.largeAA ? styles.pass : styles.fail}>
                {result.largeAA ? '✓ Pasa' : '✗ Falla'}
              </span>
              <span className={result.largeAAA ? styles.pass : styles.fail}>
                {result.largeAAA ? '✓ Pasa' : '✗ Falla'}
              </span>
            </div>
          </div>

          <button onClick={copyResult} className={styles.copyBtn}>
            {copied ? '✓ Copiado' : '📋 Copiar Resultados'}
          </button>
        </div>

        {/* Panel derecho - Controles */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración</h2>

          {/* Color de texto */}
          <div className={styles.colorGroup}>
            <label className={styles.label}>Color de Texto (Foreground)</label>
            <div className={styles.colorInputRow}>
              <input
                type="color"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className={styles.colorPicker}
              />
              <input
                type="text"
                value={foreground.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    setForeground(val);
                  }
                }}
                className={styles.hexInput}
                maxLength={7}
              />
              <div
                className={styles.colorSwatch}
                style={{ backgroundColor: foreground }}
              />
            </div>
          </div>

          {/* Botón Swap */}
          <button onClick={swapColors} className={styles.swapBtn}>
            ⇅ Intercambiar Colores
          </button>

          {/* Color de fondo */}
          <div className={styles.colorGroup}>
            <label className={styles.label}>Color de Fondo (Background)</label>
            <div className={styles.colorInputRow}>
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className={styles.colorPicker}
              />
              <input
                type="text"
                value={background.toUpperCase()}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    setBackground(val);
                  }
                }}
                className={styles.hexInput}
                maxLength={7}
              />
              <div
                className={styles.colorSwatch}
                style={{ backgroundColor: background }}
              />
            </div>
          </div>

          {/* Presets */}
          <div className={styles.presetsSection}>
            <h3 className={styles.sectionTitle}>Combinaciones Comunes</h3>
            <div className={styles.presetsGrid}>
              {PRESET_PAIRS.map((preset) => (
                <button
                  key={preset.name}
                  className={styles.presetBtn}
                  onClick={() => applyPreset(preset.fg, preset.bg)}
                  style={{ backgroundColor: preset.bg, color: preset.fg }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Información WCAG */}
      <div className={styles.infoSection}>
        <h3>Niveles de Conformidad WCAG 2.1</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📝</span>
            <h4>Texto Normal (AA)</h4>
            <p>Requiere ratio mínimo de <strong>4.5:1</strong>. Aplica a texto menor de 18pt o 14pt negrita.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📰</span>
            <h4>Texto Grande (AA)</h4>
            <p>Requiere ratio mínimo de <strong>3:1</strong>. Texto de 18pt o más, o 14pt negrita o más.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>⭐</span>
            <h4>Nivel AAA</h4>
            <p>Máximo nivel de accesibilidad. Requiere <strong>7:1</strong> para normal y <strong>4.5:1</strong> para grande.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>♿</span>
            <h4>¿Por qué importa?</h4>
            <p>Un buen contraste mejora la legibilidad para personas con baja visión y en condiciones de luz adversas.</p>
          </div>
        </div>
      </div>

      <Footer appName="contraste-colores" />
    </div>
  );
}
