import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Cuánta carne para un asado o barbacoa por persona | meskeIA',
  description:
    'Calcula cuánta carne comprar para tu asado o barbacoa según el número de personas, el apetito y si hay guarniciones. Con desglose por tipo de carne. Gratis y en español.',
  keywords:
    'cuanta carne por persona asado, calculadora barbacoa, carne para parrillada, asado para 10 personas, cuanta carne comprar bbq, gramos carne por persona, parrilla cantidad carne',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Cuánta carne para un asado por persona', description: 'La carne a comprar para tu asado según las personas, el apetito y las guarniciones.', url: 'https://meskeia.com/asado-personas', siteName: 'meskeIA', locale: 'es_ES', images: [{ url: 'https://meskeia.com/coquinum/og-image.png', width: 1200, height: 630, alt: 'Coquinum — el portal de cocina y gastronomía de meskeIA' }] },
  twitter: { card: 'summary_large_image', title: 'Cuánta carne para un asado', description: 'La carne a comprar para tu barbacoa según las personas.', images: ['https://meskeia.com/coquinum/og-image.png'] },
  other: { 'application-name': 'Carne para asado meskeIA' },
  alternates: { canonical: 'https://meskeia.com/asado-personas/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Cuánta carne para un asado por persona',
  description:
    'Calcula la cantidad de carne a comprar para un asado o barbacoa según el número de comensales, el nivel de apetito y si hay guarniciones que llenan, con un desglose orientativo por tipo de carne (res, cerdo, embutido y pollo).',
  url: 'https://meskeia.com/asado-personas/',
  features: [
    'Carne total según comensales y apetito',
    'Ajuste si hay guarniciones abundantes',
    'Desglose por tipo de carne',
    'Cantidades de carne cruda a comprar',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Cuánta carne se calcula por persona en una barbacoa?', acceptedAnswer: { '@type': 'Answer', text: 'Para una barbacoa o asado donde la carne es la protagonista, se calculan unos 400 gramos de carne cruda por persona como referencia. Si hay muchas guarniciones que llenan, baja a unos 300; si es un grupo muy comilón o un asado con mucha variedad, sube a 500. Son cantidades de producto crudo, que pierde peso al cocinarse.' } },
    { '@type': 'Question', name: '¿Cómo reparto los tipos de carne en un asado?', acceptedAnswer: { '@type': 'Answer', text: 'Un reparto equilibrado y variado suele ser la mitad de carne de res o vacuno, una cuarta parte de cerdo (costilla, panceta), un 15% de embutido (chorizo, morcilla) y un 10% de pollo. La herramienta te da ese desglose para que sepas cuánto comprar de cada cosa, aunque puedes ajustarlo a tu gusto.' } },
    { '@type': 'Question', name: '¿La carne pierde peso al asarse?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, la carne pierde entre un 20 y un 30% de peso al cocinarse, porque suelta agua y grasa. Por eso se calcula sobre el peso crudo: los 400 gramos por persona se quedan en unos 280-320 ya hechos. Tenerlo en cuenta evita quedarse corto.' } },
    { '@type': 'Question', name: '¿Cuánta carne para 10 personas?', acceptedAnswer: { '@type': 'Answer', text: 'Para 10 personas con apetito normal, alrededor de 4 kilos de carne cruda en total; con guarniciones abundantes, unos 3,4 kilos; y para un asado de buen comer, hasta 5 kilos. La herramienta calcula el total exacto y te lo desglosa por tipo de carne.' } },
    { '@type': 'Question', name: '¿Qué más calcular además de la carne?', acceptedAnswer: { '@type': 'Answer', text: 'Además de la carne conviene prever pan, ensaladas o guarniciones, salsas y bebida. Para una estimación completa de comida y bebida de un evento (incluidas las cantidades de pan, postre y bebidas), puedes usar la calculadora de cantidades para un evento.' } },
  ],
};
