/**
 * Script para generar contenido del Curso de Negociación Exitosa
 * usando la API de Anthropic (Claude)
 *
 * IMPORTANTE: Este script genera contenido 100% ORIGINAL basado en
 * conceptos de negociación empresarial y personal, actualizado a 2024-2025.
 * Inspirado en metodología de escuelas de negocios pero con contenido propio.
 *
 * Ejecutar: node scripts/generate-curso-negociacion.js
 * Test: node scripts/generate-curso-negociacion.js --test --haiku
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Estructura del curso - 4 módulos con 3 capítulos cada uno = 12 capítulos
const COURSE_STRUCTURE = [
  {
    module: 'preparacion',
    title: 'Preparación y Análisis',
    chapters: [
      {
        id: 'fundamentos-negociacion',
        title: 'Fundamentos de la Negociación',
        topics: [
          'Qué es negociar y por qué es una habilidad esencial',
          'Negociación posicional vs negociación basada en intereses',
          'Tipos de negociación: distributiva vs integrativa',
          'El mito del pastel fijo y cómo superarlo'
        ],
        duration: 18
      },
      {
        id: 'analisis-negociacion',
        title: 'Análisis de la Negociación',
        topics: [
          'El concepto BATNA: tu mejor alternativa',
          'Precio de reserva, precio probable y meta ambiciosa',
          'La Zona de Acuerdo Potencial (ZOPA)',
          'Árboles de decisión para evaluar opciones'
        ],
        duration: 22
      },
      {
        id: 'preparacion-estrategica',
        title: 'Preparación Estratégica',
        topics: [
          'Investigar a la otra parte: información es poder',
          'Definir tus objetivos e intereses subyacentes',
          'Anticipar objeciones y preparar respuestas',
          'El checklist del negociador preparado'
        ],
        duration: 18
      }
    ]
  },
  {
    module: 'psicologia',
    title: 'Psicología y Tácticas',
    chapters: [
      {
        id: 'poder-negociacion',
        title: 'El Poder en la Negociación',
        topics: [
          'Fuentes de poder: información, legitimidad, alternativas',
          'Cómo aumentar tu poder negociador',
          'El poder de la primera oferta',
          'Cuándo mostrar fortaleza y cuándo flexibilidad'
        ],
        duration: 20
      },
      {
        id: 'sesgos-cognitivos',
        title: 'Sesgos Cognitivos y Heurísticas',
        topics: [
          'El anclaje: cómo la primera cifra condiciona todo',
          'Aversión a la pérdida y encuadre de propuestas',
          'Exceso de confianza y escalada de compromiso',
          'Disponibilidad y reciprocidad en negociación'
        ],
        duration: 22
      },
      {
        id: 'tacticas-persuasion',
        title: 'Tácticas de Persuasión',
        topics: [
          'Los 6 principios de influencia de Cialdini',
          'Preguntas estratégicas y escucha activa',
          'Cómo hacer concesiones efectivas',
          'Gestionar emociones propias y ajenas'
        ],
        duration: 20
      }
    ]
  },
  {
    module: 'cierre',
    title: 'Cierre y Acuerdos',
    chapters: [
      {
        id: 'tecnicas-cierre',
        title: 'Técnicas de Cierre',
        topics: [
          'Señales de que es momento de cerrar',
          'Técnicas de cierre: resumen, alternativa, urgencia',
          'Cómo superar objeciones de último momento',
          'El arte de saber cuándo retirarse'
        ],
        duration: 18
      },
      {
        id: 'contratos-acuerdos',
        title: 'Contratos y Acuerdos',
        topics: [
          'Elementos esenciales de un contrato válido',
          'De la negociación verbal al acuerdo escrito',
          'Cláusulas importantes que no debes olvidar',
          'Errores legales comunes en negociaciones'
        ],
        duration: 20
      },
      {
        id: 'negociacion-multicultural',
        title: 'Negociación Multicultural',
        topics: [
          'Diferencias culturales en estilos de negociación',
          'Negociar con culturas de alto y bajo contexto',
          'Etiqueta y protocolo en negociaciones internacionales',
          'Casos prácticos: EEUU, Europa, Asia, Latinoamérica'
        ],
        duration: 18
      }
    ]
  },
  {
    module: 'conflictos',
    title: 'Resolución de Conflictos',
    chapters: [
      {
        id: 'prevencion-conflictos',
        title: 'Prevención de Conflictos',
        topics: [
          'Identificar señales de conflicto temprano',
          'Comunicación preventiva y expectativas claras',
          'Cláusulas de resolución en contratos',
          'Construir relaciones antes de necesitarlas'
        ],
        duration: 16
      },
      {
        id: 'mediacion-arbitraje',
        title: 'Mediación y Arbitraje',
        topics: [
          'Resolución Alternativa de Conflictos (RAC)',
          'Cuándo usar mediación vs arbitraje',
          'El proceso de mediación paso a paso',
          'Ventajas y desventajas del arbitraje'
        ],
        duration: 20
      },
      {
        id: 'etica-negociacion',
        title: 'Ética en la Negociación',
        topics: [
          'Líneas rojas: mentir, manipular, coaccionar',
          'Dilemas éticos comunes y cómo resolverlos',
          'Construir reputación a largo plazo',
          'Negociar con integridad: el juego infinito'
        ],
        duration: 18
      }
    ]
  }
];

/**
 * Genera contenido para un capítulo usando Claude
 */
async function generateChapterContent(chapter, moduleTitle, useHaiku = false) {
  const model = useHaiku ? 'claude-3-5-haiku-20241022' : 'claude-sonnet-4-20250514';

  const prompt = `Eres un experto en negociación empresarial y personal con experiencia en contextos hispanohablantes (España y Latinoamérica). Tu tarea es generar contenido educativo ORIGINAL para un curso online de negociación.

IMPORTANTE:
- El contenido debe ser 100% ORIGINAL, práctico y aplicable
- Debe estar actualizado a las realidades de 2024-2025
- Incluye ejemplos de negociaciones reales (empresariales, laborales, personales)
- Considera el contexto cultural español/latinoamericano
- Usa un tono profesional pero accesible, con casos que el lector pueda visualizar
- Incluye técnicas concretas que se puedan aplicar inmediatamente

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle}
TEMAS A CUBRIR:
${chapter.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Genera contenido educativo completo. Responde SOLO con un objeto JSON válido (sin texto adicional):

{
  "introduction": "Párrafo introductorio de 3-4 oraciones que enganche al lector y presente la relevancia práctica del tema",
  "sections": [
    {
      "title": "Título descriptivo de la sección",
      "content": "Contenido extenso de la sección (mínimo 250 palabras). Incluye explicaciones claras, técnicas específicas y contexto. Divide en párrafos para mejor legibilidad.",
      "example": "Un ejemplo concreto y realista de aplicación de estos conceptos en una negociación real (laboral, comercial, personal)"
    }
  ],
  "keyIdeas": ["4-5 ideas clave que el estudiante debe recordar"],
  "reflectionQuestions": ["3 preguntas para que el estudiante reflexione sobre sus propias negociaciones"],
  "practicalTip": "Un consejo práctico que el estudiante pueda aplicar en su próxima negociación",
  "curiosity": "Un dato curioso, estadística o caso real interesante relacionado con el tema"
}

REQUISITOS:
- Genera tantas secciones como temas hay en la lista (${chapter.topics.length} secciones)
- Cada sección debe tener mínimo 250 palabras de contenido
- Los ejemplos deben ser realistas y aplicables
- El JSON debe ser válido (comillas dobles, sin comas finales)
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones`;

  try {
    console.log(`    🤖 Usando modelo: ${model}`);

    const response = await client.messages.create({
      model: model,
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = response.content[0].text.trim();

    // Limpiar posibles artefactos de markdown
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(text);

    // Validar estructura mínima
    if (!parsed.introduction || !parsed.sections || parsed.sections.length === 0) {
      throw new Error('Estructura JSON incompleta');
    }

    return parsed;
  } catch (error) {
    console.error(`    ❌ Error: ${error.message}`);

    // Devolver contenido placeholder en caso de error
    return {
      introduction: `Este capítulo explora "${chapter.title}", un tema fundamental en la negociación efectiva. Dominar estos conceptos te permitirá obtener mejores resultados en tus negociaciones profesionales y personales.`,
      sections: chapter.topics.map(topic => ({
        title: topic,
        content: `Esta sección aborda ${topic.toLowerCase()}. El contenido detallado está siendo generado...`,
        example: "Ejemplo en desarrollo."
      })),
      keyIdeas: [
        "La preparación es la clave del éxito en cualquier negociación",
        "Conocer tu BATNA te da poder real en la mesa",
        "Las emociones influyen más de lo que creemos",
        "La ética construye relaciones a largo plazo"
      ],
      reflectionQuestions: [
        "¿Cómo aplicas estos conceptos en tu trabajo actual?",
        "¿Qué cambios podrías implementar en tu próxima negociación?",
        "¿Cuáles son tus principales fortalezas y debilidades como negociador?"
      ],
      practicalTip: "Antes de tu próxima negociación, dedica al menos 30 minutos a preparar tu BATNA y definir tu precio de reserva.",
      curiosity: "El 80% de los negociadores no preparan adecuadamente sus negociaciones, lo que reduce significativamente sus resultados."
    };
  }
}

/**
 * Genera todo el contenido del curso
 */
async function generateAllContent(useHaiku = false) {
  const allContent = {};
  let successCount = 0;
  let errorCount = 0;

  console.log(`\n🤝 GENERADOR DE CONTENIDO - CURSO NEGOCIACIÓN EXITOSA`);
  console.log(`📊 Modelo: ${useHaiku ? 'Claude Haiku (exploración)' : 'Claude Sonnet (producción)'}`);
  console.log(`📚 Total: ${COURSE_STRUCTURE.length} módulos, ${COURSE_STRUCTURE.reduce((acc, m) => acc + m.chapters.length, 0)} capítulos\n`);

  for (const module of COURSE_STRUCTURE) {
    console.log(`\n📁 MÓDULO: ${module.title}`);
    console.log('─'.repeat(50));

    allContent[module.module] = {
      title: module.title,
      chapters: {}
    };

    for (const chapter of module.chapters) {
      console.log(`\n  📖 ${chapter.title}`);
      console.log(`     Temas: ${chapter.topics.length}`);

      const startTime = Date.now();
      const content = await generateChapterContent(chapter, module.title, useHaiku);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (content && content.sections && content.sections.length > 0) {
        allContent[module.module].chapters[chapter.id] = {
          ...chapter,
          content
        };
        console.log(`     ✅ Completado (${elapsed}s) - ${content.sections.length} secciones`);
        successCount++;
      } else {
        console.log(`     ⚠️ Contenido parcial (${elapsed}s)`);
        errorCount++;
      }

      // Pausa entre llamadas para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Guardar contenido
  const outputPath = path.join(__dirname, 'curso-negociacion-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(allContent, null, 2), 'utf8');

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 RESUMEN`);
  console.log(`   ✅ Exitosos: ${successCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`   💾 Guardado en: ${outputPath}`);
  console.log('═'.repeat(50));

  return allContent;
}

/**
 * Genera solo un capítulo específico (útil para testing)
 */
async function generateSingleChapter(moduleId, chapterId, useHaiku = false) {
  const module = COURSE_STRUCTURE.find(m => m.module === moduleId);
  if (!module) {
    console.error(`Módulo "${moduleId}" no encontrado`);
    return null;
  }

  const chapter = module.chapters.find(c => c.id === chapterId);
  if (!chapter) {
    console.error(`Capítulo "${chapterId}" no encontrado en módulo "${moduleId}"`);
    return null;
  }

  console.log(`\n🔬 Generando capítulo individual: ${chapter.title}`);
  return await generateChapterContent(chapter, module.title, useHaiku);
}

// Exportar para uso externo
module.exports = { COURSE_STRUCTURE, generateAllContent, generateSingleChapter };

// Ejecutar si es el script principal
if (require.main === module) {
  const args = process.argv.slice(2);
  const useHaiku = args.includes('--haiku');

  if (args.includes('--test')) {
    // Modo test: genera solo el primer capítulo
    console.log('🧪 Modo TEST: generando solo el primer capítulo...');
    generateSingleChapter('preparacion', 'fundamentos-negociacion', useHaiku)
      .then(content => {
        console.log('\n📄 Contenido generado:');
        console.log(JSON.stringify(content, null, 2));
      })
      .catch(err => console.error('Error:', err));
  } else {
    // Modo completo
    console.log('🚀 Iniciando generación completa del curso...');
    console.log(useHaiku ? '   (Usando Haiku para exploración)' : '   (Usando Sonnet para producción)');

    generateAllContent(useHaiku)
      .then(() => console.log('\n🎉 Proceso completado'))
      .catch(err => console.error('Error fatal:', err));
  }
}
