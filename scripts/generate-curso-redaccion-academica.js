/**
 * Script para generar contenido del Curso de Redacción Académica
 * usando la API de Anthropic (Claude)
 *
 * Basado en material del curso CETAH (Comunicación Escrita en el Trabajo Académico)
 * Público objetivo: Estudiantes universitarios, profesionales, investigadores
 * Enfoque: Práctico, pautas aplicables al propio trabajo académico
 *
 * Ejecutar: node scripts/generate-curso-redaccion-academica.js
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Estructura del curso - 12 capítulos + Glosario
const COURSE_STRUCTURE = [
  {
    module: 'fundamentos',
    title: 'Fundamentos',
    chapters: [
      {
        id: 'que-es-texto-academico',
        title: 'Fundamentos del Texto Académico',
        topics: [
          'Qué es un texto académico y sus características distintivas',
          'Diferencias entre texto académico, divulgativo y periodístico',
          'Tipos de textos académicos: ensayo, artículo, tesis, TFG/TFM',
          'El rigor académico: objetividad, verificabilidad y fundamentación',
          'Errores comunes que debes evitar desde el principio'
        ],
        duration: 12
      }
    ]
  },
  {
    module: 'planificacion',
    title: 'Planificación',
    chapters: [
      {
        id: 'antes-de-escribir',
        title: 'Planificación y Estructura',
        topics: [
          'Las tres fases de la escritura: planificación, redacción y revisión',
          'Cómo delimitar tu tema: de lo general a lo específico',
          'Crear un esquema de trabajo efectivo',
          'Organizar tus fuentes y materiales',
          'Gestión del tiempo: cronograma realista para tu trabajo'
        ],
        duration: 14
      }
    ]
  },
  {
    module: 'introduccion',
    title: 'Introducción',
    chapters: [
      {
        id: 'como-empezar',
        title: 'La Introducción Perfecta',
        topics: [
          'Los componentes esenciales de una introducción académica',
          'Estrategias de apertura que captan la atención',
          'Cómo presentar el problema o pregunta de investigación',
          'Definir objetivos claros y alcanzables',
          'El "mapa" del texto: anticipar la estructura al lector'
        ],
        duration: 13
      }
    ]
  },
  {
    module: 'desarrollo',
    title: 'Desarrollo',
    chapters: [
      {
        id: 'cuerpo-argumentacion',
        title: 'Desarrollo y Argumentación',
        topics: [
          'La estructura del párrafo académico: oración tópica y desarrollo',
          'Tipos de argumentos: autoridad, ejemplificación, analogía, datos',
          'Conectores y marcadores del discurso académico',
          'Progresión temática: cómo avanzar sin repetirte',
          'Equilibrio entre tus ideas y las fuentes consultadas'
        ],
        duration: 15
      }
    ]
  },
  {
    module: 'conclusiones',
    title: 'Conclusiones',
    chapters: [
      {
        id: 'cerrar-bien',
        title: 'Conclusiones Efectivas',
        topics: [
          'Qué debe contener una conclusión académica',
          'Diferencia entre resumen y conclusión',
          'Tipos de cierre: síntesis, proyección, reflexión crítica',
          'Cómo retomar la tesis inicial sin repetirte',
          'Abrir nuevas líneas de investigación'
        ],
        duration: 11
      }
    ]
  },
  {
    module: 'citas',
    title: 'Citas y Referencias',
    chapters: [
      {
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
      }
    ]
  },
  {
    module: 'resumen',
    title: 'Resumen',
    chapters: [
      {
        id: 'sintesis-abstract',
        title: 'El Resumen Académico',
        topics: [
          'Qué es un abstract y para qué sirve',
          'Estructura del resumen: objetivo, método, resultados, conclusión',
          'Técnicas de síntesis: identificar ideas principales',
          'Extensión adecuada: la regla del 10%',
          'Palabras clave: cómo seleccionarlas para indexación'
        ],
        duration: 12
      }
    ]
  },
  {
    module: 'resena',
    title: 'Reseña',
    chapters: [
      {
        id: 'analizar-textos',
        title: 'La Reseña Crítica',
        topics: [
          'Qué es una reseña y diferencia con el resumen',
          'Estructura de la reseña: presentación, exposición, valoración',
          'Cómo hacer un análisis crítico constructivo',
          'El equilibrio entre objetividad y opinión fundamentada',
          'Errores comunes al escribir reseñas académicas'
        ],
        duration: 13
      }
    ]
  },
  {
    module: 'coherencia',
    title: 'Coherencia',
    chapters: [
      {
        id: 'fluir-bien',
        title: 'Coherencia y Cohesión',
        topics: [
          'Coherencia: la unidad temática de tu texto',
          'Cohesión: los mecanismos que conectan las ideas',
          'Tipos de conectores: aditivos, adversativos, causales, temporales',
          'Progresión temática: tema-rema y sus variantes',
          'Detectar y corregir problemas de coherencia'
        ],
        duration: 14
      }
    ]
  },
  {
    module: 'estilo',
    title: 'Estilo',
    chapters: [
      {
        id: 'tono-academico',
        title: 'Estilo y Registro Académico',
        topics: [
          'Características del registro académico formal',
          'Objetividad e impersonalidad: cuándo usar "se" vs primera persona',
          'Precisión léxica: evitar ambigüedades y vaguedades',
          'Economía del lenguaje: decir más con menos',
          'Errores de estilo frecuentes y cómo evitarlos'
        ],
        duration: 13
      }
    ]
  },
  {
    module: 'revision',
    title: 'Revisión',
    chapters: [
      {
        id: 'pulir-texto',
        title: 'Revisión y Edición',
        topics: [
          'La importancia de la revisión en la escritura académica',
          'Estrategias de autorrevision: leer en voz alta, dejar reposar',
          'Checklist de revisión: contenido, estructura, estilo, formato',
          'Errores ortográficos y gramaticales más frecuentes',
          'Cuándo pedir feedback y cómo incorporarlo'
        ],
        duration: 12
      }
    ]
  },
  {
    module: 'proyecto-final',
    title: 'Proyecto Final',
    chapters: [
      {
        id: 'tu-primer-texto',
        title: 'Tu Primer Texto Académico',
        topics: [
          'Checklist completo antes de entregar tu trabajo',
          'Formato y presentación: márgenes, tipografía, espaciado',
          'Los últimos retoques: portada, índice, anexos',
          'Consejos de última hora de profesores y evaluadores',
          'Recursos adicionales para seguir mejorando'
        ],
        duration: 10
      }
    ]
  },
  {
    module: 'glosario',
    title: 'Glosario',
    chapters: [
      {
        id: 'terminos-clave',
        title: 'Glosario de Términos Académicos',
        topics: [
          'Términos de estructura: abstract, introducción, desarrollo, conclusión',
          'Términos de citación: paráfrasis, cita textual, bibliografía, referencia',
          'Términos de coherencia: cohesión, conectores, progresión temática',
          'Términos de estilo: registro, objetividad, precisión léxica',
          'Términos de evaluación: rúbrica, criterios, retroalimentación'
        ],
        duration: 8
      }
    ]
  }
];

async function generateChapterContent(chapter, moduleTitle) {
  const prompt = `Eres un experto en redacción académica y comunicación escrita con amplia experiencia docente en universidades hispanohablantes. Genera contenido educativo para un capítulo de un curso online en español.

CONTEXTO: Este es un curso práctico de Redacción Académica dirigido a estudiantes universitarios, profesionales e investigadores que necesitan escribir textos académicos (TFG, TFM, tesis, artículos, ensayos). El enfoque es 100% práctico: pautas aplicables al propio trabajo del estudiante, no teoría abstracta.

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle}
TEMAS A CUBRIR: ${chapter.topics.join(', ')}

INSTRUCCIONES:
1. Contenido PRÁCTICO y APLICABLE: cada sección debe dar pautas concretas que el estudiante pueda usar inmediatamente en su propio trabajo
2. Ejemplos reales de textos académicos (fragmentos de introducciones, párrafos bien estructurados, citas correctas)
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
      "example": "Un ejemplo concreto y realista: fragmento de texto académico bien escrito, comparación antes/después, o caso práctico que ilustre el concepto"
    }
  ],
  "keyTakeaways": ["Pauta práctica 1 - algo que el estudiante puede aplicar HOY en su trabajo", "Pauta práctica 2", "Pauta práctica 3", "Pauta práctica 4", "Pauta práctica 5"],
  "commonMistakes": ["Error común 1 que debes evitar", "Error común 2", "Error común 3"],
  "professorTip": "Un consejo valioso de profesor experimentado, algo que solo se aprende con años de experiencia evaluando trabajos",
  "applyToYourWork": "Instrucción específica para que el estudiante aplique lo aprendido a su propio texto: una mini-tarea práctica"
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones
- Asegúrate de que el JSON sea válido (comillas dobles, sin comas finales)
- Cada sección debe tener mínimo 300 palabras de contenido práctico
- Los ejemplos deben ser fragmentos de textos académicos reales o realistas
- El tono debe ser de guía práctica, no de manual teórico`;

  try {
    // Usar Haiku para generar borrador inicial
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
    const refinePrompt = `Eres un editor experto en contenido educativo sobre redacción académica.

Revisa y mejora el siguiente contenido de un curso de Redacción Académica.

CONTENIDO ACTUAL:
${JSON.stringify(draft, null, 2)}

MEJORAS REQUERIDAS:
1. Asegúrate de que cada sección tenga al menos 300 palabras de contenido PRÁCTICO
2. Los ejemplos deben ser fragmentos reales de textos académicos (introducciones, párrafos, citas)
3. El tono debe ser de tutor/guía, no de manual teórico
4. Añade más consejos específicos y aplicables si faltan
5. Verifica que las pautas sean realmente útiles para alguien escribiendo su TFG/tesis AHORA
6. El contenido debe ayudar al estudiante a mejorar su propio texto, no solo a entender teoría

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
      introduction: `Bienvenido al capítulo "${chapter.title}". En esta sección aprenderás pautas prácticas sobre ${chapter.topics[0].toLowerCase()}.`,
      sections: chapter.topics.map(topic => ({
        title: topic,
        content: `Esta sección aborda ${topic.toLowerCase()}. El contenido detallado se está generando...`,
        example: "Ejemplo en desarrollo."
      })),
      keyTakeaways: ["Pauta en desarrollo", "Aplicación práctica", "Consejo útil"],
      commonMistakes: ["Error común 1", "Error común 2", "Error común 3"],
      professorTip: "Consejo de profesor en desarrollo.",
      applyToYourWork: "Tarea práctica en desarrollo."
    };
  }
}

async function generateGlossaryContent() {
  const prompt = `Eres un experto en redacción académica. Genera un glosario completo de términos académicos para un curso de Redacción Académica en español.

El glosario debe incluir los términos más importantes que un estudiante universitario necesita conocer al escribir su TFG, TFM, tesis o artículo académico.

Responde SOLO con un objeto JSON válido:

{
  "introduction": "Breve introducción al glosario (2-3 oraciones)",
  "categories": [
    {
      "name": "Estructura del Texto",
      "terms": [
        {
          "term": "Abstract",
          "definition": "Definición clara y concisa del término",
          "example": "Ejemplo de uso o contexto donde aparece"
        }
      ]
    }
  ],
  "tip": "Un consejo sobre cómo usar este glosario de forma efectiva"
}

CATEGORÍAS A INCLUIR:
1. Estructura del Texto (abstract, introducción, desarrollo, conclusión, anexos, etc.)
2. Citación y Referencias (paráfrasis, cita textual, bibliografía, plagio, etc.)
3. Coherencia y Cohesión (conectores, progresión temática, cohesión léxica, etc.)
4. Estilo Académico (registro, objetividad, precisión, concisión, etc.)
5. Tipos de Textos (ensayo, artículo, tesis, TFG, TFM, reseña, etc.)
6. Evaluación (rúbrica, criterios, retroalimentación, etc.)

Incluye al menos 8-10 términos por categoría. Las definiciones deben ser claras y útiles para un estudiante.`;

  try {
    console.log(`    → Generando glosario con Sonnet...`);
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = response.content[0].text.trim();

    if (text.startsWith('```json')) {
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }
    if (text.startsWith('```')) {
      text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error(`  Error generando glosario:`, error.message);
    return null;
  }
}

async function generateAllContent() {
  const allContent = {};
  let successCount = 0;
  let errorCount = 0;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CURSO: Redacción Académica');
  console.log('  Generando contenido con Claude (Haiku + Sonnet)');
  console.log('  Público: Estudiantes universitarios, profesionales, investigadores');
  console.log('═══════════════════════════════════════════════════════════════');

  for (const module of COURSE_STRUCTURE) {
    console.log(`\n📚 Módulo: ${module.title}`);
    allContent[module.module] = {
      title: module.title,
      chapters: {}
    };

    for (const chapter of module.chapters) {
      console.log(`  📖 Generando: ${chapter.title}...`);

      let content;
      if (chapter.id === 'terminos-clave') {
        // Glosario tiene estructura especial
        content = await generateGlossaryContent();
      } else {
        content = await generateChapterContent(chapter, module.title);
      }

      if (content && (content.sections || content.categories)) {
        allContent[module.module].chapters[chapter.id] = {
          ...chapter,
          content
        };
        const sectionCount = content.sections ? content.sections.length : content.categories.length;
        console.log(`  ✅ Completado (${sectionCount} secciones)`);
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
  const outputPath = path.join(__dirname, 'curso-redaccion-academica-content.json');
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
  console.log('\n🚀 Iniciando generación del curso "Redacción Académica"...\n');
  generateAllContent()
    .then(() => console.log('\n🎉 Proceso completado'))
    .catch(err => console.error('Error fatal:', err));
}
