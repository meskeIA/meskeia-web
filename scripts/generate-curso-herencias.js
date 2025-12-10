/**
 * Script para generar contenido del Curso "Herencias Paso a Paso"
 * usando la API de Anthropic (Claude)
 *
 * Ejecutar: node scripts/generate-curso-herencias.js
 *
 * Este curso está orientado a personas que, de forma ocasional,
 * se encuentran ante la necesidad de tramitar una herencia.
 * El contenido debe ser claro, práctico y accesible.
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Estructura del curso - 7 capítulos sobre tramitación de herencias
// Estructura ligera orientada a particulares, no profesionales
const COURSE_STRUCTURE = [
  {
    module: 'primeros-pasos',
    title: 'Primeros Pasos',
    chapters: [
      {
        id: 'que-hacer-primero',
        title: '¿Qué Hacer en los Primeros Días?',
        topics: ['Las primeras 48 horas tras el fallecimiento', 'Documentos urgentes a obtener', 'Certificado de defunción', 'A quién avisar y en qué orden'],
        duration: 10,
        linkedTools: []
      },
      {
        id: 'existe-testamento',
        title: '¿Existe Testamento?',
        topics: ['Cómo averiguar si hay testamento', 'El certificado de últimas voluntades', 'Tipos de testamento: abierto, cerrado, ológrafo', 'Qué pasa si no hay testamento (abintestato)'],
        duration: 12,
        linkedTools: []
      }
    ]
  },
  {
    module: 'herederos',
    title: 'Los Herederos',
    chapters: [
      {
        id: 'quienes-heredan',
        title: '¿Quiénes Son los Herederos?',
        topics: ['Herederos con testamento vs sin testamento', 'Orden de sucesión legal', 'La legítima: qué es y a quién corresponde', 'Derechos del cónyuge viudo'],
        duration: 12,
        linkedTools: []
      },
      {
        id: 'aceptar-renunciar',
        title: 'Aceptar o Renunciar a la Herencia',
        topics: ['Diferencia entre aceptar y renunciar', 'Aceptación pura vs beneficio de inventario', 'Cuándo conviene renunciar', 'Plazos y formalidades'],
        duration: 10,
        linkedTools: []
      }
    ]
  },
  {
    module: 'inventario',
    title: 'El Inventario',
    chapters: [
      {
        id: 'bienes-deudas',
        title: 'Inventario de Bienes y Deudas',
        topics: ['Qué incluir en el inventario', 'Cómo valorar los bienes', 'Investigar deudas del fallecido', 'El ajuar doméstico'],
        duration: 12,
        linkedTools: [
          { name: 'Guía Tramitación Herencias', url: '/guia-tramitacion-herencias/', icon: '📋', desc: 'Checklist completo de documentos' }
        ]
      }
    ]
  },
  {
    module: 'impuestos',
    title: 'Los Impuestos',
    chapters: [
      {
        id: 'impuesto-sucesiones',
        title: 'El Impuesto de Sucesiones',
        topics: ['Qué es y cuándo se paga', 'Plazos: los 6 meses críticos', 'Diferencias entre comunidades autónomas', 'Bonificaciones y reducciones principales'],
        duration: 15,
        linkedTools: [
          { name: 'Calculadora Sucesiones Nacional', url: '/calculadora-sucesiones-nacional/', icon: '🇪🇸', desc: 'Calcula el impuesto en 14 CCAA' },
          { name: 'Calculadora Sucesiones Cataluña', url: '/calculadora-sucesiones-cataluna/', icon: '🏴', desc: 'Normativa específica catalana' }
        ]
      },
      {
        id: 'plusvalia-otros',
        title: 'Plusvalía Municipal y Otros Gastos',
        topics: ['Qué es la plusvalía municipal', 'Cuándo se paga y cómo calcularla', 'Costes de notaría y registro', 'Gastos de gestoría (opcional)'],
        duration: 12,
        linkedTools: [
          { name: 'Guía Tramitación Herencias', url: '/guia-tramitacion-herencias/', icon: '💰', desc: 'Costes orientativos' }
        ]
      }
    ]
  },
  {
    module: 'tramites-finales',
    title: 'Trámites Finales',
    chapters: [
      {
        id: 'escritura-registro',
        title: 'La Escritura y el Registro',
        topics: ['Escritura de aceptación y adjudicación', 'Qué documentos llevar al notario', 'Inscripción en el Registro de la Propiedad', 'Cambio de titularidad en bancos y vehículos'],
        duration: 12,
        linkedTools: [
          { name: 'Guía Tramitación Herencias', url: '/guia-tramitacion-herencias/', icon: '📝', desc: 'Orden de gestiones paso a paso' }
        ]
      }
    ]
  },
  {
    module: 'glosario',
    title: 'Glosario y Recursos',
    chapters: [
      {
        id: 'glosario-herencias',
        title: 'Glosario de Términos',
        topics: ['Términos legales explicados de forma sencilla', 'Abintestato, legítima, usufructo...', 'Documentos más habituales', 'Preguntas frecuentes'],
        duration: 10,
        linkedTools: [
          { name: 'Guía Tramitación Herencias', url: '/guia-tramitacion-herencias/', icon: '📋', desc: 'Herramienta interactiva completa' },
          { name: 'Calculadora Sucesiones Nacional', url: '/calculadora-sucesiones-nacional/', icon: '🇪🇸', desc: 'Impuesto en 14 CCAA' },
          { name: 'Calculadora Sucesiones Cataluña', url: '/calculadora-sucesiones-cataluna/', icon: '🏴', desc: 'Normativa catalana' }
        ]
      }
    ]
  }
];

// Glosario de términos para incluir en el último capítulo
const GLOSARIO_TERMINOS = [
  { termino: 'Abintestato', definicion: 'Herencia sin testamento. La ley determina quiénes heredan.' },
  { termino: 'Aceptación a beneficio de inventario', definicion: 'Aceptar la herencia limitando la responsabilidad por deudas al valor de los bienes heredados.' },
  { termino: 'Acta de notoriedad', definicion: 'Documento notarial que declara quiénes son los herederos cuando no hay testamento.' },
  { termino: 'Ajuar doméstico', definicion: 'Bienes muebles de uso personal y del hogar. Se valora en un 3% del caudal hereditario.' },
  { termino: 'Base imponible', definicion: 'Valor sobre el que se calcula el impuesto, tras aplicar ciertas deducciones.' },
  { termino: 'Caudal hereditario', definicion: 'Conjunto de bienes, derechos y obligaciones que componen la herencia.' },
  { termino: 'Causante', definicion: 'Persona fallecida que deja la herencia.' },
  { termino: 'Certificado de defunción', definicion: 'Documento oficial que acredita el fallecimiento.' },
  { termino: 'Certificado de últimas voluntades', definicion: 'Documento que indica si existe testamento y ante qué notario se otorgó.' },
  { termino: 'Cuaderno particional', definicion: 'Documento donde se detalla el reparto de la herencia entre los herederos.' },
  { termino: 'Heredero forzoso', definicion: 'Persona que tiene derecho a una parte de la herencia por ley (hijos, ascendientes, cónyuge).' },
  { termino: 'Heredero universal', definicion: 'Persona que hereda la totalidad o una parte proporcional del patrimonio.' },
  { termino: 'Legatario', definicion: 'Persona que recibe un bien concreto por testamento, sin asumir deudas.' },
  { termino: 'Legítima', definicion: 'Parte de la herencia que la ley reserva a los herederos forzosos.' },
  { termino: 'Nuda propiedad', definicion: 'Derecho a ser propietario de un bien, pero sin poder usarlo ni disfrutarlo.' },
  { termino: 'Plusvalía municipal', definicion: 'Impuesto sobre el incremento de valor de terrenos urbanos al transmitirse.' },
  { termino: 'Testamento abierto', definicion: 'Testamento otorgado ante notario, quien conserva el original.' },
  { termino: 'Testamento ológrafo', definicion: 'Testamento escrito de puño y letra por el testador, sin notario.' },
  { termino: 'Usufructo', definicion: 'Derecho a usar y disfrutar un bien ajeno sin ser propietario.' },
  { termino: 'Usufructo viudal', definicion: 'Derecho del cónyuge viudo a usar y disfrutar parte de la herencia.' }
];

async function generateChapterContent(chapter, moduleTitle) {
  const isGlosario = chapter.id === 'glosario-herencias';

  // Prompt especial para el glosario
  if (isGlosario) {
    return {
      introduction: 'A lo largo de este curso hemos utilizado términos legales que pueden resultar poco familiares. En este capítulo final, encontrarás un glosario completo con las definiciones explicadas de forma sencilla, además de respuestas a las preguntas más frecuentes sobre herencias.',
      sections: [
        {
          title: 'Glosario de Términos',
          content: 'Consulta este glosario siempre que encuentres un término que no comprendas. Están ordenados alfabéticamente para facilitar su búsqueda.',
          terms: GLOSARIO_TERMINOS
        },
        {
          title: 'Preguntas Frecuentes',
          content: 'Recopilamos las dudas más habituales de las personas que se enfrentan a tramitar una herencia.',
          faqs: [
            { pregunta: '¿Cuánto tiempo tengo para tramitar la herencia?', respuesta: 'El plazo crítico es de 6 meses para el Impuesto de Sucesiones y la Plusvalía Municipal. Sin embargo, la herencia en sí no prescribe.' },
            { pregunta: '¿Necesito abogado obligatoriamente?', respuesta: 'No es obligatorio por ley, pero es muy recomendable en herencias complejas, con conflictos entre herederos o bienes en varios países.' },
            { pregunta: '¿Puedo acceder al dinero del fallecido para pagar el entierro?', respuesta: 'Los bancos suelen permitir disponer de cantidades limitadas para gastos de sepelio previa presentación de facturas, pero el resto queda bloqueado hasta la adjudicación.' },
            { pregunta: '¿Qué pasa si hay más deudas que bienes?', respuesta: 'Puedes renunciar a la herencia o aceptarla a beneficio de inventario, lo que limita tu responsabilidad al valor de lo heredado.' },
            { pregunta: '¿Puedo heredar si vivo fuera de España?', respuesta: 'Sí, aunque los trámites pueden complicarse. Es recomendable otorgar poder notarial a alguien de confianza en España.' }
          ]
        },
        {
          title: 'Herramientas de meskeIA para Ayudarte',
          content: 'En meskeIA hemos creado varias herramientas gratuitas para facilitar la tramitación de tu herencia. Úsalas para calcular impuestos, consultar documentación necesaria y seguir los pasos en orden.',
          isToolsSection: true
        }
      ],
      keyIdeas: [
        'Este glosario te ayudará a entender la terminología legal',
        'Consulta las preguntas frecuentes ante cualquier duda',
        'Usa las herramientas de meskeIA para calcular impuestos',
        'Ante dudas complejas, consulta siempre con un profesional'
      ],
      reflectionQuestions: [],
      curiosity: 'En España se tramitan más de 400.000 herencias cada año. La mayoría se resuelven sin conflictos cuando los herederos están bien informados.'
    };
  }

  const prompt = `Eres un experto en derecho sucesorio español, especializado en explicar conceptos legales de forma accesible para el público general. Genera contenido educativo para un capítulo de un curso online sobre tramitación de herencias.

CONTEXTO: Este curso está dirigido a personas que, de forma ocasional y generalmente inesperada, se encuentran ante la necesidad de tramitar una herencia. NO es un curso para profesionales, sino para ciudadanos que necesitan entender el proceso.

CAPÍTULO: ${chapter.title}
MÓDULO: ${moduleTitle}
TEMAS A CUBRIR: ${chapter.topics.join(', ')}

INSTRUCCIONES:
- Escribe en español, de forma clara y cercana
- Usa ejemplos cotidianos que cualquier persona pueda entender
- Evita jerga legal innecesaria; cuando uses términos técnicos, explícalos
- Sé práctico: el lector quiere saber QUÉ hacer, no teoría abstracta
- Incluye consejos útiles y advertencias sobre errores comunes
- El tono debe ser tranquilizador (las herencias generan estrés)

Responde SOLO con un objeto JSON válido (sin texto adicional antes o después):

{
  "introduction": "Párrafo introductorio empático de 2-3 oraciones que conecte con la situación del lector",
  "sections": [
    {
      "title": "Título sección 1",
      "content": "Contenido extenso de la sección con varios párrafos explicativos...",
      "tip": "Un consejo práctico relacionado con esta sección"
    },
    {
      "title": "Título sección 2",
      "content": "Contenido extenso...",
      "tip": "Otro consejo útil"
    },
    {
      "title": "Título sección 3",
      "content": "Contenido extenso...",
      "warning": "Una advertencia importante si aplica (opcional)"
    }
  ],
  "keyIdeas": ["Idea clave 1", "Idea clave 2", "Idea clave 3", "Idea clave 4"],
  "reflectionQuestions": ["Pregunta práctica 1 para que el lector aplique a su caso", "Pregunta 2"],
  "curiosity": "Un dato curioso o información poco conocida sobre herencias en España"
}

IMPORTANTE:
- Responde ÚNICAMENTE con el JSON, sin markdown ni explicaciones
- Asegúrate de que el JSON sea válido (comillas dobles, sin comas finales)
- El contenido de cada sección debe tener mínimo 150 palabras
- Cada sección debe tener "tip" o "warning" (no ambos)`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
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

    return JSON.parse(text);
  } catch (error) {
    console.error(`  Error generando ${chapter.id}:`, error.message);
    // Devolver contenido placeholder en caso de error
    return {
      introduction: `Bienvenido al capítulo "${chapter.title}". En esta sección abordaremos los aspectos más importantes relacionados con ${chapter.topics[0].toLowerCase()}.`,
      sections: chapter.topics.map((topic, idx) => ({
        title: topic,
        content: `Esta sección aborda ${topic.toLowerCase()}. El contenido detallado se está generando...`,
        tip: idx === 0 ? 'Consejo en desarrollo.' : undefined,
        warning: idx === 1 ? 'Advertencia en desarrollo.' : undefined
      })),
      keyIdeas: ['Concepto en desarrollo', 'Aplicación práctica', 'Reflexión importante'],
      reflectionQuestions: ['¿Cómo aplica esto a tu situación?', '¿Qué documentos necesitas?'],
      curiosity: 'Dato curioso en desarrollo.'
    };
  }
}

async function generateAllContent() {
  const allContent = {};
  let successCount = 0;
  let errorCount = 0;

  console.log('📚 Generando contenido del curso "Herencias Paso a Paso"');
  console.log('═'.repeat(50));

  for (const module of COURSE_STRUCTURE) {
    console.log(`\n📁 Módulo: ${module.title}`);
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

      // Pausa entre llamadas para evitar rate limiting
      if (chapter.id !== 'glosario-herencias') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // Guardar contenido generado
  const outputPath = path.join(__dirname, 'curso-herencias-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(allContent, null, 2), 'utf8');

  console.log('\n' + '═'.repeat(50));
  console.log(`📊 Resumen: ${successCount} éxitos, ${errorCount} errores`);
  console.log(`💾 Guardado en: ${outputPath}`);

  return allContent;
}

// Exportar estructura y función
module.exports = { COURSE_STRUCTURE, GLOSARIO_TERMINOS, generateAllContent };

// Ejecutar si se llama directamente
if (require.main === module) {
  console.log('🚀 Iniciando generación del curso "Herencias Paso a Paso"...\n');
  generateAllContent()
    .then(() => console.log('\n🎉 Proceso completado'))
    .catch(err => console.error('Error fatal:', err));
}
