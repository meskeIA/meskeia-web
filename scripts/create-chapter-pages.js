/**
 * Script para crear las páginas de capítulos del curso de Pensamiento Científico
 * Lee el contenido generado y crea los archivos TSX
 */

const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, 'curso-pensamiento-content.json');
const basePath = path.join(__dirname, '..', 'app', 'curso-pensamiento-cientifico');

// Leer contenido generado
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Template para página de capítulo
function createChapterPage(moduleId, chapterId, chapterData) {
  const { title, content: chapterContent } = chapterData;

  // Escapar comillas y caracteres especiales para JSX
  const escapeForJSX = (str) => {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')
      .replace(/\n/g, '\\n');
  };

  const sectionsJSX = chapterContent.sections.map((section, idx) => `
        {/* Sección: ${section.title} */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>${idx === 0 ? '📌' : idx === 1 ? '🔍' : '💡'}</span>
            <h2 className={styles.sectionTitleText}>${escapeForJSX(section.title)}</h2>
          </div>
          ${section.content.split('\n\n').map(p => `<p>${escapeForJSX(p)}</p>`).join('\n          ')}
          ${section.example ? `
          <div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> ${escapeForJSX(section.example)}</p>
          </div>` : ''}
        </section>`).join('\n');

  const keyIdeasJSX = chapterContent.keyIdeas.map(idea =>
    `            <li>${escapeForJSX(idea)}</li>`
  ).join('\n');

  const questionsJSX = chapterContent.reflectionQuestions.map(q =>
    `            <li>${escapeForJSX(q)}</li>`
  ).join('\n');

  return `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoCientifico.module.css';

export default function ${toPascalCase(chapterId)}Page() {
  return (
    <ChapterPage chapterId="${chapterId}">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>${escapeForJSX(chapterContent.introduction)}</p>
      </section>
${sectionsJSX}

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul>
${keyIdeasJSX}
        </ul>
      </section>

      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas de Reflexión</h2>
        </div>
        <ol>
${questionsJSX}
        </ol>
      </section>

      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> ${escapeForJSX(chapterContent.curiosity)}</p>
      </div>
    </ChapterPage>
  );
}
`;
}

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Crear páginas
let createdCount = 0;

for (const [moduleId, moduleData] of Object.entries(content)) {
  const modulePath = path.join(basePath, moduleId);

  // Crear carpeta del módulo si no existe
  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true });
  }

  for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
    const chapterPath = path.join(modulePath, chapterId);

    // Crear carpeta del capítulo
    if (!fs.existsSync(chapterPath)) {
      fs.mkdirSync(chapterPath, { recursive: true });
    }

    // Crear página
    const pageContent = createChapterPage(moduleId, chapterId, chapterData);
    const pagePath = path.join(chapterPath, 'page.tsx');

    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log(`✅ Creado: ${moduleId}/${chapterId}/page.tsx`);
    createdCount++;
  }
}

console.log(`\n🎉 Total: ${createdCount} páginas de capítulos creadas`);
