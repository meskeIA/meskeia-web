import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: '¿Qué cerveza elegir? Asistente situacional de cervezas | meskeIA',
  description: 'Asistente para elegir la cerveza adecuada según tu situación: comida, regalo, bar, ocasión especial. Recomendaciones por plato, ocasión y presupuesto. Estilos del mundo: IPA, Stout, Pilsner, NEIPA, Quadrupel.',
  keywords: 'qué cerveza elegir, recomendador cerveza, maridaje cerveza, cerveza para comida, cerveza regalo, cerveza craft, simulador cerveza, asistente cerveza, IPA, NEIPA, stout, pilsner',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: '¿Qué cerveza elegir? | meskeIA',
    description: 'Asistente situacional de cervezas: te ayuda a decidir según comida, ocasión, regalo o exploración. Recomendaciones razonadas con alternativas.',
    url: 'https://meskeia.com/que-cerveza-elegir/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '¿Qué cerveza elegir? | meskeIA',
    description: 'Asistente situacional de cervezas: comida, regalo, bar u ocasión. Recomendaciones razonadas.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Qué cerveza elegir meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: '¿Qué cerveza elegir?',
  description: 'Asistente situacional para elegir la cerveza adecuada según el contexto: comida con plato concreto, regalo, bar/restaurante, ocasión especial o exploración. Devuelve 3 recomendaciones razonadas más una alternativa para salir de la zona de confort. Cobertura amplia: estilos clásicos europeos, craft americano (NEIPA, Double IPA), trapenses (Tripel, Quadrupel) y Mexican Lager.',
  url: 'https://meskeia.com/que-cerveza-elegir/',
  category: 'EducationalApplication',
  features: [
    'Asistente situacional: 5 escenarios (comida, regalo, bar, ocasión, probar)',
    'Recomendaciones razonadas con porcentaje de afinidad',
    'Cobertura craft moderna: NEIPA, Double IPA, Belgian Strong Golden Ale',
    'Estilos trapenses: Tripel, Dubbel, Quadrupel',
    'Mexican Lager y estilos no europeos incluidos',
    'Alternativa "fuera de zona de confort" para explorar',
    'Tips de servicio: temperatura y maridaje',
    'Explicación del "por qué" de cada recomendación, no solo el nombre del estilo',
    'Cobertura de estilos sour y silvestres: Lambic, Gose, Flanders Red',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué cerveza marida mejor con carne a la brasa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cervezas ahumadas (Rauchbier) o las stouts robustas (como una American Stout o Porter) maridan muy bien con carne a la brasa, ya que sus notas tostadas complementan el sabor ahumado de la parrilla. También funcionan bien una Pale Ale con amargor moderado o una Märzen de carácter maltoso. La clave es buscar cuerpo suficiente para no quedar opacado por la proteína.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre una IPA y una NEIPA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La IPA (India Pale Ale) tradicional se caracteriza por un amargor pronunciado, cuerpo seco y claridad en el vaso. La NEIPA (New England IPA) es una variante moderna que prioriza el aroma y el sabor frutado (mango, melocotón, cítricos) sobre el amargor, con una textura más cremosa y un aspecto turbio. Si buscas amargor intenso, elige IPA clásica; si prefieres jugosidad y aroma, la NEIPA es mejor opción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué cerveza regalar a alguien que no bebe habitualmente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para alguien poco habituado a la cerveza, los estilos más accesibles son la Wheat Beer (trigo), la Blonde Ale o una Mexican Lager: son suaves, con poco amargor y buenas notas frutadas o de cereal. También funcionan las cervezas de frutas o las Saison ligeras. Evita estilos muy amargos (Double IPA, Imperial Stout) o muy intensos (Quadrupel) para una primera experiencia agradable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las cervezas trapenses y en qué se diferencian del resto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las cervezas trapenses son elaboradas en o bajo supervisión de monasterios trapenses certificados (actualmente 14 en el mundo, la mayoría en Bélgica). Sus estilos más conocidos son Dubbel (caramelo, frutas oscuras, 6-8% ABV), Tripel (dorada, especiada, 8-10% ABV) y Quadrupel (marrón oscura, muy maltosa, 10-12% ABV). Se distinguen del resto por el uso de levaduras propias, fermentación en alta y la certificación "Authentic Trappist Product".',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué temperatura se sirven los distintos estilos de cerveza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La temperatura de servicio varía según el estilo: las lagers y pilsners se sirven entre 3-5 °C, las ales ligeras (Pale Ale, Blonde) entre 7-10 °C, las IPA entre 8-12 °C y las cervezas más complejas como Stouts, Porters o trapenses entre 10-14 °C. Servir demasiado fría una cerveza de carácter anula sus aromas; servir demasiado templada una lager la hace pesada. El vaso limpio y la temperatura correcta marcan la diferencia.',
      },
    },
  ],
};
