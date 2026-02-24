'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import styles from './ContrasteColores.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

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
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

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

  // Generar código CSS con las variables de color validadas
  const generarCodigoHTML = useCallback(() => {
    if (!result || result.ratio < 3) {
      setHtmlCode('');
      return;
    }

    let codigo = '/* Variables CSS - Contraste verificado con meskeIA */\n\n';
    codigo += '/* Combinación de colores - ' + getScoreLabel() + ' */\n';
    codigo += '/* Ratio de contraste: ' + result.ratio.toFixed(2) + ':1 */\n';
    codigo += '/* Cumplimiento WCAG: ';

    if (result.normalAAA) {
      codigo += 'AAA (Normal y Grande) */\n\n';
    } else if (result.normalAA) {
      codigo += 'AA (Normal), AAA (Grande) */\n\n';
    } else if (result.largeAA) {
      codigo += 'AA (Solo texto grande) */\n\n';
    } else {
      codigo += 'Ninguno - No recomendado */\n\n';
    }

    codigo += ':root {\n';
    codigo += '  /* Color de texto */\n';
    codigo += `  --text-color: ${foreground};\n\n`;
    codigo += '  /* Color de fondo */\n';
    codigo += `  --background-color: ${background};\n`;
    codigo += '}\n\n';

    codigo += '/* Aplicación en elementos */\n';
    codigo += '.element {\n';
    codigo += '  color: var(--text-color);\n';
    codigo += '  background-color: var(--background-color);\n';
    codigo += '}\n\n';

    // Añadir metadata de validación
    codigo += '/* Metadatos de validación WCAG 2.1 */\n';
    codigo += '/* - Texto Normal AA (4.5:1): ' + (result.normalAA ? 'Pasa ✓' : 'Falla ✗') + ' */\n';
    codigo += '/* - Texto Normal AAA (7:1): ' + (result.normalAAA ? 'Pasa ✓' : 'Falla ✗') + ' */\n';
    codigo += '/* - Texto Grande AA (3:1): ' + (result.largeAA ? 'Pasa ✓' : 'Falla ✗') + ' */\n';
    codigo += '/* - Texto Grande AAA (4.5:1): ' + (result.largeAAA ? 'Pasa ✓' : 'Falla ✗') + ' */\n\n';

    codigo += '/* Recomendación de uso: */\n';
    if (result.normalAAA) {
      codigo += '/* Válido para todo tipo de texto (normal y grande) en nivel AAA */\n';
    } else if (result.normalAA) {
      codigo += '/* Válido para todo tipo de texto en nivel AA, y grande en AAA */\n';
    } else if (result.largeAA) {
      codigo += '/* Solo usar en texto grande (18pt+ o 14pt+ negrita) */\n';
    }

    codigo += '\n/* Generado con https://meskeia.com/contraste-colores/ */';

    setHtmlCode(codigo);
  }, [foreground, background, result]);

  // Copiar código CSS
  const copiarCodigoHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      alert('✅ Código CSS copiado al portapapeles');
    } catch {
      alert('Error al copiar. Copia manualmente el código.');
    }
  };

  // Auto-generar cuando cambian los colores o resultado
  useEffect(() => {
    generarCodigoHTML();
  }, [generarCodigoHTML]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎯 Contraste de Colores</h1>
        <p className={styles.subtitle}>
          Verifica la accesibilidad según WCAG 2.1
        </p>
      </header>

      <LegalNotice />

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

      {/* Código CSS de implementación - Colapsable */}
      {result && result.ratio >= 3 && htmlCode && (
        <div className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2>💻 Código CSS de implementación</h2>
              <p className={styles.htmlSubtitle}>
                Variables CSS listas para usar con tu combinación de colores validada por WCAG
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHtmlExpanded(!htmlExpanded)}
              className={styles.btnToggleCode}
              aria-label={htmlExpanded ? 'Ocultar código' : 'Mostrar código'}
            >
              {htmlExpanded ? '🔼 Ocultar código' : '🔽 Ver código completo'}
            </button>
          </div>

          {htmlExpanded && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>
                <code>{htmlCode}</code>
              </pre>
              <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyCode}>
                📋 Copiar código completo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Contenido educativo profesional */}
      <EducationalSection
        title="📚 Guía Completa de Contraste y Accesibilidad WCAG"
        subtitle="Domina los principios de contraste, comprende los niveles WCAG, y aprende a crear diseños accesibles desde el primer momento"
        icon="📚"
      >
        {/* TABLA COMPARATIVA: AA vs AAA */}
        <section className={styles.comparativaSection}>
          <h2>⚖️ Tabla Comparativa: Niveles WCAG</h2>
          <p className={styles.comparativaSubtitle}>
            Diferencias entre AA y AAA, requisitos mínimos, y cuándo usar cada nivel
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>Nivel AA</th>
                  <th>Nivel AAA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Texto Normal</strong></td>
                  <td>4.5:1 mínimo</td>
                  <td>7:1 mínimo</td>
                </tr>
                <tr>
                  <td><strong>Texto Grande</strong></td>
                  <td>3:1 mínimo</td>
                  <td>4.5:1 mínimo</td>
                </tr>
                <tr>
                  <td><strong>Definición Grande</strong></td>
                  <td>18pt+ o 14pt+ negrita</td>
                  <td>18pt+ o 14pt+ negrita</td>
                </tr>
                <tr>
                  <td><strong>Obligatoriedad Legal</strong></td>
                  <td>✅ Requerido por ley en UE, EEUU (sector público)</td>
                  <td>Recomendado (no obligatorio)</td>
                </tr>
                <tr>
                  <td><strong>Cobertura Discapacidad</strong></td>
                  <td>Usuarios con baja visión moderada</td>
                  <td>Baja visión severa, ceguera al color</td>
                </tr>
                <tr>
                  <td><strong>Cuándo Usar</strong></td>
                  <td>Sitios web públicos, e-commerce, apps corporativas</td>
                  <td>Apps de salud, finanzas, contenido crítico para lectura prolongada</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Mayoría de proyectos web y móviles</td>
                  <td>Proyectos con audiencia mayor de 60 años, interfaces médicas/legales</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO PRÁCTICOS */}
        <section className={styles.escenariosSection}>
          <h2>💼 Casos de Uso Prácticos</h2>
          <p className={styles.escenariosSubtitle}>
            Escenarios reales donde el contraste de colores es crítico
          </p>

          <div className={styles.escenariosGrid}>
            {/* Caso 1: Diseño web corporativo */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌐</span>
                <h3>Diseño Web Corporativo</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>
                  Texto body: #333333 sobre #FFFFFF (11.7:1 - AAA){'\n'}
                  Enlaces: #0066CC sobre #FFFFFF (8.2:1 - AAA){'\n'}
                  CTA: #FFFFFF sobre #2E86AB (4.52:1 - AA)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> El texto principal en gris oscuro pasa AAA fácilmente, los enlaces azules destacan sin sacrificar accesibilidad, y los botones CTA cumplen AA para llamar la atención sin perder legibilidad.
              </p>
            </div>

            {/* Caso 2: Dashboards y Apps */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📊</span>
                <h3>Dashboards y Apps de Datos</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>
                  Headers: #1A1A1A sobre #F5F5F5 (15.3:1 - AAA){'\n'}
                  Datos críticos: #DC3545 sobre #FFFFFF (5.5:1 - AA){'\n'}
                  Gráficos: Paleta con contraste mínimo 4.5:1
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Dashboards requieren lectura rápida de métricas. Contraste AAA en headers mejora escaneo visual, y los datos críticos (como alertas) usan rojo que cumple AA para destacar sin comprometer accesibilidad.
              </p>
            </div>

            {/* Caso 3: E-commerce */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🛒</span>
                <h3>E-commerce: Precios y CTAs</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>
                  Precio original: #999999 sobre #FFFFFF (2.8:1 - Falla){'\n'}
                  Precio descuento: #DC3545 sobre #FFFFFF (5.5:1 - AA){'\n'}
                  Botón Comprar: #FFFFFF sobre #28A745 (3.15:1 - AA grande)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> El precio original tachado puede fallar (es decorativo), pero el precio de venta en rojo cumple AA para llamar la atención. El botón "Comprar" en verde cumple AA para texto grande (18pt+).
              </p>
            </div>

            {/* Caso 4: Modo Oscuro */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>🌙</span>
                <h3>Modo Oscuro: Apps Nocturnas</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>
                  Background: #1A1A1A{'\n'}
                  Texto principal: #E5E5E5 (13.5:1 - AAA){'\n'}
                  Texto secundario: #B0B0B0 (7.8:1 - AAA){'\n'}
                  Enlaces: #7FB3D3 (5.2:1 - AA)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> El modo oscuro requiere cuidado especial. Usar gris claro (#E5E5E5) en lugar de blanco puro reduce fatiga visual sin perder contraste. Los enlaces en azul claro cumplen AA y destacan sobre el fondo negro.
              </p>
            </div>

            {/* Caso 5: Contenido Editorial */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>📝</span>
                <h3>Contenido Editorial: Lectura Prolongada</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>
                  Párrafos: #333333 sobre #FFFFFF (11.7:1 - AAA){'\n'}
                  Títulos: #000000 sobre #FFFFFF (21:1 - AAA){'\n'}
                  Citas: #666666 sobre #F9F9F9 (5.7:1 - AA)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Blogs, revistas online y documentos requieren lectura prolongada. AAA en texto principal reduce fatiga visual. Citas con fondo gris muy claro mantienen distinción visual sin perder contraste AA.
              </p>
            </div>

            {/* Caso 6: Cumplimiento Legal */}
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon}>⚖️</span>
                <h3>Cumplimiento Legal: Sector Público</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Ejemplo:</strong></p>
                <code>
                  Todo el texto: AA obligatorio (mínimo 4.5:1){'\n'}
                  Formularios: Etiquetas con contraste 7:1 (AAA){'\n'}
                  Errores: #C82333 sobre #FFFFFF (6.4:1 - AA)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> En UE (Directiva 2016/2102) y EEUU (Section 508), las webs del sector público DEBEN cumplir AA. Apuntar a AAA en formularios críticos protege contra demandas y mejora usabilidad para todos.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ AMPLIADO */}
        <section className={styles.faqSection}>
          <h2>❓ Preguntas Frecuentes sobre Contraste WCAG</h2>

          <div className={styles.faqList}>
            {/* Pregunta 1 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué diferencia hay realmente entre AA y AAA, y cuál debo elegir?</h4>
              <p>
                <strong>AA es el estándar legal</strong> exigido por normativas de accesibilidad (WCAG 2.1, Directiva UE 2016/2102, Section 508). Requiere 4.5:1 para texto normal y 3:1 para texto grande. Es suficiente para la mayoría de proyectos web y móviles.
              </p>
              <p>
                <strong>AAA es el nivel óptimo</strong> (7:1 normal, 4.5:1 grande) recomendado para:
              </p>
              <ul>
                <li>Apps de salud, finanzas, o contenido crítico donde errores de lectura tienen consecuencias graves</li>
                <li>Audiencias mayores de 60 años (pérdida de agudeza visual natural)</li>
                <li>Lectura prolongada (blogs, documentación técnica, e-learning)</li>
              </ul>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Si es tu primera auditoría de accesibilidad, apunta a AA. Una vez conseguido, mejora gradualmente los elementos más críticos (títulos, formularios, CTAs) a AAA.
              </p>
            </div>

            {/* Pregunta 2 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuándo es legalmente obligatorio cumplir WCAG?</h4>
              <p>
                En la <strong>Unión Europea</strong>, la Directiva (UE) 2016/2102 obliga a:
              </p>
              <ul>
                <li>Todas las webs y apps del <strong>sector público</strong> (ayuntamientos, universidades, hospitales públicos)</li>
                <li>Empresas con más de 10 empleados o facturación &gt; 2M€ que ofrezcan servicios al público (desde 2025)</li>
              </ul>
              <p>
                En <strong>Estados Unidos</strong>, la Section 508 y ADA (Americans with Disabilities Act) aplican a:
              </p>
              <ul>
                <li>Agencias gubernamentales federales</li>
                <li>Empresas consideradas "lugares públicos" (jurisprudencia Domino's vs Robles 2019)</li>
              </ul>
              <p>
                En <strong>España</strong>, el RD 1112/2018 exige cumplimiento total desde septiembre 2020 para webs públicas.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Aunque tu proyecto no sea legalmente obligado, cumplir AA mejora el SEO (Google penaliza mala accesibilidad desde 2021) y amplía tu audiencia potencial en +15% (personas con discapacidad visual).
              </p>
            </div>

            {/* Pregunta 3 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo afecta el modo oscuro al contraste, y debo verificar ambos modos?</h4>
              <p>
                <strong>Sí, es crítico verificar ambos.</strong> El contraste no es simétrico: un par que funciona en modo claro puede fallar en oscuro.
              </p>
              <p>
                <strong>Error común:</strong> Usar #FFFFFF sobre fondo negro (#000000) en modo oscuro. Aunque el ratio es 21:1 (perfecto), el blanco puro crea <strong>deslumbramiento</strong> (glare) que causa fatiga visual.
              </p>
              <p>
                <strong>Solución recomendada:</strong>
              </p>
              <ul>
                <li>Modo oscuro: Usa #E5E5E5 o #D4D4D4 (gris claro) en lugar de #FFFFFF</li>
                <li>Fondo: Usa #1A1A1A en lugar de #000000 (negro puro es agresivo)</li>
                <li>Verifica enlaces y botones: Los azules que funcionan en claro pueden necesitar tintes más claros en oscuro</li>
              </ul>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Crea un toggle en tu design system y verifica TODOS los pares de color en ambos modos antes de lanzar. Herramientas como Figma permiten plugins de verificación automática (Stark, A11y).
              </p>
            </div>

            {/* Pregunta 4 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué pasa si solo fallo AAA pero paso AA? ¿Es suficiente?</h4>
              <p>
                <strong>Sí, es suficiente para cumplimiento legal</strong> y la mayoría de casos de uso. Pasar AA significa:
              </p>
              <ul>
                <li>Tu sitio es accesible para personas con baja visión <strong>moderada</strong></li>
                <li>Cumples con normativas legales (UE, EEUU, WCAG 2.1 nivel AA)</li>
                <li>Google no penalizará tu SEO por accesibilidad</li>
              </ul>
              <p>
                <strong>Considera subir a AAA si:</strong>
              </p>
              <ul>
                <li>Tu audiencia es principalmente &gt;60 años (bancos, seguros, pensiones)</li>
                <li>El contenido es crítico (salud, finanzas, legal)</li>
                <li>Quieres destacar en certificaciones de accesibilidad (ISO 30071-1)</li>
              </ul>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Prioriza AAA en elementos críticos (formularios, mensajes de error, CTAs) aunque el resto sea AA. Esto te da un balance óptimo entre usabilidad y esfuerzo de diseño.
              </p>
            </div>

            {/* Pregunta 5 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿El contraste de colores afecta al SEO?</h4>
              <p>
                <strong>Sí, indirectamente.</strong> Google no verifica contraste directamente, pero desde 2021 incluye <strong>Core Web Vitals de Accesibilidad</strong> en su algoritmo de ranking.
              </p>
              <p>
                <strong>Impacto en SEO:</strong>
              </p>
              <ul>
                <li><strong>Bounce rate:</strong> Mal contraste aumenta abandonos (usuarios no pueden leer → se van → Google penaliza)</li>
                <li><strong>Tiempo en página:</strong> Buen contraste mejora legibilidad → más tiempo → señal positiva para Google</li>
                <li><strong>Lighthouse Score:</strong> Google PageSpeed Insights incluye auditoría de contraste (categoría "Accessibility"). Scores bajos afectan ranking.</li>
              </ul>
              <p>
                <strong>Datos concretos:</strong> Sitios con Lighthouse Accessibility Score &gt;90 tienen un 23% más de tráfico orgánico que aquellos con &lt;50 (estudio de HTTPArchive 2023).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Ejecuta Google Lighthouse en Chrome DevTools (F12 → Lighthouse → Accessibility). Corrige TODOS los errores de contraste que detecte para maximizar tu score.
              </p>
            </div>

            {/* Pregunta 6 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo verifico el contraste de texto sobre imágenes o gradientes?</h4>
              <p>
                <strong>Texto sobre imágenes es el escenario más difícil</strong> porque el contraste varía según la zona de la imagen. WCAG exige verificar el <strong>contraste mínimo</strong> (peor zona).
              </p>
              <p>
                <strong>Técnicas recomendadas:</strong>
              </p>
              <ol>
                <li><strong>Overlay oscuro/claro:</strong> Añade un `background: rgba(0,0,0,0.5)` (negro semi-transparente) detrás del texto. Verifica que el contraste entre el texto y el color resultante del overlay sea ≥4.5:1.</li>
                <li><strong>Sombra de texto (text-shadow):</strong> `text-shadow: 0 0 6px rgba(0,0,0,0.8)` crea un halo que mejora contraste. Útil para texto sobre fotos variadas.</li>
                <li><strong>Gradientes:</strong> Verifica contraste en AMBOS extremos del gradiente. Si fallas en uno, añade overlay.</li>
              </ol>
              <p>
                <strong>Herramientas específicas:</strong>
              </p>
              <ul>
                <li><strong>Contrast Ratio (Lea Verou):</strong> leaverou.github.io/contrast-ratio - Permite overlays semi-transparentes</li>
                <li><strong>Chrome DevTools:</strong> Inspecciona elemento → pestaña "Accessibility" → muestra contraste detectado</li>
              </ul>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Si el texto es crítico (CTA, títulos hero), usa SIEMPRE overlay o fondo sólido. Las imágenes pueden cambiar (CMS dinámico) y romper tu contraste inicial.
              </p>
            </div>

            {/* Pregunta 7 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿Qué otras herramientas complementan esta calculadora de contraste?</h4>
              <p>
                Esta herramienta verifica contraste de <strong>un par de colores a la vez</strong>. Para auditorías completas y automatización, combina con:
              </p>
              <p>
                <strong>Herramientas de auditoría completa:</strong>
              </p>
              <ul>
                <li><strong>WAVE (WebAIM):</strong> Extensión Chrome que audita TODA la página (texto, imágenes, formularios). Detecta errores de contraste en contexto real.</li>
                <li><strong>axe DevTools:</strong> Plugin gratuito de Deque. Más técnico que WAVE, permite exportar reportes PDF.</li>
                <li><strong>Google Lighthouse:</strong> Ya incluido en Chrome DevTools. Auditoría completa de accesibilidad + performance + SEO.</li>
              </ul>
              <p>
                <strong>Herramientas de diseño (Figma, Adobe XD):</strong>
              </p>
              <ul>
                <li><strong>Stark (plugin Figma):</strong> Verifica contraste en tiempo real mientras diseñas. Muestra cumplimiento AA/AAA directamente en el canvas.</li>
                <li><strong>A11y - Color Contrast Checker (Figma):</strong> Plugin gratuito similar a Stark.</li>
              </ul>
              <p>
                <strong>Automatización CI/CD:</strong>
              </p>
              <ul>
                <li><strong>Pa11y:</strong> Herramienta CLI que ejecuta auditorías en pipeline. Falla el build si detecta errores de contraste.</li>
                <li><strong>axe-core (librería npm):</strong> Integra tests de accesibilidad en Jest/Cypress. Detecta fallos antes de desplegar.</li>
              </ul>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Workflow recomendado: Diseña con Stark en Figma → Verifica con esta herramienta → Audita con WAVE antes de lanzar → Automatiza con Pa11y en producción.
              </p>
            </div>

            {/* Pregunta 8 */}
            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo ajusto colores de marca que fallan el contraste sin perder identidad visual?</h4>
              <p>
                <strong>Problema común:</strong> Tu azul corporativo (#5A9FD4) falla AA sobre blanco (3.2:1). No puedes cambiar el color de marca, ¿qué haces?
              </p>
              <p>
                <strong>Técnica: Mantén la marca en elementos grandes, ajusta luminosidad en texto normal.</strong>
              </p>
              <ol>
                <li><strong>Usa HSL en lugar de HEX:</strong> Convierte tu color a HSL (Hue, Saturation, Lightness). Ajusta SOLO el componente L (luminosidad) sin cambiar H (tono) ni S (saturación).</li>
                <li><strong>Ejemplo práctico:</strong>
                  <ul>
                    <li>Color original: #5A9FD4 → HSL(206°, 60%, 60%)</li>
                    <li>Reducir L de 60% a 40% → #2E7DB3 (contraste 4.52:1 - Pasa AA)</li>
                    <li>El tono (206°) y saturación (60%) se mantienen → identidad visual preservada</li>
                  </ul>
                </li>
                <li><strong>Aplica selectivamente:</strong>
                  <ul>
                    <li>Logos, iconos grandes: Usa color original (#5A9FD4)</li>
                    <li>Texto normal, enlaces: Usa versión ajustada (#2E7DB3)</li>
                  </ul>
                </li>
              </ol>
              <p>
                <strong>Herramientas útiles:</strong>
              </p>
              <ul>
                <li><strong>Conversor de Colores meskeIA:</strong> /conversor-colores/ - Convierte HEX a HSL y viceversa</li>
                <li><strong>ColorBox by Lyft:</strong> colorbox.io - Genera paletas accesibles manteniendo el tono base</li>
              </ul>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Documenta en tu design system: "Color primario: #5A9FD4 (solo elementos grandes). Texto primario: #2E7DB3 (AA compliant)". Esto evita confusión en el equipo de diseño.
              </p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.guideSection}>
          <h2>📋 Guía Paso a Paso: Auditoría Completa de Contraste</h2>

          <div className={styles.stepGuide}>
            {/* Paso 1 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica todos los pares de color en tu diseño</h4>
                <p>
                  Haz un inventario completo de combinaciones texto-fondo en tu sitio: body text, títulos, enlaces, botones, formularios, badges, alertas, tooltips, breadcrumbs, menús de navegación, footers, etc. <strong>No olvides el modo oscuro</strong> si lo tienes implementado. Crea una hoja de cálculo con columnas: Elemento, Color Texto, Color Fondo, Tamaño Fuente, Peso Fuente (normal/bold).
                </p>
              </div>
            </div>

            {/* Paso 2 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Verifica el contraste de cada par con esta herramienta</h4>
                <p>
                  Introduce cada par de colores en la calculadora. Anota el <strong>ratio obtenido</strong> y si <strong>pasa AA/AAA</strong>. Para texto &lt;18pt (o &lt;14pt no negrita), necesitas 4.5:1 (AA) o 7:1 (AAA). Para texto ≥18pt (o ≥14pt negrita), necesitas 3:1 (AA) o 4.5:1 (AAA). Marca con 🔴 los que fallen, 🟡 los que pasen AA pero fallen AAA, y 🟢 los que pasen AAA.
                </p>
              </div>
            </div>

            {/* Paso 3 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Prioriza según criticidad del elemento</h4>
                <p>
                  No todos los elementos tienen el mismo impacto. <strong>Prioridad ALTA</strong>: CTAs (botones "Comprar", "Registrarse"), formularios (labels, inputs, errores), alertas críticas, títulos principales. <strong>Prioridad MEDIA</strong>: Enlaces de navegación, breadcrumbs, texto body, tooltips. <strong>Prioridad BAJA</strong>: Footers, texto secundario decorativo (ej: precio tachado), badges informativos. Corrige ALTA primero, luego MEDIA, y BAJA solo si tienes tiempo.
                </p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Ajusta colores que fallen usando la técnica HSL</h4>
                <p>
                  Para elementos que fallen: Convierte el color problemático a <strong>HSL</strong> (usa /conversor-colores/). Si el texto falla por ser muy claro, <strong>reduce L (lightness)</strong> en incrementos de 5% hasta pasar AA. Si el texto falla por ser muy oscuro, <strong>aumenta L</strong>. <strong>Mantén H (hue) y S (saturation) sin cambios</strong> para preservar identidad de marca. Ejemplo: #999999 sobre #FFFFFF (2.8:1 - Falla) → Reducir L de 60% a 40% → #666666 (5.74:1 - Pasa AA).
                </p>
              </div>
            </div>

            {/* Paso 5 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Re-verifica tras cambios y prueba visualmente</h4>
                <p>
                  Después de ajustar colores, vuelve a verificar TODOS los pares afectados. <strong>No confíes solo en números:</strong> Abre tu sitio en un navegador real y prueba legibilidad en condiciones de luz natural, con brillo de pantalla al 50%, y en dispositivos móviles (pantallas más pequeñas = contraste crítico). Pide a 2-3 personas (especialmente &gt;60 años) que lean el contenido y te confirmen que es legible sin esfuerzo.
                </p>
              </div>
            </div>

            {/* Paso 6 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Documenta combinaciones aprobadas en tu design system</h4>
                <p>
                  Crea variables CSS en tu design system con los pares validados: <code>--text-primary: #333333;</code>, <code>--bg-primary: #FFFFFF;</code>, <code>--link-color: #0066CC;</code>, etc. <strong>Añade comentarios con el ratio:</strong> <code>/* Contraste 11.7:1 - AAA */</code>. Documenta en Figma/Storybook con badges "AA Compliant" o "AAA Compliant" para que diseñadores usen solo combinaciones aprobadas. Esto previene regresiones futuras.
                </p>
              </div>
            </div>

            {/* Paso 7 */}
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Automatiza verificaciones en CI/CD (opcional pero recomendado)</h4>
                <p>
                  Para proyectos grandes, integra herramientas de auditoría automática en tu pipeline: <strong>Pa11y</strong> (CLI que falla el build si detecta errores de contraste), <strong>axe-core</strong> (librería npm para tests unitarios de accesibilidad), <strong>Lighthouse CI</strong> (ejecuta Lighthouse en cada PR y bloquea merge si Accessibility Score &lt; 90). Esto garantiza que nadie introduzca colores no accesibles en nuevas features. <strong>Tiempo de setup:</strong> 1-2 horas. <strong>Beneficio:</strong> Ahorras 10+ horas anuales en regresiones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.tipsSection}>
          <h2>✅ Mejores Prácticas de Contraste</h2>

          <div className={styles.tipsGrid}>
            {/* Tip 1 */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Usa HSL para ajustar luminosidad</h4>
              <p>
                Convierte colores a HSL y modifica solo el componente L (lightness) para mantener identidad de marca mientras cumples contraste.
              </p>
            </div>

            {/* Tip 2 */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Prioriza AA sobre AAA en primera auditoría</h4>
              <p>
                Si nunca has auditado accesibilidad, apunta a cumplir AA primero. Una vez logrado, mejora gradualmente elementos críticos a AAA.
              </p>
            </div>

            {/* Tip 3 */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Verifica contraste en modo oscuro también</h4>
              <p>
                No asumas simetría: un par que funciona en claro puede fallar en oscuro. Usa #E5E5E5 (no #FFFFFF) para evitar deslumbramiento.
              </p>
            </div>

            {/* Tip 4 */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Crea design tokens con pares validados</h4>
              <p>
                Documenta en tu design system solo combinaciones aprobadas. Añade comentarios CSS con el ratio para referencia futura.
              </p>
            </div>

            {/* Tip 5 */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Usa herramientas de desarrollo (DevTools)</h4>
              <p>
                Chrome DevTools (F12 → Inspeccionar → Accessibility) muestra contraste detectado en vivo. Úsalo para debugging rápido.
              </p>
            </div>

            {/* Tip 6 */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>✅</span>
              <h4>Considera daltonismo además de contraste</h4>
              <p>
                8% de hombres tienen daltonismo. No uses SOLO color para transmitir información crítica (ej: rojo=error). Añade iconos o texto.
              </p>
            </div>
          </div>
        </section>

        {/* WARNING BOX: Errores comunes */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <h3>Errores Comunes que Rompen Accesibilidad</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>❌ Confiar solo en tu vista visual (no usar herramientas):</strong> Tu monitor puede tener brillo alto que enmascara problemas de contraste. Verifica SIEMPRE con herramientas automáticas (esta calculadora, WAVE, Lighthouse) en lugar de confiar en tu percepción visual. Un 15% de usuarios tiene pérdida de visión que tú no experimentas.
            </li>
            <li>
              <strong>❌ Ignorar texto sobre imágenes o gradientes:</strong> El contraste varía según la zona de la imagen. WCAG exige que el contraste mínimo (peor zona) cumpla AA. Solución: Añade overlay semi-transparente (background: rgba(0,0,0,0.5)) o usa text-shadow para crear halo oscuro.
            </li>
            <li>
              <strong>❌ Solo validar modo claro (olvidar modo oscuro):</strong> Un par que funciona en claro puede fallar en oscuro. Ejemplo: #0066CC sobre #FFFFFF (8.2:1 - AAA) vs. #0066CC sobre #1A1A1A (2.1:1 - Falla). Verifica AMBOS modos antes de lanzar.
            </li>
            <li>
              <strong>❌ Usar gris #999999 sobre blanco para texto importante:</strong> Este par (2.8:1) falla AA rotundamente. Es aceptable para texto decorativo (ej: copyright en footer), pero NUNCA para body text, formularios o CTAs. Usa #666666 o más oscuro (5.74:1 - AA).
            </li>
            <li>
              <strong>❌ Creer que pasar AA es suficiente para baja visión:</strong> AA cubre baja visión moderada, pero no severa. Si tu audiencia es &gt;60 años, tienes contenido crítico (salud, finanzas), o quieres destacar en accesibilidad, apunta a AAA en elementos principales. La diferencia en legibilidad es notable.
            </li>
            <li>
              <strong>❌ No documentar combinaciones aprobadas en design system:</strong> Sin documentación, cada nuevo desarrollador o diseñador volverá a cometer los mismos errores. Crea variables CSS comentadas (/* Contraste 11.7:1 - AAA */) y badges en Figma ("AA Compliant") para prevenir regresiones.
            </li>
            <li>
              <strong>❌ Validar solo tamaños grandes (olvidar texto normal):</strong> Texto grande (18pt+) permite contraste más bajo (3:1 AA vs 4.5:1). Pero la mayoría del contenido es texto normal (14-16px). No optimices solo para títulos; el body text es donde pasas el 80% del tiempo leyendo.
            </li>
            <li>
              <strong>❌ Aplicar mismos colores a iconos pequeños sin validar:</strong> Iconos &lt;24px se consideran "texto normal" según WCAG. Ese icono de notificación en naranja (#FF9800 sobre #FFFFFF - 2.2:1) falla AA. Si el icono es crítico (ej: estado de error), usa colores que cumplan 4.5:1 o aumenta su tamaño a ≥24px.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('contraste-colores')} />

      <ShareCard appName="contraste-colores" />
      <Footer appName="contraste-colores" />
    </div>
  );
}
