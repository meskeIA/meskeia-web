/**
 * Script para crear las páginas de capítulos del Curso de Estrategia Empresarial
 * Genera archivos page.tsx para cada capítulo basándose en el contenido JSON
 */

const fs = require("fs");
const path = require("path");

// Leer el archivo de contenido generado
const contentPath = path.join(__dirname, "curso-estrategia-empresarial-content.json");
const content = JSON.parse(fs.readFileSync(contentPath, "utf8"));

// Directorio base del curso
const courseDir = path.join(__dirname, "..", "app", "curso-estrategia-empresarial");

// Contador de páginas creadas
let pagesCreated = 0;
let pagesSkipped = 0;

// Función para escapar caracteres especiales en strings JSX
function escapeJSX(str) {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/'/g, "'")
    .replace(/"/g, '\\"')
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/{/g, "&#123;")
    .replace(/}/g, "&#125;");
}

// Template para cada página de capítulo
function generateChapterPage(moduleId, chapterId, chapterData, moduleTitle) {
  const { title, content: chapterContent } = chapterData;

  if (!chapterContent || !chapterContent.introduction) {
    console.log(`  ⚠️ Capítulo ${chapterId} sin contenido completo, saltando...`);
    return null;
  }

  const {
    introduction,
    sections,
    keyIdeas,
    actionItems,
    reflectionQuestions,
    curiosity,
  } = chapterContent;

  return `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoEstrategiaEmpresarial.module.css';

export default function ${toPascalCase(chapterId)}Page() {
  return (
    <ChapterPage chapterId="${chapterId}">
      <div className={styles.chapterContent}>
        {/* Introducción */}
        <section className={styles.introSection}>
          <p className={styles.introText}>
            ${escapeJSX(introduction)}
          </p>
        </section>

        {/* Secciones de contenido */}
${sections
  .map(
    (section, idx) => `
        <section className={styles.contentSection}>
          <h2 className={styles.sectionTitle}>${escapeJSX(section.title)}</h2>
          <div className={styles.sectionContent}>
            <p>${escapeJSX(section.content)}</p>
          </div>
          ${
            section.example
              ? `
          <div className={styles.exampleBox}>
            <h4>📌 Ejemplo Práctico</h4>
            <p>${escapeJSX(section.example)}</p>
          </div>`
              : ""
          }
        </section>
`
  )
  .join("")}

        {/* Ideas Clave */}
        <section className={styles.keyIdeasSection}>
          <h2 className={styles.sectionTitle}>💡 Ideas Clave</h2>
          <ul className={styles.keyIdeasList}>
${keyIdeas.map((idea) => `            <li>${escapeJSX(idea)}</li>`).join("\n")}
          </ul>
        </section>

        {/* Acciones Prácticas */}
        <section className={styles.actionSection}>
          <h2 className={styles.sectionTitle}>🎯 Acciones para Implementar</h2>
          <div className={styles.actionGrid}>
${actionItems
  .map(
    (action, idx) => `            <div className={styles.actionCard}>
              <span className={styles.actionNumber}>${idx + 1}</span>
              <p>${escapeJSX(action)}</p>
            </div>`
  )
  .join("\n")}
          </div>
        </section>

        {/* Preguntas de Reflexión */}
        <section className={styles.reflectionSection}>
          <h2 className={styles.sectionTitle}>🤔 Para Reflexionar</h2>
          <div className={styles.reflectionCards}>
${reflectionQuestions
  .map(
    (question) => `            <div className={styles.reflectionCard}>
              <p>${escapeJSX(question)}</p>
            </div>`
  )
  .join("\n")}
          </div>
        </section>

        {/* Curiosidad */}
        ${
          curiosity
            ? `
        <section className={styles.curiositySection}>
          <div className={styles.curiosityBox}>
            <h3>🔍 ¿Sabías que...?</h3>
            <p>${escapeJSX(curiosity)}</p>
          </div>
        </section>`
            : ""
        }
      </div>
    </ChapterPage>
  );
}
`;
}

// Convertir slug a PascalCase
function toPascalCase(str) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Crear las páginas
console.log("♟️ Creando páginas del Curso de Estrategia Empresarial...\n");

for (const [moduleId, moduleData] of Object.entries(content.modules)) {
  console.log(`📁 Módulo: ${moduleData.title}`);

  // Crear directorio del módulo si no existe
  const moduleDir = path.join(courseDir, moduleId);
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
  }

  for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
    const chapterDir = path.join(moduleDir, chapterId);

    // Crear directorio del capítulo
    if (!fs.existsSync(chapterDir)) {
      fs.mkdirSync(chapterDir, { recursive: true });
    }

    // Generar el contenido de la página
    const pageContent = generateChapterPage(
      moduleId,
      chapterId,
      chapterData,
      moduleData.title
    );

    if (pageContent) {
      const pagePath = path.join(chapterDir, "page.tsx");
      fs.writeFileSync(pagePath, pageContent);
      console.log(`  ✅ Creado: ${moduleId}/${chapterId}/page.tsx`);
      pagesCreated++;
    } else {
      pagesSkipped++;
    }
  }
  console.log("");
}

console.log("═══════════════════════════════════════════════════════════════");
console.log(`✅ Páginas creadas: ${pagesCreated}`);
console.log(`⚠️ Páginas saltadas (sin contenido): ${pagesSkipped}`);
console.log("═══════════════════════════════════════════════════════════════\n");

if (pagesSkipped > 0) {
  console.log(
    "💡 Ejecuta este script de nuevo cuando se complete la generación de contenido.\n"
  );
}
