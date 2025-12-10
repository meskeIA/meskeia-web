/**
 * Script para crear las páginas del curso "Herencias Paso a Paso"
 * Lee el contenido generado y crea los archivos TSX
 *
 * Ejecutar: node scripts/create-herencias-pages.js
 */

const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, 'curso-herencias-content.json');
const basePath = path.join(__dirname, '..', 'app', 'herencias-paso-a-paso');

// Leer contenido generado
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Escapar caracteres especiales para JSX
function escapeForJSX(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

// Convertir a PascalCase para nombres de componentes
function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Template para página de capítulo normal
function createChapterPage(moduleId, chapterId, chapterData) {
  const { title, content: chapterContent, linkedTools = [] } = chapterData;

  // Generar secciones
  const sectionsJSX = chapterContent.sections.map((section, idx) => {
    let sectionHTML = `
      {/* Sección: ${section.title} */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>${idx === 0 ? '📌' : idx === 1 ? '🔍' : '💡'}</span>
          <h2 className={styles.sectionTitleText}>${escapeForJSX(section.title)}</h2>
        </div>
        ${section.content.split('\n\n').map(p => `<p>${escapeForJSX(p)}</p>`).join('\n        ')}`;

    // Añadir tip si existe
    if (section.tip) {
      sectionHTML += `
        <div className={styles.tipBox}>
          <p><strong>💡 Consejo:</strong> ${escapeForJSX(section.tip)}</p>
        </div>`;
    }

    // Añadir warning si existe
    if (section.warning) {
      sectionHTML += `
        <div className={styles.warningBox}>
          <p><strong>⚠️ Importante:</strong> ${escapeForJSX(section.warning)}</p>
        </div>`;
    }

    sectionHTML += `
      </section>`;

    return sectionHTML;
  }).join('\n');

  // Generar ideas clave
  const keyIdeasJSX = chapterContent.keyIdeas.map(idea =>
    `          <li>${escapeForJSX(idea)}</li>`
  ).join('\n');

  // Generar preguntas de reflexión (si existen)
  const hasQuestions = chapterContent.reflectionQuestions && chapterContent.reflectionQuestions.length > 0;
  const questionsJSX = hasQuestions ? chapterContent.reflectionQuestions.map(q =>
    `          <li>${escapeForJSX(q)}</li>`
  ).join('\n') : '';

  // Generar herramientas vinculadas
  const hasTools = linkedTools && linkedTools.length > 0;
  const toolsJSX = hasTools ? linkedTools.map(tool => `
          <a href="${tool.url}" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>${tool.icon}</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>${tool.name}</span>
              <span className={styles.toolDesc}>${tool.desc}</span>
            </div>
          </a>`
  ).join('\n') : '';

  return `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

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
        <ul className={styles.keyIdeasList}>
${keyIdeasJSX}
        </ul>
      </section>
${hasQuestions ? `
      {/* Preguntas de Reflexión */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🤔</span>
          <h2 className={styles.sectionTitleText}>Preguntas para Reflexionar</h2>
        </div>
        <ol className={styles.reflectionList}>
${questionsJSX}
        </ol>
      </section>
` : ''}
      {/* Dato Curioso */}
      <div className={styles.infoBox}>
        <p><strong>💡 Dato Curioso:</strong> ${escapeForJSX(chapterContent.curiosity)}</p>
      </div>
${hasTools ? `
      {/* Herramientas Vinculadas */}
      <div className={styles.toolLinkBox}>
        <h4>🛠️ Herramientas de meskeIA para este tema</h4>
        <div className={styles.toolLinks}>
${toolsJSX}
        </div>
      </div>
` : ''}
    </ChapterPage>
  );
}
`;
}

// Template especial para el glosario
function createGlossaryPage(chapterId, chapterData) {
  const { content: chapterContent, linkedTools = [] } = chapterData;

  // Glosario de términos
  const termsSection = chapterContent.sections.find(s => s.terms);
  const termsJSX = termsSection ? termsSection.terms.map(t => `
          <div className={styles.glossaryItem}>
            <dt className={styles.glossaryTerm}>${escapeForJSX(t.termino)}</dt>
            <dd className={styles.glossaryDef}>${escapeForJSX(t.definicion)}</dd>
          </div>`
  ).join('\n') : '';

  // FAQ
  const faqSection = chapterContent.sections.find(s => s.faqs);
  const faqJSX = faqSection ? faqSection.faqs.map(faq => `
          <details className={styles.faqItem}>
            <summary>${escapeForJSX(faq.pregunta)}</summary>
            <p>${escapeForJSX(faq.respuesta)}</p>
          </details>`
  ).join('\n') : '';

  // Herramientas
  const toolsJSX = linkedTools.map(tool => `
          <a href="${tool.url}" className={styles.toolLinkButton}>
            <span className={styles.toolIcon}>${tool.icon}</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>${tool.name}</span>
              <span className={styles.toolDesc}>${tool.desc}</span>
            </div>
          </a>`
  ).join('\n');

  return `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../HerenciasPasoPaso.module.css';

export default function GlosarioHerenciasPage() {
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

      {/* Glosario de Términos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📚</span>
          <h2 className={styles.sectionTitleText}>Glosario de Términos</h2>
        </div>
        <p>Consulta este glosario siempre que encuentres un término que no comprendas. Están ordenados alfabéticamente para facilitar su búsqueda.</p>
        <dl className={styles.glossaryList}>
${termsJSX}
        </dl>
      </section>

      {/* Preguntas Frecuentes */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>❓</span>
          <h2 className={styles.sectionTitleText}>Preguntas Frecuentes</h2>
        </div>
        <p>Recopilamos las dudas más habituales de las personas que se enfrentan a tramitar una herencia.</p>
        <div className={styles.faqGrid}>
${faqJSX}
        </div>
      </section>

      {/* Herramientas de meskeIA */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🛠️</span>
          <h2 className={styles.sectionTitleText}>Herramientas de meskeIA</h2>
        </div>
        <p>Hemos creado varias herramientas gratuitas para facilitar la tramitación de tu herencia.</p>
        <div className={styles.toolLinkBox}>
          <div className={styles.toolLinks}>
${toolsJSX}
          </div>
        </div>
      </section>

      {/* Ideas Clave */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Ideas Clave</h2>
        </div>
        <ul className={styles.keyIdeasList}>
${chapterContent.keyIdeas.map(idea => `          <li>${escapeForJSX(idea)}</li>`).join('\n')}
        </ul>
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

// Crear páginas
console.log('🚀 Creando páginas del curso "Herencias Paso a Paso"...\n');

let createdCount = 0;

for (const [moduleId, moduleData] of Object.entries(content)) {
  const modulePath = path.join(basePath, moduleId);

  // Crear carpeta del módulo si no existe
  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true });
    console.log(`📁 Creada carpeta: ${moduleId}/`);
  }

  for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
    const chapterPath = path.join(modulePath, chapterId);

    // Crear carpeta del capítulo
    if (!fs.existsSync(chapterPath)) {
      fs.mkdirSync(chapterPath, { recursive: true });
    }

    // Determinar qué tipo de página crear
    let pageContent;
    if (chapterId === 'glosario-herencias') {
      pageContent = createGlossaryPage(chapterId, chapterData);
    } else {
      pageContent = createChapterPage(moduleId, chapterId, chapterData);
    }

    const pagePath = path.join(chapterPath, 'page.tsx');
    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log(`  ✅ Creado: ${moduleId}/${chapterId}/page.tsx`);
    createdCount++;
  }
}

console.log(`\n🎉 Total: ${createdCount} páginas de capítulos creadas`);
console.log('\n📋 Siguiente paso: Verifica que los archivos base del curso estén creados:');
console.log('   - CourseContext.tsx');
console.log('   - ChapterPage.tsx');
console.log('   - layout.tsx');
console.log('   - metadata.ts');
console.log('   - page.tsx');
console.log('   - HerenciasPasoPaso.module.css');
