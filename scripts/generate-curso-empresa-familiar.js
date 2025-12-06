/**
 * Script para generar contenido del Curso de Empresa Familiar
 * usando la API de Anthropic (Claude)
 *
 * IMPORTANTE: Este script genera contenido 100% ORIGINAL basado en
 * conceptos académicos de gestión de empresa familiar, actualizado a 2024-2025.
 * NO es una copia del material de ESADE, sino contenido propio generado por IA.
 *
 * Ejecutar: node scripts/generate-curso-empresa-familiar.js
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
    title: 'Fundamentos de la Empresa Familiar',
    chapters: [
      {
        id: 'que-es-empresa-familiar',
        title: '¿Qué es una Empresa Familiar?',
        topics: [
          'Definición y características distintivas',
          'Importancia económica en España y el mundo (85% del tejido empresarial)',
          'El modelo de los Tres Círculos: Familia, Propiedad y Empresa',
          'Fortalezas y desafíos únicos'
        ],
        duration: 20
      },
      {
        id: 'complejidad-empresa-familiar',
        title: 'Complejidad y Evolución',
        topics: [
          'Complejidad de la familia vs complejidad de la empresa',
          'El crecimiento generacional y sus desafíos',
          'De la primera a la tercera generación',
          'Factores de supervivencia y longevidad'
        ],
        duration: 18
      }
    ]
  },
  {
    module: 'gobierno',
    title: 'Gobierno y Órganos de Decisión',
    chapters: [
      {
        id: 'organos-gobierno',
        title: 'Instituciones de Gobierno Familiar',
        topics: [
          'El Consejo de Familia: funciones y composición',
          'El Consejo de Administración en la empresa familiar',
          'El Comité de Dirección y la gestión ejecutiva',
          'Diferencias entre Junta de Accionistas y Consejo de Familia'
        ],
        duration: 22
      },
      {
        id: 'protocolo-familiar',
        title: 'El Protocolo Familiar',
        topics: [
          'Qué es y para qué sirve el protocolo familiar',
          'Contenido típico: valores, reglas, límites',
          'El proceso de elaboración y consenso',
          'Limitaciones y errores comunes'
        ],
        duration: 18
      }
    ]
  },
  {
    module: 'profesionalizacion',
    title: 'Profesionalización y Diferenciación',
    chapters: [
      {
        id: 'diferenciacion-familia-empresa',
        title: 'Separar Familia y Empresa',
        topics: [
          'Diferenciación laboral: quién trabaja y en qué condiciones',
          'Política de acceso, promoción y remuneración',
          'Legitimación de la exigencia profesional',
          'El papel de los profesionales externos'
        ],
        duration: 20
      },
      {
        id: 'practicas-gestion',
        title: 'Profesionalización de la Gestión',
        topics: [
          'Sistemas de información y control',
          'Planificación estratégica en la empresa familiar',
          'Gestión del talento familiar y no familiar',
          'Indicadores de profesionalización'
        ],
        duration: 18
      }
    ]
  },
  {
    module: 'modelos',
    title: 'Modelos de Empresa Familiar',
    chapters: [
      {
        id: 'modelo-mental',
        title: 'El Modelo Mental: Cómo Pensamos la Empresa',
        topics: [
          'La influencia del "pensar" en el "hacer"',
          'Familia gestora vs familia propietaria',
          'Creencias limitantes y potenciadoras',
          'El cambio de modelo mental entre generaciones'
        ],
        duration: 20
      },
      {
        id: 'tipologias',
        title: 'Tipologías de Empresa Familiar',
        topics: [
          'Modelo Capitán: la PYME del fundador',
          'Modelo Emperador: el líder carismático',
          'Modelo Equipo Familiar: todos trabajan juntos',
          'Modelo Familia Profesional: gestión con criterio',
          'Modelo Corporación: familia propietaria, gestión delegada'
        ],
        duration: 25
      }
    ]
  },
  {
    module: 'gestion-modelos',
    title: 'Gestión según el Modelo',
    chapters: [
      {
        id: 'gestion-modelos-simples',
        title: 'Gestión en Modelos Unipersonales',
        topics: [
          'Características del Capitán y el Emperador',
          'Fortalezas: agilidad, visión, compromiso',
          'Riesgos: dependencia, sucesión, centralización',
          'Cuándo y cómo evolucionar el modelo'
        ],
        duration: 20
      },
      {
        id: 'gestion-modelos-complejos',
        title: 'Gestión en Modelos Profesionalizados',
        topics: [
          'Familia Profesional: equilibrio entre familia y empresa',
          'Corporación: la familia como propietaria responsable',
          'Grupo de Inversión Familiar: diversificación y gobernanza',
          'Transiciones entre modelos'
        ],
        duration: 22
      }
    ]
  },
  {
    module: 'sucesion',
    title: 'Sucesión y Continuidad',
    chapters: [
      {
        id: 'planificacion-sucesion',
        title: 'Planificación de la Sucesión',
        topics: [
          'La sucesión como proceso, no como evento',
          'Dimensiones: propiedad, gobierno y gestión',
          'Preparación del sucesor y del sucedido',
          'Errores comunes y cómo evitarlos'
        ],
        duration: 22
      },
      {
        id: 'continuidad-transformacion',
        title: 'Continuidad y Transformación',
        topics: [
          'El triángulo de gestión: complejidad, estructura, riesgo',
          'Cuándo cambiar de modelo de empresa familiar',
          'Comunicación familiar efectiva',
          'El legado y la visión a largo plazo'
        ],
        duration: 18
      }
    ]
  }
];

/**
 * Genera contenido para un capítulo usando Claude
 * Usa Haiku para exploración inicial, Sonnet para generación final
 */
async function generateChapterContent(chapter, moduleTitle, useHaiku = false) {
  const model = useHaiku ? 'claude-3-5-haiku-20241022' : 'claude-sonnet-4-20250514';

  const prompt = `Eres un experto en gestión de empresas familiares con amplio conocimiento del contexto español y latinoamericano. Tu tarea es generar contenido educativo ORIGINAL para un curso online.

IMPORTANTE:
- El contenido debe ser 100% ORIGINAL, no basado en ningún libro específico
- Debe estar actualizado a las tendencias y realidades de 2024-2025
- Incluye ejemplos de empresas familiares conocidas (Inditex, Mercadona, El Corte Inglés, etc.)
- Considera el contexto legal y cultural español/latinoamericano
- Usa un tono profesional pero accesible

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle}
TEMAS A CUBRIR:
${chapter.topics.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Genera contenido educativo completo. Responde SOLO con un objeto JSON válido (sin texto adicional):

{
  "introduction": "Párrafo introductorio de 3-4 oraciones que enganche al lector y presente la relevancia del tema",
  "sections": [
    {
      "title": "Título descriptivo de la sección",
      "content": "Contenido extenso de la sección (mínimo 250 palabras). Incluye explicaciones claras, datos relevantes y contexto. Divide en párrafos para mejor legibilidad.",
      "example": "Un ejemplo concreto y real, preferiblemente de una empresa familiar española o latinoamericana conocida"
    }
  ],
  "keyIdeas": ["4-5 ideas clave que el estudiante debe recordar"],
  "reflectionQuestions": ["3 preguntas para que el estudiante reflexione sobre su propia situación"],
  "practicalTip": "Un consejo práctico que el estudiante pueda aplicar inmediatamente",
  "curiosity": "Un dato curioso, estadística o caso real interesante relacionado con el tema"
}

REQUISITOS:
- Genera tantas secciones como temas hay en la lista (${chapter.topics.length} secciones)
- Cada sección debe tener mínimo 250 palabras de contenido
- Los ejemplos deben ser reales y verificables
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
      introduction: `Este capítulo explora "${chapter.title}", un tema fundamental en la gestión de empresas familiares. Comprender estos conceptos es esencial para cualquier miembro de una familia empresaria.`,
      sections: chapter.topics.map(topic => ({
        title: topic,
        content: `Esta sección aborda ${topic.toLowerCase()}. El contenido detallado está siendo generado...`,
        example: "Ejemplo en desarrollo."
      })),
      keyIdeas: [
        "La empresa familiar tiene características únicas",
        "El equilibrio familia-empresa es fundamental",
        "La profesionalización mejora la supervivencia",
        "La comunicación es clave para el éxito"
      ],
      reflectionQuestions: [
        "¿Cómo aplica esto a tu empresa familiar?",
        "¿Qué cambios podrías implementar?",
        "¿Cuáles son los principales desafíos que enfrentas?"
      ],
      practicalTip: "Comienza por evaluar la situación actual de tu empresa familiar antes de implementar cambios.",
      curiosity: "Las empresas familiares representan más del 85% del tejido empresarial español."
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

  console.log(`\n🏢 GENERADOR DE CONTENIDO - CURSO EMPRESA FAMILIAR`);
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
  const outputPath = path.join(__dirname, 'curso-empresa-familiar-content.json');
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
    generateSingleChapter('fundamentos', 'que-es-empresa-familiar', useHaiku)
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
