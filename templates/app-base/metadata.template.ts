import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

// ─────────────────────────────────────────────────────────────────────────
// 🌎 LENGUAJE LATAM-FRIENDLY (OBLIGATORIO — nacer bien desde el origen)
// meskeIA sirve a todo el público hispanohablante (~50% del tráfico es Latam).
// Si tu app usa algún término que se dice distinto a cada lado del Atlántico,
// incluye AMBAS variantes de forma aditiva (nunca reemplaces la de España).
// Pares frecuentes en scripts/seo-latam/glosario-es-latam.json:
//   coche→carro/auto · móvil→celular · ordenador→computadora · portátil→laptop/notebook
//   piscina→alberca/pileta · alquiler→arriendo · tipo de interés→tasa de interés
//   tarta→torta/pastel · puerta lógica→compuerta lógica · nómina→planilla
// REGLA DE ORO — distingue dónde va cada término:
//   • Término-NÚCLEO (la keyword que la gente busca): ambas variantes en title/H1,
//     liderando por demanda. Ej. "Seguro de Coche, Carro o Auto".
//   • Descriptor-de-AUDIENCIA (bachillerato/EBAU/selectividad → preparatoria/
//     secundaria/educación media): NO lo metas en el H1; basta en keywords,
//     description y cuerpo. La keyword núcleo de un simulador STEM es universal.
// Apps fiscales-España estructurales (IRPF, RETA, nómina, ITP…): NO aplicar
// (público correcto = España; ver <RegionBadge variant="es-only" />).
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: '[Nombre App] - [Descripción Corta] | meskeIA',
  description: '[Descripción detallada 150-160 caracteres]',
  keywords: 'keyword1, keyword2, keyword3',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '[Título OG]',
    description: '[Descripción para redes sociales]',
    url: 'https://meskeia.com/[nombre-app]',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Título para Twitter]',
    description: '[Descripción para Twitter]',
  },
  other: {
    'application-name': 'Nombre App meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: '[Nombre App]',
  description: '[Descripción detallada de la app, qué hace y para quién es útil]',
  url: 'https://meskeia.com/[nombre-app]/',
  features: [
    '[Característica principal 1]',
    '[Característica principal 2]',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿[Pregunta real que haría un usuario sobre esta app]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta 2-4 frases con datos concretos]' },
    },
    {
      '@type': 'Question',
      name: '¿[Cómo funciona / qué calcula / para quién es útil]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
    {
      '@type': 'Question',
      name: '¿[Diferencia con alternativas / dato clave]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
    {
      '@type': 'Question',
      name: '¿[Pregunta sobre nivel educativo / audiencia objetivo]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
    {
      '@type': 'Question',
      name: '¿[Pregunta técnica o conceptual específica del tema]?',
      acceptedAnswer: { '@type': 'Answer', text: '[Respuesta]' },
    },
  ],
};
