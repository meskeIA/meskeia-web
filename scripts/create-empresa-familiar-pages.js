/**
 * Script para crear páginas de capítulos automáticamente
 * a partir del JSON generado por generate-curso-empresa-familiar.js
 *
 * Ejecutar: node scripts/create-empresa-familiar-pages.js
 */

const fs = require('fs');
const path = require('path');

// Leer contenido generado
const contentPath = path.join(__dirname, 'curso-empresa-familiar-content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Directorio base del curso
const courseDir = path.join(__dirname, '..', 'app', 'curso-empresa-familiar');

/**
 * Escapa caracteres especiales para JSX
 */
function escapeJSX(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\n/g, '\\n');
}

/**
 * Limpia el texto para usar en JSX
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Genera el código de una página de capítulo
 */
function generateChapterPage(moduleId, chapterId, chapterData) {
  const { title, content: chapterContent } = chapterData;

  if (!chapterContent) {
    console.log(`  ⚠️ Sin contenido para ${chapterId}`);
    return null;
  }

  const { introduction, sections, keyIdeas, reflectionQuestions, practicalTip, curiosity } = chapterContent;

  // Generar secciones de contenido
  const sectionsJSX = sections.map((section, idx) => `
        {/* Sección: ${cleanText(section.title)} */}
        <section className={styles.contentSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>${idx === 0 ? '📌' : idx === 1 ? '📊' : idx === 2 ? '🔍' : '💡'}</span>
            <h2 className={styles.sectionTitleText}>${cleanText(section.title)}</h2>
          </div>
          ${section.content.split('\n\n').map(p => `<p>${cleanText(p)}</p>`).join('\n          ')}

          ${section.example ? `<div className={styles.highlightBox}>
            <p><strong>📌 Ejemplo:</strong> ${cleanText(section.example)}</p>
          </div>` : ''}
        </section>`
  ).join('\n');

  // Generar ideas clave
  const keyIdeasJSX = keyIdeas && keyIdeas.length > 0
    ? keyIdeas.map(idea => `            <li>${cleanText(idea)}</li>`).join('\n')
    : '';

  // Generar preguntas de reflexión
  const reflectionJSX = reflectionQuestions && reflectionQuestions.length > 0
    ? reflectionQuestions.map(q => `            <li>${cleanText(q)}</li>`).join('\n')
    : '';

  const pageCode = `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEmpresaFamiliar.module.css';

export default function ${toPascalCase(chapterId)}Page() {
  return (
    <ChapterPage chapterId="${chapterId}">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📖</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>${cleanText(introduction)}</p>
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
${reflectionJSX}
        </ol>
      </section>

      {/* Consejo Práctico */}
      ${practicalTip ? `<div className={styles.warningBox}>
        <p><strong>💼 Consejo Práctico:</strong> ${cleanText(practicalTip)}</p>
      </div>` : ''}

      {/* Dato Curioso */}
      ${curiosity ? `<div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> ${cleanText(curiosity)}</p>
      </div>` : ''}
    </ChapterPage>
  );
}
`;

  return pageCode;
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
 * Crea todas las páginas de capítulos
 */
function createAllPages() {
  console.log('\n🏢 GENERADOR DE PÁGINAS - CURSO EMPRESA FAMILIAR');
  console.log('═'.repeat(50));

  let created = 0;
  let errors = 0;

  for (const [moduleId, moduleData] of Object.entries(content)) {
    console.log(`\n📁 Módulo: ${moduleData.title}`);

    for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
      const chapterDir = path.join(courseDir, moduleId, chapterId);
      const pageFile = path.join(chapterDir, 'page.tsx');

      // Crear directorio si no existe
      if (!fs.existsSync(chapterDir)) {
        fs.mkdirSync(chapterDir, { recursive: true });
      }

      // Generar contenido de la página
      const pageContent = generateChapterPage(moduleId, chapterId, chapterData);

      if (pageContent) {
        fs.writeFileSync(pageFile, pageContent, 'utf8');
        console.log(`  ✅ ${chapterData.title}`);
        created++;
      } else {
        console.log(`  ❌ ${chapterData.title} (sin contenido)`);
        errors++;
      }
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 RESUMEN`);
  console.log(`   ✅ Páginas creadas: ${created}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('═'.repeat(50));
}

// Ejecutar
createAllPages();
