import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Edad de Mascotas - Perros y Gatos en Años Humanos | meskeIA',
  description: 'Calcula la edad de tu perro o gato en años humanos según su tamaño y raza. Fórmula científica actualizada, más precisa que la regla de los 7 años. Gratis.',
  keywords: 'calculadora edad perro, edad gato años humanos, años perro, conversión edad mascota, cuántos años tiene mi perro',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Edad de Mascotas - meskeIA',
    description: 'Calcula la edad de tu perro o gato en años humanos',
    url: 'https://meskeia.com/calculadora-edad-mascotas/',
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
    title: 'Calculadora de Edad de Mascotas - meskeIA',
    description: 'Calcula la edad de tu perro o gato en años humanos',
    images: ['https://meskeia.com/og-image.png']
  },
};
