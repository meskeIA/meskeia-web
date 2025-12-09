/**
 * Script para crear las páginas de capítulos del Curso de Redacción Académica
 * desde el contenido JSON generado
 */

const fs = require('fs');
const path = require('path');

// Leer el contenido generado
const contentPath = path.join(__dirname, 'curso-redaccion-academica-content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Ruta base del curso
const courseBasePath = path.join(__dirname, '..', 'app', 'curso-redaccion-academica');

// Función para escapar comillas y caracteres especiales en JSX
function escapeJSX(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

// Función para generar el contenido de una sección
function generateSectionContent(section) {
  const contentParagraphs = section.content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => {
      // Detectar si es una lista
      if (p.trim().startsWith('- ') || p.trim().startsWith('* ') || /^\d+\.\s/.test(p.trim())) {
        const items = p.split('\n').filter(item => item.trim());
        const isOrdered = /^\d+\.\s/.test(items[0].trim());
        const listItems = items.map(item => {
          const cleanItem = item.replace(/^[-*\d.]+\s*/, '').trim();
          // Procesar negritas y cursivas
          const processed = cleanItem
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
          return `            <li>${processed}</li>`;
        }).join('\n');
        return isOrdered
          ? `          <ol>\n${listItems}\n          </ol>`
          : `          <ul>\n${listItems}\n          </ul>`;
      }
      // Procesar negritas y cursivas en párrafos
      const processed = p
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return `          <p>${processed}</p>`;
    })
    .join('\n');

  return contentParagraphs;
}

// Función para generar página de capítulo regular
function generateChapterPage(moduleId, chapterId, chapterData) {
  const { content: chapterContent } = chapterData;

  if (!chapterContent || !chapterContent.sections) {
    console.log(`    ⚠️ Capítulo ${chapterId} sin contenido válido`);
    return null;
  }

  let sectionsJSX = chapterContent.sections.map((section, idx) => {
    const sectionContent = generateSectionContent(section);
    const exampleContent = section.example ? section.example
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') : '';

    return `
      {/* Sección: ${section.title} */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>${idx === 0 ? '📖' : '✍️'}</span>
          <h2 className={styles.sectionTitleText}>${section.title}</h2>
        </div>
${sectionContent}
        ${section.example ? `
        <div className={styles.exampleBox}>
          <p><strong>Ejemplo:</strong></p>
          <p>${exampleContent}</p>
        </div>` : ''}
      </section>`;
  }).join('\n');

  // Key takeaways
  const keyTakeaways = chapterContent.keyTakeaways || [];
  const keyTakeawaysJSX = keyTakeaways.length > 0 ? `
      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          ${keyTakeaways.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>` : '';

  // Common mistakes
  const commonMistakes = chapterContent.commonMistakes || [];
  const commonMistakesJSX = commonMistakes.length > 0 ? `
      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          ${commonMistakes.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>` : '';

  // Professor tip
  const professorTip = chapterContent.professorTip || '';
  const professorTipJSX = professorTip ? `
      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>${professorTip}</p>
      </div>` : '';

  // Apply to your work
  const applyToYourWork = chapterContent.applyToYourWork || '';
  const applyJSX = applyToYourWork ? `
      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>${applyToYourWork}</p>
      </div>` : '';

  const pageContent = `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function ${capitalizeFirst(chapterId.replace(/-/g, ''))}Page() {
  return (
    <ChapterPage chapterId="${chapterId}">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎯</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>${chapterContent.introduction || ''}</p>
      </section>
${sectionsJSX}
${keyTakeawaysJSX}
${commonMistakesJSX}
${professorTipJSX}
${applyJSX}
    </ChapterPage>
  );
}
`;

  return pageContent;
}

// Función para generar página de glosario
function generateGlossaryPage(chapterData) {
  const { content: glossaryContent } = chapterData;

  if (!glossaryContent || !glossaryContent.categories) {
    console.log(`    ⚠️ Glosario sin contenido válido`);
    return null;
  }

  const categoriesJSX = glossaryContent.categories.map(category => {
    const termsJSX = category.terms.map(term => `
                  <div className={styles.glossaryCard}>
                    <div className={styles.glossaryTermHeader}>
                      <h4 className={styles.glossaryTerm}>${term.term}</h4>
                      <span className={styles.glossaryCategory}>${category.name}</span>
                    </div>
                    <p className={styles.glossaryDefinition}>${term.definition}</p>
                    ${term.example ? `<p className={styles.glossaryExample}><em>Ejemplo: ${term.example}</em></p>` : ''}
                  </div>`).join('\n');

    return `
              {/* ${category.name} */}
              <div className={styles.glossarySection}>
                <h3 className={styles.glossaryLetter}>${category.name}</h3>
                <div className={styles.glossaryTerms}>
${termsJSX}
                </div>
              </div>`;
  }).join('\n');

  const pageContent = `'use client';

import { useState } from 'react';
import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function GlosarioPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <ChapterPage chapterId="terminos-clave">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📘</span>
          <h2 className={styles.sectionTitleText}>Glosario de Términos Académicos</h2>
        </div>
        <p>${glossaryContent.introduction || 'Este glosario recopila los términos más importantes que encontrarás en tu trabajo académico.'}</p>
      </section>

      {/* Filtros */}
      <div className={styles.glossaryFilters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar término..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Contenido del glosario */}
      <div className={styles.glossaryContent}>
${categoriesJSX}
      </div>

      {glossaryContent.tip ? (
        <div className={styles.practicalTip}>
          <h4>💡 Consejo</h4>
          <p>${glossaryContent.tip}</p>
        </div>
      ) : null}
    </ChapterPage>
  );
}
`;

  return pageContent;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generar todas las páginas
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Creando páginas del Curso de Redacción Académica');
console.log('═══════════════════════════════════════════════════════════════\n');

let createdCount = 0;
let errorCount = 0;

for (const [moduleId, moduleData] of Object.entries(content)) {
  console.log(`📚 Módulo: ${moduleData.title}`);

  for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
    const chapterPath = path.join(courseBasePath, moduleId, chapterId);

    // Crear directorio si no existe
    if (!fs.existsSync(chapterPath)) {
      fs.mkdirSync(chapterPath, { recursive: true });
    }

    let pageContent;
    if (chapterId === 'terminos-clave') {
      pageContent = generateGlossaryPage(chapterData);
    } else {
      pageContent = generateChapterPage(moduleId, chapterId, chapterData);
    }

    if (pageContent) {
      const pagePath = path.join(chapterPath, 'page.tsx');
      fs.writeFileSync(pagePath, pageContent, 'utf8');
      console.log(`  ✅ Creado: ${moduleId}/${chapterId}/page.tsx`);
      createdCount++;
    } else {
      console.log(`  ⚠️ Error: ${chapterId}`);
      errorCount++;
    }
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  📊 Resumen: ${createdCount} páginas creadas, ${errorCount} errores`);
console.log('═══════════════════════════════════════════════════════════════\n');
