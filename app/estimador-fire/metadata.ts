import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estimador FIRE - Independencia Financiera | meskeIA',
  description: 'Calcula cuánto necesitas para alcanzar la independencia financiera (FIRE). Usa la regla del 4% y proyecta cuántos años te faltan para retirarte anticipadamente.',
  keywords: 'fire, independencia financiera, retiro anticipado, regla 4%, libertad financiera, jubilacion anticipada, ahorro, inversion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador FIRE - Independencia Financiera | meskeIA',
    description: 'Calcula cuántos años te faltan para alcanzar la independencia financiera',
    url: 'https://meskeia.com/estimador-fire/',
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
    title: 'Estimador FIRE - Independencia Financiera | meskeIA',
    description: 'Calcula cuántos años te faltan para alcanzar la independencia financiera',
    images: ['https://meskeia.com/og-image.png']
  },
};
