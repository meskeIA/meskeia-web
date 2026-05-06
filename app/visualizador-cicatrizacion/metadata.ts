import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador de la Cicatrización | Las 4 Fases de Reparación de Heridas | meskeIA',
  description: 'Explora las 4 fases de cicatrización: hemostasia (coágulo), inflamación (neutrófilos/macrófagos), proliferación (colágeno/angiogénesis) y remodelado (hasta 2 años). Tipos de heridas y factores.',
  keywords: ['cicatrizacion', 'hemostasia', 'inflamacion', 'proliferacion', 'remodelado', 'herida', 'colageno', 'fibroblastos', 'queloides'],
  openGraph: {
    title: 'Visualizador de la Cicatrización | meskeIA',
    description: 'Las 4 fases de reparación de heridas: hemostasia, inflamación, proliferación y remodelado. Células, mediadores y factores explicados visualmente.',
    url: 'https://meskeia.com/visualizador-cicatrizacion/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Visualizador de la Cicatrización',
  description: 'Las 4 fases de reparación de heridas: hemostasia, inflamación, proliferación y remodelado.',
  url: 'https://meskeia.com/visualizador-cicatrizacion/',
  applicationCategory: 'EducationalApplication',
  inLanguage: 'es',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
};
