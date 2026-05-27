import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo del Carbono Completo: Reservorios y Flujos | meskeIA',
  description:
    'Los 5 grandes reservorios de carbono en la Tierra (atmósfera, océanos, biota terrestre, suelos, litosfera) y todos los flujos en Gt C/año. La perturbación humana: +10 Gt C/año extra y sus consecuencias en el sistema climático.',
  keywords: [
    'ciclo del carbono',
    'reservorios carbono',
    'flujos carbono Gt',
    'carbono océanos',
    'fotosíntesis carbono',
    'emisiones CO2',
    'sumideros carbono',
    'perturbación antropogénica carbono',
  ],
  openGraph: {
    title: 'Ciclo del Carbono: Reservorios y Flujos | meskeIA',
    description:
      'Por qué los océanos absorben el 30% de nuestras emisiones y qué pasa cuando ese sumidero se satura.',
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
  name: "Ciclo del Carbono Completo: Reservorios y Flujos",
  description: "Los 5 grandes reservorios de carbono en la Tierra (atmósfera, océanos, biota terrestre, suelos, litosfera) y todos los flujos en Gt C/año. La perturbación humana: +10 Gt C/año extra y sus consecuencia",
  url: "https://meskeia.com/visualizador-ciclo-carbono-completo/",
  category: 'EducationalApplication',
  features: [],
});
