'use client';

import { useState, useCallback, useEffect } from 'react';
import styles from './ConversorColores.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100)
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): { r: number; g: number; b: number } {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k))
  };
}

function getColorName(hex: string): string {
  const colors: Record<string, string> = {
    '#FF0000': 'Rojo', '#00FF00': 'Verde', '#0000FF': 'Azul',
    '#FFFF00': 'Amarillo', '#FF00FF': 'Magenta', '#00FFFF': 'Cian',
    '#FFFFFF': 'Blanco', '#000000': 'Negro', '#808080': 'Gris',
    '#FFA500': 'Naranja', '#800080': 'Púrpura', '#FFC0CB': 'Rosa',
    '#A52A2A': 'Marrón', '#2E86AB': 'Azul meskeIA', '#48A9A6': 'Teal meskeIA',
  };
  return colors[hex.toUpperCase()] || 'Color personalizado';
}

export default function ConvertidorColoresPage() {
  const [color, setColor] = useState<ColorValues>({
    hex: '#2E86AB',
    rgb: { r: 46, g: 134, b: 171 },
    hsl: { h: 198, s: 58, l: 43 },
    cmyk: { c: 73, m: 22, y: 0, k: 33 }
  });

  const [hexInput, setHexInput] = useState('#2E86AB');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const updateFromHex = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      setColor({ hex: hex.toUpperCase(), rgb, hsl, cmyk });
    }
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    setColor({ hex, rgb: { r, g, b }, hsl, cmyk });
    setHexInput(hex);
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl: { h, s, l }, cmyk });
    setHexInput(hex);
  }, []);

  const updateFromCmyk = useCallback((c: number, m: number, y: number, k: number) => {
    const rgb = cmykToRgb(c, m, y, k);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl, cmyk: { c, m, y, k } });
    setHexInput(hex);
  }, []);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateFromHex(value);
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value.toUpperCase();
    setHexInput(hex);
    updateFromHex(hex);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const formatRgb = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const formatHsl = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
  const formatCmyk = `cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎨 Convertidor de Colores</h1>
        <p className={styles.subtitle}>
          Convierte entre HEX, RGB, HSL y CMYK al instante
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Color Picker */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Selector de Color</h2>

          <div
            className={styles.colorDisplay}
            style={{ backgroundColor: color.hex }}
          >
            <input
              type="color"
              value={color.hex}
              onChange={handleColorPickerChange}
              className={styles.colorPicker}
            />
          </div>

          <div className={styles.colorInfo}>
            <span className={styles.colorName}>{getColorName(color.hex)}</span>
          </div>

          <div className={styles.hexInputGroup}>
            <label>HEX</label>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className={styles.hexInput}
              placeholder="#000000"
              maxLength={7}
            />
            <button
              onClick={() => copyToClipboard(color.hex, 'hex')}
              className={styles.copyBtn}
            >
              {copiedField === 'hex' ? '✓' : '📋'}
            </button>
          </div>
        </div>

        {/* Panel derecho - Valores */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Valores del Color</h2>

          {/* RGB */}
          <div className={styles.colorSection}>
            <div className={styles.sectionHeader}>
              <h3>RGB</h3>
              <button
                onClick={() => copyToClipboard(formatRgb, 'rgb')}
                className={styles.copyBtn}
              >
                {copiedField === 'rgb' ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderRow}>
                <label>R</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={color.rgb.r}
                  onChange={(e) => updateFromRgb(Number(e.target.value), color.rgb.g, color.rgb.b)}
                  className={styles.slider}
                  style={{ '--slider-color': '#FF0000' } as React.CSSProperties}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={color.rgb.r}
                  onChange={(e) => updateFromRgb(Number(e.target.value), color.rgb.g, color.rgb.b)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>G</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={color.rgb.g}
                  onChange={(e) => updateFromRgb(color.rgb.r, Number(e.target.value), color.rgb.b)}
                  className={styles.slider}
                  style={{ '--slider-color': '#00FF00' } as React.CSSProperties}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={color.rgb.g}
                  onChange={(e) => updateFromRgb(color.rgb.r, Number(e.target.value), color.rgb.b)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>B</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={color.rgb.b}
                  onChange={(e) => updateFromRgb(color.rgb.r, color.rgb.g, Number(e.target.value))}
                  className={styles.slider}
                  style={{ '--slider-color': '#0000FF' } as React.CSSProperties}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={color.rgb.b}
                  onChange={(e) => updateFromRgb(color.rgb.r, color.rgb.g, Number(e.target.value))}
                  className={styles.valueInput}
                />
              </div>
            </div>
            <code className={styles.codeOutput}>{formatRgb}</code>
          </div>

          {/* HSL */}
          <div className={styles.colorSection}>
            <div className={styles.sectionHeader}>
              <h3>HSL</h3>
              <button
                onClick={() => copyToClipboard(formatHsl, 'hsl')}
                className={styles.copyBtn}
              >
                {copiedField === 'hsl' ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div className={styles.sliderGroup}>
              <div className={styles.sliderRow}>
                <label>H</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={color.hsl.h}
                  onChange={(e) => updateFromHsl(Number(e.target.value), color.hsl.s, color.hsl.l)}
                  className={`${styles.slider} ${styles.hueSlider}`}
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={color.hsl.h}
                  onChange={(e) => updateFromHsl(Number(e.target.value), color.hsl.s, color.hsl.l)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>S</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.hsl.s}
                  onChange={(e) => updateFromHsl(color.hsl.h, Number(e.target.value), color.hsl.l)}
                  className={styles.slider}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.hsl.s}
                  onChange={(e) => updateFromHsl(color.hsl.h, Number(e.target.value), color.hsl.l)}
                  className={styles.valueInput}
                />
              </div>
              <div className={styles.sliderRow}>
                <label>L</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={color.hsl.l}
                  onChange={(e) => updateFromHsl(color.hsl.h, color.hsl.s, Number(e.target.value))}
                  className={styles.slider}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.hsl.l}
                  onChange={(e) => updateFromHsl(color.hsl.h, color.hsl.s, Number(e.target.value))}
                  className={styles.valueInput}
                />
              </div>
            </div>
            <code className={styles.codeOutput}>{formatHsl}</code>
          </div>

          {/* CMYK */}
          <div className={styles.colorSection}>
            <div className={styles.sectionHeader}>
              <h3>CMYK</h3>
              <button
                onClick={() => copyToClipboard(formatCmyk, 'cmyk')}
                className={styles.copyBtn}
              >
                {copiedField === 'cmyk' ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <div className={styles.cmykGrid}>
              <div className={styles.cmykItem}>
                <label>C</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.c}
                  onChange={(e) => updateFromCmyk(Number(e.target.value), color.cmyk.m, color.cmyk.y, color.cmyk.k)}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
              <div className={styles.cmykItem}>
                <label>M</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.m}
                  onChange={(e) => updateFromCmyk(color.cmyk.c, Number(e.target.value), color.cmyk.y, color.cmyk.k)}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
              <div className={styles.cmykItem}>
                <label>Y</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.y}
                  onChange={(e) => updateFromCmyk(color.cmyk.c, color.cmyk.m, Number(e.target.value), color.cmyk.k)}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
              <div className={styles.cmykItem}>
                <label>K</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={color.cmyk.k}
                  onChange={(e) => updateFromCmyk(color.cmyk.c, color.cmyk.m, color.cmyk.y, Number(e.target.value))}
                  className={styles.valueInput}
                />
                <span>%</span>
              </div>
            </div>
            <code className={styles.codeOutput}>{formatCmyk}</code>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>¿Cuándo usar cada formato?</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🌐</span>
            <h4>HEX</h4>
            <p>Estándar para desarrollo web. Compacto y fácil de usar en CSS</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🖥️</span>
            <h4>RGB</h4>
            <p>Pantallas y monitores. Ideal para manipular canales individuales</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🎨</span>
            <h4>HSL</h4>
            <p>Intuitivo para diseñadores. Fácil ajustar tono, saturación y brillo</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🖨️</span>
            <h4>CMYK</h4>
            <p>Impresión profesional. Necesario para materiales impresos</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('conversor-colores')} />
      <Footer appName="conversor-colores" />
    </div>
  );
}
