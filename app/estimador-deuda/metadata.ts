import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador de Deuda - Método Bola de Nieve y Avalancha | meskeIA',
  description: 'Estrategia para salir de deudas: compara bola de nieve vs avalancha. Calcula cuánto ahorras en intereses y en cuánto tiempo liquidas todo. Planificador gratuito.',
  keywords: 'eliminar deudas, bola de nieve, avalancha, pagar deudas, estrategia deuda, salir de deudas, intereses, prestamos, tarjetas credito',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Deuda - Bola de Nieve vs Avalancha - meskeIA',
    description: 'Compara estrategias para eliminar deudas. Descubre cuál método te ahorra más tiempo y dinero.',
    url: 'https://meskeia.com/estimador-deuda/',
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

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Deuda",
  description: "Estrategia para salir de deudas: compara bola de nieve vs avalancha. Calcula cuánto ahorras en intereses y en cuánto tiempo liquidas todo. Planificador gratuito.",
  url: "https://meskeia.com/estimador-deuda/",
  category: 'FinanceApplication',
  features: [],
});
