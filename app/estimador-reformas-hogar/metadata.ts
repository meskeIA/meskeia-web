import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Reformas del Hogar 2026 | Presupuesto estimado | meskeIA',
  description:
    'Estima el presupuesto de tu reforma en España: cocina, baño, pintura, suelos, eléctrica, fontanería y más. Precios de referencia 2026 por m². 100% gratuito, sin registro.',
  keywords: [
    'calculadora reformas hogar',
    'presupuesto reforma',
    'coste reforma cocina',
    'precio reforma baño',
    'reforma integral precio',
    'reformas españa 2026',
    'presupuesto reforma vivienda',
    'precio pintura interior',
    'coste suelos parquet',
    'reforma hogar metros cuadrados',
  ],
  openGraph: {
    title: 'Estimador Reformas del Hogar | meskeIA',
    description:
      'Estima el coste de tus reformas: cocina, baño, suelos, pintura y más. Precios de referencia España 2026.',
    url: 'https://meskeia.com/estimador-reformas-hogar/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  alternates: {
    canonical: 'https://meskeia.com/estimador-reformas-hogar',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Reformas del Hogar",
  description: "Estima el presupuesto de tu reforma en España: cocina, baño, pintura, suelos, eléctrica, fontanería y más. Precios de referencia 2026 por m². 100% gratuito, sin registro.",
  url: "https://meskeia.com/estimador-reformas-hogar/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta reformar una cocina en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El coste de reformar una cocina en España varía entre 3.000 € y 15.000 € según los materiales y el tamaño. Una reforma básica de cocina de unos 10 m² puede situarse en torno a 4.000-6.000 €, mientras que una reforma integral con electrodomésticos de gama alta puede superar los 12.000 €. Los precios de referencia por m² en 2026 oscilan entre 300 € y 1.200 € dependiendo de los acabados.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué tipos de reforma del hogar se pueden estimar con esta calculadora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La calculadora cubre los principales tipos de reforma: cocina, baño, pintura interior, suelos (parquet, gres, laminado), instalación eléctrica, fontanería, carpintería interior y reforma integral. Para cada tipo se aplican precios de referencia actualizados por metro cuadrado o por unidad según corresponda.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta reformar un baño completo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reformar un baño completo en España cuesta entre 2.500 € y 8.000 €. Un baño pequeño de 4-5 m² con materiales de calidad media ronda los 3.500-4.500 €. El precio sube si se cambia la instalación de fontanería, se instalan suelos y paredes de obra o se elige sanitarios y griferías de gama alta. Los precios de mano de obra representan habitualmente el 40-60 % del total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿En qué se diferencia un estimador de reformas de un presupuesto profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Un estimador de reformas proporciona rangos de precio orientativos basados en precios de mercado por m², útil para planificar el presupuesto antes de pedir ofertas. Un presupuesto profesional lo elabora un contratista tras visitar la vivienda, evaluar el estado actual y definir los materiales exactos. El estimador ayuda a negociar y detectar precios fuera de mercado, pero no sustituye la valoración in situ.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores influyen más en el coste de una reforma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los factores que más encarecen una reforma son: la calidad de los materiales, el alcance de la instalación eléctrica o de fontanería (si hay que rehacer toda la red), la localización geográfica (Madrid y Barcelona tienen precios un 20-30 % superiores a la media), el acceso a la vivienda (piso sin ascensor o zonas de difícil acceso) y el estado de partida de la vivienda (si requiere demolición o saneado previo).',
      },
    },
  ],
};
