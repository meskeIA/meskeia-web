import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador del Hígado | Funciones, Detoxificación y Metabolismo | meskeIA',
  description: 'Explora el hígado como laboratorio del cuerpo: detoxificación (fases 1 y 2), metabolismo de glucosa y lípidos, síntesis de proteínas y producción de bilis.',
  keywords: ['hígado', 'detoxificación', 'metabolismo', 'bilis', 'glucógeno', 'albúmina', 'colesterol', 'CYP450'],
  openGraph: {
    title: 'Visualizador del Hígado | meskeIA',
    description: 'El hígado como laboratorio del cuerpo: 500+ funciones vitales explicadas de forma visual e interactiva.',
    url: 'https://meskeia.com/visualizador-higado/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "El Hígado - Detoxificación y Metabolismo",
  description: "Explora el hígado como laboratorio del cuerpo: detoxificación (fases 1 y 2), metabolismo de glucosa y lípidos, síntesis de proteínas y producción de bilis.",
  url: "https://meskeia.com/visualizador-higado/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las funciones principales del hígado en el cuerpo humano?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hígado realiza más de 500 funciones vitales. Entre las principales destacan: detoxificación de sustancias nocivas (medicamentos, alcohol, toxinas ambientales), metabolismo de carbohidratos (almacena glucógeno y regula la glucemia), metabolismo lipídico (sintetiza colesterol, triglicéridos y lipoproteínas), síntesis de proteínas plasmáticas (albúmina, factores de coagulación), producción de bilis para la digestión de grasas, y regulación de hormonas. Es el mayor órgano interno del cuerpo, con un peso de 1,4-1,6 kg en adultos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la detoxificación hepática en fases 1 y 2?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La detoxificación hepática tiene dos fases principales. En la fase 1, las enzimas del sistema citocromo P450 (CYP450) oxidan, reducen o hidrolizan las sustancias tóxicas para hacerlas más reactivas; en este proceso pueden generarse intermediarios temporalmente más tóxicos. En la fase 2, esos intermediarios se conjugan con moléculas como el glutatión, el ácido glucurónico o los sulfatos, formando compuestos hidrosolubles que se eliminan por la bilis o la orina. Si la fase 1 es más rápida que la fase 2, pueden acumularse intermediarios dañinos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel juega el hígado en la regulación del azúcar en sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El hígado es el principal regulador de la glucemia entre comidas. Después de comer, absorbe glucosa del portal y la almacena como glucógeno (glucogénesis). En ayunas o entre comidas, libera glucosa al torrente sanguíneo degradando el glucógeno (glucogenólisis). Si las reservas de glucógeno se agotan, puede fabricar glucosa nueva a partir de aminoácidos o lactato (gluconeogénesis). Esta función tampón evita tanto la hipoglucemia como picos excesivos de glucosa, siendo crítica en la diabetes y el ayuno prolongado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la bilis y por qué la produce el hígado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La bilis es un fluido amarillo-verdoso producido por los hepatocitos del hígado a razón de 600-1000 ml diarios. Está compuesta principalmente de sales biliares, bilirrubina (producto de la degradación de los glóbulos rojos), colesterol, fosfolípidos y agua. Su función principal es emulsionar las grasas en el intestino delgado, facilitando su digestión y absorción por las lipasas pancreáticas. También actúa como vía de excreción para sustancias que no pueden eliminarse por la orina, como la bilirrubina o algunos medicamentos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre hígado graso, hepatitis y cirrosis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Son tres estadios de daño hepático de gravedad creciente. El hígado graso (esteatosis) implica acumulación excesiva de lípidos en los hepatocitos, generalmente reversible con cambios en la alimentación y el ejercicio. La hepatitis es una inflamación activa del tejido hepático, que puede ser viral (VHB, VHC), alcohólica, autoinmune o por fármacos; si se cronifica, puede avanzar. La cirrosis es una fibrosis avanzada e irreversible donde el tejido hepático sano es sustituido por tejido cicatricial, comprometiendo gravemente las funciones del órgano y pudiendo derivar en insuficiencia hepática o carcinoma hepatocelular.',
      },
    },
  ],
};
