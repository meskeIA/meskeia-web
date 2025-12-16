'use client';

import { useState, useCallback } from 'react';
import styles from './ConversorMarkdown.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
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

      <RelatedApps apps={getRelatedApps('conversor-markdown-html')} />

      <Footer appName="conversor-markdown-html" />
    </div>
  );
}
