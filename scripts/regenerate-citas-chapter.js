/**
 * Script para regenerar el capítulo de Citas y Referencias
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const chapter = {
  id: 'citar-correctamente',
  title: 'Citas y Referencias',
  topics: [
    'Por qué citar: ética académica y evitar el plagio',
    'Cita textual vs paráfrasis: cuándo usar cada una',
    'Sistemas de citación: APA 7, MLA, Chicago, Vancouver',
    'Cómo construir la bibliografía paso a paso',
    'Herramientas de gestión bibliográfica: Zotero, Mendeley'
  ],
  duration: 16
};

async function generateChapterContent() {
  const prompt = `Eres un experto en redacción académica y comunicación escrita con amplia experiencia docente en universidades hispanohablantes. Genera contenido educativo para un capítulo de un curso online en español.

CONTEXTO: Este es un curso práctico de Redacción Académica dirigido a estudiantes universitarios, profesionales e investigadores que necesitan escribir textos académicos (TFG, TFM, tesis, artículos, ensayos). El enfoque es 100% práctico: pautas aplicables al propio trabajo del estudiante, no teoría abstracta.

CAPÍTULO: ${chapter.title}
MÓDULO: Citas y Referencias
TEMAS A CUBRIR: ${chapter.topics.join(', ')}

INSTRUCCIONES:
1. Contenido PRÁCTICO y APLICABLE: cada sección debe dar pautas concretas que el estudiante pueda usar inmediatamente en su propio trabajo
2. Ejemplos reales de citas correctas en formato APA, MLA, etc.
3. Tono accesible pero riguroso: como un tutor que guía paso a paso
4. Incluir "tips" o consejos de profesor experimentado
5. Evitar jerga innecesaria, explicar los términos técnicos cuando aparezcan
6. Orientado al público hispanohablante (ejemplos en español, normas APA/MLA adaptadas)

Responde SOLO con un objeto JSON válido (sin texto adicional antes o después):

{
  "introduction": "Párrafo introductorio de 3-4 oraciones que conecte con el estudiante y explique por qué este tema es importante para su trabajo académico",
  "sections": [
    {
      "title": "Título de la sección",
      "content": "Contenido extenso de la sección (mínimo 300 palabras) con explicaciones claras, pautas prácticas paso a paso, y consejos de aplicación inmediata. Usar párrafos bien estructurados.",
      "example": "Un ejemplo concreto y realista: fragmento de cita correcta, comparación antes/después, o caso práctico que ilustre el concepto"
    }
  ],
  "keyTakeaways": ["Pauta práctica 1 - algo que el estudiante puede aplicar HOY en su trabajo", "Pauta práctica 2", "Pauta práctica 3", "Pauta práctica 4", "Pauta práctica 5"],
  "commonMistakes": ["Error común 1 que debes evitar", "Error común 2", "Error común 3"],
  "professorTip": "Un consejo valioso de profesor experimentado, algo que solo se aprende con años de experiencia evaluando trabajos",
  "applyToYourWork": "Instrucción específica para que el estudiante aplique lo aprendido a su propio texto: una mini-tarea práctica"
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones
- Asegúrate de que el JSON sea válido (comillas dobles, sin comas finales, escapar comillas internas con backslash)
- Cada sección debe tener mínimo 300 palabras de contenido práctico
- Los ejemplos deben ser citas reales formateadas correctamente en APA, MLA, etc.
- NO uses caracteres < o > sin escapar (usa "menor que" o "mayor que" en texto)`;

  console.log('Generando contenido del capítulo Citas y Referencias...');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 6000,
    messages: [{ role: 'user', content: prompt }]
  });

  let text = response.content[0].text.trim();

  // Limpiar posibles artefactos
  if (text.startsWith('```json')) {
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  }
  if (text.startsWith('```')) {
    text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(text);
}

function generateSectionContent(section) {
  const contentParagraphs = section.content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => {
      if (p.trim().startsWith('- ') || p.trim().startsWith('* ') || /^\d+\.\s/.test(p.trim())) {
        const items = p.split('\n').filter(item => item.trim());
        const isOrdered = /^\d+\.\s/.test(items[0].trim());
        const listItems = items.map(item => {
          const cleanItem = item.replace(/^[-*\d.]+\s*/, '').trim();
          const processed = cleanItem
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
          return `            <li>${processed}</li>`;
        }).join('\n');
        return isOrdered
          ? `          <ol>\n${listItems}\n          </ol>`
          : `          <ul>\n${listItems}\n          </ul>`;
      }
      const processed = p
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
      return `          <p>${processed}</p>`;
    })
    .join('\n');

  return contentParagraphs;
}

function generatePageContent(chapterContent) {
  let sectionsJSX = chapterContent.sections.map((section, idx) => {
    const sectionContent = generateSectionContent(section);
    const exampleContent = section.example ? section.example
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;') : '';

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

  const keyTakeaways = chapterContent.keyTakeaways || [];
  const keyTakeawaysJSX = keyTakeaways.length > 0 ? `
      {/* Pautas clave */}
      <div className={styles.keyIdeasList}>
        <h4>💡 Pautas Clave</h4>
        <ul>
          ${keyTakeaways.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>` : '';

  const commonMistakes = chapterContent.commonMistakes || [];
  const commonMistakesJSX = commonMistakes.length > 0 ? `
      {/* Errores comunes */}
      <div className={styles.warningBox}>
        <p><strong>⚠️ Errores comunes que debes evitar:</strong></p>
        <ul>
          ${commonMistakes.map(item => `<li>${item}</li>`).join('\n          ')}
        </ul>
      </div>` : '';

  const professorTip = chapterContent.professorTip || '';
  const professorTipJSX = professorTip ? `
      {/* Consejo del profesor */}
      <div className={styles.practicalTip}>
        <h4>👨‍🏫 Consejo de Profesor</h4>
        <p>${professorTip}</p>
      </div>` : '';

  const applyToYourWork = chapterContent.applyToYourWork || '';
  const applyJSX = applyToYourWork ? `
      {/* Aplica a tu trabajo */}
      <div className={styles.reflectionQuestions}>
        <h4>📝 Aplica esto a tu trabajo</h4>
        <p>${applyToYourWork}</p>
      </div>` : '';

  return `'use client';

import ChapterPage from '../../ChapterPage';
import styles from '../../CursoRedaccionAcademica.module.css';

export default function CitarCorrectamentePage() {
  return (
    <ChapterPage chapterId="citar-correctamente">
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
}

async function main() {
  try {
    const content = await generateChapterContent();
    console.log('✅ Contenido generado correctamente');

    const pageContent = generatePageContent(content);

    const outputPath = path.join(__dirname, '..', 'app', 'curso-redaccion-academica', 'citas', 'citar-correctamente', 'page.tsx');
    fs.writeFileSync(outputPath, pageContent, 'utf8');

    console.log('✅ Página actualizada:', outputPath);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
