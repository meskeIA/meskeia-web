import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ajuste de recetas por altitud: hornear y cocinar en altura | meskeIA',
  description:
    'Cocinas en altura (CDMX, Bogotá, Quito, La Paz) y la receta es de nivel del mar. Calcula el punto de ebullición y los ajustes de horno, leudante, líquido y azúcar según tu altitud. Gratis y en español.',
  keywords:
    'hornear en altura, cocinar en altitud, recetas altura, bizcocho se desinfla altura, punto de ebullición altitud, repostería gran altura, CDMX Bogotá Quito La Paz cocina, ajuste leudante altura',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ajuste de recetas por altitud',
    description:
      'En altura el agua hierve más fría y las masas se desinflan. Calcula los ajustes de tu receta según tu altitud.',
    url: 'https://meskeia.com/ajuste-recetas-altitud',
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
    title: 'Ajuste de recetas por altitud',
    description:
      'Hornear y cocinar en altura sin que la receta falle: ajustes de horno, leudante, líquido y cocción según tu altitud.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Ajuste recetas por altitud meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/ajuste-recetas-altitud/' },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Ajuste de recetas por altitud',
  description:
    'Calcula cómo adaptar una receta a la altitud a la que cocinas: punto de ebullición del agua, aumento de temperatura del horno, reducción de leudante y azúcar, y aumento de líquido y harina. Pensado para quien cocina en altura (Ciudad de México, Bogotá, Quito, La Paz) con recetas escritas para el nivel del mar.',
  url: 'https://meskeia.com/ajuste-recetas-altitud/',
  features: [
    'Punto de ebullición del agua según la altitud',
    'Ajustes de horneado: horno, leudante, líquido, azúcar y harina',
    'Recomendaciones para masas con levadura',
    'Ciudades de referencia o altitud manual',
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
      name: '¿Por qué se me desinflan los bizcochos en altura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En altura hay menos presión atmosférica, así que los gases del leudante (polvo de hornear o bicarbonato) se expanden con más fuerza y la masa sube demasiado rápido antes de que la estructura se fije, y luego se colapsa. La solución es reducir el leudante, subir un poco la temperatura del horno para fijar antes la miga y, a veces, añadir algo de harina y líquido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura hierve el agua en Ciudad de México o Bogotá?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En Ciudad de México (2240 m) el agua hierve a unos 92 °C, en Bogotá (2640 m) a unos 91 °C y en La Paz (3640 m) a unos 87 °C, frente a los 100 °C del nivel del mar. Como el agua está más fría al hervir, los alimentos cocidos en agua (legumbres, huevos, pasta) tardan más en hacerse y conviene usar olla a presión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué altitud hay que ajustar las recetas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Por debajo de unos 900 metros los ajustes son mínimos. Entre 900 y 1500 m empiezan a notarse en la repostería con leudante. A partir de 2000 m (gran parte de las ciudades andinas y del altiplano mexicano) los ajustes ya son claros: menos leudante y azúcar, más líquido y harina, y horno algo más caliente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo ajusto el horno y el leudante al cocinar en altura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Como guía general, sube la temperatura del horno entre 10 y 20 °C para fijar antes la estructura, y reduce el polvo de hornear o el bicarbonato entre un 10 y un 30% según la altitud. Esta herramienta calcula los valores concretos para tu altitud, además del líquido y la harina a añadir.',
      },
    },
    {
      '@type': 'Question',
      name: '¿La masa de pan con levadura también cambia en altura?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. La fermentación es más rápida en altura porque la menor presión facilita la expansión del gas, así que la masa se sobrefermenta con facilidad. Conviene reducir la levadura, acortar los tiempos de levado y guiarse por el volumen de la masa más que por el reloj, haciendo un plegado o desgasificado extra si es necesario.',
      },
    },
  ],
};
