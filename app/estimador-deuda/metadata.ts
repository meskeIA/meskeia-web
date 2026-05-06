import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador de Deuda - Método Bola de Nieve y Avalancha | meskeIA',
  description: 'Elimina tus deudas más rápido. Compara el método bola de nieve vs avalancha y descubre cuál te ahorra más dinero e intereses.',
  keywords: 'eliminar deudas, bola de nieve, avalancha, pagar deudas, estrategia deuda, salir de deudas, intereses, prestamos, tarjetas credito',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Deuda - Bola de Nieve vs Avalancha - meskeIA',
    description: 'Compara estrategias para eliminar deudas. Descubre cuál método te ahorra más tiempo y dinero.',
    url: 'https://meskeia.com/estimador-deuda',
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
    title: 'Estimador de Deuda - meskeIA',
    description: 'Elimina tus deudas con el método bola de nieve o avalancha. Compara y elige el mejor para ti.',
    images: ['https://meskeia.com/og-image.png']
  },
};
