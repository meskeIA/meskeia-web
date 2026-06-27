import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Conversor de líquidos: mililitros a gramos por densidad | meskeIA',
  description:
    'Convierte mililitros a gramos (y al revés) según el líquido: agua, leche, aceite, miel, sirope, nata, vino y más. Cada líquido pesa distinto. Para recetas precisas. Gratis y en español.',
  keywords:
    'ml a gramos liquidos, densidad liquidos cocina, convertir aceite ml a gramos, miel ml a gramos, cuanto pesa un litro de aceite, conversor liquidos cocina',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: { type: 'website', title: 'Conversor de líquidos: ml a gramos', description: 'Convierte ml a gramos según el líquido: agua, aceite, miel y más.', url: 'https://meskeia.com/densidad-liquidos', siteName: 'meskeIA', locale: 'es_ES' },
  twitter: { card: 'summary_large_image', title: 'Conversor de líquidos (ml a g)', description: 'ml a gramos según la densidad de cada líquido.' },
  other: { 'application-name': 'Densidad de líquidos meskeIA' },
  alternates: { canonical: 'https://meskeia.com/densidad-liquidos/' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Conversor de líquidos: mililitros a gramos',
  description:
    'Convierte mililitros a gramos y gramos a mililitros según la densidad de cada líquido de cocina (agua, leche, aceite, miel, sirope, nata, vino, vinagre, zumo y más), porque cada líquido pesa distinto por el mismo volumen.',
  url: 'https://meskeia.com/densidad-liquidos/',
  features: [
    'Conversión ml ↔ g según el líquido',
    'Densidades de líquidos de cocina habituales',
    'Bidireccional: de ml a g y de g a ml',
    'Para recetas que dan líquidos en peso',
    'Funciona en el navegador, sin registro',
    'Gratuito, sin publicidad y en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: '¿Un mililitro es igual a un gramo?', acceptedAnswer: { '@type': 'Answer', text: 'Solo en el caso del agua, que pesa 1 gramo por mililitro. Otros líquidos pesan distinto: el aceite pesa menos (unos 0,92 g/ml) y la miel mucho más (alrededor de 1,42 g/ml). Por eso, cuando una receta da un líquido en gramos y tú lo mides en mililitros, hay que usar la densidad de ese líquido para convertir bien.' } },
    { '@type': 'Question', name: '¿Cuánto pesa un litro de aceite?', acceptedAnswer: { '@type': 'Answer', text: 'Un litro de aceite pesa unos 920 gramos, no un kilo, porque su densidad es de aproximadamente 0,92 g/ml, menor que la del agua. Por eso el aceite flota sobre el agua. Esa diferencia importa cuando una receta de repostería da el aceite en gramos y solo tienes una jarra medidora en mililitros.' } },
    { '@type': 'Question', name: '¿Por qué la miel pesa tanto?', acceptedAnswer: { '@type': 'Answer', text: 'La miel es muy densa, alrededor de 1,42 g/ml, porque es una solución muy concentrada de azúcares con poca agua. Eso significa que 100 ml de miel pesan unos 142 gramos. Lo mismo ocurre con los siropes y la leche condensada: son líquidos pesados, así que conviene medirlos por peso para mayor precisión.' } },
    { '@type': 'Question', name: '¿Cuándo importa la densidad de un líquido?', acceptedAnswer: { '@type': 'Answer', text: 'Importa sobre todo en repostería y panadería, donde las recetas suelen dar las cantidades en gramos para mayor precisión. Si solo tienes una jarra de mililitros, convertir según la densidad evita errores, especialmente con líquidos densos como la miel o ligeros como el aceite. En cocina general la diferencia suele ser menos crítica.' } },
    { '@type': 'Question', name: '¿La leche pesa más que el agua?', acceptedAnswer: { '@type': 'Answer', text: 'Sí, un poco: la leche tiene una densidad de alrededor de 1,03 g/ml por su contenido en azúcares, proteínas y minerales, así que un litro pesa unos 1.030 gramos. La diferencia es pequeña y para la mayoría de recetas se puede tratar casi como el agua, pero la herramienta la tiene en cuenta para mayor exactitud.' } },
  ],
};
