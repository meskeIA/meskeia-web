#!/usr/bin/env node

/**
 * Script para generar el contenido del Curso de Marketing Digital
 * Usa la API de Anthropic para generar contenido educativo de alta calidad
 *
 * Proceso:
 * 1. Lee la configuración del curso desde curso-marketing-digital-config.json
 * 2. Para cada capítulo, genera contenido usando Claude (Haiku para draft, Sonnet para refinamiento)
 * 3. Guarda el contenido generado en curso-marketing-digital-content.json
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG_PATH = path.join(__dirname, 'curso-marketing-digital-config.json');
const OUTPUT_PATH = path.join(__dirname, 'curso-marketing-digital-content.json');

// Inicializar cliente Anthropic
const client = new Anthropic();

// Leer configuración
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// Función para delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para generar el prompt del sistema
function getSystemPrompt() {
  return `Eres un experto en marketing digital con más de 15 años de experiencia.
Tu tarea es crear contenido educativo de alta calidad para un curso online.

CONTEXTO DEL CURSO:
- Nombre: ${config.course.name}
- Audiencia: ${config.course.targetAudience}
- Tono: ${config.generation.tone}
- Idioma: Español de España

INSTRUCCIONES DE ESTILO:
- Escribe de forma clara, directa y práctica
- Usa ejemplos reales y actuales (2024-2025)
- Incluye casos de empresas españolas cuando sea posible
- Evita jerga innecesaria, pero usa términos técnicos cuando sea apropiado
- Orienta hacia la acción y los resultados
- Menciona herramientas meskeIA donde aplique (Generador de Palabras Clave, Analizador SEO, Analizador GEO, Calculadora ROI Marketing, Generador UTM, Generador de Carruseles, etc.)

FORMATO DE RESPUESTA (JSON):
{
  "introduction": "Párrafo introductorio atractivo que enganche al lector (150-200 palabras)",
  "sections": [
    {
      "title": "Título de la sección",
      "content": "Contenido detallado de la sección (200-300 palabras)",
      "example": "Ejemplo práctico o caso de uso real (opcional)"
    }
  ],
  "keyIdeas": ["Idea clave 1", "Idea clave 2", "Idea clave 3", "Idea clave 4"],
  "actionItems": ["Acción práctica 1", "Acción práctica 2", "Acción práctica 3"],
  "reflectionQuestions": ["Pregunta de reflexión 1", "Pregunta de reflexión 2"],
  "curiosity": "Dato curioso o estadística interesante relacionada con el tema"
}

IMPORTANTE:
- El contenido debe ser 100% original
- Actualizado a 2025 (no uses ejemplos obsoletos)
- Práctico y orientado a resultados
- Responde SOLO con el JSON, sin texto adicional`;
}

// Función para generar prompt del capítulo
function getChapterPrompt(module, chapter) {
  return `Genera el contenido para el siguiente capítulo:

MÓDULO: ${module.title}
CAPÍTULO: ${chapter.title}

TEMAS A CUBRIR:
${chapter.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

DURACIÓN ESTIMADA DE LECTURA: ${chapter.duration} minutos

Genera contenido educativo completo y de alta calidad que cubra todos estos temas.
Recuerda: enfocado en marketing digital 2025, práctico, con ejemplos reales.`;
}

// Función para generar contenido de un capítulo
async function generateChapterContent(module, chapter, retries = 3) {
  const systemPrompt = getSystemPrompt();
  const userPrompt = getChapterPrompt(module, chapter);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`    Generando con ${config.generation.draftModel}...`);

      // Paso 1: Draft con Haiku
      const draftResponse = await client.messages.create({
        model: config.generation.draftModel,
        max_tokens: 4000,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        system: systemPrompt
      });

      const draftContent = draftResponse.content[0].text;

      // Pequeño delay entre llamadas
      await delay(1000);

      console.log(`    Refinando con ${config.generation.model}...`);

      // Paso 2: Refinamiento con Sonnet
      const refinePrompt = `Revisa y mejora el siguiente contenido educativo sobre marketing digital.
Asegúrate de que:
1. El contenido esté actualizado a 2025
2. Los ejemplos sean relevantes y actuales
3. El tono sea profesional pero accesible
4. Incluya valor práctico real
5. Mencione herramientas meskeIA donde sea relevante

CONTENIDO A REFINAR:
${draftContent}

Devuelve el JSON mejorado, manteniendo la misma estructura.`;

      const refineResponse = await client.messages.create({
        model: config.generation.model,
        max_tokens: 4000,
        messages: [
          { role: 'user', content: refinePrompt }
        ],
        system: systemPrompt
      });

      const refinedContent = refineResponse.content[0].text;

      // Parsear JSON
      const jsonMatch = refinedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } else {
        throw new Error('No se encontró JSON válido en la respuesta');
      }

    } catch (error) {
      console.error(`    Error (intento ${attempt}/${retries}):`, error.message);
      if (attempt === retries) {
        throw error;
      }
      await delay(2000 * attempt);
    }
  }
}

// Función principal
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  📈 Generando: ${config.course.name}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Estructura de salida
  const output = {
    course: {
      name: config.course.name,
      slug: config.course.slug,
      description: config.course.description,
      icon: config.course.icon
    },
    modules: {},
    generatedAt: new Date().toISOString(),
    stats: {
      totalModules: 0,
      totalChapters: 0,
      totalDuration: 0,
      errors: 0
    }
  };

  // Cargar progreso existente si existe
  let existingContent = null;
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      existingContent = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
      console.log('📂 Encontrado contenido previo, continuando desde donde quedó...\n');
    } catch (e) {
      console.log('⚠️ Error leyendo contenido previo, empezando de nuevo...\n');
    }
  }

  // Procesar cada módulo
  for (const module of config.course.modules) {
    console.log(`\n📚 Módulo: ${module.title}`);
    console.log('─'.repeat(60));

    output.modules[module.id] = {
      title: module.title,
      description: module.description,
      chapters: {}
    };
    output.stats.totalModules++;

    // Procesar cada capítulo
    for (const chapter of module.chapters) {
      output.stats.totalChapters++;
      output.stats.totalDuration += chapter.duration;

      // Verificar si ya existe contenido para este capítulo
      if (existingContent?.modules?.[module.id]?.chapters?.[chapter.id]?.content) {
        console.log(`  ⏭️ ${chapter.title} (ya generado)`);
        output.modules[module.id].chapters[chapter.id] = existingContent.modules[module.id].chapters[chapter.id];
        continue;
      }

      console.log(`\n  📝 ${chapter.title}`);
      console.log(`     Temas: ${chapter.topics.length} | Duración: ${chapter.duration} min`);

      try {
        const content = await generateChapterContent(module, chapter);

        output.modules[module.id].chapters[chapter.id] = {
          title: chapter.title,
          topics: chapter.topics,
          duration: chapter.duration,
          content: content
        };

        console.log(`     ✅ Generado correctamente`);

        // Guardar progreso después de cada capítulo
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

        // Delay entre capítulos para no saturar la API
        await delay(1500);

      } catch (error) {
        console.error(`     ❌ Error: ${error.message}`);
        output.stats.errors++;

        output.modules[module.id].chapters[chapter.id] = {
          title: chapter.title,
          topics: chapter.topics,
          duration: chapter.duration,
          content: null,
          error: error.message
        };
      }
    }
  }

  // Guardar resultado final
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');

  // Resumen final
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  📊 RESUMEN DE GENERACIÓN');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Módulos: ${output.stats.totalModules}`);
  console.log(`  Capítulos: ${output.stats.totalChapters}`);
  console.log(`  Duración total: ${output.stats.totalDuration} minutos`);
  console.log(`  Errores: ${output.stats.errors}`);
  console.log(`\n  Archivo: ${OUTPUT_PATH}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Ejecutar
main().catch(console.error);
