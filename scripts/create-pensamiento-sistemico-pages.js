#!/usr/bin/env node

/**
 * Script para crear las páginas de capítulos del curso Pensamiento Sistémico
 * Lee el archivo JSON generado y crea los page.tsx correspondientes
 */

const fs = require('fs');
const path = require('path');

// Leer el contenido generado
const contentPath = path.join(__dirname, 'curso-pensamiento-sistemico-content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

const courseDir = path.join(__dirname, '..', 'app', 'curso-pensamiento-sistemico');

// Función para escapar comillas y caracteres especiales en JSX
function escapeForJSX(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '</p>\n        <p>');
}

// Función para formatear el nombre de función
function formatFunctionName(id) {
  return id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Page';
}

// Generar página de capítulo
function generateChapterPage(moduleId, chapterId, chapterData) {
  const functionName = formatFunctionName(chapterId);
  const { content: chapterContent } = chapterData;

  if (!chapterContent) {
    console.log(`  ⚠️ Sin contenido para ${chapterId}`);
    return null;
  }

  const sections = chapterContent.sections || [];
  const keyIdeas = chapterContent.keyIdeas || [];
  const actionItems = chapterContent.actionItems || [];
  const reflectionQuestions = chapterContent.reflectionQuestions || [];
  const curiosity = chapterContent.curiosity || '';

  let pageContent = `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoPensamientoSistemico.module.css';

export default function ${functionName}() {
  return (
    <ChapterPage chapterId="${chapterId}">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>
          ${escapeForJSX(chapterContent.introduction || '')}
        </p>
      </section>
`;

  // Agregar secciones
  sections.forEach((section, idx) => {
    const icons = ['🔄', '📊', '🧠', '🌐', '⚡', '🔗'];
    const icon = icons[idx % icons.length];

    pageContent += `
      {/* ${section.title} */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>${icon}</span>
          <h2 className={styles.sectionTitleText}>${escapeForJSX(section.title)}</h2>
        </div>
        <p>
          ${escapeForJSX(section.content || '')}
        </p>
`;

    if (section.example) {
      pageContent += `
        <div className={styles.exampleBox}>
          <p>
            <strong>Ejemplo práctico:</strong> ${escapeForJSX(section.example)}
          </p>
        </div>
`;
    }

    pageContent += `      </section>
`;
  });

  // Ideas clave
  if (keyIdeas.length > 0) {
    pageContent += `
      {/* Ideas Clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Ideas Clave</h4>
        <ul>
${keyIdeas.map(idea => `          <li>${escapeForJSX(idea)}</li>`).join('\n')}
        </ul>
      </div>
`;
  }

  // Acciones prácticas
  if (actionItems.length > 0) {
    pageContent += `
      {/* Acciones Prácticas */}
      <div className={styles.practicalTip}>
        <h4>🎯 Acciones para Implementar</h4>
        <ul>
${actionItems.map(item => `          <li>${escapeForJSX(item)}</li>`).join('\n')}
        </ul>
      </div>
`;
  }

  // Preguntas de reflexión
  if (reflectionQuestions.length > 0) {
    pageContent += `
      {/* Preguntas de Reflexión */}
      <div className={styles.reflectionQuestions}>
        <h4>🤔 Preguntas de Reflexión</h4>
        <ol>
${reflectionQuestions.map(q => `          <li>${escapeForJSX(q)}</li>`).join('\n')}
        </ol>
      </div>
`;
  }

  // Curiosidad
  if (curiosity) {
    pageContent += `
      {/* Curiosidad */}
      <div className={styles.curiosityBox}>
        <h4>💡 ¿Sabías que...?</h4>
        <p>
          ${escapeForJSX(curiosity)}
        </p>
      </div>
`;
  }

  pageContent += `    </ChapterPage>
  );
}
`;

  return pageContent;
}

// Crear las páginas
console.log('🚀 Creando páginas de capítulos...\n');

let totalCreated = 0;

for (const [moduleId, moduleData] of Object.entries(content.modules)) {
  console.log(`📚 Módulo: ${moduleData.title}`);

  for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
    const chapterDir = path.join(courseDir, moduleId, chapterId);
    const pagePath = path.join(chapterDir, 'page.tsx');

    // Asegurar que el directorio existe
    if (!fs.existsSync(chapterDir)) {
      fs.mkdirSync(chapterDir, { recursive: true });
    }

    const pageContent = generateChapterPage(moduleId, chapterId, chapterData);

    if (pageContent) {
      fs.writeFileSync(pagePath, pageContent, 'utf-8');
      console.log(`  ✅ ${chapterId}`);
      totalCreated++;
    }
  }
}

console.log(`\n═══════════════════════════════════════════════════════════════`);
console.log(`  📊 Total: ${totalCreated} páginas creadas`);
console.log(`═══════════════════════════════════════════════════════════════\n`);
