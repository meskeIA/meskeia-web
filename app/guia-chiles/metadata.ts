import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Guía de chiles y pimientos: escala Scoville y usos | meskeIA',
  description:
    'Conoce los chiles y pimientos del mundo ordenados por picor (escala Scoville): del pimiento al Carolina Reaper, con jalapeño, serrano, habanero, guajillo y más, su origen y para qué usar cada uno. Gratis y en español.',
  keywords:
    'escala scoville, guia de chiles, picor chiles, jalapeño serrano habanero scoville, chiles mexicanos, que tan picante es, guajillo ancho chipotle, chiles mas picantes del mundo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Guía de chiles y pimientos (escala Scoville)', description: 'Los chiles del mundo ordenados por picor, con su origen y usos.', url: 'https://meskeia.com/guia-chiles', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Guía de chiles y pimientos', description: 'Picor (Scoville), origen y usos de los chiles del mundo.' },
  other: { 'application-name': 'Guía de chiles meskeIA' },
  alternates: { canonical: 'https://meskeia.com/guia-chiles/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Guía de chiles y pimientos',
  description:
    'Guía de chiles y pimientos del mundo ordenados por su nivel de picor en la escala Scoville (SHU), con foco en las variedades mexicanas y latinoamericanas, indicando su origen y sus usos típicos en cocina.',
  url: 'https://meskeia.com/guia-chiles/',
  category: 'EducationalApplication',
  features: [
    'Chiles ordenados por picor (escala Scoville)',
    'Filtro por nivel de picante',
    'Origen y usos de cada chile',
    'Variedades mexicanas y del mundo',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Qué es la escala Scoville?', acceptedAnswer: { '@type': 'Answer', text: 'La escala Scoville mide el picor de un chile en unidades SHU (Scoville Heat Units), que reflejan la cantidad de capsaicina, la sustancia responsable del picante. Va desde 0 del pimiento dulce hasta más de dos millones del Carolina Reaper. Los valores son rangos orientativos, porque el picor varía según la variedad y el cultivo.' } },
    { '@type': 'Question', name: '¿Cuál es el chile más picante del mundo?', acceptedAnswer: { '@type': 'Answer', text: 'Entre los más picantes están el Carolina Reaper (1,5 a 2,2 millones de SHU) y el chile fantasma o Bhut Jolokia (alrededor de un millón). Son chiles extremos que conviene manejar con guantes y usar en cantidades mínimas; muy lejos del picor cotidiano de un jalapeño o un serrano.' } },
    { '@type': 'Question', name: '¿Qué tan picante es el jalapeño?', acceptedAnswer: { '@type': 'Answer', text: 'El jalapeño es de picor medio, entre 2.500 y 8.000 SHU. Es uno de los chiles más versátiles: se usa fresco, encurtido o relleno. Su versión ahumada es el chipotle. El serrano, parecido pero bastante más picante (10.000-23.000 SHU), es habitual en salsas frescas.' } },
    { '@type': 'Question', name: '¿Cómo se calma el picor de un chile?', acceptedAnswer: { '@type': 'Answer', text: 'La capsaicina es soluble en grasa, no en agua, así que beber agua apenas ayuda. Funcionan mejor los lácteos (leche, yogur), algo graso o dulce, y los carbohidratos como el pan o el arroz. La mayor parte del picor está en las venas y semillas del chile, que se pueden retirar para suavizarlo.' } },
    { '@type': 'Question', name: '¿Qué chiles se usan en la cocina mexicana?', acceptedAnswer: { '@type': 'Answer', text: 'Muchísimos, y a menudo secos: el ancho (poblano seco) y el guajillo son la base de moles y adobos; el chipotle aporta ahumado; el serrano y el jalapeño van en salsas frescas; y el habanero, muy picante y frutal, es típico de Yucatán. Cada uno aporta no solo picor, sino un sabor propio.' } },
  ],
};
