import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de tazas a gramos por ingrediente | meskeIA',
  description:
    'Convierte tazas, cucharadas y cucharaditas a gramos según el ingrediente: la harina, el azúcar y los líquidos no pesan lo mismo. Ideal para recetas en tazas. Gratis y en español.',
  keywords:
    'tazas a gramos, cuántos gramos tiene una taza de harina, convertir tazas a gramos, taza de azúcar en gramos, cucharada a gramos, conversor cocina, medidas de repostería',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de tazas a gramos por ingrediente',
    description:
      'Una taza de harina no pesa lo mismo que una de azúcar. Convierte tazas y cucharadas a gramos con el peso real de cada ingrediente.',
    url: 'https://meskeia.com/conversor-tazas-gramos',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de tazas a gramos por ingrediente',
    description:
      'Convierte tazas, cucharadas y cucharaditas a gramos según el ingrediente. Recetas en tazas, sin liarte.',
  },
  other: {
    'application-name': 'Conversor tazas a gramos meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/conversor-tazas-gramos/' },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Conversor de tazas a gramos por ingrediente',
  description:
    'Convierte medidas de volumen (tazas, cucharadas, cucharaditas) a gramos teniendo en cuenta el peso real de cada ingrediente: harina, azúcar, mantequilla, líquidos y más. Pensado para seguir recetas que vienen en tazas, habituales en Latinoamérica y Estados Unidos.',
  url: 'https://meskeia.com/conversor-tazas-gramos/',
  features: [
    'Más de 30 ingredientes con su peso real por taza',
    'Conversión bidireccional: tazas → gramos y gramos → tazas',
    'Tazas, medias, tercios, cuartos, cucharadas y cucharaditas',
    'Tabla de referencia de gramos por taza',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito, sin publicidad y en español',
  ],
});

// FAQPage JSON-LD — mejora visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos gramos tiene una taza de harina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una taza estándar de 240 ml de harina de trigo todo uso pesa unos 120 gramos cuando se cuchara y se nivela sin compactar. La harina de fuerza ronda los 125 gramos y la integral unos 113. El peso varía bastante si compactas la harina en la taza, por eso pesar en gramos es siempre más preciso.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué una taza de azúcar no pesa lo mismo que una de harina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque cada ingrediente tiene una densidad distinta. Una taza de azúcar blanco pesa unos 200 gramos y una de harina unos 120, aunque ocupen el mismo volumen. Los líquidos como el agua pesan unos 237 gramos por taza y la miel hasta 340. Usar un peso genérico para "una taza" provoca errores grandes en repostería.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué medida de taza se usa en este conversor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Se usa la taza estándar de 240 ml (la "US cup"), que es la referencia habitual en las recetas de Estados Unidos y Latinoamérica. La cucharada equivale a 15 ml y la cucharadita a 5 ml. La taza métrica de 250 ml apenas cambia el resultado para harinas y azúcares.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo convierto gramos a tazas si la receta viene en peso?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Elige el modo "gramos a tazas", selecciona el ingrediente y escribe los gramos. La herramienta te devuelve el equivalente en tazas, cucharadas y cucharaditas para ese ingrediente concreto, útil cuando no tienes báscula y solo dispones de tazas medidoras.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es más fiable pesar en gramos o medir en tazas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pesar en gramos es más fiable, sobre todo en repostería y panadería, porque elimina la variación por compactación y por el tamaño real de la taza. Las tazas son cómodas para el día a día, pero dos personas pueden llenar la misma taza con cantidades distintas de harina. Por eso convertir a gramos da resultados más reproducibles.',
      },
    },
  ],
};
