/**
 * Script para generar contenido del Curso de Pensamiento Sistémico
 * usando la API de Anthropic (Claude)
 *
 * Este curso enseña a entender el mundo como sistemas interconectados,
 * con aplicaciones prácticas en organizaciones, economía, tecnología y vida personal.
 *
 * Basado en la Teoría General de Sistemas actualizada para 2025.
 *
 * Ejecutar: node scripts/generate-curso-pensamiento-sistemico.js
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Estructura del curso - 4 módulos, 20 capítulos
const COURSE_STRUCTURE = [
  {
    module: 'fundamentos',
    title: 'Fundamentos del Pensamiento Sistémico',
    description: 'Historia, orígenes y relevancia actual del enfoque sistémico',
    chapters: [
      {
        id: 'que-es-pensamiento-sistemico',
        title: '¿Qué es el Pensamiento Sistémico?',
        topics: [
          'Definición y origen del concepto',
          'Diferencia entre pensamiento lineal y sistémico',
          'El todo es más que la suma de las partes',
          'Por qué necesitamos pensar en sistemas hoy'
        ],
        duration: 12
      },
      {
        id: 'historia-sistemas',
        title: 'Breve Historia del Pensamiento Sistémico',
        topics: [
          'Antecedentes filosóficos: de Aristóteles al holismo',
          'Ludwig von Bertalanffy y la Teoría General de Sistemas',
          'La cibernética de Norbert Wiener',
          'Del reduccionismo al pensamiento complejo'
        ],
        duration: 15
      },
      {
        id: 'reduccionismo-vs-holismo',
        title: 'Reduccionismo vs. Holismo',
        topics: [
          'El método científico reduccionista y sus límites',
          'Problemas que no se pueden descomponer',
          'El enfoque holístico como complemento',
          'Cuándo usar cada aproximación'
        ],
        duration: 12
      },
      {
        id: 'relevancia-siglo-xxi',
        title: 'Relevancia en el Siglo XXI',
        topics: [
          'Globalización e interdependencia',
          'Crisis sistémicas: pandemia, clima, economía',
          'Tecnología e hiperconectividad',
          'La era de la complejidad'
        ],
        duration: 14
      }
    ]
  },
  {
    module: 'conceptos-clave',
    title: 'Conceptos Clave',
    description: 'Herramientas conceptuales para analizar sistemas',
    chapters: [
      {
        id: 'elementos-sistemas',
        title: 'Elementos de un Sistema',
        topics: [
          'Componentes, relaciones y fronteras',
          'Subsistemas y metasistemas',
          'Escalas: micro, meso y macro',
          'Identificar sistemas en tu entorno'
        ],
        duration: 14
      },
      {
        id: 'redes-conexiones',
        title: 'Redes y Conexiones',
        topics: [
          'Teoría de redes básica',
          'Nodos, enlaces y topologías',
          'Redes aleatorias vs. redes de mundo pequeño',
          'El poder de los conectores (hubs)'
        ],
        duration: 15
      },
      {
        id: 'retroalimentacion',
        title: 'Retroalimentación y Dinámica',
        topics: [
          'Bucles de retroalimentación positiva y negativa',
          'Efectos amplificadores y estabilizadores',
          'Puntos de inflexión y cambios no lineales',
          'Ejemplos: termostatos, mercados, ecosistemas'
        ],
        duration: 16
      },
      {
        id: 'emergencia-autoorganizacion',
        title: 'Emergencia y Autoorganización',
        topics: [
          'Propiedades emergentes: qué son y cómo surgen',
          'La inteligencia colectiva de las hormigas',
          'Autoorganización sin control central',
          'Emergencia en sistemas sociales y tecnológicos'
        ],
        duration: 14
      },
      {
        id: 'informacion-complejidad',
        title: 'Información y Complejidad',
        topics: [
          'Información como medida del cambio',
          'Qué hace complejo a un sistema',
          'Complejidad vs. complicación',
          'Gestionar la incertidumbre'
        ],
        duration: 13
      },
      {
        id: 'fragilidad-antifragilidad',
        title: 'Fragilidad, Robustez y Antifragilidad',
        topics: [
          'Sistemas frágiles: rompen con el cambio',
          'Sistemas robustos: resisten el cambio',
          'Sistemas antifrágiles: mejoran con el estrés',
          'Diseñar para la antifragilidad'
        ],
        duration: 15
      }
    ]
  },
  {
    module: 'sistemas-accion',
    title: 'Sistemas en Acción',
    description: 'Aplicaciones prácticas en diferentes dominios',
    chapters: [
      {
        id: 'sistemas-biologicos',
        title: 'Sistemas Biológicos',
        topics: [
          'El cuerpo humano como sistema de sistemas',
          'El microbioma y la salud sistémica',
          'Ecosistemas y equilibrio ecológico',
          'La mente extendida: más allá del cerebro'
        ],
        duration: 14
      },
      {
        id: 'organizaciones-empresas',
        title: 'Organizaciones y Empresas',
        topics: [
          'La empresa como sistema adaptativo',
          'Cultura organizacional emergente',
          'Jerarquías vs. redes distribuidas',
          'La tragedia de los comunes en organizaciones'
        ],
        duration: 16
      },
      {
        id: 'economia-mercados',
        title: 'Economía y Mercados',
        topics: [
          'Mercados como sistemas complejos',
          'Crisis financieras: cascadas sistémicas',
          'Criptoeconomías y sistemas descentralizados',
          'Economía circular y sostenibilidad'
        ],
        duration: 15
      },
      {
        id: 'ciudades-sociedades',
        title: 'Ciudades y Sociedades',
        topics: [
          'La ciudad como organismo vivo',
          'Ciudades inteligentes y IoT',
          'Dinámicas sociales y polarización',
          'Epidemias: lecciones sistémicas del COVID-19'
        ],
        duration: 15
      },
      {
        id: 'tecnologia-ia',
        title: 'Tecnología e Inteligencia Artificial',
        topics: [
          'Internet como sistema de sistemas',
          'Redes neuronales y emergencia en IA',
          'Sistemas sociotécnicos',
          'Riesgos sistémicos de la tecnología'
        ],
        duration: 14
      },
      {
        id: 'cambio-climatico',
        title: 'Cambio Climático: El Reto Sistémico Global',
        topics: [
          'El clima como sistema complejo',
          'Puntos de inflexión climáticos',
          'Interconexión de sistemas naturales y humanos',
          'Soluciones sistémicas vs. soluciones aisladas'
        ],
        duration: 14
      }
    ]
  },
  {
    module: 'aplicacion-practica',
    title: 'Pensamiento Sistémico Aplicado',
    description: 'Herramientas y métodos para aplicar el pensamiento sistémico',
    chapters: [
      {
        id: 'herramientas-analisis',
        title: 'Herramientas de Análisis Sistémico',
        topics: [
          'Diagramas causales y mapas sistémicos',
          'Identificar bucles de retroalimentación',
          'Arquetipos sistémicos comunes',
          'Simulación y modelado básico'
        ],
        duration: 16
      },
      {
        id: 'toma-decisiones',
        title: 'Toma de Decisiones Sistémica',
        topics: [
          'Evitar soluciones que crean nuevos problemas',
          'Identificar puntos de apalancamiento',
          'Pensar en consecuencias de segundo orden',
          'Decidir bajo incertidumbre'
        ],
        duration: 15
      },
      {
        id: 'liderazgo-sistemico',
        title: 'Liderazgo y Cambio Sistémico',
        topics: [
          'El líder como facilitador de sistemas',
          'Cambiar las reglas del juego',
          'Fomentar cooperación vs. competencia',
          'Gestionar sistemas que no puedes controlar'
        ],
        duration: 14
      },
      {
        id: 'pensamiento-sistemico-vida',
        title: 'Pensamiento Sistémico en tu Vida',
        topics: [
          'Tu vida como sistema interconectado',
          'Salud, trabajo, relaciones: todo está conectado',
          'Pequeños cambios, grandes efectos',
          'Cultivar una mentalidad sistémica'
        ],
        duration: 12
      }
    ]
  }
];

async function generateChapterContent(chapter, moduleTitle) {
  const prompt = `Eres un experto en pensamiento sistémico, teoría de sistemas complejos y ciencias de la complejidad. Tienes profundo conocimiento de autores como Ludwig von Bertalanffy, Norbert Wiener, Donella Meadows, Peter Senge, Nassim Taleb y Edgar Morin.

CONTEXTO: Este es un curso educativo sobre Pensamiento Sistémico actualizado para 2025. El público objetivo son profesionales, emprendedores y estudiantes hispanohablantes que quieren entender mejor cómo funcionan los sistemas complejos y aplicar este conocimiento en su vida y trabajo.

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle}
TEMAS A CUBRIR: ${chapter.topics.join(', ')}

INSTRUCCIONES CRÍTICAS:
1. El contenido debe ser 100% ORIGINAL - no copies ni parafrasees material existente
2. Usa ejemplos ACTUALES (2020-2025): IA generativa, criptoeconomías, post-pandemia, crisis climática
3. Incluye ejemplos relevantes para hispanohablantes (empresas españolas/latinoamericanas, contextos locales)
4. Sé específico y profundo, no genérico
5. Conecta conceptos abstractos con aplicaciones prácticas cotidianas
6. El tono debe ser profesional pero accesible, como una conversación inteligente

EVITAR ABSOLUTAMENTE:
- Contenido genérico de enciclopedia
- Definiciones textuales de otras fuentes
- Ejemplos anticuados o poco relevantes
- Teoría sin aplicación práctica

Responde SOLO con un objeto JSON válido (sin texto adicional antes o después):

{
  "introduction": "Párrafo introductorio de 4-5 oraciones que enganche al lector. Debe incluir una pregunta provocadora, un dato sorprendente o una situación identificable. Conecta con la vida real del lector.",
  "sections": [
    {
      "title": "Título de la sección (atractivo, no genérico)",
      "content": "Contenido extenso de la sección (MÍNIMO 300 palabras). Estructura: contexto del concepto, explicación clara, mecanismo de funcionamiento, implicaciones. Usa analogías cotidianas cuando ayuden. Incluye matices y complejidades, no simplificaciones excesivas.",
      "example": "Ejemplo CONCRETO y ACTUAL (2020-2025). Describe una situación real, un caso empresarial, un evento histórico reciente o una experiencia cotidiana que ilustre el concepto. Debe ser específico, no hipotético genérico."
    }
  ],
  "keyIdeas": [
    "Idea clave 1: Una oración completa que capture un insight importante del capítulo",
    "Idea clave 2: Conexión práctica con la toma de decisiones",
    "Idea clave 3: Principio sistémico fundamental",
    "Idea clave 4: Advertencia o trampa común a evitar",
    "Idea clave 5: Visión hacia el futuro o tendencia"
  ],
  "actionItems": [
    "Ejercicio práctico 1: Algo que el lector puede hacer HOY para practicar el concepto",
    "Ejercicio práctico 2: Una observación o análisis de su entorno",
    "Ejercicio práctico 3: Una reflexión o cambio de perspectiva"
  ],
  "reflectionQuestions": [
    "Pregunta de reflexión 1: Invita al lector a conectar con su experiencia personal",
    "Pregunta de reflexión 2: Promueve el pensamiento crítico sobre el tema",
    "Pregunta de reflexión 3: Conecta este tema con otros del curso o con el panorama general"
  ],
  "connections": {
    "previousConcepts": ["Concepto del curso que se conecta hacia atrás"],
    "nextConcepts": ["Concepto que se verá adelante y se anticipa"],
    "relatedFields": ["Campo o disciplina donde este concepto también aplica"]
  },
  "curiosity": "Un dato sorprendente, descubrimiento reciente (2020-2025), paradoja interesante o predicción fundamentada sobre el tema. Debe ser memorable y compartible."
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones
- Asegúrate de que el JSON sea válido (comillas dobles, sin comas finales)
- Cada sección debe tener MÍNIMO 300 palabras de contenido rico y profundo
- Los ejemplos deben ser ESPECÍFICOS y ACTUALES, no genéricos
- Incluye datos, cifras y referencias cuando sea posible`;

  try {
    // Usar Haiku para generar borrador inicial (más rápido y económico)
    console.log(`    → Generando borrador con Haiku...`);
    const draftResponse = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 6000,
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
    const refinePrompt = `Eres un editor experto en contenido educativo sobre sistemas complejos y pensamiento sistémico.

Revisa y MEJORA SIGNIFICATIVAMENTE el siguiente contenido de un curso sobre Pensamiento Sistémico.

CONTENIDO ACTUAL:
${JSON.stringify(draft, null, 2)}

MEJORAS REQUERIDAS:
1. EXTENSIÓN: Cada sección debe tener al menos 350 palabras de contenido rico y profundo
2. ORIGINALIDAD: Reescribe para que suene fresco, no como material de curso genérico
3. ACTUALIZACIÓN: Verifica que ejemplos y referencias sean actuales (2020-2025)
4. PROFUNDIDAD: Añade matices, conexiones no obvias, insights únicos
5. ACCESIBILIDAD: Mantén el tono profesional pero cercano, sin jerga innecesaria
6. EJEMPLOS: Asegúrate de que cada ejemplo sea específico, actual y relevante para hispanohablantes
7. APLICABILIDAD: Los action items deben ser realmente accionables, no genéricos

CRITERIOS DE CALIDAD:
- ¿Un profesional compartiría este contenido con colegas?
- ¿Aporta perspectivas que no se encuentran fácilmente en Google?
- ¿Los ejemplos son memorables y específicos?
- ¿El lector puede aplicar esto mañana?

Responde SOLO con el JSON mejorado, manteniendo exactamente la misma estructura.`;

    const refineResponse = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
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
      keyIdeas: ["Concepto en desarrollo", "Aplicación práctica", "Reflexión crítica", "Conexión sistémica", "Visión futura"],
      actionItems: ["Ejercicio de observación", "Análisis de tu entorno", "Reflexión personal"],
      reflectionQuestions: ["¿Qué sistemas identificas en tu vida?", "¿Cómo aplicarías esto?", "¿Qué conexiones ves?"],
      connections: {
        previousConcepts: ["Conceptos previos"],
        nextConcepts: ["Próximos temas"],
        relatedFields: ["Campos relacionados"]
      },
      curiosity: "Dato curioso en desarrollo."
    };
  }
}

async function generateAllContent() {
  const allContent = {
    courseMeta: {
      name: 'Curso de Pensamiento Sistémico',
      slug: 'curso-pensamiento-sistemico',
      description: 'Aprende a entender el mundo como sistemas interconectados',
      icon: '🔄',
      generatedAt: new Date().toISOString(),
      totalChapters: 20,
      totalModules: 4
    },
    modules: {}
  };

  let successCount = 0;
  let errorCount = 0;

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CURSO: Pensamiento Sistémico');
  console.log('  Generando contenido con Claude (Haiku + Sonnet)');
  console.log('  Total: 4 módulos, 20 capítulos');
  console.log('═══════════════════════════════════════════════════════════════');

  for (const module of COURSE_STRUCTURE) {
    console.log(`\n📚 Módulo: ${module.title} (${module.chapters.length} capítulos)`);
    allContent.modules[module.module] = {
      title: module.title,
      description: module.description,
      chapters: {}
    };

    for (const chapter of module.chapters) {
      console.log(`  📖 Generando: ${chapter.title}...`);
      const content = await generateChapterContent(chapter, module.title);

      if (content && content.sections && content.sections.length > 0) {
        allContent.modules[module.module].chapters[chapter.id] = {
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
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
  }

  // Guardar contenido
  const outputPath = path.join(__dirname, 'curso-pensamiento-sistemico-content.json');
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
  console.log('\n🚀 Iniciando generación del curso "Pensamiento Sistémico"...\n');
  generateAllContent()
    .then(() => console.log('\n🎉 Proceso completado'))
    .catch(err => console.error('Error fatal:', err));
}
