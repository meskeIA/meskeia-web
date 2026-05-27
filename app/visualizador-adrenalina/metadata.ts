import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Adrenalina: Cómo Funciona | meskeIA',
  description:
    'La doble vida de la adrenalina: neurotransmisor (noradrenalina) y hormona. Cascada lucha-huida, receptores α y β, EpiPen en anafilaxia y estrés crónico.',
  keywords: [
    'adrenalina como funciona',
    'adrenalina epinefrina',
    'receptores adrenergicos',
    'adrenalina anafilaxia',
    'sistema simpatico adrenalina',
    'noradrenalina diferencia',
    'estres adrenalina',
  ],
  openGraph: {
    title: 'Adrenalina: La Hormona de la Supervivencia',
    description:
      'Neurotransmisor en el cerebro, hormona en la sangre. Cascada lucha-huida, receptores α y β y casos donde salva vidas.',
    type: 'website',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Adrenalina: La Hormona de la Supervivencia",
  description: "La doble vida de la adrenalina: neurotransmisor (noradrenalina) y hormona. Cascada lucha-huida, receptores α y β, EpiPen en anafilaxia y estrés crónico.",
  url: "https://meskeia.com/visualizador-adrenalina/",
  category: 'EducationalApplication',
  features: [],
});
