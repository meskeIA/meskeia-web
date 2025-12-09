/**
 * Script para crear las páginas de capítulos de la Guía de Cuidado de Mascotas
 */

const fs = require('fs');
const path = require('path');

const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'guia-cuidado-mascota-content.json'), 'utf8'));

// Mapeo de módulos a sus capítulos
const moduleChapters = {
  'preparacion': { chapter: 'antes-de-adoptar', moduleTitle: 'Preparación' },
  'alimentacion': { chapter: 'nutricion-basica', moduleTitle: 'Alimentación' },
  'salud': { chapter: 'prevencion-parasitos', moduleTitle: 'Salud' },
  'crecimiento': { chapter: 'desarrollo-cachorro', moduleTitle: 'Crecimiento' },
  'etapas': { chapter: 'edad-y-cuidados', moduleTitle: 'Etapas de Vida' },
  'convivencia': { chapter: 'primeros-meses', moduleTitle: 'Convivencia' },
  'emergencias': { chapter: 'cuando-ir-veterinario', moduleTitle: 'Emergencias' },
  'recursos': { chapter: 'herramientas', moduleTitle: 'Recursos' }
};

// Función para escapar comillas en strings
function escapeQuotes(str) {
  return str.replace(/"/g, '\\"').replace(/`/g, '\\`');
}

// Función para generar nombre de componente
function toComponentName(chapterId) {
  return chapterId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

// Función para generar contenido de página regular
function generateRegularPageContent(moduleId, chapterId, chapterContent) {
  const c = chapterContent.content;
  const componentName = toComponentName(chapterId);

  const sectionIcons = ['📌', '📋', '💡', '🎯'];

  let sectionsJSX = c.sections.map((section, i) => {
    return `      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>${sectionIcons[i % 4]}</span>
          <h2 className={styles.sectionTitleText}>${escapeQuotes(section.title)}</h2>
        </div>
        <p>${escapeQuotes(section.content)}</p>
        <div className={styles.tipBox}>
          <p>💡 ${escapeQuotes(section.tip)}</p>
        </div>
      </section>`;
  }).join('\n\n');

  let quickTipsJSX = c.quickTips.map(tip => {
    return `          <div className={styles.quickTip}>
            <p>${escapeQuotes(tip)}</p>
          </div>`;
  }).join('\n');

  return `'use client';

import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function ${componentName}Page() {
  return (
    <ChapterPage chapterId="${chapterId}">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>👋</span>
          <h2 className={styles.sectionTitleText}>Introducción</h2>
        </div>
        <p>${escapeQuotes(c.introduction)}</p>
      </section>

      {/* Secciones */}
${sectionsJSX}

      {/* Tips Rápidos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✅</span>
          <h2 className={styles.sectionTitleText}>Tips Rápidos</h2>
        </div>
        <div className={styles.quickTipsGrid}>
${quickTipsJSX}
        </div>
      </section>

      {/* Consejos para Perros y Gatos */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🐾</span>
          <h2 className={styles.sectionTitleText}>Consejos Específicos</h2>
        </div>
        <div className={styles.petTips}>
          <div className={\`\${styles.petTip} \${styles.dog}\`}>
            <div className={styles.petTipHeader}>
              <span>🐕</span> Para Perros
            </div>
            <p>${escapeQuotes(c.forDogs)}</p>
          </div>
          <div className={\`\${styles.petTip} \${styles.cat}\`}>
            <div className={styles.petTipHeader}>
              <span>🐈</span> Para Gatos
            </div>
            <p>${escapeQuotes(c.forCats)}</p>
          </div>
        </div>
      </section>

      {/* Herramienta Relacionada */}
      <Link href="${c.relatedTool.url}" className={styles.relatedTool}>
        <div className={styles.relatedToolHeader}>
          <span className={styles.relatedToolIcon}>🧰</span>
          <span className={styles.relatedToolName}>${escapeQuotes(c.relatedTool.name)}</span>
        </div>
        <p>${escapeQuotes(c.relatedTool.description)}</p>
      </Link>
    </ChapterPage>
  );
}
`;
}

// Función para generar la página de recursos (especial)
function generateResourcesPageContent() {
  const c = content.recursos.chapters.herramientas.content;

  let toolsJSX = c.toolsSummary.map(tool => {
    return `          <Link href="${tool.url}" className={styles.toolCard}>
            <div className={styles.toolHeader}>
              <span className={styles.toolIcon}>${tool.icon}</span>
              <span className={styles.toolName}>${escapeQuotes(tool.name)}</span>
            </div>
            <p className={styles.toolDesc}>${escapeQuotes(tool.description)}</p>
            <p className={styles.toolWhen}>📅 ${escapeQuotes(tool.whenToUse)}</p>
          </Link>`;
  }).join('\n');

  let checklistJSX = c.checklistGoodOwner.map(item => {
    return `            <li>${escapeQuotes(item)}</li>`;
  }).join('\n');

  let monthlyJSX = c.annualCalendar.monthly.map(item => {
    return `              <li>${escapeQuotes(item)}</li>`;
  }).join('\n');

  let quarterlyJSX = c.annualCalendar.quarterly.map(item => {
    return `              <li>${escapeQuotes(item)}</li>`;
  }).join('\n');

  let yearlyJSX = c.annualCalendar.yearly.map(item => {
    return `              <li>${escapeQuotes(item)}</li>`;
  }).join('\n');

  let summaryJSX = c.guideSummary.map(item => {
    return `            <li>${escapeQuotes(item)}</li>`;
  }).join('\n');

  return `'use client';

import Link from 'next/link';
import styles from '../../GuiaCuidadoMascota.module.css';
import ChapterPage from '../../ChapterPage';

export default function HerramientasPage() {
  return (
    <ChapterPage chapterId="herramientas">
      {/* Introducción */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🎉</span>
          <h2 className={styles.sectionTitleText}>¡Felicidades!</h2>
        </div>
        <p>${escapeQuotes(c.introduction)}</p>
      </section>

      {/* Herramientas */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>🧰</span>
          <h2 className={styles.sectionTitleText}>Nuestras Herramientas</h2>
        </div>
        <div className={styles.toolsGrid}>
${toolsJSX}
        </div>
      </section>

      {/* Checklist */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>✅</span>
          <h2 className={styles.sectionTitleText}>Checklist del Buen Dueño</h2>
        </div>
        <div className={styles.checklistSection}>
          <h4>📋 Responsabilidades del dueño responsable</h4>
          <ul>
${checklistJSX}
          </ul>
        </div>
      </section>

      {/* Calendario */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📅</span>
          <h2 className={styles.sectionTitleText}>Calendario de Cuidados</h2>
        </div>
        <div className={styles.calendarGrid}>
          <div className={styles.calendarCard}>
            <h4>📆 Cada Mes</h4>
            <ul>
${monthlyJSX}
            </ul>
          </div>
          <div className={styles.calendarCard}>
            <h4>📆 Cada 3 Meses</h4>
            <ul>
${quarterlyJSX}
            </ul>
          </div>
          <div className={styles.calendarCard}>
            <h4>📆 Cada Año</h4>
            <ul>
${yearlyJSX}
            </ul>
          </div>
        </div>
      </section>

      {/* Resumen */}
      <section className={styles.contentSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📝</span>
          <h2 className={styles.sectionTitleText}>Resumen de la Guía</h2>
        </div>
        <div className={styles.summaryList}>
          <ol>
${summaryJSX}
          </ol>
        </div>
      </section>

      {/* Mensaje Final */}
      <div className={styles.finalMessage}>
        <p>${escapeQuotes(c.finalMessage)}</p>
      </div>
    </ChapterPage>
  );
}
`;
}

// Generar páginas para cada módulo
const basePath = path.join(__dirname, '..', 'app', 'guia-cuidado-mascota');

for (const [moduleId, info] of Object.entries(moduleChapters)) {
  const chapterId = info.chapter;
  const chapterDir = path.join(basePath, moduleId, chapterId);

  // Crear directorio si no existe
  fs.mkdirSync(chapterDir, { recursive: true });

  // Obtener contenido del capítulo
  const chapterContent = content[moduleId].chapters[chapterId];

  let pageContent;
  if (moduleId === 'recursos') {
    pageContent = generateResourcesPageContent();
  } else {
    pageContent = generateRegularPageContent(moduleId, chapterId, chapterContent);
  }

  // Escribir archivo
  fs.writeFileSync(path.join(chapterDir, 'page.tsx'), pageContent, 'utf8');
  console.log('✅ Creado:', moduleId + '/' + chapterId + '/page.tsx');
}

console.log('\n🎉 Todas las páginas de capítulos creadas correctamente');
