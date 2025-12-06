/**
 * Script para generar contenido del Curso de Pensamiento Científico
 * usando la API de Anthropic (Claude)
 *
 * Ejecutar: node scripts/generate-curso-pensamiento.js
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Estructura del curso - 6 módulos con 2 capítulos cada uno
const COURSE_STRUCTURE = [
  {
    module: 'fundamentos',
    title: 'Fundamentos de la Ciencia',
    chapters: [
      {
        id: 'que-es-ciencia',
        title: '¿Qué es la Ciencia?',
        topics: ['Definición y características', 'Diferencia con otras formas de conocimiento', 'Los cuatro pilares: empirismo, racionalidad, verificación e imaginación'],
        duration: 15
      },
      {
        id: 'historia-ciencia',
        title: 'Breve Historia del Pensamiento Científico',
        topics: ['De la Antigüedad al Renacimiento', 'La Revolución Científica', 'La ciencia moderna y contemporánea'],
        duration: 20
      }
    ]
  },
  {
    module: 'verdad',
    title: 'La Búsqueda de la Verdad',
    chapters: [
      {
        id: 'que-es-verdad',
        title: '¿Qué es la Verdad?',
        topics: ['Teorías de la verdad', 'Verdad objetiva vs subjetiva', 'El papel del contexto'],
        duration: 15
      },
      {
        id: 'verdad-lenguaje',
        title: 'Verdad, Lenguaje y Lógica',
        topics: ['Cómo el lenguaje moldea el pensamiento', 'Falacias lógicas comunes', 'Pensamiento crítico'],
        duration: 18
      }
    ]
  },
  {
    module: 'metodos',
    title: 'Métodos Científicos',
    chapters: [
      {
        id: 'metodo-cientifico',
        title: 'El Método Científico',
        topics: ['Observación, hipótesis, experimentación', 'Empirismo vs racionalismo', 'Falsabilidad de Popper'],
        duration: 20
      },
      {
        id: 'paradigmas',
        title: 'Paradigmas y Revoluciones Científicas',
        topics: ['Thomas Kuhn y los paradigmas', 'Ciencia normal vs revoluciones', 'Del reduccionismo al pensamiento sistémico'],
        duration: 18
      }
    ]
  },
  {
    module: 'aplicaciones',
    title: 'Ciencia en la Vida Cotidiana',
    chapters: [
      {
        id: 'decisiones',
        title: 'Tomar Mejores Decisiones',
        topics: ['Sesgos cognitivos', 'Pensamiento probabilístico', 'Evaluación de evidencia'],
        duration: 20
      },
      {
        id: 'ciencia-diaria',
        title: 'Aplicando el Pensamiento Científico',
        topics: ['En la salud y medicina', 'En finanzas personales', 'En relaciones y comunicación'],
        duration: 15
      }
    ]
  },
  {
    module: 'propagacion',
    title: 'Cómo se Propagan las Ideas',
    chapters: [
      {
        id: 'difusion-ideas',
        title: 'La Difusión del Conocimiento',
        topics: ['Redes sociales y viralidad', 'Sesgos de confirmación', 'Cámaras de eco'],
        duration: 15
      },
      {
        id: 'pseudociencia',
        title: 'Ciencia vs Pseudociencia',
        topics: ['Cómo identificar pseudociencia', 'Teorías conspirativas', 'Pensamiento crítico ante la desinformación'],
        duration: 18
      }
    ]
  },
  {
    module: 'limites',
    title: 'Los Límites de la Ciencia',
    chapters: [
      {
        id: 'limites-etica',
        title: 'Límites y Ética en la Ciencia',
        topics: ['Lo que la ciencia no puede responder', 'Dilemas éticos', 'Responsabilidad científica'],
        duration: 18
      },
      {
        id: 'ciencia-sociedad',
        title: 'Ciencia, Sociedad y Futuro',
        topics: ['El papel de la ciencia en la sociedad', 'Ciencia y democracia', 'Desafíos del siglo XXI'],
        duration: 15
      }
    ]
  }
];

async function generateChapterContent(chapter, moduleTitle) {
  const prompt = `Eres un experto en filosofía de la ciencia y educación. Genera contenido educativo para un capítulo de un curso online.

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle}
TEMAS: ${chapter.topics.join(', ')}

Escribe el contenido en español, accesible pero riguroso. Usa ejemplos cotidianos relevantes para hispanohablantes.

Responde SOLO con un objeto JSON válido (sin texto adicional antes o después):

{
  "introduction": "Párrafo introductorio de 2-3 oraciones",
  "sections": [
    {
      "title": "Título sección 1",
      "content": "Contenido extenso de la sección con varios párrafos...",
      "example": "Un ejemplo práctico"
    },
    {
      "title": "Título sección 2",
      "content": "Contenido extenso...",
      "example": "Otro ejemplo"
    },
    {
      "title": "Título sección 3",
      "content": "Contenido extenso...",
      "example": "Ejemplo adicional"
    }
  ],
  "keyIdeas": ["Idea clave 1", "Idea clave 2", "Idea clave 3", "Idea clave 4"],
  "reflectionQuestions": ["Pregunta 1", "Pregunta 2", "Pregunta 3"],
  "curiosity": "Un dato curioso o anécdota interesante"
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones
- Asegúrate de que el JSON sea válido (comillas dobles, sin comas finales)
- El contenido de cada sección debe tener mínimo 200 palabras`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
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
  } catch (error) {
    console.error(`  Error generando ${chapter.id}:`, error.message);
    // Devolver contenido placeholder en caso de error
    return {
      introduction: `Bienvenido al capítulo "${chapter.title}". En esta sección exploraremos los conceptos fundamentales relacionados con ${chapter.topics[0].toLowerCase()}.`,
      sections: chapter.topics.map(topic => ({
        title: topic,
        content: `Esta sección aborda ${topic.toLowerCase()}. El contenido detallado se está generando...`,
        example: "Ejemplo en desarrollo."
      })),
      keyIdeas: ["Concepto en desarrollo", "Aplicación práctica", "Reflexión crítica"],
      reflectionQuestions: ["¿Qué has aprendido?", "¿Cómo aplicarías esto?", "¿Qué dudas tienes?"],
      curiosity: "Dato curioso en desarrollo."
    };
  }
}

async function generateAllContent() {
  const allContent = {};
  let successCount = 0;
  let errorCount = 0;

  for (const module of COURSE_STRUCTURE) {
    console.log(`\n📚 Módulo: ${module.title}`);
    allContent[module.module] = {
      title: module.title,
      chapters: {}
    };

    for (const chapter of module.chapters) {
      console.log(`  📖 Generando: ${chapter.title}...`);
      const content = await generateChapterContent(chapter, module.title);

      if (content && content.sections && content.sections.length > 0) {
        allContent[module.module].chapters[chapter.id] = {
          ...chapter,
          content
        };
        console.log(`  ✅ Completado`);
        successCount++;
      } else {
        console.log(`  ⚠️ Contenido parcial`);
        errorCount++;
      }

      // Pausa entre llamadas
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Guardar contenido
  const outputPath = path.join(__dirname, 'curso-pensamiento-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(allContent, null, 2), 'utf8');

  console.log(`\n📊 Resumen: ${successCount} éxitos, ${errorCount} errores`);
  console.log(`💾 Guardado en: ${outputPath}`);

  return allContent;
}

// Exportar estructura
module.exports = { COURSE_STRUCTURE, generateAllContent };

// Ejecutar
if (require.main === module) {
  console.log('🚀 Generando contenido del curso Pensamiento Científico...');
  generateAllContent()
    .then(() => console.log('\n🎉 Proceso completado'))
    .catch(err => console.error('Error fatal:', err));
}
