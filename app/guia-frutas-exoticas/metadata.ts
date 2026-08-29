import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de Frutas Exóticas del Mundo | meskeIA',
  description:
    'Guía de 40 frutas exóticas: durian, mangostán, rambután, pitaya, lichi, baobab, yuzu y más. Origen, temporada, sabor y forma de consumo.',
  keywords: [
    'frutas exoticas',
    'frutas tropicales',
    'durian mangostan rambutan',
    'pitaya dragon fruit',
    'lichi maracuya guayaba',
    'frutas raras',
  ],
  openGraph: {
    title: 'Guía de Frutas Exóticas del Mundo | meskeIA',
    description:
      'Descubre 40 frutas tropicales y raras del mundo: origen, temporada, beneficios, formas de consumo y curiosidades.',
    type: 'website',
    url: 'https://meskeia.com/guia-frutas-exoticas/',
    locale: 'es_ES',
    siteName: 'meskeIA',
    images: [{
      url: 'https://meskeia.com/coquinum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Frutas Exóticas del Mundo | meskeIA',
    description:
      'Descubre 40 frutas tropicales y raras del mundo: origen, temporada, beneficios y curiosidades.',
    images: ['https://meskeia.com/coquinum/og-image.png']
  },
  alternates: {
    canonical: 'https://meskeia.com/guia-frutas-exoticas/',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Guía de Frutas Exóticas",
  description: "Guía de 40 frutas exóticas: durian, mangostán, rambután, pitaya, lichi, baobab, yuzu y más. Origen, temporada, sabor y forma de consumo.",
  url: "https://meskeia.com/guia-frutas-exoticas/",
  category: 'EducationalApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el durian y por qué tiene fama de oler tan fuerte?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El durian es una fruta originaria del sudeste asiático, especialmente de Malasia, Indonesia y Tailandia. Su interior cremoso tiene un sabor dulce y complejo que recuerda a la vainilla, la yema de huevo y la natilla. Sin embargo, su corteza despide compuestos sulfurados volátiles que generan un olor muy intenso, razón por la que está prohibido en muchos transportes públicos y hoteles de la región.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre pitaya roja y pitaya amarilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pitaya roja (Hylocereus undatus) tiene piel rosada o roja y pulpa blanca con semillas negras; su sabor es suave y ligeramente dulce. La pitaya amarilla (Selenicereus megalanthus), originaria de Colombia y Ecuador, tiene piel amarilla con espinas y pulpa blanca; su sabor es más intenso, dulce y aromático. La amarilla suele ser más valorada gastronómicamente, aunque menos común en mercados europeos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Dónde puedo comprar frutas exóticas como mangostán o rambután?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El mangostán y el rambután frescos se encuentran principalmente en tiendas de productos asiáticos o latinoamericanos en grandes ciudades. En versión enlatada o en almíbar están disponibles en muchos supermercados y tiendas en línea. La temporada de importación fresca suele ser en verano y otoño. También es habitual encontrarlos en mercados especializados de frutas tropicales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué frutas exóticas son más fáciles de encontrar en Europa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las frutas exóticas más accesibles en Europa son el mango, la papaya, el lichi, la maracuyá (fruta de la pasión), la guayaba y la carambola. En grandes superficies es habitual encontrar mangos de diferentes variedades todo el año. El lichi fresco aparece en temporada entre junio y agosto. El pitahaya (pitaya) roja ya está presente en muchos supermercados por su creciente popularidad.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El yuzu es una fruta o un ingrediente culinario?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El yuzu es un cítrico originario de China y Japón con un sabor intensamente aromático que combina matices de limón, mandarina y pomelo. Se usa casi exclusivamente como ingrediente culinario: su zumo y ralladura aromatizan salsas, aderezos, postres y cócteles. La fruta entera es difícil de comer directamente por su escasa pulpa y numerosas semillas. En Japón también se usa en baños de yuzu (yuzu-yu) durante el solsticio de invierno.',
      },
    },
  ],
};
