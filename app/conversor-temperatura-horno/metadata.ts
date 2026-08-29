import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de temperatura de horno: °C, °F y gas mark | meskeIA',
  description:
    'Convierte la temperatura del horno entre grados Celsius, Fahrenheit y gas mark, con el ajuste para horno de ventilador. Para seguir recetas en inglés sin equivocarte. Gratis y en español.',
  keywords:
    'temperatura horno conversor, grados fahrenheit a celsius horno, gas mark a grados, 350 f en grados, horno ventilador equivalencia, 180 grados en fahrenheit, conversor temperatura reposteria',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de temperatura de horno (°C, °F y gas mark)',
    description:
      'Pasa la temperatura del horno entre Celsius, Fahrenheit y gas mark, con ajuste para horno de ventilador.',
    url: 'https://meskeia.com/conversor-temperatura-horno',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/coquinum/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Conversor de temperatura de horno',
    description:
      'Celsius, Fahrenheit y gas mark en un solo paso, con el ajuste para horno de ventilador.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Conversor temperatura horno meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/conversor-temperatura-horno/' },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Conversor de temperatura de horno',
  description:
    'Convierte la temperatura del horno entre grados Celsius, grados Fahrenheit y la escala gas mark británica, e indica el equivalente para horno de ventilador (aire forzado) y el nivel descriptivo. Útil para seguir recetas de Estados Unidos y Reino Unido.',
  url: 'https://meskeia.com/conversor-temperatura-horno/',
  features: [
    'Conversión entre Celsius, Fahrenheit y gas mark',
    'Ajuste para horno de ventilador (aire forzado)',
    'Nivel descriptivo y usos típicos de cada temperatura',
    'Tabla de equivalencias completa',
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
      name: '¿Cuántos grados Celsius son 350 °F en el horno?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '350 °F equivalen a unos 180 °C, que es la temperatura más habitual en repostería (bizcochos, galletas, tartas). En la escala británica corresponde a gas mark 4. Si tu horno es de ventilador, baja a unos 160 °C para el mismo resultado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el "gas mark" de las recetas británicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El gas mark es la escala numérica de los hornos de gas en Reino Unido e Irlanda. Va de ¼ (110 °C) a 9 (240 °C). Cada número equivale a una temperatura concreta: gas mark 4 son 180 °C, gas mark 6 son 200 °C y gas mark 7 son 220 °C. Este conversor te da la equivalencia exacta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo ajusto la temperatura si mi horno es de ventilador?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El horno de ventilador (aire forzado o convección) calienta de forma más uniforme y eficiente, así que para el mismo resultado conviene bajar la temperatura unos 20 °C respecto a la receta pensada para horno convencional. Por ejemplo, 180 °C convencional equivalen a unos 160 °C con ventilador.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué unas recetas usan Fahrenheit y otras Celsius?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es una cuestión geográfica. Estados Unidos usa grados Fahrenheit, gran parte de Latinoamérica y Europa usa grados Celsius, y Reino Unido e Irlanda usan tanto Celsius como la escala gas mark en hornos de gas. Por eso una misma receta puede aparecer en distintas unidades según su origen.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura se hornea cada cosa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Como referencia: merengues y secados a 100-120 °C, bizcochos y galletas a 170-180 °C, tartas y panes de molde a 180-190 °C, pan de corteza a 220-230 °C y pizza a 250 °C o más. La herramienta indica el nivel descriptivo y usos típicos para cada temperatura que conviertas.',
      },
    },
  ],
};
