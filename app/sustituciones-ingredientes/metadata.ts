import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Sustituciones de ingredientes en cocina y repostería | meskeIA',
  description:
    'Se te acabó un ingrediente o quieres una receta vegana, sin gluten o sin lactosa. Consulta con qué sustituir huevo, mantequilla, azúcar, leche, harina y más, con proporciones exactas. Gratis y en español.',
  keywords:
    'sustituir huevo reposteria, con que reemplazar mantequilla, sustituto de leche receta, sustituciones ingredientes cocina, receta vegana sustituir, sin gluten sustituto harina, reemplazar azucar',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Sustituciones de ingredientes en cocina y repostería',
    description:
      'Con qué sustituir huevo, mantequilla, azúcar, leche o harina, con proporciones exactas y opciones veganas, sin gluten y sin lactosa.',
    url: 'https://meskeia.com/sustituciones-ingredientes',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sustituciones de ingredientes',
    description:
      'Con qué reemplazar huevo, mantequilla, azúcar, leche o harina, con proporciones y filtro por dieta.',
  },
  other: {
    'application-name': 'Sustituciones de ingredientes meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/sustituciones-ingredientes/' },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Sustituciones de ingredientes en cocina y repostería',
  description:
    'Consulta con qué sustituir ingredientes habituales de cocina y repostería (huevo, mantequilla, azúcar, leche, suero de leche, harina, levadura química, nata y pan rallado), con la proporción exacta, cuándo funciona cada opción y filtro por dieta vegana, sin gluten o sin lactosa.',
  url: 'https://meskeia.com/sustituciones-ingredientes/',
  features: [
    'Sustitutos de huevo, mantequilla, azúcar, leche, harina y más',
    'Proporción concreta para cada sustitución',
    'Filtro por dieta: vegano, sin gluten y sin lactosa',
    'Notas sobre cuándo funciona cada opción',
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
      name: '¿Con qué puedo sustituir el huevo en un bizcocho?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por cada huevo puedes usar 1 cucharada de linaza o chía molida con 3 de agua (reposada hasta formar gel), 60 g de puré de manzana, medio plátano machacado o 3 cucharadas de aquafaba (el líquido de los garbanzos), que además se monta para preparaciones esponjosas. Cada opción cubre mejor una función: ligar, dar humedad o ayudar a subir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo sustituyo la mantequilla por aceite?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usa aproximadamente 80 g de aceite suave por cada 100 g de mantequilla, porque el aceite es grasa pura y la mantequilla lleva algo de agua. La miga queda más húmeda y tierna. Eso sí, el aceite no sirve para masas que necesitan grasa sólida, como el hojaldre o las galletas que deben mantener la forma.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo hago suero de leche (buttermilk) en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Añade 1 cucharada de zumo de limón o de vinagre a 250 ml de leche, remueve y deja reposar 5 a 10 minutos hasta que se corte ligeramente. Esa acidez es justo lo que la receta busca para activar el bicarbonato. Con bebida de soja y el mismo truco obtienes una versión vegana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué uso en vez de harina de trigo si no como gluten?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La opción más fiable es una mezcla comercial sin gluten 1:1, que ya incluye almidones y goma para imitar el gluten. También puedes hacer una mezcla casera de harina de arroz, almidón y un poco de goma xantana. Para espesar salsas, la maicena sustituye a la harina usando la mitad de cantidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Las sustituciones cambian el resultado de la receta?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, casi siempre cambian algo la textura, el sabor o el dorado, porque cada ingrediente cumple varias funciones a la vez. Las proporciones que se indican son un buen punto de partida, pero conviene probar y ajustar, sobre todo en repostería, donde el equilibrio entre grasa, azúcar y líquido es delicado.',
      },
    },
  ],
};
