import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de onzas a gramos y mililitros | meskeIA',
  description:
    'Convierte onzas a gramos, mililitros, libras y tazas. Separa la onza de peso (28,35 g) de la onza líquida (29,57 ml en EE. UU.), la confusión más habitual al seguir recetas anglosajonas. Gratis y en español.',
  keywords:
    'onzas a gramos, onzas a ml, cuanto es una onza, onza a gramos, onzas a mililitros, onza liquida, onzas a litros, convertir onzas, onzas a libras, cuantos gramos tiene una onza',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Conversor de onzas a gramos y mililitros',
    description:
      'La onza de peso y la onza líquida no son lo mismo. Convierte onzas a gramos, mililitros, libras y tazas, con la diferencia entre EE. UU. y Reino Unido.',
    url: 'https://meskeia.com/conversor-onzas',
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
    title: 'Conversor de onzas a gramos y mililitros',
    description:
      'Onza de peso (28,35 g) frente a onza líquida (29,57 ml): convierte sin liarte con las recetas en onzas.',
    images: ['https://meskeia.com/coquinum/og-image.png'],
  },
  other: {
    'application-name': 'Conversor de onzas meskeIA',
  },
  alternates: { canonical: 'https://meskeia.com/conversor-onzas/' },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Conversor de onzas a gramos y mililitros',
  description:
    'Convierte onzas a gramos, mililitros, libras y tazas distinguiendo la onza de peso (avoirdupois, 28,35 g) de la onza líquida (fluid ounce, 29,57 ml en EE. UU. y 28,41 ml en Reino Unido). Pensado para seguir recetas y cócteles anglosajones.',
  url: 'https://meskeia.com/conversor-onzas/',
  category: 'UtilityApplication',
  features: [
    'Onzas de peso a gramos, libras y kilogramos',
    'Onzas líquidas a mililitros, litros y tazas',
    'Diferencia entre onza líquida de EE. UU. y de Reino Unido',
    'Conversión en ambos sentidos',
    'Tabla de equivalencias de cocina más habituales',
    'Funciona 100% en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

// FAQPage JSON-LD — visibilidad en Bing Copilot, ChatGPT, Perplexity y Gemini
export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto es una onza en gramos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una onza de peso (la onza avoirdupois) equivale a 28,35 gramos. Es la que se usa para ingredientes sólidos como carne, chocolate o harina. Así, 4 onzas son 113 gramos, 8 onzas son 227 gramos y 16 onzas hacen una libra, es decir, 454 gramos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántos mililitros tiene una onza líquida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una onza líquida estadounidense (US fluid ounce) equivale a 29,57 ml, que suele redondearse a 30 ml. La onza líquida británica es algo menor, 28,41 ml. La onza líquida mide volumen, así que se usa para líquidos como leche, agua o bebidas, no para pesar.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre la onza de peso y la onza líquida?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La onza de peso (oz) mide masa: 1 oz son 28,35 gramos. La onza líquida (fl oz) mide volumen: 1 fl oz son unos 30 mililitros. Aunque comparten nombre, no se convierten igual, por eso "8 onzas de harina" (gramos) y "8 onzas de leche" (mililitros) dan cifras distintas.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuántas onzas líquidas tiene una taza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Una taza estadounidense tiene 8 onzas líquidas, que son 236,6 ml (aproximadamente 237 ml). Por eso las recetas de EE. UU. usan indistintamente "1 cup" y "8 fl oz". Media taza son 4 onzas líquidas (118 ml) y dos tazas, 16 onzas líquidas (473 ml, una pinta).',
      },
    },
    {
      '@type': 'Question',
      name: '¿La onza es igual en Estados Unidos y en Reino Unido?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La onza de peso sí es prácticamente igual (28,35 g). La onza líquida no: la estadounidense son 29,57 ml y la británica (imperial) 28,41 ml. La diferencia es pequeña por unidad, pero se acumula en volúmenes grandes, así que conviene saber de qué país es la receta.',
      },
    },
  ],
};
