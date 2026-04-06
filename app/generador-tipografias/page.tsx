'use client';
// @disclaimer: exempt

import { useState, useEffect, useMemo } from 'react';
import styles from './GeneradorTipografias.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
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

      <LegalNotice />

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

      <EducationalSection
        title="Tipografía: Diseño, Psicología y Uso Profesional"
        subtitle="Todo lo que necesitas saber para elegir y combinar fuentes como un diseñador"
        icon="🅰️"
      >
        <section>
          <h3>📊 Clasificación Tipográfica: Las 5 Grandes Familias</h3>
          <div className={styles.eduTablaWrapper}>
            <table className={styles.eduTabla}>
              <thead>
                <tr>
                  <th>Familia</th>
                  <th>Característica</th>
                  <th>Sensación</th>
                  <th>Mejor uso</th>
                  <th>Ejemplos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Serif</strong></td>
                  <td>Remates (pequeños trazos) en los extremos de las letras</td>
                  <td>Clásica, elegante, confiable, autoritaria</td>
                  <td>Textos largos en papel, logotipos premium, editorial</td>
                  <td>Times New Roman, Georgia, Garamond, Playfair Display</td>
                </tr>
                <tr>
                  <td><strong>Sans-serif</strong></td>
                  <td>Sin remates; trazos uniformes y limpios</td>
                  <td>Moderna, limpia, accesible, tecnológica</td>
                  <td>Pantallas, UI, titulares, cuerpo digital</td>
                  <td>Arial, Helvetica, Inter, Roboto, Open Sans</td>
                </tr>
                <tr>
                  <td><strong>Monospace</strong></td>
                  <td>Todos los caracteres tienen el mismo ancho</td>
                  <td>Técnica, precisa, retro, código</td>
                  <td>Código fuente, terminales, tablas de datos</td>
                  <td>Courier New, JetBrains Mono, Fira Code, Consolas</td>
                </tr>
                <tr>
                  <td><strong>Display / Decorativa</strong></td>
                  <td>Diseñada para tamaños grandes; muy expresiva</td>
                  <td>Impactante, creativa, personalidad fuerte</td>
                  <td>Títulos grandes, carteles, branding, logos</td>
                  <td>Bebas Neue, Lobster, Oswald, Impact</td>
                </tr>
                <tr>
                  <td><strong>Script / Caligráfica</strong></td>
                  <td>Imita la escritura a mano; fluida y conectada</td>
                  <td>Personal, artesanal, romántica, festiva</td>
                  <td>Invitaciones, logotipos artesanales, titulares especiales</td>
                  <td>Pacifico, Dancing Script, Great Vibes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>🎯 Aplicaciones Profesionales de la Tipografía</h3>
          <div className={styles.eduEscenariosGrid}>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🌐</span>
              <h4>Diseño Web y Apps</h4>
              <p>En pantallas, las sans-serif dominan por su legibilidad en resoluciones variables. La combinación estándar es: una sans-serif para cuerpo (Inter, Roboto, Open Sans) y una display o serif para títulos. El tamaño mínimo legible en cuerpo es 16px; en móvil nunca bajar de 14px. El interlineado óptimo (line-height) es 1,5-1,6× el tamaño de fuente.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>🏢</span>
              <h4>Identidad Corporativa y Branding</h4>
              <p>La tipografía comunica la personalidad de una marca antes de que el usuario lea una sola palabra. Marcas tecnológicas usan sans-serif geométricas (Apple: San Francisco, Google: Product Sans). Bancos y seguros prefieren serif (Times, Garamond) para transmitir solidez. El fast food usa display robustas (Impact) para urgencia y apetito. Elegir mal la tipografía corporativa puede contradecir todos los demás valores de marca.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>📄</span>
              <h4>Documentos y Presentaciones</h4>
              <p>En PowerPoint/Keynote, la regla es: no más de 2 fuentes, máximo 3 tamaños distintos. Para presentaciones proyectadas, mínimo 24pt para cuerpo (la regla de Guy Kawasaki: tamaño de fuente = edad del oyente más mayor dividida entre 2). Para documentos impresos profesionales, Georgia o Palatino para el cuerpo y una sans-serif para los títulos funciona muy bien.</p>
            </div>
            <div className={styles.eduEscenarioCard}>
              <span className={styles.eduEscenarioIcon}>♿</span>
              <h4>Accesibilidad y Legibilidad Universal</h4>
              <p>Las fuentes diseñadas para accesibilidad (Atkinson Hyperlegible, Lexie Readable, OpenDyslexic) reducen la confusión entre caracteres similares (I/l/1, 0/O, b/d). Las WCAG 2.1 recomiendan al menos 4,5:1 de contraste entre texto y fondo. Las fuentes monoline sin rasgos decorativos excesivos benefician a lectores con dislexia o visión reducida. El tamaño importa más que la familia: 16px legible &gt; 12px con una fuente &quot;perfecta&quot;.</p>
            </div>
          </div>
        </section>

        <section>
          <h3>❓ Preguntas Frecuentes sobre Tipografía</h3>
          <div className={styles.eduFaqList}>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuántas fuentes debo usar en un diseño?</summary>
              <p className={styles.eduFaqRespuesta}>La regla general es <strong>máximo 2-3 fuentes</strong> por diseño. Una para cuerpo (texto corrido), una para títulos/encabezados, y opcionalmente una tercera para elementos de acento o código. Más de 3 fuentes crea caos visual, aumenta el tiempo de carga web (cada Google Font es una petición HTTP) y dificulta la consistencia. Dentro de una misma familia tipográfica puedes tener gran variedad usando pesos (light, regular, medium, bold) e itálica, lo que se ve coherente.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué hace que una fuente sea legible?</summary>
              <p className={styles.eduFaqRespuesta}>La legibilidad depende de varios factores: <strong>altura de la x</strong> (x-height) alta → más legible en cuerpo pequeño; <strong>contraformas</strong> abiertas (el espacio interior de la &quot;a&quot;, &quot;e&quot;, &quot;c&quot;) → reduce confusión entre caracteres; <strong>uniformidad del peso del trazo</strong> → menos fatiga visual; <strong>espaciado entre letras</strong> (tracking) equilibrado; <strong>distinción entre caracteres similares</strong> (I, l, 1; O, 0; b, d, p, q). Las fuentes diseñadas para interfaces (Inter, Roboto) optimizan todos estos factores para uso digital.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Serif o sans-serif para texto largo en pantalla?</summary>
              <p className={styles.eduFaqRespuesta}>La creencia tradicional era &quot;serif para impreso, sans-serif para pantalla&quot;. Con las pantallas de alta resolución actuales (Retina, 4K), los estudios de legibilidad muestran que la diferencia es mínima y depende más del tamaño, el interlineado y el contraste que de la familia. Medium, The New York Times digital y muchos libros digitales de calidad usan serif sin problema. La elección debe basarse en la marca, el tono y el contexto, no en dogmas tipográficos desactualizados.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cómo elegir una buena combinación de fuentes (font pairing)?</summary>
              <p className={styles.eduFaqRespuesta}>Principios de emparejamiento tipográfico: (1) <strong>Contraste, no conflicto</strong>: combina familias distintas (serif + sans-serif) en lugar de dos fuentes similares que compiten. (2) <strong>Jerarquía clara</strong>: una domina (cuerpo) y la otra acenta (títulos). (3) <strong>Coherencia de época</strong>: fuentes del mismo periodo histórico o escuela de diseño suelen funcionar juntas. (4) <strong>Usar superfamilias</strong>: familias como Source Serif + Source Sans, o Noto Serif + Noto Sans, están diseñadas para usarse juntas. Google Fonts tiene una herramienta de &quot;font pairing&quot; que muestra combinaciones probadas.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Las fuentes de Google Fonts son gratis para uso comercial?</summary>
              <p className={styles.eduFaqRespuesta}>La mayoría de fuentes en Google Fonts se distribuyen bajo licencias <strong>SIL Open Font License (OFL)</strong> o Apache License 2.0, que permiten uso gratuito en proyectos comerciales, incluyendo aplicaciones, sitios web y productos impresos. Sin embargo, siempre verifica la licencia individual de cada fuente en su página de detalle. Algunas fuentes en Google Fonts tienen restricciones específicas. Las fuentes de Adobe Fonts (Typekit) requieren suscripción a Creative Cloud y tienen restricciones de redistribución más estrictas.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Cuánto afecta el peso tipográfico al rendimiento web?</summary>
              <p className={styles.eduFaqRespuesta}>Cada variante de peso (light, regular, medium, bold, etc.) de una Google Font es un archivo separado de 30-150 KB. Cargar 4 pesos de 2 familias = 8 archivos = potencialmente 400-800 KB extra. Las mejores prácticas: (1) carga solo los pesos que realmente usas; (2) usa el atributo <strong>font-display: swap</strong> para que el texto sea visible mientras carga; (3) considera las fuentes del sistema (system-ui, -apple-system) para cuerpo si la velocidad es prioritaria; (4) usa el subconjunto de caracteres latinos si no necesitas los 900+ caracteres del juego completo Unicode.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué es el kerning y por qué importa?</summary>
              <p className={styles.eduFaqRespuesta}>El <strong>kerning</strong> es el ajuste del espacio entre pares de caracteres específicos para que visualmente parezcan equidistantes (aunque físicamente no lo sean). El par &quot;AV&quot; necesita estar más cerca que &quot;II&quot; para parecer el mismo espacio. Las fuentes bien diseñadas incluyen tablas de kerning extensas. El <strong>tracking</strong> (letter-spacing en CSS) ajusta el espacio uniformemente entre todos los caracteres. Regla: el tracking positivo (letras más separadas) funciona bien en titulares grandes o texto en mayúsculas; el tracking negativo (letras más juntas) puede usarse en titulares muy grandes. En cuerpo, no tocar el tracking.</p>
            </details>
            <details className={styles.eduFaqItem}>
              <summary className={styles.eduFaqPregunta}>¿Qué tipografía usa cada gran empresa tecnológica?</summary>
              <p className={styles.eduFaqRespuesta}>Las grandes empresas suelen crear sus propias tipografías para control total: <strong>Apple</strong>: SF Pro (San Francisco, 2015) para iOS/macOS/watchOS. <strong>Google</strong>: Product Sans para branding, Roboto para Android. <strong>Microsoft</strong>: Segoe UI para Windows. <strong>Airbnb</strong>: Cereal. <strong>Netflix</strong>: Netflix Sans. <strong>Spotify</strong>: Circular. Para la web, las más usadas según Google Fonts Analytics son: Roboto, Open Sans, Lato, Oswald, Raleway, Montserrat. En España, el Gobierno usa Archivo, Rubik y fuentes del sistema según la guía de accesibilidad de Administración Digital.</p>
            </details>
          </div>
        </section>

        <section>
          <h3>📋 Cómo Elegir Tipografías para un Proyecto: Guía en 6 Pasos</h3>
          <ol className={styles.eduPasosList}>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>1</span>
              <div>
                <strong>Define la personalidad y el tono del proyecto</strong>
                <p>Antes de abrir Google Fonts, responde: ¿qué adjetivos definen tu marca o proyecto? ¿Moderno o clásico? ¿Serio o juguetón? ¿Tecnológico o artesanal? Esos adjetivos mapean directamente a familias tipográficas: moderno → sans-serif geométrica; clásico → serif con historia; artesanal → script o display con personalidad.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>2</span>
              <div>
                <strong>Elige la fuente de cuerpo primero</strong>
                <p>El 80% del texto está en el cuerpo. Empieza por ahí. Busca: alta x-height, contraformas abiertas, buen rendimiento en tamaños pequeños (16-18px en web). Prueba escribiendo un párrafo completo en el generador, no solo &quot;The quick brown fox&quot;. ¿Es cómoda de leer varios párrafos seguidos?</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>3</span>
              <div>
                <strong>Elige el contraste para los títulos</strong>
                <p>Una vez fijada la fuente de cuerpo, busca un contraste visual claro para los títulos. Si el cuerpo es sans-serif, prueba una serif para títulos (y viceversa). O usa la misma familia pero en peso bold/extrabold. El contraste de peso (light vs bold) dentro de la misma familia es la combinación más segura y elegante.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>4</span>
              <div>
                <strong>Prueba en contexto real antes de decidir</strong>
                <p>Crea un prototipo de baja fidelidad con el texto real del proyecto (no &quot;Lorem Ipsum&quot;). Mira cómo quedan los títulos largos, los párrafos de 3-4 líneas, las listas, los números. Algunos problemas tipográficos solo se ven en contexto: números mal diseñados, comillas incorrectas para el español, falta de la ñ o tildes en la versión gratuita.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>5</span>
              <div>
                <strong>Verifica la licencia y los caracteres disponibles</strong>
                <p>Confirma que la fuente incluye todos los caracteres que necesitas: ñ, tildes (á,é,í,ó,ú), ¡¿, €, y cualquier carácter especial de tu idioma. Verifica la licencia para el uso previsto (web, app, impreso, redistribución). Comprueba cuántos pesos están disponibles — una fuente con solo 2 pesos limita la jerarquía visual.</p>
              </div>
            </li>
            <li className={styles.eduPaso}>
              <span className={styles.eduPasoNum}>6</span>
              <div>
                <strong>Establece la escala tipográfica</strong>
                <p>Define los tamaños para cada nivel jerárquico: H1, H2, H3, cuerpo, caption, etiquetas. Usa una escala modular (ratio 1,25 o 1,333): si el cuerpo es 16px, los títulos serían 20 → 25 → 31 → 39px. Documenta también los pesos (light/regular/bold) y colores para cada nivel. Esta guía de estilos evita inconsistencias cuando el proyecto crece.</p>
              </div>
            </li>
          </ol>
        </section>

        <section>
          <h3>💡 Principios Tipográficos que Todo Diseñador Debería Conocer</h3>
          <div className={styles.eduTipsGrid}>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📏</span>
              <h4>Interlineado: 1,5× el tamaño</h4>
              <p>El line-height óptimo para legibilidad en cuerpo de texto es 1,4-1,6 veces el tamaño de fuente. Para 16px de cuerpo: 24-26px de interlineado. Menos → las líneas se solapan visualmente. Más → se pierde la cohesión del párrafo.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>📐</span>
              <h4>Longitud de línea: 65-75 caracteres</h4>
              <p>La longitud ideal de una línea de texto es 65-75 caracteres (incluyendo espacios). Más largo → el ojo se cansa de volver al inicio. Más corto → demasiados saltos de línea. En CSS: max-width de 60-70ch para columnas de texto.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🎨</span>
              <h4>Contraste mínimo 4,5:1 (WCAG AA)</h4>
              <p>El estándar de accesibilidad web WCAG 2.1 requiere 4,5:1 de contraste entre texto y fondo para AA, y 7:1 para AAA. Texto negro (#000) sobre blanco (#fff) = 21:1. Gris medio (#767676) sobre blanco = 4,54:1, exactamente en el límite. Usa la herramienta de contraste de WebAIM para verificar.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🔡</span>
              <h4>Mayúsculas: añade tracking positivo</h4>
              <p>El texto en mayúsculas es más difícil de leer sin espacio adicional entre letras. Cuando uses uppercase en CSS, añade siempre letter-spacing: 0.05-0.1em. Las mayúsculas sin tracking parecen apretadas y difíciles de leer, especialmente en etiquetas pequeñas y botones.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>🚫</span>
              <h4>Evita itálica en sans-serif a cuerpo pequeño</h4>
              <p>Las itálicas de fuentes sans-serif (especialmente las &quot;oblique&quot;, que son solo versiones inclinadas matemáticamente) pierden legibilidad en tamaños pequeños. Si necesitas énfasis en cuerpo pequeño, usa bold en lugar de itálica, o una fuente con itálica verdadera (calligraphic italic) bien diseñada.</p>
            </div>
            <div className={styles.eduTipCard}>
              <span className={styles.eduTipIcono}>⚖️</span>
              <h4>Display font: solo para textos cortos</h4>
              <p>Las fuentes decorativas y display son poderosas en títulos grandes pero ilegibles en cuerpo. Regla de oro: si usas una display font, que sea solo para 1-5 palabras en tamaño grande. Nunca uses una fuente decorativa para párrafos completos, formularios o botones con texto largo.</p>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.warningBox}>
            <span className={styles.warningIcono}>⚠️</span>
            <div>
              <strong>Errores comunes al trabajar con tipografías</strong>
              <ul>
                <li><strong>Usar demasiadas fuentes:</strong> Más de 2-3 fuentes en un mismo diseño crea desorden visual y aumenta el tiempo de carga en web. Prefiere explorar los distintos pesos de una misma familia antes de añadir una fuente nueva.</li>
                <li><strong>Ignorar el rendimiento web:</strong> Cargar 6-8 variantes de Google Fonts puede añadir 500-800 KB y retrasar el LCP (Largest Contentful Paint) significativamente. Usa solo los pesos y estilos que realmente necesitas, y activa font-display: swap en tu CSS.</li>
                <li><strong>No verificar los caracteres especiales del español:</strong> Algunas fuentes gratuitas no incluyen ñ, tildes, ¡, ¿ o el símbolo €. Siempre prueba con texto real en español antes de comprometerte con una fuente para un proyecto.</li>
                <li><strong>Ignorar las licencias:</strong> No todas las fuentes &quot;gratuitas&quot; permiten uso comercial, embedding en apps o redistribución. Lee siempre la licencia (OFL, Apache, propietaria) antes de usar una fuente en un proyecto comercial o que vayas a distribuir.</li>
                <li><strong>Confundir legibilidad con estética:</strong> Una fuente muy bella en un mockup puede ser ilegible en uso real (texto pequeño, pantallas de baja resolución, usuarios con problemas de visión). Siempre prueba la legibilidad en las condiciones reales de uso, no solo en tu monitor de diseño.</li>
              </ul>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-tipografias')} />

      <ShareCard appName="generador-tipografias" />
      <Footer appName="generador-tipografias" />
    </div>
  );
}
