'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './GeneradorTipografias.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface FontInfo {
  name: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  weights: number[];
  popular?: boolean;
}

// 20 fuentes populares de Google Fonts (hardcoded, sin API)
const FONTS: FontInfo[] = [
  { name: 'Roboto', category: 'sans-serif', weights: [100, 300, 400, 500, 700, 900], popular: true },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], popular: true },
  { name: 'Lato', category: 'sans-serif', weights: [100, 300, 400, 700, 900], popular: true },
  { name: 'Montserrat', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popular: true },
  { name: 'Poppins', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popular: true },
  { name: 'Inter', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], popular: true },
  { name: 'Raleway', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Nunito', category: 'sans-serif', weights: [200, 300, 400, 500, 600, 700, 800, 900] },
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900], popular: true },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700] },
  { name: 'Source Serif Pro', category: 'serif', weights: [200, 300, 400, 600, 700, 900] },
  { name: 'PT Serif', category: 'serif', weights: [400, 700] },
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700], popular: true },
  { name: 'JetBrains Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800] },
  { name: 'Source Code Pro', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 900] },
  { name: 'Pacifico', category: 'handwriting', weights: [400] },
  { name: 'Dancing Script', category: 'handwriting', weights: [400, 500, 600, 700] },
  { name: 'Bebas Neue', category: 'display', weights: [400], popular: true },
  { name: 'Oswald', category: 'display', weights: [200, 300, 400, 500, 600, 700] },
];

const CATEGORIES = ['all', 'sans-serif', 'serif', 'monospace', 'display', 'handwriting'] as const;

const SAMPLE_TEXTS = {
  pangram: 'El veloz murciélago hindú comía feliz cardillo y kiwi.',
  alphabet: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ abcdefghijklmnñopqrstuvwxyz',
  numbers: '0123456789 €$£¥ @#%&*()[]{}',
  lorem: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  custom: '',
};

export default function GeneradorTipografiasPage() {
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(32);
  const [fontWeight, setFontWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [sampleType, setSampleType] = useState<keyof typeof SAMPLE_TEXTS>('pangram');
  const [customText, setCustomText] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('all');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [compareFont, setCompareFont] = useState<FontInfo | null>(null);

  // Cargar fuente desde Google Fonts
  useEffect(() => {
    if (!loadedFonts.has(selectedFont.name)) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.name.replace(/ /g, '+')}:wght@${selectedFont.weights.join(';')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setLoadedFonts(prev => new Set([...prev, selectedFont.name]));
    }
  }, [selectedFont, loadedFonts]);

  // Cargar fuente de comparación
  useEffect(() => {
    if (compareFont && !loadedFonts.has(compareFont.name)) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${compareFont.name.replace(/ /g, '+')}:wght@${compareFont.weights.join(';')}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setLoadedFonts(prev => new Set([...prev, compareFont.name]));
    }
  }, [compareFont, loadedFonts]);

  const filteredFonts = useMemo(() => {
    if (category === 'all') return FONTS;
    return FONTS.filter(f => f.category === category);
  }, [category]);

  const displayText = sampleType === 'custom' ? customText : SAMPLE_TEXTS[sampleType];

  const cssCode = useMemo(() => {
    return `font-family: '${selectedFont.name}', ${selectedFont.category};
font-size: ${fontSize}px;
font-weight: ${fontWeight};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}px;
text-align: ${textAlign};`;
  }, [selectedFont, fontSize, fontWeight, lineHeight, letterSpacing, textAlign]);

  const googleFontsLink = useMemo(() => {
    return `<link href="https://fonts.googleapis.com/css2?family=${selectedFont.name.replace(/ /g, '+')}:wght@${fontWeight}&display=swap" rel="stylesheet">`;
  }, [selectedFont, fontWeight]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(`${googleFontsLink}\n\n${cssCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewStyle = {
    fontFamily: `'${selectedFont.name}', ${selectedFont.category}`,
    fontSize: `${fontSize}px`,
    fontWeight,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    textAlign,
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔤 Generador de Tipografías</h1>
        <p className={styles.subtitle}>
          Explora y compara fuentes de Google Fonts
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel izquierdo - Lista de fuentes */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Fuentes Disponibles</h2>

          {/* Filtros por categoría */}
          <div className={styles.categoryTabs}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${category === cat ? styles.categoryActive : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'all' ? 'Todas' : cat}
              </button>
            ))}
          </div>

          <div className={styles.fontList}>
            {filteredFonts.map(font => (
              <button
                key={font.name}
                className={`${styles.fontItem} ${selectedFont.name === font.name ? styles.fontActive : ''}`}
                onClick={() => {
                  setSelectedFont(font);
                  if (!font.weights.includes(fontWeight)) {
                    setFontWeight(font.weights[Math.floor(font.weights.length / 2)]);
                  }
                }}
              >
                <span className={styles.fontName}>{font.name}</span>
                <span className={styles.fontMeta}>
                  {font.popular && <span className={styles.popularBadge}>Popular</span>}
                  <span className={styles.fontCategory}>{font.category}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel central - Preview */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Vista Previa</h2>

          <div className={styles.previewBox}>
            <div style={previewStyle as React.CSSProperties} className={styles.previewText}>
              {displayText || 'Escribe algo para ver la fuente...'}
            </div>
          </div>

          {compareFont && (
            <div className={styles.compareBox}>
              <div className={styles.compareLabel}>Comparando con: {compareFont.name}</div>
              <div
                style={{
                  ...previewStyle,
                  fontFamily: `'${compareFont.name}', ${compareFont.category}`,
                } as React.CSSProperties}
                className={styles.previewText}
              >
                {displayText || 'Escribe algo para ver la fuente...'}
              </div>
            </div>
          )}

          {/* Sample text selector */}
          <div className={styles.sampleSection}>
            <div className={styles.sampleTabs}>
              <button
                className={`${styles.sampleBtn} ${sampleType === 'pangram' ? styles.sampleActive : ''}`}
                onClick={() => setSampleType('pangram')}
              >
                Pangrama
              </button>
              <button
                className={`${styles.sampleBtn} ${sampleType === 'alphabet' ? styles.sampleActive : ''}`}
                onClick={() => setSampleType('alphabet')}
              >
                Alfabeto
              </button>
              <button
                className={`${styles.sampleBtn} ${sampleType === 'numbers' ? styles.sampleActive : ''}`}
                onClick={() => setSampleType('numbers')}
              >
                Números
              </button>
              <button
                className={`${styles.sampleBtn} ${sampleType === 'lorem' ? styles.sampleActive : ''}`}
                onClick={() => setSampleType('lorem')}
              >
                Lorem
              </button>
              <button
                className={`${styles.sampleBtn} ${sampleType === 'custom' ? styles.sampleActive : ''}`}
                onClick={() => setSampleType('custom')}
              >
                Personalizado
              </button>
            </div>

            {sampleType === 'custom' && (
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Escribe tu texto personalizado..."
                className={styles.customInput}
              />
            )}
          </div>

          {/* Código */}
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <span>Código CSS</span>
              <button onClick={copyCode} className={styles.copyBtn}>
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <pre className={styles.codeBlock}>
              <code>{googleFontsLink}</code>
              <code>{'\n\n'}{cssCode}</code>
            </pre>
          </div>
        </div>

        {/* Panel derecho - Controles */}
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Configuración</h2>

          {/* Font Weight */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Peso: {fontWeight}</label>
            <div className={styles.weightGrid}>
              {selectedFont.weights.map(w => (
                <button
                  key={w}
                  className={`${styles.weightBtn} ${fontWeight === w ? styles.weightActive : ''}`}
                  onClick={() => setFontWeight(w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Tamaño: {fontSize}px</label>
            <input
              type="range"
              min="12"
              max="96"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sizePresets}>
              {[16, 24, 32, 48, 64].map(s => (
                <button
                  key={s}
                  className={`${styles.sizeBtn} ${fontSize === s ? styles.sizeActive : ''}`}
                  onClick={() => setFontSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Interlineado: {lineHeight}</label>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(parseFloat(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Letter Spacing */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Espaciado: {letterSpacing}px</label>
            <input
              type="range"
              min="-5"
              max="20"
              step="0.5"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Text Align */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Alineación</label>
            <div className={styles.alignGrid}>
              {(['left', 'center', 'right', 'justify'] as const).map(align => (
                <button
                  key={align}
                  className={`${styles.alignBtn} ${textAlign === align ? styles.alignActive : ''}`}
                  onClick={() => setTextAlign(align)}
                >
                  {align === 'left' ? '⬅️' : align === 'center' ? '↔️' : align === 'right' ? '➡️' : '⬌'}
                </button>
              ))}
            </div>
          </div>

          {/* Compare */}
          <div className={styles.controlGroup}>
            <label className={styles.label}>Comparar con:</label>
            <select
              value={compareFont?.name || ''}
              onChange={(e) => {
                const font = FONTS.find(f => f.name === e.target.value);
                setCompareFont(font || null);
              }}
              className={styles.select}
            >
              <option value="">Sin comparación</option>
              {FONTS.filter(f => f.name !== selectedFont.name).map(font => (
                <option key={font.name} value={font.name}>{font.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h3>Categorías de Tipografías</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>Aa</span>
            <h4>Sans-Serif</h4>
            <p>Fuentes limpias sin remates. Ideales para pantallas y diseño moderno</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>Aa</span>
            <h4>Serif</h4>
            <p>Fuentes con remates clásicos. Perfectas para textos largos y elegancia</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>{'{}'}</span>
            <h4>Monospace</h4>
            <p>Caracteres de ancho fijo. Esenciales para código y datos técnicos</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>Aa</span>
            <h4>Display</h4>
            <p>Fuentes decorativas para títulos grandes y elementos destacados</p>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('generador-tipografias')} />

      <Footer appName="generador-tipografias" />
    </div>
  );
}
