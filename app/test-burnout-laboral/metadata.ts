import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Test de Burnout Laboral — Evalúa tu Agotamiento Profesional | meskeIA',
  description: 'Evalúa tu nivel de burnout laboral con 15 preguntas en 3 dimensiones: agotamiento emocional, cinismo y realización personal. Resultados orientativos. Sin registro. 100% privado.',
  keywords: 'test burnout laboral, síndrome burnout, agotamiento profesional, test estrés laboral, evaluación burnout, cinismo laboral, realización personal trabajo, desgaste laboral',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Test de Burnout Laboral | meskeIA',
    description: 'Evalúa tu nivel de burnout laboral con 15 preguntas. Resultados por dimensión: agotamiento emocional, cinismo y realización personal.',
    url: 'https://meskeia.com/test-burnout-laboral/',
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
    title: 'Test de Burnout Laboral | meskeIA',
    description: 'Test orientativo de burnout: 15 preguntas, 3 dimensiones. Totalmente gratuito y privado.',
    images: ['https://meskeia.com/og-image.png']
  },
};
