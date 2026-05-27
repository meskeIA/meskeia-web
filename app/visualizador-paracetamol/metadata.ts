import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Paracetamol: Cómo Funciona | meskeIA',
  description:
    'El analgésico más usado del mundo actúa en el cerebro, no en la inflamación. Visualiza el metabolismo hepático, el NAPQI, la sobredosis y por qué el alcohol lo hace más peligroso.',
  keywords: [
    'paracetamol como funciona',
    'paracetamol mecanismo',
    'paracetamol NAPQI',
    'paracetamol higado',
    'paracetamol sobredosis',
    'paracetamol alcohol',
    'paracetamol embarazo',
    'acetaminofen como funciona',
  ],
  openGraph: {
    title: 'Paracetamol: El Analgésico que Actúa en el Cerebro',
    description:
      'Seguro para el estómago, exigente con el hígado. El NAPQI y por qué el alcohol lo hace más peligroso.',
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
  name: "Paracetamol: Cómo Actúa en el Sistema Nervioso Central",
  description: "El analgésico más usado del mundo actúa en el cerebro, no en la inflamación. Visualiza el metabolismo hepático, el NAPQI, la sobredosis y por qué el alcohol lo hace más peligroso.",
  url: "https://meskeia.com/visualizador-paracetamol/",
  category: 'EducationalApplication',
  features: [],
});
