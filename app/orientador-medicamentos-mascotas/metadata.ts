import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orientador Medicamentos para Perros y Gatos | meskeIA',
  description: 'Calcula la dosis de antiparasitarios y medicamentos comunes para tu mascota según su peso. Incluye frecuencia de desparasitación y recordatorios.',
  keywords: 'dosis medicamento perro, antiparasitario perro, desparasitar gato, pipeta perro, collar antiparasitario, dosis por peso mascota',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Medicamentos para Perros y Gatos',
    description: 'Calcula dosis de antiparasitarios y medicamentos según el peso de tu mascota',
    url: 'https://meskeia.com/orientador-medicamentos-mascotas/',
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
    title: 'Orientador Medicamentos para Mascotas',
    description: 'Dosificación segura de antiparasitarios y medicamentos veterinarios',
    images: ['https://meskeia.com/og-image.png']
  },
};
