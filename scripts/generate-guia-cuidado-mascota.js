/**
 * Script para generar contenido de la Guía para el Cuidado de tu Mascota
 * usando la API de Anthropic (Claude)
 *
 * Basado en las 5 apps de mascotas de meskeIA:
 * - Planificador de Mascota (checklist, compras, vacunas)
 * - Calculadora de Alimentación (calorías, tóxicos, transición)
 * - Calculadora de Medicamentos (antiparasitarios, síntomas)
 * - Calculadora de Tamaño Adulto (crecimiento cachorros)
 * - Calculadora de Edad (años humanos, etapas de vida)
 *
 * Público objetivo: Dueños de mascotas de todos los niveles
 * Enfoque: Práctico, cercano, fácil de entender
 *
 * Ejecutar: node scripts/generate-guia-cuidado-mascota.js
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Estructura de la guía - 8 capítulos ligeros y cercanos
const GUIDE_STRUCTURE = [
  {
    module: 'preparacion',
    title: 'Preparación',
    icon: '🏠',
    chapters: [
      {
        id: 'antes-de-adoptar',
        title: 'Antes de Adoptar',
        topics: [
          '¿Perro o gato? Cuál se adapta mejor a tu estilo de vida',
          'Lo que necesitas tener preparado en casa antes de que llegue',
          'Presupuesto mensual realista: comida, veterinario, extras',
          'Cómo elegir un veterinario de confianza'
        ],
        relatedApp: 'Planificador de Mascota',
        relatedAppUrl: '/planificador-mascota/',
        contextFromApp: 'Checklist de 40 tareas organizadas por prioridad, lista de compras de 48 artículos esenciales, calendario de vacunas'
      }
    ]
  },
  {
    module: 'alimentacion',
    title: 'Alimentación',
    icon: '🍖',
    chapters: [
      {
        id: 'nutricion-basica',
        title: 'Nutrición Básica',
        topics: [
          'Cuánto debe comer tu mascota según su peso y actividad',
          'Alimentos prohibidos que pueden ser tóxicos (lista completa)',
          'Cómo cambiar de pienso sin causar problemas digestivos',
          'Señales de que tu mascota está bien alimentada'
        ],
        relatedApp: 'Calculadora de Alimentación',
        relatedAppUrl: '/calculadora-alimentacion-mascotas/',
        contextFromApp: 'Fórmulas de calorías basadas en peso y actividad, 12 alimentos tóxicos (chocolate, uvas, cebolla, ajo, aguacate, xilitol, alcohol, cafeína, huesos cocidos, lácteos, nueces macadamia, masas crudas), guía de transición alimentaria 7-14 días'
      }
    ]
  },
  {
    module: 'salud',
    title: 'Salud',
    icon: '💊',
    chapters: [
      {
        id: 'prevencion-parasitos',
        title: 'Prevención de Parásitos',
        topics: [
          'Tipos de antiparasitarios: cuál usar y cada cuánto tiempo',
          'Calendario de desparasitación según la edad',
          'Señales de que tu mascota tiene parásitos',
          'Cómo proteger a toda la familia'
        ],
        relatedApp: 'Calculadora de Medicamentos',
        relatedAppUrl: '/calculadora-medicamentos-mascotas/',
        contextFromApp: '5 tipos de antiparasitarios (Milbemax, Drontal, Nexgard, Bravecto, Seresto), calendario de desparasitación (cachorros: cada 2 semanas hasta 3 meses, luego mensual hasta 6 meses; adultos: cada 3-4 meses), 8 síntomas de parásitos'
      }
    ]
  },
  {
    module: 'crecimiento',
    title: 'Crecimiento',
    icon: '📏',
    chapters: [
      {
        id: 'desarrollo-cachorro',
        title: 'Desarrollo del Cachorro',
        topics: [
          '¿Cuánto va a pesar mi cachorro cuando sea adulto?',
          'Las etapas del crecimiento: qué esperar en cada fase',
          'Alimentación especial según la edad del cachorro',
          '¿Cuándo deja de crecer un perro?'
        ],
        relatedApp: 'Calculadora de Tamaño Adulto',
        relatedAppUrl: '/calculadora-tamano-adulto-perro/',
        contextFromApp: 'Curvas de crecimiento por tamaño (toy, pequeño, mediano, grande, gigante), 28 razas de referencia con pesos adultos, fases de desarrollo (neonatal, transición, socialización, juvenil, adolescente, adulto)'
      }
    ]
  },
  {
    module: 'etapas',
    title: 'Etapas de Vida',
    icon: '🎂',
    chapters: [
      {
        id: 'edad-y-cuidados',
        title: 'Edad y Cuidados',
        topics: [
          '¿Cuántos años humanos tiene mi perro o gato?',
          'Cachorro, adulto o senior: cómo identificar cada etapa',
          'Cuidados específicos según la etapa de vida',
          'Expectativa de vida: qué factores influyen'
        ],
        relatedApp: 'Calculadora de Edad',
        relatedAppUrl: '/calculadora-edad-mascotas/',
        contextFromApp: 'Fórmula de edad: primer año=15 humanos, segundo=9, después varía por tamaño (pequeño:4x, mediano:5x, grande:6x, gigante:7x). Etapas: cachorro/gatito (<6m), joven (6m-2a), adulto (2-7a), maduro (7-10/11a), senior (10/11-15a), geriátrico (>15a)'
      }
    ]
  },
  {
    module: 'convivencia',
    title: 'Convivencia',
    icon: '🏡',
    chapters: [
      {
        id: 'primeros-meses',
        title: 'Los Primeros Meses',
        topics: [
          'La primera noche en casa: cómo hacerla más fácil',
          'Rutinas diarias básicas que debes establecer',
          'Socialización temprana: por qué es tan importante',
          'Educación en positivo: sin castigos ni gritos'
        ],
        relatedApp: 'Planificador de Mascota',
        relatedAppUrl: '/planificador-mascota/',
        contextFromApp: 'Tareas de la primera semana, socialización en las primeras 16 semanas, rutinas de paseo, alimentación y descanso, FAQs sobre adaptación'
      }
    ]
  },
  {
    module: 'emergencias',
    title: 'Emergencias',
    icon: '🚨',
    chapters: [
      {
        id: 'cuando-ir-veterinario',
        title: '¿Cuándo Ir al Veterinario?',
        topics: [
          'Señales de alarma que requieren atención urgente',
          'Botiquín básico que debes tener en casa',
          'Primeros auxilios simples que puedes hacer',
          'Qué hacer si tu mascota come algo tóxico'
        ],
        relatedApp: 'Calculadora de Medicamentos',
        relatedAppUrl: '/calculadora-medicamentos-mascotas/',
        contextFromApp: '8 síntomas de alarma (vómitos persistentes, diarrea con sangre, letargia extrema, dificultad respiratoria, convulsiones, abdomen hinchado, no come >24h, fiebre >39.5°C), teléfonos de emergencia veterinaria'
      }
    ]
  },
  {
    module: 'recursos',
    title: 'Recursos',
    icon: '🧰',
    chapters: [
      {
        id: 'herramientas',
        title: 'Herramientas Útiles',
        topics: [
          'Todas nuestras calculadoras para mascotas',
          'Checklist del buen dueño responsable',
          'Calendario de vacunas y desparasitación',
          'Resumen de la guía: lo más importante'
        ],
        relatedApp: 'Planificador de Mascota',
        relatedAppUrl: '/planificador-mascota/',
        contextFromApp: 'Links a las 5 apps de mascotas, checklist descargable, calendario anual de cuidados'
      }
    ]
  }
];

async function generateChapterContent(chapter, moduleTitle) {
  const prompt = `Eres un veterinario y educador experto en cuidado de mascotas. Genera contenido para una guía online en español sobre el cuidado de perros y gatos.

CONTEXTO: Esta guía está dirigida a dueños de mascotas de TODOS LOS NIVELES, desde primerizos hasta experimentados. El enfoque debe ser:
- FÁCIL de entender (sin tecnicismos innecesarios)
- CERCANO y amigable (como un amigo que sabe de mascotas)
- PRÁCTICO (consejos que pueden aplicar hoy mismo)
- LIGERO (no abrumar con demasiada información)

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle} ${GUIDE_STRUCTURE.find(m => m.chapters.some(c => c.id === chapter.id))?.icon || ''}
TEMAS A CUBRIR: ${chapter.topics.join(', ')}
APP RELACIONADA: ${chapter.relatedApp} (${chapter.relatedAppUrl})
DATOS DE LA APP: ${chapter.contextFromApp}

INSTRUCCIONES IMPORTANTES:
1. Tono CERCANO y AMIGABLE: como un amigo veterinario que te aconseja
2. Información PRÁCTICA: consejos que se pueden aplicar inmediatamente
3. EJEMPLOS reales y situaciones cotidianas
4. Mencionar la app relacionada de meskeIA como herramienta útil
5. Evitar asustar con demasiadas advertencias (ser realista pero positivo)
6. Incluir tanto perros como gatos cuando aplique

Responde SOLO con un objeto JSON válido (sin texto adicional antes o después):

{
  "introduction": "Párrafo introductorio de 2-3 oraciones, cercano y que conecte con el lector. Nada de jerga técnica.",
  "sections": [
    {
      "title": "Título claro y directo",
      "content": "Contenido de la sección (200-250 palabras). Usar lenguaje sencillo, incluir ejemplos prácticos, consejos aplicables. Mencionar diferencias entre perros y gatos si es relevante.",
      "tip": "Un consejo práctico corto que el lector pueda recordar fácilmente"
    }
  ],
  "quickTips": ["Tip rápido 1 (una frase)", "Tip rápido 2", "Tip rápido 3", "Tip rápido 4"],
  "relatedTool": {
    "name": "${chapter.relatedApp}",
    "url": "${chapter.relatedAppUrl}",
    "description": "Una frase explicando cómo esta herramienta de meskeIA puede ayudarles"
  },
  "forDogs": "Un consejo específico para dueños de perros",
  "forCats": "Un consejo específico para dueños de gatos"
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones
- Asegúrate de que el JSON sea válido
- El contenido debe ser FÁCIL de leer y entender
- NO usar lenguaje técnico innecesario
- Máximo 4 secciones por capítulo (es una guía LIGERA)`;

  try {
    // Usar Haiku para generar borrador inicial
    console.log(`    → Generando borrador con Haiku...`);
    const draftResponse = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 3000,
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

    // Usar Sonnet para refinar y hacer más cercano
    console.log(`    → Refinando con Sonnet...`);
    const refinePrompt = `Eres un editor experto en contenido sobre mascotas, con mucha experiencia haciendo contenido accesible para todo público.

Revisa y mejora el siguiente contenido de una guía de cuidado de mascotas.

CONTENIDO ACTUAL:
${JSON.stringify(draft, null, 2)}

MEJORAS REQUERIDAS:
1. Asegúrate de que el tono sea CERCANO y AMIGABLE (como un amigo que sabe de mascotas)
2. Simplifica cualquier término técnico o jerga veterinaria
3. Añade ejemplos de la vida cotidiana si faltan
4. Verifica que los consejos sean PRÁCTICOS y APLICABLES hoy mismo
5. El contenido debe ser LIGERO: fácil de leer en 5-7 minutos máximo
6. Mantén un equilibrio entre perros y gatos

Responde SOLO con el JSON mejorado, manteniendo exactamente la misma estructura.`;

    const refineResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
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
      introduction: `Bienvenido al capítulo "${chapter.title}". Aquí encontrarás información práctica sobre ${chapter.topics[0].toLowerCase()}.`,
      sections: chapter.topics.map(topic => ({
        title: topic,
        content: `Esta sección trata sobre ${topic.toLowerCase()}. El contenido se está generando...`,
        tip: "Consejo en desarrollo"
      })),
      quickTips: ["Tip 1", "Tip 2", "Tip 3", "Tip 4"],
      relatedTool: {
        name: chapter.relatedApp,
        url: chapter.relatedAppUrl,
        description: "Herramienta útil para este tema"
      },
      forDogs: "Consejo para perros en desarrollo",
      forCats: "Consejo para gatos en desarrollo"
    };
  }
}

async function generateResourcesContent() {
  const prompt = `Eres un experto en cuidado de mascotas. Genera contenido para el capítulo final de una guía que resume todas las herramientas y recursos disponibles.

Este capítulo debe ser un RESUMEN PRÁCTICO de toda la guía, con links a las 5 apps de mascotas de meskeIA.

LAS 5 APPS DE MASCOTAS:
1. Planificador de Mascota (/planificador-mascota/) - Checklist completo para nuevos dueños
2. Calculadora de Alimentación (/calculadora-alimentacion-mascotas/) - Cuánto debe comer tu mascota
3. Calculadora de Medicamentos (/calculadora-medicamentos-mascotas/) - Dosis de antiparasitarios
4. Calculadora de Tamaño Adulto (/calculadora-tamano-adulto-perro/) - Predice cuánto pesará de adulto
5. Calculadora de Edad (/calculadora-edad-mascotas/) - Edad en años humanos

Responde SOLO con un objeto JSON válido:

{
  "introduction": "Párrafo introductorio celebrando que han completado la guía",
  "toolsSummary": [
    {
      "name": "Nombre de la app",
      "url": "/url-de-la-app/",
      "icon": "emoji relevante",
      "description": "Qué hace esta herramienta en una frase",
      "whenToUse": "Cuándo usar esta herramienta"
    }
  ],
  "checklistGoodOwner": ["Punto 1 del buen dueño", "Punto 2", "Punto 3", "Punto 4", "Punto 5", "Punto 6", "Punto 7", "Punto 8"],
  "annualCalendar": {
    "monthly": ["Qué hacer cada mes"],
    "quarterly": ["Qué hacer cada 3 meses"],
    "yearly": ["Qué hacer cada año"]
  },
  "guideSummary": ["Resumen punto 1 de toda la guía", "Resumen punto 2", "Resumen punto 3", "Resumen punto 4", "Resumen punto 5"],
  "finalMessage": "Mensaje final motivador para el dueño de mascota"
}`;

  try {
    console.log(`    → Generando recursos con Sonnet...`);
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
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
    console.error(`  Error generando recursos:`, error.message);
    return null;
  }
}

async function generateAllContent() {
  const allContent = {};
  let successCount = 0;
  let errorCount = 0;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  GUÍA: Cuidado de tu Mascota');
  console.log('  Generando contenido con Claude (Haiku + Sonnet)');
  console.log('  Público: Dueños de mascotas de todos los niveles');
  console.log('  Enfoque: Práctico, cercano, fácil de entender');
  console.log('═══════════════════════════════════════════════════════════════');

  for (const module of GUIDE_STRUCTURE) {
    console.log(`\n${module.icon} Módulo: ${module.title}`);
    allContent[module.module] = {
      title: module.title,
      icon: module.icon,
      chapters: {}
    };

    for (const chapter of module.chapters) {
      console.log(`  📖 Generando: ${chapter.title}...`);

      let content;
      if (chapter.id === 'herramientas') {
        // Recursos tiene estructura especial
        content = await generateResourcesContent();
      } else {
        content = await generateChapterContent(chapter, module.title);
      }

      if (content && (content.sections || content.toolsSummary)) {
        allContent[module.module].chapters[chapter.id] = {
          ...chapter,
          content
        };
        const sectionCount = content.sections ? content.sections.length : content.toolsSummary.length;
        console.log(`  ✅ Completado (${sectionCount} secciones)`);
        successCount++;
      } else {
        console.log(`  ⚠️ Contenido parcial`);
        errorCount++;
      }

      // Pausa entre llamadas para respetar rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Guardar contenido
  const outputPath = path.join(__dirname, 'guia-cuidado-mascota-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(allContent, null, 2), 'utf8');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  📊 Resumen: ${successCount} capítulos generados, ${errorCount} errores`);
  console.log(`  💾 Guardado en: ${outputPath}`);
  console.log('═══════════════════════════════════════════════════════════════');

  return allContent;
}

// Exportar estructura
module.exports = { GUIDE_STRUCTURE, generateAllContent };

// Ejecutar
if (require.main === module) {
  console.log('\n🚀 Iniciando generación de la "Guía para el Cuidado de tu Mascota"...\n');
  generateAllContent()
    .then(() => console.log('\n🎉 Proceso completado'))
    .catch(err => console.error('Error fatal:', err));
}
