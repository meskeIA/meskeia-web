/**
 * Script para generar las páginas de capítulos del Curso de Negociación
 * a partir del contenido JSON generado por la API de Anthropic
 *
 * Ejecutar: node scripts/generate-curso-negociacion-pages.js
 */

const fs = require('fs');
const path = require('path');

// Cargar el contenido generado
const contentPath = path.join(__dirname, 'curso-negociacion-content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const basePath = path.join(__dirname, '..', 'app', 'curso-negociacion');

/**
 * Genera el contenido de una página de capítulo
 */
function generateChapterPage(moduleId, chapterId, chapterData) {
  const { content: chapterContent } = chapterData;

  // Escapar comillas y caracteres especiales para JSX
  const escape = (str) => str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const sectionsJsx = chapterContent.sections.map((section, idx) => `
        {/* Sección ${idx + 1}: ${section.title} */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>${getSectionIcon(idx)}</span>
            <h2 className={styles.sectionTitleText}>${escape(section.title)}</h2>
          </div>

          ${section.content.split('\n\n').map(p => `<p>${escape(p)}</p>`).join('\n          ')}

          <div className={styles.exampleBox}>
            <strong>Ejemplo práctico:</strong>
            <p>${escape(section.example)}</p>
          </div>
        </section>`).join('\n');

  const keyIdeasJsx = chapterContent.keyIdeas.map(idea =>
    `            <li>${escape(idea)}</li>`
  ).join('\n');

  const questionsJsx = chapterContent.reflectionQuestions.map(q =>
    `            <li>${escape(q)}</li>`
  ).join('\n');

  return `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoNegociacion.module.css';

export default function ${toPascalCase(chapterId)}Page() {
  return (
    <ChapterPage chapterId="${chapterId}">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>${escape(chapterContent.introduction)}</p>
      </section>
${sectionsJsx}

      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
${keyIdeasJsx}
        </ul>
      </div>

      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas para Reflexionar</h4>
        <ol>
${questionsJsx}
        </ol>
      </div>

      {/* Consejo Práctico */}
      <div className={styles.practicalTip}>
        <h4>🎯 Consejo Práctico</h4>
        <p>${escape(chapterContent.practicalTip)}</p>
      </div>

      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>🔍 Dato Curioso</h4>
        <p>${escape(chapterContent.curiosity)}</p>
      </div>
    </ChapterPage>
  );
}
`;
}

/**
 * Iconos para las secciones
 */
function getSectionIcon(idx) {
  const icons = ['📋', '🎯', '💡', '⚡', '🔑', '📊'];
  return icons[idx % icons.length];
}

/**
 * Convierte kebab-case a PascalCase
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Genera todas las páginas
 */
function generateAllPages() {
  let successCount = 0;
  let errorCount = 0;

  console.log('📝 Generando páginas de capítulos del Curso de Negociación...\n');

  for (const [moduleId, moduleData] of Object.entries(content)) {
    console.log(`\n📁 Módulo: ${moduleData.title}`);

    for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
      try {
        const pageContent = generateChapterPage(moduleId, chapterId, chapterData);
        const pagePath = path.join(basePath, moduleId, chapterId, 'page.tsx');

        // Crear directorio si no existe
        fs.mkdirSync(path.dirname(pagePath), { recursive: true });

        // Escribir archivo
        fs.writeFileSync(pagePath, pageContent, 'utf8');

        console.log(`   ✅ ${chapterData.title}`);
        successCount++;
      } catch (error) {
        console.error(`   ❌ Error en ${chapterId}: ${error.message}`);
        errorCount++;
      }
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 RESUMEN`);
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log('═'.repeat(50));
}

// Ejecutar
generateAllPages();
