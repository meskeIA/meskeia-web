import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visualizador del Metabolismo del Alcohol — Acetaldehído y salud | meskeIA',
  description: 'Descubre cómo el cuerpo procesa el alcohol: ADH, acetaldehído, ALDH2 y sus efectos en hígado, boca, estómago y cerebro. Información fisiológica educativa.',
  keywords: ['metabolismo alcohol', 'acetaldehído', 'ADH', 'ALDH2', 'hígado', 'cáncer', 'fisiología', 'alcohol deshidrogenasa'],
  openGraph: {
    title: 'Visualizador del Metabolismo del Alcohol — Acetaldehído',
    description: 'Cómo el cuerpo metaboliza el alcohol y por qué el acetaldehído es el protagonista perjudicial: hígado, boca, cerebro y estómago.',
    type: 'website',
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
  '@type': 'EducationalContent',
  name: 'Visualizador del Metabolismo del Alcohol',
  description: 'Explicación fisiológica del metabolismo del etanol y los efectos del acetaldehído en múltiples órganos.',
  educationalLevel: 'general',
  inLanguage: 'es',
  publisher: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
};
