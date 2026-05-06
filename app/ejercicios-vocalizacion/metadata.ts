import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Ejercicios de Vocalización para Parkinson - Logopedia en Casa | meskeIA',
  description: 'Ejercicios guiados de vocalización para personas con enfermedad de Parkinson. Práctica de vocales sostenidas, frases y volumen de voz con medidor visual en tiempo real. Sin datos enviados a servidores.',
  keywords: 'ejercicios vocalizacion parkinson, logopedia parkinson, voz parkinson, LSVT, hipofonia, rehabilitacion voz, ejercicios habla, vocalizar parkinson, terapia voz, voz debil',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ejercicios de Vocalización para Parkinson | meskeIA',
    description: 'Práctica guiada de vocalización para Parkinson con medidor visual de volumen en tiempo real. Vocales sostenidas, lectura en voz alta y registro de sesiones.',
    url: 'https://meskeia.com/ejercicios-vocalizacion/',
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
    title: 'Ejercicios de Vocalización para Parkinson | meskeIA',
    description: 'Ejercicios de logopedia para Parkinson con medidor de voz en tiempo real. Privacidad total: el audio nunca sale de tu dispositivo.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Ejercicios de Vocalización para Parkinson - Logopedia en Casa",
  description: "Ejercicios guiados de vocalización para personas con enfermedad de Parkinson. Práctica de vocales sostenidas, frases y volumen de voz con medidor visual en tiempo real. Sin datos enviados a servidores.",
  url: 'https://meskeia.com/ejercicios-vocalizacion/',
  category: 'EducationalApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});
