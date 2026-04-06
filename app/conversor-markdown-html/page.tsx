'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './ConversorMarkdown.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Ejemplos predefinidos
const EJEMPLOS = {
  articulo: `# Guía Completa de Markdown para Bloggers

## ¿Qué es Markdown?

Markdown es un **lenguaje de marcado ligero** que te permite escribir contenido web de forma *simple y rápida*. Fue creado por John Gruber en 2004.

### Ventajas principales

- Fácil de aprender
- Legible en texto plano
- Convertible a HTML
- Usado por **GitHub**, **Reddit** y muchos blogs

## Sintaxis básica

### Formato de texto

Puedes usar **negrita** para resaltar palabras importantes, *cursiva* para énfasis suave, o ***ambas*** para máximo impacto.

### Enlaces e imágenes

Visita [meskeIA](https://meskeia.com) para más herramientas útiles.

### Listas

Lista de tareas:
- Aprender sintaxis básica
- Escribir primer post
- Publicar en blog

Lista numerada:
1. Escribir en Markdown
2. Convertir a HTML
3. Publicar contenido

### Citas

> "La simplicidad es la máxima sofisticación."
> - Leonardo da Vinci

---

## Conclusión

Markdown es la herramienta perfecta para bloggers que quieren **escribir rápido** sin sacrificar formato profesional.`,

  documentacion: `# API Documentation - meskeIA Tools

## Introducción

Bienvenido a la documentación oficial de **meskeIA Tools API**.

## Instalación

### Requisitos previos

- Node.js >= 16.0.0
- npm o yarn
- Cuenta de meskeIA

### Instalación via npm

\`\`\`bash
npm install @meskeia/tools-sdk
\`\`\`

## Endpoints disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| /api/convert/markdown | POST | Convierte Markdown a HTML |
| /api/validate/json | POST | Valida sintaxis JSON |
| /api/compare/diff | POST | Compara dos textos |

## Códigos de respuesta

| Código | Significado |
|--------|-------------|
| 200 | Conversión exitosa |
| 400 | Parámetros inválidos |
| 401 | API key inválida |
| 500 | Error del servidor |

> **Nota**: Para planes Enterprise, contacta con soporte.

---

*Última actualización: 2025*`,

  readme: `# meskeIA Markdown Converter

**Convertidor de Markdown a HTML ultrarrápido para aplicaciones web modernas.**

## Características

- **Rápido**: Conversión instantánea
- **Personalizable**: Temas configurables
- **Seguro**: Sanitización XSS incorporada
- **Ligero**: Sin dependencias externas

## Instalación

\`\`\`bash
npm install @meskeia/markdown-converter
\`\`\`

## Uso básico

\`\`\`javascript
import { convert } from '@meskeia/markdown-converter';
import { getRelatedApps } from '@/data/app-relations';

const html = convert('# Hola Mundo');
console.log(html); // <h1>Hola Mundo</h1>
\`\`\`

## Sintaxis soportada

| Elemento | Markdown | HTML |
|----------|----------|------|
| Título | # H1 | h1 |
| Negrita | **bold** | strong |
| Cursiva | *italic* | em |
| Enlace | [text](url) | a href |

## Contribuir

1. Fork el repositorio
2. Crea tu rama
3. Commit tus cambios
4. Abre un Pull Request

## Licencia

MIT License

---

Hecho con amor por **meskeIA**`
};

// Parser Markdown a HTML
function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Escapar HTML en bloques de código
  const codeBlocks: string[] = [];
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeBlocks.push(`<pre><code>${escapedCode}</code></pre>`);
    return placeholder;
  });

  // Código en línea
  const inlineCode: string[] = [];
  html = html.replace(/`([^`]+)`/g, (_, code) => {
    const placeholder = `__INLINECODE_${inlineCode.length}__`;
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    inlineCode.push(`<code>${escapedCode}</code>`);
    return placeholder;
  });

  // Títulos (de mayor a menor para evitar conflictos)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Líneas horizontales (antes de listas para evitar conflictos)
  html = html.replace(/^---$/gm, '<hr>');
  html = html.replace(/^\*\*\*$/gm, '<hr>');

  // Tablas
  const tableRegex = /^\|(.+)\|$/gm;
  const tableLines: string[] = [];
  let tableMatch;

  // Procesar tablas de forma más robusta
  const lines = html.split('\n');
  let inTable = false;
  let tableContent: string[] = [];
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableContent = [];
      }
      tableContent.push(line);
    } else {
      if (inTable && tableContent.length > 0) {
        // Procesar la tabla acumulada
        const tableHtml = processTable(tableContent);
        processedLines.push(tableHtml);
        tableContent = [];
        inTable = false;
      }
      processedLines.push(line);
    }
  }

  // Procesar tabla final si existe
  if (inTable && tableContent.length > 0) {
    const tableHtml = processTable(tableContent);
    processedLines.push(tableHtml);
  }

  html = processedLines.join('\n');

  // Negrita y cursiva (orden importante)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Enlaces (antes de imágenes)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Imágenes
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // Citas
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  // Unir blockquotes consecutivos
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // Listas desordenadas
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');

  // Listas ordenadas
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Envolver listas
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>\n' + match + '</ul>\n';
  });

  // Párrafos (líneas que no son etiquetas HTML)
  html = html.replace(/^(?!<[a-z]|__|$)(.+)$/gm, '<p>$1</p>');

  // Restaurar bloques de código
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODEBLOCK_${i}__`, block);
  });

  // Restaurar código en línea
  inlineCode.forEach((code, i) => {
    html = html.replace(`__INLINECODE_${i}__`, code);
  });

  // Limpiar
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-6]>)/g, '$1');
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<hr>)<\/p>/g, '$1');
  html = html.replace(/<p>(<table>)/g, '$1');
  html = html.replace(/(<\/table>)<\/p>/g, '$1');
  html = html.replace(/<p>(<pre>)/g, '$1');
  html = html.replace(/(<\/pre>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

  return html.trim();
}

// Procesar tabla Markdown
function processTable(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n');

  const rows = lines.filter(line => !line.match(/^\|[\s-:|]+\|$/));

  if (rows.length === 0) return '';

  const headerCells = rows[0].split('|').filter(c => c.trim()).map(c => c.trim());
  const bodyRows = rows.slice(1);

  let tableHtml = '<table>\n<thead>\n<tr>\n';
  headerCells.forEach(cell => {
    tableHtml += `<th>${cell}</th>\n`;
  });
  tableHtml += '</tr>\n</thead>\n<tbody>\n';

  bodyRows.forEach(row => {
    const cells = row.split('|').filter(c => c.trim()).map(c => c.trim());
    tableHtml += '<tr>\n';
    cells.forEach(cell => {
      tableHtml += `<td>${cell}</td>\n`;
    });
    tableHtml += '</tr>\n';
  });

  tableHtml += '</tbody>\n</table>';
  return tableHtml;
}

// Guía de sintaxis
const SINTAXIS = [
  { titulo: 'Títulos', ejemplos: ['# H1', '## H2', '### H3'] },
  { titulo: 'Énfasis', ejemplos: ['**negrita**', '*cursiva*', '***ambas***'] },
  { titulo: 'Enlaces', ejemplos: ['[texto](https://url.com)'] },
  { titulo: 'Imágenes', ejemplos: ['![alt](url-imagen.jpg)'] },
  { titulo: 'Listas', ejemplos: ['- Item lista', '1. Item numerado'] },
  { titulo: 'Código', ejemplos: ['`código en línea`', '```bloque```'] },
  { titulo: 'Citas', ejemplos: ['> Esto es una cita'] },
  { titulo: 'Línea horizontal', ejemplos: ['---'] },
  { titulo: 'Tablas', ejemplos: ['| Col1 | Col2 |', '|------|------|'] },
];

export default function ConversorMarkdownPage() {
  const [markdown, setMarkdown] = useState('');
  const [ejemploActivo, setEjemploActivo] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Convertir markdown a HTML
  const htmlOutput = markdown ? parseMarkdown(markdown) : '';

  // Cargar ejemplo
  const cargarEjemplo = (tipo: keyof typeof EJEMPLOS) => {
    setMarkdown(EJEMPLOS[tipo]);
    setEjemploActivo(tipo);
  };

  // Copiar HTML
  const copiarHTML = async () => {
    if (!htmlOutput) return;

    try {
      await navigator.clipboard.writeText(htmlOutput);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Limpiar todo
  const limpiarTodo = () => {
    setMarkdown('');
    setEjemploActivo(null);
  };

  // Descargar como archivo
  const descargarHTML = () => {
    if (!htmlOutput) return;

    const contenidoCompleto = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documento</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1A1A1A; }
    h1, h2, h3 { color: #2E86AB; }
    a { color: #2E86AB; }
    code { background: #F6F8FA; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #F6F8FA; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #2E86AB; padding-left: 1rem; margin-left: 0; color: #666; font-style: italic; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #E5E5E5; padding: 0.75rem; text-align: left; }
    th { background: #2E86AB; color: white; }
    tr:nth-child(even) { background: #F5F5F5; }
    hr { border: none; border-top: 2px solid #E5E5E5; margin: 2rem 0; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${htmlOutput}
</body>
</html>`;

    const blob = new Blob([contenidoCompleto], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Descargar como Markdown
  const descargarMD = () => {
    if (!markdown) return;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documento.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor Markdown a HTML</h1>
        <p className={styles.subtitle}>
          Convierte Markdown a HTML limpio con vista previa en tiempo real
        </p>
      </header>

      <LegalNotice />

      {/* Ejemplos rápidos */}
      <div className={styles.ejemplosBar}>
        <span className={styles.ejemplosLabel}>Ejemplos rápidos:</span>
        <div className={styles.ejemplosBtns}>
          <button
            onClick={() => cargarEjemplo('articulo')}
            className={`${styles.ejemploBtn} ${ejemploActivo === 'articulo' ? styles.active : ''}`}
          >
            Artículo de blog
          </button>
          <button
            onClick={() => cargarEjemplo('documentacion')}
            className={`${styles.ejemploBtn} ${ejemploActivo === 'documentacion' ? styles.active : ''}`}
          >
            Documentación
          </button>
          <button
            onClick={() => cargarEjemplo('readme')}
            className={`${styles.ejemploBtn} ${ejemploActivo === 'readme' ? styles.active : ''}`}
          >
            README
          </button>
        </div>
      </div>

      {/* Conversor principal */}
      <div className={styles.converterGrid}>
        {/* Panel Markdown */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span>Markdown (Entrada)</span>
            <span className={styles.charCount}>{markdown.length} caracteres</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder={`Escribe tu Markdown aquí...

# Título Principal
## Subtítulo

Escribe texto en **negrita** o *cursiva*.

- Lista item 1
- Lista item 2

[Enlace a meskeIA](https://meskeia.com)

\`\`\`javascript
console.log('Hola mundo');
\`\`\``}
            className={styles.textarea}
          />
        </div>

        {/* Panel Vista Previa */}
        <div className={styles.panel}>
          <div className={`${styles.panelHeader} ${styles.previewHeader}`}>
            <span>Vista Previa</span>
          </div>
          <div
            className={styles.previewContent}
            dangerouslySetInnerHTML={{ __html: htmlOutput || '<p class="placeholder">La vista previa aparecerá aquí...</p>' }}
          />
        </div>
      </div>

      {/* Panel HTML Output */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>Código HTML Generado</span>
          <button
            onClick={copiarHTML}
            className={styles.copyBtn}
            disabled={!htmlOutput}
          >
            {copiado ? '✓ Copiado' : 'Copiar HTML'}
          </button>
        </div>
        <pre className={styles.htmlOutput}>
          <code>{htmlOutput || '<!-- El código HTML aparecerá aquí -->'}</code>
        </pre>
      </div>

      {/* Acciones */}
      <div className={styles.actionsBar}>
        <button onClick={descargarHTML} className={styles.btnPrimary} disabled={!htmlOutput}>
          Descargar HTML
        </button>
        <button onClick={descargarMD} className={styles.btnSecondary} disabled={!markdown}>
          Descargar .md
        </button>
        <button onClick={limpiarTodo} className={styles.btnOutline} disabled={!markdown}>
          Limpiar todo
        </button>
      </div>

      {/* Guía de sintaxis */}
      <div className={styles.syntaxGuide}>
        <h2>Guía Rápida de Sintaxis Markdown</h2>
        <div className={styles.syntaxGrid}>
          {SINTAXIS.map((item) => (
            <div key={item.titulo} className={styles.syntaxItem}>
              <h3>{item.titulo}</h3>
              {item.ejemplos.map((ej, i) => (
                <code key={i}>{ej}</code>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Información */}
      <div className={styles.infoSection}>
        <h2>¿Para qué se utiliza?</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📝</span>
            <h3>Bloggers</h3>
            <p>Escribe posts en Markdown y conviértelos a HTML para WordPress, Blogger, etc.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>💻</span>
            <h3>Desarrolladores</h3>
            <p>Documenta proyectos y convierte README.md a HTML para web.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>📚</span>
            <h3>Escritores técnicos</h3>
            <p>Crea documentación con sintaxis simple que se convierte a HTML profesional.</p>
          </div>
          <div className={styles.infoCard}>
            <span className={styles.infoIcon}>🔒</span>
            <h3>Privacidad total</h3>
            <p>Todo el procesamiento es local. Tu contenido nunca sale de tu navegador.</p>
          </div>
        </div>
      </div>

      <EducationalSection
        title="Guía de Markdown y HTML"
        subtitle="Todo lo que necesitas saber para escribir y convertir Markdown profesionalmente"
        icon="📝"
      >
        {/* 1. TABLA COMPARATIVA — sintaxis Markdown vs HTML equivalente */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Sintaxis Markdown</th>
                <th>HTML equivalente</th>
                <th>Renderizado</th>
                <th>Compatibilidad</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Encabezado H1</td><td><code># Título</code></td><td><code>&lt;h1&gt;Título&lt;/h1&gt;</code></td><td>Título grande</td><td>✅ Universal</td></tr>
              <tr><td>Negrita</td><td><code>**texto**</code></td><td><code>&lt;strong&gt;texto&lt;/strong&gt;</code></td><td><strong>texto</strong></td><td>✅ Universal</td></tr>
              <tr><td>Enlace</td><td><code>[texto](url)</code></td><td><code>&lt;a href=&quot;url&quot;&gt;texto&lt;/a&gt;</code></td><td>Enlace clicable</td><td>✅ Universal</td></tr>
              <tr><td>Código inline</td><td><code>`código`</code></td><td><code>&lt;code&gt;código&lt;/code&gt;</code></td><td><code>código</code></td><td>✅ Universal</td></tr>
              <tr><td>Lista ordenada</td><td><code>1. item</code></td><td><code>&lt;ol&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ol&gt;</code></td><td>1. item</td><td>✅ Universal</td></tr>
              <tr><td>Tabla</td><td><code>| col | col |</code></td><td><code>&lt;table&gt;...&lt;/table&gt;</code></td><td>Tabla HTML</td><td>🟡 GFM (GitHub Flavored)</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>👨‍💻</span>
              <strong>Desarrollador</strong>
            </div>
            <p>Convierte README.md de proyectos GitHub a HTML para mostrarlos en webs corporativas o wikis internas. También útil para previsualizar documentación técnica antes de publicarla.</p>
            <div className={styles.escenarioTip}>Tip: Activa la extensión GFM (GitHub Flavored Markdown) para soportar tablas, tachado y listas de tareas.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>✍️</span>
              <strong>Escritor / Blogger</strong>
            </div>
            <p>Redacta en Markdown (más rápido y limpio que HTML) y convierte al formato requerido por WordPress, Ghost o cualquier CMS que acepte HTML como input.</p>
            <div className={styles.escenarioTip}>Tip: Markdown es especialmente productivo en combinación con editores como Typora o Obsidian para escritura de larga duración.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📧</span>
              <strong>Marketing / Comunicación</strong>
            </div>
            <p>Genera el HTML de newsletters y correos HTML desde Markdown. Muchas plataformas de email (Mailchimp, SendGrid) aceptan HTML directo que puedes generar aquí.</p>
            <div className={styles.escenarioTip}>Tip: Los clientes de correo tienen soporte HTML limitado; evita CSS externo y usa estilos inline en el HTML final.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📊</span>
              <strong>Analista / Investigador</strong>
            </div>
            <p>Transforma informes y notas en Markdown a HTML listo para incrustar en dashboards internos, Notion, Confluence o cualquier herramienta de gestión del conocimiento.</p>
            <div className={styles.escenarioTip}>Tip: Las tablas Markdown son mucho más legibles para editar que las tablas HTML; usa Markdown como fuente y HTML como output final.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre Markdown y HTML</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Quién inventó Markdown y por qué?</div>
              <div className={styles.faqRespuesta}>John Gruber creó Markdown en 2004 con el objetivo de permitir escribir texto con formato usando una sintaxis fácil de leer sin procesar. La idea era que el texto plano Markdown fuera legible por humanos tal como está, a diferencia del HTML. Aaron Swartz colaboró en el diseño inicial.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la diferencia entre CommonMark y GFM?</div>
              <div className={styles.faqRespuesta}>CommonMark es la especificación estándar y estricta de Markdown (commonmark.org). GitHub Flavored Markdown (GFM) es un superconjunto que añade tablas, listas de tareas, tachado con ~~texto~~ y bloques de código con resaltado de sintaxis. La mayoría de herramientas modernas implementan GFM o una variante próxima.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Se puede usar HTML dentro de Markdown?</div>
              <div className={styles.faqRespuesta}>Sí, en la mayoría de implementaciones. El HTML inline dentro de Markdown se pasa tal cual al output. Sin embargo, algunos procesadores (por seguridad) sanitizan o eliminan ciertos tags. Es útil para casos que Markdown no cubre, como <code>&lt;details&gt;</code>, <code>&lt;kbd&gt;</code> o atributos personalizados.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Por qué mi lista de Markdown no se convierte bien a HTML?</div>
              <div className={styles.faqRespuesta}>El problema más común es la indentación. Markdown requiere exactamente 4 espacios (o 1 tabulador) para sublistas. Además, debe haber una línea en blanco antes de una lista si va precedida de un párrafo. Los mezclados de espacios y tabuladores también causan problemas.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿El HTML generado es seguro para incrustar en una web?</div>
              <div className={styles.faqRespuesta}>Depende del origen del Markdown. Si el Markdown viene de usuarios no confiables, el HTML puede contener scripts maliciosos. Siempre sanitiza el HTML con una librería como DOMPurify antes de insertarlo con innerHTML. Si el Markdown es tuyo propio, el riesgo es mínimo.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Puedo añadir clases CSS o IDs a elementos Markdown?</div>
              <div className={styles.faqRespuesta}>El Markdown estándar no tiene sintaxis para eso. Algunas extensiones como &quot;Attributes&quot; (pandoc, markdown-it-attrs) permiten escribir <code>{'{.clase #id}'}</code>. Alternativamente, usa HTML inline dentro del Markdown para los elementos que necesiten clases específicas.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuál es la mejor librería JavaScript para convertir Markdown a HTML?</div>
              <div className={styles.faqRespuesta}>Las más populares son: <strong>marked</strong> (muy rápida, GFM, 30kb), <strong>markdown-it</strong> (extensible, estricta con CommonMark, excelente ecosistema de plugins) y <strong>remark</strong> (basada en AST, ideal para pipelines de transformación). Para uso simple en el cliente, marked es la más sencilla de usar.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Markdown funciona bien para documentación técnica extensa?</div>
              <div className={styles.faqRespuesta}>Sí, es el estándar de facto. Herramientas como MkDocs, Docusaurus, GitBook y VitePress usan Markdown como fuente. Para documentación muy compleja con referencias cruzadas, variables o includes, considera MDX (Markdown + JSX) o AsciiDoc que tienen más funcionalidades.</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Escribe o pega tu Markdown</strong> — Usa la sintaxis estándar: # para encabezados, ** para negrita, * para cursiva, [texto](url) para enlaces y ``` para bloques de código.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Activa las extensiones necesarias</strong> — Si necesitas tablas o listas de tareas, asegúrate de que GFM esté activado. Para documentos académicos, activa soporte de LaTeX si está disponible.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Previsualiza el resultado</strong> — Comprueba que el HTML renderizado corresponde a lo esperado: jerarquía de encabezados correcta, enlaces funcionales, código con resaltado de sintaxis.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Copia el HTML generado</strong> — Obtén el código HTML limpio. Si lo vas a insertar en una web, copia solo el contenido del <code>&lt;body&gt;</code>, no el documento completo.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Sanitiza si el origen no es de confianza</strong> — Si el Markdown viene de usuarios externos, pasa el HTML resultante por un sanitizador (DOMPurify) antes de insertarlo en el DOM para evitar XSS.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Aplica estilos CSS</strong> — El HTML generado tiene semántica pero no estilos. Aplica una hoja de estilos para tipografía, espaciado y colores. Puedes usar una librería como github-markdown-css para un aspecto estilo GitHub de forma inmediata.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>⚡</span>
            <strong>Atajos de teclado</strong>
            <p>En editores Markdown: Ctrl+B (negrita), Ctrl+I (cursiva), Ctrl+K (enlace). Aprende los atajos del editor que uses para multiplicar tu velocidad.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📐</span>
            <strong>Líneas en blanco</strong>
            <p>Una línea en blanco separa párrafos. Dos espacios al final de una línea crean un salto de línea sin nuevo párrafo. Esta es la fuente del 80% de los problemas de formato.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔗</span>
            <strong>Referencias de enlace</strong>
            <p>Para texto con muchos enlaces, usa la sintaxis de referencia: <code>[texto][1]</code> y al final del documento <code>[1]: https://url</code>. Más limpio y mantenible.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>💻</span>
            <strong>Bloques de código</strong>
            <p>Especifica el lenguaje después de las triple comillas: <code>```javascript</code>. Esto activa el resaltado de sintaxis en la mayoría de renderizadores.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔄</span>
            <strong>Flujo de trabajo</strong>
            <p>Escribe en Markdown → previsualiza en tiempo real → exporta a HTML cuando necesites. Mantén siempre el Markdown como fuente de verdad, no el HTML.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🛡️</span>
            <strong>Seguridad primero</strong>
            <p>Nunca insertes HTML de Markdown no confiable directamente con innerHTML. Usa siempre DOMPurify o una librería equivalente en producción.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Errores frecuentes al trabajar con Markdown y HTML</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Insertar HTML de usuario sin sanitizar</strong> — El HTML generado desde Markdown de terceros puede contener scripts XSS. Usa siempre DOMPurify antes de inyectar en el DOM.</li>
            <li><strong>Mezclar espacios y tabuladores en indentación</strong> — Markdown es muy sensible al tipo de espacio en blanco usado para indentación. Usa solo espacios o solo tabuladores, nunca ambos.</li>
            <li><strong>Olvidar la línea en blanco antes de listas</strong> — Si una lista sigue inmediatamente a un párrafo sin línea en blanco, algunos procesadores no la reconocen como lista HTML, sino como texto plano.</li>
            <li><strong>Asumir compatibilidad universal de GFM</strong> — Las tablas y casillas de verificación son extensiones GFM, no Markdown estándar. No todos los procesadores las soportan sin configuración adicional.</li>
            <li><strong>Usar Markdown para diseño complejo</strong> — Markdown es para contenido semántico, no para diseño. Para layouts complejos, columnas o componentes interactivos, usa HTML/CSS directamente.</li>
            <li><strong>Guardar solo el HTML, no el Markdown fuente</strong> — El HTML es difícil de editar. Guarda siempre el Markdown original como fuente y regenera el HTML cuando necesites actualizarlo.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-markdown-html')} />

      <ShareCard appName="conversor-markdown-html" />
      <Footer appName="conversor-markdown-html" />
    </div>
  );
}
