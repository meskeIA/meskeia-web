import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historias Sociales Visuales - Creador para Autismo y TDAH | meskeIA',
  description: 'Crea historias sociales visuales personalizadas para preparar situaciones nuevas o difíciles. Técnica de Carol Gray adaptada para autismo, TDAH y discapacidad cognitiva. Sin registro, 100% local.',
  keywords: 'historias sociales, historias sociales autismo, social stories, Carol Gray, preparacion situaciones nuevas, autismo situaciones, TDAH rutinas, pictogramas historia, secuencia visual, narrativa social',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Historias Sociales Visuales | meskeIA',
    description: 'Crea historias sociales visuales para preparar situaciones nuevas. Para autismo, TDAH y discapacidad cognitiva.',
    url: 'https://meskeia.com/historias-sociales/',
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
    title: 'Historias Sociales Visuales | meskeIA',
    description: 'Crea historias sociales visuales para preparar situaciones nuevas. Para autismo, TDAH y discapacidad cognitiva.',
    images: ['https://meskeia.com/og-image.png']
  },
};
