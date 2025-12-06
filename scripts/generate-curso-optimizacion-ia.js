/**
 * Script para generar contenido del Curso de Optimización para IAs (GEO/AEO)
 * usando la API de Anthropic (Claude)
 *
 * Este curso es diferenciador porque:
 * - No hay cursos en español sobre GEO/AEO
 * - Es conocimiento de 2024-2025, muy reciente
 * - Complementa las herramientas SEO existentes
 *
 * Ejecutar: node scripts/generate-curso-optimizacion-ia.js
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Estructura del curso - 6 capítulos sobre GEO/AEO
const COURSE_STRUCTURE = [
  {
    module: 'paradigma',
    title: 'El Nuevo Paradigma Digital',
    chapters: [
      {
        id: 'seo-a-geo',
        title: 'De SEO a GEO/AEO: El Cambio de Era',
        topics: [
          'Qué es GEO (Generative Engine Optimization)',
          'Qué es AEO (Answer Engine Optimization)',
          'Por qué el SEO tradicional ya no es suficiente',
          'El auge de las búsquedas conversacionales',
          'Estadísticas de adopción de IAs en búsquedas (2024-2025)'
        ],
        duration: 18
      }
    ]
  },
  {
    module: 'como-piensan',
    title: 'Cómo Funcionan las IAs',
    chapters: [
      {
        id: 'llms-rag',
        title: 'LLMs, RAG y Citaciones: Cómo "Piensan" las IAs',
        topics: [
          'Qué son los Large Language Models (LLMs)',
          'Retrieval-Augmented Generation (RAG): cómo las IAs buscan información',
          'El proceso de citación: cómo las IAs deciden qué fuentes citar',
          'Diferencias entre ChatGPT, Perplexity, Gemini y Claude',
          'Por qué algunas fuentes son citadas y otras ignoradas'
        ],
        duration: 22
      }
    ]
  },
  {
    module: 'eeat',
    title: 'E-E-A-T para IAs',
    chapters: [
      {
        id: 'autoridad-confianza',
        title: 'E-E-A-T: Experiencia, Expertise, Autoridad y Confianza',
        topics: [
          'Qué es E-E-A-T y por qué importa más que nunca',
          'Experiencia: demostrar conocimiento de primera mano',
          'Expertise: credenciales y profundidad técnica',
          'Autoridad: menciones, backlinks y reconocimiento',
          'Confianza: transparencia, actualización y verificabilidad',
          'Cómo las IAs evalúan E-E-A-T de manera diferente a Google'
        ],
        duration: 20
      }
    ]
  },
  {
    module: 'optimizacion',
    title: 'Optimización Práctica',
    chapters: [
      {
        id: 'estructura-schema',
        title: 'Estructura, Schema Markup y Entidades',
        topics: [
          'Estructura de contenido optimizada para IAs',
          'Uso de encabezados jerárquicos (H1-H6)',
          'Listas, tablas y formatos que las IAs prefieren',
          'Schema.org: tipos de schema más útiles para GEO',
          'Entidades y Knowledge Graph: cómo aparecer',
          'FAQ Schema y HowTo Schema para respuestas directas'
        ],
        duration: 25
      }
    ]
  },
  {
    module: 'plataformas',
    title: 'Las Plataformas de IA',
    chapters: [
      {
        id: 'chatgpt-perplexity',
        title: 'ChatGPT, Perplexity, Gemini y AI Overviews',
        topics: [
          'ChatGPT con navegación: cómo funciona y qué cita',
          'Perplexity AI: el buscador conversacional',
          'Google AI Overviews (SGE): la evolución de los snippets',
          'Gemini y Bard: el ecosistema de Google',
          'Claude: características de citación',
          'Microsoft Copilot y Bing Chat',
          'Estrategias específicas para cada plataforma'
        ],
        duration: 22
      }
    ]
  },
  {
    module: 'medicion',
    title: 'Medición y Seguimiento',
    chapters: [
      {
        id: 'medir-citaciones',
        title: 'Cómo Saber si las IAs te Citan',
        topics: [
          'El reto de medir visibilidad en IAs',
          'Herramientas de monitorización (Originality.ai, etc.)',
          'Búsquedas manuales sistemáticas',
          'Métricas proxy: tráfico de referencia, branded searches',
          'Crear un sistema de seguimiento propio',
          'KPIs recomendados para GEO/AEO',
          'El futuro de la analítica en la era de las IAs'
        ],
        duration: 20
      }
    ]
  }
];

async function generateChapterContent(chapter, moduleTitle) {
  const prompt = `Eres un experto en SEO, GEO (Generative Engine Optimization) y AEO (Answer Engine Optimization) con conocimiento actualizado de 2024-2025. Genera contenido educativo para un capítulo de un curso online en español.

CONTEXTO: Este es un curso pionero en español sobre cómo optimizar contenido para que las IAs (ChatGPT, Perplexity, Gemini, etc.) lo citen y recomienden. El público objetivo son emprendedores, bloggers y marketers hispanohablantes.

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle}
TEMAS A CUBRIR: ${chapter.topics.join(', ')}

INSTRUCCIONES:
1. Escribe contenido actualizado (2024-2025), no información obsoleta
2. Incluye ejemplos prácticos relevantes para el mercado hispanohablante
3. Sé específico y accionable, no genérico
4. Menciona herramientas, plataformas y técnicas concretas
5. El tono debe ser profesional pero accesible

Responde SOLO con un objeto JSON válido (sin texto adicional antes o después):

{
  "introduction": "Párrafo introductorio de 3-4 oraciones que enganche al lector y explique por qué este tema es crucial en 2025",
  "sections": [
    {
      "title": "Título de la sección",
      "content": "Contenido extenso de la sección (mínimo 250 palabras) con explicaciones claras, datos concretos y contexto. Usar párrafos bien estructurados.",
      "example": "Un ejemplo práctico, caso de uso real o aplicación concreta que ilustre el concepto"
    }
  ],
  "keyIdeas": ["Idea clave 1 - concisa pero completa", "Idea clave 2", "Idea clave 3", "Idea clave 4", "Idea clave 5"],
  "actionItems": ["Acción práctica 1 que el lector puede implementar hoy", "Acción práctica 2", "Acción práctica 3"],
  "reflectionQuestions": ["Pregunta de reflexión 1", "Pregunta de reflexión 2", "Pregunta de reflexión 3"],
  "resources": ["Recurso o herramienta recomendada 1", "Recurso 2", "Recurso 3"],
  "curiosity": "Un dato sorprendente, estadística reciente o predicción de expertos sobre el tema"
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones
- Asegúrate de que el JSON sea válido (comillas dobles, sin comas finales)
- Cada sección debe tener mínimo 250 palabras de contenido
- Los ejemplos deben ser específicos y relevantes para hispanohablantes
- Incluye datos y estadísticas cuando sea posible (2024-2025)`;

  try {
    // Usar Haiku para generar borrador inicial (más rápido y económico)
    console.log(`    → Generando borrador con Haiku...`);
    const draftResponse = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    let draftText = draftResponse.content[0].text.trim();

    // Limpiar posibles artefactos
    if (draftText.startsWith('```json')) {
      draftText = draftText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (draftText.startsWith('```')) {
      draftText = draftText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const draft = JSON.parse(draftText);

    // Usar Sonnet para refinar y mejorar el contenido
    console.log(`    → Refinando con Sonnet...`);
    const refinePrompt = `Eres un editor experto en contenido educativo sobre SEO y marketing digital.

Revisa y mejora el siguiente contenido de un curso sobre GEO/AEO (optimización para IAs).

CONTENIDO ACTUAL:
${JSON.stringify(draft, null, 2)}

MEJORAS REQUERIDAS:
1. Asegúrate de que cada sección tenga al menos 250 palabras de contenido rico
2. Añade más ejemplos específicos si faltan
3. Verifica que los datos sean actuales (2024-2025)
4. Mejora la claridad y fluidez del texto
5. Asegúrate de que los action items sean realmente accionables
6. El contenido debe ser único y valioso, no genérico

Responde SOLO con el JSON mejorado, manteniendo exactamente la misma estructura.`;

    const refineResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 5000,
      messages: [{ role: 'user', content: refinePrompt }]
    });

    let refinedText = refineResponse.content[0].text.trim();

    // Limpiar posibles artefactos
    if (refinedText.startsWith('```json')) {
      refinedText = refinedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (refinedText.startsWith('```')) {
      refinedText = refinedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(refinedText);
  } catch (error) {
    console.error(`  Error generando ${chapter.id}:`, error.message);
    // Devolver contenido placeholder en caso de error
    return {
      introduction: `Bienvenido al capítulo "${chapter.title}". En esta sección exploraremos conceptos fundamentales sobre ${chapter.topics[0].toLowerCase()}.`,
      sections: chapter.topics.map(topic => ({
        title: topic,
        content: `Esta sección aborda ${topic.toLowerCase()}. El contenido detallado se está generando...`,
        example: "Ejemplo en desarrollo."
      })),
      keyIdeas: ["Concepto en desarrollo", "Aplicación práctica", "Reflexión crítica"],
      actionItems: ["Acción 1", "Acción 2", "Acción 3"],
      reflectionQuestions: ["¿Qué has aprendido?", "¿Cómo aplicarías esto?", "¿Qué dudas tienes?"],
      resources: ["Recurso en desarrollo"],
      curiosity: "Dato curioso en desarrollo."
    };
  }
}

async function generateAllContent() {
  const allContent = {};
  let successCount = 0;
  let errorCount = 0;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CURSO: Optimización para IAs (GEO/AEO)');
  console.log('  Generando contenido con Claude (Haiku + Sonnet)');
  console.log('═══════════════════════════════════════════════════════════════');

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
        console.log(`  ✅ Completado (${content.sections.length} secciones)`);
        successCount++;
      } else {
        console.log(`  ⚠️ Contenido parcial`);
        errorCount++;
      }

      // Pausa entre llamadas para respetar rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Guardar contenido
  const outputPath = path.join(__dirname, 'curso-optimizacion-ia-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(allContent, null, 2), 'utf8');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  📊 Resumen: ${successCount} capítulos generados, ${errorCount} errores`);
  console.log(`  💾 Guardado en: ${outputPath}`);
  console.log('═══════════════════════════════════════════════════════════════');

  return allContent;
}

// Exportar estructura
module.exports = { COURSE_STRUCTURE, generateAllContent };

// Ejecutar
if (require.main === module) {
  console.log('\n🚀 Iniciando generación del curso "Optimización para IAs"...\n');
  generateAllContent()
    .then(() => console.log('\n🎉 Proceso completado'))
    .catch(err => console.error('Error fatal:', err));
}
