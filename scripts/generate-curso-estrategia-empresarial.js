/**
 * Script para generar contenido del Curso de Estrategia Empresarial
 * Usa la API de Anthropic con:
 * - Haiku para búsqueda/contexto rápido
 * - Sonnet para selección y refinamiento
 *
 * Enfoque: 30% fundamentos clásicos + 70% realidad 2025
 */

const Anthropic = require("@anthropic-ai/sdk").default;
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

// Cargar configuración del curso
const configPath = path.join(__dirname, "curso-estrategia-empresarial-config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Archivo de salida
const outputPath = path.join(__dirname, "curso-estrategia-empresarial-content.json");

// Contexto del material de Darden (resumen para inyectar)
const DARDEN_CONTEXT = `
CONTEXTO DEL MATERIAL DE REFERENCIA (Darden Business School - The Strategist's Toolkit):

CAPÍTULO 1 - Introducción al Análisis Estratégico:
- Estrategia como patrón coherente de decisiones sobre el tiempo
- Marco de análisis: entorno externo + capacidades internas
- Importancia de misión, visión y valores como guía
- Trade-offs: la esencia de la estrategia es elegir qué NO hacer

CAPÍTULO 2 - Análisis del Ciclo de Vida Competitivo:
- Fases: introducción, crecimiento, madurez, declive
- En cada fase cambian: barreras, rentabilidad, competencia
- Limitación: asume progresión lineal (hoy las industrias pueden saltar fases o morir súbitamente)

CAPÍTULO 3 - Las 5 Fuerzas de Porter:
- Rivalidad, nuevos entrantes, sustitutos, poder de compradores, poder de proveedores
- Utilidad: entender estructura de una industria
- Limitación: es estática, no captura velocidad de cambio ni disrupción digital

CAPÍTULO 4 - Análisis de Capacidades:
- Recursos tangibles vs. intangibles
- Capacidades como combinación de recursos
- Core competencies: difíciles de imitar, aplicables a múltiples mercados
- VRIO: Valioso, Raro, Inimitable, Organizado

CAPÍTULO 5 - Análisis de Competidores:
- Mapeo de competidores directos e indirectos
- Análisis de objetivos, estrategias, fortalezas, debilidades
- Limitación: en 2025 tu competidor puede aparecer de la nada (startups, BigTech, IA)

CASOS INCLUIDOS: Google (modelo de negocio), Apple (innovación), Disney (diversificación),
PlayStation vs Xbox (competencia), Piaggio (turnaround), Redhook (nicho)

NOTA CRÍTICA: Este material es de ~2015. Muchos ejemplos y frameworks necesitan
actualización para la era de la IA y la disrupción digital continua.
`;

// Contexto de realidad 2025
const MODERN_CONTEXT = `
CONTEXTO 2025 - REALIDAD ESTRATÉGICA ACTUAL:

CAMBIOS FUNDAMENTALES:
1. La IA generativa puede hacer obsoletos modelos de negocio en meses
2. Los ciclos de vida de productos/industrias se han comprimido dramáticamente
3. Las barreras de entrada tradicionales (capital, distribución) son menos relevantes
4. Los datos y los loops de aprendizaje son las nuevas ventajas competitivas
5. La planificación a 5 años es ficción en la mayoría de industrias

CASOS DE FRACASO DE "EMPRESAS EXCELENTES":
- De las 43 empresas de "In Search of Excellence" (1982), 2/3 fracasaron o perdieron relevancia
- Kodak: inventó la cámara digital pero no la comercializó por proteger su negocio de película
- Nokia: de 50% del mercado móvil a irrelevante en 5 años tras el iPhone
- Blockbuster: rechazó comprar Netflix por $50M, quebró años después
- Yahoo: valorada en $125B en 2000, vendida por $4.5B en 2017

NUEVOS PARADIGMAS:
- Estrategia emergente (Mintzberg): la estrategia se descubre haciendo, no solo planificando
- Lean Strategy: hipótesis → experimento → aprendizaje → pivote
- Optionalidad: mantener opciones abiertas es más valioso que optimizar un camino
- Antifragilidad (Taleb): sistemas que se benefician del caos

CASOS ACTUALES RELEVANTES:
- OpenAI vs Anthropic: velocidad + escala vs seguridad + responsabilidad
- Tesla vs fabricantes tradicionales: software-first disruption
- Amazon: filosofía "Day 1" - actuar siempre como startup
- Inditex/Zara: fast fashion como estrategia de respuesta rápida

PÚBLICO OBJETIVO DEL CURSO:
- Emprendedores que necesitan pensar estratégicamente sin MBA
- Directivos de PYMEs que enfrentan disrupción en sus industrias
- Estudiantes que quieren entender estrategia real, no solo teoría
- Profesionales que toman decisiones en entornos de alta incertidumbre
`;

/**
 * Genera contenido para un capítulo usando el modelo apropiado
 */
async function generateChapterContent(moduleId, chapterId, chapterData, moduleTitle) {
  const { title, duration, topics, sourceReference, modernContext } = chapterData;

  console.log(`\n📝 Generando: ${title}`);
  console.log(`   Módulo: ${moduleTitle}`);
  console.log(`   Referencia: ${sourceReference}`);

  const prompt = `Eres un experto en estrategia empresarial creando contenido para un curso online en español.

${DARDEN_CONTEXT}

${MODERN_CONTEXT}

TAREA: Generar el contenido completo para el capítulo "${title}" del módulo "${moduleTitle}".

INFORMACIÓN DEL CAPÍTULO:
- Duración estimada de lectura: ${duration} minutos
- Temas a cubrir: ${topics.join(", ")}
- Referencia del material clásico: ${sourceReference}
- Contexto moderno específico: ${modernContext}

ESTRUCTURA REQUERIDA (JSON):
{
  "introduction": "Párrafo inicial que conecte con la realidad del lector. Directo, sin rodeos. 100-150 palabras.",
  "sections": [
    {
      "title": "Título de la sección",
      "content": "Contenido principal de la sección. 200-300 palabras. Claro, directo, con ejemplos concretos.",
      "example": "Ejemplo práctico específico que ilustre el concepto. Casos reales, no genéricos."
    }
  ],
  "keyIdeas": ["Idea clave 1 (una frase)", "Idea clave 2", "Idea clave 3", "Idea clave 4", "Idea clave 5"],
  "actionItems": ["Acción concreta 1 que el lector puede hacer hoy", "Acción 2", "Acción 3", "Acción 4"],
  "reflectionQuestions": ["Pregunta para reflexionar 1", "Pregunta 2", "Pregunta 3"],
  "curiosity": "Dato sorprendente o contraejemplo que desafíe asunciones comunes sobre estrategia."
}

DIRECTRICES DE CONTENIDO:
1. TONO: Directo, honesto, sin jerga innecesaria. Habla como un mentor experimentado, no como un libro de texto.
2. EQUILIBRIO: 30% conceptos clásicos (contextualizados), 70% realidad 2025 y aplicación práctica.
3. EJEMPLOS: Usa casos reales y actuales. Evita ejemplos genéricos como "una empresa X".
4. HONESTIDAD: Admite abiertamente qué no sabemos y qué frameworks han dejado de funcionar.
5. ACCIONABLE: El lector debe poder aplicar algo concreto después de cada capítulo.
6. ESPAÑOL: Todo el contenido en español de España, natural y fluido.

Genera 4-5 secciones que cubran todos los temas listados.

IMPORTANTE: Responde SOLO con el JSON válido, sin explicaciones adicionales ni markdown.`;

  try {
    // Usar Sonnet para generar contenido de alta calidad
    const response = await client.messages.create({
      model: config.apiConfig.refinementModel, // claude-sonnet-4-20250514
      max_tokens: config.apiConfig.maxTokensPerChapter,
      temperature: config.apiConfig.temperature,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.content[0].text;

    // Intentar parsear JSON
    try {
      // Limpiar posibles caracteres extra
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      const parsed = JSON.parse(cleanContent);
      console.log(`   ✅ Contenido generado correctamente`);
      return parsed;
    } catch (parseError) {
      console.log(`   ⚠️ Error parseando JSON, guardando respuesta raw`);
      console.log(`   Raw response: ${content.substring(0, 200)}...`);
      return {
        introduction: content.substring(0, 500),
        sections: [],
        keyIdeas: [],
        actionItems: [],
        reflectionQuestions: [],
        curiosity: "",
        _parseError: true,
        _rawContent: content,
      };
    }
  } catch (error) {
    console.error(`   ❌ Error generando contenido: ${error.message}`);
    return null;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("🎯 GENERADOR DE CONTENIDO - CURSO ESTRATEGIA EMPRESARIAL");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`📚 Curso: ${config.courseTitle}`);
  console.log(`🎯 Subtítulo: ${config.courseSubtitle}`);
  console.log(`🤖 Modelo de generación: ${config.apiConfig.refinementModel}`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Estructura de salida
  const output = {
    courseId: config.courseId,
    courseTitle: config.courseTitle,
    courseSubtitle: config.courseSubtitle,
    courseDescription: config.courseDescription,
    targetAudience: config.targetAudience,
    generatedAt: new Date().toISOString(),
    modules: {},
  };

  // Contadores
  let totalChapters = 0;
  let successfulChapters = 0;
  let failedChapters = 0;

  // Iterar por módulos y capítulos
  for (const [moduleId, moduleData] of Object.entries(config.modules)) {
    console.log(`\n📁 MÓDULO: ${moduleData.title}`);
    console.log(`   ${moduleData.description}`);
    console.log("─────────────────────────────────────────────────────────────");

    output.modules[moduleId] = {
      title: moduleData.title,
      description: moduleData.description,
      chapters: {},
    };

    for (const [chapterId, chapterData] of Object.entries(moduleData.chapters)) {
      totalChapters++;

      const content = await generateChapterContent(
        moduleId,
        chapterId,
        chapterData,
        moduleData.title
      );

      if (content) {
        output.modules[moduleId].chapters[chapterId] = {
          title: chapterData.title,
          duration: chapterData.duration,
          topics: chapterData.topics,
          content: content,
        };
        successfulChapters++;
      } else {
        failedChapters++;
      }

      // Pausa entre llamadas para respetar rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Guardar resultado
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("📊 RESUMEN DE GENERACIÓN");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`✅ Capítulos generados: ${successfulChapters}/${totalChapters}`);
  console.log(`❌ Capítulos fallidos: ${failedChapters}`);
  console.log(`📄 Archivo generado: ${outputPath}`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  if (failedChapters > 0) {
    console.log("⚠️ Algunos capítulos fallaron. Revisa los logs y vuelve a ejecutar si es necesario.\n");
  } else {
    console.log("🎉 ¡Generación completada con éxito!");
    console.log("   Siguiente paso: node scripts/create-estrategia-empresarial-pages.js\n");
  }
}

// Ejecutar
main().catch(console.error);
