import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Medicamentos para Perros y Gatos | meskeIA',
  description: 'Calcula la dosis de antiparasitarios y medicamentos comunes para tu mascota según su peso. Incluye frecuencia de desparasitación y recordatorios.',
  keywords: 'dosis medicamento perro, antiparasitario perro, desparasitar gato, pipeta perro, collar antiparasitario, dosis por peso mascota',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de Medicamentos para Perros y Gatos',
    description: 'Calcula dosis de antiparasitarios y medicamentos según el peso de tu mascota',
    url: 'https://meskeia.com/calculadora-medicamentos-mascotas',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de Medicamentos para Mascotas',
    description: 'Dosificación segura de antiparasitarios y medicamentos veterinarios',
  },
};
